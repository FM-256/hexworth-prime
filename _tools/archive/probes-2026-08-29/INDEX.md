# Archived probes — 2026-08-29

One-off scripts moved out of the live tree. **Nothing deleted**; every file is here verbatim.

## Why this index exists, and why a bare archive was not enough

The operator's rule is archive-never-destroy, and the goal behind it is a specific moment:
*"Hey, we already have the script for that test already built, why not use it."* That moment
only happens if the archived thing is FINDABLE when someone is about to rebuild it.

It did not happen today. `_concurrency_tmp.js` below already fired 20 simultaneous launches, and
I built a 195-line `_tools/openstack-bridge/concurrency-test.js` doing the same thing. I *did*
search `CATALOG.md` first, as the rule requires — but that file had no `@catalog` header and sat
at repo root, so it was invisible to exactly the search the rule prescribes. **An un-indexed
archive is a graveyard.** Hence this table: grep it by the QUESTION, not the filename.

Before writing a new probe: `grep -ri "<what you are about to measure>" _tools/archive/*/INDEX.md`

## What each one answered

| Probe | Question it answered |
|---|---|
| `_btn_check_tmp.js` | _(no header — the reason it was invisible)_ |
| `_btn_wire_tmp.js` | Same check, but in the state that exposed the last mistake: terminal EMBEDDED. |
| `_chris_layout_scroll_tmp.js` | _(no header — the reason it was invisible)_ |
| `_chris_layout_shot_tmp.js` | _(no header — the reason it was invisible)_ |
| `_chris_measure2_tmp.js` | _(no header — the reason it was invisible)_ |
| `_chris_measure3_tmp.js` | _(no header — the reason it was invisible)_ |
| `_chris_measure_ch_tmp.js` | _(no header — the reason it was invisible)_ |
| `_chris_measure_tmp.js` | _(no header — the reason it was invisible)_ |
| `_chris_recheck2_tmp.js` | _(no header — the reason it was invisible)_ |
| `_chris_recheck3_tmp.js` | _(no header — the reason it was invisible)_ |
| `_chris_recheck4_tmp.js` | _(no header — the reason it was invisible)_ |
| `_chris_render_check_tmp.js` | Abort AccessGuard.js and other auth-blocking requests |
| `_chris_shot2_tmp.js` | _(no header — the reason it was invisible)_ |
| `_chris_shot_tmp.js` | _(no header — the reason it was invisible)_ |
| `_chris_top_screenshot_tmp.js` | _(no header — the reason it was invisible)_ |
| `_concurrency_tmp.js` | 20 students hitting Launch at once -- what the start of a class actually looks like. |
| `_density_tmp.js` | _(no header — the reason it was invisible)_ |
| `_dock_measure_tmp.js` | Measure the dock in the state a STUDENT is in: terminal OPEN. The previous version measured |
| `_empty_ratio_tmp.js` | Chris's metric: how much of a coloured callout box is blank? A bordered, tinted box that is |
| `_hz_console_tmp.js` | The STUDENT path: log in to Horizon, open the instance console tab, and see whether the |
| `_launch_probe_tmp.js` | What does a launch actually return right now? The Horizon panel is skipped when |
| `_live_shot_tmp.js` | _(no header — the reason it was invisible)_ |
| `_m2_shot_tmp.js` | _(no header — the reason it was invisible)_ |
| `_newstudent_tmp.js` | A student who has never claimed a slot. If the pool is exhausted they fall to read-only mode, |
| `_office_browser_tmp.js` | Browser stage of the office test: take the credentials the launch just issued, log in to |
| `_office_e2e_tmp.js` | The FULL student journey, executed from the office network with tailscale offline: |
| `_panel_check_tmp.js` | _(no header — the reason it was invisible)_ |
| `_preview_verify_tmp.js` | Assert the BANNER text as a student sees it, not just the source: paint the monitor into a |
| `_prod_dock_tmp.js` | Production dock + dash verification, in a real browser. |
| `_prod_final_tmp.js` | Production verification: the button must EXIST, be VISIBLE with the terminal open, and be |
| `_pv_tmp.js` | _(no header — the reason it was invisible)_ |
| `_real_launch_tmp.js` | Real student flow: sign in on the login page FIRST (AccessGuard blanks the lab page for |
| `_repro_panel_tmp.js` | Reproduce the student's actual experience: signed in, on the live page, click Launch Sandbox, |
| `_sc_tmp.js` | widest painted content vs container right edge |
| `_sprint_shot_tmp.js` | _(no header — the reason it was invisible)_ |
| `_student_path_tmp.js` | The path a real student takes, in order, exactly as the page now describes it. |
| `_survey_tmp.js` | Measure every lab the way the capstone should have been measured from the start: |
| `_verify_dock_tmp.js` | Render-verify the terminal dock. Served over HTTP so absolute asset paths resolve, with |
| `_vnc_browser_tmp.js` | _(no header — the reason it was invisible)_ |
| `_who_tmp.js` | _(no header — the reason it was invisible)_ |
| `_widest_tmp.js` | _(no header — the reason it was invisible)_ |
| `_width_compare_tmp.js` | Does the fix actually change anything at COMMON screen widths, or only on very wide monitors? |
| `check_repro.js` | _(no header — the reason it was invisible)_ |
| `check_repro2.js` | _(no header — the reason it was invisible)_ |
| `probe2.js` | _(no header — the reason it was invisible)_ |
| `run_seedbase.py` | _(no header — the reason it was invisible)_ |
| `seedbase_check.py` | _(no header — the reason it was invisible)_ |
| `test_repro.html` | _(no header — the reason it was invisible)_ |
| `test_repro2.html` | _(no header — the reason it was invisible)_ |

## Screenshots (22)

Visual evidence captured alongside the probes above: `_chris_overlap_1366.png`, `_chris_overlap_1366_v2.png`, `_hz_console_proof.png`, `_live_prod_1920.png`, `_m2_step1.png`, `_office_console_proof.png`, `_panel_repro.png`, `_real_launch.png`, `_sprint_1920.png`, `_sprint_2560.png`, `_sprint_final_2560.png`, `_sprint_fixed_1920.png`, `_vnc_console_proof.png`, `combined-slide.png`, `hub-instructor-links.png`, `lab-laptop.png`, `lab-stage1.png`, `pv-deck.png`, `pv-presenter.png`, `repro.png`, `repro2.png`, `wsa-after.png`

## The ones worth promoting rather than re-writing

- **`_concurrency_tmp.js`** → already rebuilt as `_tools/openstack-bridge/concurrency-test.js`.
  The rebuild was not pure waste: the original minted a RANDOM identity per run
  (`conc${i}-${Date.now()}@...`), and since a pool slot binds to a uid for life, every run ate
  a slot permanently. The replacement uses fixed identities and hands slots back. But that defect
  would have been found by READING it, far cheaper than rebuilding it.
- **`_hz_console_tmp.js`**, **`_office_e2e_tmp.js`**, **`_student_path_tmp.js`**,
  **`_newstudent_tmp.js`** — full student-journey drivers. These are the shape that should become
  a permanent suite rather than being re-derived each time the question comes up again.

## chris_shot_matrix.js
**Question it answered:** does the Matrix card on career-paths.html render without horizontal
overflow at 1180px? Written by the Chris QC agent on 2026-08-29 while blocking commit 633d9e5db
over approximated salary bands. Superseded by `_tools/career/house-tracks.test.js`, which
screenshots nothing but re-derives that card's salary band from its source careers.html and
fails on drift. Original still at repo root as `_chris_shot_matrix_tmp.js` (untracked); removal
is the operator's call.

## chris_reverify_salary.js
**Question it answered:** does house-tracks.test.js genuinely re-derive salary bands from source,
or does it only agree with the values committed the same day? Chris ran it against a worktree at
the blocked commit 633d9e5db and confirmed it fails there with the corrected values. Superseded
by the suite itself. Original at repo root as `_chris_reverify_tmp.js` (untracked).

## chris_eye_card_check.js
**Question it answered:** does the Eye card render its 6-step roadmap without overflow, and is
Eye the only card with 6 steps? Chris wrote it while blocking 8c4b92e10 over a roadmap that
implied a promotion path Eye's own PATHS array contradicts. Answer: yes to both; the card is back
to 5 steps. Original at `_tools/career/_chris_eye_card_check_tmp.js` (untracked, gitignored).

## chris_reverify_tmp.js / chris_shot_matrix_tmp.js / chris_eye_recheck2.js
**Question they answered:** Chris's own re-verification probes across the career-card rounds,
covering the salary re-derivation A/B, the Matrix card render, and Eye's PATHS/DOMAINS track data.
All superseded by `_tools/career/audit-card-salaries.js` and `house-tracks.test.js`. Originals
remain at repo root and under `_tools/career/`; `rm` is denied by policy, so clearing them is the
operator's call.
