#!/bin/sh
. /opt/mission/env.grep-investigation 2>/dev/null
test -f /home/student/$MISSION_DEPT/casework/suspectcount.txt && grep -qx "$MISSION_SUSPECT_COUNT" /home/student/$MISSION_DEPT/casework/suspectcount.txt
