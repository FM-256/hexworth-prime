#!/bin/sh
. /opt/mission/env.wc-census 2>/dev/null
test -f /home/student/$MISSION_DEPT/census/banner_width.txt && grep -qxE " *$MISSION_BANNER_WIDTH" /home/student/$MISSION_DEPT/census/banner_width.txt
