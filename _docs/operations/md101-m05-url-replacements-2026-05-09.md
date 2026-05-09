# MD-101 Module 05 — Dead URL Replacements

**Date:** 2026-05-09
**Source audit:** `~/hexworth-shared/Solutions/_audit/karl-citation-audit-md101-m05.md` (Karl Mode-1)
**Status:** Replacement URLs researched; operator-ready for Confluence v-bump
**Companion:** `md101-m06-url-replacements-2026-05-09.md` (m06 dead URLs from same Pattern E batch)

## Scope

Karl's m05 audit returned MIXED with 3 DENY (Q2, Q3, Q14) + 1 REJECT (Q12). All Pattern E (Microsoft Learn doc-restructure between April 2026 and audit date). This doc captures canonical replacements verified via WebFetch on 2026-05-09.

The 6 WEAK findings (Q5, Q6, Q8, Q9, Q13, Q15) are anchor-absent on long pages — fixable by adding `#section-id` anchors but NOT URL changes; out of scope here.

## Replacement table

| Q | Old URL (issue) | New canonical URL | Anchor recommendation | Notes |
|---|---|---|---|---|
| Q2 | `/windows/security/identity-protection/hello-for-business/hello-why-pin-is-better-than-password` (404) | `/windows/security/identity-protection/hello-for-business/` | `#benefits` or `#windows-hello-and-two-factor-authentication` | Dedicated PIN-vs-password article was deprecated. WHfB overview supports MOST of the original claim ("PIN never leaves the device", "credentials asymmetric, generated within isolated TPM environments", "two-factor authentication: device-specific credential + biometric/PIN gesture") but NOT the explicit contrast "while a password can be used from any device". **Operator should rephrase the Q2 claim** to drop the password-portability framing — not just swap the URL. |
| Q3 | `/entra/identity/authentication/concept-authentication-passwordless` (redirects to `concept-authentication-passkeys-fido2`, missing 3-methods list) | `/entra/identity/authentication/overview-authentication` | `#phishing-resistant-authentication-methods` | "Microsoft Entra authentication overview" page has a section that explicitly says: "Microsoft recommends using phishing-resistant authentication methods such as Windows Hello for Business, passkeys (FIDO2) and FIDO2 security keys, or certificate-based authentication" + a bulleted list. Direct match for the "three recommended passwordless methods" claim. **Anchor required** — the section is mid-page. |
| Q14 | Same dead URL as Q3 | Same as Q3 (`overview-authentication#phishing-resistant-authentication-methods`) | `#phishing-resistant-authentication-methods` | Q3 and Q14 reuse the same broken citation. Same fix applies. |
| Q12 (REJECT) | `/windows/security/hardware-security/tpm/tpm-fundamentals` (URL works but content miscited — TPM page doesn't cover Device Health Attestation) | `/windows/security/operating-system-security/system-security/protect-the-windows-boot-process` (or DHA-specific page if preferred) | none recommended; full page is on-topic | Karl's REJECT was content-mismatch, not URL-dead. The TPM Fundamentals page describes TPM hardware, not the DHA workflow (boot measurement → TPM PCR → attestation service → compliance signal). **Operator must select** a DHA-dedicated page; this is content judgment, not a mechanical swap. |

## Verification methodology

For each old URL:
1. WebFetch to candidate new URL
2. Confirm HTTP 200 (no 404 or redirect chain mismatch)
3. Inspect `canonicalUrl` metadata
4. Verify content matches original Karl claim
5. Identify section anchor if relevant content is mid-page

Q3/Q14 had the strongest match — the new "overview-authentication" page directly matches the "three recommended passwordless methods" claim and even uses the phrase "Microsoft recommends... such as Windows Hello for Business, passkeys (FIDO2) and FIDO2 security keys" verbatim.

Q2 is the trickiest — Microsoft Learn no longer has a dedicated PIN-vs-password page. Karl's recommendation (rephrase the claim to match what the WHfB overview says) is correct and unavoidable. Operator must edit the rationale prose, not just the URL.

Q12 is content-judgment. Karl flagged it as REJECT not DENY because the URL works — it's a wrong-page-for-claim issue. Operator should consider the boot-process page suggested above OR find a Defender for Endpoint DHA documentation page that better matches the question's specific framing.

## Operator action plan

### Phase 1 — Confluence page edit (MD-101 Module 05)

For each of Q2/Q3/Q12/Q14:

1. Replace cited URL with new canonical URL above
2. Append the recommended anchor where applicable
3. Update the "Tier:" classification (all remain Vendor Official Microsoft Learn — no tier change)
4. Update "Verifying quote:" to a quote that actually appears on the new page
5. **Q2 specifically**: edit the rationale prose to drop "while a password can be used from any device" framing OR cite a separate authority for password portability (NIST SP 800-63B is one option for the cross-device-reuse risk)
6. **Q12 specifically**: select an actual DHA documentation page; the boot-process page covers the boot-integrity foundation but a Defender-for-Endpoint or Intune compliance DHA page may be more direct
7. Bump page version

### Phase 2 — Re-audit

After Confluence v-bump, dispatch Karl Mode-1. Expected: PASS for Q2 (post-rephrase), Q3, Q14. Q12 verdict depends on operator's selected DHA page.

## Why this matters

8 DENY + 2 REJECT findings across MD-101 m04/m05/m06 are blocking the entire MD-101 series. This doc + the m06 doc cover the dead-URL DENYs. The Q8 m06 REJECT (WIP-modes parenthetical) and Q12 m05 REJECT (TPM/DHA mismatch) are **rationale fixes**, not URL fixes. The 6 m05 WEAKs and 9 m06 WEAKs are **anchor-improvement** work. Across the series, the operator path is:

1. URL swaps (this doc + m06 doc): 7 swaps total — mechanical
2. Rationale edits (Q8 m06, Q12 m05, Q2 m05): 3 prose edits — content judgment
3. Anchor improvements (15 WEAK across m04+m05+m06): 15 small URL appends — mechanical

After all three phases ship, all 3 modules should reach PASS or near-PASS verdicts.

## Out of scope

- m04 anchor improvements (7 WEAK, no DENY) — separate doc not needed; mechanical anchor adds
- General Microsoft Learn URL-watch infrastructure (e.g., periodic link-check CF) — design Q for separate sprint

## Architecture refs

- Karl agent: `~/.claude/agents/karl.md`
- Quiz Solutions Manual Architecture: Confluence
- Pattern E (MS Learn doc-restructure) — `solutions-manual-quality-2026-05-09.md`
- Companion m06 doc: `md101-m06-url-replacements-2026-05-09.md`
