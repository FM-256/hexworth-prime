#!/usr/bin/env python3
"""Mutation tests for the deploy-surface gate.

@catalog what    Proves the deploy-surface gate catches debris and does not flag real content.
@catalog run     python3 _tools/deploy/test-deploy-surface-gate.py
@catalog status  GATE

It builds a throwaway repo fixture and runs the real gate against it with --root, so proving a
DEPLOY gate works never requires mutating the live deploy surface. That matters twice over here:
_app/ is the hosting root, and `rm` is denied under the never-destroy rule, so a mutation left
behind could not be cleaned up.

The case that matters most is case 4: the gate must NOT flag `_lib`-style underscore directories.
The obvious fix for BUG-096 was `**/_*` in the hosting ignore, which would have delisted
`_lib/HexAI.js` — live, HTTP 200, referenced by 2,473 pages.
"""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

GATE = Path(__file__).resolve().parent / "deploy-surface-gate.py"
PASSED = 0
FAILED = 0


def check(label: str, cond: bool, detail: str = "") -> None:
    global PASSED, FAILED
    if cond:
        PASSED += 1
        print(f"  PASS  {label}")
    else:
        FAILED += 1
        print(f"  FAIL  {label}   {detail}")


def build_fixture(root: Path) -> None:
    (root / "_app" / "_lib").mkdir(parents=True)
    (root / "_app" / "styles").mkdir(parents=True)
    (root / "firebase.json").write_text(json.dumps({
        "hosting": {"public": "_app", "ignore": ["firebase.json", "**/.*", "**/*.bak", "**/*.md"]}
    }))
    # tracked, live content — including an underscore DIRECTORY, the trap
    (root / "_app" / "index.html").write_text("<html>home</html>")
    (root / "_app" / "_lib" / "HexAI.js").write_text("// live, referenced by thousands of pages")
    subprocess.run(["git", "init", "-q"], cwd=root, check=True)
    subprocess.run(["git", "add", "-A"], cwd=root, check=True)
    subprocess.run(["git", "-c", "user.email=t@t", "-c", "user.name=t",
                    "commit", "-qm", "fixture"], cwd=root, check=True)


def run(root: Path):
    return subprocess.run([sys.executable, str(GATE), "--root", str(root)],
                          capture_output=True, text=True)


def main() -> int:
    tmp = Path(tempfile.mkdtemp(prefix="deploy-gate-test-"))
    try:
        root = tmp / "repo"
        root.mkdir()
        build_fixture(root)

        print("\n1. A CLEAN TREE PASSES")
        r = run(root)
        check("exit 0 when every deployable file is tracked", r.returncode == 0, r.stdout[:200])

        print("\n2. THE ORIGINAL INCIDENT: an untracked probe in the hosting root")
        (root / "_app" / "_chris_house_probe.html").write_text("<html>probe</html>")
        r = run(root)
        check("exit 1 on an untracked probe", r.returncode == 1)
        check("names the file", "_chris_house_probe.html" in r.stdout, r.stdout[:200])

        print("\n3. DEBRIS WITH NO UNDERSCORE — what a naming rule would miss")
        (root / "_app" / "_chris_house_probe.html").unlink()
        (root / "_app" / "scratch-notes.html").write_text("notes")
        r = run(root)
        check("exit 1 on debris a naming pattern would not predict", r.returncode == 1)
        check("names it", "scratch-notes.html" in r.stdout, r.stdout[:200])
        (root / "_app" / "scratch-notes.html").unlink()

        print("\n4. ⚠ THE TRAP: it must NOT flag the live underscore directory")
        r = run(root)
        check("a tracked _lib/ file is never reported", r.returncode == 0 and "HexAI" not in r.stdout,
              r.stdout[:200])
        # and prove the check would notice if _lib were genuinely untracked
        (root / "_app" / "_lib" / "Rogue.js").write_text("// untracked")
        r = run(root)
        check("but an UNTRACKED file inside _lib IS caught", r.returncode == 1 and "Rogue.js" in r.stdout,
              r.stdout[:200])
        (root / "_app" / "_lib" / "Rogue.js").unlink()

        print("\n5. FILES HOSTING ALREADY IGNORES ARE NOT REPORTED")
        (root / "_app" / "something.bak").write_text("x")
        (root / "_app" / "NOTES.md").write_text("x")
        r = run(root)
        check("a .bak and a .md are not flagged (hosting excludes them)",
              r.returncode == 0, r.stdout[:200])
        (root / "_app" / "something.bak").unlink()
        (root / "_app" / "NOTES.md").unlink()

        print("\n6. THE ALLOWLIST SILENCES, AND SAYS SO ON EVERY RUN")
        (root / "_app" / "legit-video.mp4").write_text("binary-ish")
        allow = GATE.parent / "deploy-surface-allowlist.txt"
        original = allow.read_text()
        try:
            allow.write_text(original + "\nlegit-video.mp4\n")
            r = run(root)
            check("an allowlisted untracked file passes", r.returncode == 0, r.stdout[:200])
            check("but is REPORTED as a fresh-clone hazard",
                  "fresh clone" in r.stdout and "legit-video.mp4" in r.stdout, r.stdout[:300])
        finally:
            allow.write_text(original)

        print("\n7. IT REFUSES TO MEASURE THE WRONG TREE")
        cfg = json.loads((root / "firebase.json").read_text())
        cfg["hosting"]["public"] = "somewhere-else"
        (root / "firebase.json").write_text(json.dumps(cfg))
        r = run(root)
        check("exit 2 if the hosting root is not _app", r.returncode == 2, r.stdout[:200])

        print(f"\n{'-'*58}\n  {PASSED} passed, {FAILED} failed")
        return 1 if FAILED else 0
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    raise SystemExit(main())
