# Network+ final: restarting a sitting

**TLDR.** The Network+ Meridian final allows one attempt. Staff (admins and instructors with the
`handler` claim) can restart a sitting. A restart archives the attempt and never deletes it. The
student's next start rebuilds the SAME lab with a full clock and no answers.

## Restart your own sitting (staff)

Open the exam. On the **Submitted** panel, click **Restart this sitting (staff)** and confirm. The
page reloads into a fresh sitting. Students never see this control, and the server refuses them if
they call it anyway.

## Restart a student's sitting

No page for this exists yet (follow-up task). Until then, call the callable as a signed-in staff
user from the browser console on any hexworth.com page:

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
| Staff check (admin claim, admin email allowlist, or `handler` claim) | `functions/netfinal/netfinal-exam.js` `isStaff` |
| Archive then remove, one transaction | `functions/index.js` `netfinalStore().archiveAndRemove` |
| Archived copy | Firestore `netfinal_sessions_archive/{uid}::{examId}__{ms}`, stamped `resetBy`, `resetAt`, `reason`, `originalId` |
| Log line | Cloud Functions log, `[netfinalReset] <staff> restarted <session> -> <archiveId>` |

The archive holds the full lab and answer key, and because a restart brings back the same lab, it
is the key to the student's current sitting. `firestore.rules` denies all client access to it.

## Known limits

- `handler` is platform-wide, so any instructor can restart any student. Every restart is recorded
  by `resetBy` and the archive.
- A student whose sitting is restarted while their page is open is told to reload.
- The instructor key (`_tools/netfinal/netfinal-walkthrough.js --student <uid>`) is unchanged by a
  restart, because the lab is the same.
