# Dark Arts Vault & Gates

**Status:** SHIPPED (Gates I-VIII live, Gates IX-XIII built/planned)
**Components:** `gate-cipher.js`, `AccessGuard.js` (gate protection), vault `index.html` (tier renderer)
**Location:** `_app/dark-arts/` (standalone vault hub), `_app/houses/dark-arts/` (house-level FEH content)
**Added:** v3.0.0 (Five Gates), expanded to 8-gate system in v5.0.0
**Last reviewed:** 2026-04-05

## Purpose

The Dark Arts is Hexworth Prime's offensive security division. Unlike other houses where
content is freely accessible after sorting, the Dark Arts locks advanced content behind
a progressive gate system. Students must solve real security challenges -- hex decoding,
Base64, steganography, DTMF audio analysis -- to prove competency before accessing the
next tier of material.

This serves two purposes: it teaches practical offensive skills through the act of
gaining access, and it gates dangerous knowledge (exploitation techniques, malware
analysis) behind demonstrated ability. You don't read about hacking -- you hack your
way in.

## Architecture — Two Locations, One House

The Dark Arts has a split architecture that differs from every other house:

```
_app/houses/dark-arts/              _app/dark-arts/
(House-level content)               (Standalone Vault hub)
       |                                   |
       |-- index.html (HouseRenderer)      |-- gate-1.html (entry gate)
       |-- presentations/ (10 FEH)         |-- gate-cipher.js (cipher rotation)
       |-- labs/ (10 FEH labs)             |-- gates/ (gates 2-5)
       |-- games/ (7 applets)              |-- vault/
                                           |   |-- index.html (tier renderer, 1,591 lines)
                                           |   |-- gates/ (gates 6-13)
                                           |   |-- modules/ (malware analysis)
                                           |   |-- labs/ (Linux hacking)
                                           |   |-- tools/ (analysis toolkit)
                                           |   |-- quizzes/
                                           |   |-- ehe/ (Ethical Hacking Essentials)
                                           |   |-- bug-hunting/ (Security Research Academy)
                                           |   |-- wifi-arsenal/ (10 modules, 12 labs, 3 quizzes)
                                           |   |-- dojo/
                                           |-- ctf-leaderboard.applet.html
                                           |-- assets/
```

**Why the split:** The house-level content (`houses/dark-arts/`) uses HouseRenderer like
every other house and holds the FEH (Fundamentals of Ethical Hacking) course -- 10
presentations, 10 labs. This is open to any sorted student. The standalone vault hub
(`dark-arts/`) holds gated offensive content that requires gate completion to access.

## The Gate System

### Gate Progression (8 active, 5 planned)

| Gate | Rank | Skill Tested | Location |
|------|------|-------------|----------|
| **I** | Initiate | Source code inspection, hex decoding | `_app/dark-arts/gate-1.html` |
| **II** | Apprentice | CSS inspection, Base64 decoding | `_app/dark-arts/gates/gate-2.html` |
| **III** | Seeker | Steganography, hidden data | `_app/dark-arts/gates/gate-3.html` |
| **IV** | Cipher | DTMF audio analysis, signal decoding | `_app/dark-arts/gates/gate-4.html` |
| **V** | Conjurer | Synthesis -- combine clues from Gates I-IV | `_app/dark-arts/gates/gate-5.html` |
| **VI** | Analyst | Static analysis mastery | `_app/dark-arts/vault/gates/gate-6.html` |
| **VII** | Sentinel | Threat intelligence skills | `_app/dark-arts/vault/gates/gate-7.html` |
| **VIII** | Master | Forensic investigation | `_app/dark-arts/vault/gates/gate-8.html` |
| IX | Phantom | Reverse engineering, deep analysis | Built, not yet wired |
| X | Grandmaster | Incident command, red team ops | Built, not yet wired |
| XI-XIII | -- | Crypto, social engineering, synthesis | Coming soon |

### Monthly Cipher Rotation

Gate answers rotate on a monthly cycle via `gate-cipher.js`:

- **4 cipher sets** selected by `new Date().getMonth() % 4`
- Set 0: Jan, May, Sep
- Set 1: Feb, Jun, Oct
- Set 2: Mar, Jul, Nov
- Set 3: Apr, Aug, Dec

Each set provides different clue data for Gates I-IV (hex strings, Base64 strings, DTMF codes).
Answer validation is **server-side** via the `validateGateAnswer` Cloud Function for authenticated
users, with a client-side fallback for offline/unauthenticated access.

**Version check:** On vault load, `GATE_CIPHER.checkVersion()` compares the stored `gate_version`
against the current `VERSION` constant (`'2026-02'`). If mismatched, all gate progress is wiped
and the user must re-clear gates with the new cipher set. This prevents stale answers from
granting access after a rotation.

### Answer Validation (Dual Path)

```
Student submits answer
  |
  |-- Is user authenticated (FirebaseAuth)?
  |     |
  |     YES --> checkAnswerServer(gateNumber, input)
  |     |         |-- Calls validateGateAnswer Cloud Function
  |     |         |-- Server reads gate_registry in Firestore
  |     |         |-- Returns { correct: boolean }
  |     |         |-- Rate limited (resource-exhausted error on abuse)
  |     |
  |     NO --> Client-side fallback (null = "server unavailable")
  |              |-- Legacy: SHA-256 hash comparison (deprecated)
  |              |-- Hashes removed from client in 2026-02 rotation
  |
  |-- If correct: localStorage gate{N}_complete = 'true'
  |-- Vault re-renders, next tier unlocks
```

### Access Control Integration

`AccessGuard.js` provides the `require('gate', N)` protection level:

- **Gate check:** `hasPassedGate(gateNumber)` reads `localStorage.gate{N}_complete`
- **Master Key override:** `hasMasterKeyGateAccess(gateNumber)` grants temporary 5-minute
  bypass via `sessionStorage.master_gate{N}_complete`
- **God Mode:** `sessionStorage.hexworth_god_mode` bypasses all gate checks
- **Backward compatibility:** `dark_arts_unlocked` and `gate5_complete` from the original
  Five Gates system still grant vault access

The vault's own `index.html` requires only `AccessGuard.require('gate', 1)` at the HTML level.
Internal per-tier gating is handled by JavaScript -- `getHighestCompletedGate()` checks
gates 1-8 sequentially, and the renderer locks/unlocks tiers accordingly.

## The Vault (Tier Renderer)

`vault/index.html` (1,591 lines) is a self-contained renderer that builds the entire
vault UI dynamically from a `LEVELS` configuration array. Each level defines:

- Level number, rank name, subtitle
- Gate href and description
- CSS rank color class
- Array of module cards (title, icon, description, href)

### 8 Active Tiers

| Level | Rank | Subtitle | Modules |
|-------|------|----------|---------|
| 1 | Initiate | Source Inspection & Recon | Sandbox Setup, Kill Chain, Footprinting, Analysis Toolkit |
| 2 | Apprentice | Encoding & Enumeration | Static Analysis, Enumeration, Network Scanning, Nmap Training |
| 3 | Seeker | Data Analysis & Hidden Channels | Steganography, Sniffing, Nmap Scanning, CEH Reference |
| 4 | Cipher | Credentials & Access | Password Attacks, John, Hashcat, Hydra Training |
| 5 | Conjurer | Web Exploitation & Malware | SQLi, XSS, OWASP Top 10, CSRF, SSRF, IDOR, JWT, Malware Families, Metasploit |
| 6 | Analyst | Deep Analysis & Exploitation | Behavioral Analysis, Dynamic Analysis, Reverse Engineering, Buffer Overflow, Session Hijacking |
| 7 | Sentinel | Threat Response & Defense | Incident Response, Botnet Architecture, Wireless Attacks, WiFi Arsenal, DoS/DDoS, IDS Evasion, PrivEsc |
| 8 | Master | Advanced Operations | Cloud Hacking, Mobile Security, IoT Security, Social Engineering Advanced |

### Always-Available Content (No gate required)

4 modules bypass the gate system entirely:
- **Dark Arts Mastery Quiz** -- 25-question assessment
- **CTF Leaderboard** -- Live competition scoreboard
- **Ethical Hacking Essentials (EHE)** -- EC-Council EHEv1 course (13 modules, 20 labs, 10 quizzes)
- **Bug Hunting** -- Security Research Academy (recon, web vulns, API, reporting)

### Rank Badge System

The vault header displays a dynamic rank badge based on `getHighestCompletedGate()`:

| Gate | Rank | Badge Color |
|------|------|------------|
| 0 | Locked | -- |
| 1 | Initiate | `#6a7a6a` (dim green) |
| 2 | Apprentice | `#7a9a7a` (green) |
| 3 | Seeker | `#7a8a9a` (blue-grey) |
| 4 | Cipher | `#8a7a9a` (purple-grey) |
| 5 | Conjurer | `#9a7a9a` (purple) |
| 6 | Analyst | `#b8c830` (lime) |
| 7 | Sentinel | `#c0a050` (gold) |
| 8 | Master | `#e0c060` (bright gold) |
| 9 | Phantom | `#ff6040` (orange-red) |
| 10 | Grandmaster | `#ff2020` + glow (red) |

### Storage Keys

| Key | Type | Purpose |
|-----|------|---------|
| `gate{N}_complete` | localStorage | Individual gate completion flag |
| `gate{N}_score` | localStorage | Gate score (if scored) |
| `gate{N}_timestamp` | localStorage | Completion timestamp |
| `gate_version` | localStorage | Cipher version -- triggers wipe on mismatch |
| `dark_arts_unlocked` | localStorage | Legacy Five Gates completion flag |
| `dark_arts_{moduleId}_completed` | localStorage | Module completion within vault |
| `master_gate{N}_complete` | sessionStorage | Temporary Master Key gate bypass |

## Key Decisions

- **Gate cipher rotation** -- Answers change every 3 months (4 sets, monthly cycle). This
  prevents answer-sharing between cohorts while keeping the challenge fair. The `checkVersion()`
  wipe ensures stale progress doesn't persist across rotations.

- **Server-side validation with client fallback** -- Authenticated users validate against
  Firestore via Cloud Function (secure, rate-limited). Unauthenticated or offline users fall
  back to client-side (less secure but preserves `file://` and offline compatibility). This
  dual-path exists because the platform must work in environments without reliable internet.

- **Split architecture (house vs vault)** -- The FEH course lives in `houses/dark-arts/`
  so it appears in HouseRenderer like any other house content. The vault is a standalone hub
  because its gate-based tier system is incompatible with HouseRenderer's 5-tab layout.
  CyberOps content in `houses/eye/` is also owned by Dark Arts in the content registry --
  the house system is organizational, not ownership-based.

- **Barricade pages for future content** -- Gates 9-10 are built but not wired into the
  active progression. Modules behind them use `.barricade.html` pages that display a
  "coming soon" UI rather than broken links.

- **AccessGuard at gate 1 only** -- The vault HTML requires only gate 1 via AccessGuard.
  Per-tier gating is done in JavaScript by `getHighestCompletedGate()`. This avoids needing
  13 separate AccessGuard levels and keeps the vault as a single-page application.

- **Answer hashes removed from client (2026-02)** -- Originally, SHA-256 hashes of answers
  were embedded in `gate-cipher.js` for client-side comparison. These were removed when
  server-side validation was added. The `checkAnswer()` and `checkBindingWord()` functions
  are marked `@deprecated`.

## Known Limitations

- **Client-side fallback is insecure** -- When the user is unauthenticated, gate answers
  cannot be validated server-side. The legacy client path returns `null` (no hashes remain),
  meaning offline gate validation is effectively broken unless the page implements its own
  local check. This is an intentional trade-off: server-side is authoritative, client is best-effort.

- **localStorage-based progression** -- Gate completion is stored in localStorage. Clearing
  browser data wipes all gate progress. No Firestore sync exists for gate state (unlike
  module progress which syncs via ModuleProgress.js). A student switching browsers loses
  their vault rank.

- **Gates 9-13 not wired** -- Gate pages exist (`gate-9.html` through `gate-13.html`) but
  the vault renderer only checks gates 1-8. The `LEVELS` array stops at level 8; levels 9+
  are displayed as a static "Coming Soon" section. Wiring them requires extending `LEVELS`
  and `getHighestCompletedGate()`.

- **Two gate directories** -- Gates 2-5 live in `dark-arts/gates/`, gates 6-13 live in
  `dark-arts/vault/gates/`. This is a historical artifact from when the vault was added on
  top of the original Five Gates system. Not broken, but confusing for navigation.

- **Cipher rotation wipes all progress** -- When `gate_version` changes, ALL gate progress
  is cleared (gates 1-10, scores, timestamps, `dark_arts_unlocked`). This is intentional
  to prevent stale answers, but students mid-progression lose everything on rotation day.
  No warning is displayed before the wipe.
