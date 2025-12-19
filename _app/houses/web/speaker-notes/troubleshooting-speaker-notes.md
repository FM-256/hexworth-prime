# Network Troubleshooting - Speaker Notes
## Network+ N10-008 Domain 5 (~22% of Exam)

**Presentation:** `presentations/troubleshooting-presentation.html`
**Duration:** 60-75 minutes
**Visualizer:** `tools/troubleshooting-visualizer.html`

---

## Slide 1: Title - Network Troubleshooting

### Teaching Focus
- This is the LARGEST domain on the Network+ exam at ~22%
- Troubleshooting skills separate good network admins from great ones
- Emphasize that this is hands-on, practical knowledge they'll use daily

### Key Points
- Domain 5 covers objectives 5.1-5.5
- Questions are often scenario-based: "A user reports..."
- Must know both Windows AND Linux command equivalents
- Physical tools AND software tools are covered

### Discussion Starter
> "How many of you have ever had to troubleshoot a network issue? What was your approach? Was it systematic or random clicking?"

### Real-World Context
- Help desk tickets average 15-20 minutes when using methodology
- Random troubleshooting can take hours for the same issue
- Documentation saves time when problems recur

---

## Slide 2: The 7-Step Troubleshooting Methodology

### Teaching Focus
- This is CompTIA's OFFICIAL methodology - it WILL be on the exam
- Order matters! Many questions ask "What's the NEXT step?"
- Make students memorize: **I**dentify, **T**heory, **T**est, **P**lan, **I**mplement, **V**erify, **D**ocument

### Memory Aid
> "**I T**hink **T**hat **P**eople **I**nstantly **V**iew **D**ocs**" - or create your own mnemonic

### The 7 Steps
1. **Identify the problem** - Gather info, ask questions
2. **Establish a theory** - What could cause this?
3. **Test the theory** - Confirm or rule out
4. **Establish a plan** - How will we fix it?
5. **Implement the solution** - Do the fix
6. **Verify full functionality** - Make sure it's working
7. **Document** - Record everything

### Common Exam Traps
- Skipping steps (e.g., implementing before testing theory)
- Documenting BEFORE verifying (always last!)
- Not escalating when theory is confirmed incorrect

### Discussion Question
> "A user says 'the internet is down.' What's the first thing you do?" (Answer: Ask questions - is it just them? What were they doing? Can they reach internal resources?)

---

## Slide 3: Methodology Steps Explained

### Teaching Focus
- Deep dive into each step with practical examples
- Emphasize "question the obvious" - 80% of issues are simple

### Step-by-Step Breakdown

#### 1. Identify the Problem
- **Ask questions:** What changed? When did it start? Who's affected?
- **Determine scope:** One user, one department, or entire building?
- **Reproduce if possible:** Can you see the issue yourself?

#### 2. Establish a Theory (Question the Obvious)
- Start with simple things: Is it plugged in? Is it turned on?
- Use OSI model approaches (covered in Slide 19)
- Consider multiple theories, rank by likelihood

#### 3. Test the Theory
- If confirmed → move to Step 4
- If NOT confirmed → new theory OR escalate
- Don't get stuck - know when to ask for help

#### 4. Establish a Plan of Action
- Identify potential side effects
- Get approval if change affects others
- Schedule maintenance window if needed

#### 5. Implement the Solution
- Make one change at a time!
- Document what you're doing as you do it
- Have a rollback plan

#### 6. Verify Full System Functionality
- Test the specific issue (is it fixed?)
- Test related functionality (did fix break something else?)
- Have user confirm if they reported it

#### 7. Document Findings
- What was the problem?
- What was the solution?
- How can we prevent it in the future?

### Real-World Example
> "User reports: Can't access email. Step 1: Can they access anything? No. Is it just them? Yes. Cable plugged in? NO! Fix: Reconnect cable. Verify: Test email AND web browsing. Document: 'User kicked cable, reconnected, user educated about cable management.'"

---

## Slide 4: The ping Command

### Teaching Focus
- Most fundamental troubleshooting tool
- Students should be able to interpret ping output completely

### Command Details

```bash
# Basic ping
ping 192.168.1.1

# Windows options
ping -t 192.168.1.1       # Continuous (Ctrl+C to stop)
ping -n 10 192.168.1.1    # Send 10 pings
ping -l 1000 192.168.1.1  # 1000 byte packets
ping -a 192.168.1.1       # Resolve to hostname

# Linux options
ping -c 10 192.168.1.1    # Send 10 pings (default is infinite)
ping -s 1000 192.168.1.1  # 1000 byte packets
ping -I eth0 192.168.1.1  # Use specific interface
```

### Interpreting Results

| Result | Meaning |
|--------|---------|
| Reply | Host is reachable |
| Request timed out | Host unreachable OR firewall blocking |
| Destination host unreachable | No route to host |
| TTL expired | Too many hops |

### TTL Values (OS Detection Hint)
- **Linux/Unix:** Usually starts at 64
- **Windows:** Usually starts at 128
- **Network devices:** Often 255

### Troubleshooting Sequence
1. `ping 127.0.0.1` - Test TCP/IP stack
2. `ping [own IP]` - Test NIC
3. `ping [gateway]` - Test local network
4. `ping [remote IP]` - Test routing
5. `ping [hostname]` - Test DNS

### Lab Exercise
> Have students ping each other's machines, the gateway, and external hosts (8.8.8.8, google.com). Compare TTL values.

---

## Slide 5: traceroute / tracert

### Teaching Focus
- Shows the path packets take - invaluable for finding WHERE problems occur
- Explain TTL incrementing technique

### How It Works
1. Sends packet with TTL=1 → First router decrements to 0, sends back "Time Exceeded"
2. Sends packet with TTL=2 → Second router sends back error
3. Continues until destination reached or max hops

### Command Details

```bash
# Windows
tracert google.com
tracert -d google.com     # Don't resolve hostnames (faster)

# Linux
traceroute google.com
traceroute -n google.com  # Numeric only
traceroute -I google.com  # Use ICMP instead of UDP
```

### Reading the Output
```
  1    1 ms    1 ms    1 ms  192.168.1.1      ← Your router
  2   10 ms   12 ms   11 ms  10.0.0.1         ← ISP first hop
  3    *       *       *     Request timed out ← Router doesn't respond
  4   25 ms   24 ms   25 ms  destination      ← Final hop
```

### Interpreting Results
- **Asterisks (*):** Router doesn't respond to traceroute (not necessarily down!)
- **Sudden latency spike:** Congestion or long distance link
- **Stops before destination:** Routing issue or firewall

### Common Issues Revealed
- Routing loops (same IPs repeating)
- Suboptimal routing (traffic going far out of way)
- ISP problems (high latency at specific hop)

### Windows vs Linux Difference
- **tracert (Windows):** Uses ICMP Echo Request
- **traceroute (Linux):** Uses UDP by default (port 33434+)
- Some firewalls treat these differently!

---

## Slide 6: IP Configuration Commands

### Teaching Focus
- Students MUST know both Windows and Linux commands
- DHCP release/renew is very common fix

### Windows: ipconfig

```cmd
ipconfig                  # Basic IP info
ipconfig /all             # Detailed info (MAC, DHCP server, DNS)
ipconfig /release         # Release DHCP lease
ipconfig /renew           # Request new DHCP lease
ipconfig /flushdns        # Clear DNS cache
ipconfig /displaydns      # Show cached DNS entries
ipconfig /registerdns     # Re-register with DNS server
```

### Linux: ip / ifconfig

```bash
# Modern Linux (ip command)
ip addr show              # Show IP addresses
ip addr show eth0         # Specific interface
ip link show              # Show interface status
ip route show             # Show routing table
ip neigh show             # Show ARP cache (like arp -a)

# Legacy (ifconfig - may not be installed)
ifconfig -a               # All interfaces
ifconfig eth0             # Specific interface

# DHCP operations
dhclient -r               # Release DHCP lease
dhclient                  # Request new lease
sudo systemctl restart NetworkManager  # Restart networking
```

### APIPA Deep Dive
- **169.254.x.x** = Automatic Private IP Addressing
- Windows assigns when DHCP unavailable
- Linux equivalent: link-local addressing

### When You See APIPA, Check:
1. Is DHCP server running?
2. Is network cable connected?
3. Is the port in the correct VLAN?
4. Is there a DHCP relay if server is remote?
5. Is the DHCP pool exhausted?

### Lab Exercise
> Release and renew DHCP. Check ipconfig /all before and after. Note which values change.

---

## Slide 7: DNS Troubleshooting - nslookup & dig

### Teaching Focus
- DNS issues account for many "internet is down" complaints
- nslookup works on both Windows and Linux

### nslookup Commands

```bash
# Basic lookup
nslookup google.com

# Query specific DNS server
nslookup google.com 8.8.8.8

# Query specific record types
nslookup -type=MX gmail.com     # Mail servers
nslookup -type=A example.com    # IPv4 address
nslookup -type=AAAA example.com # IPv6 address
nslookup -type=NS example.com   # Name servers
nslookup -type=PTR 8.8.8.8      # Reverse lookup

# Interactive mode
nslookup
> set type=MX
> gmail.com
```

### dig Commands (Linux - more detailed)

```bash
dig google.com              # Full query with stats
dig +short google.com       # Just the answer
dig MX gmail.com            # Mail records
dig @8.8.8.8 google.com     # Query specific server
dig +trace google.com       # Follow delegation chain
dig -x 8.8.8.8              # Reverse lookup
```

### DNS Record Types for Exam

| Type | Purpose | Example |
|------|---------|---------|
| A | IPv4 address | google.com → 142.250.80.46 |
| AAAA | IPv6 address | google.com → 2607:f8b0:4004:800::200e |
| MX | Mail server | gmail.com → alt1.gmail-smtp-in.l.google.com |
| CNAME | Alias/Canonical name | www.example.com → example.com |
| PTR | Reverse lookup | 8.8.8.8 → dns.google |
| NS | Name server | google.com → ns1.google.com |
| TXT | Text records | Used for SPF, DKIM, verification |
| SOA | Start of Authority | Zone information |

### Troubleshooting Logic
If nslookup fails with default DNS but works with 8.8.8.8:
- Problem is with configured DNS server
- Check DNS server IP in network settings
- Try flushing DNS cache first

---

## Slide 8: netstat - Network Statistics

### Teaching Focus
- Essential for seeing what's connected and what's listening
- Security tool - find unexpected connections

### Command Options

```bash
# Windows
netstat -a         # All connections and listening ports
netstat -n         # Numeric (faster, no DNS lookup)
netstat -o         # Show process ID
netstat -b         # Show executable (requires admin)
netstat -r         # Routing table
netstat -s         # Protocol statistics
netstat -an        # Most common combination

# Linux
netstat -tuln      # TCP/UDP, listening, numeric
netstat -tupn      # With process names
ss -tuln           # Modern replacement for netstat
```

### Connection States

| State | Meaning |
|-------|---------|
| LISTENING | Waiting for connections |
| ESTABLISHED | Active connection |
| TIME_WAIT | Connection closed, waiting to clear |
| CLOSE_WAIT | Remote closed, waiting for app |
| SYN_SENT | Initiating connection |
| SYN_RECV | Received SYN, sent SYN-ACK |

### Practical Uses
1. **Security:** Find unexpected listening ports
2. **Troubleshooting:** Verify service is listening
3. **Performance:** Find many connections to same host
4. **Malware detection:** Unusual outbound connections

### Example Interpretation
```
TCP    0.0.0.0:80       0.0.0.0:0      LISTENING
       ^ Local          ^ Any remote   ^ Waiting for connections
       Web server listening on all interfaces, port 80
```

### Lab Exercise
> Run `netstat -ano` and identify: web browser connections, DNS queries (port 53), any suspicious ports.

---

## Slide 9: arp - Address Resolution Protocol

### Teaching Focus
- ARP maps IP addresses to MAC addresses (Layer 3 to Layer 2)
- Important for troubleshooting AND security

### Commands

```bash
# Windows
arp -a              # Display ARP cache
arp -d *            # Clear entire cache
arp -d 192.168.1.1  # Delete specific entry
arp -s 192.168.1.1 aa-bb-cc-dd-ee-ff  # Static entry

# Linux
arp -a              # Display cache (may need net-tools)
ip neigh show       # Modern equivalent
ip neigh flush all  # Clear cache
```

### ARP Entry Types
- **Dynamic:** Learned automatically, expires after timeout
- **Static:** Manually configured, doesn't expire

### Troubleshooting Uses

1. **Duplicate IP Detection:**
   - Two different MACs for same IP = problem!

2. **Device Identification:**
   - Find MAC of unknown device
   - First 3 octets = manufacturer (OUI lookup)

3. **ARP Spoofing Detection:**
   - Gateway MAC keeps changing
   - Multiple IPs pointing to same MAC (attacker)

### Security Considerations
- ARP spoofing/poisoning: Attacker pretends to be gateway
- Detection: Watch for gateway MAC address changes
- Prevention: Static ARP entries, DAI (Dynamic ARP Inspection)

### Real-World Scenario
> "Users report internet is slow. Check ARP table - gateway MAC is different from yesterday! Someone's running an ARP spoofing attack. Trace MAC to find the culprit switch port."

---

## Slide 10: route - Routing Table Management

### Teaching Focus
- Every host has a routing table, not just routers
- Understanding routing is key to troubleshooting connectivity

### Commands

```bash
# Windows
route print         # Display routing table
route add 10.0.0.0 mask 255.0.0.0 192.168.1.1    # Add route
route delete 10.0.0.0                             # Remove route
route -p add ...    # Persistent route (survives reboot)

# Linux
ip route show       # Display routes (modern)
ip route add 10.0.0.0/8 via 192.168.1.1          # Add route
ip route del 10.0.0.0/8                           # Remove route
route -n            # Legacy command
```

### Understanding Route Table Output
```
Network Destination    Netmask          Gateway         Interface    Metric
0.0.0.0                0.0.0.0          192.168.1.1     192.168.1.10    25
192.168.1.0            255.255.255.0    On-link         192.168.1.10   281
```

- **0.0.0.0/0.0.0.0:** Default route (gateway to internet)
- **On-link:** Directly connected network
- **Metric:** Lower = preferred when multiple routes exist

### Default Gateway
- Route of last resort
- Where packets go when no specific route matches
- **0.0.0.0/0** = "everywhere else"

### Common Issues
1. **No default gateway:** Can reach local, not remote
2. **Wrong gateway:** Packets going to wrong router
3. **Missing route:** Can't reach specific network

### Exam Tip
> "If a user can ping local hosts but not the internet, what should you check? The default gateway!"

---

## Slide 11: pathping & mtr - Advanced Path Analysis

### Teaching Focus
- These combine ping and traceroute functionality
- Better for diagnosing intermittent issues

### pathping (Windows)

```cmd
pathping google.com
pathping -q 50 google.com   # 50 queries per hop (default 100)
pathping -n google.com      # No name resolution
```

**How it works:**
1. First traces the route (like tracert)
2. Then sends 100 pings to EACH hop
3. Calculates packet loss and latency at each point
4. Takes several minutes to complete

**Output shows:**
- Route to destination
- RTT (round-trip time) per hop
- Packet loss percentage per hop

### mtr (Linux - My TraceRoute)

```bash
mtr google.com            # Interactive real-time display
mtr -r google.com         # Report mode (for scripts)
mtr -c 100 google.com     # 100 cycles
mtr --tcp google.com      # Use TCP instead of ICMP
```

**Why mtr is great:**
- Real-time updating display
- Shows packet loss AND latency simultaneously
- Identifies problem hops immediately

### When to Use These Tools
- Intermittent connectivity problems
- VoIP quality issues
- Determining if ISP has problems
- Finding congested network segments

### Interpreting Results
- High packet loss at one hop but not after = that device doesn't prioritize responding
- High packet loss that continues = real problem at that hop
- Sudden latency increase = congested or long-distance link

---

## Slide 12: nmap & Packet Capture

### Teaching Focus
- Professional tools used by security and network teams
- ONLY use on networks you own or have permission!

### nmap - Network Mapper

```bash
# Host discovery
nmap -sn 192.168.1.0/24    # Ping scan (no port scan)
nmap -sL 192.168.1.0/24    # List targets only

# Port scanning
nmap 192.168.1.1           # Default scan (top 1000 ports)
nmap -p 80,443 host        # Specific ports
nmap -p- host              # ALL 65535 ports

# Service detection
nmap -sV host              # Version detection
nmap -O host               # OS detection

# Stealth scan (harder to detect)
nmap -sS host              # SYN scan (half-open)
```

### tcpdump (Linux)

```bash
tcpdump -i eth0             # Capture on interface
tcpdump -i any              # All interfaces
tcpdump port 80             # Filter by port
tcpdump host 192.168.1.1    # Filter by host
tcpdump -w capture.pcap     # Write to file
tcpdump -r capture.pcap     # Read from file
tcpdump -n                  # Don't resolve names
tcpdump -v                  # Verbose output
```

### Wireshark
- GUI packet analyzer
- Can read tcpdump captures
- Powerful filtering and analysis
- Industry standard tool

### Legal and Ethical Notes
- **ALWAYS** get written permission before scanning
- Unauthorized scanning can be illegal
- Even "harmless" scans can trigger security alerts
- Use only on your own networks or in authorized tests

### Use Cases
- Network inventory/discovery
- Security auditing
- Troubleshooting application issues
- Analyzing protocol behavior

---

## Slide 13: Hardware Troubleshooting Tools

### Teaching Focus
- Physical layer problems require physical tools
- These appear on the exam!

### Cable Tester
**Purpose:** Tests copper cable continuity and wiring

**Types:**
- **Basic continuity tester:** Passes current, checks for breaks
- **Wire mapper:** Verifies correct pin-to-pin wiring
- **Certifier:** Tests to standards (Cat5e, Cat6 specs)

**What it detects:**
- Open (broken) wires
- Shorts between wires
- Crossed pairs
- Split pairs (wrong pairing)

### Tone Generator & Probe (Fox and Hound)
**Purpose:** Trace cables through walls/ceilings

**How it works:**
1. Tone generator attaches to one end
2. Probe (wand) detects tone on the other end
3. Follow the tone through the building

**Use cases:**
- Identify unlabeled cables
- Trace cable runs
- Find cables in walls

### Loopback Plug
**Purpose:** Tests NIC functionality

**How it works:**
- Loops transmit pins to receive pins
- NIC can send and receive its own traffic
- Tests adapter without network

### Multimeter
**Purpose:** Electrical measurements

**Network uses:**
- Test PoE voltage (48V DC expected)
- Check cable continuity
- Verify grounding

### Spectrum Analyzer
**Purpose:** Analyze wireless frequencies

**What it shows:**
- Signal strength across spectrum
- Interference sources
- Channel utilization
- Rogue access points

### TDR/OTDR
- **TDR (Time Domain Reflectometer):** Copper cable
- **OTDR (Optical TDR):** Fiber optic cable

**Purpose:** Find cable breaks and measure distance

**How it works:**
- Sends pulse down cable
- Measures reflection from breaks/ends
- Calculates distance to fault

---

## Slide 14: Common Wired Network Issues

### Teaching Focus
- Most common physical/Layer 1-2 problems
- Stress the importance of checking simple things first

### Duplex Mismatch
**Symptoms:** Slow speeds, late collisions, high CRC errors

**Cause:** One side full-duplex, other side half-duplex

**Solution:**
- Set both ends to auto-negotiate
- Or manually configure both the same

**Why it happens:**
- One device doesn't support auto-negotiate
- Manual configuration on only one end

### Speed Mismatch
**Symptoms:** Very slow transfer, connection drops

**Cause:** Mismatched speed settings (100 Mbps vs 1 Gbps)

**Solution:** Match speed settings or use auto-negotiate

### Bad/Damaged Cable
**Symptoms:** Intermittent connectivity, high errors

**Diagnosis:**
- Check for physical damage
- Test with cable tester
- Try known good cable

**Common causes:**
- Bent too sharply
- Crushed by furniture
- Rodent damage
- Worn connectors

### Broadcast Storm
**Symptoms:** Network slowdown, high switch CPU, flooding

**Cause:** Layer 2 loop (cable connected to wrong ports)

**Solution:**
- Enable Spanning Tree Protocol (STP)
- Find and remove the loop
- Implement BPDU Guard on access ports

### VLAN Mismatch
**Symptoms:** Can't communicate with expected devices

**Cause:** Port in wrong VLAN

**Solution:** Verify VLAN configuration on switch port

### EMI/Interference
**Symptoms:** Intermittent errors, CRC failures

**Cause:** Running cable near electrical sources

**Solution:** Reroute cable, use shielded cable (STP)

---

## Slide 15: Common Wireless Network Issues

### Teaching Focus
- Wireless problems are often environmental
- 2.4 GHz vs 5 GHz characteristics matter

### Interference
**Symptoms:** Slow speeds, dropped connections, variable performance

**Common 2.4 GHz interferers:**
- Microwave ovens (huge interference!)
- Cordless phones
- Bluetooth devices
- Baby monitors
- Other WiFi networks

**Solutions:**
- Use 5 GHz band
- Change channels
- Remove interference source
- Use directional antennas

### Channel Overlap (2.4 GHz)
**Problem:** Co-channel interference in dense deployments

**Solution:** Use only channels 1, 6, and 11 (non-overlapping)

**Why:** Other channels overlap with neighbors

### Coverage Issues
**Symptoms:** Dead zones, weak signal areas

**Solutions:**
- Add access points
- Adjust AP placement/power
- Use wireless repeaters/extenders
- Consider mesh networking

### Overcapacity
**Symptoms:** Slow speeds when many users connect

**Solutions:**
- Add more access points
- Implement load balancing
- Use band steering (push capable devices to 5 GHz)
- Limit per-client bandwidth

### Security Mismatch
**Symptoms:** Can't connect, authentication fails

**Cause:** Client using different security than AP

**Solution:** Match security settings (WPA2/WPA3)

### Site Survey Importance
- Professional tool for planning WiFi deployment
- Measures signal strength throughout area
- Identifies dead zones and interference
- Recommends AP placement

---

## Slide 16: IP Addressing Issues

### Teaching Focus
- Very common category of problems
- Systematic approach to diagnose

### Duplicate IP Address
**Symptoms:**
- Intermittent connectivity for both devices
- IP conflict warnings
- ARP table shows changing MAC for same IP

**Causes:**
- Static IP same as DHCP-assigned
- Two static assignments to same IP
- Rogue DHCP server

**Solution:**
- Check ARP table: `arp -a`
- Identify both devices by MAC
- Change one device's IP or remove static

### APIPA Address (169.254.x.x)
**Symptoms:** Can't reach anything except local APIPA devices

**Causes:**
- DHCP server down
- Network disconnected
- Wrong VLAN (no DHCP server there)
- DHCP pool exhausted
- DHCP relay not configured

**Troubleshooting:**
1. `ipconfig /renew` - try getting address again
2. Check physical connection
3. Verify DHCP server status
4. Check VLAN assignment
5. Check DHCP pool availability

### Wrong Subnet Mask
**Symptoms:** Can reach some local hosts but not others

**Example:**
- PC: 192.168.1.50/24
- Server: 192.168.1.200/16
- PC thinks server is on different subnet!

### Wrong Default Gateway
**Symptoms:** Can ping local network, can't reach internet

**Quick test:**
- Can ping gateway IP? If no → gateway problem
- Can ping 8.8.8.8? If no but gateway works → routing issue
- Can ping google.com? If no but 8.8.8.8 works → DNS issue

---

## Slide 17: DNS Troubleshooting

### Teaching Focus
- DNS problems often reported as "internet is down"
- Systematic testing reveals DNS vs other issues

### Identifying DNS Issues
**Key symptom:** Can reach IP addresses but not hostnames

**Test sequence:**
1. `ping 8.8.8.8` - Works? Network is fine
2. `ping google.com` - Fails? DNS problem!

### Common DNS Problems

**Wrong DNS server configured:**
- Check with `ipconfig /all`
- Try alternate: `nslookup google.com 8.8.8.8`

**DNS server unreachable:**
- Ping the DNS server IP
- Check firewall rules (UDP/TCP 53)

**Stale DNS cache:**
- `ipconfig /flushdns`
- Cached entry might be outdated

**DNS server not responding:**
- Server overloaded
- Server misconfigured
- Network issue to DNS server

### hosts File Issues
**Location:**
- Windows: `C:\Windows\System32\drivers\etc\hosts`
- Linux: `/etc/hosts`

**Problem:** Malware sometimes modifies hosts file to redirect traffic

**Check:** Look for unexpected entries

### Troubleshooting Workflow
```
1. nslookup google.com (uses default DNS)
   ↓ Fails?
2. nslookup google.com 8.8.8.8 (uses Google DNS)
   ↓ Works? → Problem is with your DNS server
   ↓ Fails? → Network issue (can't reach DNS servers)
3. ipconfig /flushdns
4. Check hosts file for malicious entries
```

---

## Slide 18: Network Performance Issues

### Teaching Focus
- Performance problems are common complaints
- Understanding metrics helps identify root cause

### Key Performance Metrics

**Latency (Delay):**
- Time for packet to travel source to destination
- Measured in milliseconds (ms)
- Affected by: distance, congestion, processing
- Check with: `ping` (shows RTT)

**Jitter:**
- Variation in latency
- Critical for real-time apps (VoIP, video)
- High jitter = choppy voice/video
- Solution: QoS, jitter buffers

**Packet Loss:**
- Percentage of packets that don't arrive
- Causes: congestion, bad cables, interference
- Check with: `ping -n 100` and look at loss %
- Even 1-2% loss noticeable in voice/video

**Throughput:**
- Actual data transfer rate achieved
- Usually less than theoretical bandwidth
- Affected by: protocol overhead, congestion, errors

**Bandwidth:**
- Maximum theoretical capacity
- "Pipe size" analogy

### Bandwidth vs Throughput
- Bandwidth: Size of the highway
- Throughput: How many cars actually get through
- Throughput always ≤ Bandwidth

### Identifying Bottlenecks
- Use pathping/mtr to find slow hops
- Check switch/router interface utilization
- Look for errors on interfaces
- Monitor with SNMP/network monitoring tools

### QoS (Quality of Service)
- Prioritizes certain traffic types
- Voice/video get priority over downloads
- Implemented on routers and switches

---

## Slide 19: OSI-Based Troubleshooting Approaches

### Teaching Focus
- Use OSI model as systematic framework
- Know when to use each approach

### Bottom-Up Approach (Layer 1 → Layer 7)

**Process:**
1. **Physical:** Check cables, lights, power
2. **Data Link:** Check MAC, switch port, VLANs
3. **Network:** Check IP, routing, gateway
4. **Transport:** Check ports, connections
5. **Session/Presentation:** Usually skip
6. **Application:** Check app settings, services

**Best for:**
- New installations
- Hardware-related issues
- Complete connectivity loss
- When you suspect physical problems

### Top-Down Approach (Layer 7 → Layer 1)

**Process:**
1. **Application:** Can app connect? Try different app
2. **Transport:** Are ports correct? Is service running?
3. **Network:** Can you ping the destination?
4. **Data Link:** Is there a link light?
5. **Physical:** Is it plugged in?

**Best for:**
- Application-specific issues
- When basic connectivity works
- User-reported application problems

### Divide and Conquer

**Process:**
1. Start at Layer 3 (Network) - `ping`
2. If ping works → problem is above (L4-L7)
3. If ping fails → problem is below (L1-L2) or at L3

**Best for:**
- Quick triage
- Unknown problem type
- Most efficient in general

### Quick Diagnostic Sequence
```
1. ping 127.0.0.1     → TCP/IP stack OK?
2. ping [own IP]      → NIC OK?
3. ping [gateway]     → Local network OK?
4. ping [remote IP]   → Routing OK?
5. ping [hostname]    → DNS OK?
```

Each failure points to different layer!

---

## Slide 20: Summary & Exam Tips

### Teaching Focus
- Consolidate key points
- Prepare students for exam format

### Essential Commands Matrix

| Purpose | Windows | Linux |
|---------|---------|-------|
| Basic connectivity | `ping` | `ping` |
| Path tracing | `tracert` | `traceroute` |
| IP config | `ipconfig` | `ip addr` / `ifconfig` |
| DNS lookup | `nslookup` | `nslookup` / `dig` |
| Connections | `netstat -an` | `netstat -tuln` / `ss` |
| ARP cache | `arp -a` | `arp -a` / `ip neigh` |
| Routing | `route print` | `ip route` |
| Path analysis | `pathping` | `mtr` |

### Exam Tips

1. **Know the 7-step methodology cold!**
   - Order matters
   - "What's the NEXT step?" questions

2. **Question the obvious FIRST**
   - Is it plugged in? Is it turned on?
   - Simple things cause most problems

3. **Know BOTH Windows and Linux commands**
   - Exam tests both platforms
   - Know equivalent commands

4. **APIPA = DHCP problem**
   - 169.254.x.x → DHCP server issue

5. **Documentation is ALWAYS last**
   - After verify, before closing ticket

6. **Escalate when needed**
   - Don't get stuck on unconfirmed theories

### Common Exam Scenarios
- "User can't access email but can browse web" → Application specific
- "User can ping IP but not hostname" → DNS issue
- "User has 169.254.x.x address" → DHCP failure
- "Users report slow network" → Check for duplex mismatch, congestion
- "Intermittent connectivity" → Bad cable, interference

### Hands-On Practice Recommendations
1. Set up a home lab
2. Practice ALL commands on both Windows and Linux
3. Intentionally break things and fix them
4. Use Packet Tracer or GNS3 for routing scenarios

---

## Lab Activity Suggestions

### Lab 1: Command-Line Tools Practice (30 min)
Have students execute all diagnostic commands:
- ping (with various options)
- tracert/traceroute
- ipconfig/ip addr
- netstat
- arp
- nslookup

### Lab 2: Troubleshooting Scenarios (45 min)
Create intentional problems for students to diagnose:
- Disconnect cable (physical layer)
- Assign wrong VLAN (data link)
- Wrong gateway (network)
- Wrong DNS server (application)

### Lab 3: Path Analysis (20 min)
- Use pathping or mtr to trace to various destinations
- Compare paths to same destination from different locations
- Identify ISP hops vs destination network hops

### Lab 4: Hardware Tools Demo (20 min)
If available, demonstrate:
- Cable tester operation
- Tone generator and probe
- Loopback plug testing

---

## Additional Resources

### Network+ Exam Objectives Covered
- 5.1: Explain the network troubleshooting methodology
- 5.2: Given a scenario, troubleshoot common cable connectivity issues
- 5.3: Given a scenario, use appropriate tools to troubleshoot network issues
- 5.4: Given a scenario, troubleshoot common wireless issues
- 5.5: Given a scenario, troubleshoot general networking issues

### Supplementary Materials
- Visualizer: `tools/troubleshooting-visualizer.html`
- Online command reference: SS64.com
- Wireshark documentation: wireshark.org/docs

### Practice Resources
- Professor Messer Network+ videos (free)
- CompTIA CertMaster Labs
- Home lab with old switches/routers

---

**Document Version:** 1.0
**Last Updated:** 2025-12-09
**Companion Presentation:** troubleshooting-presentation.html
**Estimated Teaching Time:** 60-75 minutes
