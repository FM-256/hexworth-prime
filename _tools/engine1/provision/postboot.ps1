"flag length: " + (Get-Content C:\Hexworth\loot\proof.txt).Length
$t = schtasks /query /tn "\HexMaintenance" /fo LIST 2>&1
if ($t -match "Ready|Running") { "scheduled task: present and enabled" } else { "scheduled task: MISSING after reboot" }
"C:\Scripts writable by Users: " + [bool]((icacls C:\Scripts) -match "Users.*\(M\)")
$acl = (icacls C:\Hexworth\loot\proof.txt) -join " "
"flag ACL still admin-only: " + (-not ($acl -match "Users"))
