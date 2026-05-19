#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path


ROOT = Path(__file__).resolve().parent
VISITS_FILE = ROOT / "data" / "visits.jsonl"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Summarize site visits.")
    parser.add_argument(
        "--days",
        type=int,
        default=7,
        help="Number of recent days to include. Use 0 for all data.",
    )
    parser.add_argument(
        "--include-bots",
        action="store_true",
        help="Include likely bots, health checks, and command-line clients.",
    )
    return parser.parse_args()


def load_records(include_bots: bool) -> list[dict]:
    if not VISITS_FILE.exists():
        return []

    records = []
    with VISITS_FILE.open(encoding="utf-8") as f:
        for line_number, line in enumerate(f, start=1):
            line = line.strip()
            if not line:
                continue
            try:
                record = json.loads(line)
            except json.JSONDecodeError:
                print(f"Skipping invalid analytics line {line_number}.")
                continue
            if record.get("isBot") and not include_bots:
                continue
            records.append(record)
    return records


def parse_created_at(record: dict) -> datetime | None:
    raw_value = record.get("createdAt")
    if not raw_value:
        return None
    try:
        return datetime.fromisoformat(raw_value)
    except ValueError:
        return None


def filter_records(records: list[dict], days: int) -> list[dict]:
    if days <= 0:
        return records
    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    filtered = []
    for record in records:
        created_at = parse_created_at(record)
        if created_at and created_at >= cutoff:
            filtered.append(record)
    return filtered


def unique_count(records: list[dict], key: str) -> int:
    values = {record.get(key) for record in records if record.get(key)}
    return len(values)


def print_summary(records: list[dict], days: int):
    period_label = "all time" if days <= 0 else f"last {days} days"
    print(f"Analytics summary ({period_label})")
    print("=" * 34)
    print(f"Page views:        {len(records)}")
    print(f"Unique visitors:   {unique_count(records, 'visitorId')}")
    print(f"Unique IP hashes:  {unique_count(records, 'ipHash')}")

    new_visitors = sum(1 for record in records if record.get("isNewVisitor"))
    print(f"New visitor IDs:   {new_visitors}")

    page_counts = Counter(record.get("pagePath") or "unknown" for record in records)
    if page_counts:
        print()
        print("Top pages")
        for page_path, count in page_counts.most_common(10):
            print(f"{count:>6}  {page_path}")

    day_counts = Counter()
    day_visitors: dict[str, set[str]] = {}
    for record in records:
        created_at = parse_created_at(record)
        if not created_at:
            continue
        day = created_at.astimezone(timezone.utc).date().isoformat()
        day_counts[day] += 1
        if record.get("visitorId"):
            day_visitors.setdefault(day, set()).add(record["visitorId"])

    if day_counts:
        print()
        print("Daily views and visitors")
        for day in sorted(day_counts):
            print(f"{day}  views={day_counts[day]:>5}  visitors={len(day_visitors.get(day, set())):>5}")


def main():
    args = parse_args()
    records = filter_records(load_records(args.include_bots), args.days)
    print_summary(records, args.days)


if __name__ == "__main__":
    main()
