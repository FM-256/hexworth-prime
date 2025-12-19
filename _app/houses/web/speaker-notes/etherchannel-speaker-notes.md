# EtherChannel & Link Aggregation - Speaker Notes

**Prepared by:** EQ6
**Subject:** Network Essentials - EtherChannel & Link Aggregation
**Presentation File:** etherchannel-presentation.html
**Target Audience:** CCNA candidates, network engineering students
**Presentation Duration:** 60-75 minutes (with lab exercises)
**Difficulty Level:** Intermediate
**CCNA Objective:** 2.5

---

## Table of Contents

1. [Slide 1: Title Slide](#slide-1-title-slide)
2. [Slide 2: The Problem](#slide-2-the-problem)
3. [Slide 3: The Solution](#slide-3-the-solution)
4. [Slide 4: Terminology](#slide-4-terminology)
5. [Slide 5: Two Protocols](#slide-5-two-protocols)
6. [Slide 6: LACP Modes](#slide-6-lacp-modes)
7. [Slide 7: PAgP Modes](#slide-7-pagp-modes)
8. [Slide 8: Static Mode](#slide-8-static-mode)
9. [Slide 9: Mode Summary](#slide-9-mode-summary)
10. [Slide 10: Requirements](#slide-10-requirements)
11. [Slide 11: LACP Configuration](#slide-11-lacp-configuration)
12. [Slide 12: PAgP Configuration](#slide-12-pagp-configuration)
13. [Slide 13: Load Balancing](#slide-13-load-balancing)
14. [Slide 14: Load Balancing Visual](#slide-14-load-balancing-visual)
15. [Slide 15: Verification Commands](#slide-15-verification-commands)
16. [Slide 16: Troubleshooting](#slide-16-troubleshooting)
17. [Slide 17: Layer 3 EtherChannel](#slide-17-layer-3-etherchannel)
18. [Slide 18: Best Practices](#slide-18-best-practices)
19. [Slide 19: Quick Reference](#slide-19-quick-reference)
20. [Slide 20: Summary](#slide-20-summary)

---

## Introduction to This Presentation

### Instructor Preparation Notes

**CRITICAL CONTEXT:** EtherChannel is a deceptively simple concept that causes significant confusion on the CCNA exam. The technology itself is straightforward (bundle multiple links), but the mode compatibility matrix trips up many students. Spend extra time on slides 6-9 and use the interactive visualizer to let students experiment.

**Common Student Misconceptions:**

- "Active and Desirable are the same" - They're similar in function but different protocols!
- "Passive + Passive should work" - No! Neither side initiates
- "On mode is fine for production" - Dangerous without negotiation
- "EtherChannel gives 4 Gbps for every transfer" - No, load balancing works per-flow

**Prerequisites (Students Should Know):**

- Basic switch configuration
- VLAN concepts and trunk configuration
- Spanning Tree Protocol fundamentals
- Understanding of why STP blocks redundant links

**Why EtherChannel Matters:**

In the real world, EtherChannel is used constantly:
- Data center switch interconnects
- Core-to-distribution links
- Server farm connections
- Storage network links

Every network engineer will configure EtherChannel in their career.

**Materials Needed:**

- Packet Tracer with 2 switches and 4 connections between them
- Access to the EtherChannel Visualizer tool
- Whiteboard for mode compatibility matrix
- Lab worksheet with configuration scenarios

**Timing Recommendations:**

- Slides 1-4: Introduction (10 minutes)
- Slides 5-9: Protocols and modes (20 minutes) - KEY SECTION
- Slides 10-12: Configuration (15 minutes)
- Slides 13-14: Load balancing (10 minutes)
- Slides 15-18: Verification and troubleshooting (15 minutes)
- Slides 19-20: Summary and practice (5 minutes)

---

## Slide 1: Title Slide

### Visual Description
Blue gradient background with the title "EtherChannel & Link Aggregation" and subtitle "Bundling Links for Bandwidth and Redundancy." CCNA objective 2.5 highlighted at bottom.

### Speaker Notes

**Opening (2 minutes):**

Welcome to our session on EtherChannel and Link Aggregation. This is one of those topics that's conceptually simple but has some gotchas that frequently appear on the CCNA exam.

**Set the Stage:**

Let me ask you a question: If you want more bandwidth between two switches, what's the obvious solution?

(Let students answer - they'll likely say "add more cables")

Exactly! But there's a problem with that approach, and that's what we're going to solve today.

**Learning Objectives:**

By the end of this presentation, you will be able to:
1. Explain why EtherChannel exists and what problem it solves
2. Configure EtherChannel using LACP (the industry standard)
3. Understand the mode compatibility matrix (exam favorite!)
4. Troubleshoot common EtherChannel issues
5. Verify EtherChannel status using show commands

**Real-World Context:**

Every data center uses EtherChannel. When you connect switches together, you almost never use just a single link. EtherChannel is how you aggregate those connections properly.

---

## Slide 2: The Problem

### Visual Description
Diagram showing two switches with 4 physical links, but 3 are shown as faded/blocked by STP. Only 1 link is actively forwarding.

### Speaker Notes

**The STP Dilemma (5 minutes):**

Let's set up the scenario. You're building a network and you want redundancy and bandwidth between two core switches. You install four 1 Gbps cables connecting them. You're thinking: "4 cables × 1 Gbps = 4 Gbps of bandwidth, plus redundancy if one fails!"

(Pause for effect)

But what actually happens? Spanning Tree Protocol sees those four parallel links and says, "Whoa! That's a loop waiting to happen!" And it blocks three of those links.

**The Math Problem:**

- You BOUGHT: 4 × 1 Gbps = 4 Gbps potential
- You GOT: 1 × 1 Gbps = 1 Gbps actual
- You WASTED: 3 Gbps sitting idle

Those three cables are literally just sitting there as backup in case the primary fails. That's expensive redundancy with zero bandwidth benefit!

**Discussion Prompt:**

Ask students: "Can you think of any workarounds? How would you solve this without EtherChannel?"

Common (incorrect) answers:
- "Disable STP" - NO! That causes broadcast storms
- "Use different VLANs" - Only helps if traffic is per-VLAN
- "Use routing" - Adds complexity and latency

The right answer is EtherChannel!

---

## Slide 3: The Solution

### Visual Description
Same two switches, but now all 4 links are green/active, bundled into a single "Port-channel 1" logical interface showing 4 Gbps aggregate bandwidth.

### Speaker Notes

**The EtherChannel Solution:**

EtherChannel takes those four physical links and bundles them into ONE logical link. As far as STP is concerned, it's a single connection, so there's nothing to block!

**The Benefits:**

1. **Aggregated Bandwidth:** All four links are active and carrying traffic
2. **Redundancy:** If one link fails, traffic automatically uses the remaining three
3. **No STP Blocking:** STP sees one logical link, not four physical links
4. **Load Balancing:** Traffic is distributed across all member links

**Analogy Time:**

Think of it like highway lanes. Without EtherChannel, STP is like a traffic cop saying "Only lane 1 is open, everyone use that one." With EtherChannel, all four lanes are open and cars are distributed across them.

**Key Terminology:**

- The bundle is called an **EtherChannel** or **Port-channel**
- The logical interface is **Port-channel 1** (or Po1 for short)
- Member ports are the physical interfaces in the bundle

**Exam Focus:**

The CCNA will test whether you understand that EtherChannel presents as a single logical link to STP and other protocols. This is the fundamental concept.

---

## Slide 4: Terminology

### Visual Description
Table with terms: EtherChannel, Port Channel, Link Aggregation, LAG, LACP, PAgP - each with descriptions.

### Speaker Notes

**Terminology Jungle:**

Students often get confused because the same technology has multiple names depending on vendor and context. Let's clarify:

**Cisco-Specific Terms:**
- **EtherChannel** - Cisco's brand name for the technology
- **Port Channel** - The logical interface (Port-channel 1, Po1)
- **PAgP** - Cisco's proprietary negotiation protocol

**Industry Standard Terms:**
- **Link Aggregation** - IEEE's term for the same technology
- **LAG** - Link Aggregation Group (the bundle)
- **LACP** - Link Aggregation Control Protocol (IEEE 802.3ad)

**Which to Use?**

On Cisco equipment, you'll use both terms. The interface is always called "Port-channel" but the technology is called "EtherChannel." On non-Cisco equipment, you'll see "LAG" and "LACP."

**Exam Note:**

The CCNA uses both terms interchangeably. When you see "EtherChannel" or "Port-channel" or "Link Aggregation" - they're all referring to the same concept.

---

## Slide 5: Two Protocols

### Visual Description
Side-by-side comparison boxes: LACP (green, "Industry Standard") and PAgP (orange, "Cisco Proprietary"), each listing key features.

### Speaker Notes

**Two Ways to Negotiate:**

EtherChannel can be formed using one of two negotiation protocols. This is a critical exam topic!

**LACP (Link Aggregation Control Protocol):**
- IEEE 802.3ad (also called 802.1AX now)
- Industry standard - works with any vendor
- Modes: **active** and **passive**
- Up to 16 links (8 active, 8 standby)
- **RECOMMENDED** for most scenarios

**PAgP (Port Aggregation Protocol):**
- Cisco proprietary
- Only works between Cisco devices
- Modes: **desirable** and **auto**
- Up to 8 links
- Legacy - less common in new deployments

**Which Should You Use?**

**LACP** in almost all cases because:
1. Industry standard ensures vendor interoperability
2. Required if any non-Cisco devices are involved
3. The CCNA focuses more heavily on LACP

**PAgP** only when:
1. All devices are Cisco
2. Legacy network that's already using it
3. Specific Cisco features require it (rare)

**Key Point for Exam:**

LACP is the default answer. When in doubt, choose LACP.

---

## Slide 6: LACP Modes

### Visual Description
Two mode cards: "Active" (green, "Actively tries to form") and "Passive" (yellow, "Waits for the other side"). Compatibility table showing Active-Active, Active-Passive, Passive-Passive outcomes.

### Speaker Notes

**LACP Has Two Modes:**

**Active Mode:**
- Actively sends LACP packets to negotiate
- Initiates the EtherChannel formation
- Think: "I WANT to form a channel!"

**Passive Mode:**
- Does NOT send LACP packets proactively
- Will respond to LACP packets from the other side
- Think: "I'll form a channel IF YOU ask"

**The Compatibility Matrix:**

This is the KEY exam concept. Let students work through this:

| Switch A | Switch B | Result |
|----------|----------|--------|
| Active | Active | ✅ Yes |
| Active | Passive | ✅ Yes |
| Passive | Passive | ❌ NO! |

**Why Passive + Passive Fails:**

Both sides are sitting there waiting for the other to speak first. It's like two shy people at a party - neither one starts the conversation, so they never talk!

**Memory Trick:**

"At least one side must be ACTIVE" - literally, someone has to take action.

**Interactive Exercise:**

Use the EtherChannel Visualizer to let students test different combinations. Let them discover why Passive-Passive fails.

---

## Slide 7: PAgP Modes

### Visual Description
Two mode cards: "Desirable" (green) and "Auto" (yellow). Same pattern as LACP but with PAgP terminology.

### Speaker Notes

**PAgP Has Two Modes (Same Logic, Different Names):**

**Desirable Mode:**
- Actively sends PAgP packets to negotiate
- Equivalent to LACP "active"
- Think: "I DESIRE to form a channel!"

**Auto Mode:**
- Does NOT send PAgP packets proactively
- Will respond if the other side is desirable
- Equivalent to LACP "passive"

**The Compatibility Matrix:**

| Switch A | Switch B | Result |
|----------|----------|--------|
| Desirable | Desirable | ✅ Yes |
| Desirable | Auto | ✅ Yes |
| Auto | Auto | ❌ NO! |

**Same Rule Applies:**

"At least one side must be DESIRABLE" - someone has to take initiative.

**Common Exam Trap:**

Students mix up LACP and PAgP terminology:
- LACP: active / passive
- PAgP: desirable / auto

Know which terms go with which protocol!

**Memory Trick:**

- LACP uses short words: active, passive
- PAgP uses longer words: desirable, auto(matic)

---

## Slide 8: Static Mode

### Visual Description
Warning-styled card showing "On" mode with danger indicators. Table showing On-On works, but On-Active and On-Passive fail (dangerous).

### Speaker Notes

**The Third Option: Static Mode ("On"):**

There's a third way to form EtherChannel: force it without any negotiation protocol.

**"On" Mode:**
- No LACP or PAgP packets sent
- Forces the EtherChannel to form unconditionally
- Both sides MUST be set to "on"

**Why Is It Dangerous?**

Without a negotiation protocol:
1. No automatic detection of misconfigurations
2. If one side is "on" and the other is "active" → **LOOP!**
3. No graceful handling of link failures
4. No protocol to verify the other side is configured correctly

**The Compatibility Problem:**

| Switch A | Switch B | Result |
|----------|----------|--------|
| On | On | ✅ Works (but risky) |
| On | Active | ❌ DANGEROUS! |
| On | Passive | ❌ DANGEROUS! |

**Real-World Scenario:**

A student once asked: "But if both sides are configured correctly, what's the problem?"

The problem is what happens when someone makes a mistake. With LACP/PAgP, a misconfiguration is detected and the channel won't form. With "on" mode, you might create a bridging loop before realizing there's a problem.

**Exam Guidance:**

Know that "on" mode exists, but the correct answer is almost always to use LACP.

---

## Slide 9: Mode Summary

### Visual Description
Complete 5×5 compatibility matrix showing all possible mode combinations across LACP, PAgP, and Static modes.

### Speaker Notes

**The Complete Picture:**

This slide is the ultimate reference. Let's walk through the key points:

**LACP Zone (active/passive):**
- Active ↔ Active = Yes
- Active ↔ Passive = Yes
- Passive ↔ Passive = No

**PAgP Zone (desirable/auto):**
- Desirable ↔ Desirable = Yes
- Desirable ↔ Auto = Yes
- Auto ↔ Auto = No

**Static Zone (on):**
- On ↔ On = Yes (only valid combination)

**Cross-Protocol = NEVER:**
- Active ↔ Desirable = NO!
- Passive ↔ Auto = NO!
- Any LACP ↔ Any PAgP = NO!
- On ↔ Any negotiating mode = NO!

**The Three Rules:**

1. **Same protocol required:** LACP with LACP, PAgP with PAgP
2. **At least one initiator:** active/desirable on at least one side
3. **On is exclusive:** Only works with On on the other side

**Exam Strategy:**

If you see a question about EtherChannel forming, check:
1. Are both sides using the same protocol?
2. Is at least one side initiating (active/desirable)?
3. If "on" is used, is it on BOTH sides?

If any of these fails, the channel won't form.

---

## Slide 10: Requirements

### Visual Description
Numbered list of requirements: Speed/Duplex, VLAN Configuration, STP Settings, Port Type - all must match.

### Speaker Notes

**The Matching Game:**

Beyond mode compatibility, all member ports must have IDENTICAL configurations. This is a frequent troubleshooting scenario.

**Required Matches:**

1. **Speed and Duplex:**
   - All ports must have the same speed (1 Gbps, 10 Gbps, etc.)
   - All ports must have the same duplex (full)
   - Mismatched speed = port suspended

2. **VLAN Configuration:**
   - Access ports: Same access VLAN on all ports
   - Trunk ports: Same native VLAN AND same allowed VLANs
   - Mismatch = port suspended

3. **STP Settings:**
   - Same port cost
   - Same port priority
   - Usually not an issue unless manually changed

4. **Port Type:**
   - All access OR all trunk
   - Cannot mix access ports and trunk ports

**What Happens on Mismatch?**

The EtherChannel will put mismatched ports into "suspended" state. The channel might form with some ports, but not the mismatched ones.

**Troubleshooting Tip:**

When an EtherChannel isn't forming, always check:
```
show running-config interface range Gi0/1 - 4
```

Look for any differences in configuration.

---

## Slide 11: LACP Configuration

### Visual Description
Code block showing step-by-step LACP configuration: interface range, channel-group command, port-channel configuration.

### Speaker Notes

**Configuration Walkthrough:**

Let's configure an EtherChannel step by step:

```
! Step 1: Select interfaces to bundle
Switch(config)# interface range GigabitEthernet0/1 - 2

! Step 2: Create the channel with LACP
Switch(config-if-range)# channel-group 1 mode active
Creating a port-channel interface Port-channel 1
```

**What Happened?**

- `channel-group 1` assigns these ports to channel group 1
- `mode active` enables LACP in active mode
- A new interface `Port-channel 1` is automatically created

**Step 3: Configure the Port-channel:**

```
Switch(config)# interface Port-channel 1
Switch(config-if)# switchport mode trunk
Switch(config-if)# switchport trunk allowed vlan 10,20,30
```

**Key Concept:**

Configure the PORT-CHANNEL interface, not the individual ports. Settings on Port-channel 1 automatically apply to all member ports.

**Common Mistake:**

Students try to configure trunking on the individual ports BEFORE creating the channel-group. This can cause mismatches. Best practice: create the channel first, then configure Port-channel interface.

---

## Slide 12: PAgP Configuration

### Visual Description
Code block showing PAgP configuration with desirable mode, plus comparison of LACP vs PAgP commands.

### Speaker Notes

**PAgP Configuration:**

Very similar to LACP, just different mode keywords:

```
Switch(config)# interface range GigabitEthernet0/1 - 2
Switch(config-if-range)# channel-group 1 mode desirable
```

**Comparison:**

| Protocol | Initiator Mode | Responder Mode |
|----------|----------------|----------------|
| LACP | `mode active` | `mode passive` |
| PAgP | `mode desirable` | `mode auto` |
| Static | `mode on` | `mode on` |

**Static Mode Configuration:**

```
Switch(config-if-range)# channel-group 1 mode on
```

**Lab Exercise:**

Have students configure EtherChannel in Packet Tracer:
1. First using LACP active-passive
2. Then try passive-passive (observe failure)
3. Fix by changing one side to active

This hands-on experience cements the concept.

---

## Slide 13: Load Balancing

### Visual Description
Table showing load-balancing methods: src-mac, dst-mac, src-dst-mac, src-ip, dst-ip, src-dst-ip with descriptions.

### Speaker Notes

**How Traffic is Distributed:**

EtherChannel uses a hash algorithm to decide which physical link to use for each flow. The hash is based on packet headers.

**Common Methods:**

| Method | Hash Based On | Good For |
|--------|---------------|----------|
| src-mac | Source MAC | Many sources to one destination |
| dst-mac | Destination MAC | One source to many destinations |
| src-dst-mac | Both MACs | Best general-purpose for L2 |
| src-ip | Source IP | Layer 3 switching |
| dst-ip | Destination IP | Layer 3 switching |
| src-dst-ip | Both IPs | Best for L3 environments |

**View Current Method:**

```
Switch# show etherchannel load-balance
```

**Change Method:**

```
Switch(config)# port-channel load-balance src-dst-ip
```

**Important Concept:**

Load balancing is per-FLOW, not per-PACKET. All packets between the same source and destination use the same link. This ensures packets arrive in order.

---

## Slide 14: Load Balancing Visual

### Visual Description
Diagram showing different conversations (flows) using different links in the EtherChannel.

### Speaker Notes

**Per-Flow Load Balancing:**

This is where students often get confused. Let me explain with an example:

**Scenario:**
- 4-link EtherChannel (4 Gbps aggregate)
- PC-A downloads a large file from Server-X

**What Students Expect:**
"The file transfer uses all 4 links = 4 Gbps throughput!"

**What Actually Happens:**
"The entire transfer (single flow) uses ONE link = 1 Gbps max."

**Why?**

If packets took different paths and arrived out of order, TCP would think there's packet loss and slow down. Using a single path per flow keeps packets in order.

**When Do You Get Aggregate Bandwidth?**

Multiple simultaneous flows:
- PC-A → Server-X uses Link 1
- PC-B → Server-X uses Link 2
- PC-A → Server-Y uses Link 3
- PC-C → Server-Z uses Link 4

Now all four links are utilized!

**Exam Point:**

If asked "What throughput can a single host achieve over a 4-link EtherChannel?" the answer is 1 Gbps (one link's bandwidth), not 4 Gbps.

---

## Slide 15: Verification Commands

### Visual Description
Code blocks showing show etherchannel summary output with flag explanations.

### Speaker Notes

**The Most Useful Command:**

```
Switch# show etherchannel summary
```

This is your go-to verification command. Learn to read its output.

**Example Output:**

```
Group  Port-channel  Protocol    Ports
------+-------------+-----------+------------------
1      Po1(SU)       LACP        Gi0/1(P) Gi0/2(P)
```

**Reading the Flags:**

Port-channel flags:
- **S** = Layer 2 (switchport)
- **R** = Layer 3 (routed)
- **U** = In use (up)
- **D** = Down

Member port flags:
- **P** = Bundled (in Port-channel)
- **I** = Individual (not bundled)
- **s** = Suspended
- **w** = Waiting to be bundled
- **d** = Down

**What You Want to See:**

- Po1(SU) = Port-channel 1 is Layer 2 and Up
- Gi0/1(P) = Port is bundled and working
- Protocol shows LACP or PAgP

**Other Useful Commands:**

```
show etherchannel port-channel
show etherchannel detail
show interfaces port-channel 1
```

---

## Slide 16: Troubleshooting

### Visual Description
Table with common symptoms, causes, and solutions for EtherChannel issues.

### Speaker Notes

**Common Issues and Fixes:**

**Issue 1: Channel Won't Form**
- Symptom: Ports show (I) instead of (P)
- Cause: Mode mismatch (both passive/auto)
- Fix: Set at least one side to active/desirable

**Issue 2: Ports Suspended**
- Symptom: Ports show (s) in output
- Cause: Speed/duplex or VLAN mismatch
- Fix: Verify identical configuration on all ports

**Issue 3: Spanning Tree Loop**
- Symptom: Network instability, high CPU
- Cause: One side "on", other side "active"
- Fix: Use the same mode on both sides

**Issue 4: Partial Bundle**
- Symptom: Only some ports show (P)
- Cause: Different configs on some ports
- Fix: Check `show run interface range`

**Troubleshooting Steps:**

1. Check mode compatibility first
2. Verify protocol match (LACP vs PAgP)
3. Compare port configurations
4. Look at `show etherchannel summary` flags

**Demo:**

Walk through a troubleshooting scenario in Packet Tracer where the channel isn't forming, and show how to diagnose and fix it.

---

## Slide 17: Layer 3 EtherChannel

### Visual Description
Configuration showing no switchport command and IP address assignment to Port-channel interface.

### Speaker Notes

**EtherChannel at Layer 3:**

EtherChannel isn't just for switch-to-switch links. You can also create routed (Layer 3) EtherChannels.

**When to Use Layer 3 EtherChannel:**

- Connecting multilayer switches as routed links
- Point-to-point links between routers
- When you don't need VLANs on the link

**Configuration:**

```
Switch(config)# interface range GigabitEthernet0/1 - 2
Switch(config-if-range)# no switchport
Switch(config-if-range)# channel-group 1 mode active

Switch(config)# interface Port-channel 1
Switch(config-if)# ip address 10.1.1.1 255.255.255.0
```

**Key Difference:**

`no switchport` converts the interfaces to Layer 3 (routed) ports.

**In Summary Output:**

```
1      Po1(RU)       LACP        Gi0/1(P) Gi0/2(P)
          ^
          R = Layer 3 (Routed)
```

**CCNA Note:**

You should know Layer 3 EtherChannel exists, but the exam focuses more on Layer 2 configurations.

---

## Slide 18: Best Practices

### Visual Description
Two boxes: "Do This" (green checkmarks) and "Avoid This" (red X marks) with best practice guidelines.

### Speaker Notes

**Best Practices - Do This:**

1. **Use LACP** - Industry standard, works with any vendor
2. **Set one side to active** - Ensures negotiation happens
3. **Configure Port-channel interface** - Settings propagate to members
4. **Verify with show etherchannel summary** - Always confirm after configuring
5. **Document which ports are bundled** - Aids troubleshooting

**Best Practices - Avoid This:**

1. **Don't use "on" mode** - No protocol to catch misconfigurations
2. **Don't mix LACP and PAgP** - They're incompatible
3. **Don't configure individual ports differently** - Will cause suspension
4. **Don't create channels with VLAN mismatches** - Check trunk settings
5. **Don't exceed 8 active links** - LACP supports 8 active + 8 standby

**Production Guidance:**

In real networks:
- Use LACP active on both sides (simplest, most reliable)
- Keep port configurations identical
- Use descriptive channel group numbers (e.g., 12 for link to switch 2)

---

## Slide 19: Quick Reference

### Visual Description
Side-by-side command reference for LACP and PAgP with essential commands.

### Speaker Notes

**Quick Reference Card:**

**LACP Commands:**
```
channel-group 1 mode active    ! Initiates
channel-group 1 mode passive   ! Responds
```

**PAgP Commands:**
```
channel-group 1 mode desirable ! Initiates
channel-group 1 mode auto      ! Responds
```

**Static Mode:**
```
channel-group 1 mode on        ! Forces (risky)
```

**Essential Show Commands:**
```
show etherchannel summary
show etherchannel port-channel
show etherchannel load-balance
```

**Exam Day Checklist:**

- LACP = active + passive
- PAgP = desirable + auto
- At least one initiator required
- Same protocol on both ends
- On + On only (never mix with negotiation)

---

## Slide 20: Summary

### Visual Description
Four summary boxes covering: What is EtherChannel, Protocols, Requirements, and Exam Tips.

### Speaker Notes

**Final Review:**

**What is EtherChannel?**
- Bundles multiple physical links into one logical link
- Aggregates bandwidth (all links active)
- Provides redundancy (failover if one fails)
- Avoids STP blocking (seen as single link)

**Protocols:**
- LACP: Industry standard (active/passive)
- PAgP: Cisco only (desirable/auto)
- On: Static, no negotiation (risky)

**Requirements:**
- Same speed and duplex
- Same VLAN configuration
- Same port type (all access or all trunk)

**Exam Tips:**
- Know the mode compatibility matrix cold
- LACP is the preferred answer
- Passive + Passive = NO channel
- "show etherchannel summary" is your friend

**Lab Assignment:**

After this presentation, students should complete:
1. Configure LACP active-passive between two switches
2. Verify with show commands
3. Test failover by shutting down one link
4. Try different mode combinations to see failures

---

## Appendix: Quick Reference Tables

### Mode Compatibility Quick Reference

**LACP:**
| A | B | Forms? |
|---|---|--------|
| Active | Active | Yes |
| Active | Passive | Yes |
| Passive | Passive | No |

**PAgP:**
| A | B | Forms? |
|---|---|--------|
| Desirable | Desirable | Yes |
| Desirable | Auto | Yes |
| Auto | Auto | No |

**Static:**
| A | B | Forms? |
|---|---|--------|
| On | On | Yes |
| On | (any other) | DANGEROUS |

### Load-Balancing Methods

| Method | Command |
|--------|---------|
| Source MAC | src-mac |
| Destination MAC | dst-mac |
| Both MACs | src-dst-mac |
| Source IP | src-ip |
| Destination IP | dst-ip |
| Both IPs | src-dst-ip |

### Essential Verification Commands

```
show etherchannel summary
show etherchannel port-channel
show etherchannel detail
show etherchannel load-balance
show interfaces port-channel 1
show running-config interface port-channel 1
```

---

*End of Speaker Notes*
