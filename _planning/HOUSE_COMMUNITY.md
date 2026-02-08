# House Community Features - Planning Document

**Created:** December 18, 2025
**Status:** Planning / Partial Implementation

---

## Overview

This document captures ideas for making the House system feel more alive through community features, leaderboards, and competitions. Since Hexworth Prime is a static web application (no backend), different approaches have varying implementation complexity.

---

## Implementation Status

| Feature | Status | Priority |
|---------|--------|----------|
| Simulated House Members | **IMPLEMENTED** | High |
| Classroom Mode | Planned | High |
| Share Codes / Badges | Planned | Medium |
| GitHub-Powered Leaderboard | Planned | Low |
| Discord Integration | Planned | Low |
| Inter-House Competitions | Planned | Medium |

---

## 1. Simulated House Members (IMPLEMENTED)

**Purpose:** Create the illusion of an active house community without requiring a backend.

**How it works:**
- Procedurally generate "phantom members" using:
  - Name pool with house-themed adjectives/prefixes
  - Randomized but deterministic stats (seeded by date + house)
  - Simulated activity feed with timestamps
- Activity types:
  - Module completions
  - Achievement unlocks
  - Streak milestones
  - Quiz completions
  - Login activity

**Technical Details:**
- Component: `_app/components/HouseMembers.js`
- Uses seeded random (date-based) for consistent daily generation
- 8-12 members per house
- Activity feed shows 5-10 recent "events"
- Names feel realistic but are clearly usernames (not real names)

**Future Enhancements:**
- [ ] Different personality "types" for members
- [ ] Members can "evolve" over time based on date
- [ ] Seasonal/event-based special members
- [ ] House mascot character

---

## 2. Classroom Mode (Future)

**Purpose:** Enable real multiplayer for professor's classes.

**Architecture:**
```
┌─────────────────┐     ┌─────────────────┐
│  Hexworth Prime │────▶│  Firebase/      │
│  (Static App)   │◀────│  Supabase       │
└─────────────────┘     └─────────────────┘
         │                      │
         ▼                      ▼
┌─────────────────┐     ┌─────────────────┐
│  Class Code     │     │  Leaderboard    │
│  Entry UI       │     │  Data Storage   │
└─────────────────┘     └─────────────────┘
```

**Flow:**
1. Instructor creates class in admin panel (separate page)
2. Instructor receives class code (e.g., `CYB101-F25-7K9M`)
3. Students enter code in Settings → Join Class
4. App stores class ID in localStorage
5. Progress syncs to backend on key events
6. Leaderboard fetches class data on dashboard load

**Data Model:**
```javascript
{
  classId: "CYB101-F25-7K9M",
  className: "CYB-101 Fall 2025",
  instructor: "Professor X",
  members: [
    {
      displayName: "Student A",
      house: "shield",
      xp: 847,
      modulesCompleted: 12,
      achievements: ["sorted", "streak_7", "first_module"],
      lastActive: "2025-12-18T10:30:00Z"
    }
  ]
}
```

**Backend Options:**
- Firebase Realtime Database (free tier: 1GB storage, 10GB/month transfer)
- Supabase (free tier: 500MB database, 2GB storage)
- Google Sheets API (hacky but free)

**Privacy Considerations:**
- Display names only (no real names/emails required)
- Opt-in leaderboard visibility
- Instructor can see all, students see anonymized

---

## 3. Share Codes / House Cards (Future)

**Purpose:** Let users share their progress without a backend.

**How it works:**
- Generate a shareable "House Card" with encoded stats
- Can be shared as:
  - Text code (e.g., `HXW-F7K9-2M4P-SHIELD-L12`)
  - Generated PNG image
  - URL with encoded parameters

**Card Contents:**
```
┌────────────────────────────────────────┐
│  🛡️ HOUSE SHIELD                       │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  DataSmith_Prime                       │
│  ─────────────────────────────────────  │
│  ⭐ Level 12  │  🔥 14-Day Streak      │
│  🏆 8/12 Achievements                  │
│  📚 23 Modules Completed               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Share: HXW-F7K9-2M4P                  │
└────────────────────────────────────────┘
```

**Encoding:**
- Base64 encode JSON stats
- Add checksum for validation
- Keep code short (< 20 chars)

**View Mode:**
- Viewer can paste code or visit URL
- Read-only display of stats
- No data modification possible

---

## 4. GitHub-Powered Leaderboard (Future)

**Purpose:** Transparent, version-controlled leaderboard for tech-savvy users.

**How it works:**
1. User clicks "Submit to Leaderboard" in Settings
2. Opens pre-filled GitHub Issue or Discussion
3. Issue contains their stats in structured format
4. GitHub Action runs weekly to compile `leaderboard.json`
5. App fetches and displays leaderboard

**Pros:**
- Completely free
- Transparent and auditable
- No backend required

**Cons:**
- Requires GitHub account
- Manual submission process
- Weekly update delay

---

## 5. Discord Integration (Future)

**Purpose:** Real community interaction outside the app.

**Features:**
- Each house has a Discord channel
- Bot tracks `/progress` slash commands
- Real-time leaderboards in Discord
- Event announcements and competitions

**Requirements:**
- Discord server setup
- Bot development (discord.js)
- Webhook integration from app

---

## 6. Inter-House Competitions (Future)

**Purpose:** Gamification through house rivalry.

**Competition Types:**

### Weekly Challenges
- "Complete 3 Shield modules this week"
- "Earn the Night Owl achievement"
- "Achieve a 5-day streak"
- Tracked locally, results aggregated (if backend available)

### House Points
- Aggregate progress across all house members
- Points for: modules, achievements, streaks, rare events
- Weekly/monthly resets

### Seasonal Events
- "Winter Security Sprint" (December)
- "Spring Cleaning" (Code refactoring challenges)
- "Summer School" (Catch-up opportunities)
- Special badges for participation

### House Wars
- Time-limited competitions (1 week)
- Specific objectives announced at start
- Winning house gets special badge/recognition
- Could be simulated or real (with backend)

---

## Technical Architecture Notes

### For Simulated Features (No Backend)
- All data generated client-side
- Seeded random for consistency
- localStorage for user's own data
- "Fake" members never stored

### For Real Multiplayer (With Backend)
- Firebase recommended (easiest setup)
- Auth: Anonymous or email (no social login needed)
- Security rules: Users can only write own data
- Read permissions: Class members only

### Hybrid Approach
- Simulated members always present
- Real members overlay when class joined
- Graceful degradation if backend unavailable

---

## Implementation Priority

### Phase 1 (Current) - Simulated Members
- [x] HouseMembers.js component
- [x] Name generation system
- [x] Activity feed generation
- [x] Dashboard integration

### Phase 2 (Future) - Share Codes
- [ ] Stats encoder/decoder
- [ ] House Card generator
- [ ] View-only mode page

### Phase 3 (Future) - Classroom Mode
- [ ] Firebase setup guide
- [ ] Class join UI
- [ ] Progress sync
- [ ] Real leaderboard

### Phase 4 (Future) - Competitions
- [ ] Weekly challenge system
- [ ] House points tracking
- [ ] Seasonal event framework

---

## Notes for Implementation

- Keep simulated members always available (even with backend)
- Real member data should feel like an "upgrade" not replacement
- Privacy first: never require real names
- Graceful failures: if backend down, fall back to simulated

---

## Data Persistence Across Updates

### How User Data Works

All user data is stored in **localStorage**, which is tied to the browser's **origin** (protocol + domain + port).

| Scenario | Data Persists? | Notes |
|----------|----------------|-------|
| Replace files in same folder | ✅ Yes | Same origin |
| Extract to new folder (file://) | ⚠️ Usually | Browser-dependent |
| Different local server ports | ❌ No | Different origins |
| Different browsers | ❌ No | Separate storage |

### Data Protection Features (IMPLEMENTED)

1. **Manual Export/Import** (`Settings` modal)
   - Export: Downloads `hexworth-backup-{date}.json`
   - Import: Restores from backup file
   - User-initiated, full control

2. **Auto-Backup Before Update** (`UpdateManager.createAutoBackup()`)
   - Automatically saves all user data to localStorage before download
   - Key: `hexworth_auto_backup`
   - Includes timestamp, version, and all user data
   - Expires after 7 days

3. **Restore Prompt on New Version** (`checkForBackupRestore()`)
   - On dashboard load, checks for auto-backup
   - Shows banner: "Previous Progress Found"
   - Options: "Restore Progress" or "Keep Current"
   - Smart detection: won't overwrite if user already has data

### Data Keys Backed Up

All keys matching these prefixes:
- `hexworth_*` - Core app data (house, progress, settings)
- `dark_arts_*` - Dark Arts CTF progress
- `gate*` - Five Gates CTF progress

### Best Practices for Users

1. **Before updating**: Click "Export My Data" in the update modal
2. **After updating**: If prompted, click "Restore Progress"
3. **Manual backup**: Settings → Export Progress (recommended monthly)

### Technical Notes

- Auto-backup uses localStorage (not files) so it persists across same-origin pages
- `file://` protocol localStorage behavior varies by browser:
  - Chrome: Shared across all local files
  - Firefox: Per-directory isolation
  - Safari: Shared but may be cleared
- For maximum safety, users should always use manual export before major updates

---

*Last Updated: December 18, 2025*
