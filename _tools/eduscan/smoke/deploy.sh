#!/usr/bin/env bash
# EduScan Smoke-Gated Deploy Wrapper
#
# Runs the pre-deploy smoke gate, then forwards all arguments to firebase deploy.
# Blocks deploy if smoke gate fails.
#
# Usage:
#   _tools/eduscan/smoke/deploy.sh --only hosting
#   _tools/eduscan/smoke/deploy.sh --only hosting,firestore:rules
#   _tools/eduscan/smoke/deploy.sh                            # full deploy
#
# Override (emergency only):
#   SKIP_SMOKE=1 SKIP_SMOKE_REASON="why" _tools/eduscan/smoke/deploy.sh --only hosting

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"

cd "$REPO_ROOT"

# Branch safety check (matches CLAUDE.md Rule #10)
CURRENT_BRANCH="$(git branch --show-current)"
if [[ "$CURRENT_BRANCH" != "master" ]]; then
    echo ""
    echo "✗ DEPLOY BLOCKED: not on master (current: $CURRENT_BRANCH)"
    echo ""
    echo "Per CLAUDE.md Rule #10, firebase deploy is only allowed from master."
    echo "For preview-channel deploys from a feature branch, use:"
    echo "  firebase hosting:channel:deploy <channel-name>"
    exit 1
fi

# Smoke gate
node "$SCRIPT_DIR/run.js"
SMOKE_EXIT=$?

if [[ $SMOKE_EXIT -ne 0 ]]; then
    echo ""
    echo "✗ DEPLOY BLOCKED: smoke gate failed"
    exit $SMOKE_EXIT
fi

# Smoke passed — proceed with firebase deploy
echo ""
echo "═══ Smoke gate passed — invoking firebase deploy ═══"
echo ""
exec firebase deploy "$@"
