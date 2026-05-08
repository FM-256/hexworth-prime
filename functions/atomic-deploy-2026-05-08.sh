#!/usr/bin/env bash
#
# atomic-deploy-2026-05-08.sh
#
# One-shot orchestrator for the 4 production writes pending user authorization:
#   1. clh-022 / clh-023 / clh-027 — POC Rule 6 rebalance (Karl ALL-PASS 2026-05-08)
#   2. security — 25Q Discipline A canonical fix (Karl Mode-2 ALL-PASS 2026-05-08)
#
# Order chosen to minimize live-broken-window:
#   - Reseed Firestore FIRST so server-grading uses corrected keys
#   - Then ./deploy.sh pushes the matching HTML
#   - Both seeds have drift-gate pre-flight that ABORTS if static doesn't
#     match the Karl-verified expected state
#
# This script does NOT skip any gates. If any step fails, the script halts
# and the operator sees exactly where.
#
# Usage (from functions/ dir):
#   bash atomic-deploy-2026-05-08.sh           # full live run
#   bash atomic-deploy-2026-05-08.sh --dry     # dry-run all gates, no writes
#
# Pre-flight gates run regardless of --dry. Live writes only when --dry omitted.

set -euo pipefail

DRY=""
[ "${1:-}" = "--dry" ] && DRY="--dry-run"

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
FN_DIR="$REPO_ROOT/functions"

echo "═══════════════════════════════════════════════════════════════════"
echo " Atomic Deploy 2026-05-08 — QC-53 POC + QC-55 security"
echo "═══════════════════════════════════════════════════════════════════"
echo
echo "Repo root: $REPO_ROOT"
echo "Functions dir: $FN_DIR"
echo "Mode: ${DRY:+DRY-RUN (no writes)}${DRY:-LIVE}"
echo

cd "$FN_DIR"

echo "──── Step 1/4: Branch check ────────────────────────────────────────"
BRANCH=$(git -C "$REPO_ROOT" branch --show-current)
echo "Current branch: $BRANCH"
if [ "$BRANCH" != "master" ]; then
    echo "ABORT — production-write commands require branch=master per CLAUDE.md gate"
    exit 1
fi
echo "Branch gate PASS."
echo

echo "──── Step 2a/4: Reseed clh-022 / clh-023 / clh-027 (QC-53 POC) ─────"
node seed-clh-poc-rebalance-2026-05-08.js $DRY
echo

echo "──── Step 2b/4: Reseed security 25Q (QC-55) ─────────────────────────"
node seed-security-25q-2026-05-08.js $DRY
echo

if [ -n "$DRY" ]; then
    echo "──── Step 3/4: SKIPPED (dry-run) ────────────────────────────────────"
    echo "    verify-quiz-keys.js skipped — no Firestore changes occurred"
    echo
    echo "──── Step 4/4: SKIPPED (dry-run) ────────────────────────────────────"
    echo "    ./deploy.sh skipped"
    echo
    echo "Dry-run complete. To execute live: bash atomic-deploy-2026-05-08.sh"
    exit 0
fi

echo "──── Step 3/4: Verify-quiz-keys post-reseed ─────────────────────────"
node verify-quiz-keys.js clh-022 clh-023 clh-027 security
echo

echo "──── Step 4/4: ./deploy.sh ──────────────────────────────────────────"
cd "$REPO_ROOT"
./deploy.sh
echo

echo "═══════════════════════════════════════════════════════════════════"
echo " ATOMIC DEPLOY COMPLETE"
echo "═══════════════════════════════════════════════════════════════════"
echo
echo "Post-deploy recommended:"
echo "  1. Spot-check live grading on /houses/script/clh/script-clh-027.quiz.html"
echo "  2. Spot-check live grading on /houses/ai/quizzes/ai-security.quiz.html"
echo "  3. Run: cd _tools/nexus && node nexus.js full   (publishes green gate state)"
