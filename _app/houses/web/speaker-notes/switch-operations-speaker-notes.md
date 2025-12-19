# Switch Operations & Advanced Features - Speaker Notes

**Presentation:** switch-operations-presentation.html
**Slides:** 20
**Duration:** 60-75 minutes
**Certification Coverage:** Network+ N10-008 (2.1, 2.3), CCNA 200-301 (2.1, 2.4)

---

## Slide 1: Title Slide

### Key Points
- This presentation focuses on HOW switches work internally
- Complements existing VLAN and STP presentations
- Critical for understanding network troubleshooting

### Instructor Notes
- **Opening Hook:** "A switch makes millions of forwarding decisions per second. How does it know where to send each frame?"
- Ask students: "What happens when you plug a new device into a switch port?"
- Emphasize that understanding switch operations helps diagnose real-world problems

### Exam Relevance
- Network+ 2.1: Device features and placement
- Network+ 2.3: Given a scenario, configure and deploy common Ethernet switching features
- Expect questions on MAC learning, switching methods, and port security

---

## Slide 2: Three Core Functions of a Switch

### Key Points
- Every switch performs these automatically
- This is what differentiates switches from hubs
- Understanding these explains switch behavior

### Teaching Focus
Walk through each function with analogies:

1. **Address Learning:** "Like a receptionist learning who sits at each desk by watching who picks up mail"
2. **Forwarding Decisions:** "Once the receptionist knows where everyone sits, they can deliver mail directly instead of announcing it to everyone"
3. **Loop Prevention:** "What happens if two hallways connect the same offices? People could walk in circles forever. STP closes one hallway."

### Common Misconception
"Switches use IP addresses" - NO! Switches at Layer 2 use MAC addresses. IP is Layer 3 (routers).

---

## Slide 3: MAC Address Learning Process

### Key Points
- Switches learn from SOURCE MAC address
- Table built dynamically as traffic flows
- Entries have aging timers

### Teaching Focus: Step-by-Step
1. Host A sends frame to Host B
2. Switch reads SOURCE MAC (Host A's MAC)
3. Switch records "Host A is on port Fa0/1"
4. Switch looks up DESTINATION MAC (Host B)
5. If known: forward to specific port
6. If unknown: flood to all ports

### Demo Idea
```
! Clear the MAC table
Switch# clear mac address-table dynamic

! Ping from one host to another
! Watch the table populate
Switch# show mac address-table

! Discuss what you see
```

### Exam Tip
"SOURCE MAC = learning. DESTINATION MAC = forwarding. Know this backward and forward!"

---

## Slide 4: Switch Forwarding Decisions

### Key Points
- Forward, Flood, or Filter
- Unknown unicast floods are NORMAL
- Broadcasts always flood

### Teaching Focus: Three Actions

**Forward:** "I know exactly where this device is, sending directly"
**Flood:** "I don't know where this is, so I'll send it everywhere and learn from the response"
**Filter:** "This frame came from the same port the destination is on - no need to send it back"

### Real-World Scenario
"Your helpdesk gets a call: 'The network is slow!' You check the switch and see tons of unknown unicast floods. What could cause this?"
- CAM table overflow attack
- Loop causing MAC table churn
- Many new devices joining network

### Discussion Question
"Why don't switches forward broadcasts to a single port like they do unicasts?"
Answer: Broadcasts are meant for EVERYONE on the segment

---

## Slide 5: Switching Methods

### Key Points
- Three methods determine when switch forwards frame
- Trade-off between speed and error checking
- Store-and-forward is default

### Teaching Focus: Method Comparison

**Store-and-Forward:**
- "The careful librarian who reads the whole book before shelving it"
- Catches all errors
- Small delay for CRC check

**Cut-Through:**
- "The speed reader who just looks at the title and passes it on"
- Fastest possible
- Used in high-frequency trading where microseconds matter

**Fragment-Free:**
- "Reads just the first chapter to make sure it's not torn"
- 64 bytes catches collision damage
- Good compromise

### Why 64 Bytes?
"The minimum Ethernet frame is 64 bytes. Anything smaller is a 'runt' - almost certainly a collision fragment. By reading 64 bytes, we catch the most common transmission errors."

---

## Slide 6: Switching Methods - Detailed Comparison

### Key Points
- Detailed technical comparison
- When to use each method
- Default behavior on enterprise switches

### Teaching Focus: Decision Matrix
- "If someone asks which switching method to use, what questions do you ask?"
  - How critical is latency? (Low latency = cut-through)
  - Can you tolerate errors? (No = store-and-forward)
  - What's the network quality? (Lots of errors = store-and-forward)

### Real-World Examples
- **Stock trading floor:** Cut-through (microseconds = millions of dollars)
- **Hospital network:** Store-and-forward (can't afford corrupted patient data)
- **Small office:** Doesn't matter much, use default

---

## Slide 7: CAM Table Management

### Key Points
- CAM = Content Addressable Memory
- Dynamic vs Static entries
- Aging time concept

### Teaching Focus: Table Structure
"The CAM table is like a phone directory - MAC address to port mapping"

| What it stores | Why it matters |
|---------------|----------------|
| MAC address | Identifies the device |
| Port | Where to send traffic |
| VLAN | Keep traffic separated |
| Type | Static never ages, dynamic does |

### CLI Deep Dive
```
! View complete MAC table
show mac address-table

! View specific VLAN
show mac address-table vlan 10

! View specific port
show mac address-table interface fa0/1

! View count
show mac address-table count
```

### Troubleshooting Tip
"If a user's connection is flapping, check if their MAC address is bouncing between ports - could indicate a loop or duplicate MAC"

---

## Slide 8: Port Security Introduction

### Key Points
- Restricts MAC addresses per port
- Protection against various attacks
- Essential for secure environments

### Teaching Focus: Attack Scenarios

**MAC Flooding Attack:**
1. Attacker generates thousands of fake MAC addresses
2. CAM table fills up completely
3. Switch can't learn new MACs
4. All traffic floods everywhere (like a hub!)
5. Attacker can now sniff all traffic

**How Port Security Stops It:**
"With a maximum of 2 MACs per port, the attacker can only register 2 fake MACs before violations occur"

### Real-World Use Cases
- Conference rooms (limit unknown devices)
- Server rooms (only known servers)
- Printers (shouldn't have multiple MACs)
- IP Phones with PC passthrough (exactly 2 MACs)

---

## Slide 9: Port Security Configuration

### Key Points
- Three main settings to configure
- Must be on access port (not trunk)
- Sticky learning for convenience

### Teaching Focus: Configuration Flow

1. **Prerequisite:** Port must be access mode
   ```
   switchport mode access
   ```

2. **Enable port security:**
   ```
   switchport port-security
   ```

3. **Set maximum MACs:**
   ```
   switchport port-security maximum 2
   ```

4. **Choose how MACs are assigned:**
   - Static: Manually configure
   - Dynamic: Learned but not saved
   - Sticky: Learned AND saved to config

5. **Set violation action:**
   - Shutdown (default, most secure)
   - Restrict (logs but keeps working)
   - Protect (silently drops)

### Common Mistake
"Students often forget `switchport mode access` first. Port security only works on access ports!"

---

## Slide 10: Port Security Violation Modes

### Key Points
- Three modes with different behaviors
- Shutdown requires manual recovery
- Know the differences for the exam!

### Teaching Focus: Mode Comparison Table

| Mode | What happens | When to use |
|------|-------------|-------------|
| Shutdown | Port goes err-disabled | Maximum security, critical ports |
| Restrict | Traffic blocked, alert sent | Want visibility without disruption |
| Protect | Traffic silently blocked | Don't want alerts flooding logs |

### Lab Exercise Idea
1. Configure port security with maximum 1
2. Connect a hub with 2 PCs
3. Watch violation occur
4. Try each violation mode
5. Practice recovery procedures

### Recovery Commands
```
! Check err-disabled ports
show interfaces status err-disabled

! Manual recovery
interface fa0/1
  shutdown
  no shutdown

! Automatic recovery (configure once)
errdisable recovery cause psecure-violation
errdisable recovery interval 300
```

---

## Slide 11: Sticky MAC Addresses

### Key Points
- Combines dynamic learning with permanence
- Appears in running-config
- Must save to survive reboot

### Teaching Focus: The "Sticky" Concept
"Imagine a Post-it note that sticks to the config file. The switch learns the MAC dynamically, then writes it down so it remembers after reboot."

### Configuration Example
```
interface fa0/1
  switchport mode access
  switchport port-security
  switchport port-security maximum 2
  switchport port-security mac-address sticky

! After device connects, running-config shows:
interface FastEthernet0/1
  switchport port-security mac-address sticky 0050.56c0.0001
```

### Critical Reminder
"Sticky MACs only go to running-config! If you don't `copy run start`, they're lost on reboot. This catches many people."

---

## Slide 12: Port Security Verification

### Key Points
- Multiple show commands available
- Know what each field means
- Identify violations quickly

### Teaching Focus: Reading the Output
Walk through each line of `show port-security interface`:
- **Port Security:** Enabled or Disabled
- **Port Status:** Secure-up (good), Secure-shutdown (violation!)
- **Violation Mode:** What happens on violation
- **Maximum MAC Addresses:** Limit configured
- **Total MAC Addresses:** How many learned
- **Security Violation Count:** How many times violated

### Troubleshooting Workflow
1. User can't connect: `show interfaces status` - is port err-disabled?
2. If yes: `show port-security interface fa0/x` - what's the violation count?
3. Check: `show port-security address` - what MACs are allowed?
4. Verify device MAC: `show mac address-table interface fa0/x`
5. Resolution: Clear violation or add MAC

---

## Slide 13: Power over Ethernet (PoE)

### Key Points
- Power + data on same cable
- Three main standards
- PSE provides, PD receives

### Teaching Focus: PoE Standards
"Each standard delivers more power for more demanding devices"

| Standard | Power | Common Devices |
|----------|-------|----------------|
| 802.3af | 15.4W | IP phones, basic cameras |
| 802.3at | 25.5W | PTZ cameras, 802.11ac APs |
| 802.3bt | 60-90W | Displays, thin clients, lighting |

### Real-World Benefits
- No electrician needed for new devices
- Centralized power management
- UPS protects network devices
- Easier moves/adds/changes

### Calculation Example
"48-port switch with 370W PoE budget. If every port has an IP phone (6.4W), can we power them all?"
- 48 × 6.4W = 307.2W
- Yes! We have 62.8W to spare

---

## Slide 14: PoE Operation

### Key Points
- Detection process before power delivery
- Classification determines power level
- Monitor with CLI commands

### Teaching Focus: Detection Process
1. **Detection:** Switch sends low voltage, checks for valid PD signature
2. **Classification:** PD tells switch what class it is (how much power needed)
3. **Power-up:** Switch allocates and delivers power
4. **Monitoring:** Switch continuously monitors power draw

### CLI Commands
```
! Overview of all PoE ports
show power inline

! Specific port detail
show power inline fa0/1

! Power budget status
show power inline total
```

### Troubleshooting PoE Issues
- Device not powering? Check cable (must be proper pinout)
- Intermittent power? May be over budget
- Not detected? Could be non-standard device (legacy Cisco)

---

## Slide 15: PoE Considerations

### Key Points
- Power budget planning critical
- Cable quality matters
- Environmental factors

### Teaching Focus: Design Questions
"Before deploying PoE, ask these questions:"

1. **Total power needed?**
   - Count all PDs
   - Add up wattage requirements
   - Leave 20% headroom

2. **Cable infrastructure?**
   - Cat5e minimum for PoE
   - Shorter runs = less loss
   - Check cable quality

3. **Environmental factors?**
   - More power = more heat
   - Ensure adequate cooling
   - UPS sizing for PoE load

### PoE Injector Alternative
"If switch doesn't support PoE, use a midspan injector. It sits between switch and device, adds power to the cable."

Use cases:
- Legacy switches without PoE
- Extending PoE to specific ports only
- Adding PoE to fiber runs (inject at copper conversion)

---

## Slide 16: Port Mirroring / SPAN

### Key Points
- Copies traffic for analysis
- Essential for troubleshooting and security
- Destination port is dedicated to monitoring

### Teaching Focus: Why SPAN?
"In a switched network, your sniffer only sees traffic TO and FROM its port. SPAN lets you see other traffic."

**Without SPAN:** Wireshark on my laptop only sees:
- My traffic
- Broadcasts
- Multicasts

**With SPAN:** Wireshark sees:
- Everything from monitored ports
- Like having a tap on the wire

### Use Cases
- Troubleshooting application issues
- IDS deployment (copy traffic to sensor)
- Recording for compliance
- Performance monitoring

---

## Slide 17: SPAN Configuration

### Key Points
- Source port = what to monitor
- Destination port = where sniffer connects
- Can monitor rx, tx, or both

### Teaching Focus: Configuration Steps

```
! Basic SPAN setup
monitor session 1 source interface fa0/1 - fa0/4 both
monitor session 1 destination interface fa0/24

! Verify
show monitor session 1
```

### Important Limitations
- Destination port can't pass normal traffic
- Multiple sessions have performance impact
- SPAN traffic competes for bandwidth

### Best Practices
- Use dedicated ports for SPAN destinations
- Monitor only what you need
- Consider RSPAN for remote monitoring

---

## Slide 18: RSPAN and ERSPAN

### Key Points
- RSPAN = Remote SPAN (Layer 2)
- ERSPAN = Encapsulated RSPAN (Layer 3)
- Choose based on network topology

### Teaching Focus: When to Use Each

**Local SPAN:**
- Source and destination on same switch
- Simplest setup
- Most common for quick troubleshooting

**RSPAN:**
- Need to monitor from different switch
- Uses special RSPAN VLAN
- Works within L2 domain

**ERSPAN:**
- Monitor across routed networks
- Uses GRE encapsulation
- Can span data centers
- Higher overhead

### RSPAN Example Scenario
"Security team needs to monitor branch office traffic at headquarters"
1. Configure RSPAN VLAN at branch
2. Source traffic into RSPAN VLAN
3. Trunk RSPAN VLAN to HQ
4. Extract at HQ to IDS

---

## Slide 19: Quality of Service (QoS) Basics

### Key Points
- Prioritizes critical traffic
- Addresses delay, jitter, loss
- Essential for voice/video

### Teaching Focus: QoS Problems

**Delay (Latency):**
- End-to-end time for packet
- Voice tolerates <150ms
- Caused by: queuing, processing, propagation

**Jitter:**
- Variation in delay
- Voice/video sensitive
- Causes choppy playback

**Packet Loss:**
- Dropped packets during congestion
- Voice: gaps in audio
- Data: retransmissions slow things down

### Priority Classes (Simplified)
| Class | DSCP | Traffic Type |
|-------|------|-------------|
| EF | 46 | Voice |
| AF41 | 34 | Video |
| AF21 | 18 | Critical Data |
| BE | 0 | Best Effort |

### Exam Tip
"Know that QoS doesn't CREATE bandwidth - it MANAGES it. During congestion, high-priority traffic goes first."

---

## Slide 20: Summary / Key Exam Points

### Critical Review

**Switch Functions Memory Device:**
"LAF" = Learn, Act, (prevent) Falls
- **L**earn addresses (source MAC)
- **A**ct on forwarding decisions (dest MAC)
- **F**alls = Loop prevention (STP)

**Switching Methods Quick Compare:**
- Store-and-Forward = SAFE (full check)
- Cut-Through = SPEED (no check)
- Fragment-Free = 64 bytes (partial check)

**Port Security Quick Reference:**
- Maximum MACs: How many allowed
- Sticky: Learns and saves
- Violation modes: Shutdown/Restrict/Protect

**PoE Standards:**
- 802.3**af** = 15.4W (a for "a little")
- 802.3**at** = 25.5W (at for "a tad more")
- 802.3**bt** = 60-90W (bt for "bigger things")

### Practice Questions

1. "A switch receives a frame with unknown destination MAC. What does it do?"
   Answer: Floods to all ports except source port

2. "Which switching method reads only the first 6 bytes?"
   Answer: Cut-Through

3. "What port security violation mode disables the port?"
   Answer: Shutdown (default)

4. "Which PoE standard delivers up to 90 watts?"
   Answer: 802.3bt (PoE++)

---

## Appendix: Lab Ideas

### Lab 1: MAC Address Learning
- Clear MAC table, generate traffic
- Watch table populate
- Discuss aging behavior

### Lab 2: Port Security Implementation
- Configure port security with sticky
- Test violation scenarios
- Practice recovery procedures

### Lab 3: SPAN Configuration
- Set up local SPAN
- Capture with Wireshark
- Analyze captured traffic

### Lab 4: PoE Exploration
- Check PoE budget and usage
- Connect/disconnect PD devices
- Monitor power consumption changes

---

**Document Version:** 1.0
**Created:** 2025-12-09 by CCode-Delta
**For Use With:** Network Essentials v5.5+
