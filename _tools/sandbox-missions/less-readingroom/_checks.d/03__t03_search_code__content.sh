#!/bin/sh
. /opt/mission/env.less-readingroom 2>/dev/null
test -f /home/student/$MISSION_DEPT/readingroom/codeline.txt && grep -qx "$MISSION_CODE_LINE" /home/student/$MISSION_DEPT/readingroom/codeline.txt
