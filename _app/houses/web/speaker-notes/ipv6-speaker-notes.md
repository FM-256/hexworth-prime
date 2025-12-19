# IPv6 Addressing & Configuration - Speaker Notes

**Prepared by:** EQ6
**Subject:** Network Essentials - IPv6 Addressing & Configuration
**Presentation File:** ipv6-presentation.html
**Target Audience:** CCNA candidates, network engineering students
**Presentation Duration:** 75-90 minutes (with interactive exercises)
**Difficulty Level:** Intermediate (builds on IPv4 knowledge)
**CCNA Objectives:** 1.8, 1.9

---

## Table of Contents

1. [Slide 1: Title Slide](#slide-1-title-slide)
2. [Slide 2: Why Do We Need IPv6?](#slide-2-why-do-we-need-ipv6)
3. [Slide 3: IPv4 vs IPv6 Comparison](#slide-3-ipv4-vs-ipv6-comparison)
4. [Slide 4: IPv6 Address Format](#slide-4-ipv6-address-format)
5. [Slide 5: IPv6 Prefix Notation](#slide-5-ipv6-prefix-notation)
6. [Slide 6: Address Compression Rules](#slide-6-address-compression-rules)
7. [Slide 7: Compression Examples](#slide-7-compression-examples)
8. [Slide 8: Address Types Overview](#slide-8-address-types-overview)
9. [Slide 9: Global Unicast Addresses](#slide-9-global-unicast-addresses)
10. [Slide 10: Link-Local Addresses](#slide-10-link-local-addresses)
11. [Slide 11: Unique Local Addresses](#slide-11-unique-local-addresses)
12. [Slide 12: Multicast Addresses](#slide-12-multicast-addresses)
13. [Slide 13: Anycast Addresses](#slide-13-anycast-addresses)
14. [Slide 14: Special Addresses](#slide-14-special-addresses)
15. [Slide 15: Static Configuration](#slide-15-static-configuration)
16. [Slide 16: SLAAC](#slide-16-slaac)
17. [Slide 17: DHCPv6](#slide-17-dhcpv6)
18. [Slide 18: EUI-64](#slide-18-eui-64)
19. [Slide 19: Cisco Configuration Summary](#slide-19-cisco-configuration-summary)
20. [Slide 20: Key Takeaways](#slide-20-key-takeaways)

---

## Introduction to This Presentation

### Instructor Preparation Notes

**CRITICAL CONTEXT:** IPv6 is not optional anymore. While IPv4 still dominates most enterprise networks, IPv6 is mandatory for CCNA certification and increasingly deployed in real-world scenarios. Students who mastered IPv4 subnetting often find IPv6 initially confusing because the format looks so different - but reassure them that IPv6 is actually SIMPLER in many ways (no subnetting math, /64 is standard, no broadcast traffic).

**Common Student Misconceptions:**

- "IPv6 is harder than IPv4" - Actually, IPv6 eliminates complex subnetting calculations
- "IPv6 isn't used yet" - Google reports over 40% of traffic is IPv6 as of 2024
- "We'll never run out of IPv6" - Technically true, but proper allocation still matters
- "Link-local is useless" - Actually critical for all IPv6 operations
- Confusing :: placement rules (can only use once per address)

**Prerequisites (Students Should Already Know):**

- IPv4 addressing fundamentals
- Subnet mask concept
- Basic understanding of hexadecimal (0-9, a-f)
- DHCP operation basics
- MAC address format

**Teaching Philosophy for IPv6:**

1. **Leverage IPv4 knowledge** - Draw parallels constantly (GUA = public IP, LLA = link-only, ULA = private)
2. **Practice compression** - Give 10+ addresses to compress/expand during class
3. **Hands-on configuration** - Packet Tracer lab should follow immediately
4. **Focus on "why"** - Understanding why IPv6 was designed this way aids memorization

**Materials Needed:**

- Whiteboard for live address compression exercises
- Cisco Packet Tracer with IPv6 topology
- IPv6 address compression practice worksheet
- Reference card with prefix types (2000::/3, fe80::/10, ff00::/8)

**Timing Recommendations:**

- Slides 1-7: Foundation & format (25-30 minutes)
- Slides 8-14: Address types (20-25 minutes)
- Slides 15-18: Configuration methods (15-20 minutes)
- Slides 19-20: Cisco commands & summary (10-15 minutes)
- Interactive exercises: Throughout, especially slides 6-7

---

## Slide 1: Title Slide

### Visual Description
The title slide displays "IPv6 Addressing & Configuration" with the subtitle "The Next Generation Internet Protocol." The slide shows CCNA objectives 1.8 and 1.9 in a highlighted box at the bottom.

### Speaker Notes

**Opening (First 2 minutes):**

Welcome to one of the most important topics for your CCNA certification and your networking career: IPv6 addressing and configuration. If you've been dreading this topic, I have good news - IPv6 is in many ways EASIER than IPv4 once you understand the format.

**Set the Stage:**

Let me give you some context. IPv4, the protocol we've been using since 1983, has a fundamental limitation: it only provides about 4.3 billion addresses. That sounds like a lot until you realize there are over 8 billion people on Earth, each potentially owning multiple devices. The solution? IPv6, with addresses so numerous that we could assign trillions of addresses to every grain of sand on Earth and still not run out.

**Learning Objectives:**

By the end of this presentation, you will be able to:
1. Write and compress IPv6 addresses correctly
2. Identify IPv6 address types by their prefix
3. Configure IPv6 on Cisco devices using static, SLAAC, and DHCPv6
4. Explain the purpose of link-local, global unicast, and multicast addresses

**Exam Context:**

CCNA objectives 1.8 and 1.9 specifically cover IPv6 addressing. You WILL see multiple questions on:
- Address compression
- Identifying address types from prefixes
- Understanding GUA, LLA, and multicast
- Configuration methods (SLAAC vs DHCPv6)

---

## Slide 2: Why Do We Need IPv6?

### Visual Description
This slide shows a "danger box" highlighting IPv4 exhaustion, followed by a comparison grid showing IPv4 vs IPv6 address counts.

### Speaker Notes

**The IPv4 Exhaustion Crisis:**

Let me tell you a brief history lesson that explains why we're here today.

In the 1980s, when IPv4 was designed, the Internet was a research network connecting a few hundred universities and government agencies. The designers thought 4.3 billion addresses would be more than enough - after all, that was more than the entire world population at the time!

They could not have predicted smartphones, IoT devices, or that every household would need multiple IP addresses.

**The Timeline of Exhaustion:**

- **2011:** IANA (the global authority) ran out of IPv4 blocks to assign to regions
- **2015:** North America ran out
- **2019:** Europe ran out completely
- **Today:** New IPv4 addresses are only available through expensive transfers or by reclaiming unused blocks

**Why Not Just Use NAT Forever?**

Some students ask: "Can't we just keep using NAT to share addresses?" Good question, but NAT has significant limitations:

1. **Breaks end-to-end connectivity** - Devices behind NAT can't receive incoming connections directly
2. **Complicates peer-to-peer applications** - Gaming, video calling, file sharing become harder
3. **Creates single points of failure** - NAT devices become bottlenecks
4. **Adds latency** - Translation takes processing time
5. **Prevents innovation** - New protocols often assume end-to-end connectivity

IPv6 solves all of these problems by providing enough addresses for every device to have its own globally unique address.

**Discussion Prompt:**

Ask students: "How many IP-connected devices do you personally use?" (Phone, laptop, tablet, gaming console, smart TV, smartwatch, car...). Most students realize they use 5-10 devices. Multiply by 8 billion people, and IPv4 exhaustion becomes obvious.

---

## Slide 3: IPv4 vs IPv6 Comparison

### Visual Description
A table comparing IPv4 and IPv6 across multiple dimensions: address length, notation, configuration methods, broadcast, header size, and IPsec support.

### Speaker Notes

**Walking Through the Comparison:**

Let's compare these two protocols side by side. I want you to notice patterns that will help you on the exam.

**Address Length:**
- IPv4: 32 bits, expressed as 4 decimal octets (192.168.1.1)
- IPv6: 128 bits, expressed as 8 hexadecimal groups (2001:db8:0:0:0:0:0:1)

**Quick Math:** 2^32 = ~4.3 billion addresses. 2^128 = 340 undecillion (that's 340 followed by 36 zeros). To put this in perspective: if IPv4 addresses were grains of sand, you'd have about a dump truck's worth. If IPv6 addresses were grains of sand, you'd have more than all the sand on every beach on Earth combined.

**Notation:**
- IPv4 uses dotted decimal: 192.168.1.1
- IPv6 uses colon hexadecimal: 2001:db8::1

**Configuration Methods:**
This is a key exam topic!
- IPv4: DHCP or static configuration only
- IPv6: Three methods - Static, SLAAC (automatic), and DHCPv6

**The Big Difference - No Broadcast!**

This is crucial: IPv6 has NO broadcast addresses. None. Zero.

In IPv4, broadcast traffic (like DHCP discover, ARP requests) goes to EVERYONE on the subnet. In IPv6, these functions use multicast instead - packets only go to devices that registered to receive them.

**Why No Broadcast Matters:**

1. Reduces unnecessary traffic on large networks
2. Eliminates broadcast storms
3. Improves network efficiency

**IPsec:**
- IPv4: Optional extension
- IPv6: Built into the protocol specification

This means every IPv6 implementation must support IPsec, providing baseline security capabilities.

---

## Slide 4: IPv6 Address Format

### Visual Description
Shows an IPv6 address broken into 8 colored hextet boxes separated by colons, with a bit layout diagram showing network prefix (64 bits) and interface ID (64 bits).

### Speaker Notes

**The Basic Structure:**

An IPv6 address is 128 bits long, divided into 8 groups of 16 bits each. We call these groups "hextets" (some texts say "quartets" or "segments" - they mean the same thing).

**Visual Breakdown:**

```
2001:0db8:85a3:0000:0000:8a2e:0370:7334
|    |    |    |    |    |    |    |
Hextet 1-8, each is 16 bits (4 hex characters)
```

**Hexadecimal Characters:**

Each hextet uses hexadecimal: 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, a, b, c, d, e, f

- Case doesn't matter: 2001:DB8 = 2001:db8
- Each hex character represents 4 bits
- Four hex characters = 16 bits = one hextet

**The /64 Standard:**

The typical IPv6 address is divided into:
- **Network Prefix:** First 64 bits (identifies the network/subnet)
- **Interface ID:** Last 64 bits (identifies the specific device)

This /64 standard is important for SLAAC to work properly. The interface ID can be derived from the MAC address using EUI-64 (we'll cover this later).

**Teaching Moment:**

Have students count the bits:
- 8 hextets × 16 bits = 128 bits total ✓
- Compare to IPv4: 4 octets × 8 bits = 32 bits total

**Common Mistakes:**

- Writing 5 hex characters in a group (maximum is 4)
- Using characters outside 0-9 and a-f (no g, h, etc.)
- Confusing colons (:) with dots (.)

---

## Slide 5: IPv6 Prefix Notation

### Visual Description
Shows the prefix notation format with an address (2001:db8:acad:1::1) and prefix length (/64) separated, followed by a table of common prefix lengths.

### Speaker Notes

**Prefix Length = Network Portion:**

Just like IPv4 CIDR notation, IPv6 uses slash notation to indicate how many bits belong to the network portion:

```
2001:db8:acad:1::1/64
                   ↑
            Prefix length (bits)
```

**Common Prefix Lengths (Memorize These!):**

| Prefix | Usage | Notes |
|--------|-------|-------|
| /64 | Standard LAN subnet | Required for SLAAC |
| /48 | Site allocation | ISP gives to customer |
| /32 | ISP allocation | RIR gives to ISP |
| /128 | Single host | Loopback, specific host route |
| /127 | Point-to-point link | Router-to-router links |

**Why /64 is Standard:**

The /64 prefix is not arbitrary - it's designed to work with:
1. EUI-64 interface ID generation (needs 64 bits for MAC conversion)
2. SLAAC autoconfiguration
3. Privacy extensions (random 64-bit suffix)

**ISP Allocation Example:**

- Your ISP receives a /32 from a Regional Internet Registry
- ISP allocates you a /48 (that's 65,536 possible /64 subnets!)
- You use /64 for each LAN segment

**Exam Focus:**

Questions may ask: "What is the network prefix for 2001:db8:1:1::a/64?"
Answer: 2001:db8:1:1::/64 (everything up to 64 bits)

**Practice Problem:**

Given: 2001:db8:aaaa:bbbb:cccc:dddd:eeee:ffff/48
What is the network portion? Answer: 2001:db8:aaaa::/48 (first 48 bits = first 3 hextets)

---

## Slide 6: Address Compression Rules

### Visual Description
Two info boxes showing Rule 1 (omit leading zeros) and Rule 2 (double colon for consecutive all-zero groups), with examples.

### Speaker Notes

**This Is THE Most Important IPv6 Skill:**

Address compression is tested extensively on CCNA. You must be able to both compress and expand addresses quickly and accurately.

**Rule 1: Omit Leading Zeros**

Within each hextet, you can remove leading zeros (but you must keep at least one digit):

```
2001:0db8:0000:0042 → 2001:db8:0:42
     ↑    ↑
     db8 (not 0db8)
          0 (not 0000, but at least one 0)
```

**Key Points for Rule 1:**
- ONLY leading zeros, never trailing
- Each hextet independently
- Must keep at least one digit (0000 becomes 0)

**Rule 2: Double Colon (::)**

Replace ONE contiguous group of all-zero hextets with ::

```
2001:db8:0:0:0:0:0:1 → 2001:db8::1
         ↓
    All these zeros become ::
```

**THE CRITICAL RULE: Only Once!**

You can ONLY use :: once per address. Why? Because you need to be able to expand it back. If you used :: twice, you couldn't know how many zeros each one represents.

**Invalid Example:**

```
2001:0:0:0:3:0:0:1
      ↓     ↓
2001::3::1   ← INVALID! Cannot use :: twice
```

Valid alternatives:
- 2001::3:0:0:1 (first group of zeros)
- 2001:0:0:0:3::1 (second group of zeros - longer, so use this one)

**Best Practice:**

When you have multiple groups of zeros, use :: for the LONGEST consecutive group. If they're equal length, you can choose either (usually the leftmost).

---

## Slide 7: Compression Examples

### Visual Description
A table showing full addresses and their compressed forms, including loopback (::1) and unspecified (::).

### Speaker Notes

**Let's Practice Together:**

I'm going to walk through each example. Follow along and verify you understand the rules.

**Example 1:**
```
Full:       2001:0db8:0000:0000:0000:0000:0000:0001
Step 1:     2001:db8:0:0:0:0:0:1  (remove leading zeros)
Step 2:     2001:db8::1           (replace zeros with ::)
```

**Example 2:**
```
Full:       fe80:0000:0000:0000:0211:22ff:fe33:4455
Step 1:     fe80:0:0:0:211:22ff:fe33:4455
Step 2:     fe80::211:22ff:fe33:4455
```

Notice: Only the first three hextets after fe80 were zeros, so :: replaces those.

**Special Addresses:**

**Loopback:**
```
Full:       0000:0000:0000:0000:0000:0000:0000:0001
Compressed: ::1
```
This is equivalent to IPv4's 127.0.0.1. It's used for testing the local TCP/IP stack.

**Unspecified:**
```
Full:       0000:0000:0000:0000:0000:0000:0000:0000
Compressed: ::
```
This is equivalent to IPv4's 0.0.0.0. Used when a device doesn't have an address yet.

**Practice Exercise:**

Have students compress these (write on whiteboard):
1. 2001:0db8:0001:0000:0000:0000:0000:0001 → 2001:db8:1::1
2. fe80:0000:0000:0000:0000:0000:0000:0001 → fe80::1
3. ff02:0000:0000:0000:0000:0001:ff00:0001 → ff02::1:ff00:1

**Expansion Practice:**

Also practice expanding:
1. 2001:db8::1 → 2001:0db8:0000:0000:0000:0000:0000:0001
2. ::1 → 0000:0000:0000:0000:0000:0000:0000:0001

---

## Slide 8: Address Types Overview

### Visual Description
A table showing the five main IPv6 address types with their prefixes and scopes, color-coded.

### Speaker Notes

**The Five Main Address Types:**

Unlike IPv4 where we mainly just have unicast and broadcast, IPv6 has several distinct address types. Each has a specific prefix you need to memorize for the exam.

**1. Global Unicast Address (GUA) - 2000::/3**
- The "public" address - globally routable on the Internet
- Equivalent to IPv4 public addresses
- Currently allocated from 2001:, 2002:, 2003: ranges

**2. Link-Local Address (LLA) - fe80::/10**
- Valid only on the local network link
- NEVER routed - stays on the local segment
- Automatically assigned when IPv6 is enabled
- REQUIRED on every IPv6 interface

**3. Unique Local Address (ULA) - fc00::/7**
- The "private" address - not routable on Internet
- Equivalent to IPv4's 10.0.0.0, 172.16.0.0, 192.168.0.0
- Used for internal organization communication

**4. Multicast - ff00::/8**
- One-to-many communication
- Replaces broadcast in IPv6
- Various scopes (link-local, site-local, global)

**5. Anycast**
- Same format as unicast
- One-to-nearest routing
- Used for redundant services (DNS, CDN)

**Memory Trick:**

- **2**000 = **G**lobal (think: "2 G" like 2G mobile network)
- **fe**80 = **F**irst on **E**ach link (link-local)
- **f**c00 = internal **f**or **c**ompany (unique local)
- **ff** = multicast (think: **f**inding **f**riends)

**Key Exam Point:**

IPv6 has NO BROADCAST. When you see "broadcast" in an IPv6 question, it's probably a trick. Use multicast instead (ff02::1 for all nodes).

---

## Slide 9: Global Unicast Addresses

### Visual Description
Shows the GUA structure with colored sections for Global Routing Prefix (48 bits), Subnet ID (16 bits), and Interface ID (64 bits).

### Speaker Notes

**GUA = Your Internet Address:**

Global Unicast Addresses are what you use to communicate on the Internet. Every device that needs to reach the public Internet needs a GUA.

**GUA Structure (Typical):**

```
|     48 bits      | 16 bits |      64 bits       |
| Global Routing   | Subnet  |    Interface ID    |
|     Prefix       |   ID    |                    |
```

**Real-World Example:**

Let's say your ISP gives you 2001:db8:acad::/48

- 2001:db8:acad = Your global routing prefix (48 bits)
- You have 16 bits for subnets = 65,536 possible /64 networks!
- Each subnet has 64 bits for hosts = effectively unlimited devices

**Current Allocation:**

Technically, GUA is 2000::/3, meaning addresses starting with binary 001 (hex 2 or 3). Currently:
- 2001::/16 is used for most allocations
- 2002::/16 was used for 6to4 tunneling (deprecated)
- Other ranges are reserved for future use

**Identifying GUA on Exam:**

If you see an address starting with 2 or 3 in the first hex digit, it's a GUA:
- 2001:db8::1 ✓ GUA
- 3ffe::1 ✓ GUA (older allocation)
- fe80::1 ✗ Not GUA (link-local)
- fc00::1 ✗ Not GUA (unique local)

**Documentation Prefix:**

2001:db8::/32 is reserved for documentation and examples. You'll see this in textbooks, exams, and labs. It's never used in production!

---

## Slide 10: Link-Local Addresses

### Visual Description
Purple-themed info box showing fe80::/10 prefix, with key characteristics listed as bullet points.

### Speaker Notes

**Link-Local is FUNDAMENTAL:**

This is one of the most important address types to understand. Link-local addresses are:
1. **Automatically assigned** when IPv6 is enabled
2. **Required** on every IPv6-enabled interface
3. **Never routed** beyond the local link

**The Prefix:**

Technically fe80::/10, but in practice you'll always see fe80:: because the next 54 bits are zeros.

```
fe80:0000:0000:0000:xxxx:xxxx:xxxx:xxxx
|      Prefix       |   Interface ID   |
|      64 bits      |     64 bits      |
```

**What Link-Local is Used For:**

1. **Neighbor Discovery Protocol (NDP)** - IPv6's replacement for ARP
2. **Router discovery** - How hosts find their default gateway
3. **Routing protocol communication** - OSPF, EIGRP use LLA for next-hop
4. **Default gateway** - Routers often use LLA as the next-hop address

**The Zone ID Problem:**

Since link-local addresses are the same on every link, you might have multiple interfaces with the same fe80::1 address (on different segments). When pinging a link-local address, you must specify the interface:

```
ping fe80::1%eth0
```

The %eth0 (or %GigabitEthernet0/0) is called the "zone ID."

**Automatic Assignment:**

When you enable IPv6 on an interface, even without assigning a GUA, the interface ALWAYS gets a link-local address. This is different from IPv4, where no address means no communication.

**Exam Question Pattern:**

"Which address type is automatically assigned when IPv6 is enabled?"
Answer: Link-local (fe80::/10)

---

## Slide 11: Unique Local Addresses

### Visual Description
Pink-themed info box with fc00::/7 prefix, showing ULA structure with Global ID section.

### Speaker Notes

**ULA = IPv6's Private Addresses:**

Unique Local Addresses serve the same purpose as RFC 1918 private addresses in IPv4:
- Internal communication within an organization
- Not routable on the public Internet
- Should be blocked at border routers

**The Prefix:**

fc00::/7 covers both fc00::/8 and fd00::/8:
- fc00::/8 - Reserved (not currently used)
- fd00::/8 - Used for locally assigned ULAs

In practice, you'll always see addresses starting with fd:

```
fd00:1234:5678::/48
```

**ULA Structure:**

```
| 8 bits |    40 bits     | 16 bits |    64 bits     |
|   fd   |   Global ID    | Subnet  |  Interface ID  |
|        |   (Random)     |   ID    |                |
```

**The "Unique" Part:**

The 40-bit Global ID should be randomly generated, making collision extremely unlikely. Unlike IPv4 private addresses where everyone uses 192.168.1.0, ULAs are designed to be globally unique even though they're not globally routable.

**When to Use ULA:**

1. Devices that should never access the Internet directly
2. Internal services (printers, IoT sensors, internal servers)
3. Backup addressing in case ISP prefix changes

**ULA vs IPv4 Private:**

| Feature | IPv4 Private | IPv6 ULA |
|---------|--------------|----------|
| Prefix | 10.0.0.0/8, etc. | fd00::/8 |
| Uniqueness | Shared by everyone | Statistically unique |
| Collision | Common in mergers | Extremely rare |

---

## Slide 12: Multicast Addresses

### Visual Description
Orange-themed info box with ff00::/8 prefix, followed by a table of common multicast addresses.

### Speaker Notes

**Multicast Replaces Broadcast:**

In IPv4, we had broadcast (255.255.255.255 or subnet broadcast). In IPv6, there is NO broadcast. Multicast fills this role.

**How Multicast Works:**

1. Devices register to receive multicast for specific addresses
2. Sender transmits once to multicast address
3. Only registered devices process the packet
4. Non-registered devices ignore it at the hardware level

This is more efficient than broadcast, where every device must process every packet.

**Multicast Address Format:**

```
ff00::/8
| 8 bits |  4 bits |  4 bits |     112 bits      |
|   ff   |  Flags  |  Scope  |     Group ID      |
```

**Common Scope Values:**

- 1 = Interface-local (loopback)
- 2 = Link-local (same subnet)
- 5 = Site-local
- e = Global

**MEMORIZE These Multicast Addresses:**

| Address | Meaning | Usage |
|---------|---------|-------|
| ff02::1 | All nodes | Replaces broadcast |
| ff02::2 | All routers | Router discovery |
| ff02::5 | All OSPF routers | OSPFv3 |
| ff02::6 | All OSPF DRs | OSPFv3 DR/BDR |
| ff02::9 | All RIP routers | RIPng |
| ff02::a | All EIGRP routers | EIGRP for IPv6 |

**Solicited-Node Multicast:**

This is special: ff02::1:ffXX:XXXX

The last 24 bits come from the interface's unicast address. Used by NDP to find MAC addresses (similar to ARP but more efficient).

Example: For 2001:db8::1:2:3:4, solicited-node is ff02::1:ff03:4

---

## Slide 13: Anycast Addresses

### Visual Description
Cyan-themed info box explaining anycast, with a flow diagram showing client → routing → nearest server.

### Speaker Notes

**Anycast: One Address, Multiple Destinations:**

Anycast is a unique concept that doesn't exist in IPv4 (without tricks):
- Multiple devices share the same IP address
- Routing delivers packets to the "nearest" one
- "Nearest" = lowest routing metric

**How It Works:**

1. You configure the same anycast address on multiple servers
2. Each server advertises a route to that address
3. Routers see multiple paths to the same destination
4. Traffic goes to the closest server (by routing metric)

**Real-World Examples:**

1. **DNS Root Servers:**
   - 13 root server addresses (a.root-servers.net through m.root-servers.net)
   - Each address maps to hundreds of physical servers worldwide
   - Your query goes to the nearest one automatically

2. **Content Delivery Networks (CDNs):**
   - Same IP address in multiple data centers
   - Users automatically connect to nearest cache

3. **Cloudflare, Google DNS (1.1.1.1, 8.8.8.8):**
   - These "single" addresses are actually anycast
   - Hundreds of servers worldwide share each address

**Anycast vs Unicast Format:**

There's no special prefix for anycast - they look exactly like regular unicast addresses. The difference is in how routers are configured to handle them.

**CCNA Context:**

You won't configure anycast on CCNA, but you should understand the concept. Questions might ask about use cases or how anycast differs from unicast/multicast.

---

## Slide 14: Special Addresses

### Visual Description
Grid showing loopback (::1) and unspecified (::) addresses, plus documentation prefix (2001:db8::/32).

### Speaker Notes

**Loopback Address: ::1**

The IPv6 loopback is beautifully simple:
- Full form: 0000:0000:0000:0000:0000:0000:0000:0001
- Compressed: ::1

**Uses for Loopback:**
- Testing local TCP/IP stack
- Applications binding to localhost
- Confirming IPv6 is working on the system

```bash
ping ::1
# or on Cisco:
ping ipv6 ::1
```

**Unspecified Address: ::**

The all-zeros address:
- Full form: 0000:0000:0000:0000:0000:0000:0000:0000
- Compressed: :: (just two colons!)

**Uses for Unspecified:**
- Source address when device has no address yet
- Routing table entry meaning "default route"
- DHCPv6 solicit messages (before getting an address)

**Documentation Prefix: 2001:db8::/32**

This prefix is reserved for examples, documentation, and educational purposes:
- NEVER used in production networks
- Safe to use in labs, textbooks, exam questions
- You'll see it throughout CCNA materials

**IPv4 Equivalents:**

| IPv6 | IPv4 | Purpose |
|------|------|---------|
| ::1 | 127.0.0.1 | Loopback |
| :: | 0.0.0.0 | Unspecified |
| 2001:db8::/32 | 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24 | Documentation |

**Exam Tip:**

If you see :: in an answer, make sure it means "unspecified" and not just "compressed zeros in the middle of an address."

---

## Slide 15: Static Configuration

### Visual Description
Code blocks showing Cisco IOS commands for static IPv6 configuration on router interfaces.

### Speaker Notes

**Manual IPv6 Configuration:**

Just like IPv4, you can manually configure IPv6 addresses. This gives you complete control but requires more administrative effort.

**Step 1: Enable IPv6 Routing**

```
Router(config)# ipv6 unicast-routing
```

This command is REQUIRED for the router to forward IPv6 packets. Without it, the router can have IPv6 addresses but won't route IPv6 traffic!

**Step 2: Configure Interface**

```
Router(config)# interface GigabitEthernet0/0
Router(config-if)# ipv6 address 2001:db8:acad:1::1/64
Router(config-if)# ipv6 address fe80::1 link-local
Router(config-if)# no shutdown
```

**What Each Command Does:**

1. `ipv6 address 2001:db8:acad:1::1/64` - Assigns the GUA
2. `ipv6 address fe80::1 link-local` - Optionally sets a specific link-local (otherwise auto-generated)
3. `no shutdown` - Enables the interface

**Key Difference from IPv4:**

In IPv4, you use `ip routing` which is enabled by default on routers. In IPv6, you MUST explicitly enable `ipv6 unicast-routing`. This is a common exam trap!

**Verification Commands:**

```
Router# show ipv6 interface brief
Router# show ipv6 interface GigabitEthernet0/0
Router# show ipv6 route
```

**Common Mistake:**

Students forget `ipv6 unicast-routing` and then wonder why routing doesn't work. The router will have addresses and respond to pings but won't forward traffic between interfaces.

---

## Slide 16: SLAAC

### Visual Description
Info box explaining SLAAC, flow diagram showing Router Advertisement → Prefix Learning → Interface ID generation → Complete address.

### Speaker Notes

**SLAAC: The Magic of IPv6:**

Stateless Address Autoconfiguration is one of IPv6's best features. Hosts can configure their own addresses WITHOUT a DHCP server!

**How SLAAC Works:**

1. **Router Advertisement (RA):** Routers periodically send RAs containing the network prefix
2. **Prefix Learning:** Host receives prefix (e.g., 2001:db8:1::/64)
3. **Interface ID Generation:** Host creates its own 64-bit interface ID
4. **Duplicate Address Detection:** Host verifies the address is unique
5. **Address Active:** Host can now communicate!

**Router Configuration for SLAAC:**

```
Router(config)# interface GigabitEthernet0/0
Router(config-if)# ipv6 address 2001:db8:acad:1::1/64
Router(config-if)# no shutdown
! SLAAC is the default behavior - no extra config needed!
```

**The Router's Role:**

The router only provides:
- Network prefix
- Prefix length
- Default gateway (its own link-local address)

The router does NOT track which addresses are in use - that's why it's "stateless."

**Interface ID Methods:**

Hosts can create their 64-bit Interface ID using:
1. **EUI-64:** Derived from MAC address (we'll cover this)
2. **Random:** Privacy extensions (RFC 4941)
3. **Stable:** Random but consistent per network (RFC 7217)

**Advantages of SLAAC:**

1. No DHCP server required
2. Simpler network design
3. Faster address configuration
4. Works even if DHCP server fails

**Limitation:**

SLAAC alone doesn't provide DNS server information! That's where stateless DHCPv6 comes in.

---

## Slide 17: DHCPv6

### Visual Description
Grid comparing three configuration methods: SLAAC Only, SLAAC + Stateless DHCPv6, and Stateful DHCPv6. Table showing M flag and O flag combinations.

### Speaker Notes

**Three Ways to Configure IPv6:**

IPv6 gives you options! The M and O flags in Router Advertisements control client behavior.

**Option 1: SLAAC Only (M=0, O=0)**

- Host creates own address from prefix in RA
- NO additional configuration from server
- Problem: How does host learn DNS server?

**Option 2: SLAAC + Stateless DHCPv6 (M=0, O=1)**

- Host creates own address (SLAAC)
- DHCPv6 provides DNS servers, domain name, etc.
- Best of both worlds!
- Most common enterprise configuration

**Option 3: Stateful DHCPv6 (M=1)**

- DHCPv6 server assigns addresses
- Full control like DHCPv4
- Server tracks address assignments
- Good when you need address logging/auditing

**The Flags:**

| Flag | Name | Meaning |
|------|------|---------|
| M | Managed | Get address from DHCPv6 |
| O | Other | Get other config from DHCPv6 |

**Router Configuration:**

```
! SLAAC only (default)
Router(config-if)# no ipv6 nd managed-config-flag
Router(config-if)# no ipv6 nd other-config-flag

! SLAAC + Stateless DHCPv6
Router(config-if)# no ipv6 nd managed-config-flag
Router(config-if)# ipv6 nd other-config-flag

! Stateful DHCPv6
Router(config-if)# ipv6 nd managed-config-flag
```

**nd = Neighbor Discovery**

These commands modify the Router Advertisement messages.

**Exam Focus:**

Know which flag combination produces which behavior. A common question: "To provide DNS via DHCPv6 while using SLAAC for addressing, set O=1, M=0."

---

## Slide 18: EUI-64

### Visual Description
Flow diagram showing MAC address transformation: split, insert FF:FE, flip 7th bit.

### Speaker Notes

**EUI-64: MAC Address → Interface ID:**

Extended Unique Identifier 64 is a method to create a 64-bit Interface ID from a 48-bit MAC address.

**The Process:**

1. **Split the MAC in half:**
   ```
   00:11:22:33:44:55 → 00:11:22 | 33:44:55
   ```

2. **Insert FF:FE in the middle:**
   ```
   00:11:22:FF:FE:33:44:55
   ```

3. **Flip the 7th bit (U/L bit):**
   ```
   00 in binary: 0000 0000
   Flip 7th:     0000 0010 = 02
   Result: 02:11:22:FF:FE:33:44:55
   ```

**Why Flip the 7th Bit?**

The 7th bit in a MAC address indicates:
- 0 = Burned-in (manufacturer assigned)
- 1 = Locally administered

In EUI-64, we flip this:
- 0 → 1 = "This is a globally unique address"
- 1 → 0 = "This is locally created"

**Complete Example:**

```
MAC Address: 00:1A:2B:3C:4D:5E

Step 1: Split
00:1A:2B | 3C:4D:5E

Step 2: Insert FF:FE
00:1A:2B:FF:FE:3C:4D:5E

Step 3: Flip bit 7 (00 → 02)
02:1A:2B:FF:FE:3C:4D:5E

Final Interface ID: 021a:2bff:fe3c:4d5e

Full IPv6 with prefix 2001:db8:1::/64:
2001:db8:1::21a:2bff:fe3c:4d5e
```

**Cisco Configuration:**

```
Router(config-if)# ipv6 address 2001:db8:1::/64 eui-64
```

**Privacy Concern:**

EUI-64 embeds the MAC address, allowing device tracking across networks. Modern OSes often use random Interface IDs instead (Privacy Extensions - RFC 4941).

---

## Slide 19: Cisco Configuration Summary

### Visual Description
Code blocks showing essential IPv6 commands for Cisco routers and verification commands.

### Speaker Notes

**Essential Configuration Commands:**

Let me consolidate all the key commands you need to know:

**Enable IPv6 Routing:**
```
Router(config)# ipv6 unicast-routing
```
Required on routers! Without this, the router won't forward IPv6 packets between interfaces.

**Assign GUA with Full Address:**
```
Router(config-if)# ipv6 address 2001:db8:1::1/64
```

**Assign GUA Using EUI-64:**
```
Router(config-if)# ipv6 address 2001:db8:1::/64 eui-64
```
The router calculates the Interface ID from its MAC address.

**Assign Specific Link-Local:**
```
Router(config-if)# ipv6 address fe80::1 link-local
```
Optional - link-local is auto-generated if you don't set it.

**Enable IPv6 Without GUA:**
```
Router(config-if)# ipv6 enable
```
Just gets a link-local address - useful for routing-only interfaces.

**Verification Commands:**

```
Router# show ipv6 interface brief
! Quick overview - addresses on each interface

Router# show ipv6 interface g0/0
! Detailed info - link-local, GUA, multicast memberships

Router# show ipv6 route
! IPv6 routing table

Router# show ipv6 neighbors
! NDP cache (like ARP table)

Router# ping ipv6 2001:db8::1
! Test connectivity
```

**Common Lab Scenario:**

1. Enable ipv6 unicast-routing
2. Assign IPv6 addresses to interfaces
3. Verify with show ipv6 interface brief
4. Test with ping ipv6

---

## Slide 20: Key Takeaways

### Visual Description
Four boxes summarizing: Address Basics, Address Types, Configuration, and Special Addresses.

### Speaker Notes

**Final Review - What You MUST Know:**

Let's consolidate everything for exam preparation:

**Address Format:**
- 128 bits, 8 hextets, hexadecimal
- Compression: remove leading zeros, use :: once
- Standard subnet: /64

**Address Types (Memorize Prefixes!):**
- 2000::/3 → Global Unicast (GUA) - Internet routable
- fe80::/10 → Link-Local (LLA) - Required, local only
- fc00::/7 → Unique Local (ULA) - Private addresses
- ff00::/8 → Multicast - One-to-many

**Configuration Methods:**
- Static: Manual assignment
- SLAAC: Automatic from Router Advertisement
- DHCPv6: Stateless (other info) or Stateful (addresses)

**Special Addresses:**
- ::1 → Loopback
- :: → Unspecified
- 2001:db8::/32 → Documentation

**Key Commands:**
- `ipv6 unicast-routing` → Enable routing
- `ipv6 address X:X:X:X::X/64` → Assign GUA
- `show ipv6 interface brief` → Verify

**Common Exam Traps:**

1. Forgetting `ipv6 unicast-routing`
2. Using :: twice in one address
3. Confusing link-local (fe80::) with unique local (fd00::)
4. Thinking IPv6 has broadcast (it doesn't - use multicast)

**Final Advice:**

Practice address compression until it's automatic. You should be able to compress and expand addresses in under 30 seconds. This skill will be tested multiple times on your exam!

---

## Appendix: Quick Reference

### IPv6 Address Types at a Glance

| Type | Prefix | Scope | IPv4 Equivalent |
|------|--------|-------|-----------------|
| Global Unicast | 2000::/3 | Global | Public IP |
| Link-Local | fe80::/10 | Link | 169.254.x.x (APIPA) |
| Unique Local | fc00::/7 | Organization | 10.x, 172.16.x, 192.168.x |
| Multicast | ff00::/8 | Varies | 224.0.0.0/4 |
| Loopback | ::1/128 | Host | 127.0.0.1 |
| Unspecified | ::/128 | N/A | 0.0.0.0 |

### Common Multicast Addresses

| Address | Description |
|---------|-------------|
| ff02::1 | All nodes (link-local) |
| ff02::2 | All routers (link-local) |
| ff02::5 | All OSPF routers |
| ff02::6 | All OSPF DRs |
| ff02::9 | All RIP routers |
| ff02::a | All EIGRP routers |

### Compression Practice Answers

| Full | Compressed |
|------|------------|
| 2001:0db8:0000:0000:0000:0000:0000:0001 | 2001:db8::1 |
| fe80:0000:0000:0000:0000:0000:0000:0001 | fe80::1 |
| 2001:0db8:aaaa:0001:0000:0000:0000:0001 | 2001:db8:aaaa:1::1 |
| ff02:0000:0000:0000:0000:0001:ff00:0001 | ff02::1:ff00:1 |

---

*End of Speaker Notes*
