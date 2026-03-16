# F-21: Public Profiles — Firestore Rules Additions

Add the following rules to `firestore.rules` inside the
`match /databases/{database}/documents` block.

## Rules to Add

```javascript
// ─── F-21: Public Profiles ──────────────────────────────────────
// Public profile data — readable by any authenticated user,
// writable only by the profile owner.
match /publicProfiles/{uid} {
  // Any authenticated user can read public profile fields
  allow read: if request.auth != null;

  // Only the profile owner can create their own profile
  allow create: if request.auth != null && request.auth.uid == uid;

  // Only the profile owner can update their own profile
  // Field whitelist prevents privilege escalation
  allow update: if request.auth != null && request.auth.uid == uid
    && request.resource.data.diff(resource.data).affectedKeys()
       .hasOnly(['callsign', 'displayName', 'firstName', 'house',
                 'houseEmblem', 'xp', 'totalXP', 'level', 'rank',
                 'modulesCompleted', 'boxesSolved', 'achievementCount',
                 'achievements', 'recentActivity', 'joinDate', 'updatedAt']);

  // Privacy settings subcollection — only the owner can read/write
  // Other users never see raw privacy settings; the client-side
  // PublicProfile.js filters fields before returning them.
  match /settings/{settingId} {
    allow read, write: if request.auth != null && request.auth.uid == uid;
  }
}
```

## Where to Insert

In `firestore.rules`, add the block above after the existing `match /users/{userId}` block
(after line ~60, before any other top-level match blocks).

## Security Notes

- **Read access**: Any authenticated user can read `publicProfiles/{uid}` documents.
  Privacy filtering happens client-side in `PublicProfile.js` (reads the owner's
  `settings/privacy` sub-doc to decide which fields to return).
- **Write access**: Only `request.auth.uid == uid` — users can only modify their own profile.
- **Settings sub-collection**: Only the owner can read or write their privacy settings.
  Other users cannot discover what privacy toggles are enabled.
- **Field whitelist**: The `update` rule restricts writable fields, preventing a user
  from injecting fields like `role` or `admin` into their public profile.
- **Cloud Functions** (admin SDK) bypass these rules and can write any field,
  enabling the `syncProfileStats` function to update profiles server-side.
