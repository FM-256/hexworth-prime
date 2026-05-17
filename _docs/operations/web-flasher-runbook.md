# Web Flasher — Failure-Mode Runbook

Triage guide for "I tried to flash my ESP32 and it didn't work."

This runbook complements the feature documentation in [`_docs/features/WEB_FLASHER.md`](../features/WEB_FLASHER.md) and the server-side smoke at `functions/_smoke_web_flasher_cf.js`.

## Step 0: classify the failure

Ask the student where in the flow they got stuck. The error mode usually narrows it to one of the buckets below.

| Symptom | Bucket | First check |
|---|---|---|
| "The Connect button is greyed out" | Browser support | `navigator.serial` feature detect |
| "Connect opens the port chooser but nothing appears" | Driver / cable | CP2102 driver, USB-data cable |
| "Connect picks the port but fails at 'Detected chip'" | esptool-js handshake | board reset wiring, baud rate |
| "Flashing reaches X% then errors out" | Bin / offset / serial drop | manifest sha256, offsets, USB stability |
| "Flash succeeded but no `HexworthDevice-XXXX` AP appears" | Firmware boot crash | serial monitor, partition table, secrets.h |
| "Pairing code claim returns 400/permission-denied" | Auth / rate limit | sign-in state, `student_pairing_state` doc |
| "Device registers but doesn't appear in My Devices" | Firestore rule / query | `ownerUid` field on the device doc |

## Bucket 1 — Browser support

The flasher feature-detects `navigator.serial` on load. If missing, the warning panel shows and Connect stays disabled.

**Supported:** Chrome 89+, Edge 89+, Opera 76+ — desktop only.
**Not supported:** Safari, Firefox (WebSerial behind a flag, not stable), all mobile browsers.

If the student is on a supported browser and still sees the warning, check that they are loading over HTTPS — WebSerial requires a secure context.

## Bucket 2 — Driver / cable

The ESP32 DevKit V1 uses a CP2102 USB-to-UART bridge. macOS 11+ and Linux ship the driver in-kernel. Windows may need the [Silicon Labs CP210x VCP driver](https://www.silabs.com/developers/usb-to-uart-bridge-vcp-drivers).

USB cable: must be a data cable, not charge-only. The student should see `Hexworth ... CP2102` (or similar manufacturer string) in the WebSerial port chooser. If they see nothing, the cable is the most likely culprit.

To confirm enumeration outside the browser:

```bash
# macOS
ls /dev/cu.SLAB_USBtoUART /dev/cu.usbserial-*

# Linux
dmesg | tail -5    # look for cp210x or ttyUSB
ls /dev/ttyUSB*

# Windows
Get-PnpDevice -Class Ports
```

If enumeration works at the OS but the browser chooser is empty, restart the browser. Chrome caches port grants per origin; revoking access in `chrome://settings/content/serialPorts` and reloading is occasionally needed after a USB chip change.

## Bucket 3 — esptool-js handshake fails

After WebSerial gives us the port, esptool-js sends the ROM handshake (DTR/RTS toggling, then `0x07 0x07 0x12 0x20`). On the DevKit V1 this puts the chip into download mode and returns the chip family string.

Common failure: the board is held in run mode because of an unusual `EN`/`BOOT` wiring on a knock-off board. Workaround: have the student hold BOOT while clicking Connect.

If the chip detects then dies, the wall-supply current is the next suspect — laptop USB ports can sag under WiFi-radio inrush on cheaper boards. Try a powered hub.

## Bucket 4 — Bin / offset / mid-flash drop

The flasher computes sha256 on each fetched bin before writing. A `sha256 mismatch` error in the log means transit corruption or a stale manifest. Repair:

1. Re-deploy hosting (`./deploy.sh`). The bin file or manifest may be stale on the CDN cache.
2. Confirm the manifest on hexworth.com matches the repo:
   ```bash
   curl -s https://hexworth.com/signal/firmware-bins/c2-device/v0.2/manifest.json | jq '.files[].sha256'
   ```
   ...against the same fields in `_app/signal/firmware-bins/c2-device/v0.2/manifest.json`.

A `failed to flash file X at address Y` error usually means the bin was produced for a different chip family than the one we detected, or the partition table is wrong. Both manifests today target `chipFamily: ESP32` with offsets `0x1000` / `0x8000` / `0x10000` — standard for ESP32 (not -S2, -C3, -S3, or -H2).

A clean failure mid-flash (e.g. "Timeout reading register") means the USB serial dropped. Have the student retry; if it persists, swap cables or move to a different USB port (ideally USB 2.0 on the back of a desktop, not a hub).

## Bucket 5 — Firmware boots but no AP

Sequence after a clean flash:

1. Device resets (esptool `after()`).
2. `setup()` initializes serial at 115200, NVS, WiFi.
3. If WiFi creds in NVS, it tries to connect; otherwise opens captive portal.
4. Captive portal AP `HexworthDevice-<MAC4>` should be visible within 5-10s.

If no AP appears, the firmware is crashing on boot. The only way to confirm is to plug into a serial monitor:

```bash
# On bc1 with PIO
pio device monitor -b 115200 -p /dev/ttyUSB0

# On any machine with esptool installed
esptool.py --port /dev/ttyUSB0 --baud 115200 chip_id   # confirms USB OK
screen /dev/ttyUSB0 115200
```

Common crash causes:

- **Stack overflow on captive-portal init.** Confirm `huge_app.csv` partition is in `manifest.json` (look at `flashSize`/`flashMode`). DevKit V1 has 4MB; we use the huge_app layout.
- **`secrets.h` missing at build time.** That would have failed the bc1 build, not produced a bin. Re-verify the build was the one staged.
- **Watchdog reboot loop.** The firmware tries to register against the C2 backend on every loop iteration; a network timeout cascades to WDT. Hold BOOT for 5s during power-on to factory-reset WiFi creds and re-pair.

## Bucket 6 — Pairing-code claim fails

The "Claim pairing code" button calls `c2RequestStudentPairingCode`. Failure modes:

| HTTP / error code | Meaning | Fix |
|---|---|---|
| `401 unauthenticated` | Not signed in. The button should have redirected to `/login.html`. | Sign in. |
| `400 failed-precondition` "active pairing code" | Student already has an unused, unexpired code. | Wait for it to expire (30 min), or use the existing code. |
| `429 resource-exhausted` "Rate limit" | 3 codes minted in past 24h. | Wait until the oldest ages out. Admin can hand-edit `student_pairing_state/{uid}.last24h` in the Firestore console if there's a real reason to override. |
| `500 internal` | Transaction failed (Firestore quota, network blip). | Retry. If persistent, run `_smoke_web_flasher_cf.js` to confirm the CF logic still works. |

To inspect a student's state directly (admin console only):

```js
// Firestore: student_pairing_state/{uid}
{
  activeCodeId: 'HEX-PAIR-XK7A2P' | null,
  last24h: [Timestamp, Timestamp, ...],   // max 3
  updatedAt: Timestamp
}
```

## Bucket 7 — Device registered but missing from My Devices

The `my-devices.html` page runs:

```js
query(collection(db, 'c2_devices'), where('ownerUid', '==', uid))
```

If the device doc exists but isn't visible, the `ownerUid` field is the most likely missing piece:

```js
// Firestore console
db.collection('c2_devices').where('registeredViaPairingCode', '==', '<student code>').get()
```

Check the returned doc has `ownerUid: <student uid>`. If `null`:

- The code was minted by an admin (via `c2GeneratePairingCode`), not by the student (via `c2RequestStudentPairingCode`). Admin-minted codes have `ownerUid: null` by design — that device is admin-only readable.
- The code was redeemed before the 2026-05-17 `ownerUid` patch shipped. Re-flash + re-pair with a fresh student-minted code.

A separate failure mode: the `where('ownerUid', '==', uid)` query requires a Firestore index. The first run on a fresh project may surface an "indexing" prompt. Firebase auto-creates the index when first triggered; if not, the Firestore console error will offer a one-click index creation link.

## Tests to re-run after any change

| Change touched | Re-run |
|---|---|
| `functions/index.js` (`c2RequestStudentPairingCode` or `c2RegisterWithCode`) | `node functions/_smoke_web_flasher_cf.js` |
| `firestore.rules` (c2_devices, c2_pairing_codes, student_pairing_state) | Same smoke (it exercises CF writes which depend on rule allow paths from admin SDK, plus the new doc structure). For Firestore-rule unit tests proper, the firebase-tools rules emulator is the long-term path. |
| `_app/signal/toolkit/web-flasher.html` | Manual: plug in ESP32, walk the flow in Chrome on hexworth.com. There is no headless flasher test. |
| `_app/signal/firmware-bins/<project>/<version>/` (new bin) | Manifest sha256 verifier inline in `_app/signal/firmware-bins/README.md`. |

## Escalation

If the runbook doesn't isolate the failure within 15 minutes, drop the symptom + browser + ESP32 board variant into the [Signal Toolkit hardware-issues thread](https://hexworth.atlassian.net/wiki/spaces/KBA/pages/14975058) (KBA #12) and tag for synchronous review. Don't keep students guessing — the diagnostic value of a fresh failure trace is much higher than a stale one.
