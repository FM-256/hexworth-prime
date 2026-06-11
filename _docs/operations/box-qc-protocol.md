# Box QC Protocol

**Status:** Active · **Origin:** ALA verbatim-QC sweep, 2026-06-10/11 · **Owner:** content/engineering

How to quality-check a CTF/box lab so you can honestly say "every command works and the lab is completable." Written after an ALA sweep where the labs were sound but the *QC method* repeatedly produced both false passes and false failures. The lessons here are mostly about not fooling yourself.

---

## TLDR

1. **QC means replaying the lab's walkthrough VERBATIM through the real engine** — the student's exact commands, in order, every flag. Anything derived from the lab's own config is circular and proves nothing.
2. **Two gates, not one:** (a) every flag awards, and (b) every command returns the output a student expects. Flag-completion alone misses broken-but-non-blocking commands.
3. **Ground truth is flags awarded, not the harness's "failing step" count.** The harness is the least trustworthy part of the loop — most "broken lab" findings in practice are extraction bugs in the harness.
4. **Never assert "verified" from memory or a summary. Re-run fresh.** Twice in one sweep a harness shortcut — not the lab — was the culprit.
5. **Walkthroughs are maintained in two places** (shared folder + Confluence) and must be synced on every edit. Engine/config fixes go through the gated deploy.

---

## The core principle

A lab is completed by following its **walkthrough** (`~/hexworth-shared/Solutions/<course>/<LAB>-SOLUTION.md`). Therefore QC is: take the commands a student actually types from that walkthrough and run them, in order, through the same `BoxEngine` the student uses. If every documented command runs and every flag awards, the lab is QC'd.

The anti-pattern that started all this: QC'ing against commands *derived from the lab's own config* (its hints, its flag-award logic). That is near-tautological — you are testing the config against itself, not against the path the student walks. It will report "completable" on labs riddled with dead ends. The walkthrough is the spec; test against the spec.

---

## The protocol

Run per lab. This is the [[scan-fix-verify-loop]] specialized for boxes.

1. **Extract** the student command sequence from the walkthrough (see *Command extraction* — this is where it goes wrong).
2. **Replay** verbatim through the live engine via the headless harness. Capture, per command: the actual output and the set of flags awarded so far.
3. **Gate A — completion:** every flag in `config.flags[]` awarded? If not, find the blocking command and diagnose.
4. **Gate B — command response:** does each command produce its expected output (no `command not found`, `No such file`, `Sorry, try again`, `Usage:`, thrown exception)? Flag every anomaly and classify it: real lab/engine defect, intentional teaching-failure demo, or harness-extraction artifact.
5. **Diagnose before fixing.** Confirm whether the fault is the walkthrough, the engine/config, or the harness. Most first-pass "failures" are the harness.
6. **Fix the right surface** (see *Fix rules*). Re-run from step 2 until both gates are clean.
7. **Sync + ship:** update the walkthrough in the shared folder AND Confluence; commit and gated-deploy any engine/config change; record the result.
8. **Produce a command-response report** documenting each box's command → response. Template: `_docs/operations/ala-walkthrough-command-qc-2026-06-11.md`.

---

## The harness

Headless Chromium driving the real engine. Reference implementations from the ALA sweep: `/tmp/ala-transcript.js` (full command→response transcript) and `/tmp/ala-vrun.js` (flag + FAIL summary). Rebuild if `/tmp` is cleared.

- Launch puppeteer, **block the auth/co-op/briefing scripts** so the lab boots solo without a login wall (`FirebaseAuth|firebase-init|CoOpSync|CoOpLobby|CoOpUI|BriefingPage|HexAIButton|HatRating`).
- In-page: `eval` the lab's config global, set `BoxEngine.config`, stub `BoxEngine.awardFlag` to record IDs, `ArenaTerminal.init(...)`, then loop `term._execute(line)` over the command list, slicing `term.outputEl.textContent` per command for the response.
- Per-lab inputs: page URL, config global name (`grep -oE "[A-Za-z0-9_]*Config" config.js | head -1`), expected flag count (`grep -cE "id:\s*['\"](flag|cmd)[0-9]+['\"]" config.js`).

The harness is a tool, not an oracle. When it disagrees with the walkthrough, suspect the harness first.

---

## Command extraction — where QC goes wrong

The walkthrough is markdown: `#### Step N` headings, fenced command blocks, fenced **output** blocks, and fenced **file-content** blocks (what the student writes *into* a file). Only the command blocks are commands. Three failure modes, all observed:

| Failure mode | Symptom | Cause | Fix |
|---|---|---|---|
| First-fence-only under-capture | Lab falsely reports missing a flag (e.g. L04 `ESTABLISHED,RELATED` rule, L12 svc-ghost removal) | One `#### Step` often has *several* command fences (Rule 1, Rule 2, …); grabbing only the first drops the rest | Capture **every** command fence per step |
| Output/file-body over-capture | Dozens of bogus "failing steps" (`options {`, `version: 2`, `PermitRootLogin no`, `Job for … failed`) | File-content and output fences fed to the engine as commands | Exclude them — output fences are preceded by an `Output` label; file bodies follow an editor/`write` command |
| Placeholder substitution | L07/L08/L09 falsely fail with 0 flags | Shortening a `write <file> <body>` to a placeholder breaks **content-aware `write` validators** that parse the body | Use the **exact** `write` line from the doc, body and all |

**Practical rule:** curate the command list — emit only the shell commands a student types, with their full inline content; exclude file bodies and output blocks. Pull `write`/`cat`-with-content lines verbatim from the doc (`grep -nE "^write "`), don't reconstruct them. A first-token allowlist is too fragile (`file`, `crontab`, `nameserver` are ambiguous between command and file-body). See memory [[reference_verbatim_walkthrough_qc_extractor]].

---

## Recurring lab-defect catalog

Classes of real defect seen across boxes. Check for each:

| Defect | How it shows | Fix |
|---|---|---|
| Missing custom `sudo` handler | every `sudo X` → `Sorry, try again` | add the sudo re-dispatch handler (mirror L01); note it dispatches only to `config.commands[]`, **not** builtins |
| Editor vs `write` | walkthrough says `nano`/`vi`; sim has only `write <file> <content>` | rewrite the step to `write …`, or keep the editor line only as a reference |
| Command-name mismatch | walkthrough command ≠ the handler name in config | align the doc to the real command (`submit`→`answer`, `crontab -e`→`addcron`, `backup-cells.sh`→`backup.sh`) |
| Unsupported shell syntax | `command not found` / no output | avoid `for`/`$()`/`cut`/`visudo`/process-substitution `<(...)`; `&&` only with `config.shellChaining: true`; `~`, `sort`, command-substitution `$(date +%F)`, and globs are not universally supported |
| Unimplemented command | `<cmd>: command not found` even bare | `mv`/`sed`/`crontab`/`watch` are **not** Terminal.js builtins — add a per-lab handler or reframe the step |
| Flag-decoy mismatch | printed `FLAG{…}` ≠ `config.flags[].value` | align the decoy/printed string to the canonical flag value |
| Arg-index off-by-one | handler reads the wrong positional arg | fix the index; account for the `sudo` prefix being stripped |
| Content-aware `write` rejects | `write: <file> missing …` | the body must satisfy the validator — use the doc's exact content |

---

## Engine constraints (verify against current `_app/arena/engine/Terminal.js`)

As of 2026-06-11 — re-check before relying on these, the engine drifts:

- **Builtins:** `ls cd pwd cat head tail find whoami id hostname uname file clear help history echo date export alias man exit reset`. The bare `sudo` builtin is a **hostile stub** ("Sorry, try again") — labs override it with a custom `sudo` in `config.commands`.
- **Pipe-aware builtins:** `echo cat awk tr head tail grep wc sort`.
- **`sudo` re-dispatch** (per-lab handler) resolves `config.commands[realCmd]` only. `sudo <builtin>` (e.g. `sudo mv`) fails unless the lab defines that command. Real `sudo`-of-a-builtin is *not* wired through.
- **Opt-in `&&` chaining** via `config.shellChaining: true` — leave it OFF for injection boxes (e.g. a3-phantom-shell) where `&&` is the payload, not a feature.
- Dispatch order: `config.commands[cmd]` is checked **before** builtins, so a lab can override anything.

Anything the walkthrough uses beyond this set is a defect to fix (add a handler) or a step to reframe.

---

## Fix rules

- **Fix the walkthrough or the engine — never weaken the lab.** If the verify script legitimately requires a rule/step, add it to the walkthrough; don't loosen the check.
- **Prefer the surface that makes the documented command actually run.** If the doc claims the engine does something (e.g. "the engine detects the move and sets `_aideInstalled`"), wire that up rather than deleting the step.
- **For real-world commands that don't belong in the sandbox** (post-completion remediation like `sed`/`systemctl reload` in a detection lab), keep them as clearly-labeled reference, not as executable steps a student is told to type and that then error.
- **Demote, don't broaden** when a validator over-detects a now-mitigated pattern (see [[feedback_severity_demotion_pattern]]).

---

## Sync and ship

- Walkthrough edits land in **both** `~/hexworth-shared/Solutions/<course>/` and Confluence (`publish-solution.py update <page_id> <md>` — never re-`publish`, it duplicates). Page map: `_tools/confluence/ala-walkthrough-pages.md`. Students do not have walkthrough access unless the instructor grants it.
- Engine/config changes commit to `master` and ship via `./deploy.sh` (Nexus → smoke → deploy → post-verify). The post-verify EduScan gate flags the standing platform HIGH backlog on every deploy; the deploy still SHIPS — confirm `+0 new` and the lab content-leak smoke `PASS`, that's the regression signal for box work.

---

## Honesty rules (the actual lesson)

- **Re-run fresh; never claim "verified" from a prior summary.** State of the world changes and memory of a passing run is not a passing run.
- **When the harness says a lab is broken, prove it against the walkthrough text before believing it.** First-fence-only extraction and placeholder `write` bodies each masqueraded as broken labs in this sweep.
- **Report faithfully.** If a command errors, the report says so; if a step is a reference and not executable, it says that. "Completable" and "every command works" are different claims — make both explicitly.
- Never self-review as the adversarial reviewer; dispatch the real agent. See [[feedback_never_impersonate_nancy]].

---

## Related

- Memory: [[reference_verbatim_walkthrough_qc_extractor]], [[feedback_scan_fix_verify_loop]], [[feedback_grep_before_asserting]]
- Report template: `_docs/operations/ala-walkthrough-command-qc-2026-06-11.md`
- Engine: `_app/arena/engine/Terminal.js`, `_app/arena/engine/BoxEngine.js`
