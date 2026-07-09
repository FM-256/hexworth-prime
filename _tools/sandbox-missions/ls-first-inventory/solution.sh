#!/bin/sh
# Canonical student solution for ls-first-inventory, run AS student in-container.
# Pure ls workflow (plus redirection), exactly as the briefs teach.
. /opt/mission/env.ls-first-inventory
cd "/home/student/$MISSION_DEPT" || exit 1
cat BRIEFING2.txt >/dev/null
ls archive            > reports/inventory.txt
ls -a archive         > reports/all.txt
ls -A archive | grep -c '^\.' > reports/hiddencount.txt
ls -S archive | head -1       > reports/largest.txt
ls -t archive | head -1       > reports/newest.txt
ls -tr archive | head -1      > reports/oldest.txt
ls -R archive         > reports/tree.txt
ls -r archive         > reports/reverse.txt
ls -d archive/*/      > reports/dirs.txt
ls -i archive | sort -n | awk '{print $1}' | uniq -d | head -1 > /tmp/dupinode
ls -i archive | awk -v d="$(cat /tmp/dupinode)" '$1==d {print $2}' > reports/twins.txt
rm -f /tmp/dupinode
echo "solution applied"
