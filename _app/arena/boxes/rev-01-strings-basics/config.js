/* ============================================================
   CTF ARENA — Box REV-01: The Hidden String
   Reverse Engineering | Binary Strings & File Analysis
   Config: binary data, filesystem, flags, hints, lore
   ============================================================ */

const Rev01Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Hidden String',
    subtitle: 'Reverse Engineering — Binary Strings & File Analysis',
    difficulty: 'Beginner',
    accent: '#06b6d4',
    storageKey: 'hexworth_ctf_rev01',
    registryId: 'rev-01-strings-basics',
    trackerKey: 'ctf_rev01',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'File Identification',
            icon: '\uD83D\uDCC4',
            description: 'Identify the file type and basic properties of the target binary.',
            requiredFlags: [],
            mitre: ['T1027', 'T1036'],
            unlocks: ['extraction'],
            locked: false
        },
        {
            id: 'extraction',
            name: 'String Extraction',
            icon: '\uD83D\uDD0D',
            description: 'Extract readable strings from the binary to find hardcoded secrets.',
            requiredFlags: [],
            mitre: ['T1552.004', 'T1005'],
            unlocks: ['hexanalysis'],
            locked: true
        },
        {
            id: 'hexanalysis',
            name: 'Hex Analysis',
            icon: '\uD83D\uDD22',
            description: 'Analyze the binary at the hex level to find obfuscated data.',
            requiredFlags: ['user'],
            mitre: ['T1140', 'T1027.002'],
            unlocks: ['disassembly'],
            locked: true
        },
        {
            id: 'disassembly',
            name: 'Basic Disassembly',
            icon: '\u2699\uFE0F',
            description: 'Disassemble key functions to understand the binary\'s hidden behavior.',
            requiredFlags: ['root'],
            mitre: ['T1027', 'T1059'],
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
                title: 'Identify the binary file type',
                tip: 'Run: file /home/kali/challenge/mystery_binary',
                trigger: { event: 'command', match: { cmd: 'contains:file' } }
            },
            {
                title: 'Extract strings from the binary',
                tip: 'Run: strings /home/kali/challenge/mystery_binary',
                trigger: { event: 'command', match: { cmd: 'contains:strings' } }
            },
            {
                title: 'Look at the hex dump',
                tip: 'Run: xxd /home/kali/challenge/mystery_binary | head -50',
                trigger: { event: 'command', match: { cmd: 'contains:xxd' } }
            },
            {
                title: 'Find the user flag',
                tip: 'The strings output contains a flag marker. Look for the pattern carefully.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Find the root flag',
                tip: 'The hex dump reveals XOR-encoded data. Decode the bytes at offset 0x400.',
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
            { flagId: 'user', objective: '2.3', description: 'Given a scenario, analyze indicators of malicious activity — Binary analysis', skill: 'File Type Identification' },
            { flagId: 'user', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — String extraction', skill: 'Binary String Analysis' },
            { flagId: 'root', objective: '2.4', description: 'Given a scenario, analyze indicators associated with application attacks', skill: 'Hex-level Analysis' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques — Malware analysis', skill: 'XOR Decoding' }
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nChallenge binary: /home/kali/challenge/mystery_binary\n'
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
            text: 'Start with "file mystery_binary" to identify the binary type, then use "strings" to extract readable text.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The strings output includes a hardcoded API key and a flag marker. Look for lines starting with common flag formats.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The root flag is XOR-encoded in the binary. Use xxd to find the hex bytes at offset 0x400, then XOR with key 0x42.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: "Run: python3 -c \"import sys; data=[0x3b,0x3b,0x06,0x2c,0x03,0x1a,0x36,0x27,0x27,0x32]; print(''.join(chr(b^0x42) for b in data))\" to decode the root flag.",
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'A suspicious binary was recovered from a compromised workstation. Preliminary analysis suggests it contains hardcoded credentials and an obfuscated payload. Your mission: extract all secrets from the binary using static analysis techniques.',
        scenario: 'During an incident response engagement, a binary named "mystery_binary" was found in a temp directory on a developer\'s workstation. The developer claims no knowledge of it. The malware analysis team needs you to extract any indicators of compromise before the binary is sandboxed for dynamic analysis.',
        outro: 'The Hidden String is revealed. The binary contained a hardcoded API key in plaintext strings and a XOR-obfuscated root credential. Basic static analysis was sufficient to extract both. The developer\'s workstation is confirmed compromised.',
        ecer: {
            executive: 'No endpoint detection and response (EDR) solution deployed on developer workstations',
            culture: 'Developers allowed to run arbitrary binaries without security review',
            employee: 'Developer downloaded and executed an untrusted binary',
            regulatory: 'No binary allow-listing policy enforced on corporate endpoints'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://malware-analysis.local/',

        pages: {
            '/': {
                title: 'Malware Analysis Workbench',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#06b6d4; font-size:1.6rem; margin-bottom:4px;">Malware Analysis Workbench</h1>
                        <div style="color:#888; font-size:0.8rem;">Static Analysis Reference Tool</div>
                    </div>
                    <div style="max-width:600px; margin:0 auto; padding:20px;">
                        <h3 style="color:#06b6d4;">Quick Reference</h3>
                        <ul style="color:#666; font-size:0.85rem; line-height:1.8;">
                            <li><code>file &lt;binary&gt;</code> — Identify file type</li>
                            <li><code>strings &lt;binary&gt;</code> — Extract printable strings</li>
                            <li><code>xxd &lt;binary&gt;</code> — Hex dump</li>
                            <li><code>hexdump -C &lt;binary&gt;</code> — Canonical hex dump</li>
                            <li><code>objdump -d &lt;binary&gt;</code> — Disassemble</li>
                        </ul>
                        <div style="margin-top:15px; padding:12px; background:#ecfeff; border:1px solid #67e8f9; border-radius:6px;">
                            <strong>Target:</strong> /home/kali/challenge/mystery_binary
                        </div>
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
                                    content: '=== MISSION BRIEFING ===\nTarget: mystery_binary (recovered from compromised workstation)\nObjective: Extract all secrets using static analysis\n\nSteps:\n1. Identify the file type (file command)\n2. Extract printable strings (strings command)\n3. Analyze hex dump for obfuscated data (xxd/hexdump)\n4. Disassemble to understand logic (objdump)\n5. Decode any obfuscated payloads\n\nDo NOT execute the binary. Static analysis only.\nGood luck, operator.'
                                },
                                'challenge': {
                                    type: 'dir',
                                    children: {
                                        'mystery_binary': {
                                            type: 'file',
                                            content: '[ELF 64-bit LSB executable, x86-64, dynamically linked, not stripped]\n[BINARY DATA — Use analysis tools to examine]'
                                        },
                                        'README.txt': {
                                            type: 'file',
                                            content: 'INCIDENT RESPONSE — Case #IR-2024-0847\n\nFile: mystery_binary\nMD5:  a3f2b8c1d4e5f6a7b8c9d0e1f2a3b4c5\nSHA1: 1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b\nSize: 24,576 bytes\n\nRecovered from: C:\\Users\\jdoe\\AppData\\Local\\Temp\\\nTimestamp: 2024-03-12 02:14:33 UTC\nClassification: SUSPICIOUS — pending analysis'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'file challenge/mystery_binary\nstrings challenge/mystery_binary\nxxd challenge/mystery_binary | head'
                                }
                            }
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'share': { type: 'dir', children: {} }
                    }
                },
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
        'strings': function(args) {
            if (args.length === 0) return 'Usage: strings [OPTIONS] FILE';
            const file = args[args.length - 1];
            if (file.includes('mystery_binary') || file.includes('challenge/')) {
                return `/lib64/ld-linux-x86-64.so.2
libc.so.6
puts
printf
strcmp
__libc_start_main
GLIBC_2.2.5
__gmon_start__
AWAVI
AUATL
[]A\\A]A^A_
Usage: ./mystery_binary <password>
Checking credentials...
Access granted!
Access denied.
API_KEY=sk-proj-7Kx9mN2pL4qR8tY3wZ6vB1cD5fH0jA
INTERNAL_SECRET={{FLAG:user}}
DEBUG_MODE=true
CONFIG_SERVER=https://c2.malware-domain.evil/beacon
User-Agent: Mozilla/5.0 (compatible; updater/1.0)
/tmp/.cache_update
Connection established
Exfiltrating data...
Cleanup complete.
GCC: (Ubuntu 12.3.0-1ubuntu1~22.04) 12.3.0
.symtab
.strtab
.shstrtab
.text
.data
.rodata
.bss`;
            }
            return '';
        },

        'file': function(args) {
            if (args.length === 0) return 'Usage: file <filename>';
            const file = args[args.length - 1];
            if (file.includes('mystery_binary') || file.includes('challenge/')) {
                return `mystery_binary: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=a1b2c3d4e5f6a7b8c9d0, for GNU/Linux 3.2.0, not stripped`;
            }
            return `${file}: cannot open '${file}' (No such file or directory)`;
        },

        'xxd': function(args) {
            if (args.length === 0) return 'Usage: xxd [OPTIONS] [FILE]';
            const file = args[args.length - 1];
            if (file.includes('mystery_binary') || file.includes('challenge/')) {
                return `00000000: 7f45 4c46 0201 0100 0000 0000 0000 0000  .ELF............
00000010: 0200 3e00 0100 0000 4010 4000 0000 0000  ..>.....@.@.....
00000020: 4000 0000 0000 0000 d820 0000 0000 0000  @........ ......
00000030: 0000 0000 4000 3800 0d00 4000 1f00 1e00  ....@.8...@.....
00000040: 0600 0000 0400 0000 4000 0000 0000 0000  ........@.......
00000100: 5573 6167 653a 202e 2f6d 7973 7465 7279  Usage: ./mystery
00000110: 5f62 696e 6172 7920 3c70 6173 7377 6f72  _binary <passwor
00000120: 643e 0041 5049 5f4b 4559 3d73 6b2d 7072  d>.API_KEY=sk-pr
00000130: 6f6a 2d37 4b78 396d 4e32 704c 3471 5238  oj-7Kx9mN2pL4qR8
00000200: 494e 5445 524e 414c 5f53 4543 5245 543d  INTERNAL_SECRET=
00000210: 7b7b 464c 4147 3a75 7365 727d 7d00 0000  {{FLAG:user}}...
00000300: 4445 4255 475f 4d4f 4445 3d74 7275 6500  DEBUG_MODE=true.
00000400: 3b3b 062c 031a 3627 2732 0000 0000 0000  ;;.,..6''2......
00000410: 584f 525f 4b45 593d 3078 3432 0000 0000  XOR_KEY=0x42....
00000420: 7b7b 464c 4147 3a72 6f6f 747d 7d00 0000  {{FLAG:root}}...
00000500: 436f 6e66 6967 5365 7276 6572 3d68 7474  ConfigServer=htt
00000510: 7073 3a2f 2f63 322e 6d61 6c77 6172 652d  ps://c2.malware-`;
            }
            return '';
        },

        'hexdump': function(args) {
            if (args.length === 0) return 'Usage: hexdump [OPTIONS] FILE';
            const file = args[args.length - 1];
            if (file.includes('mystery_binary') || file.includes('challenge/')) {
                return `00000000  7f 45 4c 46 02 01 01 00  00 00 00 00 00 00 00 00  |.ELF............|
00000010  02 00 3e 00 01 00 00 00  40 10 40 00 00 00 00 00  |..>.....@.@.....|
00000020  40 00 00 00 00 00 00 00  d8 20 00 00 00 00 00 00  |@........ ......|
00000200  49 4e 54 45 52 4e 41 4c  5f 53 45 43 52 45 54 3d  |INTERNAL_SECRET=|
00000210  7b 7b 46 4c 41 47 3a 75  73 65 72 7d 7d 00 00 00  |{{FLAG:user}}...|
00000400  3b 3b 06 2c 03 1a 36 27  27 32 00 00 00 00 00 00  |;;.,..6''2......|
00000410  58 4f 52 5f 4b 45 59 3d  30 78 34 32 00 00 00 00  |XOR_KEY=0x42....|
00000420  7b 7b 46 4c 41 47 3a 72  6f 6f 74 7d 7d 00 00 00  |{{FLAG:root}}...|`;
            }
            return '';
        },

        'objdump': function(args) {
            if (args.length === 0) return 'Usage: objdump [OPTIONS] FILE';
            const file = args[args.length - 1];
            if (file.includes('mystery_binary') || file.includes('challenge/')) {
                return `mystery_binary:     file format elf64-x86-64

Disassembly of section .text:

0000000000401000 <main>:
  401000:   55                      push   %rbp
  401001:   48 89 e5                mov    %rsp,%rbp
  401004:   48 83 ec 20             sub    $0x20,%rsp
  401008:   83 ff 02                cmp    $0x2,%edi
  40100b:   74 0e                   je     40101b <main+0x1b>
  40100d:   48 8d 3d ec 0f 00 00    lea    0xfec(%rip),%rdi
  401014:   e8 37 00 00 00          call   401050 <puts@plt>
  401019:   eb 45                   jmp    401060 <main+0x60>

0000000000401050 <check_password>:
  401050:   55                      push   %rbp
  401051:   48 89 e5                mov    %rsp,%rbp
  401054:   48 8d 35 a5 0f 00 00    lea    0xfa5(%rip),%rsi    # loads hardcoded string
  40105b:   e8 10 00 00 00          call   401070 <strcmp@plt>
  401060:   85 c0                   test   %eax,%eax
  401062:   75 12                   jne    401076 <check_password+0x26>
  401064:   48 8d 3d 95 0f 00 00    lea    0xf95(%rip),%rdi    # "Access granted!"
  40106b:   e8 f0 ff ff ff          call   401050 <puts@plt>

0000000000401080 <xor_decode>:
  401080:   55                      push   %rbp
  401081:   48 89 e5                mov    %rsp,%rbp
  401084:   b1 42                   mov    $0x42,%cl           # XOR key = 0x42
  401086:   48 8d 35 73 f3 ff ff    lea    -0xc8d(%rip),%rsi  # offset 0x400
  40108d:   31 c0                   xor    %eax,%eax
  40108f:   8a 04 06                mov    (%rsi,%rax,1),%al
  401092:   30 c8                   xor    %cl,%al
  401094:   88 04 07                mov    %al,(%rdi,%rax,1)`;
            }
            return `objdump: '${file}': No such file`;
        },

        'cat': function(args) {
            if (args.length === 0) return 'Usage: cat [FILE...]';
            const file = args[args.length - 1];
            if (file.includes('mystery_binary')) {
                return '[Binary file — use strings, xxd, or objdump to analyze]';
            }
            return '';
        },

        'grep': function(args) {
            if (args.length < 2) return 'Usage: grep [OPTIONS] PATTERN [FILE...]';
            const pattern = args.find(a => !a.startsWith('-')) || '';
            if (pattern.includes('FLAG') || pattern.includes('flag') || pattern.includes('secret') || pattern.includes('SECRET')) {
                return `INTERNAL_SECRET={{FLAG:user}}\n{{FLAG:root}}`;
            }
            if (pattern.includes('API') || pattern.includes('api') || pattern.includes('key') || pattern.includes('KEY')) {
                return `API_KEY=sk-proj-7Kx9mN2pL4qR8tY3wZ6vB1cD5fH0jA\nXOR_KEY=0x42`;
            }
            return '';
        },

        'python3': function(args) {
            if (args.length === 0) return 'Python 3.11.6\nType "exit()" to quit.\n>>> ';
            if (args.includes('-c')) {
                const code = args.slice(args.indexOf('-c') + 1).join(' ');
                if (code.includes('0x42') || code.includes('xor') || code.includes('XOR')) {
                    return '{{FLAG:root}}';
                }
            }
            return 'python3: can\'t open file \'' + args[0] + '\': [Errno 2] No such file or directory';
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
