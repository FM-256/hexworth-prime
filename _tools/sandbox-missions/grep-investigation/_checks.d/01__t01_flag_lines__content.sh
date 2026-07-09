#!/bin/sh
. /opt/mission/env.grep-investigation 2>/dev/null
test -f /home/student/$MISSION_DEPT/casework/failed.txt && test "$(sha256sum /home/student/$MISSION_DEPT/casework/failed.txt | cut -d' ' -f1)" = "$MISSION_SHA_FAILED"
