#!/usr/bin/env bash
# Engine 1: mint a per-instance CSPRNG flag, inject it into the box, and emit the ONLY thing
# the platform needs to store (a salt and a hash).
#
# WHY THIS IS THE POINT OF A REAL BOX. Simulated boxes carry human-authored flags, and taskboard
# 401 is what that cost: every live tournament flag was a dictionary phrase or a string copied
# from its own public boxId, and all five were recovered from the published hashes. A real box
# can mint the flag at provision time from the CSPRNG, so there is nothing to guess, nothing
# reused from a box registry, and nothing an author can get wrong.
#
# The plaintext flag is written to the VM and to a 0600 file on bc2. It is never printed to a
# terminal, never committed, and never leaves the host.
set -euo pipefail
BASE=/srv/hexworth/engine1
DOMAIN="${1:-engine1-live-v1}"
SCENARIO="${2:-engine1_foothold}"
KEY=$BASE/config/engine1_id_ed25519

IP=$(sudo virsh domifaddr "$DOMAIN" 2>/dev/null | awk '/ipv4/{print $4}' | cut -d/ -f1)
[ -n "$IP" ] || { echo "no IP for $DOMAIN"; exit 1; }

# 128 bits of CSPRNG, hex, wrapped in the platform's flag shape.
RAND=$(head -c 16 /dev/urandom | od -An -tx1 | tr -d ' \n')
FLAG="flag{${SCENARIO}_${RAND}}"
SALT=$(head -c 16 /dev/urandom | od -An -tx1 | tr -d ' \n')
HASH="sha256:$(printf '%s' "$SALT:$FLAG" | sha256sum | cut -d' ' -f1)"

OUT=$BASE/config/flags
mkdir -p "$OUT"; chmod 700 "$OUT"
STAMP=$(date -u +%Y%m%dT%H%M%SZ)
umask 077
printf 'domain=%s\nscenario=%s\nflag=%s\nsalt=%s\nhash=%s\nminted=%s\n' \
  "$DOMAIN" "$SCENARIO" "$FLAG" "$SALT" "$HASH" "$STAMP" > "$OUT/$DOMAIN-$SCENARIO-$STAMP.flag"

# Inject. Placed where a Windows CTF flag plausibly lives rather than at the root of C:.
ssh -i "$KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o BatchMode=yes \
    -o ConnectTimeout=25 Administrator@"$IP" \
    "powershell -NoProfile -Command \"New-Item -ItemType Directory -Force -Path C:\\Hexworth\\loot | Out-Null; Set-Content -Path C:\\Hexworth\\loot\\proof.txt -Value '$FLAG' -Encoding ASCII; icacls C:\\Hexworth\\loot\\proof.txt /inheritance:r /grant 'Administrators:F' /grant 'SYSTEM:F' | Out-Null; Write-Output INJECTED\"" 2>/dev/null | tr -d '\r'

# Verify by reading it BACK out of the box and comparing hashes, not by trusting the write.
BACK=$(ssh -i "$KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o BatchMode=yes \
    Administrator@"$IP" "powershell -NoProfile -Command \"Get-Content C:\\Hexworth\\loot\\proof.txt\"" 2>/dev/null | tr -d '\r\n')
BACKHASH="sha256:$(printf '%s' "$SALT:$BACK" | sha256sum | cut -d' ' -f1)"

if [ "$BACKHASH" = "$HASH" ]; then
  echo "VERIFIED: the flag read back out of the box hashes to the registered value"
else
  echo "MISMATCH: what is on the box does not hash to the registered value. Do not register this."
  exit 1
fi

echo "--- register THIS, and only this, in tournaments/{tid}/flagSecrets/{chId} ---"
echo "flagSalt: $SALT"
echo "flagHash: $HASH"
echo "(plaintext stays in $OUT/$DOMAIN-$SCENARIO-$STAMP.flag, 0600, on bc2 only)"
