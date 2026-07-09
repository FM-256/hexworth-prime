#!/bin/sh
. /opt/mission/env.sortuniq-ledger 2>/dev/null
test -f /home/student/$MISSION_DEPT/ledger/billing_counts.txt && test "$(sha256sum /home/student/$MISSION_DEPT/ledger/billing_counts.txt | cut -d' ' -f1)" = "$MISSION_SHA_BCOUNTS"
