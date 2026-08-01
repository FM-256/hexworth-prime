#!/bin/bash
# POST-DEPLOY VERIFICATION for the 2026-08-01 ship.
# Every line is a BASELINE THAT MUST INVERT, captured from production BEFORE the deploy. A check
# that could not have failed proves nothing, so each of these was a known value beforehand and the
# expected value is the opposite of it.
# The last one is the inverse: a HOLDOUT that must NOT move.
set -u
P=https://hexworth.com
pass=0; fail=0
chk() {  # label  url  pattern  before  expect
  n=$(curl -s "$P$2" | grep -c "$3")
  if [ "$n" = "$5" ]; then
    printf '  OK    %-46s %s -> %s\n' "$1" "$4" "$n"; pass=$((pass+1))
  else
    printf '  FAIL  %-46s %s -> %s (expected %s)\n' "$1" "$4" "$n" "$5"; fail=$((fail+1))
  fi
}
echo "── post-deploy verification, 2026-08-01 ──"
chk "feh-09 credit button ships disabled"  "/houses/dark-arts/labs/dark-arts-feh-09.lab.html" 'id="c0"[^>]*disabled' 0 1
chk "ms102-ch05 free door removed"         "/houses/cloud/ms-102/labs/ms102-ch05-exchange.lab.html" '<button[^>]*>[^<]*Mark Reviewed' 1 0
chk "pl300-ch04 time guard is exact"       "/houses/cloud/pl-300/labs/pl300-ch04-deploy.lab.html" '6:00am' 0 1
chk "HubRegistry: 11 cloud-master children" "/components/HubRegistry.js" "parent: 'cloud-master'" 6 11
chk "tourist banner is sticky"             "/components/tourist-badge.css" 'position: sticky' 0 1
chk "tourist notice split from silent"     "/components/TouristVisa.js" 'function wrapNotify' 0 1
echo "  ── holdouts: these must NOT have shipped ──"
chk "HOLDOUT incubator card absent"        "/houses/cloud/incubator/index.html" 'cloud-practitioner-final' 0 0
chk "HOLDOUT openstack capstone link absent" "/houses/cloud/openstack/index.html" 'project-iac' 0 0
echo ""
echo "  $pass passed, $fail failed."
[ "$fail" -eq 0 ] || exit 1
