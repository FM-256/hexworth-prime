# EDTEngine — Ethical Decision Training (Case Room)

**Status:** SHIPPED
**Components:** EDTEngine.js, edt.css, submitEDTLab CF
**Location:** `_app/arena/engine/EDTEngine.js`, `_app/arena/engine/edt.css`
**Labs Location:** `_app/houses/divergent/ethics-it/labs/`
**Cloud Function:** `submitEDTLab` in `functions/index.js`
**Firestore:** `edt_submissions` collection
**House:** Divergent (The Warehouse)
**Course:** CIS4253 Ethics in Information Technology
**Added:** v7.0.0 "BATTLE SCHOOL" (2026-04-12)
**Last reviewed:** 2026-04-12

---

## Purpose

The EDTEngine is the first interactive ethics lab system on the Hexworth platform. It replaces the read-then-answer pattern used by every other ethics course with a decide-then-defend model that replicates how ethical decisions happen in the real world: the decision lands on your desk before you have time to build a framework around it.

Traditional ethics assessment tests recall. A student who memorizes "utilitarianism maximizes happiness" passes without ever wrestling with a real ethical decision. The EDTEngine forces students to commit to a position, then face a structured challenge to that position from an opposing ethical framework. The learning happens in the defense, not in the selection.

---

## What It Does

### The Case Room

Each lab is a "Case Room" -- a structured investigation workspace built around a real-world case (VW emissions, Sony hack, Snowden, Cambridge Analytica, etc.). Students progress through five linear phases. Phases cannot be skipped.

### Phase 1: Brief (2 minutes)

A cold-open scenario. No framework language. No leading questions. A leaked memo, a news alert, or a firsthand account. The student reads and confirms they understand before proceeding.

The brief is deliberately sparse. It presents the situation without analysis, forcing the student to form their own initial reaction before the evidence phase provides structured data.

### Phase 2: Evidence Lock-In (5-8 minutes)

8-12 evidence artifacts rendered as document-style cards. Each artifact has a type (email, memo, legal excerpt, testimony, data, news), a title, a date, and content.

The student tags each artifact: RELEVANT, IRRELEVANT, or CONTESTED. For every RELEVANT or CONTESTED tag, a text area appears requiring a minimum 20-character explanation of why the artifact matters.

Two of the artifacts are deliberate red herrings -- plausible-looking but factually misleading. Examples:
- In the VW lab: a consumer fuel economy brochure (fuel economy fraud is legally distinct from the Clean Air Act violation)
- In the Sony lab: the 2011 PSN breach (different business unit, different threat actor)

Red herrings serve as the first anti-gaming gate. A student clicking randomly will tag red herrings as relevant and cannot provide coherent explanations. The tagging pattern itself is data -- a student who marks the CEO memo as irrelevant in the VW case is a signal.

The evidence counter shows: "Tagged: X / 10 artifacts | Relevant: N | Contested: N | Irrelevant: N"

### Phase 3: Stakeholder + Framework Collision (10-15 minutes)

Three sub-steps executed in sequence:

**Step A -- Stakeholder Commit.** The student selects from a curated list of 10-14 stakeholders. The list is not free-form -- this prevents "society" as a cop-out. A minimum of 4 must be selected and ranked by severity of impact. The list includes non-obvious stakeholders that reward deep thinking:
- In the VW lab: "Competing manufacturers who complied with standards," "Future emissions regulators," "Public health (NOx exposure communities)"
- Non-obvious stakeholders are visually marked with a dashed border and "hidden" badge that flips to "found" when selected

**Step B -- Decision Commit.** The student selects one of 3-4 decision options for the central actor in the scenario. All options are defensible under some ethical framework. None is obviously "correct." Options are written neutrally.

The commit uses a two-click confirm pattern: first click turns the button amber and displays "This is permanent. Click again." A second click within 5 seconds locks the decision. After lock, the radio buttons become pointer-events: none and the button shows "Decision locked." This cannot be undone.

**Step C -- Framework Collision.** AFTER the student commits to a decision, the system presents three pre-authored analyses of that specific decision:
- **Supporting:** Which ethical framework most supports this choice, and why
- **Challenging:** The hardest critique from an opposing framework, using specific evidence from the case
- **Incomplete:** What this choice fails to address, regardless of framework

The challenging analysis is the core of the learning experience. The student must respond in 2-3 sentences (minimum 80 characters) explaining why the critique is valid, partially valid, or invalid.

This response cannot be pre-written because the student has not seen the challenge until after committing. The challenge is specific to the decision they made. A student who chose D1 sees a different challenge than a student who chose D3.

### Phase 4: Code Conflict (5 minutes)

Three pre-selected professional code provisions (from ACM Code of Ethics, IEEE Code of Ethics, PMI Code of Ethics, or SE Code of Ethics) relevant to the case.

The student ranks the three provisions from highest obligation (1) to lowest (3) using up/down arrows. At least one reorder action is required -- the engine tracks `_rankingInteracted` and will not advance if the student leaves the default order untouched.

Then: the system surfaces a genuine conflict between two of the provisions. Example from the VW lab:
- ACM 1.2: "Avoid harm. Computing professionals have an obligation to minimize negative consequences."
- IEEE 7.8: "Follow organizational procedures and policies."
- Conflict: "ACM 1.2 demands you minimize harm by disclosing. IEEE 7.8 demands you follow organizational procedures, which in this case means silence. When the organization IS the source of harm, which obligation prevails?"

The student states in one sentence (minimum 80 characters) which provision takes precedence and why.

### Phase 5: Submission + Reflection

Two-click submit (matching the Phase 3 confirm pattern). The `submitEDTLab` Cloud Function receives all responses, sanitizes text, calculates auto-scored components, and stores everything in Firestore.

After submission, the student enters **Reflection Mode** -- a read-only view where all four decision paths are expanded in collapsible `<details>` elements. The student's chosen path is pre-expanded and labeled "YOUR CHOICE." They can see the framework analyses for decisions they did not make, learning how the same facts lead to different conclusions depending on the choice.

Reflection mode is read-only. No re-grading. No re-submission. This serves genuine learning without incentivizing grade-farming.

---

## Scoring

No right or wrong answers. Scoring has four components:

| Component | Weight | Grading Method |
|-----------|--------|---------------|
| Evidence quality | 20% | Auto-graded: ratio of correctly tagged evidence vs red herrings |
| Stakeholder depth | 20% | Auto-graded: selection of non-obvious stakeholders, internal consistency with decision |
| Framework response | 40% | Instructor-graded via rubric: specificity, engagement with the critique, logical consistency with evidence phase |
| Code conflict | 20% | Auto-graded ranking + instructor spot-check on conflict statement |

Total instructor time per student: approximately 3-5 minutes reviewing the framework response. For a class of 30, that is 90-150 minutes of grading per lab.

---

## Anti-Gaming

| Gate | What It Catches |
|------|----------------|
| Red herrings in evidence | Students clicking randomly tag misleading artifacts as relevant |
| Minimum 20-char explanations | Empty or one-word explanations rejected |
| Curated stakeholder list | Prevents "society" and "everyone" as stakeholder selections |
| Two-click decision confirm | Prevents accidental commits |
| Framework response after commit | Cannot be pre-written -- challenge is decision-specific |
| Ranking interaction required | Must reorder at least once -- default order rejected |
| Minimum 80-char responses | Code conflict and framework responses can't be trivially short |
| Rate limiting (3/hour/lab) | Prevents brute-force re-submission |
| Server-side text sanitization | Strips HTML, enforces max lengths |

A student who clicks through randomly will: tag red herrings as relevant (evidence score = 0), skip non-obvious stakeholders (stakeholder score = low), produce a framework response that does not engage the specific critique (instructor flags in 30 seconds), and leave the default ranking (ranking rejected by engine).

---

## Architecture

### Config Schema

Each lab is a config object consumed by `EDTEngine.init(config)`:

```javascript
const Config = {
    id: 'eth-l01',
    title: 'The Defeat Device',
    subtitle: 'Volkswagen Emissions Scandal',
    course: 'CIS4253',
    week: 1,
    chapter: 1,
    duration: 30,
    accent: '#ff00ff',

    brief: {
        type: 'memo',          // 'memo' | 'news' | 'testimony' | 'email'
        from: 'Internal Engineering Team',
        date: 'September 2015',
        content: '...',
        classification: 'CONFIDENTIAL'
    },

    evidence: [
        {
            id: 'E1',
            type: 'email',     // 'email' | 'memo' | 'legal' | 'testimony' | 'data' | 'news'
            title: 'CEO Email to Engineering',
            date: '2008-03-15',
            content: '...',
            isRedHerring: false
        },
        // 8-12 artifacts, 2 red herrings
    ],

    stakeholders: [
        { id: 'S1', name: 'VW Engineers', obvious: true },
        { id: 'S5', name: 'Competing Manufacturers Who Complied', obvious: false },
        // 10-14 total
    ],
    minStakeholders: 4,

    decisions: [
        {
            id: 'D1',
            text: 'Report the defeat device to the EPA immediately',
            framework: 'deontological'
        },
        // 3-4 defensible options
    ],

    frameworkChallenges: {
        'D1': {
            supporting: '...',
            challenging: '...',
            incomplete: '...'
        },
        // Pre-authored for ALL decisions
    },

    codeProvisions: [
        { code: 'ACM', section: '1.2', text: 'Avoid harm...' },
        { code: 'IEEE', section: '7.8', text: 'Follow organizational procedures...' },
        { code: 'SE Code', section: '6.13', text: 'Report significant problems...' }
    ],

    codeConflict: {
        provision1: 'ACM 1.2',
        provision2: 'IEEE 7.8',
        conflictDescription: '...'
    },

    scoring: {
        evidence: 20,
        stakeholder: 20,
        framework: 40,
        codeConflict: 20
    }
};
```

### State Management

State persisted to localStorage under `hexworth_edt_{labId}`:

```javascript
{
    phase: 3,
    briefRead: true,
    evidenceTags: {
        'E1': { tag: 'relevant', note: 'Shows management authorization...' },
        'E5': { tag: 'irrelevant', note: '' }
    },
    stakeholderSelections: ['S1', 'S3', 'S7', 'S9'],
    stakeholderRanking: ['S7', 'S1', 'S9', 'S3'],
    decisionId: 'D1',
    decisionLocked: true,
    frameworkResponse: 'The utilitarian critique raises a valid point about...',
    codeRanking: ['ACM 1.2', 'SE Code 6.13', 'IEEE 7.8'],
    codeConflictResponse: 'ACM 1.2 takes precedence because...',
    _rankingInteracted: true,
    submitted: false,
    reflectionMode: false
}
```

### Cloud Function: submitEDTLab

```
Student submits
    |
    v
submitEDTLab Cloud Function
    |
    +-- Auth required
    +-- Rate limited (3/hour per lab per user)
    +-- Sanitizes all free-text fields (strips HTML, max lengths)
    +-- Validates tag values against whitelist
    +-- Bounds auto-scores (0-20 each)
    +-- Writes to edt_submissions/{labId}_{uid}
    +-- Sets frameworkGraded: false (instructor review flag)
    +-- Sets conflictGraded: false (instructor spot-check flag)
    +-- Returns { success, docId, autoScores }
```

### Firestore Document: edt_submissions/{labId}_{uid}

```javascript
{
    labId: 'eth-l01',
    uid: 'firebase-uid',
    submittedAt: Timestamp,

    // Phase 2
    evidenceTags: { E1: { tag: 'relevant', note: '...' }, ... },
    evidenceScore: 18,        // auto-calculated

    // Phase 3
    stakeholderSelections: ['S1', 'S3', 'S7', 'S9'],
    stakeholderRanking: ['S7', 'S1', 'S9', 'S3'],
    stakeholderScore: 16,     // auto-calculated
    decisionId: 'D1',
    frameworkResponse: '...',
    frameworkGraded: false,   // instructor review flag
    frameworkScore: null,     // set by instructor

    // Phase 4
    codeRanking: ['ACM 1.2', 'SE Code 6.13', 'IEEE 7.8'],
    codeConflictResponse: '...',
    conflictGraded: false,    // instructor spot-check flag
    codeScore: 17,            // auto-calculated

    // Totals
    autoTotal: 51,            // evidence + stakeholder + code
    finalTotal: null          // set after instructor grades framework
}
```

### Firestore Security Rules

```
match /edt_submissions/{submissionId} {
    allow read: if request.auth != null;
    allow create: if request.auth != null &&
        submissionId.matches('.*_' + request.auth.uid + '$');
    allow update: if request.auth != null;
    allow delete: if false;
}
```

---

## Visual Design (Warehouse Aesthetic)

The Case Room matches the Divergent house identity -- raw, industrial, functional:

- Dark background `#0d0810` with magenta `#ff00ff` accents
- Evidence cards styled as document-like blocks with monospace text
- Phase indicator uses industrial amber tape aesthetic, not a clean progress bar
- Stakeholder selection adds "pin" markers when selected
- Decision lock-in button turns amber on first click, demands second within 5 seconds
- Framework challenge appears with "INCOMING ANALYST TRANSMISSION" animation
- Code conflict box uses a distinct accent border
- After submission, the case board "closes" -- everything dims and locks
- Inter font for body text, JetBrains Mono for evidence and labels
- No XP badges or gamification -- the tone is serious

---

## The 10 Labs

| Lab | Case | Week | Chapter | Key Conflict |
|-----|------|------|---------|-------------|
| ETH-L01 | VW Emissions Scandal | 1 | 1 | ACM 1.2 (avoid harm) vs IEEE 7.8 (follow org procedures) |
| ETH-L02 | Sony Pictures Hack | 1 | 3 | ACM 1.6 (respect privacy) vs SE Code 3.12 (respect privacy of those affected) |
| ETH-L03 | Snowden / NSA PRISM | 2 | 4 | ACM 1.7 (honor confidentiality) vs ACM 1.2 (avoid harm) |
| ETH-L04 | Waymo vs Uber (IP War) | 2 | 6 | PMI 3.2 (enhance competence) vs ACM 1.5 (respect IP rights) |
| ETH-L05 | Uber Self-Driving Fatality | 3 | 7 | SE Code 1.03 (approve only if safe) vs organizational timeline pressure |
| ETH-L06 | IBM Watson for Oncology | 3 | 8 | ACM 1.4 (be fair) vs IEEE 7.8 (follow org procedures) |
| ETH-L07 | Cambridge Analytica | 4 | 9 | ACM 1.6 (respect privacy) vs ACM 2.6 (assess system impacts) |
| ETH-L08 | Frances Haugen / Facebook | 4 | 10 | PMI 2.1 (accurate representations) vs IEEE 7.8 (follow org procedures) |
| ETH-L09 | Gig Economy (Uber/Lyft) | 4 | 10 | ACM 1.1 (contribute to well-being) vs PMI 5.1 (respect IP) |
| ETH-L10 | Healthcare AI Bias (Capstone) | 4 | Appendices | TWO conflicts: ACM 1.4 vs PMI 4.3 AND IEEE 1 vs SE Code 2.01 |

Cross-lab narrative continuity: the C2 IP address `45.142.212.100` appears in L01 (ransomware behavior log), L03 (threat feed IOCs), and L06 (decrypted intelligence). Students who complete the full course see the through-line.

---

## Differentiation

| Platform | Ethics Format | Interaction | Grading |
|----------|--------------|-------------|---------|
| Cengage MindTap | Read chapter, answer MCQ | Click answers | Auto-graded recall |
| TestOut | Watch video, answer MCQ | Click answers | Auto-graded recall |
| Coursera | Watch lecture, peer-review essay | Write essay | Peer-reviewed |
| **Hexworth EDTEngine** | **Investigate case, tag evidence, commit decision, defend against framework challenge** | **Tag, rank, commit, write, compare** | **60% auto + 40% instructor rubric** |

The key differentiator: every other platform lets the student analyze first and decide second. The EDTEngine forces decide first, defend second. That inversion replicates how ethics works in the real world.

---

## Key Decisions

- **No right answers.** The engine does not tell students which decision is "correct." All decisions are defensible. The grade is on the quality of reasoning, not the choice itself.
- **Red herrings are pedagogically intentional.** They teach evidence evaluation -- a critical skill for anyone processing information in a professional context.
- **Framework challenges are pre-authored, not AI-generated.** Each challenge is hand-crafted to reference specific evidence from the case. This ensures consistency and prevents hallucinated critiques.
- **Reflection mode is read-only.** Students can see all paths after submission but cannot re-grade. This prevents trial-and-error gaming while enabling genuine learning from alternative perspectives.
- **The capstone lab (L10) has two simultaneous code conflicts.** This forces students to navigate competing obligations at the same time -- the closest the engine gets to the complexity of real professional ethics.

---

## Known Limitations

- **Auto-scores computed client-side.** The `submitEDTLab` CF accepts auto-score values within bounds but does not re-compute them from the raw data. A technically sophisticated student could intercept the XHR and inflate their auto-scores. The 40-point framework score (instructor-graded) is protected.
- **No instructor grading dashboard.** The `frameworkGraded: false` and `conflictGraded: false` flags exist in Firestore but there is no dedicated UI for instructors to review submissions. Currently requires direct Firestore console access or a future dashboard panel.
- **Single submission per lab.** Students cannot retry for a higher score. This is intentional (prevents permutation gaming) but means a student who submits prematurely has no recovery path.
- **Evidence explanations are minimum-length-gated, not quality-gated.** A student can write 20 characters of nonsense and pass the gate. Only the auto-score (red herring detection) catches low-quality tagging.

---

## File Inventory

```
_app/arena/engine/
    EDTEngine.js              -- 65KB, the Case Room engine
    edt.css                   -- 39KB, visual system

_app/houses/divergent/ethics-it/labs/
    eth-l01-vw-emissions/
        index.html            -- loader
        config.js             -- 31KB, case content
    eth-l02-sony-breach/
        index.html
        config.js             -- 37KB
    eth-l03-snowden-files/
        index.html
        config.js             -- 38KB
    eth-l04-ip-war/
        index.html
        config.js             -- 35KB
    eth-l05-autonomous-decision/
        index.html
        config.js             -- 38KB
    eth-l06-the-algorithm/
        index.html
        config.js             -- 39KB
    eth-l07-the-platform/
        index.html
        config.js             -- 33KB
    eth-l08-the-whistleblower/
        index.html
        config.js             -- 37KB
    eth-l09-the-gig/
        index.html
        config.js             -- 36KB
    eth-l10-the-code/
        index.html
        config.js             -- 44KB (capstone, two conflicts)

functions/index.js
    submitEDTLab              -- Cloud Function at ~line 4819
```

---

## Why It Exists

Ethics cannot be taught through recall. A student who can define "deontological" and "utilitarian" on a quiz has learned vocabulary, not judgment. Judgment comes from being forced to choose under uncertainty, then having that choice challenged by someone who disagrees intelligently.

The EDTEngine creates that experience at scale. Ten real cases. Forty pre-authored framework challenges. Evidence that rewards careful reading and punishes assumption. A scoring model that values reasoning over correctness.

The houses teach students how. The Warehouse asks them why. The EDTEngine is how the Warehouse asks.

---

*"The engine doesn't tell students what's right. It shows them what they chose, why someone disagrees, and forces them to articulate whether the disagreement has merit. That's ethics education."*
