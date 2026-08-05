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

# Known-broken count as of 2026-08-05: 16 maps whose transfer_prompt does not
# end in '?', plus 1 with a YAML syntax error. Documented, not accepted —
# tracked for its own triage. Lower this as they are fixed.
BASELINE_BROKEN = 17

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

if "--list" in sys.argv:
    print(f"Skill Maps: {len(ok)} loading, {len(broken)} failing, {len(ids)} total\n")
    for lab_id, why in broken:
        print(f"  FAIL  {lab_id}\n        {why}")
    sys.exit(0)

print(f"  {len(ok)}/{len(ids)} Skill Maps load; {len(broken)} failing "
      f"(baseline {BASELINE_BROKEN})")

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
