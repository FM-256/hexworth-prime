#!/usr/bin/env bash
# sync-published-docs.sh — re-publish every doc in published-docs.json to its Confluence page.
#
# @catalog what    Re-pushes registered runbooks to Confluence, refusing any whose line refs rotted
# @catalog run     _tools/confluence/sync-published-docs.sh [--dry] [--verbose]
# @catalog status  GATE
#
# WHY THIS EXISTS. Publishing a runbook to Confluence creates a SNAPSHOT. On 2026-09-20 the
# tournament runbook was published with 30 verified file:line references, and the honest caveat at
# the time was that nothing would re-verify or re-push it: a code change that moved those lines
# would leave the wiki copy quietly wrong, and the wiki copy is the one an operator actually reads
# during an event. A document that is only correct on the day it was written is a trap, because it
# reads as authoritative forever.
#
# THE COUPLING THAT MATTERS. Before pushing any doc, its line references are verified. A doc whose
# refs have rotted is NOT published, and says so loudly. Pushing a doc with references pointing at
# blank lines would put a known-wrong document in front of an operator under the authority of the
# wiki, which is worse than letting the page go stale: stale is at least dated.
#
# WHY --if-changed AND NOT AN UNCONDITIONAL PUSH. The first version of this script pushed every
# run, on the assumption that Confluence would decline to advance the version for an identical
# body the way push_hub_inventory.sh reports it does. MEASURED 2026-09-20: it does not. An
# unchanged runbook went from v1 to v2 on a no-op sync, which over one deploy per day is a version
# per day of pure noise with the real edits buried in it. `--if-changed` compares the converted
# body against the LIVE body and skips the PUT when they match. Both sides are re-derived every
# run, so there is no cached hash to fall out of step with reality
# (memory: feedback_gate_must_rederive_not_trust_cache).
#
# NEVER BLOCKS A DEPLOY. Same contract as push_hub_inventory.sh: all failures warn and this exits 0
# unless --strict is passed. A documentation sync must not be able to fail a hosting deploy.
set -uo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
REGISTRY="$SCRIPT_DIR/_tools/confluence/published-docs.json"
DRY=false; VERBOSE=false; STRICT=false
# --registry exists so the REFUSAL path can be exercised against a fixture. A gate whose refusal
# has never fired is a gate nobody has tested (memory: feedback_measure_the_claim_not_a_proxy).
while [ $# -gt 0 ]; do
    case "$1" in
        --dry) DRY=true ;;
        --verbose) VERBOSE=true ;;
        --strict) STRICT=true ;;
        --registry) shift; REGISTRY="$1" ;;
    esac
    shift
done

log()  { echo "[confluence-docs] $*"; }
warn() { echo "[confluence-docs] WARN: $*" >&2; }

if [ ! -f "$REGISTRY" ]; then warn "no registry at $REGISTRY — nothing to sync"; exit 0; fi
if ! command -v jq >/dev/null 2>&1; then warn "jq not available — skipping"; exit 0; fi

COUNT=$(jq '.docs | length' "$REGISTRY" 2>/dev/null || echo 0)
if [ "$COUNT" = "0" ]; then log "registry is empty — nothing to sync"; exit 0; fi

pushed=0; skipped=0; refused=0; unchanged=0
for i in $(seq 0 $((COUNT - 1))); do
    DOC=$(jq -r ".docs[$i].path"   "$REGISTRY")
    PID=$(jq -r ".docs[$i].pageId" "$REGISTRY")
    TITLE=$(jq -r ".docs[$i].title" "$REGISTRY")
    FULL="$SCRIPT_DIR/$DOC"

    if [ ! -f "$FULL" ]; then
        warn "$DOC is in the registry but does not exist — did it move? NOT publishing"
        refused=$((refused + 1)); continue
    fi

    # THE GATE: rotted references are not allowed onto the wiki.
    REFOUT=$(cd "$SCRIPT_DIR" && node _tools/docs/verify-doc-line-refs.js "$DOC" --quiet 2>&1)
    if [ $? -ne 0 ]; then
        warn "$DOC has BROKEN line references — refusing to publish it:"
        echo "$REFOUT" | sed 's/^/           /' >&2
        warn "fix the refs (node _tools/docs/verify-doc-line-refs.js $DOC) then re-run"
        refused=$((refused + 1)); continue
    fi
    [ "$VERBOSE" = true ] && log "$DOC refs verified"

    if [ "$DRY" = true ]; then
        log "dry-run: would update page $PID ($TITLE) from $DOC"
        skipped=$((skipped + 1)); continue
    fi

    OUT=$(cd "$SCRIPT_DIR" && timeout 180 python3 _tools/confluence/publish-solution.py update "$PID" "$DOC" --if-changed 2>&1)
    if [ $? -eq 0 ]; then
        log "$(echo "$OUT" | tail -1)"
        # Distinguish a real push from a no-op skip. Counting a skip as a sync would make the
        # summary claim work that did not happen, which is the kind of number that stops meaning
        # anything the second someone checks it.
        if echo "$OUT" | grep -q "^Unchanged page"; then
            unchanged=$((unchanged + 1))
        else
            pushed=$((pushed + 1))
        fi
    else
        warn "update failed for $DOC (page $PID):"
        echo "$OUT" | tail -3 | sed 's/^/           /' >&2
        refused=$((refused + 1))
    fi
done

log "pushed: $pushed  unchanged: $unchanged  dry/skipped: $skipped  refused: $refused"
if [ "$refused" -gt 0 ] && [ "$STRICT" = true ]; then exit 1; fi
exit 0
