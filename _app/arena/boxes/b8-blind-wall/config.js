/* ============================================================
   CTF ARENA — Box B8: The Blind Wall
   Security Infrastructure Troubleshooting | Crimson Dawn Confederacy
   Config: Firewall/IDS/VPN misconfigurations, iptables, OpenVPN
   ============================================================ */

const B8Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Blind Wall',
    subtitle: 'Security Infrastructure Troubleshooting — Crimson Dawn Confederacy',
    difficulty: 'Intermediate-Advanced',
    accent: '#f97316',
    storageKey: 'hexworth_ctf_b8',
    registryId: 'b8-blind-wall',
    trackerKey: 'ctf_b8',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer troubleshooting chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Perimeter Assessment',
            icon: '\uD83D\uDD0D',
            description: 'Connect to FW-CITADEL-01 and assess the current firewall status, VPN tunnel state, and connectivity.',
            requiredFlags: [],
            mitre: ['T1046', 'T1082'],
            unlocks: ['diagnosis'],
            locked: false
        },
        {
            id: 'diagnosis',
            name: 'Rule Analysis',
            icon: '\uD83D\uDEE1\uFE0F',
            description: 'Analyze iptables rules, IDS alerts, and VPN configuration. Identify why legitimate traffic is being blocked.',
            requiredFlags: [],
            mitre: ['T1562.004', 'T1592.004'],
            unlocks: ['remediation'],
            locked: true
        },
        {
            id: 'remediation',
            name: 'Remediation',
            icon: '\uD83D\uDD27',
            description: 'Fix the firewall rules to allow VPN traffic and the Threat Intelligence Feed while maintaining security posture.',
            requiredFlags: ['user'],
            mitre: ['T1059.004', 'T1098'],
            unlocks: ['verification'],
            locked: true
        },
        {
            id: 'verification',
            name: 'Verification',
            icon: '\u2705',
            description: 'Confirm VPN users can reach internal resources and the Threat Intel Feed connects successfully.',
            requiredFlags: ['root'],
            mitre: ['T1530', 'T1005'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // TUTORIAL MODE (Sprint AR-12)
    // ═══════════════════════════════════════════════════════

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Check firewall status',
                tip: 'Open the Terminal and run: sudo iptables -L -n -v to view the current ruleset.',
                trigger: { event: 'command', match: { cmd: 'contains:iptables' } }
            },
            {
                title: 'Test VPN connectivity',
                tip: 'Run: ping 192.168.10.50 to test if VPN clients can reach the internal server.',
                trigger: { event: 'command', match: { cmd: 'contains:ping' } }
            },
            {
                title: 'Analyze rule ordering',
                tip: 'Look at the FORWARD chain carefully. Rules are processed top-to-bottom. A broad DENY before specific ALLOWs blocks everything.',
                trigger: { event: 'command', match: { cmd: 'contains:iptables' } }
            },
            {
                title: 'Identify the blocking rule',
                tip: 'The DENY ALL rule in the FORWARD chain (rule #3) is placed before the VPN and Threat Intel ALLOW rules.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Fix and verify',
                tip: 'Delete or reorder the blocking rule, then verify VPN and Threat Intel Feed connectivity.',
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
            { flagId: 'user', objective: '3.2', description: 'Given a scenario, apply security principles to secure enterprise infrastructure — Firewall rules', skill: 'Firewall Rule Analysis' },
            { flagId: 'user', objective: '4.5', description: 'Given a scenario, modify enterprise capabilities to enhance security — ACL configuration', skill: 'IPTables Troubleshooting' },
            { flagId: 'root', objective: '3.3', description: 'Compare and contrast concepts and strategies to protect data — VPN configuration', skill: 'VPN Connectivity Restoration' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — IDS/IPS tuning', skill: 'Security Infrastructure Verification' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'FW-CITADEL-01 BIOS v5.1.3',
            'Initializing hardware...',
            'Memory Test: 4096 MB OK',
            'Detecting drives... /dev/sda1 (128GB SSD)',
            'NIC: Intel X710 Quad Port — 4 links detected',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Ubuntu 22.04.3 LTS (Firewall)',
            'Ubuntu 22.04.3 LTS (recovery mode)',
            'Advanced options for Ubuntu'
        ],
        loginUser: 'fw_admin'
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
        user: 'fw_admin',
        hostname: 'FW-CITADEL-01',
        startDir: '/home/fw_admin',
        welcome: 'Ubuntu 22.04.3 LTS — FW-CITADEL-01 (Firewall Appliance)\nLast login: Tue Mar 12 14:22:18 2026\n\n*** ALERT: VPN users reporting no access to internal resources ***\n*** ALERT: Threat Intelligence Feed updates failing since 03/12 ***\n\nType \'help\' for available commands.\n'
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED DATA
    // ═══════════════════════════════════════════════════════

    _db: {
        iptablesForward: [
            { num: 1, target: 'ACCEPT', prot: 'all', source: '0.0.0.0/0', destination: '0.0.0.0/0', extra: 'state RELATED,ESTABLISHED' },
            { num: 2, target: 'ACCEPT', prot: 'icmp', source: '0.0.0.0/0', destination: '0.0.0.0/0', extra: 'icmp type 8' },
            { num: 3, target: 'DROP', prot: 'all', source: '0.0.0.0/0', destination: '0.0.0.0/0', extra: '/* Block all forwarded traffic */' },
            { num: 4, target: 'ACCEPT', prot: 'tcp', source: '10.8.0.0/24', destination: '192.168.10.0/24', extra: 'dpt:80 /* VPN to Internal HTTP */' },
            { num: 5, target: 'ACCEPT', prot: 'tcp', source: '10.8.0.0/24', destination: '192.168.10.0/24', extra: 'dpt:443 /* VPN to Internal HTTPS */' },
            { num: 6, target: 'ACCEPT', prot: 'tcp', source: '10.8.0.0/24', destination: '192.168.10.0/24', extra: 'dpt:22 /* VPN to Internal SSH */' },
            { num: 7, target: 'ACCEPT', prot: 'tcp', source: '203.0.113.50/32', destination: '192.168.10.5/32', extra: 'dpt:8443 /* Threat Intel Feed Ingest */' }
        ],
        iptablesInput: [
            { num: 1, target: 'ACCEPT', prot: 'all', source: '0.0.0.0/0', destination: '0.0.0.0/0', extra: 'lo' },
            { num: 2, target: 'ACCEPT', prot: 'all', source: '0.0.0.0/0', destination: '0.0.0.0/0', extra: 'state RELATED,ESTABLISHED' },
            { num: 3, target: 'ACCEPT', prot: 'tcp', source: '0.0.0.0/0', destination: '0.0.0.0/0', extra: 'dpt:22' },
            { num: 4, target: 'ACCEPT', prot: 'udp', source: '0.0.0.0/0', destination: '0.0.0.0/0', extra: 'dpt:1194 /* OpenVPN */' },
            { num: 5, target: 'DROP', prot: 'all', source: '0.0.0.0/0', destination: '0.0.0.0/0', extra: '' }
        ],
        suricataAlerts: [
            '[2026-03-12 14:30:01] [Drop] [1:2024001:1] ET POLICY OpenVPN Connection Detected [Classification: Potential Policy Violation] [Priority: 3] {UDP} 82.14.221.100:49821 -> 10.10.14.5:1194',
            '[2026-03-12 14:30:02] [Drop] [1:2024002:1] ET POLICY Outbound SSL/TLS Connection to Non-Standard Port [Classification: Potential Policy Violation] [Priority: 3] {TCP} 192.168.10.5:44120 -> 203.0.113.50:8443',
            '[2026-03-12 15:00:01] [Alert] [1:2024001:1] ET POLICY OpenVPN Connection Detected',
            '[2026-03-12 15:30:01] [Drop] [1:2024001:1] ET POLICY OpenVPN Connection Detected',
            '[2026-03-13 08:00:01] [Drop] [1:2024002:1] ET POLICY Outbound SSL/TLS to Non-Standard Port'
        ],
        vpnConfig: `# OpenVPN Server Configuration
port 1194
proto udp
dev tun0
ca /etc/openvpn/ca.crt
cert /etc/openvpn/server.crt
key /etc/openvpn/server.key
dh /etc/openvpn/dh2048.pem

server 10.8.0.0 255.255.255.0
push "route 192.168.10.0 255.255.255.0"

# Client DNS
push "dhcp-option DNS 192.168.10.1"

keepalive 10 120
cipher AES-256-GCM
auth SHA256
persist-key
persist-tun
status /var/log/openvpn/status.log
log-append /var/log/openvpn/openvpn.log
verb 3`
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
            text: 'Start by listing the firewall rules: sudo iptables -L FORWARD -n -v --line-numbers. Rules are evaluated top to bottom — order matters.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Look at the FORWARD chain: Rule #3 is a DROP ALL rule that blocks everything. Rules #4-7 (VPN and Threat Intel) come AFTER it, so they are never reached.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Two problems: (1) FORWARD chain rule #3 — blanket DROP before ALLOW rules. (2) Suricata IDS is dropping legitimate VPN and Threat Intel traffic as "Policy Violations." Check /var/log/suricata/fast.log.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'The user flag is FORWARD rule #3: iptables -D FORWARD 3. After deleting it, also suppress the Suricata false positives by editing /etc/suricata/rules/local.rules. Then verify with: curl http://192.168.10.50/verification.txt (from VPN) to get the root flag.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Citadel Defense Perimeter, protected by FW-CITADEL-01, has developed a critical flaw. VPN users cannot reach internal resources despite successful tunnel establishment. The Threat Intelligence Feed from THREAT-INTEL-01 is being blocked, preventing crucial defense updates. The firewall logs are voluminous and cryptic, pointing to no obvious cause.',
        scenario: 'A junior security analyst was asked to "tighten the firewall rules" after a recent penetration test. They added a blanket DROP rule in the FORWARD chain — but placed it before the specific ALLOW rules for VPN traffic and the Threat Intel Feed. Additionally, a Suricata IDS ruleset update introduced overly aggressive policy rules that flag legitimate VPN and outbound SSL traffic as suspicious. The analyst did not test the changes before applying them in production.',
        outro: 'The Blind Wall sees again. With the misplaced DROP rule removed and Suricata IDS false positives suppressed, VPN users can once more access internal resources, and the Threat Intelligence Feed flows freely into the Citadel\'s defense systems. The perimeter is restored — properly secured and properly connected.',
        ecer: {
            executive: 'No formal change control process for firewall rule modifications',
            culture: 'Junior analyst given unsupervised access to production firewall; no four-eyes principle',
            employee: 'Blanket DROP rule added without understanding rule evaluation order',
            regulatory: 'No firewall change testing requirements; no IDS tuning review process'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Firewall Management Console
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.10.14.5:8443/fw/',

        pages: {
            '/fw/': {
                title: 'FW-CITADEL-01 — Management Console',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#f97316; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;">FW-CITADEL-01 — Firewall Console</h1>
                        <div style="color:#888; font-size:0.8rem;">Citadel Defense Perimeter &mdash; iptables + Suricata IDS</div>
                    </div>

                    <div style="max-width:700px; margin:0 auto;">
                        <div style="background:#fef2f2; border:1px solid #fca5a5; border-radius:6px; padding:16px; margin-bottom:20px;">
                            <div style="color:#dc2626; font-weight:700; margin-bottom:8px;">ACTIVE ALERTS</div>
                            <div style="font-size:0.8rem; color:#7f1d1d; line-height:1.6;">
                                <div>CRITICAL: VPN clients unable to reach 192.168.10.0/24 network</div>
                                <div>CRITICAL: Threat Intel Feed (203.0.113.50) — connection refused</div>
                                <div>WARNING: Suricata IDS — 47 policy violation drops in 24h</div>
                                <div>INFO: OpenVPN tunnel established — 3 clients connected</div>
                            </div>
                        </div>

                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:20px;">
                            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:14px; text-align:center;">
                                <div style="color:#64748b; font-size:0.7rem; text-transform:uppercase;">VPN Status</div>
                                <div style="font-size:1.2rem; font-weight:700; color:#16a34a;">UP</div>
                                <div style="font-size:0.65rem; color:#94a3b8;">3 clients</div>
                            </div>
                            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:14px; text-align:center;">
                                <div style="color:#64748b; font-size:0.7rem; text-transform:uppercase;">FW Rules</div>
                                <div style="font-size:1.2rem; font-weight:700; color:#f59e0b;">12</div>
                                <div style="font-size:0.65rem; color:#94a3b8;">FORWARD: 7</div>
                            </div>
                            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:14px; text-align:center;">
                                <div style="color:#64748b; font-size:0.7rem; text-transform:uppercase;">IDS Drops</div>
                                <div style="font-size:1.2rem; font-weight:700; color:#dc2626;">47</div>
                                <div style="font-size:0.65rem; color:#94a3b8;">Last 24h</div>
                            </div>
                        </div>
                    </div>
                `,
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (target machine)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'fw_admin': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: FW-CITADEL-01 (localhost)\nType: Linux Firewall Appliance (iptables + Suricata IDS + OpenVPN)\nObjective: Diagnose and fix blocked legitimate traffic\n\nReported symptoms:\n1. VPN users connected but cannot reach internal network (192.168.10.0/24)\n2. Threat Intel Feed from 203.0.113.50 cannot connect on port 8443\n3. Suricata IDS showing many "Policy Violation" drops\n4. Changes made by junior analyst on 2026-03-12\n\nNetwork topology:\n  WAN:        eth0 (public)\n  LAN:        eth1 (192.168.10.0/24)\n  VPN-Tunnel: tun0 (10.8.0.0/24)\n  Internal:   INTERNAL-SRV-01 at 192.168.10.50\n  Threat Intel: THREAT-INTEL-01 at 203.0.113.50\n\nGood luck, operator.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'sudo iptables -L -n -v\nsudo iptables -L FORWARD -n --line-numbers\nsudo cat /var/log/suricata/fast.log\nsudo systemctl status openvpn\nping 192.168.10.50'
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
                            content: 'FW-CITADEL-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\nfw_admin:x:1000:1000:Firewall Admin,,,:/home/fw_admin:/bin/bash'
                        },
                        'openvpn': {
                            type: 'dir',
                            children: {
                                'server.conf': {
                                    type: 'file',
                                    content: null  // Populated from _db.vpnConfig
                                },
                                'ca.crt': { type: 'file', content: '[CERTIFICATE DATA — CA Certificate — Valid until 2028-01-01]' },
                                'server.crt': { type: 'file', content: '[CERTIFICATE DATA — Server Certificate — Valid until 2027-06-15]' },
                                'server.key': { type: 'file', content: '[PRIVATE KEY — REDACTED]' }
                            }
                        },
                        'suricata': {
                            type: 'dir',
                            children: {
                                'suricata.yaml': {
                                    type: 'file',
                                    content: '# Suricata configuration\ndefault-rule-path: /etc/suricata/rules/\nrule-files:\n  - suricata.rules\n  - local.rules\n\naf-packet:\n  - interface: eth0\n  - interface: eth1\n\noutputs:\n  - fast:\n      enabled: yes\n      filename: /var/log/suricata/fast.log\n  - eve-log:\n      enabled: yes\n      filename: /var/log/suricata/eve.json'
                                },
                                'rules': {
                                    type: 'dir',
                                    children: {
                                        'local.rules': {
                                            type: 'file',
                                            content: '# Local IDS rules — added by junior analyst 2026-03-12\n# "Tightening security per pentest recommendations"\n\ndrop udp any any -> $HOME_NET 1194 (msg:"ET POLICY OpenVPN Connection Detected"; sid:2024001; rev:1;)\ndrop tcp $HOME_NET any -> any !80 (msg:"ET POLICY Outbound SSL/TLS Connection to Non-Standard Port"; sid:2024002; rev:1;)\n\n# NOTE: These rules were NOT in the original Suricata config.\n# They were added after the pentest but are overly broad.'
                                        }
                                    }
                                }
                            }
                        },
                        'sysctl.conf': {
                            type: 'file',
                            content: '# IP Forwarding\nnet.ipv4.ip_forward = 1\n\n# TCP Hardening\nnet.ipv4.tcp_syncookies = 1\nnet.ipv4.conf.all.rp_filter = 1\nnet.ipv4.conf.default.rp_filter = 1'
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    children: {
                        'log': {
                            type: 'dir',
                            children: {
                                'suricata': {
                                    type: 'dir',
                                    children: {
                                        'fast.log': {
                                            type: 'file',
                                            content: null  // Populated from _db.suricataAlerts joined
                                        },
                                        'eve.json': {
                                            type: 'file',
                                            content: '{"timestamp":"2026-03-12T14:30:01","event_type":"alert","alert":{"action":"blocked","signature":"ET POLICY OpenVPN Connection Detected","severity":3},"src_ip":"82.14.221.100","src_port":49821,"dest_ip":"10.10.14.5","dest_port":1194,"proto":"UDP"}\n{"timestamp":"2026-03-12T14:30:02","event_type":"alert","alert":{"action":"blocked","signature":"ET POLICY Outbound SSL/TLS to Non-Standard Port","severity":3},"src_ip":"192.168.10.5","src_port":44120,"dest_ip":"203.0.113.50","dest_port":8443,"proto":"TCP"}'
                                        }
                                    }
                                },
                                'openvpn': {
                                    type: 'dir',
                                    children: {
                                        'openvpn.log': {
                                            type: 'file',
                                            content: 'Thu Mar 14 02:18:44 2026 OpenVPN 2.5.7 x86_64-pc-linux-gnu\nThu Mar 14 02:18:44 2026 Listening for incoming connections on port 1194 (UDP)\nThu Mar 14 02:18:44 2026 TUN/TAP device tun0 opened\nThu Mar 14 02:18:44 2026 /sbin/ip addr add dev tun0 local 10.8.0.1 peer 10.8.0.2\nThu Mar 14 08:22:01 2026 client-01/82.14.221.100:49821 CONNECTED\nThu Mar 14 08:22:05 2026 client-01/82.14.221.100:49821 PUSH: Pushed route 192.168.10.0/24\nThu Mar 14 09:15:33 2026 client-02/91.203.45.88:51002 CONNECTED\nThu Mar 14 11:42:18 2026 client-03/77.84.12.200:48777 CONNECTED'
                                        },
                                        'status.log': {
                                            type: 'file',
                                            content: 'Updated,2026-03-14 14:22:18\nVirtual Address,Common Name,Real Address,Connected Since\n10.8.0.6,client-01,82.14.221.100:49821,2026-03-14 08:22:01\n10.8.0.10,client-02,91.203.45.88:51002,2026-03-14 09:15:33\n10.8.0.14,client-03,77.84.12.200:48777,2026-03-14 11:42:18\nRouting Table\nVirtual Address,Common Name,Real Address,Last Ref\n10.8.0.6,client-01,82.14.221.100:49821,2026-03-14 14:22:15\n10.8.0.10,client-02,91.203.45.88:51002,2026-03-14 14:21:58\n10.8.0.14,client-03,77.84.12.200:48777,2026-03-14 14:22:10'
                                        }
                                    }
                                },
                                'syslog': {
                                    type: 'file',
                                    content: 'Mar 12 14:28:00 FW-CITADEL-01 fw_admin: iptables rules updated by junior_analyst\nMar 12 14:29:00 FW-CITADEL-01 suricata[2891]: Rule file /etc/suricata/rules/local.rules loaded\nMar 12 14:30:01 FW-CITADEL-01 suricata[2891]: [Drop] OpenVPN connection blocked\nMar 12 14:30:02 FW-CITADEL-01 suricata[2891]: [Drop] Outbound SSL to non-standard port blocked\nMar 13 08:00:00 FW-CITADEL-01 kernel: nf_conntrack: table full, dropping packet\nMar 14 02:18:44 FW-CITADEL-01 openvpn[1847]: Initialization Sequence Completed'
                                }
                            }
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {
                        'fw_change_log.txt': {
                            type: 'file',
                            content: 'Change log — 2026-03-12\nAnalyst: junior_analyst\nTicket: SEC-2891 "Tighten firewall per pentest"\n\nChanges made:\n1. Added DROP ALL rule to FORWARD chain\n   Command: iptables -I FORWARD 3 -j DROP\n   Reason: "Block all unauthorized forwarded traffic"\n\n2. Added Suricata local rules\n   - Block OpenVPN connections (policy violation)\n   - Block outbound non-port-80 SSL/TLS\n   Reason: "Pentest found VPN and non-standard SSL as risk"\n\nNOTE: Did not realize VPN and Threat Intel traffic\ntraverses the FORWARD chain. Oops.\n\nRollback procedure: ???\nTesting: None performed.'
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'share': {
                            type: 'dir',
                            children: {}
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
        'help': function(args) {
            return `Available commands:
  System:     ls, cd, pwd, cat, grep, ps, top, htop, df, free, whoami, id, uname, clear, history
  Network:    ping, traceroute, netstat, ss, ip, curl, tcpdump, nmap
  Firewall:   iptables, ufw, firewall-cmd
  VPN:        openvpn
  IDS:        suricatasc
  Services:   systemctl, journalctl
  Files:      find, head, tail, less, wc, file
  Other:      sudo, man, echo, export

Type 'man <command>' for usage details.`;
        },

        'iptables': function(args, term, engine) {
            const argStr = args.join(' ');
            const db = B8Config._db;

            // List FORWARD chain
            if (argStr.includes('FORWARD') || (argStr.includes('-L') && !argStr.includes('INPUT') && !argStr.includes('OUTPUT'))) {
                let output = 'Chain FORWARD (policy DROP)\n';
                if (argStr.includes('--line-numbers') || argStr.includes('-n')) {
                    output += 'num   pkts bytes target     prot opt in     out     source               destination\n';
                    db.iptablesForward.forEach(r => {
                        const pkts = r.target === 'DROP' ? '284759' : (r.target === 'ACCEPT' && r.num === 1 ? '1847291' : '0');
                        output += `${String(r.num).padEnd(5)} ${pkts.padEnd(5)} ${(parseInt(pkts) * 512 + 'B').padEnd(5)}  ${r.target.padEnd(10)} ${r.prot.padEnd(4)} -- *      *       ${r.source.padEnd(20)} ${r.destination.padEnd(20)} ${r.extra}\n`;
                    });
                } else {
                    db.iptablesForward.forEach(r => {
                        output += `${r.target.padEnd(10)} ${r.prot.padEnd(4)}  ${r.source.padEnd(20)} ${r.destination.padEnd(20)} ${r.extra}\n`;
                    });
                }
                return output;
            }

            // List INPUT chain
            if (argStr.includes('INPUT')) {
                let output = 'Chain INPUT (policy DROP)\n';
                output += 'num   pkts bytes target     prot opt in     out     source               destination\n';
                db.iptablesInput.forEach(r => {
                    output += `${String(r.num).padEnd(5)} 0     0     ${r.target.padEnd(10)} ${r.prot.padEnd(4)} -- *      *       ${r.source.padEnd(20)} ${r.destination.padEnd(20)} ${r.extra}\n`;
                });
                return output;
            }

            // Delete rule
            if (argStr.includes('-D FORWARD 3') || argStr.includes('-D FORWARD -j DROP')) {
                return `Rule deleted from FORWARD chain.
The blanket DROP rule has been removed.

FORWARD chain now allows VPN (10.8.0.0/24) and Threat Intel (203.0.113.50) traffic to reach their destinations.

{{FLAG:user}}`;
            }

            // Generic list
            if (argStr.includes('-L')) {
                let output = 'Chain INPUT (policy DROP)\nACCEPT all -- 0.0.0.0/0 0.0.0.0/0 lo\nACCEPT all -- 0.0.0.0/0 0.0.0.0/0 state RELATED,ESTABLISHED\nACCEPT tcp -- 0.0.0.0/0 0.0.0.0/0 dpt:22\nACCEPT udp -- 0.0.0.0/0 0.0.0.0/0 dpt:1194\nDROP   all -- 0.0.0.0/0 0.0.0.0/0\n\n';
                output += 'Chain FORWARD (policy DROP)\n';
                db.iptablesForward.forEach(r => {
                    output += `${r.target.padEnd(10)} ${r.prot.padEnd(4)}  ${r.source.padEnd(20)} ${r.destination.padEnd(20)} ${r.extra}\n`;
                });
                output += '\nChain OUTPUT (policy ACCEPT)\n';
                return output;
            }

            return 'Usage: iptables [-L|-D|-I|-A] [INPUT|FORWARD|OUTPUT] [options]\n  -L    List rules\n  -D    Delete rule\n  -n    Numeric output\n  -v    Verbose\n  --line-numbers  Show rule numbers';
        },

        'tcpdump': function(args) {
            const argStr = args.join(' ');
            if (argStr.includes('tun0') || argStr.includes('vpn')) {
                return `tcpdump: listening on tun0, link-type RAW (Raw IP), snapshot length 262144 bytes
14:22:15.123456 IP 10.8.0.6 > 192.168.10.50: ICMP echo request, id 1847, seq 1
14:22:15.123789 IP 10.8.0.6 > 192.168.10.50: ICMP echo request, id 1847, seq 2
(no reply received — traffic forwarding blocked by iptables FORWARD chain)
^C
3 packets captured
0 packets received by filter (all dropped by netfilter)`;
            }
            if (argStr.includes('8443') || argStr.includes('threat')) {
                return `tcpdump: listening on eth0, link-type EN10MB, snapshot length 262144 bytes
14:22:18.456789 IP 203.0.113.50.8443 > 10.10.14.5.8443: Flags [S], seq 1234567
14:22:18.456800 IP 10.10.14.5 > 203.0.113.50: ICMP host 10.10.14.5 unreachable - admin prohibited
(Suricata IDS dropping inbound Threat Intel traffic)
^C
2 packets captured`;
            }
            return `tcpdump: listening on eth0, link-type EN10MB, snapshot length 262144 bytes\n14:22:20.000001 IP 10.10.14.5 > 8.8.8.8: ICMP echo request\n^C\n1 packet captured`;
        },

        'traceroute': function(args) {
            const target = args[0] || '';
            if (target === '192.168.10.50') {
                return `traceroute to 192.168.10.50 (192.168.10.50), 30 hops max, 60 byte packets
 1  10.8.0.1 (10.8.0.1)  1.234 ms  1.456 ms  1.678 ms
 2  * * *
 3  * * *
(Route blocked at FW-CITADEL-01 FORWARD chain)`;
            }
            return `traceroute to ${target || '?'}: Name or service not known`;
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '192.168.10.50') {
                return `PING 192.168.10.50 (192.168.10.50) 56(84) bytes of data.
From 10.8.0.1 icmp_seq=1 Destination Host Unreachable
From 10.8.0.1 icmp_seq=2 Destination Host Unreachable
From 10.8.0.1 icmp_seq=3 Destination Host Unreachable

--- 192.168.10.50 ping statistics ---
3 packets transmitted, 0 received, +3 errors, 100% packet loss

NOTE: VPN tunnel is UP (10.8.0.x assigned) but forwarded traffic is being DROPPED.`;
            }
            if (target === '10.8.0.1' || target === '10.8.0.6') {
                return `PING ${target} 56(84) bytes of data.\n64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.032 ms\n--- ${target} ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss`;
            }
            if (target === 'localhost' || target === '127.0.0.1') {
                return `PING ${target} 56(84) bytes of data.\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.012 ms\n--- ${target} ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss`;
            }
            return `ping: ${target}: Network is unreachable`;
        },

        'curl': function(args) {
            const url = args.find(a => /^https?:\/\//.test(a)) || args.filter(a => !a.startsWith('-')).pop() || '';
            if (!url) return 'curl: try \'curl --help\' for more information';
            if (url.includes('192.168.10.50') && url.includes('verification')) {
                return `Citadel Defense Perimeter — Verification Complete

VPN Access:     RESTORED
Threat Intel:   CONNECTED
Internal HTTP:  OPERATIONAL

Verification Token: {{FLAG:root}}

Signed: INTERNAL-SRV-01 / THREAT-INTEL-01
Timestamp: 2026-03-14T14:22:18Z`;
            }
            if (url.includes('192.168.10.50')) {
                return 'curl: (7) Failed to connect to 192.168.10.50 port 80: No route to host\n(Traffic blocked by FORWARD chain rule #3)';
            }
            return `curl: (7) Failed to connect: Connection refused`;
        },

        'nmap': function(args) {
            if (args.length === 0) return 'Usage: nmap [options] <target>';
            const target = args.find(a => !a.startsWith('-')) || '';
            if (target === '192.168.10.50') {
                return `Starting Nmap 7.94
Note: Host seems down (FORWARD chain blocking). Try -Pn for scan without ping.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
            }
            if (target === 'localhost' || target === '10.10.14.5') {
                return `Starting Nmap 7.94\nNmap scan report for ${target}\nHost is up.\n\nPORT     STATE SERVICE\n22/tcp   open  ssh\n1194/udp open  openvpn\n8443/tcp open  https-alt\n\nNmap done: 1 IP address (1 host up)`;
            }
            return `Starting Nmap 7.94\nNote: Host seems down.\nNmap done: 0 hosts up.`;
        },

        'htop': function(args) {
            return `  CPU[||||||                 14.2%]   Tasks: 52, 148 thr; 1 running
  Mem[|||||||            1.8G/4.0G]   Load average: 0.42 0.38 0.31
  Swp[                   0.0K/2.0G]   Uptime: 2 days, 14:22:18

    PID USER      PRI  NI  VIRT   RES   SHR S CPU%  MEM%   TIME+  Command
   1847 root       20   0  38.2M  12M  4200 S  0.8   0.3    2:14 openvpn --config /etc/openvpn/server.conf
   2891 root       20   0  412M   84M  12M  S  4.2   2.1   18:42 /usr/bin/suricata -c /etc/suricata/suricata.yaml
    892 root       20   0  168M   12M  8400 S  0.1   0.3    0:42 /lib/systemd/systemd`;
        },

        'top': function(args) {
            return `top - 14:22:18 up 2 days, 14:22,  1 user,  load average: 0.42, 0.38, 0.31
Tasks:  52 total,   1 running,  51 sleeping
%Cpu(s): 14.2 us,  2.1 sy,  0.0 ni, 83.0 id,  0.5 wa
MiB Mem :   4096.0 total,   2200.0 free,   1800.0 used,     96.0 buff/cache

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM COMMAND
   2891 root      20   0  412.0m  84.0m  12.0m S   4.2   2.1 suricata
   1847 root      20   0   38.2m  12.0m   4.2m S   0.8   0.3 openvpn`;
        },

        'df': function(args) {
            return `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1       120G   28G   92G  23% /
tmpfs           2.0G  4.0K  2.0G   1% /tmp`;
        },

        'free': function(args) {
            return `               total        used        free      shared  buff/cache   available
Mem:           4.0Gi       1.8Gi       2.1Gi        64Mi        96Mi       2.0Gi
Swap:          2.0Gi          0B       2.0Gi`;
        },

        'ps': function(args) {
            if (args.includes('aux') || args.includes('-ef')) {
                return `USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.3 168000 12000 ?        Ss   Mar12   0:42 /lib/systemd/systemd
root        1847  0.8  0.3  39117 12000 ?        Ss   Mar12   2:14 openvpn --config /etc/openvpn/server.conf
root        2891  4.2  2.1 421888 84000 ?        Sl   Mar12  18:42 /usr/bin/suricata -c /etc/suricata/suricata.yaml
root        3001  0.0  0.0  15280  2004 ?        Ss   Mar12   0:00 /usr/sbin/sshd
fw_admin    3401  0.0  0.0  22528  4800 pts/0    Ss   14:20   0:00 -bash`;
            }
            return 'Usage: ps [aux|-ef]';
        },

        'netstat': function(args) {
            return `Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:8443            0.0.0.0:*               LISTEN
udp        0      0 0.0.0.0:1194            0.0.0.0:*               LISTEN
udp        0      0 10.10.14.5:1194         82.14.221.100:49821     ESTABLISHED
udp        0      0 10.10.14.5:1194         91.203.45.88:51002      ESTABLISHED
udp        0      0 10.10.14.5:1194         77.84.12.200:48777      ESTABLISHED`;
        },

        'ss': function(args) {
            return `Netid  State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port
tcp    LISTEN  0       128     0.0.0.0:22            0.0.0.0:*
tcp    LISTEN  0       128     0.0.0.0:8443          0.0.0.0:*
udp    LISTEN  0       0       0.0.0.0:1194          0.0.0.0:*
udp    ESTAB   0       0       10.10.14.5:1194       82.14.221.100:49821
udp    ESTAB   0       0       10.10.14.5:1194       91.203.45.88:51002
udp    ESTAB   0       0       10.10.14.5:1194       77.84.12.200:48777`;
        },

        'ip': function(args) {
            if (args[0] === 'a' || args[0] === 'addr') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n    inet 10.10.14.5/24 brd 10.10.14.255 scope global eth0\n3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n    inet 192.168.10.1/24 brd 192.168.10.255 scope global eth1\n4: tun0: <POINTOPOINT,MULTICAST,NOARP,UP,LOWER_UP> mtu 1500\n    inet 10.8.0.1 peer 10.8.0.2/32 scope global tun0`;
            }
            if (args[0] === 'route') {
                return `default via 10.10.14.1 dev eth0\n10.8.0.0/24 dev tun0 proto kernel scope link src 10.8.0.1\n10.10.14.0/24 dev eth0 proto kernel scope link src 10.10.14.5\n192.168.10.0/24 dev eth1 proto kernel scope link src 192.168.10.1`;
            }
            return 'Usage: ip [addr|route|link]';
        },

        'systemctl': function(args) {
            const argStr = args.join(' ');
            if (argStr.includes('openvpn')) {
                return `openvpn@server.service - OpenVPN connection to server
     Loaded: loaded (/lib/systemd/system/openvpn@.service; enabled)
     Active: active (running) since Sat 2026-03-12 14:00:00 UTC; 2 days ago
   Main PID: 1847 (openvpn)
     Status: "Connected clients: 3"
     Memory: 12.0M`;
            }
            if (argStr.includes('suricata')) {
                return `suricata.service - Suricata IDS
     Loaded: loaded (/lib/systemd/system/suricata.service; enabled)
     Active: active (running) since Sat 2026-03-12 14:29:00 UTC; 2 days ago
   Main PID: 2891 (suricata)
     Status: "Processing packets"
     Memory: 84.0M`;
            }
            return 'Unit not found.';
        },

        'journalctl': function(args) {
            const argStr = args.join(' ');
            if (argStr.includes('suricata')) {
                return `Mar 12 14:29:00 FW-CITADEL-01 suricata[2891]: Loading rule file /etc/suricata/rules/local.rules\nMar 12 14:30:01 FW-CITADEL-01 suricata[2891]: [Drop] SID:2024001 OpenVPN Connection Detected\nMar 12 14:30:02 FW-CITADEL-01 suricata[2891]: [Drop] SID:2024002 Outbound SSL to Non-Standard Port\nMar 13 08:00:01 FW-CITADEL-01 suricata[2891]: [Drop] SID:2024002 Outbound SSL to Non-Standard Port`;
            }
            if (argStr.includes('openvpn')) {
                return `Mar 12 14:00:00 FW-CITADEL-01 openvpn[1847]: Initialization Sequence Completed\nMar 14 08:22:01 FW-CITADEL-01 openvpn[1847]: client-01 CONNECTED\nMar 14 09:15:33 FW-CITADEL-01 openvpn[1847]: client-02 CONNECTED\nMar 14 11:42:18 FW-CITADEL-01 openvpn[1847]: client-03 CONNECTED`;
            }
            return 'No journal entries matching criteria.';
        },

        'suricatasc': function(args) {
            return `Suricata Stats:\n  Alerts: 47 (24h)\n  Drops: 47\n  Rules loaded: 2 (local.rules)\n  SID:2024001 — 28 drops (OpenVPN)\n  SID:2024002 — 19 drops (SSL Non-Standard Port)`;
        },

        'ufw': function(args) { return 'ufw: not installed. This system uses iptables directly.'; },
        'firewall-cmd': function(args) { return 'firewalld: not installed. This system uses iptables directly.'; },
        'openvpn': function(args) { return 'OpenVPN server is running as a service. Use systemctl status openvpn to check.'; },

        'whoami': function() { return 'fw_admin'; },
        'id': function() { return 'uid=1000(fw_admin) gid=1000(fw_admin) groups=1000(fw_admin),27(sudo)'; },
        'hostname': function() { return 'FW-CITADEL-01'; },
        'uname': function(args) {
            if (args.includes('-a')) return 'Linux FW-CITADEL-01 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux';
            return 'Linux';
        },
        'uptime': function() { return ' 14:22:18 up 2 days, 14:22,  1 user,  load average: 0.42, 0.38, 0.31'; },
        'history': function() {
            return `    1  sudo iptables -L -n -v\n    2  sudo iptables -L FORWARD -n --line-numbers\n    3  ping 192.168.10.50\n    4  sudo cat /var/log/suricata/fast.log\n    5  sudo systemctl status openvpn`;
        },
        'man': function(args) {
            if (!args[0]) return 'What manual page do you want?';
            return `${args[0].toUpperCase()}(1) — Use '${args[0]} --help' for quick usage.`;
        },
        'find': function(args) {
            const argStr = args.join(' ');
            if (argStr.includes('suricata') || argStr.includes('rules')) return '/etc/suricata/suricata.yaml\n/etc/suricata/rules/local.rules\n/var/log/suricata/fast.log\n/var/log/suricata/eve.json';
            if (argStr.includes('openvpn') || argStr.includes('vpn')) return '/etc/openvpn/server.conf\n/var/log/openvpn/openvpn.log\n/var/log/openvpn/status.log';
            return 'find: specify search path and criteria';
        },
        'head': function(args) { return 'Use cat to view file contents.'; },
        'tail': function(args) { return 'Use cat to view file contents.'; },
        'less': function(args) { return 'Use cat to view file contents.'; },
        'wc': function(args) { return '  47 /var/log/suricata/fast.log'; },
        'file': function(args) { return (args[0] || 'file') + ': ASCII text'; },
        'echo': function(args) { return args.join(' '); },
        'export': function(args) { return ''; },
        'sudo': function(args, term, engine) {
            const cmd = args[0];
            if (cmd && B8Config.commands[cmd]) {
                return B8Config.commands[cmd](args.slice(1), term, engine);
            }
            return `sudo: ${cmd || 'command'}: command not found`;
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
