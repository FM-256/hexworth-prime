# NAT/PAT Presentation - Speaker Notes

**Prepared by:** EQ6
**Subject:** Network Essentials - Network Address Translation
**Presentation File:** nat-presentation.html

---

## Slide 1: Title Slide - NAT / PAT - Network Address Translation

### Speaker Notes:

Welcome to our presentation on NAT and PAT - Network Address Translation and Port Address Translation. This is one of the most widely deployed technologies in networking today, and you use it every single day without realizing it.

**Key Points to Emphasize:**
- NAT/PAT is everywhere - your home router, corporate networks, cloud environments
- It's the technology that kept IPv4 alive despite address exhaustion
- Understanding NAT is critical for network administration, troubleshooting, and security
- Essential for CCNA certification and real-world networking careers

**Opening Engagement:**
- Ask: "How many of you have a WiFi router at home?"
- Follow-up: "Do you know how many public IP addresses your home router has?"
- Reveal: "Typically just ONE public IP, but it lets all your devices (phones, laptops, tablets, smart TVs, gaming consoles) access the internet simultaneously. That's NAT/PAT!"

**Set the Stage:**
- Today we'll answer: Why does NAT exist? How does it work? What are the different types?
- We'll cover theory, configuration, troubleshooting, and real-world applications
- By the end, you'll understand the technology that makes modern internet connectivity possible

**Historical Context:**
- Early internet: Assumption that every device would have unique public IP
- Reality: IPv4 provides only ~4.3 billion addresses
- Problem: More devices than addresses (smartphones, IoT, servers, etc.)
- Solution: NAT allows thousands of private addresses to share a few public addresses

**Why This Matters:**
- **Career Skills:** Every network engineer must understand NAT configuration and troubleshooting
- **Certifications:** CCNA dedicates significant coverage to NAT/PAT
- **Real World:** You'll configure NAT on routers, firewalls, and cloud gateways
- **Security:** NAT provides basic security through obscurity (though not true security)

**Learning Objectives Preview:**
By the end of this presentation, you will:
1. Understand why NAT exists and the IPv4 exhaustion problem
2. Explain NAT terminology (inside local, inside global, outside local, outside global)
3. Differentiate between Static NAT, Dynamic NAT, and PAT
4. Configure basic NAT/PAT on Cisco routers
5. Troubleshoot common NAT problems
6. Recognize NAT limitations and workarounds

**Presentation Flow:**
- First: WHY NAT exists (the problem it solves)
- Second: HOW NAT works (terminology and translation process)
- Third: TYPES of NAT (Static, Dynamic, PAT)
- Fourth: CONFIGURATION (hands-on Cisco commands)
- Fifth: TROUBLESHOOTING (real-world problem solving)

**Instructor Tip:**
- NAT terminology confuses students at first (inside local vs inside global)
- Use consistent analogies throughout (apartment building metaphor works well)
- Emphasize PAT is what students actually use every day
- Draw diagrams on whiteboard as you explain - visual learning is critical

---

## Slide 2: Why NAT Exists - The IPv4 Exhaustion Crisis

### Speaker Notes:

NAT wasn't part of the original internet design. It was created out of necessity when we realized we were running out of IPv4 addresses.

**The IPv4 Address Space:**

**Total IPv4 Addresses:**
- IPv4 uses 32-bit addressing: 2^32 = 4,294,967,296 addresses
- Sounds like a lot, but it's not enough!

**Why 4.3 Billion Isn't Enough:**
- World population: 8+ billion people
- Average person owns multiple internet-connected devices
  - Smartphone
  - Laptop/Desktop
  - Tablet
  - Smart TV
  - Gaming console
  - Smart home devices (thermostat, cameras, lights, appliances)
  - Wearables (smartwatch, fitness tracker)
- Total internet-connected devices: 30+ billion globally
- Corporate servers, cloud infrastructure, IoT sensors add billions more

**Historical Timeline:**

**1980s - Early Internet:**
- Small network of universities and research institutions
- IPv4 seemed infinite
- Wasteful allocation: MIT got 16 million addresses (entire Class A network)
- No concept of address conservation

**1990s - First Warnings:**
- Internet commercialization and rapid growth
- IANA (Internet Assigned Numbers Authority) recognizes depletion risk
- RFC 1918 published (1994): Defines private address ranges
- NAT proposed as temporary solution

**2000s - Growing Concern:**
- IPv4 allocation rate accelerates
- Emerging markets (China, India, Brazil) connecting billions of users
- Mobile internet explosion (smartphones, tablets)
- Cloud computing creates massive server farms

**2011 - IANA Exhaustion:**
- February 3, 2011: IANA allocates last remaining IPv4 /8 blocks to Regional Internet Registries
- This is "IPv4 exhaustion day"
- No more new IPv4 addresses available from central authority

**2011-Present - Regional Exhaustion:**
- APNIC (Asia-Pacific): Exhausted 2011
- RIPE NCC (Europe): Exhausted 2012
- LACNIC (Latin America): Exhausted 2014
- ARIN (North America): Exhausted 2015
- AFRINIC (Africa): Severely restricted

**Current Reality:**
- No new IPv4 addresses available
- IPv4 addresses are bought/sold on secondary markets
- Price: $20-$50 per IPv4 address
- Organizations desperately need NAT to conserve addresses

**Without NAT, What Would Happen?**

**Scenario 1: Company with 5,000 employees**
- Without NAT: Need 5,000+ public IPv4 addresses
- Cost: $100,000 - $250,000 just for IP addresses!
- Availability: Can't obtain that many addresses anymore
- With NAT: Need as few as 1-10 public addresses
- Cost savings: $99,000+

**Scenario 2: Home internet user**
- Without NAT: Each device needs separate public IP and separate ISP connection
- Cost: $50/month × number of devices
- 10 devices = $500/month for internet!
- With NAT: One connection, one IP, all devices share
- Cost: $50/month total

**Scenario 3: Mobile carrier**
- Without NAT: Each phone needs unique public IP
- 10 million customers = 10 million IPv4 addresses (impossible to obtain)
- With Carrier-Grade NAT (CGN): Share much smaller pool
- This is why mobile carriers use multiple layers of NAT

**IPv6 - The Long-Term Solution:**

**Why IPv6 Exists:**
- 128-bit addressing: 340 undecillion addresses (340,282,366,920,938,463,463,374,607,431,768,211,456)
- Enough to assign 100+ addresses to every atom on Earth's surface
- Eliminates need for NAT

**Why We Still Use NAT (IPv6 Adoption Challenges):**
- **Legacy Equipment:** Billions of IPv4-only devices in use
- **Application Support:** Some apps don't support IPv6
- **Training:** Network staff trained on IPv4/NAT
- **Investment:** Organizations already invested in IPv4 infrastructure
- **Dual Stack:** Most networks run both IPv4 and IPv6 (transition takes decades)

**Current IPv6 Adoption:**
- Google reports ~40% of users access via IPv6
- Major cloud providers support IPv6 (AWS, Azure, GCP)
- But NAT will remain critical for next 10-20 years

**NAT Benefits Beyond Address Conservation:**

**Security Through Obscurity:**
- Internal IP addresses hidden from internet
- Attackers don't know internal network structure
- Note: This is NOT real security! Just obscurity

**Flexibility:**
- Change ISP without renumbering internal network
- Internal addressing scheme independent of public addressing
- Merge networks with overlapping address spaces (not recommended, but possible)

**Cost Savings:**
- Dramatically reduces public IP address requirements
- Lowers ISP costs
- Enables internet-scale growth despite IPv4 limits

**Teaching Analogy:**

**NAT is like a corporate receptionist:**
- Company has ONE public phone number (public IP)
- Internally, 500 employees have extensions (private IPs)
- Receptionist maintains directory (NAT table)
- External caller dials main number → receptionist translates → routes to correct extension
- Internal caller dials out → receptionist assigns main number as caller ID
- Outside world only sees one phone number, but company has 500 internal numbers

**Discussion Questions:**
- "Why didn't IPv4 designers allocate more than 32 bits originally?"
  - Answer: 4 billion seemed infinite in 1981, storage/memory was expensive
- "If IPv6 solves the problem, why are we learning NAT?"
  - Answer: Legacy infrastructure, IPv4 will coexist with IPv6 for decades
- "Does NAT provide real security?"
  - Answer: No! Obscurity isn't security. Still need firewalls, ACLs, etc.

**Real-World Statistic:**
- An enterprise firewall performing NAT/PAT can handle 50,000+ simultaneous NAT translations
- Home routers typically handle 4,000-8,000 translations
- Your home router right now probably has 50-200 active NAT entries

**Key Takeaway:**
NAT exists because we ran out of IPv4 addresses. It's a workaround that became essential infrastructure. Understanding NAT is understanding modern internet architecture.

---

## Slide 3: Private vs Public IP Addresses (RFC 1918)

### Speaker Notes:

For NAT to work, we need two types of IP addresses: private addresses (used internally) and public addresses (routable on internet). RFC 1918 defines the private address ranges.

**RFC 1918 - Address Allocation for Private Internets:**

**Published:** February 1994
**Title:** "Address Allocation for Private Internets"
**Purpose:** Define IP address ranges reserved for private networks
**Key Principle:** These addresses will NEVER be routed on the public internet

**The Three Private Address Ranges:**

**1. Class A Private Range: 10.0.0.0/8**

**Range:** 10.0.0.0 - 10.255.255.255
**Subnet Mask:** 255.0.0.0
**Total Addresses:** 16,777,216 addresses

**Best Use Cases:**
- Large enterprises with thousands of employees
- Mega data centers
- Cloud providers (AWS VPC, Azure VNet commonly use 10.x.x.x)
- Organizations that need extensive subnetting

**Example Deployment:**
```
Company Headquarters: 10.0.0.0/16 (65,536 addresses)
Branch Office 1:      10.1.0.0/16 (65,536 addresses)
Branch Office 2:      10.2.0.0/16 (65,536 addresses)
Data Center:          10.100.0.0/16 (65,536 addresses)
Remote Workers VPN:   10.200.0.0/16 (65,536 addresses)
```

**Real World:**
- AWS default VPC: 172.31.0.0/16 (but customers often choose 10.x)
- Google Cloud: Uses 10.x heavily for internal networks
- Microsoft Azure: Supports 10.x for virtual networks

**2. Class B Private Range: 172.16.0.0/12**

**Range:** 172.16.0.0 - 172.31.255.255
**Subnet Mask:** 255.240.0.0 (note: /12, not /16!)
**Total Addresses:** 1,048,576 addresses

**Common Mistake:**
Students often think this is 172.16.0.0/16, but it's actually /12!
- 172.16.0.0/12 includes: 172.16.0.0 through 172.31.255.255
- That's 16 Class B networks (172.16, 172.17, 172.18... 172.31)

**Best Use Cases:**
- Medium-sized enterprises
- Cloud environments (AWS default VPC uses 172.31.0.0/16)
- College/university campuses
- Organizations wanting to avoid conflicts with home networks (which typically use 192.168.x.x)

**Example Deployment:**
```
Corporate HQ:       172.16.0.0/16 (65,536 addresses)
Manufacturing Site: 172.17.0.0/16 (65,536 addresses)
Research Facility:  172.18.0.0/16 (65,536 addresses)
```

**Why this range exists:**
- Class A (10.x) too big for many organizations
- Class C (192.168.x) too small for medium enterprises
- 172.16.0.0/12 is the "Goldilocks zone" - just right

**3. Class C Private Range: 192.168.0.0/16**

**Range:** 192.168.0.0 - 192.168.255.255
**Subnet Mask:** 255.255.0.0
**Total Addresses:** 65,536 addresses

**Best Use Cases:**
- Home networks (by far most common!)
- Small businesses (< 50 employees)
- Branch offices
- Individual departments

**Example Deployment:**
```
Home Router Default: 192.168.1.0/24 (254 usable addresses)
Small Office:        192.168.10.0/24 (254 usable addresses)
```

**Why it's popular for home routers:**
- Easy to remember and type
- Sufficient for home devices (typical home has 10-20 devices)
- Industry convention (nearly all consumer routers default to 192.168.x.x)

**Common Home Router Defaults:**
- Linksys/Cisco: 192.168.1.1
- Netgear: 192.168.1.1 or 192.168.0.1
- TP-Link: 192.168.0.1
- ASUS: 192.168.1.1
- D-Link: 192.168.0.1

**Public IP Addresses:**

**Definition:** Routable on the public internet
**Allocation:** Assigned by Internet Service Providers (ISPs)
**Source:** ISPs receive allocations from Regional Internet Registries (RIRs)

**What Addresses are Public?**
- Everything EXCEPT:
  - 10.0.0.0/8 (private)
  - 172.16.0.0/12 (private)
  - 192.168.0.0/16 (private)
  - 127.0.0.0/8 (loopback)
  - 169.254.0.0/16 (link-local/APIPA)
  - 224.0.0.0/4 (multicast)
  - 240.0.0.0/4 (reserved)

**Examples of Public IPs:**
- 8.8.8.8 (Google DNS)
- 1.1.1.1 (Cloudflare DNS)
- 142.251.46.238 (google.com - example, changes frequently)
- Your home router's WAN interface IP (check at whatismyip.com)

**Key Differences: Private vs Public:**

**Private IP Addresses:**
- FREE to use (no cost, no registration)
- Not routable on internet (internet routers drop private IP packets)
- Can be reused by multiple organizations (every home can use 192.168.1.0/24)
- Must use NAT to access internet
- No uniqueness guarantee across different networks

**Public IP Addresses:**
- COST money (purchased/leased from ISP)
- Globally routable (reachable from anywhere on internet)
- Must be globally unique (only one organization can use 8.8.8.8)
- Directly accessible from internet (if firewall allows)
- Assigned by authority (IANA → RIR → ISP → Customer)

**NAT's Role - Bridging Private and Public:**

**The Problem NAT Solves:**
```
Private Device (192.168.1.100) → Internet Server (8.8.8.8)
```
- Private IP cannot route on internet
- Return traffic has no way back (8.8.8.8 doesn't know how to reach 192.168.1.100)

**NAT Solution:**
```
1. Device sends packet: Source 192.168.1.100 → Destination 8.8.8.8
2. NAT router translates: Source 203.0.113.50 (public) → Destination 8.8.8.8
3. Server responds: Source 8.8.8.8 → Destination 203.0.113.50
4. NAT router translates back: Source 8.8.8.8 → Destination 192.168.1.100
```

**Why Can't Private IPs Route on Internet?**

**Internet routers are configured to drop private IP packets:**
- Prevents routing confusion (millions of networks use 192.168.1.0/24)
- Security (prevents accidental exposure of internal networks)
- RFC 1918 compliance (universal agreement not to route these)

**Real-World Example:**
```
Trace route to 8.8.8.8 from home computer:
1. 192.168.1.1 (default gateway - home router) - PRIVATE
2. 10.50.100.1 (ISP internal router) - PRIVATE (ISP's network)
3. 203.0.113.1 (ISP edge router) - PUBLIC
4. 198.51.100.1 (internet backbone) - PUBLIC
5. 8.8.8.8 (Google DNS) - PUBLIC
```

**Notice:** Private IPs only exist inside trusted networks

**Common Student Confusion:**

**Myth:** "My device has IP 192.168.1.5, so that's my internet address"
**Reality:** That's your PRIVATE address. Your public address is your router's WAN IP (check whatismyip.com)

**Myth:** "If I use 10.x.x.x, no one else can use those addresses"
**Reality:** MILLIONS of networks use 10.x.x.x simultaneously. That's the point!

**Myth:** "Private addresses are more secure than public addresses"
**Reality:** Security comes from firewalls, not address type. Private IPs just aren't routable.

**Demonstration Activity:**

**Activity 1: Find Your Private IP**
- Windows: `ipconfig` (look for IPv4 Address)
- Mac/Linux: `ifconfig` or `ip addr`
- Likely result: 192.168.x.x or 10.x.x.x

**Activity 2: Find Your Public IP**
- Visit: whatismyip.com, ifconfig.me, or icanhazip.com
- This is your router's public IP (after NAT)
- Note: Private IP ≠ Public IP

**Activity 3: Compare Private IPs**
- Have students share their private IPs
- Many will have same address (192.168.1.x is common)
- This proves private IPs are reusable

**RFC 1918 Deployment Best Practices:**

**Choose the Right Range:**
- **Home/Small Office:** 192.168.0.0/16 (traditional, easy)
- **Medium Enterprise:** 172.16.0.0/12 (avoids conflicts with home networks)
- **Large Enterprise/Cloud:** 10.0.0.0/8 (maximum flexibility)

**Avoid Conflicts:**
- If employees VPN from home (192.168.1.x), use different corporate range
- Don't use 192.168.1.0/24 for corporate network (conflicts with home routers)
- Consider using 10.x or 172.16.x for corporate to avoid home network overlap

**Subnetting Best Practice:**
- Don't use entire private range flat
- Subnet appropriately for departments, locations, VLANs
- Leave room for growth

**Security Note:**
- Private addressing alone does NOT provide security
- Still need firewalls, access control lists (ACLs), authentication
- "Security through obscurity" is not real security

**IPv6 and Private Addresses:**

**IPv6 Approach:**
- No RFC 1918 equivalent (IPv6 has enough addresses for everyone)
- Unique Local Addresses (ULA): fc00::/7 (similar concept, rarely used)
- Global Unicast Addresses: Every device can have public IPv6 address
- NAT mostly unnecessary in IPv6 (controversial - some still use NAT66)

**The Debate:**
- Purists: "IPv6 restores end-to-end connectivity, NAT breaks internet design"
- Pragmatists: "NAT provides topology hiding and simplified renumbering"
- Reality: Most IPv6 networks don't use NAT, but some do (NPTv6)

**Key Takeaway:**
RFC 1918 defines three private IP ranges (10.x, 172.16.x, 192.168.x) that are free to use internally but not routable on the internet. NAT bridges the gap between private internal networks and the public internet. This division is fundamental to modern networking.

---

## Slide 4: NAT Terminology - Inside Local, Inside Global, Outside Local, Outside Global

### Speaker Notes:

This is THE most confusing part of NAT for students. The terminology is counterintuitive, but it's crucial for understanding NAT configuration and troubleshooting. We'll break it down systematically.

**Why NAT Terminology Is Confusing:**
- Terms are relative to the NAT router's perspective
- "Inside" and "Outside" refer to where the address is, not whether it's private/public
- "Local" and "Global" refer to how the address appears, not where it exists
- Cisco uses this terminology in configuration and show commands

**The Four NAT Address Types:**

**1. Inside Local (IL) Address**

**Definition:** The PRIVATE IP address assigned to a host on the inside (internal) network

**"Inside" means:** On the internal/private side of NAT router
**"Local" means:** Address as it appears locally (on your network)

**Characteristics:**
- Almost always an RFC 1918 private address
- 192.168.1.10, 10.5.50.100, 172.16.5.20
- Address configured on the device itself
- What the device "thinks" its address is
- Not routable on internet

**Real-World Examples:**
- Your laptop's IP: 192.168.1.100
- Desktop computer: 10.0.5.25
- Internal web server: 172.16.10.50
- Smartphone on WiFi: 192.168.1.150

**Analogy:**
- Inside Local = Your apartment number (3B) inside the building
- Only meaningful within your building
- Outside world doesn't know about apartment 3B

**2. Inside Global (IG) Address**

**Definition:** The PUBLIC IP address that represents the inside host to the outside world

**"Inside" means:** Still represents an inside host (but translated)
**"Global" means:** Globally routable public address

**Characteristics:**
- Always a public routable IP address
- Assigned by ISP or owned by organization
- What outside world sees as source of traffic
- The "translated" address after NAT
- Multiple inside local addresses can map to same inside global (PAT)

**Real-World Examples:**
- Your home router's WAN IP: 203.0.113.50
- Corporate firewall's public IP: 198.51.100.10
- What appears in server logs when you browse: 203.0.113.50

**Analogy:**
- Inside Global = The building's street address (123 Main St)
- What postal service sees
- All mail from building uses this address
- Outside world doesn't know about individual apartments

**3. Outside Global (OG) Address**

**Definition:** The PUBLIC IP address of an external host as assigned by owner

**"Outside" means:** On the external/internet side of NAT router
**"Global" means:** The real, globally routable address

**Characteristics:**
- Public internet addresses
- Address as it truly exists on internet
- What DNS resolves to
- Typically NOT translated by your NAT router (unless doing special configurations)

**Real-World Examples:**
- google.com: 142.251.46.238 (example, actual IP varies)
- DNS server: 8.8.8.8
- Web server you're accessing: 93.184.216.34
- Any server on internet

**Analogy:**
- Outside Global = Address of store you're mailing to (456 Oak Ave)
- Real address of destination
- No translation needed

**4. Outside Local (OL) Address**

**Definition:** The address of an external host as it appears to inside network

**"Outside" means:** External host
**"Local" means:** How it appears locally (from inside perspective)

**Characteristics:**
- Usually same as Outside Global (in simple NAT)
- Different from Outside Global in special scenarios:
  - Overlapping address spaces
  - External NAT (NAT of external addresses)
  - Carrier-grade NAT scenarios
- Rarely used in basic NAT configurations

**When Outside Local ≠ Outside Global:**
- Organization uses same private range as external company
- Example: You use 192.168.1.0/24, partner company also uses 192.168.1.0/24
- NAT translates their addresses to avoid conflict
- Advanced scenario (uncommon)

**Analogy:**
- Outside Local = How you refer to the store ("The corner store")
- Usually same as real address, but sometimes you use nickname
- Most people use real address (Outside Global = Outside Local)

**The Perspective That Matters: NAT Router's View:**

**Think Like the NAT Router:**
- **Inside = Internal network (your network)**
- **Outside = External network (internet)**
- **Local = Address before translation (original)**
- **Global = Address after translation (translated)**

**Visualization:**

```
[Inside Local]         [NAT Router]         [Outside Global]
192.168.1.10    →→→    Translation    →→→   8.8.8.8
 (Private IP)            Table             (Public server)
      ↓                     ↓                     ↓
 Inside Global         Mapping stored      Outside Local
 203.0.113.50         IL ↔ IG              8.8.8.8
 (Public IP)          Entry created        (Same as OG)
```

**Translation Flow Example:**

**Outbound Traffic (Inside → Outside):**
```
1. PC sends packet:
   Source: 192.168.1.10 (Inside Local)
   Destination: 8.8.8.8 (Outside Global)

2. Packet reaches NAT router:
   Router consults NAT table
   Creates/finds mapping: 192.168.1.10 ↔ 203.0.113.50

3. Router translates and forwards:
   Source: 203.0.113.50 (Inside Global) ← TRANSLATED
   Destination: 8.8.8.8 (Outside Local, same as OG)
```

**Return Traffic (Outside → Inside):**
```
1. Server responds:
   Source: 8.8.8.8 (Outside Global)
   Destination: 203.0.113.50 (Inside Global)

2. Packet reaches NAT router:
   Router looks up: 203.0.113.50 in NAT table
   Finds mapping: 203.0.113.50 ↔ 192.168.1.10

3. Router translates and forwards:
   Source: 8.8.8.8 (Outside Local, same as OG)
   Destination: 192.168.1.10 (Inside Local) ← TRANSLATED
```

**Memory Trick - The Quadrant Method:**

```
                 INSIDE  |  OUTSIDE
              -----------|----------
LOCAL (Before) |   IL   |    OL
GLOBAL (After) |   IG   |    OG
```

**Remember:**
- **Inside** = Your network
- **Outside** = Internet
- **Local** = Original address (before NAT)
- **Global** = Translated address (after NAT, public)

**Common Student Mistakes:**

**Mistake 1:** Thinking "Local" means private and "Global" means public
**Reality:** It's about perspective and translation, not private vs public
**Example:** Inside Global (IG) is public, but "Inside" refers to internal host

**Mistake 2:** Confusing Inside Global with Outside Global
**Inside Global:** Your organization's public IP (NAT router's WAN IP)
**Outside Global:** Internet server's public IP (google.com, etc.)

**Mistake 3:** Thinking Outside Local matters in simple NAT
**Reality:** In 95% of scenarios, Outside Local = Outside Global (same address)
**Only different in:** Overlapping address spaces or double NAT

**Teaching Technique - The Apartment Building:**

**Analogy Breakdown:**
- **Building:** Your internal network
- **Apartments:** Individual devices (3A, 3B, 3C)
- **Street Address:** Single public IP
- **Postal Service:** Internet

**Mapping to NAT:**
- **Inside Local:** Apartment number (3B)
- **Inside Global:** Street address (123 Main St)
- **Outside Global:** Destination address (456 Oak Ave)
- **Outside Local:** Usually same (456 Oak Ave)

**How Mail Works (NAT Process):**
1. Resident in 3B writes letter (Inside Local = 3B)
2. Puts return address as building address (Inside Global = 123 Main St)
3. Mails to store (Outside Global = 456 Oak Ave)
4. Store responds to 123 Main St (Inside Global)
5. Building's mail room checks directory: "123 Main St for 3B"
6. Delivers to apartment 3B (Inside Local)

**Cisco CLI and NAT Terminology:**

**When you see these terms in commands:**
```
ip nat inside source static 192.168.1.10 203.0.113.50
                            ↑               ↑
                      Inside Local    Inside Global
```

**In show commands:**
```
Router# show ip nat translations

Pro  Inside global      Inside local       Outside local      Outside global
tcp  203.0.113.50:1025  192.168.1.10:1025  8.8.8.8:53        8.8.8.8:53
     ↑ Public IP        ↑ Private IP       ↑ Server IP        ↑ Same as OL
     (Your router)      (Your PC)          (DNS server)       (DNS server)
```

**Practice Exercise:**

**Scenario:** Home network accessing google.com

Given:
- Your PC IP: 192.168.1.25
- Your router's WAN IP: 203.0.113.75
- Google's IP: 142.251.46.238

**Question:** Identify each NAT address type

**Answer:**
- Inside Local: 192.168.1.25 (PC's private IP)
- Inside Global: 203.0.113.75 (router's public IP)
- Outside Global: 142.251.46.238 (Google's real IP)
- Outside Local: 142.251.46.238 (same as OG in simple NAT)

**Advanced Scenario - Outside Local Different:**

**Setup:**
- Your company network: 192.168.10.0/24
- Partner company ALSO uses: 192.168.10.0/24
- Conflict! Can't route to them

**Solution - Translate their addresses:**
- Their server: 192.168.10.50 (actual)
- You translate to: 10.5.5.50 (locally)
- Outside Global: 192.168.10.50 (their real address)
- Outside Local: 10.5.5.50 (how you see them)

**This is rare but possible!**

**Why This Terminology Exists:**

**Historical Reason:**
- Cisco defined this in 1990s
- Needed consistent terminology across products
- Became industry standard (unfortunately)

**Practical Reason:**
- Precisely describes translation at each step
- Essential for troubleshooting
- Appears in all NAT show commands
- Required for CCNA exam

**Student Activity - Label the Diagram:**

**Exercise:**
Draw network diagram on board with PC, router, internet server
Have students label:
1. Inside Local address
2. Inside Global address
3. Outside Global address
4. Outside Local address

**Check understanding with questions:**
- "Which address is on your PC?" (Inside Local)
- "Which address does Google see?" (Inside Global)
- "Which address is Google's?" (Outside Global)
- "Which addresses are routable on internet?" (IG and OG)

**Key Takeaway:**
- Inside Local (IL): Private IP on your device
- Inside Global (IG): Public IP representing your device
- Outside Global (OG): Real IP of internet server
- Outside Local (OL): Usually same as OG (rarely different)

Master this terminology and NAT configuration becomes much easier!

---

## Slide 5: NAT Terminology - The Translation Process

### Speaker Notes:

Now that we understand the four address types, let's see them in action during an actual NAT translation process. This slide shows the step-by-step packet transformation as it passes through the NAT router.

**The Complete NAT Translation Process:**

**Scenario Setup:**
- Inside host: 192.168.1.10 (Inside Local)
- NAT router inside interface: 192.168.1.1
- NAT router outside interface: 203.0.113.50 (Inside Global)
- Destination server: 8.8.8.8 (Outside Global/Outside Local)
- Protocol: DNS query (UDP port 53)

**Step 1: Packet Leaves Inside Host**

**Initial Packet (Before NAT):**
```
IP Header:
  Source IP: 192.168.1.10 (Inside Local)
  Destination IP: 8.8.8.8 (Outside Global)

UDP Header:
  Source Port: 54321 (random ephemeral port)
  Destination Port: 53 (DNS)

Payload:
  DNS Query for "google.com"
```

**What Happens:**
- PC generates DNS query
- Source address: PC's own IP (192.168.1.10)
- Destination: Google DNS (8.8.8.8)
- Sends to default gateway (192.168.1.1 - NAT router)

**At this point:** No translation yet. Packet contains private source IP.

**Step 2: Packet Arrives at NAT Router Inside Interface**

**NAT Router Receives Packet:**
- Packet arrives on inside interface (Gi0/0)
- Router checks: Is this interface marked `ip nat inside`? YES
- Router checks: Does destination need NAT? (Is traffic going outside?) YES
- Router decision: TRANSLATE this packet

**Step 3: NAT Table Lookup**

**Router Checks NAT Table:**
```
Current NAT Table:
Pro  Inside global      Inside local       Outside local      Outside global
tcp  203.0.113.50:4456  192.168.1.11:4456  93.184.216.34:80  93.184.216.34:80
tcp  203.0.113.50:5567  192.168.1.15:5567  142.250.80.46:443 142.250.80.46:443
```

**Question:** Does 192.168.1.10:54321 have existing mapping?
**Answer:** NO - this is new traffic

**Step 4: Create NAT Table Entry**

**Router Creates New Entry:**
- Selects available Inside Global: 203.0.113.50
- Selects available port: 1025 (first available from dynamic pool)
- Creates mapping: 192.168.1.10:54321 ↔ 203.0.113.50:1025
- Adds to translation table
- Sets timeout (typically 5 minutes for UDP)

**Updated NAT Table:**
```
Pro  Inside global      Inside local       Outside local      Outside global
udp  203.0.113.50:1025  192.168.1.10:54321 8.8.8.8:53        8.8.8.8:53       ← NEW
tcp  203.0.113.50:4456  192.168.1.11:4456  93.184.216.34:80  93.184.216.34:80
tcp  203.0.113.50:5567  192.168.1.15:5567  142.250.80.46:443 142.250.80.46:443
```

**Step 5: Translate Outbound Packet**

**NAT Router Modifies Packet:**

**BEFORE NAT (Inside Network):**
```
Source IP: 192.168.1.10 (Inside Local)
Source Port: 54321
Destination IP: 8.8.8.8
Destination Port: 53
```

**AFTER NAT (Outside Network):**
```
Source IP: 203.0.113.50 (Inside Global) ← CHANGED
Source Port: 1025 ← CHANGED (PAT)
Destination IP: 8.8.8.8 (no change)
Destination Port: 53 (no change)
```

**Important Details:**
- Source IP translated from private to public
- Source port changed (PAT - Port Address Translation)
- IP checksum recalculated (changed IP means new checksum)
- TCP/UDP checksum recalculated (changed IP/port means new checksum)
- Destination unchanged (server address stays the same)

**Step 6: Forward to Internet**

**Router Sends Packet:**
- Looks up routing table for 8.8.8.8
- Forwards out WAN interface (Serial0/0 or Gi0/1)
- Packet traverses internet with public source IP

**From Internet's Perspective:**
- Packet came from: 203.0.113.50:1025
- No knowledge of 192.168.1.10 (private IP hidden)
- Server thinks it's talking directly to 203.0.113.50

**Step 7: Server Responds**

**Google DNS Server (8.8.8.8) Processes Query:**
- Receives query for "google.com"
- Looks up IP address: 142.251.46.238
- Creates response packet
- Sends response to source: 203.0.113.50:1025

**Return Packet (From Server):**
```
Source IP: 8.8.8.8 (Outside Global)
Source Port: 53
Destination IP: 203.0.113.50 (Inside Global) ← Router's public IP
Destination Port: 1025 ← Port in NAT table
```

**Step 8: Return Packet Arrives at NAT Router**

**NAT Router Receives Response:**
- Packet arrives on outside interface (Serial0/0)
- Router checks: Is this interface marked `ip nat outside`? YES
- Router checks destination: 203.0.113.50:1025 (router's own IP + port)
- Router realizes: This needs reverse NAT translation

**Step 9: NAT Table Lookup (Reverse)**

**Router Searches NAT Table:**
```
Looking for: Inside Global = 203.0.113.50:1025

Found entry:
Pro  Inside global      Inside local       Outside local      Outside global
udp  203.0.113.50:1025  192.168.1.10:54321 8.8.8.8:53        8.8.8.8:53
     ↑ Match found!     ↑ Translate to this
```

**Step 10: Translate Inbound Packet**

**NAT Router Modifies Packet:**

**BEFORE NAT (From Internet):**
```
Source IP: 8.8.8.8
Source Port: 53
Destination IP: 203.0.113.50 (Inside Global)
Destination Port: 1025
```

**AFTER NAT (To Inside Network):**
```
Source IP: 8.8.8.8 (no change)
Source Port: 53 (no change)
Destination IP: 192.168.1.10 (Inside Local) ← CHANGED
Destination Port: 54321 ← CHANGED
```

**Step 11: Deliver to Inside Host**

**Router Forwards Packet:**
- Looks up routing table for 192.168.1.10
- Connected network on Gi0/0 (inside interface)
- Sends packet to 192.168.1.10
- Uses ARP if needed to find MAC address

**Step 12: Inside Host Receives Response**

**PC (192.168.1.10) Receives Packet:**
- Sees DNS response from 8.8.8.8
- Destination port 54321 matches original query
- TCP/IP stack associates response with DNS query
- Application receives IP address for google.com

**From PC's Perspective:**
- Sent query from 192.168.1.10:54321
- Received response to 192.168.1.10:54321
- Appears as direct communication with 8.8.8.8
- **PC has NO IDEA NAT happened!**

**Complete Flow Diagram:**

```
[PC 192.168.1.10]           [NAT Router]              [Server 8.8.8.8]
      |                          |                           |
      | Src: 192.168.1.10:54321  |                           |
      | Dst: 8.8.8.8:53          |                           |
      |------------------------→ |                           |
      |                          | Create NAT entry          |
      |                          | 192.168.1.10:54321 ↔     |
      |                          | 203.0.113.50:1025         |
      |                          |                           |
      |                          | Src: 203.0.113.50:1025   |
      |                          | Dst: 8.8.8.8:53           |
      |                          |-------------------------→ |
      |                          |                           | Process query
      |                          | Src: 8.8.8.8:53           |
      |                          | Dst: 203.0.113.50:1025   |
      |                          | ←-------------------------|
      |                          | Lookup NAT entry          |
      |                          | 203.0.113.50:1025 →      |
      | Src: 8.8.8.8:53          | 192.168.1.10:54321        |
      | Dst: 192.168.1.10:54321  |                           |
      | ←------------------------|                           |
      | Receive response         |                           |
```

**Key Observations:**

**1. NAT is Stateful:**
- Router remembers outbound connection (creates state)
- Uses state to translate return traffic
- Stateful firewall behavior (only allows responses to initiated connections)

**2. Transparent to Endpoints:**
- PC thinks it's talking directly to 8.8.8.8
- Server thinks it's talking to 203.0.113.50
- Neither knows about translation

**3. Port Translation (PAT):**
- Not just IP address changed
- Port also translated (54321 → 1025)
- Allows multiple inside hosts to share one public IP

**4. Checksum Recalculation:**
- IP checksum recalculated (IP header changed)
- TCP/UDP checksum recalculated (pseudo-header includes IP)
- Router must do this correctly or packets dropped

**NAT Table Entry Lifecycle:**

**Entry Creation:**
- First packet from inside to outside creates entry
- Entry contains 5-tuple: Protocol, IL, IG, OL, OG

**Entry Maintenance:**
- Timer reset with each packet matching entry
- UDP timeout: 5 minutes default
- TCP timeout: 24 hours default (for established)
- ICMP timeout: 60 seconds default

**Entry Deletion:**
- Timeout expires with no traffic
- TCP FIN/RST packets (graceful/forced close)
- Manual clearing: `clear ip nat translation`
- Router reload

**Multiple Simultaneous Connections:**

**Example: Three PCs browsing internet:**
```
NAT Table with multiple entries:

Pro  Inside global      Inside local       Outside local      Outside global
tcp  203.0.113.50:1025  192.168.1.10:5001  93.184.216.34:80  93.184.216.34:80
tcp  203.0.113.50:1026  192.168.1.11:5002  93.184.216.34:80  93.184.216.34:80
tcp  203.0.113.50:1027  192.168.1.12:5003  93.184.216.34:80  93.184.216.34:80
     ↑ Same public IP    ↑ Different PCs    ↑ Same website
     ↑ Different ports   ↑ Different ports  ↑ Same port
```

**How router distinguishes:**
- Return traffic to 203.0.113.50:1025 → goes to 192.168.1.10
- Return traffic to 203.0.113.50:1026 → goes to 192.168.1.11
- Return traffic to 203.0.113.50:1027 → goes to 192.168.1.12
- Port number is the key!

**Packet-Level Details:**

**IP Header Fields Modified:**
- Source Address (outbound) / Destination Address (inbound)
- IP Checksum (recalculated)
- TTL (decremented as normal routing)

**TCP/UDP Header Fields Modified:**
- Source Port (outbound) / Destination Port (inbound) - in PAT
- TCP/UDP Checksum (recalculated - includes pseudo-header with IPs)

**Fields NOT Modified:**
- IP Protocol field (TCP/UDP/ICMP)
- TCP Flags (SYN, ACK, FIN, etc.)
- Sequence/Acknowledgment numbers
- Application layer data (payload)

**Wireshark Demonstration:**

**What students should see:**

**Capture on Inside Network:**
```
Source: 192.168.1.10
Destination: 8.8.8.8
```

**Capture on Outside Network (WAN):**
```
Source: 203.0.113.50 ← Translated!
Destination: 8.8.8.8
```

**Compare two captures to see NAT in action**

**Common Issues During Translation:**

**Problem 1: NAT Table Full**
- Limited number of port numbers (65,535)
- Heavy usage exhausts table
- New connections fail
- Solution: Multiple public IPs, larger pool

**Problem 2: ALG Issues**
- Some protocols embed IPs in payload (FTP, SIP, H.323)
- NAT only translates headers, not payload
- Application Layer Gateway (ALG) needed
- Cisco: `ip nat service` for specific protocols

**Problem 3: Asymmetric Routing**
- Return traffic takes different path
- Doesn't reach NAT router
- Connection fails (state not found)
- Solution: Ensure symmetric routing

**Teaching Analogy - The Translator:**

**NAT Router as Language Translator:**
- Inside hosts speak "Private IP language"
- Internet speaks "Public IP language"
- NAT router translates between languages
- Both sides think they're speaking directly
- Translator keeps notes (translation table)

**Student Activity:**

**Hands-On Exercise:**
1. Capture packets on PC (before NAT)
2. Capture packets on router WAN (after NAT)
3. Compare source IPs
4. Check `show ip nat translations` on router
5. Verify entry matches both captures

**Key Takeaway:**
NAT translation happens transparently at the router. Outbound traffic: private→public translation. Inbound traffic: public→private translation. The NAT table maintains state, allowing return traffic to find the correct inside host. Neither endpoint knows translation occurred.

---

## Slide 6: The NAT Translation Table - Dynamic Mapping Storage

### Speaker Notes:

The NAT translation table is the heart of NAT functionality. It's a dynamic database that tracks all active translations, allowing the router to correctly translate bidirectional traffic.

**What is the NAT Translation Table?**

**Definition:** In-memory database on NAT router that stores active address/port mappings

**Purpose:**
- Track which inside local addresses map to which inside global addresses
- Remember port translations (for PAT)
- Associate outside destinations with inside sources
- Enable stateful translation (match return traffic to outbound connections)

**Storage Location:**
- RAM (volatile memory)
- Lost on router reload unless saved
- Dynamic entries (most common) expire automatically
- Static entries persist until manually removed

**NAT Table Entry Components:**

**Each entry contains five key elements (5-tuple):**

**1. Protocol**
- TCP, UDP, ICMP, or other
- Matters because ports are protocol-specific
- TCP port 80 ≠ UDP port 80 (different protocols, different entries)

**2. Inside Local Address:Port**
- Private IP of inside host
- Source port from original packet
- Example: 192.168.1.10:54321

**3. Inside Global Address:Port**
- Public IP representing inside host
- Translated port number
- Example: 203.0.113.50:1025

**4. Outside Local Address:Port**
- Destination address as seen from inside
- Usually same as Outside Global
- Example: 8.8.8.8:53

**5. Outside Global Address:Port**
- Real destination address
- Internet server's actual IP:port
- Example: 8.8.8.8:53

**Example NAT Table:**

```
Router# show ip nat translations

Pro  Inside global      Inside local       Outside local      Outside global
tcp  203.0.113.50:1025  192.168.1.10:5001  93.184.216.34:80  93.184.216.34:80
tcp  203.0.113.50:1026  192.168.1.10:5002  142.250.80.46:443 142.250.80.46:443
udp  203.0.113.50:1027  192.168.1.11:5500  8.8.8.8:53        8.8.8.8:53
tcp  203.0.113.50:1028  192.168.1.12:6000  13.107.42.14:443  13.107.42.14:443
icmp 203.0.113.50:512   192.168.1.15:512   8.8.8.8:512       8.8.8.8:512
---  203.0.113.51       192.168.1.20       ---               ---
```

**Reading This Output:**

**Line 1 Explanation:**
```
tcp  203.0.113.50:1025  192.168.1.10:5001  93.184.216.34:80  93.184.216.34:80
```
- Protocol: TCP
- Inside host: 192.168.1.10 using source port 5001
- Translated to: 203.0.113.50:1025 (public IP + new port)
- Destination: 93.184.216.34 port 80 (HTTP server)
- This is PC browsing a website

**Line 6 Special Case:**
```
---  203.0.113.51       192.168.1.20       ---               ---
```
- No protocol (---): This is Static NAT entry
- No ports: Static NAT doesn't translate ports
- Always active: Doesn't expire
- 192.168.1.20 ALWAYS maps to 203.0.113.51

**Entry Types:**

**1. Dynamic PAT Entries (Most Common)**
```
tcp  203.0.113.50:1025  192.168.1.10:5001  93.184.216.34:80  93.184.216.34:80
     ↑ Includes port    ↑ Includes port
```
- Created automatically when traffic initiated
- Include port numbers
- Expire after timeout
- Typical for user internet browsing

**2. Static NAT Entries**
```
---  203.0.113.51       192.168.1.20       ---               ---
     ↑ No protocol      ↑ No ports         ↑ No outside info
```
- Manually configured
- Permanent (no timeout)
- No port translation
- Used for servers needing consistent public IP

**3. Dynamic NAT Entries (Less Common)**
```
---  203.0.113.52       192.168.1.25       ---               ---
```
- Looks like static but temporary
- Allocated from pool
- Expires when connection closes
- No port translation (one-to-one)

**NAT Table Operations:**

**Entry Creation:**

**Trigger:** First outbound packet from inside host

**Process:**
1. Packet arrives from inside network
2. Router checks: Is inside interface marked `ip nat inside`? YES
3. Router checks: Is destination outside? YES
4. Router checks: Does source already have mapping? NO
5. Router allocates Inside Global address (and port if PAT)
6. Router creates table entry with 5-tuple
7. Router sets timeout timer
8. Router translates and forwards packet

**Entry Lookup (Outbound):**
```
Incoming packet: Source 192.168.1.10:5001 → Destination 8.8.8.8:53
Router searches for: Inside Local = 192.168.1.10:5001
Found entry: Translate to Inside Global 203.0.113.50:1025
Forward with new source: 203.0.113.50:1025
```

**Entry Lookup (Inbound):**
```
Incoming packet: Source 8.8.8.8:53 → Destination 203.0.113.50:1025
Router searches for: Inside Global = 203.0.113.50:1025
Found entry: Translate to Inside Local 192.168.1.10:5001
Forward with new destination: 192.168.1.10:5001
```

**Entry Refresh:**
- Each packet matching entry resets timeout timer
- Keeps active connections alive
- UDP: 5 minutes idle timeout
- TCP: 24 hours idle timeout (established connections)
- ICMP: 60 seconds timeout

**Entry Deletion:**

**Automatic Deletion:**
- Timeout expires (no traffic for duration)
- TCP connection closes (FIN or RST)
- Router resources exhausted (oldest entries purged)

**Manual Deletion:**
```
Router# clear ip nat translation *              ! Clear all dynamic entries
Router# clear ip nat translation inside 192.168.1.10  ! Clear specific host
Router# clear ip nat translation tcp inside 192.168.1.10 5001  ! Specific connection
```

**NAT Table Limits:**

**Maximum Entries:**
- Depends on router model and memory
- Small routers: 2,000-4,000 translations
- Medium routers: 10,000-50,000 translations
- High-end routers: 1,000,000+ translations

**Check Current Usage:**
```
Router# show ip nat statistics

Total active translations: 234 (2 static, 232 dynamic; 232 extended)
Outside interfaces:
  Serial0/0/0
Inside interfaces:
  GigabitEthernet0/0
Hits: 45678  Misses: 12  CEF Translated packets: 45678, CEF Punted packets: 0
Expired translations: 1234
Dynamic mappings:
-- Inside Source
[Id: 1] access-list 1 pool MYPOOL refcount 232
 pool MYPOOL: netmask 255.255.255.0
        start 203.0.113.50 end 203.0.113.50
        type generic, total addresses 1, allocated 1 (100%), misses 0
```

**Port Allocation:**

**PAT Port Selection:**
- Router tries to preserve original source port if available
- If original port in use, selects next available port
- Cisco typically starts at port 1024 and counts up
- Port range: 1024-65535 (well-known ports 0-1023 avoided)

**Port Exhaustion:**
- Single public IP: Maximum ~64,000 simultaneous connections
- Formula: (65535 - 1024) = 64,511 available ports
- Reality: Effective limit ~60,000 due to overhead
- Heavy NAT usage can exhaust ports

**Example - Port Allocation:**
```
First connection:
  Inside: 192.168.1.10:5000 → Outside: 203.0.113.50:5000 (preserved)

Second connection from same IP:
  Inside: 192.168.1.10:5001 → Outside: 203.0.113.50:5001 (preserved)

Conflict (port 5000 already used):
  Inside: 192.168.1.11:5000 → Outside: 203.0.113.50:1024 (changed!)
  Can't use 5000 again, selects 1024 (first available)
```

**NAT Table and Security:**

**Stateful Firewall Behavior:**
- Only allows return traffic for existing entries
- Unsolicited inbound traffic dropped (no matching entry)
- Provides basic security (not real firewall!)

**Example - Blocked Traffic:**
```
Hacker tries to connect to 203.0.113.50:8080
Router checks NAT table: No entry for destination 203.0.113.50:8080
Result: Packet dropped (no translation possible)
```

**Example - Allowed Traffic:**
```
User initiates connection: 192.168.1.10 → 93.184.216.34:80
NAT table entry created: 203.0.113.50:1025 ↔ 192.168.1.10:5001
Server responds: 93.184.216.34:80 → 203.0.113.50:1025
Router checks NAT table: Entry found!
Result: Translated and forwarded to 192.168.1.10:5001
```

**Viewing NAT Table in Real-Time:**

**Commands:**

**Show all translations:**
```
Router# show ip nat translations
```

**Show verbose (includes timers):**
```
Router# show ip nat translations verbose

Pro  Inside global      Inside local       Outside local      Outside global
tcp  203.0.113.50:1025  192.168.1.10:5001  93.184.216.34:80  93.184.216.34:80
  create 00:00:05, use 00:00:02, timeout 24:00:00
  ↑ Created 5s ago    ↑ Last used 2s ago  ↑ Expires in 24 hours
```

**Show specific inside address:**
```
Router# show ip nat translations inside 192.168.1.10
```

**Show statistics:**
```
Router# show ip nat statistics
```

**Monitor in real-time:**
```
Router# debug ip nat
```
**Warning:** Debug can overwhelm router! Use sparingly.

**NAT Table Troubleshooting:**

**Problem 1: Table Full**

**Symptoms:**
- New connections fail
- Error messages: "Allocation failed"
- `show ip nat statistics` shows high allocation

**Diagnosis:**
```
Router# show ip nat statistics
Total active translations: 64000 (0 static, 64000 dynamic)
...
Dynamic mappings:
  pool MYPOOL: allocated 1 (100%), misses 4567 ← PROBLEM!
```

**Solutions:**
- Add more public IPs to pool
- Reduce timeouts (aggressive aging)
- Clear stale entries: `clear ip nat translation *`
- Upgrade to router with more memory

**Problem 2: Entry Not Created**

**Symptoms:**
- Outbound traffic fails
- No entry appears in NAT table

**Common Causes:**
- Interface not marked `ip nat inside` or `ip nat outside`
- ACL doesn't match traffic
- No available addresses in pool
- Routing problem (packet never reaches NAT router)

**Diagnosis:**
```
Router# show ip nat translations
! Empty or missing expected entry

Router# show ip interface brief
! Check interface status

Router# show running-config | include ip nat
! Verify NAT configuration
```

**Problem 3: Wrong Translation**

**Symptoms:**
- Packet translated to wrong address
- Multiple entries for same inside host

**Example:**
```
tcp  203.0.113.50:1025  192.168.1.10:5000  8.8.8.8:53         8.8.8.8:53
tcp  203.0.113.51:5000  192.168.1.10:5000  93.184.216.34:80  93.184.216.34:80
     ↑ Different IP!    ↑ Same inside host
```

**Cause:** Multiple NAT rules match traffic (overlapping config)

**NAT Table Best Practices:**

**1. Monitor Table Size:**
```
Router# show ip nat statistics | include active
```
- Alert if > 80% capacity
- Plan capacity for peak usage

**2. Appropriate Timeouts:**
```
Router(config)# ip nat translation timeout 300
Router(config)# ip nat translation tcp-timeout 3600
Router(config)# ip nat translation udp-timeout 300
```
- Balance: Too short = connections break, Too long = table fills

**3. Clear Stale Entries:**
```
! In maintenance window:
Router# clear ip nat translation *
```

**4. Use Static NAT for Servers:**
- Predictable public IP
- No timeout issues
- Easier troubleshooting

**5. Document Mappings:**
- Keep spreadsheet of static NAT entries
- Note which public IPs map to which servers
- Essential for troubleshooting

**Real-World Scenario:**

**Enterprise with 1,000 users:**
- Each user has 10-20 simultaneous connections
- Total translations: 10,000-20,000 active entries
- Public IP pool: 203.0.113.50 - 203.0.113.59 (10 IPs)
- Each IP supports ~6,000 translations
- Total capacity: 60,000 translations
- Utilization: 33% (healthy)

**Teaching Activity:**

**Lab Exercise:**
1. Configure NAT on router
2. Generate traffic (ping, telnet, HTTP)
3. Run: `show ip nat translations`
4. Identify each field in output
5. Wait for timeout, verify entry disappears
6. Clear entries manually
7. Document NAT table behavior

**Key Takeaway:**
The NAT translation table is a dynamic, stateful database that tracks all active translations. It contains 5-tuple entries (protocol, inside local, inside global, outside local, outside global) and enables bidirectional translation. Understanding the NAT table is essential for troubleshooting connectivity issues.

---

## Slide 7: Static NAT - Fixed One-to-One Address Translation

### Speaker Notes:

Static NAT provides permanent, one-to-one mapping between private and public IP addresses. It's predictable, simple, and ideal for servers that need consistent public presence.

**What is Static NAT?**

**Definition:** Permanent mapping of one private IP address to one dedicated public IP address

**Characteristics:**
- **One-to-One:** Each inside local maps to exactly one inside global
- **Bidirectional:** Works for both outbound and inbound traffic
- **Permanent:** Mapping exists until manually removed (doesn't expire)
- **No Port Translation:** Entire IP address translated, all ports preserved
- **Predictable:** Same public IP always represents same private device

**Static NAT Formula:**
```
1 Inside Local (Private IP) ↔ 1 Inside Global (Public IP)
```

**When to Use Static NAT:**

**1. Public-Facing Servers:**
- Web servers (HTTP/HTTPS)
- Email servers (SMTP, POP3, IMAP)
- FTP servers
- DNS servers
- Database servers (with external access)
- VoIP PBX systems
- VPN concentrators

**Why servers need static NAT:**
- External users must know consistent IP to connect
- DNS records point to static public IP
- No timeout issues (mapping always exists)
- Simplified firewall rules

**2. Remote Access Systems:**
- RDP (Remote Desktop) servers
- SSH jump hosts
- VPN endpoints
- Remote management systems

**3. Compliance Requirements:**
- Logging/auditing needs consistent IP
- Security policies require dedicated IPs
- Partner integrations expect specific IPs

**4. Application Requirements:**
- Some apps break with dynamic NAT/PAT
- Legacy protocols that embed IP addresses
- Applications expecting consistent source IP

**How Static NAT Works:**

**Configuration Example:**
```
Router(config)# ip nat inside source static 192.168.1.10 203.0.113.50
                                           ↑               ↑
                                     Inside Local    Inside Global
                                     (Private IP)    (Public IP)
```

**Translation Process:**

**Outbound (Inside → Outside):**
```
BEFORE NAT (Inside Network):
  Source: 192.168.1.10
  Destination: 8.8.8.8
  Source Port: 5000
  Destination Port: 53

AFTER NAT (Outside Network):
  Source: 203.0.113.50 ← Translated IP
  Destination: 8.8.8.8
  Source Port: 5000 ← PRESERVED (no port translation)
  Destination Port: 53
```

**Inbound (Outside → Inside):**
```
BEFORE NAT (From Internet):
  Source: 142.250.80.46
  Destination: 203.0.113.50 ← Public IP
  Source Port: 443
  Destination Port: 80

AFTER NAT (To Inside Network):
  Source: 142.250.80.46
  Destination: 192.168.1.10 ← Translated to private IP
  Source Port: 443
  Destination Port: 80 ← PRESERVED
```

**Key Difference from PAT:**
- Port numbers NOT changed
- All ports on public IP map to same private IP
- Connection to 203.0.113.50:80 → 192.168.1.10:80
- Connection to 203.0.113.50:443 → 192.168.1.10:443
- Connection to 203.0.113.50:22 → 192.168.1.10:22

**Static NAT Configuration Steps:**

**Step 1: Identify Interfaces**
```
Router(config)# interface GigabitEthernet0/0
Router(config-if)# description Inside Network
Router(config-if)# ip address 192.168.1.1 255.255.255.0
Router(config-if)# ip nat inside ← Mark as inside interface
Router(config-if)# no shutdown

Router(config)# interface Serial0/0/0
Router(config-if)# description Outside Internet
Router(config-if)# ip address 203.0.113.1 255.255.255.252
Router(config-if)# ip nat outside ← Mark as outside interface
Router(config-if)# no shutdown
```

**Step 2: Create Static NAT Mapping**
```
Router(config)# ip nat inside source static 192.168.1.10 203.0.113.50
```

**Step 3: Verify Configuration**
```
Router# show ip nat translations

Pro  Inside global      Inside local       Outside local      Outside global
---  203.0.113.50       192.168.1.10       ---                ---
     ↑ Public IP        ↑ Private IP       ↑ No outside info (static)
```

**Step 4: Test Connectivity**
```
! From outside network, test connection to public IP
C:\> ping 203.0.113.50

! Should reach inside server (192.168.1.10)
```

**Multiple Static NAT Mappings:**

**Example: Company with 3 public servers**
```
Router(config)# ip nat inside source static 192.168.1.10 203.0.113.50
  ! Web server: 192.168.1.10 → 203.0.113.50

Router(config)# ip nat inside source static 192.168.1.11 203.0.113.51
  ! Email server: 192.168.1.11 → 203.0.113.51

Router(config)# ip nat inside source static 192.168.1.12 203.0.113.52
  ! DNS server: 192.168.1.12 → 203.0.113.52
```

**NAT Table with Multiple Static Entries:**
```
Router# show ip nat translations

Pro  Inside global      Inside local       Outside local      Outside global
---  203.0.113.50       192.168.1.10       ---                ---
---  203.0.113.51       192.168.1.11       ---                ---
---  203.0.113.52       192.168.1.12       ---                ---
```

**DNS Configuration:**
```
; DNS Zone File
www.company.com.     IN  A  203.0.113.50  ; Web server
mail.company.com.    IN  A  203.0.113.51  ; Email server
ns1.company.com.     IN  A  203.0.113.52  ; DNS server
```

**Advantages of Static NAT:**

**1. Predictability:**
- Same public IP always used
- External users can rely on consistent address
- Simplified troubleshooting (no dynamic allocation issues)

**2. Bidirectional Access:**
- Supports inbound connections (internet → server)
- No need to initiate connection from inside first
- Essential for servers waiting for client connections

**3. All Ports Available:**
- No port translation
- All 65,535 ports accessible
- No port conflicts

**4. No Timeout:**
- Mapping permanent (doesn't expire)
- No timeout-related disconnections
- Stable long-running connections

**5. Logging/Auditing:**
- Server logs always show same source IP
- Security audits associate IP with specific device
- Simplified forensics

**Disadvantages of Static NAT:**

**1. Wastes Public IPs:**
- Requires one public IP per inside device
- Doesn't conserve addresses (defeats NAT's main purpose!)
- Expensive (public IPs cost money)

**Example:**
```
50 servers with Static NAT = 50 public IPs required
Cost: 50 IPs × $30/IP = $1,500/year
```

**2. Limited Scalability:**
- Number of static NAT entries limited by public IP availability
- Can't support more servers than available public IPs
- IPv4 scarcity makes this problematic

**3. Manual Configuration:**
- Each mapping must be configured individually
- No automatic allocation
- Higher administrative overhead

**4. Still Requires Inside Initiation (Usually):**
- Firewall typically blocks unsolicited inbound
- Static NAT alone doesn't bypass firewall rules
- Must configure firewall to permit inbound traffic

**Static NAT vs Port Forwarding:**

**Common Confusion:**
Static NAT ≠ Port Forwarding (though related)

**Static NAT:**
- Translates ALL ports
- One public IP per inside device
- Example: 203.0.113.50:ANY → 192.168.1.10:ANY

**Port Forwarding (PAT with Static Ports):**
- Translates SPECIFIC ports only
- Multiple inside devices can share one public IP
- Example: 203.0.113.50:80 → 192.168.1.10:80
- Example: 203.0.113.50:443 → 192.168.1.11:443
- (We'll cover this later)

**Verification Commands:**

**Show NAT Translations:**
```
Router# show ip nat translations

Pro  Inside global      Inside local       Outside local      Outside global
---  203.0.113.50       192.168.1.10       ---                ---
```

**Show NAT Statistics:**
```
Router# show ip nat statistics

Total active translations: 1 (1 static, 0 dynamic; 0 extended)
Outside interfaces:
  Serial0/0/0
Inside interfaces:
  GigabitEthernet0/0
Hits: 1234  Misses: 0
```

**Show Running Config:**
```
Router# show running-config | include ip nat

ip nat inside source static 192.168.1.10 203.0.113.50
interface GigabitEthernet0/0
 ip nat inside
interface Serial0/0/0
 ip nat outside
```

**Test Connectivity:**
```
! From inside server:
Server# ping 8.8.8.8
  Should work (outbound NAT)

! From outside network:
C:\> ping 203.0.113.50
  Should reach 192.168.1.10 (inbound NAT)
```

**Troubleshooting Static NAT:**

**Problem 1: Inbound Traffic Not Reaching Server**

**Symptoms:**
- External ping to public IP fails
- External users can't access services

**Common Causes:**
1. Static NAT configured incorrectly
2. Firewall blocking inbound traffic
3. Server not responding (down, wrong IP, firewall on server)
4. Routing issue (no route back to source)

**Diagnosis:**
```
Router# show ip nat translations
! Verify static entry exists

Router# show ip nat statistics
! Check hit counters

Router# debug ip nat
! See translation attempts (use carefully!)

Router# show access-lists
! Check if ACL blocking traffic
```

**Problem 2: Static NAT Translation Not Appearing**

**Symptoms:**
- Configuration looks correct
- No translation entry in table

**Cause:** Forgot to mark interfaces!

**Fix:**
```
Router(config)# interface GigabitEthernet0/0
Router(config-if)# ip nat inside

Router(config)# interface Serial0/0/0
Router(config-if)# ip nat outside
```

**Problem 3: Duplicate Static NAT**

**Symptoms:**
```
Router(config)# ip nat inside source static 192.168.1.10 203.0.113.50
Router(config)# ip nat inside source static 192.168.1.11 203.0.113.50
% 203.0.113.50 already mapped (192.168.1.10)
```

**Cause:** Trying to map two inside IPs to same public IP
**Solution:** Use different public IPs or use PAT instead

**Problem 4: Wrong Translation Direction**

**Common Mistake:**
```
Router(config)# ip nat inside source static 203.0.113.50 192.168.1.10
                                           ↑              ↑
                                        WRONG ORDER!
```

**Correct:**
```
Router(config)# ip nat inside source static 192.168.1.10 203.0.113.50
                                           ↑ Inside      ↑ Outside
                                           ↑ (Private)   ↑ (Public)
```

**Real-World Example:**

**Scenario: Small Business Website**

**Requirements:**
- Public website: www.company.com
- Must be accessible from internet
- DNS points to 203.0.113.50
- Internal web server: 192.168.1.10

**Configuration:**
```
! Mark interfaces
interface GigabitEthernet0/0
 description Inside LAN
 ip address 192.168.1.1 255.255.255.0
 ip nat inside

interface Serial0/0/0
 description Internet Connection
 ip address 203.0.113.1 255.255.255.252
 ip nat outside

! Create static NAT
ip nat inside source static 192.168.1.10 203.0.113.50

! Configure firewall to allow HTTP/HTTPS inbound
access-list 101 permit tcp any host 203.0.113.50 eq 80
access-list 101 permit tcp any host 203.0.113.50 eq 443
access-list 101 deny ip any any
interface Serial0/0/0
 ip access-group 101 in
```

**Result:**
- Internet users access www.company.com (203.0.113.50)
- NAT translates to internal server (192.168.1.10)
- Server responds, NAT translates back
- Seamless for users

**Teaching Activity:**

**Lab Exercise: Configure Static NAT**

**Topology:**
```
[PC1] ---- [Router] ---- [Internet Simulator]
192.168.1.10   |            8.8.8.8
            Gi0/0: 192.168.1.1
            Se0/0: 203.0.113.1
```

**Tasks:**
1. Configure static NAT for PC1 (192.168.1.10 → 203.0.113.50)
2. Mark interfaces as inside/outside
3. Verify with `show ip nat translations`
4. Test inbound connectivity from Internet Simulator
5. Test outbound connectivity from PC1
6. Document hit counts with `show ip nat statistics`

**Key Takeaway:**
Static NAT provides permanent, one-to-one mapping between private and public IPs. It's essential for servers but wasteful for address conservation. All ports are translated, making it suitable for services requiring full port accessibility. Configuration is straightforward but requires careful interface marking and address allocation.

---

## Slide 8: Static NAT Example - Internal Web Server to Internet

### Speaker Notes:

This slide demonstrates a practical, real-world use of Static NAT: hosting an internal web server that's accessible from the internet. This is one of the most common NAT scenarios in production environments.

**Real-World Scenario:**

**Business Requirement:**
- Company wants to host own website internally
- Cost savings over cloud hosting
- Full control over hardware and software
- Compliance: Data must stay on-premises

**Technical Challenge:**
- Web server has private IP (192.168.1.100)
- Private IPs not routable on internet
- External users need to access website

**Solution:**
- Assign public IP (203.0.113.50) via Static NAT
- Map public IP to private server IP
- Configure DNS to point to public IP
- Allow HTTP/HTTPS through firewall

**Complete Configuration Walkthrough:**

**Step 1: Network Topology**
```
Internet
   |
   | (Public Network)
   |
[Router/Firewall]
203.0.113.50 (WAN)
192.168.1.1 (LAN)
   |
   | (Private Network)
   |
[Web Server]
192.168.1.100
```

**Step 2: Configure Router Interfaces**
```
! Inside Interface (LAN)
Router(config)# interface GigabitEthernet0/0
Router(config-if)# description Inside Network - LAN
Router(config-if)# ip address 192.168.1.1 255.255.255.0
Router(config-if)# ip nat inside
Router(config-if)# no shutdown

! Outside Interface (WAN)
Router(config)# interface GigabitEthernet0/1
Router(config-if)# description Outside Network - Internet
Router(config-if)# ip address 203.0.113.1 255.255.255.252
Router(config-if)# ip nat outside
Router(config-if)# no shutdown
```

**Step 3: Configure Static NAT**
```
Router(config)# ip nat inside source static 192.168.1.100 203.0.113.50
```

**What this does:**
- Creates permanent mapping
- 192.168.1.100 (inside local) ↔ 203.0.113.50 (inside global)
- Bidirectional: Works for inbound and outbound traffic
- No port translation: All ports accessible

**Step 4: Configure Access Control (Firewall)**
```
! Allow HTTP (port 80) and HTTPS (port 443) inbound
Router(config)# access-list 101 remark Allow Web Traffic to Server
Router(config)# access-list 101 permit tcp any host 203.0.113.50 eq 80
Router(config)# access-list 101 permit tcp any host 203.0.113.50 eq 443

! Allow established connections (return traffic)
Router(config)# access-list 101 permit tcp any any established

! Deny everything else (implicit deny)
Router(config)# access-list 101 deny ip any any log

! Apply to outside interface (inbound direction)
Router(config)# interface GigabitEthernet0/1
Router(config-if)# ip access-group 101 in
```

**Important:** Static NAT alone doesn't bypass firewall. Must explicitly permit traffic!

**Step 5: Configure Web Server**

**On Web Server (192.168.1.100):**
```
IP Address: 192.168.1.100
Subnet Mask: 255.255.255.0
Default Gateway: 192.168.1.1 (router)
DNS: 8.8.8.8, 8.8.4.4

Web Server Software: Apache/IIS/Nginx
Listening Ports: 80 (HTTP), 443 (HTTPS)
```

**Server must:**
- Have correct default gateway (192.168.1.1)
- Have firewall rules allowing HTTP/HTTPS
- Have web service running and configured

**Step 6: Configure DNS**

**DNS Zone File (at domain registrar):**
```
$ORIGIN company.com.
$TTL 3600

@       IN  SOA ns1.company.com. admin.company.com. (
                2024010101  ; Serial
                3600        ; Refresh
                1800        ; Retry
                604800      ; Expire
                86400 )     ; Minimum TTL

@       IN  NS  ns1.company.com.
@       IN  NS  ns2.company.com.

@       IN  A   203.0.113.50    ; Root domain → Public IP
www     IN  A   203.0.113.50    ; www subdomain → Public IP
```

**Result:**
- company.com resolves to 203.0.113.50
- www.company.com resolves to 203.0.113.50
- NAT translates 203.0.113.50 → 192.168.1.100

**Traffic Flow - Inbound Web Request:**

**Step 1: User types www.company.com in browser**
```
User's PC → DNS Query for www.company.com
DNS Server → Response: 203.0.113.50
User's Browser → HTTP GET Request
```

**Step 2: HTTP Request Packet Created**
```
Source IP: 203.0.113.200 (user's public IP)
Source Port: 52345 (random ephemeral)
Destination IP: 203.0.113.50 (web server's public IP)
Destination Port: 80 (HTTP)
```

**Step 3: Packet Reaches Router's Outside Interface**
```
Router receives packet on GigabitEthernet0/1 (outside interface)
Router checks ACL: "permit tcp any host 203.0.113.50 eq 80" → ALLOWED
Router checks NAT table: 203.0.113.50 → 192.168.1.100
```

**Step 4: Router Translates Destination (Inbound NAT)**
```
BEFORE NAT:
  Source: 203.0.113.200:52345
  Destination: 203.0.113.50:80

AFTER NAT:
  Source: 203.0.113.200:52345 (unchanged)
  Destination: 192.168.1.100:80 ← Translated to private IP
```

**Step 5: Packet Forwarded to Web Server**
```
Router forwards to 192.168.1.100 on GigabitEthernet0/0 (inside interface)
Web server receives packet on port 80
Web server processes HTTP request
```

**Step 6: Web Server Responds**
```
Web server sends HTTP response:
  Source: 192.168.1.100:80
  Destination: 203.0.113.200:52345
```

**Step 7: Response Reaches Router's Inside Interface**
```
Router receives on GigabitEthernet0/0 (inside interface)
Router checks NAT table: 192.168.1.100 → 203.0.113.50
```

**Step 8: Router Translates Source (Outbound NAT)**
```
BEFORE NAT:
  Source: 192.168.1.100:80
  Destination: 203.0.113.200:52345

AFTER NAT:
  Source: 203.0.113.50:80 ← Translated to public IP
  Destination: 203.0.113.200:52345 (unchanged)
```

**Step 9: Response Forwarded to User**
```
Router forwards out GigabitEthernet0/1 (outside interface)
Packet traverses internet
User's browser receives response
```

**User's Perspective:**
- Accessing 203.0.113.50 (public IP)
- No knowledge of 192.168.1.100 (private IP)
- Sees company website
- Believes server is at public IP

**NAT Table Entry:**

**During Active Connection:**
```
Router# show ip nat translations

Pro  Inside global      Inside local       Outside local      Outside global
tcp  203.0.113.50:80    192.168.1.100:80  203.0.113.200:52345 203.0.113.200:52345
---  203.0.113.50       192.168.1.100     ---                 ---
     ↑ Static entry     ↑ Web server      ↑ Dynamic entry    ↑ User's IP
     (permanent)                            (temporary)
```

**Two entries:**
1. Static NAT entry (---): Permanent mapping
2. Active connection: Specific TCP session

**Advantages of This Setup:**

**1. Cost Savings:**
- Own hardware: $2,000 one-time
- Cloud hosting: $100/month = $1,200/year
- Break-even: 20 months

**2. Control:**
- Full access to server
- Custom configurations
- No cloud provider restrictions

**3. Data Sovereignty:**
- Data stays on-premises
- Compliance requirements (HIPAA, PCI-DSS)
- No third-party access

**4. Performance:**
- Local LAN speed for internal users
- Custom caching/optimization

**Challenges and Considerations:**

**1. ISP Requirements:**
- Need static public IP from ISP
- Business internet plan (not residential)
- Cost: $50-$200/month extra

**2. Reliability:**
- Single point of failure (your internet connection)
- No cloud-level redundancy
- Need backup power (UPS)

**3. Security Responsibility:**
- You manage security updates
- You monitor for attacks
- DDoS mitigation limited

**4. Bandwidth:**
- Limited by ISP upload speed
- Residential: 10-50 Mbps upload
- Business: 100+ Mbps upload
- Cloud: Gigabit+ speeds

**Security Best Practices:**

**1. Limit Exposed Ports:**
```
! Only allow HTTP and HTTPS, deny everything else
access-list 101 permit tcp any host 203.0.113.50 eq 80
access-list 101 permit tcp any host 203.0.113.50 eq 443
access-list 101 deny ip any any log
```

**2. Enable Logging:**
```
! Log denied attempts
access-list 101 deny ip any any log

! Monitor logs
Router# show logging | include denied
```

**3. Rate Limiting:**
```
! Prevent DoS attacks
rate-limit input access-group 101 8000000 1500000 2000000 conform-action transmit exceed-action drop
```

**4. Web Server Hardening:**
- Keep software updated (Apache, PHP, OS)
- Use strong passwords
- Enable web application firewall (ModSecurity)
- Implement HTTPS (SSL/TLS certificates)
- Regular security audits

**5. Monitoring:**
- Monitor connection attempts
- Alert on unusual traffic patterns
- Regular log review

**Troubleshooting Common Issues:**

**Problem 1: External Users Can't Access Website**

**Symptom:**
- Users report website unreachable
- Timeout errors in browser

**Diagnosis Steps:**
```
1. Test from inside network:
   http://192.168.1.100 → Works?
   If NO: Server problem (not NAT)
   If YES: Continue troubleshooting NAT

2. Check NAT translation:
   Router# show ip nat translations
   ! Verify static entry exists

3. Check ACL:
   Router# show access-lists 101
   ! Verify HTTP/HTTPS permitted

4. Test from router:
   Router# ping 192.168.1.100
   ! Can router reach server?

5. Check server default gateway:
   Server$ ip route
   ! Default should be 192.168.1.1

6. Packet capture:
   Router# debug ip nat
   ! See if translation happening (careful - verbose!)
```

**Problem 2: Website Loads But Links Broken**

**Symptom:**
- Homepage loads
- Internal links use private IP (http://192.168.1.100/page.html)

**Cause:**
- Web server misconfigured
- Server generating URLs with private IP

**Fix:**
- Configure web server to use public domain name
- Apache: ServerName directive
- IIS: Host header configuration

**Problem 3: HTTPS Certificate Errors**

**Symptom:**
- HTTP works, HTTPS shows certificate error

**Cause:**
- SSL certificate issued for domain name
- Accessing via IP directly

**Fix:**
- Always use domain name (www.company.com)
- Ensure certificate matches domain
- Consider Let's Encrypt (free certificates)

**Alternative: Port Forwarding vs Static NAT**

**This Example Used:** Static NAT (entire IP)
- Maps ALL ports of public IP to server
- Wastes a public IP on one server

**Alternative:** Port Forwarding (PAT)
- Map only specific ports (80, 443)
- Share public IP with other services
```
Router(config)# ip nat inside source static tcp 192.168.1.100 80 203.0.113.50 80
Router(config)# ip nat inside source static tcp 192.168.1.100 443 203.0.113.50 443
```

**Comparison:**
- Static NAT: Simpler, dedicated IP, supports all protocols
- Port Forwarding: More efficient, shares IP, only mapped ports work

**Verification Commands:**

**Check Static NAT:**
```
Router# show ip nat translations
Router# show ip nat statistics
```

**Check ACL:**
```
Router# show access-lists 101
```

**Check Active Connections:**
```
Router# show ip nat translations verbose
```

**Test from Outside:**
```
$ curl -I http://203.0.113.50
HTTP/1.1 200 OK
Server: Apache/2.4.41
```

**Key Takeaway:**
Static NAT enables internal servers to be accessible from the internet by mapping a dedicated public IP to the server's private IP. This is essential for hosting web servers, email servers, and other public-facing services on-premises. Proper firewall configuration is crucial to security. While Static NAT works well, Port Forwarding (PAT) is often more efficient for specific services.

---

## Slide 9: Dynamic NAT - One-to-One Translation from Address Pool

### Speaker Notes:

Dynamic NAT provides a more flexible approach than Static NAT by allocating public IP addresses from a pool on a first-come, first-served basis. It's less common than PAT but important to understand.

**What is Dynamic NAT?**

**Definition:** Temporary, one-to-one mapping between private IPs (inside local) and public IPs (inside global) allocated from a configured pool

**Characteristics:**
- **Pool-Based:** Multiple public IPs available for allocation
- **First-Come, First-Served:** Inside host gets first available public IP from pool
- **Temporary:** Mapping released when connection idle/closed
- **One-to-One:** While active, one private IP maps to one dedicated public IP
- **No Port Translation:** All ports preserved (like Static NAT)
- **Reusable:** Public IP returned to pool when released

**Dynamic NAT Formula:**
```
Pool of N Public IPs
Can support maximum N simultaneous inside hosts
```

**When to Use Dynamic NAT:**

**1. Limited Public IPs, Moderate User Count:**
- Have 10 public IPs
- Have 50 internal users
- Not all users online simultaneously
- Dynamic allocation more efficient than Static

**2. Temporary External Access:**
- Users occasionally need internet access
- Don't need permanent public IP
- Cost savings (fewer public IPs than users)

**3. Legacy Applications:**
- Application requires full IP translation (no PAT)
- Can't handle port translation
- But don't need permanent mapping (no Static NAT)

**4. Compliance/Logging:**
- Need one-to-one mapping for auditing
- But don't want to waste IPs on permanent mappings
- Dynamic NAT provides both

**How Dynamic NAT Works:**

**Configuration Components:**

**1. Access Control List (ACL):**
- Defines which inside addresses are eligible for NAT
- Only matching traffic gets translated

**2. NAT Pool:**
- Defines range of public IP addresses
- Available for dynamic allocation

**3. NAT Statement:**
- Links ACL to NAT pool
- Enables dynamic NAT

**Configuration Example:**

**Step 1: Define Inside Network (ACL)**
```
Router(config)# access-list 1 permit 192.168.1.0 0.0.0.255
```
- ACL 1 permits entire 192.168.1.0/24 network
- Any host in 192.168.1.0/24 eligible for NAT
- Use standard ACL (numbers 1-99)

**Step 2: Create NAT Pool**
```
Router(config)# ip nat pool MYPOOL 203.0.113.50 203.0.113.59 netmask 255.255.255.0
```
- Pool name: MYPOOL (can be any name)
- Start IP: 203.0.113.50
- End IP: 203.0.113.59
- Total addresses: 10 public IPs
- Netmask: 255.255.255.0 (/24)

**Step 3: Link ACL to Pool**
```
Router(config)# ip nat inside source list 1 pool MYPOOL
```
- Traffic matching ACL 1 gets IP from MYPOOL
- Dynamic allocation on first packet

**Step 4: Mark Interfaces**
```
Router(config)# interface GigabitEthernet0/0
Router(config-if)# ip nat inside

Router(config)# interface Serial0/0/0
Router(config-if)# ip nat outside
```

**Complete Configuration:**
```
! Define inside network
access-list 1 permit 192.168.1.0 0.0.0.255

! Create public IP pool
ip nat pool MYPOOL 203.0.113.50 203.0.113.59 netmask 255.255.255.0

! Link ACL to pool
ip nat inside source list 1 pool MYPOOL

! Mark interfaces
interface GigabitEthernet0/0
 ip nat inside
interface Serial0/0/0
 ip nat outside
```

**Dynamic Allocation Process:**

**Scenario:** Three PCs (192.168.1.10, 192.168.1.11, 192.168.1.12) access internet

**First PC (192.168.1.10) Sends Packet:**
```
1. Packet arrives: Source 192.168.1.10 → Destination 8.8.8.8
2. Router checks ACL 1: 192.168.1.10 matches (permitted)
3. Router checks NAT table: No existing mapping for 192.168.1.10
4. Router allocates from MYPOOL: 203.0.113.50 (first available)
5. Router creates mapping: 192.168.1.10 ↔ 203.0.113.50
6. Router translates: Source 203.0.113.50 → Destination 8.8.8.8
7. Packet forwarded
```

**NAT Table After First PC:**
```
Pro  Inside global      Inside local       Outside local      Outside global
---  203.0.113.50       192.168.1.10       ---                ---
```

**Second PC (192.168.1.11) Sends Packet:**
```
1. Packet arrives: Source 192.168.1.11 → Destination 8.8.8.8
2. Router checks ACL 1: 192.168.1.11 matches
3. Router checks NAT table: No existing mapping
4. Router allocates: 203.0.113.51 (next available from pool)
5. Router creates mapping: 192.168.1.11 ↔ 203.0.113.51
6. Packet translated and forwarded
```

**NAT Table After Second PC:**
```
Pro  Inside global      Inside local       Outside local      Outside global
---  203.0.113.50       192.168.1.10       ---                ---
---  203.0.113.51       192.168.1.11       ---                ---
```

**Third PC (192.168.1.12) Sends Packet:**
```
Allocation: 203.0.113.52
```

**NAT Table After Third PC:**
```
Pro  Inside global      Inside local       Outside local      Outside global
---  203.0.113.50       192.168.1.10       ---                ---
---  203.0.113.51       192.168.1.11       ---                ---
---  203.0.113.52       192.168.1.12       ---                ---
```

**Pool Exhaustion Scenario:**

**Situation:** 10 public IPs in pool, 11th user tries to access internet

**What Happens:**
```
1. 11th PC (192.168.1.20) sends packet
2. Router checks ACL: Matches
3. Router checks NAT table: No mapping
4. Router tries to allocate from pool: ALL IPs IN USE!
5. Router cannot allocate: POOL EXHAUSTED
6. Packet DROPPED
7. User experience: Connection timeout
```

**Router Log:**
```
%NAT: translation failed (B), dropping packet s=192.168.1.20 d=8.8.8.8
```

**Solutions to Pool Exhaustion:**

**1. Add More Public IPs:**
```
Router(config)# ip nat pool MYPOOL 203.0.113.50 203.0.113.69 netmask 255.255.255.0
! Expanded from 10 IPs to 20 IPs
```

**2. Reduce Translation Timeout:**
```
Router(config)# ip nat translation timeout 60
! Default 86400 seconds (24 hours), reduced to 60 seconds
! Aggressive aging, releases IPs faster
! Risk: May break long-running connections
```

**3. Switch to PAT (Recommended):**
```
Router(config)# no ip nat inside source list 1 pool MYPOOL
Router(config)# ip nat inside source list 1 pool MYPOOL overload
! Adds "overload" keyword = PAT
! Allows multiple inside hosts to share one public IP
```

**4. Clear Idle Translations:**
```
Router# clear ip nat translation *
! Removes all dynamic entries
! Frees up pool addresses
! Use carefully - breaks active connections!
```

**Dynamic NAT Entry Lifecycle:**

**1. Entry Creation:**
- Triggered by first outbound packet from inside host
- Public IP allocated from pool
- Mapping added to NAT table

**2. Entry Maintenance:**
- Timer starts (default 24 hours for TCP, 5 minutes for UDP)
- Timer reset with each packet using this mapping
- IP remains allocated to this inside host

**3. Entry Expiration:**
- Timeout reaches zero (no traffic)
- IP released back to pool
- Available for next allocation
- Inside host must re-request if needs NAT again

**4. Manual Clearing:**
```
Router# clear ip nat translation inside 192.168.1.10
! Specific host
```

**Advantages of Dynamic NAT:**

**1. Efficient Use of Limited Public IPs:**
- 10 public IPs can support 100 users (if not all online simultaneously)
- Better than Static NAT (would require 100 public IPs)

**2. Automatic Allocation:**
- No manual per-host configuration
- New inside hosts automatically get NAT
- Simplified administration

**3. Temporary Mappings:**
- Public IPs not permanently tied to inside hosts
- Flexible allocation based on current demand

**4. Full Port Preservation:**
- All ports work (no port translation)
- Compatible with protocols that struggle with PAT

**Disadvantages of Dynamic NAT:**

**1. Pool Exhaustion:**
- Can run out of public IPs
- Users get blocked when pool full
- Requires careful capacity planning

**Example:**
```
10 public IPs in pool
20 simultaneous users
Result: 10 users get internet, 10 users blocked!
```

**2. Still Wastes IPs:**
- One public IP per inside host (while active)
- Not as efficient as PAT
- Expensive if public IPs costly

**3. Inbound Limitations:**
- Dynamic allocation means unpredictable public IP
- Can't host servers (unknown public IP)
- Inbound connections generally fail (no pre-existing mapping)

**4. Timeout Issues:**
- Long idle periods = mapping expires
- User thinks connection still active, but NAT released IP
- Sudden failures on resume

**Dynamic NAT vs Static NAT:**

**Static NAT:**
- Permanent one-to-one mapping
- Manually configured
- Predictable (same public IP always)
- Good for servers
- Wastes IPs (always allocated)

**Dynamic NAT:**
- Temporary one-to-one mapping
- Automatically allocated from pool
- Unpredictable (different public IP each time)
- Good for clients
- More efficient (IPs reused)

**Dynamic NAT vs PAT:**

**Dynamic NAT:**
- One-to-one (one public IP per inside host)
- Pool can exhaust
- All ports preserved
- Compatible with more protocols

**PAT (Dynamic NAT Overload):**
- Many-to-one (many inside hosts share one public IP)
- Port translation
- Virtually never exhausts
- Most commonly used
- Some protocols incompatible

**Verification Commands:**

**Show NAT Translations:**
```
Router# show ip nat translations

Pro  Inside global      Inside local       Outside local      Outside global
---  203.0.113.50       192.168.1.10       ---                ---
---  203.0.113.51       192.168.1.11       ---                ---
---  203.0.113.52       192.168.1.12       ---                ---
```

**Show NAT Statistics:**
```
Router# show ip nat statistics

Total active translations: 3 (0 static, 3 dynamic; 0 extended)
Outside interfaces:
  Serial0/0/0
Inside interfaces:
  GigabitEthernet0/0
Hits: 4567  Misses: 23
Expired translations: 156
Dynamic mappings:
-- Inside Source
[Id: 1] access-list 1 pool MYPOOL refcount 3
 pool MYPOOL: netmask 255.255.255.0
        start 203.0.113.50 end 203.0.113.59
        type generic, total addresses 10, allocated 3 (30%), misses 0
        ↑ Pool info          ↑ 10 total     ↑ 3 in use  ↑ No exhaustion
```

**Show Pool Details:**
```
Router# show ip nat pool

Pool MYPOOL
 Refcount 3
 Netmask 255.255.255.0
 Start 203.0.113.50 End 203.0.113.59
 Type generic, Total addresses 10, Allocated 3 (30%), Misses 0
```

**Troubleshooting Dynamic NAT:**

**Problem 1: Pool Exhaustion - Users Can't Access Internet**

**Symptoms:**
- Some users work, others fail
- Error in logs: "translation failed, pool exhausted"

**Diagnosis:**
```
Router# show ip nat statistics

Dynamic mappings:
  pool MYPOOL: allocated 10 (100%), misses 456 ← PROBLEM!
  ↑ All IPs allocated        ↑ 456 failed attempts
```

**Solutions:**
1. Add more public IPs to pool
2. Reduce timeout (aggressive aging)
3. Clear idle translations
4. Implement PAT instead

**Problem 2: ACL Not Matching Traffic**

**Symptoms:**
- NAT not happening
- No translations created

**Diagnosis:**
```
Router# show ip nat translations
! Empty - no entries

Router# show access-lists 1
Standard IP access list 1
    10 permit 192.168.2.0, wildcard bits 0.0.0.255
    ! ACL permits 192.168.2.0/24, but inside network is 192.168.1.0/24!
```

**Solution:**
```
Router(config)# access-list 1 permit 192.168.1.0 0.0.0.255
! Fix ACL to match actual inside network
```

**Problem 3: Wrong Pool Configuration**

**Common Mistake:**
```
Router(config)# ip nat pool MYPOOL 203.0.113.50 203.0.113.59 netmask 255.255.255.252
                                                                       ↑ WRONG!
! /30 netmask doesn't match /24 network
! Pool IPs not in same subnet as router's outside interface
```

**Correct:**
```
Router(config)# ip nat pool MYPOOL 203.0.113.50 203.0.113.59 netmask 255.255.255.0
! Netmask should match router's outside interface subnet
```

**Problem 4: Interface Not Marked**

**Forgot to mark interfaces as inside/outside:**
```
Router# show ip nat statistics
Inside interfaces: ← EMPTY!
Outside interfaces: ← EMPTY!
```

**Solution:**
```
Router(config)# interface GigabitEthernet0/0
Router(config-if)# ip nat inside

Router(config)# interface Serial0/0/0
Router(config-if)# ip nat outside
```

**Real-World Example:**

**Scenario: Branch Office with Limited Public IPs**

**Requirements:**
- 50 employees
- Only 10 public IP addresses available
- Not all employees online simultaneously (average 15 concurrent)
- Need full port preservation (legacy application requirement)

**Solution: Dynamic NAT**
```
! Define inside network
access-list 1 remark Branch Office Network
access-list 1 permit 192.168.10.0 0.0.0.255

! Create pool of 10 public IPs
ip nat pool BRANCH_POOL 203.0.113.100 203.0.113.109 netmask 255.255.255.0

! Enable Dynamic NAT
ip nat inside source list 1 pool BRANCH_POOL

! Mark interfaces
interface GigabitEthernet0/0
 description Inside LAN
 ip nat inside
interface Serial0/0/0
 description WAN to HQ
 ip nat outside

! Set aggressive timeout (release IPs faster)
ip nat translation timeout 600
! 10 minutes instead of 24 hours
```

**Result:**
- 10 public IPs support 50 users
- Average 15 concurrent = well within capacity
- Timeout of 10 minutes ensures IPs released quickly
- Full port preservation for legacy app

**Monitoring:**
```
Router# show ip nat statistics

Pool BRANCH_POOL: allocated 8 (80%), misses 0
! 8 of 10 IPs in use, no exhaustion - healthy!
```

**Alternative Approach - PAT:**

If pool exhaustion becomes problem, switch to PAT:
```
Router(config)# no ip nat inside source list 1 pool BRANCH_POOL
Router(config)# ip nat inside source list 1 pool BRANCH_POOL overload
! Now uses PAT - all 50 users can share even 1 public IP!
```

**Teaching Activity:**

**Lab Exercise: Configure Dynamic NAT**

**Topology:**
```
[PC1]--
[PC2]--[Router]--[Internet]
[PC3]--
192.168.1.10-12

Pool: 203.0.113.50 - 203.0.113.52 (3 public IPs)
```

**Tasks:**
1. Configure ACL to permit 192.168.1.0/24
2. Create NAT pool with 3 public IPs
3. Link ACL to pool
4. Mark interfaces
5. Test with 3 PCs (should work)
6. Add 4th PC (should fail - pool exhausted)
7. Clear one translation, verify 4th PC works
8. Monitor pool usage with show commands

**Key Takeaway:**
Dynamic NAT allocates public IP addresses from a pool on-demand, providing more flexibility than Static NAT while still maintaining one-to-one mapping. It's more efficient than Static NAT but less scalable than PAT. Pool exhaustion is the main limitation. Dynamic NAT is less common today, as PAT is usually preferred for better address conservation.

---

## Slide 10: Dynamic NAT Example - Branch Office Internet Access

### Speaker Notes:

This slide provides a practical, real-world example of Dynamic NAT deployment in a branch office scenario. We'll explore the complete configuration, capacity planning, and troubleshooting workflow.

**Real-World Scenario:**

**Company Profile:**
- National retail chain
- 50 branch offices
- Each branch: 50 employees
- Centralized internet gateway at headquarters
- Limited public IP addresses per branch

**Business Challenge:**
- Cost: Public IP addresses expensive ($20-$50 per IP/year)
- Availability: Can only obtain 10 public IPs per branch from ISP
- Requirements: All 50 employees need internet access
- Constraint: Legacy ERP system requires full port preservation (doesn't work with PAT)

**Technical Solution:**
- Deploy Dynamic NAT at each branch
- Create pool of 10 public IPs
- Rely on not all employees being online simultaneously
- Monitor usage to ensure pool sufficient

**Capacity Planning:**

**Peak Usage Analysis:**
- 50 total employees
- Work hours: 8 AM - 5 PM
- Peak internet usage: 10 AM - 2 PM
- During peak: 20-25 concurrent users
- Pool size: 10 public IPs

**Is 10 IPs Enough?**
```
Worst case: 25 concurrent users
Available: 10 public IPs
Result: 10 users succeed, 15 users fail
Conclusion: INSUFFICIENT CAPACITY!
```

**Solutions:**
1. Purchase more public IPs (expensive)
2. Implement usage policies (limit concurrent users)
3. Use PAT for general traffic, Dynamic NAT only for ERP
4. Increase timeout aggressiveness (faster IP recycling)

**Revised Approach - Hybrid NAT:**
```
Solution: PAT for general internet, Dynamic NAT for ERP only
ERP users: 10 concurrent maximum
Pool: 10 IPs sufficient
General users: PAT (overload on single IP)
```

**Complete Configuration:**

**Network Topology:**
```
Branch Office LAN: 192.168.10.0/24
  - General users: 192.168.10.10 - 192.168.10.200
  - ERP workstations: 192.168.10.201 - 192.168.10.210 (10 machines)

Router:
  - Inside: Gi0/0 (192.168.10.1)
  - Outside: Se0/0/0 (203.0.113.1)

Public IP Pool: 203.0.113.100 - 203.0.113.109 (10 IPs)
PAT IP: 203.0.113.99 (1 IP for overload)
```

**Step 1: Define Traffic Classes (ACLs)**
```
! ERP traffic (requires Dynamic NAT)
Router(config)# access-list 10 remark ERP Workstations
Router(config)# access-list 10 permit 192.168.10.201 0.0.0.9
! Permits 192.168.10.201 through 192.168.10.210

! General traffic (can use PAT)
Router(config)# access-list 11 remark General Users
Router(config)# access-list 11 permit 192.168.10.0 0.0.0.255
Router(config)# access-list 11 deny 192.168.10.201 0.0.0.9
! Permits all EXCEPT ERP workstations
```

**Step 2: Create NAT Pool for ERP**
```
Router(config)# ip nat pool ERP_POOL 203.0.113.100 203.0.113.109 netmask 255.255.255.0
```

**Step 3: Configure NAT Rules**
```
! Dynamic NAT for ERP (priority 1)
Router(config)# ip nat inside source list 10 pool ERP_POOL

! PAT for general users (priority 2)
Router(config)# ip nat inside source list 11 interface Serial0/0/0 overload
! Uses outside interface IP (203.0.113.1) with PAT
```

**Alternative PAT Configuration (Dedicated IP):**
```
! Create pool with single IP for PAT
Router(config)# ip nat pool PAT_POOL 203.0.113.99 203.0.113.99 netmask 255.255.255.0
Router(config)# ip nat inside source list 11 pool PAT_POOL overload
```

**Step 4: Mark Interfaces**
```
Router(config)# interface GigabitEthernet0/0
Router(config-if)# description Branch Office LAN
Router(config-if)# ip address 192.168.10.1 255.255.255.0
Router(config-if)# ip nat inside
Router(config-if)# no shutdown

Router(config)# interface Serial0/0/0
Router(config-if)# description WAN to HQ
Router(config-if)# ip address 203.0.113.1 255.255.255.252
Router(config-if)# ip nat outside
Router(config-if)# no shutdown
```

**Step 5: Configure Timeouts**
```
! Aggressive timeout for Dynamic NAT (release IPs faster)
Router(config)# ip nat translation timeout 300
! 5 minutes idle = IP released (default 24 hours)

! Separate timeout for TCP (ERP uses TCP)
Router(config)# ip nat translation tcp-timeout 1800
! 30 minutes for established TCP
```

**Step 6: Logging and Monitoring**
```
! Enable syslog for NAT events
Router(config)# ip nat log translations syslog

! Log when pool exhausted
Router(config)# logging console warnings
Router(config)# logging buffered 16384 debugging
```

**Complete Configuration File:**
```
hostname BranchRouter

! Inside interface
interface GigabitEthernet0/0
 description Branch Office LAN
 ip address 192.168.10.1 255.255.255.0
 ip nat inside
 no shutdown

! Outside interface
interface Serial0/0/0
 description WAN to Headquarters
 ip address 203.0.113.1 255.255.255.252
 ip nat outside
 no shutdown

! Traffic classification
access-list 10 remark ERP Workstations - Dynamic NAT
access-list 10 permit 192.168.10.201 0.0.0.9

access-list 11 remark General Users - PAT
access-list 11 permit 192.168.10.0 0.0.0.255
access-list 11 deny 192.168.10.201 0.0.0.9

! NAT pools
ip nat pool ERP_POOL 203.0.113.100 203.0.113.109 netmask 255.255.255.0

! NAT rules
ip nat inside source list 10 pool ERP_POOL
ip nat inside source list 11 interface Serial0/0/0 overload

! Timeouts
ip nat translation timeout 300
ip nat translation tcp-timeout 1800

! Logging
ip nat log translations syslog
logging buffered 16384 debugging
```

**Traffic Flow - ERP Workstation:**

**User on 192.168.10.201 accesses ERP server:**
```
1. Workstation sends: Source 192.168.10.201 → Destination 198.51.100.50 (ERP)
2. Router checks ACL 10: 192.168.10.201 matches
3. Router allocates from ERP_POOL: 203.0.113.100 (first available)
4. Router creates mapping: 192.168.10.201 ↔ 203.0.113.100
5. Router translates: Source 203.0.113.100 → Destination 198.51.100.50
6. ERP server sees request from 203.0.113.100 (consistent IP for this session)
```

**Traffic Flow - General User:**

**User on 192.168.10.50 browses web:**
```
1. PC sends: Source 192.168.10.50:5000 → Destination 93.184.216.34:80
2. Router checks ACL 10: 192.168.10.50 NOT in 192.168.10.201-210 range (no match)
3. Router checks ACL 11: 192.168.10.50 matches
4. Router uses PAT: Assigns 203.0.113.1:1025
5. Router creates mapping: 192.168.10.50:5000 ↔ 203.0.113.1:1025
6. Router translates: Source 203.0.113.1:1025 → Destination 93.184.216.34:80
```

**NAT Table During Operation:**

```
Router# show ip nat translations

Pro  Inside global       Inside local        Outside local       Outside global
---  203.0.113.100       192.168.10.201      ---                 ---
---  203.0.113.101       192.168.10.202      ---                 ---
---  203.0.113.102       192.168.10.203      ---                 ---
tcp  203.0.113.1:1025    192.168.10.50:5000  93.184.216.34:80   93.184.216.34:80
tcp  203.0.113.1:1026    192.168.10.51:5001  142.250.80.46:443  142.250.80.46:443
tcp  203.0.113.1:1027    192.168.10.52:5002  8.8.8.8:53         8.8.8.8:53

! First 3 lines: Dynamic NAT (ERP users, no ports)
! Last 3 lines: PAT (general users, with ports)
```

**Monitoring and Management:**

**Check Pool Usage:**
```
Router# show ip nat statistics

Dynamic mappings:
-- Inside Source
[Id: 1] access-list 10 pool ERP_POOL refcount 3
 pool ERP_POOL: netmask 255.255.255.0
        start 203.0.113.100 end 203.0.113.109
        type generic, total addresses 10, allocated 3 (30%), misses 0
        ↑ 3 of 10 IPs in use                         ↑ No exhaustion

[Id: 2] access-list 11 interface Serial0/0/0 refcount 15
! 15 PAT connections using Serial0/0/0 IP
```

**Monitor in Real-Time:**
```
Router# show ip nat statistics | include allocated
        allocated 5 (50%), misses 0
! Update: 5 ERP users now active

Router# show ip nat statistics | include allocated
        allocated 9 (90%), misses 0
! Alert: 9 of 10 IPs in use - approaching capacity!

Router# show ip nat statistics | include allocated
        allocated 10 (100%), misses 12
! Critical: Pool exhausted, 12 connection attempts failed!
```

**Alert Thresholds:**
- 0-70% utilization: Normal (green)
- 71-90% utilization: Warning (yellow)
- 91-100% utilization: Critical (red)
- Misses > 0: Immediate attention needed

**Troubleshooting Common Issues:**

**Problem 1: Pool Exhausted - ERP Users Can't Connect**

**Symptom:**
- Error: "Cannot connect to ERP server"
- Some users work, others don't

**Diagnosis:**
```
Router# show ip nat statistics

pool ERP_POOL: allocated 10 (100%), misses 47
! All 10 IPs allocated, 47 failed attempts
```

**Root Cause:**
- More than 10 concurrent ERP users
- Timeout too long (IPs not released fast enough)
- Idle connections holding IPs

**Immediate Solution:**
```
! Clear idle translations (releases IPs)
Router# clear ip nat translation *
! WARNING: Breaks active connections, use during maintenance window
```

**Long-Term Solutions:**

**Option 1: Add More IPs**
```
Router(config)# ip nat pool ERP_POOL 203.0.113.100 203.0.113.119 netmask 255.255.255.0
! Expanded from 10 to 20 IPs
! Requires purchasing additional public IPs from ISP
```

**Option 2: Reduce Timeout**
```
Router(config)# ip nat translation timeout 120
! 2 minutes idle = release (aggressive)
! Risk: May break long-running ERP sessions
```

**Option 3: Monitor and Clear Proactively**
```
! Create script to clear translations every 5 minutes
Router(config)# kron occurrence CLEAR_NAT at 0:00 recurring
Router(config-kron-occurrence)# policy-list CLEAR_NAT_POLICY

Router(config)# kron policy-list CLEAR_NAT_POLICY
Router(config-kron-policy)# cli clear ip nat translation idle 600
! Clears translations idle > 10 minutes
```

**Problem 2: Wrong Users Getting Dynamic NAT**

**Symptom:**
- General users getting IPs from ERP_POOL
- ERP users blocked due to pool exhaustion

**Diagnosis:**
```
Router# show ip nat translations

---  203.0.113.100       192.168.10.50       ---                 ---
! 192.168.10.50 is NOT in ERP range (201-210), but got Dynamic NAT!
```

**Root Cause:**
- ACL misconfigured
- ACL order wrong (Dynamic NAT rule processed before PAT rule)

**Check ACL:**
```
Router# show access-lists 10

Standard IP access list 10
    10 permit 192.168.10.0, wildcard bits 0.0.0.255
    ! ERROR: Permits entire subnet, not just 192.168.10.201-210!
```

**Fix:**
```
Router(config)# no access-list 10
Router(config)# access-list 10 permit 192.168.10.201 0.0.0.9
! Correctly permits only 192.168.10.201 through 192.168.10.210
```

**Problem 3: ERP Application Timing Out**

**Symptom:**
- ERP connection drops after 5 minutes
- User must reconnect frequently

**Diagnosis:**
```
Router# show ip nat translations verbose

---  203.0.113.100       192.168.10.201      ---                 ---
  create 00:04:55, use 00:00:02, timeout 00:05:00
  ! Created 4m55s ago, used 2s ago, expires in 5 minutes
  ! Timeout too aggressive for long-running ERP session!
```

**Fix:**
```
Router(config)# ip nat translation tcp-timeout 3600
! 1 hour for TCP connections (ERP uses TCP)
```

**Capacity Planning Exercise:**

**Given:**
- 50 employees
- Historical data shows:
  - 8 AM - 10 AM: 5 concurrent ERP users (avg)
  - 10 AM - 12 PM: 12 concurrent ERP users (peak)
  - 12 PM - 1 PM: 3 concurrent ERP users (lunch)
  - 1 PM - 3 PM: 10 concurrent ERP users
  - 3 PM - 5 PM: 6 concurrent ERP users
- Peak: 12 concurrent users
- Current pool: 10 public IPs

**Analysis:**
- Pool size: 10 IPs
- Peak usage: 12 users
- Shortfall: 2 users will be blocked during peak

**Recommendations:**
1. **Minimum:** Expand pool to 12 IPs (accommodate peak)
2. **Recommended:** Expand pool to 15 IPs (20% buffer)
3. **Monitor:** Track "misses" statistic for actual exhaustion events

**Cost-Benefit:**
- Additional 5 IPs × $30/year = $150/year
- vs. User productivity loss during blocked access = $$ significant
- Conclusion: Small investment for reliability

**Best Practices:**

**1. Separate NAT for Different User Classes:**
- Critical applications: Dynamic NAT (full port access)
- General users: PAT (efficient)
- Servers: Static NAT (predictable)

**2. Size Pools with 20-30% Buffer:**
- Peak usage + 20% buffer = pool size
- Example: 12 peak users → 15 IP pool

**3. Monitor Pool Usage:**
```
! SNMP or syslog alerting when pool > 80%
! Daily review of "misses" count
! Proactive expansion before exhaustion
```

**4. Document and Label:**
```
! Clear descriptions in configuration
access-list 10 remark ERP Workstations - Dynamic NAT Required
ip nat pool ERP_POOL 203.0.113.100 203.0.113.109 netmask 255.255.255.0
! Pool: ERP_POOL, Purpose: ERP application requirements
```

**5. Test Before Deployment:**
- Lab environment with same configuration
- Simulate peak load
- Verify pool doesn't exhaust
- Test timeout behavior

**Reporting and Documentation:**

**Daily Monitoring Report:**
```
Date: 2024-03-15
Branch: Store #42

NAT Pool Usage:
- Pool Name: ERP_POOL
- Total IPs: 10
- Peak Utilization: 7 IPs (70%)
- Average Utilization: 4 IPs (40%)
- Misses: 0
- Status: GREEN

PAT Usage:
- Active Translations: 45
- Status: GREEN

Recommendations: None, capacity sufficient
```

**Key Takeaway:**
Dynamic NAT in branch offices balances limited public IP availability with user connectivity needs. Hybrid approaches (Dynamic NAT for critical apps, PAT for general use) provide optimal resource utilization. Careful capacity planning, monitoring, and appropriate timeouts are essential for success. Pool exhaustion is the primary risk and must be actively monitored and managed.

---

## Slide 11: PAT - Port Address Translation (Most Common NAT Type!)

### Speaker Notes:

PAT (Port Address Translation), also called NAT Overload, is THE most widely deployed NAT type. It's what your home router uses right now. Understanding PAT is essential because it's everywhere.

**What is PAT (Port Address Translation)?**

**Definition:** Translation technique that allows MANY inside local addresses (private IPs) to share ONE or FEW inside global addresses (public IPs) by translating port numbers

**Also Known As:**
- NAT Overload
- Many-to-One NAT
- IP Masquerading (Linux term)
- NAPT (Network Address Port Translation) - IETF term

**Key Difference from Other NAT Types:**
- **Static NAT:** 1 inside local ↔ 1 inside global (one-to-one)
- **Dynamic NAT:** 1 inside local ↔ 1 inside global (from pool, temporary)
- **PAT:** MANY inside locals ↔ 1 inside global (many-to-one with ports!)

**The Magic of PAT - Port Numbers:**

**How PAT Achieves Many-to-One:**
- Uses combination of IP address + port number for uniqueness
- Same public IP, different port = different connection
- Port number field: 16 bits = 65,536 possible ports
- Theoretical maximum: 65,536 simultaneous connections per public IP!

**Example:**
```
3 Inside PCs → 1 Public IP (via different ports)

PC 1: 192.168.1.10:5000 → 203.0.113.50:1025
PC 2: 192.168.1.11:5000 → 203.0.113.50:1026
PC 3: 192.168.1.12:5000 → 203.0.113.50:1027

Same public IP (203.0.113.50), different ports (1025, 1026, 1027)
```

**Why PAT is the Standard:**

**1. Maximum Address Conservation:**
- Thousands of inside hosts share ONE public IP
- Example: Home router with 1 public IP supports 10-50 devices
- Example: Corporate firewall with 5 public IPs supports 5,000 employees

**2. Scalability:**
- Virtually never runs out of capacity
- 60,000+ simultaneous connections per public IP
- Only issue: CPU/memory on NAT device

**3. Cost Savings:**
- Minimal public IPs required
- ISP typically provides 1 public IP (sufficient for most)
- Additional IPs expensive ($30-$50/year each)

**4. Universal Deployment:**
- Every home router uses PAT
- Most corporate firewalls use PAT
- Cloud environments use PAT (AWS NAT Gateway, Azure NAT, etc.)
- Mobile carriers use Carrier-Grade NAT (CGN) with PAT

**How PAT Works - Port Translation:**

**Outbound Translation (Inside → Outside):**

**Original Packet (Inside Network):**
```
Source IP: 192.168.1.10 (Inside Local)
Source Port: 5000 (Original port)
Destination IP: 8.8.8.8 (Outside Global)
Destination Port: 53 (DNS)
```

**After PAT (Outside Network):**
```
Source IP: 203.0.113.50 (Inside Global) ← IP changed
Source Port: 1025 (Translated port) ← PORT changed!
Destination IP: 8.8.8.8 (Unchanged)
Destination Port: 53 (Unchanged)
```

**Key Points:**
- Source IP translated (private → public)
- Source PORT also translated (5000 → 1025)
- Destination unchanged
- Router remembers mapping in NAT table

**Inbound Translation (Outside → Inside):**

**Response Packet (From Internet):**
```
Source IP: 8.8.8.8
Source Port: 53
Destination IP: 203.0.113.50 (Inside Global)
Destination Port: 1025 (Translated port)
```

**Router Looks Up:** Destination IP:Port = 203.0.113.50:1025
**Finds Mapping:** 203.0.113.50:1025 ↔ 192.168.1.10:5000

**After PAT (To Inside Network):**
```
Source IP: 8.8.8.8 (Unchanged)
Source Port: 53 (Unchanged)
Destination IP: 192.168.1.10 (Inside Local) ← IP changed
Destination Port: 5000 (Original port) ← PORT changed!
```

**Key Points:**
- Destination IP translated (public → private)
- Destination PORT translated (1025 → 5000)
- Source unchanged
- Packet delivered to correct inside host

**PAT Table Entry:**

**5-Tuple Identification:**
```
Pro  Inside global       Inside local        Outside local       Outside global
tcp  203.0.113.50:1025   192.168.1.10:5000  93.184.216.34:80   93.184.216.34:80
     ↑ Public IP+Port    ↑ Private IP+Port   ↑ Server IP+Port
     (Translated)        (Original)          (Destination)
```

**Why ALL 5 Elements Matter:**
- Protocol: TCP and UDP use separate port spaces
- Inside Local IP:Port: Identifies original source
- Inside Global IP:Port: Identifies translated source
- Outside Global IP:Port: Identifies destination
- All 5 combined = unique connection

**Port Preservation vs Port Translation:**

**Port Preservation (Attempted First):**
```
Inside: 192.168.1.10:5000 → Outside: 203.0.113.50:5000 (same port)
```
- Router tries to keep original port if available
- Easier troubleshooting (port numbers match)
- Works if port not already in use

**Port Translation (When Necessary):**
```
Inside 1: 192.168.1.10:5000 → Outside: 203.0.113.50:5000
Inside 2: 192.168.1.11:5000 → Outside: 203.0.113.50:1025 (changed!)
                                        ↑ Port 5000 already used, select new
```

- Router changes port if collision
- Ensures uniqueness
- Transparent to end users

**Multiple Simultaneous Connections:**

**Scenario: 5 PCs browsing same website**
```
NAT Table:
Pro  Inside global       Inside local        Outside local       Outside global
tcp  203.0.113.50:1025   192.168.1.10:5001  93.184.216.34:80   93.184.216.34:80
tcp  203.0.113.50:1026   192.168.1.11:5002  93.184.216.34:80   93.184.216.34:80
tcp  203.0.113.50:1027   192.168.1.12:5003  93.184.216.34:80   93.184.216.34:80
tcp  203.0.113.50:1028   192.168.1.13:5004  93.184.216.34:80   93.184.216.34:80
tcp  203.0.113.50:1029   192.168.1.14:5005  93.184.216.34:80   93.184.216.34:80

Same public IP (203.0.113.50), 5 different ports!
```

**Return Traffic Distribution:**
- Response to :1025 → goes to 192.168.1.10:5001
- Response to :1026 → goes to 192.168.1.11:5002
- Response to :1027 → goes to 192.168.1.12:5003
- etc.

**Port distinguishes connections!**

**PAT Configuration:**

**Method 1: Overload with Interface IP**
```
! Most common for single public IP
Router(config)# access-list 1 permit 192.168.1.0 0.0.0.255
Router(config)# ip nat inside source list 1 interface Serial0/0/0 overload
                                                     ↑ Interface      ↑ PAT keyword!

! Uses Serial0/0/0's IP address for PAT
! All inside hosts share this one IP
```

**Method 2: Overload with IP Pool**
```
! For multiple public IPs
Router(config)# access-list 1 permit 192.168.1.0 0.0.0.255
Router(config)# ip nat pool MYPOOL 203.0.113.50 203.0.113.54 netmask 255.255.255.0
Router(config)# ip nat inside source list 1 pool MYPOOL overload
                                                          ↑ PAT keyword!

! Uses IPs from pool with PAT
! Distributes load across 5 public IPs
! Each IP can handle 60,000+ connections
```

**Method 3: Static Port Forwarding (PAT for Servers)**
```
! Forward specific port to inside server
Router(config)# ip nat inside source static tcp 192.168.1.100 80 203.0.113.50 80
                                                ↑ Protocol  ↑ Inside ↑ Outside

! External port 203.0.113.50:80 → Internal server 192.168.1.100:80
! Different from Static NAT (only THIS port forwarded, not all)
```

**Complete PAT Configuration Example:**

**Scenario: Small Office**
- Inside network: 192.168.1.0/24
- 50 users
- 1 public IP: 203.0.113.50 (ISP-assigned to Serial0/0/0)

**Configuration:**
```
! Inside interface
interface GigabitEthernet0/0
 description Inside LAN
 ip address 192.168.1.1 255.255.255.0
 ip nat inside
 no shutdown

! Outside interface
interface Serial0/0/0
 description Internet Connection
 ip address 203.0.113.50 255.255.255.252
 ip nat outside
 no shutdown

! Define inside network
access-list 1 remark Inside Network for PAT
access-list 1 permit 192.168.1.0 0.0.0.255

! Enable PAT (overload)
ip nat inside source list 1 interface Serial0/0/0 overload
```

**Verification:**
```
Router# show ip nat translations

Pro  Inside global       Inside local        Outside local       Outside global
tcp  203.0.113.50:1025   192.168.1.10:5000  8.8.8.8:53         8.8.8.8:53
tcp  203.0.113.50:1026   192.168.1.11:5001  93.184.216.34:80   93.184.216.34:80
tcp  203.0.113.50:1027   192.168.1.12:5002  142.250.80.46:443  142.250.80.46:443
udp  203.0.113.50:1028   192.168.1.13:5003  8.8.8.8:53         8.8.8.8:53
tcp  203.0.113.50:1029   192.168.1.14:5004  13.107.42.14:443   13.107.42.14:443

! All using same public IP (203.0.113.50), different ports!
! Supports 50+ users with ONE public IP
```

**Port Exhaustion (Rare but Possible):**

**Theoretical Maximum:**
- Ports: 0-65535
- Well-known ports (0-1023): Typically not used for NAT
- Available: 1024-65535 = 64,511 ports
- Theoretical capacity: 64,511 simultaneous connections

**Practical Maximum:**
- Router overhead: ~4,000 ports
- Effective capacity: ~60,000 connections per public IP

**When Exhaustion Happens:**
- Heavy P2P usage (BitTorrent, etc.)
- Many simultaneous streaming connections
- Misconfigured applications (connection leaks)
- DDoS attacks

**Signs of Exhaustion:**
```
Router# show ip nat statistics

Hits: 1234567  Misses: 4567  CEF Translated packets: 1234567
Total active translations: 64000 (0 static, 64000 dynamic; 64000 extended)
                            ↑ Very high! Approaching limit

% NAT: translation not found (A)
% NAT: translation not found (B)
! Errors in logs - port exhaustion!
```

**Solutions to Port Exhaustion:**
1. Add more public IPs to pool
2. Reduce timeout (aggressive aging)
3. Clear idle translations
4. Investigate source of excessive connections

**Advantages of PAT:**

**1. Maximum Efficiency:**
- 1 public IP supports thousands of devices
- 99% of address conservation benefit

**2. Cost Effective:**
- Requires minimal public IPs
- Typical home: 1 IP sufficient
- Typical SMB: 1-5 IPs sufficient
- Large enterprise: 10-50 IPs sufficient

**3. Scalability:**
- Scales to support large user populations
- Port space rarely exhausted in practice

**4. Security Through Obscurity:**
- Internal IP structure hidden
- Port randomization adds minor security
- Note: Not real security! Still need firewall

**Disadvantages of PAT:**

**1. Protocol Limitations:**
- Some protocols break (embed IP/port in payload)
- Examples: FTP (active mode), SIP, H.323, IPsec
- Requires Application Layer Gateway (ALG) fixes

**2. Inbound Connection Difficulty:**
- Outside can't initiate connection to inside host
- Must configure port forwarding for servers
- P2P applications struggle

**3. Port Exhaustion (Rare):**
- Heavy usage can exhaust 64K port space
- Requires multiple public IPs or mitigation

**4. Troubleshooting Complexity:**
- Port translation makes packet analysis harder
- Logs show translated IP:port, not original
- Correlation required for forensics

**PAT vs Other NAT Types:**

**PAT vs Static NAT:**
- PAT: Many-to-one (efficient), port translation, outbound-focused
- Static: One-to-one (wasteful), no port translation, bidirectional

**PAT vs Dynamic NAT:**
- PAT: Uses ports (many-to-one), rarely exhausts
- Dynamic: No ports (one-to-one), can exhaust easily

**When to Use:**
- **PAT:** General user internet access (most common!)
- **Static NAT:** Servers needing ALL ports
- **Dynamic NAT:** Legacy apps requiring full IP, limited users

**Real-World PAT Deployment:**

**Home Router:**
- 1 public IP from ISP
- 10-20 devices (phones, laptops, IoT)
- PAT handles all connections
- Typical usage: 50-200 active translations

**Corporate Firewall:**
- 5 public IPs in pool
- 5,000 employees
- PAT with overload
- Typical usage: 10,000-50,000 active translations
- Capacity: 300,000+ potential connections (5 IPs × 60K each)

**ISP Carrier-Grade NAT (CGN):**
- 100 public IPs
- 100,000 subscribers
- Multi-level PAT
- Capacity: 6,000,000 connections

**Teaching Activity:**

**Lab Exercise:**
1. Configure PAT on router
2. Generate traffic from 3 PCs
3. Run `show ip nat translations` - see all using same public IP
4. Note different port numbers
5. Clear one entry, observe re-creation
6. Compare PAT vs Static NAT capacity

**Key Takeaway:**
PAT is the most common NAT type because it provides maximum address conservation by translating both IP addresses and port numbers. Many inside hosts (thousands!) can share one or a few public IPs. Port numbers provide uniqueness. PAT is what home routers and most corporate firewalls use. Understanding PAT is essential for modern networking.

---

## Slide 12: PAT in Action - Home Router Example (What You Use Daily!)

### Speaker Notes:

This slide brings PAT to life with the most relatable example: your home router. Every student uses PAT daily without realizing it. This concrete example makes abstract concepts tangible.

**The Most Common PAT Deployment: Your Home!**

**Typical Home Network:**
- **ISP Connection:** Cable/Fiber/DSL modem
- **Public IP:** ONE address assigned by ISP (e.g., 203.0.113.75)
- **Home Router:** Wireless router (Linksys, Netgear, TP-Link, etc.)
- **Private Network:** 192.168.1.0/24 (default for most home routers)
- **Devices:** 10-20 connected devices

**Your Devices (Inside Local Addresses):**
```
Smartphone: 192.168.1.101
Laptop: 192.168.1.102
Desktop: 192.168.1.103
Tablet: 192.168.1.104
Smart TV: 192.168.1.105
Gaming Console: 192.168.1.106
Smart Speaker: 192.168.1.107
Security Camera: 192.168.1.108
Thermostat: 192.168.1.109
Printer: 192.168.1.110
```

**All these devices share ONE public IP via PAT!**

**Home Router Configuration (Simplified):**

**WAN Interface (Outside):**
```
IP Address: 203.0.113.75 (assigned by ISP via DHCP)
Subnet Mask: 255.255.255.252 (/30 - typical ISP allocation)
Default Gateway: 203.0.113.73 (ISP's router)
DNS: 8.8.8.8, 8.8.4.4
NAT: Enabled (PAT/Overload)
```

**LAN Interface (Inside):**
```
IP Address: 192.168.1.1
Subnet Mask: 255.255.255.0 (/24)
DHCP Server: Enabled (assigns 192.168.1.100-200)
NAT: Inside interface
```

**Automatic PAT:**
- Home routers enable PAT by default
- No manual configuration required
- Transparent to users

**Real-World Scenario: Family Internet Usage**

**5 PM - Everyone's Home:**

**Mom's Laptop (192.168.1.102):**
- Checking email (gmail.com)
- Shopping on Amazon
- Watching YouTube video

**Dad's Desktop (192.168.1.103):**
- Work VPN connection
- Video conference (Zoom)
- Downloading files

**Teenager's Smartphone (192.168.1.101):**
- Instagram scrolling
- Spotify streaming
- iMessage with friends

**Smart TV (192.168.1.105):**
- Netflix streaming (4K)

**Gaming Console (192.168.1.106):**
- Online multiplayer game

**NAT Table in Home Router (Simplified View):**

```
Proto  Inside Local           Inside Global          Outside Global
tcp    192.168.1.102:50001   203.0.113.75:1025     142.251.40.165:443  (Gmail)
tcp    192.168.1.102:50002   203.0.113.75:1026     54.239.28.85:443    (Amazon)
tcp    192.168.1.102:50003   203.0.113.75:1027     172.217.14.206:443  (YouTube)
tcp    192.168.1.103:50004   203.0.113.75:1028     20.42.65.92:443     (Work VPN)
tcp    192.168.1.103:50005   203.0.113.75:1029     3.235.69.14:443     (Zoom)
tcp    192.168.1.103:50006   203.0.113.75:1030     13.107.42.14:80     (Download)
tcp    192.168.1.101:50007   203.0.113.75:1031     31.13.86.36:443     (Instagram)
tcp    192.168.1.101:50008   203.0.113.75:1032     35.186.224.47:443   (Spotify)
tcp    192.168.1.105:50009   203.0.113.75:1033     198.38.96.143:443   (Netflix)
tcp    192.168.1.106:50010   203.0.113.75:1034     192.0.2.50:3074     (Gaming)

All using SAME public IP: 203.0.113.75
Different port numbers distinguish connections!
```

**How Each Connection Works:**

**Example 1: Mom Checking Gmail**

**Step 1: Mom clicks "Check Mail"**
```
Laptop creates packet:
  Source: 192.168.1.102:50001 (laptop's private IP + random port)
  Destination: 142.251.40.165:443 (mail.google.com HTTPS)
```

**Step 2: Packet reaches home router**
```
Router checks: Source is inside network (192.168.1.x)
Router checks NAT table: No existing entry for this connection
Router creates new entry:
  Inside Local: 192.168.1.102:50001
  Inside Global: 203.0.113.75:1025 (router's public IP + available port)
```

**Step 3: Router translates packet**
```
BEFORE PAT:
  Source: 192.168.1.102:50001
  Destination: 142.251.40.165:443

AFTER PAT:
  Source: 203.0.113.75:1025 ← Translated!
  Destination: 142.251.40.165:443
```

**Step 4: Gmail server responds**
```
Gmail sees request from: 203.0.113.75:1025
Gmail responds to: 203.0.113.75:1025
  Source: 142.251.40.165:443
  Destination: 203.0.113.75:1025
```

**Step 5: Response reaches home router**
```
Router looks up: Destination 203.0.113.75:1025 in NAT table
Finds: 203.0.113.75:1025 → 192.168.1.102:50001
Router translates:
  Source: 142.251.40.165:443
  Destination: 192.168.1.102:50001 ← Translated back!
```

**Step 6: Laptop receives Gmail response**
```
Mom's laptop receives email data
Browser displays inbox
Mom has no idea NAT happened!
```

**Example 2: Teenager Streaming Spotify**

**Simultaneous to Gmail connection above:**
```
Smartphone (192.168.1.101:50007) → Spotify (35.186.224.47:443)

Router NAT:
  Inside: 192.168.1.101:50007
  Outside: 203.0.113.75:1032 ← Different port!

Spotify sees request from: 203.0.113.75:1032
Streams music to: 203.0.113.75:1032
Router translates back to: 192.168.1.101:50007
Smartphone receives music stream
```

**Both connections use same public IP (203.0.113.75) but different ports!**

**What the ISP Sees:**

**From ISP's Perspective:**
```
All traffic appears to come from: 203.0.113.75
ISP has NO VISIBILITY into:
  - How many devices behind router
  - What specific devices doing what
  - Internal IP addresses (192.168.1.x)

ISP only sees:
  - Aggregate bandwidth usage
  - Public IP (203.0.113.75) making many connections
  - Destination servers (Google, Netflix, etc.)
```

**Benefits to Homeowner:**
- Privacy: Internal network structure hidden
- Cost: Only pay for 1 public IP
- Simplicity: Plug and play, automatic NAT

**Port Forwarding in Home Routers:**

**Problem: Running Server at Home**
- Want to host Minecraft server (192.168.1.103:25565)
- Friends need to connect from internet
- PAT blocks unsolicited inbound connections
- Solution: Port Forwarding!

**Port Forwarding Configuration (Web GUI):**
```
Port Forwarding Rule:
  External Port: 25565 (TCP)
  Internal IP: 192.168.1.103
  Internal Port: 25565
  Protocol: TCP
  Description: Minecraft Server
```

**What This Does:**
```
Creates static PAT rule:
  203.0.113.75:25565 → 192.168.1.103:25565

External connection to 203.0.113.75:25565 → forwarded to internal server
```

**Friends Connect:**
```
Friend's Minecraft client connects to: 203.0.113.75:25565
Home router receives connection
Checks port forwarding rules: Port 25565 → 192.168.1.103
Translates and forwards to internal server
Server responds, router translates back
Friend successfully connected!
```

**Common Home Port Forwarding:**
- **Minecraft Server:** Port 25565 (TCP)
- **Web Server:** Port 80 (HTTP), 443 (HTTPS)
- **Remote Desktop:** Port 3389 (TCP)
- **FTP Server:** Port 21 (TCP)
- **Security Camera DVR:** Various ports (8080, etc.)

**UPnP (Universal Plug and Play):**

**Automatic Port Forwarding:**
- Applications can request port forwarding automatically
- Xbox, PlayStation, gaming PCs use UPnP
- Router opens ports dynamically when app requests

**Example:**
```
Xbox starts party chat
Xbox sends UPnP request to router: "Open port 3074 for me"
Router creates dynamic port forwarding: 203.0.113.75:3074 → 192.168.1.106:3074
When done, Xbox sends: "Close port 3074"
Router removes forwarding rule
```

**Security Concern:**
- UPnP can be exploited by malware
- Malware can open ports without user knowledge
- Recommendation: Disable UPnP if not needed
- Manual port forwarding more secure

**Home Router NAT Statistics:**

**Typical Metrics:**
```
Home Router Status Page:

WAN IP Address: 203.0.113.75
Active Connections: 87
Peak Connections Today: 143
NAT Table Size: 4,096 entries max
Current Usage: 87 (2%)
Uptime: 15 days, 7 hours

Top Connections:
  192.168.1.105 (Smart TV): 23 connections (Netflix, YouTube)
  192.168.1.102 (Laptop): 18 connections (Web browsing)
  192.168.1.101 (Smartphone): 15 connections (Apps, streaming)
  192.168.1.103 (Desktop): 12 connections (Downloads, Zoom)
```

**Home Network Security via PAT:**

**Security Benefits (Limited):**
- Unsolicited inbound blocked by default
- Internal IPs hidden from internet
- Basic firewall behavior (stateful)

**What PAT Does NOT Provide:**
- Application-layer security (web attacks, malware)
- Outbound filtering (your devices can access bad sites)
- Protection against compromised internal devices
- DDoS protection

**Additional Security Recommendations:**
- Enable router firewall (most have basic firewall features)
- Disable UPnP unless needed
- Change default router password
- Keep router firmware updated
- Use WPA3 WiFi encryption
- Disable WPS (WiFi Protected Setup - insecure)

**Troubleshooting Home PAT Issues:**

**Problem 1: "Why is my public IP different than my device IP?"**

**User Confusion:**
```
User checks IP on device: ipconfig shows 192.168.1.102
User visits whatismyip.com: shows 203.0.113.75
User: "Why are these different?"
```

**Explanation:**
- Device IP (192.168.1.102): Inside Local (private IP)
- Website shows (203.0.113.75): Inside Global (public IP after PAT)
- PAT translates private → public
- Both are "your IP" from different perspectives

**Problem 2: Port Forwarding Not Working**

**Symptom:**
- Configured port forwarding for Minecraft
- Friends can't connect

**Common Causes:**
1. Internal server IP changed (DHCP reassigned different IP)
   - Solution: Configure DHCP reservation (static IP for server)
2. Server firewall blocking port
   - Solution: Allow port in Windows Firewall / iptables
3. ISP blocking port (common for residential connections)
   - Solution: Use different port or business internet
4. External IP changed (ISP uses dynamic IP)
   - Solution: Use Dynamic DNS (DDNS) service

**Problem 3: Gaming / VoIP Issues**

**Symptom:**
- Can't join game lobbies
- Voice chat doesn't work (one-way audio)
- NAT Type shows "Strict" or "Moderate"

**Cause:**
- Symmetric NAT (some home routers)
- Port allocation issues
- UPnP not working

**Solutions:**
1. Enable UPnP on router
2. Configure port forwarding for game/app
3. Enable DMZ for gaming console (less secure, but works)
4. Check NAT Type in console settings

**Comparing Home to Commercial:**

**Home Router PAT:**
- 1 public IP
- 10-50 devices
- 50-500 simultaneous connections
- Consumer-grade hardware
- Cost: $50-$200
- Automatic configuration

**Commercial Firewall PAT:**
- 5-50 public IPs
- 1,000-10,000 devices
- 50,000-500,000 simultaneous connections
- Enterprise-grade hardware
- Cost: $5,000-$50,000+
- Manual configuration, advanced features

**Both use same PAT principles!**

**Demonstration Activity:**

**In-Class Demo:**
1. Connect laptop to instructor's WiFi
2. Check private IP: `ipconfig` (192.168.x.x)
3. Visit whatismyip.com: See public IP (different!)
4. Generate traffic (browse websites)
5. Show Wireshark capture:
   - Before router: See private IP
   - After router: See public IP (if captured on WAN side)
6. Discuss: "Did you notice NAT happening?" (No - transparent!)

**Student Activity:**

**Home Network Exploration:**
1. Check device IP address (Settings → Network)
2. Check router's public IP (whatismyip.com)
3. Log into home router (usually 192.168.1.1 or 192.168.0.1)
4. Find NAT/Connection table (may be called "Device List" or "DHCP Clients")
5. Count connected devices
6. Check active connections (if router shows this)
7. Document: How many devices sharing one public IP?

**Key Takeaway:**
Your home router uses PAT to allow all your devices (10-20+) to share a single public IP address provided by your ISP. Port numbers distinguish between simultaneous connections from different devices. PAT is transparent - you use it every day without knowing! Port forwarding enables hosting servers behind PAT. Understanding your home network helps you understand PAT concepts in enterprise environments.

---

**[Continuing with slides 13-18 in next section due to length constraints...]**

