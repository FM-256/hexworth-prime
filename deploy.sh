#!/bin/bash
# deploy.sh - Hexworth Prime deployment with EduScan quality gate
#
# Usage:
#   ./deploy.sh          Deploy with pre-flight scan (blocks on CRITICAL)
#   ./deploy.sh --force  Skip the scan and deploy immediately
#   ./deploy.sh --strict Block on CRITICAL or HIGH issues
#
# The scan runs in quick mode (issues-only, quiet, JSON) for speed.
# Non-critical issues are reported but do not block deployment.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
DIM='\033[2m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo ""
echo -e "${BOLD}Hexworth Prime Deploy${NC}"
echo -e "${DIM}────────────────────────────────────${NC}"
echo ""

# Parse flags
FORCE=false
STRICT=false
for arg in "$@"; do
    case "$arg" in
        --force)  FORCE=true ;;
        --strict) STRICT=true ;;
        *)        echo -e "${RED}Unknown flag: $arg${NC}"; exit 1 ;;
    esac
done

if [ "$FORCE" = true ]; then
    echo -e "${YELLOW}[SKIP]${NC} --force flag set, skipping Nexus gate check"
    echo ""
else
    echo -e "${BOLD}[1/2]${NC} Running Nexus deploy gate..."
    echo ""

    GATE_FLAGS=""
    if [ "$STRICT" = true ]; then
        GATE_FLAGS="--strict"
    fi

    if node _tools/nexus/nexus.js gate $GATE_FLAGS; then
        echo ""
    else
        echo ""
        echo -e "${DIM}To bypass: ./deploy.sh --force${NC}"
        exit 1
    fi
fi

echo -e "${BOLD}[2/2]${NC} Deploying to Firebase..."
echo ""

npx firebase deploy --only hosting

echo ""
echo -e "${GREEN}${BOLD}Deploy complete.${NC}"
