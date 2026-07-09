#!/bin/sh
. /opt/mission/env.find-sweep 2>/dev/null
test "$(find /home/student/$MISSION_DEPT/sweep/projects -name 'settings.conf' | awk 'END{print NR}')" = "$MISSION_CONF_COUNT"
