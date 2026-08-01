#!/bin/bash
# Read the LIVE Firestore ruleset from the Rules REST API and check it for a marker.
#
# WHY THIS EXISTS. A firestore:rules deploy has no browser check and no post-verify step -- the only
# receipt is the CLI saying it succeeded. That is the deployer reporting on itself. This reads what
# Google is actually serving.
#
# The quota-project header is load-bearing. Without it the API returns 403 with an ADC/quota message,
# and a naive parser reads that as "releases: 0" -- which is how I first read it, a swallowed error
# dressed up as a clean result.
#
# usage: verify-deployed-rules.sh <marker> [expect-present:1|0]
set -u
MARK="${1:?usage: verify-deployed-rules.sh <marker> [1|0]}"
WANT="${2:-1}"
ACC=$(gcloud auth print-access-token 2>/dev/null | head -1)
[ -n "$ACC" ] || { echo "  no gcloud access token -- cannot verify deployed rules"; exit 2; }
H=(-H "Authorization: Bearer $ACC" -H "x-goog-user-project: hexworth-prime")
REL=$(curl -s "${H[@]}" "https://firebaserules.googleapis.com/v1/projects/hexworth-prime/releases")
NAME=$(printf '%s' "$REL" | python3 -c "
import sys,json
d=json.load(sys.stdin)
if 'error' in d: print(''); raise SystemExit
r=d.get('releases',[])
print(r[0]['rulesetName'] if r else '')")
[ -n "$NAME" ] || { echo "  could not read the live release (403? check the quota-project header)"; exit 2; }
printf '  live ruleset : %s\n' "${NAME##*/}"
printf '  released     : %s\n' "$(printf '%s' "$REL" | python3 -c "import sys,json;print(json.load(sys.stdin)['releases'][0].get('updateTime','?'))")"
# Marker goes through the ENVIRONMENT, never string interpolation. The marker contains single
# quotes ('api-capstone'), which broke a triple-quoted literal and made this script error on BOTH
# a present and an absent marker -- reporting MISMATCH either way. That looked like a working
# detector when I "tested" it, because a check that always fails passes a fail-test.
FOUND=$(MARK="$MARK" curl -s "${H[@]}" "https://firebaserules.googleapis.com/v1/$NAME" | MARK="$MARK" python3 -c "
import sys,json,os
d=json.load(sys.stdin)
if 'error' in d:
    print('ERR'); raise SystemExit
c=''.join(f.get('content','') for f in d.get('source',{}).get('files',[]))
print('1' if os.environ['MARK'] in c else '0')")
printf '  marker %-22s in DEPLOYED rules: %s (expected %s)\n' "$MARK" "$FOUND" "$WANT"
[ "$FOUND" = "$WANT" ] && { echo "  OK"; exit 0; } || { echo "  MISMATCH"; exit 1; }
