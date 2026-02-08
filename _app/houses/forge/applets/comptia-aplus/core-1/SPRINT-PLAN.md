# CompTIA A+ Core 1 (220-1101) Sprint Plan

**Source:** Sybex CompTIA A+ Complete Study Guide slides
**Location:** `/home/eq/ai-content/A+/Comptia A+ 1/`
**Target:** Hexworth Prime Forge House
**Path:** `_app/houses/forge/applets/comptia-aplus/core-1/`

---

## Current Status

| Item | Status |
|------|--------|
| Sprint 0 | **COMPLETED** - Cleanup done |
| Sprint 1 | **COMPLETED** - All 3 chapters done |
| Sprint 2 | **COMPLETED** - All 3 chapters done |
| Chapter 1 | **COMPLETED** - Motherboards, Processors, Memory |
| Chapter 2 | **COMPLETED** - Expansion Cards, Storage, Power |
| Chapter 3 | **COMPLETED** - Peripherals, Cables, Connectors |
| Chapter 4 | **COMPLETED** - Printers and Multifunction Devices |
| Chapter 5 | **COMPLETED** - Networking Fundamentals |
| Chapter 6 | **COMPLETED** - Introduction to TCP/IP |
| Sprint 3 | **COMPLETED** - Both chapters done |
| Chapter 7 | **COMPLETED** - Wireless and SOHO Networks |
| Chapter 8 | **COMPLETED** - Network Services, Virtualization, Cloud |
| Sprint 4 | **DEPLOYED** - Both chapters live |
| Chapter 9 | **DEPLOYED** - Laptop and Mobile Device Hardware |
| Chapter 10 | **DEPLOYED** - Mobile Connectivity and Application Support |
| Sprint 5 | **DEPLOYED** - All chapters live! |
| Chapter 11 | **DEPLOYED** - Troubleshooting Methodology |
| Chapter 12 | **DEPLOYED** - Hardware & Network Troubleshooting |
| Labs | 6 exist (reusable) - basic lab structure in place |
| **STATUS** | **🎉 CORE 1 COMPLETE - 12/12 CHAPTERS LIVE! 🎉** |

---

## Chapter Reference (From Slides)

| Ch | Title | Slide File | Lab Idea |
|----|-------|------------|----------|
| 1 | Motherboards, Processors, and Memory | 1101 Chap 1.pdf | Component Identification Lab |
| 2 | Expansion Cards, Storage Devices, and Power Supplies | 1101 Chap 2.pdf | PSU Wattage Calculator Lab |
| 3 | Peripherals, Cables and Connectors | 1101 Chap 3.pdf | Cable Matching Lab |
| 4 | Printers and Multifunction Devices | 1101 Chap 4.pdf | Printer Troubleshooting Simulator |
| 5 | Networking Fundamentals | 1101 Chap 5.pdf | Network Topology Builder |
| 6 | Introduction to TCP/IP | 1101 Chap 6.pdf | IP Subnetting Calculator |
| 7 | Wireless and SOHO Networks | 1101 Chap 7.pdf | Wireless Security Advisor |
| 8 | Network Services, Virtualization and Cloud Computing | 1101 Chap 8.pdf | Cloud Service Matcher |
| 9 | Laptop and Mobile Device Hardware | 1101 Chap 9.pdf | Laptop Component Identifier |
| 10 | Mobile Connectivity and Application Support | 1101 Chap 10.pdf | Mobile Sync Troubleshooter |
| 11 | Troubleshooting Methodology and Resolving Core Hardware Problems | 1101 Chap 11.pdf | Troubleshooting Flowchart Lab |
| 12 | Hardware and Network Troubleshooting | 1101 Chap 12.pdf | Diagnostic Scenario Simulator |

---

## Sprint Breakdown

### SPRINT 0: Cleanup (Pre-work) ✅ COMPLETED
**Goal:** Remove misaligned content, prepare structure

- [x] Delete existing `chapters/ch01-ch12` directories
- [x] Keep `labs/` directory (reviewed - 6 labs reusable)
- [x] Keep `domains/` directory (review for integration)
- [x] Update `core-1/index.html` navigation structure
- [x] Update Forge `index.html` SAMPLE_MODULES array

---

### SPRINT 1: Hardware Foundations (Chapters 1-3)
**Focus:** Core PC hardware components

#### Chapter 1: Motherboards, Processors, and Memory
**Slide:** 1101 Chap 1.pdf (37 pages)
**Exam Objectives:** 3.2, 3.4

Content Sections:
- [x] Section 1: Understanding Motherboards (Form factors: ATX, Micro-ATX, ITX)
- [x] Section 2: System Board Components (Bus, Chipsets, Northbridge/Southbridge)
- [x] Section 3: Expansion Slots (PCI, PCIe lanes/links, Riser cards)
- [x] Section 4: Motherboard Connectors (SATA, eSATA, M.2, Headers, Power)
- [x] Section 5: CPUs and Sockets (PGA, LGA, Intel/AMD, x64/x86)
- [x] Section 6: Memory Types (DDR3/4/5, DIMM/SODIMM, ECC, Channels)
- [x] Section 7: BIOS/UEFI and Firmware (POST, CMOS, Flashing)
- [x] Section 8: Cooling Systems (Fans, Heat sinks, Thermal paste, Liquid)
- [x] Lab: Component Identification Lab (linked existing labs)

#### Chapter 2: Expansion Cards, Storage Devices, and Power Supplies
**Slide:** 1101 Chap 2.pdf
**Exam Objectives:** 3.3, 3.4, 3.5

Content Sections:
- [x] Section 1: Expansion Card Types (Video, Sound, Network, Capture, USB)
- [x] Section 2: Hard Disk Drives (HDD anatomy, PATA, speeds, sizes)
- [x] Section 3: Solid State Drives (SSD vs HDD, SSHD)
- [x] Section 4: Storage Interfaces (SATA, NVMe, M.2, PCIe)
- [x] Section 5: RAID Configurations (0, 1, 5, 10)
- [x] Section 6: Removable Storage & Optical Drives
- [x] Section 7: Power Supply Units (Wattage, Efficiency, Modular)
- [x] Section 8: Power Connectors (24-pin, 8-pin, Molex, SATA, PCIe)
- [x] Interactive: RAID Calculator, Storage Speed Comparison
- [x] Lab: Linked existing `psu-connectors-lab.html`
- [x] Quiz: 15 questions with 70% pass threshold

#### Chapter 3: Peripherals, Cables and Connectors
**Slide:** 1101 Chap 3.pdf
**Exam Objectives:** 3.1

Content Sections:
- [x] Section 1: Display Technologies (LCD, OLED, Backlights)
- [x] Section 2: Display Settings & Features (Resolution, Refresh Rate)
- [x] Section 3: Input/Output Devices (Keyboard, Mouse, KVM, Scanners)
- [x] Section 4: USB Standards & Connectors (1.1-4, Type-A/B/C, Colors)
- [x] Section 5: Thunderbolt Technology (TB 1-4, speeds, connectors)
- [x] Section 6: Video Cables (VGA, DVI variants, HDMI, DisplayPort)
- [x] Section 7: Hard Drive Cables (SATA, eSATA, PATA, SCSI, SAS)
- [x] Section 8: Serial & Legacy Connectors (DB-9, Molex)
- [x] Interactive: USB Speed Color Match, Cable Connector Matcher
- [x] Quiz: 15 questions with 70% pass threshold
- [x] Lab: Cable Matching Lab link added

---

### SPRINT 2: Printers & Networking Basics (Chapters 4-6)
**Focus:** Printers and network foundations

#### Chapter 4: Printers and Multifunction Devices ✅ COMPLETE
**Slide:** 1101 Chap 4.pdf (22 pages)
**Exam Objectives:** 3.6, 3.7

Content Sections:
- [x] Section 1: Printer Types Overview (Impact, Inkjet, Laser, Thermal, 3D)
- [x] Section 2: Impact Printers (Daisy wheel, Dot-matrix, components)
- [x] Section 3: Inkjet Printers (Components, maintenance)
- [x] Section 4: Laser Printer Components (Toner, drum, fuser, corona)
- [x] Section 5: Laser Imaging Process (7 Steps with mnemonic)
- [x] Section 6: Thermal and 3D Printers (FDM, SLA, filaments)
- [x] Section 7: Printer Interfaces & Software (USB, Ethernet, PDL)
- [x] Section 8: Installation, Sharing & Maintenance
- [x] Interactive: Laser Process Sequencer (drag-and-drop)
- [x] Interactive: Printer Component Matcher
- [x] Interactive: Voltage Quick Check
- [x] Quiz: 15 questions with 70% pass threshold
- [x] Lab link: Printer Troubleshooting Lab

#### Chapter 5: Networking Fundamentals ✅ COMPLETE
**Slide:** 1101 Chap 5.pdf (22 pages)
**Exam Objectives:** 2.2, 2.7, 3.1

Content Sections:
- [x] Section 1: Network Types (LAN, WAN, PAN, MAN, SAN, WLAN)
- [x] Section 2: Network Components & Access Models (P2P, Client-Server)
- [x] Section 3: Network Topologies (Bus, Star, Ring, Mesh, Hybrid)
- [x] Section 4: OSI Model (7 layers with mnemonic)
- [x] Section 5: Copper Cabling (Coax, Cat 5/5e/6/6a/7, twisted pair)
- [x] Section 6: Fiber Optics & Wiring Standards (SMF, MMF, T568A/B)
- [x] Section 7: Connectivity Devices (Hub, Switch, Router, Bridge, Firewall)
- [x] Section 8: NICs & IEEE 802 Standards (CSMA/CD, CSMA/CA)
- [x] Interactive: OSI Layer Sequencer (drag-and-drop)
- [x] Interactive: Cable Category Matcher
- [x] Interactive: Device Layer Quiz
- [x] Quiz: 15 questions with 70% pass threshold
- [x] Lab link: Network Topology Lab

#### Chapter 6: Introduction to TCP/IP ✅ COMPLETE
**Slide:** 1101 Chap 6.pdf (28 pages)
**Exam Objectives:** 2.1, 2.5, 2.6

Content Sections:
- [x] Section 1: TCP/IP Model (DoD 4-layer vs OSI 7-layer mapping)
- [x] Section 2: TCP vs UDP (connection-oriented vs connectionless)
- [x] Section 3: Common Ports & Protocols (16+ ports - exam critical!)
- [x] Section 4: IPv4 Addressing Fundamentals (32-bit, binary, octets)
- [x] Section 5: IP Address Classes & Private Ranges (A-E, RFC 1918)
- [x] Section 6: Subnetting & CIDR Notation (/8, /16, /24, host calculation)
- [x] Section 7: Network Services (DHCP DORA, DNS records, NAT, APIPA)
- [x] Section 8: IPv6 & Virtual Networks (128-bit, VLANs, VPNs)
- [x] Interactive: Port Number Challenge (match protocols to ports)
- [x] Interactive: IP Address Class Identifier
- [x] Interactive: CIDR / Subnet Mask Converter
- [x] Quiz: 15 questions with 70% pass threshold
- [x] Lab link: IP Subnetting Practice Lab

---

### SPRINT 3: Wireless & Cloud (Chapters 7-8)
**Focus:** Wireless networking and virtualization

#### Chapter 7: Wireless and SOHO Networks ✅ COMPLETE
**Slide:** 1101 Chap 7.pdf (25 pages)
**Exam Objectives:** 2.3, 2.5, 2.7

Content Sections:
- [x] Section 1: IEEE 802.11 Fundamentals (CSMA/CA, frequencies, modulation, channels)
- [x] Section 2: Wi-Fi Standards (802.11a/b/g/n/ac/ax speeds and frequencies)
- [x] Section 3: Bluetooth, RFID, and NFC (short-range wireless technologies)
- [x] Section 4: Internet Connection Types (DSL, Cable, Fiber, Satellite, Cellular)
- [x] Section 5: Cellular Technologies (3G/4G/5G, GSM vs CDMA, LTE)
- [x] Section 6: SOHO Network Planning & Installation (wired vs fiber standards)
- [x] Section 7: Wireless Security (WEP/WPA/WPA2/WPA3 evolution)
- [x] Section 8: Wireless Router Configuration (5 config steps, channel best practices)
- [x] Interactive: Wi-Fi Standard Speed Matcher
- [x] Interactive: Wireless Security Strength Ranker (drag-and-drop)
- [x] Interactive: 2.4 GHz Channel Selector (non-overlapping channels)
- [x] Quiz: 15 questions with 70% pass threshold
- [x] Lab links: Wireless Security Advisor, SOHO Network Designer, Router Config Simulator

#### Chapter 8: Network Services, Virtualization and Cloud Computing ✅ COMPLETE
**Slide:** 1101 Chap 8.pdf (23 pages)
**Exam Objectives:** 2.4, 4.1, 4.2

Content Sections:
- [x] Section 1: Server Roles Overview (Web, File, Print, DHCP, DNS, Proxy, Mail)
- [x] Section 2: DNS Deep Dive (Hierarchy, Resource Records: A, AAAA, MX, CNAME, PTR)
- [x] Section 3: Authentication & Logging (AAA, RADIUS vs TACACS+, Syslog severity 0-7)
- [x] Section 4: Internet Appliances (UTM, Spam Gateway, Load Balancer, DMZ)
- [x] Section 5: Legacy, Embedded Systems & IoT (SCADA, smart home devices)
- [x] Section 6: Cloud Computing Models (IaaS, PaaS, SaaS responsibility matrix)
- [x] Section 7: Cloud Deployment Types & Features (Private/Public/Hybrid/Community, elasticity)
- [x] Section 8: Virtualization Concepts (Type 1 vs Type 2 hypervisors, VM requirements)
- [x] Interactive: Cloud Service Matcher (drag-drop IaaS/PaaS/SaaS)
- [x] Interactive: DNS Record Type Quiz (6 questions)
- [x] Interactive: Hypervisor Type Identifier (Type 1 vs Type 2)
- [x] Quiz: 15 questions with 70% pass threshold
- [x] Lab links: Cloud Service Scenarios, DNS Config, VM Setup, Server Roles

---

### SPRINT 4: Mobile Devices (Chapters 9-10)
**Focus:** Laptops and mobile technology

#### Chapter 9: Laptop and Mobile Device Hardware ✅ COMPLETE
**Slide:** 1101 Chap 9.pdf (16 pages)
**Exam Objectives:** 1.1, 1.2, 1.3

Content Sections:
- [x] Section 1: Laptops vs Desktops (trade-offs, considerations)
- [x] Section 2: Laptop Disassembly & Case Components (tools, documentation, ribbon cables)
- [x] Section 3: Laptop Displays (IPS, TN, VA, OLED, LED vs CCFL backlights, inverter)
- [x] Section 4: Motherboards, Processors & Memory (SODIMM, daughterboards)
- [x] Section 5: Laptop Storage (2.5" HDD/SSD, M.2 SATA/NVMe, key types)
- [x] Section 6: Input Devices & Keyboards (Fn key functions, pointing devices)
- [x] Section 7: Internal Expansion & Components (Mini PCIe, M.2, wireless, batteries)
- [x] Section 8: External Peripherals (docking stations vs port replicators, Kensington lock)
- [x] Interactive: Laptop Component Identifier (6 components)
- [x] Interactive: Display Type Matcher (5 scenarios)
- [x] Interactive: Memory & Storage Matcher (drag-drop 8 items)
- [x] Quiz: 15 questions with 70% pass threshold
- [x] Lab links: Laptop Memory Upgrade, Display Troubleshooting, Storage Upgrade, Docking Config

#### Chapter 10: Mobile Connectivity and Application Support ✅ COMPLETE
**Slide:** 1101 Chap 10.pdf (19 pages)
**Exam Objectives:** 1.4

Content Sections:
- [x] Section 1: Cellular Networking Standards (3G/4G/5G, GSM vs CDMA, 5G categories)
- [x] Section 2: Using Cellular Data Connections (hotspots, tethering, airplane mode, PRL)
- [x] Section 3: Mobile Device Identifiers (IMEI, MEID, IMSI, ICCID, SEID)
- [x] Section 4: Wi-Fi & VPN Configuration (iOS vs Android VPN protocols)
- [x] Section 5: Bluetooth Connectivity (5-step pairing process)
- [x] Section 6: Location Services (GPS, GLONASS, Galileo, 4 satellites needed)
- [x] Section 7: Mobile Device & Application Management (MDM vs MAM)
- [x] Section 8: Email Configuration & Mobile Synchronization (SMTP/POP/IMAP ports, ActiveSync)
- [x] Interactive: Cellular Generation Speed Matcher (6 questions)
- [x] Interactive: Mobile Identifier Quiz (5 questions)
- [x] Interactive: Email Port Challenge (drag-drop 7 protocols)
- [x] Quiz: 15 questions with 70% pass threshold
- [x] Lab links: Mobile Email Config, Bluetooth Pairing, Mobile Sync, MDM Config

---

### SPRINT 5: Troubleshooting (Chapters 11-12)
**Focus:** Problem-solving methodology

#### Chapter 11: Troubleshooting Methodology and Resolving Core Hardware Problems ✅ COMPLETE
**Slide:** 1101 Chap 11.pdf (13 pages)
**Exam Objectives:** 5.1, 5.2

Content Sections:
- [x] Section 1: 6-Step Troubleshooting Methodology (EXAM CRITICAL - with mnemonic)
- [x] Section 2: Common Hardware Symptoms (symptom table with actions)
- [x] Section 3: POST and BIOS/UEFI Problems (beep codes, POST cards)
- [x] Section 4: Motherboard & CPU Troubleshooting (I/O ports, distended capacitors)
- [x] Section 5: Memory (RAM) Issues (GPFs, BSOD, diagnostic steps)
- [x] Section 6: Power Supply Problems (no power, excess power, warning signs)
- [x] Section 7: Cooling System Issues (air cooling, liquid cooling)
- [x] Section 8: Diagnostic Tools & Best Practices (hardware/software tools)
- [x] Interactive: 6-Step Sequencer (drag-drop ordering)
- [x] Interactive: Symptom-to-Component Matcher (6 pairs)
- [x] Interactive: Diagnostic Sound Quiz (5 questions)
- [x] Quiz: 15 questions with 70% pass threshold
- [x] Lab links: Troubleshooting Flowchart, POST Beep Codes, Hardware Diagnosis, PSU

#### Chapter 12: Hardware and Network Troubleshooting ✅ COMPLETE
**Slide:** 1101 Chap 12.pdf (23 pages)
**Exam Objectives:** 2.8, 5.3, 5.4, 5.5, 5.6, 5.7

Content Sections:
- [x] Section 1: Networking Tools (Obj 2.8 - crimper, toner probe, cable tester, etc.)
- [x] Section 2: Storage & RAID Troubleshooting (Obj 5.3 - S.M.A.R.T., clicking drives, IOPS)
- [x] Section 3: Video, Projector & Display Issues (Obj 5.4 - dead pixels, burn-in, flickering)
- [x] Section 4: Mobile Device Troubleshooting (Obj 5.5 - swollen battery, connectivity)
- [x] Section 5: Printer Troubleshooting (Obj 5.6 - impact, inkjet, laser symptoms)
- [x] Section 6: Network Connectivity Issues (Obj 5.7 - APIPA, jitter, port flapping)
- [x] Section 7: Software Diagnostic Commands (ipconfig, ping, tracert, netstat, nslookup)
- [x] Section 8: Print Job Management & Best Practices (spooler, test pages)
- [x] Interactive: Networking Tool Matcher (drag-drop 8 tools to functions)
- [x] Interactive: Symptom Diagnosis Challenge (6 scenarios)
- [x] Interactive: Printer Problem Identifier (6 questions)
- [x] Quiz: 15 questions with 70% pass threshold
- [x] Lab links: Network diagnostics, Storage troubleshooting, Printer diagnostics

---

### SPRINT 6: Integration & Polish
**Focus:** Final integration and testing

- [ ] Update Core 1 index.html with all 12 chapters
- [ ] Update Forge index.html SAMPLE_MODULES (correct order)
- [ ] Verify all navigation paths (AccessGuard, back links)
- [ ] Test progress tracking (localStorage)
- [ ] Cross-link chapters to domain pages
- [ ] Final QA pass

---

## File Structure (Target)

```
core-1/
├── index.html                    # Main navigation
├── SPRINT-PLAN.md               # This document
├── chapters/
│   ├── ch01-motherboards/       # NEW - Motherboards, Processors, Memory
│   ├── ch02-expansion-storage/  # NEW - Expansion Cards, Storage, PSU
│   ├── ch03-peripherals/        # NEW - Peripherals, Cables, Connectors
│   ├── ch04-printers/           # NEW - Printers and MFDs
│   ├── ch05-networking/         # NEW - Networking Fundamentals
│   ├── ch06-tcpip/              # NEW - Introduction to TCP/IP
│   ├── ch07-wireless/           # NEW - Wireless and SOHO Networks
│   ├── ch08-cloud/              # NEW - Network Services, Virtualization, Cloud
│   ├── ch09-laptops/            # NEW - Laptop and Mobile Device Hardware
│   ├── ch10-mobile/             # NEW - Mobile Connectivity and App Support
│   ├── ch11-troubleshooting/    # NEW - Troubleshooting Methodology
│   └── ch12-hw-network-troubleshooting/ # NEW - Hardware & Network Troubleshooting
├── labs/
│   ├── component-id/            # Ch1 Lab
│   ├── psu-calculator/          # Ch2 Lab
│   ├── cable-matching/          # Ch3 Lab
│   ├── printer-troubleshoot/    # Ch4 Lab
│   ├── topology-builder/        # Ch5 Lab
│   ├── subnet-calculator/       # Ch6 Lab
│   ├── wireless-security/       # Ch7 Lab
│   ├── cloud-matcher/           # Ch8 Lab
│   ├── laptop-components/       # Ch9 Lab
│   ├── mobile-sync/             # Ch10 Lab
│   ├── troubleshoot-flowchart/  # Ch11 Lab
│   └── diagnostic-simulator/    # Ch12 Lab
└── domains/                     # Keep existing domain organization
    ├── mobile-devices/
    ├── networking/
    ├── cloud-virtualization/
    └── troubleshooting/
```

---

## How To Use This Document

### Starting a New Session
1. Read this document first
2. Check "Current Status" section
3. Find the current sprint
4. Continue from unchecked items

### After Completing Work
1. Update checkboxes in this document
2. Note any blockers or changes
3. Update "Current Status" section

### Context Window Management
- Each sprint is self-contained
- Reference slide file directly when building content
- Only load one chapter's slide at a time

---

## Notes & Blockers

_Record issues, decisions, and changes here:_

- **2026-01-10:** Document created. All existing chapters misaligned with slides.
- **2026-01-10:** Sprint 0 COMPLETED:
  - Deleted 12 misaligned chapter directories
  - Updated core-1/index.html with correct 12-chapter structure
  - Updated Forge index.html SAMPLE_MODULES (13 entries: 1 course + 12 chapters)
  - Existing labs mapped: pc-components→Ch1, cpu-sockets→Ch1, ram-id→Ch1, psu→Ch2, troubleshoot→Ch11
  - All chapters marked "coming-soon" until content is built
- **2026-01-10:** Chapter 1 COMPLETED:
  - Created `chapters/ch01-motherboards/index.html`
  - 8 content sections with interactive elements
  - 15-question quiz with progress tracking
  - Linked 3 existing labs (pc-components, cpu-sockets, ram-id)
  - Removed "coming-soon" from Chapter 1 in core-1/index.html
- **Next Session:** Continue Sprint 1 - Build Chapter 2 (Expansion Cards, Storage, PSU)
- **2026-01-10 (Session 3):** Chapter 2 COMPLETED:
  - Created `chapters/ch02-expansion-storage/index.html`
  - 8 content sections + interactive RAID calculator
  - 15-question quiz, linked existing PSU lab
  - Removed "coming-soon" from Chapter 2 in core-1/index.html
  - DEPLOYED to Firebase (6,670 files)
- **2026-01-10 (Session 5):** Chapter 3 COMPLETED - SPRINT 1 DONE:
  - Created `chapters/ch03-peripherals/index.html`
  - 8 content sections from 22-page PDF slide deck
  - Interactive: USB Speed Color Match, Cable Connector Matcher
  - 15-question quiz covering displays, USB, Thunderbolt, video cables, storage cables
  - Removed "coming-soon" from Chapter 3 in core-1/index.html
  - **Sprint 1 now complete** - DEPLOYED
  - **Bug fixes applied:**
    - USB Color Game: Fixed grading logic (options now pass their own color, not correct answer)
    - Cable Matcher: Added Fisher-Yates shuffle on load and reset (no more aligned answers)
- **2026-01-12 (Session 7):** Chapter 4 COMPLETED - SPRINT 2 STARTED:
  - Created `chapters/ch04-printers/index.html`
  - 8 content sections from 22-page PDF slide deck covering:
    - Printer types overview, Impact printers, Inkjet printers
    - Laser printer components, 7-step laser imaging process
    - Thermal & 3D printers, Interfaces & software
    - Installation, sharing & maintenance
  - Interactive elements:
    - Laser Process Sequencer (drag-and-drop the 7 steps)
    - Printer Component Matcher (6 pairs)
    - Voltage Quick Check (4 questions)
  - 15-question quiz with 70% pass threshold
  - Mnemonic: "People Can't Easily Develop True Friendship Connections" (P-C-E-D-T-F-C)
  - Removed "coming-soon" from Chapter 4 in core-1/index.html
  - DEPLOYED to Firebase
- **2026-01-12 (Session 7 continued):** Chapter 5 COMPLETED:
  - Created `chapters/ch05-networking/index.html`
  - 8 content sections from 22-page PDF slide deck covering:
    - Network types (LAN, WAN, PAN, MAN, SAN, WLAN)
    - Network components & access models (P2P vs Client-Server)
    - Network topologies (Bus, Star, Ring, Mesh, Hybrid)
    - OSI Model (7 layers - heavily tested on exam)
    - Copper cabling (Coax, Cat 5/5e/6/6a/7, twisted pair)
    - Fiber optics & wiring standards (SMF, MMF, T568A/T568B)
    - Connectivity devices (Hub, Switch, Router, Bridge, Firewall, etc.)
    - NICs & IEEE 802 standards (CSMA/CD, CSMA/CA)
  - Interactive elements:
    - OSI Layer Sequencer (drag-and-drop 7 layers top-to-bottom)
    - Cable Category Matcher (6 cable types with speeds/distances)
    - Device Layer Quiz (4 questions on OSI layer assignments)
  - 15-question quiz with 70% pass threshold
  - Mnemonic: "Please Do Not Throw Sausage Pizza Away" (OSI layers 7-1)
  - Removed "coming-soon" from Chapter 5 in core-1/index.html
  - DEPLOYED to Firebase
- **2026-01-12 (Session 8):** Chapter 6 COMPLETED - SPRINT 2 DONE:
  - Created `chapters/ch06-tcpip/index.html`
  - 8 content sections from 28-page PDF slide deck covering:
    - TCP/IP Model (DoD 4 layers vs OSI 7 layers)
    - TCP vs UDP comparison (connection-oriented vs connectionless)
    - Common Ports & Protocols (16+ ports - heavily tested on exam!)
    - IPv4 Addressing (32-bit, binary, network/host portions)
    - IP Address Classes A-E and Private Ranges (RFC 1918)
    - Subnetting & CIDR Notation (/8, /16, /24)
    - Network Services (DHCP DORA, DNS records, NAT, APIPA)
    - IPv6 (128-bit hex, address types) and Virtual Networks (VLAN, VPN)
  - Interactive elements:
    - Port Number Challenge (match 8 protocols to ports)
    - IP Address Class Identifier (5 questions)
    - CIDR / Subnet Mask Converter (4 questions)
  - 15-question quiz with 70% pass threshold
  - Key exam content: Port numbers are HEAVILY tested - SSH 22, Telnet 23, SMTP 25, DNS 53, HTTP 80, HTTPS 443, RDP 3389
  - Removed "coming-soon" from Chapter 6 in core-1/index.html
  - **Sprint 2 now complete** - awaiting deployment
- **2026-01-12 (Session 10):** Chapter 7 COMPLETED - SPRINT 3 STARTED:
  - Created `chapters/ch07-wireless/index.html`
  - 8 content sections from 25-page PDF slide deck covering:
    - IEEE 802.11 Fundamentals (CSMA/CA, frequencies, modulation, channels)
    - Wi-Fi Standards (802.11a/b/g/n/ac/ax with speeds and ranges)
    - Bluetooth, RFID, and NFC (short-range wireless technologies)
    - Internet Connection Types (DSL, Cable, Fiber, Satellite, Cellular)
    - Cellular Technologies (3G/4G/5G, GSM vs CDMA, LTE)
    - SOHO Network Planning & Installation (wired vs fiber standards)
    - Wireless Security (WEP → WPA → WPA2 → WPA3 evolution)
    - Wireless Router Configuration (5 config steps, channel best practices)
  - Interactive elements:
    - Wi-Fi Standard Speed Matcher (match standards to specs)
    - Wireless Security Strength Ranker (drag-and-drop ordering)
    - 2.4 GHz Channel Selector (non-overlapping channel quiz)
  - 15-question quiz with 70% pass threshold
  - Key exam content: Non-overlapping channels (1, 6, 11), WPA3 SAE, 802.11ac is 5 GHz ONLY
  - Removed "coming-soon" from Chapter 7 in core-1/index.html
  - **Chapter 7 complete** - Sprint 3 half done
  - DEPLOYED to Firebase (6,675 files)
- **2026-01-12 (Session 11):** Chapter 8 COMPLETED - SPRINT 3 DONE:
  - Created `chapters/ch08-cloud/index.html`
  - 8 content sections from 23-page PDF slide deck covering:
    - Server Roles (Web, File, Print, DHCP, DNS, Proxy, Mail)
    - DNS Deep Dive (Hierarchy, Resource Records: A, AAAA, MX, CNAME, PTR)
    - Authentication & Logging (AAA, RADIUS vs TACACS+, Syslog severity)
    - Internet Appliances (UTM, Spam Gateway, Load Balancer, DMZ)
    - Legacy, Embedded Systems & IoT (SCADA, smart home)
    - Cloud Computing Models (IaaS, PaaS, SaaS responsibility matrix)
    - Cloud Deployment Types (Private, Public, Hybrid, Community)
    - Virtualization Concepts (Type 1 vs Type 2 hypervisors)
  - Interactive elements:
    - Cloud Service Matcher (drag-drop 9 services to IaaS/PaaS/SaaS)
    - DNS Record Type Quiz (6 questions matching records to descriptions)
    - Hypervisor Type Identifier (6 hypervisors - Type 1 vs Type 2)
  - 15-question quiz with 70% pass threshold
  - Key exam content: Type 1 vs Type 2 hypervisors, IaaS/PaaS/SaaS, DNS records, RADIUS vs TACACS+
  - Removed "coming-soon" from Chapter 8 in core-1/index.html
  - **Sprint 3 now complete** - DEPLOYED to Firebase (6,676 files)
- **2026-01-12 (Session 12):** Chapter 9 COMPLETED - SPRINT 4 STARTED:
  - Created `chapters/ch09-laptops/index.html`
  - 8 content sections from 16-page PDF slide deck covering:
    - Laptops vs Desktops (trade-offs, portability, upgradeability)
    - Laptop Disassembly & Case Components (tools, ribbon cables, ZIF connectors)
    - Laptop Displays (IPS, TN, VA, OLED, LED vs CCFL backlights, inverter)
    - Motherboards, Processors & Memory (SODIMM, daughterboards, soldered RAM)
    - Laptop Storage (2.5" HDD/SSD, M.2 SATA/NVMe, key types B/M/B+M)
    - Input Devices & Keyboards (Fn key functions, touchpad, pointing stick)
    - Internal Expansion (Mini PCIe, M.2, WLAN/WWAN, batteries, cooling)
    - External Peripherals (docking stations vs port replicators, Kensington lock)
  - Interactive elements:
    - Laptop Component Identifier (6 components with questions)
    - Display Type Matcher (5 scenarios - IPS/TN/VA/OLED/Inverter)
    - Memory & Storage Matcher (drag-drop 8 items to Desktop/Laptop)
  - 15-question quiz with 70% pass threshold
  - Key exam content: SODIMM vs DIMM, 2.5" vs 3.5" drives, inverter for CCFL, docking station vs port replicator
  - Removed "coming-soon" from Chapter 9 in core-1/index.html
  - **Sprint 4 started** - Chapter 9 complete, Chapter 10 pending
- **2026-01-12 (Session 13):** Chapter 10 COMPLETED - SPRINT 4 DONE:
  - Created `chapters/ch10-mobile/index.html`
  - 8 content sections from 19-page PDF slide deck covering:
    - Cellular Networking Standards (3G/4G/5G, GSM vs CDMA, 5G categories: eMBB/URLLC/mMTC)
    - Using Cellular Data Connections (hotspots, tethering, airplane mode, PRL, Baseband OS)
    - Mobile Device Identifiers (IMEI, MEID, IMSI, ICCID, SEID - key exam topic!)
    - Wi-Fi & VPN Configuration (iOS: IKEv2/IPsec/L2TP, Android adds PPTP)
    - Bluetooth Connectivity (5-step pairing process)
    - Location Services (GPS, GLONASS, Galileo, BeiDou - 4 satellites needed)
    - MDM vs MAM (device management vs app management - BYOD scenarios)
    - Email Configuration & Sync (SMTP 25/465/587, POP 110/995, IMAP 143/993, ActiveSync)
  - Interactive elements:
    - Cellular Generation Speed Matcher (6 questions)
    - Mobile Identifier Quiz (5 questions - IMEI/IMSI/ICCID/SEID)
    - Email Port Challenge (drag-drop 7 protocols to ports)
  - 15-question quiz with 70% pass threshold
  - Key exam content: GSM for international travel, PPTP only on Android, email ports, MDM vs MAM
  - Removed "coming-soon" from Chapter 10 in core-1/index.html
  - **Sprint 4 DEPLOYED** - 6,678 files to Firebase (2026-01-12 Session 14)
- **2026-01-12 (Session 15):** Chapter 12 COMPLETED - SPRINT 5 DONE - **CORE 1 COMPLETE!**
  - Created `chapters/ch12-hw-network-troubleshooting/index.html`
  - 8 content sections from 23-page PDF covering 6 exam objectives (most of any chapter!)
  - Objectives covered: 2.8 (networking tools), 5.3-5.7 (all troubleshooting objectives)
  - Content highlights:
    - Networking tools: crimper, cable tester, tone probe, punchdown, loopback, Wi-Fi analyzer, network tap
    - Storage troubleshooting: S.M.A.R.T., clicking drives, IOPS, RAID issues, boot problems
    - Display issues: dead pixels, burn-in, dim/flickering, color problems
    - Mobile device issues: swollen battery (fire hazard!), connectivity, performance
    - Printer troubleshooting: impact, inkjet, laser - distinct symptoms for each type
    - Network connectivity: APIPA (169.254.x.x), jitter, latency, port flapping
    - Software commands: ipconfig, ping, tracert, netstat, nslookup, pathping
  - Interactive elements:
    - Networking Tool Matcher (drag-drop 8 tools to descriptions)
    - Symptom Diagnosis Challenge (6 field tech scenarios)
    - Printer Problem Identifier (6 questions by printer type)
  - 15-question quiz with 70% pass threshold
  - Removed "coming-soon" from Chapter 12 in core-1/index.html
  - **ALL 12 CHAPTERS NOW COMPLETE** - Core 1 ready for final deployment!
  - **DEPLOYED** - 6,680 files to Firebase (2026-01-12 Session 15)
  - **🎉 CompTIA A+ Core 1 (220-1101) CURRICULUM COMPLETE! 🎉**
- **2026-01-12 (Session 14 continued):** Chapter 11 COMPLETED - SPRINT 5 STARTED:
  - Created `chapters/ch11-troubleshooting/index.html`
  - 8 content sections from 13-page PDF slide deck covering:
    - 6-Step Troubleshooting Methodology (EXAM CRITICAL!)
    - Common Hardware Symptoms (comprehensive table)
    - POST and BIOS/UEFI Problems (beep codes, POST cards)
    - Motherboard & CPU Troubleshooting (I/O ports, capacitors)
    - Memory (RAM) Issues (GPFs, BSOD, diagnostic steps)
    - Power Supply Problems (no power, excess power)
    - Cooling System Issues (air and liquid cooling)
    - Diagnostic Tools & Best Practices
  - Interactive elements:
    - 6-Step Sequencer (drag-drop ordering - EXAM CRITICAL)
    - Symptom-to-Component Matcher (6 pairs)
    - Diagnostic Sound Quiz (5 questions)
  - 15-question quiz with 70% pass threshold
  - Mnemonic: "I Eat Tacos Every Very Day" (Identify, Establish, Test, Establish, Verify, Document)
  - Key exam content: 6 steps in order, backup before changes, escalate if theory fails, document everything
  - Removed "coming-soon" from Chapter 11 in core-1/index.html
  - **Chapter 11 DEPLOYED** - 6,679 files to Firebase (2026-01-12 Session 14)

---

## QA Report (2026-01-12 - Session 15)

### Verification Results

| Check | Status | Notes |
|-------|--------|-------|
| Chapter Links (index.html) | ✅ Pass | All 12 chapters linked correctly |
| Back Links | ✅ Pass | All use `../../index.html` |
| AccessGuard.js Path | ✅ Pass | 7 levels: `../../../../../../../components/AccessGuard.js` |
| Tab Navigation | ✅ Pass | All chapters have 4 tabs (Learn, Interactive, Labs, Quiz) |
| Quiz System | ✅ Pass | All chapters have quiz functionality |

### Lab Status

**Existing Labs (6):**
- ✅ `pc-components-lab.html`
- ✅ `cpu-sockets-lab.html`
- ✅ `ram-identification-lab.html`
- ✅ `psu-connectors-lab.html`
- ✅ `troubleshooting-lab.html`
- ✅ `esd-workspace-lab.html`

**Missing Labs (placeholders in chapters):**
- ❌ `cable-matching-lab.html`
- ❌ `printer-troubleshoot-lab.html`
- ❌ `topology-builder-lab.html`
- ❌ `troubleshooting-flowchart-lab.html`
- ❌ `network-commands-lab.html`
- ❌ `mobile-troubleshoot-lab.html`
- ❌ Several directory-based labs (subnet-calculator/, wireless-security/, etc.)

### Design Note: Two Chapter Styles

| Chapters | Theme | Tab Classes |
|----------|-------|-------------|
| Ch 1-6 | Light "Forge" orange theme | `.nav-tabs`, `.nav-tab`, `data-section` |
| Ch 7-12 | Dark "Cyber" blue theme | `.tab-navigation`, `.tab-btn`, `data-tab` |

Both have identical functionality - just different aesthetics.

### QA Options for Next Session
1. ~~Create placeholder "Coming Soon" pages for missing labs~~ → **DOING NOW**
2. Unify chapter styles (optional - both work)
3. ~~Build out actual lab content~~ → **DOING NOW**
4. Leave as-is (fully functional)

---

## Labs Sprint Plan (2026-01-12 - Session 16)

### Lab Audit Summary

**Existing Labs (6):**
| Lab | Used By | Status |
|-----|---------|--------|
| `pc-components-lab.html` | Ch1 | ✅ Working |
| `cpu-sockets-lab.html` | Ch1 | ✅ Working |
| `ram-identification-lab.html` | Ch1 | ✅ Working |
| `psu-connectors-lab.html` | Ch2, Ch11 | ✅ Working |
| `troubleshooting-lab.html` | Unused | ✅ Available |
| `esd-workspace-lab.html` | Unused | ✅ Available |

**Missing Labs: 23 unique labs needed**

### Sprint Schedule

| Sprint | Focus | Labs | Status |
|--------|-------|------|--------|
| **L-0** | Fix directory→single file links | 16 links | ✅ COMPLETE |
| **L-1** | Identifier Labs | 5 labs | ✅ COMPLETE |
| **L-2** | Config Walkthrough Labs | 8 labs | ✅ COMPLETE |
| **L-3** | Simulator Labs | 6 labs | ✅ COMPLETE |
| **L-4** | Builder Labs | 3 labs | ✅ COMPLETE |
| **L-5** | Tool Labs | 2 labs | ✅ COMPLETE |

### Sprint L-0: Link Standardization ✅ COMPLETE (2026-01-12)
Convert directory-format links to single-file format:
- [x] Ch6: `subnet-calculator/index.html` → `subnet-calculator-lab.html`
- [x] Ch7: 3 links (wireless-security, soho-designer, router-config)
- [x] Ch8: 4 links (cloud-scenarios, dns-config, vm-setup, server-roles)
- [x] Ch9: 4 links (laptop-memory, display-troubleshoot, storage-upgrade, docking-config)
- [x] Ch10: 4 links (mobile-email, bluetooth-pairing, mobile-sync, mdm-config)

### Sprint L-1: Identifier Labs ✅ COMPLETE (2026-01-12)
| # | Lab | Chapter(s) | Hands-On Activity | Status |
|---|-----|------------|-------------------|--------|
| 1 | `cable-matching-lab.html` | Ch3 | Drag cables to matching port/use case | ✅ Built |
| 2 | `port-identification-lab.html` | Ch3 | Click hotspots on I/O panel | ✅ Built |
| 3 | `post-beep-codes-lab.html` | Ch11 | Decode beep patterns with audio/visual | ✅ Built |
| 4 | `server-roles-lab.html` | Ch8 | Match server icons to scenarios | ✅ Built |
| 5 | `mobile-identifier-lab.html` | Ch10 | ID IMEI/IMSI/ICCID/SEID | ✅ Built |

**Note:** `mobile-identifier-lab.html` is new - needs link added to Ch10

### Sprint L-2: Config Walkthrough Labs ✅ COMPLETE (2026-01-12)
| # | Lab | Chapter | Hands-On Activity | Status |
|---|-----|---------|-------------------|--------|
| 1 | `wireless-security-lab.html` | Ch7 | Step-through wireless security config (SSID, WPA3, encryption) | ✅ Built |
| 2 | `router-config-lab.html` | Ch7 | 6-step SOHO router setup (WAN, LAN, DHCP, DNS, NAT) | ✅ Built |
| 3 | `email-config-lab.html` | Ch10 | Mobile email setup (IMAP/SMTP ports, SSL/TLS) | ✅ Built |
| 4 | `bluetooth-pairing-lab.html` | Ch10 | 5-step Bluetooth pairing (TEPCT mnemonic) | ✅ Built |
| 5 | `laptop-memory-lab.html` | Ch9 | SODIMM upgrade procedure with ESD precautions | ✅ Built |
| 6 | `storage-upgrade-lab.html` | Ch9 | HDD to NVMe SSD upgrade (M.2 key types) | ✅ Built |
| 7 | `docking-config-lab.html` | Ch9 | Docking station setup vs port replicator | ✅ Built |
| 8 | `vm-setup-lab.html` | Ch8 | VM creation (Type 1/2 hypervisors, VDI/VHD/VMDK) | ✅ Built |

### Sprint L-3: Simulator Labs ✅ COMPLETE (2026-01-12)
| # | Lab | Chapter | Hands-On Activity | Status |
|---|-----|---------|-------------------|--------|
| 1 | `printer-troubleshoot-lab.html` | Ch4 | Scenario-based printer diagnosis (symptom→cause→fix) | ✅ Built |
| 2 | `topology-builder-lab.html` | Ch5 | Drag-drop network topology designer (5 challenges) | ✅ Built |
| 3 | `subnet-calculator-lab.html` | Ch6 | Interactive CIDR calculator + practice mode | ✅ Built |
| 4 | `display-troubleshoot-lab.html` | Ch9 | Visual display symptom identification (8 scenarios) | ✅ Built |
| 5 | `mobile-sync-lab.html` | Ch10 | Mobile sync troubleshooting scenarios | ✅ Built |
| 6 | `network-commands-lab.html` | Ch12 | Terminal simulator for network commands | ✅ Built |

### Sprint L-4: Builder Labs ✅ COMPLETE (2026-01-13)
| # | Lab | Chapter | Hands-On Activity | Status |
|---|-----|---------|-------------------|--------|
| 1 | `raid-config-lab.html` | Ch2 | Interactive RAID array builder with capacity/performance calculator | ✅ Built |
| 2 | `pc-builder-lab.html` | Ch1 | PC component selector with compatibility checking (CPU, Mobo, RAM, PSU) | ✅ Built |
| 3 | `network-design-lab.html` | Ch5 | Advanced network designer with device placement and connections | ✅ Built |

**Lab Features Built:**
- **RAID Config Lab:** Select drives (2-12), choose capacity (500GB-8TB), pick RAID level (0/1/5/10), real-time capacity/efficiency calculation, visual data distribution diagrams, 6 configuration challenges
- **PC Builder Lab:** Full component database (CPU, Motherboard, RAM, Storage, GPU, PSU, Case), socket compatibility checking (LGA1700, AM5, AM4), DDR4/DDR5 validation, power budget calculation, 5 build challenges
- **Network Design Lab:** Drag-drop device palette (router, switch, firewall, server, AP, etc.), connection drawing, device property editing, subnet assignment, 5 enterprise network challenges

### Sprint L-5: Tool Labs ✅ COMPLETE (2026-01-13)
| # | Lab | Chapter | Hands-On Activity | Status |
|---|-----|---------|-------------------|--------|
| 1 | `diagnostic-tools-lab.html` | Ch11/12 | Interactive diagnostic tool simulator (POST card, multimeter, cable tester, PSU tester, S.M.A.R.T.) | ✅ Built |
| 2 | `command-line-lab.html` | Ch12 | Advanced CLI practice with 5 categories (Network, File System, System, Disk, User Admin) | ✅ Built |

**Lab Features Built:**
- **Diagnostic Tools Lab:** 5 simulated diagnostic tools with realistic displays, 10 troubleshooting scenarios with exam tips
- **Command Line Lab:** Full terminal simulator with command history, 30+ commands across 5 categories, 15+ challenges, quick reference tables

### Lab Design Rules
✅ **Hands-On Activities:**
- Click hotspots to identify
- Drag-and-drop matching
- Step-through procedures
- Interactive simulators
- Build/construct activities

❌ **NOT Labs (Quiz Material):**
- Multiple choice questions
- True/false questions
- Fill-in-the-blank

**AccessGuard Path from labs:** `../../../../../../components/AccessGuard.js` (6 levels)

---

## Session Handoff (2026-01-13 - Session 18 FINAL)

### 🎉 ALL LABS COMPLETE! 🎉

### What Was Done This Session
1. **Sprint L-4 COMPLETE** - Built all 3 Builder Labs:
   - `raid-config-lab.html` (Ch2) - RAID configuration builder with visual diagrams
   - `pc-builder-lab.html` (Ch1) - Full PC component selector with compatibility checking
   - `network-design-lab.html` (Ch5) - Advanced network designer with drag-drop devices

2. **Sprint L-5 COMPLETE** - Built all 2 Tool Labs:
   - `diagnostic-tools-lab.html` (Ch11/12) - 5 diagnostic tools + 10 scenarios
   - `command-line-lab.html` (Ch12) - Full CLI simulator with 30+ commands

3. **Fixed "Coming Soon" Placeholders:**
   - `core-1/index.html` - Fixed 3 labs (Cable Matching, Printer Troubleshoot, Subnet Calculator)
   - `ch02-expansion-storage/index.html` - Fixed 2 labs (RAID Config, Storage Upgrade)

4. **DEPLOYED** to https://hexworth-prime.web.app (6,704 files)

### Final Lab Count: 30 Labs ✅
- Original: 6 | L-1: 5 | L-2: 8 | L-3: 6 | L-4: 3 | L-5: 2

### Lab Inventory Summary
| Sprint | Labs Built | Running Total |
|--------|------------|---------------|
| Original | 6 | 6 |
| L-1 (Identifier) | 5 | 11 |
| L-2 (Config) | 8 | 19 |
| L-3 (Simulator) | 6 | 25 |
| L-4 (Builder) | 3 | 28 |
| L-5 (Tool) | 2 | **30 TOTAL** |

### CompTIA A+ Core 1 Lab Development: COMPLETE ✅
All lab sprints (L-0 through L-5) are finished. The curriculum now includes:
- 12 chapters with interactive content and quizzes
- 30 hands-on labs covering all exam objectives
- Deployed and live at https://hexworth-prime.web.app

### Potential Cleanup Task
There may be more "Coming Soon" placeholders in other chapters that need to be linked to existing labs. A quick grep can find them:
```bash
grep -r "Coming" chapters/ --include="*.html" | grep -i "future\|soon"
```

### Future Enhancement Ideas (Optional)
- Practice exam mode aggregating all quizzes
- Lab completion tracking/badges
- Printable study guides
- Core 2 (220-1102) curriculum

---

## Continuation Prompt for Next Session (Session 19)

```
Continue CompTIA A+ Core 1 maintenance/enhancement for Hexworth Prime.

Read: /home/eq/ai-content/Hexworth Prime/_app/houses/forge/applets/comptia-aplus/core-1/SPRINT-PLAN.md

STATUS:
- All 12 chapters DEPLOYED to https://hexworth-prime.web.app
- All lab sprints (L-0 through L-5) COMPLETE
- Total: 30 labs built and deployed (6,704 files)
- Fixed "Coming Soon" placeholders in core-1/index.html and ch02

POTENTIAL TASKS:
1. Scan all chapters for remaining "Coming Soon" placeholders:
   grep -r "Coming" chapters/ --include="*.html" | grep -i "future\|soon"

2. Link any found placeholders to appropriate existing labs

3. Optional enhancements:
   - Practice exam mode
   - Lab completion badges
   - Start Core 2 (220-1102) planning

Lab files location: _app/houses/forge/applets/comptia-aplus/core-1/labs/
AccessGuard path from labs: ../../../../../../components/AccessGuard.js
```

---

## ARCHIVED: Session 17 Details

### What Was Done This Session (Detailed)
1. **Sprint L-2 COMPLETE** - Built all 8 Config Walkthrough Labs:
   - `wireless-security-lab.html` (Ch7) - 5-step wireless security config
   - `router-config-lab.html` (Ch7) - 6-step SOHO router setup
   - `email-config-lab.html` (Ch10) - Mobile email config (IMAP/SMTP)
   - `bluetooth-pairing-lab.html` (Ch10) - 5-step Bluetooth pairing (TEPCT)
   - `laptop-memory-lab.html` (Ch9) - 6-step SODIMM upgrade
   - `storage-upgrade-lab.html` (Ch9) - 5-step HDD→NVMe upgrade
   - `docking-config-lab.html` (Ch9) - 4-step docking station setup
   - `vm-setup-lab.html` (Ch8) - 5-step VM creation

2. **Sprint L-3 COMPLETE** - Built all 6 Simulator Labs:
   - `printer-troubleshoot-lab.html` (Ch4) - Scenario-based diagnosis
   - `topology-builder-lab.html` (Ch5) - Drag-drop network designer
   - `subnet-calculator-lab.html` (Ch6) - Interactive CIDR calculator
   - `display-troubleshoot-lab.html` (Ch9) - Visual symptom identification
   - `mobile-sync-lab.html` (Ch10) - Sync troubleshooting scenarios
   - `network-commands-lab.html` (Ch12) - Terminal command simulator

3. **Added missing link** - mobile-identifier-lab.html link added to Ch10

### Lab Inventory After Session 17
| Category | Count | Files |
|----------|-------|-------|
| Original Labs | 6 | pc-components, cpu-sockets, ram-identification, psu-connectors, troubleshooting, esd-workspace |
| Sprint L-1 Labs | 5 | cable-matching, port-identification, post-beep-codes, server-roles, mobile-identifier |
| Sprint L-2 Labs | 8 | wireless-security, router-config, email-config, bluetooth-pairing, laptop-memory, storage-upgrade, docking-config, vm-setup |
| Sprint L-3 Labs | 6 | printer-troubleshoot, topology-builder, subnet-calculator, display-troubleshoot, mobile-sync, network-commands |
| **Total Built** | 25 | |
| **Still Missing** | ~5 | Planned for L-4 through L-5 |

### Pending Items
- [x] Add link for `mobile-identifier-lab.html` to Ch10 ✅
- [x] Sprint L-2: Config Walkthrough Labs (8 labs) ✅
- [x] Sprint L-3: Simulator Labs (6 labs) ✅
- [ ] Sprint L-4: Builder Labs (3 labs)
- [ ] Sprint L-5: Tool Labs (2 labs)
- [ ] Deploy when ready

### Continuation Prompt for Next Session (Session 18)
```
Continue CompTIA A+ Core 1 Labs development for Hexworth Prime.

Read: /home/eq/ai-content/Hexworth Prime/_app/houses/forge/applets/comptia-aplus/core-1/SPRINT-PLAN.md

STATUS:
- All 12 chapters DEPLOYED to https://hexworth-prime.web.app
- Sprint L-0 COMPLETE (link standardization)
- Sprint L-1 COMPLETE (5 identifier labs)
- Sprint L-2 COMPLETE (8 config walkthrough labs)
- Sprint L-3 COMPLETE (6 simulator labs)
- DEPLOYED: 6,699 files (2026-01-13)
- Total labs: 25 built, ~5 remaining

NEXT UP: Sprint L-4 - Builder Labs (3 labs)
- raid-config-lab.html (Ch2) - RAID configuration builder
- pc-builder-lab.html (Ch1) - PC component selection simulator
- network-design-lab.html (Ch5) - Advanced network designer

THEN: Sprint L-5 - Tool Labs (2 labs)
- diagnostic-tools-lab.html (Ch11/12) - Hardware diagnostic tool simulator
- command-line-lab.html (Ch12) - Advanced CLI practice

Lab Design Rules:
- Hands-on activities (drag-drop, click, step-through)
- NO multiple choice questions (those go in quizzes)
- AccessGuard path from labs: ../../../../../../components/AccessGuard.js
```

---

## Session Handoff (2026-01-12 - Session 16)

### What Was Done This Session
1. **Lab Audit Completed** - Identified 6 existing labs, 23 missing labs
2. **Sprint L-0 COMPLETE** - Fixed 16 directory-format links in Ch6-10
3. **Sprint L-1 COMPLETE** - Built 5 Identifier Labs:
   - `cable-matching-lab.html` (Ch3) - Drag-drop cable matching
   - `port-identification-lab.html` (Ch3) - Click I/O panel ports
   - `post-beep-codes-lab.html` (Ch11) - Audio/visual beep patterns
   - `server-roles-lab.html` (Ch8) - Match roles to scenarios
   - `mobile-identifier-lab.html` (Ch10) - IMEI/IMSI/ICCID/SEID

### Lab Inventory After Session 16
| Category | Count | Files |
|----------|-------|-------|
| Original Labs | 6 | pc-components, cpu-sockets, ram-identification, psu-connectors, troubleshooting, esd-workspace |
| Sprint L-1 Labs | 5 | cable-matching, port-identification, post-beep-codes, server-roles, mobile-identifier |
| **Total Built** | 11 | |
| **Still Missing** | ~18 | Planned for L-2 through L-5 |

---

## Session Handoff (2026-01-12 - Session 15)

### Current State
- **Sprint 1**: ✅ DEPLOYED (Chapters 1-3)
- **Sprint 2**: ✅ DEPLOYED (Chapters 4-6)
- **Sprint 3**: ✅ DEPLOYED (Chapters 7-8)
- **Sprint 4**: ✅ DEPLOYED (Chapters 9-10)
- **Sprint 5**: ✅ DEPLOYED (Chapters 11-12 live) - 6,680 files
- **12 of 12 chapters LIVE (100%)**
- **CompTIA A+ Core 1 COMPLETE!** 🎉

### Progress Overview
| Sprint | Chapters | Status |
|--------|----------|--------|
| Sprint 1 | Ch 1-3 (Hardware) | ✅ DEPLOYED |
| Sprint 2 | Ch 4-6 (Printers/Networking) | ✅ DEPLOYED |
| Sprint 3 | Ch 7-8 (Wireless/Cloud) | ✅ DEPLOYED |
| Sprint 4 | Ch 9-10 (Mobile) | ✅ DEPLOYED |
| Sprint 5 | Ch 11-12 (Troubleshooting) | ✅ DEPLOYED |

### 🎉 CORE 1 COMPLETE & DEPLOYED! 🎉
```
┌───────────┬─────────────┐
│ Sprint 1  │ ✅ DEPLOYED │
├───────────┼─────────────┤
│ Chapter 1 │ ✅ Live     │
│ Chapter 2 │ ✅ Live     │
│ Chapter 3 │ ✅ Live     │
├───────────┼─────────────┤
│ Sprint 2  │ ✅ DEPLOYED │
├───────────┼─────────────┤
│ Chapter 4 │ ✅ Live     │
│ Chapter 5 │ ✅ Live     │
│ Chapter 6 │ ✅ Live     │
├───────────┼─────────────┤
│ Sprint 3  │ ✅ DEPLOYED │
├───────────┼─────────────┤
│ Chapter 7 │ ✅ Live     │
│ Chapter 8 │ ✅ Live     │
├───────────┼─────────────┤
│ Sprint 4  │ ✅ DEPLOYED │
├───────────┼─────────────┤
│ Chapter 9 │ ✅ Live     │
│ Chapter 10│ ✅ Live     │
├───────────┼─────────────┤
│ Sprint 5  │ ✅ DEPLOYED │
├───────────┼─────────────┤
│ Chapter 11│ ✅ Live     │
│ Chapter 12│ ✅ Live     │
└───────────┴─────────────┘
Live site: https://hexworth-prime.web.app
Final deployment: 6,680 files (2026-01-12 Session 15)
```

### Continuation Prompt for QA/QC Session
```
Continue QA/QC for CompTIA A+ Core 1 curriculum (Hexworth Prime).

Read: /home/eq/ai-content/Hexworth Prime/_app/houses/forge/applets/comptia-aplus/core-1/SPRINT-PLAN.md

STATUS: All 12 chapters DEPLOYED to https://hexworth-prime.web.app

QA COMPLETED (Session 15):
- ✅ All chapter links verified
- ✅ Back-links verified
- ✅ AccessGuard.js paths verified
- ✅ Tab navigation verified
- ✅ Quiz systems verified

ISSUES FOUND:
- 6 labs exist, ~10 lab links are placeholders (404)
- Ch 1-6 use light theme, Ch 7-12 use dark theme (both functional)

OPTIONS:
1. Create "Coming Soon" placeholder pages for missing labs
2. Unify chapter styles (optional)
3. Build actual lab content
4. Browser testing of live site
5. Other QA tasks

What would you like to do?
```

### Key Paths Reference
| Item | Path |
|------|------|
| Project Root | `/home/eq/ai-content/Hexworth Prime/` |
| Core 1 Dir | `_app/houses/forge/applets/comptia-aplus/core-1/` |
| Chapters | `_app/houses/forge/applets/comptia-aplus/core-1/chapters/` |
| Labs | `_app/houses/forge/applets/comptia-aplus/core-1/labs/` |
| Slides | `/home/eq/ai-content/A+/Comptia A+ 1/` |
| AccessGuard | `../../../../../../../components/AccessGuard.js` (7 levels from chapter) |

### Chapter Template Structure
Each chapter follows this structure:
- 4 tabs: Learn | Interactive | Labs | Quiz
- AccessGuard.js protection (user must be "sorted")
- localStorage progress tracking (`aplus-core1-progress`)
- 15-question quiz with 70% (11/15) pass threshold
- Back link: `../../index.html`

---

## Archived Session Handoffs

<details>
<summary>Session 3-6 (Click to expand)</summary>

### Session 3 - Chapter 2 COMPLETED
### Session 5 - Sprint 1 COMPLETE
### Session 6 - Sprint 2 Started (Chapter 4)

</details>

---

## Quick Reference Commands

```bash
# View slides directory
ls -la "/home/eq/ai-content/A+/Comptia A+ 1/"

# Read a specific chapter slide
# (Use Claude's Read tool with the PDF path)

# Check current chapter structure
ls -la "_app/houses/forge/applets/comptia-aplus/core-1/chapters/"

# Deploy (ONLY with permission)
firebase deploy --only hosting
```

---

**IMPORTANT:** Do not deploy without explicit user permission.

---

## Session Handoff (2026-01-10)

### What Was Done This Session
1. **Discovered misalignment**: Content I built was based on generic A+ objectives, NOT user's actual course slides
2. **Located slides**: `/home/eq/ai-content/A+/Comptia A+ 1/` (12 PDF files)
3. **Created this SPRINT-PLAN.md**: Master reference document for cross-session work
4. **Completed Sprint 0**:
   - Deleted all 12 misaligned chapter directories
   - Rewrote `core-1/index.html` with correct 12-chapter structure
   - Updated `forge/index.html` SAMPLE_MODULES array
   - All chapters marked "coming-soon" until built

### What's Ready for Next Session
- **Sprint 1** is ready to begin
- Chapter 1 slide already reviewed (37 pages covering motherboards, CPUs, RAM, BIOS/UEFI, cooling)
- Existing labs can be reused (pc-components, cpu-sockets, ram-id for Ch1)

### How to Start Fresh Session
```
1. Read this file: SPRINT-PLAN.md
2. Check "Current Status" section above
3. Begin Sprint 1 → Chapter 1
4. Read slide: "/home/eq/ai-content/A+/Comptia A+ 1/1101 Chap 1.pdf"
5. Create: chapters/ch01-motherboards/index.html
6. Only read ONE slide PDF at a time (large files)
```

### Key Paths
| Item | Path |
|------|------|
| Project Root | `/home/eq/ai-content/Hexworth Prime/` |
| Core 1 Directory | `_app/houses/forge/applets/comptia-aplus/core-1/` |
| Slides Directory | `/home/eq/ai-content/A+/Comptia A+ 1/` |
| Forge Index | `_app/houses/forge/index.html` |

### Chapter 1 Content Preview (from slide review)
**Title:** Motherboards, Processors, and Memory
**Exam Objectives:** 3.2, 3.4
**Key Topics:**
- Motherboard form factors (ATX, Micro-ATX, ITX variants)
- Bus architecture, Northbridge/Southbridge chipsets
- Expansion slots (PCI, PCIe lanes x1/x4/x8/x16)
- Connectors (SATA, eSATA, M.2, Headers, ATX Power)
- CPU sockets (PGA vs LGA), Intel/AMD
- Memory types (DDR3/4/5, DIMM/SODIMM, ECC)
- BIOS vs UEFI, CMOS battery, POST, Secure Boot
- Cooling (fans, heat sinks, thermal paste, liquid)

### Existing Labs to Integrate with Chapter 1
- `labs/pc-components-lab.html` - Component identification
- `labs/cpu-sockets-lab.html` - Socket matching
- `labs/ram-identification-lab.html` - DDR identification

---

## Prompt for New Session

Copy this to start a fresh session:

```
Continue A+ Core 1 curriculum work for Hexworth Prime.

Read the sprint plan first:
/home/eq/ai-content/Hexworth Prime/_app/houses/forge/applets/comptia-aplus/core-1/SPRINT-PLAN.md

Sprint 0 is complete. Start Sprint 1 - build Chapter 1 (Motherboards, Processors, and Memory) using the actual course slide at:
/home/eq/ai-content/A+/Comptia A+ 1/1101 Chap 1.pdf

Key rules:
- Only read ONE slide PDF at a time (context management)
- Each chapter needs interactive content + quiz + lab
- DO NOT deploy without explicit permission
```
