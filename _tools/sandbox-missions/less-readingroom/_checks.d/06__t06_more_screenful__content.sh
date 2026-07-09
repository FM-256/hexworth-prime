#!/bin/sh
. /opt/mission/env.less-readingroom 2>/dev/null
test -f /home/student/$MISSION_DEPT/readingroom/visitors.txt && grep -qx "$MISSION_VISITOR_LINE" /home/student/$MISSION_DEPT/readingroom/visitors.txt
