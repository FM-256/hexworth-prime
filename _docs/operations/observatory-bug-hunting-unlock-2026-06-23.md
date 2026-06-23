# Observatory — Bug Hunting Hub Unlock

*2026-06-23*

## TLDR

The Bug Hunting hub (`/dark-arts/vault/bug-hunting/`) was the only Hexworth Observatory
course unreachable by a normal sorted student. It was guarded by
`AccessGuard.require('dark-arts')` (all 5 Dark Arts Gates) purely because the hub lives in
the Dark Arts **Vault** directory. We lowered the guard to `AccessGuard.require('sorted')`
across all 70 hub pages, bringing it to parity with every other Observatory course —
including its same-tier siblings Foundations of Ethical Hacking and Command Line Hacker.

## Problem

The Observatory (Polaris research house) lists ~17 scheduled courses as pointer cards to
their real homes. The Bug Hunting card (`obs-bug-hunting` in
`_app/houses/observatory/index.html`) links to `/dark-arts/vault/bug-hunting/`.

| Course (Observatory) | Cert tier | Guard (before) |
|----------------------|-----------|----------------|
| Foundations of Ethical Hacking | Offensive Security | `sorted` |
| Command Line Hacker | Offensive | `sorted` |
| Advanced Linux Admin | CTS4321C | `sorted` |
| Principles of Information Security | CIS2350C | `sorted` |
| **Bug Hunting** | **Offensive Security** | **`dark-arts` (5 Gates)** ← outlier |

A consented, sorted Observatory student clicking Bug Hunting was bounced to the Dark Arts
gate: *"You must complete all Five Gates to enter the Vault."* The lock was an accident of
file location, not a deliberate design choice.

## Change

Scoped, exact-string replace **only** within `_app/dark-arts/vault/bug-hunting/`:

```
- <script>AccessGuard.require('dark-arts');</script>
+ <script>AccessGuard.require('sorted');</script>
```

- **70 HTML files**: hub index + 26 modules + 18 labs + 9 quizzes + 6 dojo belts + 3 tools
  + sub-indexes.
- `git diff --stat`: 70 files changed, 70 insertions(+), 70 deletions(-) — exactly one line
  per file, only the guard token.
- **Nothing outside the hub touched.** The rest of the Dark Arts Vault stays 5-Gate locked.

### Why all 70 (not just the index)
Every page in the hub carried the `dark-arts` guard. Flipping only the index would let a
student reach the landing page, then bounce them off every module/lab/quiz inside —
a fake fix.

## Verification

Headless run against the **real page + real AccessGuard** (local server), simulating a
sorted student (`localStorage hexworth_house=shield`, zero gates):

| Guard | Result |
|-------|--------|
| NEW `require('sorted')` | `true` → IN |
| OLD `require('dark-arts')` | `false` → would have BLOCKED |

Confirms the flip admits exactly the students the Observatory routes here, and that the old
guard was precisely what blocked them. Parity with FEH (`/houses/dark-arts/feh/`) and CLH
(`/houses/script/courses/clh/`) is byte-identical (`AccessGuard.require('sorted')`).

`AccessGuard` reference: `sorted` = `localStorage 'hexworth_house' !== null`
(`_app/components/AccessGuard.js:418`); `dark-arts` = `hasPassedGatesUpTo(5)`
(`_app/components/AccessGuard.js:724`).

## Tradeoff (operator-accepted, Option A)

Because the hub still lives under `/dark-arts/vault/`, lowering the guard means any sorted
user reaching the URL from anywhere gets in — i.e. this hub is no longer behind the 5 Gates
for Dark Arts progression either. The operator chose this (parity, simplest, no new moving
parts) over an Observatory-only bypass in `AccessGuard.js` (would have preserved the Vault
lock for Dark Arts students but added a Firestore-aware branch to the security-critical
shared guard) or relocating the hub out of the Vault (multi-file move + quiz-bridge risk).

## Gates

- Chris QC gate: **PASS** (all three bar conditions verified against the actual diff).
- Deploy: `./deploy.sh` (Nexus → smoke → firebase hosting → post-verify), operator-authorized
  per Rule #10 on `master`.
