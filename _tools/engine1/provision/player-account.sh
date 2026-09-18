#!/usr/bin/env bash
# Engine 1: create the unprivileged account a student's browser terminal lands in.
# The flag is readable ONLY by Administrators, so the player must actually escalate to reach it.
# That is the CTF: the account is the starting position, not the prize.
set -euo pipefail
BASE=/srv/hexworth/engine1
KEY=$BASE/config/engine1_id_ed25519
IP=$(sudo virsh domifaddr "${1:-engine1-live-v1}" 2>/dev/null | awk '/ipv4/{print $4}' | cut -d/ -f1)
CRED=$BASE/config/engine1-player.cred
if [ ! -f "$CRED" ]; then
  umask 077
  { printf 'player\n'; tr -dc 'A-Za-z0-9' </dev/urandom | head -c 24; printf '\n'; } > "$CRED"
  chmod 600 "$CRED"
fi
PW=$(sed -n 2p "$CRED")

ssh -i "$KEY" -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o BatchMode=yes \
    Administrator@"$IP" "powershell -NoProfile -Command \"
      if (-not (Get-LocalUser -Name player -ErrorAction SilentlyContinue)) {
        New-LocalUser -Name player -Password (ConvertTo-SecureString '$PW' -AsPlainText -Force) -PasswordNeverExpires -AccountNeverExpires | Out-Null
        Add-LocalGroupMember -Group 'Users' -Member player
        Add-LocalGroupMember -Group 'Remote Desktop Users' -Member player -ErrorAction SilentlyContinue
      }
      Write-Output ('player exists: ' + [bool](Get-LocalUser -Name player -ErrorAction SilentlyContinue))
      Write-Output ('player is an Administrator: ' + [bool]((Get-LocalGroupMember -Group Administrators).Name -match 'player'))
    \"" 2>/dev/null | tr -d '\r'

echo "=== prove the flag is NOT readable by the player (this is the whole game) ==="
sshpass -p "$PW" ssh -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=25 \
    player@"$IP" "powershell -NoProfile -Command \"try { Get-Content C:\\Hexworth\\loot\\proof.txt -ErrorAction Stop; 'LEAKED - THE FLAG IS READABLE BY THE PLAYER' } catch { 'DENIED as intended: ' + \$_.CategoryInfo.Category }\"" 2>/dev/null | tr -d '\r'
