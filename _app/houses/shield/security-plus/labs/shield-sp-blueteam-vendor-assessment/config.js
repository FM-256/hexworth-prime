/* ============================================================
   Security+ Cert Prep -- Vendor Due Diligence: Veridian Financial
   GRC / Domain 5 blue-team box | find-and-submit flags
   Students review a SaaS vendor's submitted evidence documents
   (SOC 2 report, MSA draft, security questionnaire, data
   classification sheet) and submit the due-diligence findings
   they discover as flags.
   SY0-701: 5.1 (security governance), 5.3 (third-party risk),
            5.4 (risk management), 5.6 (vendor agreements)
   ============================================================ */

// window assignment (not const) so the second <script> block in index.html
// can reference VFVAConfig after this script has loaded.
window.VFVAConfig = {

    // =========================================================
    // BOX METADATA
    // =========================================================

    id:            'shield-sp-blueteam-vendor-assessment',
    title:         'Vendor Due Diligence',
    subtitle:      'Veridian Financial -- DataBridge Analytics Onboarding Review',
    description:   'Veridian Financial is evaluating DataBridge Analytics, a SaaS vendor, before signing a contract. As the GRC analyst, you must review the vendor\'s submitted evidence documents -- SOC 2 report, MSA draft, security questionnaire, and data classification sheet -- and submit your due-diligence findings as flags.',
    difficulty:    'Intermediate',
    estimatedTime: 40,
    accent:        '#2563eb',
    storageKey:    'hexworth_lab_sp_blueteam_vendor_assessment',
    registryId:    'shield-sp-blueteam-vendor-assessment',
    trackerKey:    'lab_sp_blueteam_vendor_assessment',

    // Blue-team mode tells BoxEngine to accept BlueTeam device types
    blueTeamMode: true,

    // =========================================================
    // BOOT SEQUENCE
    // =========================================================

    boot: {
        biosLines: [
            'VERIDIAN FINANCIAL GRC WORKSTATION v2.9.0',
            'GRC Analyst Terminal -- Tier-2 Access',
            'Ubuntu 22.04.4 LTS: LOADING',
            'Vendor evidence mount: /home/analyst/vendor -- READY',
            'Review package received: 2026-05-12 09:00 UTC',
            'Assessment ticket: GRC-2026-0512-003 -- ACTIVE'
        ],
        grubEntries: [
            'Ubuntu 22.04.4 LTS (GRC Analyst)',
            'Ubuntu 22.04.4 LTS (recovery mode)'
        ],
        loginUser: 'analyst'
    },

    // =========================================================
    // LORE
    // =========================================================

    lore: {
        intro: 'GRC-2026-0512-003 landed in your queue: "Vendor onboarding review required. DataBridge Analytics submitted their evidence package for Security-Tier assessment. Contract signing is pending your GRC clearance." DataBridge Analytics is a SaaS provider that will process Veridian customer PII for analytics reporting. You have their SOC 2 report, the draft Master Service Agreement, their completed security questionnaire, and a data classification sheet. Read everything. Find the gaps. Submit your findings as flags.',

        scenario: 'The evidence package is mounted at /home/analyst/vendor/ on this workstation. Start with the assessment task file to understand what questions you need to answer, then read each evidence document in detail. Look for the SOC 2 report type, any missing contractual clauses, the breach-notification timeline, where the vendor stores your data, and what your final risk-based decision is.',

        outro: 'Due diligence complete. DataBridge Analytics submitted a SOC 2 Type I (point-in-time design review only -- not the continuous Type II you should require), the MSA draft was missing a right-to-audit clause, their breach-notification SLA of 14 days far exceeds the GDPR 72-hour mandatory window, data is stored in a jurisdiction with weaker privacy protections, and there was a disclosed prior breach. The findings support a conditional approval: the vendor has acceptable security posture with fixable contractual gaps -- but those gaps must be remediated before signing. This is the core skill SY0-701 Domain 5 tests: read third-party evidence, identify contract and compliance gaps, and make a risk-informed recommendation.',

        goals: [
            'Identify the SOC 2 report type the vendor submitted and understand the assurance difference between the two types',
            'Identify the critical contractual clause absent from the MSA draft',
            'Find the vendor\'s breach-notification SLA window in days from the MSA',
            'Identify the data residency jurisdiction where the vendor stores your data',
            'Determine the correct risk-based go/no-go decision given the evidence'
        ],

        toolkit: [
            { name: 'cat',  purpose: 'Display a full document',            sample: 'cat /home/analyst/vendor/soc2_report.txt'       },
            { name: 'grep', purpose: 'Search for a pattern in a document', sample: 'grep "notification" /home/analyst/vendor/msa_draft.txt' },
            { name: 'head', purpose: 'Show first N lines of a file',       sample: 'head -n 30 /home/analyst/vendor/msa_draft.txt'   },
            { name: 'tail', purpose: 'Show last N lines of a file',        sample: 'tail -n 20 /home/analyst/vendor/security_questionnaire.txt' },
            { name: 'find', purpose: 'Locate files in a directory',        sample: 'find /home/analyst -name "*.txt"'               },
            { name: 'ls',   purpose: 'List directory contents',            sample: 'ls /home/analyst/vendor/'                      },
            { name: 'help', purpose: 'Show available commands',            sample: 'help'                                           }
        ]
    },

    // =========================================================
    // TERMINAL CONFIG
    // =========================================================

    terminal: {
        user:     'analyst',
        hostname: 'grc-ws-01',
        startDir: '/home/analyst',
        welcome:  'Veridian Financial -- GRC Analyst Terminal\nTier-2 Access | GRC-2026-0512-003 Active\n\nVendor evidence package: /home/analyst/vendor/\n  soc2_report.txt           SOC 2 audit report (cover + scope page)\n  msa_draft.txt             Draft Master Service Agreement\n  security_questionnaire.txt  Vendor-completed security questionnaire\n  data_classification.txt   Data types the vendor will process\n\nTask brief: /home/analyst/assessment_task.txt\n\nRead the evidence. Find the gaps. Submit your findings via the Submit Flag panel.\n\nType "help" for available commands.\n'
    },

    // =========================================================
    // DESKTOP ICONS
    // =========================================================

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal',    icon: 'T', app: 'terminal'  },
            { id: 'browser',  label: 'Browser',     icon: 'B', app: 'browser'   },
            { id: 'notes',    label: 'Notes',       icon: 'N', app: 'notes'     },
            { id: 'hints',    label: 'Hints',       icon: 'H', app: 'hints'     },
            { id: 'flags',    label: 'Submit Flag', icon: 'F', app: 'flags'     }
        ]
    },

    // =========================================================
    // SIMULATED FILESYSTEM
    //
    // /home/analyst/
    //   assessment_task.txt       -- task brief: names the questions, NOT answers
    //   notes.txt                 -- GRC scratch pad
    //   vendor/
    //     soc2_report.txt         -- FLAG: soc2_type ("Type I")
    //     msa_draft.txt           -- FLAG: missing_clause ("right-to-audit")
    //                             -- FLAG: breach_sla_days ("14")
    //     security_questionnaire.txt -- FLAG: data_residency ("India")
    //     data_classification.txt -- context: what data the vendor handles
    //
    // FLAG LEAK CHECK:
    //   assessment_task.txt   -> names the flag CATEGORIES only, no values
    //   notes.txt             -> framework notes only, no values
    //   soc2_report.txt       -> "Type I" stated; teaches Type I vs II
    //   msa_draft.txt         -> right-to-audit ABSENT (absence = the flag)
    //                           breach SLA "14 calendar days" stated explicitly
    //   security_questionnaire.txt -> "India" stated as data residency
    //   data_classification.txt -> PII context only, no flag values
    //   hints                 -> non-final hints give strategy/commands only;
    //                           final hint per flag uses {{FLAG:id}}
    //   help output           -> generic commands, no flag values in examples
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

                                // ── ASSESSMENT TASK ──────────────────────────────────
                                // Names the questions (categories of findings to submit).
                                // Does NOT state any flag values.
                                'assessment_task.txt': {
                                    type: 'file',
                                    content: [
                                        'VENDOR DUE DILIGENCE ASSESSMENT -- GRC-2026-0512-003',
                                        '=====================================================',
                                        'Assigned  : 2026-05-12 09:00 UTC',
                                        'Analyst   : (you)',
                                        'Vendor    : DataBridge Analytics',
                                        'Engagement: SaaS -- Customer Analytics Reporting',
                                        '',
                                        'BACKGROUND',
                                        'DataBridge Analytics will process Veridian Financial customer PII',
                                        'to generate quarterly reporting dashboards. Before contract signing,',
                                        'GRC must clear the vendor at Security-Tier. The vendor submitted',
                                        'the following evidence package on 2026-05-09:',
                                        '',
                                        'EVIDENCE PACKAGE (read each document in full)',
                                        '  /home/analyst/vendor/soc2_report.txt',
                                        '  /home/analyst/vendor/msa_draft.txt',
                                        '  /home/analyst/vendor/security_questionnaire.txt',
                                        '  /home/analyst/vendor/data_classification.txt',
                                        '',
                                        'DUE DILIGENCE QUESTIONS (submit each answer as a flag)',
                                        '',
                                        '1. SOC 2 REPORT TYPE',
                                        '   Identify the SOC 2 report type the vendor submitted.',
                                        '   SOC 2 reports come in two types: Type I audits design',
                                        '   effectiveness at a point in time; Type II audits design AND',
                                        '   operating effectiveness over a period (stronger assurance).',
                                        '   Submit the report type exactly as stated in the cover page.',
                                        '   Expected format: "Type I" or "Type II" (two words, capital T,',
                                        '   Roman numeral).',
                                        '',
                                        '2. MISSING CONTRACTUAL CLAUSE',
                                        '   Veridian GRC policy requires that an MSA for a Security-Tier',
                                        '   vendor include all five of the following clause types.',
                                        '   Read the MSA draft carefully and verify which are present',
                                        '   and which is absent:',
                                        '',
                                        '     data-deletion',
                                        '     breach-notification',
                                        '     right-to-audit',
                                        '     subprocessor-disclosure',
                                        '     liability-cap',
                                        '',
                                        '   One of these five clause types is entirely absent from the',
                                        '   MSA draft. Submit the missing one using the exact label as',
                                        '   written in the list above (all lowercase, hyphenated, no quotes).',
                                        '',
                                        '3. BREACH NOTIFICATION SLA',
                                        '   Find the vendor\'s breach-notification SLA in the MSA draft.',
                                        '   The SLA is expressed as a number of calendar days.',
                                        '   Submit the number only (digits, no units, no text).',
                                        '   Note: GDPR Art. 33 requires notification to the supervisory',
                                        '   authority within 72 hours of becoming aware of a breach.',
                                        '',
                                        '4. DATA RESIDENCY',
                                        '   Find the country/jurisdiction where the vendor stores',
                                        '   Veridian data, as stated in the security questionnaire.',
                                        '   Submit the country name exactly as written in the questionnaire.',
                                        '',
                                        '5. RISK DECISION',
                                        '   Based on all evidence reviewed, what is your due-diligence',
                                        '   recommendation? Review the vendor\'s security controls,',
                                        '   contractual gaps, breach SLA compliance, data residency,',
                                        '   and breach history, then submit exactly one of these two strings:',
                                        '     approve',
                                        '     conditional',
                                        '',
                                        'INVESTIGATION COMMANDS',
                                        '  cat /home/analyst/vendor/soc2_report.txt',
                                        '  cat /home/analyst/vendor/msa_draft.txt',
                                        '  cat /home/analyst/vendor/security_questionnaire.txt',
                                        '  cat /home/analyst/vendor/data_classification.txt',
                                        '  grep -i "type" /home/analyst/vendor/soc2_report.txt',
                                        '  grep -i "audit" /home/analyst/vendor/msa_draft.txt',
                                        '  grep -i "notification" /home/analyst/vendor/msa_draft.txt',
                                        '  grep -i "residency" /home/analyst/vendor/security_questionnaire.txt'
                                    ].join('\n')
                                },

                                // Analyst scratch notes (no flag values)
                                'notes.txt': {
                                    type: 'file',
                                    content: [
                                        'GRC DUE DILIGENCE SCRATCH PAD',
                                        '==============================',
                                        '',
                                        'SOC 2 types at a glance:',
                                        '  Point-in-time -- auditor reviews whether controls are DESIGNED',
                                        '                   correctly on the audit date. Weaker assurance.',
                                        '  Period review  -- auditor tests whether controls OPERATED',
                                        '                   effectively over 6+ months. Stronger assurance.',
                                        '  Always require the stronger period-review type for production',
                                        '  vendors handling PII. Read the "Report Type" field on the cover.',
                                        '',
                                        'Key MSA clauses for a SaaS vendor handling PII:',
                                        '  Data Processing Agreement (DPA)  -- defines processing scope',
                                        '  Customer inspection clause        -- you can audit the vendor',
                                        '  Breach notification SLA           -- how fast they must tell you',
                                        '  Subprocessor disclosure           -- list of sub-vendors',
                                        '  Liability / indemnification       -- financial recourse',
                                        '',
                                        'Breach notification regulatory minimums:',
                                        '  GDPR Art. 33  : 72 hours to supervisory authority',
                                        '  GDPR Art. 34  : "without undue delay" to data subjects',
                                        '  CCPA / CPRA   : "expedient" (no fixed window)',
                                        '  HIPAA         : 60 days from discovery',
                                        '  Best practice : 72-hour internal SLA aligns with GDPR floor',
                                        '',
                                        'Data residency risk factors:',
                                        '  - Is the jurisdiction in an adequate country (EU adequacy decision)?',
                                        '  - Does local law allow government access without notice?',
                                        '  - Does the MSA include a DPA with SCCs for cross-border transfer?',
                                        '',
                                        'My findings:',
                                        '  SOC 2 type          : ',
                                        '  Missing clause      : ',
                                        '  Breach SLA (days)   : ',
                                        '  Data residency      : ',
                                        '  Risk decision       : '
                                    ].join('\n')
                                },

                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls /home/analyst/\ncat /home/analyst/assessment_task.txt\n'
                                },

                                // ── VENDOR EVIDENCE PACKAGE ───────────────────────────
                                'vendor': {
                                    type: 'dir',
                                    children: {

                                        // ── SOC 2 REPORT ─────────────────────────────────
                                        // FLAG: soc2_type = "Type I"
                                        // Document states "Type I" explicitly; teaches Type I vs II.
                                        // Teaches: Type I = design only at a point in time;
                                        //          Type II = design + operating effectiveness over time.
                                        // DISCOVERY: cat /home/analyst/vendor/soc2_report.txt
                                        //            grep -i "type" /home/analyst/vendor/soc2_report.txt
                                        'soc2_report.txt': {
                                            type: 'file',
                                            content: [
                                                'DATABRIDGE ANALYTICS, INC.',
                                                'SOC 2 REPORT -- SYSTEM AND ORGANIZATION CONTROLS',
                                                '=================================================',
                                                '',
                                                'Report Type    : Type I',
                                                'Audit Date     : 2026-03-31 (point-in-time assessment)',
                                                'Audit Period   : N/A -- Type I audits assess design as of a',
                                                '                 single date, not over an extended period.',
                                                '                 (A Type II report would cover a minimum of',
                                                '                 six consecutive months of operations.)',
                                                'Auditor        : Meridian Assurance Partners LLP',
                                                'Auditor License: PCAOB registered, AICPA member firm',
                                                'Trust Principle: Security (CC criteria)',
                                                'Report Issued  : 2026-04-18',
                                                'Restricted Use : This report is restricted to Meridian Assurance',
                                                '                 Partners LLP, DataBridge Analytics, Inc., and',
                                                '                 user entities that have executed a non-disclosure',
                                                '                 agreement with DataBridge Analytics.',
                                                '',
                                                '-------------------------------------------------',
                                                'SCOPE OF ASSESSMENT',
                                                '-------------------------------------------------',
                                                '',
                                                'System Description',
                                                '  DataBridge Analytics provides a cloud-based analytics platform',
                                                '  ("AnalyticsHub") that ingests structured data from customer',
                                                '  environments, performs aggregation and cohort analysis, and',
                                                '  returns dashboarded reporting via a RESTful API and web portal.',
                                                '',
                                                'Infrastructure',
                                                '  Production environment hosted on Amazon Web Services (AWS)',
                                                '  Region: ap-south-1 (Mumbai, India)',
                                                '  Services in scope: EC2, RDS (PostgreSQL), S3, CloudFront, VPC',
                                                '',
                                                'Trust Service Criteria in Scope',
                                                '  CC1 Control Environment',
                                                '  CC2 Communication and Information',
                                                '  CC6 Logical and Physical Access Controls',
                                                '  CC7 System Operations',
                                                '  CC9 Risk Management',
                                                '',
                                                '-------------------------------------------------',
                                                'AUDITOR OPINION',
                                                '-------------------------------------------------',
                                                '',
                                                'In our opinion, the description of the AnalyticsHub system',
                                                'as of March 31, 2026 is fairly presented in all material',
                                                'respects, and the controls stated in the description were',
                                                'suitably designed as of that date to provide reasonable',
                                                'assurance that the specified trust service criteria would',
                                                'be met if those controls operated effectively.',
                                                '',
                                                'NOTE: This is a Type I engagement. We did not test the',
                                                'operating effectiveness of controls over a period of time.',
                                                'The absence of a Type II opinion means user entities cannot',
                                                'rely on this report as evidence that controls operated',
                                                'effectively throughout the year.',
                                                '',
                                                '-------------------------------------------------',
                                                'EXCEPTIONS AND NOTED DEFICIENCIES',
                                                '-------------------------------------------------',
                                                '',
                                                'Exception 1 -- CC6.1 Logical Access:',
                                                '  The auditor noted that multi-factor authentication (MFA) is',
                                                '  required for administrative access but not enforced for',
                                                '  all standard user accounts accessing the AnalyticsHub portal.',
                                                '  DataBridge management has acknowledged this gap and states',
                                                '  a remediation plan is in progress (target: Q3 2026).',
                                                '',
                                                'Exception 2 -- CC9.2 Risk Monitoring:',
                                                '  Formal vendor risk assessments for DataBridge\'s own',
                                                '  subprocessors were not documented at the time of audit.',
                                                '  DataBridge states these assessments are conducted informally;',
                                                '  documentation will be formalized by Q4 2026.',
                                                '',
                                                '-------------------------------------------------',
                                                'MANAGEMENT RESPONSE',
                                                '-------------------------------------------------',
                                                '',
                                                'DataBridge Analytics management acknowledges both exceptions',
                                                'and has committed to remediation timelines noted above.',
                                                'A follow-up Type II audit engagement is planned for the',
                                                'period April 1, 2026 through September 30, 2026.',
                                                '',
                                                '-------------------------------------------------',
                                                'END OF REPORT COVER PAGE',
                                                '-------------------------------------------------'
                                            ].join('\n')
                                        },

                                        // ── MSA DRAFT ────────────────────────────────────
                                        // FLAG: missing_clause = "right-to-audit"
                                        //   The document contains: DPA, breach notification,
                                        //   subprocessor disclosure, liability -- but NO
                                        //   right-to-audit clause. Its absence is detectable
                                        //   because (a) assessment_task.txt lists all five
                                        //   clause categories to check, and (b) searching the
                                        //   MSA for "audit" only returns the SOC 2 reference,
                                        //   not a right-to-audit grant.
                                        // FLAG: breach_sla_days = "14"
                                        //   Section 7.2 states "14 calendar days" explicitly.
                                        // DISCOVERY:
                                        //   cat /home/analyst/vendor/msa_draft.txt
                                        //   grep -i "audit" /home/analyst/vendor/msa_draft.txt
                                        //   grep -i "notification" /home/analyst/vendor/msa_draft.txt
                                        'msa_draft.txt': {
                                            type: 'file',
                                            content: [
                                                'MASTER SERVICE AGREEMENT -- DRAFT v0.9',
                                                'Veridian Financial Corp. ("Customer")',
                                                'DataBridge Analytics, Inc. ("Provider")',
                                                '========================================',
                                                'Document Status : DRAFT -- Pending Legal Review',
                                                'Prepared By     : DataBridge Analytics Legal (contracts@databridge.io)',
                                                'Draft Date      : 2026-05-07',
                                                '',
                                                '----------------------------------------',
                                                'SECTION 1 -- DEFINITIONS',
                                                '----------------------------------------',
                                                '',
                                                '1.1 "Services" means the AnalyticsHub SaaS platform and associated',
                                                '    API services provided by Provider.',
                                                '',
                                                '1.2 "Customer Data" means all data submitted to the Services by',
                                                '    Customer or processed on Customer\'s behalf.',
                                                '',
                                                '1.3 "Personal Data" means any information relating to an identified',
                                                '    or identifiable natural person contained within Customer Data.',
                                                '',
                                                '1.4 "Subprocessor" means any third-party entity engaged by Provider',
                                                '    to process Customer Data in connection with the Services.',
                                                '',
                                                '----------------------------------------',
                                                'SECTION 2 -- DATA PROCESSING AGREEMENT',
                                                '----------------------------------------',
                                                '',
                                                '2.1 Provider shall process Customer Data only on documented',
                                                '    instructions from Customer, unless required by applicable law.',
                                                '',
                                                '2.2 Provider shall ensure that persons authorized to process',
                                                '    Customer Data are subject to confidentiality obligations.',
                                                '',
                                                '2.3 Provider shall implement appropriate technical and',
                                                '    organizational measures to protect Customer Data against',
                                                '    unauthorized or unlawful processing, accidental loss,',
                                                '    destruction, or damage.',
                                                '',
                                                '2.4 Provider shall assist Customer in fulfilling its obligations',
                                                '    to respond to data subject requests under applicable law.',
                                                '',
                                                '----------------------------------------',
                                                'SECTION 3 -- SUBPROCESSORS',
                                                '----------------------------------------',
                                                '',
                                                '3.1 Provider hereby discloses the following Subprocessors',
                                                '    currently engaged in the processing of Customer Data:',
                                                '',
                                                '      AWS (Amazon Web Services, Inc.) -- Infrastructure hosting',
                                                '        Jurisdiction: India (ap-south-1 region, Mumbai)',
                                                '      Datadog, Inc.                  -- Application monitoring / logging',
                                                '        Jurisdiction: United States',
                                                '      Twilio SendGrid                -- Transactional email (alerts)',
                                                '        Jurisdiction: United States',
                                                '',
                                                '3.2 Provider shall provide Customer with thirty (30) days written',
                                                '    notice before adding or replacing any Subprocessor that will',
                                                '    process Customer Personal Data.',
                                                '',
                                                '3.3 Customer may object to a new Subprocessor within thirty (30)',
                                                '    days of notice. If Customer objects and the parties cannot',
                                                '    resolve the objection, Customer may terminate the relevant',
                                                '    Services on sixty (60) days written notice.',
                                                '',
                                                '----------------------------------------',
                                                'SECTION 4 -- SECURITY CONTROLS',
                                                '----------------------------------------',
                                                '',
                                                '4.1 Provider shall maintain a written information security program',
                                                '    containing administrative, technical, and physical safeguards',
                                                '    appropriate to the nature and size of Provider\'s operations',
                                                '    and the sensitivity of Customer Data processed.',
                                                '',
                                                '4.2 Provider shall conduct annual third-party security audits and',
                                                '    assessments and make summary findings available to Customer upon',
                                                '    written request. Provider\'s current SOC 2 audit report is',
                                                '    available under NDA upon request.',
                                                '',
                                                '4.3 Provider shall apply encryption to Customer Data at rest',
                                                '    (AES-256) and in transit (TLS 1.2 or higher).',
                                                '',
                                                '----------------------------------------',
                                                'SECTION 5 -- DATA RESIDENCY',
                                                '----------------------------------------',
                                                '',
                                                '5.1 Customer Data processed by Provider will be stored and',
                                                '    processed in AWS ap-south-1 (Mumbai, India).',
                                                '',
                                                '5.2 Provider shall not transfer Customer Data outside of India',
                                                '    without Customer\'s prior written consent, except as required',
                                                '    for Subprocessor activities listed in Section 3.',
                                                '',
                                                '5.3 Customer acknowledges that India is not a country with a',
                                                '    European Commission adequacy decision under GDPR. Where',
                                                '    Customer Data includes Personal Data of EU data subjects,',
                                                '    appropriate transfer mechanisms (e.g., Standard Contractual',
                                                '    Clauses) must be agreed in a separate addendum.',
                                                '',
                                                '----------------------------------------',
                                                'SECTION 6 -- DATA RETENTION AND DELETION',
                                                '----------------------------------------',
                                                '',
                                                '6.1 Provider shall retain Customer Data for the duration of',
                                                '    the Agreement and for a period of ninety (90) days',
                                                '    following termination, after which Provider shall securely',
                                                '    delete all Customer Data.',
                                                '',
                                                '6.2 Upon written request, Provider shall provide a certificate',
                                                '    of destruction within thirty (30) days of completing deletion.',
                                                '',
                                                '----------------------------------------',
                                                'SECTION 7 -- INCIDENT AND BREACH NOTIFICATION',
                                                '----------------------------------------',
                                                '',
                                                '7.1 Provider shall notify Customer of any confirmed Security',
                                                '    Incident affecting Customer Data without unreasonable delay.',
                                                '',
                                                '7.2 For confirmed Personal Data Breaches, Provider shall notify',
                                                '    Customer within 14 calendar days of Provider becoming',
                                                '    aware of the breach.',
                                                '',
                                                '7.3 Breach notification shall include: (a) a description of the',
                                                '    nature of the breach; (b) categories and approximate number',
                                                '    of data subjects and records affected; (c) likely consequences',
                                                '    of the breach; (d) measures taken or proposed by Provider to',
                                                '    address the breach.',
                                                '',
                                                '7.4 Provider shall cooperate with Customer\'s incident response',
                                                '    activities and provide reasonable assistance as requested.',
                                                '',
                                                '----------------------------------------',
                                                'SECTION 8 -- LIABILITY AND INDEMNIFICATION',
                                                '----------------------------------------',
                                                '',
                                                '8.1 Each party shall indemnify and hold harmless the other party',
                                                '    from any third-party claims, damages, and expenses arising',
                                                '    from its own breach of this Agreement.',
                                                '',
                                                '8.2 Provider\'s aggregate liability arising out of or related to',
                                                '    this Agreement shall not exceed the fees paid by Customer in',
                                                '    the twelve (12) months preceding the claim.',
                                                '',
                                                '8.3 Neither party shall be liable for indirect, incidental,',
                                                '    special, or consequential damages.',
                                                '',
                                                '----------------------------------------',
                                                'SECTION 9 -- TERM AND TERMINATION',
                                                '----------------------------------------',
                                                '',
                                                '9.1 This Agreement commences on the Effective Date and continues',
                                                '    for an initial term of one (1) year, renewing annually.',
                                                '',
                                                '9.2 Either party may terminate for material breach on thirty (30)',
                                                '    days written notice if the breach is not cured within that',
                                                '    period.',
                                                '',
                                                '----------------------------------------',
                                                'SECTION 10 -- GENERAL PROVISIONS',
                                                '----------------------------------------',
                                                '',
                                                '10.1 This Agreement constitutes the entire agreement between the',
                                                '     parties regarding its subject matter.',
                                                '',
                                                '10.2 This Agreement shall be governed by and construed in',
                                                '     accordance with the laws of the State of Delaware.',
                                                '',
                                                '10.3 Any amendments to this Agreement must be in writing and',
                                                '     signed by authorized representatives of both parties.',
                                                '',
                                                '========================================',
                                                'END OF DRAFT -- v0.9 PENDING LEGAL REVIEW',
                                                '========================================'
                                            ].join('\n')
                                        },

                                        // ── SECURITY QUESTIONNAIRE ────────────────────────
                                        // FLAG: data_residency = "India"
                                        //   Q7 states "India (AWS ap-south-1, Mumbai)" explicitly;
                                        //   accepted answer is "India".
                                        // Additional context: MFA = partial, prior breach disclosed --
                                        //   these inform the risk_decision but are NOT flag values.
                                        // DISCOVERY:
                                        //   cat /home/analyst/vendor/security_questionnaire.txt
                                        //   grep -i "residency" /home/analyst/vendor/security_questionnaire.txt
                                        //   grep -i "data.*stored\|stored.*data" /home/analyst/vendor/security_questionnaire.txt
                                        'security_questionnaire.txt': {
                                            type: 'file',
                                            content: [
                                                'VERIDIAN FINANCIAL -- VENDOR SECURITY QUESTIONNAIRE',
                                                'Third-Party Risk Management Program | Security-Tier Assessment',
                                                '====================================================',
                                                'Vendor Name   : DataBridge Analytics, Inc.',
                                                'Contact       : security@databridge.io',
                                                'Completed By  : Priya Mehta, Chief Information Security Officer',
                                                'Date Completed: 2026-05-06',
                                                '',
                                                '----------------------------------------------------',
                                                'SECTION A -- ORGANIZATIONAL SECURITY',
                                                '----------------------------------------------------',
                                                '',
                                                'Q1. Does the vendor maintain a written Information Security Policy?',
                                                '  A: Yes. Our Information Security Policy (ISP) is reviewed and',
                                                '     approved annually by the CISO and executive leadership.',
                                                '     Last review: January 2026.',
                                                '',
                                                'Q2. Does the vendor have a dedicated security function?',
                                                '  A: Yes. We have a dedicated security team of three engineers',
                                                '     (two AppSec, one CloudSec) reporting to the CISO.',
                                                '',
                                                'Q3. Does the vendor conduct annual security awareness training?',
                                                '  A: Yes. All employees complete mandatory security awareness',
                                                '     training annually via KnowBe4. Phishing simulation cadence',
                                                '     is quarterly.',
                                                '',
                                                '----------------------------------------------------',
                                                'SECTION B -- ACCESS CONTROLS',
                                                '----------------------------------------------------',
                                                '',
                                                'Q4. Is multi-factor authentication (MFA) required for access',
                                                '    to production systems and customer data?',
                                                '  A: Partial. MFA is enforced for all administrative and',
                                                '     privileged accounts (AWS IAM, database admin consoles).',
                                                '     Standard AnalyticsHub portal user accounts currently do',
                                                '     not require MFA. Remediation is planned for Q3 2026.',
                                                '',
                                                'Q5. Is role-based access control (RBAC) implemented?',
                                                '  A: Yes. All access to production systems and customer data',
                                                '     is governed by RBAC. Access is granted on a least-privilege',
                                                '     basis and reviewed quarterly.',
                                                '',
                                                '----------------------------------------------------',
                                                'SECTION C -- DATA PROTECTION',
                                                '----------------------------------------------------',
                                                '',
                                                'Q6. Is customer data encrypted at rest and in transit?',
                                                '  A: Yes. Data at rest is encrypted using AES-256 (AWS S3',
                                                '     server-side encryption and RDS encryption at rest enabled).',
                                                '     Data in transit is protected with TLS 1.2 minimum',
                                                '     (TLS 1.3 enforced for all new connections since Q1 2026).',
                                                '',
                                                'Q7. Where is customer data physically stored?',
                                                '  A: All customer data is stored in India (AWS ap-south-1,',
                                                '     Mumbai region). No data is stored outside India without',
                                                '     express customer consent. DR/backup replication remains',
                                                '     within the same AWS region (ap-south-1 cross-AZ).',
                                                '',
                                                '----------------------------------------------------',
                                                'SECTION D -- INCIDENT AND BREACH HISTORY',
                                                '----------------------------------------------------',
                                                '',
                                                'Q8. Has the vendor experienced any security incidents or data',
                                                '    breaches in the past three years?',
                                                '  A: Yes -- one disclosed incident.',
                                                '     On 2024-11-03, a misconfigured S3 bucket temporarily',
                                                '     exposed analytics aggregate reports (non-PII summary',
                                                '     statistics) for approximately 6 hours before detection',
                                                '     by our CloudSec monitoring. No customer PII was exposed.',
                                                '     Affected customers were notified. Root cause was a',
                                                '     deployment automation bug. Corrective action: automated',
                                                '     S3 bucket ACL validation added to CI/CD pipeline.',
                                                '     Post-incident report available under NDA upon request.',
                                                '',
                                                'Q9. Does the vendor have a documented Incident Response Plan?',
                                                '  A: Yes. Our IRP is tested annually via tabletop exercise.',
                                                '     Last tabletop: February 2026. Results available upon request.',
                                                '',
                                                '----------------------------------------------------',
                                                'SECTION E -- COMPLIANCE AND CERTIFICATIONS',
                                                '----------------------------------------------------',
                                                '',
                                                'Q10. List current compliance certifications or third-party',
                                                '     attestations held by the vendor.',
                                                '  A: SOC 2 Type I (2026-03-31, auditor: Meridian Assurance',
                                                '     Partners LLP). SOC 2 Type II audit in progress (period:',
                                                '     April 1 -- September 30, 2026; expected report: Q4 2026).',
                                                '     ISO 27001 certification is planned for 2027.',
                                                '',
                                                'Q11. Is the vendor subject to any regulatory frameworks',
                                                '     applicable to Veridian Financial\'s data?',
                                                '  A: We operate under India\'s Digital Personal Data Protection',
                                                '     Act 2023 (DPDP Act). We acknowledge that Veridian\'s',
                                                '     customer data may include EU data subjects (GDPR applicable)',
                                                '     and US consumers (state privacy laws applicable). We are',
                                                '     prepared to execute Standard Contractual Clauses for GDPR',
                                                '     cross-border transfers upon request.',
                                                '',
                                                '====================================================',
                                                'END OF QUESTIONNAIRE',
                                                '===================================================='
                                            ].join('\n')
                                        },

                                        // ── DATA CLASSIFICATION ───────────────────────────
                                        // Context only -- confirms the vendor will handle
                                        // Veridian customer PII (sensitive), which amplifies
                                        // the risk weight of all other findings.
                                        // No flag values embedded here.
                                        'data_classification.txt': {
                                            type: 'file',
                                            content: [
                                                'VERIDIAN FINANCIAL -- DATA CLASSIFICATION SHEET',
                                                'Vendor: DataBridge Analytics, Inc.',
                                                'Engagement: Customer Analytics Reporting SaaS',
                                                '=================================================',
                                                '',
                                                'DATA TYPES TO BE SHARED WITH VENDOR',
                                                '',
                                                '+--------------------+----------------+-------------+---------------------------+',
                                                '| Data Type          | Classification | Volume Est. | Purpose                   |',
                                                '+--------------------+----------------+-------------+---------------------------+',
                                                '| Customer full name | PII -- Sensitive | ~280,000  | Cohort segmentation       |',
                                                '| Customer email     | PII -- Sensitive | ~280,000  | Reporting identification  |',
                                                '| Account tier       | Internal       | ~280,000    | Segment grouping          |',
                                                '| Transaction totals | Internal       | ~1.2M rows  | Aggregate analytics       |',
                                                '| Zip code (5-digit) | PII -- Low Risk  | ~280,000  | Geographic heat map       |',
                                                '+--------------------+----------------+-------------+---------------------------+',
                                                '',
                                                'CLASSIFICATION DEFINITIONS (Veridian Data Policy v3.2)',
                                                '',
                                                '  PII -- Sensitive : Personally identifiable information that',
                                                '    directly identifies an individual. Requires Data Processing',
                                                '    Agreement, encryption at rest and in transit, access logging,',
                                                '    and breach notification obligations. Vendor must meet',
                                                '    Security-Tier baseline before processing.',
                                                '',
                                                '  Internal : Non-public business data. Requires confidentiality',
                                                '    protections but is not subject to PII-specific regulatory',
                                                '    requirements.',
                                                '',
                                                '  PII -- Low Risk : Indirectly identifying data (zip code alone',
                                                '    is not directly identifying). Still subject to confidentiality',
                                                '    controls.',
                                                '',
                                                'REGULATORY APPLICABILITY',
                                                '',
                                                '  Customer PII (name, email) is subject to:',
                                                '    - GDPR (EU data subjects in customer base)',
                                                '    - CCPA / CPRA (California residents)',
                                                '    - Veridian internal Data Policy v3.2',
                                                '',
                                                'RISK NOTE',
                                                '',
                                                '  The combination of customer full name + email + account tier',
                                                '  constitutes Sensitive PII sufficient to enable phishing attacks',
                                                '  or account enumeration if disclosed. Any breach involving this',
                                                '  data set requires mandatory breach notification under GDPR',
                                                '  Art. 33 (72 hours to supervisory authority) and Art. 34',
                                                '  (notification to affected data subjects).',
                                                '',
                                                '=================================================',
                                                'END OF DATA CLASSIFICATION SHEET',
                                                '================================================='
                                            ].join('\n')
                                        }

                                    } // end /home/analyst/vendor children
                                } // end vendor dir

                            } // end /home/analyst children
                        }
                    }
                },

                // /etc and /tmp exist so paths resolve cleanly
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'grc-ws-01' },
                        'hosts':    { type: 'file', content: '127.0.0.1 localhost\n10.10.0.50 grc-ws-01\n10.10.0.51 grc-vault-01' }
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
                return 'Usage: grep [OPTIONS] PATTERN FILE\n  -i  case-insensitive\n  -v  invert match (lines NOT matching)\n  -c  count matching lines\n  -n  show line numbers\n  -A N  print N lines after each match\n  -B N  print N lines before each match\n  -C N  print N lines before and after each match\n\nExample: grep -i "type" /home/analyst/vendor/soc2_report.txt\nExample: grep -A 3 "notification" /home/analyst/vendor/msa_draft.txt\nExample: cat /home/analyst/vendor/msa_draft.txt | grep -i "audit"';
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

            // Determine the content to search: piped stdin OR a named file.
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
        // Lets students count document lines or tally clauses.
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
                'VENDOR DUE DILIGENCE -- COMMAND REFERENCE',
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
                '  /home/analyst/assessment_task.txt              Task brief and investigation guide',
                '  /home/analyst/vendor/soc2_report.txt           SOC 2 audit report',
                '  /home/analyst/vendor/msa_draft.txt             Draft Master Service Agreement',
                '  /home/analyst/vendor/security_questionnaire.txt  Vendor security questionnaire',
                '  /home/analyst/vendor/data_classification.txt   Data types the vendor will handle',
                '',
                'Key investigation commands:',
                '  grep -i "type" /home/analyst/vendor/soc2_report.txt',
                '  grep -i "audit" /home/analyst/vendor/msa_draft.txt',
                '  grep -i "notification" /home/analyst/vendor/msa_draft.txt',
                '  grep -i "residency" /home/analyst/vendor/security_questionnaire.txt',
                '  grep -i "stored" /home/analyst/vendor/security_questionnaire.txt'
            ].join('\n');
        }

    },


    // =========================================================
    // FLAGS
    //
    // All five flags are find-and-submit: the student discovers
    // the exact value from the vendor evidence documents and
    // types it into the Submit Flag panel. BoxEngine validates
    // against Firestore flag_registry/{boxId}/flags/{flagId}.
    //
    // FIRESTORE SEEDING (flag_registry/shield-sp-blueteam-vendor-assessment):
    //   soc2_type       -> Type I
    //   missing_clause  -> right-to-audit
    //   breach_sla_days -> 14
    //   data_residency  -> India
    //   risk_decision   -> conditional
    //
    // VALIDATION NOTES FOR OPERATOR:
    //   soc2_type      -- exact string "Type I" (two words, capital T, Roman numeral I).
    //                     BoxEngine validates with trim + case-insensitive.
    //                     "Type 1" (digit) is NOT accepted -- description instructs Roman numeral.
    //   missing_clause -- exact string "right-to-audit" (all lowercase, hyphenated).
    //                     BoxEngine validates with trim + case-insensitive.
    //                     Student might type "right to audit" (no hyphen) -- the assessment_task
    //                     and flag description both state the hyphenated form explicitly.
    //                     Operator should decide whether to accept "right to audit" as alias
    //                     in Firestore (add validateAlias array if BoxEngine supports it)
    //                     or rely on the explicit phrasing instruction.
    //   breach_sla_days -- exact string "14" (digits only, no units).
    //                     BoxEngine validates with trim + numeric coercion.
    //   data_residency -- exact string "India" (country name as written in Q7).
    //                     BoxEngine validates with trim + case-insensitive.
    //                     "Mumbai" is not accepted; "ap-south-1" is not accepted.
    //   risk_decision  -- exact string "conditional" (all lowercase).
    //                     BoxEngine validates with trim + case-insensitive.
    //                     "approve with conditions" is NOT the flag; assessment_task and
    //                     flag description both say the accepted string is "conditional".
    // =========================================================

    flags: [
        {
            id:          'soc2_type',
            points:      100,
            label:       'SOC 2 Report Type',
            description: 'Identify the type of SOC 2 report the vendor submitted. Read the SOC 2 report cover page. Submit the report type exactly as stated (two words, capital T, Roman numeral). Expected format: "Type I" or "Type II".'
        },
        {
            id:          'missing_clause',
            points:      200,
            label:       'Missing MSA Clause',
            description: 'Read the MSA draft and the assessment task\'s clause checklist. Submit which ONE clause from that checklist is MISSING from the MSA, using the exact label as written in the checklist (all lowercase, hyphenated, no quotes).'
        },
        {
            id:          'breach_sla_days',
            points:      150,
            label:       'Breach Notification SLA (Days)',
            description: 'The MSA draft states a breach notification SLA as a number of calendar days. Find Section 7 and submit the number only -- digits, no units, no text. Note: GDPR Art. 33 requires notification within 72 hours (3 days).'
        },
        {
            id:          'data_residency',
            points:      100,
            label:       'Data Residency Country',
            description: 'The vendor\'s security questionnaire states the country where customer data is stored. Find Question 7 and submit the country name exactly as written there (one word, the country name only -- not the region or city).'
        },
        {
            id:          'risk_decision',
            points:      150,
            label:       'Risk Decision',
            description: 'Based on your assessment of all the evidence, submit exactly one of these two strings: approve or conditional.'
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
    // Progressive: first two hints give strategy/reasoning;
    // third gives the exact command. ONLY the final hint per
    // flag may reveal the answer via {{FLAG:id}} (incurs the
    // largest penalty).
    //
    // No flag value appears in any lore, scenario, intro,
    // assessment_task.txt, notes.txt, help output, or any
    // non-final hint. Values are discoverable ONLY from the
    // vendor evidence documents.
    // =========================================================

    hints: [

        // ── soc2_type ─────────────────────────────────────────
        {
            id:      'hint_soc2_1',
            flagId:  'soc2_type',
            text:    'SOC 2 reports come in two types. One type is a point-in-time assessment: the auditor reviews whether controls are DESIGNED correctly as of a single audit date -- it shows controls look right on paper, but does not test whether they actually worked. The other type is stronger: the auditor tests whether controls OPERATED effectively over a continuous period (minimum six months). For a production vendor handling PII, the stronger continuous-period type is the industry standard. Read the SOC 2 report cover page -- the "Report Type" field names which one the vendor submitted.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_soc2_2',
            flagId:  'soc2_type',
            text:    'Run: cat /home/analyst/vendor/soc2_report.txt\n\nLook at the header section. The "Report Type" field states the type explicitly. It is also mentioned in the Auditor Opinion section, which distinguishes what was and was not tested.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_soc2_3',
            flagId:  'soc2_type',
            text:    'Run: grep -i "report type" /home/analyst/vendor/soc2_report.txt\n\nThe report type is on the "Report Type :" line in the document header. Submit it exactly as written (two words, capital T, Roman numeral).\n\nThe value to submit: {{FLAG:soc2_type}}',
            cost:    75,
            penalty: -75
        },

        // ── missing_clause ────────────────────────────────────
        {
            id:      'hint_missing_1',
            flagId:  'missing_clause',
            text:    'One standard MSA clause type gives the customer the contractual right to inspect or commission an independent audit of the vendor\'s security practices -- either directly or via a third-party assessor. Without this clause, the vendor can refuse an inspection request and you have no contractual recourse. For Security-Tier vendors handling PII, this clause is a GRC policy requirement at Veridian Financial. The assessment task lists five clause categories to check -- verify each one is present in the MSA draft.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_missing_2',
            flagId:  'missing_clause',
            text:    'Run: grep -i "audit" /home/analyst/vendor/msa_draft.txt\n\nThis returns every line in the MSA that mentions "audit." Read what it says: Section 4.2 references "third-party security assessments" and making results available upon request. That is NOT the same as granting the customer a direct inspection right. The clause that would grant Veridian the right to inspect DataBridge -- a clause that would read something like "Customer shall have the right to audit Provider\'s compliance with this Agreement..." -- does not appear anywhere in the draft. The assessment task names the exact clause type and the phrasing to use when you submit it as a flag.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_missing_3',
            flagId:  'missing_clause',
            text:    'The five clause types listed in the assessment task are: DPA (Section 2), subprocessor disclosure (Section 3), breach notification (Section 7), liability and indemnification (Section 8) -- and one that is missing entirely. Search the entire MSA:\n\n  grep -i "right.to.audit" /home/analyst/vendor/msa_draft.txt\n\nZero results confirms the absence. Submit the missing clause type using the exact phrasing stated in the assessment task.\n\nThe value to submit: {{FLAG:missing_clause}}',
            cost:    75,
            penalty: -75
        },

        // ── breach_sla_days ───────────────────────────────────
        {
            id:      'hint_breach_1',
            flagId:  'breach_sla_days',
            text:    'A breach notification SLA defines how quickly the vendor must notify you after discovering a data breach involving your data. GDPR Article 33 requires notification to the supervisory authority within 72 hours (3 days) of becoming aware of a personal data breach. Look for the breach notification section of the MSA draft and note the SLA window -- then compare it to the 72-hour GDPR requirement.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_breach_2',
            flagId:  'breach_sla_days',
            text:    'Run: grep -i "notification" /home/analyst/vendor/msa_draft.txt\n\nAlternatively: grep -n "calendar days" /home/analyst/vendor/msa_draft.txt\n\nSection 7 covers incident and breach notification. Section 7.2 states the SLA window for confirmed Personal Data Breaches. The SLA is expressed as a number of calendar days.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_breach_3',
            flagId:  'breach_sla_days',
            text:    'Run: cat /home/analyst/vendor/msa_draft.txt | grep -A1 "7.2"\n\nSection 7.2 is the breach notification SLA clause. It states the window in calendar days. Submit only the number -- no units, no text.\n\nThe value to submit: {{FLAG:breach_sla_days}}',
            cost:    75,
            penalty: -75
        },

        // ── data_residency ────────────────────────────────────
        {
            id:      'hint_residency_1',
            flagId:  'data_residency',
            text:    'Data residency refers to the physical country where data is stored. For GDPR purposes, storing EU personal data outside the EU requires an appropriate transfer mechanism (Standard Contractual Clauses, Binding Corporate Rules, or adequacy decision). Not all countries have an EU adequacy decision -- meaning GDPR treats them as having weaker privacy protections by default. The vendor\'s security questionnaire directly answers where they store your data.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_residency_2',
            flagId:  'data_residency',
            text:    'Run: grep -i "stored" /home/analyst/vendor/security_questionnaire.txt\n\nOr: grep -i "Q7" /home/analyst/vendor/security_questionnaire.txt\n\nQuestion 7 of the security questionnaire asks the vendor directly where customer data is stored. The answer states the country and the specific cloud region. Submit the country name only (one word) exactly as written in the questionnaire answer.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_residency_3',
            flagId:  'data_residency',
            text:    'Run: cat /home/analyst/vendor/security_questionnaire.txt | grep -A3 "Q7"\n\nThe answer to Q7 starts with the country name, followed by the AWS region in parentheses. Submit the country name only -- not the region identifier, not the city.\n\nThe value to submit: {{FLAG:data_residency}}',
            cost:    75,
            penalty: -75
        },

        // ── risk_decision ─────────────────────────────────────
        {
            id:      'hint_decision_1',
            flagId:  'risk_decision',
            text:    'A GRC risk decision is not simply pass/fail -- it is a risk-informed judgment. Compile your findings across all four evidence documents: What SOC 2 report type did they submit? Is the customer inspection clause present in the MSA? Does the breach notification SLA comply with GDPR requirements? Where is the data stored and what is the jurisdictional risk? Was there a prior breach? Weigh real security controls against the contractual and compliance gaps you found. The assessment task describes two possible decision strings -- read that description carefully.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_decision_2',
            flagId:  'risk_decision',
            text:    'Tally all the findings you discovered across the four documents. The vendor has real security controls (encryption at rest and in transit, RBAC, documented IRP, annual training). The gaps are contractual and compliance-related: the SOC 2 report is the weaker point-in-time type (a stronger period audit is in progress), the MSA is missing the customer inspection clause, the breach notification SLA does not meet GDPR requirements, the data residency country lacks an EU adequacy decision, and there is one disclosed prior incident. These are fixable gaps -- not fundamental security failures. The assessment task gives you the exact two strings to choose between. One means no conditions; the other means approval with required remediation.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_decision_3',
            flagId:  'risk_decision',
            text:    'The evidence shows real security controls (encryption, RBAC, IRP, partial MFA) alongside fixable contractual gaps (missing right-to-audit, non-GDPR-compliant breach SLA). The vendor is not an outright reject -- but you cannot approve without requiring remediation. The correct decision is conditional approval: approve the vendor subject to contractual gap remediation before data sharing begins.\n\nThe value to submit: {{FLAG:risk_decision}}',
            cost:    75,
            penalty: -75
        }

    ],

    // =========================================================
    // CERT OBJECTIVES (assessment mode compatibility)
    //
    // certObjectives.mappings is the live format (flat array
    // under certObjectives). All five flags map to SY0-701
    // Domain 5 objectives covering third-party risk management,
    // vendor agreements, GRC governance, and risk analysis.
    // =========================================================

    certObjectives: {
        certPath: 'CompTIA Security+ SY0-701',
        mappings: [
            {
                flagId:      'soc2_type',
                objective:   '5.1',
                description: 'Summarize elements of effective security governance -- compliance frameworks and audit reports',
                skill:       'Interpreting SOC 2 report types (Type I vs Type II) and understanding the assurance gap between point-in-time design review and continuous operating effectiveness testing'
            },
            {
                flagId:      'missing_clause',
                objective:   '5.6',
                description: 'Explain the importance of using appropriate data sources -- vendor agreements and contractual controls',
                skill:       'Identifying the absence of a right-to-audit clause in a Master Service Agreement during third-party vendor due diligence'
            },
            {
                flagId:      'breach_sla_days',
                objective:   '5.6',
                description: 'Explain the importance of using appropriate data sources -- breach notification obligations',
                skill:       'Evaluating a vendor breach notification SLA against GDPR Article 33 (72-hour mandatory notification window) and identifying non-compliance'
            },
            {
                flagId:      'data_residency',
                objective:   '5.3',
                description: 'Explain the processes associated with third-party risk management -- data residency and jurisdictional risk',
                skill:       'Identifying data residency from vendor documentation and assessing cross-border transfer risk under GDPR for countries without an EU adequacy decision'
            },
            {
                flagId:      'risk_decision',
                objective:   '5.4',
                description: 'Summarize elements of effective security compliance -- risk-based vendor decision making',
                skill:       'Synthesizing SOC 2 type, contractual gaps, breach SLA compliance, data residency, and breach history into a risk-informed conditional approval recommendation'
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
// Use window.VFVAConfig -- the bare name is not in scope after the window= assignment.
if (window.VFVAConfig) window.VFVAConfig.resetState();
