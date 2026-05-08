# QC-60 Inventory — Platform-Wide Hub-Catalog HUB-001 Mismatch

Generated 2026-05-08. Total hubs affected: 19. Total mismatched data-modules: 500.

| Hub | Total | Missing | Prefix-Mismatch | Genuine | Sample genuine |
|-----|-------|---------|-----------------|---------|----------------|
| `houses/matrix/piverse/index.html` | 150 | 150 | 150 | 0 | — |
| `houses/matrix/protocore/index.html` | 102 | 102 | 102 | 0 | — |
| `houses/shield/sc-200/index.html` | 27 | 27 | 27 | 0 | — |
| `houses/cloud/ms-102/index.html` | 24 | 24 | 24 | 0 | — |
| `houses/shield/security-plus/index.html` | 118 | 21 | 21 | 0 | — |
| `houses/shield/infosec/index.html` | 40 | 21 | 21 | 0 | — |
| `houses/cloud/az-104/index.html` | 18 | 18 | 18 | 0 | — |
| `houses/matrix/adv-linux/index.html` | 38 | 18 | 4 | 14 | ala-w1-systemd, ala-w1-network-config, ala-w1-network-diag |
| `houses/eye/cysa/index.html` | 16 | 16 | 16 | 0 | — |
| `houses/cloud/pl-300/index.html` | 15 | 15 | 15 | 0 | — |
| `houses/shield/sc-900/index.html` | 12 | 12 | 12 | 0 | — |
| `houses/script/linux/index.html` | 12 | 12 | 12 | 0 | — |
| `houses/web/network-essentials/_archive/index.html` | 10 | 10 | 10 | 0 | — |
| `houses/shield/isc2-cc/index.html` | 58 | 10 | 10 | 0 | — |
| `houses/code/armory/sql/index.html` | 10 | 10 | 10 | 0 | — |
| `houses/cloud/ms-900/index.html` | 9 | 9 | 9 | 0 | — |
| `houses/cloud/az-900/index.html` | 9 | 9 | 9 | 0 | — |
| `houses/cloud/cse/index.html` | 8 | 8 | 8 | 0 | — |
| `houses/shield/cyber-framework/index.html` | 8 | 8 | 5 | 3 | mm06, mm07, mm08 |

## Pattern

**Prefix-Mismatch:** catalog has `${house}-${id}` while hub uses bare `${id}`. Mechanical rename to drop prefix would align (with student-progress migration consideration per ModuleProgress.migrateLegacyKey memory).

**Genuinely Missing:** no catalog entry exists at all. Same fix pattern as QC-59 — add new entries.

## Reference cases

- **QC-59 (PFI)**: 33 genuinely missing — fixed by adding entries (commit f69acd66). Worked because PFI catalog already used bare-ID convention.
- **QC-47 (PIS infosec)**: 21 prefix-mismatch — held pending Nancy review on student-data implications.
