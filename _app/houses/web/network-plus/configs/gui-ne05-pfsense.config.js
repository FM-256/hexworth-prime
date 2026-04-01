/* ============================================================
   gui-ne05-pfsense.config.js
   Network+ NE-05 Routing -- pfSense Firewall/Router GUI Lab
   Hexworth Prime -- Network+ Course
   2026-03-27

   SCENARIO: Configure pfSense firewall/router for new satellite
   office. WAN static IP from ISP, configure LAN, DHCP, firewall
   rules, static routes to HQ, port forwarding, DNS resolver.
   ============================================================ */

const GUI_NE05_PFSENSE_CONFIG = {

    id: 'gui-ne05-pfsense',
    title: 'NE-05 Routing: pfSense Firewall/Router Configuration',
    subtitle: 'Configure a pfSense appliance for a new satellite office',
    duration: 1800, // 30 minutes
    sequentialTasks: true,

    certObjectives: [
        'N10-009 1.5: Compare and contrast common networking ports, protocols, services, and traffic types',
        'N10-009 4.1: Explain common security concepts'
    ],

    scoring: {
        taskPoints: 50,
        timeBonus: 50,
        maxScore: 550
    },

    /* -- Desktop Icons ---------------------------------------- */
    desktop: [
        {
            id: 'browser-pfsense',
            label: 'pfSense Admin\n10.0.1.1',
            icon: 'browser',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'pfSense - Satellite Office Gateway',
                sections: [
                    /* -- Dashboard ----------------------------- */
                    {
                        id: 'pf-dashboard',
                        label: 'Dashboard',
                        group: 'Dashboard',
                        saveable: false,
                        fields: [
                            { type: 'info', label: 'Hostname',          statePath: 'webMgmt.pf.hostname',        default: 'SATGW-01' },
                            { type: 'info', label: 'Version',           statePath: 'webMgmt.pf.version',         default: 'pfSense CE 2.7.2' },
                            { type: 'info', label: 'Platform',          statePath: 'webMgmt.pf.platform',        default: 'Netgate 4100' },
                            { type: 'info', label: 'Uptime',            statePath: 'webMgmt.pf.uptime',          default: '0 days 00:04:12' },
                            { type: 'info', label: 'WAN IP',            statePath: 'webMgmt.pf.wanIP',           default: 'Not configured' },
                            { type: 'info', label: 'LAN IP',            statePath: 'webMgmt.pf.lanIP',           default: 'Not configured' },
                            { type: 'info', label: 'DHCP Status',       statePath: 'webMgmt.pf.dhcpStatus',      default: 'Disabled' },
                            { type: 'info', label: 'DNS Resolver',      statePath: 'webMgmt.pf.dnsStatus',       default: 'Disabled' }
                        ]
                    },

                    /* -- Interfaces > WAN ---------------------- */
                    {
                        id: 'pf-wan',
                        label: 'WAN',
                        group: 'Interfaces',
                        fields: [
                            { type: 'info', label: 'Interface', statePath: 'webMgmt.pf.wanIface', default: 'igb0 (WAN)' },
                            {
                                type: 'select',
                                label: 'IPv4 Configuration Type',
                                statePath: 'webMgmt.pf.wanType',
                                options: [
                                    { value: '',       label: '-- Select --' },
                                    { value: 'static', label: 'Static IPv4' },
                                    { value: 'dhcp',   label: 'DHCP' },
                                    { value: 'pppoe',  label: 'PPPoE' },
                                    { value: 'none',   label: 'None' }
                                ]
                            },
                            {
                                type: 'text',
                                label: 'IPv4 Address',
                                statePath: 'webMgmt.pf.wanAddr',
                                placeholder: 'e.g. 203.0.113.50'
                            },
                            {
                                type: 'select',
                                label: 'Subnet Mask (CIDR)',
                                statePath: 'webMgmt.pf.wanMask',
                                options: [
                                    { value: '',   label: '-- Select --' },
                                    { value: '30', label: '/30 (255.255.255.252)' },
                                    { value: '29', label: '/29 (255.255.255.248)' },
                                    { value: '28', label: '/28 (255.255.255.240)' },
                                    { value: '24', label: '/24 (255.255.255.0)' }
                                ]
                            },
                            {
                                type: 'text',
                                label: 'IPv4 Upstream Gateway',
                                statePath: 'webMgmt.pf.wanGateway',
                                placeholder: 'e.g. 203.0.113.49'
                            }
                        ],
                        onSave(state) {
                            const pf = state.webMgmt.pf;
                            const addr = (pf.wanAddr || '').trim();
                            const gw   = (pf.wanGateway || '').trim();

                            if (pf.wanType === 'static' && addr === '203.0.113.50' && pf.wanMask === '30' && gw === '203.0.113.49') {
                                pf.wan_configured = true;
                                pf.wanIP = '203.0.113.50/30';
                            }
                        }
                    },

                    /* -- Interfaces > LAN ---------------------- */
                    {
                        id: 'pf-lan',
                        label: 'LAN',
                        group: 'Interfaces',
                        fields: [
                            { type: 'info', label: 'Interface', statePath: 'webMgmt.pf.lanIface', default: 'igb1 (LAN)' },
                            {
                                type: 'select',
                                label: 'IPv4 Configuration Type',
                                statePath: 'webMgmt.pf.lanType',
                                options: [
                                    { value: '',       label: '-- Select --' },
                                    { value: 'static', label: 'Static IPv4' },
                                    { value: 'none',   label: 'None' }
                                ]
                            },
                            {
                                type: 'text',
                                label: 'IPv4 Address',
                                statePath: 'webMgmt.pf.lanAddr',
                                placeholder: 'e.g. 10.0.1.1'
                            },
                            {
                                type: 'select',
                                label: 'Subnet Mask (CIDR)',
                                statePath: 'webMgmt.pf.lanMask',
                                options: [
                                    { value: '',   label: '-- Select --' },
                                    { value: '24', label: '/24 (255.255.255.0)' },
                                    { value: '25', label: '/25 (255.255.255.128)' },
                                    { value: '16', label: '/16 (255.255.0.0)' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const pf = state.webMgmt.pf;
                            const addr = (pf.lanAddr || '').trim();

                            if (pf.lanType === 'static' && addr === '10.0.1.1' && pf.lanMask === '24') {
                                pf.lan_configured = true;
                                pf.lanIP = '10.0.1.1/24';
                            }
                        }
                    },

                    /* -- Firewall > Rules ---------------------- */
                    {
                        id: 'pf-fw-rules',
                        label: 'Rules',
                        group: 'Firewall',
                        fields: [
                            {
                                type: 'table',
                                label: 'Firewall Rules',
                                statePath: 'webMgmt.pf.fwRuleTable',
                                columns: [
                                    { key: 'iface',  label: 'Interface' },
                                    { key: 'action', label: 'Action' },
                                    { key: 'proto',  label: 'Protocol' },
                                    { key: 'src',    label: 'Source' },
                                    { key: 'dst',    label: 'Destination' },
                                    { key: 'port',   label: 'Dst Port' },
                                    { key: 'desc',   label: 'Description' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Interface',
                                statePath: 'webMgmt.pf.fwRuleIface',
                                options: [
                                    { value: '',    label: '-- Select --' },
                                    { value: 'LAN', label: 'LAN' },
                                    { value: 'WAN', label: 'WAN' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Action',
                                statePath: 'webMgmt.pf.fwRuleAction',
                                options: [
                                    { value: '',      label: '-- Select --' },
                                    { value: 'Pass',  label: 'Pass' },
                                    { value: 'Block', label: 'Block' },
                                    { value: 'Reject', label: 'Reject' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Protocol',
                                statePath: 'webMgmt.pf.fwRuleProto',
                                options: [
                                    { value: 'any',  label: 'Any' },
                                    { value: 'TCP',  label: 'TCP' },
                                    { value: 'UDP',  label: 'UDP' },
                                    { value: 'ICMP', label: 'ICMP' },
                                    { value: 'TCP/UDP', label: 'TCP/UDP' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Source',
                                statePath: 'webMgmt.pf.fwRuleSrc',
                                options: [
                                    { value: 'any',           label: 'any' },
                                    { value: 'LAN net',       label: 'LAN net' },
                                    { value: 'LAN address',   label: 'LAN address' },
                                    { value: 'WAN net',       label: 'WAN net' },
                                    { value: 'WAN address',   label: 'WAN address' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Destination',
                                statePath: 'webMgmt.pf.fwRuleDst',
                                options: [
                                    { value: 'any',           label: 'any' },
                                    { value: 'LAN net',       label: 'LAN net' },
                                    { value: 'LAN address',   label: 'LAN address' },
                                    { value: 'WAN net',       label: 'WAN net' },
                                    { value: 'WAN address',   label: 'WAN address' },
                                    { value: '10.0.1.50',     label: '10.0.1.50 (Web Server)' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Destination Port',
                                statePath: 'webMgmt.pf.fwRulePort',
                                options: [
                                    { value: 'any',  label: 'any' },
                                    { value: '80',   label: '80 (HTTP)' },
                                    { value: '443',  label: '443 (HTTPS)' },
                                    { value: '53',   label: '53 (DNS)' },
                                    { value: '22',   label: '22 (SSH)' },
                                    { value: '3389', label: '3389 (RDP)' }
                                ]
                            },
                            {
                                type: 'text',
                                label: 'Description',
                                statePath: 'webMgmt.pf.fwRuleDesc',
                                placeholder: 'e.g. Allow LAN to any'
                            }
                        ],
                        onSave(state) {
                            const pf = state.webMgmt.pf;
                            if (!pf.fwRuleTable) pf.fwRuleTable = [];
                            const iface  = pf.fwRuleIface  || '';
                            const action = pf.fwRuleAction || '';
                            const proto  = pf.fwRuleProto  || 'any';
                            const src    = pf.fwRuleSrc    || 'any';
                            const dst    = pf.fwRuleDst    || 'any';
                            const port   = pf.fwRulePort   || 'any';
                            const desc   = (pf.fwRuleDesc  || '').trim();

                            if (iface && action) {
                                pf.fwRuleTable.push({
                                    iface: iface,
                                    action: action,
                                    proto: proto,
                                    src: src,
                                    dst: dst,
                                    port: port,
                                    desc: desc || (action + ' ' + iface + ' rule')
                                });

                                // LAN allow any rule
                                if (iface === 'LAN' && action === 'Pass' && src === 'LAN net' && dst === 'any' && proto === 'any') {
                                    pf.fw_lan_allow = true;
                                }

                                // WAN block inbound rule
                                if (iface === 'WAN' && action === 'Block' && src === 'any' && dst === 'any' && proto === 'any') {
                                    pf.fw_wan_block = true;
                                }

                                // Clear form fields
                                pf.fwRuleIface  = '';
                                pf.fwRuleAction = '';
                                pf.fwRuleProto  = 'any';
                                pf.fwRuleSrc    = 'any';
                                pf.fwRuleDst    = 'any';
                                pf.fwRulePort   = 'any';
                                pf.fwRuleDesc   = '';
                            }
                        }
                    },

                    /* -- Firewall > NAT > Port Forward --------- */
                    {
                        id: 'pf-nat-portfwd',
                        label: 'Port Forward',
                        group: 'Firewall > NAT',
                        fields: [
                            {
                                type: 'table',
                                label: 'Port Forward Rules',
                                statePath: 'webMgmt.pf.portFwdTable',
                                columns: [
                                    { key: 'iface',    label: 'Interface' },
                                    { key: 'proto',    label: 'Protocol' },
                                    { key: 'srcAddr',  label: 'Src Addr' },
                                    { key: 'dstPort',  label: 'Dst Port' },
                                    { key: 'redirIP',  label: 'Redirect IP' },
                                    { key: 'redirPort', label: 'Redirect Port' },
                                    { key: 'desc',     label: 'Description' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Interface',
                                statePath: 'webMgmt.pf.natFwdIface',
                                options: [
                                    { value: '',    label: '-- Select --' },
                                    { value: 'WAN', label: 'WAN' },
                                    { value: 'LAN', label: 'LAN' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Protocol',
                                statePath: 'webMgmt.pf.natFwdProto',
                                options: [
                                    { value: 'TCP',     label: 'TCP' },
                                    { value: 'UDP',     label: 'UDP' },
                                    { value: 'TCP/UDP', label: 'TCP/UDP' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Source Address',
                                statePath: 'webMgmt.pf.natFwdSrc',
                                options: [
                                    { value: 'any', label: 'any' },
                                    { value: 'LAN net', label: 'LAN net' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Destination Port',
                                statePath: 'webMgmt.pf.natFwdDstPort',
                                options: [
                                    { value: '',    label: '-- Select --' },
                                    { value: '80',  label: '80 (HTTP)' },
                                    { value: '443', label: '443 (HTTPS)' },
                                    { value: '22',  label: '22 (SSH)' },
                                    { value: '25',  label: '25 (SMTP)' },
                                    { value: '3389', label: '3389 (RDP)' }
                                ]
                            },
                            {
                                type: 'text',
                                label: 'Redirect Target IP',
                                statePath: 'webMgmt.pf.natFwdRedirIP',
                                placeholder: 'e.g. 10.0.1.50'
                            },
                            {
                                type: 'select',
                                label: 'Redirect Target Port',
                                statePath: 'webMgmt.pf.natFwdRedirPort',
                                options: [
                                    { value: '',    label: '-- Same as Dst --' },
                                    { value: '80',  label: '80 (HTTP)' },
                                    { value: '443', label: '443 (HTTPS)' },
                                    { value: '22',  label: '22 (SSH)' },
                                    { value: '8443', label: '8443 (Alt HTTPS)' }
                                ]
                            },
                            {
                                type: 'text',
                                label: 'Description',
                                statePath: 'webMgmt.pf.natFwdDesc',
                                placeholder: 'e.g. HTTPS to internal web server'
                            }
                        ],
                        onSave(state) {
                            const pf = state.webMgmt.pf;
                            if (!pf.portFwdTable) pf.portFwdTable = [];
                            const iface    = pf.natFwdIface   || '';
                            const proto    = pf.natFwdProto   || 'TCP';
                            const src      = pf.natFwdSrc     || 'any';
                            const dstPort  = pf.natFwdDstPort || '';
                            const redirIP  = (pf.natFwdRedirIP || '').trim();
                            const redirPort = pf.natFwdRedirPort || dstPort;
                            const desc     = (pf.natFwdDesc   || '').trim();

                            if (iface && dstPort && redirIP) {
                                pf.portFwdTable.push({
                                    iface: iface,
                                    proto: proto,
                                    srcAddr: src,
                                    dstPort: dstPort,
                                    redirIP: redirIP,
                                    redirPort: redirPort || dstPort,
                                    desc: desc || ('Port ' + dstPort + ' forward')
                                });

                                // Validate port forward: 443 -> 10.0.1.50
                                if (iface === 'WAN' && dstPort === '443' && redirIP === '10.0.1.50') {
                                    pf.nat_portfwd_443 = true;
                                }

                                // Clear form
                                pf.natFwdIface    = '';
                                pf.natFwdProto    = 'TCP';
                                pf.natFwdSrc      = 'any';
                                pf.natFwdDstPort  = '';
                                pf.natFwdRedirIP  = '';
                                pf.natFwdRedirPort = '';
                                pf.natFwdDesc     = '';
                            }
                        }
                    },

                    /* -- Services > DHCP Server ---------------- */
                    {
                        id: 'pf-dhcp',
                        label: 'DHCP Server',
                        group: 'Services',
                        fields: [
                            { type: 'info', label: 'Interface', statePath: 'webMgmt.pf.dhcpIface', default: 'LAN (igb1)' },
                            {
                                type: 'select',
                                label: 'Enable DHCP Server',
                                statePath: 'webMgmt.pf.dhcpEnable',
                                options: [
                                    { value: '',        label: '-- Select --' },
                                    { value: 'enabled', label: 'Enabled' },
                                    { value: 'disabled', label: 'Disabled' }
                                ]
                            },
                            {
                                type: 'text',
                                label: 'Range Start',
                                statePath: 'webMgmt.pf.dhcpStart',
                                placeholder: 'e.g. 10.0.1.100'
                            },
                            {
                                type: 'text',
                                label: 'Range End',
                                statePath: 'webMgmt.pf.dhcpEnd',
                                placeholder: 'e.g. 10.0.1.200'
                            },
                            {
                                type: 'text',
                                label: 'DNS Server',
                                statePath: 'webMgmt.pf.dhcpDNS',
                                placeholder: 'e.g. 10.0.1.1'
                            },
                            {
                                type: 'text',
                                label: 'Gateway',
                                statePath: 'webMgmt.pf.dhcpGW',
                                placeholder: 'e.g. 10.0.1.1'
                            }
                        ],
                        onSave(state) {
                            const pf = state.webMgmt.pf;
                            const start = (pf.dhcpStart || '').trim();
                            const end   = (pf.dhcpEnd   || '').trim();

                            if (pf.dhcpEnable === 'enabled' && start === '10.0.1.100' && end === '10.0.1.200') {
                                pf.dhcp_configured = true;
                                pf.dhcpStatus = 'Active (10.0.1.100 - 10.0.1.200)';
                            }
                        }
                    },

                    /* -- Services > DNS Resolver --------------- */
                    {
                        id: 'pf-dns',
                        label: 'DNS Resolver',
                        group: 'Services',
                        fields: [
                            { type: 'info', label: 'Service', statePath: 'webMgmt.pf.dnsService', default: 'Unbound DNS Resolver' },
                            {
                                type: 'select',
                                label: 'Enable DNS Resolver',
                                statePath: 'webMgmt.pf.dnsEnable',
                                options: [
                                    { value: '',        label: '-- Select --' },
                                    { value: 'enabled', label: 'Enabled' },
                                    { value: 'disabled', label: 'Disabled' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Listen Interfaces',
                                statePath: 'webMgmt.pf.dnsListenIface',
                                options: [
                                    { value: '',      label: '-- Select --' },
                                    { value: 'All',   label: 'All' },
                                    { value: 'LAN',   label: 'LAN' },
                                    { value: 'WAN',   label: 'WAN' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'DNS Query Forwarding',
                                statePath: 'webMgmt.pf.dnsFwdEnable',
                                options: [
                                    { value: '',        label: '-- Select --' },
                                    { value: 'enabled', label: 'Enable Forwarding Mode' },
                                    { value: 'disabled', label: 'Resolver Mode (iterative)' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'DNSSEC',
                                statePath: 'webMgmt.pf.dnsSec',
                                options: [
                                    { value: 'enabled',  label: 'Enabled' },
                                    { value: 'disabled', label: 'Disabled' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const pf = state.webMgmt.pf;

                            if (pf.dnsEnable === 'enabled' && pf.dnsFwdEnable === 'enabled') {
                                pf.dns_configured = true;
                                pf.dnsStatus = 'Active (Forwarding)';
                            }
                        }
                    },

                    /* -- System > Routing > Static Routes ------ */
                    {
                        id: 'pf-routes',
                        label: 'Static Routes',
                        group: 'System > Routing',
                        fields: [
                            {
                                type: 'table',
                                label: 'Static Routes',
                                statePath: 'webMgmt.pf.routeTable',
                                columns: [
                                    { key: 'network',  label: 'Destination Network' },
                                    { key: 'gateway',  label: 'Gateway' },
                                    { key: 'desc',     label: 'Description' },
                                    { key: 'status',   label: 'Status' }
                                ]
                            },
                            {
                                type: 'text',
                                label: 'Destination Network',
                                statePath: 'webMgmt.pf.routeNetwork',
                                placeholder: 'e.g. 10.100.0.0/16'
                            },
                            {
                                type: 'select',
                                label: 'Gateway',
                                statePath: 'webMgmt.pf.routeGateway',
                                options: [
                                    { value: '',              label: '-- Select --' },
                                    { value: '203.0.113.49',  label: '203.0.113.49 (WAN_GW)' },
                                    { value: '10.0.1.254',    label: '10.0.1.254' },
                                    { value: '10.0.1.1',      label: '10.0.1.1 (LAN)' }
                                ]
                            },
                            {
                                type: 'text',
                                label: 'Description',
                                statePath: 'webMgmt.pf.routeDesc',
                                placeholder: 'e.g. Route to HQ via WAN gateway'
                            }
                        ],
                        onSave(state) {
                            const pf = state.webMgmt.pf;
                            if (!pf.routeTable) pf.routeTable = [];
                            const network = (pf.routeNetwork || '').trim();
                            const gateway = pf.routeGateway  || '';
                            const desc    = (pf.routeDesc    || '').trim();

                            if (network && gateway) {
                                pf.routeTable.push({
                                    network: network,
                                    gateway: gateway,
                                    desc: desc || ('Route to ' + network),
                                    status: 'Active'
                                });

                                // Validate static route: 10.100.0.0/16 via 203.0.113.49
                                if (network === '10.100.0.0/16' && gateway === '203.0.113.49') {
                                    pf.route_hq = true;
                                }

                                // Clear form
                                pf.routeNetwork = '';
                                pf.routeGateway = '';
                                pf.routeDesc    = '';
                            }
                        }
                    },

                    /* -- Diagnostics > Ping --------------------- */
                    {
                        id: 'pf-diag-ping',
                        label: 'Ping',
                        group: 'Diagnostics',
                        fields: [
                            {
                                type: 'select',
                                label: 'Source Address',
                                statePath: 'webMgmt.pf.pingSrc',
                                options: [
                                    { value: '',             label: '-- Select --' },
                                    { value: 'WAN',          label: 'WAN (203.0.113.50)' },
                                    { value: 'LAN',          label: 'LAN (10.0.1.1)' },
                                    { value: 'default',      label: 'Default' }
                                ]
                            },
                            {
                                type: 'text',
                                label: 'Hostname or IP',
                                statePath: 'webMgmt.pf.pingTarget',
                                placeholder: 'e.g. 203.0.113.49'
                            },
                            {
                                type: 'select',
                                label: 'Count',
                                statePath: 'webMgmt.pf.pingCount',
                                options: [
                                    { value: '3', label: '3' },
                                    { value: '5', label: '5' },
                                    { value: '10', label: '10' }
                                ]
                            },
                            {
                                type: 'table',
                                label: 'Ping Results',
                                statePath: 'webMgmt.pf.pingResults',
                                columns: [
                                    { key: 'seq',   label: 'Seq' },
                                    { key: 'host',  label: 'Host' },
                                    { key: 'bytes', label: 'Bytes' },
                                    { key: 'time',  label: 'Time' },
                                    { key: 'ttl',   label: 'TTL' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const pf = state.webMgmt.pf;
                            const target = (pf.pingTarget || '').trim();

                            if (target) {
                                pf.pingResults = [
                                    { seq: '1', host: target, bytes: '64', time: '1.24 ms',  ttl: '64' },
                                    { seq: '2', host: target, bytes: '64', time: '0.98 ms',  ttl: '64' },
                                    { seq: '3', host: target, bytes: '64', time: '1.11 ms',  ttl: '64' }
                                ];
                                pf.ping_ran = true;
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
            pf: {
                hostname: 'SATGW-01',
                version: 'pfSense CE 2.7.2',
                platform: 'Netgate 4100',
                uptime: '0 days 00:04:12',
                wanIP: 'Not configured',
                lanIP: 'Not configured',
                dhcpStatus: 'Disabled',
                dnsStatus: 'Disabled',

                /* WAN interface */
                wanIface: 'igb0 (WAN)',
                wanType: '',
                wanAddr: '',
                wanMask: '',
                wanGateway: '',
                wan_configured: false,

                /* LAN interface */
                lanIface: 'igb1 (LAN)',
                lanType: '',
                lanAddr: '',
                lanMask: '',
                lan_configured: false,

                /* Firewall rules */
                fwRuleTable: [],
                fwRuleIface: '',
                fwRuleAction: '',
                fwRuleProto: 'any',
                fwRuleSrc: 'any',
                fwRuleDst: 'any',
                fwRulePort: 'any',
                fwRuleDesc: '',
                fw_lan_allow: false,
                fw_wan_block: false,

                /* Port forwarding */
                portFwdTable: [],
                natFwdIface: '',
                natFwdProto: 'TCP',
                natFwdSrc: 'any',
                natFwdDstPort: '',
                natFwdRedirIP: '',
                natFwdRedirPort: '',
                natFwdDesc: '',
                nat_portfwd_443: false,

                /* DHCP */
                dhcpIface: 'LAN (igb1)',
                dhcpEnable: '',
                dhcpStart: '',
                dhcpEnd: '',
                dhcpDNS: '',
                dhcpGW: '',
                dhcp_configured: false,

                /* DNS Resolver */
                dnsService: 'Unbound DNS Resolver',
                dnsEnable: '',
                dnsListenIface: '',
                dnsFwdEnable: '',
                dnsSec: 'enabled',
                dns_configured: false,

                /* Static Routes */
                routeTable: [],
                routeNetwork: '',
                routeGateway: '',
                routeDesc: '',
                route_hq: false,

                /* Diagnostics Ping */
                pingSrc: '',
                pingTarget: '',
                pingCount: '3',
                pingResults: [
                    { seq: '--', host: '--', bytes: '--', time: '--', ttl: '--' }
                ],
                ping_ran: false
            }
        }
    },

    /* -- 10 Tasks --------------------------------------------- */
    tasks: [
        /* Task 1: Open pfSense web UI */
        {
            id: 'task-01-open-pfsense',
            title: '1. Access pfSense Web Interface',
            description: 'Double-click the "pfSense Admin" icon on the desktop to open the pfSense management dashboard at 10.0.1.1.',
            verify: {
                type: 'window_opened',
                window: 'web_mgmt'
            }
        },
        /* Task 2: Configure WAN interface */
        {
            id: 'task-02-wan',
            title: '2. Configure WAN Interface',
            description: 'Navigate to Interfaces > WAN. Set IPv4 Configuration Type to Static, address to 203.0.113.50, subnet mask /30, and upstream gateway 203.0.113.49. Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.pf.wan_configured',
                value: true
            }
        },
        /* Task 3: Configure LAN interface */
        {
            id: 'task-03-lan',
            title: '3. Configure LAN Interface',
            description: 'Navigate to Interfaces > LAN. Set IPv4 Configuration Type to Static, address to 10.0.1.1 with a /24 subnet mask. Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.pf.lan_configured',
                value: true
            }
        },
        /* Task 4: Enable DHCP server */
        {
            id: 'task-04-dhcp',
            title: '4. Enable DHCP Server',
            description: 'Navigate to Services > DHCP Server. Enable DHCP on the LAN interface with range 10.0.1.100 to 10.0.1.200. Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.pf.dhcp_configured',
                value: true
            }
        },
        /* Task 5: Add LAN allow rule */
        {
            id: 'task-05-fw-lan-allow',
            title: '5. Firewall Rule: Allow LAN to Any',
            description: 'Navigate to Firewall > Rules. Add a rule on the LAN interface: Action = Pass, Protocol = Any, Source = LAN net, Destination = any. Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.pf.fw_lan_allow',
                value: true
            }
        },
        /* Task 6: Add WAN block rule */
        {
            id: 'task-06-fw-wan-block',
            title: '6. Firewall Rule: Block Inbound on WAN',
            description: 'Add a rule on the WAN interface: Action = Block, Protocol = Any, Source = any, Destination = any. This creates an explicit deny-all for unsolicited inbound traffic. Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.pf.fw_wan_block',
                value: true
            }
        },
        /* Task 7: Port forward 443 -> 10.0.1.50 */
        {
            id: 'task-07-nat-portfwd',
            title: '7. Port Forward: HTTPS to Internal Web Server',
            description: 'Navigate to Firewall > NAT > Port Forward. Add a rule: Interface = WAN, Protocol = TCP, Destination Port = 443, Redirect Target IP = 10.0.1.50, Redirect Port = 443. Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.pf.nat_portfwd_443',
                value: true
            }
        },
        /* Task 8: Add static route to HQ */
        {
            id: 'task-08-static-route',
            title: '8. Static Route: HQ Network via WAN Gateway',
            description: 'Navigate to System > Routing > Static Routes. Add a route: Destination Network = 10.100.0.0/16, Gateway = 203.0.113.49 (WAN_GW). Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.pf.route_hq',
                value: true
            }
        },
        /* Task 9: Enable DNS Resolver with forwarding */
        {
            id: 'task-09-dns-resolver',
            title: '9. Enable DNS Resolver with Forwarding',
            description: 'Navigate to Services > DNS Resolver. Enable the resolver and set DNS Query Forwarding to "Enable Forwarding Mode". Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.pf.dns_configured',
                value: true
            }
        },
        /* Task 10: Run diagnostics ping */
        {
            id: 'task-10-diag-ping',
            title: '10. Diagnostics: Verify Connectivity',
            description: 'Navigate to Diagnostics > Ping. Enter the WAN gateway address (203.0.113.49) as the target and click Apply to run a ping test. Verify successful replies.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.pf.ping_ran',
                value: true
            }
        }
    ]
};
