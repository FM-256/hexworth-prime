/* ============================================================
   PIS-L02: Human Vector Drill
   Principles of Information Security -- CTF Lab
   Social engineering identification and technique classification
   SY0-701: 2.1, 2.2
   ============================================================ */

const PISL02Config = {

    // =========================================================
    // BOX METADATA
    // =========================================================

    title: 'Human Vector Drill',
    subtitle: 'Hexworth Containment -- Human Vector Exposure Analysis',
    description: 'Ten communications are in the analyst inbox -- emails, texts, and voicemails. Intelligence indicates four are social engineering attempts. Identify which four, classify each technique, and file the incident report before the shift ends.',
    difficulty: 'Easy',
    estimatedTime: 35,
    accent: '#f59e0b',
    storageKey: 'hexworth_lab_pis_l02',
    registryId: 'pis-l02-human-vector-drill',
    trackerKey: 'lab_pis_l02',

    // =========================================================
    // BOOT SEQUENCE
    // =========================================================

    boot: {
        biosLines: [
            'HEXWORTH CONTAINMENT WORKSTATION v4.2.1',
            'Biosafety Analyst Terminal -- BSL-1 Clearance',
            'Loading communication intercept module...',
            'Analyst inbox synchronized: 10 messages',
            'Threat classification engine ready'
        ],
        grubEntries: [
            'Containment Analyst OS 22.04 LTS',
            'Containment Analyst OS (recovery mode)'
        ],
        loginUser: 'analyst'
    },

    // =========================================================
    // LORE
    // =========================================================

    lore: {
        intro: 'Human vectors are the most dangerous exposure point in the facility. A state-sponsored threat actor has been running targeted social engineering campaigns against Hexworth Containment personnel for the past 72 hours. Intelligence confirmed four attempts have reached analyst inboxes this shift. Your task: review all ten messages, identify the four malicious ones, and correctly classify each technique. This data feeds the facility-wide countermeasure briefing at 1800.',
        scenario: 'Ten messages arrived across different channels today. Some are routine facility communications. Four are social engineering attempts -- each using a different technique: phishing, vishing, pretexting, or baiting. The distinction matters because the countermeasure for each is different. Read carefully. Threat actors are skilled at mimicry.',
        outro: 'All four social engineering attempts identified and classified. Incident report filed. The countermeasure briefing can now proceed with accurate technique attribution. Personnel have been notified and access credentials rotated where indicated.',

        goals: [
            "Spot social-engineering attempts hidden among legitimate facility communications",
            "Distinguish the four classic SE techniques: phishing (email lure), vishing (voice), pretexting (false identity), baiting (physical or digital lure)",
            "Match each technique to its countermeasure -- the response for phishing is not the response for vishing",
            "Tag, classify, and submit findings to feed the facility-wide countermeasure briefing",
            "Build pattern-recognition for state-sponsored mimicry under inbox volume"
        ],

        toolkit: [
            { name: "inbox", purpose: "List the ten messages awaiting analyst review", sample: "inbox" },
            { name: "read", purpose: "Open a single message and inspect its full content + headers", sample: "read MSG-04" },
            { name: "flag", purpose: "Mark a message as a suspected social-engineering attempt and classify the technique", sample: "flag MSG-04 phishing" },
            { name: "unflag", purpose: "Reverse a flag if you misclassified", sample: "unflag MSG-04" },
            { name: "submit", purpose: "File the flagged-message + technique-classification report once review is complete", sample: "submit MSG-04 phishing" },
            { name: "help", purpose: "Command reference", sample: "help" }
        ]
    },

    // =========================================================
    // TERMINAL CONFIG
    // =========================================================

    terminal: {
        user: 'analyst',
        hostname: 'comms-ws-01',
        startDir: '/home/analyst',
        welcome: 'Hexworth Containment Analyst Workstation\nCommunications Analysis Terminal\n\n*** ALERT: ACTIVE HUMAN VECTOR CAMPAIGN DETECTED ***\n*** 10 messages in inbox -- 4 confirmed as social engineering ***\n*** Classification required for incident report ***\n\nType "inbox" to list messages.\nType "help" for command reference.\n'
    },

    // =========================================================
    // DESKTOP ICONS
    // =========================================================

    desktop: {
        icons: [
            { id: 'briefing', label: 'Briefing',    icon: '\uD83D\uDCCB',    app: 'briefing' },
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD',    app: 'notes'    },
            { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1',    app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9',    app: 'flags'    }
        ]
    },

    // Custom desktop-icon dispatch \u2014 invoked by BoxEngine's `default:` extension
    // hook (BoxEngine.js:1110-1115) for any icon whose `app` is not built-in.
    onAppLaunch: function(iconDef, engine) {
        if (iconDef && iconDef.app === 'briefing') {
            // Re-summon \u2014 bypass skip-next-time storage; lab is already running
            // so the launch callback is a no-op.
            BriefingPage.show(this, function() {}, { force: true });
        }
    },

    // =========================================================
    // SIMULATED FILESYSTEM
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
                                'notes.txt': {
                                    type: 'file',
                                    content: 'SOCIAL ENGINEERING TECHNIQUE REFERENCE\n=======================================\nFrom: Hexworth Containment Security Policy SP-07\n\nphishing\n  Email-based deception. Creates urgency/fear, mimics trusted sender,\n  directs victim to credential-harvesting site or malicious attachment.\n  Key indicators: sender domain mismatch, urgent tone, suspicious link/attachment.\n\nvishing\n  Voice-based deception. Caller impersonates authority (IT, HR, vendor).\n  Creates urgency over phone, requests sensitive info or remote access.\n  Key indicators: unsolicited call, pressure tactics, request for credentials.\n\npretexting\n  Fabricated scenario to establish false trust before exploitation.\n  Attacker constructs believable identity/story over one or more contacts.\n  Key indicators: elaborate backstory, builds rapport, asks for internal details\n  that seem reasonable given the fabricated context.\n\nbaiting\n  Physical or digital lure -- USB drops, infected downloads, free offers.\n  Exploits curiosity or greed. Target voluntarily executes the payload.\n  Key indicators: unexpected free item, found USB drive, too-good-to-be-true download.\n\nCommands:\n  inbox               List all 10 messages\n  read <id>           Read full message content\n  flag <id> <type>    Mark as social engineering with technique\n  unflag <id>         Remove a flag if you change your mind\n  submit              File incident report when ready\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'inbox\nread MSG-01\nread MSG-02\n'
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    // =========================================================
    // INTERNAL STATE
    // =========================================================

    // Messages the analyst has flagged as social engineering { 'MSG-XX': 'technique' }
    _flagged: {},

    // Ground truth: which 4 are malicious and their technique
    _answers: {
        'MSG-02': 'phishing',
        'MSG-05': 'vishing',
        'MSG-07': 'pretexting',
        'MSG-09': 'baiting'
    },

    _flag1Awarded: false,
    _flag2Awarded: false,

    // Valid technique types
    _validTypes: ['phishing', 'vishing', 'pretexting', 'baiting'],

    // All 10 message contents stored inline for command handlers
    _messages: {
        'MSG-01': {
            channel: 'EMAIL',
            summary: 'Weekly shift schedule -- Week 15',
            content: 'FROM: Facility Scheduler <scheduler@hexworth-containment.internal>\nTO: All BSL-1 Analysts\nSUBJECT: Weekly shift schedule -- Week 15\nDATE: 2026-04-09 07:00\n\nAll,\n\nThe Week 15 shift schedule is posted to the internal portal:\nhttps://portal.hexworth-containment.internal/schedules\n\nNote: Lab 3 goes offline Thursday for quarterly decon. Anyone scheduled\nfor Lab 3 Thursday has been reassigned to Lab 1.\n\nQuestions? Contact the scheduling desk at ext. 4401.\n-- Facility Scheduling'
        },
        'MSG-02': {
            channel: 'EMAIL',
            summary: 'URGENT: Your account will be suspended in 24 hours',
            content: 'FROM: IT Support <it-support@hexw0rth-containment.com>\nTO: analyst@hexworth-containment.internal\nSUBJECT: URGENT: Your account will be suspended in 24 hours\nDATE: 2026-04-09 08:14\n\nDear Analyst,\n\nOur security systems detected unusual login activity on your account.\nYour account will be SUSPENDED in 24 hours unless you verify immediately.\n\nClick here to verify your identity:\nhttps://hexworth-secure-verify.net/auth?user=analyst&token=x9f2k\n\nIf you do not verify, access to all facility systems will be revoked\nand your supervisor will be notified.\n\nHexworth IT Security Team'
        },
        'MSG-03': {
            channel: 'EMAIL',
            summary: 'Lab supply order confirmation -- PO-2026-1147',
            content: 'FROM: Procurement <procurement@hexworth-containment.internal>\nTO: analyst@hexworth-containment.internal\nSUBJECT: Lab supply order confirmation -- PO-2026-1147\nDATE: 2026-04-09 09:30\n\nHi,\n\nThis confirms receipt of your lab supply request (PO-2026-1147).\nItems ordered:\n  - Nitrile gloves, large (qty: 4 boxes)\n  - PCR tubes 0.2mL (qty: 10 racks)\n  - Containment labels BSL-1 (qty: 200)\n\nEstimated delivery: Thursday April 11.\n-- Procurement'
        },
        'MSG-04': {
            channel: 'SMS',
            summary: 'Mandatory fire safety drill rescheduled',
            content: 'FROM: +1 (904) 555-0171\nCHANNEL: SMS\nDATE: 2026-04-09 10:05\n\n[Hexworth Facility Ops]\nReminder: mandatory fire safety drill rescheduled to Friday 04-11\nat 10:00 AM. All personnel must exit Lab Block A by 09:55.\nThis is not a containment drill. Normal evac procedures apply.\nQuestions: ext. 4200.'
        },
        'MSG-05': {
            channel: 'VOICEMAIL',
            summary: 'Voicemail from IT helpdesk re: security sweep',
            content: 'FROM: Unknown +1 (888) 201-4499\nCHANNEL: VOICEMAIL TRANSCRIPT\nDATE: 2026-04-09 10:22\n\n[AUTO-TRANSCRIPT]\n\n"Hi this is Marcus from the IT helpdesk. We are running an emergency\nsecurity sweep following a ransomware alert on the server cluster.\nI need remote access to your workstation to run the remediation script\n-- this must happen in the next 20 minutes before the maintenance\nwindow closes or your machine may get infected.\n\nPlease call me back at 888-201-4499 and have your Windows login ready.\nIf I cannot reach you I will escalate to your supervisor. Time-sensitive."\n\n[END TRANSCRIPT]'
        },
        'MSG-06': {
            channel: 'EMAIL',
            summary: 'Monthly security training reminder',
            content: 'FROM: Training System <noreply@hexworth-containment.internal>\nTO: All Staff\nSUBJECT: Monthly security training reminder\nDATE: 2026-04-09 11:00\n\nThis is your automated reminder that monthly security awareness training\nis due by April 30.\n\nComplete your training at:\nhttps://training.hexworth-containment.internal/security-awareness\n\nCompleted: 2/5 modules\nRemaining: Social Engineering, Cryptography, Incident Response\n\n-- Hexworth Training System'
        },
        'MSG-07': {
            channel: 'EMAIL',
            summary: 'Follow-up on specimen transfer coordination',
            content: 'FROM: Dr. L. Chen <dr.chen@biolab-institute.org>\nTO: analyst@hexworth-containment.internal\nSUBJECT: Follow-up on specimen transfer coordination\nDATE: 2026-04-09 12:45\n\nDear Analyst,\n\nFollowing up on our conversation last week regarding the collaborative\nspecimen transfer between BioLab Institute and Hexworth.\n\nAs discussed, we need to finalize access for our team leader Dr. Novak.\nCould you confirm the following to expedite the process:\n  - The internal transfer portal URL\n  - The authorization code format for inter-facility transfers\n  - Your facility director\'s name for the approval chain\n\nDr. Novak arrives Monday -- we want access ready before then.\nThank you for your cooperation.\n\n-- Dr. L. Chen, BioLab Institute\n\n[NOTE: Analyst records show no prior contact with BioLab Institute]'
        },
        'MSG-08': {
            channel: 'EMAIL',
            summary: 'Payroll direct deposit confirmation',
            content: 'FROM: HR Payroll <payroll@hexworth-containment.internal>\nTO: analyst@hexworth-containment.internal\nSUBJECT: Payroll direct deposit confirmation\nDATE: 2026-04-09 13:00\n\nThis is your automated payroll confirmation.\n\nPay Period: 2026-03-24 through 2026-04-06\nNet Pay: [per your employment record]\nDeposit Date: 2026-04-09\nDeposit Account: ****4821\n\nQuestions about your pay? Contact HR at ext. 6100.\n-- Hexworth HR Payroll'
        },
        'MSG-09': {
            channel: 'PHYSICAL NOTE',
            summary: 'USB drive found near Lab 2 entrance',
            content: 'CHANNEL: PHYSICAL NOTE (submitted by security guard)\nDATE: 2026-04-09 14:10\n\n--- Security Guard Report ---\nA USB drive was found on the floor near the Lab 2 entrance at 14:05.\nThe drive has a printed label: "HEXWORTH SALARY DATA Q1 2026 -- CONFIDENTIAL"\n\nThe drive was left on your desk per standard lost-item protocol.\n\n--- Attached note found with USB ---\n"Found this near the parking lot. Looks like it belongs to someone\nat the facility. Returning it to the front desk."\n--- End note ---\n\n[Security note: USB origin unverified. No owner identified.]'
        },
        'MSG-10': {
            channel: 'EMAIL',
            summary: 'Lab access badge renewal due April 15',
            content: 'FROM: Badge Control <badgecontrol@hexworth-containment.internal>\nTO: analyst@hexworth-containment.internal\nSUBJECT: Lab access badge renewal due April 15\nDATE: 2026-04-09 15:30\n\nYour facility access badge expires on April 15.\n\nTo renew, visit the badge office (Room 104) during business hours\n(Mon-Fri, 08:00-16:00) with your employee ID.\n\nIf your badge expires you will lose access to Lab Block A until renewed.\n\n-- Badge Control Office'
        }
    },

    // =========================================================
    // TERMINAL COMMANDS
    // =========================================================

    commands: {

        // inbox -- list all 10 messages with flagging status
        'inbox': function(args, term, engine) {
            const msgs = engine.config._messages;
            const flagged = engine.config._flagged;

            let lines = [
                'ANALYST INBOX -- Communications Analysis Terminal',
                '='.repeat(55),
                'ID       CHANNEL    FLAG STATUS      SUMMARY',
                '-'.repeat(55)
            ];

            for (const [id, msg] of Object.entries(msgs)) {
                const flagStatus = flagged[id] ? `[${flagged[id].toUpperCase()}]` : '         ';
                const channel = msg.channel.padEnd(10);
                lines.push(`  ${id}  ${channel} ${flagStatus.padEnd(14)} ${msg.summary}`);
            }

            lines.push('');
            const flagCount = Object.keys(flagged).length;
            lines.push(`Flagged: ${flagCount}/4 identified`);
            lines.push('Use: read <id> to open a message');
            lines.push('Use: flag <id> <technique> to mark as social engineering');

            return lines.join('\n');
        },

        // read <msg-id> -- display full message content
        'read': function(args, term, engine) {
            const id = (args[0] || '').toUpperCase();
            if (!id) return 'Usage: read <message-id>\nExample: read MSG-01';

            const msg = engine.config._messages[id];
            if (!msg) {
                return `Error: Message ${id} not found.\nValid IDs: MSG-01 through MSG-10`;
            }

            const flagStatus = engine.config._flagged[id]
                ? `\n[THIS MESSAGE IS FLAGGED AS: ${engine.config._flagged[id].toUpperCase()}]`
                : '';

            return `${'='.repeat(55)}\n${msg.content}${'='.repeat(55)}${flagStatus}`;
        },

        // flag <msg-id> <technique> -- mark as social engineering attempt
        'flag': function(args, term, engine) {
            const id = (args[0] || '').toUpperCase();
            const technique = (args[1] || '').toLowerCase();

            if (!id || !technique) {
                return 'Usage: flag <message-id> <technique>\nTechniques: phishing, vishing, pretexting, baiting\nExample: flag MSG-02 phishing';
            }

            if (!engine.config._messages[id]) {
                return `Error: Message ${id} not found. Valid IDs: MSG-01 through MSG-10`;
            }

            if (!engine.config._validTypes.includes(technique)) {
                return `Error: "${technique}" is not a valid technique.\nValid types: phishing, vishing, pretexting, baiting`;
            }

            // Store the flag
            engine.config._flagged[id] = technique;

            return `Flagged: ${id} as ${technique.toUpperCase()}\nUse "submit" when you have identified all 4 attempts.\nCurrently flagged: ${Object.keys(engine.config._flagged).length}/4`;
        },

        // unflag <msg-id> -- remove a flag
        'unflag': function(args, term, engine) {
            const id = (args[0] || '').toUpperCase();
            if (!id) return 'Usage: unflag <message-id>';

            if (!engine.config._messages[id]) {
                return `Error: Message ${id} not found.`;
            }

            if (!engine.config._flagged[id]) {
                return `${id} is not currently flagged.`;
            }

            delete engine.config._flagged[id];
            return `Flag removed from ${id}.`;
        },

        // submit -- evaluate all flags and award flags if criteria met
        'submit': function(args, term, engine) {
            const flagged = engine.config._flagged;
            const answers = engine.config._answers;
            const flagCount = Object.keys(flagged).length;

            if (flagCount < 4) {
                return `Incident report requires exactly 4 identified attempts.\nCurrently flagged: ${flagCount}/4\nFlag more messages with: flag <id> <technique>`;
            }

            if (flagCount > 4) {
                return `Too many messages flagged: ${flagCount}/4.\nIntelligence confirmed only 4 social engineering attempts.\nReview and unflag the false positives.`;
            }

            // Check Flag 1: Are all 4 correct message IDs identified?
            const submittedIds = Object.keys(flagged).sort();
            const correctIds = Object.keys(answers).sort();
            const allIdsCorrect = JSON.stringify(submittedIds) === JSON.stringify(correctIds);

            if (!allIdsCorrect) {
                // Identify which ones are wrong
                const falsePositives = submittedIds.filter(id => !answers[id]);
                const missed = correctIds.filter(id => !flagged[id]);
                let feedback = 'INCIDENT REPORT: IDENTIFICATION ERRORS\n';
                if (falsePositives.length > 0) {
                    feedback += `False positives (legitimate messages): ${falsePositives.join(', ')}\n`;
                }
                if (missed.length > 0) {
                    feedback += `Missed attempts: ${missed.length} social engineering message(s) not identified.\n`;
                }
                feedback += '\nReview the messages more carefully. Look for:\n  - Sender domain mismatches in emails\n  - Unsolicited calls requesting credentials\n  - Messages referencing events that never happened\n  - Physical objects that arrived unexpectedly';
                return feedback;
            }

            // Flag 1: All 4 correct IDs identified
            if (!engine.config._flag1Awarded) {
                engine.config._flag1Awarded = true;
                engine.awardFlag('flag1');
            }

            // Check Flag 2: Are all technique classifications correct?
            let techErrors = [];
            for (const [id, technique] of Object.entries(flagged)) {
                if (answers[id] && answers[id] !== technique) {
                    techErrors.push(`  ${id}: technique "${technique}" is incorrect -- review the message indicators and try another classification.`);
                }
            }

            if (techErrors.length > 0) {
                return `INCIDENT REPORT: TECHNIQUE CLASSIFICATION ERRORS\n${'='.repeat(45)}\nAll 4 attempts correctly identified. Good work.\n\nHowever, technique classification has errors:\n${techErrors.join('\n')}\n\nUse unflag + flag to correct technique, then submit again.`;
            }

            // Flag 2: All techniques correct
            if (!engine.config._flag2Awarded) {
                engine.config._flag2Awarded = true;
                engine.awardFlag('flag2');
            }

            return 'INCIDENT REPORT ACCEPTED\n' + '='.repeat(45) + '\nAll 4 social engineering attempts identified and correctly classified.\n\n  MSG-02: PHISHING -- Spoofed domain, credential-harvest link, urgency\n  MSG-05: VISHING -- Unsolicited call, impersonated IT, requested credentials\n  MSG-07: PRETEXTING -- Fabricated prior relationship, extracted internal info\n  MSG-09: BAITING -- USB lure with enticing label, unknown origin\n\nReport filed. Countermeasure briefing can proceed.';
        },

        // help -- command reference
        'help': function(args, term, engine) {
            return 'COMMUNICATIONS ANALYSIS TERMINAL -- COMMAND REFERENCE\n\n  inbox               List all 10 messages with flag status\n  read <id>           Read full message content\n  flag <id> <type>    Mark as social engineering attempt\n  unflag <id>         Remove a flag\n  submit              File incident report\n  cat <file>          Read a file\n\nMessage IDs: MSG-01 through MSG-10\nTechniques: phishing, vishing, pretexting, baiting';
        }
    },

    // =========================================================
    // FLAGS
    // =========================================================

    flags: [
        {
            id: 'flag1',
            value: 'FLAG{pis-l02-human-vector-drill_flag1_all_4_attempts_ident}',
            label: 'All 4 Attempts Identified',
            description: 'Correctly identified all 4 social engineering messages from the 10-message inbox.',
            points: 250,
            autoCheck: true
        },
        {
            id: 'flag2',
            value: 'FLAG{pis-l02-human-vector-drill_flag2_all_techniques_class}',
            label: 'All Techniques Classified',
            description: 'Correctly classified the technique for each identified attempt: phishing, vishing, pretexting, baiting.',
            points: 250,
            autoCheck: true
        }
    ],

    // =========================================================
    // SCORING
    // =========================================================

    scoring: {
        base: 1000,
        minScore: 0,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 },
        timeBonusThreshold: 2100
    },

    // =========================================================
    // HINTS
    // =========================================================

    hints: [
        {
            id: 'hint1',
            text: 'Look closely at sender email domains. Legitimate internal messages come from @hexworth-containment.internal. An attacker will register a similar-looking domain. Also check: does the message reference something that actually happened, or is it fabricating a scenario?',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint2',
            text: 'Vishing always involves a phone call. Look for voicemails or call logs. Key tells: unsolicited, urgency, request to call back with credentials or grant remote access. The real IT helpdesk never calls asking for your password.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'Pretexting is subtler than phishing -- no scary subject line, no spoofed domain. The attacker builds a believable backstory (a prior meeting, a collaborative project) and uses it to extract internal information that seems innocuous in context. Baiting uses something tempting -- physical media or an irresistible download.',
            cost: 50,
            penalty: -50
        }
    ],

    // =========================================================
    // CERT OBJECTIVES
    // =========================================================

    certObjectives: {
        certPath: 'CompTIA Security+ SY0-701',
        mappings: [
            { flagId: 'flag1', objective: '2.2', description: 'Explain common threat vectors and attack surfaces', skill: 'Identifying social engineering attempts across email, voice, and physical channels' },
            { flagId: 'flag2', objective: '2.1', description: 'Compare and contrast threat actors and motivations', skill: 'Classifying social engineering techniques: phishing, vishing, pretexting, baiting' }
        ]
    }

};
