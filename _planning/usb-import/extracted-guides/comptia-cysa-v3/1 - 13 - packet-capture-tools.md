Filename: cysa-1b-2-1-1-packet-capture-tools.md
Domain: Tools and Techniques for Determining Malicious Activity
Episode: Packet Capture Tools
=========================================================================

Packet Capture Tools
-------------------------------------------------------------------------
Objectives
-------------------------------------------------------------------------

-------------------------------------------------------------------------


+ Wireshark
  - Capture vs. Display Filters
  - Logical Operators
    + `and` or `&&`
    + `or` or `||`
    + `not` or `!`
    + `eq` or `==`
    + `ne` or `!=`
  - Filters
    + By IP: `ip.add == 10.0.0.1`
    + By IP Destination: `ip.dest == 10.0.0.1`
    + By IP Source: `ip.src == 10.0.0.1`
    + By Port: `tcp.port == 22`
    + By Flag: `tcp.flags.xxx`
    + By Protocol: **ether, ip, arp, tcp, udp, http**
+ TCPDump
  - Interface:`-i`
    + `any`
    + `eth0`
  - Count: `-c`
  - Write: `-w filename.pcap`
  - Read: `-r filename.pcap`
  - Protocol: **arp, tcp, udp, icmp**
  - Port: `port 80`
  - Host: `host 10.0.0.1`
  - Dest: `dst 10.0.0.2`
  - Source: `src 10.0.0.1`

