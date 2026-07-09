#!/bin/sh
. /opt/mission/env.grep-investigation 2>/dev/null
test "$(sha256sum /home/student/$MISSION_DEPT/casework/auth.log | cut -d' ' -f1)" = "$MISSION_SHA_AUTHLOG"
