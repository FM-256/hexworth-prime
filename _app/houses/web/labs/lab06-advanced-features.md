# Lab 6: Advanced Features (Capstone Lab)

**Prepared by:** EQ6  
**Course:** Network Essentials  
**Lab Type:** Cumulative Capstone (builds on Lab 5)  
**Estimated Time:** 120-150 minutes  
**Difficulty:** Advanced  

---

## 🎉 Welcome to the Capstone Lab!

This is it - the culmination of 6 weeks of work! You've built this network from scratch, adding technologies week by week. Now we'll add the final production features to create a complete enterprise network.

---

## ⚠️ IMPORTANT: Open Your Lab 5 File

**DO NOT START A NEW FILE!**

Open your completed Lab 5 Packet Tracer file (`lab05-yourname.pkt`). This lab adds HSRP, DHCP, ACLs, and SNMP to your existing multi-protocol network.

---

## Lab Objectives

By the end of this lab, you will be able to:

1. ✅ Implement HSRP for first-hop redundancy
2. ✅ Configure DHCP server for automatic IP assignment
3. ✅ Create and apply Access Control Lists (ACLs) for security
4. ✅ Enable SNMP for network monitoring
5. ✅ Document a complete enterprise network
6. ✅ Troubleshoot complex multi-technology networks

---

## Current Network State (From Lab 5)

**Devices:** 15 total
- 1 Edge Router
- 2 Core Switches (Layer 3)
- 4 Distribution Switches (Layer 3)
- 4 Access Switches (Layer 2)
- 1 Remote Router
- 1 Remote Switch
- 12 End Devices (10 PCs + 2 Servers + 2 Remote PCs)

**Technologies Implemented:**
✅ Static Routes (Lab 1) → Replaced by dynamic routing  
✅ VLANs 10, 20, 30, 40, 50 (Labs 2 & 5)  
✅ 802.1Q Trunking (Lab 2)  
✅ STP/RSTP (Lab 3)  
✅ OSPF Multi-Area (Lab 4)  
✅ EIGRP + Redistribution (Lab 5)  

**What We're Adding Today:**
🆕 HSRP (First-Hop Redundancy)  
🆕 DHCP (Dynamic IP Assignment)  
🆕 ACLs (Security & Traffic Control)  
🆕 SNMP (Network Monitoring)  

---

## Part 1: Review Complete Network

### Step 1.1: Document Current Topology

Take 5 minutes to review your network:
- How many devices?
- Which VLANs exist?
- Which routing protocols are running where?
- How many end devices?

### Step 1.2: Verify All Routing

On **Edge-Router**:
```
show ip route
```
Expected: Should see O (OSPF), D (EIGRP), and C (Connected) routes.

On **Core-SW1**:
```
show ip route
```
Expected: Should see OSPF routes including O E2 (EIGRP redistributed).

On **Remote-Router**:
```
show ip route
```
Expected: Should see D EX (OSPF redistributed into EIGRP).

### Step 1.3: Test End-to-End Connectivity

Pick any two PCs from different VLANs and ping:
```
ping [remote-IP]
```
Expected: Success across the entire network.

If any pings fail, troubleshoot before proceeding!

---

## Part 2: Implement HSRP (First-Hop Redundancy)

### Why HSRP?

Currently, each VLAN has ONE default gateway (the SVI on a single distribution switch). If that switch fails, all devices in that VLAN lose internet/remote access. HSRP provides redundancy.

### HSRP Concept

- Two (or more) routers/switches share a virtual IP address
- One is **Active** (forwards traffic)
- One is **Standby** (ready to take over)
- If Active fails, Standby becomes Active automatically
- End devices use the virtual IP as default gateway

### Step 2.1: Plan HSRP Configuration

**VLAN 10 & 20:** Dist-SW1 (primary) and Dist-SW2 (backup)  
**VLAN 30 & 40:** Dist-SW3 (primary) and Dist-SW4 (backup)  

| VLAN | Virtual IP | Primary Switch | Standby Switch |
|------|------------|----------------|----------------|
| 10 | 192.168.10.1 | Dist-SW1 (priority 110) | Dist-SW2 (priority 100) |
| 20 | 192.168.20.1 | Dist-SW1 (priority 110) | Dist-SW2 (priority 100) |
| 30 | 192.168.30.1 | Dist-SW3 (priority 110) | Dist-SW4 (priority 100) |
| 40 | 192.168.40.1 | Dist-SW3 (priority 110) | Dist-SW4 (priority 100) |

### Step 2.2: Configure HSRP on Dist-SW1 (VLAN 10)

**Current SVI:**
```
interface Vlan10
 ip address 192.168.10.1 255.255.255.0
```

**Modify to use HSRP:**

On **Dist-SW1**:
```
configure terminal
interface Vlan10
 
 ! Change IP to .2 (physical IP)
 ip address 192.168.10.2 255.255.255.0
 
 ! Configure HSRP
 standby 10 ip 192.168.10.1
 standby 10 priority 110
 standby 10 preempt
 exit
```

**Commands explained:**
- `standby 10 ip 192.168.10.1`: Virtual IP (what PCs will use as gateway)
- `standby 10 priority 110`: Higher priority = preferred Active router (default is 100)
- `standby 10 preempt`: If this router comes back online with higher priority, it reclaims Active role

### Step 2.3: Configure HSRP on Dist-SW2 (VLAN 10)

On **Dist-SW2**:
```
configure terminal
interface Vlan10
 ip address 192.168.10.3 255.255.255.0
 
 standby 10 ip 192.168.10.1
 standby 10 priority 100
 exit
```

**Note:** No preempt on Standby (optional) - prevents unnecessary failovers.

### Step 2.4: Verify HSRP for VLAN 10

On **Dist-SW1**:
```
show standby brief
```

Expected output:
```
Interface   Grp  Pri P State    Active         Standby         Virtual IP
Vlan10      10   110 P Active   local          192.168.10.3    192.168.10.1
```

**Meaning:**
- Priority: 110
- P: Preempt enabled
- State: **Active** (this switch is forwarding)
- Standby: 192.168.10.3 (Dist-SW2)

On **Dist-SW2**:
```
show standby brief
```

Expected: State should be **Standby**.

### Step 2.5: Configure HSRP for Remaining VLANs

**VLAN 20 on Dist-SW1:**
```
interface Vlan20
 ip address 192.168.20.2 255.255.255.0
 standby 20 ip 192.168.20.1
 standby 20 priority 110
 standby 20 preempt
```

**VLAN 20 on Dist-SW2:**
```
interface Vlan20
 ip address 192.168.20.3 255.255.255.0
 standby 20 ip 192.168.20.1
 standby 20 priority 100
```

**VLAN 30 on Dist-SW3:**
```
interface Vlan30
 ip address 192.168.30.2 255.255.255.0
 standby 30 ip 192.168.30.1
 standby 30 priority 110
 standby 30 preempt
```

**VLAN 30 on Dist-SW4:**
```
interface Vlan30
 ip address 192.168.30.3 255.255.255.0
 standby 30 ip 192.168.30.1
 standby 30 priority 100
```

**VLAN 40 on Dist-SW3:**
```
interface Vlan40
 ip address 192.168.40.2 255.255.255.0
 standby 40 ip 192.168.40.1
 standby 40 priority 110
 standby 40 preempt
```

**VLAN 40 on Dist-SW4:**
```
interface Vlan40
 ip address 192.168.40.3 255.255.255.0
 standby 40 ip 192.168.40.1
 standby 40 priority 100
```

### Step 2.6: Update PC Default Gateways

**CRITICAL:** PCs must now use the **virtual IP** (.1) as default gateway, not the physical switch IPs (.2 or .3).

**All VLAN 10 PCs:** Gateway = 192.168.10.1  
**All VLAN 20 PCs:** Gateway = 192.168.20.1  
**All VLAN 30 Servers:** Gateway = 192.168.30.1  
**All VLAN 40 Devices:** Gateway = 192.168.40.1  

**Verify one PC:**
```
ipconfig /all  (Windows)
```
Should show Default Gateway as the virtual IP (.1).

### Step 2.7: Test HSRP Failover

**Simulate Active Switch Failure:**

On **Dist-SW1** (currently Active for VLANs 10 & 20):
```
configure terminal
interface Vlan10
 shutdown
```

On **Dist-SW2**:
```
show standby brief
```

Expected: VLAN 10 state should change to **Active** (took over).

From a VLAN 10 PC, ping continuously:
```
ping -t 192.168.20.10
```

**Observation:** Ping should only drop for 3-5 seconds during failover, then resume. HSRP working!

**Restore Dist-SW1:**
```
interface Vlan10
 no shutdown
```

With preempt enabled, Dist-SW1 should reclaim Active role.

---

## Part 3: Configure DHCP Server

### Why DHCP?

Currently, all PCs have static IP addresses. In production, we use DHCP for automatic IP assignment (easier management, fewer errors).

### Step 3.1: Choose DHCP Server Location

We'll configure **Edge-Router** as the DHCP server (centralized). Distribution switches will relay DHCP requests.

### Step 3.2: Create DHCP Pools on Edge-Router

On **Edge-Router**:
```
configure terminal

! Exclude gateway IPs from assignment
ip dhcp excluded-address 192.168.10.1 192.168.10.10
ip dhcp excluded-address 192.168.20.1 192.168.20.10
ip dhcp excluded-address 192.168.30.1 192.168.30.10
ip dhcp excluded-address 192.168.40.1 192.168.40.10

! DHCP Pool for VLAN 10 (Sales)
ip dhcp pool VLAN10_SALES
 network 192.168.10.0 255.255.255.0
 default-router 192.168.10.1
 dns-server 8.8.8.8 8.8.4.4
 lease 7
 exit

! DHCP Pool for VLAN 20 (Engineering)
ip dhcp pool VLAN20_ENG
 network 192.168.20.0 255.255.255.0
 default-router 192.168.20.1
 dns-server 8.8.8.8 8.8.4.4
 lease 7
 exit

! DHCP Pool for VLAN 30 (Servers)
ip dhcp pool VLAN30_SERVERS
 network 192.168.30.0 255.255.255.0
 default-router 192.168.30.1
 dns-server 8.8.8.8 8.8.4.4
 lease 7
 exit

! DHCP Pool for VLAN 40 (Management)
ip dhcp pool VLAN40_MGMT
 network 192.168.40.0 255.255.255.0
 default-router 192.168.40.1
 dns-server 8.8.8.8 8.8.4.4
 lease 7
 exit
```

**Commands explained:**
- `ip dhcp excluded-address`: Reserve IPs (gateways, servers, printers)
- `network`: Subnet for this pool
- `default-router`: Gateway (HSRP virtual IP!)
- `dns-server`: DNS servers (Google Public DNS)
- `lease 7`: 7-day lease

### Step 3.3: Configure DHCP Relay on Distribution Switches

DHCP requests are broadcasts - they don't cross routers. We need **DHCP relay** (ip helper-address) to forward DHCP requests from VLANs to the Edge-Router.

On **Dist-SW1**:
```
configure terminal
interface Vlan10
 ip helper-address 10.0.1.1
 exit

interface Vlan20
 ip helper-address 10.0.2.1
 exit
```

**Note:** Replace 10.0.1.1 with Edge-Router's IP as seen from Dist-SW1. Use the appropriate interface IP.

On **Dist-SW2**, **Dist-SW3**, **Dist-SW4**: Configure similar helper-addresses for their respective VLANs.

**Simplified approach if topology allows:**
```
ip helper-address [Edge-Router-Loopback-or-Management-IP]
```

### Step 3.4: Configure PCs to Use DHCP

**Option 1 - In Packet Tracer:**
1. Click PC
2. Go to Desktop → IP Configuration
3. Select **DHCP** (instead of Static)
4. Click "Renew" or wait for automatic assignment

**Option 2 - Windows Command:**
```
ipconfig /release
ipconfig /renew
```

### Step 3.5: Verify DHCP Assignment

On PC:
```
ipconfig /all
```

Expected:
- IP Address: 192.168.10.11 (or any IP from pool)
- Subnet Mask: 255.255.255.0
- Default Gateway: 192.168.10.1 (virtual IP)
- DNS Servers: 8.8.8.8, 8.8.4.4
- DHCP Server: [Edge-Router IP]

On **Edge-Router**:
```
show ip dhcp binding
```

Expected output:
```
IP address       Client-ID/              Lease expiration        Type
                 Hardware address
192.168.10.11    0100.50.7966.6800       Dec 09 2025 11:30 AM    Automatic
192.168.20.12    0100.50.7966.6801       Dec 09 2025 11:35 AM    Automatic
```

```
show ip dhcp pool VLAN10_SALES
```

Shows pool statistics (utilization, leases).

### Step 3.6: Test DHCP

1. Set all PCs to DHCP
2. Verify each receives correct IP from appropriate pool
3. Test connectivity after DHCP assignment
4. Verify default gateway is virtual IP (HSRP)

---

## Part 4: Implement Access Control Lists (ACLs)

### Why ACLs?

ACLs control traffic flow for security. Examples:
- Block VLAN 10 (Sales) from accessing VLAN 40 (Management)
- Allow only specific servers to be accessed from internet
- Block unwanted protocols

### Step 4.1: Plan ACL Strategy

**Security Policy:**
1. VLAN 10 (Sales) **cannot** access VLAN 40 (Management)
2. VLAN 20 (Engineering) **can** access all VLANs (they're IT staff)
3. VLAN 30 (Servers) **can** be accessed by VLANs 10, 20, 40
4. Block HTTP/HTTPS from VLAN 10 to external (example policy)

### Step 4.2: Create Standard ACL - Block VLAN 10 from VLAN 40

On **Dist-SW3** (handles VLAN 40):
```
configure terminal

! Create standard ACL
access-list 10 remark Block Sales from Management
access-list 10 deny 192.168.10.0 0.0.0.255
access-list 10 permit any

! Apply to VLAN 40 SVI (inbound)
interface Vlan40
 ip access-group 10 in
 exit
```

**Commands explained:**
- `access-list 10 deny 192.168.10.0 0.0.0.255`: Block all of VLAN 10 subnet
- `access-list 10 permit any`: Allow everything else (implicit deny if omitted)
- `ip access-group 10 in`: Apply ACL to inbound traffic on VLAN 40

**Effect:** VLAN 10 devices cannot reach VLAN 40 devices.

### Step 4.3: Create Extended ACL - Block HTTP/HTTPS from VLAN 10

On **Edge-Router**:
```
configure terminal

! Extended ACL (more specific - can specify protocol, port)
ip access-list extended BLOCK_WEB_SALES
 remark Block HTTP and HTTPS from Sales
 deny tcp 192.168.10.0 0.0.0.255 any eq 80
 deny tcp 192.168.10.0 0.0.0.255 any eq 443
 permit ip any any
 exit

! Apply outbound on internet-facing interface
interface GigabitEthernet0/0
 ip access-group BLOCK_WEB_SALES out
 exit
```

**Effect:** VLAN 10 devices cannot browse web (HTTP/HTTPS) but can still ping, SSH, etc.

### Step 4.4: Verify ACLs

**Check ACL configuration:**
```
show access-lists
```

Expected:
```
Standard IP access list 10
    10 deny 192.168.10.0, wildcard bits 0.0.0.255
    20 permit any

Extended IP access list BLOCK_WEB_SALES
    10 deny tcp 192.168.10.0 0.0.0.255 any eq www
    20 deny tcp 192.168.10.0 0.0.0.255 any eq 443
    30 permit ip any any
```

**Check where ACLs are applied:**
```
show ip interface Vlan40
```

Should show: "Inbound access list is 10"

### Step 4.5: Test ACLs

**Test 1 - VLAN 10 blocked from VLAN 40:**

From VLAN 10 PC:
```
ping 192.168.40.10
```
Expected: **Fails** (ACL blocking).

From VLAN 10 PC to VLAN 20:
```
ping 192.168.20.10
```
Expected: **Success** (ACL only blocks VLAN 40).

**Test 2 - VLAN 20 can access VLAN 40:**

From VLAN 20 PC:
```
ping 192.168.40.10
```
Expected: **Success** (ACL permits all except VLAN 10).

### Step 4.6: View ACL Hit Counters

```
show access-lists
```

Each line shows hit count:
```
10 deny 192.168.10.0 0.0.0.255 (5 matches)
20 permit any (142 matches)
```

This helps troubleshoot: "Is traffic hitting the ACL?"

---

## Part 5: Enable SNMP Monitoring

### Why SNMP?

SNMP (Simple Network Management Protocol) allows centralized monitoring:
- Monitor device status (up/down)
- Track interface statistics (errors, bandwidth)
- Receive alerts (syslog messages)
- Collect performance data

### Step 5.1: Configure SNMP on All Switches/Routers

On **Edge-Router, Core-SW1, Core-SW2, Dist-SW1-4**:
```
configure terminal

! SNMP community strings (read-only and read-write)
snmp-server community public RO
snmp-server community private RW

! SNMP location and contact
snmp-server location "Main Campus - Building A"
snmp-server contact "netadmin@company.com"

! Enable SNMP traps (alerts)
snmp-server enable traps snmp linkdown linkup
snmp-server enable traps config

! Send traps to management station (replace with actual IP)
snmp-server host 192.168.40.10 version 2c public
exit
```

**Security Note:** "public" and "private" are default community strings - **change these in production!**

### Step 5.2: Configure Syslog

On all devices:
```
configure terminal

! Send logs to syslog server
logging 192.168.40.10
logging trap informational

! Log to console (for debugging)
logging console informational
exit
```

**Logging levels:**
- 0 emergencies
- 1 alerts
- 2 critical
- 3 errors
- 4 warnings
- 5 notifications
- 6 informational
- 7 debugging

### Step 5.3: Verify SNMP Configuration

```
show snmp
```

Expected output shows:
- SNMP enabled
- Community strings configured
- Trap destinations

```
show snmp community
```

Lists community strings (public, private).

### Step 5.4: Test SNMP (if SNMP management software available)

**Using SNMP tools (snmpwalk, snmpget):**

From management PC:
```
snmpwalk -v2c -c public 192.168.10.2 system
```

Should return system information (hostname, location, contact).

**In Packet Tracer:** SNMP functionality is limited, but configuration can be verified with `show` commands.

---

## Part 6: Complete Network Verification

### Step 6.1: Routing Verification

On **Edge-Router**:
```
show ip route summary
```

Shows route counts by protocol:
- connected: X routes
- ospf: Y routes
- eigrp: Z routes

```
show ip protocols
```

Shows:
- OSPF redistributing EIGRP
- EIGRP redistributing OSPF

### Step 6.2: HSRP Verification

On all Distribution switches:
```
show standby brief
```

Verify:
- Correct priorities
- Active/Standby states correct
- Virtual IPs configured

### Step 6.3: DHCP Verification

On **Edge-Router**:
```
show ip dhcp binding
show ip dhcp pool
```

Verify:
- All VLANs have active leases
- No pool exhaustion

### Step 6.4: ACL Verification

```
show access-lists
```

Verify:
- Hit counts increasing (traffic is matching rules)
- Expected traffic being permitted/denied

### Step 6.5: SNMP Verification

```
show snmp
show logging
```

Verify:
- SNMP enabled
- Trap destinations configured
- Logging operational

### Step 6.6: End-to-End Connectivity Test Matrix

Create a test matrix and verify connectivity:

| Source | Destination | Expected Result | Actual |
|--------|-------------|-----------------|--------|
| VLAN 10 PC → VLAN 20 PC | 192.168.20.10 | Success | ✓ |
| VLAN 10 PC → VLAN 30 Server | 192.168.30.10 | Success | ✓ |
| VLAN 10 PC → VLAN 40 Device | 192.168.40.10 | **Fail (ACL)** | ✓ |
| VLAN 20 PC → VLAN 40 Device | 192.168.40.10 | Success | ✓ |
| Remote-PC → VLAN 10 PC | 192.168.10.10 | Success | ✓ |

Fill in "Actual" column with your test results.

---

## Part 7: Network Documentation

### Step 7.1: Create Network Diagram

Document your complete topology:
- Draw all 15 devices
- Show all connections
- Label VLANs
- Mark HSRP Active/Standby
- Show routing protocols (OSPF zones, EIGRP domain)

### Step 7.2: Document IP Addressing

Create a spreadsheet with:
- Device name
- Interface
- IP address
- VLAN (if applicable)
- Purpose

### Step 7.3: Document VLAN Assignments

| VLAN | Name | Subnet | HSRP VIP | Purpose |
|------|------|--------|----------|---------|
| 10 | Sales | 192.168.10.0/24 | .1 | Sales workstations |
| 20 | Engineering | 192.168.20.0/24 | .1 | IT workstations |
| 30 | Servers | 192.168.30.0/24 | .1 | Application servers |
| 40 | Management | 192.168.40.0/24 | .1 | Network management |
| 50 | Remote_Branch | 192.168.50.0/24 | N/A | Remote office |

### Step 7.4: Document ACL Policies

List all ACLs:
- ACL number/name
- Purpose
- Rules
- Applied where

### Step 7.5: Document DHCP Scopes

For each VLAN:
- Network
- Range
- Excluded addresses
- Default gateway
- DNS servers
- Lease time

---

## Part 8: Troubleshooting Scenarios (Instructor-Led)

### Scenario 1: HSRP Not Failing Over

**Symptoms:**
- Active switch fails
- Traffic stops (doesn't failover to Standby)

**Troubleshoot:**
1. `show standby` - Is Standby router seeing Active down?
2. Check HSRP timers - mismatched timers prevent failover
3. Verify both switches on same VLAN
4. Check for Layer 2 connectivity between switches

### Scenario 2: DHCP Clients Not Getting IPs

**Symptoms:**
- PC set to DHCP but shows 169.254.x.x (APIPA)

**Troubleshoot:**
1. `show ip dhcp pool` - Is pool depleted?
2. `show ip dhcp binding` - Are any leases assigned?
3. Check ip helper-address on SVI
4. Verify DHCP pool network matches VLAN subnet
5. Check if DHCP requests reaching server: `debug ip dhcp server events`

### Scenario 3: ACL Blocking Legitimate Traffic

**Symptoms:**
- Traffic that should work is blocked

**Troubleshoot:**
1. `show access-lists` - Check rule order (processed top-to-bottom!)
2. Verify ACL applied in correct direction (in vs out)
3. Remember implicit deny at end of ACL
4. Check wildcard masks (not subnet masks!)

### Scenario 4: Routes Not Redistributing

**Symptoms:**
- OSPF routes not appearing in EIGRP, or vice versa

**Troubleshoot:**
1. `show ip protocols` - Is redistribution configured?
2. Verify metric provided for EIGRP redistribution
3. Check for route filters (distribute-lists)
4. Verify "subnets" keyword in OSPF redistribution

---

## Part 9: Reflection Questions

1. **How does HSRP improve network reliability?**
   - Answer: Provides gateway redundancy. If primary fails, backup immediately takes over. Downtime reduced from hours (waiting for manual intervention) to seconds (automatic failover).

2. **What are the benefits of DHCP over static IP assignment?**
   - Answer: Centralized management, reduces human error, easier to reconfigure entire network (change one DHCP pool vs 100 static configs), automatic DNS/gateway distribution, IP address conservation (leases expire).

3. **Why place ACLs close to the source of traffic?**
   - Answer: Reduces wasted bandwidth. If traffic will be blocked anyway, block it early rather than let it traverse the network before blocking at destination.

4. **What's the difference between SNMP v2c and v3?**
   - Answer: v2c uses community strings (cleartext, insecure). v3 adds authentication, encryption, and authorization. Always use v3 in production.

5. **In your network, what happens if both Dist-SW1 and Dist-SW2 fail?**
   - Answer: VLANs 10 and 20 lose gateway redundancy. Traffic to those VLANs stops. VLANs 30 and 40 (handled by Dist-SW3/4) continue operating. This highlights importance of geographically diverse equipment.

---

## Part 10: Congratulations - You Built an Enterprise Network!

### What You've Accomplished Over 6 Labs:

**Lab 1:** Built 12-device topology with static routes
- ✅ Hierarchical design (Edge/Core/Distribution/Access)
- ✅ IP addressing scheme
- ✅ Basic inter-VLAN routing

**Lab 2:** Added VLAN segmentation
- ✅ 4 VLANs (10, 20, 30, 40)
- ✅ 802.1Q trunking
- ✅ Inter-VLAN routing with SVIs

**Lab 3:** Implemented loop prevention
- ✅ Redundant links
- ✅ RSTP configuration
- ✅ Root Bridge selection
- ✅ PortFast and BPDU Guard

**Lab 4:** Deployed dynamic routing
- ✅ Removed static routes
- ✅ Multi-area OSPF (Areas 0, 10, 20)
- ✅ Router IDs with loopbacks
- ✅ Automatic failover

**Lab 5:** Added multi-protocol support
- ✅ Remote branch with EIGRP
- ✅ Bidirectional route redistribution
- ✅ Metric conversion
- ✅ Route filtering

**Lab 6 (Today):** Completed production features
- ✅ HSRP gateway redundancy
- ✅ DHCP centralized IP management
- ✅ ACLs for security
- ✅ SNMP for monitoring

### Your Final Network Includes:

**Routing:**
- OSPF (main network)
- EIGRP (remote branch)
- Redistribution between protocols

**Switching:**
- VLANs (5 total)
- Trunking (802.1Q)
- STP/RSTP (loop prevention)

**Redundancy:**
- HSRP (gateway redundancy)
- Redundant switch links
- STP failover

**Services:**
- DHCP (IP assignment)
- DNS (configured in DHCP)

**Security:**
- ACLs (traffic filtering)
- Authentication (EIGRP, OSPF)

**Management:**
- SNMP (monitoring)
- Syslog (logging)

### This is a Production-Grade Network!

**You could deploy this in a real company.** Seriously. With some scaling and hardware, this design would serve a 200-300 person organization.

---

## Part 11: Save Your Work

```
! On ALL devices
copy running-config startup-config
```

In Packet Tracer:
**File → Save As → lab06-yourname-FINAL.pkt**

**Backup your file!** You spent 6 weeks building this. Don't lose it.

---

## Part 12: Next Steps

**What's Beyond This Course?**

1. **CCNA:** You've covered 60-70% of CCNA topics!
2. **CCNP:** Advanced routing, switching, troubleshooting
3. **Wireless:** WiFi controllers, access points, authentication
4. **Security:** Firewalls, IPS/IDS, VPNs, authentication
5. **Automation:** Python, Ansible, APIs (NetDevOps)
6. **Cloud:** AWS, Azure, GCP networking

**Real-World Application:**

Take this knowledge to:
- Help Desk → Network Technician → Network Engineer → Network Architect
- MSP (Managed Service Provider) roles
- Enterprise IT departments
- Telecom/ISP companies
- Datacenter operations

**Keep Learning:**

- Set up a home lab (used equipment is cheap!)
- Join networking communities (Reddit r/networking, Discord servers)
- Read Cisco documentation
- Practice Packet Tracer scenarios
- Study for CCNA certification

---

## Final Thoughts

**You started with a blank canvas and built a complete enterprise network from the ground up.** You learned:

- How protocols interact (OSPF, EIGRP, STP, ARP, DHCP)
- How to design for redundancy (HSRP, STP)
- How to secure networks (ACLs, VLANs)
- How to manage at scale (DHCP, SNMP)
- How to troubleshoot complex issues

**This isn't just theory - this is real-world networking.** The skills you developed in these 6 labs are directly applicable to production networks running billion-dollar businesses.

**You should be proud.** This was challenging. You persevered. You built something impressive.

---

## 🎉 **CONGRATULATIONS ON COMPLETING THE NETWORK ESSENTIALS LAB SERIES!** 🎉

**You are now a network engineer.** Go build great networks.

---

**Prepared by:** EQ6  
**Lab Series:** Network Essentials Cumulative Labs  
**Final Lab Version:** 1.0  
**Date:** 2025-12-01

**Thank you for your dedication and hard work throughout this course!**

