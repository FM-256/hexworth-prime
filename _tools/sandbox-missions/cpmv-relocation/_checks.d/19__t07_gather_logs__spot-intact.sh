#!/bin/sh
. /opt/mission/env.cpmv-relocation 2>/dev/null
test "$(sha256sum /home/student/$MISSION_DEPT/office_new/logs/access_1.log | cut -d' ' -f1)" = "$MISSION_SHA_LOG1"
