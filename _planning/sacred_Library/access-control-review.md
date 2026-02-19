[STATUS: All issues remain unfixed.]
# Access Control System Review: AccessGuard.js

## Date
2026-02-08

## Subject
An architectural review of the `AccessGuard.js` component, which manages client-side content protection and access control for the platform.

## Summary of Architecture
`AccessGuard.js` is a client-side script designed to be embedded in protected HTML pages. Its primary function is to verify a user's entitlements—stored in `localStorage` and `sessionStorage`—before allowing the page's content to render.

*   **Execution Model:** It utilizes an Immediately Invoked Function Expression (IIFE) to hide the `<body>` content on load, preventing a "flash of unprotected content" (FOUC).
*   **State Management:** All access decisions are based entirely on keys and values stored in the browser's local and session storage.
*   **Access Tiers:** The system defines multiple access levels, such as `sorted` (has a House), `house` (belongs to a specific House), and `gate` (has passed a specific challenge).
*   **Privilege Escalation:** Four distinct bypass mechanisms exist: a session-based "God Mode," a persistent "Firebase Admin" status, a time-limited "Master Key," and a "House Hopper" status.

## Key Findings & Recommendations

### 1. Architectural Vulnerability: Client-Side Enforcement
*   **Finding (High Severity):** The system's complete reliance on client-side JavaScript for access control constitutes a critical architectural vulnerability. A user can trivially bypass all restrictions using browser developer tools to either manually set the necessary storage keys (e.g., `localStorage.setItem('hexworth_god_mode', 'true')`) or directly execute `AccessGuard.showContent()` in the console.
*   **Recommendation:** This component must be re-classified as a **User Experience (UX) mechanism**, not a security mechanism. It is effective for guiding legitimate users along the correct path but offers no meaningful protection against deliberate circumvention. For all high-value or truly restricted content, access control **must** be enforced on the **server-side**. The server, not the client, should be the ultimate arbiter of whether a user is entitled to receive a given resource.

### 2. System Complexity and Obscurity
*   **Finding (Medium Severity):** The presence of four distinct bypass mechanisms creates a complex permissions model with overlapping rules, increasing the risk of unintended access scenarios. Furthermore, the activation method for the "Master Key" is described as an undocumented "easter egg," which is an insecure practice for a privileged access tool.
*   **Recommendation:** A comprehensive review of all bypass mechanisms is warranted. Consolidate these roles where possible (e.g., could "God Mode" and "Master Key" be a single, auditable developer tool?). The activation for any administrative or privileged mode should be explicit and authenticated, not hidden.

### 3. Commendations
*   **FOUC Prevention:** The proactive hiding of page content is a well-implemented and commendable technique for improving the user experience during the authorization check, preventing content from flashing on screen before being hidden.

## Conclusion
`AccessGuard.js` serves its role as a client-side UX guide effectively. However, it must not be considered a security boundary. The most critical recommendation from this audit is the implementation of server-side validation for any content that is considered genuinely restricted or sensitive. The complexity of the bypass systems should also be reviewed to reduce the system's attack surface and improve maintainability.
