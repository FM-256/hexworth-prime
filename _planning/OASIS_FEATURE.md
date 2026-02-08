# OASIS: The Rings of Hexworth

> "First to the Key, First to the Egg!"
> — Ready Player One

---

## Overview

A competitive artifact system where finite, tangible digital treasures exist within Hexworth Prime. Each house possesses one legendary Ring — but ownership is not permanent. Only the highest scorer on each Ring's challenge holds it, until someone claims their throne.

---

## Core Concept

### The Rings (8 Total)

| Ring | House | Theme | Suggested Challenge Type |
|------|-------|-------|-------------------------|
| Ring of the Shield | Shield | Defense/Security | Threat identification, CIA triad mastery |
| Ring of the Web | Web | Networking | Subnetting speed challenge, OSI mastery |
| Ring of the Forge | Forge | Hardware/Systems | Troubleshooting gauntlet, hardware ID |
| Ring of the Script | Script | Automation | Scripting challenge, Linux command mastery |
| Ring of the Cloud | Cloud | Infrastructure | Architecture puzzle, service identification |
| Ring of the Code | Code | DevOps | CI/CD pipeline challenge, Git mastery |
| Ring of the Key | Key | Cryptography | Cipher breaking, encryption challenge |
| Ring of the Eye | Eye | Monitoring | Log analysis, pattern detection |

### The One Ring? (Future consideration)
- A 9th ring that requires holding ALL 8 house rings simultaneously?
- Or a separate ultimate artifact unlocked by different means?

---

## Mechanics

### 1. Discovery Phase (The Key)
- Each Ring is guarded by a **house-specific puzzle**
- Solving the puzzle **unlocks access** to the Ring's challenge
- Puzzle can be hidden within house content (Easter egg style)
- Finding the puzzle location is part of the hunt

### 2. Challenge Phase (The Gate)
- Once unlocked, user can attempt the Ring's challenge
- Challenge is **skill-based with a score ceiling**
- Factors: accuracy, speed, completeness
- Score is recorded with timestamp

### 3. Ownership Phase (The Egg)
- **Highest scorer holds the Ring**
- Ring appears in their profile with visual flair
- Ring holder gets special privileges:
  - Unique badge/icon next to name
  - Appears in Hall of Ring Bearers
  - Special visual effects on dashboard?
  - Bonus XP multiplier while holding?

### 4. Transfer Phase (The Hunt Continues)
- Anyone can attempt the challenge anytime
- Beat the current holder's score → **Ring transfers**
- Global announcement broadcasts the transfer
- Previous holder notified they've been dethroned

---

## The Feed System

### Current State
- Basic activity feed exists (needs verification)
- Limited to personal progress

### Required Expansion
- **Global announcements** for Ring transfers
- **Near-miss notifications** ("X came within 50 points of claiming the Shield Ring!")
- **Attempt tracking** ("The Forge Ring is under siege - 5 attempts in the last hour")
- **Holder spotlights** ("Current Ring Bearer for 30 days: @username")
- **Historical log** ("The Web Ring has changed hands 12 times")

### Feed Event Types
```javascript
{
  type: 'ring_claimed',
  ring: 'shield',
  newHolder: { uid, displayName, house },
  previousHolder: { uid, displayName, house },
  score: 9850,
  previousScore: 9720,
  timestamp: Date
}

{
  type: 'ring_attempt',
  ring: 'forge',
  challenger: { uid, displayName },
  score: 8500,
  currentHighScore: 9200,
  gap: 700,
  timestamp: Date
}

{
  type: 'ring_defense',
  ring: 'web',
  holder: { uid, displayName },
  challenger: { uid, displayName },
  margin: 50,  // How close they came
  timestamp: Date
}
```

---

## Data Model

### Firestore Structure

```
/rings/{ringId}
  - id: 'shield'
  - name: 'Ring of the Shield'
  - house: 'shield'
  - currentHolder: {
      uid: string,
      displayName: string,
      house: string,
      score: number,
      claimedAt: timestamp
    }
  - challengeId: 'shield-ring-challenge'
  - puzzleId: 'shield-ring-puzzle'
  - totalAttempts: number
  - transferCount: number
  - createdAt: timestamp

/rings/{ringId}/history
  - Array of previous holders with scores and durations

/rings/{ringId}/attempts
  - Recent attempts for "under siege" tracking

/feed/global
  - Ring transfer announcements
  - Milestone notifications

/users/{uid}/rings
  - Currently held rings
  - Ring attempt history
  - Best scores per ring
```

### localStorage Sync
```javascript
{
  ringsHeld: ['shield', 'web'],
  ringAttempts: {
    'forge': { bestScore: 8500, attempts: 3, lastAttempt: timestamp }
  },
  ringNotifications: true
}
```

---

## UI Components Needed

### 1. Ring Gallery / Hall of Bearers
- Visual display of all 8 rings
- Current holder for each
- "Attempt Challenge" button
- Holder duration / defense streak

### 2. Ring Detail Modal
- Ring lore/description
- Current holder profile
- Score to beat
- Attempt history
- Leaderboard (top 10 all-time?)

### 3. Ring Badge (Profile/Dashboard)
- Visual indicator when user holds ring(s)
- Animated/glowing effect
- Count of rings held

### 4. Feed Widget
- Real-time updates
- Filter by ring or global
- Notification preferences

### 5. Challenge Interface
- Puzzle phase (unlock)
- Challenge phase (compete)
- Results with comparison to current holder

---

## Gamification Integration

### XP Rewards
| Action | XP |
|--------|-----|
| Unlock Ring puzzle | 200 |
| First Ring attempt | 100 |
| Claim a Ring | 500 |
| Defend Ring (per defense) | 100 |
| Hold Ring for 7 days | 250 |
| Hold Ring for 30 days | 1000 |

### Achievements (add to AchievementSystem.js)
```javascript
// Ring achievements to add
ring_seeker: "Discover your first Ring puzzle"
ring_challenger: "Attempt your first Ring challenge"
ring_bearer: "Claim your first Ring"
ring_defender: "Successfully defend a Ring"
ring_collector: "Hold 3 Rings simultaneously"
lord_of_rings: "Hold all 8 Rings simultaneously"
ring_dynasty: "Hold a single Ring for 30 days"
ring_thief: "Claim a Ring from another house"
fellowship: "Attempt all 8 Ring challenges"
```

---

## Technical Considerations

### Real-time Updates
- Firestore onSnapshot listeners for ring ownership
- Cloud Functions for transfer notifications?
- Optimistic UI updates with rollback

### Race Conditions
- What if two users submit winning scores simultaneously?
- Solution: Firestore transactions with server timestamp
- First valid write wins

### Score Validation
- Client-side scoring can be cheated
- Consider: Server-side validation for Ring challenges
- Or: Anomaly detection (impossible scores flagged)

### Offline Handling
- Ring challenges require online (score submission)
- Cache current holder data for display
- Queue attempts for submission when online?

---

## Rollout Strategy

### Phase 1: Foundation
- [ ] Ring data model in Firestore
- [ ] RingManager.js component
- [ ] Basic Ring gallery UI
- [ ] Single Ring challenge (pilot)

### Phase 2: Competition
- [ ] Score tracking and comparison
- [ ] Ownership transfer logic
- [ ] Feed announcements (basic)
- [ ] Ring holder badges

### Phase 3: Full Launch
- [ ] All 8 Ring challenges
- [ ] Expanded feed system
- [ ] Achievements integration
- [ ] Leaderboards

### Phase 4: Polish
- [ ] Visual effects and animations
- [ ] Sound effects for transfers
- [ ] Push notifications
- [ ] Seasonal events / Ring resets?

---

## Open Questions

1. **Should Rings reset seasonally?** (Semester-based? Annual?)
2. **Can the same person hold multiple Rings?** (Probably yes - "Lord of Rings" achievement)
3. **Are Ring challenges repeatable infinitely?** (Cooldown? Daily limit?)
4. **Should there be a "qualifying score" to even attempt?** (Prevent spam)
5. **Do Ring holders get special powers?** (Bonus XP, exclusive content access?)
6. **Is there a "One Ring" ultimate artifact?**
7. **Should transfers cost something?** (Entry fee in XP?)

---

## Inspiration Sources

- **Ready Player One** - Keys, Gates, Easter Egg hunt
- **Lord of the Rings** - Finite artifacts of power
- **CTF Competitions** - Score-based challenges
- **Battle Royale** - One winner, competitive tension
- **MMO World Bosses** - Community-wide events

---

## Notes

*This feature transforms Hexworth from a learning platform into a competitive arena. The Rings create persistent goals beyond just "complete modules" — they create rivalries, stories, and community.*

*The Feed expansion is critical. Without public announcements, Ring transfers are just database updates. WITH them, they become events.*

---

**Status:** Planning
**Priority:** Feature Sprint (TBD)
**Dependencies:** Feed system expansion, Challenge framework
**Created:** 2026-02-07
