#!/usr/bin/env bash
# @catalog what   Set who may reach Engine 1 (the real Windows CTF box) through Cloudflare Access.
# @catalog run    _tools/engine1/roster-open.sh --show | --emails <file> | --domain <example.edu>
# @catalog status TOOL
#
# WHY THIS EXISTS. "Open it to the tournament roster" cannot be done automatically: the roster is
# Firestore team members, which are 28-character Firebase UIDs, and Cloudflare Access can only
# authenticate an EMAIL (one-time PIN is the only IdP configured on this account). A Firebase UID
# is not an Access subject, and most platform accounts are anonymous, so they have no email at
# all. There is no bridge between the two identity systems, so a human supplies the list.
#
# This script makes that a single reviewable command instead of a console session, and it always
# prints the BEFORE and AFTER so a widening is visible rather than silent.
set -euo pipefail
TOKEN_FILE=${CF_TOKEN_FILE:-$HOME/.config/cloudflare/api-token-access}
ACC=af73bd3dafe10892de47e21accf6281a
APPID=cca0d412-4ad7-48e0-80a9-c0835bdceebf
TOKEN=$(tr -d '\n\r' < "$TOKEN_FILE")
API="https://api.cloudflare.com/client/v4/accounts/$ACC/access/apps/$APPID/policies"

show() {
  curl -s "$API" -H "Authorization: Bearer $TOKEN" | python3 -c "
import json,sys
d=json.load(sys.stdin)
for p in d.get('result',[]):
    inc=p.get('include',[])
    print(f\"  policy '{p['name']}' decision={p['decision']} with {len(inc)} rule(s):\")
    for i in inc:
        k=list(i.keys())[0]; v=list(i[k].values())[0] if isinstance(i[k],dict) else i[k]
        print(f'    - {k}: {v}')
"
}

case "${1:-}" in
  --show) echo "Engine 1 access, as it stands:"; show ;;
  --emails)
    FILE="${2:?--emails needs a file, one address per line}"
    [ -f "$FILE" ] || { echo "no such file: $FILE"; exit 1; }
    mapfile -t ADDRS < <(grep -vE '^\s*(#|$)' "$FILE")
    [ "${#ADDRS[@]}" -gt 0 ] || { echo "$FILE has no addresses"; exit 1; }
    echo "BEFORE:"; show
    INC=$(printf '%s\n' "${ADDRS[@]}" | python3 -c "
import json,sys
print(json.dumps([{'email':{'email':a.strip()}} for a in sys.stdin if a.strip()]))
")
    PID=$(curl -s "$API" -H "Authorization: Bearer $TOKEN" | python3 -c "import json,sys;print(json.load(sys.stdin)['result'][0]['id'])")
    curl -s -X PUT "$API/$PID" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
      --data "{\"name\":\"tournament-roster\",\"decision\":\"allow\",\"include\":$INC,\"require\":[],\"exclude\":[]}" \
      | python3 -c "import json,sys; d=json.load(sys.stdin); print('update ok:', d.get('success')) or [print('  error:',e) for e in d.get('errors',[])]"
    echo "AFTER:"; show
    echo "Each address receives a one-time PIN at that mailbox. Revoke by re-running with a shorter list."
    ;;
  --domain)
    DOM="${2:?--domain needs a domain, e.g. school.edu}"
    echo "WIDENING TO AN ENTIRE DOMAIN: anyone with an address at @$DOM will reach a machine that is"
    echo "deliberately vulnerable. That is broader than a roster. Ctrl-C now if that is not intended."
    sleep 5
    echo "BEFORE:"; show
    PID=$(curl -s "$API" -H "Authorization: Bearer $TOKEN" | python3 -c "import json,sys;print(json.load(sys.stdin)['result'][0]['id'])")
    curl -s -X PUT "$API/$PID" -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
      --data "{\"name\":\"tournament-roster\",\"decision\":\"allow\",\"include\":[{\"email_domain\":{\"domain\":\"$DOM\"}}],\"require\":[],\"exclude\":[]}" \
      | python3 -c "import json,sys; d=json.load(sys.stdin); print('update ok:', d.get('success')) or [print('  error:',e) for e in d.get('errors',[])]"
    echo "AFTER:"; show
    ;;
  *) sed -n '2,20p' "$0"; echo; echo "Current state:"; show ;;
esac
