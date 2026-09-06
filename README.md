# Hexworth Prime

A teaching platform for IT and cybersecurity. Real labs in real containers, server-graded
assessments, and a shell that fronts the whole thing.

Served by Firebase Hosting from `_app/`. **There is no build step** — raw HTML, CSS and JS. If a
change needs a bundler, the change is wrong.

---

## Layout

| Path | What lives there |
|---|---|
| `_app/` | the web root; everything served to a student |
| `_app/hex/` | **Hex OS** — the shell and launcher over all 192 apps |
| `_app/houses/` | course content, organised by house |
| `_app/arena/`, `_app/dispatch/` | CTF boxes |
| `_app/operator/` | 124 Operator missions |
| `_app/components/` | shared client code (progress, auth, tenancy, catalog) |
| `functions/` | Cloud Functions — grading, flag validation, progress sync |
| `_docs/` | architecture, operations runbooks, the bug tracker |
| `_tools/` | tooling and gates. **Gitignored**; files need `git add -f` |

## Hex OS

A command line in the browser that fronts every launchable surface on the platform. Twelve
commands, each with a `man` page, over a generated manifest of 192 apps.

It exists because things were going quietly unreachable — dead cards, an exam with no link from its
own hub. The manifest is generated, not hand-maintained, and a deploy gate fails if any entry points
at a file that does not exist.

Seven phases, `_docs/architecture/hex-os-scope.md`:

| Phase | State |
|---|---|
| 0 manifest · 1 `run` CLI · 2 launcher · 3 dead-entry gate · 4 home · 5 PWA install | **live in production** |
| 5b offline | **declined for now** — the shell is a launcher, and `run` navigates to pages that are deliberately never cached, so offline buys a catalogue you cannot open |
| 6 Hex Live (bootable image) | **built and boot-verified, hardware bar NOT met** |

**Hex Live** is a Debian image whose whole session is the shell. It exists for hardware a browser
cannot reach: monitor mode, USB, serial, SDR. It builds and boots unattended, but the capability
that justifies it has never been tested on a real radio, so it is not finished. See
`_docs/operations/hex-live-runbook.md`.

## Deploying

```
./deploy.sh              # branch check -> Nexus -> smoke -> firebase deploy -> post-verify
```

Bare `firebase deploy` skips the smoke and Nexus gates. Do not use it.

Deploys ship the **working tree**, not the commit. What is on disk is what students get.

## How work gets decided here

Decisions are a **four-way vote**: Nancy (adversarial review), Mallory (exploit-driven audit),
Chris (purpose and quality bar), and the primary agent. One vote each, actually convened, no proxy
and no invented votes. `deploy.sh` gate 1.5 will not ship student-facing changes without a recorded
Chris PASS matching HEAD.

This is not ceremony. Nine defects in one Hex OS round were found by reviewers and none by its own
132-assertion suite, because that suite was written by someone who already thought in commands.

## Things that will bite you

- **`position: fixed` is broken** when `body.style.filter` is set. Use `position: absolute`.
  `position: sticky` is fine.
- **Never client-grade.** Every quiz, exam and CTF is graded server-side. A client that decides its
  own outcome is a client that can be told to lie.
- **`firebase.json`'s hosting `ignore` is not a filesystem property.** Answer keys live inside
  `_app/` and are kept off the wire by that list alone, so any process that copies `_app` by other
  means re-exposes them.
- **Cite by name, not by line.** `file.js:NNN` in a comment rots on the next insertion. A back-link
  moved four times in one session while the comment describing it was being fixed.
- **A hand-maintained list that restates an authoritative one is a bug**, not a style choice. The
  same drift shipped three separate defects in two days.

## Docs

- `_docs/INDEX.md` — documentation hub
- `_docs/architecture/hex-os-scope.md` — Hex OS scope and phase status
- `_docs/operations/hex-live-runbook.md` — building, booting and testing Hex Live
- `_docs/operations/BUG_TRACKER.md` — open and resolved defects
- `_tools/CATALOG.md` — every script, and whether anything actually runs it
