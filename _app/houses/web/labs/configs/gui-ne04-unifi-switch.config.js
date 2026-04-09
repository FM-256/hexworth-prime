/* ============================================================
   gui-ne04-unifi-switch.config.js
   Network+ NE-04 — Ethernet & Switching GUI Lab
   Hexworth Prime — Network+ Course
   2026-03-27

   SCENARIO: Configure a new UniFi 48-port managed switch
   from scratch through the UniFi Controller web interface.
   Create VLANs, assign ports, configure trunks, enable STP.
   ============================================================ */

const GUI_NE04_UNIFI_CONFIG = {

    id: 'gui-ne04-unifi-switch',
    title: 'NE-04: UniFi Switch Configuration Lab',
    subtitle: 'Configure a 48-port managed switch from scratch via the UniFi Controller',
    duration: 1800, // 30 minutes
    sequentialTasks: true,

    certObjectives: [
        'N10-009 2.1: Compare and contrast various devices, their features, and their appropriate placement on the network',
        'N10-009 2.3: Given a scenario, configure and deploy common Ethernet switching features'
    ],

    scoring: {
        taskPoints: 45,
        timeBonus: 100,
        maxScore: 550
    },

    /* -- Desktop Icons ---------------------------------------- */
    desktop: [
        {
            id: 'browser-unifi',
            label: 'Web Browser\nhttps://10.0.0.2:8443',
            icon: 'browser',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'UniFi Network Controller -- USW-48-POE',
                sections: [
                    /* -- Dashboard ----------------------------- */
                    {
                        id: 'unifi-dashboard',
                        label: 'Dashboard',
                        group: 'Overview',
                        saveable: false,
                        fields: [
                            { type: 'info', label: 'Controller Version', statePath: 'webMgmt.unifi.controllerVer', default: '8.1.113' },
                            { type: 'info', label: 'Site',               statePath: 'webMgmt.unifi.site',          default: 'Meridian Corp' },
                            { type: 'info', label: 'Switch Model',      statePath: 'webMgmt.unifi.model',         default: 'USW-48-POE (Gen2)' },
                            { type: 'info', label: 'Firmware',           statePath: 'webMgmt.unifi.firmware',      default: '6.6.65' },
                            { type: 'info', label: 'Uptime',            statePath: 'webMgmt.unifi.uptime',         default: '0 days, 0:04:32' },
                            { type: 'info', label: 'Total Ports',       statePath: 'webMgmt.unifi.totalPorts',     default: '48 + 4 SFP+' },
                            { type: 'info', label: 'Connected Devices', statePath: 'webMgmt.unifi.connDevices',    default: '0' },
                            { type: 'info', label: 'PoE Budget',        statePath: 'webMgmt.unifi.poeBudget',      default: '600W (0W used)' },
                            { type: 'info', label: 'Mgmt IP',           statePath: 'webMgmt.unifi.mgmtIp',         default: '10.0.0.2' },
                            { type: 'info', label: 'MAC Address',       statePath: 'webMgmt.unifi.mac',            default: 'FC:EC:DA:A0:12:48' }
                        ]
                    },
                    /* -- Devices ------------------------------ */
                    {
                        id: 'unifi-devices',
                        label: 'Devices',
                        group: 'Overview',
                        saveable: false,
                        fields: [
                            {
                                type: 'table',
                                label: 'Adopted Devices',
                                statePath: 'webMgmt.unifi.deviceTable',
                                columns: [
                                    { key: 'name',   label: 'Name' },
                                    { key: 'model',  label: 'Model' },
                                    { key: 'ip',     label: 'IP Address' },
                                    { key: 'status', label: 'Status' }
                                ]
                            },
                            { type: 'info', label: 'Temperature',  statePath: 'webMgmt.unifi.temperature',  default: '42C / 107F' },
                            { type: 'info', label: 'Fan Speed',    statePath: 'webMgmt.unifi.fanSpeed',     default: '3200 RPM' },
                            { type: 'info', label: 'Power Draw',   statePath: 'webMgmt.unifi.powerDraw',    default: '28W (idle)' }
                        ]
                    },
                    /* -- Networks (VLAN Management) ----------- */
                    {
                        id: 'unifi-networks',
                        label: 'Networks',
                        group: 'Configuration',
                        fields: [
                            {
                                type: 'table',
                                label: 'Configured Networks/VLANs',
                                statePath: 'webMgmt.unifi.vlans',
                                columns: [
                                    { key: 'id',     label: 'VLAN ID' },
                                    { key: 'name',   label: 'Name' },
                                    { key: 'subnet', label: 'Subnet' },
                                    { key: 'status', label: 'Status' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Create Network',
                                statePath: 'webMgmt.unifi.createNetwork',
                                options: [
                                    { value: '',              label: '-- Select Network to Create --' },
                                    { value: 'add-10-sales',  label: 'VLAN 10 - Sales (10.10.0.0/24)' },
                                    { value: 'add-20-eng',    label: 'VLAN 20 - Engineering (10.20.0.0/24)' },
                                    { value: 'add-30-mgmt',   label: 'VLAN 30 - Management (10.30.0.0/24)' },
                                    { value: 'add-99-native', label: 'VLAN 99 - Native/Trunk' }
                                ]
                            },
                            { type: 'text', label: 'Custom VLAN ID',   statePath: 'webMgmt.unifi.customVlanId',   placeholder: 'e.g. 10' },
                            { type: 'text', label: 'Custom VLAN Name', statePath: 'webMgmt.unifi.customVlanName', placeholder: 'e.g. Sales' },
                            { type: 'text', label: 'Custom Subnet',    statePath: 'webMgmt.unifi.customSubnet',   placeholder: 'e.g. 10.10.0.0/24' }
                        ],
                        onSave(state) {
                            const u = state.webMgmt.unifi;
                            if (!u.vlans) u.vlans = [{ id: '1', name: 'Default', subnet: '192.168.1.0/24', status: 'Active' }];
                            const vlans = u.vlans;
                            const has = (vid) => vlans.some(v => String(v.id) === String(vid));

                            const sel = u.createNetwork;
                            if (sel === 'add-10-sales' && !has(10)) {
                                vlans.push({ id: '10', name: 'Sales', subnet: '10.10.0.0/24', status: 'Active' });
                            }
                            if (sel === 'add-20-eng' && !has(20)) {
                                vlans.push({ id: '20', name: 'Engineering', subnet: '10.20.0.0/24', status: 'Active' });
                            }
                            if (sel === 'add-30-mgmt' && !has(30)) {
                                vlans.push({ id: '30', name: 'Management', subnet: '10.30.0.0/24', status: 'Active' });
                            }
                            if (sel === 'add-99-native' && !has(99)) {
                                vlans.push({ id: '99', name: 'Native/Trunk', subnet: '--', status: 'Active' });
                            }

                            // Manual add
                            const nid = u.customVlanId;
                            const nname = u.customVlanName;
                            const nsub = u.customSubnet || '--';
                            if (nid && nname && !has(nid)) {
                                vlans.push({ id: String(nid), name: nname, subnet: nsub, status: 'Active' });
                                u.customVlanId = '';
                                u.customVlanName = '';
                                u.customSubnet = '';
                            }

                            // Track which VLANs are created
                            u.vlan10Created = has(10);
                            u.vlan20Created = has(20);
                            u.vlan30Created = has(30);
                            u.vlan99Created = has(99);
                            u.vlansCreated = u.vlan10Created && u.vlan20Created && u.vlan30Created && u.vlan99Created;
                            u.createNetwork = '';

                            // Update device count
                            u.connDevices = String(vlans.length - 1) + ' networks configured';
                        }
                    },
                    /* -- Ports (Port Profile Assignment) ------ */
                    {
                        id: 'unifi-ports',
                        label: 'Ports',
                        group: 'Configuration',
                        fields: [
                            {
                                type: 'table',
                                label: 'Port Assignments (48-Port Switch)',
                                statePath: 'webMgmt.unifi.portTable',
                                columns: [
                                    { key: 'range',   label: 'Port Range' },
                                    { key: 'profile', label: 'Profile' },
                                    { key: 'vlan',    label: 'VLAN' },
                                    { key: 'poe',     label: 'PoE' },
                                    { key: 'speed',   label: 'Speed' },
                                    { key: 'status',  label: 'Status' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Ports 1-12 Profile',
                                statePath: 'webMgmt.unifi.ports1to12profile',
                                options: [
                                    { value: 'all',         label: 'All (Default)' },
                                    { value: 'sales',       label: 'Sales (VLAN 10)' },
                                    { value: 'engineering', label: 'Engineering (VLAN 20)' },
                                    { value: 'management',  label: 'Management (VLAN 30)' },
                                    { value: 'disabled',    label: 'Disabled' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Ports 13-24 Profile',
                                statePath: 'webMgmt.unifi.ports13to24profile',
                                options: [
                                    { value: 'all',         label: 'All (Default)' },
                                    { value: 'sales',       label: 'Sales (VLAN 10)' },
                                    { value: 'engineering', label: 'Engineering (VLAN 20)' },
                                    { value: 'management',  label: 'Management (VLAN 30)' },
                                    { value: 'disabled',    label: 'Disabled' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Ports 25-36 Profile',
                                statePath: 'webMgmt.unifi.ports25to36profile',
                                options: [
                                    { value: 'all',         label: 'All (Default)' },
                                    { value: 'sales',       label: 'Sales (VLAN 10)' },
                                    { value: 'engineering', label: 'Engineering (VLAN 20)' },
                                    { value: 'management',  label: 'Management (VLAN 30)' },
                                    { value: 'disabled',    label: 'Disabled' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Ports 37-46 Profile',
                                statePath: 'webMgmt.unifi.ports37to46profile',
                                options: [
                                    { value: 'all',         label: 'All (Default)' },
                                    { value: 'sales',       label: 'Sales (VLAN 10)' },
                                    { value: 'engineering', label: 'Engineering (VLAN 20)' },
                                    { value: 'management',  label: 'Management (VLAN 30)' },
                                    { value: 'disabled',    label: 'Disabled' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const u = state.webMgmt.unifi;
                            const profileToVlan = { all: '1', sales: '10', engineering: '20', management: '30', disabled: '--' };
                            const profileToLabel = { all: 'All', sales: 'Sales', engineering: 'Engineering', management: 'Management', disabled: 'Disabled' };

                            const p1 = u.ports1to12profile  || 'all';
                            const p2 = u.ports13to24profile || 'all';
                            const p3 = u.ports25to36profile || 'all';
                            const p4 = u.ports37to46profile || 'all';

                            u.portTable = [
                                { range: 'Ports 1-12',  profile: profileToLabel[p1], vlan: 'VLAN ' + profileToVlan[p1], poe: 'PoE+', speed: '1 Gbps', status: p1 === 'disabled' ? 'Disabled' : 'Active' },
                                { range: 'Ports 13-24', profile: profileToLabel[p2], vlan: 'VLAN ' + profileToVlan[p2], poe: 'PoE+', speed: '1 Gbps', status: p2 === 'disabled' ? 'Disabled' : 'Active' },
                                { range: 'Ports 25-36', profile: profileToLabel[p3], vlan: 'VLAN ' + profileToVlan[p3], poe: 'PoE+', speed: '1 Gbps', status: p3 === 'disabled' ? 'Disabled' : 'Active' },
                                { range: 'Ports 37-46', profile: profileToLabel[p4], vlan: 'VLAN ' + profileToVlan[p4], poe: 'PoE+', speed: '1 Gbps', status: p4 === 'disabled' ? 'Disabled' : 'Active' },
                                { range: 'Ports 47-48', profile: u.trunkConfigured ? 'Trunk' : 'All', vlan: u.trunkConfigured ? 'All (Native 99)' : 'VLAN 1', poe: '--', speed: '1 Gbps', status: 'Active' }
                            ];

                            u.salesPortsAssigned = (p1 === 'sales');
                            u.engineeringPortsAssigned = (p2 === 'engineering');
                            u.managementPortsAssigned = (p3 === 'management');
                            u.portsAssigned = u.salesPortsAssigned && u.engineeringPortsAssigned && u.managementPortsAssigned;
                        }
                    },
                    /* -- Profiles ----------------------------- */
                    {
                        id: 'unifi-profiles',
                        label: 'Profiles',
                        group: 'Configuration',
                        saveable: false,
                        fields: [
                            {
                                type: 'table',
                                label: 'Port Profiles',
                                statePath: 'webMgmt.unifi.profileTable',
                                columns: [
                                    { key: 'name',       label: 'Profile Name' },
                                    { key: 'type',       label: 'Type' },
                                    { key: 'nativeVlan', label: 'Native VLAN' },
                                    { key: 'taggedVlans', label: 'Tagged VLANs' }
                                ]
                            },
                            { type: 'info', label: 'Note', statePath: 'webMgmt.unifi.profileNote', default: 'Profiles are auto-created when VLANs are configured. Assign profiles to ports in the Ports section.' }
                        ]
                    },
                    /* -- Trunk Configuration (Ports 47-48) ---- */
                    {
                        id: 'unifi-trunk',
                        label: 'Trunk Uplinks',
                        group: 'Configuration',
                        fields: [
                            {
                                type: 'select',
                                label: 'Ports 47-48 Mode',
                                statePath: 'webMgmt.unifi.trunkMode',
                                options: [
                                    { value: 'access',  label: 'Access (single VLAN)' },
                                    { value: 'trunk',   label: 'Trunk (802.1Q - all VLANs)' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Native VLAN',
                                statePath: 'webMgmt.unifi.trunkNativeVlan',
                                options: [
                                    { value: '1',  label: 'VLAN 1 (default)' },
                                    { value: '10', label: 'VLAN 10 (Sales)' },
                                    { value: '20', label: 'VLAN 20 (Engineering)' },
                                    { value: '30', label: 'VLAN 30 (Management)' },
                                    { value: '99', label: 'VLAN 99 (Native/Trunk)' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Allowed VLANs',
                                statePath: 'webMgmt.unifi.trunkAllowedVlans',
                                options: [
                                    { value: 'all',       label: 'All VLANs' },
                                    { value: '10,20,30',  label: 'VLANs 10, 20, 30 only' },
                                    { value: '10,20',     label: 'VLANs 10, 20 only' }
                                ]
                            },
                            {
                                type: 'toggle',
                                label: 'Enable LLDP on trunk ports',
                                statePath: 'webMgmt.unifi.trunkLldp',
                                onLabel: 'Enabled',
                                offLabel: 'Disabled'
                            }
                        ],
                        onSave(state) {
                            const u = state.webMgmt.unifi;
                            u.trunkConfigured = (
                                u.trunkMode === 'trunk' &&
                                u.trunkNativeVlan === '99' &&
                                (u.trunkAllowedVlans === 'all' || u.trunkAllowedVlans === '10,20,30')
                            );
                        }
                    },
                    /* -- Settings (STP/RSTP) ------------------ */
                    {
                        id: 'unifi-settings',
                        label: 'Settings',
                        group: 'Advanced',
                        fields: [
                            {
                                type: 'select',
                                label: 'Spanning Tree Protocol',
                                statePath: 'webMgmt.unifi.stpMode',
                                options: [
                                    { value: 'disabled', label: 'Disabled' },
                                    { value: 'stp',      label: 'STP (802.1D)' },
                                    { value: 'rstp',     label: 'RSTP (802.1w)' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Bridge Priority',
                                statePath: 'webMgmt.unifi.stpPriority',
                                options: [
                                    { value: '4096',  label: '4096' },
                                    { value: '8192',  label: '8192' },
                                    { value: '16384', label: '16384' },
                                    { value: '32768', label: '32768 (Default)' },
                                    { value: '49152', label: '49152' },
                                    { value: '61440', label: '61440' }
                                ]
                            },
                            {
                                type: 'toggle',
                                label: 'Enable PortFast on access ports',
                                statePath: 'webMgmt.unifi.portFastEnabled',
                                onLabel: 'Enabled',
                                offLabel: 'Disabled'
                            },
                            {
                                type: 'toggle',
                                label: 'Enable BPDU Guard',
                                statePath: 'webMgmt.unifi.bpduGuard',
                                onLabel: 'Enabled',
                                offLabel: 'Disabled'
                            },
                            {
                                type: 'select',
                                label: 'Management VLAN',
                                statePath: 'webMgmt.unifi.mgmtVlan',
                                options: [
                                    { value: '1',  label: 'VLAN 1 (default)' },
                                    { value: '30', label: 'VLAN 30 (Management)' },
                                    { value: '99', label: 'VLAN 99' }
                                ]
                            },
                            {
                                type: 'toggle',
                                label: 'Enable Storm Control',
                                statePath: 'webMgmt.unifi.stormControl',
                                onLabel: 'Enabled',
                                offLabel: 'Disabled'
                            }
                        ],
                        onSave(state) {
                            const u = state.webMgmt.unifi;
                            u.stpConfigured = (
                                u.stpMode === 'rstp' &&
                                u.stpPriority === '32768' &&
                                u.portFastEnabled === true
                            );
                        }
                    }
                ]
            }
        },
        {
            id: 'cmd',
            label: 'Command Prompt',
            icon: 'terminal',
            window: 'cmd'
        },
        {
            id: 'notepad',
            label: 'Notepad',
            icon: 'generic',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'Notepad -- Switch Documentation',
                sections: [
                    {
                        id: 'notepad-doc',
                        label: 'Documentation',
                        fields: [
                            { type: 'text', label: 'Switch Hostname',    statePath: 'webMgmt.notepad.hostname',    placeholder: 'USW-48-POE' },
                            { type: 'text', label: 'Management IP',     statePath: 'webMgmt.notepad.mgmtIp',      placeholder: '10.0.0.2' },
                            { type: 'text', label: 'VLAN 10 (Sales)',    statePath: 'webMgmt.notepad.vlan10',       placeholder: '10.10.0.0/24 - Ports 1-12' },
                            { type: 'text', label: 'VLAN 20 (Eng)',      statePath: 'webMgmt.notepad.vlan20',       placeholder: '10.20.0.0/24 - Ports 13-24' },
                            { type: 'text', label: 'VLAN 30 (Mgmt)',     statePath: 'webMgmt.notepad.vlan30',       placeholder: '10.30.0.0/24 - Ports 25-36' },
                            { type: 'text', label: 'VLAN 99 (Native)',   statePath: 'webMgmt.notepad.vlan99',       placeholder: 'Trunk native VLAN - Ports 47-48' },
                            { type: 'text', label: 'Trunk Ports',        statePath: 'webMgmt.notepad.trunkPorts',   placeholder: '47-48 - 802.1Q, Native VLAN 99' },
                            { type: 'text', label: 'STP Mode',           statePath: 'webMgmt.notepad.stpMode',      placeholder: 'RSTP, Priority 32768, PortFast on access ports' },
                            { type: 'text', label: 'Notes',              statePath: 'webMgmt.notepad.notes',        placeholder: 'Additional configuration notes...' }
                        ],
                        onSave(state) {
                            // Notepad is informational only, no verification needed
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
                description: 'Intel(R) I219-V Gigabit Network Adapter',
                enabled: true,
                connected: true,
                dhcp: false,
                ip: '10.0.0.50',
                mask: '255.255.255.0',
                gateway: '10.0.0.1',
                dns: ['10.0.0.1'],
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
            { name: 'Network Location',  status: 'running',  startup: 'Automatic' }
        ],
        connectivity: {
            gateway: true,
            internet: false,
            dns: true
        },
        webMgmt: {
            unifi: {
                controllerVer: '8.1.113',
                site: 'Meridian Corp',
                model: 'USW-48-POE (Gen2)',
                firmware: '6.6.65',
                uptime: '0 days, 0:04:32',
                totalPorts: '48 + 4 SFP+',
                connDevices: '0',
                poeBudget: '600W (0W used)',
                mgmtIp: '10.0.0.2',
                mac: 'FC:EC:DA:A0:12:48',
                temperature: '42C / 107F',
                fanSpeed: '3200 RPM',
                powerDraw: '28W (idle)',
                deviceTable: [
                    { name: 'USW-48-POE', model: 'USW-48-POE (Gen2)', ip: '10.0.0.2', status: 'Connected' }
                ],
                vlans: [
                    { id: '1', name: 'Default', subnet: '192.168.1.0/24', status: 'Active' }
                ],
                vlan10Created: false,
                vlan20Created: false,
                vlan30Created: false,
                vlan99Created: false,
                vlansCreated: false,
                createNetwork: '',
                customVlanId: '',
                customVlanName: '',
                customSubnet: '',
                portTable: [
                    { range: 'Ports 1-12',  profile: 'All', vlan: 'VLAN 1', poe: 'PoE+', speed: '1 Gbps', status: 'Active' },
                    { range: 'Ports 13-24', profile: 'All', vlan: 'VLAN 1', poe: 'PoE+', speed: '1 Gbps', status: 'Active' },
                    { range: 'Ports 25-36', profile: 'All', vlan: 'VLAN 1', poe: 'PoE+', speed: '1 Gbps', status: 'Active' },
                    { range: 'Ports 37-46', profile: 'All', vlan: 'VLAN 1', poe: 'PoE+', speed: '1 Gbps', status: 'Active' },
                    { range: 'Ports 47-48', profile: 'All', vlan: 'VLAN 1', poe: '--',   speed: '1 Gbps', status: 'Active' }
                ],
                ports1to12profile: 'all',
                ports13to24profile: 'all',
                ports25to36profile: 'all',
                ports37to46profile: 'all',
                salesPortsAssigned: false,
                engineeringPortsAssigned: false,
                managementPortsAssigned: false,
                portsAssigned: false,
                profileTable: [
                    { name: 'All',         type: 'Access', nativeVlan: '1',  taggedVlans: 'None' },
                    { name: 'LAN',         type: 'Access', nativeVlan: '1',  taggedVlans: 'None' },
                    { name: 'Sales',       type: 'Access', nativeVlan: '10', taggedVlans: 'None' },
                    { name: 'Engineering', type: 'Access', nativeVlan: '20', taggedVlans: 'None' },
                    { name: 'Management',  type: 'Access', nativeVlan: '30', taggedVlans: 'None' },
                    { name: 'Trunk',       type: 'Trunk',  nativeVlan: '99', taggedVlans: '10, 20, 30, 99' },
                    { name: 'Disabled',    type: '--',     nativeVlan: '--', taggedVlans: '--' }
                ],
                profileNote: 'Profiles are auto-created when VLANs are configured. Assign profiles to ports in the Ports section.',
                trunkMode: 'access',
                trunkNativeVlan: '1',
                trunkAllowedVlans: '',
                trunkLldp: false,
                trunkConfigured: false,
                stpMode: 'disabled',
                stpPriority: '32768',
                portFastEnabled: false,
                bpduGuard: false,
                mgmtVlan: '1',
                stormControl: false,
                stpConfigured: false
            },
            notepad: {
                hostname: '',
                mgmtIp: '',
                vlan10: '',
                vlan20: '',
                vlan30: '',
                vlan99: '',
                trunkPorts: '',
                stpMode: '',
                notes: ''
            }
        }
    },

    /* -- 10 Tasks --------------------------------------------- */
    tasks: [
        /* -- Task 1: Open UniFi Controller -------------------- */
        {
            id: 'task-01-open-browser',
            title: '1. Access the UniFi Controller',
            description: 'Double-click the Web Browser icon on the desktop to open the UniFi Controller at https://10.0.0.2:8443. Review the Dashboard for switch details.',
            verify: {
                type: 'window_opened',
                window: 'web_mgmt'
            }
        },
        /* -- Task 2: Create VLAN 10 Sales --------------------- */
        {
            id: 'task-02-vlan10',
            title: '2. Create VLAN 10 "Sales" (10.10.0.0/24)',
            description: 'Navigate to Networks. Select "VLAN 10 - Sales (10.10.0.0/24)" from the Create Network dropdown and click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.unifi.vlan10Created',
                value: true
            }
        },
        /* -- Task 3: Create VLAN 20 Engineering --------------- */
        {
            id: 'task-03-vlan20',
            title: '3. Create VLAN 20 "Engineering" (10.20.0.0/24)',
            description: 'In Networks, select "VLAN 20 - Engineering (10.20.0.0/24)" from the Create Network dropdown and click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.unifi.vlan20Created',
                value: true
            }
        },
        /* -- Task 4: Create VLAN 30 Management ---------------- */
        {
            id: 'task-04-vlan30',
            title: '4. Create VLAN 30 "Management" (10.30.0.0/24)',
            description: 'In Networks, select "VLAN 30 - Management (10.30.0.0/24)" from the Create Network dropdown and click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.unifi.vlan30Created',
                value: true
            }
        },
        /* -- Task 5: Create VLAN 99 Native/Trunk -------------- */
        {
            id: 'task-05-vlan99',
            title: '5. Create VLAN 99 "Native/Trunk"',
            description: 'In Networks, select "VLAN 99 - Native/Trunk" from the Create Network dropdown and click Apply. This VLAN will be used as the native VLAN on trunk ports.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.unifi.vlan99Created',
                value: true
            }
        },
        /* -- Task 6: Assign Ports 1-12 to Sales --------------- */
        {
            id: 'task-06-sales-ports',
            title: '6. Assign Ports 1-12 to Sales (VLAN 10)',
            description: 'Navigate to Ports. Set the "Ports 1-12 Profile" to "Sales (VLAN 10)" and click Apply.',
            verify: {
                type: 'state_match',
                checks: [
                    { path: 'webMgmt.unifi.ports1to12profile', value: 'sales' },
                    { path: 'webMgmt.unifi.salesPortsAssigned', value: true }
                ]
            }
        },
        /* -- Task 7: Assign Ports 13-24 to Engineering -------- */
        {
            id: 'task-07-eng-ports',
            title: '7. Assign Ports 13-24 to Engineering (VLAN 20)',
            description: 'Set the "Ports 13-24 Profile" to "Engineering (VLAN 20)" and click Apply.',
            verify: {
                type: 'state_match',
                checks: [
                    { path: 'webMgmt.unifi.ports13to24profile', value: 'engineering' },
                    { path: 'webMgmt.unifi.engineeringPortsAssigned', value: true }
                ]
            }
        },
        /* -- Task 8: Assign Ports 25-36 to Management --------- */
        {
            id: 'task-08-mgmt-ports',
            title: '8. Assign Ports 25-36 to Management (VLAN 30)',
            description: 'Set the "Ports 25-36 Profile" to "Management (VLAN 30)" and click Apply.',
            verify: {
                type: 'state_match',
                checks: [
                    { path: 'webMgmt.unifi.ports25to36profile', value: 'management' },
                    { path: 'webMgmt.unifi.managementPortsAssigned', value: true }
                ]
            }
        },
        /* -- Task 9: Configure Trunk on Ports 47-48 ----------- */
        {
            id: 'task-09-trunk',
            title: '9. Configure Trunk Uplinks (Ports 47-48)',
            description: 'Navigate to Trunk Uplinks. Set mode to "Trunk (802.1Q)", native VLAN to "VLAN 99", allowed VLANs to "All VLANs", and click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.unifi.trunkConfigured',
                value: true
            }
        },
        /* -- Task 10: Enable RSTP + PortFast ------------------ */
        {
            id: 'task-10-stp',
            title: '10. Enable RSTP and PortFast',
            description: 'Navigate to Settings. Set Spanning Tree Protocol to "RSTP (802.1w)", Bridge Priority to "32768 (Default)", enable PortFast on access ports, and click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.unifi.stpConfigured',
                value: true
            }
        }
    ]
};
