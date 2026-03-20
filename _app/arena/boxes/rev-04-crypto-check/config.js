/* ============================================================
   CTF ARENA — Box REV-04: The Cipher Lock
   Reverse Engineering | Custom Encryption Routine
   Config: crypto binary, algorithm, filesystem, flags, hints, lore
   ============================================================ */

const Rev04Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Cipher Lock',
    subtitle: 'Reverse Engineering — Custom Encryption Routine',
    difficulty: 'Advanced',
    accent: '#dc2626',
    storageKey: 'hexworth_ctf_rev04',
    registryId: 'rev-04-crypto-check',
    trackerKey: 'ctf_rev04',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Binary Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Examine the binary to understand its input/output behavior.',
            requiredFlags: [],
            mitre: ['T1027', 'T1140'],
            unlocks: ['disassembly'],
            locked: false
        },
        {
            id: 'disassembly',
            name: 'Algorithm Discovery',
            icon: '\u2699\uFE0F',
            description: 'Disassemble the encrypt function to understand the custom algorithm.',
            requiredFlags: [],
            mitre: ['T1027.002', 'T1573'],
            unlocks: ['reversal'],
            locked: true
        },
        {
            id: 'reversal',
            name: 'Algorithm Reversal',
            icon: '\uD83D\uDD04',
            description: 'Write a decryption script to reverse the custom encryption.',
            requiredFlags: ['user'],
            mitre: ['T1140', 'T1059'],
            unlocks: ['cracking'],
            locked: true
        },
        {
            id: 'cracking',
            name: 'Master Key Recovery',
            icon: '\uD83D\uDD11',
            description: 'Recover the master key from the binary\'s secondary encryption layer.',
            requiredFlags: ['root'],
            mitre: ['T1552', 'T1573.001'],
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
                tip: 'Run: ./cipher_lock with different inputs to understand what it does.',
                trigger: { event: 'command', match: { cmd: 'contains:cipher_lock' } }
            },
            {
                title: 'Disassemble the encryption function',
                tip: 'Run: objdump -d cipher_lock and focus on the encrypt function.',
                trigger: { event: 'command', match: { cmd: 'contains:objdump' } }
            },
            {
                title: 'Trace the encryption',
                tip: 'Use ltrace to see what the binary does with your input.',
                trigger: { event: 'command', match: { cmd: 'contains:ltrace' } }
            },
            {
                title: 'Write a decryption script',
                tip: 'The algorithm is: encrypted[i] = (input[i] XOR 0x5A) + i. Reverse it with Python.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Crack the master key',
                tip: 'The stored encrypted bytes decode to the root flag using the same algorithm.',
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
            { flagId: 'user', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with cryptographic attacks', skill: 'Custom Cipher Analysis' },
            { flagId: 'user', objective: '2.3', description: 'Given a scenario, analyze indicators of malicious activity — Encryption analysis', skill: 'Algorithm Reversal' },
            { flagId: 'root', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Custom encryption', skill: 'Cryptographic Key Recovery' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques — Encryption assessment', skill: 'Binary Cryptanalysis' }
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
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nChallenge binary: /home/kali/challenge/cipher_lock\n'
    },

    // ═══════════════════════════════════════════════════════
    // CRYPTO DATA
    // ═══════════════════════════════════════════════════════

    _cryptoData: {
        xorKey: 0x5A,
        algorithm: 'encrypted[i] = (plaintext[i] ^ 0x5A) + i',
        reverseAlgorithm: 'plaintext[i] = (encrypted[i] - i) ^ 0x5A',
        storedUserCipher: [0x32, 0x34, 0x08, 0x2d, 0x07, 0x1f, 0x39, 0x2a, 0x2c, 0x3a],
        storedRootCipher: [0x22, 0x34, 0x0a, 0x2f, 0x08, 0x20, 0x3c, 0x2e, 0x2f, 0x3d, 0x14, 0x3b]
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
            text: 'The binary encrypts input and compares it to stored bytes. Use ltrace to see the comparison values.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The encryption algorithm is: encrypted[i] = (input[i] XOR 0x5A) + i. Reverse it to find the password.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Write: python3 -c "enc=[0x32,0x34,0x08,0x2d,0x07,0x1f,0x39,0x2a,0x2c,0x3a]; print(\\'\\'.join(chr((b-i)^0x5A) for i,b in enumerate(enc)))"',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'The stored root cipher bytes at offset 0x600 decode with the same algorithm. Use GDB to read them, then decrypt.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'A binary authentication system called "cipher_lock" uses a custom encryption algorithm to verify passwords. The algorithm is non-standard and undocumented. Your mission: reverse engineer the encryption routine, derive the password, and recover the master key.',
        scenario: 'A ransomware sample uses a custom cipher to protect its configuration. The encryption key and C2 address are embedded in the binary but encrypted. Understanding the algorithm is critical for decrypting victim files and identifying the threat actor\'s infrastructure.',
        outro: 'The Cipher Lock is broken. The custom encryption algorithm (XOR + positional offset) was trivially reversible. Both the access password and the master key have been recovered. Custom cryptography is never a substitute for proven algorithms.',
        ecer: {
            executive: 'Ransomware developer relied on security through obscurity for key protection',
            culture: 'Custom cryptography is a hallmark of amateur threat actors',
            employee: 'Developer implemented a weak, invertible cipher instead of using AES/ChaCha20',
            regulatory: 'Proper encryption standards (FIPS 140-3) mandate approved algorithms only'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://re-workbench.local/',

        pages: {
            '/': {
                title: 'RE Workbench — Crypto Analysis',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#dc2626; font-size:1.6rem; margin-bottom:4px;">Cryptanalysis Workbench</h1>
                        <div style="color:#888; font-size:0.8rem;">Custom Encryption Analysis Tools</div>
                    </div>
                    <div style="max-width:600px; margin:0 auto; padding:20px;">
                        <h3 style="color:#dc2626;">Common Custom Cipher Patterns</h3>
                        <ul style="color:#666; font-size:0.85rem; line-height:1.8;">
                            <li><strong>XOR cipher</strong> — Single-byte or multi-byte key XOR</li>
                            <li><strong>Caesar/ROT</strong> — Character shift by fixed amount</li>
                            <li><strong>XOR + offset</strong> — XOR with positional modification</li>
                            <li><strong>Custom S-box</strong> — Substitution table lookup</li>
                        </ul>
                        <div style="margin-top:15px; padding:12px; background:#fef2f2; border:1px solid #fca5a5; border-radius:6px;">
                            <strong>Tip:</strong> If you can identify the algorithm, you can often invert it directly.
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
                                    content: '=== MISSION BRIEFING ===\nTarget: cipher_lock (custom crypto authentication)\nObjective: Reverse the encryption, recover passwords\n\nSteps:\n1. Run the binary to observe behavior\n2. Disassemble the encrypt function\n3. Identify the algorithm\n4. Write decryption script\n5. Recover both passwords\n\nGood luck, operator.'
                                },
                                'challenge': {
                                    type: 'dir',
                                    children: {
                                        'cipher_lock': {
                                            type: 'file',
                                            content: '[ELF 64-bit LSB executable, x86-64, dynamically linked, not stripped]'
                                        },
                                        'decrypt_template.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""Template for decryption script"""\n\n# Algorithm: encrypted[i] = (plaintext[i] ^ KEY) + i\n# Reverse:  plaintext[i] = (encrypted[i] - i) ^ KEY\n\nKEY = 0x??  # TODO: Find the XOR key from disassembly\n\nuser_encrypted = []  # TODO: Find stored bytes from binary\nroot_encrypted = []  # TODO: Find stored bytes from binary\n\ndef decrypt(encrypted_bytes, key):\n    result = ""\n    for i, b in enumerate(encrypted_bytes):\n        result += chr((b - i) ^ key)\n    return result\n\nprint("User password:", decrypt(user_encrypted, KEY))\nprint("Root password:", decrypt(root_encrypted, KEY))'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'file challenge/cipher_lock\n./challenge/cipher_lock AAAA\nobjdump -d challenge/cipher_lock'
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
        'gdb': function(args) {
            if (args.length === 0) return 'Usage: gdb <binary>';
            return `GNU gdb (GDB) 13.2
Reading symbols from cipher_lock...
(gdb) info functions
0x0000000000401000  main
0x0000000000401040  encrypt
0x0000000000401080  check_password
0x00000000004010c0  check_master_key

(gdb) disas encrypt
Dump of assembler code for function encrypt:
   0x0000000000401040 <+0>:     push   %rbp
   0x0000000000401041 <+1>:     mov    %rsp,%rbp
   0x0000000000401044 <+4>:     mov    %rdi,%rsi          # input string
   0x0000000000401047 <+7>:     xor    %ecx,%ecx          # i = 0
   0x0000000000401049 <+9>:     movzbl (%rsi,%rcx,1),%eax # load input[i]
   0x000000000040104d <+13>:    xor    $0x5a,%al           # XOR with 0x5A
   0x000000000040104f <+15>:    add    %cl,%al             # ADD i
   0x0000000000401051 <+17>:    mov    %al,(%rdi,%rcx,1)  # store result
   0x0000000000401054 <+20>:    inc    %ecx               # i++
   0x0000000000401056 <+22>:    cmp    %edx,%ecx          # compare with length
   0x0000000000401058 <+24>:    jl     0x401049           # loop
   0x000000000040105a <+26>:    leave
   0x000000000040105b <+27>:    ret
End of assembler dump.

(gdb) x/10bx 0x402100
0x402100: 0x32  0x34  0x08  0x2d  0x07  0x1f  0x39  0x2a  0x2c  0x3a

(gdb) x/12bx 0x402200
0x402200: 0x22  0x34  0x0a  0x2f  0x08  0x20  0x3c  0x2e  0x2f  0x3d  0x14  0x3b

(gdb) info note
User stored cipher at 0x402100 (10 bytes)
Master key cipher at 0x402200 (12 bytes)
XOR key: 0x5A
Algorithm: encrypted[i] = (plaintext[i] ^ 0x5A) + i`;
        },

        'objdump': function(args) {
            if (args.length === 0) return 'Usage: objdump [OPTIONS] FILE';
            return `cipher_lock:     file format elf64-x86-64

Disassembly of section .text:

0000000000401000 <main>:
  401000:   55                      push   %rbp
  401001:   48 89 e5                mov    %rsp,%rbp
  401004:   83 ff 02                cmp    $0x2,%edi
  401007:   75 30                   jne    401039
  401009:   48 8b 76 08             mov    0x8(%rsi),%rsi
  40100d:   e8 2e 00 00 00          call   401040 <encrypt>
  401012:   e8 69 00 00 00          call   401080 <check_password>
  401017:   85 c0                   test   %eax,%eax
  401019:   75 0e                   jne    401029
  40101b:   48 8d 3d de 0f 00 00    lea    0xfde(%rip),%rdi    # "Access granted! {{FLAG:user}}"
  401022:   e8 59 00 00 00          call   401080 <puts@plt>
  401027:   eb 14                   jmp    40103d
  401029:   48 8d 3d d0 0f 00 00    lea    0xfd0(%rip),%rdi    # "Access denied."
  401030:   e8 4b 00 00 00          call   401080 <puts@plt>

0000000000401040 <encrypt>:
  401040:   55                      push   %rbp
  401041:   48 89 e5                mov    %rsp,%rbp
  401044:   48 89 fe                mov    %rdi,%rsi
  401047:   31 c9                   xor    %ecx,%ecx           # i = 0
  401049:   0f b6 04 0e             movzbl (%rsi,%rcx,1),%eax  # al = input[i]
  40104d:   34 5a                   xor    $0x5a,%al            # al ^= 0x5A
  40104f:   00 c8                   add    %cl,%al              # al += i
  401051:   88 04 0f                mov    %al,(%rdi,%rcx,1)   # output[i] = al
  401054:   ff c1                   inc    %ecx
  401056:   39 d1                   cmp    %edx,%ecx
  401058:   7c ef                   jl     401049
  40105a:   c9                      leave
  40105b:   c3                      ret

0000000000401080 <check_password>:
  401080:   55                      push   %rbp
  401081:   48 89 e5                mov    %rsp,%rbp
  401084:   48 8d 35 75 10 00 00    lea    0x1075(%rip),%rsi   # stored_cipher @ 0x402100
  40108b:   ba 0a 00 00 00          mov    $0xa,%edx           # length = 10
  401090:   e8 0b 00 00 00          call   4010a0 <memcmp@plt>
  401095:   c9                      leave
  401096:   c3                      ret

00000000004010c0 <check_master_key>:
  4010c0:   48 8d 35 39 11 00 00    lea    0x1139(%rip),%rsi   # master_cipher @ 0x402200
  4010c7:   ba 0c 00 00 00          mov    $0xc,%edx           # length = 12
  4010cc:   e8 cf ff ff ff          call   4010a0 <memcmp@plt>`;
        },

        'ltrace': function(args) {
            if (args.length === 0) return 'Usage: ltrace [OPTIONS] <binary> [args]';
            const input = args[args.length - 1] || 'test';
            return `__libc_start_main(0x401000, 2, 0x7ffd...)
strlen("${input}")                                = ${input.length}
  -> encrypt("${input}", len=${input.length}, key=0x5A)
     Algorithm: output[i] = (input[i] ^ 0x5A) + i
memcmp(encrypted_input, stored_cipher, 10)        = -1
puts("Access denied.")                             = 15
+++ exited (status 1) +++

Note: Stored cipher bytes at 0x402100:
  [0x32, 0x34, 0x08, 0x2d, 0x07, 0x1f, 0x39, 0x2a, 0x2c, 0x3a]
Master key bytes at 0x402200:
  [0x22, 0x34, 0x0a, 0x2f, 0x08, 0x20, 0x3c, 0x2e, 0x2f, 0x3d, 0x14, 0x3b]`;
        },

        'strace': function(args) {
            if (args.length === 0) return 'Usage: strace [OPTIONS] <binary> [args]';
            return `execve("./cipher_lock", ["./cipher_lock", "${args[args.length - 1] || 'test'}"], environ) = 0
write(1, "Access denied.\\n", 15) = 15
exit_group(1) = ?`;
        },

        'python3': function(args) {
            if (args.length === 0) return 'Python 3.11.6\nType "exit()" to quit.\n>>> ';
            if (args.includes('-c')) {
                const code = args.slice(args.indexOf('-c') + 1).join(' ');
                if (code.includes('0x5a') || code.includes('0x5A') || code.includes('decrypt') || code.includes('0x32')) {
                    return 'User password: {{FLAG:user}}\nRoot password: {{FLAG:root}}';
                }
            }
            const file = args[args.length - 1];
            if (file.includes('decrypt')) {
                return 'User password: {{FLAG:user}}\nRoot password: {{FLAG:root}}';
            }
            return 'python3: can\'t open file \'' + args[0] + '\': [Errno 2] No such file or directory';
        },

        'xxd': function(args) {
            if (args.length === 0) return 'Usage: xxd [OPTIONS] [FILE]';
            return `00000000: 7f45 4c46 0201 0100 0000 0000 0000 0000  .ELF............
00000100: 656e 6372 7970 745b 695d 203d 2028 696e  encrypt[i] = (in
00000110: 7075 745b 695d 205e 2030 7835 4129 202b  put[i] ^ 0x5A) +
00000120: 2069 0000 0000 0000 0000 0000 0000 0000   i..............
00000200: 3234 082d 071f 392a 2c3a 0000 0000 0000  24.-..9*,:......
00000210: 2234 0a2f 0820 3c2e 2f3d 143b 0000 0000  "4./. <./=.;....`;
        },

        'file': function(args) {
            if (args.length === 0) return 'Usage: file <filename>';
            return `cipher_lock: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, not stripped`;
        },

        'strings': function(args) {
            if (args.length === 0) return 'Usage: strings [OPTIONS] FILE';
            return `/lib64/ld-linux-x86-64.so.2
libc.so.6
memcmp
strlen
puts
Usage: ./cipher_lock <password>
encrypt[i] = (input[i] ^ 0x5A) + i
Checking password...
Access granted! {{FLAG:user}}
Access denied.
Master key accepted: {{FLAG:root}}
GCC: (Ubuntu 12.3.0)`;
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
