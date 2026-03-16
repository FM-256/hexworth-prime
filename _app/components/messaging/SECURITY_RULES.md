# F-23A: Firestore Security Rules — Messaging Additions

Add the following rules inside the `match /databases/{database}/documents` block in `firestore.rules`.

---

```javascript
// ─── F-23: Messaging System ──────────────────────────────────────

// Messages — read by participants or class handler; write only via Cloud Functions
match /messages/{messageId} {
  allow read: if request.auth != null && (
    // Participant can read their own messages
    resource.data.from == request.auth.uid ||
    resource.data.to == request.auth.uid ||
    // Handler can read messages in their class
    isHandlerForClass(resource.data.classId)
  );

  // Direct writes blocked — all creates go through sendMessage CF
  allow create: if false;

  // Only recipient can mark as read
  allow update: if request.auth != null &&
    resource.data.to == request.auth.uid &&
    request.resource.data.diff(resource.data).affectedKeys().hasOnly(['read']) &&
    request.resource.data.read == true;

  // Soft-delete only by handler
  allow update: if request.auth != null &&
    isHandlerForClass(resource.data.classId) &&
    request.resource.data.diff(resource.data).affectedKeys().hasOnly(['deleted']) &&
    request.resource.data.deleted == true;

  allow delete: if false; // Hard deletes only via purge CF
}

// Conversations — read by participants or class handler
match /conversations/{conversationId} {
  allow read: if request.auth != null && (
    request.auth.uid in resource.data.participants ||
    isHandlerForClass(resource.data.classId)
  );

  // Writes only via Cloud Functions
  allow write: if false;
}

// Messaging blocks — handler managed
match /messaging_blocks/{blockId} {
  allow read: if request.auth != null && (
    resource.data.blockedUid == request.auth.uid ||
    isHandlerForClass(resource.data.classId)
  );

  // Write only via Cloud Functions
  allow write: if false;
}

// Helper function — check if current user is a handler for the given class
function isHandlerForClass(classId) {
  return request.auth != null &&
    exists(/databases/$(database)/documents/classes/$(classId)) &&
    get(/databases/$(database)/documents/classes/$(classId)).data.handlerId == request.auth.uid;
}
```

---

## Notes

- All message creation goes through the `sendMessage` Cloud Function, which enforces rate limits and class membership validation.
- The `markAsRead` update is the only direct client write allowed on messages.
- Handler soft-delete is allowed directly for responsiveness, but could also go through a CF.
- The `isHandlerForClass` helper requires a Firestore read on each check. Consider caching handler status in custom claims if this becomes a performance issue.
- The `reportMessage` operation goes through a Cloud Function to prevent users from tampering with the `reportedBy` array.
