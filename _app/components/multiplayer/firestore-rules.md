# Firestore Rules for Multiplayer Game Rooms

## Collection: `gameRooms`

Stores live multiplayer sessions. Each document represents one game room.

### Document Structure

```
gameRooms/{roomId}
├── code: string              // 6-char room code (e.g., "A3X9K2")
├── gameId: string            // Game identifier (e.g., "threatswarm")
├── status: string            // "waiting" | "ready" | "playing" | "finished"
├── mode: string              // "realtime" | "turnBased" | "ghost"
├── players: array            // Max 2 entries
│   ├── [0]
│   │   ├── uid: string
│   │   ├── displayName: string
│   │   ├── ready: boolean
│   │   └── lastHeartbeat: number
│   └── [1]                   // Same structure
├── gameState: map
│   ├── player1: map|null     // Player 1's latest state
│   ├── player2: map|null     // Player 2's latest state
│   └── shared: map|null      // Shared state (turn-based, etc.)
├── createdAt: timestamp
├── createdBy: string         // UID of room creator
└── updatedAt: number         // Client-side timestamp
```

### Rules

Add these rules inside `firestore.rules` under the `match /databases/{database}/documents` block:

```javascript
// ── Game Rooms ─────────────────────────────────────────────────────
match /gameRooms/{roomId} {
    // Anyone authenticated can read rooms (needed for joinRoom lookup by code)
    allow read: if request.auth != null;

    // Authenticated users can create rooms
    allow create: if request.auth != null
        && request.resource.data.createdBy == request.auth.uid
        && request.resource.data.players.size() == 1
        && request.resource.data.players[0].uid == request.auth.uid
        && request.resource.data.status == 'waiting'
        && request.resource.data.code.size() == 6;

    // Players in the room can update it
    allow update: if request.auth != null
        && (
            // Player is in the current room
            resource.data.players[0].uid == request.auth.uid
            || (resource.data.players.size() > 1
                && resource.data.players[1].uid == request.auth.uid)
            // Or joining as player 2 (their UID will be in the new data)
            || (resource.data.players.size() == 1
                && request.resource.data.players.size() == 2
                && request.resource.data.players[1].uid == request.auth.uid)
        );

    // Room creator or last remaining player can delete
    allow delete: if request.auth != null
        && (
            resource.data.createdBy == request.auth.uid
            || resource.data.players.size() == 1
                && resource.data.players[0].uid == request.auth.uid
        );
}
```

## Collection: `gameGhosts`

Stores recorded ghost sessions for asynchronous multiplayer.

### Document Structure

```
gameGhosts/{ghostId}
├── gameId: string            // Game identifier
├── playerUid: string         // Who recorded it
├── playerName: string        // Display name at time of recording
├── frames: array             // Recorded frames
│   └── [n]
│       ├── t: number         // Timestamp offset (ms from start)
│       └── d: map            // Frame data (game-specific)
├── frameCount: number        // Total frames
├── duration: number          // Total duration in ms
├── summary: map              // Final stats
│   ├── finalScore: number
│   └── result: string
└── createdAt: number         // Client-side timestamp
```

### Rules

```javascript
// ── Game Ghosts ────────────────────────────────────────────────────
match /gameGhosts/{ghostId} {
    // Anyone authenticated can read ghosts (to race against them)
    allow read: if request.auth != null;

    // Authenticated users can create their own ghosts
    allow create: if request.auth != null
        && request.resource.data.playerUid == request.auth.uid;

    // Only the creator can update or delete their ghosts
    allow update, delete: if request.auth != null
        && resource.data.playerUid == request.auth.uid;
}
```

## Auto-Cleanup

Stale rooms (older than 1 hour) are cleaned up client-side by
`MultiplayerManager.cleanupStaleRooms()`, called automatically when
creating a new room. For production scale, consider a Cloud Function
scheduled to run every 30 minutes:

```javascript
// functions/cleanup-rooms.js (example)
exports.cleanupStaleRooms = functions.pubsub.schedule('every 30 minutes').onRun(async () => {
    const cutoff = new Date(Date.now() - 60 * 60 * 1000);
    const snap = await admin.firestore()
        .collection('gameRooms')
        .where('createdAt', '<', cutoff)
        .limit(100)
        .get();

    const batch = admin.firestore().batch();
    snap.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    console.log(`Cleaned up ${snap.size} stale rooms`);
});
```

## Index Requirements

The following composite indexes are needed:

1. **gameRooms** - `code` ASC, `status` ASC (for joinRoom lookup)
2. **gameGhosts** - `gameId` ASC, `summary.finalScore` DESC (for leaderboard)
3. **gameGhosts** - `gameId` ASC, `playerUid` ASC, `createdAt` DESC (for my ghosts)
