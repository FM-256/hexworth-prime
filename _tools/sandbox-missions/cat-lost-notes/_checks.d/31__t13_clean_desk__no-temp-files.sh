#!/bin/sh
. /opt/mission/env.cat-lost-notes 2>/dev/null
test -z "$(find /home/student/$MISSION_DEPT -maxdepth 1 -name '*.tmp' -print -quit)"
