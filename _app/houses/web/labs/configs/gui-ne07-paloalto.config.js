/* ============================================================
   gui-ne07-paloalto.config.js
   Network+ NE-07 NAT -- Palo Alto PA-220 Firewall GUI Lab
   Hexworth Prime -- Network+ Course
   2026-03-27

   SCENARIO: Meridian Corp Palo Alto PA-220 firewall NAT config.
   Three zones: Trust (internal), DMZ, Untrust (internet).
   Configure source NAT, destination NAT, NAT exemptions,
   security policies, commit, and verify translations.
   ============================================================ */

const GUI_NE07_PALOALTO_CONFIG = {

    id: 'gui-ne07-paloalto',
    title: 'NE-07 NAT: Palo Alto PA-220 Firewall Configuration',
    subtitle: 'Configure NAT policies on a next-generation firewall',
    duration: 1800, // 30 minutes
    sequentialTasks: true,

    certObjectives: [
        'N10-009 1.4: Explain common networking ports, protocols, services, and traffic types',
        'N10-009 4.1: Explain common security concepts'
    ],

    scoring: {
        taskPoints: 45,
        timeBonus: 100,
        maxScore: 550
    },

    /* -- Desktop Icons ---------------------------------------- */
    desktop: [
        {
            id: 'browser-paloalto',
            label: 'PA-220 Mgmt\n192.168.1.1',
            icon: 'browser',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'Palo Alto Networks PA-220',
                sections: [
                    /* -- Dashboard ----------------------------- */
                    {
                        id: 'pa-dashboard',
                        label: 'Dashboard',
                        group: 'Dashboard',
                        saveable: false,
                        fields: [
                            { type: 'info', label: 'Hostname',         statePath: 'webMgmt.pa.hostname',         default: 'MeridianFW-01' },
                            { type: 'info', label: 'Model',            statePath: 'webMgmt.pa.model',            default: 'PA-220' },
                            { type: 'info', label: 'PAN-OS',           statePath: 'webMgmt.pa.panos',            default: '11.1.2-h3' },
                            { type: 'info', label: 'Serial',           statePath: 'webMgmt.pa.serial',           default: '012345678901' },
                            { type: 'info', label: 'Uptime',           statePath: 'webMgmt.pa.uptime',           default: '47 days, 12:04:31' },
                            { type: 'info', label: 'Active Sessions',  statePath: 'webMgmt.pa.sessions',         default: '1,247' },
                            { type: 'info', label: 'Threat Events (24h)', statePath: 'webMgmt.pa.threats',       default: '38' },
                            { type: 'info', label: 'Config Status',    statePath: 'webMgmt.pa.configStatus',     default: 'Committed' }
                        ]
                    },

                    /* -- Network > Interfaces ------------------- */
                    {
                        id: 'pa-interfaces',
                        label: 'Interfaces',
                        group: 'Network',
                        saveable: false,
                        fields: [
                            {
                                type: 'table',
                                label: 'Interface Configuration',
                                statePath: 'webMgmt.pa.interfaceTable',
                                columns: [
                                    { key: 'name',   label: 'Interface' },
                                    { key: 'type',   label: 'Type' },
                                    { key: 'ip',     label: 'IP Address' },
                                    { key: 'zone',   label: 'Zone' },
                                    { key: 'status', label: 'Link State' }
                                ]
                            }
                        ]
                    },

                    /* -- Network > Zones ----------------------- */
                    {
                        id: 'pa-zones',
                        label: 'Zones',
                        group: 'Network',
                        saveable: false,
                        fields: [
                            {
                                type: 'table',
                                label: 'Security Zones',
                                statePath: 'webMgmt.pa.zoneTable',
                                columns: [
                                    { key: 'name',       label: 'Zone Name' },
                                    { key: 'type',       label: 'Type' },
                                    { key: 'interfaces', label: 'Interfaces' },
                                    { key: 'protection', label: 'Zone Protection' }
                                ]
                            }
                        ]
                    },

                    /* -- Objects > Addresses -------------------- */
                    {
                        id: 'pa-addresses',
                        label: 'Addresses',
                        group: 'Objects',
                        fields: [
                            {
                                type: 'table',
                                label: 'Address Objects',
                                statePath: 'webMgmt.pa.addressTable',
                                columns: [
                                    { key: 'name', label: 'Name' },
                                    { key: 'type', label: 'Type' },
                                    { key: 'value', label: 'Address' }
                                ]
                            },
                            {
                                type: 'text',
                                label: 'Object Name',
                                statePath: 'webMgmt.pa.newAddrName',
                                placeholder: 'e.g. WebServer-Internal'
                            },
                            {
                                type: 'select',
                                label: 'Type',
                                statePath: 'webMgmt.pa.newAddrType',
                                options: [
                                    { value: 'ip-netmask', label: 'IP Netmask' },
                                    { value: 'ip-range',   label: 'IP Range' },
                                    { value: 'fqdn',       label: 'FQDN' }
                                ]
                            },
                            {
                                type: 'text',
                                label: 'Address / Netmask',
                                statePath: 'webMgmt.pa.newAddrValue',
                                placeholder: 'e.g. 10.100.0.10 or 10.100.0.0/24'
                            }
                        ],
                        onSave(state) {
                            const pa = state.webMgmt.pa;
                            if (!pa.addressTable) pa.addressTable = [];
                            const name  = (pa.newAddrName  || '').trim();
                            const type  = pa.newAddrType   || 'ip-netmask';
                            const value = (pa.newAddrValue  || '').trim();

                            if (name && value) {
                                const exists = pa.addressTable.some(a => a.name === name);
                                if (!exists) {
                                    pa.addressTable.push({ name: name, type: type, value: value });
                                }
                                // Track specific objects
                                if (name === 'WebServer-Internal' && value === '10.100.0.10') {
                                    pa.addr_obj_web = true;
                                }
                                if (name === 'WebServer-Public' && value === '203.0.113.10') {
                                    pa.addr_obj_pub = true;
                                }
                                pa.newAddrName  = '';
                                pa.newAddrValue = '';
                            }
                            pa.configStatus = 'Modified (uncommitted)';
                        }
                    },

                    /* -- Policies > NAT ------------------------- */
                    {
                        id: 'pa-nat',
                        label: 'NAT',
                        group: 'Policies',
                        fields: [
                            {
                                type: 'table',
                                label: 'NAT Rules',
                                statePath: 'webMgmt.pa.natRuleTable',
                                columns: [
                                    { key: 'name',       label: 'Rule Name' },
                                    { key: 'srcZone',    label: 'Src Zone' },
                                    { key: 'dstZone',    label: 'Dst Zone' },
                                    { key: 'srcAddr',    label: 'Src Address' },
                                    { key: 'dstAddr',    label: 'Dst Address' },
                                    { key: 'srcTranslate', label: 'Src Translation' },
                                    { key: 'dstTranslate', label: 'Dst Translation' }
                                ]
                            },
                            /* -- New NAT Rule fields -- */
                            {
                                type: 'text',
                                label: 'Rule Name',
                                statePath: 'webMgmt.pa.natRuleName',
                                placeholder: 'e.g. Source-NAT-Trust-Out'
                            },
                            {
                                type: 'select',
                                label: 'Original Packet: Source Zone',
                                statePath: 'webMgmt.pa.natSrcZone',
                                options: [
                                    { value: '',        label: '-- Select --' },
                                    { value: 'Trust',   label: 'Trust' },
                                    { value: 'DMZ',     label: 'DMZ' },
                                    { value: 'Untrust', label: 'Untrust' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Original Packet: Destination Zone',
                                statePath: 'webMgmt.pa.natDstZone',
                                options: [
                                    { value: '',        label: '-- Select --' },
                                    { value: 'Trust',   label: 'Trust' },
                                    { value: 'DMZ',     label: 'DMZ' },
                                    { value: 'Untrust', label: 'Untrust' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Original Packet: Source Address',
                                statePath: 'webMgmt.pa.natSrcAddr',
                                options: [
                                    { value: 'any',              label: 'any' },
                                    { value: '10.100.0.0/24',   label: '10.100.0.0/24 (Trust subnet)' },
                                    { value: '10.30.0.0/24',    label: '10.30.0.0/24 (VPN subnet)' },
                                    { value: 'WebServer-Internal', label: 'WebServer-Internal' },
                                    { value: 'WebServer-Public',   label: 'WebServer-Public' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Original Packet: Destination Address',
                                statePath: 'webMgmt.pa.natDstAddr',
                                options: [
                                    { value: 'any',              label: 'any' },
                                    { value: '10.100.0.0/24',   label: '10.100.0.0/24 (Trust subnet)' },
                                    { value: '10.30.0.0/24',    label: '10.30.0.0/24 (VPN subnet)' },
                                    { value: 'WebServer-Internal', label: 'WebServer-Internal' },
                                    { value: 'WebServer-Public',   label: 'WebServer-Public' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Source Translation Type',
                                statePath: 'webMgmt.pa.natSrcTransType',
                                options: [
                                    { value: 'none',             label: 'None' },
                                    { value: 'dynamic-ip-port', label: 'Dynamic IP and Port (PAT)' },
                                    { value: 'dynamic-ip',      label: 'Dynamic IP' },
                                    { value: 'static-ip',       label: 'Static IP' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Source Translation: Address Type',
                                statePath: 'webMgmt.pa.natSrcTransAddr',
                                options: [
                                    { value: 'none',              label: 'None' },
                                    { value: 'interface-ip',      label: 'Interface Address (ethernet1/3)' },
                                    { value: '203.0.113.10',      label: '203.0.113.10 (Public IP)' },
                                    { value: '203.0.113.11',      label: '203.0.113.11 (NAT Pool)' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Destination Translation: Address',
                                statePath: 'webMgmt.pa.natDstTransAddr',
                                options: [
                                    { value: 'none',                label: 'None' },
                                    { value: 'WebServer-Internal',  label: 'WebServer-Internal (10.100.0.10)' },
                                    { value: '10.100.0.10',         label: '10.100.0.10' },
                                    { value: '10.100.0.20',         label: '10.100.0.20' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Destination Translation: Ports',
                                statePath: 'webMgmt.pa.natDstTransPorts',
                                options: [
                                    { value: 'none',     label: 'None' },
                                    { value: '80',       label: '80 (HTTP)' },
                                    { value: '443',      label: '443 (HTTPS)' },
                                    { value: '80,443',   label: '80, 443 (HTTP + HTTPS)' },
                                    { value: '22',       label: '22 (SSH)' },
                                    { value: '25',       label: '25 (SMTP)' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const pa = state.webMgmt.pa;
                            if (!pa.natRuleTable) pa.natRuleTable = [];
                            const name = (pa.natRuleName || '').trim();

                            if (name && pa.natSrcZone && pa.natDstZone) {
                                const exists = pa.natRuleTable.some(r => r.name === name);
                                if (!exists) {
                                    const srcTrans = pa.natSrcTransType === 'none' ? 'None' :
                                        pa.natSrcTransType + ' (' + (pa.natSrcTransAddr || 'none') + ')';
                                    const dstTrans = pa.natDstTransAddr === 'none' ? 'None' :
                                        (pa.natDstTransAddr || 'None') + (pa.natDstTransPorts && pa.natDstTransPorts !== 'none' ? ':' + pa.natDstTransPorts : '');

                                    pa.natRuleTable.push({
                                        name: name,
                                        srcZone: pa.natSrcZone,
                                        dstZone: pa.natDstZone,
                                        srcAddr: pa.natSrcAddr || 'any',
                                        dstAddr: pa.natDstAddr || 'any',
                                        srcTranslate: srcTrans,
                                        dstTranslate: dstTrans
                                    });
                                }

                                // Validate Source NAT (Trust -> Untrust, PAT via interface)
                                if (pa.natSrcZone === 'Trust' && pa.natDstZone === 'Untrust' &&
                                    pa.natSrcTransType === 'dynamic-ip-port' && pa.natSrcTransAddr === 'interface-ip' &&
                                    (pa.natDstTransAddr === 'none' || !pa.natDstTransAddr)) {
                                    pa.snat_trust = true;
                                }

                                // Validate Destination NAT (Untrust -> DMZ, WebServer-Public -> WebServer-Internal)
                                if (pa.natSrcZone === 'Untrust' && pa.natDstZone === 'Untrust' &&
                                    pa.natDstAddr === 'WebServer-Public' &&
                                    (pa.natDstTransAddr === 'WebServer-Internal' || pa.natDstTransAddr === '10.100.0.10') &&
                                    pa.natDstTransPorts === '80,443') {
                                    pa.dnat_web = true;
                                }

                                // Validate NAT Exemption (Trust -> Trust, VPN, no-NAT)
                                if (pa.natSrcZone === 'Trust' && pa.natDstZone === 'Trust' &&
                                    pa.natSrcAddr === '10.100.0.0/24' && pa.natDstAddr === '10.30.0.0/24' &&
                                    pa.natSrcTransType === 'none') {
                                    pa.nat_exempt_vpn = true;
                                }

                                // Clear form fields
                                pa.natRuleName = '';
                                pa.natSrcZone = '';
                                pa.natDstZone = '';
                                pa.natSrcAddr = 'any';
                                pa.natDstAddr = 'any';
                                pa.natSrcTransType = 'none';
                                pa.natSrcTransAddr = 'none';
                                pa.natDstTransAddr = 'none';
                                pa.natDstTransPorts = 'none';
                            }
                            pa.configStatus = 'Modified (uncommitted)';
                        }
                    },

                    /* -- Policies > Security -------------------- */
                    {
                        id: 'pa-security',
                        label: 'Security',
                        group: 'Policies',
                        fields: [
                            {
                                type: 'table',
                                label: 'Security Policy Rules',
                                statePath: 'webMgmt.pa.securityRuleTable',
                                columns: [
                                    { key: 'name',    label: 'Rule Name' },
                                    { key: 'srcZone', label: 'Src Zone' },
                                    { key: 'dstZone', label: 'Dst Zone' },
                                    { key: 'srcAddr', label: 'Source' },
                                    { key: 'dstAddr', label: 'Destination' },
                                    { key: 'app',     label: 'Application' },
                                    { key: 'action',  label: 'Action' }
                                ]
                            },
                            /* -- New Security Rule fields -- */
                            {
                                type: 'text',
                                label: 'Rule Name',
                                statePath: 'webMgmt.pa.secRuleName',
                                placeholder: 'e.g. Allow-Trust-to-Internet'
                            },
                            {
                                type: 'select',
                                label: 'Source Zone',
                                statePath: 'webMgmt.pa.secSrcZone',
                                options: [
                                    { value: '',        label: '-- Select --' },
                                    { value: 'Trust',   label: 'Trust' },
                                    { value: 'DMZ',     label: 'DMZ' },
                                    { value: 'Untrust', label: 'Untrust' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Destination Zone',
                                statePath: 'webMgmt.pa.secDstZone',
                                options: [
                                    { value: '',        label: '-- Select --' },
                                    { value: 'Trust',   label: 'Trust' },
                                    { value: 'DMZ',     label: 'DMZ' },
                                    { value: 'Untrust', label: 'Untrust' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Source Address',
                                statePath: 'webMgmt.pa.secSrcAddr',
                                options: [
                                    { value: 'any',              label: 'any' },
                                    { value: '10.100.0.0/24',   label: '10.100.0.0/24 (Trust)' },
                                    { value: '10.30.0.0/24',    label: '10.30.0.0/24 (VPN)' },
                                    { value: 'WebServer-Internal', label: 'WebServer-Internal' },
                                    { value: 'WebServer-Public',   label: 'WebServer-Public' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Destination Address',
                                statePath: 'webMgmt.pa.secDstAddr',
                                options: [
                                    { value: 'any',              label: 'any' },
                                    { value: '10.100.0.0/24',   label: '10.100.0.0/24 (Trust)' },
                                    { value: '10.30.0.0/24',    label: '10.30.0.0/24 (VPN)' },
                                    { value: 'WebServer-Internal', label: 'WebServer-Internal' },
                                    { value: 'WebServer-Public',   label: 'WebServer-Public' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Application',
                                statePath: 'webMgmt.pa.secApp',
                                options: [
                                    { value: 'any',             label: 'any' },
                                    { value: 'web-browsing',    label: 'web-browsing' },
                                    { value: 'ssl',             label: 'ssl' },
                                    { value: 'web-browsing,ssl', label: 'web-browsing, ssl' },
                                    { value: 'dns',             label: 'dns' },
                                    { value: 'ping',            label: 'ping' },
                                    { value: 'ssh',             label: 'ssh' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Action',
                                statePath: 'webMgmt.pa.secAction',
                                options: [
                                    { value: '',      label: '-- Select --' },
                                    { value: 'allow', label: 'Allow' },
                                    { value: 'deny',  label: 'Deny' },
                                    { value: 'drop',  label: 'Drop' },
                                    { value: 'reset-client', label: 'Reset Client' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const pa = state.webMgmt.pa;
                            if (!pa.securityRuleTable) pa.securityRuleTable = [];
                            const name = (pa.secRuleName || '').trim();

                            if (name && pa.secSrcZone && pa.secDstZone && pa.secAction) {
                                const exists = pa.securityRuleTable.some(r => r.name === name);
                                if (!exists) {
                                    pa.securityRuleTable.push({
                                        name: name,
                                        srcZone: pa.secSrcZone,
                                        dstZone: pa.secDstZone,
                                        srcAddr: pa.secSrcAddr || 'any',
                                        dstAddr: pa.secDstAddr || 'any',
                                        app: pa.secApp || 'any',
                                        action: pa.secAction
                                    });
                                }

                                // Validate Trust -> Untrust allow (web-browsing, ssl)
                                if (pa.secSrcZone === 'Trust' && pa.secDstZone === 'Untrust' &&
                                    pa.secAction === 'allow' &&
                                    (pa.secApp === 'web-browsing,ssl' || pa.secApp === 'web-browsing' || pa.secApp === 'ssl')) {
                                    pa.sec_trust_out = true;
                                }

                                // Validate Untrust -> DMZ allow (web-browsing, ssl) to WebServer
                                if (pa.secSrcZone === 'Untrust' && pa.secDstZone === 'DMZ' &&
                                    pa.secAction === 'allow' &&
                                    (pa.secApp === 'web-browsing,ssl' || pa.secApp === 'web-browsing' || pa.secApp === 'ssl') &&
                                    pa.secDstAddr === 'WebServer-Internal') {
                                    pa.sec_untrust_dmz = true;
                                }

                                // Validate Untrust -> Trust deny all
                                if (pa.secSrcZone === 'Untrust' && pa.secDstZone === 'Trust' &&
                                    (pa.secAction === 'deny' || pa.secAction === 'drop') &&
                                    pa.secApp === 'any' && pa.secSrcAddr === 'any' && pa.secDstAddr === 'any') {
                                    pa.sec_deny_inbound = true;
                                }

                                // Clear form fields
                                pa.secRuleName = '';
                                pa.secSrcZone  = '';
                                pa.secDstZone  = '';
                                pa.secSrcAddr  = 'any';
                                pa.secDstAddr  = 'any';
                                pa.secApp      = 'any';
                                pa.secAction   = '';
                            }
                            pa.configStatus = 'Modified (uncommitted)';
                        }
                    },

                    /* -- Monitor > Session Browser --------------- */
                    {
                        id: 'pa-sessions',
                        label: 'Session Browser',
                        group: 'Monitor',
                        fields: [
                            {
                                type: 'table',
                                label: 'Active NAT Translations',
                                statePath: 'webMgmt.pa.sessionTable',
                                columns: [
                                    { key: 'id',      label: 'Session ID' },
                                    { key: 'srcIP',   label: 'Source IP' },
                                    { key: 'dstIP',   label: 'Dest IP' },
                                    { key: 'natSrc',  label: 'NAT Source' },
                                    { key: 'natDst',  label: 'NAT Dest' },
                                    { key: 'app',     label: 'Application' },
                                    { key: 'state',   label: 'State' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Commit Configuration',
                                statePath: 'webMgmt.pa.commitAction',
                                options: [
                                    { value: '',       label: '-- Select Action --' },
                                    { value: 'commit', label: 'Commit All Changes' },
                                    { value: 'revert', label: 'Revert to Last Committed' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const pa = state.webMgmt.pa;
                            if (pa.commitAction === 'commit') {
                                // Require all NAT and security rules to be configured
                                const allConfigured = pa.snat_trust && pa.dnat_web && pa.nat_exempt_vpn &&
                                    pa.sec_trust_out && pa.sec_untrust_dmz && pa.sec_deny_inbound;

                                if (allConfigured) {
                                    pa.configStatus = 'Committed';
                                    pa.committed = true;
                                    // Populate session table with simulated NAT translations
                                    pa.sessionTable = [
                                        { id: '44201', srcIP: '10.100.0.25',  dstIP: '8.8.8.8',       natSrc: '203.0.113.1:54201', natDst: '--',           app: 'dns',            state: 'ACTIVE' },
                                        { id: '44202', srcIP: '10.100.0.31',  dstIP: '93.184.216.34',  natSrc: '203.0.113.1:54202', natDst: '--',           app: 'web-browsing',   state: 'ACTIVE' },
                                        { id: '44203', srcIP: '10.100.0.42',  dstIP: '151.101.1.140',  natSrc: '203.0.113.1:54203', natDst: '--',           app: 'ssl',            state: 'ACTIVE' },
                                        { id: '44204', srcIP: '198.51.100.5', dstIP: '203.0.113.10',   natSrc: '--',                natDst: '10.100.0.10',  app: 'web-browsing',   state: 'ACTIVE' },
                                        { id: '44205', srcIP: '198.51.100.8', dstIP: '203.0.113.10',   natSrc: '--',                natDst: '10.100.0.10',  app: 'ssl',            state: 'ACTIVE' },
                                        { id: '44206', srcIP: '10.100.0.50',  dstIP: '10.30.0.15',     natSrc: '10.100.0.50',       natDst: '10.30.0.15',   app: 'ipsec',          state: 'ACTIVE' }
                                    ];
                                    pa.sessions = '1,253';
                                } else {
                                    pa.configStatus = 'Commit failed: incomplete configuration';
                                }
                                pa.commitAction = '';
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
            pa: {
                hostname: 'MeridianFW-01',
                model: 'PA-220',
                panos: '11.1.2-h3',
                serial: '012345678901',
                uptime: '47 days, 12:04:31',
                sessions: '1,247',
                threats: '38',
                configStatus: 'Committed',

                /* Interfaces (pre-configured) */
                interfaceTable: [
                    { name: 'ethernet1/1', type: 'Layer3', ip: '10.100.0.1/24',    zone: 'Trust',   status: 'up' },
                    { name: 'ethernet1/2', type: 'Layer3', ip: '10.200.0.1/24',    zone: 'DMZ',     status: 'up' },
                    { name: 'ethernet1/3', type: 'Layer3', ip: '203.0.113.1/24',   zone: 'Untrust', status: 'up' },
                    { name: 'loopback.1',  type: 'Loopback', ip: '192.168.1.1/32', zone: 'Trust',   status: 'up' }
                ],

                /* Zones (pre-configured) */
                zoneTable: [
                    { name: 'Trust',   type: 'Layer3', interfaces: 'ethernet1/1, loopback.1', protection: 'Recommended' },
                    { name: 'DMZ',     type: 'Layer3', interfaces: 'ethernet1/2',             protection: 'Strict' },
                    { name: 'Untrust', type: 'Layer3', interfaces: 'ethernet1/3',             protection: 'Strict' }
                ],

                /* Address objects (empty, student creates) */
                addressTable: [],
                newAddrName: '',
                newAddrType: 'ip-netmask',
                newAddrValue: '',
                addr_obj_web: false,
                addr_obj_pub: false,

                /* NAT rules (empty, student creates) */
                natRuleTable: [],
                natRuleName: '',
                natSrcZone: '',
                natDstZone: '',
                natSrcAddr: 'any',
                natDstAddr: 'any',
                natSrcTransType: 'none',
                natSrcTransAddr: 'none',
                natDstTransAddr: 'none',
                natDstTransPorts: 'none',
                snat_trust: false,
                dnat_web: false,
                nat_exempt_vpn: false,

                /* Security rules (empty, student creates) */
                securityRuleTable: [
                    { name: 'intrazone-default', srcZone: 'any', dstZone: 'any', srcAddr: 'any', dstAddr: 'any', app: 'any', action: 'allow (intrazone)' },
                    { name: 'interzone-default', srcZone: 'any', dstZone: 'any', srcAddr: 'any', dstAddr: 'any', app: 'any', action: 'deny (interzone)' }
                ],
                secRuleName: '',
                secSrcZone: '',
                secDstZone: '',
                secSrcAddr: 'any',
                secDstAddr: 'any',
                secApp: 'any',
                secAction: '',
                sec_trust_out: false,
                sec_untrust_dmz: false,
                sec_deny_inbound: false,

                /* Session browser */
                sessionTable: [
                    { id: '--', srcIP: '--', dstIP: '--', natSrc: '--', natDst: '--', app: '--', state: 'No active translations' }
                ],
                commitAction: '',
                committed: false
            }
        }
    },

    /* -- 10 Tasks --------------------------------------------- */
    tasks: [
        /* Task 1: Open browser -> access Palo Alto web UI */
        {
            id: 'task-01-open-pa',
            title: '1. Access Palo Alto Web Interface',
            description: 'Double-click the "PA-220 Mgmt" icon on the desktop to open the Palo Alto firewall management interface at 192.168.1.1.',
            verify: {
                type: 'window_opened',
                window: 'web_mgmt'
            }
        },
        /* Task 2: Create address object WebServer-Internal */
        {
            id: 'task-02-addr-web-int',
            title: '2. Create Address Object: WebServer-Internal',
            description: 'Navigate to Objects > Addresses. Create an address object named "WebServer-Internal" with IP address 10.100.0.10 (IP Netmask type). Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.pa.addr_obj_web',
                value: true
            }
        },
        /* Task 3: Create address object WebServer-Public */
        {
            id: 'task-03-addr-web-pub',
            title: '3. Create Address Object: WebServer-Public',
            description: 'Still in Objects > Addresses, create a second address object named "WebServer-Public" with IP address 203.0.113.10 (IP Netmask type). Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.pa.addr_obj_pub',
                value: true
            }
        },
        /* Task 4: Source NAT - Trust -> Untrust (PAT) */
        {
            id: 'task-04-snat-trust',
            title: '4. Configure Source NAT: Trust to Untrust (PAT)',
            description: 'Navigate to Policies > NAT. Add a source NAT rule: Source Zone = Trust, Destination Zone = Untrust, Source Translation = Dynamic IP and Port using the egress interface address (ethernet1/3). Leave destination translation as None. Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.pa.snat_trust',
                value: true
            }
        },
        /* Task 5: Destination NAT - Untrust -> DMZ (web server) */
        {
            id: 'task-05-dnat-web',
            title: '5. Configure Destination NAT: Public Web Server',
            description: 'Add a destination NAT rule: Source Zone = Untrust, Destination Zone = Untrust, Destination Address = WebServer-Public. Translate destination to WebServer-Internal on ports 80,443. Source translation = None. Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.pa.dnat_web',
                value: true
            }
        },
        /* Task 6: NAT Exemption - VPN traffic */
        {
            id: 'task-06-nat-exempt',
            title: '6. Configure NAT Exemption: VPN Traffic',
            description: 'Add a no-NAT rule for VPN traffic: Source Zone = Trust, Destination Zone = Trust, Source Address = 10.100.0.0/24, Destination Address = 10.30.0.0/24 (VPN subnet). Source Translation = None, Destination Translation = None. Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.pa.nat_exempt_vpn',
                value: true
            }
        },
        /* Task 7: Security policy - Trust -> Untrust allow web */
        {
            id: 'task-07-sec-trust-out',
            title: '7. Security Policy: Allow Trust to Untrust',
            description: 'Navigate to Policies > Security. Add a rule allowing Trust zone to Untrust zone for web-browsing and ssl applications. Action = Allow. Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.pa.sec_trust_out',
                value: true
            }
        },
        /* Task 8: Security policy - Untrust -> DMZ allow web to server */
        {
            id: 'task-08-sec-untrust-dmz',
            title: '8. Security Policy: Allow Untrust to DMZ Web Server',
            description: 'Add a rule allowing Untrust zone to DMZ zone for web-browsing and ssl, with destination address = WebServer-Internal. Action = Allow. Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.pa.sec_untrust_dmz',
                value: true
            }
        },
        /* Task 9: Security policy - Deny Untrust -> Trust */
        {
            id: 'task-09-sec-deny-inbound',
            title: '9. Security Policy: Deny Untrust to Trust',
            description: 'Add an explicit deny rule: Untrust zone to Trust zone, any application, any source/destination address. Action = Deny. Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.pa.sec_deny_inbound',
                value: true
            }
        },
        /* Task 10: Commit and verify */
        {
            id: 'task-10-commit-verify',
            title: '10. Commit Changes and Verify NAT Translations',
            description: 'Navigate to Monitor > Session Browser. Select "Commit All Changes" from the Commit Configuration dropdown and click Apply. Verify that NAT translations appear in the session table and config status shows "Committed".',
            verify: {
                type: 'state_value',
                path: 'webMgmt.pa.committed',
                value: true
            }
        }
    ]
};
