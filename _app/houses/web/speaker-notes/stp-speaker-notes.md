# STP Presentation - Speaker Notes

**Prepared by:** EQ6
**Subject:** Network Essentials - Spanning Tree Protocol
**Presentation File:** stp-presentation.html

---

## Overview

STP is one of the most critical protocols for daily network operations. Unlike OSPF which students may not encounter immediately, **every switched network uses STP**. Understanding STP prevents catastrophic network outages caused by loops.

**Key Teaching Point:** STP is not optional - it runs by default on all Cisco switches and prevents broadcast storms that can bring down entire networks in seconds.

---

## Slide 1: Title Slide

### Speaker Notes:

Welcome to our presentation on Spanning Tree Protocol - one of the most important protocols you'll work with as a network engineer.

**Opening Hook:**
"Has anyone ever accidentally created a loop by plugging both ends of a cable into the same switch? Or connected two switches together twice? That's what STP prevents - and when it's not working, your entire network can go down in seconds."

**Key Points:**
- STP runs on Layer 2 (switches, not routers)
- It's automatic and enabled by default
- Critical for network redundancy
- Understanding STP troubleshooting is essential for help desk and network admin roles

---

## Slide 2: History & The Problem

### Speaker Notes:

**Radia Perlman - "Mother of the Internet":**
- Computer scientist at DEC (Digital Equipment Corporation)
- Invented STP algorithm in 1985
- She wrote a poem about it: "I think that I shall never see, A graph more lovely than a tree..."
- Still active in networking research today

**The Loop Problem Demonstration:**

**Scenario:** Three switches connected in a triangle
- SW1 connects to SW2
- SW2 connects to SW3  
- SW3 connects to SW1

**What happens without STP:**

1. PC1 sends broadcast (ARP request)
2. SW1 forwards to SW2 and SW3
3. SW2 forwards to SW3 and back to SW1
4. SW3 forwards to SW1 and back to SW2
5. **Loop begins** - frame circulates forever
6. More broadcasts join the loop
7. Within seconds: **Broadcast storm**

**Physical symptoms:**
- Switch fans become LOUD (CPU hits 100%)
- Network becomes unusable
- LEDs flashing rapidly
- May need to physically unplug cables to stop

**Lab Demo Suggestion:**
- In Packet Tracer, create triangle of 3 switches
- Don't configure anything (STP runs by default)
- Add PC, send ping
- Show students the `show spanning-tree` output
- **Disable STP** on all switches (for demo only!)
- Send ping again - watch simulation mode show endless loop

**Warning to emphasize:**
"In production, a broadcast storm can take down your entire network - affecting hundreds or thousands of users - in less than 30 seconds. I've seen this happen when someone daisy-chained switches incorrectly."

---

## Slide 3: What is STP?

### Speaker Notes:

**Layer 2 Protocol:**
- Operates at Data Link layer
- Works with MAC addresses and switch ports
- Routers don't participate in STP (except when they have switch modules)

**Creates Loop-Free Logical Topology:**
- Physical topology: All links exist and are connected
- Logical topology: STP blocks certain ports to prevent loops
- Blocked links serve as backups (failover when active link fails)

**BPDUs Explained:**
- "Bridge Protocol Data Unit" (switches used to be called bridges)
- Special frames sent between switches
- Destination MAC: 01:80:C2:00:00:00 (multicast - all switches receive)
- Contains: Who is Root, cost to Root, sender ID
- Sent every 2 seconds by default

**Timers - Memorize These:**
- **Hello Time: 2 seconds** - How often Root sends BPDUs
- **Max Age: 20 seconds** - How long to wait before declaring BPDU sender dead
- **Forward Delay: 15 seconds** - Time spent in Listening and Learning states

**Total convergence time:** 
- Listening (15s) + Learning (15s) = 30 seconds minimum
- Plus Max Age (20s) if link fails = 50 seconds maximum
- **This is why RSTP was invented!**

**Cisco Default:**
- PVST+ (Per-VLAN Spanning Tree Plus)
- Separate STP instance for each VLAN
- Allows load balancing (VLAN 10 uses SW1 as Root, VLAN 20 uses SW2)

**Cannot be globally disabled:**
- You can disable STP per-VLAN: `no spanning-tree vlan 10`
- **But don't do this unless you absolutely know what you're doing!**
- Disabling STP = accepting risk of broadcast storms

---

## Slide 4: STP Election Process

### Speaker Notes:

STP election happens in **three steps** - always in this order.

**Step 1: Elect Root Bridge**

**Analogy:** Think of Root Bridge as the "sun" - everything revolves around it.

**Election criteria:**
1. Lowest Bridge ID wins
2. Bridge ID = Priority + MAC Address

**Example:**
- SW1: Priority 32768, MAC 0000.0c12.3456
- SW2: Priority 32768, MAC 0000.0c12.1234 ← **Wins** (lower MAC)
- SW3: Priority 24576, MAC 0000.0c99.9999 ← **Actually wins!** (lower priority)

**Priority values:**
- Must be multiple of 4096
- Range: 0 to 61440
- Default: 32768 (for VLAN 1)
- PVST+ adds VLAN ID: 32768 + VLAN number

**Common mistake:**
Students try to set priority to random numbers like 100 or 500.
**Wrong!** Must be: 0, 4096, 8192, 12288, 16384, 20480, 24576, 28672, 32768, etc.

**Step 2: Elect Root Ports**

**On each non-root switch:**
- Identify port with lowest cost to Root Bridge
- That port becomes Root Port (RP)
- **One Root Port per switch** (except Root Bridge has none)

**Cost calculation:**
- Sum of all port costs from switch to Root
- Lower cost = better path

**Example:**
SW2 has two paths to Root (SW1):
- Path A: Direct link (cost 4) ← **Root Port**
- Path B: Through SW3 (cost 4+4=8)

**Step 3: Elect Designated Ports**

**On each network segment:**
- Identify which switch has lowest cost to Root
- That switch's port becomes Designated Port (DP)
- **One DP per segment**

**All Root Bridge ports are automatically Designated Ports**

**All other ports:** 
- Become Blocked (802.1D) or Alternate (RSTP)
- These are the backup ports

**Final Result:**
- Root Port: Best path to Root (one per non-root switch)
- Designated Port: Forwarding port for each segment
- Blocked/Alternate Port: Backup (prevents loop)

**Whiteboard Activity:**
- Draw triangle of 3 switches
- Have students identify Root Bridge
- Mark Root Ports on SW2 and SW3
- Mark Designated Ports
- Identify which port gets blocked

---

## Slide 5: Bridge ID and Priority

### Speaker Notes:

**Bridge ID Structure - Important for Exams:**

**Original 802.1D (64 bits total):**
- Priority: 16 bits (0-65535)
- MAC Address: 48 bits

**Modern PVST+ (64 bits total):**
- Priority: 4 bits (limited to multiples of 4096)
- Extended System ID: 12 bits (VLAN ID, 0-4095)
- MAC Address: 48 bits

**Why the change?**
- Originally switches ran one STP instance
- PVST+ runs one instance per VLAN (up to 4096 VLANs)
- Extended System ID holds VLAN number
- Reduced priority bits means only multiples of 4096 allowed

**Example Bridge ID for VLAN 10:**
- Priority configured: 32768
- Extended System ID (VLAN): 10
- Actual Priority: 32768 + 10 = 32778
- Plus MAC address

**Command Examples:**

```cisco
! View current Bridge ID
SW1# show spanning-tree vlan 1

VLAN0001
  Spanning tree enabled protocol ieee
  Root ID    Priority    32769   ← 32768 + 1 (VLAN 1)
             Address     0019.e86a.6f80
  Bridge ID  Priority    32769 
             Address     001c.0e88.4c00  ← This switch's MAC
```

**Setting Priority - Three Methods:**

**Method 1: root primary (recommended for students)**
```cisco
SW1(config)# spanning-tree vlan 1 root primary
```
- Sets priority to 24576
- Or 4096 lower than current Root (if current Root < 24576)

**Method 2: root secondary**
```cisco
SW2(config)# spanning-tree vlan 1 root secondary  
```
- Sets priority to 28672
- Becomes Root if primary fails

**Method 3: Manual priority (gives precise control)**
```cisco
SW1(config)# spanning-tree vlan 1 priority 4096
```

**Best Practice:**
- Always manually configure Root Bridge
- Don't let random switch with lowest MAC become Root
- Document which switch is Root and why

---

## Slide 6: Port Cost

### Speaker Notes:

Port cost determines best path to Root Bridge. Lower cost = better path.

**Cost Standards:**

**802.1D (Old - Cisco Default):**
- Based on 1990s link speeds
- Problem: Doesn't scale beyond Gigabit

**802.1w/802.1t (New):**
- Scales to 100+ Gbps
- Better for modern networks

**Why Cisco uses old costs by default:**
- Backward compatibility
- Many networks still use these values

**Changing Cost Method:**
```cisco
Switch(config)# spanning-tree pathcost method long
```

**Cost Calculation Example:**

**Topology:**
```
        [SW1 - Root]
        /          \
    Cost 4       Cost 4
      /              \
  [SW2]----------[SW3]
       Cost 4
```

**SW3's path options to Root:**
- Path A: Direct to SW1 (cost 4) ← **Best, becomes Root Port**
- Path B: SW3→SW2→SW1 (cost 4+4=8)

**Manually Adjusting Cost:**

**Why adjust cost?**
- Traffic engineering (prefer certain paths)
- Load balancing across VLANs
- Work around cost calculation issues

**How:**
```cisco
SW2(config)# interface gig0/1
SW2(config-if)# spanning-tree vlan 1 cost 1
```

**Real-World Example:**
- Two uplinks from access switch to core
- Both GigE (normally same cost)
- Manually set one to cost 10, other to cost 20
- Different VLANs prefer different uplinks
- Achieves load balancing

**Common Exam Question:**
"Switch has two paths to Root: Path A cost 8, Path B cost 12. Which port becomes Root Port?"
**Answer:** Port on Path A (lower cost)

---

## Slide 7: Port States (802.1D)

### Speaker Notes:

Understanding port states is critical for troubleshooting.

**The 5 Port States:**

**1. Disabled**
- Administratively down (`shutdown`)
- Or physically unplugged
- Does not participate in STP

**2. Blocking**
- Port is UP but not forwarding
- Receives BPDUs (listens for topology changes)
- Does NOT send BPDUs
- Does NOT forward traffic
- Does NOT learn MAC addresses
- **Duration:** Up to 20 seconds (Max Age)

**3. Listening**
- Port transitioning to Forwarding
- Sends and receives BPDUs
- Does NOT forward traffic
- Does NOT learn MAC addresses
- **Duration:** 15 seconds (Forward Delay)
- **Purpose:** Determine port role (Root, Designated, Blocked)

**4. Learning**
- Continues transition to Forwarding
- Sends and receives BPDUs
- Does NOT forward traffic yet
- **DOES learn MAC addresses** (builds MAC table)
- **Duration:** 15 seconds (Forward Delay)
- **Purpose:** Populate MAC table before forwarding

**5. Forwarding**
- **Normal operating state**
- Sends and receives BPDUs
- Forwards traffic
- Learns MAC addresses
- This is what you want for active ports

**State Transition Timeline:**

**Scenario: New link comes up**
1. **Blocking (20s):** Waiting for Max Age
2. **Listening (15s):** Determining role
3. **Learning (15s):** Building MAC table
4. **Forwarding:** Active!

**Total: 50 seconds** in worst case

**Why so slow?**
- Prevent temporary loops during topology changes
- Allow time for BPDUs to propagate
- Ensure all switches agree on topology

**Problem:**
- 50 seconds is too long for modern networks
- Users complain "network is slow after reboot"
- IP phones time out during boot
- This led to creation of PortFast and RSTP

---

## Slide 8: BPDUs

### Speaker Notes:

BPDUs are the "heartbeat" of STP.

**BPDU Contents - What's Inside:**

**Root Bridge Information:**
- Root Bridge ID (who is the Root?)
- Root Path Cost (sender's cost to reach Root)

**Sender Information:**
- Sender Bridge ID (who sent this BPDU?)
- Sender Port ID (which port sent it?)

**Timers:**
- Hello Time (how often to send BPDUs)
- Max Age (when to expire BPDU)
- Forward Delay (time to spend in Listening/Learning)

**Flags:**
- Topology Change (TC) - network topology has changed
- TC Acknowledgment - Root confirms TC notification

**How BPDUs Flow:**

**Initial State (no Root elected):**
1. All switches think they are Root
2. All switches send BPDUs claiming to be Root
3. Switches compare received BPDUs to their own
4. Switch with superior BPDU wins

**Steady State (Root elected):**
1. Root Bridge sends BPDUs every 2 seconds
2. Non-root switches receive, update cost, and forward
3. Blocked ports receive but don't forward
4. If BPDU stops for 20 seconds (Max Age), assume failure

**Superior BPDU:**
A BPDU is "superior" if it has:
1. Lower Root Bridge ID, OR
2. Same Root ID but lower cost, OR
3. Same Root ID and cost but lower Sender Bridge ID, OR
4. Everything same but lower Port ID

**Wireshark Demo Suggestion:**
- Capture traffic on switch port
- Filter for STP/BPDUs: `stp`
- Show students actual BPDU fields
- Point out 2-second intervals

**Common Student Question:**
"What happens if Root Bridge fails?"
**Answer:** After Max Age (20s), switches detect failure, run election, new Root chosen, topology reconverges (another 30-50 seconds).

---

## Slide 9: RSTP (802.1w)

### Speaker Notes:

RSTP was created because 30-50 second convergence is unacceptable in modern networks.

**Key RSTP Improvements:**

**1. Faster Convergence (1-6 seconds vs 30-50)**

How? Proposal/Agreement handshake:
- Instead of passively waiting 30 seconds
- Switches actively negotiate state changes
- Point-to-point links converge almost instantly

**2. New Port Roles:**
- **Root Port:** Same as before (best path to Root)
- **Designated Port:** Same as before  
- **Alternate Port:** Backup path to Root (was "Blocked")
- **Backup Port:** Backup on same segment (rare - hub scenarios)

**3. Simplified Port States (3 vs 5):**
- **Discarding:** Combines Disabled, Blocking, and Listening
- **Learning:** Same as before
- **Forwarding:** Same as before

**4. Edge Ports (PortFast equivalent):**
- Ports connected to end devices
- Transition immediately to Forwarding
- No need to manually configure PortFast

**5. Link Types:**
- **Point-to-Point:** Two switches, fast convergence
- **Shared:** Hub or multiple devices, slower convergence
- **Edge:** End device, immediate forwarding

**Proposal/Agreement Mechanism:**

**Scenario:** New link between SW1 (Root) and SW2

1. SW1 sends Proposal BPDU: "I'm Root, want to form adjacency?"
2. SW2 blocks all non-edge ports (prevents loops)
3. SW2 sends Agreement BPDU: "OK, I've blocked other ports"
4. SW1 immediately transitions port to Forwarding
5. SW2 immediately transitions port to Forwarding
6. **Total time: < 1 second!**

**Backward Compatibility:**
- RSTP switches detect STP neighbors
- Automatically fall back to STP on those ports
- Can have hybrid network (RSTP and STP)

**Cisco Implementation: Rapid-PVST+**
```cisco
Switch(config)# spanning-tree mode rapid-pvst
```

**Best Practice:** Always use Rapid-PVST in modern networks

**Real-World Impact:**
- User plugs in laptop: Network access in 1 second (vs 30 seconds)
- Link fails: Backup link active in 3 seconds (vs 50 seconds)
- Much better user experience!

---

## Slide 10: PortFast & BPDU Guard

### Speaker Notes:

PortFast and BPDU Guard are **best practices for access layer switches**.

**PortFast:**

**Problem it solves:**
- User plugs in PC to switch port
- Port goes through Blocking→Listening→Learning→Forwarding
- 30 seconds before PC gets network access
- PC's DHCP request times out
- User thinks "network is broken"

**PortFast solution:**
- Port immediately transitions to Forwarding
- Bypasses Listening and Learning states
- PC gets network access in < 2 seconds

**CRITICAL WARNING:**
**Never use PortFast on ports connected to switches!**

**Why?**
- PortFast bypasses loop prevention
- If two PortFast ports connect to each other = instant loop
- Broadcast storm in seconds

**Configuration:**
```cisco
! On single access port
Switch(config)# interface gig0/5
Switch(config-if)# switchport mode access
Switch(config-if)# spanning-tree portfast

! Globally on all access ports
Switch(config)# spanning-tree portfast default
```

**When enabled globally:**
- Only affects ports in access mode
- Trunk ports not affected
- Still safe

**BPDU Guard:**

**Problem:**
- Rogue switch connected to PortFast port
- PortFast port forwards immediately
- Could create loop or alter STP topology

**BPDU Guard solution:**
- Monitors PortFast ports for BPDUs
- If BPDU received = port is connected to switch (not PC)
- Immediately shuts down port (err-disabled)
- Prevents loop

**Configuration:**
```cisco
! Per-interface
Switch(config-if)# spanning-tree bpduguard enable

! Globally for all PortFast ports (recommended)
Switch(config)# spanning-tree portfast bpduguard default
```

**Recovery from BPDU Guard:**
```cisco
! Port shows err-disabled
Switch# show interface status err-disabled

! Manually recover
Switch(config)# interface gig0/5
Switch(config-if)# shutdown
Switch(config-if)# no shutdown

! Or enable auto-recovery (after 5 minutes)
Switch(config)# errdisable recovery cause bpduguard
Switch(config)# errdisable recovery interval 300
```

**Real-World Scenario:**
- User brings personal switch from home
- Plugs into office port
- BPDU Guard shuts down port instantly
- Prevents network outage
- Help desk investigates, finds rogue switch

**Lab Exercise:**
1. Configure PortFast on access port
2. Connect PC - observe immediate connectivity
3. Enable BPDU Guard
4. Connect second switch to that port
5. Watch port go err-disabled
6. Practice recovery

---

## Slide 11: Root Guard & Loop Guard

### Speaker Notes:

Root Guard and Loop Guard are **advanced STP protection mechanisms**.

**Root Guard:**

**Problem Scenario:**
- Your network: SW1 is Root (priority 4096)
- Customer/guest network connects
- Their switch has priority 0
- Your SW1 loses Root election!
- Entire topology reconverges
- Customer switch now controls your network

**Root Guard prevents this:**
```cisco
! On ports facing customer/access layer
Switch(config)# interface gig0/10
Switch(config-if)# spanning-tree guard root
```

**Behavior:**
- If superior BPDU received on Root Guard port
- Port goes into "root-inconsistent" state
- Port blocks (doesn't forward traffic)
- Logs error message
- **Automatically recovers** when superior BPDUs stop

**Use cases:**
- Ports connecting to customer equipment
- Ports connecting to access layer
- Any port that should never see Root Bridge

**Not recommended on:**
- Uplink ports (toward core)
- Ports that could legitimately see Root Bridge

**Loop Guard:**

**Problem: Unidirectional Link Failure**

**Scenario:**
- SW1 (Root) connects to SW2
- SW2's port is Blocking (alternate port)
- Receive fiber fails (SW2 stops receiving BPDUs)
- SW2 thinks SW1 is dead
- SW2 transitions port to Forwarding
- But transmit still works = **LOOP!**

**Loop Guard prevents this:**
```cisco
! Globally (recommended)
Switch(config)# spanning-tree loopguard default

! Per-interface
Switch(config-if)# spanning-tree guard loop
```

**Behavior:**
- If BPDUs stop on non-designated port
- Instead of transitioning to Forwarding
- Port goes into "loop-inconsistent" state
- Port blocks traffic
- Recovers when BPDUs resume

**When to use:**
- Point-to-point links between switches
- Fiber links (more prone to unidirectional failures)
- Mission-critical networks

**BPDU Guard vs Root Guard vs Loop Guard:**

| Feature | Where to Use | What it Prevents |
|---------|--------------|------------------|
| BPDU Guard | Access ports (PortFast) | Rogue switches from users |
| Root Guard | Customer/access-facing | Unwanted Root Bridge elections |
| Loop Guard | Switch-to-switch links | Loops from unidirectional failures |

**Best Practice:**
- BPDU Guard: All access ports
- Root Guard: Ports facing access or customers
- Loop Guard: All inter-switch links

---

## Slide 12: Implementation

### Speaker Notes:

Let's walk through configuring STP in a production network.

**Basic Verification:**
```cisco
Switch# show spanning-tree
```

**Key output fields:**
- **Root ID:** Who is Root Bridge for this VLAN?
- **Bridge ID:** This switch's ID
- **Root Port:** Which port leads to Root?
- **Designated Ports:** Which ports are forwarding?
- **Blocked Ports:** Which ports are backup?

**Setting Root Bridge - Best Practice:**

**Scenario:** 3-switch network, want SW1 to be Root

**Option 1: root primary (easiest for students)**
```cisco
SW1(config)# spanning-tree vlan 1 root primary
```
- Cisco automatically sets priority appropriately
- Usually sets to 24576
- If current Root has priority < 24576, sets 4096 lower

**Option 2: root secondary (backup Root)**
```cisco
SW2(config)# spanning-tree vlan 1 root secondary
```
- Sets priority to 28672
- Becomes Root if SW1 fails

**Option 3: Manual priority (most control)**
```cisco
SW1(config)# spanning-tree vlan 1 priority 4096
SW2(config)# spanning-tree vlan 1 priority 8192
```

**Enable RSTP:**
```cisco
Switch(config)# spanning-tree mode rapid-pvst
```
- Apply on ALL switches
- Backward compatible with STP neighbors

**Port Cost Manipulation:**

**Scenario:** Two uplinks, want to prefer one

```cisco
Switch(config)# interface gig0/1
Switch(config-if)# spanning-tree vlan 1 cost 10

Switch(config)# interface gig0/2
Switch(config-if)# spanning-tree vlan 1 cost 20
```

**Port Priority (rarely used):**
```cisco
Switch(config-if)# spanning-tree vlan 1 port-priority 64
```
- Lower priority wins (default 128)
- Only used as tiebreaker if costs are equal

**Complete Access Port Configuration:**
```cisco
interface GigabitEthernet0/5
 description User PC - John Doe
 switchport mode access
 switchport access vlan 10
 spanning-tree portfast
 spanning-tree bpduguard enable
```

**Verification Commands:**
```cisco
! Summary view
Switch# show spanning-tree summary

! Specific VLAN
Switch# show spanning-tree vlan 10

! Which switch is Root?
Switch# show spanning-tree root

! Interface details
Switch# show spanning-tree interface gig0/1 detail
```

---

## Slide 13-15: Troubleshooting

### Speaker Notes:

These slides cover the most common STP issues you'll encounter.

**Issue 1: Wrong Root Bridge**

**How to identify:**
```cisco
Switch# show spanning-tree vlan 1
  Root ID    Priority    32769
             Address     001c.0e88.4c00  ← Check if this is intended Root
```

**Why it's a problem:**
- Suboptimal traffic flows
- Congestion on unexpected links
- Poor network performance

**Root cause:**
- Nobody configured priority
- Random switch with lowest MAC became Root
- Often an access switch, not core switch!

**Solution:**
```cisco
! On intended Root switch (core)
Core-SW1(config)# spanning-tree vlan 1 root primary
```

**Issue 2: Port Stuck in Blocking**

**Symptoms:**
- Port LED orange/amber
- No connectivity through that link
- `show spanning-tree` shows port as "BLK" or "Altn"

**Diagnosis:**
```cisco
Switch# show spanning-tree interface gig0/1

Port 1 (GigabitEthernet0/1) of VLAN0001 is blocking
   Port path cost 4, Port priority 128, Port Identifier 128.1.
   Designated root has priority 32769, address 001c.0e88.4c00
   Designated bridge has priority 32769, address 001d.0f99.8800
   ← Port receiving BPDUs from 001d.0f99.8800
```

**Common causes:**
- This is normal! Blocked port prevents loop
- But if port should be forwarding:
  - Check if Root Guard is enabled (root-inconsistent)
  - Check if better path exists
  - Verify costs on all links

**Issue 3: Err-Disabled Port**

**How to identify:**
```cisco
Switch# show interface status err-disabled

Port      Name               Status       Reason
Gi0/5     User-PC           err-disabled bpduguard

! Or
Switch# show interface gig0/5
GigabitEthernet0/5 is down, line protocol is down (err-disabled)
```

**Cause:** BPDU Guard triggered

**What happened:**
- User connected personal switch to port
- Or network loop created
- BPDU received on PortFast port
- Port automatically disabled

**Recovery:**
```cisco
! First: Remove the offending switch!

! Then recover port
Switch(config)# interface gig0/5
Switch(config-if)# shutdown
Switch(config-if)# no shutdown
```

**Issue 4: Broadcast Storm**

**Symptoms:**
- **Network completely unusable**
- Switch fans extremely loud
- CPU at 100%
- LEDs flashing rapidly
- Excessive collisions
- Timeouts everywhere

**Cause:** STP failed or disabled, loop created

**Emergency response:**
1. **Physically unplug redundant links** (break the loop manually)
2. Identify which switches are involved
3. Check `show spanning-tree` - is STP running?
4. Re-enable STP if disabled
5. Slowly reconnect links one at a time

**Prevention:**
- Never disable STP
- Use BPDU Guard on access ports
- Enable Loop Guard on inter-switch links
- Monitor for topology changes

**Issue 5: Frequent Topology Changes**

**How to identify:**
```cisco
Switch# show spanning-tree summary
Number of topology changes 1523 expected 4-5
```

**Why it's bad:**
- Each TC causes MAC table flush
- Unicast flooding temporarily
- Performance degradation

**Causes:**
- Flapping link (up/down repeatedly)
- PortFast not configured on access ports
- Users unplugging/plugging devices

**Solution:**
- Enable PortFast on all access ports
- Investigate flapping links (bad cable/transceiver)
- Consider BackboneFast/UplinkFast (Cisco proprietary)

---

## Slide 16: Best Practices

### Speaker Notes:

**Manual Root Bridge Configuration:**

**Why it matters:**
"I once saw a network where an old access switch in a closet became Root because it had the lowest MAC address. All traffic in the building was routing through this 100Mbps switch instead of the 10Gbps core switches. Users complained about slow performance for months before we discovered the issue."

**How to design:**
- Core switches should be Root
- Primary Root: Priority 4096 or 8192
- Secondary Root: Priority 12288 or 16384
- Distribution: Priority 20480
- Access: Default (32768)

**Use RSTP Everywhere:**
- Cisco switches support it (rapid-pvst mode)
- 20x faster convergence
- No downside (backward compatible)
- Industry best practice

**PortFast + BPDU Guard on All Access Ports:**

**Standard template:**
```cisco
! Apply to all access switch interfaces
interface range gig0/1 - 24
 switchport mode access
 spanning-tree portfast
 spanning-tree bpduguard enable
```

**Or enable globally:**
```cisco
spanning-tree portfast default
spanning-tree portfast bpduguard default
```

**Don't Disable STP:**

**Horror story:**
"An engineer thought 'we only have one link between switches, no redundancy, so we don't need STP.' He disabled it. Months later, during office move, someone accidentally connected two wall jacks that went to the same switch. Instant broadcast storm. Entire building offline for 2 hours."

**Even with no redundancy:**
- Keep STP enabled
- Protects against accidental loops
- Users make mistakes
- Future-proofs network

**Document STP Design:**
- Which switches are Root for which VLANs
- Priority values used
- Port roles on each link
- Why these design choices were made

**Monitor Topology Changes:**
- Use SNMP traps for TC notifications
- Baseline normal TC rate (usually 0-5 per hour)
- Alert if TCs spike (indicates problem)

---

## Slide 17: Quick Reference

### Speaker Notes:

This slide is the student's cheat sheet.

**Key Facts to Memorize:**

**Timers (CRITICAL for exams):**
- Hello: 2 seconds
- Max Age: 20 seconds  
- Forward Delay: 15 seconds
- Default convergence: 30-50 seconds (STP), 1-6 seconds (RSTP)

**Priority:**
- Must be multiple of 4096
- Range: 0 to 61440
- Default: 32768
- Lower wins

**Port Roles:**
- **Root Port:** Best path to Root (one per non-root switch)
- **Designated Port:** Forwarding port for each segment
- **Alternate/Blocked Port:** Backup to prevent loop
- **Backup Port:** Rare (RSTP only)

**Commands to Know:**
```cisco
show spanning-tree
show spanning-tree vlan 1
show spanning-tree summary
spanning-tree vlan 1 root primary
spanning-tree mode rapid-pvst
spanning-tree portfast
spanning-tree bpduguard enable
```

**Quick Troubleshooting:**
1. Wrong Root? → Set priority on correct switch
2. Port blocked? → Verify if intentional, check costs
3. Err-disabled? → Check for BPDU Guard, remove rogue switch
4. Slow convergence? → Enable rapid-pvst
5. Broadcast storm? → Physically break loop, verify STP enabled

---

## Slide 18: Summary

### Speaker Notes:

**Wrap-up and reinforce key concepts:**

**STP is mandatory knowledge:**
- Every network engineer must understand STP
- It runs automatically on every switch
- Misconfiguration can cause catastrophic outages
- But proper configuration prevents them

**Key takeaways:**
1. **STP prevents Layer 2 loops** (broadcast storms)
2. **Invented by Radia Perlman** in 1985, still used today
3. **Root Bridge** is elected based on lowest Bridge ID
4. **Three port roles:** Root, Designated, Blocked
5. **Five states (STP):** Disabled, Blocking, Listening, Learning, Forwarding
6. **30-50 second convergence (STP)** led to RSTP
7. **RSTP converges in 1-6 seconds** (much better!)
8. **Always use PortFast + BPDU Guard** on access ports
9. **Never disable STP** - even if you think you don't need it
10. **Manually configure Root Bridge** - don't leave to chance

**Next steps:**
1. Practice in Packet Tracer - create redundant topology
2. Observe Root election with different priorities
3. Test PortFast vs normal STP timings
4. Intentionally create loop (disable STP) and observe broadcast storm
5. Enable BPDU Guard and test with rogue switch

**Real-world application:**
- Every switch deployment requires STP planning
- Access layer: PortFast + BPDU Guard
- Distribution/core: RSTP, manual Root configuration
- Document and monitor

**Questions for discussion:**
1. "Why doesn't Ethernet have TTL like IP to prevent loops?"
2. "Could we just disable redundant links instead of using STP?"
3. "When would you use Loop Guard vs BPDU Guard?"

**Thank you! Practice these concepts hands-on - STP makes much more sense when you see it in action.**

---

**End of Speaker Notes**
