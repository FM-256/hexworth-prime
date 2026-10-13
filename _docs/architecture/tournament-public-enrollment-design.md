# Tournament public enrollment — `/t/<slug>` design

**Status:** DESIGN ONLY. Nothing built. Needs a green light, then Nancy + Chris.
**Date:** 2026-10-11
**Problem owner:** operator

## TLDR

A tournament has nothing necessarily to do with Hexworth users. It may be a private event, or a
public one for people who have never heard of the platform. Today there is no way to put a
tournament in a stranger's hands: the only artifact is a long URL plus a join code distributed
out-of-band, and the arena lobby offers Google sign-in only.

This designs **one artifact** — `hexworth.com/t/<slug>` — that works as a link, a spoken URL, or a
QR code, and carries everything needed to compete. **If the link carries the code, there is no
separate "receive a code" step.** The QR on a slide becomes the enrollment mechanism and code
distribution stops being a workflow.

## What already exists (measured, not assumed)

The backend is closer to ready than the UI suggests.

| Capability | State | Evidence |
|---|---|---|
| Deep link to one tournament | **works** | `_app/arena/tournament-lobby.html:393-394` reads `?id=` |
| Arena lobby blocked by sorting/house | **NOT blocked** | no `AccessGuard` reference in that file — no tourist-visa trap |
| `ctfJoinTeam` accepts anonymous users | **yes** | `functions/index.js:8043` requires only `request.auth`; no `isAnonymous` or provider check |
| Pseudonymous public display | **already preferred** | `_resolveUserName` (`:8032`) resolves callsign → displayName → token name → placeholder |
| Guest identity UI | **exists, class-only** | `_app/lobby.html` guest path: `signInAnonymously` + callsign + full name |
| Client can query the tournaments collection | **yes** | `_app/arena/broadcast.html:415`; `tournaments/{id}` is `allow read: if true` |
| Code-less tournaments | **supported end to end** | `ctfJoinTeam` checks nothing when `expectedCode === null` and `hasJoinCode !== true` |
| Code secrecy | **already correct** | code lives in `tournaments/{id}/private/config`, denied to every client; only the CF reads it |

### The two actual gaps

1. **`_app/lobby.html` cannot take a code from a URL.** Verified: no `URLSearchParams`,
   no `location.search`, no hash parsing. The code must be typed by hand. So no link can carry it.
2. **`_app/arena/tournament-lobby.html` offers Google only** (`:443-444`). That is the single
   blocker for a stranger, and it is a UI gap — the callable behind it already accepts anonymous.

Neither is architectural.

## URL shape

```
https://hexworth.com/t/<slug>              public event — the link IS the invite
https://hexworth.com/t/<slug>?c=<code>     private event — link + code in one artifact
```

Served by a hosting rewrite, precedent already in `firebase.json:194` (`/houses/hub/**`):

```json
{ "source": "/t/**", "destination": "/tournament-join.html" }
```

### Why a slug and not the doc id

Tournament docs are created with `addDoc` (`_app/admin/console.html:11289`), so ids are Firestore
auto-ids — unusable on a slide or spoken aloud. A `slug` field is added to the tournament document.
**Public is correct for a slug**: it is not a secret, it is the address. `tournaments/{id}` is
`allow read: if true`, which grants GET *and* LIST, so the page resolves it with a single-field
equality query needing no composite index:

```js
query(collection(db, 'tournaments'), where('slug', '==', slug), limit(1))
```

**Fallback, no new field needed:** `/t/?id=<autoId>` works on day one. The slug is an ergonomics
upgrade, not a dependency — worth separating so stage 1 can ship without a schema change.

### Why the code may ride in the URL

Putting `?c=CODE` in a link does **not** weaken anything. The code is validated **server-side** by
`ctfJoinTeam` against `tournaments/{id}/private/config`, which no client can read. A code in a URL is
exactly as secret as a code read off a projector — the secret is the distribution, never the
transport. What it buys is that nobody types anything.

What it does NOT do is make a private event private. **A link that carries its own code is a
bearer token**: anyone who receives, forwards, or screenshots it can join. That is acceptable for a
public event and is the whole point; for a genuinely private event see *Private events* below.

## Page states

One page, `tournament-join.html`, five states. Each is what the visitor literally sees.

### 1. Resolving
Slug → tournament lookup. Skeleton, not a spinner-only blank. Fails closed to state 5.

### 2. Event card — the landing state
```
  SPRING CTF — LIVE FIRE
  Starts 14:00 EDT · 6 teams · 18 competitors
  <description from the tournament doc>

  [ Choose your callsign        ]
  [ Join the event ]
```
- No auth yet. No account. No Hexworth relationship implied.
- **Callsign only. No real-name field.** See *Identity and exposure*.
- Status gate: `ctfJoinTeam` accepts only `lobby` and `active`. `draft` / `suspended` / `ended`
  must each render an honest state here rather than letting the person proceed and fail at the call.

### 3. Team picker
```
  Pick your team
  [ Vanguard   4/6 ]  [ Cinder    3/6 ]  [ Ridgeline  FULL ]
```
Reads `tournaments/{id}/teams` (public read, nested per `firestore.rules:1608`). Honors the existing
roster lock (`tRef.collection('rosterLocks').doc(uid)`) rather than reimplementing capacity rules.

### 4. In — hand off
Calls `ctfJoinTeam({ tournamentId, teamId, joinCode })`, then redirects to the existing
`arena/tournament-lobby.html?id=<id>`. **The existing lobby stays the competition surface.** This
page is an on-ramp, not a replacement, so none of the verified tournament machinery is duplicated.

### 5. Can't join — and say why
Distinct copy per cause, because "something went wrong" is what makes someone give up and leave:
not found · not started yet · already ended · wrong or missing code · event full · already on a team
(offer the lobby link).

## Identity and exposure

**Guest + callsign via `signInAnonymously`, ported from the class path in `_app/lobby.html`.**
`ctfJoinTeam` already accepts anonymous, so this is a UI port.

**Collect a callsign and NOT a real name.** `teams/{teamId}` is `allow read: if true` and carries
`members[]` (raw Firebase UIDs) and `memberNames[]`. The class guest path asks for a full name
"visible to instructor" — correct there, wrong here. These are strangers at a public event who
signed nothing; publishing their real names on a world-readable document is a dox risk the
platform's own rules forbid.

**CORRECTION — the callsign needs a BACKEND change, and an earlier draft of this document said it
needed none.** `_resolveUserName` reads `users/{uid}.callsign`, but **`callsign` is not in the
`users/{uid}` create allowlist** (`firestore.rules:97-109`), so no client can write it. The class
path works only because it hands the callsign to the `enrollInClass` CALLABLE, which writes it with
the admin SDK. `ctfJoinTeam` accepts only `{tournamentId, teamId, joinCode}` — there is no way to
supply a name. **A stranger joining today is rendered `Player-xxxx`** by `_placeholderName`, which
is privacy-correct but useless to a teammate trying to find them on a roster.

So `ctfJoinTeam` gains one optional `callsign` parameter, server-validated (length-capped, charset-
restricted, trimmed) and server-written. That is the right place for it: the rules comment at
`firestore.rules:1615-1617` says this callable exists precisely so the name↔uid binding is validated
server-side, because "a client rule cannot secure the parallel members[]/memberNames[] arrays".
Adding the name to that same callable follows the existing reasoning rather than working around it.

**Known limits of anonymous identity, stated so they are chosen rather than discovered:**
- Browser-local. Clearing storage mid-event loses team membership.
- Free and unlimited — one person can take many identities and many team slots. Tolerable for a
  friendly public event; **not** tolerable where prizes or published rankings are at stake.
- Not contactable afterwards. No reminders, no results email, no recruiting.

If any of those three matter, the identity decision changes (see *Open decisions*).

## The hybrid-resource dimension — raised by the operator, and it changed two things

A tournament is not a Firestore document with a scoreboard. Its resources are hybrid: cloud,
**local infrastructure**, serverless functions and more. Real challenges are KVM guests on the
operator's own hosts. Measured:

- `box_pool` holds one document per machine with `url`, `username`, `password`, `label`, and
  `assignedTo: {tournamentId, teamId, challengeId}` — a box is bound to a TEAM.
- Access URLs are shaped `https://<host>/t/<32-hex-token>/` — a **bearer capability** to a live VM,
  with the credentials sitting in the same document.
- `box_pool` is `allow read, write: if isAdmin()` (`firestore.rules:324-326`), and the only file in
  `_app/` that references it is `admin/console.html`. **Competitors are never served a box URL by
  the web app**; the operator distributes them out-of-band.

### What that changed

**1. The path was renamed `/t/` → `/join/`.** `/t/<token>` is already the box-access convention.
All 6 box hosts are `.tech`, so there was no literal collision with `hexworth.com/t/` — but
shipping a public join page one path segment away from a credentialed shell-access URL is a
confusion waiting for an incident. `/join/` cannot be mistaken for either.

**2. It bounds the risk of this feature, and that is the load-bearing security fact.** An uninvited
person who joins gets a name on a roster. They do NOT thereby reach a VM, because the credentials
never leave the admin surface. Without this, the feature would read as "a stranger with shell access
to the operator's infrastructure" rather than "an extra name on a scoreboard." Sent to Mallory as
the one claim to verify independently: any path by which a joined member can read `box_pool` or
infer a box token is a P0 that outranks everything else in this design.

### What it also bounds — honestly

**This on-ramp does not complete the competitor journey.** It solves identity and roster. Infra
access remains a separate operator step: the team still has to be handed its box URL and
credentials. For a walk-up event that is fine — the operator is in the room. For a remote public
event it is the next real problem, and this design does not solve it. `box_pool` being admin-only is
a deliberate control, not an oversight, so "just show the member their box URL" is a security
decision rather than a feature, and not one to make inside this change.

**A secondary consequence worth stating:** because a box is bound to a `teamId`, squatting a
specific team is not merely taking a slot — it is claiming a position an operator will later hand
real credentials to. That raises the severity of the anonymous registration-DoS in the risk list
above from "annoying" to "pre-positioning," and is the reason it is the first thing in Mallory's
brief.

## Private events

The link is the secret. Send it only to invitees; do not publish it. Optional second factor: keep
`hasJoinCode` set and **do not** put `?c=` in the link — say the code aloud at the start. Then a
leaked link alone is not enough.

This needs no email infrastructure, which matters because **there is none**: no SendGrid, Mailgun,
SES or nodemailer anywhere in `functions/`. Any design that depends on emailing a code is net-new
infrastructure plus deliverability, bounce handling and PII at rest.

## Build inventory — honest about size

| # | Piece | New or reuse | Size |
|---|---|---|---|
| 1 | `/t/**` rewrite in `firebase.json` | new, precedent exists | trivial |
| 2 | `tournament-join.html`, 5 states | new | medium |
| 3 | Slug field + equality query | new field, no index | small |
| 4 | Guest/callsign identity on the tournament path | **port** from `lobby.html` | small-medium |
| 5 | Code from URL → `ctfJoinTeam` | new, server validation unchanged | small |
| 6 | `ctfJoinTeam` gains an optional validated `callsign` param | **backend change** | small |
| 7 | Admin console: set/show slug, copy link, show QR | new | small-medium |

**No change to:** the private-config code storage, code validation logic, the arena lobby as
competition surface, scoring, flags, standings, badges. Piece 6 is the only backend edit and it is
additive — one optional parameter on an existing callable, with the existing name-resolution
fallback untouched when it is absent.

## Risks to clear before building

1. **`resolveJoinCode` is unauthenticated with no rate limiting found** (`functions/index.js:6217`,
   `uid` optional). A public funnel aims more traffic at a code oracle. This page can bypass it by
   resolving the slug directly and letting `ctfJoinTeam` validate the code — but the oracle still
   exists and short codes remain brute-forceable. Worth a separate look.
2. **Open bug: `teams/{teamId}` world-readable with raw UIDs** (taskboard 423). Strangers joining
   makes it worse in kind, not just in degree. Callsign-only is a mitigation, not a fix.
3. **Anonymous abuse at scale** — team-slot squatting by one person with many identities. No
   per-IP or per-session limit exists today.
4. **`status` must gate the UI, not just the callable.** Letting someone through to a failed call is
   the difference between a stranger competing and a stranger leaving.

## Open decisions — operator's, not mine

1. **Do you need to contact registrants after the event?** If yes, anonymous is wrong and the
   identity choice becomes email magic-link (Firebase supports it; not enabled here). That keeps PII
   inside the auth system instead of a hand-rolled form — the main reason to prefer it over a custom
   registration page.
2. **Are prizes or published rankings at stake?** If yes, free unlimited anonymous identities are a
   dealbreaker and identity must be durable.
3. **Pre-registration / headcount before the day?** Deliberately NOT designed here. The same page
   grows a "reserve a spot" state later if wanted; a walk-up event does not need it.
4. **Slug now or `?id=` first?** `?id=` ships without a schema change; the slug is the ergonomic win
   that makes the artifact usable on a slide.

## What this deliberately does not do

- No email transport, no invite mailing.
- No new registration collection, no PII at rest, no unauthenticated write path.
- No replacement of the arena lobby or any scoring/flag/standings code.
- No pre-registration or waitlist.
- No change to how join codes are stored or validated.

Related: `_docs/features/CTF_ARENA.md`, taskboard 423 (teams world-readable), BUG-269/270
(join-code and flag-secret exposure, both fixed, ended-tournaments only).
