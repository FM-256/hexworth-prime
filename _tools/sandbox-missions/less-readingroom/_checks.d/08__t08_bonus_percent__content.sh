#!/bin/sh
. /opt/mission/env.less-readingroom 2>/dev/null
test -f /home/student/$MISSION_DEPT/readingroom/half.txt && grep -qx "$MISSION_CODE_HALF" /home/student/$MISSION_DEPT/readingroom/half.txt
