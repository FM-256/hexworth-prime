/* ============================================================
   CTF ARENA -- Box F3: The Adaptive Predator
   Polymorphic / Metamorphic Malware Analysis
   Config: malware samples, mutation analysis, C2 extraction
   ============================================================ */

const F3Config = {

    // -------------------------------------------------------
    // BOX METADATA
    // -------------------------------------------------------

    title: 'The Adaptive Predator',
    subtitle: 'Self-Modifying Malware Analysis',
    difficulty: 'Advanced',
    accent: '#dc2626',
    storageKey: 'hexworth_ctf_f3',
    registryId: 'f3-adaptive-predator',
    trackerKey: 'ctf_f3',

    // -------------------------------------------------------
    // PHASE SYSTEM
    // -------------------------------------------------------

    phases: [
        {
            id: 'detection',
            name: 'Threat Detection',
            icon: '\uD83D\uDEA8',
            description: 'Review IDS alerts and identify the polymorphic malware samples captured from the network.',
            requiredFlags: [],
            mitre: ['T1027', 'T1036'],
            unlocks: ['analysis'],
            locked: false
        },
        {
            id: 'analysis',
            name: 'Mutation Analysis',
            icon: '\uD83E\uDDEC',
            description: 'Compare multiple captured variants to identify the invariant core hidden beneath the polymorphic mutations.',
            requiredFlags: [],
            mitre: ['T1027.002', 'T1140'],
            unlocks: ['decryption'],
            locked: true
        },
        {
            id: 'decryption',
            name: 'Engine Decryption',
            icon: '\uD83D\uDD10',
            description: 'Reverse the mutation engine\'s XOR key schedule and decode the obfuscated payload.',
            requiredFlags: ['user'],
            mitre: ['T1140', 'T1573.001'],
            unlocks: ['extraction'],
            locked: true
        },
        {
            id: 'extraction',
            name: 'C2 Extraction',
            icon: '\uD83C\uDFAF',
            description: 'Extract the command-and-control configuration from the decoded payload core.',
            requiredFlags: ['root'],
            mitre: ['T1071.001', 'T1132.001'],
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
                title: 'Review the IDS alerts',
                tip: 'Start by reading the alert log: cat /var/log/ids/alerts.log',
                trigger: { event: 'command', match: { cmd: 'contains:alerts' } }
            },
            {
                title: 'Examine the captured samples',
                tip: 'List and inspect the malware variants: ls /home/analyst/samples/ then use strings or xxd on each sample.',
                trigger: { event: 'command', match: { cmd: 'contains:samples' } }
            },
            {
                title: 'Compare variants to find the invariant core',
                tip: 'Use diff to compare samples side by side. Look for the byte sequence that never changes across mutations.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:diff' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:yara' } }
                    ]
                }
            },
            {
                title: 'Submit the user flag',
                tip: 'Once you identify the invariant signature, the user flag is revealed. Submit it via the Flag panel.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Decode the C2 configuration',
                tip: 'Use the XOR key from the mutation engine to decode the obfuscated C2 config. The root flag is inside.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // -------------------------------------------------------
    // CERT OBJECTIVES (SY0-701)
    // -------------------------------------------------------

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '2.4', description: 'Given a scenario, analyze indicators of malicious activity -- Polymorphic malware identification', skill: 'Polymorphic Signature Analysis' },
            { flagId: 'user', objective: '1.2', description: 'Summarize fundamental security concepts -- Malware types and characteristics', skill: 'Malware Variant Comparison' },
            { flagId: 'root', objective: '2.4', description: 'Given a scenario, analyze indicators of malicious activity -- C2 configuration extraction', skill: 'C2 Infrastructure Analysis' },
            { flagId: 'root', objective: '4.9', description: 'Given a scenario, implement secure protocols -- Identifying obfuscated communications', skill: 'Obfuscated Payload Decryption' }
        ]
    },

    // -------------------------------------------------------
    // BOOT SEQUENCE
    // -------------------------------------------------------

    boot: {
        biosLines: [
            'SANS DFIR Workstation BIOS v7.3.1',
            'Initializing hardware...',
            'Memory Test: 32768 MB OK',
            'Detecting drives... /dev/sda1 (1TB NVMe)',
            'Hardware security module: TPM 2.0 detected',
            'Network isolation: ENABLED (air-gapped)',
            'Write-blocker: /dev/sdb active',
            'Loading GRUB...'
        ],
        grubEntries: [
            'REMnux Analysis Workstation',
            'REMnux (safe mode - no network)',
            'Memory forensics mode'
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
        hostname: 'remnux',
        startDir: '/home/analyst',
        welcome: 'REMnux 7.0 -- Malware Analysis Distribution\nLinux remnux 5.15.0-dfir #1 SMP\n\nType \'help\' for available commands.\nMission: Polymorphic Malware Analysis\n\nWARNING: Polymorphic threat CHIMERA detected on network.\nCaptured samples in /home/analyst/samples/\nAnalysis tools in /home/analyst/tools/\nIDS alerts in /var/log/ids/\n'
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
        base: 1500,
        minScore: 0,
        maxScore: 700,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 1800000, points: 150 },
        timeBonusThreshold: 2700
    },

    // -------------------------------------------------------
    // HINTS
    // -------------------------------------------------------

    hints: [
        {
            id: 'hint1',
            text: 'Start with the IDS alerts in /var/log/ids/alerts.log. They tell you which files were flagged and when. Then examine each sample in /home/analyst/samples/ with strings and xxd.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The malware is polymorphic -- each variant looks different on the surface. Use "diff" to compare the strings output or hex dumps of variant_alpha.bin vs variant_beta.bin. Look for byte patterns that appear in ALL variants.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The invariant core signature is a 16-byte sequence present in every variant. Run the YARA rule chimera_core.yar against each sample to confirm. The user flag is embedded in the match output.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'The C2 config is XOR-encoded in the payload. The key is 0xDEAD (found in the mutation engine analysis). Use the decode_payload.py tool with the correct key to extract the C2 config containing the root flag.',
            cost: 75,
            penalty: -75
        }
    ],

    // -------------------------------------------------------
    // LORE
    // -------------------------------------------------------

    lore: {
        intro: 'A polymorphic malware strain designated CHIMERA has been detected propagating through the Hexworth defense network. Each time it executes, it mutates its own code -- reshuffling instructions, swapping registers, inserting junk operations -- to evade signature-based detection. Four captured samples sit on your analysis workstation. Your mission: find the invariant core that survives every mutation, crack the obfuscation engine, and extract the buried C2 configuration before CHIMERA adapts again.',
        scenario: 'Project Chimera was born in a rogue AI research cell operating out of a decommissioned signals intelligence facility. Their creation -- a self-modifying implant that rewrites its own bytecode after every execution cycle -- has already defeated three AV engines and two EDR platforms. The only samples that exist were captured by a network tap before CHIMERA wiped itself from disk. Time is critical. The mutation engine runs on a predictable XOR key schedule, but the surface-level code changes with every generation. Somewhere beneath the polymorphic shell lies an unchanging 16-byte signature and an encoded C2 beacon. Find them.',
        outro: 'CHIMERA has been dissected. The invariant core signature has been catalogued, the mutation engine\'s XOR schedule broken, and the C2 beacon configuration extracted. The rogue cell\'s infrastructure can now be sinkholed. But the real lesson endures: polymorphic code only delays analysis -- it never prevents it. The core must communicate, and communication requires structure. Structure leaves patterns. Patterns get found.',
        ecer: {
            executive: 'Rogue research cell operated without oversight, creating autonomous offensive tools',
            culture: 'Overconfidence in polymorphic evasion led to neglect of C2 operational security',
            employee: 'Mutation engine developer used a predictable XOR key schedule instead of CSPRNG',
            regulatory: 'No code review or red-team validation of the implant before deployment'
        }
    },

    // -------------------------------------------------------
    // FILESYSTEM
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
                                'samples': {
                                    type: 'dir',
                                    children: {
                                        'README.txt': {
                                            type: 'file',
                                            content: '=== CHIMERA SAMPLE COLLECTION ===\nCaptured: 2026-03-24 through 2026-03-25\nSource: Network tap on segment 10.0.47.0/24\n\nFour variants captured across 18 hours.\nEach is the same malware, mutated.\n\nFiles:\n  variant_alpha.bin   - First capture (03-24 06:14 UTC)\n  variant_beta.bin    - Second capture (03-24 12:41 UTC)\n  variant_gamma.bin   - Third capture (03-24 19:03 UTC)\n  variant_delta.bin   - Fourth capture (03-25 00:22 UTC)\n\nANALYSIS APPROACH:\n1. Run strings on each variant\n2. Compare with diff to find commonalities\n3. Use YARA rules in ~/tools/ to scan\n4. Identify the invariant core signature\n\nWARNING: Do NOT execute these samples.'
                                        },
                                        'variant_alpha.bin': {
                                            type: 'file',
                                            content: '[BINARY - use strings or xxd to examine]'
                                        },
                                        'variant_beta.bin': {
                                            type: 'file',
                                            content: '[BINARY - use strings or xxd to examine]'
                                        },
                                        'variant_gamma.bin': {
                                            type: 'file',
                                            content: '[BINARY - use strings or xxd to examine]'
                                        },
                                        'variant_delta.bin': {
                                            type: 'file',
                                            content: '[BINARY - use strings or xxd to examine]'
                                        }
                                    }
                                },
                                'tools': {
                                    type: 'dir',
                                    children: {
                                        'chimera_core.yar': {
                                            type: 'file',
                                            content: '/* YARA Rule: CHIMERA Invariant Core Detector */\n/* Author: Hexworth Threat Intelligence */\n/* Date: 2026-03-25 */\n\nrule CHIMERA_Invariant_Core\n{\n    meta:\n        description = "Detects the invariant byte sequence in CHIMERA polymorphic variants"\n        author = "Hexworth TI"\n        date = "2026-03-25"\n        severity = "critical"\n        hash_alpha = "a3f1d7..."\n        hash_beta  = "9c2e8b..."\n        hash_gamma = "5f7a01..."\n        hash_delta = "e8b34c..."\n\n    strings:\n        $invariant_core = { 4D 5A 90 00 03 00 00 00 DE AD C0 DE 48 57 50 52 }\n        //                  MZ header stub | 0xDEADC0DE marker | "HWPR" tag\n        $mutex_name = "Global\\\\ChimeraLock_0x7F"\n        $c2_marker  = "@@C2_BEGIN@@"\n\n    condition:\n        $invariant_core and ($mutex_name or $c2_marker)\n}'
                                        },
                                        'polymorphic_detector.yar': {
                                            type: 'file',
                                            content: '/* YARA Rule: Generic Polymorphic Engine Detector */\n\nrule Polymorphic_Engine_Generic\n{\n    meta:\n        description = "Detects common polymorphic engine patterns"\n        author = "Hexworth TI"\n\n    strings:\n        $xor_loop    = { 31 ?? 83 ?? 01 39 ?? 75 }\n        $reg_swap    = { 87 ?? 87 ?? 90 }\n        $junk_nop    = { 90 90 90 66 90 0F 1F 00 }\n        $self_modify = "VirtualProtect"\n        $rwe_section = ".morph"\n\n    condition:\n        3 of them\n}'
                                        },
                                        'decode_payload.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nCHIMERA Payload Decoder\nUsage: python3 decode_payload.py <xor_key_hex>\n\nThe CHIMERA mutation engine uses a rotating XOR key\nto encode its C2 configuration payload. Supply the\ncorrect key to decode the hidden C2 config.\n\nKey hint: Look at the mutation engine analysis output.\nThe key is a 2-byte value visible in the XOR schedule.\n"""\nimport sys\n\nif len(sys.argv) < 2:\n    print("Usage: python3 decode_payload.py <xor_key_hex>")\n    print("Example: python3 decode_payload.py 0xDEAD")\n    sys.exit(1)\n\nkey = sys.argv[1]\n# Key validation happens at runtime\n# Correct key decodes the C2 beacon config'
                                        },
                                        'analyze_mutations.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nCHIMERA Mutation Engine Analyzer\nCompares variant hex dumps to map the mutation pattern.\n\nUsage: python3 analyze_mutations.py\n\nThis script compares all four CHIMERA variants and\nproduces a mutation map showing:\n  - Which byte offsets change between variants\n  - Which byte offsets remain constant (invariant core)\n  - The XOR key schedule used by the mutation engine\n"""\nprint("Analyzing CHIMERA mutation patterns...")\nprint("Loading variants: alpha, beta, gamma, delta")\nprint()\nprint("[Run this script to see the full analysis]")'
                                        }
                                    }
                                },
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: CHIMERA polymorphic malware\nObjective: Identify invariant core + extract C2 config\n\nAttack steps:\n1. Review IDS alerts (/var/log/ids/alerts.log)\n2. Examine captured samples with strings/xxd\n3. Compare variants with diff to find invariant bytes\n4. Run YARA rules to confirm invariant core signature\n5. Analyze the mutation engine to find the XOR key\n6. Decode the obfuscated C2 configuration\n\nTools: strings, xxd, diff, yara, objdump, strace, python3\n\nBoth flags are buried in the analysis.\nGood luck, analyst.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls samples/\ncat /var/log/ids/alerts.log\nstrings samples/variant_alpha.bin\nfile samples/*.bin'
                                }
                            }
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    children: {
                        'log': {
                            type: 'dir',
                            children: {
                                'ids': {
                                    type: 'dir',
                                    children: {
                                        'alerts.log': {
                                            type: 'file',
                                            content: '=== SNORT IDS ALERT LOG ===\nSensor: ids-sensor-04 (10.0.47.1)\nRuleset: ET MALWARE + Hexworth Custom\n\n[**] [1:2026001:1] MALWARE CHIMERA Polymorphic Dropper Variant A [**]\n[Classification: A Network Trojan was detected]\n[Priority: 1]\n03/24/2026-06:14:33.482910 10.0.47.105:49152 -> 10.0.47.200:443\nTCP TTL:64 TOS:0x0 ID:54271 IpLen:20 DgmLen:1500\n***AP*** Seq: 0xA3F1D700 Ack: 0x00000000 Win: 0xFFFF TcpLen: 32\n[Xref => CHIMERA-TI-001]\nSHA256: a3f1d70bc84e9912dfa5c3e7b8267104f9a5b3d2c1e0f8a7b6c5d4e3f2a1b0c9\n\n[**] [1:2026001:2] MALWARE CHIMERA Polymorphic Dropper Variant B [**]\n[Classification: A Network Trojan was detected]\n[Priority: 1]\n03/24/2026-12:41:17.194620 10.0.47.108:51200 -> 10.0.47.200:443\nTCP TTL:64 TOS:0x0 ID:54272 IpLen:20 DgmLen:1487\n***AP*** Seq: 0x9C2E8B00 Ack: 0x00000000 Win: 0xFFFF TcpLen: 32\n[Xref => CHIMERA-TI-001]\nSHA256: 9c2e8b1ad73f0823eb64d5f6c9387215e0b6c4e3d2f1a0b9c8d7e6f5a4b3c2d1\nNOTE: Different hash from Variant A -- code mutation confirmed\n\n[**] [1:2026001:3] MALWARE CHIMERA Polymorphic Dropper Variant C [**]\n[Classification: A Network Trojan was detected]\n[Priority: 1]\n03/24/2026-19:03:44.837150 10.0.47.112:53248 -> 10.0.47.200:443\nTCP TTL:64 TOS:0x0 ID:54273 IpLen:20 DgmLen:1512\n***AP*** Seq: 0x5F7A0100 Ack: 0x00000000 Win: 0xFFFF TcpLen: 32\n[Xref => CHIMERA-TI-001]\nSHA256: 5f7a0142be85f934fc76e0d7da498326f1c7d5f4e3a2b1c0d9e8f7a6b5c4d3e2\nNOTE: Third unique hash in 13 hours -- polymorphic engine active\n\n[**] [1:2026001:4] MALWARE CHIMERA Polymorphic Dropper Variant D [**]\n[Classification: A Network Trojan was detected]\n[Priority: 1]\n03/25/2026-00:22:08.561290 10.0.47.119:55296 -> 10.0.47.200:443\nTCP TTL:64 TOS:0x0 ID:54274 IpLen:20 DgmLen:1498\n***AP*** Seq: 0xE8B34C00 Ack: 0x00000000 Win: 0xFFFF TcpLen: 32\n[Xref => CHIMERA-TI-001]\nSHA256: e8b34c53cf96a045ad87f1e8eb5a9437a2d8e6a5f4b3c2d1e0f9a8b7c6d5e4f3\n\n=== ALERT SUMMARY ===\n4 variants captured over 18 hours\nAll contacted same C2: 10.0.47.200:443\nAll created mutex: Global\\ChimeraLock_0x7F\nAll hashes unique -- polymorphic code confirmed\nInvariant behavior: same C2 destination, same mutex\nRecommendation: Perform binary diff analysis to find invariant byte signature'
                                        },
                                        'suricata_eve.json': {
                                            type: 'file',
                                            content: '{"timestamp":"2026-03-24T06:14:33.482910","event_type":"alert","src_ip":"10.0.47.105","dest_ip":"10.0.47.200","dest_port":443,"alert":{"signature":"CHIMERA Polymorphic Dropper","severity":1,"category":"A Network Trojan was detected"},"flow":{"bytes_toserver":14832,"bytes_toclient":512}}\n{"timestamp":"2026-03-24T12:41:17.194620","event_type":"alert","src_ip":"10.0.47.108","dest_ip":"10.0.47.200","dest_port":443,"alert":{"signature":"CHIMERA Polymorphic Dropper","severity":1},"flow":{"bytes_toserver":14719,"bytes_toclient":498}}\n{"timestamp":"2026-03-24T19:03:44.837150","event_type":"alert","src_ip":"10.0.47.112","dest_ip":"10.0.47.200","dest_port":443,"alert":{"signature":"CHIMERA Polymorphic Dropper","severity":1},"flow":{"bytes_toserver":14960,"bytes_toclient":524}}\n{"timestamp":"2026-03-25T00:22:08.561290","event_type":"alert","src_ip":"10.0.47.119","dest_ip":"10.0.47.200","dest_port":443,"alert":{"signature":"CHIMERA Polymorphic Dropper","severity":1},"flow":{"bytes_toserver":14856,"bytes_toclient":506}}'
                                        }
                                    }
                                },
                                'syslog': {
                                    type: 'file',
                                    content: 'Mar 24 06:14:31 remnux kernel: [  142.891] USB write-blocker: /dev/sdb mounted read-only\nMar 24 06:14:33 remnux snort[1847]: ALERT: CHIMERA variant A detected [10.0.47.105 -> 10.0.47.200:443]\nMar 24 06:14:34 remnux pcap-agent[1902]: Sample captured: variant_alpha.bin (14832 bytes)\nMar 24 12:41:17 remnux snort[1847]: ALERT: CHIMERA variant B detected [10.0.47.108 -> 10.0.47.200:443]\nMar 24 12:41:18 remnux pcap-agent[1902]: Sample captured: variant_beta.bin (14719 bytes)\nMar 24 19:03:44 remnux snort[1847]: ALERT: CHIMERA variant C detected [10.0.47.112 -> 10.0.47.200:443]\nMar 24 19:03:45 remnux pcap-agent[1902]: Sample captured: variant_gamma.bin (14960 bytes)\nMar 25 00:22:08 remnux snort[1847]: ALERT: CHIMERA variant D detected [10.0.47.119 -> 10.0.47.200:443]\nMar 25 00:22:09 remnux pcap-agent[1902]: Sample captured: variant_delta.bin (14856 bytes)\nMar 25 00:22:10 remnux pcap-agent[1902]: WARNING: 4 unique hashes, same C2 target -- polymorphic threat confirmed'
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'remnux' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\nanalyst:x:1000:1000:Malware Analyst,,,:/home/analyst:/bin/bash'
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'share': {
                            type: 'dir',
                            children: {
                                'yara': {
                                    type: 'dir',
                                    children: {
                                        'rules': {
                                            type: 'dir',
                                            children: {
                                                'malware_index.yar': {
                                                    type: 'file',
                                                    content: '/* Master YARA rule index */\ninclude "/home/analyst/tools/chimera_core.yar"\ninclude "/home/analyst/tools/polymorphic_detector.yar"'
                                                }
                                            }
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
    // TERMINAL COMMANDS (box-specific simulated tools)
    // -------------------------------------------------------

    commands: {

        'strings': function(args, term, engine) {
            if (args.length === 0) return 'Usage: strings [options] <file>\n  -a    Scan entire file\n  -n N  Minimum string length';

            const joined = args.join(' ');

            if (joined.includes('variant_alpha')) {
                return 'CHIMERA_ALPHA_GEN_001\n.text\n.data\n.morph\n.reloc\nGetProcAddress\nLoadLibraryA\nVirtualProtect\nCreateMutexA\nGlobal\\ChimeraLock_0x7F\nkernel32.dll\nntdll.dll\nws2_32.dll\nWSAStartup\nconnect\nsend\nrecv\n10.0.47.200\nMozilla/5.0 (Windows NT 10.0)\nPOST /api/beacon HTTP/1.1\njunk_block_alpha_0x41414141\nnop_sled_gen1_AABBCCDD\nxor_mutation_seed_0xDEAD\n@@C2_BEGIN@@\nb3a7d9f1e2c8a4b6d0e5f3a9c7b1d8e2\n@@C2_END@@\nMZ\x90\x00\x03\x00\x00\x00\xDE\xAD\xC0\xDE\x48\x57\x50\x52\nexit_process_alpha\nSHA256_SELF_CHECK';
            }

            if (joined.includes('variant_beta')) {
                return 'CHIMERA_BETA_GEN_002\n.text\n.rdata\n.morph\n.rsrc\nGetProcAddress\nLoadLibraryA\nVirtualProtect\nCreateMutexA\nGlobal\\ChimeraLock_0x7F\nkernel32.dll\nntdll.dll\nws2_32.dll\nWSAStartup\nconnect\nsend\nrecv\n10.0.47.200\nMozilla/5.0 (Windows NT 10.0)\nPOST /api/beacon HTTP/1.1\njunk_block_beta_0x42424242\nnop_sled_gen2_EEFFAABB\nxor_mutation_seed_0xDEAD\n@@C2_BEGIN@@\nb3a7d9f1e2c8a4b6d0e5f3a9c7b1d8e2\n@@C2_END@@\nMZ\x90\x00\x03\x00\x00\x00\xDE\xAD\xC0\xDE\x48\x57\x50\x52\nexit_process_beta\nCRC32_INTEGRITY';
            }

            if (joined.includes('variant_gamma')) {
                return 'CHIMERA_GAMMA_GEN_003\n.code\n.data\n.morph\n.debug\nGetProcAddress\nLoadLibraryA\nVirtualProtect\nCreateMutexA\nGlobal\\ChimeraLock_0x7F\nkernel32.dll\nntdll.dll\nws2_32.dll\nWSAStartup\nconnect\nsend\nrecv\n10.0.47.200\nMozilla/5.0 (Windows NT 10.0)\nPOST /api/beacon HTTP/1.1\njunk_block_gamma_0x43434343\nnop_sled_gen3_CCDDEEFF\nxor_mutation_seed_0xDEAD\n@@C2_BEGIN@@\nb3a7d9f1e2c8a4b6d0e5f3a9c7b1d8e2\n@@C2_END@@\nMZ\x90\x00\x03\x00\x00\x00\xDE\xAD\xC0\xDE\x48\x57\x50\x52\nexit_process_gamma\nMD5_SELF_HASH';
            }

            if (joined.includes('variant_delta')) {
                return 'CHIMERA_DELTA_GEN_004\n.text\n.bss\n.morph\n.tls\nGetProcAddress\nLoadLibraryA\nVirtualProtect\nCreateMutexA\nGlobal\\ChimeraLock_0x7F\nkernel32.dll\nntdll.dll\nws2_32.dll\nWSAStartup\nconnect\nsend\nrecv\n10.0.47.200\nMozilla/5.0 (Windows NT 10.0)\nPOST /api/beacon HTTP/1.1\njunk_block_delta_0x44444444\nnop_sled_gen4_AADDBBCC\nxor_mutation_seed_0xDEAD\n@@C2_BEGIN@@\nb3a7d9f1e2c8a4b6d0e5f3a9c7b1d8e2\n@@C2_END@@\nMZ\x90\x00\x03\x00\x00\x00\xDE\xAD\xC0\xDE\x48\x57\x50\x52\nexit_process_delta\nSIPHASH_VALIDATE';
            }

            // Generic file strings
            const filePath = args.find(function(a) { return !a.startsWith('-'); });
            if (filePath) {
                var resolved = engine.resolvePath ? engine.resolvePath(filePath) : filePath;
                var file = engine.getFile ? engine.getFile(resolved) : null;
                if (file && file.type === 'file') {
                    return file.content;
                }
                return 'strings: \'' + filePath + '\': No such file';
            }

            return 'strings: No input file specified';
        },

        'xxd': function(args, term, engine) {
            if (args.length === 0) return 'Usage: xxd [options] [file]\n  -l N  Length (bytes to show)\n  -s N  Seek to offset\n  -p    Plain hex dump\n  -r    Reverse (hex to binary)';

            var joined = args.join(' ');

            if (joined.includes('variant_alpha')) {
                return '00000000: 4d5a 9000 0300 0000 dead c0de 4857 5052  MZ..........HWPR\n00000010: 0000 0000 0000 0000 4141 4141 4141 4141  ........AAAAAAAA\n00000020: b8f2 c341 9090 9090 6690 0f1f 0000 0000  ...A....f.......\n00000030: 31c0 83c0 0139 c875 f7e8 0a00 0000 4348  1....9.u......CH\n00000040: 494d 4552 415f 414c 5048 4100 0000 0000  IMERA_ALPHA.....\n00000050: 786f 725f 6d75 7461 7469 6f6e 5f73 6565  xor_mutation_see\n00000060: 645f 3078 4445 4144 0000 0000 0000 0000  d_0xDEAD........\n00000070: 4040 4332 5f42 4547 494e 4040 0000 0000  @@C2_BEGIN@@....\n00000080: 6233 6137 6439 6631 6532 6338 6134 6236  b3a7d9f1e2c8a4b6\n00000090: 6430 6535 6633 6139 6337 6231 6438 6532  d0e5f3a9c7b1d8e2\n000000a0: 4040 4332 5f45 4e44 4040 0000 0000 0000  @@C2_END@@......\n000000b0: 6a75 6e6b 5f62 6c6f 636b 5f61 6c70 6861  junk_block_alpha\n000000c0: 5f30 7834 3134 3134 3134 3100 0000 0000  _0x41414141.....';
            }

            if (joined.includes('variant_beta')) {
                return '00000000: 4d5a 9000 0300 0000 dead c0de 4857 5052  MZ..........HWPR\n00000010: 0000 0000 0000 0000 4242 4242 4242 4242  ........BBBBBBBB\n00000020: a7e1 d452 9090 9090 6690 0f1f 0000 0000  ...R....f.......\n00000030: 31db 83c3 0139 d375 f7e8 0a00 0000 4348  1....9.u......CH\n00000040: 494d 4552 415f 4245 5441 0000 0000 0000  IMERA_BETA......\n00000050: 786f 725f 6d75 7461 7469 6f6e 5f73 6565  xor_mutation_see\n00000060: 645f 3078 4445 4144 0000 0000 0000 0000  d_0xDEAD........\n00000070: 4040 4332 5f42 4547 494e 4040 0000 0000  @@C2_BEGIN@@....\n00000080: 6233 6137 6439 6631 6532 6338 6134 6236  b3a7d9f1e2c8a4b6\n00000090: 6430 6535 6633 6139 6337 6231 6438 6532  d0e5f3a9c7b1d8e2\n000000a0: 4040 4332 5f45 4e44 4040 0000 0000 0000  @@C2_END@@......\n000000b0: 6a75 6e6b 5f62 6c6f 636b 5f62 6574 615f  junk_block_beta_\n000000c0: 3078 3432 3432 3432 3432 0000 0000 0000  0x42424242......';
            }

            if (joined.includes('variant_gamma')) {
                return '00000000: 4d5a 9000 0300 0000 dead c0de 4857 5052  MZ..........HWPR\n00000010: 0000 0000 0000 0000 4343 4343 4343 4343  ........CCCCCCCC\n00000020: c5d0 e563 9090 9090 6690 0f1f 0000 0000  ...c....f.......\n00000030: 31c9 83c1 0139 c175 f7e8 0a00 0000 4348  1....9.u......CH\n00000040: 494d 4552 415f 4741 4d4d 4100 0000 0000  IMERA_GAMMA.....\n00000050: 786f 725f 6d75 7461 7469 6f6e 5f73 6565  xor_mutation_see\n00000060: 645f 3078 4445 4144 0000 0000 0000 0000  d_0xDEAD........\n00000070: 4040 4332 5f42 4547 494e 4040 0000 0000  @@C2_BEGIN@@....\n00000080: 6233 6137 6439 6631 6532 6338 6134 6236  b3a7d9f1e2c8a4b6\n00000090: 6430 6535 6633 6139 6337 6231 6438 6532  d0e5f3a9c7b1d8e2\n000000a0: 4040 4332 5f45 4e44 4040 0000 0000 0000  @@C2_END@@......\n000000b0: 6a75 6e6b 5f62 6c6f 636b 5f67 616d 6d61  junk_block_gamma\n000000c0: 5f30 7834 3334 3334 3334 3300 0000 0000  _0x43434343.....';
            }

            if (joined.includes('variant_delta')) {
                return '00000000: 4d5a 9000 0300 0000 dead c0de 4857 5052  MZ..........HWPR\n00000010: 0000 0000 0000 0000 4444 4444 4444 4444  ........DDDDDDDD\n00000020: d4c1 f674 9090 9090 6690 0f1f 0000 0000  ...t....f.......\n00000030: 31d2 83c2 0139 d275 f7e8 0a00 0000 4348  1....9.u......CH\n00000040: 494d 4552 415f 4445 4c54 4100 0000 0000  IMERA_DELTA.....\n00000050: 786f 725f 6d75 7461 7469 6f6e 5f73 6565  xor_mutation_see\n00000060: 645f 3078 4445 4144 0000 0000 0000 0000  d_0xDEAD........\n00000070: 4040 4332 5f42 4547 494e 4040 0000 0000  @@C2_BEGIN@@....\n00000080: 6233 6137 6439 6631 6532 6338 6134 6236  b3a7d9f1e2c8a4b6\n00000090: 6430 6535 6633 6139 6337 6231 6438 6532  d0e5f3a9c7b1d8e2\n000000a0: 4040 4332 5f45 4e44 4040 0000 0000 0000  @@C2_END@@......\n000000b0: 6a75 6e6b 5f62 6c6f 636b 5f64 656c 7461  junk_block_delta\n000000c0: 5f30 7834 3434 3434 3434 3400 0000 0000  _0x44444444.....';
            }

            var filePath = args.find(function(a) { return !a.startsWith('-'); });
            if (filePath) {
                var resolved = engine.resolvePath ? engine.resolvePath(filePath) : filePath;
                var file = engine.getFile ? engine.getFile(resolved) : null;
                if (file && file.type === 'file') {
                    return '[hex dump of ' + filePath + ']';
                }
                return 'xxd: ' + filePath + ': No such file or directory';
            }
            return 'xxd: No input file specified';
        },

        'diff': function(args, term, engine) {
            if (args.length < 2) return 'Usage: diff [options] file1 file2\n  -u    Unified diff\n  -y    Side-by-side\n  --color  Colorized output';

            var joined = args.join(' ');

            // Comparing any two variants
            if (joined.includes('variant_') && (joined.includes('alpha') || joined.includes('beta') || joined.includes('gamma') || joined.includes('delta'))) {
                engine.advancePhase && engine.advancePhase('analysis');
                return '=== BINARY DIFF ANALYSIS ===\n\nComparing CHIMERA variants...\n\n--- BYTES THAT CHANGE (polymorphic regions) ---\nOffset 0x0010-0x001F: Junk padding (AAAA vs BBBB vs CCCC vs DDDD)\nOffset 0x0020-0x002F: Mutated code block (register swaps, different opcodes)\nOffset 0x0030-0x0033: XOR loop uses different register (eax/ebx/ecx/edx)\nOffset 0x0040-0x004F: Variant identifier string changes\nOffset 0x00B0-0x00CF: Junk block identifier changes\n\n--- BYTES THAT NEVER CHANGE (invariant core) ---\nOffset 0x0000-0x000F: MZ header + DEADC0DE marker + HWPR tag\n  >> 4D 5A 90 00 03 00 00 00 DE AD C0 DE 48 57 50 52\nOffset 0x0050-0x006F: XOR mutation seed (always 0xDEAD)\nOffset 0x0070-0x00AF: C2 payload block (@@C2_BEGIN@@ ... @@C2_END@@)\n  >> Encoded C2: b3a7d9f1e2c8a4b6d0e5f3a9c7b1d8e2\n\n=== INVARIANT SIGNATURE (16 bytes) ===\n4D 5A 90 00 03 00 00 00 DE AD C0 DE 48 57 50 52\n\nThis is the polymorphic malware\'s fingerprint.\nIt persists across ALL mutations.\n\n{{FLAG:user}}';
            }

            return 'diff: missing operands\nUsage: diff file1 file2';
        },

        'yara': function(args, term, engine) {
            if (args.length === 0) return 'Usage: yara [options] RULES_FILE TARGET\n  -s    Print matching strings\n  -r    Recursive scan\n  -m    Print metadata';

            var joined = args.join(' ');

            // Scan with chimera_core.yar
            if (joined.includes('chimera_core') || joined.includes('core.yar')) {
                engine.advancePhase && engine.advancePhase('analysis');

                var target = '';
                if (joined.includes('alpha'))      target = 'variant_alpha.bin';
                else if (joined.includes('beta'))  target = 'variant_beta.bin';
                else if (joined.includes('gamma')) target = 'variant_gamma.bin';
                else if (joined.includes('delta')) target = 'variant_delta.bin';
                else if (joined.includes('samples') || joined.includes('*') || joined.includes('/'))
                    target = 'samples/*';

                if (target === 'samples/*') {
                    return 'CHIMERA_Invariant_Core samples/variant_alpha.bin\n  [+] $invariant_core at 0x0000: { 4D 5A 90 00 03 00 00 00 DE AD C0 DE 48 57 50 52 }\n  [+] $mutex_name at 0x0128: "Global\\\\ChimeraLock_0x7F"\n  [+] $c2_marker at 0x0070: "@@C2_BEGIN@@"\n\nCHIMERA_Invariant_Core samples/variant_beta.bin\n  [+] $invariant_core at 0x0000: { 4D 5A 90 00 03 00 00 00 DE AD C0 DE 48 57 50 52 }\n  [+] $mutex_name at 0x0134: "Global\\\\ChimeraLock_0x7F"\n  [+] $c2_marker at 0x0070: "@@C2_BEGIN@@"\n\nCHIMERA_Invariant_Core samples/variant_gamma.bin\n  [+] $invariant_core at 0x0000: { 4D 5A 90 00 03 00 00 00 DE AD C0 DE 48 57 50 52 }\n  [+] $mutex_name at 0x012C: "Global\\\\ChimeraLock_0x7F"\n  [+] $c2_marker at 0x0070: "@@C2_BEGIN@@"\n\nCHIMERA_Invariant_Core samples/variant_delta.bin\n  [+] $invariant_core at 0x0000: { 4D 5A 90 00 03 00 00 00 DE AD C0 DE 48 57 50 52 }\n  [+] $mutex_name at 0x0130: "Global\\\\ChimeraLock_0x7F"\n  [+] $c2_marker at 0x0070: "@@C2_BEGIN@@"\n\n=== SCAN SUMMARY ===\n4 files scanned, 4 matches\nAll 4 variants contain the invariant core signature:\n  4D 5A 90 00 03 00 00 00 DE AD C0 DE 48 57 50 52\n\nPolymorphic mutation confirmed but core fingerprint is STABLE.\n\n{{FLAG:user}}';
                }

                if (target) {
                    return 'CHIMERA_Invariant_Core ' + target + '\n  [+] $invariant_core at 0x0000: { 4D 5A 90 00 03 00 00 00 DE AD C0 DE 48 57 50 52 }\n  [+] $mutex_name: "Global\\\\ChimeraLock_0x7F"\n  [+] $c2_marker: "@@C2_BEGIN@@"\n\nMatch: invariant 16-byte core signature found.';
                }

                return 'yara: no target file specified';
            }

            // Scan with polymorphic_detector.yar
            if (joined.includes('polymorphic') || joined.includes('detector.yar')) {
                return 'Polymorphic_Engine_Generic samples/variant_alpha.bin\n  [+] $xor_loop at 0x0030\n  [+] $junk_nop at 0x0024\n  [+] $self_modify: "VirtualProtect"\n  [+] $rwe_section: ".morph"\n\nPolymorphic_Engine_Generic samples/variant_beta.bin\n  [+] $xor_loop at 0x0030\n  [+] $reg_swap at 0x0022\n  [+] $self_modify: "VirtualProtect"\n  [+] $rwe_section: ".morph"\n\n4 of 5 indicators matched. Polymorphic engine confirmed.';
            }

            return 'yara: could not load rule file';
        },

        'objdump': function(args, term, engine) {
            if (args.length === 0) return 'Usage: objdump [options] <file>\n  -d    Disassemble\n  -h    Section headers\n  -x    All headers\n  -s    Full contents';

            var joined = args.join(' ');

            if (joined.includes('-h') || joined.includes('--headers') || joined.includes('-x')) {
                var variant = 'ALPHA';
                if (joined.includes('beta'))  variant = 'BETA';
                if (joined.includes('gamma')) variant = 'GAMMA';
                if (joined.includes('delta')) variant = 'DELTA';

                var sections = {
                    'ALPHA': '.text .data .morph .reloc',
                    'BETA':  '.text .rdata .morph .rsrc',
                    'GAMMA': '.code .data .morph .debug',
                    'DELTA': '.text .bss .morph .tls'
                };

                return 'variant_' + variant.toLowerCase() + '.bin:     file format pe-i386\n\nSections:\nIdx Name          Size      VMA       LMA       File off  Algn\n  0 ' + sections[variant].split(' ')[0] + '         00001a00  00401000  00401000  00000200  2**4\n                  CONTENTS, ALLOC, LOAD, CODE\n  1 ' + sections[variant].split(' ')[1] + '         00000400  00403000  00403000  00001c00  2**4\n                  CONTENTS, ALLOC, LOAD, DATA\n  2 .morph        00000800  00404000  00404000  00002000  2**4\n                  CONTENTS, ALLOC, LOAD, CODE, DATA, READ, WRITE, EXECUTE\n  3 ' + sections[variant].split(' ')[3] + '         00000200  00405000  00405000  00002800  2**2\n                  CONTENTS, ALLOC, LOAD\n\nNOTE: .morph section has RWX permissions -- self-modifying code region\nThis is where the polymorphic mutation engine lives.';
            }

            if (joined.includes('-d') || joined.includes('--disassemble')) {
                return 'Disassembly of section .morph:\n\n00404000 <mutation_engine>:\n  404000:   31 c0                xor    eax,eax\n  404002:   b9 00 10 00 00       mov    ecx,0x1000\n  404007:   8b 35 00 40 40 00    mov    esi,DWORD PTR [0x404000]\n  40400d:   bf 00 50 40 00       mov    edi,0x405000\n\n00404012 <xor_decrypt_loop>:\n  404012:   8a 06                mov    al,BYTE PTR [esi]\n  404014:   34 ad                xor    al,0xAD         ; low byte of key 0xDEAD\n  404016:   34 de                xor    al,0xDE         ; high byte of key 0xDEAD\n  404018:   88 07                mov    BYTE PTR [edi],al\n  40401a:   46                   inc    esi\n  40401b:   47                   inc    edi\n  40401c:   e2 f4                loop   404012\n\n00404020 <register_shuffle>:\n  404020:   87 d9                xchg   ecx,ebx       ; register swap (mutates)\n  404022:   87 ca                xchg   edx,ecx       ; register swap (mutates)\n  404024:   90                   nop                   ; junk NOP\n  404025:   90                   nop\n  404026:   90                   nop\n  404027:   66 90                xchg   ax,ax          ; 2-byte NOP\n  404029:   0f 1f 00             nop    DWORD PTR [eax] ; 3-byte NOP\n\n00404030 <rebuild_code>:\n  404030:   68 00 10 40 00       push   0x401000       ; .text base\n  404035:   68 00 1a 00 00       push   0x1a00         ; .text size\n  40403a:   6a 40                push   0x40            ; PAGE_EXECUTE_READWRITE\n  40403c:   ff 15 ?? ?? ?? ??    call   VirtualProtect ; make .text writable\n  404042:   e8 ?? ?? ?? ??       call   generate_new_code\n\n=== KEY FINDING ===\nXOR key schedule at offset 0x404014-0x404018:\n  Key bytes: 0xAD, 0xDE => Combined: 0xDEAD\nThis is the mutation engine\'s encryption key.';
            }

            return 'objdump: specify at least one of -d, -h, -x, -s';
        },

        'strace': function(args, term, engine) {
            if (args.length === 0) return 'Usage: strace [options] <command>\n  -f    Follow forks\n  -e    Filter syscalls\n  -o    Output file\n\nWARNING: Do NOT execute malware samples directly.\nUse strace -f -o trace.log ./sample in a sandbox.';

            var joined = args.join(' ');

            if (joined.includes('variant_') || joined.includes('sample')) {
                return '[sandbox] Tracing in isolated environment...\n\nexecve("./variant_sample", ["./variant_sample"], [/* env */]) = 0\nbrk(NULL)                               = 0x5600000\nmmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f0000\nopen("/proc/self/exe", O_RDONLY)         = 3\nread(3, "MZ\\x90\\x00\\x03\\x00\\x00\\x00\\xde\\xad\\xc0\\xde\\x48\\x57\\x50\\x52"..., 4096) = 4096\n--- Self-read: loading own code for mutation ---\nmprotect(0x404000, 4096, PROT_READ|PROT_WRITE|PROT_EXEC) = 0\n--- .morph section now RWX: mutation engine activating ---\nopen("Global\\\\ChimeraLock_0x7F", O_CREAT|O_EXCL) = 4\n--- Mutex created: single instance enforcement ---\nsocket(AF_INET, SOCK_STREAM, 0)          = 5\nconnect(5, {sa_family=AF_INET, sin_port=htons(443), sin_addr=inet_addr("10.0.47.200")}, 16) = 0\n--- C2 connection established ---\nwrite(5, "POST /api/beacon HTTP/1.1\\r\\nHost: 10.0.47.200\\r\\n"..., 256) = 256\nread(5, "HTTP/1.1 200 OK\\r\\n"..., 4096) = 128\n--- C2 beacon acknowledged ---\nwrite(3, "\\x4d\\x5a\\x90\\x00"..., 14832) = 14832\n--- Self-modification: rewriting own binary on disk ---\nclose(3)                                 = 0\nclose(5)                                 = 0\nexit_group(0)                            = ?\n\n=== STRACE ANALYSIS ===\nKey behaviors:\n1. Reads own binary (/proc/self/exe) -- self-analysis\n2. Makes .morph section RWX -- prepares for mutation\n3. Creates mutex Global\\ChimeraLock_0x7F -- single instance\n4. Connects to C2 at 10.0.47.200:443 -- beacon\n5. Rewrites own binary on disk -- polymorphic mutation\n\nThe invariant core (offset 0x0000-0x000F) is NEVER modified.\nThe XOR key 0xDEAD is used to decode the C2 config at runtime.';
            }

            return 'strace: must specify a command to trace';
        },

        'python3': function(args, term, engine) {
            var joined = args.join(' ');

            // python3 -c "..."
            if (joined.includes('-c')) {
                var codeMatch = joined.match(/-c\s+["'](.+?)["']/);
                if (!codeMatch) return 'python3: error: argument -c: expected one argument';
                var code = codeMatch[1].toLowerCase();

                // XOR decode with correct key
                if ((code.includes('0xdead') || code.includes('dead') || code.includes('57005')) && (code.includes('xor') || code.includes('^') || code.includes('decode') || code.includes('b3a7'))) {
                    engine.advancePhase && engine.advancePhase('extraction');
                    return 'Decoding C2 payload with XOR key 0xDEAD...\n\nEncoded:  b3a7d9f1e2c8a4b6d0e5f3a9c7b1d8e2\nKey:      0xDEAD (rotating 2-byte)\n\nDecoded C2 Configuration:\n================================\n  C2 Server:    10.0.47.200\n  C2 Port:      443\n  Beacon Path:  /api/beacon\n  Protocol:     HTTPS\n  Interval:     300s (5 min)\n  Jitter:       20%\n  User-Agent:   Mozilla/5.0 (Windows NT 10.0)\n  Exfil Method: POST multipart/form-data\n  Kill Date:    2026-04-15\n  Campaign ID:  CHIMERA-OPS-7F\n================================\n\n{{FLAG:root}}';
                }

                // Generic XOR attempt with wrong key
                if (code.includes('xor') || code.includes('^')) {
                    return 'XOR decode result: [garbled binary output]\nThe decoded output is not readable. Wrong key?\nHint: Check the mutation engine for the correct XOR key value.';
                }

                // Hex decode
                if (code.includes('bytes.fromhex') || code.includes('unhexlify') || code.includes('b3a7d9f1')) {
                    return 'Raw bytes: b\'\\xb3\\xa7\\xd9\\xf1\\xe2\\xc8\\xa4\\xb6\\xd0\\xe5\\xf3\\xa9\\xc7\\xb1\\xd8\\xe2\'\nThis is the encoded C2 payload.\nIt needs to be XOR-decoded with the mutation engine\'s key.\nHint: Find the XOR key in the disassembly or strings output.';
                }

                if (code.includes('print')) {
                    return '[python3 output]';
                }

                return 'python3: executed';
            }

            // python3 decode_payload.py
            if (joined.includes('decode_payload')) {
                if (joined.includes('0xDEAD') || joined.includes('0xdead') || joined.includes('DEAD') || joined.includes('dead')) {
                    engine.advancePhase && engine.advancePhase('extraction');
                    return '[*] CHIMERA Payload Decoder\n[*] XOR Key: 0xDEAD\n[*] Decoding C2 configuration...\n\nEncoded payload: b3a7d9f1e2c8a4b6d0e5f3a9c7b1d8e2\n\n=== DECODED C2 CONFIGURATION ===\n  C2 Server:    10.0.47.200\n  C2 Port:      443\n  Beacon Path:  /api/beacon\n  Protocol:     HTTPS\n  Interval:     300s (5 min)\n  Jitter:       20%\n  User-Agent:   Mozilla/5.0 (Windows NT 10.0)\n  Exfil Method: POST multipart/form-data\n  Kill Date:    2026-04-15\n  Campaign ID:  CHIMERA-OPS-7F\n================================\n\n[+] C2 configuration successfully extracted!\n\n{{FLAG:root}}';
                }

                if (joined.match(/0x[0-9a-fA-F]+/) || joined.match(/[0-9a-fA-F]{4,}/)) {
                    return '[*] CHIMERA Payload Decoder\n[*] XOR Key: ' + (joined.match(/0x[0-9a-fA-F]+/) || ['unknown'])[0] + '\n[!] ERROR: Decoded output is not valid UTF-8.\n[!] The XOR key appears to be incorrect.\n[!] Hint: Look for the key in the mutation engine disassembly.\n[!] Try: objdump -d samples/variant_alpha.bin | grep xor';
                }

                return '[*] CHIMERA Payload Decoder\nUsage: python3 decode_payload.py <xor_key_hex>\nExample: python3 decode_payload.py 0xDEAD';
            }

            // python3 analyze_mutations.py
            if (joined.includes('analyze_mutations')) {
                engine.advancePhase && engine.advancePhase('decryption');
                return '[*] CHIMERA Mutation Engine Analyzer\n[*] Loading variants: alpha, beta, gamma, delta\n\n=== MUTATION MAP ===\n\nOffset Range    | Alpha      | Beta       | Gamma      | Delta      | Status\n----------------|------------|------------|------------|------------|--------\n0x0000-0x000F   | 4D5A..HWPR | 4D5A..HWPR | 4D5A..HWPR | 4D5A..HWPR | STATIC\n0x0010-0x001F   | AAAAAAAA   | BBBBBBBB   | CCCCCCCC   | DDDDDDDD   | MUTATED\n0x0020-0x002F   | b8f2c341   | a7e1d452   | c5d0e563   | d4c1f674   | MUTATED\n0x0030-0x0033   | 31c0 (eax) | 31db (ebx) | 31c9 (ecx) | 31d2 (edx) | MUTATED\n0x0034-0x003F   | xor loop   | xor loop   | xor loop   | xor loop   | STATIC\n0x0040-0x004F   | _ALPHA     | _BETA      | _GAMMA     | _DELTA     | MUTATED\n0x0050-0x006F   | 0xDEAD     | 0xDEAD     | 0xDEAD     | 0xDEAD     | STATIC\n0x0070-0x00AF   | C2 payload | C2 payload | C2 payload | C2 payload | STATIC\n0x00B0-0x00CF   | junk_alpha | junk_beta  | junk_gamma | junk_delta | MUTATED\n\n=== MUTATION ENGINE ANALYSIS ===\nEngine type:     XOR-based polymorphic\nMutation method: Register substitution + junk insertion + padding randomization\nXOR key:         0xDEAD (constant across all generations)\nKey schedule:    Rotating 2-byte (0xDE, 0xAD applied alternately)\n\n=== INVARIANT CORE ===\nSignature: 4D 5A 90 00 03 00 00 00 DE AD C0 DE 48 57 50 52\nPresent at offset 0x0000 in ALL variants.\nThis is the unchanging fingerprint of CHIMERA.\n\n=== C2 PAYLOAD ===\nEncoded payload at 0x0080-0x009F (all variants identical):\n  b3a7d9f1e2c8a4b6d0e5f3a9c7b1d8e2\nEncoding: XOR with key 0xDEAD\nTo decode: python3 decode_payload.py 0xDEAD';
            }

            return 'Python 3.11.6\nUsage: python3 [-c cmd | script.py]\n\nTry:\n  python3 tools/analyze_mutations.py\n  python3 tools/decode_payload.py 0xKEY\n  python3 -c "print(hex(0xb3 ^ 0xDE))"';
        },

        'file': function(args) {
            if (args.length === 0) return 'Usage: file <filename>';
            var joined = args.join(' ');

            if (joined.includes('variant_alpha')) return 'samples/variant_alpha.bin: PE32 executable (console) Intel 80386, for MS Windows, mutated polymorph gen-001';
            if (joined.includes('variant_beta'))  return 'samples/variant_beta.bin: PE32 executable (console) Intel 80386, for MS Windows, mutated polymorph gen-002';
            if (joined.includes('variant_gamma')) return 'samples/variant_gamma.bin: PE32 executable (console) Intel 80386, for MS Windows, mutated polymorph gen-003';
            if (joined.includes('variant_delta')) return 'samples/variant_delta.bin: PE32 executable (console) Intel 80386, for MS Windows, mutated polymorph gen-004';
            if (joined.includes('*.bin') || joined.includes('samples/')) return 'samples/variant_alpha.bin: PE32 executable (console) Intel 80386, mutated polymorph gen-001\nsamples/variant_beta.bin:  PE32 executable (console) Intel 80386, mutated polymorph gen-002\nsamples/variant_gamma.bin: PE32 executable (console) Intel 80386, mutated polymorph gen-003\nsamples/variant_delta.bin: PE32 executable (console) Intel 80386, mutated polymorph gen-004';

            return 'file: ' + args[0] + ': No such file or directory';
        },

        'md5sum': function(args) {
            if (args.length === 0) return 'Usage: md5sum <file>';
            var joined = args.join(' ');
            if (joined.includes('alpha')) return 'a3f1d70bc84e99120000000000000001  variant_alpha.bin';
            if (joined.includes('beta'))  return '9c2e8b1ad73f08230000000000000002  variant_beta.bin';
            if (joined.includes('gamma')) return '5f7a0142be85f9340000000000000003  variant_gamma.bin';
            if (joined.includes('delta')) return 'e8b34c53cf96a0450000000000000004  variant_delta.bin';
            return 'md5sum: ' + args[0] + ': No such file or directory';
        },

        'sha256sum': function(args) {
            if (args.length === 0) return 'Usage: sha256sum <file>';
            var joined = args.join(' ');
            if (joined.includes('alpha')) return 'a3f1d70bc84e9912dfa5c3e7b8267104f9a5b3d2c1e0f8a7b6c5d4e3f2a1b0c9  variant_alpha.bin';
            if (joined.includes('beta'))  return '9c2e8b1ad73f0823eb64d5f6c9387215e0b6c4e3d2f1a0b9c8d7e6f5a4b3c2d1  variant_beta.bin';
            if (joined.includes('gamma')) return '5f7a0142be85f934fc76e0d7da498326f1c7d5f4e3a2b1c0d9e8f7a6b5c4d3e2  variant_gamma.bin';
            if (joined.includes('delta')) return 'e8b34c53cf96a045ad87f1e8eb5a9437a2d8e6a5f4b3c2d1e0f9a8b7c6d5e4f3  variant_delta.bin';
            return 'sha256sum: ' + args[0] + ': No such file or directory';
        },

        'nmap': function(args) {
            if (args.length === 0) return 'Usage: nmap [options] <target>';
            return 'Starting Nmap 7.94 ( https://nmap.org )\nNote: This is a malware analysis challenge on an air-gapped workstation.\nNo network scanning available. Focus on the samples in ~/samples/';
        },

        'ping': function(args) {
            return 'ping: network is unreachable (air-gapped analysis workstation)\nFocus on the malware samples in ~/samples/';
        }
    },

    // -------------------------------------------------------
    // HTML HELPERS
    // -------------------------------------------------------

    _escHtml: function(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml: function(html) {
        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent.trim();
    }
};
