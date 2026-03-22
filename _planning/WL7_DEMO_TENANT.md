# WL-7: Demo Tenant — Sample Data Reference

## Quick Reference for Pitches

**Tenant:** `hexworth-academy`
**URL:** `/tenant/index.html?slug=hexworth-academy`
**Seed Script:** `cd functions && GOOGLE_CLOUD_PROJECT=hexworth-prime node seed-demo-tenant.js`

---

## Sample Class

| Field | Value |
|-------|-------|
| Doc ID | `cyb301-fall2026` |
| Name | CYB-301 Cybersecurity Fundamentals |
| Section | Fall 2026 - Section A |
| Instructor | Dr. Martinez |
| Semester | Fall 2026 |
| Enrolled | 5 students |

**Firestore Path:** `tenants/hexworth-academy/classes/cyb301-fall2026`

---

## Assignments (8 Missions)

| # | Title | Type | Content ID | Points | Due |
|---|-------|------|-----------|--------|-----|
| 1 | Phantom Shell CTF | box | a3-phantom-shell | 100 | +7 days |
| 2 | Network Fundamentals Quiz | quiz | web-osi-quiz | 50 | +3 days |
| 3 | Wireshark Packet Analysis | module | ws-pa-04-tcp | 75 | +10 days |
| 4 | SQL Injection Defense Lab | lab | shield-sql-injection-defense | 100 | +14 days |
| 5 | Incident Response Forensics | module | df-57-incident-response | 75 | +21 days |
| 6 | Red vs Blue Exercise | box | pr7-red-vs-blue | 150 | +28 days |
| 7 | Cryptography Fundamentals | presentation | key-cryptography-fundamentals | 25 | +5 days |
| 8 | Final CTF Challenge | box | a20-project-chimera | 200 | +35 days |

**Total possible points:** 775

**Firestore Path:** `tenants/hexworth-academy/classes/cyb301-fall2026/assignments/{mission-id}`

---

## Sample Students (5)

| UID | Callsign | Completed | Profile | Score Range |
|-----|----------|-----------|---------|-------------|
| student-001 | NOVA | 6/8 | Top performer, ahead of schedule | 88-100 |
| student-002 | CIPHER | 4/8 | Solid mid-range, steady pace | 72-85 |
| student-003 | GHOST | 2/8 | Struggling, needs support | 58-62 |
| student-004 | SPARK | 1/8 | New student, just enrolled | 91 (quiz only) |
| student-005 | ECHO | 0/8 | Behind schedule, no activity | -- |

**Firestore Path:** `tenants/hexworth-academy/classes/cyb301-fall2026/progress/{student-uid}`

### Detailed Progress

**NOVA (student-001)** — 6 completed, 1 in progress, 1 not started
- Phantom Shell: 95, Network Quiz: 100, Wireshark: 88, SQL Injection: 92, IR Forensics: 90, Red vs Blue: 97
- Currently working on: Cryptography Fundamentals
- Not started: Final CTF

**CIPHER (student-002)** — 4 completed, 1 in progress
- Phantom Shell: 78, Network Quiz: 85, Wireshark: 72, SQL Injection: 80
- Currently working on: Incident Response Forensics

**GHOST (student-003)** — 2 completed, 1 in progress
- Phantom Shell: 62, Network Quiz: 58
- Currently working on: Wireshark Packet Analysis

**SPARK (student-004)** — 1 completed, 1 in progress
- Network Quiz: 91
- Currently working on: Phantom Shell CTF

**ECHO (student-005)** — 0 completed, 0 in progress
- No activity recorded

---

## Demo Talking Points

### For University IT Directors
- "Here's a live class with 5 students at different performance levels"
- "The instructor dashboard shows exactly who's falling behind"
- "Assignments map directly to NIST/NICE framework objectives"

### For Professors
- "Create an assignment in 30 seconds — pick content, set due date, assign points"
- "Students see their mission queue styled as a SOC analyst workflow"
- "Progress data exports to CSV for LMS grade import"

### For CISOs / Training Managers
- "Content ranges from beginner quizzes (50pts) to advanced CTF challenges (200pts)"
- "Red vs Blue exercises simulate real attack-defense scenarios"
- "All branding is customizable — your logo, your colors, your domain"

---

## Re-Seeding

The seed script is idempotent. Run it again to reset all demo data:

```bash
cd functions
GOOGLE_CLOUD_PROJECT=hexworth-prime node seed-demo-tenant.js
```

Due dates are relative to "now," so re-running before a demo ensures fresh, realistic deadlines.

---

*Created: 2026-03-21*
*Feature: WL-7*
