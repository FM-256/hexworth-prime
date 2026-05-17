# Hexworth C2 Device Firmware

The first real device on the Hexworth Command-and-Control backend.
Registers with `/c2Register`, heartbeats via `/c2CheckIn`, polls for
commands via `/c2GetCommands`, and reports results via `/c2Result`.
Built on top of the WiFiManager provisioning pattern (KBA #6) and
the C2 backend (KBA #2).

Target hardware: **ESP32 DevKit V1** (38-pin, ESP-32D + CP2102 USB-C).
Easily ports to XIAO ESP32-C3/S3 — change the `[env:]` block in
`platformio.ini` and override `-D BTN_BOOT=<gpio>` for that board.

## Capabilities exposed

Sent on registration as the `capabilities` array. The C2 dispatch
backend rejects any action not in this list (defense in depth).

| action | params | What it does |
|---|---|---|
| `ping` | none | Returns `{ uptime, freeHeap, rssi, ip, firmware }` |
| `echo` | `{ text }` | Returns `{ echo: <text> }` |
| `blink` | `{ count?, delayMs? }` | Flashes onboard LED `count` times (default 3, clamped 1-50) with `delayMs` between toggles (default 200ms, clamped 20-2000) |
| `reboot` | none | Acks result, then `ESP.restart()` 500ms later |

Deliberately NOT in this v1 set: arbitrary shell execution, file
write, HTTP fetch, OTA. Those need pairing-code auth on the backend
before they ship as device capabilities.

## NVS namespace split

Two namespaces are used so the WiFi factory-reset gesture doesn't
orphan the device on the C2 backend:

| Namespace | Keys | Cleared by |
|---|---|---|
| `hexapp` | `ssid`, `pass`, `name` | BOOT-hold 5s on boot |
| `c2dev` | `id`, `key`, `checkInMs`, `pollMs` | Never automatically |

The first WiFi pairing also asks the user for a device name in the
captive portal. That name is sent as `name` on the first `c2Register`
so the dashboard shows a human label, not just `d_<hex>`.

## Build

```bash
# On bc1 (where PlatformIO lives):
cd /data/hexworth/c2-device/firmware
cp include/secrets.h.example include/secrets.h
pio run -e esp32dev
pio run -e esp32dev -t upload --upload-port /dev/ttyUSB0
pio device monitor -b 115200 -p /dev/ttyUSB0
```

Build-verified on bc1 with RAM 14.4% / Flash 30.1% (esp32dev profile,
ArduinoJson v7 + WiFiManager).

## First-boot flow

1. **Cold start, empty NVS**
   - Device prints "SETUP MODE" banner on serial
   - Opens AP `HexworthDevice-<MAC4>`
   - User joins from a phone
   - Captive portal asks for home WiFi + a device name
   - User submits; device saves to `hexapp` NVS, reboots
2. **First boot with WiFi creds, empty C2 registration**
   - Connects to WiFi
   - POST /c2Register with the user-entered name + capabilities
   - Saves `deviceId` + `deviceKey` to `c2dev` NVS
   - Sends immediate first check-in
   - Device appears in the C2 Dashboard within a few seconds
3. **Steady state**
   - Check in every 30s (overridable from the backend response)
   - If pending commands > 0, GET /c2GetCommands, dispatch, POST results
   - Fallback poll every 5s catches commands queued just after a clean check-in

## Dispatching a test command (operator side)

After the device is registered and showing online in the C2 Dashboard
LIVE mode:

1. Sign in to hexworth.com with admin credentials
2. Open `/signal/toolkit/c2-dashboard.html`, switch to LIVE mode
3. Click the device, choose action `ping`, no params
4. Within ~5 seconds: device fetches the command, executes, returns
   the result. Dashboard shows `success` + the result payload.

## Factory reset

Hold the BOOT button (GPIO0 on ESP32 DevKit V1) for 5 seconds during
power-on. NVS namespace `hexapp` clears (WiFi creds + name). The C2
registration in `c2dev` survives. Next boot opens the captive portal
again. After re-pairing, the device reuses its existing
`deviceId` / `deviceKey` and reappears on the same dashboard row.

To wipe the C2 registration too, run `pio run -t erase` (USB-connected
flash erase). The next boot will re-register from scratch as a new
device.

## Known caveats

- **CP2102 USB-C driver.** macOS 11+ and Linux ship with this driver
  built in. Windows may require the Silicon Labs CP210x VCP driver.
- **TLS pinning not in v1.** `WiFiClientSecure::setInsecure()` is used
  for all HTTPS calls. Pin Google's root CA before scaling beyond
  trusted networks.
- **No backoff on register failure.** Three attempts with 5-second
  spacing, then the main loop retries every ~10 seconds. Reasonable
  for typical network blips; not designed for sustained outages.
- **Anyone with the deviceKey is the device.** No key rotation
  mechanism today. Re-flash + `pio run -t erase` is the rotation path.

## Related KBAs

- **KBA #2 — DuckyScript IDE + C2 Infrastructure** (Confluence 14843915)
  — backend protocol + Firestore schema
- **KBA #6 — WiFiManager Provisioning Pattern** (Confluence 14188547)
  — the provisioning half of this firmware
