/* ============================================================
   CTF ARENA — Box REV-03: The Wrapped Binary
   Reverse Engineering | Packing & Obfuscation
   Config: packed binary, UPX, filesystem, flags, hints, lore
   ============================================================ */

const Rev03Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Wrapped Binary',
    subtitle: 'Reverse Engineering — Packing & Obfuscation',
    difficulty: 'Intermediate-Advanced',
    accent: '#f97316',
    storageKey: 'hexworth_ctf_rev03',
    registryId: 'rev-03-packed',
    trackerKey: 'ctf_rev03',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Packer Identification',
            icon: '\uD83D\uDCE6',
            description: 'Identify that the binary is packed and determine which packer was used.',
            requiredFlags: [],
            mitre: ['T1027.002', 'T1036'],
            unlocks: ['unpacking'],
            locked: false
        },
        {
            id: 'unpacking',
            name: 'Unpacking',
            icon: '\uD83D\uDD13',
            description: 'Unpack the binary to reveal the original executable code.',
            requiredFlags: [],
            mitre: ['T1140', 'T1027.002'],
            unlocks: ['analysis'],
            locked: true
        },
        {
            id: 'analysis',
            name: 'Binary Analysis',
            icon: '\uD83D\uDD0D',
            description: 'Analyze the unpacked binary to find embedded secrets.',
            requiredFlags: ['user'],
            mitre: ['T1552.004', 'T1005'],
            unlocks: ['deepdive'],
            locked: true
        },
        {
            id: 'deepdive',
            name: 'Deep Analysis',
            icon: '\uD83E\uDDEC',
            description: 'Trace the unpacked binary\'s hidden functionality to find the root secret.',
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
                title: 'Identify the packer',
                tip: 'Run: file /home/kali/challenge/wrapped and strings wrapped | grep UPX',
                trigger: { event: 'command', match: { cmd: 'contains:file' } }
            },
            {
                title: 'Unpack with UPX',
                tip: 'Run: upx -d /home/kali/challenge/wrapped -o /home/kali/challenge/unwrapped',
                trigger: { event: 'command', match: { cmd: 'contains:upx' } }
            },
            {
                title: 'Analyze the unpacked binary',
                tip: 'Run strings and objdump on the unpacked binary.',
                trigger: { event: 'command', match: { cmd: 'contains:strings' } }
            },
            {
                title: 'Find the user flag',
                tip: 'The unpacked strings reveal a configuration block with the user flag.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Trace the hidden callback',
                tip: 'Use ltrace on the unpacked binary to discover the root flag in a network callback.',
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
            { flagId: 'user', objective: '2.3', description: 'Given a scenario, analyze indicators of malicious activity — Packed binaries', skill: 'Packer Identification' },
            { flagId: 'user', objective: '2.4', description: 'Given a scenario, analyze indicators associated with application attacks', skill: 'Binary Unpacking' },
            { flagId: 'root', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Obfuscated malware', skill: 'Obfuscation Analysis' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques — Malware analysis', skill: 'Dynamic Trace Analysis' }
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nChallenge binary: /home/kali/challenge/wrapped\n'
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
            text: 'The "file" command shows the binary is UPX-packed. Strings on the packed binary will show "UPX!" markers.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Unpack with: upx -d wrapped -o unwrapped. Then run strings on the unpacked version.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The unpacked binary\'s strings contain "CONFIG_TOKEN={{FLAG:user}}". The root flag requires ltrace.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Run: ltrace ./unwrapped — the output shows a connect() call that leaks the root flag in the callback URL.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'A packed binary was intercepted during a network scan. The packer is obscuring the true functionality of the executable. Your mission: identify the packer, unpack the binary, and analyze the revealed code to extract hidden secrets.',
        scenario: 'The IDS flagged an outbound connection from a production server to an unknown IP. Investigation found a binary named "wrapped" in /opt. The binary appears to be packed, hiding its true purpose. Analysis is needed before incident response can determine the scope of the compromise.',
        outro: 'The Wrapped Binary is unwrapped. UPX packing was used to hide a beaconing implant with hardcoded credentials. The unpacking revealed both a configuration token and a C2 callback URL containing the master key.',
        ecer: {
            executive: 'No binary integrity monitoring on production servers',
            culture: 'Packed binaries not flagged by endpoint security policies',
            employee: 'Attacker used common packing to evade basic static analysis',
            regulatory: 'No file integrity monitoring (FIM) requirement for production systems'
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
                        <h1 style="color:#f97316; font-size:1.6rem; margin-bottom:4px;">Reverse Engineering Workbench</h1>
                        <div style="color:#888; font-size:0.8rem;">Packing & Obfuscation Analysis</div>
                    </div>
                    <div style="max-width:600px; margin:0 auto; padding:20px;">
                        <h3 style="color:#f97316;">Common Packers</h3>
                        <ul style="color:#666; font-size:0.85rem; line-height:1.8;">
                            <li><strong>UPX</strong> — Ultimate Packer for eXecutables (most common)</li>
                            <li><strong>Themida</strong> — Commercial packer/protector</li>
                            <li><strong>VMProtect</strong> — Virtual machine-based obfuscation</li>
                            <li><strong>ASPack</strong> — Windows PE packer</li>
                        </ul>
                        <div style="margin-top:15px; padding:12px; background:#fff7ed; border:1px solid #fdba74; border-radius:6px;">
                            <strong>Tip:</strong> UPX-packed binaries contain "UPX!" strings and can be unpacked with <code>upx -d</code>
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
                                    content: '=== MISSION BRIEFING ===\nTarget: wrapped (packed binary from production server)\nObjective: Unpack and analyze to extract secrets\n\nSteps:\n1. Identify packer with file/strings\n2. Unpack with appropriate tool\n3. Analyze unpacked binary\n4. Extract configuration secrets\n5. Trace hidden network callbacks\n\nGood luck, operator.'
                                },
                                'challenge': {
                                    type: 'dir',
                                    children: {
                                        'wrapped': {
                                            type: 'file',
                                            content: '[ELF 64-bit LSB executable, x86-64, UPX packed]'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'file challenge/wrapped\nstrings challenge/wrapped | grep UPX'
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
        'upx': function(args) {
            if (args.length === 0) return 'Usage: upx [OPTIONS] FILE\n  -d    Decompress/unpack';
            const hasD = args.includes('-d');
            if (hasD) {
                return `                       Ultimate Packer for eXecutables
                          Copyright (C) 1996 - 2024
UPX 4.2.1       Markus Oberhumer, Laszlo Molnar & John Reiser

        File size         Ratio      Format      Name
   --------------------   ------   -----------   -----------
     24576 <-      8192   33.33%   linux/amd64   unwrapped

Unpacked 1 file.

[+] Unpacked binary written to: unwrapped
[+] Original size restored: 24576 bytes`;
            }
            return `                       Ultimate Packer for eXecutables
UPX 4.2.1

        File size         Ratio      Format      Name
   --------------------   ------   -----------   -----------
     24576 ->      8192   33.33%   linux/amd64   wrapped

Packed 1 file.`;
        },

        'file': function(args) {
            if (args.length === 0) return 'Usage: file <filename>';
            const file = args[args.length - 1];
            if (file.includes('wrapped') && !file.includes('unwrapped')) {
                return `wrapped: ELF 64-bit LSB executable, x86-64, version 1 (GNU/Linux), statically linked, no section header at file end
  NOTE: This binary appears to be packed (UPX signature detected)`;
            }
            if (file.includes('unwrapped')) {
                return `unwrapped: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, not stripped`;
            }
            return `${file}: cannot open '${file}' (No such file or directory)`;
        },

        'strings': function(args) {
            if (args.length === 0) return 'Usage: strings [OPTIONS] FILE';
            const file = args[args.length - 1];
            if (file.includes('wrapped') && !file.includes('unwrapped')) {
                return `UPX!
$Info: This file is packed with the UPX executable packer $
$Id: UPX 4.2.1 $
UPX!
[... packed data - no readable strings ...]`;
            }
            if (file.includes('unwrapped')) {
                return `/lib64/ld-linux-x86-64.so.2
libc.so.6
socket
connect
send
recv
close
__libc_start_main
CONFIG_TOKEN={{FLAG:user}}
BEACON_INTERVAL=300
C2_SERVER=https://c2.evil-corp.net/beacon
C2_AUTH_KEY={{FLAG:root}}
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64)
/tmp/.update_cache
Connection to C2 established
Sending system info...
Awaiting commands...
GCC: (Ubuntu 12.3.0)`;
            }
            return '';
        },

        'objdump': function(args) {
            if (args.length === 0) return 'Usage: objdump [OPTIONS] FILE';
            const file = args[args.length - 1];
            if (file.includes('wrapped') && !file.includes('unwrapped')) {
                return `objdump: wrapped: file format not recognized\nNote: Binary appears to be packed. Unpack it first.`;
            }
            if (file.includes('unwrapped')) {
                return `unwrapped:     file format elf64-x86-64

Disassembly of section .text:

0000000000401000 <main>:
  401000:   55                      push   %rbp
  401001:   48 89 e5                mov    %rsp,%rbp
  401004:   e8 17 00 00 00          call   401020 <init_config>
  401009:   e8 42 00 00 00          call   401050 <beacon_loop>
  40100e:   c9                      leave
  40100f:   c3                      ret

0000000000401020 <init_config>:
  401020:   55                      push   %rbp
  401021:   48 89 e5                mov    %rsp,%rbp
  401024:   48 8d 3d d5 0f 00 00    lea    0xfd5(%rip),%rdi    # "CONFIG_TOKEN={{FLAG:user}}"
  40102b:   e8 50 00 00 00          call   401080 <puts@plt>
  401030:   c9                      leave
  401031:   c3                      ret

0000000000401050 <beacon_loop>:
  401050:   55                      push   %rbp
  401051:   48 89 e5                mov    %rsp,%rbp
  401054:   48 8d 3d a5 0f 00 00    lea    0xfa5(%rip),%rdi    # C2_SERVER URL
  40105b:   48 8d 35 ae 0f 00 00    lea    0xfae(%rip),%rsi    # "C2_AUTH_KEY={{FLAG:root}}"
  401062:   e8 19 00 00 00          call   401080 <connect_c2>`;
            }
            return `objdump: '${file}': No such file`;
        },

        'gdb': function(args) {
            if (args.length === 0) return 'Usage: gdb <binary>';
            const file = args[args.length - 1];
            if (file.includes('wrapped') && !file.includes('unwrapped')) {
                return `GNU gdb (GDB) 13.2\nWarning: Binary appears to be packed. Symbols not available.\nUse "upx -d" to unpack first.`;
            }
            return `GNU gdb (GDB) 13.2
Reading symbols from unwrapped...
(gdb) info functions
0x0000000000401000  main
0x0000000000401020  init_config
0x0000000000401050  beacon_loop
0x0000000000401080  connect_c2

(gdb) x/s 0x402000
0x402000: "CONFIG_TOKEN={{FLAG:user}}"

(gdb) x/s 0x402080
0x402080: "C2_AUTH_KEY={{FLAG:root}}"`;
        },

        'ltrace': function(args) {
            if (args.length === 0) return 'Usage: ltrace [OPTIONS] <binary> [args]';
            const file = args[args.length - 1];
            if (file.includes('unwrapped')) {
                return `__libc_start_main(0x401000, 1, 0x7ffd...)
puts("CONFIG_TOKEN={{FLAG:user}}")               = 28
socket(AF_INET, SOCK_STREAM, 0)                  = 3
connect(3, {sa_family=AF_INET, sin_port=htons(443), sin_addr=inet_addr("185.192.69.42")}, 16) = -1
  URL: https://c2.evil-corp.net/beacon?key={{FLAG:root}}
send(3, "POST /beacon HTTP/1.1\\r\\nAuth: {{FLAG:root}}\\r\\n", 48, 0) = -1
close(3)                                          = 0
+++ exited (status 0) +++`;
            }
            return `ltrace: ${file}: packed binary — unpack first`;
        },

        'strace': function(args) {
            if (args.length === 0) return 'Usage: strace [OPTIONS] <binary> [args]';
            return `execve("./unwrapped", ["./unwrapped"], environ) = 0
socket(AF_INET, SOCK_STREAM, IPPROTO_TCP) = 3
connect(3, {sa_family=AF_INET, sin_port=htons(443), sin_addr=inet_addr("185.192.69.42")}, 16) = -1 ECONNREFUSED
write(1, "CONFIG_TOKEN={{FLAG:user}}\\n", 28) = 28
close(3) = 0
exit_group(0) = ?`;
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
