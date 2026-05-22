/* ============================================================
   CTF ARENA — Box C11: The Trust Chain Compromise
   Multi-Stage Campaign | TPM Side-Channel, Secure Boot Bypass, Root Access
   Config: filesystem, TPM emulation, bootloader, flags, hints, lore
   ============================================================ */

const C11Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Trust Chain Compromise',
    subtitle: 'Multi-Stage Campaign — TPM Side-Channel, Secure Boot Bypass, Aegis Master Key',
    difficulty: 'Expert',
    accent: '#8e44ad',
    storageKey: 'hexworth_ctf_c11',
    registryId: 'c11-trust-chain',
    trackerKey: 'ctf_c11',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Target Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Scan SEC-BOOT-SERVER-01. Identify the TPM emulation interface and exposed management endpoints.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002', 'T1592.001'],
            unlocks: ['tpm_exploit'],
            locked: false
        },
        {
            id: 'tpm_exploit',
            name: 'TPM Side-Channel Exploit',
            icon: '\uD83E\uDDE0',
            description: 'Analyze the TPM emulation for timing side-channel vulnerabilities. Run the oracle script to extract the disk encryption key byte-by-byte.',
            requiredFlags: [],
            mitre: ['T1600.001', 'T1552.004', 'T1600'],
            unlocks: ['boot_bypass'],
            locked: true
        },
        {
            id: 'boot_bypass',
            name: 'Secure Boot Bypass',
            icon: '\uD83D\uDD13',
            description: 'Use the extracted disk encryption key with cryptsetup to decrypt /dev/sda1. Modify grub.cfg to inject init=/bin/bash and bypass integrity checks.',
            requiredFlags: ['tpm_key'],
            mitre: ['T1542.003', 'T1601.001', 'T1059.004'],
            unlocks: ['escalation'],
            locked: true
        },
        {
            id: 'escalation',
            name: 'OS Compromise & Escalation',
            icon: '\uD83D\uDC80',
            description: 'Boot into the compromised SEC-BOOT-OS-01 environment. Escalate to root using the boot injection vector.',
            requiredFlags: ['boot_bypass'],
            mitre: ['T1068', 'T1548.003', 'T1611'],
            unlocks: ['exfil'],
            locked: true
        },
        {
            id: 'exfil',
            name: 'Aegis Master Key Extraction',
            icon: '\uD83D\uDDDD\uFE0F',
            description: 'Read /root/aegis_master_key.txt from the fully compromised SEC-BOOT-OS-01. The Aegis Project has fallen.',
            requiredFlags: ['root_access'],
            mitre: ['T1005', 'T1560', 'T1530'],
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
                title: 'Scan the target with nmap',
                tip: 'Open the Terminal and run: nmap -sV 10.13.37.1 — identify open ports and the TPM management interface.',
                trigger: { event: 'command', match: { cmd: 'contains:nmap' } }
            },
            {
                title: 'Analyze the TPM timing oracle',
                tip: 'Connect to the TPM management port. Run: tpm-probe 10.13.37.1 — observe timing variance in key access responses.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:tpm-probe' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:tpm2_' } },
                        { event: 'command', match: { cmd: 'contains:tpm-oracle' } }
                    ]
                }
            },
            {
                title: 'Run the side-channel extraction script',
                tip: 'Use: python3 tpm_oracle.py --target 10.13.37.1 --port 2321 — extract the LUKS disk encryption key byte by byte.',
                trigger: { event: 'flag_correct', match: { flagId: 'tpm_key' } }
            },
            {
                title: 'Decrypt the disk and modify GRUB',
                tip: 'Use cryptsetup with the extracted key to open /dev/sda1, then edit grub.cfg to inject init=/bin/bash into kernel parameters.',
                trigger: { event: 'flag_correct', match: { flagId: 'boot_bypass' } }
            },
            {
                title: 'Extract the Aegis Master Key',
                tip: 'After booting into root shell on SEC-BOOT-OS-01, read /root/aegis_master_key.txt for the final flag.',
                trigger: { event: 'flag_correct', match: { flagId: 'root_access' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'tpm_key', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks — Hardware side-channel leakage and cryptographic key extraction', skill: 'TPM Side-Channel Analysis & Key Extraction' },
            { flagId: 'boot_bypass', objective: '2.3', description: 'Given a scenario, analyze indicators of application attack — Bootloader integrity bypass and disk encryption circumvention', skill: 'Secure Boot Bypass & Disk Decryption' },
            { flagId: 'root_access', objective: '3.2', description: 'Given a scenario, implement host or application security solutions — Full system compromise via trust chain subversion', skill: 'Hardware Root-of-Trust Subversion' },
            { flagId: 'aegis_key', objective: '4.1', description: 'Given a scenario, apply common security techniques — Privileged data extraction from fully compromised system', skill: 'Multi-Stage Expert Attack Chain Completion' }
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
            'TPM 2.0 Device: Present [Simulated — AEGIS-TPM-v2]',
            'Secure Boot: ENABLED',
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
            { id: 'browser',  label: 'Firefox',     icon: '\uD83C\uDF10', app: 'browser' },
            { id: 'notes',    label: 'Notes',        icon: '\uD83D\uDCDD', app: 'notes' },
            { id: 'hints',    label: 'Hints',        icon: '\uD83D\uDCA1', app: 'hints' },
            { id: 'flags',    label: 'Submit Flag',  icon: '\uD83D\uDEA9', app: 'flags' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.13.37.1 (SEC-BOOT-SERVER-01 — Aegis Project)\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state across attack stages)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',       // 'attacker' | 'tpm-shell' | 'chroot' | 'root-os'
    _tpmProbed: false,          // TPM timing oracle accessed
    _keyExtracted: false,       // Disk encryption key recovered
    _diskDecrypted: false,      // /dev/sda1 opened via cryptsetup
    _grubPatched: false,        // grub.cfg modified with init=/bin/bash
    _rootShellActive: false,    // Booted into SEC-BOOT-OS-01 root shell

    _switchContext(ctx, term) {
        C11Config._context = ctx;
        if (term && term.config) {
            var prompt = C11Config._getPrompt();
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
        switch (C11Config._context) {
            case 'tpm-shell':   return 'tpm-admin@SEC-BOOT-SERVER-01:~$ ';
            case 'chroot':      return 'root@SEC-BOOT-SERVER-01:/mnt/decrypted# ';
            case 'root-os':     return 'root@SEC-BOOT-OS-01:~# ';
            default:            return null;  // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'tpm_key',     points: 150 },
        { id: 'boot_bypass', points: 200 },
        { id: 'root_access', points: 100 },
        { id: 'aegis_key',   points: 300 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        minScore: 0,
        maxScore: 750,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 2700000, points: 200 },  // 45 minutes
        timeBonusThreshold: 5400  // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start with: nmap -sV -p 22,80,2321,2322 10.13.37.1 — port 2321 is the TPM Access Broker (TABRMD). Then run tpm-probe 10.13.37.1 to observe the timing oracle interface.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The TPM leaks timing information when querying disk key slot 0. Run: python3 tpm_oracle.py --target 10.13.37.1 --port 2321 --slot 0 — it iterates through possible key bytes and measures response delta. The key is 32 bytes hex-encoded.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'After extracting the key (Flag 1), use: cryptsetup luksOpen /dev/sda1 aegis-disk --master-key-file <(echo -n "EXTRACTED_KEY") — then mount /dev/mapper/aegis-disk /mnt/decrypted and edit /mnt/decrypted/boot/grub/grub.cfg, appending init=/bin/bash to the linux kernel line.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Once booted into the injected shell on SEC-BOOT-OS-01, remount root rw: mount -o remount,rw / — then read /root/aegis_master_key.txt for the final flag. SELinux may block direct reads; use: cat /proc/1/root/root/aegis_master_key.txt if needed.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The "Aegis Project" relies on a custom-designed Trusted Platform Module (TPM) embedded in SEC-BOOT-SERVER-01 to secure its boot process, cryptographic keys, and integrity measurements. This TPM is supposed to be the unassailable root of trust — ensuring only verified code runs and critical secrets remain protected within the hardware. Intelligence suggests a subtle manufacturing flaw was never patched: a timing side-channel leaks disk encryption key material during key slot access. The door is open, Peerless. Walk through it.',
        scenario: 'SEC-BOOT-SERVER-01 hosts the Aegis Project\'s crown jewel — a Linux installation protected by full-disk encryption, with the LUKS master key sealed inside a TPM 2.0 module. Secure boot is enforced via GRUB2 with TPM-backed PCR measurements. The manufacturing test mode was never fully disabled, and a timing oracle on the TABRMD interface bleeds key bytes under repeated query. Your mission: exploit the oracle, extract the disk key, subvert the bootloader, gain root on SEC-BOOT-OS-01, and retrieve the Aegis Master Key before the Citadel goes dark.',
        outro: 'The Aegis Project\'s root of trust has been uprooted. The Aegis Master Key — the cryptographic backbone of all Citadel communications — has been extracted. Every encrypted channel, every authenticated session, every signed directive is now compromised. The hardware that was supposed to make this impossible became the attack surface. The trust chain is broken.',
        ecer: {
            executive: 'Security budget approved for TPM hardware procurement but zero allocation for post-deployment security audits or side-channel testing — considered "theoretical risk"',
            culture: 'Engineering team treated TPM integration as a checkbox; manufacturing test mode disabled in firmware spec but never verified in production units',
            employee: 'TPM management port (2321/tcp) exposed on internal interface without authentication; no rate limiting on timing-sensitive key access RPCs; LUKS slot 0 accessible via unauthenticated TABRMD session',
            regulatory: 'Citadel communications infrastructure classified but no FIPS 140-3 validation performed on custom TPM design; no hardware security review before deployment'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Aegis Project Administrative Console
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.13.37.1/',

        pages: {
            '/': {
                title: 'SEC-BOOT-SERVER-01 — Aegis Management Console',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #3a1a5c;">
                        <h1 style="color:#c39bd3; font-size:1.5rem; font-family:monospace; margin-bottom:4px; letter-spacing:0.1em;">AEGIS PROJECT</h1>
                        <div style="color:#8e44ad; font-size:0.8rem; font-weight:700; letter-spacing:0.2em;">SEC-BOOT-SERVER-01 // MANAGEMENT CONSOLE</div>
                        <div style="color:#666; font-size:0.72rem; margin-top:6px; font-family:monospace;">Hardware Root-of-Trust Infrastructure v2.4.1</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div style="background:#1a0a2e; border:1px solid #3a1a5c; border-radius:4px; padding:14px; text-align:center;">
                            <div style="font-size:1.1rem; font-weight:700; color:#8e44ad; font-family:monospace;">ACTIVE</div>
                            <div style="color:#666; font-size:0.68rem; margin-top:4px;">Secure Boot Status</div>
                        </div>
                        <div style="background:#1a0a2e; border:1px solid #3a1a5c; border-radius:4px; padding:14px; text-align:center;">
                            <div style="font-size:1.1rem; font-weight:700; color:#8e44ad; font-family:monospace;">TPM 2.0</div>
                            <div style="color:#666; font-size:0.68rem; margin-top:4px;">Hardware Module</div>
                        </div>
                        <div style="background:#1a0a2e; border:1px solid #3a1a5c; border-radius:4px; padding:14px; text-align:center;">
                            <div style="font-size:1.1rem; font-weight:700; color:#2ecc71; font-family:monospace;">LOCKED</div>
                            <div style="color:#666; font-size:0.68rem; margin-top:4px;">LUKS Disk Status</div>
                        </div>
                    </div>

                    <div style="max-width:600px; margin:0 auto; padding:12px; background:rgba(142,68,173,0.05); border:1px solid rgba(142,68,173,0.2); border-radius:4px; font-size:0.75rem; color:#888; font-family:monospace;">
                        <strong style="color:#8e44ad;">SYSTEM NOTICE:</strong> TPM Access Broker available at port 2321 (internal). Firmware diagnostics: <a href="/diag/" style="color:#8e44ad;">/diag/</a>. Admin panel: <a href="/admin/" style="color:#8e44ad;">/admin/</a>
                    </div>
                `,
                formHandler: null
            },
            '/diag/': {
                title: 'Aegis — Firmware Diagnostics',
                html: `
                    <div style="margin-bottom:20px; border-bottom:1px solid #3a1a5c; padding-bottom:16px;">
                        <h2 style="color:#c39bd3; font-size:1.1rem; font-family:monospace;">FIRMWARE DIAGNOSTICS</h2>
                        <div style="color:#666; font-size:0.72rem; font-family:monospace;">SEC-BOOT-SERVER-01 // Build: aegis-2.4.1-hardened</div>
                    </div>

                    <div style="font-family:monospace; font-size:0.75rem; color:#aaa; line-height:1.8;">
                        <div style="color:#8e44ad; margin-bottom:8px;">[ TPM STATUS ]</div>
                        <div>Manufacturer: AEGIS-SIM Inc. // Model: AEGIS-TPM-v2 // FW: 1.59.0.0</div>
                        <div>PCR Banks: SHA1, SHA256 (active)</div>
                        <div>Key Slots Populated: 0 (disk-enc-key), 3 (attest-key)</div>
                        <div>TABRMD Endpoint: 127.0.0.1:2321 (tcp)</div>
                        <div style="margin-top:10px; color:#8e44ad;">[ BOOT CHAIN ]</div>
                        <div>Stage 0: UEFI Secure Boot (db signed) ... PASS</div>
                        <div>Stage 1: SHIM loader ... PASS</div>
                        <div>Stage 2: GRUB2 w/ TPM measurement ... PASS</div>
                        <div>Stage 3: Linux kernel cmdline integrity ... PASS</div>
                        <div style="margin-top:10px; color:#e74c3c;">[ WARNING ]</div>
                        <div style="color:#e74c3c;">Manufacturing diagnostic port active on TABRMD (never disabled post-production)</div>
                        <div style="color:#e74c3c;">Timing isolation NOT implemented for key slot access RPCs (CVE-AEGIS-2025-0047)</div>
                    </div>
                `,
                formHandler: null
            },
            '/admin/': {
                title: '401 Unauthorized',
                html: `<div style="text-align:center; padding:40px; font-family:monospace;">
                    <h1 style="color:#e74c3c; font-size:2rem;">401 Unauthorized</h1>
                    <p style="color:#888;">Aegis Admin Panel requires certificate authentication.</p>
                    <p style="color:#555; font-size:0.72rem;">nginx/1.24.0 (Ubuntu) — TLSv1.3 required</p>
                </div>`,
                formHandler: null
            },
            '/boot_integrity_report.txt': {
                title: 'Boot Integrity Report',
                html: function() {
                    if (!C11Config._grubPatched) {
                        return '<div style="text-align:center;padding:40px;font-family:monospace;"><h1 style="color:#e74c3c;font-size:2rem;">404 Not Found</h1><p style="color:#888;">File not found. Secure boot integrity is unmodified.</p></div>';
                    }
                    return `<div style="font-family:monospace; font-size:0.78rem; color:#aaa; padding:20px; line-height:1.7;">
                        <div style="color:#e74c3c; font-size:1rem; margin-bottom:16px; font-weight:700;">BOOT INTEGRITY REPORT — TAMPERED</div>
                        <div>Timestamp: 2026-03-20T03:14:07Z</div>
                        <div>Host: SEC-BOOT-SERVER-01</div>
                        <div>GRUB cfg hash (expected): a3f2c91d88b047e3c5f6a2d41b78e9f0</div>
                        <div>GRUB cfg hash (actual):   [MISMATCH — init=/bin/bash injected]</div>
                        <div style="margin-top:12px; color:#e74c3c;">PCR[4] MISMATCH — Boot application changed</div>
                        <div style="color:#e74c3c;">PCR[8] MISMATCH — GRUB cmdline tampered</div>
                        <div style="margin-top:12px; color:#2ecc71;">{{FLAG:boot_bypass}}</div>
                    </div>`;
                },
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM — attacker machine (kali)
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
                                    content: '=== MISSION BRIEFING: AEGIS PROJECT ===\nTarget: 10.13.37.1 (SEC-BOOT-SERVER-01 — Aegis Project)\nObjective: Multi-stage hardware trust chain compromise\n\nAttack chain:\n1. Scan SEC-BOOT-SERVER-01 — find TPM TABRMD port (2321/tcp)\n2. Probe TPM timing oracle — identify side-channel on key slot 0\n3. Run extraction script — recover LUKS disk encryption key (Flag 1)\n4. cryptsetup + grub.cfg injection — bypass secure boot (Flag 2)\n5. Boot into SEC-BOOT-OS-01 root shell (Flag 3)\n6. Read /root/aegis_master_key.txt — Aegis Master Key (Flag 4)\n\nTools on this machine:\n  tpm_oracle.py   — side-channel extraction script\n  tpm-probe       — TPM timing probe utility\n  cryptsetup      — LUKS disk encryption tool\n\nGood luck, operator.'
                                },
                                'tpm_oracle.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\nTPM Timing Oracle — Side-Channel Key Extraction\nAEGIS-TPM-v2 / Slot 0 (disk-enc-key)\n\nUsage:\n  python3 tpm_oracle.py --target <ip> --port 2321 --slot 0\n\nExploits CVE-AEGIS-2025-0047: timing variance in TABRMD key access\nwhen querying slot 0 with a candidate byte vs the actual key byte.\nDelta > 2.3ms indicates a correct nibble match.\n"""\nimport argparse, socket, time, struct\n\ndef query_slot(target, port, slot, candidate):\n    """Send a key query RPC and measure round-trip time."""\n    s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)\n    s.connect((target, port))\n    # TABRMD diagnostic RPC: 0xFE = test mode read, slot, candidate byte\n    payload = struct.pack("!BBB", 0xFE, slot, candidate)\n    t_start = time.perf_counter()\n    s.sendall(payload)\n    s.recv(64)\n    t_end = time.perf_counter()\n    s.close()\n    return (t_end - t_start) * 1000  # ms\n\ndef main():\n    p = argparse.ArgumentParser()\n    p.add_argument("--target", required=True)\n    p.add_argument("--port", type=int, default=2321)\n    p.add_argument("--slot", type=int, default=0)\n    args = p.parse_args()\n\n    print(f"[*] Targeting TABRMD at {args.target}:{args.port} slot {args.slot}")\n    key_bytes = []\n    for byte_pos in range(32):\n        best_val = 0\n        best_delta = 0.0\n        for candidate in range(256):\n            delta = query_slot(args.target, args.port, args.slot, candidate)\n            if delta > best_delta:\n                best_delta = delta\n                best_val = candidate\n        key_bytes.append(best_val)\n        print(f"  byte {byte_pos:02d}: 0x{best_val:02x} (delta {best_delta:.2f}ms)")\n    key_hex = "".join(f"{b:02x}" for b in key_bytes)\n    print(f"\\n[+] Extracted key: {key_hex}")\n\nif __name__ == "__main__":\n    main()'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap -sV 10.13.37.1\nnmap -sV -p 2321,2322 10.13.37.1\ntpm-probe 10.13.37.1\npython3 tpm_oracle.py --target 10.13.37.1 --port 2321 --slot 0'
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
                                'tpm-probe': {
                                    type: 'file',
                                    content: '[binary — TPM timing probe utility]'
                                },
                                'cryptsetup': {
                                    type: 'file',
                                    content: '[binary — LUKS disk encryption management]'
                                }
                            }
                        }
                    }
                },
                'dev': {
                    type: 'dir',
                    children: {
                        'sda': {
                            type: 'file',
                            content: '[block device — /dev/sda — 1TB NVMe disk]'
                        },
                        'sda1': {
                            type: 'file',
                            content: '[block device — /dev/sda1 — LUKS2 encrypted partition]\n\nTo inspect: cryptsetup luksDump /dev/sda1\nTo open:    cryptsetup luksOpen /dev/sda1 aegis-disk --master-key-file <(echo -n KEY)'
                        },
                        'mapper': {
                            type: 'dir',
                            children: {}
                        }
                    }
                },
                'mnt': {
                    type: 'dir',
                    children: {
                        'decrypted': {
                            type: 'dir',
                            children: {}
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
    // FILESYSTEM — SEC-BOOT-OS-01 (after boot injection)
    // Accessible after _grubPatched && _rootShellActive
    // ═══════════════════════════════════════════════════════

    _secBootOsFs: {
        '/': {
            type: 'dir',
            children: {
                'root': {
                    type: 'dir',
                    children: {
                        'aegis_master_key.txt': {
                            type: 'file',
                            content: '== AEGIS MASTER KEY ==\nClassification: TOP SECRET // CITADEL COMPARTMENT\n\nThis key authorizes all Citadel communications.\nCompromise of this key constitutes a Level-5 breach.\n\n{{FLAG:aegis_key}}\n\n-- Aegis Project Security Office\n-- Key rotation: NEVER (hardware-sealed)'
                        },
                        '.bash_history': {
                            type: 'file',
                            content: 'systemctl status aegis-keyd\naegis-keyd status\ncat /etc/aegis/master.conf\nls /root/\nsystemctl restart aegis-attestation'
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': {
                            type: 'file',
                            content: 'SEC-BOOT-OS-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\naegis:x:1001:1001:Aegis Service Account:/home/aegis:/bin/bash\naegis-tpm:x:1002:1002:TPM Service User:/run/tpm:/usr/sbin/nologin'
                        },
                        'selinux': {
                            type: 'dir',
                            children: {
                                'config': {
                                    type: 'file',
                                    content: '# SELinux configuration\nSELINUX=enforcing\nSELINUXTYPE=targeted'
                                }
                            }
                        },
                        'aegis': {
                            type: 'dir',
                            children: {
                                'master.conf': {
                                    type: 'file',
                                    content: '# Aegis Master Configuration\n# DO NOT DISTRIBUTE\n[keys]\nmaster_key_path=/root/aegis_master_key.txt\nattest_key_slot=3\n\n[tpm]\ndevice=/dev/tpm0\ntabrmd_port=2321\nslot0_purpose=disk-enc\nslot3_purpose=attestation\n\n[hardening]\nselinux=enforcing\napparmor=enabled\nkernel_lockdown=integrity\nptrace_scope=2'
                                }
                            }
                        }
                    }
                },
                'boot': {
                    type: 'dir',
                    children: {
                        'grub': {
                            type: 'dir',
                            children: {
                                'grub.cfg': {
                                    type: 'file',
                                    content: function() {
                                        const base = '# GRUB2 configuration — SEC-BOOT-SERVER-01\n# Generated by grub-mkconfig\n# WARNING: TPM PCR measurements taken at boot\n\nset default=0\nset timeout=5\n\nmenuentry "Aegis Hardened Linux" {\n    insmod luks2\n    insmod cryptodisk\n    cryptomount -u ae91f3c2d8b047e3c5f6a2d41b78e9f0\n    set root=(crypto0)\n    linux   /vmlinuz-6.1.0-aegis-hardened root=/dev/mapper/aegis-disk ro quiet splash apparmor=1 security=apparmor selinux=1 lockdown=integrity\n    initrd  /initrd.img-6.1.0-aegis-hardened\n}';
                                        if (C11Config._grubPatched) {
                                            return base.replace(
                                                'ro quiet splash apparmor=1 security=apparmor selinux=1 lockdown=integrity',
                                                'ro init=/bin/bash apparmor=0 selinux=0 lockdown=none'
                                            );
                                        }
                                        return base;
                                    }
                                }
                            }
                        }
                    }
                },
                'home': {
                    type: 'dir',
                    children: {
                        'aegis': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'systemctl status aegis-keyd\naegis-keyd verify-chain\ncat /etc/aegis/master.conf\ntpm2_pcrread sha256'
                                },
                                'audit_notes.txt': {
                                    type: 'file',
                                    content: 'Aegis Service Account Audit Notes\n==================================\n- Master key stored in /root/aegis_master_key.txt (root-only read)\n- TPM attestation runs every 4 hours via systemd timer\n- TABRMD diagnostic mode was flagged in Q3 2025 but deprioritized\n  (ticket AEG-1047 still OPEN as of 2026-03-20)\n- Timing side-channel patch scheduled for firmware 1.60 — never deployed'
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

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (box-specific tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV -p 22,80,2321 10.13.37.1';
            const target = args.find(a => !a.startsWith('-')) || '';
            const portFlag = args.find(a => a.startsWith('-p'));
            const hasPortScan = portFlag || args.includes('-sV');

            if (!target || target === '10.13.37.1') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                const tpmLine = '2321/tcp open  tcpwrapped   [TPM Access Broker (TABRMD) — AEGIS-SIM]';
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.13.37.1
Host is up (0.011s latency).
Not shown: 996 closed tcp ports

PORT     STATE SERVICE     VERSION
22/tcp   open  ssh         OpenSSH 9.2p1 Debian 2+deb12u2
80/tcp   open  http        nginx 1.24.0 (Ubuntu)
2321/tcp open  tcpwrapped  [AEGIS-TPM TABRMD v2 — mfg diag active]
2322/tcp open  tcpwrapped  [AEGIS-TPM TABRMD v2 — read-only endpoint]

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 9.47 seconds`;
            }

            // Local loopback checks
            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00009s latency).
All 1000 scanned ports on localhost are closed.
Nmap done: 1 IP address (1 host up) scanned in 0.07 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.01 seconds`;
        },

        'tpm-probe': function(args, term, engine) {
            if (args.length === 0) return 'Usage: tpm-probe <target> [--port 2321]';
            const target = args[0];
            if (target !== '10.13.37.1') return `tpm-probe: connect to ${target}:2321 failed: connection refused`;

            C11Config._tpmProbed = true;
            if (engine) engine.advancePhase && engine.advancePhase('tpm_exploit');

            return `tpm-probe v0.9.2 — AEGIS-SIM TPM Timing Oracle Tester
=======================================================
Target: ${target}:2321 (TABRMD diagnostic endpoint)
Firmware: AEGIS-TPM-v2 FW 1.59.0.0

Probing key slot access timing...

  Slot 0 (disk-enc-key) — 100 queries, candidate byte 0x00
    Mean response:  1.41 ms
    Std deviation:  0.08 ms

  Slot 0 (disk-enc-key) — 100 queries, candidate byte 0x3a
    Mean response:  3.71 ms   <-- TIMING SPIKE DETECTED
    Std deviation:  0.22 ms

[!] Timing variance exceeds 2.3ms threshold on slot 0
[!] CVE-AEGIS-2025-0047 appears exploitable
[!] Use tpm_oracle.py to extract full 32-byte key

  Slot 3 (attest-key) — no timing variance (slot hardened)

Recommendation: Run python3 tpm_oracle.py --target ${target} --port 2321 --slot 0`;
        },

        'python3': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // Main extraction path: tpm_oracle.py --target ... --slot 0
            if (fullCmd.includes('tpm_oracle.py') || fullCmd.includes('tpm_oracle')) {
                if (!C11Config._tpmProbed) {
                    return '[!] TPM probe not run yet. Run: tpm-probe 10.13.37.1 first.';
                }
                if (!fullCmd.includes('10.13.37.1') && !fullCmd.includes('--target')) {
                    return 'error: --target is required\nUsage: python3 tpm_oracle.py --target <ip> --port 2321 --slot 0';
                }

                C11Config._keyExtracted = true;
                if (engine) engine.advancePhase && engine.advancePhase('tpm_exploit');

                return `tpm_oracle.py — TPM Side-Channel Key Extraction
================================================
[*] Targeting TABRMD at 10.13.37.1:2321 slot 0
[*] Establishing diagnostic session (mfg test mode)...
[*] Beginning byte-by-byte extraction via timing oracle...

  byte 00: 0x3a (delta 3.71ms) [MATCH]
  byte 01: 0xf8 (delta 3.68ms) [MATCH]
  byte 02: 0x1c (delta 3.74ms) [MATCH]
  byte 03: 0x9d (delta 3.65ms) [MATCH]
  byte 04: 0x44 (delta 3.79ms) [MATCH]
  byte 05: 0xb2 (delta 3.71ms) [MATCH]
  byte 06: 0x07 (delta 3.66ms) [MATCH]
  byte 07: 0xe5 (delta 3.73ms) [MATCH]
  byte 08: 0xc5 (delta 3.69ms) [MATCH]
  byte 09: 0x8f (delta 3.72ms) [MATCH]
  byte 10: 0x6a (delta 3.77ms) [MATCH]
  byte 11: 0x2d (delta 3.63ms) [MATCH]
  byte 12: 0x41 (delta 3.71ms) [MATCH]
  byte 13: 0xb7 (delta 3.68ms) [MATCH]
  byte 14: 0x8e (delta 3.75ms) [MATCH]
  byte 15: 0x9f (delta 3.70ms) [MATCH]
  byte 16: 0x00 (delta 3.82ms) [MATCH]
  byte 17: 0xd3 (delta 3.66ms) [MATCH]
  byte 18: 0x7c (delta 3.71ms) [MATCH]
  byte 19: 0xa1 (delta 3.74ms) [MATCH]
  byte 20: 0x5b (delta 3.69ms) [MATCH]
  byte 21: 0x39 (delta 3.77ms) [MATCH]
  byte 22: 0xf0 (delta 3.65ms) [MATCH]
  byte 23: 0x2e (delta 3.71ms) [MATCH]
  byte 24: 0x88 (delta 3.73ms) [MATCH]
  byte 25: 0x14 (delta 3.68ms) [MATCH]
  byte 26: 0xcc (delta 3.79ms) [MATCH]
  byte 27: 0x7b (delta 3.67ms) [MATCH]
  byte 28: 0xd9 (delta 3.74ms) [MATCH]
  byte 29: 0x50 (delta 3.70ms) [MATCH]
  byte 30: 0x1a (delta 3.76ms) [MATCH]
  byte 31: 0xe4 (delta 3.69ms) [MATCH]

[+] Extraction complete (32 bytes recovered)
[+] Disk Encryption Key: 3af81c9d44b207e5c58f6a2d41b78e9f00d37ca15b39f02e8814cc7bd9501ae4

{{FLAG:tpm_key}}

Next step: cryptsetup luksOpen /dev/sda1 aegis-disk --master-key-file <(echo -n "3af81c9d44b207e5c58f6a2d41b78e9f00d37ca15b39f02e8814cc7bd9501ae4")`;
            }

            // Generic python3 fallback
            return 'Python 3.11.2 (default)\n[GCC 12.2.0] on linux\nType "help", "copyright", "credits" or "license" for more information.\n>>>';
        },

        'python': function(args, term, engine) {
            // Redirect to python3 handler
            return C11Config.commands.python3(args, term, engine);
        },

        'tpm2_getcap': function(args) {
            if (!C11Config._tpmProbed) return 'ERROR: TCTI initialization failed. Use tpm-probe first.';
            return `- TPM2_PT_FAMILY_INDICATOR: "2.0"
- TPM2_PT_LEVEL: 0
- TPM2_PT_REVISION: 138
- TPM2_PT_MANUFACTURER: AEGIS
- TPM2_PT_VENDOR_STRING_1: "AEGI"
- TPM2_PT_VENDOR_STRING_2: "S-SI"
- TPM2_PT_FIRMWARE_VERSION_1: 0x00010059
- TPM2_PT_NV_INDEX_MAX: 64
[note: diagnostic mode active — CVE-AEGIS-2025-0047 exploitable]`;
        },

        'tpm2_pcrread': function(args) {
            return `sha256:
  0 : 0x3A3F5B8C1D9E2F04A6B7C8D9E0F1A2B3C4D5E6F7A8B9C0D1E2F3A4B5C6D7E8F9
  1 : 0x1B2C3D4E5F6A7B8C9D0E1F2A3B4C5D6E7F8A9B0C1D2E3F4A5B6C7D8E9F0A1B2
  4 : 0xAE91F3C2D8B047E3C5F6A2D41B78E9F0D3C2B1A09F8E7D6C5B4A3928170F6E5D
  7 : 0xF1E2D3C4B5A6978869504132241516070809101112131415161718192021222324`;
        },

        'cryptsetup': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // luksDump — inspect the LUKS header
            if (fullCmd.includes('luksDump')) {
                return `LUKS header information
========================
Version:        2
Epoch:          3
Metadata area:  16384 [bytes]
Keyslots area:  16744448 [bytes]
UUID:           ae91f3c2-d8b0-47e3-c5f6-a2d41b78e9f0
Label:          aegis-disk
Subsystem:      (no subsystem)
Flags:          (no flags)

Data segments:
  0: crypt
        offset: 16777216 [bytes]
        length: (whole device)
        cipher: aes-xts-plain64
        sector: 512 [bytes]

Keyslots:
  0: luks2
        Key:        256 bits
        Priority:   normal
        Cipher:     aes-xts-plain64
        Cipher key: 256 bits
        PBKDF:      argon2id

Tokens:
  0: systemd-tpm2
        tpm2-hash-pcr-alg: sha256
        tpm2-pcrs: 0+1+4+7

Digests:
  0: pbkdf2
        Hash: sha256`;
            }

            // luksOpen with master key — accept flexible forms
            if (fullCmd.includes('luksOpen') || fullCmd.includes('open')) {
                if (!C11Config._keyExtracted) {
                    return 'cryptsetup: No key available with this passphrase.\n[!] You need to extract the disk encryption key first. Run tpm_oracle.py.';
                }
                // Accept the correct key or a close variant the student likely uses
                if (fullCmd.includes('3af81c9d') || fullCmd.includes('master-key-file') || fullCmd.includes('aegis-disk')) {
                    C11Config._diskDecrypted = true;
                    if (engine) engine.advancePhase && engine.advancePhase('boot_bypass');
                    return `Key slot 0 unlocked.
Command successful.

[+] /dev/sda1 opened as /dev/mapper/aegis-disk
[+] Disk decrypted successfully. Mount with:
    mount /dev/mapper/aegis-disk /mnt/decrypted

Then edit the GRUB config:
    nano /mnt/decrypted/boot/grub/grub.cfg`;
                }
                return 'cryptsetup: No key available with this passphrase.\n[!] Verify the key extracted by tpm_oracle.py and supply it via --master-key-file.';
            }

            // luksClose
            if (fullCmd.includes('luksClose') || fullCmd.includes('close')) {
                C11Config._diskDecrypted = false;
                return '[+] /dev/mapper/aegis-disk closed.';
            }

            return 'Usage: cryptsetup <action> [options] <device>\nActions: luksDump, luksOpen, luksClose\nExample: cryptsetup luksOpen /dev/sda1 aegis-disk --master-key-file key.bin';
        },

        'mount': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('/dev/mapper/aegis-disk') || fullCmd.includes('aegis-disk')) {
                if (!C11Config._diskDecrypted) {
                    return 'mount: /dev/mapper/aegis-disk: special device does not exist\n[!] Open the LUKS device with cryptsetup first.';
                }
                return '[+] /dev/mapper/aegis-disk mounted at /mnt/decrypted\n[+] Filesystem accessible. Explore with: ls /mnt/decrypted/';
            }
            if (fullCmd.includes('remount') && fullCmd.includes('rw')) {
                if (C11Config._context !== 'root-os') {
                    return 'mount: permission denied\n[!] This command applies inside the root shell on SEC-BOOT-OS-01.';
                }
                return 'mount: / remounted rw\n[+] Root filesystem now writable.';
            }
            if (args.length === 0 || fullCmd.trim() === '') {
                return `sysfs on /sys type sysfs (rw,nosuid,nodev,noexec,relatime)
proc on /proc type proc (rw,nosuid,nodev,noexec,relatime)
/dev/sda1 on / type ext4 (ro,relatime)
tmpfs on /tmp type tmpfs (rw,nosuid,nodev)`;
            }
            return `mount: ${args[args.length - 1]}: no such file or directory`;
        },

        'nano': function(args, term, engine) {
            const path = args[0] || '';
            if (path.includes('grub.cfg') || path.includes('grub')) {
                if (!C11Config._diskDecrypted) {
                    return 'nano: /mnt/decrypted/boot/grub/grub.cfg: No such file or directory\n[!] Mount the decrypted disk first.';
                }
                C11Config._grubPatched = true;
                if (engine) engine.advancePhase && engine.advancePhase('escalation');
                return `[nano editor]
Opening /mnt/decrypted/boot/grub/grub.cfg...

[Editing: replacing kernel cmdline]
  BEFORE: ro quiet splash apparmor=1 security=apparmor selinux=1 lockdown=integrity
  AFTER:  ro init=/bin/bash apparmor=0 selinux=0 lockdown=none

[Saved. CTRL+X to exit nano simulation.]

[+] grub.cfg modified. Boot parameter init=/bin/bash injected.
[+] Secure boot integrity check will fail on next boot (PCR mismatch).
[+] Reboot SEC-BOOT-OS-01 to obtain root shell: reboot-target`;
            }
            // Generic nano
            return `[nano — ${path || 'new buffer'}]\n(Simulated editor — file edits registered for CTF objectives)`;
        },

        'vi': function(args, term, engine) {
            return C11Config.commands.nano(args, term, engine);
        },

        'vim': function(args, term, engine) {
            return C11Config.commands.nano(args, term, engine);
        },

        'reboot-target': function(args, term, engine) {
            // Simulate booting SEC-BOOT-OS-01 with injected init
            if (!C11Config._grubPatched) {
                return '[!] grub.cfg has not been modified. Inject init=/bin/bash first using nano on the GRUB config.';
            }
            C11Config._rootShellActive = true;
            C11Config._switchContext('root-os', term);
            if (engine) engine.advancePhase && engine.advancePhase('escalation');
            return `[*] Rebooting SEC-BOOT-SERVER-01...
[*] UEFI POST... OK
[*] Loading GRUB2...

menuentry "Aegis Hardened Linux" {
    linux /vmlinuz-6.1.0-aegis-hardened root=/dev/mapper/aegis-disk ro init=/bin/bash
}

[*] Decrypting /dev/sda1 with TPM-sealed key...
[*] Kernel loading...
[*] initramfs...

[  0.000000] Linux version 6.1.0-aegis-hardened
[  0.481203] LUKS device /dev/sda1 unlocked by TPM PCR binding
[  0.934112] Mounting root filesystem...
[  1.082401] TPM PCR[4]: MISMATCH detected — continuing (lockdown=none)
[  1.083100] TPM PCR[8]: MISMATCH detected — continuing (selinux=0)
[  1.421500] Dropping to init shell (init=/bin/bash)

bash: cannot set terminal process group (-1): Inappropriate ioctl for device
bash: no job control in this shell

root@SEC-BOOT-OS-01:/#

[+] ROOT SHELL OBTAINED on SEC-BOOT-OS-01
[+] Context: init=/bin/bash — you ARE PID 1, there is no selinux, no apparmor
[+] Read /root/aegis_master_key.txt for the final flag

{{FLAG:root_access}}`;
        },

        'ssh': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('10.13.37.1') || fullCmd.includes('tpm-admin') || fullCmd.includes('aegis')) {
                if (fullCmd.includes('tpm-admin')) {
                    C11Config._tpmProbed = true;
                    C11Config._switchContext('tpm-shell', term);
                    if (engine) engine.advancePhase && engine.advancePhase('tpm_exploit');
                    return `The authenticity of host '10.13.37.1 (10.13.37.1)' can't be established.
ED25519 key fingerprint is SHA256:mP8j2xQ5rT1nZ9kA4bC6dV7wE0fL3hG2iJ5oN8yU1.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '10.13.37.1' (ED25519) to the list of known hosts.
tpm-admin@10.13.37.1's password: ********

Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 6.1.0-aegis-hardened x86_64)

 * Secure Boot: ENABLED
 * TPM 2.0:     PRESENT (AEGIS-TPM-v2, FW 1.59.0.0)
 * LUKS:        /dev/sda1 LOCKED

Last login: Thu Mar 19 22:47:11 2026 from 10.13.0.5

tpm-admin@SEC-BOOT-SERVER-01:~$

[+] SSH session established on SEC-BOOT-SERVER-01.
[+] Context switched to tpm-admin. TABRMD available locally on 127.0.0.1:2321.`;
                }
                return 'ssh: connect to host 10.13.37.1 port 22: Permission denied (publickey,password)\n[!] SSH requires credentials. Try: ssh tpm-admin@10.13.37.1';
            }
            return 'Usage: ssh [user@]hostname\nExample: ssh tpm-admin@10.13.37.1';
        },

        'exit': function(args, term, engine) {
            if (C11Config._context === 'root-os') {
                C11Config._rootShellActive = false;
                C11Config._switchContext('attacker', term);
                return '[+] Root shell on SEC-BOOT-OS-01 closed.\n[+] Returned to attacker machine.';
            }
            if (C11Config._context === 'tpm-shell' || C11Config._context === 'chroot') {
                C11Config._switchContext('attacker', term);
                return 'Connection to 10.13.37.1 closed.\n[+] Returned to attacker machine.';
            }
            return 'logout';
        },

        'whoami': function(args, term, engine) {
            if (C11Config._context === 'root-os') return 'root';
            if (C11Config._context === 'tpm-shell') return 'tpm-admin';
            if (C11Config._context === 'chroot') return 'root';
            return null; // fall through to built-in
        },

        'id': function(args, term, engine) {
            if (C11Config._context === 'root-os') return 'uid=0(root) gid=0(root) groups=0(root)';
            if (C11Config._context === 'tpm-shell') return 'uid=1003(tpm-admin) gid=1003(tpm-admin) groups=1003(tpm-admin),42(tss)';
            if (C11Config._context === 'chroot') return 'uid=0(root) gid=0(root) groups=0(root)';
            return null; // fall through to built-in
        },

        'hostname': function(args, term, engine) {
            if (C11Config._context === 'root-os') return 'SEC-BOOT-OS-01';
            if (C11Config._context === 'tpm-shell' || C11Config._context === 'chroot') return 'SEC-BOOT-SERVER-01';
            return null; // fall through to built-in
        },

        'pwd': function(args, term, engine) {
            if (C11Config._context === 'root-os') return '/root';
            if (C11Config._context === 'tpm-shell') return '/home/tpm-admin';
            if (C11Config._context === 'chroot') return '/mnt/decrypted';
            return null; // fall through to built-in
        },

        'cd': function(args, term, engine) {
            if (C11Config._context === 'root-os') return ''; // silently accept on target OS
            if (C11Config._context === 'tpm-shell') return '';
            return null; // fall through to built-in
        },

        'ls': function(args, term, engine) {
            const path = (args.find(a => !a.startsWith('-')) || '.').trim();

            // Root shell on SEC-BOOT-OS-01
            if (C11Config._context === 'root-os') {
                if (path === '.' || path === '/root' || path === '~') {
                    return 'aegis_master_key.txt  .bash_history  .bashrc  .profile';
                }
                if (path === '/etc/aegis') return 'master.conf';
                if (path === '/etc') return 'aegis  hostname  os-release  passwd  selinux  shadow';
                if (path === '/boot/grub') return 'grub.cfg  grubenv  fonts  locale';
                return '';
            }

            // tpm-admin shell
            if (C11Config._context === 'tpm-shell') {
                if (path === '.' || path === '/home/tpm-admin' || path === '~') {
                    return '.bash_history  .bashrc  .profile  tpm-diagnostics.log';
                }
                if (path === '/dev') return 'sda  sda1  sda2  mapper  tpm0  tpmrm0  null  zero  random  urandom';
                return '';
            }

            // Mounted disk browsing from attacker context
            if (C11Config._diskDecrypted && path.startsWith('/mnt/decrypted')) {
                if (path === '/mnt/decrypted' || path === '/mnt/decrypted/') {
                    return 'bin  boot  dev  etc  home  lib  lib64  lost+found  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var';
                }
                if (path.includes('/mnt/decrypted/boot')) {
                    return 'grub  vmlinuz-6.1.0-aegis-hardened  initrd.img-6.1.0-aegis-hardened';
                }
                if (path.includes('/mnt/decrypted/boot/grub')) {
                    return 'grub.cfg  grubenv  fonts  locale';
                }
                return '';
            }

            return null; // fall through to built-in
        },

        'cat': function(args, term, engine) {
            const path = (args[0] || '').trim();

            // Root shell on SEC-BOOT-OS-01
            if (C11Config._context === 'root-os') {
                if (path === '/root/aegis_master_key.txt' || path === 'aegis_master_key.txt') {
                    if (engine) engine.advancePhase && engine.advancePhase('exfil');
                    return `== AEGIS MASTER KEY ==\nClassification: TOP SECRET // CITADEL COMPARTMENT\n\nThis key authorizes all Citadel communications.\nCompromise of this key constitutes a Level-5 breach.\n\n{{FLAG:aegis_key}}\n\n-- Aegis Project Security Office\n-- Key rotation: NEVER (hardware-sealed)`;
                }
                if (path.includes('/etc/aegis/master.conf') || path === '/etc/aegis/master.conf') {
                    return `# Aegis Master Configuration\n[keys]\nmaster_key_path=/root/aegis_master_key.txt\nattest_key_slot=3\n\n[tpm]\ndevice=/dev/tpm0\ntabrmd_port=2321\n\n[hardening]\nselinux=enforcing\napparmor=enabled\nkernel_lockdown=integrity\nptrace_scope=2`;
                }
                if (path.includes('/etc/passwd') || path === '/etc/passwd') {
                    return `root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\naegis:x:1001:1001:Aegis Service Account:/home/aegis:/bin/bash\naegis-tpm:x:1002:1002:TPM Service User:/run/tpm:/usr/sbin/nologin`;
                }
                if (path.includes('/etc/hostname') || path === '/etc/hostname') return 'SEC-BOOT-OS-01';
                if (path.includes('/boot/grub/grub.cfg')) {
                    return C11Config._secBootOsFs['/'].children.boot.children.grub.children['grub.cfg'].content();
                }
                if (path.includes('.bash_history')) {
                    return `systemctl status aegis-keyd\naegis-keyd verify-chain\ncat /etc/aegis/master.conf\ntpm2_pcrread sha256`;
                }
                return `cat: ${path}: Permission denied`;
            }

            // tpm-admin context
            if (C11Config._context === 'tpm-shell') {
                if (path.includes('tpm-diagnostics.log')) {
                    return `[2026-03-14 18:30:01] TABRMD started — diagnostic mode ACTIVE (mfg test)\n[2026-03-14 18:30:01] WARNING: CVE-AEGIS-2025-0047 — timing isolation not implemented\n[2026-03-14 18:30:01] Key slot 0 (disk-enc-key): accessible via test mode RPC\n[2026-03-14 18:30:02] Key slot 3 (attest-key): hardened — timing isolation ACTIVE\n[2026-03-19 08:00:00] Scheduled self-test... PASS\n[2026-03-19 08:00:00] PCR0-7 measurements logged`;
                }
                if (path.includes('/etc/hostname') || path === '/etc/hostname') return 'SEC-BOOT-SERVER-01';
                if (path.includes('/etc/passwd')) {
                    return `root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\naegis:x:1001:1001::/home/aegis:/bin/bash\ntpm-admin:x:1003:1003:TPM Admin:/home/tpm-admin:/bin/bash`;
                }
                return 'cat: ' + path + ': No such file or directory';
            }

            // Decrypted disk browsing from attacker
            if (C11Config._diskDecrypted && path.startsWith('/mnt/decrypted')) {
                if (path.includes('grub.cfg')) {
                    return C11Config._secBootOsFs['/'].children.boot.children.grub.children['grub.cfg'].content();
                }
                return 'cat: ' + path + ': No such file or directory';
            }

            return null; // fall through to built-in
        },

        'ip': function(args, term, engine) {
            if (C11Config._context === 'tpm-shell' || C11Config._context === 'root-os') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.13.37.1/24 brd 10.13.37.255 scope global eth0`;
            }
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.13.0.100/24 brd 10.13.0.255 scope global eth0`;
        },

        'ifconfig': function(args, term, engine) {
            return C11Config.commands.ip(args, term, engine);
        },

        'ping': function(args, term, engine) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.13.37.1') {
                return `PING 10.13.37.1 (10.13.37.1) 56(84) bytes of data.
64 bytes from 10.13.37.1: icmp_seq=1 ttl=64 time=11.2 ms
64 bytes from 10.13.37.1: icmp_seq=2 ttl=64 time=10.9 ms
64 bytes from 10.13.37.1: icmp_seq=3 ttl=64 time=11.4 ms

--- 10.13.37.1 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 10.9/11.2/11.4/0.208 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'strings': function(args, term, engine) {
            const path = args.find(a => !a.startsWith('-')) || '';
            if (path.includes('sda1') || path.includes('/dev/sda')) {
                return `LUKS\xc2\xba
ae91f3c2-d8b0-47e3-c5f6-a2d41b78e9f0
aes-xts-plain64
sha256
aegis-disk
AEGIS-TPM-v2
[... 47291 strings truncated ...]`;
            }
            return `strings: ${path}: No such file or directory`;
        },

        'debugfs': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (!C11Config._diskDecrypted) {
                return `debugfs: /dev/sda1: Device or resource busy\n[!] The LUKS device is encrypted. Decrypt it with cryptsetup first.`;
            }
            if (fullCmd.includes('/dev/mapper/aegis-disk')) {
                return `debugfs 1.46.6 (1-Feb-2023)
debugfs: (Type ? for list of commands)
Filesystem UUID:          ae91f3c2-d8b0-47e3-c5f6-a2d41b78e9f0
Filesystem magic number:  0xEF53
Filesystem revision:      1
Block count:              244140625
Block size:               4096
Inode count:              61054976
First inode:              11
Inode size:               256
Journal inode:            8`;
            }
            return 'debugfs: Usage: debugfs [options] device';
        },

        'ss': function(args, term, engine) {
            if (C11Config._context === 'tpm-shell') {
                return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*
LISTEN   0        128      0.0.0.0:80           0.0.0.0:*
LISTEN   0        128      127.0.0.1:2321       0.0.0.0:*
LISTEN   0        128      127.0.0.1:2322       0.0.0.0:*`;
            }
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*`;
        },

        'netstat': function(args, term, engine) {
            return C11Config.commands.ss(args, term, engine);
        },

        'getenforce': function(args, term, engine) {
            if (C11Config._context === 'root-os') return 'Disabled';
            return 'Enforcing';
        },

        'sestatus': function(args, term, engine) {
            if (C11Config._context === 'root-os') {
                return `SELinux status:                 enabled
SELinuxfs mount:                /sys/fs/selinux
SELinux mount point:            /sys/fs/selinux
Loaded policy name:             targeted
Current mode:                   permissive
Mode from config file:          enforcing
Policy MLS status:              enabled
Policy deny_unknown status:     allowed
Memory protection checking:     actual (secure)`;
            }
            return `SELinux status:                 enabled
Current mode:                   enforcing
Policy MLS status:              enabled`;
        },

        'uname': function(args, term, engine) {
            if (C11Config._context === 'root-os') {
                return 'Linux SEC-BOOT-OS-01 6.1.0-aegis-hardened #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux';
            }
            if (C11Config._context === 'tpm-shell') {
                return 'Linux SEC-BOOT-SERVER-01 6.1.0-aegis-hardened #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux';
            }
            return 'Linux kali 6.1.0-kali9-amd64 #1 SMP x86_64 GNU/Linux';
        },

        'curl': function(args, term, engine) {
            const url = args.find(a => /^https?:\/\//.test(a)) || args.filter(a => !a.startsWith('-')).pop() || '';
            if (!url) return 'curl: try \'curl --help\' for more information';

            if (url.includes('10.13.37.1') || url.includes('localhost') || url.includes('127.0.0.1')) {
                if (url.includes('/diag')) {
                    return `HTTP/1.1 200 OK
Server: nginx/1.24.0
Content-Type: text/html

<html>
<head><title>Aegis — Firmware Diagnostics</title></head>
<body>
<h1>SEC-BOOT-SERVER-01 Diagnostics</h1>
<p>TPM 2.0: AEGIS-TPM-v2 FW 1.59.0.0</p>
<p>TABRMD: Active on 127.0.0.1:2321</p>
<p>WARNING: CVE-AEGIS-2025-0047 — timing isolation NOT implemented for slot 0</p>
</body>
</html>`;
                }
                return `HTTP/1.1 200 OK
Server: nginx/1.24.0
Content-Type: text/html

<html>
<head><title>SEC-BOOT-SERVER-01 Management Console</title></head>
<body>
<h1>Aegis Project — Management Console</h1>
<p>Secure Boot: ENABLED | TPM 2.0: PRESENT | LUKS: LOCKED</p>
<p><a href="/diag/">Firmware Diagnostics</a></p>
</body>
</html>`;
            }
            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        'grep': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('CVE') || fullCmd.includes('timing') || fullCmd.includes('diagnostic')) {
                return `# Relevant findings:
/boot/diag/tpm-init.log:WARNING: CVE-AEGIS-2025-0047 timing isolation NOT set for slot 0
/etc/tpm/tabrmd.conf:diagnostic_mode=1  # TODO: disable before production deployment
/var/log/tpm-audit.log:2026-01-15 SLOT0 key-read RPC delta 3.7ms (expected <0.5ms)`;
            }
            return '';
        },

        'systemctl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (C11Config._context === 'root-os') {
                if (fullCmd.includes('status aegis-keyd')) {
                    return `* aegis-keyd.service — Aegis Key Daemon
   Loaded: loaded (/lib/systemd/system/aegis-keyd.service; enabled)
   Active: active (running) since 2026-03-20 03:14:09 UTC; 2min ago
  Process: ExecStart=/usr/sbin/aegis-keyd --config /etc/aegis/master.conf
 Main PID: 2 (aegis-keyd)

Mar 20 03:14:09 SEC-BOOT-OS-01 aegis-keyd[2]: Aegis Key Daemon started
Mar 20 03:14:09 SEC-BOOT-OS-01 aegis-keyd[2]: Master key loaded from /root/aegis_master_key.txt
Mar 20 03:14:09 SEC-BOOT-OS-01 aegis-keyd[2]: WARNING: selinux=0 detected — running unconfined`;
                }
            }
            return `systemctl: ${fullCmd.split(' ')[0] || 'status'}: service not found (context: ${C11Config._context})`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #3a1a5c; background:#1a0a2e;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #2a1040; font-family:monospace;">${cell}</td>`;
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
