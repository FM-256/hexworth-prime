#!/usr/bin/env bash
# Engine 1: give every team box its OWN credentials.
#
# THE PROBLEM. Every clone descends from one golden image, so all six shared an Administrator
# password AND a player password. The player password is PUBLISHED to students by design. On a
# flat network that means a student can SSH straight into another team's box with the password
# printed on their own challenge page, no exploitation required. Unique per-team credentials mean
# reaching another team's box requires re-exploiting it rather than just logging in.
#
# Key auth for Administrator is unaffected by a password change, so provisioning keeps working.
# CREATE ONLY: each team gets its own 0600 credential file; the shared one is left in place.
set -euo pipefail
BASE=/srv/hexworth/engine1
TEAM="${1:?usage: unique-creds.sh <team-suffix>}"
DOMAIN="engine1-team-$TEAM"
KEY=$BASE/config/engine1_id_ed25519

IP=$(sudo virsh domifaddr "$DOMAIN" 2>/dev/null | awk '/ipv4/{print $4}' | cut -d/ -f1)
[ -n "$IP" ] || { echo "  $TEAM: no address, skipped"; exit 0; }

CRED="$BASE/config/team-$TEAM.cred"
if [ ! -f "$CRED" ]; then
  umask 077
  { printf 'player %s\n' "$(tr -dc 'A-Za-z0-9' </dev/urandom | head -c 20)"
    printf 'Administrator %s\n' "$(tr -dc 'A-Za-z0-9' </dev/urandom | head -c 28)"; } > "$CRED"
  chmod 600 "$CRED"
fi
PPW=$(awk '/^player /{print $2}' "$CRED")
APW=$(awk '/^Administrator /{print $2}' "$CRED")

ssh -i "$KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o BatchMode=yes -o ConnectTimeout=25 \
  Administrator@"$IP" "cmd /c \"net user player $PPW && net user Administrator $APW\"" >/dev/null 2>&1

# Verify the NEW player password works and, more importantly, that the OLD shared one does not.
OLD=$(sed -n 2p "$BASE/config/engine1-player.cred")
NEWOK=$(sshpass -p "$PPW" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=20 \
        player@"$IP" "cmd /c echo NEW_OK" 2>/dev/null | tr -d '\r' | grep -c NEW_OK || true)
OLDOK=$(sshpass -p "$OLD" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=20 \
        player@"$IP" "cmd /c echo OLD_STILL_WORKS" 2>/dev/null | tr -d '\r' | grep -c OLD_STILL_WORKS || true)

if [ "$NEWOK" -ge 1 ] && [ "$OLDOK" -eq 0 ]; then
  echo "  $TEAM: unique credentials set. new password works, shared password REJECTED"
else
  echo "  $TEAM: PROBLEM new=$NEWOK old=$OLDOK (old must be 0)"
fi
