# MD-100 Final (CTS1156C): Staff Runbook

> **Changed 2026-11-05 (operator: open the final now, commit 293af4dad).** The window opens 2026-11-05 12:00 EST and the last new start stays 2026-11-19 18:30 EST. Arm it once the functions deploy is verified; it then stays armed until 11-19. Students start on their own schedule, so sweep expired sittings daily, not only on 11-19. The 11-19 timings below now apply to the last starters only.

**TL;DR.** You do four things:
1. Arm the window once (from 2026-11-05).
2. Rescue students only with Provision (failed install) or Restart (platform fault).
3. Sweep at 21:05 and again at 21:15.
4. Grade from the CSV.

Every action is on the results page. The server enforces who may do what; the page only shows buttons.

- Results page: `/houses/forge/md-100/exams/md100-final-results.html` (`?exam=rehearsal` is not used here; pick the exam in the page).
- Exam page: `/houses/forge/md-100/exams/md100-final.exam.html` (students); `?exam=rehearsal` for dry runs.
- Spec: `_docs/operations/md100-final-exam-spec-v2-2026-11-03.md` (8.2, and errata 13.x).

## Before the sitting (D15, Wed 2026-11-18)

| Check | How | Pass |
|---|---|---|
| Window constants | `functions/mdfinal/mdfinal-exams.js` `WINDOWS` | opens 2026-11-05 17:00Z (12:00 EST), last new start 2026-11-19 23:30Z (18:30 EST) |
| Armed (since 11-05) | Results page, Window control | "Armed: yes" |
| Real-exam allowlist empty | Results page, Window control | "Allowlisted: none" |
| Generator frozen | `GENERATOR_VERSION` in `mdfinal-core.js` unchanged since D11 | A bump refuses every live sitting (13.17 item 7) |
| Secret works | A rehearsal start by an admin succeeds | A weak or missing secret refuses every start |
| Class roster | Results page, pick the class | Every student listed; the class assigned `forge-md100-final`; the handler is staff |
| Rehearsal sittings | Restart each finished rehearsal (it deals a new lab) or use a fresh uid | No real student's lab is ever touched by a dry run |
| Runbook printed | This page | The provision password below is on paper |

## The sitting (Thu 2026-11-19, Eastern)

1. **17:15** Open the results page and pick the class. Confirm the roster.
2. **17:30** Window control: confirm "Armed: yes" (armed since 11-05). New starts are allowed until 18:30.
3. **18:00** Students open the exam page. Each student's 150-minute clock starts at their own start.
4. **During the sitting**, rescue only for these reasons:
   - **Failed install**, judged by staff, before the student hands over: select the student, then **Provision PC**. Phase 1 is graded as it stood. Tell the student the technician password: `Meridian-Tech-2026`.
   - **Platform fault** (VM unreachable, engine error, outage) before handover: **Restart sitting**.
     - Choose the fault code and give an evidence reference (ticket or log id).
     - To return the time the student lost, choose "Give back the time lost at the fault" and enter when the fault began.
     - A second restart of the same student needs the operator.
   - **A broken build**: the student may restart it themselves, up to twice, before handover. Their clock keeps running and penalties carry. Staff do nothing.
   - **Never restart to give a second attempt.**
   - **Platform fault after handover or submit:** **Restart on a new lab.** It deals a different work order and fault with a fresh 150-minute clock (spec 13.19 item 1), because the student has already seen the old fault and its answers.
     - Use it only for a platform fault, with a fault code and evidence.
     - The new sitting's grade supersedes the old one; both attempts stay archived.
     - **Download the CSV first.** The CSV lists live submitted sittings, so the old grade leaves it once the student is restarted; it stays in the archive.
     - Expect mismatch flag (d) on that student until they submit again: the gradebook still holds the old entry.
     - The new clock is a full 150 minutes from the restart, not capped at 21:00. Restart early, or decide the end time with the student.
     - The new lab always has a different fault from the voided one. Penalties from the voided lab do not carry.
   - **Late arrival after 18:30:** new starts are closed. Only if staff decide to admit the student, Window control > Allowlist add (their uid) lets them start.
     - Their 150 minutes run from their own start, so they finish after 21:00.
     - Sweep again once their clock ends, then remove them from the allowlist.
5. **18:30** Last new start. Resumes still work.
6. **21:05** Results page, **Sweep expired sittings**. Every expired, unsubmitted sitting is graded as it stands. **21:15** Sweep again. The last 18:30 start expires at 21:00.
7. Window control: Disarm.
8. **Download CSV.** While BUG-272 is open the CSV is the grade of record, not the class gradebook copy.
   - Review every row with flags (mismatch flags a to d, provisioned, autoSubmitted, selfReset, adminReset).
   - A forged gradebook row is logged server-side before the results page rebuilds it.

## Disputes and marking

Run the answer sheet for one student, privately. The sheet is that student's key, so never paste it into a shared channel:

```
MDFINAL_SEED_SECRET=<the bound secret> node _tools/mdfinal/mdfinal-walkthrough.js --student <uid>
```

The bound secret is the `NETFINAL_SEED_SECRET` Functions secret (operator decision 12.2). An inline assignment lands in shell history, so run it with history off (a leading space where `HISTCONTROL=ignorespace`), or `read -s MDFINAL_SEED_SECRET; export MDFINAL_SEED_SECRET` first.

For a sitting restarted onto a new lab, add `--seed N`, with N the seed shown for that sitting. It prints the edition, channel and expected key, the storage resiliency, the fault and its ticket, and the accepted I1, I2 and I3 answers. The full per-check report is on the results page (select the student).

## What students are told (the in-page brief)

- 150 minutes. Hand over by minute 110. Restart before handover.
- Up to two self-restarts before handover; no extra time; penalties carry.
- The passwords: technician `Meridian-Tech-2026`, users `Meridian-User-2026`, domain join `Meridian-Join-2026`.
- The KMS client key table, the C:\LabFiles packages, the powercfg note for battery and sleep values.
