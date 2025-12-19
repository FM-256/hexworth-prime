# TCP/IP & Three-Way Handshake - Speaker Notes

**Prepared by:** EQ6
**Subject:** Network Essentials - TCP/IP Protocol
**Presentation File:** tcp-presentation.html
**Total Slides:** 18
**Estimated Teaching Time:** 60-90 minutes

---

## Overview

This presentation covers the Transmission Control Protocol (TCP), focusing on the three-way handshake that establishes reliable connections. TCP is fundamental to understanding how the internet works - every web page, email, and file transfer depends on TCP's reliable delivery mechanisms.

**Prerequisites:**
- Basic understanding of the OSI model (especially Layers 3 and 4)
- IP addressing fundamentals
- Familiarity with client-server architecture

**Learning Objectives:**
By the end of this presentation, students will be able to:
1. Explain why TCP is necessary on top of IP
2. Identify and describe TCP header fields
3. Demonstrate understanding of the three-way handshake
4. Differentiate between TCP and UDP use cases
5. Troubleshoot common TCP connection problems
6. Understand TCP security considerations

---

## Slide 1: Title Slide

### Speaker Notes:

Welcome to today's presentation on TCP/IP and the Three-Way Handshake. This is foundational knowledge that every network professional needs to master.

**Key Points to Emphasize:**
- TCP is one of the **most important protocols** in networking
- Every time you browse the web, send an email, or download a file - TCP is working
- Understanding TCP helps with **troubleshooting**, **security**, and **performance optimization**
- This knowledge is essential for **CCNA**, **Network+**, and **real-world IT careers**

**Engagement:**
- Ask: "What happens when you click a link in your web browser?"
- Ask: "Has anyone ever seen a 'connection timed out' error? What do you think causes that?"
- Ask: "Who has used Wireshark or tcpdump before?"

**Real-World Hook:**
"Every single day, trillions of TCP connections are established across the internet. Right now, your devices probably have dozens of active TCP connections - to web servers, email servers, cloud services. Understanding TCP means understanding how the internet actually works."

---

## Slide 2: The Need for Reliable Communication

### Speaker Notes:

This slide explains WHY TCP exists. The key insight is that IP alone is **unreliable** - it's "best effort" only.

**IP Alone - The Problem:**

**Best-Effort Delivery:**
- IP (Internet Protocol) does NOT guarantee delivery
- Packets can be lost due to:
  - Router congestion (buffer overflow)
  - Network failures
  - TTL expiration
  - Checksum errors
- IP has no mechanism to detect or recover from loss

**Out-of-Order Arrival:**
- Packets can take different routes through the network
- Packet 1, 2, 3 sent might arrive as 2, 3, 1
- IP doesn't care about order
- Application would receive jumbled data

**No Error Recovery:**
- If something goes wrong, IP just drops the packet
- No notification to sender
- No automatic retransmission

**Analogy - The Postal System:**
- IP is like regular mail - you drop it in the mailbox and hope it arrives
- No tracking, no confirmation, no guarantee
- TCP is like certified mail with delivery confirmation and signature

**TCP Adds Reliability:**

**Guaranteed Delivery:**
- Acknowledgment system confirms receipt
- Sender knows exactly what was received
- Missing data is retransmitted

**In-Order Delivery:**
- Sequence numbers track packet order
- Receiver reassembles packets correctly
- Application sees data in original order

**Error Detection:**
- Checksum detects corrupted data
- Corrupted packets are discarded and retransmitted

**Flow Control:**
- Prevents fast sender from overwhelming slow receiver
- Window mechanism throttles transmission rate

**Congestion Control:**
- Adjusts sending rate based on network conditions
- Prevents network collapse from too much traffic

**Teaching Tip:**
Draw a diagram showing:
1. Client sending packets 1, 2, 3
2. Network dropping packet 2
3. With IP only: Client doesn't know, receiver gets corrupted data
4. With TCP: Client detects loss, retransmits, receiver gets complete data

**Demo Opportunity:**
- Use `ping` with different sizes to show packet loss on unreliable networks
- Show Wireshark capture of TCP retransmission

---

## Slide 3: TCP Header Format - Essential Fields

### Speaker Notes:

The TCP header is information-dense. Every field serves a critical purpose. Walk through each field methodically.

**Header Structure Overview:**
- Minimum size: **20 bytes** (no options)
- Maximum size: **60 bytes** (with options)
- Most common: 20-32 bytes

**Field-by-Field Breakdown:**

**Source Port (16 bits):**
- Identifies the sending application
- Range: 0-65535
- Client typically uses **ephemeral port** (49152-65535)
- Example: Your browser might use port 54321

**Destination Port (16 bits):**
- Identifies the receiving application
- Range: 0-65535
- Server typically uses **well-known port**
- Example: Web server listens on port 80 or 443

**Sequence Number (32 bits):**
- Tracks position of data in byte stream
- Initial value is random (ISN - Initial Sequence Number)
- Increments by number of bytes sent
- Used for ordering and duplicate detection
- **Important:** This is byte-level, not packet-level!

**Acknowledgment Number (32 bits):**
- Tells sender: "I've received all bytes up to this number"
- "Next byte I expect is..."
- Only valid when ACK flag is set

**Data Offset (4 bits):**
- Also called "Header Length"
- Specifies where data begins
- Measured in 32-bit words (multiply by 4 for bytes)
- Minimum value: 5 (5 × 4 = 20 bytes)
- Maximum value: 15 (15 × 4 = 60 bytes)

**Reserved (3 bits):**
- Reserved for future use
- Should always be zero
- Sometimes used for ECN (Explicit Congestion Notification)

**Flags (9 bits):**
- Control bits that manage connection state
- Covered in detail on next slide

**Window Size (16 bits):**
- Flow control mechanism
- "How much buffer space I have available"
- Receiver tells sender how much data it can accept
- Window scaling option can increase this

**Checksum (16 bits):**
- Error detection for header and data
- Computed over pseudo-header (includes IP addresses)
- If checksum fails, packet is silently discarded

**Urgent Pointer (16 bits):**
- Used with URG flag
- Points to urgent data that should be processed immediately
- Rarely used in modern applications

**Options (0-40 bytes):**
- Variable length optional fields
- Common options:
  - **MSS** (Maximum Segment Size) - negotiated during handshake
  - **Window Scale** - allows windows larger than 65535
  - **SACK** (Selective Acknowledgment) - efficiency improvement
  - **Timestamps** - RTT calculation and PAWS

**Teaching Tip:**
- Use the ASCII art diagram in the slide
- Point to each field as you explain it
- Relate each field back to a real-world scenario

**Exam Tip:**
"Know that TCP header is minimum 20 bytes, and that sequence numbers are 32-bit (allowing tracking of 4GB of data before wrapping)."

---

## Slide 4: TCP Flags and Control Bits

### Speaker Notes:

The TCP flags are the "control signals" of TCP. Understanding them is critical for troubleshooting and security analysis.

**The Six Primary Flags:**

**SYN (Synchronize):**
- Purpose: Initiate a connection
- When used: First two packets of three-way handshake
- Sets: Initial Sequence Number
- Security note: SYN floods are a classic DoS attack
- Mnemonic: "SYN = Start Your Negotiation"

**ACK (Acknowledgment):**
- Purpose: Confirm receipt of data
- When used: **Almost every packet** after initial SYN
- Contains: Acknowledgment number field
- Key insight: ACK doesn't mean "I got your packet" - it means "I got all bytes up to this number"

**FIN (Finish):**
- Purpose: Gracefully close connection
- When used: When application is done sending data
- Important: Each side sends its own FIN
- Result: Four-way close (FIN, ACK, FIN, ACK) - sometimes three-way if FIN-ACK combined

**RST (Reset):**
- Purpose: Immediately terminate connection
- When used: Error conditions, security violations
- Causes:
  - Connection to closed port
  - Invalid sequence number
  - Firewall rejection
  - Application crash
- Note: No acknowledgment required - connection immediately terminated

**PSH (Push):**
- Purpose: Deliver data to application immediately
- When used: Interactive applications (SSH, Telnet)
- Without PSH: Data buffered until buffer full or timeout
- With PSH: Data pushed to application right away
- Example: When you type a command in SSH, PSH ensures immediate delivery

**URG (Urgent):**
- Purpose: Indicate urgent data that bypasses normal queue
- When used: Rarely in modern applications
- Example: Telnet interrupt character (Ctrl+C)
- Note: Largely deprecated - most applications use out-of-band signaling instead

**Additional Flags (ECN):**
- **ECE** (ECN-Echo): Congestion notification
- **CWR** (Congestion Window Reduced): Response to ECE
- **NS** (Nonce Sum): ECN protection

**Flag Combinations:**

| Combination | Meaning | When Seen |
|-------------|---------|-----------|
| SYN | Connection request | Handshake step 1 |
| SYN+ACK | Connection accepted | Handshake step 2 |
| ACK | Acknowledgment / data | Normal operation |
| FIN+ACK | Close request | Connection termination |
| RST | Abort connection | Error / security |
| RST+ACK | Reject connection | Refused connection |
| PSH+ACK | Deliver immediately | Interactive traffic |

**Troubleshooting with Flags:**

**Seeing lots of RST packets?**
- Port not listening
- Firewall blocking
- Application crashed
- Network attack

**Seeing SYN but no SYN-ACK?**
- Server not listening on port
- Firewall blocking
- Server overloaded

**Demo Opportunity:**
- Wireshark filter: `tcp.flags.syn == 1`
- Show a normal handshake
- Show an RST when connecting to closed port

---

## Slide 5: Understanding TCP Ports

### Speaker Notes:

Ports are fundamental to understanding how multiple applications share a single IP address.

**The Port Concept:**

**Why Ports Exist:**
- Single computer can run many applications
- All share one IP address
- Need way to direct traffic to correct application
- Port numbers provide application-level addressing

**Analogy - Apartment Building:**
- IP address = Building address (123 Main Street)
- Port number = Apartment number (Apt 443)
- Mail carrier (IP) delivers to building
- Doorman (TCP) directs to correct apartment

**Port Ranges:**

**Well-Known Ports (0-1023):**
- Reserved by IANA for standard services
- Require administrator/root privileges to bind
- Examples: HTTP (80), HTTPS (443), SSH (22)
- Memorize common ports for certification exams!

**Registered Ports (1024-49151):**
- Used by user applications and services
- Can be registered with IANA but not required
- Examples: MySQL (3306), PostgreSQL (5432), RDP (3389)

**Dynamic/Ephemeral Ports (49152-65535):**
- Client-side temporary ports
- Assigned by OS when making outbound connection
- Released when connection closes
- Different ranges on different OS:
  - Linux: 32768-60999
  - Windows: 49152-65535
  - BSD: 1024-5000 (legacy)

**Socket = IP Address + Port:**
- Complete address for TCP communication
- Example: 192.168.1.100:54321 → 203.0.113.50:443
- Written as IP:Port

**Must-Know Ports for Exams:**

| Port | Protocol | Service | Notes |
|------|----------|---------|-------|
| 20-21 | TCP | FTP | Data (20), Control (21) |
| 22 | TCP | SSH | Secure shell, SCP, SFTP |
| 23 | TCP | Telnet | Unencrypted - avoid! |
| 25 | TCP | SMTP | Email sending |
| 53 | TCP/UDP | DNS | Queries (UDP), Zone transfers (TCP) |
| 67-68 | UDP | DHCP | Server (67), Client (68) |
| 80 | TCP | HTTP | Unencrypted web |
| 110 | TCP | POP3 | Email retrieval |
| 143 | TCP | IMAP | Email retrieval |
| 443 | TCP | HTTPS | Encrypted web |
| 445 | TCP | SMB | Windows file sharing |
| 3389 | TCP | RDP | Remote Desktop |

**Teaching Tip:**
"Every time you browse to a website, your browser picks a random ephemeral port (like 54321) and connects to the server's port 443. The server's response comes back to your ephemeral port."

**Demo Opportunity:**
```bash
# Show active connections
netstat -an | grep ESTABLISHED
ss -tan state established

# Show listening ports
netstat -an | grep LISTEN
ss -tan state listen
```

---

## Slide 6: TCP Connection States

### Speaker Notes:

TCP is a **state machine**. Understanding states is crucial for troubleshooting connection problems.

**Why States Matter:**
- TCP tracks connection lifecycle
- Each state has specific behavior
- Stuck in wrong state = problem
- `netstat` and `ss` show connection states

**State Definitions:**

**CLOSED:**
- No connection exists
- Starting and ending state
- No resources allocated

**LISTEN:**
- Server waiting for incoming connections
- Socket bound to port
- Waiting for SYN packets
- Example: Web server listening on port 443

**SYN-SENT:**
- Client sent SYN, waiting for SYN-ACK
- Timeout if no response (typically 21-75 seconds)
- Can indicate:
  - Server not running
  - Firewall blocking
  - Network issue

**SYN-RECEIVED:**
- Server received SYN, sent SYN-ACK, waiting for ACK
- Resources allocated for potential connection
- Security concern: SYN floods exhaust resources here

**ESTABLISHED:**
- **Connection fully open!**
- Bidirectional data transfer possible
- This is the "happy state" - where you want to be
- Connection remains here until close initiated

**FIN-WAIT-1:**
- Local application closed, FIN sent
- Waiting for ACK or FIN from remote

**FIN-WAIT-2:**
- Received ACK for our FIN
- Waiting for remote's FIN
- Remote application hasn't closed yet

**CLOSE-WAIT:**
- Received FIN from remote
- Our ACK sent, waiting for local application to close
- If stuck here: Application bug (not closing socket)

**LAST-ACK:**
- Sent our FIN after receiving remote's FIN
- Waiting for final ACK

**TIME-WAIT:**
- After receiving final ACK
- Waits 2×MSL (Maximum Segment Lifetime)
- Typically 60-120 seconds
- Purpose: Ensure final ACK delivered, prevent old packets from being accepted
- Can cause port exhaustion on busy servers

**CLOSING:**
- Both sides sent FIN simultaneously
- Rare state (simultaneous close)

**Common Problems:**

**Lots of TIME-WAIT connections?**
- Normal on busy web servers
- Each closed connection stays 60+ seconds
- Solution: Connection pooling, `SO_REUSEADDR`

**Connections stuck in CLOSE-WAIT?**
- Application bug - not closing sockets properly
- Resources leaking
- Fix: Check application code

**Connections stuck in SYN-RECEIVED?**
- Possible SYN flood attack
- Enable SYN cookies
- Check firewall/IPS

**Demo Commands:**
```bash
# View all connection states
netstat -an | awk '{print $6}' | sort | uniq -c | sort -rn

# Linux - detailed state view
ss -tan state time-wait
ss -tan state established
ss -tan state syn-recv
```

---

## Slide 7: The Three-Way Handshake - Introduction

### Speaker Notes:

This is the **heart of the presentation**. The three-way handshake is how TCP establishes a reliable connection.

**Why Three Steps?**

**Two-Way Wouldn't Work:**
- Client sends SYN
- Server sends ACK
- Problem: Server doesn't know if client received ACK
- No confirmation of bidirectional communication

**Three-Way Ensures:**
1. Client can reach server ✓
2. Server can reach client ✓
3. Both sides ready for data ✓
4. Initial sequence numbers exchanged ✓

**The Handshake Process:**

**Step 1: SYN (Client → Server)**
- "Hello, I want to connect"
- Client's initial sequence number

**Step 2: SYN-ACK (Server → Client)**
- "Hello, I accept your connection"
- Server's initial sequence number
- Acknowledges client's SYN

**Step 3: ACK (Client → Server)**
- "Thank you, let's communicate"
- Acknowledges server's SYN
- Connection ESTABLISHED

**Initial Sequence Numbers (ISN):**

**Why Random ISNs?**
- Security: Prevent sequence number prediction attacks
- Uniqueness: Distinguish old packets from new connections
- Implementation: Clock-based plus random component

**What Could Go Wrong with Predictable ISNs?**
- Attacker predicts server's ISN
- Attacker sends spoofed packet with correct sequence number
- Can inject data into existing connection
- Famous attack: Kevin Mitnick (1994)

**Analogy - Phone Call:**
1. You call someone (SYN) - "Ring ring"
2. They answer (SYN-ACK) - "Hello?"
3. You respond (ACK) - "Hi, it's me"
4. Now you can talk (ESTABLISHED)

**Performance Consideration:**

**Latency Impact:**
- Handshake requires 1.5 round trips
- LAN (1ms RTT): ~2ms delay
- Coast to coast (50ms RTT): ~100ms delay
- Transatlantic (150ms RTT): ~300ms delay

**This is why:**
- HTTP/2 uses single connection with multiplexing
- HTTP/3 (QUIC) uses 0-RTT connection establishment
- TLS 1.3 supports 0-RTT resumption

**Demo Opportunity:**
- Wireshark filter: `tcp.flags.syn == 1 && tcp.flags.ack == 0` (SYN only)
- Show the three packets of handshake
- Point out sequence numbers

---

## Slide 8: Handshake Step 1 - Client Sends SYN

### Speaker Notes:

Let's examine the first step in detail. The client initiates the connection.

**What Happens:**
1. Application calls `connect()` system call
2. OS generates random Initial Sequence Number (ISN)
3. TCP creates SYN packet with ISN
4. Packet sent to server's IP and port
5. Client enters SYN-SENT state
6. Timer starts for SYN timeout

**SYN Packet Contents:**

**Flags:**
- SYN = 1 (connection request)
- ACK = 0 (no acknowledgment yet)

**Sequence Number:**
- Random value (ISN)
- Example: 1000
- This will be the starting point for client's data

**Acknowledgment Number:**
- Not used (typically 0)
- ACK flag not set

**Source Port:**
- Ephemeral port assigned by OS
- Example: 54321

**Destination Port:**
- Target service port
- Example: 80 (HTTP), 443 (HTTPS)

**Window Size:**
- Initial receive window
- Tells server how much buffer space client has

**Options (commonly included):**
- **MSS** (Maximum Segment Size): "I can receive segments up to X bytes"
- **Window Scale**: "Multiply my window by 2^X"
- **SACK Permitted**: "I support selective acknowledgments"
- **Timestamps**: "Let's track RTT"

**Client State Transition:**
- Before: CLOSED
- After: SYN-SENT

**What Can Go Wrong:**

**SYN never arrives:**
- Routing problem
- Firewall drops packet
- Server IP incorrect

**No SYN-ACK received:**
- Client retransmits SYN (exponential backoff)
- Typical sequence: 1s, 2s, 4s, 8s, 16s, 32s
- After ~6 attempts (about 75 seconds), give up
- Application sees "Connection timed out"

**RST received:**
- Server port not open
- Firewall actively rejecting
- Application sees "Connection refused"

**Teaching Tip:**
"The SYN packet is like knocking on someone's door. You're announcing your presence and waiting for a response."

---

## Slide 9: Handshake Step 2 - Server Responds with SYN-ACK

### Speaker Notes:

The server responds, acknowledging the client and making its own introduction.

**What Happens:**
1. Server receives SYN packet
2. If port is listening, server processes SYN
3. Server generates its own ISN
4. Server creates SYN-ACK packet
5. Packet sent back to client
6. Server enters SYN-RECEIVED state

**SYN-ACK Packet Contents:**

**Flags:**
- SYN = 1 (server's own connection request)
- ACK = 1 (acknowledging client's SYN)

**Sequence Number:**
- Server's random ISN
- Example: 5000
- Starting point for server's data

**Acknowledgment Number:**
- Client's ISN + 1
- Example: 1001 (if client sent 1000)
- "I received your SYN, next byte I expect is 1001"

**Why ACK = ISN + 1?**
- SYN consumes one sequence number
- Like sending 1 byte of invisible data
- Same for FIN

**Options Negotiation:**
- Server includes its own MSS
- Both sides use lower MSS
- Window scale, SACK negotiated

**Server State Transition:**
- Before: LISTEN
- After: SYN-RECEIVED

**Resource Allocation:**

**TCP Control Block (TCB):**
- Server allocates memory for connection tracking
- Stores: Sequence numbers, window sizes, timers, state
- This is why SYN floods are dangerous!

**Security Issue - SYN Flood:**

**Attack Mechanism:**
1. Attacker sends thousands of SYN packets
2. Uses spoofed source IP addresses
3. Server allocates TCB for each SYN
4. Server sends SYN-ACK to spoofed addresses
5. No ACK comes back (spoofed IPs)
6. Server runs out of memory for new connections
7. Legitimate users can't connect

**Defenses:**

**SYN Cookies:**
- Don't allocate resources until ACK received
- Encode state in sequence number
- Stateless until handshake complete

**Rate Limiting:**
- Limit SYN packets per second per source IP
- Block known-bad IP ranges

**SYN Proxy:**
- Firewall/load balancer completes handshake first
- Only forwards to server if legitimate

**Teaching Tip:**
"The SYN-ACK is like answering the door and saying 'Come in!' - but you're also introducing yourself."

---

## Slide 10: Handshake Step 3 - Client Confirms with ACK

### Speaker Notes:

The final step completes the handshake. Connection is now ESTABLISHED.

**What Happens:**
1. Client receives SYN-ACK
2. Client verifies sequence numbers
3. Client sends ACK packet
4. Client enters ESTABLISHED state
5. When server receives ACK, server enters ESTABLISHED

**ACK Packet Contents:**

**Flags:**
- SYN = 0 (no more SYN needed)
- ACK = 1 (acknowledging server's SYN)

**Sequence Number:**
- Client's ISN + 1
- Example: 1001

**Acknowledgment Number:**
- Server's ISN + 1
- Example: 5001
- "I received your SYN, ready for your data"

**First Data Can Be Sent:**
- This ACK packet can include data!
- Some implementations do this for efficiency
- Called "piggyback" - ACK rides with data

**State Transitions:**
- Client: SYN-SENT → ESTABLISHED
- Server: SYN-RECEIVED → ESTABLISHED

**The "Magic" Moment:**
- Both sides synchronized
- Both know initial sequence numbers
- Both confirmed bidirectional communication
- Ready for data transfer

**Sequence Number Summary:**

| Step | From | Seq | Ack | Notes |
|------|------|-----|-----|-------|
| 1 | Client | 1000 | - | Client's ISN |
| 2 | Server | 5000 | 1001 | Server's ISN, ACK client |
| 3 | Client | 1001 | 5001 | ACK server, ready |

**After Handshake:**
- Next client data: Seq 1001, increasing by bytes sent
- Next server data: Seq 5001, increasing by bytes sent
- Both track what they've received via ACK numbers

**Demo Commands:**
```bash
# Watch connection establishment
tcpdump -i eth0 'tcp[tcpflags] & (tcp-syn|tcp-ack) != 0'

# In Wireshark
Filter: tcp.flags.syn == 1 || tcp.flags.ack == 1
```

**Troubleshooting - No ACK:**
- Client sends ACK but server doesn't receive
- Server retransmits SYN-ACK
- Eventually times out
- Check for asymmetric routing issues

---

## Slide 11: The Three-Way Handshake - Complete Sequence

### Speaker Notes:

This slide shows the complete handshake animation. Use it to reinforce the timing and flow.

**Complete Timeline:**

```
Time (ms)   Direction       Flags       Seq     Ack     State Changes
─────────────────────────────────────────────────────────────────────
0           Client→Server   SYN         1000    -       Client: SYN-SENT
~1          Server→Client   SYN+ACK     5000    1001    Server: SYN-RECEIVED
~2          Client→Server   ACK         1001    5001    Both: ESTABLISHED
```

**Round-Trip Time (RTT):**

**Definition:**
- Time for packet to go out and response to come back
- Measure of network latency
- Critical for TCP performance

**RTT Examples:**
- Same machine (localhost): ~0.1ms
- Same LAN: 0.5-2ms
- Same data center: 1-5ms
- Same city: 5-20ms
- Same country: 20-50ms
- Intercontinental: 100-200ms
- Satellite: 500-700ms

**Handshake Latency:**
- Requires 1.5 round trips (SYN, SYN-ACK, ACK, then data)
- Actual formula: RTT * 1.5 (approximately)
- LAN: ~3ms total
- Transcontinental: ~150ms total
- This is unavoidable overhead with TCP!

**Why This Matters:**

**Web Performance:**
- Each new TCP connection adds RTT * 1.5
- Opening 10 connections to load a page = 10 × handshake delay
- This is why HTTP/2 uses single multiplexed connection
- This is why HTTP/3 (QUIC) eliminates TCP handshake

**Database Performance:**
- Connection pooling reuses established connections
- Avoids handshake overhead for each query

**API Design:**
- Keep connections alive when possible
- Use HTTP Keep-Alive header

**Teaching Tip:**
Let the animation run a few times while explaining. Point out:
1. The color coding (red=SYN, green=SYN-ACK, blue=ACK)
2. The timing relationship
3. How states change on each side

**Class Activity:**
"Let's calculate handshake time. If RTT to Google is 20ms, how long does the three-way handshake take?"
Answer: ~30ms (1.5 × RTT)

---

## Slide 12: Understanding Sequence and Acknowledgment Numbers

### Speaker Notes:

Sequence numbers are how TCP tracks data. This is essential for understanding reliability.

**How Sequence Numbers Work:**

**Byte-Level Tracking:**
- Sequence number = byte position in stream
- NOT packet number!
- If you send 100 bytes starting at Seq 1001, next Seq will be 1101

**Example Flow:**

```
Connection established: Client Seq=1001, Server Seq=5001

Client sends 100 bytes:
  Seq=1001, Data=100 bytes

Server acknowledges:
  Ack=1101 ("I received bytes 1001-1100, next I expect 1101")

Client sends 200 more bytes:
  Seq=1101, Data=200 bytes

Server acknowledges:
  Ack=1301 ("I received bytes 1101-1300, next I expect 1301")
```

**Key Insight - Cumulative Acknowledgment:**
- ACK means "I've received all bytes up to this number"
- If Ack=1301, it means bytes 1000-1300 all received
- Single ACK can acknowledge multiple packets

**Sliding Window Mechanism:**

**The Problem:**
- Waiting for ACK after each packet is slow
- Network could handle more data in flight

**The Solution - Window:**
- Sender can transmit multiple packets without ACK
- Window size = how much can be "in flight"
- Receiver advertises how much buffer space available

**Example:**
```
Window Size = 1000 bytes

Sender can transmit:
Seq=1001 (200 bytes)
Seq=1201 (200 bytes)
Seq=1401 (200 bytes)
Seq=1601 (200 bytes)
Seq=1801 (200 bytes)  <- Total: 1000 bytes in flight

Then must wait for ACKs before sending more
```

**Window Scaling:**
- Original TCP: 16-bit window = max 65,535 bytes
- Too small for modern networks!
- Window scale option: multiply by 2^X
- Scale factor 7: 65535 × 128 = 8MB window
- Essential for high-bandwidth, high-latency links

**Handling Lost Packets:**

**Timeout-Based Retransmission:**
- Sender sets timer when sending packet
- If ACK not received by timeout, retransmit
- Timeout calculated from RTT measurements
- RTO (Retransmission Timeout) typically 200ms-1s

**Fast Retransmit:**
- Triggered by 3 duplicate ACKs
- Don't wait for timeout
- Receiver sends same ACK for every out-of-order packet
- 3 dupes = "Something's missing, please resend!"

**Selective Acknowledgment (SACK):**
- Standard ACK is cumulative only
- SACK option reports exactly which blocks received
- Allows sender to retransmit only missing segments
- Much more efficient for multiple losses

**Teaching Tip:**
Draw a timeline showing:
1. Packets sent in sequence
2. One packet lost
3. Duplicate ACKs from receiver
4. Fast retransmit
5. Successful completion

---

## Slide 13: TCP vs UDP - Reliability Trade-offs

### Speaker Notes:

Understanding when to use TCP vs UDP is crucial for application design and troubleshooting.

**The Fundamental Trade-off:**

**Reliability vs Speed:**
- TCP: Guaranteed delivery, higher overhead
- UDP: Best effort, lower overhead
- Neither is "better" - depends on use case

**TCP Characteristics:**

**Connection-Oriented:**
- Must establish connection before data
- State maintained for duration
- Graceful termination

**Reliable:**
- Every byte guaranteed to arrive
- Retransmission on loss
- Checksums verify integrity

**Ordered:**
- Data delivered in exact order sent
- Sequence numbers ensure ordering
- Application sees clean stream

**Flow Control:**
- Window mechanism prevents overwhelming receiver
- Receiver controls transmission rate

**Congestion Control:**
- Detects network congestion
- Backs off when congestion detected
- Helps prevent network collapse

**Higher Overhead:**
- 20-60 byte header
- Three-way handshake
- Acknowledgments for every segment
- Retransmissions when needed

**UDP Characteristics:**

**Connectionless:**
- No handshake needed
- Just send packet immediately
- No state to maintain

**Unreliable:**
- No delivery guarantee
- Packets can be lost
- No retransmission

**Unordered:**
- Packets may arrive out of order
- Application must handle ordering if needed

**No Flow Control:**
- Sender can overwhelm receiver
- Application responsible for pacing

**No Congestion Control:**
- Will keep sending regardless of network state
- Can contribute to congestion

**Lower Overhead:**
- Only 8 byte header!
- No handshake delay
- No acknowledgment overhead

**Use Case Matrix:**

| Scenario | Protocol | Why |
|----------|----------|-----|
| Web browsing | TCP | Need all data, in order |
| Email | TCP | Can't lose email content |
| File transfer | TCP | Must have complete file |
| SSH/Telnet | TCP | Every keystroke matters |
| Database queries | TCP | Need accurate results |
| Live video call | UDP | Latency > perfection |
| Online gaming | UDP | Speed critical, small losses OK |
| DNS queries | UDP | Small, simple, fast |
| VoIP | UDP | Real-time, drop old packets |
| Streaming video | UDP/TCP | Depends on implementation |

**The DNS Example:**

**Why DNS Uses UDP:**
- Request is small (usually < 512 bytes)
- Response is small
- Low overhead matters for millions of queries
- If lost, just retry (application handles)

**When DNS Uses TCP:**
- Zone transfers between servers
- Responses > 512 bytes (DNSSEC)
- TCP guarantees all records transferred

**When UDP Makes Sense:**

1. **Real-time applications:** Old data is useless (video call)
2. **Simple request-response:** DNS, NTP
3. **Broadcast/multicast:** Can't establish connection with multiple receivers
4. **Application handles reliability:** QUIC, custom protocols

**Teaching Tip:**
"Think about a phone call vs a letter. UDP is like a phone call - if you miss something, you move on. TCP is like a letter - you want every word to arrive."

---

## Slide 14: TCP in Action - Web Browser (HTTP/HTTPS)

### Speaker Notes:

Let's trace through a real-world example that everyone experiences daily.

**Complete HTTP Request Flow:**

**Step 1: User Action**
- User types `https://www.example.com` in browser
- Browser parses URL:
  - Protocol: HTTPS
  - Host: www.example.com
  - Port: 443 (implicit for HTTPS)
  - Path: / (root)

**Step 2: DNS Resolution**
- Browser checks cache
- OS resolver cache
- Recursive DNS query if needed
- Result: 203.0.113.50

**Step 3: TCP Three-Way Handshake**
```
Browser → Server: SYN (port 443)
Server → Browser: SYN-ACK
Browser → Server: ACK
```
- Connection now ESTABLISHED
- ~2ms on LAN, ~50ms across country

**Step 4: TLS Handshake (HTTPS only)**
- ClientHello (supported ciphers, random)
- ServerHello (chosen cipher, certificate)
- Key exchange
- Finished messages
- Adds another 1-2 round trips!
- TLS 1.3 reduced this to 1 round trip
- TLS 1.3 with 0-RTT: No additional round trips (resumption)

**Step 5: HTTP Request**
```
GET /index.html HTTP/1.1
Host: www.example.com
User-Agent: Mozilla/5.0...
Accept: text/html...
```
- Sent as TCP data
- One or more TCP segments

**Step 6: HTTP Response**
```
HTTP/1.1 200 OK
Content-Type: text/html
Content-Length: 5000

<!DOCTYPE html>...
```
- Server sends HTML content
- May require multiple TCP segments
- Browser ACKs received data

**Step 7: Additional Resources**
- Browser parses HTML
- Finds images, CSS, JavaScript
- Each resource needs request
- HTTP/1.1: New connection or keep-alive
- HTTP/2: Same connection, multiplexed

**Step 8: Connection Close**
- HTTP/1.0: Close after each request
- HTTP/1.1: Keep-alive for reuse
- Eventually: FIN handshake

**Timeline Analysis:**
```
0ms:     DNS lookup begins
20ms:    DNS response received
20ms:    TCP SYN sent
22ms:    TCP SYN-ACK received
24ms:    TCP ACK sent - ESTABLISHED
24ms:    TLS ClientHello sent
26ms:    TLS ServerHello received
...      [TLS continues ~2 more round trips for TLS 1.2]
50ms:    TLS finished
50ms:    HTTP GET sent
70ms:    HTTP 200 received
70ms:    HTML parsing begins
100ms:   Additional resources requested
...      [Multiple parallel connections]
200ms:   Page fully loaded
```

**HTTP/2 and HTTP/3 Improvements:**

**HTTP/1.1 Problems:**
- One request at a time per connection (head-of-line blocking)
- Multiple connections = multiple handshakes
- Text headers are verbose

**HTTP/2 Solutions:**
- Single TCP connection, multiplexed streams
- Binary protocol (more efficient)
- Header compression
- Server push

**HTTP/3 Solutions:**
- Uses QUIC (over UDP)
- Eliminates TCP handshake delay
- Stream-level reliability (no TCP head-of-line blocking)
- Built-in encryption

**Demo Opportunity:**
- Browser developer tools → Network tab
- Show timing breakdown (DNS, TCP, TLS, Request, Response)
- Compare HTTP/1.1 vs HTTP/2 waterfall

---

## Slide 15: TCP in Action - Email Transmission (SMTP)

### Speaker Notes:

Email is another perfect TCP application - you can't have missing parts of an email!

**SMTP Overview:**

**What is SMTP?**
- Simple Mail Transfer Protocol
- Used to send (not receive) email
- Text-based protocol over TCP
- RFC 5321 defines current standard

**SMTP Ports:**
- **Port 25:** Original SMTP (often blocked by ISPs)
- **Port 587:** Submission (for client → server)
- **Port 465:** SMTPS (implicit TLS - deprecated then revived)

**Complete SMTP Session:**

**Phase 1: TCP Connection**
```
Client → Server: SYN (port 587)
Server → Client: SYN-ACK
Client → Server: ACK
```

**Phase 2: TLS Encryption (STARTTLS)**
```
Server: 220 smtp.example.com ESMTP Ready
Client: EHLO client.example.com
Server: 250-smtp.example.com
Server: 250-STARTTLS
Server: 250 AUTH LOGIN PLAIN
Client: STARTTLS
Server: 220 Ready to start TLS
[TLS handshake]
```

**Phase 3: Authentication**
```
Client: EHLO client.example.com  (repeat after TLS)
Server: 250-smtp.example.com
Server: 250 AUTH LOGIN PLAIN
Client: AUTH LOGIN
Server: 334 VXNlcm5hbWU6  (Base64: "Username:")
Client: dXNlcm5hbWU=  (Base64 encoded username)
Server: 334 UGFzc3dvcmQ6  (Base64: "Password:")
Client: cGFzc3dvcmQ=  (Base64 encoded password)
Server: 235 Authentication successful
```

**Phase 4: Mail Transaction**
```
Client: MAIL FROM:<sender@example.com>
Server: 250 OK
Client: RCPT TO:<recipient@example.com>
Server: 250 OK
Client: DATA
Server: 354 Start mail input; end with <CRLF>.<CRLF>
Client: From: sender@example.com
Client: To: recipient@example.com
Client: Subject: Test Email
Client: Date: Mon, 8 Dec 2025 10:00:00 -0500
Client:
Client: This is the email body.
Client: .
Server: 250 OK Message accepted for delivery
```

**Phase 5: Termination**
```
Client: QUIT
Server: 221 Bye
[TCP FIN handshake]
```

**Why TCP is Essential:**
- Commands must arrive in order
- Email content cannot be partial
- Authentication must be secure
- Server responses confirm each step

**Email Delivery Chain:**
```
Your Device → Your Mail Server → Recipient's Mail Server → Recipient's Device
              (SMTP)            (SMTP)                   (IMAP/POP3)
```

**Teaching Tip:**
"Every line of that SMTP conversation is a TCP segment. TCP ensures every command and response arrives correctly. Imagine if half your email was missing!"

**Demo Opportunity:**
```bash
# Manual SMTP session (for testing)
telnet smtp.example.com 25
# or
openssl s_client -connect smtp.example.com:587 -starttls smtp
```

---

## Slide 16: Diagnosing TCP Connection Problems

### Speaker Notes:

Troubleshooting TCP connections is a critical skill. Learn to think systematically.

**Problem 1: Connection Refused**

**Symptom:**
- Immediate failure
- "Connection refused" error
- RST packet received

**Causes:**
- No application listening on port
- Firewall actively rejecting (RST)
- Service crashed

**Diagnosis:**
```bash
# Check if port is listening (on server)
netstat -an | grep LISTEN | grep :80
ss -tln | grep :80

# Check from client
telnet server.example.com 80
nc -zv server.example.com 80
```

**Solution:**
- Start the service
- Check firewall rules
- Verify port number

**Problem 2: Connection Timeout**

**Symptom:**
- Long delay before failure
- "Connection timed out" error
- No response to SYN

**Causes:**
- Firewall silently dropping packets (no RST)
- Wrong IP address
- Routing problem
- Server overloaded

**Diagnosis:**
```bash
# Can we reach the server at all?
ping server.example.com

# Trace route
traceroute server.example.com

# Is our SYN leaving?
tcpdump -i eth0 'tcp port 80 and tcp[tcpflags] & tcp-syn != 0'
```

**Solution:**
- Check firewall rules
- Verify IP/routing
- Check server health

**Problem 3: Connection Reset (RST)**

**Symptom:**
- Connection drops unexpectedly
- "Connection reset by peer" error
- RST packet mid-session

**Causes:**
- Application crashed
- Firewall timeout (long-idle connections)
- Security policy triggered
- Protocol violation
- Attack attempt detected

**Diagnosis:**
```bash
# Check application logs on server
tail -f /var/log/application.log

# Capture the RST
tcpdump -i eth0 'tcp[tcpflags] & tcp-rst != 0'
```

**Problem 4: Slow Data Transfer**

**Symptom:**
- Connection works but slow
- High latency
- Low throughput

**Causes:**
- Small window size
- High packet loss (retransmissions)
- Network congestion
- MTU issues (fragmentation)

**Diagnosis:**
```bash
# Check for retransmissions
netstat -s | grep -i retrans
ss -ti

# Measure throughput
iperf3 -c server.example.com

# Check window sizes
tcpdump -i eth0 'tcp port 80' -v | grep win
```

**Essential Troubleshooting Tools:**

| Tool | Purpose | Example |
|------|---------|---------|
| netstat | Connection state | `netstat -an` |
| ss | Connection state (faster) | `ss -tan` |
| telnet | Port connectivity | `telnet host 80` |
| nc (netcat) | Port connectivity | `nc -zv host 80` |
| tcpdump | Packet capture | `tcpdump -i eth0 tcp port 80` |
| Wireshark | GUI packet analysis | Filter: `tcp.port == 80` |
| iperf3 | Throughput testing | `iperf3 -c server` |
| traceroute | Path analysis | `traceroute host` |
| curl | HTTP testing | `curl -v http://host/` |

**Security Issue: SYN Flooding**

**What It Is:**
- DoS attack using TCP handshake
- Attacker sends flood of SYN packets
- Uses spoofed source IPs
- Server allocates resources for half-open connections
- Server runs out of resources

**Detection:**
```bash
# Many SYN_RECV connections
netstat -an | grep SYN_RECV | wc -l

# If this number is high (hundreds/thousands), possible attack
```

**Mitigation:**
- SYN cookies (kernel option)
- Rate limiting
- Firewall rules
- IPS/IDS systems

---

## Slide 17: Securing TCP Communications

### Speaker Notes:

TCP provides reliability but NOT security. This distinction is critical.

**TCP Security Limitations:**

**No Encryption:**
- All TCP data is plaintext
- Anyone on network path can read it
- Wireshark trivially captures credentials
- Never use unencrypted TCP for sensitive data

**No Authentication:**
- TCP doesn't verify who you're talking to
- IP addresses can be spoofed
- Man-in-the-middle attacks possible

**No Integrity (beyond checksum):**
- Checksum catches accidental corruption
- Does NOT protect against intentional modification
- Attacker can modify packets if on network path

**Common TCP-Based Attacks:**

**1. Sequence Number Prediction:**
- Attacker guesses ISN
- Injects packets into existing connection
- Historically: ISNs were predictable
- Modern mitigation: Randomized ISNs

**2. SYN Flood (DoS):**
- Already covered in troubleshooting
- Exhausts server resources
- Mitigation: SYN cookies, rate limiting

**3. TCP Reset Attack:**
- Attacker sends spoofed RST packets
- Terminates legitimate connections
- Requires guessing sequence numbers
- Real threat on long-lived connections (BGP!)

**4. Session Hijacking:**
- Attacker takes over established session
- Must be on network path
- Sniffs sequence numbers
- Injects own packets

**5. Man-in-the-Middle (MITM):**
- Attacker intercepts all traffic
- Can read and modify
- Victim thinks connection is direct
- Defeated by TLS certificate validation

**TLS - The Solution:**

**What TLS Provides:**

**Confidentiality:**
- All data encrypted
- AES-256-GCM, ChaCha20-Poly1305
- Even if captured, can't read

**Authentication:**
- Server certificate proves identity
- Optional client certificates
- Prevents MITM (if certificates validated!)

**Integrity:**
- MAC (Message Authentication Code)
- Any modification detected
- Tampered packets rejected

**TLS Versions:**
- TLS 1.0, 1.1: **Deprecated, insecure**
- TLS 1.2: **Acceptable, widely deployed**
- TLS 1.3: **Best, required for new deployments**

**Best Practices:**

**Application Layer:**
- Always use TLS (HTTPS, not HTTP)
- Validate certificates
- Use strong cipher suites
- Disable old TLS versions

**Network Layer:**
- Firewall rules (restrict ports)
- SYN cookies enabled
- Rate limiting
- Intrusion detection/prevention

**Host Layer:**
- Keep TCP stack updated
- Random ISNs (modern default)
- Disable unnecessary services
- Monitor connections

**Security Commands:**
```bash
# Check TLS configuration
openssl s_client -connect host:443 -tls1_2
openssl s_client -connect host:443 -tls1_3

# Verify certificate
echo | openssl s_client -connect host:443 2>/dev/null | openssl x509 -text

# Check for weak ciphers
nmap --script ssl-enum-ciphers -p 443 host
```

**Teaching Tip:**
"TCP is like mailing a postcard - it gets there reliably, but anyone can read it. TLS is like putting that postcard in a locked box that only the recipient can open."

---

## Slide 18: Key Takeaways & Hands-On Learning

### Speaker Notes:

Wrap up with summary and actionable next steps.

**Core Concepts to Remember:**

1. **TCP adds reliability to IP**
   - IP is best-effort only
   - TCP guarantees delivery through ACKs
   - Essential for applications requiring completeness

2. **Three-way handshake establishes connection**
   - SYN → SYN-ACK → ACK
   - Synchronizes sequence numbers
   - Both sides confirm bidirectional communication

3. **Sequence numbers track data**
   - Byte-level tracking
   - Enable ordering and duplicate detection
   - Random ISN for security

4. **TCP flags control connection lifecycle**
   - SYN: Start
   - ACK: Confirm
   - FIN: End gracefully
   - RST: Abort

5. **TCP vs UDP is about trade-offs**
   - TCP: Reliable, ordered, connection-oriented
   - UDP: Fast, simple, connectionless
   - Choose based on application requirements

6. **TCP needs TLS for security**
   - TCP itself is not encrypted
   - Always use TLS for sensitive data
   - Validate certificates to prevent MITM

**Lab Exercise Details:**

**Lab 1: TCP Handshake Capture**

**Objective:** Observe three-way handshake in Wireshark

**Steps:**
1. Open Wireshark, start capture on active interface
2. Open browser, navigate to HTTP site (not HTTPS for visibility)
3. Stop capture
4. Filter: `tcp.flags.syn == 1`
5. Find handshake sequence

**What to Document:**
- Source and destination ports
- Initial sequence numbers
- Time between packets
- Options negotiated (MSS, window scale)

**Lab 2: TCP Port Scanning**

**Objective:** Understand how port scanners use TCP

**Steps:**
1. Set up target (VM or lab server)
2. Run: `nmap -sS -p 1-1000 target`
3. Capture with Wireshark simultaneously
4. Analyze responses

**What to Observe:**
- Open ports: SYN → SYN-ACK → RST
- Closed ports: SYN → RST
- Filtered ports: SYN → (no response)

**Lab 3: Connection State Monitoring**

**Objective:** Observe TCP states in real-time

**Steps:**
1. Run: `watch -n 1 'ss -tan'`
2. Open/close various connections
3. Observe state transitions

**Look For:**
- ESTABLISHED connections
- TIME-WAIT accumulation
- LISTEN sockets

**Lab 4: TCP vs UDP Performance**

**Objective:** Measure performance difference

**Steps:**
1. Set up iperf3 server: `iperf3 -s`
2. TCP test: `iperf3 -c server`
3. UDP test: `iperf3 -c server -u -b 100M`
4. Compare results

**Metrics to Compare:**
- Throughput
- Jitter
- Packet loss handling

**Advanced Topics for Further Study:**
- TCP congestion control algorithms (Cubic, BBR)
- QUIC protocol (HTTP/3)
- TCP fast open
- Multipath TCP (MPTCP)
- TCP window scaling and buffer tuning

**Final Engagement:**
- Any questions about TCP?
- What would you like to explore deeper?
- How does this connect to what you're working on?

**Certification Tip:**
"For CCNA and Network+, memorize: ports (80, 443, 22, 25, etc.), the three-way handshake sequence, TCP vs UDP differences, and common troubleshooting commands."

---

## Appendix: Quick Reference

### TCP Header Format
```
 0                   1                   2                   3
 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1 2 3 4 5 6 7 8 9 0 1
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|          Source Port          |       Destination Port        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                        Sequence Number                        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Acknowledgment Number                      |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|  Data |       |C|E|U|A|P|R|S|F|                               |
| Offset| Rsrvd |W|C|R|C|S|S|Y|I|            Window             |
|       |       |R|E|G|K|H|T|N|N|                               |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|           Checksum            |         Urgent Pointer        |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                    Options                    |    Padding    |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
|                             Data                              |
+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+
```

### Common Ports Reference

| Port | Service | Protocol |
|------|---------|----------|
| 20-21 | FTP | TCP |
| 22 | SSH | TCP |
| 23 | Telnet | TCP |
| 25 | SMTP | TCP |
| 53 | DNS | TCP/UDP |
| 67-68 | DHCP | UDP |
| 80 | HTTP | TCP |
| 110 | POP3 | TCP |
| 143 | IMAP | TCP |
| 443 | HTTPS | TCP |
| 445 | SMB | TCP |
| 3306 | MySQL | TCP |
| 3389 | RDP | TCP |
| 5432 | PostgreSQL | TCP |

### Troubleshooting Commands

```bash
# View TCP connections
netstat -an | grep tcp
ss -tan

# Check listening ports
netstat -tlnp
ss -tlnp

# Test port connectivity
telnet host port
nc -zv host port

# Capture TCP traffic
tcpdump -i eth0 tcp port 80
tcpdump -i eth0 'tcp[tcpflags] & tcp-syn != 0'

# Check TCP statistics
netstat -s | grep -i tcp
ss -s

# Performance testing
iperf3 -c server -p 5201
```

### State Transition Summary

```
CLOSED → (send SYN) → SYN-SENT → (recv SYN-ACK, send ACK) → ESTABLISHED
LISTEN → (recv SYN, send SYN-ACK) → SYN-RECEIVED → (recv ACK) → ESTABLISHED
ESTABLISHED → (send FIN) → FIN-WAIT-1 → ... → TIME-WAIT → CLOSED
ESTABLISHED → (recv FIN) → CLOSE-WAIT → (send FIN) → LAST-ACK → CLOSED
```

---

## End of Speaker Notes

**Document Version:** 1.0
**Created:** December 2025
**Total Pages:** ~70
**Aligned Slides:** 18

**Feedback:** Report issues or suggestions to course administrator.
