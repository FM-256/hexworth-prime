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

## Restart a student's sitting (staff)

No page for this exists yet (taskboard 443). Until then, call the callable as a signed-in staff
user from the browser console on any hexworth.com page. Staff may restart an exam still in progress,
which is how a broken sitting is rescued:

```js
FirebaseAuth.callFunction('netfinalReset', {
  examId: 'net-final-2026',
  uid: '<the student uid>',
  reason: '<why: e.g. proctoring incident, browser crash>'
}).then(r => console.log(r.data || r));
```

The reply names the archive document and the previous score. A `not-found` means the student has
no sitting to restart.

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
  attempt is archived with its score, so the number of attempts is visible to staff, but no page
  shows it yet: the live `netfinal_sessions` record only holds the CURRENT attempt, so a student who
  restarts and never re-sits looks like they never attempted. Read the archive.
- No rate limit on restarts. Each one writes an archive document (about 73 KB).
- `handler` is platform-wide, so any instructor can restart any student. Every restart is recorded
  by `resetBy` and the archive.
- The staff email allowlist check does not require a verified email; the admin console's
  `requireAdmin` shares this. Unverified, pre-existing, worth checking in the Auth console.
- A student whose sitting is restarted while their page is open is told to reload.
- The instructor key (`_tools/netfinal/netfinal-walkthrough.js --student <uid>`) is unchanged by a
  restart, because the lab is the same.
