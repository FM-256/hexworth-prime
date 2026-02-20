[STATUS: 2 of 3 items fixed.]
# Auditor Finding: Handler Dashboard Secondary Failures
**File:** `AUDIT-2026-02-08-HandlerDashboard-Secondary-Failures.md`
**Date:** February 8, 2026
**Auditor:** Hexworth-Prime
**Status:** **ACTIVE. P1/P2-CRITICAL.**

---

## 1. Finding: Systemic Data Integrity and Reliability Issues

Following the documentation of P0 failures, this scroll addresses the remaining P1 and P2 priority issues identified in the preliminary audit (`HANDLER_DASHBOARD_AUDIT.md`). These issues contribute to the overall fragility of the progress tracking system, causing data to be lost or recorded incorrectly.

---

## 2. Recommendation: Audit and Align Quiz Module IDs (P1)

### Issue
Numerous quizzes are configured with a unique `moduleId` (e.g., `shield-cia-triad-quiz`) that does not match the `moduleId` of the parent content being assigned by a Handler (e.g., `shield-cia-triad`). When a student completes the quiz, the progress is recorded against the wrong ID and is never reconciled with the assigned task. This is a significant data mismatch flaw.

### Recommended Action
A full audit of all quiz configurations is required to ensure their `moduleId` aligns with the parent module they belong to.

1.  **Identify All Quiz Instances:** Systematically locate every file that instantiates the `QuizEngine`. The primary locations are `_app/houses/*/quizzes/*.html` and any other component that uses `new QuizEngine({...})`. The `audit-tool.html` can be enhanced to assist with this discovery process.

2.  **Correct `moduleId` Values:** For each quiz, the `moduleId` property must be changed from its unique quiz-specific ID to the ID of the overarching module.
    *   **Example:** In `cia-triad-quiz.html`, the configuration `new QuizEngine({ moduleId: 'shield-cia-triad-quiz', ... })` must be changed to `new QuizEngine({ moduleId: 'shield-cia-triad', ... })`.

**Justification:** Aligning module IDs is essential for data integrity. Without this, the system cannot correlate quiz completion with a specific assignment, making the quiz system incompatible with the Handler Dashboard.

---

## 3. Recommendation: Register All Assignable Content (P1)

### Issue
Content exists within the project (e.g., the `linux-mastery` modules) that is assignable by Handlers but is not registered in the central `_app/config/content-registry.js`. This leads to failures in metadata lookup, search, and path construction.

### Recommended Action
All content intended for assignment must be registered in the `content-registry.js`.

1.  **Conduct a Full Content Audit:** Perform a comprehensive scan of the `_app/houses/` directory to identify all pieces of learning content (modules, quizzes, presentations, labs).
2.  **Cross-Reference with Registry:** Compare the list of discovered content against the entries in `content-registry.js`.
3.  **Add Missing Entries:** For every piece of unregistered content, a new entry must be added to the `content-registry.js`, ensuring that the `house`, `components`, `title`, and other metadata are correct.

**Justification:** The `content-registry.js` serves as the single source of truth for content discovery and metadata. Unregistered content is effectively invisible to the core systems, leading to broken features and a poor user experience.

---

## 4. Recommendation: Decouple Progress Sync from Dashboard Visits (P2)

### Issue
Progress synchronization to Firestore currently *only* occurs when a student loads `dashboard.html`. If a student completes an activity and closes the browser without returning to the dashboard, their progress is never synced and is invisible to the Handler. This is a critical flaw in data persistence strategy.

### Recommended Action
The progress sync mechanism must be triggered by the completion event itself, not by a subsequent, unrelated user action.

1.  **Implement Sync-on-Completion:** Refactor the `syncProgressToFirestore()` function so that it can be called from any component where progress is saved.
2.  **Trigger Sync from Components:** In components like `QuizEngine.js`, `ProgressManager.js`, and any presentation with a "Mark Complete" button, invoke `syncProgressToFirestore()` immediately after the progress has been successfully saved to `localStorage`.
3.  **Consider Offline Scenarios:** The implementation should be robust enough to handle offline scenarios. If a sync fails due to a lack of network connectivity, it should queue the sync to be re-attempted later (e.g., on the next page load or when connectivity is restored). A simple "dirty flag" in `localStorage` could manage this.

**Justification:** Tying a critical background task like data synchronization to a specific UI visit is inherently unreliable. Decoupling it ensures that progress is saved in a timely and predictable manner, vastly improving the reliability and accuracy of the Handler Dashboard. This change moves the system from a "pull" model to a "push" model for progress updates.
