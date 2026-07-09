#!/bin/sh
. /opt/mission/env.less-readingroom 2>/dev/null
test -f /home/student/$MISSION_DEPT/readingroom/revision.txt && grep -qx "$MISSION_LAST_LINE" /home/student/$MISSION_DEPT/readingroom/revision.txt
