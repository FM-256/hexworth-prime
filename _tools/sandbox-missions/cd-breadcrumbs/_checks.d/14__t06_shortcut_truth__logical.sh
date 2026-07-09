#!/bin/sh
. /opt/mission/env.cd-breadcrumbs 2>/dev/null
test "$(sed -n 1p /home/student/$MISSION_DEPT/truth.txt)" = "/home/student/$MISSION_DEPT/campus/shortcut"
