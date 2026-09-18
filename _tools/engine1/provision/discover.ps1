"ROUTE A - list the drive root"
try { (Get-ChildItem C:\ -Directory -ErrorAction Stop | Where-Object { $_.Name -match "Scripts|Hexworth" } | ForEach-Object { "  visible: C:\" + $_.Name }) } catch { "  denied" }

"ROUTE B - read the maintenance script (does it name the task?)"
try { Get-Content C:\Scripts\maintenance.ps1 -ErrorAction Stop | Select-Object -First 4 | ForEach-Object { "  " + $_ } } catch { "  denied: " + $_.Exception.GetType().Name }

"ROUTE C - check the ACL on the script directory"
try { (icacls C:\Scripts 2>&1 | Select-Object -First 3) | ForEach-Object { "  " + $_ } } catch { "  denied" }

"ROUTE D - schtasks, full list filtered"
$o = schtasks /query /fo LIST 2>&1
if ($o -match "HexMaintenance") { "  FOUND via schtasks list" } else { "  not found via schtasks list (first line: " + ($o | Select-Object -First 1) + ")" }

"ROUTE E - the task definition file on disk"
try { Get-Content C:\Windows\System32\Tasks\HexMaintenance -ErrorAction Stop | Select-String "UserId|Command|Arguments" | ForEach-Object { "  " + $_.Line.Trim() } } catch { "  denied: " + $_.Exception.GetType().Name }

"ROUTE F - registry task cache"
try { (Get-ChildItem "HKLM:\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Schedule\TaskCache\Tree" -ErrorAction Stop | Where-Object { $_.PSChildName -match "Hex" } | ForEach-Object { "  visible: " + $_.PSChildName }) } catch { "  denied" }
