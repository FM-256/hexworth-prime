/* ============================================================
   gui-ne10-juniper.config.js
   Network+ NE-10 Security -- Juniper SRX J-Web GUI Lab
   Hexworth Prime -- Network+ Course
   2026-03-27

   SCENARIO: Security audit on Juniper SRX345 firewall.
   Harden security policies, update IDP signatures,
   configure Screen profiles for DoS protection,
   create ACLs for management access, remove default permit-all.
   ============================================================ */

const GUI_NE10_JUNIPER_CONFIG = {

    id: 'gui-ne10-juniper',
    title: 'NE-10 Security: Juniper SRX345 Firewall Hardening',
    subtitle: 'Security audit -- harden policies, IDP, Screen profiles, and ACLs via J-Web',
    duration: 1800, // 30 minutes
    sequentialTasks: true,

    certObjectives: [
        'N10-009 4.1: Explain common security concepts',
        'N10-009 4.3: Explain common security concepts for securing network device management',
        'N10-009 4.5: Explain the importance of network segmentation enforcement'
    ],

    scoring: {
        taskPoints: 45,
        timeBonus: 100,
        maxScore: 550
    },

    /* -- Desktop Icons ---------------------------------------- */
    desktop: [
        {
            id: 'browser-jweb',
            label: 'J-Web Mgmt\n192.168.1.1',
            icon: 'browser',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'Juniper Networks SRX345 -- J-Web',
                sections: [

                    /* -- Dashboard ----------------------------- */
                    {
                        id: 'jw-dashboard',
                        label: 'Dashboard',
                        group: 'Dashboard',
                        saveable: false,
                        fields: [
                            { type: 'info', label: 'Hostname',           statePath: 'webMgmt.jw.hostname',        default: 'SRX345-GW01' },
                            { type: 'info', label: 'Model',              statePath: 'webMgmt.jw.model',           default: 'SRX345' },
                            { type: 'info', label: 'Junos Version',      statePath: 'webMgmt.jw.junosVersion',    default: '23.4R1.10' },
                            { type: 'info', label: 'Serial',             statePath: 'webMgmt.jw.serial',          default: 'CW0218AF0345' },
                            { type: 'info', label: 'Uptime',             statePath: 'webMgmt.jw.uptime',          default: '63 days, 08:22:17' },
                            { type: 'info', label: 'Active Sessions',    statePath: 'webMgmt.jw.sessions',        default: '2,814' },
                            { type: 'info', label: 'Chassis Alarms',     statePath: 'webMgmt.jw.chassisAlarms',   default: '0' },
                            { type: 'info', label: 'Security Alarms',    statePath: 'webMgmt.jw.securityAlarms',  default: '3 CRITICAL' },
                            { type: 'info', label: 'Alarm Details',      statePath: 'webMgmt.jw.alarmDetails',    default: 'IDP signatures outdated (47 days) | Default permit-all policy active | Screen profiles disabled' },
                            { type: 'info', label: 'Config Status',      statePath: 'webMgmt.jw.configStatus',    default: 'Committed' }
                        ]
                    },

                    /* -- Security Zones ------------------------ */
                    {
                        id: 'jw-zones',
                        label: 'Security Zones',
                        group: 'Security',
                        fields: [
                            {
                                type: 'table',
                                label: 'Zone Configuration',
                                statePath: 'webMgmt.jw.zoneTable',
                                columns: [
                                    { key: 'name',       label: 'Zone' },
                                    { key: 'interfaces', label: 'Interfaces' },
                                    { key: 'services',   label: 'Host-Inbound Services' },
                                    { key: 'screen',     label: 'Screen Profile' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Edit Zone',
                                statePath: 'webMgmt.jw.editZone',
                                options: [
                                    { value: '',         label: '-- Select Zone --' },
                                    { value: 'trust',    label: 'trust' },
                                    { value: 'untrust',  label: 'untrust' },
                                    { value: 'dmz',      label: 'dmz' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Host-Inbound Services',
                                statePath: 'webMgmt.jw.zoneServices',
                                options: [
                                    { value: 'all',            label: 'all (any service)' },
                                    { value: 'https-ssh',      label: 'https, ssh' },
                                    { value: 'https',          label: 'https only' },
                                    { value: 'ssh',            label: 'ssh only' },
                                    { value: 'ping',           label: 'ping only' },
                                    { value: 'none',           label: 'none (deny all)' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Screen Profile',
                                statePath: 'webMgmt.jw.zoneScreen',
                                options: [
                                    { value: 'none',            label: 'none' },
                                    { value: 'untrust-screen',  label: 'untrust-screen' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const jw = state.webMgmt.jw;
                            const zone = jw.editZone;
                            if (!zone) return;

                            const row = jw.zoneTable.find(z => z.name === zone);
                            if (row) {
                                if (jw.zoneServices) row.services = jw.zoneServices;
                                if (jw.zoneScreen)   row.screen   = jw.zoneScreen;
                            }

                            /* Task 2: Harden untrust zone -- remove "all" services */
                            if (zone === 'untrust' && jw.zoneServices === 'none') {
                                jw.untrust_hardened = true;
                            }

                            jw.editZone = '';
                            jw.configStatus = 'Modified (uncommitted)';
                        }
                    },

                    /* -- Security Policies --------------------- */
                    {
                        id: 'jw-policies',
                        label: 'Security Policies',
                        group: 'Security',
                        fields: [
                            {
                                type: 'table',
                                label: 'Firewall Policies',
                                statePath: 'webMgmt.jw.policyTable',
                                columns: [
                                    { key: 'name',    label: 'Policy Name' },
                                    { key: 'from',    label: 'From Zone' },
                                    { key: 'to',      label: 'To Zone' },
                                    { key: 'srcAddr', label: 'Source' },
                                    { key: 'dstAddr', label: 'Destination' },
                                    { key: 'app',     label: 'Application' },
                                    { key: 'action',  label: 'Action' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Delete Policy',
                                statePath: 'webMgmt.jw.deletePolicy',
                                options: [
                                    { value: '',              label: '-- Select Policy to Delete --' },
                                    { value: 'default-permit', label: 'default-permit (INSECURE)' }
                                ]
                            },
                            { type: 'text',   label: 'New Policy Name',         statePath: 'webMgmt.jw.newPolName',    placeholder: 'e.g. trust-to-untrust-web' },
                            {
                                type: 'select',
                                label: 'From Zone',
                                statePath: 'webMgmt.jw.newPolFrom',
                                options: [
                                    { value: '',         label: '-- Select --' },
                                    { value: 'trust',    label: 'trust' },
                                    { value: 'untrust',  label: 'untrust' },
                                    { value: 'dmz',      label: 'dmz' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'To Zone',
                                statePath: 'webMgmt.jw.newPolTo',
                                options: [
                                    { value: '',         label: '-- Select --' },
                                    { value: 'trust',    label: 'trust' },
                                    { value: 'untrust',  label: 'untrust' },
                                    { value: 'dmz',      label: 'dmz' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Source Address',
                                statePath: 'webMgmt.jw.newPolSrc',
                                options: [
                                    { value: 'any',            label: 'any' },
                                    { value: '10.0.1.0/24',   label: '10.0.1.0/24 (trust)' },
                                    { value: '10.0.2.0/24',   label: '10.0.2.0/24 (dmz)' },
                                    { value: '10.0.2.10/32',  label: '10.0.2.10/32 (web-server)' },
                                    { value: '10.0.0.0/24',   label: '10.0.0.0/24 (mgmt)' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Destination Address',
                                statePath: 'webMgmt.jw.newPolDst',
                                options: [
                                    { value: 'any',            label: 'any' },
                                    { value: '10.0.1.0/24',   label: '10.0.1.0/24 (trust)' },
                                    { value: '10.0.2.0/24',   label: '10.0.2.0/24 (dmz)' },
                                    { value: '10.0.2.10/32',  label: '10.0.2.10/32 (web-server)' },
                                    { value: '10.0.0.0/24',   label: '10.0.0.0/24 (mgmt)' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Application',
                                statePath: 'webMgmt.jw.newPolApp',
                                options: [
                                    { value: 'any',                  label: 'any' },
                                    { value: 'junos-http',           label: 'junos-http (HTTP/80)' },
                                    { value: 'junos-https',          label: 'junos-https (HTTPS/443)' },
                                    { value: 'junos-http-https',     label: 'junos-http + junos-https' },
                                    { value: 'junos-dns-udp',        label: 'junos-dns-udp' },
                                    { value: 'junos-ssh',            label: 'junos-ssh (SSH/22)' },
                                    { value: 'junos-ping',           label: 'junos-ping (ICMP)' },
                                    { value: 'junos-web-ssl',        label: 'junos-http + junos-https + ssl' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Action',
                                statePath: 'webMgmt.jw.newPolAction',
                                options: [
                                    { value: '',       label: '-- Select --' },
                                    { value: 'permit', label: 'permit' },
                                    { value: 'deny',   label: 'deny' },
                                    { value: 'reject', label: 'reject' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const jw = state.webMgmt.jw;

                            /* Handle delete */
                            if (jw.deletePolicy === 'default-permit') {
                                jw.policyTable = jw.policyTable.filter(p => p.name !== 'default-permit');
                                jw.default_permit_deleted = true;
                                jw.deletePolicy = '';
                                jw.configStatus = 'Modified (uncommitted)';
                                return;
                            }

                            /* Handle new policy */
                            const name = (jw.newPolName || '').trim();
                            if (!name || !jw.newPolFrom || !jw.newPolTo || !jw.newPolAction) return;

                            if (!jw.policyTable) jw.policyTable = [];
                            const exists = jw.policyTable.some(p => p.name === name);
                            if (!exists) {
                                jw.policyTable.push({
                                    name:    name,
                                    from:    jw.newPolFrom,
                                    to:      jw.newPolTo,
                                    srcAddr: jw.newPolSrc  || 'any',
                                    dstAddr: jw.newPolDst  || 'any',
                                    app:     jw.newPolApp   || 'any',
                                    action:  jw.newPolAction
                                });
                            }

                            /* Task 4: trust -> untrust allow web+ssl */
                            if (jw.newPolFrom === 'trust' && jw.newPolTo === 'untrust' &&
                                jw.newPolAction === 'permit' &&
                                (jw.newPolApp === 'junos-http-https' || jw.newPolApp === 'junos-web-ssl')) {
                                jw.pol_trust_untrust_web = true;
                            }

                            /* Task 5: untrust -> dmz allow http/https to web server */
                            if (jw.newPolFrom === 'untrust' && jw.newPolTo === 'dmz' &&
                                jw.newPolAction === 'permit' &&
                                (jw.newPolApp === 'junos-http-https' || jw.newPolApp === 'junos-https' || jw.newPolApp === 'junos-http') &&
                                jw.newPolDst === '10.0.2.10/32') {
                                jw.pol_untrust_dmz_web = true;
                            }

                            /* Task 6: deny untrust -> trust */
                            if (jw.newPolFrom === 'untrust' && jw.newPolTo === 'trust' &&
                                (jw.newPolAction === 'deny' || jw.newPolAction === 'reject') &&
                                jw.newPolApp === 'any' && (jw.newPolSrc || 'any') === 'any' && (jw.newPolDst || 'any') === 'any') {
                                jw.pol_deny_untrust_trust = true;
                            }

                            /* Clear form */
                            jw.newPolName   = '';
                            jw.newPolFrom   = '';
                            jw.newPolTo     = '';
                            jw.newPolSrc    = 'any';
                            jw.newPolDst    = 'any';
                            jw.newPolApp    = 'any';
                            jw.newPolAction = '';
                            jw.deletePolicy = '';
                            jw.configStatus = 'Modified (uncommitted)';
                        }
                    },

                    /* -- IDP (Intrusion Detection & Prevention) -- */
                    {
                        id: 'jw-idp',
                        label: 'IDP',
                        group: 'Security',
                        fields: [
                            {
                                type: 'table',
                                label: 'IDP Policies',
                                statePath: 'webMgmt.jw.idpTable',
                                columns: [
                                    { key: 'name',     label: 'Policy Name' },
                                    { key: 'rulebase', label: 'Rulebase' },
                                    { key: 'action',   label: 'Action' },
                                    { key: 'logging',  label: 'Logging' },
                                    { key: 'status',   label: 'Status' }
                                ]
                            },
                            { type: 'info', label: 'Signature DB Version',  statePath: 'webMgmt.jw.idpSigVersion',  default: '3547 (47 days old)' },
                            { type: 'info', label: 'Last Update',           statePath: 'webMgmt.jw.idpLastUpdate',  default: '2026-02-08 03:00 UTC' },
                            {
                                type: 'select',
                                label: 'IDP Policy',
                                statePath: 'webMgmt.jw.idpPolicySelect',
                                options: [
                                    { value: '',             label: '-- Select Policy --' },
                                    { value: 'Recommended',  label: 'Recommended (vendor-curated)' },
                                    { value: 'DMZ-Protect',  label: 'DMZ-Protect (custom)' },
                                    { value: 'Custom',       label: 'Custom' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Default Action',
                                statePath: 'webMgmt.jw.idpAction',
                                options: [
                                    { value: '',              label: '-- Select --' },
                                    { value: 'no-action',     label: 'no-action (monitor only)' },
                                    { value: 'drop-packet',   label: 'drop-packet' },
                                    { value: 'drop-connection', label: 'drop-connection' },
                                    { value: 'close-client-and-server', label: 'close-client-and-server' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Logging',
                                statePath: 'webMgmt.jw.idpLogging',
                                options: [
                                    { value: '',     label: '-- Select --' },
                                    { value: 'off',  label: 'off' },
                                    { value: 'log',  label: 'log (syslog)' },
                                    { value: 'log-alert', label: 'log + alert' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Update Signatures',
                                statePath: 'webMgmt.jw.idpUpdateAction',
                                options: [
                                    { value: '',       label: '-- Select --' },
                                    { value: 'update', label: 'Download & Install Latest Signatures' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const jw = state.webMgmt.jw;
                            const policy = jw.idpPolicySelect;
                            const action = jw.idpAction;
                            const logging = jw.idpLogging;

                            /* Handle signature update */
                            if (jw.idpUpdateAction === 'update') {
                                jw.idpSigVersion = '3594 (current)';
                                jw.idpLastUpdate = '2026-03-27 10:15 UTC';
                                jw.idpUpdateAction = '';
                            }

                            /* Enable IDP policy */
                            if (policy && action && logging) {
                                const existing = jw.idpTable.find(p => p.name === policy);
                                if (existing) {
                                    existing.action  = action;
                                    existing.logging = logging;
                                    existing.status  = 'Active';
                                } else {
                                    jw.idpTable.push({
                                        name:     policy,
                                        rulebase: 'IPS',
                                        action:   action,
                                        logging:  logging,
                                        status:   'Active'
                                    });
                                }

                                /* Task 7: Enable Recommended with drop + log */
                                if (policy === 'Recommended' &&
                                    (action === 'drop-packet' || action === 'drop-connection' || action === 'close-client-and-server') &&
                                    (logging === 'log' || logging === 'log-alert')) {
                                    jw.idp_recommended_active = true;
                                }

                                jw.idpPolicySelect = '';
                                jw.idpAction   = '';
                                jw.idpLogging  = '';
                            }

                            jw.configStatus = 'Modified (uncommitted)';
                        }
                    },

                    /* -- Screen (DoS Protection) --------------- */
                    {
                        id: 'jw-screen',
                        label: 'Screen',
                        group: 'Security',
                        fields: [
                            {
                                type: 'table',
                                label: 'Screen Profiles',
                                statePath: 'webMgmt.jw.screenTable',
                                columns: [
                                    { key: 'name',       label: 'Profile Name' },
                                    { key: 'synFlood',   label: 'SYN Flood' },
                                    { key: 'portScan',   label: 'Port Scan' },
                                    { key: 'icmpFlood',  label: 'ICMP Flood' },
                                    { key: 'status',     label: 'Status' }
                                ]
                            },
                            { type: 'text', label: 'Profile Name', statePath: 'webMgmt.jw.screenName', placeholder: 'e.g. untrust-screen' },
                            {
                                type: 'select',
                                label: 'SYN Flood Protection',
                                statePath: 'webMgmt.jw.screenSynFlood',
                                options: [
                                    { value: 'disabled',  label: 'disabled' },
                                    { value: '500',       label: 'enabled -- threshold 500/sec' },
                                    { value: '1000',      label: 'enabled -- threshold 1000/sec' },
                                    { value: '2000',      label: 'enabled -- threshold 2000/sec' },
                                    { value: '5000',      label: 'enabled -- threshold 5000/sec' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Port Scan Detection',
                                statePath: 'webMgmt.jw.screenPortScan',
                                options: [
                                    { value: 'disabled', label: 'disabled' },
                                    { value: 'enabled',  label: 'enabled' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'ICMP Flood Protection',
                                statePath: 'webMgmt.jw.screenIcmpFlood',
                                options: [
                                    { value: 'disabled',  label: 'disabled' },
                                    { value: 'enabled',   label: 'enabled -- threshold 1000/sec' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const jw = state.webMgmt.jw;
                            const name = (jw.screenName || '').trim();
                            if (!name) return;

                            if (!jw.screenTable) jw.screenTable = [];
                            const synLabel  = jw.screenSynFlood  === 'disabled' ? 'disabled' : 'enabled (' + jw.screenSynFlood + '/sec)';
                            const portLabel = jw.screenPortScan  || 'disabled';
                            const icmpLabel = jw.screenIcmpFlood === 'disabled' ? 'disabled' : 'enabled';

                            const existing = jw.screenTable.find(s => s.name === name);
                            if (existing) {
                                existing.synFlood  = synLabel;
                                existing.portScan  = portLabel;
                                existing.icmpFlood = icmpLabel;
                                existing.status    = 'Active';
                            } else {
                                jw.screenTable.push({
                                    name:      name,
                                    synFlood:  synLabel,
                                    portScan:  portLabel,
                                    icmpFlood: icmpLabel,
                                    status:    'Active'
                                });
                            }

                            /* Task 8: SYN flood 1000/sec + port scan + ICMP flood */
                            if (name === 'untrust-screen' &&
                                jw.screenSynFlood === '1000' &&
                                jw.screenPortScan === 'enabled' &&
                                jw.screenIcmpFlood === 'enabled') {
                                jw.screen_configured = true;
                            }

                            jw.screenName      = '';
                            jw.screenSynFlood  = 'disabled';
                            jw.screenPortScan  = 'disabled';
                            jw.screenIcmpFlood = 'disabled';
                            jw.configStatus    = 'Modified (uncommitted)';
                        }
                    },

                    /* -- ACLs (Firewall Filters) --------------- */
                    {
                        id: 'jw-acls',
                        label: 'ACLs',
                        group: 'Security',
                        fields: [
                            {
                                type: 'table',
                                label: 'Management ACLs (Firewall Filters)',
                                statePath: 'webMgmt.jw.aclTable',
                                columns: [
                                    { key: 'name',      label: 'Filter Name' },
                                    { key: 'term',      label: 'Term' },
                                    { key: 'srcAddr',   label: 'Source Prefix' },
                                    { key: 'protocol',  label: 'Protocol' },
                                    { key: 'dstPort',   label: 'Dest Port' },
                                    { key: 'action',    label: 'Action' }
                                ]
                            },
                            { type: 'text', label: 'Filter Name', statePath: 'webMgmt.jw.aclFilterName', placeholder: 'e.g. mgmt-access' },
                            { type: 'text', label: 'Term Name',   statePath: 'webMgmt.jw.aclTermName',   placeholder: 'e.g. allow-ssh-mgmt' },
                            {
                                type: 'select',
                                label: 'Source Prefix',
                                statePath: 'webMgmt.jw.aclSrcAddr',
                                options: [
                                    { value: 'any',           label: 'any' },
                                    { value: '10.0.0.0/24',  label: '10.0.0.0/24 (management)' },
                                    { value: '10.0.1.0/24',  label: '10.0.1.0/24 (trust)' },
                                    { value: '10.0.2.0/24',  label: '10.0.2.0/24 (dmz)' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Protocol',
                                statePath: 'webMgmt.jw.aclProtocol',
                                options: [
                                    { value: '',     label: '-- Select --' },
                                    { value: 'tcp',  label: 'tcp' },
                                    { value: 'udp',  label: 'udp' },
                                    { value: 'icmp', label: 'icmp' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Destination Port',
                                statePath: 'webMgmt.jw.aclDstPort',
                                options: [
                                    { value: '',    label: '-- Select --' },
                                    { value: '22',  label: '22 (SSH)' },
                                    { value: '443', label: '443 (HTTPS)' },
                                    { value: '80',  label: '80 (HTTP)' },
                                    { value: '161', label: '161 (SNMP)' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Action',
                                statePath: 'webMgmt.jw.aclAction',
                                options: [
                                    { value: '',        label: '-- Select --' },
                                    { value: 'accept',  label: 'accept' },
                                    { value: 'discard', label: 'discard' },
                                    { value: 'reject',  label: 'reject' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const jw = state.webMgmt.jw;
                            const filterName = (jw.aclFilterName || '').trim();
                            const termName   = (jw.aclTermName   || '').trim();
                            if (!filterName || !termName || !jw.aclProtocol || !jw.aclDstPort || !jw.aclAction) return;

                            if (!jw.aclTable) jw.aclTable = [];
                            const exists = jw.aclTable.some(a => a.name === filterName && a.term === termName);
                            if (!exists) {
                                jw.aclTable.push({
                                    name:     filterName,
                                    term:     termName,
                                    srcAddr:  jw.aclSrcAddr || 'any',
                                    protocol: jw.aclProtocol,
                                    dstPort:  jw.aclDstPort,
                                    action:   jw.aclAction
                                });
                            }

                            /* Task 9: SSH from 10.0.0.0/24 only */
                            if (jw.aclSrcAddr === '10.0.0.0/24' &&
                                jw.aclProtocol === 'tcp' &&
                                jw.aclDstPort === '22' &&
                                jw.aclAction === 'accept') {
                                jw.acl_ssh_mgmt = true;
                            }

                            jw.aclFilterName = '';
                            jw.aclTermName   = '';
                            jw.aclSrcAddr    = 'any';
                            jw.aclProtocol   = '';
                            jw.aclDstPort    = '';
                            jw.aclAction     = '';
                            jw.configStatus  = 'Modified (uncommitted)';
                        }
                    },

                    /* -- Commit -------------------------------- */
                    {
                        id: 'jw-commit',
                        label: 'Commit',
                        group: 'Dashboard',
                        fields: [
                            { type: 'info', label: 'Config Status',   statePath: 'webMgmt.jw.configStatus',   default: 'Committed' },
                            { type: 'info', label: 'Audit Summary',   statePath: 'webMgmt.jw.auditSummary',   default: 'Pending audit completion' },
                            {
                                type: 'select',
                                label: 'Commit Action',
                                statePath: 'webMgmt.jw.commitAction',
                                options: [
                                    { value: '',                label: '-- Select Action --' },
                                    { value: 'commit-check',    label: 'Commit Check (validate only)' },
                                    { value: 'commit-confirm',  label: 'Commit Confirmed' },
                                    { value: 'rollback',        label: 'Rollback 0 (revert)' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const jw = state.webMgmt.jw;
                            if (jw.commitAction === 'commit-confirm') {
                                const allDone = jw.untrust_hardened &&
                                    jw.default_permit_deleted &&
                                    jw.pol_trust_untrust_web &&
                                    jw.pol_untrust_dmz_web &&
                                    jw.pol_deny_untrust_trust &&
                                    jw.idp_recommended_active &&
                                    jw.screen_configured &&
                                    jw.acl_ssh_mgmt;

                                if (allDone) {
                                    jw.configStatus    = 'Committed';
                                    jw.committed       = true;
                                    jw.securityAlarms  = '0';
                                    jw.alarmDetails    = 'All clear -- no active alarms';
                                    jw.auditSummary    = 'PASS -- Default permit removed, IDP active, Screen profiles enabled, management ACL applied';
                                } else {
                                    jw.configStatus = 'Commit failed: incomplete hardening (review all tasks)';
                                }
                                jw.commitAction = '';
                            } else if (jw.commitAction === 'commit-check') {
                                jw.configStatus = 'Commit check passed -- ready to commit';
                                jw.commitAction = '';
                            }
                        }
                    }
                ]
            }
        }
    ],

    /* -- Initial State ---------------------------------------- */
    initialState: {
        webMgmt: {
            jw: {
                hostname:       'SRX345-GW01',
                model:          'SRX345',
                junosVersion:   '23.4R1.10',
                serial:         'CW0218AF0345',
                uptime:         '63 days, 08:22:17',
                sessions:       '2,814',
                chassisAlarms:  '0',
                securityAlarms: '3 CRITICAL',
                alarmDetails:   'IDP signatures outdated (47 days) | Default permit-all policy active | Screen profiles disabled',
                configStatus:   'Committed',
                auditSummary:   'Pending audit completion',

                /* Zones (pre-configured -- untrust has insecure "all" services) */
                zoneTable: [
                    { name: 'trust',   interfaces: 'ge-0/0/1.0',  services: 'https-ssh',  screen: 'none' },
                    { name: 'untrust', interfaces: 'ge-0/0/0.0',  services: 'all',         screen: 'none' },
                    { name: 'dmz',     interfaces: 'ge-0/0/2.0',  services: 'https',       screen: 'none' }
                ],
                editZone:     '',
                zoneServices: '',
                zoneScreen:   '',
                untrust_hardened: false,

                /* Security Policies (has insecure default-permit) */
                policyTable: [
                    { name: 'default-permit', from: 'any', to: 'any', srcAddr: 'any', dstAddr: 'any', app: 'any', action: 'permit' }
                ],
                deletePolicy:   '',
                newPolName:     '',
                newPolFrom:     '',
                newPolTo:       '',
                newPolSrc:      'any',
                newPolDst:      'any',
                newPolApp:      'any',
                newPolAction:   '',
                default_permit_deleted:   false,
                pol_trust_untrust_web:    false,
                pol_untrust_dmz_web:      false,
                pol_deny_untrust_trust:   false,

                /* IDP */
                idpTable: [
                    { name: 'Recommended', rulebase: 'IPS', action: 'no-action', logging: 'off', status: 'Inactive' }
                ],
                idpSigVersion:   '3547 (47 days old)',
                idpLastUpdate:   '2026-02-08 03:00 UTC',
                idpPolicySelect: '',
                idpAction:       '',
                idpLogging:      '',
                idpUpdateAction: '',
                idp_recommended_active: false,

                /* Screen */
                screenTable: [],
                screenName:      '',
                screenSynFlood:  'disabled',
                screenPortScan:  'disabled',
                screenIcmpFlood: 'disabled',
                screen_configured: false,

                /* ACLs */
                aclTable: [],
                aclFilterName: '',
                aclTermName:   '',
                aclSrcAddr:    'any',
                aclProtocol:   '',
                aclDstPort:    '',
                aclAction:     '',
                acl_ssh_mgmt:  false,

                /* Commit */
                commitAction: '',
                committed:    false
            }
        }
    },

    /* -- 10 Tasks --------------------------------------------- */
    tasks: [
        /* Task 1: Open J-Web and review dashboard alarms */
        {
            id: 'task-01-open-jweb',
            title: '1. Access J-Web and Review Dashboard Alarms',
            description: 'Double-click the "J-Web Mgmt" icon on the desktop to open the Juniper SRX management interface. Review the Dashboard -- note the 3 CRITICAL security alarms: outdated IDP signatures, default permit-all policy, and disabled Screen profiles.',
            verify: {
                type: 'window_opened',
                window: 'web_mgmt'
            }
        },
        /* Task 2: Harden untrust zone */
        {
            id: 'task-02-harden-untrust',
            title: '2. Harden Untrust Zone: Remove "all" Services',
            description: 'Navigate to Security > Security Zones. Select the "untrust" zone and change Host-Inbound Services from "all" to "none". The untrust interface should not accept any management traffic. Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.jw.untrust_hardened',
                value: true
            }
        },
        /* Task 3: Delete default permit-all policy */
        {
            id: 'task-03-delete-default-permit',
            title: '3. Delete Default Permit-All Policy',
            description: 'Navigate to Security > Security Policies. Use the Delete Policy dropdown to remove the "default-permit" policy. This insecure rule allows all traffic between all zones. Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.jw.default_permit_deleted',
                value: true
            }
        },
        /* Task 4: Add trust -> untrust allow web+ssl */
        {
            id: 'task-04-trust-untrust-web',
            title: '4. Policy: Allow Trust to Untrust (Web + SSL)',
            description: 'Add a new security policy: From Zone = trust, To Zone = untrust, Application = junos-http + junos-https, Action = permit. This allows internal users to browse the internet. Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.jw.pol_trust_untrust_web',
                value: true
            }
        },
        /* Task 5: Add untrust -> dmz allow http/https to web server */
        {
            id: 'task-05-untrust-dmz-web',
            title: '5. Policy: Allow Untrust to DMZ Web Server',
            description: 'Add a security policy: From Zone = untrust, To Zone = dmz, Destination = 10.0.2.10/32 (web-server), Application = junos-http + junos-https, Action = permit. Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.jw.pol_untrust_dmz_web',
                value: true
            }
        },
        /* Task 6: Deny untrust -> trust */
        {
            id: 'task-06-deny-untrust-trust',
            title: '6. Policy: Deny Untrust to Trust (Explicit Block)',
            description: 'Add an explicit deny policy: From Zone = untrust, To Zone = trust, Source = any, Destination = any, Application = any, Action = deny. This blocks all unsolicited inbound traffic. Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.jw.pol_deny_untrust_trust',
                value: true
            }
        },
        /* Task 7: Enable IDP Recommended with drop+log */
        {
            id: 'task-07-idp-recommended',
            title: '7. Enable IDP: Recommended Policy with Drop + Log',
            description: 'Navigate to Security > IDP. First update the signatures (Download & Install Latest). Then select the "Recommended" IDP policy, set Action to "drop-packet" or "drop-connection", enable Logging (log or log+alert). Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.jw.idp_recommended_active',
                value: true
            }
        },
        /* Task 8: Configure Screen profile */
        {
            id: 'task-08-screen-profile',
            title: '8. Configure Screen Profile: DoS Protection',
            description: 'Navigate to Security > Screen. Create a profile named "untrust-screen" with: SYN Flood threshold 1000/sec, Port Scan detection enabled, ICMP Flood protection enabled. Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.jw.screen_configured',
                value: true
            }
        },
        /* Task 9: Management ACL */
        {
            id: 'task-09-mgmt-acl',
            title: '9. Create Management ACL: SSH from 10.0.0.0/24 Only',
            description: 'Navigate to Security > ACLs. Create a firewall filter allowing SSH (TCP port 22) only from the management subnet 10.0.0.0/24. Action = accept. Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.jw.acl_ssh_mgmt',
                value: true
            }
        },
        /* Task 10: Commit and verify */
        {
            id: 'task-10-commit',
            title: '10. Commit Configuration and Verify Audit',
            description: 'Navigate to Dashboard > Commit. Select "Commit Confirmed" and click Apply. Verify the security alarms clear and the audit summary shows PASS.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.jw.committed',
                value: true
            }
        }
    ]
};
