# First-Hop Redundancy Protocols (FHRP) - Speaker Notes

**Prepared by:** EQ6
**Subject:** Network Essentials - First-Hop Redundancy Protocols
**Presentation File:** fhrp-presentation.html
**Target Audience:** CCNA candidates, network engineering students
**Presentation Duration:** 60-75 minutes (with demonstrations)
**Difficulty Level:** Intermediate
**CCNA Objective:** 3.5

---

## Table of Contents

1. [Slide 1: Title Slide](#slide-1-title-slide)
2. [Slide 2: The Problem](#slide-2-the-problem)
3. [Slide 3: The Solution](#slide-3-the-solution)
4. [Slide 4: Three Protocols](#slide-4-three-protocols)
5. [Slide 5: HSRP Deep Dive](#slide-5-hsrp-deep-dive)
6. [Slide 6: VRRP Deep Dive](#slide-6-vrrp-deep-dive)
7. [Slide 7: GLBP Deep Dive](#slide-7-glbp-deep-dive)
8. [Slide 8: Protocol Comparison](#slide-8-protocol-comparison)
9. [Slide 9: HSRP States](#slide-9-hsrp-states)
10. [Slide 10: Priority and Preemption](#slide-10-priority-and-preemption)
11. [Slide 11: HSRP Configuration](#slide-11-hsrp-configuration)
12. [Slide 12: VRRP Configuration](#slide-12-vrrp-configuration)
13. [Slide 13: GLBP Configuration](#slide-13-glbp-configuration)
14. [Slide 14: Virtual MAC Addresses](#slide-14-virtual-mac-addresses)
15. [Slide 15: Verification Commands](#slide-15-verification-commands)
16. [Slide 16: Troubleshooting](#slide-16-troubleshooting)
17. [Slide 17: Interface Tracking](#slide-17-interface-tracking)
18. [Slide 18: Best Practices](#slide-18-best-practices)
19. [Slide 19: Quick Reference](#slide-19-quick-reference)
20. [Slide 20: Summary](#slide-20-summary)

---

## Introduction to This Presentation

### Instructor Preparation Notes

**CRITICAL CONTEXT:** First-Hop Redundancy Protocols are a fundamental component of highly available network design. While the concept is straightforward (redundant default gateways), students often struggle with:
- Understanding the difference between the three protocols (HSRP vs VRRP vs GLBP)
- Remembering virtual MAC address formats (exam favorite!)
- Grasping when preemption matters
- Understanding GLBP's load balancing vs HSRP/VRRP's active/standby model

**Common Student Misconceptions:**

- "End devices can somehow detect when a gateway fails" - No! They use ARP and static configuration
- "VRRP and HSRP are compatible" - Absolutely not! Different protocols entirely
- "The standby router doesn't do anything" - It actively monitors the active router
- "GLBP load balancing means faster throughput for a single host" - No, it's per-host distribution
- "Preemption is always enabled" - Only by default in VRRP!

**Prerequisites (Students Should Know):**

- IP addressing and subnetting
- Default gateway concepts
- ARP (Address Resolution Protocol)
- Basic router configuration
- Understanding of Layer 2 vs Layer 3

**Why FHRP Matters:**

In production networks, a single point of failure at the default gateway level is unacceptable:
- Data centers require 99.99%+ uptime
- Enterprise networks need redundant paths
- Internet-facing services can't have single gateway dependencies
- Planned maintenance requires seamless failover

Every network engineer will implement FHRP in their career, especially in:
- Core network designs
- Data center gateway layers
- Campus distribution layers
- Branch office WAN connections

**Materials Needed:**

- Packet Tracer or GNS3 with 2-3 routers and a switch
- Access to the FHRP Visualizer tool
- Whiteboard for drawing redundancy topologies
- Lab worksheet with configuration scenarios
- Wireshark (optional, for seeing HSRP/VRRP packets)

**Timing Recommendations:**

- Slides 1-3: Problem and solution (10 minutes)
- Slides 4-8: Protocol differences (20 minutes) - KEY SECTION
- Slides 9-10: States and priority (10 minutes)
- Slides 11-14: Configuration examples (15 minutes)
- Slides 15-18: Verification and troubleshooting (15 minutes)
- Slides 19-20: Summary and practice (5 minutes)

---

## Slide 1: Title Slide

### Visual Description
Green gradient background with title "First-Hop Redundancy Protocols" and subtitle about eliminating single points of failure. CCNA objective 3.5 highlighted.

### Speaker Notes

**Opening (2 minutes):**

Welcome to our session on First-Hop Redundancy Protocols. This is a topic that solves one of networking's most fundamental problems: what happens when your default gateway fails?

**Set the Stage:**

Let me ask you: How many of you have experienced network downtime because a router failed? (Show of hands)

The reality is that a single router failure can take down hundreds or thousands of end devices if it's serving as their default gateway. That's what we're going to solve today.

**Learning Objectives:**

By the end of this presentation, you will be able to:
1. Explain why FHRPs exist and what problem they solve
2. Compare and contrast HSRP, VRRP, and GLBP
3. Configure HSRP on Cisco routers (primary exam focus)
4. Understand priority, preemption, and virtual MAC addresses
5. Troubleshoot common FHRP issues
6. Verify FHRP operation using show commands

**Real-World Context:**

In enterprise networks, FHRP is not optional - it's mandatory. Whether you're working in:
- Data centers (always redundant)
- Campus networks (distribution layer redundancy)
- Branch offices (WAN gateway redundancy)
- Cloud on-ramps (multi-path internet connections)

You will configure and troubleshoot FHRP. This is day-one network engineer knowledge.

**Exam Relevance:**

The CCNA 200-301 exam tests FHRP concepts heavily, particularly:
- Understanding why FHRP is needed
- Knowing the differences between HSRP, VRRP, and GLBP
- Recognizing virtual MAC address formats (simulation questions!)
- Understanding preemption behavior

---

## Slide 2: The Problem

### Visual Description
Diagram showing PC-1 with only one default gateway (Router A at 192.168.1.1). Router A is marked as FAILED in red, while Router B sits idle. Internet is shown as unreachable.

### Speaker Notes

**The Single Point of Failure Problem (5 minutes):**

Let's set up the scenario. You have a typical network:
- Multiple PCs on a LAN (192.168.1.0/24)
- Router A serves as their default gateway (192.168.1.1)
- Router B is also connected to the LAN for redundancy

Every PC is configured like this:
```
IP address: 192.168.1.10
Subnet mask: 255.255.255.0
Default gateway: 192.168.1.1  ← Router A
```

**What Happens When Router A Fails?**

(Pause for dramatic effect)

EVERYTHING STOPS. Every PC loses external connectivity. Why?

1. PCs have 192.168.1.1 hardcoded as their gateway
2. When Router A fails, that IP is unreachable
3. Router B exists, but PCs don't know about it
4. PCs have no way to automatically switch to Router B

**The Manual Solution (and why it's terrible):**

"Just reconfigure all the PCs to use 192.168.1.2 as the gateway!"

Problems:
- Requires touching every single device
- May require physical access
- Takes significant time (hours in large networks)
- Prone to errors and misconfigurations
- User downtime extends for the entire reconfiguration period

**Discussion Prompt:**

Ask students: "Can you think of any workarounds? What if we configured half the PCs with gateway .1 and half with .2?"

Common (flawed) answers:
- "Half on each gateway" - What if one router is slower? Load imbalance. Plus still 50% outage if one fails.
- "Use DHCP to push new gateway" - Still requires DHCP lease renewal, not instantaneous
- "Run a routing protocol on the PCs" - Clients don't run routing protocols!

The real solution is FHRP!

**Key Point:**

The problem isn't just hardware redundancy - we need APPLICATION-LAYER redundancy that's transparent to end devices. This is what FHRP provides.

---

## Slide 3: The Solution

### Visual Description
Shows virtual gateway concept with purple box labeled "192.168.1.254" (virtual IP) above two routers. Router A is marked ACTIVE (green), Router B is STANDBY (gray). PCs all point to the virtual IP.

### Speaker Notes

**The FHRP Solution (5 minutes):**

FHRPs introduce a brilliant concept: the **virtual router**.

**How It Works:**

Instead of configuring PCs with a physical router's IP, they use a VIRTUAL IP:
```
IP address: 192.168.1.10
Subnet mask: 255.255.255.0
Default gateway: 192.168.1.254  ← VIRTUAL IP (not tied to any single router)
```

**The Magic Behind the Scenes:**

1. **Router A** (192.168.1.1) and **Router B** (192.168.1.2) both know about the virtual IP 192.168.1.254
2. They negotiate which one will be **ACTIVE** (handles traffic)
3. The other becomes **STANDBY** (monitors the active router)
4. The active router "owns" the virtual IP and virtual MAC
5. PCs send traffic to 192.168.1.254, and the active router responds

**When Failover Happens:**

1. Active router fails (hardware, cable, power, etc.)
2. Standby router detects the failure (missed hello messages)
3. Standby router becomes active (typically within seconds)
4. Standby router assumes the virtual IP and MAC
5. PCs continue sending to 192.168.1.254 - seamless!

**The Benefits:**

- **Transparent failover:** PCs don't need reconfiguration
- **Fast convergence:** Switchover happens in seconds (3-10 seconds typical)
- **Automatic recovery:** When failed router comes back, it can resume active role
- **No application disruption:** Existing connections fail, but new connections work immediately

**Analogy Time:**

Think of it like a company's main phone number. When you call 1-800-COMPANY:
- It might ring at Person A's desk (active router)
- If Person A is out, it automatically forwards to Person B (standby)
- You still called the same number - you don't know or care who answered

That's exactly what FHRP does for default gateways!

**Key Terminology:**

- **Virtual IP (VIP):** The IP address end devices use as their gateway
- **Virtual MAC:** The MAC address associated with the virtual IP
- **Active Router:** The router currently forwarding traffic for the VIP
- **Standby Router:** The backup router ready to take over
- **Hello Messages:** Keep-alive packets exchanged between routers

**Exam Focus:**

The CCNA will test your understanding that:
- End devices see ONE logical gateway (the virtual IP)
- Multiple physical routers share responsibility for that gateway
- Failover is automatic and transparent to end devices

---

## Slide 4: Three Protocols

### Visual Description
Three side-by-side boxes comparing HSRP (blue, Cisco Proprietary), VRRP (green, IEEE Standard), and GLBP (orange, Cisco Proprietary with load balancing).

### Speaker Notes

**Three Ways to Achieve the Same Goal (8 minutes):**

The networking industry developed three different protocols to solve the same problem. Each has its place.

**HSRP (Hot Standby Router Protocol):**

- **Created by:** Cisco in 1994
- **Vendor:** Cisco proprietary (only works between Cisco devices)
- **Market share:** Most common in enterprise Cisco networks
- **Versions:** HSRPv1 and HSRPv2
- **Model:** One active, one standby (others are listening)
- **CCNA focus:** This is the protocol you'll configure most on the exam

**When to use HSRP:**
- All-Cisco network
- Enterprise deployments
- When you need mature, well-documented protocol
- CCNA exam scenarios (default choice)

**VRRP (Virtual Router Redundancy Protocol):**

- **Created by:** IETF in 1998
- **Standard:** RFC 5798 (open standard)
- **Vendor:** Works with ANY vendor (Cisco, Juniper, Arista, etc.)
- **Model:** One master, one or more backups
- **Philosophy:** Very similar to HSRP with some key differences

**When to use VRRP:**
- Multi-vendor environment
- Standards compliance required
- When you want vendor independence
- ISPs and service providers

**GLBP (Gateway Load Balancing Protocol):**

- **Created by:** Cisco in 2005
- **Vendor:** Cisco proprietary
- **Unique feature:** LOAD BALANCING (not just redundancy)
- **Model:** All routers can forward traffic simultaneously
- **Roles:** One AVG (Active Virtual Gateway), multiple AVFs (Active Virtual Forwarders)

**When to use GLBP:**
- You want to utilize bandwidth from multiple gateways
- All routers should share the load, not just provide backup
- More complex configuration acceptable
- Cisco-only environment

**The Key Difference:**

HSRP/VRRP model:
```
Active → forwards ALL traffic
Standby → sits idle, monitoring active
```

GLBP model:
```
Router 1 → forwards traffic for some hosts
Router 2 → forwards traffic for other hosts
Router 3 → forwards traffic for remaining hosts
All routers actively forwarding!
```

**Exam Strategy:**

If the question doesn't specify multi-vendor or load balancing, assume HSRP. The CCNA focuses heavily on HSRP because:
1. It's Cisco's protocol
2. It's the most deployed
3. It's simpler than GLBP
4. Understanding HSRP makes VRRP easy to learn

**Interactive Question:**

"If I told you that you're building a new data center with Cisco and Juniper routers, which FHRP would you choose?"

Answer: VRRP (only open standard that works with both)

---

## Slide 5: HSRP Deep Dive

### Visual Description
Table comparing HSRPv1 and HSRPv2 with detailed specifications: group range, multicast addresses, virtual MAC formats, transport protocol, timers.

### Speaker Notes

**HSRP Technical Specifications (7 minutes):**

Let's dive deep into HSRP because this is what you'll configure most often.

**Two Versions: HSRPv1 and HSRPv2**

**HSRPv1 (Legacy):**
- **Group range:** 0-255 (only 256 groups possible)
- **Multicast address:** 224.0.0.2 (all routers multicast group)
- **Virtual MAC:** 0000.0c07.ac**XX** (XX = group number in hex)
- **Default:** Most older IOS versions

**HSRPv2 (Modern - Recommended):**
- **Group range:** 0-4095 (4,096 groups - massive improvement!)
- **Multicast address:** 224.0.0.102 (dedicated HSRP multicast)
- **Virtual MAC:** 0000.0c9f.f**XXX** (XXX = group number in hex)
- **Benefit:** More groups, better multicast address, IPv6 support

**What's the Same:**
- Both use UDP port 1985
- Same hello/hold timers (3s hello, 10s hold by default)
- Same priority range (0-255, default 100)
- Same operational model (active/standby)

**Virtual MAC Address Format (CRITICAL FOR EXAM):**

This is tested heavily! You need to recognize HSRP by the MAC address.

**HSRPv1 Example:**
- Group 10 = 0000.0c07.ac**0a** (0a is hex for 10)
- Group 50 = 0000.0c07.ac**32** (32 is hex for 50)
- Group 255 = 0000.0c07.ac**ff**

**HSRPv2 Example:**
- Group 10 = 0000.0c9f.f**00a**
- Group 100 = 0000.0c9f.f**064** (64 is hex for 100)
- Group 4000 = 0000.0c9f.f**fa0**

**Why This Matters:**

In simulation questions, you might see:
```
PC> arp -a
192.168.1.254    00-00-0c-07-ac-0a
```

You should immediately recognize:
- This is HSRP (0c07.ac pattern)
- It's version 1 (0c07.ac vs 0c9f.f)
- It's group 10 (0a in hex)

**Multicast Addressing:**

**HSRPv1 uses 224.0.0.2:**
- Problem: Shared with other protocols
- Issue: Some switches might treat it specially (IGMP snooping issues)

**HSRPv2 uses 224.0.0.102:**
- Dedicated to HSRP
- Cleaner operation
- Better filtering/ACL possibilities

**Protocol Details:**

Both versions use UDP 1985 for hello messages:
```
Source IP: Physical interface IP
Destination IP: 224.0.0.2 or 224.0.0.102
Protocol: UDP
Port: 1985
```

**Default Timers:**

- **Hello interval:** 3 seconds (how often hellos are sent)
- **Hold time:** 10 seconds (how long to wait before declaring active router dead)

Math: After 3 missed hellos (9 seconds + small buffer), standby takes over.

**Election Process:**

1. Highest priority wins (default 100)
2. If tied, highest IP address wins
3. Active router stays active unless:
   - It fails
   - Higher priority router with preemption enabled comes online

**Exam Tips:**

- Know both MAC address formats cold
- Understand why v2 is better (more groups, dedicated multicast)
- Remember: UDP 1985 for both versions
- Default timers: 3s hello, 10s hold

---

## Slide 6: VRRP Deep Dive

### Visual Description
Table showing VRRP specifications: group range 1-255, multicast 224.0.0.18, virtual MAC 0000.5e00.01XX, IP protocol 112, advertisement timer 1s.

### Speaker Notes

**VRRP: The Open Standard (6 minutes):**

VRRP was created by IETF to provide a vendor-neutral alternative to HSRP. It's very similar in concept but has important differences.

**VRRP Specifications:**

- **Group range:** 1-255 (note: starts at 1, not 0!)
- **Multicast address:** 224.0.0.18 (VRRP-specific)
- **Transport:** IP protocol 112 (NOT UDP! Direct IP encapsulation)
- **Virtual MAC:** 0000.5e00.01**XX** (XX = group in hex)
- **Default timer:** 1 second advertisements
- **Priority range:** 1-254 (255 is special - reserved for IP address owner)

**Key Differences from HSRP:**

**1. Terminology:**
- HSRP: Active/Standby
- VRRP: Master/Backup
(Same concept, different words)

**2. Preemption:**
- HSRP: Disabled by default
- VRRP: **Enabled by default!**

This is HUGE. In VRRP, if a higher-priority router comes online, it automatically takes over as master. In HSRP, you must explicitly enable preemption.

**3. Transport:**
- HSRP: UDP 1985
- VRRP: IP protocol 112

VRRP doesn't use UDP at all - it's directly encapsulated in IP. This can matter for:
- Firewall rules (must permit IP protocol 112, not a UDP port)
- Packet filters
- ACLs

**4. Timers:**
- HSRP: 3s hello, 10s hold
- VRRP: 1s advertisement (faster default!)

VRRP fails over faster out-of-the-box.

**Virtual MAC Address Format:**

VRRP uses: 0000.5e00.01**XX**

Examples:
- Group 10 = 0000.5e00.01**0a**
- Group 50 = 0000.5e00.01**32**
- Group 100 = 0000.5e00.01**64**

**Recognizing VRRP in the Wild:**

```
PC> arp -a
192.168.1.254    00-00-5e-00-01-0a
```

This is VRRP because:
- Starts with 0000.5e00.01 (VRRP pattern)
- Last byte is 0a (group 10)

**Priority Behavior:**

VRRP has a special case: **IP Address Owner**

If a router's physical interface IP matches the virtual IP, it gets priority 255 automatically (highest possible). This ensures the "real" owner of the IP always becomes master if it's available.

Example:
```
Router A: 192.168.1.1
Router B: 192.168.1.254  ← Matches virtual IP!
Virtual IP: 192.168.1.254

Router B automatically gets priority 255 and becomes master.
```

This is rarely used but appears in exam questions!

**Preemption (Critical Difference):**

VRRP enables preemption by default. This means:

Scenario:
1. Router A (priority 110) is master
2. Router A fails
3. Router B (priority 90) becomes master
4. Router A comes back online
5. **Router A automatically reclaims master role** (preemption)

In HSRP, step 5 wouldn't happen unless you configured `standby preempt`.

**When to Use VRRP:**

- Multi-vendor environment (Cisco + Juniper + Arista)
- Standards compliance required (government, regulated industries)
- Service provider networks
- When you want faster default failover (1s vs 3s)

**Exam Tips:**

- Remember: IP protocol 112, not UDP
- Preemption ON by default (opposite of HSRP)
- Master/Backup terminology (not Active/Standby)
- Virtual MAC: 0000.5e00.01XX
- Faster default timers than HSRP

---

## Slide 7: GLBP Deep Dive

### Visual Description
Table showing GLBP specs: group range 0-1023, multicast 224.0.0.102, virtual MAC 0007.b400.XXYY, UDP 3222, includes AVG/AVF roles.

### Speaker Notes

**GLBP: Redundancy PLUS Load Balancing (7 minutes):**

GLBP is Cisco's most advanced FHRP. It solves a problem that HSRP/VRRP don't address: why have standby routers sitting idle when they could be forwarding traffic?

**The GLBP Model:**

Unlike HSRP/VRRP where only ONE router forwards traffic, GLBP allows ALL routers to forward simultaneously.

**GLBP Roles:**

**AVG (Active Virtual Gateway):**
- Master of the GLBP group
- Elected based on priority (like HSRP active)
- Assigns virtual MAC addresses to AVFs
- Responds to ARP requests for the virtual IP
- Only ONE AVG per group

**AVF (Active Virtual Forwarder):**
- Router that actually forwards traffic
- Up to 4 AVFs can be active simultaneously
- Each AVF gets a unique virtual MAC address
- ALL routers in the group can be AVFs

**How It Works:**

1. Four routers in GLBP group 1
2. One becomes AVG (highest priority)
3. All four become AVFs (all can forward)
4. Each AVF gets a virtual MAC:
   - AVF 1: 0007.b400.0101
   - AVF 2: 0007.b400.0102
   - AVF 3: 0007.b400.0103
   - AVF 4: 0007.b400.0104

5. When PC does ARP for virtual IP (192.168.1.254):
   - AVG responds with one of the virtual MACs
   - AVG rotates which MAC it gives (load balancing!)

**Virtual MAC Address Format:**

GLBP uses: 0007.b400.**XXYY**
- **XX** = Group number in hex
- **YY** = Forwarder number in hex

Examples:
- Group 1, Forwarder 1 = 0007.b400.0101
- Group 1, Forwarder 2 = 0007.b400.0102
- Group 10, Forwarder 3 = 0007.b400.0a03
- Group 50, Forwarder 1 = 0007.b400.3201

**Load Balancing Methods:**

GLBP supports three load balancing methods:

**1. Round-Robin (Default):**
```
PC-A does ARP → Gets MAC ending in 01 (Router A)
PC-B does ARP → Gets MAC ending in 02 (Router B)
PC-C does ARP → Gets MAC ending in 03 (Router C)
PC-D does ARP → Gets MAC ending in 04 (Router D)
PC-E does ARP → Gets MAC ending in 01 (Router A again)
```
Even distribution across all AVFs.

**2. Weighted:**
```
Router A: weight 50 → Gets ~50% of traffic
Router B: weight 30 → Gets ~30% of traffic
Router C: weight 20 → Gets ~20% of traffic
```
Useful when routers have different capacities.

**3. Host-Dependent:**
```
PC-A always uses Router A (consistent)
PC-B always uses Router B
```
Same host always gets same forwarder (useful for tracking, ACLs, etc.).

**Technical Specifications:**

- **Group range:** 0-1023
- **Multicast:** 224.0.0.102 (same as HSRPv2)
- **Transport:** UDP 3222
- **Timers:** 3s hello, 10s hold (same as HSRP)
- **Max AVFs:** 4 active forwarders per group
- **Preemption:** Disabled by default (like HSRP)

**The Advantage:**

Traditional HSRP with 4 routers:
```
Router A: Active → Forwards 100% of traffic
Router B: Standby → Idle
Router C: Listening → Idle
Router D: Listening → Idle

Result: 75% of hardware sitting idle!
```

GLBP with 4 routers:
```
Router A: AVG + AVF1 → Forwards ~25% of traffic
Router B: AVF2 → Forwards ~25% of traffic
Router C: AVF3 → Forwards ~25% of traffic
Router D: AVF4 → Forwards ~25% of traffic

Result: All hardware utilized!
```

**The Complexity Cost:**

GLBP is more complex:
- More state to manage
- More complicated troubleshooting
- Virtual MAC addressing is more complex
- Not all engineers are familiar with it

**When to Use GLBP:**

- You have multiple routers and want to use them all
- Bandwidth utilization is important
- You can handle the additional complexity
- All-Cisco environment
- Large campus or data center networks

**When NOT to Use GLBP:**

- Simple networks (2 routers = HSRP is fine)
- Multi-vendor environment (use VRRP)
- Team unfamiliar with GLBP
- When simplicity is preferred

**Exam Tips:**

- GLBP is Cisco proprietary (like HSRP)
- Virtual MAC: 0007.b400.XXYY (recognize this pattern!)
- UDP 3222 (different from HSRP's 1985)
- Load balancing is the key differentiator
- AVG assigns MACs, AVFs forward traffic

---

## Slide 8: Protocol Comparison

### Visual Description
Large comparison table with all three protocols side-by-side showing vendor, active routers, terminology, multicast, transport, virtual MAC, timers, preemption, load balancing.

### Speaker Notes

**Side-by-Side Comparison (5 minutes):**

This slide is your exam cheat sheet. Let's walk through the key comparison points.

**Vendor and Standards:**

| Protocol | Vendor | Standard |
|----------|--------|----------|
| HSRP | Cisco only | None |
| VRRP | Any vendor | RFC 5798 |
| GLBP | Cisco only | None |

**Exam trap:** "Which FHRP works in a multi-vendor environment?" → VRRP (only one)

**Active Router Count:**

| Protocol | Active Routers |
|----------|----------------|
| HSRP | 1 (Active/Standby model) |
| VRRP | 1 (Master/Backup model) |
| GLBP | Up to 4 (AVG/AVF model) |

**Exam trap:** "Which FHRP provides load balancing?" → GLBP (only one)

**Multicast Addresses (Memorize These!):**

| Protocol | Multicast |
|----------|-----------|
| HSRPv1 | 224.0.0.2 |
| HSRPv2 | 224.0.0.102 |
| VRRP | 224.0.0.18 |
| GLBP | 224.0.0.102 |

**Memory trick:**
- VRRP is 18 (VR = 18 letters from start of alphabet... okay that doesn't work)
- Just memorize: VRRP = .18, HSRPv1 = .2, HSRPv2/GLBP = .102

**Transport Protocol:**

| Protocol | Transport |
|----------|-----------|
| HSRP | UDP 1985 |
| VRRP | IP Protocol 112 |
| GLBP | UDP 3222 |

**Exam trap:** "Which FHRP doesn't use UDP?" → VRRP (uses raw IP)

**Virtual MAC Addresses (SUPER IMPORTANT FOR EXAM!):**

| Protocol | Format | Example (Group 10) |
|----------|--------|-------------------|
| HSRPv1 | 0000.0c07.acXX | 0000.0c07.ac0a |
| HSRPv2 | 0000.0c9f.fXXX | 0000.0c9f.f00a |
| VRRP | 0000.5e00.01XX | 0000.5e00.010a |
| GLBP | 0007.b400.XXYY | 0007.b400.0a01 |

**Recognition drill:**
- See 0000.0c07.ac → HSRPv1
- See 0000.0c9f.f → HSRPv2
- See 0000.5e00.01 → VRRP
- See 0007.b400 → GLBP

**Preemption Defaults:**

| Protocol | Preemption Default |
|----------|-------------------|
| HSRP | Disabled (manual) |
| VRRP | Enabled (automatic) |
| GLBP | Disabled (manual) |

**Exam trap:** "Which protocol preempts by default?" → VRRP (only one)

**Default Timers:**

| Protocol | Hello | Hold/Dead |
|----------|-------|-----------|
| HSRP | 3s | 10s |
| VRRP | 1s advert | 3 × advert |
| GLBP | 3s | 10s |

VRRP fails over fastest by default (1 second vs 3 second hellos).

**Practice Scenario:**

"You see a MAC address of 0000.5e00.0132 in a packet capture. What protocol is running and what group?"

Answer breakdown:
1. 0000.5e00.01 → VRRP
2. Last byte = 32 hex = 50 decimal
3. Answer: VRRP group 50

**Quick Decision Tree:**

Need multi-vendor support? → **VRRP**
Need load balancing? → **GLBP**
Cisco-only, simple redundancy? → **HSRP**

---

## Slide 9: HSRP States

### Visual Description
State machine diagram showing progression: Initial → Learn → Listen → Speak → Standby → Active, with arrows connecting each state.

### Speaker Notes

**HSRP State Machine (6 minutes):**

Understanding HSRP states helps you troubleshoot "Why isn't my HSRP working?" Let's walk through each state.

**State 1: Initial**

- **When:** Interface first comes up, HSRP starting
- **What's happening:** HSRP process initializing
- **Sends hellos:** No
- **Forwards traffic:** No
- **Duration:** Very brief, milliseconds typically
- **Next:** Learn or Listen

**State 2: Learn**

- **When:** Router doesn't know the virtual IP yet
- **What's happening:** Waiting to hear hello from active router to learn VIP
- **Sends hellos:** No
- **Forwards traffic:** No
- **Use case:** When you configure HSRP but don't specify the virtual IP yet
- **Next:** Listen (after learning VIP or timeout)

**Note:** This state is rarely seen in practice because you almost always configure the virtual IP explicitly.

**State 3: Listen**

- **When:** Router knows VIP, monitoring the network
- **What's happening:** Listening for hello messages from active/standby routers
- **Sends hellos:** No
- **Forwards traffic:** No
- **Purpose:** Determine if there's already an active router
- **Duration:** Until hold timer expires without hearing from active/standby
- **Next:** Speak

**State 4: Speak**

- **When:** Router is participating in the election
- **What's happening:** Sending hello messages, comparing priorities
- **Sends hellos:** Yes (actively negotiating)
- **Forwards traffic:** No
- **Purpose:** Compete to become active or standby
- **Duration:** Until election completes
- **Next:** Standby or Active (based on priority)

**State 5: Standby**

- **When:** Lost the election, backup router
- **What's happening:** Monitoring the active router for failure
- **Sends hellos:** Yes (so others know standby exists)
- **Forwards traffic:** No (only monitors)
- **Purpose:** Be ready to instantly take over if active fails
- **Promotion:** Becomes active if:
  - Active router fails (hold timer expires)
  - Active router manually shut down
- **Next:** Active (on failure) or Listen (if preempted)

**State 6: Active**

- **When:** Won the election or took over from failed active
- **What's happening:** Forwarding traffic for the virtual IP
- **Sends hellos:** Yes (to prove it's alive)
- **Forwards traffic:** Yes (this is the working router)
- **Responsibilities:**
  - Respond to ARP requests for VIP
  - Forward packets destined to VIP
  - Send periodic hellos
  - Maintain virtual MAC ownership
- **Demotion:** Becomes Speak if:
  - Higher priority router preempts (if preemption enabled)
  - Admin shutdown

**Visualizing State Transitions:**

Normal startup (no other routers):
```
Initial → Listen → Speak → Active
  (1ms)    (10s)    (3s)
```

Normal startup (active router already exists, this is standby):
```
Initial → Listen → Speak → Standby
  (1ms)    (hears active)  (lost election)
```

Failover scenario:
```
Standby → Active
(immediately when hold timer expires)
```

**Troubleshooting with States:**

**Problem:** Router stuck in Listen state
- **Cause:** Hearing hellos from another router
- **Action:** Check if another router is already active

**Problem:** Router stuck in Speak state
- **Cause:** Can't determine active/standby (priority tie?)
- **Action:** Check priorities and IP addresses

**Problem:** Router stuck in Init
- **Cause:** Configuration error
- **Action:** Check `show standby` for error messages

**Verification:**

```
Router# show standby
GigabitEthernet0/0 - Group 1
  State is Active  ← This tells you current state!
  Virtual IP address is 192.168.1.254
  Active router is local
  Standby router is 192.168.1.2
```

**Exam Focus:**

Know the difference between:
- **Listen:** Not sending hellos (passive monitoring)
- **Speak:** Sending hellos (active negotiation)
- **Standby:** Sending hellos but not forwarding
- **Active:** Sending hellos AND forwarding

**Common Exam Question:**

"In which HSRP state does the router forward traffic for the virtual IP?"
Answer: **Active** (only state that forwards)

---

## Slide 10: Priority and Preemption

### Visual Description
Shows priority configuration examples and explains preemption behavior with timeline diagrams showing when routers take over active role.

### Speaker Notes

**Priority: Who Should Be Active? (8 minutes):**

Priority determines which router becomes active in HSRP/VRRP/GLBP.

**Priority Basics:**

- **Range:** 0-255 (HSRP/GLBP), 1-254 (VRRP)
- **Default:** 100 (all protocols)
- **Rule:** Higher priority wins
- **Tiebreaker:** If priorities match, highest IP address wins

**Example Scenario:**

```
Router A: IP 192.168.1.1, Priority 110
Router B: IP 192.168.1.2, Priority 100

Result: Router A becomes active (higher priority)
```

**Tiebreaker Example:**

```
Router A: IP 192.168.1.1, Priority 100
Router B: IP 192.168.1.2, Priority 100

Result: Router B becomes active (higher IP, 192.168.1.2 > 192.168.1.1)
```

**Why Configure Priority?**

You want to control which router is active based on:
- **Bandwidth:** Router with faster uplink should be active
- **Location:** Router closer to destination should be active
- **Resources:** Router with more CPU/memory should be active
- **Administrative:** You simply prefer one router as primary

**Configuration:**

HSRP:
```
interface GigabitEthernet0/0
 standby 1 priority 110
```

VRRP:
```
interface GigabitEthernet0/0
 vrrp 1 priority 110
```

GLBP:
```
interface GigabitEthernet0/0
 glbp 1 priority 110
```

**Preemption: Can You Take Over Later?**

Preemption determines whether a higher-priority router can reclaim the active role after it comes online.

**Without Preemption (HSRP/GLBP Default):**

Timeline:
```
T=0:  Router A (pri 110) boots
      Becomes active
T=60: Router A fails
T=61: Router B (pri 100) becomes active
T=120: Router A comes back online
      Sees Router B is active
      Router B has lower priority...
      BUT Router A does NOT take over! (preemption disabled)
      Router B stays active
```

Result: Lower-priority router stays active until it fails.

**With Preemption (VRRP Default):**

Timeline:
```
T=0:  Router A (pri 110) boots
      Becomes active
T=60: Router A fails
T=61: Router B (pri 100) becomes active
T=120: Router A comes back online
      Sees Router B is active
      Router B has lower priority...
      Router A takes over! (preemption enabled)
      Router A becomes active again
```

Result: Higher-priority router always reclaims active role.

**Configuration:**

Enable preemption on HSRP:
```
interface GigabitEthernet0/0
 standby 1 preempt
```

Enable preemption on GLBP:
```
interface GigabitEthernet0/0
 glbp 1 preempt
```

VRRP: Preemption enabled by default (no command needed to enable).

**Preemption Delay:**

You can add a delay to prevent flapping:

```
interface GigabitEthernet0/0
 standby 1 preempt delay minimum 60
```

This means: "Wait 60 seconds after coming online before preempting."

Why? If a router is rebooting frequently (unstable), you don't want it constantly taking over and disrupting service.

**When to Use Preemption:**

**Enable preemption when:**
- You have a clear preferred active router
- Higher-priority router has better path/bandwidth
- You want deterministic behavior (always the same router active)
- You're using interface tracking (covered later)

**Disable preemption when:**
- All routers are equally capable
- You want to avoid unnecessary failovers
- Stability is more important than optimal path
- Routers are frequently rebooting (unstable hardware)

**Real-World Example:**

Data center scenario:
- Router A: Direct 10 Gbps link to core
- Router B: Backup path through lower-speed aggregation switch

Configuration:
```
Router A:
 standby 1 priority 110
 standby 1 preempt

Router B:
 standby 1 priority 90
 ! No preempt needed (not becoming active unless A fails)
```

Result: Router A is always active when available (better path).

**Exam Traps:**

**Question:** "Two routers have priority 100. Which becomes active?"
**Common Wrong Answer:** "Neither, they need different priorities"
**Correct Answer:** "Highest IP address breaks the tie"

**Question:** "HSRP Router A (priority 110) fails. Router B (priority 90) becomes active. Router A comes back. What happens?"
**Trap:** Students assume A takes over
**Answer:** "Depends on preemption! Without preempt configured, B stays active. With preempt, A takes over."

**Memory Aids:**

- **Priority:** "Who should lead?" (higher number = leader)
- **Preemption:** "Can I take it back?" (enabled = yes)
- **VRRP preempts by default** (remember: VRRP Victorious, Very Ready to Preempt)

---

## Slide 11: HSRP Configuration

### Visual Description
Step-by-step HSRP configuration showing Router A (active with priority 110 and preemption) and Router B (standby with default priority).

### Speaker Notes

**Configuring HSRP (7 minutes):**

Let's walk through a complete HSRP configuration step by step.

**Scenario:**
- Two routers on 192.168.1.0/24 network
- Router A: 192.168.1.1 (preferred active)
- Router B: 192.168.1.2 (standby)
- Virtual gateway: 192.168.1.254
- HSRP group: 1

**Router A Configuration (Preferred Active):**

```
Router-A(config)# interface GigabitEthernet0/0
Router-A(config-if)# description LAN Interface - HSRP Active
Router-A(config-if)# ip address 192.168.1.1 255.255.255.0
Router-A(config-if)# standby 1 ip 192.168.1.254
Router-A(config-if)# standby 1 priority 110
Router-A(config-if)# standby 1 preempt
Router-A(config-if)# no shutdown
```

**Router B Configuration (Standby):**

```
Router-B(config)# interface GigabitEthernet0/0
Router-B(config-if)# description LAN Interface - HSRP Standby
Router-B(config-if)# ip address 192.168.1.2 255.255.255.0
Router-B(config-if)# standby 1 ip 192.168.1.254
Router-B(config-if)# standby 1 priority 90
Router-B(config-if)# no shutdown
```

**Command Breakdown:**

**standby [group] ip [virtual-ip]**
- Enables HSRP on the interface
- Creates group number (0-255 for v1, 0-4095 for v2)
- Sets the virtual IP that end devices will use
- Example: `standby 1 ip 192.168.1.254`

**standby [group] priority [value]**
- Sets router's priority (0-255, default 100)
- Higher value = more likely to be active
- Example: `standby 1 priority 110`

**standby [group] preempt**
- Enables preemption (disabled by default)
- Allows higher-priority router to reclaim active role
- Example: `standby 1 preempt`
- Optional: Add delay with `standby 1 preempt delay minimum 60`

**Optional: Adjust Timers**

```
Router-A(config-if)# standby 1 timers 1 3
```
- First number: Hello interval (default 3 seconds)
- Second number: Hold time (default 10 seconds)
- Must match on all routers in the group!

**Optional: Use HSRPv2**

```
Router-A(config-if)# standby version 2
Router-A(config-if)# standby 1 ip 192.168.1.254
```
- Enables HSRP version 2
- Must be configured BEFORE other standby commands
- Provides more groups (0-4095) and better MAC format

**What Happens After Configuration:**

1. Both routers send HSRP hellos on 224.0.0.2 (v1) or 224.0.0.102 (v2)
2. They compare priorities:
   - Router A: 110
   - Router B: 90
3. Router A wins, becomes Active
4. Router B becomes Standby
5. Router A assumes virtual IP 192.168.1.254 and virtual MAC 0000.0c07.ac01
6. End devices use 192.168.1.254 as their gateway

**Verification After Configuration:**

```
Router-A# show standby
GigabitEthernet0/0 - Group 1
  State is Active
    2 state changes, last state change 00:00:12
  Virtual IP address is 192.168.1.254
  Active virtual MAC address is 0000.0c07.ac01
    Local virtual MAC address is 0000.0c07.ac01 (v1 default)
  Hello time 3 sec, hold time 10 sec
  Next hello sent in 1.232 secs
  Preemption enabled
  Active router is local
  Standby router is 192.168.1.2, priority 90 (expires in 9.232 sec)
  Priority 110 (configured 110)
```

**Key fields to verify:**
- State: Should be "Active" on Router A, "Standby" on Router B
- Virtual IP: Should match your configuration
- Virtual MAC: Should be 0000.0c07.ac01 (group 1)
- Preemption: Should show "enabled" on Router A
- Standby router: Router A should see Router B listed

**Common Configuration Mistakes:**

**Mistake 1: Different virtual IPs**
```
Router A: standby 1 ip 192.168.1.254
Router B: standby 1 ip 192.168.1.253  ← WRONG!
```
Result: Each router thinks it's in a different HSRP group. Both become active for their own VIP!

**Mistake 2: Different group numbers**
```
Router A: standby 1 ip 192.168.1.254
Router B: standby 2 ip 192.168.1.254  ← WRONG!
```
Result: Different groups, no redundancy.

**Mistake 3: Forgetting preemption**
```
Router A: priority 110, no preempt configured
```
Result: If Router A fails and recovers, Router B (lower priority) stays active.

**Mistake 4: Mismatched timers**
```
Router A: standby 1 timers 1 3
Router B: standby 1 timers 3 10  ← Different!
```
Result: Potential instability, unexpected failovers.

**Lab Exercise:**

Have students configure:
1. HSRP group 10 with virtual IP 10.1.1.254
2. Router A priority 150
3. Router B priority 50
4. Enable preemption on both
5. Verify with `show standby`
6. Test failover by shutting down Router A's interface
7. Observe Router B take over
8. Bring Router A back up
9. Observe Router A reclaim active role (preemption)

---

## Slide 12: VRRP Configuration

### Visual Description
VRRP configuration examples showing similar structure to HSRP but with vrrp commands instead of standby. Includes comparison table of HSRP vs VRRP commands.

### Speaker Notes

**Configuring VRRP (6 minutes):**

VRRP configuration is very similar to HSRP. The main difference is the command syntax and preemption defaults.

**Same Scenario, VRRP Version:**
- Two routers on 192.168.1.0/24 network
- Router A: 192.168.1.1 (preferred master)
- Router B: 192.168.1.2 (backup)
- Virtual gateway: 192.168.1.254
- VRRP group: 1

**Router A Configuration (Preferred Master):**

```
Router-A(config)# interface GigabitEthernet0/0
Router-A(config-if)# description LAN Interface - VRRP Master
Router-A(config-if)# ip address 192.168.1.1 255.255.255.0
Router-A(config-if)# vrrp 1 ip 192.168.1.254
Router-A(config-if)# vrrp 1 priority 110
Router-A(config-if)# no shutdown
```

**Router B Configuration (Backup):**

```
Router-B(config)# interface GigabitEthernet0/0
Router-B(config-if)# description LAN Interface - VRRP Backup
Router-B(config-if)# ip address 192.168.1.2 255.255.255.0
Router-B(config-if)# vrrp 1 ip 192.168.1.254
Router-B(config-if)# vrrp 1 priority 90
Router-B(config-if)# no shutdown
```

**Notice What's Missing?**

No `vrrp 1 preempt` command! Why?

**Preemption is ENABLED by default in VRRP.**

If you wanted to DISABLE preemption (rare):
```
Router-A(config-if)# vrrp 1 preempt disable
```

**HSRP vs VRRP Command Comparison:**

| Function | HSRP | VRRP |
|----------|------|------|
| Enable & set VIP | `standby 1 ip 192.168.1.254` | `vrrp 1 ip 192.168.1.254` |
| Set priority | `standby 1 priority 110` | `vrrp 1 priority 110` |
| Enable preemption | `standby 1 preempt` | (enabled by default) |
| Disable preemption | (default) | `vrrp 1 preempt disable` |
| Adjust timers | `standby 1 timers 1 3` | `vrrp 1 timers advertise 1` |
| Show status | `show standby` | `show vrrp` |

**Timer Configuration (Different from HSRP!):**

VRRP uses "advertisement interval" instead of hello/hold:

```
Router-A(config-if)# vrrp 1 timers advertise 1
```

- Advertisement interval: How often to send VRRP advertisements (default 1 second)
- Master down interval: Calculated as (3 × advertisement interval) + skew time

**Verification:**

```
Router-A# show vrrp

GigabitEthernet0/0 - Group 1
  State is Master
  Virtual IP address is 192.168.1.254
  Virtual MAC address is 0000.5e00.0101
  Advertisement interval is 1.000 sec
  Preemption enabled
  Priority is 110
  Master Router is 192.168.1.1 (local), priority is 110
  Master Advertisement interval is 1.000 sec
  Master Down interval is 3.609 sec
```

**Key differences in show output:**
- "Master" instead of "Active"
- Advertisement interval (1 sec) instead of hello time (3 sec)
- Master Down interval (calculated) instead of hold time

**Brief Version:**

```
Router-A# show vrrp brief

Interface          Grp Pri Time  Own Pre State   Master addr     Group addr
Gi0/0              1   110 3609       Y  Master  192.168.1.1     192.168.1.254
```

**VRRP IP Address Owner (Advanced):**

Special case: If virtual IP matches a physical interface IP:

```
Router-A:
 interface Gi0/0
  ip address 192.168.1.254 255.255.255.0  ← Same as VIP!
  vrrp 1 ip 192.168.1.254
  ! Priority automatically becomes 255 (highest)
```

This router is the "IP address owner" and always becomes master (priority 255).

**When to use:**
- Transitioning from non-redundant to redundant design
- You want one router to "own" the IP definitively
- Rarely used in new designs

**Verification Commands Summary:**

```
show vrrp              ! Detailed VRRP status
show vrrp brief        ! Quick summary
show vrrp interface    ! VRRP on specific interface
show vrrp statistics   ! Packet counts and errors
```

**Troubleshooting Commands:**

```
debug vrrp all         ! WARNING: Very verbose!
debug vrrp errors      ! Just errors
debug vrrp events      ! State changes only
```

**Lab Exercise:**

Configure VRRP and compare behavior to HSRP:
1. Configure VRRP group 1 with VIP 172.16.1.254
2. Set Router A priority to 120
3. Set Router B priority to 80
4. Verify with `show vrrp`
5. Shut down Router A and observe Router B take over
6. Bring Router A back up
7. Observe Router A automatically reclaim master role (preemption)
8. Compare to HSRP behavior without explicit preempt command

---

## Slide 13: GLBP Configuration

### Visual Description
GLBP configuration example showing unique features like load-balancing method configuration. Includes table of load-balancing methods.

### Speaker Notes

**Configuring GLBP (7 minutes):**

GLBP configuration is similar to HSRP but includes load-balancing options that make it unique.

**Scenario:**
- Two routers on 192.168.1.0/24 network
- Router A: 192.168.1.1 (preferred AVG)
- Router B: 192.168.1.2 (secondary AVG, also AVF)
- Virtual gateway: 192.168.1.254
- GLBP group: 1
- Load balancing: Round-robin

**Router A Configuration (Primary AVG):**

```
Router-A(config)# interface GigabitEthernet0/0
Router-A(config-if)# description LAN Interface - GLBP AVG/AVF
Router-A(config-if)# ip address 192.168.1.1 255.255.255.0
Router-A(config-if)# glbp 1 ip 192.168.1.254
Router-A(config-if)# glbp 1 priority 110
Router-A(config-if)# glbp 1 preempt
Router-A(config-if)# glbp 1 load-balancing round-robin
Router-A(config-if)# no shutdown
```

**Router B Configuration (Secondary AVG, Also AVF):**

```
Router-B(config)# interface GigabitEthernet0/0
Router-B(config-if)# description LAN Interface - GLBP AVF
Router-B(config-if)# ip address 192.168.1.2 255.255.255.0
Router-B(config-if)# glbp 1 ip 192.168.1.254
Router-B(config-if)# glbp 1 priority 90
Router-B(config-if)# no shutdown
```

**Command Breakdown:**

**glbp [group] ip [virtual-ip]**
- Enables GLBP on interface
- Sets virtual gateway IP
- Example: `glbp 1 ip 192.168.1.254`

**glbp [group] priority [value]**
- Sets priority for AVG election (0-255, default 100)
- Higher priority becomes AVG
- Example: `glbp 1 priority 110`

**glbp [group] preempt**
- Enables preemption (disabled by default, like HSRP)
- Example: `glbp 1 preempt`

**glbp [group] load-balancing [method]**
- Sets load-balancing method (only on AVG)
- Options: round-robin, weighted, host-dependent
- Example: `glbp 1 load-balancing round-robin`

**Load-Balancing Methods in Detail:**

**1. Round-Robin (Default):**

```
glbp 1 load-balancing round-robin
```

How it works:
- PC-1 does ARP → Gets virtual MAC ending in 01 (Router A)
- PC-2 does ARP → Gets virtual MAC ending in 02 (Router B)
- PC-3 does ARP → Gets virtual MAC ending in 01 (Router A)
- PC-4 does ARP → Gets virtual MAC ending in 02 (Router B)

Result: Even distribution across all AVFs.

Best for: Homogeneous environments where all routers have equal capacity.

**2. Weighted:**

```
Router-A:
 glbp 1 load-balancing weighted
 glbp 1 weighting 150

Router-B:
 glbp 1 load-balancing weighted
 glbp 1 weighting 100
```

How it works:
- Routers receive traffic proportional to their weight
- Router A (150) gets ~60% of new hosts
- Router B (100) gets ~40% of new hosts

Result: Higher-capacity routers handle more traffic.

Best for: Heterogeneous environments with different router capacities.

**3. Host-Dependent:**

```
glbp 1 load-balancing host-dependent
```

How it works:
- Hash algorithm based on host MAC address
- Same host always gets same virtual MAC (same AVF)
- Different hosts distributed across AVFs

Result: Consistent path for each host.

Best for:
- Networks requiring consistent forwarding paths
- Troubleshooting (know which router handles which host)
- Firewalls or monitoring (need predictable paths)

**What Happens After Configuration:**

1. Both routers send GLBP hellos on 224.0.0.102
2. AVG election:
   - Router A: priority 110 → Becomes AVG
   - Router B: priority 90 → Secondary AVG
3. AVF assignment (AVG assigns):
   - Router A: Becomes AVF 1, gets virtual MAC 0007.b400.0101
   - Router B: Becomes AVF 2, gets virtual MAC 0007.b400.0102
4. When hosts do ARP for 192.168.1.254:
   - AVG (Router A) responds with virtual MAC
   - Alternates between 0101 and 0102 (round-robin)

**Verification:**

```
Router-A# show glbp

GigabitEthernet0/0 - Group 1
  State is Active
    2 state changes, last state change 00:00:23
  Virtual IP address is 192.168.1.254
  Hello time 3 sec, hold time 10 sec
  Next hello sent in 0.768 secs
  Redirect time 600 sec, forwarder timeout 14400 sec
  Preemption enabled, min delay 0 sec
  Active is local
  Standby is 192.168.1.2, priority 90 (expires in 9.216 sec)
  Priority 110 (configured)
  Weighting 100 (default 100), thresholds: lower 1, upper 100
  Load balancing: round-robin
  Group members:
    0000.0c07.ac01 (192.168.1.1) local
    0000.0c07.ac02 (192.168.1.2)
  There are 2 forwarders (1 active)
  Forwarder 1
    State is Active
      1 state change, last state change 00:00:18
    MAC address is 0007.b400.0101 (default)
    Owner ID is 0000.0c07.ac01
    Redirection enabled
    Preemption enabled, min delay 30 sec
    Active is local, weighting 100
  Forwarder 2
    State is Active
      1 state change, last state change 00:00:16
    MAC address is 0007.b400.0102 (default)
    Owner ID is 0000.0c07.ac02
    Redirection enabled
    Preemption enabled, min delay 30 sec
    Active is 192.168.1.2, weighting 100
```

**Key fields:**
- State: Active (this is the AVG)
- Load balancing: Shows method (round-robin)
- Forwarders: Lists all AVFs with their virtual MACs
- Each forwarder shows its state (Active)

**Brief Version:**

```
Router-A# show glbp brief

Interface   Grp  Fwd Pri State    Address         Active router   Standby router
Gi0/0       1    -   110 Active   192.168.1.254   local           192.168.1.2
Gi0/0       1    1   -   Active   0007.b400.0101  local           -
Gi0/0       1    2   -   Active   0007.b400.0102  192.168.1.2     -
```

Interpretation:
- Line 1: Group 1, this router is Active (AVG)
- Line 2: Forwarder 1, local router, MAC 0101
- Line 3: Forwarder 2, remote router (.2), MAC 0102

**Advanced: Weighting and Tracking:**

You can adjust weighting dynamically based on tracked objects:

```
track 1 interface GigabitEthernet0/1 line-protocol

interface GigabitEthernet0/0
 glbp 1 weighting 100 lower 75
 glbp 1 weighting track 1 decrement 30
```

How it works:
- Normal weight: 100
- If Gi0/1 goes down: weight drops to 70 (100-30)
- If weight falls below 75 (lower threshold): Router stops being AVF
- When Gi0/1 comes back: weight returns to 100, router becomes AVF again

**Comparison to HSRP/VRRP:**

| Feature | HSRP/VRRP | GLBP |
|---------|-----------|------|
| Active forwarders | 1 | Up to 4 |
| Virtual MACs | 1 | Multiple (1 per AVF) |
| Load balancing | No | Yes |
| Complexity | Simple | More complex |
| Bandwidth utilization | 1 router | All routers |

**When GLBP Makes Sense:**

- You have 2-4 routers and want to use them all
- Traffic volume justifies complexity
- All routers are similar capacity
- You're in a Cisco-only environment

**Lab Exercise:**

1. Configure GLBP with round-robin load balancing
2. Verify both routers are AVFs with `show glbp`
3. From a PC, repeatedly clear ARP cache and ping gateway
4. Observe alternating MAC addresses in ARP table
5. Shut down one router's interface
6. Verify other router takes over both AVF roles
7. Bring interface back up
8. Observe load balancing resume

---

## Slide 14: Virtual MAC Addresses

### Visual Description
Shows virtual MAC formats for all protocols with examples. Color-coded breakdown of each MAC address component.

### Speaker Notes

**Understanding Virtual MAC Addresses (6 minutes):**

Virtual MAC addresses are a critical component of FHRPs and a favorite exam topic. Let's break down each format.

**Why Virtual MACs Exist:**

When a PC needs to send packets to the default gateway:
1. PC does ARP: "Who has 192.168.1.254?"
2. Active router responds with the VIRTUAL MAC (not its physical MAC)
3. PC caches this ARP entry
4. If failover occurs, new active router uses SAME virtual MAC
5. PC's ARP cache doesn't need updating - seamless!

If physical MACs were used, every failover would require ARP cache expiration on all devices.

**HSRP Version 1 Virtual MAC:**

Format: **0000.0c07.ac**XX

Components:
- `0000.0c` = Cisco OUI (Organizationally Unique Identifier)
- `07.ac` = HSRP identifier
- `XX` = Group number in hexadecimal (1 byte = 0-255)

**Examples:**

Group 1 (decimal):
```
1 in hex = 01
Virtual MAC = 0000.0c07.ac01
```

Group 10 (decimal):
```
10 in hex = 0a
Virtual MAC = 0000.0c07.ac0a
```

Group 50 (decimal):
```
50 in hex = 32
Virtual MAC = 0000.0c07.ac32
```

Group 255 (decimal):
```
255 in hex = ff
Virtual MAC = 0000.0c07.acff
```

**HSRP Version 2 Virtual MAC:**

Format: **0000.0c9f.f**XXX

Components:
- `0000.0c` = Cisco OUI
- `9f.f` = HSRPv2 identifier
- `XXX` = Group number in hexadecimal (12 bits = 0-4095)

**Examples:**

Group 1:
```
1 in hex = 001
Virtual MAC = 0000.0c9f.f001
```

Group 10:
```
10 in hex = 00a
Virtual MAC = 0000.0c9f.f00a
```

Group 100:
```
100 in hex = 064
Virtual MAC = 0000.0c9f.f064
```

Group 4095:
```
4095 in hex = fff
Virtual MAC = 0000.0c9f.ffff
```

**VRRP Virtual MAC:**

Format: **0000.5e00.01**XX

Components:
- `0000.5e` = IANA OUI for VRRP
- `00.01` = VRRP identifier
- `XX` = Group number in hexadecimal (1 byte = 1-255)

Note: VRRP groups start at 1, not 0!

**Examples:**

Group 1:
```
1 in hex = 01
Virtual MAC = 0000.5e00.0101
```

Group 10:
```
10 in hex = 0a
Virtual MAC = 0000.5e00.010a
```

Group 100:
```
100 in hex = 64
Virtual MAC = 0000.5e00.0164
```

Group 255:
```
255 in hex = ff
Virtual MAC = 0000.5e00.01ff
```

**GLBP Virtual MAC:**

Format: **0007.b400.**XXYY

Components:
- `0007.b4` = Cisco OUI for GLBP
- `00.` = GLBP identifier
- `XX` = Group number in hexadecimal
- `YY` = Forwarder number in hexadecimal

**Examples:**

Group 1, Forwarder 1:
```
Group 1 = 01, Forwarder 1 = 01
Virtual MAC = 0007.b400.0101
```

Group 1, Forwarder 2:
```
Group 1 = 01, Forwarder 2 = 02
Virtual MAC = 0007.b400.0102
```

Group 10, Forwarder 1:
```
Group 10 = 0a, Forwarder 1 = 01
Virtual MAC = 0007.b400.0a01
```

Group 50, Forwarder 3:
```
Group 50 = 32, Forwarder 3 = 03
Virtual MAC = 0007.b400.3203
```

**Quick Recognition Guide:**

When you see a MAC address, identify the protocol:

```
0000.0c07.acXX   → HSRPv1
0000.0c9f.fXXX   → HSRPv2
0000.5e00.01XX   → VRRP
0007.b400.XXYY   → GLBP
```

**Practice Questions:**

**Question 1:** You see MAC address 0000.0c07.ac14 in the ARP table. What protocol and group?
- Pattern: 0000.0c07.ac → HSRPv1
- Last byte: 14 hex = 20 decimal
- Answer: HSRP version 1, group 20

**Question 2:** MAC address is 0000.5e00.0132. What protocol and group?
- Pattern: 0000.5e00.01 → VRRP
- Last byte: 32 hex = 50 decimal
- Answer: VRRP, group 50

**Question 3:** You see 0007.b400.0502. What protocol, group, and forwarder?
- Pattern: 0007.b400 → GLBP
- Byte 3: 05 hex = 5 decimal (group)
- Byte 4: 02 hex = 2 decimal (forwarder)
- Answer: GLBP group 5, forwarder 2

**Troubleshooting with MAC Addresses:**

**Scenario:** End devices can't reach gateway.

```
PC> arp -a
192.168.1.254    incomplete

Router-A# show standby
State is Active
Virtual MAC address is 0000.0c07.ac01
```

Problem: PC's ARP request isn't being answered.

**Possible causes:**
- HSRP not actually active (check state)
- Layer 2 connectivity issue
- VLAN mismatch
- Firewall blocking HSRP packets

**Scenario:** Two routers both show as Active.

```
Router-A# show standby
State is Active
Virtual MAC is 0000.0c07.ac01

Router-B# show standby
State is Active
Virtual MAC is 0000.0c07.ac01
```

Problem: Split-brain - both think they're active!

**Cause:** Routers can't communicate (Layer 2 issue, different VLANs, etc.)

**Exam Tips:**

Memorize these patterns:
- HSRP v1: 0000.0c07.acXX
- HSRP v2: 0000.0c9f.fXXX
- VRRP: 0000.5e00.01XX
- GLBP: 0007.b400.XXYY

Practice hex conversion:
- 10 decimal = 0a hex
- 50 decimal = 32 hex
- 100 decimal = 64 hex
- 255 decimal = ff hex

---

## Slide 15: Verification Commands

### Visual Description
Shows detailed output of show standby command with annotations explaining each field. Includes examples of show commands for all three protocols.

### Speaker Notes

**Verifying FHRP Operation (6 minutes):**

After configuring FHRP, you need to verify it's working correctly. Let's explore the key verification commands.

**HSRP Verification:**

**Primary Command: show standby**

```
Router-A# show standby

GigabitEthernet0/0 - Group 1
  State is Active
    2 state changes, last state change 00:05:23
  Virtual IP address is 192.168.1.254
  Active virtual MAC address is 0000.0c07.ac01
    Local virtual MAC address is 0000.0c07.ac01 (v1 default)
  Hello time 3 sec, hold time 10 sec
  Next hello sent in 1.456 secs
  Preemption enabled
  Active router is local
  Standby router is 192.168.1.2, priority 90 (expires in 9.456 sec)
  Priority 110 (configured 110)
    Track object 1 state Up decrement 20
  Group name is "hsrp-Gi0/0-1" (default)
```

**Reading this output:**

**State is Active:** This router is the active router (forwarding traffic).
- Possible values: Init, Learn, Listen, Speak, Standby, Active

**State changes:** How many times state has changed.
- If this number is high, investigate instability.

**Virtual IP address:** The gateway IP end devices use.
- Verify this matches your configuration.

**Active virtual MAC:** The MAC address in use.
- Should match expected format for your HSRP version and group.

**Hello time / Hold time:** Current timer values.
- Default: 3s hello, 10s hold
- Verify these match across all routers.

**Preemption:** Shows if preemption is enabled.
- "enabled" or "disabled"

**Active router is local:** This router is active.
- Or: "Active router is 192.168.1.2" (remote)

**Standby router:** Shows the standby router IP and priority.
- Expires in: Shows hold timer countdown
- If this says "unknown", there's no standby (potential problem!)

**Priority:** Shows current priority and configured priority.
- "Priority 110 (configured 110)" = normal
- "Priority 90 (configured 110)" = priority decreased by tracking

**Track object:** Shows interface tracking status.
- State Up = tracked interface is up
- State Down = tracked interface is down, priority decremented

**Brief Version: show standby brief**

```
Router-A# show standby brief

                     P indicates configured to preempt.
                     |
Interface   Grp  Pri P State   Active          Standby         Virtual IP
Gi0/0       1    110 P Active  local           192.168.1.2     192.168.1.254
```

Quick summary:
- Grp: Group number
- Pri: Priority
- P: Preemption (P = enabled)
- State: Current state
- Active: Active router (local or IP)
- Standby: Standby router IP
- Virtual IP: Virtual gateway IP

**VRRP Verification:**

**Primary Command: show vrrp**

```
Router-A# show vrrp

GigabitEthernet0/0 - Group 1
  State is Master
  Virtual IP address is 192.168.1.254
  Virtual MAC address is 0000.5e00.0101
  Advertisement interval is 1.000 sec
  Preemption enabled
  Priority is 110
  Master Router is 192.168.1.1 (local), priority is 110
  Master Advertisement interval is 1.000 sec
  Master Down interval is 3.609 sec
```

**Key differences from HSRP:**
- "Master" instead of "Active"
- Advertisement interval instead of hello time
- Master Down interval (calculated)

**Brief Version: show vrrp brief**

```
Router-A# show vrrp brief

Interface          Grp Pri Time  Own Pre State   Master addr     Group addr
Gi0/0              1   110 3609       Y  Master  192.168.1.1     192.168.1.254
```

**GLBP Verification:**

**Primary Command: show glbp**

```
Router-A# show glbp

GigabitEthernet0/0 - Group 1
  State is Active
    2 state changes, last state change 00:00:23
  Virtual IP address is 192.168.1.254
  Hello time 3 sec, hold time 10 sec
  Next hello sent in 0.768 secs
  Redirect time 600 sec, forwarder timeout 14400 sec
  Preemption enabled, min delay 0 sec
  Active is local
  Standby is 192.168.1.2, priority 90 (expires in 9.216 sec)
  Priority 110 (configured)
  Weighting 100 (default 100), thresholds: lower 1, upper 100
  Load balancing: round-robin
  Group members:
    0000.0c07.ac01 (192.168.1.1) local
    0000.0c07.ac02 (192.168.1.2)
  There are 2 forwarders (2 active)
  Forwarder 1
    State is Active
      1 state change, last state change 00:00:18
    MAC address is 0007.b400.0101 (default)
    Owner ID is 0000.0c07.ac01
    Redirection enabled
    Preemption enabled, min delay 30 sec
    Active is local, weighting 100
  Forwarder 2
    State is Active
      1 state change, last state change 00:00:16
    MAC address is 0007.b400.0102 (default)
    Owner ID is 0000.0c07.ac02
    Redirection enabled
    Preemption enabled, min delay 30 sec
    Active is 192.168.1.2, weighting 100
```

**Key GLBP-specific fields:**
- **Load balancing:** Shows method (round-robin, weighted, host-dependent)
- **Weighting:** Current weight and thresholds
- **Forwarders:** Lists each AVF with its virtual MAC and state

**Brief Version: show glbp brief**

```
Router-A# show glbp brief

Interface   Grp  Fwd Pri State    Address         Active router   Standby router
Gi0/0       1    -   110 Active   192.168.1.254   local           192.168.1.2
Gi0/0       1    1   -   Active   0007.b400.0101  local           -
Gi0/0       1    2   -   Active   0007.b400.0102  192.168.1.2     -
```

**Additional Verification: From End Devices**

**Check ARP entry on PC:**

```
PC> arp -a

Interface: 192.168.1.10 --- 0x2
  Internet Address      Physical Address      Type
  192.168.1.254         00-00-0c-07-ac-01     dynamic
```

Verify:
- Virtual IP is present (192.168.1.254)
- Virtual MAC matches expected FHRP format
- Entry is dynamic (not static)

**Check connectivity:**

```
PC> ping 192.168.1.254

Pinging 192.168.1.254 with 32 bytes of data:
Reply from 192.168.1.254: bytes=32 time=1ms TTL=255
Reply from 192.168.1.254: bytes=32 time=1ms TTL=255
```

**Troubleshooting Commands:**

```
show standby history       ! Shows state change history
show standby statistics    ! Packet counters
show track                 ! Shows tracked objects status
debug standby events       ! Real-time state changes (use carefully!)
debug standby packets      ! See hello packets (verbose!)
```

**What to Look For:**

Healthy HSRP:
- One router in Active state
- One router in Standby state
- Standby router shows correct expire timer (close to hold time)
- Virtual MAC is consistent
- No frequent state changes

Problems to investigate:
- Both routers Active (split-brain)
- No standby router shown (no redundancy!)
- Frequent state changes (instability)
- Standby timer not counting down (not receiving hellos)

---

## Slide 16: Troubleshooting

### Visual Description
Table showing common symptoms, possible causes, and solutions for FHRP issues. Includes troubleshooting methodology.

### Speaker Notes

**Troubleshooting FHRPs (7 minutes):**

Let's explore common FHRP problems and how to diagnose them.

**Problem 1: Both Routers Show Active**

**Symptom:**
```
Router-A# show standby brief
Interface   Grp  Pri P State   Active    Standby         Virtual IP
Gi0/0       1    110 P Active  local     unknown         192.168.1.254

Router-B# show standby brief
Interface   Grp  Pri P State   Active    Standby         Virtual IP
Gi0/0       1    90    Active  local     unknown         192.168.1.254
```

Both routers think they're active!

**Possible Causes:**

1. **Layer 2 connectivity problem:**
   - Routers on different VLANs
   - Physical cable issue
   - Switch port blocking HSRP multicast

2. **HSRP multicast blocked:**
   - ACL blocking 224.0.0.2 or 224.0.0.102
   - Firewall between routers
   - Switch blocking multicast

3. **Different group numbers:**
   - Router A: group 1
   - Router B: group 2
   - Each is active for its own group

**Diagnosis Steps:**

```
1. Verify Layer 2 connectivity:
   Router-A# ping 192.168.1.2

2. Check if hellos are being sent:
   Router-A# debug standby packets

3. Verify group configuration:
   Router-A# show run | include standby

4. Check for ACLs blocking multicast:
   Router-A# show ip access-lists

5. Verify VLAN assignment:
   Router-A# show vlan brief
```

**Solution:**

- Fix Layer 2 connectivity
- Ensure both routers on same VLAN
- Remove ACLs blocking HSRP multicast (224.0.0.2 or 224.0.0.102)
- Verify group numbers match

**Problem 2: No Standby Router**

**Symptom:**
```
Router-A# show standby
GigabitEthernet0/0 - Group 1
  State is Active
  Virtual IP address is 192.168.1.254
  Active router is local
  Standby router is unknown  ← Problem!
```

**Possible Causes:**

1. **Second router not configured:**
   - Router B doesn't have HSRP configured
   - Router B has wrong interface configured

2. **Second router HSRP not enabled:**
   - Interface is shutdown
   - HSRP configuration incomplete

3. **Second router can't see first router:**
   - Layer 2 issue (same as Problem 1)

**Diagnosis:**

```
1. Check second router's HSRP config:
   Router-B# show standby

2. Verify interface status:
   Router-B# show ip interface brief | include Gi0/0

3. Check HSRP packets:
   Router-B# debug standby packets
```

**Solution:**

- Configure HSRP on second router
- Enable interface with `no shutdown`
- Fix Layer 2 connectivity

**Problem 3: Constant State Changes (Flapping)**

**Symptom:**
```
Router-A# show standby
GigabitEthernet0/0 - Group 1
  State is Active
    47 state changes, last state change 00:00:03  ← Too many changes!
```

**Possible Causes:**

1. **Timers too aggressive:**
   - Hello 1s, hold 3s = very sensitive to small delays

2. **Link instability:**
   - Cable problem
   - Duplex mismatch
   - Switch port flapping

3. **Mismatched timers:**
   - Router A: hello 3s, hold 10s
   - Router B: hello 1s, hold 3s
   - Causes timing conflicts

4. **CPU overload:**
   - Router too busy to send hellos on time
   - Other priority processes delaying HSRP

**Diagnosis:**

```
1. Check state change count:
   Router-A# show standby | include state changes

2. Verify timers match:
   Router-A# show standby | include time
   Router-B# show standby | include time

3. Check interface errors:
   Router-A# show interface Gi0/0 | include error

4. Monitor state changes:
   Router-A# debug standby events
```

**Solution:**

- Increase timers (hello 3s, hold 10s minimum)
- Ensure timers match on all routers
- Fix physical layer issues
- Address CPU overload

**Problem 4: Wrong Router is Active**

**Symptom:**
```
Router-A (Priority 110):
  State is Standby

Router-B (Priority 90):
  State is Active
```

Lower-priority router is active!

**Possible Causes:**

1. **Preemption not enabled:**
   - Router A came online after Router B
   - Without preemption, Router B stays active

2. **Router A was down when Router B took over:**
   - Router B is still active
   - Router A won't preempt without `standby preempt`

**Diagnosis:**

```
Router-A# show standby | include Preemption
  Preemption disabled  ← Problem!
```

**Solution:**

Enable preemption on higher-priority router:
```
Router-A(config)# interface Gi0/0
Router-A(config-if)# standby 1 preempt
```

Router A will now take over as active.

**Problem 5: End Devices Can't Reach Gateway**

**Symptom:**

From PC:
```
PC> ping 192.168.1.254
Request timed out.

PC> arp -a
192.168.1.254     incomplete
```

**Possible Causes:**

1. **HSRP not actually active:**
   ```
   Router-A# show standby
   State is Listen  ← Should be Active or Standby!
   ```

2. **Virtual IP not in same subnet:**
   - Physical IPs: 192.168.1.0/24
   - Virtual IP: 192.168.2.254 (wrong subnet!)

3. **VLAN mismatch:**
   - Routers on VLAN 10
   - PCs on VLAN 20

**Diagnosis:**

```
1. Verify HSRP state:
   Router-A# show standby

2. Verify IP addressing:
   Router-A# show ip interface brief

3. Check VLAN:
   Router-A# show vlan

4. Verify connectivity to physical IPs:
   PC> ping 192.168.1.1
```

**Solution:**

- Troubleshoot why HSRP isn't reaching Active state
- Correct virtual IP to match subnet
- Fix VLAN mismatch

**Troubleshooting Methodology:**

Follow this systematic approach:

```
Step 1: Verify HSRP is running
  show standby

Step 2: Check states on all routers
  show standby brief (on each router)

Step 3: Verify Layer 2 connectivity
  ping physical IPs between routers

Step 4: Check configuration consistency
  - Same virtual IP
  - Same group number
  - Compatible timers

Step 5: Look for ACLs/firewalls blocking HSRP
  show ip access-lists

Step 6: Check interface status
  show ip interface brief

Step 7: Review state change history
  show standby | include state changes

Step 8: Use debug (carefully!)
  debug standby events
```

**Exam Troubleshooting Tips:**

Common exam scenarios:
- Different group numbers → Each router active for its group
- Preemption disabled → Lower-priority stays active
- Mismatched virtual IPs → Both routers active, different VIPs
- Layer 2 down → Split-brain (both active)
- Timers mismatch → Unstable, frequent changes

---

## Slide 17: Interface Tracking

### Visual Description
Shows interface tracking configuration with visual diagram of primary interface failure causing priority decrease and failover.

### Speaker Notes

**Interface Tracking (6 minutes):**

Interface tracking solves a critical problem: what if the active router loses its uplink but the LAN-facing interface stays up?

**The Problem:**

```
          Internet
             |
             | Gi0/1 (uplink) - FAILS!
             |
        [Router A - Active]
             | Gi0/0 (LAN interface - still UP)
             |
      ----------------
      |              |
   PC-A            PC-B
```

What happens:
1. Router A's uplink (Gi0/1) fails
2. Router A can't reach the Internet
3. But Gi0/0 (LAN interface) is still UP
4. Router A remains Active (Gi0/0 is up, so HSRP doesn't detect failure)
5. All PCs can't reach the Internet, even though Router B has a working uplink!

**Without tracking:** Router A stays active even though it can't route traffic.

**With tracking:** Router A detects uplink failure, decreases priority, Router B takes over.

**How Interface Tracking Works:**

1. Create a tracked object (monitor an interface)
2. Configure HSRP to track that object
3. If tracked interface goes down, HSRP priority decreases
4. If priority drops below standby router's priority, failover occurs

**Configuration Example:**

```
! Step 1: Create tracking object
Router-A(config)# track 1 interface GigabitEthernet0/1 line-protocol

! Step 2: Apply tracking to HSRP
Router-A(config)# interface GigabitEthernet0/0
Router-A(config-if)# standby 1 ip 192.168.1.254
Router-A(config-if)# standby 1 priority 110
Router-A(config-if)# standby 1 preempt
Router-A(config-if)# standby 1 track 1 decrement 20
```

**What This Does:**

- **Normal state:** Router A priority = 110
- **Gi0/1 goes down:** Router A priority = 90 (110 - 20)
- **Router B priority:** 100 (default)
- **Result:** Router B (100) > Router A (90) → Router B becomes active

**Track Object Options:**

**1. Track Interface Line Protocol:**
```
track 1 interface GigabitEthernet0/1 line-protocol
```
- Monitors Layer 2 status
- Down = physical link down or no keepalives

**2. Track IP Route:**
```
track 2 ip route 0.0.0.0 0.0.0.0 reachability
```
- Monitors if default route exists
- Useful if uplink uses dynamic routing

**3. Track IP SLA:**
```
ip sla 1
 icmp-echo 8.8.8.8
 frequency 5

track 3 ip sla 1 reachability

interface Gi0/0
 standby 1 track 3 decrement 20
```
- Monitors actual reachability to external IP
- More sophisticated than just interface up/down

**Choosing the Decrement Value:**

The decrement must be enough to trigger failover.

**Example:**
```
Router A: Priority 110, decrement 20 → Drops to 90 when tracked object fails
Router B: Priority 100

Result: Router B (100) takes over
```

**If decrement is too small:**
```
Router A: Priority 110, decrement 5 → Drops to 105 when tracked object fails
Router B: Priority 100

Result: Router A (105) still higher than Router B (100) → No failover!
```

**Rule of thumb:** Decrement should be greater than the priority difference between routers.

**Multiple Tracked Objects:**

You can track multiple interfaces:

```
track 1 interface GigabitEthernet0/1 line-protocol
track 2 interface GigabitEthernet0/2 line-protocol

interface GigabitEthernet0/0
 standby 1 track 1 decrement 15
 standby 1 track 2 decrement 15
```

If both uplinks fail: Priority drops by 30 total (15+15).

**Verification:**

```
Router-A# show standby

GigabitEthernet0/0 - Group 1
  State is Active
  Virtual IP address is 192.168.1.254
  Priority 110 (configured 110)
    Track object 1 state Up decrement 20  ← Tracking configured
```

```
Router-A# show track

Track 1
  Interface GigabitEthernet0/1 line-protocol
  Line protocol is Up
    1 change, last change 00:05:32
  Tracked by:
    HSRP GigabitEthernet0/0 1
```

**Testing Failover:**

```
! Shut down tracked interface
Router-A(config)# interface GigabitEthernet0/1
Router-A(config-if)# shutdown

! Verify priority decreased
Router-A# show standby
  State is Standby  ← Changed from Active!
  Priority 90 (configured 110)  ← Decremented by 20
    Track object 1 state Down decrement 20

! Verify Router B took over
Router-B# show standby
  State is Active  ← Now active!
```

**Real-World Use Cases:**

1. **Dual ISP connections:**
   - Track primary ISP uplink
   - Failover to backup router if primary ISP fails

2. **Data center redundancy:**
   - Track core switch uplink
   - Failover if path to core fails

3. **Branch office:**
   - Track WAN link
   - Use backup router if WAN fails

**Best Practices:**

- Always configure preemption with tracking
- Use meaningful track object numbers (1 = primary uplink, 2 = secondary, etc.)
- Document what each track object monitors
- Test failover during maintenance windows
- Consider using IP SLA for true reachability testing (not just interface up/down)

**Exam Tips:**

- Tracking is frequently tested in simulations
- Remember: decrement must be enough to cause failover
- Without preemption, tracking doesn't cause failover (router won't reclaim active role)
- Track objects can monitor interfaces, routes, or IP SLA tests

---

## Slide 18: Best Practices

### Visual Description
Two columns: "Do This" (green checkmarks) and "Avoid This" (red X marks) with best practice guidelines.

### Speaker Notes

**FHRP Best Practices (5 minutes):**

Based on real-world deployments and lessons learned.

**DO THIS:**

**1. Use HSRPv2 for new deployments**
```
interface GigabitEthernet0/0
 standby version 2
 standby 1 ip 192.168.1.254
```

Why:
- More groups (0-4095 vs 0-255)
- Dedicated multicast (224.0.0.102 vs 224.0.0.2)
- Better MAC address format
- IPv6 support (HSRPv1 doesn't support IPv6)

**2. Use VRRP in multi-vendor environments**

If you have Cisco + Juniper + Arista → Use VRRP (only open standard).

**3. Use GLBP when load balancing is needed**

Scenario: You have 4 routers and want to utilize them all → GLBP.

**4. Always enable preemption on preferred router**
```
interface GigabitEthernet0/0
 standby 1 priority 110
 standby 1 preempt
```

Without preemption, higher-priority router won't reclaim active role after recovery.

**5. Configure interface tracking for critical uplinks**
```
track 1 interface GigabitEthernet0/1 line-protocol
interface GigabitEthernet0/0
 standby 1 track 1 decrement 20
```

Prevents "black hole" scenario where active router has no uplink.

**6. Use consistent group numbers**

Convention: Match group number to VLAN number when possible.
```
VLAN 10 → standby 10
VLAN 20 → standby 20
```

Makes troubleshooting easier.

**7. Document your FHRP design**

Document:
- Which router should be active for each group
- Why (better path, more bandwidth, etc.)
- Priority values and reasoning
- Tracked objects and their purpose

**8. Test failover during maintenance windows**

Don't wait for production failure to discover FHRP isn't working!

Test:
- Shutdown active router interface
- Verify standby takes over
- Verify end devices maintain connectivity
- Bring active router back up
- Verify preemption (if configured)

**AVOID THIS:**

**1. Don't mix HSRP, VRRP, and GLBP on same network segment**

They're incompatible protocols. Pick one.

**2. Don't use identical priorities without considering IP tiebreaker**

Bad:
```
Router A: 192.168.1.1, priority 100
Router B: 192.168.1.2, priority 100
```

Result: Router B becomes active (higher IP).

Did you intend that? Probably not!

Better: Explicitly set priorities.

**3. Don't forget to configure both routers**

Common mistake: Configure HSRP on Router A, forget Router B.

Result: No redundancy!

**4. Don't use aggressive timers without good reason**

```
standby 1 timers msec 200 msec 700  ← TOO AGGRESSIVE for most networks!
```

Subsecond timers can cause:
- CPU load
- False failovers due to small delays
- Instability

Use default (3s hello, 10s hold) unless you have specific requirements.

**5. Don't configure virtual IP outside subnet range**

Bad:
```
Interface IP: 192.168.1.1/24
Virtual IP: 192.168.2.254  ← WRONG SUBNET!
```

Virtual IP must be in same subnet as physical interface IPs.

**6. Don't forget firewalls may block FHRP packets**

If you have a firewall between routers, permit:
- HSRP: UDP 1985, multicast 224.0.0.2 or 224.0.0.102
- VRRP: IP protocol 112, multicast 224.0.0.18
- GLBP: UDP 3222, multicast 224.0.0.102

**7. Don't configure preemption without understanding impact**

Preemption causes failover when higher-priority router comes online.

If a router is flapping (unstable):
- With preemption: Constant failovers (bad!)
- Without preemption: Stable active router (better)

Consider using preemption delay:
```
standby 1 preempt delay minimum 60
```

Wait 60 seconds before preempting (gives router time to stabilize).

**8. Don't ignore state change warnings**

```
Router-A# show standby
  234 state changes, last state change 00:00:05  ← INVESTIGATE!
```

Frequent state changes indicate a problem:
- Timers too aggressive
- Link instability
- Configuration mismatch

**Production Deployment Checklist:**

Before deploying FHRP in production:

- [ ] Both routers configured with same virtual IP and group
- [ ] Priorities set appropriately (preferred router higher)
- [ ] Preemption configured on preferred router
- [ ] Timers match across all routers
- [ ] Interface tracking configured for critical uplinks
- [ ] Firewall rules permit FHRP packets
- [ ] VLAN configuration correct on all interfaces
- [ ] Tested failover (shutdown active router, verify takeover)
- [ ] Tested preemption (bring active router back, verify it reclaims)
- [ ] Documented design (which router should be active and why)

**Monitoring and Maintenance:**

Regularly check:
```
show standby         ! Verify states
show track           ! Verify tracked objects
show standby history ! Check for unexpected failovers
```

Set up monitoring alerts for:
- HSRP state changes (SNMP traps)
- Both routers active (split-brain)
- No standby router present
- Frequent state changes

---

## Slide 19: Quick Reference

### Visual Description
Side-by-side command reference for HSRP, VRRP, and GLBP with essential commands.

### Speaker Notes

**Quick Reference Card (3 minutes):**

This is your exam cheat sheet and production quick reference.

**HSRP Commands:**

```
! Basic configuration
interface GigabitEthernet0/0
 standby version 2                    ! Use HSRPv2
 standby 1 ip 192.168.1.254           ! Enable and set virtual IP
 standby 1 priority 110               ! Set priority (default 100)
 standby 1 preempt                    ! Enable preemption
 standby 1 timers 3 10                ! Hello 3s, hold 10s

! Interface tracking
track 1 interface GigabitEthernet0/1 line-protocol
interface GigabitEthernet0/0
 standby 1 track 1 decrement 20

! Verification
show standby                          ! Detailed status
show standby brief                    ! Summary
show track                            ! Tracked objects
```

**VRRP Commands:**

```
! Basic configuration
interface GigabitEthernet0/0
 vrrp 1 ip 192.168.1.254              ! Enable and set virtual IP
 vrrp 1 priority 110                  ! Set priority (default 100)
 ! Preemption enabled by default
 vrrp 1 timers advertise 1            ! Advertisement interval

! Verification
show vrrp                             ! Detailed status
show vrrp brief                       ! Summary
```

**GLBP Commands:**

```
! Basic configuration
interface GigabitEthernet0/0
 glbp 1 ip 192.168.1.254              ! Enable and set virtual IP
 glbp 1 priority 110                  ! Set priority (default 100)
 glbp 1 preempt                       ! Enable preemption
 glbp 1 load-balancing round-robin    ! Set LB method
 glbp 1 timers 3 10                   ! Hello 3s, hold 10s

! Weighted load balancing
 glbp 1 load-balancing weighted
 glbp 1 weighting 150

! Verification
show glbp                             ! Detailed status
show glbp brief                       ! Summary
```

**Protocol Comparison Quick Reference:**

| Feature | HSRP | VRRP | GLBP |
|---------|------|------|------|
| Command keyword | `standby` | `vrrp` | `glbp` |
| Multicast | 224.0.0.102 (v2) | 224.0.0.18 | 224.0.0.102 |
| Transport | UDP 1985 | IP 112 | UDP 3222 |
| Virtual MAC | 0000.0c9f.fXXX (v2) | 0000.5e00.01XX | 0007.b400.XXYY |
| Preempt default | Disabled | Enabled | Disabled |
| Load balancing | No | No | Yes |

**Essential Verification Commands:**

```
! Check FHRP status
show standby / show vrrp / show glbp

! Brief summary
show standby brief / show vrrp brief / show glbp brief

! Tracked objects
show track

! ARP cache (from PC)
arp -a

! Statistics and counters
show standby statistics
show vrrp statistics
```

**Troubleshooting Commands:**

```
! State change history
show standby history

! Debug (use carefully!)
debug standby events      ! State changes only
debug standby packets     ! All packets (verbose!)

! Clear counters
clear standby counters
```

**Exam Day Checklist:**

Know these cold:
- [ ] Virtual MAC formats (0000.0c07.acXX, 0000.5e00.01XX, 0007.b400.XXYY)
- [ ] Multicast addresses (224.0.0.2, 224.0.0.102, 224.0.0.18)
- [ ] Which protocol preempts by default (VRRP)
- [ ] Which protocol does load balancing (GLBP)
- [ ] Basic configuration commands for all three protocols
- [ ] How to verify FHRP status

**Common Exam Scenarios:**

1. Given a MAC address, identify protocol and group
2. Configure HSRP with priority and preemption
3. Troubleshoot why FHRP isn't working (both routers active)
4. Identify which router should be active based on priorities
5. Configure interface tracking

---

## Slide 20: Summary

### Visual Description
Four summary boxes covering: The Problem, The Solution, protocol comparison (HSRP/VRRP/GLBP), and exam tips.

### Speaker Notes

**Final Summary (5 minutes):**

Let's recap the key concepts you need to master.

**The Problem:**

Single point of failure at the default gateway level:
- End devices have one static gateway configured
- If that gateway fails, all external connectivity is lost
- Manual reconfiguration of every device is required
- Unacceptable downtime in production networks

**The Solution:**

First-Hop Redundancy Protocols provide:
- Virtual IP address shared by multiple physical routers
- Virtual MAC address for seamless failover
- Automatic failover without end device reconfiguration
- Active/standby (or load-balanced) operation
- Transparent to end users

**The Three Protocols:**

**HSRP (Hot Standby Router Protocol):**
- Cisco proprietary
- Active/Standby model (one router forwards)
- UDP 1985, multicast 224.0.0.102 (v2)
- Virtual MAC: 0000.0c9f.fXXX (v2)
- Preemption: Disabled by default
- **Use when:** All-Cisco environment, simple redundancy needed

**VRRP (Virtual Router Redundancy Protocol):**
- Open standard (RFC 5798)
- Master/Backup model (one router forwards)
- IP protocol 112, multicast 224.0.0.18
- Virtual MAC: 0000.5e00.01XX
- Preemption: Enabled by default
- **Use when:** Multi-vendor environment, standards compliance required

**GLBP (Gateway Load Balancing Protocol):**
- Cisco proprietary
- AVG/AVF model (up to 4 routers forward)
- UDP 3222, multicast 224.0.0.102
- Virtual MAC: 0007.b400.XXYY (multiple MACs per group)
- Load balancing: Round-robin, weighted, host-dependent
- **Use when:** Need to utilize multiple routers simultaneously

**Key Concepts to Master:**

**1. Priority and Preemption:**
- Priority determines which router is active (higher wins)
- Preemption determines if higher-priority router can reclaim active role
- HSRP/GLBP: Preemption disabled by default
- VRRP: Preemption enabled by default

**2. Virtual MAC Addresses:**
- HSRP v1: 0000.0c07.acXX
- HSRP v2: 0000.0c9f.fXXX
- VRRP: 0000.5e00.01XX
- GLBP: 0007.b400.XXYY
- Must be able to identify protocol from MAC address!

**3. States (HSRP):**
- Initial → Learn → Listen → Speak → Standby → Active
- Only Active state forwards traffic
- Understanding states helps troubleshooting

**4. Interface Tracking:**
- Monitors critical uplinks
- Decreases priority if tracked interface fails
- Causes failover to router with working uplink
- Requires preemption to be effective

**5. Configuration:**
- HSRP: `standby [group] ip [vip]`
- VRRP: `vrrp [group] ip [vip]`
- GLBP: `glbp [group] ip [vip]`
- Set priority, enable preemption, configure tracking

**Common Exam Questions Types:**

**Type 1: Identification**
"What protocol uses virtual MAC 0000.5e00.010a?"
Answer: VRRP, group 10

**Type 2: Configuration**
"Configure HSRP group 5 with virtual IP 10.1.1.254, priority 150, preemption enabled."

**Type 3: Troubleshooting**
"Two routers both show Active. What's wrong?"
Answer: Layer 2 connectivity issue, different groups, or multicast blocked

**Type 4: Behavior**
"Router A (priority 120) fails. Router B (priority 80) becomes active. Router A comes back. What happens?"
Answer: Depends on preemption! Without preempt, B stays active. With preempt, A takes over.

**Type 5: Design**
"You need redundancy in a Cisco/Juniper environment. Which FHRP?"
Answer: VRRP (only open standard)

**Real-World Application:**

After this presentation, you should be able to:
- Design redundant gateway solutions
- Configure HSRP on Cisco routers
- Verify FHRP operation
- Troubleshoot common FHRP issues
- Pass CCNA FHRP questions with confidence

**Lab Assignment:**

Complete these tasks:
1. Configure HSRP between two routers
2. Set Router A as preferred active (priority 110)
3. Enable preemption on Router A
4. Configure tracking on uplink interface
5. Verify with `show standby`
6. Test failover by shutting down Router A
7. Observe Router B take over
8. Bring Router A back and verify preemption
9. Test tracking by shutting down tracked interface
10. Document your findings

**Next Steps:**

- Practice configurations in Packet Tracer/GNS3
- Use the FHRP Visualizer tool for interactive learning
- Review virtual MAC address formats until you can recognize them instantly
- Take practice exams focusing on FHRP questions
- Build a lab topology with multiple VLANs and FHRP groups

---

## Appendix A: Quick Reference Tables

### FHRP Protocol Comparison

| Feature | HSRP v1 | HSRP v2 | VRRP | GLBP |
|---------|---------|---------|------|------|
| Vendor | Cisco | Cisco | Open Std | Cisco |
| RFC/Standard | None | None | RFC 5798 | None |
| Group Range | 0-255 | 0-4095 | 1-255 | 0-1023 |
| Multicast | 224.0.0.2 | 224.0.0.102 | 224.0.0.18 | 224.0.0.102 |
| Transport | UDP 1985 | UDP 1985 | IP 112 | UDP 3222 |
| Virtual MAC | 0000.0c07.acXX | 0000.0c9f.fXXX | 0000.5e00.01XX | 0007.b400.XXYY |
| Hello Timer | 3s | 3s | 1s | 3s |
| Hold Timer | 10s | 10s | 3s | 10s |
| Default Priority | 100 | 100 | 100 | 100 |
| Preempt Default | Disabled | Disabled | Enabled | Disabled |
| Terminology | Active/Standby | Active/Standby | Master/Backup | AVG/AVF |
| Active Routers | 1 | 1 | 1 | Up to 4 |
| Load Balancing | No | No | No | Yes |
| IPv6 Support | No | Yes | Yes | Yes |

### Virtual MAC Address Formats

| Protocol | Format | Example (Group 10) | Pattern Recognition |
|----------|--------|-------------------|-------------------|
| HSRP v1 | 0000.0c07.acXX | 0000.0c07.ac0a | Ends with .ac |
| HSRP v2 | 0000.0c9f.fXXX | 0000.0c9f.f00a | Contains .9f.f |
| VRRP | 0000.5e00.01XX | 0000.5e00.010a | Contains .5e00.01 |
| GLBP | 0007.b400.XXYY | 0007.b400.0a01 | Starts with 0007.b4 |

### Hex to Decimal Conversion (Common Groups)

| Decimal | Hex |
|---------|-----|
| 1 | 01 |
| 5 | 05 |
| 10 | 0a |
| 20 | 14 |
| 50 | 32 |
| 100 | 64 |
| 150 | 96 |
| 200 | c8 |
| 255 | ff |
| 1000 | 3e8 |
| 4095 | fff |

### Configuration Commands Quick Reference

#### HSRP

```
! Enable HSRPv2
interface GigabitEthernet0/0
 standby version 2
 standby 1 ip 192.168.1.254
 standby 1 priority 110
 standby 1 preempt
 standby 1 preempt delay minimum 60
 standby 1 timers 3 10

! Tracking
track 1 interface GigabitEthernet0/1 line-protocol
interface GigabitEthernet0/0
 standby 1 track 1 decrement 20
```

#### VRRP

```
interface GigabitEthernet0/0
 vrrp 1 ip 192.168.1.254
 vrrp 1 priority 110
 vrrp 1 timers advertise 1
 vrrp 1 preempt disable     ! To disable (on by default)
```

#### GLBP

```
interface GigabitEthernet0/0
 glbp 1 ip 192.168.1.254
 glbp 1 priority 110
 glbp 1 preempt
 glbp 1 load-balancing round-robin
 glbp 1 timers 3 10

! Weighted load balancing
 glbp 1 load-balancing weighted
 glbp 1 weighting 150 lower 100
```

### Show Commands

```
show standby              ! HSRP detailed status
show standby brief        ! HSRP summary
show standby history      ! State change history
show standby statistics   ! Packet counters

show vrrp                 ! VRRP detailed status
show vrrp brief           ! VRRP summary
show vrrp statistics      ! Packet counters

show glbp                 ! GLBP detailed status
show glbp brief           ! GLBP summary

show track                ! Tracked objects status
show track brief          ! Track summary
```

### Troubleshooting Scenarios

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Both routers Active | Layer 2 down, different groups | Check connectivity, verify groups match |
| No Standby shown | Second router not configured | Configure FHRP on second router |
| Wrong router Active | Preemption not enabled | Enable preemption on higher-priority router |
| Frequent state changes | Timers too aggressive, link unstable | Increase timers, fix physical issues |
| Can't ping VIP | HSRP not in Active state | Check `show standby`, troubleshoot |
| VIP in wrong subnet | Configuration error | Virtual IP must be in same subnet |

---

## Appendix B: Lab Scenarios

### Lab 1: Basic HSRP Configuration

**Objective:** Configure basic HSRP redundancy

**Topology:**
```
[Router-A] --- [Switch] --- [Router-B]
                  |
               [PC-A]
```

**Requirements:**
1. Subnet: 192.168.1.0/24
2. Router-A: 192.168.1.1, priority 110
3. Router-B: 192.168.1.2, priority 90
4. Virtual IP: 192.168.1.254
5. Enable preemption on Router-A

**Verification:**
- Router-A should be Active
- Router-B should be Standby
- PC-A can ping 192.168.1.254

### Lab 2: HSRP Failover Testing

**Objective:** Test automatic failover

**Tasks:**
1. Start with Lab 1 configuration
2. Shutdown Router-A's LAN interface
3. Verify Router-B becomes Active
4. Check PC-A maintains connectivity
5. Bring Router-A back up
6. Verify Router-A reclaims Active role (preemption)

### Lab 3: Interface Tracking

**Objective:** Configure and test interface tracking

**Topology:**
```
         Internet
            |
     -----------------
     |               |
[Router-A]       [Router-B]
   Gi0/1           Gi0/1  (uplinks)
   Gi0/0           Gi0/0  (LAN)
     |               |
     ----- [Switch] ---
              |
           [PC-A]
```

**Tasks:**
1. Configure HSRP on Gi0/0 (both routers)
2. Configure tracking on Gi0/1 (uplink) with decrement 30
3. Verify Router-A is Active
4. Shutdown Router-A Gi0/1 (uplink)
5. Verify Router-A priority decreases
6. Verify Router-B becomes Active
7. Bring Router-A Gi0/1 back up
8. Verify Router-A reclaims Active

### Lab 4: GLBP Load Balancing

**Objective:** Configure GLBP and observe load distribution

**Tasks:**
1. Configure GLBP with round-robin load balancing
2. Verify both routers are AVFs
3. From multiple PCs, ping gateway
4. Check ARP tables - observe different virtual MACs
5. Verify traffic is distributed across both routers

---

## Appendix C: Exam Tips and Strategies

### Recognition Patterns

**When you see this MAC:** → **Think this protocol:**
- 0000.0c07.acXX → HSRP version 1
- 0000.0c9f.fXXX → HSRP version 2
- 0000.5e00.01XX → VRRP
- 0007.b400.XXYY → GLBP

### Decision Trees

**"Which FHRP should I use?"**

```
Start
  |
  ├─ Need multi-vendor support?
  |   ├─ Yes → VRRP
  |   └─ No → Continue
  |
  ├─ Need load balancing?
  |   ├─ Yes → GLBP
  |   └─ No → HSRP (most common)
```

**"Why isn't FHRP working?"**

```
Check:
1. Are both routers configured with same virtual IP?
2. Are both routers in same group number?
3. Can routers communicate (Layer 2 up)?
4. Are timers compatible?
5. Is HSRP multicast being blocked?
6. Are both routers on same VLAN?
```

### Common Mistakes to Avoid

1. **Forgetting preemption**
   - Symptom: Lower-priority router stays active
   - Fix: `standby 1 preempt`

2. **Different virtual IPs**
   - Symptom: Both routers active
   - Fix: Use same VIP on both routers

3. **Different groups**
   - Symptom: Both routers active for different groups
   - Fix: Use same group number

4. **VIP in wrong subnet**
   - Symptom: Can't reach gateway
   - Fix: VIP must be in same subnet as interface IPs

5. **Insufficient decrement**
   - Symptom: Tracking doesn't trigger failover
   - Fix: Decrement must be > priority difference

---

*End of Speaker Notes*
