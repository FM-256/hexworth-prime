#!/bin/sh
. /opt/mission/env.ip-linecheck 2>/dev/null
test "$(sha256sum /home/student/$MISSION_DEPT/BRIEFING18.txt | cut -d' ' -f1)" = "$MISSION_SHA_BRIEFING"
