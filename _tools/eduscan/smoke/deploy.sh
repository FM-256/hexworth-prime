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

# Smoke passed — write deploy-in-progress lock for post-verify, then deploy
LOCK_FILE="$REPO_ROOT/_tools/deploy/.deploy-in-progress"
mkdir -p "$REPO_ROOT/_tools/deploy" || { echo "✗ mkdir _tools/deploy/ failed"; exit 1; }

# Build lock JSON safely (jq -n) — handles arbitrary deploy args without
# JSON-injection from --only "hosting,functions" or --message "..."
if ! command -v jq >/dev/null 2>&1; then
    echo "WARN: jq not installed — post-verify will run in dry-run mode"
elif ! jq -n \
    --arg pid "$$" \
    --arg started "$(date -u +%Y-%m-%dT%H:%M:%SZ)" \
    --arg targets "$*" \
    --arg branch "$CURRENT_BRANCH" \
    '{deployScriptPid: ($pid | tonumber), startedAt: $started, deployTargets: $targets, branch: $branch}' \
    > "$LOCK_FILE"; then
    echo "WARN: lock file write failed (filesystem error) — post-verify will run in dry-run mode"
fi

# Trap covers: clean exit (EXIT), Ctrl-C (INT), kill (TERM), SSH disconnect (HUP).
# SIGKILL still leaves the file — staleness check in post-verify.sh handles
# (lock file mtime > 30 min → ignore).
trap 'rm -f "$LOCK_FILE"' EXIT INT TERM HUP

echo ""
echo "═══ Smoke gate passed — invoking firebase deploy ═══"
echo ""

firebase deploy "$@"
DEPLOY_EXIT=$?

if [[ $DEPLOY_EXIT -ne 0 ]]; then
    echo ""
    echo "✗ firebase deploy failed (exit $DEPLOY_EXIT) — skipping post-verify"
    exit $DEPLOY_EXIT
fi

# Deploy succeeded — run post-verify.
# Exit codes: 0=clean, 2=deploy SHIPPED + flagged divergence, 3=infra failure.
POST_VERIFY="$REPO_ROOT/_tools/deploy/post-verify.sh"
if [[ -f "$POST_VERIFY" ]]; then
    bash "$POST_VERIFY" "$@"
    exit $?
else
    echo "WARN: post-verify.sh not found at $POST_VERIFY — skipping (deploy SHIPPED, verification unverified)"
    exit 0
fi
