#!/bin/bash
# Marathon drain wrapper: drain one _auto_fix_queue item until empty.
#
# Usage: ./_marathon_drain_group.sh <itemId> [maxIterations]
#
# Flow:
#   1. node nexus.js autofix-apply <itemId>
#   2. If success + validated: re-scan to refresh queue (auto-reopens item if
#      group still has files), continue
#   3. If apply success but item.childPaths now empty in fresh scan: done
#   4. If apply fails: HALT (do not retry — operator must investigate)
#   5. Max iterations safety cap (default 60 — covers largest group of 79)
#
# Returns:
#   0 = group fully drained
#   1 = halted on apply/validator failure (operator review needed)
#   2 = max iterations reached (likely a logic bug; operator review)
#   3 = item not found in queue at start

set -e

ITEM_ID="$1"
MAX_ITER="${2:-60}"

if [ -z "$ITEM_ID" ]; then
    echo "Usage: $0 <itemId> [maxIterations]"
    exit 1
fi

cd "$(dirname "$0")"

# Marathon agent identity for audit
export NEXUS_AGENT_ID="agent:marathon-drain-$(date +%s)"

ITER=0
WIN=0
NOOP_STREAK=0
LAST_NOOP_ID=""
MAX_NOOP_STREAK=3   # idempotency-loop detection — if we see the same
                    # 'already in catalog' id N times in a row, the
                    # template's derive-id is colliding with something.

echo "=== marathon drain: $ITEM_ID (max $MAX_ITER iterations, max $MAX_NOOP_STREAK no-op streak) ==="
echo "agent id: $NEXUS_AGENT_ID"
echo ""

while [ $ITER -lt $MAX_ITER ]; do
    ITER=$((ITER + 1))
    echo "--- iteration $ITER ---"

    # Run apply, capture output + exit code
    set +e
    OUT=$(node nexus.js autofix-apply "$ITEM_ID" 2>&1)
    EC=$?
    set -e

    # Check exit code
    if [ $EC -ne 0 ]; then
        # Could be: gate, claim race, validator failure, item not found
        if echo "$OUT" | grep -q "GATE: master toggle is OFF"; then
            echo "HALT: master toggle is OFF (operator disabled mid-flight?)"
            exit 1
        fi
        if echo "$OUT" | grep -q "GATE: template .* is not in the enabled allowlist"; then
            echo "HALT: per-template enable was disabled mid-flight"
            exit 1
        fi
        if echo "$OUT" | grep -q "item not found"; then
            echo "DONE: item no longer in queue (group fully drained or removed)"
            echo "drained $WIN files in $ITER iterations"
            exit 0
        fi
        if echo "$OUT" | grep -q "claim failed.*status mismatch"; then
            # Item is in resolved state — group fingerprint must vanish before next iteration.
            # Force a rescan to trigger reconciler (auto-reopen if group still has files).
            echo "  item in resolved state — running nexus rescan to refresh"
            node nexus.js full --publish > /dev/null 2>&1
            continue
        fi
        echo "$OUT"
        echo "HALT: unexpected apply error (exit $EC)"
        exit 1
    fi

    # Parse output for validation status
    if echo "$OUT" | grep -q '"success": true' && echo "$OUT" | grep -q '"validated": true'; then
        SUMMARY=$(echo "$OUT" | grep -o '"applySummary": "[^"]*"' | head -1)
        echo "  $SUMMARY"

        # Idempotency-loop detection: if the same 'already in catalog' id
        # repeats N times, the template's id-derivation is colliding.
        if echo "$SUMMARY" | grep -q "already in catalog"; then
            CURRENT_ID=$(echo "$SUMMARY" | sed 's/.*module \([a-z0-9-]*\) already in catalog.*/\1/')
            if [ "$CURRENT_ID" = "$LAST_NOOP_ID" ]; then
                NOOP_STREAK=$((NOOP_STREAK + 1))
            else
                NOOP_STREAK=1
                LAST_NOOP_ID="$CURRENT_ID"
            fi
            if [ $NOOP_STREAK -ge $MAX_NOOP_STREAK ]; then
                echo "HALT: idempotency loop — id '$CURRENT_ID' returned 'already in catalog' $NOOP_STREAK times in a row."
                echo "  Likely cause: deriveModuleId collision (multiple source files derive same id)."
                echo "  Operator action: inspect childPaths[0..2] of item, fix template's deriveModuleId."
                exit 1
            fi
        else
            WIN=$((WIN + 1))
            NOOP_STREAK=0
            LAST_NOOP_ID=""
        fi
    elif echo "$OUT" | grep -q '"manualReviewRequired": true'; then
        echo "$OUT"
        echo "HALT: validator failed — operator review required"
        exit 1
    elif echo "$OUT" | grep -q "apply rejected"; then
        # Apply rejected (e.g., DRAFT marker, ID collision). Item stays in queue but this file
        # is unfixable. Run rescan and try next iteration which will pick the NEXT childPath.
        echo "  apply rejected — running rescan to advance childPaths"
        node nexus.js full --publish > /dev/null 2>&1
        continue
    else
        echo "$OUT"
        echo "HALT: unrecognized apply output"
        exit 1
    fi

    # Refresh queue so next iteration picks the next file (or sees item drained)
    node nexus.js full --publish > /dev/null 2>&1

    # If the item is no longer in 'open' after rescan, the group is fully drained
    NEW_STATUS=$(node _marathon_check_item.js "$ITEM_ID" 2>/dev/null || echo "unknown")
    if [ "$NEW_STATUS" != "open" ]; then
        echo "DONE: item status is '$NEW_STATUS' after rescan — group drained"
        echo "drained $WIN files in $ITER iterations"
        exit 0
    fi
done

echo ""
echo "MAX ITERATIONS REACHED ($MAX_ITER) — drained $WIN files; group may need more cycles or has stuck items"
exit 2
