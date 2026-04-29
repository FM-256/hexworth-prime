/* ============================================================
   CSE-L05 — The 72 Hours
   Lakeshore Mutual Breach Notification Decision Configuration

   All company names, personnel, incident dates, dollar figures,
   and regulatory timelines are fictional and used for
   instructional purposes only. No specific real statutes,
   court cases, executive orders, or CVE numbers are cited.

   Red herrings: E8 (previous quarter vulnerability scan —
   scoping a prior attack surface is irrelevant to the
   notification decision now) and E9 (breach-notification
   software vendor pitch — a procurement question, not an
   ethics question).
   ============================================================ */

window.CSEL05Config = {
    id: 'cse-l05',
    title: 'The 72 Hours',
    subtitle: 'Lakeshore Mutual Breach Notification Decision',
    course: 'CIS2253',
    week: 3,
    chapter: 5,
    duration: 30,
    accent: '#ff00ff',

    // ── Phase 1: Brief ──────────────────────────────────────
    brief: {
        type: 'memo',
        from: 'Marcus Delray, Chief Executive Officer',
        to: 'You (CISO) | Sandra Voth (General Counsel) | Priya Anand (Chief Compliance Officer)',
        date: 'Friday, 6:00 PM — November 14',
        classification: 'CONFIDENTIAL — INCIDENT RESPONSE',
        content: 'This memo is a joint communication to the three of you. I am writing it rather than convening a call because I want there to be a record of the question I am asking, and I want your answers in writing by 9 AM Saturday.\n\nAt 4 PM today the IR team confirmed a breach. I have been briefed at a high level. The immediate facts as I understand them: approximately 250,000 customer records were exposed via a misconfigured backup storage environment that was accessible from the public internet for an estimated eleven days. Forensics to determine which records were actually accessed — not just exposed — will require at least five more business days. We have approximately 3.2 million policyholders. Included in that population are an estimated 12,000 individuals with addresses in European Union member states.\n\nI understand that a regulatory clock is running for our EU customer population. I also understand that we face a patchwork of state-level notification obligations for our US customers, and that different states handle timing differently. What I do not have is a clear answer to the question I am about to ask.\n\nHere is the question: what do we notify, to whom, by when, and what does each path cost us — legally, financially, and reputationally?\n\nSandra\'s preliminary view is that we should wait for full forensics before making any notification. Her argument is that an incomplete notification creates public risk from inaccuracy and opens us to claims we mischaracterized the breach. Priya\'s preliminary view is that the 72-hour clock for EU residents has already started and that waiting forfeits our ability to make timely notification to the relevant supervisory authority. Both positions are coherent. Both carry risk.\n\nI am not asking you to resolve the legal question tonight. I am asking you, as a group, to map the decision paths and tell me what each one actually means. The company cannot make this decision in a vacuum, and you three are the people who have to live with the outcome.\n\nDelray'
    },

    // ── Phase 2: Evidence Artifacts ─────────────────────────
    // 10 total. E8 and E9 are red herrings.
    evidence: [
        {
            id: 'E1',
            type: 'data',
            title: 'IR Team Initial Scoping Report',
            date: 'November 14 — 3:45 PM',
            isRedHerring: false,
            content: 'LAKESHORE MUTUAL — INCIDENT RESPONSE\nInitial Scoping Report v0.1 — CONFIDENTIAL\nPrepared by: Incident Response Team Lead\n\nIncident summary: A backup storage environment operated by the IT infrastructure team was found to be publicly accessible without authentication controls. The environment contained archived customer record exports used for a now-discontinued analytics workflow.\n\nScope confirmed at time of this report:\n— Storage environment contained approximately 252,000 customer records.\n— Records include policy numbers, full names, mailing addresses, and for a subset of records, date of birth and health classification codes.\n— The environment was confirmed accessible from 4:00 AM on November 3. Misconfiguration was remediated at 11:17 AM today.\n— Total exposure window: approximately 11 days.\n— EU-resident customers in the dataset: estimated 12,000 based on address fields. Exact count requires additional query processing (estimated 4 hours).\n\nWhat we do not yet know:\n— Whether any external party accessed the data during the exposure window. Access logs are incomplete; cloud provider log retention for this storage tier only covers 7 days.\n— Which specific records were accessed if access did occur.\n— Whether the data has been exfiltrated, copied, or posted anywhere.\n\nFull forensic scope: estimated 5 business days minimum. Log reconstruction from provider is underway; we have submitted a preservation request.'
        },
        {
            id: 'E2',
            type: 'data',
            title: 'Misconfiguration Root-Cause Analysis',
            date: 'November 14 — 5:30 PM',
            isRedHerring: false,
            content: 'LAKESHORE MUTUAL — IT INFRASTRUCTURE\nRoot-Cause Analysis — Backup Storage Misconfiguration\nCONFIDENTIAL — DRAFT\n\nOn November 1, a configuration change was applied to the backup automation pipeline via an infrastructure-as-code commit. The commit modified default storage-class settings for the analytics archive tier and, in doing so, removed an access control policy that had been set as a conditional override on the bucket.\n\nThe engineer who made the commit was following an approved change ticket. The ticket did not specify that access control policy overrides existed on the target bucket. The pipeline lacked automated policy-drift detection for conditional overrides.\n\nThe change took effect at 4:00 AM on November 3. The misconfiguration was not detected until November 14 at 12:44 PM, when an automated external-facing asset scan flagged the bucket as publicly listable.\n\nRoot cause category: process failure — insufficient pre-change policy snapshot and no runtime drift monitoring for conditional overrides.\n\nContributing factor: the analytics archive workflow had been formally discontinued in Q2 but the storage bucket was not decommissioned at that time. The data should not have been present in an active production environment.\n\nThis configuration failure was not the result of malicious action by any internal party. The engineer who committed the change was acting within their approved scope.'
        },
        {
            id: 'E3',
            type: 'legal',
            title: 'GDPR Article 33 — Controller Notification to Supervisory Authority (Paraphrased)',
            date: 'Regulatory Reference',
            isRedHerring: false,
            content: 'REGULATORY REFERENCE — Paraphrased for Instructional Use\n\nUnder general data protection regulation frameworks applicable to EU residents\' personal data, a data controller that becomes aware of a personal data breach must notify the competent supervisory authority without undue delay and, where feasible, not later than 72 hours after becoming aware of the breach — unless the breach is unlikely to result in a risk to the rights and freedoms of natural persons.\n\nWhere notification is not made within 72 hours, it must be accompanied by reasons for the delay.\n\nThe notification must include, at minimum: a description of the nature of the breach including, where possible, the categories and approximate number of data subjects concerned; the name and contact details of the data protection officer; the likely consequences of the breach; and the measures taken or proposed to address the breach.\n\nKey interpretive notes:\n— "Aware" is interpreted as when the controller has a reasonable degree of certainty that a security incident has occurred that has led to the compromise of personal data — not when full forensic scope is confirmed.\n— Notification with partial information is explicitly permitted; controllers are expected to provide information in phases as it becomes available.\n— The supervisory authority for this obligation is the authority in the EU member state where the affected data subjects reside, or the lead supervisory authority if a main establishment exists in the EU.'
        },
        {
            id: 'E4',
            type: 'data',
            title: 'State Breach Notification Summary — Select Jurisdictions',
            date: 'Compliance Reference — Current',
            isRedHerring: false,
            content: 'LAKESHORE MUTUAL — COMPLIANCE OFFICE\nState Breach Notification Window Summary (Selected Jurisdictions)\nFor Internal Use Only — Not Legal Advice\n\nThis summary describes the general character of notification obligations across key states in our policyholder population. Exact thresholds and exceptions are managed by outside counsel.\n\nTier A (Shortest Windows): Several high-population states require notification "without unreasonable delay" or specify a window substantially shorter than 90 days, with explicit prohibitions on holding notification for forensics beyond a defined ceiling. California\'s consumer privacy framework establishes its own parallel clock that activates upon "discovery" of a breach and does not wait for full scope confirmation.\n\nTier B (Moderate Windows): A majority of states allow notification to proceed within 60 to 90 days of discovery or when forensics are reasonably complete, whichever is earlier. Some include a safe harbor for good-faith investigation delays if the controller can document active forensic work.\n\nTier C (Investigation Permitted): A smaller group of states permit notification to be delayed during an active law enforcement investigation upon law enforcement request, or during good-faith forensic work without a specific ceiling, provided the delay is reasonable.\n\nKey complication: Our policyholder population spans all 50 states. The misconfigured dataset did not separate records by state residency at storage time. Isolating affected records by state will require the same forensic timeline as the full scope analysis.\n\nBottom line: GDPR-jurisdiction customers have the shortest notification window of any population we serve. US state windows are heterogeneous and cannot be fully satisfied simultaneously from a standing start.'
        },
        {
            id: 'E5',
            type: 'memo',
            title: 'General Counsel — "Wait for Forensics" Position Memo',
            date: 'November 14 — 5:00 PM',
            isRedHerring: false,
            content: 'TO: CEO Marcus Delray\nFROM: Sandra Voth, General Counsel\nRE: Breach Notification — Preliminary Position\nCONFIDENTIAL — ATTORNEY-CLIENT PRIVILEGED\n\nMy preliminary recommendation is that Lakeshore Mutual should not issue any external notification until forensic scope is confirmed.\n\nMy reasoning is as follows.\n\nNotification creates a public record. Once we notify, we cannot un-notify. If we notify that 250,000 records were exposed and forensics later reveals that the actual access was limited — or that no external access occurred at all — we will have generated customer fear, regulatory scrutiny, and litigation exposure based on a worst-case scenario that did not materialize.\n\nFurthermore, our insurance regulatory obligations in several key states are tied to "breached" records — meaning records that were actually accessed or acquired by an unauthorized party. Exposure alone may not meet the definitional threshold in those jurisdictions. We are not certain yet that we have a "breach" as defined rather than an "exposure incident."\n\nI acknowledge the GDPR 72-hour window for our EU customers. My view is that we should assess whether the exposure-versus-access distinction creates a defensible argument under GDPR as well. If it does, we wait. If it does not, we make the narrowest possible GDPR-only notification while continuing forensics for US populations.\n\nI want to be clear: I am not recommending inaction. I am recommending that we not exceed the scope of our confirmed obligations before we have confirmed facts.'
        },
        {
            id: 'E6',
            type: 'memo',
            title: 'Chief Compliance Officer — "Notify Now" Counter-Position',
            date: 'November 14 — 5:45 PM',
            isRedHerring: false,
            content: 'TO: CEO Marcus Delray\nFROM: Priya Anand, Chief Compliance Officer\nRE: Breach Notification — Counter Position\nCONFIDENTIAL\n\nI respect Sandra\'s analysis, but I want to register a direct disagreement on the GDPR timing question and a concern about the framing of the broader question.\n\nOn GDPR: The 72-hour clock started when we became "aware" of the breach — which, per regulatory guidance, means when we had reasonable certainty that an incident occurred involving personal data. That moment was 4 PM today when IR confirmed the misconfiguration and the presence of EU-resident data in the affected dataset. We are now at Hour 2. We have 70 hours remaining. The regulations are explicit that partial notification is acceptable; we do not need complete forensic scope to make a compliant initial notification. Waiting for forensics before notifying the EU supervisory authority is not a defensible interpretation of the 72-hour obligation.\n\nOn the broader question: I am also concerned that the legal framing — "wait until we know our minimum confirmed obligation" — may not be the right frame for an insurance company whose business model is built on customer trust. Our policyholders gave us sensitive health and financial information because they trusted us with it. The ethics question is not just "what are we legally required to do?" The ethics question is "what does a company that means what it says about trust actually do when something like this happens?"\n\nI support immediate GDPR supervisory notification and want to begin parallel planning for US notification on a jurisdiction-by-sector basis as forensics proceeds.'
        },
        {
            id: 'E7',
            type: 'testimony',
            title: 'Peer Insurer Incident — Two Outcome Comparison (Anonymized)',
            date: 'Industry Reference',
            isRedHerring: false,
            content: 'INDUSTRY REFERENCE — Compiled by Compliance Office from Public Reporting\nFor Internal Use Only\n\nThis document summarizes two comparable incidents from peer insurers within the last four years. Details have been generalized to prevent identification.\n\nCase A — Delayed Notification:\nA regional insurer discovered a misconfigured cloud storage environment exposing approximately 180,000 records. The company waited 23 days to notify regulators and affected customers, citing an ongoing forensic investigation. When notification was issued, it confirmed that only a small subset of exposed records had been accessed. Regulatory outcome: the insurer was cited in two EU-jurisdiction supervisory proceedings for exceeding the 72-hour notification window. Fine: mid-six figures (EUR). US regulatory outcome: consent decree in one state for failure to notify within statutory window; no fine in most other states. Reputational outcome: sustained negative press coverage for three weeks; class action filed; settled for undisclosed amount.\n\nCase B — Immediate Partial Notification:\nA national insurer discovered a similar misconfigured storage environment exposing approximately 300,000 records. The company notified the relevant EU supervisory authority within 54 hours of discovery with partial information, explicitly noting forensics were ongoing. US customer notification followed on a rolling basis as state-level scope was confirmed. Regulatory outcome: no supervisory citation; the EU authority acknowledged the partial notification as compliant. Reputational outcome: initial negative coverage; CEO public statement characterized as "transparent"; class action filed but dismissed at summary judgment. Forensics ultimately confirmed limited actual access.'
        },
        {
            id: 'E8',
            type: 'data',
            title: 'Q3 Vulnerability Scan Report — Infrastructure Summary',
            date: 'September 30',
            isRedHerring: true,  // Red herring: the Q3 scan characterizes prior attack surface, not the current notification decision
            content: 'LAKESHORE MUTUAL — INFORMATION SECURITY\nQ3 Vulnerability Scan Summary — CONFIDENTIAL\n\nThis report summarizes findings from the quarterly infrastructure vulnerability scan conducted September 15-28. Scope included all production and staging environments.\n\nTotal findings: 1,847 across all severity tiers\nCritical (CVSS 9.0+): 4 — all remediated within SLA\nHigh (CVSS 7.0-8.9): 31 — 28 remediated, 3 deferred with accepted risk\nMedium: 412 — remediation in progress per standard SLA\nLow: 1,400 — logged, prioritized for next cycle\n\nNote: The backup storage environment implicated in the November 14 incident was not scanned in Q3 because it was categorized as a decommissioned legacy system and excluded from the active scan scope. This classification was incorrect; the environment remained active and accessible. This was a process failure independent of the vulnerability scan program.\n\nThis report is relevant to understanding the general security posture of the organization but does not bear on the notification decision for the current incident. The question before the leadership team is not "how did this happen?" — that is answered by the root-cause analysis — but "what do we do now that it has?"'
        },
        {
            id: 'E9',
            type: 'news',
            title: 'Vendor Pitch — BreachReady Pro Notification Management Platform',
            date: 'November 12',
            isRedHerring: true,  // Red herring: a procurement pitch received two days before the breach is irrelevant to the notification ethics decision
            content: 'BREACHREADY PRO — AUTOMATED BREACH NOTIFICATION MANAGEMENT\nExecutive Summary — Presented to Lakeshore Mutual Information Security\n\nBreachReady Pro automates the multi-jurisdiction breach notification workflow, reducing manual compliance labor by an estimated 65% and cutting average time-to-notification by 40% compared to manual processes.\n\nFeatures include:\n— Jurisdiction-specific template library (all 50 US states + GDPR + PIPEDA)\n— Real-time regulatory clock tracking with escalation alerts\n— Customer notification queuing with per-tier delivery confirmation\n— Integrated regulatory filing portal connections for 12 state agencies\n\nPricing: $180,000 annually for up to 5 million policyholders.\n\nNote: This pitch was received two days before the November 14 incident. Whether Lakeshore Mutual purchases notification management software is a procurement decision that has no bearing on the ethical and legal choices the leadership team must make today. The tool would make execution faster; it does not resolve the question of when to execute or what to disclose. Including this document in the evidence set is a distraction from the actual decision.'
        },
        {
            id: 'E10',
            type: 'testimony',
            title: 'Helen Nissenbaum — Contextual Integrity and the Obligation to Notify',
            date: 'Theoretical Reference',
            isRedHerring: false,
            content: 'THEORETICAL FRAMEWORK REFERENCE\nContextual Integrity and Breach Notification Ethics\nAdapted from academic privacy ethics literature\n\nPhilosopher Helen Nissenbaum\'s framework of contextual integrity holds that privacy is not merely about secrecy or access control — it is about information flowing appropriately within the norms of the context in which it was shared. When a person provides their health classification, address, and policy information to an insurer, they do so within a specific contextual norm: the insurer will use that information to process claims and will protect it from disclosure outside that context.\n\nFrom this framework, the question "was the data actually accessed?" may be less ethically central than the GC\'s memo implies. The breach of contextual integrity occurred when the data was placed in a publicly accessible environment — regardless of whether an external party exploited that access. The policyholders who entrusted Lakeshore Mutual with their information did so with an expectation that it would be held within appropriate systems. The moment that expectation was violated — November 3, when the misconfiguration took effect — the contextual norm was breached.\n\nNissenbaum\'s framework supports notification not just as a legal obligation but as an ethical restoration: telling affected individuals that the contextual norm that governed their data was violated, what happened, and what is being done to restore appropriate information flows. Waiting for forensic confirmation of "actual access" may satisfy a minimum legal threshold while failing the contextual integrity standard entirely.\n\nThis is particularly salient for the 12,000 EU-resident customers, whose data protection expectations are codified in law — but it applies to all 250,000 affected policyholders regardless of jurisdiction.'
        }
    ],

    // ── Phase 3: Stakeholders ───────────────────────────────
    stakeholders: [
        {
            id: 'S1',
            name: 'You (CISO)',
            obvious: true
        },
        {
            id: 'S2',
            name: 'CEO Marcus Delray',
            obvious: true
        },
        {
            id: 'S3',
            name: 'Sandra Voth — General Counsel',
            obvious: true
        },
        {
            id: 'S4',
            name: 'Priya Anand — Chief Compliance Officer',
            obvious: true
        },
        {
            id: 'S5',
            name: 'EU Residents in the Affected Dataset (~12,000)',
            obvious: true
        },
        {
            id: 'S6',
            name: 'US Policyholders in Affected States',
            obvious: true
        },
        {
            id: 'S7',
            name: 'The IR Team',
            obvious: false
        },
        {
            id: 'S8',
            name: 'The Board\'s Risk Committee',
            obvious: false
        },
        {
            id: 'S9',
            name: 'Regulators — Multiple Jurisdictions (EU Supervisory Authority + State AGs)',
            obvious: false
        },
        {
            id: 'S10',
            name: 'The Customer Service Team',
            obvious: false
        },
        {
            id: 'S11',
            name: 'Future Breach Victims — If Poor Notification Norms Are Normalized',
            obvious: false
        },
        {
            id: 'S12',
            name: 'The Third-Party SaaS Vendor Whose Automation Script Caused the Misconfiguration',
            obvious: false
        },
        { id: 'S13', name: 'Lakeshore Mutual Marketing Department', obvious: false, irrelevant: true },
        { id: 'S14', name: 'Office Facilities Manager', obvious: false, irrelevant: true }
    ],
    minStakeholders: 4,

    // ── Phase 3: Decisions ──────────────────────────────────
    decisions: [
        {
            id: 'D1',
            text: 'Notify the GDPR supervisory authority for EU customers within 72 hours with the information available now — scope of exposure, nature of data, forensics-in-progress status. Delay all US state notifications until forensics are complete and jurisdiction-by-jurisdiction scope is confirmed.',
            framework: 'deontological'
        },
        {
            id: 'D2',
            text: 'Wait for full forensics to complete before notifying any jurisdiction. Submit comprehensive, accurate notifications to all applicable authorities and affected customers on approximately day six with complete information.',
            framework: 'consequentialist'
        },
        {
            id: 'D3',
            text: 'Notify all affected populations now — GDPR authority, all US customers with any state connection, and issue a public statement — with the information available. Accept the reputational cost and the risk of inaccuracy as the price of transparency.',
            framework: 'virtue'
        },
        {
            id: 'D4',
            text: 'Notify the GDPR supervisory authority within 72 hours; notify US customers on a sector-by-sector, rolling basis as individual state clocks are analyzed and forensic scope is refined for each state\'s population.',
            framework: 'utilitarian'
        }
    ],

    // ── Phase 4: Framework Challenges ──────────────────────
    frameworkChallenges: {
        'D1': {
            supporting: 'A deontological analysis provides the clearest support for this choice. Duties are not contingent on outcomes — and the 72-hour notification obligation for EU residents is precisely a codified duty. The regulatory framework analyzed in E3 was designed by regulators who understood that forensics take time; the framework explicitly permits phased notification and partial information. Meeting that obligation as written, without waiting for a convenient moment, is what deontological ethics demands. ISACA\'s professional code (Privacy and Confidentiality, Due Diligence) reinforces this: due diligence includes meeting your known legal obligations without engineering delays. GIAC\'s standard of acting lawfully and honestly supports filing a partial but accurate notification over a delayed comprehensive one. Partial does not mean dishonest — filing what you know, noting what you do not, and committing to updates is the legally honest path.',

            challenging: 'A consequentialist critique targets the asymmetry built into D1: the choice meets the EU obligation while deferring the US population. For the 238,000 non-EU policyholders whose records were equally exposed, D1 produces a tiered system of protection calibrated to which legal jurisdiction governs a customer rather than the severity of their exposure. A California resident whose records were exposed is equally affected as a German resident whose records were exposed — but under D1, the German resident gets timely notification and the California resident gets forensic delay. If the consequentialist goal is to minimize total harm across all affected individuals, D1 optimizes for regulatory compliance in one jurisdiction while accepting under-protection in others. This critique is particularly sharp because "legal obligation" and "ethical obligation" are not co-extensive — the Compliance Officer\'s point in E6 cuts here.',

            incomplete: 'D1 is incomplete without a specified escalation plan for US notification. "Delay until forensics are complete" is a placeholder, not a decision. You must specify: what is the maximum delay you will accept for US notification even if forensics take longer than five business days? What happens to affected customers in Tier A states (shortest windows) during that period? What is the customer service team\'s instruction when inbound calls from policyholders begin — because if this breach becomes public from a third party while you are still investigating, your planned timeline collapses. A complete analysis of D1 must include a contingency trigger: the point at which US notification begins regardless of forensic completeness.'
        },
        'D2': {
            supporting: 'A consequentialist case for D2 centers on information quality. Notification with incomplete information produces harms of its own: customer panic over a worst-case scope that may not be accurate, inbound call surges that overwhelm service capacity before remediation resources are in place (E10 customer service data is instructive here), and — critically for an insurer — claims activity driven by uncertainty rather than confirmed harm. If forensics reveal on day six that the actual access was limited to a small subset of the 252,000 exposed records, a day-six notification with accurate scope produces better customer outcomes than a day-one notification followed by a corrective "actually, fewer of you were affected." The GC\'s position in E5 has consequentialist logic even if it is framed in legal terms.',

            challenging: 'The consequentialist case for D2 fails when you extend the time horizon. Day six is not day six for EU customers — it is day six plus whatever time the forensic analysis was consuming, measured against a 72-hour window that expired on day three. The EU supervisory authority does not receive a "we were being thorough" exemption from the notification timeline; it receives a late filing, which is itself a regulatory violation with consequences (E7, Case A illustrates this precisely). The consequentialist must account for all consequences — including the regulatory fine, the consent decree, and the reputational cost of being characterized as a company that prioritized managing its public narrative over meeting its disclosure obligations. When Case A and Case B (E7) are compared, the delayed-notification path produced worse outcomes across every measured dimension.',

            incomplete: 'D2 does not specify what happens if the breach becomes public through a third-party channel before day six — a not-implausible scenario given that the storage bucket was publicly listable for eleven days. If a security researcher, journalist, or adversary identified and disclosed the misconfiguration during the exposure window, your five-day forensic hold becomes public record as a cover story rather than a legitimate investigation. D2 requires a media monitoring and early-warning protocol as part of its design; without it, the "wait for full information" plan has a catastrophic failure mode that the forensic timeline does not address.'
        },
        'D3': {
            supporting: 'Virtue ethics asks not "what does the rule require?" but "what does a trustworthy company actually do?" An insurance company\'s entire operating premise is that policyholders can trust it with their most sensitive information during their most vulnerable moments. The virtue framework calls for the CISO and the leadership team to act as the kind of institution they claim to be — not the minimum legally defensible version of it. Nissenbaum\'s contextual integrity framework (E10) supports this directly: the contextual norm was violated the moment the data was exposed, not the moment a forensic report confirmed access. Notifying customers that a contextual breach occurred, what is known and unknown, and what is being done is the response of a trustworthy institution. D3 is costly in the short term; virtue ethics holds that it is the choice that preserves the relationship on which the business depends.',

            challenging: 'A practical critique of D3 is that "notify everyone now" is not a coherent operational plan — it is a posture. Notifying 250,000 customers and issuing a public statement before forensics are even partially complete means making statements you cannot fully support. If the subsequent forensic finding is that access was limited to a small fraction of the exposed records, your public statement has generated fear for 200,000+ people who were exposed but whose data was never accessed by anyone. Virtue ethics is not the same as maximum disclosure without regard to accuracy. A genuinely virtuous institution does not generate fear it cannot substantiate. D3, as stated, conflates "being transparent" with "disclosing uncertainty as if it were confirmed fact" — and that conflation is not a virtue; it is a different kind of dishonesty.',

            incomplete: 'The virtue framing does not resolve the operational capacity question. The customer service inbound-call surge data from a prior incident is in the evidence set (E10). Notifying 250,000 customers at once, with the full uncertainty acknowledged, without pre-positioning customer service capacity is not virtuous — it is chaotic. A complete virtue-based analysis must specify what operational readiness is required before "notify everyone" is executable. The CISO recommending D3 to the CEO without addressing the customer service readiness gap is recommending a decision whose execution would undermine the very trust it is meant to demonstrate.'
        },
        'D4': {
            supporting: 'A utilitarian analysis asks which path produces the greatest benefit across the greatest number of affected parties. D4 attempts to meet every jurisdiction\'s obligation on its own terms: the GDPR supervisory authority receives timely partial notification within 72 hours (satisfying the EU legal framework and protecting the 12,000 EU residents); US customers are notified on a rolling basis that tracks their state\'s actual legal framework rather than forcing a single notification date that satisfies none of the state windows cleanly. This approach also reduces the risk of a single inaccurate notification to all 250,000 customers simultaneously, spreading reputational and operational risk across a manageable timeline. ISACA\'s due diligence standard supports systematic, jurisdiction-calibrated compliance over either blanket delay or blanket simultaneous disclosure.',

            challenging: 'D4\'s utilitarian logic depends on the practical feasibility of "sector-by-sector, rolling" US notification — and that feasibility is not established. The forensic timeline for determining which records belong to which state\'s customer population is the same forensic timeline that is already estimated at five-plus business days. You cannot notify California customers before you know which records in the dataset are California customers. D4 risks being a theoretical optimization that is operationally indistinguishable from D1 for most of the US population: both result in delayed US notification pending forensics. The utilitarian benefit of D4 over D1 depends on a capability that the IR team has not confirmed exists.',

            incomplete: 'D4 does not address the public-statement question. The peer insurer in Case B (E7) combined timely regulatory notification with a CEO public statement that was credited with shaping the reputational outcome favorably. D4 as specified focuses on regulatory and customer-direct notification pipelines but says nothing about the company\'s public posture during the five-plus-day forensic window. During that period, customers and press may become aware of the incident through other channels. A complete utilitarian analysis must specify the communication posture — what the company says publicly during the investigation, not just to regulators and directly affected customers — as part of the optimization.'
        }
    },

    // ── Phase 5: Code Provisions ────────────────────────────
    codeProvisions: [
        {
            code: 'ISACA',
            section: 'Privacy and Confidentiality / Due Diligence',
            text: 'Information security professionals shall protect the privacy and confidentiality of information obtained in the course of professional activities and shall exercise due diligence in fulfilling their professional responsibilities — including ensuring that appropriate legal and regulatory obligations are identified and met in a timely manner. Due diligence requires active inquiry into what obligations exist, not passive waiting for complete certainty before acting on known requirements.'
        },
        {
            code: 'GIAC',
            section: 'Act Lawfully and Honestly',
            text: 'GIAC-certified professionals shall act lawfully in the conduct of their professional responsibilities and shall communicate honestly with all relevant parties. Honesty in breach response includes disclosing what is known when it is known, acknowledging what is not yet known, and not allowing incomplete information to become a reason for withholding timely disclosure of material facts from those who have a legal or ethical right to receive them.'
        },
        {
            code: 'CSF',
            section: 'ID.GV-3',
            text: 'Legal and regulatory requirements regarding cybersecurity, including privacy and civil liberties obligations, are understood and managed. This control requires organizations to maintain current awareness of their jurisdiction-specific notification obligations, to have tested response procedures that address multi-jurisdiction notification scenarios, and to integrate legal and compliance counsel into incident response decision-making from the moment a breach is confirmed — not after forensic scope is complete.'
        }
    ],
    codeConflict: {
        provision1: 'GIAC — Act Lawfully and Honestly',
        provision2: 'ISACA — Due Diligence',
        conflictDescription: 'GIAC\'s obligation to act honestly creates pressure toward immediate disclosure of what is known: the data was exposed, EU residents are affected, and the 72-hour clock is running. Honesty does not require complete information — it requires accurate communication of the information you have. Under GIAC\'s standard, withholding notification because forensics are incomplete is not prudence; it is using uncertainty as a shield.\n\nISACA\'s due diligence standard can be read in two directions. One reading supports the GC\'s position: due diligence means ensuring your disclosures are accurate, which requires waiting for verified facts. A second reading supports the Compliance Officer\'s position: due diligence means actively fulfilling your known legal obligations without manufacturing delay — and the 72-hour obligation is a known legal obligation that does not wait for forensic convenience.\n\nThe 72-hour clock forces resolution. You cannot satisfy both a narrow reading of ISACA\'s due diligence (wait for accuracy) and GIAC\'s honesty standard (disclose what you know when you know it) simultaneously. The clock makes the conflict real: by hour 72, one of these obligations wins and the other does not.'
    },

    // ── Scoring Weights ─────────────────────────────────────
    scoring: {
        evidence:     20,
        stakeholder:  20,
        framework:    40,
        codeConflict: 20
    }
};
