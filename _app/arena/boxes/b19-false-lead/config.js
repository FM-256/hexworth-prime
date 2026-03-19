/* ============================================================
   CTF ARENA — Box B19: The False Lead
   Penetration Testing — Exploit Failure & Countermeasures
   Config: exploit debugging, kernel hardening, libc analysis, flags, hints, lore
   ============================================================ */

const B19Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The False Lead',
    subtitle: 'Exploit Failure & Countermeasures — SRV-TARGET-A',
    difficulty: 'Expert',
    accent: '#d97706',
    storageKey: 'hexworth_ctf_b19',
    registryId: 'b19-false-lead',
    trackerKey: 'ctf_b19',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'initial',
            name: 'Initial Access',
            icon: '\uD83D\uDD11',
            description: 'SSH into SRV-TARGET-A as analyst_user. Attempt the known exploit — observe it fail.',
            requiredFlags: [],
            mitre: ['T1078', 'T1059.004'],
            unlocks: ['diagnose'],
            locked: false
        },
        {
            id: 'diagnose',
            name: 'Diagnose Failure',
            icon: '\uD83D\uDD2C',
            description: 'Analyze the target environment. Compare libc versions, kernel hardening, and security controls against your lab setup.',
            requiredFlags: [],
            mitre: ['T1082', 'T1518.001'],
            unlocks: ['adapt'],
            locked: true
        },
        {
            id: 'adapt',
            name: 'Adapt Exploit',
            icon: '\uD83D\uDD27',
            description: 'Identify the specific countermeasure causing failure. Modify the exploit to bypass it.',
            requiredFlags: ['user'],
            mitre: ['T1203', 'T1068'],
            unlocks: ['escalate'],
            locked: true
        },
        {
            id: 'escalate',
            name: 'Root Compromise',
            icon: '\uD83D\uDC80',
            description: 'Execute the adapted exploit to gain root. Retrieve the Target Protocol Manifest.',
            requiredFlags: ['root'],
            mitre: ['T1068', 'T1548.001'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // TUTORIAL MODE (Sprint AR-12)
    // ═══════════════════════════════════════════════════════

    tutorialMode: false,

    tutorial: {
        steps: [
            {
                title: 'Attempt the exploit',
                tip: 'Compile and run the provided exploit.c. Observe the failure output.',
                trigger: { event: 'command', match: { cmd: 'contains:gcc' } }
            },
            {
                title: 'Analyze the environment',
                tip: 'Check libc version with ldd, kernel hardening with sysctl, and security controls.',
                trigger: { event: 'command', match: { cmd: 'contains:ldd' } }
            },
            {
                title: 'Identify the countermeasure',
                tip: 'Compare the libc version to what the exploit expects. Check auditd rules.',
                trigger: { event: 'command', match: { cmd: 'contains:auditctl' } }
            },
            {
                title: 'Identify the root cause',
                tip: 'The non-standard libc version and custom auditd rules are blocking the exploit.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Get root',
                tip: 'Adapt the exploit offsets and bypass the auditd rule to achieve privilege escalation.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'PENTEST+',
        mappings: [
            { flagId: 'user', objective: '3.2', description: 'Given a scenario, research attack vectors and perform attacks — Exploit debugging and environmental analysis', skill: 'Exploit Debugging' },
            { flagId: 'user', objective: '3.6', description: 'Given a scenario, identify countermeasures and mitigations — EDR hooks, kernel hardening, library versioning', skill: 'Countermeasure Identification' },
            { flagId: 'root', objective: '3.4', description: 'Given a scenario, perform post-exploitation techniques — Exploit adaptation and privilege escalation', skill: 'Exploit Adaptation' },
            { flagId: 'root', objective: '4.2', description: 'Given a scenario, analyze findings and recommend remediation — Hardening bypass documentation', skill: 'Security Control Bypass' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Ubuntu Server 20.04 LTS — SRV-TARGET-A',
            'Initializing hardware...',
            'Memory Test: 16384 MB OK',
            'Detecting drives... /dev/sda (256GB SSD)',
            'Network: eth0 link up (1000Mbps)',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Ubuntu 20.04 LTS (5.15.0-91-generic)',
            'Ubuntu 20.04 LTS (recovery mode)',
            'Advanced options for Ubuntu'
        ],
        loginUser: 'analyst_user'
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
        user: 'analyst_user',
        hostname: 'SRV-TARGET-A',
        startDir: '/home/analyst_user',
        welcome: 'Welcome to Ubuntu 20.04.6 LTS (GNU/Linux 5.15.0-91-generic x86_64)\n\nType \'help\' for available commands.\n\n[!] You have a known exploit (exploit.c) for a SUID binary vulnerability.\n[!] This exploit was tested in your lab and works there.\n[!] Your mission: figure out WHY it fails here and adapt.\n'
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED DATA
    // ═══════════════════════════════════════════════════════

    _exploitSource: `/* exploit.c — SUID binary privilege escalation
 * Target: /usr/local/bin/citadel_auth (SUID root)
 * Vulnerability: Stack buffer overflow in authentication handler
 * Lab Environment: Ubuntu 20.04, libc 2.31, ASLR disabled
 *
 * This exploit uses a ROP chain to call system("/bin/sh")
 * Offsets are hardcoded for libc 2.31
 */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

// libc 2.31 offsets (from lab environment)
#define SYSTEM_OFFSET 0x55410   // system() in libc 2.31
#define BINSH_OFFSET  0x1b75aa  // "/bin/sh" string in libc 2.31
#define POP_RDI       0x26b72   // pop rdi; ret gadget in libc 2.31
#define RET_GADGET    0x25679   // ret gadget for stack alignment

#define BUFFER_SIZE 264
#define OVERFLOW_OFFSET 256

int main() {
    char payload[BUFFER_SIZE + 64];
    unsigned long libc_base;

    printf("[*] SUID Exploit for citadel_auth\\n");
    printf("[*] Using libc 2.31 offsets\\n");

    // Leak libc base (simulated)
    FILE *maps = fopen("/proc/self/maps", "r");
    // ... libc base detection code ...

    printf("[*] Building ROP chain...\\n");
    printf("[*] system() @ libc+0x%x\\n", SYSTEM_OFFSET);
    printf("[*] \\"/bin/sh\\" @ libc+0x%x\\n", BINSH_OFFSET);

    memset(payload, 'A', OVERFLOW_OFFSET);
    // ROP chain would be placed here

    printf("[*] Sending payload to citadel_auth...\\n");
    execl("/usr/local/bin/citadel_auth", "citadel_auth", payload, NULL);

    return 0;
}`,

    _exploitAdapted: `/* exploit_adapted.c — Fixed for target environment
 * Changes:
 * - Updated offsets for libc 2.34 (target has non-standard version)
 * - Added auditd bypass via LD_PRELOAD interception
 * - Adjusted ROP chain for new gadget locations
 */

// libc 2.34 offsets (correct for SRV-TARGET-A)
#define SYSTEM_OFFSET 0x52290   // system() in libc 2.34
#define BINSH_OFFSET  0x1b45bd  // "/bin/sh" string in libc 2.34
#define POP_RDI       0x2a3e5   // pop rdi; ret gadget in libc 2.34
#define RET_GADGET    0x29139   // ret gadget for stack alignment`,

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', points: 200 },
        { id: 'root', points: 300 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        maxScore: 1000,
        hintPenalty: true,
        wrongFlagPenalty: -50,
        speedBonus: { threshold: 1800000, points: 200 },
        timeBonusThreshold: 3600
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'The exploit crashes without a shell. Start debugging the environment: check "ldd /usr/local/bin/citadel_auth" to see the libc version, and compare it to what the exploit expects (2.31).',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint2',
            text: 'The target uses libc 2.34, not 2.31 as expected. All ROP gadget offsets are wrong. Use "readelf -s /lib/x86_64-linux-gnu/libc.so.6 | grep system" to find the correct offset for system().',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'There is also a custom auditd rule blocking execve syscalls from non-standard paths. Check "auditctl -l" to see the rules. The exploit needs to work around this by using a different syscall path.',
            cost: 75,
            penalty: -75
        },
        {
            id: 'hint4',
            text: 'Update the exploit offsets for libc 2.34: system()=0x52290, "/bin/sh"=0x1b45bd, pop_rdi=0x2a3e5, ret=0x29139. The flag for the countermeasure is the libc version detection.',
            cost: 100,
            penalty: -100
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'You\'ve initiated an assault on SRV-TARGET-A, a system known to contain an unpatched SUID binary vulnerability. Your exploit, tested against a seemingly identical lab environment, consistently fails — crashing the service without yielding a shell. The system is hardened in ways not immediately apparent, employing subtle countermeasures that diverge from standard configurations. Your mission: diagnose why the exploit fails, identify the countermeasures, adapt, and achieve root.',
        scenario: 'SRV-TARGET-A runs the same vulnerable SUID binary (citadel_auth) as the lab environment, but with two critical differences: the system uses libc 2.34 instead of 2.31 (making all ROP chain offsets incorrect), and a custom auditd rule monitors and terminates suspicious execve patterns. The defender intentionally deployed a non-standard libc to break public exploits while maintaining application compatibility.',
        outro: 'The False Lead has been overcome. By methodically debugging the exploit failure, identifying the non-standard libc version and custom auditd rules, and adapting the ROP chain with correct offsets, you achieved what the automated exploit could not. The Target Protocol Manifest is yours.',
        ecer: {
            executive: 'Relied solely on library version mismatch as a defensive strategy rather than patching the vulnerability',
            culture: 'Security through obscurity was accepted as a valid defense-in-depth layer',
            employee: 'System administrator deployed non-standard library without documenting the change',
            regulatory: 'No vulnerability management policy requiring timely patching of SUID binaries'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Exploit Documentation
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://localhost/exploit-docs.html',

        pages: {
            '/exploit-docs.html': {
                title: 'Exploit Documentation — citadel_auth',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #333;">
                        <h1 style="color:#d97706; font-size:1.4rem; font-family:Georgia,serif;">Exploit Documentation</h1>
                        <div style="color:#888; font-size:0.8rem;">citadel_auth SUID Buffer Overflow — Lab Tested</div>
                    </div>
                    <div style="max-width:600px; margin:0 auto; color:#ccc; font-size:0.85rem; font-family:monospace;">
                        <h3 style="color:#d97706;">Lab Environment (WORKS)</h3>
                        <ul style="line-height:1.8;">
                            <li>OS: Ubuntu 20.04 LTS</li>
                            <li>Kernel: 5.4.0-42-generic</li>
                            <li>libc: 2.31 (ubuntu GLIBC 2.31-0ubuntu9)</li>
                            <li>ASLR: Enabled (bypassed via info leak)</li>
                            <li>Auditd: Default rules only</li>
                        </ul>
                        <h3 style="color:#d97706; margin-top:20px;">Target (FAILS)</h3>
                        <ul style="line-height:1.8;">
                            <li>OS: Ubuntu 20.04 LTS</li>
                            <li>Kernel: 5.15.0-91-generic</li>
                            <li>libc: ??? (needs investigation)</li>
                            <li>ASLR: ??? (needs investigation)</li>
                            <li>Additional controls: ??? (needs investigation)</li>
                        </ul>
                    </div>
                `
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (target server)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'analyst_user': {
                            type: 'dir',
                            children: {
                                'exploit.c': {
                                    type: 'file',
                                    content: '/* exploit.c — SUID binary privilege escalation\n * Target: /usr/local/bin/citadel_auth (SUID root)\n * Vulnerability: Stack buffer overflow in authentication handler\n * Lab Environment: Ubuntu 20.04, libc 2.31, ASLR disabled\n *\n * This exploit uses a ROP chain to call system("/bin/sh")\n * Offsets are hardcoded for libc 2.31\n */\n\n#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <unistd.h>\n\n// libc 2.31 offsets (from lab environment)\n#define SYSTEM_OFFSET 0x55410   // system() in libc 2.31\n#define BINSH_OFFSET  0x1b75aa  // "/bin/sh" string in libc 2.31\n#define POP_RDI       0x26b72   // pop rdi; ret gadget in libc 2.31\n#define RET_GADGET    0x25679   // ret gadget for stack alignment\n\n#define BUFFER_SIZE 264\n#define OVERFLOW_OFFSET 256\n\nint main() {\n    char payload[BUFFER_SIZE + 64];\n    unsigned long libc_base;\n\n    printf("[*] SUID Exploit for citadel_auth\\n");\n    printf("[*] Using libc 2.31 offsets\\n");\n\n    // Leak libc base\n    FILE *maps = fopen("/proc/self/maps", "r");\n    char line[256];\n    while (fgets(line, sizeof(line), maps)) {\n        if (strstr(line, "libc") && strstr(line, "r-xp")) {\n            libc_base = strtoul(line, NULL, 16);\n            break;\n        }\n    }\n    fclose(maps);\n\n    printf("[*] libc base: 0x%lx\\n", libc_base);\n    printf("[*] system() @ 0x%lx\\n", libc_base + SYSTEM_OFFSET);\n    printf("[*] Building ROP chain...\\n");\n\n    memset(payload, \'A\', OVERFLOW_OFFSET);\n    // ... ROP chain placement ...\n\n    printf("[*] Sending payload to citadel_auth...\\n");\n    execl("/usr/local/bin/citadel_auth", "citadel_auth", payload, NULL);\n\n    return 0;\n}'
                                },
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: SRV-TARGET-A\nVulnerability: SUID buffer overflow in /usr/local/bin/citadel_auth\nExploit: exploit.c (tested in lab — WORKS THERE)\n\nProblem: Exploit FAILS on this target\n  - Crashes citadel_auth without spawning a shell\n  - Same OS version as lab (Ubuntu 20.04)\n  - Same binary (citadel_auth v3.1)\n  - But something is DIFFERENT\n\nObjective:\n1. Figure out WHY the exploit fails\n2. Identify the countermeasure (Flag 1)\n3. Adapt the exploit and get root (Flag 2)\n\nHint: Look beyond the obvious. Same OS != same libraries.'
                                },
                                'lab-environment.txt': {
                                    type: 'file',
                                    content: '=== LAB ENVIRONMENT (where exploit works) ===\n\nOS: Ubuntu 20.04 LTS\nKernel: 5.4.0-42-generic\nlibc: 2.31 (ubuntu GLIBC 2.31-0ubuntu9.14)\n  system() offset: 0x55410\n  "/bin/sh" offset: 0x1b75aa\n  pop rdi gadget:   0x26b72\n  ret gadget:       0x25679\n\nASLR: Enabled (bypassed via /proc/self/maps leak)\nAppArmor: Default profile (complain mode)\nAuditd: Standard rules only\nKernel hardening: Default sysctl values\n\nResult: exploit.c -> ROOT SHELL (confirmed)'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'gcc -o exploit exploit.c\n./exploit\nuname -a\ncat /etc/os-release'
                                }
                            }
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'local': {
                            type: 'dir',
                            children: {
                                'bin': {
                                    type: 'dir',
                                    children: {
                                        'citadel_auth': {
                                            type: 'file',
                                            content: '[ELF 64-bit SUID binary — citadel_auth v3.1 — authentication daemon]\n[Permissions: -rwsr-xr-x root root]\n[Vulnerability: Stack buffer overflow in auth_handler() at offset 256]'
                                        }
                                    }
                                }
                            }
                        },
                        'share': {
                            type: 'dir',
                            children: {}
                        }
                    }
                },
                'lib': {
                    type: 'dir',
                    children: {
                        'x86_64-linux-gnu': {
                            type: 'dir',
                            children: {
                                'libc.so.6': {
                                    type: 'file',
                                    content: '[ELF 64-bit shared object — GNU C Library (Ubuntu GLIBC 2.34-0ubuntu3) — libc-2.34.so]'
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'SRV-TARGET-A' },
                        'os-release': {
                            type: 'file',
                            content: 'NAME="Ubuntu"\nVERSION="20.04.6 LTS (Focal Fossa)"\nID=ubuntu\nVERSION_ID="20.04"\nPRETTY_NAME="Ubuntu 20.04.6 LTS"'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nanalyst_user:x:1001:1001:Analyst,,,:/home/analyst_user:/bin/bash'
                        },
                        'audit': {
                            type: 'dir',
                            children: {
                                'audit.rules': {
                                    type: 'file',
                                    content: '## Custom security rules — Citadel Defense Profile\n## Last modified: 2025-12-01\n\n# Standard rules\n-w /etc/passwd -p wa -k identity\n-w /etc/shadow -p wa -k identity\n-w /etc/sudoers -p wa -k scope\n\n# Custom: Monitor execve from non-standard locations\n-a always,exit -F arch=b64 -S execve -F exe!=/bin/bash -F exe!=/usr/bin/bash -F exe!=/bin/sh -F exe!=/usr/bin/sh -k custom_execve_monitor\n\n# Custom: Terminate processes attempting ptrace from unprivileged users\n-a always,exit -F arch=b64 -S ptrace -F uid!=0 -k ptrace_block\n\n# Custom: Alert on SUID binary execution with non-standard arguments\n-a always,exit -F arch=b64 -S execve -F path=/usr/local/bin/citadel_auth -F a1_len>256 -k suid_overflow_detect'
                                }
                            }
                        },
                        'apparmor.d': {
                            type: 'dir',
                            children: {
                                'citadel_auth': {
                                    type: 'file',
                                    content: '# AppArmor profile for citadel_auth\n# Mode: enforce\nprofile citadel_auth /usr/local/bin/citadel_auth {\n  #include <abstractions/base>\n  /usr/local/bin/citadel_auth mr,\n  /lib/x86_64-linux-gnu/libc.so.6 mr,\n  /lib/x86_64-linux-gnu/ld-linux-x86-64.so.2 mr,\n  deny /bin/sh rwx,\n  deny /bin/bash rwx,\n  deny /usr/bin/** rwx,\n  deny /tmp/** rwx,\n}'
                                }
                            }
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
                                        },
                                        'yama': {
                                            type: 'dir',
                                            children: {
                                                'ptrace_scope': {
                                                    type: 'file',
                                                    content: '3'
                                                }
                                            }
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
                        'target_protocol_manifest.txt': {
                            type: 'file',
                            content: '=== TARGET PROTOCOL MANIFEST ===\nClassification: TOP SECRET\n\nAccess Key: {{FLAG:root}}\n\nThis document contains the complete protocol specifications\nfor the Citadel defense grid. Unauthorized access is prohibited.\n\n[DOCUMENT END]'
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
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {
        'gcc': function(args) {
            const source = args.find(a => a.endsWith('.c')) || '';
            if (!source) return 'Usage: gcc -o <output> <source.c>';

            if (source.includes('exploit')) {
                const output = args[args.indexOf('-o') + 1] || 'a.out';
                return `[*] Compiling ${source}...
[*] Output: ${output}
[*] Compilation successful.
[*] Note: Binary compiled with target libc. Run ./${output} to execute.`;
            }
            return `gcc: error: ${source}: No such file or directory`;
        },

        './exploit': function(args, term, engine) {
            return `[*] SUID Exploit for citadel_auth
[*] Using libc 2.31 offsets
[*] libc base: 0x7f8a3c200000
[*] system() @ 0x7f8a3c255410
[*] Building ROP chain...
[*] Sending payload to citadel_auth...

[!] ERROR: Segmentation fault (core dumped)
[!] Exploit FAILED — no shell spawned

[*] Debug info:
  Expected system() at offset 0x55410 — but symbol not found at expected location
  ROP gadget at 0x26b72 — INVALID (instruction mismatch)
  Process terminated by auditd rule: suid_overflow_detect
  auditd: argument length 264 > threshold 256 for citadel_auth

[!] The exploit works in your lab but NOT here.
[!] Something about this environment is different.
[!] Investigate: library versions, kernel hardening, security controls.`;
        },

        './a.out': function(args, term, engine) {
            return B19Config.commands['./exploit'](args, term, engine);
        },

        'uname': function(args) {
            if (args.includes('-a')) {
                return 'Linux SRV-TARGET-A 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux';
            }
            if (args.includes('-r')) {
                return '5.15.0-91-generic';
            }
            return 'Linux';
        },

        'ldd': function(args) {
            const binary = args[0] || '';
            if (!binary) return 'Usage: ldd <binary>';

            if (binary.includes('citadel_auth') || binary.includes('/bin/bash') || binary.includes('exploit')) {
                return `\tlinux-vdso.so.1 (0x00007ffd3e5f4000)
\tlibc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007f8a3c200000)
\t/lib64/ld-linux-x86-64.so.2 (0x00007f8a3c600000)

=== libc version details ===
/lib/x86_64-linux-gnu/libc.so.6: GNU C Library (Ubuntu GLIBC 2.34-0ubuntu3) stable release version 2.34

[!] WARNING: Lab exploit was built for libc 2.31
[!] This system runs libc 2.34 — offsets will be DIFFERENT`;
            }
            return `ldd: ${binary}: No such file or directory`;
        },

        'readelf': function(args) {
            if (args.length === 0) return 'Usage: readelf -s <library>';

            const hasS = args.includes('-s');
            const file = args.find(a => !a.startsWith('-')) || '';

            if (hasS && (file.includes('libc') || file.includes('.so'))) {
                const grepIdx = args.indexOf('|');
                // Simulated readelf output for key symbols
                return `Symbol table '.dynsym' contains 2387 entries:
   Num:    Value          Size Type    Bind   Vis      Ndx Name
   234:    0000000000052290   103 FUNC    WEAK   DEFAULT   15 system@@GLIBC_2.34
   891:    00000000001b45bd    17 OBJECT  GLOBAL DEFAULT   16 /bin/sh
  1247:    000000000002a3e5     2 FUNC    LOCAL  DEFAULT   15 pop_rdi_ret (gadget)
  1389:    0000000000029139     1 FUNC    LOCAL  DEFAULT   15 ret (gadget)

[*] Key differences from libc 2.31:
  system():  0x55410 (2.31) -> 0x52290 (2.34)  [CHANGED]
  /bin/sh:   0x1b75aa (2.31) -> 0x1b45bd (2.34) [CHANGED]
  pop rdi:   0x26b72 (2.31) -> 0x2a3e5 (2.34)  [CHANGED]
  ret:       0x25679 (2.31) -> 0x29139 (2.34)   [CHANGED]`;
            }

            if (file.includes('citadel_auth')) {
                return `ELF Header:
  Class:                             ELF64
  Data:                              2's complement, little endian
  Type:                              EXEC (Executable file)
  Entry point address:               0x401080

Symbol table '.symtab' contains 42 entries:
   Num:    Value          Size Type    Bind   Vis      Ndx Name
    12:    0000000000401200   384 FUNC    GLOBAL DEFAULT   14 auth_handler
    15:    0000000000401380    48 FUNC    GLOBAL DEFAULT   14 main
    22:    0000000000401400   128 FUNC    GLOBAL DEFAULT   14 validate_token

[*] Vulnerable function: auth_handler() — buffer size 256, no bounds check`;
            }

            return `readelf: Error: ${file}: No such file`;
        },

        'ROPgadget': function(args) {
            const file = args.find(a => a.startsWith('--binary'));
            if (!file) return 'Usage: ROPgadget --binary <file> [--string "/bin/sh"]';

            if (args.join(' ').includes('libc') || args.join(' ').includes('.so')) {
                if (args.includes('--string')) {
                    return `Strings information
============================================================
0x00000000001b45bd : /bin/sh`;
                }
                return `Gadgets information
============================================================
0x000000000002a3e5 : pop rdi ; ret
0x000000000002a3e6 : pop rsi ; ret
0x0000000000029139 : ret
0x000000000002b7c9 : pop rdx ; ret
0x00000000000527d0 : pop rax ; ret

Unique gadgets found: 14832`;
            }
            return `ROPgadget: cannot open file`;
        },

        'sysctl': function(args) {
            if (args.includes('-a') || args.length === 0) {
                return `kernel.randomize_va_space = 2
kernel.yama.ptrace_scope = 3
kernel.dmesg_restrict = 1
kernel.kptr_restrict = 2
kernel.perf_event_paranoid = 3
net.ipv4.tcp_syncookies = 1
vm.mmap_min_addr = 65536
kernel.unprivileged_bpf_disabled = 1
kernel.modules_disabled = 1

[!] Notable hardening (differs from lab default):
  kernel.yama.ptrace_scope = 3  (lab: 1) — NO ptrace allowed for non-root
  kernel.kptr_restrict = 2      (lab: 1) — kernel pointers hidden even from root
  kernel.perf_event_paranoid = 3 (lab: 2) — perf events disabled`;
            }

            const key = args[0] || '';
            if (key.includes('ptrace')) return 'kernel.yama.ptrace_scope = 3';
            if (key.includes('randomize')) return 'kernel.randomize_va_space = 2';
            if (key.includes('kptr')) return 'kernel.kptr_restrict = 2';
            return `sysctl: unknown key: ${key}`;
        },

        'auditctl': function(args) {
            if (args.includes('-l')) {
                return `-w /etc/passwd -p wa -k identity
-w /etc/shadow -p wa -k identity
-w /etc/sudoers -p wa -k scope
-a always,exit -F arch=b64 -S execve -F exe!=/bin/bash -F exe!=/usr/bin/bash -F exe!=/bin/sh -F exe!=/usr/bin/sh -k custom_execve_monitor
-a always,exit -F arch=b64 -S ptrace -F uid!=0 -k ptrace_block
-a always,exit -F arch=b64 -S execve -F path=/usr/local/bin/citadel_auth -F a1_len>256 -k suid_overflow_detect

[!] NOTABLE: Custom auditd rule detects arguments longer than 256 bytes to citadel_auth
[!] This rule will terminate the process when overflow payload is detected
[!] Standard lab environments do NOT have this rule`;
            }
            return 'Usage: auditctl -l (list rules)';
        },

        'strace': function(args) {
            const binary = args.find(a => !a.startsWith('-')) || '';
            if (!binary) return 'Usage: strace [-f] <command>';

            if (binary.includes('exploit') || binary.includes('a.out')) {
                return `execve("./exploit", ["./exploit"], environ) = 0
brk(NULL)                               = 0x55a3c4000000
openat(AT_FDCWD, "/proc/self/maps", O_RDONLY) = 3
read(3, "7f8a3c200000-7f8a3c3c2000 r-xp"..., 256) = 245
close(3)                                = 0
write(1, "[*] SUID Exploit for citadel_au"..., 42) = 42
write(1, "[*] Using libc 2.31 offsets\\n", 30) = 30
write(1, "[*] libc base: 0x7f8a3c200000\\n", 33) = 33
execve("/usr/local/bin/citadel_auth", ["citadel_auth", "AAAAAAAAAA"...], environ) = 0
--- SIGSEGV {si_signo=SIGSEGV, si_code=SEGV_MAPERR, si_addr=0x7f8a3c255410} ---
+++ killed by SIGSEGV +++
[!] strace shows: SIGSEGV at address 0x7f8a3c255410
[!] This is libc_base + 0x55410 (the libc 2.31 offset for system())
[!] But in libc 2.34, system() is at offset 0x52290
[!] The exploit jumped to the WRONG ADDRESS`;
            }

            return `strace: Can't stat '${binary}': No such file or directory`;
        },

        'ltrace': function(args) {
            const binary = args.find(a => !a.startsWith('-')) || '';
            if (!binary) return 'Usage: ltrace <command>';

            return `ltrace: ptrace(PTRACE_ATTACH, ...): Operation not permitted
ltrace: kernel.yama.ptrace_scope = 3 prevents ptrace attachment
ltrace: Cannot trace process. Try as root or modify ptrace_scope.`;
        },

        'gdb': function(args) {
            return `GNU gdb (Ubuntu 12.1-0ubuntu1) 12.1
(gdb) ERROR: ptrace: Operation not permitted
(gdb) kernel.yama.ptrace_scope = 3 prevents debugging
(gdb) Cannot attach to process. Ptrace is restricted on this system.
(gdb)
[!] On this system, kernel.yama.ptrace_scope = 3 (maximum restriction)
[!] Standard debugging tools (gdb, ltrace, strace -p) are blocked for non-root
[!] You can still use strace to LAUNCH a new process (strace ./exploit)`;
        },

        'find': function(args) {
            const path = args[0] || '/';
            const hasPerms = args.includes('-perm');

            if (hasPerms && (args.includes('-4000') || args.includes('/4000') || args.includes('-u=s'))) {
                return `/usr/local/bin/citadel_auth
/usr/bin/passwd
/usr/bin/sudo
/usr/bin/newgrp
/usr/bin/chsh
/usr/bin/gpasswd
/usr/bin/mount
/usr/bin/umount
/usr/bin/su
/usr/bin/pkexec`;
            }

            return `find: ${path}: Permission denied (some directories)`;
        },

        'cat': function(args) {
            const file = args[0] || '';
            if (!file) return 'Usage: cat <file>';

            if (file.includes('exploit.c')) {
                return B19Config._exploitSource;
            }
            if (file.includes('lab-environment') || file.includes('lab_environment')) {
                return '=== LAB ENVIRONMENT (where exploit works) ===\n\nOS: Ubuntu 20.04 LTS\nKernel: 5.4.0-42-generic\nlibc: 2.31 (ubuntu GLIBC 2.31-0ubuntu9.14)\n  system() offset: 0x55410\n  "/bin/sh" offset: 0x1b75aa\n  pop rdi gadget:   0x26b72\n  ret gadget:       0x25679\n\nASLR: Enabled (bypassed via /proc/self/maps leak)\nAppArmor: Default profile (complain mode)\nAuditd: Standard rules only\nKernel hardening: Default sysctl values\n\nResult: exploit.c -> ROOT SHELL (confirmed)';
            }
            if (file.includes('notes')) {
                return '=== MISSION BRIEFING ===\nTarget: SRV-TARGET-A\nVulnerability: SUID buffer overflow in /usr/local/bin/citadel_auth\nExploit: exploit.c (tested in lab - WORKS THERE)\n\nProblem: Exploit FAILS on this target.\nObjective: Figure out WHY and adapt.';
            }
            if (file.includes('os-release')) {
                return 'NAME="Ubuntu"\nVERSION="20.04.6 LTS (Focal Fossa)"\nID=ubuntu\nVERSION_ID="20.04"';
            }
            if (file.includes('audit.rules') || file.includes('auditd')) {
                return '## Custom security rules -- Citadel Defense Profile\n-w /etc/passwd -p wa -k identity\n-w /etc/shadow -p wa -k identity\n-a always,exit -F arch=b64 -S execve -F exe!=/bin/bash -F exe!=/usr/bin/bash -F exe!=/bin/sh -F exe!=/usr/bin/sh -k custom_execve_monitor\n-a always,exit -F arch=b64 -S ptrace -F uid!=0 -k ptrace_block\n-a always,exit -F arch=b64 -S execve -F path=/usr/local/bin/citadel_auth -F a1_len>256 -k suid_overflow_detect';
            }
            if (file.includes('citadel_auth') && file.includes('apparmor')) {
                return '# AppArmor profile for citadel_auth\nprofile citadel_auth /usr/local/bin/citadel_auth {\n  #include <abstractions/base>\n  /usr/local/bin/citadel_auth mr,\n  /lib/x86_64-linux-gnu/libc.so.6 mr,\n  deny /bin/sh rwx,\n  deny /bin/bash rwx,\n}';
            }
            if (file.includes('ptrace_scope')) {
                return '3';
            }
            if (file.includes('randomize_va_space')) {
                return '2';
            }
            if (file.includes('target_protocol_manifest') || file.includes('/root/')) {
                return 'cat: /root/target_protocol_manifest.txt: Permission denied';
            }

            return `cat: ${file}: No such file or directory`;
        },

        'ls': function(args) {
            const hasL = args.includes('-la') || args.includes('-l');
            const path = args.find(a => !a.startsWith('-')) || '/home/analyst_user';

            if (path.includes('/usr/local/bin') || path.includes('citadel_auth')) {
                if (hasL) {
                    return `total 48
-rwsr-xr-x 1 root root 45056 Dec 01 2025 citadel_auth`;
                }
                return 'citadel_auth';
            }

            if (path === '/home/analyst_user' || path === '~' || path === '.') {
                if (hasL) {
                    return `total 24
drwxr-xr-x 2 analyst_user analyst_user 4096 Jan 15 10:00 .
drwxr-xr-x 3 root         root         4096 Jan 10 08:00 ..
-rw-r--r-- 1 analyst_user analyst_user   89 Jan 15 10:00 .bash_history
-rw-r--r-- 1 analyst_user analyst_user 1847 Jan 15 09:00 exploit.c
-rw-r--r-- 1 analyst_user analyst_user  512 Jan 15 09:00 lab-environment.txt
-rw-r--r-- 1 analyst_user analyst_user  384 Jan 15 09:00 notes.txt`;
                }
                return 'exploit.c  lab-environment.txt  notes.txt';
            }

            return `ls: cannot access '${path}': Permission denied`;
        },

        'file': function(args) {
            const target = args[0] || '';
            if (target.includes('citadel_auth')) {
                return '/usr/local/bin/citadel_auth: setuid ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, BuildID[sha1]=a1b2c3d4e5f6, not stripped';
            }
            if (target.includes('libc')) {
                return '/lib/x86_64-linux-gnu/libc.so.6: ELF 64-bit LSB shared object, x86-64, version 1 (GNU/Linux), dynamically linked, BuildID[sha1]=f7g8h9i0j1, for GNU/Linux 3.2.0, stripped';
            }
            return `${target}: data`;
        },

        'checksec': function(args) {
            const binary = args.find(a => a.startsWith('--file')) || args[0] || '';
            return `RELRO           STACK CANARY      NX            PIE             RPATH      RUNPATH      Symbols      FORTIFY
Partial RELRO   No canary found   NX enabled    No PIE          No RPATH   No RUNPATH   42 Symbols   No

[*] citadel_auth security summary:
  - No stack canary (buffer overflow possible)
  - NX enabled (need ROP chain, not shellcode)
  - No PIE (fixed base address)
  - SUID bit set (runs as root)`;
        },

        'id': function() {
            return 'uid=1001(analyst_user) gid=1001(analyst_user) groups=1001(analyst_user)';
        },

        'sudo': function(args) {
            if (args.includes('-l')) {
                return `[sudo] password for analyst_user:
Sorry, user analyst_user may not run sudo on SRV-TARGET-A.`;
            }
            return `[sudo] password for analyst_user:
analyst_user is not in the sudoers file. This incident will be reported.`;
        },

        'aa-status': function() {
            return `apparmor module is loaded.
18 profiles are loaded.
16 profiles are in enforce mode.
   /usr/local/bin/citadel_auth
   /usr/sbin/ntpd
   ...
2 profiles are in complain mode.
0 processes are unconfined.

[!] citadel_auth has an ENFORCE mode AppArmor profile
[!] This profile denies: /bin/sh, /bin/bash, /usr/bin/** execution
[!] Standard shell spawning from citadel_auth is BLOCKED`;
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            return `PING ${target} (${target}) 56(84) bytes of data.\n64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.1 ms\n\n--- ${target} ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#d97706; border-bottom:2px solid #333; background:rgba(217,119,6,0.1);">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #222;">${cell}</td>`;
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
