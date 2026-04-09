# OWS Series — Open World Shipping / Logistics CTF

**Status:** APPROVED — Marathon Build
**Created:** 2026-04-08
**Architecture:** OpenWorldEngine.js (same as OW series)
**Location:** `_app/arena/boxes/ows-{NN}-{slug}/`
**Series Prefix:** OWS (Open World Shipping)
**Industry:** Transportation, Logistics, Supply Chain
**Advisory Board Context:** Real client experiencing IAM-based freight fraud — threat actors accessing shipping logs, impersonating drivers, hijacking loads. Millions in losses.

---

## Industry Background

Strategic cargo theft via identity-based freight fraud has increased 600%+ since 2022 (FBI/CargoNet data). The attack pattern:

1. Threat actor gains access to logistics platform (TMS, load board, broker email, ELD)
2. Identifies high-value loads — pickup location, time window, BOL number, driver identity
3. Shows up at pickup point with correct paperwork, impersonates assigned driver/carrier
4. Shipper releases goods to the impersonator
5. Load disappears — no GPS tracking, no recovery

This is NOT traditional cargo theft (hijacking trucks on the road). This is **social engineering at scale** using stolen digital identity and logistics intelligence.

---

## Real Attack Vectors (Validated Against Industry Reports)

| Vector | Prevalence | Platforms Targeted | Typical Loss |
|--------|-----------|-------------------|-------------|
| TMS Credential Theft | High | Oracle TMS, SAP TM, MercuryGate, TMW, McLeod | $200K-2M per campaign |
| Broker Email Compromise | Very High | Outlook/Gmail, TMS integrations | $50K-500K per incident |
| Load Board Account Theft | High | DAT, Truckstop.com, 123Loadboard | $100K-1M per campaign |
| ELD/Telematics Compromise | Medium | Samsara, Motive (KeepTruckin), Omnitracs | $500K+ (targeted high-value) |
| Double Brokering (Insider) | Very High | Any 3PL, freight marketplace | $1M-10M over months |
| Port TOS Compromise | Low (high impact) | Navis N4, Tideworks, SPARCS | $5M+ (container-level theft) |
| API Key Exposure | Medium | REST APIs for TMS, ELD, load boards | Varies (programmatic access) |

---

## OWS-01: Operation Ghost Haul

**Subtitle:** TMS Credential Theft — Freight Schedule Exfiltration
**Difficulty:** Advanced
**Estimated Time:** 60-90 minutes
**Flags:** 3 (compromised account, exfiltration method, accomplice identity)
**Theme Color:** #f97316 (orange — logistics/freight)

### Scenario

Meridian Freight Solutions has reported 7 high-value load thefts in 3 weeks — all electronics shipments worth $50K-200K each. Every stolen load was picked up by someone with the correct BOL number, MC number, and driver name. The real carriers arrived to find the loads already gone. Someone inside the system is feeding the attackers real-time load intelligence.

The company uses **FleetCommand TMS** (simulated Oracle TMS-style platform) to manage 400+ daily shipments. Investigation reveals a compromised dispatcher account that was accessed from an anomalous IP, querying only high-value electronics loads during off-hours.

### Devices & Interfaces

| Page | Interface | Content |
|------|-----------|---------|
| `index.html` | Investigation Command Center | Case briefing, 7 theft timeline, investigation dashboard |
| `tms.html` | FleetCommand TMS Dashboard | Load search (500+ loads), shipment details, carrier assignments, BOL viewer, pickup/delivery schedules, dispatcher activity log |
| `email.html` | Corporate Email (Exchange) | 50+ emails — dispatch coordinator inboxes, phishing email chain, carrier communications, internal alerts |
| `iam.html` | Identity & Access Management Console | User accounts (40+), login history with IPs/geolocations, MFA status, password reset log, role assignments, API key inventory |
| `network.html` | Network/VPN Logs | VPN session logs, firewall events, DNS queries, data transfer volumes per session, geographic anomalies |
| `gps.html` | Fleet GPS/Telematics Dashboard | Real-time truck map (simulated), historical routes for stolen loads, geofence alerts, ETA comparisons (expected vs actual pickup) |
| `caseboard.html` | Evidence Board | Link analysis workspace |

### Key Evidence Trail

1. **IAM:** Dispatcher account `dispatch-t.williams` logged in from IP 185.220.101.xx (Tor exit node) at 02:00-04:00 AM on 7 dates matching theft dates
2. **IAM:** Same account has MFA disabled — was changed 3 weeks ago by `admin-j.martinez` (IT admin)
3. **TMS:** The Tor sessions queried ONLY electronics loads >$50K with pickup within 48 hours — surgical targeting
4. **Email:** `t.williams` received a phishing email from `fleetcommand-support@fc-update.com` (typosquat) on Feb 15 — clicked the credential harvesting link
5. **Email:** Credential reset confirmation sent to `t.williams` 4 hours after the phishing click — password was changed by the attacker
6. **Network:** VPN logs show `t.williams` account connected from 2 IPs simultaneously on 3 occasions (legitimate home IP + Tor exit node)
7. **GPS:** For all 7 stolen loads, a vehicle matching the carrier's truck description arrived at the pickup point 15-30 minutes BEFORE the real carrier — the impostor had advance schedule knowledge
8. **IAM:** `admin-j.martinez` disabled MFA for `t.williams` at `t.williams`'s request via email — but the email was sent FROM the compromised account (attacker requested MFA removal)
9. **TMS:** Export log shows 7 BOL PDFs downloaded during the Tor sessions — one for each stolen load

### The Attack Chain

1. Phishing email compromises `t.williams` credentials (Feb 15)
2. Attacker logs in, requests MFA removal via email to IT admin (Feb 16)
3. IT admin disables MFA without verifying identity (Feb 16)
4. Attacker queries TMS nightly for high-value electronics loads (Feb 17 — Mar 8)
5. Attacker downloads BOL, gets carrier/driver details
6. Accomplice shows up at pickup with correct BOL, MC number, driver name
7. Shipper releases load to impostor

### Connections (7 required)

1. Phishing → credential compromise (email + IAM password reset timing)
2. MFA removal → attacker request from compromised email (IAM + email)
3. Tor sessions → only electronics loads queried (IAM + TMS)
4. BOL downloads → match stolen load numbers (TMS + theft timeline)
5. Simultaneous sessions → legitimate + Tor IP (network + IAM)
6. GPS timing → impostor arrived before real carrier (GPS + TMS schedule)
7. 7 thefts match 7 Tor session dates (timeline correlation)

### Final Answer

`t.williams phishing` or `dispatch-t.williams credential theft`

---

## OWS-02: Operation Paper Trail

**Subtitle:** Broker Email Compromise — Phantom Carrier Scheme
**Difficulty:** Advanced
**Estimated Time:** 60-90 minutes
**Flags:** 3 (compromised broker, fake carrier identity, money trail)
**Theme Color:** #eab308 (yellow — financial/documentation)

### Scenario

Summit Logistics, a mid-size freight broker, has had 12 loads stolen in 6 weeks. Each time, the shipper confirmed the pickup to Summit's dispatcher, but the carrier that showed up was not the one Summit dispatched. Someone is intercepting Summit's load tenders and substituting their own carrier — a phantom company with a cloned MC number, fake insurance, and a real truck.

Investigation reveals a Business Email Compromise (BEC) on a senior broker's account. The attacker monitored incoming load tenders for 2 weeks, then began selectively forwarding high-value tenders to the phantom carrier before the real carrier received them.

### Devices & Interfaces

| Page | Interface | Content |
|------|-----------|---------|
| `index.html` | Investigation Command Center | 12 theft timeline, loss summary ($1.8M total), case briefing |
| `email.html` | Exchange Email — Broker Accounts | 60+ emails across 3 broker inboxes. Inbox rules showing auto-forward to external address. Rate confirmations, load tenders, carrier packets |
| `carrier.html` | Carrier Verification Portal | FMCSA lookup (MC/DOT numbers), insurance verification, carrier onboarding records, safety scores, authority status, contact details for 50+ carriers (real + phantom) |
| `loadboard.html` | Load Board Activity | DAT/Truckstop-style load posting history, bid history, carrier match logs, rate trends, load-to-truck ratios |
| `financial.html` | Accounting / AP Records | Payment history, QuickPay records, factoring company data, carrier payment addresses, bank routing changes, check images |
| `docs.html` | Document Vault | BOLs, rate confirmations, carrier packets, W-9s, insurance certificates — comparing real vs forged documents |
| `caseboard.html` | Evidence Board | Link analysis workspace |

### Key Evidence Trail

1. **Email:** Senior broker `m.reeves@summit-logistics.com` has an inbox rule forwarding all emails containing "load tender" or "rate confirmation" to `m.reeves.backup@proton.me` — created Feb 1
2. **Email:** Login from unusual IP (Romania) on Jan 30 — 2 days before the forwarding rule appeared
3. **Carrier:** "Atlas Express LLC" (MC-1247832) was onboarded Feb 5 — MC number is a clone of legitimate "Atlas Freight Inc" (MC-1247832) which went out of business in 2024
4. **Carrier:** Insurance certificate for Atlas Express has a forged ACORD form — the phone number on the cert goes to a VoIP service, not the listed insurer
5. **Financial:** All 12 payments to Atlas Express went to the same Wells Fargo account in Tampa — opened Jan 28 (2 days before the email compromise)
6. **Docs:** BOL comparison — real carrier's BOL and phantom carrier's BOL have identical load numbers but different driver names and truck numbers
7. **Email:** The attacker forwarded rate confirmations to Atlas Express 10-30 minutes before Summit's dispatcher sent them to the real carrier — the phantom always arrived first
8. **Loadboard:** Atlas Express bid on 0 loads through the load board — all 12 loads came directly via the compromised email forward

### Connections (8 required)

1. Email compromise: Romanian IP login → inbox rule creation (email + IAM)
2. Forwarding rule: auto-forward to proton.me captures all load tenders (email)
3. Phantom carrier: Atlas Express MC cloned from defunct Atlas Freight (carrier)
4. Insurance fraud: forged ACORD certificate with VoIP phone (carrier + docs)
5. Timing: phantom received tenders before real carrier (email timestamps)
6. Financial: bank account opened 2 days before compromise (financial + timeline)
7. Zero load board activity: all loads via email intercept, not market (loadboard)
8. 12 loads match 12 forwarded rate confirmations (email + theft timeline)

### Final Answer

`m.reeves email compromise` + `atlas express phantom carrier`

---

## OWS-03: Operation Black Box

**Subtitle:** ELD/Telematics Platform Breach — Real-Time Fleet Tracking Exploit
**Difficulty:** Expert
**Estimated Time:** 90-120 minutes
**Flags:** 3 (compromised platform, surveillance method, intercept location pattern)

### Scenario

Pacific Coast Carriers has lost 5 high-value pharmaceutical loads in 4 weeks — all seized at truck stops along I-5 between Portland and Los Angeles. In each case, the driver stopped for a mandatory 30-minute break (per HOS regulations), and during the break, someone broke into the trailer and removed specific pallets — not the entire load. They knew exactly which pallets to take and exactly when the driver would be stopped.

Investigation reveals the company's ELD/telematics platform (simulated Samsara/Motive) was compromised via an exposed API key in a GitHub repository. The attacker had real-time GPS tracking of every truck in the fleet.

### Devices & Interfaces

| Page | Interface | Content |
|------|-----------|---------|
| `index.html` | Investigation Command Center | 5 theft timeline, I-5 corridor map, loss summary |
| `eld.html` | ELD/Telematics Dashboard | Real-time fleet map (30 trucks), historical routes, HOS (Hours of Service) logs, driver break predictions, geofence alerts, speed/idle events |
| `api.html` | API Access Audit | API key inventory, request logs (IP, endpoint, timestamp, payload), rate limiting events, deprecated keys, GitHub exposure scan results |
| `manifest.html` | Shipment Manifest System | Load manifests with pallet-level detail (contents, weight, value, position in trailer), delivery schedules, customer data |
| `cameras.html` | Truck Stop Camera Feeds | Security camera stills from 5 truck stops (timestamped), vehicle plate captures, person descriptions |
| `network.html` | Network & Cloud Logs | AWS CloudTrail, API Gateway logs, S3 access logs, unusual query patterns, geographic distribution of API calls |
| `caseboard.html` | Evidence Board | Link analysis workspace |

### Key Evidence Trail

1. **API:** API key `sk_live_4eC39HqLyjWDar...` found in public GitHub repo (`pacific-coast-carriers/fleet-integration`) committed Oct 2025, never rotated
2. **API:** This key has been making requests from IP 103.152.xx.xx (Vietnam VPN) since Feb 1 — 2,400+ requests/day, all to `/v1/vehicles/location` and `/v1/hos/available_hours`
3. **API:** The attacker queried HOS data to predict mandatory break windows — drivers with <30 minutes remaining MUST stop within the hour
4. **ELD:** All 5 thefts occurred during predicted 30-minute breaks on I-5 (correlated with HOS data + GPS location)
5. **Manifest:** Only pharmaceutical pallets were taken from mixed loads — the attacker queried `/v1/shipments/{id}/manifest` to identify which pallets contained pharma
6. **Cameras:** Same white Sprinter van (plate partially obscured) visible at 4 of 5 truck stops, arriving 5-10 minutes after the target truck
7. **Network:** CloudTrail shows the compromised API key accessing S3 bucket `s3://pcc-manifests/` directly — downloaded 47 manifest PDFs
8. **API:** No other API key shows this query pattern — all legitimate integrations query different endpoints (fuel card, maintenance)

### Connections (7 required)

1. GitHub exposure: API key committed to public repo, never rotated (API + network)
2. Anomalous requester: Vietnam IP querying location + HOS only (API audit)
3. HOS prediction: attacker calculated mandatory break windows (ELD + API)
4. GPS correlation: 5 thefts at predicted break locations on I-5 (ELD + timeline)
5. Pallet targeting: manifest queries identified pharma-specific pallets (manifest + API)
6. Sprinter van: same vehicle at 4 of 5 locations (cameras)
7. S3 access: 47 manifests downloaded via compromised key (network + manifest)

### Final Answer

`api key github exposure` + `hos break prediction`

---

## OWS-04: Operation Iron Gate

**Subtitle:** Port Terminal System Compromise — Container Diversion
**Difficulty:** Expert
**Estimated Time:** 90-120 minutes
**Flags:** 3 (compromised system, diversion method, insider identity)

### Scenario

The Port of Long Beach has detected 3 shipping containers missing from the yard — $12M in consumer electronics. The containers cleared customs, were unloaded from the vessel, placed in the yard... and then vanished. Terminal Operating System (TOS) records show the containers were picked up by authorized drayage trucks with valid gate appointments. But the trucking companies say they never dispatched those trucks.

Investigation reveals the port's Navis N4 terminal system was compromised by an insider — a gate clerk who sold login credentials to an organized theft ring. The attackers created fraudulent gate appointments and forged equipment interchange receipts (EIRs).

### Devices & Interfaces

| Page | Interface | Content |
|------|-----------|---------|
| `index.html` | Investigation Command Center | 3 missing containers, $12M loss, port layout diagram |
| `tos.html` | Terminal Operating System (Navis N4 style) | Container inventory, yard positions, vessel discharge records, gate appointments, equipment interchange receipts, truck visit history |
| `gate.html` | Gate Camera & RFID Logs | Gate entry/exit photos (truck + chassis + container), RFID tag reads, OCR plate captures, timestamps, appointment verification status |
| `customs.html` | Customs & Border Protection Records | Entry summaries, container inspection status, hold/release decisions, broker filings, manifest data |
| `iam.html` | Port Authority IAM | Employee accounts, role assignments, system access logs, gate clerk shift schedules, credential sharing audit |
| `drayage.html` | Drayage Carrier Records | Registered drayage companies, truck registrations, driver TWIC card records, appointment booking history, past container pickups |
| `caseboard.html` | Evidence Board | Link analysis workspace |

### Key Evidence Trail

1. **TOS:** 3 containers (MSCU7742891, MSCU7742892, MSCU7742893) were marked "Picked Up" in N4 — but the assigned drayage company (Harbor Express) never dispatched trucks for those containers
2. **Gate:** Gate appointment for all 3 containers created by user `gate-clerk-r.santos` at 02:15 AM — outside his shift (he works 06:00-14:00)
3. **IAM:** `gate-clerk-r.santos` account was accessed from an IP belonging to a residential address in Compton — not the port terminal
4. **Gate Camera:** Truck at gate for container MSCU7742891 has license plate matching a registered drayage truck from "Pacific Dray LLC" — a company registered only 6 weeks ago
5. **Drayage:** Pacific Dray LLC has 1 truck, registered to R. Santos's brother-in-law (A. Reyes), TWIC card application approved 5 weeks ago (expedited)
6. **TOS:** Equipment Interchange Receipts (EIRs) for all 3 containers were digitally signed by `gate-clerk-r.santos` — the digital signature timestamps match the 02:15 AM session
7. **Customs:** All 3 containers cleared CBP inspection and were released — the theft happened AFTER customs release, during the yard-to-gate transfer
8. **IAM:** R. Santos's password was never shared (no credential-sharing audit flags) — he logged in himself from his home IP, meaning he is the insider

### Connections (8 required)

1. Fraudulent appointments: created at 02:15 AM outside R. Santos's shift (TOS + IAM)
2. Remote access: R. Santos logged in from home IP (IAM + network)
3. Pacific Dray: shell company registered to Santos's brother-in-law (drayage + public records)
4. TWIC card: A. Reyes got expedited TWIC 5 weeks ago — timed with company registration (drayage)
5. Gate camera: truck matches Pacific Dray registration (gate + drayage)
6. EIR signatures: digitally signed by Santos during the off-hours session (TOS + IAM)
7. Post-customs: theft occurred after CBP release (customs + TOS timeline)
8. 3 containers, same vessel, same night — coordinated single operation (TOS)

### Final Answer

`r santos insider` + `pacific dray shell company`

---

## OWS-05: Operation Blind Spot

**Subtitle:** Double Brokering Fraud Ring — Insider 3PL Scheme
**Difficulty:** Expert
**Estimated Time:** 90-120 minutes
**Flags:** 3 (insider identity, fraud scheme structure, financial trail endpoint)

### Scenario

National Freight Partners (NFP), a top-20 freight brokerage, has $2.3M in claims from shippers whose loads were picked up by carriers that NFP never authorized. The pattern: an NFP dispatcher receives a load tender from a shipper, posts it on the internal dispatch board, but before the assigned carrier is notified, the load is re-brokered to an outside carrier who picks up and delivers the load — then invoices a different factoring company. The shipper pays NFP, NFP tries to pay the carrier, but the carrier says they never hauled the load. The money disappears.

This is **double brokering** — a $500M/year problem in the US freight industry. Someone inside NFP is systematically re-brokering loads to a network of shell carriers, collecting payment through factoring companies, and pocketing the difference.

### Devices & Interfaces

| Page | Interface | Content |
|------|-----------|---------|
| `index.html` | Investigation Command Center | 47 affected loads over 6 months, $2.3M total losses, case briefing |
| `dispatch.html` | NFP Dispatch Board | Load postings, carrier assignments, dispatch timestamps, load status updates, communication log between dispatchers and carriers |
| `carrier.html` | Carrier Verification System | 200+ carrier profiles — MC/DOT lookups, insurance status, authority history, SaferSys scores, onboarding dates, carrier packet documents |
| `financial.html` | Accounting & Factoring | Payment flows: shipper→NFP→carrier, factoring assignments (OTR Solutions, Triumph, RTS), invoice discrepancies, bank account changes, payment timing anomalies |
| `email.html` | Corporate Email | 70+ emails across 4 dispatcher accounts — internal load assignments, external carrier communications, customer complaints, compliance alerts |
| `loadboard.html` | Internal Load Board + Market Data | Side-by-side: what was posted internally vs what appeared on external load boards (DAT), timing of external posts vs internal assignments |
| `caseboard.html` | Evidence Board | Link analysis workspace |

### Key Evidence Trail

1. **Dispatch:** 47 loads assigned to Carrier A (legitimate) but hauled by Carrier B (shell). Carrier A never received the dispatch notification.
2. **Dispatch:** All 47 loads were dispatched during shifts worked by dispatcher `k.thompson`
3. **Email:** `k.thompson` has a secondary email alias `kt.dispatch@nfp-carriers.com` (typosquat of the real `nfp-partners.com`) — used to send fake rate confirmations to shell carriers
4. **Carrier:** 6 shell carriers (identical pattern): all registered within 90 days, all with MC numbers in sequential range, all have the same registered agent address in Savannah, GA
5. **Financial:** All 6 shell carriers assigned their invoices to the same factoring company (QuickFund Capital) — which pays within 24 hours and takes a 5% fee
6. **Financial:** QuickFund Capital's bank account traces to a business registered to K. Thompson's spouse
7. **Loadboard:** The 47 loads appeared on the external DAT board 5-15 minutes AFTER being posted on NFP's internal board — posted from an IP matching Thompson's personal hotspot
8. **Email:** Customer complaints about "wrong driver showed up" were all handled by Thompson — who marked them as "resolved: carrier substitution approved by shipper" (the shipper never approved)

### Connections (9 required)

1. Single dispatcher: all 47 loads on Thompson's shifts (dispatch)
2. Typosquat email: nfp-carriers.com mimics nfp-partners.com (email)
3. Shell carrier network: 6 carriers, sequential MC#s, same registered agent (carrier)
4. Factoring concentration: all invoices through QuickFund Capital (financial)
5. QuickFund ownership: traces to Thompson's spouse (financial + public records)
6. External posting: loads posted on DAT from Thompson's hotspot IP (loadboard + network)
7. Timing: external post always 5-15 min after internal assignment (loadboard + dispatch)
8. Complaint suppression: Thompson handled and closed all complaints (email + dispatch)
9. Carrier A never notified: dispatch notification was deleted before send (dispatch logs)

### Final Answer

`k thompson double brokering` + `quickfund capital factoring`

---

## Build Order

| Priority | Box | Complexity | Unique Interfaces |
|----------|-----|-----------|-------------------|
| 1 | OWS-01: Ghost Haul | Medium | TMS dashboard, IAM console, GPS fleet map |
| 2 | OWS-02: Paper Trail | Medium | Carrier verification portal, document vault, load board |
| 3 | OWS-03: Black Box | High | ELD/telematics dashboard, API audit, manifest system |
| 4 | OWS-04: Iron Gate | High | Terminal OS (Navis-style), gate cameras, customs records |
| 5 | OWS-05: Blind Spot | High | Dispatch board, factoring system, load board comparison |

### Shared Components (from OW series, reused)

- OpenWorldEngine.js (already built)
- CaseBoard template
- Email client template
- Evidence system
- Narrative clock
- Notification system

### New Components for OWS

- **TMS Dashboard** — Load search, shipment cards, BOL viewer, dispatch activity log
- **Carrier Verification Portal** — FMCSA-style MC/DOT lookup with safety scores, insurance status
- **Fleet GPS Map** — Truck positions, historical routes, HOS predictions
- **Load Board** — DAT/Truckstop-style load posting interface
- **Terminal Operating System** — Container yard map, gate appointments, EIR viewer
- **Dispatch Board** — Load assignment interface with carrier matching
- **Financial/Factoring** — Payment flow visualization, invoice tracking

### Flag Registration

Flags are server-delivered via `deliverFlag` Cloud Function. No local flag text.

---

## Design Principles (same as OW series)

1. **Open world** — investigate any system in any order
2. **Evidence correlation** — no single system has the answer
3. **Realistic noise** — 80% of data is routine, 20% is evidence
4. **Industry authentic** — students who work in logistics should recognize every interface
5. **No local flags** — all server-delivered via {{FLAG:}} tokens
6. **Narrative immersion** — handler check-ins, time pressure, consequences
7. **Advisory board applicable** — scenarios directly address the client's freight fraud problem

---

*Design document for Advisory Board review. Scenarios validated against CargoNet, FBI IC3, and FMCSA public data on freight fraud trends.*
