# CompTIA A+ Core 1 (220-1101) Sprint Tracker

## Overview
Building comprehensive A+ Core 1 exam prep content for Hexworth Prime's House of Forge.

**Location:** `_app/houses/forge/applets/comptia-aplus/core-1/`

---

## Sprint Status

| Sprint | Content | Status | Completed |
|--------|---------|--------|-----------|
| 1 | Ch 1 - Safety & Professionalism | **COMPLETE** | 2026-01-10 |
| 2 | Ch 2 - The Visible Computer | **COMPLETE** | 2026-01-10 |
| 3 | Ch 3 - CPUs | **COMPLETE** | 2026-01-10 |
| 4 | Ch 4 - RAM | **COMPLETE** | 2026-01-10 |
| 5 | Ch 5 - Firmware/BIOS | **COMPLETE** | 2026-01-10 |
| 6 | Ch 6 - Motherboards | **COMPLETE** | 2026-01-10 |
| 7 | Ch 7 - Power Supplies | **COMPLETE** | 2026-01-10 |
| 8 | Ch 8 - Mass Storage | **COMPLETE** | 2026-01-10 |
| 9 | Ch 9 - Implementing Storage | **COMPLETE** | 2026-01-10 |
| 10 | Ch 10 - Peripherals | **COMPLETE** | 2026-01-10 |
| 11 | Ch 11 - Building a PC | **COMPLETE** | 2026-01-10 |
| 12 | Ch 12 - Windows | **COMPLETE** | 2026-01-10 |
| 13 | Domain - Mobile Devices | **COMPLETE** | 2026-01-10 |
| 14 | Domain - Networking (Part 1) | **COMPLETE** | 2026-01-10 |
| 15 | Domain - Networking (Part 2) | **MERGED** | (into Sprint 14) |
| 16 | Domain - Cloud/Virtualization | **COMPLETE** | 2026-01-10 |
| 17 | Domain - Troubleshooting Deep Dive | **COMPLETE** | 2026-01-10 |

---

## Directory Structure

```
core-1/
├── index.html                      # Main course navigation
├── chapters/
│   ├── ch01-safety/index.html      # ESD, professionalism, methodology
│   ├── ch02-visible-computer/      # PC components overview
│   ├── ch03-cpus/                  # CPU architecture, sockets, cooling
│   ├── ch04-ram/                   # DDR generations, form factors
│   ├── ch05-firmware/              # BIOS/UEFI, boot options, TPM
│   ├── ch06-motherboards/          # Form factors, PCIe, connectors
│   ├── ch07-power-supplies/        # Voltage rails, connectors, ratings
│   ├── ch08-mass-storage/          # HDD/SSD/NVMe, SATA, RAID
│   ├── ch09-implementing-storage/  # MBR/GPT, partitions, file systems
│   ├── ch10-peripherals/           # USB, video cables, printers
│   ├── ch11-building-pc/           # Assembly, POST, first boot
│   └── ch12-windows/               # Boot process, system tools
├── domains/
│   ├── mobile-devices/             # Laptop hardware, MDM, sync
│   ├── networking/                 # Ports, hardware, IP, DNS
│   ├── cloud-virtualization/       # IaaS/PaaS/SaaS, hypervisors
│   └── troubleshooting/            # 6-step methodology, symptoms
└── labs/
    ├── cpu-sockets-lab.html        # Interactive socket ID
    ├── ram-identification-lab.html # RAM type/gen scenarios
    ├── esd-workspace-lab.html      # ESD safety practice
    ├── pc-components-lab.html      # Component identification
    ├── psu-connectors-lab.html     # PSU connector matching
    └── troubleshooting-lab.html    # Troubleshooting scenarios
```

---

## Exam Domain Coverage

| Domain | Weight | Coverage |
|--------|--------|----------|
| 1. Mobile Devices | 15% | `domains/mobile-devices/` |
| 2. Networking | 20% | `domains/networking/` |
| 3. Hardware | 25% | `chapters/ch02-ch11/` |
| 4. Virtualization & Cloud | 11% | `domains/cloud-virtualization/` |
| 5. Troubleshooting | 29% | `chapters/ch01/` + `domains/troubleshooting/` |

---

## Key Features Per Module

- **Section-based learning** with progress dots
- **Exam Tips** highlighted in yellow callout boxes
- **Info Boxes** for key concepts
- **5-question quizzes** with instant feedback
- **localStorage progress tracking** (key: `aplus-core1-progress`)
- **Forge house theming** (orange/amber color scheme)

---

## Future Enhancements (Optional)

- [ ] Additional labs for chapters 5-12
- [ ] Practice exam mode (randomized questions)
- [ ] Performance-based question simulations
- [ ] Flashcard review system
- [ ] PDF export of study notes

---

*Last Updated: January 10, 2026*
