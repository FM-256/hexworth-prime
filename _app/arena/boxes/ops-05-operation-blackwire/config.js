/* ============================================================
   CTF ARENA — OPS-05: Operation Blackwire
   Multi-Device APT Investigation | 5 Devices | 12 Flags
   Phase 1: GATEWAY (Flags 1-2) + DATABASE (Flags 8-10)
   ============================================================ */

const BlackwireConfig = {

    /* ═══════════════════════════════════════════════════════
       OPERATION METADATA
       ═══════════════════════════════════════════════════════ */

    id: 'ops-05-operation-blackwire',
    title: 'Operation Blackwire',
    subtitle: 'Multi-Device APT Investigation — Meridian Dynamics',
    difficulty: 'Expert',
    accent: '#10b981',
    storageKey: 'hexworth_ctf_ops05',
    registryId: 'ops-05-operation-blackwire',
    trackerKey: 'ctf_ops05',

    /* ═══════════════════════════════════════════════════════
       SCENARIO DATA (shared across all devices)
       ═══════════════════════════════════════════════════════ */

    _scenario: {
        aptGroup:         'BLACKWIRE',
        targetOrg:        'Meridian Dynamics',
        compromisedIP:    '192.168.10.45',
        c2ServerIP:       '45.77.129.88',
        c2Domain:         'xk7r2m.updates-cdn.xyz',
        c2Port:           443,
        beaconInterval:   180,          // seconds
        certSubject:      'CN=Microsoft Update Service',
        certSerial:       '0x1A2B3C4D',
        certThumbprint:   'a3f7e2d1c4b596830e1f7a2d8c9b3e5f4a6d7c8b9e0f1a2b3c4d5e6f7a8b9c0d',
        phishingIP:       '91.234.56.78',
        encryptionKey:    '4a8f2c1e7b3d9a6f5e0c8d4b2a7f1e3c',
        projectCodename:  'AURORA',
        badgeId:          'MRD-2847',
        badgeEmployee:    'James Chen',
        firmwareTimestamp: '2026-03-14T03:12:00',
        exfilTotal:       2847,
        breachDuration:   47             // days
    },

    /* ═══════════════════════════════════════════════════════
       DEVICES
       ═══════════════════════════════════════════════════════ */

    devices: [
        {
            id: 'gateway',
            name: 'GATEWAY',
            description: 'Corporate perimeter firewall/proxy server',
            flags: ['f1', 'f2'],
            requireFlags: [],
            page: 'gateway.html',
            status: 'active'     // Phase 1
        },
        {
            id: 'database',
            name: 'DATABASE',
            description: 'PostgreSQL database — partially exfiltrated data',
            flags: ['f8', 'f9', 'f10'],
            requireFlags: [],    // Phase 1: available from start (in full game: after f7)
            page: 'database.html',
            status: 'active'     // Phase 1
        },
        {
            id: 'webserver',
            name: 'WEBSERVER',
            description: 'Compromised Node.js/Express corporate website',
            flags: ['f3', 'f4', 'f5'],
            requireFlags: ['f1', 'f2'],
            page: 'webserver.html',
            status: 'phase2'
        },
        {
            id: 'mailserver',
            name: 'MAILSERVER',
            description: 'Exchange-like email server — executive mailbox',
            flags: ['f6', 'f7'],
            requireFlags: ['f3', 'f4', 'f5'],
            page: 'mailserver.html',
            status: 'phase3'
        },
        {
            id: 'iot-panel',
            name: 'IOT-PANEL',
            description: 'SCADA building management dashboard',
            flags: ['f11', 'f12'],
            requireFlags: ['f8', 'f9', 'f10'],
            page: 'iot-panel.html',
            status: 'phase3'
        }
    ],

    /* ═══════════════════════════════════════════════════════
       FLAGS
       ═══════════════════════════════════════════════════════ */

    flags: {
        f1:  { id: 'f1',  name: 'C2 Domain Identification',       device: 'gateway',  points: 100 },
        f2:  { id: 'f2',  name: 'Malicious Certificate Thumbprint', device: 'gateway',  points: 100 },
        f3:  { id: 'f3',  name: 'SQL Injection: Admin Credentials', device: 'webserver', points: 100 },
        f4:  { id: 'f4',  name: 'SSRF: Internal Service Read',     device: 'webserver', points: 100 },
        f5:  { id: 'f5',  name: 'JWT Algorithm Confusion',         device: 'webserver', points: 100 },
        f6:  { id: 'f6',  name: 'Phishing Sender IP',              device: 'mailserver', points: 100 },
        f7:  { id: 'f7',  name: 'C2 Configuration Decode',         device: 'mailserver', points: 100 },
        f8:  { id: 'f8',  name: 'Exfiltration Manifest',           device: 'database',  points: 100 },
        f9:  { id: 'f9',  name: 'Hidden Encryption Key',           device: 'database',  points: 100 },
        f10: { id: 'f10', name: 'Crown Jewels Decryption',         device: 'database',  points: 100 },
        f11: { id: 'f11', name: 'Unauthorized Badge Access',       device: 'iot-panel', points: 100 },
        f12: { id: 'f12', name: 'Rogue Firmware Timestamp',        device: 'iot-panel', points: 100 }
    },

    /* ═══════════════════════════════════════════════════════
       HINTS (-25 pts each)
       ═══════════════════════════════════════════════════════ */

    hints: {
        f1:  'C2 beacons are rhythmic. Humans browse randomly. Find the metronome.',
        f2:  'Real Microsoft certificates are signed by "Microsoft Root Certificate Authority." This one signed itself.',
        f8:  'The attackers were organized. They left a staging area with a manifest, a log, and a queue. Join them.',
        f9:  'Attackers hide things in plain sight. Not all secrets are in tables \u2014 some are in the code that reads them.',
        f10: 'You have the lock (encrypted data) and the key (from Flag 9). PostgreSQL\'s pgcrypto extension is the locksmith.',
        f3:  'The search error tells you exactly how many columns the original query returns. Count them.',
        f4:  'Cloud instances have a special neighbor at 169.254.169.254 that knows all their secrets.',
        f5:  'RS256 uses a public key to verify. HS256 uses a secret to verify. What if the "secret" IS the public key?',
        f6:  'Email headers are a stack. The bottom Received: line is the first hop. Who handed it to ProtonMail?',
        f7:  'A 152 KB "spreadsheet" for a quarterly budget? Real budget files are megabytes. Decode it.',
        f11: 'Who walks into a server room at 2:47 AM? Check their badge against HR. Does their job require server room access at that hour?',
        f12: 'All controllers run the same firmware version. But does the same version always produce the same hash? Compare them.'
    },

    /* ═══════════════════════════════════════════════════════
       SCORING
       ═══════════════════════════════════════════════════════ */

    scoring: {
        base: 0,
        flagPoints: 100,
        hintPenalty: 25,
        wrongFlagPenalty: 10,
        speedThreshold: 5400000,  // 90 minutes
        speedBonus: 50,
        noHintBonus: 200,
        reportBonus: { min: 300, max: 500 }
    },

    /* ═══════════════════════════════════════════════════════
       C2 NARRATIVE SCRIPT
       ═══════════════════════════════════════════════════════ */

    narrative: [
        {
            trigger: 'connect',
            message: 'Welcome, operative. Codename assigned: SHADOW-7.\n\nSITUATION: Defense contractor MERIDIAN DYNAMICS has been compromised. Indicators suggest APT group BLACKWIRE \u2014 nation-state, persistent, sophisticated. They\'ve been inside for an estimated 47 days.\n\nYour mission: trace the attack chain, recover evidence, identify what was stolen. You have access to 2 systems in this phase. Start with the perimeter gateway \u2014 that\'s where the first breadcrumbs are.\n\nGATEWAY terminal is now active. Good hunting.'
        },
        {
            trigger: 'flag',
            flagId: 'f1',
            delay: 1000,
            message: 'Confirmed. C2 domain identified. NSA database shows this domain registered 48 days ago through a privacy proxy in Moldova. Consistent with BLACKWIRE infrastructure patterns.\n\nThe destination IP resolves to 45.77.129.88. Check the TLS connection logs for that IP \u2014 their implant uses a distinctive certificate.'
        },
        {
            trigger: 'flag',
            flagId: 'f2',
            delay: 1000,
            message: 'Certificate thumbprint logged. Cross-referencing with known BLACKWIRE TLS fingerprints... MATCH. This is their standard implant beacon certificate.\n\nGood work on the GATEWAY. The perimeter analysis is complete.\n\nDATABASE terminal is standing by \u2014 we recovered credentials from the C2 config. The attackers staged data for exfiltration. Find out what they took.'
        },
        {
            trigger: 'flag',
            flagId: 'f8',
            delay: 1000,
            message: 'Exfiltration manifest reconstructed. That is a significant volume of data. The staging tables show methodical extraction \u2014 this was not smash-and-grab. BLACKWIRE operated with surgical precision.\n\nThere may be more hidden in the database. Look beyond the tables \u2014 stored procedures, functions, anything that could conceal tools or keys.'
        },
        {
            trigger: 'flag',
            flagId: 'f9',
            delay: 1000,
            message: 'Encryption key recovered from the stored procedure. Clever \u2014 they hid it in a maintenance function comment. Even a DBA would glance past it.\n\nIntel suggests there is an encrypted blob in the projects schema. Use the key to decrypt it. Whatever BLACKWIRE encrypted this carefully \u2014 that is what they came for.'
        },
        {
            trigger: 'flag',
            flagId: 'f10',
            delay: 2000,
            message: 'Project AURORA. Satellite communication protocols.\n\nThis is a Tier 1 national security asset. BLACKWIRE now has the specifications for our defense satellite network.\n\nPhase 1 investigation complete. All available evidence has been recovered. Prepare your incident response report.\n\nSubmit via /report when ready.\n\nYour handler signing off. Outstanding work, operative.'
        },
        {
            trigger: 'intel',
            id: 'intel-1',
            time: 600000,   // 10 minutes
            message: 'Passive DNS data shows xk7r2m.updates-cdn.xyz resolved to 3 different IPs in the past 30 days. BLACKWIRE rotates infrastructure regularly. The current active IP is the one in the TLS logs.'
        },
        {
            trigger: 'intel',
            id: 'intel-2',
            time: 1800000,  // 30 minutes
            message: 'SIGINT intercept: BLACKWIRE operators were observed on dark web forums discussing "Project M" \u2014 likely codename for the Meridian Dynamics operation. They mentioned a "cleanup script" \u2014 they may attempt to wipe evidence.'
        },
        {
            trigger: 'pressure',
            message: 'WARNING: Counter-intelligence reports BLACKWIRE is aware of the investigation. Evidence destruction in progress. Some log entries on GATEWAY may be overwritten. Work quickly \u2014 recover what you can before it is gone.\n\n[NOTE: Flags remain solvable. Alternate evidence paths available.]'
        }
    ],

    /* ═══════════════════════════════════════════════════════
       LORE
       ═══════════════════════════════════════════════════════ */

    lore: {
        intro: 'Meridian Dynamics \u2014 a Tier 1 defense contractor responsible for satellite communication systems, encrypted field radios, and GPS augmentation for special operations forces \u2014 reported anomalous network activity 6 hours ago. Initial triage by their internal SOC revealed indicators consistent with APT group BLACKWIRE, a nation-state actor known for targeting defense industrial base (DIB) organizations.',
        scenario: 'Your team has been embedded as the external incident response unit. You have forensic access to 5 systems across the Meridian Dynamics network. Your mission is to trace the complete attack chain, recover all evidence, and determine what was stolen. The clock is ticking \u2014 BLACKWIRE may be cleaning their tracks.',
        objectives: [
            'Identify the C2 communication channel on the GATEWAY',
            'Analyze the compromised web server for initial access vectors',
            'Examine executive email for phishing artifacts',
            'Reconstruct the exfiltration manifest from the DATABASE',
            'Correlate physical access with digital intrusion via IoT systems'
        ]
    },

    /* ═══════════════════════════════════════════════════════
       CERT OBJECTIVES (CySA+, PenTest+)
       ═══════════════════════════════════════════════════════ */

    certObjectives: {
        certPath: 'CS0-003',
        mappings: [
            { flagId: 'f1',  objective: '1.3', description: 'Analyze indicators of compromise', skill: 'DNS log analysis' },
            { flagId: 'f2',  objective: '1.3', description: 'Analyze indicators of compromise', skill: 'TLS certificate analysis' },
            { flagId: 'f8',  objective: '2.4', description: 'Analyze data as part of forensic investigation', skill: 'SQL data reconstruction' },
            { flagId: 'f9',  objective: '2.4', description: 'Analyze data as part of forensic investigation', skill: 'Code review for hidden artifacts' },
            { flagId: 'f10', objective: '2.4', description: 'Analyze data as part of forensic investigation', skill: 'Cryptographic artifact recovery' }
        ]
    },

    /* ═══════════════════════════════════════════════════════
       MITRE ATT&CK MAPPING
       ═══════════════════════════════════════════════════════ */

    mitre: {
        f1:  { tactic: 'Command and Control',  technique: 'T1071.001', name: 'Application Layer Protocol: Web' },
        f2:  { tactic: 'Command and Control',  technique: 'T1573.002', name: 'Encrypted Channel: Asymmetric Cryptography' },
        f8:  { tactic: 'Collection',           technique: 'T1074.002', name: 'Data Staged: Remote Data Staging' },
        f9:  { tactic: 'Defense Evasion',      technique: 'T1027',     name: 'Obfuscated Files or Information' },
        f10: { tactic: 'Exfiltration',         technique: 'T1041',     name: 'Exfiltration Over C2 Channel' }
    }
};
