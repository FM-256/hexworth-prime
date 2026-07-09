#!/bin/sh
. /opt/mission/env.sortuniq-ledger 2>/dev/null
test "$(sha256sum /home/student/$MISSION_DEPT/ledger/billing.txt | cut -d' ' -f1)" = "$MISSION_SHA_BILLING" && test "$(sha256sum /home/student/$MISSION_DEPT/ledger/vendors.txt | cut -d' ' -f1)" = "$MISSION_SHA_VENDORS"
