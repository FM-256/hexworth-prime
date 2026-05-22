/* ============================================================
   CTF ARENA — Box B12: The Blind Watchman
   SOC Troubleshooting — SIEM & Alerting | Citadel Monitoring Center
   Config: SIEM, log parsing, correlation rules, flags, hints, lore
   ============================================================ */

const B12Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Blind Watchman',
    subtitle: 'SOC Troubleshooting — SIEM & Alerting',
    difficulty: 'Advanced',
    accent: '#6366f1',
    storageKey: 'hexworth_ctf_b12',
    registryId: 'b12-blind-watchman',
    trackerKey: 'ctf_b12',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer troubleshooting chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'SIEM Assessment',
            icon: '\uD83D\uDD0D',
            description: 'Connect to ArgusEye SIEM. Assess the state of log ingestion and alerting.',
            requiredFlags: [],
            mitre: ['T1530', 'T1082'],
            unlocks: ['log-analysis'],
            locked: false
        },
        {
            id: 'log-analysis',
            name: 'Log Analysis',
            icon: '\uD83D\uDCCA',
            description: 'Verify log sources, inspect parsing configurations, identify data gaps.',
            requiredFlags: [],
            mitre: ['T1005', 'T1119'],
            unlocks: ['rule-diagnosis'],
            locked: true
        },
        {
            id: 'rule-diagnosis',
            name: 'Rule Diagnosis',
            icon: '\u26A0\uFE0F',
            description: 'Identify the misconfigured correlation rule and broken grok filter causing missed alerts.',
            requiredFlags: ['user'],
            mitre: ['T1562.006', 'T1070.002'],
            unlocks: ['remediation'],
            locked: true
        },
        {
            id: 'remediation',
            name: 'Remediation & Verification',
            icon: '\u2705',
            description: 'Fix the parsing error and correlation rule. Verify ArgusEye detects the simulated attack.',
            requiredFlags: ['root'],
            mitre: ['T1562.001'],
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
                title: 'Assess SIEM status and log ingestion',
                tip: 'Run: systemctl status elasticsearch logstash kibana to check services. Then check /var/log/logstash/ for errors.',
                trigger: { event: 'command', match: { cmd: 'contains:systemctl' } }
            },
            {
                title: 'Inspect log source ingestion',
                tip: 'Use curl to query Elasticsearch: curl -s localhost:9200/_cat/indices to see which log indices exist.',
                trigger: { event: 'command', match: { cmd: 'contains:curl' } }
            },
            {
                title: 'Find the broken grok filter',
                tip: 'Check /etc/logstash/conf.d/dc_relic_filter.conf for the regex error in the grok pattern.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Fix parsing and correlation rules',
                tip: 'After fixing the grok filter, restart logstash and check if the brute-force alert triggers.',
                trigger: { event: 'command', match: { cmd: 'contains:restart' } }
            },
            {
                title: 'Verify critical alert fires',
                tip: 'Trigger a simulated login event and confirm ArgusEye generates the critical alert with the root flag.',
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
            { flagId: 'user', objective: '4.4', description: 'Given a scenario, analyze the output of security tools -- SIEM log parsing', skill: 'Grok Filter Analysis' },
            { flagId: 'user', objective: '1.2', description: 'Given a scenario, analyze indicators of malicious activity -- Log correlation gaps', skill: 'SIEM Misconfiguration Detection' },
            { flagId: 'root', objective: '4.3', description: 'Given an incident, utilize appropriate data sources for investigation -- SIEM tuning', skill: 'Correlation Rule Remediation' },
            { flagId: 'root', objective: '4.9', description: 'Given a scenario, use data sources to support an investigation -- Alert validation', skill: 'SOC Alert Verification' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Citadel SOC Server BIOS v3.1.0',
            'Initializing hardware...',
            'Memory Test: 32768 MB OK',
            'Detecting drives... /dev/sda1 (1TB NVMe SSD)',
            'RAID Controller: 4x 2TB HDD (RAID-5)',
            'Network: 2x 10GbE detected',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Citadel SOC Linux (ELK Stack)',
            'Citadel SOC Linux (Recovery)',
            'Memory Diagnostics'
        ],
        loginUser: 'soc_admin'
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
        user: 'soc_admin',
        hostname: 'arguseye-siem',
        startDir: '/home/soc_admin',
        welcome: 'Citadel Monitoring Center — ArgusEye SIEM v7.2.1\nALERT: 847 unreviewed alerts in queue (estimated 94% false positive)\nWARNING: No critical alerts generated in 72 hours\n\nType \'help\' for available commands.\n'
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED SIEM DATA
    // ═══════════════════════════════════════════════════════

    _siemData: {
        logSources: [
            { name: 'DC-RELIC-01', type: 'Windows Domain Controller', status: 'INGESTING', parsed: false, index: 'dc-relic-logs', docs: 48291 },
            { name: 'FW-CITADEL-01', type: 'Firewall', status: 'INGESTING', parsed: true, index: 'fw-citadel-logs', docs: 125034 },
            { name: 'WEB-PROD-01', type: 'Web Server', status: 'INGESTING', parsed: true, index: 'web-prod-logs', docs: 67482 }
        ],
        correlationRules: [
            { id: 'CR-001', name: 'Brute Force Login', status: 'ACTIVE', threshold: 1, window: '24h', problem: 'Threshold too low (1 attempt triggers), window too wide (24h)' },
            { id: 'CR-002', name: 'Suspicious Admin Login', status: 'ACTIVE', depends: 'event_id field', problem: 'Depends on event_id parsed from DC-RELIC-01, but grok filter is broken' },
            { id: 'CR-003', name: 'Firewall Deny Spike', status: 'ACTIVE', threshold: 100, window: '5m', problem: 'None -- working correctly' },
            { id: 'CR-004', name: 'Web Shell Detection', status: 'DISABLED', problem: 'Disabled by previous admin' }
        ],
        brokenGrokLine: 'grok { match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{WORD:hostname} MSWinEventLog\\t%{NUMBER:event_id:int}\\t%{GREEDYDATA:message}" } }',
        fixedGrokLine: 'grok { match => { "message" => "%{TIMESTAMP_ISO8601:timestamp}\\s+%{WORD:hostname}\\s+MSWinEventLog\\s+%{NUMBER:event_id:int}\\s+%{GREEDYDATA:event_message}" } }',
        grokError: 'field "message" used as both source and target in grok pattern, regex delimiters wrong (tab vs whitespace)'
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
            text: 'Start by checking which log sources are being ingested. Use "curl -s localhost:9200/_cat/indices" to see Elasticsearch indices. Then check if DC-RELIC-01 logs are being parsed correctly.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'The Logstash filter for DC-RELIC-01 has a grok pattern error. Check /etc/logstash/conf.d/dc_relic_filter.conf. The grok uses tab delimiters (\\t) but the actual logs use spaces. Also, "message" is used as both source and target field.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The user flag is the broken filter file path and error: "dc_relic_filter.conf:grok_parse_failure:message_field_conflict". Check correlation rule CR-001 -- its threshold of 1 with a 24h window generates massive false positives.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'Fix the grok pattern to use \\s+ instead of \\t, rename target field to event_message, and update CR-001 threshold to 5 attempts in 5 minutes. After restarting logstash, the simulated brute-force alert will trigger and reveal the root flag.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Citadel Monitoring Center relies on ArgusEye, its SIEM system, to maintain vigilance across the network. But ArgusEye has gone effectively blind: critical intrusion alerts from the Domain Controller are being missed entirely, while an avalanche of false positives buries legitimate incidents. Analysts are desensitized, and the Citadel\'s defenses are crumbling from within.',
        scenario: 'Six months ago, a SIEM engineer updated the Logstash parsing configuration for the new Windows Event Log format from DC-RELIC-01. The updated grok pattern used tab delimiters instead of whitespace and reused the "message" field as both source and target, causing all parsed fields to be null. Without the event_id field, correlation rule CR-002 (Suspicious Admin Login) cannot fire. Meanwhile, CR-001 (Brute Force Login) was set with a threshold of 1 attempt per 24 hours -- triggering on every single failed login across the entire domain, generating 800+ false positives daily.',
        outro: 'ArgusEye\'s sight is restored. The broken grok filter has been corrected, the correlation rules are properly tuned, and the first critical alert in 72 hours confirms a suspicious admin login from an untrusted IP. The Citadel\'s watchman can see once more.',
        ecer: {
            executive: 'No testing pipeline for SIEM configuration changes before production deployment',
            culture: 'Alert fatigue normalized -- 800+ daily false positives treated as acceptable background noise',
            employee: 'Engineer deployed grok pattern without testing against sample logs or validating parsed output',
            regulatory: 'No requirement for SIEM detection validation (purple team exercises) after configuration changes'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — ArgusEye SIEM Dashboard
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://localhost:5601/arguseye/',

        pages: {
            '/arguseye/': {
                title: 'ArgusEye SIEM Dashboard',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #333;">
                        <h1 style="color:#6366f1; font-size:1.6rem; font-family:monospace; margin-bottom:4px;">ArgusEye SIEM v7.2.1</h1>
                        <div style="color:#888; font-size:0.8rem;">Citadel Monitoring Center &mdash; Threat Detection Dashboard</div>
                    </div>

                    <div style="max-width:700px; margin:0 auto;">
                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:20px;">
                            <div style="background:#1a1a2e; border:1px solid #333; border-radius:6px; padding:14px; text-align:center;">
                                <div style="color:#e74c3c; font-size:1.8rem; font-weight:bold;">847</div>
                                <div style="color:#888; font-size:0.75rem;">Unreviewed Alerts</div>
                            </div>
                            <div style="background:#1a1a2e; border:1px solid #333; border-radius:6px; padding:14px; text-align:center;">
                                <div style="color:#f59e0b; font-size:1.8rem; font-weight:bold;">0</div>
                                <div style="color:#888; font-size:0.75rem;">Critical Alerts (72h)</div>
                            </div>
                            <div style="background:#1a1a2e; border:1px solid #333; border-radius:6px; padding:14px; text-align:center;">
                                <div style="color:#2ecc71; font-size:1.8rem; font-weight:bold;">3</div>
                                <div style="color:#888; font-size:0.75rem;">Active Log Sources</div>
                            </div>
                        </div>

                        <div style="background:#1a1a2e; border:1px solid #333; border-radius:6px; padding:16px; margin-bottom:16px;">
                            <div style="color:#6366f1; font-weight:bold; font-size:0.9rem; margin-bottom:10px;">Log Sources</div>
                            <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                                <thead>
                                    <tr style="border-bottom:1px solid #333;">
                                        <th style="padding:6px; text-align:left; color:#6366f1;">Source</th>
                                        <th style="padding:6px; text-align:left; color:#6366f1;">Type</th>
                                        <th style="padding:6px; text-align:left; color:#6366f1;">Status</th>
                                        <th style="padding:6px; text-align:left; color:#6366f1;">Parsed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td style="padding:5px 6px; color:#ccc;">DC-RELIC-01</td><td style="color:#888;">Windows DC</td><td style="color:#2ecc71;">INGESTING</td><td style="color:#e74c3c;">PARSE ERROR</td></tr>
                                    <tr><td style="padding:5px 6px; color:#ccc;">FW-CITADEL-01</td><td style="color:#888;">Firewall</td><td style="color:#2ecc71;">INGESTING</td><td style="color:#2ecc71;">OK</td></tr>
                                    <tr><td style="padding:5px 6px; color:#ccc;">WEB-PROD-01</td><td style="color:#888;">Web Server</td><td style="color:#2ecc71;">INGESTING</td><td style="color:#2ecc71;">OK</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div style="background:#1a1a2e; border:1px solid #333; border-radius:6px; padding:16px; margin-bottom:16px;">
                            <div style="color:#6366f1; font-weight:bold; font-size:0.9rem; margin-bottom:10px;">Correlation Rules</div>
                            <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                                <thead>
                                    <tr style="border-bottom:1px solid #333;">
                                        <th style="padding:6px; text-align:left; color:#6366f1;">ID</th>
                                        <th style="padding:6px; text-align:left; color:#6366f1;">Rule</th>
                                        <th style="padding:6px; text-align:left; color:#6366f1;">Status</th>
                                        <th style="padding:6px; text-align:left; color:#6366f1;">Alerts (24h)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td style="padding:5px 6px; color:#ccc;">CR-001</td><td style="color:#888;">Brute Force Login</td><td style="color:#2ecc71;">ACTIVE</td><td style="color:#e74c3c;">812</td></tr>
                                    <tr><td style="padding:5px 6px; color:#ccc;">CR-002</td><td style="color:#888;">Suspicious Admin Login</td><td style="color:#2ecc71;">ACTIVE</td><td style="color:#f59e0b;">0 (NEVER FIRED)</td></tr>
                                    <tr><td style="padding:5px 6px; color:#ccc;">CR-003</td><td style="color:#888;">Firewall Deny Spike</td><td style="color:#2ecc71;">ACTIVE</td><td style="color:#ccc;">3</td></tr>
                                    <tr><td style="padding:5px 6px; color:#ccc;">CR-004</td><td style="color:#888;">Web Shell Detection</td><td style="color:#e74c3c;">DISABLED</td><td style="color:#888;">--</td></tr>
                                </tbody>
                            </table>
                        </div>

                        <div style="background:#2d1b1b; border:1px solid #e74c3c33; border-radius:6px; padding:12px; margin-top:16px; color:#e74c3c; font-size:0.8rem;">
                            WARNING: CR-002 (Suspicious Admin Login) has never fired. DC-RELIC-01 parsing errors detected. 812 false positives from CR-001 in 24h.
                        </div>
                    </div>
                `,
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (SIEM server)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'soc_admin': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: ArgusEye SIEM (ELK Stack)\nObjective: Fix broken log parsing and correlation rules\n\nKnown issues:\n- Critical alerts not firing for 72 hours\n- 800+ false positives daily from brute-force rule\n- DC-RELIC-01 logs ingesting but not parsing correctly\n- Analysts desensitized to alert queue\n\nSteps:\n1. Check SIEM service status and log ingestion\n2. Inspect Logstash filter configurations\n3. Identify broken grok pattern for DC-RELIC-01\n4. Fix parsing and tune correlation rules\n5. Verify critical alert fires\n\nGood luck, operator.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'systemctl status elasticsearch\nsystemctl status logstash\ncurl -s localhost:9200/_cat/indices\ncat /etc/logstash/conf.d/dc_relic_filter.conf\ntail -f /var/log/logstash/logstash-plain.log'
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'logstash': {
                            type: 'dir',
                            children: {
                                'conf.d': {
                                    type: 'dir',
                                    children: {
                                        'dc_relic_input.conf': {
                                            type: 'file',
                                            content: '# Logstash input for DC-RELIC-01 (Windows Domain Controller)\ninput {\n  beats {\n    port => 5044\n    tags => ["dc-relic"]\n  }\n}'
                                        },
                                        'dc_relic_filter.conf': {
                                            type: 'file',
                                            content: '# Logstash filter for DC-RELIC-01 Windows Event Logs\n# Last modified: 2025-09-14 by K. Vasquez\n# BUG: Tab delimiters don\'t match actual log format (spaces)\n# BUG: "message" field used as both source and grok target\n\nfilter {\n  if "dc-relic" in [tags] {\n    grok {\n      match => {\n        "message" => "%{TIMESTAMP_ISO8601:timestamp}\\t%{WORD:hostname}\\tMSWinEventLog\\t%{NUMBER:event_id:int}\\t%{GREEDYDATA:message}"\n      }\n    }\n\n    # This mutate never fires because grok fails\n    mutate {\n      add_field => { "source_system" => "DC-RELIC-01" }\n    }\n\n    # Date filter for timestamp normalization\n    date {\n      match => [ "timestamp", "ISO8601" ]\n      target => "@timestamp"\n    }\n  }\n}'
                                        },
                                        'fw_citadel_filter.conf': {
                                            type: 'file',
                                            content: '# Logstash filter for FW-CITADEL-01 (Firewall)\nfilter {\n  if "fw-citadel" in [tags] {\n    grok {\n      match => {\n        "message" => "%{TIMESTAMP_ISO8601:timestamp}\\s+%{WORD:action}\\s+%{IP:src_ip}\\s+%{IP:dst_ip}\\s+%{NUMBER:src_port:int}\\s+%{NUMBER:dst_port:int}\\s+%{WORD:protocol}"\n      }\n    }\n    mutate {\n      add_field => { "source_system" => "FW-CITADEL-01" }\n    }\n  }\n}'
                                        },
                                        'web_prod_filter.conf': {
                                            type: 'file',
                                            content: '# Logstash filter for WEB-PROD-01 (Apache Web Server)\nfilter {\n  if "web-prod" in [tags] {\n    grok {\n      match => {\n        "message" => "%{COMBINEDAPACHELOG}"\n      }\n    }\n    mutate {\n      add_field => { "source_system" => "WEB-PROD-01" }\n    }\n  }\n}'
                                        },
                                        'output.conf': {
                                            type: 'file',
                                            content: '# Logstash output — Elasticsearch\noutput {\n  elasticsearch {\n    hosts => ["localhost:9200"]\n    index => "%{[source_system]}-%{+YYYY.MM.dd}"\n  }\n}'
                                        }
                                    }
                                }
                            }
                        },
                        'arguseye': {
                            type: 'dir',
                            children: {
                                'correlation-rules': {
                                    type: 'dir',
                                    children: {
                                        'CR-001-brute-force.yml': {
                                            type: 'file',
                                            content: '# CR-001: Brute Force Login Detection\n# STATUS: ACTIVE\n# PROBLEM: Threshold too low, window too wide\n\nrule:\n  id: CR-001\n  name: "Brute Force Login Attempt"\n  severity: medium\n  conditions:\n    - field: event_id\n      value: 4625   # Failed login\n    - threshold: 1  # <-- Should be 5+\n      window: 24h   # <-- Should be 5m\n      group_by: source_ip\n  actions:\n    - alert:\n        level: warning\n        message: "Brute force attempt detected from {source_ip}"\n  notes: |\n    This rule fires on EVERY failed login (threshold=1, 24h window).\n    Generates ~812 alerts per day. Needs tuning.'
                                        },
                                        'CR-002-suspicious-admin.yml': {
                                            type: 'file',
                                            content: '# CR-002: Suspicious Admin Login Detection\n# STATUS: ACTIVE (but never fires)\n# DEPENDS: event_id field from DC-RELIC-01 parsed logs\n\nrule:\n  id: CR-002\n  name: "Suspicious Admin Login from Untrusted IP"\n  severity: critical\n  conditions:\n    - field: event_id\n      value: 4624   # Successful login\n    - field: account_type\n      value: "admin"\n    - field: source_ip\n      not_in:\n        - 10.10.50.0/24  # Trusted admin subnet\n        - 10.10.51.0/24  # VPN subnet\n  actions:\n    - alert:\n        level: critical\n        message: "Critical: Admin login from untrusted IP {source_ip} to {hostname}"\n  notes: |\n    This rule NEVER fires because event_id is never parsed from DC-RELIC-01.\n    The grok filter in dc_relic_filter.conf is broken.'
                                        },
                                        'CR-003-fw-deny-spike.yml': {
                                            type: 'file',
                                            content: '# CR-003: Firewall Deny Spike\n# STATUS: ACTIVE (working correctly)\n\nrule:\n  id: CR-003\n  name: "Firewall Deny Spike"\n  severity: high\n  conditions:\n    - field: action\n      value: DENY\n    - threshold: 100\n      window: 5m\n      group_by: src_ip\n  actions:\n    - alert:\n        level: high\n        message: "Firewall deny spike from {src_ip}: {count} denies in 5m"'
                                        }
                                    }
                                }
                            }
                        },
                        'hostname': { type: 'file', content: 'arguseye-siem' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\nsoc_admin:x:1000:1000:SOC Admin:/home/soc_admin:/bin/bash\nelasticsearch:x:1001:1001:Elasticsearch:/var/lib/elasticsearch:/usr/sbin/nologin\nlogstash:x:1002:1002:Logstash:/var/lib/logstash:/usr/sbin/nologin\nkibana:x:1003:1003:Kibana:/var/lib/kibana:/usr/sbin/nologin'
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    children: {
                        'log': {
                            type: 'dir',
                            children: {
                                'logstash': {
                                    type: 'dir',
                                    children: {
                                        'logstash-plain.log': {
                                            type: 'file',
                                            content: '[2026-03-19T02:00:01,234][WARN ][logstash.filters.grok] Grok parse failure on dc-relic tagged event\n[2026-03-19T02:00:01,235][WARN ][logstash.filters.grok] Pattern mismatch: expected tab delimiter, found whitespace\n[2026-03-19T02:00:01,236][ERROR][logstash.filters.grok] Field "message" cannot be used as both source and target in grok pattern\n[2026-03-19T02:00:02,100][INFO ][logstash.filters.grok] Successfully parsed fw-citadel tagged event\n[2026-03-19T02:00:02,200][INFO ][logstash.filters.grok] Successfully parsed web-prod tagged event\n[2026-03-19T02:00:05,000][WARN ][logstash.filters.grok] Grok parse failure on dc-relic tagged event (repeated 48291 times)\n[2026-03-19T02:00:05,001][WARN ][logstash.outputs.elasticsearch] Writing dc-relic event without parsed fields -- _grokparsefailure tag added'
                                        }
                                    }
                                },
                                'elasticsearch': {
                                    type: 'dir',
                                    children: {
                                        'elasticsearch.log': {
                                            type: 'file',
                                            content: '[2026-03-19T02:00:00,100][INFO ][o.e.c.m.MetaData] [arguseye-node-1] index [dc-relic-logs-2026.03.19] created\n[2026-03-19T02:00:00,200][INFO ][o.e.c.m.MetaData] [arguseye-node-1] index [fw-citadel-logs-2026.03.19] created\n[2026-03-19T02:00:00,300][INFO ][o.e.c.m.MetaData] [arguseye-node-1] index [web-prod-logs-2026.03.19] created\n[2026-03-19T02:00:01,000][WARN ][o.e.i.IndexingMemoryController] high indexing pressure -- 48291 dc-relic events with _grokparsefailure'
                                        }
                                    }
                                },
                                'syslog': {
                                    type: 'file',
                                    content: 'Mar 19 02:00:00 arguseye-siem systemd[1]: Started Elasticsearch.\nMar 19 02:00:00 arguseye-siem systemd[1]: Started Logstash.\nMar 19 02:00:00 arguseye-siem systemd[1]: Started Kibana.\nMar 19 02:00:01 arguseye-siem logstash[2345]: WARNING: grok parse failures detected on dc-relic pipeline\nMar 19 02:00:05 arguseye-siem arguseye-alerts[3456]: CR-001 triggered 812 times in last 24h\nMar 19 02:00:05 arguseye-siem arguseye-alerts[3456]: CR-002 has NEVER triggered -- depends on unparsed event_id field\nMar 19 02:00:05 arguseye-siem arguseye-alerts[3456]: WARNING: No critical alerts in 72 hours'
                                }
                            }
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {
                        'sample-dc-relic-log.txt': {
                            type: 'file',
                            content: '2026-03-19T01:45:00.000Z DC-RELIC-01 MSWinEventLog 4625 An account failed to log on. Subject: Security ID: S-1-5-18 Account Name: SYSTEM Logon Type: 3 Source Network Address: 10.10.99.45\n2026-03-19T01:45:01.000Z DC-RELIC-01 MSWinEventLog 4625 An account failed to log on. Subject: Security ID: S-1-5-18 Account Name: SYSTEM Logon Type: 3 Source Network Address: 10.10.99.45\n2026-03-19T01:45:02.000Z DC-RELIC-01 MSWinEventLog 4625 An account failed to log on. Subject: Security ID: S-1-5-18 Account Name: SYSTEM Logon Type: 3 Source Network Address: 10.10.99.45\n2026-03-19T01:45:05.000Z DC-RELIC-01 MSWinEventLog 4624 An account was successfully logged on. Subject: Security ID: S-1-5-18 Account Name: Administrator Logon Type: 10 Source Network Address: 10.10.99.45\n\nNOTE: Fields are SPACE-delimited, not TAB-delimited.\nThe grok filter in dc_relic_filter.conf expects tabs (\\t) but the actual format uses spaces.'
                        },
                        'grok-debug-output.txt': {
                            type: 'file',
                            content: '=== Grok Debug Report ===\nPattern: %{TIMESTAMP_ISO8601:timestamp}\\t%{WORD:hostname}\\tMSWinEventLog\\t%{NUMBER:event_id:int}\\t%{GREEDYDATA:message}\nInput: 2026-03-19T01:45:00.000Z DC-RELIC-01 MSWinEventLog 4625 An account failed...\nResult: NO MATCH\nReason: Tab characters (\\t) in pattern do not match whitespace in input.\n\nAdditional issue: "message" field used as both grok source and target.\nThis causes field conflict -- parsed output overwrites the source field.\n\n{{FLAG:user}}'
                        }
                    }
                },
                'opt': {
                    type: 'dir',
                    children: {
                        'arguseye': {
                            type: 'dir',
                            children: {
                                'verify-detection.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# ArgusEye Detection Verification Script\n# Simulates a critical event and checks if CR-002 fires\n\necho "=== ArgusEye Detection Verification ==="\necho "Injecting simulated Event 4624 (Admin login from untrusted IP)..."\necho ""\n\n# Check if event_id field is being parsed\nPARSED=$(curl -s localhost:9200/dc-relic-logs-*/_search -d \'{"query":{"exists":{"field":"event_id"}}}\' | grep -c "event_id")\n\nif [ "$PARSED" -gt 0 ]; then\n  echo "[OK] DC-RELIC-01 event_id field is being parsed correctly."\n  echo "[OK] CR-002 alert triggered: Critical Admin Login from 10.10.99.45"\n  echo ""\n  echo "{{FLAG:root}}"\n  echo ""\n  echo "ArgusEye detection capabilities RESTORED."\nelse\n  echo "[FAIL] DC-RELIC-01 event_id field is NOT being parsed."\n  echo "[FAIL] CR-002 cannot fire without parsed event_id field."\n  echo "Fix the grok filter in /etc/logstash/conf.d/dc_relic_filter.conf first."\nfi'
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
                                'logstash': {
                                    type: 'dir',
                                    children: {
                                        'patterns': {
                                            type: 'dir',
                                            children: {
                                                'windows-events': {
                                                    type: 'file',
                                                    content: '# Custom grok patterns for Windows Event Logs\nWINEVENT %{TIMESTAMP_ISO8601:timestamp}\\s+%{WORD:hostname}\\s+MSWinEventLog\\s+%{NUMBER:event_id:int}\\s+%{GREEDYDATA:event_detail}\n\n# NOTE: Use \\s+ (whitespace) not \\t (tabs)\n# NOTE: Do NOT reuse "message" as target field name'
                                                }
                                            }
                                        }
                                    }
                                }
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
        'systemctl': function(args) {
            const action = args[0] || '';
            const service = args[1] || '';

            if (action === 'status') {
                if (service === 'elasticsearch') {
                    return `elasticsearch.service - Elasticsearch
     Loaded: loaded (/usr/lib/systemd/system/elasticsearch.service; enabled)
     Active: active (running) since Wed 2026-03-19 02:00:00 UTC; 6h ago
   Main PID: 1234 (java)
      Tasks: 87 (limit: 65536)
     Memory: 4.2G
        CPU: 8m 34.567s

Mar 19 02:00:00 arguseye-siem elasticsearch[1234]: [arguseye-node-1] started`;
                }
                if (service === 'logstash') {
                    return `logstash.service - Logstash
     Loaded: loaded (/usr/lib/systemd/system/logstash.service; enabled)
     Active: active (running) since Wed 2026-03-19 02:00:00 UTC; 6h ago
   Main PID: 2345 (java)
      Tasks: 34 (limit: 65536)
     Memory: 1.8G
        CPU: 3m 12.345s

Mar 19 02:00:01 arguseye-siem logstash[2345]: WARNING: Grok parse failures on dc-relic pipeline
Mar 19 02:00:05 arguseye-siem logstash[2345]: 48291 events tagged _grokparsefailure`;
                }
                if (service === 'kibana') {
                    return `kibana.service - Kibana
     Loaded: loaded (/usr/lib/systemd/system/kibana.service; enabled)
     Active: active (running) since Wed 2026-03-19 02:00:00 UTC; 6h ago
   Main PID: 3456 (node)
      Tasks: 11 (limit: 65536)
     Memory: 512M

Mar 19 02:00:00 arguseye-siem kibana[3456]: Server running at http://localhost:5601`;
                }
                return `Unit ${service}.service could not be found.`;
            }

            if (action === 'restart' && service === 'logstash') {
                return `Restarting logstash.service - Logstash...
Stopped Logstash.
Started Logstash.

[logstash] Reloading configuration from /etc/logstash/conf.d/...
[logstash] Pipeline dc-relic reloaded
[logstash] Reprocessing queued events...
[logstash] DC-RELIC-01 events now parsing successfully -- event_id field populated
[logstash] CR-002 evaluation triggered -- checking for suspicious admin logins...
[logstash] ALERT: CR-002 FIRED -- Admin login from untrusted IP 10.10.99.45 to DC-RELIC-01

{{FLAG:root}}`;
            }

            return `systemctl: invalid command '${action}'. Try 'status', 'restart', 'start', 'stop'.`;
        },

        'curl': function(args) {
            const url = args.find(a => /^https?:\/\//.test(a)) || args.filter(a => !a.startsWith('-')).pop() || '';
            if (!url) return 'curl: try \'curl --help\' for more information';

            if (url.includes('_cat/indices')) {
                return `green open dc-relic-logs-2026.03.19    abc123 1 0  48291 0  45.2mb  45.2mb
green open fw-citadel-logs-2026.03.19  def456 1 0 125034 0 112.8mb 112.8mb
green open web-prod-logs-2026.03.19    ghi789 1 0  67482 0  58.1mb  58.1mb`;
            }

            if (url.includes('_search') && url.includes('dc-relic')) {
                if (args.join(' ').includes('event_id')) {
                    return `{"took":15,"hits":{"total":{"value":0},"hits":[]}}

NOTE: No documents with parsed "event_id" field found in dc-relic index.
      All 48291 documents have _grokparsefailure tag.`;
                }
                if (args.join(' ').includes('_grokparsefailure')) {
                    return `{"took":8,"hits":{"total":{"value":48291},"hits":[
  {"_source":{"message":"2026-03-19T01:45:00.000Z DC-RELIC-01 MSWinEventLog 4625 An account failed to log on...","tags":["dc-relic","_grokparsefailure"]}}
]}}

NOTE: All DC-RELIC-01 events have _grokparsefailure. Grok filter is broken.`;
                }
                return `{"took":5,"hits":{"total":{"value":48291},"hits":[
  {"_source":{"message":"2026-03-19T01:45:00.000Z DC-RELIC-01 MSWinEventLog 4625 An account failed to log on...","tags":["dc-relic","_grokparsefailure"]}}
]}}`;
            }

            if (url.includes('_cluster/health')) {
                return `{"cluster_name":"arguseye","status":"yellow","number_of_nodes":1,"active_primary_shards":3,"unassigned_shards":3}`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        'nmap': function(args) {
            if (args.length === 0) return 'Usage: nmap [options] <target>';
            return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00012s latency).

PORT     STATE  SERVICE
22/tcp   open   ssh
5044/tcp open   logstash-beats
5601/tcp open   kibana
9200/tcp open   elasticsearch
9300/tcp open   elasticsearch-cluster

Nmap done: 1 IP address (1 host up) scanned in 1.23 seconds`;
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === 'localhost' || target === '127.0.0.1') {
                return `PING ${target} 56(84) bytes of data.
64 bytes from ${target}: icmp_seq=1 ttl=64 time=0.1 ms
3 packets transmitted, 3 received, 0% packet loss`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'journalctl': function(args) {
            if (args.join(' ').includes('logstash')) {
                return `-- Journal for logstash.service --
Mar 19 02:00:00 arguseye-siem logstash[2345]: Starting Logstash pipeline
Mar 19 02:00:01 arguseye-siem logstash[2345]: [WARN] Grok parse failure on dc-relic event
Mar 19 02:00:01 arguseye-siem logstash[2345]: [ERROR] Field "message" conflict in grok pattern
Mar 19 02:00:01 arguseye-siem logstash[2345]: Pattern expects \\t (tab) but input has spaces
Mar 19 02:00:05 arguseye-siem logstash[2345]: 48291 dc-relic events failed grok parsing
Mar 19 02:00:05 arguseye-siem logstash[2345]: fw-citadel and web-prod pipelines OK`;
            }
            return `-- Journal begins at Wed 2026-03-19 02:00:00 UTC --
Mar 19 02:00:00 arguseye-siem systemd[1]: Started Elasticsearch.
Mar 19 02:00:00 arguseye-siem systemd[1]: Started Logstash.
Mar 19 02:00:00 arguseye-siem systemd[1]: Started Kibana.
Mar 19 02:00:01 arguseye-siem logstash[2345]: WARNING: dc-relic grok failures
Mar 19 02:00:05 arguseye-siem arguseye-alerts[3456]: CR-001: 812 alerts (24h)
Mar 19 02:00:05 arguseye-siem arguseye-alerts[3456]: CR-002: 0 alerts (NEVER FIRED)`;
        },

        'netstat': function(args) {
            return `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      1100/sshd
tcp        0      0 0.0.0.0:5044            0.0.0.0:*               LISTEN      2345/logstash
tcp        0      0 127.0.0.1:5601          0.0.0.0:*               LISTEN      3456/kibana
tcp        0      0 127.0.0.1:9200          0.0.0.0:*               LISTEN      1234/elasticsearch
tcp        0      0 127.0.0.1:9300          0.0.0.0:*               LISTEN      1234/elasticsearch`;
        },

        'ss': function(args) {
            return B12Config.commands.netstat(args);
        },

        'tcpdump': function(args) {
            return `tcpdump: listening on eth0, capture size 262144 bytes
02:14:00.123456 IP 10.10.50.10.52341 > arguseye-siem.5044: Flags [P.], seq 1:1024, ack 1 (DC-RELIC-01 beats)
02:14:00.234567 IP 10.10.50.20.48921 > arguseye-siem.5044: Flags [P.], seq 1:512, ack 1 (FW-CITADEL-01 beats)
02:14:00.345678 IP 10.10.50.30.39812 > arguseye-siem.5044: Flags [P.], seq 1:768, ack 1 (WEB-PROD-01 beats)
^C
3 packets captured`;
        },

        'ausearch': function(args) {
            return `ausearch: This is a SIEM server, not an audit node. Use Elasticsearch queries instead.
Try: curl -s localhost:9200/dc-relic-logs-*/_search -d \'{"query":{"match_all":{}}}\'`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#6366f1; border-bottom:2px solid #333; background:#1a1a2e;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #222; color:#ccc;">${cell}</td>`;
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
