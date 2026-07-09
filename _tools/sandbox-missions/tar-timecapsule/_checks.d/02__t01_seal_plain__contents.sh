#!/bin/sh
. /opt/mission/env.tar-timecapsule 2>/dev/null
test "$(tar -tf /home/student/$MISSION_DEPT/capsule/yearbook.tar | sort | sha256sum | cut -d' ' -f1)" = "$MISSION_SHA_YEARBOOK_LIST"
