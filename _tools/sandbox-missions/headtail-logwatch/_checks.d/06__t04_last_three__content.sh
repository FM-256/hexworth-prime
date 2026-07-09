#!/bin/sh
. /opt/mission/env.headtail-logwatch 2>/dev/null
test -f /home/student/$MISSION_DEPT/logwatch/alert3.txt && test "$(sha256sum /home/student/$MISSION_DEPT/logwatch/alert3.txt | cut -d' ' -f1)" = "$MISSION_SHA_ALERT3"
