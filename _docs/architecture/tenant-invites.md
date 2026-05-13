# Tenant Invites Architecture

**Last Updated:** 2026-05-13
**Status:** v1 in progress — design ratified, implementation pending
**Origin:** Closes the post-backfill gap from the Wendy-Norfleet onboarding incident (2026-05-13). Backfill addressed existing users; this slice handles users who haven't created an account yet.

---

## Problem

After the 67-user `users/{uid}` backfill, the only remaining instructor-onboarding gap is the pre-registration case: operator wants to add an instructor by email, but that email doesn't yet have a Firebase Auth account. Today's UI returns "No user found" — operator has to wait for the instructor to sign in first, then re-search.

## Data Model

`tenant_invites/{tokenId}`:

| Field | Type | Purpose |
|---|---|---|
| `tenantId` | string | Target tenant |
| `email` | string (lowercased) | Intended recipient |
| `role` | `'instructor'` \| `'student'` | v1 = instructor only |
| `createdBy` | uid | Admin who created the invite |
| `createdAt` | Timestamp | |
| `expiresAt` | Timestamp | 7-day default, 30-day max |
| `status` | `'pending' \| 'redeemed' \| 'expired' \| 'revoked'` | Lifecycle |
| `redeemedAt` | Timestamp \| null | |
| `redeemedByUid` | string \| null | |
| `revokedAt` | Timestamp \| null | Set by `adminRevokeInvite` |
| `revokedBy` | uid \| null | |

`tokenId` = `crypto.randomUUID()` with dashes stripped. The tokenId is the bearer credential.

## Cloud Function surface

| CF | Auth | Purpose |
|---|---|---|
| `adminCreateInvite` | `requireAdmin` | Generate token, write doc, return URL |
| `adminListInvites` | `requireAdmin` | List by tenant/status |
| `adminRevokeInvite` | `requireAdmin` | Mark `revoked` (idempotent) |
| `redeemInvite` | any authed user | Token + email match → `arrayUnion` UID into `tenants/{id}.adminUids`, mark `redeemed` (atomic via `db.runTransaction`) |

## Ratified design decisions

| # | Decision | Rationale |
|---|---|---|
| **A** | Auto-detect single email field in admin UI: existing user → direct-add; unknown → invite | One operator action; complexity stays in backend at `_addInstructorDirect` line 6449 |
| **C** | Token-in-URL → `accept-invite.html` → sign-in (if needed) → Accept button → CF call | Standard SaaS redemption pattern. Wrong-account error MUST render a sign-out-and-retry CTA |
| **D** | Instructor role only; `student` returns `unimplemented` | Students already self-enroll via class-join links — that gap is closed |
| **E** | No email send v1 — operator copies the URL | Ships immediately; V2 adds SendGrid via Firebase Extensions when budget allows |
| **F** | 7-day default TTL, 30-day max, single-use, lazy expiry (no cron) | Status flips on redemption attempt; no scheduled job to maintain |
| **G** | `tenant_invites/{id}` collection: client-no-read, client-no-write (admin SDK only) | Tokens never exposed to browser SDK |
| **H1** | Reject duplicate **pending** invite for same `(tenantId, email)` — expired/redeemed do NOT block | Composite query before write; "Active invite exists; revoke first" |
| **H2** | Allow inviting an existing tenant admin with soft warning | `arrayUnion` is idempotent; return `warning` field, don't block create |

## Pinned for later review

**B. Email-binding strictness.** v1 hard-binds `auth.token.email === invite.email` (case-insensitive). Pinned at design time as the highest-risk UX decision. Tracked as sprint **F-67** (deferred). Trigger to revisit: 3+ support tickets on "wrong account" rejection OR operator feedback that re-invite friction is excessive. Options at revisit: (1) keep hard bind; (2) soft bind (warn + audit-log); (3) magic-link redemption that sidesteps the question.

## Security notes

- **`tokenId` is a bearer credential.** Anyone holding it can attempt redemption (but cannot succeed without an email-matched authed session).
- **`adminListInvites` response includes `tokenId`.** This is acceptable v1 because the endpoint is admin-only. NEVER render the list response in any non-admin context (instructor-facing "your pending invite" pages, etc).
- **`redeemInvite` permission-denied error does NOT echo the expected email.** Quoting back the invite email to an unauthenticated attacker who possesses the URL would confirm the target. Error text: `"This invite is for a different email address. Sign out and try a different Google account."`
- **`redeemInvite` is a Firestore transaction.** Read invite → validate → write tenant `adminUids` arrayUnion + write invite status atomically. Prevents double-redeem race.
- **`INVITE_BASE_URL` env var.** Falls back to `https://hexworth.com`. MUST be set in `functions/.env.staging` (or per-channel config) when running against a preview channel — otherwise generated URLs point at production from a non-production redemption flow.

## Known limitations (v1)

- No email delivery (operator copies URL).
- No bulk invite (one email at a time).
- No invite for student role.
- No rate limiting on `adminCreateInvite` (acceptable while admin set is tiny + audit-logged).
- No cron sweep for expired invites — they accumulate until manually revoked or refreshed.

---

## File map

| Path | Purpose |
|---|---|
| `functions/index.js` (lines ~4372–4593) | 4 CFs |
| `_app/accept-invite.html` | Redemption page |
| `firestore.rules` (new `match /tenant_invites/{id}`) | Client lock |
| `_app/admin/console.html` (`_addInstructorDirect` line 6449) | Auto-detect branch |

## Related

- Sprint **F-67** — revisit decision B
- `_docs/operations/wendy-norfleet-2026-05-13.md` — incident that triggered this slice (if/when written)
- `functions/onboarding-state.js` — diagnostic CLI complement
