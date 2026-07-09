# Linux Command Mastery Missions

Live as of 2026-07-09.

## TLDR

Eighteen story-driven, auto-graded Linux missions running inside the Linux Practice
Sandbox (bc1 disposable containers). Each mission masters exactly one command by
seeding a fictional "Hexworth Dynamics" world into the student's box and grading a
system-state audit against it, not command history, not multiple choice. Badges are
server-issued: the client shows results, but only a Cloud Function re-grade writes the
achievement.

All 18 missions are built, live-tested individually, and swept end-to-end through the
real API. Engine, endpoints, badge flow, and Observatory UI are shipped. This doc
exists so the next operator can add mission 19 or debug a grading failure without
re-deriving the gotchas the hard way.

Student flow: Observatory sandbox card -> Command Mastery missions panel -> Start
Mission (seeds the world) -> work in the real terminal -> Grade mission (rich per-task
feedback, hidden requirements masked) -> Claim badge (server re-grades; client never
awards).

## Hardware / Software / Network

| Layer | What | Where |
|---|---|---|
| Container image | `hexworth/linux-sandbox:latest` (Ubuntu 24.04 + ttyd + `student` w/ sudo) | bc1, shared with the free-play Linux Practice Sandbox |
| Mission engine | `missions.js`: `loadMissions`, `runSeed`, `readMissionEnv`, `substituteTokens`, `gradeMission` | Repo: `_tools/sandbox-missions/lab-manager/missions.js:1-194`. Baked into the lab-manager image (`Dockerfile` `COPY`s `missions.js` + `missions/`); bc1 runtime copy at `~/hexworth-sandbox/lab-manager/missions.js` |
| Mission manifests + seeds | 18 directories, each `mission.json` + `seed.sh` + `solution.sh` | Repo: `_tools/sandbox-missions/<mission-id>/`. Synced to bc1: `~/hexworth-sandbox/lab-manager/missions/<mission-id>/` |
| Schema contract | Manifest fields, check-command contract, seed.sh contract | `_tools/sandbox-missions/SCHEMA.md` |
| HTTP surface | Traefik-fronted lab-manager, per-session routes | `sandbox.hexworth.tech` |
| Badge write path | `awardMissionBadge` Cloud Function | `functions/index.js:707-769` |
| Frontend | Observatory card, `SandboxLauncher.js`, `AchievementSystem.js` registry | `_app/houses/observatory/index.html:501-512`, `_app/components/SandboxLauncher.js:138-145`, `_app/components/AchievementSystem.js:1983+` |

Why baked into the image, not mounted: the lab-manager restarts per deploy and
missions must be present at container start for `loadMissions` to enumerate them.
`docker compose up -d --build lab-manager` on bc1 is required after any mission sync.
A plain restart without `--build` serves stale mission code.

## Endpoints / access patterns

| Endpoint | Auth | Purpose |
|---|---|---|
| `GET /api/sandbox/missions` | Public | Mission catalog metadata only. Check commands and hidden-task briefs never leave the server (masked to `"Hidden requirement"`). Applied via `_tools/sandbox-missions/lab-manager/apply-missions-endpoint.py`. |
| `GET /api/sandbox/check/:sessionId?mission=<id>` | Session capability URL (student-facing) | Rich per-task grading result: `{ mission, results: [{id, brief, tier, pass, feedback[]}], passed, total, badgeEligible }`. |
| `GET /api/sandbox/grade-for?uid=<uid>&mission=<id>` | `X-Service-Key` (`SANDBOX_SERVICE_KEY`) | Server-to-server re-grade. uid resolved to its own running session on bc1, so no session id crosses the trust boundary (same Style-A model as `hex-ai-bridge` sandbox task state). Called only by `awardMissionBadge`. |
| `awardMissionBadge` (Callable CF) | Firebase auth required | Re-grades via `grade-for`, and only on `badgeEligible === true` writes `users/{uid}.achievements` (`arrayUnion`) + `users/{uid}/server_awards/{badgeId}` (`functions/index.js:752-765`). |

Why the client never awards: `achievements` is client-writable Firestore
platform-wide (honor-system pattern used elsewhere on Hexworth). A badge earned by
system-state audit needs a trust boundary the client cannot cross. `server_awards`
has no client write rule, so it is CF-only by default-deny.

## Grading model

Each task carries one or more `checks`. Every check `cmd` runs as a single argv
element to `bash -lc`, AS THE STUDENT (never root: root would bypass DAC and
false-pass permission tasks), with `. /opt/mission/env.<mission-id> 2>/dev/null; `
prepended by the grader before exec. A task passes iff all its checks exit 0.
`$MISSION_*` tokens in briefs are substituted from the container's own seeded env
file via `readMissionEnv` / `substituteTokens` (`missions.js:98-152`), never from a
static string, so a rendered brief always matches what the box actually seeded for
that session. Hidden tasks (`hidden: true`) report pass/fail only, no brief text.
Bonus tasks (`bonus: true`) never gate the badge.

Full contract: `_tools/sandbox-missions/SCHEMA.md`.

## The 18 missions

| Mission ID | Command mastered | Tasks passing / total |
|---|---|---|
| cat-lost-notes | `cat` | 14/32 |
| ls-first-inventory | `ls` | 11/20 |
| cd-breadcrumbs | `cd` + `pwd` | 8/17 |
| cpmv-relocation | `cp` + `mv` | 9/21 |
| rm-decommission | `rm` | 7/10 |
| mkdir-groundbreaking | `mkdir` + `rmdir` | 9/13 |
| headtail-logwatch | `head` + `tail` | 9/11 |
| grep-investigation | `grep` | 10/10 |
| sortuniq-ledger | `sort` + `uniq` | 9/9 |
| wc-census | `wc` | 8/8 |
| less-readingroom | `less` + `more` | 8/8 |
| find-sweep | `find` | 10/11 |
| chmod-lockdown | `chmod` | 9/13 |
| chown-handover | `chown` | 7/12 |
| tar-timecapsule | `tar` + `gzip` | 8/16 |
| ps-runaway | `ps` + `kill` | 7/8 |
| systemctl-servicedesk | `systemctl` (shim) | 8/13 |
| ip-linecheck | `ip` + `ss` + `ping` | 8/11 |

## Testing doctrine

`live-test.sh <mission-id>` (`_tools/sandbox-missions/live-test.sh`) runs the full
cycle in a throwaway `docker run` container on bc1, never the lab pool:

1. Token gate: every `$MISSION_*` token referenced anywhere in the manifest must be
   defined by the seed's env file, or briefs render raw shell tokens and checks
   compare against empty strings.
2. Env-integrity gate: the env file must source cleanly with zero errors and every
   `MISSION_*` variable non-empty.
3. Seed the mission.
4. Pre-grade (expect mostly fail).
5. Run the canonical `solution.sh` AS STUDENT.
6. Expect all checks pass.
7. Re-seed and confirm idempotency.
8. Destroy the container.

**Production parity is mandatory for process- and exec-sensitive checks.** The real
grader execs `bash -lc '<cmd>'`, whose own command line contains the check text. A
`pgrep -f` check with an unclassed pattern self-matches the grader's own shell,
verified live: zero daemons running still returned a PID. File-based harness runs
cannot reproduce this class of bug. The all-18 sweep through the real API
(launch/solve/check/destroy) is the capstone test that catches it. That same sweep is
what caught `ping` failing only in real sessions: the lab-manager drops all
capabilities on launched containers, so ubuntu's `ping` (which relies on a
`cap_net_raw=ep` file capability) refused to exec. Fix: `setcap` must run in the
image BEFORE the `USER student` line in the Dockerfile. A `setcap` run after `USER
student` silently no-ops (no root to grant the capability).

### Gotchas

| Gotcha | Consequence if missed |
|---|---|
| Check commands are one argv element to `bash -lc`, never nested in a quoted shell string | Embedded single quotes in a legitimate check command break the outer quoting |
| Env values in `seed.sh` MUST be double-quoted (`MISSION_X="value"`) | Unquoted spacey values silently blank on `.`-sourcing, so both the solution and the checks go vacuous. This is what the env-integrity gate exists to catch; the live test lied until that gate was added. |
| `wc -l` undercounts a file whose last line has no trailing newline | Use `awk 'END{print NR}'` for line-count assertions |
| `grep` across multiple files adds `filename:` prefixes to output | Content-match checks against multi-file grep output must account for the prefix |
| `ls -R` / `find` output must be sorted on both sides before hashing | Directory-listing order is not guaranteed stable across runs |
| `ps -o comm=` truncates process names to 15 characters | Process-name checks must grade dynamically, not against a literal >15-char string |
| POSIX shells run traps between commands | Short loop sleeps in seed/check scripts can race a trap; do not assume tight timing |
| `diagnose`-style tasks grade against the OPENING state, not live state | A check written against current state will false-fail once the student has already fixed the thing being diagnosed |
| Destructive seeds must early-exit guarded on the env FILE, not a proxy directory | A dir-based guard let killed processes resurrect on session resume for process-graded missions. The env file is the only reliable idempotency marker |
| Seed spawn casts need a post-spawn liveness gate before env writes | Without it, a dead cast (process failed to start) still writes env values, and negative-assertion checks false-pass against a process that never ran |
| `pgrep -f` / `pkill -f` checks must bracket-class one letter of the pattern (e.g. `hexlab_report_[d]aemon`) | Production execs the check via `bash -lc '<cmd>'`, whose own command line contains the pattern text and self-matches |
| `pick()` indexes by `hostname-hash % list-length`; same-length randomize lists co-vary | Not a bug: accepted (Nancy wave review 2026-07-09). Effective variety is 3-4 world bundles, not a full cross-product. Salt the hash per key name if independence is ever required. |
| In-box values (env SHAs, codewords) are readable by a sudo student by design | These are practice badges, not exam credentials. Award integrity lives server-side via `grade-for` + the CF, not in the box. |

### QC lineage

Nancy (adversarial review) ran per build wave: engine review paused and fixed before
the pilot mission shipped; the pilot mission (Chris) blocked on raw `$MISSION_*`
tokens leaking into student-facing briefs, which is what drove `substituteTokens`;
waves 2-3 paused on `less-readingroom` branch-priority and a codeword-position
collision, both fixed and the collision re-verified against a hostname hash; waves
4-5 paused on `ps-runaway` spawn-masking, the guard-proxy idempotency bug, a
negative-only `systemctl` check, and env-quoting, all fixed and re-verified. Every
finding class from this lineage became either a permanent gate in `live-test.sh` or a
rule in `SCHEMA.md`, not a one-off fix.

## Adding mission 19

1. `mkdir _tools/sandbox-missions/<mission-id>`.
2. Write `mission.json` (schema 1; badge id `lcm_<slug>`; 8-14 tasks including at
   least one hidden professionalism task and one bonus task; checks per
   `SCHEMA.md`).
3. Write `seed.sh`: `set -eu`; pick world values by hostname hash; write the
   per-mission quoted env file; hash any reference artifacts then delete them; add
   the destructive-seed guard if any task is absence-graded.
4. Write `solution.sh`: the canonical star-command path that should pass every
   check.
5. `sh _tools/sandbox-missions/live-test.sh <mission-id>` until green.
6. `scp` the mission directory to bc1 `~/hexworth-sandbox/lab-manager/missions/`,
   then `docker compose up -d --build lab-manager`.
7. Verify `GET /api/sandbox/missions` lists the new mission with masked briefs.
8. Run the production-parity end-to-end sweep (launch, solve, check, destroy)
   through the real API, not just the harness.
9. Add the `lcm_<slug>` entry to `AchievementSystem.js` with a real icon (audit that
   the icon file exists before referencing it).
10. Add the mission's field guide to `_app/components/MissionFieldGuide.js` and run
    `node _tools/sandbox-missions/fieldguide-drift-check.js` until it passes (see
    "Field guides" below).
11. `git add -f` the new mission directory (`_tools/` is gitignored by default) and
    commit.
12. Dispatch Nancy for adversarial review before considering the mission shipped.

## Field guides (beginner teaching layer, added 2026-07-09)

The manifests deliberately carry no teaching content: `story` is narrative, task
`brief`s are discovery-style challenges, and check `fail` messages hint only after
a failed grade. Operator ruling 2026-07-09: the missions serve beginners, so that
gap is a defect. The fix is client-side and lives entirely in the web app:

- `_app/components/MissionFieldGuide.js` holds one guide per mission id: rows of
  `[command, plain-language explanation]` teaching the star command's moves, plus
  three common tips (read the briefing; `>` saves output and most tasks grade
  files; grade early because fail messages are hints). Rows derive from each
  mission's canonical `solution.sh` and were adversarially reviewed (Nancy) so
  they teach mechanism, not filled-in answers; two bonus-task rows are
  deliberately softened and the mission-2 (`ls`) guide avoids pipe/grep syntax
  the curriculum has not introduced yet.
- The Observatory mission card renderer calls `MissionFieldGuide.attach(card,
  m.id, m.command_star)`, which inserts a collapsed `<details>` ("New to cat?
  Open the field guide"). Unknown ids no-op silently so a new mission can never
  break a card.
- Drift tripwire: `node _tools/sandbox-missions/fieldguide-drift-check.js` diffs
  the component's guide ids against every `mission.json` id and exits non-zero on
  any gap in either direction. Run it whenever a mission or the guides change; a
  mission without a guide is a regression to the no-teaching-layer defect, not a
  cosmetic miss.
- Adding mission 19 therefore gains a step: write the guide entry alongside the
  manifest, and the drift check enforces it.

Per-task hints baked into the manifests (`hint` field, bc1 image rebuild) remain
a deferred follow-up; the field guide is the pre-task layer, not per-task help.

## What this does NOT do

- Grade command syntax or shell history. Grading is state-based: an artifact exists,
  has the right content, the right owner, the right mode. A mission's
  `command_star` is a curriculum label, not an enforced constraint. A student who
  solves `chmod-lockdown` with `python` instead of `chmod` still passes.
- Persist container state across missions or sessions. Every mission's `seed.sh`
  rebuilds continuity by assuming prior missions happened; it does not read state
  left by an actual prior mission run.
- Award badges client-side under any code path. `AchievementSystem.js` registry
  entries for `lcm_*` badges exist only so the badge renders once the server has
  already placed it in `users/{uid}.achievements`. The registry has no unlock
  logic of its own for these ids.
- Protect in-box secrets from a sudo student. Codewords, reference hashes, and env
  values are readable inside the container by design; the box is a practice
  environment, and the award boundary is server-side.

## Deferred / open items

- Full randomization independence across `randomize` keys (currently co-varies by
  list length via a single hostname hash; accepted, not planned unless a specific
  mission needs it).
- Mission 19+ beyond the 18 shipped 2026-07-09: no further missions scheduled as of
  this writing.
- Per-task `hint` field in the manifests (bc1 rebuild) so a stuck student can
  reveal one task's nudge without the full field guide; sprint-master backlog.
- Per-lab completion badges for the other sandbox labs (sprint SBX-7).

## Related

- `_tools/sandbox-missions/SCHEMA.md`: manifest schema, check-command contract,
  seed.sh contract (source of truth; this doc summarizes it).
- `_docs/operations/linux-practice-sandbox.md`: the underlying free-play sandbox
  this mission system runs inside.
- `_docs/operations/linux-mastery-lab-box-design-2026-07-02.md`: earlier design
  work on the Linux Mastery lab box.
- Memory: `project_linux_mastery_lab_box.md`, `project_arctic_linux_sandbox.md`,
  `reference_sandbox_infrastructure.md`.

*Last Updated: 2026-07-09 · v1.0.0*
