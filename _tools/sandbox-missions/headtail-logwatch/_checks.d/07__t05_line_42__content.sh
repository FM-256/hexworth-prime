#!/bin/sh
. /opt/mission/env.headtail-logwatch 2>/dev/null
test -f /home/student/$MISSION_DEPT/logwatch/line42.txt && test "$(sha256sum /home/student/$MISSION_DEPT/logwatch/line42.txt | cut -d' ' -f1)" = "$MISSION_SHA_LINE42"
