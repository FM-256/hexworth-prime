# PiVerse Architecture — Raspberry Pi Learning Hub

**Location:** `_app/houses/matrix/piverse/`
**House:** Matrix
**Name:** PiVerse
**License:** Authorized by Raspberry Pi Press — publisher partnership.

---

## Decisions (Nancy Review Round 1 — 2026-04-22)

1. **No content dropped.** Every chapter from every source stays. PiVerse teaches the full Pi ecosystem — beginner to advanced, Scratch to PCB design.

2. **Hardware build chapters live in BOTH places.** PiVerse teaches the concepts and programming (Traffic Light = state machines, Burglar Alarm = interrupt-driven programming). Signal gets corresponding build projects for the physical assembly. Same topic, different lens. Not duplication — depth.

3. **Similar-but-different content is intentional.** RetroPie in Signal = build the station. RetroPie in PiVerse = understand emulation architecture. Competition between approaches makes better learners.

4. **License cleared.** Publisher authorization received directly from Raspberry Pi Press.

5. **Color palette: Raspberry Pi red (#c51a4a) accent on Matrix dark background.** Distinct from Matrix terminal green (#00ff41) and adv-linux emerald (#10b981).

6. **Visual theme: "The Board"** — PCB trace background, blinking LED, Pi SVG hero. Avoids conflict with Matrix's "Grid" terminology.

7. **Track 5 cross-references Signal PCB track.** Theory here, practice there. Each chapter links to corresponding Signal build.

---

## Boundary with Signal

- **Signal** = BUILD projects (buy hardware, wire, solder, deploy in the field)
- **PiVerse** = EDUCATIONAL content (concepts, theory, programming, guided learning)
- Same topics CAN exist in both — different perspectives, different depth, different outcomes
- Signal: "build this traffic light" → PiVerse: "understand state machines through a traffic light example"
- Cross-references connect the two so students can go deeper in either direction

---

## 5 Tracks, 50 Modules

### Track 1: Pi Fundamentals (pv-fundamentals) — 10 chapters, progressive
Source: Official Beginner's Guide 5th Ed

| Ch | ID | Title |
|----|----|-------|
| 1 | pv-f-01 | Meet the Raspberry Pi |
| 2 | pv-f-02 | First Boot: Setup & SD Card |
| 3 | pv-f-03 | The Raspberry Pi Desktop |
| 4 | pv-f-04 | The Linux Command Line |
| 5 | pv-f-05 | System Configuration |
| 6 | pv-f-06 | Visual Programming with Scratch |
| 7 | pv-f-07 | Python on the Pi |
| 8 | pv-f-08 | Introducing C on Linux |
| 9 | pv-f-09 | The Pico & Pico W |
| 10 | pv-f-10 | Pi Ecosystem & Models |

### Track 2: MicroPython on Pico (pv-micropython) — 12 chapters, progressive
Source: Get Started with MicroPython 2nd Ed

| Ch | ID | Title |
|----|----|-------|
| 1 | pv-mp-01 | Know Your Pico |
| 2 | pv-mp-02 | MicroPython & Thonny |
| 3 | pv-mp-03 | Digital I/O: LEDs & Buttons |
| 4 | pv-mp-04 | PWM & Analog Signals |
| 5 | pv-mp-05 | Traffic Light Controller |
| 6 | pv-mp-06 | Reaction Game |
| 7 | pv-mp-07 | Motion Detection (PIR) |
| 8 | pv-mp-08 | Temperature & ADC |
| 9 | pv-mp-09 | Data Logging |
| 10 | pv-mp-10 | I2C and SPI Protocols |
| 11 | pv-mp-11 | WiFi Networking (Pico W) |
| 12 | pv-mp-12 | Bluetooth (Pico W BLE) |

### Track 3: Electronics & GPIO (pv-electronics) — 10 chapters, progressive
Source: Beginner's Guide Ch6-8 + MicroPython Ch3-4 + C/GUI booklet

| Ch | ID | Title |
|----|----|-------|
| 1 | pv-e-01 | GPIO Architecture |
| 2 | pv-e-02 | GPIO with Scratch |
| 3 | pv-e-03 | GPIO with Python (gpiozero) |
| 4 | pv-e-04 | Electronic Components |
| 5 | pv-e-05 | The Sense HAT |
| 6 | pv-e-06 | Camera Modules |
| 7 | pv-e-07 | Serial Protocols (UART/I2C/SPI) |
| 8 | pv-e-08 | Analog Signals & ADC |
| 9 | pv-e-09 | Power Management |
| 10 | pv-e-10 | GUI Programming on Pi |

### Track 4: Maker's Workshop (pv-maker) — 10 chapters, standalone collection
Source: Handbook 2025, Book of Making 2025, Code the Classics I & II

| Ch | ID | Title |
|----|----|-------|
| 1 | pv-m-01 | Emulation Architecture (RetroPie) |
| 2 | pv-m-02 | Game Design: Boing! (Pygame) |
| 3 | pv-m-03 | Game Design: Platformer Mechanics |
| 4 | pv-m-04 | Game Design: Procedural Generation |
| 5 | pv-m-05 | Home Automation Protocols |
| 6 | pv-m-06 | Media Server Architecture |
| 7 | pv-m-07 | Computational Photography |
| 8 | pv-m-08 | Edge AI & Computer Vision |
| 9 | pv-m-09 | Environmental Sensing Systems |
| 10 | pv-m-10 | Motor Control & Robotics Theory |

### Track 5: Board Engineering (pv-engineering) — 8 chapters, progressive
Source: Design an RP2040 Board with KiCad
Note: Each chapter links to corresponding Signal PCB build project

| Ch | ID | Title |
|----|----|-------|
| 1 | pv-b-01 | Inside the RP2040 |
| 2 | pv-b-02 | Schematic Reading |
| 3 | pv-b-03 | PCB Anatomy |
| 4 | pv-b-04 | Power System Design |
| 5 | pv-b-05 | Signal Integrity |
| 6 | pv-b-06 | Manufacturing & Assembly |
| 7 | pv-b-07 | Motor Controller Case Study |
| 8 | pv-b-08 | USB HID Controller Case Study |

---

## Hub Design: "The Board"

- PCB trace background pattern (subtle, low opacity)
- Blinking LED on Pi SVG in hero (CSS animation — the Pi is "alive")
- Raspberry Pi red (#c51a4a) accent on Matrix dark background
- Track cards in 2-up grid with per-track progress bars
- Cross-reference panel linking to Signal hardware projects
- Attribution footer: "Content developed in partnership with Raspberry Pi Press"

## File Structure

```
_app/houses/matrix/piverse/
  index.html                    (hub page)
  fundamentals/
    index.html                  (Track 1 course index)
    pv-f-01.html through pv-f-10.html
  micropython/
    index.html                  (Track 2 course index)
    pv-mp-01.html through pv-mp-12.html
  electronics/
    index.html                  (Track 3 course index)
    pv-e-01.html through pv-e-10.html
  maker/
    index.html                  (Track 4 collection index)
    pv-m-01.html through pv-m-10.html
  engineering/
    index.html                  (Track 5 course index)
    pv-b-01.html through pv-b-08.html
```

56 total HTML files (1 hub + 5 track indexes + 50 modules).

## Prerequisites

- Pi Fundamentals: None (entry point)
- MicroPython: pv-f-09 (Pico intro)
- Electronics: pv-f-07 (Python on Pi)
- Maker's Workshop: pv-f-04 (Linux command line)
- Board Engineering: pv-e-07 (Serial Protocols)

## Signal Cross-References (build <-> theory pairs)

| Signal Build | PiVerse Theory |
|-------------|---------------|
| sg-43 Pi Headless Setup | pv-f-02 First Boot |
| sg-44 Pi-hole DNS | pv-m-05 Home Automation Protocols |
| sg-28 RetroPie Station | pv-m-01 Emulation Architecture |
| sg-48 Jellyfin Media | pv-m-06 Media Server Architecture |
| sg-73-82 PCB Design | pv-b-01 through pv-b-08 Board Engineering |
| NEW Signal Pico builds | pv-mp-05 through pv-mp-07 (Traffic Light, Reaction, PIR) |
