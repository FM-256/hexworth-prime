"=== can this box reach ANOTHER TEAM'S box? ==="
foreach ($t in @("192.168.122.91","192.168.122.134","192.168.122.131","192.168.122.191","192.168.122.173")) {
  $r = Test-NetConnection -ComputerName $t -Port 22 -WarningAction SilentlyContinue
  "  {0}:22 reachable = {1}" -f $t, $r.TcpTestSucceeded
}
"=== can this box reach the INTERNET? ==="
$i = Test-NetConnection -ComputerName 1.1.1.1 -Port 443 -WarningAction SilentlyContinue
"  1.1.1.1:443 = " + $i.TcpTestSucceeded
"=== can it reach the HOST and its neighbours' services? ==="
$h = Test-NetConnection -ComputerName 192.168.122.1 -Port 22 -WarningAction SilentlyContinue
"  libvirt gateway 192.168.122.1:22 = " + $h.TcpTestSucceeded
