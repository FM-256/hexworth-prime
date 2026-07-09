#!/bin/sh
. /opt/mission/env.find-sweep 2>/dev/null
test "$(sha256sum /home/student/$MISSION_DEPT/sweep/projects/portal/settings.conf | cut -d' ' -f1)" = "$MISSION_SHA_PORTALCONF"
