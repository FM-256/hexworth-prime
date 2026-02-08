# ISSUE-010: Content Missing from SAMPLE_MODULES (registryOnly)

**Created:** December 29, 2025
**Status:** CLOSED - Complete (27 entries across 4 houses)
**Closed:** December 29, 2025
**Severity:** Low (Content in registry but not in house index)
**Source:** Content Audit

---

## Problem

27 content items exist in ContentRegistry but not in SAMPLE_MODULES. These items appear in Matrix Terminal but may not show in house index pages.

## Affected Items by House

| House | Count | Items |
|-------|-------|-------|
| web | 1 | web-troubleshooting |
| cloud | 6 | cloud-architecture, cloud-aws-support, cloud-aws-regions, cloud-aws-ec2, cloud-aws-automation, cloud-aws-use-cases |
| script | 13 | script-clh-001 through clh-011, script-python-files, script-package-management |
| code | 7 | code-git-basics, code-docker, code-kubernetes, code-terraform, code-cloudformation, code-cicd, code-agile |

## Fix Required

Add entries to SAMPLE_MODULES array in each house's index.html file.

---
