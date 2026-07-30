#!/bin/bash
# Lab QC gate. Runs ON bc1.  Usage:  bash qc-lab.sh rescue|cinder
#
# Why this file exists: I described the harnesses as "chained" when the ordering was really
# a one-off `if` typed into a shell -- a procedural habit, not a gate (Nancy, 2026-07-30).
# The difference matters for whoever runs this next without the same care, so the ordering
# is now a script that enforces it.
#
# ORDER IS THE POINT: adversarial FIRST, and the walkthrough only runs if it is clean.
# A lab that can be cheated has not earned a completeness check. This ordering also caught
# a silent seed timeout on lab 2 that a walkthrough-first run would have masked.
set -u
LAB="${1:-}"
case "$LAB" in
  rescue|cinder) ;;
  *) echo "usage: bash qc-lab.sh rescue|cinder" >&2; exit 2 ;;
esac
cd "$(dirname "$0")" 2>/dev/null || cd ~/hexworth-sandbox

ADV="adversarial-${LAB}.js"
WALK="walkthrough-${LAB}.js"
for f in "$ADV" "$WALK"; do
  [ -f "$f" ] || { echo "MISSING harness: $f" >&2; exit 2; }
done

echo "═══ [1/2] ADVERSARIAL ($ADV) -- named cheats must FAIL ═══"
if ! node "$ADV"; then
  echo ""
  echo "GATE FAILED: adversarial harness did not pass."
  echo "The walkthrough was NOT run: a lab that can be cheated does not earn a completeness check."
  exit 1
fi

echo ""
echo "═══ [2/2] WALKTHROUGH ($WALK) -- honest path must PASS, twice ═══"
if ! node "$WALK"; then
  echo ""
  echo "GATE FAILED: adversarial passed but the honest path did not."
  echo "The lab is unbeatable AND uncompletable -- worse than shipping nothing."
  exit 1
fi

echo ""
echo "═══ QC GATE PASSED for '$LAB': cheats rejected AND honest path passes ═══"
