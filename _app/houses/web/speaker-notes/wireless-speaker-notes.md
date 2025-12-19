# Wireless Networking - Speaker Notes

**Presentation:** wireless-presentation.html
**Slides:** 20
**Duration:** 60-75 minutes
**Certification Coverage:** Network+ N10-008 (2.4, 5.4), CCNA 200-301 (1.11, 2.6)

---

## Slide 1: Title Slide

### Key Points
- Wireless networking is everywhere - phones, laptops, IoT devices
- Understanding 802.11 standards is critical for the exam
- Security is paramount because signals travel through the air

### Instructor Notes
- **Opening Hook:** "How many of you have Wi-Fi at home? How many know what standard your router uses?"
- Ask students to check their phone's Wi-Fi settings - what do they see?
- Emphasize that wireless problems are among the most common helpdesk calls

### Exam Relevance
- Network+ 2.4: Install and configure wireless devices
- Network+ 5.4: Given a scenario, troubleshoot common wireless connectivity issues
- Expect 8-12 questions on wireless topics

---

## Slide 2: Wireless Fundamentals

### Key Points
- WLANs use radio waves instead of cables
- SSID is the network name users see
- CSMA/CA is used instead of CSMA/CD

### Teaching Focus
Walk through the connection process:
1. AP broadcasts beacon frames (every ~100ms)
2. Client sees SSID in available networks
3. Client sends probe request
4. AP responds with probe response
5. Authentication and association occur
6. User is connected!

### Real-World Analogy
"Think of the AP like a radio station broadcasting its name. Your device is like a radio scanning for stations. When you 'connect', you're tuning into that station."

### Common Misconception
"SSID hiding provides security" - NO! SSIDs are easily discovered with wireless sniffers. It provides obscurity, not security.

---

## Slide 3: 802.11 Standards Overview

### Key Points
- Multiple standards, each improving on the last
- Know which bands each standard uses (CRITICAL for exam!)
- Wi-Fi Alliance marketing names (Wi-Fi 4, 5, 6) are newer

### Teaching Focus: Memory Device
"**A**irplanes fly at **5** GHz" - 802.11**a** = **5** GHz
"**B**asic = **2**.4" - 802.11**b** = **2.4** GHz
"**AC**celerate at **5**" - 802.11**ac** = **5** GHz only

### Discussion Question
"Why do you think 802.11ac is 5 GHz ONLY while 802.11ax supports all three bands?"

Answer: 802.11ac was designed to maximize speed on the less-congested 5 GHz band. Wi-Fi 6 (ax) brought efficiency improvements that benefit ALL bands, including crowded 2.4 GHz.

### CLI Demo (for Cisco APs)
```
show dot11 associations
show controllers dot11Radio 0
```

---

## Slide 4: 802.11a and 802.11b (Legacy)

### Key Points
- Both released in 1999, very different characteristics
- 802.11a never gained home adoption (expensive)
- 802.11b was everywhere until 802.11g

### Teaching Focus: Trade-offs
"This slide shows the fundamental trade-off in wireless: frequency vs range"
- 5 GHz (802.11a): Faster but shorter range
- 2.4 GHz (802.11b): Slower but longer range

### Why 802.11a Failed Initially
- Equipment was expensive
- Incompatible with 802.11b devices
- Shorter range meant more APs needed
- 802.11b was "good enough" for early internet

### Exam Tip
"If you see 'DSSS modulation' - think 802.11b. If you see 'OFDM modulation' - think 802.11a or later."

---

## Slide 5: 802.11g and 802.11n

### Key Points
- 802.11g brought 802.11a speeds to 2.4 GHz
- 802.11n was revolutionary - MIMO, dual-band, channel bonding
- 802.11n is still widely deployed

### Teaching Focus: MIMO
"Imagine a highway. Single-lane (SISO) has limited capacity. MIMO adds multiple lanes - 2x2, 3x3, 4x4. More lanes = more data simultaneously."

### Channel Bonding Explanation
- Normal channel: 20 MHz wide
- Bonded channel: 40 MHz (two 20 MHz channels combined)
- More bandwidth = more speed
- Caution: Uses more spectrum, fewer channels available

### Lab Idea
Have students use a Wi-Fi analyzer app to see:
- Which channels nearby APs use
- Whether they're using 20 or 40 MHz channels
- Signal strength from various locations

---

## Slide 6: 802.11ac (Wi-Fi 5)

### Key Points
- 5 GHz ONLY - this is a common exam question!
- Introduced MU-MIMO (Wave 2)
- Channel widths up to 160 MHz

### Teaching Focus: MU-MIMO
"Regular MIMO: AP talks to one client at a time, very fast
MU-MIMO: AP talks to MULTIPLE clients simultaneously"

Draw it on the board:
```
Without MU-MIMO:      With MU-MIMO:
AP → Client A         AP → Client A
AP → Client B              → Client B
AP → Client C              → Client C
(sequential)          (simultaneous)
```

### 160 MHz Channel Warning
"Just because you CAN use 160 MHz doesn't mean you SHOULD. In most environments, you'll only get 1-2 usable 160 MHz channels. Use 80 MHz for better density."

### Common Exam Question
"Which 802.11 standard operates ONLY in the 5 GHz band?"
Answer: 802.11ac (also 802.11a, but ac is more likely to be asked)

---

## Slide 7: 802.11ax (Wi-Fi 6/6E)

### Key Points
- OFDMA is the biggest innovation
- 6E adds 6 GHz band (1200 MHz of new spectrum!)
- Designed for density, not just speed

### Teaching Focus: OFDMA vs OFDM
Draw on board:
```
OFDM (Wi-Fi 5):
|----User A----|----User B----|----User C----|
Time slot 1     Time slot 2     Time slot 3

OFDMA (Wi-Fi 6):
|--A--|--B--|--C--|--A--|--B--|--C--|
  All users share each time slot
```

"OFDMA divides each channel into smaller 'resource units' that can serve different clients simultaneously. Great for small, frequent packets like IoT and voice."

### Wi-Fi 6E Discussion
"The 6 GHz band is like getting a whole new highway system with no old slow cars allowed. Only Wi-Fi 6E devices can use it - no legacy interference!"

### Target Wake Time (TWT)
"Imagine if your phone only checked for Wi-Fi at scheduled times instead of constantly. Battery life improves dramatically. This is huge for IoT devices on batteries."

---

## Slide 8: Frequency Bands Comparison

### Key Points
- Higher frequency = more bandwidth but shorter range
- 2.4 GHz is crowded with interference
- 6 GHz is the new frontier

### Teaching Focus: Why Range Differs
"Radio waves at higher frequencies are absorbed more by obstacles. Think of it like sound - bass (low frequency) travels through walls, treble (high frequency) doesn't."

### Real-World Example
"Your microwave operates at 2.4 GHz - that's why it can interfere with Wi-Fi! Bluetooth is also 2.4 GHz. Baby monitors, cordless phones... the 2.4 GHz band is a zoo."

### When to Use Which Band
- **2.4 GHz:** IoT devices, older devices, need range through walls
- **5 GHz:** Laptops, phones, streaming, where speed matters
- **6 GHz:** High-performance devices, no legacy needed, low interference

---

## Slide 9: 2.4 GHz Channel Planning

### Key Points
- ONLY 3 non-overlapping channels: 1, 6, 11
- This is one of the most-tested wireless facts!
- Using other channels causes interference

### Teaching Focus: Why Channels Overlap
"Each 2.4 GHz channel is 22 MHz wide, but centers are only 5 MHz apart. Channels 1 and 2 share most of their spectrum. Only 1, 6, and 11 are far enough apart to not overlap."

### Visual Demo
If possible, show a spectrum analyzer or Wi-Fi analyzer app displaying the 2.4 GHz channels. Students should see how signals from channels 1, 6, 11 don't interfere.

### Common Mistakes
1. Letting the AP auto-select channels (often picks bad ones)
2. Using channel 3, 4, 8, 9, 10 (overlap!)
3. Having adjacent APs on the same channel (co-channel interference)

### Exam Question Format
"Which channels should be used for a three-AP deployment to avoid interference?"
Answer: 1, 6, 11 (one per AP)

---

## Slide 10: 5 GHz Channels

### Key Points
- Many more non-overlapping channels
- DFS channels require radar detection
- UNII bands have different rules

### Teaching Focus: DFS Explanation
"Some 5 GHz channels are shared with weather radar and military radar. DFS (Dynamic Frequency Selection) requires your AP to:
1. Listen for radar before transmitting
2. Move to another channel if radar is detected
3. Wait 30 minutes before returning

This can cause brief disconnections - something to consider for critical applications."

### Which Channels to Use
For most deployments:
- UNII-1 (36, 40, 44, 48) - Safe, no DFS
- UNII-3 (149, 153, 157, 161, 165) - Safe, no DFS, higher power allowed
- UNII-2A/2C - More channels but DFS required

### Lab Suggestion
Configure a 5 GHz network and use a Wi-Fi analyzer to see available channels. Identify which are DFS channels in your region.

---

## Slide 11: Wireless Security Overview

### Key Points
- WEP is completely broken - never use
- WPA2 with AES is the minimum acceptable
- WPA3 is the new standard

### Teaching Focus: Why Security Matters
"Unlike wired networks where you need physical access, wireless signals go through walls. Anyone in range can attempt to capture or attack your network."

### Real-World Attack Scenario
"An attacker sits in a parking lot with a laptop and antenna. With WEP, they crack your key in minutes. With weak WPA2 password, they capture the handshake and crack it overnight. With WPA3-SAE, they can't crack it offline at all."

### Common Exam Question
"Which wireless security protocol uses AES encryption?"
Answer: WPA2 (also WPA3)

"Which wireless security protocol should NEVER be used?"
Answer: WEP

---

## Slide 12: WEP and WPA (Legacy)

### Key Points
- WEP can be cracked in minutes
- WPA was a temporary fix
- Both are deprecated

### Teaching Focus: WEP's Fatal Flaw
"WEP uses a 24-bit IV (Initialization Vector). With millions of packets, IVs repeat. When attackers capture packets with the same IV, they can determine the key through mathematical analysis."

### Demo Idea (Ethical/Lab Only)
Show students how quickly aircrack-ng can crack a WEP key in a controlled lab environment. This demonstrates why WEP is unusable.

### WPA's Improvement
"WPA's TKIP was clever - it used the same RC4 cipher but changed keys frequently and added integrity checking. It was designed to work on existing WEP hardware with just a firmware update."

### Why TKIP Is Deprecated
"TKIP still has weaknesses because it's built on RC4. It was always meant as a bridge to WPA2. Don't use it today."

---

## Slide 13: WPA2

### Key Points
- AES-CCMP provides strong encryption
- Personal uses PSK, Enterprise uses 802.1X
- Still widely deployed and secure

### Teaching Focus: Personal vs Enterprise

**WPA2-Personal:**
- Single password shared by all users
- If someone leaves, you should change the password
- Good for home, small office

**WPA2-Enterprise:**
- Each user has unique credentials
- User leaves? Disable their account
- Requires RADIUS server

### 4-Way Handshake
Walk through briefly:
1. AP sends ANonce (random number)
2. Client sends SNonce + MIC
3. AP sends GTK (group key) encrypted
4. Client confirms

"This handshake is why capturing it allows offline attacks in WPA2-Personal. The attacker can try passwords against the captured handshake."

### Password Recommendation
"Use 12+ random characters. 'correcthorsebatterystaple' style passphrases are good too. Avoid dictionary words alone."

---

## Slide 14: WPA3

### Key Points
- SAE replaces vulnerable 4-way handshake
- Forward secrecy protects past sessions
- PMF is now mandatory

### Teaching Focus: SAE (Dragonfly)
"SAE uses a 'Dragonfly' key exchange. Unlike PSK, even if you capture the exchange, you can't try passwords offline. Each attempt must be done live against the AP, which can rate-limit and block attackers."

### Forward Secrecy Explained
"With WPA2, if someone captures your traffic today and gets your password tomorrow, they can decrypt everything. With WPA3's forward secrecy, each session has unique keys. Cracking tomorrow doesn't help decrypt yesterday."

### Protected Management Frames (PMF)
"Deauthentication attacks send fake 'disconnect' packets to kick users off. PMF authenticates management frames so the client knows they're legitimate."

### Adoption Status
"WPA3 is still rolling out. Many devices support it, but compatibility mode (WPA2/WPA3 transition) is common. Pure WPA3-only networks require careful planning."

---

## Slide 15: Enterprise Authentication

### Key Points
- 802.1X provides individual authentication
- RADIUS server verifies credentials
- EAP methods define how authentication happens

### Teaching Focus: 802.1X Components
Draw on board:
```
[Supplicant] ←→ [Authenticator] ←→ [Auth Server]
  (Client)         (AP)             (RADIUS)
```

"The AP doesn't make authentication decisions - it just passes traffic to RADIUS. This centralizes security policy."

### EAP Methods Comparison

**EAP-TLS:**
- Certificates on both sides
- Most secure but most complex
- Needs PKI infrastructure

**PEAP:**
- Server has certificate
- Client uses username/password
- Most common in enterprises

**EAP-FAST:**
- Cisco developed
- Uses PAC (Protected Access Credential)
- Faster setup than PEAP

### Lab Idea
Set up FreeRADIUS and configure WPA2-Enterprise on a test AP. Have students authenticate with their own credentials.

---

## Slide 16: Access Point Types

### Key Points
- Autonomous APs work alone
- Controller-based APs need a WLC
- Cloud-managed is increasingly popular

### Teaching Focus: When to Use What

**Small coffee shop (3 APs):** Autonomous is fine
**Corporate office (50 APs):** Controller-based
**Chain of retail stores (5 APs each, 100 locations):** Cloud-managed

### CAPWAP Protocol
"Lightweight APs are 'thin' - they don't make forwarding decisions alone. They tunnel everything to the controller via CAPWAP. The controller handles:
- Configuration distribution
- Security policy
- RF management
- Roaming coordination"

### Controller Failure Impact
"What happens if the controller dies? Depends on mode:
- **Local mode:** Clients disconnect immediately
- **FlexConnect:** Locally switched traffic continues, centrally switched fails"

### Troubleshooting Tip
"When troubleshooting controller-based wireless, check:
1. CAPWAP tunnel status
2. AP join status on controller
3. Controller logs for the AP"

---

## Slide 17: Site Surveys

### Key Points
- Essential for proper deployment
- Different types for different purposes
- Measure signal strength and interference

### Teaching Focus: Survey Types

**Predictive:**
- Input floor plan and materials
- Software calculates coverage
- Good for planning, not verification

**Passive:**
- Walk around with analyzer
- Listen to existing signals
- See interference sources

**Active:**
- Connect to network and test
- Measure actual throughput
- Most accurate but time-consuming

### Reading Signal Strength
"Signal strength in dBm is logarithmic and negative:
- -30 dBm = Excellent (right next to AP)
- -50 dBm = Great
- -65 dBm = Good (target minimum)
- -75 dBm = Fair
- -85 dBm = Poor
- -90 dBm = Unusable

Remember: Closer to zero is BETTER!"

### Heat Map Interpretation
Show example heat maps if available. Discuss:
- Coverage holes (red/gray areas)
- Overlapping coverage (for roaming)
- Channel interference patterns

---

## Slide 18: Wireless Troubleshooting

### Key Points
- Systematic approach to common issues
- Many problems are interference-related
- Tools are essential

### Teaching Focus: Troubleshooting Workflow

1. **Verify the problem:** Can you reproduce it? Is it one user or many?
2. **Check basics:** Is Wi-Fi enabled? Correct SSID? Password correct?
3. **Check signal:** Signal strength, SNR, what channel?
4. **Check interference:** Other APs? Non-Wi-Fi sources?
5. **Check AP:** Logs, connected clients, CPU/memory
6. **Check infrastructure:** Controller, RADIUS, DHCP, DNS

### Common Issues and Quick Fixes

**Slow for everyone:**
- Check channel utilization
- Look for interference
- Verify not oversubscribed

**Slow for one user:**
- Distance? Signal strength?
- Legacy device forcing slower speeds?
- Driver issues?

**Intermittent drops:**
- DFS channel changes?
- Power save too aggressive?
- Roaming between APs failing?

### Troubleshooting Commands (Cisco)
```
show dot11 associations client
show dot11 statistics
debug dot11 <options>
```

---

## Slide 19: Other Wireless Technologies

### Key Points
- Bluetooth for personal area
- Zigbee/Z-Wave for IoT
- NFC for very close range
- Cellular for WAN

### Teaching Focus: When to Use What

| Technology | Range | Use Case |
|------------|-------|----------|
| NFC | 4 cm | Payments, building access |
| Bluetooth | 10 m | Headphones, keyboards |
| Zigbee | 100 m | Smart home sensors |
| Wi-Fi | 50 m | Data networks |
| Cellular | km | Mobile, WAN backup |

### IoT Considerations
"IoT devices often use 2.4 GHz only (cheaper radios). With hundreds of smart devices, your 2.4 GHz band gets crowded while 5 GHz sits empty. Plan accordingly!"

### Cellular Backup
"Many businesses use cellular (4G/5G) as WAN backup. When fiber fails, the router fails over to cellular. Know this for disaster recovery scenarios."

---

## Slide 20: Summary

### Critical Review

**Standards Memory Aid:**
- **b** = basic = 2.4 GHz = 11 Mbps
- **a** = 5 GHz = 54 Mbps (same speed as g!)
- **g** = 2.4 GHz = 54 Mbps
- **n** = MIMO = dual-band = 600 Mbps
- **ac** = 5 GHz ONLY = 6.9 Gbps
- **ax** = OFDMA = tri-band = 9.6 Gbps

**Security Hierarchy:**
WEP (broken) < WPA (deprecated) < WPA2 (good) < WPA3 (best)

### Practice Questions

1. "Which 2.4 GHz channels are non-overlapping?"
   Answer: 1, 6, 11

2. "What encryption does WPA2 use?"
   Answer: AES-CCMP

3. "What is the maximum theoretical speed of 802.11ac?"
   Answer: 6.9 Gbps

4. "What protocol do lightweight APs use to communicate with controllers?"
   Answer: CAPWAP

5. "What does DFS stand for and why is it required?"
   Answer: Dynamic Frequency Selection - required to avoid interference with radar systems on certain 5 GHz channels

---

## Appendix: Lab Ideas

### Lab 1: Wi-Fi Analysis
- Install Wi-Fi analyzer app on phones
- Walk around building measuring signal
- Identify channels used by nearby APs
- Create informal heat map

### Lab 2: Configure Wireless Security
- Set up AP with WPA2-Personal
- Try connecting with wrong password
- Change to WPA2-Enterprise (if RADIUS available)
- Observe authentication process

### Lab 3: Channel Planning Exercise
- Given floor plan with 6 APs
- Assign channels to avoid interference
- Justify decisions

### Lab 4: Troubleshooting Scenarios
- Create problems (wrong password, interference, bad channel)
- Students diagnose and fix
- Document troubleshooting steps

---

**Document Version:** 1.0
**Created:** 2025-12-09 by CCode-Delta
**For Use With:** Network Essentials v5.4.0+
