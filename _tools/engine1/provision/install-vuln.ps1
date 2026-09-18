# Engine 1 scenario "foothold": the intended escalation path.
#
# A scheduled task runs as SYSTEM every two minutes and executes a script from C:\Scripts, a
# directory the Users group can write to. That is a real and common Windows misconfiguration:
# the task is privileged, the code it runs is not protected.
#
# Intended student path:
#   1. enumerate scheduled tasks, notice one running as SYSTEM
#   2. read the task action, see it points at C:\Scripts\maintenance.ps1
#   3. check the ACL on that path, find Users can write
#   4. replace the script with something that grants their account membership of Administrators
#   5. wait for the task to fire, then read the flag
$ErrorActionPreference = "Stop"

New-Item -ItemType Directory -Force -Path C:\Scripts | Out-Null

# Deliberately weak: Users may write here. This is the vulnerability, and it is the only one.
icacls C:\Scripts /grant "Users:(OI)(CI)M" | Out-Null

Set-Content -Path C:\Scripts\maintenance.ps1 -Encoding ASCII -Value @'
# Nightly housekeeping. Runs as SYSTEM under the HexMaintenance task.
$log = "C:\Scripts\maintenance.log"
Add-Content -Path $log -Value ("ran " + (Get-Date -Format o))
Get-ChildItem C:\Windows\Temp -ErrorAction SilentlyContinue |
  Where-Object { $_.LastWriteTime -lt (Get-Date).AddDays(-7) } |
  ForEach-Object { Add-Content -Path $log -Value ("stale: " + $_.Name) }
'@

$action  = New-ScheduledTaskAction -Execute "powershell.exe" `
           -Argument "-NoProfile -ExecutionPolicy Bypass -File C:\Scripts\maintenance.ps1"
$trigger = New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) `
           -RepetitionInterval (New-TimeSpan -Minutes 2)
$set     = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable

Register-ScheduledTask -TaskName "HexMaintenance" -Action $action -Trigger $trigger `
  -Settings $set -User "SYSTEM" -RunLevel Highest -Force | Out-Null

# THE DISCOVERY FIX. By default a non-admin cannot see this task at all: schtasks /query is
# refused and C:\Windows\System32\Tasks\HexMaintenance is unreadable. Measured on a clean clone,
# where both routes failed for the player while they appeared to work on a box that had ALREADY
# been compromised, which is how the gap hid. Without this, the intended first step of the path,
# find a privileged task, is impossible and the box teaches nothing about task enumeration.
# READ only: the task can be observed, never modified.
icacls C:\Windows\System32\Tasks\HexMaintenance /grant "Users:(R)" | Out-Null

"installed: HexMaintenance runs as SYSTEM every 2 minutes"
"task definition readable by Users, so the path is discoverable"
"script:    C:\Scripts\maintenance.ps1"
(icacls C:\Scripts | Select-Object -First 4) -join "`n"
