# QoS (Quality of Service) Basics - Speaker Notes

**Prepared by:** EQ6
**Subject:** Network Essentials - Quality of Service (QoS)
**Presentation File:** qos-presentation.html
**Visualizer Tool:** qos-visualizer.html
**Target Audience:** CCNA candidates, network engineering students
**Presentation Duration:** 75-90 minutes (with demos and discussions)
**Difficulty Level:** Intermediate to Advanced
**CCNA Exam:** Sprint 26 - QoS Fundamentals

---

## Table of Contents

1. [Slide 1: Title Slide](#slide-1-title-slide)
2. [Slide 2: Why QoS?](#slide-2-why-qos)
3. [Slide 3: What is QoS?](#slide-3-what-is-qos)
4. [Slide 4: QoS Models](#slide-4-qos-models)
5. [Slide 5: QoS Process](#slide-5-qos-process)
6. [Slide 6: Classification](#slide-6-classification)
7. [Slide 7: DSCP - The Standard](#slide-7-dscp-the-standard)
8. [Slide 8: AF Classes](#slide-8-af-classes)
9. [Slide 9: CoS - Layer 2](#slide-9-cos-layer-2)
10. [Slide 10: Trust Boundaries](#slide-10-trust-boundaries)
11. [Slide 11: Queuing Methods](#slide-11-queuing-methods)
12. [Slide 12: FIFO vs Priority Queue](#slide-12-fifo-vs-priority-queue)
13. [Slide 13: LLQ](#slide-13-llq)
14. [Slide 14: WRED](#slide-14-wred)
15. [Slide 15: Policing vs Shaping](#slide-15-policing-vs-shaping)
16. [Slide 16: Token Bucket](#slide-16-token-bucket)
17. [Slide 17: Configuration Example](#slide-17-configuration-example)
18. [Slide 18: Marking Configuration](#slide-18-marking-configuration)
19. [Slide 19: Verification](#slide-19-verification)
20. [Slide 20: Summary](#slide-20-summary)

---

## Introduction to This Presentation

### Instructor Preparation Notes

**CRITICAL CONTEXT:** QoS is one of the most misunderstood topics in networking. Students often struggle with:
- The difference between DSCP and CoS
- Understanding when to use policing vs shaping
- Memorizing DSCP values (especially AF classes)
- Understanding that QoS only matters during congestion

**Why This Matters:**

In modern networks, QoS is absolutely essential:
- VoIP systems in every business
- Video conferencing (Zoom, Teams, WebEx)
- Cloud applications competing for bandwidth
- IoT devices and real-time monitoring
- Remote work increasing WAN utilization

Without QoS, voice calls become choppy, video freezes, and critical applications slow down during peak usage.

**Common Student Misconceptions:**

1. **"QoS creates bandwidth"** - NO! It manages existing bandwidth more intelligently
2. **"Higher DSCP = faster"** - Only during congestion; otherwise, all packets forwarded normally
3. **"CoS and DSCP are the same"** - Different layers, different fields, different use cases
4. **"I should mark everything as high priority"** - Defeats the purpose; causes all traffic to be equal again
5. **"Shaping is always better than policing"** - Context-dependent; each has proper use cases

**Prerequisites (Students Should Know):**

- TCP/IP fundamentals
- OSI model (Layer 2 vs Layer 3)
- Basic router/switch configuration
- Understanding of queues and buffers
- VLAN concepts (for CoS understanding)

**Real-World Context Examples:**

- Hospital networks prioritizing medical telemetry over guest Wi-Fi
- Financial institutions prioritizing trading applications over email
- Universities prioritizing online exams over YouTube streaming
- Contact centers ensuring clear VoIP for customer service

**Materials Needed:**

- Access to the QoS Visualizer tool (essential for understanding)
- Packet Tracer or GNS3 for configuration practice
- Wireshark for seeing DSCP/CoS in packet captures
- Audio samples showing VoIP quality degradation
- Whiteboard for drawing queuing diagrams

**Timing Recommendations:**

- Slides 1-5: Introduction and concepts (20 minutes)
- Slides 6-10: Classification and marking (20 minutes) - KEY SECTION
- Slides 11-14: Queuing mechanisms (20 minutes)
- Slides 15-16: Traffic conditioning (15 minutes)
- Slides 17-19: Configuration and verification (15 minutes)
- Slide 20: Summary and Q&A (5-10 minutes)

**Teaching Strategy:**

This topic requires heavy use of analogies and visual aids. Use the visualizer extensively. Students need to SEE queues filling and packets being processed to understand priority.

---

## Slide 1: Title Slide

### Visual Description
Purple gradient background with title "QoS - Quality of Service" and subtitle "Prioritizing Network Traffic for Optimal Performance." Sprint 26 indicator at bottom.

### Speaker Notes

**Opening (3 minutes):**

Welcome to our session on Quality of Service - one of the most practical and immediately applicable topics in networking. Before we dive in, let me ask you a question:

Have you ever been on a video call that suddenly froze? Or a phone call where the audio became robotic and choppy? That's what happens when networks don't properly implement QoS.

**Set Expectations:**

Today we're going to cover:
1. Why QoS exists and what problems it solves
2. How to classify and mark traffic (DSCP, CoS)
3. Different queuing mechanisms (with a focus on LLQ)
4. The difference between policing and shaping
5. How to configure basic QoS on Cisco devices

**The "Aha!" Moment You're Looking For:**

By the end of this session, when someone asks "Why is my VoIP call choppy?" you'll immediately think "QoS problem - probably no priority queue for voice traffic."

**Real-World Impact:**

I've seen networks with brand-new expensive VoIP phone systems that performed terribly because nobody configured QoS. The phones worked fine - the network just treated voice packets the same as someone's YouTube video, causing voice quality issues. Proper QoS fixed it immediately.

**CCNA Context:**

The exam will test your understanding of:
- DSCP values (especially EF and AF classes)
- The difference between trust boundaries
- Policing vs shaping
- Basic MQC (Modular QoS CLI) configuration

Let's get started!

---

## Slide 2: Why QoS?

### Visual Description
Four comparison boxes showing different traffic types (Voice, Video, Business Apps, Best-Effort) with their specific requirements for latency, jitter, packet loss, and bandwidth.

### Speaker Notes

**The Fundamental Problem (8 minutes):**

Not all network traffic is created equal. Let's break down why:

**Voice (VoIP) - The Most Demanding:**

When you speak into a phone, your voice is digitized and sent as small packets. For the conversation to sound natural:
- **Latency < 150ms:** If delay exceeds this, conversations become awkward (talking over each other)
- **Jitter < 30ms:** Variation in arrival times causes robotic, choppy audio
- **Packet Loss < 1%:** Voice codecs can handle tiny amounts of loss, but more = garbled audio
- **Bandwidth: Low:** Only 30-128 Kbps per call

The irony: Voice needs the LEAST bandwidth but the MOST attention to delay!

**Video - Bandwidth Hungry, Delay Sensitive:**

Video conferencing or streaming:
- **Latency < 200ms:** Slightly more tolerant than voice
- **Jitter < 50ms:** Video can buffer a bit more than voice
- **Packet Loss < 0.5%:** Video compression very sensitive to loss
- **Bandwidth: HIGH:** 384 Kbps to 20+ Mbps depending on quality

**Business-Critical Applications:**

Things like database transactions, ERP systems, CRM:
- Moderate delay tolerance (500ms-1s might be acceptable)
- But CANNOT afford packet loss (data integrity)
- Need guaranteed bandwidth during busy periods

**Best-Effort Traffic:**

Web browsing, email, file downloads:
- High delay tolerance (users wait for downloads)
- TCP handles retransmissions if packets lost
- No special treatment needed

**The Conflict - Why QoS is Essential:**

Imagine this scenario (use this story):

*"It's 2 PM on a Wednesday. Your company's CEO is on a critical video call with a potential client worth $5 million. At the same time, someone in accounting starts downloading a 10 GB file from SharePoint. Without QoS, that download consumes all available bandwidth on your internet connection. The CEO's video freezes, audio becomes choppy, and the meeting is a disaster. With QoS, the CEO's video gets priority, and the download simply takes a bit longer. Which scenario would your company prefer?"*

**Discussion Prompt:**

Ask students: "Can anyone think of other scenarios where different traffic types compete for bandwidth?"

Expected answers:
- Students streaming Netflix during online exams
- Hospital networks with patient monitors vs. staff Wi-Fi
- Manufacturing with SCADA systems vs. office traffic

**Key Takeaway:**

Without QoS, all traffic is equal. A massive file download can destroy a VoIP call even though the call only needs a tiny fraction of the bandwidth. QoS ensures that important, delay-sensitive traffic gets priority when congestion occurs.

---

## Slide 3: What is QoS?

### Visual Description
Definition of QoS with four key aspects it manages: Bandwidth, Delay, Jitter, and Packet Loss. Includes key concept box emphasizing QoS manages but doesn't create bandwidth.

### Speaker Notes

**Defining QoS (6 minutes):**

Quality of Service is a set of tools and techniques to:
1. Classify traffic into categories
2. Treat each category differently based on its needs
3. Ensure critical traffic gets through during congestion

**The Four Horsemen of QoS:**

**1. Bandwidth Management:**
- Guarantee minimum bandwidth for critical applications
- Example: "Voice always gets at least 256 Kbps"
- Reserve capacity for when it's needed

**2. Delay (Latency) Management:**
- Prioritize low-latency traffic (voice, video)
- Put them in priority queues that are serviced first
- Delay less important traffic when necessary

**3. Jitter Management:**
- Reduce variation in packet arrival times
- Priority queuing helps (consistent service)
- Jitter buffers on endpoints also help

**4. Packet Loss Management:**
- During congestion, drop less important traffic first
- Preferentially discard bulk data over voice
- Use intelligent drop mechanisms (WRED) to avoid TCP issues

**CRITICAL CONCEPT - Dispel This Myth:**

Students often think: "If I enable QoS, my network will be faster!"

**This is WRONG!**

QoS does NOT create bandwidth. If you have a 10 Mbps link, you still have 10 Mbps. QoS just ensures that:
- The RIGHT traffic gets through during congestion
- Critical apps don't starve because of bulk traffic
- Bandwidth is distributed intelligently, not first-come-first-served

**Analogy Time:**

QoS is like triage in an emergency room:
- Heart attack patient (voice) gets immediate attention
- Broken arm (data) waits a bit
- Common cold (bulk downloads) waits longer

Everyone gets treated, but in order of urgency. QoS doesn't make the hospital bigger - it manages the patients more effectively.

**When Does QoS Matter?**

This is crucial to understand:

**QoS ONLY matters during CONGESTION!**

If your link is 50% utilized, QoS does nothing. All packets go through normally. QoS activates when the link approaches 100% utilization and queues start filling up.

Think of it like traffic lanes:
- Light traffic: All lanes move smoothly, no advantage to being in one lane vs another
- Rush hour (congestion): HOV lane (priority queue) moves, regular lanes crawl

**Interactive Exercise:**

Ask: "If you have a 100 Mbps link and are only using 40 Mbps, will QoS improve your VoIP quality?"

Answer: Probably not! There's no congestion. QoS policies are configured but not actively prioritizing. The improvement comes during peak usage when you hit 100+ Mbps of demand.

---

## Slide 4: QoS Models

### Visual Description
Table comparing three QoS models: Best Effort (no QoS), IntServ (per-flow with RSVP), and DiffServ (class-based, industry standard).

### Speaker Notes

**Evolution of QoS Models (5 minutes):**

There have been three approaches to QoS over the years. Let's understand why DiffServ won.

**1. Best Effort (Default - No QoS):**

The original Internet model:
- All packets treated equally
- First-come, first-served (FIFO queuing)
- Simple, but doesn't meet modern needs
- Still the default if you don't configure QoS

**When to use:** Very small networks with no VoIP/video, or massively overprovisioned links where congestion never occurs.

**2. IntServ (Integrated Services) with RSVP:**

Developed in the 1990s for guaranteed service:
- **Per-flow reservations:** Each application flow reserves bandwidth
- **RSVP protocol:** Signals bandwidth needs end-to-end
- **Hard guarantees:** Reserved bandwidth is guaranteed

**Why it failed:**
- Doesn't scale! Imagine 100,000 flows - routers must track each one
- State maintenance overhead huge
- RSVP messages at every hop
- Never widely deployed in service provider networks

**When to use:** Legacy systems, very small controlled environments. Rarely seen today.

**3. DiffServ (Differentiated Services) - THE WINNER:**

The modern standard:
- **Class-based:** Group traffic into classes (voice, video, data, bulk)
- **Scalable:** Routers only track classes, not individual flows
- **DSCP markings:** 6-bit field in IP header identifies class
- **Per-hop behaviors (PHB):** Each router treats classes according to policy

**Why it won:**
- Scales to millions of flows
- Simple to configure and manage
- Industry standard (works across vendors)
- Flexible - multiple service levels

**CCNA Focus:**

The exam is 100% focused on DiffServ. You need to know:
- DSCP values and what they mean
- How to classify and mark traffic
- How to configure class-based policies (MQC)

IntServ/RSVP: Know it exists, but don't worry about configuration details.

**Exam Tip:**

If you see a question asking "What QoS model should be used for a scalable enterprise network with voice and video?" the answer is **DiffServ**.

---

## Slide 5: QoS Process

### Visual Description
Three-step process diagram showing Classification, Marking, and Queuing/Congestion Management with tools used at each step.

### Speaker Notes

**The QoS Workflow (7 minutes):**

QoS happens in three distinct phases. Understanding this workflow is KEY to both implementation and troubleshooting.

**Step 1: Classification - "What is this traffic?"**

**Goal:** Examine packets and determine which class they belong to.

**Methods:**
- **ACLs:** Match source/dest IP, port numbers
  - Example: "TCP port 5060-5061 = SIP voice signaling"
- **NBAR (Network-Based Application Recognition):** Deep packet inspection
  - Example: NBAR can identify YouTube traffic even with encrypted headers
- **Existing markings:** Trust DSCP/CoS values already set
  - Example: "If DSCP = 46, it's voice"

**Where:** Typically at the network edge (access switches/routers)

**Step 2: Marking - "Tag it for downstream devices"**

**Goal:** Set DSCP or CoS values so downstream devices know how to treat the traffic without re-classifying.

**Layer 3 Marking - DSCP:**
- 6-bit field in IP header
- Survives routing (stays with packet end-to-end)
- **Preferred method**

**Layer 2 Marking - CoS:**
- 3-bit field in 802.1Q VLAN tag
- Only on trunk links (access ports have no tag!)
- Doesn't survive routing (Layer 2 header is removed)

**Analogy:**

Classification is like a TSA agent checking your boarding pass. Marking is like getting a stamp on your hand at a theme park - shows you've paid for the "priority experience."

**Where:** Network edge, as close to source as possible

**Step 3: Queuing & Congestion Management - "Actually prioritize it"**

**Goal:** Use the markings to make forwarding decisions.

**Mechanisms:**
- **Queuing:** LLQ, CBWFQ - determine which packets sent first
- **Congestion avoidance:** WRED - intelligently drop packets before queues fill
- **Policing:** Drop/remark traffic exceeding rates
- **Shaping:** Buffer traffic to smooth flows

**Where:** Anywhere congestion occurs (typically WAN links, uplinks)

**The Complete Picture - Example Scenario:**

*"A user starts a VoIP call from their IP phone:*

1. **Access Switch (Classification & Marking):**
   - Switch trusts DSCP from phone (phone marks RTP as DSCP EF)
   - Or: Switch uses ACL to identify RTP ports 16384-32767
   - Sets DSCP = 46 (EF) if not already set

2. **Distribution/Core (Trusting):**
   - Sees DSCP = 46
   - Just forwards it (no re-marking needed)

3. **WAN Router (Queuing):**
   - Link is congested (98% utilization)
   - Sees DSCP = 46 → places in priority queue
   - Priority queue serviced first
   - Voice packet sent immediately
   - Bulk data packets wait

*Result: Voice quality remains excellent even though link is congested."*

**Airport Analogy (Students Love This):**

1. **Classification:** TSA checks your ticket - "Oh, you're First Class"
2. **Marking:** You get a First Class boarding pass with Group 1
3. **Queuing:** At the gate, Group 1 boards first while Group 5 waits

**Key Principle:**

**Classify and mark at the EDGE. Trust and queue in the CORE.**

Don't re-classify at every hop - it wastes CPU. Mark once, trust those markings throughout the network.

---

## Slide 6: Classification

### Visual Description
Table showing classification methods: DSCP (Layer 3), IP Precedence (Layer 3 legacy), CoS (Layer 2), ACLs (Layers 3-4), and NBAR (Layer 7).

### Speaker Notes

**Classification Deep Dive (8 minutes):**

Let's explore each classification method and when to use it.

**1. DSCP (Differentiated Services Code Point) - THE STANDARD:**

**Technical Details:**
- 6-bit field in IP header (ToS byte, bits 0-5)
- Decimal values 0-63
- Replaces the old 3-bit IP Precedence field

**Advantages:**
- Survives routing (stays in IP header end-to-end)
- Granular (64 possible values)
- Industry standard
- Works across vendors

**When to use:** Layer 3 classification for routed traffic. This is your primary method.

**2. IP Precedence (LEGACY - But Still Tested):**

**Technical Details:**
- 3-bit field in IP header (ToS byte, bits 0-2)
- Decimal values 0-7
- Older standard, mostly replaced by DSCP

**Relationship to DSCP:**
- DSCP uses the SAME ToS byte but extends it
- IP Precedence = bits 0-2 of DSCP
- DSCP backward compatible with IP Precedence

**Why it matters:**
- Some legacy equipment only understands IP Precedence
- Class Selector DSCP values (CS0-CS7) map to IP Precedence
- Example: IP Precedence 5 = DSCP CS5 (40)

**3. CoS (Class of Service) - LAYER 2:**

**Technical Details:**
- 3-bit field in 802.1Q tag (PCP field)
- Decimal values 0-7
- Part of the VLAN tag

**CRITICAL LIMITATION:**

**CoS ONLY exists on trunk links!**

Students miss this all the time. Access ports don't have a VLAN tag, so there's no place for CoS. CoS gets stripped when frames are untagged.

**When to use:**
- Switch-to-switch trunk links
- Mapping between Layer 2 and Layer 3 QoS
- When traffic doesn't cross routers

**CoS to DSCP Mapping:**

Most switches use default mapping:
- CoS 0 → DSCP 0
- CoS 1 → DSCP 8
- CoS 2 → DSCP 16
- CoS 3 → DSCP 24
- CoS 4 → DSCP 32
- CoS 5 → DSCP 46 (Voice!)
- CoS 6 → DSCP 48
- CoS 7 → DSCP 56

**4. ACLs (Access Control Lists):**

**How it works:**
Match traffic based on:
- Source/destination IP addresses
- Source/destination ports
- Protocol (TCP, UDP, ICMP, etc.)

**Example:**
```
! Classify VoIP traffic
access-list 100 permit udp any any range 16384 32767
! RTP typically uses UDP ports 16384-32767

class-map VOICE
  match access-group 100
```

**Advantages:**
- Very flexible
- Can match specific applications
- Works without existing markings

**Disadvantages:**
- CPU intensive (every packet checked against ACL)
- Must know port numbers/IPs
- Doesn't work well with dynamic ports or encryption

**5. NBAR (Network-Based Application Recognition):**

**How it works:**
- Deep packet inspection (DPI)
- Looks beyond headers into payload
- Has protocol signatures for thousands of applications
- Can identify apps even on non-standard ports

**Example:**
```
class-map YOUTUBE
  match protocol youtube

class-map WEBEX
  match protocol webex-meeting
```

**Advantages:**
- Identifies applications accurately
- Works with dynamic ports
- Large built-in protocol library

**Disadvantages:**
- CPU intensive
- Doesn't work with encrypted traffic (often)
- Requires NBAR-capable hardware
- Signature database needs updates

**When to use:** When you need to identify specific applications but can't rely on port numbers.

**Best Practice Recommendation:**

**Preferred approach:**
1. **Trust DSCP from trusted devices** (IP phones, video endpoints)
2. **Use NBAR for application identification** (YouTube, Netflix, etc.)
3. **Use ACLs as fallback** when NBAR can't identify traffic
4. **Remark untrusted sources** (end-user PCs)

**Exam Focus:**

Know that:
- DSCP is Layer 3, 6 bits, values 0-63
- CoS is Layer 2, 3 bits, values 0-7, **trunk links only**
- NBAR provides application-level visibility
- ACLs are flexible but CPU-intensive

---

## Slide 7: DSCP - The Standard

### Visual Description
Visual grid showing standard DSCP values (EF, AF4x, AF3x, AF2x, AF1x, DF, CS values) with decimal values and typical uses.

### Speaker Notes

**DSCP Deep Dive (10 minutes):**

This is exam-critical content. Students must memorize key DSCP values.

**The DSCP Field:**

**Location:** IP header, ToS byte, bits 0-5
**Range:** 0-63 (6 bits = 2^6 = 64 values)
**Purpose:** Indicate packet's class/priority for downstream devices

**Evolution:**
- Originally ToS byte was mostly unused
- IP Precedence used bits 0-2 (8 values)
- DiffServ redefined ToS byte, using 6 bits for DSCP
- Bits 6-7 reserved for ECN (Explicit Congestion Notification)

**Per-Hop Behaviors (PHB):**

DSCP values map to "behaviors" - how routers should treat the traffic:

**1. EF - Expedited Forwarding (DSCP 46) - THE VIP:**

**Decimal:** 46
**Binary:** 101110
**Use:** Voice (VoIP RTP audio)
**Behavior:** Strict priority, lowest latency, highest priority

**Why DSCP 46?**
- Chosen to be backward compatible with IP Precedence 5
- 101110 binary → bits 0-2 are 101 = IP Precedence 5
- Old equipment sees it as Precedence 5 (high priority)

**Critical for exam:**
"What DSCP value for voice?" → **46 or EF**

**2. AF - Assured Forwarding (12 values):**

**Format:** AF**XY**
- **X** = Class (4, 3, 2, or 1) - higher is better priority
- **Y** = Drop precedence (1, 2, or 3) - lower is better (less likely to drop)

**The Matrix:**

| Class | Low Drop (1) | Med Drop (2) | High Drop (3) |
|-------|--------------|--------------|---------------|
| **4** | AF41 (34) | AF42 (36) | AF43 (38) |
| **3** | AF31 (26) | AF32 (28) | AF33 (30) |
| **2** | AF21 (18) | AF22 (20) | AF23 (22) |
| **1** | AF11 (10) | AF12 (12) | AF13 (14) |

**Memory Trick:**

To calculate DSCP decimal from AFxy:
- Formula: DSCP = (8 × X) + (2 × Y)
- Example: AF31 = (8 × 3) + (2 × 1) = 24 + 2 = 26

**Typical Usage:**

- **AF4x (Class 4):** Video conferencing
  - AF41: High-quality video
  - AF42: Medium-quality video
  - AF43: Low-quality video (dropped first during congestion)

- **AF3x (Class 3):** Mission-critical data
  - AF31: SAP, Oracle ERP
  - AF32: Database transactions
  - AF33: Critical but can tolerate some loss

- **AF2x (Class 2):** Transactional data
  - AF21: Email servers
  - AF22: Web applications
  - AF23: Standard business apps

- **AF1x (Class 1):** Bulk data
  - AF11: File transfers
  - AF12: Backups
  - AF13: Non-critical bulk

**3. CS - Class Selector (8 values):**

**Values:** CS0 through CS7 (0, 8, 16, 24, 32, 40, 48, 56)
**Purpose:** Backward compatibility with IP Precedence

**Binary Pattern:**
- CS values have form: XXX000
- First 3 bits match IP Precedence
- Last 3 bits are zero

**Examples:**
- CS0 (0): Best effort (same as DF)
- CS1 (8): Scavenger class (lower than best effort!)
- CS5 (40): VoIP signaling (SIP, H.323)
- CS6 (48): Network control (routing protocols)
- CS7 (56): Reserved

**Cisco Recommendation:**
- **CS5 for VoIP signaling** (call setup, SIP messages)
- **EF for VoIP media** (actual audio RTP)

**4. DF - Default Forwarding (DSCP 0):**

**Value:** 0
**Binary:** 000000
**Use:** Best effort traffic
**Same as:** CS0

**Interactive Exercise:**

Pull up the QoS Visualizer and click through different DSCP values. Show students the decimal, binary, and use case for each.

**Exam Tips:**

**You MUST memorize:**
- EF = 46 (voice)
- AF41 = 34 (video)
- AF31 = 26 (critical data)
- CS5 = 40 (signaling)
- DF/CS0 = 0 (best effort)

**How to memorize AF values:**

Use the formula: **(8 × Class) + (2 × Drop)**

Practice:
- AF32 = (8×3) + (2×2) = 24 + 4 = 28 ✓
- AF21 = (8×2) + (2×1) = 16 + 2 = 18 ✓

**Cisco IOS Keyword vs Decimal:**

You can configure using either:
```
set ip dscp ef        ! Keyword
set ip dscp 46        ! Decimal (same thing)

set ip dscp af41      ! Keyword
set ip dscp 34        ! Decimal (same thing)
```

Know both!

---

## Slide 8: AF Classes Explained

### Visual Description
Detailed table breaking down all 12 AF values (AF11-AF43) showing class, drop precedence, and decimal values.

### Speaker Notes

**AF Classes Deep Dive (6 minutes):**

Let's fully understand Assured Forwarding classes and drop precedence.

**The AF Philosophy:**

AF provides **assured** forwarding, not **guaranteed**. It means:
- Traffic in this class gets preferential treatment
- Guaranteed minimum bandwidth during congestion
- But can be dropped if severely congested

**The Two Dimensions:**

**Dimension 1: Class (X in AFxy)**

Four classes provide different priority levels:
- **Class 4:** Highest priority (video)
- **Class 3:** High priority (mission-critical data)
- **Class 2:** Medium priority (transactional data)
- **Class 1:** Lower priority (bulk data)

Higher class = more important traffic, gets serviced first.

**Dimension 2: Drop Precedence (Y in AFxy)**

Within each class, three drop levels:
- **Drop 1:** Low drop probability (most important within class)
- **Drop 2:** Medium drop probability
- **Drop 3:** High drop probability (least important within class)

**How Drop Precedence Works:**

During congestion within a class:
1. AF_3 packets dropped first
2. If still congested, AF_2 packets dropped
3. AF_1 packets dropped last (most protected)

**Real-World Example:**

**Video Conferencing Application:**

Imagine Cisco WebEx:
- **Video keyframes** (critical): AF41 (low drop)
- **Video regular frames**: AF42 (medium drop)
- **Video low-priority frames**: AF43 (high drop)

During congestion:
- Drop AF43 first (video quality degrades but doesn't freeze)
- If more drops needed, drop AF42 (quality degrades more)
- Protect AF41 (keyframes essential for any video at all)

**Financial Trading Application:**

- **Live market data feed**: AF31 (critical, low drop)
- **Historical quote requests**: AF32 (important but not real-time)
- **Company research downloads**: AF33 (nice to have, but can be delayed)

**The Beauty of AF:**

Within a single application, you can differentiate between more and less critical data. This provides graceful degradation during congestion rather than total failure.

**Configuration Example:**

```
! Mark different types of business traffic
class-map match-any CRITICAL-DATA
  match dscp af31

class-map match-any TRANSACTIONAL-DATA
  match dscp af21

policy-map ENTERPRISE-QoS
  class CRITICAL-DATA
    bandwidth percent 30
    random-detect dscp-based  ! WRED drops AF33 before AF31
  class TRANSACTIONAL-DATA
    bandwidth percent 20
```

**AF Class Usage Guidelines (Cisco Recommendations):**

**AF4x Class:**
- Video conferencing (WebEx, Zoom, Teams)
- Interactive video
- Broadcast video

**AF3x Class:**
- Mission-critical data (ERP, CRM)
- Database transactions
- Citrix/VDI desktop traffic

**AF2x Class:**
- Transactional data (email servers, web apps)
- Client-server applications
- Standard business apps

**AF1x Class:**
- Bulk data transfers
- FTP, backup traffic
- Non-interactive data

**Common Mistake Students Make:**

"I'll mark everything as AF41 so it all gets high priority!"

**Why this fails:**
- Defeats the purpose - everything is equal again
- When everything is high priority, nothing is
- Proper QoS requires **differentiation**

**Exam Question Pattern:**

*"A company runs an ERP system that is mission-critical. What DSCP marking is recommended?"*

Answer: **AF31** (Class 3, Low Drop) - critical data class

*"During congestion, which packets are dropped first: AF21 or AF23?"*

Answer: **AF23** (higher drop precedence number = dropped first)

**Memory Trick for Drop Precedence:**

"Higher number = higher chance of being dropped"
- AF_3 → DROP ME FIRST
- AF_2 → Drop me second
- AF_1 → Protect me!

---

## Slide 9: CoS - Layer 2 Marking

### Visual Description
Table showing CoS values 0-7, their names, traffic types, and DSCP mappings. Includes warning about CoS only existing on trunk links.

### Speaker Notes

**CoS Deep Dive (7 minutes):**

CoS is frequently misunderstood. Let's clarify when and how to use it.

**CoS Technical Details:**

**Location:** 802.1Q VLAN tag, PCP (Priority Code Point) field
**Size:** 3 bits
**Range:** 0-7 (2^3 = 8 values)
**Standard:** IEEE 802.1p (part of 802.1Q)

**The 802.1Q Frame:**

```
[Dest MAC][Src MAC][802.1Q Tag][Type][Data][FCS]
                        |
                   [TPID][TCI]
                          |
                    [PCP][DEI][VID]
                     3bit 1bit 12bit
                     CoS  Drop VLAN ID
```

**PCP = Priority Code Point = CoS**

**THE CRITICAL LIMITATION (Exam Trap!):**

**CoS only exists in the 802.1Q VLAN tag!**

**What this means:**
- **Trunk links:** Have 802.1Q tag → CoS exists ✓
- **Access ports:** No VLAN tag → NO CoS field! ✗

**Common Student Mistake:**

*"I'll configure CoS on my access port connecting to a PC."*

**Wrong!** Access ports don't tag frames, so there's nowhere to put the CoS value. The configuration might be accepted but it does nothing.

**Where CoS Works:**
- Switch-to-switch trunk links
- Switch-to-router trunk links
- Switch-to-IP phone (phone has internal switch, uses tagged frames)

**CoS Values and Standard Uses:**

| CoS | Name | Use | Maps to DSCP |
|-----|------|-----|--------------|
| 7 | Network Control | Reserved (routing protocols) | CS7 (56) |
| 6 | Internetwork Control | Reserved (management) | CS6 (48) |
| 5 | **Voice** | **VoIP audio** | **EF (46)** |
| 4 | Video | Video conferencing | AF41 (34) |
| 3 | Critical Apps | Mission-critical data | AF31 (26) |
| 2 | Excellent Effort | Important data | AF21 (18) |
| 1 | Background | Bulk/backup | AF11 (10) |
| 0 | Best Effort | Default | DF (0) |

**Cisco IP Phone CoS Behavior:**

Cisco IP phones are special:
- Phone has a built-in 2-port switch
- PC connects to phone, phone connects to switch
- Phone sends TWO 802.1Q tags:
  - **Voice VLAN tag:** CoS 5 (voice traffic from phone)
  - **Data VLAN tag:** CoS 0 (traffic from PC through phone)

**Configuration:**
```
interface GigabitEthernet0/1
  switchport mode access
  switchport access vlan 10              ! Data VLAN
  switchport voice vlan 20               ! Voice VLAN
  mls qos trust cos                      ! Trust CoS from phone
```

**CoS to DSCP Mapping:**

Switches use a CoS-to-DSCP mapping table. Default Cisco mapping:

```
CoS 0 → DSCP 0
CoS 1 → DSCP 8
CoS 2 → DSCP 16
CoS 3 → DSCP 24
CoS 4 → DSCP 32
CoS 5 → DSCP 46  ← Voice!
CoS 6 → DSCP 48
CoS 7 → DSCP 56
```

**Why This Matters:**

When a frame arrives on a trunk link with CoS 5:
1. Switch reads CoS = 5
2. Maps to DSCP = 46 (using internal table)
3. Routes the packet with DSCP 46

When routing, Layer 2 header (with CoS) is discarded, but DSCP in IP header remains!

**CoS vs DSCP Decision Tree:**

**Use CoS when:**
- Traffic stays at Layer 2 (switch-to-switch)
- You need QoS on trunk links
- Working with non-IP traffic (yes, you can QoS Layer 2!)

**Use DSCP when:**
- Traffic will be routed
- You need end-to-end QoS
- Maximum granularity needed (64 values vs 8)

**Best Practice:**

**At the network edge:**
1. Trust DSCP from IP phones/endpoints
2. Map DSCP to CoS for trunk links
3. Trust CoS on trunk links between switches
4. Map CoS back to DSCP when routing

**Configuration Examples:**

```
! Trust CoS from IP phone
interface GigabitEthernet0/1
  mls qos trust cos

! Trust DSCP from trusted device
interface GigabitEthernet0/2
  mls qos trust dscp

! Don't trust - remark based on ACL
interface GigabitEthernet0/3
  mls qos trust device cisco-phone  ! Trust phone but not PC behind it
```

**Exam Tips:**

**Question pattern:**
*"Where does CoS exist?"*
Answer: 802.1Q VLAN tag (trunk links only)

*"How many bits is CoS?"*
Answer: 3 bits (values 0-7)

*"What CoS value for voice?"*
Answer: CoS 5

*"An access port connecting to a PC - can it use CoS?"*
Answer: No! Access ports don't have VLAN tags.

---

## Slide 10: Trust Boundaries

### Visual Description
Diagram showing trust boundary at access switch, with untrusted devices (PCs) on left and trusted devices (switches, routers) on right.

### Speaker Notes

**Trust Boundaries - Where to Trust QoS Markings (6 minutes):**

This is a security and policy concept. Not all devices should be trusted to mark their own traffic.

**The Trust Boundary Defined:**

The **trust boundary** is the point in the network where you start trusting QoS markings. Before this point, you verify/remark. After this point, you trust and use existing markings.

**Why Trust Boundaries Matter:**

**Scenario Without Trust Boundary:**

*User downloads the "QoS Hacker Tool" that marks all their YouTube traffic as DSCP EF (voice priority). Now their Netflix binge gets treated as voice, starving actual VoIP calls. Chaos!*

**Scenario With Trust Boundary:**

*Access switch ignores all markings from user PCs. It classifies traffic based on ACLs/NBAR and sets appropriate DSCP values. User's attempt to cheat is defeated.*

**Typical Network Design:**

```
[End Users] → [Access Switch] → [Distribution] → [Core] → [WAN]
UNTRUSTED      TRUST BOUNDARY    TRUSTED        TRUSTED    TRUSTED
 Remark here   ↑                 Trust markings here →
```

**Untrusted Devices:**

**Never trust:**
- End-user PCs, laptops
- Guest devices
- Unknown devices
- BYOD smartphones/tablets
- Anything a user controls

**Why:** Users can (intentionally or accidentally) mark traffic incorrectly

**Trusted Devices:**

**Typically trust:**
- Cisco IP phones
- Video conferencing endpoints (Cisco, Polycom)
- Other network devices (switches, routers, firewalls)
- Servers (with caution - depends on policy)

**The Special Case - Cisco IP Phones:**

Cisco phones are unique - you can trust them while NOT trusting the PC connected behind them.

**How it works:**
```
interface GigabitEthernet0/1
  switchport voice vlan 20
  mls qos trust device cisco-phone
```

This command:
- Trusts DSCP/CoS from the IP phone
- IGNORES markings from PC connected to phone
- Switch uses CDP to detect Cisco phone
- If no phone detected, doesn't trust

**Trust Options on Cisco Switches:**

```
! Trust nothing - remark everything
interface Gi0/1
  ! No trust command

! Trust CoS values
interface Gi0/1
  mls qos trust cos

! Trust DSCP values (preferred)
interface Gi0/1
  mls qos trust dscp

! Trust IP Precedence (legacy)
interface Gi0/1
  mls qos trust ip-precedence

! Trust Cisco IP phone but not PC
interface Gi0/1
  mls qos trust device cisco-phone
```

**Best Practices:**

**1. Set Trust Boundary at Access Layer:**
- Don't trust end-user devices
- Classify and mark at the access switch
- Trust those markings upstream

**2. Trust Known Good Devices:**
- Cisco IP phones (with `mls qos trust device cisco-phone`)
- Certified video endpoints
- Configure these exceptions explicitly

**3. Trust Network Devices:**
- Distribution and core switches
- WAN routers
- Don't re-classify unnecessarily (wastes CPU)

**4. Document Your Trust Policy:**
- Who sets markings?
- Where are markings trusted?
- What happens to untrusted traffic?

**Real-World Example:**

**Enterprise Network:**

```
[User PC] --- [IP Phone] --- [Access SW] --- [Dist SW] --- [Core] --- [WAN]
  Mark=EF      Mark=EF         Trusts         Trusts       Trusts     Queues
  (ignored)    (trusted)       phone,         DSCP         DSCP       based on
                              remarks PC                              DSCP
```

**Access switch config:**
```
interface range Gi0/1 - 24
  switchport access vlan 10        ! Data VLAN
  switchport voice vlan 20         ! Voice VLAN
  mls qos trust device cisco-phone ! Trust phone, not PC
  spanning-tree portfast           ! Quick port up for phones
```

**Troubleshooting Trust Issues:**

**Problem:** "Voice quality is poor even though we have QoS configured."

**Check:**
1. Is the access switch trusting the phone?
   ```
   show mls qos interface Gi0/1
   ```
2. Is the phone actually marking traffic?
   ```
   ! Use Wireshark to capture and check DSCP values
   ```
3. Are core/WAN routers trusting the markings?
   ```
   show policy-map interface
   ```

**Exam Tips:**

*"Where should the QoS trust boundary typically be set?"*
Answer: **Access layer / edge of the network**

*"Why shouldn't you trust end-user PCs for QoS markings?"*
Answer: **Users can mark traffic incorrectly (intentionally or not), defeating QoS policy**

*"What command trusts a Cisco IP phone but not the PC behind it?"*
Answer: `mls qos trust device cisco-phone`

---

## Slide 11: Queuing Methods

### Visual Description
Table comparing five queuing methods: FIFO, PQ, WFQ, CBWFQ, and LLQ, with descriptions and use cases.

### Speaker Notes

**Queuing Mechanisms Overview (8 minutes):**

Queuing is where the rubber meets the road - this is where prioritization actually happens.

**What is Queuing?**

When an interface receives packets faster than it can transmit them, packets must wait in queues (buffers). Queuing algorithms determine **which packet gets transmitted next**.

**No Congestion = No Queuing:**

Remember: If your interface is only 50% utilized, packets don't wait - they're immediately transmitted. Queuing only matters when the output buffer starts filling up (approaching 100% utilization).

**The Five Queuing Methods:**

**1. FIFO (First In, First Out):**

**How it works:**
- Single queue
- Packets transmitted in arrival order
- First packet in = first packet out
- No differentiation whatsoever

**Pros:**
- Simple, low CPU usage
- Predictable behavior
- Low latency when not congested

**Cons:**
- No prioritization (defeats QoS)
- Voice gets stuck behind large data packets
- Bursty traffic causes delay spikes

**When used:**
- Default on high-speed interfaces (>2 Mbps historically)
- When no QoS needed
- Fast links with minimal congestion

**Verdict:** Not suitable for modern networks with voice/video

**2. PQ (Priority Queuing):**

**How it works:**
- Four queues: High, Medium, Normal, Low
- **Strict priority:** High queue always serviced first
- Only moves to Medium when High is empty
- Only moves to Normal when High and Medium empty
- Etc.

**Pros:**
- Simple concept
- Guarantees low latency for high-priority traffic

**Cons:**
- **Starvation risk:** High-priority traffic can monopolize link
- If High queue never empties, lower queues never get serviced
- No bandwidth guarantees for lower queues
- Not recommended for production

**Legacy:** Largely replaced by LLQ

**3. WFQ (Weighted Fair Queuing):**

**How it works:**
- Automatically creates per-flow queues
- Gives each flow a "fair" share of bandwidth
- Weights based on IP Precedence
- Higher precedence = more bandwidth
- Low-volume flows (voice) get priority over high-volume flows

**Pros:**
- Automatic - no configuration needed
- Fair to all flows
- Protects small flows (voice) from large flows (FTP)

**Cons:**
- Limited control (you can't define classes)
- Doesn't scale (per-flow state = lots of queues)
- No strict priority option

**When used:**
- Default on serial links < 2 Mbps (historically)
- Simple deployments without custom classes
- When automatic fairness is sufficient

**Verdict:** Good for small deployments, but superseded by CBWFQ/LLQ

**4. CBWFQ (Class-Based Weighted Fair Queuing):**

**How it works:**
- You define traffic classes
- Assign minimum bandwidth guarantee to each class
- Uses WFQ within each class
- Shares remaining bandwidth proportionally

**Configuration:**
```
policy-map MY-POLICY
  class VIDEO
    bandwidth 2000   ! Guaranteed 2 Mbps
  class DATA
    bandwidth 1000   ! Guaranteed 1 Mbps
  class class-default
    fair-queue       ! Everything else shares remaining
```

**Pros:**
- Flexible - define your own classes
- Bandwidth guarantees prevent starvation
- Scales better than pure WFQ

**Cons:**
- No strict priority queue
- Not ideal for delay-sensitive traffic (voice)

**When used:**
- When you need custom classes
- Data-centric networks
- When strict priority not required

**Verdict:** Good for data, but not optimal for voice

**5. LLQ (Low Latency Queuing) - THE GOLD STANDARD:**

**How it works:**
- CBWFQ + strict priority queue
- Priority queue for delay-sensitive traffic (voice/video)
- Other classes get guaranteed bandwidth
- Priority queue is **policed** to prevent starvation

**Configuration:**
```
policy-map LLQ-POLICY
  class VOICE
    priority 256        ! Strict priority, limited to 256 Kbps
  class VIDEO
    bandwidth 2000      ! Guaranteed 2 Mbps
  class DATA
    bandwidth 1000      ! Guaranteed 1 Mbps
  class class-default
    fair-queue          ! Default class
```

**Pros:**
- Strict priority for voice (low latency)
- Bandwidth guarantees for data (no starvation)
- Industry best practice
- Balances all QoS needs

**Cons:**
- Slightly more complex config
- Requires understanding of traffic patterns

**When used:**
- **ALWAYS when you have voice/video + data**
- Modern enterprise networks
- Service provider customer edges
- Any mixed traffic environment

**Verdict:** This is what you should use!

**Comparison Summary:**

| Method | Priority? | Custom Classes? | Prevents Starvation? | Best For |
|--------|-----------|-----------------|---------------------|----------|
| FIFO | No | No | N/A | No QoS needed |
| PQ | Yes | No | **No** | Legacy (don't use) |
| WFQ | Weighted | No | Yes | Simple deployments |
| CBWFQ | Weighted | Yes | Yes | Data-only networks |
| **LLQ** | **Yes** | **Yes** | **Yes** | **Voice + Data** |

**Exam Focus:**

**You must know:**
- FIFO = no prioritization
- LLQ = strict priority + guaranteed bandwidth (best for voice)
- CBWFQ = guaranteed bandwidth but no strict priority

**Likely question:**
*"What queuing method is recommended for a network with VoIP and data traffic?"*
Answer: **LLQ (Low Latency Queuing)**

---

## Slide 12: FIFO vs Priority Queuing

### Visual Description
Side-by-side comparison showing FIFO's single queue with mixed traffic vs Priority Queuing's multiple queues sorted by priority.

### Speaker Notes

**Visual Understanding of Queuing (5 minutes):**

Let's visualize how different queuing methods handle traffic.

**FIFO Visual:**

```
Single Queue (FIFO)
┌─────────────────────────┐
│ [Video][Voice][Data][Voice][Bulk] │  → Transmit in order
└─────────────────────────┘

Problem: Voice packet #2 waits behind Video and Data!
```

**What happens:**
- Video packet arrives first → queue position 1
- Voice packet arrives → queue position 2
- Large data packet arrives → queue position 3
- Another voice packet → queue position 4

**Result:**
- Voice packet #2 waits for all previous packets to transmit
- If data packet is 1500 bytes and link is 1 Mbps:
  - Transmission time = (1500 bytes × 8 bits) / 1,000,000 = 12ms
- That 12ms delay can cause jitter for voice!

**Demo with Visualizer:**

Open the QoS Visualizer, select FIFO mode:
1. Add several random packets
2. Process them one by one
3. Show students that voice waits for bulk data

**Priority Queuing Visual:**

```
High Priority Queue (Voice)
┌────────┐
│ [Voice][Voice] │  → Always serviced first!
└────────┘

Medium Priority Queue (Video)
┌────────┐
│ [Video] │  → Serviced when High empty
└────────┘

Low Priority Queue (Data)
┌────────┐
│ [Data][Data] │  → Serviced when High/Med empty
└────────┘
```

**What happens:**
- All voice packets go to High queue
- All video packets go to Medium queue
- All data packets go to Low queue
- Scheduler ALWAYS checks High first
- Moves to Medium only when High is empty
- Moves to Low only when High and Medium empty

**Result:**
- Voice never waits for data/video
- Excellent voice quality
- **BUT: Risk of starvation if High queue never empties**

**The Starvation Problem:**

**Scenario:**
```
High Priority Queue keeps filling with "voice"
┌────────┐
│ [V][V][V][V][V][V]... │  → Continuous arrivals
└────────┘

Low Priority Queue never gets serviced
┌────────┐
│ [Data][Data][Data]... │  → Stuck forever!
└────────┘
```

If high-priority traffic is continuous:
- Low-priority queues never get any bandwidth
- Data transfers stall
- Users complain about slow file transfers
- Management traffic (SSH, SNMP) might fail

**Real-World Example:**

*"I once saw a network where someone misconfigured a file server's traffic as high priority. The server was doing continuous backups. Because the backup traffic was marked high priority, it monopolized the link. VoIP actually worked great, but web browsing and email ground to a halt!"*

**Why PQ is Dangerous:**

No mechanism to prevent high-priority queue from using 100% of bandwidth.

**Demo with Visualizer:**

1. Select Priority Queue mode
2. Add mostly Voice packets
3. Add a few Data packets
4. Process packets - show Voice always goes first
5. Ask: "What if Voice packets keep arriving?"
6. Answer: "Data packets never get transmitted!"

**The Solution Preview (LLQ):**

LLQ solves this by **policing** the priority queue:
- Priority queue limited to X Kbps
- If voice tries to exceed limit, excess is dropped
- This guarantees bandwidth remains for other queues

We'll cover LLQ in detail on slide 13.

**Exam Question Pattern:**

*"What is the disadvantage of Priority Queuing (PQ)?"*
Answer: **Lower-priority queues can be starved if high-priority queue continuously receives traffic**

*"Why is FIFO not suitable for voice traffic?"*
Answer: **No prioritization - voice packets wait behind large data packets, causing delay and jitter**

---

## Slide 13: LLQ - Low Latency Queuing

### Visual Description
Visual showing LLQ structure: priority queue at top (serviced first, bandwidth-limited), then class-based queues below with guaranteed bandwidth shares.

### Speaker Notes

**LLQ - The Best of Both Worlds (7 minutes):**

LLQ is the industry standard for voice + data networks. Understand this thoroughly.

**What is LLQ?**

LLQ = **Low Latency Queuing**

**Definition:** CBWFQ with a strict priority queue that is policed to prevent starvation.

**Components:**

1. **Priority Queue:**
   - Strict priority (always serviced first)
   - Used for delay-sensitive traffic (voice, maybe video)
   - **Bandwidth limited** (policed)
   - Keyword: `priority` in config

2. **Class-Based Queues:**
   - Guaranteed minimum bandwidth
   - Share remaining bandwidth proportionally
   - Used for data classes
   - Keyword: `bandwidth` in config

3. **Default Queue:**
   - Everything not explicitly classified
   - Gets leftover bandwidth
   - Usually uses fair-queuing

**How LLQ Works - Step by Step:**

**When a packet arrives:**

1. **Check class:**
   - Is it in a class with `priority` command?
     - **Yes:** Put in priority queue
     - **No:** Continue to step 2

2. **Check bandwidth limit:**
   - Has priority queue exceeded its bandwidth limit?
     - **No:** Transmit packet immediately
     - **Yes:** Drop packet (policing) or put in regular class queue

3. **For non-priority classes:**
   - Put packet in appropriate class queue
   - Queue gets its guaranteed bandwidth share
   - During light load, can use excess bandwidth

**Visual Model:**

```
┌─────────────────────────────────┐
│   Priority Queue (Voice)        │
│   ┌──────┐ Max: 256 Kbps        │ ← Serviced FIRST
│   │[V][V]│ Policed at limit     │   but LIMITED
└───┴──────┴─────────────────────┘
          ↓ (if priority queue empty, move down)
┌─────────────────────────────────┐
│   Video Queue                    │
│   ┌──────┐ Guaranteed: 2 Mbps   │ ← Gets guaranteed BW
│   │[Vid] │                       │
└───┴──────┴─────────────────────┘
          ↓
┌─────────────────────────────────┐
│   Data Queue                     │
│   ┌──────┐ Guaranteed: 1 Mbps   │
│   │[Data]│                       │
└───┴──────┴─────────────────────┘
          ↓
┌─────────────────────────────────┐
│   Default Queue                  │
│   ┌──────┐ Remaining bandwidth   │
│   │[Web] │                       │
└───┴──────┴─────────────────────┘
```

**Configuration Example:**

```
! Define classes
class-map match-any VOICE
  match ip dscp ef

class-map match-any VIDEO
  match ip dscp af41

class-map match-any CRITICAL-DATA
  match ip dscp af31

! Define policy
policy-map WAN-EDGE-QoS
  class VOICE
    priority 256                 ! Strict priority, max 256 Kbps
  class VIDEO
    bandwidth 2000               ! Guaranteed 2000 Kbps
  class CRITICAL-DATA
    bandwidth 1000               ! Guaranteed 1000 Kbps
  class class-default
    fair-queue                   ! Default class, remaining BW

! Apply to interface
interface Serial0/0/0
  bandwidth 10000                ! Tell IOS link is 10 Mbps
  service-policy output WAN-EDGE-QoS
```

**Why This Works:**

**For Voice:**
- Gets strict priority (serviced immediately)
- Low latency, low jitter
- **But**: Limited to 256 Kbps (can't monopolize link)

**For Video:**
- Guaranteed 2 Mbps minimum
- Can use more if available
- Waits for voice, but won't starve

**For Data:**
- Guaranteed 1 Mbps minimum
- Protected from being completely starved
- Can burst higher during off-peak

**For Default:**
- Gets whatever's left
- At minimum: 10 Mbps - 256 Kbps - 2 Mbps - 1 Mbps = 6.744 Mbps
- During light load: Could get much more

**The Math:**

Link capacity: 10 Mbps

**Minimum guarantees:**
- Voice: 256 Kbps (priority)
- Video: 2000 Kbps (guaranteed)
- Data: 1000 Kbps (guaranteed)
- Default: ~6.7 Mbps (remaining)

**Total: 10 Mbps** ✓

**During congestion:**
Each class gets at least its guarantee. Priority queue gets serviced first (within its limit).

**During light load:**
All classes can use excess bandwidth proportionally.

**Priority Policing - How It Works:**

```
priority 256
```

This means:
- Priority queue limited to 256 Kbps
- IOS measures traffic rate using token bucket
- If voice exceeds 256 Kbps, excess packets **dropped**

**Why police the priority queue?**

Prevents misconfigured or malicious sources from marking everything as high priority and monopolizing the link.

**Cisco Best Practices:**

**For voice:**
- Allocate 33% of link bandwidth max for voice (Cisco recommendation)
- Example: 10 Mbps link → max 3.3 Mbps for voice
- Calculate: (Concurrent calls) × (Codec bandwidth)
  - G.711: 87 Kbps per call (including overhead)
  - G.729: 31.5 Kbps per call
  - Example: 30 concurrent calls × 31.5 Kbps = ~945 Kbps

**For signaling:**
- Voice signaling (SIP, H.323) should be in separate class
- Usually CS3 or CS5
- Much lower bandwidth (typically < 5% of voice bandwidth)

**Complete Enterprise Example:**

```
policy-map ENTERPRISE-WAN
  class VOICE-RTP
    priority percent 15          ! 15% strict priority for voice
  class VOICE-SIGNALING
    bandwidth percent 5          ! 5% for SIP/H.323
  class VIDEO
    bandwidth percent 25         ! 25% for video
  class CRITICAL-DATA
    bandwidth percent 20         ! 20% for ERP/CRM
  class TRANSACTIONAL-DATA
    bandwidth percent 15         ! 15% for email/web apps
  class class-default
    bandwidth percent 20         ! 20% for everything else
    random-detect                ! WRED for TCP
```

**Percentage-based vs Absolute:**

You can specify:
- **Absolute:** `bandwidth 2000` (2000 Kbps)
- **Percent:** `bandwidth percent 25` (25% of link)

**Percent is better for:**
- Circuits with variable speeds
- Templated configs across different link speeds
- Metro Ethernet with dynamic bandwidth

**Exam Tips:**

*"What queuing method provides strict priority for voice while preventing starvation of data traffic?"*
Answer: **LLQ (Low Latency Queuing)**

*"What command creates a strict priority queue in a policy-map?"*
Answer: `priority` (with bandwidth in Kbps or percent)

*"Why is the priority queue policed in LLQ?"*
Answer: **To prevent high-priority traffic from monopolizing the link and starving other queues**

---

## Slide 14: Congestion Avoidance - WRED

### Visual Description
Comparison of Tail Drop (all packets dropped when queue full, causing TCP global synchronization) vs WRED (random early drops prevent synchronization).

### Speaker Notes

**WRED - Preventing TCP Global Synchronization (8 minutes):**

WRED is subtle but important. It prevents a problem most people don't even know exists.

**The Problem: TCP Global Synchronization**

**Scenario without WRED:**

1. Queue gradually fills as traffic increases
2. Queue reaches 100% full (tail drop threshold)
3. **ALL new packets are dropped** (tail drop)
4. **ALL TCP sessions detect loss** (via missing ACKs)
5. **ALL TCP sessions slow down** (congestion control)
6. Queue drains, link utilization drops
7. **ALL TCP sessions speed back up** (slow start recovery)
8. Queue fills again → repeat

**Result:**
- Oscillating throughput (inefficient)
- All TCP flows synchronized in their slow-down/speed-up cycles
- Poor link utilization (swings between empty and full)

**Visual Representation:**

```
Link Utilization Over Time (WITHOUT WRED):

100% │     ╱╲        ╱╲        ╱╲
     │    ╱  ╲      ╱  ╲      ╱  ╲
     │   ╱    ╲    ╱    ╲    ╱    ╲
  0% │__╱______╲__╱______╲__╱______╲___
     └─────────────────────────────────> Time

     Oscillation = inefficiency
```

**The Solution: WRED**

**WRED = Weighted Random Early Detection**

**How it works:**

1. Monitor queue depth continuously
2. **Before queue fills**, start randomly dropping packets
3. Drop probability increases as queue fills
4. Different drop probabilities per DSCP (hence "Weighted")
5. Lower-priority traffic dropped first

**Effect:**
- TCP sessions slow down at **different times** (randomized)
- No global synchronization
- Smoother, more consistent throughput
- Better link utilization

**Visual Representation:**

```
Link Utilization Over Time (WITH WRED):

100% │ ────────────────────────────────
     │  (stable, high utilization)
     │
  0% └─────────────────────────────────> Time

     Stable = efficient
```

**WRED Thresholds:**

WRED uses three thresholds per class:

1. **Minimum Threshold (Min):**
   - Below this: No drops
   - Queue depth acceptable

2. **Maximum Threshold (Max):**
   - Above this: 100% drop (tail drop)
   - Queue completely full

3. **Between Min and Max:**
   - Drop probability increases linearly
   - Formula: Drop % = ((Queue Depth - Min) / (Max - Min)) × MPD
   - MPD = Mark Probability Denominator

**Example:**

```
Min Threshold: 20 packets
Max Threshold: 40 packets
MPD: 10 (means 1/10 = 10% max drop probability)

Queue Depth = 20: Drop probability = 0%
Queue Depth = 30: Drop probability = 5%
Queue Depth = 40: Drop probability = 10% (then tail drop)
```

**Weighted (Per-DSCP) Dropping:**

WRED can have different thresholds per DSCP:

```
DSCP EF (Voice):
  Min: 35, Max: 40  (Almost never drop)

DSCP AF31 (Critical):
  Min: 25, Max: 40  (Drop reluctantly)

DSCP AF11 (Bulk):
  Min: 10, Max: 40  (Drop aggressively)
```

**Result:**
- During congestion, bulk data dropped first
- Critical data protected
- Voice almost never dropped

**Configuration:**

```
policy-map QoS-POLICY
  class CRITICAL-DATA
    bandwidth percent 30
    random-detect dscp-based    ! Enable WRED with DSCP weighting
  class BULK-DATA
    bandwidth percent 10
    random-detect dscp-based
```

**Advanced Configuration:**

```
policy-map ADVANCED-QoS
  class DATA-CLASS
    bandwidth 2000
    random-detect dscp-based
    random-detect dscp 26 25 40 10  ! AF31: min=25, max=40, MPD=10
    random-detect dscp 10 10 40 10  ! AF11: min=10, max=40, MPD=10
```

**When to Use WRED:**

**Use WRED on:**
- Data classes (TCP traffic)
- Classes where some packet loss is acceptable
- Classes with multiple DSCP values (AF classes)

**DO NOT use WRED on:**
- **Voice classes** (UDP, doesn't retransmit, drops = bad audio)
- **Video classes** (UDP, loss causes visual artifacts)
- Any UDP real-time traffic

**Why not voice/video?**

- UDP doesn't respond to drops (no congestion control)
- Drops don't help - just cause quality degradation
- Use policing/priority for voice/video, WRED for data

**WRED + AF Classes = Perfect Match:**

Remember AF classes have drop precedences (AF_1, AF_2, AF_3)?

WRED can drop these differently:
- AF31 (low drop): Min=30, Max=40
- AF32 (med drop): Min=25, Max=40
- AF33 (high drop): Min=20, Max=40

Result: AF33 dropped first, AF31 protected most.

**Real-World Scenario:**

*"A company has a 50 Mbps MPLS circuit. They notice periodic slowdowns where everything stops for a few seconds, then resumes. Looking at graphs, they see oscillating bandwidth usage. Problem: No WRED configured, causing TCP global sync. Solution: Enable WRED on data classes. Result: Smooth, consistent throughput."*

**Exam Tips:**

*"What problem does WRED prevent?"*
Answer: **TCP global synchronization** (or tail drop causing all TCP sessions to slow down simultaneously)

*"Should WRED be used on voice traffic classes?"*
Answer: **No - voice is UDP and doesn't retransmit. Use priority queuing for voice.**

*"What does 'Weighted' mean in WRED?"*
Answer: **Different drop probabilities based on DSCP/IP Precedence values** (lower priority dropped more aggressively)

---

## Slide 15: Policing vs Shaping

### Visual Description
Side-by-side comparison boxes showing policing (drops excess, no buffering) vs shaping (buffers excess, delays traffic).

### Speaker Notes

**Traffic Conditioning - Policing vs Shaping (8 minutes):**

Both policing and shaping limit traffic rates, but they handle excess traffic very differently. This is a frequent exam topic.

**The Common Goal:**

Both mechanisms enforce a traffic rate limit (e.g., 10 Mbps). When traffic exceeds the limit, they must do something with the excess.

**Policing: The Hard Limit**

**Behavior:**
- Monitors traffic rate in real-time
- Compares to configured rate (CIR)
- **Excess traffic:** DROPPED or REMARKED
- **No buffering** (minimal delay added)

**Actions on Excess:**
1. **Drop:** Discard the packet (most common)
2. **Remark:** Change DSCP to lower priority (less common)
3. **Transmit:** Forward anyway (defeats the purpose, rarely used)

**Characteristics:**
- Can cause packet loss
- Minimal latency added
- Can be applied **inbound or outbound**
- Less CPU/memory intensive
- "Aggressive" enforcement

**When to Use Policing:**

**Service Provider Edge (Ingress):**
- Enforce customer rate limits
- Customer pays for 10 Mbps, gets 10 Mbps (excess dropped)
- Protect provider network from abuse

**Example:**
```
! ISP router - police customer ingress to 10 Mbps
policy-map POLICE-CUSTOMER
  class class-default
    police cir 10000000      ! 10 Mbps
      conform-action transmit
      exceed-action drop

interface GigabitEthernet0/0
  service-policy input POLICE-CUSTOMER
```

**Enterprise Scenarios:**
- Limit guest network to 10 Mbps
- Limit backup traffic to 5 Mbps
- Prevent rogue applications from consuming bandwidth

**Effect on TCP:**
- Drops cause retransmissions
- TCP backs off (congestion control)
- May not achieve full rate limit due to drops

**Shaping: The Smooth Approach**

**Behavior:**
- Monitors traffic rate in real-time
- Compares to configured rate (CIR)
- **Excess traffic:** BUFFERED (delayed)
- Traffic sent out at smooth, configured rate

**Characteristics:**
- No packet loss (unless buffer full)
- Adds latency (buffering delay)
- **Outbound only** (can't buffer incoming traffic - nowhere to store it)
- More CPU/memory intensive (buffering)
- "Gentle" enforcement

**How Shaping Works:**

```
Incoming Traffic (bursty):
100 Mbps ▓▓▓▓▓░░░░░▓▓▓▓▓░░░░░▓▓▓▓▓
                ↓
           Shaping Buffer
                ↓
Outgoing Traffic (smooth):
10 Mbps  ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
```

**When to Use Shaping:**

**Customer Edge (Egress):**
- Match traffic rate to provider's policer
- Prevent being policed (drops) by smoothing traffic
- Better TCP performance

**Example:**
```
! Customer router - shape egress to 10 Mbps
! (to match ISP's 10 Mbps ingress policing)
policy-map SHAPE-TO-ISP
  class class-default
    shape average 10000000   ! 10 Mbps

interface GigabitEthernet0/1
  service-policy output SHAPE-TO-ISP
```

**Why Shape to Match Policer?**

**Scenario:**
- ISP polices you at 10 Mbps ingress (on their router)
- You send bursty traffic (15 Mbps bursts)
- ISP's policer drops excess → TCP retransmits → poor performance

**Solution:**
- You shape egress to 10 Mbps (on your router)
- Traffic arrives smoothly at ISP at exactly 10 Mbps
- ISP's policer never drops → better TCP performance

**Other Shaping Uses:**
- Frame Relay (match CIR)
- Metro Ethernet (smooth bursts)
- Satellite links (prevent exceeding rate)

**Policing vs Shaping Comparison:**

| Aspect | Policing | Shaping |
|--------|----------|---------|
| **Excess Action** | Drop/Remark | Buffer/Delay |
| **Packet Loss** | Yes (on excess) | No (unless buffer full) |
| **Latency** | Minimal | Increased (buffering) |
| **Direction** | Inbound or Outbound | Outbound only |
| **Where Used** | Provider ingress, rate limiting | Customer egress, smoothing |
| **TCP Performance** | Can cause retransmits | Better (no drops) |
| **Resources** | Low | Higher (buffering) |

**Real-World Example:**

**Typical WAN Scenario:**

```
[Customer Router] ──┤ Shape 10M ├──> [ISP Cloud] ──┤ Police 10M ├──> [Internet]
                     Your control              ISP's control
```

**Your router:**
```
interface Serial0/0/0
  service-policy output SHAPE-TO-ISP
```

**ISP's router:**
```
interface GigabitEthernet0/0
  service-policy input POLICE-CUSTOMER
```

**Result:**
- You shape at 10 Mbps (smooth traffic)
- ISP polices at 10 Mbps (enforcement)
- Your shaping prevents ISP's policing from dropping
- Good TCP performance achieved

**Hierarchical QoS - Combining Shaping and Queuing:**

Often you shape the total rate AND prioritize within that shaped rate:

```
policy-map CHILD-QUEUING
  class VOICE
    priority 256
  class VIDEO
    bandwidth 2000
  class class-default
    fair-queue

policy-map PARENT-SHAPING
  class class-default
    shape average 10000000
    service-policy CHILD-QUEUING
```

This:
1. Shapes total traffic to 10 Mbps
2. Within that 10 Mbps, prioritizes voice/video

**Exam Tips:**

*"What is the difference between policing and shaping?"*
Answer: **Policing drops/remarks excess traffic; shaping buffers it (delays)**

*"Can policing be applied inbound?"*
Answer: **Yes** (shaping is outbound only)

*"When would you use shaping instead of policing?"*
Answer: **On customer edge to match provider's rate and prevent drops from their policing**

*"Which causes packet loss: policing or shaping?"*
Answer: **Policing** (drops excess; shaping buffers it)

---

## Slide 16: Token Bucket Algorithm

### Visual Description
Explanation of token bucket parameters: CIR (rate tokens added), Bc (bucket size), Be (excess burst), with formulas and examples.

### Speaker Notes

**Token Bucket Mechanism (7 minutes):**

Both policing and shaping use the token bucket algorithm. Understanding this helps troubleshoot QoS issues.

**The Token Bucket Concept:**

Think of tokens as "permission slips" to transmit bits.

**The Bucket:**
- Holds tokens
- Has a maximum capacity (Bc)
- Tokens added at a constant rate (CIR)

**Packet Transmission:**
- Each packet needs tokens equal to its size (in bits)
- Packet arrives → check if enough tokens
  - **Yes:** Remove tokens, transmit packet
  - **No:** Action depends (drop for policing, buffer for shaping)

**Analogy:**

Imagine a toll booth:
- Tokens = toll tickets
- CIR = rate tickets are dispensed (e.g., 1 per second)
- Bc = size of your wallet (max tickets you can hold)
- Car (packet) arrives → needs 1 ticket
  - Have ticket? Go through, ticket removed
  - No ticket? Wait (shaping) or turn away (policing)

**Token Bucket Parameters:**

**1. CIR (Committed Information Rate):**

**Definition:** Average rate at which tokens are added to the bucket (target rate)
**Units:** bps (bits per second)
**Example:** `police cir 10000000` = 10 Mbps

**What it means:**
- Long-term average rate
- Tokens accumulate at this rate
- Example: 10 Mbps = 10,000,000 tokens/sec

**2. Bc (Committed Burst):**

**Definition:** Bucket size (maximum tokens that can accumulate)
**Units:** bits
**Example:** `police cir 10000000 bc 1500000` = 1.5 Mb burst

**What it means:**
- How much bursting is allowed
- If bucket is full, can send burst instantly
- Larger Bc = more burst tolerance

**Default Bc Calculation:**
- IOS calculates if you don't specify
- Formula: Bc = CIR / 32 (for sub-T1 rates)
- Formula: Bc = CIR × 1.5 seconds / 8 (for higher rates, max 512 KB)

**3. Be (Excess Burst):**

**Definition:** Additional burst allowance beyond Bc
**Units:** bits
**Example:** `police cir 10000000 bc 1500000 be 1000000`

**What it means:**
- Extra tokens for occasional bursts
- Only for policing (allows remarking instead of dropping)
- Less commonly used

**Token Bucket Operation - Step by Step:**

**Time T=0:**
- Bucket empty (0 tokens)
- CIR = 10 Mbps, Bc = 1 Mb

**Time T=1 second:**
- Tokens added: 10,000,000 (CIR × 1 sec)
- Bucket contains: 1,000,000 (capped at Bc)
- Excess tokens discarded

**Packet arrives (size 12,000 bits):**
- Check bucket: 1,000,000 tokens available
- Remove: 12,000 tokens
- Transmit packet
- Remaining: 988,000 tokens

**Time T=1.1 seconds (100ms later):**
- Tokens added: 1,000,000 (CIR × 0.1 sec)
- Bucket contains: 988,000 + 1,000,000 = 1,988,000
- Cap at Bc: 1,000,000 (limit reached, extra discarded)

**Bursting Example:**

**Scenario:** CIR = 10 Mbps, Bc = 2 Mb, no traffic for 1 second

**Bucket state:**
- Filled to 2 Mb (Bc limit)

**Large burst arrives: 3 Mb in 100ms**

**What happens:**
- First 2 Mb: Use tokens from bucket (instant transmission)
- Remaining 1 Mb: Tokens being added at CIR
  - Time to send 1 Mb at 10 Mbps = 0.1 seconds
  - Burst accommodated!

**Result:** Can handle 3 Mb in 200ms (burst + CIR)

**Why Bc Matters:**

**Small Bc (e.g., 100 KB):**
- Strict rate limiting
- Small bursts allowed
- More packet drops (policing) or buffering (shaping)

**Large Bc (e.g., 10 MB):**
- Large bursts allowed
- Can send big chunks of data instantly
- Better for bursty applications

**Cisco Default Bc:**

IOS calculates Bc to accommodate ~1.5 seconds of traffic at CIR:
- CIR = 10 Mbps → Bc = 15 Mb (but capped at 512 KB typically)

**Policing with Token Bucket:**

```
policy-map POLICE-10M
  class class-default
    police cir 10000000 bc 1500000
      conform-action transmit   ! Tokens available
      exceed-action drop        ! No tokens
```

**Conform:** Traffic within CIR (tokens available) → transmit
**Exceed:** Traffic exceeds CIR (no tokens) → drop

**With Be (Three-color policing):**

```
police cir 10000000 bc 1500000 be 1000000
  conform-action transmit              ! Within CIR
  exceed-action set-dscp-transmit af11 ! Between CIR and CIR+Be, remark
  violate-action drop                  ! Above CIR+Be
```

**Conform:** Within Bc tokens → transmit as-is
**Exceed:** Within Be tokens → remark to lower priority, transmit
**Violate:** No tokens at all → drop

**Shaping with Token Bucket:**

```
policy-map SHAPE-10M
  class class-default
    shape average 10000000 1500000
                  ↑ CIR    ↑ Bc
```

**Same token bucket, different action:**
- Tokens available: Transmit
- No tokens: **Buffer packet** (wait for tokens)

**Tuning Bc for Applications:**

**VoIP:**
- Small packets, constant rate
- Small Bc sufficient (e.g., 100 KB)

**File Transfers:**
- Large packets, bursty
- Large Bc helpful (e.g., 10 MB)

**Web Browsing:**
- Bursty (page loads)
- Medium Bc (e.g., 1-5 MB)

**Exam Tips:**

*"What does CIR define in policing/shaping?"*
Answer: **Average committed rate** (rate at which tokens are added to bucket)

*"What does Bc define?"*
Answer: **Committed burst size** (maximum tokens bucket can hold / burst capacity)

*"If policing shows 'exceed-action drop,' what does this mean?"*
Answer: **Traffic exceeds CIR (no tokens available), so packets are dropped**

---

## Slide 17: QoS Configuration Example

### Visual Description
Code block showing MQC (Modular QoS CLI) three-step configuration: class-map, policy-map, service-policy.

### Speaker Notes

**MQC Configuration (6 minutes):**

MQC is Cisco's standard QoS configuration method. It's modular, flexible, and reusable.

**MQC = Modular QoS CLI**

**Three-Step Process:**

1. **class-map:** Define what traffic to match (classification)
2. **policy-map:** Define what to do with matched traffic (actions)
3. **service-policy:** Apply policy to interface (activation)

**Step 1: Define Classes (Classification)**

```
class-map match-any VOICE
  match ip dscp ef

class-map match-any VIDEO
  match ip dscp af41

class-map match-any CRITICAL-DATA
  match ip dscp af31
```

**Explanation:**
- `match-any`: Match if ANY condition is true (logical OR)
- `match-all`: Match only if ALL conditions true (logical AND)
- `match ip dscp ef`: Match packets with DSCP = EF

**Multiple Match Conditions:**

```
class-map match-any STREAMING-VIDEO
  match ip dscp af41
  match ip dscp af42
  match protocol youtube
  match protocol netflix
```

Matches any of these conditions (OR logic)

```
class-map match-all SECURE-WEB
  match protocol https
  match access-group 101
```

Must match both (AND logic)

**Step 2: Define Policy (Actions)**

```
policy-map WAN-QoS
  class VOICE
    priority 256                ! Strict priority, 256 Kbps max
  class VIDEO
    bandwidth 512               ! Guaranteed 512 Kbps
  class CRITICAL-DATA
    bandwidth 256               ! Guaranteed 256 Kbps
  class class-default
    fair-queue                  ! Default class, remaining BW
```

**Actions Available:**

**Queuing:**
- `priority [kbps]` - Strict priority queue
- `bandwidth [kbps]` - Guaranteed bandwidth
- `fair-queue` - WFQ for default class

**Dropping:**
- `random-detect` - Enable WRED
- `random-detect dscp-based` - WRED per DSCP

**Marking:**
- `set ip dscp [value]` - Set DSCP
- `set ip precedence [value]` - Set IP Precedence
- `set cos [value]` - Set CoS (Layer 2)

**Policing/Shaping:**
- `police cir [bps]` - Police to rate
- `shape average [bps]` - Shape to rate

**Step 3: Apply to Interface**

```
interface GigabitEthernet0/0
  service-policy output WAN-QoS
```

**Direction:**
- `output` - Outbound QoS (most common)
- `input` - Inbound QoS (limited support, usually policing only)

**Complete Working Example:**

```
! ─────────────────────────────────────
! STEP 1: Define Classes
! ─────────────────────────────────────
class-map match-any VOICE
  match ip dscp ef
  description Voice RTP packets

class-map match-any VOICE-SIGNALING
  match ip dscp cs5
  description SIP/H.323 signaling

class-map match-any VIDEO
  match ip dscp af41
  match ip dscp af42
  description Video conferencing

class-map match-any CRITICAL-DATA
  match ip dscp af31
  description ERP/CRM/Database

class-map match-any TRANSACTIONAL
  match ip dscp af21
  description Email/Web apps

! ─────────────────────────────────────
! STEP 2: Define Policy
! ─────────────────────────────────────
policy-map WAN-EDGE-QoS
  description QoS policy for 10 Mbps WAN

  class VOICE
    priority 256
    ! Strict priority, max 256 Kbps
    ! For 30 concurrent G.729 calls (31.5 Kbps each)

  class VOICE-SIGNALING
    bandwidth 64
    ! Guaranteed 64 Kbps for call setup/teardown

  class VIDEO
    bandwidth 2000
    random-detect dscp-based
    ! Guaranteed 2 Mbps, WRED for congestion

  class CRITICAL-DATA
    bandwidth 1500
    random-detect dscp-based
    ! Guaranteed 1.5 Mbps for business apps

  class TRANSACTIONAL
    bandwidth 1000
    random-detect dscp-based
    ! Guaranteed 1 Mbps for standard apps

  class class-default
    fair-queue
    random-detect
    ! Default class, remaining ~5 Mbps

! ─────────────────────────────────────
! STEP 3: Apply to Interface
! ─────────────────────────────────────
interface Serial0/0/0
  description WAN link to MPLS provider
  bandwidth 10000                ! Tell IOS link is 10 Mbps
  ip address 10.1.1.1 255.255.255.252
  service-policy output WAN-EDGE-QoS
```

**Verification:**

```
! View policy config
show policy-map WAN-EDGE-QoS

! View applied policy and statistics
show policy-map interface Serial0/0/0

! View class-map config
show class-map VOICE
```

**Common Mistakes:**

**Mistake 1: Forgetting `bandwidth` command on interface**
```
interface Serial0/0/0
  bandwidth 10000   ! ← This is required!
  service-policy output WAN-QoS
```

Without `bandwidth`, IOS doesn't know link speed and can't calculate percentages.

**Mistake 2: Total guarantees exceed 100%**
```
policy-map BAD-POLICY
  class VOICE
    priority percent 50   ! 50%
  class VIDEO
    bandwidth percent 40  ! 40%
  class DATA
    bandwidth percent 30  ! 30%

! Total = 120% - ERROR!
```

**Mistake 3: Using `priority` for non-voice traffic**
```
! Don't do this
class VIDEO
  priority 2000   ! BAD - video is delay-sensitive but not as critical as voice

! Instead
class VIDEO
  bandwidth 2000  ! GOOD - guaranteed but not strict priority
```

**Best Practices:**

1. **Document classes:** Use `description` command
2. **Use percentages:** More flexible across link speeds
3. **Leave headroom:** Don't allocate 100% (leave ~20% for overhead/default)
4. **Priority for voice only:** Don't overuse strict priority
5. **WRED for data:** Enable on TCP classes, not voice/video

---

## Slide 18: Marking Configuration

### Visual Description
Code examples showing traffic marking at the network edge using class-maps, policy-maps, and MLS QoS trust configurations.

### Speaker Notes

**Classification and Marking at the Edge (6 minutes):**

Remember: Classify and mark once at the edge, then trust those markings throughout the network.

**Where to Mark:**

**Access Layer:**
- First switch/router that receives traffic
- Where you have context about the application
- Before traffic enters distribution/core

**Why Mark at Edge:**

1. **Efficiency:** Classify once, not at every hop
2. **Control:** Enforce policy where traffic enters
3. **Scalability:** Core doesn't waste CPU re-classifying

**Marking Methods:**

**Method 1: Using NBAR (Application Recognition)**

```
! Classify voice using NBAR
class-map match-any VOICE-TRAFFIC
  match protocol rtp audio
  match protocol sip

class-map match-any VIDEO-TRAFFIC
  match protocol webex-meeting
  match protocol zoom

policy-map MARK-TRAFFIC
  class VOICE-TRAFFIC
    set ip dscp ef              ! Mark voice as EF (46)
  class VIDEO-TRAFFIC
    set ip dscp af41            ! Mark video as AF41 (34)

interface GigabitEthernet0/1
  description Access port for user devices
  service-policy input MARK-TRAFFIC
```

**Method 2: Using ACLs**

```
! Define ACL to match VoIP
access-list 100 permit udp any any range 16384 32767
! RTP typically uses UDP 16384-32767

access-list 101 permit tcp any any eq 5060
access-list 101 permit udp any any eq 5060
! SIP signaling on 5060

! Classify based on ACL
class-map VOICE-RTP
  match access-group 100

class-map VOICE-SIG
  match access-group 101

policy-map MARK-VOIP
  class VOICE-RTP
    set ip dscp ef
  class VOICE-SIG
    set ip dscp cs5

interface GigabitEthernet0/1
  service-policy input MARK-VOIP
```

**Method 3: Trusting Existing Markings (Switches)**

```
! On Cisco switches - trust DSCP from IP phone
interface GigabitEthernet0/1
  description IP Phone with PC
  switchport mode access
  switchport access vlan 10               ! Data VLAN
  switchport voice vlan 20                ! Voice VLAN
  mls qos trust device cisco-phone        ! Trust phone, remark PC
  spanning-tree portfast
```

**Trust Options:**

```
! Trust CoS (from 802.1Q tag)
mls qos trust cos

! Trust DSCP (from IP header) - PREFERRED
mls qos trust dscp

! Trust IP Precedence (legacy)
mls qos trust ip-precedence

! Trust CoS for voice VLAN, DSCP for data VLAN
mls qos trust device cisco-phone

! Don't trust - remark everything
! (no trust command)
```

**Complete Edge Switch Example:**

```
! ─────────────────────────────────────
! Global QoS Configuration
! ─────────────────────────────────────
mls qos
! Enable QoS globally on switch

mls qos map cos-dscp 0 8 16 24 32 46 48 56
! Map CoS to DSCP (default is fine, shown for reference)

! ─────────────────────────────────────
! Access Port to IP Phone
! ─────────────────────────────────────
interface range GigabitEthernet0/1 - 24
  description Access ports for IP phones + PCs
  switchport mode access
  switchport access vlan 10               ! Data VLAN
  switchport voice vlan 20                ! Voice VLAN
  mls qos trust device cisco-phone        ! Trust phone only
  spanning-tree portfast
  spanning-tree bpduguard enable

! ─────────────────────────────────────
! Access Port to Untrusted Devices
! ─────────────────────────────────────
interface range GigabitEthernet0/25 - 48
  description Untrusted devices (guests, printers, etc.)
  switchport mode access
  switchport access vlan 30               ! Guest VLAN
  ! No trust - switch will remark based on policy

! ─────────────────────────────────────
! Trunk to Distribution Switch
! ─────────────────────────────────────
interface GigabitEthernet0/49
  description Trunk to distribution switch
  switchport mode trunk
  switchport trunk allowed vlan 10,20,30
  mls qos trust dscp                      ! Trust DSCP on trunk
```

**Marking on Routers - Example:**

```
! Classify traffic and mark DSCP
class-map match-any BUSINESS-CRITICAL
  match access-group 110

class-map match-any BULK-DATA
  match protocol ftp
  match protocol http url "*.zip"

access-list 110 permit ip 10.1.0.0 0.0.255.255 any
! Business subnet

policy-map MARK-EDGE
  class BUSINESS-CRITICAL
    set ip dscp af31                      ! Mission-critical
  class BULK-DATA
    set ip dscp af11                      ! Bulk
  class class-default
    set ip dscp 0                         ! Best effort

interface GigabitEthernet0/0
  description LAN-facing interface
  ip address 10.1.1.1 255.255.255.0
  service-policy input MARK-EDGE
```

**Hierarchical Marking + Queuing:**

Sometimes you mark inbound and queue outbound:

```
! Inbound: Mark traffic
interface GigabitEthernet0/0
  service-policy input MARK-TRAFFIC

! Outbound: Queue based on markings
interface GigabitEthernet0/1
  service-policy output WAN-QoS
```

**CoS to DSCP Mapping (Switches):**

When traffic arrives with CoS but needs DSCP for routing:

```
! Default CoS-to-DSCP mapping
mls qos map cos-dscp 0 8 16 24 32 46 48 56
!                   ↑  ↑  ↑  ↑  ↑  ↑  ↑  ↑
! CoS values:        0  1  2  3  4  5  6  7
! DSCP values:       0  8 16 24 32 46 48 56

! Custom mapping
mls qos map cos-dscp 0 10 18 26 34 46 48 56
!                    ↑  ↑  ↑  ↑  ↑
! Maps CoS 1→DSCP 10 (AF11), CoS 2→DSCP 18 (AF21), etc.
```

**Best Practices:**

1. **Mark at ingress (access layer):** Don't wait until WAN
2. **Use DSCP, not CoS:** DSCP survives routing
3. **Trust known devices:** IP phones, video endpoints
4. **Remark untrusted devices:** PCs, guest devices
5. **Use NBAR when possible:** More accurate than ACLs
6. **Document marking scheme:** What applications get what DSCP

**Exam Tips:**

*"Where should traffic be classified and marked?"*
Answer: **At the network edge / access layer** (as close to source as possible)

*"What command trusts DSCP on a Cisco switch?"*
Answer: `mls qos trust dscp`

*"How do you mark traffic as EF in a policy-map?"*
Answer: `set ip dscp ef` (or `set ip dscp 46`)

---

## Slide 19: Verification Commands

### Visual Description
Code blocks showing essential QoS verification commands with explanations of key output to check.

### Speaker Notes

**Verifying QoS Configuration and Operation (6 minutes):**

Configuration is only half the battle. You must verify QoS is actually working.

**Essential Show Commands:**

**1. Show Applied Policy and Statistics**

```
Router# show policy-map interface GigabitEthernet0/0
```

**Output:**
```
GigabitEthernet0/0

  Service-policy output: WAN-QoS

    Class-map: VOICE (match-any)
      0 packets, 0 bytes
      5 minute offered rate 0000 bps, drop rate 0000 bps
      Match: ip dscp ef (46)
      Priority: 256 Kbps, burst bytes 6400, b/w exceed drops: 0

    Class-map: VIDEO (match-any)
      150 packets, 225000 bytes
      5 minute offered rate 15000 bps, drop rate 0000 bps
      Match: ip dscp af41 (34)
      Queueing
        queue limit 64 packets
        (queue depth/total drops/no-buffer drops) 0/0/0
        (pkts output/bytes output) 150/225000
      bandwidth 512 Kbps
```

**What to check:**
- **Packets/bytes:** Is traffic matching the class?
- **Drop rate:** Are packets being dropped?
- **Queue depth:** How full are queues?
- **Bandwidth:** Is class getting its allocation?

**If no packets match:** Classification problem (ACL, NBAR, DSCP not set)
**If drops are high:** Congestion, may need more bandwidth
**If queue depth = max:** Severe congestion

**2. Show Class-Map Configuration**

```
Router# show class-map
```

**Output:**
```
Class Map match-any VOICE (id 1)
   Match ip dscp ef (46)

Class Map match-any VIDEO (id 2)
   Match ip dscp af41 (34)
   Match ip dscp af42 (36)
```

**What to check:**
- Correct match conditions?
- Match-any vs match-all?

**3. Show Policy-Map Configuration**

```
Router# show policy-map WAN-QoS
```

**Output:**
```
Policy Map WAN-QoS
  Class VOICE
    Priority: 256 Kbps, burst bytes 6400, b/w exceed drops: 0
  Class VIDEO
    Bandwidth: 512 Kbps Max Threshold: 64 (packets)
  Class class-default
    Flow Based Fair Queueing
```

**What to check:**
- Correct bandwidth allocations?
- Priority set for voice?
- WRED configured where needed?

**4. Switch QoS Verification**

```
Switch# show mls qos

QoS is enabled
QoS ip packet dscp rewrite is enabled
```

**Must see:** "QoS is enabled" - if not, QoS isn't working!

```
Switch# show mls qos interface GigabitEthernet0/1

GigabitEthernet0/1
trust state: trust dscp
trust mode: trust dscp
trust enabled flag: ena
COS override: dis
default COS: 0
DSCP Mutation Map: Default DSCP Mutation Map
Trust device: cisco-phone
```

**What to check:**
- Trust state correct?
- Trust device showing cisco-phone if applicable?

**5. QoS Queue Statistics (Switches)**

```
Switch# show mls qos queue-set

Queueset: 1
Queue  :      1      2      3      4
--------------------------------------
buffers:     25     25     25     25
threshold1:  100    200    100    100
threshold2:  100    200    100    100
reserved:    50     50     50     50
maximum:     400    400    400    400
```

**6. Policing/Shaping Statistics**

```
Router# show policy-map interface Serial0/0/0
```

**Look for:**
```
Class-map: class-default (match-any)
  Shape average 10000000 bps
    Target/Average   Byte   Sustain   Excess    Interval  Increment
    Rate             Limit  bits/int  bits/int  (ms)      (bytes)
    10000000/10000000 18750  75000     75000     7         9375

  Queueing
    (queue depth/total drops/no-buffer drops) 5/42/0
```

**What to check:**
- **Shape rate:** Matches configured value?
- **Queue depth:** How full is shaping queue?
- **Total drops:** Are drops occurring? (Shaping queue full)

**7. WRED Statistics**

```
Router# show policy-map interface GigabitEthernet0/0
```

**Look for:**
```
Class-map: CRITICAL-DATA
  Random Detect
    Exponential weight: 9

    dscp    Transmitted  Random drop   Tail drop   Minimum   Maximum   Mark
            pkts/bytes   pkts/bytes   pkts/bytes   thresh    thresh   prob

    af31    1000/1500000    5/7500       0/0          25        40      1/10
    af33     500/750000    50/75000      0/0          10        40      1/10
```

**What to check:**
- **Random drops:** WRED is working
- **Tail drops:** Should be zero (if not, increase queue size)
- **AF33 drops > AF31 drops:** Correct behavior (higher drop precedence dropped more)

**Troubleshooting Scenarios:**

**Problem: Voice quality is poor**

**Check:**
```
show policy-map interface Serial0/0/0 | include VOICE
```

**Look for:**
- Is VOICE class matching packets?
- Are there drops in the priority queue?
- Is priority configured (not just bandwidth)?

**Problem: QoS not working on switch**

**Check:**
```
show mls qos        ! QoS enabled globally?
show cdp neighbors  ! Is IP phone detected?
show mls qos interface Gi0/1  ! Trust state correct?
```

**Problem: Traffic not matching classes**

**Check:**
```
show access-lists 100     ! ACL hitting?
show class-map VOICE      ! Class defined correctly?
show policy-map interface ! Any packets matching?
```

**Use Wireshark to verify DSCP:**
1. Capture traffic
2. Look at IP header, ToS field
3. Verify DSCP value matches expectation

**Debugging (Use Sparingly):**

```
debug policy-map
! Shows real-time QoS decisions (CPU intensive!)

debug qos set
! Shows DSCP/CoS marking decisions
```

**Best Practice Verification Workflow:**

1. **Configuration:**
   ```
   show run | section class-map
   show run | section policy-map
   show run interface Gi0/0 | include service-policy
   ```

2. **Operation:**
   ```
   show policy-map interface Gi0/0
   ```

3. **Packet Capture:**
   - Use Wireshark to verify DSCP markings
   - Confirm traffic is classified correctly

4. **Performance:**
   - Monitor drops, queue depth
   - Adjust bandwidth allocations as needed

**Exam Tips:**

*"What command shows QoS statistics for an interface?"*
Answer: `show policy-map interface [name]`

*"How do you verify QoS is enabled on a switch?"*
Answer: `show mls qos` (should show "QoS is enabled")

*"What indicates QoS is working?"*
Answer: **Packets matching classes, appropriate drops during congestion, priority queue servicing voice first**

---

## Slide 20: Summary

### Visual Description
Four summary boxes covering Why QoS, Classification & Marking, Queuing, and Key Differences (policing vs shaping, trust boundaries).

### Speaker Notes

**Summary and Review (8 minutes):**

Let's tie everything together and reinforce key exam concepts.

**Why QoS is Essential:**

**The Core Problem:**
- Different applications have different needs
- Voice: Low latency (<150ms), low jitter (<30ms), low loss (<1%)
- Limited bandwidth must be managed intelligently
- Without QoS, all traffic treated equally = voice suffers

**The Solution:**
- Classify traffic into classes
- Mark packets with DSCP/CoS
- Queue and prioritize based on markings
- Shape or police to enforce rates

**Classification and Marking:**

**DSCP (Layer 3):**
- 6-bit field in IP header
- Values 0-63
- **Key values:**
  - **EF (46):** Voice
  - **AF41 (34):** Video
  - **AF31 (26):** Critical data
  - **AF21 (18):** Transactional data
  - **AF11 (10):** Bulk data
  - **DF/CS0 (0):** Best effort

**CoS (Layer 2):**
- 3-bit field in 802.1Q tag
- Values 0-7
- **Limitation:** Trunk links only! (no tag on access ports)
- CoS 5 = Voice, maps to DSCP 46

**AF Classes:**
- Format: AFxy
  - X = Class (4 highest, 1 lowest)
  - Y = Drop precedence (1 low drop, 3 high drop)
- Formula: DSCP = (8×X) + (2×Y)

**Queuing Mechanisms:**

**FIFO:**
- First In, First Out
- No prioritization
- Not suitable for voice/video

**LLQ (Recommended):**
- Low Latency Queuing
- Strict priority queue for voice (with policing)
- Guaranteed bandwidth for data classes
- Prevents starvation
- **This is what you should use!**

**WRED:**
- Weighted Random Early Detection
- Prevents TCP global synchronization
- Drops packets before queue fills
- Different drop rates per DSCP
- Use on data classes, NOT voice/video

**Traffic Conditioning:**

**Policing:**
- Drops or remarks excess traffic
- No buffering
- Inbound or outbound
- Used at provider ingress
- Causes packet loss

**Shaping:**
- Buffers excess traffic
- Adds latency
- Outbound only
- Used at customer egress
- Prevents loss (better TCP performance)

**Trust Boundaries:**

**Where to Trust:**
- **Access layer:** Trust boundary
- **IP phones/video endpoints:** Trusted devices
- **PCs/guests:** Untrusted (remark traffic)
- **Distribution/core:** Trust existing markings

**Configuration:**
- `mls qos trust dscp` on switches
- `mls qos trust device cisco-phone` for IP phones

**MQC (Modular QoS CLI):**

**Three Steps:**
1. **class-map:** Define traffic classes
2. **policy-map:** Define actions
3. **service-policy:** Apply to interface

**Example:**
```
class-map VOICE
  match ip dscp ef

policy-map WAN-QoS
  class VOICE
    priority 256

interface Serial0/0/0
  service-policy output WAN-QoS
```

**Exam Focus - Key Facts to Memorize:**

**DSCP Values:**
- EF = 46 (voice)
- AF41 = 34 (video)
- AF31 = 26 (critical)
- DF/CS0 = 0 (best effort)

**AF Formula:**
- DSCP = (8 × Class) + (2 × Drop)

**CoS:**
- 3 bits, values 0-7
- **Trunk links only!**
- CoS 5 for voice

**Latency Requirements:**
- Voice: <150ms one-way
- Jitter: <30ms for voice
- Packet loss: <1% for voice

**Queuing:**
- LLQ for voice + data
- FIFO = no QoS
- WRED prevents TCP global sync

**Policing vs Shaping:**
- Policing: drops, inbound/outbound
- Shaping: buffers, outbound only

**Trust Boundary:**
- Set at access layer
- Trust phones, not PCs

**Common Exam Question Patterns:**

*"What DSCP value for voice?"*
→ **EF (46)**

*"What's the difference between policing and shaping?"*
→ **Policing drops excess, shaping buffers it**

*"Why set trust boundary at access layer?"*
→ **To prevent users from marking traffic incorrectly**

*"What queuing for voice + data?"*
→ **LLQ (Low Latency Queuing)**

*"Can CoS be used on access ports?"*
→ **No - CoS only exists in 802.1Q tags (trunk links)**

*"What does WRED prevent?"*
→ **TCP global synchronization**

*"Where can policing be applied?"*
→ **Inbound or outbound** (shaping is outbound only)

**Real-World Takeaways:**

1. **Always implement QoS for voice/video networks**
2. **Use LLQ with priority queue for voice**
3. **Mark at the edge, trust in the core**
4. **Shape at customer edge to match provider policing**
5. **Monitor QoS stats and adjust as needed**

**Lab Practice Recommendations:**

After this lecture, students should:
1. Configure LLQ on a router WAN interface
2. Verify with `show policy-map interface`
3. Use Wireshark to see DSCP markings
4. Test VoIP quality with and without QoS
5. Configure switch to trust IP phone DSCP

**Final Thoughts:**

QoS is not optional in modern networks. With VoIP, video conferencing, and cloud applications, you MUST implement QoS to ensure good user experience. The concepts we covered today form the foundation of network quality management.

Master DSCP values, understand LLQ, and know when to police vs shape. These are practical skills you'll use throughout your networking career.

**Questions to Ask Students:**

1. "Can anyone explain why voice needs lower latency than data?"
2. "What happens if we don't set a trust boundary?"
3. "Why would you shape traffic on your router when the ISP is going to police it anyway?"
4. "What's the risk of using strict priority queuing without policing?"

**Next Steps:**

1. Review DSCP value chart (use visualizer)
2. Practice MQC configuration
3. Complete lab exercises
4. Take quiz to test understanding

Thank you! Any questions?

---

## Appendix: Quick Reference Tables

### DSCP Quick Reference

| Name | Decimal | Binary | Use | CoS |
|------|---------|--------|-----|-----|
| EF | 46 | 101110 | Voice | 5 |
| CS5 | 40 | 101000 | Signaling | 5 |
| AF41 | 34 | 100010 | Video | 4 |
| AF31 | 26 | 011010 | Critical Data | 3 |
| AF21 | 18 | 010010 | Transactional | 2 |
| AF11 | 10 | 001010 | Bulk | 1 |
| DF/CS0 | 0 | 000000 | Best Effort | 0 |

### AF Class Matrix

|  | Low Drop (1) | Med Drop (2) | High Drop (3) |
|---|-------------|-------------|---------------|
| **Class 4** | AF41 (34) | AF42 (36) | AF43 (38) |
| **Class 3** | AF31 (26) | AF32 (28) | AF33 (30) |
| **Class 2** | AF21 (18) | AF22 (20) | AF23 (22) |
| **Class 1** | AF11 (10) | AF12 (12) | AF13 (14) |

### CoS Values

| CoS | Name | Use | Maps to DSCP |
|-----|------|-----|--------------|
| 7 | Network Control | Routing protocols | CS7 (56) |
| 6 | Internetwork Control | Management | CS6 (48) |
| 5 | **Voice** | **VoIP** | **EF (46)** |
| 4 | Video | Video conferencing | AF41 (34) |
| 3 | Critical Apps | Mission-critical | AF31 (26) |
| 2 | Excellent Effort | Important data | AF21 (18) |
| 1 | Background | Bulk | AF11 (10) |
| 0 | Best Effort | Default | DF (0) |

### Essential Commands

**Configuration:**
```bash
# Define class
class-map match-any VOICE
  match ip dscp ef

# Define policy
policy-map WAN-QoS
  class VOICE
    priority 256
  class class-default
    fair-queue

# Apply to interface
interface Serial0/0/0
  service-policy output WAN-QoS
```

**Verification:**
```bash
# Show applied policy and stats
show policy-map interface Serial0/0/0

# Show class/policy config
show class-map
show policy-map

# Switch QoS
show mls qos
show mls qos interface Gi0/1
```

**Switch Trust:**
```bash
# Trust DSCP
mls qos trust dscp

# Trust CoS
mls qos trust cos

# Trust IP phone
mls qos trust device cisco-phone
```

---

*End of Speaker Notes*
