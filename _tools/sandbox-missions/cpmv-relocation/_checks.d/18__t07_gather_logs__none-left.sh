#!/bin/sh
. /opt/mission/env.cpmv-relocation 2>/dev/null
test -z "$(find /home/student/$MISSION_DEPT/office_old -maxdepth 1 -name '*.log' -print -quit)"
