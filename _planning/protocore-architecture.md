# ProtoCore — Microcontroller Education Hub

**Status:** PLANNING — architecture in progress
**Location:** `_app/houses/matrix/protocore/`
**House:** Matrix
**Name:** ProtoCore
**Tagline:** "Build the Core. Control the System."
**Theme:** Transformers meets Frankenstein — taking inert hardware and giving it life through code

---

## Creative Vision

### The Mythology

The student is the **Creator**. The board is dormant — dead silicon, lifeless pins, empty flash memory. The moment the student uploads their first program, the board comes alive. That moment is the **AllSpark** — the Transformers artifact that gives life to machines.

Each core after AllSpark gives the machine new abilities:
- **Sight** (sensors) — the machine perceives its environment
- **Voice** (audio/serial) — the machine communicates
- **Movement** (motors) — the machine acts on the physical world
- **Memory** (EEPROM/flash) — the machine remembers
- **Intelligence** (logic/timing) — the machine makes decisions
- **Connection** (WiFi/BLE) — the machine reaches beyond itself

The visual identity is **raw energy** — electric arcs, exposed wiring, the moment of creation. Not clean PCB traces (that's PiVerse). ProtoCore is Frankenstein's laboratory. Dark background with electric blue/yellow sparks. Lightning bolt motifs. The feeling of channeling electricity into something that WAKES UP.

### Three-Hub Ecosystem

| Hub | Phase | Theme | Aesthetic |
|-----|-------|-------|-----------|
| **PiVerse** | Learn it | The ecosystem | Organic, PCB traces, blinking LED |
| **ProtoCore** | Create it | The creation | Electric, Frankenstein, raw energy, AllSpark |
| **Signal** | Deploy it | The mission | Military, field ops, mission-ready |

Three phases of hardware education: understand the theory (PiVerse), bring it to life (ProtoCore), deploy it in the field (Signal).

---

## Identity

ProtoCore sits in Matrix house alongside PiVerse. While PiVerse covers single-board computers running Linux, ProtoCore covers bare-metal microcontrollers — Arduino (ATmega) and ESP32 (Xtensa/RISC-V).

**Neon context:** ProtoCore operates within the Neon Technology Academy ecosystem. Lab scenarios reference the Neon fictional corporation where applicable.

**Boundary with Signal:** Signal = BUILD projects (buy parts, wire, solder, deploy). ProtoCore = EDUCATIONAL content (concepts, programming, architecture). Same topic can exist in both — different lens, different depth. Not duplication — competition between perspectives makes better learners.

---

## Content Rules (no shortcuts)

Every chapter produces THREE files:
1. **Presentation** — 12 viewport-locked slides, SVG + CSS animation on every slide, nav bar, Mark Complete
2. **Lab** — Terminal sim (for code-heavy cores) OR GUI portal (for hardware visualization cores)
3. **Quiz** — 15 questions, serverGrading:true, balanced A/B/C/D, zero client answers, keys seeded to Firestore

Platform rules:
- FluxCapacitor ONLY in hub page
- AccessGuard first in every file
- No emoji — webp icons only
- Nancy reviews architecture before build
- Nancy reviews build before deploy
- No content dropped, no compression, no shortcuts
- Let the content breathe — if it needs more cores, it gets more cores

---

## Arduino Track — 19 Cores

Each core maps naturally to one domain from the Arduino Cookbook's 18 chapters + a security core from the IoT pentesting material. No compression. Each teaches ONE focused thing well.

| Core | ID | Title | Cookbook Source | Lab Type |
|------|----|-------|---------------|----------|
| 1 | pc-ard-01 | AllSpark: First Program | Ch 1 — IDE, board setup, first sketch, Blink, Serial Monitor | GUI (simulated IDE) |
| 2 | pc-ard-02 | Programming Foundations | Ch 2 — Variables, types, strings, conditions, loops, functions, C/C++ for Arduino | Terminal |
| 3 | pc-ard-03 | Math & Logic | Ch 3 — Arithmetic, trig, random, bitwise operations, constrain, map | Terminal |
| 4 | pc-ard-04 | Serial Communication | Ch 4 — Serial.print, formatted output, receiving data, parsing, multi-serial, logging, Arduino-to-Pi | Terminal |
| 5 | pc-ard-05 | Digital & Analog Input | Ch 5 — Switches, debounce, pull-up/down, keypads, analogRead, voltage dividers, range mapping | Terminal |
| 6 | pc-ard-06 | Sensors | Ch 6 — Motion (PIR), light (LDR), distance (ultrasonic), temp, RFID, GPS, gyroscope, accelerometer | GUI (simulated sensor dashboard) |
| 7 | pc-ard-07 | LEDs & Visual Output | Ch 7 — Single/RGB LEDs, arrays, matrices, 7-segment, shift registers, Charlieplexing, PWM extenders | GUI (simulated LED visualizer) |
| 8 | pc-ard-08 | Motors & Motion | Ch 8 — Servos (standard/continuous), DC motors, H-bridge, steppers, solenoids, brushless | GUI (simulated motor control panel) |
| 9 | pc-ard-09 | Sound & Audio | Ch 9 — tone(), melodies, multi-tone, PWM audio, MIDI, synthesizer | Terminal |
| 10 | pc-ard-10 | Remote Control | Ch 10 — IR receive/decode, IR transmit/imitate, AC device control, remote-controlled camera | Terminal |
| 11 | pc-ard-11 | Displays | Ch 11 — LCD (16x2, 20x4), text formatting, custom chars, graphical LCD, full-color LCD, OLED | GUI (simulated display) |
| 12 | pc-ard-12 | Timing & Clocks | Ch 12 — millis() vs delay(), pulse measurement, periodic callbacks, RTC (real-time clock) | Terminal |
| 13 | pc-ard-13 | Bus Protocols (I2C & SPI) | Ch 13 — I2C multi-device, SPI multi-device, port expanders, inter-Arduino communication | Terminal |
| 14 | pc-ard-14 | Wireless Communication | Ch 14 — XBee, ZigBee mesh, Bluetooth classic, BLE | Terminal |
| 15 | pc-ard-15 | WiFi & IoT | Ch 15 — Ethernet shield, WiFi modules, web server, MQTT pub/sub, REST APIs, NTP, IoT patterns | GUI (simulated web dashboard) |
| 16 | pc-ard-16 | Libraries | Ch 16 — Using built-in libraries, installing third-party, modifying, creating your own, library structure | Terminal |
| 17 | pc-ard-17 | Memory & Optimization | Ch 17 — Build process, free RAM, PROGMEM, string storage, #define vs const, conditional compilation | Terminal |
| 18 | pc-ard-18 | Hardware Internals | Ch 18 — EEPROM, pin change interrupts, timer registers, PWM hardware, pulse generator, bootloader, fuses | Terminal |
| 19 | pc-ard-19 | Arduino for Security | IoT pentesting guide — JTAGenum, RS232enum, UARTFuzz, Arduino as a pentesting tool, hardware hacking bridge | Terminal |

### Arduino Track Totals
- 19 cores x 3 files = **57 content files**
- 1 track index page
- GUI labs: Cores 1, 6, 7, 8, 11, 15 (6 GUI labs)
- Terminal labs: Cores 2-5, 9-10, 12-14, 16-19 (13 terminal labs)

---

## ESP32 Track — TBD (requires separate analysis)

The ESP32 track needs its own mapping from Espressif documentation and ESP32 capabilities. It is NOT a copy of the Arduino track with different syntax. The ESP32 has fundamentally different capabilities:

- Dual-core with FreeRTOS (concurrency is native, not bolted on)
- Built-in WiFi + BLE (no shields)
- Touch pins, Hall sensor, ULP co-processor
- Partitions, NVS, secure boot, flash encryption
- ESP-NOW peer-to-peer mesh
- OTA updates native
- Multiple framework options (ESP-IDF vs Arduino framework)

The ESP32 track core count will be determined by the content depth required, not by matching Arduino's 19. It may be 15 cores. It may be 22. Whatever the content needs.

**ESP32 source material needed:**
- espressif.com official documentation (Apache 2.0)
- ESP-IDF Programming Guide
- ESP32 Technical Reference Manual
- Community tutorials and examples

**Action item:** Gather ESP32 source material into `/home/eq/hexworth-shared/Raw sources/esp32/` before planning the ESP32 track architecture.

---

## Hub Design

- **Name:** ProtoCore
- **Color:** Electric blue (#0088ff) primary, lightning yellow (#ffd700) accent sparks
- **Background:** Dark with subtle electric arc pattern (SVG, low opacity) — Frankenstein's lab
- **Hero:** "ProtoCore" title with electric glow effect, subtitle "Build the Core. Control the System."
- **Alive element:** Lightning bolt that arcs between two contact points (CSS animation) — the moment of creation
- **Two track sections:** Arduino Track (19 cores) and ESP32 Track (TBD cores)
- **Each track card:** Core number, title, difficulty badge, progress bar
- **Cross-reference panel:** Links to Signal builds
- **Components:** AccessGuard, AchievementManager, ModuleProgress, FirebaseAuth, TenantRouter (head). TenantShell, ContentDiscovery, FluxCapacitor (bottom — hub page only).

---

## File Structure

```
_app/houses/matrix/protocore/
  index.html                           (hub page)
  arduino/
    index.html                         (Arduino track index)
    presentations/
      pc-ard-01.presentation.html      (AllSpark slides)
      pc-ard-02.presentation.html      (Programming slides)
      ... through pc-ard-19
    labs/
      pc-ard-01.lab.html               (AllSpark lab — GUI)
      pc-ard-02.lab.html               (Programming lab — terminal)
      ... through pc-ard-19
    quizzes/
      pc-ard-01.quiz.html
      ... through pc-ard-19
  esp32/
    index.html                         (ESP32 track index)
    presentations/
    labs/
    quizzes/
```

### Arduino Track File Count
- 19 presentations + 19 labs + 19 quizzes = 57 content files
- 1 hub + 1 Arduino track index = 2 structural pages
- **Arduino total: 59 files**
- ESP32: TBD (separate planning phase)

---

## Mission IDs

- Arduino: PC-ARD-01 through PC-ARD-19
- ESP32: PC-ESP-01 through PC-ESP-XX (TBD)

---

## Signal Cross-References

| Signal Build | ProtoCore Theory |
|-------------|-----------------|
| sg-01 Blink & Breadboard | pc-ard-01 AllSpark |
| sg-02 Sensor I/O | pc-ard-06 Sensors |
| sg-03 Serial Bridge | pc-ard-04 Serial Communication |
| sg-04 LCD Dashboard | pc-ard-11 Displays |
| sg-05 Data Logger | pc-ard-04 Serial + pc-ard-12 Timing |
| sg-103 T-Display-S3 Setup | pc-esp-XX (TBD) |
| sg-105 WiFi Recon | pc-esp-XX (TBD) |
| sg-111 Custom Army Knife | pc-esp-XX (TBD) |

---

## Source Material

| Source | License | Usage |
|--------|---------|-------|
| Arduino Cookbook 3rd Ed (O'Reilly) | All Rights Reserved | Topic reference only — derive original content |
| IoT Hacking Arduino guide | Internal | Security angle for Core 19 |
| arduino.cc documentation | CC BY-SA | Can reference freely |
| Espressif documentation | Apache 2.0 | Can reference freely (ESP32 track) |

---

## Implementation Sequence

### Phase 1: Arduino Track
1. Hub page (index.html) — establishes visual identity
2. Arduino track index page
3. Core 1: AllSpark (presentation + lab + quiz) — the entry point
4. Cores 2-5 (programming and I/O fundamentals)
5. Cores 6-11 (sensors, output, displays)
6. Cores 12-15 (communication and networking)
7. Cores 16-19 (advanced topics)
8. Seed 19 quiz keys to Firestore
9. Nancy review
10. Deploy

### Phase 2: ESP32 Track
1. Gather ESP32 source material
2. Map ESP32 capabilities to core structure (no artificial limits)
3. Nancy review architecture
4. Build core by core
5. Deploy

### Phase 3: Matrix House Integration
1. Update Matrix house index with ProtoCore card
2. Register all modules in ContentCatalog
3. Cross-reference links between ProtoCore, PiVerse, and Signal

---

## Appendix: Cookbook-to-Core Mapping Detail

For reference, here's how the Arduino Cookbook's 18 chapters map to 19 ProtoCore cores:

| Cookbook Chapter | Recipes | ProtoCore Core | Notes |
|----------------|---------|---------------|-------|
| Ch 1: Getting Started (8 recipes) | IDE, board, upload, save | Core 1: AllSpark | Entry point, first program |
| Ch 2: Programming (21 recipes) | Variables through assignment | Core 2: Programming | C/C++ fundamentals |
| Ch 3: Math (15 recipes) | Arithmetic through byte extraction | Core 3: Math & Logic | Mathematical operations |
| Ch 4: Serial (13 recipes) | Send, receive, format, log | Core 4: Serial Communication | All serial topics |
| Ch 5: Digital/Analog (11 recipes) | Switches through voltage dividers | Core 5: Digital & Analog Input | Input fundamentals |
| Ch 6: Sensors (17 recipes) | Motion through acceleration | Core 6: Sensors | All sensor types |
| Ch 7: Visual Output (16 recipes) | LEDs through analog panel meter | Core 7: LEDs & Visual | LED patterns and techniques |
| Ch 8: Physical Output (14 recipes) | Servos through stepper drivers | Core 8: Motors & Motion | All motor types |
| Ch 9: Audio (7 recipes) | Tones through synthesis | Core 9: Sound & Audio | Sound generation |
| Ch 10: Remote Control (5 recipes) | IR receive through AC hack | Core 10: Remote Control | IR and remote devices |
| Ch 11: Displays (11 recipes) | LCD through OLED | Core 11: Displays | All display types |
| Ch 12: Time (6 recipes) | millis through RTC | Core 12: Timing & Clocks | Time management |
| Ch 13: I2C/SPI (6 recipes) | Multi-device through Nunchuck | Core 13: Bus Protocols | Inter-device communication |
| Ch 14: Wireless (7 recipes) | XBee through BLE | Core 14: Wireless | Radio communication |
| Ch 15: WiFi/Ethernet (18 recipes) | Ethernet through NTP | Core 15: WiFi & IoT | Network and IoT |
| Ch 16: Libraries (6 recipes) | Using through updating | Core 16: Libraries | Library ecosystem |
| Ch 17: Advanced Coding (6 recipes) | Build process through conditional | Core 17: Memory & Optimization | Code optimization |
| Ch 18: Controller Hardware (14 recipes) | EEPROM through bootloader | Core 18: Hardware Internals | Register-level programming |
| IoT Pentesting Guide | JTAG, UART, RS232 | Core 19: Arduino for Security | Hardware hacking |

Total cookbook recipes referenced: ~201
ProtoCore cores: 19
Average recipes informing each core: ~10.6
This gives enough source depth per core for 12 dense slides + a meaningful lab + a 15-question quiz.
