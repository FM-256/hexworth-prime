# DHCP - Dynamic Host Configuration Protocol - Speaker Notes

**Prepared by:** EQ6
**Subject:** Network Essentials - DHCP Protocol
**Presentation File:** dhcp-presentation.html
**Total Slides:** 18
**Estimated Teaching Time:** 60-90 minutes

---

## Overview

This presentation covers the Dynamic Host Configuration Protocol (DHCP), focusing on the DORA process that automates IP configuration for network devices. DHCP is essential for managing IP addresses in any network larger than a handful of devices.

**Prerequisites:**
- Basic understanding of IP addressing and subnetting
- Familiarity with OSI model (Layer 3 and 7)
- Understanding of broadcast vs unicast communication
- Basic knowledge of UDP

**Learning Objectives:**
By the end of this presentation, students will be able to:
1. Explain why DHCP is essential for network management
2. Describe the DORA process step-by-step
3. Configure a DHCP server on Cisco IOS
4. Implement DHCP relay agents for multi-subnet environments
5. Troubleshoot common DHCP issues
6. Implement DHCP security measures

---

## Slide 1: Title Slide

### Speaker Notes:

Welcome to our presentation on DHCP - Dynamic Host Configuration Protocol. This is one of those protocols that works so well that most people never think about it - until it breaks!

**Key Points to Emphasize:**
- DHCP is used in virtually **every network** in the world
- Without DHCP, network administrators would spend enormous time on manual IP configuration
- Understanding DHCP is critical for **troubleshooting connectivity issues**
- Essential knowledge for **CCNA**, **Network+**, and **real-world IT careers**

**Engagement:**
- Ask: "How does your laptop know what IP address to use when you connect to WiFi?"
- Ask: "Has anyone ever had their device show a 169.254.x.x address? What does that mean?"
- Ask: "What would happen if two devices on the same network had the same IP address?"

**Real-World Hook:**
"Think about a coffee shop with public WiFi. Hundreds of customers connect every day with their phones and laptops. Without DHCP, someone would have to manually configure each device. DHCP handles all of this automatically in milliseconds."

---

## Slide 2: Why DHCP Exists - The Problem It Solves

### Speaker Notes:

Before diving into how DHCP works, we need to understand WHY it exists. What problem does it solve?

**Manual IP Configuration Problems:**

**Time-Consuming:**
- Configure each device individually
- Enter IP address, subnet mask, gateway, DNS servers
- On 500 devices: ~5 minutes each = 41+ hours of work!
- Network changes require touching every device

**Error-Prone:**
- Typos in IP addresses
- Wrong subnet masks
- Duplicate IP addresses (conflicts)
- Forgotten devices with outdated configuration

**Doesn't Scale:**
- Small network: Manageable
- Enterprise with thousands of devices: Impossible
- Add mobile devices, IoT: Even worse

**No Tracking:**
- Which IPs are in use?
- Who has which IP?
- When does IP expire?
- Manual spreadsheets become outdated

**DHCP Solutions:**

**Instant Configuration:**
- Device connects, gets configured in <1 second
- No manual intervention needed
- Works for any DHCP-enabled device

**Eliminates Errors:**
- Server tracks assignments
- Prevents duplicate IPs
- Consistent configuration across all devices

**Centralized Management:**
- Change DNS server once, all devices get update at renewal
- Add new subnet, just create new scope
- One place to see all assignments

**Scalable:**
- Same DHCP server can handle thousands of devices
- Add relay agents for multi-subnet environments
- Enterprise-ready from day one

**Analogy - Hotel Key Cards:**
- Manual IP = Writing room number on paper for each guest
- DHCP = Key card system that automatically assigns rooms
- Check out (disconnect) = Room available for next guest (lease expires)

**Real Impact Calculation:**
```
Manual configuration:
- 500 devices × 5 minutes = 2,500 minutes = 41.6 hours
- DNS server change: 500 devices × 2 minutes = 16.6 hours
- Total for one network change: ~60 hours

DHCP:
- Initial setup: 15 minutes
- DNS server change: 1 minute (edit scope)
- All devices updated: Next renewal cycle (automatic)
```

**Teaching Tip:**
Ask students: "Raise your hand if you've ever manually configured an IP address on a device." Then: "Now imagine doing that 500 times. This is why DHCP exists."

---

## Slide 3: How DHCP Works - Overview

### Speaker Notes:

Now let's understand the basic architecture and what DHCP provides.

**Client-Server Architecture:**

**DHCP Client:**
- Any device that needs IP configuration
- PCs, laptops, phones, tablets, printers, IoT devices
- Routers can be clients on WAN interfaces
- Built into every modern operating system

**DHCP Server:**
- Manages pool of available IP addresses (scope)
- Responds to client requests
- Tracks active leases
- Can be:
  - Dedicated server (Windows Server, Linux ISC DHCP)
  - Router (Cisco IOS DHCP server)
  - Network appliance
  - Home router/access point

**Configuration Provided:**

**Essential Parameters:**
- **IP Address:** Unique identifier on network
- **Subnet Mask:** Defines network boundaries
- **Default Gateway:** Router for external communication
- **DNS Server(s):** Domain name resolution

**Optional Parameters:**
- **Domain Name:** Local domain suffix (company.local)
- **WINS Server:** Legacy Windows name resolution
- **NTP Server:** Time synchronization
- **TFTP Server:** Boot image location (IP phones, PXE boot)
- **Vendor-Specific Options:** Custom parameters for specific devices

**Protocol Details:**

**Layer:** Application Layer (Layer 7)
- DHCP is an application-layer protocol
- Sits on top of UDP transport

**Transport:** UDP (User Datagram Protocol)
- Why UDP? Simpler, no connection overhead
- DHCP messages are self-contained
- Works even before IP configured (broadcast)

**Ports:**
- **Server Port: UDP 67** - Server listens here
- **Client Port: UDP 68** - Client listens here
- Both ports needed in firewall rules

**Standard:** RFC 2131 (DHCP), RFC 2132 (Options)
- Original: BOOTP (RFC 951) - predecessor to DHCP
- DHCP is backwards compatible with BOOTP

**Teaching Tip:**
Draw the client-server relationship on whiteboard. Show multiple clients connecting to single server. Emphasize that server tracks which IP is assigned to which MAC address.

---

## Slide 4: DHCP Components

### Speaker Notes:

Let's break down each component of a DHCP infrastructure.

**DHCP Server:**

**Functions:**
- Maintains IP address pool (scope)
- Receives and processes DHCP requests
- Selects available IP from pool
- Records lease in database
- Sends configuration to client
- Handles lease renewals and releases

**Types of DHCP Servers:**
- **Windows Server:** DHCP Server role, integrates with Active Directory
- **Linux:** ISC DHCP daemon (dhcpd), dnsmasq
- **Cisco Router:** IOS DHCP server feature
- **Network Appliances:** F5, Infoblox, dedicated IPAM solutions
- **Home Routers:** Built-in DHCP for consumer use

**DHCP Client:**

**Functions:**
- Initiates DORA process when interface comes up
- Accepts configuration from server
- Configures local network interface
- Manages lease timers (T1, T2)
- Renews lease before expiration
- Releases IP when shutting down (ideally)

**Client Examples:**
- Windows: DHCP Client service
- Linux: dhclient, NetworkManager
- macOS: Built into network stack
- iOS/Android: Built into network stack
- Cisco Router: `ip address dhcp` on interface

**DHCP Relay Agent:**

**The Problem:**
- DHCP uses broadcast messages
- Routers don't forward broadcasts
- Without relay, need DHCP server per subnet

**The Solution:**
- Configure router interface as relay agent
- Relay converts broadcast to unicast
- Forwards to centralized DHCP server
- Inserts gateway IP (GIADDR) for scope selection

**Cisco Command:**
```
interface GigabitEthernet0/0
 ip helper-address 192.168.99.10
```

**Scope / IP Pool:**

**Definition:**
- Range of IP addresses server can assign
- Associated configuration options
- Lease duration settings
- Exclusions for static devices

**Design Considerations:**
- Pool size: How many devices expected?
- Exclusions: Reserve IPs for routers, servers, printers
- Lease time: How long should IPs be assigned?
- Options: What configuration does this subnet need?

**Teaching Tip:**
"Think of a DHCP scope like a parking lot. The pool is the total number of spaces. Exclusions are reserved spots for VIPs. The lease is how long you can park before needing to renew your ticket."

---

## Slide 5: DORA Process - Overview

### Speaker Notes:

DORA is the heart of DHCP - the four-message exchange that assigns IP addresses.

**D-O-R-A Acronym:**
- **D**iscover - Client seeks DHCP servers
- **O**ffer - Server proposes configuration
- **R**equest - Client accepts offer
- **A**cknowledge - Server confirms lease

**Why Four Messages?**

**Why not just Request/Acknowledge?**
- Client doesn't know server's IP address
- Multiple servers might exist
- Need selection mechanism

**Discovery Phase (D):**
- Client broadcasts to find all available servers
- "Is there anyone who can give me an IP?"
- Uses 255.255.255.255 (broadcast)

**Offer Phase (O):**
- Servers respond with available IP
- Multiple servers = multiple offers
- Client can choose from offers

**Request Phase (R):**
- Client broadcasts acceptance
- Specifies which server's offer accepted
- Notifies rejected servers to free their reserved IPs

**Acknowledge Phase (A):**
- Selected server confirms lease
- Client configures interface
- Other servers release reserved IPs

**Broadcast vs Unicast:**

| Message | Type | Reason |
|---------|------|--------|
| DISCOVER | Broadcast | Client has no IP, doesn't know server |
| OFFER | Broadcast or Unicast | Some clients need broadcast |
| REQUEST | Broadcast | Notify all servers of selection |
| ACK | Broadcast or Unicast | Complete the transaction |

**Why REQUEST is Broadcast:**
- Critical for multi-server environments
- Tells rejected servers: "I picked someone else, free your reserved IP"
- Prevents IP leakage in pools

**Teaching Tip:**
Use an analogy: "DORA is like apartment hunting. You ask around for available apartments (DISCOVER). Landlords show you what they have (OFFER). You pick one and tell everyone your choice (REQUEST). The chosen landlord gives you the keys (ACK)."

---

## Slide 6: DHCP Discover - Step 1

### Speaker Notes:

The DISCOVER message is the client's cry for help - "I need an IP address!"

**When DISCOVER is Sent:**
- Device boots up
- Network interface enabled
- Previous lease expired
- `ipconfig /renew` (Windows) or `dhclient` (Linux)
- Moving to new network (laptop)

**Message Details:**

**Source IP: 0.0.0.0**
- Client has no IP address yet
- All zeros is valid source for DHCP
- Special case in IP protocol

**Destination IP: 255.255.255.255**
- Limited broadcast
- All devices on local network receive
- Routers don't forward (unless relay configured)

**Source Port: UDP 68**
**Destination Port: UDP 67**

**Client MAC Address:**
- Included in packet
- Server uses this to identify client
- Essential for tracking leases

**Key Fields in DISCOVER:**

**Transaction ID (XID):**
- Random 32-bit number
- Used to match responses to requests
- Same XID used throughout DORA

**Flags Field:**
- Broadcast flag (bit 15)
- If set, server must respond via broadcast
- Some clients can't receive unicast before having IP

**Client Identifier (Option 61):**
- Usually MAC address
- Can be other identifier
- Server uses for lease tracking

**Requested IP Address (Option 50):**
- Optional
- Client can request specific IP (previous lease)
- Server may honor or ignore

**Parameter Request List (Option 55):**
- What options client wants
- Common: Subnet mask, router, DNS, domain name
- Server includes requested options in OFFER

**Broadcast Wave Animation:**
- The animation shows DISCOVER reaching all devices
- Only DHCP servers respond
- Other devices ignore DHCP messages

**What Can Go Wrong:**

**No Server Receives DISCOVER:**
- Server not on same subnet, no relay
- Server interface down
- Firewall blocking UDP 67/68

**DISCOVER Not Sent:**
- NIC disabled
- DHCP client service not running
- Static IP configured (DHCP not used)

**Demo Opportunity:**
Wireshark filter: `bootp.option.dhcp == 1` (DISCOVER)
Show the broadcast nature and packet contents.

---

## Slide 7: DHCP Offer - Step 2

### Speaker Notes:

The OFFER is the server's proposal - "Here's what I can give you."

**Server Processing:**

**Upon Receiving DISCOVER:**
1. Check if scope exists for client's network
2. Select available IP from pool
3. Mark IP as "offered" (temporarily reserved)
4. Build OFFER message with configuration
5. Send to client (broadcast or unicast)

**How Server Selects IP:**

**Priority Order:**
1. Previously assigned IP (same MAC in lease database)
2. Requested IP (Option 50) if available
3. Next available IP from pool

**Offered Configuration:**

**Your IP Address (YIADDR):**
- The IP being offered
- Goes in "Your IP" field of DHCP message

**Subnet Mask (Option 1):**
- Required for client to determine network
- Usually /24 (255.255.255.0) for typical LANs

**Default Gateway (Option 3):**
- Router IP address
- Essential for reaching other networks

**DNS Servers (Option 6):**
- One or more DNS server IPs
- Critical for name resolution

**Lease Time (Option 51):**
- How long IP is valid
- Expressed in seconds
- Example: 86400 = 24 hours

**Server Identifier (Option 54):**
- IP of server making offer
- Client uses this in REQUEST

**Multiple Offers:**

**If Multiple Servers Exist:**
- All may respond to DISCOVER
- Client receives multiple OFFERS
- Typically accepts first received
- Server Identifier distinguishes offers

**Offer Reservation:**
- Server marks offered IP as "pending"
- Prevents offering same IP to another client
- Released if client doesn't REQUEST within timeout

**Why Server Might Not Respond:**

| Reason | Solution |
|--------|----------|
| No scope for client's subnet | Create scope or configure relay |
| Pool exhausted | Expand pool or reduce lease time |
| Service disabled | Enable DHCP service |
| Interface down | Bring up interface |
| Wrong VLAN | Check network configuration |

**Teaching Tip:**
"The OFFER is like a job offer - it includes all the terms (salary, benefits, etc.) but you haven't accepted yet. You could get multiple offers and choose the best one."

---

## Slide 8: DHCP Request - Step 3

### Speaker Notes:

The REQUEST is the client's formal acceptance - "I want THIS IP from THIS server."

**Why REQUEST is Broadcast:**

**Multi-Server Notification:**
- Multiple servers may have sent OFFERs
- REQUEST broadcasts acceptance of ONE offer
- Other servers see Server Identifier, know they weren't chosen
- Those servers release their reserved IPs

**Still No IP:**
- Client hasn't configured interface yet
- Still using 0.0.0.0 as source
- Must use broadcast to ensure delivery

**Critical Fields in REQUEST:**

**Server Identifier (Option 54):**
- IP of chosen server
- Extracted from selected OFFER
- **REQUIRED** - tells all servers who was chosen

**Requested IP Address (Option 50):**
- The IP from the OFFER
- Confirming which IP client wants

**Client Identifier (Option 61):**
- Same as in DISCOVER
- Consistency for server tracking

**REQUEST Uses Beyond Initial DORA:**

**Lease Renewal (T1 Timer - 50%):**
- Client unicasts REQUEST directly to server
- "Please extend my lease"
- If server ACKs, lease renewed

**Lease Rebinding (T2 Timer - 87.5%):**
- If renewal failed, client broadcasts REQUEST
- "Anyone? Please renew my lease!"
- Any server can respond

**INIT-REBOOT:**
- Client reboots, still has lease info
- Sends REQUEST for previous IP
- Server confirms or NAKs if IP no longer valid

**Verification (DHCPINFORM):**
- Client has static IP
- Wants DHCP options (DNS, domain name, etc.)
- Server provides options without IP lease

**What Happens to Rejected Servers:**

**When Server Sees REQUEST with Different Server Identifier:**
1. "This REQUEST wasn't for me"
2. Release the IP I had reserved
3. Return IP to available pool
4. No response sent

**If Server Crashes During DORA:**
- Client times out waiting for ACK
- Restarts DISCOVER process
- Gets new server or retry with same server

**Teaching Tip:**
"The REQUEST broadcast is like announcing your college choice at a party where all the admissions officers are present. The school you chose knows to proceed, and all the others know to free up your spot."

---

## Slide 9: DHCP Acknowledge - Step 4

### Speaker Notes:

The ACK completes the transaction - "It's yours, here are the details."

**Server Processing:**

**Upon Receiving REQUEST:**
1. Verify REQUEST is for this server (Server Identifier matches)
2. Verify requested IP is still available
3. Create lease entry in database
4. Build ACK with final configuration
5. Send to client

**ACK Message Contents:**

**Your IP Address (YIADDR):**
- Confirmed IP address
- Now officially assigned

**All Configuration Options:**
- Same as OFFER (and possibly more)
- Subnet mask, gateway, DNS, domain, etc.

**Lease Times:**
- **Lease Duration (Option 51):** Total lease time
- **T1 Renewal Time (Option 58):** When to try renewal (default 50%)
- **T2 Rebinding Time (Option 59):** When to broadcast for any server (default 87.5%)

**Client Actions After ACK:**

**Interface Configuration:**
1. Set IP address on interface
2. Set subnet mask
3. Set default gateway
4. Configure DNS servers
5. Set domain suffix

**Start Timers:**
- T1 timer: Triggers unicast renewal to original server
- T2 timer: Triggers broadcast renewal to any server
- Lease expiry timer: Must stop using IP when reached

**ARP Probe (Optional):**
- Some clients send ARP for assigned IP
- Checks if anyone else using it
- If conflict detected, sends DECLINE

**Possible Negative Responses:**

**DHCP NAK (Negative Acknowledgment):**

| Reason for NAK | Client Action |
|----------------|---------------|
| Requested IP no longer available | Start DORA from DISCOVER |
| Client on wrong subnet | Release and DISCOVER |
| Lease invalid/expired | Obtain new lease |
| Pool exhausted | Retry with delay |

**When NAK is Sent:**
- Server can't fulfill request
- Client requested IP from wrong subnet
- IP was assigned to another client
- Administrative rejection

**No Response:**
- Server unreachable
- Client times out
- Retries REQUEST, then falls back to DISCOVER

**APIPA (Automatic Private IP Addressing):**
- If all DHCP attempts fail
- Windows/macOS assign 169.254.x.x
- Link-local address (no routing)
- Allows local network communication only

**Teaching Tip:**
"The ACK is like signing a lease agreement. The deal is done, you have the keys, and you know exactly how long you can stay. But you better renew before your lease expires, or you'll need to find a new place!"

---

## Slide 10: Complete DORA Animation

### Speaker Notes:

This slide provides a visual summary of the entire DORA process.

**Animation Sequence:**

**0-2 seconds: DISCOVER**
- Cyan packet leaves client
- Travels to server (and broadcasts to all)
- Status: "Client broadcasts DISCOVER..."

**2-4 seconds: OFFER**
- Green packet leaves server
- Travels to client
- Status: "Server responds with OFFER..."

**4-6 seconds: REQUEST**
- Orange packet leaves client
- Broadcasts to all (including server)
- Status: "Client broadcasts REQUEST..."

**6-8 seconds: ACK**
- Green packet leaves server
- Travels to client
- Status: "Server sends ACK - IP assigned!"

**State Machine:**

**Client States:**
- **INIT:** No IP, starting process
- **SELECTING:** Received OFFER(s), choosing
- **REQUESTING:** Sent REQUEST, waiting for ACK
- **BOUND:** Lease active, IP configured

**Timing Expectations:**

| Network Type | Typical DORA Time |
|--------------|-------------------|
| Local LAN | 50-200ms |
| With Relay Agent | 100-500ms |
| Congested Network | 200-1000ms |
| WAN Link | 500ms-2s |

**Typical Timeline (LAN):**
```
0ms:   Client sends DISCOVER
10ms:  Server receives DISCOVER
15ms:  Server sends OFFER
25ms:  Client receives OFFER
30ms:  Client sends REQUEST
40ms:  Server receives REQUEST
45ms:  Server sends ACK
55ms:  Client receives ACK
60ms:  Client configures interface
```

**Class Exercise:**
"Let's trace through a DORA exchange. I'll ask for volunteers to act out each step."

1. Student A (Client): "I need an IP!" (DISCOVER)
2. Student B (Server): "Here's 192.168.1.100" (OFFER)
3. Student A: "I'll take 192.168.1.100 from Server B" (REQUEST)
4. Student B: "Confirmed, it's yours for 24 hours" (ACK)
5. Student A: "Great, I'm configuring my interface now"

---

## Slide 11: DHCP Lease Management

### Speaker Notes:

Leases are how DHCP ensures IPs return to the pool when no longer needed.

**Why Leases?**

**Without Leases:**
- IPs assigned permanently
- Device leaves network, IP still "used"
- Pool exhaustion over time
- Manual cleanup required

**With Leases:**
- IPs assigned temporarily
- Automatic reclamation when expired
- Efficient IP reuse
- Self-cleaning system

**Lease Lifecycle:**

**Lease Start (0%):**
- ACK received
- IP configured
- All timers start

**T1 - Renewal Time (50%):**
- Default: Half of lease duration
- Client sends unicast REQUEST to original server
- If ACK received: Lease renewed, timers reset
- If no response: Continue using IP, wait for T2

**T2 - Rebinding Time (87.5%):**
- Default: 7/8 of lease duration
- T1 renewal must have failed
- Client broadcasts REQUEST to any server
- If ACK received: Lease renewed
- If no response: Continue until expiry

**Lease Expiry (100%):**
- Client MUST stop using IP
- Interface goes down or gets link-local address
- Must restart DORA process
- This is bad - indicates server problems

**Example with 24-Hour Lease:**
```
0 hours:     Lease granted
12 hours:    T1 - Attempt unicast renewal to original server
21 hours:    T2 - Attempt broadcast renewal to any server
24 hours:    Lease expires - IP must be released
```

**Why Renewal Usually Succeeds:**
- Same server typically responds
- Same IP typically renewed
- Client keeps same IP for weeks/months
- Users never notice renewals happening

**Lease Duration Guidelines:**

| Environment | Recommended Lease | Rationale |
|-------------|-------------------|-----------|
| Office (fixed devices) | 8-24 hours | Stable, predictable |
| Guest WiFi | 2-4 hours | High turnover |
| Coffee Shop | 30-60 minutes | Very high turnover |
| Data Center | 7-30 days | Stable servers |
| Home Network | 24 hours | Default, works well |
| DHCP failover | 4-8 hours | Faster failover |

**Lease Release:**

**DHCPRELEASE Message:**
- Sent when client shuts down gracefully
- Immediately frees IP
- Server removes lease from database

**Reality Check:**
- Many devices don't release properly
- Laptop lid closed = no release
- Phone leaves WiFi = no release
- Server relies on expiry for cleanup

**Teaching Tip:**
"Think of a lease like a library book. You borrow it (lease), you can renew it before it's due (T1, T2), but eventually if you don't return or renew it, the library reclaims it (expiry)."

---

## Slide 12: DHCP Scope Configuration

### Speaker Notes:

Designing DHCP scopes properly is crucial for network management.

**IP Pool Visualization:**

**Color Coding:**
- Red: Excluded (static devices)
- Yellow: Assigned (active leases)
- Green: Available (can be assigned)

**Scope Design Elements:**

**Network Address:**
- Identifies the scope's network
- Example: 192.168.1.0

**Subnet Mask:**
- Defines network size
- /24 = 254 usable hosts (most common)
- /23 = 510 usable hosts
- /25 = 126 usable hosts

**IP Range (Pool):**
- Start IP: First assignable address
- End IP: Last assignable address
- Doesn't have to be entire subnet

**Exclusions:**
- IPs not to be assigned by DHCP
- Reserve for: Routers, servers, printers, access points
- Best practice: Exclude first portion (.1-.99)

**Best Practices for Scope Design:**

**Reserve Static Range:**
```
192.168.1.1-10    : Network infrastructure (routers, switches)
192.168.1.11-20   : Servers
192.168.1.21-50   : Printers, access points
192.168.1.51-99   : Future static assignments
192.168.1.100-200 : DHCP pool
192.168.1.201-254 : Future expansion
```

**Plan for Growth:**
- Don't use 100% of available IPs
- Leave room for pool expansion
- Consider future VLANs/subnets

**Documentation:**
- Maintain IP address spreadsheet
- Document all static assignments
- Include device name, MAC, IP, purpose

**Monitor Utilization:**
- Alert at 80% pool usage
- Expand before exhaustion
- Review inactive leases periodically

**Multiple Scopes:**

**One Server, Many Scopes:**
```
Scope: VLAN10_ENGINEERING
  Network: 192.168.10.0/24
  Pool: .100-.200
  Gateway: 192.168.10.1

Scope: VLAN20_SALES
  Network: 192.168.20.0/24
  Pool: .100-.200
  Gateway: 192.168.20.1

Scope: VLAN30_GUEST
  Network: 192.168.30.0/24
  Pool: .10-.250
  Gateway: 192.168.30.1
  Lease: 2 hours (shorter for guests)
```

**Calculating Pool Size:**

**Example:**
```
Total subnet: 192.168.1.0/24 = 254 usable (.1-.254)
Static reserved: .1-.99 = 99 addresses
DHCP pool: .100-.200 = 101 addresses
Future growth: .201-.254 = 54 addresses

Utilization: 101 DHCP addresses for ~80 regular users
Buffer: 21 extra addresses (20% headroom)
```

**Common Scope Options:**

| Option | Code | Purpose |
|--------|------|---------|
| Subnet Mask | 1 | Network mask |
| Router | 3 | Default gateway |
| DNS Server | 6 | Name servers |
| Domain Name | 15 | Domain suffix |
| NTP Server | 42 | Time server |
| TFTP Server | 66 | Boot server |
| Boot File | 67 | PXE boot image |

---

## Slide 13: DHCP Relay Agent

### Speaker Notes:

Relay agents enable centralized DHCP across multiple subnets.

**The Broadcast Problem:**

**Without Relay:**
- DHCP DISCOVER is broadcast
- Routers block broadcasts (by design)
- Each subnet needs its own DHCP server
- Administrative nightmare

**With Relay:**
- Router intercepts DHCP broadcast
- Converts to unicast to DHCP server
- Server responds via router
- One server serves all subnets

**How Relay Works:**

**Step-by-Step:**

1. **Client Broadcasts DISCOVER**
   - Sent to 255.255.255.255
   - Reaches router interface (relay agent)

2. **Relay Intercepts**
   - Router configured with `ip helper-address`
   - Recognizes DHCP message (UDP 67)

3. **Adds GIADDR**
   - Relay inserts Gateway IP Address field
   - Uses IP of interface that received broadcast
   - This tells server which subnet client is on

4. **Converts to Unicast**
   - Changes destination to DHCP server IP
   - Sends as unicast packet
   - Can now be routed

5. **Server Receives**
   - Sees GIADDR field
   - Selects scope matching that network
   - Builds OFFER for that subnet

6. **Server Responds**
   - Sends OFFER to relay agent (GIADDR)
   - Relay receives on server-facing interface

7. **Relay Forwards to Client**
   - Converts back to broadcast (or unicast to client MAC)
   - Delivers to original subnet
   - Client receives OFFER

**GIADDR - The Magic Field:**

**Purpose:**
- Tells server which subnet client is on
- Server uses GIADDR to select scope
- Response is sent back to GIADDR

**Example:**
```
Client on VLAN 10: 192.168.10.0/24
Relay interface: 192.168.10.1

DISCOVER received on 192.168.10.1
GIADDR set to: 192.168.10.1
Server sees GIADDR, selects scope for 192.168.10.0/24
OFFER sent to 192.168.10.1
Relay forwards to client
```

**Cisco Configuration:**

```
interface GigabitEthernet0/0
 description "VLAN 10 - Engineering"
 ip address 192.168.10.1 255.255.255.0
 ip helper-address 192.168.99.10
 no shutdown
```

**Multiple Helper Addresses:**
```
interface GigabitEthernet0/0
 ip helper-address 192.168.99.10    ! Primary DHCP
 ip helper-address 192.168.99.11    ! Secondary DHCP
```
- Both servers receive DISCOVER
- Client gets multiple OFFERs
- Provides redundancy

**What ip helper-address Forwards:**

| Protocol | Port | Service |
|----------|------|---------|
| UDP | 67 | DHCP/BOOTP |
| UDP | 68 | DHCP/BOOTP |
| UDP | 69 | TFTP |
| UDP | 53 | DNS |
| UDP | 37 | Time |
| UDP | 49 | TACACS |
| UDP | 137-138 | NetBIOS |

**Selective Forwarding:**
```
! Forward only DHCP
interface GigabitEthernet0/0
 ip helper-address 192.168.99.10
 no ip forward-protocol udp 69   ! Disable TFTP
 no ip forward-protocol udp 53   ! Disable DNS
```

---

## Slide 14: DHCP Server Configuration - Cisco IOS

### Speaker Notes:

Let's configure a Cisco router as a DHCP server.

**Configuration Steps:**

**Step 1: Exclude Static Addresses**

```
Router(config)# ip dhcp excluded-address 192.168.1.1 192.168.1.99
```

**Why Exclude:**
- Prevents DHCP from assigning these IPs
- Reserve for routers, servers, printers
- Must be done BEFORE creating pool
- Can exclude single IP or range

**Best Practice Exclusions:**
```
! Infrastructure (routers, switches)
ip dhcp excluded-address 192.168.1.1 192.168.1.10

! Servers
ip dhcp excluded-address 192.168.1.11 192.168.1.20

! Printers and APs
ip dhcp excluded-address 192.168.1.21 192.168.1.50

! Future growth buffer
ip dhcp excluded-address 192.168.1.201 192.168.1.254
```

**Step 2: Create DHCP Pool**

```
Router(config)# ip dhcp pool LAN_POOL
Router(dhcp-config)# network 192.168.1.0 255.255.255.0
Router(dhcp-config)# default-router 192.168.1.1
Router(dhcp-config)# dns-server 8.8.8.8 8.8.4.4
Router(dhcp-config)# domain-name company.local
Router(dhcp-config)# lease 7
Router(dhcp-config)# exit
```

**Pool Parameters:**
- **network:** Network address and mask
- **default-router:** Gateway (up to 8)
- **dns-server:** DNS servers (up to 8)
- **domain-name:** Domain suffix
- **lease:** Duration (days hours minutes) or "infinite"

**Lease Time Options:**
```
lease 0 0 5       ! 5 minutes (testing)
lease 0 2         ! 2 hours (guest network)
lease 1           ! 1 day
lease 7           ! 7 days (default)
lease infinite    ! Never expires (not recommended)
```

**Step 3: Multiple Pools (Multi-Subnet)**

```
! Pool for VLAN 10
ip dhcp pool VLAN10_POOL
 network 192.168.10.0 255.255.255.0
 default-router 192.168.10.1
 dns-server 192.168.99.10
 lease 1

! Pool for VLAN 20
ip dhcp pool VLAN20_POOL
 network 192.168.20.0 255.255.255.0
 default-router 192.168.20.1
 dns-server 192.168.99.10
 lease 1
```

**Verification Commands:**

```
! View pool configuration
Router# show ip dhcp pool

! View active leases
Router# show ip dhcp binding

! View DHCP statistics
Router# show ip dhcp server statistics

! View conflicts
Router# show ip dhcp conflict

! Debug DHCP (troubleshooting)
Router# debug ip dhcp server events
```

**Clear Commands:**

```
! Clear all bindings
Router# clear ip dhcp binding *

! Clear specific binding
Router# clear ip dhcp binding 192.168.1.100

! Clear statistics
Router# clear ip dhcp server statistics

! Clear conflicts
Router# clear ip dhcp conflict *
```

**Disable/Enable Service:**

```
! Disable DHCP server
Router(config)# no service dhcp

! Enable DHCP server (default)
Router(config)# service dhcp
```

---

## Slide 15: DHCP Client Configuration

### Speaker Notes:

How to configure and verify DHCP clients on different platforms.

**Cisco Router as DHCP Client:**

**Configuration:**
```
Router(config)# interface GigabitEthernet0/0
Router(config-if)# ip address dhcp
Router(config-if)# no shutdown
```

**Verification:**
```
Router# show ip interface GigabitEthernet0/0
Router# show dhcp lease
```

**Use Case:**
- Router WAN interface connecting to ISP
- Branch router getting IP from headquarters
- Lab routers for testing

**Windows Client:**

**Verify Configuration:**
```
C:\> ipconfig /all

Ethernet adapter Ethernet:
   DHCP Enabled. . . . . . . . . . . : Yes
   IPv4 Address. . . . . . . . . . . : 192.168.1.100
   Subnet Mask . . . . . . . . . . . : 255.255.255.0
   Lease Obtained. . . . . . . . . . : Monday, December 8, 2025 8:00:00 AM
   Lease Expires . . . . . . . . . . : Tuesday, December 9, 2025 8:00:00 AM
   Default Gateway . . . . . . . . . : 192.168.1.1
   DHCP Server . . . . . . . . . . . : 192.168.1.1
   DNS Servers . . . . . . . . . . . : 8.8.8.8
```

**Release/Renew:**
```
C:\> ipconfig /release     ! Release current lease
C:\> ipconfig /renew       ! Request new lease
C:\> ipconfig /flushdns    ! Clear DNS cache
```

**Linux Client:**

**Verify Configuration:**
```
$ ip addr show eth0
$ cat /var/lib/dhcp/dhclient.leases
```

**Release/Renew:**
```
$ sudo dhclient -r eth0    ! Release
$ sudo dhclient eth0       ! Renew
```

**NetworkManager:**
```
$ nmcli connection show
$ nmcli device show eth0
$ nmcli connection down eth0 && nmcli connection up eth0
```

**macOS Client:**

**Verify:**
```
$ ifconfig en0
$ ipconfig getpacket en0    ! View DHCP packet details
```

**Renew:**
```
$ sudo ipconfig set en0 DHCP
```

**Or via System Preferences:**
Network → Advanced → TCP/IP → Renew DHCP Lease

**Troubleshooting Client Issues:**

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| 169.254.x.x address | No DHCP server response | Check server, cable, VLAN |
| Wrong subnet | Wrong scope or rogue server | Verify scope, enable snooping |
| Can't renew | Server unreachable | Check server, routing |
| Slow renewal | Server overloaded | Check server health |

---

## Slide 16: Common DHCP Issues & Troubleshooting

### Speaker Notes:

Systematic troubleshooting is essential for DHCP issues.

**Problem 1: No IP Address Assigned (APIPA)**

**Symptoms:**
- Client shows 169.254.x.x address
- No network connectivity
- Can't ping gateway

**Diagnostic Steps:**

1. **Check Physical Connectivity**
   - Cable connected?
   - Switch port active (link light)?
   - NIC enabled in OS?

2. **Check DHCP Client**
   - DHCP enabled on interface?
   - DHCP client service running?

3. **Check Network Path**
   - Client on correct VLAN?
   - VLAN allowed on trunk?
   - Relay agent configured?

4. **Check DHCP Server**
   - Server reachable?
   - Service running?
   - Pool available?

**Commands:**
```
! Client side (Windows)
ipconfig /all
ipconfig /release
ipconfig /renew

! Server side (Cisco)
show ip dhcp pool
show ip dhcp binding
show ip dhcp server statistics
debug ip dhcp server events
```

**Problem 2: Wrong Configuration**

**Symptoms:**
- Client gets IP but wrong gateway/DNS
- Can't reach external networks
- DNS resolution fails

**Likely Causes:**
- Scope misconfigured
- Client on wrong VLAN (getting IP from wrong scope)
- Rogue DHCP server

**Diagnostic Steps:**

1. **Identify DHCP Server**
   ```
   ipconfig /all | find "DHCP Server"
   ```
   - Is this your server's IP?
   - Unknown IP = rogue server

2. **Verify Scope Settings**
   ```
   show ip dhcp pool [name]
   ```
   - Gateway correct?
   - DNS servers correct?

3. **Check VLAN Membership**
   - Client should be on intended VLAN
   - Verify switch port configuration

**Problem 3: Duplicate IP Addresses**

**Symptoms:**
- "IP address conflict" errors
- Intermittent connectivity
- Two devices with same IP

**Likely Causes:**
- Static IP in DHCP range (not excluded)
- Two DHCP servers with overlapping scopes
- Rogue DHCP server
- Stale lease (device changed network but lease active)

**Resolution:**

1. **Identify Conflicting Devices**
   ```
   show ip dhcp conflict
   arp -a (from router)
   ```

2. **Add Exclusions**
   ```
   ip dhcp excluded-address 192.168.1.50
   ```

3. **Clear Binding**
   ```
   clear ip dhcp binding 192.168.1.50
   ```

4. **Implement DHCP Snooping**
   - Prevents rogue servers

**Problem 4: Pool Exhaustion**

**Symptoms:**
- New devices can't get IP
- Existing devices stop working at renewal
- APIPA addresses appearing

**Diagnostic:**
```
show ip dhcp pool
! Look for "Leased addresses" vs "Total addresses"
```

**Resolution:**
- Expand pool range
- Reduce lease time
- Clean up stale leases
- Add another scope

**Troubleshooting Flowchart:**

```
Client has 169.254.x.x?
├── Yes → Check cable/port
│         └── OK → Check VLAN
│                  └── OK → Check relay (if cross-subnet)
│                           └── OK → Check server health
│                                    └── OK → Check pool availability
└── No → Check if IP is from correct scope
         ├── No → Check VLAN membership / rogue server
         └── Yes → Configuration issue in scope
```

---

## Slide 17: DHCP Security Considerations

### Speaker Notes:

DHCP has security vulnerabilities that must be addressed.

**Threat 1: Rogue DHCP Servers**

**Attack Scenario:**
- Attacker plugs in their own DHCP server
- Responds faster than legitimate server
- Provides malicious configuration
- Gateway points to attacker's machine
- DNS points to attacker's server

**Impact:**
- Man-in-the-middle attacks
- Traffic interception
- Credential theft
- DNS hijacking
- Malware distribution

**Real-World Example:**
"Employee brings personal router from home, plugs into corporate network. Router's DHCP server starts answering requests. Suddenly, half the floor can't reach the internet because they're getting 192.168.0.x addresses and trying to use that router as gateway."

**Mitigation: DHCP Snooping**

```
! Enable globally
Switch(config)# ip dhcp snooping
Switch(config)# ip dhcp snooping vlan 10,20,30

! Mark legitimate DHCP server ports as trusted
Switch(config)# interface GigabitEthernet0/1
Switch(config-if)# ip dhcp snooping trust

! All other ports are untrusted by default
! DHCP server messages (OFFER, ACK) blocked on untrusted ports
```

**How It Works:**
- Untrusted ports: Only DISCOVER/REQUEST allowed
- Trusted ports: Server messages (OFFER/ACK) allowed
- Rogue server on untrusted port = OFFER blocked

**Threat 2: DHCP Starvation Attack**

**Attack Scenario:**
- Attacker sends thousands of DISCOVER messages
- Each with different spoofed MAC address
- Server assigns IP to each "client"
- Pool exhausted
- Legitimate clients can't get IP

**Impact:**
- Denial of Service
- Network unavailability
- Paired with rogue DHCP for more damage

**Mitigation: Rate Limiting + Port Security**

```
! Limit DHCP packets per port
Switch(config)# interface range GigabitEthernet0/2 - 48
Switch(config-if-range)# ip dhcp snooping limit rate 10

! Limit MAC addresses per port
Switch(config-if-range)# switchport port-security
Switch(config-if-range)# switchport port-security maximum 2
Switch(config-if-range)# switchport port-security violation restrict
```

**DHCP Snooping Binding Database:**

**What It Tracks:**
- MAC address
- IP address
- Lease time
- VLAN
- Interface

**Why It Matters:**
- Enables Dynamic ARP Inspection (DAI)
- Enables IP Source Guard
- Validates ARP and IP traffic against known bindings

```
Switch# show ip dhcp snooping binding

MacAddress          IpAddress        Lease(sec)  Type           VLAN  Interface
------------------  ---------------  ----------  -------------  ----  ----------
00:50:56:A3:E2:3A   192.168.1.100    86400       dhcp-snooping  10    Gi0/5
00:50:56:A3:F4:7B   192.168.1.101    86400       dhcp-snooping  10    Gi0/6
```

**Best Practices Summary:**

| Measure | Purpose | Implementation |
|---------|---------|----------------|
| DHCP Snooping | Block rogue servers | Enable on all VLANs |
| Trust Only Uplinks | Allow server messages only from legitimate sources | Trust uplink ports only |
| Rate Limiting | Prevent starvation | 10-15 pps on access ports |
| Port Security | Limit MACs | Max 1-3 per port |
| Monitoring | Detect attacks | Log DHCP events, alert on anomalies |

---

## Slide 18: Summary & Lab 6 Integration

### Speaker Notes:

Let's wrap up with key takeaways and practical application.

**Core DHCP Concepts:**

1. **DHCP Automates IP Configuration**
   - Eliminates manual setup
   - Reduces errors
   - Scales to thousands of devices

2. **DORA Process**
   - Discover → Offer → Request → Acknowledge
   - Four messages establish IP assignment
   - Broadcast enables server discovery

3. **Lease-Based Addressing**
   - IPs assigned temporarily
   - T1 (50%) = Renewal attempt
   - T2 (87.5%) = Rebind attempt
   - Expiry = Must release IP

4. **Components**
   - Server: Manages pool and leases
   - Client: Requests configuration
   - Relay: Forwards across subnets
   - Scope: Pool of available IPs

5. **Relay Agent Essential for Multi-Subnet**
   - Broadcasts don't cross routers
   - ip helper-address converts to unicast
   - GIADDR identifies client's subnet

6. **Security Requires DHCP Snooping**
   - Rogue servers are real threat
   - Trust only known server ports
   - Rate limit to prevent starvation

**Configuration Quick Reference:**

**DHCP Server:**
```
ip dhcp excluded-address 192.168.1.1 192.168.1.99
ip dhcp pool LAN_POOL
 network 192.168.1.0 255.255.255.0
 default-router 192.168.1.1
 dns-server 8.8.8.8
 lease 7
```

**DHCP Relay:**
```
interface GigabitEthernet0/0
 ip helper-address 192.168.99.10
```

**DHCP Snooping:**
```
ip dhcp snooping
ip dhcp snooping vlan 10,20
interface GigabitEthernet0/1
 ip dhcp snooping trust
```

**Verification:**
```
show ip dhcp pool
show ip dhcp binding
show ip dhcp server statistics
show ip dhcp snooping binding
```

**Lab Integration:**

**Packet Tracer Lite v3.0 DHCP Feature:**
- Visual DORA process animation
- Color-coded messages
- Server configuration interface
- Lease tracking

**Lab 6 Tasks:**
1. Configure DHCP server with exclusions
2. Create pool with gateway, DNS, lease
3. Test client lease acquisition
4. Monitor bindings and statistics
5. Configure relay agent (if multi-subnet)

**Certification Exam Tips:**

**For CCNA/Network+:**
- Memorize DORA order
- Know ports: Server UDP 67, Client UDP 68
- Understand lease timers (T1=50%, T2=87.5%)
- Know relay agent purpose and configuration
- Understand DHCP snooping protection

**Common Exam Questions:**
- "Client shows 169.254.x.x address. What's wrong?"
- "How do you prevent rogue DHCP servers?"
- "What happens at 50% of lease time?"
- "Why is REQUEST broadcast instead of unicast?"

**Final Questions:**
- Any areas that need clarification?
- Ready to configure DHCP in the lab?
- Questions about security considerations?

---

## Appendix: Quick Reference

### DORA Process Summary
```
1. DISCOVER: Client → Broadcast (255.255.255.255)
   "I need an IP address!"

2. OFFER: Server → Client
   "Here's 192.168.1.100 with gateway, DNS, lease"

3. REQUEST: Client → Broadcast
   "I'll take 192.168.1.100 from server 192.168.1.1"

4. ACK: Server → Client
   "Confirmed. IP is yours for 24 hours."
```

### DHCP Message Types

| Type | Code | Direction | Purpose |
|------|------|-----------|---------|
| DISCOVER | 1 | Client→Server | Find DHCP servers |
| OFFER | 2 | Server→Client | Propose configuration |
| REQUEST | 3 | Client→Server | Accept offer / Renew |
| DECLINE | 4 | Client→Server | IP conflict detected |
| ACK | 5 | Server→Client | Confirm lease |
| NAK | 6 | Server→Client | Deny request |
| RELEASE | 7 | Client→Server | Return IP to pool |
| INFORM | 8 | Client→Server | Request options only |

### Common DHCP Options

| Option | Code | Purpose |
|--------|------|---------|
| Subnet Mask | 1 | Network mask |
| Router | 3 | Default gateway |
| DNS Server | 6 | Name servers |
| Domain Name | 15 | Domain suffix |
| Lease Time | 51 | Duration of lease |
| Server ID | 54 | DHCP server IP |
| T1 | 58 | Renewal time |
| T2 | 59 | Rebind time |

### Troubleshooting Commands

```bash
# Windows
ipconfig /all
ipconfig /release
ipconfig /renew

# Linux
ip addr show
dhclient -r eth0
dhclient eth0
cat /var/lib/dhcp/dhclient.leases

# Cisco Router
show ip dhcp pool
show ip dhcp binding
show ip dhcp server statistics
show ip dhcp conflict
debug ip dhcp server events
clear ip dhcp binding *
```

### Lease Timeline (24-hour example)

```
Hour 0:   Lease starts
Hour 12:  T1 - Unicast renewal to original server
Hour 21:  T2 - Broadcast renewal to any server
Hour 24:  Expiry - Must stop using IP
```

---

## End of Speaker Notes

**Document Version:** 1.0
**Created:** December 2025
**Total Pages:** ~70
**Aligned Slides:** 18

**Feedback:** Report issues or suggestions to course administrator.
