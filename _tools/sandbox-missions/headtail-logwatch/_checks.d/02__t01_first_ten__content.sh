#!/bin/sh
. /opt/mission/env.headtail-logwatch 2>/dev/null
test "$(sha256sum /home/student/$MISSION_DEPT/logwatch/first10.txt | cut -d' ' -f1)" = "$MISSION_SHA_FIRST10"
