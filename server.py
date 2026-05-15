#!/usr/bin/env python3
from __future__ import annotations

import json
import mimetypes
import os
import threading
import urllib.error
import urllib.request
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse


ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT / "data"
FEEDBACK_FILE = DATA_DIR / "feedback.jsonl"
EMAIL_ERROR_FILE = DATA_DIR / "email-errors.jsonl"
MAX_BODY_BYTES = 16 * 1024
FEEDBACK_LOCK = threading.Lock()
PRIVATE_PREFIXES = ("/.git", "/data")
PRIVATE_FILES = {"/server.py", "/runeterra-guide.service"}
ALLOWED_FEEDBACK_TYPES = {"", "功能建议", "bug/报错", "其他"}
EMAIL_GATEWAY_URL = "http://169.254.169.254/gateway/email/send"
FEEDBACK_EMAIL_TO = os.environ.get("FEEDBACK_EMAIL_TO", "chenpiao@jihuanshe.com")


class GuideHandler(SimpleHTTPRequestHandler):
    server_version = "RuneterraGuide/1.0"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header("X-Content-Type-Options", "nosniff")
        super().end_headers()

    def do_GET(self):
        if self.path == "/healthz":
            self.send_json(200, {"ok": True})
            return
        if self.is_private_path():
            self.send_json(404, {"ok": False, "error": "not_found"})
            return
        super().do_GET()

    def do_HEAD(self):
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
            "subject": f"刀妹内战网页反馈：{subject_type}",
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
        "【吐槽内容】",
        record.get("message", ""),
        "",
        "【相关信息】",
        f"提交时间: {record.get('createdAt', '')}",
        f"反馈类型: {record.get('type') or '未分类'}",
        f"联系方式: {record.get('contact') or '未填写'}",
        f"提交页面: {record.get('pageUrl') or '未知'}",
        f"来源 IP: {record.get('remoteAddr') or '未知'}",
        f"浏览器: {record.get('userAgent') or '未知'}",
        f"Referer: {record.get('referer') or '无'}",
    ])


def main():
    mimetypes.add_type("text/html; charset=utf-8", ".html")
    port = int(os.environ.get("PORT", "8000"))
    server = ThreadingHTTPServer(("0.0.0.0", port), GuideHandler)
    print(f"serving {ROOT} on 0.0.0.0:{port}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
