# Linux Mastery — Hint vs Validator Mismatch Triage

**Status:** BLOCKERs in remediation (2026-07-16); MAJOR/MINOR content pass pending.
**Scope:** all 53 `script-lm-NN-*.module.html` modules under `_app/houses/script/modules/linux-mastery/`.
**Ground truth:** each module's `onCommand` validators + the engine `_app/components/LinuxTerminal.js`. On-screen hint/lesson text is NOT authority.
**Precedent:** lm-34 (Section-5 practice) shipped 2026-07-16 (commit `9da593dec`) — same bug class (engine `bg-start` callback unhandled). See `reference_lm34_bgstart_regression.md`.

## TLDR

The failure class: a student types the on-screen hint (or copies a lesson-card example) verbatim and gets ZERO credit — sometimes with a red error, sometimes silently — so a task or whole module can't be completed. Two structural causes dominate:

1. **Unseeded files referenced by hints.** A hint names a file the module never seeds; the command errors; an error-gated validator then withholds credit. (lm-23 = BLOCKER, plus lm-24/lm-12/lm-46.)
2. **Hints teach shell builtins the engine doesn't implement** (`test`, `[`, `expr`, `local`, `for`, `while`, `function`). These return `<span class="lt-error">command not found</span>`; a validator with an `&& ok` grading-honesty gate (`ok = !output.includes('lt-error')`) then rejects the exact hinted command. (lm-44/46/48 = BLOCKERs.)

Plus a family of misleading lesson-card examples that error if copied (MAJOR) and cosmetic "red error then green check" cases (MINOR).

**Engine contract every module must respect** (all confirmed in `LinuxTerminal.js`):
- A trailing `&` is intercepted and re-fired as `cmd='bg-start'` (not the real command).
- A `|` pipe re-fires as `cmd='pipe'`; a `>` redirect as `cmd='redirect'` — with empty `args`.
- `sudo` is NOT stripped by the engine (`cmd` stays `'sudo'`) and its first use hits a password prompt (`P@55w0rd!!`) the module must disclose.
- Unknown commands emit an `lt-error` UNLESS the module sets `suppressUnknown: true` (then they return `null`).

## Remediation patterns

| Pattern | Fix | Why it's correct |
|---|---|---|
| Unseeded file in hint | seed the file (`addFilesystem` + `children.push`), or retarget hint to a seeded file | one-line, keeps the lesson intent |
| `&& ok` gate + engine-unimplemented builtin | `suppressUnknown: true` on the module init | unknown cmd returns `null` → `ok` stays true → the **honesty gate is preserved** (a failed KNOWN command still emits `lt-error`); also removes the cosmetic red error. Proven in lm-43/50/53. **Do NOT drop the `&& ok` gate** — it was added deliberately for grading honesty (#79). |
| `sudo`/pipe/redirect in hint | retarget hint to the bare command, or strip `sudo` in the validator (as lm-34 does) | the engine rewrites `cmd`, so gating on the inner command never matches; `sudo` also walls on the password prompt |
| `_cut` joined tokens / no `-c` | engine fix: accept `-f1`/`-d,` joined forms and add `-c` support | one engine change clears 3 lm-18 MAJORs |

## BLOCKERs — module/task uncompletable via its own hints (6 findings, 5 modules)

| Module | Task | Hint (verbatim) | Why it fails | Fix | Status |
|---|---|---|---|---|---|
| lm-23 chmod | Remove / Add / Numeric permission | `chmod -w file.txt` (etc.) | `file.txt` never seeded (module seeds `script.sh`/`private.key`/`config.conf`/`program`/`project`) → errors → error-gated reject | seed `file.txt` | fixing 2026-07-16 |
| lm-44 conditionals | Combine Conditions | `test -f /etc/passwd && echo "found"` | `test` unimplemented → `lt-error` → `&& ok` rejects; all `&&` hints lead with `test` | `suppressUnknown: true` | fixing 2026-07-16 |
| lm-46 functions | Local Variables | `local name="value"` | `local` unimplemented → `lt-error` → `&& ok` rejects; only hint for the final task | `suppressUnknown: true` | fixing 2026-07-16 |
| lm-48 sec7 practice | Ch3 File-Existence Check | `test -f …` / `[ -f notes.txt ] && echo` | `test`/`[` unimplemented → `lt-error` → `&& ok` rejects; blocks the 8-challenge badge | `suppressUnknown: true` | fixing 2026-07-16 |
| lm-48 sec7 practice | Ch6 Number Comparison | `[ 10 -gt 5 ] && echo` | same `[`/`test` error | `suppressUnknown: true` | fixing 2026-07-16 |
| lm-51 pkg-mgmt | Task 3 Install Workflow | `sudo apt update` then `sudo apt install nginx` | `sudo` opens an unstated password prompt; validator also sees `cmd='sudo'` not `apt`. Bare `apt` works | **OVERRIDE of "retarget to bare apt"** — operator chose "Teach the password" (keep `sudo apt` for real-world fidelity; teaching `apt` without sudo is wrong Linux). Fix: engine `_apt` now simulates apt (search/show/list need no root; update/install/upgrade require root via sudo); validator strips a leading sudo + gates 'workflow' on a successful run; Task 3 hint discloses the sim password `P@55w0rd!!`. | FIXED 2026-07-17 |

## MAJOR — hint fails but a correct path is discoverable, OR a lesson-card example misleads

| Module | Where | Problem | Fix |
|---|---|---|---|
| lm-24 chown | Tasks 1-5 hints | all use unseeded `file.txt`; chips still tick (pattern-only, no `ok` gate) but every command throws a red error → reads as broken | retarget hints to seeded `shared.txt`, or seed `file.txt` |
| lm-35 network-info | lesson card / Task 1 | `ip -br addr` → `args[0]='-br'` ≠ `addr` → task 1 never credits from that form (also breaks `ip -4 addr`) | relax validator: `cmd==='ip' && (args.includes('addr')||args.includes('a')||args.includes('address'))` |
| lm-36 connectivity | lesson card / Task 3 | `sudo ss -tulnp` → `cmd='sudo'` + password wall; task's own hint `ss -tuln` works | strip `sudo` in validator (lm-34 pattern) or drop `sudo` from the card |
| lm-06 navigation | tree diagram | shows `projects` (unseeded → `cd projects` errors); omits the real `scripts` dir | fix lesson-card example (`projects` → `scripts`) |
| lm-12 sec2 practice | card 6 Copy a File | `cp readme.txt readme_backup.txt` → home seeds `readme.md` not `readme.txt` | align card to `cp practice/notes.txt practice/backup.txt`, or seed `readme.txt` |
| lm-12 sec2 practice | card 2 Create Directory | `mkdir project` after card-1 `cd Documents` → `Documents/project` already exists → errors | use a non-existing dir name / drop the `cd Documents` framing |
| lm-17 sort-uniq | Task 3 Remove Duplicates | `sort names.txt \| uniq` → pipe re-fires as `cmd='pipe'`; stage-2 `uniq` gets no stdin → "reading from stdin", no dedup (credits anyway) | retarget hint to `uniq names.txt` |
| lm-17 sort-uniq | Task 4 Count Duplicates | `sort names.txt \| uniq -c` → same pipe/stdin issue; lesson output fabricated | retarget hint to `uniq -c names.txt` |
| lm-18 cut-paste | Task 1 Extract Field | `cut -f1 data.csv` → `_cut` needs `-f` as a separate token; joined `-f1` → "must specify a list of fields" | retarget hint to `cut -d, -f 1 data.csv`, or fix `_cut` |
| lm-18 cut-paste | Task 2 Custom Delimiter | `cut -d',' -f2` → joined `-d,`/`-f2` both ignored → error | retarget hint to `cut -d, -f 2 data.csv`, or fix `_cut` |
| lm-18 cut-paste | Task 3 Extract Characters | `cut -c1-5` → `_cut` has no `-c` support at all | add `-c` to `_cut`, or retarget task to a `-f` form |
| lm-39 ssh-basics | Task 1 Generate Keys | bare `ssh-keygen` → validator needs `args.length>0`; `-t ed25519` form works | drop `args.length>0`, or remove the bare form from the hint |
| lm-40 sec6 practice | Ch7 Key Generation | identical bare `ssh-keygen` failure | same as lm-39 |
| lm-48 sec7 practice | Ch2 Command-Line Args | `expr 5 + 3` → `expr` unimplemented → `lt-error` → `&& ok` rejects; `echo $((5 + 3))` works | remove `expr` from hint (the `suppressUnknown` BLOCKER fix also resolves this) |

## MINOR — credit is granted but output errors, or purely cosmetic

| Module | Where | Note |
|---|---|---|
| lm-07 listing-files | sample-output card | shows `projects`; real `ls` lists `scripts`; the `ls` task still passes |
| lm-12 sec2 practice | card 8 View Contents | `cat notes.txt` is cwd-dependent after `cd Documents` |
| lm-13 grep-basics | info-box example | `cat file.txt \| grep -c "error"` — unseeded file + pipe; copyable but earns nothing |
| lm-13 grep-basics | grep tasks | credit despite seeded `/var/log/syslog` having no matching "error" line (expected output never appears) — inverse honesty issue |
| lm-17 sort-uniq | reference tables | `sort -k2`, `sort -u`, `uniq -d`, `uniq -u` shown but unsupported by `_sort`/`_uniq` |
| lm-18 cut-paste | paste + `-c` reference | `paste` unimplemented ("command not found"); shown with fabricated output |
| lm-33 systemd | Task 2 sudo systemctl | first `sudo` prompts for `P@55w0rd!!`, never restated in this module; non-sudo form also passes |
| lm-47 practical-scripts | Task 2 / Task 3 | `cat analyzer.sh` / `cat health.sh` — seeded files are `log-analyzer.sh` / `health-check.sh`; spurious "No such file" though still credits |
| lm-46 functions | Task 2 Call Function | `cat script.sh` unseeded; `bash script.sh` form works |
| lm-44 / lm-45 / lm-46 / lm-48 | non-gated construct tasks | `for`/`while`/`function` etc. credit despite a red "command not found" — reads as "failed then passed". The `suppressUnknown` BLOCKER fixes (lm-44/46/48) incidentally clear these; lm-45 remains |

## Clean modules (no findings)

lm-01, lm-02, lm-03, lm-04, lm-05, lm-08, lm-09, lm-10, lm-11, lm-15, lm-16, lm-19, lm-20, lm-21, lm-22, lm-25, lm-26, lm-27, lm-28, lm-29, lm-30, lm-31, lm-32, lm-34 (fixed), lm-37, lm-38, lm-41, lm-42, lm-43, lm-49, lm-50, lm-52, lm-53.

## Counts

- **BLOCKER: 6** (5 modules) — in remediation.
- **MAJOR: ~14** — content pass + two engine fixes (`_cut`, `ip` validator).
- **MINOR: ~13** — cosmetic; several auto-resolved by the BLOCKER `suppressUnknown` fixes.

## Related work

- #65 Dual-course QC sweep + complaint intake (LM + A+) — this triage is the LM half.
- #79 LM grading honesty (the `&& ok` gates being preserved here originate from this).
- #103 Grading-honesty sweep (code-house Armory ~20 modules + dark-arts Linux labs ~5) — the `&& ok`-vs-unimplemented-builtin pattern likely recurs there.
- #104 `LinuxTerminal.js` root session home should be `/root` — separate engine item.
