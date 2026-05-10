/* ============================================================
   PIS-L12: Full Facility Inspection (Capstone)
   Principles of Information Security -- CTF Lab
   Lead auditor: inspect network architecture, access controls,
   encryption, IR readiness, policy compliance. Certify or fail.
   SY0-701: 1.0-5.0 (comprehensive)
   ============================================================ */

const PISL12Config = {

    // =========================================================
    // BOX METADATA
    // =========================================================

    title: 'Full Facility Inspection // Capstone',
    subtitle: 'Hexworth Containment -- BSL-4 Security Audit',
    description: 'You are the lead auditor. Inspect the entire facility: network architecture, access controls, encryption standards, certificate validity, incident response readiness, and policy compliance. Document every finding. At the end, certify the facility or fail it based on your evidence.',
    difficulty: 'Expert',
    estimatedTime: 45,
    accent: '#f59e0b',
    storageKey: 'hexworth_lab_pis_l12',
    registryId: 'pis-l12-full-facility-inspection',
    trackerKey: 'lab_pis_l12',

    // =========================================================
    // BOOT SEQUENCE
    // =========================================================

    boot: {
        biosLines: [
            'HEXWORTH CONTAINMENT WORKSTATION v4.2.1',
            'Security Audit Terminal -- External Auditor Access',
            'Read-only access to all facility systems: GRANTED',
            'Audit logging: ACTIVE (all commands recorded)',
            'Findings database: INITIALIZED',
            'Audit scope: Full facility -- BSL-1 through BSL-4'
        ],
        grubEntries: [
            'Containment Analyst OS 22.04 LTS',
            'Containment Analyst OS (recovery mode)'
        ],
        loginUser: 'auditor'
    },

    // =========================================================
    // LORE
    // =========================================================

    lore: {
        intro: 'You are the lead external auditor from the Regulatory Compliance Office. Hexworth Containment is due for its annual BSL-4 security audit. Accreditation requires a passing certification or the facility must suspend BSL-4 operations until remediation is complete. The facility director has provided read-only access to all systems. You have 45 minutes to inspect four domains: network architecture, access controls, cryptography, and IR readiness. Document every finding. Then make the call.',
        scenario: 'Run each audit command to inspect its domain. Each audit reveals a mix of compliant items and findings. Use "finding <area> <issue>" to formally document each non-compliant item you discover. At the end, review your findings and make the certification decision with either "certify" (all critical findings resolved or no blocking findings) or "fail-facility" (critical findings remain). This is a judgment call based on evidence -- not a trick.',
        outro: 'Audit complete. This capstone integrates every domain from the course: network segmentation (Week 3), PKI and certificates (Week 3), authentication and access control (Week 4), incident response readiness (Week 4), and security governance (Week 4). A real security audit is exactly this -- systematic inspection across all controls, documented findings, and a defensible certification decision.'
    },

    // =========================================================
    // TERMINAL CONFIG
    // =========================================================

    terminal: {
        user: 'auditor',
        hostname: 'audit-ws-01',
        startDir: '/home/auditor',
        welcome: 'Hexworth Containment -- Security Audit Terminal\nExternal Auditor Access -- Read Only\n\n*** ANNUAL BSL-4 SECURITY AUDIT ***\n  Scope: Full facility -- all security domains\n  Standard: NIST SP 800-53 + CompTIA Security+ SY0-701\n  Requirement: 0 critical findings to certify\n\nAudit domains:\n  audit-network    Network architecture and segmentation\n  audit-access     Authentication and access control\n  audit-crypto     Cryptography and certificate validity\n  audit-ir         Incident response readiness\n  audit-policy     Security policy compliance\n\nType "help" for full reference.\nType "audit-network" to begin.\n'
    },

    // =========================================================
    // DESKTOP ICONS
    // =========================================================

    desktop: {
        icons: [
            { id: 'briefing', label: 'Briefing',    icon: '\uD83D\uDCCB',    app: 'briefing' },
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD',    app: 'notes'    },
            { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1',    app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9',    app: 'flags'    }
        ]
    },

    // Custom desktop-icon dispatch \u2014 invoked by BoxEngine's `default:` extension
    // hook (BoxEngine.js:1110-1115) for any icon whose `app` is not built-in.
    onAppLaunch: function(iconDef, engine) {
        if (iconDef && iconDef.app === 'briefing') {
            // Re-summon \u2014 bypass skip-next-time storage; lab is already running
            // so the launch callback is a no-op.
            BriefingPage.show(this, function() {}, { force: true });
        }
    },

    // =========================================================
    // SIMULATED FILESYSTEM
    // =========================================================

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'auditor': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: 'AUDIT NOTES -- HEXWORTH CONTAINMENT\n=====================================\n\nAUDIT STANDARDS:\n  NIST SP 800-53 Rev 5 (Security and Privacy Controls)\n  CompTIA Security+ SY0-701 exam objectives\n  Hexworth Containment Policy HCP-001 through HCP-009\n\nFINDING SEVERITY LEVELS:\n  critical  -- Immediate risk of breach or compliance failure\n               BSL-4 certification BLOCKED until resolved\n  high      -- Significant risk, must remediate within 30 days\n  medium    -- Moderate risk, remediate within 90 days\n  low       -- Minor gap, note and monitor\n\nCERTIFICATION CRITERIA:\n  PASS: Zero critical findings\n  CONDITIONAL: 1-3 high findings (30-day remediation plan required)\n  FAIL: Any critical findings remain unresolved\n\nAUDIT WORKFLOW:\n  1. Run all 5 audit commands to inspect each domain\n  2. Document findings with: finding <area> <issue-description>\n  3. After all domains inspected, review findings\n  4. Run certify or fail-facility based on evidence\n\nAREA CODES FOR finding COMMAND:\n  network, access, crypto, ir, policy\n\nCOMMANDS:\n  audit-network     Inspect network architecture\n  audit-access      Inspect authentication and access controls\n  audit-crypto      Inspect cryptography and certificates\n  audit-ir          Inspect incident response readiness\n  audit-policy      Inspect security policy compliance\n  finding <area> <issue>   Document a finding\n  findings          Review all documented findings\n  certify           Issue passing certification\n  fail-facility     Issue failing audit result\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'cat notes.txt\n'
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    // =========================================================
    // INTERNAL STATE
    // =========================================================

    _state: {
        auditsDone: {},          // which audit commands have been run
        findings: [],                   // array of { area, issue, severity }
        certificationDecision: null,    // 'pass' | 'fail' | null
        findingsDocumented: false       // flag2 trigger: 3+ findings documented
    },

    // The 5 required audit domains
    _requiredAudits: ['network', 'access', 'crypto', 'ir', 'policy'],

    // The critical findings that are embedded in the audit output
    // Students must find and document these to make a valid certification decision
    _criticalFindings: {
        'network': 'maintenance-window-bypass',
        'access':  'service-account-no-mfa',
        'crypto':  'expired-certificate'
    },

    _flag1Awarded: false,
    _flag2Awarded: false,
    _flag3Awarded: false,
    _flag4Awarded: false,

    // =========================================================
    // AUDIT COMMAND RESULTS
    // =========================================================

    _auditResults: {

        network: `NETWORK ARCHITECTURE AUDIT\n${'='.repeat(60)}\n\nInspecting: CORE-SW-01, FW-PERIMETER-01, VLAN configuration\n\nCHECK 1: VLAN SEGMENTATION\n  VLANs configured: 7 (VLAN 10,20,30,40,50,60,100) [PASS]\n  Lab-to-lab isolation: ENFORCED via ACL [PASS]\n  Admin VLAN separated: YES (VLAN 100) [PASS]\n\nCHECK 2: FIREWALL RULES\n  Default deny inbound: YES [PASS]\n  Ingress filtering: ENABLED [PASS]\n  Egress filtering: PARTIAL -- outbound to any on port 443 permitted [MEDIUM FINDING]\n  Rule review date: 2025-11-01 (6 months overdue for quarterly review) [MEDIUM FINDING]\n\nCHECK 3: NETWORK MONITORING\n  IDS/IPS: ACTIVE (Snort 3.1.40) [PASS]\n  NetFlow collection: ENABLED [PASS]\n  Packet capture retention: 7 days [PASS]\n\nCHECK 4: MAINTENANCE WINDOW CONTROLS\n  Change management process: INCOMPLETE [CRITICAL FINDING]\n  Finding: The 2026-04-09 breach exploited a maintenance window\n  that disabled VLAN isolation without security team sign-off.\n  No documented procedure exists for security notification\n  before network topology changes. This directly enabled the breach.\n  Repeat risk: HIGH (next maintenance window could cause same failure)\n  Finding ID: NET-CRIT-001\n\nCHECK 5: ZERO TRUST ARCHITECTURE\n  Micro-segmentation: PARTIAL (VLAN-based, not workload-level) [LOW FINDING]\n  Identity verification per request: NOT IMPLEMENTED [HIGH FINDING]\n\nNETWORK AUDIT SUMMARY: 1 CRITICAL, 1 HIGH, 2 MEDIUM, 1 LOW\nDocument critical finding: finding network maintenance-window-bypass`,

        access: `ACCESS CONTROL AUDIT\n${'='.repeat(60)}\n\nInspecting: LDAP directory, MFA enrollment, RBAC policies\n\nCHECK 1: LDAP DIRECTORY\n  Directory: OpenLDAP 2.6 [PASS]\n  OU structure: 5 OUs (bsl1-bsl4 + admins) [PASS]\n  All personnel in directory: 12/12 [PASS]\n  Group nesting review: No circular groups [PASS]\n\nCHECK 2: MULTI-FACTOR AUTHENTICATION\n  MFA technology: TOTP (RFC 6238) [PASS]\n  Enrollment: 11/12 personnel enrolled [PARTIAL]\n  analyst-03 MFA: NOT ENROLLED [HIGH FINDING]\n  Service account admin-svc MFA: NOT ENROLLED [CRITICAL FINDING]\n  Finding: admin-svc is a privileged service account with\n  interactive login capability used across all lab segments.\n  It lacks MFA, and credentials were stolen and used in the\n  2026-04-09 breach. No controls prevent reuse of stolen credentials.\n  Finding ID: ACC-CRIT-001\n\nCHECK 3: RBAC POLICIES\n  BSL-1 role: read (Lab 1 only) [PASS]\n  BSL-2 role: read-write (Labs 1-2) [PASS]\n  BSL-3 role: full-access (Labs 1-3) [PASS]\n  BSL-4 role: full-access + dual-integrity [PASS]\n  Admin role: full-access [PASS]\n  Privilege review date: Current [PASS]\n\nCHECK 4: LEAST PRIVILEGE\n  BSL-1 analysts with BSL-2 access: 0 [PASS]\n  Orphaned accounts (departed personnel): 2 found [MEDIUM FINDING]\n  Accounts: former-analyst-12, intern-2025-07 (never deprovisioned)\n\nCHECK 5: PAM (PRIVILEGED ACCESS MANAGEMENT)\n  Privileged session recording: NOT IMPLEMENTED [HIGH FINDING]\n  Just-in-time access for BSL-4: NOT IMPLEMENTED [MEDIUM FINDING]\n\nACCESS AUDIT SUMMARY: 1 CRITICAL, 2 HIGH, 2 MEDIUM\nDocument critical finding: finding access service-account-no-mfa`,

        crypto: `CRYPTOGRAPHY AND CERTIFICATE AUDIT\n${'='.repeat(60)}\n\nInspecting: TLS configuration, certificate validity, key management\n\nCHECK 1: TLS CONFIGURATION\n  All internal services: TLS 1.2+ [PASS]\n  TLS 1.0/1.1 disabled facility-wide: YES [PASS]\n  SSL 2/3 disabled: YES [PASS]\n  Cipher suites: AES-256-GCM, CHACHA20-POLY1305 (strong) [PASS]\n  Certificate transparency logging: ENABLED [PASS]\n\nCHECK 2: CERTIFICATE VALIDITY\n  Root CA expiry: 2036-04-09 (10 years remaining) [PASS]\n  specimen-db-01 cert: VALID (expires 2027-04-09) [PASS]\n  containment-ctrl-01 cert: VALID (expires 2027-04-09) [PASS]\n  ws-pool-01 cert: VALID (expires 2027-04-09) [PASS]\n  relay-01 cert: REVOKED [PASS -- appropriately revoked]\n  lab3-srv-01 cert: EXPIRED 2024-11-15 [CRITICAL FINDING]\n  Finding: lab3-srv-01 is using an expired TLS certificate.\n  Clients fail soft on this server -- they display warnings\n  but still connect. This bypasses certificate validation\n  entirely, enabling man-in-the-middle attacks on lab3-srv-01.\n  Finding ID: CRYPT-CRIT-001\n\nCHECK 3: ENCRYPTION AT REST\n  Lab workstation disk encryption: BitLocker (AES-256) [PASS]\n  Specimen database encryption: AES-256-CBC [PASS]\n  Backup encryption: AES-256-GCM [PASS]\n  Log archive encryption: NOT ENABLED [MEDIUM FINDING]\n\nCHECK 4: KEY MANAGEMENT\n  Root CA key: HSM-protected [PASS]\n  Key rotation schedule: 90 days (documented) [PASS]\n  Last rotation: 2026-01-09 (within schedule) [PASS]\n  Key escrow: Director-controlled [PASS]\n  Key custodian dual-control: DOCUMENTED [PASS]\n\nCHECK 5: HASHING\n  Password hashing: bcrypt (cost factor 12) [PASS]\n  File integrity monitoring: SHA-256 daily [PASS]\n  MD5 in production use: NONE DETECTED [PASS]\n\nCRYPTO AUDIT SUMMARY: 1 CRITICAL, 0 HIGH, 1 MEDIUM\nDocument critical finding: finding crypto expired-certificate`,

        ir: `INCIDENT RESPONSE READINESS AUDIT\n${'='.repeat(60)}\n\nInspecting: IR playbook, tabletop exercise history, forensic tools\n\nCHECK 1: IR PLAN DOCUMENTATION\n  IR playbook (IRP-2026-001): CURRENT (updated 2026-03-01) [PASS]\n  NIST SP 800-61 alignment: VERIFIED [PASS]\n  Roles and responsibilities: DOCUMENTED [PASS]\n  Communication plan: DOCUMENTED [PASS]\n  Legal counsel contact: ON FILE [PASS]\n\nCHECK 2: TABLETOP EXERCISES\n  Last tabletop exercise: 2025-11-15 (5 months ago) [PASS]\n  Frequency requirement: Annually [PASS]\n  Post-exercise remediation: 3/4 items closed [LOW FINDING]\n  Open item: network segmentation procedure update (now addressed) [PASS]\n\nCHECK 3: FORENSIC CAPABILITIES\n  Forensic workstation: AVAILABLE [PASS]\n  Imaging tools (dc3dd): CURRENT [PASS]\n  Memory capture tools: AVAILABLE [PASS]\n  Chain of custody forms: DIGITAL + PAPER backup [PASS]\n  Forensic storage: 10 TB available [PASS]\n\nCHECK 4: BACKUP AND RECOVERY\n  Backup frequency: Daily at 00:00Z [PASS]\n  Backup verification: Monthly restore test [PASS]\n  Last restore test: 2026-03-15 (25 days ago) [PASS]\n  RTO documented: 4 hours (actual: 4.4 hours in last incident) [PASS]\n  RPO documented: 4 hours (actual: 4.4 hours in last incident) [PASS]\n  Backup encryption: ENABLED [PASS]\n  Offsite backup: YES (geographically separated) [PASS]\n\nCHECK 5: DETECTION CAPABILITIES\n  SIEM: Splunk Enterprise 9.2 [PASS]\n  Alert tuning: NEEDS REVIEW -- 96% false positive rate in last audit [MEDIUM FINDING]\n  Average time to detect: 8 minutes (last incident) [PASS]\n  Average time to contain: 12 minutes (last incident) [PASS]\n\nIR AUDIT SUMMARY: 0 CRITICAL, 0 HIGH, 1 MEDIUM, 1 LOW\nNo critical findings. IR posture is strong.\nDocument medium finding if desired: finding ir siem-false-positive-rate`,

        policy: `SECURITY POLICY COMPLIANCE AUDIT\n${'='.repeat(60)}\n\nInspecting: Policy inventory, user training, compliance records\n\nCHECK 1: POLICY INVENTORY\n  Acceptable Use Policy (AUP): CURRENT (2026-01-01) [PASS]\n  Password Policy: CURRENT (2026-01-01) [PASS]\n  Data Classification Policy: CURRENT (2026-02-01) [PASS]\n  Incident Response Policy: CURRENT (2026-03-01) [PASS]\n  Change Management Policy: OUTDATED -- last updated 2023-06-01 [HIGH FINDING]\n  Finding: Change management policy does not address security sign-off\n  requirements for network topology changes. This policy gap was a\n  contributing factor in the 2026-04-09 breach.\n\nCHECK 2: SECURITY AWARENESS TRAINING\n  Annual training completion: 11/12 personnel [PARTIAL]\n  analyst-07: Training overdue by 45 days [MEDIUM FINDING]\n  Note: analyst-07 credentials were compromised in the breach.\n  Phishing simulation scores: 78% click rate reduction vs 2025 [PASS]\n\nCHECK 3: VENDOR AND THIRD-PARTY MANAGEMENT\n  Vendor access agreements: 3/3 signed and current [PASS]\n  Third-party security assessments: CURRENT (2026-02-01) [PASS]\n  Supply chain policy: DOCUMENTED [PASS]\n\nCHECK 4: COMPLIANCE RECORDS\n  NIST 800-53 self-assessment: 2025-10-01 (6 months ago) [PASS]\n  External audit (prior): PASS (2025-04-01) [PASS]\n  Regulatory reporting (breach): FILED 2026-04-09T08:00Z [PASS]\n  Breach notification: Sent to affected parties within 72 hours [PASS]\n\nCHECK 5: RISK REGISTER\n  Risk register: MAINTAINED [PASS]\n  Last review: 2026-03-01 [PASS]\n  Open high risks: 2 (maintenance window control, PAM implementation) [HIGH]\n  Risk acceptance documentation: PRESENT [PASS]\n\nPOLICY AUDIT SUMMARY: 0 CRITICAL, 1 HIGH, 2 MEDIUM\nDocument high finding if desired: finding policy change-management-outdated`
    },

    // =========================================================
    // TERMINAL COMMANDS
    // =========================================================

    commands: {

        // audit-network -- run network architecture audit
        'audit-network': function(args, term, engine) {
            engine._state.auditsDone['network'] = true;
            return engine._auditResults.network;
        },

        // audit-access -- run access control audit
        'audit-access': function(args, term, engine) {
            engine._state.auditsDone['access'] = true;
            return engine._auditResults.access;
        },

        // audit-crypto -- run cryptography audit
        'audit-crypto': function(args, term, engine) {
            engine._state.auditsDone['crypto'] = true;
            return engine._auditResults.crypto;
        },

        // audit-ir -- run incident response readiness audit
        'audit-ir': function(args, term, engine) {
            engine._state.auditsDone['ir'] = true;
            return engine._auditResults.ir;
        },

        // audit-policy -- run security policy compliance audit
        'audit-policy': function(args, term, engine) {
            engine._state.auditsDone['policy'] = true;
            return engine._auditResults.policy;
        },

        // finding <area> <issue> -- document a finding
        'finding': function(args, term, engine) {
            const area  = (args[0] || '').toLowerCase();
            const issue = args.slice(1).join(' ');

            const validAreas = ['network', 'access', 'crypto', 'ir', 'policy'];

            if (!area || !issue) {
                return 'Usage: finding <area> <issue-description>\nAreas: network, access, crypto, ir, policy\nExample: finding network maintenance-window-bypass\nExample: finding access service-account-no-mfa';
            }

            if (!validAreas.includes(area)) {
                return `Error: "${area}" is not a valid audit area.\nValid areas: ${validAreas.join(', ')}`;
            }

            if (!engine._state.auditsDone[area]) {
                return `Error: You have not run audit-${area} yet.\nRun the audit first before documenting findings.`;
            }

            // Determine severity based on the issue text
            const criticalKeywords = ['maintenance-window-bypass', 'service-account-no-mfa', 'expired-certificate', 'critical', 'no-mfa', 'bypass'];
            const highKeywords     = ['change-management', 'pam', 'privileged', 'zero-trust', 'orphaned', 'overdue'];
            const mediumKeywords   = ['egress', 'false-positive', 'analyst', 'log'];

            let severity = 'low';
            const issueLower = issue.toLowerCase();
            if (criticalKeywords.some(k => issueLower.includes(k))) severity = 'critical';
            else if (highKeywords.some(k => issueLower.includes(k))) severity = 'high';
            else if (mediumKeywords.some(k => issueLower.includes(k))) severity = 'medium';

            const findingId = `F-${area.toUpperCase().substring(0,3)}-${String(engine._state.findings.length + 1).padStart(3,'0')}`;

            engine._state.findings.push({
                id: findingId,
                area,
                issue,
                severity,
                time: '2026-04-09T08:' + String(Math.floor(engine._state.findings.length * 3 + 15)).padStart(2,'0') + ':00Z'
            });

            let output = `FINDING DOCUMENTED\n  ID:       ${findingId}\n  Area:     ${area}\n  Issue:    ${issue}\n  Severity: ${severity.toUpperCase()}\n  Status:   Open\n\nTotal findings: ${engine._state.findings.length}`;

            // Flag 1 trigger: ran all 5 audits
            if (Object.keys(engine._state.auditsDone).length >= 5 && !engine._flag1Awarded) {
                engine._flag1Awarded = true;
                engine.awardFlag('flag1');
                output += '\n\n[AUDIT MILESTONE] Network architecture audit complete across all domains. Flag unlocked.';
            }

            // Check flag2: completed all audits AND documented the 3 critical findings
            const hasCriticalNetwork = engine._state.findings.some(f => f.area === 'network' && f.severity === 'critical');
            const hasCriticalAccess  = engine._state.findings.some(f => f.area === 'access'  && f.severity === 'critical');
            const hasCriticalCrypto  = engine._state.findings.some(f => f.area === 'crypto'  && f.severity === 'critical');

            if (hasCriticalNetwork && hasCriticalAccess && hasCriticalCrypto && Object.keys(engine._state.auditsDone).length >= 5 && !engine._flag2Awarded) {
                engine._flag2Awarded = true;
                engine.awardFlag('flag2');
                output += '\n\n[AUDIT MILESTONE] All 5 audit domains inspected with critical findings documented. Flag unlocked.\nReview findings: run "findings", then make your certification decision.';
            }

            return output;
        },

        // findings -- review all documented findings
        'findings': function(args, term, engine) {
            if (engine._state.findings.length === 0) {
                return 'No findings documented yet.\nRun audit commands and document findings with: finding <area> <issue>';
            }

            const criticalCount = engine._state.findings.filter(f => f.severity === 'critical').length;
            const highCount     = engine._state.findings.filter(f => f.severity === 'high').length;
            const mediumCount   = engine._state.findings.filter(f => f.severity === 'medium').length;
            const lowCount      = engine._state.findings.filter(f => f.severity === 'low').length;

            let lines = [
                'AUDIT FINDINGS SUMMARY',
                '='.repeat(60),
                `Total: ${engine._state.findings.length} findings (${criticalCount} CRITICAL, ${highCount} HIGH, ${mediumCount} MEDIUM, ${lowCount} LOW)`,
                '',
                'ID          AREA     SEVERITY   ISSUE',
                '─'.repeat(70)
            ];

            for (const f of engine._state.findings) {
                lines.push(`  ${f.id.padEnd(12)} ${f.area.padEnd(9)} ${f.severity.toUpperCase().padEnd(11)} ${f.issue}`);
            }

            lines.push('');
            lines.push('CERTIFICATION CRITERIA:');
            lines.push(`  Critical findings: ${criticalCount} (must be 0 to certify)`);
            lines.push(`  Certification status: ${criticalCount === 0 ? 'ELIGIBLE TO CERTIFY' : 'BLOCKED -- ' + criticalCount + ' critical finding(s) unresolved'}`);
            lines.push('');
            lines.push(`${criticalCount > 0 ? 'Run: fail-facility (critical findings prevent certification)' : 'Run: certify  OR  fail-facility  based on your judgment'}`);

            let output = lines.join('\n');

            // Flag 3: all 5 audits done and findings reviewed
            if (Object.keys(engine._state.auditsDone).length >= 5 && engine._flag2Awarded && !engine._flag3Awarded) {
                engine._flag3Awarded = true;
                engine.awardFlag('flag3');
                output += '\n\n[AUDIT MILESTONE] All audit domains inspected and findings reviewed. Flag unlocked.\nMake your certification decision: certify or fail-facility';
            }

            return output;
        },

        // certify -- issue passing certification (requires all audits done, critical findings present = wrong call)
        'certify': function(args, term, engine) {
            const domainsInspected = Object.keys(engine._state.auditsDone).length;
            if (domainsInspected < 5) {
                return `Cannot certify: only ${domainsInspected}/5 audit domains have been inspected.\nRun all 5 audit commands first.`;
            }

            if (engine._state.certificationDecision) {
                return `Certification decision already filed: ${engine._state.certificationDecision.toUpperCase()}`;
            }

            const criticalCount = engine._state.findings.filter(f => f.severity === 'critical').length;

            // Certifying with documented critical findings is wrong -- the facility should fail
            if (criticalCount >= 3) {
                engine._state.certificationDecision = 'fail';

                let output = `CERTIFICATION DECISION: FAIL\n${'='.repeat(60)}\n\nYou attempted to CERTIFY the facility despite ${criticalCount} documented critical findings.\n\nCritical findings prevent certification:\n`;
                engine._state.findings.filter(f => f.severity === 'critical').forEach(f => {
                    output += `  [CRITICAL] ${f.id} -- ${f.area}: ${f.issue}\n`;
                });
                output += `\nA certifying auditor who issues a PASS with unresolved critical findings\nis in violation of audit standards and potentially liable for negligence.\n\nCorrect decision: FAIL -- require remediation before re-audit.\n\nResult recorded: FACILITY FAILED -- Re-audit required after remediation.\n`;

                if (!engine._flag4Awarded) {
                    engine._flag4Awarded = true;
                    engine.awardFlag('flag4');
                    output += '\n[CAPSTONE MILESTONE] Certification decision made based on documented evidence. Flag unlocked.\n(Note: the correct decision was fail-facility -- critical findings cannot be waived.)';
                }

                return output;
            }

            // Certifying with no critical findings is correct
            engine._state.certificationDecision = 'pass';

            let output = `CERTIFICATION DECISION: PASS\n${'='.repeat(60)}\n\nHexworth Containment is CERTIFIED for BSL-4 operations.\n\nAudit domains inspected: ${domainsInspected}/5\nCritical findings: ${criticalCount}\nHigh findings:     ${engine._state.findings.filter(f => f.severity === 'high').length}\nMedium findings:   ${engine._state.findings.filter(f => f.severity === 'medium').length}\nLow findings:      ${engine._state.findings.filter(f => f.severity === 'low').length}\n\nCERTIFICATION CONDITIONS:\n  High and medium findings must be remediated per schedule.\n  Follow-up review: 90 days.\n  Re-audit: 12 months.\n\nCertificate issued: HEXWORTH-CERT-2026-001\nValid through: 2027-04-09\nIssued by: External Auditor (you)\nIssued to: Hexworth Containment Facility\n`;

            if (!engine._flag4Awarded) {
                engine._flag4Awarded = true;
                engine.awardFlag('flag4');
                output += '\n[CAPSTONE MILESTONE] Facility certified based on complete audit evidence. Flag unlocked.';
            }

            return output;
        },

        // fail-facility -- issue failing audit result
        'fail-facility': function(args, term, engine) {
            const domainsInspected = Object.keys(engine._state.auditsDone).length;
            if (domainsInspected < 5) {
                return `Cannot issue final decision: only ${domainsInspected}/5 audit domains have been inspected.\nRun all 5 audit commands first.`;
            }

            if (engine._state.certificationDecision) {
                return `Certification decision already filed: ${engine._state.certificationDecision.toUpperCase()}`;
            }

            const criticalCount = engine._state.findings.filter(f => f.severity === 'critical').length;

            engine._state.certificationDecision = 'fail';

            let output = `CERTIFICATION DECISION: FAIL\n${'='.repeat(60)}\n\nHexworth Containment FAILS BSL-4 security audit.\n\nAudit domains inspected: ${domainsInspected}/5\nCritical findings: ${criticalCount}\nHigh findings:     ${engine._state.findings.filter(f => f.severity === 'high').length}\nMedium findings:   ${engine._state.findings.filter(f => f.severity === 'medium').length}\n\nFINDINGS REQUIRING IMMEDIATE REMEDIATION:\n`;

            const criticals = engine._state.findings.filter(f => f.severity === 'critical');
            if (criticals.length > 0) {
                criticals.forEach(f => {
                    output += `  [CRITICAL] ${f.id} -- ${f.area.toUpperCase()}: ${f.issue}\n`;
                });
            } else {
                output += `  No critical findings documented.\n  Note: Failing without critical findings requires written justification.\n`;
            }

            output += `\nFACILITY STATUS: BSL-4 operations SUSPENDED pending remediation\nRe-audit eligibility: After all critical findings are closed\nRemediation deadline: 30 days (or BSL-4 operations remain suspended)\n\nFailing the facility is the correct call when critical findings exist.\n`;

            if (!engine._flag4Awarded) {
                engine._flag4Awarded = true;
                engine.awardFlag('flag4');
                output += '\n[CAPSTONE MILESTONE] Certification decision based on documented evidence. Flag unlocked.\n' + (criticalCount >= 3 ? '(Correct call: failing a facility with critical unresolved findings is the right decision.)' : '(Note: failing without critical findings would need justification -- verify your finding list.)');
            }

            return output;
        },

        // help -- command reference
        'help': function(args, term, engine) {
            return 'SECURITY AUDIT TERMINAL -- COMMAND REFERENCE\n\n  audit-network              Inspect network architecture and segmentation\n  audit-access               Inspect authentication and access controls\n  audit-crypto               Inspect cryptography and certificates\n  audit-ir                   Inspect incident response readiness\n  audit-policy               Inspect security policy compliance\n  finding <area> <issue>     Document a finding (area: network/access/crypto/ir/policy)\n  findings                   Review all documented findings\n  certify                    Issue passing certification\n  fail-facility              Issue failing audit result\n  cat <file>                 Read a file\n  ls <path>                  List directory\n\nAudit workflow:\n  1. Run all 5 audit-* commands\n  2. Document findings with: finding <area> <issue>\n  3. Review: findings\n  4. Decide: certify or fail-facility\n\nSee ~/notes.txt for certification criteria.';
        }
    },

    // =========================================================
    // FLAGS
    // =========================================================

    flags: [
        {
            id: 'flag1',
            value: 'FLAG{pis-l12-full-facility-inspection_flag1_network_architecture}',
            label: 'Network Architecture Audit Complete',
            description: 'Completed all 5 audit domain inspections and began documenting findings.',
            points: 250,
            autoCheck: true
        },
        {
            id: 'flag2',
            value: 'FLAG{pis-l12-full-facility-inspection_flag2_access_control_and_c}',
            label: 'Access Control and Crypto Audits Complete',
            description: 'Documented all 3 critical findings across network, access, and crypto domains.',
            points: 250,
            autoCheck: true
        },
        {
            id: 'flag3',
            value: 'FLAG{pis-l12-full-facility-inspection_flag3_all_audit_domains_in}',
            label: 'All Audit Domains Inspected',
            description: 'Completed all 5 audit domains with comprehensive findings documented.',
            points: 250,
            autoCheck: true
        },
        {
            id: 'flag4',
            value: 'FLAG{pis-l12-full-facility-inspection_flag4_certification_decisi}',
            label: 'Certification Decision Made',
            description: 'Issued a documented certification decision (pass or fail) based on audit evidence.',
            points: 250,
            autoCheck: true
        }
    ],

    // =========================================================
    // SCORING
    // =========================================================

    scoring: {
        base: 1000,
        maxScore: 1000,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 },
        timeBonusThreshold: 2700
    },

    // =========================================================
    // HINTS
    // =========================================================

    hints: [
        {
            id: 'hint1',
            text: 'Run all 5 audit commands first: audit-network, audit-access, audit-crypto, audit-ir, audit-policy. Read each output carefully. Each audit tells you what it found. The critical findings are clearly marked as "[CRITICAL FINDING]" in the output. Document them with: finding <area> <described-issue>.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint2',
            text: 'There are 3 critical findings: one in network (maintenance window bypass), one in access (service account with no MFA), one in crypto (expired certificate on lab3-srv-01). Each audit output tells you the finding ID and suggests the "finding" command syntax to document it.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'After running all 5 audits and documenting the critical findings, run "findings" to see your summary. With 3 critical findings, the correct decision is "fail-facility" -- you cannot certify a facility with unresolved critical findings. Run fail-facility to complete the capstone.',
            cost: 50,
            penalty: -50
        }
    ],

    // =========================================================
    // CERT OBJECTIVES
    // =========================================================

    certObjectives: {
        certPath: 'CompTIA Security+ SY0-701',
        mappings: [
            { flagId: 'flag1', objective: '3.2', description: 'Apply infrastructure security best practices', skill: 'Network architecture audit: VLAN segmentation review, firewall rule analysis, change management controls' },
            { flagId: 'flag2', objective: '5.4', description: 'Summarize elements of effective security governance', skill: 'Access control and cryptographic audit: MFA coverage gaps, expired certificates, privilege review' },
            { flagId: 'flag3', objective: '4.3', description: 'Explain the processes associated with third-party risk assessment and management', skill: 'IR readiness assessment: backup verification, forensic capabilities, detection metrics, policy currency' },
            { flagId: 'flag4', objective: '5.2', description: 'Explain elements of the risk management process', skill: 'Audit decision-making: evidence-based certification decisions, risk acceptance, and compliance reporting' }
        ]
    }

};
