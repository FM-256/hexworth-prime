/* ============================================================
   gui-midterm-comprehensive.config.js
   Network+ Midterm — Comprehensive GUI Lab (NE-01 through NE-05)
   Hexworth Prime — Network+ Course
   2026-03-27

   SCENARIO: New IT admin at Meridian Corp satellite office.
   No documentation. Configure network from scratch:
   static IP, VLANs on switch, routing on router, verify, document.
   ============================================================ */

const GUI_MIDTERM_CONFIG = {

    id: 'gui-midterm-comprehensive',
    title: 'Network+ Midterm: Meridian Corp Office Build-Out',
    subtitle: 'Configure a three-department office network from scratch',
    duration: 1800, // 30 minutes
    sequentialTasks: true,

    certObjectives: [
        'NE-01: OSI Model — Identify layers involved in network communication',
        'NE-02: TCP/IP — Configure IPv4 addressing on hosts and network devices',
        'NE-03: Subnetting — Apply correct subnet masks to segment departments',
        'NE-04: Switching — Create VLANs, assign ports, configure trunks',
        'NE-05: Routing — Configure inter-VLAN routing and default routes'
    ],

    scoring: {
        taskPoints: 40,
        timeBonus: 100,
        maxScore: 580
    },

    /* ── Desktop Icons ──────────────────────────────────────── */
    desktop: [
        {
            id: 'cmd',
            label: 'Command Prompt',
            icon: 'terminal',
            window: 'cmd'
        },
        {
            id: 'network-settings',
            label: 'Network Settings',
            icon: 'network',
            window: 'network_adapter'
        },
        {
            id: 'device-manager',
            label: 'Device Manager',
            icon: 'device_manager',
            window: 'device_manager'
        },
        {
            id: 'browser-switch',
            label: 'Switch Mgmt\n10.0.0.2',
            icon: 'browser',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'MeridianSW-01 — Managed Switch',
                sections: [
                    /* ── Dashboard ─────────────── */
                    {
                        id: 'sw-dashboard',
                        label: 'Dashboard',
                        group: 'System',
                        saveable: false,
                        fields: [
                            { type: 'info', label: 'Hostname',       statePath: 'webMgmt.switch.hostname',    default: 'MeridianSW-01' },
                            { type: 'info', label: 'Model',          statePath: 'webMgmt.switch.model',       default: 'Catalyst 2960-24T' },
                            { type: 'info', label: 'Firmware',       statePath: 'webMgmt.switch.firmware',    default: 'IOS 15.2(7)E2' },
                            { type: 'info', label: 'Uptime',         statePath: 'webMgmt.switch.uptime',      default: '14 days, 7:32:18' },
                            { type: 'info', label: 'Total Ports',    statePath: 'webMgmt.switch.totalPorts',   default: '24' },
                            { type: 'info', label: 'Active Ports',   statePath: 'webMgmt.switch.activePorts',  default: '6' },
                            { type: 'info', label: 'Mgmt IP',        statePath: 'webMgmt.switch.mgmtIp',      default: '10.0.0.2' }
                        ]
                    },
                    /* ── VLANs ─────────────────── */
                    {
                        id: 'sw-vlans',
                        label: 'VLANs',
                        group: 'Switching',
                        fields: [
                            {
                                type: 'table',
                                label: 'Current VLANs',
                                statePath: 'webMgmt.switch.vlans',
                                columns: [
                                    { key: 'id',   label: 'VLAN ID' },
                                    { key: 'name', label: 'Name' },
                                    { key: 'ports', label: 'Ports' }
                                ]
                            },
                            { type: 'text', label: 'New VLAN ID',   statePath: 'webMgmt.switch.newVlanId',   placeholder: 'e.g. 10' },
                            { type: 'text', label: 'New VLAN Name', statePath: 'webMgmt.switch.newVlanName', placeholder: 'e.g. Sales' },
                            {
                                type: 'select',
                                label: 'Quick-Add VLANs',
                                statePath: 'webMgmt.switch.quickAddVlan',
                                options: [
                                    { value: '',              label: '-- Select --' },
                                    { value: 'add-10-sales',  label: 'Add VLAN 10 (Sales)' },
                                    { value: 'add-20-eng',    label: 'Add VLAN 20 (Engineering)' },
                                    { value: 'add-30-mgmt',   label: 'Add VLAN 30 (Management)' },
                                    { value: 'add-all',       label: 'Add All Three VLANs' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const sel = state.webMgmt.switch.quickAddVlan;
                            if (!state.webMgmt.switch.vlans) state.webMgmt.switch.vlans = [{ id: '1', name: 'default', ports: '1-24' }];
                            const vlans = state.webMgmt.switch.vlans;
                            const has = (vid) => vlans.some(v => String(v.id) === String(vid));

                            if (sel === 'add-10-sales' || sel === 'add-all') {
                                if (!has(10)) vlans.push({ id: '10', name: 'Sales', ports: '' });
                            }
                            if (sel === 'add-20-eng' || sel === 'add-all') {
                                if (!has(20)) vlans.push({ id: '20', name: 'Engineering', ports: '' });
                            }
                            if (sel === 'add-30-mgmt' || sel === 'add-all') {
                                if (!has(30)) vlans.push({ id: '30', name: 'Management', ports: '' });
                            }

                            // Manual add
                            const nid = state.webMgmt.switch.newVlanId;
                            const nname = state.webMgmt.switch.newVlanName;
                            if (nid && nname && !has(nid)) {
                                vlans.push({ id: String(nid), name: nname, ports: '' });
                                state.webMgmt.switch.newVlanId = '';
                                state.webMgmt.switch.newVlanName = '';
                            }

                            state.webMgmt.switch.vlansCreated = true;
                            state.webMgmt.switch.quickAddVlan = '';
                        }
                    },
                    /* ── Port Assignments ──────── */
                    {
                        id: 'sw-ports',
                        label: 'Port Assignments',
                        group: 'Switching',
                        fields: [
                            {
                                type: 'table',
                                label: 'Port-to-VLAN Mapping',
                                statePath: 'webMgmt.switch.portTable',
                                columns: [
                                    { key: 'range', label: 'Port Range' },
                                    { key: 'vlan',  label: 'VLAN' },
                                    { key: 'mode',  label: 'Mode' },
                                    { key: 'status', label: 'Status' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Ports 1-8 VLAN',
                                statePath: 'webMgmt.switch.ports1to8vlan',
                                options: [
                                    { value: '1',  label: 'VLAN 1 (default)' },
                                    { value: '10', label: 'VLAN 10 (Sales)' },
                                    { value: '20', label: 'VLAN 20 (Engineering)' },
                                    { value: '30', label: 'VLAN 30 (Management)' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Ports 9-16 VLAN',
                                statePath: 'webMgmt.switch.ports9to16vlan',
                                options: [
                                    { value: '1',  label: 'VLAN 1 (default)' },
                                    { value: '10', label: 'VLAN 10 (Sales)' },
                                    { value: '20', label: 'VLAN 20 (Engineering)' },
                                    { value: '30', label: 'VLAN 30 (Management)' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Ports 17-24 VLAN',
                                statePath: 'webMgmt.switch.ports17to24vlan',
                                options: [
                                    { value: '1',  label: 'VLAN 1 (default)' },
                                    { value: '10', label: 'VLAN 10 (Sales)' },
                                    { value: '20', label: 'VLAN 20 (Engineering)' },
                                    { value: '30', label: 'VLAN 30 (Management)' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const v1 = state.webMgmt.switch.ports1to8vlan  || '1';
                            const v2 = state.webMgmt.switch.ports9to16vlan || '1';
                            const v3 = state.webMgmt.switch.ports17to24vlan || '1';
                            state.webMgmt.switch.portTable = [
                                { range: 'Fa0/1 - Fa0/8',   vlan: 'VLAN ' + v1, mode: 'Access', status: 'Active' },
                                { range: 'Fa0/9 - Fa0/16',  vlan: 'VLAN ' + v2, mode: 'Access', status: 'Active' },
                                { range: 'Fa0/17 - Fa0/24', vlan: 'VLAN ' + v3, mode: 'Access', status: 'Active' }
                            ];
                            state.webMgmt.switch.portsAssigned = true;
                        }
                    },
                    /* ── Trunk Config ──────────── */
                    {
                        id: 'sw-trunk',
                        label: 'Trunk',
                        group: 'Switching',
                        fields: [
                            {
                                type: 'select',
                                label: 'Trunk Port',
                                statePath: 'webMgmt.switch.trunkPort',
                                options: [
                                    { value: '',      label: '-- Select Port --' },
                                    { value: 'fa0/1', label: 'Fa0/1' },
                                    { value: 'fa0/8', label: 'Fa0/8' },
                                    { value: 'fa0/16', label: 'Fa0/16' },
                                    { value: 'fa0/24', label: 'Fa0/24' },
                                    { value: 'gi0/1', label: 'Gi0/1' },
                                    { value: 'gi0/2', label: 'Gi0/2' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Trunk Mode',
                                statePath: 'webMgmt.switch.trunkMode',
                                options: [
                                    { value: 'access',    label: 'Access' },
                                    { value: 'trunk',     label: 'Trunk (802.1Q)' },
                                    { value: 'dynamic',   label: 'Dynamic Auto' }
                                ]
                            },
                            {
                                type: 'text',
                                label: 'Allowed VLANs',
                                statePath: 'webMgmt.switch.trunkAllowedVlans',
                                placeholder: 'e.g. 10,20,30 or all'
                            },
                            {
                                type: 'select',
                                label: 'Native VLAN',
                                statePath: 'webMgmt.switch.trunkNativeVlan',
                                options: [
                                    { value: '1',  label: 'VLAN 1 (default)' },
                                    { value: '10', label: 'VLAN 10' },
                                    { value: '20', label: 'VLAN 20' },
                                    { value: '30', label: 'VLAN 30' },
                                    { value: '99', label: 'VLAN 99' }
                                ]
                            }
                        ],
                        onSave(state) {
                            state.webMgmt.switch.trunkConfigured = (
                                state.webMgmt.switch.trunkPort === 'fa0/24' &&
                                state.webMgmt.switch.trunkMode === 'trunk'
                            );
                        }
                    },
                    /* ── STP ───────────────────── */
                    {
                        id: 'sw-stp',
                        label: 'STP',
                        group: 'Switching',
                        saveable: false,
                        fields: [
                            { type: 'info', label: 'STP Mode',       statePath: 'webMgmt.switch.stpMode',     default: 'Rapid PVST+' },
                            { type: 'info', label: 'Root Bridge',    statePath: 'webMgmt.switch.stpRoot',     default: 'This switch (priority 32768)' },
                            { type: 'info', label: 'Topology Changes', statePath: 'webMgmt.switch.stpChanges', default: '0' }
                        ]
                    }
                ]
            }
        },
        {
            id: 'browser-router',
            label: 'Router Mgmt\n10.0.0.1',
            icon: 'browser',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'MeridianRTR-01 Gateway Router',
                sections: [
                    /* ── Dashboard ─────────────── */
                    {
                        id: 'rtr-dashboard',
                        label: 'Dashboard',
                        group: 'System',
                        saveable: false,
                        fields: [
                            { type: 'info', label: 'Hostname',    statePath: 'webMgmt.router.hostname',    default: 'MeridianRTR-01' },
                            { type: 'info', label: 'Model',       statePath: 'webMgmt.router.model',       default: 'Cisco ISR 4321' },
                            { type: 'info', label: 'Firmware',    statePath: 'webMgmt.router.firmware',    default: 'IOS-XE 17.6.4' },
                            { type: 'info', label: 'Uptime',      statePath: 'webMgmt.router.uptime',      default: '14 days, 7:32:18' },
                            { type: 'info', label: 'WAN IP',      statePath: 'webMgmt.router.wanIp',       default: '203.0.113.2/30' },
                            { type: 'info', label: 'WAN Status',  statePath: 'webMgmt.router.wanStatus',   default: 'Up' },
                            { type: 'info', label: 'Mgmt IP',     statePath: 'webMgmt.router.mgmtIp',      default: '10.0.0.1' }
                        ]
                    },
                    /* ── Sub-Interfaces ─────────── */
                    {
                        id: 'rtr-interfaces',
                        label: 'Interfaces',
                        group: 'Configuration',
                        fields: [
                            {
                                type: 'table',
                                label: 'Interface Status',
                                statePath: 'webMgmt.router.interfaceTable',
                                columns: [
                                    { key: 'name',   label: 'Interface' },
                                    { key: 'ip',     label: 'IP Address' },
                                    { key: 'mask',   label: 'Subnet Mask' },
                                    { key: 'vlan',   label: 'VLAN' },
                                    { key: 'status', label: 'Status' }
                                ]
                            },
                            {
                                type: 'toggle',
                                label: 'Enable Sub-Interface Gi0/0.10 (VLAN 10 — Sales)',
                                statePath: 'webMgmt.router.subif10enabled',
                                onLabel: 'Enabled',
                                offLabel: 'Disabled'
                            },
                            {
                                type: 'ip',
                                label: 'Gi0/0.10 IP Address',
                                statePath: 'webMgmt.router.subif10ip',
                                placeholder: '10.10.10.1'
                            },
                            {
                                type: 'ip',
                                label: 'Gi0/0.10 Subnet Mask',
                                statePath: 'webMgmt.router.subif10mask',
                                placeholder: '255.255.255.0'
                            },
                            {
                                type: 'toggle',
                                label: 'Enable Sub-Interface Gi0/0.20 (VLAN 20 — Engineering)',
                                statePath: 'webMgmt.router.subif20enabled',
                                onLabel: 'Enabled',
                                offLabel: 'Disabled'
                            },
                            {
                                type: 'ip',
                                label: 'Gi0/0.20 IP Address',
                                statePath: 'webMgmt.router.subif20ip',
                                placeholder: '10.20.20.1'
                            },
                            {
                                type: 'ip',
                                label: 'Gi0/0.20 Subnet Mask',
                                statePath: 'webMgmt.router.subif20mask',
                                placeholder: '255.255.255.0'
                            },
                            {
                                type: 'toggle',
                                label: 'Enable Sub-Interface Gi0/0.30 (VLAN 30 — Management)',
                                statePath: 'webMgmt.router.subif30enabled',
                                onLabel: 'Enabled',
                                offLabel: 'Disabled'
                            },
                            {
                                type: 'ip',
                                label: 'Gi0/0.30 IP Address',
                                statePath: 'webMgmt.router.subif30ip',
                                placeholder: '10.30.30.1'
                            },
                            {
                                type: 'ip',
                                label: 'Gi0/0.30 Subnet Mask',
                                statePath: 'webMgmt.router.subif30mask',
                                placeholder: '255.255.255.0'
                            }
                        ],
                        onSave(state) {
                            const r = state.webMgmt.router;
                            r.subInterfacesConfigured = (
                                r.subif10enabled === true &&
                                r.subif10ip === '10.10.10.1' &&
                                r.subif10mask === '255.255.255.0' &&
                                r.subif20enabled === true &&
                                r.subif20ip === '10.20.20.1' &&
                                r.subif20mask === '255.255.255.0' &&
                                r.subif30enabled === true &&
                                r.subif30ip === '10.30.30.1' &&
                                r.subif30mask === '255.255.255.0'
                            );
                            // Update interface table
                            r.interfaceTable = [
                                { name: 'Gi0/0',    ip: '203.0.113.2', mask: '255.255.255.252', vlan: '--', status: 'Up' },
                                { name: 'Gi0/0.10', ip: r.subif10ip || '--', mask: r.subif10mask || '--', vlan: '10', status: r.subif10enabled ? 'Up' : 'Down' },
                                { name: 'Gi0/0.20', ip: r.subif20ip || '--', mask: r.subif20mask || '--', vlan: '20', status: r.subif20enabled ? 'Up' : 'Down' },
                                { name: 'Gi0/0.30', ip: r.subif30ip || '--', mask: r.subif30mask || '--', vlan: '30', status: r.subif30enabled ? 'Up' : 'Down' }
                            ];
                            // Once sub-interfaces are up, connectivity to those gateways is possible
                            if (r.subInterfacesConfigured) {
                                state.connectivity.gateway = true;
                                state.connectivity.internet = true;
                                state.connectivity.dns = true;
                            }
                        }
                    },
                    /* ── Routing ────────────────── */
                    {
                        id: 'rtr-routing',
                        label: 'Routing',
                        group: 'Configuration',
                        fields: [
                            {
                                type: 'table',
                                label: 'Routing Table',
                                statePath: 'webMgmt.router.routingTable',
                                columns: [
                                    { key: 'network',   label: 'Destination' },
                                    { key: 'mask',      label: 'Mask' },
                                    { key: 'nextHop',   label: 'Next Hop' },
                                    { key: 'iface',     label: 'Interface' },
                                    { key: 'type',      label: 'Type' }
                                ]
                            },
                            {
                                type: 'toggle',
                                label: 'Enable Default Route',
                                statePath: 'webMgmt.router.defaultRouteEnabled',
                                onLabel: 'Active',
                                offLabel: 'Inactive'
                            },
                            {
                                type: 'ip',
                                label: 'Default Route Next-Hop (ISP Gateway)',
                                statePath: 'webMgmt.router.defaultRouteNextHop',
                                placeholder: '203.0.113.1'
                            }
                        ],
                        onSave(state) {
                            const r = state.webMgmt.router;
                            r.defaultRouteConfigured = (
                                r.defaultRouteEnabled === true &&
                                r.defaultRouteNextHop === '203.0.113.1'
                            );
                            // Update routing table display
                            const routes = [
                                { network: '10.10.10.0', mask: '/24', nextHop: '--', iface: 'Gi0/0.10', type: 'Connected' },
                                { network: '10.20.20.0', mask: '/24', nextHop: '--', iface: 'Gi0/0.20', type: 'Connected' },
                                { network: '10.30.30.0', mask: '/24', nextHop: '--', iface: 'Gi0/0.30', type: 'Connected' },
                                { network: '203.0.113.0', mask: '/30', nextHop: '--', iface: 'Gi0/0', type: 'Connected' }
                            ];
                            if (r.defaultRouteEnabled && r.defaultRouteNextHop) {
                                routes.push({ network: '0.0.0.0', mask: '/0', nextHop: r.defaultRouteNextHop, iface: 'Gi0/0', type: 'Static' });
                            }
                            r.routingTable = routes;
                            // Enable internet connectivity once default route is set
                            if (r.defaultRouteConfigured && r.subInterfacesConfigured) {
                                state.connectivity.internet = true;
                            }
                        }
                    },
                    /* ── NAT ───────────────────── */
                    {
                        id: 'rtr-nat',
                        label: 'NAT',
                        group: 'Configuration',
                        saveable: false,
                        fields: [
                            { type: 'info', label: 'NAT Mode',      statePath: 'webMgmt.router.natMode',      default: 'PAT (Overload)' },
                            { type: 'info', label: 'Inside Iface',  statePath: 'webMgmt.router.natInside',     default: 'Gi0/0.10, Gi0/0.20, Gi0/0.30' },
                            { type: 'info', label: 'Outside Iface', statePath: 'webMgmt.router.natOutside',    default: 'Gi0/0' },
                            { type: 'info', label: 'Translations',  statePath: 'webMgmt.router.natTranslations', default: '0 active' }
                        ]
                    },
                    /* ── Firewall ──────────────── */
                    {
                        id: 'rtr-firewall',
                        label: 'Firewall',
                        group: 'Security',
                        saveable: false,
                        fields: [
                            { type: 'info', label: 'ACL Status',    statePath: 'webMgmt.router.aclStatus',    default: 'No ACLs configured' },
                            { type: 'info', label: 'Zone-Based FW', statePath: 'webMgmt.router.zbfw',         default: 'Disabled' }
                        ]
                    }
                ]
            }
        },
        {
            id: 'notepad',
            label: 'Notepad',
            icon: 'generic',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'Notepad — Network Documentation',
                sections: [
                    {
                        id: 'notepad-doc',
                        label: 'Documentation',
                        fields: [
                            {
                                type: 'text',
                                label: 'Document Title',
                                statePath: 'webMgmt.notepad.title',
                                placeholder: 'Meridian Corp Network Documentation'
                            },
                            {
                                type: 'text',
                                label: 'Workstation IP',
                                statePath: 'webMgmt.notepad.workstationIp',
                                placeholder: '10.10.10.50/24'
                            },
                            {
                                type: 'text',
                                label: 'Default Gateway',
                                statePath: 'webMgmt.notepad.gateway',
                                placeholder: '10.10.10.1'
                            },
                            {
                                type: 'text',
                                label: 'DNS Server',
                                statePath: 'webMgmt.notepad.dns',
                                placeholder: '10.0.0.10'
                            },
                            {
                                type: 'text',
                                label: 'VLAN 10 (Sales) Subnet',
                                statePath: 'webMgmt.notepad.vlan10subnet',
                                placeholder: '10.10.10.0/24'
                            },
                            {
                                type: 'text',
                                label: 'VLAN 20 (Engineering) Subnet',
                                statePath: 'webMgmt.notepad.vlan20subnet',
                                placeholder: '10.20.20.0/24'
                            },
                            {
                                type: 'text',
                                label: 'VLAN 30 (Management) Subnet',
                                statePath: 'webMgmt.notepad.vlan30subnet',
                                placeholder: '10.30.30.0/24'
                            },
                            {
                                type: 'text',
                                label: 'Router WAN IP',
                                statePath: 'webMgmt.notepad.routerWan',
                                placeholder: '203.0.113.2/30'
                            },
                            {
                                type: 'text',
                                label: 'ISP Gateway',
                                statePath: 'webMgmt.notepad.ispGateway',
                                placeholder: '203.0.113.1'
                            },
                            {
                                type: 'text',
                                label: 'Trunk Port',
                                statePath: 'webMgmt.notepad.trunkPort',
                                placeholder: 'Fa0/24 — 802.1Q Trunk to Router'
                            }
                        ],
                        onSave(state) {
                            const n = state.webMgmt.notepad;
                            // Documentation is "complete" if at least 6 of 9 fields are filled
                            const fields = [n.workstationIp, n.gateway, n.dns, n.vlan10subnet, n.vlan20subnet, n.vlan30subnet, n.routerWan, n.ispGateway, n.trunkPort];
                            const filled = fields.filter(f => f && f.trim().length > 0).length;
                            state.webMgmt.notepad.documentationComplete = filled >= 6;
                        }
                    }
                ]
            }
        }
    ],

    /* ── Initial State ──────────────────────────────────────── */
    initialState: {
        adapters: [
            {
                name: 'Ethernet0',
                description: 'Intel(R) I219-V Gigabit Network Adapter',
                enabled: true,
                connected: true,
                dhcp: false,
                ip: '169.254.47.132',     // APIPA — no DHCP server
                mask: '255.255.0.0',
                gateway: '',
                dns: [],
                mac: '00:1A:2B:3C:4D:5E',
                speed: '1 Gbps',
                duplex: 'Full Duplex',
                driver: 'Intel Corporation',
                driverVersion: '12.19.1.37',
                irq: '11'
            }
        ],
        services: [
            { name: 'DHCP Client',       status: 'running',  startup: 'Automatic' },
            { name: 'DNS Client',        status: 'running',  startup: 'Automatic' },
            { name: 'Windows Firewall',  status: 'running',  startup: 'Automatic' },
            { name: 'Network Location',  status: 'running',  startup: 'Automatic' },
            { name: 'TCP/IP NetBIOS',    status: 'running',  startup: 'Automatic' },
            { name: 'Workstation',       status: 'running',  startup: 'Automatic' }
        ],
        connectivity: {
            gateway: false,
            internet: false,
            dns: false
        },
        webMgmt: {
            switch: {
                hostname: 'MeridianSW-01',
                model: 'Catalyst 2960-24T',
                firmware: 'IOS 15.2(7)E2',
                uptime: '14 days, 7:32:18',
                totalPorts: '24',
                activePorts: '6',
                mgmtIp: '10.0.0.2',
                vlans: [
                    { id: '1', name: 'default', ports: '1-24' }
                ],
                vlansCreated: false,
                portTable: [
                    { range: 'Fa0/1 - Fa0/8',   vlan: 'VLAN 1', mode: 'Access', status: 'Active' },
                    { range: 'Fa0/9 - Fa0/16',  vlan: 'VLAN 1', mode: 'Access', status: 'Active' },
                    { range: 'Fa0/17 - Fa0/24', vlan: 'VLAN 1', mode: 'Access', status: 'Active' }
                ],
                portsAssigned: false,
                ports1to8vlan: '1',
                ports9to16vlan: '1',
                ports17to24vlan: '1',
                trunkPort: '',
                trunkMode: 'access',
                trunkAllowedVlans: '',
                trunkNativeVlan: '1',
                trunkConfigured: false,
                stpMode: 'Rapid PVST+',
                stpRoot: 'This switch (priority 32768)',
                stpChanges: '0'
            },
            router: {
                hostname: 'MeridianRTR-01',
                model: 'Cisco ISR 4321',
                firmware: 'IOS-XE 17.6.4',
                uptime: '14 days, 7:32:18',
                wanIp: '203.0.113.2/30',
                wanStatus: 'Up',
                mgmtIp: '10.0.0.1',
                interfaceTable: [
                    { name: 'Gi0/0',    ip: '203.0.113.2', mask: '255.255.255.252', vlan: '--', status: 'Up' },
                    { name: 'Gi0/0.10', ip: '--',          mask: '--',              vlan: '10', status: 'Down' },
                    { name: 'Gi0/0.20', ip: '--',          mask: '--',              vlan: '20', status: 'Down' },
                    { name: 'Gi0/0.30', ip: '--',          mask: '--',              vlan: '30', status: 'Down' }
                ],
                subif10enabled: false,
                subif10ip: '',
                subif10mask: '',
                subif20enabled: false,
                subif20ip: '',
                subif20mask: '',
                subif30enabled: false,
                subif30ip: '',
                subif30mask: '',
                subInterfacesConfigured: false,
                routingTable: [
                    { network: '203.0.113.0', mask: '/30', nextHop: '--', iface: 'Gi0/0', type: 'Connected' }
                ],
                defaultRouteEnabled: false,
                defaultRouteNextHop: '',
                defaultRouteConfigured: false,
                natMode: 'PAT (Overload)',
                natInside: 'Gi0/0.10, Gi0/0.20, Gi0/0.30',
                natOutside: 'Gi0/0',
                natTranslations: '0 active',
                aclStatus: 'No ACLs configured',
                zbfw: 'Disabled'
            },
            notepad: {
                title: '',
                workstationIp: '',
                gateway: '',
                dns: '',
                vlan10subnet: '',
                vlan20subnet: '',
                vlan30subnet: '',
                routerWan: '',
                ispGateway: '',
                trunkPort: '',
                documentationComplete: false
            }
        }
    },

    /* ── 12 Tasks ───────────────────────────────────────────── */
    tasks: [
        /* ── Task 1: Run ipconfig — observe APIPA ──────────── */
        {
            id: 'task-01-ipconfig',
            title: '1. Observe Current IP Configuration',
            description: 'Open Command Prompt and run ipconfig to see the current (APIPA) address. The workstation has no DHCP server — note the 169.254.x.x address.',
            verify: {
                type: 'command_run',
                command: 'ipconfig'
            }
        },
        /* ── Task 2: Configure static IP ───────────────────── */
        {
            id: 'task-02-static-ip',
            title: '2. Configure Static IP Address',
            description: 'Open Network Settings and configure: IP 10.10.10.50, Mask 255.255.255.0, Gateway 10.10.10.1, DNS 10.0.0.10. Click Apply.',
            verify: {
                type: 'adapter_config',
                adapter: 'Ethernet0',
                ip: '10.10.10.50',
                mask: '255.255.255.0',
                gateway: '10.10.10.1',
                dns: ['10.0.0.10']
            }
        },
        /* ── Task 3: Verify with ipconfig /all ─────────────── */
        {
            id: 'task-03-verify-ip',
            title: '3. Verify IP Configuration',
            description: 'Run ipconfig /all in Command Prompt to confirm your static IP settings were applied correctly.',
            verify: {
                type: 'command_run',
                command: 'ipconfig /all'
            }
        },
        /* ── Task 4: Access switch management ──────────────── */
        {
            id: 'task-04-open-switch',
            title: '4. Access Switch Management GUI',
            description: 'Double-click the "Switch Mgmt" icon on the desktop to open the switch management interface at 10.0.0.2.',
            verify: {
                type: 'window_opened',
                window: 'web_mgmt'
            }
        },
        /* ── Task 5: Create VLANs ──────────────────────────── */
        {
            id: 'task-05-create-vlans',
            title: '5. Create VLANs 10, 20, and 30',
            description: 'In the switch GUI, navigate to VLANs. Create VLAN 10 (Sales), VLAN 20 (Engineering), VLAN 30 (Management). Use Quick-Add or manual entry, then Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.switch.vlansCreated',
                value: true
            }
        },
        /* ── Task 6: Assign ports to VLANs ─────────────────── */
        {
            id: 'task-06-assign-ports',
            title: '6. Assign Ports to VLANs',
            description: 'Navigate to Port Assignments. Set Ports 1-8 to VLAN 10 (Sales), Ports 9-16 to VLAN 20 (Engineering), Ports 17-24 to VLAN 30 (Management). Apply.',
            verify: {
                type: 'state_match',
                checks: [
                    { path: 'webMgmt.switch.ports1to8vlan',  value: '10' },
                    { path: 'webMgmt.switch.ports9to16vlan', value: '20' },
                    { path: 'webMgmt.switch.ports17to24vlan', value: '30' },
                    { path: 'webMgmt.switch.portsAssigned',   value: true }
                ]
            }
        },
        /* ── Task 7: Configure trunk port ──────────────────── */
        {
            id: 'task-07-trunk-port',
            title: '7. Configure Trunk Port',
            description: 'Navigate to Trunk config. Set port Fa0/24 as an 802.1Q trunk. This connects the switch to the router for inter-VLAN routing. Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.switch.trunkConfigured',
                value: true
            }
        },
        /* ── Task 8: Access router management ──────────────── */
        {
            id: 'task-08-open-router',
            title: '8. Access Router Management GUI',
            description: 'Double-click the "Router Mgmt" icon on the desktop to open the router management interface at 10.0.0.1.',
            verify: {
                type: 'custom',
                fn: (state) => (state._windowsOpened || []).filter(w => w === 'web_mgmt').length >= 1 &&
                               state.webMgmt?.router?.hostname === 'MeridianRTR-01'
            }
        },
        /* ── Task 9: Configure sub-interfaces ──────────────── */
        {
            id: 'task-09-subinterfaces',
            title: '9. Configure Router Sub-Interfaces',
            description: 'In the router Interfaces page, enable all three sub-interfaces and set: Gi0/0.10 = 10.10.10.1/24, Gi0/0.20 = 10.20.20.1/24, Gi0/0.30 = 10.30.30.1/24. Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.router.subInterfacesConfigured',
                value: true
            }
        },
        /* ── Task 10: Configure default route ──────────────── */
        {
            id: 'task-10-default-route',
            title: '10. Configure Default Route to ISP',
            description: 'Navigate to Routing. Enable the default route and set next-hop to ISP gateway 203.0.113.1. Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.router.defaultRouteConfigured',
                value: true
            }
        },
        /* ── Task 11: Test connectivity ────────────────────── */
        {
            id: 'task-11-ping-test',
            title: '11. Verify Connectivity',
            description: 'Open Command Prompt. Ping 10.20.20.1 (Engineering gateway), 10.30.30.1 (Management gateway), and 8.8.8.8 (internet). All should succeed.',
            verify: {
                type: 'custom',
                fn: (state) => {
                    const cmds = state._commandsRun || [];
                    const has1 = cmds.some(c => c.includes('ping') && c.includes('10.20.20.1'));
                    const has2 = cmds.some(c => c.includes('ping') && c.includes('10.30.30.1'));
                    const has3 = cmds.some(c => c.includes('ping') && c.includes('8.8.8.8'));
                    return has1 && has2 && has3 && state.connectivity.internet;
                }
            }
        },
        /* ── Task 12: Document the network ─────────────────── */
        {
            id: 'task-12-documentation',
            title: '12. Document the Network',
            description: 'Open Notepad and document: IP addressing scheme, VLAN assignments, and routing config. Fill in at least 6 of the 9 documentation fields. Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.notepad.documentationComplete',
                value: true
            }
        }
    ]
};
