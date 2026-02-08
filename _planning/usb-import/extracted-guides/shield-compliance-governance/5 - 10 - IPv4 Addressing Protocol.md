# 1-2-1: IPv4 Addressing Protocol

After completing this episode, you should be able to:

+ Identify and explain the format and structure of IPv4 addressing.

**Description:** In this episode, the learner will examine the structure of IPv4 addressing. We will explore the format, subnet masks, classes, RFC1918, and more. 


* What an IPv4 addresses?
  + Unique identifiers for devices on a network.
  + 32 bits divided into four octets, like 192.168.1.1.
  + Each of the four octets in the address can have a value from 0 to 255
* What is a subnet mask play?
  + A subnet mask defines which part of the address belongs to the network portion and which part belongs to the host portion.
  + To determine the subnet to which an IP address belongs.
* What are IP address classes?
  + Class A - 1.0.0.0 to 126.255.255.255 \(Default Subnet Mask = 255.0.0.0 or /8 \)
  + Class B - 128.0.0.0 to 191.255.255.255 \(Default Subnet Mask = 255.255.0.0 or /16 \)
  + Class C - 192.0.0.0 to 223.255.255.255 \(Default Subnet Mask = 255.255.255.0 or /24 \)
  + Class D - 224.0.0.0 to 239.255.255.255 \(not applicable, no assign subnet mask\)
  + Class E - 240.0.0.0 to 255.255.255.255 \(not applicable, no assign subnet mask\)
* How many networks and hosts can each IPv4 class support?
  + Class A - Supports 128 networks with approximately 16 million hosts each
  + Class B - Supports 16,384 networks with 65,534 hosts each
  + Class C - Supports over 2 million networks with up to 254 hosts each
  + Class D - Not used for standard host addresses \(multicast\)
  + Class E - Reserved for experimental; not for general use
* What about special addresses? Are there reserved addresses?
  + Private classes
    - Defined by RFC 1918
    - Class A Range - 10.0.0.0 to 10.255.255.255 \(10.0.0.0/8\) – Suitable for large organizations with many devices.
    - Class B Range - 172.16.0.0 to 172.31.255.255 \(172.16.0.0/12\) – Commonly used in medium-sized networks.
    - Class C Range - 192.168.0.0 to 192.168.255.255 \(192.168.0.0/16\) – Ideal for small businesses and home networks.
  + Many addresses are reserved for special use
  + 0.0.0.0/8 - reserved by IANA
    - See IETF's *Special-Purpose Address Registries* RFC 6890 for more detailed information: https://datatracker.ietf.org/doc/html/rfc6890
  + 127.0.0.0/8
    - See IETF's *Special-Purpose Address Registries* RFC 6890 for more detailed information: https://datatracker.ietf.org/doc/html/rfc6890
  + 169.254.0.0/16
    - See IETF's *Special USe IPv4 Addresses* RFC 5735 for more detailed information: https://datatracker.ietf.org/doc/html/rfc5735
* What is NAT?
  + Network Address Translation \(NAT\) 
    - A process that translates private IP addresses to a public IP address for internet access
    - Facilitates communication between devices within private networks and external networks.
      * Static NAT - maps a single private IP address to a single public IP address, providing consistent and unchanging external access to a device inside a private network
      * Dynamic NAT - maps multiple private IP addresses to a single public IP address, providing external access without assigning a fixed public IP to each internal device.