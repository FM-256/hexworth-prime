# ProtoCore — Microcontroller Education Hub

**Status:** PLANNING — Nancy review required before build
**Location:** `_app/houses/matrix/protocore/` (proposed)
**House:** Matrix
**Name:** ProtoCore
**Tagline:** "Build the Core. Control the System."
**Scope:** Arduino + ESP32 — complete microcontroller education

---

## Identity

ProtoCore is the microcontroller education hub within Hexworth Prime's Matrix house. It sits alongside PiVerse (Raspberry Pi) as a sister hub. While PiVerse covers single-board computers running Linux, ProtoCore covers bare-metal microcontrollers — Arduino (ATmega) and ESP32 (Xtensa/RISC-V).

**Neon context:** ProtoCore operates within the Neon Technology Academy ecosystem. Lab scenarios use Neon as the fictional corporation (similar to CompTIA's Contoso). "ProtoCore by Neon" or just "ProtoCore" — the Neon branding is contextual, not prefixed.

**Boundary with Signal:** Signal = BUILD projects (buy parts, wire, solder, deploy). ProtoCore = EDUCATIONAL content (concepts, programming, architecture). Same topic can exist in both — different lens, different depth. Arduino builds live in Signal (sg-01 through sg-05 Foundations, sg-113 through sg-117 Pico Builds). ProtoCore teaches the theory and programming that makes those builds intelligible.

---

## Content Rules (no shortcuts)

Every chapter produces THREE files:
1. **Presentation** — 12 viewport-locked slides, SVG + CSS animation on every slide, nav bar, Mark Complete
2. **Lab** — Terminal sim OR GUI portal (whichever fits the chapter)
3. **Quiz** — 15 questions, serverGrading:true, balanced A/B/C/D, zero client answers, keys seeded to Firestore

Platform rules:
- FluxCapacitor ONLY in hub page
- AccessGuard first in every file
- No emoji — webp icons only
- Nancy reviews architecture before build
- Nancy reviews build before deploy
- No content dropped, no content merged, no shortcuts

---

## Structure: Two Tracks, Core 1-6 Each

Arduino and ESP32 are SEPARATE tracks with their own Core 1-6. Same learning objectives, different hardware, different code, different capabilities. A student can do one or both.

### Arduino Track — Core 1 through Core 6

| Core | ID | Title | Content | Lab Type |
|------|----|-------|---------|----------|
| 1 | pc-ard-01 | Signal Ignition | Arduino IDE, board tour (Uno/Mega/Nano), ATmega architecture, 5V logic, first sketch (Blink), Serial Monitor | GUI (simulated IDE) |
| 2 | pc-ard-02 | Input Systems | digitalRead, analogRead (10-bit ADC), switches, debounce, pull-up/down, keypads, potentiometers | Terminal |
| 3 | pc-ard-03 | Control Logic | Variables, conditions, loops, functions, state machines, millis() timing, arrays, C/C++ for Arduino | Terminal |
| 4 | pc-ard-04 | Communication | Serial (TX/RX, formatted data, parsing), I2C, SPI, add-on WiFi/BT shields, Arduino-to-Pi serial bridge | Terminal |
| 5 | pc-ard-05 | Automation | Sensors (PIR, ultrasonic, temp, light), LEDs/displays (LCD, OLED, 7-segment), motors (servo, DC, stepper), audio (tone, MIDI) | Terminal |
| 6 | pc-ard-06 | Prototype Ops | Libraries (using, creating), memory management (PROGMEM, EEPROM), hardware internals (timers, bootloader, fuses), Arduino for pentesting (JTAG/UART enumeration) | Terminal |

### ESP32 Track — Core 1 through Core 6

| Core | ID | Title | Content | Lab Type |
|------|----|-------|---------|----------|
| 1 | pc-esp-01 | Signal Ignition | ESP-IDF vs Arduino framework, ESP32 architecture (Xtensa dual-core, RISC-V), 3.3V logic, USB-C, flash partitions, first program | GUI (simulated IDE) |
| 2 | pc-esp-02 | Input Systems | GPIO, touch pins, Hall effect sensor, 12-bit ADC, ULP co-processor, capacitive sensing, deep sleep wake sources | Terminal |
| 3 | pc-esp-03 | Control Logic | FreeRTOS tasks, dual-core task pinning (xTaskCreatePinnedToCore), semaphores, queues, watchdog timers, ISR handling | Terminal |
| 4 | pc-esp-04 | Communication | WiFi (STA/AP modes), BLE (GATT server/client), ESP-NOW (peer-to-peer mesh), MQTT native, HTTP client/server | Terminal |
| 5 | pc-esp-05 | Automation | Web server dashboard, OTA updates, mDNS, SPIFFS/LittleFS file system, TFT display drivers, PWM motor control, deep sleep automation | GUI (simulated web dashboard) |
| 6 | pc-esp-06 | Prototype Ops | Partition tables, NVS flash storage, secure boot, flash encryption, ESP32 for security tools (WiFi deauth detection, BLE scanning), custom firmware deployment | Terminal |

---

## Totals

- **2 tracks x 6 cores = 12 chapters**
- **36 content files** (12 presentations + 12 labs + 12 quizzes)
- **1 hub page + 2 track index pages = 39 total HTML files**
- **12 quiz keys** to seed in Firestore

---

## Hub Design

- **Color:** Arduino teal (#00979D) as primary, ESP32 purple (#a855f7) as secondary track accent
- **Background:** Breadboard grid pattern (subtle, like PiVerse's PCB traces)
- **Hero:** "ProtoCore" title with dual-color gradient (teal → purple), subtitle "Build the Core. Control the System."
- **Alive element:** LED that alternates between teal (Arduino) and purple (ESP32) blink
- **Two track cards** side by side — Arduino Core and ESP32 Core, each with 6-chapter progress
- **Cross-reference panel** linking to Signal Arduino builds (sg-01-05) and ESP32-S3 Arsenal (sg-103-112)

---

## Mission IDs

Following the Codex brainstorm, chapters use PC- prefix:
- Arduino: PC-ARD-01 through PC-ARD-06
- ESP32: PC-ESP-01 through PC-ESP-06

---

## Signal Cross-References

| Signal Build | ProtoCore Theory |
|-------------|-----------------|
| sg-01 Blink & Breadboard | pc-ard-01 Signal Ignition |
| sg-02 Sensor I/O | pc-ard-02 Input Systems + pc-ard-05 Automation |
| sg-03 Serial Bridge | pc-ard-04 Communication |
| sg-04 LCD Dashboard | pc-ard-05 Automation |
| sg-05 Data Logger | pc-ard-04 Communication |
| sg-103 T-Display-S3 Setup | pc-esp-01 Signal Ignition |
| sg-105 WiFi Recon | pc-esp-04 Communication |
| sg-106 BLE Swiss Army | pc-esp-04 Communication |
| sg-111 Custom Army Knife | pc-esp-06 Prototype Ops |

---

## Source Material

| Source | License | Usage |
|--------|---------|-------|
| Arduino Cookbook 3rd Ed (O'Reilly) | All Rights Reserved | Topic reference — derive original content, our words/examples |
| IoT Hacking Arduino guide | Internal | Security angle for Core 6 |
| arduino.cc documentation | CC BY-SA | Can reference freely |
| espressif.com documentation | Apache 2.0 | Can reference freely |
| Signal Foundations guides.js | Ours | Cross-reference targets |

---

## Dependencies

- Signal Arduino builds (sg-01 through sg-05) — already live
- Signal ESP32-S3 Arsenal (sg-103 through sg-112) — already live
- PiVerse Electronics track — covers component theory that ProtoCore can reference
- No new Signal builds needed — all cross-reference targets exist
