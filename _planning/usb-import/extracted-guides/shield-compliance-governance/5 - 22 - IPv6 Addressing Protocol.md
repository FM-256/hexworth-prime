# 1-2-2: IPv6 Addressing Protocol 

After completing this episode, you should be able to:

+ 1. Identify and explain the format and structure of IPv6 addressing.
+ 2. Explain the benefits of IPv6.   

**Description:** In this episode, the learner will examine the structure of IPv6 addressing. We will explore the benefits of implementing IPv6 addressing.

* What is an IPv6 address
  + Utilizes 128-bit addresses, enabling an extensive number of unique IP addresses.
  + Portions of the address are reserved for the network prefix \(like an IPv4 network ID\)
  + The remaining portion is reserved for the interface identifier 
  \(like an IPv4 host ID\)
* What are some of the benefits of IPv6
  + Address pool
    - The large address space removes the need for NAT, simplifying network design.
  + Simplified routing, header format
    - Hierarchical structuring for efficient routing; simplified packet header.
  + Elimination of broadcast
    - Replaces broadcasting with multicast and anycast.
  + Stateless/stateful configuration
    - Supports both automatic \(SLAAC\) and dynamic \(DHCPv6\) IP addressing.
  + Security features by design
    - Designed with IPsec for enhanced security.
  + Enhanced mobile support
    - Mobile IPv6 reduces latency for mobile connectivity.
* What are the different types of IPv6 addresses?
  + Different IPv6 Address Types
    - Global unicast \(Prefix- 2000::/3\): Unique and routable globally.
    - Unique local \(Prefix- FC00::/7\): For local communications, not globally routable.
    - Link-local \(Prefix- FE80::/10\): For communications on a single network link.
    - Multicast \(Prefix- FF00::/8\): For one-to-many communication.
    - Anycast Assigned to multiple interfaces, with the nearest one responding.
    - Transitional - Teredo \(Prefix- 2001::/32\), 6to4 \(Prefix- 2002::/16\), ISATAP
* What is SLAAC?
  + Stateless Address AutoConfiguration
    - is a method used in IPv6 networking to enable devices on a network to automatically configure their IPv6 addresses
* What is EUI-64?
  + Converts a 48-bit MAC address to a 64-bit interface identifier for IPv6.
  + EUI-64 Format
    - Involves inserting 'FFFE' in the middle of the MAC addresses
* What about security resources such as NIST for IPv6?
  + SP 800-119 - "Guidelines for the Secure Deployment of IPv6" 
  + Recommendations and best practices for securely deploying IPv6 in various network environments.