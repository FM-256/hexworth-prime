/* ============================================================
   gui-ne09-linux-network.config.js
   NE-09: Troubleshooting — Linux Network Diagnostics GUI Lab
   Hexworth Prime — Network+ Course
   2026-03-27

   SCENARIO: Sysadmin at Meridian Corp Linux workstation.
   A junior admin made configuration changes and now the workstation
   has the wrong IP (old DHCP lease), no default gateway, and DNS
   pointing to a decommissioned router. Use the real Linux terminal,
   GNOME Network Settings, and config file editor to diagnose and
   fix the issues, then verify full connectivity.

   osType: 'linux' enables Linux command support in the terminal
   (ip addr, ip route, nmcli, ping, traceroute, dig, cat,
   systemctl, journalctl, ss)
   ============================================================ */

const GUI_NE09_LINUX_CONFIG = {

    id: 'gui-ne09-linux-network',
    title: 'NE-09 Lab: Linux Network Troubleshooting',
    subtitle: 'Diagnose and repair misconfigured Linux networking using the terminal, NetworkManager, and config files',
    duration: 1800,
    sequentialTasks: true,
    osType: 'linux',

    knownDomains: {
        'meridian.local': '10.0.1.10',
        'intranet.meridian.local': '10.0.1.10',
        'db.meridian.local': '10.0.1.20',
        'mail.meridian.local': '10.0.1.30',
        'www.meridian.local': '10.0.1.10'
    },

    certObjectives: [
        'N10-009 5.2: Given a scenario, troubleshoot common cable connectivity issues and select the appropriate tools',
        'N10-009 5.3: Given a scenario, use the appropriate network software tools and commands'
    ],

    scoring: {
        taskPoints: 45,
        timeBonus: 100,
        maxScore: 550
    },

    /* ── Desktop Icons (5) ────────────────────────────────────── */
    desktop: [

        /* 1. Terminal — real bash terminal with Linux commands */
        {
            id: 'terminal',
            label: 'Terminal',
            icon: 'terminal',
            window: 'cmd'
        },

        /* 2. Network Settings — GNOME NetworkManager GUI for adapter config */
        {
            id: 'network-settings',
            label: 'Network\nSettings',
            icon: 'network',
            window: 'network_adapter'
        },

        /* 3. System Monitor — read-only system info */
        {
            id: 'system-monitor',
            label: 'System\nMonitor',
            icon: 'generic',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'GNOME System Monitor - Network',
                sections: [
                    {
                        id: 'sysmon-interfaces',
                        label: 'Interfaces',
                        group: 'Network',
                        saveable: false,
                        fields: [
                            {
                                type: 'table',
                                label: 'Network Interfaces',
                                statePath: 'webMgmt.sysmon.ifTable',
                                columns: [
                                    { key: 'iface', label: 'Interface' },
                                    { key: 'ip',    label: 'IP Address' },
                                    { key: 'state', label: 'State' },
                                    { key: 'rx',    label: 'RX (bytes)' },
                                    { key: 'tx',    label: 'TX (bytes)' }
                                ]
                            }
                        ]
                    },
                    {
                        id: 'sysmon-connections',
                        label: 'Connections',
                        group: 'Network',
                        saveable: false,
                        fields: [
                            {
                                type: 'table',
                                label: 'Active Connections',
                                statePath: 'webMgmt.sysmon.connTable',
                                columns: [
                                    { key: 'proto',  label: 'Protocol' },
                                    { key: 'local',  label: 'Local Address' },
                                    { key: 'remote', label: 'Remote Address' },
                                    { key: 'state',  label: 'State' },
                                    { key: 'pid',    label: 'PID/Program' }
                                ]
                            }
                        ]
                    },
                    {
                        id: 'sysmon-services',
                        label: 'Services',
                        group: 'System',
                        saveable: false,
                        fields: [
                            {
                                type: 'table',
                                label: 'Key Network Services',
                                statePath: 'webMgmt.sysmon.serviceTable',
                                columns: [
                                    { key: 'service', label: 'Service' },
                                    { key: 'status',  label: 'Status' },
                                    { key: 'pid',     label: 'PID' },
                                    { key: 'memory',  label: 'Memory' }
                                ]
                            }
                        ]
                    }
                ]
            }
        },

        /* 4. Text Editor — view/edit /etc config files */
        {
            id: 'text-editor',
            label: 'Text\nEditor',
            icon: 'services',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'Text Editor - /etc/ Configuration Files',
                sections: [
                    {
                        id: 'edit-resolv',
                        label: '/etc/resolv.conf',
                        group: 'Config Files',
                        fields: [
                            {
                                type: 'text',
                                label: '/etc/resolv.conf (edit below)',
                                statePath: 'webMgmt.textEditor.resolvConf',
                                placeholder: '# Generated by NetworkManager\nnameserver 10.0.1.10\nnameserver 8.8.8.8'
                            },
                            {
                                type: 'info',
                                label: 'Current Content',
                                statePath: 'webMgmt.textEditor.resolvConfDisplay',
                                default: '# Generated by NetworkManager\nnameserver 192.168.1.1  <-- OLD: pointing to decommissioned router'
                            }
                        ],
                        onSave(state) {
                            if (!state.webMgmt.textEditor) state.webMgmt.textEditor = {};
                            const content = state.webMgmt.textEditor.resolvConf || '';
                            state.webMgmt.textEditor.resolvConfDisplay = content || '(empty)';
                            if (content.includes('10.0.1.10')) {
                                const eth0 = (state.adapters || []).find(a => a.name === 'eth0');
                                if (eth0) {
                                    const dnsServers = [];
                                    content.split('\n').forEach(line => {
                                        const m = line.match(/^\s*nameserver\s+(\S+)/);
                                        if (m) dnsServers.push(m[1]);
                                    });
                                    if (dnsServers.length > 0) eth0.dns = dnsServers;
                                }
                                state.webMgmt.textEditor.resolvConfFixed = true;
                            }
                        }
                    },
                    {
                        id: 'edit-hosts',
                        label: '/etc/hosts',
                        group: 'Config Files',
                        saveable: false,
                        fields: [
                            {
                                type: 'info',
                                label: '/etc/hosts (read-only)',
                                statePath: 'webMgmt.textEditor.hostsDisplay',
                                default: '127.0.0.1    localhost\n127.0.1.1    meridian-ws01\n10.0.1.10    meridian.local  intranet.meridian.local\n10.0.1.20    db.meridian.local\n10.0.1.30    mail.meridian.local'
                            }
                        ]
                    },
                    {
                        id: 'edit-interfaces',
                        label: '/etc/network/interfaces',
                        group: 'Config Files',
                        saveable: false,
                        fields: [
                            {
                                type: 'info',
                                label: '/etc/network/interfaces (managed by NetworkManager)',
                                statePath: 'webMgmt.textEditor.interfacesDisplay',
                                default: '# This file is managed by NetworkManager.\n# Manual edits will be overwritten.\n# See: nmcli con mod "Wired connection 1" ...\n\nauto lo\niface lo inet loopback\n\n# eth0 — controlled by NetworkManager\n# eth1 — controlled by NetworkManager (currently DOWN)'
                            }
                        ]
                    }
                ]
            }
        },

        /* 5. Notepad — documentation */
        {
            id: 'notepad',
            label: 'Notepad',
            icon: 'generic',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'Notepad - Troubleshooting Documentation',
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
                                label: 'Subnet / CIDR',
                                statePath: 'webMgmt.notepad.subnet',
                                placeholder: '/24 (255.255.255.0)'
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
                                label: 'eth0 Status',
                                statePath: 'webMgmt.notepad.eth0Status',
                                placeholder: 'Connected — Static 10.0.1.50/24'
                            },
                            {
                                type: 'text',
                                label: 'eth1 Status',
                                statePath: 'webMgmt.notepad.eth1Status',
                                placeholder: 'DOWN — needs bonding config'
                            },
                            {
                                type: 'text',
                                label: 'Issues Found / Resolution Notes',
                                statePath: 'webMgmt.notepad.notes',
                                placeholder: 'Wrong IP from old DHCP, no default route, DNS pointing to old router...'
                            }
                        ],
                        onSave(state) {
                            const n = state.webMgmt.notepad;
                            const fields = [n.ipAddress, n.subnet, n.gateway, n.primaryDns, n.secondaryDns, n.eth0Status, n.eth1Status, n.notes];
                            const filled = fields.filter(f => f && f.trim().length > 0).length;
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
                name: 'eth0',
                description: 'Intel I350 Gigabit Ethernet (Wired connection 1)',
                type: 'Ethernet',
                enabled: true,
                connected: true,
                dhcp: true,
                ip: '192.168.1.100',
                mask: '255.255.255.0',
                cidr: '24',
                broadcast: '192.168.1.255',
                gateway: '',
                dns: ['192.168.1.1'],
                mac: '00:1A:2B:3C:4D:5E',
                speed: '1000 Mbps',
                duplex: 'Full'
            },
            {
                name: 'eth1',
                description: 'Intel I350 Gigabit Ethernet (Wired connection 2)',
                type: 'Ethernet',
                enabled: false,
                connected: false,
                dhcp: false,
                ip: '',
                mask: '',
                cidr: '24',
                gateway: '',
                dns: [],
                mac: '00:1A:2B:3C:4D:5F',
                speed: '--',
                duplex: '--'
            }
        ],
        services: [
            { name: 'NetworkManager',   status: 'running', startup: 'enabled' },
            { name: 'systemd-resolved', status: 'running', startup: 'enabled' },
            { name: 'sshd',             status: 'running', startup: 'enabled' },
            { name: 'firewalld',        status: 'running', startup: 'enabled' }
        ],
        connectivity: {
            gateway: false,
            internet: false,
            dns: false
        },
        webMgmt: {
            sysmon: {
                ifTable: [
                    { iface: 'lo',   ip: '127.0.0.1',    state: 'UP',   rx: '1,204,832',  tx: '1,204,832' },
                    { iface: 'eth0', ip: '192.168.1.100', state: 'UP',   rx: '45,812,448', tx: '3,209,114' },
                    { iface: 'eth1', ip: '(none)',         state: 'DOWN', rx: '0',          tx: '0' }
                ],
                connTable: [
                    { proto: 'tcp', local: '0.0.0.0:22',       remote: '0.0.0.0:*',         state: 'LISTEN',      pid: '1024/sshd' },
                    { proto: 'tcp', local: '0.0.0.0:80',       remote: '0.0.0.0:*',         state: 'LISTEN',      pid: '1832/nginx' },
                    { proto: 'tcp', local: '0.0.0.0:443',      remote: '0.0.0.0:*',         state: 'LISTEN',      pid: '1832/nginx' },
                    { proto: 'tcp', local: '127.0.0.1:5432',   remote: '0.0.0.0:*',         state: 'LISTEN',      pid: '2104/postgres' },
                    { proto: 'tcp', local: '192.168.1.100:22', remote: '10.0.1.5:52148',    state: 'ESTABLISHED', pid: '3842/sshd' }
                ],
                serviceTable: [
                    { service: 'NetworkManager',   status: 'active (running)', pid: '842',  memory: '12.4 MiB' },
                    { service: 'systemd-resolved', status: 'active (running)', pid: '618',  memory: '8.2 MiB' },
                    { service: 'sshd',             status: 'active (running)', pid: '1024', memory: '4.1 MiB' },
                    { service: 'nginx',            status: 'active (running)', pid: '1832', memory: '22.8 MiB' },
                    { service: 'postgresql',       status: 'active (running)', pid: '2104', memory: '48.6 MiB' },
                    { service: 'firewalld',        status: 'active (running)', pid: '712',  memory: '18.4 MiB' }
                ]
            },
            textEditor: {
                resolvConf: '',
                resolvConfDisplay: '# Generated by NetworkManager\nnameserver 192.168.1.1  <-- OLD: pointing to decommissioned router',
                resolvConfFixed: false,
                hostsDisplay: '127.0.0.1    localhost\n127.0.1.1    meridian-ws01\n10.0.1.10    meridian.local  intranet.meridian.local\n10.0.1.20    db.meridian.local\n10.0.1.30    mail.meridian.local',
                interfacesDisplay: '# Managed by NetworkManager — do not edit manually\nauto lo\niface lo inet loopback'
            },
            notepad: {
                techName: '',
                ipAddress: '',
                subnet: '',
                gateway: '',
                primaryDns: '',
                secondaryDns: '',
                eth0Status: '',
                eth1Status: '',
                notes: '',
                documentationComplete: false
            }
        }
    },

    /* ── 10 Tasks ──────────────────────────────────────────── */
    tasks: [

        /* Task 1: Run ip addr show */
        {
            id: 'task-01-ip-addr-show',
            title: '1. Examine Interface Configuration',
            description: 'Open the Terminal and run "ip addr show" to examine the current network state. Observe that eth0 has the wrong IP address (192.168.1.100 from an old DHCP lease) and eth1 is DOWN.',
            verify: {
                type: 'command_run',
                command: 'ip addr'
            }
        },

        /* Task 2: Run ip route show */
        {
            id: 'task-02-ip-route-show',
            title: '2. Check Routing Table',
            description: 'In the Terminal, run "ip route show" to view the routing table. Note there is no default route configured — traffic cannot leave the local subnet.',
            verify: {
                type: 'command_run',
                command: 'ip route'
            }
        },

        /* Task 3: Set static IP 10.0.1.50/24 via Network Settings */
        {
            id: 'task-03-static-ip',
            title: '3. Set Static IP on eth0',
            description: 'Open Network Settings. Configure eth0 with a static IP address of 10.0.1.50 and subnet mask 255.255.255.0 (/24). Click Apply.',
            verify: {
                type: 'adapter_config',
                adapter: 'eth0',
                ip: '10.0.1.50',
                mask: '255.255.255.0'
            }
        },

        /* Task 4: Set gateway 10.0.1.1 */
        {
            id: 'task-04-set-gateway',
            title: '4. Configure Default Gateway',
            description: 'In Network Settings, set the default gateway for eth0 to 10.0.1.1. Click Apply to save.',
            verify: {
                type: 'adapter_config',
                adapter: 'eth0',
                gateway: '10.0.1.1'
            }
        },

        /* Task 5: Set DNS 10.0.1.10 and 8.8.8.8 */
        {
            id: 'task-05-set-dns',
            title: '5. Configure DNS Servers',
            description: 'In Network Settings, set the primary DNS server to 10.0.1.10 (Meridian corporate DNS) and secondary DNS to 8.8.8.8 (Google fallback). Click Apply.',
            verify: {
                type: 'adapter_config',
                adapter: 'eth0',
                dns: '10.0.1.10'
            }
        },

        /* Task 6: Apply with nmcli con up */
        {
            id: 'task-06-nmcli-apply',
            title: '6. Activate Updated Connection',
            description: 'Open the Terminal and run "nmcli con up" followed by the connection name to activate the updated network configuration on eth0.',
            verify: {
                type: 'command_run',
                command: 'nmcli con up'
            }
        },

        /* Task 7: Verify ip addr show again */
        {
            id: 'task-07-verify-ip',
            title: '7. Verify New IP Configuration',
            description: 'Run "ip addr show" again in the Terminal. Confirm that eth0 now shows 10.0.1.50/24 instead of the old 192.168.1.100 address.',
            verify: {
                type: 'command_run',
                command: 'ip addr'
            }
        },

        /* Task 8: Ping gateway and internet */
        {
            id: 'task-08-ping-verify',
            title: '8. Test Connectivity',
            description: 'Ping the gateway (10.0.1.1) and an external host (8.8.8.8) from the Terminal to verify connectivity is restored.',
            verify: {
                type: 'ping_success'
            }
        },

        /* Task 9: Run dig meridian.local */
        {
            id: 'task-09-dig-dns',
            title: '9. Verify DNS Resolution',
            description: 'Run "dig meridian.local" in the Terminal to verify that DNS resolution is working with the new DNS server configuration.',
            verify: {
                type: 'command_run',
                command: 'dig'
            }
        },

        /* Task 10: Document in Notepad */
        {
            id: 'task-10-documentation',
            title: '10. Document the Troubleshooting',
            description: 'Open Notepad and document the completed troubleshooting: IP address, subnet, gateway, DNS servers, interface statuses, and issues found. Fill in at least 5 of the 8 fields and click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.notepad.documentationComplete',
                value: true
            }
        }
    ]
};
