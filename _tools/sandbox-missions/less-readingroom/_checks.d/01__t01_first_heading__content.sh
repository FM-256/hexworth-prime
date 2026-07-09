#!/bin/sh
. /opt/mission/env.less-readingroom 2>/dev/null
test -f /home/student/$MISSION_DEPT/readingroom/title.txt && grep -qx "$MISSION_TITLE_LINE" /home/student/$MISSION_DEPT/readingroom/title.txt
