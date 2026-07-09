#!/bin/sh
. /opt/mission/env.sortuniq-ledger 2>/dev/null
test -f /home/student/$MISSION_DEPT/ledger/vendorcount.txt && grep -qx "$MISSION_VENDOR_COUNT" /home/student/$MISSION_DEPT/ledger/vendorcount.txt
