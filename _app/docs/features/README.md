# Feature Documentation

Platform feature man pages. Each document describes a feature, its purpose, technical architecture, and reasoning.

## Index

| Feature | Components | Description |
|---------|-----------|-------------|
| [Handler Comms](HANDLER_COMMS.md) | ActivityFeed, HandlerDirectives, DailyDirectives | Dashboard activity feed with smart nudges, intel reports, and daily missions |
| [User Profile Modal](USER_PROFILE_MODAL.md) | UserProfileModal, FirestoreLeaderboard | Click-to-view public profile dossier from leaderboard entries |
| [CTF Arena](CTF_ARENA.md) | BoxEngine, arena/index, ctf-leaderboard | Offensive security CTF boxes with flag capture, scoring, and Firestore stats sync |
| [XP Pipeline](XP_PIPELINE.md) | XPCalculator, FirestoreManager, Cloud Functions | Deterministic XP derivation, cross-device sync, dual-authority reconciliation |
