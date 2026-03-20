/* ============================================================
   CTF ARENA — Box C19: The Glitch in the Matrix
   Multi-Stage Campaign | Hardware Fault Injection & Glitching
   Config: firmware analysis, timing traces, glitch platform, flags
   ============================================================ */

const C19Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Glitch in the Matrix',
    subtitle: 'Multi-Stage Campaign — Hardware Fault Injection & Secure Execution Environment Bypass',
    difficulty: 'Expert (Extreme)',
    accent: '#8e44ad',
    storageKey: 'hexworth_ctf_c19',
    registryId: 'c19-glitch-in-matrix',
    trackerKey: 'ctf_c19',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'firmware_analysis',
            name: 'Firmware Analysis',
            icon: '\uD83D\uDD0D',
            description: 'Load see_firmware.bin into a disassembler. Identify the authentication routine and locate the critical CMP instruction vulnerable to fault injection.',
            requiredFlags: [],
            mitre: ['T1592.002', 'T1595.001'],
            unlocks: ['timing_analysis'],
            locked: false
        },
        {
            id: 'timing_analysis',
            name: 'Timing Analysis',
            icon: '\uD83D\uDCC8',
            description: 'Analyze sec_op_trace.log with timing data from the SEE. Calculate the precise delay from routine entry to the CMP instruction.',
            requiredFlags: [],
            mitre: ['T1592.004', 'T1040'],
            unlocks: ['glitch_profile'],
            locked: true
        },
        {
            id: 'glitch_profile',
            name: 'Glitch Profile Development',
            icon: '\u26A1',
            description: 'Develop the fault injection profile. Specify target address, glitch delay, and glitch width parameters for the ChipWhisperer platform.',
            requiredFlags: ['user'],
            mitre: ['T1600', 'T1553.006'],
            unlocks: ['fault_injection'],
            locked: true
        },
        {
            id: 'fault_injection',
            name: 'Fault Injection',
            icon: '\uD83D\uDD27',
            description: 'Apply the glitch profile to TRUSTED-EXEC-01. Induce the controlled fault during an authentication attempt to bypass the CMP verification.',
            requiredFlags: [],
            mitre: ['T1600.001', 'T1553.006'],
            unlocks: ['firmware_extraction'],
            locked: true
        },
        {
            id: 'firmware_extraction',
            name: 'Firmware Hash Extraction',
            icon: '\uD83D\uDDDD\uFE0F',
            description: 'With authentication bypassed, access the privileged debug function. Extract the Master Control Firmware Hash from the unlocked register dump.',
            requiredFlags: ['user'],
            mitre: ['T1005', 'T1552.004'],
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
                title: 'Analyze the SEE firmware binary',
                tip: 'Run: ghidra see_firmware.bin or objdump -d see_firmware.bin — look for the verify_password function and its CMP instruction.',
                trigger: { event: 'command', match: { cmd: 'contains:ghidra' } }
            },
            {
                title: 'Parse the timing trace log',
                tip: 'Run: cat sec_op_trace.log — calculate the delta between ROUTINE_ENTRY and the CMP instruction timestamp to get your glitch delay.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:sec_op_trace' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:trace' } }
                    ]
                }
            },
            {
                title: 'Build and submit your glitch profile (Flag 1)',
                tip: 'Assemble the profile: target_address=0x00004A2C, glitch_delay=<calculated_ns>, glitch_width=4. Submit as the user.txt flag.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Execute fault injection via the glitch platform',
                tip: 'Run: python3 glitch_attack.py --profile glitch_profile.json --target TRUSTED-EXEC-01 — watch for the authentication bypass confirmation.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Dump the firmware hash (Flag 2)',
                tip: 'After bypass, run: chipwhisperer read-register --reg DEBUG_DUMP on TRUSTED-EXEC-01 to extract the Master Control Firmware Hash.',
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
            { flagId: 'user',     objective: '2.1',  description: 'Given a scenario, analyze indicators of malicious activity — Firmware reverse engineering and fault injection profile development',  skill: 'Binary Disassembly & Glitch Parameter Derivation' },
            { flagId: 'user',     objective: '3.3',  description: 'Explain the importance of hardware security — Voltage/clock glitching as a physical attack vector against secure enclaves',         skill: 'Hardware Fault Injection Theory' },
            { flagId: 'root',     objective: '4.4',  description: 'Given a scenario, implement security controls — Bypassing integrity verification in embedded secure execution environments',          skill: 'SEE Authentication Bypass & Key Extraction' },
            { flagId: 'root',     objective: '1.4',  description: 'Given a scenario, analyze potential indicators associated with attacks on cryptographic implementations',                             skill: 'Cryptographic Fault Attack Completion' }
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
            'USB Device Detected: ChipWhisperer-Nano (VID:2B3E PID:C305)',
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
            { id: 'terminal', label: 'Terminal',     icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',      icon: '\uD83C\uDF10',       app: 'browser'  },
            { id: 'notes',    label: 'Notes',        icon: '\uD83D\uDCDD',       app: 'notes'    },
            { id: 'hints',    label: 'Hints',        icon: '\uD83D\uDCA1',       app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag',  icon: '\uD83D\uDEA9',       app: 'flags'    }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget Device: TRUSTED-EXEC-01 (Secure Execution Environment — Citadel Defense)\nChipWhisperer-Nano: Connected on /dev/ttyUSB0\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (glitch platform state)
    // ═══════════════════════════════════════════════════════

    _context: 'analyst',          // 'analyst' | 'glitch-active' | 'debug-shell'
    _firmwareLoaded: false,       // ghidra/objdump has analyzed see_firmware.bin
    _traceAnalyzed: false,        // sec_op_trace.log has been read
    _glitchProfileReady: false,   // glitch_profile.json written
    _authBypassed: false,         // fault injection succeeded
    _debugShellActive: false,     // privileged debug function unlocked

    _switchContext(ctx, term) {
        C19Config._context = ctx;
        // Update terminal prompt to reflect active context
        if (term && term.config) {
            var prompt = C19Config._getPrompt();
            if (prompt) {
                term.config.user     = prompt.split('@')[0] || 'kali';
                term.config.hostname = 'context';
                term._customPrompt   = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (C19Config._context) {
            case 'glitch-active': return 'cw@TRUSTED-EXEC-01:[GLITCHING]$ ';
            case 'debug-shell':   return 'root@TRUSTED-EXEC-01:[DEBUG]# ';
            default: return null;   // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED REGISTER DUMP (unlocked after auth bypass)
    // ═══════════════════════════════════════════════════════

    _see: {
        // Fake register state exposed by the privileged debug function
        debug_registers: {
            R0:  '0x00000001',   // auth_result — was forced to 0x1 by glitch
            R1:  '0xDEADBEEF',   // scratch — unimportant
            R2:  '0x00004A2C',   // PC at time of glitch (CMP instruction address)
            R3:  '0x00000000',   // expected password hash — zeroed after fault
            LR:  '0x000049F8',   // link register — return address from verify_password
            PC:  '0x00004B40',   // current PC — admin_debug_function
            SP:  '0x20003FF0'    // stack pointer
        },
        // The firmware hash revealed only after successful auth bypass
        firmware_hash_key: 'DEBUG_DUMP',
        admin_function_name: 'admin_debug_function',
        cmp_address: '0x00004A2C',
        routine_entry: '0x000049D0'
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', points: 200 },   // Glitch profile (user.txt)
        { id: 'root', points: 300 }    // Master Control Firmware Hash (root.txt)
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 3600000, points: 200 },   // 60 minutes
        timeBonusThreshold: 7200                            // 120 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by disassembling see_firmware.bin: run objdump -d see_firmware.bin | grep -A 20 "verify_password" to find the authentication routine. The vulnerable CMP instruction is at 0x00004A2C.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Open sec_op_trace.log and look for the ROUTINE_ENTRY and CMP_EXEC timestamps. Subtract ROUTINE_ENTRY from CMP_EXEC to calculate glitch_delay in nanoseconds. The glitch_width is always 4 ns for this target.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Build your glitch profile JSON: { "target_address": "0x00004A2C", "glitch_delay": <calculated_ns>, "glitch_width": 4 }. Save it as glitch_profile.json then run: python3 glitch_attack.py --profile glitch_profile.json --target TRUSTED-EXEC-01',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'After fault injection succeeds, use: chipwhisperer read-register --reg DEBUG_DUMP to dump the privileged register state. The Master Control Firmware Hash appears in the DEBUG_DUMP output alongside the register snapshot.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The "Secure Execution Environment" (SEE) aboard TRUSTED-EXEC-01 was engineered by the Citadel\'s hardware division to be impenetrable in software. Its firmware runs in an isolated memory space, cryptographic operations never touch general-purpose registers, and any integrity fault triggers an immediate chip lockdown. But "impenetrable in software" does not mean impenetrable in reality. Intelligence confirmed that a specific branch of the SEE firmware — the admin password verification routine at 0x000049D0 — executes a single unprotected CMP instruction at 0x00004A2C with no glitch countermeasures. A precisely timed voltage fault lasting four nanoseconds will corrupt that comparison, forcing the CPU to treat an incorrect password as valid. Your mission, Peerless: analyze the firmware, derive the timing parameters, and extract the Master Control Firmware Hash before the Citadel rotates the chip on the next maintenance window.',
        scenario: 'The Citadel\'s hardware team hardened TRUSTED-EXEC-01 at the software layer — encrypted storage, signed boot, Firewall Level 5. What they skipped was glitch countermeasures on the die itself. No voltage monitors. No clock integrity sensors. The ChipWhisperer-Nano attached to your bench has a direct line to the target\'s VCC rail. One clean four-nanosecond dip during the CMP instruction and the chip\'s auth logic collapses. The admin debug function — intended only for factory provisioning — becomes fully accessible. The Master Control Firmware Hash lives inside that function\'s register dump.',
        outro: 'TRUSTED-EXEC-01 has been physically compromised. The Master Control Firmware Hash — a 32-byte SHA-256 digest used to verify every component of the Citadel\'s defense firmware chain — is now in your hands. The Citadel\'s assumption that software hardening equals hardware security has been proven catastrophically wrong.',
        ecer: {
            executive:  'Hardware security review deprioritized; TRUSTED-EXEC-01 shipped without voltage glitch countermeasures because the project was behind schedule',
            culture:    'Firmware team had no embedded security specialist; glitch resistance treated as optional post-launch enhancement',
            employee:   'Admin debug function left enabled on production silicon; CMP instruction in verify_password never wrapped in fault-resistant double-check pattern',
            regulatory: 'No hardware security certification required for defense component vendors; Citadel procurement accepted self-reported security assessments'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — ChipWhisperer Platform Interface
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://localhost:5000/',

        pages: {
            '/': {
                title: 'ChipWhisperer Nano — Control Panel',
                html: `
                    <div style="text-align:center; margin-bottom:24px; padding-bottom:20px; border-bottom:1px solid #3d1f5c;">
                        <h1 style="color:#c39bd3; font-size:1.5rem; font-family:monospace; margin-bottom:4px; letter-spacing:0.08em;">ChipWhisperer-Nano</h1>
                        <div style="color:#8e44ad; font-size:0.85rem; font-weight:700; letter-spacing:0.15em;">FAULT INJECTION PLATFORM v4.1.0</div>
                        <div style="color:#6c5a7a; font-size:0.75rem; margin-top:6px;">Connected: /dev/ttyUSB0 — TRUSTED-EXEC-01</div>
                    </div>

                    <div style="max-width:640px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div style="background:#1a0d2e; border:1px solid #3d1f5c; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.1rem; font-weight:700; color:#8e44ad; font-family:monospace;">READY</div>
                            <div style="color:#6c5a7a; font-size:0.7rem; margin-top:4px;">Device Status</div>
                        </div>
                        <div style="background:#1a0d2e; border:1px solid #3d1f5c; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.1rem; font-weight:700; color:#c39bd3; font-family:monospace;">3.3V</div>
                            <div style="color:#6c5a7a; font-size:0.7rem; margin-top:4px;">VCC Rail</div>
                        </div>
                        <div style="background:#1a0d2e; border:1px solid #3d1f5c; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.1rem; font-weight:700; color:#c39bd3; font-family:monospace;">7.373 MHz</div>
                            <div style="color:#6c5a7a; font-size:0.7rem; margin-top:4px;">Target Clock</div>
                        </div>
                    </div>

                    <div style="max-width:640px; margin:0 auto 16px;">
                        <div style="background:#1a0d2e; border:1px solid #3d1f5c; border-radius:6px; padding:16px; font-family:monospace; font-size:0.8rem; color:#a78bba;">
                            <div style="color:#8e44ad; margin-bottom:10px; font-size:0.75rem; letter-spacing:0.1em;">PLATFORM NAVIGATION</div>
                            <div style="margin-bottom:6px;"><a href="/firmware" style="color:#c39bd3;">/firmware</a> &mdash; Firmware artifact browser</div>
                            <div style="margin-bottom:6px;"><a href="/trace" style="color:#c39bd3;">/trace</a> &mdash; Timing trace viewer (sec_op_trace.log)</div>
                            <div style="margin-bottom:6px;"><a href="/glitch" style="color:#c39bd3;">/glitch</a> &mdash; Glitch profile submission interface</div>
                            <div><a href="/registers" style="color:#c39bd3;">/registers</a> &mdash; Target register dump (locked)</div>
                        </div>
                    </div>

                    <div style="max-width:640px; margin:0 auto; padding:10px 14px; background:rgba(142,68,173,0.07); border:1px solid rgba(142,68,173,0.2); border-radius:4px; font-size:0.73rem; color:#6c5a7a;">
                        <strong style="color:#8e44ad;">MISSION NOTE:</strong> Firmware artifacts are in /home/kali/ on your analysis workstation. Use the terminal to analyze them, then submit a glitch profile via <a href="/glitch" style="color:#8e44ad;">/glitch</a>.
                    </div>
                `,
                formHandler: null
            },

            '/firmware': {
                title: 'ChipWhisperer — Firmware Artifacts',
                html: `
                    <div style="margin-bottom:20px;">
                        <h2 style="color:#c39bd3; font-size:1.1rem; font-family:monospace;">Firmware Artifact Browser</h2>
                        <div style="color:#6c5a7a; font-size:0.75rem;">Provided artifacts for TRUSTED-EXEC-01 analysis session</div>
                    </div>

                    <div style="display:flex; flex-direction:column; gap:10px; max-width:640px;">
                        <div style="background:#1a0d2e; border:1px solid #3d1f5c; border-radius:6px; padding:14px; display:flex; align-items:center; gap:14px;">
                            <div style="font-size:1.6rem;">&#128190;</div>
                            <div style="flex:1;">
                                <div style="color:#c39bd3; font-family:monospace; font-size:0.9rem;">see_firmware.bin</div>
                                <div style="color:#6c5a7a; font-size:0.72rem; margin-top:3px;">ARM Cortex-M3 binary — critical SEE firmware segment (auth + secure boot routines)</div>
                                <div style="color:#6c5a7a; font-size:0.7rem;">Size: 48.2 KB &nbsp;|&nbsp; SHA256: a3f8c1d9...</div>
                            </div>
                            <div style="font-family:monospace; font-size:0.7rem; color:#8e44ad;">LOCAL: /home/kali/</div>
                        </div>
                        <div style="background:#1a0d2e; border:1px solid #3d1f5c; border-radius:6px; padding:14px; display:flex; align-items:center; gap:14px;">
                            <div style="font-size:1.6rem;">&#128196;</div>
                            <div style="flex:1;">
                                <div style="color:#c39bd3; font-family:monospace; font-size:0.9rem;">sec_op_trace.log</div>
                                <div style="color:#6c5a7a; font-size:0.72rem; margin-top:3px;">Timing trace — nanosecond-resolution operation log captured via logic analyzer</div>
                                <div style="color:#6c5a7a; font-size:0.7rem;">Size: 8.4 KB &nbsp;|&nbsp; 847 entries</div>
                            </div>
                            <div style="font-family:monospace; font-size:0.7rem; color:#8e44ad;">LOCAL: /home/kali/</div>
                        </div>
                        <div style="background:#1a0d2e; border:1px solid #3d1f5c; border-radius:6px; padding:14px; display:flex; align-items:center; gap:14px;">
                            <div style="font-size:1.6rem;">&#128220;</div>
                            <div style="flex:1;">
                                <div style="color:#c39bd3; font-family:monospace; font-size:0.9rem;">glitch_attack.py</div>
                                <div style="color:#6c5a7a; font-size:0.72rem; margin-top:3px;">Python glitch automation script — reads glitch_profile.json, drives ChipWhisperer hardware</div>
                                <div style="color:#6c5a7a; font-size:0.7rem;">Size: 3.1 KB</div>
                            </div>
                            <div style="font-family:monospace; font-size:0.7rem; color:#8e44ad;">LOCAL: /home/kali/</div>
                        </div>
                    </div>
                    <div style="max-width:640px; margin-top:14px; padding:10px 14px; background:rgba(142,68,173,0.07); border:1px solid rgba(142,68,173,0.2); border-radius:4px; font-size:0.73rem; color:#6c5a7a;">
                        All files are already present in /home/kali/ on your workstation. Use the Terminal to analyze them.
                    </div>
                `,
                formHandler: null
            },

            '/trace': {
                title: 'ChipWhisperer — Timing Trace Viewer',
                html: `
                    <div style="margin-bottom:16px;">
                        <h2 style="color:#c39bd3; font-size:1.1rem; font-family:monospace;">sec_op_trace.log — Timing Viewer</h2>
                        <div style="color:#6c5a7a; font-size:0.75rem;">Select a time range to inspect. Critical entries highlighted.</div>
                    </div>
                    <div style="background:#0d0718; border:1px solid #3d1f5c; border-radius:6px; padding:16px; font-family:monospace; font-size:0.75rem; color:#a78bba; max-height:420px; overflow-y:auto;">
                        <div style="color:#6c5a7a; margin-bottom:8px;">[sec_op_trace.log — partial view — use terminal for full analysis]</div>
                        <div style="margin-bottom:4px; color:#6c5a7a;">[T+000000000 ns] DEVICE_BOOT: TRUSTED-EXEC-01 power-on</div>
                        <div style="margin-bottom:4px; color:#6c5a7a;">[T+000082441 ns] SECURE_BOOT: hash verification started</div>
                        <div style="margin-bottom:4px; color:#6c5a7a;">[T+000093712 ns] SECURE_BOOT: OK — firmware integrity confirmed</div>
                        <div style="margin-bottom:4px; color:#6c5a7a;">[T+000095020 ns] AUTH_MODULE: initialized</div>
                        <div style="margin-bottom:4px; color:#8e44ad; font-weight:bold;">[T+000100340 ns] AUTH_ROUTINE: ROUTINE_ENTRY @ 0x000049D0</div>
                        <div style="margin-bottom:4px; color:#6c5a7a;">[T+000100388 ns] AUTH_ROUTINE: stack frame setup</div>
                        <div style="margin-bottom:4px; color:#6c5a7a;">[T+000100412 ns] AUTH_ROUTINE: LDR R3, [SP, #0x08]  ; load input hash</div>
                        <div style="margin-bottom:4px; color:#6c5a7a;">[T+000100436 ns] AUTH_ROUTINE: LDR R2, [PC, #0x1FC] ; load stored hash</div>
                        <div style="margin-bottom:4px; color:#8e44ad; font-weight:bold;">[T+000100572 ns] AUTH_ROUTINE: CMP_EXEC @ 0x00004A2C  ; &lt;-- GLITCH TARGET</div>
                        <div style="margin-bottom:4px; color:#6c5a7a;">[T+000100592 ns] AUTH_ROUTINE: BEQ  0x00004B00     ; branch if equal (authenticated)</div>
                        <div style="margin-bottom:4px; color:#6c5a7a;">[T+000100608 ns] AUTH_ROUTINE: MOV R0, #0x0        ; auth_result = FAIL</div>
                        <div style="margin-bottom:4px; color:#6c5a7a;">[T+000100620 ns] AUTH_ROUTINE: B    0x00004B30     ; branch to error handler</div>
                        <div style="margin-bottom:4px; color:#6c5a7a;">[T+000100644 ns] AUTH_ROUTINE: ROUTINE_EXIT — authentication FAILED</div>
                        <div style="margin-bottom:4px; color:#6c5a7a;">[T+000100680 ns] AUTH_MODULE: lockout timer reset</div>
                        <div style="margin-bottom:4px; color:#6c5a7a;">...</div>
                        <div style="margin-top:10px; padding-top:8px; border-top:1px solid #3d1f5c; color:#8e44ad;">KEY DELTA: CMP_EXEC - ROUTINE_ENTRY = 232 ns</div>
                    </div>
                    <div style="max-width:640px; margin-top:12px; padding:10px 14px; background:rgba(142,68,173,0.07); border:1px solid rgba(142,68,173,0.2); border-radius:4px; font-size:0.73rem; color:#6c5a7a;">
                        Full log is at /home/kali/sec_op_trace.log. Run: python3 parse_trace.py to calculate timing deltas automatically.
                    </div>
                `,
                formHandler: null
            },

            '/glitch': {
                title: 'ChipWhisperer — Glitch Profile Submission',
                html: function() {
                    return `
                    <div style="margin-bottom:20px;">
                        <h2 style="color:#c39bd3; font-size:1.1rem; font-family:monospace;">Glitch Profile Submission</h2>
                        <div style="color:#6c5a7a; font-size:0.75rem;">Enter your derived timing parameters to trigger fault injection on TRUSTED-EXEC-01.</div>
                    </div>
                    <div style="max-width:500px; margin:0 auto;">
                        <div style="background:#1a0d2e; border:1px solid #3d1f5c; border-radius:8px; padding:20px;">
                            <div style="margin-bottom:14px;">
                                <label style="display:block; color:#8e44ad; font-size:0.75rem; font-family:monospace; margin-bottom:6px; letter-spacing:0.08em;">TARGET ADDRESS (hex)</label>
                                <input type="text" data-field="target_address" placeholder="e.g. 0x00004A2C"
                                       style="width:100%; padding:8px 12px; background:#0d0718; border:1px solid #3d1f5c; border-radius:4px; color:#c39bd3; font-family:monospace; font-size:0.85rem; box-sizing:border-box;">
                            </div>
                            <div style="margin-bottom:14px;">
                                <label style="display:block; color:#8e44ad; font-size:0.75rem; font-family:monospace; margin-bottom:6px; letter-spacing:0.08em;">GLITCH DELAY (nanoseconds)</label>
                                <input type="text" data-field="glitch_delay" placeholder="e.g. 232"
                                       style="width:100%; padding:8px 12px; background:#0d0718; border:1px solid #3d1f5c; border-radius:4px; color:#c39bd3; font-family:monospace; font-size:0.85rem; box-sizing:border-box;">
                            </div>
                            <div style="margin-bottom:20px;">
                                <label style="display:block; color:#8e44ad; font-size:0.75rem; font-family:monospace; margin-bottom:6px; letter-spacing:0.08em;">GLITCH WIDTH (nanoseconds)</label>
                                <input type="text" data-field="glitch_width" placeholder="e.g. 4"
                                       style="width:100%; padding:8px 12px; background:#0d0718; border:1px solid #3d1f5c; border-radius:4px; color:#c39bd3; font-family:monospace; font-size:0.85rem; box-sizing:border-box;">
                            </div>
                            <button data-action="inject"
                                    style="width:100%; padding:10px; background:#8e44ad; color:#fff; border:none; border-radius:4px; font-family:monospace; font-size:0.9rem; font-weight:700; cursor:pointer; letter-spacing:0.08em;">
                                EXECUTE FAULT INJECTION
                            </button>
                        </div>
                    </div>`;
                },
                formHandler: function(data, engine) {
                    const addr  = (data.target_address || '').trim().toLowerCase().replace(/\s/g, '');
                    const delay = parseInt(data.glitch_delay  || '0', 10);
                    const width = parseInt(data.glitch_width  || '0', 10);

                    // Validate address — must be the CMP instruction address
                    const validAddr = addr === '0x00004a2c' || addr === '4a2c' || addr === '0x4a2c';
                    // Delay must be 232 ns (CMP_EXEC - ROUTINE_ENTRY from trace)
                    const validDelay = delay >= 228 && delay <= 236;   // small tolerance
                    // Width must be 4 ns
                    const validWidth = width === 4;

                    if (validAddr && validDelay && validWidth) {
                        C19Config._glitchProfileReady = true;
                        C19Config._authBypassed       = true;
                        C19Config._switchContext('debug-shell', null);
                        return `<div style="color:#2ecc71; background:rgba(46,204,113,0.08); border:1px solid rgba(46,204,113,0.2); border-radius:6px; padding:18px; margin-top:16px; font-family:monospace; font-size:0.82rem;">
                            <div style="font-weight:700; font-size:0.95rem; margin-bottom:10px;">FAULT INJECTION — SUCCESS</div>
                            <div style="color:#ccc; margin-bottom:6px;">Target:       TRUSTED-EXEC-01</div>
                            <div style="color:#ccc; margin-bottom:6px;">Address:      0x00004A2C (CMP instruction)</div>
                            <div style="color:#ccc; margin-bottom:6px;">Delay:        ${delay} ns</div>
                            <div style="color:#ccc; margin-bottom:6px;">Width:        ${width} ns</div>
                            <div style="color:#ccc; margin-bottom:6px;">Voltage dip:  2.81V (nominal 3.30V)</div>
                            <div style="margin-top:12px; padding-top:10px; border-top:1px solid rgba(46,204,113,0.2); color:#2ecc71;">
                                CMP fault induced. Auth result register corrupted to 0x1.<br>
                                Authentication BYPASSED. admin_debug_function ACCESSIBLE.<br>
                                Proceed to <a href="/registers" style="color:#2ecc71;">/registers</a> to dump privileged state.
                            </div>
                        </div>`;
                    }

                    // Partial match feedback
                    if (!validAddr) {
                        return `<div style="color:#e74c3c; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:6px; padding:16px; margin-top:16px; font-family:monospace; font-size:0.82rem;">
                            INJECTION FAILED — Wrong target address.<br>
                            <span style="color:#888; font-size:0.78rem;">The CMP instruction address was not found at ${addr || '(empty)'}. Re-analyze see_firmware.bin.</span>
                        </div>`;
                    }
                    if (!validDelay) {
                        return `<div style="color:#e74c3c; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:6px; padding:16px; margin-top:16px; font-family:monospace; font-size:0.82rem;">
                            INJECTION FAILED — Incorrect glitch delay.<br>
                            <span style="color:#888; font-size:0.78rem;">Glitch fired too ${delay < 228 ? 'early' : 'late'} — missed the CMP window. Check sec_op_trace.log delta calculation.</span>
                        </div>`;
                    }
                    return `<div style="color:#e74c3c; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:6px; padding:16px; margin-top:16px; font-family:monospace; font-size:0.82rem;">
                        INJECTION FAILED — Incorrect glitch width.<br>
                        <span style="color:#888; font-size:0.78rem;">Width of ${width} ns insufficient to corrupt the CMP result. ChipWhisperer specification recommends 4 ns for ARM Cortex-M3 at 7.373 MHz.</span>
                    </div>`;
                }
            },

            '/registers': {
                title: 'ChipWhisperer — Register Dump',
                html: function() {
                    if (!C19Config._authBypassed) {
                        return `<div style="text-align:center; padding:40px;">
                            <h2 style="color:#e74c3c; font-family:monospace; font-size:1.2rem;">ACCESS DENIED</h2>
                            <p style="color:#888; font-size:0.85rem; font-family:monospace;">admin_debug_function locked. Authentication required.</p>
                            <p style="color:#6c5a7a; font-size:0.75rem; margin-top:10px;">Complete fault injection via <a href="/glitch" style="color:#8e44ad;">/glitch</a> to unlock this view.</p>
                        </div>`;
                    }
                    return `<div style="margin-bottom:16px;">
                        <h2 style="color:#2ecc71; font-size:1.1rem; font-family:monospace;">TRUSTED-EXEC-01 — DEBUG REGISTER DUMP</h2>
                        <div style="color:#6c5a7a; font-size:0.75rem;">admin_debug_function active — post-glitch register state captured</div>
                    </div>
                    <div style="background:#0d0718; border:1px solid rgba(46,204,113,0.3); border-radius:6px; padding:16px; font-family:monospace; font-size:0.78rem; color:#a78bba; max-width:640px;">
                        <div style="color:#2ecc71; margin-bottom:10px; letter-spacing:0.08em;">ARM CORTEX-M3 REGISTER SNAPSHOT</div>
                        <div style="margin-bottom:3px;">R0  = 0x00000001  ; auth_result (GLITCHED — should be 0x0)</div>
                        <div style="margin-bottom:3px;">R1  = 0xDEADBEEF  ; scratch register</div>
                        <div style="margin-bottom:3px;">R2  = 0x00004A2C  ; fault address (CMP instruction)</div>
                        <div style="margin-bottom:3px;">R3  = 0x00000000  ; expected hash (zeroed by fault)</div>
                        <div style="margin-bottom:3px;">LR  = 0x000049F8  ; return from verify_password()</div>
                        <div style="margin-bottom:3px;">PC  = 0x00004B40  ; admin_debug_function entry</div>
                        <div style="margin-bottom:14px;">SP  = 0x20003FF0  ; stack pointer</div>
                        <div style="border-top:1px solid rgba(46,204,113,0.2); padding-top:12px; color:#2ecc71; font-size:0.82rem;">
                            MASTER CONTROL FIRMWARE HASH (DEBUG_DUMP):<br>
                            <span style="color:#fff;">{{FLAG:root}}</span>
                        </div>
                    </div>`;
                },
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (analyst workstation — kali)
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
                                    content: '=== MISSION BRIEFING: OPERATION GLITCH ===\nTarget: TRUSTED-EXEC-01 (Secure Execution Environment)\nObjective: Fault injection — bypass auth, extract Master Control Firmware Hash\n\nAttack chain:\n1. Analyze see_firmware.bin — find verify_password() and CMP @ 0x00004A2C\n2. Parse sec_op_trace.log — calculate glitch delay from ROUTINE_ENTRY to CMP_EXEC\n3. Derive glitch profile — target_address, glitch_delay, glitch_width\n4. Execute fault injection via glitch_attack.py\n5. Dump DEBUG registers — extract Master Control Firmware Hash\n\nChipWhisperer-Nano is connected at /dev/ttyUSB0.\nGlitch platform web UI available at http://localhost:5000/\n\nGood luck, operator.'
                                },
                                'see_firmware.bin': {
                                    type: 'file',
                                    content: '[Binary file — 48.2 KB ARM Cortex-M3 ELF]\n[Use: objdump -d see_firmware.bin or ghidra to disassemble]\n[SHA256: a3f8c1d9e7b24f0a5c6d8e3f1a2b4c9d]\n[Sections: .text (0x00000000-0x0000BFFF), .rodata (0x0000C000-0x0000CFFF), .data (0x20000000-0x200003FF)]'
                                },
                                'sec_op_trace.log': {
                                    type: 'file',
                                    content: '# sec_op_trace.log — TRUSTED-EXEC-01 timing trace\n# Captured via Saleae Logic Pro 16 at 1 GS/s\n# Format: [T+<ns>] COMPONENT: EVENT @ ADDR\n\n[T+000000000 ns] DEVICE_BOOT: TRUSTED-EXEC-01 power-on\n[T+000082441 ns] SECURE_BOOT: hash verification started\n[T+000093712 ns] SECURE_BOOT: OK — firmware integrity confirmed\n[T+000095020 ns] AUTH_MODULE: initialized\n[T+000100340 ns] AUTH_ROUTINE: ROUTINE_ENTRY @ 0x000049D0\n[T+000100388 ns] AUTH_ROUTINE: stack frame setup\n[T+000100412 ns] AUTH_ROUTINE: LDR R3, [SP, #0x08]  ; load input hash\n[T+000100436 ns] AUTH_ROUTINE: LDR R2, [PC, #0x1FC] ; load stored hash\n[T+000100460 ns] AUTH_ROUTINE: LSL R3, R3, #0       ; normalize\n[T+000100484 ns] AUTH_ROUTINE: LSL R2, R2, #0       ; normalize\n[T+000100508 ns] AUTH_ROUTINE: AND R3, R3, #0xFF    ; mask low byte\n[T+000100532 ns] AUTH_ROUTINE: AND R2, R2, #0xFF    ; mask low byte\n[T+000100556 ns] AUTH_ROUTINE: MOV R1, R2           ; copy stored hash\n[T+000100572 ns] AUTH_ROUTINE: CMP_EXEC @ 0x00004A2C  ; <-- GLITCH TARGET\n[T+000100592 ns] AUTH_ROUTINE: BEQ  0x00004B00     ; branch if equal\n[T+000100608 ns] AUTH_ROUTINE: MOV R0, #0x0        ; auth_result = FAIL\n[T+000100620 ns] AUTH_ROUTINE: B    0x00004B30     ; error handler\n[T+000100644 ns] AUTH_ROUTINE: ROUTINE_EXIT — authentication FAILED\n[T+000100680 ns] AUTH_MODULE: lockout timer reset\n[T+000102400 ns] POWER_MONITOR: nominal — 3.30V VCC stable\n...\n\n# ANALYSIS NOTES:\n# ROUTINE_ENTRY timestamp : 100340 ns\n# CMP_EXEC timestamp      : 100572 ns\n# DELTA (glitch_delay)    : 232 ns\n# Recommended glitch_width: 4 ns (ARM Cortex-M3 @ 7.373 MHz)\n# CMP instruction address : 0x00004A2C'
                                },
                                'glitch_attack.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# glitch_attack.py — ChipWhisperer fault injection automation\n# Usage: python3 glitch_attack.py --profile glitch_profile.json --target TRUSTED-EXEC-01\n\nimport json, sys, argparse\n\ndef main():\n    parser = argparse.ArgumentParser(description="ChipWhisperer fault injection driver")\n    parser.add_argument("--profile", required=True, help="Path to glitch_profile.json")\n    parser.add_argument("--target",  required=True, help="Target device identifier")\n    args = parser.parse_args()\n\n    with open(args.profile) as f:\n        profile = json.load(f)\n\n    print(f"[*] Loading profile: {args.profile}")\n    print(f"[*] Target address : {profile[\'target_address\']}")\n    print(f"[*] Glitch delay   : {profile[\'glitch_delay\']} ns")\n    print(f"[*] Glitch width   : {profile[\'glitch_width\']} ns")\n    print(f"[*] Connecting to ChipWhisperer on /dev/ttyUSB0...")\n    print(f"[*] Arming trigger — waiting for auth routine entry...")\n    print(f"[*] Trigger detected at ROUTINE_ENTRY 0x000049D0")\n    print(f"[*] Firing glitch at T+{profile[\'glitch_delay\']} ns...")\n    # Validation logic omitted — submit profile via http://localhost:5000/glitch\n    print("[!] For full simulation, submit profile at http://localhost:5000/glitch")\n\nif __name__ == "__main__":\n    main()'
                                },
                                'parse_trace.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# parse_trace.py — timing delta calculator for sec_op_trace.log\nimport re\n\nwith open("sec_op_trace.log") as f:\n    lines = f.readlines()\n\nroutine_entry = None\ncmp_exec      = None\n\nfor line in lines:\n    m = re.match(r\'\\[T\\+(\\d+) ns\\].*ROUTINE_ENTRY\', line)\n    if m: routine_entry = int(m.group(1))\n    m = re.match(r\'\\[T\\+(\\d+) ns\\].*CMP_EXEC\', line)\n    if m: cmp_exec = int(m.group(1))\n\nif routine_entry and cmp_exec:\n    delta = cmp_exec - routine_entry\n    print(f"ROUTINE_ENTRY : {routine_entry} ns")\n    print(f"CMP_EXEC      : {cmp_exec} ns")\n    print(f"glitch_delay  : {delta} ns")\nelse:\n    print("Error: could not find required timestamps")'
                                },
                                'glitch_profile.json': {
                                    type: 'file',
                                    content: '{\n  "target_address": "FILL_ME_IN",\n  "glitch_delay": 0,\n  "glitch_width": 0\n}\n# Edit this file with values from your firmware/trace analysis,\n# then submit via http://localhost:5000/glitch or run glitch_attack.py'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls -la\ncat notes.txt\nfile see_firmware.bin\nobjdump -d see_firmware.bin | head -80\ncat sec_op_trace.log | grep -E "ROUTINE|CMP"\npython3 parse_trace.py\nnano glitch_profile.json'
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
                                'doc': {
                                    type: 'dir',
                                    children: {
                                        'chipwhisperer': {
                                            type: 'dir',
                                            children: {
                                                'README.txt': {
                                                    type: 'file',
                                                    content: 'ChipWhisperer-Nano v4.1.0\n========================\nVoltage glitch and power analysis tool.\n\nQuick start:\n  python3 glitch_attack.py --help\n\nWeb interface:\n  http://localhost:5000/\n\nSupported targets: ARM Cortex-M, RISC-V, AVR\nGlitch width resolution: 1 ns\nMax glitch delay: 65535 ns\n\nRefer to https://chipwhisperer.readthedocs.io for full documentation.'
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
                            content: 'kali'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash'
                        }
                    }
                },
                'dev': {
                    type: 'dir',
                    children: {
                        'ttyUSB0': {
                            type: 'file',
                            content: '[Character device — ChipWhisperer-Nano serial interface]\n[Do not cat directly — use chipwhisperer Python API or glitch_attack.py]'
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
    // TERMINAL COMMANDS (box-specific tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        'ghidra': function(args, term, engine) {
            if (args.length === 0) return 'Usage: ghidra <binary> [--headless]\nExample: ghidra see_firmware.bin';
            const target = args[0] || '';
            if (!target.includes('see_firmware') && !target.includes('.bin')) {
                return `ghidra: ${target}: file not found or not a recognized binary format`;
            }
            C19Config._firmwareLoaded = true;
            if (engine) engine.advancePhase && engine.advancePhase('firmware_analysis');
            return `Ghidra 11.1.2 (Headless Mode)
Project: glitch_matrix
Analyzing: see_firmware.bin (ARM Cortex-M3 LE, 32-bit)

[*] Auto-analysis started...
[*] Decompiler analysis... done
[*] Function ID analysis... done
[*] Call graph analysis... done

Identified functions:
  0x000049D0  verify_password()
  0x00004B00  auth_success_handler()
  0x00004B30  auth_fail_handler()
  0x00004B40  admin_debug_function()   ; privileged — requires auth
  0x00004C20  compute_firmware_hash()
  0x00004C80  secure_boot_check()

DISASSEMBLY — verify_password() @ 0x000049D0:
  49D0:  PUSH    {R4, LR}
  49D4:  SUB     SP, SP, #0x0C
  49D8:  LDR     R3, [SP, #0x08]       ; load input hash buffer
  49DC:  LDR     R2, [PC, #0x1FC]      ; load stored master hash
  49E0:  LSL     R3, R3, #0
  49E4:  LSL     R2, R2, #0
  49E8:  AND     R3, R3, #0xFF
  49EC:  AND     R2, R2, #0xFF
  49F0:  MOV     R1, R2
  4A2C:  CMP     R3, R1               ; <<<< VULNERABLE INSTRUCTION (no glitch countermeasure)
  4A30:  BEQ     0x00004B00           ; branch to auth_success_handler if equal
  4A34:  MOV     R0, #0x0
  4A38:  B       0x00004B30           ; branch to auth_fail_handler

[+] Analysis complete. Critical CMP instruction located at 0x00004A2C.
[+] No glitch countermeasures detected (no double-check, no nonce, no voltage monitor).`;
        },

        'objdump': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (!fullCmd.includes('see_firmware') && !fullCmd.includes('.bin')) {
                if (args.length === 0) return 'Usage: objdump <options> <binary>\nExample: objdump -d see_firmware.bin';
                return `objdump: ${args[args.length - 1]}: No such file or directory`;
            }
            C19Config._firmwareLoaded = true;
            if (engine) engine.advancePhase && engine.advancePhase('firmware_analysis');
            const grep = fullCmd.includes('verify_password') || fullCmd.includes('grep');
            if (grep) {
                return `see_firmware.bin:     file format elf32-littlearm

Disassembly of section .text:

000049d0 <verify_password>:
    49d0:  e92d4010  push    {r4, lr}
    49d4:  e24dd00c  sub     sp, sp, #12
    49d8:  e59d3008  ldr     r3, [sp, #8]
    49dc:  e59f21fc  ldr     r2, [pc, #508]
    49e0:  e1a03003  lsl     r3, r3, #0
    49e4:  e1a02002  lsl     r2, r2, #0
    49e8:  e20330ff  and     r3, r3, #255
    49ec:  e20220ff  and     r2, r2, #255
    49f0:  e1a01002  mov     r1, r2
    4a2c:  e1530001  cmp     r3, r1    ; <-- GLITCH TARGET @ 0x00004A2C
    4a30:  0a000034  beq     4b00 <auth_success_handler>
    4a34:  e3a00000  mov     r0, #0
    4a38:  eafffff0  b       4b30 <auth_fail_handler>`;
            }
            return `see_firmware.bin:     file format elf32-littlearm

Sections:
  .text    0x00000000-0x0000BFFF  (48KB — executable code)
  .rodata  0x0000C000-0x0000CFFF  (4KB — read-only data, includes stored master hash)
  .data    0x20000000-0x200003FF  (1KB — BSS and initialized data)

Symbol table:
  0x000049D0  verify_password
  0x00004B00  auth_success_handler
  0x00004B30  auth_fail_handler
  0x00004B40  admin_debug_function
  0x00004C20  compute_firmware_hash
  0x00004C80  secure_boot_check

Use: objdump -d see_firmware.bin | grep -A 20 "verify_password" for the auth disassembly.`;
        },

        'strings': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target.includes('see_firmware') && !target.includes('.bin')) {
                return `strings: ${target || '(no file)'}: No such file or directory`;
            }
            return `Citadel Defense Systems
TRUSTED-EXEC-01 v2.4
verify_password
admin_debug_function
secure_boot_check
MASTER_HASH_REGISTER
AUTH_FAIL: lockout timer reset
AUTH_OK: entering privileged mode
DEBUG_DUMP active
Firmware integrity: OK
[!] Unauthorized access attempt logged
ARM Cortex-M3 HAL v1.0
chipwhisperer`;
        },

        'binwalk': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target.includes('see_firmware') && !target.includes('.bin')) {
                return `binwalk: ${target || '(no file)'}: No such file or directory`;
            }
            C19Config._firmwareLoaded = true;
            return `DECIMAL       HEXADECIMAL     DESCRIPTION
--------------------------------------------------------------------------------
0             0x0             ELF, 32-bit LSB executable, ARM, version 1 (SYSV)
2048          0x800           ARM exception table
16384         0x4000          Code section (.text) — 32,768 bytes
49152         0xC000          Read-only data (.rodata) — 4,096 bytes
196608        0x30000         Compressed data (gzip, last modified 2026-01-14 09:22)`;
        },

        'file': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: file <filename>';
            if (target.includes('see_firmware') || target.includes('.bin')) {
                return `see_firmware.bin: ELF 32-bit LSB executable, ARM, EABI5 version 1 (SYSV), statically linked, not stripped`;
            }
            if (target.includes('sec_op_trace') || target.includes('.log')) {
                return `sec_op_trace.log: ASCII text, 847 lines`;
            }
            if (target.includes('glitch_attack') || target.includes('.py')) {
                return `glitch_attack.py: Python script, ASCII text executable`;
            }
            return `file: ${target}: cannot open (No such file or directory)`;
        },

        'python3': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (fullCmd.includes('parse_trace')) {
                C19Config._traceAnalyzed = true;
                if (engine) engine.advancePhase && engine.advancePhase('timing_analysis');
                return `ROUTINE_ENTRY : 100340 ns
CMP_EXEC      : 100572 ns
glitch_delay  : 232 ns

[+] Recommended glitch profile:
    target_address : 0x00004A2C
    glitch_delay   : 232 ns
    glitch_width   : 4 ns  (ARM Cortex-M3 @ 7.373 MHz standard)`;
            }

            if (fullCmd.includes('glitch_attack')) {
                if (!C19Config._glitchProfileReady && !fullCmd.includes('glitch_profile.json')) {
                    return `[*] Loading profile: glitch_profile.json
[!] Error: glitch_profile.json contains placeholder values (FILL_ME_IN).
[!] Edit glitch_profile.json with valid parameters or submit via http://localhost:5000/glitch`;
                }
                if (C19Config._glitchProfileReady) {
                    C19Config._authBypassed    = true;
                    C19Config._debugShellActive = true;
                    C19Config._switchContext('debug-shell', term);
                    if (engine) engine.advancePhase && engine.advancePhase('fault_injection');
                    return `[*] Loading profile: glitch_profile.json
[*] Target address : 0x00004A2C
[*] Glitch delay   : 232 ns
[*] Glitch width   : 4 ns
[*] Connecting to ChipWhisperer on /dev/ttyUSB0...
[*] Arming trigger — waiting for auth routine entry...
[*] Trigger detected at ROUTINE_ENTRY 0x000049D0
[*] Firing glitch at T+232 ns...

[+] FAULT INJECTION SUCCESS
[+] CMP result corrupted — auth_result register = 0x1
[+] Authentication bypassed. admin_debug_function NOW ACCESSIBLE.
[+] Context switched: debug shell active on TRUSTED-EXEC-01.

root@TRUSTED-EXEC-01:[DEBUG]#

[+] Run: chipwhisperer read-register --reg DEBUG_DUMP to extract the firmware hash.`;
                }
                return `[*] Loading profile: glitch_profile.json
[*] Connecting to ChipWhisperer on /dev/ttyUSB0...
[!] Injection attempt failed — parameters not yet validated.
[!] Submit your profile via http://localhost:5000/glitch first.`;
            }

            if (fullCmd.trim() === '') {
                return 'Python 3.11.4 (main, Jan 14 2026)\nType "help", "copyright", "credits" or "license" for more information.\n>>> ';
            }

            return "python3: can't open file '" + (args[0] || '') + "': [Errno 2] No such file or directory";
        },

        'chipwhisperer': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (fullCmd.includes('read-register') && fullCmd.includes('DEBUG_DUMP')) {
                if (!C19Config._authBypassed) {
                    return `chipwhisperer: read-register: permission denied
ERROR: admin_debug_function is locked. Authentication bypass required.
[!] Complete fault injection first.`;
                }
                if (engine) engine.advancePhase && engine.advancePhase('firmware_extraction');
                return `ChipWhisperer-Nano v4.1.0 — register read
Target: TRUSTED-EXEC-01
Register: DEBUG_DUMP (privileged — post-glitch access granted)

ARM CORTEX-M3 REGISTER SNAPSHOT:
  R0  = 0x00000001  ; auth_result (GLITCHED)
  R1  = 0xDEADBEEF  ; scratch
  R2  = 0x00004A2C  ; fault address
  R3  = 0x00000000  ; expected hash (zeroed)
  LR  = 0x000049F8  ; return address
  PC  = 0x00004B40  ; admin_debug_function
  SP  = 0x20003FF0  ; stack pointer

MASTER CONTROL FIRMWARE HASH (DEBUG_DUMP):
  {{FLAG:root}}

[+] Extraction complete. Hash captured from privileged register dump.`;
            }

            if (fullCmd.includes('status') || fullCmd.includes('info')) {
                return `ChipWhisperer-Nano v4.1.0
  Device:   /dev/ttyUSB0
  Status:   CONNECTED
  Target:   TRUSTED-EXEC-01 (3.3V, 7.373 MHz)
  Scope:    Clocked — 1 GS/s
  Glitch:   ${C19Config._glitchProfileReady ? 'ARMED' : 'IDLE'}
  Auth:     ${C19Config._authBypassed ? 'BYPASSED' : 'LOCKED'}`;
            }

            if (fullCmd.includes('scope') || fullCmd.includes('capture')) {
                return `ChipWhisperer-Nano — power trace capture
  Capturing 5000 samples at 1 GS/s...
  [||||||||||||||||||||] 100%
  Saved: power_trace_001.npy
  Peak detected at T+232 ns (CMP instruction region)`;
            }

            return `Usage: chipwhisperer <command> [options]

Commands:
  status                        Show device status
  scope [--capture]             Capture power trace
  read-register --reg <REG>     Read target register (requires auth bypass)
  glitch --delay <ns> --width <ns> --target <addr>  Direct glitch trigger

Example:
  chipwhisperer read-register --reg DEBUG_DUMP`;
        },

        'gdb': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target.includes('see_firmware') && !target.includes('.bin') && target !== '') {
                return `GNU gdb (Debian 13.2-1) 13.2\ngdb: ${target}: No such file or directory.`;
            }
            C19Config._firmwareLoaded = true;
            return `GNU gdb (Debian 13.2-1) 13.2
Copyright (C) 2023 Free Software Foundation, Inc.

Reading symbols from see_firmware.bin...
(No debugging symbols found — stripped binary)

(gdb) info functions
All defined functions:

File see_firmware.c:
  0x000049d0  verify_password
  0x00004b00  auth_success_handler
  0x00004b30  auth_fail_handler
  0x00004b40  admin_debug_function
  0x00004c20  compute_firmware_hash
  0x00004c80  secure_boot_check

(gdb) disassemble verify_password
Dump of assembler code for function verify_password:
   0x000049d0:  push    {r4, lr}
   0x000049d4:  sub     sp, sp, #12
   0x000049d8:  ldr     r3, [sp, #8]
   0x000049dc:  ldr     r2, [pc, #508]
   0x000049e0:  lsl     r3, r3, #0
   0x000049e4:  lsl     r2, r2, #0
   0x000049e8:  and     r3, r3, #255
   0x000049ec:  and     r2, r2, #255
   0x000049f0:  mov     r1, r2
   0x00004a2c:  cmp     r3, r1          ; <-- NO GLITCH COUNTER-MEASURE
   0x00004a30:  beq     0x4b00
   0x00004a34:  mov     r0, #0
   0x00004a38:  b       0x4b30
(gdb) `;
        },

        'readelf': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target.includes('see_firmware') && !target.includes('.bin')) {
                return `readelf: ${target || '(no input)'}: No such file or directory`;
            }
            return `ELF Header:
  Magic:   7f 45 4c 46 01 01 01 00 00 00 00 00 00 00 00 00
  Class:                             ELF32
  Data:                              2's complement, little endian
  Type:                              EXEC (Executable file)
  Machine:                           ARM
  Entry point address:               0x00000000
  Flags:                             0x5000200, Version5 EABI, soft-float ABI

Section Headers:
  [Nr] Name              Type         Addr       Size
  [ 1] .text             PROGBITS     0x00000000 0x0000c000
  [ 2] .rodata           PROGBITS     0x0000c000 0x00001000
  [ 3] .data             PROGBITS     0x20000000 0x00000400

Symbol table '.symtab':
  Num: Value      Size Type    Name
   12: 000049d0    104 FUNC    verify_password
   13: 00004b00     28 FUNC    auth_success_handler
   14: 00004b30     16 FUNC    auth_fail_handler
   15: 00004b40     80 FUNC    admin_debug_function
   16: 00004c20     64 FUNC    compute_firmware_hash
   17: 00004c80     48 FUNC    secure_boot_check`;
        },

        'hexdump': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target.includes('see_firmware') && !target.includes('.bin')) {
                return `hexdump: ${target || '(no input)'}: No such file or directory`;
            }
            return `0000000 457f 464c 0101 0001 0000 0000 0000 0000
0000010 0002 0028 0001 0000 0000 0000 0034 0000
0000020 0000 0000 0200 0500 0034 0020 0001 0028
...
00049d0 2de9 0041 002d 0c4d 598d 0803 59f2 1fe0
00049e0 00e1 0030 00e1 0020 a0e2 ff30 a0e2 ff20
00049f0 01e1 0010 .... .... .... ....
0004a2c e153 0001 003a 0034 00e3 0000 fff0 eaff  ; <-- CMP R3,R1
...`;
        },

        'nano': function(args, term, engine) {
            const target = args[0] || '';
            if (target.includes('glitch_profile')) {
                // Mark profile as potentially written
                return `[GNU nano 7.2] glitch_profile.json

{
  "target_address": "0x00004A2C",
  "glitch_delay": 232,
  "glitch_width": 4
}

^X Exit  ^O Write  ^G Help

[Tip: Edit the values then save. When complete, run python3 glitch_attack.py --profile glitch_profile.json --target TRUSTED-EXEC-01]`;
            }
            return `[GNU nano 7.2] ${target || 'new file'}

(empty)

^X Exit  ^O Write  ^G Help`;
        },

        'grep': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // grep on trace log for timing
            if (fullCmd.includes('sec_op_trace') || fullCmd.includes('trace')) {
                if (fullCmd.includes('ROUTINE') || fullCmd.includes('CMP')) {
                    C19Config._traceAnalyzed = true;
                    if (engine) engine.advancePhase && engine.advancePhase('timing_analysis');
                    return `[T+000100340 ns] AUTH_ROUTINE: ROUTINE_ENTRY @ 0x000049D0
[T+000100572 ns] AUTH_ROUTINE: CMP_EXEC @ 0x00004A2C  ; <-- GLITCH TARGET`;
                }
                if (fullCmd.includes('ENTRY')) {
                    return `[T+000100340 ns] AUTH_ROUTINE: ROUTINE_ENTRY @ 0x000049D0`;
                }
            }

            // grep on firmware strings
            if (fullCmd.includes('see_firmware') || fullCmd.includes('.bin')) {
                if (fullCmd.includes('verify') || fullCmd.includes('auth')) {
                    return `Binary file see_firmware.bin matches
verify_password
admin_debug_function
AUTH_FAIL: lockout timer reset
AUTH_OK: entering privileged mode`;
                }
            }

            if (args.length < 2) return 'Usage: grep <pattern> <file>';
            return `grep: ${args[args.length - 1]}: No such file or directory`;
        },

        'cat': function(args, term, engine) {
            // Context-aware overrides for debug shell
            if (C19Config._context === 'debug-shell') {
                const path = args[0] || '';
                if (path.includes('flag') || path.includes('root.txt')) {
                    return `Master Control Firmware Hash:\n{{FLAG:root}}`;
                }
                if (path.includes('/proc/cpuinfo')) {
                    return `processor : 0\nBogomips  : 7373.00\nmodel name: ARM Cortex-M3 (TRUSTED-EXEC-01)\nflags     : half thumb fastmult`;
                }
                return `cat: ${path}: No such file or directory`;
            }
            return null;   // fall through to built-in filesystem cat
        },

        'ls': function(args, term, engine) {
            if (C19Config._context === 'debug-shell') {
                const path = (args.find(a => !a.startsWith('-')) || '.').trim();
                if (path === '.' || path === '~' || path === '/') {
                    return `DEBUG_DUMP  firmware_hash.bin  admin_debug.log  sys_config.enc`;
                }
                return '';
            }
            return null;   // fall through to built-in filesystem ls
        },

        'whoami': function(args, term, engine) {
            if (C19Config._context === 'debug-shell') return 'root';
            return null;
        },

        'id': function(args, term, engine) {
            if (C19Config._context === 'debug-shell') {
                return 'uid=0(root) gid=0(root) groups=0(root) [TRUSTED-EXEC-01 debug context]';
            }
            return null;
        },

        'hostname': function(args, term, engine) {
            if (C19Config._context === 'debug-shell') return 'TRUSTED-EXEC-01';
            return null;
        },

        'pwd': function(args, term, engine) {
            if (C19Config._context === 'debug-shell') return '/debug';
            return null;
        },

        'cd': function(args, term, engine) {
            if (C19Config._context === 'debug-shell') return '';  // silently accept
            return null;
        },

        'exit': function(args, term, engine) {
            if (C19Config._context === 'debug-shell') {
                C19Config._switchContext('analyst', term);
                return `Connection to TRUSTED-EXEC-01 debug context closed.
ChipWhisperer: returning to analyst workstation.
[+] Returned to kali workstation.`;
            }
            return 'logout';
        },

        'dmesg': function(args, term, engine) {
            if (C19Config._context !== 'debug-shell') {
                return `[    0.000000] Initializing cgroup subsys cpuset
[    0.000000] Linux version 6.1.0-kali9-amd64
[    0.182441] USB 2-1: new full-speed USB device number 2 using ohci-pci
[    0.382993] usb 2-1: New USB device found, idVendor=2b3e, idProduct=c305
[    0.383004] usb 2-1: Product: ChipWhisperer-Nano
[    0.421003] cdc_acm 2-1:1.0: ttyUSB0: USB ACM device`;
            }
            return `[TRUSTED-EXEC-01 kernel log — post-glitch]
[    0.000000] ARM Cortex-M3 HAL v1.0
[    0.082441] SEE: secure boot check passed
[    0.095020] AUTH_MODULE: initialized
[    0.100340] AUTH_ROUTINE: entry @ 0x000049D0
[    0.100572] FAULT DETECTED: VCC dip at CMP instruction 0x00004A2C
[    0.100574] FAULT: auth_result register = 0x1 (anomalous)
[    0.100580] AUTH_MODULE: entering privileged mode (admin_debug_function)`;
        },

        'lsusb': function(args, term, engine) {
            return `Bus 002 Device 002: ID 2b3e:c305 NewAE Technology Inc. ChipWhisperer-Nano
Bus 002 Device 001: ID 1d6b:0001 Linux Foundation 1.1 root hub
Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub`;
        },

        'nmap': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: nmap [options] <target>\nNote: This box is hardware-focused. TRUSTED-EXEC-01 has no network interface to scan.';
            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00010s latency).

PORT     STATE SERVICE
5000/tcp open  http  (ChipWhisperer web UI)

Nmap done: 1 IP address (1 host up) scanned in 0.08 seconds`;
            }
            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. TRUSTED-EXEC-01 is a local hardware target — no TCP/IP interface.
[!] Use the ChipWhisperer API or python3 glitch_attack.py to interact with the device.
Nmap done: 0 IP addresses (0 hosts up) scanned in 3.01 seconds`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #3d1f5c; background:#1a0d2e;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #2a1040;">${cell}</td>`;
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
