#!/bin/sh
. /opt/mission/env.less-readingroom 2>/dev/null
test -f /home/student/$MISSION_DEPT/readingroom/line1500.txt && grep -qx "$MISSION_LINE_1500" /home/student/$MISSION_DEPT/readingroom/line1500.txt
