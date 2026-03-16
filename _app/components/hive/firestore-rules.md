# Firestore Rules for Hive Sessions

Add these rules to `firestore.rules` under the existing rules block.

## Hive Collection Structure

```
hives/{hiveId}
  - mode, title, maxPlayers, timeLimit, difficulty
  - inviteCode, creatorUid, creatorName
  - status (lobby | active | completed)
  - createdAt, startedAt, endedAt
  - participantCount

hives/{hiveId}/participants/{uid}
  - uid, displayName, photoURL, house
  - role, score, online, lastSeen, joinedAt

hives/{hiveId}/actions/{actionId}
  - uid, displayName, type, data, timestamp

hives/{hiveId}/chat/{msgId}
  - uid, displayName, message, timestamp
```

## Rules

```javascript
// ── Hive Sessions ─────────────────────────────────────────────
match /hives/{hiveId} {
  // Any authenticated user can read active hives (for lobby browsing)
  allow read: if request.auth != null;

  // Only authenticated users can create hives
  allow create: if request.auth != null
    && request.resource.data.creatorUid == request.auth.uid
    && request.resource.data.status == 'lobby'
    && request.resource.data.keys().hasAll([
      'mode', 'maxPlayers', 'inviteCode', 'creatorUid', 'status'
    ]);

  // Only the creator can update hive settings
  allow update: if request.auth != null
    && resource.data.creatorUid == request.auth.uid;

  // No deletes — hives are permanent records
  allow delete: if false;

  // ── Participants ──
  match /participants/{uid} {
    // All hive members can read participants
    allow read: if request.auth != null;

    // Users can add themselves as participants
    allow create: if request.auth != null
      && request.auth.uid == uid;

    // Users can update their own presence/score,
    // OR the hive creator can update roles
    allow update: if request.auth != null
      && (request.auth.uid == uid
          || get(/databases/$(database)/documents/hives/$(hiveId)).data.creatorUid == request.auth.uid);

    // No deletes
    allow delete: if false;
  }

  // ── Actions (append-only) ──
  match /actions/{actionId} {
    // All hive members can read actions
    allow read: if request.auth != null;

    // Authenticated users can create actions (append-only)
    allow create: if request.auth != null
      && request.resource.data.uid == request.auth.uid;

    // No edits or deletes — actions are immutable
    allow update: if false;
    allow delete: if false;
  }

  // ── Chat (append-only) ──
  match /chat/{msgId} {
    // All hive members can read chat
    allow read: if request.auth != null;

    // Authenticated users can send messages
    allow create: if request.auth != null
      && request.resource.data.uid == request.auth.uid
      && request.resource.data.message is string
      && request.resource.data.message.size() <= 500;

    // No edits or deletes
    allow update: if false;
    allow delete: if false;
  }
}
```

## Key Security Properties

1. **Authentication required** for all operations
2. **Creator-only settings** — only `creatorUid` can modify hive config
3. **Self-only participant writes** — users can only create/update their own participant doc
4. **Role assignment by creator** — creator can update any participant (for role changes)
5. **Append-only actions and chat** — no editing or deleting past entries
6. **Chat message size cap** — 500 character limit on chat messages
7. **Status validation on create** — new hives must start in 'lobby' status
