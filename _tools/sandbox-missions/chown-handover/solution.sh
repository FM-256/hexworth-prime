#!/bin/sh
# Canonical student solution for chown-handover, run AS student (sudo in-box).
# chown owner, :group only, owner:group, -R tree, sudo -u proof, --reference.
. /opt/mission/env.chown-handover
cd "/home/student/$MISSION_DEPT/handover" || exit 1
cat ../BRIEFING14.txt >/dev/null
sudo chown aday analysis.txt                          # t01
sudo chown :analysts shared_notes.txt                 # t02 group only
sudo chown reportd:analysts nightly.dat               # t03 both
sudo chown -R aday:analysts aday_workspace            # t04 tree
sudo -u reportd cat nightly.dat > proof.txt           # t05 proof as service acct
sudo chown --reference=nightly.dat template.txt       # t07 bonus
echo "solution applied"
