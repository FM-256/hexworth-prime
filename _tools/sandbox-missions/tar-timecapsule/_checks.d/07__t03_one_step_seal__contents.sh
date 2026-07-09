#!/bin/sh
. /opt/mission/env.tar-timecapsule 2>/dev/null
test "$(tar -tzf /home/student/$MISSION_DEPT/capsule/ledgers.tgz | sort | sha256sum | cut -d' ' -f1)" = "$MISSION_SHA_LEDGERS_LIST"
