# SYM-15 Deferred — Awaiting User Input

These PROG-003 collisions were identified during marathon-mode triage but
require your judgment because they involve naming/canonical choices that
go beyond the established allowlist pattern.

## "Other" bucket — 4 collisions, all clear bugs

Each is distinct content sharing a key. Fix pattern: rename non-canonical to
identity-derived key + add `copyLegacyKey` shim. Naming choices below are
my proposals; approve as-is or override.

### 1. `dark-arts/dark-arts-index`
Files (neither is the actual house index — both compete for the key):
- `_app/dark-arts/vault/index.html` ("The Vault")
- `_app/houses/dark-arts/tools/ctf-leaderboard/index.html` ("CTF Leaderboard")

**Proposed:** rename BOTH to identity-derived keys, cross-credit from the legacy key
- vault → `dark-arts-vault-index`
- ctf-leaderboard → `dark-arts-ctf-leaderboard`
- copyLegacyKey: `('dark-arts', 'dark-arts-index', 'dark-arts-vault-index')` and `('dark-arts', 'dark-arts-index', 'dark-arts-ctf-leaderboard')`

### 2. `script/script-lab`
Files (two CLH course labs sharing a generic key):
- `_app/houses/script/labs/script-lab.lab.html` ("CLH-001: Introduction to Hacker CLI")
- `_app/houses/script/courses/clh/modules/clh-031/script-lab.lab.html` ("CLH-031: Operation BLACKOUT")

**Proposed:** keep `labs/script-lab.lab.html` at `script-lab` (it's the canonical CLH-001 intro), rename CLH-031
- CLH-031 → `script-clh-031-blackout-lab`
- copyLegacyKey: `('script', 'script-lab', 'script-clh-031-blackout-lab')`

### 3. `script/script-index`
Files (house index + course index sharing key):
- `_app/houses/script/index.html` (House of the Script main index — OWNS this identity)
- `_app/houses/script/courses/grep-pipe-mastery/index.html` ("Grep & Pipe Mastery")

**Proposed:** keep house index at `script-index`, rename course index
- grep-pipe-mastery → `script-grep-pipe-mastery-index`
- copyLegacyKey: `('script', 'script-index', 'script-grep-pipe-mastery-index')`

### 4. `web/web-index`
Files (house index + simulators index sharing key):
- `_app/houses/web/index.html` (House of the Web main index — OWNS this identity)
- `_app/houses/web/simulators/index.html` ("Simulators")

**Proposed:** keep house index at `web-index`, rename simulators
- simulators → `web-simulators-index`
- copyLegacyKey: `('web', 'web-index', 'web-simulators-index')`

## How to approve

Either:
- "Approve all 4 with proposed names" → I execute as a Section C commit
- "Approve N, override naming for M" → tell me which alternate names
- "Defer all to a later cycle" → noted, leave them in the PROG-003 baseline

Files I'd touch (5 edits total — the 5 non-canonical files):
1. `_app/dark-arts/vault/index.html`
2. `_app/houses/dark-arts/tools/ctf-leaderboard/index.html`
3. `_app/houses/script/courses/clh/modules/clh-031/script-lab.lab.html`
4. `_app/houses/script/courses/grep-pipe-mastery/index.html`
5. `_app/houses/web/simulators/index.html`
