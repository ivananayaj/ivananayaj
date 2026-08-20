#!/usr/bin/env python3
import json
from collections import defaultdict
from pathlib import Path

cat = json.loads((Path(__file__).resolve().parents[1] / "data/catalog.json").read_text())
issues = {i["id"]: i for i in cat["issues"]}
errors = []

ids = list(issues)
if len(ids) != len(set(ids)):
    errors.append("duplicate issue ids")

for c in cat["collections"]:
    if len(c["issueIds"]) != len(set(c["issueIds"])):
        errors.append(f"{c['id']} has duplicate issueIds")
    missing = [i for i in c["issueIds"] if i not in issues]
    if missing:
        errors.append(f"{c['id']} missing {missing[:5]}")
    if c["type"] == "gap" and c.get("msrp"):
        errors.append(f"{c['id']} gap should not have msrp")

# D1: gap must not include issues that are also in a real Big Time book
bt = next(c for c in cat["collections"] if c["id"] == "big-time-omni")
island = next(c for c in cat["collections"] if c["id"] == "spider-island-omni")
gap = next(c for c in cat["collections"] if c["id"] == "big-time-gap")
overlap = set(gap["issueIds"]) & (set(bt["issueIds"]) | set(island["issueIds"]))
if overlap:
    errors.append(f"D1 gap overlaps real books: {len(overlap)}")

# D2: Dying Wish issues must live in superior-omni-1 only as the Dying Wish book
sup = next(c for c in cat["collections"] if c["id"] == "superior-omni-1")
for n in (698, 699, 700):
    iid = f"amazing-spider-man-{n}"
    if iid not in sup["issueIds"]:
        errors.append(f"D2 {iid} not in superior-omni-1")

ownable_hits = defaultdict(list)
for c in cat["collections"]:
    if c["type"] == "gap":
        continue
    for iid in c["issueIds"]:
        ownable_hits[iid].append(c["id"])

print(f"issues={len(issues)} collections={len(cat['collections'])}")
print(f"issues in >1 ownable collection: {sum(1 for v in ownable_hits.values() if len(v)>1)}")
if errors:
    print("FAIL")
    for e in errors:
        print(" -", e)
    raise SystemExit(1)
print("OK")
