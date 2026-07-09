#!/bin/sh
. /opt/mission/env.grep-investigation 2>/dev/null
test -f /home/student/$MISSION_DEPT/casework/nighthours.txt && test "$(sha256sum /home/student/$MISSION_DEPT/casework/nighthours.txt | cut -d' ' -f1)" = "$MISSION_SHA_NIGHT"
