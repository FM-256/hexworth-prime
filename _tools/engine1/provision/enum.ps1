"whoami: " + (whoami)
""
"--- privileges held by this account ---"
whoami /priv | Select-String "Se" | ForEach-Object { "  " + $_.Line.Trim() }
""
"--- local group memberships ---"
foreach ($g in @("Administrators","Users","Remote Desktop Users")) {
  $m = (Get-LocalGroupMember -Group $g -ErrorAction SilentlyContinue | ForEach-Object { $_.Name }) -join ", "
  "  {0}: {1}" -f $g, $m
}
""
"--- classic escalation checks ---"
$aie = (Get-ItemProperty "HKLM:\SOFTWARE\Policies\Microsoft\Windows\Installer" -Name AlwaysInstallElevated -ErrorAction SilentlyContinue).AlwaysInstallElevated
"  AlwaysInstallElevated: " + $(if ($null -eq $aie) { "not set" } else { $aie })
$unq = Get-CimInstance Win32_Service | Where-Object { $_.PathName -and $_.PathName -notmatch '^"' -and $_.PathName -match ' ' -and $_.PathName -notmatch '^C:\\Windows' }
"  unquoted service paths outside C:\Windows: " + $(if ($unq) { ($unq.Name -join ", ") } else { "none" })
$auto = Get-CimInstance Win32_Service | Where-Object { $_.StartMode -eq "Auto" -and $_.PathName -notmatch '^C:\\Windows' }
"  non-Windows auto-start services: " + $(if ($auto) { ($auto.Name -join ", ") } else { "none" })
""
"--- can the player write anywhere interesting? ---"
foreach ($p in @("C:\Hexworth","C:\Program Files","C:\Windows\System32","C:\")) {
  $can = $false
  try { $t = Join-Path $p ([guid]::NewGuid().ToString()+".t"); New-Item $t -ItemType File -ErrorAction Stop | Out-Null; Remove-Item $t -Force; $can = $true } catch {}
  "  writable {0}: {1}" -f $p, $can
}
""
"--- the flag ---"
try { Get-Content C:\Hexworth\loot\proof.txt -ErrorAction Stop; "  READABLE BY PLAYER - THIS WOULD BE A LEAK" }
catch { "  not readable by player (correct)" }
