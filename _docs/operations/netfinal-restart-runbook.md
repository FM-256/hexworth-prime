# Network+ final: restarting a sitting

**TLDR.** Any signed-in user can restart their OWN Network+ Meridian final after submitting it,
as many times as they like (operator decision, 2026-10-19). Staff (admins, and instructors with the
`handler` claim) can also restart someone else's sitting, or a sitting still in progress. A restart
archives the attempt and never deletes it. The next start rebuilds the SAME lab with a full clock
and no answers.

## Restart your own sitting (anyone)

Submit the exam. On the **Submitted** panel, click **Restart exam** and confirm. The page reloads
into a fresh sitting. A student asking to restart an exam that is still open gets "Submit this
attempt before restarting it.": otherwise a restart would be a free clock reset on a lab whose
faults they have already found.

## What a student sees after submitting

The total, the phase totals and the practical/reasoning subtotals. NOT per-question marks: with
unlimited restarts on the same lab those were an answer oracle. Totals still change between
attempts, so repeated restarts can still be used to guess slowly. The full per-question report is
kept server-side, in the sitting and in each archived attempt.

## Restart a student's sitting, see results, mark Q45 (staff)

Use the results page: `/houses/web/network-plus/exams/network-final-results.html`, linked as
**Results** beside the exam in the instructor dashboard's assignment list (assign it first:
**Assign Content**, then **Exams**). It lists every member of the class with their status, score,
flags and earlier attempts. **Details** shows every question with the grader's note, the
collateral-damage findings, the archived attempts, and the three Q45 narratives with a 0-3 mark
each; **Save marks** re-totals the report and updates the gradebook. **Restart** archives the
student's sitting (staff may restart one in progress) and records the reason you give.

All three are staff-only on the server (admin, admin allowlist, or the `handler` claim). Owning a
class is not enough, because any signed-in user can create one.

The browser-console call still works if the page is unavailable:

```js
FirebaseAuth.callFunction('netfinalReset', {
  examId: 'net-final-2026', uid: '<the student uid>', reason: '<why>'
}).then(r => console.log(r.data || r));
```

## Where the grade goes, and which copy to trust

**The results page is the trusted record.** It reads each student's exam session on the server,
which no student can write.

At every submit (including the clock's auto-submit) and every Q45 marking, the server also copies
the LATEST submitted attempt into `classes/{c}/progress/{uid}.completions['web-netplus-meridian-final']`
for every class that lists the student, is run by staff (the class owner's own admin or `handler`
claim), and has the exam assigned. The entry holds `completed`, `score` (percent of 200, including
any Q45 points still to mark), `total`, `outOf`, `pendingInstructorMarks`, `flagged`, `completedAt`
and `duration`. That is what the instructor dashboard shows.

- **The dashboard copy is NOT authoritative until BUG-272 ships.** Today's Firestore rules let a
  student write their own progress row, so a student can put any number there. If the dashboard and
  the results page disagree, the results page is right.
- **Opening a class on the results page rebuilds its gradebook** from the sessions. That is how a
  class that assigned the exam AFTER students sat it, a student who joined later, or a write that
  failed, gets its entry. The Gradebook column says what happened for each student.
- **A class run by a non-staff user is never written.** Anyone can create a class and list a
  student in it, so membership alone is not trusted.
- **After a restart**, the gradebook keeps the last SUBMITTED attempt until the new one is
  submitted, while the results page shows the new sitting as in progress.
- **Before Q45 is marked**, the score counts the 9 instructor points as zero, so a flawless sitting
  shows 96%; marking updates it.
- **Tenant (white-label) classes are not recorded** by this path.
- **A student in more than 50 classes** may not be recorded into all of them at submit (the
  submit-time write reads at most 50). Opening the class on the results page records them; nothing
  is lost, and the Gradebook column shows it.
- A student who reopens a submitted exam sees their score panel again.

## Who can see what

Every results, marking and restart call is staff-only on the server: the admin claim, the admin
email allowlist, or the instructor `handler` claim. **`handler` is platform-wide** (operator
decision, 2026-10-19): an instructor can open any class's results by id, as they can restart any
student. The class list on the page shows only the classes they run, for convenience. Owning a class
is not enough to see results, because any signed-in user can create one.

## What happens on the server

| Step | Where |
|------|-------|
| Own sitting: anyone. Someone else's: staff | `functions/netfinal/netfinal-exam.js` `mayReset` |
| Staff test (admin claim, admin email allowlist, or `handler` claim) | `functions/netfinal/netfinal-exam.js` `isStaff` |
| Students only after submitting | `resetSession` `requireSubmitted`, set by `functions/index.js` for non-staff |
| Archive then remove, one transaction | `functions/index.js` `netfinalStore().archiveAndRemove` |
| Archived copy | Firestore `netfinal_sessions_archive/{uid}::{examId}__{ms}`, stamped `resetBy`, `resetAt`, `reason`, `originalId` |
| Log line | Cloud Functions log, `[netfinalReset] <caller> restarted <session> -> <archiveId>` |

The archive holds the full lab and answer key, and because a restart brings back the same lab, it
is the key to the student's current sitting. `firestore.rules` denies all client access to it.

## Known limits

- Unlimited restarts on the same lab mean a student can learn the twelve faults and retake. Every
  attempt is archived with its score and listed on the results page. The gradebook holds the
  latest SUBMITTED attempt, so a student who restarts and never re-sits keeps their last score
  there.
- No rate limit on restarts. Each one writes an archive document (about 73 KB).
- `handler` is platform-wide, so any instructor can restart any student. Every restart is recorded
  by `resetBy` and the archive.
- The staff email allowlist check does not require a verified email; the admin console's
  `requireAdmin` shares this. Unverified, pre-existing, worth checking in the Auth console.
- A student whose sitting is restarted while their page is open is told to reload.
- The instructor key (`_tools/netfinal/netfinal-walkthrough.js --student <uid>`) is unchanged by a
  restart, because the lab is the same.
