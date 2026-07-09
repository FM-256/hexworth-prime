#!/bin/sh
. /opt/mission/env.chown-handover 2>/dev/null
test -f /home/student/$MISSION_DEPT/handover/proof.txt && test "$(sha256sum /home/student/$MISSION_DEPT/handover/proof.txt | cut -d' ' -f1)" = "$MISSION_SHA_NIGHTLY"
