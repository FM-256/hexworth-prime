#!/bin/bash
# SHIP A RULES/REGISTRY PAIR AS ONE GATED OPERATION.
#
# THE PROBLEM THIS SOLVES. firestore.rules and HubRegistry.js are a matched pair -- hub-registry-audit
# fails the deploy if their reserved-id sets disagree -- but they live in DIFFERENT deploy scopes.
# Rules go through the smoke wrapper; the registry goes through deploy.sh (hosting). So the pair
# cannot ship atomically, and the order is load-bearing:
#   rules first  -> a window where an id is over-reserved. Harmless.
#   hosting first-> a window where the live registry serves an id that production rules do NOT
#                   reserve, so an admin could create a dynamic hub shadowing it. That is precisely
#                   the failure the reserved list exists to prevent.
#
# WHY IT IS A SCRIPT AND NOT A CHECKLIST. Chris blocked the checklist version: my stated mechanism
# was "run the wrapper, then run the hosting deploy", which trusts step 1's exit code. The smoke
# wrapper is PROVABLY BLIND to rules content -- _tools/eduscan/smoke/run.js has /firebase/i and
# /firestore/i in IGNORED_ERROR_PATTERNS -- and hub-registry-audit runs only inside deploy.sh, never
# in the rules path. I had already built verify-deployed-rules.sh to close that exact hole and then
# left it out of the plan. A safety step that depends on me remembering it is not a safety step.
#
# usage: deploy-rules-pair.sh <marker> [holdout sha:path ...]
#   <marker> is the string that must appear in the DEPLOYED ruleset, e.g. "'api-capstone'"
set -u
cd "$(dirname "$0")/../.." || exit 1
MARK="${1:?usage: deploy-rules-pair.sh <marker> [sha:path ...]}"; shift
HOLD=("$@")

[ "$(git branch --show-current)" = "master" ] || { echo "REFUSED: not on master"; exit 1; }

echo "── [1/3] baseline: the marker must be ABSENT from live rules ──"
if bash _tools/deploy/verify-deployed-rules.sh "$MARK" 0; then
  echo "  baseline confirmed -- this deploy has something to prove"
else
  echo "  REFUSED: marker already live, or the check could not run. Nothing to verify against."
  exit 1
fi

echo ""
echo "── [2/3] deploy firestore:rules ONLY ──"
# Deliberately NOT firestore:indexes. firestore.indexes.json is clean vs HEAD but last changed
# 2026-07-21 and I cannot confirm from here that that version was ever deployed; including it would
# ship index changes nobody reviewed in this scope.
_tools/eduscan/smoke/deploy.sh --only firestore:rules || { echo "  rules deploy FAILED -- hosting NOT attempted"; exit 1; }

echo ""
echo "── [2.5/3] HARD GATE: confirm the rules are actually live ──"
# This is the step Chris blocked the plan for omitting. The CLI reporting success is the deployer
# reporting on itself; this reads what Google is serving.
if ! bash _tools/deploy/verify-deployed-rules.sh "$MARK" 1; then
  echo ""
  echo "  RULES NOT CONFIRMED LIVE. Hosting deploy REFUSED."
  echo "  Shipping the registry now would put an id live that production rules do not reserve."
  exit 1
fi

echo ""
echo "── [3/3] hosting deploy (registry half), with holdouts ──"
_tools/deploy/deploy-with-holdouts.sh "${HOLD[@]+"${HOLD[@]}"}" --
rc=$?
echo ""
[ $rc -eq 0 ] && echo "  PAIR SHIPPED: rules confirmed live, then registry." \
              || echo "  Rules are LIVE but the hosting half exited $rc -- the pair is HALF SHIPPED. That direction is the safe one (over-reserved), but finish it."
exit $rc
