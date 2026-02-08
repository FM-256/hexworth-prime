# ISSUE-009: Content Missing from ContentRegistry (sampleOnly)

**Created:** December 29, 2025
**Status:** CLOSED - Complete (8 of 9 added, 1 skipped)
**Closed:** December 29, 2025
**Severity:** Medium (Content exists but not searchable)
**Source:** Content Audit

---

## Problem

9 content items exist in SAMPLE_MODULES but not in ContentRegistry. These items won't appear in Matrix Terminal search or filters.

## Affected Items

| House | ID | Title |
|-------|-----|-------|
| shield | cse-06-monitoring | CSE: Security Monitoring & IR |
| shield | cse-07-risk | CSE: Risk Assessment & Management |
| shield | cse-08-compliance | CSE: Compliance & Governance |
| shield | cse-06-quiz | CSE: Security Monitoring Quiz |
| shield | cse-07-quiz | CSE: Risk Management Quiz |
| shield | cse-08-quiz | CSE: Compliance Quiz |
| code | code-unit-testing | Unit Testing |
| key | key-tls-ssl | TLS/SSL Explained |
| eye | eye-soc-simulator | SOC Simulator |

## Fix Required

Add entries to `_app/config/content-registry.js` for each item.

---

*Awaiting assignment*
