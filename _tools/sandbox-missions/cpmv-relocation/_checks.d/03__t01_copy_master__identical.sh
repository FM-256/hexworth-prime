#!/bin/sh
. /opt/mission/env.cpmv-relocation 2>/dev/null
test "$(sha256sum /home/student/$MISSION_DEPT/office_new/master_list.txt | cut -d' ' -f1)" = "$MISSION_SHA_MASTER"
