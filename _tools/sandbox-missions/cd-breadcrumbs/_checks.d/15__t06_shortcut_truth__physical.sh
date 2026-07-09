#!/bin/sh
. /opt/mission/env.cd-breadcrumbs 2>/dev/null
test "$(sed -n 2p /home/student/$MISSION_DEPT/truth.txt)" = "/home/student/$MISSION_DEPT/campus/$MISSION_WING-wing/floor2/suite_b/server_room"
