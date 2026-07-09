#!/bin/sh
# Canonical student solution for tar-timecapsule, run AS student.
# tar -cf, gzip -k, tar -czf, tar -tzf, -x -C aim, single-member rescue, gzip -l.
. /opt/mission/env.tar-timecapsule
cd "/home/student/$MISSION_DEPT/capsule" || exit 1
cat ../BRIEFING15.txt >/dev/null
tar -cf yearbook.tar yearbook                          # t01
cp yearbook.tar yearbook_copy.tar && gzip yearbook_copy.tar   # t02 keep both
tar -czf ledgers.tgz ledgers                           # t03 one-step
tar -tzf mystery_2021.tgz > manifest.txt               # t04 inspect first
tar -xzf mystery_2021.tgz -C opened                    # t05 aimed extract
tar -xzf mystery_2021.tgz -C rescued vault_2021/note_to_future.txt  # t06 single member
gzip -l yearbook_copy.tar.gz | awk 'NR==2{print $2}' > truesize.txt  # t08 bonus
echo "solution applied"
