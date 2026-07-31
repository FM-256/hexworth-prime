#!/bin/bash
# Lab QC gate. Runs ON bc1.  Usage:  bash qc-lab.sh rescue|cinder|chain|secgroup|neutron|project
#
# Why this file exists: I described the harnesses as "chained" when the ordering was really
# a one-off `if` typed into a shell -- a procedural habit, not a gate (Nancy, 2026-07-30).
# The difference matters for whoever runs this next without the same care, so the ordering
# is now a script that enforces it.
#
# ORDER IS THE POINT: adversarial FIRST, and the walkthrough only runs if it is clean.
# A lab that can be cheated has not earned a completeness check. This ordering also caught
# a silent seed timeout on lab 2 that a walkthrough-first run would have masked.
#
# STAGE 3 (COVERAGE) added 2026-07-31 after the capstone shipped a check that was wrong in
# BOTH directions at once. Check 27 was forgeable by a cheat (BUG-055) AND impassable by an
# honest student (BUG-056). The adversarial half reported "cheat D rejected by check 27" and
# I read that as evidence 27 worked -- but "the cheat was rejected" is satisfied trivially by
# a check that rejects EVERYONE. Neither harness alone can tell a strict check from a broken
# one: adversarial cannot prove a check is not too strict, walkthrough cannot prove it is not
# too permissive. So the gate now proves every check id was observed BOTH passing and failing
# somewhere across the run. A check never seen passing may reject everything; a check never
# seen failing may accept everything. Either is a defect, not a pass.
set -u
LAB="${1:-}"
case "$LAB" in
  rescue|cinder|chain|secgroup|neutron|project) ;;
  *) echo "usage: bash qc-lab.sh rescue|cinder|chain|secgroup|neutron|project" >&2; exit 2 ;;
esac
cd "$(dirname "$0")" 2>/dev/null || cd ~/hexworth-sandbox

# The grader check ids each lab owns. Only labs whose harnesses emit COVERAGE lines can be
# coverage-gated; the rest run stages 1-2 and say so rather than claiming a check they skipped.
case "$LAB" in
  project) IDS="25 26 27 28" ;;
  *)       IDS="" ;;
esac

ADV="adversarial-${LAB}.js"
WALK="walkthrough-${LAB}.js"
for f in "$ADV" "$WALK"; do
  [ -f "$f" ] || {
    echo "MISSING harness: $f" >&2
    echo "The lab is NOT gated. Do not deploy it. Write the harness first -- verbatim," >&2
    echo "every command lifted from the page, every wait matching a page '# WAIT for:'." >&2
    exit 2
  }
done

COV="$(mktemp)"
trap 'rm -f "$COV"' EXIT

echo "═══ [1/3] ADVERSARIAL ($ADV) -- named cheats must FAIL ═══"
node "$ADV" 2>&1 | tee -a "$COV"
if [ "${PIPESTATUS[0]}" -ne 0 ]; then
  echo ""
  echo "GATE FAILED: adversarial harness did not pass."
  echo "The walkthrough was NOT run: a lab that can be cheated does not earn a completeness check."
  exit 1
fi

echo ""
echo "═══ [2/3] WALKTHROUGH ($WALK) -- honest path must PASS, twice ═══"
node "$WALK" 2>&1 | tee -a "$COV"
if [ "${PIPESTATUS[0]}" -ne 0 ]; then
  echo ""
  echo "GATE FAILED: adversarial passed but the honest path did not."
  echo "The lab is unbeatable AND uncompletable -- worse than shipping nothing."
  exit 1
fi

echo ""
COV_RAN=0
if [ -z "$IDS" ]; then
  echo "═══ [3/3] COVERAGE -- SKIPPED: '$LAB' harnesses do not emit COVERAGE lines yet ═══"
  echo "    Stages 1-2 passed. This lab is NOT coverage-gated, so a check that rejects"
  echo "    everything or accepts everything would still get through. Add the emit loop"
  echo "    (see adversarial-project.js) and an IDS entry above to close that."
else
  COV_RAN=1
  echo "═══ [3/3] COVERAGE -- every check must be seen BOTH passing and failing ═══"
  cov_fail=0
  for id in $IDS; do
    p=$(grep -c "^COVERAGE ${id} PASS$" "$COV" || true)
    f=$(grep -c "^COVERAGE ${id} FAIL$" "$COV" || true)
    if [ "$p" -eq 0 ] && [ "$f" -eq 0 ]; then
      echo "  check ${id}: NEVER OBSERVED -- the grader returned no result for this id at all."
      echo "               It is not wired up, or the id is wrong. This is not a pass."
      cov_fail=1
    elif [ "$p" -eq 0 ]; then
      echo "  check ${id}: observed FAIL ${f}x, PASS 0x -- it may reject EVERYTHING."
      echo "               A cheat being rejected proves nothing if honest work is rejected too."
      cov_fail=1
    elif [ "$f" -eq 0 ]; then
      echo "  check ${id}: observed PASS ${p}x, FAIL 0x -- it may accept EVERYTHING."
      echo "               Nothing in this run demonstrated the check can refuse anything."
      cov_fail=1
    else
      echo "  check ${id}: PASS ${p}x, FAIL ${f}x -- discriminates."
    fi
  done
  if [ "$cov_fail" -ne 0 ]; then
    echo ""
    echo "GATE FAILED: stages 1-2 passed but a check does not DISCRIMINATE."
    echo "A check that cannot be observed doing both is not evidence of anything."
    exit 1
  fi
fi

echo ""
# Say only what was actually proven. Claiming "checks discriminate" on a run where the
# coverage stage never executed is the same overclaim this stage was added to catch --
# and it printed exactly that on the first neutron run, which is how it was noticed.
if [ "$COV_RAN" -eq 1 ]; then
  echo "═══ QC GATE PASSED for '$LAB': cheats rejected, honest path passes, checks discriminate ═══"
else
  echo "═══ QC GATE PASSED for '$LAB': cheats rejected, honest path passes ═══"
  echo "    NOT proven: that each check discriminates. Coverage was skipped for this lab."
fi
