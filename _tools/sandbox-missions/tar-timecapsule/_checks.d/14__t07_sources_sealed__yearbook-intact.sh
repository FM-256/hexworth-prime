#!/bin/sh
. /opt/mission/env.tar-timecapsule 2>/dev/null
test -f /home/student/$MISSION_DEPT/capsule/yearbook/awards.txt && test "$(sha256sum /home/student/$MISSION_DEPT/capsule/yearbook/awards.txt | cut -d' ' -f1)" = "$MISSION_SHA_AWARDS"
