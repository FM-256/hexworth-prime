whoami
whoami /groups | findstr /i "S-1-5-32-544"
$f = Get-Content C:\Hexworth\loot\proof.txt
"flag length: " + $f.Length
"sha256 of salt+flag will be compared on the host"
$f | Set-Content C:\Scripts\captured.txt
