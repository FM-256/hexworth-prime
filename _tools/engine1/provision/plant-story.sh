#!/usr/bin/env bash
# plant-story.sh — put the trail ON the machine, so the box teaches instead of assuming.
#
# @catalog what    Plants in-world onboarding + a ticket stub that lead a student to the privesc path
# @catalog run     sudo bash _tools/engine1/provision/plant-story.sh <ip> [--check]
# @catalog status  TOOL
#
# WHY THIS EXISTS. The simulated arena boxes all have scaffolding: a briefing page, a guided
# terminal, laddered hints. The real box had none. A student met a bare PS> prompt and a sentence
# telling them to escalate, which is a wall rather than a challenge for anyone who has not done
# Windows privesc before. The operator put it plainly: expecting a tournament competitor to know
# these commands is not realistic.
#
# AND IT FIXES A REAL DEFECT, not just the teaching. Measured 2026-09-22: `player` CANNOT enumerate
# the HexMaintenance task at all (schtasks returns "The system cannot find the path specified", and
# the task is absent from a full listing) because Windows only shows a standard user the tasks they
# own or are granted. So the documented first step of the intended path, and of solve.ps1, is
# impossible for the account that is supposed to perform it. The box was exploitable but not
# discoverable. An in-world note restores the trail WITHOUT loosening the task ACL, which is both
# more realistic and less of a security change to the image.
#
# WHAT IT PLANTS, and why each piece earns its place:
#   Desktop\README-FIRST.txt  orientation. Who you are, what the machine is, and the vocabulary to
#                             start with. It does NOT give the answer; it gives the words.
#   Desktop\TICKET-4471.txt   the trail. An IT ticket referring to the nightly maintenance script,
#                             which points at C:\Scripts without naming the vulnerability.
# Both are readable by player, which is the entire point, and neither contains the flag.
set -uo pipefail

IP="${1:?usage: plant-story.sh <ip> [--check]}"
CHECK=false
[ "${2:-}" = "--check" ] && CHECK=true
KEY=/srv/hexworth/engine1/config/engine1_id_ed25519

run_ps() { sudo timeout 60 ssh -i "$KEY" -o StrictHostKeyChecking=no -o BatchMode=yes -o ConnectTimeout=15 \
    "Administrator@$IP" "powershell -NoProfile -EncodedCommand $1" 2>&1 | tr -d '\r'; }

if [ "$CHECK" = true ]; then
    SCRIPT='$d="C:\Users\player\Desktop"
"readme=" + (Test-Path "$d\README-FIRST.txt")
"ticket=" + (Test-Path "$d\TICKET-4471.txt")
"banner=" + (Test-Path "C:\Users\player\Documents\WindowsPowerShell\Microsoft.PowerShell_profile.ps1")'
    run_ps "$(printf '%s' "$SCRIPT" | iconv -f utf-8 -t utf-16le | base64 -w0)" | grep -E '^(readme|ticket|banner)='
    exit 0
fi

# Written as a here-doc then encoded, because quoting this through bash -> ssh -> powershell by hand
# is how the earlier attempts got mangled into ampersand parser errors.
read -r -d '' SCRIPT <<'PSEOF'
$d = "C:\Users\player\Desktop"
New-Item -ItemType Directory -Force -Path $d | Out-Null

$readme = @"
ENGINE1 - JUNIOR ADMIN ONBOARDING
=================================

You have a shell on ENGINE1, a Windows Server 2022 machine, as the account 'player'.
This is a standard user account. It is not an administrator.

Your task: read C:\Hexworth\loot\proof.txt and submit what it contains.
Try it now. You will be denied, because that file is restricted to Administrators.
So the job is to become one.

IF YOU HAVE NOT DONE THIS BEFORE, START HERE. These commands tell you who you are and
what this machine is running. None of them change anything.

  whoami                        which account am I
  whoami /priv                  what privileges does this account hold
  whoami /groups                which groups am I in
  dir C:\                       what is on this disk that should not be
  icacls C:\SomeFolder          who is allowed to write to a folder
  type somefile.txt             read a file

The trick to almost every Windows escalation is the same shape: find something that runs
with MORE privilege than you, which YOU are allowed to modify. Then make it do something
on your behalf.

Look around. The previous admin left notes.
"@
Set-Content -Path "$d\README-FIRST.txt" -Value $readme -Encoding ASCII

$ticket = @"
HELPDESK TICKET #4471          STATUS: CLOSED (WONTFIX)
=======================================================
Opened by:   m.reyes (IT Operations)
Subject:     Nightly maintenance job noisy in event log

Notes:
  The maintenance job on this host runs automatically every couple of minutes and
  writes to the event log each time. It runs under a service account so it can clean
  temp directories that ordinary users cannot touch.

  The script it executes lives in C:\Scripts. Dev asked for write access to that
  folder during the rollout so they could patch the script without raising a change
  request, and it was granted to the Users group as a temporary measure.

  Temporary measure is now eighteen months old. Flagged to security twice.
  Closing as WONTFIX per ops lead - "it has never caused a problem".

  -- m.reyes
"@
Set-Content -Path "$d\TICKET-4471.txt" -Value $ticket -Encoding ASCII

# Readable by everyone, including player. These are meant to be found.
icacls "$d\README-FIRST.txt" /grant "Users:R" | Out-Null
icacls "$d\TICKET-4471.txt" /grant "Users:R" | Out-Null

# THE SHELL-LOAD BRIEFING. A student should not have to already know to look at the desktop: the
# machine has to say something the moment they arrive. This is deliberately THIN. It gives the
# objective and tells them material exists; it does NOT say where, because finding it is the first
# real act of the challenge. Detail lives in the files, orientation lives here.
$profDir = "C:\Users\player\Documents\WindowsPowerShell"
New-Item -ItemType Directory -Force -Path $profDir | Out-Null
$banner = @"
Write-Host ""
Write-Host "  ENGINE1" -ForegroundColor Cyan
Write-Host "  You are 'player' on a Windows Server 2022 host. Standard user. Not an admin."
Write-Host ""
Write-Host "  OBJECTIVE  read C:\Hexworth\loot\proof.txt and submit what it says."
Write-Host "             try it now. you will be refused. that refusal is the challenge."
Write-Host ""
Write-Host "  The admin who built this box was sloppy and left their paperwork behind."
Write-Host "  Look around. Read what you find. Nothing here is hidden, only unnoticed."
Write-Host ""
"@
Set-Content -Path "$profDir\Microsoft.PowerShell_profile.ps1" -Value $banner -Encoding ASCII
icacls "$profDir\Microsoft.PowerShell_profile.ps1" /grant "Users:R" | Out-Null
"planted=OK"
PSEOF

ENC=$(printf '%s' "$SCRIPT" | iconv -f utf-8 -t utf-16le | base64 -w0)
OUT=$(run_ps "$ENC")
echo "$OUT" | grep -qE 'planted=OK' && echo "  $IP: story planted" || { echo "  $IP: FAILED"; echo "$OUT" | tail -3; exit 1; }
