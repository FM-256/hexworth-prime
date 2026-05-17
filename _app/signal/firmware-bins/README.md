# Signal Firmware Binaries

Compiled firmware artifacts staged for the browser-based flasher
(`_app/signal/toolkit/web-flasher.html`). Each `<project>/<version>/`
directory holds the three flash artifacts (`bootloader.bin`,
`partitions.bin`, `firmware.bin`) plus a `manifest.json` describing
flash offsets, target boards, and sha256 integrity hashes.

Students never touch bc1. They open the flasher in Chrome/Edge, pick a
project, plug in their ESP32 over USB, and the flasher streams these
bins to their device over WebSerial via vendored esptool-js.

## Manifest schema

Every manifest has a `flasherMode` field that tells the Web Flasher which renderer to use. The flasher dispatches to one of four panel layouts, and only the fields relevant to that mode need to be present.

Watch for the naming collision: `flasherMode` (with the `r`) is the renderer dispatch enum; `flashMode` (no `r`) is the ESP32 chip-level flash IO mode (DIO/QIO/DOUT/QOUT). Both can appear in `webserial-esp32` manifests with different meanings.

### Universal fields (all modes)

```jsonc
{
  "name": "Display name shown in the picker",
  "version": "0.2",
  "flasherMode": "webserial-esp32",   // REQUIRED, no default
  "boardTargets": ["esp32dev"],
  "chipFamily": "ESP32",
  "description": "What this firmware does after install.",
  "license": "MIT",
  "kbaRef": "https://hexworth.atlassian.net/wiki/spaces/KBA/pages/<id>",
  "helpUrl": "https://upstream-or-hexworth-docs/...",
  "status": "ready"
}
```

### `webserial-esp32` extra fields (Hexworth in-browser flashing of ESP32 firmware)

```jsonc
{
  "flashSize": "4MB",
  "flashMode": "DIO",       // chip-level IO mode for esptool — NOT flasherMode
  "flashFreq": "40m",
  "files": [
    { "path": "bootloader.bin", "offset": 4096,   "sha256": "..." },
    { "path": "partitions.bin", "offset": 32768,  "sha256": "..." },
    { "path": "firmware.bin",   "offset": 65536,  "sha256": "..." }
  ],
  "postFlash": { "supportsPairingCode": true, ... },
  "buildInfo": { "ramPercent": 14.5, "flashPercent": 33.7, ... }
}
```

Offsets are decimal numbers (not hex strings) so JSON parsing yields plain `Number` values that esptool-js can consume directly.

### `external-download` extra fields (Pi Pico drag-drop, future CircuitPython)

```jsonc
{
  "files": [
    { "path": "firmware.uf2", "size": 659968, "sha256": "...", "label": "MicroPython UF2 (660 KB)" }
  ],
  "boot": {
    "mountLabel": "RPI-RP2",
    "buttonName": "BOOTSEL",
    "instructions": ["Unplug the Pico...", "Hold BOOTSEL...", "Drag firmware.uf2..."]
  },
  "verify": "Plain-English description of what success looks like.",
  "upstreamUrl": "https://micropython.org/download/..."
}
```

### `external-editor` extra fields (Arduino IDE / Web Editor handoff)

```jsonc
{
  "files": [
    { "path": "blink.ino", "size": 1121, "sha256": "...", "label": "blink.ino (Arduino sketch)" }
  ],
  "editor": {
    "primary":   { "label": "Install Arduino IDE",  "url": "https://www.arduino.cc/en/software", "instructions": [...] },
    "secondary": { "label": "Use Arduino Web Editor","url": "https://app.arduino.cc/sketches/new", "instructions": [...] }
  },
  "verify": "What should happen after upload."
}
```

### `disk-image` extra fields (Pi 3/4/5 OS install)

```jsonc
{
  "walkthroughUrl": "/signal/toolkit/install-pi-os.html",
  "imager":          { "label": "Raspberry Pi Imager", "url": "https://www.raspberrypi.com/software/", "description": "..." },
  "alternativeTool": { "label": "balenaEtcher",        "url": "https://etcher.balena.io/",            "description": "..." }
}
```

The standard ESP32 offsets are:

| File           | Offset (decimal) | Offset (hex) |
|----------------|------------------|--------------|
| bootloader.bin | 4096             | 0x1000       |
| partitions.bin | 32768            | 0x8000       |
| firmware.bin   | 65536            | 0x10000      |

## Build → stage pipeline

PlatformIO lives on bc1 (operator only); compiled artifacts land here.

```bash
# On bc1, in the firmware source tree (e.g. /data/hexworth/c2-device-build/firmware/):
pio run -e esp32dev

# Three output files in .pio/build/esp32dev/:
#   bootloader.bin   ← bootloader image
#   partitions.bin   ← partition table
#   firmware.bin     ← the actual application

# Compute hashes
sha256sum bootloader.bin partitions.bin firmware.bin

# Copy to repo (rsync from bc1 to operator workstation, then commit)
DEST=_app/signal/firmware-bins/c2-device/v0.2
cp bootloader.bin partitions.bin firmware.bin "$DEST/"

# Update manifest.json sha256 entries with the new hashes.
# Verify locally before commit:
node -e "
  const m = require('./$DEST/manifest.json');
  const crypto = require('crypto'); const fs = require('fs');
  for (const f of m.files) {
    const h = crypto.createHash('sha256').update(fs.readFileSync('$DEST/' + f.path)).digest('hex');
    console.log(f.path, h === f.sha256 ? 'OK' : 'MISMATCH — manifest=' + f.sha256 + ' actual=' + h);
  }"
```

## Versioning

`<project>/<version>/` directories are immutable once shipped. Bump to
a new version directory for every firmware change. The flasher's
project picker reads the manifest array from `index.json` (also in
this directory) so students can choose the version.

## Known limitations

* These bins live in the git repo, not a CDN bucket. Each is ~1MB
  compressed in deploy artifact. Fine while we have <20 projects;
  revisit if the count grows.
* No client-side rollback after a bad flash. The student holds the
  BOOT button + power-cycles to recover (ESP32 bootloader survives a
  bad app flash because it lives in a separate partition).
