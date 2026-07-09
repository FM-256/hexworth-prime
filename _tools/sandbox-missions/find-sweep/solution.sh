#!/bin/sh
# Canonical student solution for find-sweep, run AS student.
# Pure find workflow: -name, quoted patterns, -type, -size, -perm, -empty,
# -delete action, pipe to wc, -mtime.
. /opt/mission/env.find-sweep
cd "/home/student/$MISSION_DEPT/sweep" || exit 1
cat ../BRIEFING12.txt >/dev/null
find projects -name settings.conf > conf_list.txt
find projects -name '*.swp' > swp_list.txt
find projects -type d > dir_list.txt
find projects -type f -size +100k > big_list.txt
find projects -type f -perm -002 > danger_list.txt
find projects -type f -empty > empty_list.txt
find projects -type f -mtime -1 > recent_list.txt   # bonus BEFORE the delete (recent set unchanged by it)
find projects -name '*.swp' -delete
find projects -type f | wc -l > filecount.txt
echo "solution applied"
