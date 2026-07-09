# Sandbox Mission Manifest Schema (v1)

Source of truth for the Linux Command Mastery mission series. One directory per
mission under `_tools/sandbox-missions/<mission-id>/`:

```
<mission-id>/
  mission.json   <- manifest (this schema)
  seed.sh        <- seed script, run in the container at launch (as root)
```

Missions are deployed to bc1 (`~/hexworth-sandbox/lab-manager/missions/`) and
loaded by the lab-manager at startup. Adding a mission = drop directory + restart
lab-manager. No server.js edits per mission.

## Design decisions (locked 2026-07-09)

- **Seeded continuity, not persistence.** Containers stay disposable; every
  mission's `seed.sh` builds the fictional company world as if prior missions
  happened. Campaign feel without per-student volumes.
- **Server-issued badges.** The client never awards. A Cloud Function calls the
  bc1 `grade-for` endpoint (service-key gated, uid resolved server-side) and
  writes the achievement server-side only when every non-bonus task passes.
- **Grading = system audit.** Each task has one or more `checks`, each an
  `execCheck` command run AS THE STUDENT inside the container. A task passes iff
  all its checks exit 0. Failed checks map to rich feedback lines.
- **Objective over syntax.** Checks verify artifacts/state (file exists, content
  matches, perms correct), not command history, unless the mission's
  `command_star` objective explicitly requires evidence of the command (e.g. an
  artifact only produceable via `cat -n`).

## mission.json

```jsonc
{
  "schema": 1,
  "id": "cat-lost-notes",             // dir name; [a-z0-9-]
  "labId": "linux-sandbox",           // container image/registry entry it runs on
  "title": "Mission 01: Lost Notes",
  "command_star": "cat",              // the command this mission masters
  "story": "One-paragraph mission brief shown in the UI.",
  "tier": 1,                          // series ordering
  "badge": {
    "id": "lcm_cat_lost_notes",       // achievement id (AchievementSystem + CF)
    "name": "Lost Notes: Recovered",
    "desc": "Mastered cat by recovering the Finance report."
  },
  "randomize": {
    // seed.sh writes /opt/mission/env with these as shell vars, values chosen
    // per-session from the lists (grader sources the same env file, so checks
    // and seeds always agree). Keys become $MISSION_<KEY>.
    "DEPT":   ["finance", "logistics", "research"],
    "PROJ":   ["alpha", "delta", "kestrel", "waypoint"]
  },
  "tasks": [
    {
      "id": "t01_read_brief",
      "brief": "Read /home/student/$MISSION_DEPT/BRIEFING.txt and create ack.txt containing the code word it names.",
      "tier": "bronze",              // bronze=guided, silver=minimal, gold=objective-only
      "hidden": false,               // hidden:true -> UI shows only "a requirement is not met"
      "bonus": false,                // bonus tasks never gate the badge
      "checks": [
        { "aspect": "exists",  "cmd": "test -f /home/student/$MISSION_DEPT/ack.txt",
          "fail": "ack.txt does not exist in the department directory." },
        { "aspect": "content", "cmd": "grep -qx \"$MISSION_CODEWORD\" /home/student/$MISSION_DEPT/ack.txt",
          "fail": "ack.txt exists but does not contain the exact code word from the briefing." }
      ]
    }
  ]
}
```

### Check command contract

- Every check `cmd` is executed via the existing `execCheck(container, cmd, user)`,
  which passes the command as ONE ARGV ELEMENT to `bash -lc` (dockerode exec array).
  The grader prepends `. /opt/mission/env.<mission-id> 2>/dev/null; ` by plain concatenation into
  that single argv element. NEVER nest check cmds inside quoted shell strings
  (embedded single quotes in cmds are legal bash and must arrive verbatim).
- Checks run AS THE STUDENT. Root would bypass DAC and silently false-pass
  permission tasks (chmod/chown missions must inspect modes via `stat -c %a/%U`,
  never via access tests).
- Line-count assertions use `awk 'END{print NR}'`, not `wc -l` (which undercounts
  files whose last line lacks a trailing newline and false-fails printf users).
- Checks MUST be read-only against student work (no mutation of graded state).
- `fail` strings are the rich feedback surfaced per failed aspect
  ("file exists, but wrong owner" style). For `hidden` tasks the grader reports
  pass/fail count only.

### seed.sh contract

- Runs once at launch, as root, non-interactive; must be idempotent.
- First lines choose randomization values and write `/opt/mission/env.<mission-id>`
  (PER-MISSION file: two missions seeded onto the same box must never clobber
  each other's values; the grader sources exactly its own mission's env)
  (mode 0644, owner root) with `MISSION_<KEY>=value` lines, plus any derived
  secrets (e.g. `MISSION_CODEWORD`).
- Builds the world under `/home/student/` and chowns student-facing files to
  `student:student`. Deliberately broken state (perms, split files) is part of
  the story.
- DESTRUCTIVE seeds (rebuilding would wipe student moves/renames/copies) MUST
  early-exit when already seeded (`[ -f $MISSION_DIR/env.<id> ] && [ -d <world> ]
  && exit 0`): /launch re-runs seeds on session resume, and a refresh must never
  destroy completed work. Non-destructive seeds (sources rebuilt identically,
  artifacts untouched) may rebuild every run.
- Uses `set -eu`: a partially failed seed MUST exit non-zero (a silent partial
  seed poisons env checksums and makes the mission unwinnable with no signal).
- Reference artifacts used to compute expected checksums are DELETED at the end
  of the seed (`rm -rf $REF_DIR`) so `sudo cp .ref/<answer> <artifact>` is not a
  one-liner bypass. In-box values (env SHAs, codewords) remain readable by a
  sudo student by design: these are practice badges; integrity of the AWARD
  lives server-side (CF + grade-for). Badges are practice signal, not exam
  credentials.
- Must exit 0; lab-manager logs but does not fail the launch on seed error
  (free-play still works) -- the grader will simply report tasks unmet.

## Grading endpoints (bc1 lab-manager)

- `GET /api/sandbox/check/:sessionId?mission=<id>` -- student-facing, session
  capability URL. Returns `{ mission, results: [{id, brief, tier, pass,
  feedback[] }], passed, total, badgeEligible }`.
- `GET /api/sandbox/grade-for?uid=..&mission=<id>` -- service-key gated (existing
  `SANDBOX_SERVICE_KEY`), used by the badge CF and Dr. Hex. Same result shape.
- Missions with no entry fall back to legacy `SANDBOX_CHALLENGES` behavior
  (existing tutorial + 5 challenges unchanged).

## Badge award flow (server-issued)

1. Student clicks "Grade mission" -> UI shows `/check` results (rich feedback).
2. On all non-bonus tasks passing, UI calls CF `awardMissionBadge({mission})`.
3. CF (functions/index.js) verifies auth, calls `grade-for` with the service
   key, re-verifies `badgeEligible`, then writes
   `users/{uid}/achievements/{badge.id}` with `source: "server"` via admin SDK
   and returns the badge. Client-side AchievementSystem treats `source:server`
   docs as display-only truth.

*v1.0.0 - 2026-07-09 - marathon: Linux Command Mastery*
