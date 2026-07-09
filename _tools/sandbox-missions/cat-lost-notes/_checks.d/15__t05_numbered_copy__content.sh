#!/bin/sh
. /opt/mission/env.cat-lost-notes 2>/dev/null
test "$(sha256sum /home/student/$MISSION_DEPT/numbered.txt | cut -d' ' -f1)" = "$MISSION_SHA_NUMBERED"
