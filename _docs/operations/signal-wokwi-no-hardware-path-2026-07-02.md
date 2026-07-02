# Signal — No-Hardware Simulator Path (Wokwi) — pilot shipped, rollout scoped

**Status:** Mechanism LIVE (pilot on sg-01, 2026-07-02). Rollout across the remaining builds is scoped below and is content work, not engine work.

## TLDR

All ~112 Signal builds gate on owning physical boards — the hub's single biggest accessibility blocker (marathon backlog item 1). The fix is data-driven and is now in the engine: any guide may declare a `simulator` field, and the project page renders a "No Hardware? Simulate It" card linking a browser simulator. Pilot: `sg-01` (Blink & Breadboard) → official Wokwi Arduino Mega template. Rolling out = authoring `simulator` entries per guide (and, for the best ones, pre-wired Wokwi projects), no further engine changes.

## What shipped (mechanism + pilot)

- **Schema** — optional per-guide field in `sections/<id>/guides.js`:
  ```js
  simulator: {
      platform: 'Wokwi',                                  // display name
      url: 'https://wokwi.com/projects/new/arduino-mega', // real, verified URL
      note: 'What the student should do with it (HTML ok, authored content)'
  }
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
| 1 | foundations sg-02..sg-05 (Mega) | Mega template + note per build; pre-wired projects where the wiring is non-trivial | small |
| 2 | esp32-s3-arsenal (13) + pico-builds | Wokwi ESP32-S3 / Pico templates | medium |
| 3 | arcade-ops, firmware-ops, network-recon (Mega/ESP32 subsets) | template or pre-wired per build | large |
| 4 | Non-simulable builds (SDR, drone, PCB, red-team hardware) | honest `simulator: null` + a "what you can still do without hardware" note variant | design decision |

**Pre-wired vs template:** a template link works for every build today (student wires it themselves — which is itself pedagogy); a pre-wired Wokwi project (public saved project with `diagram.json` matching our wiring SVG) is better UX but requires creating/maintaining ~112 Wokwi projects under a Hexworth account. Recommendation: templates everywhere first (fast, zero external state), pre-wire only the top-traffic builds after.

**Hard rules for authors:** URLs must be fetch-verified before commit (no invented project links); `note` must reference the build's actual sketch/wiring; builds that Wokwi cannot represent get the wave-4 honest treatment, never a template link that can't work.

## Related
- Backlog: memory `project_marathon_backlog.md` item 1 (this), item 2 (zero-knowledge sweep — pairs naturally: sweep each build while authoring its simulator entry).
- Engine: `_app/signal/SignalEngine.js` (search `sp-sim-card`); pilot data: `_app/signal/sections/foundations/guides.js` (`sg-01`).
