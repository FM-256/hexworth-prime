/* ============================================================
   gui-ne08-unifi-wireless.config.js
   Network+ NE-08 -- Wireless Networking GUI Lab
   Hexworth Prime -- Network+ Course
   2026-03-27

   SCENARIO: Meridian Corp is deploying wireless across their
   3-floor office using UniFi APs. Configure the UniFi Controller:
   create corporate and guest WiFi networks with proper security,
   configure AP radio settings, set up a captive portal for guests,
   configure band steering, enable client isolation on the guest
   network, and integrate with RADIUS for 802.1X enterprise auth.
   ============================================================ */

const GUI_NE08_UNIFI_WIRELESS_CONFIG = {

    id: 'gui-ne08-unifi-wireless',
    title: 'NE-08: UniFi Wireless Controller Lab',
    subtitle: 'Deploy enterprise wireless across a 3-floor office with corporate and guest SSIDs',
    duration: 1800, // 30 minutes
    sequentialTasks: true,

    certObjectives: [
        'N10-009 2.4: Given a scenario, install and configure wireless standards and technologies',
        'N10-009 4.3: Given a scenario, apply network hardening techniques'
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
            label: 'Web Browser\nhttps://10.0.0.5:8443',
            icon: 'browser',
            window: 'web_mgmt',
            webMgmtConfig: {
                title: 'UniFi Network Controller -- Wireless Management',
                sections: [
                    /* -- Dashboard ----------------------------- */
                    {
                        id: 'wifi-dashboard',
                        label: 'Dashboard',
                        group: 'Overview',
                        saveable: false,
                        fields: [
                            { type: 'info', label: 'Controller Version', statePath: 'webMgmt.wifi.controllerVer', default: '8.1.113' },
                            { type: 'info', label: 'Site',               statePath: 'webMgmt.wifi.site',          default: 'Meridian Corp' },
                            { type: 'info', label: 'Connected Clients',  statePath: 'webMgmt.wifi.clientCount',   default: '0' },
                            { type: 'info', label: 'Active APs',        statePath: 'webMgmt.wifi.activeAPs',      default: '3 of 3' },
                            { type: 'info', label: 'SSIDs Configured',  statePath: 'webMgmt.wifi.ssidCount',      default: '0' },
                            {
                                type: 'table',
                                label: 'AP Status',
                                statePath: 'webMgmt.wifi.apStatusTable',
                                columns: [
                                    { key: 'name',     label: 'AP Name' },
                                    { key: 'model',    label: 'Model' },
                                    { key: 'ip',       label: 'IP Address' },
                                    { key: 'clients',  label: 'Clients' },
                                    { key: 'status',   label: 'Status' }
                                ]
                            },
                            {
                                type: 'table',
                                label: 'Channel Utilization',
                                statePath: 'webMgmt.wifi.channelUtilTable',
                                columns: [
                                    { key: 'floor',   label: 'Floor' },
                                    { key: 'ch24',    label: '2.4 GHz Ch' },
                                    { key: 'util24',  label: '2.4 GHz Util' },
                                    { key: 'ch5',     label: '5 GHz Ch' },
                                    { key: 'util5',   label: '5 GHz Util' }
                                ]
                            }
                        ]
                    },
                    /* -- WiFi > Networks ----------------------- */
                    {
                        id: 'wifi-networks',
                        label: 'Networks',
                        group: 'WiFi',
                        fields: [
                            {
                                type: 'table',
                                label: 'Configured SSIDs',
                                statePath: 'webMgmt.wifi.ssidTable',
                                columns: [
                                    { key: 'name',     label: 'SSID' },
                                    { key: 'security', label: 'Security' },
                                    { key: 'vlan',     label: 'VLAN' },
                                    { key: 'band',     label: 'Band' },
                                    { key: 'status',   label: 'Status' }
                                ]
                            },
                            { type: 'text',   label: 'SSID Name',        statePath: 'webMgmt.wifi.newSsidName',     placeholder: 'e.g. MeridianCorp' },
                            {
                                type: 'select',
                                label: 'Security Protocol',
                                statePath: 'webMgmt.wifi.newSsidSecurity',
                                options: [
                                    { value: '',                label: '-- Select Security --' },
                                    { value: 'open',            label: 'Open (No Security)' },
                                    { value: 'wpa2-personal',   label: 'WPA2-Personal' },
                                    { value: 'wpa2-enterprise', label: 'WPA2-Enterprise (802.1X)' },
                                    { value: 'wpa3-personal',   label: 'WPA3-Personal (SAE)' },
                                    { value: 'wpa3-enterprise', label: 'WPA3-Enterprise (802.1X)' }
                                ]
                            },
                            { type: 'text',   label: 'WPA Passphrase',   statePath: 'webMgmt.wifi.newSsidPassword', placeholder: 'Required for Personal modes' },
                            {
                                type: 'select',
                                label: 'VLAN',
                                statePath: 'webMgmt.wifi.newSsidVlan',
                                options: [
                                    { value: '',    label: '-- Select VLAN --' },
                                    { value: '1',   label: 'VLAN 1 (Default)' },
                                    { value: '10',  label: 'VLAN 10 (Corporate)' },
                                    { value: '20',  label: 'VLAN 20 (VoIP)' },
                                    { value: '30',  label: 'VLAN 30 (Management)' },
                                    { value: '50',  label: 'VLAN 50 (Guest)' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Band',
                                statePath: 'webMgmt.wifi.newSsidBand',
                                options: [
                                    { value: '',      label: '-- Select Band --' },
                                    { value: 'both',  label: 'Both (2.4 GHz + 5 GHz)' },
                                    { value: '2.4',   label: '2.4 GHz Only' },
                                    { value: '5',     label: '5 GHz Only' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Quick-Create SSID',
                                statePath: 'webMgmt.wifi.quickCreateSsid',
                                options: [
                                    { value: '',      label: '-- Or Use Quick-Create --' },
                                    { value: 'corp',  label: 'MeridianCorp -- WPA3-Enterprise, VLAN 10, Both Bands' },
                                    { value: 'guest', label: 'MeridianGuest -- WPA3-Personal, VLAN 50, 2.4 GHz, Guest2026!' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const w = state.webMgmt.wifi;
                            if (!w.ssidTable) w.ssidTable = [];
                            const ssids = w.ssidTable;
                            const has = (name) => ssids.some(s => s.name === name);

                            // Quick-create
                            const sel = w.quickCreateSsid;
                            if (sel === 'corp' && !has('MeridianCorp')) {
                                ssids.push({ name: 'MeridianCorp', security: 'WPA3-Enterprise', vlan: '10', band: '2.4 + 5 GHz', status: 'Active' });
                                w.ssidCorpCreated = true;
                            }
                            if (sel === 'guest' && !has('MeridianGuest')) {
                                ssids.push({ name: 'MeridianGuest', security: 'WPA3-Personal', vlan: '50', band: '2.4 GHz', status: 'Active' });
                                w.ssidGuestCreated = true;
                            }

                            // Manual create
                            const name = w.newSsidName;
                            const sec  = w.newSsidSecurity;
                            const vlan = w.newSsidVlan;
                            const band = w.newSsidBand;
                            if (name && sec && vlan && band && !has(name)) {
                                const secLabels = { 'open': 'Open', 'wpa2-personal': 'WPA2-Personal', 'wpa2-enterprise': 'WPA2-Enterprise', 'wpa3-personal': 'WPA3-Personal', 'wpa3-enterprise': 'WPA3-Enterprise' };
                                const bandLabels = { 'both': '2.4 + 5 GHz', '2.4': '2.4 GHz', '5': '5 GHz' };
                                ssids.push({ name: name, security: secLabels[sec] || sec, vlan: vlan, band: bandLabels[band] || band, status: 'Active' });

                                if (name === 'MeridianCorp' && sec === 'wpa3-enterprise' && vlan === '10' && band === 'both') {
                                    w.ssidCorpCreated = true;
                                }
                                if (name === 'MeridianGuest' && sec === 'wpa3-personal' && vlan === '50' && band === '2.4') {
                                    w.ssidGuestCreated = true;
                                }

                                w.newSsidName = '';
                                w.newSsidSecurity = '';
                                w.newSsidPassword = '';
                                w.newSsidVlan = '';
                                w.newSsidBand = '';
                            }

                            w.quickCreateSsid = '';
                            w.ssidCount = String(ssids.length) + ' SSIDs';
                        }
                    },
                    /* -- WiFi > AP Management ------------------ */
                    {
                        id: 'wifi-ap-mgmt',
                        label: 'AP Management',
                        group: 'WiFi',
                        fields: [
                            {
                                type: 'table',
                                label: 'Access Point Radio Configuration',
                                statePath: 'webMgmt.wifi.apConfigTable',
                                columns: [
                                    { key: 'name',    label: 'AP Name' },
                                    { key: 'ch24',    label: '2.4 GHz Ch' },
                                    { key: 'ch5',     label: '5 GHz Ch' },
                                    { key: 'power',   label: 'TX Power' },
                                    { key: 'status',  label: 'Status' }
                                ]
                            },
                            { type: 'info', label: '', statePath: 'webMgmt.wifi.apDivider1', default: '--- Floor 1 AP (UAP-AC-PRO-F1) ---' },
                            {
                                type: 'select',
                                label: 'Floor 1 -- 2.4 GHz Channel',
                                statePath: 'webMgmt.wifi.f1_ch24',
                                options: [
                                    { value: '',     label: '-- Select --' },
                                    { value: 'auto', label: 'Auto' },
                                    { value: '1',    label: 'Channel 1' },
                                    { value: '6',    label: 'Channel 6' },
                                    { value: '11',   label: 'Channel 11' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Floor 1 -- 5 GHz Channel',
                                statePath: 'webMgmt.wifi.f1_ch5',
                                options: [
                                    { value: '',     label: '-- Select --' },
                                    { value: 'auto', label: 'Auto' },
                                    { value: '36',   label: 'Channel 36 (UNII-1)' },
                                    { value: '44',   label: 'Channel 44 (UNII-1)' },
                                    { value: '52',   label: 'Channel 52 (UNII-2 / DFS)' },
                                    { value: '149',  label: 'Channel 149 (UNII-3)' },
                                    { value: '157',  label: 'Channel 157 (UNII-3)' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Floor 1 -- TX Power',
                                statePath: 'webMgmt.wifi.f1_power',
                                options: [
                                    { value: '',       label: '-- Select --' },
                                    { value: 'auto',   label: 'Auto' },
                                    { value: 'high',   label: 'High' },
                                    { value: 'medium', label: 'Medium' },
                                    { value: 'low',    label: 'Low' }
                                ]
                            },
                            { type: 'info', label: '', statePath: 'webMgmt.wifi.apDivider2', default: '--- Floor 2 AP (UAP-AC-PRO-F2) ---' },
                            {
                                type: 'select',
                                label: 'Floor 2 -- 2.4 GHz Channel',
                                statePath: 'webMgmt.wifi.f2_ch24',
                                options: [
                                    { value: '',     label: '-- Select --' },
                                    { value: 'auto', label: 'Auto' },
                                    { value: '1',    label: 'Channel 1' },
                                    { value: '6',    label: 'Channel 6' },
                                    { value: '11',   label: 'Channel 11' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Floor 2 -- 5 GHz Channel',
                                statePath: 'webMgmt.wifi.f2_ch5',
                                options: [
                                    { value: '',     label: '-- Select --' },
                                    { value: 'auto', label: 'Auto' },
                                    { value: '36',   label: 'Channel 36 (UNII-1)' },
                                    { value: '44',   label: 'Channel 44 (UNII-1)' },
                                    { value: '52',   label: 'Channel 52 (UNII-2 / DFS)' },
                                    { value: '149',  label: 'Channel 149 (UNII-3)' },
                                    { value: '157',  label: 'Channel 157 (UNII-3)' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Floor 2 -- TX Power',
                                statePath: 'webMgmt.wifi.f2_power',
                                options: [
                                    { value: '',       label: '-- Select --' },
                                    { value: 'auto',   label: 'Auto' },
                                    { value: 'high',   label: 'High' },
                                    { value: 'medium', label: 'Medium' },
                                    { value: 'low',    label: 'Low' }
                                ]
                            },
                            { type: 'info', label: '', statePath: 'webMgmt.wifi.apDivider3', default: '--- Floor 3 AP (UAP-AC-PRO-F3) ---' },
                            {
                                type: 'select',
                                label: 'Floor 3 -- 2.4 GHz Channel',
                                statePath: 'webMgmt.wifi.f3_ch24',
                                options: [
                                    { value: '',     label: '-- Select --' },
                                    { value: 'auto', label: 'Auto' },
                                    { value: '1',    label: 'Channel 1' },
                                    { value: '6',    label: 'Channel 6' },
                                    { value: '11',   label: 'Channel 11' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Floor 3 -- 5 GHz Channel',
                                statePath: 'webMgmt.wifi.f3_ch5',
                                options: [
                                    { value: '',     label: '-- Select --' },
                                    { value: 'auto', label: 'Auto' },
                                    { value: '36',   label: 'Channel 36 (UNII-1)' },
                                    { value: '44',   label: 'Channel 44 (UNII-1)' },
                                    { value: '52',   label: 'Channel 52 (UNII-2 / DFS)' },
                                    { value: '149',  label: 'Channel 149 (UNII-3)' },
                                    { value: '157',  label: 'Channel 157 (UNII-3)' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Floor 3 -- TX Power',
                                statePath: 'webMgmt.wifi.f3_power',
                                options: [
                                    { value: '',       label: '-- Select --' },
                                    { value: 'auto',   label: 'Auto' },
                                    { value: 'high',   label: 'High' },
                                    { value: 'medium', label: 'Medium' },
                                    { value: 'low',    label: 'Low' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const w = state.webMgmt.wifi;

                            // Floor 1 validation
                            w.apF1Configured = (
                                w.f1_ch24 === '1' &&
                                w.f1_ch5  === '36' &&
                                w.f1_power === 'medium'
                            );

                            // Floor 2 validation
                            w.apF2Configured = (
                                w.f2_ch24 === '6' &&
                                w.f2_ch5  === '149' &&
                                w.f2_power === 'medium'
                            );

                            // Floor 3 validation
                            w.apF3Configured = (
                                w.f3_ch24 === '11' &&
                                w.f3_ch5  === '52' &&
                                w.f3_power === 'medium'
                            );

                            // Update config table
                            w.apConfigTable = [
                                { name: 'UAP-AC-PRO-F1', ch24: w.f1_ch24 ? 'Ch ' + w.f1_ch24 : 'Auto', ch5: w.f1_ch5 ? 'Ch ' + w.f1_ch5 : 'Auto', power: w.f1_power || 'Auto', status: w.apF1Configured ? 'Configured' : 'Pending' },
                                { name: 'UAP-AC-PRO-F2', ch24: w.f2_ch24 ? 'Ch ' + w.f2_ch24 : 'Auto', ch5: w.f2_ch5 ? 'Ch ' + w.f2_ch5 : 'Auto', power: w.f2_power || 'Auto', status: w.apF2Configured ? 'Configured' : 'Pending' },
                                { name: 'UAP-AC-PRO-F3', ch24: w.f3_ch24 ? 'Ch ' + w.f3_ch24 : 'Auto', ch5: w.f3_ch5 ? 'Ch ' + w.f3_ch5 : 'Auto', power: w.f3_power || 'Auto', status: w.apF3Configured ? 'Configured' : 'Pending' }
                            ];

                            // Update channel utilization on dashboard
                            w.channelUtilTable = [
                                { floor: 'Floor 1', ch24: w.f1_ch24 || 'Auto', util24: '12%', ch5: w.f1_ch5 || 'Auto', util5: '8%' },
                                { floor: 'Floor 2', ch24: w.f2_ch24 || 'Auto', util24: '18%', ch5: w.f2_ch5 || 'Auto', util5: '14%' },
                                { floor: 'Floor 3', ch24: w.f3_ch24 || 'Auto', util24: '9%',  ch5: w.f3_ch5 || 'Auto', util5: '6%' }
                            ];
                        }
                    },
                    /* -- WiFi > Guest Portal ------------------- */
                    {
                        id: 'wifi-guest-portal',
                        label: 'Guest Portal',
                        group: 'WiFi',
                        fields: [
                            {
                                type: 'toggle',
                                label: 'Enable Captive Portal',
                                statePath: 'webMgmt.wifi.portalEnabled',
                                onLabel: 'Enabled',
                                offLabel: 'Disabled'
                            },
                            {
                                type: 'select',
                                label: 'Apply to SSID',
                                statePath: 'webMgmt.wifi.portalSsid',
                                options: [
                                    { value: '',              label: '-- Select SSID --' },
                                    { value: 'MeridianGuest', label: 'MeridianGuest' },
                                    { value: 'MeridianCorp',  label: 'MeridianCorp' }
                                ]
                            },
                            { type: 'text', label: 'Redirect URL', statePath: 'webMgmt.wifi.portalRedirect', placeholder: 'e.g. https://guest.meridian.local' },
                            {
                                type: 'toggle',
                                label: 'Require Terms of Service Acceptance',
                                statePath: 'webMgmt.wifi.portalTerms',
                                onLabel: 'Required',
                                offLabel: 'Not Required'
                            },
                            {
                                type: 'select',
                                label: 'Authentication Method',
                                statePath: 'webMgmt.wifi.portalAuth',
                                options: [
                                    { value: '',           label: '-- Select --' },
                                    { value: 'none',       label: 'No Authentication (click-through)' },
                                    { value: 'password',   label: 'Simple Password' },
                                    { value: 'hotspot',    label: 'Hotspot (voucher-based)' },
                                    { value: 'radius',     label: 'External RADIUS' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Session Timeout',
                                statePath: 'webMgmt.wifi.portalTimeout',
                                options: [
                                    { value: '1',   label: '1 Hour' },
                                    { value: '4',   label: '4 Hours' },
                                    { value: '8',   label: '8 Hours (Workday)' },
                                    { value: '24',  label: '24 Hours' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const w = state.webMgmt.wifi;
                            w.portalConfigured = (
                                w.portalEnabled === true &&
                                w.portalRedirect === 'https://guest.meridian.local' &&
                                w.portalTerms === true
                            );
                        }
                    },
                    /* -- WiFi > RADIUS ------------------------- */
                    {
                        id: 'wifi-radius',
                        label: 'RADIUS',
                        group: 'WiFi',
                        fields: [
                            {
                                type: 'toggle',
                                label: 'Enable RADIUS Authentication',
                                statePath: 'webMgmt.wifi.radiusEnabled',
                                onLabel: 'Enabled',
                                offLabel: 'Disabled'
                            },
                            { type: 'text', label: 'RADIUS Server IP',   statePath: 'webMgmt.wifi.radiusServer',   placeholder: 'e.g. 10.0.0.15' },
                            {
                                type: 'select',
                                label: 'Authentication Port',
                                statePath: 'webMgmt.wifi.radiusPort',
                                options: [
                                    { value: '',     label: '-- Select Port --' },
                                    { value: '1812', label: '1812 (Standard)' },
                                    { value: '1645', label: '1645 (Legacy)' }
                                ]
                            },
                            { type: 'text', label: 'Shared Secret',       statePath: 'webMgmt.wifi.radiusSecret',   placeholder: 'RADIUS shared secret' },
                            {
                                type: 'select',
                                label: 'Accounting Port',
                                statePath: 'webMgmt.wifi.radiusAcctPort',
                                options: [
                                    { value: '',     label: '-- Select Port --' },
                                    { value: '1813', label: '1813 (Standard)' },
                                    { value: '1646', label: '1646 (Legacy)' }
                                ]
                            },
                            {
                                type: 'toggle',
                                label: 'Enable RADIUS Accounting',
                                statePath: 'webMgmt.wifi.radiusAccounting',
                                onLabel: 'Enabled',
                                offLabel: 'Disabled'
                            },
                            {
                                type: 'table',
                                label: 'RADIUS Configuration Summary',
                                statePath: 'webMgmt.wifi.radiusSummary',
                                columns: [
                                    { key: 'setting', label: 'Setting' },
                                    { key: 'value',   label: 'Value' },
                                    { key: 'status',  label: 'Status' }
                                ]
                            }
                        ],
                        onSave(state) {
                            const w = state.webMgmt.wifi;
                            w.radiusConfigured = (
                                w.radiusEnabled === true &&
                                w.radiusServer === '10.0.0.15' &&
                                w.radiusPort === '1812' &&
                                w.radiusSecret === 'R4d1us$ecret'
                            );

                            // Update summary table
                            w.radiusSummary = [
                                { setting: 'Server IP',      value: w.radiusServer || '(not set)',  status: w.radiusServer === '10.0.0.15' ? 'OK' : 'Pending' },
                                { setting: 'Auth Port',      value: w.radiusPort || '(not set)',    status: w.radiusPort === '1812' ? 'OK' : 'Pending' },
                                { setting: 'Shared Secret',  value: w.radiusSecret ? '********' : '(not set)', status: w.radiusSecret === 'R4d1us$ecret' ? 'OK' : 'Pending' },
                                { setting: 'Acct Port',      value: w.radiusAcctPort || '(not set)', status: w.radiusAcctPort ? 'OK' : 'Optional' }
                            ];
                        }
                    },
                    /* -- Clients ------------------------------- */
                    {
                        id: 'wifi-clients',
                        label: 'Clients',
                        group: 'Monitoring',
                        saveable: false,
                        fields: [
                            {
                                type: 'table',
                                label: 'Connected Wireless Clients',
                                statePath: 'webMgmt.wifi.clientTable',
                                columns: [
                                    { key: 'hostname', label: 'Hostname' },
                                    { key: 'mac',      label: 'MAC Address' },
                                    { key: 'ip',       label: 'IP Address' },
                                    { key: 'ssid',     label: 'SSID' },
                                    { key: 'ap',       label: 'AP' },
                                    { key: 'band',     label: 'Band' },
                                    { key: 'signal',   label: 'Signal' }
                                ]
                            },
                            { type: 'info', label: 'Note', statePath: 'webMgmt.wifi.clientNote', default: 'Clients will appear after SSIDs are configured and devices connect.' }
                        ]
                    },
                    /* -- Site Settings ------------------------- */
                    {
                        id: 'wifi-site-settings',
                        label: 'Site Settings',
                        group: 'Advanced',
                        fields: [
                            {
                                type: 'select',
                                label: 'Country / Regulatory Domain',
                                statePath: 'webMgmt.wifi.countryCode',
                                options: [
                                    { value: 'US', label: 'United States (US)' },
                                    { value: 'CA', label: 'Canada (CA)' },
                                    { value: 'GB', label: 'United Kingdom (GB)' },
                                    { value: 'DE', label: 'Germany (DE)' },
                                    { value: 'JP', label: 'Japan (JP)' }
                                ]
                            },
                            {
                                type: 'toggle',
                                label: 'Client Isolation (Guest Network)',
                                statePath: 'webMgmt.wifi.guestIsolation',
                                onLabel: 'Enabled -- Clients cannot see each other',
                                offLabel: 'Disabled -- Clients can communicate'
                            },
                            {
                                type: 'select',
                                label: 'Band Steering',
                                statePath: 'webMgmt.wifi.bandSteering',
                                options: [
                                    { value: 'off',         label: 'Off' },
                                    { value: 'prefer-5ghz', label: 'Prefer 5 GHz' },
                                    { value: 'balance',     label: 'Balance (equal distribution)' },
                                    { value: 'force-5ghz',  label: 'Force 5 GHz (block 2.4 GHz capable)' }
                                ]
                            },
                            {
                                type: 'select',
                                label: 'Minimum RSSI (dBm)',
                                statePath: 'webMgmt.wifi.minRssi',
                                options: [
                                    { value: '',     label: '-- Disabled --' },
                                    { value: '-65',  label: '-65 dBm (strict)' },
                                    { value: '-70',  label: '-70 dBm (moderate)' },
                                    { value: '-75',  label: '-75 dBm (balanced)' },
                                    { value: '-80',  label: '-80 dBm (permissive)' },
                                    { value: '-85',  label: '-85 dBm (very permissive)' }
                                ]
                            },
                            {
                                type: 'toggle',
                                label: 'Auto-Optimize Network',
                                statePath: 'webMgmt.wifi.autoOptimize',
                                onLabel: 'Enabled',
                                offLabel: 'Disabled'
                            },
                            {
                                type: 'toggle',
                                label: '802.11r Fast Roaming',
                                statePath: 'webMgmt.wifi.fastRoaming',
                                onLabel: 'Enabled',
                                offLabel: 'Disabled'
                            }
                        ],
                        onSave(state) {
                            const w = state.webMgmt.wifi;
                            w.guestIsolationEnabled = (w.guestIsolation === true);
                            w.bandSteeringConfigured = (
                                w.bandSteering === 'prefer-5ghz' &&
                                w.minRssi === '-75'
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
                title: 'Notepad -- Wireless Deployment Notes',
                sections: [
                    {
                        id: 'notepad-wireless',
                        label: 'Documentation',
                        fields: [
                            { type: 'text', label: 'Corporate SSID',  statePath: 'webMgmt.notepad.corpSsid',   placeholder: 'MeridianCorp - WPA3-Enterprise - VLAN 10' },
                            { type: 'text', label: 'Guest SSID',      statePath: 'webMgmt.notepad.guestSsid',  placeholder: 'MeridianGuest - WPA3-Personal - VLAN 50' },
                            { type: 'text', label: 'RADIUS Server',   statePath: 'webMgmt.notepad.radius',     placeholder: '10.0.0.15:1812' },
                            { type: 'text', label: 'AP Channel Plan',  statePath: 'webMgmt.notepad.channels',   placeholder: 'F1: 1/36, F2: 6/149, F3: 11/52' },
                            { type: 'text', label: 'Notes',            statePath: 'webMgmt.notepad.notes',      placeholder: 'Additional notes...' }
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
            wifi: {
                controllerVer: '8.1.113',
                site: 'Meridian Corp',
                clientCount: '0',
                activeAPs: '3 of 3',
                ssidCount: '0',
                apStatusTable: [
                    { name: 'UAP-AC-PRO-F1', model: 'UAP-AC-PRO', ip: '10.0.0.11', clients: '0', status: 'Connected' },
                    { name: 'UAP-AC-PRO-F2', model: 'UAP-AC-PRO', ip: '10.0.0.12', clients: '0', status: 'Connected' },
                    { name: 'UAP-AC-PRO-F3', model: 'UAP-AC-PRO', ip: '10.0.0.13', clients: '0', status: 'Connected' }
                ],
                channelUtilTable: [
                    { floor: 'Floor 1', ch24: 'Auto', util24: '32%', ch5: 'Auto', util5: '18%' },
                    { floor: 'Floor 2', ch24: 'Auto', util24: '45%', ch5: 'Auto', util5: '22%' },
                    { floor: 'Floor 3', ch24: 'Auto', util24: '28%', ch5: 'Auto', util5: '15%' }
                ],
                ssidTable: [],
                ssidCorpCreated: false,
                ssidGuestCreated: false,
                newSsidName: '',
                newSsidSecurity: '',
                newSsidPassword: '',
                newSsidVlan: '',
                newSsidBand: '',
                quickCreateSsid: '',
                apConfigTable: [
                    { name: 'UAP-AC-PRO-F1', ch24: 'Auto', ch5: 'Auto', power: 'Auto', status: 'Pending' },
                    { name: 'UAP-AC-PRO-F2', ch24: 'Auto', ch5: 'Auto', power: 'Auto', status: 'Pending' },
                    { name: 'UAP-AC-PRO-F3', ch24: 'Auto', ch5: 'Auto', power: 'Auto', status: 'Pending' }
                ],
                apDivider1: '--- Floor 1 AP (UAP-AC-PRO-F1) ---',
                apDivider2: '--- Floor 2 AP (UAP-AC-PRO-F2) ---',
                apDivider3: '--- Floor 3 AP (UAP-AC-PRO-F3) ---',
                f1_ch24: '', f1_ch5: '', f1_power: '',
                f2_ch24: '', f2_ch5: '', f2_power: '',
                f3_ch24: '', f3_ch5: '', f3_power: '',
                apF1Configured: false,
                apF2Configured: false,
                apF3Configured: false,
                portalEnabled: false,
                portalSsid: '',
                portalRedirect: '',
                portalTerms: false,
                portalAuth: '',
                portalTimeout: '8',
                portalConfigured: false,
                radiusEnabled: false,
                radiusServer: '',
                radiusPort: '',
                radiusSecret: '',
                radiusAcctPort: '',
                radiusAccounting: false,
                radiusConfigured: false,
                radiusSummary: [
                    { setting: 'Server IP',     value: '(not set)', status: 'Pending' },
                    { setting: 'Auth Port',     value: '(not set)', status: 'Pending' },
                    { setting: 'Shared Secret', value: '(not set)', status: 'Pending' },
                    { setting: 'Acct Port',     value: '(not set)', status: 'Optional' }
                ],
                clientTable: [
                    { hostname: 'DESKTOP-MRD01', mac: 'AA:BB:CC:11:22:33', ip: '10.10.0.101', ssid: '(pending)', ap: 'F1', band: '5 GHz', signal: '-42 dBm' },
                    { hostname: 'MBP-JSMITH',    mac: 'DD:EE:FF:44:55:66', ip: '10.10.0.102', ssid: '(pending)', ap: 'F2', band: '5 GHz', signal: '-55 dBm' },
                    { hostname: 'IPHONE-GUEST1', mac: '11:22:33:AA:BB:CC', ip: '10.50.0.201', ssid: '(pending)', ap: 'F1', band: '2.4 GHz', signal: '-68 dBm' },
                    { hostname: 'GALAXY-GUEST2', mac: '44:55:66:DD:EE:FF', ip: '10.50.0.202', ssid: '(pending)', ap: 'F3', band: '2.4 GHz', signal: '-72 dBm' }
                ],
                clientNote: 'Clients will appear after SSIDs are configured and devices connect.',
                countryCode: 'US',
                guestIsolation: false,
                guestIsolationEnabled: false,
                bandSteering: 'off',
                minRssi: '',
                autoOptimize: false,
                fastRoaming: false,
                bandSteeringConfigured: false
            },
            notepad: {
                corpSsid: '',
                guestSsid: '',
                radius: '',
                channels: '',
                notes: ''
            }
        }
    },

    /* -- 10 Tasks --------------------------------------------- */
    tasks: [
        /* -- Task 1: Open UniFi Controller -------------------- */
        {
            id: 'task-01-open-controller',
            title: '1. Access the UniFi Controller',
            description: 'Double-click the Web Browser icon on the desktop to open the UniFi Controller at https://10.0.0.5:8443. Review the Dashboard -- note the 3 APs and current channel utilization.',
            verify: {
                type: 'window_opened',
                window: 'web_mgmt'
            }
        },
        /* -- Task 2: Create Corporate SSID -------------------- */
        {
            id: 'task-02-ssid-corp',
            title: '2. Create SSID "MeridianCorp" (WPA3-Enterprise)',
            description: 'Navigate to WiFi > Networks. Create the corporate SSID: Name "MeridianCorp", Security "WPA3-Enterprise (802.1X)", VLAN 10, Both bands. Use Quick-Create or fill in manually, then click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.wifi.ssidCorpCreated',
                value: true
            }
        },
        /* -- Task 3: Create Guest SSID ------------------------ */
        {
            id: 'task-03-ssid-guest',
            title: '3. Create SSID "MeridianGuest" (WPA3-Personal)',
            description: 'In WiFi > Networks, create the guest SSID: Name "MeridianGuest", Security "WPA3-Personal (SAE)", VLAN 50, 2.4 GHz Only, password "Guest2026!". Use Quick-Create or fill in manually, then click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.wifi.ssidGuestCreated',
                value: true
            }
        },
        /* -- Task 4: Enable Client Isolation ------------------ */
        {
            id: 'task-04-guest-isolation',
            title: '4. Enable Client Isolation on Guest Network',
            description: 'Navigate to Site Settings (under Advanced). Enable "Client Isolation (Guest Network)" so guest clients cannot communicate with each other. Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.wifi.guestIsolationEnabled',
                value: true
            }
        },
        /* -- Task 5: Configure RADIUS ------------------------- */
        {
            id: 'task-05-radius',
            title: '5. Configure RADIUS Server for 802.1X',
            description: 'Navigate to WiFi > RADIUS. Enable RADIUS, set Server IP to "10.0.0.15", Authentication Port to "1812", and Shared Secret to "R4d1us$ecret". Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.wifi.radiusConfigured',
                value: true
            }
        },
        /* -- Task 6: Configure AP Floor 1 --------------------- */
        {
            id: 'task-06-ap-floor1',
            title: '6. Configure Floor 1 AP Radio Settings',
            description: 'Navigate to WiFi > AP Management. Set Floor 1 AP: 2.4 GHz to Channel 1, 5 GHz to Channel 36, TX Power to Medium. Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.wifi.apF1Configured',
                value: true
            }
        },
        /* -- Task 7: Configure AP Floor 2 --------------------- */
        {
            id: 'task-07-ap-floor2',
            title: '7. Configure Floor 2 AP Radio Settings',
            description: 'Set Floor 2 AP: 2.4 GHz to Channel 6, 5 GHz to Channel 149, TX Power to Medium. Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.wifi.apF2Configured',
                value: true
            }
        },
        /* -- Task 8: Configure AP Floor 3 --------------------- */
        {
            id: 'task-08-ap-floor3',
            title: '8. Configure Floor 3 AP Radio Settings',
            description: 'Set Floor 3 AP: 2.4 GHz to Channel 11, 5 GHz to Channel 52, TX Power to Medium. Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.wifi.apF3Configured',
                value: true
            }
        },
        /* -- Task 9: Enable Guest Portal ---------------------- */
        {
            id: 'task-09-guest-portal',
            title: '9. Enable Guest Captive Portal',
            description: 'Navigate to WiFi > Guest Portal. Enable the captive portal, set Redirect URL to "https://guest.meridian.local", and enable "Require Terms of Service Acceptance". Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.wifi.portalConfigured',
                value: true
            }
        },
        /* -- Task 10: Band Steering + Min RSSI ---------------- */
        {
            id: 'task-10-band-steering',
            title: '10. Enable Band Steering and Minimum RSSI',
            description: 'Navigate to Site Settings (under Advanced). Set Band Steering to "Prefer 5 GHz" and Minimum RSSI to "-75 dBm (balanced)". Click Apply.',
            verify: {
                type: 'state_value',
                path: 'webMgmt.wifi.bandSteeringConfigured',
                value: true
            }
        }
    ]
};
