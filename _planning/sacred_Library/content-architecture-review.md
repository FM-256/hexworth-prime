# Content Architecture Review: LearningPaths.js

## Date
2026-02-08

## Subject
An architectural review of the `LearningPaths.js` component, which serves as the central blueprint for all educational content and curriculum structure.

## Summary of Architecture
The `LearningPaths.js` file defines the platform's entire curriculum via a large, static `PATHS` object. This object maps out all learning paths (e.g., "houses" like `shield` and "certification paths" like `comptia-linux`) and the ordered sequence of modules within them.

*   **Single Source of Truth:** The `PATHS` object is the definitive source for content structure.
*   **Dependency Graph:** Each module's `prerequisites` array establishes a directed acyclic graph (DAG) that governs user progression.
*   **Module Schema:** Modules are consistently defined with properties such as `id`, `title`, `type`, and `href`.
*   **Static Utilities:** The `LearningPaths` class provides a set of static methods for querying this data structure (e.g., `getModule`, `isModuleAvailable`).

## Key Findings & Recommendations

### 1. Path Resolution
*   **Finding (High Risk):** The `href` property across different module definitions exhibits significant format inconsistencies. Some paths are relative to a house, while others are absolute from the application root.
*   **Finding (High Risk):** The `resolveModuleHref()` utility function is too simplistic to reliably handle the varied `href` formats. This has led to the decentralization of path resolution logic across the codebase, increasing fragility and the likelihood of broken links.
*   **Recommendation:**
    1.  **Standardize `href` Format:** A single, consistent format for all `href` values should be enforced project-wide (e.g., all paths should be absolute from the `_app/` directory). A script could be developed to automate this refactoring.
    2.  **Centralize Resolution Logic:** The `resolveModuleHref()` function should be enhanced to become the sole, authoritative source for resolving module paths. All other components must use this central utility instead of implementing their own logic.

### 2. Data vs. Code Separation
*   **Finding (Medium Risk):** The `PATHS` object, which is pure data, is tightly coupled with the logic that consumes it within the same JavaScript file. This makes the file large and harder to maintain.
*   **Recommendation:** Separate the data from the code. The `PATHS` object should be extracted into its own JSON file (e.g., `_app/config/learning-paths.json`). The `LearningPaths.js` class would then be simplified to be responsible only for fetching, parsing, and providing utility methods for this data. This improves modularity and clarity.

### 3. Prerequisite Graph Integrity
*   **Finding (Informational):** The `prerequisites` system is the backbone of the user's learning journey. Its integrity is critical.
*   **Recommendation:** An EduScan validator should be created to specifically analyze the prerequisite graph. This validator would detect:
    *   **Circular Dependencies:** (e.g., Module A requires B, and B requires A). This would trap a user in an unbreakable loop.
    *   **Missing Prerequisites:** A prerequisite ID that does not correspond to any existing module ID.
    *   **Self-referential Prerequisites:** A module that lists itself as a prerequisite.

## Conclusion
`LearningPaths.js` is a mission-critical component that defines the entire educational experience. While its structure is sound, it suffers from significant inconsistencies in its path data, leading to fragile and decentralized resolution logic. Standardizing the `href` format and centralizing the resolution function are the highest-priority recommendations. Additionally, separating the path data into JSON and validating the prerequisite graph would further enhance the system's robustness and maintainability.
