/* ============================================================
   CTF ARENA — Box B4: The Frozen Core
   OS Troubleshooting | Boot Failure & System Instability
   Config: GRUB, kernel, filesystem, flags, hints, lore
   ============================================================ */

const B4Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Frozen Core',
    subtitle: 'OS Troubleshooting — Boot Failure & System Instability',
    difficulty: 'Intermediate-Advanced',
    accent: '#06b6d4',
    storageKey: 'hexworth_ctf_b4',
    registryId: 'b4-frozen-core',
    trackerKey: 'ctf_b4',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (OS troubleshooting chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Boot Assessment',
            icon: '\uD83D\uDD0D',
            description: 'Observe the boot process. Identify kernel panic messages and GRUB configuration issues.',
            requiredFlags: [],
            mitre: ['T1082', 'T1014'],
            unlocks: ['diagnosis'],
            locked: false
        },
        {
            id: 'diagnosis',
            name: 'Kernel & Config Analysis',
            icon: '\uD83D\uDCCB',
            description: 'Boot into recovery mode. Examine GRUB config, installed kernels, and system logs.',
            requiredFlags: [],
            mitre: ['T1005', 'T1083'],
            unlocks: ['remediation'],
            locked: true
        },
        {
            id: 'remediation',
            name: 'System Repair',
            icon: '\uD83D\uDD27',
            description: 'Fix the GRUB default entry and remove the faulty kernel to stabilize the system.',
            requiredFlags: ['user'],
            mitre: ['T1542.003', 'T1543'],
            unlocks: ['verification'],
            locked: true
        },
        {
            id: 'verification',
            name: 'Verification',
            icon: '\u2705',
            description: 'Verify the system boots cleanly and retrieve the vault status verification token.',
            requiredFlags: ['root'],
            mitre: ['T1497', 'T1082'],
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
                title: 'Check the current kernel and boot logs',
                tip: 'Run: uname -r to see the active kernel. Then check dmesg or journalctl -b for boot errors.',
                trigger: { event: 'command', match: { cmd: 'contains:uname' } }
            },
            {
                title: 'Examine installed kernels',
                tip: 'Run: dpkg -l | grep linux-image to list all installed kernel packages.',
                trigger: { event: 'command', match: { cmd: 'contains:dpkg' } }
            },
            {
                title: 'Inspect GRUB configuration',
                tip: 'Check /etc/default/grub and /boot/grub/grub.cfg to see which kernel is set as default.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:cat' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:grub' } }
                    ]
                }
            },
            {
                title: 'Identify the faulty kernel entry',
                tip: 'GRUB_DEFAULT points to the broken 5.19 kernel. The user flag identifies this misconfiguration.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Fix GRUB and retrieve the vault status',
                tip: 'After fixing the default kernel and running update-grub, check /root/vault_status.txt.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — OS hardening', skill: 'Boot Process Analysis' },
            { flagId: 'user', objective: '1.3', description: 'Given a scenario, explain the importance of change management processes', skill: 'Kernel Update Management' },
            { flagId: 'root', objective: '4.5', description: 'Given a scenario, modify enterprise capabilities to enhance security — Configuration management', skill: 'GRUB Configuration Repair' },
            { flagId: 'root', objective: '4.4', description: 'Given a scenario, analyze data as part of security monitoring activities', skill: 'System Recovery Verification' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'VAULT-CTRL-01 BIOS v5.2.0',
            'Initializing hardware...',
            'Memory Test: 32768 MB OK',
            'Detecting drives... /dev/sda1 (1TB SSD), /dev/sdb1 (2TB HDD)',
            'Network: eth0 link detected',
            'Boot device: /dev/sda1',
            'Loading GRUB...',
            '*** WARNING: Default kernel 5.19.0-45-generic failed to boot ***',
            '*** Falling back to recovery kernel 5.15.0-91-generic ***'
        ],
        grubEntries: [
            'Ubuntu 22.04 LTS (5.19.0-45-generic) [BROKEN]',
            'Ubuntu 22.04 LTS (5.15.0-91-generic)',
            'Ubuntu 22.04 LTS (5.15.0-91-generic, recovery mode)',
            'Advanced options for Ubuntu'
        ],
        loginUser: 'vault_tech'
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
        user: 'vault_tech',
        hostname: 'vault-ctrl-01',
        startDir: '/home/vault_tech',
        welcome: 'Ubuntu 22.04.3 LTS \\n \\l\n\nWelcome to VAULT-CTRL-01 (Recovery Mode)\nBooted with kernel: 5.15.0-91-generic (fallback)\n\n*** ALERT: Default kernel 5.19.0-45-generic causes kernel panic ***\n*** System booted from recovery kernel ***\n*** Environmental systems running on backup power ***\n\nType \'help\' for available commands.\n'
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED FILESYSTEM
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'vault_tech': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: VAULT-CTRL-01 (Console Access)\nObjective: Fix boot failure and system instability\n\nSymptoms:\n  - System panics when booting default kernel (5.19.0-45)\n  - Currently running on fallback kernel (5.15.0-91)\n  - Environmental controls on backup power\n\nInvestigate:\n  1. Check current running kernel: uname -r\n  2. List installed kernels: dpkg -l | grep linux-image\n  3. Examine GRUB config: /etc/default/grub\n  4. Review boot logs: dmesg, journalctl -b\n  5. Fix GRUB default and update\n  6. Verify vault_status.txt after stable boot'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'uname -r\ndmesg | tail\nsudo cat /etc/default/grub\ndpkg -l | grep linux-image\nsudo cat /boot/grub/grub.cfg | grep menuentry\nsudo update-grub'
                                }
                            }
                        }
                    }
                },
                'boot': {
                    type: 'dir',
                    children: {
                        'vmlinuz-5.15.0-91-generic': {
                            type: 'file',
                            content: '[binary: Linux kernel 5.15.0-91-generic — WORKING]'
                        },
                        'vmlinuz-5.19.0-45-generic': {
                            type: 'file',
                            content: '[binary: Linux kernel 5.19.0-45-generic — CORRUPTED]'
                        },
                        'initrd.img-5.15.0-91-generic': {
                            type: 'file',
                            content: '[binary: initramfs for 5.15.0-91-generic]'
                        },
                        'initrd.img-5.19.0-45-generic': {
                            type: 'file',
                            content: '[binary: initramfs for 5.19.0-45-generic — CORRUPTED]'
                        },
                        'grub': {
                            type: 'dir',
                            children: {
                                'grub.cfg': {
                                    type: 'file',
                                    content: '#\n# DO NOT EDIT THIS FILE\n# It is automatically generated by grub-mkconfig using templates\n# from /etc/grub.d and settings from /etc/default/grub\n#\n\nset default="0"\nset timeout=5\n\nmenuentry \'Ubuntu, with Linux 5.19.0-45-generic\' --class ubuntu {\n\trecordpass\n\tlinux /boot/vmlinuz-5.19.0-45-generic root=UUID=a1b2c3d4 ro quiet splash\n\tinitrd /boot/initrd.img-5.19.0-45-generic\n}\n\nmenuentry \'Ubuntu, with Linux 5.15.0-91-generic\' --class ubuntu {\n\trecordpass\n\tlinux /boot/vmlinuz-5.15.0-91-generic root=UUID=a1b2c3d4 ro quiet splash\n\tinitrd /boot/initrd.img-5.15.0-91-generic\n}\n\nmenuentry \'Ubuntu, with Linux 5.15.0-91-generic (recovery mode)\' --class ubuntu {\n\trecordpass\n\tlinux /boot/vmlinuz-5.15.0-91-generic root=UUID=a1b2c3d4 ro recovery nomodeset\n\tinitrd /boot/initrd.img-5.15.0-91-generic\n}\n'
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
                            content: 'vault-ctrl-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nvault_tech:x:1000:1000:Vault Technician:/home/vault_tech:/bin/bash\nenv_ctrl:x:1001:1001:Environmental Control:/home/env_ctrl:/usr/sbin/nologin'
                        },
                        'default': {
                            type: 'dir',
                            children: {
                                'grub': {
                                    type: 'file',
                                    content: '# If you change this file, run \'update-grub\' afterwards\n# Default boot entry (0 = first menuentry)\nGRUB_DEFAULT=0\nGRUB_TIMEOUT_STYLE=menu\nGRUB_TIMEOUT=5\nGRUB_DISTRIBUTOR=`lsb_release -i -s 2> /dev/null || echo Debian`\nGRUB_CMDLINE_LINUX_DEFAULT="quiet splash"\nGRUB_CMDLINE_LINUX=""\n'
                                }
                            }
                        },
                        'fstab': {
                            type: 'file',
                            content: '# /etc/fstab: static file system information.\nUUID=a1b2c3d4  /        ext4  errors=remount-ro  0  1\nUUID=e5f6g7h8  /boot    ext4  defaults           0  2\nUUID=i9j0k1l2  /var     ext4  defaults           0  2\nUUID=m3n4o5p6  none     swap  sw                 0  0\n'
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    children: {
                        'log': {
                            type: 'dir',
                            children: {
                                'kern.log': {
                                    type: 'file',
                                    content: 'Mar 18 01:15:02 vault-ctrl-01 kernel: [    0.000000] Linux version 5.19.0-45-generic (buildd@lcy02-amd64-051)\nMar 18 01:15:02 vault-ctrl-01 kernel: [    0.458123] BUG: unable to handle kernel paging request at ffffea0004200000\nMar 18 01:15:02 vault-ctrl-01 kernel: [    0.458456] Oops: 0000 [#1] SMP NOPTI\nMar 18 01:15:02 vault-ctrl-01 kernel: [    0.458789] CPU: 0 PID: 1 Comm: swapper/0 Not tainted 5.19.0-45-generic\nMar 18 01:15:02 vault-ctrl-01 kernel: [    0.459012] RIP: 0010:start_kernel+0x4a2/0x5b0\nMar 18 01:15:02 vault-ctrl-01 kernel: [    0.459345] Kernel panic - not syncing: Fatal exception in interrupt\nMar 18 01:15:02 vault-ctrl-01 kernel: [    0.459678] ---[ end Kernel panic - not syncing: Fatal exception in interrupt ]---\nMar 18 01:20:15 vault-ctrl-01 kernel: [    0.000000] Linux version 5.15.0-91-generic (buildd@lcy02-amd64-007)\nMar 18 01:20:15 vault-ctrl-01 kernel: [    2.124567] EXT4-fs (sda1): mounted filesystem with ordered data mode. Opts: (null)\nMar 18 01:20:16 vault-ctrl-01 kernel: [    3.456789] systemd[1]: Detected architecture x86-64.'
                                },
                                'syslog': {
                                    type: 'file',
                                    content: 'Mar 18 01:15:02 vault-ctrl-01 kernel: Kernel panic - not syncing: Fatal exception in interrupt\nMar 18 01:15:02 vault-ctrl-01 kernel: ---[ end Kernel panic ]---\nMar 18 01:20:15 vault-ctrl-01 systemd[1]: Starting system in recovery mode...\nMar 18 01:20:16 vault-ctrl-01 systemd[1]: Reached target Basic System.\nMar 18 01:20:17 vault-ctrl-01 systemd[1]: Started environmental control subsystem.\nMar 18 01:20:17 vault-ctrl-01 env_ctrl[1245]: WARNING: Running on backup power. Primary kernel failed.\nMar 18 01:20:18 vault-ctrl-01 env_ctrl[1245]: Temperature: 2.1C (nominal). Pressure: 1013 hPa. O2: 20.9%.'
                                },
                                'dpkg.log': {
                                    type: 'file',
                                    content: '2026-03-17 23:45:01 install linux-image-5.19.0-45-generic:amd64 5.19.0-45.46\n2026-03-17 23:45:15 status installed linux-image-5.19.0-45-generic:amd64 5.19.0-45.46\n2026-03-17 23:45:16 trigproc linux-image-5.19.0-45-generic:amd64 -- configure\n2026-03-17 23:45:20 status installed linux-image-5.19.0-45-generic:amd64 5.19.0-45.46\n2026-03-17 23:50:01 upgrade grub-common:amd64 2.06-2ubuntu14.1 2.06-2ubuntu14.2\n2026-03-17 23:50:05 status installed grub-common:amd64 2.06-2ubuntu14.2\n2026-03-17 23:50:10 trigproc grub-pc:amd64 -- configure'
                                },
                                'apt': {
                                    type: 'dir',
                                    children: {
                                        'history.log': {
                                            type: 'file',
                                            content: 'Start-Date: 2026-03-17  23:45:01\nCommandline: apt install linux-image-5.19.0-45-generic\nInstall: linux-image-5.19.0-45-generic:amd64 (5.19.0-45.46)\nEnd-Date: 2026-03-17  23:45:20\n\nStart-Date: 2026-03-17  23:50:01\nCommandline: apt upgrade\nUpgrade: grub-common:amd64 (2.06-2ubuntu14.1, 2.06-2ubuntu14.2)\nEnd-Date: 2026-03-17  23:50:10'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'root': {
                    type: 'dir',
                    children: {
                        'vault_status.txt': {
                            type: 'file',
                            content: 'ARCTIC VAULT ENVIRONMENTAL CONTROL SYSTEM\n==========================================\nStatus: OPERATIONAL\nKernel: 5.15.0-91-generic (stable)\nTemperature: 2.1C (nominal)\nPressure: 1013 hPa (nominal)\nOxygen: 20.9% (nominal)\n\nVERIFICATION TOKEN: {{FLAG:user}}\n\nAll environmental systems nominal.\nVault integrity confirmed.\n'
                        },
                        '.bash_history': {
                            type: 'file',
                            content: 'apt install linux-image-5.19.0-45-generic\nupdate-grub\nreboot'
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {}
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'bin': {
                            type: 'dir',
                            children: {}
                        }
                    }
                }
            }
        }
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
        timeBonusThreshold: 1800
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Run uname -r to confirm you are on the fallback kernel (5.15.0-91). Then check dmesg for the kernel panic from the 5.19 kernel.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Check /etc/default/grub — GRUB_DEFAULT=0 points to the first menuentry, which is the broken 5.19.0-45-generic kernel. List kernels with dpkg -l | grep linux-image.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The root cause is GRUB_DEFAULT=0 pointing to the corrupted 5.19.0-45-generic kernel. The user flag is: {{FLAG:user}}',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Fix: Edit /etc/default/grub, set GRUB_DEFAULT=1 (or "Ubuntu, with Linux 5.15.0-91-generic"), run sudo update-grub. Then: sudo cat /root/vault_status.txt',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'VAULT-CTRL-01, the central processing unit of the Arctic Vault, has become alarmingly unstable. The system freezes, crashes, and fails to boot — displaying kernel panic messages during startup. An inexperienced technician\'s recent kernel update is strongly suspected. Your mission: diagnose the boot failure, identify the faulty kernel, and restore operational integrity before the environmental systems fail.',
        scenario: 'A well-meaning but inexperienced vault technician decided to update the kernel on the critical environmental control system without testing. They installed linux-image-5.19.0-45-generic, which has a known corruption issue. The system\'s GRUB configuration automatically set this new kernel as the default boot entry. Now every boot attempt panics, and the system can only run from the older fallback kernel via manual GRUB menu selection.',
        outro: 'The Frozen Core is thawed. VAULT-CTRL-01 now boots reliably into the stable 5.15.0-91 kernel, and the Arctic Vault\'s environmental systems are fully operational. Temperature, pressure, and oxygen levels are nominal. The corrupted kernel has been identified and the GRUB configuration corrected.',
        ecer: {
            executive: 'No testing environment for kernel updates on critical infrastructure',
            culture: 'Technician applied untested kernel update to production environmental control system',
            employee: 'Junior tech installed kernel without rollback plan or maintenance window',
            regulatory: 'No change management policy requiring tested kernels before production deployment'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB SIMULATION (Vault Status Panel)
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://vault-ctrl-01:8080/',

        pages: {
            '/': {
                title: 'Arctic Vault Control Panel',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #444;">
                        <h1 style="color:#06b6d4; font-size:1.6rem; margin-bottom:4px;">Arctic Vault Control Panel</h1>
                        <div style="color:#888; font-size:0.8rem;">VAULT-CTRL-01 Environmental Systems</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto;">
                        <div style="background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.3); border-radius:8px; padding:20px; margin-bottom:20px;">
                            <div style="color:#f59e0b; font-size:1.1rem; font-weight:bold; margin-bottom:8px;">BOOT FAILURE DETECTED</div>
                            <div style="color:#888; font-size:0.85rem;">Default kernel 5.19.0-45-generic: PANIC</div>
                            <div style="color:#888; font-size:0.85rem;">Running on fallback: 5.15.0-91-generic</div>
                            <div style="color:#888; font-size:0.85rem;">Status: DEGRADED (backup power mode)</div>
                        </div>

                        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:20px;">
                            <div style="background:rgba(255,255,255,0.05); border:1px solid #333; border-radius:8px; padding:16px; text-align:center;">
                                <div style="color:#06b6d4; font-size:2rem; font-weight:bold;">2.1C</div>
                                <div style="color:#888; font-size:0.75rem;">TEMPERATURE</div>
                                <div style="color:#22c55e; font-size:0.7rem;">NOMINAL</div>
                            </div>
                            <div style="background:rgba(255,255,255,0.05); border:1px solid #333; border-radius:8px; padding:16px; text-align:center;">
                                <div style="color:#06b6d4; font-size:2rem; font-weight:bold;">1013</div>
                                <div style="color:#888; font-size:0.75rem;">PRESSURE (hPa)</div>
                                <div style="color:#22c55e; font-size:0.7rem;">NOMINAL</div>
                            </div>
                            <div style="background:rgba(255,255,255,0.05); border:1px solid #333; border-radius:8px; padding:16px; text-align:center;">
                                <div style="color:#06b6d4; font-size:2rem; font-weight:bold;">20.9%</div>
                                <div style="color:#888; font-size:0.75rem;">OXYGEN</div>
                                <div style="color:#22c55e; font-size:0.7rem;">NOMINAL</div>
                            </div>
                            <div style="background:rgba(255,255,255,0.05); border:1px solid #333; border-radius:8px; padding:16px; text-align:center;">
                                <div style="color:#f59e0b; font-size:2rem; font-weight:bold;">BACKUP</div>
                                <div style="color:#888; font-size:0.75rem;">POWER SOURCE</div>
                                <div style="color:#f59e0b; font-size:0.7rem;">DEGRADED</div>
                            </div>
                        </div>
                    </div>
                `
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {
        'nmap': function(args) {
            if (args.length === 0) return 'Usage: nmap [options] <target>';
            const target = args.find(a => !a.startsWith('-')) || '';
            if (target === 'localhost' || target === '127.0.0.1' || target === 'vault-ctrl-01') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for ${target}
Host is up (0.00018s latency).
Not shown: 998 closed tcp ports

PORT     STATE SERVICE
22/tcp   open  ssh
8080/tcp open  http

Nmap done: 1 IP address (1 host up) scanned in 2.14 seconds`;
            }
            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'uname': function(args) {
            if (args.includes('-a')) return 'Linux vault-ctrl-01 5.15.0-91-generic #101-Ubuntu SMP Tue Nov 14 13:30:08 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux';
            if (args.includes('-r')) return '5.15.0-91-generic';
            return 'Linux';
        },

        'dmesg': function(args) {
            const grepPattern = args.includes('|') ? args[args.indexOf('|') + 2] : '';
            const output = `[    0.000000] Linux version 5.15.0-91-generic (buildd@lcy02-amd64-007) (gcc-11 (Ubuntu 11.4.0-1ubuntu1~22.04) 11.4.0)
[    0.000001] Command line: BOOT_IMAGE=/boot/vmlinuz-5.15.0-91-generic root=UUID=a1b2c3d4 ro quiet splash
[    0.458123] ACPI: Core revision 20210730
[    1.234567] EXT4-fs (sda1): mounted filesystem with ordered data mode. Opts: (null)
[    2.124567] systemd[1]: Detected architecture x86-64.
[    2.234567] systemd[1]: Set hostname to <vault-ctrl-01>.
[    3.456789] env_ctrl: Environmental control subsystem initialized
[    3.567890] env_ctrl: Temperature sensor OK (2.1C)
[    3.678901] env_ctrl: Pressure sensor OK (1013 hPa)
[    3.789012] env_ctrl: Oxygen sensor OK (20.9%)
[    4.000000] audit: type=1400 audit(1710723616.000:1): avc:  denied  { read } for  pid=1245

Note: Previous boot attempt with 5.19.0-45-generic kernel resulted in:
  [    0.458123] BUG: unable to handle kernel paging request at ffffea0004200000
  [    0.458456] Kernel panic - not syncing: Fatal exception in interrupt`;

            if (args.includes('tail') || args.includes('-T')) {
                return output.split('\n').slice(-6).join('\n');
            }
            return output;
        },

        'journalctl': function(args) {
            if (args.includes('-b') && (args.includes('-1') || args.includes('--boot=-1'))) {
                return `-- No journal data for previous boot (kernel panic prevented logging) --
-- The system panicked during kernel initialization --
-- Kernel: 5.19.0-45-generic --
-- Error: BUG: unable to handle kernel paging request --
-- Result: Kernel panic - not syncing: Fatal exception in interrupt --`;
            }
            if (args.includes('-b')) {
                return `-- Journal begins at Tue 2026-03-18 01:20:15 UTC. --
Mar 18 01:20:15 vault-ctrl-01 kernel: Linux version 5.15.0-91-generic
Mar 18 01:20:15 vault-ctrl-01 systemd[1]: Detected architecture x86-64.
Mar 18 01:20:16 vault-ctrl-01 systemd[1]: Set hostname to <vault-ctrl-01>.
Mar 18 01:20:17 vault-ctrl-01 systemd[1]: Reached target Basic System.
Mar 18 01:20:17 vault-ctrl-01 env_ctrl[1245]: Environmental control starting...
Mar 18 01:20:17 vault-ctrl-01 env_ctrl[1245]: WARNING: Running on backup power.
Mar 18 01:20:18 vault-ctrl-01 env_ctrl[1245]: Temperature: 2.1C. Pressure: 1013 hPa. O2: 20.9%
Mar 18 01:20:18 vault-ctrl-01 env_ctrl[1245]: All environmental readings nominal.`;
            }
            if (args.includes('-k') || args.includes('--dmesg')) {
                return B4Config.commands.dmesg([]);
            }
            return 'Usage: journalctl [OPTIONS]\n  -b [BOOT]  Show logs from boot\n  -k         Show kernel messages\n  -x         Add explanatory text';
        },

        'dpkg': function(args) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('linux-image') || fullCmd.includes('linux-kernel')) {
                return `ii  linux-image-5.15.0-91-generic  5.15.0-91.101   amd64  Signed kernel image generic
ii  linux-image-5.19.0-45-generic  5.19.0-45.46   amd64  Signed kernel image generic
ii  linux-image-generic            5.19.0.45.46   amd64  Generic Linux kernel image`;
            }
            if (fullCmd.includes('grub') || fullCmd.includes('linux')) {
                return `ii  grub-common    2.06-2ubuntu14.2  amd64  GRand Unified Bootloader (common files)
ii  grub-pc        2.06-2ubuntu14.2  amd64  GRand Unified Bootloader (PC/BIOS version)
ii  linux-image-5.15.0-91-generic  5.15.0-91.101  amd64  Signed kernel image generic
ii  linux-image-5.19.0-45-generic  5.19.0-45.46   amd64  Signed kernel image generic`;
            }
            if (args.includes('-l') || args.includes('--list')) {
                return 'Listing... (use a filter pattern, e.g., dpkg -l | grep linux-image)';
            }
            return 'Usage: dpkg [options] command';
        },

        'update-grub': function(args, term, engine) {
            if (engine) engine._b4GrubFixed = true;
            return `Sourcing file \`/etc/default/grub\'
Sourcing file \`/etc/default/grub.d/init-select.cfg\'
Generating grub configuration file ...
Found linux image: /boot/vmlinuz-5.19.0-45-generic
Found initrd image: /boot/initrd.img-5.19.0-45-generic
Found linux image: /boot/vmlinuz-5.15.0-91-generic
Found initrd image: /boot/initrd.img-5.15.0-91-generic
done`;
        },

        'systemctl': function(args) {
            if (args.length === 0) return 'Usage: systemctl [command] [unit]';
            const subcmd = args[0];
            const unit = args[1] || '';

            if (subcmd === 'status' && unit.includes('env')) {
                return `\u25CF env_ctrl.service - Environmental Control Subsystem
     Loaded: loaded (/etc/systemd/system/env_ctrl.service; enabled)
     Active: active (running) since Tue 2026-03-18 01:20:17 UTC; 1h ago
   Main PID: 1245 (env_ctrl)
     Memory: 45.2M
     CGroup: /system.slice/env_ctrl.service
             \u2514\u25001245 /usr/bin/env_ctrl --backup-mode`;
            }

            if (subcmd === 'list-units' || subcmd === 'list-unit-files') {
                return `UNIT FILE                    STATE     VENDOR PRESET
cron.service                 enabled   enabled
env_ctrl.service             enabled   enabled
networking.service           enabled   enabled
ssh.service                  enabled   enabled
systemd-journald.service     static    -

5 unit files listed.`;
            }

            return `Unit ${unit || 'unknown'} could not be found.`;
        },

        'sudo': function(args, term, engine) {
            if (args.length === 0) return 'usage: sudo [-h] [-u user] command';
            const fullCmd = args.join(' ');

            if (args[0] === 'update-grub') return B4Config.commands['update-grub'](args.slice(1), term, engine);
            if (args[0] === 'systemctl') return B4Config.commands.systemctl(args.slice(1), term, engine);

            if (fullCmd.includes('cat /root/vault_status.txt') || fullCmd.includes('cat /root/vault')) {
                return `ARCTIC VAULT ENVIRONMENTAL CONTROL SYSTEM
==========================================
Status: OPERATIONAL
Kernel: 5.15.0-91-generic (stable)
Temperature: 2.1C (nominal)
Pressure: 1013 hPa (nominal)
Oxygen: 20.9% (nominal)

VERIFICATION TOKEN: {{FLAG:user}}

All environmental systems nominal.
Vault integrity confirmed.`;
            }

            if (fullCmd.includes('cat /etc/default/grub')) {
                return `# If you change this file, run 'update-grub' afterwards
# Default boot entry (0 = first menuentry)
GRUB_DEFAULT=0
GRUB_TIMEOUT_STYLE=menu
GRUB_TIMEOUT=5
GRUB_DISTRIBUTOR=\`lsb_release -i -s 2> /dev/null || echo Debian\`
GRUB_CMDLINE_LINUX_DEFAULT="quiet splash"
GRUB_CMDLINE_LINUX=""`;
            }

            if (fullCmd.includes('cat /boot/grub/grub.cfg')) {
                return `#
# DO NOT EDIT THIS FILE
# Generated by grub-mkconfig
#
set default="0"
set timeout=5

menuentry 'Ubuntu, with Linux 5.19.0-45-generic' --class ubuntu {
    linux /boot/vmlinuz-5.19.0-45-generic root=UUID=a1b2c3d4 ro quiet splash
    initrd /boot/initrd.img-5.19.0-45-generic
}

menuentry 'Ubuntu, with Linux 5.15.0-91-generic' --class ubuntu {
    linux /boot/vmlinuz-5.15.0-91-generic root=UUID=a1b2c3d4 ro quiet splash
    initrd /boot/initrd.img-5.15.0-91-generic
}

menuentry 'Ubuntu, with Linux 5.15.0-91-generic (recovery mode)' --class ubuntu {
    linux /boot/vmlinuz-5.15.0-91-generic root=UUID=a1b2c3d4 ro recovery nomodeset
    initrd /boot/initrd.img-5.15.0-91-generic
}`;
            }

            if (fullCmd.includes('grub-mkconfig')) {
                return B4Config.commands['update-grub']([], term, engine);
            }

            if (fullCmd.includes('apt remove') && fullCmd.includes('5.19')) {
                return `Reading package lists... Done
Building dependency tree... Done
The following packages will be REMOVED:
  linux-image-5.19.0-45-generic
0 upgraded, 0 newly installed, 1 to remove.
Removing linux-image-5.19.0-45-generic (5.19.0-45.46) ...
update-initramfs: Deleting /boot/initrd.img-5.19.0-45-generic
Generating grub configuration file ...
Found linux image: /boot/vmlinuz-5.15.0-91-generic
done`;
            }

            if (fullCmd.includes('fsck')) {
                return 'fsck from util-linux 2.37.2\ne2fsck 1.46.5 (30-Dec-2021)\n/dev/sda1: clean, 184235/6553600 files, 3287456/26214400 blocks';
            }

            if (fullCmd.includes('cat /var/log/kern.log')) {
                return B4Config.filesystem['/'].children.var.children.log.children['kern.log'].content;
            }

            if (fullCmd.includes('cat /var/log/dpkg.log')) {
                return B4Config.filesystem['/'].children.var.children.log.children['dpkg.log'].content;
            }

            if (fullCmd.includes('cat /var/log/apt/history.log')) {
                return B4Config.filesystem['/'].children.var.children.log.children.apt.children['history.log'].content;
            }

            if (args[0] === 'journalctl') return B4Config.commands.journalctl(args.slice(1));

            return `[sudo] executing: ${fullCmd}`;
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === 'localhost' || target === '127.0.0.1') {
                return `PING ${target} 56(84) bytes of data.\n64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.018 ms\n\n--- ${target} ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'traceroute': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: traceroute destination';
            return `traceroute to ${target}, 30 hops max\n 1  * * *`;
        },

        'netstat': function() {
            return `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      685/sshd
tcp        0      0 0.0.0.0:8080            0.0.0.0:*               LISTEN      1300/python3`;
        },

        'ss': function() {
            return `Netid  State   Recv-Q  Send-Q   Local Address:Port    Peer Address:Port  Process
tcp    LISTEN  0       128      0.0.0.0:22           0.0.0.0:*          users:(("sshd",pid=685,fd=3))
tcp    LISTEN  0       5        0.0.0.0:8080         0.0.0.0:*          users:(("python3",pid=1300,fd=4))`;
        },

        'df': function() {
            return `Filesystem     1K-blocks     Used Available Use% Mounted on
/dev/sda1     1048576000 314572800 733999104  30% /
/dev/sdb1     2097152000 524288000 1572864000 25% /data
tmpfs           16384000     2048  16381952   1% /dev/shm`;
        },

        'free': function() {
            return `               total        used        free      shared  buff/cache   available
Mem:        32768000     4096000    24576000       16384     4096000    27648000
Swap:        8192000           0     8192000`;
        },

        'ps': function(args) {
            if (args.includes('aux') || args.includes('-ef')) {
                return `USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.0 169348  8192 ?        Ss   01:20   0:02 /sbin/init
root         685  0.0  0.0  15420  5120 ?        Ss   01:20   0:01 sshd: /usr/sbin/sshd -D
root        1245  0.2  0.1 131072  45056 ?       Ss   01:20   0:15 /usr/bin/env_ctrl --backup-mode
root        1300  0.0  0.0  24576  8192 ?        Ss   01:20   0:02 /usr/bin/python3 /opt/vault_panel/app.py
vault_t+    2001  0.0  0.0  15820  7424 ?        Ss   01:25   0:00 sshd: vault_tech
vault_t+    2050  0.0  0.0   9344  3584 pts/0    R+   01:25   0:00 ps aux`;
            }
            return 'Usage: ps [options]';
        },

        'ip': function(args) {
            if (args.length === 0 || args[0] === 'a' || args[0] === 'addr') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n    inet 10.0.5.10/24 brd 10.0.5.255 scope global eth0`;
            }
            if (args[0] === 'route' || args[0] === 'r') {
                return `default via 10.0.5.1 dev eth0 proto static\n10.0.5.0/24 dev eth0 proto kernel scope link src 10.0.5.10`;
            }
            return 'Usage: ip [ OPTIONS ] OBJECT { COMMAND | help }';
        },

        'grep': function(args) {
            if (args.length < 2) return 'Usage: grep [options] PATTERN [FILE...]';
            const pattern = args.find(a => !a.startsWith('-')) || '';
            if (pattern.includes('linux-image')) {
                return B4Config.commands.dpkg(['-l', 'linux-image']);
            }
            if (pattern.toLowerCase().includes('panic') || pattern.toLowerCase().includes('bug')) {
                return `Mar 18 01:15:02 vault-ctrl-01 kernel: [    0.458123] BUG: unable to handle kernel paging request at ffffea0004200000\nMar 18 01:15:02 vault-ctrl-01 kernel: [    0.459345] Kernel panic - not syncing: Fatal exception in interrupt`;
            }
            if (pattern.toLowerCase().includes('grub_default')) {
                return 'GRUB_DEFAULT=0';
            }
            if (pattern.toLowerCase().includes('menuentry')) {
                return `menuentry 'Ubuntu, with Linux 5.19.0-45-generic' --class ubuntu {\nmenuentry 'Ubuntu, with Linux 5.15.0-91-generic' --class ubuntu {\nmenuentry 'Ubuntu, with Linux 5.15.0-91-generic (recovery mode)' --class ubuntu {`;
            }
            return `grep: No matches found for '${pattern}'`;
        },

        'chmod': function(args) { return args.length < 2 ? 'Usage: chmod [mode] [file]' : ''; },
        'chown': function(args) { return args.length < 2 ? 'Usage: chown [owner:group] [file]' : ''; },

        'lsblk': function() {
            return `NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
sda      8:0    0     1T  0 disk
\u251C\u2500sda1   8:1    0   950G  0 part /
\u2514\u2500sda2   8:2    0    50G  0 part [SWAP]
sdb      8:16   0     2T  0 disk
\u2514\u2500sdb1   8:17   0     2T  0 part /data`;
        },

        'mount': function() {
            return `/dev/sda1 on / type ext4 (rw,relatime,errors=remount-ro)
/dev/sdb1 on /data type ext4 (rw,relatime)
tmpfs on /dev/shm type tmpfs (rw,nosuid,nodev)
tmpfs on /run type tmpfs (rw,nosuid,nodev,size=1638400k,mode=755)`;
        },

        'whoami': function() { return 'vault_tech'; },
        'hostname': function() { return 'vault-ctrl-01'; },
        'id': function() { return 'uid=1000(vault_tech) gid=1000(vault_tech) groups=1000(vault_tech),27(sudo)'; },
        'uptime': function() { return ' 01:25:22 up 0:05,  1 user,  load average: 0.22, 0.35, 0.28'; },
        'date': function() { return 'Tue Mar 18 01:25:22 UTC 2026'; },
        'pwd': function(args, term) { return term ? term.cwd : '/home/vault_tech'; },

        'pip3': function() { return 'pip3: command not found'; },
        'pip': function() { return 'pip: command not found'; },
        'apt': function() { return 'E: Could not open lock file - are you root?'; },

        'tail': function(args) {
            const file = args[args.length - 1] || '';
            if (file.includes('kern.log')) {
                return B4Config.filesystem['/'].children.var.children.log.children['kern.log'].content.split('\n').slice(-5).join('\n');
            }
            if (file.includes('syslog')) {
                return B4Config.filesystem['/'].children.var.children.log.children.syslog.content.split('\n').slice(-5).join('\n');
            }
            return `tail: cannot open '${file}': No such file or directory`;
        },

        'clear': function() { return '\x1Bclear'; },
        'exit': function() { return 'logout\nConnection to vault-ctrl-01 closed.'; },
        'less': function() { return 'less: interactive pager not supported. Use cat instead.'; },
        'vim': function() { return 'vim: interactive editor not supported. Use cat to view files.'; },
        'nano': function() { return 'nano: interactive editor not supported. Use cat to view files.'; },
        'man': function(args) { return args[0] ? `No manual entry for ${args[0]}` : 'What manual page do you want?'; },
        'find': function(args) {
            if (args.some(a => a.includes('vmlinuz') || a.includes('boot'))) {
                return `/boot/vmlinuz-5.15.0-91-generic\n/boot/vmlinuz-5.19.0-45-generic\n/boot/initrd.img-5.15.0-91-generic\n/boot/initrd.img-5.19.0-45-generic\n/boot/grub/grub.cfg`;
            }
            return `find: '${args[0] || '/'}': Permission denied`;
        }
    }
};
