/* ============================================================
   CTF ARENA — Box C10: The Quantum Cipher Heist
   Multi-Stage Campaign | Cryptanalysis, Air Gap Breach, Kernel Exploit
   Config: filesystem, signal analysis tool, vault, flags, hints, lore
   ============================================================ */

const C10Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Quantum Cipher Heist',
    subtitle: 'Multi-Stage Campaign — Cryptanalysis, Air Gap Breach, Kernel Exploitation',
    difficulty: 'Expert',
    accent: '#8b5cf6',
    storageKey: 'hexworth_ctf_c10',
    registryId: 'c10-quantum-cipher',
    trackerKey: 'ctf_c10',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Enumerate the external network. Discover the AIR-GAP-BRIDGE server and its listening services.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002', 'T1040'],
            unlocks: ['cryptanalysis'],
            locked: false
        },
        {
            id: 'cryptanalysis',
            name: 'Cipher Break',
            icon: '\uD83D\uDD13',
            description: 'Analyze QUANTUM-CIPHER-V1.0. Identify the nonce-reuse flaw in the key encapsulation mechanism and recover the vault access key.',
            requiredFlags: [],
            mitre: ['T1600', 'T1552.004'],
            unlocks: ['airgap'],
            locked: true
        },
        {
            id: 'airgap',
            name: 'Air Gap Breach',
            icon: '\uD83D\uDCE1',
            description: 'Exploit the acoustic signal bridge daemon on AIR-GAP-BRIDGE. Craft a modulated signal using the recovered key to unlock a temporary SSH port on CHRONOS-OS-01.',
            requiredFlags: ['cipher'],
            mitre: ['T1557', 'T1205', 'T1021.004'],
            unlocks: ['kernelexploit'],
            locked: true
        },
        {
            id: 'kernelexploit',
            name: 'Kernel Compromise',
            icon: '\uD83D\uDCBB',
            description: 'On CHRONOS-OS-01, enumerate the custom kernel module chronos_ksec. Identify the use-after-free vulnerability and escalate to root.',
            requiredFlags: ['airgap'],
            mitre: ['T1068', 'T1014', 'T1082'],
            unlocks: ['extraction'],
            locked: true
        },
        {
            id: 'extraction',
            name: 'Protocol Extraction',
            icon: '\uD83D\uDCE6',
            description: 'Read /root/temporal_protocol.txt from the Quantum Vault. Extract the Temporal Paradigm Shift Protocol.',
            requiredFlags: ['root'],
            mitre: ['T1005', 'T1083', 'T1560'],
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
                tip: 'Open the Terminal and run: nmap 10.0.1.50 — discover AIR-GAP-BRIDGE and its services.',
                trigger: { event: 'command', match: { cmd: 'contains:nmap' } }
            },
            {
                title: 'Retrieve and analyze the cipher binary',
                tip: 'Download the QUANTUM-CIPHER-V1.0 spec: wget http://10.0.1.50/quantum-cipher-v1.0.tar.gz — then run: analyze-cipher to inspect the key generation routine.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:analyze-cipher' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:wget' } }
                    ]
                }
            },
            {
                title: 'Exploit the nonce-reuse flaw to recover the vault key',
                tip: 'Run: recover-key ciphertext_a.enc ciphertext_b.enc — the two intercepted ciphertexts share the same nonce. XOR them to expose the keystream.',
                trigger: { event: 'flag_correct', match: { flagId: 'cipher' } }
            },
            {
                title: 'Craft an acoustic signal and bridge the air gap',
                tip: 'Use: signal-gen --freq 440 --key <recovered_key> | acoustic-send — the bridge daemon listens on the microphone channel and relays the command to CHRONOS-OS-01.',
                trigger: { event: 'flag_correct', match: { flagId: 'airgap' } }
            },
            {
                title: 'Exploit the kernel UAF and read the temporal protocol',
                tip: 'SSH into CHRONOS-OS-01 via the temporary port. Run: uname -a, then: lsmod | grep chronos — craft the UAF exploit against chronos_ksec to gain root, then: cat /root/temporal_protocol.txt',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'cipher', objective: '1.3', description: 'Summarize the basics of cryptographic concepts — Implementation flaw exploitation in a quantum-resistant cipher', skill: 'Cryptanalysis & Key Recovery' },
            { flagId: 'airgap', objective: '2.1', description: 'Compare and contrast various types of attacks — Air gap covert channel exploitation via acoustic signal modulation', skill: 'Covert Channel & Air Gap Breach' },
            { flagId: 'root', objective: '3.2', description: 'Given a scenario, implement host or application security solutions — Kernel vulnerability identification and privilege escalation', skill: 'Kernel Exploitation & Privilege Escalation' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — Root-level data extraction from hardened OS', skill: 'Multi-Stage Expert Attack Chain Completion' }
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
            'Loading hardware security module... HSM-BYPASS: DISABLED',
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
            { id: 'browser',  label: 'Firefox',     icon: '\uD83C\uDF10',        app: 'browser'  },
            { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD',        app: 'notes'    },
            { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1',        app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9',        app: 'flags'    }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.0.1.50 (AIR-GAP-BRIDGE — Chronos Syndicate)\nMission: Breach the Quantum Vault via quantum-resistant cipher exploitation.\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state machine)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',      // 'attacker' | 'bridge-shell' | 'chronos-user' | 'chronos-root'
    _cipherAnalyzed: false,
    _keyRecovered: false,
    _signalSent: false,
    _tempSshOpen: false,
    _chronosAccess: false,
    _rootAccess: false,

    _switchContext(ctx, term) {
        C10Config._context = ctx;
        // Update terminal prompt to reflect current host/privilege
        if (term && term.config) {
            var prompt = C10Config._getPrompt();
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
        switch (C10Config._context) {
            case 'bridge-shell':  return 'bridgeop@AIR-GAP-BRIDGE:~$ ';
            case 'chronos-user':  return 'operator@CHRONOS-OS-01:~$ ';
            case 'chronos-root':  return 'root@CHRONOS-OS-01:~# ';
            default: return null;  // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'cipher', points: 200 },
        { id: 'airgap',  points: 300 },
        { id: 'root',    points: 500 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 3000,
        maxScore: 1000,
        hintPenalty: true,
        wrongFlagPenalty: -50,
        speedBonus: { threshold: 3600000, points: 300 },   // 60 minutes
        timeBonusThreshold: 7200                           // 120 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start with: nmap -sV 10.0.1.50 — the bridge server exposes a file share on port 8080 and a custom acoustic bridge daemon on port 9001. Download quantum-cipher-v1.0.tar.gz from the HTTP service, then run: analyze-cipher to inspect the key generation routine.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The cipher reuses the same nonce across two key encapsulation ciphertexts. Run: recover-key ciphertext_a.enc ciphertext_b.enc — this XORs the ciphertexts to cancel the plaintext relationship and expose the raw keystream, revealing the 32-byte vault access key.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Once you have the vault key, use the signal generator to bridge the air gap: signal-gen --freq 440 --key <vault_key> | acoustic-send 10.0.1.50:9001 — the bridge daemon validates the HMAC of the acoustic payload and, if correct, opens TCP/2222 on CHRONOS-OS-01 for 60 seconds. SSH in: ssh -p 2222 operator@10.0.1.200',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'On CHRONOS-OS-01 run: lsmod | grep chronos — the chronos_ksec kernel module exposes /proc/chronos_ksec. The UAF vulnerability: write a free trigger to offset 0x18, then reallocate with controlled data containing a function pointer. Use: ./chronos_exploit to automate the UAF chain and spawn a root shell.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The "Chronos Syndicate" is a shadowy research collective that claims to have cracked the physics of temporal manipulation. Their most valuable secret — the "Temporal Paradigm Shift Protocol" — is locked inside the Quantum Vault: a completely air-gapped server running the custom-hardened CHRONOS-OS-01. The only path in is through QUANTUM-CIPHER-V1.0, the Syndicate\'s supposedly unbreakable communication layer. Your mission, Peerless: break the cipher, breach the air gap, own the kernel, and extract the Protocol.',
        scenario: 'QUANTUM-CIPHER-V1.0 is a lattice-inspired key encapsulation mechanism the Syndicate rolled in-house. Their lead developer was brilliant but rushed — two intercepted ciphertexts reveal a catastrophic nonce-reuse flaw. Break it and you recover the acoustic signal key that unlocks the bridge between the external network and the air-gapped Quantum Vault. From there, a custom kernel module (chronos_ksec) with a UAF bug is all that stands between you and root on CHRONOS-OS-01.',
        outro: 'The Quantum Vault has fallen. The Temporal Paradigm Shift Protocol — the Syndicate\'s roadmap for exploiting spacetime — is extracted. Their cipher was theoretically sound but practically shattered by a single line of bad code. The air gap was theater. And the "hardened" OS had a UAF in its crown jewel kernel module. The Chronos Syndicate trusted math they never bothered to implement correctly.',
        ecer: {
            executive: 'Syndicate leadership approved QUANTUM-CIPHER-V1.0 for production after a single internal review; no external cryptographic audit was performed',
            culture: 'Research-first culture with zero adversarial security review; developers self-certified their own cryptographic implementations',
            employee: 'Nonce reuse in key encapsulation due to a stateless RNG initialization bug; chronos_ksec kernel module deployed with a UAF in the ioctl handler; acoustic bridge validated only HMAC, not replay timestamps',
            regulatory: 'No formal security certification for CHRONOS-OS-01; air gap treated as a compliance checkbox rather than a defense-in-depth control; no code review for kernel modules'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Chronos Syndicate Bridge File Server
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.0.1.50:8080/',

        pages: {
            '/': {
                title: 'AIR-GAP-BRIDGE — Chronos File Repository',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #2d1f4e;">
                        <h1 style="color:#c4b5fd; font-size:1.5rem; font-family:monospace; margin-bottom:4px; letter-spacing:0.05em;">CHRONOS SYNDICATE</h1>
                        <div style="color:#8b5cf6; font-size:0.85rem; font-weight:700; letter-spacing:0.2em;">INTERNAL RESEARCH FILE REPOSITORY</div>
                        <div style="color:#666; font-size:0.72rem; margin-top:6px;">AIR-GAP-BRIDGE :: 10.0.1.50:8080 :: RESTRICTED ACCESS</div>
                    </div>

                    <div style="max-width:620px; margin:0 auto 20px; background:#100a1f; border:1px solid #2d1f4e; border-radius:6px; padding:16px;">
                        <div style="color:#a78bfa; font-size:0.75rem; font-weight:700; letter-spacing:0.1em; margin-bottom:12px;">AVAILABLE ARTIFACTS</div>
                        <div style="display:flex; flex-direction:column; gap:8px;">
                            <a href="/quantum-cipher-v1.0.tar.gz"
                               style="display:flex; align-items:center; gap:12px; padding:10px 14px; background:#1a0f35; border:1px solid #3d2a6e; border-radius:4px; color:#c4b5fd; text-decoration:none; font-family:monospace; font-size:0.8rem;">
                                <span style="color:#8b5cf6;">&#9654;</span>
                                quantum-cipher-v1.0.tar.gz
                                <span style="margin-left:auto; color:#555; font-size:0.7rem;">42.8 KB</span>
                            </a>
                            <a href="/intercepts/"
                               style="display:flex; align-items:center; gap:12px; padding:10px 14px; background:#1a0f35; border:1px solid #3d2a6e; border-radius:4px; color:#c4b5fd; text-decoration:none; font-family:monospace; font-size:0.8rem;">
                                <span style="color:#8b5cf6;">&#9654;</span>
                                intercepts/
                                <span style="margin-left:auto; color:#555; font-size:0.7rem;">DIR</span>
                            </a>
                            <a href="/docs/BRIDGE_DAEMON_PROTOCOL.txt"
                               style="display:flex; align-items:center; gap:12px; padding:10px 14px; background:#1a0f35; border:1px solid #3d2a6e; border-radius:4px; color:#c4b5fd; text-decoration:none; font-family:monospace; font-size:0.8rem;">
                                <span style="color:#8b5cf6;">&#9654;</span>
                                docs/BRIDGE_DAEMON_PROTOCOL.txt
                                <span style="margin-left:auto; color:#555; font-size:0.7rem;">3.1 KB</span>
                            </a>
                        </div>
                    </div>

                    <div style="max-width:620px; margin:0 auto; padding:10px; background:rgba(139,92,246,0.04); border:1px solid rgba(139,92,246,0.15); border-radius:4px; font-size:0.72rem; color:#555;">
                        <strong style="color:#8b5cf6;">SECURITY NOTICE:</strong> This repository is for internal Syndicate use only. Unauthorized access is a violation of Chronos Syndicate Code of Conduct Section 7.
                    </div>
                `,
                formHandler: null
            },
            '/quantum-cipher-v1.0.tar.gz': {
                title: 'Downloading quantum-cipher-v1.0.tar.gz',
                html: `
                    <div style="padding:20px; font-family:monospace; font-size:0.82rem; color:#c4b5fd;">
                        <div style="color:#8b5cf6; font-weight:700; margin-bottom:12px;">QUANTUM-CIPHER-V1.0 — Specification &amp; Reference Implementation</div>
                        <div style="background:#100a1f; border:1px solid #2d1f4e; border-radius:4px; padding:16px; white-space:pre; line-height:1.6; color:#a78bfa; font-size:0.75rem;">quantum-cipher-v1.0/
  README.md
  spec/
    KEM_SPEC.md         — Key Encapsulation Mechanism specification
    LATTICE_PARAMS.txt  — Lattice parameters (n=512, q=12289, sigma=3.19)
  src/
    keygen.c            — Key generation (ARM Linux build target)
    encap.c             — Key encapsulation
    decap.c             — Key decapsulation
  Makefile
  ciphertext_a.enc      — Intercepted ciphertext #1 (VAULT COMMS)
  ciphertext_b.enc      — Intercepted ciphertext #2 (VAULT COMMS)
  public_key.pem        — Vault server public key</div>
                        <div style="margin-top:14px; color:#666; font-size:0.72rem;">
                            Use <code style="color:#8b5cf6;">analyze-cipher</code> to inspect the key generation routine.<br>
                            Both ciphertext_a.enc and ciphertext_b.enc were captured from the vault comms channel.
                        </div>
                    </div>
                `,
                formHandler: null
            },
            '/intercepts/': {
                title: 'Intercepts Directory',
                html: `
                    <div style="padding:20px; font-family:monospace; font-size:0.82rem; color:#c4b5fd;">
                        <div style="color:#8b5cf6; font-weight:700; margin-bottom:12px;">Index of /intercepts/</div>
                        <div style="display:flex; flex-direction:column; gap:6px;">
                            <a href="/intercepts/ciphertext_a.enc" style="color:#a78bfa; text-decoration:none; padding:6px 0; border-bottom:1px solid #1a0f35;">ciphertext_a.enc — 128 bytes — VAULT COMM #1</a>
                            <a href="/intercepts/ciphertext_b.enc" style="color:#a78bfa; text-decoration:none; padding:6px 0; border-bottom:1px solid #1a0f35;">ciphertext_b.enc — 128 bytes — VAULT COMM #2</a>
                            <a href="/intercepts/nonce_debug.log"  style="color:#a78bfa; text-decoration:none; padding:6px 0; border-bottom:1px solid #1a0f35;">nonce_debug.log  — 512 bytes — DEBUG OUTPUT (left by accident)</a>
                        </div>
                        <div style="margin-top:14px; color:#666; font-size:0.72rem;">
                            Note: nonce_debug.log was accidentally left here during a diagnostic run. It contains keygen debug output.
                        </div>
                    </div>
                `,
                formHandler: null
            },
            '/intercepts/nonce_debug.log': {
                title: 'nonce_debug.log',
                html: `
                    <div style="padding:20px; font-family:monospace; font-size:0.78rem; color:#c4b5fd; white-space:pre; line-height:1.65;">
<span style="color:#8b5cf6;">[DEBUG] QUANTUM-CIPHER-V1.0 keygen diagnostic — 2026-01-15 03:47:22</span>
<span style="color:#666;">------------------------------------------------------------</span>
[KEYGEN] Lattice parameters loaded: n=512 q=12289 sigma=3.19
[KEYGEN] Seeding PRNG from /dev/urandom... OK
[KEYGEN] WARNING: PRNG state not persisted between sessions
[KEYGEN] nonce = 0xdeadbeef00cafe01  <span style="color:#f59e0b;">← STATIC FALLBACK ACTIVATED</span>
[ENCAP]  ciphertext_a: nonce=0xdeadbeef00cafe01 session=VAULT_COMMS_0x01
[ENCAP]  ciphertext_b: nonce=0xdeadbeef00cafe01 session=VAULT_COMMS_0x02
<span style="color:#ef4444;">[ERROR]  PRNG re-seeded with same entropy pool — nonce collision detected</span>
[DEBUG]  Proceeding anyway (non-critical path)
<span style="color:#666;">------------------------------------------------------------</span>
<span style="color:#555;">[DEBUG] This file should be deleted before production deployment.</span>
                    </div>
                `,
                formHandler: null
            },
            '/intercepts/ciphertext_a.enc': {
                title: 'ciphertext_a.enc',
                html: `<div style="padding:20px; font-family:monospace; font-size:0.78rem; color:#c4b5fd; white-space:pre; line-height:1.65;">
<span style="color:#8b5cf6;">[BINARY CIPHERTEXT — QUANTUM-CIPHER-V1.0 KEM OUTPUT]</span>
Header: QCKEM-V1 | session=VAULT_COMMS_0x01 | nonce=0xdeadbeef00cafe01
Ciphertext (hex):
  a3f1c8920de74b615f2a39087c6d4e52
  8b0e5f91c3a72d641098b7e2f30c1a89
  ...
  [128 bytes total]

<span style="color:#666;">Hint: XOR ciphertext_a with ciphertext_b to recover the keystream.</span>
</div>`,
                formHandler: null
            },
            '/intercepts/ciphertext_b.enc': {
                title: 'ciphertext_b.enc',
                html: `<div style="padding:20px; font-family:monospace; font-size:0.78rem; color:#c4b5fd; white-space:pre; line-height:1.65;">
<span style="color:#8b5cf6;">[BINARY CIPHERTEXT — QUANTUM-CIPHER-V1.0 KEM OUTPUT]</span>
Header: QCKEM-V1 | session=VAULT_COMMS_0x02 | nonce=0xdeadbeef00cafe01
Ciphertext (hex):
  d7a2e4018bf39c52614d870f3a9c2b74
  1c4f8e03a5b26d791284c3f5e71d0a56
  ...
  [128 bytes total]

<span style="color:#666;">Hint: Both messages share nonce 0xdeadbeef00cafe01. The keystream cancels when XORed.</span>
</div>`,
                formHandler: null
            },
            '/docs/BRIDGE_DAEMON_PROTOCOL.txt': {
                title: 'BRIDGE_DAEMON_PROTOCOL.txt',
                html: `<div style="padding:20px; font-family:monospace; font-size:0.78rem; color:#c4b5fd; white-space:pre; line-height:1.7;">
<span style="color:#8b5cf6;">CHRONOS SYNDICATE — ACOUSTIC BRIDGE DAEMON PROTOCOL v2.3</span>
<span style="color:#666;">================================================================</span>

OVERVIEW
  The acoustic bridge daemon (ABD) listens on the microphone array
  physically co-located with the Quantum Vault air-gap boundary.

  Port:    TCP 9001 (signal injection endpoint — external facing)
  Binary:  /opt/chronos/abd --listen 9001 --mic /dev/dsp0
  Log:     /var/log/abd.log

SIGNAL FORMAT
  Signals are injected via TCP/9001 as a structured payload:
    [4 bytes]  magic = 0x43484e53 ("CHNS")
    [32 bytes] vault_key (HMAC-SHA256 of the acoustic payload)
    [8 bytes]  timestamp (Unix epoch, uint64_le)
    [N bytes]  command (ASCII, null-terminated)

  Valid commands:
    OPEN_SSH_PORT   — opens TCP/2222 on CHRONOS-OS-01 for 60 seconds
    POWER_CYCLE     — issues controlled power cycle
    BEACON          — returns Vault status string

AUTHENTICATION
  The vault_key field must match the 32-byte secret recovered from
  QUANTUM-CIPHER-V1.0. Mismatches are silently dropped.

NOTE
  Replay protection: timestamp must be within 30 seconds of server time.
  <span style="color:#f59e0b;">KNOWN ISSUE (unfixed): timestamp validation not yet implemented in v2.3.</span>
  Scheduled for fix in v2.4.
</div>`,
                formHandler: null
            },
            '/admin/': {
                title: 'Forbidden',
                html: `<div style="text-align:center; padding:40px;">
                    <h1 style="color:#8b5cf6; font-size:2rem;">403 Forbidden</h1>
                    <p style="color:#888;">You don't have permission to access this resource.</p>
                    <p style="color:#555; font-size:0.75rem;">nginx/1.24.0 at 10.0.1.50 Port 8080</p>
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
                                    content: '=== MISSION BRIEFING: THE QUANTUM CIPHER HEIST ===\nTarget: 10.0.1.50 (AIR-GAP-BRIDGE — Chronos Syndicate)\nObjective: Multi-stage expert compromise & protocol extraction\n\nAttack chain:\n1. Scan AIR-GAP-BRIDGE — identify services (HTTP:8080, acoustic bridge:9001)\n2. Download & analyze QUANTUM-CIPHER-V1.0 — find the nonce-reuse flaw\n3. Run recover-key against intercepted ciphertexts — get 32-byte vault key\n4. Craft acoustic signal using vault key — bridge the air gap to CHRONOS-OS-01\n5. SSH in via temp port TCP/2222 on 10.0.1.200\n6. Exploit chronos_ksec UAF — escalate to root\n7. Read /root/temporal_protocol.txt\n\nRecon indicates the bridge file server has left some interesting debug logs.\nGood luck, operator.'
                                },
                                'recover-key.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# recover-key.py — QUANTUM-CIPHER-V1.0 nonce-reuse key recovery\n# Usage: python3 recover-key.py ciphertext_a.enc ciphertext_b.enc\n#\n# Exploit: both ciphertexts were encrypted with the same nonce.\n# C_a XOR C_b = P_a XOR P_b (keystream cancels)\n# Known plaintext P_a allows full keystream recovery.\n# Vault access key = HMAC-SHA256(keystream[0:32])\n\nimport sys, hashlib, hmac\n\ndef recover(ct_a, ct_b):\n    ks = bytes(a ^ b for a, b in zip(ct_a, ct_b))\n    key = hmac.new(ks[:32], b"VAULT_KEY_DERIVE", hashlib.sha256).digest()\n    return key.hex()\n\nif __name__ == "__main__":\n    # [Simulated — run: recover-key ciphertext_a.enc ciphertext_b.enc in terminal]\n    print("[+] Nonce-reuse detected. Recovering keystream...")\n    print("[+] Vault access key: 9f4e2c7a1b8d3e6f0a5c9b2e4d7f1a3c")'
                                },
                                'chronos_exploit.c': {
                                    type: 'file',
                                    content: '/* chronos_exploit.c — UAF exploit for chronos_ksec kernel module\n * Target: CHRONOS-OS-01 Alpine Linux 3.18 custom kernel\n * Vulnerability: Use-after-free in chronos_ksec ioctl handler (offset 0x18)\n *\n * Steps:\n *   1. Open /proc/chronos_ksec\n *   2. Trigger free via CHRONOS_IOCTL_FREE (0xC0)\n *   3. Spray heap with controlled function pointer\n *   4. Call CHRONOS_IOCTL_EXEC (0xC1) — now executes our pointer\n *   5. Pointer points to commit_creds(prepare_kernel_cred(NULL))\n */\n\n#include <stdio.h>\n#include <stdlib.h>\n#include <fcntl.h>\n#include <sys/ioctl.h>\n\n#define CHRONOS_IOCTL_FREE 0xC0\n#define CHRONOS_IOCTL_EXEC 0xC1\n\nint main() {\n    // [Simulated — run: ./chronos_exploit in terminal on CHRONOS-OS-01]\n    printf("[*] Targeting chronos_ksec UAF...\\n");\n    printf("[*] Triggering free at offset 0x18...\\n");\n    printf("[*] Spraying heap with privilege escalation payload...\\n");\n    printf("[+] UAF triggered. Root achieved.\\n");\n    return 0;\n}'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap -sV 10.0.1.50\nwget http://10.0.1.50:8080/quantum-cipher-v1.0.tar.gz\ntar -xzf quantum-cipher-v1.0.tar.gz\nanalyze-cipher quantum-cipher-v1.0/'
                                }
                            }
                        }
                    }
                },
                'opt': {
                    type: 'dir',
                    children: {
                        'chronos': {
                            type: 'dir',
                            children: {
                                'analyze-cipher': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# analyze-cipher — QUANTUM-CIPHER-V1.0 static analyzer\n# Usage: analyze-cipher <path_to_extracted_archive>'
                                },
                                'signal-gen': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# signal-gen — Acoustic signal generator for Chronos ABD protocol\n# Usage: signal-gen --freq 440 --key <vault_key>'
                                },
                                'acoustic-send': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# acoustic-send — Transmit structured payload to ABD TCP endpoint\n# Usage: signal-gen ... | acoustic-send <host>:<port>'
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
                        'hostname': { type: 'file', content: 'kali' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash'
                        }
                    }
                },
                'tmp': { type: 'dir', children: {} }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM — AIR-GAP-BRIDGE (after SSH)
    // ═══════════════════════════════════════════════════════

    _bridgeFs: {
        '/': {
            type: 'dir',
            children: {
                'opt': {
                    type: 'dir',
                    children: {
                        'chronos': {
                            type: 'dir',
                            children: {
                                'abd': {
                                    type: 'file',
                                    content: '[ELF binary — Acoustic Bridge Daemon v2.3]\n[Use strings abd or ghidra to inspect]'
                                },
                                'abd.conf': {
                                    type: 'file',
                                    content: '# Acoustic Bridge Daemon Configuration\n[daemon]\nlisten_port = 9001\nmic_device  = /dev/dsp0\nlog_file    = /var/log/abd.log\n\n[auth]\n# vault_key is derived from QUANTUM-CIPHER-V1.0 KEM output\n# Do not hardcode — loaded dynamically from /opt/chronos/vault_key.bin\nvault_key_path = /opt/chronos/vault_key.bin\n\n[target]\n# Air-gapped network — physical acoustic channel only\nvault_ip   = 10.0.1.200\nvault_port = 2222'
                                },
                                'vault_key.bin': {
                                    type: 'file',
                                    content: '[BINARY — 32 bytes]\n[Recovered by cryptanalysis: 9f4e2c7a1b8d3e6f0a5c9b2e4d7f1a3c]\n{{FLAG:cipher}}'
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
                                'abd.log': {
                                    type: 'file',
                                    content: '2026-01-15 03:47:22 [INFO]  ABD v2.3 started. Listening on TCP/9001.\n2026-01-15 03:47:22 [INFO]  Mic device /dev/dsp0 opened.\n2026-01-15 04:02:11 [INFO]  Signal received from 10.0.1.10:41234\n2026-01-15 04:02:11 [AUTH]  vault_key mismatch — payload dropped.\n2026-01-15 04:15:38 [INFO]  Beacon request received — VAULT: NOMINAL\n2026-03-20 00:00:00 [INFO]  ABD running. Awaiting valid signal.'
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'AIR-GAP-BRIDGE' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\nbridgeop:x:1001:1001:Bridge Operator:/home/bridgeop:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin'
                        }
                    }
                },
                'home': {
                    type: 'dir',
                    children: {
                        'bridgeop': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'sudo systemctl status abd\ncat /opt/chronos/abd.conf\nstrings /opt/chronos/abd\n/opt/chronos/signal-gen --freq 440 --key test | /opt/chronos/acoustic-send 10.0.1.200:9001\ncat /var/log/abd.log'
                                },
                                'bridge_notes.txt': {
                                    type: 'file',
                                    content: 'Bridge Operator Notes\n=====================\n- ABD daemon: /opt/chronos/abd (auto-starts on boot)\n- Vault key lives at /opt/chronos/vault_key.bin (32 bytes)\n- To send a signal: signal-gen --freq 440 --key <key> | acoustic-send 10.0.1.200:9001\n- Valid commands: OPEN_SSH_PORT, POWER_CYCLE, BEACON\n- OPEN_SSH_PORT opens TCP/2222 on the Vault for 60 seconds\n- Vault IP (air-gapped): 10.0.1.200\n- Timestamp replay protection NOT YET IMPLEMENTED (see v2.4 roadmap)'
                                }
                            }
                        }
                    }
                },
                'tmp': { type: 'dir', children: {} }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM — CHRONOS-OS-01 (after air gap breach)
    // ═══════════════════════════════════════════════════════

    _chronosFs: {
        '/': {
            type: 'dir',
            children: {
                'proc': {
                    type: 'dir',
                    children: {
                        'chronos_ksec': {
                            type: 'file',
                            content: '[KERNEL INTERFACE — chronos_ksec module]\nchronos_ksec: Chronos Kernel Security Module v1.0.4\nioctl commands: 0xC0 (CHRONOS_IOCTL_FREE), 0xC1 (CHRONOS_IOCTL_EXEC)\nStatus: LOADED\nRefcount: 3'
                        },
                        'version': {
                            type: 'file',
                            content: 'Linux version 5.15.0-chronos-hardened-01 (build@chronos-build-01) (gcc 12.2.0) #1 SMP PREEMPT_RT Alpine Linux'
                        }
                    }
                },
                'lib': {
                    type: 'dir',
                    children: {
                        'modules': {
                            type: 'dir',
                            children: {
                                '5.15.0-chronos-hardened-01': {
                                    type: 'dir',
                                    children: {
                                        'chronos_ksec.ko': {
                                            type: 'file',
                                            content: '[ELF kernel module — chronos_ksec.ko]\n[Load: modprobe chronos_ksec]\n[Inspect with: strings, objdump, ghidra]\n[Vulnerability: UAF in ioctl_handler at offset 0x18 — use-after-free on kfree then ioctl 0xC1]'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'home': {
                    type: 'dir',
                    children: {
                        'operator': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'uname -a\nlsmod | grep chronos\ncat /proc/chronos_ksec\nls /lib/modules/\nls /root/'
                                },
                                'CHRONOS-OS-01_README.txt': {
                                    type: 'file',
                                    content: 'CHRONOS-OS-01 — Air-Gapped Quantum Vault Server\n================================================\nOS: Alpine Linux 3.18 (custom hardened build)\nKernel: 5.15.0-chronos-hardened-01\n\nLoaded kernel modules:\n  chronos_ksec v1.0.4  — security enforcement module\n\nAccess to /root/ requires kernel-level privilege escalation.\nThere is no sudo, no SUID binaries, no cron.\nThe only path to root is through the kernel.\n\nGood luck.'
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'CHRONOS-OS-01' },
                        'os-release': {
                            type: 'file',
                            content: 'NAME="Alpine Linux"\nID=alpine\nVERSION_ID=3.18.4\nPRETTY_NAME="Alpine Linux v3.18 (Chronos Hardened Build)"\nHOME_URL="https://alpinelinux.org/"'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/sh\noperator:x:1000:1000:Vault Operator:/home/operator:/bin/sh'
                        },
                        'shadow': {
                            type: 'file',
                            content: 'cat: /etc/shadow: Permission denied'
                        }
                    }
                },
                'root': {
                    type: 'dir',
                    children: {
                        'temporal_protocol.txt': {
                            type: 'file',
                            content: '================================================\nCHRONOS SYNDICATE — TEMPORAL PARADIGM SHIFT PROTOCOL\nCLASSIFICATION: OMEGA-BLACK / EYES-ONLY\n================================================\n\nPhase I:  Temporal anchor deployment at coordinates T-0\nPhase II: Quantum decoherence cascade in target timeline\nPhase III: Chronon field inversion — 48-hour retroactive modification window\nPhase IV: Timeline stabilization via entanglement collapse\n\nNote: Do not disclose to any party outside Syndicate Core.\nUnauthorized access is a paradox violation.\n\n{{FLAG:root}}\n================================================'
                        }
                    }
                },
                'tmp': { type: 'dir', children: {} }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (box-specific tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        // --- RECONNAISSANCE ---

        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.0.1.50';
            const target = args.find(a => !a.startsWith('-')) || '';

            // Bridge server
            if (target === '10.0.1.50' || target === 'bridge') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.0.1.50 (AIR-GAP-BRIDGE)
Host is up (0.031s latency).
Not shown: 997 closed tcp ports

PORT     STATE SERVICE    VERSION
22/tcp   open  ssh        OpenSSH 9.3p1 Alpine
8080/tcp open  http       nginx 1.24.0
9001/tcp open  custom?    [Chronos Acoustic Bridge Daemon v2.3]

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 14.22 seconds`;
            }

            // Vault server — unreachable from attacker
            if (target === '10.0.1.200' && C10Config._context === 'attacker') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 5.01 seconds
[!] 10.0.1.200 is on the air-gapped segment. Not reachable from the external network.`;
            }

            // Vault server — reachable after temp SSH port opened
            if (target === '10.0.1.200' && C10Config._tempSshOpen) {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.0.1.200 (CHRONOS-OS-01)
Host is up (0.004s latency).
Not shown: 999 closed tcp ports

PORT     STATE SERVICE    VERSION
2222/tcp open  ssh        OpenSSH 9.3p1 Alpine [TEMPORARY — expires in ~60s]

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 6.78 seconds`;
            }

            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00009s latency).
All 1000 scanned ports on localhost are closed.
Nmap done: 1 IP address (1 host up) scanned in 0.08 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';

            if (target === '10.0.1.50') {
                return `PING 10.0.1.50 (10.0.1.50) 56(84) bytes of data.
64 bytes from 10.0.1.50: icmp_seq=1 ttl=64 time=31.2 ms
64 bytes from 10.0.1.50: icmp_seq=2 ttl=64 time=30.8 ms
64 bytes from 10.0.1.50: icmp_seq=3 ttl=64 time=31.4 ms

--- 10.0.1.50 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss`;
            }
            if (target === '10.0.1.200') {
                return `PING 10.0.1.200 (10.0.1.200) 56(84) bytes of data.

--- 10.0.1.200 ping statistics ---
3 packets transmitted, 0 received, 100% packet loss
[!] Air-gapped host — not reachable via ICMP from external network.`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        // --- CIPHER TOOLS ---

        'wget': function(args, term, engine) {
            const url = args.find(a => !a.startsWith('-')) || '';
            if (!url) return 'wget: missing URL\nUsage: wget [options] <URL>';
            if (url.includes('10.0.1.50') && url.includes('quantum-cipher')) {
                C10Config._cipherAnalyzed = false;  // ready to analyze
                return `--2026-03-20 12:00:01--  ${url}
Resolving 10.0.1.50... 10.0.1.50
Connecting to 10.0.1.50:8080... connected.
HTTP request sent, awaiting response... 200 OK
Length: 43827 (42.8K) [application/gzip]
Saving to: 'quantum-cipher-v1.0.tar.gz'

quantum-cipher-v1.0.tar.gz  100%[=============================>]  42.8K   218K/s   in 0.2s

2026-03-20 12:00:01 (218 KB/s) - 'quantum-cipher-v1.0.tar.gz' saved [43827/43827]
[+] Archive saved. Run: tar -xzf quantum-cipher-v1.0.tar.gz`;
            }
            if (url.includes('10.0.1.50')) {
                return `--2026-03-20 12:00:01--  ${url}
Resolving 10.0.1.50... 10.0.1.50
Connecting to 10.0.1.50:8080... connected.
HTTP request sent, awaiting response... 200 OK
[+] File downloaded.`;
            }
            return `wget: unable to resolve host address '${url.replace(/https?:\/\//, '').split('/')[0]}'`;
        },

        'tar': function(args) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('quantum-cipher')) {
                return `quantum-cipher-v1.0/
quantum-cipher-v1.0/README.md
quantum-cipher-v1.0/spec/KEM_SPEC.md
quantum-cipher-v1.0/spec/LATTICE_PARAMS.txt
quantum-cipher-v1.0/src/keygen.c
quantum-cipher-v1.0/src/encap.c
quantum-cipher-v1.0/src/decap.c
quantum-cipher-v1.0/Makefile
quantum-cipher-v1.0/ciphertext_a.enc
quantum-cipher-v1.0/ciphertext_b.enc
quantum-cipher-v1.0/public_key.pem
[+] Extracted to quantum-cipher-v1.0/`;
            }
            return 'tar: unrecognized operation\nUsage: tar [options] <archive>';
        },

        'analyze-cipher': function(args, term, engine) {
            C10Config._cipherAnalyzed = true;
            if (engine) engine.advancePhase && engine.advancePhase('cryptanalysis');
            return `[*] QUANTUM-CIPHER-V1.0 Static Analyzer
[*] Inspecting keygen.c...

  Key generation routine: lattice-based KEM (n=512, q=12289, sigma=3.19)
  PRNG source: /dev/urandom (seeded at startup)

  [!] CRITICAL FLAW DETECTED in keygen.c:
  ---------------------------------------------------
  Line 147: nonce = prng_generate();  // First call — OK
  Line 212: nonce = prng_generate();  // Second call

  WARNING: PRNG is not re-seeded between encapsulations.
  If entropy pool is exhausted or state is not persisted,
  both calls return the SAME nonce value.

  RESULT: Both ciphertext_a.enc and ciphertext_b.enc
  were encrypted with nonce = 0xdeadbeef00cafe01.

  Nonce reuse in KEM = full keystream recovery via XOR attack.
  ---------------------------------------------------

[+] Flaw confirmed. Run: recover-key ciphertext_a.enc ciphertext_b.enc`;
        },

        'recover-key': function(args, term, engine) {
            if (!C10Config._cipherAnalyzed) {
                return '[!] You need to analyze the cipher first. Run: analyze-cipher quantum-cipher-v1.0/';
            }
            if (args.length < 2) {
                return 'Usage: recover-key <ciphertext_a> <ciphertext_b>\nExample: recover-key ciphertext_a.enc ciphertext_b.enc';
            }
            C10Config._keyRecovered = true;
            if (engine) engine.advancePhase && engine.advancePhase('cryptanalysis');
            return `[*] recover-key — QUANTUM-CIPHER-V1.0 Nonce-Reuse Attack
[*] Loading ${args[0]}...  OK (128 bytes)
[*] Loading ${args[1]}...  OK (128 bytes)

[*] Nonce collision confirmed: 0xdeadbeef00cafe01 (both messages)
[*] Computing C_a XOR C_b...
[*] Applying known-plaintext to isolate keystream...
[*] Deriving vault access key via HMAC-SHA256(keystream[0:32], "VAULT_KEY_DERIVE")...

[+] ============================================================
[+] VAULT ACCESS KEY RECOVERED:
[+] 9f4e2c7a1b8d3e6f0a5c9b2e4d7f1a3c
[+] ============================================================

[+] Key is 32 bytes (256-bit). Use with acoustic-send to bridge the air gap.
[+] See: BRIDGE_DAEMON_PROTOCOL.txt for signal format.`;
        },

        'python3': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('recover-key') || fullCmd.includes('recover_key')) {
                return C10Config.commands['recover-key'](['ciphertext_a.enc', 'ciphertext_b.enc'], term, engine);
            }
            if (fullCmd.includes('signal') || fullCmd.includes('acoustic')) {
                return C10Config.commands['signal-gen'](['--freq', '440', '--key', '9f4e2c7a1b8d3e6f0a5c9b2e4d7f1a3c'], term, engine);
            }
            return 'Python 3.11.6\n[+] Script executed. (Use the built-in tools: analyze-cipher, recover-key, signal-gen, acoustic-send)';
        },

        // --- AIR GAP BREACH ---

        'signal-gen': function(args, term, engine) {
            if (!C10Config._keyRecovered) {
                return '[!] No vault key available. Run recover-key first to obtain the 32-byte vault access key.';
            }
            const keyArg = args[args.indexOf('--key') + 1] || '';
            if (!keyArg || keyArg.length < 8) {
                return 'Usage: signal-gen --freq <hz> --key <vault_key>\nExample: signal-gen --freq 440 --key 9f4e2c7a1b8d3e6f0a5c9b2e4d7f1a3c';
            }
            return `[*] signal-gen v1.2 — Acoustic Signal Generator
[*] Carrier frequency: 440 Hz
[*] Vault key:        ${keyArg}
[*] Command:          OPEN_SSH_PORT
[*] Timestamp:        1742428800 (2026-03-20 12:00:00 UTC)
[*] Building CHNS magic header...
[*] Encoding payload as FSK modulation at 1200 baud...
[+] Signal ready. Pipe to acoustic-send:
    signal-gen --freq 440 --key ${keyArg} | acoustic-send 10.0.1.50:9001`;
        },

        'acoustic-send': function(args, term, engine) {
            if (!C10Config._keyRecovered) {
                return '[!] No signal payload. Run signal-gen --freq 440 --key <vault_key> first.';
            }
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target.includes('9001') && !target.includes('10.0.1.50')) {
                return 'Usage: acoustic-send <host>:<port>\nExample: acoustic-send 10.0.1.50:9001';
            }
            C10Config._signalSent = true;
            C10Config._tempSshOpen = true;
            if (engine) engine.advancePhase && engine.advancePhase('airgap');
            return `[*] acoustic-send v1.2 — ABD Signal Transmitter
[*] Connecting to 10.0.1.50:9001...  connected
[*] Transmitting payload (magic=CHNS, cmd=OPEN_SSH_PORT)...
[*] Waiting for ACK...

[+] ABD RESPONSE: SIGNAL AUTHENTICATED
[+] ABD RESPONSE: OPEN_SSH_PORT command relayed to VAULT via acoustic channel
[+] ABD RESPONSE: TCP/2222 opened on CHRONOS-OS-01 (10.0.1.200) for 60 seconds

[+] ============================================================
[+] AIR GAP BREACHED
[+] SSH available at: 10.0.1.200:2222
[+] Credentials: operator / ch@ng3m3n0w!
[+] {{FLAG:airgap}}
[+] ============================================================

[!] Window closes in 60 seconds. Connect immediately: ssh -p 2222 operator@10.0.1.200`;
        },

        // --- SSH & CHRONOS-OS-01 ACCESS ---

        'ssh': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // SSH to bridge server
            if ((fullCmd.includes('bridgeop') || fullCmd.includes('10.0.1.50')) && !fullCmd.includes('10.0.1.200')) {
                C10Config._switchContext('bridge-shell', term);
                return `The authenticity of host '10.0.1.50 (10.0.1.50)' can't be established.
ED25519 key fingerprint is SHA256:pQ7wR3mK9nL2xB6tA4vD8eF5yH1gC0uJ2sN8oM3iP4.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '10.0.1.50' (ED25519) to the list of known hosts.
bridgeop@10.0.1.50's password: ********

Welcome to AIR-GAP-BRIDGE (Alpine Linux 3.18)
Last login: Wed Mar 19 21:44:17 2026

bridgeop@AIR-GAP-BRIDGE:~$

[+] SSH session established. You are now on AIR-GAP-BRIDGE as bridgeop.`;
            }

            // SSH to CHRONOS-OS-01 via temp port
            if ((fullCmd.includes('operator') || fullCmd.includes('10.0.1.200')) && fullCmd.includes('2222')) {
                if (!C10Config._tempSshOpen) {
                    return `ssh: connect to host 10.0.1.200 port 2222: Connection refused
[!] TCP/2222 is not open on CHRONOS-OS-01 yet. You must breach the air gap first.
[!] Run: signal-gen --freq 440 --key <vault_key> | acoustic-send 10.0.1.50:9001`;
                }
                C10Config._chronosAccess = true;
                C10Config._switchContext('chronos-user', term);
                if (engine) engine.advancePhase && engine.advancePhase('kernelexploit');
                return `The authenticity of host '[10.0.1.200]:2222 ([10.0.1.200]:2222)' can't be established.
ED25519 key fingerprint is SHA256:qV8xT4nR2mJ7yA5wC9eB3fG6hD1kL0pN4oS7iU2mW5.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '[10.0.1.200]:2222' (ED25519) to the list of known hosts.
operator@10.0.1.200's password: ********

Welcome to CHRONOS-OS-01 — Quantum Vault Server
Alpine Linux 3.18 (Chronos Hardened Build)
Kernel: 5.15.0-chronos-hardened-01

[WARNING] This system is air-gapped. Unauthorized access is a paradox violation.
Last login: Never (first temporal access recorded)

operator@CHRONOS-OS-01:~$

[+] Initial shell on CHRONOS-OS-01 as operator.
[+] Context switched. Enumerate the system and escalate to root.`;
            }

            return 'Usage: ssh [-p port] [user@]hostname\nExample: ssh -p 2222 operator@10.0.1.200';
        },

        'ip': function(args) {
            if (C10Config._context === 'bridge-shell') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.1.50/24 brd 10.0.1.255 scope global eth0
3: acoustic0: <ACOUSTIC,UP,LOWER_UP> mtu 256
    [physical acoustic channel to air-gapped segment]`;
            }
            if (C10Config._context === 'chronos-user' || C10Config._context === 'chronos-root') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.1.200/24 brd 10.0.1.255 scope global eth0
    [AIR-GAPPED — no external routing]`;
            }
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.2.15/24 brd 10.0.2.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return C10Config.commands.ip(args || []);
        },

        // --- CHRONOS-OS-01 ENUMERATION ---

        'uname': function(args, term, engine) {
            if (C10Config._context === 'chronos-user' || C10Config._context === 'chronos-root') {
                return 'Linux CHRONOS-OS-01 5.15.0-chronos-hardened-01 #1 SMP PREEMPT_RT Alpine Linux';
            }
            if (C10Config._context === 'bridge-shell') {
                return 'Linux AIR-GAP-BRIDGE 5.15.0-95-generic #105-Ubuntu SMP x86_64 GNU/Linux';
            }
            return 'Linux kali 6.1.0-kali9-amd64 #1 SMP x86_64 GNU/Linux';
        },

        'lsmod': function(args, term, engine) {
            if (C10Config._context !== 'chronos-user' && C10Config._context !== 'chronos-root') {
                return 'lsmod: command not found (not on CHRONOS-OS-01)\n[!] SSH to CHRONOS-OS-01 first: ssh -p 2222 operator@10.0.1.200';
            }
            return `Module                  Size  Used by
chronos_ksec           16384  1
nf_tables              98304  0
libcrc32c              16384  1 nf_tables
nft_chain_route_ipv4   16384  1 nf_tables
ip_tables              32768  1 iptable_filter
x_tables               49152  2 ip_tables,nf_tables

[+] chronos_ksec is loaded. Inspect: cat /proc/chronos_ksec`;
        },

        'dmesg': function(args, term, engine) {
            if (C10Config._context !== 'chronos-user' && C10Config._context !== 'chronos-root') {
                return '[  0.000000] Initializing cgroup subsys cpuset\n[  0.000000] Linux version 6.1.0-kali9-amd64\n[  0.000000] Kali GNU/Linux attacker machine';
            }
            return `[    0.000000] Linux version 5.15.0-chronos-hardened-01
[    0.000000] CHRONOS-OS-01: Custom hardened Alpine kernel
[    0.000000] PREEMPT_RT patches applied
[    1.234567] chronos_ksec: Chronos Kernel Security Module v1.0.4 loaded
[    1.234891] chronos_ksec: ioctl handler registered at /proc/chronos_ksec
[    1.235012] chronos_ksec: WARNING — object lifecycle tracking not thread-safe
[   12.331044] SSH temporary port TCP/2222 opened by acoustic signal
[   12.331100] SSH temporary port TCP/2222 will auto-close in 60 seconds`;
        },

        'find': function(args, term, engine) {
            if (C10Config._context === 'chronos-user') {
                const target = args.join(' ');
                if (target.includes('suid') || target.includes('perm') || target.includes('4000')) {
                    return `find: No SUID binaries found.
[!] CHRONOS-OS-01 has no SUID binaries by design.
[*] Hint: Escalation path is through the chronos_ksec kernel module UAF.`;
                }
                if (target.includes('sudo') || target.includes('cron')) {
                    return `find: No sudo binary found.
[!] CHRONOS-OS-01 has no sudo, no cron, no writable system paths.
[*] Hint: Your only path to root is via the chronos_ksec kernel module.`;
                }
            }
            return null;  // fall through to built-in
        },

        'sudo': function(args) {
            if (C10Config._context === 'chronos-user') {
                return 'sudo: command not found\n[!] CHRONOS-OS-01 does not have sudo installed.';
            }
            return 'sudo: command not found';
        },

        // --- KERNEL EXPLOIT ---

        'gcc': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (C10Config._context !== 'chronos-user' && C10Config._context !== 'chronos-root') {
                return 'gcc: command not found';
            }
            if (fullCmd.includes('chronos_exploit')) {
                return `[*] gcc: compiling chronos_exploit.c...
[+] Compiled: ./chronos_exploit`;
            }
            return `[*] gcc: compiling...
[+] Compiled successfully.`;
        },

        './chronos_exploit': function(args, term, engine) {
            if (C10Config._context !== 'chronos-user') {
                return `-bash: ./chronos_exploit: No such file or directory
[!] You need to be on CHRONOS-OS-01 as operator and compile the exploit first.`;
            }
            C10Config._rootAccess = true;
            C10Config._switchContext('chronos-root', term);
            if (engine) engine.advancePhase && engine.advancePhase('kernelexploit');
            return `[*] chronos_exploit — chronos_ksec UAF Exploit
[*] Opening /proc/chronos_ksec...
[*] Step 1: Triggering CHRONOS_IOCTL_FREE (0xC0) at offset 0x18...
[*] Step 2: Spraying slab with controlled object (8 threads)...
[*] Step 3: Reallocated. Function pointer overwritten.
[*] Step 4: Calling CHRONOS_IOCTL_EXEC (0xC1)...
[*] Executing: commit_creds(prepare_kernel_cred(NULL))...

[+] ======================================================
[+] PRIVILEGE ESCALATION SUCCESSFUL
[+] uid=0(root) gid=0(root) groups=0(root)
[+] ======================================================

root@CHRONOS-OS-01:~#`;
        },

        'chronos_exploit': function(args, term, engine) {
            // Allow without ./ prefix too
            return C10Config.commands['./chronos_exploit'](args, term, engine);
        },

        // --- ROOT CONTEXT COMMANDS ---

        'cat': function(args, term, engine) {
            // Only intercept when on CHRONOS-OS-01 contexts
            if (C10Config._context !== 'chronos-user' && C10Config._context !== 'chronos-root') {
                return null;  // fall through to built-in
            }
            const path = (args[0] || '').trim();

            if (path === '/root/temporal_protocol.txt' || path.includes('temporal_protocol')) {
                if (!C10Config._rootAccess) {
                    return `cat: /root/temporal_protocol.txt: Permission denied
[!] You need root access. Exploit the chronos_ksec UAF first.`;
                }
                if (engine) engine.advancePhase && engine.advancePhase('extraction');
                return `================================================
CHRONOS SYNDICATE — TEMPORAL PARADIGM SHIFT PROTOCOL
CLASSIFICATION: OMEGA-BLACK / EYES-ONLY
================================================

Phase I:  Temporal anchor deployment at coordinates T-0
Phase II: Quantum decoherence cascade in target timeline
Phase III: Chronon field inversion — 48-hour retroactive modification window
Phase IV: Timeline stabilization via entanglement collapse

Note: Do not disclose to any party outside Syndicate Core.
Unauthorized access is a paradox violation.

{{FLAG:root}}
================================================`;
            }
            if (path === '/proc/chronos_ksec') {
                return `chronos_ksec: Chronos Kernel Security Module v1.0.4
ioctl commands: 0xC0 (CHRONOS_IOCTL_FREE), 0xC1 (CHRONOS_IOCTL_EXEC)
Status: LOADED
Refcount: 3

[*] Hint: CHRONOS_IOCTL_FREE frees the internal object. CHRONOS_IOCTL_EXEC calls a stored function pointer.
[*] If the object is freed and reallocated with attacker-controlled data before EXEC is called, UAF achieved.`;
            }
            if (path === '/etc/hostname') {
                if (C10Config._context === 'chronos-user' || C10Config._context === 'chronos-root') return 'CHRONOS-OS-01';
                if (C10Config._context === 'bridge-shell') return 'AIR-GAP-BRIDGE';
            }
            if (path === '/etc/passwd') {
                if (C10Config._context === 'chronos-user' || C10Config._context === 'chronos-root') {
                    return 'root:x:0:0:root:/root:/bin/sh\noperator:x:1000:1000:Vault Operator:/home/operator:/bin/sh';
                }
            }
            if (path === '/etc/shadow') {
                if (!C10Config._rootAccess) return 'cat: /etc/shadow: Permission denied';
                return 'root:$6$chronos$x9F3yK2mL8pQ1wE4bR7vN0jH5cS6tA3dI2gU8oM1nP9:19097:0:99999:7:::\noperator:$6$vault$k2P8nM4qR1xB7wF5tL3eH6cA9dS0jU2gI4oN8vT1mK5:19097:0:99999:7:::';
            }
            if (path.includes('.bash_history')) {
                if (C10Config._context === 'chronos-user' || C10Config._context === 'chronos-root') {
                    return 'uname -a\nlsmod | grep chronos\ncat /proc/chronos_ksec\nls /lib/modules/\nls /root/';
                }
                if (C10Config._context === 'bridge-shell') {
                    return 'sudo systemctl status abd\ncat /opt/chronos/abd.conf\nstrings /opt/chronos/abd\ncat /var/log/abd.log';
                }
            }
            if (path.includes('abd.conf')) {
                if (C10Config._context === 'bridge-shell') {
                    return `# Acoustic Bridge Daemon Configuration
[daemon]
listen_port = 9001
mic_device  = /dev/dsp0
log_file    = /var/log/abd.log

[auth]
vault_key_path = /opt/chronos/vault_key.bin

[target]
vault_ip   = 10.0.1.200
vault_port = 2222`;
                }
            }
            if (path.includes('vault_key.bin') && C10Config._context === 'bridge-shell') {
                return `[BINARY FILE — 32 bytes]\n[Hex dump]: 9f 4e 2c 7a 1b 8d 3e 6f 0a 5c 9b 2e 4d 7f 1a 3c\n            [remainder of 32-byte key]\n\n{{FLAG:cipher}}`;
            }
            if (path.includes('bridge_notes')) {
                return `Bridge Operator Notes
=====================
- ABD daemon: /opt/chronos/abd (auto-starts on boot)
- Vault key lives at /opt/chronos/vault_key.bin (32 bytes)
- To send a signal: signal-gen --freq 440 --key <key> | acoustic-send 10.0.1.200:9001
- Valid commands: OPEN_SSH_PORT, POWER_CYCLE, BEACON
- OPEN_SSH_PORT opens TCP/2222 on the Vault for 60 seconds
- Vault IP (air-gapped): 10.0.1.200
- Timestamp replay protection NOT YET IMPLEMENTED (see v2.4 roadmap)`;
            }
            if (path.includes('abd.log')) {
                return `2026-01-15 03:47:22 [INFO]  ABD v2.3 started. Listening on TCP/9001.
2026-01-15 04:02:11 [AUTH]  vault_key mismatch — payload dropped.
2026-03-20 00:00:00 [INFO]  ABD running. Awaiting valid signal.`;
            }
            return null;  // fall through to built-in for unknown paths
        },

        'ls': function(args, term, engine) {
            if (C10Config._context !== 'chronos-user' && C10Config._context !== 'chronos-root' && C10Config._context !== 'bridge-shell') {
                return null;  // fall through to built-in
            }
            const flagArg = args.find(a => a.startsWith('-')) || '';
            const pathArg = args.find(a => !a.startsWith('-')) || '.';

            if (C10Config._context === 'chronos-user' || C10Config._context === 'chronos-root') {
                if (pathArg === '.' || pathArg === '~' || pathArg === '/home/operator') {
                    return `.bash_history  .bashrc  CHRONOS-OS-01_README.txt  chronos_exploit.c  chronos_exploit`;
                }
                if (pathArg === '/root') {
                    if (!C10Config._rootAccess) return `ls: cannot open directory '/root': Permission denied`;
                    return 'temporal_protocol.txt';
                }
                if (pathArg === '/proc' || pathArg.includes('/proc')) {
                    return 'chronos_ksec  version  meminfo  cpuinfo  mounts  net';
                }
                if (pathArg.includes('/lib/modules')) {
                    return '5.15.0-chronos-hardened-01';
                }
                if (pathArg.includes('/opt') || pathArg.includes('chronos')) {
                    return 'chronos_ksec.ko';
                }
                return '';
            }
            if (C10Config._context === 'bridge-shell') {
                if (pathArg === '.' || pathArg === '~' || pathArg === '/home/bridgeop') {
                    return '.bash_history  .bashrc  bridge_notes.txt';
                }
                if (pathArg.includes('/opt/chronos')) {
                    return 'abd  abd.conf  vault_key.bin  signal-gen  acoustic-send';
                }
                if (pathArg.includes('/var/log')) {
                    return 'abd.log  auth.log  syslog';
                }
                return '';
            }
            return null;
        },

        'whoami': function(args, term, engine) {
            if (C10Config._context === 'bridge-shell')  return 'bridgeop';
            if (C10Config._context === 'chronos-user')  return 'operator';
            if (C10Config._context === 'chronos-root')  return 'root';
            return null;  // fall through to built-in
        },

        'id': function(args, term, engine) {
            if (C10Config._context === 'bridge-shell')  return 'uid=1001(bridgeop) gid=1001(bridgeop) groups=1001(bridgeop)';
            if (C10Config._context === 'chronos-user')  return 'uid=1000(operator) gid=1000(operator) groups=1000(operator)';
            if (C10Config._context === 'chronos-root')  return 'uid=0(root) gid=0(root) groups=0(root)';
            return null;  // fall through to built-in
        },

        'hostname': function(args, term, engine) {
            if (C10Config._context === 'bridge-shell')  return 'AIR-GAP-BRIDGE';
            if (C10Config._context === 'chronos-user')  return 'CHRONOS-OS-01';
            if (C10Config._context === 'chronos-root')  return 'CHRONOS-OS-01';
            return null;  // fall through to built-in
        },

        'pwd': function(args, term, engine) {
            if (C10Config._context === 'bridge-shell')  return '/home/bridgeop';
            if (C10Config._context === 'chronos-user')  return '/home/operator';
            if (C10Config._context === 'chronos-root')  return '/root';
            return null;  // fall through to built-in
        },

        'cd': function(args, term, engine) {
            if (C10Config._context !== 'attacker') return '';  // silently accept on remote hosts
            return null;  // fall through to built-in
        },

        'exit': function(args, term, engine) {
            if (C10Config._context === 'chronos-root' || C10Config._context === 'chronos-user') {
                C10Config._switchContext('attacker', term);
                return 'Connection to 10.0.1.200 closed.\n[+] Returned to attacker machine.';
            }
            if (C10Config._context === 'bridge-shell') {
                C10Config._switchContext('attacker', term);
                return 'Connection to 10.0.1.50 closed.\n[+] Returned to attacker machine.';
            }
            return 'logout';
        },

        'ss': function(args) {
            if (C10Config._context === 'bridge-shell') {
                return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*
LISTEN   0        128      0.0.0.0:8080         0.0.0.0:*
LISTEN   0        128      0.0.0.0:9001         0.0.0.0:*`;
            }
            if (C10Config._context === 'chronos-user' || C10Config._context === 'chronos-root') {
                return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:2222         0.0.0.0:*
[NOTE]   TCP/2222 is a temporary port — auto-closes after 60s`;
            }
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*`;
        },

        'netstat': function(args) {
            return C10Config.commands.ss(args);
        },

        'strings': function(args) {
            const target = (args[0] || '').toLowerCase();
            if (target.includes('abd') || target.includes('acoustic')) {
                return `CHNS
VAULT_KEY_DERIVE
OPEN_SSH_PORT
POWER_CYCLE
BEACON
vault_key_path
/opt/chronos/vault_key.bin
/dev/dsp0
TCP/%d opened on %s for %d seconds
Chronos Acoustic Bridge Daemon v2.3
Usage: abd --listen <port> --mic <device>`;
            }
            if (target.includes('chronos_ksec') || target.includes('.ko')) {
                return `chronos_ksec
Chronos Kernel Security Module v1.0.4
/proc/chronos_ksec
CHRONOS_IOCTL_FREE
CHRONOS_IOCTL_EXEC
kfree
kmalloc
WARNING: object lifecycle not thread-safe
commit_creds
prepare_kernel_cred`;
            }
            return `[strings output for ${args[0] || 'binary'}]`;
        },

        'objdump': function(args) {
            const target = (args[args.length - 1] || '').toLowerCase();
            if (target.includes('chronos_ksec')) {
                return `chronos_ksec.ko:     file format elf64-x86-64

Disassembly of section .text:

0000000000000000 <chronos_ioctl_handler>:
   0: 55                      push   %rbp
   4: 48 89 e5                mov    %rsp,%rbp
  18: e8 00 00 00 00          call   kfree     <-- FREE happens here
  28: 48 8b 40 10             mov    0x10(%rax),%rax
  2c: ff d0                   call   *%rax     <-- EXEC calls stored fn ptr
  [!] CHRONOS_IOCTL_FREE at offset 0x18 frees obj without clearing pointer
  [!] CHRONOS_IOCTL_EXEC at 0x2c dereferences the same pointer = UAF`;
            }
            return `objdump: ${args[args.length - 1] || 'file'}: No such file or directory`;
        },

        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            const url = args.find(a => !a.startsWith('-') && (a.startsWith('http') || a.includes('10.0.1'))) || '';

            if (url.includes('10.0.1.50:8080')) {
                if (url.includes('quantum-cipher')) {
                    return C10Config.commands.wget([url], term, engine);
                }
                if (url.endsWith('/') || url.endsWith(':8080')) {
                    return `<!DOCTYPE html>
<html>
<head><title>Chronos Syndicate — File Repository</title></head>
<body>
<h1>CHRONOS SYNDICATE INTERNAL RESEARCH FILE REPOSITORY</h1>
<p><a href="quantum-cipher-v1.0.tar.gz">quantum-cipher-v1.0.tar.gz</a> (42.8 KB)</p>
<p><a href="intercepts/">intercepts/</a></p>
<p><a href="docs/BRIDGE_DAEMON_PROTOCOL.txt">docs/BRIDGE_DAEMON_PROTOCOL.txt</a></p>
</body>
</html>`;
                }
            }
            if (!url) return 'curl: try \'curl --help\' for more information';
            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#8b5cf6; border-bottom:2px solid #2d1f4e; background:#100a1f;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #1a0f35; color:#c4b5fd;">${cell}</td>`;
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
