/* ============================================================
   CTF ARENA — Box REV-02: The Logic Gate
   Reverse Engineering | Disassembly & Control Flow
   Config: binary analysis, password check, flags, hints, lore
   ============================================================ */

const Rev02Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Logic Gate',
    subtitle: 'Reverse Engineering — Disassembly & Control Flow',
    difficulty: 'Intermediate',
    accent: '#a855f7',
    storageKey: 'hexworth_ctf_rev02',
    registryId: 'rev-02-disassembly',
    trackerKey: 'ctf_rev02',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Initial Analysis',
            icon: '\uD83D\uDD0D',
            description: 'Run the binary and observe its behavior. Identify the password check mechanism.',
            requiredFlags: [],
            mitre: ['T1027', 'T1059'],
            unlocks: ['disassembly'],
            locked: false
        },
        {
            id: 'disassembly',
            name: 'Disassembly',
            icon: '\u2699\uFE0F',
            description: 'Disassemble the binary to understand the password comparison logic.',
            requiredFlags: [],
            mitre: ['T1027.002', 'T1140'],
            unlocks: ['bypass'],
            locked: true
        },
        {
            id: 'bypass',
            name: 'Password Bypass',
            icon: '\uD83D\uDD13',
            description: 'Derive the correct password from the assembly logic and gain user access.',
            requiredFlags: ['user'],
            mitre: ['T1110', 'T1552'],
            unlocks: ['escalation'],
            locked: true
        },
        {
            id: 'escalation',
            name: 'Privilege Escalation',
            icon: '\uD83D\uDD11',
            description: 'Find the hidden admin check in the binary to obtain root access.',
            requiredFlags: ['root'],
            mitre: ['T1068', 'T1548'],
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
                title: 'Run the binary to observe behavior',
                tip: 'Run: ./gate_keeper test to see how the program responds to wrong input.',
                trigger: { event: 'command', match: { cmd: 'contains:gate_keeper' } }
            },
            {
                title: 'Disassemble the binary',
                tip: 'Run: objdump -d /home/kali/challenge/gate_keeper to see the assembly code.',
                trigger: { event: 'command', match: { cmd: 'contains:objdump' } }
            },
            {
                title: 'Trace library calls',
                tip: 'Run: ltrace ./gate_keeper test to see what string comparisons are made.',
                trigger: { event: 'command', match: { cmd: 'contains:ltrace' } }
            },
            {
                title: 'Enter the correct password',
                tip: 'The ltrace output reveals the password comparison. Submit it as the user flag.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Find the admin backdoor',
                tip: 'GDB shows a hidden function. Analyze the admin_check function to find the root flag.',
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
            { flagId: 'user', objective: '2.3', description: 'Given a scenario, analyze indicators of malicious activity — Binary reverse engineering', skill: 'Disassembly Analysis' },
            { flagId: 'user', objective: '2.4', description: 'Given a scenario, analyze indicators associated with application attacks', skill: 'Control Flow Analysis' },
            { flagId: 'root', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Backdoor identification', skill: 'Hidden Function Discovery' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques — Application hardening', skill: 'Authentication Bypass Analysis' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Kali Linux BIOS v4.2.1',
            'Initializing hardware...',
            'Memory Test: 8192 MB OK',
            'Detecting drives... /dev/sda1 (256GB SSD)',
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
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nChallenge binary: /home/kali/challenge/gate_keeper\n'
    },

    // ═══════════════════════════════════════════════════════
    // BINARY SIMULATION DATA
    // ═══════════════════════════════════════════════════════

    _binaryData: {
        password: 'l0g1c_g4t3_2024',
        adminKey: 'GATE-ADMIN-XRAY-7742',
        hiddenFunction: 'admin_check'
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
            text: 'Run ltrace on the binary with any password to see the strcmp call and the expected password.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The ltrace output shows: strcmp("your_input", "l0g1c_g4t3_2024"). That is the password.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Use GDB to list all functions: "info functions". There is a hidden admin_check function not called from main.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'In GDB, call the admin_check function directly: "call admin_check()". It prints the root flag.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'A custom authentication binary called "gate_keeper" protects access to a restricted server. The binary performs a password check and grants or denies access. Your mission: reverse engineer the password comparison logic and discover a hidden administrative backdoor.',
        scenario: 'A disgruntled developer left the organization but may have planted a backdoor in the gate_keeper authentication module. The source code was never committed to version control. Only the compiled binary remains. Security needs to know: what is the password, and is there a hidden admin function?',
        outro: 'The Logic Gate is cracked. The password "l0g1c_g4t3_2024" was trivially recoverable via ltrace, and a hidden admin_check function provides unrestricted access. The binary should be replaced immediately.',
        ecer: {
            executive: 'No code review or binary audit process for authentication components',
            culture: 'Single developer controlled critical authentication infrastructure',
            employee: 'Developer embedded backdoor admin function in compiled binary',
            regulatory: 'No requirement for multi-person review of security-critical code changes'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://re-workbench.local/',

        pages: {
            '/': {
                title: 'RE Workbench',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#a855f7; font-size:1.6rem; margin-bottom:4px;">Reverse Engineering Workbench</h1>
                        <div style="color:#888; font-size:0.8rem;">Binary Analysis Reference</div>
                    </div>
                    <div style="max-width:600px; margin:0 auto; padding:20px;">
                        <h3 style="color:#a855f7;">Disassembly Tools</h3>
                        <ul style="color:#666; font-size:0.85rem; line-height:1.8;">
                            <li><code>objdump -d &lt;binary&gt;</code> — Disassemble all sections</li>
                            <li><code>gdb &lt;binary&gt;</code> — Interactive debugger</li>
                            <li><code>ltrace &lt;binary&gt; [args]</code> — Trace library calls</li>
                            <li><code>strace &lt;binary&gt; [args]</code> — Trace system calls</li>
                            <li><code>strings &lt;binary&gt;</code> — Extract printable strings</li>
                        </ul>
                    </div>
                `
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM
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
                                    content: '=== MISSION BRIEFING ===\nTarget: gate_keeper authentication binary\nObjective: Reverse engineer password check, find backdoor\n\nSteps:\n1. Run the binary with test input\n2. Use ltrace to observe library calls\n3. Disassemble with objdump\n4. Debug with GDB to find hidden functions\n5. Extract both flags\n\nGood luck, operator.'
                                },
                                'challenge': {
                                    type: 'dir',
                                    children: {
                                        'gate_keeper': {
                                            type: 'file',
                                            content: '[ELF 64-bit LSB executable, x86-64, dynamically linked, not stripped]'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'file challenge/gate_keeper\n./challenge/gate_keeper test\nltrace ./challenge/gate_keeper test'
                                }
                            }
                        }
                    }
                },
                'usr': { type: 'dir', children: { 'share': { type: 'dir', children: {} } } },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'kali' },
                        'passwd': { type: 'file', content: 'root:x:0:0:root:/root:/bin/bash\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash' }
                    }
                },
                'tmp': { type: 'dir', children: {} }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {
        'objdump': function(args) {
            if (args.length === 0) return 'Usage: objdump [OPTIONS] FILE';
            const file = args[args.length - 1];
            if (file.includes('gate_keeper') || file.includes('challenge/')) {
                return `gate_keeper:     file format elf64-x86-64

Disassembly of section .text:

0000000000401000 <main>:
  401000:   55                      push   %rbp
  401001:   48 89 e5                mov    %rsp,%rbp
  401004:   48 83 ec 10             sub    $0x10,%rsp
  401008:   83 ff 02                cmp    $0x2,%edi
  40100b:   75 2a                   jne    401037 <main+0x37>
  40100d:   48 8b 76 08             mov    0x8(%rsi),%rsi
  401011:   48 8d 3d e8 0f 00 00    lea    0xfe8(%rip),%rdi      # 402000 "l0g1c_g4t3_2024"
  401018:   e8 53 00 00 00          call   401070 <strcmp@plt>
  40101d:   85 c0                   test   %eax,%eax
  40101f:   75 0e                   jne    40102f <main+0x2f>
  401021:   48 8d 3d e8 0f 00 00    lea    0xfe8(%rip),%rdi      # "Access granted! {{FLAG:user}}"
  401028:   e8 43 00 00 00          call   401070 <puts@plt>
  40102d:   eb 0c                   jmp    40103b <main+0x3b>
  40102f:   48 8d 3d da 0f 00 00    lea    0xfda(%rip),%rdi      # "Access denied."
  401036:   e8 35 00 00 00          call   401070 <puts@plt>
  40103b:   c9                      leave
  40103c:   c3                      ret

0000000000401040 <admin_check>:
  401040:   55                      push   %rbp
  401041:   48 89 e5                mov    %rsp,%rbp
  401044:   48 8d 3d b5 0f 00 00    lea    0xfb5(%rip),%rdi      # "ADMIN BACKDOOR ACTIVATED"
  40104b:   e8 20 00 00 00          call   401070 <puts@plt>
  401050:   48 8d 3d c9 0f 00 00    lea    0xfc9(%rip),%rdi      # "Root Key: {{FLAG:root}}"
  401057:   e8 14 00 00 00          call   401070 <puts@plt>
  40105c:   c9                      leave
  40105d:   c3                      ret`;
            }
            return `objdump: '${file}': No such file`;
        },

        'gdb': function(args) {
            if (args.length === 0) return 'Usage: gdb <binary>';
            return `GNU gdb (GDB) 13.2
Reading symbols from gate_keeper...
(gdb) info functions
All defined functions:

Non-debugging symbols:
0x0000000000401000  main
0x0000000000401040  admin_check        <-- HIDDEN FUNCTION (not called from main)
0x0000000000401070  strcmp@plt
0x0000000000401080  puts@plt
0x0000000000401090  __libc_start_main@plt

(gdb) disas admin_check
Dump of assembler code for function admin_check:
   0x0000000000401040 <+0>:     push   %rbp
   0x0000000000401041 <+1>:     mov    %rsp,%rbp
   0x0000000000401044 <+4>:     lea    0xfb5(%rip),%rdi    # "ADMIN BACKDOOR ACTIVATED"
   0x000000000040104b <+11>:    call   0x401080 <puts@plt>
   0x0000000000401050 <+16>:    lea    0xfc9(%rip),%rdi    # "Root Key: {{FLAG:root}}"
   0x0000000000401057 <+23>:    call   0x401080 <puts@plt>
   0x000000000040105c <+28>:    leave
   0x000000000040105d <+29>:    ret
End of assembler dump.

(gdb) call admin_check()
ADMIN BACKDOOR ACTIVATED
Root Key: {{FLAG:root}}
(gdb)`;
        },

        'ltrace': function(args) {
            if (args.length === 0) return 'Usage: ltrace [OPTIONS] <binary> [args]';
            const hasPassword = args.some(a => a === 'l0g1c_g4t3_2024');
            if (hasPassword) {
                return `__libc_start_main(0x401000, 2, 0x7ffd...)
strcmp("l0g1c_g4t3_2024", "l0g1c_g4t3_2024")  = 0
puts("Access granted! {{FLAG:user}}")           = 30
+++ exited (status 0) +++`;
            }
            return `__libc_start_main(0x401000, 2, 0x7ffd...)
strcmp("${args[args.length - 1] || 'test'}", "l0g1c_g4t3_2024")  = -1
puts("Access denied.")                          = 15
+++ exited (status 1) +++`;
        },

        'strace': function(args) {
            if (args.length === 0) return 'Usage: strace [OPTIONS] <binary> [args]';
            return `execve("./gate_keeper", ["./gate_keeper", "${args[args.length - 1] || 'test'}"], environ) = 0
brk(NULL)                               = 0x55a1c0
mmap(NULL, 8192, PROT_READ|PROT_WRITE)  = 0x7f8a00
access("/etc/ld.so.preload", R_OK)      = -1 ENOENT
openat(AT_FDCWD, "/lib/x86_64-linux-gnu/libc.so.6", O_RDONLY|O_CLOEXEC) = 3
write(1, "Access denied.\\n", 15)        = 15
exit_group(1)                           = ?
+++ exited with 1 +++`;
        },

        'strings': function(args) {
            if (args.length === 0) return 'Usage: strings [OPTIONS] FILE';
            return `/lib64/ld-linux-x86-64.so.2
libc.so.6
strcmp
puts
printf
__libc_start_main
Usage: ./gate_keeper <password>
l0g1c_g4t3_2024
Access granted! {{FLAG:user}}
Access denied.
ADMIN BACKDOOR ACTIVATED
Root Key: {{FLAG:root}}
GCC: (Ubuntu 12.3.0)`;
        },

        'xxd': function(args) {
            if (args.length === 0) return 'Usage: xxd [OPTIONS] [FILE]';
            return `00000000: 7f45 4c46 0201 0100 0000 0000 0000 0000  .ELF............
00000010: 0200 3e00 0100 0000 0010 4000 0000 0000  ..>.......@.....
00000200: 6c30 6731 635f 6734 7433 5f32 3032 3400  l0g1c_g4t3_2024.
00000210: 4163 6365 7373 2067 7261 6e74 6564 2100  Access granted!.
00000300: 4144 4d49 4e20 4241 434b 444f 4f52 2041  ADMIN BACKDOOR A
00000310: 4354 4956 4154 4544 0000 0000 0000 0000  CTIVATED........
00000320: 526f 6f74 204b 6579 3a20 7b7b 464c 4147  Root Key: {{FLAG
00000330: 3a72 6f6f 747d 7d00 0000 0000 0000 0000  :root}}.........`;
        },

        'python3': function(args) {
            if (args.length === 0) return 'Python 3.11.6\nType "exit()" to quit.\n>>> ';
            return 'python3: can\'t open file \'' + args[0] + '\': [Errno 2] No such file or directory';
        },

        'file': function(args) {
            if (args.length === 0) return 'Usage: file <filename>';
            return `gate_keeper: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, not stripped`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent.trim();
    }
};
