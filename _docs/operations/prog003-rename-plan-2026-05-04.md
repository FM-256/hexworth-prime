# PROG-003 Rename Plan — Unambiguous Bugs

> Companion to `prog003-audit-2026-05-04.md`. This is the EXECUTION SPEC for the
> ~76 unambiguous bug renames in Option B of the SYM-15 triage. Awaiting user
> approval before any file is modified.

## Scope

**Covers** the four PROG-003 collision categories where the user-facing impact is unambiguously a bug (distinct content silently sharing a single XP key):

- **A.** 17 three-plus file collisions (forge applet triples + web NP/tool/standalone triples)
- **B.** 31 web NP/standalone duplicates (presentation + presentation; exam + exam; quiz + quiz; tool + tool)
- **C.** 11 NE/NP lab duplicates (`web/labs/web-neNN-X.lab.html` + `web/network-plus/labs/X.lab.html`)
- **D.** 31 CLH applet+module pairs

Total: **76 file edits, 76 migration shim entries** (one per renamed file).

**Does NOT cover:**
- 23 presentation+lab pairs (mixed intent — needs per-pair user judgment)
- 10 lab+tool pairs (likely intentional — proposed for allowlist)
- 11 "other" pairs (mixed)

Those 44 collisions go to the SYM-15 allowlist or per-case follow-up.

---

## Naming convention

Each collision picks ONE file as the canonical owner of the original key. The others get a contextual suffix derived from their location:

| Suffix | Meaning | Example |
|---|---|---|
| `-np-{type}` | Network-Plus track copy | `web-arp` → `web-arp-np-pres` |
| `-ne-lab` | Network-Essentials labs/ copy | `web-osi-scenario-ne-lab` |
| `-aplus-c2-{type}` | A+ Core 2 applet copy | `forge-admin-tools-aplus-c2-lab` |
| `-aplus-c1-{type}` | A+ Core 1 applet copy | (none in this plan) |
| `-applet` | CLH applet sibling of module index | `script-clh-001-intro-applet` |
| `-tool-2` | Second tool variant (heuristic; rename to something better case-by-case) | `web-osi-tool-2` |

**The `-tool-2` suffix is provisional.** Where the heuristic produced it, a human should pick something more descriptive (e.g., `web-osi-builder` if the tool is a builder, `web-osi-quiz` if it's a quiz tool). Flag during execution.

---

## Canonical-file selection rules

For each collision, the canonical (key-keeping) file is chosen by:

1. **Standalone over course-embedded** — `houses/web/X.html` beats `houses/web/network-plus/X.html`
2. **Lab over applet** — `houses/forge/labs/X.lab.html` beats `houses/forge/applets/.../X.lab.html`
3. **Lecture-style presentation over interactive tool** — when both at same depth
4. **Module-index over per-module-applet** — for CLH series

This preserves student progress for the file most likely to have been completed first historically.

---

## Migration shim contract

Every rename adds one line to `_app/components/ModuleProgress.js` initialization:

```js
ModuleProgress.migrateLegacyKey('houseId', 'oldKey', 'newKey');
```

Per `reference_module_progress_migrate_legacy_key.md` memory:
- Idempotent — no-op if already migrated for the user
- Migrates flat-format progress + completedModules array + completion-stamps registry
- Runs once on app boot, low overhead

After all 76 entries are added, every student who already completed the OLD key gets credit transferred to the NEW key on next visit. No XP loss.

---

## Execution order

Recommended sequence (each step independently verifiable):

1. **Section A first** (17 collisions, 34 file edits + 34 shim entries) — three-plus collisions are the highest-leverage fix
2. **Section C next** (11 collisions, 11 file edits + 11 shim entries) — NE/NP labs, smaller surface
3. **Section B** (31 collisions, 31 file edits + 31 shim entries) — bulk web NP duplicates
4. **Section D** (31 collisions, 31 file edits + 31 shim entries) — CLH pairs (manual review per ContentCatalog wiring)

After each section: re-run PROG-003 audit, expect baseline drop. Smoke gate + EduScan suite green before commit.

**Do NOT batch all 76 into one commit.** One commit per section. Easier to bisect if a regression appears.

---

## A. THREE-PLUS FILE COLLISIONS (17 collisions, 51 files)

Strategy: keep one file at the original key (the canonical lecture/standalone), assign new contextual keys to the others.

### forge/forge-admin-tools
- KEEP **houses/forge/labs/forge-admin-tools.lab.html** at `forge-admin-tools` (canonical)
- RENAME **houses/forge/applets/comptia-aplus/core-2/labs/forge-admin-tools.lab.html** → `forge-admin-tools-aplus-c2-lab`
- RENAME **houses/forge/applets/comptia-aplus/core-2/presentations/forge-admin-tools.presentation.html** → `forge-admin-tools-aplus-c2-pres`

### forge/forge-control-panel
- KEEP **houses/forge/labs/forge-control-panel.lab.html** at `forge-control-panel` (canonical)
- RENAME **houses/forge/applets/comptia-aplus/core-2/labs/forge-control-panel.lab.html** → `forge-control-panel-aplus-c2-lab`
- RENAME **houses/forge/applets/comptia-aplus/core-2/presentations/forge-control-panel.presentation.html** → `forge-control-panel-aplus-c2-pres`

### forge/forge-system-tools
- KEEP **houses/forge/labs/forge-system-tools.lab.html** at `forge-system-tools` (canonical)
- RENAME **houses/forge/applets/comptia-aplus/core-2/labs/forge-system-tools.lab.html** → `forge-system-tools-aplus-c2-lab`
- RENAME **houses/forge/applets/comptia-aplus/core-2/presentations/forge-system-tools.presentation.html** → `forge-system-tools-aplus-c2-pres`

### forge/forge-windows-editions
- KEEP **houses/forge/labs/forge-windows-editions.lab.html** at `forge-windows-editions` (canonical)
- RENAME **houses/forge/applets/comptia-aplus/core-2/labs/forge-windows-editions.lab.html** → `forge-windows-editions-aplus-c2-lab`
- RENAME **houses/forge/applets/comptia-aplus/core-2/presentations/forge-windows-editions.presentation.html** → `forge-windows-editions-aplus-c2-pres`

### forge/forge-windows-settings
- KEEP **houses/forge/labs/forge-windows-settings.lab.html** at `forge-windows-settings` (canonical)
- RENAME **houses/forge/applets/comptia-aplus/core-2/labs/forge-windows-settings.lab.html** → `forge-windows-settings-aplus-c2-lab`
- RENAME **houses/forge/applets/comptia-aplus/core-2/presentations/forge-windows-settings.presentation.html** → `forge-windows-settings-aplus-c2-pres`

### web/web-devices
- KEEP **houses/web/presentations/web-devices.presentation.html** at `web-devices` (canonical)
- RENAME **houses/web/tools/web-devices.tool.html** → `web-devices-tool-2`
- RENAME **houses/web/network-plus/presentations/devices.presentation.html** → `web-devices-np-pres`

### web/web-etherchannel
- KEEP **houses/web/presentations/web-etherchannel.presentation.html** at `web-etherchannel` (canonical)
- RENAME **houses/web/tools/web-etherchannel.tool.html** → `web-etherchannel-tool-2`
- RENAME **houses/web/network-plus/presentations/etherchannel.presentation.html** → `web-etherchannel-np-pres`

### web/web-fhrp
- KEEP **houses/web/presentations/web-fhrp.presentation.html** at `web-fhrp` (canonical)
- RENAME **houses/web/tools/web-fhrp.tool.html** → `web-fhrp-tool-2`
- RENAME **houses/web/network-plus/presentations/fhrp.presentation.html** → `web-fhrp-np-pres`

### web/web-ipv6
- KEEP **houses/web/presentations/web-ipv6.presentation.html** at `web-ipv6` (canonical)
- RENAME **houses/web/tools/web-ipv6.tool.html** → `web-ipv6-tool-2`
- RENAME **houses/web/network-plus/presentations/ipv6.presentation.html** → `web-ipv6-np-pres`

### web/web-osi-deep-dive
- KEEP **houses/web/presentations/web-osi-deep-dive.presentation.html** at `web-osi-deep-dive` (canonical)
- RENAME **houses/web/tools/web-osi-deep-dive.tool.html** → `web-osi-deep-dive-tool-2`
- RENAME **houses/web/network-plus/presentations/osi-deep-dive.presentation.html** → `web-osi-deep-dive-np-pres`

### web/web-osi
- KEEP **houses/web/presentations/web-osi.presentation.html** at `web-osi` (canonical)
- RENAME **houses/web/tools/web-osi.tool.html** → `web-osi-tool-2`
- RENAME **houses/web/network-plus/presentations/osi.presentation.html** → `web-osi-np-pres`

### web/web-stp
- KEEP **houses/web/presentations/web-stp.presentation.html** at `web-stp` (canonical)
- RENAME **houses/web/tools/web-stp.tool.html** → `web-stp-tool-2`
- RENAME **houses/web/network-plus/presentations/stp.presentation.html** → `web-stp-np-pres`

### web/web-subnetting
- KEEP **houses/web/presentations/web-subnetting.presentation.html** at `web-subnetting` (canonical)
- RENAME **houses/web/tools/web-subnetting.tool.html** → `web-subnetting-tool-2`
- RENAME **houses/web/network-plus/presentations/subnetting.presentation.html** → `web-subnetting-np-pres`

### web/web-switch-operations
- KEEP **houses/web/presentations/web-switch-operations.presentation.html** at `web-switch-operations` (canonical)
- RENAME **houses/web/tools/web-switch-operations.tool.html** → `web-switch-operations-tool-2`
- RENAME **houses/web/network-plus/presentations/switch-operations.presentation.html** → `web-switch-operations-np-pres`

### web/web-vlan
- KEEP **houses/web/presentations/web-vlan.presentation.html** at `web-vlan` (canonical)
- RENAME **houses/web/tools/web-vlan.tool.html** → `web-vlan-tool-2`
- RENAME **houses/web/network-plus/presentations/vlan.presentation.html** → `web-vlan-np-pres`

### web/web-wireless-architecture
- KEEP **houses/web/presentations/web-wireless-architecture.presentation.html** at `web-wireless-architecture` (canonical)
- RENAME **houses/web/tools/web-wireless-architecture.tool.html** → `web-wireless-architecture-tool-2`
- RENAME **houses/web/network-plus/presentations/wireless-architecture.presentation.html** → `web-wireless-architecture-np-pres`

### web/web-wireless
- KEEP **houses/web/presentations/web-wireless.presentation.html** at `web-wireless` (canonical)
- RENAME **houses/web/tools/web-wireless.tool.html** → `web-wireless-tool-2`
- RENAME **houses/web/network-plus/presentations/wireless.presentation.html** → `web-wireless-np-pres`

## B. WEB NETWORK-PLUS / STANDALONE DUPLICATES (31 collisions)

Pattern: `houses/web/X.presentation.html` + `houses/web/network-plus/X.presentation.html` share key.
Strategy: standalone web house copy keeps original key; NP copy gets `-np` suffix.

- **web/networking-exam-flashcards**
  - KEEP `houses/web/exams/web-networking-exam-flashcards.exam.html` at `networking-exam-flashcards`
  - RENAME `houses/web/network-plus/exams/flashcards.exam.html` → `networking-exam-flashcards-np-exam`
- **web/web-networking-midterm**
  - KEEP `houses/web/exams/web-networking-midterm.exam.html` at `web-networking-midterm`
  - RENAME `houses/web/network-plus/exams/midterm.exam.html` → `web-networking-midterm-np-exam`
- **web/web-ne01-osi-scenario**
  - KEEP `houses/web/labs/web-ne01-osi-scenario.lab.html` at `web-ne01-osi-scenario`
  - RENAME `houses/web/network-plus/labs/ne01-osi-scenario.lab.html` → `web-ne01-osi-scenario-np-lab`
- **web/web-ne02-tcpip-scenario**
  - KEEP `houses/web/labs/web-ne02-tcpip-scenario.lab.html` at `web-ne02-tcpip-scenario`
  - RENAME `houses/web/network-plus/labs/ne02-tcpip-scenario.lab.html` → `web-ne02-tcpip-scenario-np-lab`
- **web/web-ne03-subnet-scenario**
  - KEEP `houses/web/labs/web-ne03-subnet-scenario.lab.html` at `web-ne03-subnet-scenario`
  - RENAME `houses/web/network-plus/labs/ne03-subnet-scenario.lab.html` → `web-ne03-subnet-scenario-np-lab`
- **web/web-ne07-nat-scenario**
  - KEEP `houses/web/labs/web-ne07-nat-scenario.lab.html` at `web-ne07-nat-scenario`
  - RENAME `houses/web/network-plus/labs/ne07-nat-scenario.lab.html` → `web-ne07-nat-scenario-np-lab`
- **web/web-ne08-wireless-scenario**
  - KEEP `houses/web/labs/web-ne08-wireless-scenario.lab.html` at `web-ne08-wireless-scenario`
  - RENAME `houses/web/network-plus/labs/ne08-wireless-scenario.lab.html` → `web-ne08-wireless-scenario-np-lab`
- **web/web-packet-analysis**
  - KEEP `houses/web/labs/web-packet-analysis.lab.html` at `web-packet-analysis`
  - RENAME `houses/web/network-plus/labs/packet-analysis.lab.html` → `web-packet-analysis-np-lab`
- **web/web-subnetting-practice**
  - KEEP `houses/web/labs/web-subnetting-practice.lab.html` at `web-subnetting-practice`
  - RENAME `houses/web/network-plus/labs/subnetting-practice.lab.html` → `web-subnetting-practice-np-lab`
- **web/web-vlan-config**
  - KEEP `houses/web/labs/web-vlan-config.lab.html` at `web-vlan-config`
  - RENAME `houses/web/network-plus/labs/vlan-config.lab.html` → `web-vlan-config-np-lab`
- **web/web-arp**
  - KEEP `houses/web/presentations/web-arp.presentation.html` at `web-arp`
  - RENAME `houses/web/network-plus/presentations/arp.presentation.html` → `web-arp-np-pres`
- **web/web-cables**
  - KEEP `houses/web/presentations/web-cables.presentation.html` at `web-cables`
  - RENAME `houses/web/network-plus/presentations/cables.presentation.html` → `web-cables-np-pres`
- **web/web-cloud-networking**
  - KEEP `houses/web/presentations/web-cloud-networking.presentation.html` at `web-cloud-networking`
  - RENAME `houses/web/network-plus/presentations/cloud-networking.presentation.html` → `web-cloud-networking-np-pres`
- **web/web-dhcp**
  - KEEP `houses/web/presentations/web-dhcp.presentation.html` at `web-dhcp`
  - RENAME `houses/web/network-plus/presentations/dhcp.presentation.html` → `web-dhcp-np-pres`
- **web/web-dns**
  - KEEP `houses/web/presentations/web-dns.presentation.html` at `web-dns`
  - RENAME `houses/web/network-plus/presentations/dns.presentation.html` → `web-dns-np-pres`
- **web/web-eigrp**
  - KEEP `houses/web/presentations/web-eigrp.presentation.html` at `web-eigrp`
  - RENAME `houses/web/network-plus/presentations/eigrp.presentation.html` → `web-eigrp-np-pres`
- **web/web-high-availability**
  - KEEP `houses/web/presentations/web-high-availability.presentation.html` at `web-high-availability`
  - RENAME `houses/web/network-plus/presentations/high-availability.presentation.html` → `web-high-availability-np-pres`
- **web/web-nat**
  - KEEP `houses/web/presentations/web-nat.presentation.html` at `web-nat`
  - RENAME `houses/web/network-plus/presentations/nat.presentation.html` → `web-nat-np-pres`
- **web/web-network-monitoring**
  - KEEP `houses/web/presentations/web-network-monitoring.presentation.html` at `web-network-monitoring`
  - RENAME `houses/web/network-plus/presentations/network-monitoring.presentation.html` → `web-network-monitoring-np-pres`
- **web/web-network-security**
  - KEEP `houses/web/presentations/web-network-security.presentation.html` at `web-network-security`
  - RENAME `houses/web/network-plus/presentations/network-security.presentation.html` → `web-network-security-np-pres`
- **web/web-ntp**
  - KEEP `houses/web/presentations/web-ntp.presentation.html` at `web-ntp`
  - RENAME `houses/web/network-plus/presentations/ntp.presentation.html` → `web-ntp-np-pres`
- **web/web-osi-model**
  - KEEP `houses/web/presentations/web-osi-model.presentation.html` at `web-osi-model`
  - RENAME `houses/web/network-plus/presentations/osi-model.presentation.html` → `web-osi-model-np-pres`
- **web/web-ospf**
  - KEEP `houses/web/presentations/web-ospf.presentation.html` at `web-ospf`
  - RENAME `houses/web/network-plus/presentations/ospf.presentation.html` → `web-ospf-np-pres`
- **web/web-ports**
  - KEEP `houses/web/presentations/web-ports.presentation.html` at `web-ports`
  - RENAME `houses/web/network-plus/presentations/ports.presentation.html` → `web-ports-np-pres`
- **web/web-tcp**
  - KEEP `houses/web/presentations/web-tcp.presentation.html` at `web-tcp`
  - RENAME `houses/web/network-plus/presentations/tcp.presentation.html` → `web-tcp-np-pres`
- **web/web-topologies**
  - KEEP `houses/web/presentations/web-topologies.presentation.html` at `web-topologies`
  - RENAME `houses/web/network-plus/presentations/topologies.presentation.html` → `web-topologies-np-pres`
- **web/web-wan-technologies**
  - KEEP `houses/web/presentations/web-wan-technologies.presentation.html` at `web-wan-technologies`
  - RENAME `houses/web/network-plus/presentations/wan-technologies.presentation.html` → `web-wan-technologies-np-pres`
- **web/web-networking-ch7-20**
  - KEEP `houses/web/quizzes/web-networking-ch7-20.quiz.html` at `web-networking-ch7-20`
  - RENAME `houses/web/network-plus/quizzes/ch7-20.quiz.html` → `web-networking-ch7-20-np-quiz`
- **web/web-ospf-cost**
  - KEEP `houses/web/tools/web-ospf-cost.tool.html` at `web-ospf-cost`
  - RENAME `houses/web/network-plus/tools/ospf-cost.tool.html` → `web-ospf-cost-np-tool`
- **web/web-port**
  - KEEP `houses/web/tools/web-port.tool.html` at `web-port`
  - RENAME `houses/web/network-plus/tools/port.tool.html` → `web-port-np-tool`
- **web/web-qos**
  - KEEP `houses/web/tools/web-qos.tool.html` at `web-qos`
  - RENAME `houses/web/network-plus/tools/qos.tool.html` → `web-qos-np-tool`

## C. NETWORK-ESSENTIALS / NETWORK-PLUS LAB DUPLICATES (11 collisions)

Strategy: standalone web/labs/ copy keeps original key; NP labs/ copy gets `-np` suffix.

- **web/web-ne-01**
  - KEEP `houses/web/network-essentials/ne-01.html` at `web-ne-01`
  - RENAME `houses/web/network-plus/modules/ne-01.html` → `web-ne-01-np-lab`
- **web/web-ne-02**
  - KEEP `houses/web/network-essentials/ne-02.html` at `web-ne-02`
  - RENAME `houses/web/network-plus/modules/ne-02.html` → `web-ne-02-np-lab`
- **web/web-ne-03**
  - KEEP `houses/web/network-essentials/ne-03.html` at `web-ne-03`
  - RENAME `houses/web/network-plus/modules/ne-03.html` → `web-ne-03-np-lab`
- **web/web-ne-04**
  - KEEP `houses/web/network-essentials/ne-04.html` at `web-ne-04`
  - RENAME `houses/web/network-plus/modules/ne-04.html` → `web-ne-04-np-lab`
- **web/web-ne-05**
  - KEEP `houses/web/network-essentials/ne-05.html` at `web-ne-05`
  - RENAME `houses/web/network-plus/modules/ne-05.html` → `web-ne-05-np-lab`
- **web/web-ne-06**
  - KEEP `houses/web/network-essentials/ne-06.html` at `web-ne-06`
  - RENAME `houses/web/network-plus/modules/ne-06.html` → `web-ne-06-np-lab`
- **web/web-ne-07**
  - KEEP `houses/web/network-essentials/ne-07.html` at `web-ne-07`
  - RENAME `houses/web/network-plus/modules/ne-07.html` → `web-ne-07-np-lab`
- **web/web-ne-08**
  - KEEP `houses/web/network-essentials/ne-08.html` at `web-ne-08`
  - RENAME `houses/web/network-plus/modules/ne-08.html` → `web-ne-08-np-lab`
- **web/web-ne-09**
  - KEEP `houses/web/network-essentials/ne-09.html` at `web-ne-09`
  - RENAME `houses/web/network-plus/modules/ne-09.html` → `web-ne-09-np-lab`
- **web/web-ne-10**
  - KEEP `houses/web/network-essentials/ne-10.html` at `web-ne-10`
  - RENAME `houses/web/network-plus/modules/ne-10.html` → `web-ne-10-np-lab`
- **web/web-network-essentials**
  - KEEP `houses/web/presentations/web-network-essentials.presentation.html` at `web-network-essentials`
  - RENAME `houses/web/network-plus/presentations/network-essentials.presentation.html` → `web-network-essentials-np-lab`

## D. CLH APPLET + MODULE PAIRS (31 collisions)

Pattern: script CLH course where the per-module page (`courses/clh/modules/clh-NNN/index.html`) and an applet page in the same module folder share the topic key.
Strategy: module index keeps original topic key; applet gets `-applet` suffix.

- **script/script-clh-001-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-001-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-001/script-intro.module.html`
- **script/script-clh-002-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-002-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-002/script-intro.module.html`
- **script/script-clh-003-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-003-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-003/script-intro.module.html`
- **script/script-clh-004-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-004-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-004/script-intro.module.html`
- **script/script-clh-005-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-005-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-005/script-intro.module.html`
- **script/script-clh-006-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-006-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-006/script-intro.module.html`
- **script/script-clh-007-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-007-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-007/script-intro.module.html`
- **script/script-clh-008-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-008-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-008/script-intro.module.html`
- **script/script-clh-009-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-009-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-009/script-intro.module.html`
- **script/script-clh-010-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-010-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-010/script-intro.module.html`
- **script/script-clh-011-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-011-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-011/script-intro.module.html`
- **script/script-clh-012-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-012-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-012/script-intro.module.html`
- **script/script-clh-013-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-013-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-013/script-intro.module.html`
- **script/script-clh-014-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-014-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-014/script-intro.module.html`
- **script/script-clh-015-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-015-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-015/script-intro.module.html`
- **script/script-clh-016-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-016-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-016/script-intro.module.html`
- **script/script-clh-017-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-017-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-017/script-intro.module.html`
- **script/script-clh-018-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-018-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-018/script-intro.module.html`
- **script/script-clh-019-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-019-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-019/script-intro.module.html`
- **script/script-clh-020-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-020-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-020/script-intro.module.html`
- **script/script-clh-021-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-021-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-021/script-intro.module.html`
- **script/script-clh-022-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-022-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-022/script-intro.module.html`
- **script/script-clh-023-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-023-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-023/script-intro.module.html`
- **script/script-clh-024-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-024-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-024/script-intro.module.html`
- **script/script-clh-025-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-025-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-025/script-intro.module.html`
- **script/script-clh-026-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-026-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-026/script-intro.module.html`
- **script/script-clh-027-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-027-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-027/script-intro.module.html`
- **script/script-clh-028-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-028-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-028/script-intro.module.html`
- **script/script-clh-029-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-029-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-029/script-intro.module.html`
- **script/script-clh-030-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-030-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-030/script-intro.module.html`
- **script/script-clh-031-intro** (manual review — pattern doesn't match)
  - `houses/script/clh/script-clh-031-intro.applet.html`
  - `houses/script/courses/clh/modules/clh-031/script-intro.module.html`

## E. MIGRATION SHIM ENTRIES

Add to `_app/components/ModuleProgress.js` initialization (one call per rename):

```js
// PROG-003 migration — Symbiosis sprint, 76 renames
ModuleProgress.migrateLegacyKey('forge', 'forge-admin-tools', 'forge-admin-tools-aplus-c2-lab');
ModuleProgress.migrateLegacyKey('forge', 'forge-admin-tools', 'forge-admin-tools-aplus-c2-pres');
ModuleProgress.migrateLegacyKey('forge', 'forge-control-panel', 'forge-control-panel-aplus-c2-lab');
ModuleProgress.migrateLegacyKey('forge', 'forge-control-panel', 'forge-control-panel-aplus-c2-pres');
ModuleProgress.migrateLegacyKey('forge', 'forge-system-tools', 'forge-system-tools-aplus-c2-lab');
ModuleProgress.migrateLegacyKey('forge', 'forge-system-tools', 'forge-system-tools-aplus-c2-pres');
ModuleProgress.migrateLegacyKey('forge', 'forge-windows-editions', 'forge-windows-editions-aplus-c2-lab');
ModuleProgress.migrateLegacyKey('forge', 'forge-windows-editions', 'forge-windows-editions-aplus-c2-pres');
ModuleProgress.migrateLegacyKey('forge', 'forge-windows-settings', 'forge-windows-settings-aplus-c2-lab');
ModuleProgress.migrateLegacyKey('forge', 'forge-windows-settings', 'forge-windows-settings-aplus-c2-pres');
ModuleProgress.migrateLegacyKey('web', 'web-devices', 'web-devices-tool-2');
ModuleProgress.migrateLegacyKey('web', 'web-devices', 'web-devices-np-pres');
ModuleProgress.migrateLegacyKey('web', 'web-etherchannel', 'web-etherchannel-tool-2');
ModuleProgress.migrateLegacyKey('web', 'web-etherchannel', 'web-etherchannel-np-pres');
ModuleProgress.migrateLegacyKey('web', 'web-fhrp', 'web-fhrp-tool-2');
ModuleProgress.migrateLegacyKey('web', 'web-fhrp', 'web-fhrp-np-pres');
ModuleProgress.migrateLegacyKey('web', 'web-ipv6', 'web-ipv6-tool-2');
ModuleProgress.migrateLegacyKey('web', 'web-ipv6', 'web-ipv6-np-pres');
ModuleProgress.migrateLegacyKey('web', 'web-osi-deep-dive', 'web-osi-deep-dive-tool-2');
ModuleProgress.migrateLegacyKey('web', 'web-osi-deep-dive', 'web-osi-deep-dive-np-pres');
ModuleProgress.migrateLegacyKey('web', 'web-osi', 'web-osi-tool-2');
ModuleProgress.migrateLegacyKey('web', 'web-osi', 'web-osi-np-pres');
ModuleProgress.migrateLegacyKey('web', 'web-stp', 'web-stp-tool-2');
ModuleProgress.migrateLegacyKey('web', 'web-stp', 'web-stp-np-pres');
ModuleProgress.migrateLegacyKey('web', 'web-subnetting', 'web-subnetting-tool-2');
ModuleProgress.migrateLegacyKey('web', 'web-subnetting', 'web-subnetting-np-pres');
ModuleProgress.migrateLegacyKey('web', 'web-switch-operations', 'web-switch-operations-tool-2');
ModuleProgress.migrateLegacyKey('web', 'web-switch-operations', 'web-switch-operations-np-pres');
ModuleProgress.migrateLegacyKey('web', 'web-vlan', 'web-vlan-tool-2');
ModuleProgress.migrateLegacyKey('web', 'web-vlan', 'web-vlan-np-pres');
ModuleProgress.migrateLegacyKey('web', 'web-wireless-architecture', 'web-wireless-architecture-tool-2');
ModuleProgress.migrateLegacyKey('web', 'web-wireless-architecture', 'web-wireless-architecture-np-pres');
ModuleProgress.migrateLegacyKey('web', 'web-wireless', 'web-wireless-tool-2');
ModuleProgress.migrateLegacyKey('web', 'web-wireless', 'web-wireless-np-pres');
ModuleProgress.migrateLegacyKey('web', 'networking-exam-flashcards', 'networking-exam-flashcards-np-exam');
ModuleProgress.migrateLegacyKey('web', 'web-networking-midterm', 'web-networking-midterm-np-exam');
ModuleProgress.migrateLegacyKey('web', 'web-ne01-osi-scenario', 'web-ne01-osi-scenario-np-lab');
ModuleProgress.migrateLegacyKey('web', 'web-ne02-tcpip-scenario', 'web-ne02-tcpip-scenario-np-lab');
ModuleProgress.migrateLegacyKey('web', 'web-ne03-subnet-scenario', 'web-ne03-subnet-scenario-np-lab');
ModuleProgress.migrateLegacyKey('web', 'web-ne07-nat-scenario', 'web-ne07-nat-scenario-np-lab');
ModuleProgress.migrateLegacyKey('web', 'web-ne08-wireless-scenario', 'web-ne08-wireless-scenario-np-lab');
ModuleProgress.migrateLegacyKey('web', 'web-packet-analysis', 'web-packet-analysis-np-lab');
ModuleProgress.migrateLegacyKey('web', 'web-subnetting-practice', 'web-subnetting-practice-np-lab');
ModuleProgress.migrateLegacyKey('web', 'web-vlan-config', 'web-vlan-config-np-lab');
ModuleProgress.migrateLegacyKey('web', 'web-arp', 'web-arp-np-pres');
ModuleProgress.migrateLegacyKey('web', 'web-cables', 'web-cables-np-pres');
ModuleProgress.migrateLegacyKey('web', 'web-cloud-networking', 'web-cloud-networking-np-pres');
ModuleProgress.migrateLegacyKey('web', 'web-dhcp', 'web-dhcp-np-pres');
ModuleProgress.migrateLegacyKey('web', 'web-dns', 'web-dns-np-pres');
ModuleProgress.migrateLegacyKey('web', 'web-eigrp', 'web-eigrp-np-pres');
ModuleProgress.migrateLegacyKey('web', 'web-high-availability', 'web-high-availability-np-pres');
ModuleProgress.migrateLegacyKey('web', 'web-nat', 'web-nat-np-pres');
ModuleProgress.migrateLegacyKey('web', 'web-network-monitoring', 'web-network-monitoring-np-pres');
ModuleProgress.migrateLegacyKey('web', 'web-network-security', 'web-network-security-np-pres');
ModuleProgress.migrateLegacyKey('web', 'web-ntp', 'web-ntp-np-pres');
ModuleProgress.migrateLegacyKey('web', 'web-osi-model', 'web-osi-model-np-pres');
ModuleProgress.migrateLegacyKey('web', 'web-ospf', 'web-ospf-np-pres');
ModuleProgress.migrateLegacyKey('web', 'web-ports', 'web-ports-np-pres');
ModuleProgress.migrateLegacyKey('web', 'web-tcp', 'web-tcp-np-pres');
ModuleProgress.migrateLegacyKey('web', 'web-topologies', 'web-topologies-np-pres');
ModuleProgress.migrateLegacyKey('web', 'web-wan-technologies', 'web-wan-technologies-np-pres');
ModuleProgress.migrateLegacyKey('web', 'web-networking-ch7-20', 'web-networking-ch7-20-np-quiz');
ModuleProgress.migrateLegacyKey('web', 'web-ospf-cost', 'web-ospf-cost-np-tool');
ModuleProgress.migrateLegacyKey('web', 'web-port', 'web-port-np-tool');
ModuleProgress.migrateLegacyKey('web', 'web-qos', 'web-qos-np-tool');
ModuleProgress.migrateLegacyKey('web', 'web-ne-01', 'web-ne-01-np-lab');
ModuleProgress.migrateLegacyKey('web', 'web-ne-02', 'web-ne-02-np-lab');
ModuleProgress.migrateLegacyKey('web', 'web-ne-03', 'web-ne-03-np-lab');
ModuleProgress.migrateLegacyKey('web', 'web-ne-04', 'web-ne-04-np-lab');
ModuleProgress.migrateLegacyKey('web', 'web-ne-05', 'web-ne-05-np-lab');
ModuleProgress.migrateLegacyKey('web', 'web-ne-06', 'web-ne-06-np-lab');
ModuleProgress.migrateLegacyKey('web', 'web-ne-07', 'web-ne-07-np-lab');
ModuleProgress.migrateLegacyKey('web', 'web-ne-08', 'web-ne-08-np-lab');
ModuleProgress.migrateLegacyKey('web', 'web-ne-09', 'web-ne-09-np-lab');
ModuleProgress.migrateLegacyKey('web', 'web-ne-10', 'web-ne-10-np-lab');
ModuleProgress.migrateLegacyKey('web', 'web-network-essentials', 'web-network-essentials-np-lab');
```

Each call is idempotent — runs once per browser, no-ops if already migrated.

## F. EXECUTION CHECKLIST (per rename)

For each non-canonical file in sections A-D:

1. Edit the file: change `ModuleProgress.complete(houseId, oldKey, ...)` → `ModuleProgress.complete(houseId, newKey, ...)`
2. Find any container page that references the file by data-module="oldKey" → check whether any hub renderer needs an update
3. Add ContentCatalog entry for the new key (if not already present)
4. Add migration shim entry per section E
5. After all renames: run PROG-003 audit — should report 0 medium for these files
6. Smoke gate + EduScan suite green before commit
