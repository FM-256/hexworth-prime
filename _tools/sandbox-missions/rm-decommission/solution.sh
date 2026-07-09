#!/bin/sh
# Canonical student solution for rm-decommission, run AS student in-container.
# Pure rm workflow: single file, precise wildcard, recursive dir, hidden file,
# empty-but-keep, and the -- end-of-options idiom for the dash-named trap file.
. /opt/mission/env.rm-decommission
cd "/home/student/$MISSION_DEPT/decommission" || exit 1
cat ../BRIEFING5.txt >/dev/null
rm scratch.tmp                 # t01
rm expired_*.cert              # t02 precise wildcard (active_ untouched)
rm -r old_builds               # t03 recursive
rm .cache_junk                 # t04 hidden junk
rm cache/*                     # t05 contents only, dir stays
rm -- -rf                      # t07 bonus: end-of-options marker
echo "solution applied"
