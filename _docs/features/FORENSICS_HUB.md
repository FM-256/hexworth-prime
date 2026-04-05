# Forensics Hub (Digital Forensics)

**Status:** SHIPPED
**Components:** `ForensicsEngine.js` (415 lines), `ForensicsData.js` (569 lines), `cert-alignment.js` (267 lines)
**Location:** `_app/forensics/` (engine, data, 61 module HTML files), `_app/forensics/sections/` (6 track directories)
**Added:** v5.0.0
**Last reviewed:** 2026-04-05

## Purpose

The Forensics Hub is a comprehensive digital forensics curriculum — 60 modules across
6 tracks covering the full forensics lifecycle from evidence handling through advanced
analysis. It's the only hub with formal certification alignment, mapping every module
to 5 major forensics certifications (CySA+, Security+, CHFI, GCFE, GCFA).

The hub follows a courtroom-ready framework — chain of custody, NIST SP 800-86,
expert witness testimony, Daubert standards — preparing students not just to analyze
evidence but to present findings that hold up in legal proceedings.

## Architecture

```
ForensicsData.js (569 lines)
  |-- 6 tracks with module arrays
  |-- 60 modules (df-01 through df-60)
  |-- 15 cross-linked modules from other houses
  |-- 10 capstone modules (1 per track + 4 mini-capstones)
  |
  v
ForensicsEngine.js (415 lines)
  |-- renderHub() → track grid, progress bar, cert badges
  |-- Progress tracking via localStorage
  |-- Cross-house module integration
  |
  v
cert-alignment.js (267 lines)
  |-- 5 certification mappings
  |-- Per-module objective coverage
```

## Tracks (6)

| Track | Modules | Focus |
|-------|---------|-------|
| **Evidence Foundations & Legal Framework** | df-01 to df-10 | Evidence types, chain of custody, NIST SP 800-86, RFC 3227, CFAA, ECPA, 4th Amendment, expert witness, ethics |
| **Disk & File System Forensics** | df-11 to df-20 | NTFS/ext4/FAT32/APFS, imaging (dd, FTK Imager), Autopsy, file carving, metadata, MFT/inode analysis, slack space |
| **Memory Forensics** | df-21 to df-30 | Volatile evidence, acquisition (WinPmem, LiME, DumpIt), Volatility framework, process/DLL analysis, registry extraction |
| **Network Forensics** | df-31 to df-40 | Packet capture (tcpdump, Wireshark), TCP reconstruction, DNS exfiltration, encrypted traffic analysis, NetFlow, IDS correlation, 802.11 wireless |
| **Log & Timeline Analysis** | df-41 to df-50 | Windows Event Logs, Linux syslog/journald, log correlation, super timelines (log2timeline/plaso), SIEM integration, browser/email forensics, registry |
| **Advanced & Specialized Forensics** | df-51 to df-60 | Anti-forensics detection, cloud forensics (AWS/Azure/GCP), mobile forensics, IoT/embedded, malware forensics, steganography, incident response integration |

Each track ends with a capstone module requiring synthesis of that track's skills.

## Certification Alignment (5 Certifications)

Mapped in `cert-alignment.js` — every module cross-referenced to certification objectives:

| Certification | Modules Mapped | Focus Areas |
|--------------|----------------|-------------|
| **CompTIA CySA+ (CS0-003)** | 45 of 60 | Domain 4: Incident Response — indicators of compromise, forensic analysis |
| **CompTIA Security+ (SY0-701)** | 35 of 60 | Domain 4: Security Operations — incident response, investigation data sources |
| **EC-Council CHFI v10** | 60 of 60 | All 14 modules — full forensics lifecycle coverage |
| **GIAC GCFE** | 35 of 60 | Windows & browser forensics — artifacts, timeline, imaging, anti-forensics |
| **GIAC GCFA** | 45 of 60 | Advanced forensics & IR — Volatility, memory, APT analysis, enterprise |

## Cross-House Integration (15 Modules)

The Forensics Hub integrates existing content from 5 houses:

| Source | Modules | Content |
|--------|---------|---------|
| **Eye** | 7 | CySA+ forensics presentation/lab, forensic elements, evidence types, PCAP, network/memory forensics |
| **Shield** | 1 | IR forensics lab |
| **Script** | 1 | Linux disk forensics applet |
| **Dark Arts** | 1 | Network forensics lab |
| **Web/Backbone** | 1 | Backbone network forensics (10 sub-modules) |
| **Operator** | 3 | Forensics missions 1-3 |

Cross-links are embedded in module definitions as `crossLink` fields pointing to the
source house content. Students access the original module — no duplication.

## Rendering

**Hub page (`renderHub()`):**
1. Header with icon, name, tagline ("Investigate. Analyze. Prove.")
2. Hero with stats: 60 modules, 6 tracks, completion %, 5 cert alignments
3. Progress bar (visual fill)
4. Track grid — each track card shows:
   - Track icon and color (distinct per track)
   - Module count and completion percentage
   - Track-specific progress bar
   - Module list with completion checkboxes
   - Capstone badges on capstone modules
5. Cross-links section (existing house modules)
6. Certification alignment badge grid

## Storage

| Key | Purpose |
|-----|---------|
| `hexworth_forensics_progress` | Module completions object |

## Key Decisions

- **Certification-first design** — Most hubs are organized by topic. Forensics is organized
  by certification domain coverage. `cert-alignment.js` exists as a separate file because
  the mapping drives content sequencing, not just labeling.

- **Legal framework emphasis** — Track 1 (Evidence Foundations) devotes 10 modules to legal
  concepts before any technical analysis begins. This reflects real forensics practice
  where improperly handled evidence is inadmissible regardless of technical quality.

- **Cross-house over duplication** — Rather than rebuilding forensics content that already
  exists in Eye, Shield, and Script houses, the hub links to the originals. 15 modules
  are cross-references, not copies. This prevents content drift and reduces maintenance.

- **Lightweight engine** — ForensicsEngine.js is only 415 lines (vs SignalEngine at 2,332
  or ArcticEngine at 2,171). The hub is simpler by design — no fog of war, no platform
  filtering, no factions. Just tracks, modules, and progress.

- **Courtroom-ready framework** — Modules cover Daubert standard, ISO 17025, IACIS/ISFCE
  ethics, and expert witness testimony. This positions the hub for law enforcement and
  legal professionals, not just IT students.

## Known Limitations

- **No interactive forensics tools** — Unlike the CTF Arena (terminal simulation) or
  Signal Hub (hardware builds), the Forensics Hub is primarily lecture + lab content.
  No in-browser Autopsy, no Volatility simulator, no packet replay engine. Students
  are expected to use real tools on their own machines.

- **All modules marked `isNew`** — The entire hub was built in one push. The `isNew` flag
  is set on all 60 modules, which loses its meaning when everything is "new." No
  mechanism to auto-clear the flag after a time period.

- **No difficulty progression within tracks** — All modules in a track are treated as
  equal difficulty. Unlike Arctic (which has 6 difficulty levels) or Signal (4 tiers),
  Forensics has no per-module difficulty indicator. Track 6 (Advanced) is harder than
  Track 1 (Foundations) but this is implicit, not labeled.

- **Progress is binary** — Module completion is tracked as done/not-done. No partial
  progress, no scores, no time tracking. The capstone modules have no special completion
  validation — they're completed the same way as regular modules.

- **Cross-links depend on source stability** — If the Eye house reorganizes its CySA+
  content, 7 Forensics Hub cross-links break silently. No EduScan rule validates
  cross-house forensics links specifically.
