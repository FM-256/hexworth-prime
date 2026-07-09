#!/bin/sh
. /opt/mission/env.cat-lost-notes 2>/dev/null
test -f /home/student/$MISSION_DEPT/reversed.txt && test "$(sha256sum /home/student/$MISSION_DEPT/reversed.txt | cut -d' ' -f1)" = "$MISSION_SHA_REVERSED"
