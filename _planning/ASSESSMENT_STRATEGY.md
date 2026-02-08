# Hexworth Prime - Assessment & Knowledge Verification Strategy

**Created:** December 22, 2025
**Status:** Planning
**Philosophy:** Every interaction should build AND verify knowledge

---

## 🎯 CORE PRINCIPLE

> **"If you can't verify it, you didn't teach it."**

Knowledge verification shouldn't feel like a test - it should feel like a challenge, a game, or a natural part of the learning flow.

---

## CURRENT STATE ANALYSIS

### Quiz Coverage by House

| House | Content | Quizzes | Ratio | Status |
|-------|---------|---------|-------|--------|
| Shield | 98 | 0 | 0% | 🔴 CRITICAL |
| Script | 22 | 0 | 0% | 🔴 CRITICAL |
| Cloud | 23 | 0 | 0% | 🔴 CRITICAL |
| Web | 67 | 1 | 1.5% | 🟠 SEVERE |
| Forge | 40 | 1 | 2.5% | 🟠 SEVERE |
| Code | 27 | 6 | 22% | 🟢 Good |
| Key | 33 | 8 | 24% | 🟢 Good |
| Eye | 21 | 5 | 24% | 🟢 Good |

**Total Gap:** Houses with good coverage (Code, Key, Eye) were recently built with assessments in mind. Legacy imported content (Shield, Web, Forge) lacks verification.

---

## ASSESSMENT TYPES

### 1. Traditional Quizzes 📝
**Best for:** Factual recall, terminology, concept identification
**Format:** Multiple choice, true/false, matching, fill-in-blank
**When to use:** End of module, certification prep

**Example:**
```
Q: Which of the following is NOT a pillar of information assurance?
A) Confidentiality
B) Integrity
C) Velocity  ← Correct answer
D) Availability
```

### 2. Interactive Challenges 🎮
**Best for:** Applied knowledge, problem-solving, decision-making
**Format:** Scenario + action required, puzzle, configuration task
**When to use:** During learning, as "gates" to next content

**Example:**
```
CHALLENGE: Configure the Firewall
- Drag rules to the correct order
- Test with simulated traffic
- Must block attack, allow legitimate
```

### 3. Simulation Assessments 🖥️
**Best for:** Hands-on skills, tool proficiency, real-world application
**Format:** Virtual lab environment, configuration tasks, troubleshooting
**When to use:** Skills that require doing, not just knowing

**Example:**
```
SIMULATION: Fix the Network
- Topology shows 5 devices
- 2 are misconfigured
- Find and fix to restore connectivity
- Timer optional for pressure
```

### 4. Scenario-Based Questions 🎭
**Best for:** Critical thinking, decision-making, contextual application
**Format:** Story + "What would you do?", incident response, triage
**When to use:** Complex topics, real-world preparation

**Example:**
```
SCENARIO: It's 2am. Your SIEM alerts on unusual outbound traffic.
The source is the CEO's laptop. What's your FIRST action?

A) Block the IP immediately
B) Call the CEO to verify
C) Isolate the device and investigate  ← Best answer
D) Ignore it - probably Windows Update
```

### 5. Knowledge Checks (Inline) ✓
**Best for:** Attention verification, immediate reinforcement
**Format:** Quick question mid-content, "Did you catch that?"
**When to use:** During presentations, after key concepts

**Example:**
```
[Presentation slide about OSI Layer 4]

⚡ QUICK CHECK: What layer does TCP operate at?
[ ] Layer 3
[●] Layer 4  ← Correct!
[ ] Layer 7
```

### 6. Practical Labs with Verification 🔬
**Best for:** Skill development, procedure practice
**Format:** Step-by-step with checkpoints, auto-graded results
**When to use:** Tool training, configuration tasks

**Example:**
```
LAB: Configure SSH Key Authentication

Step 1: Generate key pair
  [Check] ✓ Key pair exists

Step 2: Copy public key to server
  [Check] ✓ Key in authorized_keys

Step 3: Test connection
  [Check] ✓ Login without password

RESULT: 3/3 - Lab Complete!
```

### 7. Explain-Back (Future/Community) 💬
**Best for:** Deep understanding, teaching others
**Format:** Record explanation, peer review, mentorship
**When to use:** Advanced learners, community features

### 8. Spaced Repetition 🔄
**Best for:** Long-term retention, certification prep
**Format:** Review questions return at intervals, flashcard-style
**When to use:** Critical concepts that must be memorized

---

## HOUSE-SPECIFIC ASSESSMENT PLANS

### 🛡️ SHIELD HOUSE (Priority: CRITICAL)
**Current:** 98 applets, 0 quizzes
**Challenge:** Mostly legacy Hype applets, varied topics

**Recommended Assessments:**

| Topic Area | Assessment Type | Count Needed |
|------------|-----------------|--------------|
| CIA Triad | Scenario quiz | 1 |
| Fundamentals (5 pillars, controls) | Knowledge check + quiz | 2 |
| Threats & Attacks | Matching + scenarios | 2 |
| Cryptography | Interactive cipher challenge | 1 |
| Network Security | Config simulation | 1 |
| Risk Management | Scenario-based | 1 |
| Compliance (CMMC) | Traditional quiz | 1 |
| **TOTAL** | | **9 quizzes** |

### 📜 SCRIPT HOUSE (Priority: CRITICAL)
**Current:** 22 applets, 0 quizzes
**Challenge:** Command-line skills need hands-on verification

**Recommended Assessments:**

| Topic Area | Assessment Type | Count Needed |
|------------|-----------------|--------------|
| Linux Basics | Command challenge | 1 |
| File Permissions | Calculator verification | 1 |
| Bash Scripting | Write & run script | 1 |
| Python (8 chapters) | Code challenges | 2 |
| PowerShell | Command matching | 1 |
| System Admin | Scenario-based | 1 |
| **TOTAL** | | **7 quizzes** |

### ☁️ CLOUD HOUSE (Priority: CRITICAL)
**Current:** 23 applets, 0 quizzes (but some applets ARE quizzes)
**Note:** Check if ch01, ch05, ch08, ch09, ch10, ch12 files are quizzes

**Recommended Assessments:**

| Topic Area | Assessment Type | Count Needed |
|------------|-----------------|--------------|
| Cloud Concepts | Service model matching | 1 |
| AWS Fundamentals | Service identification | 1 |
| AWS Compute | Instance type selection | 1 |
| AWS Storage | Storage class scenarios | 1 |
| AWS Networking | VPC design challenge | 1 |
| Full CCP Practice | Comprehensive exam | 1 |
| **TOTAL** | | **6 quizzes** |

### 🕸️ WEB HOUSE (Priority: SEVERE)
**Current:** 67 items, 1 quiz
**Challenge:** Heavy content, networking fundamentals

**Recommended Assessments:**

| Topic Area | Assessment Type | Count Needed |
|------------|-----------------|--------------|
| OSI Model | Layer identification | Already have 1 |
| TCP/IP | Protocol matching | 1 |
| Subnetting | Calculation challenges | 2 |
| VLANs & Switching | Config simulation | 1 |
| Routing (OSPF/EIGRP) | Path selection | 1 |
| Wireless | Security matching | 1 |
| Network+ Practice | Comprehensive | 1 |
| CCNA Practice | Comprehensive | 1 |
| **TOTAL** | | **8 quizzes** |

### ⚒️ FORGE HOUSE (Priority: SEVERE)
**Current:** 40 items, 1 quiz
**Challenge:** Hardware + Windows, varied content

**Recommended Assessments:**

| Topic Area | Assessment Type | Count Needed |
|------------|-----------------|--------------|
| Windows Editions | Feature matching | 1 |
| Settings vs Control Panel | Navigation challenge | 1 |
| Admin Tools | Tool selection scenarios | 1 |
| Hardware | Component identification | 1 |
| RAID | Capacity calculator | Already have visualizer |
| A+ Practice | Comprehensive | Already have 1 |
| **TOTAL** | | **4 quizzes** |

---

## ASSESSMENT TEMPLATE STANDARDS

### Quiz Format Standard
```html
<!-- Every quiz should have: -->
- Clear instructions
- Progress indicator (Q3 of 10)
- Immediate feedback on each question
- Explanation for wrong answers (learning opportunity!)
- Final score with breakdown
- Option to retry
- Badge/achievement trigger if passed
```

### Minimum Viable Quiz
```javascript
{
    title: "Module Name Quiz",
    questions: 10,        // Minimum 10 questions
    passingScore: 70,     // 70% to pass
    timeLimit: null,      // Optional
    randomize: true,      // Shuffle questions
    showAnswers: true,    // After completion
    retryAllowed: true,   // Always allow retry
    achievement: "quiz-shield-cia"  // Trigger on pass
}
```

---

## GAMIFICATION OF ASSESSMENT

### Make It Not Feel Like a Test

| Instead of... | Try... |
|---------------|--------|
| "Take the quiz" | "Prove your skills" |
| "Test your knowledge" | "Accept the challenge" |
| "You scored 70%" | "7 threats neutralized!" |
| "Wrong answer" | "That's what the attacker wants you to think..." |
| "Retry quiz" | "Train again" |

### Achievement Integration

| Achievement | Trigger |
|-------------|---------|
| "First Blood" | Pass first quiz |
| "Scholar" | Pass 10 quizzes |
| "Perfectionist" | Score 100% on any quiz |
| "Persistence" | Pass a quiz after 3+ attempts |
| "Speed Demon" | Pass timed quiz with 50%+ time remaining |
| "House Champion" | Pass all quizzes in one house |

---

## IMPLEMENTATION PRIORITY

### Phase 1: Critical Coverage (Shield, Script, Cloud)
- [ ] Shield: CIA Triad quiz
- [ ] Shield: Threats & Attacks quiz
- [ ] Shield: Fundamentals quiz
- [ ] Script: Linux Basics challenge
- [ ] Script: Python assessment
- [ ] Cloud: Verify existing quiz applets work
- [ ] Cloud: CCP practice exam

### Phase 2: Severe Coverage (Web, Forge)
- [ ] Web: Subnetting calculator quiz
- [ ] Web: Network+ practice
- [ ] Forge: Windows admin scenarios
- [ ] Forge: Hardware identification

### Phase 3: Inline Knowledge Checks
- [ ] Add quick checks to all presentations
- [ ] "Did you catch that?" moments
- [ ] Attention verification

### Phase 4: Advanced Assessments
- [ ] Scenario-based for each house
- [ ] Cross-house challenges
- [ ] Spaced repetition system

---

## QUICK WIN: QUIZ TEMPLATE

Create a reusable quiz template that can be quickly populated:

```
_app/components/QuizEngine.js     <- Reusable quiz logic
_app/templates/quiz-template.html <- Starter HTML
_app/styles/quiz-styles.css       <- Consistent styling
```

This allows rapid quiz creation by just providing:
1. Title
2. Questions array (question, options, correct, explanation)
3. Pass threshold
4. Achievement to trigger

---

*Last Updated: December 22, 2025*
