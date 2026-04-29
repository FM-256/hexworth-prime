/* ============================================================
   CSE-L08 — The Backdoor
   SecureLayer Engagement at FuelGrid

   All company names, personnel titles, subscriber figures,
   incident dates, and dollar figures in this lab are entirely
   fictional and are used for instructional purposes only. Any
   resemblance to real organizations or incidents is coincidental.

   Red herrings: E9 (old penetration testing report from a
   different client — prior work product, no bearing on the
   FuelGrid disclosure question) and E10 (FuelGrid IT helpdesk
   ticket queue — operational noise with no connection to the
   SCADA backdoor finding or the reporting obligation).
   ============================================================ */

window.CSEL08Config = {
    id: 'cse-l08',
    title: 'The Backdoor',
    subtitle: 'SecureLayer Engagement at FuelGrid',
    course: 'CIS2253',
    week: 4,
    chapter: 6,
    duration: 30,
    accent: '#ff00ff',

    // ── Phase 1: Brief ──────────────────────────────────────
    brief: {
        type: 'memo',
        from: 'You (Lead Security Engineer, SecureLayer)',
        to: 'SecureLayer Engagement Steering Committee',
        date: 'September 2025',
        classification: 'PRIVILEGED — ATTORNEY-CLIENT WORK PRODUCT',
        content: 'I am writing to brief the Steering Committee on a material finding from the FuelGrid security assessment engagement and to request guidance on next steps. This memo should be treated as attorney-client privileged work product pending the committee\'s review.\n\nBackground: SecureLayer was engaged by FuelGrid — a mid-size electric utility serving approximately 2.4 million residential customers across two states — to conduct a comprehensive security assessment of their operational technology environment, including their SCADA systems. The engagement is governed by a signed services agreement that includes a confidentiality clause and a legal-compliance carve-out.\n\nThe Finding: During the assessment, I identified an undisclosed access mechanism embedded in the GridSoft SCADA management software installed at FuelGrid\'s primary and backup control facilities. GridSoft is FuelGrid\'s SCADA vendor. The mechanism uses hardcoded credentials that are not documented in any FuelGrid system configuration record and bypass normal authentication. My analysis indicates this mechanism was inserted by GridSoft as a remote diagnostics capability — it appears in the vendor\'s service code and communicates with GridSoft\'s infrastructure when active.\n\nThis feature was not disclosed to FuelGrid in the procurement documentation and is not referenced in the vendor\'s technical specifications provided to us as part of the assessment package. FuelGrid\'s CISO confirmed she was unaware of its existence.\n\nClient Response: I disclosed the finding to the FuelGrid CEO in a preliminary briefing. His response was to request that we not disclose this finding publicly: "This would crater confidence in the grid and we have a regulatory hearing in six weeks." He asked that we complete the engagement as scoped without formalizing this finding in a way that would require external reporting.\n\nVendor Response: SecureLayer\'s General Counsel contacted GridSoft. GridSoft has threatened to revoke FuelGrid\'s support contract if the finding is disclosed outside the engagement.\n\nThe Steering Committee should be aware that the Cyber Incident Reporting for Critical Infrastructure Act imposes mandatory reporting obligations to CISA for covered incidents at critical infrastructure entities. Whether this finding constitutes a covered incident under the applicable definition is a question our General Counsel is reviewing, but the issue is at minimum adjacent. Our engagement contract\'s legal-compliance carve-out may be triggered.\n\nI am requesting the committee\'s guidance before I take any further action. I have attached the relevant evidence for your review.',
    },

    // ── Phase 2: Evidence Artifacts ─────────────────────────
    // 10 total. E9 and E10 are red herrings.
    evidence: [
        {
            id: 'E1',
            type: 'data',
            title: 'Technical Write-Up — Backdoor Mechanism (High-Level)',
            date: '2025-09-08',
            isRedHerring: false,
            content: 'SECURELAYER TECHNICAL MEMORANDUM — RESTRICTED\nEngagement: FuelGrid OT Security Assessment\nSubject: Undisclosed Vendor Access Mechanism — Preliminary Findings\n\nSummary of mechanism: A persistent access pathway was identified in the GridSoft SCADA management layer deployed at FuelGrid\'s primary and backup control facilities. The mechanism operates at the authentication layer: hardcoded credentials embedded in the vendor service module allow remote authentication to the management interface without passing through FuelGrid\'s configured identity provider.\n\nAuthentication bypass characteristics: The hardcoded credentials are not present in any FuelGrid configuration record, user directory, or policy document reviewed during the assessment. They appear in the vendor service binary. When active, the module initiates outbound communication to a GridSoft-owned network address range, consistent with a remote diagnostics or telemetry function.\n\nScope of access: Preliminary analysis indicates the access pathway, if exploited, would provide management-level access to SCADA control functions. The extent to which this access could affect operational technology (OT) functions — including those governing grid stability — has not been fully characterized and would require additional analysis that SecureLayer has not conducted.\n\nNote: This write-up intentionally omits exploitation-specific technical details to prevent misuse. It describes the mechanism at the level sufficient for disclosure and remediation planning without serving as an exploitation guide.'
        },
        {
            id: 'E2',
            type: 'legal',
            title: 'Engagement Contract Excerpts — Confidentiality and Legal-Compliance Carve-Out',
            date: '2025-06-15',
            isRedHerring: false,
            content: 'SECURELAYER PROFESSIONAL SERVICES AGREEMENT — EXCERPTS\nClient: FuelGrid Energy Corp.\nEffective Date: June 15, 2025\n\nSection 7.1 — Client Confidentiality\nSecureLayer agrees to treat all Client information, system documentation, and assessment findings as confidential and proprietary. SecureLayer will not disclose assessment findings to any third party without prior written authorization from Client, except as provided in Section 7.3.\n\nSection 7.3 — Legal Compliance Carve-Out\nNotwithstanding Section 7.1, SecureLayer is not prohibited from making disclosures required by applicable law, regulation, or valid legal process. If SecureLayer determines in good faith that a disclosure obligation exists under applicable law, SecureLayer will provide Client with reasonable advance notice of the intended disclosure to the extent permitted by law, and will limit the disclosure to the minimum scope required to satisfy the legal obligation.\n\nSection 7.4 — Professional Standards\nNothing in this Agreement limits SecureLayer\'s obligation to comply with applicable professional standards and ethical codes governing the practice of information security. Client acknowledges that SecureLayer\'s professional obligations may, in limited circumstances, require actions that would otherwise be restricted by Section 7.1.\n\nNote: The legal-compliance carve-out in Section 7.3 and the professional standards provision in Section 7.4 are potentially triggered by the CIRCIA-adjacent reporting question identified in this engagement.'
        },
        {
            id: 'E3',
            type: 'testimony',
            title: 'FuelGrid CEO Statement — Non-Disclosure Request',
            date: '2025-09-09',
            isRedHerring: false,
            content: 'PARAPHRASED ACCOUNT OF VERBAL STATEMENT\nSource: FuelGrid CEO, communicated in preliminary findings briefing\nDate: September 9, 2025\n\nThe FuelGrid CEO received the preliminary findings briefing and responded as follows (paraphrased from notes taken by SecureLayer Lead Engineer):\n\n"I appreciate you bringing this to me directly. I want to be very clear about where FuelGrid stands. We have a regulatory hearing in six weeks before the state utility commission on an unrelated rate case. If this finding becomes public — or if it ends up in a CISA disclosure — it will crater confidence in the grid, affect our regulatory proceeding, and cause exactly the kind of public concern we are trying to avoid. I am asking you, as a professional, to complete the engagement as scoped and allow us to manage this situation internally. We will remediate. We will address it. But we need to do it on our timeline and in a way that does not create a public event."\n\nWhen asked directly about the regulatory hearing and whether it influenced his position, the CEO said: "Yes, the timing is terrible. I won\'t pretend otherwise. But my obligation is to my customers and to the stability of the grid. Public panic does not help either."\n\nNote: The CEO did not provide a specific remediation timeline or a written commitment to address the finding.'
        },
        {
            id: 'E4',
            type: 'legal',
            title: 'GridSoft Contractual Threat — Support Contract Revocation',
            date: '2025-09-11',
            isRedHerring: false,
            content: 'PARAPHRASED ACCOUNT OF COMMUNICATION FROM GRIDSOFT\nSource: GridSoft Legal Department, communicated to SecureLayer General Counsel via telephone\nDate: September 11, 2025\n\nGridSoft\'s legal representative contacted SecureLayer\'s General Counsel following SecureLayer\'s inquiry about the undisclosed access mechanism. GridSoft\'s position as communicated:\n\n"The feature in question is a standard remote diagnostics capability included in GridSoft\'s enterprise service tier. It is described in GridSoft\'s internal service documentation, which is available to customers who have signed our service-tier addendum. We are confident FuelGrid\'s procurement team had access to this documentation. The feature is not a security vulnerability — it is a vendor service capability.\n\nGridSoft considers any external disclosure of this feature\'s existence — to CISA, to regulatory bodies, or to the public — to be a disclosure of GridSoft\'s proprietary technical information in breach of FuelGrid\'s vendor agreement. If SecureLayer participates in or facilitates such a disclosure, GridSoft will treat this as cause to immediately revoke FuelGrid\'s support contract under the breach-of-confidentiality provisions of that agreement. GridSoft will also assess its legal options with respect to SecureLayer directly.\n\nGridSoft strongly recommends that SecureLayer complete its engagement as contracted and allow FuelGrid and GridSoft to address any service documentation questions through normal vendor channels."\n\nNote: GridSoft\'s claim that the feature is "described in GridSoft\'s internal service documentation" is inconsistent with FuelGrid\'s CISO\'s statement that she was unaware of the feature and with the absence of any reference to the feature in the procurement documentation provided to SecureLayer.'
        },
        {
            id: 'E5',
            type: 'legal',
            title: 'CIRCIA — Paraphrased Provisions on Covered Incidents',
            date: '2022-03-15',
            isRedHerring: false,
            content: 'PARAPHRASED SUMMARY — Cyber Incident Reporting for Critical Infrastructure Act (2022)\nSource: Public law text and CISA implementation guidance (paraphrased for instructional use)\n\nThe Cyber Incident Reporting for Critical Infrastructure Act of 2022 (CIRCIA) established mandatory reporting obligations for covered cyber incidents affecting critical infrastructure entities. Key provisions as paraphrased:\n\n(1) Covered entities: Critical infrastructure entities in sectors designated by CISA, including the energy sector. Electric utilities of the type described in this case would generally fall within the covered-entity definition.\n\n(2) Covered incidents: A covered cyber incident includes a substantial loss of confidentiality, integrity, or availability of an information system, or a serious impact on the safety and resiliency of operational systems. The discovery of an undisclosed vendor access mechanism with management-level access to SCADA controls may meet this definition, particularly given the potential impact on grid stability.\n\n(3) Reporting obligation: Covered entities must report covered incidents to CISA within the timeframes established in implementing regulations. Security consultants who discover incidents in the course of their work operate in a zone of CIRCIA-adjacent obligation — the primary reporting obligation falls on the covered entity (FuelGrid), but a consultancy with knowledge of an unreported incident faces its own professional and potential legal exposure.\n\n(4) CISA\'s role: CISA is authorized to use reported information to develop advisories, share threat information across the sector, and coordinate response. Reports made in good faith are protected from certain legal liability.\n\nNote: Whether this specific finding rises to a "covered incident" under the implementing regulations is a legal question. The CIRCIA-adjacent framing reflects the legal team\'s assessment that the issue is at minimum within the zone of the statute\'s intent.'
        },
        {
            id: 'E6',
            type: 'data',
            title: 'FuelGrid Published Cybersecurity Posture — Contradiction with Findings',
            date: '2025-03-01',
            isRedHerring: false,
            content: 'FUELFRID ENERGY CORP. — ANNUAL SECURITY REPORT (PUBLIC, EXCERPT)\nTitle: "Commitment to Grid Security: FuelGrid\'s 2024 Cybersecurity Posture"\n\nFuelGrid\'s SCADA and operational technology environment is protected by a layered security architecture developed in accordance with NERC CIP requirements. Key controls include:\n\n— All remote access to SCADA management interfaces requires multi-factor authentication through our enterprise identity provider\n— Vendor remote access is governed by our third-party access policy, which requires documented authorization, time-limited sessions, and audit logging\n— Our vendor management program requires disclosure of all remote diagnostic capabilities in procurement documentation prior to contract execution\n— We conduct annual third-party security assessments of our OT environment\n\nNote: The undisclosed GridSoft access mechanism is directly inconsistent with three of the four controls FuelGrid published in this report. The hardcoded credentials bypass the enterprise identity provider. The access is not documented in any FuelGrid authorization record. The feature was not disclosed in procurement documentation. FuelGrid\'s published security posture describes a state of control that does not reflect the actual configuration of their SCADA environment — a gap with regulatory and reputational implications independent of the CIRCIA reporting question.'
        },
        {
            id: 'E7',
            type: 'news',
            title: 'Peer Utility CIRCIA Reporting Case — Sanitized',
            date: '2024-11-20',
            isRedHerring: false,
            content: 'SANITIZED CASE SUMMARY — Peer Utility CIRCIA-Adjacent Reporting Decision\nSource: Industry information-sharing forum (anonymized per forum rules)\n\nA mid-size regional electric utility (anonymized) discovered an undisclosed access pathway in a SCADA component during a routine vendor audit. The utility\'s security team engaged outside counsel and determined that the finding met the CIRCIA covered-incident threshold. The utility reported to CISA within the required window.\n\nOutcome and lessons observed by forum participants:\n\n(1) CISA\'s response was coordinated and non-punitive. CISA issued a sanitized advisory to the sector based on the report, which identified the affected vendor component and recommended mitigations. The advisory did not identify the reporting utility.\n\n(2) The vendor whose component was involved disputed the characterization of the access pathway as a "vulnerability" and threatened contractual action. The utility\'s legal team determined that CIRCIA\'s liability protections for good-faith reporting insulated the utility from the vendor\'s threatened claims.\n\n(3) The utility\'s regulatory relationship with the state commission was not materially affected. Commission staff were briefed privately in advance of the CISA disclosure; the utility\'s proactive handling of the issue was noted favorably.\n\n(4) Forum participants noted that the utility\'s decision to report was influenced by the gap between its published security posture and its actual configuration — a gap the utility\'s leadership concluded would be worse to defend if discovered externally than to disclose proactively.\n\nNote: This case is anonymized and is presented as a reference point, not as a controlling precedent.'
        },
        {
            id: 'E8',
            type: 'policy',
            title: 'CSF PR.IP-12 — Vulnerability Management Plan',
            date: '2024-02-26',
            isRedHerring: false,
            content: 'PARAPHRASED PROVISION — NIST Cybersecurity Framework, PR.IP-12\nSource: NIST CSF 2.0 (paraphrased for instructional use)\n\nA vulnerability management plan is developed and implemented. This provision establishes that organizations responsible for critical systems should maintain a documented process for identifying, evaluating, and remediating vulnerabilities in their technology environment, including vulnerabilities introduced by vendor-supplied components.\n\nKey implications for this case:\n\n(1) FuelGrid, as the operator of critical infrastructure, has an obligation under CSF PR.IP-12 to have a vulnerability management plan. The discovery of the GridSoft access mechanism is a finding that should be processed through that plan — regardless of the vendor\'s characterization of the feature.\n\n(2) SecureLayer, as the security consultancy conducting the assessment, has a professional obligation to produce findings in a form that FuelGrid can act on through its vulnerability management process. Suppressing or de-formalizing the finding would undermine the purpose of the assessment.\n\n(3) Vulnerability management plans typically include provisions for escalation when a finding exceeds the organization\'s remediation capacity or carries regulatory implications. The CIRCIA-adjacent question in this case is exactly the kind of escalation trigger a mature vulnerability management plan should address.\n\nNote: This provision is paraphrased from the NIST CSF 2.0 framework. It is not a legal mandate but reflects the professional standard of care for organizations and consultants operating in the critical infrastructure security space.'
        },
        {
            id: 'E9',
            type: 'data',
            title: 'Prior Penetration Testing Report — Different Client (Unrelated)',
            date: '2024-04-30',
            isRedHerring: true,  // Red herring: prior work product from a different engagement; has no bearing on the FuelGrid finding, the reporting obligation, or the ethical analysis
            content: 'SECURELAYER PENETRATION TESTING REPORT — SUMMARY\nClient: [Redacted — Different Client]\nEngagement Date: April 2024\n\nThis report summarizes findings from a black-box penetration test conducted for a regional water utility. Key findings included three high-severity vulnerabilities in the client\'s web-facing administrative portal and one medium-severity misconfiguration in their OT network segmentation.\n\nAll findings were disclosed to the client within the engagement timeline. The client remediated all high-severity findings within 45 days of final report delivery. SecureLayer issued a remediation verification report confirming closure of all identified issues.\n\nNote: This report is from a separate engagement with a different client and is included in the document set as background on SecureLayer\'s standard engagement workflow. It has no bearing on the FuelGrid finding or the disclosure question at issue in this case. It is included here as context only.'
        },
        {
            id: 'E10',
            type: 'data',
            title: 'FuelGrid IT Helpdesk Ticket Queue — Recent Submissions',
            date: '2025-09-01',
            isRedHerring: true,  // Red herring: routine IT operational tickets; none relate to the SCADA backdoor finding or the reporting obligation
            content: 'FUELFRID IT HELPDESK — OPEN TICKET SUMMARY (EXCERPT)\nGenerated: September 1, 2025\n\nOpen tickets by category:\n— Password reset requests: 47\n— VPN connectivity issues: 12\n— Email/calendar access: 31\n— Printer and peripheral support: 8\n— Software installation requests: 14\n— Hardware replacement requests: 6\n— Network connectivity (corporate): 9\n\nRecent notable tickets:\n— TKT-2025-4821: User unable to access shared drive from remote location (resolved)\n— TKT-2025-4892: Corporate email latency reported by executive assistants (under investigation)\n— TKT-2025-4901: Request to provision new employee laptop (in progress)\n\nNote: The FuelGrid IT helpdesk ticket queue reflects routine corporate IT operations. None of the open or recently closed tickets relate to the SCADA environment, the GridSoft management interface, or the undisclosed access mechanism. This document is included as operational background and has no bearing on the ethical or legal analysis of the backdoor finding.'
        }
    ],

    // ── Phase 3: Stakeholders ───────────────────────────────
    stakeholders: [
        {
            id: 'S1',
            name: 'You (Lead Security Engineer, SecureLayer)',
            obvious: true
        },
        {
            id: 'S2',
            name: 'SecureLayer Leadership and the Engagement Steering Committee',
            obvious: true
        },
        {
            id: 'S3',
            name: 'FuelGrid CEO',
            obvious: true
        },
        {
            id: 'S4',
            name: 'FuelGrid Customers — 2.4 Million Residential',
            obvious: true
        },
        {
            id: 'S5',
            name: 'GridSoft (SCADA Vendor)',
            obvious: true
        },
        {
            id: 'S6',
            name: 'CISA (Cybersecurity and Infrastructure Security Agency)',
            obvious: false
        },
        {
            id: 'S7',
            name: 'State or Federal Utility Regulator with Jurisdiction over FuelGrid',
            obvious: false
        },
        {
            id: 'S8',
            name: 'A Hostile State Actor Who Might Exploit the Backdoor',
            obvious: false
        },
        {
            id: 'S9',
            name: 'FuelGrid Employees Including Their CISO',
            obvious: false
        },
        {
            id: 'S10',
            name: 'The Broader Critical-Infrastructure Security Community',
            obvious: false
        },
        {
            id: 'S11',
            name: 'The Next Consultancy Who Finds Something Similar and Looks to This Case as Precedent',
            obvious: false
        },
        {
            id: 'S12',
            name: 'Congressional Oversight on Critical-Infrastructure Security',
            obvious: false
        },
        { id: 'S13', name: 'FuelGrid Corporate Cafeteria Contractor', obvious: false, irrelevant: true },
        { id: 'S14', name: 'SecureLayer Marketing Team', obvious: false, irrelevant: true }
    ],
    minStakeholders: 4,

    // ── Phase 3: Decisions ──────────────────────────────────
    decisions: [
        {
            id: 'D1',
            text: 'Report the finding to CISA under the CIRCIA-adjacent framework, then notify FuelGrid that you have reported, then withdraw from the engagement — treating the public-safety obligation as primary and the client relationship as secondary.',
            framework: 'deontological'
        },
        {
            id: 'D2',
            text: 'Demand that FuelGrid commit to a written remediation plan and begin mitigation within 30 days; if they do not comply, escalate to CISA — giving the client a structured opportunity to do the right thing before external reporting.',
            framework: 'virtue'
        },
        {
            id: 'D3',
            text: 'Withdraw from the engagement quietly and let FuelGrid manage the situation; do not report to CISA — protecting SecureLayer from the liability and reputational exposure of an active disclosure dispute.',
            framework: 'utilitarian-personal'
        },
        {
            id: 'D4',
            text: 'Comply with FuelGrid\'s non-disclosure preference; complete the engagement as scoped; document your concerns in your internal file but take no external action — deferring to client autonomy and the limits of your contractual mandate.',
            framework: 'consequentialist'
        }
    ],

    // ── Phase 4: Framework Challenges ──────────────────────
    frameworkChallenges: {
        'D1': {
            supporting: 'A deontological analysis grounded in professional duty and public obligation provides strong support for D1. SecureLayer\'s professional standards on disclosure (referenced in the engagement steering committee memo) treat the public interest as a duty that cannot be contracted away. The legal-compliance carve-out in Section 7.3 of the engagement contract (E2) explicitly preserves SecureLayer\'s right to make disclosures required by applicable law — and the CIRCIA-adjacent analysis (E5) indicates that the reporting obligation is at least plausible. The deontological case is also grounded in the gap between FuelGrid\'s published security posture (E6) and its actual configuration: FuelGrid\'s customers are relying on representations that are false, and 2.4 million residential customers have no practical means to discover this on their own. The duty to report flows from the duty not to allow known harm to continue unreported when the affected parties cannot protect themselves.',

            challenging: 'A consequentialist challenge to D1 focuses on sequencing and outcomes. Reporting to CISA before giving FuelGrid any opportunity to remediate removes the client\'s ability to manage the disclosure in a way that minimizes public harm. The peer utility case (E7) illustrates a better-outcome path: the utility that reported proactively first briefed the state commission privately, coordinated with CISA, and secured a CISA advisory that did not identify the reporting entity. D1 as stated — report, then notify, then withdraw — provides no time for FuelGrid to coordinate its response, potentially creating exactly the public alarm the CEO warned against without the operational mitigation that would make the alarm less harmful. The deontological duty to report does not require the reporter to choose the sequencing most likely to maximize disruption.',

            incomplete: 'D1 does not specify what happens after the report. CISA receives the finding — then what? SecureLayer withdraws from the engagement, but the backdoor remains in place until GridSoft patches it or FuelGrid mitigates it independently. A complete analysis must address the gap between disclosure and remediation: who carries the technical remediation forward if SecureLayer withdraws? If the answer is "no one has a clear responsibility," then D1\'s public-safety rationale is partially undermined by the operational gap it creates. A deontological duty to report must be paired with an account of what happens after the report if the reporter exits the situation.'
        },
        'D2': {
            supporting: 'Virtue ethics supports D2 as the response most consistent with practical wisdom and professional integrity in a situation where the right outcome — remediation of a dangerous vulnerability — is not served by treating the client relationship as purely adversarial. A virtuous security engineer does not immediately escalate to regulators when a client expresses difficulty with a finding; she gives the client a structured, time-bounded opportunity to do what professional standards require. The 30-day remediation deadline is not leniency — it is a professionally reasonable window for a utility to develop and begin implementing a plan for a complex OT environment. Virtue ethics also supports D2\'s emphasis on a written commitment: good character requires that professional obligations be documented, not just verbally agreed to, particularly when the stakes include critical infrastructure security and a CIRCIA-adjacent reporting question.',

            challenging: 'A deontological challenge to D2 focuses on the gap between giving the client an opportunity to remediate and actually discharging the reporting obligation. If the backdoor is exploited during the 30-day window — by the hostile state actor identified as a stakeholder — the harm to 2.4 million customers will not be mitigated by the fact that SecureLayer followed a principled process. The CIRCIA framework (E5) establishes a reporting timeline measured in days, not months; a 30-day remediation condition before reporting may itself violate the spirit of the statute. There is also a practical objection: the FuelGrid CEO\'s response (E3) gives no indication that he will commit to a written remediation plan under pressure. D2 may simply be D4 with a 30-day delay if the client refuses to engage.',

            incomplete: 'D2 must specify what triggers escalation and who has authority to make that determination at SecureLayer. "If they do not comply, escalate to CISA" leaves open: what counts as compliance? A written plan that commits to remediation in twelve months? A plan that commits to remediation in thirty days? Does remediation mean patching the backdoor, notifying regulators, or both? A complete virtue ethics analysis must define the commitment threshold that constitutes genuine engagement, and must address whether the 30-day window is the right time frame given the severity of the finding and the CIRCIA-adjacent reporting obligation. The analysis must also address whether SecureLayer\'s obligation to CISA is conditioned on FuelGrid\'s cooperation or independent of it.'
        },
        'D3': {
            supporting: 'A utilitarian analysis focused narrowly on SecureLayer\'s interests can construct a case for D3. SecureLayer\'s exposure — contract dispute with FuelGrid, threatened legal action from GridSoft (E4), and the reputational risk of being the firm that triggered a public event at a utility — is concrete and immediate. The benefit of reporting is diffuse and probabilistic: the backdoor may not be exploited; FuelGrid may remediate on its own timeline; CISA may already have information about the GridSoft component from other sources. If SecureLayer withdraws quietly, it avoids the litigation risk, preserves its relationship with future utility clients who might fear a similar outcome, and exits a situation it did not create and cannot fully control.',

            challenging: 'The utilitarian case for D3 collapses under a complete accounting of consequences. SecureLayer knows about a management-level access pathway to SCADA controls at a utility serving 2.4 million customers. The hostile state actor stakeholder is not hypothetical — the threat landscape for critical infrastructure includes adversaries who actively seek exactly this type of undisclosed access. If the backdoor is exploited after SecureLayer withdrew with knowledge and did not report, the consequence is not just harm to FuelGrid\'s customers — it is the destruction of SecureLayer\'s professional standing, potential criminal and civil liability for withholding information about a known vulnerability in critical infrastructure, and the precedent that security firms can walk away from findings of this severity. The utilitarian calculus that supports D3 requires ignoring most of the affected parties and most of the relevant probabilities.',

            incomplete: 'D3 does not engage with the professional standards obligation embedded in Section 7.4 of the engagement contract (E2) or with Ethics FIRST\'s public-interest service duty, which the codes treat as paramount. Withdrawal without disclosure is not a neutral act — it is a choice to allow a known dangerous condition to persist. A complete analysis must address whether SecureLayer\'s professional codes permit quiet withdrawal from a situation of this severity, or whether they impose an obligation that cannot be discharged by simply leaving. The analysis must also engage with the peer utility case (E7), which demonstrates that reporting is feasible and that the outcomes SecureLayer fears — regulatory retaliation, client relationship damage — did not materialize for a comparable actor who handled the situation well.'
        },
        'D4': {
            supporting: 'A consequentialist analysis can support D4 on the grounds that client autonomy, when exercised by an informed principal about matters within their own operational domain, produces better long-term outcomes than external imposition. FuelGrid\'s CEO has been informed of the finding. He is not concealing it from the entity responsible for it — he is asserting that his organization will manage it on its own timeline. The consequentialist argument for D4 is that regulatory and public disclosure, initiated by SecureLayer over the client\'s objection, may produce worse outcomes than quiet remediation: public alarm that destabilizes the grid, a regulatory proceeding disrupted at a sensitive moment, and a vendor support contract revoked — leaving FuelGrid with a vulnerable SCADA system and no vendor support during the remediation window.',

            challenging: 'D4 requires SecureLayer to treat FuelGrid\'s CEO\'s preference as dispositive on a question that the engagement contract (E2) explicitly preserves SecureLayer\'s independent judgment to resolve. Section 7.4 provides that professional standards may require actions that override Section 7.1\'s confidentiality provisions. The CEO\'s preference is not a professional standard — it is a business preference, grounded in a specific regulatory timeline (E3), that conflicts with the public-interest service duty in Ethics FIRST and the CIRCIA-adjacent reporting framework (E5). There is also a temporal objection: FuelGrid\'s published security posture (E6) represents to customers, regulators, and the public that controls are in place that demonstrably are not. Every day that SecureLayer completes the engagement and documents its concerns internally is a day that the false representation continues with SecureLayer\'s implicit endorsement.',

            incomplete: 'D4\'s framing as "defer to client autonomy" mischaracterizes what is actually happening. FuelGrid\'s CEO is not exercising informed autonomy over a matter within his exclusive authority — he is asking SecureLayer to be silent about a condition that affects 2.4 million people who have no knowledge of it and no ability to protect themselves. A complete consequentialist analysis must account for all affected parties, not just the client. It must also address the CISA reporting mechanism (E5), which is specifically designed to allow coordinated disclosure that protects both the reporting entity and the public — a mechanism that D4 forecloses without engaging with its purpose or the protections it provides. Documenting concerns in an internal file satisfies no professional standard and protects no one.'
        }
    },

    // ── Phase 5: Code Provisions ────────────────────────────
    codeProvisions: [
        {
            code: 'Ethics FIRST',
            section: 'Coordinated Disclosure and Public-Interest Service',
            text: 'Security professionals have an obligation to disclose vulnerabilities in a coordinated manner that protects affected parties while ensuring that those responsible for remediation have the information they need to act. This obligation to public-interest service is treated as paramount in the professional codes — it is not discharged by completing a client engagement or by deferring to a client\'s preference for non-disclosure when the affected population extends beyond the client relationship. Security professionals must not weaponize findings, but silence in the face of known dangerous conditions is itself a choice that the codes do not permit without accountability.'
        },
        {
            code: 'GIAC',
            section: 'Lawfulness, Honesty, and Public Welfare',
            text: 'GIAC-certified professionals are obligated to act lawfully and honestly in the exercise of their duties, and to give appropriate weight to the public welfare in all professional decisions. Participation in an engagement whose findings are suppressed at the client\'s request — when those findings indicate a dangerous condition affecting a population that cannot protect itself — is inconsistent with the obligation to act honestly and to support public welfare. Professional certifications do not confer authority to exercise judgment in ways that systematically favor client interests over the interests of unrepresented affected parties.'
        },
        {
            code: 'CSF',
            section: 'PR.IP-12',
            text: 'A vulnerability management plan is developed and implemented. This provision establishes a professional standard of care requiring that vulnerabilities discovered in the course of a security engagement be formally documented and processed through an appropriate remediation workflow. A finding of the severity identified in this engagement — management-level access to SCADA controls at a critical infrastructure operator — must be formalized in the assessment output and tracked through a remediation process, regardless of the client\'s preference for informal handling. Informal documentation in a consultant\'s internal file does not constitute a vulnerability management plan.'
        }
    ],
    codeConflict: {
        provision1: 'Ethics FIRST — Coordinated Disclosure and Public-Interest Service',
        provision2: 'SecureLayer Engagement Contract — Client Confidentiality (Section 7.1)',
        conflictDescription: 'The engagement contract\'s client confidentiality clause (Section 7.1) creates a binding contractual duty to treat assessment findings as confidential and not to disclose them to third parties without client authorization. The FuelGrid CEO has explicitly withheld that authorization. From a contractual standpoint, SecureLayer\'s baseline obligation is silence.\n\nEthics FIRST\'s public-interest service duty creates a professional obligation that runs in the opposite direction. The codes treat public-interest service as paramount — meaning that when client confidentiality and public interest conflict, the professional obligation to the public is the higher duty. The 2.4 million residential customers who rely on FuelGrid\'s grid are not parties to the engagement contract and have no mechanism to assert their interest in the disclosure question. Ethics FIRST\'s coordinated disclosure provision is specifically designed to resolve exactly this tension: it provides a path to disclosure that protects the client relationship to the extent possible while ensuring that the public-safety obligation is not foreclosed by a contractual clause the public never agreed to.\n\nThe CEO\'s non-disclosure preference is the friction point. It is not a legal order, it is not supported by valid legal process, and it has not been reviewed by any authority with jurisdiction over the reporting obligation. The legal-compliance carve-out in Section 7.3 of the engagement contract is the mechanism that brings the two provisions into alignment: it preserves SecureLayer\'s ability to make legally required disclosures, and its applicability to this situation is precisely the question the Steering Committee must resolve. A complete analysis must engage with whether the CIRCIA-adjacent framework (E5) triggers the carve-out — and if it does, whether the confidentiality clause can be treated as operative at all.'
    },

    // ── Scoring Weights ─────────────────────────────────────
    scoring: {
        evidence:     20,
        stakeholder:  20,
        framework:    40,
        codeConflict: 20
    }
};
