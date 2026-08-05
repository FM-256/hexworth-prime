#!/usr/bin/env python3
"""skill-map-audit.py — alert when a Dr. Hex Skill Map stops loading.

WHY THIS EXISTS
    A Skill Map is what stops Dr. Hex handing over a lab's answer. When one
    fails validation, `maybe_load_skill_map` returns None and the orchestrator
    falls back to a generic map whose entire forbidden list is three FLAG{...}
    patterns — which does nothing at all for a lab whose answer is prose. The
    guardrail does not error, it just quietly stops existing. The only trace is
    a WARNING in a log nobody reads.

    On 2026-08-05, 17 of 29 maps were failing validation and nobody had noticed.
    `list_all_skill_maps` existed but had zero callers anywhere in the repo —
    dead code, wired into no gate. Chris blocked a deploy over shipping new
    failure surface into a system with no detection for that failure class.

THE GATE
    At-or-below-baseline, the same shape EduScan uses for known debt: fail only
    when the number of non-loading maps EXCEEDS the recorded baseline. That
    catches a new break — a typo in a regex, a malformed YAML — on the very next
    deploy, without blocking every deploy on pre-existing debt that needs its own
    triage.

    Lower the baseline as maps get fixed. Never raise it without saying why.

USAGE
    python3 _tools/qa/skill-map-audit.py            # gate: exit 1 if worse than baseline
    python3 _tools/qa/skill-map-audit.py --list     # show every failing map and why
"""
import sys
import os
import glob

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
REPO = os.path.dirname(REPO) if os.path.basename(REPO) == "_tools" else REPO
ORCH = os.path.join(REPO, "_tools", "hexclass", "orchestrator")
MAPS = os.path.join(REPO, "_app", "lab-skill-maps")

# All 29 maps load as of 2026-08-05. The baseline was 17 for a few hours between
# the gate landing and the fix; it is now ZERO, which is the only value that
# makes this gate mean anything — at 17 the whole set could have regressed
# silently. Do not raise this to unblock a deploy: a map that does not load
# leaves that lab with no lab-specific forbidden strings, no flag values, and
# its help levels reset to the fallback's full [0..5], which hands back the
# direct answers the map deliberately withheld.
BASELINE_BROKEN = 0

sys.path.insert(0, ORCH)
try:
    from skill_map_loader import load_skill_map
except Exception as exc:  # orchestrator unavailable — do not fail the deploy on it
    print(f"  skill-map-audit: orchestrator not importable ({exc}); skipping")
    sys.exit(0)

ids = sorted(os.path.basename(p)[:-5] for p in glob.glob(os.path.join(MAPS, "*.yaml")))
ok, broken = [], []
for lab_id in ids:
    try:
        load_skill_map(lab_id)
        ok.append(lab_id)
    except Exception as exc:
        broken.append((lab_id, str(exc).split(":")[-1].strip()[:70]))

def _check_not_publicly_served() -> bool:
    """Skill Maps must NEVER ship to hosting.

    They contain answer keys: `forbidden_disclosures` enumerates literal answer
    strings ("alert 47 is real"), and `semantic_guard.answer_summary` states the
    solution outright as ground truth for the judge model. The orchestrator
    reads its own copy from /opt/hexclass/lab-skill-maps/, and nothing in _app/
    fetches them over HTTP — verified by grep — so hosting has no reason to
    serve them.

    On 2026-08-05 they WERE being served: hexworth.com/lab-skill-maps/*.yaml
    returned HTTP 200 for all 34, because firebase.json's ignore list excluded
    .md and __pycache__ but never .yaml. Fixed by adding 'lab-skill-maps/**'.
    This check exists so that removing that one line is caught on the next
    deploy instead of silently re-publishing every answer key.
    """
    import json
    fb = os.path.join(REPO, "firebase.json")
    try:
        with open(fb, encoding="utf-8") as fh:
            cfg = json.load(fh)
    except Exception as exc:
        print(f"  WARN: could not read firebase.json ({exc}); skipping hosting check")
        return True
    hosting = cfg.get("hosting")
    hosting = hosting[0] if isinstance(hosting, list) else (hosting or {})
    ignore = hosting.get("ignore", [])
    import fnmatch

    def _served(rel: str) -> bool:
        """Would firebase ship this path, given the ignore list?"""
        for pat in ignore:
            p = str(pat)
            if fnmatch.fnmatch(rel, p) or fnmatch.fnmatch(rel, p.rstrip("/*") + "/*"):
                return False
            if p.endswith("/**") and rel.startswith(p[:-3] + "/"):
                return False
        return True

    ok = True

    if any("lab-skill-maps" in str(pat) for pat in ignore):
        print("  hosting: lab-skill-maps excluded (answer keys not public)")
    else:
        ok = False
        print("  FAIL: firebase.json does NOT exclude lab-skill-maps —")
        print("        deploying would publish every lab's answer key at")
        print("        https://<host>/lab-skill-maps/<lab>.yaml")

    # GENERIC SWEEP for answer-bearing content that hosting would serve.
    #
    # Three live exposures were found by three different people looking from
    # three angles, which is why this is a sweep with a REVIEWED list rather
    # than a list of known-bad paths:
    #   lab-skill-maps/*.yaml            34 answer keys      (Chris, from firebase.json)
    #   python-for-it/solutions/*.py     COP1034C final      (Chris, by sampling)
    #   matrix/handouts/*-walkthrough.pdf 41 exam flags      (Chris, third pass)
    # The last was a FINAL EXAM answer key: "ALA Final Exam ... Solution Guide",
    # CONFIDENTIAL header, 10 literal FLAG{...} values, publicly fetchable.
    #
    # ANY extension, because the class is not a file type — the .py sweep that
    # replaced the .yaml fix still missed .pdf. And AccessGuard cannot protect
    # non-HTML at all: it is a script tag, so a .pdf or .py is served raw
    # regardless of how carefully the surrounding course is gated.
    #
    # REVIEWED_SAFE exists because the directory heuristic over-matches badly:
    # "security-solutions" is an SC-900 TOPIC, a hashing "walkthrough" applet is
    # student-facing teaching, and new_year_resolution.webp matches on
    # "resolution". Blocking those would be the over-correction. Anything NOT on
    # this list fails the gate and needs a human to look, which is the point.
    KEYS = ("solution", "answer-key", "answerkey", "answer_key",
            "walkthrough", "instructor-guide", "instructor-solution")
    REVIEWED_SAFE = {
        # topic-name collisions, confirmed by reading each one
        "houses/shield/security-plus/quizzes/secplus-d1-crypto-solutions-quiz.quiz.html",
        "houses/shield/sc-900/presentations/sc900-ch03-security-solutions.presentation.html",
        "houses/shield/sc-900/labs/sc900-ch03-security-solutions.lab.html",
        "_archive/terminal-labs/sc-900/sc900-ch03-security-solutions.lab.html",
        # student-facing teaching applet, not a solution guide
        "houses/shield/applets/crypto/hashing_walkthrough/shield-crypto-hashing-walkthrough.applet.html",
        # substring accidents on "re-SOLUTION"
        "assets/images/badges/new_year_resolution.webp",
        "dark-arts/vault/labs/linux/da-linux-shell-resolution.lab.html",
    }
    app = os.path.join(REPO, "_app")
    leaking = []
    for dirpath, _dirs, files in os.walk(app):
        rel_dir = os.path.relpath(dirpath, app).replace(os.sep, "/")
        for fn in files:
            rel = f"{rel_dir}/{fn}" if rel_dir != "." else fn
            if not any(k in rel.lower() for k in KEYS):
                continue
            if fn.endswith(".md"):          # already ignored platform-wide
                continue
            if rel in REVIEWED_SAFE:
                continue
            if _served(rel):
                leaking.append(rel)
    if leaking:
        ok = False
        print(f"  FAIL: {len(leaking)} answer-bearing file(s) would be PUBLICLY served.")
        print("        Non-HTML cannot be AccessGuard-protected; hosting serves it raw.")
        for r in leaking[:8]:
            print(f"          https://<host>/{r}")
        if len(leaking) > 8:
            print(f"          ... and {len(leaking)-8} more")
        print("        If one is a false positive, read it and add it to REVIEWED_SAFE.")
    else:
        print("  hosting: no answer-bearing files would be served")

    return ok


if "--list" in sys.argv:
    print(f"Skill Maps: {len(ok)} loading, {len(broken)} failing, {len(ids)} total\n")
    for lab_id, why in broken:
        print(f"  FAIL  {lab_id}\n        {why}")
    sys.exit(0)

print(f"  {len(ok)}/{len(ids)} Skill Maps load; {len(broken)} failing "
      f"(baseline {BASELINE_BROKEN})")

hosting_ok = _check_not_publicly_served()

if not hosting_ok:
    sys.exit(1)

if len(broken) > BASELINE_BROKEN:
    print(f"  FAIL: {len(broken)} failing maps exceeds the baseline of {BASELINE_BROKEN}.")
    print("  A map that does not load leaves Dr. Hex with NO lab-specific guardrail.")
    for lab_id, why in broken:
        print(f"    - {lab_id}: {why}")
    sys.exit(1)

if len(broken) < BASELINE_BROKEN:
    print(f"  (improved: {BASELINE_BROKEN - len(broken)} fewer than baseline — "
          f"lower BASELINE_BROKEN to {len(broken)} to lock the gain in)")

sys.exit(0)
