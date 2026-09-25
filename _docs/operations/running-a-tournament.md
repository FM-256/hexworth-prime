# Running a Tournament

*Live as of 2026-09-20. Covers the CTF Tournament System as it actually behaves in production
today, not as `TOURNAMENT_SYSTEM.md` described it (that document had five false claims, all
corrected on 2026-09-20; see "Known gaps"). This is the KBA that did not exist: Confluence had
zero pages matching "tournament" in title or body, and the repo held only architecture and
incident notes, none written for an operator about to run an event.*

> **This page is generated from the repo, not edited here.** The source is
> `_docs/operations/running-a-tournament.md`, and `deploy.sh` re-publishes it on every hosting
> deploy via `_tools/confluence/sync-published-docs.sh`. Two consequences worth knowing: edits
> made in Confluence will be OVERWRITTEN on the next deploy, so change the repo file instead; and
> the sync REFUSES to publish if any `file:line` reference in the doc has rotted, so a page that
> looks current has had its references checked rather than merely assumed. A version is only
> added when the source actually changes, compared by a hash of the markdown recorded in the
> page's version message.*

## TLDR

The Tournament System runs team-based CTF events end to end: create, staff with challenges,
invite, run, grade, and award badges. It has been through one full QC pass (2026-08-29) and one
security audit (2026-09-17 to 09-19) and most of what those found is now fixed and deployed.

**Two things are broken RIGHT NOW on both live tournaments** (`Special Event`, `Cyber Tech`) and
will cost you a compromised event if you skip the pre-flight checklist below:

1. The join code on both live tournaments is publicly readable. Anyone who can list the
   `tournaments` collection — no account required — can read it and join. Rotating the code does
   **not** fix this; it writes a new code to the same public field (taskboard 411).
2. Five challenge flags across both tournaments are compromised. They were recovered from a
   public field in September and have not been rotated (taskboard 401, `BUG-269`).

Everything below assumes you run the pre-flight checklist (Section 9) before you open
registration. If a step there fails, do not open the lobby.

---

## 1. Create the tournament

Admin Console -> CTF Tournament Management panel (`_app/admin/console.html`, `data-panel="tournaments"`)
-> **+ Create Tournament**.

| Status | Set by | What it actually permits |
|---|---|---|
| `draft` | Created here | Edit freely. `ctfJoinTeam` and `ctfSubmitFlag` both refuse. Boxes staffed via "Import from Boxes" still disclose their flags through `deliverFlag` — authoring is not competing (`functions/index.js:739`). |
| `lobby` | Admin clicks "Open Registration" | `ctfJoinTeam` admits joins (`functions/index.js:7921` checks `lobby` OR `active`). `ctfSubmitFlag` and `ctfGetBoxCredential` still refuse — a team can register before the box or the flag input opens. |
| `active` | Admin clicks "Start Tournament" | Everything opens: joins, flag submission, real-box credentials. `startTime` is set. |
| `frozen` | Admin clicks "Freeze Scoreboard" | Submissions still graded server-side. Display freezes (see Section 6) — this is a projection control, not an access control. `ctfJoinTeam` refuses (not `lobby`/`active`). `ctfGetBoxCredential` still serves. |
| `ended` | Admin clicks "End Tournament" | Submissions and box credentials both refuse. Podium reveals final standings once `results/final` exists (Section 8). |

Two lifecycle facts that surprise people:

- **Credentials and flag submission open together, at `active`, not at `lobby`.** A team cannot
  pre-solve a real box during registration and sit on the answer until the bell — `ctfGetBoxCredential`
  is gated identically to `ctfSubmitFlag` on purpose (`functions/index.js:8282`).
- **The join code is required at creation** — the console refuses to save a tournament with no
  code or a code under 4 characters (`_app/admin/console.html:11228`). There is no "no code" tournament you
  can create today; every new tournament is gated by construction.

## 2. Staffing challenges — and the box-import trap

Two ways to add challenges: hand-author them, or **Import from Boxes** (the box picker in the
challenge editor).

**Hand-authored challenges** are hashed client-side at save time: `sha256(flagSalt + ':' + flag)`,
salt = `{joinCode}-{challengeId}`. The plaintext you type is never stored.

**Importing from a box copies the box's registry flag TEXT verbatim into the challenge.**
`_app/admin/console.html:11683-11730` reads `flag_registry/{boxId}.flags`, and for every flag on that box
writes a challenge whose `flag` field is that flag's exact text — the same text `deliverFlag`
(`functions/index.js:682`) hands out to any signed-in student for the solo Arena version of that
box. The challenge secret is not a fresh secret; it is the box's public answer, differing only by
a salt that is derived from public values.

**The consequence you need to know before you pick boxes, not after:**

- `deliverFlag` now refuses to disclose a box's flag once that box is a challenge of any
  tournament at `lobby` or later, and the refusal predicate includes `ended` (`functions/index.js:774`).
  That is deliberate — a four-way vote rejected dropping `ended`, because Mallory proved that
  doing so reopens a live scoring exploit: harvest the plaintext from the guard-free window, then
  submit it as a correct flag in any *later* tournament that reuses the same box.
- **Accepted cost of that guard:** once a public Arena box has ever been used as a tournament
  challenge, it stops disclosing its flag to solo students **permanently** — not just for the
  duration of the event. `c1-data-nexus-breach` has been in this state since 2026-03-25.
- The root fix — mint a fresh flag per challenge at import time instead of reusing the box's own —
  is scoped but not built (taskboard 407). Engine 1 already does this correctly
  (`_tools/engine1/provision/mint-flag.sh`); the console's box-import path does not.

**Operator decision point:** if you import a box you also run in the solo Arena, and you intend
students to keep playing that box afterward, you are trading that box's future disclosure for this
event's challenge. Hand-authoring a fresh flag for the same scenario avoids the trade entirely.

## 3. Attaching a real box (Engine 1)

Engine 1 is a real Windows Server 2022 VM under KVM on `bc2`, one instance per team, each with its
own hostname, credentials, and an unguessable per-team token URL. Full build history and rollback
in `_docs/operations/engine1-versions-and-rollback.md`.

**LEAVE `boxId` EMPTY ON A REAL-BOX CHALLENGE.** That field means "this challenge has a SIMULATED
arena box", and the board renders a **Launch Box** button from it pointing at
`/arena/boxes/{boxId}/index.html` (`_app/arena/tournament-board.html:831`). A real machine has no
arena box, so any value there produces a 404 and shows the student two routes to the machine, one of
them broken. This was hit live on 2026-09-22: a challenge created with `boxId: engine1` rendered a
Launch Box link to a path that does not exist.

The catch worth knowing: omitting `boxId` is correct for a REAL box and WRONG for a simulated one,
because `deliverFlag`'s guard (`functions/index.js:774`) uses `boxId` to withhold flag values for an
arena box that is in use as a tournament challenge. Nothing in the console warns you either way.
Taskboard 418 tracks making this explicit rather than implicit.

To attach a real box to a challenge:

1. **Record the boxes in the pool once** (Console -> Manage -> **Real Box Pool**), then use
   **Wire pool to all teams** with the challenge selected. This is the supported path: it allocates
   each team its own machine, claims it so no second tournament can take it, refuses a partial
   wiring, and writes everything in one transaction. The per-team card below still exists for
   one-off corrections.
2. The token URLs live on `bc2` at `config/tokens/` (0600, never printed to a transcript). Since
   the terminals log the student in (`--ssh-pass`, see `token-terminals.sh`), a pool entry needs no
   password: fewer copies of a working login.
3. This writes `tournaments/{id}/teams/{teamId}/assignments/{challengeId}` — `isAdmin()`-only in
   `firestore.rules:1434`. No student ever reads that document directly.
4. A student who opens the challenge modal on the board sees a box slot fill in asynchronously via
   `ctfGetBoxCredential` (`_app/arena/tournament-board.html:905`). If their team has an assignment
   for that challenge, an **"Open your box"** button renders (`_app/arena/tournament-board.html:950`). If not,
   the slot stays empty and the modal is otherwise unaffected — most challenges have no real box
   and this is the ordinary case.

`ctfGetBoxCredential` derives the team from `members[]` server-side; there is no `teamId`
parameter a caller could substitute. Every successful disclosure is logged to
`ctf_credential_audit` (best-effort, fire-and-forget — a gap in that log is not proof nobody
accessed the box).

### 3a. Per-team flags — do this, or the scoreboard measures who pasted fastest

**A real-box challenge is not finished when the boxes are wired.** Every team gets its own machine,
but until you mint per-team flags every machine carries the *same* flag. That was measured, not
assumed: hashing `C:\Hexworth\loot\proof.txt` on all six Engine 1 clones returned one identical
digest. The first team to escalate can hand that string to everyone else, and the scoreboard then
ranks teams by who pasted fastest. Per-team boxes with a shared flag is isolation in the
infrastructure and none in the scoring — the half that decides who wins.

Wire the pool first (§3 above), because keys are matched to teams through each team's assignment.

1. **On `bc2`**, mint and inject one flag per box:

   ```
   sudo _tools/engine1/provision/perteam-flags.sh
   ```

   It mints 128 bits of CSPRNG per team, injects into that team's box, verifies by reading the value
   back *out* of the machine, and proves the `player` account is denied. It refuses to print anything
   unless every box verifies and all flags and hashes are pairwise distinct — a driver that minted one
   flag twice would recreate the original defect while every per-box check still passed. Plaintext
   stays in 0600 files under `config/flags/`; the script prints salts and hashes only.

2. **Paste the JSON it prints** into Console → Manage → **Per-Team Flags**, with the same challenge
   selected. Click **Preview mapping** first: it shows which key resolved to which team and writes
   nothing. Then **Write per-team flags**.

3. It is **all or nothing**, deliberately. A team with no `perTeam` entry is *refused* at submit time
   ("Your team has no flag configured for this challenge yet") rather than graded against a shared
   value, because falling back is exactly how a team ends up able to submit another team's flag. So a
   partial write would bench those teams for the whole event instead of degrading.

### 3b. Re-mint after ANY box change — or a correct flag gets rejected and logged as suspicious

`perTeam` is written once and nothing invalidates it. Each entry records the box it was minted
against (`box`), which is what makes the following checkable at all — but nothing re-checks it for you
at submit time, because grading never reads the assignment documents.

**If a team is moved to a different machine after per-team flags were registered** — a box crash, a
mid-event correction, a re-run of the event on re-imaged boxes, or a `reset-team-box.sh` run — then
that team's registered hash still belongs to the *old* machine, and two things happen, both silent:

1. The team can never submit correctly, no matter what they do. To them it is indistinguishable from
   "you typed it wrong."
2. When they submit the real flag off their own box, it matches the team that *previously* held that
   machine, and grading logs a flag-match naming them. **A student who did everything right gets
   locked out and implicated.**

So: **after any box change, re-run `perteam-flags.sh` for the affected teams and re-register.** Two
ways to catch it if you are unsure:

- **Console → Per-Team Flags → Preview mapping with the paste box EMPTY.** That reports what is
  registered against what is wired now, and names any team whose flag was minted on a different box.
- **`node _tools/tournament/inspect-tournaments.js --tournament <id>`**, which now reports incomplete
  `perTeam` maps and provenance drift as pre-flight problems (§9).

**`reset-team-box.sh` deserves particular care**, because it creates a *versioned* domain
(`engine1-team-blue-shield-v3` → `-v4`) and leaves the old one shut off but not deleted. Its printed
next steps predate per-team flags and tell you to run `mint-flag.sh` directly, which touches the VM
and never Firestore. After a reset: confirm the domain `token-terminals.sh` points at is the new one,
then re-run `perteam-flags.sh` naming the affected team, then re-register. `perteam-flags.sh` refuses
loudly if a domain has no IP — but if a *stale* domain is still reachable it will happily mint,
verify and emit a valid-looking block for a machine no student can reach.

**What this buys beyond fairness:** a wrong submission that hashes to another team's registered value
cannot have been guessed — the flag is 128 bits of CSPRNG minted on that team's own box. `ctfSubmitFlag`
logs it:

```
[ctfSubmitFlag] FLAG-MATCH {tid}/{chId}: team X (flag minted on box B1) submitted a flag matching Y (box B2). ...
```

**It is a signal, not a verdict.** It has exactly two causes and the log cannot tell them apart: the
flag was passed between teams, or a box was reassigned (above). Always check the box ids in the log
line against `tournaments/{tid}/teams/{teamId}/assignments/{chId}.fromPool` before treating it as
cheating. Do not accuse a student on this line alone.

To read it after an event:

```bash
# Every flag-match signal, newest first
gcloud logging read \
  'resource.type="cloud_function" AND resource.labels.function_name="ctfSubmitFlag" AND textPayload:"FLAG-MATCH"' \
  --limit 50 --format="value(timestamp,textPayload)"

# Narrow to one tournament
gcloud logging read \
  'resource.type="cloud_function" AND resource.labels.function_name="ctfSubmitFlag" AND textPayload:"FLAG-MATCH" AND textPayload:"<tournamentId>"' \
  --limit 50 --format="value(timestamp,textPayload)"
```

(Gen-2 functions log under `resource.type="cloud_run_revision"` with
`resource.labels.service_name="ctfsubmitflag"`; if the first query returns nothing, try that before
concluding there were no matches.)

It is deliberately a log and not a field: the incorrect-submission record is not admin-only, so naming
the other team there would out that team on a document students can reach *and* tell the submitter
their borrowed flag was recognised. The student-visible response is byte-identical to any other wrong
flag, so the detector is not an oracle.

Simulated challenges need none of this: one box for everyone means one flag for everyone, which is
why a challenge with no `perTeam` keeps grading against the single shared flag.

## 4. Inviting people

Three real invite paths exist. Two more do not exist at all.

| Path | What it does | What it does NOT do |
|---|---|---|
| **Join QR** (Manage panel, `_app/admin/console.html:13774`) | Encodes the lobby URL only: `/arena/tournament-lobby.html?id={tournamentId}`. Renders via the vendored `qrcodejs`; falls back to legible text if the library fails to load. | Never encodes the join code. Deliberate: a QR gets photographed and forwarded, and the code is a real gate (see Section 5), putting it in the QR hands the gate away in a nicer format. The instructor reads the code out. |
| **Discord `/tournament` command** | Ephemeral reply (flags 64 — only the asker sees it). Lists tournaments at `lobby` or `active`, names the Competitor badge and its 25 points, and tells the student to ask their instructor for the code (`functions/index.js:9068-9106`). | **It never reads out a join code, under any condition** — an earlier draft did, for "legacy" tournaments, and that branch turned out to be the live case for both real tournaments today (BUG-270). |
| **Direct lobby link** | Copy/paste the URL yourself. Works today, always has. | — |
| Email | Does not exist. `functions/index.js:5675` states auto-email was never built for v1. | — |
| SMS | Does not exist. Nothing in the codebase sends one. | — |

**The Discord command is built and tested (13/0 with signed interactions) but NOT REGISTERED with
Discord as of this writing.** It is unreachable by students until an operator runs it:

```
node _tools/discord/register-tournament-command.js --list       # see what Discord currently has
node _tools/discord/register-tournament-command.js --register   # POST, additive
```

**Do not hand-roll this with `PUT`.** Discord's `PUT /applications/{app}/commands` *replaces the
entire command list*. This bot answers other slash commands already (`/help`, `/join`, `/link`,
`/house`, `/standings`, `/team`, `/challenge`, `/trivia`, `/boxinfo`, `/profile`, `/streak`,
`/optin`) — a `PUT` with only `/tournament` in the body would silently delete all of them in one
call. The script uses `POST`, which adds or updates one command and leaves the rest alone
(`_tools/discord/register-tournament-command.js:17-19`). Run `--list` first if you want the exact
current count before you register.

## 5. The join code — a real gate, with a live defect

The join code is checked server-side in `ctfJoinTeam` (`functions/index.js:7925-7990`). Its
authoritative home is `tournaments/{id}/private/config`, denied to every NON-ADMIN client by
`firestore.rules:1491` — Cloud Functions read it with the admin SDK, bypassing rules. The public
`tournaments/{id}` document exposes only `hasJoinCode` (a boolean), because the podium and lobby
need to know whether to prompt for a code, and that fact is not itself secret.

**That is the correct architecture, and it only applies to tournaments created after 2026-08-29.**
Tournaments created before the fix have no `private/config` document, and `ctfJoinTeam` falls back
to a legacy **public** `joinCode` field on the tournament document itself
(`functions/index.js:8048-8051`) — which `firestore.rules` grants `allow read: if true`. An
unauthenticated Firestore REST GET on that document returns the code in plaintext.

**Verify which state your tournament is in before you rely on the code as a gate:**

```
node _tools/tournament/inspect-tournaments.js [--tournament <id>]
```

Read the printed `fields:` line for the tournament. If it lists `joinCode` (not just
`hasJoinCode`), the public fallback field is present and the join code is not actually gating
anything — anyone who lists the collection can read it with zero authentication.

**As of 2026-09-19, both live tournaments (`Special Event`, `Cyber Tech`) are in this state.**
This is taskboard 411.

**Rotating the code does not fix this.** A new code written to the same public field is equally
public the moment it is saved. Rotation and migration have to be the same operation — the
remedy is the same two-phase pattern already shipped for flag secrets, and it is now **LIVE IN
PRODUCTION**: the **Join Code Migration** card in the Manage panel
(`_app/admin/console.html:4204`, handler `window.migrateJoinCode`), deployed 2026-09-19 with 42/0
against a rules-enforced emulator running the shipped function, mutation-verified three ways.
Alongside it, a **Rotate Code** button (`_app/admin/console.html:4150`, handler
`window.rotateJoinCode`). Before it existed there was NO way to change a live tournament's code,
and editing the public field by hand would have done nothing except re-publish a stale value.
The migration copies the code into
`private/config` and sets `hasJoinCode`, leaving the public field alone so a running event does not
break; PURGE the public field only after the private copy is confirmed). That migration is being
built; it does not exist yet. Until it ships, treat the join code on any pre-2026-08-29 tournament
as **not a gate** — anyone signed in, including an anonymous session, can join without it.

## 6. Running the event

**Freeze is a display control, not an access control.** Clicking "Freeze Scoreboard" transitions
the tournament to `frozen`. Submissions keep being accepted and scored server-side —
`ctfSubmitFlag` admits `active` or `frozen` identically (`functions/index.js:7407`). What freezes
is the display: `ctfTransition` captures one authoritative array, `tournament.frozenStandings`, at
the moment of freeze, and both the podium and the Big Screen broadcast read that snapshot instead
of the live `teams` collection until the tournament unfreezes or ends. This is the correct CTF
convention (the button says freeze *scoreboard*, not freeze *play*) — do not "fix" it into a hard
pause.

**Scoring models:**

| Model | Behavior |
|---|---|
| **Static** | Each challenge is worth its authored `points`, unchanged for the life of the event. |
| **Dynamic** | `currentPoints = max(minPoints or floor, floor(points * decayRate ^ solveCount))`. Console writes `dynamicConfig.decayRate = 0.85` at creation when Dynamic is selected (`_app/admin/console.html:11241`); decay always starts from each challenge's own authored `points`, not a tournament-wide value. |

Historical note, in case you inherit an older tournament: a live event was once found configured
as `dynamic` with no `dynamicConfig` at all, so it silently scored flat static points forever —
the board still showed points, they just never decayed, and nothing in the UI would have told you
(TOURN-05, fixed 2026-08-29). The console now always writes `dynamicConfig` when Dynamic is
selected, so a new tournament cannot reproduce this. An older tournament created before that fix
still could — check `dynamicConfig` is present if you inherit one.

**Hints do not cost anything, no matter what the button says.** The challenge modal renders
`Hint 1 (-10 pts)`-style buttons per hint (`_app/arena/tournament-board.html:851`).
`window.revealHint` (`:882`) only toggles a CSS class to reveal the hint text — it makes no server
call. There is no `hintPenalty`, no `hintsUsed`, no hint accounting anywhere in
`functions/index.js`. `ctfSubmitFlag` credits full challenge points regardless of how many hints a
team opened. **Do not tell students, and do not represent to yourself, that opening a hint deducts
points — it does not, and there is currently no way to reconstruct after the fact how many hints a
team used.** (Taskboard 403. Two honest fixes exist — charge it server-side, or remove the false
cost from the label — and neither has shipped; the choice is a pending operator/product decision,
not a bug you can silently code around.)

## 7. Grading

All flag grading is server-side, via `ctfSubmitFlag`. There is no client-side comparison anywhere
in the tournament path — this is architecturally the same "never client-grade" invariant the rest
of the platform enforces.

The flag crypto (`flagSalt`, `flagHash`) lives at `tournaments/{id}/flagSecrets/{challengeId}`,
`isAdmin()`-only at the rules layer (`firestore.rules:1392`). `ctfSubmitFlag` reads it with the
admin SDK. **A challenge with no stored secret is refused outright** —
`failed-precondition`, "This challenge is not fully configured yet" — it is never silently
mis-graded (`functions/index.js:7571-7577`). This is deliberate: comparing a submission against a
missing hash would make every submission false, including a genuinely correct one, and because an
incorrect submission is logged with its raw text, that would write the correct flag straight into
a collection any signed-in user can read.

**Pre-event check, every challenge, every time:**

```
node _tools/tournament/inspect-tournaments.js --tournament <id>
```

Read the challenge section. `noHash` in the tool's internal findings (surfaced as a printed
problem line, "N challenge(s) have NO flagSecrets entry, so ctfSubmitFlag REFUSES them") means
those challenges will reject every submission, correct or not, until fixed. `stillPublic` means the
old public copy of the crypto is still sitting on the challenge document and needs the Flag Secrets
Migration run (Section 9 and Section 10, item 401).

## 8. Ending the event

Click "End Tournament." `ctfEndTournament` (admin-only) runs `finalizeTournament`
(`functions/ctf-finalize.js`), which certifies `tournaments/{id}/results/final` from the
submissions log — this is the results-of-record; the podium and broadcast read from it, never from
the live, admin-writable `teams` collection, once it exists.

**Badges are two different trust models, deliberately:**

| Badge | Awarded | Storage | Revocable |
|---|---|---|---|
| **Competitor** (`tournament_competitor`) | Automatically, inside `ctfJoinTeam`, the moment a student joins a team. | `users/{uid}/server_awards` AND `users/{uid}.achievements` (union-merged). | **No.** Joining is a fact; it cannot un-happen. This is why it is safe to also keep it in the union-merged `achievements` array — a stale device re-syncing the id back in changes nothing false. |
| **Champion / Runner-Up / Third** (`tournament_champion` etc.) | Manually, by an admin calling `ctfAwardTournamentBadges` — never automatic. This is Hexworth Credential Authority doctrine: competition never automatically grants an award of record. | `users/{uid}/server_awards` **only** — never `achievements`. | **Yes.** A corrected result must be able to take a trophy back; `achievements` is union-merged and a revocation there would silently self-reverse the next time a stale device synced. |

Console -> Manage panel -> **Award Placement Badges** button (`_app/admin/console.html:11933`) calls
`ctfAwardTournamentBadges`. It refuses to run until `results/final` exists — it will not derive
placements from the live `teams` collection, because that collection is admin-writable and
therefore not evidence of anything. Safe to click more than once: it is idempotent by content, and
re-running after a corrected result moves the trophies and revokes the superseded ones.

Students who were placed directly onto a roster by an admin (never called `ctfJoinTeam` themselves)
never receive the Competitor badge automatically. The Cloud Function that backfills this,
`ctfBackfillParticipation`, exists in `functions/index.js` — **but nothing in the admin console or
`_tools/` calls it.** There is no button and no CLI script for it today. If you have admin-placed
roster members who need the Competitor badge, this has to be invoked directly (e.g. from the
Firebase console's function-testing UI, or a one-off admin-authenticated call) until a caller is
built. Flag this to whoever owns the console if it comes up during an event.

Podium freeze at `ended` reveals the certified final standings, read from `results/final`. Export
is available from the Manage panel as `ctf-results-{id}.json`.

---

## 9. Pre-flight checklist

Run every item below before opening registration. Each has a command or panel that actually
verifies it — none of these are "should be fine."

| # | Check | How | What "clean" looks like |
|---|---|---|---|
| 1 | Every challenge has a flag secret | `node _tools/tournament/inspect-tournaments.js --tournament <id>` | No "NO flagSecrets entry" problem line for this tournament. A **shared** flag or a **per-team** map both count as present. |
| 1a | Per-team flags are COMPLETE, if any challenge uses them | Same command | No "INCOMPLETE perTeam map" line. A team with no entry is *refused* at submit time, not graded, so it cannot score at all for the whole event. |
| 1b | Per-team flags still match the boxes teams are wired to | Same command | No "minted on a DIFFERENT box" line, and no "record no box provenance" line. A drifted entry both locks that team out and makes their correct flag log as a flag-match against them — see Section 3b. |
| 2 | No challenge still exposes public crypto | Same command | No "STILL carry flagHash/flagSalt on the world-readable doc" problem line. If present, run the Flag Secrets Migration (Manage panel, "Copy" then "Purge," this tournament) — read `_docs/operations/tournament-flag-secrets-migration.md` first; PURGE must run only after a functions deploy that reads the new location is confirmed live. |
| 3 | Every challenge has positive points | Same command | No "no positive points" problem line. |
| 4 | No challenge carries a raw `flag`/`answer`/`solution` field | Same command | No "carry a RAW flag field" problem line. |
| 5 | Denormalized counters agree with the underlying collections | Same command | No `<-- DRIFTED` marker on `teamCount`, `totalSubmissions`, or `totalSolves`. |
| 6 | Score reconciliation | Same command (recomputes every team's score from accepted submissions) | No mismatch reported between stored and recomputed score. |
| 7 | Join code is actually gating this tournament | Same command, read the `fields:` line | `joinCode` is **absent** from the printed field list (only `hasJoinCode` present). If `joinCode` appears, the code is public and gates nothing — see Section 5. |
| 8 | `dynamicConfig` present if scoring is dynamic | Same command, read `scoringModel` and challenge fields, or open the tournament in the console | If `scoringModel: dynamic`, confirm `dynamicConfig` exists on the document. Absent means silent flat scoring. |
| 9 | Real box assignments are complete, if any real box is in play | Console -> Manage -> Real Box Assignment -> "Review all assignments" | No line flagged `MISSING challengeId` or `EMPTY` for any team/challenge pair. |
| 10 | Discord invite path is live, if you intend to use it | `node _tools/discord/register-tournament-command.js --list` | `/tournament` appears in the existing-commands list. If not, run `--register` (POST) before the event, not during it. |
| 11 | No stray test data on the live tournament | `node _tools/tournament/inspect-tournaments.js` (no `--tournament` filter) | Only the tournaments you expect are listed. Any `QCBENCH-*` or test-shaped tournament should have been removed via `benchmark-tournament.js --cleanup <id>`. |

A clean run of item 1-6 in one shot: `inspect-tournaments.js` prints per-tournament sections with
zero problem lines appended at the end. If the tool's problem list is non-empty, treat every line
as a blocker, not a warning — each one maps to a real way a student's correct work can be lost or
a gate can silently not exist.

## 10. Known gaps

Open taskboard items an operator running an event today will trip over. None of these are
theoretical — each was measured against production or the emulator.

| # | Severity | What it is | What it means for your event |
|---|---|---|---|
| **401** | CRITICAL | All 5 challenge flags on the two live tournaments had their `flagHash` and `flagSalt` published on a world-readable document and were recovered. The admin-only `flagSecrets` location now exists and `ctfSubmitFlag` grades from it — but the PURGE step that removes the old public copies has not run, so the compromised values are still sitting there. | The 5 recovered flags are burned. Rotating them is an operator action; because they are box-flag values, rotation implicates those boxes too (see 407). Run `inspect-tournaments.js` — a "STILL carry flagHash/flagSalt" line means this tournament is still exposed. |
| **403** | MEDIUM | The hint button advertises "-N pts" and never charges it. No server-side hint accounting exists at all. | Two teams with identical scores may have used a very different number of hints and you cannot tell — the tie-break resolves on solve time only. Do not represent hint cost as real to students or in any post-event report. |
| **405** | CRITICAL (remedy shipped 2026-09-19, unproven in production) | `deliverFlag` used to hand any signed-in account — anonymous sign-in included — the plaintext flag for a box, and the box-import path never disabled that for boxes staffed into a tournament. A server-side guard now refuses this for any box that is a challenge of a tournament at `lobby` or later. | The guard is deployed and proven in the emulator (permission denied, no flag text in the response body). It has **not** been observed against a real production call, because that requires an actual flag capture, which fires the Discord webhook and is operator-gated. Treat it as live but not yet end-to-end confirmed. |
| **407** | Open, root fix | Importing a box copies its public flag text verbatim into the challenge — the challenge secret IS the box's public answer. This is why 405's guard has to include `ended` in its refusal predicate, which permanently strips flag disclosure from any public Arena box a tournament ever touches. | Every box you import for a tournament trades away that box's future solo-Arena disclosure, permanently, until 407 ships. Factor this into which boxes you pick (Section 2). |
| **408** | Open | `_app/arena/engine/OpenWorldEngine.js:353-355` swallows a flag-delivery refusal with **no visible fallback at all**, not even a placeholder message. Affects the ~10 `ow-*`/`ows-*` boxes specifically (a separate defect from the BoxEngine message fix that shipped 2026-09-19, which does show a reason). | If you staff an OpenWorld-family box into a tournament and a student's flag delivery is refused, that student sees nothing, not an error, not a message. They will report the box as broken. |
| **411** | Migration DEPLOYED, not yet RUN | Both live tournaments (`Special Event`, `Cyber Tech`) still fall back to a legacy PUBLIC `joinCode` field, so the join gate that TOURN-03 built correctly for new tournaments does not apply to either event currently running. | Anyone who lists the `tournaments` collection can read the code with one unauthenticated request and join. Rotating the code does not fix it, see Section 5. |

---

## Related

- `_docs/features/TOURNAMENT_SYSTEM.md` — architecture overview. Known to be wrong in several
  places as of 2026-04-05 (salt scheme description, freeze behavior, `freezeMinutes`, hint
  accounting) — treat this runbook as authoritative over that doc for operational behavior.
- `_docs/features/CTF_ARENA.md` — the solo Arena system that tournament challenges are staffed
  from; explains `deliverFlag` and why it exists for teaching content.
- `_docs/operations/engine1-versions-and-rollback.md` — full build, provisioning, and rollback
  history for the real-box (Engine 1) path referenced in Section 3.
- `_docs/operations/tournament-flag-secrets-migration.md` — the full defect writeup, four-way vote,
  and step-by-step migration runbook for the flag-secrets move referenced in Sections 7, 9, and 10.
- `_docs/operations/tournament-capture-and-recap-spec.md` — build spec for a post-event shareable
  recap. Specified, not built.
- `_docs/features/tournament-broadcast.md` — the Big Screen / projector view (`broadcast.html`),
  including the real hard-freeze implementation the podium page still lacks.
- `_docs/operations/tournament-qc-2026-08-29.md` — full QC, benchmark, and security audit that
  found the capacity ceiling, join-code, rate-limit, and scoring defects fixed in the 2026-08-29
  sprint.
- `_docs/operations/tournament-sprint-status-2026-08-29.md` — what that sprint shipped and what it
  left open (TOURN-06 through TOURN-11).
- `_docs/architecture/hexworth-credential-authority.md` — the doctrine behind the participation vs.
  placement badge split in Section 8.

*Last Updated: 2026-09-19 · v1.0.0*
