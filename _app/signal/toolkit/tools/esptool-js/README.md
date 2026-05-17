# esptool-js (vendored)

Upstream: https://github.com/espressif/esptool-js — Apache 2.0.

| File | Purpose |
|---|---|
| `bundle.js` | ESM bundle (named exports: `ESPLoader`, `Transport`, `ClassicReset`, `CustomReset`, `HardReset`, `ROM`, `UsbJtagSerialReset`, `decodeBase64Data`, `getStubJsonByChipName`, `validateCustomResetStringSequence`) |
| `LICENSE` | Apache 2.0 license text |
| `package.json` | Upstream metadata at the pinned version |

## Pinned version

`esptool-js@0.5.4`

`bundle.js` sha256: `2a896d5e520ea9b6ea9900223c2460df797c3b2287f441daa4e50168a50b17e6`

## Why vendored

Hexworth's "no build step" rule plus removing the unpkg outage failure mode for `web-flasher.html`. Reviewer call (2026-05-17) flagged CDN fetch at runtime as a supply-chain + availability risk.

## How to bump

```
cd _app/signal/toolkit/tools/esptool-js
curl -sLo bundle.js   https://unpkg.com/esptool-js@<version>/bundle.js
curl -sLo package.json https://unpkg.com/esptool-js@<version>/package.json
curl -sLo LICENSE     https://raw.githubusercontent.com/espressif/esptool-js/v<version>/LICENSE
sha256sum bundle.js
```

Then update the sha256 in this README and in any consumer that integrity-checks it.
