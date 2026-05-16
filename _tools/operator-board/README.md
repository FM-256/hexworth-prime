# Operator Board — XIAO 7.5" ePaper Status Display

Wall-mountable status board powered by a Seeed XIAO ESP32S3 + 7.5" e-paper panel.
Pulls a server-rendered PNG from the `operatorBoard` Cloud Function every ~15
minutes and displays it.

**Phase 1 (Hello World):** server returns a static "Hexworth Operator Board v0.1"
image. Proves the full pipeline — WiFi connect → HTTPS GET → e-paper render →
deep sleep. No real data yet.

**Phase 2 (later):** server reads `_quality_reports/latest`, runtime monitor
state, deploy state, EduScan critical count and composes a real status image.

## Architecture

```
┌──────────────────────────────────────────────────────────────┐
│ XIAO ESP32S3 + 7.5" ePaper Panel                             │
│   1. Wake from deep sleep (every 15 min)                     │
│   2. Connect to WiFi (creds from secrets.h)                  │
│   3. HTTPS GET https://<region>-hexworth-prime.cloudfunctions │
│      .net/operatorBoard                                      │
│   4. Decode PNG → render to GxEPD2_750_T7                    │
│   5. Deep sleep                                              │
└──────────────────────────────────────────────────────────────┘
                              ↑
                              │ HTTPS GET, ~80 KB PNG
                              │
┌──────────────────────────────────────────────────────────────┐
│ Cloud Function: operatorBoard                                │
│   functions/operator-board.js                                │
│   Phase 1: reads functions/assets/operator-board.png         │
│   Phase 2: composes image from Firestore data               │
│   Returns: image/png, Cache-Control: no-cache               │
└──────────────────────────────────────────────────────────────┘
```

## Layout

```
_tools/operator-board/
├── README.md                         (this file)
├── firmware/                         (PlatformIO project — tracked with git add -f)
│   ├── platformio.ini
│   ├── src/main.cpp
│   ├── include/secrets.h.example     (template; real secrets.h gitignored)
│   └── .gitignore
└── server/
    ├── generate_image.py             (Pillow script; produces Phase 1 PNG)
    └── operator-board.png            (generated artifact — copy into functions/assets/)
```

## Hardware

| Component | Spec | Notes |
|---|---|---|
| MCU | Seeed XIAO ESP32S3 | 240 MHz, 8 MB PSRAM, WiFi 802.11 b/g/n (2.4 GHz only) |
| Display | Waveshare 7.5" V2 ePaper | 800×480, monochrome, ~3–5s full refresh |
| USB | Native CDC | Shows as `/dev/ttyACM0` on bc1 |
| Power | USB-C | Deep sleep current ~10 µA |

## Build & flash (Phase 1)

All commands run on **bc1** where the device is connected.

```bash
# One-time: install PlatformIO
pip install --user platformio

# Copy/sync firmware/ folder to bc1 (via Syncthing or scp)
# Then on bc1:

cd ~/hexworth/operator-board/firmware
cp include/secrets.h.example include/secrets.h
$EDITOR include/secrets.h    # fill in WIFI_SSID, WIFI_PASSWORD, BOARD_URL

pio run -t upload --upload-port /dev/ttyACM0
pio device monitor --port /dev/ttyACM0    # watch boot logs
```

## Cloud Function deploy

```bash
# From repo root:
_tools/eduscan/smoke/deploy.sh --only functions
```

## Verify

1. Cloud Function reachable: `curl -o /tmp/test.png https://<region>-hexworth-prime.cloudfunctions.net/operatorBoard`
2. Device boots, connects WiFi, fetches image (check serial monitor).
3. E-paper shows "Hexworth Operator Board v0.1".

## Known unknowns (Phase 1)

- **Panel driver.** Code assumes `GxEPD2_750_T7` (Waveshare 7.5" V2, 800×480 monochrome). If the demo image was a different resolution or showed color, the driver constant needs adjustment.
- **WiFi network.** Device only supports 2.4 GHz. 5 GHz–only networks will fail.
- **Refresh cadence.** Fixed at 15 min for Phase 1. Make configurable later.
