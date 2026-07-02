#!/bin/bash
# navigate/setup.sh — seeds the treasure-hunt tree in $WORKSPACE for $LEVEL.
set -eu
W="$WORKSPACE"
TOKEN=$(head -c 16 /dev/urandom | md5sum | cut -c1-12)
# The grader's answer is root-owned so casual `cat` can't shortcut the hunt.
sudo mkdir -p /opt/hexlab/answers
echo "$TOKEN" | sudo tee /opt/hexlab/answers/navigate.token > /dev/null
sudo chmod 600 /opt/hexlab/answers/navigate.token

mkdir -p "$W/vault/harbor" "$W/vault/lighthouse" "$W/vault/market/stalls"
echo "The map begins at the harbor. (cd, then look around: ls)" > "$W/START-HERE.txt"
echo "Salt air. A note says: the lighthouse keeper hides things in dotfiles." > "$W/vault/harbor/note.txt"
echo "Try: ls -a in the lighthouse." >> "$W/vault/harbor/note.txt"
printf "You found the hidden ledger.\nThe treasure sits in the market stalls, named treasure.txt\n" > "$W/vault/lighthouse/.ledger"

if [ "$LEVEL" -ge 2 ]; then
  # Level 2: three key files; only the newest is real. Decoys are backdated.
  echo "decoy" > "$W/vault/harbor/rusty.key";      touch -d '2 days ago' "$W/vault/harbor/rusty.key"
  echo "decoy" > "$W/vault/lighthouse/dusty.key";  touch -d '1 day ago'  "$W/vault/lighthouse/dusty.key"
  echo "HEXTOKEN:$TOKEN" > "$W/vault/market/stalls/bright.key"
  printf "Three keys exist, but only the NEWEST opens the chest.\nCopy the real key to ~/lab/found.txt\n" > "$W/vault/market/stalls/treasure.txt"
else
  printf "HEXTOKEN:%s\nCopy this whole file to ~/lab/found.txt (cp)\n" "$TOKEN" > "$W/vault/market/stalls/treasure.txt"
fi

echo ""
echo "LAB READY: Filesystem Treasure Hunt (level $LEVEL)"
echo "OBJECTIVE: follow the clues from ~/lab/START-HERE.txt and place the"
echo "           treasure (the file containing HEXTOKEN) at ~/lab/found.txt"
echo "Commands you'll meet: cd, ls (-a, -lt), cat, cp$([ "$LEVEL" -ge 2 ] && echo ', find')"
