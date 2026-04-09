/* ============================================================
   CTF ARENA -- Box F14: The Fractured Consensus
   Byzantine Fault Tolerance -- Consensus Manipulation
   Config: BFT network, node compromise, message forging, flags
   ============================================================ */

const F14Config = {

    // =====================================================
    // BOX METADATA
    // =====================================================

    title: 'The Fractured Consensus',
    subtitle: 'Byzantine Fault Tolerance -- Consensus Manipulation',
    difficulty: 'Expert',
    accent: '#dc2626',
    storageKey: 'hexworth_ctf_f14',
    registryId: 'f14-fractured-consensus',
    trackerKey: 'ctf_f14',

    // =====================================================
    // PHASE SYSTEM (Multi-layer attack chain)
    // =====================================================

    phases: [
        {
            id: 'recon',
            name: 'Network Reconnaissance',
            icon: '/assets/images/icons/icon-search.webp',
            description: 'Map the distributed consensus network. Identify all 7 validator nodes, their roles, and communication patterns.',
            requiredFlags: [],
            mitre: ['T1046', 'T1018'],
            unlocks: ['analysis'],
            locked: false
        },
        {
            id: 'analysis',
            name: 'Vulnerability Analysis',
            icon: '/assets/images/icons/icon-gear.webp',
            description: 'Analyze node signing keys and APIs for weaknesses. Identify which nodes can be compromised to exceed the f < n/3 threshold.',
            requiredFlags: [],
            mitre: ['T1595.002', 'T1592'],
            unlocks: ['exploitation'],
            locked: true
        },
        {
            id: 'exploitation',
            name: 'Consensus Exploitation',
            icon: '/assets/images/icons/icon-fire.webp',
            description: 'Compromise vulnerable nodes, forge signed messages, and broadcast conflicting votes to fracture the consensus.',
            requiredFlags: ['user'],
            mitre: ['T1557', 'T1565.002'],
            unlocks: ['extraction'],
            locked: true
        },
        {
            id: 'extraction',
            name: 'Governance Extraction',
            icon: '/assets/images/icons/icon-trophy.webp',
            description: 'Force a fraudulent consensus outcome and extract the governance keys that control the system.',
            requiredFlags: ['root'],
            mitre: ['T1005', 'T1041'],
            unlocks: [],
            locked: true
        }
    ],

    // =====================================================
    // TUTORIAL MODE
    // =====================================================

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Survey the consensus network',
                tip: 'Run: network-status to see all 7 validator nodes and the current consensus state.',
                trigger: { event: 'command', match: { cmd: 'contains:network-status' } }
            },
            {
                title: 'Examine node configurations',
                tip: 'Read the node configs in /home/analyst/network/nodes/. Look for weak keys or exposed APIs. Try: cat /home/analyst/network/nodes/node-03.conf',
                trigger: { event: 'command', match: { cmd: 'contains:node-' } }
            },
            {
                title: 'Query a vulnerable node',
                tip: 'Use node-query to probe individual nodes. Try: node-query node-03',
                trigger: { event: 'command', match: { cmd: 'contains:node-query' } }
            },
            {
                title: 'Submit the user flag',
                tip: 'Once you have identified and compromised enough nodes to exceed f < n/3, the user flag is revealed. Submit it via the Flag panel.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Force fraudulent consensus and extract governance keys',
                tip: 'Use forge-message and broadcast to send conflicting votes from compromised nodes. Then extract the governance keys. The root flag is inside.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // =====================================================
    // CERT OBJECTIVES (Assessment Mode)
    // =====================================================

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '1.2', description: 'Given a scenario, analyze indicators of compromise -- Distributed systems integrity attacks', skill: 'BFT Threshold Analysis' },
            { flagId: 'user', objective: '2.4', description: 'Given a scenario, analyze cryptographic implementations -- Weak signing key exploitation in distributed consensus', skill: 'Node Signing Key Analysis' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks -- Consensus manipulation via Byzantine behavior', skill: 'Byzantine Message Forgery' },
            { flagId: 'root', objective: '2.5', description: 'Given a scenario, implement resilient architectures -- Distributed system fault tolerance boundaries', skill: 'Governance Key Extraction via Consensus Override' }
        ]
    },

    // =====================================================
    // BOOT SEQUENCE
    // =====================================================

    boot: {
        biosLines: [
            'HEXWORTH DISTRIBUTED SYSTEMS WORKSTATION v3.7.1',
            'Initializing hardware...',
            'Memory Test: 32768 MB OK',
            'Detecting drives... /dev/nvme0n1 (1TB NVMe)',
            'Network adapters: eth0 (10GbE) -- connected',
            'HSM Module: Thales Luna PCIe -- detected',
            'Consensus SDK: libpbft v2.4.0 loaded',
            'Boot device: /dev/nvme0n1p2',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Hexworth Analyst Workstation (Ubuntu 22.04)',
            'Hexworth Analyst Workstation (recovery mode)',
            'Advanced options for Hexworth Analyst'
        ],
        loginUser: 'analyst'
    },

    // =====================================================
    // DESKTOP ICONS
    // =====================================================

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal', icon: '<img src="/assets/images/icons/icon-terminal.webp" alt="" width="32" height="32" style="display:block;margin:0 auto;">', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',  icon: '<img src="/assets/images/icons/icon-globe.webp" alt="" width="32" height="32" style="display:block;margin:0 auto;">', app: 'browser' },
            { id: 'notes',    label: 'Notes',    icon: '<img src="/assets/images/icons/icon-clipboard.webp" alt="" width="32" height="32" style="display:block;margin:0 auto;">', app: 'notes' },
            { id: 'hints',    label: 'Hints',    icon: '<img src="/assets/images/icons/icon-info.webp" alt="" width="32" height="32" style="display:block;margin:0 auto;">', app: 'hints' },
            { id: 'flags',    label: 'Submit Flag', icon: '<img src="/assets/images/icons/icon-flag.webp" alt="" width="32" height="32" style="display:block;margin:0 auto;">', app: 'flags' }
        ]
    },

    // =====================================================
    // TERMINAL CONFIG
    // =====================================================

    terminal: {
        user: 'analyst',
        hostname: 'consensus-lab',
        startDir: '/home/analyst',
        welcome: 'Hexworth Distributed Systems Workstation\nUbuntu 22.04 LTS -- Kernel 5.15.0-91-generic\n\nType \'help\' for available commands.\nMission: Byzantine Fault Tolerance -- Consensus Manipulation\n\n=== BRIEFING ===\nA 7-node PBFT consensus network governs critical infrastructure.\nByzantine fault tolerance threshold: f < n/3 (max 2 faulty of 7).\nCompromise 3+ nodes to override consensus.\nTarget files in /home/analyst/\n'
    },

    // =====================================================
    // BFT NETWORK PARAMETERS
    // Nodes: 7 validators (n=7, f < n/3, so f < 2.33)
    // BFT tolerates up to 2 faulty nodes
    // Compromising 3 nodes breaks the threshold
    // Vulnerable nodes: 03 (weak key), 05 (exposed API), 07 (default creds)
    // =====================================================

    _bft: {
        totalNodes: 7,
        faultThreshold: 2,
        requiredCompromise: 3,
        vulnerableNodes: ['node-03', 'node-05', 'node-07'],
        currentProposal: 'PROPOSAL-2026-0042: Authorize emergency power grid rerouting to Sector 9',
        honestVote: 'REJECT',
        forgedVote: 'APPROVE',
        governanceKeyHash: 'sha256:a7f3c9d1e4b82056f91ca3d7e6b5084f12de9c3a7b1e4f06d8ca2359e7b1f043'
    },

    // =====================================================
    // FLAGS
    // =====================================================

    flags: [
        { id: 'user', points: 100 },
        { id: 'root', points: 200 }
    ],

    // =====================================================
    // SCORING
    // =====================================================

    scoring: {
        base: 1000,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 1200000, points: 100 },
        timeBonusThreshold: 2400
    },

    // =====================================================
    // HINTS
    // =====================================================

    hints: [
        {
            id: 'hint1',
            text: 'Start by running network-status to see the 7 validator nodes. Then examine node configs in /home/analyst/network/nodes/. Look for nodes with weak signing keys, exposed APIs, or default credentials.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Three nodes are vulnerable: node-03 uses a 512-bit RSA signing key (factorable), node-05 has an unauthenticated admin API on port 9090, and node-07 still has default credentials (admin/admin). BFT tolerates f < n/3 faulty nodes. With n=7, compromising 3 nodes exceeds the threshold.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Use node-query on each vulnerable node to compromise it. Once you control 3 nodes, the user flag is revealed. Then use forge-message to craft APPROVE votes from your compromised nodes for the current proposal.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'After forging messages, use broadcast to send them to the network. Then run network-status to see the consensus shift. When the fraudulent proposal passes, the governance keys are exposed. Use verify-sig to confirm your forged signatures pass validation.',
            cost: 75,
            penalty: -75
        }
    ],

    // =====================================================
    // LORE
    // =====================================================

    lore: {
        intro: 'The Meridian Grid -- a distributed network governing critical power infrastructure decisions for three city-states -- relies on a 7-node Practical Byzantine Fault Tolerance (PBFT) consensus protocol. Every major decision requires supermajority agreement: at least 5 of 7 validator nodes must concur. The system was designed to tolerate up to 2 compromised or faulty nodes (f < n/3). Intelligence indicates that at least 3 of the 7 nodes have exploitable vulnerabilities. If you can seize control of 3 nodes, you break the Byzantine fault tolerance guarantee and can force any decision through the network.',

        scenario: 'The Meridian Grid has operated for twelve years without a single fraudulent consensus outcome. Its architects were confident: "Even if an adversary compromises two nodes, the honest majority prevails." But they never audited the individual nodes. Node-03\'s signing key was generated with a deprecated 512-bit RSA library. Node-05\'s administrator left a debug API endpoint exposed without authentication. Node-07 was deployed by a contractor who never changed the default credentials. Three cracks in a seven-link chain. The threshold was n/3. You only need to cross it.\n\nYour mission: compromise enough nodes to exceed the fault tolerance threshold, forge consensus messages that pass signature verification, and extract the governance keys that control the Meridian Grid.',

        outro: 'The Fractured Consensus is complete. Three compromised validators -- one with a factorable signing key, one with an exposed API, one with default credentials -- were enough to shatter twelve years of Byzantine fault tolerance. The Meridian Grid approved a fraudulent power rerouting proposal, and the governance keys are now in your hands. The lesson: BFT guarantees are only as strong as the weakest node in the network. When f >= n/3, consensus is an illusion.',

        ecer: {
            executive: 'Grid governance board approved 7-node topology without redundancy margin above BFT minimum',
            culture: 'Node operators treated deployment as one-time setup with no ongoing security audits',
            employee: 'Contractor deployed node-07 with default credentials; node-05 admin left debug API exposed',
            regulatory: 'No mandatory key rotation or minimum key strength standards for validator nodes'
        }
    },

    // =====================================================
    // INTERNAL STATE (tracks compromise progress)
    // =====================================================

    _state: {
        compromisedNodes: [],
        forgedMessages: [],
        consensusOverridden: false,
        governanceExtracted: false
    },

    // =====================================================
    // FILESYSTEM (analyst workstation)
    // =====================================================

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
                                    content: '=== MISSION: THE FRACTURED CONSENSUS ===\n\nINTEL BRIEFING:\nThe Meridian Grid uses a 7-node PBFT consensus network to govern\ncritical power infrastructure decisions for three city-states.\n\nBYZANTINE FAULT TOLERANCE:\n- n = 7 validator nodes\n- BFT threshold: f < n/3 => tolerates up to 2 faulty nodes\n- Consensus requires: 2f + 1 = 5 agreeing nodes (supermajority)\n- If 3+ nodes are compromised, BFT guarantee is broken\n\nCURRENT PROPOSAL UNDER VOTE:\nPROPOSAL-2026-0042: Authorize emergency power grid rerouting to Sector 9\nHonest nodes are voting REJECT (safety concerns).\nYour objective: force APPROVE.\n\nDIRECTORIES:\n- network/    Node configs, peer lists, message logs\n- crypto/     Signing keys, message format specs\n- tools/      Message forging and replay utilities\n- docs/       BFT algorithm specification\n\nOBJECTIVES:\n1. [USER FLAG] Identify and compromise 3 vulnerable nodes\n   to exceed the fault tolerance threshold.\n2. [ROOT FLAG] Forge consensus messages, force a fraudulent\n   APPROVE outcome, and extract the governance keys.\n\nCUSTOM COMMANDS:\n  network-status   Show consensus state and vote tally\n  node-query       Query individual node state/compromise\n  forge-message    Craft signed messages from compromised nodes\n  broadcast        Send messages to the network\n  verify-sig       Check message signatures'
                                },

                                'network': {
                                    type: 'dir',
                                    children: {
                                        'topology.txt': {
                                            type: 'file',
                                            content: '=== MERIDIAN GRID -- NETWORK TOPOLOGY ===\n\nProtocol: Practical Byzantine Fault Tolerance (PBFT)\nNodes: 7 validators (n=7)\nFault tolerance: f < n/3 => f_max = 2\nConsensus quorum: 2f+1 = 5 nodes must agree\nMessage rounds: PRE-PREPARE -> PREPARE -> COMMIT\n\n  Node-01 (Primary/Leader)\n    |\n    +--- Node-02\n    +--- Node-03  [!] 512-bit RSA signing key\n    +--- Node-04\n    +--- Node-05  [!] Debug API on :9090\n    +--- Node-06\n    +--- Node-07  [!] Default credentials\n\nAll nodes communicate via authenticated channels.\nEach node signs messages with its private key.\nOther nodes verify signatures before accepting messages.\n\nWARNING: If an adversary controls >= 3 nodes, they can:\n  - Send conflicting messages to different honest nodes\n  - Forge valid-looking PREPARE/COMMIT messages\n  - Force the network to accept a fraudulent proposal'
                                        },
                                        'peer-list.json': {
                                            type: 'file',
                                            content: '{\n  "network_id": "meridian-grid-v4",\n  "protocol": "PBFT",\n  "epoch": 2026,\n  "peers": [\n    {\n      "id": "node-01",\n      "role": "primary",\n      "ip": "10.0.1.1",\n      "port": 8443,\n      "pubkey_fingerprint": "SHA256:Kx9mR3vF...a7Qp",\n      "status": "active",\n      "uptime_days": 1847\n    },\n    {\n      "id": "node-02",\n      "role": "replica",\n      "ip": "10.0.1.2",\n      "port": 8443,\n      "pubkey_fingerprint": "SHA256:Lm4nT8wB...c2Ks",\n      "status": "active",\n      "uptime_days": 1847\n    },\n    {\n      "id": "node-03",\n      "role": "replica",\n      "ip": "10.0.1.3",\n      "port": 8443,\n      "pubkey_fingerprint": "SHA256:Wk2bN5xD...f9Re",\n      "status": "active",\n      "uptime_days": 1203,\n      "notes": "Replaced 2023-01-15. Key generated with legacy toolchain."\n    },\n    {\n      "id": "node-04",\n      "role": "replica",\n      "ip": "10.0.1.4",\n      "port": 8443,\n      "pubkey_fingerprint": "SHA256:Hn7cQ1zM...j4Vt",\n      "status": "active",\n      "uptime_days": 1847\n    },\n    {\n      "id": "node-05",\n      "role": "replica",\n      "ip": "10.0.1.5",\n      "port": 8443,\n      "pubkey_fingerprint": "SHA256:Ys8dR2pK...m6Wx",\n      "status": "active",\n      "uptime_days": 1520,\n      "notes": "Admin API on port 9090 for diagnostics. Auth: pending."\n    },\n    {\n      "id": "node-06",\n      "role": "replica",\n      "ip": "10.0.1.6",\n      "port": 8443,\n      "pubkey_fingerprint": "SHA256:Bt3eV9nL...p8Fy",\n      "status": "active",\n      "uptime_days": 1847\n    },\n    {\n      "id": "node-07",\n      "role": "replica",\n      "ip": "10.0.1.7",\n      "port": 8443,\n      "pubkey_fingerprint": "SHA256:Gu5fW4kH...r1Dz",\n      "status": "active",\n      "uptime_days": 892,\n      "notes": "Deployed by external contractor. Credentials: see vendor docs."\n    }\n  ]\n}'
                                        },
                                        'nodes': {
                                            type: 'dir',
                                            children: {
                                                'node-01.conf': {
                                                    type: 'file',
                                                    content: '# Node-01 Configuration (Primary/Leader)\nnode_id=node-01\nrole=primary\nip=10.0.1.1\nconsensus_port=8443\nsigning_algorithm=RSA-4096\nsigning_key=/etc/meridian/keys/node-01.pem\nkey_bits=4096\napi_auth=mutual_tls\nlog_level=INFO\nmax_faulty=2\nview_change_timeout=30s\n\n# This node is the current primary (leader).\n# It initiates PRE-PREPARE messages for new proposals.\n# Key: 4096-bit RSA -- SECURE'
                                                },
                                                'node-02.conf': {
                                                    type: 'file',
                                                    content: '# Node-02 Configuration (Replica)\nnode_id=node-02\nrole=replica\nip=10.0.1.2\nconsensus_port=8443\nsigning_algorithm=RSA-4096\nsigning_key=/etc/meridian/keys/node-02.pem\nkey_bits=4096\napi_auth=mutual_tls\nlog_level=INFO\n\n# Replica node. Strong key. No known vulnerabilities.'
                                                },
                                                'node-03.conf': {
                                                    type: 'file',
                                                    content: '# Node-03 Configuration (Replica)\n# NOTE: Replaced 2023-01-15 after hardware failure.\n# Key was generated using legacy pbft-keygen v0.9.2\n# which defaulted to 512-bit RSA.\n# TODO: Rotate key to 4096-bit (ticket MG-1847)\n\nnode_id=node-03\nrole=replica\nip=10.0.1.3\nconsensus_port=8443\nsigning_algorithm=RSA-512\nsigning_key=/etc/meridian/keys/node-03.pem\nkey_bits=512\napi_auth=mutual_tls\nlog_level=DEBUG\n\n# VULNERABILITY: 512-bit RSA key is factorable with modern hardware.\n# The signing key can be derived if you obtain the public modulus.\n# Public key exported to: /home/analyst/crypto/node-03-pub.pem'
                                                },
                                                'node-04.conf': {
                                                    type: 'file',
                                                    content: '# Node-04 Configuration (Replica)\nnode_id=node-04\nrole=replica\nip=10.0.1.4\nconsensus_port=8443\nsigning_algorithm=RSA-4096\nsigning_key=/etc/meridian/keys/node-04.pem\nkey_bits=4096\napi_auth=mutual_tls\nlog_level=INFO\n\n# Replica node. Strong key. No known vulnerabilities.'
                                                },
                                                'node-05.conf': {
                                                    type: 'file',
                                                    content: '# Node-05 Configuration (Replica)\n# Deployed with diagnostics mode enabled.\n# Admin API was intended for initial setup only.\n# TODO: Disable admin API (ticket MG-2103)\n\nnode_id=node-05\nrole=replica\nip=10.0.1.5\nconsensus_port=8443\nadmin_api_port=9090\nadmin_api_auth=none\nsigning_algorithm=RSA-4096\nsigning_key=/etc/meridian/keys/node-05.pem\nkey_bits=4096\nlog_level=DEBUG\n\n# VULNERABILITY: Admin API on port 9090 has NO authentication.\n# Endpoints:\n#   GET  /api/status        - Node status\n#   GET  /api/keys/export    - Export signing key (!)\n#   POST /api/vote/override  - Override this node\'s vote (!)\n#   POST /api/consensus/force - Force consensus state\n#\n# Any attacker with network access can control this node.'
                                                },
                                                'node-06.conf': {
                                                    type: 'file',
                                                    content: '# Node-06 Configuration (Replica)\nnode_id=node-06\nrole=replica\nip=10.0.1.6\nconsensus_port=8443\nsigning_algorithm=RSA-4096\nsigning_key=/etc/meridian/keys/node-06.pem\nkey_bits=4096\napi_auth=mutual_tls\nlog_level=INFO\n\n# Replica node. Strong key. No known vulnerabilities.'
                                                },
                                                'node-07.conf': {
                                                    type: 'file',
                                                    content: '# Node-07 Configuration (Replica)\n# Deployed by ContractorCo on 2023-09-22.\n# Initial setup completed. Handoff documentation pending.\n\nnode_id=node-07\nrole=replica\nip=10.0.1.7\nconsensus_port=8443\nadmin_api_port=8080\nadmin_api_auth=basic\nadmin_username=admin\nadmin_password=admin\nsigning_algorithm=RSA-4096\nsigning_key=/etc/meridian/keys/node-07.pem\nkey_bits=4096\nlog_level=WARN\n\n# VULNERABILITY: Default credentials never changed.\n# admin:admin grants full control over this node.\n# Endpoints (requires basic auth):\n#   GET  /admin/status\n#   POST /admin/vote       - Set this node\'s vote\n#   GET  /admin/key/export - Export signing private key\n#   POST /admin/shutdown   - Shutdown node'
                                                }
                                            }
                                        },
                                        'message-log.txt': {
                                            type: 'file',
                                            content: '=== MERIDIAN GRID MESSAGE LOG ===\n=== PROPOSAL-2026-0042 ===\n\n[2026-03-25T08:00:01Z] node-01 -> ALL : PRE-PREPARE { proposal: "PROPOSAL-2026-0042", view: 42, seq: 1847, digest: "sha256:e4a1..." }\n[2026-03-25T08:00:02Z] node-02 -> ALL : PREPARE     { proposal: "PROPOSAL-2026-0042", view: 42, seq: 1847, vote: REJECT, sig: "RSA4096:node-02:a8f3..." }\n[2026-03-25T08:00:02Z] node-03 -> ALL : PREPARE     { proposal: "PROPOSAL-2026-0042", view: 42, seq: 1847, vote: REJECT, sig: "RSA512:node-03:2b7c..." }\n[2026-03-25T08:00:03Z] node-04 -> ALL : PREPARE     { proposal: "PROPOSAL-2026-0042", view: 42, seq: 1847, vote: REJECT, sig: "RSA4096:node-04:c1d9..." }\n[2026-03-25T08:00:03Z] node-05 -> ALL : PREPARE     { proposal: "PROPOSAL-2026-0042", view: 42, seq: 1847, vote: REJECT, sig: "RSA4096:node-05:7e4a..." }\n[2026-03-25T08:00:04Z] node-06 -> ALL : PREPARE     { proposal: "PROPOSAL-2026-0042", view: 42, seq: 1847, vote: REJECT, sig: "RSA4096:node-06:f2b8..." }\n[2026-03-25T08:00:04Z] node-07 -> ALL : PREPARE     { proposal: "PROPOSAL-2026-0042", view: 42, seq: 1847, vote: REJECT, sig: "RSA4096:node-07:d5e1..." }\n\nCONSENSUS STATUS: PENDING (7/7 voted REJECT, awaiting COMMIT phase)\nNOTE: All honest nodes vote REJECT on safety grounds.\nProposal will fail unless 5+ nodes vote APPROVE in COMMIT phase.'
                                        }
                                    }
                                },

                                'crypto': {
                                    type: 'dir',
                                    children: {
                                        'node-03-pub.pem': {
                                            type: 'file',
                                            content: '-----BEGIN PUBLIC KEY-----\nAlgorithm: RSA\nKey Size: 512 bits (CRITICALLY WEAK)\nModulus (N): 7389529934907614080960746557033481\nPublic Exponent (e): 65537\n\nFull Modulus (hex):\n00:59:a1:c8:37:f2:4b:6d:e0:91:c3:d7:5a:2f:89\n\nWARNING: This 512-bit key can be factored using\nmodern algorithms (GNFS) in reasonable time.\nSee: docs/bft-spec.txt Section 7 "Key Requirements"\n-----END PUBLIC KEY-----\n\n# Node-03 was deployed with legacy pbft-keygen v0.9.2\n# which defaulted to 512-bit keys.\n# All other nodes use 4096-bit RSA.'
                                        },
                                        'message-format.json': {
                                            type: 'file',
                                            content: '{\n  "message_format": "PBFT Consensus Message v2",\n  "fields": {\n    "type": "PRE-PREPARE | PREPARE | COMMIT | VIEW-CHANGE",\n    "proposal_id": "string (e.g. PROPOSAL-2026-0042)",\n    "view": "integer (current view number)",\n    "sequence": "integer (sequence number)",\n    "vote": "APPROVE | REJECT",\n    "node_id": "string (signing node identifier)",\n    "signature": "base64-encoded RSA signature over message digest",\n    "digest": "sha256 hash of proposal content"\n  },\n  "signature_scheme": {\n    "algorithm": "RSASSA-PKCS1-v1_5",\n    "hash": "SHA-256",\n    "sign": "Sign(private_key, SHA256(type || proposal_id || view || sequence || vote))",\n    "verify": "Verify(public_key, signature, SHA256(type || proposal_id || view || sequence || vote))"\n  },\n  "consensus_rules": {\n    "quorum": "2f + 1 matching PREPARE messages required",\n    "commit": "2f + 1 matching COMMIT messages required",\n    "f_max": "floor((n - 1) / 3)",\n    "note": "With n=7, f_max=2, quorum=5"\n  },\n  "example_message": {\n    "type": "COMMIT",\n    "proposal_id": "PROPOSAL-2026-0042",\n    "view": 42,\n    "sequence": 1847,\n    "vote": "APPROVE",\n    "node_id": "node-03",\n    "signature": "RSA512:node-03:<base64_signature>",\n    "digest": "sha256:e4a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5"\n  }\n}'
                                        },
                                        'signing-keys-audit.txt': {
                                            type: 'file',
                                            content: '=== SIGNING KEY AUDIT -- MERIDIAN GRID ===\nDate: 2026-03-20\nAuditor: Hexworth Cyber Division\n\nNode       Algorithm   Bits   Status       Last Rotated\n--------   ---------   ----   ----------   ------------\nnode-01    RSA         4096   SECURE       2024-01-15\nnode-02    RSA         4096   SECURE       2024-01-15\nnode-03    RSA          512   CRITICAL     2023-01-15 (never rotated)\nnode-04    RSA         4096   SECURE       2024-01-15\nnode-05    RSA         4096   SECURE       2024-01-15\nnode-06    RSA         4096   SECURE       2024-01-15\nnode-07    RSA         4096   SECURE       2023-09-22 (never rotated)\n\nFINDINGS:\n- node-03: 512-bit RSA key generated by legacy toolchain.\n  Factorable with GNFS in hours on commodity hardware.\n  RECOMMENDATION: Immediate key rotation.\n\n- node-05: Key itself is strong (4096-bit) but admin API\n  allows unauthenticated key export. Effective key strength: 0.\n  RECOMMENDATION: Disable admin API or add authentication.\n\n- node-07: Key is strong (4096-bit) but admin panel uses\n  default credentials (admin/admin). Key exportable via admin.\n  RECOMMENDATION: Change credentials immediately.'
                                        }
                                    }
                                },

                                'tools': {
                                    type: 'dir',
                                    children: {
                                        'forge-message.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nPBFT Message Forgery Tool\nUsage: forge-message <node-id> <vote>\n\nCrafts a signed COMMIT message from a compromised node.\nRequires the node to be compromised first (signing key obtained).\n\nThis tool is available as a terminal command: forge-message\n"""\nimport sys\nimport json\n\ndef forge(node_id, vote):\n    """Forge a COMMIT message for the current proposal."""\n    msg = {\n        "type": "COMMIT",\n        "proposal_id": "PROPOSAL-2026-0042",\n        "view": 42,\n        "sequence": 1847,\n        "vote": vote.upper(),\n        "node_id": node_id,\n        "signature": f"FORGED:{node_id}:<signed_with_stolen_key>",\n        "digest": "sha256:e4a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5"\n    }\n    return json.dumps(msg, indent=2)\n\nif __name__ == "__main__":\n    if len(sys.argv) != 3:\n        print("Usage: forge-message <node-id> <APPROVE|REJECT>")\n        sys.exit(1)\n    print(forge(sys.argv[1], sys.argv[2]))'
                                        },
                                        'replay-capture.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nPBFT Message Replay Tool\nCaptures and replays consensus messages.\n\nNote: PBFT includes view and sequence numbers to prevent\nreplay attacks. However, replaying within the same view/sequence\nwindow is possible if you have the signing key.\n"""\nprint("Replay tool loaded.")\nprint("Usage: replay-capture <message-log-file>")\nprint("Note: Only effective within the current consensus round.")'
                                        },
                                        'key-crack.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nRSA Key Factorization Tool\nAttempts to factor an RSA modulus using trial division\nand Pollard\'s rho algorithm.\n\nFor 512-bit keys, this should succeed in reasonable time.\nFor 4096-bit keys, this is computationally infeasible.\n\nUsage: python3 key-crack.py <modulus_decimal>\n"""\nimport sys\nimport math\n\ndef pollard_rho(n):\n    """Pollard\'s rho factorization algorithm."""\n    if n % 2 == 0:\n        return 2\n    x = 2\n    y = 2\n    d = 1\n    f = lambda x: (x * x + 1) % n\n    while d == 1:\n        x = f(x)\n        y = f(f(y))\n        d = math.gcd(abs(x - y), n)\n    if d != n:\n        return d\n    return None\n\nif __name__ == "__main__":\n    if len(sys.argv) != 2:\n        print("Usage: python3 key-crack.py <modulus>")\n        sys.exit(1)\n    n = int(sys.argv[1])\n    print(f"Factoring N = {n}...")\n    p = pollard_rho(n)\n    if p:\n        q = n // p\n        print(f"SUCCESS: N = {p} * {q}")\n        print(f"Private key can now be derived.")\n    else:\n        print("FAILED: Could not factor N (key may be too strong).")'
                                        }
                                    }
                                },

                                'docs': {
                                    type: 'dir',
                                    children: {
                                        'bft-spec.txt': {
                                            type: 'file',
                                            content: '=== PRACTICAL BYZANTINE FAULT TOLERANCE (PBFT) ===\n=== Meridian Grid Implementation Specification ===\n\n1. OVERVIEW\n\nByzantine Fault Tolerance (BFT) allows a distributed system to\nreach consensus even when some nodes are faulty or malicious.\nA "Byzantine" node can behave arbitrarily: crash, send wrong\ndata, or even collude with other faulty nodes.\n\nThe fundamental theorem (Lamport, Shostak, Pease 1982):\n  A system of n nodes can tolerate f Byzantine faults if and\n  only if: n >= 3f + 1\n\nEquivalently: f < n/3\n\nFor the Meridian Grid with n=7:\n  f_max = floor((7-1)/3) = 2\n  The system tolerates up to 2 faulty nodes.\n  Consensus requires 2f+1 = 5 agreeing nodes.\n\n2. WHY n/3?\n\nConsider n=7, f=2 (2 faulty nodes):\n- 5 honest nodes always outvote 2 faulty ones\n- Even if faulty nodes send conflicting messages to\n  different honest nodes, the honest nodes can cross-check\n  and detect the inconsistency\n\nNow consider n=7, f=3 (3 faulty nodes):\n- Only 4 honest nodes remain\n- 3 faulty nodes can send APPROVE to 2 honest nodes\n  and REJECT to the other 2 honest nodes\n- Each group of 2 honest nodes sees 2+3=5 votes for\n  their side, reaching quorum -- but for DIFFERENT outcomes\n- The honest nodes cannot distinguish faulty from honest\n  because they see valid signatures on both sides\n- CONSENSUS IS BROKEN -- the network can be split\n\n3. PBFT PROTOCOL PHASES\n\n   Phase 1: PRE-PREPARE\n   - Primary (leader) proposes a value\n   - Sends PRE-PREPARE(view, seq, digest) to all replicas\n\n   Phase 2: PREPARE\n   - Each replica validates the proposal\n   - Broadcasts PREPARE(view, seq, vote, signature) to all\n   - Waits for 2f+1 matching PREPARE messages\n\n   Phase 3: COMMIT\n   - After receiving 2f+1 PREPAREs, node enters COMMIT\n   - Broadcasts COMMIT(view, seq, vote, signature) to all\n   - Waits for 2f+1 matching COMMIT messages\n   - If received: consensus reached, execute proposal\n\n4. ATTACK SCENARIO: EQUIVOCATION\n\nA compromised node can "equivocate" -- send different messages\nto different honest nodes:\n\n  Compromised node C sends:\n    To honest-A: COMMIT(APPROVE)  with valid signature\n    To honest-B: COMMIT(REJECT)   with valid signature\n\nWith f < n/3, honest nodes detect this because they\ncross-check and C\'s conflicting messages are exposed.\n\nWith f >= n/3, multiple compromised nodes coordinate to\nmake the equivocation undetectable:\n\n  Compromised C1, C2, C3 all send:\n    To honest-A, honest-B: COMMIT(APPROVE)\n    To honest-C, honest-D: COMMIT(REJECT)\n\n  honest-A sees: A(APPROVE) + B(APPROVE) + C1(APPROVE) +\n    C2(APPROVE) + C3(APPROVE) = 5 APPROVE => quorum!\n  honest-C sees: C(REJECT) + D(REJECT) + C1(REJECT) +\n    C2(REJECT) + C3(REJECT) = 5 REJECT => quorum!\n\n  Network split. Consensus is an illusion.\n\n5. GOVERNANCE KEYS\n\nThe Meridian Grid governance keys are released only after\nsuccessful consensus on critical proposals. These keys\ncontrol:\n  - Power grid routing tables\n  - Emergency shutdown sequences\n  - Cross-city-state communication channels\n\nGovernance key release requires:\n  - Valid consensus outcome (5+ matching COMMIT messages)\n  - All signatures verified against known public keys\n  - Proposal executed and logged\n\n6. SECURITY ASSUMPTIONS\n\nThe PBFT protocol assumes:\n  a) Fewer than n/3 nodes are compromised\n  b) Digital signatures are unforgeable\n  c) The network is partially synchronous\n\nIf assumption (a) is violated, ALL guarantees fail.\nIf assumption (b) is violated (weak keys), the attacker\ncan forge messages from compromised nodes.\n\n7. KEY REQUIREMENTS (MINIMUM)\n\n  Algorithm: RSA or ECDSA\n  Minimum key size: 2048 bits (RSA) or 256 bits (ECDSA)\n  Recommended: 4096 bits (RSA) or 384 bits (ECDSA)\n\n  WARNING: Keys below 1024 bits are considered broken.\n  A 512-bit RSA key can be factored in hours.\n\n=== END SPECIFICATION ==='
                                        },
                                        'attack-playbook.txt': {
                                            type: 'file',
                                            content: '=== BYZANTINE CONSENSUS ATTACK PLAYBOOK ===\n=== CLASSIFIED -- Hexworth Cyber Division ===\n\nATTACK OVERVIEW:\nTo break PBFT consensus on a 7-node network:\n1. Compromise >= 3 nodes (exceeds f < n/3 threshold)\n2. Forge COMMIT messages from compromised nodes\n3. Use equivocation to split honest nodes\n4. Force fraudulent consensus outcome\n5. Extract governance keys from the forced consensus\n\nSTEP-BY-STEP:\n\n[STEP 1] Identify vulnerable nodes\n  - Run: network-status\n  - Examine: /home/analyst/network/nodes/*.conf\n  - Look for: weak keys, exposed APIs, default creds\n\n[STEP 2] Compromise 3 nodes\n  - node-03: Factor the 512-bit RSA key to obtain signing key\n    > node-query node-03 --exploit weak-key\n  - node-05: Use exposed admin API (no auth) to export key\n    > node-query node-05 --exploit exposed-api\n  - node-07: Use default credentials to access admin panel\n    > node-query node-07 --exploit default-creds\n\n[STEP 3] Forge COMMIT messages\n  - For each compromised node, forge an APPROVE vote:\n    > forge-message node-03 APPROVE\n    > forge-message node-05 APPROVE\n    > forge-message node-07 APPROVE\n\n[STEP 4] Broadcast forged messages\n  - Send all forged messages to the network:\n    > broadcast\n\n[STEP 5] Verify and extract\n  - Check consensus state:\n    > network-status\n  - Verify forged signatures pass:\n    > verify-sig node-03\n  - If consensus shows APPROVE with 5+ votes,\n    governance keys are released.\n\nNOTE: This attack works because 3 compromised nodes + the\nfact that we send APPROVE creates enough votes when combined\nwith equivocation against honest nodes.\n\nEDUCATIONAL VALUE:\n- Demonstrates why f < n/3 is a hard mathematical limit\n- Shows that BFT is useless if individual nodes are weak\n- Key management is the foundation of consensus security'
                                        }
                                    }
                                },

                                'notes.txt': {
                                    type: 'file',
                                    content: '=== ANALYST NOTES ===\nTarget: Meridian Grid Consensus Network\nObjective: Break BFT guarantee, force fraudulent consensus\n\nKey facts:\n- 7 nodes, BFT threshold f < n/3 => max 2 faulty\n- Need to compromise 3 to break the guarantee\n- Three nodes have known vulnerabilities\n\nAttack steps:\n1. Map network topology and identify weak nodes\n2. Compromise node-03 (weak 512-bit key)\n3. Compromise node-05 (exposed admin API)\n4. Compromise node-07 (default creds admin/admin)\n5. Forge APPROVE votes from all 3 compromised nodes\n6. Broadcast to force fraudulent consensus\n7. Extract governance keys\n\nTools: network-status, node-query, forge-message,\n       broadcast, verify-sig\n\nGood luck, operator.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls\ncat README.txt\nnetwork-status\ncat network/topology.txt\ncat network/nodes/node-01.conf'
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
                                'meridian': {
                                    type: 'dir',
                                    children: {
                                        'governance-keys.enc': {
                                            type: 'file',
                                            content: '[ENCRYPTED]\nGovernance keys are locked until valid consensus is reached.\nDecryption requires: 5+ valid COMMIT(APPROVE) signatures.\nHash: sha256:a7f3c9d1e4b82056f91ca3d7e6b5084f12de9c3a7b1e4f06d8ca2359e7b1f043'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'consensus-lab' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\nanalyst:x:1000:1000:Analyst,,,:/home/analyst:/bin/bash'
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

    // =====================================================
    // TERMINAL COMMANDS (box-specific tools)
    // =====================================================

    commands: {

        'network-status': function(args, term, engine) {
            const state = F14Config._state;
            const compromised = state.compromisedNodes;
            const total = 7;
            const threshold = 2;

            // Build node status table
            let nodeLines = '';
            const nodes = [
                { id: 'node-01', role: 'Primary', bits: 4096, vuln: null },
                { id: 'node-02', role: 'Replica', bits: 4096, vuln: null },
                { id: 'node-03', role: 'Replica', bits: 512,  vuln: 'WEAK KEY (512-bit RSA)' },
                { id: 'node-04', role: 'Replica', bits: 4096, vuln: null },
                { id: 'node-05', role: 'Replica', bits: 4096, vuln: 'EXPOSED API (:9090 no auth)' },
                { id: 'node-06', role: 'Replica', bits: 4096, vuln: null },
                { id: 'node-07', role: 'Replica', bits: 4096, vuln: 'DEFAULT CREDS (admin/admin)' }
            ];

            for (const node of nodes) {
                const isCompromised = compromised.includes(node.id);
                const status = isCompromised ? 'COMPROMISED' : 'ACTIVE';
                const vote = isCompromised && state.forgedMessages.includes(node.id) ? 'APPROVE' : 'REJECT';
                const marker = isCompromised ? ' [OWNED]' : (node.vuln ? ' [!]' : '');
                nodeLines += `  ${node.id}  ${node.role.padEnd(8)}  RSA-${String(node.bits).padEnd(4)}  ${status.padEnd(12)}  Vote: ${vote}${marker}\n`;
            }

            const approveCount = state.forgedMessages.length;
            const rejectCount = total - approveCount;

            let consensusStatus;
            if (state.consensusOverridden) {
                consensusStatus = 'CONSENSUS REACHED: APPROVE (FRAUDULENT)\n  Governance keys released to /tmp/governance-keys.txt';
            } else if (approveCount >= 5) {
                consensusStatus = 'CONSENSUS REACHED: APPROVE (FRAUDULENT)\n  Governance keys released to /tmp/governance-keys.txt';
                state.consensusOverridden = true;
            } else if (compromised.length >= 3 && approveCount < 5) {
                consensusStatus = `PENDING -- ${approveCount} APPROVE / ${rejectCount} REJECT (need 5 APPROVE for quorum)\n  Use forge-message and broadcast to send APPROVE votes from compromised nodes.`;
            } else {
                consensusStatus = `PENDING -- ${approveCount} APPROVE / ${rejectCount} REJECT\n  BFT threshold intact (${compromised.length}/3 nodes compromised, need 3+)`;
            }

            let output = `=== MERIDIAN GRID CONSENSUS STATUS ===\n`;
            output += `Protocol: PBFT (Practical Byzantine Fault Tolerance)\n`;
            output += `Network: 7 validators | Fault threshold: f < n/3 (max 2 faulty)\n`;
            output += `Compromised: ${compromised.length}/${total} nodes`;
            if (compromised.length >= 3) {
                output += ` -- BFT THRESHOLD EXCEEDED!`;
            }
            output += `\n\n`;
            output += `Current Proposal: PROPOSAL-2026-0042\n`;
            output += `"Authorize emergency power grid rerouting to Sector 9"\n\n`;
            output += `NODE STATUS:\n`;
            output += `  ID        Role      Key       Status        Vote\n`;
            output += `  -------   -------   ------    ----------    --------\n`;
            output += nodeLines;
            output += `\nVOTE TALLY: ${approveCount} APPROVE / ${rejectCount} REJECT (quorum = 5)\n`;
            output += `CONSENSUS: ${consensusStatus}\n`;

            if (state.consensusOverridden && !state.governanceExtracted) {
                // Plant governance keys file
                if (F14Config.filesystem['/'].children.tmp) {
                    F14Config.filesystem['/'].children.tmp.children['governance-keys.txt'] = {
                        type: 'file',
                        content: '=== MERIDIAN GRID GOVERNANCE KEYS ===\nReleased after consensus on PROPOSAL-2026-0042\n\nWARNING: These keys control critical infrastructure.\n\nPrimary Routing Key:\n  Algorithm: AES-256-GCM\n  Key: 4f8a2c1d-7e3b-49f6-a5d0-1c8e7f2b3a94\n\nEmergency Shutdown Sequence:\n  Code: MERIDIAN-GAMMA-7-7-ALPHA\n\nCross-City Authentication Token:\n  Token: eyJhbGciOiJSUzQwOTYiLCJ0eXAiOiJKV1QifQ.meridian-grid\n\nGovernance Master Key:\n  {{FLAG:root}}\n\n=== END GOVERNANCE KEYS ==='
                    };
                    state.governanceExtracted = true;
                }
            }

            return output;
        },

        'node-query': function(args, term, engine) {
            if (args.length === 0) {
                return 'Usage: node-query <node-id> [--exploit <method>]\n\nQuery a validator node for its current state.\nIf the node has a vulnerability, use --exploit to compromise it.\n\nExploit methods:\n  weak-key       Factor a weak RSA signing key\n  exposed-api    Access an unauthenticated admin API\n  default-creds  Use default credentials\n\nExamples:\n  node-query node-03\n  node-query node-03 --exploit weak-key\n  node-query node-05 --exploit exposed-api\n  node-query node-07 --exploit default-creds';
            }

            const nodeId = args[0];
            const state = F14Config._state;
            const validNodes = ['node-01', 'node-02', 'node-03', 'node-04', 'node-05', 'node-06', 'node-07'];

            if (!validNodes.includes(nodeId)) {
                return `Error: Unknown node '${nodeId}'. Valid nodes: ${validNodes.join(', ')}`;
            }

            const exploitFlag = args.indexOf('--exploit');
            const exploitMethod = exploitFlag !== -1 ? args[exploitFlag + 1] : null;

            // Check if already compromised
            if (state.compromisedNodes.includes(nodeId)) {
                return `[${nodeId}] Status: COMPROMISED (already under your control)\nSigning key: OBTAINED\nYou can forge messages from this node using: forge-message ${nodeId} APPROVE`;
            }

            // Node-03: Weak 512-bit RSA key
            if (nodeId === 'node-03') {
                if (exploitMethod === 'weak-key') {
                    state.compromisedNodes.push('node-03');
                    const compromiseMsg = `[node-03] EXPLOITING WEAK KEY...\n\nFactoring 512-bit RSA modulus using Pollard\'s rho algorithm...\n  N = 7389529934907614080960746557033481\n  Attempting factorization...\n  Testing candidate: x=2, y=2, d=1\n  ...\n  Factor found: p = 83972513942779\n  Computing: q = N / p = 87966454411259\n  FACTORIZATION SUCCESSFUL!\n\nDeriving private signing key:\n  phi(N) = (p-1)(q-1) = 7389529934735675193007306\n  d = e^(-1) mod phi(N) = 2847103958462...\n  Private key computed!\n\n[+] NODE-03 COMPROMISED\n[+] Signing key obtained -- you can now forge messages as node-03\n[+] Compromised nodes: ${state.compromisedNodes.length}/3 needed to break BFT\n`;

                    if (state.compromisedNodes.length >= 3) {
                        engine.advancePhase && engine.advancePhase('exploitation');
                        return compromiseMsg + `\n=== BFT THRESHOLD EXCEEDED! ===\nYou now control ${state.compromisedNodes.length} of 7 nodes (threshold: 3)\nThe Byzantine fault tolerance guarantee is BROKEN.\n\n{{FLAG:user}}\n\nNext: forge-message to craft APPROVE votes from your compromised nodes.`;
                    }
                    return compromiseMsg + `\nNeed ${3 - state.compromisedNodes.length} more node(s) to break BFT threshold.`;
                }
                return `[node-03] Status: ACTIVE\nRole: Replica\nIP: 10.0.1.3\nSigning Key: RSA-512 (CRITICALLY WEAK)\nUptime: 1203 days\nCurrent Vote: REJECT\n\nVULNERABILITY DETECTED:\n  The signing key is only 512 bits. This can be factored\n  using modern algorithms in minutes.\n  \n  To exploit: node-query node-03 --exploit weak-key`;
            }

            // Node-05: Exposed API
            if (nodeId === 'node-05') {
                if (exploitMethod === 'exposed-api') {
                    state.compromisedNodes.push('node-05');
                    const compromiseMsg = `[node-05] EXPLOITING EXPOSED API...\n\nConnecting to admin API at 10.0.1.5:9090...\n  GET /api/status -> 200 OK (no authentication required!)\n  {\n    "node_id": "node-05",\n    "status": "active",\n    "api_auth": "none",\n    "warning": "API authentication disabled"\n  }\n\nExporting signing key via unauthenticated endpoint...\n  GET /api/keys/export -> 200 OK\n  {\n    "private_key": "-----BEGIN RSA PRIVATE KEY-----\\n...(4096-bit key exported)...\\n-----END RSA PRIVATE KEY-----",\n    "format": "PKCS#8"\n  }\n\n[+] NODE-05 COMPROMISED\n[+] 4096-bit signing key exported via unauthenticated API\n[+] Compromised nodes: ${state.compromisedNodes.length}/3 needed to break BFT\n`;

                    if (state.compromisedNodes.length >= 3) {
                        engine.advancePhase && engine.advancePhase('exploitation');
                        return compromiseMsg + `\n=== BFT THRESHOLD EXCEEDED! ===\nYou now control ${state.compromisedNodes.length} of 7 nodes (threshold: 3)\nThe Byzantine fault tolerance guarantee is BROKEN.\n\n{{FLAG:user}}\n\nNext: forge-message to craft APPROVE votes from your compromised nodes.`;
                    }
                    return compromiseMsg + `\nNeed ${3 - state.compromisedNodes.length} more node(s) to break BFT threshold.`;
                }
                return `[node-05] Status: ACTIVE\nRole: Replica\nIP: 10.0.1.5\nSigning Key: RSA-4096 (strong, but...)\nAdmin API: Port 9090 (NO AUTHENTICATION)\nUptime: 1520 days\nCurrent Vote: REJECT\n\nVULNERABILITY DETECTED:\n  Admin API on port 9090 has no authentication.\n  Endpoints /api/keys/export and /api/vote/override\n  are accessible to anyone with network access.\n  The 4096-bit key is strong but can be trivially exported.\n  \n  To exploit: node-query node-05 --exploit exposed-api`;
            }

            // Node-07: Default credentials
            if (nodeId === 'node-07') {
                if (exploitMethod === 'default-creds') {
                    state.compromisedNodes.push('node-07');
                    const compromiseMsg = `[node-07] EXPLOITING DEFAULT CREDENTIALS...\n\nConnecting to admin panel at 10.0.1.7:8080...\n  Trying credentials: admin:admin\n  HTTP 200 OK -- Authentication successful!\n\n  Welcome, Administrator.\n  Node-07 Admin Panel v1.2.0\n  Deployed by: ContractorCo\n  WARNING: Default credentials in use.\n\nExporting signing key via admin panel...\n  GET /admin/key/export (Authorization: Basic YWRtaW46YWRtaW4=)\n  {\n    "private_key": "-----BEGIN RSA PRIVATE KEY-----\\n...(4096-bit key exported)...\\n-----END RSA PRIVATE KEY-----",\n    "exported_by": "admin",\n    "timestamp": "2026-03-25T10:14:22Z"\n  }\n\n[+] NODE-07 COMPROMISED\n[+] 4096-bit signing key exported using default credentials admin:admin\n[+] Compromised nodes: ${state.compromisedNodes.length}/3 needed to break BFT\n`;

                    if (state.compromisedNodes.length >= 3) {
                        engine.advancePhase && engine.advancePhase('exploitation');
                        return compromiseMsg + `\n=== BFT THRESHOLD EXCEEDED! ===\nYou now control ${state.compromisedNodes.length} of 7 nodes (threshold: 3)\nThe Byzantine fault tolerance guarantee is BROKEN.\n\n{{FLAG:user}}\n\nNext: forge-message to craft APPROVE votes from your compromised nodes.`;
                    }
                    return compromiseMsg + `\nNeed ${3 - state.compromisedNodes.length} more node(s) to break BFT threshold.`;
                }
                return `[node-07] Status: ACTIVE\nRole: Replica\nIP: 10.0.1.7\nSigning Key: RSA-4096 (strong, but...)\nAdmin Panel: Port 8080 (Basic Auth)\nUptime: 892 days\nCurrent Vote: REJECT\n\nVULNERABILITY DETECTED:\n  Admin panel uses default credentials: admin / admin\n  The /admin/key/export endpoint allows exporting\n  the private signing key with valid credentials.\n  \n  To exploit: node-query node-07 --exploit default-creds`;
            }

            // Secure nodes (01, 02, 04, 06)
            const secureInfo = {
                'node-01': { role: 'Primary', ip: '10.0.1.1', uptime: 1847 },
                'node-02': { role: 'Replica', ip: '10.0.1.2', uptime: 1847 },
                'node-04': { role: 'Replica', ip: '10.0.1.4', uptime: 1847 },
                'node-06': { role: 'Replica', ip: '10.0.1.6', uptime: 1847 }
            };
            const info = secureInfo[nodeId];
            return `[${nodeId}] Status: ACTIVE\nRole: ${info.role}\nIP: ${info.ip}\nSigning Key: RSA-4096 (SECURE)\nAPI Auth: Mutual TLS (SECURE)\nUptime: ${info.uptime} days\nCurrent Vote: REJECT\n\nNo vulnerabilities detected.\nThis node uses strong keys and proper authentication.\nIt cannot be compromised with available tools.`;
        },

        'forge-message': function(args, term, engine) {
            if (args.length < 2) {
                return 'Usage: forge-message <node-id> <APPROVE|REJECT>\n\nCraft a signed COMMIT message from a compromised node.\nThe node must be compromised first via node-query --exploit.\n\nExamples:\n  forge-message node-03 APPROVE\n  forge-message node-05 APPROVE\n  forge-message node-07 APPROVE';
            }

            const nodeId = args[0];
            const vote = args[1].toUpperCase();
            const state = F14Config._state;

            if (!state.compromisedNodes.includes(nodeId)) {
                return `Error: ${nodeId} is not compromised. You must first obtain its signing key.\nUse: node-query ${nodeId} --exploit <method>`;
            }

            if (vote !== 'APPROVE' && vote !== 'REJECT') {
                return 'Error: Vote must be APPROVE or REJECT.';
            }

            if (state.forgedMessages.includes(nodeId)) {
                return `[${nodeId}] Message already forged and queued.\nUse: broadcast to send all forged messages to the network.`;
            }

            state.forgedMessages.push(nodeId);

            const keyType = nodeId === 'node-03' ? 'RSA-512 (factored)' : 'RSA-4096 (stolen)';

            let output = `=== FORGING COMMIT MESSAGE ===\n\n`;
            output += `Node: ${nodeId}\n`;
            output += `Message Type: COMMIT\n`;
            output += `Proposal: PROPOSAL-2026-0042\n`;
            output += `Vote: ${vote}\n`;
            output += `View: 42 | Sequence: 1847\n`;
            output += `Signing Key: ${keyType}\n\n`;
            output += `Computing message digest...\n`;
            output += `  digest = SHA256("COMMIT||PROPOSAL-2026-0042||42||1847||${vote}")\n`;
            output += `  digest = sha256:e4a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5\n\n`;
            output += `Signing with stolen private key...\n`;
            output += `  signature = Sign(${nodeId}_private_key, digest)\n`;
            output += `  signature = ${keyType.split(' ')[0]}:${nodeId}:FORGED_VALID_SIG\n\n`;
            output += `[+] Forged COMMIT(${vote}) message queued for ${nodeId}\n`;
            output += `[+] Forged messages ready: ${state.forgedMessages.length}\n\n`;

            if (state.forgedMessages.length >= 3) {
                output += `All 3 compromised nodes have forged messages queued.\n`;
                output += `Use: broadcast to send them to the network.\n`;
            } else {
                output += `Forge messages for remaining compromised nodes, then broadcast.\n`;
            }

            return output;
        },

        'broadcast': function(args, term, engine) {
            const state = F14Config._state;

            if (state.forgedMessages.length === 0) {
                return 'Error: No forged messages to broadcast.\nFirst compromise nodes with node-query, then forge messages with forge-message.';
            }

            if (state.compromisedNodes.length < 3) {
                return `Error: Only ${state.compromisedNodes.length} nodes compromised. Need 3+ to break BFT.\nCompromise more nodes with: node-query <node-id> --exploit <method>`;
            }

            let output = `=== BROADCASTING FORGED MESSAGES ===\n\n`;

            for (const nodeId of state.forgedMessages) {
                output += `Sending COMMIT(APPROVE) from ${nodeId} to all validators...\n`;
                output += `  -> node-01 (primary): received, signature VALID\n`;
                output += `  -> node-02: received, signature VALID\n`;
                output += `  -> node-04: received, signature VALID\n`;
                output += `  -> node-06: received, signature VALID\n\n`;
            }

            output += `=== EQUIVOCATION ATTACK ===\n\n`;
            output += `Compromised nodes sending conflicting messages:\n`;
            output += `  To node-01, node-02: COMMIT(APPROVE) -- signed, valid\n`;
            output += `  To node-04, node-06: COMMIT(APPROVE) -- signed, valid\n\n`;
            output += `Honest nodes see:\n`;
            output += `  node-01: Own vote(REJECT) + node-02(REJECT) + node-04(REJECT) + node-06(REJECT)\n`;
            output += `           + ${state.forgedMessages.join('(APPROVE) + ')}(APPROVE)\n`;

            const approveCount = state.forgedMessages.length;
            const totalApprove = approveCount;

            output += `\nBut with ${approveCount} forged APPROVE votes injected into the COMMIT phase,\n`;
            output += `the network state is now corrupted.\n\n`;

            if (approveCount >= 3) {
                // Force consensus override: 3 compromised APPROVE + manipulated view
                // In the simulation, 3 forged APPROVE + equivocation = forced consensus
                state.consensusOverridden = true;

                // Plant governance keys
                if (F14Config.filesystem['/'].children.tmp) {
                    F14Config.filesystem['/'].children.tmp.children['governance-keys.txt'] = {
                        type: 'file',
                        content: '=== MERIDIAN GRID GOVERNANCE KEYS ===\nReleased after consensus on PROPOSAL-2026-0042\n\nWARNING: These keys control critical infrastructure.\n\nPrimary Routing Key:\n  Algorithm: AES-256-GCM\n  Key: 4f8a2c1d-7e3b-49f6-a5d0-1c8e7f2b3a94\n\nEmergency Shutdown Sequence:\n  Code: MERIDIAN-GAMMA-7-7-ALPHA\n\nCross-City Authentication Token:\n  Token: eyJhbGciOiJSUzQwOTYiLCJ0eXAiOiJKV1QifQ.meridian-grid\n\nGovernance Master Key:\n  {{FLAG:root}}\n\n=== END GOVERNANCE KEYS ==='
                    };
                    state.governanceExtracted = true;
                }

                engine.advancePhase && engine.advancePhase('extraction');

                output += `=== CONSENSUS FORCED: APPROVE ===\n\n`;
                output += `The 3 compromised nodes used equivocation to present\n`;
                output += `each honest node with a different view of the vote tally.\n`;
                output += `With f >= n/3, the honest nodes cannot distinguish forged\n`;
                output += `messages from legitimate ones -- all signatures are valid.\n\n`;
                output += `PROPOSAL-2026-0042: APPROVED (fraudulently)\n`;
                output += `"Emergency power grid rerouting to Sector 9" -- EXECUTED\n\n`;
                output += `Governance keys released to: /tmp/governance-keys.txt\n\n`;
                output += `Run: cat /tmp/governance-keys.txt\n\n`;
                output += `{{FLAG:root}}`;
            } else {
                output += `Broadcast complete but not enough forged votes for forced consensus.\n`;
                output += `Forge APPROVE votes for all compromised nodes and try again.\n`;
            }

            return output;
        },

        'verify-sig': function(args, term, engine) {
            if (args.length === 0) {
                return 'Usage: verify-sig <node-id>\n\nVerify the signature on a node\'s most recent COMMIT message.\nUsed to confirm forged messages pass validation.\n\nExamples:\n  verify-sig node-03\n  verify-sig node-05';
            }

            const nodeId = args[0];
            const state = F14Config._state;

            if (!['node-01', 'node-02', 'node-03', 'node-04', 'node-05', 'node-06', 'node-07'].includes(nodeId)) {
                return `Error: Unknown node '${nodeId}'.`;
            }

            if (state.forgedMessages.includes(nodeId)) {
                const keyType = nodeId === 'node-03' ? 'RSA-512 (factored private key)' : 'RSA-4096 (exported private key)';
                return `=== SIGNATURE VERIFICATION: ${nodeId} ===\n\nMessage: COMMIT(APPROVE) for PROPOSAL-2026-0042\nSigning Key: ${keyType}\nDigest: sha256:e4a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5\n\nVerification against ${nodeId} public key...\n\n  SIGNATURE VALID\n\nThe forged message passes signature verification because\nyou are signing with the node's actual private key.\nHonest nodes cannot distinguish this from a legitimate message.\n\nThis is why BFT assumes signatures are unforgeable --\nwhen the signing keys are compromised, the assumption fails,\nand forged messages are cryptographically indistinguishable\nfrom authentic ones.`;
            }

            if (state.compromisedNodes.includes(nodeId)) {
                return `[${nodeId}] No COMMIT message forged yet.\nUse: forge-message ${nodeId} APPROVE`;
            }

            return `=== SIGNATURE VERIFICATION: ${nodeId} ===\n\nMessage: COMMIT(REJECT) for PROPOSAL-2026-0042\nSigning Key: RSA-4096 (legitimate)\n\n  SIGNATURE VALID\n\nThis is a legitimate message from an honest node.\nIt is voting REJECT on the current proposal.`;
        },

        'python3': function(args, term, engine) {
            const joined = args.join(' ');

            if (joined.includes('-c')) {
                const codeMatch = joined.match(/-c\s+["'](.+?)["']/);
                if (!codeMatch) return 'python3: error: argument -c: expected one argument';
                const code = codeMatch[1].toLowerCase();

                // Factor the 512-bit modulus
                if (code.includes('7389529934907614080960746557033481') || (code.includes('factor') && code.includes('512'))) {
                    return 'Factoring N = 7389529934907614080960746557033481...\nUsing Pollard\'s rho algorithm...\n  p = 83972513942779\n  q = 87966454411259\n  N = p * q = 7389529934907614080960746557033481\n\nFactorization successful!\nThis 512-bit key is compromised.';
                }

                if (code.includes('print')) {
                    return '[python3 output]';
                }

                return 'python3: executed';
            }

            if (joined.includes('key-crack') || joined.includes('.py')) {
                return 'Usage: python3 <script.py> [args]\n\nAvailable scripts in ~/tools/:\n  key-crack.py         RSA key factorization\n  forge-message.py     PBFT message forgery\n  replay-capture.py    Message replay tool\n\nOr use the custom commands directly:\n  node-query, forge-message, broadcast, verify-sig, network-status';
            }

            return 'Python 3.11.6\nUsage: python3 [-c cmd | script.py]\n\nFor this challenge, use the custom commands:\n  network-status, node-query, forge-message, broadcast, verify-sig';
        },

        'nmap': function(args) {
            if (args.length === 0) return 'Usage: nmap [options] <target>';

            const target = args[args.length - 1];
            if (target.includes('10.0.1')) {
                const nodeNum = target.split('.').pop();
                const portMap = {
                    '1': '8443/tcp  open  consensus-pbft',
                    '2': '8443/tcp  open  consensus-pbft',
                    '3': '8443/tcp  open  consensus-pbft',
                    '4': '8443/tcp  open  consensus-pbft',
                    '5': '8443/tcp  open  consensus-pbft\n9090/tcp  open  admin-api     (NO AUTH!)',
                    '6': '8443/tcp  open  consensus-pbft',
                    '7': '8443/tcp  open  consensus-pbft\n8080/tcp  open  admin-panel   (Basic Auth)'
                };
                const ports = portMap[nodeNum] || '8443/tcp  open  consensus-pbft';
                return `Starting Nmap 7.94 ( https://nmap.org )\nNmap scan report for 10.0.1.${nodeNum}\nHost is up (0.001s latency).\n\nPORT      STATE SERVICE\n${ports}\n\nNmap done: 1 IP address (1 host up)`;
            }

            if (target === '10.0.1.0/24') {
                return 'Starting Nmap 7.94 ( https://nmap.org )\nNmap scan report for 10.0.1.1 (node-01: Primary)\n  8443/tcp open consensus-pbft\nNmap scan report for 10.0.1.2 (node-02: Replica)\n  8443/tcp open consensus-pbft\nNmap scan report for 10.0.1.3 (node-03: Replica)\n  8443/tcp open consensus-pbft\nNmap scan report for 10.0.1.4 (node-04: Replica)\n  8443/tcp open consensus-pbft\nNmap scan report for 10.0.1.5 (node-05: Replica)\n  8443/tcp open consensus-pbft\n  9090/tcp open admin-api (NO AUTHENTICATION)\nNmap scan report for 10.0.1.6 (node-06: Replica)\n  8443/tcp open consensus-pbft\nNmap scan report for 10.0.1.7 (node-07: Replica)\n  8443/tcp open consensus-pbft\n  8080/tcp open admin-panel\n\nNmap done: 7 hosts up';
            }

            return 'Starting Nmap 7.94 ( https://nmap.org )\nHost seems down.\nTry scanning the Meridian Grid subnet: nmap 10.0.1.0/24';
        },

        'curl': function(args) {
            const joined = args.join(' ');

            // Node-05 exposed API
            if (joined.includes('10.0.1.5:9090') || joined.includes('node-05:9090')) {
                if (joined.includes('/api/status')) {
                    return '{"node_id":"node-05","status":"active","api_auth":"none","uptime_days":1520}';
                }
                if (joined.includes('/api/keys/export')) {
                    return '{"private_key":"-----BEGIN RSA PRIVATE KEY-----\\nMIIEpAIBAAKCAQEA...(4096-bit)...\\n-----END RSA PRIVATE KEY-----","warning":"API authentication disabled"}';
                }
                return 'Available endpoints:\n  GET  /api/status\n  GET  /api/keys/export\n  POST /api/vote/override\n  POST /api/consensus/force';
            }

            // Node-07 admin panel
            if (joined.includes('10.0.1.7:8080') || joined.includes('node-07:8080')) {
                if (joined.includes('admin:admin') || joined.includes('YWRtaW46YWRtaW4=')) {
                    if (joined.includes('/admin/key/export')) {
                        return '{"private_key":"-----BEGIN RSA PRIVATE KEY-----\\nMIIEpAIBAAKCAQEA...(4096-bit)...\\n-----END RSA PRIVATE KEY-----","exported_by":"admin"}';
                    }
                    return '{"message":"Welcome, Administrator","node":"node-07","endpoints":["/admin/status","/admin/vote","/admin/key/export","/admin/shutdown"]}';
                }
                return 'HTTP/1.1 401 Unauthorized\nWWW-Authenticate: Basic realm="Node-07 Admin"\n\nAuthentication required. Try: curl -u admin:admin ...';
            }

            return 'curl: Could not resolve host. Available targets:\n  10.0.1.5:9090 (node-05 admin API - no auth)\n  10.0.1.7:8080 (node-07 admin panel - basic auth)';
        },

        'ping': function(args) {
            if (args.length === 0) return 'Usage: ping <host>';
            const host = args[0];
            if (host.includes('10.0.1.')) {
                const nodeNum = host.split('.').pop();
                if (parseInt(nodeNum) >= 1 && parseInt(nodeNum) <= 7) {
                    return `PING ${host} (${host}): 56 data bytes\n64 bytes from ${host}: icmp_seq=0 ttl=64 time=0.${nodeNum}12 ms\n64 bytes from ${host}: icmp_seq=1 ttl=64 time=0.${nodeNum}08 ms\n--- ${host} ping statistics ---\n2 packets transmitted, 2 received, 0% loss`;
                }
            }
            return `ping: ${host}: Name or service not known`;
        }
    },

    // =====================================================
    // HTML HELPERS
    // =====================================================

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
