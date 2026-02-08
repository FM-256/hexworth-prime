# HD-2: Student Join Flow — Implementation Log

**Sprint:** HD-2
**Status:** Complete
**Date:** February 5, 2026
**Architect:** CCode-Opus

---

## Change Register

| ID | Change | Files | Date | Rationale |
|----|--------|-------|------|-----------|
| HD2-001 | Firestore rules: student join/leave + members subcollection | firestore.rules | Feb 5, 2026 | Field-level security: students can only modify memberUids (add/remove own UID), handlers have full access. Members subcollection allows self-service profile writes. |
| HD2-002 | ClassManager: 5 new methods (joinClass, leaveClass, getStudentClasses, getClassMembers, removeStudentFromClass) | ClassManager.js | Feb 5, 2026 | Core student-class relationship logic. Uses arrayUnion/arrayRemove for atomic array operations, increment for denormalized count. |
| HD2-003 | Student dashboard: Join Class modal | dashboard.html | Feb 5, 2026 | Footer link + modal with HEX-XXXX input, auto-formatting, validation, success/error messaging. |
| HD2-004 | Student dashboard: My Classes section | dashboard.html | Feb 5, 2026 | Card grid showing enrolled classes with instructor name, code badge, view assignments, and leave button. Only visible when user has classes. |
| HD2-005 | Handler roster: real student profiles | handler-dashboard.html | Feb 5, 2026 | Roster cards with avatar (photoURL or initials), name, house badge, join date, remove button. Updates enrolled stat in real-time. |
| HD2-006 | CSV export (Blackboard-compatible) | handler-dashboard.html | Feb 5, 2026 | Export Roster CSV: Last Name, First Name, Student ID, Email, House, Joined. Export Assignments CSV: Title, Type, House, Difficulty, Due Date, Notes. RFC 4180 escaping. |
| HD2-007 | Centralized user profile system | dashboard.html, ClassManager.js | Feb 5, 2026 | Profile section in Settings modal (First Name, Last Name, Student ID). Stored in `users/{uid}` via FirestoreManager.setUserProfile(). Pre-fills from Google displayName. |
| HD2-008 | Profile gate on join flow | dashboard.html | Feb 5, 2026 | Students must complete profile (firstName + lastName required) before joining any class. Opens Settings modal if incomplete. |

---

## Design Decisions

### AD-007: Member Profile Subcollection
**Decision:** Store student profiles in `classes/{classId}/members/{uid}`.

**Why:**
- Class document stays small (just UIDs array for queries)
- Roster queries are efficient (read subcollection, not N user docs)
- Allows class-specific data (joinDate, house snapshot at join time)
- Follows the same subcollection pattern as `assignments/`
- Students write their own profile (no Cloud Functions needed)

**Schema:**
```javascript
// classes/{classId}/members/{uid}
{
    uid: "firebase-uid",
    firstName: "Jane",           // From centralized user profile
    lastName: "Doe",             // From centralized user profile
    displayName: "Jane Doe",     // Composed from first+last, fallback to Google
    studentId: "STU-12345",      // From centralized user profile (optional)
    email: "student@example.com",
    photoURL: "https://...",
    house: "shield",             // Snapshot at join time
    callsign: "@hacker",        // From user profile if exists
    joinedAt: serverTimestamp()
}
```

### AD-009: Centralized User Profile (`users/{uid}`)
**Decision:** Store institutional identity (firstName, lastName, studentId) in a centralized `users/{uid}` document, not per-class.

**Why:**
- Students enter their name once, not per-class
- Source of truth for exports (Blackboard CSV needs real names)
- Profile data is snapshotted into `classes/{classId}/members/{uid}` at join time
- Pre-fills from Google Auth displayName (split into first/last)
- Student ID field supports institutional requirements (Blackboard gradebook import)

**Schema:**
```javascript
// users/{uid}
{
    firstName: "Jane",
    lastName: "Doe",
    studentId: "STU-12345",
    // ... other fields (house, callsign, etc.)
}
```

### AD-008: Student Join via Firestore Rules (No Cloud Functions)
**Decision:** Allow authenticated students to update class docs with field-level security rules.

**Why:**
- No Cloud Functions infrastructure needed (keep it static)
- Rules validate: only own UID added, class not at capacity, not already a member
- Student writes own member profile doc (uid == memberId)
- Handler can delete any member profile (for remove student feature)

**Rule Logic:**
1. **Join:** `affectedKeys` must be exactly `['memberUids', 'memberCount', 'updatedAt']`, new array has all old UIDs plus exactly one new one (the requesting user), user wasn't already in array, class below maxMembers
2. **Leave:** Same affected keys, old array has all new UIDs plus one removed (the requesting user), user was in old array
3. **Members subcollection:** `create/update` if `auth.uid == memberId`, `delete` if `auth.uid == memberId` OR user is the class handler

---

## Firestore Schema Changes

### Class Document (updated fields)
```javascript
// classes/{classId}
{
    // ... existing fields ...
    memberUids: ["uid1", "uid2", ...],  // Array for queries + rules
    memberCount: 2,                      // Denormalized count
    maxMembers: 50,                      // Capacity limit
}
```

### Members Subcollection (new)
```
classes/{classId}/members/{uid}
```

Used for:
- Handler roster display (names, avatars, houses)
- Student self-service profile management
- Future: per-student progress tracking (HD-3)

---

## Troubleshooting Guide

### "Permission denied on join"
- Check rules are deployed (`firebase deploy --only firestore:rules`)
- Verify `memberUids.size() < maxMembers`
- Verify user not already in `memberUids`
- Verify `affectedKeys` matches exactly `['memberUids', 'memberCount', 'updatedAt']`

### "Student doesn't appear in roster"
- Check member profile doc exists in `classes/{classId}/members/{uid}`
- Member profile write might have failed even if arrayUnion succeeded
- Check browser console for Firestore errors

### "Member count mismatch"
- `memberCount` is denormalized (increment/decrement alongside arrayUnion/arrayRemove)
- If arrayUnion succeeds but increment fails, count drifts
- Roster `loadRoster()` updates the stat with actual member count from subcollection

### "Duplicate join attempt"
- Rules prevent: `!(request.auth.uid in resource.data.memberUids)`
- Client-side check: `memberUids.includes(user.uid)` before Firestore call
- Error message: "You are already enrolled in this class."

### "Class not found with valid code"
- Code lookup is case-insensitive (`.toUpperCase().trim()`)
- Class might be soft-deleted (`isActive: false`)
- Error message: "Class not found. Check the code and try again."

---

## CSV Export (Blackboard-Compatible)

### Roster Export Columns
```
Last Name, First Name, Student ID, Email, House, Joined
```
Matches Blackboard gradebook import format. Uses RFC 4180 CSV escaping (quotes fields containing commas, quotes, or newlines).

### Assignments Export Columns
```
Title, Type, House, Difficulty, Due Date, Notes
```

### Export Functions
- `exportRosterCSV()` — reads `ClassManager.getClassMembers()`, builds CSV with "Last, First" column order
- `exportAssignmentsCSV()` — reads `AssignmentManager.getAssignments()`, builds CSV
- `downloadCSV(filename, content)` — Blob + temporary download link
- `csvEscape(val)` — RFC 4180: wraps in quotes if value contains comma, quote, or newline

---

## User Profile System

### Source of Truth
`users/{uid}` document in Firestore (via `FirestoreManager.setUserProfile()` with `merge: true`).

### Settings Modal Integration
Profile section appears as first section in Settings modal (before Appearance) for authenticated users.
Fields: First Name, Last Name, Student ID (optional).
Pre-fills from Google Auth `displayName` on first load (splits "Jane Doe" into firstName="Jane", lastName="Doe").

### Profile Gate
`submitJoinClass()` checks profile completeness before allowing join:
- Both `firstName` and `lastName` must be non-empty
- If incomplete, shows error message and opens Settings modal
- Prevents joining without institutional identity

### Data Flow
1. Student fills profile in Settings → saved to `users/{uid}`
2. Student joins class → `ClassManager.joinClass()` reads `users/{uid}`, copies firstName/lastName/studentId into `classes/{classId}/members/{uid}`
3. Handler views roster → reads member subcollection, displays "Last, First" format
4. Handler exports CSV → reads member subcollection, outputs Blackboard-compatible columns

---

## Known Limitations

1. **No real-time listener** — Handler must refresh to see new joins (no onSnapshot). Can be added in future sprint.
2. **memberCount is denormalized** — Could drift if arrayUnion succeeds but increment fails. Roster display uses actual subcollection count as source of truth.
3. **House info is snapshot at join time** — Doesn't update if student changes house later. Acceptable for class context.
4. **View Assignments is basic** — Currently shows alert with list. Will be replaced with proper UI in HD-3.
5. **No batch member operations** — Handler removes students one at a time. Bulk remove can be added if needed.
6. **Profile snapshot at join time** — firstName/lastName/studentId are copied when student joins. If student updates profile later, existing member profiles don't auto-update. Acceptable for class context; handler can remove and re-add if needed.
7. **Export requires members in class** — CSV export buttons show but produce empty file if no members/assignments. Could add disabled state.

---

*Last Updated: February 5, 2026*
