/* ============================================================
   gui-ne10-change-mgmt.config.js
   NE-10: Network Operations — Change Management & Documentation
   Hexworth Prime — Network+ Course
   2026-03-30

   SCENARIO: Network engineer at Whitfield Medical Group. A
   change request has been submitted to add a site-to-site VPN
   tunnel to a new partner clinic. Walk through the full 7-step
   change management process: request, review, approve, plan,
   implement, verify, document.
   ============================================================ */

const GUI_NE10_CHANGE_MGMT_CONFIG = {

    id: 'gui-ne10-change-mgmt',
    title: 'NE-10 Lab: Change Management & Documentation',
    subtitle: 'Execute a complete change management workflow for a firewall/VPN configuration change',
    duration: 2400, // 40 minutes
    sequentialTasks: true,

    certObjectives: [
        'N10-009 3.1: Given a scenario, use the appropriate statistics and sensors to ensure network availability',
        'N10-009 3.2: Explain the purpose of organizational documents and policies',
        'N10-009 3.3: Explain high availability and disaster recovery concepts and summarize which is the best solution'
    ],

    scoring: {
        taskPoints: 50,
        timeBonus: 100,
        maxScore: 600
    },

    /* -- Known Domains (for nslookup/ping resolution) -------- */
    knownDomains: {
        'fw1.whitfield.local':      '10.20.0.1',
        'core-sw.whitfield.local':  '10.20.1.1',
        'dc1.whitfield.local':      '10.20.2.10',
        'vpn.whitfield.local':      '10.20.0.1',
        'partner-gw.clinic.local':  '203.0.113.50',
        'remote-lan.clinic.local':  '172.16.50.0'
    },

    /* -- Desktop Icons --------------------------------------- */
    desktop: [
        {
            id: 'change-request',
            label: 'Change\nRequest',
            icon: 'browser',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'Change Request Form — CR-2026-0147',
                sections: [
                    /* -- Change Request Details --------------- */
                    {
                        id: 'cr-details',
                        label: 'Request Details',
                        group: 'Request',
                        saveable: false,
                        fields: [
                            {
                                type: 'info',
                                label: 'Change Request ID',
                                statePath: 'webMgmt.cr.id',
                                default: 'CR-2026-0147'
                            },
                            {
                                type: 'info',
                                label: 'Requestor',
                                statePath: 'webMgmt.cr.requestor',
                                default: 'Dr. Sarah Chen, CIO — Whitfield Medical Group'
                            },
                            {
                                type: 'info',
                                label: 'Date Submitted',
                                statePath: 'webMgmt.cr.dateSubmitted',
                                default: '2026-03-28 09:15:00 UTC'
                            },
                            {
                                type: 'info',
                                label: 'Business Justification',
                                statePath: 'webMgmt.cr.justification',
                                default: 'Whitfield Medical Group has partnered with Parkside Family Clinic to share patient records via HL7 FHIR API. HIPAA requires encrypted transit. A site-to-site IPSec VPN tunnel must be established between our firewall (fw1.whitfield.local / 198.51.100.10) and the partner gateway (203.0.113.50). The partner LAN subnet is 172.16.50.0/24. Traffic must be restricted to HTTPS (443) and HL7 (2575) only.'
                            }
                        ]
                    },
                    /* -- Step 1: Fill Change Request Form ------ */
                    {
                        id: 'cr-form',
                        label: 'Complete Request',
                        group: 'Request',
                        fields: [
                            {
                                type: 'select',
                                label: 'Change Type',
                                statePath: 'webMgmt.cr.changeType',
                                options: [
                                    { value: '',            label: '-- Select --' },
                                    { value: 'standard',    label: 'Standard (pre-approved, low risk)' },
                                    { value: 'normal',      label: 'Normal (requires CAB review)' },
                                    { value: 'emergency',   label: 'Emergency (immediate, post-review)' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Risk Assessment',
                                statePath: 'webMgmt.cr.riskLevel',
                                options: [
                                    { value: '',       label: '-- Select --' },
                                    { value: 'low',    label: 'Low — minimal impact, easily reversible' },
                                    { value: 'medium', label: 'Medium — moderate impact, rollback planned' },
                                    { value: 'high',   label: 'High — significant impact, extended outage possible' }
                                ]
                            },
                            {
                                type: 'text',
                                label: 'Affected Systems (list all)',
                                statePath: 'webMgmt.cr.affectedSystems',
                                placeholder: 'e.g., fw1.whitfield.local, core-sw, ...'
                            },
                            {
                                type: 'select',
                                label: 'Maintenance Window',
                                statePath: 'webMgmt.cr.maintenanceWindow',
                                options: [
                                    { value: '',            label: '-- Select --' },
                                    { value: 'business',    label: 'During business hours (8am-5pm)' },
                                    { value: 'evening',     label: 'Evening window (6pm-10pm)' },
                                    { value: 'overnight',   label: 'Overnight window (12am-4am Saturday)' },
                                    { value: 'immediate',   label: 'Immediately (emergency only)' }
                                ]
                            },
                            {
                                type: 'text',
                                label: 'Rollback Plan',
                                statePath: 'webMgmt.cr.rollbackPlan',
                                placeholder: 'Describe how to reverse this change'
                            },
                            {
                                type: 'text',
                                label: 'Estimated Downtime',
                                statePath: 'webMgmt.cr.downtime',
                                placeholder: 'e.g., 15 minutes, 0 (no downtime)'
                            }
                        ],
                        onSave(state) {
                            var cr = state.webMgmt.cr;
                            var correct = 0;

                            if (cr.changeType === 'normal') correct++;
                            if (cr.riskLevel === 'medium') correct++;
                            if (cr.affectedSystems && cr.affectedSystems.toLowerCase().includes('fw1')) correct++;
                            if (cr.maintenanceWindow === 'overnight') correct++;
                            if (cr.rollbackPlan && cr.rollbackPlan.length > 10) correct++;
                            if (cr.downtime && cr.downtime.length > 0) correct++;

                            cr.formScore = correct;
                            cr.formComplete = correct >= 5;
                        }
                    }
                ]
            }
        },
        {
            id: 'config-manager',
            label: 'Config\nManager',
            icon: 'browser',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'Configuration Manager — fw1.whitfield.local',
                sections: [
                    /* -- Running Config ----------------------- */
                    {
                        id: 'cfg-running',
                        label: 'Running Config',
                        group: 'Configuration',
                        saveable: false,
                        fields: [
                            {
                                type: 'info',
                                label: 'Device',
                                statePath: 'webMgmt.config.device',
                                default: 'fw1.whitfield.local (Cisco ASA 5525-X) — 198.51.100.10'
                            },
                            {
                                type: 'info',
                                label: 'Running Configuration (current)',
                                statePath: 'webMgmt.config.running',
                                default: '! Cisco ASA 5525-X — fw1.whitfield.local\n! Last modified: 2026-03-15 by admin\n!\nhostname fw1\ndomain-name whitfield.local\n!\ninterface GigabitEthernet0/0\n nameif outside\n security-level 0\n ip address 198.51.100.10 255.255.255.0\n!\ninterface GigabitEthernet0/1\n nameif inside\n security-level 100\n ip address 10.20.0.1 255.255.0.0\n!\naccess-list OUTSIDE_IN extended permit tcp any host 198.51.100.10 eq 443\naccess-list OUTSIDE_IN extended deny ip any any log\n!\nroute outside 0.0.0.0 0.0.0.0 198.51.100.1\nroute inside 10.20.0.0 255.255.0.0 10.20.0.1\n!\ncrypto ikev2 policy 10\n encryption aes-256\n integrity sha256\n group 14\n prf sha256\n lifetime 86400\n!\n! --- NO VPN TUNNEL CONFIGURED ---\n!\nlogging enable\nlogging host inside 10.20.2.20 514\nlogging trap informational\n!\nntp server 10.20.2.10\n!\nend'
                            }
                        ]
                    },
                    /* -- Golden/Baseline Config --------------- */
                    {
                        id: 'cfg-golden',
                        label: 'Golden Config (Baseline)',
                        group: 'Configuration',
                        saveable: false,
                        fields: [
                            {
                                type: 'info',
                                label: 'Baseline Date',
                                statePath: 'webMgmt.config.goldenDate',
                                default: 'Baseline captured: 2026-03-15 — Approved by CAB meeting #42'
                            },
                            {
                                type: 'info',
                                label: 'Golden Configuration',
                                statePath: 'webMgmt.config.golden',
                                default: '! Cisco ASA 5525-X — fw1.whitfield.local\n! Baseline config — CAB #42 approved 2026-03-15\n!\nhostname fw1\ndomain-name whitfield.local\n!\ninterface GigabitEthernet0/0\n nameif outside\n security-level 0\n ip address 198.51.100.10 255.255.255.0\n!\ninterface GigabitEthernet0/1\n nameif inside\n security-level 100\n ip address 10.20.0.1 255.255.0.0\n!\naccess-list OUTSIDE_IN extended permit tcp any host 198.51.100.10 eq 443\naccess-list OUTSIDE_IN extended deny ip any any log\n!\nroute outside 0.0.0.0 0.0.0.0 198.51.100.1\nroute inside 10.20.0.0 255.255.0.0 10.20.0.1\n!\ncrypto ikev2 policy 10\n encryption aes-256\n integrity sha256\n group 14\n prf sha256\n lifetime 86400\n!\nlogging enable\nlogging host inside 10.20.2.20 514\nlogging trap informational\n!\nntp server 10.20.2.10\n!\nend'
                            },
                            {
                                type: 'info',
                                label: 'Diff: Running vs Golden',
                                statePath: 'webMgmt.config.diff',
                                default: 'NO DIFFERENCES — Running config matches golden baseline. No unauthorized changes detected.'
                            }
                        ]
                    },
                    /* -- Backup Config ----------------------- */
                    {
                        id: 'cfg-backup',
                        label: 'Backup Current Config',
                        group: 'Operations',
                        fields: [
                            {
                                type: 'select',
                                label: 'Backup Destination',
                                statePath: 'webMgmt.config.backupDest',
                                options: [
                                    { value: '',        label: '-- Select Destination --' },
                                    { value: 'tftp',    label: 'TFTP Server (10.20.2.20)' },
                                    { value: 'local',   label: 'Local Flash (disk0:)' },
                                    { value: 'both',    label: 'Both TFTP and Local Flash' }
                                ]
                            },
                            {
                                type: 'text',
                                label: 'Backup Filename',
                                statePath: 'webMgmt.config.backupFilename',
                                placeholder: 'e.g., fw1-backup-2026-03-30.cfg'
                            },
                            {
                                type: 'info',
                                label: 'Backup Status',
                                statePath: 'webMgmt.config.backupStatus',
                                default: 'No backup taken yet. A backup MUST be taken before any changes.'
                            }
                        ],
                        onSave(state) {
                            var cfg = state.webMgmt.config;
                            if (cfg.backupDest && cfg.backupFilename && cfg.backupFilename.length > 5) {
                                cfg.backupStatus = 'BACKUP SUCCESSFUL: ' + cfg.backupFilename + ' saved to ' +
                                    (cfg.backupDest === 'both' ? 'TFTP (10.20.2.20) + disk0:/' :
                                     cfg.backupDest === 'tftp' ? 'TFTP (10.20.2.20)' : 'disk0:/') +
                                    ' at 2026-03-30 00:15:33 UTC | Size: 2,847 bytes | MD5: a3f7c9e2...';
                                cfg.backupComplete = true;
                            } else {
                                cfg.backupStatus = 'ERROR: Please select a destination and provide a filename.';
                            }
                        }
                    },
                    /* -- Apply VPN Change --------------------- */
                    {
                        id: 'cfg-apply',
                        label: 'Apply VPN Configuration',
                        group: 'Operations',
                        fields: [
                            {
                                type: 'info',
                                label: 'Proposed Changes (diff)',
                                statePath: 'webMgmt.config.proposedDiff',
                                default: '+ crypto ikev2 enable outside\n+ crypto ikev2 remote-access trustpoint ASDM_TrustPoint0\n+\n+ tunnel-group 203.0.113.50 type ipsec-l2l\n+ tunnel-group 203.0.113.50 ipsec-attributes\n+  ikev2 remote-authentication pre-shared-key *****\n+  ikev2 local-authentication pre-shared-key *****\n+\n+ crypto ipsec ikev2 ipsec-proposal AES256-SHA256\n+  protocol esp encryption aes-256\n+  protocol esp integrity sha-256\n+\n+ crypto map OUTSIDE_MAP 10 match address VPN_PARTNER\n+ crypto map OUTSIDE_MAP 10 set peer 203.0.113.50\n+ crypto map OUTSIDE_MAP 10 set ikev2 ipsec-proposal AES256-SHA256\n+ crypto map OUTSIDE_MAP interface outside\n+\n+ access-list VPN_PARTNER extended permit tcp 10.20.0.0 255.255.0.0 172.16.50.0 255.255.255.0 eq 443\n+ access-list VPN_PARTNER extended permit tcp 10.20.0.0 255.255.0.0 172.16.50.0 255.255.255.0 eq 2575\n+ access-list VPN_PARTNER extended deny ip any any log\n+\n+ route outside 172.16.50.0 255.255.255.0 203.0.113.50'
                            },
                            {
                                type: 'select',
                                label: 'Pre-flight check: Is backup complete?',
                                statePath: 'webMgmt.config.preflightBackup',
                                options: [
                                    { value: '',    label: '-- Confirm --' },
                                    { value: 'yes', label: 'Yes — backup verified' },
                                    { value: 'no',  label: 'No — backup not taken yet' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Pre-flight check: Is approval received?',
                                statePath: 'webMgmt.config.preflightApproval',
                                options: [
                                    { value: '',    label: '-- Confirm --' },
                                    { value: 'yes', label: 'Yes — CAB approved CR-2026-0147' },
                                    { value: 'no',  label: 'No — still pending approval' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Pre-flight check: Are we in the maintenance window?',
                                statePath: 'webMgmt.config.preflightWindow',
                                options: [
                                    { value: '',    label: '-- Confirm --' },
                                    { value: 'yes', label: 'Yes — current time is within the approved window' },
                                    { value: 'no',  label: 'No — outside maintenance window' }
                                ]
                            },
                            {
                                type: 'info',
                                label: 'Apply Status',
                                statePath: 'webMgmt.config.applyStatus',
                                default: 'Complete all pre-flight checks and click Apply to push the configuration.'
                            }
                        ],
                        onSave(state) {
                            var cfg = state.webMgmt.config;

                            if (cfg.preflightBackup === 'yes' && cfg.preflightApproval === 'yes' && cfg.preflightWindow === 'yes') {
                                if (cfg.backupComplete) {
                                    cfg.applyStatus = 'CONFIGURATION APPLIED SUCCESSFULLY at 2026-03-30 00:30:15 UTC\n\nChanges pushed to fw1.whitfield.local:\n- IKEv2 enabled on outside interface\n- IPSec tunnel to 203.0.113.50 configured\n- VPN_PARTNER ACL created (HTTPS + HL7 only)\n- Static route to 172.16.50.0/24 added\n- Crypto map applied to outside interface\n\nWaiting for IKEv2 SA negotiation with peer...';
                                    cfg.changeApplied = true;
                                } else {
                                    cfg.applyStatus = 'ERROR: Pre-flight check failed. Backup has not been taken. Please backup the running config before applying changes.';
                                }
                            } else {
                                cfg.applyStatus = 'ERROR: All three pre-flight checks must be confirmed YES before applying changes. This is a safety requirement per the change management policy.';
                            }
                        }
                    }
                ]
            }
        },
        {
            id: 'network-diagram',
            label: 'Network\nDiagram',
            icon: 'browser',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'Network Diagram — Whitfield Medical Group',
                sections: [
                    /* -- Before diagram ----------------------- */
                    {
                        id: 'diag-before',
                        label: 'Current Topology (Before)',
                        group: 'Diagrams',
                        saveable: false,
                        fields: [
                            {
                                type: 'info',
                                label: 'Before Change — No VPN Tunnel',
                                statePath: 'webMgmt.diagram.before',
                                default: '                          [INTERNET]\n                              |\n                     [ISP: 198.51.100.1]\n                              |\n                  [FW1: 198.51.100.10]  <-- outside interface\n                    |  (Cisco ASA 5525-X)\n                    |  inside: 10.20.0.1\n                    |\n               [Core-SW: 10.20.1.1]\n              /          |          \\\n     [VLAN 10]     [VLAN 20]     [VLAN 30]\n     10.20.10.0/24  10.20.20.0/24  10.20.30.0/24\n     (Clinical)    (Admin)       (Servers)\n                                    |\n                            [DC1: 10.20.2.10]\n                            [Syslog: 10.20.2.20]\n\n   --- NO CONNECTION TO PARTNER CLINIC ---\n   Parkside Family Clinic: 203.0.113.50 (unreachable)'
                            }
                        ]
                    },
                    /* -- After diagram ------------------------ */
                    {
                        id: 'diag-after',
                        label: 'Proposed Topology (After)',
                        group: 'Diagrams',
                        saveable: false,
                        fields: [
                            {
                                type: 'info',
                                label: 'After Change — IPSec VPN Tunnel Active',
                                statePath: 'webMgmt.diagram.after',
                                default: '                          [INTERNET]\n                              |\n                     [ISP: 198.51.100.1]\n                              |\n                  [FW1: 198.51.100.10]  <-- outside interface\n                    |  (Cisco ASA 5525-X)\n                    |  inside: 10.20.0.1\n                    |                    ===== IPSec VPN Tunnel =====\n                    |                    ||  IKEv2 / AES-256 / SHA-256  ||\n                    |                    ||  Peer: 203.0.113.50        ||\n                    |                    ||  Traffic: HTTPS + HL7 only ||\n                    |                    ================================\n                    |                                                   |\n               [Core-SW: 10.20.1.1]                    [Partner GW: 203.0.113.50]\n              /          |          \\                           |\n     [VLAN 10]     [VLAN 20]     [VLAN 30]            [Partner LAN: 172.16.50.0/24]\n     10.20.10.0/24  10.20.20.0/24  10.20.30.0/24      Parkside Family Clinic\n     (Clinical)    (Admin)       (Servers)            (HL7 FHIR + HTTPS access)\n                                    |\n                            [DC1: 10.20.2.10]\n                            [Syslog: 10.20.2.20]'
                            },
                            {
                                type: 'info',
                                label: 'Change Summary',
                                statePath: 'webMgmt.diagram.changeSummary',
                                default: 'NEW: Site-to-site IPSec VPN tunnel from FW1 (198.51.100.10) to Partner GW (203.0.113.50)\nENCRYPTION: IKEv2 with AES-256-CBC + SHA-256 + DH Group 14\nTRAFFIC: Restricted to TCP/443 (HTTPS) and TCP/2575 (HL7) only\nROUTING: Static route for 172.16.50.0/24 via tunnel\nCOMPLIANCE: HIPAA requires encryption for PHI in transit'
                            }
                        ]
                    }
                ]
            }
        },
        {
            id: 'approval-console',
            label: 'Approval\nConsole',
            icon: 'browser',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'CAB Approval Console — Change Advisory Board',
                sections: [
                    /* -- Submit for Approval ------------------- */
                    {
                        id: 'cab-submit',
                        label: 'Submit for Review',
                        group: 'Approval',
                        fields: [
                            {
                                type: 'info',
                                label: 'CAB Members',
                                statePath: 'webMgmt.approval.cabMembers',
                                default: 'Chair: Mike Torres (IT Director) | Security: Lisa Park (CISO) | Clinical: Dr. James Wright (CMO) | Infrastructure: You (Network Engineer)'
                            },
                            {
                                type: 'select',
                                label: 'Does this change have a documented rollback plan?',
                                statePath: 'webMgmt.approval.hasRollback',
                                options: [
                                    { value: '',    label: '-- Select --' },
                                    { value: 'yes', label: 'Yes' },
                                    { value: 'no',  label: 'No' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Has a risk assessment been completed?',
                                statePath: 'webMgmt.approval.hasRiskAssessment',
                                options: [
                                    { value: '',    label: '-- Select --' },
                                    { value: 'yes', label: 'Yes' },
                                    { value: 'no',  label: 'No' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Is the maintenance window scheduled?',
                                statePath: 'webMgmt.approval.hasWindow',
                                options: [
                                    { value: '',    label: '-- Select --' },
                                    { value: 'yes', label: 'Yes' },
                                    { value: 'no',  label: 'No' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Will this change require HIPAA compliance review?',
                                statePath: 'webMgmt.approval.hipaaReview',
                                options: [
                                    { value: '',    label: '-- Select --' },
                                    { value: 'yes', label: 'Yes — change involves PHI data pathways' },
                                    { value: 'no',  label: 'No — no PHI impact' }
                                ]
                            },
                            {
                                type: 'info',
                                label: 'Approval Status',
                                statePath: 'webMgmt.approval.status',
                                default: 'Pending submission. Complete all fields and click Apply to submit for CAB review.'
                            }
                        ],
                        onSave(state) {
                            var appr = state.webMgmt.approval;

                            if (appr.hasRollback === 'yes' && appr.hasRiskAssessment === 'yes' &&
                                appr.hasWindow === 'yes' && appr.hipaaReview === 'yes') {
                                appr.status = 'APPROVED by CAB at 2026-03-29 14:00:00 UTC\n\nVotes:\n- Mike Torres (IT Director): APPROVE — "Standard VPN setup, well-documented."\n- Lisa Park (CISO): APPROVE — "IKEv2/AES-256 meets HIPAA encryption requirements. ACL restricts to necessary ports only."\n- Dr. James Wright (CMO): APPROVE — "Clinical staff needs access to Parkside records. Approved."\n\nScheduled Window: Saturday 2026-03-30 00:00-04:00 UTC\nCondition: Must verify tunnel functionality before end of window. If verification fails, execute rollback.';
                                appr.approved = true;
                            } else {
                                appr.status = 'SUBMISSION INCOMPLETE: All checklist items must be confirmed YES. The CAB requires documentation of rollback plan, risk assessment, maintenance window, and HIPAA impact before review.';
                            }
                        }
                    },
                    /* -- Approval History ---------------------- */
                    {
                        id: 'cab-history',
                        label: 'Recent Changes',
                        group: 'History',
                        saveable: false,
                        fields: [
                            {
                                type: 'table',
                                label: 'Change History (Last 5)',
                                statePath: 'webMgmt.approval.history',
                                columns: [
                                    { key: 'crId',      label: 'CR ID' },
                                    { key: 'date',      label: 'Date' },
                                    { key: 'desc',      label: 'Description' },
                                    { key: 'status',    label: 'Status' },
                                    { key: 'risk',      label: 'Risk' }
                                ]
                            }
                        ]
                    }
                ]
            }
        },
        {
            id: 'verify-tools',
            label: 'Verification\nTools',
            icon: 'browser',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'Verification Tools — Post-Change Validation',
                sections: [
                    /* -- VPN Tunnel Status --------------------- */
                    {
                        id: 'verify-tunnel',
                        label: 'VPN Tunnel Status',
                        group: 'Verification',
                        fields: [
                            {
                                type: 'select',
                                label: 'Check VPN Tunnel',
                                statePath: 'webMgmt.verify.tunnelCheck',
                                options: [
                                    { value: '',        label: '-- Select Command --' },
                                    { value: 'ikev2',   label: 'show crypto ikev2 sa' },
                                    { value: 'ipsec',   label: 'show crypto ipsec sa' },
                                    { value: 'isakmp',  label: 'show crypto isakmp sa' }
                                ]
                            },
                            {
                                type: 'info',
                                label: 'Command Output',
                                statePath: 'webMgmt.verify.tunnelOutput',
                                default: 'Select a command and click Apply'
                            }
                        ],
                        onSave(state) {
                            var v = state.webMgmt.verify;

                            if (!state.webMgmt.config.changeApplied) {
                                v.tunnelOutput = 'ERROR: No VPN configuration found. The change has not been applied yet.';
                                return;
                            }

                            if (v.tunnelCheck === 'ikev2') {
                                v.tunnelOutput = 'IKEv2 SAs:\n\nSession-id:1, Status:UP-ACTIVE, IKE count:1, CHILD count:1\n\nTunnel-id  Local                  Remote                 Status       Role\n1          198.51.100.10/500       203.0.113.50/500       READY        INITIATOR\n\n      Encr: AES-CBC-256, Hash: SHA256, DH Grp:14, Auth sign: PSK, Auth verify: PSK\n      Life/Active Time: 86400/342 sec\n\nChild sa: local selector  10.20.0.0/16\n          remote selector 172.16.50.0/24\n          ESP: AES-256/SHA-256, SPI: 0xA3F7C9E2';
                                v.ikev2Checked = true;
                            } else if (v.tunnelCheck === 'ipsec') {
                                v.tunnelOutput = 'interface: outside\n    Crypto map tag: OUTSIDE_MAP, seq num: 10, local addr: 198.51.100.10\n\n      access-list VPN_PARTNER extended permit tcp 10.20.0.0 255.255.0.0 172.16.50.0 255.255.255.0 eq 443\n      access-list VPN_PARTNER extended permit tcp 10.20.0.0 255.255.0.0 172.16.50.0 255.255.255.0 eq 2575\n\n      local ident: 10.20.0.0/255.255.0.0\n      remote ident: 172.16.50.0/255.255.255.0\n\n      #pkts encaps: 47, #pkts encrypt: 47, #pkts digest: 47\n      #pkts decaps: 52, #pkts decrypt: 52, #pkts verify: 52\n      #pkts compressed: 0, #pkts decompressed: 0\n      #send errors 0, #recv errors 0\n\n      inbound esp sas:\n       spi: 0xB2E4D1A0 (2999853472)\n        transform: esp-aes-256 esp-sha-256-hmac\n\n      outbound esp sas:\n       spi: 0xA3F7C9E2 (2751383010)\n        transform: esp-aes-256 esp-sha-256-hmac';
                                v.ipsecChecked = true;
                            } else if (v.tunnelCheck === 'isakmp') {
                                v.tunnelOutput = 'There are no IKEv1 SAs (ISAKMP is IKEv1).\nThis tunnel uses IKEv2. Use "show crypto ikev2 sa" instead.\n\nNote: IKEv2 (RFC 7296) replaces IKEv1/ISAKMP with improved security and fewer round trips.';
                            }
                        }
                    },
                    /* -- Connectivity Test -------------------- */
                    {
                        id: 'verify-connectivity',
                        label: 'Connectivity Test',
                        group: 'Verification',
                        fields: [
                            {
                                type: 'select',
                                label: 'Test Target',
                                statePath: 'webMgmt.verify.testTarget',
                                options: [
                                    { value: '',            label: '-- Select Target --' },
                                    { value: 'ping-gw',     label: 'Ping partner gateway (203.0.113.50)' },
                                    { value: 'ping-lan',    label: 'Ping partner LAN host (172.16.50.10)' },
                                    { value: 'trace',       label: 'Traceroute to 172.16.50.10' },
                                    { value: 'curl-443',    label: 'Test HTTPS to 172.16.50.10:443' },
                                    { value: 'curl-2575',   label: 'Test HL7 to 172.16.50.10:2575' },
                                    { value: 'curl-80',     label: 'Test HTTP to 172.16.50.10:80 (should fail)' }
                                ]
                            },
                            {
                                type: 'info',
                                label: 'Test Result',
                                statePath: 'webMgmt.verify.testResult',
                                default: 'Select a test and click Apply'
                            }
                        ],
                        onSave(state) {
                            var v = state.webMgmt.verify;

                            if (!state.webMgmt.config.changeApplied) {
                                v.testResult = 'ERROR: VPN tunnel not configured. Apply the change first.';
                                return;
                            }

                            var results = {
                                'ping-gw': 'PING 203.0.113.50 (203.0.113.50): 56 data bytes\n64 bytes from 203.0.113.50: icmp_seq=1 ttl=254 time=12.3 ms\n64 bytes from 203.0.113.50: icmp_seq=2 ttl=254 time=11.8 ms\n64 bytes from 203.0.113.50: icmp_seq=3 ttl=254 time=12.1 ms\n\n--- 203.0.113.50 ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss\nround-trip min/avg/max = 11.8/12.1/12.3 ms\n\nResult: Partner gateway REACHABLE via public internet.',
                                'ping-lan': 'PING 172.16.50.10 (172.16.50.10): 56 data bytes\n64 bytes from 172.16.50.10: icmp_seq=1 ttl=253 time=14.7 ms\n64 bytes from 172.16.50.10: icmp_seq=2 ttl=253 time=13.9 ms\n64 bytes from 172.16.50.10: icmp_seq=3 ttl=253 time=14.2 ms\n\n--- 172.16.50.10 ping statistics ---\n3 packets transmitted, 3 received, 0% packet loss\nround-trip min/avg/max = 13.9/14.3/14.7 ms\n\nResult: Partner LAN host REACHABLE through VPN tunnel. Traffic encrypted via ESP.',
                                'trace': 'traceroute to 172.16.50.10, 30 hops max\n 1  10.20.0.1 (fw1.whitfield.local)   1.2 ms\n 2  * * * (encrypted tunnel — no ICMP from transit)\n 3  172.16.50.1 (partner-gw)           13.1 ms\n 4  172.16.50.10                       14.5 ms\n\nResult: Traffic traverses VPN tunnel. Hop 2 shows * because tunnel encrypts transit.',
                                'curl-443': 'Connecting to 172.16.50.10:443...\nTLS handshake successful (TLS 1.2)\nHTTP/1.1 200 OK\nServer: nginx/1.24\nContent-Type: application/json\nX-FHIR-Version: 4.0.1\n\n{"resourceType":"CapabilityStatement","status":"active"}\n\nResult: HTTPS (443) CONNECTED SUCCESSFULLY through VPN tunnel. FHIR API endpoint responding.',
                                'curl-2575': 'Connecting to 172.16.50.10:2575...\nConnected.\nMSH|^~\\&|WHITFIELD|WMG|PARKSIDE|PFC|20260330003200||ADT^A01|MSG00001|P|2.5\nMSA|AA|MSG00001\n\nResult: HL7 port 2575 CONNECTED SUCCESSFULLY through VPN tunnel. HL7v2.5 handshake confirmed.',
                                'curl-80': 'Connecting to 172.16.50.10:80...\nconnection timed out after 10 seconds\n\nResult: HTTP (80) BLOCKED as expected. The VPN ACL (VPN_PARTNER) only permits TCP 443 and TCP 2575. This is correct — only authorized ports should traverse the tunnel.'
                            };

                            if (v.testTarget && results[v.testTarget]) {
                                v.testResult = results[v.testTarget];

                                if (v.testTarget === 'ping-lan') v.pingVerified = true;
                                if (v.testTarget === 'curl-443') v.httpsVerified = true;
                                if (v.testTarget === 'curl-2575') v.hl7Verified = true;
                                if (v.testTarget === 'curl-80') v.httpBlockVerified = true;
                            }
                        }
                    },
                    /* -- Final Verification Checklist ---------- */
                    {
                        id: 'verify-checklist',
                        label: 'Verification Checklist',
                        group: 'Documentation',
                        fields: [
                            {
                                type: 'select',
                                label: 'Is the IKEv2 SA status UP-ACTIVE?',
                                statePath: 'webMgmt.verify.checkIkev2',
                                options: [
                                    { value: '',    label: '-- Select --' },
                                    { value: 'yes', label: 'Yes — tunnel is UP' },
                                    { value: 'no',  label: 'No — tunnel is DOWN' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Can you reach the partner LAN (172.16.50.0/24)?',
                                statePath: 'webMgmt.verify.checkReachable',
                                options: [
                                    { value: '',    label: '-- Select --' },
                                    { value: 'yes', label: 'Yes — ping and application tests succeed' },
                                    { value: 'no',  label: 'No — partner LAN unreachable' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Is unauthorized traffic (HTTP/80) properly blocked?',
                                statePath: 'webMgmt.verify.checkBlocked',
                                options: [
                                    { value: '',    label: '-- Select --' },
                                    { value: 'yes', label: 'Yes — port 80 times out as expected' },
                                    { value: 'no',  label: 'No — port 80 is open (ACL issue)' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'What encryption algorithm secures this tunnel?',
                                statePath: 'webMgmt.verify.checkEncryption',
                                options: [
                                    { value: '',            label: '-- Select --' },
                                    { value: 'aes128',      label: 'AES-128-CBC' },
                                    { value: 'aes256',      label: 'AES-256-CBC' },
                                    { value: '3des',        label: '3DES' },
                                    { value: 'des',         label: 'DES' }
                                ]
                            },
                            {
                                type: 'info',
                                label: 'Verification Result',
                                statePath: 'webMgmt.verify.checklistResult',
                                default: 'Complete the checklist and click Apply'
                            }
                        ],
                        onSave(state) {
                            var v = state.webMgmt.verify;
                            var correct = 0;

                            if (v.checkIkev2 === 'yes') correct++;
                            if (v.checkReachable === 'yes') correct++;
                            if (v.checkBlocked === 'yes') correct++;
                            if (v.checkEncryption === 'aes256') correct++;

                            if (correct === 4) {
                                v.checklistResult = 'VERIFICATION COMPLETE — All checks passed.\n\nThe VPN tunnel is operational, authorized traffic flows correctly, unauthorized ports are blocked, and AES-256 encryption meets HIPAA requirements.\n\nChange CR-2026-0147 is verified and can be closed as SUCCESSFUL.\n\nNew golden config baseline should be captured to reflect the approved change.';
                                v.verificationComplete = true;
                            } else {
                                v.checklistResult = 'INCOMPLETE: ' + correct + '/4 checks passed. Review your answers and verify against the test results.';
                            }
                        }
                    }
                ]
            }
        },
        {
            id: 'cmd',
            label: 'Command\nPrompt',
            icon: 'terminal',
            window: 'cmd'
        }
    ],

    /* -- Initial State --------------------------------------- */
    initialState: {
        adapters: [
            {
                name: 'Ethernet0',
                description: 'Intel(R) I219-LM Gigabit Network Adapter',
                enabled: true,
                connected: true,
                dhcp: false,
                ip: '10.20.5.100',
                mask: '255.255.0.0',
                gateway: '10.20.0.1',
                dns: ['10.20.2.10'],
                mac: '00:1A:2B:AA:BB:CC',
                speed: '1 Gbps',
                duplex: 'Full Duplex',
                driver: 'Intel Corporation',
                driverVersion: '12.19.1.37',
                irq: '11'
            }
        ],
        services: [
            { name: 'DNS Client',          status: 'running', startup: 'Automatic' },
            { name: 'Windows Firewall',    status: 'running', startup: 'Automatic' },
            { name: 'SSH Agent',           status: 'running', startup: 'Automatic' },
            { name: 'TFTP Client',         status: 'running', startup: 'Manual' },
            { name: 'Network Location',    status: 'running', startup: 'Automatic' }
        ],
        connectivity: {
            gateway: true,
            internet: true,
            dns: true
        },
        webMgmt: {
            cr: {
                id: 'CR-2026-0147',
                requestor: 'Dr. Sarah Chen, CIO -- Whitfield Medical Group',
                dateSubmitted: '2026-03-28 09:15:00 UTC',
                justification: 'Whitfield Medical Group has partnered with Parkside Family Clinic to share patient records via HL7 FHIR API. HIPAA requires encrypted transit. A site-to-site IPSec VPN tunnel must be established between our firewall (fw1.whitfield.local / 198.51.100.10) and the partner gateway (203.0.113.50). The partner LAN subnet is 172.16.50.0/24. Traffic must be restricted to HTTPS (443) and HL7 (2575) only.',
                changeType: '',
                riskLevel: '',
                affectedSystems: '',
                maintenanceWindow: '',
                rollbackPlan: '',
                downtime: '',
                formScore: 0,
                formComplete: false
            },
            config: {
                device: 'fw1.whitfield.local (Cisco ASA 5525-X) -- 198.51.100.10',
                running: '! Cisco ASA 5525-X -- fw1.whitfield.local\n! Last modified: 2026-03-15 by admin\n!\nhostname fw1\ndomain-name whitfield.local\n!\ninterface GigabitEthernet0/0\n nameif outside\n security-level 0\n ip address 198.51.100.10 255.255.255.0\n!\ninterface GigabitEthernet0/1\n nameif inside\n security-level 100\n ip address 10.20.0.1 255.255.0.0\n!\naccess-list OUTSIDE_IN extended permit tcp any host 198.51.100.10 eq 443\naccess-list OUTSIDE_IN extended deny ip any any log\n!\nroute outside 0.0.0.0 0.0.0.0 198.51.100.1\nroute inside 10.20.0.0 255.255.0.0 10.20.0.1\n!\ncrypto ikev2 policy 10\n encryption aes-256\n integrity sha256\n group 14\n prf sha256\n lifetime 86400\n!\n! --- NO VPN TUNNEL CONFIGURED ---\n!\nlogging enable\nlogging host inside 10.20.2.20 514\nlogging trap informational\n!\nntp server 10.20.2.10\n!\nend',
                goldenDate: 'Baseline captured: 2026-03-15 -- Approved by CAB meeting #42',
                golden: '! Cisco ASA 5525-X -- fw1.whitfield.local\n! Baseline config -- CAB #42 approved 2026-03-15\n!\nhostname fw1\ndomain-name whitfield.local\n!\ninterface GigabitEthernet0/0\n nameif outside\n security-level 0\n ip address 198.51.100.10 255.255.255.0\n!\ninterface GigabitEthernet0/1\n nameif inside\n security-level 100\n ip address 10.20.0.1 255.255.0.0\n!\naccess-list OUTSIDE_IN extended permit tcp any host 198.51.100.10 eq 443\naccess-list OUTSIDE_IN extended deny ip any any log\n!\nroute outside 0.0.0.0 0.0.0.0 198.51.100.1\nroute inside 10.20.0.0 255.255.0.0 10.20.0.1\n!\ncrypto ikev2 policy 10\n encryption aes-256\n integrity sha256\n group 14\n prf sha256\n lifetime 86400\n!\nlogging enable\nlogging host inside 10.20.2.20 514\nlogging trap informational\n!\nntp server 10.20.2.10\n!\nend',
                diff: 'NO DIFFERENCES -- Running config matches golden baseline. No unauthorized changes detected.',
                proposedDiff: '+ crypto ikev2 enable outside\n+ crypto ikev2 remote-access trustpoint ASDM_TrustPoint0\n+\n+ tunnel-group 203.0.113.50 type ipsec-l2l\n+ tunnel-group 203.0.113.50 ipsec-attributes\n+  ikev2 remote-authentication pre-shared-key *****\n+  ikev2 local-authentication pre-shared-key *****\n+\n+ crypto ipsec ikev2 ipsec-proposal AES256-SHA256\n+  protocol esp encryption aes-256\n+  protocol esp integrity sha-256\n+\n+ crypto map OUTSIDE_MAP 10 match address VPN_PARTNER\n+ crypto map OUTSIDE_MAP 10 set peer 203.0.113.50\n+ crypto map OUTSIDE_MAP 10 set ikev2 ipsec-proposal AES256-SHA256\n+ crypto map OUTSIDE_MAP interface outside\n+\n+ access-list VPN_PARTNER extended permit tcp 10.20.0.0 255.255.0.0 172.16.50.0 255.255.255.0 eq 443\n+ access-list VPN_PARTNER extended permit tcp 10.20.0.0 255.255.0.0 172.16.50.0 255.255.255.0 eq 2575\n+ access-list VPN_PARTNER extended deny ip any any log\n+\n+ route outside 172.16.50.0 255.255.255.0 203.0.113.50',
                backupDest: '',
                backupFilename: '',
                backupStatus: 'No backup taken yet. A backup MUST be taken before any changes.',
                backupComplete: false,
                preflightBackup: '',
                preflightApproval: '',
                preflightWindow: '',
                applyStatus: 'Complete all pre-flight checks and click Apply to push the configuration.',
                changeApplied: false
            },
            diagram: {
                before: '                          [INTERNET]\n                              |\n                     [ISP: 198.51.100.1]\n                              |\n                  [FW1: 198.51.100.10]  <-- outside interface\n                    |  (Cisco ASA 5525-X)\n                    |  inside: 10.20.0.1\n                    |\n               [Core-SW: 10.20.1.1]\n              /          |          \\\n     [VLAN 10]     [VLAN 20]     [VLAN 30]\n     10.20.10.0/24  10.20.20.0/24  10.20.30.0/24\n     (Clinical)    (Admin)       (Servers)\n                                    |\n                            [DC1: 10.20.2.10]\n                            [Syslog: 10.20.2.20]\n\n   --- NO CONNECTION TO PARTNER CLINIC ---\n   Parkside Family Clinic: 203.0.113.50 (unreachable)',
                after: '                          [INTERNET]\n                              |\n                     [ISP: 198.51.100.1]\n                              |\n                  [FW1: 198.51.100.10]  <-- outside interface\n                    |  (Cisco ASA 5525-X)\n                    |  inside: 10.20.0.1\n                    |                    ===== IPSec VPN Tunnel =====\n                    |                    ||  IKEv2 / AES-256 / SHA-256  ||\n                    |                    ||  Peer: 203.0.113.50        ||\n                    |                    ||  Traffic: HTTPS + HL7 only ||\n                    |                    ================================\n                    |                                                   |\n               [Core-SW: 10.20.1.1]                    [Partner GW: 203.0.113.50]\n              /          |          \\                           |\n     [VLAN 10]     [VLAN 20]     [VLAN 30]            [Partner LAN: 172.16.50.0/24]\n     10.20.10.0/24  10.20.20.0/24  10.20.30.0/24      Parkside Family Clinic\n     (Clinical)    (Admin)       (Servers)            (HL7 FHIR + HTTPS access)\n                                    |\n                            [DC1: 10.20.2.10]\n                            [Syslog: 10.20.2.20]',
                changeSummary: 'NEW: Site-to-site IPSec VPN tunnel from FW1 (198.51.100.10) to Partner GW (203.0.113.50)\nENCRYPTION: IKEv2 with AES-256-CBC + SHA-256 + DH Group 14\nTRAFFIC: Restricted to TCP/443 (HTTPS) and TCP/2575 (HL7) only\nROUTING: Static route for 172.16.50.0/24 via tunnel\nCOMPLIANCE: HIPAA requires encryption for PHI in transit'
            },
            approval: {
                cabMembers: 'Chair: Mike Torres (IT Director) | Security: Lisa Park (CISO) | Clinical: Dr. James Wright (CMO) | Infrastructure: You (Network Engineer)',
                hasRollback: '',
                hasRiskAssessment: '',
                hasWindow: '',
                hipaaReview: '',
                status: 'Pending submission. Complete all fields and click Apply to submit for CAB review.',
                approved: false,
                history: [
                    { crId: 'CR-2026-0146', date: '2026-03-22', desc: 'Add VLAN 40 for guest WiFi',             status: 'Completed', risk: 'Low' },
                    { crId: 'CR-2026-0145', date: '2026-03-15', desc: 'Update IOS on Core-SW to 16.12.8',       status: 'Completed', risk: 'Medium' },
                    { crId: 'CR-2026-0144', date: '2026-03-08', desc: 'Replace expired SSL cert on fw1',         status: 'Completed', risk: 'Low' },
                    { crId: 'CR-2026-0143', date: '2026-03-01', desc: 'Migrate DNS to redundant DC2',            status: 'Completed', risk: 'Medium' },
                    { crId: 'CR-2026-0142', date: '2026-02-22', desc: 'Emergency patch: CVE-2026-1234 on fw1',  status: 'Completed', risk: 'High' }
                ]
            },
            verify: {
                tunnelCheck: '',
                tunnelOutput: 'Select a command and click Apply',
                ikev2Checked: false,
                ipsecChecked: false,
                testTarget: '',
                testResult: 'Select a test and click Apply',
                pingVerified: false,
                httpsVerified: false,
                hl7Verified: false,
                httpBlockVerified: false,
                checkIkev2: '',
                checkReachable: '',
                checkBlocked: '',
                checkEncryption: '',
                checklistResult: 'Complete the checklist and click Apply',
                verificationComplete: false
            }
        }
    },

    /* -- 10 Tasks -------------------------------------------- */
    tasks: [
        /* -- Task 1: Review the Change Request ---------------- */
        {
            id: 'task-01-review-cr',
            title: '1. Review the Change Request',
            description: 'Double-click "Change Request" to open CR-2026-0147. Read the Request Details section: understand the business justification (HIPAA-compliant VPN for partner clinic), the systems involved, and what will change.',
            verify: {
                type: 'window_opened',
                window: 'web_mgmt'
            }
        },
        /* -- Task 2: Complete the Change Request Form ---------- */
        {
            id: 'task-02-complete-cr',
            title: '2. Complete the Change Request Form',
            description: 'Navigate to "Complete Request". Fill in: Change Type (Normal — requires CAB review), Risk (Medium — firewall change with rollback plan), Affected Systems (must include fw1), Maintenance Window (Overnight), a rollback plan description, and estimated downtime. Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.cr.formComplete',
                value: true
            }
        },
        /* -- Task 3: Review Network Diagrams ------------------- */
        {
            id: 'task-03-review-diagrams',
            title: '3. Review Before and After Network Diagrams',
            description: 'Open the Network Diagram. Review the "Current Topology (Before)" — no VPN tunnel exists. Then review the "Proposed Topology (After)" — the new IPSec tunnel connects to Parkside Clinic at 203.0.113.50, restricted to HTTPS and HL7 traffic only.',
            verify: {
                type: 'window_opened',
                window: 'web_mgmt'
            }
        },
        /* -- Task 4: Submit for CAB Approval ------------------- */
        {
            id: 'task-04-cab-approval',
            title: '4. Submit for CAB Approval',
            description: 'Open the Approval Console. Confirm all four checklist items (rollback plan documented, risk assessment completed, maintenance window scheduled, HIPAA review required — YES to all). Click Apply to submit for CAB vote. All three board members must approve.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.approval.approved',
                value: true
            }
        },
        /* -- Task 5: Backup Current Config --------------------- */
        {
            id: 'task-05-backup',
            title: '5. Backup the Current Configuration',
            description: 'Open the Config Manager. Navigate to "Backup Current Config". Select a backup destination and provide a descriptive filename (e.g., fw1-pre-vpn-2026-03-30.cfg). Click Apply. This is critical — never make changes without a backup.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.config.backupComplete',
                value: true
            }
        },
        /* -- Task 6: Compare Running vs Golden Config ---------- */
        {
            id: 'task-06-compare-configs',
            title: '6. Compare Running vs Golden Configuration',
            description: 'Review the "Running Config" and "Golden Config (Baseline)" sections in the Config Manager. Verify that the running config matches the golden baseline — no unauthorized changes should exist before we proceed. The diff shows NO DIFFERENCES, which is correct.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.config.backupComplete',
                value: true
            }
        },
        /* -- Task 7: Apply the VPN Configuration --------------- */
        {
            id: 'task-07-apply-change',
            title: '7. Apply the VPN Configuration Change',
            description: 'Navigate to "Apply VPN Configuration". Review the proposed diff carefully — it adds IKEv2, tunnel-group, IPSec proposal, crypto map, VPN ACL, and static route. Complete all 3 pre-flight checks (backup done, approval received, within maintenance window) and click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.config.changeApplied',
                value: true
            }
        },
        /* -- Task 8: Verify VPN Tunnel Status ------------------ */
        {
            id: 'task-08-verify-tunnel',
            title: '8. Verify VPN Tunnel Status',
            description: 'Open Verification Tools. Navigate to "VPN Tunnel Status". Run "show crypto ikev2 sa" to confirm the IKEv2 SA is UP-ACTIVE. Note the encryption (AES-256), integrity (SHA-256), and DH Group (14). The tunnel should show READY status with the partner peer.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.verify.ikev2Checked',
                value: true
            }
        },
        /* -- Task 9: Test Connectivity Through Tunnel ---------- */
        {
            id: 'task-09-test-connectivity',
            title: '9. Test Application Connectivity',
            description: 'In the Connectivity Test section, test HTTPS to 172.16.50.10:443 (should succeed — FHIR API responds). Then test HTTP to 172.16.50.10:80 (should FAIL — blocked by ACL). This confirms the tunnel works AND unauthorized traffic is properly blocked.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.verify.httpsVerified',
                value: true
            }
        },
        /* -- Task 10: Complete Verification Checklist ----------- */
        {
            id: 'task-10-verification',
            title: '10. Complete the Verification Checklist',
            description: 'Navigate to "Verification Checklist". Confirm: IKEv2 SA is UP-ACTIVE (Yes), partner LAN is reachable (Yes), HTTP/80 is blocked (Yes), and the encryption algorithm is AES-256-CBC. Click Apply. This closes the change management cycle for CR-2026-0147.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.verify.verificationComplete',
                value: true
            }
        }
    ]
};
