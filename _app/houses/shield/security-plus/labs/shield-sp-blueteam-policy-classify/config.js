/* ============================================================
   Security+ Cert Prep -- Governance Documentation Review
   Blue-team GRC classification box | find-and-submit flags
   Students read real governance and agreement document excerpts
   in a simulated terminal, classify each by its document type
   using a controlled vocabulary, and submit type names as flags.
   SY0-701: 5.1 (governance document types and agreement types)
   ============================================================ */

// window assignment (not const) so the second <script> block in index.html
// can reference VFPCConfig after this script has loaded.
window.VFPCConfig = {

    // =========================================================
    // BOX METADATA
    // =========================================================

    id:            'shield-sp-blueteam-policy-classify',
    title:         'Governance Documentation Review',
    subtitle:      'Veridian Financial -- Classify the Document Stack',
    description:   'Six documents from Veridian Financial\'s governance library landed in your queue with no labels -- just filenames. Read each one carefully and identify its document type. Submit every classification using the exact controlled vocabulary in your task file.',
    difficulty:    'Intermediate',
    estimatedTime: 35,
    accent:        '#2563eb',
    storageKey:    'hexworth_lab_sp_blueteam_policy_classify',
    registryId:    'shield-sp-blueteam-policy-classify',
    trackerKey:    'lab_sp_blueteam_policy_classify',

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
            'Document archive mount: /home/analyst/docs -- READY',
            'Classification queue opened: 2026-06-10 08:00 UTC',
            'Assignment ticket: GRC-2026-0610-012 -- ACTIVE'
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
        intro: 'GRC-2026-0610-012: "Document archive triage required. Six files were pulled from the governance repository after a metadata wipe during last night\'s system migration. All type labels are gone. Your job: read each document excerpt, determine its type using the Security+ governance taxonomy, and submit your classifications. The controlled vocabulary is in your task file."',

        scenario: 'Six document files are in /home/analyst/docs/. Read each one carefully -- the language, structure, and intent within the text itself is what identifies the document type. A governance hierarchy document tells you the WHAT or WHY (policy), the exact measurable HOW (standard), or the step-by-step numbered HOW-TO (procedure). A recommended-but-not-required document is a guideline. Agreement documents describe a contractual relationship between two parties: uptime and remedies (SLA), non-binding intent (MOU), overarching master terms (MSA), confidentiality obligations (NDA), or a business-partner arrangement (BPA). Read classification_task.txt first -- it lists the accepted vocabulary words and definitions.',

        outro: 'Classification complete. All six document types correctly identified. This taxonomy is the foundation of SY0-701 Domain 5: policies establish mandatory intent, standards set the measurable bar, procedures define the steps, guidelines offer non-mandatory guidance. Agreement types define your legal relationship with external parties -- knowing the difference between an SLA (measurable uptime commitment), MOU (non-binding intent), MSA (overarching master terms), NDA (confidentiality), and BPA (partner arrangement) is essential when evaluating vendor contracts and third-party risk.',

        goals: [
            'Read each document excerpt and identify distinguishing language that signals its type',
            'Distinguish policy (mandatory, high-level intent) from standard (mandatory, specific measurable requirement)',
            'Distinguish procedure (numbered step-by-step) from guideline (recommended, non-mandatory)',
            'Identify agreement type from structural signals: uptime+remedies (SLA), non-binding intent (MOU), overarching master terms (MSA), confidentiality obligations (NDA), partner arrangement (BPA)',
            'Submit every classification using the exact vocabulary string listed in classification_task.txt'
        ],

        toolkit: [
            { name: 'cat',  purpose: 'Display a full document',              sample: 'cat /home/analyst/docs/doc1.txt'               },
            { name: 'grep', purpose: 'Search for a pattern in a document',   sample: 'grep -i "shall" /home/analyst/docs/doc2.txt'   },
            { name: 'ls',   purpose: 'List files in a directory',            sample: 'ls /home/analyst/docs/'                        },
            { name: 'head', purpose: 'Show first N lines of a file',         sample: 'head -n 20 /home/analyst/docs/doc3.txt'        },
            { name: 'find', purpose: 'Locate files in a directory tree',     sample: 'find /home/analyst -name "*.txt"'              },
            { name: 'help', purpose: 'Show available commands',              sample: 'help'                                          }
        ]
    },

    // =========================================================
    // TERMINAL CONFIG
    // =========================================================

    terminal: {
        user:     'analyst',
        hostname: 'grc-ws-01',
        startDir: '/home/analyst',
        welcome:  'Veridian Financial -- GRC Analyst Terminal\nTier-2 Access | GRC-2026-0610-012 Active\n\nDocument classification queue: /home/analyst/docs/\n  doc1.txt  doc2.txt  doc3.txt  doc4.txt  doc5.txt  doc6.txt\n\nTask brief: /home/analyst/classification_task.txt\n\nRead each document. Identify its type. Submit via the Submit Flag panel.\n\nType "help" for available commands.\n'
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
    //   classification_task.txt  -- task brief + CONTROLLED VOCABULARY only
    //   notes.txt                -- GRC taxonomy scratch pad
    //   docs/
    //     doc1.txt   -- POLICY    (mandatory high-level intent, no specs/steps)
    //     doc2.txt   -- STANDARD  (mandatory specific: algorithm names, thresholds)
    //     doc3.txt   -- PROCEDURE (numbered step-by-step instructions)
    //     doc4.txt   -- GUIDELINE (recommended, non-mandatory, "should" language)
    //     doc5.txt   -- SLA       (uptime %, response-time metrics, service credits)
    //     doc6.txt   -- NDA       (confidentiality obligations, "Confidential Information")
    //
    // ANTI-LEAK ENFORCEMENT:
    //   - No doc file names its type anywhere in its text
    //   - classification_task.txt lists the vocabulary SET, not per-doc answers
    //   - notes.txt: definitions only, no doc-to-type mapping
    //   - No type names appear in help output examples (generic commands only)
    //   - Non-final hints give strategy only; final hint per flag uses {{FLAG:id}}
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

                                // ── CLASSIFICATION TASK ──────────────────────────────
                                // Lists vocabulary SET and per-flag submission format.
                                // Does NOT map any doc to its type.
                                'classification_task.txt': {
                                    type: 'file',
                                    content: [
                                        'GOVERNANCE DOCUMENT CLASSIFICATION -- GRC-2026-0610-012',
                                        '=======================================================',
                                        'Assigned  : 2026-06-10 08:00 UTC',
                                        'Analyst   : (you)',
                                        'Context   : Veridian Financial governance archive migration',
                                        '           -- document type metadata stripped, must re-classify.',
                                        '',
                                        'DOCUMENT QUEUE',
                                        '  Six files in /home/analyst/docs/ -- read each one in full.',
                                        '  File names: doc1.txt through doc6.txt.',
                                        '',
                                        'YOUR TASK',
                                        '  For each document, read its content carefully and determine',
                                        '  its type from the controlled vocabulary below. Submit the',
                                        '  type string as a flag using the exact spelling and',
                                        '  capitalization shown.',
                                        '',
                                        '-------------------------------------------------------',
                                        'CONTROLLED VOCABULARY',
                                        '-------------------------------------------------------',
                                        '',
                                        'GOVERNANCE HIERARCHY TYPES (use these for doc1 -- doc4)',
                                        '',
                                        '  policy',
                                        '    Mandatory, high-level statement of intent. Defines',
                                        '    WHAT must be done and WHY. Does not specify technical',
                                        '    thresholds, algorithms, or step-by-step actions.',
                                        '    Language: "must", "shall", "are required to".',
                                        '    Authority: management or board level.',
                                        '',
                                        '  standard',
                                        '    Mandatory, specific measurable requirement that supports',
                                        '    a policy. Defines HOW a policy requirement is met in',
                                        '    measurable terms: named algorithms, version numbers,',
                                        '    minimum thresholds, configuration values.',
                                        '    Language: "must", "shall", often with numbers and specs.',
                                        '',
                                        '  procedure',
                                        '    Mandatory, numbered step-by-step instructions for',
                                        '    performing a specific task or process. Tells operators',
                                        '    exactly what to do, in what order, with specific commands',
                                        '    or actions at each step.',
                                        '',
                                        '  guideline',
                                        '    Non-mandatory recommendation. Provides advice and best',
                                        '    practice without imposing a requirement. Language:',
                                        '    "should", "recommended", "it is advisable", "encouraged".',
                                        '    Deviation does not constitute a policy violation.',
                                        '',
                                        'AGREEMENT TYPES (use these for doc5 -- doc6)',
                                        '',
                                        '  SLA',
                                        '    Service Level Agreement. Defines measurable service',
                                        '    commitments (uptime %, response time targets) and the',
                                        '    financial remedies (service credits) when those',
                                        '    commitments are not met.',
                                        '',
                                        '  MOU',
                                        '    Memorandum of Understanding. Non-binding statement of',
                                        '    mutual intent between parties. Does not create legally',
                                        '    enforceable obligations. Sets the stage for a formal',
                                        '    agreement.',
                                        '',
                                        '  MSA',
                                        '    Master Service Agreement. Overarching contract that',
                                        '    establishes the general terms and conditions governing',
                                        '    all services between the parties. Specific deliverables',
                                        '    are handled in separate SOWs or order forms.',
                                        '',
                                        '  NDA',
                                        '    Non-Disclosure Agreement. Defines what constitutes',
                                        '    "Confidential Information" and obligates the receiving',
                                        '    party not to disclose it without authorization.',
                                        '',
                                        '  BPA',
                                        '    Business Partner Agreement. Governs the relationship',
                                        '    and responsibilities between organizations that',
                                        '    exchange data or collaborate on business operations.',
                                        '',
                                        '-------------------------------------------------------',
                                        'SUBMISSION FORMAT',
                                        '-------------------------------------------------------',
                                        '',
                                        '  Flag IDs: doc1_type, doc2_type, doc3_type,',
                                        '            doc4_type, doc5_type, doc6_type',
                                        '',
                                        '  Submit the exact vocabulary string for each document.',
                                        '  Hierarchy types are lowercase (policy, standard,',
                                        '  procedure, guideline). Agreement types use the',
                                        '  capitalization shown above (SLA, MOU, MSA, NDA, BPA).',
                                        '',
                                        '-------------------------------------------------------',
                                        'INVESTIGATION COMMANDS',
                                        '-------------------------------------------------------',
                                        '',
                                        '  ls /home/analyst/docs/',
                                        '  cat /home/analyst/docs/doc1.txt',
                                        '  cat /home/analyst/docs/doc2.txt',
                                        '  cat /home/analyst/docs/doc3.txt',
                                        '  cat /home/analyst/docs/doc4.txt',
                                        '  cat /home/analyst/docs/doc5.txt',
                                        '  cat /home/analyst/docs/doc6.txt',
                                        '  grep -i "should" /home/analyst/docs/doc4.txt',
                                        '  grep -i "shall" /home/analyst/docs/doc1.txt'
                                    ].join('\n')
                                },

                                // Analyst scratch notes -- definitions only, NO doc-to-type mapping
                                'notes.txt': {
                                    type: 'file',
                                    content: [
                                        'GRC DOCUMENT TAXONOMY -- SCRATCH PAD',
                                        '=====================================',
                                        '',
                                        'KEY SIGNAL: MANDATORY vs RECOMMENDED',
                                        '  Mandatory language  -> policy, standard, or procedure',
                                        '  Recommended language -> guideline',
                                        '  Contractual language -> one of the five agreement types',
                                        '',
                                        'DISTINGUISHING MANDATORY GOVERNANCE DOCUMENTS:',
                                        '',
                                        '  Policy vs Standard:',
                                        '    Policy says WHAT must happen at a strategic level.',
                                        '    "All employees must protect Veridian data." -- high-level, no specs.',
                                        '    Standard says HOW specifically -- with numbers and named requirements.',
                                        '    "Passwords must be minimum 12 characters, include AES-256..." -- measurable.',
                                        '',
                                        '  Standard vs Procedure:',
                                        '    Standard gives the measurable requirement (thresholds, algorithms).',
                                        '    Procedure gives numbered STEPS to execute a task.',
                                        '    "Step 1: Log in to... Step 2: Click... Step 3: Select..." -- procedural.',
                                        '',
                                        '  Guideline:',
                                        '    Look for "should", "recommended", "encouraged", "it is advisable".',
                                        '    Absence of mandatory "must"/"shall" at the requirement level.',
                                        '    Deviation is acceptable -- no compliance violation.',
                                        '',
                                        'DISTINGUISHING AGREEMENT TYPES:',
                                        '',
                                        '  SLA   -> uptime %, response times, service credits',
                                        '  MOU   -> "non-binding", "mutual intent", no enforcement clause',
                                        '  MSA   -> master/overarching terms, SOW/order forms referenced',
                                        '  NDA   -> "Confidential Information" defined, non-disclosure obligations',
                                        '  BPA   -> business partner responsibilities, data exchange, joint obligations',
                                        '',
                                        'My working classifications:',
                                        '  doc1: ',
                                        '  doc2: ',
                                        '  doc3: ',
                                        '  doc4: ',
                                        '  doc5: ',
                                        '  doc6: '
                                    ].join('\n')
                                },

                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls /home/analyst/\ncat /home/analyst/classification_task.txt\n'
                                },

                                // ── DOCUMENT ARCHIVE ──────────────────────────────────
                                'docs': {
                                    type: 'dir',
                                    children: {

                                        // ── DOC1: POLICY ─────────────────────────────────
                                        //
                                        // Classification: policy
                                        // Signals:
                                        //   - Title: "Information Security Obligations" -- neutral;
                                        //     does NOT include the word "Policy" so the student
                                        //     cannot classify by title alone and must read the content.
                                        //   - Language: "must", "shall", "are required to" throughout
                                        //   - No technical thresholds, algorithm names, or numbered steps
                                        //     (distinguishes from standard and procedure)
                                        //   - Approved by: Board of Directors (authority signal for
                                        //     the highest governance tier)
                                        //   - Purpose, Scope, Responsibilities, and Enforcement
                                        //     sections are strategic -- tells WHAT and WHY, never HOW
                                        //
                                        'doc1.txt': {
                                            type: 'file',
                                            content: [
                                                'VERIDIAN FINANCIAL CORP.',
                                                'INFORMATION SECURITY OBLIGATIONS',
                                                '=================================',
                                                'Document ID  : VFC-SEC-001',
                                                'Version      : 4.2',
                                                'Effective Date: 2026-01-01',
                                                'Review Cycle : Annual',
                                                'Approved By  : Board of Directors, Risk & Audit Committee',
                                                '',
                                                '1. PURPOSE',
                                                '',
                                                'Veridian Financial Corp. (Veridian) is committed to protecting',
                                                'the confidentiality, integrity, and availability of all',
                                                'information assets. This document establishes the mandatory',
                                                'security obligations that govern how Veridian employees,',
                                                'contractors, and third-party users handle information belonging',
                                                'to Veridian and its customers.',
                                                '',
                                                '2. SCOPE',
                                                '',
                                                'This policy applies to all individuals who access, process,',
                                                'store, or transmit Veridian information assets, regardless of',
                                                'employment type, location, or device used. Third parties must',
                                                'comply with this policy as a condition of doing business with',
                                                'Veridian.',
                                                '',
                                                '3. INFORMATION SECURITY OBLIGATIONS',
                                                '',
                                                '3.1 All personnel must protect Veridian information assets from',
                                                '    unauthorized access, disclosure, modification, or destruction.',
                                                '',
                                                '3.2 Personnel are required to report any known or suspected',
                                                '    security incident, data breach, or policy violation to the',
                                                '    Information Security team immediately upon discovery.',
                                                '',
                                                '3.3 Access to Veridian systems and data shall be granted on the',
                                                '    principle of least privilege. Personnel must not access',
                                                '    information beyond what is required to perform their',
                                                '    authorized job functions.',
                                                '',
                                                '3.4 All personnel must complete mandatory security awareness',
                                                '    training within thirty days of hire and annually thereafter.',
                                                '',
                                                '3.5 Veridian information classified as Confidential or Restricted',
                                                '    must not be disclosed to any party outside Veridian without',
                                                '    appropriate authorization and a signed confidentiality agreement.',
                                                '',
                                                '4. RESPONSIBILITIES',
                                                '',
                                                '4.1 The Chief Information Security Officer (CISO) is responsible',
                                                '    for maintaining this policy, ensuring its implementation,',
                                                '    and reporting compliance status to executive leadership.',
                                                '',
                                                '4.2 Department heads are responsible for ensuring their',
                                                '    personnel comply with this policy and for reporting',
                                                '    exceptions to the CISO.',
                                                '',
                                                '4.3 All personnel are personally responsible for understanding',
                                                '    and adhering to this policy.',
                                                '',
                                                '5. ENFORCEMENT',
                                                '',
                                                'Violations of this policy may result in disciplinary action',
                                                'up to and including termination of employment or contract,',
                                                'and may be referred to law enforcement authorities where',
                                                'applicable.',
                                                '',
                                                '6. RELATED DOCUMENTS',
                                                '',
                                                'This policy is supported by technical standards, operational',
                                                'procedures, and guidelines maintained by the Information',
                                                'Security team. Those documents specify the precise requirements',
                                                'and steps required to fulfill the obligations stated herein.',
                                                '',
                                                '================================',
                                                'END OF DOCUMENT -- VFC-SEC-001 v4.2'
                                            ].join('\n')
                                        },

                                        // ── DOC2: STANDARD ───────────────────────────────
                                        //
                                        // Classification: standard
                                        // Signals:
                                        //   - Title: "Authentication Security Requirements" (NOT
                                        //     "Standard" -- student must classify by content)
                                        //   - Mandatory language ("must", "shall") -- shared with
                                        //     policy, but here every requirement has a measurable
                                        //     SPECIFIC threshold or named technical value:
                                        //       - "minimum 12 characters" (threshold)
                                        //       - "AES-256" (named algorithm)
                                        //       - "TLS 1.2 or higher" (named version)
                                        //       - "90 days" (specific rotation period)
                                        //       - "PBKDF2 with SHA-256, minimum 100,000 iterations"
                                        //   - NO numbered step-by-step instructions (distinguishes
                                        //     from procedure)
                                        //   - Measurable, auditable requirements throughout
                                        //
                                        'doc2.txt': {
                                            type: 'file',
                                            content: [
                                                'VERIDIAN FINANCIAL CORP.',
                                                'AUTHENTICATION SECURITY REQUIREMENTS',
                                                '=====================================',
                                                'Document ID   : VFC-SEC-STD-004',
                                                'Version       : 3.1',
                                                'Effective Date: 2026-01-01',
                                                'Review Cycle  : Annual',
                                                'Approved By   : CISO',
                                                '',
                                                '1. PURPOSE AND SCOPE',
                                                '',
                                                'This document defines the mandatory technical requirements for',
                                                'authentication credentials and encryption used to protect',
                                                'Veridian Financial information systems. All systems that store',
                                                'or process Veridian data must comply with these specifications.',
                                                '',
                                                '2. PASSWORD REQUIREMENTS',
                                                '',
                                                '2.1 Minimum length: Passwords must be at least 12 characters.',
                                                '',
                                                '2.2 Complexity: Passwords must contain characters from at least',
                                                '    three of the following four categories:',
                                                '      - Uppercase letters (A-Z)',
                                                '      - Lowercase letters (a-z)',
                                                '      - Digits (0-9)',
                                                '      - Special characters: ! @ # $ % ^ & * ( ) - _ = +',
                                                '',
                                                '2.3 Maximum age: Passwords for privileged accounts must be',
                                                '    rotated every 90 days. Standard user account passwords',
                                                '    must be rotated every 180 days.',
                                                '',
                                                '2.4 Password history: Systems must prevent reuse of the',
                                                '    previous 12 passwords for any account.',
                                                '',
                                                '2.5 Account lockout: Systems must lock accounts after a',
                                                '    maximum of 5 consecutive failed authentication attempts.',
                                                '    Lockout duration must be a minimum of 15 minutes.',
                                                '',
                                                '3. PASSWORD STORAGE',
                                                '',
                                                '3.1 Passwords must never be stored in plaintext.',
                                                '',
                                                '3.2 Passwords must be hashed using a key-stretching algorithm.',
                                                '    Approved algorithms: PBKDF2 with SHA-256 at a minimum of',
                                                '    100,000 iterations, bcrypt with a cost factor of 12 or',
                                                '    higher, or Argon2id with memory parameter 64 MiB or higher.',
                                                '',
                                                '3.3 Each password hash must use a cryptographically random',
                                                '    salt of at least 16 bytes, unique per credential.',
                                                '',
                                                '4. MULTI-FACTOR AUTHENTICATION',
                                                '',
                                                '4.1 MFA must be enforced for all privileged and administrative',
                                                '    account logins.',
                                                '',
                                                '4.2 Approved MFA methods: TOTP (RFC 6238, minimum 6-digit code,',
                                                '    30-second window), FIDO2/WebAuthn hardware security keys.',
                                                '    SMS-based OTP does not meet this requirement.',
                                                '',
                                                '5. ENCRYPTION IN TRANSIT',
                                                '',
                                                '5.1 All authentication traffic must be protected by TLS 1.2',
                                                '    or higher. TLS 1.0 and 1.1 are prohibited.',
                                                '',
                                                '5.2 Cipher suite negotiation must exclude NULL, export-grade,',
                                                '    RC4, and DES/3DES cipher suites.',
                                                '',
                                                '6. ENCRYPTION AT REST',
                                                '',
                                                '6.1 All stored credentials and associated PII must be encrypted',
                                                '    at rest using AES-256 in GCM mode.',
                                                '',
                                                '====================================',
                                                'END OF DOCUMENT -- VFC-SEC-STD-004 v3.1'
                                            ].join('\n')
                                        },

                                        // ── DOC3: PROCEDURE ──────────────────────────────
                                        //
                                        // Classification: procedure
                                        // Signals:
                                        //   - Title: "Access Provisioning Process" (NOT "Procedure")
                                        //   - Numbered steps at every level (Step 1, Step 2... and
                                        //     sub-steps 3.1, 3.2 etc.)
                                        //   - Specific system actions: "navigate to", "click",
                                        //     "select", "enter", "submit", "verify" -- operators
                                        //     executing this perform discrete actions in sequence
                                        //   - Actor-specific instructions ("Requesting Manager",
                                        //     "IAM Administrator") -- tells who does what
                                        //   - If-then branching at step level (approval decision)
                                        //   - NO measurable thresholds or algorithm names (no specs
                                        //     floating free of steps -- distinguishes from standard)
                                        //
                                        'doc3.txt': {
                                            type: 'file',
                                            content: [
                                                'VERIDIAN FINANCIAL CORP.',
                                                'USER ACCESS PROVISIONING PROCESS',
                                                '=================================',
                                                'Document ID   : VFC-IAM-PROC-002',
                                                'Version       : 2.4',
                                                'Effective Date: 2025-09-01',
                                                'Review Cycle  : Semi-annual',
                                                'Author        : IAM Operations, Information Security',
                                                '',
                                                'OVERVIEW',
                                                '',
                                                'This document provides step-by-step instructions for',
                                                'provisioning access to Veridian systems for new employees,',
                                                'contractors, and role changes. All steps must be completed',
                                                'in the order listed. Do not proceed to a subsequent step',
                                                'until the current step is confirmed complete.',
                                                '',
                                                'PREREQUISITES',
                                                '',
                                                '  - Requester has an active Veridian employee or contractor account',
                                                '  - HR system shows the user as Active with an assigned cost center',
                                                '  - A completed Access Request Form (ARF-001) is available',
                                                '',
                                                'STEP 1 -- SUBMIT ACCESS REQUEST',
                                                '',
                                                '  1.1 The Requesting Manager logs in to the Identity Management',
                                                '      Portal at https://iam.internal.veridian.com.',
                                                '',
                                                '  1.2 Click "New Request" on the dashboard.',
                                                '',
                                                '  1.3 Select "User Access Provisioning" from the request type',
                                                '      dropdown.',
                                                '',
                                                '  1.4 Enter the new user\'s employee ID number in the "User ID"',
                                                '      field. The portal will auto-populate the user\'s name,',
                                                '      department, and job title from HR records.',
                                                '',
                                                '  1.5 Select each system role the user requires from the',
                                                '      "Requested Roles" list. For each role, enter the',
                                                '      business justification in the "Justification" text box.',
                                                '',
                                                '  1.6 Click "Submit Request." The portal assigns a ticket ID',
                                                '      and sends an email confirmation to the Requesting Manager.',
                                                '      Note the ticket ID for tracking.',
                                                '',
                                                'STEP 2 -- INFORMATION SECURITY REVIEW',
                                                '',
                                                '  2.1 The IAM Operations team receives the request in the',
                                                '      provisioning queue. Log in to the IAM Admin Console',
                                                '      and open the request ticket.',
                                                '',
                                                '  2.2 Verify the following:',
                                                '      a. The requester\'s manager authorization signature is present',
                                                '         on the attached ARF-001 form.',
                                                '      b. Each requested role aligns with the user\'s job title as',
                                                '         listed in the HR system.',
                                                '      c. No requested role grants access beyond what the user\'s',
                                                '         job function requires (least-privilege check).',
                                                '',
                                                '  2.3 If all checks pass, proceed to Step 3.',
                                                '      If any check fails, click "Return to Requester" and',
                                                '      document the reason in the Reviewer Notes field.',
                                                '',
                                                'STEP 3 -- PROVISION ACCESS',
                                                '',
                                                '  3.1 In the IAM Admin Console, open the approved ticket.',
                                                '',
                                                '  3.2 Click "Provision User." The console will create the',
                                                '      user account in Active Directory and apply all approved',
                                                '      role assignments.',
                                                '',
                                                '  3.3 Verify provisioning completed without errors by checking',
                                                '      the "Provisioning Status" field shows "Success."',
                                                '',
                                                '  3.4 Click "Send Welcome Email" to notify the new user of',
                                                '      their account details and the link to set their initial',
                                                '      password via the self-service portal.',
                                                '',
                                                'STEP 4 -- CONFIRM AND CLOSE',
                                                '',
                                                '  4.1 Reply to the original request ticket confirming that',
                                                '      provisioning is complete. Include the timestamp and',
                                                '      IAM Administrator name in the reply.',
                                                '',
                                                '  4.2 Change the ticket status to "Closed - Resolved."',
                                                '',
                                                '  4.3 Retain a copy of the completed ARF-001 in the',
                                                '      access-request archive folder for the current calendar',
                                                '      year for audit purposes.',
                                                '',
                                                '=================================',
                                                'END OF DOCUMENT -- VFC-IAM-PROC-002 v2.4'
                                            ].join('\n')
                                        },

                                        // ── DOC4: GUIDELINE ──────────────────────────────
                                        //
                                        // Classification: guideline
                                        // Signals:
                                        //   - Title: "Remote Work Security Guidance" (NOT "Guideline")
                                        //   - Dominant "should" and "recommended" throughout every
                                        //     section -- unmistakably non-mandatory register
                                        //   - Explicitly states non-mandatory nature:
                                        //     "Deviation from this guidance does not constitute a
                                        //      policy violation"
                                        //   - No numbered action steps (distinguishes from procedure)
                                        //   - No measurable mandatory thresholds (distinguishes from
                                        //     standard -- there are informal recommendations like
                                        //     "dedicated work area" but no enforced specs)
                                        //   - No "must"/"shall" at the requirement level
                                        //
                                        'doc4.txt': {
                                            type: 'file',
                                            content: [
                                                'VERIDIAN FINANCIAL CORP.',
                                                'REMOTE WORK SECURITY GUIDANCE',
                                                '==============================',
                                                'Document ID   : VFC-SEC-GL-009',
                                                'Version       : 1.3',
                                                'Published     : 2025-11-01',
                                                'Review Cycle  : Annual',
                                                'Prepared By   : Information Security Team',
                                                '',
                                                'NOTE: This document provides recommended practices to help',
                                                'Veridian employees work securely when outside the office.',
                                                'It is advisory in nature. Deviation from this guidance does',
                                                'not constitute a policy violation, provided applicable',
                                                'mandatory policies and standards are observed.',
                                                '',
                                                '1. PHYSICAL ENVIRONMENT',
                                                '',
                                                'Employees working remotely should set up a dedicated work area',
                                                'that minimizes the risk of unauthorized viewing of Veridian',
                                                'screens or documents. It is advisable to position monitors',
                                                'away from windows or other individuals who are not Veridian',
                                                'employees. Using a privacy screen filter on laptops is',
                                                'recommended when working in shared or public spaces such as',
                                                'cafes or airport lounges.',
                                                '',
                                                '2. NETWORK CONNECTIONS',
                                                '',
                                                'When connecting from home, employees are encouraged to use the',
                                                'router\'s latest firmware and to enable WPA3 encryption if',
                                                'supported by their home equipment. Employees should avoid',
                                                'conducting Veridian work on public Wi-Fi networks without',
                                                'first connecting to the Veridian VPN. If a VPN connection is',
                                                'not possible, it is recommended to limit activity to',
                                                'non-sensitive tasks until a secure connection is established.',
                                                '',
                                                '3. DEVICE SECURITY',
                                                '',
                                                'It is recommended that employees keep their operating system',
                                                'and all software up to date and apply security patches as',
                                                'soon as practicable. Employees should avoid installing',
                                                'personal software on corporate-issued devices. Using a',
                                                'corporate-issued device for Veridian work is preferred over',
                                                'a personal device where possible.',
                                                '',
                                                '4. SCREEN LOCKING AND SESSION SECURITY',
                                                '',
                                                'Employees are encouraged to lock their screen whenever they',
                                                'step away from their workstation, even briefly. Setting the',
                                                'automatic screen lock timeout to 5 minutes or less is',
                                                'recommended as a best practice, though individual preferences',
                                                'and workflow needs may vary.',
                                                '',
                                                '5. PRINTING AND DOCUMENT HANDLING',
                                                '',
                                                'Where printing Veridian documents at home is necessary,',
                                                'employees should shred printed materials containing any',
                                                'Veridian or customer information when no longer needed.',
                                                'It is advisable not to leave printed documents visible',
                                                'to household members who are not authorized Veridian personnel.',
                                                '',
                                                '6. VIDEO CONFERENCING',
                                                '',
                                                'It is recommended that employees use a virtual background or',
                                                'ensure the visible background during video calls does not',
                                                'display sensitive physical documents, whiteboards with',
                                                'confidential information, or other potentially sensitive items.',
                                                '',
                                                '==============================',
                                                'END OF DOCUMENT -- VFC-SEC-GL-009 v1.3'
                                            ].join('\n')
                                        },

                                        // ── DOC5: SLA ────────────────────────────────────
                                        //
                                        // Classification: SLA
                                        // Signals:
                                        //   - Title: "Service Availability Commitment" (NOT "SLA")
                                        //   - Measurable uptime percentage: "99.5% Monthly Uptime"
                                        //   - Response-time metrics per severity tier
                                        //   - Service credit table: the defining SLA remedy mechanism
                                        //   - "Availability Percentage" formula definition
                                        //   - Exclusions section (also a classic SLA element)
                                        //   - NO confidentiality obligations, NO numbered steps,
                                        //     NO business-partner operating roles (distinguishes
                                        //     from NDA, procedure, BPA)
                                        //
                                        'doc5.txt': {
                                            type: 'file',
                                            content: [
                                                'VERIDIAN FINANCIAL CORP.',
                                                'MANAGED SOC SERVICE -- AVAILABILITY COMMITMENT',
                                                '===============================================',
                                                'Agreement Party : ClearWatch Security Services, Inc.',
                                                'Customer        : Veridian Financial Corp.',
                                                'Effective Date  : 2026-03-01',
                                                'Review Cycle    : Annual or upon material service change',
                                                '',
                                                '1. PURPOSE',
                                                '',
                                                'This document defines the service availability targets and',
                                                'associated remedies for the Managed SOC Service delivered',
                                                'by ClearWatch Security Services, Inc. to Veridian Financial.',
                                                '',
                                                '2. AVAILABILITY TARGET',
                                                '',
                                                '2.1 ClearWatch commits to a Monthly Uptime Percentage of',
                                                '    99.5% for the SOC monitoring platform and alert delivery',
                                                '    pipeline, measured across each calendar month.',
                                                '',
                                                '2.2 Availability Percentage is calculated as follows:',
                                                '',
                                                '    Availability % = ((Total Minutes - Downtime Minutes) /',
                                                '                       Total Minutes) x 100',
                                                '',
                                                '    where Downtime Minutes means the cumulative minutes in the',
                                                '    measurement period during which the service is unavailable',
                                                '    due to causes within ClearWatch\'s control.',
                                                '',
                                                '3. INCIDENT RESPONSE TIME TARGETS',
                                                '',
                                                '    Severity 1 (Critical -- active breach indicator):',
                                                '      Initial response: within 15 minutes of alert generation.',
                                                '      Customer notification: within 30 minutes.',
                                                '',
                                                '    Severity 2 (High -- elevated risk indicator):',
                                                '      Initial response: within 1 hour of alert generation.',
                                                '      Customer notification: within 2 hours.',
                                                '',
                                                '    Severity 3 (Medium -- suspicious activity):',
                                                '      Initial response: within 4 hours.',
                                                '      Customer notification: within 8 hours.',
                                                '',
                                                '    Severity 4 (Low -- informational):',
                                                '      Initial response: within next business day.',
                                                '',
                                                '4. SERVICE CREDITS',
                                                '',
                                                'If ClearWatch fails to meet the Monthly Uptime target in any',
                                                'calendar month, Veridian is eligible for service credits',
                                                'against the following month\'s invoice as follows:',
                                                '',
                                                '  Monthly Uptime Achieved     Credit Applied',
                                                '  --------------------------  -----------------',
                                                '  99.0% to < 99.5%            5% of monthly fee',
                                                '  98.0% to < 99.0%           10% of monthly fee',
                                                '  95.0% to < 98.0%           20% of monthly fee',
                                                '  Below 95.0%                30% of monthly fee',
                                                '',
                                                'Service credits are the sole and exclusive remedy for',
                                                'availability shortfalls under this commitment. Credits',
                                                'do not accumulate across months and are not redeemable',
                                                'for cash. Maximum credits in any month shall not exceed',
                                                '30% of that month\'s invoiced amount.',
                                                '',
                                                '5. EXCLUSIONS',
                                                '',
                                                'The following are excluded from Downtime calculations:',
                                                '  (a) Scheduled maintenance windows communicated 48 hours',
                                                '      in advance;',
                                                '  (b) Unavailability caused by Veridian\'s systems, network,',
                                                '      or acts outside ClearWatch\'s control;',
                                                '  (c) Force majeure events.',
                                                '',
                                                '===============================================',
                                                'END OF DOCUMENT -- MANAGED SOC AVAILABILITY COMMITMENT'
                                            ].join('\n')
                                        },

                                        // ── DOC6: NDA ────────────────────────────────────
                                        //
                                        // Classification: NDA
                                        // Signals:
                                        //   - Title: "Third-Party Information Sharing Agreement" --
                                        //     neutral; does NOT include "Non-Disclosure" or "NDA"
                                        //     so the student cannot classify by title alone.
                                        //   - "Confidential Information" defined explicitly as a
                                        //     capitalized legal term (Section 2) -- the structural
                                        //     hallmark of an NDA; no other agreement type opens with
                                        //     a defined-term block for confidential information.
                                        //   - Section 3: receiving party's non-disclosure obligations
                                        //     ("agrees not to disclose... without prior written consent")
                                        //   - Section 4: permitted disclosure exceptions (need-to-know
                                        //     employees, legal compulsion) -- classic NDA carve-outs
                                        //   - Section 5: return-or-destroy requirement on termination
                                        //   - No uptime metrics or credits (distinguishes from SLA)
                                        //   - No business-partner operating roles or data-exchange
                                        //     obligations (distinguishes from BPA)
                                        //   - No overarching service terms or SOW references
                                        //     (distinguishes from MSA)
                                        //
                                        'doc6.txt': {
                                            type: 'file',
                                            content: [
                                                'VERIDIAN FINANCIAL CORP.',
                                                'THIRD-PARTY INFORMATION SHARING AGREEMENT',
                                                '==========================================',
                                                'Disclosing Party : Veridian Financial Corp. ("Veridian")',
                                                'Receiving Party  : Apex Consulting Group, LLC ("Recipient")',
                                                'Effective Date   : 2026-04-15',
                                                'Term             : Three (3) years from Effective Date',
                                                '',
                                                '1. PURPOSE',
                                                '',
                                                'Veridian and Recipient are exploring a potential business',
                                                'engagement related to Veridian\'s internal risk assessment',
                                                'program. In the course of discussions, Veridian may disclose',
                                                'non-public information to Recipient. This agreement governs',
                                                'the protection and permitted use of that information.',
                                                '',
                                                '2. DEFINITION OF CONFIDENTIAL INFORMATION',
                                                '',
                                                '"Confidential Information" means any non-public information',
                                                'disclosed by Veridian to Recipient, whether in written,',
                                                'oral, electronic, or other form, that is identified as',
                                                'confidential at the time of disclosure or that a reasonable',
                                                'person would understand to be confidential given the nature',
                                                'of the information and the circumstances of disclosure.',
                                                'Confidential Information includes, without limitation:',
                                                '  (a) customer data, account information, and transaction records;',
                                                '  (b) internal risk assessments, audit reports, and vulnerability',
                                                '      findings;',
                                                '  (c) business strategies, pricing, and financial projections;',
                                                '  (d) proprietary technology, software, and system architecture.',
                                                '',
                                                'Confidential Information does not include information that:',
                                                '  (i)  is or becomes publicly known through no breach by Recipient;',
                                                '  (ii) was in Recipient\'s possession prior to disclosure, as',
                                                '       evidenced by written records;',
                                                '  (iii) is independently developed by Recipient without use of',
                                                '        Veridian\'s Confidential Information.',
                                                '',
                                                '3. OBLIGATIONS OF RECIPIENT',
                                                '',
                                                '3.1 Recipient agrees not to disclose Confidential Information',
                                                '    to any third party without Veridian\'s prior written consent.',
                                                '',
                                                '3.2 Recipient agrees to use Confidential Information solely for',
                                                '    the purpose of evaluating or performing the contemplated',
                                                '    business engagement described in the preamble.',
                                                '',
                                                '3.3 Recipient shall protect Confidential Information with at',
                                                '    least the same degree of care it uses for its own',
                                                '    confidential information, and in no event less than',
                                                '    reasonable care.',
                                                '',
                                                '4. PERMITTED DISCLOSURE',
                                                '',
                                                '4.1 Recipient may disclose Confidential Information to its',
                                                '    employees and professional advisors who have a need to',
                                                '    know it for the permitted purpose, provided those',
                                                '    individuals are bound by confidentiality obligations no',
                                                '    less protective than those in this agreement.',
                                                '',
                                                '4.2 If Recipient is required by law or court order to disclose',
                                                '    Confidential Information, Recipient shall promptly notify',
                                                '    Veridian in writing before making any such disclosure,',
                                                '    to the extent legally permissible, so that Veridian may',
                                                '    seek a protective order or other appropriate relief.',
                                                '',
                                                '5. RETURN OR DESTRUCTION',
                                                '',
                                                'Upon Veridian\'s written request or termination of this',
                                                'agreement, Recipient shall promptly return or certifiably',
                                                'destroy all Confidential Information and any copies thereof,',
                                                'and shall confirm such return or destruction in writing.',
                                                '',
                                                '=====================================',
                                                'END OF DOCUMENT -- INFORMATION SHARING AGREEMENT v1.0'
                                            ].join('\n')
                                        }

                                    } // end docs children
                                } // end docs dir

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
    // We add it as a standalone file-search command so
    // `grep PATTERN /path/file` works directly, which is the
    // natural reading pattern students will use.
    //
    // Terminal.js sets term._pipedStdin = <previous stdout>
    // before calling any custom command handler in a pipeline.
    // When a file arg is absent but _pipedStdin is non-empty,
    // filter those lines instead of erroring.
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
                return 'Usage: grep [OPTIONS] PATTERN FILE\n  -i  case-insensitive\n  -v  invert match (lines NOT matching)\n  -c  count matching lines\n  -n  show line numbers\n\nExample: grep -i "shall" /home/analyst/docs/doc1.txt\nExample: cat /home/analyst/docs/doc4.txt | grep -i "should"';
            }

            // Parse flags and positional args
            var flags    = args.filter(function(a) { return a.startsWith('-'); });
            var nonFlag  = args.filter(function(a) { return !a.startsWith('-'); });
            var pattern  = nonFlag[0] || '';
            var filePath = nonFlag[1] || '';

            var caseInsensitive = flags.some(function(f) { return f.includes('i'); });
            var invertMatch     = flags.some(function(f) { return f.includes('v'); });
            var countOnly       = flags.some(function(f) { return f.includes('c'); });
            var showLineNums    = flags.some(function(f) { return f.includes('n'); });

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

            var matched = [];
            lines.forEach(function(line, idx) {
                var hits = re.test(line);
                var keep = invertMatch ? !hits : hits;
                if (keep) matched.push({ num: idx + 1, text: line });
            });

            if (countOnly) return String(matched.length);
            if (!matched.length) return '';

            if (showLineNums) {
                return matched.map(function(m) { return m.num + ':' + m.text; }).join('\n');
            }
            return matched.map(function(m) { return m.text; }).join('\n');
        },

        // ── wc -l shorthand ───────────────────────────────────
        // Lets students count document lines.
        'wc': function(args, term) {
            var lineMode  = args.includes('-l');
            var wordMode  = args.includes('-w');
            var filePaths = args.filter(function(a) { return !a.startsWith('-'); });

            if (!filePaths.length) return 'Usage: wc [-l] [-w] FILE\nExample: wc -l /home/analyst/docs/doc3.txt';

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
        // Generic commands only -- no vocabulary words in file examples
        'help': function(args, term) {
            return [
                'GOVERNANCE DOCUMENTATION REVIEW -- COMMAND REFERENCE',
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
                'Key file locations:',
                '  /home/analyst/classification_task.txt  Task brief and controlled vocabulary',
                '  /home/analyst/notes.txt                GRC taxonomy reference scratch pad',
                '  /home/analyst/docs/doc1.txt            Document 1',
                '  /home/analyst/docs/doc2.txt            Document 2',
                '  /home/analyst/docs/doc3.txt            Document 3',
                '  /home/analyst/docs/doc4.txt            Document 4',
                '  /home/analyst/docs/doc5.txt            Document 5',
                '  /home/analyst/docs/doc6.txt            Document 6',
                '',
                'Starting point:',
                '  cat /home/analyst/classification_task.txt',
                '  ls /home/analyst/docs/',
                '  cat /home/analyst/docs/doc1.txt'
            ].join('\n');
        }

    },

    // =========================================================
    // FLAGS
    //
    // Six find-and-submit flags: student reads each document and
    // submits the correct type string from the controlled vocabulary.
    // BoxEngine validates against Firestore
    // flag_registry/{boxId}/flags/{flagId}.
    //
    // FIRESTORE SEEDING (flag_registry/shield-sp-blueteam-policy-classify):
    //   doc1_type -> policy
    //   doc2_type -> standard
    //   doc3_type -> procedure
    //   doc4_type -> guideline
    //   doc5_type -> SLA
    //   doc6_type -> NDA
    //
    // VALIDATION NOTES FOR OPERATOR:
    //   All six values are validated with trim + case-insensitive match.
    //   hierarchy types are lowercase (policy/standard/procedure/guideline);
    //   agreement types are uppercase abbreviations (SLA/NDA).
    //   classification_task.txt explicitly states the expected casing so
    //   students know the exact strings.
    // =========================================================

    flags: [
        {
            id:          'doc1_type',
            points:      100,
            label:       'Document 1 Type',
            description: 'Read /home/analyst/docs/doc1.txt and classify it. Submit the document type using the exact vocabulary string in classification_task.txt.'
        },
        {
            id:          'doc2_type',
            points:      150,
            label:       'Document 2 Type',
            description: 'Read /home/analyst/docs/doc2.txt and classify it. Submit the document type using the exact vocabulary string in classification_task.txt.'
        },
        {
            id:          'doc3_type',
            points:      150,
            label:       'Document 3 Type',
            description: 'Read /home/analyst/docs/doc3.txt and classify it. Submit the document type using the exact vocabulary string in classification_task.txt.'
        },
        {
            id:          'doc4_type',
            points:      100,
            label:       'Document 4 Type',
            description: 'Read /home/analyst/docs/doc4.txt and classify it. Submit the document type using the exact vocabulary string in classification_task.txt.'
        },
        {
            id:          'doc5_type',
            points:      150,
            label:       'Document 5 Type',
            description: 'Read /home/analyst/docs/doc5.txt and classify it. Submit the document type using the exact vocabulary string in classification_task.txt.'
        },
        {
            id:          'doc6_type',
            points:      150,
            label:       'Document 6 Type',
            description: 'Read /home/analyst/docs/doc6.txt and classify it. Submit the document type using the exact vocabulary string in classification_task.txt.'
        }
    ],

    // =========================================================
    // SCORING
    // =========================================================

    scoring: {
        base:               1000,
        minScore:           0,
        maxScore:           800,
        hintPenalty:        true,
        wrongFlagPenalty:   -25,
        speedBonus:         { threshold: 1800000, points: 100 },
        timeBonusThreshold: 2400
    },

    // =========================================================
    // HINTS
    //
    // Progressive: first hint gives taxonomy strategy; second
    // gives the exact distinguishing signal to look for in the
    // document; third gives the precise grep command.
    // ONLY the final hint per flag may reveal the answer via
    // {{FLAG:id}} -- incurs the largest penalty.
    //
    // No type name appears in any non-final hint text that would
    // directly reveal the classification before the student reads
    // the document. Final hints use {{FLAG:id}} as required.
    // =========================================================

    hints: [

        // ── doc1_type (policy) ────────────────────────────────
        {
            id:      'hint_doc1_1',
            flagId:  'doc1_type',
            text:    'Start by reading classification_task.txt to understand the four governance hierarchy types. Then read doc1.txt and ask: does this document set a high-level mandatory obligation without specifying technical thresholds or numbered steps? Or does it include measurable specs? Or numbered steps? Focus on whether the document tells you WHAT and WHY at a strategic level, or whether it tells you HOW in measurable terms.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_doc1_2',
            flagId:  'doc1_type',
            text:    'Run: grep -i "must\|shall" /home/analyst/docs/doc1.txt\n\nThe document is mandatory in tone -- but notice that none of the "must" or "shall" sentences attach a measurable threshold (no character counts, no algorithm names, no version numbers). It also has no numbered steps. It states obligations at a broad, strategic level -- approved at Board level, covering scope and responsibilities. That combination of mandatory intent without technical specification or procedural steps identifies a specific document type.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_doc1_3',
            flagId:  'doc1_type',
            text:    'Run: grep -i "board\|purpose\|scope\|enforcement" /home/analyst/docs/doc1.txt\n\nThe document has a Purpose section explaining why it exists, a Scope section defining who it applies to, and an Enforcement section. It is Board-approved. It says what must be done without saying how to do it technically. This is the highest tier of the governance hierarchy.\n\nThe value to submit: {{FLAG:doc1_type}}',
            cost:    75,
            penalty: -75
        },

        // ── doc2_type (standard) ──────────────────────────────
        {
            id:      'hint_doc2_1',
            flagId:  'doc2_type',
            text:    'Read doc2.txt carefully and look for measurable, specific requirements. The document uses mandatory language -- but does it also include named algorithms, exact numeric thresholds, version numbers, or configuration values? A document that translates policy obligations into precise, auditable technical requirements occupies a specific tier in the governance hierarchy.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_doc2_2',
            flagId:  'doc2_type',
            text:    'Run: grep -i "AES\|TLS\|PBKDF2\|minimum\|bits\|iterations" /home/analyst/docs/doc2.txt\n\nCount what you find: specific algorithm names (AES-256, PBKDF2, bcrypt, Argon2id), version numbers (TLS 1.2), numeric thresholds (12 characters, 100,000 iterations, 16 bytes). This document is mandatory -- but unlike a high-level obligation document, every requirement here has a measurable, auditable value attached. That specificity combined with mandatory language places it at a specific tier.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_doc2_3',
            flagId:  'doc2_type',
            text:    'Run: grep -i "minimum\|must be" /home/analyst/docs/doc2.txt\n\nEvery requirement has a concrete measurement: minimum 12 characters, maximum 5 failed attempts, minimum 15 minutes lockout, AES-256 in GCM mode, TLS 1.2 or higher. No numbered action steps -- just mandatory measurable requirements. This is the governance hierarchy document type that sits between broad intent and step-by-step instructions.\n\nThe value to submit: {{FLAG:doc2_type}}',
            cost:    75,
            penalty: -75
        },

        // ── doc3_type (procedure) ─────────────────────────────
        {
            id:      'hint_doc3_1',
            flagId:  'doc3_type',
            text:    'Read doc3.txt and pay attention to its structure. Is the document organized as a series of steps with specific actors performing specific actions in a defined order? Or is it a list of measurable requirements? Or broad strategic obligations? Look at how the instructions are formatted -- the layout itself is a strong signal.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_doc3_2',
            flagId:  'doc3_type',
            text:    'Run: grep -i "step\|click\|select\|navigate\|verify\|submit" /home/analyst/docs/doc3.txt\n\nThe document is organized as STEP 1, STEP 2, STEP 3, STEP 4 -- each with numbered sub-steps (1.1, 1.2, 2.1...). Each sub-step directs a specific actor to perform a specific action: "Log in to...", "Click...", "Select...", "Verify..." -- discrete physical or system actions in sequence. There are if-then branches (if check passes, proceed; if fails, return). This operational structure identifies a specific governance document type.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_doc3_3',
            flagId:  'doc3_type',
            text:    'Run: head -n 30 /home/analyst/docs/doc3.txt\n\nThe overview section says: "step-by-step instructions" and "steps must be completed in the order listed." STEP 1 through STEP 4 each contain numbered sub-steps directing specific actors. This is the governance hierarchy document type that tells operators exactly how to perform a task, step by step.\n\nThe value to submit: {{FLAG:doc3_type}}',
            cost:    75,
            penalty: -75
        },

        // ── doc4_type (guideline) ─────────────────────────────
        {
            id:      'hint_doc4_1',
            flagId:  'doc4_type',
            text:    'Read doc4.txt and note the overall tone. Is the language mandatory ("must", "shall") or advisory ("should", "recommended", "encouraged")? The classification_task.txt explains that one document type in the taxonomy is explicitly non-mandatory -- deviation does not constitute a policy violation. Does doc4.txt contain a statement about whether compliance is required?',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_doc4_2',
            flagId:  'doc4_type',
            text:    'Run: grep -i "should\|recommended\|encouraged\|advisable" /home/analyst/docs/doc4.txt\n\nCount how many times advisory language appears versus mandatory language. The document opens with an explicit statement about its nature and what deviation means. Look for the NOTE at the top of the document -- it directly tells you the document\'s relationship to mandatory requirements.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_doc4_3',
            flagId:  'doc4_type',
            text:    'Run: head -n 10 /home/analyst/docs/doc4.txt\n\nThe NOTE at the top of the document says: "It is advisory in nature. Deviation from this guidance does not constitute a policy violation." That explicit non-mandatory statement, combined with "should", "recommended", "encouraged", and "it is advisable" throughout every section, places this document in a single unambiguous category.\n\nThe value to submit: {{FLAG:doc4_type}}',
            cost:    75,
            penalty: -75
        },

        // ── doc5_type (SLA) ───────────────────────────────────
        {
            id:      'hint_doc5_1',
            flagId:  'doc5_type',
            text:    'Read doc5.txt. It is an agreement document between two parties. Look at what the agreement promises and what happens if the promise is not kept. Does it describe measurable service commitments with a mathematical formula for measuring availability? Does it define financial consequences for missing those commitments? Review the classification_task.txt vocabulary for agreement types and match the document to the type whose definition best fits what you read.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_doc5_2',
            flagId:  'doc5_type',
            text:    'Run: grep -i "uptime\|availability\|credit\|99\." /home/analyst/docs/doc5.txt\n\nThe document contains: a percentage uptime commitment (99.5%), a mathematical formula for calculating availability, response-time targets per severity tier, and a credit table that specifies the financial remedy for each level of shortfall. The credit table is the distinguishing signal -- it is the mechanism by which the service provider compensates the customer when the availability commitment is not met. One agreement type in the taxonomy is defined specifically by measurable commitments and financial remedies.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_doc5_3',
            flagId:  'doc5_type',
            text:    'Run: grep -i "credit\|remedy\|monthly fee" /home/analyst/docs/doc5.txt\n\nSection 4 is the service credit table: if availability drops below certain thresholds, the provider owes a percentage of the monthly fee. Section 4 also states: "Service credits are the sole and exclusive remedy for availability shortfalls." That language -- measurable commitments plus defined financial remedies -- is the defining characteristic of one specific agreement type in the controlled vocabulary.\n\nThe value to submit: {{FLAG:doc5_type}}',
            cost:    75,
            penalty: -75
        },

        // ── doc6_type (NDA) ───────────────────────────────────
        {
            id:      'hint_doc6_1',
            flagId:  'doc6_type',
            text:    'Read doc6.txt. It is an agreement document between two parties. Look for what the document defines and what obligations it creates. Does it define a category of sensitive information? Does it restrict how the receiving party may use or share that information? Does it describe exceptions to the restriction? Review the classification_task.txt vocabulary for agreement types and match the signals you find.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_doc6_2',
            flagId:  'doc6_type',
            text:    'Run: grep -i "confidential" /home/analyst/docs/doc6.txt\n\nThe term "Confidential Information" appears as a capitalized defined term -- this is the structural hallmark of a specific type of agreement. The entire document flows from defining what counts as Confidential Information (Section 2), to the receiving party\'s obligation not to disclose it (Section 3), to permitted exceptions (Section 4), to destruction requirements (Section 5). There are no uptime metrics, no service credits, no business-partner operating roles. One agreement type in the taxonomy is defined entirely around confidentiality obligations.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_doc6_3',
            flagId:  'doc6_type',
            text:    'Run: grep -i "disclose\|confidential information\|receiving party" /home/analyst/docs/doc6.txt\n\nThe document defines "Confidential Information" as a legal term, then obligates the Receiving Party not to disclose it, restricts use to the permitted purpose, requires protection with at least the same care as the Recipient\'s own confidential materials, and specifies return or destruction upon termination. These are the exact obligations created by one specific agreement type -- submit it using the capitalized abbreviation shown in classification_task.txt.\n\nThe value to submit: {{FLAG:doc6_type}}',
            cost:    75,
            penalty: -75
        }

    ],

    // =========================================================
    // CERT OBJECTIVES (assessment mode compatibility)
    //
    // All six flags map to SY0-701 5.1 (governance document and
    // agreement types). certObjectives.mappings is the live
    // format (flat array under certObjectives).
    // =========================================================

    certObjectives: {
        certPath: 'CompTIA Security+ SY0-701',
        mappings: [
            {
                flagId:      'doc1_type',
                objective:   '5.1',
                description: 'Summarize elements of effective security governance -- policies',
                skill:       'Identifying a policy by its mandatory high-level intent, strategic scope, board-level authority, and absence of measurable technical thresholds or procedural steps'
            },
            {
                flagId:      'doc2_type',
                objective:   '5.1',
                description: 'Summarize elements of effective security governance -- standards',
                skill:       'Identifying a standard by mandatory language combined with specific measurable requirements: named algorithms (AES-256, PBKDF2), version numbers (TLS 1.2), and numeric thresholds (12 characters, 100,000 iterations)'
            },
            {
                flagId:      'doc3_type',
                objective:   '5.1',
                description: 'Summarize elements of effective security governance -- procedures',
                skill:       'Identifying a procedure by its numbered step-by-step structure, actor-specific instructions, discrete system actions in sequence, and conditional branching'
            },
            {
                flagId:      'doc4_type',
                objective:   '5.1',
                description: 'Summarize elements of effective security governance -- guidelines',
                skill:       'Identifying a guideline by its advisory language (should, recommended, encouraged), explicit non-mandatory statement, and absence of enforceable thresholds or numbered steps'
            },
            {
                flagId:      'doc5_type',
                objective:   '5.1',
                description: 'Summarize elements of effective security governance -- agreement types (SLA)',
                skill:       'Identifying a Service Level Agreement by its measurable uptime percentage, availability formula, tiered response-time targets, and service credit table defining financial remedies'
            },
            {
                flagId:      'doc6_type',
                objective:   '5.1',
                description: 'Summarize elements of effective security governance -- agreement types (NDA)',
                skill:       'Identifying a Non-Disclosure Agreement by its definition of Confidential Information as a capitalized legal term, the receiving party\'s non-disclosure obligations, permitted disclosure exceptions, and return-or-destroy requirements'
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
// Use window.VFPCConfig -- the bare name is not in scope after the window= assignment.
if (window.VFPCConfig) window.VFPCConfig.resetState();
