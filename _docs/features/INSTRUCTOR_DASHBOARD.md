# Instructor Dashboard (Handler Dashboard)

**Status:** SHIPPED
**Components:** `handler-dashboard.html` (496 lines), `handler-dashboard.js` (5,925 lines), `handler-charts.js` (83 lines), `ClassManager.js` (728 lines), `AssignmentManager.js` (416 lines), `EngagementMetrics.js`, `AttendanceTracker.js`, `PulseSurvey.js`
**Location:** `_app/handler-dashboard.html`, `_app/js/handler-dashboard.js`, `_app/components/analytics/`
**Added:** v4.0.0, analytics expanded in v6.0.0
**Last reviewed:** 2026-04-05

## Purpose

The Instructor Dashboard is the handler-facing management interface. Instructors create
classes with unique HEX-XXXX codes, assign learning paths and modules, monitor student
progress in real-time, send targeted messages, and analyze performance through 12+
analytics visualizations. It's the B2B value proposition — what institutions pay for.

Access requires a handler activation code validated via Cloud Function.

## Architecture

3-column responsive layout with tab-based content and drill-down navigation:

```
+--LEFT (300px)--+-----CENTER (main)------+--RIGHT (280px)--+
| My Classes     | Tab Bar:               | Class Code      |
|   Class 1 (12) |  Overview | Assignments| HEX-7K9M [copy] |
|   Class 2 (8)  |  Roster | Analytics    |                 |
|   + New Class  |  AI Lab               | Export Roster    |
|                | ────────────────────── | Export Grades    |
|                | [Active Tab Content]   | Export Progress  |
|                |                        | Class Report     |
|                |                        | Edit Class       |
|                |                        | Delete Class     |
+----------------+------------------------+-----------------+
```

Mobile (< 768px): Collapses to single column with dropdown class selector.

## Tabs

| Tab | Purpose | Lazy-loaded |
|-----|---------|-------------|
| **Overview** | Activity feed (20 recent), handler comms, early warnings (<40% students) | No |
| **Assignments** | Content browser, bulk assign, grade breakdown, assignment health | No |
| **Roster** | Student cards (paginated 15/page) with completion rings, drill-down | No |
| **Analytics** | 12+ Chart.js visualizations, performance heatmap, time-on-task | Yes |
| **AI Lab** | Engagement metrics, attendance heatmaps, pulse surveys | Yes |

## Class Management

### Create Class
1. Modal: name (60 chars max), description (200 chars max)
2. Generates unique HEX-XXXX code (collision-checked, ambiguous chars removed)
3. Character set: `234679ACDEFGHJKMNPQRTUVWXYZ` (no 0/O, 1/I/l, 5/S, 8/B)
4. Creates `classes/{autoId}` in Firestore with handler UID
5. Success screen with copy-to-clipboard button

### Class Lifecycle
- **Edit:** Update name/description via right panel
- **Delete:** Soft-delete with confirmation dialog, removes from sidebar

## Assignment Workflow

### Content Browser
Instructors assign content through a filterable browser:

- **Filters:** House, content type, difficulty, search
- **Sources:** LearningPaths.PATHS (full paths) + individual modules from ContentRegistry
- **Bulk assign:** Checkbox selection, single due date + notes (500 chars max)
- **Types:** `path` (entire learning path) or `item` (single module)

### Progress Resolution
The critical challenge: assignments reference path-level IDs (e.g., `aplus-core2`) but
student completions track module-level IDs (e.g., `forge-core2-ch14-index`).

**Solution:** Path assignments are expanded into constituent modules via
`LearningPaths.PATHS[pathId].modules`. Each module completion is fuzzy-matched
using `shareCommonCore()` (2 consecutive hyphenated segments must match).

## Analytics (12+ Visualizations)

### Group 1: Class Health (Donuts)
- **Student Status** — On Track (>=70%), In Progress (40-69%), At Risk (<40%), No Activity
- **Assignment Completion** — High/Moderate/Low buckets
- **Score Distribution** — Grade buckets (A/B/C/D/F) with class average

### Group 2: Performance Deep Dive
- **Lowest Quiz Scores** — Ranked list for intervention targeting
- **Performance Heatmap** — Student x Assignment matrix, color-coded by score

### Group 3: Trends & Tracking
- **Completion Trend** — Cumulative line chart over time
- **Time on Task** — Three views: table (MIN/AVG/MAX), scatter (duration vs score), histogram
- **Grade Breakdown** — Per-assignment bar charts with HIGH/AVG/LOW

All analytics lazy-render on first tab activation to avoid loading Chart.js (CDN 4.4.1)
until needed. Chart instances are destroyed before re-rendering to prevent memory leaks.

## Handler Communications (F-27)

Instructors send messages to entire classes or individual students:

- **Compose:** Recipient dropdown (class or individual), textarea (500 chars max)
- **Send:** Creates `handler_messages/{id}` via Cloud Function `sendHandlerMessage`
- **History:** 10 most recent sent messages with read receipts (`readBy[]`)
- **Delete:** Soft-delete from Firestore

## Early Warning System

Automatic flags for students with <40% completion:
- Expandable alert cards in Overview tab
- Shows student name, current %, at-risk indicator
- Dismissible per session (not persisted)

## Drill-Down Navigation

Clicking stat cards or student names opens drill-down views:

- `drillDownEnrolled()` — View all students ranked by enrollment
- `drillDownCompletion()` — Student x Assignment completion matrix
- `drillDownStudent(uid)` — Individual student detail (progress, house, completion %)

Uses a view stack with HTML snapshot save/restore. Breadcrumb trail shows navigation path.
`goBack()` restores previous level.

## Stat Cards (4 KPIs)

| Card | Metric | Clickable |
|------|--------|-----------|
| Enrolled | Student count | Drill to student list |
| Avg Completion | Class-wide % | Drill to completion details |
| Total Completions | Sum of all completions | Drill to completion matrix |
| At Risk (<40%) | Count of struggling students | Drill to at-risk list |

Each card includes an SVG progress ring showing metric relative to max value.

## Analytics Add-ons

### EngagementMetrics.js
Composite engagement scoring (0-100) from:
- Login frequency (25%): low=1/week, mid=3, high=5
- Session duration (25%): low=5min, mid=15, high=30
- Active ratio (20%): low=0.3, mid=0.5, high=0.7
- Completion rate (30%)

### AttendanceTracker.js
- Daily login recording to `analytics/{uid}/attendance`
- Heatmap output: 7 days x 24 hours grid with login counts
- Streak tracking and absence alerts (configurable threshold)

### PulseSurvey.js
- Quick 1-5 question surveys (multiple choice or 1-5 scale)
- Pre-built templates: satisfaction, difficulty, pace, weekly
- Stored in `surveys/{surveyId}/responses/{uid}`

## Export Capabilities

| Export | Format | Content |
|--------|--------|---------|
| Roster | CSV | Names, emails, houses, join dates |
| Assignments | CSV | Titles, types, due dates, notes |
| Grades | CSV | Student x Assignment score matrix |
| Progress Summary | CSV | Per-student completion %, flags |
| Completion Evidence | CSV | Detailed records (timestamp, score, duration) |
| Class Report | Print/PDF | Formatted printable report |
| Compare Classes | Modal | Side-by-side cohort comparison |

## Firestore Data Model

```
classes/{classId}
  |-- name, description, classCode (HEX-XXXX)
  |-- handlerUid, memberCount, createdAt
  |-- members/{uid} (enrolled students)
  |-- assignments/{assignmentId}
  |     |-- assignmentType ('path'|'item'), contentId, title
  |     |-- dueDate, notes, isActive, handlerUid
  |-- progress/{uid}
        |-- completions: { [contentId]: { completed, completedAt, score, duration } }

handler_messages/{msgId}
  |-- senderUid, classId, recipientUid (optional)
  |-- recipientType ('class'|'student'), text (500 chars)
  |-- readBy[], createdAt

analytics/{uid}/sessions — login/logout, active time
analytics/{uid}/attendance — daily rollup (day, hour, count)
surveys/{surveyId} — questions, isActive
surveys/{surveyId}/responses/{uid} — answers
```

## Storage

| Key | Storage | Purpose |
|-----|---------|---------|
| `hd-theme` | localStorage | Light/dark theme toggle |

No other persistent client state — all data is Firestore-backed.

## Key Decisions

- **Handler activation gate** — Non-handler users see an activation screen, not an error.
  This prevents accidental access while providing a clear path to becoming a handler.
  Code is validated server-side via Cloud Function.

- **Lazy-rendered analytics** — Chart.js + 12 visualizations would slow initial page load.
  Analytics and AI Lab tabs only render on first click.

- **HEX-XXXX class codes** — Ambiguous characters removed (no 0/O, 1/I/l, 5/S, 8/B).
  4-character codes give 456,976 combinations. Collision-checked with max 10 attempts.

- **Path expansion for progress** — Instead of forcing students to complete content in
  assignment order, the system fuzzy-matches module-level completions against path-level
  assignments. Students can complete content in any order and still get credit.

- **View stack navigation** — Drill-down views save HTML snapshots. This avoids
  re-rendering expensive views when navigating back, at the cost of memory for the
  saved DOM strings.

- **Separate from tenant instructor** — The Handler Dashboard (`handler-dashboard.html`)
  uses global `classes/` collection. The Tenant Instructor (`tenant/instructor.html`)
  uses `tenants/{slug}/classes/`. They serve different audiences: handlers manage
  Hexworth Prime classes directly, tenant instructors manage through the white-label layer.

## Known Limitations

- **No real-time class updates** — Class list and progress data are fetched on load and
  on class selection. There is no Firestore `onSnapshot` subscription for live updates.
  Instructor must refresh or re-select to see new student completions.

- **Fuzzy module matching** — `shareCommonCore()` matches 2 hyphenated segments. This
  can false-positive on similarly named modules across houses (e.g., two "ch14" modules
  in different courses). In practice this rarely occurs because path modules are
  house-scoped.

- **500-char message limit** — Handler comms are short messages, not full announcements.
  No rich text, no attachments, no threading. Sufficient for nudges and alerts but not
  for detailed instructions.

- **Chart.js CDN dependency** — Analytics tab requires an internet connection to load
  Chart.js from CDN. Offline use shows empty charts. The lightweight `handler-charts.js`
  (SVG-based donuts and sparklines) works offline but only covers the Assignments tab.

- **No assignment grading** — Assignments track completion (binary) and quiz scores, but
  there is no manual grading workflow. Instructors cannot override or annotate scores.
  Export to CSV and grade in external LMS if needed.
