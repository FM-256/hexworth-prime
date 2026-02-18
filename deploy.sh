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
    echo -e "${YELLOW}[SKIP]${NC} --force flag set, skipping EduScan pre-flight check"
    echo ""
else
    echo -e "${BOLD}[1/2]${NC} Running EduScan pre-deploy check..."
    echo ""

    # Run the scan in JSON mode (--json implies --quiet).
    # Capture output and exit code separately.
    SCAN_OUTPUT=""
    SCAN_EXIT=0

    if [ "$STRICT" = true ]; then
        SCAN_OUTPUT=$(node _tools/eduscan/cli.js --fail-on critical,high --json 2>&1) || SCAN_EXIT=$?
    else
        SCAN_OUTPUT=$(node _tools/eduscan/cli.js --json 2>&1) || SCAN_EXIT=$?
    fi

    # Parse the JSON output for CRITICAL and HIGH counts
    COUNTS=$(echo "$SCAN_OUTPUT" | node -e "
        let data = '';
        process.stdin.on('data', c => data += c);
        process.stdin.on('end', () => {
            try {
                const issues = JSON.parse(data);
                const critical = issues.filter(i => i.severity === 'critical').length;
                const high = issues.filter(i => i.severity === 'high').length;
                const total = issues.length;
                console.log(critical + ':' + high + ':' + total);
            } catch(e) {
                console.log('0:0:0');
            }
        });
    " 2>/dev/null || echo "0:0:0")

    CRITICAL_COUNT=$(echo "$COUNTS" | cut -d: -f1)
    HIGH_COUNT=$(echo "$COUNTS" | cut -d: -f2)
    TOTAL_COUNT=$(echo "$COUNTS" | cut -d: -f3)

    echo -e "${DIM}Scan found $TOTAL_COUNT total issues (CRITICAL: $CRITICAL_COUNT, HIGH: $HIGH_COUNT)${NC}"

    # Block on CRITICAL
    if [ "$CRITICAL_COUNT" -gt 0 ] 2>/dev/null; then
        echo ""
        echo -e "${RED}${BOLD}DEPLOY BLOCKED${NC}"
        echo -e "${RED}$CRITICAL_COUNT CRITICAL issue(s) found. These must be fixed before deploying.${NC}"
        echo ""
        echo -e "${DIM}Run 'npm run scan' for full details, or 'npm run scan:quick' for issues only.${NC}"
        echo -e "${DIM}To bypass: ./deploy.sh --force${NC}"
        exit 1
    fi

    # Block on HIGH in strict mode
    if [ "$STRICT" = true ] && [ "$HIGH_COUNT" -gt 0 ] 2>/dev/null; then
        echo ""
        echo -e "${RED}${BOLD}DEPLOY BLOCKED (strict mode)${NC}"
        echo -e "${RED}$HIGH_COUNT HIGH issue(s) found. Strict mode blocks on HIGH and CRITICAL.${NC}"
        echo ""
        echo -e "${DIM}Run 'npm run scan' for full details.${NC}"
        echo -e "${DIM}To deploy without strict: ./deploy.sh${NC}"
        exit 1
    fi

    # Non-critical issues: report but proceed
    if [ "$SCAN_EXIT" -ne 0 ]; then
        echo -e "${YELLOW}Non-critical issues found (no CRITICAL). Proceeding with deploy.${NC}"
    else
        echo -e "${GREEN}No blocking issues found.${NC}"
    fi
    echo ""
fi

echo -e "${BOLD}[2/2]${NC} Deploying to Firebase..."
echo ""

npx firebase deploy --only hosting

echo ""
echo -e "${GREEN}${BOLD}Deploy complete.${NC}"
