# Feature Documentation

Platform feature man pages. Each document describes a feature, its purpose, technical
architecture, and reasoning. Moved from `_app/docs/features/` on 2026-04-05 to prevent
internal architecture docs from being deployed to production via Firebase Hosting.

## Index

| Feature | Components | Description |
|---------|-----------|-------------|
| [Handler Comms](HANDLER_COMMS.md) | ActivityFeed, HandlerDirectives, DailyDirectives | Dashboard activity feed with smart nudges, intel reports, and daily missions |
| [User Profile Modal](USER_PROFILE_MODAL.md) | UserProfileModal, FirestoreLeaderboard | Click-to-view public profile dossier from leaderboard entries |
| [CTF Arena](CTF_ARENA.md) | BoxEngine, arena/index, ctf-leaderboard | Offensive security CTF boxes with flag capture, scoring, and Firestore stats sync |
| [XP Pipeline](XP_PIPELINE.md) | XPCalculator, FirestoreManager, Cloud Functions | Deterministic XP derivation, cross-device sync, dual-authority reconciliation |
| [Skulpt Integration](SKULPT_INTEGRATION.md) | TurtleCanvas, SkulptRunner, vendor/skulpt | Three-stage lazy Python interpreter for advanced turtle graphics (def, if, recursion) |
| [Class Progress Tracking](CLASS_PROGRESS_TRACKING.md) | handler-dashboard, ProgressManager, AssignmentManager | Post-mortem: three-layer fix for 100% completion bug (fuzzy matching, sync pollution) |
| [Mascot Animation System](MASCOT_ANIMATION_SYSTEM.md) | mascot/ components | Two-layer DOM architecture for continuous looping animations |
| [TripWire Defense](TRIPWIRE_DEFENSE.md) | TripWire.js, TripWireEffects.js | Anti-cheat honeypot: DevTools detection, localStorage tampering response |
| [Command Hijacking Labs](COMMAND_HIJACKING_LABS.md) | Dark Arts / Parrot Division | Linux command hijacking lab scoping document |
| [Desk Toys](DESK_TOYS.md) | DeskToys.js (planned) | Interactive Dispatch reward system (planning stage) |
| [XP Audit: EQ6 vs VORYX](XP_AUDIT_EQ6_vs_VORYX.md) | Firestore users collection | Real account comparison exposing XP calculation bugs |
| [Dark Arts Vault & Gates](DARK_ARTS_VAULT_GATES.md) | gate-cipher.js, AccessGuard.js, vault/index.html | 8-tier gated progression with cipher rotation, rank system, server-side validation |
| [Tenant System](TENANT_SYSTEM.md) | TenantRouter.js, TenantShell.js, TenantFilter.js, tenant-sw.js | White-label platform with 4-layer encapsulation, 9 dashboard variants, SW injection |
| [Tournament System](TOURNAMENT_SYSTEM.md) | tournament-board/lobby/podium.html, ctfSubmitFlag CF | Team-based CTF competitions with live scoreboard, dynamic scoring, flag salting |
| [Achievement System](ACHIEVEMENT_SYSTEM.md) | AchievementManager/System/Registry/Panel.js | ~2,000 achievements, auto-generation, title building, 6 notification styles |
| [Instructor Dashboard](INSTRUCTOR_DASHBOARD.md) | handler-dashboard.js, ClassManager.js, AssignmentManager.js | Class management, 12+ analytics charts, comms, exports, HEX-XXXX codes |
| [Arcade & Game Tracker](ARCADE_GAME_TRACKER.md) | GameTracker.js, GameScoreboard.js, ArcadeScoreModal.js | 75+ games, Score Reign XP, global leaderboards, 2-player support |
| [Operator Missions](OPERATOR_MISSIONS.md) | OperatorEngine.js, OperatorInterpreter.js, AgentBridge.js | 24 grid-based missions, fog-of-war, integrity meter, Python + terminal modes |
| [Arctic CLI Hub](ARCTIC_CLI_HUB.md) | ArcticEngine.js, ArcticData.js | 24 districts, 600+ modules, 3 factions, fog-of-war progression |
| [Signal Hub](SIGNAL_HUB.md) | SignalEngine.js, SignalData.js | 92 hardware projects, 6 platforms, 13 tracks, toolkit library |
| [Forensics Hub](FORENSICS_HUB.md) | ForensicsEngine.js, ForensicsData.js, cert-alignment.js | 60 modules, 6 tracks, 5 certification alignments, cross-house integration |
| [Sandbox Labs](SANDBOX_LABS.md) | lab-manager/server.js, docker-compose.yml, SandboxLauncher.js | Docker containers via Traefik + Cloudflare Tunnel, 4 images, idle management |
| [Multiplayer & Hive](MULTIPLAYER_HIVE.md) | MultiplayerManager.js, HiveManager.js, CoOpSync.js, VsBridge.js | 2-player arcade, ghost replay, Hive facility exploration, Red vs Blue CTF |
| [Digital Life](DIGITAL_LIFE.md) | digital-life/index.js + 30 modules | Binary firefly ecosystem, 8 phases, procedural audio, cosmic events, player tools |
