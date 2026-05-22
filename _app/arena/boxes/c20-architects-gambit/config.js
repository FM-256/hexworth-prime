/* ============================================================
   CTF ARENA — Box C20: The Architect's Gambit
   Multi-Stage Campaign | Zero-Day Discovery, Advanced Fuzzing & Custom Protocol Analysis
   Config: filesystem, binary analysis, fuzzer, exploit dev, flags, hints, lore
   ============================================================ */

const C20Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: "The Architect's Gambit",
    subtitle: 'Multi-Stage Campaign — Zero-Day Discovery, Advanced Fuzzing & Custom Protocol Analysis',
    difficulty: 'Expert (Extreme)',
    accent: '#8e44ad',
    storageKey: 'hexworth_ctf_c20',
    registryId: 'c20-architects-gambit',
    trackerKey: 'ctf_c20',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'acquisition',
            name: 'Binary Acquisition',
            icon: '\uD83D\uDCE6',
            description: 'Locate and retrieve the syn-gate-daemon binary from SYN-GATE-01. Confirm network reachability and identify the running service on TCP/8000.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002', 'T1083'],
            unlocks: ['reverse_engineering'],
            locked: false
        },
        {
            id: 'reverse_engineering',
            name: 'Protocol Reverse Engineering',
            icon: '\uD83D\uDD0D',
            description: 'Load the binary into Ghidra. Trace recv/send call sites. Reconstruct the SYNAPTIC-PROTO-V1.0 message grammar, state machine, and CRC algorithm.',
            requiredFlags: [],
            mitre: ['T1059.006', 'T1027'],
            unlocks: ['fuzzing'],
            locked: true
        },
        {
            id: 'fuzzing',
            name: 'Fuzzer Development & Execution',
            icon: '\uD83E\uDD16',
            description: 'Build a stateful grammar-based fuzzer targeting SYNAPTIC-PROTO-V1.0. Instrument the daemon under GDB. Execute the fuzzer until a crash is triggered.',
            requiredFlags: [],
            mitre: ['T1587.004', 'T1203'],
            unlocks: ['vuln_analysis'],
            locked: true
        },
        {
            id: 'vuln_analysis',
            name: 'Vulnerability Analysis',
            icon: '\uD83D\uDCA5',
            description: 'Analyse the crash. Identify the root cause — heap overflow in the SEND_DATA command handler. Confirm exploitability and document the bug precisely.',
            requiredFlags: ['proto_spec'],
            mitre: ['T1203', 'T1068'],
            unlocks: ['exploit_dev'],
            locked: true
        },
        {
            id: 'exploit_dev',
            name: 'Exploit Development',
            icon: '\uD83D\uDD13',
            description: 'Develop a working exploit using pwntools. Bypass ASLR via heap info leak, build ROP chain, and achieve remote code execution on SYN-GATE-01.',
            requiredFlags: ['vuln_details'],
            mitre: ['T1203', 'T1068', 'T1055'],
            unlocks: ['exfiltration'],
            locked: true
        },
        {
            id: 'exfiltration',
            name: 'Root & Exfiltration',
            icon: '\uD83C\uDFC6',
            description: 'Fire the exploit. Catch a root shell on SYN-GATE-01. Read /root/global_domination_protocol.txt and extract the final flag.',
            requiredFlags: ['vuln_details'],
            mitre: ['T1068', 'T1005', 'T1560'],
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
                title: 'Confirm target reachability and acquire the binary',
                tip: 'Run: nmap -sV -p 8000 10.13.37.1 — then scp the daemon binary off the box.',
                trigger: { event: 'command', match: { cmd: 'contains:nmap' } }
            },
            {
                title: 'Perform initial binary triage',
                tip: 'Run: file syn-gate-daemon && checksec syn-gate-daemon && strings syn-gate-daemon | less',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:checksec' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:file' } },
                        { event: 'command', match: { cmd: 'contains:strings' } }
                    ]
                }
            },
            {
                title: 'Reverse engineer the protocol grammar',
                tip: 'Load into Ghidra. Find recv() call sites and trace into handle_message(). Map the state machine and message header fields.',
                trigger: { event: 'command', match: { cmd: 'contains:ghidra' } }
            },
            {
                title: 'Develop and run your fuzzer',
                tip: 'Build a stateful Scapy or pwntools fuzzer targeting SEND_DATA frames. Run it against a local daemon instance under GDB.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:python3' },
                    alt: [{ event: 'command', match: { cmd: 'contains:fuzzer' } }]
                }
            },
            {
                title: 'Analyse the crash and document the vulnerability',
                tip: 'Check the GDB / core dump. Note the fault address and corrupted heap metadata. This is your Flag 2 content.',
                trigger: { event: 'flag_correct', match: { flagId: 'proto_spec' } }
            },
            {
                title: 'Build the exploit and get root',
                tip: 'Use pwntools. Leak a heap pointer via overread, compute ASLR offsets, build ROP gadgets from libc, spawn shell, cat /root/global_domination_protocol.txt.',
                trigger: { event: 'flag_correct', match: { flagId: 'vuln_details' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'proto_spec',  objective: '1.2', description: 'Analyze indicators of malicious activity — Reverse engineering a custom binary protocol', skill: 'Protocol Reverse Engineering & Documentation' },
            { flagId: 'vuln_details', objective: '2.2', description: 'Summarize vulnerability types — Heap overflow, integer overflow, memory-safety bugs in compiled code', skill: 'Memory Corruption Vulnerability Analysis' },
            { flagId: 'root_flag',   objective: '4.3', description: 'Apply mitigations and explain bypass techniques — Defeating ASLR/NX/RELRO/Stack-Canaries', skill: 'Advanced Exploit Development & RCE' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Kali Linux BIOS v4.2.1',
            'Initializing hardware...',
            'Memory Test: 32768 MB OK',
            'Detecting drives... /dev/nvme0n1 (1TB NVMe)',
            'PXE-E61: Media test failure, check cable',
            'PXE-M0F: Exiting PXE ROM.',
            'Boot device: /dev/nvme0n1p1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Kali GNU/Linux',
            'Kali GNU/Linux (recovery mode)',
            'Advanced options for Kali GNU/Linux'
        ],
        loginUser: 'kali'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD',       app: 'notes'    },
            { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1',       app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9',       app: 'flags'    }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.13.37.1 (SYN-GATE-01 — Confederacy Nexus Core)\n\n[!] Expert box. No guardrails. Expected tools: Ghidra, GDB+Pwndbg, AFL++, pwntools, Scapy.\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state machine)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',           // 'attacker' | 'root-shell'
    _binaryAcquired: false,
    _checksecRun: false,
    _stringsRun: false,
    _ghidraLoaded: false,
    _protocolMapped: false,
    _fuzzerBuilt: false,
    _crashTriggered: false,
    _exploitWritten: false,
    _rootShellActive: false,

    _switchContext(ctx, term) {
        C20Config._context = ctx;
        if (term && term.config) {
            const prompt = C20Config._getPrompt();
            if (prompt) {
                term.config.user     = prompt.split('@')[0] || 'kali';
                term.config.hostname = 'context';
                term._customPrompt   = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (C20Config._context) {
            case 'root-shell': return 'root@SYN-GATE-01:~# ';
            default:           return null;
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'proto_spec',   points: 150 },   // Flag 1 — protocol specification
        { id: 'vuln_details', points: 200 },   // Flag 2 — vulnerability details
        { id: 'root_flag',    points: 350 }    // Flag 3 — Global Domination Protocol
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 5000,
        minScore: 0,
        maxScore: 700,
        hintPenalty: true,
        wrongFlagPenalty: -50,
        speedBonus: { threshold: 7200000, points: 300 },  // 2 hours
        timeBonusThreshold: 10800                          // 3 hours
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start with: nmap -sV -p 8000 10.13.37.1 to confirm the daemon is live. Then: scp kali@10.13.37.1:/usr/local/bin/syn-gate-daemon . or use nc/wget if SCP is blocked. Run file, checksec, and strings on it before loading into Ghidra.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint2',
            text: 'In Ghidra, search for the string "SYNAPTIC" and "AUTH" to find the message handler. The header layout is: [magic:2][type:1][seq:2][length:2][payload:variable][crc32:4]. State machine: INIT -> AUTH -> READY -> DATA. Only SEND_DATA is reachable from READY state.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'The bug is in handle_send_data(). It reads a 2-byte length field from the packet but allocates a fixed 256-byte heap buffer. If length > 256, the memcpy overflows the heap chunk. The overflow overwrites the next chunk\'s size/fd/bk fields in the tcache. Start your fuzzer with SEND_DATA frames where payload_len is 0x0000 to 0xFFFF.',
            cost: 75,
            penalty: -75
        },
        {
            id: 'hint4',
            text: 'Exploit path: (1) Spray heap with controlled allocations to align chunks. (2) Trigger overflow to corrupt a free chunk\'s fd pointer. (3) Use a second AUTH+GET_STATUS cycle to perform an arbitrary alloc at a target address (tcache poisoning). (4) Overwrite a function pointer or GOT entry. (5) ROP gadgets: use ROPgadget --binary syn-gate-daemon to find pop rdi; ret and system@plt or a one_gadget from libc.',
            cost: 100,
            penalty: -100
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Confederacy\'s "Nexus Core" is not like their other assets. There is no web panel. No default credentials. No misconfigured service. The Synaptic Gateway — `SYN-GATE-01` — speaks only one language: `SYNAPTIC-PROTO-V1.0`, a custom binary protocol designed in-house by the Confederacy\'s lead cryptographer, codename "The Architect." He was proud of it. He called it impenetrable. Your mission, Peerless, is to prove him wrong.',
        scenario: 'The Architect spent eighteen months building SYNAPTIC-PROTO-V1.0. It has custom framing, a CRC-32 integrity check, a four-state authentication machine, and command handlers for GET_STATUS, SEND_DATA, and EXEC_TASK. Every off-by-one was caught in code review. Every integer truncation was unit-tested. The Architect signed off on it personally. But protocol designers are not fuzzers. And fuzzers do not get tired.',
        outro: 'The Nexus Core is yours. Root on SYN-GATE-01. The Global Domination Protocol sits in /root, unlocked by the same vulnerability The Architect was certain did not exist. One integer cast. Forty-seven seconds of fuzzing. The Architect\'s gambit failed.',
        ecer: {
            executive: 'Security budget approved a bespoke protocol implementation over an audited open standard; no independent security review commissioned',
            culture: 'Internal code review by the same team that wrote the code; no third-party pentest; "we designed it, so we know it\'s safe" culture',
            employee: 'Protocol length field is a 16-bit unsigned value but the heap allocation is hardcoded at 256 bytes; the memcpy trusts the wire value without bounds checking',
            regulatory: 'No formal secure development lifecycle; no fuzz testing requirement in the build pipeline; no memory-safe language mandate for network-facing code'
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (attacker machine — kali)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'kali': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING: THE ARCHITECT\'S GAMBIT ===\nTarget: 10.13.37.1 (SYN-GATE-01 — Confederacy Nexus Core)\nService: SYNAPTIC-PROTO-V1.0 on TCP/8000\nBinary: syn-gate-daemon (Linux x64)\n\nAttack chain:\n1. Acquire binary — scp or nc from target\n2. Initial triage — file, checksec, strings\n3. Reverse engineer protocol — Ghidra/IDA, trace recv() call sites\n4. Map SYNAPTIC-PROTO-V1.0 grammar and state machine (Flag 1)\n5. Develop stateful fuzzer — Scapy / pwntools / AFL++\n6. Crash the daemon — identify the bug (Flag 2)\n7. Develop working exploit — tcache poison + ROP + RCE\n8. Get root. Read /root/global_domination_protocol.txt (Flag 3)\n\nDifficulty: EXPERT. Protections: ASLR + NX + RELRO + Stack Canaries.\nNo shortcuts. No CVEs. This is a zero-day engagement.\n\nGood luck, operator.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap -sV -p 8000 10.13.37.1\nnc 10.13.37.1 8000\nscp kali@10.13.37.1:/usr/local/bin/syn-gate-daemon .\nfile syn-gate-daemon\nchecksec syn-gate-daemon\nstrings syn-gate-daemon | head -60\nreadelf -h syn-gate-daemon\nobjdump -d syn-gate-daemon | head -100'
                                },
                                'fuzzer.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# SYNAPTIC-PROTO-V1.0 Stateful Fuzzer\n# Targets: SEND_DATA length field overflow\n# Usage: python3 fuzzer.py\n\nfrom pwn import *\nimport struct, random, time\n\nHOST = \'10.13.37.1\'\nPORT = 8000\nMAGIC = b\'\\xSY\'  # NOT YET REVERSED — update after Ghidra\n\n# TODO: Complete after reverse engineering\n# Message header: [magic:2][type:1][seq:2][length:2][payload][crc32:4]\n\ndef make_auth_frame(user, passwd):\n    payload = user.encode().ljust(32, b\'\\x00\') + passwd.encode().ljust(32, b\'\\x00\')\n    # TODO: add real magic, CRC\n    return payload\n\ndef fuzz_send_data(length_val):\n    # Craft SEND_DATA with attacker-controlled length field\n    payload = b\'A\' * 16  # small payload\n    # TODO: fill in real framing after RE\n    return payload\n\nif __name__ == \'__main__\':\n    print("[*] Starting SYNAPTIC-PROTO-V1.0 fuzzer")\n    print("[!] Incomplete — finish reverse engineering first")\n'
                                },
                                'exploit.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# The Architect\'s Gambit — Exploit\n# Vulnerability: Heap overflow in handle_send_data()\n# Technique: tcache poisoning -> arbitrary alloc -> GOT overwrite -> system()\n# Usage: python3 exploit.py\n\nfrom pwn import *\n\nHOST = \'10.13.37.1\'\nPORT = 8000\n\n# TODO: fill in after crash analysis\n# OVERFLOW_OFFSET = ???\n# LIBC_BASE = ???\n# SYSTEM_OFFSET = ???\n\ndef pwn():\n    io = remote(HOST, PORT)\n    # Stage 1: authenticate\n    # Stage 2: heap spray\n    # Stage 3: trigger overflow\n    # Stage 4: info leak\n    # Stage 5: tcache poison\n    # Stage 6: ROP / system()\n    io.interactive()\n\nif __name__ == \'__main__\':\n    pwn()\n'
                                },
                                'wordlists': {
                                    type: 'dir',
                                    children: {
                                        'proto_fields.txt': {
                                            type: 'file',
                                            content: '# Candidate field names seen in strings output\nMAGIC\nSYNAPTIC\nAUTH\nGET_STATUS\nSEND_DATA\nEXEC_TASK\nERROR\nOK\nversion\nsequence\nlength\npayload\ncrc32\nstate\nINIT\nREADY\nDATA\nFAIL'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'bin': {
                            type: 'dir',
                            children: {
                                'ghidra': {
                                    type: 'file',
                                    content: '[Ghidra 11.0 — binary analysis tool]\nUsage: ghidra [binary]\nExample: ghidra syn-gate-daemon'
                                },
                                'gdb': {
                                    type: 'file',
                                    content: '[GDB 13.2 with Pwndbg]\nUsage: gdb [binary]\nExample: gdb syn-gate-daemon'
                                },
                                'aflplusplus': {
                                    type: 'file',
                                    content: '[AFL++ 4.08c — coverage-guided fuzzer]\nUsage: afl-fuzz -i in/ -o out/ -- ./syn-gate-daemon @@'
                                }
                            }
                        },
                        'share': {
                            type: 'dir',
                            children: {
                                'pwntools': {
                                    type: 'dir',
                                    children: {
                                        'README': {
                                            type: 'file',
                                            content: 'pwntools 4.12.0 — CTF framework and exploit development\npip install pwntools\nfrom pwn import *'
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
                        'hostname': {
                            type: 'file',
                            content: 'kali'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash'
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
    // FILESYSTEM — SYN-GATE-01 (after root shell)
    // ═══════════════════════════════════════════════════════

    _synGateFs: {
        '/': {
            type: 'dir',
            children: {
                'usr': {
                    type: 'dir',
                    children: {
                        'local': {
                            type: 'dir',
                            children: {
                                'bin': {
                                    type: 'dir',
                                    children: {
                                        'syn-gate-daemon': {
                                            type: 'file',
                                            content: '[ELF 64-bit LSB executable — syn-gate-daemon v1.0]\n[Not human-readable. Use file, checksec, strings, or Ghidra to analyse.]'
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
                        'hostname': {
                            type: 'file',
                            content: 'SYN-GATE-01'
                        },
                        'os-release': {
                            type: 'file',
                            content: 'NAME="Alpine Linux"\nID=alpine\nVERSION_ID=3.19.0\nPRETTY_NAME="Alpine Linux v3.19"\nHOME_URL="https://alpinelinux.org/"'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/sh\ndaemon:x:1:1:daemon:/usr/sbin:/sbin/nologin\nsyngate:x:1001:1001:Synaptic Gateway Service:/home/syngate:/sbin/nologin'
                        }
                    }
                },
                'home': {
                    type: 'dir',
                    children: {
                        'syngate': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'sudo /usr/local/bin/syn-gate-daemon --port 8000 --daemon\ntail -f /var/log/syngate.log\nls /root/'
                                }
                            }
                        }
                    }
                },
                'root': {
                    type: 'dir',
                    children: {
                        'global_domination_protocol.txt': {
                            type: 'file',
                            content: 'CONFEDERACY — EYES ONLY\nCLASSIFICATION: OMEGA-BLACK\n\n=== GLOBAL DOMINATION PROTOCOL ===\n\nPhase I: Consolidation of Tier-1 Infrastructure\n  - Subvert autonomous network switching layer (complete)\n  - Implant persistent backdoors in 14 regional backbone nodes (complete)\n  - Neutralize out-of-band monitoring systems (in progress)\n\nPhase II: Denial and Deception\n  - Activate false-flag attribution matrix\n  - Flood adversary SIEM with spoofed telemetry\n  - Trigger coordinated infrastructure blackout — countdown: 72:00:00\n\nPhase III: Command Transfer\n  - Pivot Nexus Core control to off-site redundancy\n  - Destroy audit logs on all compromised nodes\n  - Execute final protocol: THE ARCHITECT\'S SIGNATURE\n\n--- RETRIEVAL TOKEN ---\n{{FLAG:root_flag}}\n\n"The Architect built the cage. You walked through the wall."\n— Peerless'
                        },
                        '.ssh': {
                            type: 'dir',
                            children: {
                                'authorized_keys': {
                                    type: 'file',
                                    content: '# root authorized_keys — SYN-GATE-01\n# No remote SSH. Daemon access only.\n'
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
                                'syngate.log': {
                                    type: 'file',
                                    content: '2026-03-20 00:00:01 [INFO] syn-gate-daemon v1.0 starting on 0.0.0.0:8000\n2026-03-20 00:00:01 [INFO] SYNAPTIC-PROTO-V1.0 state machine initialized\n2026-03-20 00:00:01 [INFO] Security: ASLR=ON, NX=ON, RELRO=FULL, CANARY=ON\n2026-03-20 00:00:01 [INFO] Awaiting connections...\n2026-03-20 08:14:22 [INFO] Connection from 10.13.37.100:44312\n2026-03-20 08:14:23 [INFO] AUTH frame received — user=architect\n2026-03-20 08:14:23 [INFO] AUTH success — state INIT->READY\n2026-03-20 08:14:24 [INFO] GET_STATUS frame received\n2026-03-20 08:14:24 [INFO] Connection closed cleanly\n2026-03-20 08:15:01 [WARN] Malformed frame received — CRC mismatch, dropping\n2026-03-20 08:15:02 [WARN] Malformed frame received — invalid type byte 0xFF\n2026-03-20 08:15:03 [CRITICAL] SIGSEGV in handle_send_data() at 0x00401c47 — heap corruption detected\n2026-03-20 08:15:03 [CRITICAL] Core dumped: /tmp/core.12834\n'
                                }
                            }
                        },
                        'tmp': {
                            type: 'dir',
                            children: {}
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
    // BINARY ANALYSIS DATA
    // Returned by analysis commands — represents reversed binary
    // ═══════════════════════════════════════════════════════

    _binary: {
        fileOutput: `syn-gate-daemon: ELF 64-bit LSB executable, x86-64, version 1 (SYSV)
dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2
BuildID[sha1]=3f8a1d9c7b2e4f05a69173c84d20e51b6a7f9230
for GNU/Linux 3.2.0, stripped`,

        checksecOutput: `[*] '/home/kali/syn-gate-daemon'
    Arch:     amd64-64-little
    RELRO:    Full RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)
    RUNPATH:  b''`,

        stringsOutput: `SYNAPTIC-PROTO-V1.0
syn-gate-daemon
Confederacy Systems — Nexus Core Gateway
Usage: syn-gate-daemon [--port <port>] [--daemon]
Awaiting connection...
AUTH
GET_STATUS
SEND_DATA
EXEC_TASK
SYNG
state=INIT
state=READY
state=DATA
Authentication failed. Disconnecting.
Welcome to SYN-GATE. State: READY.
CRC mismatch. Dropping frame.
Invalid state transition. Expected AUTH first.
handle_auth
handle_get_status
handle_send_data
handle_exec_task
malloc
memcpy
free
recv
send
/bin/sh
/lib/x86_64-linux-gnu/libc.so.6`,

        readelfOutput: `ELF Header:
  Magic:   7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00
  Class:                             ELF64
  Data:                              2's complement, little endian
  OS/ABI:                            UNIX - System V
  Type:                              EXEC (Executable file)
  Machine:                           Advanced Micro Devices X86-64
  Entry point address:               0x401080
  Start of program headers:          64 (bytes into file)
  Start of section headers:          0x1f800
  Size of this file:                 0x20000 (131072 bytes)

Program Headers:
  PHDR     0x000040 vaddr 0x400040 filesz 0x002d8
  INTERP   0x000318 vaddr 0x400318 filesz 0x00013  /lib64/ld-linux-x86-64.so.2
  LOAD     0x000000 vaddr 0x400000 filesz 0x01234  flags r--
  LOAD     0x002000 vaddr 0x402000 filesz 0x07abc  flags r-x
  LOAD     0x01c000 vaddr 0x41c000 filesz 0x00480  flags r--
  LOAD     0x01d000 vaddr 0x41d000 filesz 0x00230  flags rw-
  GNU_RELRO 0x01d000 vaddr 0x41d000 filesz 0x00230`,

        objdumpOutput: `0000000000401c00 <handle_send_data>:
  401c00: push   rbp
  401c01: mov    rbp,rsp
  401c04: push   rbx
  401c05: sub    rsp,0x28
  401c09: mov    QWORD PTR [rbp-0x18],rdi   ; conn ptr
  401c0d: mov    DWORD PTR [rbp-0x1c],esi   ; frame length
  ; Allocate fixed 256-byte heap buffer — DOES NOT USE FRAME LENGTH
  401c10: mov    edi,0x100
  401c15: call   0x401050 <malloc@plt>
  401c1a: mov    QWORD PTR [rbp-0x10],rax   ; buf ptr
  401c1e: test   rax,rax
  401c20: je     0x401c6b <handle_send_data+0x6b>
  ; memcpy(buf, frame->payload, frame->length)
  ; frame->length is the WIRE VALUE — up to 65535
  ; buf is only 256 bytes — HEAP OVERFLOW if length > 256
  401c22: mov    rdx,QWORD PTR [rbp-0x18]
  401c26: movzx  eax,WORD PTR [rdx+0x5]    ; frame->length (16-bit wire field)
  401c2a: movzx  ecx,ax                    ; zero-extend to 32-bit — no truncation!
  401c2d: mov    rsi,QWORD PTR [rbp+0x0]   ; frame->payload ptr
  401c31: mov    rdi,QWORD PTR [rbp-0x10]  ; buf (256 bytes)
  401c35: mov    edx,ecx                   ; length = wire value (up to 65535)
  401c37: call   0x401058 <memcpy@plt>     ; OVERFLOW if length > 0x100
  401c3c: jmp    0x401c50
  401c47: ...
  401c6b <handle_send_data+0x6b>:
  401c6b: mov    eax,0xffffffff
  401c70: jmp    0x401c75
  401c75: leave
  401c76: ret`,

        ghidraOutput: `--- Ghidra 11.0 — SYNAPTIC-PROTO-V1.0 Analysis ---
[+] Binary loaded: syn-gate-daemon (stripped x64 ELF)
[+] Auto-analysis complete. Found 47 functions.

=== SYNAPTIC-PROTO-V1.0 Message Header ===
Offset  Field       Type    Description
------  ----------  ------  -----------------------------------
0x00    magic       u16     0x5347 ('SG') — frame magic bytes
0x02    msg_type    u8      0x01=AUTH, 0x02=GET_STATUS,
                            0x03=SEND_DATA, 0x04=EXEC_TASK
0x03    seq_num     u16     sequence counter (little-endian)
0x05    length      u16     payload length in bytes (little-endian)
0x07    payload     bytes   variable — length bytes
0x07+length  crc32  u32     CRC-32 over bytes 0x00 to 0x06+length

=== AUTH Payload (msg_type=0x01) ===
Offset  Field       Type    Size
------  ----------  ------  ----
0x00    username    char[]  32
0x20    password    char[]  32

=== GET_STATUS Payload (msg_type=0x02) ===
Empty payload (length=0x0000). Returns status string.

=== SEND_DATA Payload (msg_type=0x03) ===
Offset  Field       Type    Size
------  ----------  ------  ----
0x00    data_tag    u8      category byte
0x01    data_body   bytes   (length - 1) bytes
NOTE: handler allocates fixed 256-byte buffer regardless of length.

=== EXEC_TASK Payload (msg_type=0x04) ===
Only reachable in AUTHENTICATED + PRIVILEGED state.
Requires secondary HMAC token — not recoverable from binary alone.

=== State Machine ===
INIT  -(AUTH ok)->  READY  -(SEND_DATA)->  DATA
       -(AUTH fail)-> INIT (disconnect)
READY -(GET_STATUS)-> READY (no state change)
DATA  -(SEND_DATA)-> DATA (loop)

=== VULNERABILITY FOUND ===
Function: handle_send_data() @ 0x401c00
Bug: heap overflow — memcpy(buf_256, payload, wire_length)
     wire_length is u16 (0-65535), buf is malloc(256)
     No bounds check before memcpy.
Trigger: Authenticate, then send SEND_DATA with length > 256.
Impact: Heap metadata corruption, potential tcache poisoning -> RCE.`
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (box-specific tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV -p 8000 10.13.37.1';
            const target = args.find(a => !a.startsWith('-')) || '';

            if (!target || target === '10.13.37.1') {
                if (engine) engine.advancePhase && engine.advancePhase('acquisition');
                const hasSV    = args.includes('-sV') || args.includes('-A');
                const portSpec = args.find(a => a.startsWith('-p'));
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for SYN-GATE-01 (10.13.37.1)
Host is up (0.012s latency).
Not shown: ${hasSV ? '999' : '998'} filtered tcp ports (no-response)

PORT     STATE SERVICE    ${hasSV ? 'VERSION' : ''}
22/tcp   open  ssh        ${hasSV ? 'OpenSSH 9.1p1 Alpine (protocol 2.0)' : ''}
8000/tcp open  syn-gate   ${hasSV ? 'syn-gate-daemon v1.0 (custom protocol SYNAPTIC-PROTO-V1.0)' : ''}

${hasSV ? 'Service detection performed.\n' : ''}Nmap done: 1 IP address (1 host up) scanned in ${hasSV ? '18.42' : '8.71'} seconds`;
            }

            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00005s latency).
All 1000 scanned ports on localhost (127.0.0.1) are closed.

Nmap done: 1 IP address (1 host up) scanned in 0.04 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.12 seconds`;
        },

        'nc': function(args) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('10.13.37.1') && (fullCmd.includes('8000'))) {
                return `(connected to SYN-GATE-01:8000)
<binary garbage — custom protocol, not human-readable>
^C
[+] Connection closed. This is a binary protocol — use pwntools or scapy to interact.`;
            }
            return `nc: ${args[0] || 'host'}: Connection refused`;
        },

        'scp': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if ((fullCmd.includes('10.13.37.1') || fullCmd.includes('SYN-GATE')) && fullCmd.includes('syn-gate-daemon')) {
                C20Config._binaryAcquired = true;
                if (engine) engine.advancePhase && engine.advancePhase('acquisition');
                return `syn-gate-daemon                               100%  128KB  2.1MB/s   00:00
[+] Binary saved to: /home/kali/syn-gate-daemon
[+] Binary acquisition complete. Begin static analysis: file, checksec, strings.`;
            }
            if (fullCmd.includes('10.13.37.1') && !fullCmd.includes('syn-gate-daemon')) {
                return `scp: /usr/local/bin/unknown: No such file or directory`;
            }
            return `scp: Permission denied (publickey).`;
        },

        'wget': function(args) {
            const url = args.find(a => !a.startsWith('-')) || '';
            if (url.includes('10.13.37.1') && url.includes('syn-gate-daemon')) {
                C20Config._binaryAcquired = true;
                return `--2026-03-20 09:15:22--  http://10.13.37.1:8080/syn-gate-daemon
Connecting to 10.13.37.1:8080... connected.
HTTP request sent, awaiting response... 200 OK
Length: 131072 (128K) [application/octet-stream]
Saving to: 'syn-gate-daemon'

syn-gate-daemon    100%[===================>]  128.00K  1.02MB/s    in 0.1s

[+] Binary acquisition complete. Begin static analysis: file, checksec, strings.`;
            }
            return `wget: unable to resolve host address '${url.replace(/https?:\/\//, '').split('/')[0]}'`;
        },

        'file': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (target.includes('syn-gate-daemon') || target === 'syn-gate-daemon') {
                if (!C20Config._binaryAcquired) {
                    return `file: syn-gate-daemon: No such file or directory\n[!] You need to acquire the binary first. Try: scp kali@10.13.37.1:/usr/local/bin/syn-gate-daemon .`;
                }
                return C20Config._binary.fileOutput;
            }
            if (!target) return 'Usage: file <filename>';
            return `${target}: ASCII text`;
        },

        'checksec': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (target.includes('syn-gate-daemon') || target === 'syn-gate-daemon') {
                if (!C20Config._binaryAcquired) {
                    return 'checksec: syn-gate-daemon: No such file or directory';
                }
                C20Config._checksecRun = true;
                return C20Config._binary.checksecOutput;
            }
            return 'Usage: checksec <binary>\nExample: checksec syn-gate-daemon';
        },

        'strings': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('syn-gate-daemon') || fullCmd.includes('daemon')) {
                if (!C20Config._binaryAcquired) {
                    return 'strings: syn-gate-daemon: No such file or directory';
                }
                C20Config._stringsRun = true;
                return C20Config._binary.stringsOutput;
            }
            return 'Usage: strings [options] <file>\nExample: strings syn-gate-daemon | grep -i proto';
        },

        'readelf': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (target.includes('syn-gate-daemon') || target === 'syn-gate-daemon') {
                if (!C20Config._binaryAcquired) return 'readelf: syn-gate-daemon: No such file or directory';
                return C20Config._binary.readelfOutput;
            }
            return 'Usage: readelf -h <binary>';
        },

        'objdump': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('syn-gate-daemon') || fullCmd.includes('daemon')) {
                if (!C20Config._binaryAcquired) return 'objdump: syn-gate-daemon: No such file or directory';
                return C20Config._binary.objdumpOutput;
            }
            return 'Usage: objdump -d <binary>';
        },

        'ghidra': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (target.includes('syn-gate-daemon') || target === 'syn-gate-daemon') {
                if (!C20Config._binaryAcquired) {
                    return '[!] Binary not found. Acquire it first: scp kali@10.13.37.1:/usr/local/bin/syn-gate-daemon .';
                }
                C20Config._ghidraLoaded = true;
                C20Config._protocolMapped = true;
                if (engine) engine.advancePhase && engine.advancePhase('reverse_engineering');
                return C20Config._binary.ghidraOutput;
            }
            if (!target) {
                return 'Ghidra 11.0\nUsage: ghidra <binary>\nExample: ghidra syn-gate-daemon';
            }
            return `Ghidra 11.0\n[!] File not found: ${target}`;
        },

        'ida': function(args, term, engine) {
            // IDA Pro — same output as Ghidra
            return C20Config.commands.ghidra(args, term, engine);
        },

        'gdb': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('syn-gate-daemon') || fullCmd.includes('daemon') || fullCmd.includes('core')) {
                if (!C20Config._binaryAcquired) {
                    return 'gdb: syn-gate-daemon: No such file or directory\n[!] Acquire the binary first.';
                }
                const isCore = fullCmd.includes('core');
                if (isCore) {
                    return `GNU gdb (Debian 13.2-1) 13.2
Reading symbols from syn-gate-daemon...
(No debugging symbols found)

Core was generated by './syn-gate-daemon --port 8000'.
Program terminated with signal SIGSEGV, Segmentation fault.
#0  0x00007f3b4c2a1847 in __memcpy_avx_unaligned () from /lib/x86_64-linux-gnu/libc.so.6

(gdb) bt
#0  0x00007f3b4c2a1847 in __memcpy_avx_unaligned ()
#1  0x0000000000401c37 in handle_send_data ()
#2  0x0000000000401f12 in dispatch_frame ()
#3  0x0000000000402188 in connection_loop ()
#4  0x0000000000402340 in main ()

(gdb) info registers
rip 0x7f3b4c2a1847
rsp 0x00007ffd3e2a4890
rbp 0x00007ffd3e2a4920
rdi 0x000055f8a3c01ab0    <- dst (heap buf, 256 bytes)
rsi 0x000055f8a3c01e80    <- src (frame payload)
rdx 0x0000000000004141    <- count = 0x4141 = 16705 (attacker-controlled!)

(gdb) x/32gx 0x000055f8a3c01ab0
0x55f8a3c01ab0: 0x4141414141414141  0x4141414141414141
0x55f8a3c01ac0: 0x4141414141414141  0x4141414141414141
...
0x55f8a3c01bb0: 0x4141414141414141  0x4141414141414141
0x55f8a3c01bc0: 0x4141414141414141  0x0000000000000041  <- heap chunk size overwritten!
0x55f8a3c01bd0: 0x4141414141414141  0x4141414141414141  <- fd/bk overwritten

(gdb) heap chunks
chunk 0x55f8a3c01a90  (allocated, size=0x110)
chunk 0x55f8a3c01ba0  (size=0x41414141 CORRUPT!)

(gdb) q`;
                }
                return `GNU gdb (Debian 13.2-1) 13.2
Reading symbols from syn-gate-daemon...
(No debugging symbols found in syn-gate-daemon)
(gdb) _

[Tip: run 'r --port 8000' to start the daemon under gdb, then connect your fuzzer.]
[Tip: set a breakpoint at *0x401c00 to hit handle_send_data()]
[Tip: use 'checksec' outside gdb to verify binary protections.]`;
            }
            if (!args.length) return 'GNU gdb (Debian 13.2-1) 13.2\nUsage: gdb <binary> [core]\nExample: gdb syn-gate-daemon\nExample: gdb syn-gate-daemon /tmp/core.12834';
            return `GNU gdb: ${args[0]}: No such file or directory`;
        },

        'python3': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // Running the fuzzer script
            if (fullCmd.includes('fuzzer.py')) {
                if (!C20Config._protocolMapped) {
                    return '[*] Starting SYNAPTIC-PROTO-V1.0 fuzzer\n[!] Incomplete — finish reverse engineering first\n[!] Update MAGIC bytes and framing logic in fuzzer.py before running.';
                }
                C20Config._fuzzerBuilt = true;
                C20Config._crashTriggered = true;
                if (engine) engine.advancePhase && engine.advancePhase('fuzzing');
                if (engine) engine.advancePhase && engine.advancePhase('vuln_analysis');
                return `[*] Starting SYNAPTIC-PROTO-V1.0 fuzzer v0.1
[*] Target: 10.13.37.1:8000
[*] Mode: stateful grammar-based (AUTH -> SEND_DATA mutation)
[*] Fuzzing SEND_DATA length field: 0x0000 to 0xFFFF

[+] Case  1: length=0x0001 (1 byte)     -> RESPONSE: OK (14ms)
[+] Case  2: length=0x00ff (255 bytes)  -> RESPONSE: OK (16ms)
[+] Case  3: length=0x0100 (256 bytes)  -> RESPONSE: OK (15ms)
[+] Case  4: length=0x0101 (257 bytes)  -> RESPONSE: OK (no crash yet)
[+] Case  5: length=0x0200 (512 bytes)  -> RESPONSE: OK (heap smashed? continuing)
[+] Case  6: length=0x1000 (4096 bytes) -> RESPONSE: (timeout)
[+] Case  7: length=0x4141 (16705 bytes)-> CRASH DETECTED!

[!] SIGSEGV observed — daemon stopped responding on 10.13.37.1:8000
[!] Core dump generated: /tmp/core.12834 (on target)
[!] Last packet: AUTH(user=architect, pass=synapse2026), SEND_DATA(length=0x4141, payload=\x41*16)

[*] Crash reproducible. Save these inputs for exploit development.
[+] Phase advance: Vulnerability Analysis unlocked.`;
                C20Config._onFuzzerCrash(engine);
            }

            // Running the exploit script
            if (fullCmd.includes('exploit.py')) {
                if (!C20Config._fuzzerBuilt || !C20Config._crashTriggered) {
                    return '[!] Exploit not complete yet.\n[!] Finish fuzzing first to confirm the vulnerability before writing the exploit.';
                }
                C20Config._exploitWritten = true;
                C20Config._rootShellActive = true;
                C20Config._switchContext('root-shell', term);
                if (engine) engine.advancePhase && engine.advancePhase('exploit_dev');
                return `[*] The Architect\'s Gambit — Exploit v1.0
[*] Target: 10.13.37.1:8000
[*] Technique: heap overflow -> tcache poison -> GOT overwrite -> system("/bin/sh")

[+] Stage 1: AUTH(user=architect, pass=synapse2026) -> READY
[+] Stage 2: Heap spray — 14x SEND_DATA(length=0x100) to align chunks
[+] Stage 3: Trigger overflow — SEND_DATA(length=0x4141, payload=craft_payload())
[+] Stage 4: Info leak — GET_STATUS returns heap pointer at offset 0x38
[+] Heap base: 0x55f8a3c00000
[+] libc leak via GOT: 0x7f3b4c1f0000
[+] system @ 0x7f3b4c23e4c0
[+] Stage 5: tcache poison — forge free chunk fd -> target=0x41d020 (puts@GOT)
[+] Stage 6: SEND_DATA alloc lands at 0x41d020 — overwrite puts@GOT with system
[+] Stage 7: Trigger puts("id") -> executes system("id") -> uid=0(root)

[!] Spawning shell...
[+] SHELL OBTAINED: root@SYN-GATE-01
[+] Context switched to root shell.

root@SYN-GATE-01:~#`;
            }

            // Generic python3 invocation
            if (!args.length || args[0] === '-c' || args[0] === '-') {
                return 'Python 3.11.4 (main, Jul  5 2023, 09:00:44)\n[GCC 12.3.0] on linux\nType "help", "copyright", "credits" or "license" for more information.\n>>> ';
            }

            return `python3: can\'t open file '/home/kali/${args[0]}': [Errno 2] No such file or directory`;
        },

        'afl-fuzz': function(args, term, engine) {
            if (!C20Config._binaryAcquired) {
                return '[!] Binary not acquired. Run scp to get syn-gate-daemon first.';
            }
            if (!C20Config._protocolMapped) {
                return '[!] Protocol not yet reverse engineered. Load the binary into Ghidra first to map SYNAPTIC-PROTO-V1.0 grammar before fuzzing.';
            }
            C20Config._fuzzerBuilt = true;
            C20Config._crashTriggered = true;
            if (engine) engine.advancePhase && engine.advancePhase('fuzzing');
            if (engine) engine.advancePhase && engine.advancePhase('vuln_analysis');
            return `afl-fuzz 4.08c by <afl-users@googlegroups.com>

[+] afl++ is ready to fuzz!
    cmdline : ./syn-gate-daemon @@
    input   : in/
    output  : out/

[*] Spinning up the forkserver...
[*] Entering queue cycle 1...

Total execs : 00048271
Speed       : 1247/sec
Paths found : 34
Crashes     : 0

[Queue cycle 2 — mutating SEND_DATA length bytes]

Total execs : 00096540
Speed       : 1251/sec
Paths found : 67
Crashes     : 0

[Queue cycle 3 — boundary values near 0x0100]

Total execs : 00144802
Speed       : 1248/sec
Paths found : 71
Crashes     : 1  <-- !!

[!] afl-fuzz: CRASH FOUND in cycle 3
[!] Crashing input saved to: out/crashes/id:000000,sig:11,src:000043,time:116243,execs:144802
[!] Signal: SIGSEGV (11) — Segmentation fault

[+] Crash reproduced manually. Core dump at /tmp/core.12834 on target instance.`;
            C20Config._onFuzzerCrash(engine);
        },

        'cat': function(args, term, engine) {
            // Root shell context — show target filesystem
            if (C20Config._context === 'root-shell') {
                const path = args[0] || '';
                if (path.includes('global_domination') || path.includes('/root/global')) {
                    if (engine) engine.advancePhase && engine.advancePhase('exfiltration');
                    return C20Config._synGateFs['/'].children['root'].children['global_domination_protocol.txt'].content;
                }
                if (path.includes('/etc/hostname') || path === 'hostname') {
                    return 'SYN-GATE-01';
                }
                if (path.includes('/etc/os-release') || path.includes('os-release')) {
                    return C20Config._synGateFs['/'].children['etc'].children['os-release'].content;
                }
                if (path.includes('/etc/passwd')) {
                    return C20Config._synGateFs['/'].children['etc'].children['passwd'].content;
                }
                if (path.includes('/var/log/syngate')) {
                    return C20Config._synGateFs['/'].children['var'].children['log'].children['syngate.log'].content;
                }
                if (path.includes('.bash_history') || path === '~/.bash_history') {
                    return C20Config._synGateFs['/'].children['home'].children['syngate'].children['.bash_history'].content;
                }
                return `cat: ${path}: No such file or directory`;
            }
            // Attacker machine — fall through to built-in
            return null;
        },

        'ls': function(args, term, engine) {
            if (C20Config._context === 'root-shell') {
                const path = (args.find(a => !a.startsWith('-')) || '.').replace(/\/$/, '');
                const showHidden = args.includes('-a') || args.includes('-la') || args.includes('-al');
                if (path === '.' || path === '/root' || path === '~') {
                    return showHidden
                        ? '.  ..  .ssh  global_domination_protocol.txt'
                        : 'global_domination_protocol.txt';
                }
                if (path === '/') return 'bin  etc  home  root  tmp  usr  var';
                if (path.includes('/usr/local/bin') || path.includes('local/bin')) return 'syn-gate-daemon';
                if (path.includes('/var/log')) return 'syngate.log';
                if (path.includes('/etc')) return 'hostname  os-release  passwd';
                return '';
            }
            return null; // fall through to built-in
        },

        'id': function(args, term, engine) {
            if (C20Config._context === 'root-shell') return 'uid=0(root) gid=0(root) groups=0(root)';
            return null;
        },

        'whoami': function(args, term, engine) {
            if (C20Config._context === 'root-shell') return 'root';
            return null;
        },

        'hostname': function(args, term, engine) {
            if (C20Config._context === 'root-shell') return 'SYN-GATE-01';
            return null;
        },

        'pwd': function(args, term, engine) {
            if (C20Config._context === 'root-shell') return '/root';
            return null;
        },

        'uname': function(args, term, engine) {
            if (C20Config._context === 'root-shell') {
                const isA = args.includes('-a');
                return isA
                    ? 'Linux SYN-GATE-01 6.1.0 #1 SMP Mon Jan 1 00:00:00 UTC 2026 x86_64 Linux'
                    : 'Linux';
            }
            return 'Linux kali 6.1.0-kali9-amd64 #1 SMP x86_64 GNU/Linux';
        },

        'cd': function(args, term, engine) {
            if (C20Config._context === 'root-shell') return ''; // silently accept
            return null;
        },

        'exit': function(args, term, engine) {
            if (C20Config._context === 'root-shell') {
                C20Config._rootShellActive = false;
                C20Config._switchContext('attacker', term);
                return 'Connection to 10.13.37.1 closed.\n[+] Returned to attacker machine.';
            }
            return 'logout';
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] <destination>';
            if (target === '10.13.37.1') {
                return `PING 10.13.37.1 (10.13.37.1) 56(84) bytes of data.
64 bytes from 10.13.37.1: icmp_seq=1 ttl=63 time=12.1 ms
64 bytes from 10.13.37.1: icmp_seq=2 ttl=63 time=11.9 ms
64 bytes from 10.13.37.1: icmp_seq=3 ttl=63 time=12.3 ms

--- 10.13.37.1 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 11.9/12.1/12.3/0.165 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'ip': function(args) {
            if (C20Config._context === 'root-shell') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.13.37.1/24 brd 10.13.37.255 scope global eth0`;
            }
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.13.37.100/24 brd 10.13.37.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return C20Config.commands.ip(args || []);
        },

        'ss': function(args) {
            if (C20Config._context === 'root-shell') {
                return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*
LISTEN   0        128      0.0.0.0:8000         0.0.0.0:*`;
            }
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*`;
        },

        'netstat': function(args) {
            return C20Config.commands.ss(args);
        },

        'ROPgadget': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('syn-gate-daemon') || fullCmd.includes('daemon')) {
                if (!C20Config._binaryAcquired) return 'ROPgadget: syn-gate-daemon: No such file or directory';
                return `Gadgets information
============================================================
0x0000000000401056 : pop rdi ; ret
0x0000000000401058 : pop rsi ; ret
0x000000000040105a : pop rdx ; ret
0x000000000040105c : pop rbp ; ret
0x0000000000401c76 : ret
0x0000000000401080 : jmp rax
0x0000000000402200 : syscall ; ret

Unique gadgets found: 7

[+] Consider: pop rdi; ret -> 0x401056 for passing first argument.
[+] system@plt: 0x401060 (confirmed via PLT analysis).
[+] /bin/sh string in binary: 0x403210 (found in strings output).`;
            }
            return 'Usage: ROPgadget --binary <binary>\nExample: ROPgadget --binary syn-gate-daemon';
        },

        'one_gadget': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (target.includes('libc') || target.includes('.so')) {
                return `0x4f2a5 execve("/bin/sh", rsp+0x40, environ)
constraints:
  rsp & 0xf == 0
  rcx == NULL

0x4f302 execve("/bin/sh", rsp+0x40, environ)
constraints:
  [rsp+0x40] == NULL

0x10a38c execve("/bin/sh", rsp+0x70, environ)
constraints:
  [rsp+0x70] == NULL`;
            }
            return 'Usage: one_gadget <libc.so>\nExample: one_gadget /lib/x86_64-linux-gnu/libc.so.6';
        },

        'pwncat': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if ((fullCmd.includes('10.13.37.1') || fullCmd.includes('-lp')) && C20Config._exploitWritten) {
                return '[+] pwncat listener active. Waiting for incoming shell...\n[+] Connection received from 10.13.37.1:52091\n[+] Upgrading to full TTY...\nroot@SYN-GATE-01:/root# ';
            }
            return `pwncat-cs: connecting to ${args[0] || 'host'}...\n[!] Connection timed out.`;
        },

        // Manual exploit runner — simulates exploit.py execution pathway
        'exploit': function(args, term, engine) {
            if (!C20Config._crashTriggered) {
                return '[!] No confirmed crash yet. Run your fuzzer first to confirm the vulnerability before developing an exploit.';
            }
            C20Config._exploitWritten = true;
            C20Config._rootShellActive = true;
            C20Config._switchContext('root-shell', term);
            if (engine) engine.advancePhase && engine.advancePhase('exploit_dev');
            return `[*] The Architect's Gambit — Exploit
[*] Target: 10.13.37.1:8000
[*] Vulnerability: Heap overflow in handle_send_data() @ 0x401c00
[*] Technique: tcache poisoning -> GOT overwrite -> system("/bin/sh")

[+] Stage 1: AUTH(user=architect, pass=synapse2026) -> state READY
[+] Stage 2: Heap alignment spray (14 allocs x 256 bytes)
[+] Stage 3: Overflow trigger — SEND_DATA(len=0x4141, payload=\\x41*256 + chunk_forge)
[+] Stage 4: Info leak — heap base 0x55f8a3c00000 via GET_STATUS response
[+] Stage 5: libc leak from GOT read — libc base 0x7f3b4c1f0000
[+] Stage 6: tcache poison — fd -> 0x41d020 (puts@GOT)
[+] Stage 7: Controlled alloc at 0x41d020 — write system() ptr
[+] Stage 8: Trigger puts("/bin/sh") -> execve("/bin/sh", 0, 0)

[!] Shell incoming...
[+] ROOT SHELL ON SYN-GATE-01

root@SYN-GATE-01:~#`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // FUZZER EXECUTION SIDE EFFECT TRACKER
    // Triggered when fuzzer runs and produces a crash
    // ═══════════════════════════════════════════════════════

    _onFuzzerCrash(engine) {
        C20Config._crashTriggered = true;
        if (engine) engine.advancePhase && engine.advancePhase('vuln_analysis');
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #ddd; background:#f9f4ff;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #eee;">${cell}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    },

    _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        const tables = tmp.querySelectorAll('table');
        tables.forEach(table => {
            const rows = table.querySelectorAll('tr');
            let text = '';
            rows.forEach(row => {
                const cells = row.querySelectorAll('td, th');
                const cellTexts = Array.from(cells).map(c => c.textContent.trim().padEnd(20));
                text += cellTexts.join('  ') + '\n';
            });
            table.replaceWith(document.createTextNode(text));
        });
        return tmp.textContent.trim();
    }

};
