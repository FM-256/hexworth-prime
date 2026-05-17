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

```jsonc
{
  "name": "Display name shown in the picker",
  "version": "0.2",
  "boardTargets": ["esp32dev"],
  "chipFamily": "ESP32",
  "flashSize": "4MB",
  "flashMode": "DIO",
  "flashFreq": "40m",
  "files": [
    { "path": "bootloader.bin", "offset": 4096,   "sha256": "..." },
    { "path": "partitions.bin", "offset": 32768,  "sha256": "..." },
    { "path": "firmware.bin",   "offset": 65536,  "sha256": "..." }
  ],
  "kbaRef": "https://hexworth.atlassian.net/wiki/spaces/KBA/pages/<id>",
  "description": "What this firmware does after flashing.",
  "postFlash": {
    "requiresPairingCode": true,
    "captivePortalApName": "HexworthDevice-XXXX"
  }
}
```

Offsets are decimal numbers (not hex strings) so JSON parsing yields
plain `Number` values that esptool-js can consume without conversion.

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
