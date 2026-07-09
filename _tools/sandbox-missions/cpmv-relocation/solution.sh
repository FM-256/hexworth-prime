#!/bin/sh
# Canonical student solution for cpmv-relocation, run AS student in-container.
# Pure cp/mv workflow exactly as the work orders teach.
. /opt/mission/env.cpmv-relocation
cd "/home/student/$MISSION_DEPT" || exit 1
cat BRIEFING4.txt >/dev/null
cp office_old/master_list.txt office_new/                       # t01 copy
mv office_old/drafts/proposal.txt office_new/                   # t02 move
mv office_old/report_finel.txt office_old/report_final.txt      # t03 rename
cp -r office_old/assets office_new/assets                       # t04 recursive copy
cp -p office_old/ledger.csv office_new/ledger.csv               # t05 preserve mtime
cp office_new/config.ini /tmp/keep_new.ini                      # t06: new wins, old kept as .bak
cp office_old/config.ini office_new/config.ini.bak
cp /tmp/keep_new.ini office_new/config.ini && rm -f /tmp/keep_new.ini
mv office_old/*.log office_new/logs/                            # t07 wildcard sweep
cp -a office_old office_archive                                 # t09 bonus archive mode
echo "solution applied"
