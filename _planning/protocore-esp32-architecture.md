# ProtoCore ESP32 Track Architecture

**Status:** PLANNING — Nancy review required
**Location:** `_app/houses/matrix/protocore/esp32/`
**Parent hub:** ProtoCore
**Theme:** Electric blue (#0088ff) + lightning yellow (#ffd700) — same as Arduino track

---

## Why ESP32 is NOT Arduino with WiFi

Arduino = single-core ATmega, no OS, no WiFi, 5V logic, shields for everything.
ESP32 = dual-core Xtensa with FreeRTOS, native WiFi+BLE, 3.3V, deep sleep, secure boot.

They share the Arduino IDE as a possible development tool, but the architecture, capabilities, and programming paradigms are fundamentally different. A student who knows Arduino is NOT automatically prepared for ESP32.

---

## Content Rules (same as Arduino track)

Every core produces THREE files:
1. **Presentation** — 12 viewport-locked slides, SVG + CSS animation
2. **Lab** — Terminal sim OR GUI portal
3. **Quiz** — 15 questions, serverGrading:true, balanced A/B/C/D

No FluxCapacitor in content pages. AccessGuard first. No emoji. Nancy reviews before build.

---

## Source Material

| Source | License | Notes |
|--------|---------|-------|
| Espressif ESP-IDF Programming Guide | Apache 2.0 | Official framework docs |
| Espressif ESP32 Technical Reference Manual | Free | Hardware-level reference |
| arduino-esp32 core documentation | LGPL 2.1 | Arduino framework for ESP32 |
| Random Nerd Tutorials (community) | Reference only | Popular ESP32 tutorial site |
| Signal ESP32-S3 Arsenal guides.js | Ours | Cross-reference for builds |

All Espressif documentation is freely available and permissively licensed. No commercial textbook dependency.

---

## ESP32 Track — Natural Core Mapping

The content defines the structure. Each core teaches ONE focused concept that ESP32 does differently from Arduino or that Arduino can't do at all.

### Core 1: Meet the ESP32
- ESP32 chip family (ESP32, S2, S3, C3, C6, H2 — what's different)
- Xtensa LX6 dual-core architecture vs Arduino's single-core ATmega
- Development boards (DevKit V1, WROOM, WROVER, LILYGO T-Display)
- 3.3V logic (not 5V like Arduino — level shifting matters)
- Two frameworks: ESP-IDF (native) vs Arduino-ESP32 (familiar but limited)
- Board Manager setup in Arduino IDE + ESP-IDF install
- First program: blink + Serial output
- Lab: GUI (simulated IDE with board selection)

### Core 2: GPIO and Peripherals
- GPIO matrix (almost any pin can be any function — unlike Arduino's fixed pin map)
- Digital I/O, pull-up/pull-down
- Touch pins (capacitive sensing without external hardware)
- Hall effect sensor (built-in magnetic field detection)
- 12-bit ADC (4096 levels vs Arduino's 1024) — but non-linear, needs calibration
- DAC output (2 channels on original ESP32)
- PWM via LEDC peripheral (configurable frequency + resolution)
- Lab: Terminal

### Core 3: WiFi Fundamentals
- 802.11 b/g/n, 2.4 GHz
- Station mode (STA) — connect to existing WiFi
- Access Point mode (AP) — create a hotspot
- STA+AP simultaneous mode
- WiFi scanning (SSID, RSSI, channel, encryption type)
- WiFi events and reconnection handling
- Static IP vs DHCP
- WiFi security (WPA2-PSK, WPA3, open networks)
- Lab: Terminal (scan, connect, verify)

### Core 4: Bluetooth (Classic + BLE)
- Bluetooth Classic (SPP — serial port profile)
- BLE concepts (GATT, services, characteristics, descriptors)
- BLE server (advertise, create service, expose characteristics)
- BLE client (scan, connect, read/write characteristics)
- BLE notifications and indications
- BLE vs Classic (when to use which)
- BLE security (pairing, bonding)
- Lab: Terminal (BLE advertise, GATT service)

### Core 5: HTTP and Web Servers
- ESP32 as HTTP client (GET, POST, JSON parsing)
- ESP32 as web server (serve HTML, handle routes)
- Serving dynamic pages (sensor data in HTML)
- Handling form submissions (POST data parsing)
- HTTPS/TLS (secure connections, certificate pinning)
- WebSocket for real-time bidirectional communication
- mDNS (access via hostname instead of IP)
- Lab: GUI (simulated web dashboard)

### Core 6: MQTT and IoT Protocols
- MQTT fundamentals (broker, topics, publish, subscribe, QoS)
- Connecting to Mosquitto, HiveMQ, AWS IoT
- Publishing sensor data to topics
- Subscribing and reacting to commands
- Last Will and Testament (LWT)
- Retained messages
- MQTT over TLS
- ESP32 as an IoT edge device pattern
- Lab: GUI (simulated MQTT dashboard)

### Core 7: FreeRTOS Fundamentals
- What is an RTOS (real-time operating system)
- Tasks (xTaskCreate, vTaskDelete)
- Dual-core task pinning (xTaskCreatePinnedToCore — Core 0 vs Core 1)
- Task priorities and scheduling
- Delays (vTaskDelay vs busy-wait)
- Why Arduino's loop() is actually a FreeRTOS task
- Lab: Terminal

### Core 8: FreeRTOS Synchronization
- Semaphores (binary, counting, mutex)
- Queues (inter-task communication)
- Event groups (multi-bit flag synchronization)
- Task notifications (lightweight alternative to semaphores)
- Deadlock and priority inversion (what can go wrong)
- Watchdog timers (task and interrupt WDT)
- Lab: Terminal

### Core 9: ESP-NOW Mesh Networking
- What is ESP-NOW (peer-to-peer, no WiFi infrastructure needed)
- Broadcast vs unicast
- Registering peers (MAC addresses)
- Sending and receiving data structures
- Multi-node mesh (A talks to B, B talks to C)
- ESP-NOW + WiFi simultaneously
- Range and reliability
- Use cases (sensor networks, remote controls, distributed systems)
- Lab: Terminal (simulated mesh communication)

### Core 10: Deep Sleep and Power Management
- Sleep modes (light sleep, deep sleep, hibernation)
- Wake sources (timer, touch, external GPIO, ULP)
- ULP co-processor (runs during deep sleep, monitors sensors)
- RTC memory (persists across deep sleep cycles)
- Current consumption in each mode (mA → uA)
- Battery-powered project design
- Solar + deep sleep patterns
- Lab: Terminal

### Core 11: Storage and File Systems
- Flash partitions (app, data, OTA, NVS, SPIFFS, LittleFS)
- Partition table (custom layouts)
- NVS (Non-Volatile Storage) — key-value store for settings
- SPIFFS / LittleFS (file systems for web assets, configs, logs)
- SD card via SPI
- Preferences library (Arduino framework)
- OTA updates (over-the-air firmware flashing)
- Lab: Terminal

### Core 12: Security
- Secure boot (verified boot chain)
- Flash encryption (protect firmware from extraction)
- HTTPS with certificate verification
- MQTT over TLS
- WiFi enterprise (WPA2-Enterprise, EAP-TLS)
- ESP32 as a security tool (WiFi scanning, BLE reconnaissance, packet capture)
- Comparison with Signal ESP32-S3 Arsenal projects
- Lab: Terminal

### Core 13: Displays and User Interfaces
- SPI TFT displays (ST7789, ILI9341, GC9A01 round)
- I2C OLED (SSD1306)
- TFT_eSPI library, LVGL framework
- Touch input (capacitive touch screens, resistive)
- Building a dashboard UI on ESP32
- T-Display boards (built-in screen + ESP32)
- Lab: GUI (simulated display)

### Core 14: Sensors and Actuators
- I2C sensors (BME280, MPU6050, BH1750)
- SPI sensors (MAX6675 thermocouple)
- OneWire (DS18B20 temperature)
- Servo and motor control via LEDC/MCPWM
- NeoPixel/WS2812B addressable LEDs
- Interrupt-driven sensor reading
- Lab: GUI (simulated sensor dashboard)

### Core 15: Advanced Networking
- ESP32 as a WiFi sniffer (promiscuous mode, raw 802.11 frames)
- Packet injection concepts
- WiFi deauthentication detection (defensive)
- DNS server (captive portal)
- TCP/UDP raw sockets
- Multicast and broadcast
- Lab: Terminal

### Core 16: The ESP32 Variant Guide
- ESP32 (original) — Xtensa LX6 dual-core, WiFi+BT Classic+BLE
- ESP32-S2 — Xtensa LX7 single-core, WiFi only, native USB, no BT
- ESP32-S3 — Xtensa LX7 dual-core, WiFi+BLE5, native USB, AI acceleration
- ESP32-C3 — RISC-V single-core, WiFi+BLE5, low cost
- ESP32-C6 — RISC-V, WiFi 6, BLE5, Thread/Zigbee
- ESP32-H2 — RISC-V, Thread/Zigbee only (no WiFi)
- Choosing the right chip for your project
- Lab: GUI (interactive chip comparison tool)

---

## Totals

- 16 cores x 3 files = **48 content files**
- 1 track index page
- Hub page already exists (ProtoCore index.html — just needs ESP32 track unlocked)
- **49 new files total**
- 16 quiz keys to seed

---

## Signal Cross-References

| Signal Build | ProtoCore ESP32 Theory |
|-------------|----------------------|
| sg-103 T-Display-S3 Setup | Core 1: Meet the ESP32 |
| sg-105 WiFi Recon Scanner | Core 3: WiFi + Core 15: Advanced Networking |
| sg-106 BLE Swiss Army | Core 4: Bluetooth |
| sg-107 USB Mass Storage | Core 11: Storage |
| sg-108 Network Impersonation | Core 5: HTTP + Core 15: Advanced Networking |
| sg-109 WiFi Deauther Detector | Core 15: Advanced Networking |
| sg-110 Marauder Firmware | Core 12: Security + Core 15: Networking |
| sg-111 Custom Army Knife | Core 12: Security (capstone) |
| sg-112 Defense Lab | Core 12: Security |

---

## Prerequisites

- Core 1 (Meet the ESP32): No prerequisite — entry point. Students should know basic C/C++ (Arduino Core 2-3 recommended but not required — Core 1 includes a programming primer)
- Core 7 (FreeRTOS): Core 1-2 required. This is where ESP32 diverges hardest from Arduino.
- Core 9 (ESP-NOW): Core 3 (WiFi) recommended
- Core 12 (Security): Core 3 (WiFi) + Core 4 (BLE) + Core 11 (Storage) required
- Core 15 (Advanced Networking): Core 3 (WiFi) + Core 5 (HTTP) required
- All other cores: Core 1 + Core 2 as foundation

---

## Implementation Sequence

1. Core 1-2 (foundations)
2. Core 3-4 (connectivity — WiFi + BLE)
3. Core 5-6 (protocols — HTTP + MQTT)
4. Core 7-8 (FreeRTOS)
5. Core 9-10 (ESP-NOW + power management)
6. Core 11-12 (storage + security)
7. Core 13-14 (displays + sensors)
8. Core 15-16 (advanced networking + variant guide)
