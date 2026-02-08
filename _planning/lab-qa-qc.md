# Lab QA/QC - Learning Experience Standards

**Purpose:** Document lessons learned from lab improvements to establish consistent quality standards across all Hexworth Prime labs. When applying QA/QC to any lab, reference this document.

**Philosophy:** *Hexworth Prime labs prioritize learning experience over feature completion. A lab that teaches one concept well beats a lab with ten features that confuse.*

---

## Core Principle: The Learning Experience Priority

Our unique identity comes from **teaching, not just doing**. Every interaction should answer:
1. What just happened?
2. Why did it happen?
3. What should I learn from this?

---

## Lessons Learned

### Issue 1: Speed Kills Learning
**Problem:** Actions completed instantly - user clicked Forward, everything happened in a flash.
**Impact:** Zero comprehension. User saw results but didn't understand the journey.
**Solution:** Multi-step animations with deliberate pacing:
- Step 1: Show what's being sent (1 sec pause)
- Step 2: Show processing state (0.5 sec)
- Step 3: Show what was received
- Step 4: Explain what it means

### Issue 2: No Context = No Learning
**Problem:** Results appeared without explanation of significance.
**Impact:** User completes lab but can't apply knowledge in real scenarios.
**Solution:** Scenario-specific teaching popups that explain:
- What to look for in the response
- Why this matters for security
- What an attacker would do next

### Issue 3: Technical Errors Break Immersion
**Problem:** `</script>` tags inside JavaScript template literals broke the entire page.
**Impact:** Page showed raw template code like `${challenge.id}` instead of rendered content.
**Solution:**
- URL encode script tags in simulated requests: `%3Cscript%3E`
- HTML entity encode in responses: `&lt;script&gt;`
- Always test labs in browser before deploying

### Issue 4: Tab/Navigation Failures
**Problem:** Tab switching used `event.target` which failed when called from sidebar buttons.
**Impact:** UI became inconsistent - content changed but tab highlighting didn't.
**Solution:** Query DOM for correct element instead of relying on event context:
```javascript
const targetTab = document.querySelector(`.tab[onclick*="'${tabName}'"]`);
```

---

## QA/QC Checklist for Labs

### Technical Quality
- [ ] **No raw template literals visible** - All `${variable}` should render as values
- [ ] **No `</script>` in JS strings** - Use URL encoding or HTML entities
- [ ] **All tabs/navigation work** - Test from every entry point (direct click, sidebar, programmatic)
- [ ] **Console is error-free** - F12 → Console should show no red errors
- [ ] **Mobile responsive** - Test on phone viewport
- [ ] **Progress saves correctly** - LocalStorage persistence works

### Learning Experience Quality
- [ ] **Pacing is deliberate** - No instant actions; give user time to observe
- [ ] **Every action has explanation** - Popups/tooltips explain what happened
- [ ] **Visual hierarchy guides attention** - Highlights, arrows, pulsing on key elements
- [ ] **Scenario context provided** - User understands the "story" they're in
- [ ] **Success teaches, not just celebrates** - Explain WHY answer was correct
- [ ] **Failure guides, not just rejects** - Hints show path to understanding

### Guided Learning Mode Features
- [ ] **Learning Mode toggle** - Beginners get hand-holding, experts can skip
- [ ] **Step-by-step animations** - Break complex actions into visible stages
- [ ] **Teaching popups per scenario** - Context-specific insights
- [ ] **Visual annotations** - Arrows/highlights pointing to important elements
- [ ] **Color coding** - Green=safe, Yellow=interesting, Red=vulnerable

---

## Implementation Pattern: Guided Forward Action

Replace instant actions with this pattern:

```javascript
async function guidedForward() {
    // Step 1: Show sending
    showOverlay('📤 Sending request to server...', 'sending');
    highlightElement('requestEditor');
    await delay(1000);

    // Step 2: Show processing
    showOverlay('⚙️ Server processing...', 'processing');
    await delay(500);

    // Step 3: Show response
    showOverlay('📥 Response received!', 'received');
    displayResponse();
    highlightElement('responseViewer');
    await delay(500);

    // Step 4: Teaching moment
    hideOverlay();
    showTeachingPopup(currentScenario);
}
```

---

## Scenario Teaching Templates

When adding teaching popups, include:

1. **Observation** - "Notice the [specific element]..."
2. **Significance** - "This indicates [security implication]..."
3. **Attacker Action** - "An attacker would [next step]..."
4. **Defense** - "To prevent this, [mitigation]..."

Example:
```
📍 SQL Injection Target

OBSERVATION: Notice the comment in the HTML:
<!-- SQL Query: SELECT * FROM products WHERE id = 42 -->

SIGNIFICANCE: This reveals the application uses dynamic SQL queries
with user input directly in the WHERE clause.

ATTACKER ACTION: Try injecting: 42' OR '1'='1' --
This would return all products instead of just ID 42.

DEFENSE: Use parameterized queries (prepared statements) instead
of string concatenation.
```

---

## Priority Matrix

When improving a lab, tackle issues in this order:

| Priority | Category | Why |
|----------|----------|-----|
| P0 | Technical breaks (page won't load) | Nothing else matters if it's broken |
| P1 | Learning context missing | Core mission failure |
| P2 | Pacing too fast | User can't absorb information |
| P3 | No visual guidance | User doesn't know where to look |
| P4 | Missing expert mode | Returning users frustrated by hand-holding |

---

## Labs to Apply QA/QC

Track which labs have been reviewed:

| Lab | Location | QA/QC Status | Notes |
|-----|----------|--------------|-------|
| Burp Suite Training | `web/tools/burp-training.html` | In Progress | Fixed technical issues, learning mode pending |
| Unit Testing Lab | `code/labs/unit-testing-lab.html` | Done | Immersive mode implemented |
| Nikto Training | `web/tools/nikto-training.html` | Pending | Needs review |
| Linux CLI Labs | `script/applets/linux/clh-*.html` | **Done** | Full QC sweep v2.90.0 (2026-01-19) |
| Dark Arts Labs | `dark-arts/vault/*.html` | Pending | Needs review |

### CLH Labs QC Summary (v2.90.0)
All 17 CLH labs (001-017) verified with:
- 10+ files per filesystem
- Hidden cheatsheets (`.xxx_cheatsheet`)
- Helpful `.bash_history` files
- Output validation on objectives
- Insight Phase questions with findable answers

See `CLH_ISSUES.md` for detailed lab-by-lab results and Insight Phase answer reference.

---

## Usage

When told to "apply QA/QC to [lab name]":

1. Read the lab file completely
2. Run through this checklist
3. Identify gaps in technical quality
4. Identify gaps in learning experience
5. Propose fixes in priority order
6. Implement with user approval

---

*Last Updated: 2026-01-19*
*Origin: Burp Suite Training Lab improvement session*
