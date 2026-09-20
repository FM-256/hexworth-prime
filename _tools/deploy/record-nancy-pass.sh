#!/bin/bash
# record-nancy-pass.sh — record the adversarial reviewer's verdict for the current commit.
#
# @catalog what    writes _tools/deploy/.nancy-pass with Nancy's verdict + scope for HEAD
# @catalog run     _tools/deploy/record-nancy-pass.sh "<verdict>" "<scope>"
# @catalog status  TOOL
#
# WHY THIS EXISTS. `.chris-pass` has existed for a while and deploy.sh enforces it, but there was
# no equivalent for Nancy even though the rule "nothing deploys without Nancy approval" is older
# and unconditional. On 2026-09-19 that asymmetry produced a real stall: Nancy returned a
# CONDITIONAL proceed, the conditions were fixed in a later commit, and when the work reached Chris
# he could find no durable artifact telling him whether she had seen those fixes — so he BLOCKED on
# process, correctly, and the only way to resolve it was another round trip. A verdict that lives
# only in a conversation cannot be read by the next gate, or by the next session.
#
# This does NOT gate deploy.sh. Adding a second hard gate to the deploy path was deliberately not
# done in the same change that introduced the file, because a new blocking check is exactly the kind
# of thing that should not appear unannounced in a deploy script. Wiring it is tracked separately.
# Read this as an audit record, not an enforcement point.
set -euo pipefail

VERDICT="${1:-}"
SCOPE="${2:-}"
if [ -z "$VERDICT" ] || [ -z "$SCOPE" ]; then
    echo "usage: $0 \"<verdict: PROCEED|PAUSE|BLOCK>\" \"<scope / what was reviewed>\"" >&2
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
HEAD_SHA="$(git -C "$SCRIPT_DIR" rev-parse HEAD)"
MARKER="$SCRIPT_DIR/_tools/deploy/.nancy-pass"
mkdir -p "$SCRIPT_DIR/_tools/deploy"
{
    echo "commit: $HEAD_SHA"
    echo "recordedAt: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "verdict: $VERDICT"
    echo "scope: $SCOPE"
} > "$MARKER"

echo "Recorded Nancy $VERDICT for $HEAD_SHA"
