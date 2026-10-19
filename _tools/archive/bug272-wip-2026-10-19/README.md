# BUG-272 work-in-progress, held out of the 2026-10-19 Network+ hosting deploy

## Why this is here

`_app/components/AssignmentManager.js` was dirty with BUG-272's CLIENT fix: it stops writing
`classes/{classId}/progress/{uid}.completions` directly and calls the `submitClassProgress`
callable instead.

**That callable is not deployed.** `exports.submitClassProgress` exists only in the uncommitted
`functions/index.js`; the committed copy has zero occurrences, so production has no such function.

Firebase Hosting publishes `_app` FROM DISK, and `components/` is not in firebase.json's ignore
list. So a hosting deploy of the Network+ exam would have shipped a client calling a function that
does not exist, and **every class-progress completion write on the platform would have failed** with
not-found. That is far outside the exam's blast radius and nothing in the deploy chain would have
caught it: the Chris gate reads commits, and the smoke and Nexus gates do not know that this client
depends on an undeployed callable.

Found by checking what was dirty UNDER `_app` before deploying, after Chris flagged the unrelated
dirty `functions/index.js` and `firestore.rules` as a risk for a bare `firebase deploy`. The hosting
path is narrower than that and still not narrow enough.

## What is archived

| File | What |
|---|---|
| `AssignmentManager.js.working` | the exact dirty working copy, byte-for-byte |
| `AssignmentManager.js.diff` | its diff against the commit it was based on |

The same content is also in a git stash entry created at the same moment, named in the stash
message. Two copies on purpose: a stash is easy to lose track of across sessions.

## How to put it back

    git stash list | grep BUG-272-wip
    git stash pop <that ref>

or, if the stash is gone:

    cp _tools/archive/bug272-wip-2026-10-19/AssignmentManager.js.working \
       _app/components/AssignmentManager.js

## The ordering constraint this records

BUG-272 cannot ship client-first. The callable and the Firestore rules must deploy BEFORE, or with,
the client that depends on them. Shipping the client alone breaks every completion write; shipping
the rules alone blocks the old client's writes. See BUG-272 in `_docs/operations/BUG_TRACKER.md`.
