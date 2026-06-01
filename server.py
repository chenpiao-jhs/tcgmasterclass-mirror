#!/usr/bin/env python3
from __future__ import annotations

import json
import hashlib
import mimetypes
import os
import re
import secrets
import threading
import urllib.error
import urllib.request
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from http import cookies
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse


ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
FEEDBACK_FILE = DATA_DIR / "feedback.jsonl"
EMAIL_ERROR_FILE = DATA_DIR / "email-errors.jsonl"
VISITS_FILE = DATA_DIR / "visits.jsonl"
ANALYTICS_SECRET_FILE = DATA_DIR / "analytics-secret"
MAX_BODY_BYTES = 16 * 1024
FEEDBACK_LOCK = threading.Lock()
VISIT_LOCK = threading.Lock()
PRIVATE_PREFIXES = ("/.git", "/data")
PRIVATE_FILES = {"/AGENTS.md", "/analytics.py", "/server.py", "/runeterra-guide.service"}
ALLOWED_FEEDBACK_TYPES = {"", "功能建议", "bug/报错", "其他"}
EMAIL_GATEWAY_URL = "http://169.254.169.254/gateway/email/send"
FEEDBACK_EMAIL_TO = os.environ.get("FEEDBACK_EMAIL_TO", "chenpiao@jihuanshe.com")
VISITOR_COOKIE_NAME = "rg_visitor_id"
VISITOR_COOKIE_MAX_AGE = 60 * 60 * 24 * 395
ANALYTICS_TIMEZONE = timezone(timedelta(hours=8))
ANALYTICS_DASHBOARD_PREFIX = "/analytics"
PAGE_TITLES = {
    "/": "首页",
    "/ezreal-diana-swiss/": "伊泽瑞尔 VS 皎月女神",
    "/irelia-mirror-final/": "刀锋舞者内战决赛",
    "/leblanc-fiora-swiss/": "诡术妖姬 VS 无双剑姬",
    "/reksai-lillia-swiss/": "虚空遁地兽 VS 含羞蓓蕾",
    "/sivir-garen-swiss/": "战争女神 VS 德玛西亚之力",
    "/sivir-irelia-quarterfinal/": "战争女神 VS 刀锋舞者",
    "/irelia-sivir-sydney-final/": "刀妹 VS 希维尔极光",
    "/irelia-diana-xian-semifinal/": "刀锋舞者 VS 皎月女神",
    "/yi-aurora-semifinal/": "无极剑圣 VS 欧若拉",
    "/yi-irelia-final/": "无极剑圣 VS 刀锋舞者",
    "/azir-diana-xian-final/": "沙漠皇帝 VS 皎月女神",
    "/azir-vex-xian-quarterfinal/": "沙漠皇帝 VS 愁云使者",
    "/leblanc-khazix-xian-swiss/": "妖姬 VS 卡兹克",
    "/vi-diana-xian-swiss/": "皮城执法官 VS 皎月女神",
    "/draven-rengar-xian-swiss/": "荣耀行刑官 VS 傲之追猎者",
    "/vex-lux-xian-swiss/": "愁云使者 VS 光辉女郎",
}
VISITOR_ID_PATTERN = re.compile(r"^[A-Za-z0-9_-]{24,96}$")
BOT_USER_AGENT_KEYWORDS = (
    "bot",
    "crawler",
    "spider",
    "curl",
    "wget",
    "python-requests",
    "uptime",
    "monitor",
    "headless",
    "httpclient",
)
_ANALYTICS_SECRET = None


class GuideHandler(SimpleHTTPRequestHandler):
    server_version = "RuneterraGuide/1.0"

    def __init__(self, *args, **kwargs):
        self.visitor_cookie_to_set = None
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        if self.visitor_cookie_to_set:
            self.send_header(
                "Set-Cookie",
                (
                    f"{VISITOR_COOKIE_NAME}={self.visitor_cookie_to_set}; "
                    f"Max-Age={VISITOR_COOKIE_MAX_AGE}; Path=/; "
                    "SameSite=Lax; HttpOnly"
                ),
            )
        if self.is_no_store_path():
            self.send_header("Cache-Control", "no-store, max-age=0")
            self.send_header("Pragma", "no-cache")
            self.send_header("Expires", "0")
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/healthz":
            self.send_json(200, {"ok": True})
            return
        if parsed.path == "/api/analytics":
            self.send_json(200, build_analytics_summary(parsed.query))
            return
        if self.is_private_path():
            self.send_json(404, {"ok": False, "error": "not_found"})
            return
        self.record_page_view_if_needed(parsed.path)
        super().do_GET()

    def do_HEAD(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/analytics":
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Content-Length", "0")
            self.end_headers()
            return
        if self.is_private_path():
            self.send_response(404)
            self.end_headers()
            return
        super().do_HEAD()

    def do_POST(self):
        parsed = urlparse(self.path)
        if parsed.path != "/api/feedback":
            self.send_json(404, {"ok": False, "error": "not_found"})
            return

        content_length = self.headers.get("Content-Length")
        if not content_length:
            self.send_json(400, {"ok": False, "error": "empty_body"})
            return

        try:
            length = int(content_length)
        except ValueError:
            self.send_json(400, {"ok": False, "error": "bad_length"})
            return

        if length > MAX_BODY_BYTES:
            self.send_json(413, {"ok": False, "error": "too_large"})
            return

        try:
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
        except (UnicodeDecodeError, json.JSONDecodeError):
            self.send_json(400, {"ok": False, "error": "bad_json"})
            return

        message = str(payload.get("message", "")).strip()
        contact = str(payload.get("contact", "")).strip()
        feedback_type = str(payload.get("type", "")).strip()
        page_url = str(payload.get("pageUrl", "")).strip()

        if feedback_type not in ALLOWED_FEEDBACK_TYPES:
            self.send_json(400, {"ok": False, "error": "bad_type"})
            return

        if len(message) < 2:
            self.send_json(400, {"ok": False, "error": "message_required"})
            return

        if len(message) > 4000:
            self.send_json(400, {"ok": False, "error": "message_too_long"})
            return

        if len(contact) > 200:
            self.send_json(400, {"ok": False, "error": "contact_too_long"})
            return

        record = {
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "type": feedback_type,
            "message": message,
            "contact": contact,
            "pageUrl": page_url[:500],
            "userAgent": self.headers.get("User-Agent", "")[:500],
            "referer": self.headers.get("Referer", "")[:500],
            "remoteAddr": self.client_address[0],
        }

        DATA_DIR.mkdir(exist_ok=True)
        with FEEDBACK_LOCK:
            with FEEDBACK_FILE.open("a", encoding="utf-8") as f:
                f.write(json.dumps(record, ensure_ascii=False) + "\n")

        self.send_feedback_email(record)
        self.send_json(200, {"ok": True})

    def is_private_path(self) -> bool:
        path = urlparse(self.path).path
        return path in PRIVATE_FILES or any(
            path == prefix or path.startswith(f"{prefix}/")
            for prefix in PRIVATE_PREFIXES
        )

    def is_no_store_path(self) -> bool:
        path = urlparse(self.path).path
        return (
            path == "/api/analytics"
            or path == ANALYTICS_DASHBOARD_PREFIX
            or path.startswith(f"{ANALYTICS_DASHBOARD_PREFIX}/")
            or path in {
                "/assets/analytics-dashboard.css",
                "/assets/analytics-dashboard.js",
            }
        )

    def record_page_view_if_needed(self, request_path: str):
        if request_path == ANALYTICS_DASHBOARD_PREFIX or request_path.startswith(f"{ANALYTICS_DASHBOARD_PREFIX}/"):
            return

        page_path = self.canonical_page_path(request_path)
        if not page_path:
            return

        visitor_id, is_new_visitor = self.get_or_create_visitor_id()
        if is_new_visitor:
            self.visitor_cookie_to_set = visitor_id

        user_agent = self.headers.get("User-Agent", "")[:500]
        record = {
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "pagePath": page_path,
            "visitorId": visitor_id,
            "isNewVisitor": is_new_visitor,
            "ipHash": hash_ip(self.get_client_ip()),
            "userAgent": user_agent,
            "isBot": is_probable_bot(user_agent),
            "referer": self.headers.get("Referer", "")[:500],
        }
        DATA_DIR.mkdir(exist_ok=True)
        with VISIT_LOCK:
            with VISITS_FILE.open("a", encoding="utf-8") as f:
                f.write(json.dumps(record, ensure_ascii=False) + "\n")

    def canonical_page_path(self, request_path: str) -> str | None:
        local_path = Path(self.translate_path(request_path)).resolve()
        try:
            relative_path = local_path.relative_to(ROOT)
        except ValueError:
            return None

        if local_path.is_file() and local_path.suffix == ".html":
            page_path = "/" + relative_path.as_posix()
            return "/" if page_path == "/index.html" else page_path

        if request_path.endswith("/") and local_path.is_dir():
            index_path = local_path / "index.html"
            if index_path.is_file():
                if relative_path.as_posix() == ".":
                    return "/"
                return "/" + relative_path.as_posix().rstrip("/") + "/"

        return None

    def get_or_create_visitor_id(self) -> tuple[str, bool]:
        visitor_id = ""
        raw_cookie = self.headers.get("Cookie", "")
        if raw_cookie:
            parsed_cookie = cookies.SimpleCookie()
            try:
                parsed_cookie.load(raw_cookie)
            except cookies.CookieError:
                parsed_cookie = cookies.SimpleCookie()
            morsel = parsed_cookie.get(VISITOR_COOKIE_NAME)
            if morsel and VISITOR_ID_PATTERN.match(morsel.value):
                visitor_id = morsel.value

        if visitor_id:
            return visitor_id, False

        return secrets.token_urlsafe(32), True

    def get_client_ip(self) -> str:
        forwarded_for = self.headers.get("X-Forwarded-For", "")
        if forwarded_for:
            return forwarded_for.split(",", 1)[0].strip()
        real_ip = self.headers.get("X-Real-IP", "")
        if real_ip:
            return real_ip.strip()
        return self.client_address[0]

    def send_json(self, status: int, body: dict):
        encoded = json.dumps(body, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def send_feedback_email(self, record: dict):
        subject_type = record["type"] or "未分类"
        payload = {
            "to": FEEDBACK_EMAIL_TO,
            "subject": f"符文比赛精华：{subject_type}",
            "body": format_feedback_email(record),
        }
        request = urllib.request.Request(
            EMAIL_GATEWAY_URL,
            data=json.dumps(payload, ensure_ascii=False).encode("utf-8"),
            headers={"Content-Type": "application/json"},
            method="POST",
        )

        try:
            with urllib.request.urlopen(request, timeout=5) as response:
                body = response.read().decode("utf-8", errors="replace")
                if response.status >= 400:
                    raise RuntimeError(f"email gateway status {response.status}: {body}")
                result = json.loads(body)
                if not result.get("success"):
                    raise RuntimeError(f"email gateway error: {body}")
        except (OSError, urllib.error.URLError, json.JSONDecodeError, RuntimeError) as error:
            self.log_email_error(record, str(error))

    def log_email_error(self, record: dict, error: str):
        DATA_DIR.mkdir(exist_ok=True)
        error_record = {
            "createdAt": datetime.now(timezone.utc).isoformat(),
            "feedbackCreatedAt": record.get("createdAt"),
            "error": error,
        }
        with FEEDBACK_LOCK:
            with EMAIL_ERROR_FILE.open("a", encoding="utf-8") as f:
                f.write(json.dumps(error_record, ensure_ascii=False) + "\n")


def format_feedback_email(record: dict) -> str:
    return "\n".join([
        "收到一条新的网页反馈。",
        "",
        "【反馈类型】",
        record.get("type") or "未分类",
        "",
        "【吐槽内容】",
        record.get("message", ""),
        "",
        "【联系方式】",
        record.get("contact") or "未填写",
        "",
        "【相关信息】",
        f"提交时间: {record.get('createdAt', '')}",
        f"提交页面: {record.get('pageUrl') or '未知'}",
        f"来源 IP: {record.get('remoteAddr') or '未知'}",
        f"浏览器: {record.get('userAgent') or '未知'}",
        f"Referer: {record.get('referer') or '无'}",
    ])


def build_analytics_summary(query: str) -> dict:
    params = parse_qs(query)
    days = clamp_int(params.get("days", ["14"])[0], default=14, minimum=1, maximum=90)
    include_bots = params.get("includeBots", ["0"])[0] in {"1", "true", "yes"}
    now = datetime.now(ANALYTICS_TIMEZONE)
    start_day = (now - timedelta(days=days - 1)).date()
    start_at = datetime.combine(start_day, datetime.min.time(), tzinfo=ANALYTICS_TIMEZONE)
    records = [
        record
        for record in load_visit_records(start_at)
        if include_bots or not record.get("isBot")
    ]

    daily = {
        (start_day + timedelta(days=index)).isoformat(): {
            "date": (start_day + timedelta(days=index)).isoformat(),
            "pageViews": 0,
            "uniqueVisitors": 0,
            "uniqueIpHashes": 0,
            "_visitors": set(),
            "_ipHashes": set(),
            "_pages": defaultdict(lambda: {
                "pagePath": "",
                "title": "",
                "pageViews": 0,
                "uniqueVisitors": 0,
                "uniqueIpHashes": 0,
                "_visitors": set(),
                "_ipHashes": set(),
            }),
        }
        for index in range(days)
    }
    pages: dict[str, dict] = defaultdict(lambda: {
        "pagePath": "",
        "title": "",
        "pageViews": 0,
        "uniqueVisitors": 0,
        "uniqueIpHashes": 0,
        "_visitors": set(),
        "_ipHashes": set(),
    })
    visitors = set()
    ip_hashes = set()
    latest_at = None

    for record in records:
        created_at = parse_visit_datetime(record)
        if not created_at:
            continue
        local_created_at = created_at.astimezone(ANALYTICS_TIMEZONE)
        date_key = local_created_at.date().isoformat()
        visitor_id = record.get("visitorId")
        ip_hash = record.get("ipHash")
        page_path = record.get("pagePath") or "unknown"

        if date_key in daily:
            daily_record = daily[date_key]
            daily_record["pageViews"] += 1
            if visitor_id:
                daily_record["_visitors"].add(visitor_id)
            if ip_hash:
                daily_record["_ipHashes"].add(ip_hash)
            daily_page_record = daily_record["_pages"][page_path]
            daily_page_record["pagePath"] = page_path
            daily_page_record["title"] = PAGE_TITLES.get(page_path, page_path)
            daily_page_record["pageViews"] += 1
            if visitor_id:
                daily_page_record["_visitors"].add(visitor_id)
            if ip_hash:
                daily_page_record["_ipHashes"].add(ip_hash)

        page_record = pages[page_path]
        page_record["pagePath"] = page_path
        page_record["title"] = PAGE_TITLES.get(page_path, page_path)
        page_record["pageViews"] += 1
        if visitor_id:
            page_record["_visitors"].add(visitor_id)
        if ip_hash:
            page_record["_ipHashes"].add(ip_hash)

        if visitor_id:
            visitors.add(visitor_id)
        if ip_hash:
            ip_hashes.add(ip_hash)
        if latest_at is None or local_created_at > latest_at:
            latest_at = local_created_at

    daily_rows = []
    for daily_record in daily.values():
        daily_page_rows = []
        for daily_page_record in daily_record["_pages"].values():
            daily_page_rows.append({
                "pagePath": daily_page_record["pagePath"],
                "title": daily_page_record["title"],
                "pageViews": daily_page_record["pageViews"],
                "uniqueVisitors": len(daily_page_record["_visitors"]),
                "uniqueIpHashes": len(daily_page_record["_ipHashes"]),
            })
        daily_page_rows.sort(key=lambda item: (-item["pageViews"], item["pagePath"]))
        daily_rows.append({
            "date": daily_record["date"],
            "pageViews": daily_record["pageViews"],
            "uniqueVisitors": len(daily_record["_visitors"]),
            "uniqueIpHashes": len(daily_record["_ipHashes"]),
            "pages": daily_page_rows,
        })

    page_rows = []
    for page_record in pages.values():
        page_rows.append({
            "pagePath": page_record["pagePath"],
            "title": page_record["title"],
            "pageViews": page_record["pageViews"],
            "uniqueVisitors": len(page_record["_visitors"]),
            "uniqueIpHashes": len(page_record["_ipHashes"]),
        })
    page_rows.sort(key=lambda item: (-item["pageViews"], item["pagePath"]))

    return {
        "ok": True,
        "generatedAt": now.isoformat(),
        "latestVisitAt": latest_at.isoformat() if latest_at else None,
        "timezone": "Asia/Shanghai",
        "days": days,
        "includeBots": include_bots,
        "summary": {
            "pageViews": len(records),
            "uniqueVisitors": len(visitors),
            "uniqueIpHashes": len(ip_hashes),
        },
        "daily": daily_rows,
        "pages": page_rows,
    }


def clamp_int(raw_value: str, default: int, minimum: int, maximum: int) -> int:
    try:
        value = int(raw_value)
    except (TypeError, ValueError):
        return default
    return max(minimum, min(maximum, value))


def load_visit_records(start_at: datetime) -> list[dict]:
    if not VISITS_FILE.exists():
        return []

    records = []
    with VISIT_LOCK:
        with VISITS_FILE.open(encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    record = json.loads(line)
                except json.JSONDecodeError:
                    continue
                created_at = parse_visit_datetime(record)
                if created_at and created_at.astimezone(ANALYTICS_TIMEZONE) >= start_at:
                    records.append(record)
    return records


def parse_visit_datetime(record: dict) -> datetime | None:
    raw_value = record.get("createdAt")
    if not raw_value:
        return None
    try:
        return datetime.fromisoformat(raw_value)
    except ValueError:
        return None


def hash_ip(ip_address: str) -> str:
    if not ip_address:
        return ""
    secret = get_analytics_secret()
    return hashlib.sha256(f"{secret}:{ip_address}".encode("utf-8")).hexdigest()[:24]


def get_analytics_secret() -> str:
    global _ANALYTICS_SECRET
    if _ANALYTICS_SECRET:
        return _ANALYTICS_SECRET

    DATA_DIR.mkdir(exist_ok=True)
    if ANALYTICS_SECRET_FILE.exists():
        _ANALYTICS_SECRET = ANALYTICS_SECRET_FILE.read_text(encoding="utf-8").strip()
    else:
        _ANALYTICS_SECRET = secrets.token_urlsafe(32)
        ANALYTICS_SECRET_FILE.write_text(_ANALYTICS_SECRET + "\n", encoding="utf-8")
        try:
            ANALYTICS_SECRET_FILE.chmod(0o600)
        except OSError:
            pass

    return _ANALYTICS_SECRET


def is_probable_bot(user_agent: str) -> bool:
    normalized = user_agent.lower()
    return any(keyword in normalized for keyword in BOT_USER_AGENT_KEYWORDS)


def main():
    mimetypes.add_type("text/html; charset=utf-8", ".html")
    port = int(os.environ.get("PORT", "8000"))
    server = ThreadingHTTPServer(("0.0.0.0", port), GuideHandler)
    print(f"serving {ROOT} on 0.0.0.0:{port}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
