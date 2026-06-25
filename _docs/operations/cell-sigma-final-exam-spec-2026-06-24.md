# Cell-Σ — ALA Final Exam Commissioning Box (Draft Spec)

**Course:** CTS4321C Advanced Linux Administration (Matrix house · "Sector 7 / the grid")
**Status:** Increment 1 SHIPPED — DNS stage live end-to-end (image + lab-manager registration + exam page + flag bridge). Stages firstlight + assembly…audit not yet built.
**Date:** 2026-06-24
**Author:** build session (post L07 fix)

---

## Flag secrecy — HARDENED 2026-06-24 (server-side delivery, sudo-extraction CLOSED)

**Original finding (operator-signed-off, now fixed):** the DNS-stage flag was a literal in the in-container grader, extractable via `sudo grep FLAG{ /opt/grid/commission-check`. Root-in-container made an in-image fix impossible.

**Fix shipped (bc1, verified end-to-end):** the flag literal is removed from the container entirely. On a local pass the grader calls lab-manager `GET /api/sandbox/commission/:sessionId?stage=dns`; lab-manager **independently verifies the cell's real state** by `docker exec`-ing into the running container (named running + forward/reverse resolution) and only then returns the flag, which is held **server-side only** (`COMMISSION_FLAGS` in `lab-manager/server.js`, never copied to the image). The grader reads the session id from `/run/grid-session` (written at boot, because `sudo -i` strips env). Verified on a real API-launched container:
- the flag value is **nowhere** in the container filesystem (`grep -r` → 0 matches);
- grading before the work, and a forged direct call to the endpoint, both return no flag (`{"ok":false}`);
- doing the real DNS work → server verifies → flag delivered.

**Residual (lesser, acceptable for now):** a flag, once legitimately obtained, can still be **shared between students** (the value is static across students). Closing this needs per-student salting — lab-manager has `STUDENT_UID` at launch and could return a uid-salted flag, but `validateFlag` (shared by 239 boxes) would need to compute the same salt; deferred as a separate enhancement. Sudo-extraction — the operator's actual finding — is closed.

**Backups on bc1:** `server.js.bak-cellsigma`, `server.js.bak-commission`.

---

## TLDR

A real-container final exam: the student is handed a **bare, freshly-flashed grid cell** and a commissioning order. To pass, they build it up from a minimal base into a fully-operational Sector 7 node — re-performing every skill ALA taught, self-directed, in sequence, with no per-lab hand-holding. Each commissioning milestone reveals a flag; full commissioning + final audit = the capstone flag.

This runs on the **already-live container infra** (bc1 lab-manager + traefik + sablier), not the simulated JS engine. The plumbing is verified working. The honest constraint: a container shares the host kernel, so this is **"build the server from a minimal userland base,"** not bare-metal OS install + partitioning (that needs a VM backend we don't have).

---

## 1. Verified launch plumbing (2026-06-24)

The real-container path is live and healthy — confirmed this session:

| Piece | State |
|---|---|
| `lab-manager` (Node API) on bc1 | Up 2 months, PID 1 = node, `/api/sandbox/health` → **HTTP 200** over `sandbox-net` |
| Public route | traefik `PathPrefix(/api/sandbox)` → `lab-manager:3000`; session UI at `sandbox.hexworth.tech/s/{id}/` |
| Launch contract | `POST /api/sandbox/launch {labId}` + Firebase bearer → `{sessionId, url}`; also `GET /status/:id`, `DELETE /destroy/:id`, `GET /list` |
| Frontend SDK | `_app/components/SandboxLauncher.js` — `launch(labId)`, `renderButton(el, labId)`; client `LAB_INFO[labId]` registry |
| Already shipping | DevOps `do-100/101/102`, Script DB labs, `arctic/districts/linux-admin/` all use it |
| Images on bc1 | `terminal-full` (Ubuntu, minimal), `terminal-light` (Alpine), `ide` (code-server), `postgres-lab`, base `ubuntu:22.04/24.04`, `alpine:3.20` |

**To add Cell-Σ — exactly three integration points + a page:**
1. Build `hexworth/cell-sigma:latest` on bc1 (minimal base + planted exam state + web-terminal connect surface + real grading scripts).
2. Add a `cell-sigma` entry to the `LABS` registry in `/app/server.js` on bc1 (image, memory, cpus, port) → restart lab-manager.
3. Add `cell-sigma` to `LAB_INFO` in `_app/components/SandboxLauncher.js` (name, tier, blurb).
4. Build the exam page under `_app/houses/matrix/adv-linux/` (briefing + launch button + flag submission).

---

## 2. Container reality — what's REAL vs what needs a shim

The image is genuinely minimal (good for "from zero"): `bash`, `make`, `apt`, `useradd` present; `named`, `gcc`, `iptables`, `sshd`, `cron`, `aide`, `systemctl`, `ip` **absent** — the student installs them. PID 1 is `sh` (no systemd). Security profile per launch: `CapDrop: ALL`, `CapAdd: [CHOWN, SETUID, SETGID, DAC_OVERRIDE, NET_BIND_SERVICE]`, `no-new-privileges`.

| ALA skill | In a real container | Verdict |
|---|---|---|
| **L07 DNS (BIND9)** | `apt install bind9`, configure zones, bind :53 (NET_BIND_SERVICE present), resolve for real | ✅ REAL |
| **L06 compile from source** | `apt install gcc make`, build `gridmon` from an offline source tree baked into the image | ✅ REAL |
| **L08 bash + cron** | `apt install cron`; run `cron` in foreground (no systemd) or via a tiny supervisor | ✅ REAL (cron started manually) |
| **L10 AIDE integrity** | `apt install aide`, init DB, detect planted changes | ✅ REAL |
| **L02 SSH keys / users / perms** | `apt install openssh-server`, configure key-only auth, run sshd; "connect from another cell" needs a 2nd container | ✅ REAL (single-host) / ⚠ cross-host = 2 containers |
| **L03 rogue-process hunt** | plant a disguised process at boot; student finds + kills | ✅ REAL |
| **L11 resource troubleshooting** | plant a runaway proc / disk filler / bad cron | ✅ REAL |
| **L05 / L09 forensics** | plant auth-log artifacts + poisoned zone records to find + remediate | ✅ REAL |
| **L12 full audit** | real audit pass over the box's actual state | ✅ REAL |
| **L01 systemd service recovery** | no systemd (PID 1 = sh) | ⚠ RESHAPE — use a supervisor (s6/supervisord) the student repairs, or a thin `systemctl` shim, or reframe as "service won't start" without systemd |
| **L04 iptables firewalling** | needs `CAP_NET_ADMIN` — **dropped** by current security profile | ⚠ TRADEOFF — grant NET_ADMIN to the exam image only (security cost), or simulate, or score firewall *policy authoring* (write correct rules to a file we validate) without live enforcement |
| **L02 network bring-up** | docker owns the netns; the container is already on the grid | ❌ NOT student-configurable — frame the cell as "already cabled to the grid" |

**Coverage if we ship as-is:** ~8 of the course's skills run genuinely for real. 2–3 (systemd recovery, iptables, raw network bring-up) need a decision: shim, capability-grant, or reframe.

---

## 3. Commissioning milestones (the exam)

Narrative: *"Cell-Σ has been cabled to the grid but ships dark. Commission it as a production Sector 7 node. The grid will not trust it until every system is online and the cell passes a clean audit."* Each stage reveals one flag; stages are gated so the student works in a sane order, but the box is open (they can explore freely).

1. **First Light** — establish users/permissions, key-only SSH, baseline the box. *(L02)*
2. **Name Authority** — stand up BIND9 so the grid can resolve `cell-sigma.sector7.matrix.net`. *(L07)*
3. **Field Assembly** — compile + install `gridmon` from the offline source tree. *(L06)*
4. **The Watch** — bash maintenance scripts + scheduled cron jobs. *(L08)*
5. **Integrity Seal** — initialize AIDE; produce a trusted baseline. *(L10)*
6. **Perimeter** — firewall policy for the cell. *(L04 — see TRADEOFF; final form depends on §2 decision)*
7. **Ghost Hunt** — a disguised rogue process + a resource leak planted at boot; find + clear. *(L03/L11)*
8. **Cold Case** — planted intrusion artifacts (auth-log + poisoned zone records); investigate, remediate, report. *(L05/L09)*
9. **Commissioning Audit** — run the clean audit; **zero outstanding issues = CELL COMMISSIONED** → capstone flag. *(L12)*

---

## 4. Grading model (proposed)

Mirror the existing `/opt/verify/check-*.sh` convention, but **real**: bake verification scripts into the image (`/opt/grid/commission-check <stage>`) that inspect *actual system state* — is `named` answering on :53? does `dig` resolve the cell? is the AIDE DB present and the planted change detected? is the rogue PID gone? — and print `FLAG{...}` only when the real state is correct. Flags are registered in `flag_registry` (Firestore) per the arena flag pattern; the student submits them through the Submit Flag UI on the exam page. No client-side scoring.

This keeps it honest (you can't get the flag without actually doing the work) and reuses the platform's flag bridge.

**Open:** confirm whether final-exam flags should also gate via the server-graded bridge (`flag_registry` seeding + `verify` step), same as arena boxes — recommended yes, for integrity.

---

## 5. Build checklist (once spec is approved)

- [ ] Author the offline `gridmon` source tree + planted faults/artifacts (content design)
- [ ] Write `/opt/grid/commission-check` real verification scripts (one per stage) + flag values
- [ ] Build `hexworth/cell-sigma:latest` Dockerfile on bc1 (minimal base + web terminal + planted state + scripts)
- [ ] Decide §2 tradeoffs: systemd shim?  NET_ADMIN for iptables?  network reframe?
- [ ] Add `cell-sigma` to `LABS` in `/app/server.js` (bc1) + restart lab-manager
- [ ] Add `cell-sigma` to `LAB_INFO` in `SandboxLauncher.js` (hexworth-prime)
- [ ] Seed `flag_registry/{cell-sigma-*}` in Firestore + run the bridge verify
- [ ] Build the exam page `_app/houses/matrix/adv-linux/final-exam/` (briefing + launch + submit)
- [ ] QC end-to-end against a REAL launched container (commission it start→finish, all flags) — per the boot-the-real-engine rule
- [ ] Chris gate → deploy hosting; image + server changes are bc1-side (not a firebase deploy)

---

## 6. Decisions needed from operator

1. **Backend confirmed?** Real container (this spec) vs fully-simulated (JS engine, can fake OS-install screens) vs hold for a VM backend (true bare-metal install).
2. **The three constraint calls (§2):** for systemd-recovery, iptables, and network bring-up — shim / capability-grant / reframe / drop each?
3. **Scope of the milestone set (§3):** all 9 stages, or trim? Time budget per the 120-min container lifetime (a full 9-stage commission may exceed one session — do we allow resume across sessions, or scope to fit ~120 min?).
4. **Grading (§4):** real in-container verification scripts + flag_registry bridge — confirm.
