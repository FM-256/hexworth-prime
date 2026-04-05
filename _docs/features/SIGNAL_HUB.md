# Signal Hub (Hardware Projects)

**Status:** SHIPPED
**Components:** `SignalEngine.js` (2,332 lines), `SignalData.js` (1,685 lines)
**Location:** `_app/signal/` (engine, data, 113 project HTML files), `_app/signal/toolkit/` (22 tools + 2 custom apps)
**Added:** v5.0.0
**Last reviewed:** 2026-04-05

## Purpose

Signal is Hexworth Prime's hardware projects hub — 92 hands-on builds across 13 tracks,
spanning Arduino circuits, Raspberry Pi servers, ESP32 security tools, SDR radio, drone
security, PCB design, and red team hardware. Every project includes a real parts list
with costs, build times, prerequisite chains, and difficulty tiers.

This is the only hub that requires students to buy physical components. The platform
filtering system lets students see only projects compatible with the hardware they own.

## Architecture

```
SignalData.js (1,685 lines)
  |-- 13 tracks with section metadata
  |-- 92 projects (sg-01 through sg-92)
  |-- 6 hardware platform definitions
  |-- 24 skill competencies
  |-- Per-project: parts lists, costs, build times, prerequisites
  |
  v
SignalEngine.js (2,332 lines)
  |-- renderHub() → track tabs, platform overview, project grid
  |-- renderSection(id) → project cards with platform filtering
  |-- Progress tracking via localStorage
  |-- "Build Your Kit" cost calculator
```

## Tracks (13)

| Track | Projects | Focus |
|-------|----------|-------|
| **Foundations** | sg-01 to sg-05 | Arduino basics — breadboard, sensors, serial, LCD, logging |
| **Network Recon** | sg-06 to sg-10 | WiFi/BT scanning, packet capture, deauth detection |
| **Security Tools** | sg-11 to sg-25 | RFID, motion sensors, USB keylogger detection, IR blaster, RF analyzer |
| **Privacy Builds** | sg-26+ | Encrypted dead drops, Faraday testing, Tor router, signal jammer |
| **Firmware Ops** | varies | Badge hacking, field terminals, network monitoring, IDS |
| **Arcade Ops** | sg-26 to sg-30 | GameBoy, RetroPie, mini arcade, arcade controller |
| **Field Prep** | varies | Bootable media, drive imaging, workstation setup, cable making |
| **Red Team Hardware** | sg-33 to sg-42 | Rubber Ducky, Bad USB, WiFi deauther, keylogger, RFID cloner |
| **Home Lab Builds** | sg-43 to sg-52 | Pi-hole, PXE boot, NAS, WireGuard VPN, Jellyfin, Grafana, Pi cluster |
| **SDR & Radio** | varies | ADS-B aircraft tracking, weather satellites, FM radio, pager signals |
| **IoT Hacking** | varies | Zigbee sniffing, BLE exploitation, MQTT interception, IoT forensics |
| **PCB Design** | varies | KiCad schematic, breakout boards, badge design, PCB assembly |
| **Drone Security** | varies | Drone builds, RF analysis, GPS spoofing, counter-drone, FPV security |

## Hardware Platforms (6)

| Platform | Cost | Projects | Use Case |
|----------|------|----------|----------|
| **Arduino Mega 2560** | $55 | 9 | Kit-included, breadboard circuits, sensor I/O |
| **ESP32 CYD** (Cheap Yellow Display) | $12 | varies | Touchscreen dashboards, WiFi/BT portable tools |
| **ESP32 DevKit V1** | $8 | varies | Bare ESP32, RF projects, WiFi scanning |
| **Raspberry Pi 4/5** | $75 | varies | Full Linux SBC, servers, encryption, IDS |
| **Workstation** | Free | varies | Standard PC/laptop, common peripherals |
| **RP2040 Pico** | $12 | varies | USB HID devices, mass storage projects |

The "Build Your Kit" section on the hub page calculates total cost per platform,
helping students budget their hardware purchases.

## Difficulty Tiers (4)

| Tier | Label | XP | Cost Range | Description |
|------|-------|-----|-----------|-------------|
| 1 | Recruit | 300 | $0-20 | Kit components only, guided wiring |
| 2 | Operative | 600 | $5-75 | External parts, moderate complexity |
| 3 | Specialist | 1,200 | $10-80 | Custom configs, protocol work, security |
| 4 | Field Agent | 2,500 | $15-80+ | Field-deployable, complex firmware, production tools |

## Project Structure

Each of the 92 projects includes:

```javascript
{
  id: "sg-01",
  title: "Blink & Breadboard",
  type: "build",           // build | lab | game
  difficulty: 1,           // 1-4 (Recruit to Field Agent)
  platform: "mega",        // mega | esp32-cyd | esp32 | pi | workstation | pico
  time: "45m",             // build time
  cost: "$0",              // additional cost beyond platform
  skills: ["breadboarding", "arduino-ide", "gpio"],
  parts: [
    { name: "LED (Red)", qty: 3, inKit: true },
    { name: "220Ω Resistor", qty: 3, inKit: true }
  ],
  prerequisites: [],       // project IDs or skill names
  outcomes: ["Voltage/current basics", "Breadboard wiring", "Sketch upload"]
}
```

## Toolkit Library (22 Software Tools + 2 Custom Apps)

The toolkit is a reference library of recommended software:

**Development:** Arduino IDE, PlatformIO, VS Code, Thonny
**System Utilities:** Balena Etcher, Rufus, Ventoy, Clonezilla, GParted, DBAN
**Hardware:** Raspberry Pi Imager, CoolTerm, Minicom, PuTTY, Screen
**Networking:** Wireshark, Nmap, MemTest86, Hiren's Boot CD
**Virtualization:** VirtualBox, VMware Workstation
**Retro:** RetroPie

**Custom Signal apps:**
- **C2 Command & Control Dashboard** — custom Signal build for hardware C2 monitoring
- **DuckyScript IDE** — full IDE for writing Rubber Ducky payloads (6 modules: intro, basics, payloads, recon, persistence, defense)

## Red Team Hardware Track

The most security-relevant track, covering:
- Rubber Ducky / Bad USB keystroke injection
- WiFi deauther builds
- Hardware packet sniffers
- Physical keyloggers
- WiFi audit tools
- LAN implants
- RFID cloners
- Flipper Zero DIY alternatives

Includes detailed DuckyScript courses (6 modules from intro through defense/capstone).

## Rendering

**Hub page:** Track tabs with section grid. Each track shows project cards with platform
badges, difficulty indicators, cost, and build time. Platform filter bar allows narrowing
by owned hardware.

**Section page:** Project card grid with:
- Difficulty badge with tier color
- Platform compatibility badges
- Cost and build time display
- Prerequisites chain visualization
- Skill tags
- Completion checkbox (localStorage toggle)

## Storage

| Key | Purpose |
|-----|---------|
| `hexworth_signal_progress` | Project completions: `{ projectId: timestamp, ... }` |

## Skills (24 Cross-Cutting Competencies)

breadboarding, soldering, serial-comms, wifi-scanning, bluetooth, packet-capture,
rfid-nfc, encryption, linux-admin, python, cpp, arduino-ide, platformio, networking,
rf-fundamentals, usb-protocol, sensor-integration, display-programming, sd-storage,
gpio, tor-privacy, ids-ips, physical-security, firmware-dev

## Key Decisions

- **Real costs and parts lists** — Unlike other hubs where everything is virtual, Signal
  projects require physical components. Including costs and "inKit" flags (for ELEGOO
  starter kit compatibility) helps students plan purchases.

- **Platform filtering** — Students who only own an Arduino shouldn't see Raspberry Pi
  projects. Dynamic filtering lets them focus on what they can actually build.

- **4-tier difficulty with XP scaling** — Recruit projects grant 300 XP, Field Agent
  grants 2,500 XP. The 8x XP multiplier reflects the real skill difference between
  blinking an LED and building a field-deployable security tool.

- **Red Team hardware as educational** — Projects like Rubber Ducky and WiFi deauther
  are taught with defensive context. Each offensive build includes a defense/detection
  module. The DuckyScript IDE course ends with a "Defense & Capstone" module.

- **Toolkit as reference, not requirement** — The 22-tool library is informational.
  Students aren't required to install all tools — they're recommendations for each
  platform.

## Known Limitations

- **No automated verification** — Project completion is self-reported (checkbox toggle).
  There's no way to verify a student actually built the circuit. Unlike quizzes or CTF
  flags, hardware builds can't be programmatically validated.

- **Cost data can go stale** — Component prices change. The costs in project configs
  are point-in-time estimates. No mechanism to auto-update prices from suppliers.

- **No certification alignment** — Unlike Forensics Hub (5 certs), Signal has no
  certification mapping. Hardware skills don't map cleanly to standard IT certifications.

- **SVG wiring diagrams are static** — Some tracks include SVG wiring diagrams in guide
  files (e.g., Security Tools: 4,276 lines of guides.js). These are hand-drawn and can't
  be generated from circuit definitions. Changes to project wiring require manual SVG edits.

- **113 HTML files, manually maintained** — Each project has a standalone guide HTML file.
  No templating or generation system. Adding a new project requires creating the HTML
  file, adding to SignalData.js, and placing in the correct section directory.
