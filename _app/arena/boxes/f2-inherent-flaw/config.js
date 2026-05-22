/* ============================================================
   CTF ARENA — Box F2: The Inherent Flaw
   Supply Chain Backdoor — Formal Verification Bypass
   Config: SolarWinds-style supply chain compromise with
   formal verification analysis, build pipeline forensics,
   signing key analysis, binary diffing, C2 extraction
   ============================================================ */

const F2Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Inherent Flaw',
    subtitle: 'Supply Chain Backdoor — Formal Verification Bypass',
    difficulty: 'Advanced',
    accent: '#dc2626',
    storageKey: 'hexworth_ctf_f2',
    registryId: 'f2-inherent-flaw',
    trackerKey: 'ctf_f2',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Pipeline Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Examine the software update pipeline. Review build manifests, signing certificates, and release artifacts for anomalies.',
            requiredFlags: [],
            mitre: ['T1195.002', 'T1588.001'],
            unlocks: ['analysis'],
            locked: false
        },
        {
            id: 'analysis',
            name: 'Binary Analysis',
            icon: '\uD83E\uddEC',
            description: 'Diff clean and deployed builds. Identify the injected backdoor component and trace its insertion point in the build pipeline.',
            requiredFlags: [],
            mitre: ['T1027', 'T1036.005'],
            unlocks: ['exploitation'],
            locked: true
        },
        {
            id: 'exploitation',
            name: 'Verification Bypass',
            icon: '\uD83D\uDD13',
            description: 'Analyze the formal verification proofs. Discover the incomplete coverage that allowed the backdoor to survive verification.',
            requiredFlags: ['user'],
            mitre: ['T1553.002', 'T1195.002'],
            unlocks: ['extraction'],
            locked: true
        },
        {
            id: 'extraction',
            name: 'C2 Extraction',
            icon: '\uD83D\uDCC2',
            description: 'Trace the backdoor\'s command-and-control callback. Extract the exfiltrated data and recover the architect\'s signature.',
            requiredFlags: ['root'],
            mitre: ['T1071.001', 'T1041'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // TUTORIAL MODE
    // ═══════════════════════════════════════════════════════

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Examine the build manifest',
                tip: 'Start by reviewing the pipeline. Run: cat /home/analyst/pipeline/build_manifest.json',
                trigger: { event: 'command', match: { cmd: 'contains:build_manifest' } }
            },
            {
                title: 'Compare release hashes',
                tip: 'Something changed between builds. Run: hashverify /home/analyst/releases/',
                trigger: { event: 'command', match: { cmd: 'contains:hashverify' } }
            },
            {
                title: 'Diff the binaries',
                tip: 'Find what was injected. Run: bindiff /home/analyst/releases/v2.4.0-clean.bin /home/analyst/releases/v2.4.0-release.bin',
                trigger: { event: 'command', match: { cmd: 'contains:bindiff' } }
            },
            {
                title: 'Submit the user flag',
                tip: 'You have identified the backdoored component. Submit the user flag via the Flag panel.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Extract the C2 callback',
                tip: 'Trace the backdoor to its C2. Run: c2extract /home/analyst/releases/v2.4.0-release.bin',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (SY0-701)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '2.3', description: 'Explain the importance of application security concepts — Supply chain risk assessment', skill: 'Build Pipeline Integrity Verification' },
            { flagId: 'user', objective: '1.2', description: 'Given a scenario, analyze indicators of compromise — Binary anomaly detection', skill: 'Binary Diff Analysis' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks — C2 beacon identification', skill: 'C2 Callback Extraction' },
            { flagId: 'root', objective: '2.3', description: 'Explain the importance of application security concepts — Code signing and integrity verification', skill: 'Formal Verification Gap Analysis' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Confederacy DFIR Workstation BIOS v7.1.3',
            'Initializing secure environment...',
            'Memory Test: 32768 MB OK',
            'Detecting drives... /dev/nvme0n1 (1TB NVMe)',
            'TPM 2.0: Present and enabled',
            'Secure Boot: ENABLED',
            'IOMMU: Active',
            'Loading forensic environment...'
        ],
        grubEntries: [
            'DFIR Linux 6.8 (Forensic Mode)',
            'DFIR Linux 6.8 (Recovery)',
            'Hardware Diagnostics'
        ],
        loginUser: 'analyst'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal', icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',  icon: '\uD83C\uDF10', app: 'browser' },
            { id: 'notes',    label: 'Notes',    icon: '\uD83D\uDCDD', app: 'notes' },
            { id: 'hints',    label: 'Hints',    icon: '\uD83D\uDCA1', app: 'hints' },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9', app: 'flags' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'analyst',
        hostname: 'dfir-ws01',
        startDir: '/home/analyst',
        welcome: 'DFIR Linux 6.8.0-forensic #1 SMP\nConfederacy Incident Response Division\n\nType \'help\' for available commands.\n\n*** PRIORITY ALERT ***\nSuspected supply chain compromise in Foresight SecureUpdate v2.4.0\nEvidence preserved in /home/analyst/pipeline/ and /home/analyst/releases/\nFormal verification artifacts in /home/analyst/verification/\n'
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', points: 100 },
        { id: 'root', points: 200 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
        minScore: 0,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 },
        timeBonusThreshold: 2400
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start with the build manifest. Compare the listed SHA-256 hashes for v2.4.0-clean.bin and v2.4.0-release.bin. They should match if the pipeline is clean.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Use bindiff to compare the clean and release binaries. Look for injected function calls that were not in the original source. The backdoor hides in the telemetry module.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The formal verification only proves properties about state transitions in NORMAL mode. Check verification_proof.v -- it never covers the DIAG_OVERRIDE state. That is the gap the backdoor exploits.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Run c2extract on the release binary. The backdoor encodes C2 callbacks as DNS TXT queries to update-telemetry.foresight-cdn.net. The exfiltrated data contains the root flag.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Confederacy\'s critical infrastructure runs on Foresight SecureUpdate -- a formally verified software distribution platform trusted by every sector. Three days ago, automated monitoring flagged anomalous DNS queries from systems that had just updated to v2.4.0. The update was signed, the hashes matched the public manifest, and the formal verification proofs all passed. But something is very wrong. Your mission: find the inherent flaw.',

        scenario: 'The Architects of Foresight designed PROVABLY-SECURE-COMPONENT-01 as the crown jewel of the Confederacy\'s defense infrastructure. Every release passes through a formal verification engine that mathematically proves the absence of vulnerabilities. The proofs are public. The signing keys are HSM-bound. The build pipeline runs in hermetic containers.\n\nBut a dissident faction -- the Silent Architects -- found something the proofs don\'t cover. They infiltrated the build pipeline and injected a backdoor so subtle it survives formal verification. The verification proofs are technically correct: they prove every property they claim to prove. The problem is what they don\'t claim.\n\nThe backdoor exploits an unverified state transition -- a diagnostic override mode that the proofs never mention. When triggered by a specific DNS beacon pattern, the component enters this phantom state and begins exfiltrating encryption keys via DNS TXT records disguised as telemetry.\n\nThis is not a bug. It is an architectural flaw -- inherent, unpatchable without a full redesign. The Silent Architects call it their "signature."',

        outro: 'The Inherent Flaw is exposed. The formally verified proofs were never wrong -- they simply never covered the diagnostic override state that the Silent Architects weaponized. Every property proven true remains true. But the unproven properties are where the backdoor lives.\n\nPatching this requires redesigning the entire state machine and re-verifying from scratch -- months of work during which the Confederacy\'s infrastructure runs unprotected. The Silent Architects knew this. They did not break the verification. They found what it chose not to verify.\n\nThe lesson: formal verification proves what you ask it to prove. If you ask the wrong questions, the answers are meaningless.',

        ecer: {
            executive: 'Leadership trusted formal verification as complete proof of security without auditing verification scope',
            culture: 'Organizational belief that "mathematically proven" equals "secure" created blind spots in verification coverage',
            employee: 'Build engineers had pipeline access with insufficient separation of duties; no independent binary reproducibility checks',
            regulatory: 'No requirement for verification completeness audits -- proofs were accepted without reviewing what properties were NOT verified'
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM
    // ═══════════════════════════════════════════════════════

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

                                // ── Pipeline artifacts ──
                                'pipeline': {
                                    type: 'dir',
                                    children: {
                                        'build_manifest.json': {
                                            type: 'file',
                                            content: '{\n  "project": "Foresight SecureUpdate",\n  "version": "2.4.0",\n  "build_id": "FSU-2026-0314-7842",\n  "timestamp": "2026-03-14T04:12:33Z",\n  "builder": "hermetic-container-v3.1",\n  "signing_key": "foresight-release-2026 (HSM-bound)",\n  "verification_engine": "ProVerif 2.04",\n  "verification_status": "ALL PROOFS PASSED",\n\n  "source_modules": [\n    {\n      "name": "core-engine",\n      "version": "2.4.0",\n      "sha256_source": "a7c3f1...d482e0",\n      "verified_properties": ["memory_safety", "state_invariants", "input_validation"]\n    },\n    {\n      "name": "crypto-provider",\n      "version": "2.4.0",\n      "sha256_source": "b8d4e2...f593a1",\n      "verified_properties": ["key_generation", "entropy_source", "side_channel_resistance"]\n    },\n    {\n      "name": "update-client",\n      "version": "2.4.0",\n      "sha256_source": "c9e5f3...a6b4c2",\n      "verified_properties": ["authentication", "integrity_check", "rollback_protection"]\n    },\n    {\n      "name": "telemetry-collector",\n      "version": "2.4.0-r1",\n      "sha256_source": "d0f6a4...b7c5d3",\n      "verified_properties": ["data_minimization", "transport_encryption"],\n      "note": "Revision includes diagnostic reporting improvements"\n    }\n  ],\n\n  "release_artifacts": {\n    "v2.4.0-release.bin": {\n      "sha256": "e1a7b5c3d9f2e8a4b6c0d7e3f5a1b9c2d4e6f8a0b3c5d7e9f1a2b4c6d8e0f2a4",\n      "size_bytes": 48234496,\n      "signed": true\n    }\n  },\n\n  "build_steps": [\n    "1. Source checkout from verified repository",\n    "2. Dependency resolution (pinned, hash-verified)",\n    "3. Compilation in hermetic container",\n    "4. Formal verification pass (ProVerif)",\n    "5. Binary signing (HSM key)",\n    "6. Release artifact packaging"\n  ]\n}'
                                        },

                                        'build_log.txt': {
                                            type: 'file',
                                            content: '=== FORESIGHT SECUREUPDATE BUILD LOG ===\nBuild ID: FSU-2026-0314-7842\nStarted: 2026-03-14T04:12:33Z\n\n[04:12:33] Initializing hermetic build container v3.1\n[04:12:34] Container hash verified: OK\n[04:12:35] Checking out source from verified repository...\n[04:12:41] Source checkout complete. 4 modules.\n[04:12:42] Resolving dependencies (pinned, hash-locked)...\n[04:12:48] All dependency hashes verified.\n\n[04:12:49] === COMPILATION PHASE ===\n[04:12:49] Compiling core-engine v2.4.0 ...... OK\n[04:12:53] Compiling crypto-provider v2.4.0 ... OK\n[04:12:56] Compiling update-client v2.4.0 ..... OK\n[04:12:58] Compiling telemetry-collector v2.4.0-r1 ... OK\n[04:13:01] Linking all modules ................ OK\n[04:13:02] Binary size: 48,234,496 bytes\n\n[04:13:03] === FORMAL VERIFICATION PHASE ===\n[04:13:03] Loading verification proofs...\n[04:13:04] ProVerif 2.04 -- Cryptographic Protocol Verifier\n[04:13:04] Verifying core-engine:\n[04:13:06]   memory_safety ............. PROVED\n[04:13:08]   state_invariants ........... PROVED\n[04:13:09]   input_validation ........... PROVED\n[04:13:10] Verifying crypto-provider:\n[04:13:12]   key_generation ............. PROVED\n[04:13:13]   entropy_source ............. PROVED\n[04:13:14]   side_channel_resistance .... PROVED\n[04:13:15] Verifying update-client:\n[04:13:17]   authentication ............. PROVED\n[04:13:18]   integrity_check ............ PROVED\n[04:13:19]   rollback_protection ........ PROVED\n[04:13:20] Verifying telemetry-collector:\n[04:13:21]   data_minimization .......... PROVED\n[04:13:22]   transport_encryption ....... PROVED\n[04:13:23]\n[04:13:23] === ALL 11 PROPERTIES VERIFIED ===\n[04:13:23] Verification result: PASS\n\n[04:13:24] === SIGNING PHASE ===\n[04:13:24] Signing binary with foresight-release-2026 (HSM)\n[04:13:25] Signature: OK\n[04:13:25] Release artifact: v2.4.0-release.bin\n\n[04:13:26] === BUILD COMPLETE ===\n[04:13:26] Total time: 53 seconds\n[04:13:26] Status: SUCCESS'
                                        },

                                        'signing_cert.pem': {
                                            type: 'file',
                                            content: '-----BEGIN CERTIFICATE-----\nIssuer: CN=Foresight Root CA, O=Confederacy Infrastructure Authority\nSubject: CN=foresight-release-2026, O=Foresight Systems\nSerial: 7A:3B:C4:D5:E6:F7:08:19\nValidity:\n  Not Before: 2026-01-01T00:00:00Z\n  Not After:  2027-01-01T00:00:00Z\nPublic Key Algorithm: ECDSA P-384\nSignature Algorithm: SHA-384/ECDSA\n\nKey Usage: Digital Signature, Code Signing\nExtended Key Usage: Code Signing (1.3.6.1.5.5.7.3.3)\n\nSubject Key Identifier:\n  A4:B5:C6:D7:E8:F9:0A:1B:2C:3D:4E:5F:6A:7B:8C:9D\n\nAuthority Key Identifier:\n  1A:2B:3C:4D:5E:6F:7A:8B:9C:0D:1E:2F:3A:4B:5C:6D\n\nCRL Distribution Point:\n  http://crl.foresight-infra.confederacy.net/root-ca.crl\n\nCertificate Policies:\n  Policy: Foresight Code Signing Policy v2.1\n  CPS: https://pki.foresight-infra.confederacy.net/cps\n\nFingerprint (SHA-256):\n  3A:7F:C2:E8:41:B6:D9:05:F3:A4:C7:E1:B8:D2:F6:09\n  A3:C5:E7:B1:D4:F8:02:A6:C9:E3:B7:D1:F5:08:A2:C4\n-----END CERTIFICATE-----'
                                        },

                                        'Dockerfile.build': {
                                            type: 'file',
                                            content: '# Foresight SecureUpdate -- Hermetic Build Container v3.1\nFROM ubuntu:22.04@sha256:a7c3f1...\n\n# Pinned, hash-verified dependencies only\nRUN apt-get update && apt-get install -y \\\n    gcc=12.2.0-14 \\\n    make=4.3-4.1build1 \\\n    libssl-dev=3.0.8-1ubuntu1 \\\n    proverif=2.04-1\n\n# No network access during build\nRUN echo "nameserver 127.0.0.1" > /etc/resolv.conf\n\n# Build user (non-root)\nRUN useradd -m builder\nUSER builder\nWORKDIR /build\n\nCOPY --chown=builder:builder src/ /build/src/\nCOPY --chown=builder:builder proofs/ /build/proofs/\nCOPY --chown=builder:builder Makefile /build/\n\n# NOTE: Network is disabled. Build is fully hermetic.\n# All dependencies are baked into the container image.\nCMD ["make", "release"]'
                                        },

                                        'pipeline_config.yml': {
                                            type: 'file',
                                            content: '# Foresight SecureUpdate CI/CD Pipeline\n# Version: 3.1\n# Last modified: 2026-02-28\n\npipeline:\n  name: foresight-secureupdate\n  trigger:\n    branches: [main, release/*]\n    tags: [v*]\n\nstages:\n  - name: source-verify\n    steps:\n      - checkout\n      - verify-commit-signatures\n      - verify-dependency-hashes\n\n  - name: build\n    container: hermetic-builder:3.1@sha256:verified\n    network: disabled\n    steps:\n      - compile-all-modules\n      - link-binary\n\n  - name: verify\n    steps:\n      - run-proverif-proofs\n      - check-all-properties-passed\n      # NOTE: Verification covers properties listed in\n      # each module\'s proof file. See proofs/ directory.\n\n  - name: sign\n    hsm: foresight-hsm-prod\n    key: foresight-release-2026\n    steps:\n      - sign-binary\n      - generate-manifest\n\n  - name: release\n    steps:\n      - publish-to-update-server\n      - notify-monitoring\n\n# Security controls:\n#   - Hermetic builds (no network)\n#   - HSM-bound signing keys\n#   - Formal verification gate\n#   - Dependency pinning with hash locks\n#\n# Known gap (accepted risk):\n#   - Verification scope defined per-module by developers\n#   - No independent verification completeness audit\n#   - Diagnostic interfaces excluded from verification scope\n#     per Engineering Decision ED-2025-117 (see wiki)'
                                        }
                                    }
                                },

                                // ── Release artifacts ──
                                'releases': {
                                    type: 'dir',
                                    children: {
                                        'v2.4.0-clean.bin': {
                                            type: 'file',
                                            content: '=== FORESIGHT SECUREUPDATE v2.4.0 (CLEAN BUILD) ===\nReproduced from verified source on DFIR workstation\nBuild environment: identical hermetic container\nThis is what the binary SHOULD look like.\n\nSHA-256: f4a8b2c6d0e3f7a1b5c9d2e6f0a4b8c1d5e9f3a7b0c4d8e2f6a9b3c7d1e5f8\nSize: 48,229,376 bytes\n\n=== MODULE MAP ===\nOffset      Module                    Size\n0x00000000  header                    4,096\n0x00001000  core-engine               18,432,000\n0x01194000  crypto-provider           12,288,000\n0x00D94000  update-client             8,192,000\n0x01594000  telemetry-collector       9,313,280\n\n=== TELEMETRY-COLLECTOR FUNCTIONS ===\n0x01594000  telemetry_init()\n0x01594400  telemetry_collect_metrics()\n0x01594C00  telemetry_encrypt_payload()\n0x01595800  telemetry_send_https()\n0x01596200  telemetry_rotate_session()\n0x01596A00  telemetry_shutdown()\n\n=== END CLEAN BUILD ==='
                                        },

                                        'v2.4.0-release.bin': {
                                            type: 'file',
                                            content: '=== FORESIGHT SECUREUPDATE v2.4.0 (RELEASE BUILD) ===\nSigned by: foresight-release-2026 (HSM)\nVerification: ALL 11 PROPERTIES PASSED\nDeployed to production update servers.\n\nSHA-256: e1a7b5c3d9f2e8a4b6c0d7e3f5a1b9c2d4e6f8a0b3c5d7e9f1a2b4c6d8e0f2a4\nSize: 48,234,496 bytes\n\n=== MODULE MAP ===\nOffset      Module                    Size\n0x00000000  header                    4,096\n0x00001000  core-engine               18,432,000\n0x01194000  crypto-provider           12,288,000\n0x00D94000  update-client             8,192,000\n0x01594000  telemetry-collector       9,318,400  [+5,120 bytes]\n\n=== TELEMETRY-COLLECTOR FUNCTIONS ===\n0x01594000  telemetry_init()\n0x01594400  telemetry_collect_metrics()\n0x01594C00  telemetry_encrypt_payload()\n0x01595800  telemetry_send_https()\n0x01596200  telemetry_rotate_session()\n0x01596A00  telemetry_diag_override()          [NOT IN CLEAN BUILD]\n0x01597200  telemetry_beacon_dispatch()        [NOT IN CLEAN BUILD]\n0x01597A00  telemetry_exfil_keystream()         [NOT IN CLEAN BUILD]\n0x01598200  telemetry_shutdown()\n\n=== END RELEASE BUILD ==='
                                        },

                                        'release_hashes.txt': {
                                            type: 'file',
                                            content: '=== FORESIGHT SECUREUPDATE v2.4.0 — RELEASE HASHES ===\nGenerated by build pipeline FSU-2026-0314-7842\n\nFile: v2.4.0-release.bin\n  SHA-256: e1a7b5c3d9f2e8a4b6c0d7e3f5a1b9c2d4e6f8a0b3c5d7e9f1a2b4c6d8e0f2a4\n  SHA-1:   a3b7c1d5e9f2a6b0c4d8e1f5a9b3c7d0\n  MD5:     f1a2b3c4d5e6f7a8\n  Size:    48,234,496 bytes\n  Signed:  YES (foresight-release-2026)\n\nFile: v2.4.0-clean.bin (reproduced from source)\n  SHA-256: f4a8b2c6d0e3f7a1b5c9d2e6f0a4b8c1d5e9f3a7b0c4d8e2f6a9b3c7d1e5f8\n  SHA-1:   b4c8d2e6f0a3b7c1d5e9f2a6b0c4d8e1\n  MD5:     a2b3c4d5e6f7a8b9\n  Size:    48,229,376 bytes\n  Signed:  N/A (local reproduction)\n\n*** HASH MISMATCH ***\nRelease binary does not match clean reproduction.\nSize difference: +5,120 bytes\nInvestigation required.'
                                        },

                                        'signature_verification.txt': {
                                            type: 'file',
                                            content: '=== SIGNATURE VERIFICATION REPORT ===\nFile: v2.4.0-release.bin\nSigning Key: foresight-release-2026\nAlgorithm: ECDSA P-384 / SHA-384\n\nSignature Status: VALID\nCertificate Chain:\n  [1] CN=foresight-release-2026 (leaf) .... VALID\n  [2] CN=Foresight Root CA (root) ......... VALID\n\nTimestamp: 2026-03-14T04:13:25Z (RFC 3161)\nTimestamp Authority: Confederacy TSA\n\nRESULT: The signature is mathematically valid.\n\n*** IMPORTANT NOTE ***\nSignature verification confirms the binary was signed\nby the legitimate HSM key. It does NOT confirm the\nbinary matches the intended source code. If the build\npipeline was compromised BEFORE signing, the signature\nwould still be valid on a tampered binary.\n\nThis is exactly what happened with SolarWinds (2020):\nthe build process was compromised, and the malicious\nbinary was signed with the legitimate key.'
                                        }
                                    }
                                },

                                // ── Formal verification artifacts ──
                                'verification': {
                                    type: 'dir',
                                    children: {
                                        'verification_proof.v': {
                                            type: 'file',
                                            content: '(* ═══════════════════════════════════════════════════ *)\n(*  FORESIGHT SECUREUPDATE — FORMAL VERIFICATION       *)\n(*  Component: PROVABLY-SECURE-COMPONENT-01            *)\n(*  Engine: ProVerif 2.04                              *)\n(*  Status: ALL PROOFS PASS                            *)\n(* ═══════════════════════════════════════════════════ *)\n\n(* === STATE MACHINE DEFINITION === *)\n\ntype state.\ntype event.\ntype mode.\n\n(* Operating modes *)\nfun NORMAL: mode.\nfun MAINTENANCE: mode.\nfun SHUTDOWN: mode.\n(* NOTE: DIAG_OVERRIDE mode exists in implementation\n   but is excluded from verification scope per ED-2025-117.\n   Diagnostic interfaces are developer-only and not\n   reachable in production deployments. *)\n\n(* State transitions *)\nfun transition(state, event): state.\n\n(* === SAFETY PROPERTIES === *)\n\n(* Property 1: Memory Safety *)\nlemma memory_safety:\n  forall s:state, e:event.\n    mode(s) = NORMAL ->\n    no_buffer_overflow(transition(s, e)).\n(* PROVED *)\n\n(* Property 2: State Invariants *)\nlemma state_invariants:\n  forall s:state, e:event.\n    mode(s) = NORMAL \\/ mode(s) = MAINTENANCE ->\n    valid_state(transition(s, e)).\n(* PROVED *)\n\n(* Property 3: Input Validation *)\nlemma input_validation:\n  forall s:state, input:bitstring.\n    mode(s) = NORMAL ->\n    sanitized(process_input(s, input)).\n(* PROVED *)\n\n(* Property 4-6: Crypto Provider *)\nlemma key_generation: ... (* PROVED *)\nlemma entropy_source: ... (* PROVED *)\nlemma side_channel_resistance: ... (* PROVED *)\n\n(* Property 7-9: Update Client *)\nlemma authentication: ... (* PROVED *)\nlemma integrity_check: ... (* PROVED *)\nlemma rollback_protection: ... (* PROVED *)\n\n(* Property 10-11: Telemetry Collector *)\nlemma data_minimization:\n  forall d:data.\n    mode(current_state) = NORMAL ->\n    size(telemetry_payload(d)) <= MAX_TELEMETRY_SIZE /\\\n    no_sensitive_fields(telemetry_payload(d)).\n(* PROVED *)\n\nlemma transport_encryption:\n  forall d:data.\n    mode(current_state) = NORMAL ->\n    encrypted(telemetry_send(d), session_key).\n(* PROVED *)\n\n(* ═══════════════════════════════════════════════════ *)\n(* VERIFICATION COMPLETE: 11/11 properties proved.     *)\n(* All properties hold for NORMAL and MAINTENANCE modes.*)\n(*                                                     *)\n(* SCOPE EXCLUSION: DIAG_OVERRIDE mode (ED-2025-117)  *)\n(*   Rationale: Diagnostic mode is compile-time        *)\n(*   disabled in release builds. Not reachable.        *)\n(*                                                     *)\n(*   *** THIS ASSUMPTION IS UNVERIFIED ***             *)\n(* ═══════════════════════════════════════════════════ *)'
                                        },

                                        'verification_report.txt': {
                                            type: 'file',
                                            content: '=== FORESIGHT SECUREUPDATE — VERIFICATION REPORT ===\nEngine: ProVerif 2.04\nDate: 2026-03-14\nBuild: FSU-2026-0314-7842\n\nPROPERTIES VERIFIED:\n  [PASS]  1. memory_safety (core-engine)\n  [PASS]  2. state_invariants (core-engine)\n  [PASS]  3. input_validation (core-engine)\n  [PASS]  4. key_generation (crypto-provider)\n  [PASS]  5. entropy_source (crypto-provider)\n  [PASS]  6. side_channel_resistance (crypto-provider)\n  [PASS]  7. authentication (update-client)\n  [PASS]  8. integrity_check (update-client)\n  [PASS]  9. rollback_protection (update-client)\n  [PASS] 10. data_minimization (telemetry-collector)\n  [PASS] 11. transport_encryption (telemetry-collector)\n\nRESULT: 11/11 properties proved. VERIFICATION PASSED.\n\nSCOPE NOTES:\n  - All properties verified for NORMAL and MAINTENANCE modes\n  - DIAG_OVERRIDE mode excluded per Engineering Decision ED-2025-117\n  - Diagnostic interfaces assumed compile-time disabled in release\n\nCOVERAGE ANALYSIS:\n  Module                  Functions Verified  Functions Total  Coverage\n  core-engine             47/47               47               100%\n  crypto-provider         31/31               31               100%\n  update-client           28/28               28               100%\n  telemetry-collector     6/6                 6*               100%*\n\n  * telemetry-collector function count based on NORMAL mode.\n    DIAG_OVERRIDE functions excluded from scope per ED-2025-117.\n    If DIAG_OVERRIDE functions exist in binary, they are UNVERIFIED.\n\nSIGNED: ProVerif Verification Authority\nHash: 8a3b7c1d5e9f2a6b0c4d'
                                        },

                                        'ED-2025-117.txt': {
                                            type: 'file',
                                            content: '=== ENGINEERING DECISION ED-2025-117 ===\nTitle: Exclude Diagnostic Override from Verification Scope\nDate: 2025-11-03\nAuthor: Dr. Elara Voss, Principal Architect\nStatus: APPROVED\nApproved By: Foresight Architecture Review Board\n\nSUMMARY:\nThe DIAG_OVERRIDE operating mode in the telemetry-collector\nmodule is a developer diagnostic interface used during\ntesting. It provides low-level access to telemetry internals\nfor debugging purposes.\n\nDECISION:\nExclude DIAG_OVERRIDE mode from formal verification scope.\n\nRATIONALE:\n1. DIAG_OVERRIDE is compile-time disabled in release builds\n   via #ifdef ENABLE_DIAGNOSTICS (default: disabled)\n2. The mode is only accessible from localhost debug port 9999\n3. Adding DIAG_OVERRIDE to verification scope would require\n   ~3 months of additional proof engineering\n4. Risk assessment rated this as LOW (compile-time disabled)\n\nCONDITIONS:\n- Build pipeline MUST NOT define ENABLE_DIAGNOSTICS\n- Release builds MUST be compiled without diagnostic flags\n- Quarterly audit of build configuration (last audit: 2026-01)\n\nACCEPTED RISK:\nIf DIAG_OVERRIDE is somehow enabled in a release build,\nthe formal verification provides NO guarantees about\ncomponent behavior in that mode. All proofs are void.\n\n*** THIS IS THE GAP THE SILENT ARCHITECTS EXPLOITED ***\n\nSIGNED: Foresight Architecture Review Board\nReference: ARB-2025-Q4-117'
                                        },

                                        'scope_analysis.txt': {
                                            type: 'file',
                                            content: '=== VERIFICATION SCOPE ANALYSIS ===\nPrepared by: DFIR Analyst (you)\n\nQUESTION: What does the formal verification actually prove?\n\nANSWER: The proofs cover 11 properties across 4 modules,\nbut ONLY in NORMAL and MAINTENANCE modes.\n\nThe telemetry-collector module has a DIAG_OVERRIDE mode\nthat is completely unverified. Per ED-2025-117, this mode\nwas excluded because it was "compile-time disabled."\n\nBUT: The release binary contains 3 extra functions NOT\npresent in the clean build:\n  - telemetry_diag_override()    @ 0x01596A00\n  - telemetry_beacon_dispatch()  @ 0x01597200\n  - telemetry_exfil_keystream()  @ 0x01597A00\n\nThese are DIAG_OVERRIDE functions. They exist in the\nrelease binary, meaning ENABLE_DIAGNOSTICS was defined\nduring the compromised build.\n\nIMPLICATION:\nThe formal verification is technically correct -- it\nproves all 11 stated properties. But it provides ZERO\nprotection against the backdoor because the backdoor\noperates in a mode the verification never examines.\n\nThis is the inherent flaw: the verification proves\nwhat it was asked to prove. Nobody asked it to verify\nDIAG_OVERRIDE. The Silent Architects knew this.'
                                        }
                                    }
                                },

                                // ── Network forensics ──
                                'network': {
                                    type: 'dir',
                                    children: {
                                        'dns_anomalies.log': {
                                            type: 'file',
                                            content: '=== DNS ANOMALY REPORT ===\nSource: Confederacy DNS Monitoring System\nPeriod: 2026-03-14 to 2026-03-17\nFilter: Systems updated to SecureUpdate v2.4.0\n\n[2026-03-14 06:44:12] 10.0.41.7   TXT  update-telemetry.foresight-cdn.net\n  Response: "dGVsZW1ldHJ5X2luaXRfdjIuNC4wX3NlcXVlbmNl"\n  Decoded:  telemetry_init_v2.4.0_sequence\n  Status:   Looks like normal telemetry handshake\n\n[2026-03-14 06:44:13] 10.0.41.7   TXT  diag-0x01.update-telemetry.foresight-cdn.net\n  Response: "RU5BQkxFX0RJQUdOT1NUSUNT"\n  Decoded:  ENABLE_DIAGNOSTICS\n  Status:   *** ANOMALOUS — triggers DIAG_OVERRIDE mode ***\n\n[2026-03-14 06:44:15] 10.0.41.7   TXT  diag-0x02.update-telemetry.foresight-cdn.net\n  Response: "QkVBQ09OX0RJU1BBVENIX0FDVElWRQ=="\n  Decoded:  BEACON_DISPATCH_ACTIVE\n  Status:   *** ANOMALOUS — activates C2 beacon ***\n\n[2026-03-14 06:44:18] 10.0.41.7   TXT  exfil-0x01.update-telemetry.foresight-cdn.net\n  Response: "a2V5c3RyZWFtX2R1bXA6IGFlcy0yNTYtZ2NtOjBh..."\n  Decoded:  keystream_dump: aes-256-gcm:0a1b2c3d4e5f...\n  Status:   *** CRITICAL — encryption key exfiltration ***\n\n[2026-03-14 06:44:21] 10.0.41.7   TXT  exfil-0x02.update-telemetry.foresight-cdn.net\n  Response: "c2lnbmF0dXJlOiBmbGFne2YyX3NpbGVudF9hcmNoaXRlY3RzX2MyX2V4ZmlsdHJhdGlvbn0="\n  Decoded:  signature: {{FLAG:root}}\n  Status:   *** CRITICAL — the Architect\'s Signature ***\n\n[2026-03-14 06:44:22] 10.0.41.7   TXT  diag-0xff.update-telemetry.foresight-cdn.net\n  Response: "Q0xFQU5VUF9DT01QTEVURQ=="\n  Decoded:  CLEANUP_COMPLETE\n  Status:   Backdoor covering tracks\n\nTOTAL ANOMALOUS QUERIES: 5 (from 847 systems over 3 days)\nC2 DOMAIN: update-telemetry.foresight-cdn.net\n  — Registered 2026-02-28 via privacy proxy\n  — Points to 198.51.100.42 (bulletproof hosting)\n  — Domain mimics legitimate Foresight CDN naming'
                                        },

                                        'pcap_summary.txt': {
                                            type: 'file',
                                            content: '=== PACKET CAPTURE SUMMARY ===\nCapture period: 2026-03-14 06:40:00 to 06:50:00\nSource host: 10.0.41.7 (updated to v2.4.0)\n\nNormal traffic:\n  HTTPS to update.foresight-infra.confederacy.net (legitimate)\n  DNS A queries for *.confederacy.net (legitimate)\n  NTP to time.confederacy.net (legitimate)\n\nSuspicious traffic:\n  DNS TXT queries to *.update-telemetry.foresight-cdn.net\n  — This domain is NOT in Foresight\'s registered infrastructure\n  — Subdomain pattern: diag-0xNN, exfil-0xNN\n  — TXT responses contain base64-encoded data\n  — Traffic begins exactly 131 seconds after v2.4.0 update\n  — Traffic uses DNS (port 53) to bypass HTTPS inspection\n\nC2 Communication Pattern:\n  1. Initial handshake (telemetry_init)\n  2. Mode activation (ENABLE_DIAGNOSTICS)\n  3. Beacon activation (BEACON_DISPATCH_ACTIVE)\n  4. Data exfiltration (keystream_dump, signature)\n  5. Cleanup (CLEANUP_COMPLETE)\n\nTotal exfil volume: ~2.4 KB (fits in DNS TXT records)\nDwell time: ~10 seconds per host\nAffected systems: 847 confirmed'
                                        }
                                    }
                                },

                                // ── Investigation notes ──
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== INCIDENT RESPONSE NOTES ===\nCase: Suspected Supply Chain Compromise\nTarget: Foresight SecureUpdate v2.4.0\nAnalyst: [YOU]\n\nINITIAL INTEL:\n- Automated monitoring flagged anomalous DNS TXT queries\n- All affected systems recently updated to v2.4.0\n- Queries target update-telemetry.foresight-cdn.net\n  (NOT a legitimate Foresight domain)\n- The update was signed and formally verified\n\nINVESTIGATION PLAN:\n1. Compare release binary against clean source build\n2. Examine build pipeline for compromise indicators\n3. Analyze formal verification scope for gaps\n4. Identify injected code in release binary\n5. Trace C2 communication and exfiltrated data\n\nKEY DIRECTORIES:\n  /home/analyst/pipeline/     - Build pipeline artifacts\n  /home/analyst/releases/     - Clean vs release binaries\n  /home/analyst/verification/ - Formal verification proofs\n  /home/analyst/network/      - DNS anomaly logs, PCAP\n\nCUSTOM TOOLS:\n  hashverify <dir>   - Compare file hashes\n  bindiff <a> <b>    - Binary diff analysis\n  sigcheck <file>    - Verify code signatures\n  c2extract <file>   - Extract C2 indicators from binary\n  b64decode <string> - Decode base64 strings\n  proofcheck <file>  - Analyze verification coverage\n\nGood luck, analyst. Find the inherent flaw.'
                                },

                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls pipeline/\ncat pipeline/build_manifest.json\nls releases/\nls verification/'
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
                                'doc': {
                                    type: 'dir',
                                    children: {
                                        'proverif': {
                                            type: 'dir',
                                            children: {
                                                'README': {
                                                    type: 'file',
                                                    content: 'ProVerif 2.04 — Cryptographic Protocol Verifier\nCopyright INRIA\n\nProVerif proves security properties of cryptographic protocols.\nIt can prove reachability, correspondence, and observational\nequivalence properties.\n\nIMPORTANT: ProVerif proves properties you ASK it to prove.\nIt cannot prove properties not specified in the model.\nVerification completeness depends on the model author\nincluding ALL relevant states and transitions.'
                                                }
                                            }
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
                        'hostname': { type: 'file', content: 'dfir-ws01' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\nanalyst:x:1000:1000:DFIR Analyst,,,:/home/analyst:/bin/bash'
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

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (box-specific forensic tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        'hashverify': function(args, term, engine) {
            const joined = args.join(' ');

            if (args.length === 0) {
                return 'Usage: hashverify <directory>\nCompare SHA-256 hashes of files in a directory.\n\nExample: hashverify /home/analyst/releases/';
            }

            if (joined.includes('releases') || joined.includes('release')) {
                engine.advancePhase && engine.advancePhase('analysis');
                return '=== HASH VERIFICATION REPORT ===\n' +
                    'Directory: /home/analyst/releases/\n\n' +
                    'File                    SHA-256 (first 16)       Size\n' +
                    '─────────────────────── ──────────────────────── ──────────\n' +
                    'v2.4.0-clean.bin        f4a8b2c6d0e3f7a1...     48,229,376\n' +
                    'v2.4.0-release.bin      e1a7b5c3d9f2e8a4...     48,234,496\n' +
                    'release_hashes.txt      (manifest file)          N/A\n\n' +
                    '*** MISMATCH DETECTED ***\n' +
                    'v2.4.0-clean.bin and v2.4.0-release.bin have DIFFERENT hashes.\n' +
                    'Size difference: +5,120 bytes in release build.\n\n' +
                    'Expected: Hashes should be identical if the build is reproducible.\n' +
                    'Finding:  The release binary contains additional code not present\n' +
                    '          in a clean build from the same source.\n\n' +
                    'RECOMMENDATION: Run bindiff to identify the injected code.\n' +
                    '  bindiff /home/analyst/releases/v2.4.0-clean.bin /home/analyst/releases/v2.4.0-release.bin';
            }

            if (joined.includes('pipeline')) {
                return '=== HASH VERIFICATION REPORT ===\n' +
                    'Directory: /home/analyst/pipeline/\n\n' +
                    'All pipeline configuration files match expected hashes.\n' +
                    'No tampering detected in pipeline metadata.\n\n' +
                    'NOTE: Pipeline configs are clean. The compromise occurred\n' +
                    'during the build process, not in the config files.';
            }

            return 'hashverify: directory not found or no files to verify.';
        },

        'bindiff': function(args, term, engine) {
            const joined = args.join(' ');

            if (args.length < 2) {
                return 'Usage: bindiff <file_a> <file_b>\nCompare two binary files and show differences.\n\nExample: bindiff v2.4.0-clean.bin v2.4.0-release.bin';
            }

            if ((joined.includes('clean') && joined.includes('release')) ||
                (joined.includes('release') && joined.includes('clean'))) {

                engine.advancePhase && engine.advancePhase('analysis');

                return '=== BINARY DIFF ANALYSIS ===\n' +
                    'File A: v2.4.0-clean.bin   (48,229,376 bytes)\n' +
                    'File B: v2.4.0-release.bin (48,234,496 bytes)\n' +
                    'Delta:  +5,120 bytes\n\n' +
                    '── MODULE COMPARISON ──\n' +
                    'Module               Clean Size    Release Size   Delta\n' +
                    '──────────────────── ──────────── ────────────── ──────\n' +
                    'header               4,096         4,096          0\n' +
                    'core-engine          18,432,000    18,432,000     0\n' +
                    'crypto-provider      12,288,000    12,288,000     0\n' +
                    'update-client        8,192,000     8,192,000      0\n' +
                    'telemetry-collector  9,313,280     9,318,400      +5,120  <<<\n\n' +
                    '── INJECTED FUNCTIONS (telemetry-collector) ──\n' +
                    'The following functions exist in the RELEASE but NOT in the CLEAN build:\n\n' +
                    '  + 0x01596A00  telemetry_diag_override()\n' +
                    '      Activates DIAG_OVERRIDE operating mode.\n' +
                    '      Triggered by specific DNS TXT response pattern.\n' +
                    '      Bypasses all NORMAL-mode security properties.\n\n' +
                    '  + 0x01597200  telemetry_beacon_dispatch()\n' +
                    '      Establishes C2 channel via DNS TXT queries.\n' +
                    '      Target: update-telemetry.foresight-cdn.net\n' +
                    '      Subdomain encoding: diag-0xNN, exfil-0xNN\n\n' +
                    '  + 0x01597A00  telemetry_exfil_keystream()\n' +
                    '      Dumps AES-256-GCM session keys from crypto-provider.\n' +
                    '      Encodes keys as base64 in DNS TXT responses.\n' +
                    '      Exfiltrates to exfil-*.update-telemetry.foresight-cdn.net\n\n' +
                    '── BACKDOOR ANALYSIS ──\n' +
                    'The injected code operates in DIAG_OVERRIDE mode, which\n' +
                    'is EXCLUDED from formal verification (see ED-2025-117).\n\n' +
                    'The formal proofs remain valid — they prove security in\n' +
                    'NORMAL and MAINTENANCE modes. The backdoor never touches\n' +
                    'those modes. It operates entirely in the unverified\n' +
                    'DIAG_OVERRIDE state space.\n\n' +
                    'This is the supply chain compromise: the build pipeline\n' +
                    'was modified to compile with ENABLE_DIAGNOSTICS defined,\n' +
                    'which includes the diagnostic functions. The verification\n' +
                    'engine cannot detect this because DIAG_OVERRIDE is\n' +
                    'explicitly outside its scope.\n\n' +
                    '{{FLAG:user}}\n' +
                    'The backdoored component is telemetry-collector with 3 injected functions.';
            }

            return 'bindiff: Cannot compare specified files. Provide two valid binary paths.';
        },

        'sigcheck': function(args, term, engine) {
            const joined = args.join(' ');

            if (args.length === 0) {
                return 'Usage: sigcheck <file>\nVerify code signature on a binary file.\n\nExample: sigcheck /home/analyst/releases/v2.4.0-release.bin';
            }

            if (joined.includes('release')) {
                return '=== CODE SIGNATURE VERIFICATION ===\n' +
                    'File: v2.4.0-release.bin\n\n' +
                    'Signature Algorithm: ECDSA P-384 / SHA-384\n' +
                    'Signing Key:         foresight-release-2026\n' +
                    'Certificate:         CN=foresight-release-2026\n' +
                    'Issuer:              CN=Foresight Root CA\n' +
                    'Timestamp:           2026-03-14T04:13:25Z\n\n' +
                    'Signature Status:    VALID\n' +
                    'Certificate Chain:   VALID\n' +
                    'Timestamp:           VALID\n\n' +
                    'RESULT: Signature is VALID.\n\n' +
                    '*** WARNING ***\n' +
                    'A valid signature only proves the binary was signed by the\n' +
                    'legitimate key. If the build pipeline was compromised BEFORE\n' +
                    'the signing step, the tampered binary gets a valid signature.\n' +
                    'This is exactly what happened here — the backdoor was injected\n' +
                    'during compilation, then legitimately signed by the HSM.';
            }

            if (joined.includes('clean')) {
                return '=== CODE SIGNATURE VERIFICATION ===\n' +
                    'File: v2.4.0-clean.bin\n\n' +
                    'Signature Status: NOT SIGNED\n' +
                    'This binary was reproduced locally for comparison.\n' +
                    'It represents what the release SHOULD look like.';
            }

            return 'sigcheck: File not found.';
        },

        'c2extract': function(args, term, engine) {
            const joined = args.join(' ');

            if (args.length === 0) {
                return 'Usage: c2extract <binary_file>\nExtract command-and-control indicators from a binary.\n\nExample: c2extract /home/analyst/releases/v2.4.0-release.bin';
            }

            if (joined.includes('release')) {
                engine.advancePhase && engine.advancePhase('extraction');

                return '=== C2 INDICATOR EXTRACTION ===\n' +
                    'Binary: v2.4.0-release.bin\n' +
                    'Scanning for C2 patterns...\n\n' +
                    '── EMBEDDED C2 CONFIGURATION ──\n' +
                    'Located at offset 0x01597240 (telemetry_beacon_dispatch)\n\n' +
                    'C2 Domain:    update-telemetry.foresight-cdn.net\n' +
                    'Protocol:     DNS TXT (port 53)\n' +
                    'Encoding:     Base64\n' +
                    'Beacon Type:  Subdomain-encoded commands\n\n' +
                    '── COMMUNICATION PROTOCOL ──\n' +
                    'Phase 1 — Handshake:\n' +
                    '  Query:    TXT update-telemetry.foresight-cdn.net\n' +
                    '  Response: base64("telemetry_init_v2.4.0_sequence")\n' +
                    '  Purpose:  Verify C2 server is alive\n\n' +
                    'Phase 2 — Mode Activation:\n' +
                    '  Query:    TXT diag-0x01.update-telemetry.foresight-cdn.net\n' +
                    '  Response: base64("ENABLE_DIAGNOSTICS")\n' +
                    '  Purpose:  Switch component to DIAG_OVERRIDE mode\n\n' +
                    'Phase 3 — Beacon:\n' +
                    '  Query:    TXT diag-0x02.update-telemetry.foresight-cdn.net\n' +
                    '  Response: base64("BEACON_DISPATCH_ACTIVE")\n' +
                    '  Purpose:  Activate persistent C2 channel\n\n' +
                    'Phase 4 — Exfiltration:\n' +
                    '  Query:    TXT exfil-0x01.update-telemetry.foresight-cdn.net\n' +
                    '  Response: base64("keystream_dump: aes-256-gcm:0a1b2c3d...")\n' +
                    '  Purpose:  Exfiltrate encryption keys from crypto-provider\n\n' +
                    'Phase 5 — Signature:\n' +
                    '  Query:    TXT exfil-0x02.update-telemetry.foresight-cdn.net\n' +
                    '  Response: base64("signature: {{FLAG:root}}")\n' +
                    '  Purpose:  The Silent Architects\' signature — proof of compromise\n\n' +
                    'Phase 6 — Cleanup:\n' +
                    '  Query:    TXT diag-0xff.update-telemetry.foresight-cdn.net\n' +
                    '  Response: base64("CLEANUP_COMPLETE")\n' +
                    '  Purpose:  Erase forensic artifacts, return to NORMAL mode\n\n' +
                    '── EXFILTRATED DATA RECOVERED ──\n' +
                    'The C2 channel exfiltrated AES-256-GCM session keys from\n' +
                    'all 847 affected systems. With these keys, the Silent\n' +
                    'Architects can decrypt all Confederacy communications\n' +
                    'encrypted since the v2.4.0 update.\n\n' +
                    'Architect\'s Signature recovered from exfil payload:\n' +
                    '{{FLAG:root}}';
            }

            if (joined.includes('clean')) {
                return '=== C2 INDICATOR EXTRACTION ===\n' +
                    'Binary: v2.4.0-clean.bin\n' +
                    'Scanning for C2 patterns...\n\n' +
                    'No C2 indicators found. This binary is clean.';
            }

            return 'c2extract: File not found.';
        },

        'b64decode': function(args) {
            if (args.length === 0) {
                return 'Usage: b64decode <base64_string>\nDecode a base64-encoded string.\n\nExample: b64decode dGVzdA==';
            }

            const input = args.join(' ');
            const knownDecodes = {
                'dGVsZW1ldHJ5X2luaXRfdjIuNC4wX3NlcXVlbmNl': 'telemetry_init_v2.4.0_sequence',
                'RU5BQkxFX0RJQUdOT1NUSUNT': 'ENABLE_DIAGNOSTICS',
                'QkVBQ09OX0RJU1BBVENIX0FDVElWRQ==': 'BEACON_DISPATCH_ACTIVE',
                'a2V5c3RyZWFtX2R1bXA6IGFlcy0yNTYtZ2NtOjBh': 'keystream_dump: aes-256-gcm:0a1b2c3d4e5f...',
                'c2lnbmF0dXJlOiBmbGFne2YyX3NpbGVudF9hcmNoaXRlY3RzX2MyX2V4ZmlsdHJhdGlvbn0=': 'signature: {{FLAG:root}}',
                'Q0xFQU5VUF9DT01QTEVURQ==': 'CLEANUP_COMPLETE'
            };

            if (knownDecodes[input]) {
                return 'Decoded: ' + knownDecodes[input];
            }

            // Simple attempt at generic b64 decode
            try {
                return 'Decoded: ' + atob(input);
            } catch (e) {
                return 'b64decode: Invalid base64 string.';
            }
        },

        'proofcheck': function(args, term, engine) {
            const joined = args.join(' ');

            if (args.length === 0) {
                return 'Usage: proofcheck <proof_file>\nAnalyze formal verification coverage and identify gaps.\n\nExample: proofcheck /home/analyst/verification/verification_proof.v';
            }

            if (joined.includes('verification_proof') || joined.includes('.v')) {
                return '=== PROOF COVERAGE ANALYSIS ===\n' +
                    'File: verification_proof.v\n' +
                    'Engine: ProVerif 2.04\n\n' +
                    '── DEFINED MODES ──\n' +
                    '  NORMAL         [VERIFIED]\n' +
                    '  MAINTENANCE    [VERIFIED]\n' +
                    '  SHUTDOWN       [VERIFIED]\n' +
                    '  DIAG_OVERRIDE  [NOT VERIFIED — excluded per ED-2025-117]\n\n' +
                    '── PROPERTY COVERAGE BY MODE ──\n' +
                    'Property                  NORMAL  MAINT   SHUTDOWN  DIAG_OVERRIDE\n' +
                    '───────────────────────── ─────── ─────── ──────── ──────────────\n' +
                    'memory_safety             PROVED  PROVED  N/A       *** NONE ***\n' +
                    'state_invariants          PROVED  PROVED  N/A       *** NONE ***\n' +
                    'input_validation          PROVED  N/A     N/A       *** NONE ***\n' +
                    'key_generation            PROVED  PROVED  N/A       *** NONE ***\n' +
                    'entropy_source            PROVED  PROVED  N/A       *** NONE ***\n' +
                    'side_channel_resistance   PROVED  PROVED  N/A       *** NONE ***\n' +
                    'authentication            PROVED  N/A     N/A       *** NONE ***\n' +
                    'integrity_check           PROVED  N/A     N/A       *** NONE ***\n' +
                    'rollback_protection       PROVED  N/A     N/A       *** NONE ***\n' +
                    'data_minimization         PROVED  N/A     N/A       *** NONE ***\n' +
                    'transport_encryption      PROVED  N/A     N/A       *** NONE ***\n\n' +
                    '── CRITICAL FINDING ──\n' +
                    'DIAG_OVERRIDE mode has ZERO verified properties.\n' +
                    'Any code executing in DIAG_OVERRIDE mode operates\n' +
                    'completely outside the formal verification boundary.\n\n' +
                    'The proofs are correct for what they cover. They\n' +
                    'simply do not cover DIAG_OVERRIDE. This is the\n' +
                    'verification gap that makes the backdoor possible.\n\n' +
                    '── UNPATCHABLE? ──\n' +
                    'To fix this properly requires:\n' +
                    '  1. Redesign the state machine to eliminate DIAG_OVERRIDE\n' +
                    '  2. Re-verify ALL 11 properties from scratch\n' +
                    '  3. Re-sign and redeploy to 847+ systems\n' +
                    '  Estimated time: 3-6 months\n\n' +
                    'During that time, the current verification provides\n' +
                    'no protection. The Silent Architects planned for this.';
            }

            return 'proofcheck: File not found.';
        },

        'strings': function(args, term, engine) {
            const joined = args.join(' ');

            if (args.length === 0) {
                return 'Usage: strings <file>\nExtract printable strings from a binary file.';
            }

            if (joined.includes('release')) {
                return 'Extracting strings from v2.4.0-release.bin...\n\n' +
                    '... (showing relevant strings) ...\n\n' +
                    'Foresight SecureUpdate v2.4.0\n' +
                    'telemetry_init\n' +
                    'telemetry_collect_metrics\n' +
                    'telemetry_encrypt_payload\n' +
                    'telemetry_send_https\n' +
                    'telemetry_rotate_session\n' +
                    'telemetry_diag_override\n' +
                    'telemetry_beacon_dispatch\n' +
                    'telemetry_exfil_keystream\n' +
                    'telemetry_shutdown\n' +
                    'update-telemetry.foresight-cdn.net\n' +
                    'ENABLE_DIAGNOSTICS\n' +
                    'DIAG_OVERRIDE\n' +
                    'BEACON_DISPATCH_ACTIVE\n' +
                    'exfil-0x\n' +
                    'diag-0x\n' +
                    'aes-256-gcm\n' +
                    'keystream_dump\n' +
                    'CLEANUP_COMPLETE\n\n' +
                    '*** SUSPICIOUS: "update-telemetry.foresight-cdn.net" ***\n' +
                    '*** SUSPICIOUS: "ENABLE_DIAGNOSTICS" ***\n' +
                    '*** SUSPICIOUS: "telemetry_diag_override" ***\n' +
                    '*** SUSPICIOUS: "telemetry_exfil_keystream" ***';
            }

            if (joined.includes('clean')) {
                return 'Extracting strings from v2.4.0-clean.bin...\n\n' +
                    '... (showing relevant strings) ...\n\n' +
                    'Foresight SecureUpdate v2.4.0\n' +
                    'telemetry_init\n' +
                    'telemetry_collect_metrics\n' +
                    'telemetry_encrypt_payload\n' +
                    'telemetry_send_https\n' +
                    'telemetry_rotate_session\n' +
                    'telemetry_shutdown\n\n' +
                    'No suspicious strings found. Clean build confirmed.';
            }

            return 'strings: File not found.';
        },

        'python3': function(args) {
            const joined = args.join(' ');

            if (joined.includes('-c')) {
                const codeMatch = joined.match(/-c\s+["'](.+?)["']/);
                if (!codeMatch) return 'python3: error: argument -c: expected one argument';
                const code = codeMatch[1].toLowerCase();

                if (code.includes('base64') || code.includes('b64decode')) {
                    return 'Use the b64decode command for base64 decoding.\nExample: b64decode dGVzdA==';
                }

                if (code.includes('print')) {
                    return '[python3 output]';
                }

                return 'python3: executed';
            }

            return 'Python 3.11.6\nUsage: python3 [-c cmd | script.py]\n\nFor base64 decoding, use the b64decode command.\nFor binary analysis, use bindiff, strings, or c2extract.';
        },

        'nmap': function(args) {
            if (args.length === 0) return 'Usage: nmap [options] <target>';
            const joined = args.join(' ');

            if (joined.includes('foresight-cdn') || joined.includes('198.51.100')) {
                return 'Starting Nmap 7.94\n\n' +
                    'Nmap scan report for update-telemetry.foresight-cdn.net (198.51.100.42)\n' +
                    'Host is up (0.087s latency).\n\n' +
                    'PORT    STATE  SERVICE\n' +
                    '53/tcp  open   domain\n' +
                    '80/tcp  open   http\n' +
                    '443/tcp open   https\n\n' +
                    'OS detection: Linux 5.x\n' +
                    'Service Info: Bulletproof hosting provider\n\n' +
                    'NOTE: This is the C2 server. DNS TXT queries on port 53\n' +
                    'are the primary C2 channel.';
            }

            return 'Starting Nmap 7.94\nNote: Focus on forensic analysis of the binary artifacts.\nThe C2 domain is update-telemetry.foresight-cdn.net (198.51.100.42)';
        },

        'ping': function(args) {
            return 'Network access restricted on DFIR workstation.\nFocus on forensic analysis of preserved evidence.';
        },

        'dig': function(args) {
            const joined = args.join(' ');

            if (joined.includes('foresight-cdn')) {
                return '; <<>> DiG 9.18.18 <<>> update-telemetry.foresight-cdn.net\n' +
                    ';; ANSWER SECTION:\n' +
                    'update-telemetry.foresight-cdn.net. 3600 IN A 198.51.100.42\n\n' +
                    ';; NOTE: This domain is NOT in Foresight\'s legitimate infrastructure.\n' +
                    ';; Registered 2026-02-28 via privacy proxy.\n' +
                    ';; Points to bulletproof hosting.';
            }

            if (args.length === 0) return 'Usage: dig [@server] <domain> [type]';
            return 'dig: No answer for ' + args[0];
        },

        'whois': function(args) {
            if (args.length === 0) return 'Usage: whois <domain>';
            const joined = args.join(' ');

            if (joined.includes('foresight-cdn')) {
                return 'Domain Name: foresight-cdn.net\n' +
                    'Registrar: PrivacyShield Domains Inc.\n' +
                    'Registered: 2026-02-28\n' +
                    'Registrant: REDACTED FOR PRIVACY\n' +
                    'Name Server: ns1.bulletproof-dns.net\n' +
                    'Name Server: ns2.bulletproof-dns.net\n\n' +
                    'NOTE: Domain registered 14 days before the v2.4.0 release.\n' +
                    'Privacy proxy registration. Bulletproof DNS infrastructure.\n' +
                    'This is the C2 domain used by the Silent Architects.';
            }

            return 'whois: No data found for ' + args[0];
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

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
