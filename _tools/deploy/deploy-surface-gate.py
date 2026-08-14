#!/usr/bin/env python3
"""Fail the deploy if anything would ship from _app/ that git does not track.

@catalog what    Blocks debris in the hosting surface: deployable files git does not track.
@catalog run     python3 _tools/deploy/deploy-surface-gate.py
@catalog status  GATE

WHY (BUG-096). `_app/` IS the Firebase hosting root, so anything left there ships. Two debug
probes sat publicly fetchable on hexworth.com at HTTP 200 for a day -- `/_chris_house_probe.html`
and `/styles/_chris_r4_offender_tmp.css`. They were retired by a deploy, but the PREVENTION was
logged and never built, and the tracker entry names the reason it was invisible: *"The files were
untracked, so no git surface flagged them either."*

⚠⚠ THE OBVIOUS FIX IS THE MOST DAMAGING CHANGE AVAILABLE. The natural instinct is to add `**/_*`
to firebase.json's hosting ignore, since every one of those probes was underscore-prefixed.
DO NOT. `_app/_lib/` and `_app/_games-lab/` are underscore-prefixed DIRECTORIES holding live
content: `_lib/HexAI.js` returns HTTP 200 on production and is referenced by 2,473 pages. That
pattern would delist the entire HexAI feature platform-wide to prevent a debug file. Verified
before writing this, which is the only reason it is written this way.

SO THIS KEYS ON THE PROPERTY THAT ACTUALLY SEPARATES THEM, not on naming:
    a probe is UNTRACKED; real content is TRACKED.
`_lib` has 5 tracked files and `_games-lab` 123, so this gate cannot touch them however they are
named. And it catches debris no naming rule would have predicted, which is the failure mode an
ignore list always has: it only covers the names someone already thought of.

It considers a file only if Firebase would actually SHIP it -- the hosting ignore list is applied
first -- so a `.bak` that hosting already excludes is not reported as a problem it is not.
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parent.parent.parent

# --root makes this gate testable WITHOUT touching the live deploy surface. Mutating _app/ to
# prove a deploy gate works is the one place you least want a mistake, and `rm` is denied here
# by the never-destroy rule anyway, so a fixture tree is both safer and the only workable route.


def hosting_config() -> dict:
    cfg = json.loads((ROOT / "firebase.json").read_text())
    h = cfg.get("hosting")
    return h[0] if isinstance(h, list) else h


def glob_to_regex(pat: str) -> re.Pattern:
    """Convert a Firebase hosting ignore glob to a regex over the _app-relative path.

    Handles the forms actually present in this repo: `**/x`, `**/*.ext`, `dir/**`, `a/b/*.ext`,
    and literals. `**` crosses directory separators; a single `*` does not.
    """
    out, i = [], 0
    while i < len(pat):
        if pat.startswith("**/", i):
            out.append("(?:.*/)?")   # zero or more leading directories
            i += 3
        elif pat.startswith("**", i):
            out.append(".*")
            i += 2
        elif pat[i] == "*":
            out.append("[^/]*")
            i += 1
        elif pat[i] == "?":
            out.append("[^/]")
            i += 1
        else:
            out.append(re.escape(pat[i]))
            i += 1
    return re.compile("^" + "".join(out) + "$")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("--root", default=str(REPO),
                    help="repo root to check; defaults to the real one. Used by the self-test.")
    args = ap.parse_args()
    global ROOT, APP
    ROOT = Path(args.root).resolve()
    APP = ROOT / "_app"
    if not APP.is_dir():
        print(f"error: {APP} does not exist", file=sys.stderr)
        return 2

    h = hosting_config()
    if h.get("public") != "_app":
        # If the hosting root ever moves, this gate is measuring the wrong tree and must say so
        # rather than pass quietly.
        print(f"GATE ERROR: hosting public root is {h.get('public')!r}, expected '_app'")
        return 2
    ignores = [glob_to_regex(p) for p in h.get("ignore", [])]

    tracked = set(subprocess.run(
        ["git", "ls-files", "_app"], cwd=ROOT, capture_output=True, text=True, check=True
    ).stdout.splitlines())

    allow_path = Path(__file__).resolve().parent / "deploy-surface-allowlist.txt"
    allowed = set()
    if allow_path.exists():
        for line in allow_path.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#"):
                allowed.add(line)

    shipped_untracked = []
    still_allowed = []
    for f in APP.rglob("*"):
        if not f.is_file():
            continue
        rel_app = str(f.relative_to(APP))          # what the ignore globs are written against
        rel_repo = str(f.relative_to(ROOT))        # what git tracks
        if any(rx.match(rel_app) for rx in ignores):
            continue                                # Firebase would not ship it
        if rel_repo in tracked:
            continue                                # deliberate, reviewable content
        if rel_app in allowed:
            still_allowed.append(rel_app)           # signed off, but see the fresh-clone warning
            continue
        shipped_untracked.append(rel_repo)

    if shipped_untracked:
        print(f"DEPLOY SURFACE GATE: FAIL — {len(shipped_untracked)} file(s) would ship "
              f"that git does not track:\n")
        for p in sorted(shipped_untracked):
            print(f"  {p}")
        print("\nEach of these would be publicly fetchable on hexworth.com after deploy.")
        print("Archive it (never delete: cp to _tools/archive/<name>/, verify with cmp), or")
        print("`git add` it if it is genuinely meant to ship.")
        return 1

    print("DEPLOY SURFACE GATE: PASS — every deployable file in _app/ is tracked or allowlisted.")
    if still_allowed:
        # Reported on every run, pass or fail. An allowlist nobody re-reads becomes a place
        # where problems go to be forgotten.
        print(f"\n  ⚠ {len(still_allowed)} allowlisted untracked file(s) still ship. Each exists on "
              f"ONE DISK and would be REMOVED from production by a deploy from a fresh clone:")
        for p in sorted(still_allowed):
            print(f"    {p}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
