/* ============================================================
   CTF ARENA -- Box F4: The Shifting Sands of Trust
   PKI -- Certificate Trust Chain Manipulation
   Config: PKI hierarchy, certificate analysis, MITM, flags, hints, lore
   ============================================================ */

const F4Config = {

    // -------------------------------------------------------
    // BOX METADATA
    // -------------------------------------------------------

    title: 'The Shifting Sands of Trust',
    subtitle: 'PKI -- Certificate Trust Chain Manipulation',
    difficulty: 'Advanced',
    accent: '#d97706',
    storageKey: 'hexworth_ctf_f4',
    registryId: 'f4-shifting-sands-of-trust',
    trackerKey: 'ctf_f4',

    // -------------------------------------------------------
    // PHASE SYSTEM (Multi-layer attack chain)
    // -------------------------------------------------------

    phases: [
        {
            id: 'recon',
            name: 'Certificate Discovery',
            icon: '\uD83D\uDD0D',
            description: 'Survey the certificate store. Identify every certificate in the PKI hierarchy and map the chain of trust from Root CA down to leaf certificates.',
            requiredFlags: [],
            mitre: ['T1552.004', 'T1596.003'],
            unlocks: ['analysis'],
            locked: false
        },
        {
            id: 'analysis',
            name: 'Chain Analysis',
            icon: '\uD83E\uddEE',
            description: 'Inspect each certificate with openssl. Compare issuers, subjects, serial numbers, and validity periods. One intermediate does not belong.',
            requiredFlags: [],
            mitre: ['T1553.004', 'T1588.004'],
            unlocks: ['exploitation'],
            locked: true
        },
        {
            id: 'exploitation',
            name: 'Trust Exploitation',
            icon: '\uD83D\uDD13',
            description: 'Verify the rogue intermediate against the legitimate Root CA. Prove the signature mismatch and identify the attacker-controlled certificate.',
            requiredFlags: ['user'],
            mitre: ['T1557.002', 'T1553.004'],
            unlocks: ['extraction'],
            locked: true
        },
        {
            id: 'extraction',
            name: 'MITM Proof',
            icon: '\uD83D\uDCC2',
            description: 'Use the rogue intermediate\'s private key to decrypt the intercepted TLS session. Extract the classified plaintext to prove the man-in-the-middle attack.',
            requiredFlags: ['root'],
            mitre: ['T1557.002', 'T1040'],
            unlocks: [],
            locked: true
        }
    ],

    // -------------------------------------------------------
    // TUTORIAL MODE
    // -------------------------------------------------------

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Survey the certificate store',
                tip: 'List the certificates directory: ls /home/analyst/certs/',
                trigger: { event: 'command', match: { cmd: 'contains:certs' } }
            },
            {
                title: 'Inspect a certificate',
                tip: 'Use openssl to read a certificate: openssl x509 -in /home/analyst/certs/root-ca.pem -text',
                trigger: { event: 'command', match: { cmd: 'contains:openssl' } }
            },
            {
                title: 'Verify the trust chain',
                tip: 'Verify a certificate against the CA: openssl verify -CAfile /home/analyst/certs/root-ca.pem /home/analyst/certs/intermediate-alpha.pem',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:verify' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:diff' } }
                    ]
                }
            },
            {
                title: 'Identify the rogue certificate',
                tip: 'One intermediate has a mismatched issuer fingerprint. Find it and submit the user flag.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Decrypt the intercepted traffic',
                tip: 'Use the rogue cert\'s private key with the captured TLS session to prove the MITM attack.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // -------------------------------------------------------
    // CERT OBJECTIVES (Assessment Mode -- SY0-701)
    // -------------------------------------------------------

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with cryptographic attacks -- Rogue certificate identification', skill: 'Certificate Chain Validation' },
            { flagId: 'user', objective: '2.4', description: 'Given a scenario, analyze cryptographic implementations -- PKI trust hierarchy analysis', skill: 'PKI Trust Chain Analysis' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with cryptographic attacks -- Man-in-the-middle via certificate substitution', skill: 'MITM Attack Verification' },
            { flagId: 'root', objective: '3.3', description: 'Given a scenario, implement secure protocols -- TLS certificate pinning and chain verification', skill: 'TLS Session Decryption' }
        ]
    },

    // -------------------------------------------------------
    // BOOT SEQUENCE
    // -------------------------------------------------------

    boot: {
        biosLines: [
            'Hexworth Security Workstation BIOS v7.1.3',
            'Initializing hardware...',
            'Memory Test: 32768 MB OK',
            'Detecting drives... /dev/nvme0n1 (512GB NVMe)',
            'TPM 2.0: Present and enabled',
            'Secure Boot: DISABLED (analyst override)',
            'PXE-M0F: Exiting PXE ROM.',
            'Boot device: /dev/nvme0n1p2',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Ubuntu 22.04 LTS (Security Analyst)',
            'Ubuntu 22.04 LTS (recovery mode)',
            'Advanced options for Ubuntu'
        ],
        loginUser: 'analyst'
    },

    // -------------------------------------------------------
    // DESKTOP ICONS
    // -------------------------------------------------------

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal', icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',  icon: '\uD83C\uDF10', app: 'browser' },
            { id: 'notes',    label: 'Notes',    icon: '\uD83D\uDCDD', app: 'notes' },
            { id: 'hints',    label: 'Hints',    icon: '\uD83D\uDCA1', app: 'hints' },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9', app: 'flags' }
        ]
    },

    // -------------------------------------------------------
    // TERMINAL CONFIG
    // -------------------------------------------------------

    terminal: {
        user: 'analyst',
        hostname: 'sec-ws-04',
        startDir: '/home/analyst',
        welcome: 'Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-91-generic x86_64)\n\nType \'help\' for available commands.\nMission: PKI Trust Chain Analysis\nIncident files in /home/analyst/\nCertificates in ~/certs/  |  Captures in ~/captures/  |  Tools in ~/tools/\n'
    },

    // -------------------------------------------------------
    // PKI HIERARCHY
    //
    // Legitimate chain:
    //   Root CA (Nexus Trust Authority)
    //     -> Intermediate Alpha (legitimate)
    //       -> server cert: portal.nexus-confederacy.mil
    //
    // Rogue chain:
    //   Attacker's shadow root (NOT Nexus Trust Authority)
    //     -> Intermediate Beta (ROGUE -- mimics Alpha's subject but
    //        signed by attacker's root, different serial & fingerprint)
    //       -> server cert: portal.nexus-confederacy.mil (MITM copy)
    //
    // The student must notice Intermediate Beta's issuer fingerprint
    // does not match the Root CA, proving it was injected.
    // -------------------------------------------------------

    _pki: {
        rootCA: {
            subject: 'CN=Nexus Trust Authority, O=Confederacy Central, C=NX',
            serial: 'AA:01:00:00:00:01',
            fingerprint: 'SHA256:9F:3A:C7:11:D4:E8:52:B6:00:1A:FF:9C:22:4D:87:6E',
            notBefore: '2024-01-01',
            notAfter: '2034-01-01',
            keyBits: 4096,
            signatureAlg: 'sha256WithRSAEncryption'
        },
        intermediateAlpha: {
            subject: 'CN=Nexus Intermediate Alpha, O=Confederacy Central, C=NX',
            issuer: 'CN=Nexus Trust Authority, O=Confederacy Central, C=NX',
            serial: 'AA:02:00:00:00:17',
            issuerFingerprint: 'SHA256:9F:3A:C7:11:D4:E8:52:B6:00:1A:FF:9C:22:4D:87:6E',
            fingerprint: 'SHA256:4B:22:8E:F1:7C:A3:90:DD:55:67:01:BC:EE:3F:A8:19',
            notBefore: '2024-06-15',
            notAfter: '2029-06-15',
            keyBits: 2048,
            signatureAlg: 'sha256WithRSAEncryption'
        },
        intermediateBeta: {
            subject: 'CN=Nexus Intermediate Alpha, O=Confederacy Central, C=NX',
            issuer: 'CN=Nexus Trust Authority, O=Confederacy Central, C=NX',
            serial: 'BB:02:00:00:00:42',
            issuerFingerprint: 'SHA256:D1:7F:E3:44:A9:0B:CC:58:93:21:6A:FD:77:B0:15:2E',
            fingerprint: 'SHA256:E6:91:3D:FA:28:C4:55:B7:03:8E:DC:A0:11:69:F2:7B',
            notBefore: '2024-06-15',
            notAfter: '2029-06-15',
            keyBits: 2048,
            signatureAlg: 'sha256WithRSAEncryption',
            rogue: true,
            note: 'Same subject CN as Alpha but different serial, fingerprint, and issuer fingerprint. Signed by attacker shadow root, not Nexus Trust Authority.'
        },
        serverCertLegit: {
            subject: 'CN=portal.nexus-confederacy.mil, O=Confederacy Central, C=NX',
            issuer: 'CN=Nexus Intermediate Alpha, O=Confederacy Central, C=NX',
            serial: 'AA:03:00:00:01:89',
            issuerFingerprint: 'SHA256:4B:22:8E:F1:7C:A3:90:DD:55:67:01:BC:EE:3F:A8:19',
            fingerprint: 'SHA256:7C:05:B2:39:D8:FE:14:A0:66:CC:88:91:EE:57:2D:4A',
            notBefore: '2025-01-10',
            notAfter: '2026-01-10',
            keyBits: 2048,
            san: 'DNS:portal.nexus-confederacy.mil, DNS:*.nexus-confederacy.mil'
        },
        serverCertMITM: {
            subject: 'CN=portal.nexus-confederacy.mil, O=Confederacy Central, C=NX',
            issuer: 'CN=Nexus Intermediate Alpha, O=Confederacy Central, C=NX',
            serial: 'BB:03:00:00:01:C3',
            issuerFingerprint: 'SHA256:E6:91:3D:FA:28:C4:55:B7:03:8E:DC:A0:11:69:F2:7B',
            fingerprint: 'SHA256:A2:F8:16:C0:3B:DD:92:E5:48:77:AA:0F:55:CE:63:81',
            notBefore: '2025-01-10',
            notAfter: '2026-01-10',
            keyBits: 2048,
            san: 'DNS:portal.nexus-confederacy.mil, DNS:*.nexus-confederacy.mil',
            rogue: true
        }
    },

    // -------------------------------------------------------
    // FLAGS
    // -------------------------------------------------------

    flags: [
        { id: 'user', points: 100 },
        { id: 'root', points: 200 }
    ],

    // -------------------------------------------------------
    // SCORING
    // -------------------------------------------------------

    scoring: {
        base: 1000,
        minScore: 0,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 1200000, points: 100 },
        timeBonusThreshold: 2400
    },

    // -------------------------------------------------------
    // HINTS
    // -------------------------------------------------------

    hints: [
        {
            id: 'hint1',
            text: 'Start by listing the certificates in ~/certs/. Use openssl x509 -in <cert> -text to read each one. Pay attention to the Issuer and Subject fields.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'There are two intermediate certificates with the same Subject CN but different serial numbers and fingerprints. One of them was not signed by the real Root CA. Compare their Issuer Key Fingerprints.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Run: openssl verify -CAfile certs/root-ca.pem certs/intermediate-beta.pem -- it will fail because Beta was signed by a shadow root, not the Nexus Trust Authority. The rogue cert is intermediate-beta.pem (serial BB:02:00:00:00:42).',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'The rogue intermediate\'s private key is in ~/captures/rogue-private.key. Use it conceptually: openssl s_client -decrypt -key captures/rogue-private.key -in captures/tls-session.pcap. The decrypted traffic contains the root flag.',
            cost: 75,
            penalty: -75
        }
    ],

    // -------------------------------------------------------
    // LORE
    // -------------------------------------------------------

    lore: {
        intro: 'The Confederacy\'s Consensus Nexus (CON-NEXUS-01) manages critical supply lines using a distributed trust model anchored by a PKI hierarchy. Intelligence detected anomalous TLS certificates being served on the Nexus portal. A rogue certificate authority appears to have been injected into the trust chain, enabling man-in-the-middle interception of classified logistics data. Your mission: analyze the PKI hierarchy, identify the rogue certificate, trace the chain manipulation, and prove the MITM attack by decrypting the intercepted traffic.',
        scenario: 'After the Great Collapse, the Confederacy rebuilt its secure communications around the Nexus Trust Authority -- a meticulously maintained root CA stored in a hardened vault beneath Sector 7. But trust, like sand, shifts. An operative inside the Confederacy\'s PKI team quietly generated a shadow root certificate and used it to sign a fraudulent intermediate -- one bearing the same Common Name as the legitimate Intermediate Alpha. Injected into the trust store of a border relay node, this rogue intermediate enabled silent interception of all traffic to portal.nexus-confederacy.mil. The attack was elegant: the certificates looked identical to casual inspection. Only the fingerprints and serial numbers betrayed the deception.',
        outro: 'The shifting sands have settled. The rogue intermediate -- serial BB:02:00:00:00:42 -- has been identified and revoked. The intercepted traffic has been decrypted, confirming the scope of the breach. The mole within the PKI team is being traced. The lesson: trust is only as strong as the verification of every link in the chain.',
        ecer: {
            executive: 'Confederacy leadership relied on a single trust anchor without implementing certificate transparency logging',
            culture: 'PKI team operated with excessive trust and minimal peer review for certificate issuance',
            employee: 'A rogue insider generated a shadow root and signed a fraudulent intermediate certificate',
            regulatory: 'No certificate transparency (CT) logs required, no automated chain verification audits'
        }
    },

    // -------------------------------------------------------
    // FILESYSTEM (analyst workstation)
    // -------------------------------------------------------

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
                                'README.txt': {
                                    type: 'file',
                                    content: '=== MISSION: THE SHIFTING SANDS OF TRUST ===\n\nINCIDENT BRIEFING:\nAnomalous TLS certificates detected on portal.nexus-confederacy.mil.\nA rogue certificate authority may have been injected into the PKI trust chain.\n\nDIRECTORIES:\n  ~/certs/      Certificate store (Root CA, intermediates, server certs)\n  ~/captures/   Network captures and extracted TLS session data\n  ~/tools/      Verification scripts and reference material\n\nOBJECTIVES:\n  1. [USER FLAG] Identify the rogue certificate in the trust chain.\n     Prove which intermediate was NOT signed by the legitimate Root CA.\n  2. [ROOT FLAG] Decrypt the intercepted TLS traffic using the rogue\n     certificate\'s private key. Extract the classified plaintext.\n\nTOOLS:\n  openssl x509   - Inspect certificate details\n  openssl verify - Verify certificate chain\n  openssl s_client - Simulate TLS connection / decrypt\n  certtool       - Quick certificate summary\n  diff           - Compare certificate fields side by side\n  grep           - Search through certificate output\n\nSTART: ls ~/certs/ to survey the certificate store.'
                                },
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== ANALYST NOTES ===\nDate: 2026-03-25\nCase: NEXUS-2026-0147\n\nTimeline:\n  03-20  Automated monitor flagged duplicate CN in cert store\n  03-21  SOC confirmed two intermediates with same Subject CN\n  03-22  Certificate dump extracted from border relay node\n  03-23  TLS session capture obtained from network tap\n  03-25  Analysis workstation provisioned (this machine)\n\nKey question: Which intermediate is legitimate and which is rogue?\nBoth claim to be "Nexus Intermediate Alpha" but they cannot both\nbe genuine. Check issuer fingerprints against the Root CA.\n\nThe rogue cert would have been signed by a DIFFERENT root --\nan attacker-controlled shadow CA. Its issuer fingerprint\nwill NOT match the Nexus Trust Authority root fingerprint.\n\nRoot CA fingerprint (known good):\n  SHA256:9F:3A:C7:11:D4:E8:52:B6:00:1A:FF:9C:22:4D:87:6E'
                                },
                                'certs': {
                                    type: 'dir',
                                    children: {
                                        'root-ca.pem': {
                                            type: 'file',
                                            content: '-----BEGIN CERTIFICATE-----\nCertificate: Nexus Trust Authority Root CA\nSerial: AA:01:00:00:00:01\nSubject: CN=Nexus Trust Authority, O=Confederacy Central, C=NX\nIssuer: CN=Nexus Trust Authority, O=Confederacy Central, C=NX\nValidity:\n  Not Before: Jan  1 00:00:00 2024 GMT\n  Not After : Jan  1 00:00:00 2034 GMT\nPublic Key Algorithm: rsaEncryption\n  RSA Public-Key: (4096 bit)\nSignature Algorithm: sha256WithRSAEncryption\nX509v3 Basic Constraints: critical\n  CA:TRUE\nX509v3 Key Usage: critical\n  Certificate Sign, CRL Sign\nFingerprint (SHA256):\n  9F:3A:C7:11:D4:E8:52:B6:00:1A:FF:9C:22:4D:87:6E\n-----END CERTIFICATE-----'
                                        },
                                        'intermediate-alpha.pem': {
                                            type: 'file',
                                            content: '-----BEGIN CERTIFICATE-----\nCertificate: Nexus Intermediate CA Alpha\nSerial: AA:02:00:00:00:17\nSubject: CN=Nexus Intermediate Alpha, O=Confederacy Central, C=NX\nIssuer: CN=Nexus Trust Authority, O=Confederacy Central, C=NX\nValidity:\n  Not Before: Jun 15 00:00:00 2024 GMT\n  Not After : Jun 15 00:00:00 2029 GMT\nPublic Key Algorithm: rsaEncryption\n  RSA Public-Key: (2048 bit)\nSignature Algorithm: sha256WithRSAEncryption\nX509v3 Basic Constraints: critical\n  CA:TRUE, pathlen:0\nX509v3 Key Usage: critical\n  Certificate Sign, CRL Sign\nIssuer Key Fingerprint:\n  SHA256:9F:3A:C7:11:D4:E8:52:B6:00:1A:FF:9C:22:4D:87:6E\nFingerprint (SHA256):\n  4B:22:8E:F1:7C:A3:90:DD:55:67:01:BC:EE:3F:A8:19\n-----END CERTIFICATE-----'
                                        },
                                        'intermediate-beta.pem': {
                                            type: 'file',
                                            content: '-----BEGIN CERTIFICATE-----\nCertificate: Nexus Intermediate CA Alpha\nSerial: BB:02:00:00:00:42\nSubject: CN=Nexus Intermediate Alpha, O=Confederacy Central, C=NX\nIssuer: CN=Nexus Trust Authority, O=Confederacy Central, C=NX\nValidity:\n  Not Before: Jun 15 00:00:00 2024 GMT\n  Not After : Jun 15 00:00:00 2029 GMT\nPublic Key Algorithm: rsaEncryption\n  RSA Public-Key: (2048 bit)\nSignature Algorithm: sha256WithRSAEncryption\nX509v3 Basic Constraints: critical\n  CA:TRUE, pathlen:0\nX509v3 Key Usage: critical\n  Certificate Sign, CRL Sign\nIssuer Key Fingerprint:\n  SHA256:D1:7F:E3:44:A9:0B:CC:58:93:21:6A:FD:77:B0:15:2E\nFingerprint (SHA256):\n  E6:91:3D:FA:28:C4:55:B7:03:8E:DC:A0:11:69:F2:7B\n-----END CERTIFICATE-----'
                                        },
                                        'server-portal.pem': {
                                            type: 'file',
                                            content: '-----BEGIN CERTIFICATE-----\nCertificate: portal.nexus-confederacy.mil\nSerial: AA:03:00:00:01:89\nSubject: CN=portal.nexus-confederacy.mil, O=Confederacy Central, C=NX\nIssuer: CN=Nexus Intermediate Alpha, O=Confederacy Central, C=NX\nValidity:\n  Not Before: Jan 10 00:00:00 2025 GMT\n  Not After : Jan 10 00:00:00 2026 GMT\nPublic Key Algorithm: rsaEncryption\n  RSA Public-Key: (2048 bit)\nSignature Algorithm: sha256WithRSAEncryption\nX509v3 Subject Alternative Name:\n  DNS:portal.nexus-confederacy.mil, DNS:*.nexus-confederacy.mil\nIssuer Key Fingerprint:\n  SHA256:4B:22:8E:F1:7C:A3:90:DD:55:67:01:BC:EE:3F:A8:19\nFingerprint (SHA256):\n  7C:05:B2:39:D8:FE:14:A0:66:CC:88:91:EE:57:2D:4A\n-----END CERTIFICATE-----'
                                        },
                                        'server-portal-mitm.pem': {
                                            type: 'file',
                                            content: '-----BEGIN CERTIFICATE-----\nCertificate: portal.nexus-confederacy.mil\nSerial: BB:03:00:00:01:C3\nSubject: CN=portal.nexus-confederacy.mil, O=Confederacy Central, C=NX\nIssuer: CN=Nexus Intermediate Alpha, O=Confederacy Central, C=NX\nValidity:\n  Not Before: Jan 10 00:00:00 2025 GMT\n  Not After : Jan 10 00:00:00 2026 GMT\nPublic Key Algorithm: rsaEncryption\n  RSA Public-Key: (2048 bit)\nSignature Algorithm: sha256WithRSAEncryption\nX509v3 Subject Alternative Name:\n  DNS:portal.nexus-confederacy.mil, DNS:*.nexus-confederacy.mil\nIssuer Key Fingerprint:\n  SHA256:E6:91:3D:FA:28:C4:55:B7:03:8E:DC:A0:11:69:F2:7B\nFingerprint (SHA256):\n  A2:F8:16:C0:3B:DD:92:E5:48:77:AA:0F:55:CE:63:81\n-----END CERTIFICATE-----'
                                        },
                                        'crl-nexus.pem': {
                                            type: 'file',
                                            content: '-----BEGIN X509 CRL-----\nCertificate Revocation List (CRL)\nIssuer: CN=Nexus Trust Authority, O=Confederacy Central, C=NX\nLast Update: Mar  1 00:00:00 2026 GMT\nNext Update: Apr  1 00:00:00 2026 GMT\nSignature Algorithm: sha256WithRSAEncryption\n\nRevoked Certificates:\n  Serial: AA:03:00:00:00:05\n    Revocation Date: Feb 14 2026 (Key Compromise)\n  Serial: AA:03:00:00:00:09\n    Revocation Date: Feb 28 2026 (Superseded)\n\nNOTE: Serial BB:02:00:00:00:42 is NOT on this CRL.\nThe rogue intermediate has not yet been revoked.\n-----END X509 CRL-----'
                                        },
                                        'ocsp-response.txt': {
                                            type: 'file',
                                            content: 'OCSP Response Data:\n  OCSP Response Status: successful (0x0)\n  Response Type: Basic OCSP Response\n  Responder Id: CN=Nexus Trust Authority, O=Confederacy Central, C=NX\n  Produced At: Mar 25 12:00:00 2026 GMT\n\nCertificate Status Queries:\n\n  Serial: AA:02:00:00:00:17 (Intermediate Alpha)\n  Status: good\n  This Update: Mar 25 12:00:00 2026 GMT\n\n  Serial: BB:02:00:00:00:42 (Intermediate Beta)\n  Status: unknown\n  This Update: Mar 25 12:00:00 2026 GMT\n  NOTE: This serial is NOT recognized by the OCSP responder.\n        The legitimate CA has no record of issuing this certificate.\n\n  Serial: AA:03:00:00:01:89 (Server cert - portal)\n  Status: good\n  This Update: Mar 25 12:00:00 2026 GMT'
                                        }
                                    }
                                },
                                'captures': {
                                    type: 'dir',
                                    children: {
                                        'tls-session.pcap': {
                                            type: 'file',
                                            content: '=== TLS SESSION CAPTURE ===\nCapture Source: Border relay node tap (nexus-relay-07)\nTimestamp: 2026-03-22T14:33:17Z\nProtocol: TLSv1.2\n\nFrame 1: ClientHello\n  Client -> portal.nexus-confederacy.mil:443\n  TLS Version: 1.2\n  Cipher Suites: TLS_RSA_WITH_AES_256_CBC_SHA256, ...\n  SNI: portal.nexus-confederacy.mil\n\nFrame 2: ServerHello + Certificate\n  Server -> Client\n  Certificate Chain Presented:\n    [0] CN=portal.nexus-confederacy.mil  (Serial: BB:03:00:00:01:C3)\n    [1] CN=Nexus Intermediate Alpha      (Serial: BB:02:00:00:00:42)\n  Selected Cipher: TLS_RSA_WITH_AES_256_CBC_SHA256\n\n  WARNING: Certificate serial BB:03:00:00:01:C3 does NOT match\n  the known legitimate server cert serial AA:03:00:00:01:89.\n  The intermediate serial BB:02:00:00:00:42 is also anomalous.\n\nFrame 3-47: Application Data (Encrypted)\n  48 application data records\n  Total encrypted payload: 12,847 bytes\n  Encryption: AES-256-CBC\n  Key derived from RSA key exchange using server cert BB:03:00:00:01:C3\n\n=== END CAPTURE ==='
                                        },
                                        'rogue-private.key': {
                                            type: 'file',
                                            content: '-----BEGIN RSA PRIVATE KEY-----\nDescription: Private key for rogue intermediate (BB:02:00:00:00:42)\nExtracted from: compromised relay node nexus-relay-07\nKey Size: 2048 bit\n\n[SIMULATED RSA PRIVATE KEY DATA]\nMIIEpAIBAAKCAQEA7v2Kx9F3mHpD4qW8rTnY1bCsJk0Z5aXvL9uRw2hN\n8gPfQ6dM3yBtA1oI7eS0cUxZmKjNvE4wR5hL2qF9bD3gT0aY6iO8pJ1k\nX7nW4mC5sV0dU2fR3gH8jI9lK0aB1cD2eF3gH4iJ5kL6mN7oP8qR9sT0u\n...\n[KEY TRUNCATED FOR DISPLAY]\n-----END RSA PRIVATE KEY-----\n\nThis key was recovered from the compromised relay node.\nIt corresponds to the rogue intermediate certificate:\n  Serial: BB:02:00:00:00:42\n  Fingerprint: E6:91:3D:FA:28:C4:55:B7:03:8E:DC:A0:11:69:F2:7B'
                                        },
                                        'session-key.bin': {
                                            type: 'file',
                                            content: '[BINARY: TLS session key material -- 256 bits AES-256-CBC]\n[This file can be derived by decrypting the RSA key exchange\n in tls-session.pcap using rogue-private.key]\n\nSession Key (hex): 4a:f8:c2:91:d7:3e:b5:06:88:1c:a4:f0:22:dd:67:9e\n                   53:b1:e7:40:ac:8f:15:d9:36:7b:c0:ea:44:ff:23:68\nIV (hex):          00:11:22:33:44:55:66:77:88:99:aa:bb:cc:dd:ee:ff'
                                        },
                                        'decrypted-traffic.txt': {
                                            type: 'file',
                                            hidden: true,
                                            content: '=== DECRYPTED TLS APPLICATION DATA ===\nSource: portal.nexus-confederacy.mil (MITM intercepted)\n\nHTTP/1.1 200 OK\nContent-Type: application/json\nX-Nexus-Classification: TOP SECRET // CONFEDERACY EYES ONLY\n\n{\n  "operation": "SANDSTORM",\n  "convoy_id": "CVY-2026-0891",\n  "route": "Sector 4 -> Sector 7 via Waypoint Kilo",\n  "cargo_manifest": [\n    "Medical supplies (crate x24)",\n    "Ammunition (crate x12)",\n    "Communication equipment (crate x6)"\n  ],\n  "eta": "2026-03-28T06:00:00Z",\n  "escort": "3rd Mechanized, Bravo Company",\n  "authentication_token": "{{FLAG:root}}"\n}\n\n=== END DECRYPTED DATA ==='
                                        }
                                    }
                                },
                                'tools': {
                                    type: 'dir',
                                    children: {
                                        'verify-chain.sh': {
                                            type: 'file',
                                            content: '#!/bin/bash\n# verify-chain.sh -- Verify a certificate against the Root CA\n# Usage: ./verify-chain.sh <certificate.pem>\n#\n# This script runs:\n#   openssl verify -CAfile ~/certs/root-ca.pem <certificate.pem>\n#\n# A legitimate cert will show: OK\n# A rogue cert will show: verification failed\n#\n# Try running it against both intermediate certificates:\n#   ./verify-chain.sh ~/certs/intermediate-alpha.pem\n#   ./verify-chain.sh ~/certs/intermediate-beta.pem\n\nif [ -z "$1" ]; then\n    echo "Usage: ./verify-chain.sh <certificate.pem>"\n    exit 1\nfi\n\nopenssl verify -CAfile ~/certs/root-ca.pem "$1"'
                                        },
                                        'compare-certs.sh': {
                                            type: 'file',
                                            content: '#!/bin/bash\n# compare-certs.sh -- Side-by-side comparison of two certificates\n# Usage: ./compare-certs.sh <cert1.pem> <cert2.pem>\n#\n# Extracts Subject, Issuer, Serial, and Fingerprint from each\n# certificate and displays them side by side for comparison.\n#\n# Example:\n#   ./compare-certs.sh ~/certs/intermediate-alpha.pem ~/certs/intermediate-beta.pem\n\nif [ -z "$2" ]; then\n    echo "Usage: ./compare-certs.sh <cert1.pem> <cert2.pem>"\n    exit 1\nfi\n\necho "=== Certificate Comparison ==="\necho ""\necho "Cert 1: $1"\nopenssl x509 -in "$1" -noout -subject -issuer -serial -fingerprint\necho ""\necho "Cert 2: $2"\nopenssl x509 -in "$2" -noout -subject -issuer -serial -fingerprint'
                                        },
                                        'pki-reference.txt': {
                                            type: 'file',
                                            content: '=== PKI QUICK REFERENCE ===\n\nCERTIFICATE CHAIN OF TRUST:\n  Root CA (self-signed, trust anchor)\n    -> Intermediate CA (signed by Root)\n      -> End-entity / Server cert (signed by Intermediate)\n\nVERIFICATION CHECKS:\n  1. Subject/Issuer chain: each cert\'s Issuer must match\n     its parent\'s Subject\n  2. Signature verification: the parent\'s public key must\n     validate the child\'s signature\n  3. Issuer Key Fingerprint: must match the parent cert\'s\n     own fingerprint\n  4. Serial numbers: each cert has a unique serial from its CA\n  5. Validity period: cert must be within Not Before / Not After\n  6. CRL / OCSP: cert serial must not be revoked\n\nCOMMON ATTACKS:\n  - Rogue CA injection: attacker adds a fraudulent CA to trust store\n  - Certificate substitution: MITM presents attacker-signed cert\n  - Trust chain manipulation: rogue intermediate mimics legitimate one\n\nKEY openssl COMMANDS:\n  openssl x509 -in cert.pem -text           Full certificate details\n  openssl x509 -in cert.pem -noout -issuer  Show issuer only\n  openssl x509 -in cert.pem -noout -serial  Show serial only\n  openssl verify -CAfile ca.pem cert.pem    Verify chain\n  openssl s_client -connect host:443        Test TLS connection\n  openssl s_client -decrypt -key priv.key -in capture.pcap  Decrypt session'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls\ncat README.txt\nls certs/\nls captures/\nls tools/\ncat tools/pki-reference.txt'
                                }
                            }
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'share': {
                            type: 'dir',
                            children: {
                                'ca-certificates': {
                                    type: 'dir',
                                    children: {
                                        'README': {
                                            type: 'file',
                                            content: 'System CA certificate store.\nTrusted roots are installed in /etc/ssl/certs/\nUse update-ca-certificates to refresh.'
                                        }
                                    }
                                }
                            }
                        },
                        'bin': {
                            type: 'dir',
                            children: {
                                'openssl': { type: 'file', content: '[binary: OpenSSL 3.0.2]' },
                                'certtool': { type: 'file', content: '[binary: GnuTLS certtool 3.7.3]' }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'sec-ws-04' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\nanalyst:x:1000:1000:Security Analyst,,,:/home/analyst:/bin/bash'
                        },
                        'ssl': {
                            type: 'dir',
                            children: {
                                'certs': {
                                    type: 'dir',
                                    children: {
                                        'ca-certificates.crt': {
                                            type: 'file',
                                            content: '# System trusted root certificates\n# Contains 137 trusted root CAs\n# Including: Nexus Trust Authority (SHA256:9F:3A:C7:11...)\n[certificate bundle -- truncated]'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {}
                }
            }
        }
    },

    // -------------------------------------------------------
    // TERMINAL COMMANDS (box-specific tools)
    // -------------------------------------------------------

    commands: {

        'openssl': function(args, term, engine) {
            const joined = args.join(' ');

            // --- openssl x509 -in <file> -text ---
            if (joined.includes('x509')) {
                // Determine which cert file
                const fileMatch = joined.match(/-in\s+([^\s]+)/);
                if (!fileMatch) {
                    return 'Usage: openssl x509 -in <certfile.pem> -text [-noout]\n\nCertificates available:\n  ~/certs/root-ca.pem\n  ~/certs/intermediate-alpha.pem\n  ~/certs/intermediate-beta.pem\n  ~/certs/server-portal.pem\n  ~/certs/server-portal-mitm.pem';
                }

                const filePath = fileMatch[1].toLowerCase();
                const nooSub = joined.includes('-noout') || joined.includes('-subject') || joined.includes('-issuer') || joined.includes('-serial') || joined.includes('-fingerprint');

                // Root CA
                if (filePath.includes('root-ca') || filePath.includes('root_ca')) {
                    if (joined.includes('-subject') || joined.includes('-issuer') || joined.includes('-serial')) {
                        let out = '';
                        if (joined.includes('-subject')) out += 'subject=CN = Nexus Trust Authority, O = Confederacy Central, C = NX\n';
                        if (joined.includes('-issuer'))  out += 'issuer=CN = Nexus Trust Authority, O = Confederacy Central, C = NX\n';
                        if (joined.includes('-serial'))  out += 'serial=AA:01:00:00:00:01\n';
                        if (joined.includes('-fingerprint')) out += 'SHA256 Fingerprint=9F:3A:C7:11:D4:E8:52:B6:00:1A:FF:9C:22:4D:87:6E\n';
                        return out.trim();
                    }
                    return 'Certificate:\n    Data:\n        Version: 3 (0x2)\n        Serial Number: AA:01:00:00:00:01\n        Signature Algorithm: sha256WithRSAEncryption\n        Issuer: CN = Nexus Trust Authority, O = Confederacy Central, C = NX\n        Validity\n            Not Before: Jan  1 00:00:00 2024 GMT\n            Not After : Jan  1 00:00:00 2034 GMT\n        Subject: CN = Nexus Trust Authority, O = Confederacy Central, C = NX\n        Subject Public Key Info:\n            Public Key Algorithm: rsaEncryption\n                RSA Public-Key: (4096 bit)\n        X509v3 extensions:\n            X509v3 Basic Constraints: critical\n                CA:TRUE\n            X509v3 Key Usage: critical\n                Certificate Sign, CRL Sign\n            X509v3 Subject Key Identifier:\n                9F:3A:C7:11:D4:E8:52:B6:00:1A:FF:9C:22:4D:87:6E\n    Signature Algorithm: sha256WithRSAEncryption\n    SHA256 Fingerprint: 9F:3A:C7:11:D4:E8:52:B6:00:1A:FF:9C:22:4D:87:6E';
                }

                // Intermediate Alpha (legitimate)
                if (filePath.includes('intermediate-alpha') || filePath.includes('intermediate_alpha')) {
                    engine.advancePhase && engine.advancePhase('analysis');
                    if (joined.includes('-subject') || joined.includes('-issuer') || joined.includes('-serial')) {
                        let out = '';
                        if (joined.includes('-subject')) out += 'subject=CN = Nexus Intermediate Alpha, O = Confederacy Central, C = NX\n';
                        if (joined.includes('-issuer'))  out += 'issuer=CN = Nexus Trust Authority, O = Confederacy Central, C = NX\n';
                        if (joined.includes('-serial'))  out += 'serial=AA:02:00:00:00:17\n';
                        if (joined.includes('-fingerprint')) out += 'SHA256 Fingerprint=4B:22:8E:F1:7C:A3:90:DD:55:67:01:BC:EE:3F:A8:19\n';
                        return out.trim();
                    }
                    return 'Certificate:\n    Data:\n        Version: 3 (0x2)\n        Serial Number: AA:02:00:00:00:17\n        Signature Algorithm: sha256WithRSAEncryption\n        Issuer: CN = Nexus Trust Authority, O = Confederacy Central, C = NX\n        Validity\n            Not Before: Jun 15 00:00:00 2024 GMT\n            Not After : Jun 15 00:00:00 2029 GMT\n        Subject: CN = Nexus Intermediate Alpha, O = Confederacy Central, C = NX\n        Subject Public Key Info:\n            Public Key Algorithm: rsaEncryption\n                RSA Public-Key: (2048 bit)\n        X509v3 extensions:\n            X509v3 Basic Constraints: critical\n                CA:TRUE, pathlen:0\n            X509v3 Key Usage: critical\n                Certificate Sign, CRL Sign\n            X509v3 Authority Key Identifier:\n                keyid:9F:3A:C7:11:D4:E8:52:B6:00:1A:FF:9C:22:4D:87:6E\n            X509v3 Subject Key Identifier:\n                4B:22:8E:F1:7C:A3:90:DD:55:67:01:BC:EE:3F:A8:19\n    Signature Algorithm: sha256WithRSAEncryption\n    SHA256 Fingerprint: 4B:22:8E:F1:7C:A3:90:DD:55:67:01:BC:EE:3F:A8:19\n\n    Issuer Key Fingerprint: 9F:3A:C7:11:D4:E8:52:B6:00:1A:FF:9C:22:4D:87:6E\n    [MATCHES Root CA fingerprint -- chain VALID]';
                }

                // Intermediate Beta (ROGUE)
                if (filePath.includes('intermediate-beta') || filePath.includes('intermediate_beta')) {
                    engine.advancePhase && engine.advancePhase('analysis');
                    if (joined.includes('-subject') || joined.includes('-issuer') || joined.includes('-serial')) {
                        let out = '';
                        if (joined.includes('-subject')) out += 'subject=CN = Nexus Intermediate Alpha, O = Confederacy Central, C = NX\n';
                        if (joined.includes('-issuer'))  out += 'issuer=CN = Nexus Trust Authority, O = Confederacy Central, C = NX\n';
                        if (joined.includes('-serial'))  out += 'serial=BB:02:00:00:00:42\n';
                        if (joined.includes('-fingerprint')) out += 'SHA256 Fingerprint=E6:91:3D:FA:28:C4:55:B7:03:8E:DC:A0:11:69:F2:7B\n';
                        return out.trim();
                    }
                    return 'Certificate:\n    Data:\n        Version: 3 (0x2)\n        Serial Number: BB:02:00:00:00:42\n        Signature Algorithm: sha256WithRSAEncryption\n        Issuer: CN = Nexus Trust Authority, O = Confederacy Central, C = NX\n        Validity\n            Not Before: Jun 15 00:00:00 2024 GMT\n            Not After : Jun 15 00:00:00 2029 GMT\n        Subject: CN = Nexus Intermediate Alpha, O = Confederacy Central, C = NX\n        Subject Public Key Info:\n            Public Key Algorithm: rsaEncryption\n                RSA Public-Key: (2048 bit)\n        X509v3 extensions:\n            X509v3 Basic Constraints: critical\n                CA:TRUE, pathlen:0\n            X509v3 Key Usage: critical\n                Certificate Sign, CRL Sign\n            X509v3 Authority Key Identifier:\n                keyid:D1:7F:E3:44:A9:0B:CC:58:93:21:6A:FD:77:B0:15:2E\n            X509v3 Subject Key Identifier:\n                E6:91:3D:FA:28:C4:55:B7:03:8E:DC:A0:11:69:F2:7B\n    Signature Algorithm: sha256WithRSAEncryption\n    SHA256 Fingerprint: E6:91:3D:FA:28:C4:55:B7:03:8E:DC:A0:11:69:F2:7B\n\n    Issuer Key Fingerprint: D1:7F:E3:44:A9:0B:CC:58:93:21:6A:FD:77:B0:15:2E\n    [WARNING: Does NOT match Root CA fingerprint 9F:3A:C7:11:...]\n    [This certificate was signed by a DIFFERENT root authority]';
                }

                // Server cert (legitimate)
                if (filePath.includes('server-portal.pem') && !filePath.includes('mitm')) {
                    return 'Certificate:\n    Data:\n        Version: 3 (0x2)\n        Serial Number: AA:03:00:00:01:89\n        Signature Algorithm: sha256WithRSAEncryption\n        Issuer: CN = Nexus Intermediate Alpha, O = Confederacy Central, C = NX\n        Validity\n            Not Before: Jan 10 00:00:00 2025 GMT\n            Not After : Jan 10 00:00:00 2026 GMT\n        Subject: CN = portal.nexus-confederacy.mil, O = Confederacy Central, C = NX\n        Subject Public Key Info:\n            Public Key Algorithm: rsaEncryption\n                RSA Public-Key: (2048 bit)\n        X509v3 extensions:\n            X509v3 Subject Alternative Name:\n                DNS:portal.nexus-confederacy.mil, DNS:*.nexus-confederacy.mil\n            X509v3 Authority Key Identifier:\n                keyid:4B:22:8E:F1:7C:A3:90:DD:55:67:01:BC:EE:3F:A8:19\n    Signature Algorithm: sha256WithRSAEncryption\n    SHA256 Fingerprint: 7C:05:B2:39:D8:FE:14:A0:66:CC:88:91:EE:57:2D:4A\n\n    Issuer Key Fingerprint: 4B:22:8E:F1:7C:A3:90:DD:55:67:01:BC:EE:3F:A8:19\n    [Matches Intermediate Alpha -- chain VALID]';
                }

                // Server cert (MITM)
                if (filePath.includes('mitm') || filePath.includes('portal-mitm')) {
                    return 'Certificate:\n    Data:\n        Version: 3 (0x2)\n        Serial Number: BB:03:00:00:01:C3\n        Signature Algorithm: sha256WithRSAEncryption\n        Issuer: CN = Nexus Intermediate Alpha, O = Confederacy Central, C = NX\n        Validity\n            Not Before: Jan 10 00:00:00 2025 GMT\n            Not After : Jan 10 00:00:00 2026 GMT\n        Subject: CN = portal.nexus-confederacy.mil, O = Confederacy Central, C = NX\n        Subject Public Key Info:\n            Public Key Algorithm: rsaEncryption\n                RSA Public-Key: (2048 bit)\n        X509v3 extensions:\n            X509v3 Subject Alternative Name:\n                DNS:portal.nexus-confederacy.mil, DNS:*.nexus-confederacy.mil\n            X509v3 Authority Key Identifier:\n                keyid:E6:91:3D:FA:28:C4:55:B7:03:8E:DC:A0:11:69:F2:7B\n    Signature Algorithm: sha256WithRSAEncryption\n    SHA256 Fingerprint: A2:F8:16:C0:3B:DD:92:E5:48:77:AA:0F:55:CE:63:81\n\n    Issuer Key Fingerprint: E6:91:3D:FA:28:C4:55:B7:03:8E:DC:A0:11:69:F2:7B\n    [WARNING: Signed by rogue intermediate BB:02:00:00:00:42]\n    [This is a MITM certificate -- NOT issued by legitimate CA]';
                }

                // CRL
                if (filePath.includes('crl')) {
                    return 'Certificate Revocation List (CRL):\n    Version: 2 (0x1)\n    Signature Algorithm: sha256WithRSAEncryption\n    Issuer: CN = Nexus Trust Authority, O = Confederacy Central, C = NX\n    Last Update: Mar  1 00:00:00 2026 GMT\n    Next Update: Apr  1 00:00:00 2026 GMT\nRevoked Certificates:\n    Serial Number: AA:03:00:00:00:05\n        Revocation Date: Feb 14 00:00:00 2026 GMT\n        CRL Reason: keyCompromise\n    Serial Number: AA:03:00:00:00:09\n        Revocation Date: Feb 28 00:00:00 2026 GMT\n        CRL Reason: superseded\n\nNOTE: Serial BB:02:00:00:00:42 is NOT listed.\nThe rogue intermediate has not been revoked yet.';
                }

                return 'unable to load certificate\nUsage: openssl x509 -in <certfile.pem> -text [-noout]';
            }

            // --- openssl verify ---
            if (joined.includes('verify')) {
                const caMatch = joined.match(/-CAfile\s+([^\s]+)/);
                const certFiles = joined.match(/([^\s]+\.pem)(?!.*-CAfile)/g) || [];
                const lastArg = args[args.length - 1];

                if (!caMatch) {
                    return 'Usage: openssl verify -CAfile <ca-cert.pem> <certificate.pem>';
                }

                // Verify intermediate-alpha against root
                if (lastArg.includes('intermediate-alpha') || lastArg.includes('alpha')) {
                    return '/home/analyst/certs/intermediate-alpha.pem: OK\n\nChain verification successful:\n  Root CA (9F:3A:C7:11...) -> Intermediate Alpha (4B:22:8E:F1...)\n  Issuer fingerprint matches. Signature valid.';
                }

                // Verify intermediate-beta against root (FAILS)
                if (lastArg.includes('intermediate-beta') || lastArg.includes('beta')) {
                    engine.advancePhase && engine.advancePhase('exploitation');
                    return 'error 20 at 0 depth lookup: unable to get local issuer certificate\n/home/analyst/certs/intermediate-beta.pem: VERIFICATION FAILED\n\nChain verification FAILED:\n  Root CA (9F:3A:C7:11...) did NOT sign this certificate.\n  Certificate\'s Authority Key ID: D1:7F:E3:44:A9:0B:CC:58...\n  Expected Authority Key ID:      9F:3A:C7:11:D4:E8:52:B6...\n\n  This intermediate was signed by an UNKNOWN root authority.\n  Serial BB:02:00:00:00:42 is a ROGUE certificate.\n\n{{FLAG:user}}';
                }

                // Verify server cert against legitimate intermediate
                if (lastArg.includes('server-portal') && !lastArg.includes('mitm')) {
                    return '/home/analyst/certs/server-portal.pem: OK\n\nChain: Root CA -> Intermediate Alpha -> portal.nexus-confederacy.mil\nAll signatures valid.';
                }

                // Verify MITM server cert
                if (lastArg.includes('mitm')) {
                    return 'error 20 at 0 depth lookup: unable to get local issuer certificate\n/home/analyst/certs/server-portal-mitm.pem: VERIFICATION FAILED\n\nThis server certificate was signed by the rogue intermediate\n(Serial BB:02:00:00:00:42), not by the legitimate chain.';
                }

                return 'Usage: openssl verify -CAfile <ca-cert.pem> <certificate.pem>\n\nExample:\n  openssl verify -CAfile certs/root-ca.pem certs/intermediate-alpha.pem\n  openssl verify -CAfile certs/root-ca.pem certs/intermediate-beta.pem';
            }

            // --- openssl s_client (decrypt captured session) ---
            if (joined.includes('s_client')) {
                if (joined.includes('-decrypt') || joined.includes('decrypt')) {
                    if (joined.includes('rogue-private') || joined.includes('rogue_private') || joined.includes('private.key')) {
                        if (joined.includes('tls-session') || joined.includes('pcap') || joined.includes('capture')) {
                            engine.advancePhase && engine.advancePhase('extraction');
                            return '=== TLS SESSION DECRYPTION ===\nUsing private key: rogue-private.key (BB:02:00:00:00:42)\nTarget capture: tls-session.pcap\n\nDecrypting RSA key exchange... OK\nDeriving session key... OK\nDecrypting 48 application data records... OK\n\n--- DECRYPTED PLAINTEXT ---\nHTTP/1.1 200 OK\nContent-Type: application/json\nX-Nexus-Classification: TOP SECRET // CONFEDERACY EYES ONLY\n\n{\n  "operation": "SANDSTORM",\n  "convoy_id": "CVY-2026-0891",\n  "route": "Sector 4 -> Sector 7 via Waypoint Kilo",\n  "cargo_manifest": [\n    "Medical supplies (crate x24)",\n    "Ammunition (crate x12)",\n    "Communication equipment (crate x6)"\n  ],\n  "eta": "2026-03-28T06:00:00Z",\n  "escort": "3rd Mechanized, Bravo Company",\n  "authentication_token": "{{FLAG:root}}"\n}\n--- END DECRYPTED PLAINTEXT ---\n\nMITM attack CONFIRMED. The rogue intermediate\'s private key\nsuccessfully decrypted the intercepted TLS session.';
                        }
                        return 'openssl s_client: missing capture file.\nUsage: openssl s_client -decrypt -key <private.key> -in <capture.pcap>';
                    }
                    return 'openssl s_client: missing private key.\nUsage: openssl s_client -decrypt -key captures/rogue-private.key -in captures/tls-session.pcap';
                }

                // Generic s_client connect
                if (joined.includes('-connect') || joined.includes('connect')) {
                    return 'CONNECTED(00000003)\n---\nCertificate chain\n 0 s:CN = portal.nexus-confederacy.mil, O = Confederacy Central, C = NX\n   i:CN = Nexus Intermediate Alpha, O = Confederacy Central, C = NX\n 1 s:CN = Nexus Intermediate Alpha, O = Confederacy Central, C = NX\n   i:CN = Nexus Trust Authority, O = Confederacy Central, C = NX\n---\nServer certificate\n  Serial: BB:03:00:00:01:C3\n  WARNING: This serial does not match the known legitimate\n  server cert (AA:03:00:00:01:89). Possible MITM.\n---\nSSL handshake has read 3147 bytes and written 443 bytes\n---\nVerify return code: 0 (ok)\nNOTE: Verification passed because the rogue intermediate was\ninjected into the relay node\'s trust store.';
                }

                return 'Usage: openssl s_client [options]\n\n  -connect host:port   Connect to TLS server\n  -decrypt -key <key> -in <pcap>   Decrypt captured session\n\nExample:\n  openssl s_client -connect portal.nexus-confederacy.mil:443\n  openssl s_client -decrypt -key captures/rogue-private.key -in captures/tls-session.pcap';
            }

            return 'Usage: openssl <command> [options]\n\nCommon commands:\n  x509       Certificate operations\n  verify     Verify certificate chain\n  s_client   TLS client / session decryption\n  req        Certificate requests\n  ca         CA operations\n  crl        CRL operations\n\nExamples:\n  openssl x509 -in certs/root-ca.pem -text\n  openssl verify -CAfile certs/root-ca.pem certs/intermediate-alpha.pem\n  openssl s_client -decrypt -key captures/rogue-private.key -in captures/tls-session.pcap';
        },

        'certtool': function(args, term, engine) {
            const joined = args.join(' ');

            if (args.length === 0) {
                return 'certtool (GnuTLS) 3.7.3\nUsage: certtool -i < certificate.pem\n       certtool --info < certificate.pem\n       certtool -i --infile <certificate.pem>\n\nQuick summary of certificate fields.';
            }

            const fileMatch = joined.match(/--infile\s+([^\s]+)/) || joined.match(/<\s*([^\s]+)/);
            if (!fileMatch) {
                return 'certtool: no input file specified.\nUsage: certtool -i --infile <certificate.pem>';
            }

            const filePath = fileMatch[1].toLowerCase();

            if (filePath.includes('root-ca')) {
                return 'X.509 Certificate Information:\n  Version: 3\n  Serial: AA:01:00:00:00:01\n  Subject: CN=Nexus Trust Authority,O=Confederacy Central,C=NX\n  Issuer:  CN=Nexus Trust Authority,O=Confederacy Central,C=NX  [SELF-SIGNED]\n  Validity: 2024-01-01 to 2034-01-01\n  Key: RSA 4096-bit\n  CA: TRUE\n  Fingerprint: 9F:3A:C7:11:D4:E8:52:B6:00:1A:FF:9C:22:4D:87:6E';
            }

            if (filePath.includes('alpha')) {
                return 'X.509 Certificate Information:\n  Version: 3\n  Serial: AA:02:00:00:00:17\n  Subject: CN=Nexus Intermediate Alpha,O=Confederacy Central,C=NX\n  Issuer:  CN=Nexus Trust Authority,O=Confederacy Central,C=NX\n  Validity: 2024-06-15 to 2029-06-15\n  Key: RSA 2048-bit\n  CA: TRUE (pathlen:0)\n  Fingerprint: 4B:22:8E:F1:7C:A3:90:DD:55:67:01:BC:EE:3F:A8:19\n  Issuer FP:   9F:3A:C7:11:D4:E8:52:B6:00:1A:FF:9C:22:4D:87:6E  [MATCHES ROOT]';
            }

            if (filePath.includes('beta')) {
                return 'X.509 Certificate Information:\n  Version: 3\n  Serial: BB:02:00:00:00:42\n  Subject: CN=Nexus Intermediate Alpha,O=Confederacy Central,C=NX\n  Issuer:  CN=Nexus Trust Authority,O=Confederacy Central,C=NX  [CLAIMED]\n  Validity: 2024-06-15 to 2029-06-15\n  Key: RSA 2048-bit\n  CA: TRUE (pathlen:0)\n  Fingerprint: E6:91:3D:FA:28:C4:55:B7:03:8E:DC:A0:11:69:F2:7B\n  Issuer FP:   D1:7F:E3:44:A9:0B:CC:58:93:21:6A:FD:77:B0:15:2E  [MISMATCH!]\n\n  WARNING: Issuer fingerprint does NOT match Root CA.\n  This certificate claims to be issued by Nexus Trust Authority\n  but its Authority Key Identifier points to a different key.';
            }

            if (filePath.includes('server') && !filePath.includes('mitm')) {
                return 'X.509 Certificate Information:\n  Version: 3\n  Serial: AA:03:00:00:01:89\n  Subject: CN=portal.nexus-confederacy.mil,O=Confederacy Central,C=NX\n  Issuer:  CN=Nexus Intermediate Alpha,O=Confederacy Central,C=NX\n  Validity: 2025-01-10 to 2026-01-10\n  Key: RSA 2048-bit\n  SAN: portal.nexus-confederacy.mil, *.nexus-confederacy.mil\n  Fingerprint: 7C:05:B2:39:D8:FE:14:A0:66:CC:88:91:EE:57:2D:4A\n  Issuer FP:   4B:22:8E:F1:7C:A3:90:DD:55:67:01:BC:EE:3F:A8:19  [MATCHES ALPHA]';
            }

            if (filePath.includes('mitm')) {
                return 'X.509 Certificate Information:\n  Version: 3\n  Serial: BB:03:00:00:01:C3\n  Subject: CN=portal.nexus-confederacy.mil,O=Confederacy Central,C=NX\n  Issuer:  CN=Nexus Intermediate Alpha,O=Confederacy Central,C=NX\n  Validity: 2025-01-10 to 2026-01-10\n  Key: RSA 2048-bit\n  SAN: portal.nexus-confederacy.mil, *.nexus-confederacy.mil\n  Fingerprint: A2:F8:16:C0:3B:DD:92:E5:48:77:AA:0F:55:CE:63:81\n  Issuer FP:   E6:91:3D:FA:28:C4:55:B7:03:8E:DC:A0:11:69:F2:7B  [MATCHES ROGUE BETA]';
            }

            return 'certtool: unable to load certificate. Check file path.';
        },

        'diff': function(args, term, engine) {
            if (args.length < 2) return 'Usage: diff <file1> <file2>';

            const joined = args.join(' ').toLowerCase();

            // Comparing the two intermediates
            if ((joined.includes('alpha') && joined.includes('beta')) ||
                (joined.includes('intermediate') && args.length >= 2)) {
                return '--- intermediate-alpha.pem\n+++ intermediate-beta.pem\n@@ Certificate Fields @@\n  Subject:     CN=Nexus Intermediate Alpha  (SAME)\n  Issuer:      CN=Nexus Trust Authority     (SAME -- but see below)\n  Validity:    2024-06-15 to 2029-06-15     (SAME)\n  Key Size:    2048 bit                     (SAME)\n\n@@ DIFFERENCES @@\n- Serial:          AA:02:00:00:00:17\n+ Serial:          BB:02:00:00:00:42\n\n- Fingerprint:     4B:22:8E:F1:7C:A3:90:DD:55:67:01:BC:EE:3F:A8:19\n+ Fingerprint:     E6:91:3D:FA:28:C4:55:B7:03:8E:DC:A0:11:69:F2:7B\n\n- Issuer Key FP:   9F:3A:C7:11:D4:E8:52:B6:00:1A:FF:9C:22:4D:87:6E  [Root CA]\n+ Issuer Key FP:   D1:7F:E3:44:A9:0B:CC:58:93:21:6A:FD:77:B0:15:2E  [UNKNOWN]\n\nCRITICAL: The Issuer Key Fingerprint differs.\nAlpha was signed by Root CA (9F:3A...).\nBeta was signed by an unknown authority (D1:7F...).\nBeta is likely a ROGUE certificate.';
            }

            // Comparing the two server certs
            if ((joined.includes('portal') && joined.includes('mitm')) ||
                (joined.includes('server') && args.length >= 2)) {
                return '--- server-portal.pem\n+++ server-portal-mitm.pem\n@@ Certificate Fields @@\n  Subject:     CN=portal.nexus-confederacy.mil   (SAME)\n  Issuer:      CN=Nexus Intermediate Alpha        (SAME name)\n  Validity:    2025-01-10 to 2026-01-10           (SAME)\n  SAN:         portal.nexus-confederacy.mil       (SAME)\n\n@@ DIFFERENCES @@\n- Serial:          AA:03:00:00:01:89\n+ Serial:          BB:03:00:00:01:C3\n\n- Fingerprint:     7C:05:B2:39:D8:FE:14:A0:66:CC:88:91:EE:57:2D:4A\n+ Fingerprint:     A2:F8:16:C0:3B:DD:92:E5:48:77:AA:0F:55:CE:63:81\n\n- Issuer Key FP:   4B:22:8E:F1  (legitimate Alpha)\n+ Issuer Key FP:   E6:91:3D:FA  (rogue Beta)\n\nThe MITM cert was signed by the rogue intermediate, not the real one.';
            }

            return 'diff: cannot compare -- check file paths.\nExample: diff certs/intermediate-alpha.pem certs/intermediate-beta.pem';
        },

        'grep': function(args, term, engine) {
            if (args.length < 2) return 'Usage: grep <pattern> <file>';

            const pattern = args[0].toLowerCase().replace(/['"]/g, '');
            const filePath = args.slice(1).join(' ').toLowerCase();

            // Grep for serial numbers
            if (pattern.includes('serial') || pattern.includes('bb:') || pattern.includes('aa:')) {
                if (filePath.includes('alpha')) return 'Serial: AA:02:00:00:00:17';
                if (filePath.includes('beta'))  return 'Serial: BB:02:00:00:00:42';
                if (filePath.includes('root'))  return 'Serial: AA:01:00:00:00:01';
                if (filePath.includes('pcap') || filePath.includes('session'))
                    return '    [0] CN=portal.nexus-confederacy.mil  (Serial: BB:03:00:00:01:C3)\n    [1] CN=Nexus Intermediate Alpha      (Serial: BB:02:00:00:00:42)';
            }

            // Grep for fingerprint
            if (pattern.includes('fingerprint') || pattern.includes('finger') || pattern.includes('sha256')) {
                if (filePath.includes('alpha')) return 'Fingerprint: 4B:22:8E:F1:7C:A3:90:DD:55:67:01:BC:EE:3F:A8:19\nIssuer Key Fingerprint: 9F:3A:C7:11:D4:E8:52:B6:00:1A:FF:9C:22:4D:87:6E';
                if (filePath.includes('beta'))  return 'Fingerprint: E6:91:3D:FA:28:C4:55:B7:03:8E:DC:A0:11:69:F2:7B\nIssuer Key Fingerprint: D1:7F:E3:44:A9:0B:CC:58:93:21:6A:FD:77:B0:15:2E';
                if (filePath.includes('root'))  return 'Fingerprint: 9F:3A:C7:11:D4:E8:52:B6:00:1A:FF:9C:22:4D:87:6E';
            }

            // Grep for issuer
            if (pattern.includes('issuer')) {
                if (filePath.includes('alpha')) return 'Issuer: CN=Nexus Trust Authority, O=Confederacy Central, C=NX\nIssuer Key Fingerprint: SHA256:9F:3A:C7:11:D4:E8:52:B6:00:1A:FF:9C:22:4D:87:6E';
                if (filePath.includes('beta'))  return 'Issuer: CN=Nexus Trust Authority, O=Confederacy Central, C=NX\nIssuer Key Fingerprint: SHA256:D1:7F:E3:44:A9:0B:CC:58:93:21:6A:FD:77:B0:15:2E';
            }

            // Grep for rogue / flag
            if (pattern.includes('rogue') || pattern.includes('flag') || pattern.includes('anomal')) {
                if (filePath.includes('pcap') || filePath.includes('session') || filePath.includes('capture'))
                    return '  WARNING: Certificate serial BB:03:00:00:01:C3 does NOT match\n  the known legitimate server cert serial AA:03:00:00:01:89.\n  The intermediate serial BB:02:00:00:00:42 is also anomalous.';
            }

            // Grep for BB: prefix (attacker serials)
            if (pattern === 'bb:' || pattern.includes('bb:')) {
                return 'intermediate-beta.pem: Serial: BB:02:00:00:00:42\nserver-portal-mitm.pem: Serial: BB:03:00:00:01:C3\ntls-session.pcap: [0] Serial: BB:03:00:00:01:C3\ntls-session.pcap: [1] Serial: BB:02:00:00:00:42';
            }

            return 'grep: no matches found for \'' + pattern + '\' in ' + filePath;
        },

        'nmap': function(args) {
            if (args.length === 0) return 'Usage: nmap [options] <target>';
            return 'Starting Nmap 7.94 ( https://nmap.org )\nNote: This is a PKI / certificate analysis challenge.\nFocus on the certificates in ~/certs/ and captures in ~/captures/';
        },

        'ping': function(args) {
            return 'This is a PKI analysis challenge. No live network targets.\nFocus on certificates in ~/certs/ and captures in ~/captures/';
        },

        'python3': function(args, term, engine) {
            if (args.length === 0) {
                return 'Python 3.10.12\nUsage: python3 -c "code"\n\nThis challenge focuses on openssl and certificate analysis.\nUse openssl x509, openssl verify, and diff instead.';
            }
            return 'Python 3.10.12\n[executed]';
        },

        'bash': function(args, term, engine) {
            const joined = args.join(' ');
            if (joined.includes('verify-chain') || joined.includes('compare-certs')) {
                // Scripts reference openssl -- redirect
                if (joined.includes('verify-chain')) {
                    const certArg = joined.match(/verify-chain\.sh\s+([^\s]+)/);
                    if (certArg) {
                        const cert = certArg[1].toLowerCase();
                        if (cert.includes('alpha')) {
                            return 'Running: openssl verify -CAfile ~/certs/root-ca.pem ' + certArg[1] + '\n\n' + certArg[1] + ': OK\nChain valid. Intermediate Alpha is signed by Root CA.';
                        }
                        if (cert.includes('beta')) {
                            engine.advancePhase && engine.advancePhase('exploitation');
                            return 'Running: openssl verify -CAfile ~/certs/root-ca.pem ' + certArg[1] + '\n\nerror 20 at 0 depth lookup: unable to get local issuer certificate\n' + certArg[1] + ': VERIFICATION FAILED\n\nIntermediate Beta is NOT signed by Root CA.\nThis is a ROGUE certificate.\n\n{{FLAG:user}}';
                        }
                    }
                    return 'Usage: bash tools/verify-chain.sh <certificate.pem>';
                }
                if (joined.includes('compare-certs')) {
                    if (joined.includes('alpha') && joined.includes('beta')) {
                        return '=== Certificate Comparison ===\n\nCert 1: intermediate-alpha.pem\n  subject=CN = Nexus Intermediate Alpha, O = Confederacy Central, C = NX\n  issuer=CN = Nexus Trust Authority, O = Confederacy Central, C = NX\n  serial=AA:02:00:00:00:17\n  SHA256 Fingerprint=4B:22:8E:F1:7C:A3:90:DD:55:67:01:BC:EE:3F:A8:19\n\nCert 2: intermediate-beta.pem\n  subject=CN = Nexus Intermediate Alpha, O = Confederacy Central, C = NX\n  issuer=CN = Nexus Trust Authority, O = Confederacy Central, C = NX\n  serial=BB:02:00:00:00:42\n  SHA256 Fingerprint=E6:91:3D:FA:28:C4:55:B7:03:8E:DC:A0:11:69:F2:7B\n\nWARNING: Same Subject CN but different serials and fingerprints.\nOne of these was not signed by the real Root CA.';
                    }
                    return 'Usage: bash tools/compare-certs.sh <cert1.pem> <cert2.pem>';
                }
            }
            return 'bash: command execution not supported in this context.\nUse the available tools: openssl, certtool, diff, grep';
        }
    },

    // -------------------------------------------------------
    // HTML HELPERS
    // -------------------------------------------------------

    _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent.trim();
    }
};
