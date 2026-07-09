#!/bin/sh
. /opt/mission/env.cpmv-relocation 2>/dev/null
test -f /home/student/$MISSION_DEPT/office_archive/ledger.csv && test "$(stat -c %Y /home/student/$MISSION_DEPT/office_archive/ledger.csv)" = "$(stat -c %Y /home/student/$MISSION_DEPT/office_old/ledger.csv)"
