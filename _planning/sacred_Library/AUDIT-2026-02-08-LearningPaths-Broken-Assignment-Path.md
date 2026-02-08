# Auditor Finding: Broken Assignment Path Generation for Virtual Paths
**File:** `AUDIT-2026-02-08-LearningPaths-Broken-Assignment-Path.md`
**Date:** February 8, 2026
**Auditor:** Hexworth-Prime
**Status:** **ACTIVE. HIGH SEVERITY.**

---

## 1. Finding: Latent 404 Errors for All Certification Path Assignments

The `EduScan` tool reported a `HIGH` severity issue: `[ASGN-003] Path '...' assignment index.html does not exist`. This issue was reported for multiple certification-focused learning paths, including `devops-fundamentals`, `comptia-linux`, `aplus-core1`, and `aplus-core2`.

My analysis of `_app/components/LearningPaths.js` confirms this finding. The file defines these certification tracks as top-level paths alongside standard "Houses" like `shield` and `web`. However, unlike the Houses, these certification paths are "virtual"—they do not have a corresponding directory or `index.html` file within `_app/houses/`.

The root cause of this issue is flawed URL generation logic elsewhere in the system (e.g., `resolveAssignmentHref()` as noted in a previous audit) which assumes every learning path has a physical `index.html` to link to. This incorrect assumption guarantees that any attempt to assign these certification paths to students will result in a broken link and a `404 Not Found` error.

---

## 2. Location of Error

The problematic data structures are located in the `LearningPaths.PATHS` static object within `_app/components/LearningPaths.js`.

**Example of a virtual path definition:**
```javascript
'devops-fundamentals': {
    name: 'DevOps Fundamentals',
    description: 'Master CI/CD, containerization, and infrastructure as code',
    icon: '⚙️',
    color: '#8b5cf6',
    modules: [
        // ... module list
    ]
},
```
The system fails because it attempts to find a file at `_app/houses/devops-fundamentals/index.html`, which does not exist.

---

## 3. Recommended Action

The initial recommendation from `EduScan` was to create the missing `index.html` files. This is a naive solution that would lead to code duplication and maintenance overhead. A more robust, architectural solution is required.

**Recommendation:** The URL generation logic must be updated to differentiate between "House" paths and "virtual" paths.

1.  **Modify URL Generation:** The `resolveAssignmentHref()` function (and any other logic that generates links to learning paths) should be refactored.
2.  **Implement a Check:** Before generating a URL, the function should check if a physical `_app/houses/<path_id>/index.html` file exists.
3.  **Conditional Redirection:**
    *   **If the file exists (it's a House):** Generate the link to the `index.html` as it currently does.
    *   **If the file does not exist (it's a virtual path):** Generate a link to the generic path viewer, passing the path ID as a query parameter. The correct URL should be `path-view.html?path=<path_id>`.

**Example of corrected logic:**
```javascript
// Psuedo-code for the new logic
function resolveAssignmentHref(path_id) {
  // This check is conceptual. A real implementation might need a pre-compiled list.
  if (physicalHouseIndexExists(path_id)) {
    return `houses/${path_id}/index.html`;
  } else {
    // It's a virtual path, redirect to the dynamic path viewer.
    return `path-view.html?path=${path_id}`;
  }
}
```

**Justification:** This approach addresses the root cause of the problem by making the system aware of its own architecture. It leverages the existing `path-view.html` component for its intended purpose and avoids the creation of unnecessary, duplicative files, adhering to the DRY (Don't Repeat Yourself) principle.
