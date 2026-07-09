#!/bin/sh
. /opt/mission/env.rm-decommission 2>/dev/null
test -f /home/student/$MISSION_DEPT/decommission/keep/chain_of_custody.txt && test "$(sha256sum /home/student/$MISSION_DEPT/decommission/keep/chain_of_custody.txt | cut -d' ' -f1)" = "$MISSION_SHA_CUSTODY"
