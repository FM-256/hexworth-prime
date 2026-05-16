# Operator Board — XIAO 7.5" ePaper Classroom-Door Display

Wall-mountable e-paper display for outside Room 214. Shows today's class
schedule, highlights the active course, and advertises open lab hours.

Powered by a **Seeed XIAO ESP32-C3** + the Seeed 7.5" ePaper Panel kit.
Polls a Cloud Function every 15 minutes and renders the returned PNG.

**Phase 1 (Hello World) — shipped.** Static "Hexworth Operator Board v0.1"
image served from the CF. Proved the full pipeline.

**Phase 2 (Classroom schedule) — shipped.** CF composes SVG dynamically
per request, rasterizes to a 1-bit 800×480 PNG via `sharp`, and returns
it. Day-aware: today's course panel inverts (black bg / TODAY badge);
Fri/Sat/Sun shows both panels neutral with a "Next class: <day>" footer.

## Schedule shown

| | |
|---|---|
| **Mon · Wed** | CIS4253 Ethics in IT, 6:00–9:00 PM, Room 214 |
| **Tue · Thu** | CIS2350C Principles of Information Security, 6:00–9:00 PM, Room 214 |
| **Daily** | OPEN LAB, 3:00–5:00 PM (inverted bar between panels and footer) |
| Instructor | Professor Frank Mora, MCSIA |

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│ XIAO ESP32-C3 + Seeed 7.5" ePaper Panel                      │
│   1. Boot, connect WiFi (creds from secrets.h)               │
│   2. HTTPS GET .../operatorBoard                             │
│   3. Decode PNG → render via GxEPD2_750_T7                   │
│   4. Dev mode: stay awake + idle heartbeat                   │
│      Prod mode (future): deep_sleep REFRESH_MINUTES          │
└──────────────────────────────────────────────────────────────┘
                              ↑
                              │ HTTPS GET, ~5 KB PNG
                              │
┌──────────────────────────────────────────────────────────────┐
│ Cloud Function: operatorBoard  (functions/operator-board.js) │
│   1. Read current time in America/New_York                   │
│   2. Determine today's course (Mon/Wed → ETH, Tue/Thu → PIS, │
│      Fri/Sat/Sun → no class)                                 │
│   3. Build SVG with header / two course panels / Open Lab    │
│      bar / footer; invert today's panel                      │
│   4. sharp → 800×480 1-bit PNG                               │
│   5. Return image/png, Cache-Control: no-store               │
└──────────────────────────────────────────────────────────────┘
```

## Layout

```
┌──────────────────────────────────────────────────────────────┐
│ HEXWORTH PRIME                              <Day>            │
│ CLASSROOM SCHEDULE · Room 214               <Date>           │
├──────────────────────────────┬───────────────────────────────┤
│       CIS4253                │      CIS2350C                 │
│       ETHICS IN IT           │      PRINCIPLES OF INFOSEC    │
│       Mondays · Wednesdays   │      Tuesdays · Thursdays     │
│       6:00 – 9:00 PM         │      6:00 – 9:00 PM           │
│       (← TODAY if Mon/Wed)   │      (← TODAY if Tue/Thu)     │
├──────────────────────────────┴───────────────────────────────┤
│           OPEN LAB  ·  3:00 – 5:00 PM                        │
├──────────────────────────────────────────────────────────────┤
│ <footer: instructor + room OR "Next class: ..." on no-class> │
│ Generated HH:MM · refresh every 15 minutes                   │
└──────────────────────────────────────────────────────────────┘
```

## Files

```
_tools/operator-board/
├── README.md                         (this file)
├── firmware/                         (PlatformIO project — git add -f'd)
│   ├── platformio.ini                (env: xiao_esp32c3)
│   ├── src/main.cpp                  (WiFi → HTTPS → PNG → render)
│   ├── include/secrets.h.example     (template; real secrets.h gitignored)
│   └── .gitignore
└── server/
    └── generate_image.py             (Phase 1 Pillow Hello World generator;
                                       retained for static-image regression)

functions/
├── operator-board.js                 (Phase 2 CF — SVG + sharp + day logic)
├── assets/operator-board.png         (Phase 1 static image, unreferenced
                                       by Phase 2 but kept as artifact)
└── package.json                      (adds: sharp ^0.33.5)
```

## Hardware

| Component | Spec | Notes |
|---|---|---|
| MCU | Seeed XIAO ESP32-C3 | 160 MHz RISC-V, 400 KB SRAM, 4 MB flash, WiFi 2.4 GHz only |
| Display | Seeed 7.5" ePaper Panel | 800×480 monochrome, ~5.5s full refresh |
| USB | Native CDC (303a:1001) | `/dev/ttyACM0` on bc1 |
| Power | USB-C | (Deep sleep ~10 µA — disabled in dev mode) |

## Pin config (Seeed ePaper Driver Board)

Verified against `Seeed_GFX/User_Setups/EPaper_Board_Pins_Setups.h`
(`USE_XIAO_EPAPER_DRIVER_BOARD` block):

| Signal | Silkscreen | GPIO |
|---|---|---|
| RST | D0 | 2 |
| CS | D1 | 3 |
| BUSY | D2 | 4 |
| DC | D3 | 5 |
| SCK | D8 | 8 (default SPI) |
| MOSI | D10 | 10 (default SPI) |

## Build & flash (from bc1)

The XIAO is connected to bc1; bc1 has PlatformIO installed at
`~/.local/bin/pio`. PlatformIO cache and project both live on
`/data/hexworth/` (the / root is currently full — separate bc1 issue).

```bash
# One-time: install PlatformIO (already done on bc1)
pip install --user --break-system-packages platformio

# eq1 must be in dialout group to open /dev/ttyACM0 (already done)
sudo usermod -aG dialout eq1

# Build
export PATH=$HOME/.local/bin:$PATH
export TMPDIR=/data/hexworth/tmp
cd /data/hexworth/operator-board/firmware
pio run -e xiao_esp32c3

# Upload — if firmware is misbehaving and USB drops, use the fast-flash
# watcher at /tmp/operator-board-fastflash.sh (esptool direct, no rebuild)
pio run -e xiao_esp32c3 -t upload --upload-port /dev/ttyACM0
```

## Cloud Function deploy

```bash
# From repo root (master branch only):
_tools/eduscan/smoke/deploy.sh --only functions
```

## Iteration loop

1. Edit `functions/operator-board.js`.
2. Deploy CF.
3. Hit `https://us-central1-hexworth-prime.cloudfunctions.net/operatorBoard`
   in a browser — see the new image immediately.
4. To push to the device without waiting 15 min, reset via DTR pulse:
   ```bash
   ssh bc1 'python3 /tmp/reset-and-capture.py'
   ```
   Captures the boot + cycle so you can see WiFi/fetch/render timing.

## Dev mode quirks (current state)

- **No deep_sleep.** USB stays up forever so we can monitor + re-flash.
  See `feedback_no_deep_sleep_during_dev` memory. Re-enable for prod
  later behind a `-D PRODUCTION_DEEP_SLEEP` flag.
- **WiFi cert verification disabled.** `client.setInsecure()` skips
  TLS cert check. Acceptable for Phase 2 since the CF doesn't return
  sensitive data. Pin Google's root CA before adding sensitive content.

## Phase 3 (not built yet)

- Per-day topic / week-number / agenda field (read from Firestore
  `_quality_reports/` or a dedicated `classroom-state/` doc).
- Operator UI to push ad-hoc messages ("class cancelled today",
  "exam at 7pm", etc.) without a code change.
- Battery + housing.
- OTA firmware updates (currently must flash from bc1).
