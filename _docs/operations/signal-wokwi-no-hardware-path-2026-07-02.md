# Signal — No-Hardware Simulator Path (Wokwi) — pilot shipped, rollout scoped

**Status:** Mechanism LIVE (pilot on sg-01, 2026-07-02). Rollout across the remaining builds is scoped below and is content work, not engine work.

## TLDR

All ~112 Signal builds gate on owning physical boards — the hub's single biggest accessibility blocker (marathon backlog item 1). The fix is data-driven and is now in the engine: any guide may declare a `simulator` field, and the project page renders a "No Hardware? Simulate It" card linking a browser simulator. Pilot: `sg-01` (Blink & Breadboard) → official Wokwi Arduino Mega template. Rolling out = authoring `simulator` entries per guide (and, for the best ones, pre-wired Wokwi projects), no further engine changes.

## What shipped (mechanism + pilot)

- **Schema** — optional per-guide field in `sections/<id>/guides.js`:
  ```js
  // Simulable build:
  simulator: {
      platform: 'Wokwi',                                  // display name
      url: 'https://wokwi.com/projects/new/arduino-mega', // real, verified URL
      note: 'What the student should do with it (HTML ok, authored content)'
  }
  // Genuinely-needs-hardware build (no template that could work):
  simulator: { available: false, note: 'Why it needs the real board + what to learn here' }
  ```
- **Render** — `SignalEngine.js` (before the Steps section): if `guide.simulator.url` exists, a `sp-sim-card` renders with the note and an "Open Wokwi" new-tab link. Guides without the field are untouched (verified: sg-02 renders no card).
- **Pilot** — `sg-01` links the official Wokwi new-Mega template (URL fetch-verified working 2026-07-02); the note tells the student to paste the sketch from the steps and wire per the diagram.

## Why Wokwi

- Free, no account required to run; simulates Arduino Uno/Mega/Nano, ESP32 (incl. S3), Pi Pico — which covers the Mega foundations, the esp32-s3-arsenal, and pico-builds sections, i.e. the majority of board-gated builds.
- Simulates the parts most guides use: LEDs, buttons, displays (LCD1602/SSD1306), sensors (DHT22, HC-SR04, NTC), serial monitor, even WiFi on ESP32 (SSID `Wokwi-GUEST`).
- Already the proven pattern on this platform: Forge project pages (`forge-env-monitor`, `forge-sensor-dashboard`, `key-rfid-access`) ship Wokwi callouts.

## Rollout plan (content work, in waves)

| Wave | Scope | Simulator target | Effort shape |
|---|---|---|---|
| 1 | foundations sg-02..sg-05 (Mega) — DONE 2026-07-02 (parts coverage fetch-verified; DHT22/DS1307 substitutions and the sg-03 pyserial limitation stated honestly in the notes) | Mega template + build-specific note | done |
| 2 | esp32-s3-arsenal (10) + pico-builds (5) — DONE 2026-07-02 | pico: 5 sim (MicroPython Pico; Pico W for sg-117); esp32-s3: 10 honest NO-SIM (LILYGO T-Display-S3 not a Wokwi board + USB-HID/BLE/deauth not implemented) | done |
| 3 | arcade-ops, firmware-ops, network-recon (Mega/ESP32 subsets) | template or pre-wired per build | large |
| 4 | Non-simulable builds (SDR, drone, PCB, red-team hardware) | honest no-sim card SHIPPED as the mechanism (`simulator: {available:false, note}` -> amber "Why This One Needs Real Hardware" card, engine 2026-07-02); remaining sections still to author | in progress |

**Pre-wired vs template:** a template link works for every build today (student wires it themselves — which is itself pedagogy); a pre-wired Wokwi project (public saved project with `diagram.json` matching our wiring SVG) is better UX but requires creating/maintaining ~112 Wokwi projects under a Hexworth account. Recommendation: templates everywhere first (fast, zero external state), pre-wire only the top-traffic builds after.

**Hard rules for authors:** URLs must be fetch-verified before commit (no invented project links); `note` must reference the build's actual sketch/wiring; builds that Wokwi cannot represent get the wave-4 honest treatment, never a template link that can't work.

## Related
- Backlog: memory `project_marathon_backlog.md` item 1 (this), item 2 (zero-knowledge sweep — pairs naturally: sweep each build while authoring its simulator entry).
- Engine: `_app/signal/SignalEngine.js` (search `sp-sim-card`); pilot data: `_app/signal/sections/foundations/guides.js` (`sg-01`).
