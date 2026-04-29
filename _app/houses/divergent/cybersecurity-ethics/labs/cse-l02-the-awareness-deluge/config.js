/* ============================================================
   CSE-L02 — The Awareness Deluge
   Brightline Health PR.AT Program Crisis Configuration

   All names, entities, incident details, dollar figures, and
   dates in this file are fictional. Brightline Health does
   not exist. Any resemblance to a real organization is
   coincidental.

   NIST CSF anchor: PR.AT (Awareness and Training) —
   subcategories PR.AT-1 through PR.AT-5, with primary focus
   on PR.AT-1 (all users informed and trained) and the tension
   between broad program reach and program signal quality.

   Red herrings: E5 (a two-year-old training completion
   compliance report that documents headcount completion
   percentages but says nothing about program effectiveness
   or alert quality — an irrelevant metric for the current
   decision) and E9 (a marketing email about Cybersecurity
   Awareness Month from a vendor, which is a promotional
   document with no analytical bearing on the program
   redesign question).
   ============================================================ */

/* EDTEngine reads this config from window scope — must be
   window.CSEL02Config, not const, so the inline boot script
   in index.html can reference it after this file loads. */
window.CSEL02Config = {
    id: 'cse-l02',
    title: 'The Awareness Deluge',
    subtitle: 'Brightline Health PR.AT Program Crisis',
    course: 'CIS2253',
    week: 1,
    chapter: 3,
    duration: 30,
    accent: '#ff00ff',

    // ── Phase 1: Brief ──────────────────────────────────────
    brief: {
        type: 'memo',
        from: 'VP Information Security',
        to: 'You (Senior SOC Analyst)',
        date: 'April 2026',
        classification: 'CONFIDENTIAL -- INTERNAL ONLY',
        content: 'As you know, Brightline Health\'s phishing simulation and security awareness program has been running for eighteen months. When the program launched, it was a genuine operational improvement: simulation click rates dropped, helpdesk reported more staff calling to ask about suspicious emails, and the SOC\'s visibility into human-layer risk improved substantially.\n\nThat is no longer what is happening.\n\nThe program is now generating more than six hundred flagged events per day. Your team\'s alert queue is backlogged four to six hours at all times. The signal-to-noise ratio has inverted: the overwhelming majority of flagged events are simulation artifacts, training notifications, and repeat flaggers who have clicked through phishing simulations more than eight times. Real phishing attempts — actual attacker-sent messages reaching real staff inboxes — are being missed because your analysts cannot process the volume. Three weeks ago a real credential-harvesting email reached eleven clinical staff members and was not surfaced until after two accounts were compromised. The breach was caught by an anomalous login alert, not by the awareness program.\n\nThe CISO, Renata Osei, is now proposing a "targeted population" approach: identify the top decile of repeat simulation failers from the past eighteen months and concentrate all future simulation and training resources on that group. The logic is sound from a risk-prioritization standpoint. The problem is that HR has reviewed the top-decile list and flagged a pattern: the population skews heavily toward non-native English speakers and night-shift clinical staff. HR\'s concern, documented in writing, is that concentrating scrutiny on this group constitutes discriminatory profiling regardless of intent.\n\nThis is the PR.AT-1 program effectiveness review you have been asked to lead. You have the data. You have HR\'s memo. You have the incident record. And you have four stakeholder groups who cannot agree on what to do next.\n\nYour recommendation is due to Renata by end of month.',
    },

    // ── Phase 2: Evidence Artifacts ─────────────────────────
    // 10 total. E5 and E9 are red herrings.
    evidence: [
        {
            id: 'E1',
            type: 'data',
            title: 'SOC Alert Volume vs. Real Incident Discovery Rate -- 18-Month Trend',
            date: '2026-04-01',
            isRedHerring: false,
            content: 'BRIGHTLINE HEALTH SOC — PR.AT PROGRAM EFFECTIVENESS METRICS\nPrepared by: SOC Lead Analyst\nReporting Period: October 2024 – March 2026\n\nTotal flagged events per day:\n  Month 1-3 (Oct–Dec 2024): avg 48/day\n  Month 4-6 (Jan–Mar 2025): avg 112/day\n  Month 7-9 (Apr–Jun 2025): avg 234/day\n  Month 10-12 (Jul–Sep 2025): avg 389/day\n  Month 13-15 (Oct–Dec 2025): avg 521/day\n  Month 16-18 (Jan–Mar 2026): avg 614/day\n\nReal phishing incidents discovered via PR.AT program (simulation flags leading to confirmed attacker activity):\n  Month 1-6: 3 incidents surfaced\n  Month 7-12: 2 incidents surfaced\n  Month 13-18: 0 incidents surfaced via program (1 incident discovered via anomalous login alert)\n\nAnalyst notes: The program has not produced a true-positive real-threat discovery in six months. Alert backlog time has grown from under 30 minutes to 4-6 hours. The program is generating noise that conceals signal. As currently configured, PR.AT has become operationally counterproductive.'
        },
        {
            id: 'E2',
            type: 'memo',
            title: 'HR Discrimination Concern Memo -- April 2026',
            date: '2026-04-08',
            isRedHerring: false,
            content: 'FROM: Diane Holloway, Director of Human Resources\nTO: Renata Osei, VP Information Security\nCC: Legal Counsel\nDATE: April 8, 2026\nSUBJECT: Concerns Regarding Proposed Targeted Training Population\n\nRenata, I have reviewed the top-decile repeat-failer list you shared last week and I need to flag a significant concern before we proceed.\n\nThe proposed targeted population of approximately 280 employees skews in ways that correlate with protected characteristics. Preliminary analysis shows that non-native English speakers are overrepresented by a factor of approximately 2.4x relative to their share of the total workforce. Night-shift clinical staff — who have documented differences in email-reading patterns due to shift timing and cognitive load at shift end — represent approximately 38% of the targeted population versus 21% of the total workforce.\n\nConcentrating ongoing phishing simulation scrutiny, training requirements, and implied performance evaluation on this population, without addressing the structural factors that explain their higher simulation failure rates, constitutes disparate impact regardless of intent. This is particularly acute because the simulation emails are designed in formats and language registers that may disadvantage non-native English speakers in ways that have nothing to do with their actual susceptibility to real phishing.\n\nI am not able to support deployment of the targeted approach as currently designed. I would strongly recommend a program redesign that addresses the structural causes of the pattern before any targeting decision is made.\n\nDiane Holloway'
        },
        {
            id: 'E3',
            type: 'memo',
            title: 'CISO Targeted Approach Proposal -- March 2026',
            date: '2026-03-22',
            isRedHerring: false,
            content: 'FROM: Renata Osei, VP Information Security\nTO: SOC Senior Analyst, HR Director, Clinical Operations VP\nDATE: March 22, 2026\nSUBJECT: PR.AT Program Redesign — Targeted Population Proposal\n\nBased on eighteen months of simulation data and the alert volume analysis provided by the SOC, I am proposing the following program changes for the next fiscal year:\n\n1. Identify the top 10% of repeat simulation failers over the past 18 months. This population represents approximately 280 employees.\n\n2. Concentrate all phishing simulation frequency, mandatory training requirements, and follow-up coaching on this group. The remaining 2,520 employees would shift to a quarterly awareness touchpoint only, eliminating the simulation event load that currently drives 70%+ of our alert volume.\n\n3. Expected outcome: alert volume reduction of approximately 65-70%. Analyst capacity freed for genuine threat monitoring. Training resources focused where statistical risk is highest.\n\n4. Metrics: we would track simulation failure rates, training completion, and real-incident involvement for the targeted population quarterly.\n\nI believe this is the right operational call. I understand HR has concerns about the population composition, and I want to work through those before we proceed. This proposal is not final — I am asking for input.'
        },
        {
            id: 'E4',
            type: 'testimony',
            title: 'Clinical Operations VP Complaint -- Simulation Disruption During Patient Care',
            date: '2026-03-18',
            isRedHerring: false,
            content: 'FROM: Dr. Marcus Webb, VP Clinical Operations\nTO: Renata Osei, VP Information Security\nDATE: March 18, 2026\nSUBJECT: Phishing Simulations and Patient Care Disruption\n\nRenata, I need to raise a concern that I have been sitting on for several months because I did not want to seem obstructionist. I can\'t stay quiet about it anymore.\n\nOur clinical staff are receiving phishing simulation emails at a rate that is incompatible with patient care workflows. We have nurses receiving simulation emails mid-shift, on devices that are also used for patient record access and medication verification. The follow-up training notifications arrive with no regard for shift timing — I have documented instances of training emails arriving at 3:00 AM for night-shift staff who have just ended a twelve-hour shift.\n\nIn three incidents I can document, clinical staff have paused active patient care activities to respond to what they believed was a real security alert triggered by a phishing simulation. In one case, a medication administration was delayed by eleven minutes while a nurse tried to reach the IT helpdesk about a suspicious email that turned out to be a simulation.\n\nI am not opposed to cybersecurity training. I am opposed to a program that is actively competing with patient care for clinical staff attention. I would ask that any redesign of this program involve clinical operations leadership from the start, not as an afterthought.\n\nDr. Marcus Webb'
        },
        {
            id: 'E5',
            type: 'data',
            title: 'FY2024 Annual Training Completion Compliance Report',
            date: '2025-02-14',
            isRedHerring: true,  // Red herring: headcount completion rates say nothing about program effectiveness or alert quality. 100% completion rate is fully compatible with the current crisis.
            content: 'BRIGHTLINE HEALTH — FY2024 ANNUAL SECURITY TRAINING COMPLIANCE REPORT\nPrepared by: IT Security Compliance Team\nDate: February 14, 2025\n\nOverall annual training completion rate: 96.2%\nClinical staff completion rate: 94.8%\nAdministrative staff completion rate: 97.9%\nIT staff completion rate: 98.6%\n\nCompletion rate by department:\n  Emergency Department: 93.1%\n  ICU/Critical Care: 95.4%\n  Radiology: 97.2%\n  Administration: 98.1%\n  Finance: 97.6%\n\nAll departments exceed the 90% compliance threshold required by Brightline Health policy and applicable healthcare regulatory standards.\n\nNote: This report measures whether staff completed assigned training modules — a headcount completion metric. It does not measure whether staff retained training content, whether simulation performance improved following training, or whether the training content is appropriate for the populations being trained. A 96.2% completion rate is fully consistent with the program effectiveness crisis documented in E1. Completion is not the same as effectiveness. Relying on this document to assess the current program\'s value would be a category error.'
        },
        {
            id: 'E6',
            type: 'data',
            title: 'NIST CSF v1.1 -- PR.AT Subcategory Definitions',
            date: '2018-04-16',
            isRedHerring: false,
            content: 'SOURCE: NIST Cybersecurity Framework Version 1.1, April 2018\nFunction: PROTECT (PR)\nCategory: Awareness and Training (AT)\n\nPR.AT-1: All users are informed and trained.\nInformative references: CIS CSC 17, COBIT 5 APO07.03, ISA 62443-2-1, ISO/IEC 27001 A.7.2.2, NIST SP 800-53 AT-2.\n\nPR.AT-2: Privileged users understand roles and responsibilities.\nInformative references: CIS CSC 5, COBIT 5 APO07.02, ISA 62443-2-1, ISO/IEC 27001 A.6.1.1, NIST SP 800-53 AT-3.\n\nPR.AT-3: Third-party stakeholders (e.g., suppliers, customers, partners) understand roles and responsibilities.\nInformative references: COBIT 5 APO07.03, ISA 62443-2-1, ISO/IEC 27001 A.6.1.1, NIST SP 800-53 AT-3.\n\nPR.AT-4: Senior executives understand roles and responsibilities.\nInformative references: COBIT 5 APO07.03, ISA 62443-2-1, ISO/IEC 27001 A.6.1.1, NIST SP 800-53 AT-3.\n\nPR.AT-5: Physical and information security personnel understand roles and responsibilities.\nInformative references: COBIT 5 APO07.03, ISA 62443-2-1, ISO/IEC 27001 A.6.1.1, NIST SP 800-53 AT-3.\n\nApplication: PR.AT-1 requires that ALL users be informed and trained — not a selected subset. The proposed targeting approach (E3) would reduce simulation and training intensity for 90% of the workforce. Whether this constitutes non-compliance with PR.AT-1 depends on whether a quarterly awareness touchpoint for the general population meets the "informed and trained" threshold, and whether concentrating resources on a top-decile subpopulation identified by discriminatory proxies (E2) satisfies the program\'s equity obligations.'
        },
        {
            id: 'E7',
            type: 'testimony',
            title: 'Real Phishing Breach -- Credential Compromise During Alert Backlog',
            date: '2026-03-04',
            isRedHerring: false,
            content: 'BRIGHTLINE HEALTH SOC — INCIDENT REPORT INC-2026-031\nDate: March 4, 2026\nClassification: Confidential\n\nAt 11:14 AM on March 4, a credential-harvesting phishing email was delivered to eleven Brightline Health email accounts in the Radiology and Finance departments. The email spoofed an internal IT notification regarding a password expiration and included a link to a convincing credential capture page.\n\nTwo accounts entered credentials within 35 minutes of email delivery: one Radiology Technician and one Finance Analyst. The attacker used these credentials to access the employee portal and the payroll system within 47 minutes of initial phishing delivery.\n\nThe phishing email was NOT flagged by the PR.AT monitoring system. It was not identified as a simulation artifact (it was not). It was not flagged by an analyst — the SOC queue at the time of delivery was backlogged 5 hours and 22 minutes.\n\nDiscovery: The incident was detected at 3:41 PM via an anomalous login alert when the attacker attempted to access a system outside the compromised accounts\' normal access pattern.\n\nTotal exposure window: 4 hours 27 minutes between phishing delivery and account isolation.\n\nRoot cause assessment: The SOC alert backlog, driven primarily by PR.AT simulation event volume, directly delayed analyst review of the malicious email. The program designed to prevent phishing harm contributed to the conditions under which phishing harm occurred.'
        },
        {
            id: 'E8',
            type: 'data',
            title: 'Peer Hospital Case Study -- Awareness Program Redesign at Meridian General',
            date: '2025-11-01',
            isRedHerring: false,
            content: 'PUBLISHED CASE STUDY: Redesigning a Healthcare Security Awareness Program for Clinical Workflow Compatibility\nSource: Meridian General Health System (fictional peer), November 2025\n\nMeridian General faced a similar alert-volume crisis eighteen months ago: a phishing simulation program generating over 400 events per day with declining real-threat discovery rates. Their redesign process took four months and involved three structural changes:\n\n1. Shift-aware delivery scheduling: All simulation and training notifications are now scheduled to arrive within the first hour of each staff member\'s shift, based on their documented schedule. Delivery to night-shift staff during waking hours increased engagement and reduced simulation-related care disruption to zero.\n\n2. Language-adaptive simulation design: Simulation emails are now available in seven languages and are matched to the staff member\'s documented primary language. Multilingual simulation content reduced simulation failure rates for non-native English speakers by 41% within two quarters, without removing them from the simulation population.\n\n3. Tiered alert triage: Simulation artifacts are processed by automated scoring before reaching analyst queues. Only simulation events that match known real-attacker signatures are escalated. This alone reduced analyst-reviewed alert volume by 74%.\n\nOutcome: Real-threat discovery via the program increased. Analyst alert backlog dropped to under 30 minutes. No workforce profiling claims were made during the redesign period.\n\nNote: This case study describes a peer organization\'s approach. Brightline Health\'s redesign may differ based on its specific workforce composition, EHR systems, and operational constraints. The Meridian approach is presented as a proven alternative to targeting that achieves the operational goal without the equity concerns raised in E2.'
        },
        {
            id: 'E9',
            type: 'news',
            title: 'Vendor Email -- Cybersecurity Awareness Month Promotional Campaign',
            date: '2025-10-01',
            isRedHerring: true,  // Red herring: This is a vendor promotional email. It has no analytical bearing on program design, workforce equity, or alert triage decisions.
            content: 'SUBJECT: It\'s Cybersecurity Awareness Month — Is Your Team Ready?\nFROM: SecureAware Pro Sales Team\nTO: Brightline Health IT Security\nDATE: October 1, 2025\n\nOctober is Cybersecurity Awareness Month! This is the perfect time to review your organization\'s security awareness training program and make sure your team is prepared for the latest threats.\n\nSecureAware Pro is offering a 20% discount on our enterprise phishing simulation platform through October 31. Our platform includes:\n — Unlimited phishing simulations across your entire workforce\n — 500+ customizable phishing template library\n — Automated remedial training for simulation failures\n — Real-time executive dashboard\n — Compliance reporting for HIPAA, SOC 2, and PCI-DSS\n\nBrightline Health is already a SecureAware Pro customer. Upgrade to our Enterprise tier today and unlock advanced analytics and dedicated customer success management.\n\nNote: This is a vendor promotional email. It advocates for expanding phishing simulation volume — the exact operational condition that produced the current crisis. It contains no analysis of program effectiveness, workforce equity, or alert triage quality. The fact that SecureAware Pro benefits financially from higher simulation volume makes this document an unreliable source for program redesign recommendations. It is not evidence of anything except that the vendor wants to upsell.'
        },
        {
            id: 'E10',
            type: 'data',
            title: 'AI-Powered Targeted Training Vendor Pitch -- FilterSense Health Edition',
            date: '2026-02-10',
            isRedHerring: false,
            content: 'FILTERSENSE HEALTH EDITION — TARGETED SECURITY AWARENESS PLATFORM\nVendor Pitch Deck Summary, February 2026\nPresented to: Brightline Health VP Information Security\n\nFilterSense uses machine learning to identify individual risk scores across your workforce and concentrates simulation and training resources on the highest-risk individuals. Key features:\n\n — Behavioral risk scoring: Combines simulation history, email interaction patterns, role, department, and tenure into a composite risk score\n — Adaptive simulation frequency: High-risk individuals receive 3-5x simulation events per month; low-risk individuals receive one per quarter\n — Automated training assignment: Failed simulations trigger immediate micro-training modules without analyst intervention\n — Privacy controls: Risk scores are stored as aggregate categories, not individual identifiers, in the vendor system\n\nFilterSense claims a 58% reduction in alert analyst volume and a 34% improvement in real-threat detection rates in pilot deployments at three unnamed healthcare clients.\n\nNotes for evaluation: FilterSense\'s risk scoring algorithm is a black box — the vendor has not provided documentation of what behavioral signals drive high scores or whether those signals correlate with protected characteristics. If the underlying model overweights email-interaction patterns that correlate with shift timing or language preference, it may replicate the discriminatory impact identified in E2 while obscuring it behind an algorithmic layer. HR\'s concerns (E2) are not resolved by delegating the targeting decision to a vendor algorithm. The claims about real-threat detection improvement have not been independently validated.'
        }
    ],

    // ── Phase 3: Stakeholders ───────────────────────────────
    stakeholders: [
        {
            id: 'S1',
            name: 'You (Senior SOC Analyst)',
            obvious: true
        },
        {
            id: 'S2',
            name: 'Renata Osei (CISO / VP Information Security)',
            obvious: true
        },
        {
            id: 'S3',
            name: 'HR Department (Discrimination and Workforce Equity)',
            obvious: true
        },
        {
            id: 'S4',
            name: 'Clinical Staff (including Night-Shift and Non-Native English Speakers)',
            obvious: true
        },
        {
            id: 'S5',
            name: 'IT Helpdesk (First-Line Alert Triage)',
            obvious: true
        },
        {
            id: 'S6',
            name: 'Patients (Whose Data Is Exposed by Successful Phishing)',
            obvious: false
        },
        {
            id: 'S7',
            name: 'Top-Decile Repeat Failers (Targeted Population)',
            obvious: false
        },
        {
            id: 'S8',
            name: 'Night-Shift Staff as a Structural Disadvantaged Group',
            obvious: false
        },
        {
            id: 'S9',
            name: 'The Next Phishing Attacker Who Benefits From SOC Alert Fatigue',
            obvious: false
        },
        {
            id: 'S10',
            name: 'Hospital Board and Healthcare Regulators (HIPAA Breach Exposure)',
            obvious: false
        },
        {
            id: 'S11',
            name: 'Broader Healthcare Cybersecurity Community (Program Design Precedent)',
            obvious: false
        },
        { id: 'S12', name: 'HVAC Maintenance Vendor', obvious: false, irrelevant: true },
        { id: 'S13', name: 'Cafeteria Management Contractor', obvious: false, irrelevant: true }
    ],
    minStakeholders: 4,

    // ── Phase 3: Decisions ──────────────────────────────────
    decisions: [
        {
            id: 'D1',
            text: 'Implement a universal training redesign: restructure the program for all 2,800 employees with shift-aware scheduling, language-adaptive simulation content, and automated alert triage — no targeting by past simulation performance.',
            framework: 'deontological'
        },
        {
            id: 'D2',
            text: 'Implement risk-based targeting with HR-approved safeguards: proceed with concentrating simulation resources on high-risk individuals, but require a demographic impact assessment before deployment and mandate quarterly equity reviews.',
            framework: 'utilitarian'
        },
        {
            id: 'D3',
            text: 'Pause all phishing simulations entirely and propose a ground-up program redesign with mandatory clinical workflow input, HR co-design, and a defined quality gate before simulations resume.',
            framework: 'virtue'
        },
        {
            id: 'D4',
            text: 'Continue the current program without structural changes, but increase SOC analyst staffing to manage the alert volume and add a dedicated triage layer to separate simulation artifacts from real threats.',
            framework: 'consequentialist'
        }
    ],

    // ── Phase 4: Framework Challenges ──────────────────────
    frameworkChallenges: {
        'D1': {
            supporting: 'A deontological analysis grounds this decision in the obligation of equal treatment as a moral baseline. PR.AT-1 defines the obligation as ensuring "all users are informed and trained" — the framework does not contain a provision for concentrating training on subpopulations identified by past performance metrics that are confounded by structural disadvantages. The HR concern (E2) is not merely a legal risk; it is a moral signal that the targeting approach uses a proxy for individual susceptibility that is in fact a proxy for language access and shift schedule. A deontological framework asks whether the maxim underlying the targeting approach — "concentrate scrutiny on the group most likely to fail" — could be universalized without discriminating against people on the basis of characteristics that are morally irrelevant to their cybersecurity responsibility. The answer is no, because the "most likely to fail" population is defined by conditions the organization created (simulation design in English, simulation delivery without shift awareness) rather than by intrinsic employee characteristics.\n\nThe universal redesign approach also addresses the structural causes identified by Dr. Webb (S4, E4): shift-aware delivery and language-adaptive content resolve the conditions that created the top-decile population in the first place. The peer case study at Meridian General (E8) demonstrates that universal redesign achieves the operational goals — alert volume reduction, real-threat discovery improvement — without the equity costs.',

            challenging: 'A consequentialist challenge to D1 is immediate and operational: the March 4 phishing breach (E7) demonstrates that the current program is actively enabling harm right now. The alert backlog that allowed a real credential-harvesting email to sit unreviewed for five hours while two accounts were compromised is not a future risk — it is a present operational failure. A universal redesign will take months to design, validate, implement, and deploy. During that entire period, the same conditions that produced the March 4 breach continue unchanged. S9, the next phishing attacker, does not wait for program redesign timelines.\n\nThere is also a practical challenge from S2 (Renata Osei) and S10 (the hospital board and HIPAA regulators): a program redesign that does not address alert volume in the near term may not satisfy the organization\'s regulatory obligation to maintain adequate safeguards under applicable healthcare privacy and security requirements. The consequentialist asks: what is the bridge plan between now and the redesigned program, and who is harmed during that interval?',

            incomplete: 'This decision does not specify what happens to the top-decile failers during the redesign period. The 280 employees currently in the targeted population represent the highest documented simulation-failure risk in the organization. A redesign that deprioritizes their specific training situation — even temporarily — while the new program is built and validated leaves a gap that the current analysis does not address. A complete deontological analysis of D1 must also grapple with the question of whether equal treatment obligates equal resources, or whether equal treatment sometimes requires differentiated resources to achieve comparable outcomes. The Meridian case study (E8) suggests the answer is differentiated resources (shift-aware, language-adaptive) rather than uniform program design.'
        },
        'D2': {
            supporting: 'A utilitarian analysis in favor of D2 focuses on aggregate outcomes across all affected parties. The March 4 incident (E7) documents a real patient data breach attributable to alert fatigue. The six-hundred-event-per-day backlog (E1) creates ongoing risk for S6 (patients whose data is exposed by successful phishing) every day the program continues at its current volume. Risk-based targeting, implemented with HR-approved safeguards, achieves the primary operational goal — alert volume reduction, improved real-threat discovery — while the safeguards address the equity concern raised in E2. A demographic impact assessment before deployment, paired with quarterly equity reviews, transforms the targeting decision from a one-time demographic snapshot into a monitored process that can self-correct if discriminatory patterns emerge.\n\nThe CISO\'s original proposal (E3) was made in good faith and the operational logic is sound: statistical risk concentration is a legitimate basis for resource allocation in security programs. The utilitarian case for D2 is that the safeguards proposed here convert a problematic implementation of a sound idea into a defensible implementation. S6 (patients), S10 (the hospital board and regulators), and S9 (the next attacker who benefits from alert fatigue) all benefit from a program that rapidly reduces noise and increases real-threat detection, even if the targeting population requires careful equity monitoring.',

            challenging: 'HR\'s concern (E2) is not resolved by adding an equity review process to a targeting approach that HR has already assessed as carrying discriminatory impact. The memo states clearly that Diane Holloway cannot support the targeted approach as currently designed. An HR-approved safeguard framework that does not change the fundamental targeting criterion — past simulation failure rates, which correlate with language access and shift timing — does not address the root cause of the disparate impact. It monitors a harm it does not prevent.\n\nA deeper challenge: the FilterSense vendor pitch (E10) demonstrates that algorithmic targeting can replicate discriminatory impact while obscuring it behind a black-box model. Adding "HR-approved safeguards" to a targeting process whose criteria have not been structurally changed does not guarantee that the resulting targeting list is materially different from the original top-decile list. The Meridian case study (E8) provides a path that achieves the same operational outcome — alert volume reduction — without targeting at all. If the goal can be achieved without the equity risk, the utilitarian calculus that justifies the equity risk is incomplete.',

            incomplete: 'D2 does not specify what "HR-approved safeguards" means in operational terms. An equity review process is only as strong as the criteria it applies and the authority it carries. If HR can flag disparate impact but cannot halt deployment, the safeguard is advisory rather than protective. If the demographic impact assessment requires a specific statistical threshold to trigger redesign of the targeting criteria, what is that threshold — and who sets it? S7 (the top-decile failers, who are the subjects of the targeting) and S8 (night-shift staff as a structurally disadvantaged group) are not protected by a process that documents their overrepresentation without acting on it. A complete utilitarian analysis of D2 must specify the conditions under which the safeguards result in actual program modification, not just documentation of harm.'
        },
        'D3': {
            supporting: 'Virtue ethics frames this decision through the question of institutional integrity and practical wisdom. The Brightline Health PR.AT program has reached a state where it is causing harm — to patient data security (E7), to clinical workflow integrity (E4), to workforce equity (E2), and to analyst effectiveness (E1). A program that causes harm in all four of these dimensions simultaneously is not a program that should be iteratively adjusted; it is a program that should be stopped and rebuilt. The virtuous organization does not optimize a harmful process — it stops the process, understands the failure modes, and builds something better with the involvement of the people most affected.\n\nThe ground-up redesign with mandatory clinical workflow input honors S4 (clinical staff including night-shift and non-native English speakers) by treating them as design stakeholders rather than as a population to be managed. It honors S3 (HR) by making equity a design criterion rather than a retrospective safeguard. The quality gate before simulations resume ensures that the redesigned program has been validated before it is imposed on a workforce that has already experienced significant disruption. This is the approach the Meridian General case study (E8) describes — four months of collaborative redesign that produced durable results.',

            challenging: 'A consequentialist challenge to D3 is direct: pausing all phishing simulations does not pause real phishing attacks. S9 (the next attacker who benefits from organizational security gaps) continues to operate during the entire redesign period. The March 4 breach (E7) occurred in a period when the simulation program was actively running — but the conditions that produced it (alert backlog, analyst overload) would not be resolved simply by pausing simulations. Without the alert volume, analysts would have capacity to review real threats more effectively, which is an operational benefit. But during the redesign period, the organization also has no active simulation program reinforcing staff vigilance — which may increase the real phishing susceptibility of the 2,800 employees who are no longer receiving any simulation exposure.\n\nThere is also a regulatory challenge: S10 (hospital board and healthcare regulators) may view a complete pause in the security awareness program as a gap in the organization\'s documented security controls. Depending on the applicable regulatory framework, a documented lapse in PR.AT program activity may require disclosure or remediation documentation.',

            incomplete: 'This decision does not specify what interim protective measures replace the simulation program during the redesign period. If phishing simulations are paused for four months while the redesign is underway — following the Meridian timeline (E8) — what compensating controls are in place to detect and respond to real phishing during that interval? A virtue ethics analysis that recommends stopping a harmful thing without specifying what replaces it during the transition is incomplete. A complete analysis of D3 must include a bridge plan: enhanced real-time monitoring, increased analyst capacity during the redesign period, or targeted communications to staff about active threat awareness during the program pause.'
        },
        'D4': {
            supporting: 'A consequentialist analysis in favor of D4 focuses on certainty of outcome. The current program\'s alert volume problem has a known, direct operational cause: there are too many alerts for the current analyst team to process at the current staffing level. Additional staffing and a dedicated simulation-artifact triage layer — separating the simulation noise before it reaches analyst queues — addresses this root cause without requiring a program redesign (which carries redesign timeline risk), without the equity concerns of targeting (E2), and without a program pause (which carries regulatory and operational risk). The operational benefit — reduced analyst backlog, improved real-threat detection — is achievable via this path within a shorter timeframe than any redesign.\n\nFrom S6\'s perspective (patients whose data is at risk from phishing), D4 is the fastest path to a competent SOC response to real threats. The March 4 breach (E7) was enabled by a five-hour backlog. A dedicated triage layer that removes simulation artifacts before they reach analyst queues could have reduced that backlog significantly on the day of the breach. Consequentialism evaluates outcomes — and staffing plus triage delivers the outcome that matters most to the most vulnerable stakeholder group.',

            challenging: 'The consequentialist case for D4 must account for the long-term costs it does not resolve. Adding analyst staffing and a triage layer is an operational patch on a program that is generating six hundred events per day and rising (E1). The trend is month-over-month growth. If the root cause — simulation volume calibration, alert design, the absence of automated triage logic — is not addressed, the staffing requirement will continue to grow. Healthcare organizations facing persistent workforce shortages cannot scale analyst headcount indefinitely to compensate for program design failures.\n\nThere is also the clinical disruption concern (E4): Dr. Webb\'s documentation of patient care delays caused by simulation delivery during active clinical workflows is not resolved by adding SOC analysts. The simulation emails that interrupt clinical staff during patient care continue to arrive regardless of how many analysts are processing the resulting alerts. D4 addresses analyst workload but does not address the clinical safety concern, the language-access concern (E2), or the program design problem that makes the simulations themselves disproportionately harmful to specific populations (S4, S7, S8).',

            incomplete: 'This decision does not address the equity concern raised in E2 at all. The HR memo identifies a discriminatory impact pattern in the current program design — specifically, that non-native English speakers and night-shift staff are overrepresented in simulation failure rates due to structural factors the organization created. Adding analyst staffing does not change the simulation program design that produces this pattern. The top-decile failers (S7) and night-shift staff as a structural group (S8) continue to experience higher simulation frequency, higher training assignment rates, and documented implicit profiling regardless of how the SOC manages the downstream alert volume. A complete consequentialist analysis of D4 must evaluate all consequences — including the ongoing equity harm — not only the analyst workload consequences.'
        }
    },

    // ── Phase 5: Code Provisions ────────────────────────────
    codeProvisions: [
        {
            code: 'GIAC',
            section: 'Act Lawfully / Do Not Enable Harm',
            text: 'GIAC-certified professionals shall act lawfully and shall not take actions that enable harm to systems, organizations, or individuals. This obligation extends to the design and operation of security programs: a security program that creates conditions enabling successful attacks — through alert fatigue, program design failures, or operational neglect — is itself a form of harm-enabling conduct that a certified professional has an affirmative obligation to identify and correct. (Paraphrased from GIAC Code of Ethics.)'
        },
        {
            code: 'ISACA',
            section: 'Objectivity and Due Diligence',
            text: 'ISACA members and CISA-certified professionals shall perform their duties with objectivity and shall exercise due diligence in assessing risk and recommending controls. Objectivity requires that analysis be based on evidence rather than organizational preference, that findings be reported honestly even when they implicate the organization\'s own program decisions, and that recommendations account for all affected parties — including parties whose interests are not represented in the decision-making room. (Paraphrased from ISACA Code of Professional Ethics.)'
        },
        {
            code: 'NIST CSF',
            section: 'PR.AT-1',
            text: 'All users are informed and trained. The organization\'s security awareness program ensures that all users — regardless of role, shift schedule, or language background — receive appropriate and effective security training calibrated to their risk exposure and operational context. Training effectiveness is assessed through outcome metrics (real-threat detection, incident rates) rather than completion metrics alone.'
        }
    ],
    codeConflict: {
        provision1: 'GIAC — Do Not Enable Harm',
        provision2: 'ISACA — Objectivity and Equal Treatment',
        conflictDescription: 'GIAC\'s harm-enabling prohibition creates a clear affirmative duty: the current PR.AT program is enabling harm. Alert fatigue contributed directly to the March 4 breach (E7), and the trend line in E1 shows the problem worsening month over month. A professional who sees a security program creating conditions for successful attacks has a GIAC-grounded obligation to change the program — which in this case means either restructuring it universally (D1, D3) or targeting it (D2) to reduce alert volume fast.\n\nISACA\'s objectivity requirement creates a different kind of duty: any recommendation must be based on impartial evidence and must account for all affected parties. An objective analysis of the targeting approach (E3) must include E2 — HR\'s documented finding of discriminatory impact — and must give equal weight to the interests of S7 and S8 (the targeted population) as to the interests of S6 (patients) and S9 (the attacker benefiting from alert fatigue). Objectivity does not permit selecting the evidence that supports the fastest operational fix and discarding the equity evidence.\n\nThe conflict is this: GIAC\'s harm-enabling prohibition creates urgency — change the program now, because every day of delay enables real attacks. ISACA\'s objectivity requirement creates caution — do not implement a change that trades one form of harm (alert fatigue enabling attacks) for another form of harm (discriminatory targeting enabling workforce inequity). Which obligation governs when urgency and equity point in different directions? And who has standing to answer that question — the SOC analyst, the CISO, HR, or the hospital board?'
    },

    // ── Scoring Weights ─────────────────────────────────────
    scoring: {
        evidence:     20,   // auto-graded: tagging accuracy and explanation quality
        stakeholder:  20,   // auto-graded: count + non-obvious stakeholder discovery
        framework:    40,   // instructor-graded: framework response quality
        codeConflict: 20    // auto-graded partial (completion) + instructor spot-check
    }
};
