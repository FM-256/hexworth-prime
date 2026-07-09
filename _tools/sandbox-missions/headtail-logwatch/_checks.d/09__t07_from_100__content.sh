#!/bin/sh
. /opt/mission/env.headtail-logwatch 2>/dev/null
test -f /home/student/$MISSION_DEPT/logwatch/from100.txt && test "$(sha256sum /home/student/$MISSION_DEPT/logwatch/from100.txt | cut -d' ' -f1)" = "$MISSION_SHA_FROM100"
