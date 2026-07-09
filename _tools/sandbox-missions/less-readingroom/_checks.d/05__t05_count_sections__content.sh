#!/bin/sh
. /opt/mission/env.less-readingroom 2>/dev/null
test -f /home/student/$MISSION_DEPT/readingroom/sectioncount.txt && grep -qx "$MISSION_SECTION_COUNT" /home/student/$MISSION_DEPT/readingroom/sectioncount.txt
