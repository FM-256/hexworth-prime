#!/bin/bash
# deploy.sh - Hexworth Prime deployment with multi-layer safety gates
#
# Gates (in order, cheapest to most expensive):
#   1. Branch check  : must be on master (CLAUDE.md Rule #10) — no override
#   2. Nexus gate    : static-analysis quality scan — --force bypass
#   3. Smoke gate    : real-browser pre-render check (Puppeteer) — --skip-smoke bypass
#   4. firebase deploy --only hosting
#
# Usage:
#   ./deploy.sh                     Run all gates, deploy hosting
#   ./deploy.sh --strict            Nexus blocks on CRITICAL or HIGH
#   ./deploy.sh --force             Skip Nexus only (preserve smoke gate)
#   ./deploy.sh --skip-smoke        Skip smoke only (preserve Nexus gate)
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
for arg in "$@"; do
    case "$arg" in
        --force)       FORCE=true ;;
        --strict)      STRICT=true ;;
        --skip-smoke)  SKIP_SMOKE=true ;;
        *)             echo -e "${RED}Unknown flag: $arg${NC}"; exit 1 ;;
    esac
done

# ── Gate 1: Branch check (no override) ───────────────────────────────
echo -e "${BOLD}[1/4]${NC} Branch safety check..."
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
    echo -e "${BOLD}[2/4]${NC} Nexus gate ${YELLOW}[SKIPPED]${NC} — --force flag set"
    echo ""
else
    echo -e "${BOLD}[2/4]${NC} Running Nexus deploy gate..."
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
    echo -e "${BOLD}[3/4]${NC} Smoke gate ${YELLOW}[SKIPPED]${NC} — --skip-smoke flag set"
    echo ""
else
    echo -e "${BOLD}[3/4]${NC} Running real-browser smoke gate..."
    echo ""
    if node _tools/eduscan/smoke/run.js; then
        echo ""
    else
        echo ""
        echo -e "${DIM}To bypass smoke only: ./deploy.sh --skip-smoke${NC}"
        exit 1
    fi
fi

# ── Gate 4: Firebase deploy ──────────────────────────────────────────
echo -e "${BOLD}[4/4]${NC} Deploying to Firebase..."
echo ""

npx firebase deploy --only hosting

echo ""
echo -e "${GREEN}${BOLD}Deploy complete.${NC}"
