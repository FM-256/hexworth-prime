#!/bin/sh
. /opt/mission/env.find-sweep 2>/dev/null
test -f /home/student/$MISSION_DEPT/sweep/swp_list.txt && test "$(sort /home/student/$MISSION_DEPT/sweep/swp_list.txt | sha256sum | cut -d' ' -f1)" = "$MISSION_SHA_SWP"
