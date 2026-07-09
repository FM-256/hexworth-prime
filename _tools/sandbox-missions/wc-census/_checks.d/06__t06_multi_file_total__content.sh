#!/bin/sh
. /opt/mission/env.wc-census 2>/dev/null
test -f /home/student/$MISSION_DEPT/census/quarter_totals.txt && test "$(sha256sum /home/student/$MISSION_DEPT/census/quarter_totals.txt | cut -d' ' -f1)" = "$MISSION_SHA_TOTALS"
