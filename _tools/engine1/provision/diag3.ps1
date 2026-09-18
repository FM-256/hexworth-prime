"--- task, via schtasks (CIM cmdlets hang on this image) ---"
schtasks /query /tn "\HexMaintenance" /fo LIST /v 2>&1 | Select-String "TaskName|Status|Last Run Time|Last Result|Next Run Time|Run As User|Task To Run" | ForEach-Object { "  " + $_.Line.Trim() }
"--- script content ---"
Get-Content C:\Scripts\maintenance.ps1 | ForEach-Object { "  " + $_ }
"--- log ---"
if (Test-Path C:\Scripts\maintenance.log) { Get-Content C:\Scripts\maintenance.log | Select-Object -Last 2 | ForEach-Object { "  " + $_ } } else { "  NO log: never ran on this clone" }
"--- force a run via schtasks ---"
schtasks /run /tn "\HexMaintenance" 2>&1 | ForEach-Object { "  " + $_ }
Start-Sleep -Seconds 25
"--- Administrators after the forced run ---"
net localgroup Administrators 2>&1 | Select-String "player" | ForEach-Object { "  player IS an admin now" }
