/* ============================================================
   gui-ne02-windows-nic.config.js
   NE-02: TCP/IP Protocol Suite — Windows NIC Configuration Lab
   Hexworth Prime — Network+ Course
   2026-03-27

   SCENARIO: Junior network admin at Meridian Corp. Supervisor
   left 10 configuration tasks on your workstation before going
   on vacation. The workstation is pulling an APIPA address —
   no proper network config. Configure the NIC, set up DNS,
   verify connectivity, troubleshoot, and document everything.
   ============================================================ */

const GUI_NE02_WINDOWS_NIC_CONFIG = {

    id: 'gui-ne02-windows-nic',
    title: 'NE-02 Lab: Windows NIC Configuration',
    subtitle: 'Configure a workstation from APIPA to full dual-stack connectivity',
    duration: 1800, // 30 minutes
    sequentialTasks: true,

    certObjectives: [
        'N10-009 1.4: Given a scenario, configure a subnet and use appropriate IP addressing schemes',
        'N10-009 1.6: Explain the use and purpose of network services'
    ],

    scoring: {
        taskPoints: 45,
        timeBonus: 100,
        maxScore: 550
    },

    /* ── Desktop Icons ──────────────────────────────────────── */
    desktop: [
        {
            id: 'network-settings',
            label: 'Network\nSettings',
            icon: 'network',
            window: 'network_adapter'
        },
        {
            id: 'cmd',
            label: 'Command\nPrompt',
            icon: 'terminal',
            window: 'cmd'
        },
        {
            id: 'device-manager',
            label: 'Device\nManager',
            icon: 'device_manager',
            window: 'device_manager'
        },
        {
            id: 'services',
            label: 'Services',
            icon: 'generic',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'Services Console — Local Computer',
                sections: [
                    {
                        id: 'svc-list',
                        label: 'Services',
                        group: 'System',
                        fields: [
                            {
                                type: 'table',
                                label: 'Windows Services',
                                statePath: 'webMgmt.services.serviceTable',
                                columns: [
                                    { key: 'name',    label: 'Service Name' },
                                    { key: 'status',  label: 'Status' },
                                    { key: 'startup', label: 'Startup Type' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'DHCP Client — Status',
                                statePath: 'webMgmt.services.dhcpStatus',
                                options: [
                                    { value: 'stopped', label: 'Stopped' },
                                    { value: 'running', label: 'Running' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'DHCP Client — Startup Type',
                                statePath: 'webMgmt.services.dhcpStartup',
                                options: [
                                    { value: 'disabled',  label: 'Disabled' },
                                    { value: 'manual',    label: 'Manual' },
                                    { value: 'automatic', label: 'Automatic' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'DNS Client — Status',
                                statePath: 'webMgmt.services.dnsStatus',
                                options: [
                                    { value: 'stopped', label: 'Stopped' },
                                    { value: 'running', label: 'Running' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'DNS Client — Startup Type',
                                statePath: 'webMgmt.services.dnsStartup',
                                options: [
                                    { value: 'disabled',  label: 'Disabled' },
                                    { value: 'manual',    label: 'Manual' },
                                    { value: 'automatic', label: 'Automatic' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const svc = state.webMgmt.services;
                            // Update the service table to reflect changes
                            svc.serviceTable = [
                                { name: 'DHCP Client',           status: svc.dhcpStatus === 'running' ? 'Running' : 'Stopped', startup: svc.dhcpStartup === 'automatic' ? 'Automatic' : svc.dhcpStartup === 'manual' ? 'Manual' : 'Disabled' },
                                { name: 'DNS Client',            status: svc.dnsStatus === 'running' ? 'Running' : 'Stopped',  startup: svc.dnsStartup === 'automatic' ? 'Automatic' : svc.dnsStartup === 'manual' ? 'Manual' : 'Disabled' },
                                { name: 'Windows Firewall',      status: 'Running', startup: 'Automatic' },
                                { name: 'Network Location',      status: 'Running', startup: 'Automatic' },
                                { name: 'TCP/IP NetBIOS Helper', status: 'Running', startup: 'Automatic' },
                                { name: 'Workstation',           status: 'Running', startup: 'Automatic' },
                                { name: 'Network Store Interface', status: 'Running', startup: 'Automatic' },
                                { name: 'WinHTTP Web Proxy',     status: 'Stopped', startup: 'Manual' }
                            ];
                            // Track if DHCP client was started and set to Automatic
                            svc.dhcpConfigured = (svc.dhcpStatus === 'running' && svc.dhcpStartup === 'automatic');

                            // Update the services array on the root state so the engine sees it
                            if (svc.dhcpConfigured) {
                                const dhcpSvc = state.services?.find(s => s.name === 'DHCP Client');
                                if (dhcpSvc) {
                                    dhcpSvc.status = 'running';
                                    dhcpSvc.startup = 'Automatic';
                                }
                            }
                        }
                    }
                ]
            }
        },
        {
            id: 'browser',
            label: 'Web Browser',
            icon: 'browser',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'Meridian Corp Intranet — Browser',
                sections: [
                    {
                        id: 'browser-page',
                        label: 'Navigation',
                        group: 'Browser',
                        saveable: false,
                        fields: [
                            {
                                type: 'info',
                                label: 'Address Bar',
                                statePath: 'webMgmt.browser.url',
                                default: 'http://intranet.meridian.local'
                            },
                            {
                                type: 'info',
                                label: 'Page Status',
                                statePath: 'webMgmt.browser.pageStatus',
                                default: 'Page cannot be displayed — No network connectivity'
                            },
                            {
                                type: 'info',
                                label: 'Server IP',
                                statePath: 'webMgmt.browser.serverIp',
                                default: '10.0.1.10 (DNS resolution required)'
                            },
                            {
                                type: 'info',
                                label: 'Error Detail',
                                statePath: 'webMgmt.browser.error',
                                default: 'ERR_NETWORK_CHANGED — Check adapter configuration and DNS settings'
                            }
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
                title: 'Notepad — Network Configuration Documentation',
                sections: [
                    {
                        id: 'notepad-doc',
                        label: 'Documentation',
                        fields: [
                            {
                                type: 'text',
                                label: 'Technician Name',
                                statePath: 'webMgmt.notepad.techName',
                                placeholder: 'Your name'
                            },
                            {
                                type: 'text',
                                label: 'Workstation IP Address',
                                statePath: 'webMgmt.notepad.ipAddress',
                                placeholder: '10.0.1.50'
                            },
                            {
                                type: 'text',
                                label: 'Subnet Mask',
                                statePath: 'webMgmt.notepad.subnetMask',
                                placeholder: '255.255.255.0'
                            },
                            {
                                type: 'text',
                                label: 'Default Gateway',
                                statePath: 'webMgmt.notepad.gateway',
                                placeholder: '10.0.1.1'
                            },
                            {
                                type: 'text',
                                label: 'Primary DNS Server',
                                statePath: 'webMgmt.notepad.primaryDns',
                                placeholder: '10.0.1.10'
                            },
                            {
                                type: 'text',
                                label: 'Secondary DNS Server',
                                statePath: 'webMgmt.notepad.secondaryDns',
                                placeholder: '8.8.8.8'
                            },
                            {
                                type: 'text',
                                label: 'Ethernet0 Adapter Status',
                                statePath: 'webMgmt.notepad.ethernetStatus',
                                placeholder: 'Connected — Static IP'
                            },
                            {
                                type: 'text',
                                label: 'Wi-Fi Adapter Status',
                                statePath: 'webMgmt.notepad.wifiStatus',
                                placeholder: 'Enabled — Not connected'
                            },
                            {
                                type: 'text',
                                label: 'Notes / Issues Found',
                                statePath: 'webMgmt.notepad.notes',
                                placeholder: 'DHCP Client was stopped, no DHCP server on network...'
                            }
                        ],
                        onSave(state) {
                            const n = state.webMgmt.notepad;
                            const fields = [n.ipAddress, n.subnetMask, n.gateway, n.primaryDns, n.secondaryDns, n.ethernetStatus, n.wifiStatus, n.notes];
                            const filled = fields.filter(f => f && f.trim().length > 0).length;
                            // Must fill at least 5 of 8 core fields
                            state.webMgmt.notepad.documentationComplete = filled >= 5;
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
                description: 'Intel(R) I219-LM Gigabit Network Adapter',
                enabled: true,
                connected: true,
                dhcp: true,
                ip: '169.254.83.217',       // APIPA — DHCP enabled but no server responding
                mask: '255.255.0.0',
                gateway: '',
                dns: [],
                mac: '00:1A:2B:3C:4D:5E',
                speed: '1 Gbps',
                duplex: 'Full Duplex',
                driver: 'Intel Corporation',
                driverVersion: '12.19.1.37',
                irq: '11'
            },
            {
                name: 'Wi-Fi',
                description: 'Intel(R) Wi-Fi 6 AX201 160MHz',
                enabled: false,
                connected: false,
                dhcp: true,
                ip: '',
                mask: '',
                gateway: '',
                dns: [],
                mac: '00:5E:6F:7A:8B:9C',
                speed: '--',
                duplex: '--',
                driver: 'Intel Corporation',
                driverVersion: '22.190.0.4',
                irq: '16'
            }
        ],
        services: [
            { name: 'DHCP Client',           status: 'stopped', startup: 'Manual' },
            { name: 'DNS Client',            status: 'running', startup: 'Automatic' },
            { name: 'Windows Firewall',      status: 'running', startup: 'Automatic' },
            { name: 'Network Location',      status: 'running', startup: 'Automatic' },
            { name: 'TCP/IP NetBIOS Helper', status: 'running', startup: 'Automatic' },
            { name: 'Workstation',           status: 'running', startup: 'Automatic' }
        ],
        connectivity: {
            gateway: false,
            internet: false,
            dns: false
        },
        webMgmt: {
            services: {
                serviceTable: [
                    { name: 'DHCP Client',           status: 'Stopped', startup: 'Manual' },
                    { name: 'DNS Client',            status: 'Running', startup: 'Automatic' },
                    { name: 'Windows Firewall',      status: 'Running', startup: 'Automatic' },
                    { name: 'Network Location',      status: 'Running', startup: 'Automatic' },
                    { name: 'TCP/IP NetBIOS Helper', status: 'Running', startup: 'Automatic' },
                    { name: 'Workstation',           status: 'Running', startup: 'Automatic' },
                    { name: 'Network Store Interface', status: 'Running', startup: 'Automatic' },
                    { name: 'WinHTTP Web Proxy',     status: 'Stopped', startup: 'Manual' }
                ],
                dhcpStatus: 'stopped',
                dhcpStartup: 'manual',
                dnsStatus: 'running',
                dnsStartup: 'automatic',
                dhcpConfigured: false
            },
            browser: {
                url: 'http://intranet.meridian.local',
                pageStatus: 'Page cannot be displayed — No network connectivity',
                serverIp: '10.0.1.10 (DNS resolution required)',
                error: 'ERR_NETWORK_CHANGED — Check adapter configuration and DNS settings'
            },
            notepad: {
                techName: '',
                ipAddress: '',
                subnetMask: '',
                gateway: '',
                primaryDns: '',
                secondaryDns: '',
                ethernetStatus: '',
                wifiStatus: '',
                notes: '',
                documentationComplete: false
            }
        }
    },

    /* ── 10 Tasks ──────────────────────────────────────────── */
    tasks: [
        /* ── Task 1: Run ipconfig /all — observe APIPA and DHCP state ── */
        {
            id: 'task-01-ipconfig-observe',
            title: '1. Observe Current IP Configuration',
            description: 'Open Command Prompt and run "ipconfig /all" to examine the current state. Note the APIPA address (169.254.x.x) on Ethernet0 and the fact that DHCP is enabled but no server responded. Also note the Wi-Fi adapter is disabled.',
            verify: {
                type: 'command_run',
                command: 'ipconfig'
            }
        },
        /* ── Task 2: Start DHCP Client service ──────────────────────── */
        {
            id: 'task-02-start-dhcp-service',
            title: '2. Start DHCP Client Service',
            description: 'Open the Services console. The DHCP Client service is currently Stopped with Manual startup. Set it to Running and change the startup type to Automatic. Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.services.dhcpConfigured',
                value: true
            }
        },
        /* ── Task 3: Run ipconfig /renew — fails (no DHCP server) ──── */
        {
            id: 'task-03-ipconfig-renew',
            title: '3. Attempt DHCP Renewal',
            description: 'Run "ipconfig /renew" in Command Prompt. This will fail because there is no DHCP server on this network segment — confirming you need a static configuration. This is expected behavior.',
            verify: {
                type: 'command_run',
                command: 'ipconfig /renew'
            }
        },
        /* ── Task 4: Configure static IPv4 on Ethernet0 ────────────── */
        {
            id: 'task-04-static-ipv4',
            title: '4. Configure Static IPv4 on Ethernet0',
            description: 'Open Network Settings. Configure Ethernet0 with: IP Address 10.0.1.50, Subnet Mask 255.255.255.0, Default Gateway 10.0.1.1, Primary DNS 10.0.1.10, Secondary DNS 8.8.8.8. Click Apply.',
            verify: {
                type: 'adapter_config',
                adapter: 'Ethernet0',
                ip: '10.0.1.50',
                mask: '255.255.255.0',
                gateway: '10.0.1.1',
                dns: ['10.0.1.10', '8.8.8.8']
            }
        },
        /* ── Task 5: Verify new settings with ipconfig /all ────────── */
        {
            id: 'task-05-verify-config',
            title: '5. Verify Applied Configuration',
            description: 'Run "ipconfig /all" again to confirm your static IP settings are correctly applied. You should see 10.0.1.50 as the IPv4 address, 10.0.1.1 as the gateway, and both DNS servers listed.',
            verify: {
                type: 'custom',
                fn: (state) => {
                    const cmds = state._commandsRun || [];
                    // Must have run ipconfig at least twice (once in task 1, once now)
                    const ipconfigRuns = cmds.filter(c => c.toLowerCase().includes('ipconfig'));
                    // Must also have the static IP configured already
                    const adapter = (state.adapters || []).find(a => a.name === 'Ethernet0');
                    return ipconfigRuns.length >= 2 && adapter && adapter.ip === '10.0.1.50';
                }
            }
        },
        /* ── Task 6: Ping gateway ──────────────────────────────────── */
        {
            id: 'task-06-ping-gateway',
            title: '6. Test Gateway Connectivity',
            description: 'Ping the default gateway at 10.0.1.1 to verify Layer 3 connectivity to the local router. You should receive successful replies.',
            verify: {
                type: 'custom',
                fn: (state) => {
                    const cmds = state._commandsRun || [];
                    return cmds.some(c => c.toLowerCase().includes('ping') && c.includes('10.0.1.1')) &&
                           state.connectivity.gateway;
                }
            }
        },
        /* ── Task 7: Ping internet (8.8.8.8) ──────────────────────── */
        {
            id: 'task-07-ping-internet',
            title: '7. Test Internet Connectivity',
            description: 'Ping 8.8.8.8 (Google Public DNS) to verify you have end-to-end internet connectivity through the gateway.',
            verify: {
                type: 'custom',
                fn: (state) => {
                    const cmds = state._commandsRun || [];
                    return cmds.some(c => c.toLowerCase().includes('ping') && c.includes('8.8.8.8')) &&
                           state.connectivity.internet;
                }
            }
        },
        /* ── Task 8: Run nslookup for internal DNS ─────────────────── */
        {
            id: 'task-08-nslookup',
            title: '8. Verify DNS Resolution',
            description: 'Run "nslookup intranet.meridian.local" to verify the internal DNS server at 10.0.1.10 can resolve the corporate intranet hostname.',
            verify: {
                type: 'custom',
                fn: (state) => {
                    const cmds = state._commandsRun || [];
                    return cmds.some(c => c.toLowerCase().includes('nslookup') && c.toLowerCase().includes('intranet.meridian.local')) &&
                           state.connectivity.dns;
                }
            }
        },
        /* ── Task 9: Enable Wi-Fi adapter in Device Manager ────────── */
        {
            id: 'task-09-enable-wifi',
            title: '9. Enable Wi-Fi Adapter',
            description: 'Open Device Manager and enable the disabled Wi-Fi adapter (Intel Wi-Fi 6 AX201). This prepares the workstation for wireless backup connectivity.',
            verify: {
                type: 'custom',
                fn: (state) => {
                    const wifi = (state.adapters || []).find(a => a.name === 'Wi-Fi');
                    return wifi && wifi.enabled === true;
                }
            }
        },
        /* ── Task 10: Document the configuration ───────────────────── */
        {
            id: 'task-10-documentation',
            title: '10. Document the Configuration',
            description: 'Open Notepad and document the completed configuration: IP address, subnet mask, default gateway, primary DNS, secondary DNS, adapter statuses, and any issues encountered. Fill in at least 5 fields and click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.notepad.documentationComplete',
                value: true
            }
        }
    ]
};
