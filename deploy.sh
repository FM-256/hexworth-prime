#!/bin/bash
# deploy.sh - Hexworth Prime deployment with multi-layer safety gates
#
# Gates (in order, cheapest to most expensive):
#   1. Branch check    : must be on master (CLAUDE.md Rule #10) — no override
#   2. Nexus gate      : static-analysis quality scan — --force bypass
#   3. Smoke gate      : real-browser pre-render check (Puppeteer) — --skip-smoke bypass
#   4. firebase deploy --only hosting
#   5. Post-verify     : nexus refresh + EduScan + log-spike check — --skip-post-verify bypass (with reason)
#   6. Confluence inventory regen (post-deploy, NON-BLOCKING — never aborts deploy)
#
# Usage:
#   ./deploy.sh                     Run all gates, deploy hosting + regen inventory
#   ./deploy.sh --strict            Nexus blocks on CRITICAL or HIGH
#   ./deploy.sh --force             Skip Nexus only (preserve smoke gate)
#   ./deploy.sh --skip-smoke        Skip smoke only (preserve Nexus gate)
#   ./deploy.sh --skip-inventory    Skip Confluence inventory regen (deploy proceeds normally)
#   ./deploy.sh --skip-post-verify --skip-post-verify-reason "<text>"
#                                   Skip post-verify (audit-logged with reason)
#   ./deploy.sh --force --skip-smoke   Skip BOTH gates (explicit, audit-trail-friendly)
#
# Branch check is hard-fail by design — for non-master deploys, use:
#   firebase hosting:channel:deploy <channel-name>
#
# For non-hosting deploys (functions, firestore:*), use the standalone wrapper:
#   _tools/eduscan/smoke/deploy.sh --only functions
#   _tools/eduscan/smoke/deploy.sh --only firestore:rules,firestore:indexes
# (That wrapper passes args through to firebase; this script is hosting-only.)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m'

echo ""
echo -e "${BOLD}Hexworth Prime Deploy${NC}"
echo -e "${DIM}────────────────────────────────────${NC}"
echo ""

# Parse flags
FORCE=false
STRICT=false
SKIP_SMOKE=false
SKIP_INVENTORY=false
SKIP_POST_VERIFY=false
SKIP_POST_VERIFY_REASON=""   # initialized for set -u safety
SKIP_POST_VERIFY_NEXT=false
for arg in "$@"; do
    if [[ "$SKIP_POST_VERIFY_NEXT" == "true" ]]; then
        SKIP_POST_VERIFY_REASON="$arg"
        SKIP_POST_VERIFY_NEXT=false
        continue
    fi
    case "$arg" in
        --force)                    FORCE=true ;;
        --strict)                   STRICT=true ;;
        --skip-smoke)               SKIP_SMOKE=true ;;
        --skip-inventory)           SKIP_INVENTORY=true ;;
        --skip-post-verify)         SKIP_POST_VERIFY=true ;;
        --skip-post-verify-reason)  SKIP_POST_VERIFY_NEXT=true ;;
        *)                          echo -e "${RED}Unknown flag: $arg${NC}"; exit 1 ;;
    esac
done

# Post-loop flag-pair validation (audit-trail integrity)
if [[ "$SKIP_POST_VERIFY_NEXT" == "true" ]]; then
    echo -e "${RED}--skip-post-verify-reason requires a value (e.g., --skip-post-verify-reason \"<text>\")${NC}"
    exit 1
fi
if [[ -n "$SKIP_POST_VERIFY_REASON" && "$SKIP_POST_VERIFY" == "false" ]]; then
    echo -e "${RED}--skip-post-verify-reason supplied without --skip-post-verify; the reason would be silently swallowed.${NC}"
    exit 1
fi
if [[ "$SKIP_POST_VERIFY" == "true" && -z "$SKIP_POST_VERIFY_REASON" ]]; then
    echo -e "${RED}--skip-post-verify requires --skip-post-verify-reason \"<text>\" for audit trail${NC}"
    exit 1
fi

# ── Gate 1: Branch check (no override) ───────────────────────────────
echo -e "${BOLD}[1/6]${NC} Branch safety check..."
CURRENT_BRANCH="$(git branch --show-current)"
if [ "$CURRENT_BRANCH" != "master" ]; then
    echo ""
    echo -e "${RED}DEPLOY BLOCKED${NC}: not on master (current: $CURRENT_BRANCH)"
    echo ""
    echo "Per CLAUDE.md Rule #10, firebase deploy is master-only."
    echo "For preview-channel deploys from a feature branch:"
    echo "  firebase hosting:channel:deploy <channel-name>"
    exit 1
fi
echo -e "${GREEN}✓${NC} on master"
echo ""

# ── Gate 2: Nexus static-analysis gate ───────────────────────────────
if [ "$FORCE" = true ]; then
    echo -e "${BOLD}[2/6]${NC} Nexus gate ${YELLOW}[SKIPPED]${NC} — --force flag set"
    echo ""
else
    echo -e "${BOLD}[2/6]${NC} Running Nexus deploy gate..."
    echo ""

    GATE_FLAGS=""
    if [ "$STRICT" = true ]; then
        GATE_FLAGS="--strict"
    fi

    if node _tools/nexus/nexus.js gate $GATE_FLAGS; then
        echo ""
    else
        echo ""
        echo -e "${DIM}To bypass Nexus only: ./deploy.sh --force${NC}"
        exit 1
    fi
fi

# ── Gate 3: Smoke gate (real-browser pre-render check) ───────────────
if [ "$SKIP_SMOKE" = true ]; then
    echo -e "${BOLD}[3/6]${NC} Smoke gate ${YELLOW}[SKIPPED]${NC} — --skip-smoke flag set"
    echo ""
else
    echo -e "${BOLD}[3/6]${NC} Running real-browser smoke gate..."
    echo ""
    if node _tools/eduscan/smoke/run.js; then
        echo ""
    else
        echo ""
        echo -e "${DIM}To bypass smoke only: ./deploy.sh --skip-smoke${NC}"
        exit 1
    fi
fi

# ── Drift report (informational) — what changed since the last deploy? ───
# Compares the current EduScan findings against the most recent archive
# (from the previous successful deploy's post-verify --archive step).
# NEVER blocks deploy — smoke + nexus gates already enforce critical/high.
# Captures the EduScan "DRIFT ANALYSIS" section: trend, counts, NEW ISSUES.
echo -e "${BOLD}[3.5/6]${NC} EduScan drift report (informational, non-blocking)..."
echo ""
DRIFT_OUTPUT=$(node _tools/eduscan/cli.js --diff 2>&1 || true)
# Extract just the DRIFT ANALYSIS block. If --diff finds no prior archive,
# EduScan still runs the scan; the DRIFT section just shows everything as new.
echo "$DRIFT_OUTPUT" | awk '/DRIFT ANALYSIS/,/^$/{print}' | sed 's/^/  /'
echo ""

# ── Gate 4: Firebase deploy (with deploy-in-progress lock for post-verify) ──
echo -e "${BOLD}[4/6]${NC} Deploying to Firebase..."
echo ""

LOCK_FILE="$SCRIPT_DIR/_tools/deploy/.deploy-in-progress"
mkdir -p "$SCRIPT_DIR/_tools/deploy" || { echo -e "${RED}✗ mkdir _tools/deploy/ failed${NC}"; exit 1; }

# Build lock JSON safely (jq -n) — handles arbitrary deploy args without
# JSON-injection. WARN paths are non-fatal: post-verify falls back to dry-run.
if ! command -v jq >/dev/null 2>&1; then
    echo -e "${YELLOW}WARN: jq not installed — post-verify will run in dry-run mode${NC}"
elif ! jq -n \
    --arg pid "$$" \
    --arg started "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg targets "hosting" \
    --arg branch "master" \
    '{deployScriptPid: ($pid | tonumber), startedAt: $started, deployTargets: $targets, branch: $branch}' \
    > "$LOCK_FILE"; then
    echo -e "${YELLOW}WARN: lock file write failed (filesystem error) — post-verify will run in dry-run mode${NC}"
fi

# Trap covers EXIT, INT, TERM, HUP. SIGKILL leaves stale lock; post-verify
# staleness check (>30 min) handles that case.
trap 'rm -f "$LOCK_FILE"' EXIT INT TERM HUP

npx firebase deploy --only hosting

echo ""

# ── Gate 5: Post-deploy verification ─────────────────────────────────
# Runs BEFORE Confluence regen so a flagged regression skips inventory
# update — Confluence shouldn't reflect a broken state as "deployed."
if [ "$SKIP_POST_VERIFY" = true ]; then
    echo -e "${BOLD}[5/6]${NC} Post-verify ${YELLOW}[SKIPPED]${NC} — reason: $SKIP_POST_VERIFY_REASON"
    AUDIT_LOG="$SCRIPT_DIR/_planning/reports/skip-post-verify-audit.log"
    mkdir -p "$(dirname "$AUDIT_LOG")"
    echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) deploy.sh skip-post-verify: $SKIP_POST_VERIFY_REASON" >> "$AUDIT_LOG"
    echo ""
elif [ -f "$SCRIPT_DIR/_tools/deploy/post-verify.sh" ]; then
    echo -e "${BOLD}[5/6]${NC} Running post-deploy verification..."
    echo ""
    if bash "$SCRIPT_DIR/_tools/deploy/post-verify.sh" --hosting; then
        echo ""
    else
        POST_EXIT=$?
        echo ""
        echo -e "${RED}✗ post-verify exited $POST_EXIT — Confluence regen SKIPPED${NC}"
        echo -e "${RED}✗ Deploy SHIPPED but verification flagged — see _docs/operations/post-verify-recovery.md${NC}"
        exit $POST_EXIT
    fi
else
    echo -e "${BOLD}[5/6]${NC} ${YELLOW}post-verify.sh not found — skipping${NC}"
    echo ""
fi

# ── Step 6: Confluence inventory regen (NON-BLOCKING) ────────────────
# This step exists to keep the "Hexworth Prime — Complete Course & Hub
# Inventory" Confluence page (id 4358163) current with each deploy. The
# wrapper script catches all errors and always exits 0, so a Confluence
# outage / auth failure / network blip will NEVER fail the deploy that
# already shipped successfully. The deploy is committed at this point.
# Only runs if post-verify passed (or was skipped) — a flagged regression
# would have exit'd above.
if [ "$SKIP_INVENTORY" = true ]; then
    echo -e "${BOLD}[6/6]${NC} Confluence inventory regen ${YELLOW}[SKIPPED]${NC} — --skip-inventory flag set"
else
    echo -e "${BOLD}[6/6]${NC} Refreshing Confluence inventory page..."
    # The wrapper handles its own error reporting + always exits 0.
    # Wrap in `|| true` as belt-and-suspenders against `set -e`.
    "$SCRIPT_DIR/_tools/confluence/push_hub_inventory.sh" || true
fi

echo ""
echo -e "${GREEN}${BOLD}Deploy complete.${NC}"
