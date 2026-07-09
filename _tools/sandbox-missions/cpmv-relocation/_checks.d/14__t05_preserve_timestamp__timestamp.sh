#!/bin/sh
. /opt/mission/env.cpmv-relocation 2>/dev/null
test "$(stat -c %Y /home/student/$MISSION_DEPT/office_new/ledger.csv)" = "$(stat -c %Y /home/student/$MISSION_DEPT/office_old/ledger.csv)"
