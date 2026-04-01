/* ============================================================
   gui-ne06-dns-dhcp-console.config.js
   Network+ NE-06 — DNS & DHCP Server Configuration GUI Lab
   Hexworth Prime — Network+ Course
   2026-03-27

   SCENARIO: Configure DNS and DHCP services on Windows Server
   for the new meridian.local domain. Create forward/reverse
   zones, add host records, configure DHCP scopes for three
   subnets, create reservations, and verify name resolution.
   ============================================================ */

const GUI_NE06_DNS_DHCP_CONSOLE_CONFIG = {

    id: 'gui-ne06-dns-dhcp-console',
    title: 'NE-06: DNS & DHCP Server Configuration Lab',
    subtitle: 'Configure DNS zones, host records, DHCP scopes, and reservations for meridian.local',
    duration: 1800, // 30 minutes
    sequentialTasks: true,

    certObjectives: [
        'N10-009 1.6: Explain the use and purpose of network services (DNS, DHCP)',
        'N10-009 3.1: Given a scenario, determine the best place to install and configure network services'
    ],

    scoring: {
        taskPoints: 38,
        timeBonus: 100,
        maxScore: 556
    },

    /* -- Known domains for nslookup verification -------------- */
    knownDomains: {
        'dc01.meridian.local':       '10.0.0.10',
        'mail.meridian.local':       '10.0.0.20',
        'www.meridian.local':        '10.0.0.30',
        'intranet.meridian.local':   '10.0.0.30',
        'meridian.local':            '10.0.0.10'
    },

    /* -- Desktop Icons ---------------------------------------- */
    desktop: [
        /* ---- DNS Manager ------------------------------------ */
        {
            id: 'dns-manager',
            label: 'DNS Manager',
            icon: 'browser',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'DNS Manager -- DC01.meridian.local',
                sections: [
                    /* -- Server Status ----------------------- */
                    {
                        id: 'dns-status',
                        label: 'Server Status',
                        group: 'DNS Server',
                        saveable: false,
                        fields: [
                            { type: 'info', label: 'Server Name',     statePath: 'webMgmt.dns.serverName',     default: 'DC01.meridian.local' },
                            { type: 'info', label: 'Server IP',       statePath: 'webMgmt.dns.serverIp',       default: '10.0.0.10' },
                            { type: 'info', label: 'OS Version',      statePath: 'webMgmt.dns.osVersion',      default: 'Windows Server 2022 Datacenter' },
                            { type: 'info', label: 'DNS Service',     statePath: 'webMgmt.dns.serviceStatus',  default: 'Running' },
                            { type: 'info', label: 'Zones Loaded',    statePath: 'webMgmt.dns.zonesLoaded',    default: '0' },
                            { type: 'info', label: 'Cache Entries',   statePath: 'webMgmt.dns.cacheEntries',   default: '0' },
                            { type: 'info', label: 'Recursive Queries', statePath: 'webMgmt.dns.recursiveQry', default: '0' }
                        ]
                    },
                    /* -- Forward Lookup Zones ----------------- */
                    {
                        id: 'dns-forward-zones',
                        label: 'Forward Zones',
                        group: 'DNS Server',
                        fields: [
                            {
                                type: 'table',
                                label: 'Forward Lookup Zones',
                                statePath: 'webMgmt.dns.forwardZones',
                                columns: [
                                    { key: 'name',   label: 'Zone Name' },
                                    { key: 'type',   label: 'Type' },
                                    { key: 'status', label: 'Status' },
                                    { key: 'records', label: 'Records' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Create Forward Zone',
                                statePath: 'webMgmt.dns.createForwardZone',
                                options: [
                                    { value: '',                label: '-- Select Zone to Create --' },
                                    { value: 'meridian.local',  label: 'Primary Zone: meridian.local' },
                                    { value: 'corp.local',      label: 'Primary Zone: corp.local' },
                                    { value: 'test.local',      label: 'Primary Zone: test.local' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const d = state.webMgmt.dns;
                            if (!d.forwardZones) d.forwardZones = [];
                            const has = (n) => d.forwardZones.some(z => z.name === n);

                            const sel = d.createForwardZone;
                            if (sel && !has(sel)) {
                                d.forwardZones.push({ name: sel, type: 'Primary', status: 'Running', records: '1 (SOA)' });
                            }

                            d.meridianZoneCreated = has('meridian.local');
                            d.createForwardZone = '';

                            // Update zone count
                            const totalZones = d.forwardZones.length + (d.reverseZones ? d.reverseZones.length : 0);
                            d.zonesLoaded = String(totalZones);
                        }
                    },
                    /* -- A Records (meridian.local) ----------- */
                    {
                        id: 'dns-a-records',
                        label: 'A Records',
                        group: 'Forward Zones',
                        fields: [
                            {
                                type: 'table',
                                label: 'Host (A) Records -- meridian.local',
                                statePath: 'webMgmt.dns.aRecords',
                                columns: [
                                    { key: 'host',  label: 'Host Name' },
                                    { key: 'type',  label: 'Type' },
                                    { key: 'ip',    label: 'IP Address' },
                                    { key: 'ttl',   label: 'TTL' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Add Host Record',
                                statePath: 'webMgmt.dns.addARecord',
                                options: [
                                    { value: '',         label: '-- Select Record to Add --' },
                                    { value: 'dc01',     label: 'dc01 -> 10.0.0.10 (Domain Controller)' },
                                    { value: 'mail',     label: 'mail -> 10.0.0.20 (Mail Server)' },
                                    { value: 'www',      label: 'www -> 10.0.0.30 (Web Server)' },
                                    { value: 'ftp',      label: 'ftp -> 10.0.0.40 (FTP Server)' },
                                    { value: 'db01',     label: 'db01 -> 10.0.0.50 (Database Server)' }
                                ]
                            },
                            { type: 'text', label: 'Custom Host Name', statePath: 'webMgmt.dns.customAHost', placeholder: 'e.g. fileserv' },
                            { type: 'text', label: 'Custom IP Address', statePath: 'webMgmt.dns.customAIp', placeholder: 'e.g. 10.0.0.60' }
                        ],
                        onSave(state) {
                            const d = state.webMgmt.dns;
                            if (!d.meridianZoneCreated) return; // Zone must exist first
                            if (!d.aRecords) d.aRecords = [];
                            const has = (h) => d.aRecords.some(r => r.host === h);

                            const recordMap = {
                                dc01: { host: 'dc01', type: 'A', ip: '10.0.0.10', ttl: '3600' },
                                mail: { host: 'mail', type: 'A', ip: '10.0.0.20', ttl: '3600' },
                                www:  { host: 'www',  type: 'A', ip: '10.0.0.30', ttl: '3600' },
                                ftp:  { host: 'ftp',  type: 'A', ip: '10.0.0.40', ttl: '3600' },
                                db01: { host: 'db01', type: 'A', ip: '10.0.0.50', ttl: '3600' }
                            };

                            const sel = d.addARecord;
                            if (sel && recordMap[sel] && !has(sel)) {
                                d.aRecords.push(recordMap[sel]);
                            }

                            // Custom A record
                            if (d.customAHost && d.customAIp && !has(d.customAHost)) {
                                d.aRecords.push({ host: d.customAHost, type: 'A', ip: d.customAIp, ttl: '3600' });
                                d.customAHost = '';
                                d.customAIp = '';
                            }

                            d.dc01RecordCreated = has('dc01');
                            d.mailRecordCreated = has('mail');
                            d.wwwRecordCreated = has('www');
                            d.allARecordsCreated = d.dc01RecordCreated && d.mailRecordCreated && d.wwwRecordCreated;
                            d.addARecord = '';

                            // Update zone record count
                            const fz = d.forwardZones.find(z => z.name === 'meridian.local');
                            if (fz) {
                                const total = d.aRecords.length + (d.mxRecords ? d.mxRecords.length : 0) + (d.cnameRecords ? d.cnameRecords.length : 0) + 1;
                                fz.records = String(total) + ' (SOA + hosts)';
                            }
                        }
                    },
                    /* -- MX Records --------------------------- */
                    {
                        id: 'dns-mx-records',
                        label: 'MX Records',
                        group: 'Forward Zones',
                        fields: [
                            {
                                type: 'table',
                                label: 'Mail Exchanger (MX) Records -- meridian.local',
                                statePath: 'webMgmt.dns.mxRecords',
                                columns: [
                                    { key: 'domain',   label: 'Domain' },
                                    { key: 'type',     label: 'Type' },
                                    { key: 'mailHost', label: 'Mail Server' },
                                    { key: 'priority', label: 'Priority' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Add MX Record',
                                statePath: 'webMgmt.dns.addMxRecord',
                                options: [
                                    { value: '',        label: '-- Select MX Record --' },
                                    { value: 'mail-10', label: 'meridian.local -> mail.meridian.local (Priority 10)' },
                                    { value: 'mail-20', label: 'meridian.local -> mail.meridian.local (Priority 20)' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const d = state.webMgmt.dns;
                            if (!d.meridianZoneCreated) return;
                            if (!d.mxRecords) d.mxRecords = [];

                            const sel = d.addMxRecord;
                            if (sel === 'mail-10' && !d.mxRecords.some(r => r.priority === '10')) {
                                d.mxRecords.push({ domain: 'meridian.local', type: 'MX', mailHost: 'mail.meridian.local', priority: '10' });
                            }
                            if (sel === 'mail-20' && !d.mxRecords.some(r => r.priority === '20')) {
                                d.mxRecords.push({ domain: 'meridian.local', type: 'MX', mailHost: 'mail.meridian.local', priority: '20' });
                            }

                            d.mxRecordCreated = d.mxRecords.some(r => r.priority === '10');
                            d.addMxRecord = '';
                        }
                    },
                    /* -- CNAME Records ------------------------ */
                    {
                        id: 'dns-cname-records',
                        label: 'CNAME Records',
                        group: 'Forward Zones',
                        fields: [
                            {
                                type: 'table',
                                label: 'Alias (CNAME) Records -- meridian.local',
                                statePath: 'webMgmt.dns.cnameRecords',
                                columns: [
                                    { key: 'alias',  label: 'Alias Name' },
                                    { key: 'type',   label: 'Type' },
                                    { key: 'target', label: 'Target Host' },
                                    { key: 'ttl',    label: 'TTL' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Add CNAME Record',
                                statePath: 'webMgmt.dns.addCnameRecord',
                                options: [
                                    { value: '',                    label: '-- Select CNAME Record --' },
                                    { value: 'intranet-www',        label: 'intranet -> www.meridian.local' },
                                    { value: 'webmail-mail',        label: 'webmail -> mail.meridian.local' },
                                    { value: 'portal-www',          label: 'portal -> www.meridian.local' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const d = state.webMgmt.dns;
                            if (!d.meridianZoneCreated) return;
                            if (!d.cnameRecords) d.cnameRecords = [];
                            const has = (a) => d.cnameRecords.some(r => r.alias === a);

                            const sel = d.addCnameRecord;
                            if (sel === 'intranet-www' && !has('intranet')) {
                                d.cnameRecords.push({ alias: 'intranet', type: 'CNAME', target: 'www.meridian.local', ttl: '3600' });
                            }
                            if (sel === 'webmail-mail' && !has('webmail')) {
                                d.cnameRecords.push({ alias: 'webmail', type: 'CNAME', target: 'mail.meridian.local', ttl: '3600' });
                            }
                            if (sel === 'portal-www' && !has('portal')) {
                                d.cnameRecords.push({ alias: 'portal', type: 'CNAME', target: 'www.meridian.local', ttl: '3600' });
                            }

                            d.cnameCreated = has('intranet');
                            d.addCnameRecord = '';
                        }
                    },
                    /* -- Reverse Lookup Zones ------------------ */
                    {
                        id: 'dns-reverse-zones',
                        label: 'Reverse Zones',
                        group: 'DNS Server',
                        fields: [
                            {
                                type: 'table',
                                label: 'Reverse Lookup Zones',
                                statePath: 'webMgmt.dns.reverseZones',
                                columns: [
                                    { key: 'name',   label: 'Zone Name' },
                                    { key: 'type',   label: 'Type' },
                                    { key: 'status', label: 'Status' },
                                    { key: 'records', label: 'PTR Records' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Create Reverse Zone',
                                statePath: 'webMgmt.dns.createReverseZone',
                                options: [
                                    { value: '',             label: '-- Select Reverse Zone --' },
                                    { value: '0.0.10',       label: '10.0.0.x (0.0.10.in-addr.arpa)' },
                                    { value: '1.0.10',       label: '10.0.1.x (1.0.10.in-addr.arpa)' },
                                    { value: '168.192',      label: '192.168.x.x (168.192.in-addr.arpa)' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Add PTR Record',
                                statePath: 'webMgmt.dns.addPtrRecord',
                                options: [
                                    { value: '',          label: '-- Select PTR Record --' },
                                    { value: 'ptr-dc01',  label: '10.0.0.10 -> dc01.meridian.local' },
                                    { value: 'ptr-mail',  label: '10.0.0.20 -> mail.meridian.local' },
                                    { value: 'ptr-www',   label: '10.0.0.30 -> www.meridian.local' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const d = state.webMgmt.dns;
                            if (!d.reverseZones) d.reverseZones = [];
                            if (!d.ptrRecords) d.ptrRecords = [];

                            const sel = d.createReverseZone;
                            const hasZone = (n) => d.reverseZones.some(z => z.name === n);
                            if (sel && !hasZone(sel)) {
                                d.reverseZones.push({ name: sel, type: 'Primary', status: 'Running', records: '0' });
                            }
                            d.reverseZoneCreated = hasZone('0.0.10');
                            d.createReverseZone = '';

                            // Add PTR records
                            const ptrSel = d.addPtrRecord;
                            const hasPtr = (ip) => d.ptrRecords.some(r => r.ip === ip);
                            const ptrMap = {
                                'ptr-dc01': { ip: '10.0.0.10', host: 'dc01.meridian.local', octet: '10' },
                                'ptr-mail': { ip: '10.0.0.20', host: 'mail.meridian.local', octet: '20' },
                                'ptr-www':  { ip: '10.0.0.30', host: 'www.meridian.local',  octet: '30' }
                            };
                            if (ptrSel && ptrMap[ptrSel] && d.reverseZoneCreated && !hasPtr(ptrMap[ptrSel].ip)) {
                                d.ptrRecords.push(ptrMap[ptrSel]);
                            }

                            d.ptrDc01Created = hasPtr('10.0.0.10');
                            d.addPtrRecord = '';

                            // Update reverse zone record count
                            const rz = d.reverseZones.find(z => z.name === '0.0.10');
                            if (rz) {
                                rz.records = String(d.ptrRecords.length);
                            }

                            // Update total zone count
                            const totalZones = (d.forwardZones ? d.forwardZones.length : 0) + d.reverseZones.length;
                            d.zonesLoaded = String(totalZones);
                        }
                    },
                    /* -- Forwarders --------------------------- */
                    {
                        id: 'dns-forwarders',
                        label: 'Forwarders',
                        group: 'DNS Server',
                        fields: [
                            {
                                type: 'table',
                                label: 'DNS Forwarders',
                                statePath: 'webMgmt.dns.forwarderTable',
                                columns: [
                                    { key: 'ip',     label: 'IP Address' },
                                    { key: 'status', label: 'Status' },
                                    { key: 'rtt',    label: 'Response Time' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Add Forwarder',
                                statePath: 'webMgmt.dns.addForwarder',
                                options: [
                                    { value: '',          label: '-- Select Forwarder --' },
                                    { value: '8.8.8.8',   label: '8.8.8.8 (Google Public DNS)' },
                                    { value: '8.8.4.4',   label: '8.8.4.4 (Google Public DNS Secondary)' },
                                    { value: '1.1.1.1',   label: '1.1.1.1 (Cloudflare DNS)' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const d = state.webMgmt.dns;
                            if (!d.forwarderTable) d.forwarderTable = [];
                            const sel = d.addForwarder;
                            const has = (ip) => d.forwarderTable.some(f => f.ip === ip);
                            if (sel && !has(sel)) {
                                d.forwarderTable.push({ ip: sel, status: 'OK', rtt: '12ms' });
                            }
                            d.addForwarder = '';
                        }
                    }
                ]
            }
        },
        /* ---- DHCP Console ----------------------------------- */
        {
            id: 'dhcp-console',
            label: 'DHCP Console',
            icon: 'browser',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'DHCP Console -- DC01.meridian.local',
                sections: [
                    /* -- DHCP Server Status -------------------- */
                    {
                        id: 'dhcp-status',
                        label: 'Server Status',
                        group: 'DHCP Server',
                        saveable: false,
                        fields: [
                            { type: 'info', label: 'Server Name',      statePath: 'webMgmt.dhcp.serverName',     default: 'DC01.meridian.local' },
                            { type: 'info', label: 'Server IP',        statePath: 'webMgmt.dhcp.serverIp',       default: '10.0.0.10' },
                            { type: 'info', label: 'DHCP Service',     statePath: 'webMgmt.dhcp.serviceStatus',  default: 'Running' },
                            { type: 'info', label: 'Active Scopes',    statePath: 'webMgmt.dhcp.activeScopes',   default: '0' },
                            { type: 'info', label: 'Total Leases',     statePath: 'webMgmt.dhcp.totalLeases',    default: '0' },
                            { type: 'info', label: 'Reservations',     statePath: 'webMgmt.dhcp.totalRes',       default: '0' },
                            { type: 'info', label: 'Authorization',    statePath: 'webMgmt.dhcp.authorization',  default: 'Authorized in AD' }
                        ]
                    },
                    /* -- Scope 1: Server VLAN (10.0.0.x) ------ */
                    {
                        id: 'dhcp-scope1',
                        label: 'Scope 1',
                        group: 'Scopes',
                        fields: [
                            {
                                type: 'table',
                                label: 'Scope 1 -- Server VLAN (10.0.0.0/24)',
                                statePath: 'webMgmt.dhcp.scope1Table',
                                columns: [
                                    { key: 'setting', label: 'Setting' },
                                    { key: 'value',   label: 'Value' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Create Scope 1',
                                statePath: 'webMgmt.dhcp.createScope1',
                                options: [
                                    { value: '',       label: '-- Select Scope --' },
                                    { value: 'create', label: 'Server VLAN: 10.0.0.100 - 10.0.0.200 (/24)' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Default Gateway (Option 003)',
                                statePath: 'webMgmt.dhcp.scope1Gateway',
                                options: [
                                    { value: '',          label: '-- Select Gateway --' },
                                    { value: '10.0.0.1',  label: '10.0.0.1' },
                                    { value: '10.0.0.10', label: '10.0.0.10' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'DNS Server (Option 006)',
                                statePath: 'webMgmt.dhcp.scope1Dns',
                                options: [
                                    { value: '',           label: '-- Select DNS Server --' },
                                    { value: '10.0.0.10',  label: '10.0.0.10 (DC01)' },
                                    { value: '8.8.8.8',    label: '8.8.8.8 (Google)' }
                                ]
                            },
                            { type: 'text', label: 'DNS Domain (Option 015)', statePath: 'webMgmt.dhcp.scope1Domain', placeholder: 'meridian.local' },
                            {
                                type: 'select',
                                label: 'Lease Duration',
                                statePath: 'webMgmt.dhcp.scope1Lease',
                                options: [
                                    { value: '',       label: '-- Select Duration --' },
                                    { value: '8h',     label: '8 Hours' },
                                    { value: '1d',     label: '1 Day' },
                                    { value: '8d',     label: '8 Days (Default)' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const dh = state.webMgmt.dhcp;
                            if (dh.createScope1 === 'create') {
                                dh.scope1Created = true;
                                dh.scope1Table = [
                                    { setting: 'Scope Name',   value: 'Server VLAN' },
                                    { setting: 'Start IP',     value: '10.0.0.100' },
                                    { setting: 'End IP',       value: '10.0.0.200' },
                                    { setting: 'Subnet Mask',  value: '255.255.255.0' },
                                    { setting: 'Gateway',      value: dh.scope1Gateway || '(not set)' },
                                    { setting: 'DNS Server',   value: dh.scope1Dns || '(not set)' },
                                    { setting: 'Domain',       value: dh.scope1Domain || '(not set)' },
                                    { setting: 'Lease',        value: dh.scope1Lease || '(not set)' },
                                    { setting: 'Status',       value: 'Active' }
                                ];
                            } else if (dh.scope1Created) {
                                // Update existing scope options
                                dh.scope1Table = [
                                    { setting: 'Scope Name',   value: 'Server VLAN' },
                                    { setting: 'Start IP',     value: '10.0.0.100' },
                                    { setting: 'End IP',       value: '10.0.0.200' },
                                    { setting: 'Subnet Mask',  value: '255.255.255.0' },
                                    { setting: 'Gateway',      value: dh.scope1Gateway || '(not set)' },
                                    { setting: 'DNS Server',   value: dh.scope1Dns || '(not set)' },
                                    { setting: 'Domain',       value: dh.scope1Domain || '(not set)' },
                                    { setting: 'Lease',        value: dh.scope1Lease || '(not set)' },
                                    { setting: 'Status',       value: 'Active' }
                                ];
                            }

                            dh.scope1Configured = (
                                dh.scope1Created === true &&
                                dh.scope1Gateway === '10.0.0.1' &&
                                dh.scope1Dns === '10.0.0.10' &&
                                dh.scope1Domain === 'meridian.local' &&
                                dh.scope1Lease === '8d'
                            );

                            dh.createScope1 = '';
                            _updateDhcpCounts(dh);
                        }
                    },
                    /* -- Scope 2: Workstation VLAN (10.0.1.x) - */
                    {
                        id: 'dhcp-scope2',
                        label: 'Scope 2',
                        group: 'Scopes',
                        fields: [
                            {
                                type: 'table',
                                label: 'Scope 2 -- Workstation VLAN (10.0.1.0/24)',
                                statePath: 'webMgmt.dhcp.scope2Table',
                                columns: [
                                    { key: 'setting', label: 'Setting' },
                                    { key: 'value',   label: 'Value' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Create Scope 2',
                                statePath: 'webMgmt.dhcp.createScope2',
                                options: [
                                    { value: '',       label: '-- Select Scope --' },
                                    { value: 'create', label: 'Workstation VLAN: 10.0.1.100 - 10.0.1.250 (/24)' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Default Gateway (Option 003)',
                                statePath: 'webMgmt.dhcp.scope2Gateway',
                                options: [
                                    { value: '',          label: '-- Select Gateway --' },
                                    { value: '10.0.1.1',  label: '10.0.1.1' },
                                    { value: '10.0.1.10', label: '10.0.1.10' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'DNS Server (Option 006)',
                                statePath: 'webMgmt.dhcp.scope2Dns',
                                options: [
                                    { value: '',           label: '-- Select DNS Server --' },
                                    { value: '10.0.0.10',  label: '10.0.0.10 (DC01)' },
                                    { value: '8.8.8.8',    label: '8.8.8.8 (Google)' }
                                ]
                            },
                            { type: 'text', label: 'DNS Domain (Option 015)', statePath: 'webMgmt.dhcp.scope2Domain', placeholder: 'meridian.local' },
                            {
                                type: 'select',
                                label: 'Lease Duration',
                                statePath: 'webMgmt.dhcp.scope2Lease',
                                options: [
                                    { value: '',       label: '-- Select Duration --' },
                                    { value: '8h',     label: '8 Hours' },
                                    { value: '1d',     label: '1 Day' },
                                    { value: '8d',     label: '8 Days (Default)' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const dh = state.webMgmt.dhcp;
                            if (dh.createScope2 === 'create') {
                                dh.scope2Created = true;
                                dh.scope2Table = [
                                    { setting: 'Scope Name',   value: 'Workstation VLAN' },
                                    { setting: 'Start IP',     value: '10.0.1.100' },
                                    { setting: 'End IP',       value: '10.0.1.250' },
                                    { setting: 'Subnet Mask',  value: '255.255.255.0' },
                                    { setting: 'Gateway',      value: dh.scope2Gateway || '(not set)' },
                                    { setting: 'DNS Server',   value: dh.scope2Dns || '(not set)' },
                                    { setting: 'Domain',       value: dh.scope2Domain || '(not set)' },
                                    { setting: 'Lease',        value: dh.scope2Lease || '(not set)' },
                                    { setting: 'Status',       value: 'Active' }
                                ];
                            } else if (dh.scope2Created) {
                                dh.scope2Table = [
                                    { setting: 'Scope Name',   value: 'Workstation VLAN' },
                                    { setting: 'Start IP',     value: '10.0.1.100' },
                                    { setting: 'End IP',       value: '10.0.1.250' },
                                    { setting: 'Subnet Mask',  value: '255.255.255.0' },
                                    { setting: 'Gateway',      value: dh.scope2Gateway || '(not set)' },
                                    { setting: 'DNS Server',   value: dh.scope2Dns || '(not set)' },
                                    { setting: 'Domain',       value: dh.scope2Domain || '(not set)' },
                                    { setting: 'Lease',        value: dh.scope2Lease || '(not set)' },
                                    { setting: 'Status',       value: 'Active' }
                                ];
                            }

                            dh.scope2Configured = (
                                dh.scope2Created === true &&
                                dh.scope2Gateway === '10.0.1.1' &&
                                dh.scope2Dns === '10.0.0.10' &&
                                dh.scope2Domain === 'meridian.local' &&
                                dh.scope2Lease === '8d'
                            );

                            dh.createScope2 = '';
                            _updateDhcpCounts(dh);
                        }
                    },
                    /* -- Scope 3: Guest VLAN (10.0.2.x) ------- */
                    {
                        id: 'dhcp-scope3',
                        label: 'Scope 3',
                        group: 'Scopes',
                        fields: [
                            {
                                type: 'table',
                                label: 'Scope 3 -- Guest VLAN (10.0.2.0/24)',
                                statePath: 'webMgmt.dhcp.scope3Table',
                                columns: [
                                    { key: 'setting', label: 'Setting' },
                                    { key: 'value',   label: 'Value' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Create Scope 3',
                                statePath: 'webMgmt.dhcp.createScope3',
                                options: [
                                    { value: '',       label: '-- Select Scope --' },
                                    { value: 'create', label: 'Guest VLAN: 10.0.2.100 - 10.0.2.200 (/24)' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Default Gateway (Option 003)',
                                statePath: 'webMgmt.dhcp.scope3Gateway',
                                options: [
                                    { value: '',          label: '-- Select Gateway --' },
                                    { value: '10.0.2.1',  label: '10.0.2.1' },
                                    { value: '10.0.2.10', label: '10.0.2.10' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'DNS Server (Option 006)',
                                statePath: 'webMgmt.dhcp.scope3Dns',
                                options: [
                                    { value: '',           label: '-- Select DNS Server --' },
                                    { value: '10.0.0.10',  label: '10.0.0.10 (DC01)' },
                                    { value: '8.8.8.8',    label: '8.8.8.8 (Google)' }
                                ]
                            },
                            { type: 'text', label: 'DNS Domain (Option 015)', statePath: 'webMgmt.dhcp.scope3Domain', placeholder: 'meridian.local' },
                            {
                                type: 'select',
                                label: 'Lease Duration',
                                statePath: 'webMgmt.dhcp.scope3Lease',
                                options: [
                                    { value: '',       label: '-- Select Duration --' },
                                    { value: '4h',     label: '4 Hours' },
                                    { value: '8h',     label: '8 Hours' },
                                    { value: '1d',     label: '1 Day' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const dh = state.webMgmt.dhcp;
                            if (dh.createScope3 === 'create') {
                                dh.scope3Created = true;
                                dh.scope3Table = [
                                    { setting: 'Scope Name',   value: 'Guest VLAN' },
                                    { setting: 'Start IP',     value: '10.0.2.100' },
                                    { setting: 'End IP',       value: '10.0.2.200' },
                                    { setting: 'Subnet Mask',  value: '255.255.255.0' },
                                    { setting: 'Gateway',      value: dh.scope3Gateway || '(not set)' },
                                    { setting: 'DNS Server',   value: dh.scope3Dns || '(not set)' },
                                    { setting: 'Domain',       value: dh.scope3Domain || '(not set)' },
                                    { setting: 'Lease',        value: dh.scope3Lease || '(not set)' },
                                    { setting: 'Status',       value: 'Active' }
                                ];
                            } else if (dh.scope3Created) {
                                dh.scope3Table = [
                                    { setting: 'Scope Name',   value: 'Guest VLAN' },
                                    { setting: 'Start IP',     value: '10.0.2.100' },
                                    { setting: 'End IP',       value: '10.0.2.200' },
                                    { setting: 'Subnet Mask',  value: '255.255.255.0' },
                                    { setting: 'Gateway',      value: dh.scope3Gateway || '(not set)' },
                                    { setting: 'DNS Server',   value: dh.scope3Dns || '(not set)' },
                                    { setting: 'Domain',       value: dh.scope3Domain || '(not set)' },
                                    { setting: 'Lease',        value: dh.scope3Lease || '(not set)' },
                                    { setting: 'Status',       value: 'Active' }
                                ];
                            }

                            dh.scope3Configured = (
                                dh.scope3Created === true &&
                                dh.scope3Gateway === '10.0.2.1' &&
                                dh.scope3Dns === '10.0.0.10' &&
                                dh.scope3Domain === 'meridian.local' &&
                                dh.scope3Lease === '4h'
                            );

                            dh.createScope3 = '';
                            _updateDhcpCounts(dh);
                        }
                    },
                    /* -- Reservations ------------------------- */
                    {
                        id: 'dhcp-reservations',
                        label: 'Reservations',
                        group: 'Scopes',
                        fields: [
                            {
                                type: 'table',
                                label: 'DHCP Reservations',
                                statePath: 'webMgmt.dhcp.reservations',
                                columns: [
                                    { key: 'name',  label: 'Client Name' },
                                    { key: 'ip',    label: 'Reserved IP' },
                                    { key: 'mac',   label: 'MAC Address' },
                                    { key: 'scope', label: 'Scope' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Add Reservation',
                                statePath: 'webMgmt.dhcp.addReservation',
                                options: [
                                    { value: '',            label: '-- Select Reservation --' },
                                    { value: 'printer1',    label: 'PRINTER-FL1: 10.0.1.10 (00:1B:44:11:3A:B7)' },
                                    { value: 'printer2',    label: 'PRINTER-FL2: 10.0.1.11 (00:1B:44:11:3A:B8)' },
                                    { value: 'ap-lobby',    label: 'AP-LOBBY: 10.0.0.50 (AC:86:74:A0:01:02)' },
                                    { value: 'ip-phone',    label: 'PHONE-CONF: 10.0.1.20 (00:50:56:C0:00:AA)' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const dh = state.webMgmt.dhcp;
                            if (!dh.reservations) dh.reservations = [];
                            const has = (n) => dh.reservations.some(r => r.name === n);

                            const resMap = {
                                printer1:  { name: 'PRINTER-FL1', ip: '10.0.1.10',  mac: '00:1B:44:11:3A:B7', scope: 'Workstation VLAN' },
                                printer2:  { name: 'PRINTER-FL2', ip: '10.0.1.11',  mac: '00:1B:44:11:3A:B8', scope: 'Workstation VLAN' },
                                'ap-lobby': { name: 'AP-LOBBY',   ip: '10.0.0.50',  mac: 'AC:86:74:A0:01:02', scope: 'Server VLAN' },
                                'ip-phone': { name: 'PHONE-CONF', ip: '10.0.1.20',  mac: '00:50:56:C0:00:AA', scope: 'Workstation VLAN' }
                            };

                            const sel = dh.addReservation;
                            if (sel && resMap[sel] && !has(resMap[sel].name)) {
                                dh.reservations.push(resMap[sel]);
                            }

                            dh.printer1Reserved = has('PRINTER-FL1');
                            dh.printer2Reserved = has('PRINTER-FL2');
                            dh.reservationsCreated = dh.printer1Reserved && dh.printer2Reserved;
                            dh.addReservation = '';

                            _updateDhcpCounts(dh);
                        }
                    }
                ]
            }
        },
        /* ---- Command Prompt --------------------------------- */
        {
            id: 'cmd',
            label: 'Command Prompt',
            icon: 'terminal',
            window: 'cmd'
        },
        /* ---- Services Console ------------------------------- */
        {
            id: 'services',
            label: 'Services Console',
            icon: 'generic',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'Services -- DC01.meridian.local',
                sections: [
                    {
                        id: 'svc-list',
                        label: 'All Services',
                        saveable: false,
                        fields: [
                            {
                                type: 'table',
                                label: 'Windows Services',
                                statePath: 'webMgmt.svcTable',
                                columns: [
                                    { key: 'name',    label: 'Service Name' },
                                    { key: 'status',  label: 'Status' },
                                    { key: 'startup', label: 'Startup Type' }
                                ]
                            }
                        ]
                    }
                ]
            }
        },
        /* ---- Notepad ---------------------------------------- */
        {
            id: 'notepad',
            label: 'Notepad',
            icon: 'generic',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'Notepad -- DNS & DHCP Documentation',
                sections: [
                    {
                        id: 'notepad-doc',
                        label: 'Documentation',
                        fields: [
                            { type: 'text', label: 'Domain Name',       statePath: 'webMgmt.notepad.domain',     placeholder: 'meridian.local' },
                            { type: 'text', label: 'DNS Server IP',     statePath: 'webMgmt.notepad.dnsIp',      placeholder: '10.0.0.10' },
                            { type: 'text', label: 'Forward Zone',      statePath: 'webMgmt.notepad.fwdZone',    placeholder: 'meridian.local' },
                            { type: 'text', label: 'Reverse Zone',      statePath: 'webMgmt.notepad.revZone',    placeholder: '0.0.10.in-addr.arpa' },
                            { type: 'text', label: 'Scope 1 Range',     statePath: 'webMgmt.notepad.scope1',     placeholder: '10.0.0.100-200' },
                            { type: 'text', label: 'Scope 2 Range',     statePath: 'webMgmt.notepad.scope2',     placeholder: '10.0.1.100-250' },
                            { type: 'text', label: 'Scope 3 Range',     statePath: 'webMgmt.notepad.scope3',     placeholder: '10.0.2.100-200' },
                            { type: 'text', label: 'Notes',             statePath: 'webMgmt.notepad.notes',      placeholder: 'Additional notes...' }
                        ],
                        onSave(state) {
                            // Notepad is informational only
                        }
                    }
                ]
            }
        }
    ],

    /* -- Initial State ---------------------------------------- */
    initialState: {
        adapters: [
            {
                name: 'Ethernet0',
                description: 'Intel(R) I219-LM Gigabit Network Adapter',
                enabled: true,
                connected: true,
                dhcp: false,
                ip: '10.0.0.10',
                mask: '255.255.255.0',
                gateway: '10.0.0.1',
                dns: ['10.0.0.10', '127.0.0.1'],
                mac: '00:15:5D:01:0A:10',
                speed: '1 Gbps',
                duplex: 'Full Duplex',
                driver: 'Intel Corporation',
                driverVersion: '12.19.1.37',
                irq: '11'
            }
        ],
        services: [
            { name: 'DNS Server',          status: 'running',  startup: 'Automatic' },
            { name: 'DHCP Server',         status: 'running',  startup: 'Automatic' },
            { name: 'Active Directory DS', status: 'running',  startup: 'Automatic' },
            { name: 'Kerberos KDC',        status: 'running',  startup: 'Automatic' },
            { name: 'DNS Client',          status: 'running',  startup: 'Automatic' },
            { name: 'Windows Firewall',    status: 'running',  startup: 'Automatic' },
            { name: 'Netlogon',            status: 'running',  startup: 'Automatic' },
            { name: 'W32Time',             status: 'running',  startup: 'Automatic' }
        ],
        connectivity: {
            gateway: true,
            internet: true,
            dns: true
        },
        webMgmt: {
            dns: {
                serverName: 'DC01.meridian.local',
                serverIp: '10.0.0.10',
                osVersion: 'Windows Server 2022 Datacenter',
                serviceStatus: 'Running',
                zonesLoaded: '0',
                cacheEntries: '0',
                recursiveQry: '0',
                forwardZones: [],
                meridianZoneCreated: false,
                createForwardZone: '',
                aRecords: [],
                dc01RecordCreated: false,
                mailRecordCreated: false,
                wwwRecordCreated: false,
                allARecordsCreated: false,
                addARecord: '',
                customAHost: '',
                customAIp: '',
                mxRecords: [],
                mxRecordCreated: false,
                addMxRecord: '',
                cnameRecords: [],
                cnameCreated: false,
                addCnameRecord: '',
                reverseZones: [],
                reverseZoneCreated: false,
                createReverseZone: '',
                ptrRecords: [],
                ptrDc01Created: false,
                addPtrRecord: '',
                forwarderTable: [],
                addForwarder: ''
            },
            dhcp: {
                serverName: 'DC01.meridian.local',
                serverIp: '10.0.0.10',
                serviceStatus: 'Running',
                activeScopes: '0',
                totalLeases: '0',
                totalRes: '0',
                authorization: 'Authorized in AD',
                scope1Table: [],
                scope1Created: false,
                scope1Configured: false,
                createScope1: '',
                scope1Gateway: '',
                scope1Dns: '',
                scope1Domain: '',
                scope1Lease: '',
                scope2Table: [],
                scope2Created: false,
                scope2Configured: false,
                createScope2: '',
                scope2Gateway: '',
                scope2Dns: '',
                scope2Domain: '',
                scope2Lease: '',
                scope3Table: [],
                scope3Created: false,
                scope3Configured: false,
                createScope3: '',
                scope3Gateway: '',
                scope3Dns: '',
                scope3Domain: '',
                scope3Lease: '',
                reservations: [],
                printer1Reserved: false,
                printer2Reserved: false,
                reservationsCreated: false,
                addReservation: ''
            },
            svcTable: [
                { name: 'Active Directory DS', status: 'Running', startup: 'Automatic' },
                { name: 'DHCP Server',         status: 'Running', startup: 'Automatic' },
                { name: 'DNS Client',          status: 'Running', startup: 'Automatic' },
                { name: 'DNS Server',          status: 'Running', startup: 'Automatic' },
                { name: 'Kerberos KDC',        status: 'Running', startup: 'Automatic' },
                { name: 'Netlogon',            status: 'Running', startup: 'Automatic' },
                { name: 'W32Time',             status: 'Running', startup: 'Automatic' },
                { name: 'Windows Firewall',    status: 'Running', startup: 'Automatic' }
            ],
            notepad: {
                domain: '',
                dnsIp: '',
                fwdZone: '',
                revZone: '',
                scope1: '',
                scope2: '',
                scope3: '',
                notes: ''
            }
        }
    },

    /* -- 12 Tasks --------------------------------------------- */
    tasks: [
        /* -- Task 1: Open DNS Manager ------------------------- */
        {
            id: 'task-01-open-dns',
            title: '1. Open DNS Manager',
            description: 'Double-click the DNS Manager icon on the desktop. Review the server status to confirm the DNS service is running on DC01.meridian.local.',
            verify: {
                type: 'window_opened',
                window: 'web_mgmt'
            }
        },
        /* -- Task 2: Create forward zone meridian.local ------- */
        {
            id: 'task-02-forward-zone',
            title: '2. Create Forward Lookup Zone: meridian.local',
            description: 'Navigate to Forward Zones. Select "Primary Zone: meridian.local" from the dropdown and click Apply to create the zone.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.dns.meridianZoneCreated',
                value: true
            }
        },
        /* -- Task 3: Add A records (dc01, mail, www) ---------- */
        {
            id: 'task-03-a-records',
            title: '3. Add Host (A) Records',
            description: 'Navigate to A Records. Add three host records: dc01 (10.0.0.10), mail (10.0.0.20), and www (10.0.0.30). Click Apply after each.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.dns.allARecordsCreated',
                value: true
            }
        },
        /* -- Task 4: Add MX record ---------------------------- */
        {
            id: 'task-04-mx-record',
            title: '4. Add Mail Exchanger (MX) Record',
            description: 'Navigate to MX Records. Add an MX record pointing meridian.local to mail.meridian.local with priority 10. Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.dns.mxRecordCreated',
                value: true
            }
        },
        /* -- Task 5: Add CNAME intranet -> www ---------------- */
        {
            id: 'task-05-cname',
            title: '5. Add Alias (CNAME) Record',
            description: 'Navigate to CNAME Records. Create an alias "intranet" pointing to www.meridian.local. Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.dns.cnameCreated',
                value: true
            }
        },
        /* -- Task 6: Create reverse zone ---------------------- */
        {
            id: 'task-06-reverse-zone',
            title: '6. Create Reverse Lookup Zone',
            description: 'Navigate to Reverse Zones. Create the reverse zone for the 10.0.0.x subnet (0.0.10.in-addr.arpa). Add a PTR record for dc01 (10.0.0.10). Click Apply.',
            verify: {
                type: 'state_match',
                checks: [
                    { path: 'webMgmt.dns.reverseZoneCreated', value: true },
                    { path: 'webMgmt.dns.ptrDc01Created', value: true }
                ]
            }
        },
        /* -- Task 7: Configure DHCP Scope 1 ------------------- */
        {
            id: 'task-07-scope1',
            title: '7. Configure DHCP Scope 1: Server VLAN',
            description: 'Open the DHCP Console. Navigate to Scope 1. Create the scope (10.0.0.100-200), set gateway to 10.0.0.1, DNS to 10.0.0.10, domain to meridian.local, lease to 8 Days. Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.dhcp.scope1Configured',
                value: true
            }
        },
        /* -- Task 8: Configure DHCP Scope 2 ------------------- */
        {
            id: 'task-08-scope2',
            title: '8. Configure DHCP Scope 2: Workstation VLAN',
            description: 'Navigate to Scope 2. Create the scope (10.0.1.100-250), set gateway to 10.0.1.1, DNS to 10.0.0.10, domain to meridian.local, lease to 8 Days. Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.dhcp.scope2Configured',
                value: true
            }
        },
        /* -- Task 9: Configure DHCP Scope 3 ------------------- */
        {
            id: 'task-09-scope3',
            title: '9. Configure DHCP Scope 3: Guest VLAN',
            description: 'Navigate to Scope 3. Create the scope (10.0.2.100-200), set gateway to 10.0.2.1, DNS to 10.0.0.10, domain to meridian.local, lease to 4 Hours. Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.dhcp.scope3Configured',
                value: true
            }
        },
        /* -- Task 10: Create DHCP reservations ---------------- */
        {
            id: 'task-10-reservations',
            title: '10. Create DHCP Reservations',
            description: 'Navigate to Reservations. Add reservations for PRINTER-FL1 (10.0.1.10) and PRINTER-FL2 (10.0.1.11). Click Apply after each.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.dhcp.reservationsCreated',
                value: true
            }
        },
        /* -- Task 11: Verify DNS with nslookup ---------------- */
        {
            id: 'task-11-nslookup-dc01',
            title: '11. Verify DNS: nslookup dc01.meridian.local',
            description: 'Open the Command Prompt. Run "nslookup dc01.meridian.local" to verify the A record resolves to 10.0.0.10.',
            verify: {
                type: 'command_run',
                command: 'nslookup dc01.meridian.local'
            }
        },
        /* -- Task 12: Verify DNS with nslookup (www) ---------- */
        {
            id: 'task-12-nslookup-www',
            title: '12. Verify DNS: nslookup www.meridian.local',
            description: 'Run "nslookup www.meridian.local" to verify it resolves to 10.0.0.30. This confirms your forward zone and A records are working.',
            verify: {
                type: 'command_run',
                command: 'nslookup www.meridian.local'
            }
        }
    ]
};

/* -- Helper: update DHCP dashboard counts --------------------- */
function _updateDhcpCounts(dh) {
    let scopes = 0;
    if (dh.scope1Created) scopes++;
    if (dh.scope2Created) scopes++;
    if (dh.scope3Created) scopes++;
    dh.activeScopes = String(scopes);
    dh.totalRes = dh.reservations ? String(dh.reservations.length) : '0';
}
