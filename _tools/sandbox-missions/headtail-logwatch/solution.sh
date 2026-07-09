#!/bin/sh
# Canonical student solution for headtail-logwatch, run AS student.
# Pure head/tail workflow including the head|tail line-42 classic.
. /opt/mission/env.headtail-logwatch
cd "/home/student/$MISSION_DEPT/logwatch" || exit 1
cat ../BRIEFING7.txt >/dev/null
head service.log > first10.txt
tail service.log > last10.txt
head -n 25 service.log > boot25.txt
tail -n 3 service.log > alert3.txt
head -n 42 service.log | tail -n 1 > line42.txt
head -n -20 service.log > trimmed.txt
tail -n +100 service.log > from100.txt
head -c 32 service.log > magic.txt
echo "solution applied"
