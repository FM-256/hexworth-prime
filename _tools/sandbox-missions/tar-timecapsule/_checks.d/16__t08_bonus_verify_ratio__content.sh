#!/bin/sh
. /opt/mission/env.tar-timecapsule 2>/dev/null
test -f /home/student/$MISSION_DEPT/capsule/truesize.txt && grep -qx "$MISSION_TAR_BYTES" /home/student/$MISSION_DEPT/capsule/truesize.txt
