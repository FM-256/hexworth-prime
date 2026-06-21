/* ============================================================
   Security+ Cert Prep -- Risk Register Review: Veridian Financial
   Blue-team qualitative risk management | find-and-submit flags
   Students read a risk register and risk policy, compute Likelihood
   x Impact scores, apply risk appetite thresholds, and determine
   the correct risk treatment for the highest-scoring risk.
   SY0-701: 5.2 (risk management -- qualitative risk assessment,
            risk treatments, risk appetite/tolerance)
   ============================================================ */

// window assignment (not const) so the second <script> block in index.html
// can reference VFRRConfig after this script has loaded.
window.VFRRConfig = {

    // =========================================================
    // BOX METADATA
    // =========================================================

    id:            'shield-sp-blueteam-risk-register',
    title:         'Risk Register Review',
    subtitle:      'Veridian Financial -- Qualitative Risk Assessment',
    description:   'Veridian Financial\'s CISO tasked you with reviewing the annual risk register. Eight identified risks each carry a Likelihood (1-5) and Impact (1-5) rating. Using the org\'s risk policy, compute the risk scores, identify which risks exceed the appetite threshold, and determine the correct treatment for the highest-scoring risk.',
    difficulty:    'Intermediate',
    estimatedTime: 35,
    accent:        '#2563eb',
    storageKey:    'hexworth_lab_sp_blueteam_risk_register',
    registryId:    'shield-sp-blueteam-risk-register',
    trackerKey:    'lab_sp_blueteam_risk_register',

    // Blue-team mode tells BoxEngine to accept BlueTeam device types
    blueTeamMode: true,

    // =========================================================
    // BOOT SEQUENCE
    // =========================================================

    boot: {
        biosLines: [
            'VERIDIAN FINANCIAL RISK ANALYST WORKSTATION v2.1.0',
            'Risk Management Analyst -- Tier-2 Access',
            'Ubuntu 22.04.4 LTS: LOADING',
            'Risk register mount: /home/analyst -- READY',
            'Review cycle: Q2 2026 -- Annual Risk Assessment',
            'Ticket: RM-2026-0601-012 -- AWAITING ANALYST REVIEW'
        ],
        grubEntries: [
            'Ubuntu 22.04.4 LTS (Risk Mgmt Analyst)',
            'Ubuntu 22.04.4 LTS (recovery mode)'
        ],
        loginUser: 'analyst'
    },

    // =========================================================
    // LORE
    // =========================================================

    lore: {
        intro: 'RM-2026-0601-012 landed in your queue: "Q2 annual risk register review -- 8 identified risks require analyst scoring and treatment assignment before board reporting." The register lists every risk with its Likelihood (1-5) and Impact (1-5) already rated by the risk owners. Your job is to compute the scores, apply the policy thresholds, and determine the correct treatment for the highest-scoring risk.',

        scenario: 'Read /home/analyst/risk_register.txt for the 8 risks with their Likelihood and Impact values. Read /home/analyst/risk_policy.txt for Veridian\'s risk appetite and tolerance thresholds. Read /home/analyst/concepts.txt to review the qualitative risk framework and the four treatment options. Complete the assessment task in /home/analyst/assessment_task.txt and submit your findings as flags.',

        outro: 'Risk register review complete. The unpatched internet-facing web portal vulnerability (R-01) correctly scored as the highest risk at Likelihood 5 x Impact 5 = 25. Three risks exceeded the policy\'s unacceptable threshold of 15 and require mandatory treatment. The off-site backup tape risk (R-07) scored within the acceptance band at 4. Risk treatment for R-01 is mitigate -- the exposure can be directly reduced by patching. These are the core SY0-701 Domain 5 skills: qualitative risk scoring, appetite application, and treatment selection.',

        goals: [
            'Compute the Likelihood x Impact score for all 8 risks in the register',
            'Identify the risk with the highest score (unique -- no tie)',
            'Apply the policy appetite threshold to count how many risks exceed it',
            'Identify the risk correctly accepted as within the appetite band',
            'Select the correct risk treatment for the highest-scoring risk from the controlled vocabulary'
        ],

        toolkit: [
            { name: 'cat',  purpose: 'Display a full file',             sample: 'cat /home/analyst/risk_register.txt' },
            { name: 'grep', purpose: 'Search for a pattern in a file',  sample: 'grep "R-01" /home/analyst/risk_register.txt' },
            { name: 'head', purpose: 'Show first N lines of a file',    sample: 'head -n 40 /home/analyst/risk_register.txt' },
            { name: 'tail', purpose: 'Show last N lines of a file',     sample: 'tail -n 20 /home/analyst/risk_register.txt' },
            { name: 'find', purpose: 'Locate files in a directory',     sample: 'find /home/analyst -name "*.txt"' },
            { name: 'ls',   purpose: 'List directory contents',         sample: 'ls /home/analyst/' },
            { name: 'help', purpose: 'Show available commands',         sample: 'help' }
        ]
    },

    // =========================================================
    // TERMINAL CONFIG
    // =========================================================

    terminal: {
        user:     'analyst',
        hostname: 'risk-ws-01',
        startDir: '/home/analyst',
        welcome:  'Veridian Financial -- Risk Management Analyst Terminal\nTier-2 Access | RM-2026-0601-012 Active\n\nRisk review files:\n  /home/analyst/risk_register.txt    8 identified risks (L and I values)\n  /home/analyst/risk_policy.txt      Risk appetite, tolerance, thresholds\n  /home/analyst/concepts.txt         Qualitative risk framework + treatments\n  /home/analyst/assessment_task.txt  What you need to determine and submit\n\nRead the register and policy. Compute L x I for each risk.\nSubmit your findings via the Submit Flag panel.\n\nType "help" for available commands.\n'
    },

    // =========================================================
    // DESKTOP ICONS
    // =========================================================

    desktop: {
        icons: [
            { id: 'terminal',  label: 'Terminal',    icon: 'T', app: 'terminal'  },
            { id: 'logviewer', label: 'Log Viewer',  icon: 'L', app: 'logviewer' },
            { id: 'notes',     label: 'Notes',       icon: 'N', app: 'notes'     },
            { id: 'hints',     label: 'Hints',       icon: 'H', app: 'hints'     },
            { id: 'flags',     label: 'Submit Flag', icon: 'F', app: 'flags'     }
        ]
    },

    // =========================================================
    // SIMULATED FILESYSTEM
    //
    // /home/analyst/
    //   risk_register.txt    -- 8 risks with ID, asset, L, I, and context
    //   risk_policy.txt      -- appetite threshold (>=15 unacceptable), band (<=4 accept)
    //   concepts.txt         -- qualitative risk framework, 4 treatments, inherent/residual
    //   assessment_task.txt  -- names the 5 questions (flags); lists treatment vocabulary
    //   notes.txt            -- analyst scratch pad with scoring grid
    //
    // FLAG DISCOVERY MAP (all values discoverable by reading + computing from the files):
    //
    //   RISK SCORES (L x I):
    //     R-01: L=5, I=5, score=25  <-- unique highest
    //     R-02: L=4, I=5, score=20
    //     R-03: L=3, I=4, score=12
    //     R-04: L=4, I=4, score=16
    //     R-05: L=3, I=3, score=9
    //     R-06: L=2, I=4, score=8
    //     R-07: L=2, I=2, score=4   <-- unique lowest; within <=4 acceptance band
    //     R-08: L=2, I=3, score=6
    //
    //   highest_risk_id        -> R-01 (score 25, unique -- no tie)
    //   highest_risk_score     -> 25 (integer)
    //   accept_candidate_id    -> R-07 (score 4; threshold <=4 per policy)
    //   treatment_for_highest  -> mitigate (R-01 is a patchable vuln; context makes this unambiguous)
    //   risks_over_appetite    -> 3 (R-01=25, R-02=20, R-04=16 all >= 15)
    //
    // ANTI-LEAK VERIFICATION:
    //   - risk_register.txt contains L and I values; it does NOT contain the computed LxI products
    //   - risk_policy.txt states the threshold rules; it does NOT name which risks exceed them
    //   - assessment_task.txt names the 4 treatment words (vocabulary, not the answer)
    //   - concepts.txt teaches the framework; it does NOT identify which risk to accept or treat
    //   - No file except {{FLAG:*}} final hints reveals the answer values
    // =========================================================

    filesystem: {
        '/': {
            type: 'dir',
            children: {

                'home': {
                    type: 'dir',
                    children: {
                        'analyst': {
                            type: 'dir',
                            children: {

                                // ── RISK REGISTER ────────────────────────────────────
                                // Each risk entry provides:
                                //   Risk ID, Asset, Likelihood (1-5), Impact (1-5), Context.
                                // The file does NOT contain pre-computed LxI scores --
                                // the student must multiply L x I for each risk themselves.
                                // Context for R-01 makes "mitigate" the clear treatment
                                // (patch exists, vendor advisory issued, reducible).
                                // Context for R-07 makes "accept" appropriate (low-value
                                // asset, encrypted tapes would cost more than the risk).
                                'risk_register.txt': {
                                    type: 'file',
                                    content: [
                                        'VERIDIAN FINANCIAL -- ANNUAL RISK REGISTER',
                                        '==========================================',
                                        'Review Cycle  : Q2 2026',
                                        'Classification: INTERNAL -- RESTRICTED',
                                        'Owner         : Chief Information Security Officer',
                                        'Ticket        : RM-2026-0601-012',
                                        '',
                                        'SCORING SCALE',
                                        '  Likelihood  1=Rare  2=Unlikely  3=Possible  4=Likely  5=Almost Certain',
                                        '  Impact      1=Negligible  2=Minor  3=Moderate  4=Major  5=Catastrophic',
                                        '',
                                        'NOTE: Likelihood (L) and Impact (I) values are provided by risk owners.',
                                        '      Analysts must compute the Risk Score (L x I) for each entry.',
                                        '',
                                        '=========================================================',
                                        'R-01',
                                        '=========================================================',
                                        'Asset        : Customer-facing web portal (WEB-DMZ-01)',
                                        'Category     : Technical / Vulnerability',
                                        'Likelihood   : 5',
                                        'Impact       : 5',
                                        'Description  : An unpatched remote code execution vulnerability',
                                        '               (CVE-2026-11231) exists in the portal\'s application',
                                        '               framework. The vendor issued an advisory 14 days ago.',
                                        '               A public proof-of-concept exploit was released 7 days',
                                        '               ago. The portal is internet-facing with no WAF in path.',
                                        '               Exploitation would give an attacker unauthenticated',
                                        '               access to the server and all customer financial data.',
                                        'Treatment context: Vendor patch available. Patch can be applied',
                                        '               within the standard change window (next 72 hours).',
                                        '               Applying the patch directly reduces the vulnerability.',
                                        '',
                                        '=========================================================',
                                        'R-02',
                                        '=========================================================',
                                        'Asset        : Core banking database (INT-DB-CORE)',
                                        'Category     : Technical / Vulnerability',
                                        'Likelihood   : 4',
                                        'Impact       : 5',
                                        'Description  : A SQL injection vector was identified in an internal',
                                        '               loan-processing application. The vector requires a valid',
                                        '               internal network connection and a low-privilege account.',
                                        '               Successful exploitation would allow full database dump',
                                        '               of all customer account records and transaction history.',
                                        'Treatment context: Fix requires developer effort (parameterized queries).',
                                        '               Estimated remediation time: 3 weeks. Interim mitigation',
                                        '               (WAF rule + IP allow-list) can reduce likelihood while',
                                        '               the code fix is developed.',
                                        '',
                                        '=========================================================',
                                        'R-03',
                                        '=========================================================',
                                        'Asset        : Employee laptops (fleet of 340 devices)',
                                        'Category     : Physical / Data Loss',
                                        'Likelihood   : 3',
                                        'Impact       : 4',
                                        'Description  : Approximately 120 of 340 laptops do not have full-disk',
                                        '               encryption enabled. A lost or stolen unencrypted laptop',
                                        '               could expose PII, credentials, and internal documents.',
                                        '               Incident rate: 2 lost/stolen devices per quarter.',
                                        'Treatment context: MDM policy enforcement can mandate encryption.',
                                        '               Rollout estimated at 4 weeks. No hardware purchase required.',
                                        '',
                                        '=========================================================',
                                        'R-04',
                                        '=========================================================',
                                        'Asset        : ACH payment processor (third-party vendor)',
                                        'Category     : Third-Party / Vendor Risk',
                                        'Likelihood   : 4',
                                        'Impact       : 4',
                                        'Description  : The primary ACH payment processing vendor has not',
                                        '               provided a current SOC 2 Type II report. The last audit',
                                        '               on record is 18 months old. The vendor processes all',
                                        '               outgoing wire transfers and payroll. A vendor-side breach',
                                        '               or outage would directly impact payment operations.',
                                        'Treatment context: Veridian cannot directly patch or control the',
                                        '               vendor\'s systems. Options are contractual/SLA pressure',
                                        '               and cyber insurance to cover financial losses from',
                                        '               a vendor-side incident.',
                                        '',
                                        '=========================================================',
                                        'R-05',
                                        '=========================================================',
                                        'Asset        : Corporate email (all 340 employees)',
                                        'Category     : Human / Phishing',
                                        'Likelihood   : 3',
                                        'Impact       : 3',
                                        'Description  : No DMARC enforcement policy is in place. Phishing',
                                        '               simulations show an 18% click rate. Successful phishing',
                                        '               leads to credential theft and potential BEC (Business',
                                        '               Email Compromise). Impact is moderate: individual account',
                                        '               compromise, not systemic access.',
                                        'Treatment context: DMARC enforcement + phishing training program',
                                        '               can reduce both likelihood and impact over time.',
                                        '',
                                        '=========================================================',
                                        'R-06',
                                        '=========================================================',
                                        'Asset        : Primary server room (Building A, floor 3)',
                                        'Category     : Physical / Access Control',
                                        'Likelihood   : 2',
                                        'Impact       : 4',
                                        'Description  : The server room badge reader runs firmware v1.4.2.',
                                        '               A known authentication bypass vulnerability (PHYS-2025-003)',
                                        '               was disclosed for firmware versions <= 1.5.0. The room',
                                        '               houses core banking infrastructure. Physical access',
                                        '               would allow hardware tampering or direct console access.',
                                        'Treatment context: Vendor firmware update v1.6.1 is available.',
                                        '               Physical access to apply the update requires facilities',
                                        '               scheduling (estimated 2 weeks). Low breach likelihood',
                                        '               because of layered physical controls (guards, CCTV, mantrap).',
                                        '',
                                        '=========================================================',
                                        'R-07',
                                        '=========================================================',
                                        'Asset        : Weekly backup tapes (off-site courier)',
                                        'Category     : Physical / Data Loss',
                                        'Likelihood   : 2',
                                        'Impact       : 2',
                                        'Description  : Weekly backup tapes are transported by an external',
                                        '               courier to an off-site storage facility. The tapes',
                                        '               contain full database backups. If a tape were lost',
                                        '               in transit, the data would be recoverable from the',
                                        '               prior week\'s tape, limiting the exposure window.',
                                        '               The backup data is already encrypted at the application',
                                        '               layer before being written to tape.',
                                        'Treatment context: Risk is low-impact because application-layer',
                                        '               encryption is already in place. Cost of additional',
                                        '               hardware encryption exceeds the expected loss value.',
                                        '               Courier has a clean 5-year record with no losses.',
                                        '',
                                        '=========================================================',
                                        'R-08',
                                        '=========================================================',
                                        'Asset        : Development and test environment (INT-DEV-01)',
                                        'Category     : Data / Compliance',
                                        'Likelihood   : 2',
                                        'Impact       : 3',
                                        'Description  : The dev/test environment uses production data samples',
                                        '               that have not been anonymized or masked. A developer',
                                        '               account compromise or insider incident could expose',
                                        '               live customer PII in the less-controlled dev network.',
                                        '               GLBA and PCI-DSS require production data masking in',
                                        '               non-production environments.',
                                        'Treatment context: Data masking tools are available. Implementation',
                                        '               requires 6 weeks of engineering effort. Regulatory',
                                        '               pressure is a driver for prioritization.',
                                        '',
                                        '========================================',
                                        'END OF RISK REGISTER',
                                        '========================================'
                                    ].join('\n')
                                },

                                // ── RISK POLICY ──────────────────────────────────────
                                // States the org's appetite threshold and acceptance band.
                                // Does NOT name which specific risks exceed it.
                                // Policy: score >= 15 is "Unacceptable -- must treat"
                                //         score <= 4  is "Acceptable -- may accept with documentation"
                                //         score 5-14  is "Tolerable -- treat or accept with review"
                                'risk_policy.txt': {
                                    type: 'file',
                                    content: [
                                        'VERIDIAN FINANCIAL -- INFORMATION SECURITY RISK POLICY',
                                        '=======================================================',
                                        'Version       : 3.2',
                                        'Approved by   : Board Risk Committee',
                                        'Effective date: 2026-01-01',
                                        'Classification: INTERNAL -- RESTRICTED',
                                        '',
                                        '1. RISK APPETITE STATEMENT',
                                        '   Veridian Financial operates in a regulated financial services',
                                        '   environment (GLBA, PCI-DSS, SOX). The Board has determined that',
                                        '   the organization has a LOW risk appetite for information security',
                                        '   risks that could impact customer data, payment operations, or',
                                        '   regulatory compliance.',
                                        '',
                                        '2. RISK SCORING METHOD',
                                        '   Qualitative risk scoring uses the formula:',
                                        '',
                                        '     Risk Score = Likelihood (L) x Impact (I)',
                                        '',
                                        '   Where:',
                                        '     L = Likelihood rating  (1=Rare ... 5=Almost Certain)',
                                        '     I = Impact rating      (1=Negligible ... 5=Catastrophic)',
                                        '     Maximum possible score = 25 (L=5, I=5)',
                                        '     Minimum possible score =  1 (L=1, I=1)',
                                        '',
                                        '3. RISK APPETITE THRESHOLDS',
                                        '',
                                        '   UNACCEPTABLE (Must Treat)',
                                        '     Risk Score >= 15',
                                        '     Any risk scoring 15 or above MUST be assigned a risk treatment',
                                        '     and remediated within 90 days. No exceptions without Board',
                                        '     approval. These risks are reported on the Board risk dashboard.',
                                        '',
                                        '   TOLERABLE (Treat or Accept with Documented Review)',
                                        '     Risk Score 5 through 14',
                                        '     Risks in this range require annual review and risk owner',
                                        '     sign-off. Treatment is encouraged but not mandatory provided',
                                        '     the risk owner documents the acceptance rationale.',
                                        '',
                                        '   ACCEPTABLE (May Accept)',
                                        '     Risk Score <= 4',
                                        '     Risks scoring 4 or below may be formally accepted without',
                                        '     mandatory treatment. Acceptance must be documented by the risk',
                                        '     owner and reviewed annually. Accepted risks are tracked in',
                                        '     the risk register but are not escalated to the Board.',
                                        '',
                                        '4. RISK TREATMENT OPTIONS',
                                        '   All risks assigned for treatment must select one of the following',
                                        '   four standard treatments:',
                                        '',
                                        '   mitigate  -- Implement controls to reduce the likelihood or impact',
                                        '                of the risk occurring. The risk remains but at a lower',
                                        '                residual level. Example: patching, training, WAF rules.',
                                        '',
                                        '   transfer  -- Shift the financial consequence to a third party.',
                                        '                Example: cyber liability insurance, vendor SLA with',
                                        '                indemnification, outsourcing to a managed service.',
                                        '',
                                        '   avoid     -- Eliminate the risk by discontinuing the activity or',
                                        '                asset that creates it. Example: decommissioning a',
                                        '                vulnerable system, ceasing a high-risk process.',
                                        '',
                                        '   accept    -- Formally acknowledge the risk and choose not to treat',
                                        '                it. Valid only for risks within the Acceptable band',
                                        '                (score <= 4) or Tolerable band with documented rationale.',
                                        '                Not permitted for Unacceptable risks without Board waiver.',
                                        '',
                                        '5. INHERENT VS. RESIDUAL RISK',
                                        '   Inherent risk   = the risk score BEFORE any controls are applied.',
                                        '   Residual risk   = the risk score AFTER controls are applied.',
                                        '   The register records inherent risk. After treatment is implemented,',
                                        '   the risk owner must re-score to document the residual risk.',
                                        '',
                                        '6. REVIEW CYCLE',
                                        '   The risk register is reviewed quarterly by the CISO and annually',
                                        '   by the Board Risk Committee. Any new risk scoring >= 15 triggers',
                                        '   an immediate out-of-cycle review.',
                                        '',
                                        '======================================================',
                                        'END OF RISK POLICY',
                                        '======================================================'
                                    ].join('\n')
                                },

                                // ── CONCEPTS ─────────────────────────────────────────
                                // Teaches the qualitative risk framework.
                                // Does NOT reveal which risks score highest or which to accept.
                                'concepts.txt': {
                                    type: 'file',
                                    content: [
                                        'QUALITATIVE RISK MANAGEMENT -- CONCEPTS REFERENCE',
                                        '=================================================',
                                        'SY0-701 Domain 5.x | Veridian Financial Risk Program',
                                        '',
                                        '1. WHAT IS A RISK?',
                                        '   A risk is the potential for an event to negatively impact an asset.',
                                        '   Risk = Threat x Vulnerability x Impact (conceptual model)',
                                        '   In practice, the register captures two measurable dimensions:',
                                        '     Likelihood  -- How probable is the event? (1-5 scale)',
                                        '     Impact      -- How severe is the outcome? (1-5 scale)',
                                        '',
                                        '2. QUALITATIVE RISK SCORING',
                                        '   Risk Score = Likelihood (L) x Impact (I)',
                                        '   This gives a value on a 1-25 scale.',
                                        '   The score is used to prioritize and compare risks.',
                                        '',
                                        '   Example:',
                                        '     Likelihood = 3 (Possible), Impact = 4 (Major)',
                                        '     Score = 3 x 4 = 12   (Tolerable band)',
                                        '',
                                        '   Qualitative scoring uses subjective expert judgment.',
                                        '   It does not require dollar figures (that is quantitative risk).',
                                        '',
                                        '3. RISK APPETITE vs. RISK TOLERANCE',
                                        '   Risk appetite   = the LEVEL of risk an organization is willing',
                                        '                     to accept in pursuit of its objectives.',
                                        '                     Example: "We will not accept risks scoring >= 15."',
                                        '   Risk tolerance  = the acceptable VARIATION around the appetite.',
                                        '                     Example: "Tolerable band 5-14 with documented review."',
                                        '   A risk that exceeds the appetite is called "unacceptable" and',
                                        '   MUST be treated regardless of cost.',
                                        '',
                                        '4. INHERENT vs. RESIDUAL RISK',
                                        '   Inherent risk   = risk score BEFORE any controls are applied.',
                                        '                     This is what the register records initially.',
                                        '   Residual risk   = risk score AFTER controls are applied.',
                                        '                     The goal is to bring residual risk below the',
                                        '                     appetite threshold.',
                                        '',
                                        '5. THE FOUR RISK TREATMENTS',
                                        '   Once a risk is identified, one of four treatments must be chosen:',
                                        '',
                                        '   mitigate  -- Reduce the risk. Apply controls that lower likelihood',
                                        '                or impact. The risk still exists but at a lower level.',
                                        '                Best for risks where controls are available and cost-',
                                        '                effective. The most common treatment for technical risks.',
                                        '',
                                        '   transfer  -- Shift the consequence. Use insurance, contracts, or',
                                        '                outsourcing so that a third party bears the financial',
                                        '                impact. The risk event can still occur; you just do not',
                                        '                bear the full loss. Best when you cannot eliminate the',
                                        '                risk but can insure against it.',
                                        '',
                                        '   avoid     -- Eliminate the risk by stopping the activity that',
                                        '                creates it. Decommission the system. Discontinue the',
                                        '                process. The risk no longer exists. Only viable when',
                                        '                the activity is not essential to the business.',
                                        '',
                                        '   accept    -- Formally acknowledge the risk and take no action.',
                                        '                Valid only when the risk score falls within the',
                                        '                acceptable band per policy. Must be documented and',
                                        '                reviewed periodically.',
                                        '',
                                        '6. SELECTING THE CORRECT TREATMENT',
                                        '   Use this reasoning chain:',
                                        '     1. Is the risk within the acceptance band? --> accept',
                                        '     2. Is a control available that effectively reduces the risk?',
                                        '        --> mitigate',
                                        '     3. Can the organization stop the activity that creates the risk?',
                                        '        --> avoid',
                                        '     4. Can the financial impact be shifted to a third party?',
                                        '        --> transfer',
                                        '   When mitigate is viable (patch available, control cost-effective),',
                                        '   it is the preferred treatment for technical vulnerabilities.',
                                        '',
                                        '7. RISK REGISTER STRUCTURE',
                                        '   A risk register typically records for each risk:',
                                        '     Risk ID     -- Unique identifier (e.g. R-01)',
                                        '     Asset       -- What is at risk',
                                        '     Category    -- Type of risk (Technical, Physical, Compliance, ...)',
                                        '     Likelihood  -- 1-5 rating by risk owner',
                                        '     Impact      -- 1-5 rating by risk owner',
                                        '     Score       -- Computed L x I',
                                        '     Treatment   -- mitigate / transfer / avoid / accept',
                                        '     Owner       -- Person responsible for the risk',
                                        '     Status      -- Open / In Remediation / Accepted',
                                        '',
                                        '8. KEY EXAM TERMS (SY0-701 Domain 5)',
                                        '   Risk assessment     -- Process of identifying and scoring risks',
                                        '   Risk register       -- Document listing all identified risks',
                                        '   Risk appetite       -- How much risk the org is willing to accept',
                                        '   Risk tolerance      -- Acceptable deviation from the appetite',
                                        '   Inherent risk       -- Risk before controls',
                                        '   Residual risk       -- Risk after controls',
                                        '   Control             -- A safeguard that reduces risk',
                                        '   Likelihood          -- Probability the risk event occurs',
                                        '   Impact              -- Magnitude of harm if it occurs',
                                        '   Risk treatment      -- mitigate, transfer, avoid, accept',
                                        '',
                                        '==========================================',
                                        'END OF CONCEPTS REFERENCE',
                                        '=========================================='
                                    ].join('\n')
                                },

                                // ── ASSESSMENT TASK ──────────────────────────────────
                                // Tells the student what to determine (the 5 questions).
                                // Lists the 4 treatment vocabulary words (phrasing, not answers).
                                // Does NOT state which risk ID has the highest score,
                                // which is the accept candidate, the score value, the count,
                                // or which treatment is correct for the highest.
                                'assessment_task.txt': {
                                    type: 'file',
                                    content: [
                                        'RISK REGISTER ASSESSMENT TASK -- RM-2026-0601-012',
                                        '==================================================',
                                        'Assigned: 2026-06-01 09:00 UTC',
                                        'Analyst: (you)',
                                        '',
                                        'Using /home/analyst/risk_register.txt and /home/analyst/risk_policy.txt,',
                                        'answer the following five questions. Submit each answer as a flag.',
                                        '',
                                        'EVIDENCE FILES',
                                        '  /home/analyst/risk_register.txt    8 identified risks with L and I values',
                                        '  /home/analyst/risk_policy.txt      Appetite thresholds and treatment rules',
                                        '  /home/analyst/concepts.txt         Framework reference (treatments, scoring)',
                                        '',
                                        'ASSESSMENT QUESTIONS',
                                        '',
                                        '1. HIGHEST RISK ID',
                                        '   Compute the Risk Score (L x I) for each of the 8 risks in the',
                                        '   register. Which risk has the highest score?',
                                        '   Submit the Risk ID exactly as written (e.g. R-01).',
                                        '',
                                        '2. HIGHEST RISK SCORE',
                                        '   What is the numerical Risk Score (L x I) for the highest-scoring risk?',
                                        '   Submit the integer value (no decimal, no units).',
                                        '',
                                        '3. ACCEPTED RISK ID',
                                        '   Per the policy in risk_policy.txt, risks scoring within the',
                                        '   Acceptable band may be formally accepted without mandatory treatment.',
                                        '   Which risk from the register falls within that band and is the',
                                        '   best candidate for formal acceptance?',
                                        '   Submit the Risk ID exactly as written.',
                                        '',
                                        '4. TREATMENT FOR HIGHEST RISK',
                                        '   For the highest-scoring risk you identified in question 1,',
                                        '   determine the appropriate risk treatment.',
                                        '   Read the "Treatment context" field for that risk in the register',
                                        '   and apply the treatment definitions from the policy and concepts files.',
                                        '   Submit EXACTLY ONE of the following four words (lowercase):',
                                        '     mitigate',
                                        '     transfer',
                                        '     avoid',
                                        '     accept',
                                        '',
                                        '5. RISKS OVER APPETITE',
                                        '   How many risks in the register exceed the policy\'s Unacceptable',
                                        '   threshold (i.e., score >= 15)?',
                                        '   Compute L x I for all 8 risks and count how many meet or exceed 15.',
                                        '   Submit the integer count.',
                                        '',
                                        'INVESTIGATION COMMANDS',
                                        '  cat /home/analyst/risk_register.txt',
                                        '  cat /home/analyst/risk_policy.txt',
                                        '  cat /home/analyst/concepts.txt',
                                        '  grep "Likelihood" /home/analyst/risk_register.txt',
                                        '  grep "Impact" /home/analyst/risk_register.txt',
                                        '  grep "Treatment context" /home/analyst/risk_register.txt',
                                        '  grep "UNACCEPTABLE" /home/analyst/risk_policy.txt',
                                        '  grep "ACCEPTABLE" /home/analyst/risk_policy.txt'
                                    ].join('\n')
                                },

                                // ── NOTES (analyst scratch pad) ───────────────────────
                                // Pre-populated with a blank scoring grid.
                                // Does NOT pre-fill the computed LxI values.
                                'notes.txt': {
                                    type: 'file',
                                    content: [
                                        'RISK REGISTER ANALYST SCRATCH PAD',
                                        '===================================',
                                        '',
                                        'SCORING: Risk Score = Likelihood x Impact (both from risk_register.txt)',
                                        '',
                                        'RISK SCORING GRID',
                                        '  (Fill in L, I, and compute L x I for each risk)',
                                        '',
                                        '  Risk ID | L | I | Score (L x I) | Band',
                                        '  --------|---|---|----------------|------',
                                        '  R-01    |   |   |               |',
                                        '  R-02    |   |   |               |',
                                        '  R-03    |   |   |               |',
                                        '  R-04    |   |   |               |',
                                        '  R-05    |   |   |               |',
                                        '  R-06    |   |   |               |',
                                        '  R-07    |   |   |               |',
                                        '  R-08    |   |   |               |',
                                        '',
                                        'BAND THRESHOLDS (from risk_policy.txt)',
                                        '  Unacceptable (must treat) : score >= 15',
                                        '  Tolerable (review/treat)  : score  5 - 14',
                                        '  Acceptable (may accept)   : score <= 4',
                                        '',
                                        'FOUR TREATMENT OPTIONS (from assessment_task.txt)',
                                        '  mitigate  -- reduce via controls',
                                        '  transfer  -- shift consequence to third party',
                                        '  avoid     -- eliminate the activity',
                                        '  accept    -- formally acknowledge, no action',
                                        '',
                                        'MY FINDINGS',
                                        '  Highest risk ID     :',
                                        '  Highest score       :',
                                        '  Accept candidate    :',
                                        '  Treatment (highest) :',
                                        '  Count over appetite :'
                                    ].join('\n')
                                },

                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls /home/analyst/\ncat /home/analyst/assessment_task.txt\n'
                                }

                            } // end /home/analyst children
                        }
                    }
                },

                // /etc and /tmp so paths resolve cleanly
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'risk-ws-01' },
                        'hosts': {
                            type: 'file',
                            content: [
                                '127.0.0.1     localhost',
                                '10.10.10.20   WEB-DMZ-01',
                                '10.10.20.5    INT-DB-CORE',
                                '10.10.20.35   INT-DEV-01'
                            ].join('\n')
                        }
                    }
                },
                'tmp': { type: 'dir', children: {} }

            } // end / children
        }
    },

    // =========================================================
    // TERMINAL COMMANDS (custom additions)
    //
    // grep is PIPE-only in Terminal.js built-ins.
    // We add it as a standalone file-search command here so
    // `grep PATTERN /path/file` works directly, which is the
    // natural investigation pattern students will use.
    //
    // Terminal.js sets term._pipedStdin = <previous stdout> before
    // calling any custom command handler in a pipeline segment.
    // When a file arg is absent but _pipedStdin is non-empty,
    // we filter those lines instead of erroring.
    // =========================================================

    commands: {

        // ── grep: file-based AND pipe-aware ────────────────────
        // Handles: grep PATTERN FILE           (direct file search)
        //          cat FILE | grep PATTERN     (piped stdin via term._pipedStdin)
        //          grep -i PATTERN FILE        (case-insensitive)
        //          grep -v PATTERN FILE        (invert match)
        //          grep -c PATTERN FILE        (count matches)
        //          grep -n PATTERN FILE        (show line numbers)
        'grep': function(args, term, engine) {
            if (!args.length) {
                return 'Usage: grep [OPTIONS] PATTERN FILE\n  -i  case-insensitive\n  -v  invert match (lines NOT matching)\n  -c  count matching lines\n  -n  show line numbers\n  -A N  print N lines after each match\n  -B N  print N lines before each match\n  -C N  print N lines before and after each match\n\nExample: grep "Likelihood" /home/analyst/risk_register.txt\nExample: grep -A 3 "R-01" /home/analyst/risk_register.txt\nExample: grep "UNACCEPTABLE" /home/analyst/risk_policy.txt\nExample: cat /home/analyst/risk_register.txt | grep "R-0"';
            }

            // ── Robust left-to-right argument parser ──────────────
            // Walks args in order so that -A/-B/-C consume their
            // numeric argument as N, preventing N from being
            // misassigned as the pattern or filename.
            var caseInsensitive = false;
            var invertMatch     = false;
            var countOnly       = false;
            var showLineNums    = false;
            var afterCtx        = 0;   // -A N
            var beforeCtx       = 0;   // -B N
            var pattern         = '';
            var filePath        = '';

            var i = 0;
            while (i < args.length) {
                var tok = args[i];
                // Context flags: exact token -A / -B / -C  (next token is N)
                if (tok === '-A' || tok === '-B' || tok === '-C') {
                    var n = parseInt(args[i + 1], 10);
                    if (!isNaN(n) && n >= 0) {
                        if (tok === '-A') { afterCtx  = n; }
                        else if (tok === '-B') { beforeCtx = n; }
                        else { afterCtx = n; beforeCtx = n; }
                        i += 2;
                    } else {
                        i++;  // N missing or invalid -- skip flag
                    }
                // Context flags with N attached: -A12 / -B3 / -C1
                } else if (/^-[ABC]\d+$/.test(tok)) {
                    var letter = tok[1];
                    var n = parseInt(tok.slice(2), 10);
                    if (letter === 'A') { afterCtx  = n; }
                    else if (letter === 'B') { beforeCtx = n; }
                    else { afterCtx = n; beforeCtx = n; }
                    i++;
                // Regular flags: any dash-token not matching -A/-B/-C pattern
                } else if (tok.startsWith('-')) {
                    if (tok.includes('i')) { caseInsensitive = true; }
                    if (tok.includes('v')) { invertMatch     = true; }
                    if (tok.includes('c')) { countOnly       = true; }
                    if (tok.includes('n')) { showLineNums    = true; }
                    i++;
                // Positional: first non-flag = pattern, second = file
                } else {
                    if (!pattern)       { pattern  = tok; }
                    else if (!filePath) { filePath = tok; }
                    i++;
                }
            }

            if (!pattern) return 'grep: missing pattern\nUsage: grep PATTERN FILE';

            // Determine content: piped stdin OR a named file.
            // Terminal.js populates term._pipedStdin when this command runs
            // as a pipeline segment (e.g. cat file | grep pattern).
            var content;
            if (filePath) {
                var node = term._getNode(filePath);
                if (!node) return 'grep: ' + filePath + ': No such file or directory';
                if (node.type === 'dir') return 'grep: ' + filePath + ': Is a directory';
                content = node.content || '';
            } else if (term._pipedStdin) {
                content = term._pipedStdin;
            } else {
                return 'grep: missing file argument\nUsage: grep PATTERN FILE\n       cat FILE | grep PATTERN';
            }

            var lines = content.split('\n');

            var re;
            try {
                re = new RegExp(pattern, caseInsensitive ? 'i' : '');
            } catch (e) {
                return 'grep: invalid regular expression: ' + pattern;
            }

            // ── Match and apply -v filter ─────────────────────────
            var matchIndices = [];
            lines.forEach(function(line, idx) {
                var hits = re.test(line);
                var keep = invertMatch ? !hits : hits;
                if (keep) { matchIndices.push(idx); }
            });

            if (countOnly) return String(matchIndices.length);
            if (!matchIndices.length) return ''; // grep exits silently when no match

            // ── No context flags: simple output path ──────────────
            if (afterCtx === 0 && beforeCtx === 0) {
                return matchIndices.map(function(idx) {
                    return showLineNums ? (idx + 1) + ':' + lines[idx] : lines[idx];
                }).join('\n');
            }

            // ── Context output: build the set of line indices to print,
            //    track which are match lines vs context lines, and
            //    insert '--' separators between non-adjacent groups.
            // Each entry: { idx, isMatch }
            var included = [];  // ordered, deduped line entries
            var seenIdx  = {};  // index -> position in included[]

            matchIndices.forEach(function(midx) {
                var start = Math.max(0, midx - beforeCtx);
                var end   = Math.min(lines.length - 1, midx + afterCtx);
                for (var j = start; j <= end; j++) {
                    if (!seenIdx.hasOwnProperty(j)) {
                        seenIdx[j] = included.length;
                        included.push({ idx: j, isMatch: (j === midx) });
                    } else if (j === midx) {
                        // Already in the list -- mark it as a match line
                        included[seenIdx[j]].isMatch = true;
                    }
                }
            });

            // Sort by line index (they should already be ordered, but ensure it)
            included.sort(function(a, b) { return a.idx - b.idx; });

            // Build output with '--' separators between non-adjacent groups
            var output = [];
            for (var k = 0; k < included.length; k++) {
                if (k > 0 && included[k].idx !== included[k - 1].idx + 1) {
                    output.push('--');
                }
                var entry = included[k];
                var text  = lines[entry.idx];
                if (showLineNums) {
                    // GNU grep: match lines use ':', context lines use '-'
                    var sep = entry.isMatch ? ':' : '-';
                    output.push((entry.idx + 1) + sep + text);
                } else {
                    output.push(text);
                }
            }
            return output.join('\n');
        },

        // ── wc -l shorthand ───────────────────────────────────
        // Lets students count lines in a file.
        'wc': function(args, term) {
            var lineMode  = args.includes('-l');
            var wordMode  = args.includes('-w');
            var filePaths = args.filter(function(a) { return !a.startsWith('-'); });

            if (!filePaths.length) {
                // Piped input (e.g. grep PATTERN FILE | wc -l): no file arg, count term._pipedStdin
                if (term && term._pipedStdin) {
                    var _s = term._pipedStdin;
                    var _sl = _s === '' ? 0 : _s.replace(/\n+$/, '').split('\n').length;
                    var _sw = _s.split(/\s+/).filter(Boolean).length;
                    if (lineMode) return '  ' + _sl;
                    if (wordMode) return '  ' + _sw;
                    return '  ' + _sl + '  ' + _sw + '  ' + _s.length;
                }
                return 'Usage: wc [-l] [-w] FILE\nExample: wc -l /var/log/auth.log';
            }

            var results = [];
            filePaths.forEach(function(fp) {
                var node = term._getNode(fp);
                if (!node) { results.push('wc: ' + fp + ': No such file or directory'); return; }
                if (node.type === 'dir') { results.push('wc: ' + fp + ': Is a directory'); return; }
                var c = node.content || '';
                var lineCount = c.split('\n').length;
                var wordCount = c.split(/\s+/).filter(Boolean).length;
                if (lineMode)       results.push('  ' + lineCount + ' ' + fp);
                else if (wordMode)  results.push('  ' + wordCount + ' ' + fp);
                else                results.push('  ' + lineCount + '  ' + wordCount + '  ' + c.length + ' ' + fp);
            });
            return results.join('\n');
        },

        // ── help override (supplements built-in with case context) ──
        'help': function(args, term) {
            return [
                'RISK REGISTER REVIEW -- COMMAND REFERENCE',
                '',
                'File inspection:',
                '  ls [PATH]               List directory contents',
                '  cat FILE                Display full file contents',
                '  head [-n N] FILE        First N lines (default 10)',
                '  tail [-n N] FILE        Last N lines (default 10)',
                '  find PATH [-name PAT]   Search for files',
                '',
                'Search and filter:',
                '  grep [-ivnc] PAT FILE   Search for pattern in file',
                '    -i  case-insensitive  -v  invert  -n  line nums  -c  count',
                '  wc -l FILE              Count lines in a file',
                '',
                'Navigation:',
                '  cd PATH                 Change directory',
                '  pwd                     Print working directory',
                '  clear                   Clear screen',
                '',
                'Key evidence locations:',
                '  /home/analyst/risk_register.txt    8 risks with Likelihood and Impact values',
                '  /home/analyst/risk_policy.txt      Appetite thresholds and treatment rules',
                '  /home/analyst/concepts.txt         Framework reference',
                '  /home/analyst/assessment_task.txt  Task brief and investigation guide',
                '  /home/analyst/notes.txt            Analyst scratch pad with scoring grid',
                '',
                'Key investigation commands:',
                '  grep "Likelihood" /home/analyst/risk_register.txt',
                '  grep "Impact" /home/analyst/risk_register.txt',
                '  grep "Treatment context" /home/analyst/risk_register.txt',
                '  grep "UNACCEPTABLE" /home/analyst/risk_policy.txt',
                '  grep "ACCEPTABLE" /home/analyst/risk_policy.txt',
                '  grep "R-0" /home/analyst/risk_register.txt'
            ].join('\n');
        }

    },

    // =========================================================
    // LOG VIEWER DATA (BlueTeam.js LogViewer device)
    //
    // Generic intake log only -- no L/I values, no per-risk
    // severity tiers, no suspicious markers that single out
    // the over-appetite set. All answer-relevant computation
    // must come from reading risk_register.txt directly.
    // =========================================================

    logViewer: {
        entries: [
            { timestamp: '2026-06-01 09:00:00', severity: 'info', source: 'risk-policy',   message: 'Risk policy loaded -- review risk_policy.txt for appetite thresholds and treatment definitions' },
            { timestamp: '2026-06-01 09:00:10', severity: 'info', source: 'risk-register', message: 'R-01 entry logged for review -- 2026-06-01' },
            { timestamp: '2026-06-01 09:00:11', severity: 'info', source: 'risk-register', message: 'R-02 entry logged for review -- 2026-06-01' },
            { timestamp: '2026-06-01 09:00:12', severity: 'info', source: 'risk-register', message: 'R-03 entry logged for review -- 2026-06-01' },
            { timestamp: '2026-06-01 09:00:13', severity: 'info', source: 'risk-register', message: 'R-04 entry logged for review -- 2026-06-01' },
            { timestamp: '2026-06-01 09:00:14', severity: 'info', source: 'risk-register', message: 'R-05 entry logged for review -- 2026-06-01' },
            { timestamp: '2026-06-01 09:00:15', severity: 'info', source: 'risk-register', message: 'R-06 entry logged for review -- 2026-06-01' },
            { timestamp: '2026-06-01 09:00:16', severity: 'info', source: 'risk-register', message: 'R-07 entry logged for review -- 2026-06-01' },
            { timestamp: '2026-06-01 09:00:17', severity: 'info', source: 'risk-register', message: 'R-08 entry logged for review -- 2026-06-01' },
            { timestamp: '2026-06-01 09:00:20', severity: 'info', source: 'risk-system',   message: 'RM-2026-0601-012 -- 8 risk entries queued for analyst review -- open risk_register.txt to begin' }
        ]
    },

    // =========================================================
    // FLAGS
    //
    // All five flags are find-and-submit: the student discovers
    // values by reading the files and computing L x I.
    // BoxEngine validates against Firestore
    // flag_registry/{boxId}/flags/{flagId}.
    //
    // FIRESTORE SEEDING (flag_registry/shield-sp-blueteam-risk-register):
    //   highest_risk_id        -> R-01
    //   highest_risk_score     -> 25         (integer)
    //   accept_candidate_id    -> R-07
    //   treatment_for_highest  -> mitigate
    //   risks_over_appetite    -> 3          (integer)
    //
    // ANTI-LEAK: descriptions name WHAT to find and the VOCABULARY OPTIONS
    // for treatment -- they do NOT name the answer value, the risk ID,
    // the score, the count, or which treatment is correct.
    // =========================================================

    flags: [
        {
            id:          'highest_risk_id',
            points:      150,
            label:       'Highest Risk ID',
            description: 'Compute the Risk Score (L x I) for all 8 risks in risk_register.txt. Identify the risk with the single highest score. Submit its Risk ID exactly as written in the register (format: R-NN).'
        },
        {
            id:          'highest_risk_score',
            points:      100,
            label:       'Highest Risk Score (L x I)',
            description: 'What is the numerical Risk Score (Likelihood x Impact) for the highest-scoring risk? Compute L x I using the values from risk_register.txt. Submit the integer (no decimal, no units).'
        },
        {
            id:          'accept_candidate_id',
            points:      150,
            label:       'Accepted Risk Candidate ID',
            description: 'Per the Acceptable band defined in risk_policy.txt, which risk from the register has a score that qualifies it for formal acceptance without mandatory treatment? Submit the Risk ID exactly as written in the register (format: R-NN).'
        },
        {
            id:          'treatment_for_highest',
            points:      200,
            label:       'Risk Treatment for Highest Risk',
            description: 'Determine the appropriate risk treatment for the highest-scoring risk. Read the "Treatment context" field for that risk in risk_register.txt, then apply the treatment definitions from risk_policy.txt and concepts.txt. Submit exactly one of the following four words: mitigate, transfer, avoid, accept.'
        },
        {
            id:          'risks_over_appetite',
            points:      100,
            label:       'Count of Risks Exceeding Appetite',
            description: 'How many risks in the register have a score that meets or exceeds the Unacceptable threshold defined in risk_policy.txt? Compute L x I for all 8 risks and count those that qualify. Submit the integer count.'
        }
    ],

    // =========================================================
    // SCORING
    // =========================================================

    scoring: {
        base:               1000,
        minScore:           0,
        maxScore:           700,
        hintPenalty:        true,
        wrongFlagPenalty:   -25,
        speedBonus:         { threshold: 1800000, points: 100 },
        timeBonusThreshold: 2400
    },

    // =========================================================
    // HINTS
    //
    // Progressive: first hint gives strategy, second gives the
    // exact command. ONLY the final hint per flag may reveal the
    // answer via {{FLAG:id}} (incurs the largest penalty).
    //
    // No flag value appears in any lore, scenario, intro,
    // task, notes, help text, or non-final hint.
    // Values are discoverable ONLY from risk_register.txt and
    // risk_policy.txt. Final {{FLAG:id}} is the only confirm.
    // =========================================================

    hints: [

        // ── highest_risk_id ──────────────────────────────────
        {
            id:      'hint_highest_id_1',
            flagId:  'highest_risk_id',
            text:    'Risk Score = Likelihood x Impact. Open risk_register.txt and read the "Likelihood" and "Impact" lines for each of the 8 risks. Multiply them together. The risk with the product (L x I) that is larger than all others is the highest-scoring risk. Note: the register does NOT list the pre-computed scores -- you must compute L x I yourself for each entry.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_highest_id_2',
            flagId:  'highest_risk_id',
            text:    'Run: grep -A2 "Likelihood" /home/analyst/risk_register.txt\n\nThis shows the Likelihood and Impact lines together for each risk. For each risk compute L x I. Look for the risk where both values are at the top of the 1-5 scale -- that combination produces the highest possible product.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_highest_id_3',
            flagId:  'highest_risk_id',
            text:    'One risk in the register has Likelihood at the maximum rating and Impact at the maximum rating. Maximum L x Maximum I gives the highest possible score on the 1-25 scale. Submit that risk\'s ID.\n\nThe value to submit: {{FLAG:highest_risk_id}}',
            cost:    75,
            penalty: -75
        },

        // ── highest_risk_score ────────────────────────────────
        {
            id:      'hint_score_1',
            flagId:  'highest_risk_score',
            text:    'The risk score is Likelihood x Impact. Once you have identified the highest-scoring risk (flag 1), read its Likelihood and Impact values from risk_register.txt and compute the product. The score is a plain integer on the 1-25 scale.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_score_2',
            flagId:  'highest_risk_score',
            text:    'Run: grep "Likelihood\|Impact" /home/analyst/risk_register.txt\n\nThis prints every L and I line. For the risk you identified as the highest, note its two values and multiply them. Submit only the resulting integer -- no commas, no "out of 25", no decimal.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_score_3',
            flagId:  'highest_risk_score',
            text:    'The highest possible L x I product on a 1-5 x 1-5 scale is achieved when both values are at their maximum. Submit that product as a plain integer.\n\nThe value to submit: {{FLAG:highest_risk_score}}',
            cost:    75,
            penalty: -75
        },

        // ── accept_candidate_id ───────────────────────────────
        {
            id:      'hint_accept_1',
            flagId:  'accept_candidate_id',
            text:    'Check risk_policy.txt for the Acceptable band threshold -- risks at or below that score may be formally accepted without mandatory treatment. Compute L x I for all 8 risks and find the one whose score is low enough to fall within the Acceptable band. Also read the "Treatment context" for that risk to confirm acceptance is reasonable.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_accept_2',
            flagId:  'accept_candidate_id',
            text:    'Run: grep "ACCEPTABLE" /home/analyst/risk_policy.txt\n\nNote the score threshold. Then compute L x I for each risk and find the one at or below that threshold. One risk in the register has both a low Likelihood and a low Impact -- and its Treatment context confirms that existing controls already reduce the remaining exposure.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_accept_3',
            flagId:  'accept_candidate_id',
            text:    'Look for the risk in the register that involves an off-site physical asset where existing application-layer controls already address the primary concern. Its Likelihood and Impact are both at 2 on the 5-point scale. Check whether 2 x 2 falls within the Acceptable band per policy.\n\nThe value to submit: {{FLAG:accept_candidate_id}}',
            cost:    75,
            penalty: -75
        },

        // ── treatment_for_highest ─────────────────────────────
        {
            id:      'hint_treat_1',
            flagId:  'treatment_for_highest',
            text:    'Read the "Treatment context" field for the highest-scoring risk in risk_register.txt. Then open risk_policy.txt section 4 and concepts.txt section 5 to review the four treatment definitions: mitigate, transfer, avoid, accept. Match the context to the definition that fits. Key question: is a direct technical control available that would reduce the risk?',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_treat_2',
            flagId:  'treatment_for_highest',
            text:    'Run: grep -A5 "Treatment context" /home/analyst/risk_register.txt | head -8\n\nThis shows the Treatment context for the first risk entry. Read what it says about patch availability. Then compare: mitigate = reduce via controls; transfer = shift to third party; avoid = stop the activity; accept = no action. When a vendor patch is available and can be applied within the change window, which treatment directly reduces the risk?',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_treat_3',
            flagId:  'treatment_for_highest',
            text:    'The highest-scoring risk involves an internet-facing system with a vendor-issued patch available. The Treatment context explicitly states the patch can be applied within the change window and will directly reduce the vulnerability. That points to one of the four treatment options.\n\nThe value to submit: {{FLAG:treatment_for_highest}}',
            cost:    75,
            penalty: -75
        },

        // ── risks_over_appetite ───────────────────────────────
        {
            id:      'hint_appetite_1',
            flagId:  'risks_over_appetite',
            text:    'Compute L x I for all 8 risks. Then read the Unacceptable threshold from risk_policy.txt. Count every risk whose score meets or exceeds that threshold. Be precise: the threshold uses "greater than or equal to" -- a risk scoring exactly at the threshold is over appetite, not under.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_appetite_2',
            flagId:  'risks_over_appetite',
            text:    'Run: grep "UNACCEPTABLE" /home/analyst/risk_policy.txt\n\nNote the score threshold. Then compute L x I for each of the 8 risks. Make a list of which scores are >= that threshold. Count the entries on that list. Submit the count as a plain integer.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_appetite_3',
            flagId:  'risks_over_appetite',
            text:    'Three risks in the register have scores at or above the Unacceptable threshold. They span different categories -- one technical/internet-facing, one technical/internal database, one vendor/third-party. Verify your L x I calculations for all 8 risks before submitting.\n\nThe value to submit: {{FLAG:risks_over_appetite}}',
            cost:    75,
            penalty: -75
        }

    ],

    // =========================================================
    // CERT OBJECTIVES (assessment mode compatibility)
    //
    // certObjectives.mappings is the live format (flat array
    // under certObjectives). All five flags map to SY0-701
    // Domain 5 risk management with distinct skill callouts.
    // =========================================================

    certObjectives: {
        certPath: 'CompTIA Security+ SY0-701',
        mappings: [
            {
                flagId:      'highest_risk_id',
                objective:   '5.2',
                description: 'Explain elements of the risk management process -- qualitative risk scoring',
                skill:       'Computing Likelihood x Impact scores across a risk register to identify the highest-risk item'
            },
            {
                flagId:      'highest_risk_score',
                objective:   '5.2',
                description: 'Explain elements of the risk management process -- qualitative scoring scale',
                skill:       'Accurately calculating the numerical risk score (L x I) from a 5-point qualitative scale'
            },
            {
                flagId:      'accept_candidate_id',
                objective:   '5.2',
                description: 'Explain elements of the risk management process -- risk appetite and acceptance',
                skill:       'Applying policy-defined appetite thresholds to identify risks that qualify for formal acceptance'
            },
            {
                flagId:      'treatment_for_highest',
                objective:   '5.2',
                description: 'Explain elements of the risk management process -- risk treatment selection',
                skill:       'Selecting the correct risk treatment (mitigate/transfer/avoid/accept) based on treatment context and policy definitions'
            },
            {
                flagId:      'risks_over_appetite',
                objective:   '5.2',
                description: 'Explain elements of the risk management process -- risk tolerance and unacceptable risk',
                skill:       'Counting risks that exceed the organizational unacceptable threshold to scope mandatory remediation'
            }
        ]
    },

    // =========================================================
    // STATE RESET (BOX-006 pattern -- idempotent on script load)
    // =========================================================

    resetState: function() {
        // No internal _state needed for a pure find-and-submit box.
        // BoxEngine manages flag submission state in Firestore.
    }

};

// Auto-reset on load (BOX-006 backfill 2026-05-23)
// Use window.VFRRConfig -- the bare name is not in scope after the window= assignment.
if (window.VFRRConfig) window.VFRRConfig.resetState();
