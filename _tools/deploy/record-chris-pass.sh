#!/bin/bash
# record-chris-pass.sh — record a Chris quality-gate PASS for the current commit.
# Run this ONLY after the 'chris' subagent has actually returned CHRIS: PASS on the
# work that is about to ship. deploy.sh Gate 1.5 checks that this marker's commit
# matches HEAD before a hosting deploy. Defense-in-depth, not a security boundary.
#
# Usage: _tools/deploy/record-chris-pass.sh "<scope>"   e.g. "wsa m16-m19 rebuild"
set -euo pipefail

SCOPE="${1:-}"
if [ -z "$SCOPE" ]; then
    echo "usage: $0 \"<scope description>\"" >&2
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
HEAD_SHA="$(git -C "$SCRIPT_DIR" rev-parse HEAD)"
MARKER="$SCRIPT_DIR/_tools/deploy/.chris-pass"
mkdir -p "$SCRIPT_DIR/_tools/deploy"

# Write the marker. The commit line is what deploy.sh greps for; the rest is audit.
{
    echo "commit: $HEAD_SHA"
    echo "recordedAt: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "scope: $SCOPE"
    echo "verdict: PASS"
} > "$MARKER"

echo "Recorded Chris PASS for $HEAD_SHA ($SCOPE)"
