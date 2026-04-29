/* ============================================================
   CSE-L01 — The Governance Gap
   MidwestRail Holdings Cybersecurity Audit Configuration

   All names, entities, incident details, dollar figures, and
   dates in this file are fictional. MidwestRail Holdings does
   not exist. Any resemblance to a real organization is
   coincidental.

   NIST CSF anchor: ID.GV (Governance) — subcategories
   ID.GV-1 (cybersecurity policy established and communicated),
   ID.GV-2 (cybersecurity roles and responsibilities coordinated
   with internal roles and external partners), and ID.GV-3
   (legal and regulatory requirements understood and managed).

   Red herrings: E5 (a five-year-old NIST 800-53 control mapping
   that has since been superseded and does not apply to the
   current CSF v1.1 ID.GV subcategories at issue) and E9 (a
   marketing brochure describing MidwestRail's "world-class
   cybersecurity posture," which is a public-relations document
   with no probative value to the governance gap analysis).
   ============================================================ */

window.CSEL01Config = {
    id: 'cse-l01',
    title: 'The Governance Gap',
    subtitle: 'Mid-Audit at MidwestRail Holdings',
    course: 'CIS2253',
    week: 1,
    chapter: 1,
    duration: 30,
    accent: '#ff00ff',

    // ── Phase 1: Brief ──────────────────────────────────────
    brief: {
        type: 'memo',
        from: 'Internal Audit Committee',
        to: 'You (Senior Cybersecurity Audit Lead)',
        date: 'March 2026',
        classification: 'CONFIDENTIAL -- INTERNAL ONLY',
        content: 'You have been conducting MidwestRail Holdings\'s mandated annual cybersecurity audit for the past three weeks. MidwestRail is a regional rail freight operator publicly traded on a national exchange, which means its cybersecurity governance posture carries legal weight — not just operational weight.\n\nWhat you have found is not a gap. It is a collapse.\n\nThe organizational cybersecurity policy document, MR-SEC-POL-001, was last reviewed and signed approximately four years ago. Three of the five board-required quarterly security reviews mandated by the company\'s own governance charter were not held in the past twelve months. Meeting minutes for the two that were held show no substantive discussion of cybersecurity risk — they were quorum formalities. There is no documented incident-response runbook. The IR process exists as a series of informal tribal-knowledge handoffs between two senior engineers, one of whom retired last autumn.\n\nThree months ago, a ransomware staging payload was discovered on a network segment serving the rail management control systems. It was caught by a technician who happened to notice anomalous outbound traffic on a Friday afternoon. No escalation path existed. The technician called his manager\'s cell phone. The incident was contained, but there is no documented post-incident review. The systems that were affected had no owner listed in any asset register you can locate.\n\nThis week, when you raised concerns about the completeness of your audit scope — specifically, your need to review SCADA system documentation and the network segmentation diagrams for the rail operations layer — the CISO, Marcus Hale, sent you a revised scope memo narrowing your access. His justification was "operational sensitivity." In a follow-up call, he told you the board "doesn\'t want a deep dive this cycle." He has not provided this instruction in writing since your initial request.\n\nYour audit report is due to the Audit Committee by end of business Friday. Today is Tuesday. You have enough evidence to write a materially complete report of what you have found. You do not yet have everything you asked for.',
    },

    // ── Phase 2: Evidence Artifacts ─────────────────────────
    // 10 total. E5 and E9 are red herrings.
    evidence: [
        {
            id: 'E1',
            type: 'memo',
            title: 'MidwestRail Cybersecurity Policy MR-SEC-POL-001 -- Header and Review Log',
            date: '2022-01-14',
            isRedHerring: false,
            content: 'MIDWESTRAIL HOLDINGS — CYBERSECURITY POLICY\nDocument ID: MR-SEC-POL-001\nVersion: 2.3\nOwner: CISO\nApproved by: Board Audit Committee\nApproval Date: January 14, 2022\nNext Review Date: January 14, 2023\n\nREVIEW HISTORY:\n  v2.3 — January 2022 — Board-approved\n  v2.2 — November 2020 — Minor update to vendor access provisions\n  v2.1 — March 2019 — Initial SEC disclosure alignment\n\nSTATUS AS OF MARCH 2026: No review has been completed or scheduled since the January 2022 approval. The "Next Review Date" field has been overdue for more than three years. There is no record in the document management system of a review having been initiated, deferred, or waived. The policy document remains active by default.\n\nNote: NIST CSF ID.GV-1 requires that organizational cybersecurity policy be established, communicated, and reviewed on a defined schedule. MR-SEC-POL-001 contains a defined review cycle. That cycle has not been honored. The gap between the policy\'s stated schedule and reality is not a documentation error — it is evidence of a governance process that ceased to function.'
        },
        {
            id: 'E2',
            type: 'memo',
            title: 'Board Governance Charter -- Security Review Requirements',
            date: '2023-06-01',
            isRedHerring: false,
            content: 'MIDWESTRAIL HOLDINGS — BOARD OF DIRECTORS GOVERNANCE CHARTER\nSection 7: Cybersecurity Oversight\nAdopted: June 2023\n\nSection 7.2 — Quarterly Security Reviews: The Board of Directors, acting through the Audit Committee, shall convene no fewer than five (5) cybersecurity oversight sessions per fiscal year. Each session shall include a briefing from the CISO or a designated cybersecurity officer covering: (a) active threat landscape; (b) significant incident or near-miss review; (c) policy compliance status; and (d) remediation roadmap progress.\n\nSECTION 7.2 COMPLIANCE STATUS — FISCAL YEAR 2025:\n  Q1 review (March 2025): Held. Agenda: budget approval only. No CISO briefing on record.\n  Q2 review (June 2025): Not held. Quorum not achieved. No rescheduling documented.\n  Q3 review (September 2025): Not held. Meeting cancelled — no recorded reason.\n  Q4 review (December 2025): Held. Duration: 22 minutes. CISO briefing noted as "deferred to Q1 2026."\n  Annual review (February 2026): Not held.\n\nThree of five required reviews were not conducted. Of the two that were held, neither included a substantive cybersecurity briefing. The governance charter\'s requirements were met on paper for two quarters and not met at all for three.'
        },
        {
            id: 'E3',
            type: 'email',
            title: 'Ransomware Near-Miss Incident Summary -- December 2025',
            date: '2025-12-09',
            isRedHerring: false,
            content: 'FROM: Derek Okonkwo, Network Operations Technician\nTO: Raymond Spier, Network Operations Manager\nDATE: December 9, 2025\n\nRay, wanted to document what I found on Friday before I forget the details. Around 3:40 PM I noticed outbound HTTPS traffic to an address I didn\'t recognize on the segment that serves the RMC systems — the rail management control layer. I looked at the destination and it resolved to an ISP block in a country we don\'t do business with. I pulled the process and it was an executable sitting in a temp directory under the REMS service account.\n\nI killed the process, isolated the host, and called you. We pulled the host and it\'s been offline since. I ran strings on the binary and it looked like a loader. I don\'t know if it already phoned home or not. I don\'t know if there are other hosts.\n\nI tried to find the IR runbook to know what to do next and I couldn\'t find one. Sarah in IT said the last incident response process she remembers was from when she joined three years ago and she thinks it\'s out of date. I didn\'t know who to call for the SCADA systems. I called you.\n\nNote for audit: This incident was never formally escalated above the manager level. There is no documented post-incident review. The executable was preserved but has not been analyzed by a third party. The network segment affected serves systems that are listed in no asset register accessible to the audit team. The CISO was notified informally — there is no written notification on record.'
        },
        {
            id: 'E4',
            type: 'email',
            title: 'CISO Scope-Narrowing Memo -- March 2026',
            date: '2026-03-17',
            isRedHerring: false,
            content: 'FROM: Marcus Hale, Chief Information Security Officer\nTO: You (Senior Cybersecurity Audit Lead)\nDATE: March 17, 2026\nSUBJECT: Revised Scope for Annual Cybersecurity Audit\n\nAfter reviewing the data access requests submitted by your team last week, I am revising the scope of the current audit engagement as follows:\n\nREMOVED from scope: (1) SCADA system configuration documentation; (2) network segmentation diagrams for the rail operations layer; (3) vendor access logs for third-party maintenance contracts.\n\nREMAINS in scope: General IT infrastructure (non-operational), HR system access controls, physical access logs for the data center.\n\nJustification: The operational technology systems noted above contain sensitive infrastructure details that, if documented in a third-party audit report, could present a security risk in themselves. The board has indicated it does not wish to pursue a deep-dive engagement on OT systems this cycle.\n\nPlease proceed with the revised scope. Your report is due Friday.\n\nNote: This memo arrived after the audit team had already identified the December 2025 near-miss on the rail management control segment. The scope restriction eliminates precisely the visibility needed to assess whether the near-miss represented a contained incident or an ongoing exposure. The CISO has not provided any documentation of a board decision authorizing this scope restriction.'
        },
        {
            id: 'E5',
            type: 'data',
            title: 'MidwestRail 2021 NIST SP 800-53 Rev. 4 Control Mapping',
            date: '2021-03-10',
            isRedHerring: true,  // Red herring: This mapping was built against SP 800-53 Rev. 4, which was superseded by Rev. 5 in September 2020. It does not map to CSF v1.1 ID.GV subcategories and does not address the current governance gap question.
            content: 'MIDWESTRAIL HOLDINGS — NIST SP 800-53 REV. 4 CONTROL MAPPING\nPrepared by: External Consultant, March 2021\n\nThis document maps MidwestRail\'s then-current security controls to the NIST Special Publication 800-53 Revision 4 control catalog. At the time of preparation, the organization was assessed as meeting baseline requirements in the following control families: AC (Access Control), AU (Audit and Accountability), CM (Configuration Management), IA (Identification and Authentication).\n\nControl family PL (Planning) was assessed as "partially implemented" with noted gaps in policy currency and review cadence.\n\nNote: NIST SP 800-53 Revision 5 was finalized in September 2020, before this document was prepared. This mapping was built against the superseded Revision 4 control catalog. The control numbering, structure, and requirements differ substantially between revisions. Additionally, this document predates the current audit engagement by five years and does not reflect MidwestRail\'s current governance posture. It is not a valid baseline for assessing ID.GV compliance under CSF v1.1. Relying on this document to characterize current governance maturity would be methodologically incorrect.'
        },
        {
            id: 'E6',
            type: 'data',
            title: 'NIST CSF v1.1 -- ID.GV Subcategory Definitions',
            date: '2018-04-16',
            isRedHerring: false,
            content: 'SOURCE: NIST Cybersecurity Framework Version 1.1, April 2018\nFunction: IDENTIFY (ID)\nCategory: Governance (GV)\n\nID.GV-1: Organizational cybersecurity policy is established and communicated.\nInformative references include ISA 62443-2-1, ISO/IEC 27001 A.5.1.1, COBIT 5 APO01.03, and NIST SP 800-53 PM-1.\n\nID.GV-2: Cybersecurity roles and responsibilities for the entire workforce and third-party stakeholders (e.g., suppliers, customers, partners) are established.\nInformative references include ISA 62443-2-1 4.3.2.3.3, ISO/IEC 27001 A.6.1.1, COBIT 5 APO01.02.\n\nID.GV-3: Legal and regulatory requirements regarding cybersecurity, including privacy and civil liberties obligations, are understood and managed.\nInformative references include ISA 62443-2-1 4.4.3.7, COBIT 5 MEA03.01, NIST SP 800-53 AT-2.\n\nApplication to current audit: ID.GV-1 is directly implicated by the four-year policy review gap (E1). ID.GV-2 is directly implicated by the absence of documented IR roles and the undocumented SCADA system ownership (E3). ID.GV-3 is implicated by the absence of any documented mapping between MidwestRail\'s governance charter and its regulatory obligations as a publicly traded operator of freight infrastructure.'
        },
        {
            id: 'E7',
            type: 'data',
            title: 'No IR Runbook Found -- SharePoint Audit Trail',
            date: '2026-03-15',
            isRedHerring: false,
            content: 'SHAREPOINT DOCUMENT LIBRARY: IT Security / Incident Response\nAudit log excerpt — accessed March 15, 2026\n\nFolder: /ITSecurity/IncidentResponse/\nContents: [EMPTY — no files in this directory]\n\nFolder history:\n  2022-08-03: Folder created by Sandra Trask, IT Security Manager\n  2022-08-03: Document "IR-Runbook-DRAFT-v0.1.docx" uploaded by Sandra Trask\n  2022-09-14: Document "IR-Runbook-DRAFT-v0.1.docx" deleted by Sandra Trask\n  No further activity\n\nNote: Sandra Trask left the organization in November 2023. A draft runbook was uploaded and then deleted by the same person nine weeks later. No replacement was created. No successor was assigned ownership of the IR process. The folder has sat empty for three and a half years. When the December 2025 near-miss occurred (E3), the technician\'s attempt to locate this document returned the empty folder. The absence of an IR runbook for a publicly traded critical infrastructure operator is a direct violation of the governance obligations under ID.GV-2, and likely implicates disclosure obligations to securities regulators regarding the adequacy of internal controls.'
        },
        {
            id: 'E8',
            type: 'data',
            title: 'Peer Operator Cybersecurity Disclosure -- Centrex Freight Partners 2025 Annual Report',
            date: '2025-04-15',
            isRedHerring: false,
            content: 'CENTREX FREIGHT PARTNERS — 2025 ANNUAL REPORT EXCERPT\nSection 4.3: Cybersecurity Risk Management\n\nCentrex Freight Partners maintains a formal cybersecurity governance program aligned to NIST CSF v1.1. Our program includes: a board-level Cybersecurity Committee that meets quarterly and reviews a standing CISO briefing package; an organizational cybersecurity policy reviewed and updated annually with board approval; a documented incident response runbook reviewed semi-annually and exercised via tabletop simulation; and a third-party annual cybersecurity audit with full scope access including operational technology systems.\n\nIn fiscal year 2024, the Cybersecurity Committee met five times as required by charter. No material cybersecurity incidents occurred. Two minor incidents were escalated, documented, and closed per runbook procedures within the required timeframes.\n\nNote: Centrex Freight Partners is a fictional peer operator of comparable size and regulatory profile to MidwestRail. This disclosure is included to illustrate what adequate governance maturity documentation looks like at a publicly traded freight operator. The contrast between Centrex\'s disclosure and MidwestRail\'s actual governance posture — as documented in E1, E2, E3, and E7 — is materially significant. Both companies operate under the same regulatory environment. One has met its obligations; the evidence suggests the other has not.'
        },
        {
            id: 'E9',
            type: 'news',
            title: 'MidwestRail Holdings -- "World-Class Cybersecurity" Marketing Brochure',
            date: '2024-06-01',
            isRedHerring: true,  // Red herring: This is a marketing document with no probative value to the governance gap question. It describes aspirational claims, not verified program maturity.
            content: 'MIDWESTRAIL HOLDINGS — INFRASTRUCTURE YOU CAN TRUST\nPartner and Investor Relations Brochure, June 2024\n\nAt MidwestRail, the security of our rail network and our customers\' freight is our highest priority. Our cybersecurity program is built on world-class practices and continuous investment in protecting the infrastructure that moves America\'s supply chain.\n\nKey cybersecurity program highlights:\n — Board-level oversight of cybersecurity risk\n — Annual third-party security audits\n — 24/7 network operations monitoring\n — Alignment with industry security frameworks\n\nMidwestRail customers trust us with billions of dollars of freight annually. That trust is backed by our commitment to operational excellence and information security.\n\nNote: This document is a marketing brochure distributed to freight customers and potential investors. Its claims are aspirational and unverified. "Board-level oversight" in this brochure is inconsistent with the documented facts in E2 (three of five required reviews not held). "Annual third-party security audits" is the audit currently underway — whose scope is being restricted by the CISO. This document cannot be cited as evidence of actual governance maturity. Its existence is itself a governance concern if the claims are materially misleading.'
        },
        {
            id: 'E10',
            type: 'legal',
            title: 'SEC Guidance on Cybersecurity Risk Disclosure for Public Companies',
            date: '2023-03-15',
            isRedHerring: false,
            content: 'SOURCE: SEC Commission Guidance, Material Cybersecurity Risk and Incident Disclosure Obligations\nIssued: March 2023\n\nThe Securities and Exchange Commission has issued interpretive guidance confirming that publicly traded companies have disclosure obligations regarding material cybersecurity risks and incidents. Key principles:\n\n1. Materiality: A cybersecurity risk or incident is material if there is a substantial likelihood that a reasonable investor would consider the information important in making an investment decision.\n\n2. Governance disclosure: Companies are expected to disclose whether and how the board of directors is engaged in cybersecurity risk oversight, including whether the board has specific expertise or delegates oversight to a committee with defined responsibilities.\n\n3. Internal controls: Failures in cybersecurity governance — including lapsed policies, undocumented incident response processes, and inadequate board oversight — may constitute weaknesses in internal controls over financial reporting if they affect systems that support financial processes.\n\nApplication to MidwestRail: The governance gaps identified in this audit — lapsed policy review (E1), missed board reviews (E2), absence of IR runbook (E7), and the undisclosed near-miss incident (E3) — may collectively constitute a material disclosure obligation. Submitting an audit report that does not surface these findings, or that omits them due to scope restriction (E4), could expose the audit lead and the audit committee to regulatory liability for incomplete disclosure.'
        }
    ],

    // ── Phase 3: Stakeholders ───────────────────────────────
    stakeholders: [
        {
            id: 'S1',
            name: 'You (Senior Cybersecurity Audit Lead)',
            obvious: true
        },
        {
            id: 'S2',
            name: 'Marcus Hale (CISO)',
            obvious: true
        },
        {
            id: 'S3',
            name: 'Chief Information Officer',
            obvious: true
        },
        {
            id: 'S4',
            name: 'Audit Committee',
            obvious: true
        },
        {
            id: 'S5',
            name: 'Board of Directors',
            obvious: true
        },
        {
            id: 'S6',
            name: 'Rail Freight Customers (Shippers)',
            obvious: false
        },
        {
            id: 'S7',
            name: 'MidwestRail Employees and Operations Staff',
            obvious: false
        },
        {
            id: 'S8',
            name: 'Federal Railroad Administration (Regional Regulator)',
            obvious: false
        },
        {
            id: 'S9',
            name: 'The Ransomware Actors Who Staged the December 2025 Payload',
            obvious: false
        },
        {
            id: 'S10',
            name: 'The Next Attacker Who Will Exploit These Gaps If They Remain Undisclosed',
            obvious: false
        },
        { id: 'S11', name: 'Rail Union Safety Committee', obvious: false, irrelevant: true },
        { id: 'S12', name: 'Third-Party HVAC Vendor Listed in Unrelated Maintenance Logs', obvious: false, irrelevant: true }
    ],
    minStakeholders: 4,

    // ── Phase 3: Decisions ──────────────────────────────────
    decisions: [
        {
            id: 'D1',
            text: 'Submit the audit as discovered — with all governance gaps fully documented and flagged — to the Audit Committee per the original engagement scope, regardless of the CISO\'s scope-narrowing instruction.',
            framework: 'deontological'
        },
        {
            id: 'D2',
            text: 'Soften the report per the CISO\'s revised scope guidance, omitting the most sensitive findings, and propose a separate internal remediation roadmap with defined milestones to address the gaps quietly.',
            framework: 'virtue'
        },
        {
            id: 'D3',
            text: 'Submit the narrow, CISO-approved report to the Audit Committee as required, and separately escalate the suppressed governance gaps to the Audit Committee chair via a personal, off-channel communication.',
            framework: 'consequentialist'
        },
        {
            id: 'D4',
            text: 'Resign from the audit engagement and disclose the governance gaps directly to the Federal Railroad Administration as the regulator with cybersecurity oversight authority over rail operators.',
            framework: 'utilitarian-personal'
        }
    ],

    // ── Phase 4: Framework Challenges ──────────────────────
    frameworkChallenges: {
        'D1': {
            supporting: 'A deontological analysis provides the clearest support for this decision. Kant\'s categorical imperative asks whether the maxim of your action could be universalized: if every senior audit lead who discovered suppressed governance failures reported them fully regardless of client pressure, the result would be an audit profession that functions as an independent check on organizational self-reporting — which is precisely what the role exists to do. Your engagement letter, the Audit Committee\'s charter, and the ISACA professional standards for internal audit all define your obligation as one of independence and completeness. The CISO\'s scope-narrowing memo (E4) is not a legitimate exercise of authority over an internal audit function — it is a principal asking an auditor to limit a finding that implicates the principal. Under deontological reasoning, the duty to report does not contain an exception for inconvenience to the subject of the audit.\n\nThe evidence assembled in this audit — the lapsed policy (E1), the missed board reviews (E2), the undocumented near-miss (E3), the empty IR runbook folder (E7), and the SEC disclosure obligations that attach to all of these (E10) — constitutes exactly the kind of material finding that the Audit Committee (S4) and Board of Directors (S5) exist to receive. Withholding it is not neutrality; it is a choice with consequences that flow from you.',

            challenging: 'A consequentialist critique challenges the completeness of this framing. Submitting a full report that names the CISO\'s scope-narrowing as a governance concern alongside the substantive gaps is likely to trigger an adversarial response before any remediation occurs. Marcus Hale (S2) has already demonstrated willingness to restrict audit access; a full report that characterizes his actions as an impediment may produce a rapid organizational response aimed at discrediting the audit rather than correcting the findings. The customers who depend on rail freight continuity (S6), the operations staff who work on these systems daily (S7), and the regulator who relies on accurate reporting (S8) are better served by a corrective process that actually produces remediation — not by a report that gets buried in an executive dispute.\n\nThe practical question a consequentialist raises is: does submission of a complete report actually result in corrective action, or does it result in a board that has already demonstrated it will not hold proper security reviews (E2) receiving a document it chooses not to act on? The deontological case is strong, but it is only complete if it accounts for the pathway between reporting and remedy.',

            incomplete: 'This decision addresses your obligation as an auditor but does not resolve the ongoing exposure created by the December 2025 near-miss incident. Even if the Audit Committee (S4) receives a full report on Friday and convenes an emergency session the following week, the rail management control segment that was targeted (E3) remains undocumented, the asset register gap remains unfilled, and the SCADA systems that were removed from your scope (E4) remain unexamined. A complete ethical analysis must address not only what report you submit, but what you recommend as immediate interim controls — particularly for S10, the next attacker who may currently have access to systems your audit was not permitted to review. Submission of a complete report is the necessary first step. It is not a complete answer.'
        },
        'D2': {
            supporting: 'Virtue ethics frames this decision through the question of what a person of practical wisdom — phronesis — would do when navigating a real institutional environment. The virtuous professional does not simply apply a rule; she considers the relational context, the realistic pathways to correction, and the likelihood that different approaches actually produce the good outcome. A softened report that preserves the relationship with Marcus Hale (S2) and the CISO function might create the conditions for a negotiated remediation — one where the gaps identified in E1, E2, E3, and E7 are quietly addressed without the organizational disruption of a confrontational full disclosure. The virtuous auditor is not one who maximizes documentation of fault; she is one whose work actually results in a more secure organization.\n\nThe internal remediation roadmap approach also acknowledges the legitimate interest of the rail freight customers (S6) and the operations staff (S7) in organizational stability. A sudden governance scandal — particularly one that triggers SEC disclosure obligations under the framework outlined in E10 — carries real costs for people who played no role in the governance failures.',

            challenging: 'The virtue ethics case for softening the report collapses when it encounters the facts of this specific situation. The argument that internal remediation is the virtuous path assumes that the institution is capable of self-correction given the opportunity. But the evidence record directly contradicts this assumption: MidwestRail\'s board did not hold three of five required security reviews (E2), allowed its core policy document to lapse for four years without review (E1), permitted an IR runbook to be deleted and never replaced (E7), and learned of a ransomware near-miss through an informal phone call with no subsequent documented escalation (E3). This is not an organization that has failed once — it is an organization whose governance function has been absent for years. Offering it a quiet remediation path is not virtue; it is an optimistic bet on an institution that has already shown it will not correct itself absent external pressure.\n\nThere is also a deontological critique: ISACA\'s independence standard explicitly prohibits auditors from allowing the subject of an audit to determine the scope or content of findings. Softening the report per the CISO\'s instruction (E4) is not a virtuous compromise — it is a professional independence violation regardless of the auditor\'s intentions.',

            incomplete: 'This decision does not specify what "internal remediation milestones" means in practice, who owns them, or what accountability mechanism enforces them. A remediation roadmap that is not anchored to the Audit Committee (S4) and the Board of Directors (S5) — the only governance bodies with authority to direct the CISO — is a document that Marcus Hale (S2) controls. The CISO who restricted your audit scope is not the appropriate owner of the remediation plan that addresses the governance gaps he was aware of and chose not to surface. A complete analysis of D2 must specify the governance chain for the remediation commitment and the trigger conditions under which you escalate if milestones are not met. Without those specifications, this decision is not a plan — it is a delay with a softer name.'
        },
        'D3': {
            supporting: 'Consequentialist analysis supports this approach as the option most likely to produce actual remediation given the institutional constraints in play. By submitting the narrow report — which satisfies your contractual obligation and preserves the formal engagement — you avoid an immediate adversarial confrontation with Marcus Hale (S2) that might compromise your ability to communicate with the Audit Committee (S4) at all. The parallel escalation to the Audit Committee chair via personal channel ensures that the material findings — the lapsed policy (E1), the missed reviews (E2), the undocumented near-miss (E3), the empty runbook folder (E7), and the scope-narrowing memo (E4) — reach the decision-making body that has authority to act. The Audit Committee chair, receiving this information directly, can convene an executive session that includes neither the CISO nor the CIO (S3), evaluate the full picture, and direct remediation through the governance chain.\n\nThis approach also creates a defensible record. You have submitted the required deliverable. You have not concealed your full findings. The Audit Committee (S4) and the Board of Directors (S5) are now in possession of complete information — which is precisely what SEC disclosure obligations (E10) require the board to have before making materiality determinations.',

            challenging: 'A deontological critique of D3 is direct: the "off-channel personal communication" is not a recognized professional escalation path. Your engagement defines your reporting relationship as one with the Audit Committee as a body — not with its chair as an individual acting outside a formal session. A communication that routes around the normal reporting structure, even with good intent, compromises the integrity of the audit record and creates ambiguity about the status of your findings. Did you report? Did you not report? What is the chair\'s obligation upon receiving informal information that was not included in the formal report? You have placed the Audit Committee chair in an ethically ambiguous position while providing yourself with the comfort of having "told someone."\n\nThere is also a practical risk: the off-channel communication, if discovered by the CISO (S2) or CIO (S3), may be characterized as an irregular attempt to circumvent governance rather than as a good-faith disclosure. The protection afforded to you as an auditor making a good-faith finding is much clearer when the finding is in the report than when it is in a personal message to a board member.',

            incomplete: 'D3 does not address your professional responsibility for the ongoing operational exposure. The rail management control segment that was targeted in the December 2025 near-miss (E3) is outside your revised audit scope (E4). You have reason to believe that SCADA systems and network segmentation for critical rail operations have not been reviewed by any independent party. The Audit Committee chair, receiving your off-channel communication, cannot act immediately on operational security concerns without triggering the same organizational friction you were trying to avoid. The gap between "the chair knows" and "the exposure is addressed" may span weeks or months — during which S10, the next attacker, operates against systems that are now documented in your notes as unreviewed. A complete consequentialist analysis must account for the interim-period risk, not just the final outcome of the governance remediation.'
        },
        'D4': {
            supporting: 'A utilitarian analysis considering the broadest population of affected parties provides some support for this decision. The rail freight customers (S6), the operations staff (S7), the general public who share road and rail infrastructure, and the Federal Railroad Administration (S8) as the regulator responsible for overseeing the safety and security of freight rail operations all have interests that extend beyond MidwestRail\'s internal governance preferences. If MidwestRail\'s cybersecurity governance has deteriorated to the point where a ransomware staging payload on the rail management control segment (E3) was handled by a technician\'s informal phone call, the FRA — as the regulatory body with authority to mandate remediation — may be the only party with power to compel actual change in the near term.\n\nResigning from the engagement removes you from the conflicts of interest created by the CISO\'s scope restriction (E4). It also ensures that your subsequent disclosure to the FRA (S8) cannot be characterized as a breach of audit confidentiality, since you are no longer operating under the engagement. From a strictly utilitarian perspective focused on the welfare of the broadest stakeholder group — including S10, the future attacker who will eventually succeed if these gaps persist — external regulatory escalation may produce remediation faster than any internal path.',

            challenging: 'The utilitarian case for D4 must account for all consequences, including the costs of resignation and external disclosure to parties beyond the FRA. An FRA disclosure by a former auditor is likely to trigger a regulatory investigation that produces public reporting — which activates SEC disclosure obligations (E10) on MidwestRail\'s own terms, at an accelerated and adversarial pace. The Board of Directors (S5) and Audit Committee (S4), who may have been willing to act on a properly delivered full audit report (D1), are now responding to a regulatory investigation rather than an internal finding. The remediation process that results is likely to be slower, more expensive, more disruptive to the rail freight customers (S6), and more harmful to the operations staff (S7) than a directed internal correction would have been.\n\nThere is also a deontological critique: resignation is a choice that ends your responsibility for the outcome without guaranteeing that the outcome is better. You surrender the audit mandate, the professional standing to make findings, and the formal relationship with the Audit Committee — in exchange for the moral satisfaction of having escalated to a regulator who may or may not act on an informal tip from a former engagement lead.',

            incomplete: 'This decision does not address the FRA\'s actual jurisdictional scope over cybersecurity governance at publicly traded freight operators. The FRA\'s primary authority is over physical rail safety — track standards, crew certification, hazardous materials transport. Its cybersecurity oversight role for freight operators is not as clearly defined as, for example, the TSA\'s role in pipeline cybersecurity or the SEC\'s role in public company disclosure. Before committing to this path, a complete analysis must determine whether the FRA is the correct regulatory recipient for these findings, or whether the SEC — the regulator with explicit jurisdiction over public company internal controls and cybersecurity disclosure (E10) — is the more appropriate external escalation target. D4 as stated may direct the disclosure to an agency with limited authority to compel the relevant remediation.'
        }
    },

    // ── Phase 5: Code Provisions ────────────────────────────
    codeProvisions: [
        {
            code: 'ACM',
            section: '1.2',
            text: 'Avoid harm. Computing professionals have an obligation to minimize unintended harm. When that harm is a consequence of a decision that has already been made by others, the computing professional has an obligation to report the problem to appropriate parties and refuse to continue participating in activities that are harmful to the public.'
        },
        {
            code: 'ISACA',
            section: 'Independence and Due Care',
            text: 'ISACA members and CISA-certified professionals shall perform their duties with objectivity and due professional care. An internal auditor must maintain independence from the activities being audited and must not allow the subject of an audit to determine the scope, content, or conclusions of audit findings. Where independence is impaired — including by management pressure to restrict scope or soften conclusions — the auditor must disclose the impairment in the report or to the appropriate oversight body. (Paraphrased from ISACA Code of Professional Ethics and IS Audit and Assurance Standards.)'
        },
        {
            code: 'NIST CSF',
            section: 'ID.GV-1',
            text: 'Organizational cybersecurity policy is established and communicated. The organization\'s cybersecurity policy is documented, approved by appropriate leadership, and communicated to all relevant personnel and third-party stakeholders. The policy is reviewed and updated on a defined schedule to reflect changes in the organizational risk environment, legal and regulatory requirements, and cybersecurity best practices.'
        }
    ],
    codeConflict: {
        provision1: 'ISACA Independence',
        provision2: 'ACM 1.2 / Professional Collaboration',
        conflictDescription: 'ISACA\'s independence standard requires that the auditor not allow the subject of an audit — in this case, the CISO (S2) and the organizational leadership he represents — to determine the scope or content of findings. This obligation is non-negotiable in professional audit standards: an audit whose scope is determined by the auditee is not an audit. The moment the auditor accepts the CISO\'s revised scope memo (E4) as authoritative, the audit\'s independence is impaired and must be disclosed.\n\nACM\'s professional ethics guidance, meanwhile, includes provisions encouraging computing professionals to work collaboratively within organizational structures, to seek internal resolution before external escalation, and to respect the professional judgment of colleagues in their areas of authority. A generous reading of these provisions might suggest that accepting the CISO\'s operational-sensitivity justification for scope restriction is a reasonable professional accommodation — honoring the security expertise of the person responsible for OT systems.\n\nThe conflict is this: ISACA\'s independence requirement and ACM\'s collaboration guidance pull in opposite directions when organizational management is the source of the governance failure. Can a professional simultaneously maintain audit independence and honor collaborative deference to institutional authority? When the institution restricts the scope of the review that would reveal its own failures, which obligation governs — and on what grounds?'
    },

    // ── Scoring Weights ─────────────────────────────────────
    scoring: {
        evidence:     20,   // auto-graded: tagging accuracy and explanation quality
        stakeholder:  20,   // auto-graded: count + non-obvious stakeholder discovery
        framework:    40,   // instructor-graded: framework response quality
        codeConflict: 20    // auto-graded partial (completion) + instructor spot-check
    }
};
