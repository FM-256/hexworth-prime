#!/bin/sh
. /opt/mission/env.ls-first-inventory 2>/dev/null
test -z "$(find /home/student/$MISSION_DEPT/reports -maxdepth 1 \( -name '*.tmp' -o -name '*.bak' -o -name 'scratch*' \) -print -quit)"
