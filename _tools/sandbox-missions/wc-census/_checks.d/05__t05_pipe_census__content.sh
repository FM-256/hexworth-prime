#!/bin/sh
. /opt/mission/env.wc-census 2>/dev/null
test -f /home/student/$MISSION_DEPT/census/errorcount.txt && grep -qxE " *$MISSION_ERROR_COUNT" /home/student/$MISSION_DEPT/census/errorcount.txt
