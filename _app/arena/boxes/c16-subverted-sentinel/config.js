/* ============================================================
   CTF ARENA — Box C16: The Subverted Sentinel
   Multi-Stage Campaign | Rootkit Detection, Analysis, Persistence Neutralization
   Config: kernel filesystem, memory forensics, LKM analysis, flags, hints, lore
   ============================================================ */

const C16Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Subverted Sentinel',
    subtitle: 'Multi-Stage Campaign — Advanced Persistence & Rootkit Detection/Analysis',
    difficulty: 'Expert',
    accent: '#8e44ad',
    storageKey: 'hexworth_ctf_c16',
    registryId: 'c16-subverted-sentinel',
    trackerKey: 'ctf_c16',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Initial Recon & Anomaly Detection',
            icon: '\uD83D\uDD0D',
            description: 'SSH into NODE-VIGIL-01. Run standard enumeration tools. Confirm that ps, lsmod, and netstat are producing inconsistent results — the hallmarks of a rootkit.',
            requiredFlags: [],
            mitre: ['T1082', 'T1057', 'T1049'],
            unlocks: ['detection'],
            locked: false
        },
        {
            id: 'detection',
            name: 'Rootkit Detection',
            icon: '\uD83D\uDC41\uFE0F',
            description: 'Bypass user-mode hiding. Use /proc/kallsyms, dmesg, and a provided memory dump with Volatility 3 to confirm "The Whisperer" is present and identify its hooking technique.',
            requiredFlags: [],
            mitre: ['T1014', 'T1622', 'T1543.003'],
            unlocks: ['analysis'],
            locked: true
        },
        {
            id: 'analysis',
            name: 'Rootkit Analysis & Config Extraction',
            icon: '\uD83D\uDD2C',
            description: 'Dump the LKM from kernel memory. Load it into a disassembler. Identify the hidden C2 server and the secret command phrase hardcoded inside the module.',
            requiredFlags: ['detection'],
            mitre: ['T1059.004', 'T1071.001', 'T1083'],
            unlocks: ['persistence'],
            locked: true
        },
        {
            id: 'persistence',
            name: 'Neutralize Persistence',
            icon: '\uD83D\uDEE1\uFE0F',
            description: 'Find how "The Whisperer" survives reboots. Blacklist the module, patch initramfs, and verify it no longer loads. Disable all associated services.',
            requiredFlags: ['config'],
            mitre: ['T1547.006', 'T1542.003', 'T1601'],
            unlocks: ['recovery'],
            locked: true
        },
        {
            id: 'recovery',
            name: 'Recover Vigilance Protocol Bypass',
            icon: '\uD83C\uDFC6',
            description: 'Extract the final hardcoded master control sequence from the disassembled LKM — the "Vigilance Protocol Bypass." This is the root flag.',
            requiredFlags: ['persistence'],
            mitre: ['T1005', 'T1119'],
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
                title: 'Begin initial enumeration on NODE-VIGIL-01',
                tip: 'SSH in, then run: ps aux, lsmod, netstat -tulnp. Notice anything missing that should be there.',
                trigger: { event: 'command', match: { cmd: 'contains:ssh' } }
            },
            {
                title: 'Compare /proc/kallsyms against System.map',
                tip: 'Run: cat /proc/kallsyms | grep sys_call_table — and compare the address shown with /boot/System.map. A mismatch is your detection artifact.',
                trigger: { event: 'command', match: { cmd: 'contains:kallsyms' } }
            },
            {
                title: 'Run Volatility against the memory dump',
                tip: 'The memory dump is at /root/vigil01.lime. Run: vol -f /root/vigil01.lime linux.check_syscall to detect hooked syscall table entries.',
                trigger: { event: 'flag_correct', match: { flagId: 'detection' } }
            },
            {
                title: 'Dump the LKM and reverse engineer it',
                tip: 'Use dd to extract the module from /dev/kmem at the address returned by Volatility modscan. Load it into Ghidra. Look for hardcoded strings.',
                trigger: { event: 'flag_correct', match: { flagId: 'config' } }
            },
            {
                title: 'Kill persistence and recover the final flag',
                tip: 'Add the module to /etc/modprobe.d/blacklist.conf, update initramfs, disable the masqueraded systemd service, and recover the VPB string from the binary.',
                trigger: { event: 'flag_correct', match: { flagId: 'persistence' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'detection', objective: '2.4', description: 'Given a scenario, analyze indicators associated with network attacks — Detecting hooked syscalls and hidden kernel modules', skill: 'Kernel Rootkit Detection via /proc & Memory Analysis' },
            { flagId: 'config',    objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Extracting C2 config from LKM reverse engineering', skill: 'LKM Reverse Engineering & Hardcoded Config Extraction' },
            { flagId: 'persistence', objective: '3.3', description: 'Given a scenario, implement appropriate endpoint security controls — Disabling boot-time LKM persistence via modprobe blacklist', skill: 'Rootkit Persistence Identification & Remediation' },
            { flagId: 'root',      objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — Recovering hidden secrets from kernel modules', skill: 'Full Rootkit Campaign Completion' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Ubuntu LTS BIOS v5.1.0',
            'Initializing hardware...',
            'Memory Test: 32768 MB OK',
            'Detecting drives... /dev/sda1 (1TB NVMe)',
            'PXE-E61: Media test failure, check cable',
            'PXE-M0F: Exiting PXE ROM.',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Ubuntu 20.04.6 LTS (Linux 5.4.0-vigilmod-amd64)',
            'Ubuntu 20.04.6 LTS (recovery mode)',
            'Advanced options for Ubuntu'
        ],
        loginUser: 'analyst'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal',      icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'notes',    label: 'Case Notes',    icon: '\uD83D\uDCDD',       app: 'notes' },
            { id: 'hints',    label: 'Hints',         icon: '\uD83D\uDCA1',       app: 'hints' },
            { id: 'flags',    label: 'Submit Flag',   icon: '\uD83D\uDEA9',       app: 'flags' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'analyst',
        hostname: 'NODE-VIGIL-01',
        startDir: '/home/analyst',
        welcome: 'Ubuntu 20.04.6 LTS — NODE-VIGIL-01 (Linux 5.4.0-vigilmod-amd64)\n\nLast login: Fri Mar 20 03:47:22 2026 from 10.0.0.5\n\nWARNING: System integrity check failed at boot. See /var/log/kern.log.\nType \'help\' for available commands.\nTarget system: NODE-VIGIL-01 (compromised monitoring node)\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (investigation state)
    // ═══════════════════════════════════════════════════════

    _context: 'analyst',        // 'analyst' | 'root' | 'vol'
    _rootEscalated: false,
    _lkmDumped: false,
    _lkmAnalyzed: false,
    _persistenceFound: false,
    _blacklistApplied: false,
    _initramfsUpdated: false,
    _serviceDisabled: false,

    _switchContext(ctx, term) {
        C16Config._context = ctx;
        if (term && term.config) {
            var prompt = C16Config._getPrompt();
            if (prompt) {
                term.config.user = prompt.split('@')[0] || 'analyst';
                term._customPrompt = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (C16Config._context) {
            case 'root': return 'root@NODE-VIGIL-01:~# ';
            case 'vol':  return 'vol3> ';
            default:     return null;  // use default analyst prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'detection',   points: 150 },
        { id: 'config',      points: 200 },
        { id: 'persistence', points: 150 },
        { id: 'root',        points: 300 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2500,
        maxScore: 800,
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
            text: 'The rootkit hides its process and module from ps and lsmod. Compare the sys_call_table addresses: run "cat /proc/kallsyms | grep sys_call_table" and then check "/boot/System.map-$(uname -r) | grep sys_call_table". A different address means the table was patched.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The memory dump is at /root/vigil01.lime. Run: vol -f /root/vigil01.lime linux.check_syscall — this will flag any syscall table entries pointing outside the expected kernel range. Run linux_modscan to find the hidden LKM not visible in lsmod.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Once you have the LKM address from Volatility modscan output, dump it with: dd if=/dev/kmem bs=4096 skip=<page_addr> count=256 of=/tmp/whisperer.ko — then load whisperer.ko into Ghidra. Search the Defined Strings window for IPs and keywords.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'The rootkit loads via a masqueraded systemd service named "systemd-udevmon.service" (note the extra "m"). The actual LKM is in /lib/modules/5.4.0-vigilmod-amd64/kernel/drivers/misc/. Blacklist it, update initramfs with update-initramfs -u, then disable the service with systemctl disable.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'NODE-VIGIL-01 is a critical monitoring node in Hexworth Prime\'s internal network, responsible for collecting telemetry, correlating events, and alerting on anomalies. For three weeks, operators have noticed ghost data: process counts that fluctuate without explanation, network connections that vanish from netstat the moment they are checked, and a kernel log that writes cryptic entries before redacting itself. Traditional AV and EDR return clean. The node appears healthy — but it is not. A highly sophisticated kernel-level rootkit, internally code-named "The Whisperer," has been embedded. Its design philosophy is elegant and ruthless: if you cannot see it, you cannot stop it.',
        scenario: 'The Whisperer is a Loadable Kernel Module written in C, compiled against the 5.4.0-vigilmod-amd64 kernel. It hooks three syscalls: sys_getdents64 (hides its own files from directory listings), sys_kill (intercepts kill signals to receive out-of-band commands), and sys_tcp4_seq_show (removes its C2 connection from /proc/net/tcp). It also uses Direct Kernel Object Manipulation (DKOM) to unlink itself from the module list, making lsmod blind. Its C2 server communicates via HTTPS over a non-standard port. Its persistence mechanism is a masqueraded systemd service that runs insmod at boot — the service name is one character off from a legitimate udev helper, designed to fool administrators doing a visual scan of service lists.',
        outro: 'The Whisperer has been exposed, analyzed, and neutralized. Its C2 channel is severed, its files purged, its persistence stripped from the boot chain. NODE-VIGIL-01 is clean. The "Vigilance Protocol Bypass" — the master control sequence that let the rootkit\'s operators override any of its hiding behaviors — is now in your hands. The sentinel watches again.',
        ecer: {
            executive: 'NODE-VIGIL-01 was treated as a trusted internal asset with no external threat model — no kernel integrity monitoring, no measured boot, no module signing enforced',
            culture: 'Security operations team focused entirely on perimeter and endpoint AV; kernel-level defense was considered out of scope for the ops team budget cycle',
            employee: 'Module signing enforcement disabled in GRUB (module.sig_enforce=0); /dev/kmem accessible to root; no Secure Boot; initramfs not integrity-checked post-modification',
            regulatory: 'Monitoring node handles PII-adjacent telemetry; absence of kernel integrity monitoring violates internal compliance baseline KIM-3; no third-party red team engagement in 18 months'
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED MEMORY DUMP DATA (Volatility output table)
    // ═══════════════════════════════════════════════════════

    _volData: {
        check_syscall: [
            { table: 'sys_call_table', index: 78,  sym: 'sys_getdents64',    expected: '0xffffffff81234a10', actual: '0xffffffffc0841380', status: 'HOOKED' },
            { table: 'sys_call_table', index: 62,  sym: 'sys_kill',          expected: '0xffffffff81198c30', actual: '0xffffffffc08414c0', status: 'HOOKED' },
            { table: 'sys_call_table', index: 45,  sym: 'sys_recvmsg',       expected: '0xffffffff812b1440', actual: '0xffffffffc0841600', status: 'HOOKED' },
            { table: 'sys_call_table', index: 0,   sym: 'sys_read',          expected: '0xffffffff811f3120', actual: '0xffffffff811f3120', status: 'OK' },
            { table: 'sys_call_table', index: 1,   sym: 'sys_write',         expected: '0xffffffff811f3e40', actual: '0xffffffff811f3e40', status: 'OK' },
            { table: 'sys_call_table', index: 59,  sym: 'sys_execve',        expected: '0xffffffff812c4010', actual: '0xffffffff812c4010', status: 'OK' }
        ],
        modscan: [
            { offset: '0xffff88801c240000', name: 'whisperer',          size: '45056',  used: '0', status: 'HIDDEN' },
            { offset: '0xffff88801c340000', name: 'nf_conntrack',       size: '172032', used: '3', status: 'OK' },
            { offset: '0xffff88801c400000', name: 'ext4',               size: '778240', used: '1', status: 'OK' },
            { offset: '0xffff88801c500000', name: 'crypto_simd',        size: '16384',  used: '1', status: 'OK' }
        ],
        malfind: [
            { pid: 9147, name: 'kwhisp_work',  start: '0xffffffffc0840000', size: '49152', perms: 'r-x', note: 'Kernel memory region — matches whisperer.ko .text section' }
        ],
        netstat: [
            { pid: 9147, proto: 'TCP', local: '0.0.0.0:0', foreign: '185.220.101.47:4443', state: 'ESTABLISHED', note: 'HIDDEN from /proc/net/tcp' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM — NODE-VIGIL-01
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
                                'case_notes.txt': {
                                    type: 'file',
                                    content: '=== CASE FILE: NODE-VIGIL-01 ===\nAssigned: analyst\nOpened: 2026-03-20\n\nINCIDENT SUMMARY:\nNODE-VIGIL-01 is exhibiting classic rootkit IOCs:\n  - ps aux output fluctuates (process disappears and reappears)\n  - netstat -tulnp shows no external connections, but network traffic is observed\n  - lsmod returns clean, but dmesg shows a module load event with no corresponding name\n  - rkhunter exits with "Checking...  [ OK ]" but the check timer is suspiciously fast\n  - System uptime and CPU usage inconsistent with observed workload\n\nSTARTING POINTS:\n  1. cat /proc/kallsyms | grep sys_call_table\n  2. diff /proc/kallsyms vs /boot/System.map-$(uname -r)\n  3. dmesg | grep -i "module\\|hook\\|vigil"\n  4. run vol against /root/vigil01.lime\n\nMemory dump location: /root/vigil01.lime (provided by IR team)\nKernel version: 5.4.0-vigilmod-amd64\n\nGood luck. The rootkit is good. Be better.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ps aux\nlsmod\nnetstat -tulnp\nrkhunter --check\nchkrootkit\ntop\nsudo -l\ndmesg | tail -50\ncat /var/log/kern.log | tail -100'
                                },
                                'vigil01_summary.md': {
                                    type: 'file',
                                    content: '# NODE-VIGIL-01 Incident Summary\n\n## Observed Anomalies\n\n| Tool       | Expected Behavior           | Actual Behavior                          |\n|------------|-----------------------------|------------------------------------------|\n| ps aux     | All processes listed        | PID 9147 (kwhisp_work) missing           |\n| lsmod      | All loaded modules listed   | whisperer.ko absent                      |\n| netstat    | All TCP connections         | 185.220.101.47:4443 absent               |\n| ls /tmp    | Shows all files             | .w_cfg hidden                            |\n| rkhunter   | Flags anomalies             | Reports clean (hooked)                   |\n\n## Working Hypothesis\nKernel-level LKM rootkit hooking sys_getdents64, sys_kill, and sys_recvmsg.\nDKOM used to remove module from lsmod chain.\n\n## Next Steps\n1. Validate syscall table tampering via /proc/kallsyms vs System.map\n2. Analyze memory dump with Volatility linux.check_syscall\n3. Dump LKM via /dev/kmem at address from Volatility modscan\n4. Reverse engineer LKM in Ghidra\n5. Find and kill persistence mechanism'
                                }
                            }
                        }
                    }
                },
                'root': {
                    type: 'dir',
                    children: {
                        'vigil01.lime': {
                            type: 'file',
                            content: '[LIME memory dump — 32GB — binary format, not displayable as text]\n[Use: vol -f /root/vigil01.lime <plugin>]\n[Available Volatility 3 plugins: linux.check_syscall, linux_modscan, linux_malfind, linux.netstat]'
                        },
                        '.bash_history': {
                            type: 'file',
                            content: 'id\nuname -a\ncat /proc/kallsyms | grep sys_call_table\ncat /boot/System.map-5.4.0-vigilmod-amd64 | grep sys_call_table\nvol -f /root/vigil01.lime linux.check_syscall\nvol -f /root/vigil01.lime linux_modscan\ndd if=/dev/kmem bs=4096 skip=0xffff88801c240 count=256 of=/tmp/whisperer.ko'
                        }
                    }
                },
                'proc': {
                    type: 'dir',
                    children: {
                        'kallsyms': {
                            type: 'file',
                            content: '-- /proc/kallsyms (truncated, rootkit-filtered output) --\nffffffff81000000 T _text\nffffffff811f3120 T sys_read\nffffffff811f3e40 T sys_write\nffffffff812c4010 T sys_execve\nffffffff81198c30 T sys_kill             <-- ORIGINAL (masked by hook, visible here due to partial bypass)\nffffffff81234a10 T sys_getdents64       <-- ORIGINAL (see below for tampered sys_call_table entry)\nffffffff812b1440 T sys_recvmsg\nffffffffffffffff T sys_call_table       <-- ALTERED: address sanitized by rootkit\n\nNOTE: The sys_call_table entry shows ffffffffffffffff instead of the real address.\nCompare with /boot/System.map to find discrepancy.'
                        },
                        'modules': {
                            type: 'file',
                            content: 'nf_conntrack 172032 3 nf_nat,xt_conntrack,nf_conntrack_netlink, Live 0xffff88801c340000\next4 778240 1 - Live 0xffff88801c400000\ncrypto_simd 16384 1 aesni_intel, Live 0xffff88801c500000\n\n[whisperer module is NOT listed here — DKOM removed it from the linked list]'
                        },
                        'net': {
                            type: 'dir',
                            children: {
                                'tcp': {
                                    type: 'file',
                                    content: '  sl  local_address rem_address   st tx_queue rx_queue tr tm->when retrnsmt   uid  timeout inode\n   0: 00000000:0016 00000000:0000 0A 00000000:00000000 00:00000000 00000000     0        0  22018 1\n   1: 00000000:1F40 00000000:0000 0A 00000000:00000000 00:00000000 00000000     0        0  24512 1\n\n[Connection to 185.220.101.47:4443 is HIDDEN by sys_recvmsg hook — not shown here]'
                                }
                            }
                        }
                    }
                },
                'boot': {
                    type: 'dir',
                    children: {
                        'System.map-5.4.0-vigilmod-amd64': {
                            type: 'file',
                            content: '-- /boot/System.map-5.4.0-vigilmod-amd64 (kernel symbol map, unmodified) --\nffffffff81000000 T _text\nffffffff811f3120 T sys_read\nffffffff811f3e40 T sys_write\nffffffff812c4010 T sys_execve\nffffffff81198c30 T sys_kill\nffffffff81234a10 T sys_getdents64\nffffffff812b1440 T sys_recvmsg\nffffffff81a01540 D sys_call_table      <-- REAL address: 0xffffffff81a01540\n\n[ANOMALY DETECTED]\n/proc/kallsyms shows sys_call_table at: ffffffffffffffff (sanitized/hidden)\n/boot/System.map shows sys_call_table at: ffffffff81a01540\n\nA discrepancy here indicates the rootkit is intercepting /proc/kallsyms reads\nto prevent discovery of the hooked sys_call_table address.\n\n{{FLAG:detection}}'
                        },
                        'grub': {
                            type: 'dir',
                            children: {
                                'grub.cfg': {
                                    type: 'file',
                                    content: '# GRUB configuration — NODE-VIGIL-01\n# DO NOT EDIT MANUALLY\n\nset default=0\nset timeout=5\n\nmenuentry "Ubuntu 20.04.6 LTS (Linux 5.4.0-vigilmod-amd64)" {\n    linux /boot/vmlinuz-5.4.0-vigilmod-amd64 root=/dev/sda1 ro quiet splash\n    # NOTE: module.sig_enforce=0 — kernel module signing NOT enforced\n    # NOTE: ima_appraise=off — IMA disabled\n    initrd /boot/initrd.img-5.4.0-vigilmod-amd64\n}'
                                }
                            }
                        }
                    }
                },
                'lib': {
                    type: 'dir',
                    children: {
                        'modules': {
                            type: 'dir',
                            children: {
                                '5.4.0-vigilmod-amd64': {
                                    type: 'dir',
                                    children: {
                                        'kernel': {
                                            type: 'dir',
                                            children: {
                                                'drivers': {
                                                    type: 'dir',
                                                    children: {
                                                        'misc': {
                                                            type: 'dir',
                                                            children: {
                                                                'whisperer.ko': {
                                                                    type: 'file',
                                                                    content: '[ELF binary — not displayable as text]\n[MD5: 3f7a2e91c4d8b05612a947e3f1083b29]\n[Size: 45056 bytes]\n[Use Ghidra, IDA Pro, or objdump/readelf to analyze]\n[Hint: run readelf -s whisperer.ko | grep -i "FUNC" to list exported symbols]'
                                                                }
                                                            }
                                                        }
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
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': {
                            type: 'file',
                            content: 'NODE-VIGIL-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nsyslog:x:104:110::/home/syslog:/usr/sbin/nologin\nanalyst:x:1001:1001:Analyst:/home/analyst:/bin/bash\nvigilsvc:x:1002:1002:Vigil Service Account:/home/vigilsvc:/usr/sbin/nologin'
                        },
                        'shadow': {
                            type: 'file',
                            content: 'cat: /etc/shadow: Permission denied'
                        },
                        'os-release': {
                            type: 'file',
                            content: 'NAME="Ubuntu"\nVERSION="20.04.6 LTS (Focal Fossa)"\nID=ubuntu\nID_LIKE=debian\nPRETTY_NAME="Ubuntu 20.04.6 LTS"\nVERSION_ID="20.04"\nHOME_URL="https://www.ubuntu.com/"\nSUPPORT_URL="https://help.ubuntu.com/"\nBUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"\nPRIVACY_POLICY_URL="https://www.ubuntu.com/legal/terms-and-policies/privacy-policy"\nVERSION_CODENAME=focal\nUBUNTU_CODENAME=focal'
                        },
                        'modprobe.d': {
                            type: 'dir',
                            children: {
                                'blacklist.conf': {
                                    type: 'file',
                                    content: '# /etc/modprobe.d/blacklist.conf\n# Modules that should not be loaded\n\n# Example:\n# blacklist nouveau\n# blacklist rtl8xxxu\n\n# Add "blacklist whisperer" below this line to neutralize the rootkit\n'
                                }
                            }
                        },
                        'modules-load.d': {
                            type: 'dir',
                            children: {
                                'vigil.conf': {
                                    type: 'file',
                                    content: '# /etc/modules-load.d/vigil.conf\n# Modules loaded at boot for NODE-VIGIL-01 telemetry stack\nnf_conntrack\n# whisperer [REMOVED — loaded via systemd unit instead]'
                                }
                            }
                        },
                        'systemd': {
                            type: 'dir',
                            children: {
                                'system': {
                                    type: 'dir',
                                    children: {
                                        'systemd-udevd.service': {
                                            type: 'file',
                                            content: '# LEGITIMATE udev daemon service\n# Do NOT modify\n[Unit]\nDescription=udev Kernel Device Manager\nAfter=systemd-sysusers.service\n\n[Service]\nType=notify\nExecStart=/lib/systemd/systemd-udevd\nRestart=always\n\n[Install]\nWantedBy=sysinit.target'
                                        },
                                        'systemd-udevmon.service': {
                                            type: 'file',
                                            content: '# /etc/systemd/system/systemd-udevmon.service\n# WARNING: This is NOT a legitimate systemd service.\n# Name is designed to visually mimic systemd-udevd.service\n\n[Unit]\nDescription=udev Monitor Helper\nAfter=network.target\nBefore=multi-user.target\n\n[Service]\nType=oneshot\nRemainAfterExit=yes\nExecStart=/usr/sbin/insmod /lib/modules/5.4.0-vigilmod-amd64/kernel/drivers/misc/whisperer.ko\nExecStop=/usr/sbin/rmmod whisperer\n\n[Install]\nWantedBy=multi-user.target\n\n# Rootkit persistence mechanism — loads whisperer.ko at every boot\n# To neutralize:\n#   systemctl disable systemd-udevmon.service\n#   blacklist whisperer in /etc/modprobe.d/blacklist.conf\n#   update-initramfs -u\n\n{{FLAG:persistence}}'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {
                        '.w_cfg': {
                            type: 'file',
                            content: '[HIDDEN by sys_getdents64 hook — not visible via ls]\n[Accessible only if you bypass the hook, e.g., via direct /proc/pid/fd access or memory dump]\n\n# whisperer runtime config\nc2_host=185.220.101.47\nc2_port=4443\nc2_proto=HTTPS\nhide_prefix=kwhisp\nmagic_signal=64\nheartbeat_interval=300\n\n{{FLAG:config}}'
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
                                    content: '2026-03-20T00:00:01.003482+00:00 NODE-VIGIL-01 kernel: [    0.000000] Linux version 5.4.0-vigilmod-amd64\n2026-03-20T00:00:01.110005+00:00 NODE-VIGIL-01 kernel: [    1.243100] ACPI: IRQ0 used by override.\n2026-03-20T00:00:02.450001+00:00 NODE-VIGIL-01 kernel: [    2.810044] Loading module: [REDACTED BY MODULE]\n2026-03-20T00:00:02.450002+00:00 NODE-VIGIL-01 kernel: [    2.810299] [     ]: module loaded successfully\n2026-03-20T00:00:02.450003+00:00 NODE-VIGIL-01 kernel: [    2.810301] [     ]: syscall table hooks installed (3 entries)\n2026-03-20T00:00:02.450004+00:00 NODE-VIGIL-01 kernel: [    2.810303] [     ]: DKOM complete — module unlinked from lsmod chain\n2026-03-20T00:00:10.003000+00:00 NODE-VIGIL-01 kernel: [   10.003000] NET: Registered protocol family 10\n2026-03-20T01:15:22.887120+00:00 NODE-VIGIL-01 kernel: [4521.887120] [     ]: C2 beacon sent — 185.220.101.47:4443\n2026-03-20T03:47:00.001001+00:00 NODE-VIGIL-01 kernel: [18059.001001] [     ]: analyst login detected — stealth mode elevated'
                                },
                                'syslog': {
                                    type: 'file',
                                    content: '2026-03-20T00:00:05.000000+00:00 NODE-VIGIL-01 systemd[1]: Started udev Monitor Helper.\n2026-03-20T00:00:05.001000+00:00 NODE-VIGIL-01 systemd[1]: systemd-udevmon.service: Succeeded.\n2026-03-20T00:00:06.000000+00:00 NODE-VIGIL-01 systemd[1]: Reached target Multi-User System.\n2026-03-20T03:47:01.000000+00:00 NODE-VIGIL-01 sshd[8813]: Accepted publickey for analyst from 10.0.0.5 port 52144 ssh2\n2026-03-20T03:47:01.002000+00:00 NODE-VIGIL-01 systemd-logind[722]: New session 14 of user analyst.'
                                },
                                'auth.log': {
                                    type: 'file',
                                    content: '2026-03-20T03:47:01.000000+00:00 NODE-VIGIL-01 sshd[8813]: Accepted publickey for analyst from 10.0.0.5 port 52144 ssh2\n2026-03-20T03:47:15.000000+00:00 NODE-VIGIL-01 sudo[8921]: analyst : TTY=pts/0 ; PWD=/home/analyst ; USER=root ; COMMAND=/usr/bin/cat /proc/kallsyms'
                                }
                            }
                        }
                    }
                },
                'dev': {
                    type: 'dir',
                    children: {
                        'kmem': {
                            type: 'file',
                            content: '[Character device — kernel memory interface]\n[Read-only access requires root. Use dd or specialized tools.]\n[Accessible at addresses returned by Volatility modscan]\n[Example: dd if=/dev/kmem bs=4096 skip=<addr_in_pages> count=256 of=/tmp/whisperer.ko]'
                        }
                    }
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // GHIDRA ANALYSIS ARTIFACT (simulated disassembly output)
    // ═══════════════════════════════════════════════════════

    _ghidraOutput: {
        strings: [
            { addr: '0x1080', value: 'whisperer' },
            { addr: '0x108a', value: 'The Whisperer v2.3 — by ghost.0x' },
            { addr: '0x10a4', value: '185.220.101.47' },
            { addr: '0x10b3', value: '4443' },
            { addr: '0x10b8', value: 'kwhisp' },
            { addr: '0x10bf', value: 'SILENT_CROWN_7741' },
            { addr: '0x10d0', value: 'vigilance_protocol_bypass=VPB-W3-H4V3-Y0U-N0W-4841' },
            { addr: '0x10f8', value: '/proc/net/tcp' },
            { addr: '0x1106', value: 'sys_call_table' },
            { addr: '0x1115', value: 'init_module' },
            { addr: '0x1121', value: 'cleanup_module' }
        ],
        functions: [
            { name: 'init_module',         addr: '0x2000', note: 'Module entry — installs hooks, unlinks from lsmod chain' },
            { name: 'cleanup_module',      addr: '0x2200', note: 'Module exit — restores original syscall table entries' },
            { name: 'hacked_getdents64',   addr: '0x2400', note: 'Replaces sys_getdents64 — filters entries with hide_prefix "kwhisp" and filename ".w_cfg"' },
            { name: 'hacked_kill',         addr: '0x2600', note: 'Replaces sys_kill — intercepts signal 64 (magic_signal) as C2 command trigger' },
            { name: 'hacked_recvmsg',      addr: '0x2800', note: 'Replaces sys_recvmsg — strips C2 connection entries from TCP socket reads' },
            { name: 'dkom_unlink_self',    addr: '0x2a00', note: 'Removes module struct from this_module.list — renders lsmod blind' },
            { name: 'beacon_c2',           addr: '0x2c00', note: 'HTTPS POST to 185.220.101.47:4443 every 300 seconds — sends hostname, uptime, uid' },
            { name: 'verify_vpb',          addr: '0x2e00', note: 'Validates incoming C2 command against hardcoded VPB string before executing privileged ops' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (box-specific tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        'ssh': function(args, term, engine) {
            // This box starts already on the target — SSH is just flavor
            const fullCmd = args.join(' ');
            if (fullCmd.includes('analyst') || fullCmd.includes('NODE-VIGIL-01') || fullCmd.includes('vigil')) {
                return 'Already connected to NODE-VIGIL-01 as analyst. No additional SSH needed.\n[INFO] You have sudo access for specific commands. Run: sudo -l';
            }
            return 'ssh: ' + (args[0] || 'host') + ': Connection refused or host unreachable.';
        },

        'sudo': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (fullCmd === '-l' || fullCmd === '--list') {
                return 'Matching Defaults entries for analyst on NODE-VIGIL-01:\n    env_reset, mail_badpass, secure_path=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\n\nUser analyst may run the following commands on NODE-VIGIL-01:\n    (ALL) NOPASSWD: /usr/bin/cat /proc/kallsyms\n    (ALL) NOPASSWD: /usr/bin/cat /boot/System.map*\n    (ALL) NOPASSWD: /sbin/dmesg\n    (ALL) NOPASSWD: /bin/dd if=/dev/kmem *\n    (ALL) NOPASSWD: /usr/local/bin/vol\n    (ALL) NOPASSWD: /sbin/modprobe *\n    (ALL) NOPASSWD: /usr/sbin/update-initramfs *\n    (ALL) NOPASSWD: /bin/systemctl disable systemd-udevmon.service\n    (ALL) NOPASSWD: /bin/systemctl status systemd-udevmon.service\n    (ALL) NOPASSWD: /usr/bin/tee /etc/modprobe.d/blacklist.conf';
            }

            // sudo su / sudo -i — escalate to root
            if (fullCmd === 'su' || fullCmd === '-i' || fullCmd === '-s' || fullCmd.startsWith('su ')) {
                C16Config._rootEscalated = true;
                C16Config._switchContext('root', term);
                return '[sudo] password for analyst: ********\nroot@NODE-VIGIL-01:~#\n\n[+] Root shell obtained.';
            }

            // sudo dd — LKM dump simulation
            if (fullCmd.includes('dd') && fullCmd.includes('/dev/kmem') && fullCmd.includes('whisperer')) {
                C16Config._lkmDumped = true;
                return 'dd: reading from /dev/kmem...\n256+0 records in\n256+0 records out\n1048576 bytes (1.0 MB, 1.0 MiB) copied, 0.004 s, 262 MB/s\n\n[+] LKM memory dumped to /tmp/whisperer.ko (1048576 bytes)\n[+] ELF header confirmed. File is a valid kernel module object.\n[+] Next step: load /tmp/whisperer.ko into Ghidra for static analysis.';
            }

            if (fullCmd.includes('dd') && fullCmd.includes('/dev/kmem')) {
                return 'dd: reading from /dev/kmem...\n256+0 records in\n256+0 records out\n1048576 bytes (1.0 MB, 1.0 MiB) copied, 0.003 s, 349 MB/s\n[+] Memory region dumped to output file.';
            }

            // sudo update-initramfs
            if (fullCmd.includes('update-initramfs')) {
                if (!C16Config._blacklistApplied) {
                    return 'update-initramfs: Generating /boot/initrd.img-5.4.0-vigilmod-amd64\nWARNING: whisperer.ko is not blacklisted — it will still be included in initramfs.\nAdd "blacklist whisperer" to /etc/modprobe.d/blacklist.conf first.';
                }
                C16Config._initramfsUpdated = true;
                return 'update-initramfs: Generating /boot/initrd.img-5.4.0-vigilmod-amd64\n[+] whisperer.ko excluded from initramfs (blacklisted).\n[+] initrd.img updated. Reboot to apply.\nupdate-initramfs: done.';
            }

            // sudo modprobe blacklist (common wrong approach — user should use tee)
            if (fullCmd.includes('modprobe') && fullCmd.includes('blacklist')) {
                return 'modprobe: Option --blacklist is deprecated. Use /etc/modprobe.d/blacklist.conf instead.\nExample: echo "blacklist whisperer" | sudo tee -a /etc/modprobe.d/blacklist.conf';
            }

            // Passthrough — run as sudo if it's in their allowed list
            return 'sudo: ' + (args[0] || 'command') + ': command not found or not permitted';
        },

        'dmesg': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const kmsg = C16Config.filesystem['/'].children['var'].children['log'].children['kern.log'].content;
            if (fullCmd.includes('-T') || fullCmd.includes('tail') || fullCmd.includes('grep')) {
                // Simulated dmesg -T output, simplified
                return '[2026-03-20T00:00:01+00:00] Linux version 5.4.0-vigilmod-amd64\n[2026-03-20T00:00:02+00:00] Loading module: [REDACTED BY MODULE]\n[2026-03-20T00:00:02+00:00] [     ]: module loaded successfully\n[2026-03-20T00:00:02+00:00] [     ]: syscall table hooks installed (3 entries)\n[2026-03-20T00:00:02+00:00] [     ]: DKOM complete — module unlinked from lsmod chain\n[2026-03-20T01:15:22+00:00] [     ]: C2 beacon sent — 185.220.101.47:4443\n[2026-03-20T03:47:00+00:00] [     ]: analyst login detected — stealth mode elevated';
            }
            return '[    0.000000] Linux version 5.4.0-vigilmod-amd64 (gcc version 9.3.0)\n[    2.810044] Loading module: [REDACTED BY MODULE]\n[    2.810299] [     ]: module loaded successfully\n[    2.810301] [     ]: syscall table hooks installed (3 entries)\n[    2.810303] [     ]: DKOM complete — module unlinked from lsmod chain\n[   10.003000] NET: Registered protocol family 10\n[ 4521.887120] [     ]: C2 beacon sent — 185.220.101.47:4443\n[18059.001001] [     ]: analyst login detected — stealth mode elevated';
        },

        'ps': function(args, term, engine) {
            // Rootkit hides PID 9147 — this simulates what ps actually shows
            return 'USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot           1  0.0  0.0 170192 13084 ?        Ss   Mar19   0:02 /sbin/init\nroot           2  0.0  0.0      0     0 ?        S    Mar19   0:00 [kthreadd]\nroot           3  0.0  0.0      0     0 ?        I<   Mar19   0:00 [rcu_gp]\nroot         456  0.0  0.1  76008 15276 ?        Ss   Mar19   0:00 /lib/systemd/systemd-journald\nroot         722  0.0  0.1  22420 11280 ?        Ss   Mar19   0:00 /lib/systemd/systemd-logind\nroot         800  0.0  0.2 319640 31200 ?        Ssl  Mar19   0:08 /usr/sbin/rsyslogd -n\nsyslog         804  0.0  0.0   6648  4112 ?        Ss   Mar19   0:00 /usr/sbin/cron -f\nroot         960  0.0  0.1  14320 10080 ?        Ss   Mar19   0:01 sshd: /usr/sbin/sshd -D\nanalyst     8813  0.0  0.1  15440 11200 ?        Ss   03:47   0:00 sshd: analyst@pts/0\nanalyst     8815  0.0  0.0   8404  5100 pts/0    Ss   03:47   0:00 -bash\n[PID 9147 is hidden by sys_kill hook — not displayed here]';
        },

        'lsmod': function(args, term, engine) {
            // Rootkit removed itself via DKOM
            return 'Module                  Size  Used by\nnf_conntrack          172032  3 nf_nat,xt_conntrack,nf_conntrack_netlink\next4                  778240  1\ncrypto_simd            16384  1 aesni_intel\naesni_intel           393216  3\ncrc32c_intel           24576  2\n\n[whisperer module is NOT shown — DKOM removed it from module linked list]\n[Use Volatility linux_modscan against memory dump to find it]';
        },

        'netstat': function(args, term, engine) {
            return 'Active Internet connections (only servers)\nProto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name\ntcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      960/sshd\ntcp        0      0 0.0.0.0:8080            0.0.0.0:*               LISTEN      800/rsyslogd\n\n[Connection to 185.220.101.47:4443 is HIDDEN by sys_recvmsg hook]';
        },

        'ss': function(args, term, engine) {
            return C16Config.commands.netstat(args, term, engine);
        },

        'rkhunter': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (!fullCmd.includes('--check') && !fullCmd.includes('-c')) {
                return 'Usage: rkhunter --check [--rwo]\nRootkit Hunter v1.4.6';
            }
            return `Rootkit Hunter v1.4.6
Checking for known rootkits...

  Checking for '55808 Trojan'                          [ Not found ]
  Checking for 'Adore Rootkit'                         [ Not found ]
  Checking for 'Avatar rootkit'                        [ Not found ]
  Checking for 'Bash door/backdoors'                   [ Not found ]
  Checking for 'The Whisperer'                         [ Not found ]
  Checking for 'Suckit Rootkit'                        [ Not found ]
  Checking for 'Volc Rootkit'                          [ Not found ]
  Checking for 'ZK Rootkit'                            [ Not found ]

Checking system commands...
  Checking for strings command                         [ Found ]
  Checking 'ps' command                                [ OK ]
  Checking 'ls' command                                [ OK ]
  Checking 'lsmod' command                             [ OK ]

System check summary
  File properties checks: Warning [2]
  Rootkit checks: 0 [known rootkits]
  Application checks: 0
  System boot checks: 0

[NOTE] rkhunter returned clean — rootkit successfully evades signature-based detection.
[NOTE] Syscall table comparison was intercepted by the hook, returning false negatives.`;
        },

        'chkrootkit': function(args, term, engine) {
            return `ROOTDIR is \`/'\nChecking \`amd'...                                    not infected
Checking \`basename'...                               not infected
Checking \`chsh'...                                   not infected
Checking \`cron'...                                   not infected
Checking \`crontab'...                                not infected
Checking \`date'...                                   not infected
Checking \`du'...                                     not infected
Checking \`find'...                                   not infected
Checking \`ifconfig'...                               not infected
Checking \`inetd'...                                  not infected
Checking \`login'...                                  not infected
Checking \`ls'...                                     not infected
Checking \`lsof'...                                   not infected
Checking \`netstat'...                                not infected
Checking \`ps'...                                     not infected
Checking \`rshd'...                                   not infected
Checking \`syslogd'...                                not infected
Checking \`trojan'...                                 not infected

[NOTE] chkrootkit also returns clean — kernel-level hooks intercept its checks.`;
        },

        'vol': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (!fullCmd.includes('/root/vigil01.lime') && !fullCmd.includes('vigil01')) {
                return 'Volatility Foundation Volatility Framework 3.0\nUsage: vol -f <image> <plugin>\n\nCommon plugins:\n  linux.check_syscall    — Detect hooked syscall table entries\n  linux_modscan          — Scan for hidden kernel modules\n  linux_malfind          — Find injected code in kernel memory\n  linux.netstat          — Show all network connections (bypasses hooks)\n\nExample: vol -f /root/vigil01.lime linux.check_syscall';
            }

            if (fullCmd.includes('linux.check_syscall') || fullCmd.includes('check_syscall')) {
                if (engine) engine.advancePhase && engine.advancePhase('detection');
                const data = C16Config._volData.check_syscall;
                let output = 'Volatility 3 Framework 2.4.1\nProgress: 100.00 PDB scanning finished\n\n';
                output += 'linux.check_syscall.Check_syscall\n';
                output += 'Table     Index  Symbol             Expected              Handler               Status\n';
                output += '-' .repeat(100) + '\n';
                data.forEach(r => {
                    const statusColor = r.status === 'HOOKED' ? '*** HOOKED ***' : r.status;
                    output += `${r.table.padEnd(18)} ${String(r.index).padEnd(6)} ${r.sym.padEnd(18)} ${r.expected.padEnd(22)} ${r.actual.padEnd(22)} ${statusColor}\n`;
                });
                output += '\n[!] 3 hooked syscall table entries detected.\n[!] Hook handlers reside at 0xffffffffc084xxxx — outside expected kernel range.\n[!] This is consistent with a Loadable Kernel Module (LKM) rootkit.';
                return output;
            }

            if (fullCmd.includes('linux_modscan') || fullCmd.includes('modscan')) {
                const data = C16Config._volData.modscan;
                let output = 'Volatility 3 Framework 2.4.1\nProgress: 100.00 PDB scanning finished\n\n';
                output += 'linux.modules.Modules / linux_modscan\n';
                output += 'Offset               Name              Size      Used  Status\n';
                output += '-'.repeat(75) + '\n';
                data.forEach(r => {
                    const note = r.status === 'HIDDEN' ? '  *** HIDDEN FROM LSMOD ***' : '';
                    output += `${r.offset.padEnd(21)} ${r.name.padEnd(18)} ${r.size.padEnd(10)} ${r.used.padEnd(6)} ${r.status}${note}\n`;
                });
                output += '\n[!] Module "whisperer" found at 0xffff88801c240000 — not present in /proc/modules or lsmod output.\n[!] DKOM confirmed: module list pointer manipulation detected.';
                return output;
            }

            if (fullCmd.includes('linux_malfind') || fullCmd.includes('malfind')) {
                const data = C16Config._volData.malfind;
                let output = 'Volatility 3 Framework 2.4.1\nProgress: 100.00 PDB scanning finished\n\n';
                output += 'linux.malfind.Malfind\n';
                output += 'PID    Name          Start              Size    Perms  Note\n';
                output += '-'.repeat(80) + '\n';
                data.forEach(r => {
                    output += `${String(r.pid).padEnd(6)} ${r.name.padEnd(14)} ${r.start.padEnd(19)} ${r.size.padEnd(8)} ${r.perms.padEnd(6)} ${r.note}\n`;
                });
                output += '\n[!] Suspicious kernel-mode executable region detected.\n[!] Matches address range of whisperer.ko from modscan.';
                return output;
            }

            if (fullCmd.includes('linux.netstat') || (fullCmd.includes('netstat') && fullCmd.includes('vigil01'))) {
                const data = C16Config._volData.netstat;
                let output = 'Volatility 3 Framework 2.4.1\nProgress: 100.00 PDB scanning finished\n\n';
                output += 'linux.netstat.Netstat\n';
                output += 'PID    Name         Proto  Local            Foreign                State\n';
                output += '-'.repeat(75) + '\n';
                output += `960    sshd         TCP    0.0.0.0:22       0.0.0.0:*              LISTEN\n`;
                output += `800    rsyslogd     TCP    0.0.0.0:8080     0.0.0.0:*              LISTEN\n`;
                data.forEach(r => {
                    output += `${String(r.pid).padEnd(6)} ${r.name.padEnd(13)} ${r.proto.padEnd(7)} ${r.local.padEnd(17)} ${r.foreign.padEnd(23)} ${r.state}  [${r.note}]\n`;
                });
                output += '\n[!] Hidden connection revealed by bypassing sys_recvmsg hook via memory scan.\n[!] C2 server: 185.220.101.47:4443 (HTTPS over non-standard port)';
                return output;
            }

            return 'Volatility 3 Framework 2.4.1\nERROR: Invalid or unsupported plugin.\n\nTry: linux.check_syscall, linux_modscan, linux_malfind, linux.netstat';
        },

        'objdump': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (!fullCmd.includes('whisperer')) {
                return 'objdump: Usage: objdump [-d] [-t] <file>\nExample: objdump -d /tmp/whisperer.ko';
            }
            if (!C16Config._lkmDumped && !fullCmd.includes('/lib/modules')) {
                return 'objdump: /tmp/whisperer.ko: No such file or directory\n[!] Dump the LKM first: sudo dd if=/dev/kmem bs=4096 skip=0xffff88801c240 count=256 of=/tmp/whisperer.ko';
            }
            return `objdump -d /tmp/whisperer.ko (truncated)\n\nwhisperer.ko:     file format elf64-x86-64\nArchitecture: i386:x86-64\n\nDisassembly of section .text:\n\n0000000000002000 <init_module>:\n    2000:\t55                  \tpush   %rbp\n    2001:\t48 89 e5            \tmov    %rsp,%rbp\n    2004:\te8 f7 05 00 00      \tcallq  2600 <dkom_unlink_self>\n    2009:\te8 f2 09 00 00      \tcallq  2a00 <install_hooks>\n    200e:\t31 c0               \txor    %eax,%eax\n    2010:\t5d                  \tpop    %rbp\n    2011:\tc3                  \tretq\n\n0000000000002400 <hacked_getdents64>:\n    2400:\t48 8b 3d 59 20 00 00\tmov    0x2059(%rip),%rdi\n    2407:\te8 f4 03 00 00      \tcallq  2800 <filter_hidden>\n    240c:\tc3                  \tretq\n\n[Load in Ghidra for full decompilation. Use Defined Strings to find hardcoded values.]`;
        },

        'readelf': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (!fullCmd.includes('whisperer')) {
                return 'readelf: Usage: readelf [-s] [-h] [-S] <file>\nExample: readelf -s /tmp/whisperer.ko';
            }
            if (!C16Config._lkmDumped && !fullCmd.includes('/lib/modules')) {
                return 'readelf: /tmp/whisperer.ko: No such file or directory';
            }
            if (fullCmd.includes('-s') || fullCmd.includes('--syms')) {
                return `readelf -s /tmp/whisperer.ko

Symbol table '.symtab' contains 28 entries:
   Num:    Value          Size Type    Bind   Vis      Ndx Name
     0: 0000000000000000     0 NOTYPE  LOCAL  DEFAULT  UND
     1: 0000000000002000   546 FUNC    GLOBAL DEFAULT    1 init_module
     2: 0000000000002200   312 FUNC    GLOBAL DEFAULT    1 cleanup_module
     3: 0000000000002400   208 FUNC    LOCAL  DEFAULT    1 hacked_getdents64
     4: 0000000000002600   196 FUNC    LOCAL  DEFAULT    1 hacked_kill
     5: 0000000000002800   224 FUNC    LOCAL  DEFAULT    1 hacked_recvmsg
     6: 0000000000002a00   180 FUNC    LOCAL  DEFAULT    1 dkom_unlink_self
     7: 0000000000002c00   256 FUNC    LOCAL  DEFAULT    1 beacon_c2
     8: 0000000000002e00   140 FUNC    LOCAL  DEFAULT    1 verify_vpb
     9: 0000000000001080    10 OBJECT  LOCAL  DEFAULT    3 module_name
    10: 0000000000001094    27 OBJECT  LOCAL  DEFAULT    3 author_tag
    11: 00000000000010a4    15 OBJECT  LOCAL  DEFAULT    3 c2_host
    12: 00000000000010b3     5 OBJECT  LOCAL  DEFAULT    3 c2_port
    13: 00000000000010bf    18 OBJECT  LOCAL  DEFAULT    3 magic_cmd
    14: 00000000000010d0    44 OBJECT  LOCAL  DEFAULT    3 vpb_string`;
            }
            return 'readelf: Usage: readelf -s /tmp/whisperer.ko\nreadelf: -h for ELF header, -S for sections, -s for symbol table';
        },

        'strings': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (!fullCmd.includes('whisperer')) {
                return 'Usage: strings <file>\nExample: strings /tmp/whisperer.ko';
            }
            if (!C16Config._lkmDumped && !fullCmd.includes('/lib/modules')) {
                return 'strings: /tmp/whisperer.ko: No such file or directory\n[!] Dump the LKM first using dd against /dev/kmem';
            }
            C16Config._lkmAnalyzed = true;
            return `strings /tmp/whisperer.ko

/lib/x86_64-linux-gnu/libc.so.6
__sprintf_chk
__stack_chk_fail
GPL
whisperer
The Whisperer v2.3 -- by ghost.0x
185.220.101.47
4443
kwhisp
SILENT_CROWN_7741
vigilance_protocol_bypass=VPB-W3-H4V3-Y0U-N0W-4841
/proc/net/tcp
sys_call_table
init_module
cleanup_module
kernel
vermagic=5.4.0-vigilmod-amd64 SMP mod_unload
name=whisperer
author=ghost.0x
description=advanced kernel persistence module`;
        },

        'ghidra': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (!C16Config._lkmDumped && !fullCmd.includes('/lib/modules')) {
                return 'Ghidra 11.0.1\nERROR: File not found. Dump the LKM first:\n  sudo dd if=/dev/kmem bs=4096 skip=0xffff88801c240 count=256 of=/tmp/whisperer.ko';
            }
            C16Config._lkmAnalyzed = true;
            const out = C16Config._ghidraOutput;
            let output = 'Ghidra 11.0.1 — Headless Analysis Mode\nProject: whisperer_analysis\nFile: /tmp/whisperer.ko (ELF 64-bit LSB relocatable, x86-64)\n\n';
            output += '=== DEFINED STRINGS ===\n';
            out.strings.forEach(s => {
                output += `  ${s.addr}  "${s.value}"\n`;
            });
            output += '\n=== EXPORTED FUNCTIONS ===\n';
            out.functions.forEach(f => {
                output += `  ${f.addr}  ${f.name.padEnd(25)} // ${f.note}\n`;
            });
            output += '\n[+] Analysis complete. Key findings:\n';
            output += '    - C2 server hardcoded: 185.220.101.47:4443\n';
            output += '    - Magic signal for C2 trigger: 64\n';
            output += '    - VPB (master control sequence) found at 0x10d0\n';
            output += '    - verify_vpb() validates incoming commands against the VPB string before execution\n';
            return output;
        },

        'systemctl': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (fullCmd.includes('status') && fullCmd.includes('udevmon')) {
                return `systemd-udevmon.service - udev Monitor Helper
     Loaded: loaded (/etc/systemd/system/systemd-udevmon.service; enabled; vendor preset: enabled)
     Active: inactive (dead) since Fri 2026-03-20 00:00:05 UTC; 3h 47min ago
    Process: 412 ExecStart=/usr/sbin/insmod /lib/modules/5.4.0-vigilmod-amd64/kernel/drivers/misc/whisperer.ko (code=exited, status=0/SUCCESS)
   Main PID: 412 (code=exited, status=0/SUCCESS)

Mar 20 00:00:05 NODE-VIGIL-01 systemd[1]: Starting udev Monitor Helper...
Mar 20 00:00:05 NODE-VIGIL-01 systemd[1]: systemd-udevmon.service: Succeeded.
Mar 20 00:00:05 NODE-VIGIL-01 systemd[1]: Started udev Monitor Helper.

[!] ANOMALY: This service loads whisperer.ko — it is NOT a legitimate systemd service.`;
            }

            if (fullCmd.includes('status') && fullCmd.includes('udevd')) {
                return `systemd-udevd.service - udev Kernel Device Manager
     Loaded: loaded (/lib/systemd/system/systemd-udevd.service; static; vendor preset: enabled)
     Active: active (running) since Fri 2026-03-20 00:00:01 UTC; 3h 47min ago
   Main PID: 289 (systemd-udevd)
      Tasks: 1 (limit: 9449)
     Memory: 10.3M

Mar 20 00:00:01 NODE-VIGIL-01 systemd[1]: Starting udev Kernel Device Manager...
Mar 20 00:00:01 NODE-VIGIL-01 systemd[1]: Started udev Kernel Device Manager.`;
            }

            if (fullCmd.includes('list-unit-files') || fullCmd.includes('list-units')) {
                return `UNIT FILE                      STATE           VENDOR PRESET
systemd-journald.service       static          -
systemd-logind.service         static          -
systemd-udevd.service          static          -
systemd-udevmon.service        enabled         enabled
sshd.service                   enabled         enabled
rsyslog.service                enabled         enabled
cron.service                   enabled         enabled

7 unit files listed.
[!] systemd-udevmon.service is enabled — suspicious name, not a standard systemd service.`;
            }

            if (fullCmd.includes('disable') && fullCmd.includes('udevmon')) {
                C16Config._serviceDisabled = true;
                if (engine) engine.advancePhase && engine.advancePhase('persistence');
                return 'Removed /etc/systemd/system/multi-user.target.wants/systemd-udevmon.service.\n[+] systemd-udevmon.service disabled.\n[+] Rootkit persistence mechanism: NEUTRALIZED (service).\n[!] Remember to also blacklist the module and update initramfs.';
            }

            if (fullCmd.includes('enable') && fullCmd.includes('udevmon')) {
                return 'ERROR: This service should be DISABLED, not enabled.';
            }

            return 'systemctl: ' + fullCmd + ': unknown operation or unit not found.';
        },

        'tee': function(args, term, engine) {
            const fullCmd = args.join(' ');
            // Detect: echo "blacklist whisperer" | sudo tee -a /etc/modprobe.d/blacklist.conf
            // The command is parsed by the terminal; tee receives what was piped
            if (fullCmd.includes('blacklist.conf')) {
                C16Config._blacklistApplied = true;
                return 'blacklist whisperer\n[+] "blacklist whisperer" written to /etc/modprobe.d/blacklist.conf.\n[+] Module will be blocked from auto-loading on next boot.\n[+] Next step: sudo update-initramfs -u';
            }
            return 'tee: no input provided or file path required.';
        },

        'echo': function(args, term, engine) {
            const fullCmd = args.join(' ');
            // Catch: echo "blacklist whisperer" >> /etc/modprobe.d/blacklist.conf
            if (fullCmd.includes('blacklist whisperer') || fullCmd.includes('blacklist\\ whisperer')) {
                C16Config._blacklistApplied = true;
                return '[+] "blacklist whisperer" appended to blacklist.conf.\n[+] Run: sudo update-initramfs -u to rebuild initramfs.';
            }
            // Generic echo
            return args.join(' ');
        },

        'rmmod': function(args, term, engine) {
            const target = args[0] || '';
            if (target.includes('whisperer')) {
                return 'rmmod: ERROR: Module whisperer is not currently visible in module list (DKOM).\nYou must reboot after blacklisting and rebuilding initramfs to fully remove it.\nTo unload now (if you have the address): use live kernel patching tools.';
            }
            return 'rmmod: Module ' + (target || '<name>') + ' not found.';
        },

        'insmod': function(args, term, engine) {
            return 'insmod: Only for loading modules. To REMOVE the rootkit, blacklist it and update initramfs.';
        },

        'cat': function(args, term, engine) {
            // Context-aware cat overrides for key forensic files
            const path = args[0] || '';

            if (path.includes('kern.log')) {
                return C16Config.filesystem['/'].children['var'].children['log'].children['kern.log'].content;
            }
            if (path.includes('syslog') && !path.includes('/var/log/syslog')) {
                return 'cat: ' + path + ': No such file or directory';
            }
            if (path.includes('/var/log/syslog')) {
                return C16Config.filesystem['/'].children['var'].children['log'].children['syslog'].content;
            }
            if (path.includes('auth.log')) {
                return C16Config.filesystem['/'].children['var'].children['log'].children['auth.log'].content;
            }
            if (path.includes('kallsyms')) {
                return C16Config.filesystem['/'].children['proc'].children['kallsyms'].content;
            }
            if (path.includes('/proc/modules')) {
                return C16Config.filesystem['/'].children['proc'].children['modules'].content;
            }
            if (path.includes('System.map')) {
                return C16Config.filesystem['/'].children['boot'].children['System.map-5.4.0-vigilmod-amd64'].content;
            }
            if (path.includes('blacklist.conf')) {
                const base = C16Config.filesystem['/'].children['etc'].children['modprobe.d'].children['blacklist.conf'].content;
                if (C16Config._blacklistApplied) {
                    return base + 'blacklist whisperer\n';
                }
                return base;
            }
            if (path.includes('udevmon.service') || (path.includes('systemd') && path.includes('udevmon'))) {
                return C16Config.filesystem['/'].children['etc'].children['systemd'].children['system'].children['systemd-udevmon.service'].content;
            }
            if (path.includes('udevd.service') && !path.includes('udevmon')) {
                return C16Config.filesystem['/'].children['etc'].children['systemd'].children['system'].children['systemd-udevd.service'].content;
            }
            if (path.includes('vigil.conf') || path.includes('modules-load.d')) {
                return C16Config.filesystem['/'].children['etc'].children['modules-load.d'].children['vigil.conf'].content;
            }
            if (path.includes('grub.cfg')) {
                return C16Config.filesystem['/'].children['boot'].children['grub'].children['grub.cfg'].content;
            }
            if (path.includes('/proc/net/tcp')) {
                return C16Config.filesystem['/'].children['proc'].children['net'].children['tcp'].content;
            }
            if (path.includes('/etc/passwd')) {
                return C16Config.filesystem['/'].children['etc'].children['passwd'].content;
            }
            if (path.includes('/etc/hostname')) {
                return 'NODE-VIGIL-01';
            }
            if (path.includes('/etc/os-release')) {
                return C16Config.filesystem['/'].children['etc'].children['os-release'].content;
            }
            if (path.includes('.w_cfg') || path.includes('w_cfg')) {
                // Hidden file — only accessible via special method or after analysis
                if (C16Config._lkmAnalyzed || C16Config._rootEscalated) {
                    return C16Config.filesystem['/'].children['tmp'].children['.w_cfg'].content;
                }
                return 'cat: /tmp/.w_cfg: No such file or directory\n[!] The file is hidden by the sys_getdents64 hook.\n[!] Access via /proc/<pid>/fd or after extracting config from LKM binary analysis.';
            }
            if (path.includes('case_notes') || path.includes('vigil01_summary')) {
                if (path.includes('vigil01_summary')) {
                    return C16Config.filesystem['/'].children['home'].children['analyst'].children['vigil01_summary.md'].content;
                }
                return C16Config.filesystem['/'].children['home'].children['analyst'].children['case_notes.txt'].content;
            }
            if (path.includes('.bash_history') && (path.includes('root') || C16Config._context === 'root')) {
                return C16Config.filesystem['/'].children['root'].children['.bash_history'].content;
            }
            if (path.includes('.bash_history')) {
                return C16Config.filesystem['/'].children['home'].children['analyst'].children['.bash_history'].content;
            }
            // Fall through to built-in for any other paths
            return null;
        },

        'ls': function(args, term, engine) {
            const path = (args.find(a => !a.startsWith('-')) || '.').replace(/\/$/, '');
            const showHidden = args.some(a => a.includes('a'));

            if (path === '.' || path === '/home/analyst' || path === '~') {
                return showHidden
                    ? '.  ..  .bash_history  .bashrc  .profile  case_notes.txt  vigil01_summary.md'
                    : 'case_notes.txt  vigil01_summary.md';
            }
            if (path === '/root' || path === '/root/') {
                if (!C16Config._rootEscalated) return 'ls: cannot open directory \'/root\': Permission denied';
                return showHidden
                    ? '.  ..  .bash_history  vigil01.lime'
                    : 'vigil01.lime';
            }
            if (path === '/proc') {
                return 'buddyinfo  cmdline  cpuinfo  filesystems  interrupts  kallsyms  loadavg  meminfo  modules  mounts  net  self  stat  uptime  version';
            }
            if (path === '/proc/net') {
                return 'dev  fib_trie  if_inet6  raw  raw6  snmp  stat  tcp  tcp6  udp  udp6  unix';
            }
            if (path === '/boot') {
                return 'grub  initrd.img-5.4.0-vigilmod-amd64  System.map-5.4.0-vigilmod-amd64  vmlinuz-5.4.0-vigilmod-amd64';
            }
            if (path === '/etc/modprobe.d') {
                return 'blacklist.conf';
            }
            if (path === '/etc/modules-load.d') {
                return 'vigil.conf';
            }
            if (path === '/etc/systemd/system') {
                return 'multi-user.target.wants  network.target.wants  sshd.service  systemd-udevmon.service';
            }
            if (path === '/tmp') {
                // Rootkit hides .w_cfg via getdents64 hook
                if (C16Config._lkmDumped) {
                    return showHidden
                        ? '.  ..  whisperer.ko  [.w_cfg is hidden by sys_getdents64 hook — not shown]'
                        : 'whisperer.ko';
                }
                return showHidden
                    ? '.  ..  [.w_cfg is hidden by sys_getdents64 hook — not shown]'
                    : '';
            }
            if (path === '/lib/modules/5.4.0-vigilmod-amd64/kernel/drivers/misc') {
                return 'whisperer.ko';
            }
            if (path === '/dev') {
                return 'kmem  mem  null  random  sda  sda1  tty  urandom  zero';
            }
            // Fall through to built-in
            return null;
        },

        'find': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (fullCmd.includes('/etc/systemd') && (fullCmd.includes('service') || fullCmd.includes('name'))) {
                return '/etc/systemd/system/multi-user.target.wants/sshd.service\n/etc/systemd/system/multi-user.target.wants/rsyslog.service\n/etc/systemd/system/multi-user.target.wants/cron.service\n/etc/systemd/system/multi-user.target.wants/systemd-udevmon.service\n/etc/systemd/system/sshd.service\n/etc/systemd/system/systemd-udevmon.service';
            }
            if (fullCmd.includes('/lib/modules') && fullCmd.includes('.ko')) {
                return '/lib/modules/5.4.0-vigilmod-amd64/kernel/drivers/misc/whisperer.ko\n/lib/modules/5.4.0-vigilmod-amd64/kernel/net/netfilter/nf_conntrack.ko\n/lib/modules/5.4.0-vigilmod-amd64/kernel/fs/ext4/ext4.ko';
            }
            if (fullCmd.includes('/etc') && (fullCmd.includes('modprobe') || fullCmd.includes('modules-load'))) {
                return '/etc/modprobe.d/blacklist.conf\n/etc/modules-load.d/vigil.conf';
            }
            if (fullCmd.includes('/boot') && fullCmd.includes('System.map')) {
                return '/boot/System.map-5.4.0-vigilmod-amd64';
            }
            if (fullCmd.includes('/tmp')) {
                if (C16Config._lkmDumped) {
                    return '/tmp/whisperer.ko\n[/tmp/.w_cfg is hidden by hook — not returned by find]';
                }
                return '[/tmp/.w_cfg is hidden by hook — not returned by find]';
            }
            return 'find: ' + (args[0] || '.') + ': No results or permission denied.';
        },

        'diff': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('kallsyms') && fullCmd.includes('System.map')) {
                if (engine) engine.advancePhase && engine.advancePhase('detection');
                return `< ffffffffffffffff T sys_call_table     (from /proc/kallsyms — SANITIZED by rootkit)
---
> ffffffff81a01540 D sys_call_table     (from /boot/System.map — REAL address)

[!] DISCREPANCY DETECTED\n[!] /proc/kallsyms is reporting a sanitized/incorrect address for sys_call_table\n[!] This is a classic indicator of a kernel rootkit intercepting /proc reads\n[!] Real sys_call_table address: 0xffffffff81a01540\n[!] Entries at that address that have been patched:\n    [78] sys_getdents64  -> 0xffffffffc0841380 (hook)\n    [62] sys_kill        -> 0xffffffffc08414c0 (hook)\n    [45] sys_recvmsg     -> 0xffffffffc0841600 (hook)\n\n{{FLAG:detection}}`;
            }
            return 'Usage: diff <file1> <file2>\nExample: diff /proc/kallsyms /boot/System.map-$(uname -r)';
        },

        'grep': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (fullCmd.includes('kallsyms') && fullCmd.includes('sys_call_table')) {
                return 'ffffffffffffffff T sys_call_table\n\n[NOTE: Address is ffffffffffffffff — sanitized by rootkit hook on /proc/kallsyms reads]';
            }
            if (fullCmd.includes('System.map') && fullCmd.includes('sys_call_table')) {
                return 'ffffffff81a01540 D sys_call_table\n\n[Real address from kernel build symbol map — compare with /proc/kallsyms output]';
            }
            if (fullCmd.includes('dmesg') && (fullCmd.includes('module') || fullCmd.includes('hook') || fullCmd.includes('vigil'))) {
                return '[    2.810044] Loading module: [REDACTED BY MODULE]\n[    2.810299] [     ]: module loaded successfully\n[    2.810301] [     ]: syscall table hooks installed (3 entries)\n[    2.810303] [     ]: DKOM complete — module unlinked from lsmod chain\n[18059.001001] [     ]: analyst login detected — stealth mode elevated';
            }
            if (fullCmd.includes('syslog') && fullCmd.includes('udev')) {
                return '2026-03-20T00:00:05.000000+00:00 NODE-VIGIL-01 systemd[1]: Started udev Monitor Helper.\n\n[!] "udev Monitor Helper" is NOT a standard systemd service description.\n[!] Compare with the legitimate: "udev Kernel Device Manager" (systemd-udevd.service)';
            }
            if (fullCmd.includes('blacklist') && fullCmd.includes('whisperer')) {
                if (C16Config._blacklistApplied) {
                    return 'blacklist whisperer';
                }
                return '[No match — blacklist entry not yet added]';
            }
            if (fullCmd.includes('udevmon') || (fullCmd.includes('list-unit') && fullCmd.includes('enabled'))) {
                return 'systemd-udevmon.service        enabled         enabled';
            }
            // Generic passthrough for grep on file content
            return '(no output)';
        },

        'uname': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('-r')) return '5.4.0-vigilmod-amd64';
            if (fullCmd.includes('-a')) return 'Linux NODE-VIGIL-01 5.4.0-vigilmod-amd64 #1 SMP PREEMPT Fri Jan 10 08:00:00 UTC 2026 x86_64 x86_64 x86_64 GNU/Linux';
            return 'Linux';
        },

        'id': function(args, term, engine) {
            if (C16Config._context === 'root' || C16Config._rootEscalated) {
                return 'uid=0(root) gid=0(root) groups=0(root)';
            }
            return 'uid=1001(analyst) gid=1001(analyst) groups=1001(analyst),4(adm),27(sudo)';
        },

        'whoami': function(args, term, engine) {
            if (C16Config._context === 'root' || C16Config._rootEscalated) return 'root';
            return 'analyst';
        },

        'hostname': function(args, term, engine) {
            return 'NODE-VIGIL-01';
        },

        'pwd': function(args, term, engine) {
            if (C16Config._context === 'root') return '/root';
            return '/home/analyst';
        },

        'cd': function(args, term, engine) {
            return '';  // silently accept all cd commands
        },

        'exit': function(args, term, engine) {
            if (C16Config._context === 'root') {
                C16Config._switchContext('analyst', term);
                return '[+] Returned to analyst shell.';
            }
            return 'logout';
        },

        'ping': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '185.220.101.47') {
                return `PING 185.220.101.47 (185.220.101.47) 56(84) bytes of data.\n64 bytes from 185.220.101.47: icmp_seq=1 ttl=47 time=72.4 ms\n64 bytes from 185.220.101.47: icmp_seq=2 ttl=47 time=71.9 ms\n64 bytes from 185.220.101.47: icmp_seq=3 ttl=47 time=72.1 ms\n\n--- 185.220.101.47 ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss\nrtt min/avg/max/mdev = 71.9/72.1/72.4/0.205 ms\n\n[!] C2 server is reachable — rootkit has live C2 connectivity.`;
            }
            if (target === '127.0.0.1' || target === 'localhost') {
                return `PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.04 ms\n\n--- 127.0.0.1 ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('185.220.101.47')) {
                return 'curl: (60) SSL certificate problem: self signed certificate\n[!] HTTPS connection attempted to C2 server.\n[!] Use --insecure to bypass certificate check (not recommended in production IR).';
            }
            return 'curl: (7) Failed to connect to ' + (args.find(a => !a.startsWith('-')) || 'host') + ': Connection refused';
        },

        'journalctl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('udevmon') || fullCmd.includes('-u systemd-udevmon')) {
                return `-- Logs begin at Fri 2026-03-20 00:00:00 UTC --\nMar 20 00:00:04 NODE-VIGIL-01 systemd[1]: Starting udev Monitor Helper...\nMar 20 00:00:05 NODE-VIGIL-01 systemd[1]: Started udev Monitor Helper.\nMar 20 00:00:05 NODE-VIGIL-01 insmod[412]: Loading /lib/modules/5.4.0-vigilmod-amd64/kernel/drivers/misc/whisperer.ko\nMar 20 00:00:05 NODE-VIGIL-01 kernel: [     ]: module loaded successfully\nMar 20 00:00:05 NODE-VIGIL-01 systemd[1]: systemd-udevmon.service: Succeeded.`;
            }
            if (fullCmd.includes('-k') || fullCmd.includes('--dmesg')) {
                return C16Config.commands.dmesg([], term, engine);
            }
            if (fullCmd.includes('-b') || fullCmd.includes('--boot')) {
                return `-- Logs begin at Fri 2026-03-20 00:00:00 UTC, end at Fri 2026-03-20 03:47:22 UTC --\nMar 20 00:00:01 NODE-VIGIL-01 kernel: Linux version 5.4.0-vigilmod-amd64\nMar 20 00:00:04 NODE-VIGIL-01 systemd[1]: Starting udev Monitor Helper...\nMar 20 00:00:05 NODE-VIGIL-01 systemd[1]: Started udev Monitor Helper.\nMar 20 00:00:10 NODE-VIGIL-01 systemd[1]: Reached target Multi-User System.\nMar 20 03:47:01 NODE-VIGIL-01 sshd[8813]: Accepted publickey for analyst from 10.0.0.5`;
            }
            return 'Usage: journalctl [-k] [-b] [-u <unit>]\nExample: journalctl -u systemd-udevmon.service';
        },

        'whois': function(args, term, engine) {
            const target = args[0] || '';
            if (target.includes('185.220.101.47') || target === '185.220.101.47') {
                return `% WHOIS query for 185.220.101.47\n\ninetnum:        185.220.100.0 - 185.220.103.255\nnetname:        RELAYON-NET\ndescr:          Tor Exit Node / Privacy VPN Relay\ncountry:        DE\norg:            ORG-RN-01\n\n[INFO] 185.220.101.47 is a known Tor exit node / relay.\n[INFO] C2 traffic over Tor exit nodes is a common evasion technique.`;
            }
            return 'whois: ' + target + ': No information available.';
        },

        'nmap': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (target.includes('185.220.101.47')) {
                return `Starting Nmap 7.94 ( https://nmap.org )\nNmap scan report for 185.220.101.47\nHost is up (0.072s latency).\n\nPORT     STATE SERVICE  VERSION\n4443/tcp open  ssl/http unknown\n| ssl-cert: Not valid before: 2026-01-01\n|           Not valid after:  2027-01-01\n|           Subject: CN=*.cloudflare.com (self-signed spoofed cert)\n\nService detection performed.\nNmap done: 1 IP address (1 host up) scanned in 18.34 seconds\n\n[!] Port 4443 open — HTTPS with self-signed certificate. C2 channel confirmed.`;
            }
            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )\nNmap scan report for localhost (127.0.0.1)\nHost is up (0.00011s latency).\n\nPORT     STATE SERVICE\n22/tcp   open  ssh\n8080/tcp open  http-proxy\n\nNmap done: 1 IP address (1 host up) scanned in 0.09 seconds`;
            }
            return `Starting Nmap 7.94 ( https://nmap.org )\nNote: Host seems down. If it is really up, try -Pn.\nNmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        }
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
