# Classroom & Instructor Dashboard - Planning Document

**Date Created:** February 3, 2026
**Status:** Planning Phase
**Priority:** High - Enables real classroom deployment

---

## Overview

Transform Hexworth Prime from a self-paced learning tool into a full classroom management system with:
- **Instructor Dashboard** - Track progress, assign content, view analytics, export reports
- **Student Classroom View** - Gamified leaderboards, personal progress, class standing
- **Dual Storage** - Firebase for production, localStorage export for offline/demo use

---

## User Roles

| Role | Capabilities |
|------|--------------|
| **Instructor** | Create classes, add students, assign modules, view all progress, analytics, export data |
| **Student** | Join class via code, complete assigned work, see personal progress, view leaderboard |
| **Admin** | (Future) Manage multiple instructors, institution-wide analytics |

---

## Data Model

### Class Structure

```javascript
{
  classId: "CYB101-Fall2026",
  className: "Intro to Cybersecurity",
  instructor: {
    id: "instructor_uid",
    name: "Professor Smith",
    email: "smith@university.edu"
  },
  joinCode: "CYBER26",  // 6-char code students use to join
  created: "2026-08-15T00:00:00Z",
  settings: {
    showLeaderboard: true,
    anonymizeLeaderboard: false,  // Show names vs "Student #3"
    allowRetakes: true,
    showAnswersAfterSubmit: false
  },
  assignments: [
    {
      id: "assign_001",
      title: "Week 1: CLI Fundamentals",
      modules: ["CLH-001", "CLH-002", "CLH-003"],
      dueDate: "2026-08-22T23:59:59Z",
      points: 100
    }
  ],
  students: ["student_uid_1", "student_uid_2", ...]
}
```

### Student Progress Record

```javascript
{
  oduleId: "CLH-001",
  started: "2026-08-16T14:30:00Z",
  completed: "2026-08-16T15:45:00Z",
  timeSpent: 4500,  // seconds
  attempts: 1,
  score: 95,        // quiz/insight score if applicable
  objectives: {
    completed: 5,
    total: 5
  }
}
```

### Leaderboard Entry

```javascript
{
  rank: 1,
  studentId: "student_uid",
  displayName: "Alice",  // or "Student #1" if anonymized
  house: "shield",
  points: 2450,
  modulesCompleted: 12,
  achievements: 8,
  streak: 5  // consecutive days active
}
```

---

## Instructor Dashboard Features

### 1. Class Management

| Feature | Description |
|---------|-------------|
| **Create Class** | Name, section, semester, generate join code |
| **Roster View** | List all students, last active, progress % |
| **Add/Remove Students** | Manual add by email or bulk CSV import |
| **Regenerate Join Code** | If code is compromised |
| **Archive Class** | End of semester - preserve data, hide from active view |

### 2. Assignment System

| Feature | Description |
|---------|-------------|
| **Create Assignment** | Select modules, set due date, point value |
| **Assignment Templates** | Pre-built assignments (e.g., "CLH Week 1-3") |
| **Bulk Assign** | Assign to multiple classes at once |
| **Due Date Reminders** | Auto-notify students approaching deadline |
| **Late Submissions** | Track and optionally penalize late work |

### 3. Progress Tracking

| View | Data Shown |
|------|------------|
| **Class Overview** | Completion %, average score, time spent distribution |
| **Module Heatmap** | Which modules have high/low completion rates |
| **Student Detail** | Individual student's full activity log |
| **At-Risk Students** | Students falling behind (configurable thresholds) |
| **Comparison View** | Compare sections/semesters |

### 4. Analytics & Reports

| Report | Contents |
|--------|----------|
| **Progress Report** | Per-student completion status for assignments |
| **Grade Export** | CSV with scores compatible with LMS import |
| **Time Analysis** | Where students spend time, struggle points |
| **Achievement Report** | Badges earned, gamification engagement |
| **Engagement Metrics** | Login frequency, session duration, activity patterns |

### 5. Class Settings

| Setting | Options |
|---------|---------|
| **Leaderboard Visibility** | On/Off, Anonymized, Top N only |
| **Quiz Retakes** | Allow/Deny, Max attempts |
| **Answer Visibility** | Show correct answers after submit or never |
| **Progress Visibility** | Students see own % vs class average |
| **House Sorting** | Required, Optional, or Disabled for class |

---

## Student Classroom View Features

### 1. My Classes

- List of enrolled classes
- Join new class with code
- See assignments and due dates per class

### 2. Personal Dashboard

| Widget | Shows |
|--------|-------|
| **Progress Ring** | Overall completion % |
| **Current Assignment** | What's due next, % complete |
| **Recent Activity** | Last 5 completed modules |
| **Achievement Showcase** | Featured badges |
| **Streak Counter** | Days in a row active |

### 3. Leaderboard (Gamified)

| Element | Description |
|---------|-------------|
| **Class Ranking** | Position in class (1st, 2nd, etc.) |
| **Points Display** | Total points earned |
| **Podium View** | Top 3 with avatars/house colors |
| **Movement Indicators** | ↑↓ showing rank changes |
| **Achievement Badges** | Show recent unlocks |
| **House Distribution** | Pie chart of class house breakdown |

### 4. Competition Elements

| Feature | Description |
|---------|-------------|
| **Weekly Challenges** | Bonus points for specific goals |
| **House Wars** | Aggregate points by house within class |
| **Speed Runs** | Fastest module completion times |
| **Perfect Scores** | Recognition for 100% quiz scores |
| **Streak Rewards** | Bonus points for consecutive days |

---

## Storage Strategy

### Option A: Firebase (Production)

```
Firebase Structure:
├── /users/{uid}
│   ├── profile (name, email, role, house)
│   └── progress/{moduleId} (completion data)
├── /classes/{classId}
│   ├── meta (name, instructor, settings)
│   ├── students/{uid} (enrollment status)
│   └── assignments/{assignId}
├── /leaderboards/{classId}
│   └── entries/{uid} (cached rankings)
└── /analytics/{classId}
    └── aggregates (precomputed stats)
```

**Authentication:**
- Firebase Auth (email/password, Google, Microsoft)
- Role-based access (instructor vs student)
- Class-level permissions

**Real-time Updates:**
- Leaderboard updates live
- Progress syncs across devices
- Instructor sees completions in real-time

### Option B: LocalStorage Export (Offline/Demo)

```javascript
// Student exports their progress
const exportData = {
  studentId: "self-generated-uuid",
  displayName: "Alice",
  house: "shield",
  exportDate: "2026-02-03T12:00:00Z",
  progress: [
    { moduleId: "CLH-001", completed: true, score: 95 },
    { moduleId: "CLH-002", completed: true, score: 88 },
    ...
  ],
  achievements: ["cli_recruit", "speed_demon", ...],
  signature: "hash-for-integrity"  // Prevent tampering
}
```

**Instructor Workflow (Offline):**
1. Share class join code (just for identification)
2. Students complete work locally
3. Students export JSON file
4. Students submit JSON via email/LMS/upload
5. Instructor imports all JSONs
6. Dashboard aggregates data locally

**Integrity Checks:**
- Hash of progress data to detect tampering
- Timestamp validation
- Optional: Instructor-generated challenge code embedded in export

---

## UI Mockups (Conceptual)

### Instructor Dashboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  HEXWORTH PRIME - Instructor Dashboard                      │
│  Prof. Smith | CYB101-Fall2026                    [Logout]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ Classes │ │ Assign  │ │ Reports │ │ Settings│           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│                                                             │
│  ┌─────────────────────┐  ┌─────────────────────────────┐  │
│  │ CLASS PROGRESS      │  │ AT-RISK STUDENTS            │  │
│  │ ████████░░ 78%      │  │ • Bob - 2 weeks inactive    │  │
│  │ 24/31 students      │  │ • Carol - 45% behind class  │  │
│  │ active this week    │  │ • Dave - 0 assignments done │  │
│  └─────────────────────┘  └─────────────────────────────┘  │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ ROSTER                                    [+ Add] [CSV]│ │
│  ├───────────────────────────────────────────────────────┤ │
│  │ Name        House    Progress   Last Active   Actions │ │
│  │ Alice       Shield   95%        2 hrs ago     [View]  │ │
│  │ Bob         Web      45%        14 days ago   [View]  │ │
│  │ Carol       Script   62%        3 days ago    [View]  │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Student Leaderboard Layout

```
┌─────────────────────────────────────────────────────────────┐
│  CYB101 LEADERBOARD                          Week 3         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│           🥇              🥈              🥉                │
│          ALICE           BOB            CAROL               │
│         2,450 pts      2,380 pts      2,210 pts             │
│         Shield          Web           Script                │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  YOUR POSITION: #7 of 31  |  1,850 pts  |  ↑2 this week    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   4. Dave      Forge    2,100 pts   ↓1                     │
│   5. Eve       Cloud    2,050 pts   ↑3                     │
│   6. Frank     Key      1,920 pts   -                      │
│  ► 7. YOU      Shield   1,850 pts   ↑2  ← You are here    │
│   8. Grace     Eye      1,780 pts   ↓2                     │
│   9. Henry     Web      1,650 pts   ↑1                     │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐│
│  │ HOUSE WARS: Shield 🛡️ leads with 12,450 total points! ││
│  └────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: Core Infrastructure
- [ ] Firebase project setup (if not exists)
- [ ] Authentication system (instructor/student roles)
- [ ] Data models and Firestore rules
- [ ] Basic class CRUD operations

### Phase 2: Instructor Dashboard MVP
- [ ] Create/manage classes
- [ ] View student roster
- [ ] Basic progress tracking
- [ ] Simple assignment creation

### Phase 3: Student Experience
- [ ] Join class flow
- [ ] Personal progress dashboard
- [ ] Assignment view with due dates
- [ ] Basic leaderboard

### Phase 4: Analytics & Gamification
- [ ] Class-wide analytics
- [ ] At-risk student detection
- [ ] Full leaderboard with rankings
- [ ] House Wars feature
- [ ] Achievement integration

### Phase 5: Export & Offline
- [ ] Student progress export (JSON)
- [ ] Instructor bulk import
- [ ] Integrity verification
- [ ] LMS-compatible grade export (CSV)

### Phase 6: Polish
- [ ] Real-time updates
- [ ] Mobile responsive design
- [ ] Notification system
- [ ] Instructor onboarding tutorial

---

## Technical Considerations

### Firebase Setup

```javascript
// Required Firebase services
- Authentication (Email, Google, Microsoft)
- Firestore (database)
- Cloud Functions (optional - for aggregations)
- Hosting (already using for Hexworth)
```

### Security Rules

```javascript
// Firestore rules (conceptual)
match /classes/{classId} {
  // Only instructor can write class settings
  allow write: if request.auth.uid == resource.data.instructor.id;

  // Students can read if enrolled
  allow read: if request.auth.uid in resource.data.students;
}

match /users/{userId}/progress/{moduleId} {
  // Users can only write their own progress
  allow write: if request.auth.uid == userId;

  // Instructors can read student progress if student is in their class
  allow read: if isInstructorOfStudent(userId);
}
```

### Performance

- Leaderboard: Cached and updated on write (not computed on read)
- Analytics: Pre-aggregated nightly or on-demand
- Progress sync: Debounced writes to reduce Firestore costs

---

## Integration Points

| System | Integration |
|--------|-------------|
| **AchievementManager** | Awards feed into points, show on leaderboard |
| **CLH Modules** | Completion triggers progress update |
| **House System** | House affiliation shown, House Wars feature |
| **Digital Life** | (Future) Class-wide ecosystem? |

---

## Open Questions

1. **Pricing Model** - Firebase has costs at scale. Free tier sufficient for small classes?
2. **Privacy** - FERPA compliance? Student data handling?
3. **LMS Integration** - Direct LTI integration with Canvas/Blackboard/Moodle?
4. **Multi-Instructor** - Can TAs have limited access?
5. **Cross-Semester** - Can students keep progress when moving to new class?

---

## File Locations (Planned)

```
_app/
├── instructor/
│   ├── dashboard.html
│   ├── class-manager.html
│   ├── student-detail.html
│   ├── analytics.html
│   └── settings.html
├── classroom/
│   ├── join.html
│   ├── my-classes.html
│   ├── leaderboard.html
│   └── assignments.html
├── components/
│   ├── ClassroomManager.js
│   ├── LeaderboardWidget.js
│   ├── ProgressSync.js
│   └── ExportImport.js
└── config/
    └── firebase-config.js
```

---

## Related Documents

- `IDEAS_BACKLOG.md` - Career Cards (could integrate with classroom)
- `ACHIEVEMENT_GAPS.md` - Achievements feed into leaderboard
- `SECRET_FEATURES.md` - God Mode shouldn't affect leaderboard

---

*Last Updated: February 3, 2026*
