## Analysis Tools


### Objectives:

At the end of this episode, I will be able to:

Given a scenario, use forensic analysis tools.

### External Resources:

Analysis Tools

 What do you need to know about Analysis Tools? -

 exiftool - designed to read & write file metadata for many file formats

    available on most Linux distributions   https://exiftool.org/


 volatility - command line tool for memory analysis

    • used to explore the contents of a memory dump & reveal information such as
    running processes, open sockets, passwords, & the contents of the clipboard

    • Some sample memory dump files are available from
    https://github.com/volatilityfoundation/volatility/wiki/Memory-Samples


 Aircrack-ng - suite of tools designed for the assessment & analysis of Wi-Fi
 security; some of the utilities included with the suite include:

   • aircrack-ng - used to crack passwords contained within packet captures
   (obtained using airodump-ng)

   • airodump-ng - lists all networks in-range, the number of clients connected
   to the network (including MAC addresses of clients), access point information,
   data volumes, encryption & authentication methods, & ESSID of the network

   • airmon-ng - places a network adapter into monitor mode allowing the card to
   inspect wireless traffic for all networks in-range, without linking or
   authenticating to any access point

   • airbase-ng - used to mimic an access point (required when creating an evil twin)

   • aireplay-ng - used to introduce packets into a wireless network (needed to
     perform a deauthentication attack)


 nmap Security Scanner (nmap.org) - uses diverse methods of host discovery, some
 of which can operate stealthily

    • basic syntax of an nmap command is to give the IP subnet (or IP host
      address) to scan

    • used without switches, default behavior is to ping & send a TCP ACK packet
    to ports 80 and 443 to determine whether a host is present

    • on a local network segment, nmap will also perform ARP & ND (Neighbor
      Discovery) sweeps

    • If a host is detected, nmap performs a port scan against that host to
    determine which services it is running


 What do you need to know about Dynamically & Statically Linked Libraries? -

 Libraries - extend the functionality of an application & allow it to interact
 with an operating system & applications

 Statically Linked - application's required libraries are identified at compile
 time & included with the file executable binary; results in a stand-alone,
 self-contained executable file

 Dynamically Linked - calls for when application runs

    • application is vulnerable to attack by loading malicious libraries designed
    to mimic legitimate ones needed by the application, as is the case with DLL
    hijacking
