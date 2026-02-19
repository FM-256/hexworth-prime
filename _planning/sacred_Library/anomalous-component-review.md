[STATUS: All issues remain unfixed.]
# Anomalous Component Review: FluxCapacitor.js

## Date
2026-02-08

## Subject
An architectural review of the `FluxCapacitor.js` component, an anomalously-named file identified during the initial component survey.

## Summary of Architecture and Purpose
*   **Purpose:** The component's documented purpose is "House Navigation System." It renders a floating global UI button that allows for quick navigation between the platform's main content sections ("houses").
*   **Architecture:** It is a self-contained, vanilla JavaScript module that dynamically injects its own CSS and DOM elements. It has no external library dependencies.
*   **Internal Data:** The component contains a hardcoded `HOUSES` array that defines the metadata and navigation paths for each house. It also contains its own logic for checking user access to restricted content.

## Key Findings & Recommendations

### 1. Data Duplication and Architectural Schism
*   **Finding (High Severity):** The component defines its own internal, hardcoded list of houses and their associated paths. This `HOUSES` array is a duplicate of the architectural data already defined in `_app/components/LearningPaths.js`. Maintaining two separate sources of truth for the same foundational data is a critical anti-pattern that leads to data drift, synchronization bugs, and a brittle architecture. A change in `LearningPaths.js` will not be reflected here, and vice-versa.
*   **Recommendation:** The hardcoded `HOUSES` array **must be removed** from `FluxCapacitor.js`. The component should be refactored to source its data from the authoritative `LearningPaths.PATHS` object. This will create a single, unified source for the platform's content structure.

### 2. Decentralized Logic
*   **Finding (Medium Severity):** The component implements its own logic for checking user entitlements by directly accessing `localStorage` keys (e.g., `dark_arts_unlocked`, `hexworth_house_hopper`). This logic is a duplicate of functionality that is already centralized within the `AccessGuard.js` component. Scattering security and access control logic across multiple files makes the system difficult to audit and increases the risk of introducing inconsistencies.
*   **Recommendation:** All calls to `localStorage` for access control checks should be removed from this component. Instead, it should be refactored to call the public methods provided by `AccessGuard.js` (e.g., `AccessGuard.hasPassedGatesUpTo()`, `AccessGuard.isHouseHopper()`) to determine user permissions.

### 3. Obscure Naming
*   **Finding (Low Severity):** The filename `FluxCapacitor.js` provides no context as to the component's function, harming code discoverability and maintainability for new developers.
*   **Recommendation:** The file should be renamed to accurately reflect its purpose, such as `HouseNavigator.js` or `GlobalNavigation.js`.

## Conclusion
`FluxCapacitor.js` is a functionally well-executed UI component. However, its implementation introduces significant architectural debt by creating a second source of truth for core curriculum data and by decentralizing access control logic. The highest priority recommendation is to refactor this component to consume data and decisions from the existing, authoritative `LearningPaths.js` and `AccessGuard.js` components.
