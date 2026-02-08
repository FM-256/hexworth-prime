## Live Collection Tools


### Objectives:

At the end of this episode, I will be able to:

Given a scenario, use forensic analysis tools.

### External Resources:

Live Collection Tools

 What do you need to know about Imaging Tools? -

 dd - command line tool for creating forensic copies of block-level storage, so
 clones made with dd are exact copies of the original device & can be used for
 forensic evaluation

    • block storage devices are represented as files in Linux

    • generate a hash of a block device (external flash drive) which may be
    represented in the Linux filesystem as /dev/sdc

    • obtain a block level copy using the command
    dd if=/dev/sdc of=/home/user/drive-clone.dd
    & then generate the hash of the resulting drive-clone.dd file

    • both items will generate the same hash value, assuming the flash drive
    does not change after the copy has been obtained


 What do you need to know about Hashing Utilities? -

 sha256sum - Linux command line utility designed to generate SHA-2 hashes with a
 digest length of 256 bits


 ssdeep - designed to compare files to identify matches (used in AV)

    • useful to identify functionally identical files that may be developed to
    morph and/or obfuscate themselves in order to avoid detection using strict
    hash matching techniques

    • uses Context Triggered Piecewise Hashing (CTPH)


 What do you need to know about Live Collection & Post-Mortem Tools? -

 netstat - command line utility to display current network connections & their
 state; useful to identify suspicious connections or active listening ports

 ps (process status) - command can be used to display currently running processes
 on a Linux system, including the process ID (PID) terminal from which they are
 running & the user running the command

 vmstat - command line utility to display real-time information about system
 memory, running processes, interrupts, paging, & I/O statistics

 lsof (list open files) - displays currently open files & the names of the
 associated processes

 netcat - used to read & write from network connections using either TCP or UDP
 to transmit data & open remote connections

 conntrack - allows for interactions with the connection tracking systems, which
 is the Linux kernel module designed to enable stateful packet inspection for the
 iptables firewall

    • used to show, delete, &/or update table entries or listen to flow events

    • issuing the command sudo conntrack -L will display current flow information 
    on the current system's firewall traffic

tcpdump - can record packet captures & save them using the pcap interface so they
can be used by other tools
