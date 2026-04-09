# Open World CTF Series — Design Document

**Status:** APPROVED CONCEPT — Build Queue
**Created:** 2026-04-08
**Architecture:** Gate 8 Pattern (multi-page, shared state, open-world investigation)
**Engine:** Custom per-box (shared.js state engine + device-specific pages)
**Location:** `_app/arena/boxes/ow-{NN}-{slug}/`
**Series Prefix:** OW (Open World)

---

## Architecture Pattern (Gate 8 Model)

Every box in this series follows the same structural pattern:

```
ow-{NN}-{slug}/
    index.html          — Hub / command center / briefing
    shared.js           — Cross-page state engine (localStorage sync)
    shared.css           — Unified theme
    {device-1}.html     — First device/interface
    {device-2}.html     — Second device/interface
    {device-3}.html     — Third device/interface
    {tool-1}.html       — Investigation tool
    {tool-2}.html       — Investigation tool
    evidence/           — SVG images, documents, artifacts
    reports/            — Case files, briefings, intel docs
```

### Shared Architecture Components

- **State Engine:** `shared.js` — localStorage-based, real-time sync via `storage` event
- **Persistent Nav Bar:** Device tabs + tools + clock + score on every page
- **Accelerated Clock:** Configurable ratio (default 60:1 — 1 real second = 1 game minute)
- **Evidence System:** Catalog of 30-50 items per box with metadata (source, category, isRedHerring)
- **Connection System:** Key relationships student must identify (5-10 per box)
- **Scoring:** Base score + evidence bonuses - penalties for wrong answers/hints
- **Narrative Events:** Time-triggered messages, threats, consequences
- **Final Submission:** Answer validation with near-miss hints

### Registration

- Each box gets a `box-catalog.json` entry with `category: "openworld"`
- Arena hub displays with special "OPEN WORLD" badge
- Flag registration in Firestore `flag_registry` (server-delivered, not local)

---

## OW-01: Operation Mole Hunt

**Subtitle:** Insider Threat Investigation
**Difficulty:** Advanced
**Estimated Time:** 60-90 minutes
**Flags:** 3 (insider identity, exfiltration method, the second mole)
**Theme Color:** #dc2626 (red — threat/danger)

### Scenario

A senior systems engineer at Meridian Dynamics (recurring from Blackwire) has been flagged by the Data Loss Prevention system. 40GB of classified schematics were copied to a USB drive after hours. But the deeper you dig, the more the evidence points to a coordinated operation — there isn't one insider. There are two. One is the fall guy.

### Devices & Interfaces

| Page | Interface | Content |
|------|-----------|---------|
| `index.html` | Investigation Command Center | Case briefing, device access, progress dashboard |
| `workstation.html` | Windows 10 Desktop | File Explorer with USB logs, browser history (Dropbox uploads, encrypted file transfers), documents (resignation letter draft, competitor job offers), deleted files (recoverable via tool) |
| `email.html` | Outlook-style Email Client | 35+ emails — performance review chain, after-hours access requests, encrypted attachments to personal email, subtle coded language with external contact |
| `badge.html` | Physical Security Dashboard | Badge swipe timeline (2 months), door access matrix, after-hours alerts, visitor logs, parking garage entry/exit timestamps |
| `siem.html` | Splunk-style SIEM | Alert timeline, DNS tunnel detection, DLP triggers, USB insertion events, failed login attempts, lateral movement indicators |
| `hr.html` | HR Records Portal | Performance reviews, disciplinary notes, salary history, benefits changes, emergency contacts, PTO requests aligned with exfiltration dates |
| `caseboard.html` | Link Analysis Board | Cork board for connecting evidence across systems |

### Key Evidence Trail

1. DLP alert: 40GB USB copy at 11:47 PM by `eng-sarah-chen`
2. Badge log: Sarah's badge used at Server Room at 11:30 PM
3. But Sarah's parking garage exit was at 6:15 PM — her badge was cloned
4. Email: Sarah complained about being passed over for promotion — motive planted
5. SIEM: DNS tunneling from a different workstation (`eng-david-park`) starting 2 weeks prior
6. HR: David recently added a new emergency contact with a burner phone number
7. Browser history (David's, accessed via SIEM endpoint data): cryptocurrency wallet, Telegram web
8. Visitor log: David's "cousin" visited twice — badge photo matches known corporate espionage broker

### The Twist

Sarah is the fall guy. David cloned her badge, used it for physical access, and planted evidence on her workstation. The DNS tunneling from David's machine was the real exfiltration channel. The USB copy was a decoy to trigger DLP and frame Sarah.

### Connections (7 required)

1. Badge clone: Sarah's badge used while her car was gone
2. DNS tunnel source: David's workstation, not Sarah's
3. Visitor match: David's "cousin" = known broker (photo match)
4. Timeline: DNS tunneling started 2 weeks before USB copy
5. Financial: David's crypto wallet received payment 3 days after exfil
6. Planted evidence: Sarah's browser history was modified (timestamps don't match login sessions)
7. The real payload: DNS tunnel carried schematics, USB was dummy data

### Time Pressure

- At 8 game-hours: David's workstation shows signs of remote wiping — SIEM alerts fire
- At 16 game-hours: David's email auto-deletes (recoverable via tool if scanned before)
- At 24 game-hours: Legal counsel for Sarah arrives — investigation narrows if student hasn't cleared her

### Final Answer

`david park` (the real insider) + `dns tunneling` (the exfiltration method)

---

## OW-02: Operation Dead Drop

**Subtitle:** Cryptocurrency Heist Forensics
**Difficulty:** Expert
**Estimated Time:** 90-120 minutes
**Flags:** 3 (exploit identification, fund trace endpoint, attacker identity)
**Theme Color:** #f59e0b (amber — financial/crypto)

### Scenario

$4.2M in ETH vanished from the VaultGuard DeFi protocol in a single transaction. The exploit was a reentrancy attack hidden in a seemingly innocent code change that passed a third-party audit. The funds were routed through a mixer and eventually landed at a KYC'd exchange account. The attacker is one of the protocol's own auditors.

### Devices & Interfaces

| Page | Interface | Content |
|------|-----------|---------|
| `index.html` | Incident Command Center | Protocol overview, loss summary, investigation dashboard |
| `explorer.html` | Blockchain Explorer | Transaction graph visualization, wallet addresses, contract interactions, token flow, block timestamps |
| `contracts.html` | Smart Contract Viewer | Solidity source code (VaultGuard.sol), git diff showing the malicious PR, audit report PDF, deployment history |
| `exchange.html` | Exchange KYC Records | Identity documents, login IPs, withdrawal history, account creation date, linked wallets |
| `comms.html` | Discord/Telegram Archive | Dev channel messages, DMs between auditor and team, suspicious after-hours messages, deleted messages (recoverable) |
| `mixer.html` | Fund Flow Analyzer | Tornado Cash deposit/withdrawal correlation, timing analysis, denomination fingerprinting, probabilistic links |
| `caseboard.html` | Evidence Board | Link analysis workspace |

### Key Evidence Trail

1. Contract diff: `_beforeTokenTransfer` hook added in audit PR — contains reentrancy vector
2. Audit report: Auditor signed off on the exact function that contains the exploit
3. Blockchain: Attack TX called `withdraw()` recursively 47 times before state update
4. Fund flow: 4.2M ETH -> 6 intermediate wallets -> Tornado Cash (42 deposits of 100 ETH) -> 42 withdrawals -> exchange wallet
5. Mixer timing: Deposits and withdrawals separated by exactly 73 minutes each — automated script
6. Exchange KYC: Account registered to "Marcus Webb" — matches auditor's real name with one letter changed
7. Discord DMs: Auditor asked "hypothetical" questions about reentrancy guards 3 days before the PR
8. Login IP: Exchange account accessed from same IP range as auditor's VPN

### Connections (8 required)

1. Exploit vector: Reentrancy in `_beforeTokenTransfer` (contract + audit)
2. Audit complicity: Auditor approved the exact vulnerable function
3. Fund origin: Attack TX -> 6 hops -> mixer entry
4. Mixer correlation: 73-minute timing pattern links deposits to withdrawals
5. Exchange endpoint: Mixer exits -> single exchange wallet
6. Identity link: KYC name variant matches auditor
7. IP correlation: Exchange login IP = auditor VPN range
8. Premeditation: Discord DMs about reentrancy 3 days before PR

### Time Pressure

- At 6 game-hours: Exchange freezes the account — student must have traced funds before this or loses exchange access
- At 12 game-hours: Auditor deletes Discord messages — recoverable only if comms were scanned
- At 18 game-hours: Mixer analysis becomes harder (more noise injected into timing data)

### Final Answer

`marcus webb` (attacker) + `reentrancy` (exploit type)

---

## OW-03: Operation Glass House

**Subtitle:** Smart Building Side-Channel Espionage
**Difficulty:** Expert
**Estimated Time:** 90-120 minutes
**Flags:** 3 (exfiltration method, implant location, attacker identity)
**Theme Color:** #10b981 (green — building/infrastructure)

### Scenario

A biotech firm's proprietary gene therapy research is appearing in a competitor's patent filings — but the security team has found zero evidence of digital exfiltration on the network. No suspicious emails, no USB activity, no cloud uploads. The data is air-gapped. Yet it's leaking. The answer is in the building itself: someone reprogrammed an HVAC controller to modulate fan speeds in patterns that encode binary data — an acoustic side-channel attack exfiltrating data through the air ducts.

### Devices & Interfaces

| Page | Interface | Content |
|------|-----------|---------|
| `index.html` | Security Operations Center | Case overview, facility map, investigation status |
| `bms.html` | Building Management System | HVAC zone controls (8 zones), door access logs, elevator logs, camera feeds (thumbnails), energy consumption graphs, firmware versions |
| `network.html` | Network TAP Viewer | Pcap-style packet display — normal IT traffic AND covert BACnet/Modbus commands to HVAC controller |
| `workstation-a.html` | Suspect A: Lab Director | Windows workstation — research files, email, calendar showing late nights, USB activity (legitimate backup) |
| `workstation-b.html` | Suspect B: Facilities Engineer | Linux workstation — BACnet programming tools, HVAC controller firmware, Python scripts, deleted bash history |
| `cameras.html` | Security Camera Feed | Parking garage (plate recognition + timestamps), lobby, server room corridor, HVAC mechanical room |
| `caseboard.html` | Evidence Board | Link analysis workspace |

### Key Evidence Trail

1. BMS: HVAC Zone 3 (R&D lab) fan speed shows micro-oscillations not present in other zones
2. Network: BACnet Write commands to Zone 3 controller from an unauthorized source IP (facilities workstation)
3. Suspect B's workstation: Python script `hvac_mod.py` (deleted but recoverable) — encodes binary data as fan speed modulation patterns
4. Suspect B's bash history (deleted): `python3 hvac_mod.py --input /mnt/research/gt-7742.pdf --zone 3 --rate 12`
5. Camera: Suspect B entered HVAC mechanical room at 2:15 AM, exited at 2:47 AM (firmware flash window)
6. Camera: Competitor employee photographed in parking garage 3 times in 2 weeks — always parked near HVAC exhaust vent
7. BMS firmware: Zone 3 controller firmware hash differs from factory (modified)
8. Suspect A is clean — late nights are legitimate research, USB backups are encrypted and policy-compliant

### Connections (7 required)

1. Anomaly: Zone 3 fan speed oscillations = data encoding
2. Source: BACnet commands from facilities workstation (Suspect B's IP)
3. Tool: hvac_mod.py encodes files as fan speed patterns
4. Physical access: Camera shows Suspect B in HVAC room at 2 AM (firmware modification)
5. Receiver: Competitor employee parked near exhaust vent (acoustic pickup)
6. Firmware: Zone 3 controller hash differs from factory default
7. Red herring cleared: Suspect A's activity is legitimate

### Time Pressure

- At 10 game-hours: Facilities team performs routine maintenance — HVAC logs get rotated
- At 16 game-hours: Suspect B remotely reflashes Zone 3 controller to factory firmware (evidence destroyed if not captured)
- At 20 game-hours: Competitor files an injunction blocking further investigation

### Final Answer

`acoustic side channel` or `hvac fan modulation` (method) + `suspect b` or `facilities engineer` (attacker)

---

## OW-04: Operation Burned Source

**Subtitle:** Missing Journalist Investigation
**Difficulty:** Advanced
**Estimated Time:** 60-90 minutes
**Flags:** 3 (journalist's discovery, corrupt agent identity, last known location)
**Theme Color:** #8b5cf6 (purple — intelligence/covert)

### Scenario

Investigative journalist Elena Vasquez went dark 72 hours ago. She was working on a story about cartel money laundering through legitimate businesses. Her last article draft — found on her laptop — references a "federal source" who is actively protecting the cartel's financial pipeline. The story is bigger than cartels: a corrupt DEA agent is the linchpin. Elena found proof and then vanished.

### Devices & Interfaces

| Page | Interface | Content |
|------|-----------|---------|
| `index.html` | Law Enforcement Task Force HQ | Case briefing, missing person timeline, device inventory |
| `laptop.html` | MacBook Pro (Elena's) | Article drafts (3 versions showing investigation progression), Signal Desktop (conversations with 4 sources), Tor browser history, encrypted disk partition (requires password from phone clue), research notes |
| `phone.html` | iPhone 14 (Elena's burner) | Signal messages (different from desktop — she used two devices), photos with EXIF (including one taken at the corrupt agent's house), call logs, voice memo (partially recorded confrontation) |
| `newsroom.html` | Newsroom Email & Files | Editor correspondence (Elena's check-ins stopped 3 days ago), source protection protocols, previous published articles, expense reports (travel to key locations) |
| `osint.html` | OSINT Dashboard | Social media searches, public records, property ownership, business registrations, flight manifests, domain lookups |
| `tipline.html` | Anonymous Tip Line | 8 tips received since Elena went missing — 3 are genuine, 5 are noise/disinformation |
| `caseboard.html` | Evidence Board | Link analysis workspace |

### Key Evidence Trail

1. Laptop article draft v3: Names "Agent Rodriguez" as the federal source protecting cartel finances
2. Signal (desktop): Source "CARDINAL" confirms Rodriguez met with cartel financial officer at a marina
3. Phone photo: GPS EXIF shows coordinates of Rodriguez's lake house — matches a property record under his wife's maiden name
4. Voice memo: 47-second recording of Elena confronting someone — voice analysis matches Rodriguez
5. Tor history: Elena researched Rodriguez's financial disclosures — found undisclosed offshore accounts
6. Newsroom email: Elena told editor "If something happens to me, look at the marina photos"
7. Tip line: Genuine tip from marina worker — saw a woman matching Elena's description being put in a black SUV
8. OSINT: Rodriguez's wife's company received $2.1M in "consulting fees" from a cartel-linked LLC
9. Encrypted partition password: Hidden in a Signal message to her editor as a book title + page number

### Connections (8 required)

1. Target: Agent Rodriguez is the corrupt federal agent
2. Evidence: Marina meeting between Rodriguez and cartel (Signal source + photo)
3. Financial: Wife's company received cartel money (OSINT + public records)
4. Confrontation: Voice memo proves Elena confronted Rodriguez directly
5. Lake house: Photo EXIF + property records link to Rodriguez
6. Disappearance: Tip line + last known Signal message = abduction from marina area
7. Article: Draft v3 had enough to publish — motive for silencing
8. Encrypted partition: Contains the full evidence package Elena compiled

### Time Pressure

- At 6 game-hours: Rodriguez's lawyer files a gag order — OSINT records become restricted
- At 14 game-hours: Someone attempts to remote-wipe Elena's phone (DataDrill race)
- At 20 game-hours: Newsroom receives a "proof of life" message — but it's fabricated (disinformation)

### Final Answer

`agent rodriguez` (corrupt agent) + `marina` or coordinates (last known location)

---

## OW-05: Operation Phantom Ledger

**Subtitle:** Money Laundering Network Analysis
**Difficulty:** Expert
**Estimated Time:** 90-120 minutes
**Flags:** 3 (laundering method, network structure, the banker)
**Theme Color:** #22c55e (green — financial/money)

### Scenario

FinCEN has flagged suspicious transaction patterns at Pacific Coast Regional Bank. Over $47M has flowed through 12 shell companies across 4 countries in 18 months. The transactions are structured to stay just below reporting thresholds. A senior VP at the bank is facilitating — his lifestyle doesn't match his $185K salary. Student plays as a FinCEN forensic analyst.

### Devices & Interfaces

| Page | Interface | Content |
|------|-----------|---------|
| `index.html` | FinCEN Analyst Workstation | Case overview, regulatory framework, investigation dashboard |
| `banking.html` | Core Banking Terminal | Account search, transaction histories (500+ transactions), wire transfer details, account holder info, internal notes, account opening documents |
| `sar.html` | SAR Dashboard | Suspicious Activity Reports (12 filed), Currency Transaction Reports, structuring analysis tool, threshold alerts |
| `email.html` | Bank Officer Email | VP correspondence — client communications, compliance override requests, personal emails (luxury purchases, real estate inquiries) |
| `shell.html` | Corporate Registry | Shell company records — articles of incorporation, registered agents, beneficial ownership (obscured through layers), cross-border entity relationships |
| `surveillance.html` | Physical Surveillance | Photos of meetings between VP and clients (timestamped), restaurant receipts, vehicle tracking, known associate database |
| `caseboard.html` | Evidence Board | Money flow diagram workspace |

### Key Evidence Trail

1. Banking: 12 accounts opened within 6 months, all with same registered agent address
2. SAR: Transactions structured at $9,500 (just below $10K CTR threshold) — 340 transactions
3. Shell companies: Layered ownership — Company A owns B, B owns C, C owns D — all trace to one beneficial owner in Cyprus
4. Email: VP overrode compliance holds on 8 wire transfers totaling $12M — noted as "verified client, no further review"
5. VP personal email: Purchased a $2.1M yacht, $890K renovation on lake house — on $185K salary
6. Surveillance: VP met with the Cyprus beneficial owner at a private club 4 times
7. Wire transfers: $47M total flow — enters US via trade-based laundering (over-invoiced imports), circles through shells, exits to offshore accounts
8. The Cyprus entity is a front for a sanctioned oligarch

### Connections (9 required)

1. Structuring: 340 transactions at $9,500 = deliberate CTR avoidance
2. Shell network: 12 companies, one registered agent, layered ownership
3. Beneficial owner: All shells trace to Cyprus entity
4. VP complicity: Compliance overrides on $12M in wires
5. VP lifestyle: $3M+ purchases on $185K salary
6. Physical meetings: VP and Cyprus owner met 4 times (surveillance photos)
7. Laundering method: Trade-based (over-invoiced imports from shell exporters)
8. Flow pattern: Import payments -> US shells -> offshore accounts
9. Sanctions link: Cyprus entity controlled by sanctioned individual

### Final Answer

`trade based laundering` (method) + `vp morrison` (the banker)

---

## OW-06: Operation Signal Lost

**Subtitle:** Downed Drone Intelligence Recovery
**Difficulty:** Expert
**Estimated Time:** 60-90 minutes
**Flags:** 3 (cause of loss, landing coordinates, adversary unit)
**Theme Color:** #3b82f6 (blue — military/intelligence)

### Scenario

A classified MQ-9B surveillance drone (callsign RAVEN-7) went offline over contested airspace during a routine ISR mission. Initial assessment: shot down by surface-to-air missile. But telemetry data tells a different story — the drone didn't crash. It was cyber-hijacked via a firmware vulnerability in its satellite communication module and landed intact at an adversary black site. Student works as the intelligence analyst in a Tactical Operations Center (TOC).

### Devices & Interfaces

| Page | Interface | Content |
|------|-----------|---------|
| `index.html` | Tactical Operations Center | Mission overview, asset status board, timeline, rules of engagement |
| `telemetry.html` | Drone Telemetry Dashboard | Flight recorder data (altitude, speed, heading, GPS), system status timeline, anomaly markers, last 30 minutes of flight data with sensor readings |
| `sigint.html` | SIGINT Intercepts | Radio chatter transcripts (encrypted, partially decoded), electronic warfare emission detections, frequency analysis, geo-located signal sources |
| `satellite.html` | Satellite Imagery | Before/after imagery of the area (10 tiles), debris field analysis tool, thermal overlays, change detection, identified structures |
| `network.html` | Adversary Network Map | Known EW installations, SAM sites, radar coverage, communication nodes, unit identifications, order of battle |
| `briefing.html` | Mission Briefing System | ROE, asset inventory, mission parameters, previous ISR findings, threat assessment, firmware changelog |
| `caseboard.html` | Evidence Board | Analysis workspace |

### Key Evidence Trail

1. Telemetry: Drone didn't lose altitude suddenly (not a missile) — it descended in a controlled spiral over 4 minutes
2. Telemetry: Satellite comm module rebooted mid-flight at timestamp T-47:23 — firmware was overwritten
3. SIGINT: Burst transmission detected on adversary EW frequency at T-47:20 (3 seconds before reboot)
4. SIGINT: GPS spoofing signatures detected — drone was fed false coordinates during descent
5. Satellite imagery: No debris field at the "crash site" — but a new vehicle appeared at a known black site 12km east
6. Satellite thermal: Heat signature at black site consistent with drone engine cooldown
7. Network map: EW Unit "Specter Brigade" operates in the area — known for cyber-EW capabilities
8. Briefing: Firmware changelog shows the sat-comm module was running version 3.2.1 — v3.2.2 patched a remote code execution vulnerability
9. SIGINT: Decoded radio chatter references "package secured" at the black site coordinates

### Connections (7 required)

1. Not a shootdown: Controlled descent, no debris field
2. Cyber-hijack: Sat-comm firmware exploit (v3.2.1 vulnerability)
3. EW attack: Burst transmission triggered firmware overwrite
4. GPS spoof: Drone was guided to adversary-controlled landing zone
5. Landing site: Black site at [coordinates] — satellite confirms vehicle + thermal
6. Attribution: Specter Brigade EW unit (frequency match + capability + location)
7. Recovery: "Package secured" intercept confirms intact drone recovery

### Final Answer

`cyber hijack` or `firmware exploit` (cause) + coordinates (landing site)

---

## OW-07: Operation Counterfeit

**Subtitle:** Disinformation Campaign Attribution
**Difficulty:** Expert
**Estimated Time:** 90-120 minutes
**Flags:** 3 (campaign origin, operator identity, infrastructure owner)
**Theme Color:** #ef4444 (red — threat/adversarial)

### Scenario

Three weeks before a NATO ally's parliamentary election, a coordinated influence operation floods social media with fabricated stories about the leading candidate. 200+ fake accounts, professionally produced content, and targeted ad spending across multiple platforms. Student works as a threat intelligence analyst at a NATO Cooperative Cyber Defence Centre.

### Devices & Interfaces

| Page | Interface | Content |
|------|-----------|---------|
| `index.html` | NATO CCDCOE Analyst Station | Threat briefing, campaign overview, attribution framework |
| `social.html` | Social Media Monitor | Fake account profiles (25 displayed), post timelines, engagement metrics, bot detection scores, network graph of amplification patterns, content similarity analysis |
| `domains.html` | Domain Intelligence | WHOIS records (20 domains), hosting infrastructure, SSL certificates, registration patterns, IP geolocation, linked domains via shared hosting/registrar/nameservers |
| `payments.html` | Financial Intelligence | Ad spend records (platform transparency reports), crypto transactions to content farms, payment processor records, bank wire metadata |
| `narrative.html` | Narrative Tracker | Story evolution timeline, talking points matrix, A/B tested headlines (showing optimization over time), translation quality analysis (source language artifacts), meme template origins |
| `attribution.html` | Attribution Dashboard | TTP comparison with known threat actors, language analysis (grammatical patterns), timezone analysis (posting activity heatmap), operational security failures |
| `caseboard.html` | Evidence Board | Attribution workspace |

### Key Evidence Trail

1. Social: 200+ accounts created in 3 waves over 6 weeks — same profile photo generation tool (StyleGAN artifacts)
2. Domains: 20 fake news sites — 17 share the same 2 nameservers, registered through same privacy proxy
3. Hosting: All sites hosted on 3 VPS instances — IPs trace to a hosting provider in a non-cooperative jurisdiction
4. Payments: $340K in ad spend, paid via crypto from 4 wallets — all funded from same source wallet
5. Source wallet: Funded by a wire from a company registered to a known state-affiliated media organization
6. Narrative: All stories translate from Russian source — grammatical artifacts (missing articles, aspect confusion) consistent with native Russian speaker
7. Timezone: Posting activity peaks at 9AM-6PM Moscow time, drops to zero during Russian public holidays
8. Attribution: TTPs match "FROST BEAR" — a known state-sponsored influence group
9. OPSEC failure: One admin account posted from an IP that resolves to a government ministry building

### Connections (8 required)

1. Coordinated: 200+ accounts created in waves with StyleGAN photos
2. Infrastructure: 20 domains share nameservers + hosting
3. Financial: Crypto ad spend traces to state media company
4. Language: Russian source language artifacts in translations
5. Timezone: Activity pattern matches Moscow business hours
6. Attribution: TTPs match FROST BEAR
7. OPSEC failure: Admin IP = government ministry
8. Campaign goal: Undermine NATO-aligned candidate before election

### Final Answer

`frost bear` (threat actor) + `russia` or `gru` (origin)

---

## Build Order

| Priority | Box | Complexity | Unique Engine Needs |
|----------|-----|-----------|---------------------|
| 1 | OW-01: Mole Hunt | Medium | SIEM simulator, badge log viewer |
| 2 | OW-04: Burned Source | Medium | Voice memo player, OSINT search |
| 3 | OW-05: Phantom Ledger | High | Banking terminal, money flow viz |
| 4 | OW-02: Dead Drop | High | Blockchain explorer, mixer analysis |
| 5 | OW-03: Glass House | High | BMS dashboard, BACnet viewer |
| 6 | OW-06: Signal Lost | High | Telemetry dashboard, satellite imagery viewer |
| 7 | OW-07: Counterfeit | High | Social media monitor, narrative tracker |

### Shared Components (build once, reuse)

1. **CaseBoard** — Evidence correlation workspace (already exists in Gate 8, adapt for Arena)
2. **Evidence Catalog** — Standardized evidence item format with metadata
3. **Connection Tracker** — Relationship detection and scoring
4. **Narrative Clock** — Accelerated time with event triggers
5. **Threat/Consequence System** — Time-based evidence destruction
6. **Persistent Nav** — Device switcher + tools + clock + score
7. **DataDrill** — Forensic recovery tool (adapt from Gate 8)

### Firestore Integration

Each box needs:
- `flag_registry/{boxId}` — 3 flags per box (server-delivered)
- `arena_ratings/{boxId}` — Hat rating aggregate
- No local flag text — all via `deliverFlag` Cloud Function

### Flag Registration

```json
{
    "ow-01-mole-hunt": {
        "flags": {
            "insider": "flag{m0l3_hunt_d4v1d_p4rk_dns_tunn3l}",
            "method": "flag{m0l3_hunt_3xf1l_v14_dns}",
            "accomplice": "flag{m0l3_hunt_br0k3r_v1s1t0r}"
        }
    }
}
```

*(Full flag values to be generated per box at build time)*

---

## Design Principles

1. **Open world** — student can explore any device in any order
2. **Evidence correlation** — no single device has the answer; synthesis required
3. **Red herrings** — 20-30% of evidence is noise or intentionally misleading
4. **Consequences** — ignoring time pressure costs evidence, not the game
5. **Multiple valid paths** — different investigation strategies reach the same conclusion
6. **No local flags** — all server-delivered via {{FLAG:}} tokens
7. **Narrative immersion** — detective check-ins, threats, atmospheric events
8. **Realistic interfaces** — simulated OS environments, not abstract puzzles

---

*Reviewed by: Pending Nancy review before build begins*
