#!/usr/bin/env bash
# Engine 1: make a team clone actually playable.
#
# WHY THIS EXISTS. The golden image was frozen BEFORE the player account and the flag existed, so
# a fresh clone has neither. An end-to-end test caught it the only way it could be caught: the
# player SSH returned "Permission denied" and the flag file read back as length 0. Nothing about
# the clone looked wrong from the host side; it booted and answered.
#
# So a clone is NOT tournament-ready on creation. It is ready after this runs, and this verifies
# both properties against the machine rather than trusting the writes.
set -euo pipefail
BASE=/srv/hexworth/engine1
TEAM_DOMAIN="${1:?usage: prepare-clone.sh <domain> <flagfile>}"
FLAGFILE="${2:?usage: prepare-clone.sh <domain> <flagfile>}"

# Idempotent on purpose: this is run repeatedly while wiring a tournament, and an
# already-running domain is a normal state, not an error. The previous form aborted the whole
# script under set -e when virsh said "Domain is already active".
if ! sudo virsh domstate "$TEAM_DOMAIN" 2>/dev/null | grep -q running; then
  echo "starting $TEAM_DOMAIN"
  sudo virsh start "$TEAM_DOMAIN" >/dev/null 2>&1 || true
  sleep 60
fi
for i in $(seq 1 12); do
  IP=$(sudo virsh domifaddr "$TEAM_DOMAIN" 2>/dev/null | awk '/ipv4/{print $4}' | cut -d/ -f1)
  [ -n "$IP" ] && break; sleep 15
done
[ -n "$IP" ] || { echo "$TEAM_DOMAIN never took an address"; exit 1; }
echo "$TEAM_DOMAIN at $IP"

bash "$BASE/provision/player-account.sh" "$TEAM_DOMAIN" >/dev/null 2>&1 || true
# The GOLDEN has neither the player account nor the vulnerability: it was frozen before both
# existed. A clone is therefore not playable until all three of these have run. Verified the only
# way it could be: a fresh clone refused the player SSH outright and read the flag back as length 0.
ssh -i "$BASE/config/engine1_id_ed25519" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null \
    -o BatchMode=yes Administrator@"$IP" "powershell -NoProfile -Command -" < "$BASE/provision/install-vuln.ps1" >/dev/null 2>&1
echo "  escalation path installed"
bash "$BASE/provision/inject-flag.sh" "$TEAM_DOMAIN" "$FLAGFILE"

# The gate that decides whether a student can play at all.
# Per-team credential if one exists, else the shared one. Teams got unique passwords once it
# became clear a published shared password plus a flat network let any student log into another
# team's box without exploiting anything.
TEAMSUFFIX="${TEAM_DOMAIN#engine1-team-}"
TEAMCRED="$BASE/config/team-$TEAMSUFFIX.cred"
if [ -f "$TEAMCRED" ]; then PW=$(awk '/^player /{print $2}' "$TEAMCRED"); else PW=$(sed -n 2p "$BASE/config/engine1-player.cred"); fi
OUT=$(sshpass -p "$PW" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=25 \
  player@"$IP" "powershell -NoProfile -Command \"whoami\"" 2>&1 | tr -d '\r' | grep -i player || true)
[ -n "$OUT" ] && echo "$TEAM_DOMAIN: player CAN log in ($OUT)" || { echo "$TEAM_DOMAIN: player CANNOT log in, not playable"; exit 1; }
