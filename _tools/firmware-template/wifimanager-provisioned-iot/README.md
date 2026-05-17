# WiFiManager-Provisioned IoT Firmware Template

A copy-paste starting point for any ESP32 device that needs zero-touch
WiFi provisioning via a captive-portal AP. Implements the pattern
documented in **KBA #6 "WiFiManager Captive-Portal Provisioning
Pattern"** (Confluence page 14188547).

## What it gives you

- WiFi credentials and a device identity stored in NVS (survives
  reboots, survives OTA, survives power loss).
- Captive-portal AP on first boot — anyone with a phone can pair the
  device without USB access or a known WiFi password.
- One-time migration path from compile-time `secrets.h` for already-
  deployed devices upgrading to this pattern.
- Factory-reset gesture: hold BOOT for >5 seconds during boot to wipe
  NVS and re-enter the portal.
- Empty `doAppWork()` hook where you drop your project's actual
  behavior (HTTPS fetch, MQTT publish, sensor read, etc.).

## How to use

1. **Copy the directory** somewhere outside `_tools/` (or fork it as
   the starting point of a new PlatformIO project).

2. **Edit `platformio.ini`** — three board profiles are pre-canned
   (XIAO ESP32-C3, XIAO ESP32-S3, generic ESP32 DevKit). Uncomment
   the one you need, delete the rest. Rename `[env:xiao_esp32c3]` to
   `[env:<your-project-name>]` if you prefer.

3. **Customize `src/main.cpp`** at the `TODO(app)` markers:
   - `#include` your app-specific hardware libraries
   - Replace `renderSetupScreen()` with your hardware's UI for setup
     mode (e-paper text, OLED message, LED pattern, buzzer chime —
     pick whatever signals "I'm waiting to be paired")
   - Initialize your hardware in `setup()` before the credential load
   - Implement the polling-cycle work in `doAppWork()`

4. **Optional: pre-load credentials.** Copy `include/secrets.h.example`
   to `include/secrets.h` and uncomment any of the `#define`s. These
   are read once on first boot and migrated into NVS; from then on,
   the device uses NVS and ignores `secrets.h`.

5. **Build and flash.** Standard PlatformIO workflow:
   ```bash
   pio run
   pio run -t upload --upload-port /dev/ttyACM0
   ```

6. **First boot:** the device opens an AP named `HexworthDevice-XXXX`
   (last 4 hex of the MAC). Connect from your phone, fill in the
   captive-portal form (your WiFi + a Device ID), submit. Device
   saves, reboots, and joins your WiFi.

## What's already done for you

The provisioning code is feature-complete. You should not need to
edit anything outside the `TODO(app)` markers. Read KBA #6 for the
rationale behind each block before deciding to change it.

## Pin and hardware caveats

- **BOOT button on GPIO9** — true for Seeed XIAO ESP32-C3 and most
  modern ESP32 dev boards. On older modules (ESP32-WROOM, ESP-WROVER)
  BOOT may be on GPIO0 and / or be physically wired to the bootloader-
  flash circuit such that a long-hold during boot triggers download
  mode rather than running your code. Test on your specific hardware
  before relying on the factory-reset gesture.
- **NVS partition** — `huge_app.csv` is set as the partition table to
  give you headroom. If your app fits in the default partition,
  switching back is fine.
- **WiFiManager library** — pinned to `^2.0.17`. Older versions had
  API drift in `addParameter` and `setConfigPortalTimeout`.

## What's not in the template

- **No OTA.** Production fleets should add OTA before scaling up to
  more than a few devices. ArduinoOTA, HTTP OTA, and the esp_ota_ops
  API are all good options.
- **No NVS encryption.** Credentials are plaintext. If your threat
  model includes physical-flash extraction, enable NVS encryption
  with an eFuse-bound key.
- **No pairing-code validation.** The captive portal accepts whoever
  connects to the AP. For untrusted environments, validate a one-
  time pairing code against a Cloud Function before saving credentials.

These extensions are tracked as separate Hexworth improvements.

## Reference implementation

The first production user of this pattern is the **ePaper Boards**
firmware at `_tools/operator-board/firmware/`. That code has more
moving parts (e-paper rendering, PNG decode, image fetch loop), but
the provisioning sections are identical to this template — line-for-
line, by intent.

## Confluence reference

- **KBA #6 — WiFiManager Captive-Portal Provisioning Pattern** (14188547)
- **KBA #1 — ePaper Boards System** (14811138) — production-deployed example
