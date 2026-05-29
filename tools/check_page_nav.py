#!/usr/bin/env python3
from __future__ import annotations

from html.parser import HTMLParser
from pathlib import Path
import re
import sys


ROOT = Path(__file__).resolve().parents[1]
EXPECTED_PAGE_NAV_VERSION = "page-nav-20260529-floating-actions"
MOBILE_CONTRACTS = (
    (".topbar .nav", ("width:", "margin:", "flex-direction: column", "padding:")),
    (".topbar .brand", ("display: none",)),
    (".topbar .links", ("flex-direction: row", "overflow-x: auto", "width: 100%")),
    (".topbar .links a", ("border-radius: 999px", "white-space: nowrap")),
    ("section[id]", ("scroll-margin-top:", "--page-nav-sticky-offset")),
)


class NavParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.stack: list[tuple[str, set[str]]] = []
        self.topbar_nav_count = 0
        self.nav_count = 0
        self.page_nav_hrefs: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attr = dict(attrs)
        classes = set((attr.get("class") or "").split())
        href = attr.get("href") or ""

        if tag == "link" and "assets/page-nav.css" in href:
            self.page_nav_hrefs.append(href)

        if tag == "nav" and "nav" in classes:
            self.nav_count += 1
            if any(parent == "aside" and "topbar" in parent_classes for parent, parent_classes in self.stack):
                self.topbar_nav_count += 1

        self.stack.append((tag, classes))

    def handle_endtag(self, tag: str) -> None:
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index][0] == tag:
                del self.stack[index:]
                return


def detail_pages() -> list[Path]:
    return sorted(
        path
        for path in ROOT.glob("*/index.html")
        if path.parent.name not in {"analytics"} and '<nav class="nav"' in path.read_text(encoding="utf-8")
    )


def block_for_selector(css: str, selector: str) -> str:
    match = re.search(rf"{re.escape(selector)}\s*\{{(?P<body>.*?)\}}", css, flags=re.S)
    return match.group("body") if match else ""


def check_shared_css(errors: list[str]) -> None:
    css = (ROOT / "assets/page-nav.css").read_text(encoding="utf-8")
    mobile_match = re.search(r"@media\s*\(max-width:\s*900px\)\s*\{(?P<body>.*)\n\}", css, flags=re.S)
    if not mobile_match:
        errors.append("assets/page-nav.css is missing the mobile @media block.")
        return

    mobile_css = mobile_match.group("body")
    for selector, expected_fragments in MOBILE_CONTRACTS:
        block = block_for_selector(mobile_css, selector)
        if not block:
            errors.append(f"assets/page-nav.css mobile block is missing {selector}.")
            continue
        for fragment in expected_fragments:
            if fragment not in block:
                errors.append(f"assets/page-nav.css mobile {selector} is missing {fragment!r}.")


def check_page(path: Path, errors: list[str]) -> None:
    text = path.read_text(encoding="utf-8")
    parser = NavParser()
    parser.feed(text)

    rel = path.relative_to(ROOT)
    if parser.nav_count != 1:
        errors.append(f"{rel} should contain exactly one .nav element, found {parser.nav_count}.")
    if parser.topbar_nav_count != 1:
        errors.append(f"{rel} should contain exactly one .topbar .nav element, found {parser.topbar_nav_count}.")
    if len(parser.page_nav_hrefs) != 1:
        errors.append(f"{rel} should load page-nav.css exactly once, found {len(parser.page_nav_hrefs)}.")
    elif EXPECTED_PAGE_NAV_VERSION not in parser.page_nav_hrefs[0]:
        errors.append(f"{rel} should use {EXPECTED_PAGE_NAV_VERSION}: {parser.page_nav_hrefs[0]}")

    inline_mobile_duplicates = (
        r"@media\s*\(max-width:\s*900px\).*?^\s*\.nav\s*\{",
        r"@media\s*\(max-width:\s*900px\).*?^\s*\.brand\s*\{",
        r"@media\s*\(max-width:\s*900px\).*?^\s*\.links\s*\{",
        r"@media\s*\(max-width:\s*900px\).*?^\s*\.links a\s*\{",
    )
    for pattern in inline_mobile_duplicates:
        if re.search(pattern, text, flags=re.S | re.M):
            errors.append(f"{rel} should not define mobile nav layout inline; use assets/page-nav.css.")
            break


def main() -> int:
    errors: list[str] = []
    pages = detail_pages()
    if not pages:
        errors.append("No detail pages with .nav were found.")

    check_shared_css(errors)
    for path in pages:
        check_page(path, errors)

    if errors:
        for error in errors:
            print(f"page-nav check failed: {error}", file=sys.stderr)
        return 1

    print(f"page-nav check passed for {len(pages)} detail pages.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
