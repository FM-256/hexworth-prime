#!/bin/sh
. /opt/mission/env.ip-linecheck 2>/dev/null
test -f /home/student/$MISSION_DEPT/linecheck/lostate.txt && grep -qxE "UNKNOWN|UP" /home/student/$MISSION_DEPT/linecheck/lostate.txt
