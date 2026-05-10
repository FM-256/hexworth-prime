# CTF Config Misaccess Findings — HEUR-CTF-CFG-MISACCESS (2026-05-09)

**Validator:** `HEUR-CTF-CFG-MISACCESS` — see `_tools/eduscan/validators/syntax/heuristics.js` `validateCTFConfigMisaccess()`.
**Root cause + plan:** `_docs/operations/ctf-config-misaccess-bug-2026-05-09.md`.

**Total findings:** 619 across 24 lab config files.

## Summary by lab

| Lab | Findings | Course |
|---|---|---|
| `houses/matrix/adv-linux/labs/ala-l01-dead-cell-recovery/config.js` | 37 | ALA |
| `houses/matrix/adv-linux/labs/ala-l02-grid-handshake/config.js` | 20 | ALA |
| `houses/matrix/adv-linux/labs/ala-l03-signal-in-the-noise/config.js` | 14 | ALA |
| `houses/matrix/adv-linux/labs/ala-l04-lockdown-protocol/config.js` | 7 | ALA |
| `houses/matrix/adv-linux/labs/ala-l05-the-insider/config.js` | 13 | ALA |
| `houses/matrix/adv-linux/labs/ala-l06-field-assembly/config.js` | 21 | ALA |
| `houses/matrix/adv-linux/labs/ala-l07-name-authority/config.js` | 33 | ALA |
| `houses/matrix/adv-linux/labs/ala-l08-the-night-shift/config.js` | 32 | ALA |
| `houses/matrix/adv-linux/labs/ala-l09-poisoned-records/config.js` | 20 | ALA |
| `houses/matrix/adv-linux/labs/ala-l10-ghost-in-the-cell/config.js` | 3 | ALA |
| `houses/matrix/adv-linux/labs/ala-l11-flatline/config.js` | 33 | ALA |
| `houses/matrix/adv-linux/labs/ala-l12-full-cell-audit/config.js` | 70 | ALA |
| `houses/shield/infosec/labs/pis-l01-specimen-classification/config.js` | 15 | PIS |
| `houses/shield/infosec/labs/pis-l02-human-vector-drill/config.js` | 16 | PIS |
| `houses/shield/infosec/labs/pis-l03-outbreak-intelligence/config.js` | 13 | PIS |
| `houses/shield/infosec/labs/pis-l04-injection-vector/config.js` | 13 | PIS |
| `houses/shield/infosec/labs/pis-l05-field-equipment-audit/config.js` | 20 | PIS |
| `houses/shield/infosec/labs/pis-l06-vault-seal-operations/config.js` | 12 | PIS |
| `houses/shield/infosec/labs/pis-l07-lab-isolation-protocol/config.js` | 35 | PIS |
| `houses/shield/infosec/labs/pis-l08-clearance-forge/config.js` | 37 | PIS |
| `houses/shield/infosec/labs/pis-l09-outbreak-detection/config.js` | 15 | PIS |
| `houses/shield/infosec/labs/pis-l10-dual-integrity-access/config.js` | 52 | PIS |
| `houses/shield/infosec/labs/pis-l11-containment-breach/config.js` | 39 | PIS |
| `houses/shield/infosec/labs/pis-l12-full-facility-inspection/config.js` | 49 | PIS |

## Per-lab findings detail

Each entry is a `engine._X` reference inside a command body where `_X` is defined as a top-level config state field. The fix in every case is mechanical: `engine._X` → `engine.config._X`.

### `houses/matrix/adv-linux/labs/ala-l01-dead-cell-recovery/config.js` (37 findings)

| Line | Misaccessed field |
|---|---|
| 321 | `engine._serviceState` → `engine.config._serviceState` |
| 322 | `engine._serviceState` → `engine.config._serviceState` |
| 332 | `engine._serviceState` → `engine.config._serviceState` |
| 339 | `engine._serviceState` → `engine.config._serviceState` |
| 347 | `engine._serviceState` → `engine.config._serviceState` |
| 354 | `engine._serviceState` → `engine.config._serviceState` |
| 382 | `engine._serviceState` → `engine.config._serviceState` |
| 387 | `engine._serviceState` → `engine.config._serviceState` |
| 395 | `engine._serviceState` → `engine.config._serviceState` |
| 403 | `engine._serviceState` → `engine.config._serviceState` |
| 411 | `engine._serviceState` → `engine.config._serviceState` |
| 419 | `engine._serviceState` → `engine.config._serviceState` |
| 437 | `engine._serviceState` → `engine.config._serviceState` |
| 440 | `engine._serviceState` → `engine.config._serviceState` |
| 445 | `engine._serviceState` → `engine.config._serviceState` |
| 448 | `engine._serviceState` → `engine.config._serviceState` |
| 453 | `engine._serviceState` → `engine.config._serviceState` |
| 456 | `engine._serviceState` → `engine.config._serviceState` |
| 461 | `engine._serviceState` → `engine.config._serviceState` |
| 464 | `engine._serviceState` → `engine.config._serviceState` |
| 469 | `engine._serviceState` → `engine.config._serviceState` |
| 472 | `engine._serviceState` → `engine.config._serviceState` |
| 476 | `engine._serviceState` → `engine.config._serviceState` |
| 492 | `engine._serviceState` → `engine.config._serviceState` |
| 493 | `engine._serviceState` → `engine.config._serviceState` |
| 494 | `engine._serviceState` → `engine.config._serviceState` |
| 495 | `engine._serviceState` → `engine.config._serviceState` |
| 496 | `engine._serviceState` → `engine.config._serviceState` |
| 497 | `engine._serviceState` → `engine.config._serviceState` |
| 498 | `engine._serviceState` → `engine.config._serviceState` |
| 507 | `engine._serviceState` → `engine.config._serviceState` |
| 531 | `engine._serviceState` → `engine.config._serviceState` |
| 546 | `engine._serviceState` → `engine.config._serviceState` |
| 553 | `engine._serviceState` → `engine.config._serviceState` |
| 579 | `engine._serviceState` → `engine.config._serviceState` |
| 612 | `engine._logRecovered` → `engine.config._logRecovered` |
| 635 | `engine._logRecovered` → `engine.config._logRecovered` |

### `houses/matrix/adv-linux/labs/ala-l02-grid-handshake/config.js` (20 findings)

| Line | Misaccessed field |
|---|---|
| 221 | `engine._netState` → `engine.config._netState` |
| 231 | `engine._netState` → `engine.config._netState` |
| 246 | `engine._netState` → `engine.config._netState` |
| 269 | `engine._netState` → `engine.config._netState` |
| 270 | `engine._netState` → `engine.config._netState` |
| 273 | `engine._netState` → `engine.config._netState` |
| 274 | `engine._netState` → `engine.config._netState` |
| 280 | `engine._netState` → `engine.config._netState` |
| 282 | `engine._netState` → `engine.config._netState` |
| 286 | `engine._netState` → `engine.config._netState` |
| 292 | `engine._netState` → `engine.config._netState` |
| 293 | `engine._netState` → `engine.config._netState` |
| 318 | `engine._netState` → `engine.config._netState` |
| 320 | `engine._netState` → `engine.config._netState` |
| 341 | `engine._netState` → `engine.config._netState` |
| 370 | `engine._runScript` → `engine.config._runScript` |
| 375 | `engine._runCheckScript` → `engine.config._runCheckScript` |
| 379 | `engine._runCheckScript` → `engine.config._runCheckScript` |
| 383 | `engine._runCheckScript` → `engine.config._runCheckScript` |
| 388 | `engine._runScript` → `engine.config._runScript` |

### `houses/matrix/adv-linux/labs/ala-l03-signal-in-the-noise/config.js` (14 findings)

| Line | Misaccessed field |
|---|---|
| 313 | `engine._rogueProcess` → `engine.config._rogueProcess` |
| 339 | `engine._rogueProcess` → `engine.config._rogueProcess` |
| 364 | `engine._rogueProcess` → `engine.config._rogueProcess` |
| 419 | `engine._rogueProcess` → `engine.config._rogueProcess` |
| 500 | `engine._rogueProcess` → `engine.config._rogueProcess` |
| 511 | `engine._rogueProcess` → `engine.config._rogueProcess` |
| 532 | `engine._rogueProcess` → `engine.config._rogueProcess` |
| 544 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 545 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 598 | `engine._rogueProcess` → `engine.config._rogueProcess` |
| 602 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 605 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 616 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |
| 617 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |

### `houses/matrix/adv-linux/labs/ala-l04-lockdown-protocol/config.js` (7 findings)

| Line | Misaccessed field |
|---|---|
| 223 | `engine._fw` → `engine.config._fw` |
| 350 | `engine._firewallLogHasEntries` → `engine.config._firewallLogHasEntries` |
| 370 | `engine._fw` → `engine.config._fw` |
| 391 | `engine._runVerifyScript` → `engine.config._runVerifyScript` |
| 396 | `engine._runVerifyScript` → `engine.config._runVerifyScript` |
| 400 | `engine._runVerifyScript` → `engine.config._runVerifyScript` |
| 404 | `engine._runVerifyScript` → `engine.config._runVerifyScript` |

### `houses/matrix/adv-linux/labs/ala-l05-the-insider/config.js` (13 findings)

| Line | Misaccessed field |
|---|---|
| 334 | `engine._state` → `engine.config._state` |
| 344 | `engine._state` → `engine.config._state` |
| 347 | `engine._state` → `engine.config._state` |
| 365 | `engine._state` → `engine.config._state` |
| 371 | `engine._state` → `engine.config._state` |
| 393 | `engine._state` → `engine.config._state` |
| 415 | `engine._state` → `engine.config._state` |
| 424 | `engine._state` → `engine.config._state` |
| 437 | `engine._state` → `engine.config._state` |
| 438 | `engine._state` → `engine.config._state` |
| 439 | `engine._state` → `engine.config._state` |
| 483 | `engine._state` → `engine.config._state` |
| 530 | `engine._state` → `engine.config._state` |

### `houses/matrix/adv-linux/labs/ala-l06-field-assembly/config.js` (21 findings)

| Line | Misaccessed field |
|---|---|
| 260 | `engine._state` → `engine.config._state` |
| 283 | `engine._state` → `engine.config._state` |
| 306 | `engine._state` → `engine.config._state` |
| 309 | `engine._state` → `engine.config._state` |
| 332 | `engine._state` → `engine.config._state` |
| 335 | `engine._state` → `engine.config._state` |
| 344 | `engine._state` → `engine.config._state` |
| 353 | `engine._state` → `engine.config._state` |
| 356 | `engine._state` → `engine.config._state` |
| 375 | `engine._state` → `engine.config._state` |
| 378 | `engine._state` → `engine.config._state` |
| 411 | `engine._state` → `engine.config._state` |
| 414 | `engine._state` → `engine.config._state` |
| 422 | `engine._state` → `engine.config._state` |
| 428 | `engine._state` → `engine.config._state` |
| 431 | `engine._state` → `engine.config._state` |
| 432 | `engine._state` → `engine.config._state` |
| 440 | `engine._state` → `engine.config._state` |
| 460 | `engine._state` → `engine.config._state` |
| 473 | `engine._state` → `engine.config._state` |
| 482 | `engine._state` → `engine.config._state` |

### `houses/matrix/adv-linux/labs/ala-l07-name-authority/config.js` (33 findings)

| Line | Misaccessed field |
|---|---|
| 256 | `engine._state` → `engine.config._state` |
| 266 | `engine._state` → `engine.config._state` |
| 267 | `engine._state` → `engine.config._state` |
| 268 | `engine._state` → `engine.config._state` |
| 288 | `engine._state` → `engine.config._state` |
| 309 | `engine._state` → `engine.config._state` |
| 322 | `engine._state` → `engine.config._state` |
| 325 | `engine._state` → `engine.config._state` |
| 337 | `engine._state` → `engine.config._state` |
| 344 | `engine._state` → `engine.config._state` |
| 361 | `engine._state` → `engine.config._state` |
| 370 | `engine._state` → `engine.config._state` |
| 373 | `engine._state` → `engine.config._state` |
| 376 | `engine._state` → `engine.config._state` |
| 379 | `engine._state` → `engine.config._state` |
| 386 | `engine._state` → `engine.config._state` |
| 395 | `engine._state` → `engine.config._state` |
| 418 | `engine._state` → `engine.config._state` |
| 422 | `engine._state` → `engine.config._state` |
| 432 | `engine._state` → `engine.config._state` |
| 444 | `engine._state` → `engine.config._state` |
| 466 | `engine._state` → `engine.config._state` |
| 469 | `engine._state` → `engine.config._state` |
| 479 | `engine._state` → `engine.config._state` |
| 513 | `engine._state` → `engine.config._state` |
| 528 | `engine._state` → `engine.config._state` |
| 536 | `engine._state` → `engine.config._state` |
| 539 | `engine._state` → `engine.config._state` |
| 551 | `engine._state` → `engine.config._state` |
| 554 | `engine._state` → `engine.config._state` |
| 572 | `engine._state` → `engine.config._state` |
| 575 | `engine._state` → `engine.config._state` |
| 578 | `engine._state` → `engine.config._state` |

### `houses/matrix/adv-linux/labs/ala-l08-the-night-shift/config.js` (32 findings)

| Line | Misaccessed field |
|---|---|
| 268 | `engine._remoteCells` → `engine.config._remoteCells` |
| 269 | `engine._remoteCells` → `engine.config._remoteCells` |
| 277 | `engine._remoteCells` → `engine.config._remoteCells` |
| 349 | `engine._remoteCells` → `engine.config._remoteCells` |
| 356 | `engine._remoteCells` → `engine.config._remoteCells` |
| 380 | `engine._state` → `engine.config._state` |
| 409 | `engine._state` → `engine.config._state` |
| 425 | `engine._state` → `engine.config._state` |
| 451 | `engine._state` → `engine.config._state` |
| 481 | `engine._state` → `engine.config._state` |
| 486 | `engine._remoteCells` → `engine.config._remoteCells` |
| 487 | `engine._remoteCells` → `engine.config._remoteCells` |
| 491 | `engine._state` → `engine.config._state` |
| 496 | `engine._state` → `engine.config._state` |
| 513 | `engine._state` → `engine.config._state` |
| 518 | `engine._state` → `engine.config._state` |
| 523 | `engine._remoteCells` → `engine.config._remoteCells` |
| 548 | `engine._state` → `engine.config._state` |
| 554 | `engine._state` → `engine.config._state` |
| 562 | `engine._state` → `engine.config._state` |
| 570 | `engine._state` → `engine.config._state` |
| 573 | `engine._state` → `engine.config._state` |
| 576 | `engine._state` → `engine.config._state` |
| 590 | `engine._state` → `engine.config._state` |
| 601 | `engine._state` → `engine.config._state` |
| 625 | `engine._state` → `engine.config._state` |
| 626 | `engine._state` → `engine.config._state` |
| 627 | `engine._state` → `engine.config._state` |
| 628 | `engine._state` → `engine.config._state` |
| 631 | `engine._state` → `engine.config._state` |
| 632 | `engine._state` → `engine.config._state` |
| 647 | `engine._remoteCells` → `engine.config._remoteCells` |

### `houses/matrix/adv-linux/labs/ala-l09-poisoned-records/config.js` (20 findings)

| Line | Misaccessed field |
|---|---|
| 271 | `engine._zoneRestored` → `engine.config._zoneRestored` |
| 316 | `engine._zoneRestored` → `engine.config._zoneRestored` |
| 322 | `engine._zoneRestored` → `engine.config._zoneRestored` |
| 339 | `engine._zoneRestored` → `engine.config._zoneRestored` |
| 364 | `engine._zoneRestored` → `engine.config._zoneRestored` |
| 383 | `engine._zoneRestored` → `engine.config._zoneRestored` |
| 406 | `engine._zoneRestored` → `engine.config._zoneRestored` |
| 421 | `engine._zonePerms640` → `engine.config._zonePerms640` |
| 426 | `engine._zonePerms640` → `engine.config._zonePerms640` |
| 446 | `engine._tsigConfigured` → `engine.config._tsigConfigured` |
| 458 | `engine._zoneRestored` → `engine.config._zoneRestored` |
| 467 | `engine._allowUpdateNone` → `engine.config._allowUpdateNone` |
| 468 | `engine._zonePerms640` → `engine.config._zonePerms640` |
| 469 | `engine._tsigConfigured` → `engine.config._tsigConfigured` |
| 487 | `engine._tsigConfigured` → `engine.config._tsigConfigured` |
| 492 | `engine._allowUpdateNone` → `engine.config._allowUpdateNone` |
| 503 | `engine._allowUpdateNone` → `engine.config._allowUpdateNone` |
| 514 | `engine._allowUpdateNone` → `engine.config._allowUpdateNone` |
| 527 | `engine._allowUpdateNone` → `engine.config._allowUpdateNone` |
| 531 | `engine._tsigConfigured` → `engine.config._tsigConfigured` |

### `houses/matrix/adv-linux/labs/ala-l10-ghost-in-the-cell/config.js` (3 findings)

| Line | Misaccessed field |
|---|---|
| 481 | `engine._foundBackdoor` → `engine.config._foundBackdoor` |
| 485 | `engine._foundSshdConfig` → `engine.config._foundSshdConfig` |
| 489 | `engine._foundPayload` → `engine.config._foundPayload` |

### `houses/matrix/adv-linux/labs/ala-l11-flatline/config.js` (33 findings)

| Line | Misaccessed field |
|---|---|
| 299 | `engine._cronFixed` → `engine.config._cronFixed` |
| 303 | `engine._memoryFixed` → `engine.config._memoryFixed` |
| 304 | `engine._memoryFixed` → `engine.config._memoryFixed` |
| 328 | `engine._memoryFixed` → `engine.config._memoryFixed` |
| 329 | `engine._memoryFixed` → `engine.config._memoryFixed` |
| 334 | `engine._cronFixed` → `engine.config._cronFixed` |
| 344 | `engine._memoryFixed` → `engine.config._memoryFixed` |
| 357 | `engine._diskFixed` → `engine.config._diskFixed` |
| 358 | `engine._diskFixed` → `engine.config._diskFixed` |
| 359 | `engine._diskFixed` → `engine.config._diskFixed` |
| 375 | `engine._diskFixed` → `engine.config._diskFixed` |
| 403 | `engine._cronFixed` → `engine.config._cronFixed` |
| 413 | `engine._cronFixed` → `engine.config._cronFixed` |
| 430 | `engine._memoryFixed` → `engine.config._memoryFixed` |
| 461 | `engine._memoryFixed` → `engine.config._memoryFixed` |
| 476 | `engine._memoryFixed` → `engine.config._memoryFixed` |
| 492 | `engine._cronFixed` → `engine.config._cronFixed` |
| 493 | `engine._memoryFixed` → `engine.config._memoryFixed` |
| 506 | `engine._logrotateConfigWritten` → `engine.config._logrotateConfigWritten` |
| 513 | `engine._diskFixed` → `engine.config._diskFixed` |
| 527 | `engine._logrotateConfigWritten` → `engine.config._logrotateConfigWritten` |
| 532 | `engine._memoryFixed` → `engine.config._memoryFixed` |
| 543 | `engine._logrotateConfigWritten` → `engine.config._logrotateConfigWritten` |
| 547 | `engine._memoryFixed` → `engine.config._memoryFixed` |
| 551 | `engine._cronFixed` → `engine.config._cronFixed` |
| 569 | `engine._cronFixed` → `engine.config._cronFixed` |
| 580 | `engine._cronFixed` → `engine.config._cronFixed` |
| 593 | `engine._memoryFixed` → `engine.config._memoryFixed` |
| 599 | `engine._cronFixed` → `engine.config._cronFixed` |
| 609 | `engine._cronFixed` → `engine.config._cronFixed` |
| 617 | `engine._memoryFixed` → `engine.config._memoryFixed` |
| 625 | `engine._diskFixed` → `engine.config._diskFixed` |
| 627 | `engine._logrotateConfigWritten` → `engine.config._logrotateConfigWritten` |

### `houses/matrix/adv-linux/labs/ala-l12-full-cell-audit/config.js` (70 findings)

| Line | Misaccessed field |
|---|---|
| 335 | `engine._eth1Up` → `engine.config._eth1Up` |
| 336 | `engine._eth1Up` → `engine.config._eth1Up` |
| 341 | `engine._eth1Up` → `engine.config._eth1Up` |
| 346 | `engine._eth1Up` → `engine.config._eth1Up` |
| 354 | `engine._eth1Up` → `engine.config._eth1Up` |
| 368 | `engine._netplanFixed` → `engine.config._netplanFixed` |
| 371 | `engine._eth1Up` → `engine.config._eth1Up` |
| 376 | `engine._netplanFixed` → `engine.config._netplanFixed` |
| 390 | `engine._dnsFixed` → `engine.config._dnsFixed` |
| 397 | `engine._ghostRemoved` → `engine.config._ghostRemoved` |
| 404 | `engine._ghostSudoRemoved` → `engine.config._ghostSudoRemoved` |
| 418 | `engine._netplanFixed` → `engine.config._netplanFixed` |
| 425 | `engine._dnsFixed` → `engine.config._dnsFixed` |
| 432 | `engine._sshdHardened` → `engine.config._sshdHardened` |
| 439 | `engine._ghostSudoRemoved` → `engine.config._ghostSudoRemoved` |
| 444 | `engine._bindSecured` → `engine.config._bindSecured` |
| 451 | `engine._logrotateConfigured` → `engine.config._logrotateConfigured` |
| 472 | `engine._sshdHardened` → `engine.config._sshdHardened` |
| 478 | `engine._netplanFixed` → `engine.config._netplanFixed` |
| 483 | `engine._bindSecured` → `engine.config._bindSecured` |
| 494 | `engine._dnsFixed` → `engine.config._dnsFixed` |
| 509 | `engine._ghostRemoved` → `engine.config._ghostRemoved` |
| 514 | `engine._beaconCronRemoved` → `engine.config._beaconCronRemoved` |
| 528 | `engine._ghostRemoved` → `engine.config._ghostRemoved` |
| 544 | `engine._beaconCronRemoved` → `engine.config._beaconCronRemoved` |
| 547 | `engine._beaconServiceRemoved` → `engine.config._beaconServiceRemoved` |
| 561 | `engine._beaconServiceRemoved` → `engine.config._beaconServiceRemoved` |
| 572 | `engine._gridSyncRunning` → `engine.config._gridSyncRunning` |
| 578 | `engine._auditdConfigured` → `engine.config._auditdConfigured` |
| 584 | `engine._ufwEnabled` → `engine.config._ufwEnabled` |
| 597 | `engine._beaconServiceRemoved` → `engine.config._beaconServiceRemoved` |
| 603 | `engine._eth1Up` → `engine.config._eth1Up` |
| 603 | `engine._netplanFixed` → `engine.config._netplanFixed` |
| 606 | `engine._gridSyncRunning` → `engine.config._gridSyncRunning` |
| 619 | `engine._auditdConfigured` → `engine.config._auditdConfigured` |
| 641 | `engine._beaconServiceRemoved` → `engine.config._beaconServiceRemoved` |
| 644 | `engine._gridSyncRunning` → `engine.config._gridSyncRunning` |
| 651 | `engine._beaconServiceRemoved` → `engine.config._beaconServiceRemoved` |
| 663 | `engine._ufwEnabled` → `engine.config._ufwEnabled` |
| 673 | `engine._ufwEnabled` → `engine.config._ufwEnabled` |
| 685 | `engine._ufwEnabled` → `engine.config._ufwEnabled` |
| 702 | `engine._aideInstalled` → `engine.config._aideInstalled` |
| 708 | `engine._auditdConfigured` → `engine.config._auditdConfigured` |
| 727 | `engine._aideInstalled` → `engine.config._aideInstalled` |
| 741 | `engine._auditdConfigured` → `engine.config._auditdConfigured` |
| 750 | `engine._auditdConfigured` → `engine.config._auditdConfigured` |
| 763 | `engine._sshdHardened` → `engine.config._sshdHardened` |
| 769 | `engine._bindSecured` → `engine.config._bindSecured` |
| 775 | `engine._ghostRemoved` → `engine.config._ghostRemoved` |
| 779 | `engine._ghostRemoved` → `engine.config._ghostRemoved` |
| 790 | `engine._logrotateConfigured` → `engine.config._logrotateConfigured` |
| 795 | `engine._auditdConfigured` → `engine.config._auditdConfigured` |
| 808 | `engine._logrotateConfigured` → `engine.config._logrotateConfigured` |
| 811 | `engine._logrotateConfigured` → `engine.config._logrotateConfigured` |
| 812 | `engine._logrotateConfigured` → `engine.config._logrotateConfigured` |
| 822 | `engine._eth1Up` → `engine.config._eth1Up` |
| 823 | `engine._netplanFixed` → `engine.config._netplanFixed` |
| 824 | `engine._dnsFixed` → `engine.config._dnsFixed` |
| 840 | `engine._sshdHardened` → `engine.config._sshdHardened` |
| 841 | `engine._ghostRemoved` → `engine.config._ghostRemoved` |
| 842 | `engine._ghostSudoRemoved` → `engine.config._ghostSudoRemoved` |
| 843 | `engine._beaconCronRemoved` → `engine.config._beaconCronRemoved` |
| 844 | `engine._ufwEnabled` → `engine.config._ufwEnabled` |
| 860 | `engine._bindSecured` → `engine.config._bindSecured` |
| 861 | `engine._beaconServiceRemoved` → `engine.config._beaconServiceRemoved` |
| 862 | `engine._gridSyncRunning` → `engine.config._gridSyncRunning` |
| 878 | `engine._aideInstalled` → `engine.config._aideInstalled` |
| 879 | `engine._auditdConfigured` → `engine.config._auditdConfigured` |
| 880 | `engine._logrotateConfigured` → `engine.config._logrotateConfigured` |
| 910 | `engine._beaconServiceRemoved` → `engine.config._beaconServiceRemoved` |

### `houses/shield/infosec/labs/pis-l01-specimen-classification/config.js` (15 findings)

| Line | Misaccessed field |
|---|---|
| 254 | `engine._classifications` → `engine.config._classifications` |
| 291 | `engine._validTypes` → `engine.config._validTypes` |
| 295 | `engine._answers` → `engine.config._answers` |
| 301 | `engine._classifications` → `engine.config._classifications` |
| 306 | `engine._classifications` → `engine.config._classifications` |
| 309 | `engine._classifications` → `engine.config._classifications` |
| 309 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 310 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 316 | `engine._classifications` → `engine.config._classifications` |
| 316 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |
| 317 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |
| 323 | `engine._classifications` → `engine.config._classifications` |
| 323 | `engine._flag3Awarded` → `engine.config._flag3Awarded` |
| 324 | `engine._flag3Awarded` → `engine.config._flag3Awarded` |
| 334 | `engine._classifications` → `engine.config._classifications` |

### `houses/shield/infosec/labs/pis-l02-human-vector-drill/config.js` (16 findings)

| Line | Misaccessed field |
|---|---|
| 218 | `engine._messages` → `engine.config._messages` |
| 219 | `engine._flagged` → `engine.config._flagged` |
| 248 | `engine._messages` → `engine.config._messages` |
| 253 | `engine._flagged` → `engine.config._flagged` |
| 269 | `engine._messages` → `engine.config._messages` |
| 273 | `engine._validTypes` → `engine.config._validTypes` |
| 278 | `engine._flagged` → `engine.config._flagged` |
| 288 | `engine._messages` → `engine.config._messages` |
| 292 | `engine._flagged` → `engine.config._flagged` |
| 296 | `engine._flagged` → `engine.config._flagged` |
| 302 | `engine._flagged` → `engine.config._flagged` |
| 303 | `engine._answers` → `engine.config._answers` |
| 335 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 336 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 353 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |
| 354 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |

### `houses/shield/infosec/labs/pis-l03-outbreak-intelligence/config.js` (13 findings)

| Line | Misaccessed field |
|---|---|
| 168 | `engine._profileData` → `engine.config._profileData` |
| 169 | `engine._profileData` → `engine.config._profileData` |
| 170 | `engine._profileData` → `engine.config._profileData` |
| 171 | `engine._profileData` → `engine.config._profileData` |
| 229 | `engine._profileData` → `engine.config._profileData` |
| 230 | `engine._profileData` → `engine.config._profileData` |
| 238 | `engine._profileData` → `engine.config._profileData` |
| 245 | `engine._profileData` → `engine.config._profileData` |
| 278 | `engine._profileData` → `engine.config._profileData` |
| 295 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 296 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 303 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |
| 304 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |

### `houses/shield/infosec/labs/pis-l04-injection-vector/config.js` (13 findings)

| Line | Misaccessed field |
|---|---|
| 231 | `engine._state` → `engine.config._state` |
| 240 | `engine._state` → `engine.config._state` |
| 244 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |
| 245 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |
| 269 | `engine._state` → `engine.config._state` |
| 273 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 274 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 288 | `engine._state` → `engine.config._state` |
| 292 | `engine._state` → `engine.config._state` |
| 297 | `engine._state` → `engine.config._state` |
| 301 | `engine._flag3Awarded` → `engine.config._flag3Awarded` |
| 302 | `engine._flag3Awarded` → `engine.config._flag3Awarded` |
| 329 | `engine._state` → `engine.config._state` |

### `houses/shield/infosec/labs/pis-l05-field-equipment-audit/config.js` (20 findings)

| Line | Misaccessed field |
|---|---|
| 248 | `engine._devices` → `engine.config._devices` |
| 249 | `engine._failed` → `engine.config._failed` |
| 276 | `engine._devices` → `engine.config._devices` |
| 281 | `engine._failed` → `engine.config._failed` |
| 316 | `engine._devices` → `engine.config._devices` |
| 320 | `engine._validFailReasons` → `engine.config._validFailReasons` |
| 324 | `engine._failAnswers` → `engine.config._failAnswers` |
| 336 | `engine._failed` → `engine.config._failed` |
| 349 | `engine._devices` → `engine.config._devices` |
| 353 | `engine._failed` → `engine.config._failed` |
| 357 | `engine._validRemediations` → `engine.config._validRemediations` |
| 361 | `engine._remediationAnswers` → `engine.config._remediationAnswers` |
| 366 | `engine._remediated` → `engine.config._remediated` |
| 368 | `engine._remediated` → `engine.config._remediated` |
| 374 | `engine._failed` → `engine.config._failed` |
| 375 | `engine._remediated` → `engine.config._remediated` |
| 382 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 383 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 392 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |
| 393 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |

### `houses/shield/infosec/labs/pis-l06-vault-seal-operations/config.js` (12 findings)

| Line | Misaccessed field |
|---|---|
| 252 | `engine._state` → `engine.config._state` |
| 262 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 263 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 299 | `engine._state` → `engine.config._state` |
| 309 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |
| 310 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |
| 396 | `engine._state` → `engine.config._state` |
| 399 | `engine._state` → `engine.config._state` |
| 403 | `engine._state` → `engine.config._state` |
| 404 | `engine._state` → `engine.config._state` |
| 408 | `engine._flag3Awarded` → `engine.config._flag3Awarded` |
| 409 | `engine._flag3Awarded` → `engine.config._flag3Awarded` |

### `houses/shield/infosec/labs/pis-l07-lab-isolation-protocol/config.js` (35 findings)

| Line | Misaccessed field |
|---|---|
| 180 | `engine._state` → `engine.config._state` |
| 181 | `engine._state` → `engine.config._state` |
| 184 | `engine._state` → `engine.config._state` |
| 220 | `engine._state` → `engine.config._state` |
| 222 | `engine._state` → `engine.config._state` |
| 226 | `engine._state` → `engine.config._state` |
| 226 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 227 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 257 | `engine._state` → `engine.config._state` |
| 262 | `engine._state` → `engine.config._state` |
| 262 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 263 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 285 | `engine._state` → `engine.config._state` |
| 290 | `engine._state` → `engine.config._state` |
| 290 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 291 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 304 | `engine._state` → `engine.config._state` |
| 317 | `engine._state` → `engine.config._state` |
| 321 | `engine._state` → `engine.config._state` |
| 329 | `engine._state` → `engine.config._state` |
| 333 | `engine._state` → `engine.config._state` |
| 345 | `engine._state` → `engine.config._state` |
| 346 | `engine._state` → `engine.config._state` |
| 348 | `engine._state` → `engine.config._state` |
| 353 | `engine._state` → `engine.config._state` |
| 361 | `engine._state` → `engine.config._state` |
| 365 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |
| 366 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |
| 376 | `engine._state` → `engine.config._state` |
| 380 | `engine._state` → `engine.config._state` |
| 381 | `engine._state` → `engine.config._state` |
| 383 | `engine._state` → `engine.config._state` |
| 389 | `engine._state` → `engine.config._state` |
| 393 | `engine._flag3Awarded` → `engine.config._flag3Awarded` |
| 394 | `engine._flag3Awarded` → `engine.config._flag3Awarded` |

### `houses/shield/infosec/labs/pis-l08-clearance-forge/config.js` (37 findings)

| Line | Misaccessed field |
|---|---|
| 193 | `engine._state` → `engine.config._state` |
| 210 | `engine._state` → `engine.config._state` |
| 211 | `engine._state` → `engine.config._state` |
| 231 | `engine._state` → `engine.config._state` |
| 245 | `engine._requiredServers` → `engine.config._requiredServers` |
| 253 | `engine._state` → `engine.config._state` |
| 254 | `engine._state` → `engine.config._state` |
| 258 | `engine._state` → `engine.config._state` |
| 259 | `engine._state` → `engine.config._state` |
| 267 | `engine._state` → `engine.config._state` |
| 268 | `engine._state` → `engine.config._state` |
| 271 | `engine._state` → `engine.config._state` |
| 276 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 277 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 292 | `engine._requiredServers` → `engine.config._requiredServers` |
| 293 | `engine._state` → `engine.config._state` |
| 313 | `engine._state` → `engine.config._state` |
| 317 | `engine._state` → `engine.config._state` |
| 322 | `engine._state` → `engine.config._state` |
| 333 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |
| 334 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |
| 344 | `engine._state` → `engine.config._state` |
| 365 | `engine._state` → `engine.config._state` |
| 367 | `engine._state` → `engine.config._state` |
| 391 | `engine._state` → `engine.config._state` |
| 402 | `engine._requiredServers` → `engine.config._requiredServers` |
| 406 | `engine._state` → `engine.config._state` |
| 414 | `engine._flag3Awarded` → `engine.config._flag3Awarded` |
| 415 | `engine._flag3Awarded` → `engine.config._flag3Awarded` |
| 428 | `engine._state` → `engine.config._state` |
| 432 | `engine._state` → `engine.config._state` |
| 433 | `engine._state` → `engine.config._state` |
| 454 | `engine._state` → `engine.config._state` |
| 459 | `engine._requiredServers` → `engine.config._requiredServers` |
| 464 | `engine._state` → `engine.config._state` |
| 484 | `engine._requiredServers` → `engine.config._requiredServers` |
| 489 | `engine._state` → `engine.config._state` |

### `houses/shield/infosec/labs/pis-l09-outbreak-detection/config.js` (15 findings)

| Line | Misaccessed field |
|---|---|
| 364 | `engine._alerts` → `engine.config._alerts` |
| 388 | `engine._state` → `engine.config._state` |
| 395 | `engine._state` → `engine.config._state` |
| 430 | `engine._realIncidents` → `engine.config._realIncidents` |
| 437 | `engine._state` → `engine.config._state` |
| 468 | `engine._state` → `engine.config._state` |
| 469 | `engine._state` → `engine.config._state` |
| 473 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 474 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 484 | `engine._state` → `engine.config._state` |
| 490 | `engine._state` → `engine.config._state` |
| 494 | `engine._state` → `engine.config._state` |
| 496 | `engine._state` → `engine.config._state` |
| 550 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |
| 551 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |

### `houses/shield/infosec/labs/pis-l10-dual-integrity-access/config.js` (52 findings)

| Line | Misaccessed field |
|---|---|
| 184 | `engine._state` → `engine.config._state` |
| 185 | `engine._state` → `engine.config._state` |
| 186 | `engine._state` → `engine.config._state` |
| 195 | `engine._requiredOUs` → `engine.config._requiredOUs` |
| 199 | `engine._state` → `engine.config._state` |
| 203 | `engine._state` → `engine.config._state` |
| 204 | `engine._state` → `engine.config._state` |
| 208 | `engine._requiredOUs` → `engine.config._requiredOUs` |
| 208 | `engine._state` → `engine.config._state` |
| 209 | `engine._state` → `engine.config._state` |
| 210 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 211 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 228 | `engine._allPersonnel` → `engine.config._allPersonnel` |
| 232 | `engine._state` → `engine.config._state` |
| 236 | `engine._personnelMap` → `engine.config._personnelMap` |
| 241 | `engine._state` → `engine.config._state` |
| 250 | `engine._state` → `engine.config._state` |
| 252 | `engine._state` → `engine.config._state` |
| 255 | `engine._requiredOUs` → `engine.config._requiredOUs` |
| 255 | `engine._state` → `engine.config._state` |
| 256 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 257 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 278 | `engine._allPersonnel` → `engine.config._allPersonnel` |
| 278 | `engine._state` → `engine.config._state` |
| 283 | `engine._state` → `engine.config._state` |
| 284 | `engine._state` → `engine.config._state` |
| 288 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |
| 289 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |
| 297 | `engine._allPersonnel` → `engine.config._allPersonnel` |
| 301 | `engine._state` → `engine.config._state` |
| 305 | `engine._state` → `engine.config._state` |
| 306 | `engine._state` → `engine.config._state` |
| 310 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |
| 311 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |
| 340 | `engine._state` → `engine.config._state` |
| 342 | `engine._state` → `engine.config._state` |
| 347 | `engine._state` → `engine.config._state` |
| 348 | `engine._state` → `engine.config._state` |
| 349 | `engine._state` → `engine.config._state` |
| 351 | `engine._flag3Awarded` → `engine.config._flag3Awarded` |
| 353 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 353 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |
| 354 | `engine._flag3Awarded` → `engine.config._flag3Awarded` |
| 374 | `engine._allPersonnel` → `engine.config._allPersonnel` |
| 378 | `engine._state` → `engine.config._state` |
| 383 | `engine._state` → `engine.config._state` |
| 389 | `engine._state` → `engine.config._state` |
| 422 | `engine._state` → `engine.config._state` |
| 432 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 432 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |
| 438 | `engine._flag3Awarded` → `engine.config._flag3Awarded` |
| 439 | `engine._flag3Awarded` → `engine.config._flag3Awarded` |

### `houses/shield/infosec/labs/pis-l11-containment-breach/config.js` (39 findings)

| Line | Misaccessed field |
|---|---|
| 178 | `engine._state` → `engine.config._state` |
| 180 | `engine._state` → `engine.config._state` |
| 181 | `engine._state` → `engine.config._state` |
| 182 | `engine._affectedSystems` → `engine.config._affectedSystems` |
| 189 | `engine._state` → `engine.config._state` |
| 199 | `engine._affectedSystems` → `engine.config._affectedSystems` |
| 202 | `engine._affectedSystems` → `engine.config._affectedSystems` |
| 203 | `engine._state` → `engine.config._state` |
| 204 | `engine._state` → `engine.config._state` |
| 210 | `engine._state` → `engine.config._state` |
| 214 | `engine._state` → `engine.config._state` |
| 215 | `engine._state` → `engine.config._state` |
| 219 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 220 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 230 | `engine._state` → `engine.config._state` |
| 240 | `engine._affectedSystems` → `engine.config._affectedSystems` |
| 244 | `engine._state` → `engine.config._state` |
| 248 | `engine._state` → `engine.config._state` |
| 249 | `engine._state` → `engine.config._state` |
| 263 | `engine._affectedSystems` → `engine.config._affectedSystems` |
| 267 | `engine._state` → `engine.config._state` |
| 271 | `engine._state` → `engine.config._state` |
| 275 | `engine._state` → `engine.config._state` |
| 276 | `engine._state` → `engine.config._state` |
| 281 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |
| 282 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |
| 297 | `engine._state` → `engine.config._state` |
| 301 | `engine._state` → `engine.config._state` |
| 305 | `engine._state` → `engine.config._state` |
| 309 | `engine._state` → `engine.config._state` |
| 313 | `engine._state` → `engine.config._state` |
| 320 | `engine._state` → `engine.config._state` |
| 324 | `engine._state` → `engine.config._state` |
| 328 | `engine._state` → `engine.config._state` |
| 335 | `engine._state` → `engine.config._state` |
| 339 | `engine._state` → `engine.config._state` |
| 343 | `engine._state` → `engine.config._state` |
| 347 | `engine._flag3Awarded` → `engine.config._flag3Awarded` |
| 348 | `engine._flag3Awarded` → `engine.config._flag3Awarded` |

### `houses/shield/infosec/labs/pis-l12-full-facility-inspection/config.js` (49 findings)

| Line | Misaccessed field |
|---|---|
| 193 | `engine._state` → `engine.config._state` |
| 194 | `engine._auditResults` → `engine.config._auditResults` |
| 199 | `engine._state` → `engine.config._state` |
| 200 | `engine._auditResults` → `engine.config._auditResults` |
| 205 | `engine._state` → `engine.config._state` |
| 206 | `engine._auditResults` → `engine.config._auditResults` |
| 211 | `engine._state` → `engine.config._state` |
| 212 | `engine._auditResults` → `engine.config._auditResults` |
| 217 | `engine._state` → `engine.config._state` |
| 218 | `engine._auditResults` → `engine.config._auditResults` |
| 236 | `engine._state` → `engine.config._state` |
| 253 | `engine._state` → `engine.config._state` |
| 258 | `engine._state` → `engine.config._state` |
| 264 | `engine._state` → `engine.config._state` |
| 264 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 265 | `engine._flag1Awarded` → `engine.config._flag1Awarded` |
| 271 | `engine._state` → `engine.config._state` |
| 272 | `engine._state` → `engine.config._state` |
| 273 | `engine._state` → `engine.config._state` |
| 275 | `engine._state` → `engine.config._state` |
| 275 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |
| 276 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |
| 286 | `engine._state` → `engine.config._state` |
| 290 | `engine._state` → `engine.config._state` |
| 291 | `engine._state` → `engine.config._state` |
| 292 | `engine._state` → `engine.config._state` |
| 293 | `engine._state` → `engine.config._state` |
| 304 | `engine._state` → `engine.config._state` |
| 318 | `engine._state` → `engine.config._state` |
| 318 | `engine._flag2Awarded` → `engine.config._flag2Awarded` |
| 318 | `engine._flag3Awarded` → `engine.config._flag3Awarded` |
| 319 | `engine._flag3Awarded` → `engine.config._flag3Awarded` |
| 329 | `engine._state` → `engine.config._state` |
| 334 | `engine._state` → `engine.config._state` |
| 338 | `engine._state` → `engine.config._state` |
| 342 | `engine._state` → `engine.config._state` |
| 345 | `engine._state` → `engine.config._state` |
| 350 | `engine._flag4Awarded` → `engine.config._flag4Awarded` |
| 351 | `engine._flag4Awarded` → `engine.config._flag4Awarded` |
| 360 | `engine._state` → `engine.config._state` |
| 364 | `engine._flag4Awarded` → `engine.config._flag4Awarded` |
| 365 | `engine._flag4Awarded` → `engine.config._flag4Awarded` |
| 375 | `engine._state` → `engine.config._state` |
| 380 | `engine._state` → `engine.config._state` |
| 384 | `engine._state` → `engine.config._state` |
| 386 | `engine._state` → `engine.config._state` |
| 390 | `engine._state` → `engine.config._state` |
| 401 | `engine._flag4Awarded` → `engine.config._flag4Awarded` |
| 402 | `engine._flag4Awarded` → `engine.config._flag4Awarded` |

