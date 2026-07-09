#!/bin/sh
. /opt/mission/env.chmod-lockdown 2>/dev/null
test "$(sha256sum /home/student/$MISSION_DEPT/lockdown/payroll.csv | cut -d' ' -f1)" = "$MISSION_SHA_PAYROLL"
