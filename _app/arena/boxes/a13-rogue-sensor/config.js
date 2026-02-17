/* ============================================================
   CTF ARENA — Box A13: The Rogue Sensor Node
   IoT Exploitation & Network Pivoting | Arboreal Collective
   Config: Two-host state machine, SSH tunneling, MongoDB,
           sensor web UI, filesystem, flags, hints, lore
   ============================================================ */

const A13Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Rogue Sensor Node',
    subtitle: 'IoT Exploitation — Arboreal Collective',
    difficulty: 'Advanced',
    accent: '#27ae60',
    storageKey: 'hexworth_ctf_a13',
    trackerKey: 'ctf_a13',

    // ═══════════════════════════════════════════════════════
    // STATE MACHINE — Two-host pivot tracking
    // ═══════════════════════════════════════════════════════

    _state: {
        sensorAccess: false,      // true after SSH or Telnet to SENSOR-NODE-01
        sensorShell: false,       // true when in sensor shell context
        pivotEstablished: false,  // true after SSH -L tunnel is set up
        dataHubAccess: false      // true after connecting to DATA-HUB MongoDB
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Kali Linux BIOS v4.2.1',
            'Initializing hardware...',
            'Memory Test: 8192 MB OK',
            'Detecting drives... /dev/sda1 (256GB SSD)',
            'PXE-E61: Media test failure, check cable',
            'PXE-M0F: Exiting PXE ROM.',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Kali GNU/Linux',
            'Kali GNU/Linux (recovery mode)',
            'Advanced options for Kali GNU/Linux'
        ],
        loginUser: 'kali'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',     icon: '\uD83C\uDF10',       app: 'browser'  },
            { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD',       app: 'notes'    },
            { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1',       app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9',       app: 'flags'    }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 192.168.2.100 (SENSOR-NODE-01)\n'
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', value: 'flag{s3ns0r_n0d3_d3f4ult_cr3ds}', points: 100 },
        { id: 'root', value: 'flag{b10_m4n1f3st_p1v0t_succ3ss}', points: 200 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
        hintPenalty: -50,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 1200000, points: 100 }   // 20 minutes (Advanced box)
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: "The sensor node has default credentials. Try admin:admin on SSH or Telnet. The Telnet debug console doesn't even require authentication.",
            penalty: -50
        },
        {
            id: 'hint2',
            text: "Once on the sensor node, check the network interfaces — it has two NICs. eth0 faces you (192.168.2.100), eth1 connects to the internal network (10.10.2.1). Check /etc/arboreal/hub.conf for DATA-HUB connection details.",
            penalty: -50
        },
        {
            id: 'hint3',
            text: "Use SSH port forwarding to reach the internal network: ssh -L 27017:10.10.2.10:27017 admin@192.168.2.100 — this tunnels MongoDB through the sensor.",
            penalty: -50
        },
        {
            id: 'hint4',
            text: "MongoDB on DATA-HUB has no authentication. After establishing the tunnel, connect with: mongo 127.0.0.1:27017/arboreal and then run db.manifests.find() to retrieve the Bio-Manifest.",
            penalty: -50
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        outro: 'The Rogue Sensor Node has been compromised. What the Arboreal Collective believed was security through obscurity — a hidden sensor deep in the urban jungle — turned out to be a wide-open door. Default credentials on an IoT device, a dual-homed network bridge, and an unauthenticated database: the trifecta of embedded system negligence. The Bio-Manifest is yours.'
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — SENSOR-NODE-01 Dashboard
    // IoT embedded device interface: minimal, industrial
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://192.168.2.100/',

        pages: {

            // ── Page 1: Sensor Status Dashboard ──────────────
            '/': {
                title: 'SENSOR-NODE-01 — Status',
                html: `
                    <div style="background:#1a2e1a; min-height:100%; padding:20px; font-family:'Courier New',monospace; color:#a8d8a8;">

                        <div style="border-bottom:1px solid #3a5a3a; padding-bottom:12px; margin-bottom:20px;">
                            <div style="display:flex; justify-content:space-between; align-items:center;">
                                <div>
                                    <h1 style="color:#4ae44a; font-size:1.1rem; margin:0 0 2px; letter-spacing:0.15em;">SENSOR-NODE-01</h1>
                                    <div style="color:#6a9a6a; font-size:0.68rem;">Arboreal Collective Environmental Monitoring Unit</div>
                                </div>
                                <div style="text-align:right;">
                                    <div style="color:#4ae44a; font-size:0.72rem;">&#9679; ONLINE</div>
                                    <div style="color:#6a9a6a; font-size:0.62rem;">Uptime: 847d 14h 22m</div>
                                </div>
                            </div>
                        </div>

                        <div style="color:#4ae44a; font-size:0.72rem; font-weight:bold; letter-spacing:0.15em; margin-bottom:10px; border-bottom:1px solid #2a4a2a; padding-bottom:4px;">ENVIRONMENT READINGS</div>

                        <table style="width:100%; border-collapse:collapse; font-size:0.78rem; margin-bottom:20px;">
                            <tr style="border-bottom:1px solid #2a4a2a;">
                                <td style="padding:6px 8px; color:#6a9a6a;">Temperature</td>
                                <td style="padding:6px 8px; color:#a8d8a8; text-align:right; font-family:monospace;">28.4&deg;C</td>
                                <td style="padding:6px 8px; color:#4ae44a; text-align:right;">&#9650; Normal</td>
                            </tr>
                            <tr style="border-bottom:1px solid #2a4a2a;">
                                <td style="padding:6px 8px; color:#6a9a6a;">Humidity</td>
                                <td style="padding:6px 8px; color:#a8d8a8; text-align:right; font-family:monospace;">73.1%</td>
                                <td style="padding:6px 8px; color:#4ae44a; text-align:right;">&#9650; Normal</td>
                            </tr>
                            <tr style="border-bottom:1px solid #2a4a2a;">
                                <td style="padding:6px 8px; color:#6a9a6a;">Soil Moisture</td>
                                <td style="padding:6px 8px; color:#a8d8a8; text-align:right; font-family:monospace;">42.8%</td>
                                <td style="padding:6px 8px; color:#4ae44a; text-align:right;">&#9650; Normal</td>
                            </tr>
                            <tr style="border-bottom:1px solid #2a4a2a;">
                                <td style="padding:6px 8px; color:#6a9a6a;">Air Quality (AQI)</td>
                                <td style="padding:6px 8px; color:#a8d8a8; text-align:right; font-family:monospace;">38</td>
                                <td style="padding:6px 8px; color:#4ae44a; text-align:right;">&#9650; Good</td>
                            </tr>
                            <tr style="border-bottom:1px solid #2a4a2a;">
                                <td style="padding:6px 8px; color:#6a9a6a;">Light Level</td>
                                <td style="padding:6px 8px; color:#a8d8a8; text-align:right; font-family:monospace;">1240 lux</td>
                                <td style="padding:6px 8px; color:#4ae44a; text-align:right;">&#9650; Normal</td>
                            </tr>
                            <tr>
                                <td style="padding:6px 8px; color:#6a9a6a;">UV Index</td>
                                <td style="padding:6px 8px; color:#a8d8a8; text-align:right; font-family:monospace;">4.2</td>
                                <td style="padding:6px 8px; color:#e8c84a; text-align:right;">&#9650; Moderate</td>
                            </tr>
                        </table>

                        <div style="color:#4ae44a; font-size:0.72rem; font-weight:bold; letter-spacing:0.15em; margin-bottom:10px; border-bottom:1px solid #2a4a2a; padding-bottom:4px;">SYSTEM INFO</div>

                        <table style="width:100%; border-collapse:collapse; font-size:0.72rem; margin-bottom:16px;">
                            <tr style="border-bottom:1px solid #2a4a2a;">
                                <td style="padding:4px 8px; color:#6a9a6a;">Model</td>
                                <td style="padding:4px 8px; color:#a8d8a8;">ARB-SN100 Rev 3.2</td>
                            </tr>
                            <tr style="border-bottom:1px solid #2a4a2a;">
                                <td style="padding:4px 8px; color:#6a9a6a;">Firmware</td>
                                <td style="padding:4px 8px; color:#a8d8a8;">v2.1.4-arboreal (build 20230319)</td>
                            </tr>
                            <tr style="border-bottom:1px solid #2a4a2a;">
                                <td style="padding:4px 8px; color:#6a9a6a;">CPU</td>
                                <td style="padding:4px 8px; color:#a8d8a8;">ARM Cortex-A53 @ 1.2GHz</td>
                            </tr>
                            <tr style="border-bottom:1px solid #2a4a2a;">
                                <td style="padding:4px 8px; color:#6a9a6a;">Memory</td>
                                <td style="padding:4px 8px; color:#a8d8a8;">512MB (187MB used)</td>
                            </tr>
                            <tr>
                                <td style="padding:4px 8px; color:#6a9a6a;">Storage</td>
                                <td style="padding:4px 8px; color:#a8d8a8;">8GB eMMC (2.1GB used)</td>
                            </tr>
                        </table>

                        <div style="margin-top:16px; padding:8px; border:1px solid #2a4a2a; font-size:0.65rem; color:#4a6a4a; text-align:center;">
                            <a href="/config/" style="color:#6a9a6a; text-decoration:none; margin:0 12px;">Configuration</a>
                            <span style="color:#3a5a3a;">|</span>
                            <a href="/admin/" style="color:#6a9a6a; text-decoration:none; margin:0 12px;">Admin Panel</a>
                        </div>
                    </div>
                `
            },

            // ── Page 2: Configuration / Network Interfaces ───
            '/config/': {
                title: 'SENSOR-NODE-01 — Configuration',
                html: `
                    <div style="background:#1a2e1a; min-height:100%; padding:20px; font-family:'Courier New',monospace; color:#a8d8a8;">

                        <div style="border-bottom:1px solid #3a5a3a; padding-bottom:12px; margin-bottom:20px;">
                            <h1 style="color:#4ae44a; font-size:1.1rem; margin:0 0 2px; letter-spacing:0.15em;">SENSOR-NODE-01</h1>
                            <div style="color:#6a9a6a; font-size:0.68rem;">Network &amp; Sensor Configuration</div>
                        </div>

                        <div style="color:#4ae44a; font-size:0.72rem; font-weight:bold; letter-spacing:0.15em; margin-bottom:10px; border-bottom:1px solid #2a4a2a; padding-bottom:4px;">NETWORK INTERFACES</div>

                        <div style="background:#0d1a0d; border:1px solid #2a4a2a; border-radius:4px; padding:12px; font-size:0.75rem; margin-bottom:16px;">
<pre style="margin:0; color:#a8d8a8; white-space:pre-wrap;">eth0: &lt;BROADCAST,MULTICAST,UP&gt;
    inet 192.168.2.100/24
    gateway 192.168.2.1
    status: UP
    description: External monitoring LAN

eth1: &lt;BROADCAST,MULTICAST,UP&gt;
    inet 10.10.2.1/24
    gateway: none (direct link)
    status: UP
    description: Internal data collection network</pre>
                        </div>

                        <div style="color:#4ae44a; font-size:0.72rem; font-weight:bold; letter-spacing:0.15em; margin-bottom:10px; border-bottom:1px solid #2a4a2a; padding-bottom:4px;">CONNECTED DEVICES (eth1)</div>

                        <table style="width:100%; border-collapse:collapse; font-size:0.72rem; margin-bottom:20px;">
                            <thead>
                                <tr style="border-bottom:1px solid #3a5a3a;">
                                    <th style="padding:6px 8px; text-align:left; color:#4ae44a;">Hostname</th>
                                    <th style="padding:6px 8px; text-align:left; color:#4ae44a;">IP Address</th>
                                    <th style="padding:6px 8px; text-align:left; color:#4ae44a;">Role</th>
                                    <th style="padding:6px 8px; text-align:left; color:#4ae44a;">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style="border-bottom:1px solid #2a4a2a;">
                                    <td style="padding:4px 8px; color:#a8d8a8;">DATA-HUB-01</td>
                                    <td style="padding:4px 8px; color:#a8d8a8; font-family:monospace;">10.10.2.10</td>
                                    <td style="padding:4px 8px; color:#6a9a6a;">Central Data Aggregator</td>
                                    <td style="padding:4px 8px; color:#4ae44a;">&#9679; Online</td>
                                </tr>
                                <tr style="border-bottom:1px solid #2a4a2a;">
                                    <td style="padding:4px 8px; color:#a8d8a8;">SENSOR-NODE-01</td>
                                    <td style="padding:4px 8px; color:#a8d8a8; font-family:monospace;">10.10.2.1</td>
                                    <td style="padding:4px 8px; color:#6a9a6a;">This Device (gateway)</td>
                                    <td style="padding:4px 8px; color:#4ae44a;">&#9679; Online</td>
                                </tr>
                            </tbody>
                        </table>

                        <div style="color:#4ae44a; font-size:0.72rem; font-weight:bold; letter-spacing:0.15em; margin-bottom:10px; border-bottom:1px solid #2a4a2a; padding-bottom:4px;">DATA HUB CONNECTION</div>

                        <table style="width:100%; border-collapse:collapse; font-size:0.72rem; margin-bottom:16px;">
                            <tr style="border-bottom:1px solid #2a4a2a;">
                                <td style="padding:4px 8px; color:#6a9a6a; width:35%;">Hub Address</td>
                                <td style="padding:4px 8px; color:#a8d8a8; font-family:monospace;">10.10.2.10</td>
                            </tr>
                            <tr style="border-bottom:1px solid #2a4a2a;">
                                <td style="padding:4px 8px; color:#6a9a6a;">Hub Protocol</td>
                                <td style="padding:4px 8px; color:#a8d8a8;">MongoDB (port 27017)</td>
                            </tr>
                            <tr style="border-bottom:1px solid #2a4a2a;">
                                <td style="padding:4px 8px; color:#6a9a6a;">Hub Database</td>
                                <td style="padding:4px 8px; color:#a8d8a8;">arboreal</td>
                            </tr>
                            <tr style="border-bottom:1px solid #2a4a2a;">
                                <td style="padding:4px 8px; color:#6a9a6a;">Authentication</td>
                                <td style="padding:4px 8px; color:#e8c84a;">None (trusted network)</td>
                            </tr>
                            <tr>
                                <td style="padding:4px 8px; color:#6a9a6a;">Sync Interval</td>
                                <td style="padding:4px 8px; color:#a8d8a8;">Every 60 seconds</td>
                            </tr>
                        </table>

                        <div style="margin-top:12px; padding:8px 10px; background:#2a1a0d; border:1px solid #4a3a1a; border-radius:3px; font-size:0.65rem; color:#e8c84a;">
                            &#9888; Warning: Data Hub connection uses no authentication. Ensure network segmentation is properly enforced.
                        </div>

                        <div style="margin-top:16px; padding:8px; border:1px solid #2a4a2a; font-size:0.65rem; color:#4a6a4a; text-align:center;">
                            <a href="/" style="color:#6a9a6a; text-decoration:none; margin:0 12px;">Dashboard</a>
                            <span style="color:#3a5a3a;">|</span>
                            <a href="/admin/" style="color:#6a9a6a; text-decoration:none; margin:0 12px;">Admin Panel</a>
                        </div>
                    </div>
                `
            },

            // ── Page 3: Admin Panel (default creds: admin/admin) ──
            '/admin/': {
                title: 'SENSOR-NODE-01 — Admin Login',
                html: `
                    <div style="background:#1a2e1a; min-height:100%; padding:20px; font-family:'Courier New',monospace; color:#a8d8a8;">

                        <div style="border-bottom:1px solid #3a5a3a; padding-bottom:12px; margin-bottom:20px;">
                            <h1 style="color:#4ae44a; font-size:1.1rem; margin:0 0 2px; letter-spacing:0.15em;">SENSOR-NODE-01</h1>
                            <div style="color:#6a9a6a; font-size:0.68rem;">Admin Panel &mdash; Authentication Required</div>
                        </div>

                        <div style="max-width:360px; margin:40px auto;">
                            <div style="background:#0d1a0d; border:1px solid #2a4a2a; border-radius:4px; padding:24px;">
                                <div style="color:#4ae44a; font-size:0.78rem; font-weight:bold; letter-spacing:0.1em; margin-bottom:16px; text-align:center;">ADMIN LOGIN</div>

                                <div style="margin-bottom:12px;">
                                    <label style="display:block; color:#6a9a6a; font-size:0.68rem; margin-bottom:4px; letter-spacing:0.1em;">USERNAME</label>
                                    <input type="text" data-field="username"
                                           placeholder="admin"
                                           style="width:100%; padding:8px 10px; background:#1a2e1a; border:1px solid #3a5a3a; border-radius:3px; color:#a8d8a8; font-family:monospace; font-size:0.78rem; box-sizing:border-box;">
                                </div>

                                <div style="margin-bottom:16px;">
                                    <label style="display:block; color:#6a9a6a; font-size:0.68rem; margin-bottom:4px; letter-spacing:0.1em;">PASSWORD</label>
                                    <input type="password" data-field="password"
                                           placeholder="password"
                                           style="width:100%; padding:8px 10px; background:#1a2e1a; border:1px solid #3a5a3a; border-radius:3px; color:#a8d8a8; font-family:monospace; font-size:0.78rem; box-sizing:border-box;">
                                </div>

                                <button data-action="login"
                                        style="width:100%; padding:9px; background:#27ae60; color:#fff; border:none; border-radius:3px; font-family:monospace; font-weight:bold; font-size:0.78rem; cursor:pointer; letter-spacing:0.1em;">AUTHENTICATE</button>
                            </div>

                            <div style="margin-top:12px; text-align:center; font-size:0.6rem; color:#3a5a3a;">
                                Default credentials: Refer to device documentation
                            </div>
                        </div>
                    </div>
                `,
                formHandler: function(data, engine) {
                    return A13Config._handleAdminLogin(data.username || '', data.password || '', engine);
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // ADMIN LOGIN HANDLER
    // ═══════════════════════════════════════════════════════

    _handleAdminLogin(username, password, engine) {
        if (username === 'admin' && password === 'admin') {
            A13Config._state.sensorAccess = true;
            return `
                <div style="background:#1a2e1a; min-height:100%; padding:20px; font-family:'Courier New',monospace; color:#a8d8a8;">

                    <div style="border-bottom:1px solid #3a5a3a; padding-bottom:12px; margin-bottom:20px;">
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <div>
                                <h1 style="color:#4ae44a; font-size:1.1rem; margin:0 0 2px; letter-spacing:0.15em;">SENSOR-NODE-01</h1>
                                <div style="color:#6a9a6a; font-size:0.68rem;">Admin Panel &mdash; Authenticated as <span style="color:#4ae44a;">admin</span></div>
                            </div>
                            <div style="color:#4ae44a; font-size:0.68rem;">&#9679; Logged In</div>
                        </div>
                    </div>

                    <div style="color:#4ae44a; font-size:0.72rem; font-weight:bold; letter-spacing:0.15em; margin-bottom:10px; border-bottom:1px solid #2a4a2a; padding-bottom:4px;">DEVICE ADMINISTRATION</div>

                    <table style="width:100%; border-collapse:collapse; font-size:0.72rem; margin-bottom:20px;">
                        <tr style="border-bottom:1px solid #2a4a2a;">
                            <td style="padding:6px 8px; color:#6a9a6a; width:35%;">Device ID</td>
                            <td style="padding:6px 8px; color:#a8d8a8;">SENSOR-NODE-01</td>
                        </tr>
                        <tr style="border-bottom:1px solid #2a4a2a;">
                            <td style="padding:6px 8px; color:#6a9a6a;">Admin User</td>
                            <td style="padding:6px 8px; color:#a8d8a8;">admin</td>
                        </tr>
                        <tr style="border-bottom:1px solid #2a4a2a;">
                            <td style="padding:6px 8px; color:#6a9a6a;">Admin Password</td>
                            <td style="padding:6px 8px; color:#e8c84a;">admin <span style="color:#6a9a6a; font-size:0.62rem;">(default - CHANGE IMMEDIATELY)</span></td>
                        </tr>
                        <tr style="border-bottom:1px solid #2a4a2a;">
                            <td style="padding:6px 8px; color:#6a9a6a;">SSH Access</td>
                            <td style="padding:6px 8px; color:#a8d8a8;">Enabled (port 22) &mdash; admin:admin</td>
                        </tr>
                        <tr style="border-bottom:1px solid #2a4a2a;">
                            <td style="padding:6px 8px; color:#6a9a6a;">Telnet Debug</td>
                            <td style="padding:6px 8px; color:#e8c84a;">Enabled (port 23) &mdash; no auth</td>
                        </tr>
                        <tr>
                            <td style="padding:6px 8px; color:#6a9a6a;">Firmware Update</td>
                            <td style="padding:6px 8px; color:#a8d8a8;">Manual (USB only)</td>
                        </tr>
                    </table>

                    <div style="color:#4ae44a; font-size:0.72rem; font-weight:bold; letter-spacing:0.15em; margin-bottom:10px; border-bottom:1px solid #2a4a2a; padding-bottom:4px;">INTERNAL NETWORK MAP</div>

                    <div style="background:#0d1a0d; border:1px solid #2a4a2a; border-radius:4px; padding:12px; font-size:0.72rem; margin-bottom:16px;">
<pre style="margin:0; color:#a8d8a8; white-space:pre-wrap;">
[Attacker LAN: 192.168.2.0/24]
       |
   eth0: 192.168.2.100
  +-----------------------+
  |   SENSOR-NODE-01      |
  |   ARM Cortex-A53      |
  |   SSH: 22 (admin:admin)|
  |   Telnet: 23 (no auth)|
  |   HTTP: 80             |
  +-----------------------+
   eth1: 10.10.2.1
       |
[Internal LAN: 10.10.2.0/24]
       |
   10.10.2.10
  +-----------------------+
  |   DATA-HUB-01         |
  |   MongoDB: 27017      |
  |   HTTP API: 8080      |
  |   Auth: NONE           |
  |   DB: arboreal         |
  +-----------------------+</pre>
                    </div>

                    <div style="padding:10px; background:#1a0d0d; border:1px solid #4a2a2a; border-radius:3px; font-size:0.72rem; color:#e84a4a; margin-bottom:12px;">
                        <strong>&#9888; SECURITY ALERT:</strong> Default credentials are in use. SSH (admin:admin) and Telnet (unauthenticated) are exposed on the monitoring LAN. DATA-HUB-01 MongoDB has NO authentication enabled.
                    </div>

                    <div style="padding:8px 10px; background:#0d1a2e; border:1px solid #2a3a5a; border-radius:3px; font-size:0.68rem; color:#a8c8e8;">
                        <strong>User Flag:</strong> <span style="color:#4ae44a; font-family:monospace;">flag{s3ns0r_n0d3_d3f4ult_cr3ds}</span>
                    </div>
                </div>
            `;
        }

        // Wrong credentials
        return `
            <div style="background:#1a2e1a; min-height:100%; padding:20px; font-family:'Courier New',monospace; color:#a8d8a8;">
                <div style="border-bottom:1px solid #3a5a3a; padding-bottom:12px; margin-bottom:20px;">
                    <h1 style="color:#4ae44a; font-size:1.1rem; margin:0 0 2px; letter-spacing:0.15em;">SENSOR-NODE-01</h1>
                    <div style="color:#6a9a6a; font-size:0.68rem;">Admin Panel &mdash; Authentication Required</div>
                </div>

                <div style="max-width:360px; margin:40px auto;">
                    <div style="padding:10px; background:#2a0d0d; border:1px solid #5a2a2a; border-radius:3px; font-size:0.72rem; color:#e84a4a; margin-bottom:16px; text-align:center;">
                        &#9888; Authentication Failed: Invalid credentials
                    </div>
                    <div style="background:#0d1a0d; border:1px solid #2a4a2a; border-radius:4px; padding:24px;">
                        <div style="color:#4ae44a; font-size:0.78rem; font-weight:bold; letter-spacing:0.1em; margin-bottom:16px; text-align:center;">ADMIN LOGIN</div>
                        <div style="margin-bottom:12px;">
                            <label style="display:block; color:#6a9a6a; font-size:0.68rem; margin-bottom:4px; letter-spacing:0.1em;">USERNAME</label>
                            <input type="text" data-field="username" placeholder="admin"
                                   style="width:100%; padding:8px 10px; background:#1a2e1a; border:1px solid #3a5a3a; border-radius:3px; color:#a8d8a8; font-family:monospace; font-size:0.78rem; box-sizing:border-box;">
                        </div>
                        <div style="margin-bottom:16px;">
                            <label style="display:block; color:#6a9a6a; font-size:0.68rem; margin-bottom:4px; letter-spacing:0.1em;">PASSWORD</label>
                            <input type="password" data-field="password" placeholder="password"
                                   style="width:100%; padding:8px 10px; background:#1a2e1a; border:1px solid #3a5a3a; border-radius:3px; color:#a8d8a8; font-family:monospace; font-size:0.78rem; box-sizing:border-box;">
                        </div>
                        <button data-action="login"
                                style="width:100%; padding:9px; background:#27ae60; color:#fff; border:none; border-radius:3px; font-family:monospace; font-weight:bold; font-size:0.78rem; cursor:pointer; letter-spacing:0.1em;">AUTHENTICATE</button>
                    </div>
                </div>
            </div>
        `;
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (attacker Kali machine)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'kali': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: SENSOR-NODE-01 (192.168.2.100)\nObjective: IoT exploitation & network pivoting\n\nIntel:\n  - The Arboreal Collective has deployed environmental sensor nodes\n  - SENSOR-NODE-01 is an ARM-based IoT device running embedded Linux\n  - The sensor is dual-homed: external LAN (192.168.2.0/24) + internal LAN (10.10.2.0/24)\n  - A central DATA-HUB-01 (10.10.2.10) aggregates sensor data via MongoDB\n  - The Collective relies on network isolation rather than proper authentication\n\nRecon steps:\n  1. nmap 192.168.2.100 — identify exposed services on the sensor\n  2. Browse http://192.168.2.100 — check the web dashboard for info disclosure\n  3. Try default credentials on SSH/Telnet (admin:admin, root:toor)\n  4. Once on the sensor: enumerate internal network (ip a, cat /etc/arboreal/hub.conf)\n  5. Set up SSH tunnel to reach DATA-HUB-01 through the sensor\n  6. Query MongoDB on DATA-HUB-01 for the Bio-Manifest\n\nFlags:\n  user.txt — found via default credentials on sensor node\n  root.txt — Bio-Manifest retrieved from DATA-HUB-01 MongoDB\n\nGood luck, operator.'
                                },
                                'tools': {
                                    type: 'dir',
                                    children: {
                                        'chisel': {
                                            type: 'file',
                                            content: '#!/bin/bash\n# chisel — TCP/UDP tunnel over HTTP\n# Compiled binary: chisel_1.9.1_linux_amd64\n# Usage: ./chisel client <server>:<port> <local>:<remote>\n#        ./chisel server --reverse --port 8888\n# For this box: SSH port forwarding is simpler.\n# Try: ssh -L 27017:10.10.2.10:27017 admin@192.168.2.100'
                                        },
                                        'linpeas.sh': {
                                            type: 'file',
                                            content: '#!/bin/bash\n# linPEAS — Linux Privilege Escalation Awesome Script\n# Transfer to target: scp linpeas.sh admin@192.168.2.100:/tmp/\n# Execute on target: chmod +x /tmp/linpeas.sh && /tmp/linpeas.sh\n# Note: This sensor node has limited binaries (embedded Linux)'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap 192.168.2.0/24\nnmap 192.168.2.100\ncurl http://192.168.2.100/\nssh admin@192.168.2.100\ntelnet 192.168.2.100'
                                }
                            }
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'share': {
                            type: 'dir',
                            children: {
                                'wordlists': {
                                    type: 'dir',
                                    children: {
                                        'dirb': {
                                            type: 'dir',
                                            children: {
                                                'common.txt': {
                                                    type: 'file',
                                                    content: 'admin\napi\nbackup\ncgi-bin\nconfig\ndata\ndebug\ndiag\nfirmware\nindex\nlogin\nstatus\ntest\nupdate\nupload'
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': {
                            type: 'file',
                            content: 'kali'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash'
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {}
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (box-specific tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        // ── nmap: Network scanning ───────────────────────────
        'nmap': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            // Scan the local subnet
            if (target === '192.168.2.0/24') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 192.168.2.1
Host is up (0.0015s latency).
Not shown: 999 closed tcp ports
PORT   STATE SERVICE
53/tcp open  domain

Nmap scan report for 192.168.2.100
Host is up (0.0031s latency).
Not shown: 997 closed tcp ports

PORT   STATE SERVICE   VERSION
22/tcp open  ssh       Dropbear sshd 2022.83
23/tcp open  telnet    BusyBox telnetd
80/tcp open  http      lighttpd/1.4.59

Service Info: OS: Linux; Device: embedded; CPE: cpe:/o:linux:linux_kernel

Nmap done: 256 IP addresses (2 hosts up) scanned in 14.22 seconds`;
            }

            // Scan the sensor node directly
            if (target === '192.168.2.100') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 192.168.2.100
Host is up (0.0031s latency).
Not shown: 997 closed tcp ports

PORT   STATE SERVICE   VERSION
22/tcp open  ssh       Dropbear sshd 2022.83
23/tcp open  telnet    BusyBox telnetd
80/tcp open  http      lighttpd/1.4.59

Service Info: OS: Linux; Device: embedded; CPE: cpe:/o:linux:linux_kernel

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 8.47 seconds`;
            }

            // Scan DATA-HUB — only works after pivot
            if (target === '10.10.2.10') {
                if (!A13Config._state.pivotEstablished) {
                    return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.04 seconds

[note] 10.10.2.10 is on an internal network (10.10.2.0/24).
       You cannot reach it directly from your Kali machine (192.168.2.0/24).
       Pivot through SENSOR-NODE-01 first.`;
                }

                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.10.2.10
Host is up (0.0089s latency).
Not shown: 998 closed tcp ports

PORT      STATE SERVICE   VERSION
8080/tcp  open  http      Node.js Express
27017/tcp open  mongodb   MongoDB 6.0.12

Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 11.36 seconds`;
            }

            // Scan 10.10.2.0/24 — only after pivot
            if (target === '10.10.2.0/24') {
                if (!A13Config._state.pivotEstablished) {
                    return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 256 IP addresses (0 hosts up) scanned in 12.88 seconds

[note] 10.10.2.0/24 is not reachable from your current network.
       Pivot through SENSOR-NODE-01 (192.168.2.100) first.`;
                }

                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.10.2.1
Host is up (0.0011s latency).
Not shown: 997 closed tcp ports
PORT   STATE SERVICE
22/tcp open  ssh
23/tcp open  telnet
80/tcp open  http

Nmap scan report for 10.10.2.10
Host is up (0.0089s latency).
Not shown: 998 closed tcp ports
PORT      STATE SERVICE
8080/tcp  open  http
27017/tcp open  mongodb

Nmap done: 256 IP addresses (2 hosts up) scanned in 18.44 seconds`;
            }

            // Scan localhost
            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00011s latency).
All 1000 scanned ports on localhost (127.0.0.1) are closed

Nmap done: 1 IP address (1 host up) scanned in 0.07 seconds`;
            }

            if (!target) {
                return 'Usage: nmap [options] <target>\nExample: nmap 192.168.2.100 or nmap 192.168.2.0/24';
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.04 seconds`;
        },

        // ── ssh: SSH client ──────────────────────────────────
        'ssh': function(args, term, engine) {
            const raw = args.join(' ');

            // ── SSH tunnel: port forwarding for pivot ──
            if (raw.includes('-L') || raw.includes('-D')) {
                // Extract the forwarding spec
                const lMatch = raw.match(/-L\s+(\d+):([^:]+):(\d+)/);
                const target = raw.match(/admin@([\d.]+)/) || raw.match(/([\d.]+)$/);

                if (!target || !target[1].includes('192.168.2.100')) {
                    return 'ssh: Could not resolve hostname: Name or service not known';
                }

                if (!A13Config._state.sensorAccess) {
                    return `admin@192.168.2.100's password: \nssh: Permission denied, please try again.

[hint] You need to know the credentials first. Try admin:admin or explore other services.`;
                }

                if (lMatch) {
                    const localPort = lMatch[1];
                    const remoteHost = lMatch[2];
                    const remotePort = lMatch[3];

                    A13Config._state.pivotEstablished = true;

                    return `admin@192.168.2.100's password: ********
Authenticated to 192.168.2.100 ([192.168.2.100]:22).
Local port forwarding established:
  127.0.0.1:${localPort} -> ${remoteHost}:${remotePort}

[+] SSH tunnel active. Traffic to 127.0.0.1:${localPort} will be forwarded
    through SENSOR-NODE-01 to ${remoteHost}:${remotePort}.
[+] Pivot established! You can now reach the internal network.

Session is running in the background. Use other commands to interact
with services through the tunnel.`;
                }

                // SOCKS proxy (-D)
                if (raw.includes('-D')) {
                    A13Config._state.pivotEstablished = true;

                    return `admin@192.168.2.100's password: ********
Authenticated to 192.168.2.100 ([192.168.2.100]:22).
Dynamic SOCKS proxy established on 127.0.0.1:1080

[+] SOCKS proxy active. Configure proxychains to use 127.0.0.1:1080.
[+] Pivot established! You can now reach the internal 10.10.2.0/24 network.

Session is running in the background.`;
                }
            }

            // ── Normal SSH to sensor ──
            if (raw.includes('admin@192.168.2.100') || raw.includes('192.168.2.100')) {
                // Check for password in command or assume interactive
                if (raw.includes('-p') || A13Config._state.sensorAccess) {
                    A13Config._state.sensorAccess = true;
                    A13Config._state.sensorShell = true;

                    return `admin@192.168.2.100's password: ********
Authenticated to 192.168.2.100 ([192.168.2.100]:22).

  ____  _____ _   _ ____   ___  ____       _   _  ___  ____  _____    ___  _
 / ___|| ____| \\ | / ___| / _ \\|  _ \\     | \\ | |/ _ \\|  _ \\| ____|  / _ \\/ |
 \\___ \\|  _| |  \\| \\___ \\| | | | |_) |____|  \\| | | | | | | |  _|   | | | | |
  ___) | |___| |\\  |___) | |_| |  _ <_____|\\  \` | |_| | |_| | |___  | |_| | |
 |____/|_____|_| \\_|____/ \\___/|_| \\_\\     |_|\\_|\\___/|____/|_____|  \\___/|_|

Arboreal Collective — Environmental Monitoring Unit
Firmware: v2.1.4-arboreal | Model: ARB-SN100

admin@sensor-node-01:~$ hostname
sensor-node-01

admin@sensor-node-01:~$ ip a
1: lo: <LOOPBACK,UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP> mtu 1500
    inet 192.168.2.100/24 brd 192.168.2.255 scope global eth0
3: eth1: <BROADCAST,MULTICAST,UP> mtu 1500
    inet 10.10.2.1/24 brd 10.10.2.255 scope global eth1

admin@sensor-node-01:~$ cat /etc/arboreal/hub.conf
# DATA-HUB-01 Connection Configuration
HUB_HOST=10.10.2.10
HUB_PORT=27017
HUB_DB=arboreal
HUB_AUTH=none
HUB_COLLECTION=sensor_readings
SYNC_INTERVAL=60

# Manifest storage
MANIFEST_COLLECTION=manifests

admin@sensor-node-01:~$ cat /etc/passwd
root:x:0:0:root:/root:/bin/sh
admin:x:1000:1000:Sensor Admin:/home/admin:/bin/sh
nobody:x:65534:65534:Nobody:/nonexistent:/bin/false

admin@sensor-node-01:~$ ls /home/admin/
user.txt  sensor_data.log  .ssh/

admin@sensor-node-01:~$ cat /home/admin/user.txt
flag{s3ns0r_n0d3_d3f4ult_cr3ds}

[+] User flag found! The sensor node uses default admin:admin credentials.

To continue, exit this session and set up an SSH tunnel:
  ssh -L 27017:10.10.2.10:27017 admin@192.168.2.100

Then connect to MongoDB on the DATA-HUB through the tunnel:
  mongo 127.0.0.1:27017/arboreal`;
                }

                // First attempt — prompt for password
                return `admin@192.168.2.100's password:

[hint] Enter the SSH password. Default IoT credentials are often admin:admin.
       Use: ssh admin@192.168.2.100  (then try password: admin)

Note: In this simulation, re-run the ssh command. Access will be granted
      with admin:admin credentials.`;
            }

            // SSH to DATA-HUB
            if (raw.includes('10.10.2.10')) {
                if (!A13Config._state.pivotEstablished) {
                    return `ssh: connect to host 10.10.2.10 port 22: No route to host

[note] 10.10.2.10 is on an internal network not directly reachable.
       Pivot through SENSOR-NODE-01 first using SSH port forwarding.`;
                }
                return `ssh: connect to host 10.10.2.10 port 22: Connection refused

[note] DATA-HUB-01 does not have SSH enabled.
       It exposes MongoDB (27017) and HTTP API (8080).
       Use mongo or curl to interact with it through your tunnel.`;
            }

            return 'Usage: ssh [options] user@hostname\nExample: ssh admin@192.168.2.100\n         ssh -L 27017:10.10.2.10:27017 admin@192.168.2.100';
        },

        // ── telnet: Debug console ────────────────────────────
        'telnet': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            if (target === '192.168.2.100') {
                A13Config._state.sensorAccess = true;
                A13Config._state.sensorShell = true;

                return `Trying 192.168.2.100...
Connected to 192.168.2.100.
Escape character is '^]'.

========================================
SENSOR-NODE-01 Debug Console
Arboreal Collective — Firmware v2.1.4
========================================
WARNING: This is an unauthenticated debug interface.
         Disable in production deployments.

debug> help
Available commands:
  sysinfo     — Show system information
  netinfo     — Show network configuration
  sensors     — Show current sensor readings
  hubstatus   — Show DATA-HUB connection status
  config      — Dump configuration files
  reboot      — Reboot sensor node
  exit        — Close connection

debug> sysinfo
  Model:     ARB-SN100 Rev 3.2
  CPU:       ARM Cortex-A53 @ 1.2GHz
  Memory:    512MB (187MB used)
  Storage:   8GB eMMC (2.1GB used)
  Uptime:    847 days, 14 hours, 22 minutes
  Firmware:  v2.1.4-arboreal (build 20230319)

debug> netinfo
  eth0: 192.168.2.100/24 (external monitoring LAN)
  eth1: 10.10.2.1/24 (internal data collection)
  Default GW: 192.168.2.1

  ARP table:
    192.168.2.1    -> aa:bb:cc:dd:ee:01 (gateway)
    10.10.2.10     -> aa:bb:cc:dd:ee:10 (DATA-HUB-01)

debug> hubstatus
  Hub: DATA-HUB-01 (10.10.2.10:27017)
  Protocol: MongoDB
  Database: arboreal
  Auth: none
  Last sync: 43 seconds ago
  Status: CONNECTED

debug> config
  /etc/arboreal/hub.conf:
    HUB_HOST=10.10.2.10
    HUB_PORT=27017
    HUB_DB=arboreal
    HUB_AUTH=none
    MANIFEST_COLLECTION=manifests

  /etc/arboreal/sensor.conf:
    SENSOR_ID=SN-01
    POLL_INTERVAL=5
    SENSORS=temp,humidity,soil,aqi,light,uv

  /etc/dropbear/authorized_keys:
    (empty — password auth only)

  SSH credentials: admin:admin (DEFAULT — CHANGE IN PRODUCTION)

[+] Sensor access confirmed via Telnet debug console.
    The debug console reveals all network and credential information.

Connection closed by foreign host.`;
            }

            if (target === '10.10.2.10') {
                if (!A13Config._state.pivotEstablished) {
                    return `Trying 10.10.2.10...\ntelnet: Unable to connect to remote host: No route to host\n\n[note] 10.10.2.10 is not reachable from your network. Pivot through SENSOR-NODE-01 first.`;
                }
                return `Trying 10.10.2.10...\ntelnet: Unable to connect to remote host: Connection refused\n\n[note] DATA-HUB-01 does not have Telnet enabled. Use MongoDB (27017) or HTTP API (8080).`;
            }

            if (!target) {
                return 'Usage: telnet <hostname> [port]\nExample: telnet 192.168.2.100';
            }

            return `Trying ${target}...\ntelnet: Unable to connect to remote host: Connection refused`;
        },

        // ── ip: Network interface info ───────────────────────
        'ip': function(args, term, engine) {
            if (args[0] === 'a' || args[0] === 'addr') {
                let output = `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 192.168.2.50/24 brd 192.168.2.255 scope global eth0`;

                if (A13Config._state.pivotEstablished) {
                    output += `\n\n[tunnel] SSH port forwarding active through 192.168.2.100:
    127.0.0.1:27017 -> 10.10.2.10:27017 (MongoDB tunnel)`;
                }

                return output;
            }

            if (args[0] === 'route' || args[0] === 'r') {
                let output = `default via 192.168.2.1 dev eth0
192.168.2.0/24 dev eth0 proto kernel scope link src 192.168.2.50`;

                if (A13Config._state.pivotEstablished) {
                    output += `\n\n[tunnel] Route to 10.10.2.0/24 available via SSH tunnel through SENSOR-NODE-01`;
                }

                return output;
            }

            return 'Usage: ip [a|addr|route|r]\nExample: ip a';
        },

        // ── ifconfig: Legacy network info ────────────────────
        'ifconfig': function(args, term, engine) {
            let output = `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.2.50  netmask 255.255.255.0  broadcast 192.168.2.255
        ether 08:00:27:a1:b2:c3  txqueuelen 1000

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0`;

            if (A13Config._state.pivotEstablished) {
                output += `\n\n[tunnel] SSH port forwarding active:
        127.0.0.1:27017 -> 10.10.2.10:27017 via SENSOR-NODE-01`;
            }

            return output;
        },

        // ── mongo / mongosh: MongoDB client ──────────────────
        'mongo': function(args, term, engine) {
            return A13Config._handleMongo(args, term, engine);
        },

        'mongosh': function(args, term, engine) {
            return A13Config._handleMongo(args, term, engine);
        },

        // ── curl: HTTP client ────────────────────────────────
        'curl': function(args, term, engine) {
            const url = args.find(a => !a.startsWith('-') && (a.startsWith('http') || a.startsWith('127.'))) || '';
            if (!url) return 'curl: try \'curl --help\' for more information';

            const lower = url.toLowerCase();

            // Curl to sensor web interface
            if (lower.includes('192.168.2.100')) {
                if (lower.includes('/admin')) {
                    return `<!DOCTYPE html>
<html>
<head><title>SENSOR-NODE-01 — Admin Login</title></head>
<body style="background:#1a2e1a; color:#a8d8a8; font-family:monospace;">
<h1>SENSOR-NODE-01 Admin Panel</h1>
<p>Authentication required. POST username and password to /admin/</p>
<form method="POST" action="/admin/">
  <input name="username" placeholder="Username">
  <input name="password" type="password" placeholder="Password">
  <button>Login</button>
</form>
</body>
</html>`;
                }

                if (lower.includes('/config')) {
                    return `<!DOCTYPE html>
<html>
<head><title>SENSOR-NODE-01 — Config</title></head>
<body style="background:#1a2e1a; color:#a8d8a8; font-family:monospace;">
<h1>Network Configuration</h1>
<pre>
eth0: 192.168.2.100/24 (external)
eth1: 10.10.2.1/24 (internal)
Connected device: DATA-HUB-01 @ 10.10.2.10 (MongoDB:27017)
</pre>
</body>
</html>`;
                }

                return `<!DOCTYPE html>
<html>
<head><title>SENSOR-NODE-01</title></head>
<body style="background:#1a2e1a; color:#a8d8a8; font-family:monospace;">
<h1>SENSOR-NODE-01</h1>
<p>Arboreal Collective Environmental Monitoring Unit</p>
<p>Status: ONLINE | Uptime: 847d 14h 22m</p>
<p>Temperature: 28.4C | Humidity: 73.1% | AQI: 38</p>
<nav>
  <a href="/config/">Configuration</a> |
  <a href="/admin/">Admin Panel</a>
</nav>
</body>
</html>`;
            }

            // Curl to DATA-HUB API manifests (specific path — check BEFORE generic 8080)
            if (lower.includes('127.0.0.1:8080/api/manifests') || lower.includes('localhost:8080/api/manifests')) {
                if (!A13Config._state.pivotEstablished) {
                    return 'curl: (7) Failed to connect to 127.0.0.1 port 8080: Connection refused';
                }

                return `[
  {
    "_id": "manifest_001",
    "project": "Operation Canopy",
    "classification": "CONFIDENTIAL",
    "content": "Terraforming blueprint for urban sector 7-G. Soil reclamation, mycorrhizal network deployment, atmospheric scrubber placement.",
    "flag": "flag{b10_m4n1f3st_p1v0t_succ3ss}",
    "created": "2023-03-19T14:22:00Z"
  }
]`;
            }

            // Curl to DATA-HUB through tunnel (generic 8080)
            if (lower.includes('127.0.0.1:8080') || lower.includes('localhost:8080')) {
                if (!A13Config._state.pivotEstablished) {
                    return `curl: (7) Failed to connect to 127.0.0.1 port 8080 after 0 ms: Connection refused

[hint] Port 8080 is the DATA-HUB API, not running on your machine.
       Set up an SSH tunnel first: ssh -L 8080:10.10.2.10:8080 admin@192.168.2.100`;
                }

                return `{
  "service": "arboreal-data-hub",
  "version": "1.4.2",
  "status": "operational",
  "endpoints": {
    "/api/sensors": "Sensor data feed",
    "/api/manifests": "Bio-Manifest records",
    "/api/status": "System health"
  },
  "database": "mongodb://localhost:27017/arboreal",
  "auth": "none",
  "note": "Internal API — no authentication required"
}`;
            }

            // Curl to 10.10.2.10 directly
            if (lower.includes('10.10.2.10')) {
                if (!A13Config._state.pivotEstablished) {
                    return `curl: (7) Failed to connect to 10.10.2.10: No route to host

[note] 10.10.2.10 is on the internal network. Pivot through SENSOR-NODE-01 first.`;
                }
                return `curl: (7) Failed to connect to 10.10.2.10: Connection refused

[note] You have a tunnel but curl is hitting the wrong address.
       Use 127.0.0.1 with the forwarded port (e.g., curl http://127.0.0.1:8080/)`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0]}: Connection refused`;
        },

        // ── ping: ICMP ───────────────────────────────────────
        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';

            if (target === '192.168.2.100') {
                return `PING 192.168.2.100 (192.168.2.100) 56(84) bytes of data.
64 bytes from 192.168.2.100: icmp_seq=1 ttl=64 time=3.14 ms
64 bytes from 192.168.2.100: icmp_seq=2 ttl=64 time=2.98 ms
64 bytes from 192.168.2.100: icmp_seq=3 ttl=64 time=3.07 ms

--- 192.168.2.100 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 2.98/3.06/3.14/0.065 ms`;
            }

            if (target === '10.10.2.10' || target.startsWith('10.10.2.')) {
                if (!A13Config._state.pivotEstablished) {
                    return `PING ${target} (${target}) 56(84) bytes of data.

--- ${target} ping statistics ---
3 packets transmitted, 0 received, 100% packet loss

[note] ${target} is on an internal network not reachable from here.`;
                }
                return `PING ${target} (${target}) 56(84) bytes of data.
64 bytes from ${target}: icmp_seq=1 ttl=63 time=8.91 ms
64 bytes from ${target}: icmp_seq=2 ttl=63 time=9.12 ms

--- ${target} ping statistics ---
2 packets transmitted, 2 received, 0% packet loss
rtt min/avg/max/mdev = 8.91/9.01/9.12/0.105 ms`;
            }

            return `ping: ${target}: Name or service not known`;
        },

        // ── gobuster: Directory brute force ──────────────────
        'gobuster': function(args) {
            return `Gobuster v3.6
[+] Url:          http://192.168.2.100/
[+] Wordlist:     /usr/share/wordlists/dirb/common.txt
[+] Status codes: 200,204,301,302,307,401,403
===============================================================
/                    (Status: 200) [Size: 3841]
/admin/              (Status: 200) [Size: 1420]
/config/             (Status: 200) [Size: 2890]
/firmware/           (Status: 403) [Size: 162]
/debug/              (Status: 301) -> telnet://192.168.2.100:23
===============================================================
Finished`;
        },

        // ── nikto: Web vulnerability scanner ─────────────────
        'nikto': function(args) {
            return `- Nikto v2.5.0
+ Target IP:       192.168.2.100
+ Target Hostname:  sensor-node-01
+ Target Port:      80
+ Server: lighttpd/1.4.59
+ /: Embedded device web interface detected (ARB-SN100)
+ /admin/: Admin panel with form-based authentication — try default credentials
+ /config/: Network configuration page exposes internal IP ranges and connected devices
+ /firmware/: Firmware directory exists but returns 403 (restricted)
+ /debug/: Redirects to Telnet debug console on port 23 (unauthenticated!)
+ OSVDB-IoT: Default credentials likely in use (admin:admin common for embedded devices)
+ 6 items checked: 5 findings`;
        },

        // ── proxychains: SOCKS proxy wrapper ─────────────────
        'proxychains': function(args, term, engine) {
            if (!A13Config._state.pivotEstablished) {
                return `ProxyChains-3.1 (http://proxychains.sf.net)
|S-chain|-> 127.0.0.1:1080 -> <<< TIMEOUT >>>

[error] No SOCKS proxy available. Set up an SSH tunnel first:
        ssh -D 1080 admin@192.168.2.100`;
            }

            // Pass through to the underlying command
            const subCmd = args.join(' ');
            return `ProxyChains-3.1 (http://proxychains.sf.net)
|S-chain|-> 127.0.0.1:1080 -> 10.10.2.10 -> OK

[+] Proxychains active. Command would execute through SENSOR-NODE-01.
    For this simulation, use direct commands with the tunnel:
    - mongo 127.0.0.1:27017/arboreal
    - curl http://127.0.0.1:8080/`;
        },

        // ── scp: Secure copy ─────────────────────────────────
        'scp': function(args) {
            if (args.some(a => a.includes('192.168.2.100'))) {
                if (!A13Config._state.sensorAccess) {
                    return 'scp: Permission denied (password required). SSH to the sensor first.';
                }
                return `admin@192.168.2.100's password: ********
[file transferred successfully]

[+] File copied to/from SENSOR-NODE-01.`;
            }
            return 'Usage: scp [options] source destination\nExample: scp linpeas.sh admin@192.168.2.100:/tmp/';
        },

        // ── route: Routing table ─────────────────────────────
        'route': function(args) {
            let output = `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         192.168.2.1     0.0.0.0         UG    100    0        0 eth0
192.168.2.0     0.0.0.0         255.255.255.0   U     100    0        0 eth0`;

            if (A13Config._state.pivotEstablished) {
                output += `\n\n[tunnel] 10.10.2.0/24 reachable via SSH tunnel through SENSOR-NODE-01 (192.168.2.100)`;
            }

            return output;
        }
    },

    // ═══════════════════════════════════════════════════════
    // MONGO HANDLER — Simulates MongoDB shell interaction
    // ═══════════════════════════════════════════════════════

    _handleMongo(args, term, engine) {
        const raw = args.join(' ');

        // Connection string parsing
        const targetMatch = raw.match(/([\d.]+):?(\d+)?\/?(\w+)?/) || raw.match(/--host\s+([\d.]+)/);

        // No arguments
        if (!raw.trim()) {
            return `MongoDB shell version v6.0.12
connecting to: mongodb://127.0.0.1:27017/
Error: couldn't connect to server 127.0.0.1:27017

[hint] MongoDB is running on DATA-HUB-01 (10.10.2.10:27017).
       Set up an SSH tunnel first, then connect:
       ssh -L 27017:10.10.2.10:27017 admin@192.168.2.100
       mongo 127.0.0.1:27017/arboreal`;
        }

        // Check if connecting to 10.10.2.10 directly (without tunnel)
        if (raw.includes('10.10.2.10')) {
            if (!A13Config._state.pivotEstablished) {
                return `MongoDB shell version v6.0.12
connecting to: mongodb://10.10.2.10:27017/
Error: couldn't connect to server 10.10.2.10:27017, connection attempt failed

[note] 10.10.2.10 is on the internal network. Set up an SSH tunnel:
       ssh -L 27017:10.10.2.10:27017 admin@192.168.2.100
       mongo 127.0.0.1:27017/arboreal`;
            }
            return `MongoDB shell version v6.0.12
connecting to: mongodb://10.10.2.10:27017/
Error: couldn't connect to server 10.10.2.10:27017

[note] Use 127.0.0.1 with the forwarded port, not the internal IP directly:
       mongo 127.0.0.1:27017/arboreal`;
        }

        // Connecting via tunnel (127.0.0.1)
        if (raw.includes('127.0.0.1') || raw.includes('localhost')) {
            if (!A13Config._state.pivotEstablished) {
                return `MongoDB shell version v6.0.12
connecting to: mongodb://127.0.0.1:27017/
Error: couldn't connect to server 127.0.0.1:27017, connection attempt failed

[hint] MongoDB is not running on your Kali machine.
       It is on DATA-HUB-01 (10.10.2.10). Set up a tunnel first:
       ssh -L 27017:10.10.2.10:27017 admin@192.168.2.100`;
            }

            A13Config._state.dataHubAccess = true;

            // Determine database from connection string
            const dbMatch = raw.match(/\/(\w+)$/);
            const db = dbMatch ? dbMatch[1] : 'test';

            return `MongoDB shell version v6.0.12
connecting to: mongodb://127.0.0.1:27017/${db}
Implicit session: session { "id" : UUID("a1b2c3d4-e5f6-7890-abcd-ef1234567890") }
MongoDB server version: 6.0.12

[+] Connected to DATA-HUB-01 MongoDB through SSH tunnel!

> show dbs
admin     40.00 KiB
arboreal  188.00 KiB
config    72.00 KiB
local     40.00 KiB

> use arboreal
switched to db arboreal

> show collections
sensor_readings
manifests
system_logs
device_registry

> db.sensor_readings.count()
284719

> db.device_registry.find()
{ "_id": "SN-01", "name": "SENSOR-NODE-01", "ip": "10.10.2.1", "status": "active", "last_seen": "2025-01-15T14:22:43Z" }
{ "_id": "SN-02", "name": "SENSOR-NODE-02", "ip": "10.10.2.2", "status": "offline", "last_seen": "2024-09-03T08:11:02Z" }
{ "_id": "SN-03", "name": "SENSOR-NODE-03", "ip": "10.10.2.3", "status": "offline", "last_seen": "2024-11-22T19:45:11Z" }

> db.manifests.find()
{
  "_id": ObjectId("64b7f2a1c3d4e5f6a7b8c9d0"),
  "project": "Operation Canopy",
  "classification": "CONFIDENTIAL",
  "author": "Dr. Elara Voss",
  "created": ISODate("2023-03-19T14:22:00Z"),
  "content": {
    "phase1": "Soil reclamation — deploy mycorrhizal networks across urban sector 7-G",
    "phase2": "Atmospheric scrubber placement — 12 units in grid pattern",
    "phase3": "Canopy deployment — accelerated growth via bio-stimulant injection",
    "phase4": "Sensor mesh — 50 nodes for continuous environmental monitoring"
  },
  "status": "ACTIVE",
  "flag": "flag{b10_m4n1f3st_p1v0t_succ3ss}"
}
{
  "_id": ObjectId("64b7f2a1c3d4e5f6a7b8c9d1"),
  "project": "Root Network Alpha",
  "classification": "INTERNAL",
  "author": "Kai Tanaka",
  "created": ISODate("2023-06-01T09:15:00Z"),
  "content": {
    "summary": "Underground fungal communication network linking all sensor nodes",
    "status": "Research phase"
  },
  "status": "PLANNING"
}

[+] ROOT FLAG FOUND in Bio-Manifest: flag{b10_m4n1f3st_p1v0t_succ3ss}
    The Arboreal Collective's terraforming blueprint has been retrieved.`;
        }

        return `MongoDB shell version v6.0.12
Error: couldn't parse connection string

Usage: mongo [host:port/database]
Example: mongo 127.0.0.1:27017/arboreal`;
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _escHtml(str) {
        if (typeof str !== 'string') return String(str);
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent.trim();
    }

};
