#!/usr/bin/env bash
# Engine 1: put an ALREADY-MINTED flag onto a team's instance and verify it by reading it back.
#
# Every team's box carries the SAME flag, because the platform stores one flagHash per CHALLENGE,
# not per team. Per-team flags would be stronger against one team simply telling another, and a
# real box could mint them trivially, but tournaments/{tid}/flagSecrets/{chId} has no per-team
# dimension. Recorded as a real limitation rather than pretended away.
set -euo pipefail
BASE=/srv/hexworth/engine1
DOMAIN="${1:?usage: inject-flag.sh <domain> <flagfile>}"
FLAGFILE="${2:?usage: inject-flag.sh <domain> <flagfile>}"
KEY=$BASE/config/engine1_id_ed25519

FLAG=$(grep '^flag=' "$FLAGFILE" | cut -d= -f2-)
SALT=$(grep '^salt=' "$FLAGFILE" | cut -d= -f2-)
HASH=$(grep '^hash=' "$FLAGFILE" | cut -d= -f2-)
[ -n "$FLAG" ] || { echo "no flag= line in $FLAGFILE"; exit 1; }

IP=$(sudo virsh domifaddr "$DOMAIN" 2>/dev/null | awk '/ipv4/{print $4}' | cut -d/ -f1)
[ -n "$IP" ] || { echo "$DOMAIN has no IP (is it running?)"; exit 1; }

ssh -i "$KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o BatchMode=yes -o ConnectTimeout=25 \
  Administrator@"$IP" "powershell -NoProfile -Command \"New-Item -ItemType Directory -Force -Path C:\\Hexworth\\loot | Out-Null; Set-Content -Path C:\\Hexworth\\loot\\proof.txt -Value '$FLAG' -Encoding ASCII; icacls C:\\Hexworth\\loot\\proof.txt /inheritance:r /grant 'Administrators:F' /grant 'SYSTEM:F' | Out-Null\"" >/dev/null 2>&1

# Verify against the MACHINE, not against the write returning success.
BACK=$(ssh -i "$KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o BatchMode=yes \
  Administrator@"$IP" "powershell -NoProfile -Command \"Get-Content C:\\Hexworth\\loot\\proof.txt\"" 2>/dev/null | tr -d '\r\n')
BACKHASH="sha256:$(printf '%s' "$SALT:$BACK" | sha256sum | cut -d' ' -f1)"
[ "$BACKHASH" = "$HASH" ] || { echo "$DOMAIN: MISMATCH, what is on the box does not hash to the registered value"; exit 1; }

# And the whole point: the starting account must NOT be able to read it.
PW=$(sed -n 2p "$BASE/config/engine1-player.cred")
DENIED=$(sshpass -p "$PW" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=20 \
  player@"$IP" "powershell -NoProfile -Command \"Get-Content C:\\Hexworth\\loot\\proof.txt\"" 2>&1 | grep -ci "denied" || true)
[ "$DENIED" -ge 1 ] || { echo "$DOMAIN: LEAK, the player account can read the flag"; exit 1; }

echo "$DOMAIN: flag present and hash-verified, and DENIED to the player account"
