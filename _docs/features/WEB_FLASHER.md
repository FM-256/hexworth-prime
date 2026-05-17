# Hexworth Web Flasher

**Status:** SHIPPED (2026-05-17)
**Pages:** `_app/signal/toolkit/web-flasher.html`, `_app/signal/toolkit/my-devices.html`
**Vendored library:** `_app/signal/toolkit/tools/esptool-js/` (esptool-js v0.5.4)
**Firmware artifacts:** `_app/signal/firmware-bins/<project>/<version>/`
**Cloud Functions:** `c2RequestStudentPairingCode` (new), `c2RegisterWithCode` (modified)
**Confluence KBA:** [#12](https://hexworth.atlassian.net/wiki/spaces/KBA/pages/14975058) (with #10 v5 and #11 v2 for the firmware and pairing-code halves)

## Purpose

A student with their own ESP32 should be able to flash Hexworth firmware and register the device against the Hexworth C2 backend without needing PlatformIO, a Linux toolchain, or operator (bc1) access. The Web Flasher is a single HTML page that uses WebSerial + vendored esptool-js to talk to the ESP32 ROM bootloader directly from the browser, downloads compiled bins from the same origin, verifies them with sha256, and writes them to flash.

A successful flash takes the student through a captive-portal handoff: the freshly flashed device boots into an AP, the student joins from their phone, hands the device WiFi credentials, and (optionally) pastes a Hexworth pairing code. The pairing code is minted from the same page via an auth-gated callable; once redeemed, the resulting device document carries `ownerUid = student.uid`, so the student can see the device in `my-devices.html`.

Hexworth provides instruction + software. The student owns the hardware.

## End-to-end flow

```
       Student                          Browser                       Hexworth Backend
       (any uid)                        (Chrome/Edge)                 (CF + Firestore)

  1.  Plug ESP32 over USB-C  ──────→
  2.  Open /signal/toolkit/web-flasher.html
  3.  Pick firmware                ──→  fetch /signal/firmware-bins/index.json
  4.                               ──→  fetch <project>/<ver>/manifest.json
  5.  Click "Connect"              ──→  navigator.serial.requestPort()
                                        esptool-js: detect chip, ROM handshake
  6.  Click "Flash"                ──→  fetch each .bin
                                        sha256 verify against manifest
                                        writeFlash() with progress
                                        after() → soft reset
  7.  Device reboots into AP  ←──
  8.  Optional: click "Claim pairing code"
                                    ──→  c2RequestStudentPairingCode  ──→  mint code with ownerUid=uid
                                                                           write student_pairing_state
                                    ←──  { code, expiresAt }         ←──
  9.  On phone: join HexworthDevice-XXXX
 10.  Captive portal → WiFi + paste code → submit
 11.  Device boots on home WiFi  ─────────────────────────────────→  POST /c2RegisterWithCode
                                                                           tx: code.usedAt = now
                                                                               c2_devices.set { ownerUid }
                                                                               student_pairing_state.activeCodeId = null
                                                                     ←──  { deviceId, deviceKey }
 12.  Reload /signal/toolkit/my-devices.html
                                    ──→  query c2_devices where ownerUid == uid
                                                                     ←──  device row (status: new → online)
```

## Components

### 1. Web flasher page

`_app/signal/toolkit/web-flasher.html` (~430 lines).

| Element | Role |
|---|---|
| WebSerial feature gate | Hides Connect button + shows warning on Safari, Firefox, mobile. |
| Project picker | Loads from `firmware-bins/index.json`. Cards show name, version, short description. |
| Manifest panel | Loads `<project>/<version>/manifest.json`, displays target boards + build sizes. Disables Connect if any sha256 is `PENDING_BC1_BUILD` (placeholder). |
| Connect handler | `navigator.serial.requestPort({})` → wrap in esptool-js `Transport`, call `ESPLoader.main()` to detect chip. |
| Flash handler | Fetches each .bin as `ArrayBuffer`, sha256-verifies against manifest, converts to binary string in 32KB chunks (works around `String.fromCharCode.apply` arg-count limit), calls `esploader.writeFlash({ fileArray, … })` with a progress callback. |
| `beforeunload` guard | Prompts the user before letting them close the tab while `state.flashing` is true. |
| Post-flash panel | Shows the captive-portal instructions and the optional pairing-code claim form. |
| Pairing-code claim | Calls `FirebaseAuth.callFunction('c2RequestStudentPairingCode', {})`. If anonymous, redirects to `/login.html?return=…`. |

### 2. My Devices page

`_app/signal/toolkit/my-devices.html` (~230 lines).

- Auth-gated (no anonymous read).
- `getDocs(query(collection(db, 'c2_devices'), where('ownerUid', '==', uid)))`.
- Sorted by `registeredAt` descending.
- Status pills derived from `lastCheckIn` vs `checkInInterval`:
  - `online` if `now - lastCheckIn < interval * 3`
  - `idle` if `< interval * 12`
  - `offline` otherwise
  - `new` if `lastCheckIn` is null (just registered, no check-ins yet)

### 3. Vendored esptool-js

`_app/signal/toolkit/tools/esptool-js/`:

| File | sha256 / purpose |
|---|---|
| `bundle.js` | `2a896d5e520ea9b6ea9900223c2460df797c3b2287f441daa4e50168a50b17e6` (ESM) |
| `LICENSE` | Apache 2.0 (Espressif Systems) |
| `package.json` | Upstream metadata at v0.5.4 |
| `README.md` | Bump instructions |

Vendored at pinned v0.5.4. No CDN runtime dependency (intentional — see [the adversarial review](#design-decisions) below).

### 4. Firmware bins

`_app/signal/firmware-bins/`:

```
firmware-bins/
├── README.md                                      ← build → stage pipeline doc
├── index.json                                     ← catalog (drives picker)
├── c2-device/v0.2/
│   ├── manifest.json                              ← offsets + sha256 + buildInfo
│   ├── bootloader.bin     0x1000  17,536 B
│   ├── partitions.bin     0x8000   3,072 B
│   └── firmware.bin      0x10000 1,066,896 B
└── wifimanager-template/v0.1/
    ├── manifest.json
    ├── bootloader.bin     0x1000  17,536 B
    ├── partitions.bin     0x8000   3,072 B
    └── firmware.bin      0x10000   881,488 B
```

Manifest entries are decimal offsets (not hex strings) so the flasher consumes them as plain `Number` values. Each `manifest.json` has `buildInfo.{ramPercent, flashPercent, framework, compiledOn, compiledAt}` for audit.

### 5. Cloud Functions

**`c2RequestStudentPairingCode` (onCall, auth-required).** New in this release. See `functions/index.js` near line 5713.

Single transaction wraps:
- read `student_pairing_state/{uid}`
- read the active code (if any) to confirm it has been used or expired
- pruning of `last24h` to past-24h timestamps
- new code creation (`c2_pairing_codes/{code}` with `ownerUid`, `issuedTo='student'`)
- state update (`activeCodeId`, appended `last24h`)

Throws `failed-precondition` if an unused/unexpired active code exists; `resource-exhausted` if `last24h.length >= 3`.

**`c2RegisterWithCode` (onRequest).** Modified. The existing transaction now:
- copies `ownerUid` from the code doc onto the new device doc
- if `issuedTo === 'student'`, reads `student_pairing_state/{ownerUid}` (hoisted to the top of the transaction to satisfy Firestore's all-reads-before-writes rule) and clears `activeCodeId` if it matches the redeemed code

### 6. Firestore documents

| Collection | Doc key | Written by | Read by |
|---|---|---|---|
| `c2_pairing_codes` | code string | CF only | admin OR `ownerUid == auth.uid` |
| `c2_devices` | deviceId | CF only | admin OR `ownerUid == auth.uid` |
| `student_pairing_state` | uid | CF only | owner only (`uid == auth.uid`) |

Existing legacy devices (registered via `/c2Register` with no pairing code) have `ownerUid = null` and stay admin-only readable.

## Design decisions

### Why vendor esptool-js?

The adversarial reviewer flagged a CDN at runtime (originally `unpkg.com/esptool-js@…`) as a supply-chain and availability risk. unpkg has had multi-hour outages. Vendoring under same origin removes that failure mode, matches Hexworth's "no build step" rule, and lets the integrity hash live in the repo's README. To bump versions, replace the three vendored files and update the sha256 documented in `tools/esptool-js/README.md`.

### Why include a "my devices" page in v1?

Originally planned as v2. The reviewer pointed out that without it, every "did my device register?" question becomes a support ticket that only an admin can answer — and once the `ownerUid` schema is in place, the marginal cost of a read-only page is low. Shipped in v1 for that reason.

### Why a transactional rate-limit?

A check-then-write across two Firestore operations is a textbook TOCTOU race. The blocking adversarial finding from the design review was: two simultaneous mint calls (double-tap, slow-network retry, two tabs) both pass the active-code check, both write a fresh code, both update state — the 1-active-code invariant is silently broken. Wrapping both reads and both writes in `db.runTransaction` closes this.

### Why `signUp` (anonymous-style) for the server smoke?

The test (`functions/_smoke_web_flasher_cf.js`) needs an ID token to invoke the onCall function. The natural path — admin SDK `createCustomToken` then exchange for ID token — needs a service-account key file (custom-token signing) and we run without one. The simpler path is `accounts:signUp` with `returnSecureToken: true`, which creates an anonymous Firebase user and returns the ID token in one REST call (only needs the Web API key). The Web API key is referrer-restricted, so the smoke spoofs `Referer: https://hexworth.com` to get through. Cleanup deletes the test user via admin SDK at the end.

## Verifications

### Static / integrity

- esptool-js bundle sha256 matches the value documented in `tools/esptool-js/README.md`
- Each deployed `.bin` URL, when fetched and rehashed, matches the sha256 in its `manifest.json`
- EduScan syntax pass on the new HTML pages: 0 critical, 0 high

### Server-side smoke

`functions/_smoke_web_flasher_cf.js` exercises the full CF round-trip AND the Firestore rule allow/deny matrix without any browser or hardware. As of 2026-05-17 the smoke passes 28/28 assertions:

```
$ cd functions && GOOGLE_CLOUD_QUOTA_PROJECT=hexworth-prime node _smoke_web_flasher_cf.js

  PASS  signUp returned ID token
  PASS  HTTP 200 on first mint
  PASS  code shape HEX-PAIR-XXXXXX + ttlSeconds = 1800
  PASS  code.ownerUid == TEST_UID
  PASS  code.issuedTo == 'student'
  PASS  state.activeCodeId set + last24h has 1 entry
  PASS  HTTP 4xx on second mint (active code outstanding)
  PASS  HTTP 201 on register, deviceId returned
  PASS  device.ownerUid == TEST_UID
  PASS  code.usedAt / usedByDeviceId set after redeem
  PASS  state.activeCodeId cleared inside redemption transaction
  PASS  mint #2/3 HTTP 200, redeem #2/3 HTTP 201
  PASS  last24h has 3 entries
  PASS  HTTP 4xx (429) on 4th mint — rate limit fires
  PASS  owner reads own c2_devices doc (200)
  PASS  owner reads own c2_pairing_codes doc (200)
  PASS  owner reads own student_pairing_state (200)
  PASS  non-owner BLOCKED from c2_devices (403)
  PASS  non-owner BLOCKED from c2_pairing_codes (403)
  PASS  non-owner BLOCKED from student_pairing_state (403)
```

The smoke creates two ephemeral anonymous students via Identity Toolkit REST, exercises every CF code path, hits the Firestore REST API as both students (owner + non-owner) to verify rules end-to-end, then admin-SDK deletes both auth users and all test docs. Safe to re-run any time.

Re-run after any change to:
- `functions/index.js` (`c2RequestStudentPairingCode` or `c2RegisterWithCode`)
- `firestore.rules` for `c2_devices`, `c2_pairing_codes`, or `student_pairing_state`

### What is NOT verified server-side

- The actual WebSerial ↔ ESP32 USB-CDC handshake. The flasher logic is correct on paper, esptool-js is the same library ESP Web Tools uses in production, but no one has plugged in a real DevKit and walked the flow.
- Captive-portal handoff. The firmware compiles cleanly, but the boot-up + AP-broadcast sequence is unverified end-to-end.

See [operations/web-flasher-runbook.md](../operations/web-flasher-runbook.md) for the runtime failure-mode triage.

## Build → stage pipeline

The bins under `_app/signal/firmware-bins/` are committed binaries. They are produced on bc1 (PlatformIO Core 6.1.19, espressif32@7.0.1, arduino-espressif32 3.20017) and rsynced into the repo.

```bash
# On bc1, in the firmware source tree:
cd /data/hexworth/c2-device-build/firmware
cp include/secrets.h.example include/secrets.h   # one-time
pio run -e esp32dev
sha256sum .pio/build/esp32dev/{bootloader,partitions,firmware}.bin

# Locally:
DEST=_app/signal/firmware-bins/c2-device/v0.2
rsync -a bc1:/data/hexworth/c2-device-build/firmware/.pio/build/esp32dev/{bootloader.bin,partitions.bin,firmware.bin} "$DEST/"
# update $DEST/manifest.json with the three sha256 values from bc1

# Verify locally before commit:
node -e "
  const m = require('./$DEST/manifest.json');
  const crypto = require('crypto'); const fs = require('fs');
  for (const f of m.files) {
    const h = crypto.createHash('sha256').update(fs.readFileSync('$DEST/' + f.path)).digest('hex');
    console.log(f.path, h === f.sha256 ? 'OK' : 'MISMATCH');
  }"
```

## Related docs

- [`_docs/features/SIGNAL_HUB.md`](SIGNAL_HUB.md) — the parent hub that hosts the Web Flasher
- [`_docs/operations/web-flasher-runbook.md`](../operations/web-flasher-runbook.md) — failure-mode triage
- Confluence KBA #10 — C2 Device Firmware (v5)
- Confluence KBA #11 — C2 Pairing-Code Registration (v2)
- Confluence KBA #12 — Hexworth Web Flasher
