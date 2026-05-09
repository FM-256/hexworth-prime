# MD-101 Module 06 — Dead URL Replacements

**Date:** 2026-05-09
**Source audit:** `~/hexworth-shared/Solutions/_audit/karl-citation-audit-md101-m06.md` (Karl Mode-1)
**Status:** Replacement URLs researched; operator-ready for Confluence v-bump

## Scope

Karl's m06 audit returned BLOCK with 4 DENY findings on dead URLs (HTTP 404). Microsoft has restructured several `/mem/intune/`, `/entra/`, and `/defender-endpoint/` namespaces. This doc captures the canonical replacement URLs verified via WebFetch on 2026-05-09.

Karl also flagged 1 REJECT (Q8 — content contradiction in rationale) and 9 WEAK (anchor-absent on long pages). Those are NOT URL replacement issues and are out of scope here. See Karl report for those.

## Replacement table

| Q | Old URL (dead) | New canonical URL | Anchor recommendation | Notes |
|---|---|---|---|---|
| Q1 | `https://learn.microsoft.com/en-us/mem/intune/protect/endpoint-security-overview` | `https://learn.microsoft.com/en-us/intune/device-security/endpoint-security-policies` | `#common-security-scenarios` | "Endpoint security in Microsoft Intune" — covers BitLocker disk encryption AND remote actions (key rotation, lock, retire) in different sections. The Q1 claim "BitLocker at-rest + Intune remote wipe" may benefit from splitting into 2 citations: this URL for endpoint-security-overview framing + Q2's `encrypt-bitlocker-windows` URL for BitLocker specifics. |
| Q3 | `https://learn.microsoft.com/en-us/entra/identity/devices/device-management-azure-portal` | `https://learn.microsoft.com/en-us/intune/device-configuration/endpoint-security/encrypt-bitlocker-windows` | `#view-recovery-keys-for-intune-managed-devices` | **Same canonical page as Q2** (the `encrypt-devices` URL in Q2 redirects here). The "Recovery key management > View recovery keys for Intune-managed devices" section explicitly documents BitLocker recovery key retrieval via Microsoft Entra integration in the Intune admin center. Karl had hinted at this — confirmed. |
| Q6 | `https://learn.microsoft.com/en-us/defender-endpoint/advanced-hunting-overview` | `https://learn.microsoft.com/en-us/defender-xdr/advanced-hunting-overview` | none (top of page) | "Overview - Advanced hunting - Microsoft Defender XDR". Direct match: "Advanced hunting is a query-based threat hunting tool... Microsoft Defender for Endpoint is one of the data sources." Microsoft moved the page from the `/defender-endpoint/` to `/defender-xdr/` namespace as part of the Defender XDR consolidation. |
| Q12 | `https://learn.microsoft.com/en-us/defender-endpoint/tvm-dashboard-insights` | `https://learn.microsoft.com/en-us/defender-vulnerability-management/tvm-dashboard-insights` | none (top of page) | "Microsoft Defender Vulnerability Management overview page". Same dashboard content — Microsoft renamed Threat & Vulnerability Management (TVM) to Defender Vulnerability Management and moved the namespace. The page still uses the `tvm-dashboard-insights` slug. |

## Verification methodology

For each old URL:
1. WebFetch to candidate new URL
2. Confirm HTTP 200 (no 404 or redirect chain)
3. Inspect `canonicalUrl` metadata (Microsoft Learn pages declare canonical URL in frontmatter)
4. Verify content matches original Karl claim (the topic the question was citing)
5. Identify section anchor if the relevant content is mid-page

All 4 URLs above resolved to HTTP 200 with content matching the original claim. Q1's match is partial (the new page covers the topic family but not the specific BitLocker+remote-wipe combo) — operator may choose to split that one citation into two narrower ones.

## Operator action plan

### Phase 1 — Confluence page edit (MD-101 Module 06)

Locate the Confluence page (id reference in Karl audit: page ID for `forge-md101-module-06`). For each Q1/Q3/Q6/Q12:

1. Replace the cited URL with the new canonical URL above
2. Append the recommended anchor where applicable
3. Update the "Tier:" classification — all 4 remain Vendor Official Microsoft Learn (no tier change)
4. Update "Verifying quote:" if the original quote no longer appears verbatim on the new page (Q1's WIP framing might need adjusting)
5. Bump page version

### Phase 2 — Re-audit

After Confluence v-bump, dispatch Karl Mode-1 on the updated page. Expected verdict: PASS for Q1/Q3/Q6/Q12 if the URLs + content + verifying quotes line up. WEAK if anchors aren't precise enough.

The other 9 WEAK findings (anchor-absent on long reference pages) and the 1 REJECT (Q8 WIP-modes parenthetical) need separate handling — see Karl report.

## Why this matters

8 DENY + 2 REJECT findings across MD-101 m04/m05/m06 are blocking the entire MD-101 series from Karl-PASS. Until the URLs are corrected, the Confluence pages are not shippable per the platform's Quiz Solutions Manual Architecture. The 4 m06 URL replacements documented here are the lowest-friction subset — pure URL swaps with no claim or quote changes for Q3/Q6/Q12 and a minor split-citation suggestion for Q1.

## Out of scope

- m05 dead URLs (3 DENY) and Q12 REJECT (TPM-DHA confusion) — separate doc needed
- m04 anchor improvements (7 WEAK, no DENY) — operator decides whether to add anchors or accept WEAK
- General Microsoft Learn URL-watch infrastructure (e.g., a periodic link-check CF) — design Q for separate sprint

## Architecture refs

- Karl agent: `~/.claude/agents/karl.md`
- Quiz Solutions Manual Architecture: Confluence
- Pattern E (MS Learn doc-restructure) — first identified this session in `solutions-manual-quality-2026-05-09.md`
