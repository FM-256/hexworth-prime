#!/bin/sh
. /opt/mission/env.sortuniq-ledger 2>/dev/null
test -f /home/student/$MISSION_DEPT/ledger/top3.txt && test "$(sha256sum /home/student/$MISSION_DEPT/ledger/top3.txt | cut -d' ' -f1)" = "$MISSION_SHA_TOP3"
