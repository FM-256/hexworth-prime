# Web Flasher Hardware Smoke — Test Plan (2026-05-17)

Operator-driven end-to-end validation of the four `flasherMode` paths against real silicon. Software side is verified (28/28 server smoke + FIRM-001 schema clean + EduScan clean); this is the final layer.

**Pre-requisites (operator):**

- Chrome or Edge on a desktop / laptop, plugged in to the internet
- USB-C data cable (not charge-only)
- One ESP32 DevKit V1 (38-pin, CP2102 USB-C)
- One Seeed XIAO ESP32-C3 (USB-C, no on-board user LED)
- One Seeed XIAO ESP32-S3 (USB-C, GPIO21 user LED)
- One Raspberry Pi Pico (standard, RP2040; OPTIONAL: Pico W or Pico 2)
- One Arduino Mega 2560 R3
- One Raspberry Pi 3 / 4 / 5 + SD card (or USB drive) + power supply
- A spare phone for the captive-portal handoff during ESP32 first-boot
- Optional: serial monitor (`pio device monitor -b 115200 -p /dev/ttyUSB0`) so you can capture the device's boot trace

## Round 1 — webserial-esp32, ESP32 DevKit V1

1. Open `https://hexworth.com/signal/toolkit/web-flasher.html` in Chrome.
2. Sign in (so the pairing-code claim path is exercised). Note your test uid in the browser console: `FirebaseAuth.getUser().uid`.
3. In the picker, click **Hexworth C2 Device Firmware (ESP32 DevKit V1)**. The Connect button should be enabled (status: ready, not pending).
4. Plug the ESP32 over USB. Click **Connect over USB**. Choose the device in the port chooser.
   - PASS criteria: log shows `Detected chip: ESP32`. Status pill flips to green `connected · ESP32`.
5. Click **Flash device**. Watch the progress bar.
   - PASS criteria: 0% → 100% smoothly, log shows `Flash complete. Resetting device…`, status pill flips to green `done`.
6. Device should reset and broadcast `HexworthDevice-XXXX` (XXXX is the MAC tail). Confirm the AP appears in your phone's WiFi list within ~10s.
7. Click **Claim pairing code**. Code appears in the post-flash panel.
   - PASS criteria: code shape `HEX-PAIR-XXXXXX`; expiry ~30 min from now.
8. On phone, join `HexworthDevice-XXXX`, get the captive portal, enter home WiFi + paste the pairing code. Submit.
9. Device reboots. Within ~30s it should check in to the C2 backend.
10. Open `https://hexworth.com/signal/toolkit/my-devices.html`. Refresh.
    - PASS criteria: the device appears in the table with status `new` (then `online` after the first heartbeat). ownerUid matches your uid.
11. Click **Decommission** on the row. Confirm the dialog. Page refreshes.
    - PASS criteria: device no longer appears in the table. (The physical device will get HTTP 404 on its next check-in and effectively go offline.)

## Round 2 — webserial-esp32, XIAO ESP32-C3

Same as Round 1 but pick **Hexworth C2 Device Firmware (XIAO ESP32-C3)**. The XIAO C3:
- Uses native USB-CDC (not CP2102). May not need any driver install.
- BOOT button is at GPIO 9, not GPIO 0. Factory-reset gesture is BOOT-hold 5s on power-on.
- No on-board user LED — the blink capability will appear to do nothing visible. That's expected.

**PASS criteria extras vs Round 1:**
- Chip family in connect log shows `ESP32-C3` (RISC-V), not `ESP32`.
- Bootloader offset on flash is 0x0 (manifest field), not 0x1000. This is invisible to the operator but verifies the chip-family-specific manifest entries work.

## Round 3 — webserial-esp32, XIAO ESP32-S3

Same as Round 1 but pick **Hexworth C2 Device Firmware (XIAO ESP32-S3)**. The XIAO S3:
- Uses native USB-OTG. May not need any driver install.
- BOOT button is at GPIO 0. LED at GPIO 21 (on-board, visible).
- Bootloader offset 0x0 (same as C3).

**PASS criteria extras vs Round 1:**
- Chip family in connect log shows `ESP32-S3`.
- After flash, dispatch `blink` via the admin C2 dashboard — the GPIO 21 LED should flash visibly.

## Round 4 — external-download, Raspberry Pi Pico

1. Open the flasher in any browser (Safari/Firefox work for this mode).
2. Pick **MicroPython for Raspberry Pi Pico** (or **CircuitPython for Raspberry Pi Pico**).
3. Download panel shows BOOTSEL instructions + download button.
4. Click **Download MicroPython UF2** (or CircuitPython UF2). Browser saves `firmware.uf2`.
5. Unplug Pico. Hold BOOTSEL. While holding, plug Pico in.
6. New USB drive `RPI-RP2` appears. Drag the downloaded UF2 onto it.
7. Drive ejects automatically. Pico reboots into MicroPython (or CIRCUITPY drive for CircuitPython).
   - PASS criteria: drive disappears within ~5s of drop; new behavior visible per the chosen firmware (for MicroPython, install Thonny and connect; for CircuitPython, a `CIRCUITPY` drive appears).

## Round 5 — external-editor, Arduino Mega 2560

1. Open the flasher. Pick **Hexworth Blink — Arduino Mega 2560**.
2. Editor panel shows two paths.
3. Click **Install Arduino IDE** (or **Use Arduino Web Editor**).
4. Click **Download blink.ino**. Browser saves the sketch.
5. Open the IDE / Web Editor, load blink.ino, select Arduino Mega 2560 board + port, click Upload.
   - PASS criteria: upload succeeds within ~30s. On-board LED next to pin 13 blinks at 1 Hz. Serial Monitor at 115200 baud shows `LED on` / `LED off`.

## Round 6 — disk-image, Raspberry Pi 4

1. Open the flasher. Pick **Raspberry Pi OS (Pi 3 / 4 / 5)**.
2. Disk-image panel shows summary + buttons.
3. Click **Open Hexworth walkthrough →**. New page `/signal/toolkit/install-pi-os.html` opens.
4. Walkthrough lists 5 steps. Click the Imager download link, install Imager.
5. Follow the pre-config dialog (hostname, SSH, WiFi). Write to SD card.
6. Insert SD into Pi 4, power on. Wait ~90s.
7. From your computer: `ssh user@<hostname>.local` (or IP from router admin).
   - PASS criteria: SSH connection succeeds; you reach a Linux prompt.

## After each round — telemetry verification (operator + admin)

Round 1 (and any sign-in-and-flash round) writes anonymous telemetry events to Firestore `web_flasher_telemetry/{auto-id}`. After the smoke:

```
# In the Firebase console, run on the web_flasher_telemetry collection:
# - query by event ==  "page_load" → expect ≥ 1 row per round
# - query by event ==  "flash_success" → expect rows for the rounds you successfully flashed
# - query by event ==  "flash_fail" → expect 0 rows (if any, the smoke caught a regression)
```

## After all rounds — close the loop

- Update [`web-flasher-runbook.md`](web-flasher-runbook.md) with any failure modes you actually saw, with the exact text of the browser/serial error so future students can search-match.
- Update [project_web_flasher_shipped.md](../../) memory: change "Hardware smoke not yet done" to "Hardware smoke COMPLETE on 2026-05-17 / <date>: <results summary>".
- Bump KBA #12 to v3 on Confluence with a "Verified on real hardware" note.

## Failure escalation

If any PASS criterion fails:
1. Capture: serial monitor output (`pio device monitor` ran during the test), Chrome devtools console, exact error text.
2. Drop it into the runbook (`web-flasher-runbook.md`) under the matching bucket.
3. File a finding via `nexus firmware-manifest --json` to confirm the manifest schema is not the cause.
4. If the issue is in esptool-js, the runbook lists the upstream issue tracker.
