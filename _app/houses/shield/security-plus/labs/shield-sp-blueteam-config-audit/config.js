/* ============================================================
   Security+ Cert Prep -- Config Audit: Veridian Financial Pre-Production
   Blue-team system hardening / configuration audit | find-and-submit flags
   Students audit a misconfigured internet-facing server WEB-DMZ-02
   (10.10.10.25) before go-live: cat/grep /etc config files + FirewallManager
   to find insecure directives and submit them as flags.
   SY0-701: 4.1 (secure baselines / hardening), 2.5, 3.3
   ============================================================ */

// window assignment (not const) so the second <script> block in index.html
// can reference VFCAConfig after this script has loaded.
window.VFCAConfig = {

    // =========================================================
    // BOX METADATA
    // =========================================================

    id:          'shield-sp-blueteam-config-audit',
    title:       'Config Audit',
    subtitle:    'Veridian Financial -- Pre-Production Hardening Audit',
    description: 'WEB-DMZ-02 (10.10.10.25) is provisioned and ready for go-live -- but the security team flagged it for a mandatory hardening audit first. Audit the live configuration files and firewall ruleset to find every misconfiguration before the server is exposed to the internet. Each flaw you identify is a flag. Discover the values from the config evidence, then submit them.',
    difficulty:  'Intermediate',
    estimatedTime: 35,
    accent:      '#2563eb',
    storageKey:  'hexworth_lab_sp_blueteam_config_audit',
    registryId:  'shield-sp-blueteam-config-audit',
    trackerKey:  'lab_sp_blueteam_config_audit',

    // Blue-team mode tells BoxEngine to accept BlueTeam device types
    blueTeamMode: true,

    // =========================================================
    // BOOT SEQUENCE
    // =========================================================

    boot: {
        biosLines: [
            'VERIDIAN FINANCIAL -- HARDENING AUDIT TERMINAL v2.0.4',
            'Pre-Production Security Review -- Analyst Access',
            'Ubuntu 22.04.4 LTS: LOADING',
            'Remote config mount: WEB-DMZ-02 (10.10.10.25) -- READY',
            'Audit ticket: SEC-2026-0517-014 -- ACTIVE',
            'Go-live hold: PENDING SECURITY SIGN-OFF'
        ],
        grubEntries: [
            'Ubuntu 22.04.4 LTS (Audit Analyst)',
            'Ubuntu 22.04.4 LTS (recovery mode)'
        ],
        loginUser: 'analyst'
    },

    // =========================================================
    // LORE
    // =========================================================

    lore: {
        intro: 'Change ticket CHG-2026-0517-09 provisioned WEB-DMZ-02 (10.10.10.25) from the standard build image. The infrastructure team did not lock it down before promoting it to the DMZ queue. Security opened SEC-2026-0517-014: mandatory hardening audit before any go-live approval. You have analyst access to the server\'s config files and the firewall ruleset in this terminal. Find every misconfiguration. Submit the exact values you discover -- not what you expect to see.',

        scenario: 'WEB-DMZ-02 is an Nginx HTTPS front-end serving the Veridian customer portal. It runs on Ubuntu 22.04. The build image was last updated eight months ago and inherits several insecure defaults. Your audit covers SSH configuration, listening services, TLS/SSL settings, privilege escalation controls, and the perimeter firewall ruleset. The audit task brief (/home/analyst/audit_task.txt) names the categories to inspect -- the specific misconfigured values are in the config files.',

        outro: 'Hardening audit complete. Five misconfigurations found and submitted: a cleartext remote-access service that must be disabled, the SSH daemon PermitRootLogin left at its insecure build default, a legacy SSL protocol version enabled in the Nginx TLS config, a database port unnecessarily exposed to the internet in the firewall ruleset, and a service account with an unrestricted NOPASSWD sudo grant. Go-live hold remains in place until each item is remediated and re-audited.',

        goals: [
            'Identify the insecure cleartext service running on the server (check the listening-ports file)',
            'Find the insecure PermitRootLogin directive value in the SSH daemon config',
            'Identify the weak legacy protocol enabled in the Nginx SSL/TLS configuration',
            'Find the unnecessary port exposed inbound from any source in the firewall ruleset',
            'Identify the service account that has an unrestricted NOPASSWD sudo privilege'
        ],

        toolkit: [
            { name: 'cat',   purpose: 'Display a full config file',               sample: 'cat /etc/ssh/sshd_config' },
            { name: 'grep',  purpose: 'Search for a pattern in a file',           sample: 'grep "PermitRootLogin" /etc/ssh/sshd_config' },
            { name: 'head',  purpose: 'Show first N lines of a file',             sample: 'head -n 20 /etc/sudoers' },
            { name: 'tail',  purpose: 'Show last N lines of a file',              sample: 'tail -n 15 /etc/sudoers' },
            { name: 'find',  purpose: 'Locate files in a directory tree',         sample: 'find /etc -name "*.conf"' },
            { name: 'ls',    purpose: 'List directory contents',                   sample: 'ls /etc/sudoers.d/' },
            { name: 'help',  purpose: 'Show available commands',                   sample: 'help' }
        ]
    },

    // =========================================================
    // TERMINAL CONFIG
    // =========================================================

    terminal: {
        user:     'analyst',
        hostname: 'web-dmz-02',
        startDir: '/home/analyst',
        welcome:  'Veridian Financial -- WEB-DMZ-02 Hardening Audit\nPre-Production Security Review | SEC-2026-0517-014 Active\n\nConfig files available for audit:\n  /etc/ssh/sshd_config            SSH daemon configuration\n  /etc/nginx/ssl.conf             Nginx TLS/SSL settings\n  /etc/passwd                     Local user accounts\n  /etc/sudoers                    Privilege escalation rules\n  /etc/sudoers.d/veridian-svc     Per-service sudoers drop-in\n  /home/analyst/listening_ports.txt  Active listening services\n\nAudit brief: /home/analyst/audit_task.txt\n\nFind each misconfiguration. Submit discovered values via the Submit Flag panel.\n\nType "help" for available commands.\n'
    },

    // =========================================================
    // DESKTOP ICONS
    // =========================================================

    desktop: {
        icons: [
            { id: 'terminal',  label: 'Terminal',     icon: 'T', app: 'terminal'   },
            { id: 'firewall',  label: 'Firewall',     icon: 'F', app: 'firewall'   },
            { id: 'notes',     label: 'Notes',        icon: 'N', app: 'notes'      },
            { id: 'hints',     label: 'Hints',        icon: 'H', app: 'hints'      },
            { id: 'flags',     label: 'Submit Flag',  icon: 'S', app: 'flags'      }
        ]
    },

    // =========================================================
    // SIMULATED FILESYSTEM
    //
    // /home/analyst/              -- analyst home (audit brief, notes, scratch)
    //   audit_task.txt            -- task brief: names the CATEGORIES to audit, NOT values
    //   listening_ports.txt       -- netstat-style output: FLAG cleartext_service (telnet/23)
    //   notes.txt                 -- analyst scratch pad
    //
    // /etc/
    //   ssh/
    //     sshd_config             -- FLAG root_login_directive (PermitRootLogin yes)
    //   nginx/
    //     ssl.conf                -- FLAG weak_tls (SSLv3)
    //   passwd                    -- user list (context; contains svc-deploy as noise)
    //   sudoers                   -- main sudoers (noise: legitimate entries)
    //   sudoers.d/
    //     veridian-svc            -- FLAG nopasswd_account (svc-deploy NOPASSWD)
    //
    // FLAG DISCOVERY MAP (must match what the terminal commands actually surface):
    //   cleartext_service  -> grep "23/" /home/analyst/listening_ports.txt
    //                         (value: telnet)
    //   root_login_directive -> grep "PermitRootLogin" /etc/ssh/sshd_config
    //                         (value: yes)
    //   weak_tls           -> grep "SSLProtocol\|ssl_protocols" /etc/nginx/ssl.conf
    //                         (value: SSLv3)
    //   exposed_port       -> inspect FirewallManager -- ACCEPT rule for port 3306 from 0.0.0.0/0
    //                         (value: 3306)
    //   nopasswd_account   -> cat /etc/sudoers.d/veridian-svc
    //                         (value: svc-deploy)
    // =========================================================

    filesystem: {
        '/': {
            type: 'dir',
            children: {

                'home': {
                    type: 'dir',
                    children: {
                        'analyst': {
                            type: 'dir',
                            children: {

                                // Audit task brief -- names the CATEGORIES to investigate,
                                // never the flag values themselves.
                                'audit_task.txt': {
                                    type: 'file',
                                    content: [
                                        'AUDIT TICKET: SEC-2026-0517-014',
                                        'Server:   WEB-DMZ-02  (10.10.10.25)',
                                        'Build:    veridian-std-22.04-v1.3  (built 2025-09-12)',
                                        'Analyst:  (you)',
                                        'Purpose:  Internet-facing Nginx HTTPS front-end -- Veridian customer portal',
                                        '',
                                        'GO-LIVE HOLD: Security sign-off required before promotion.',
                                        '',
                                        'AUDIT CATEGORIES -- check each area and submit findings:',
                                        '',
                                        '  1. CLEARTEXT SERVICES',
                                        '     Check which services are listening on this server.',
                                        '     Any cleartext remote-access protocol is an immediate blocker.',
                                        '     Evidence file: /home/analyst/listening_ports.txt',
                                        '     Submit: the name of the cleartext service that must be disabled.',
                                        '',
                                        '  2. SSH DAEMON CONFIGURATION',
                                        '     Insecure SSH defaults are common on aged build images.',
                                        '     Check: /etc/ssh/sshd_config',
                                        '     Key directive to review: PermitRootLogin',
                                        '     Submit: the CURRENT (insecure) value of PermitRootLogin.',
                                        '',
                                        '  3. TLS / SSL PROTOCOL VERSION',
                                        '     Nginx TLS is configured in /etc/nginx/ssl.conf.',
                                        '     Legacy protocol versions must be disabled; modern baseline requires TLSv1.2 and TLSv1.3 only.',
                                        '     Submit: the weak protocol version currently enabled.',
                                        '',
                                        '  4. FIREWALL RULESET -- UNNECESSARY EXPOSED PORT',
                                        '     Open the FirewallManager device and review the inbound ruleset.',
                                        '     Look for a port that should never be exposed from the internet.',
                                        '     Submit: the port number of the unnecessarily exposed service.',
                                        '',
                                        '  5. PRIVILEGE ESCALATION -- NOPASSWD SUDO',
                                        '     Review /etc/sudoers and /etc/sudoers.d/ for NOPASSWD entries.',
                                        '     A service account with unrestricted NOPASSWD sudo is a critical finding.',
                                        '     Submit: the username that has the NOPASSWD rule.',
                                        '',
                                        'NOTES',
                                        '  Submit EXACT values as they appear in the config evidence.',
                                        '  Partial or paraphrased values will not be accepted.',
                                        '  Use the Hints panel if you are stuck.'
                                    ].join('\n')
                                },

                                // Listening ports snapshot (equivalent of: netstat -tlnp)
                                // FLAG: cleartext_service -- telnet on port 23 (service name is "telnet")
                                // Noise: sshd on 22, nginx on 80+443, rpcbind on 111 (common image artifact)
                                // Also shows MySQL on 3306 bound to 0.0.0.0 (cross-reference for exposed_port)
                                'listening_ports.txt': {
                                    type: 'file',
                                    content: [
                                        '# WEB-DMZ-02 -- Active listening services (snapshot 2026-05-17 09:14 UTC)',
                                        '# Generated by: netstat -tlnp',
                                        '#',
                                        'Proto  Recv-Q  Send-Q  Local Address         Foreign Address  State   PID/Program name',
                                        'tcp         0       0  0.0.0.0:22            0.0.0.0:*        LISTEN  1201/sshd',
                                        'tcp         0       0  0.0.0.0:23            0.0.0.0:*        LISTEN  1388/telnetd',
                                        'tcp         0       0  0.0.0.0:80            0.0.0.0:*        LISTEN  1412/nginx: master',
                                        'tcp         0       0  0.0.0.0:111           0.0.0.0:*        LISTEN  942/rpcbind',
                                        'tcp         0       0  0.0.0.0:443           0.0.0.0:*        LISTEN  1412/nginx: master',
                                        'tcp         0       0  0.0.0.0:3306          0.0.0.0:*        LISTEN  1644/mysqld',
                                        'tcp6        0       0  :::22                 :::*             LISTEN  1201/sshd',
                                        'tcp6        0       0  :::23                 :::*             LISTEN  1388/telnetd',
                                        'tcp6        0       0  :::80                 :::*             LISTEN  1412/nginx: master',
                                        'tcp6        0       0  :::443                :::*             LISTEN  1412/nginx: master',
                                        '#',
                                        '# Service notes (from /etc/services):',
                                        '#   port 22/tcp   ssh      -- Secure Shell (expected)',
                                        '#   port 23/tcp   telnet   -- Telnet (cleartext; should be disabled)',
                                        '#   port 80/tcp   http     -- HTTP plaintext redirect (expected)',
                                        '#   port 111/tcp  sunrpc   -- RPC portmapper (legacy build artifact)',
                                        '#   port 443/tcp  https    -- HTTPS customer portal (expected)',
                                        '#   port 3306/tcp mysql    -- MySQL database (should not be internet-facing)'
                                    ].join('\n')
                                },

                                // Analyst scratch notes (generic commands, no flag values)
                                'notes.txt': {
                                    type: 'file',
                                    content: [
                                        'HARDENING AUDIT SCRATCH PAD',
                                        '============================',
                                        '',
                                        'grep tips:',
                                        '  grep PATTERN /path/to/file      -- search a file for a pattern',
                                        '  grep -i PATTERN /path/to/file   -- case-insensitive search',
                                        '  grep -v PATTERN /path/to/file   -- lines NOT matching (exclude noise)',
                                        '  grep -n PATTERN /path/to/file   -- show line numbers with matches',
                                        '',
                                        'Useful sshd_config directives to check:',
                                        '  PermitRootLogin     -- should be "no" on a hardened server',
                                        '  PasswordAuthentication -- should be "no" if key-only auth is intended',
                                        '  PermitEmptyPasswords   -- should always be "no"',
                                        '',
                                        'Nginx TLS directive:',
                                        '  ssl_protocols       -- should be "TLSv1.2 TLSv1.3" only',
                                        '',
                                        'Sudoers NOPASSWD pattern:',
                                        '  username ALL=(ALL) NOPASSWD: ALL   -- unrestricted (bad)',
                                        '  username ALL=(ALL) NOPASSWD: /specific/cmd  -- scoped (acceptable)',
                                        '',
                                        'FirewallManager device:',
                                        '  Click the Firewall icon on the desktop to open the rule inspector.',
                                        '  Look for ACCEPT rules that allow traffic from 0.0.0.0/0 on unexpected ports.',
                                        '',
                                        'Audit findings so far:',
                                        '  Cleartext service:    ',
                                        '  PermitRootLogin:      ',
                                        '  Weak TLS protocol:    ',
                                        '  Exposed port:         ',
                                        '  NOPASSWD account:     '
                                    ].join('\n')
                                },

                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls /home/analyst/\ncat /home/analyst/audit_task.txt\nls /etc/\nls /etc/ssh/\n'
                                }

                            }
                        }
                    }
                },

                // ─── SERVER CONFIGURATION FILES ───────────────────────────
                'etc': {
                    type: 'dir',
                    children: {

                        // ── SSH DAEMON CONFIG ────────────────────────────────
                        // FLAG: root_login_directive
                        //   -> grep "PermitRootLogin" /etc/ssh/sshd_config
                        //      output: "PermitRootLogin yes"
                        //   -> value to submit: yes
                        //
                        // Noise: normal directives that are correctly configured
                        // or irrelevant (Port, AddressFamily, PubkeyAuthentication, etc.)
                        'ssh': {
                            type: 'dir',
                            children: {
                                'sshd_config': {
                                    type: 'file',
                                    content: [
                                        '# OpenSSH Daemon Configuration -- WEB-DMZ-02',
                                        '# Last modified: 2025-09-12 (initial build image)',
                                        '# /etc/ssh/sshd_config',
                                        '',
                                        '#-------------------------------------------------------',
                                        '# Network and Port Settings',
                                        '#-------------------------------------------------------',
                                        'Port 22',
                                        'AddressFamily any',
                                        'ListenAddress 0.0.0.0',
                                        'ListenAddress ::',
                                        '',
                                        '#-------------------------------------------------------',
                                        '# Host Key Files',
                                        '#-------------------------------------------------------',
                                        'HostKey /etc/ssh/ssh_host_rsa_key',
                                        'HostKey /etc/ssh/ssh_host_ecdsa_key',
                                        'HostKey /etc/ssh/ssh_host_ed25519_key',
                                        '',
                                        '#-------------------------------------------------------',
                                        '# Ciphers and Keying',
                                        '#-------------------------------------------------------',
                                        'RekeyLimit default none',
                                        '',
                                        '#-------------------------------------------------------',
                                        '# Logging',
                                        '#-------------------------------------------------------',
                                        'SyslogFacility AUTH',
                                        'LogLevel INFO',
                                        '',
                                        '#-------------------------------------------------------',
                                        '# Authentication',
                                        '#-------------------------------------------------------',
                                        '# WARNING: PermitRootLogin left at build default -- must be hardened',
                                        'PermitRootLogin yes',
                                        '',
                                        'StrictModes yes',
                                        'MaxAuthTries 6',
                                        'MaxSessions 10',
                                        '',
                                        'PubkeyAuthentication yes',
                                        '',
                                        '# Expected authorized key locations',
                                        'AuthorizedKeysFile .ssh/authorized_keys .ssh/authorized_keys2',
                                        '',
                                        'AuthorizedPrincipalsFile none',
                                        '',
                                        'HostbasedAuthentication no',
                                        'IgnoreUserKnownHosts no',
                                        'IgnoreRhosts yes',
                                        '',
                                        '# Password authentication still enabled (build default)',
                                        'PasswordAuthentication yes',
                                        'PermitEmptyPasswords no',
                                        '',
                                        '#-------------------------------------------------------',
                                        '# Kerberos Options',
                                        '#-------------------------------------------------------',
                                        'KerberosAuthentication no',
                                        'KerberosOrLocalPasswd yes',
                                        'KerberosTicketCleanup yes',
                                        '',
                                        '#-------------------------------------------------------',
                                        '# GSSAPI Options',
                                        '#-------------------------------------------------------',
                                        'GSSAPIAuthentication no',
                                        'GSSAPICleanupCredentials yes',
                                        '',
                                        '#-------------------------------------------------------',
                                        '# Session and Forwarding',
                                        '#-------------------------------------------------------',
                                        'UsePAM yes',
                                        'AllowAgentForwarding no',
                                        'AllowTcpForwarding no',
                                        'GatewayPorts no',
                                        'X11Forwarding no',
                                        'PermitTTY yes',
                                        'PrintMotd no',
                                        'TCPKeepAlive yes',
                                        'PermitUserEnvironment no',
                                        'Compression delayed',
                                        'ClientAliveInterval 120',
                                        'ClientAliveCountMax 3',
                                        '',
                                        '#-------------------------------------------------------',
                                        '# Override per-user settings from /etc/ssh/sshd_config.d/',
                                        '#-------------------------------------------------------',
                                        'Include /etc/ssh/sshd_config.d/*.conf',
                                        '',
                                        '# Allowed users (deploy team + ops)',
                                        'AllowUsers deploy ops ansible',
                                        '',
                                        'AcceptEnv LANG LC_*',
                                        '',
                                        'Subsystem sftp /usr/lib/openssh/sftp-server'
                                    ].join('\n')
                                }
                            }
                        },

                        // ── NGINX CONFIGURATION ──────────────────────────────
                        // FLAG: weak_tls
                        //   -> grep "ssl_protocols" /etc/nginx/ssl.conf
                        //      output: "    ssl_protocols SSLv3 TLSv1 TLSv1.1 TLSv1.2;"
                        //   -> value to submit: SSLv3
                        //
                        // Noise: cipher suite line, session cache, HSTS, stapling, etc.
                        'nginx': {
                            type: 'dir',
                            children: {
                                'ssl.conf': {
                                    type: 'file',
                                    content: [
                                        '# Nginx SSL/TLS Configuration -- WEB-DMZ-02',
                                        '# /etc/nginx/ssl.conf',
                                        '# Last modified: 2025-09-12 (initial build image)',
                                        '#',
                                        '# INCLUDED FROM: /etc/nginx/sites-enabled/veridian-portal.conf',
                                        '# via:  include /etc/nginx/ssl.conf;',
                                        '',
                                        '#-------------------------------------------------------',
                                        '# TLS Protocol Versions',
                                        '#-------------------------------------------------------',
                                        '# WARNING: this server accepts deprecated protocol versions.',
                                        '# Hardened baseline requires TLSv1.2 and TLSv1.3 only.',
                                        'ssl_protocols SSLv3 TLSv1 TLSv1.1 TLSv1.2;',
                                        '',
                                        '#-------------------------------------------------------',
                                        '# Cipher Suite',
                                        '#-------------------------------------------------------',
                                        '# Mixed cipher suite from legacy build image -- includes weak ciphers',
                                        'ssl_ciphers ECDH+AESGCM:DH+AESGCM:ECDH+AES256:DH+AES256:ECDH+AES128:DH+AES:ECDH+3DES:DH+3DES:RSA+AESGCM:RSA+AES:RSA+3DES:!aNULL:!MD5:!DSS:RC4;',
                                        'ssl_prefer_server_ciphers on;',
                                        '',
                                        '#-------------------------------------------------------',
                                        '# Session Cache and Resumption',
                                        '#-------------------------------------------------------',
                                        'ssl_session_cache shared:SSL:10m;',
                                        'ssl_session_timeout 10m;',
                                        '',
                                        '#-------------------------------------------------------',
                                        '# Certificate Paths',
                                        '#-------------------------------------------------------',
                                        'ssl_certificate     /etc/ssl/certs/veridian-portal.crt;',
                                        'ssl_certificate_key /etc/ssl/private/veridian-portal.key;',
                                        '',
                                        '#-------------------------------------------------------',
                                        '# OCSP Stapling',
                                        '#-------------------------------------------------------',
                                        'ssl_stapling on;',
                                        'ssl_stapling_verify on;',
                                        'ssl_trusted_certificate /etc/ssl/certs/ca-bundle.crt;',
                                        'resolver 8.8.8.8 8.8.4.4 valid=300s;',
                                        'resolver_timeout 5s;',
                                        '',
                                        '#-------------------------------------------------------',
                                        '# HSTS (not yet enabled -- pending protocol hardening)',
                                        '#-------------------------------------------------------',
                                        '# add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;',
                                        '# NOTE: Do NOT enable HSTS until SSLv3/TLSv1 are removed -- clients',
                                        '#       relying on legacy protocols will be locked out.'
                                    ].join('\n')
                                },

                                // Main nginx config for context (not a flag source -- noise only)
                                'nginx.conf': {
                                    type: 'file',
                                    content: [
                                        '# /etc/nginx/nginx.conf -- Main configuration',
                                        'user www-data;',
                                        'worker_processes auto;',
                                        'pid /run/nginx.pid;',
                                        '',
                                        'events {',
                                        '    worker_connections 768;',
                                        '}',
                                        '',
                                        'http {',
                                        '    sendfile on;',
                                        '    tcp_nopush on;',
                                        '    tcp_nodelay on;',
                                        '    keepalive_timeout 65;',
                                        '    types_hash_max_size 2048;',
                                        '    server_tokens off;',
                                        '',
                                        '    include /etc/nginx/mime.types;',
                                        '    default_type application/octet-stream;',
                                        '',
                                        '    access_log /var/log/nginx/access.log;',
                                        '    error_log  /var/log/nginx/error.log;',
                                        '',
                                        '    include /etc/nginx/conf.d/*.conf;',
                                        '    include /etc/nginx/sites-enabled/*;',
                                        '}'
                                    ].join('\n')
                                }
                            }
                        },

                        // ── /etc/passwd ──────────────────────────────────────
                        // Noise: normal system accounts + svc-deploy (the NOPASSWD account)
                        // student can cross-reference with sudoers.d to connect the account
                        // to its over-privileged sudo rule.
                        'passwd': {
                            type: 'file',
                            content: [
                                'root:x:0:0:root:/root:/bin/bash',
                                'daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin',
                                'bin:x:2:2:bin:/bin:/usr/sbin/nologin',
                                'sys:x:3:3:sys:/dev:/usr/sbin/nologin',
                                'sync:x:4:65534:sync:/bin:/bin/sync',
                                'games:x:5:60:games:/usr/games:/usr/sbin/nologin',
                                'man:x:6:12:man:/var/cache/man:/usr/sbin/nologin',
                                'lp:x:7:7:lp:/var/spool/lpd:/usr/sbin/nologin',
                                'mail:x:8:8:mail:/var/mail:/usr/sbin/nologin',
                                'news:x:9:9:news:/var/spool/news:/usr/sbin/nologin',
                                'uucp:x:10:10:uucp:/var/spool/uucp:/usr/sbin/nologin',
                                'proxy:x:13:13:proxy:/bin:/usr/sbin/nologin',
                                'www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin',
                                'backup:x:34:34:backup:/var/backups:/usr/sbin/nologin',
                                'list:x:38:38:Mailing List Manager:/var/list:/usr/sbin/nologin',
                                'irc:x:39:39:ircd:/var/run/ircd:/usr/sbin/nologin',
                                'nobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin',
                                'systemd-network:x:100:102:systemd Network Management,,,:/run/systemd:/usr/sbin/nologin',
                                'systemd-resolve:x:101:103:systemd Resolver,,,:/run/systemd:/usr/sbin/nologin',
                                'messagebus:x:102:105::/nonexistent:/usr/sbin/nologin',
                                'syslog:x:103:109::/home/syslog:/usr/sbin/nologin',
                                '_apt:x:104:65534::/nonexistent:/usr/sbin/nologin',
                                'tcpdump:x:105:113::/nonexistent:/usr/sbin/nologin',
                                'sshd:x:106:65534::/run/sshd:/usr/sbin/nologin',
                                'landscape:x:107:115::/var/lib/landscape:/usr/sbin/nologin',
                                'pollinate:x:108:1::/var/cache/pollinate:/bin/false',
                                'usbmux:x:109:46:usbmux daemon,,,:/var/lib/usbmux:/usr/sbin/nologin',
                                'mysql:x:110:117:MySQL Server,,,:/nonexistent:/bin/false',
                                'deploy:x:1001:1001:Deployment Service,,,:/home/deploy:/bin/bash',
                                'ops:x:1002:1002:Operations,,,:/home/ops:/bin/bash',
                                'ansible:x:1003:1003:Ansible Automation,,,:/home/ansible:/bin/bash',
                                'svc-deploy:x:1004:1004:Veridian Deployment Service Account,,,:/home/svc-deploy:/bin/bash'
                            ].join('\n')
                        },

                        // ── /etc/sudoers ────────────────────────────────────
                        // Main sudoers: legitimate, scoped sudo rules (noise).
                        // The NOPASSWD flag is in the drop-in file sudoers.d/veridian-svc.
                        'sudoers': {
                            type: 'file',
                            content: [
                                '# /etc/sudoers -- Main sudo policy for WEB-DMZ-02',
                                '# This file must be edited with visudo.',
                                '#',
                                '# See the man page for details on how to write a sudoers file.',
                                '#',
                                'Defaults    env_reset',
                                'Defaults    mail_badpass',
                                'Defaults    secure_path="/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"',
                                '',
                                '# User privilege specification',
                                'root    ALL=(ALL:ALL) ALL',
                                '',
                                '# Allow members of group sudo to execute any command',
                                '%sudo   ALL=(ALL:ALL) ALL',
                                '',
                                '# Operations team: scoped commands only (no password for approved ops tasks)',
                                'ops     ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart nginx, /usr/bin/systemctl reload nginx',
                                'ops     ALL=(ALL) NOPASSWD: /usr/bin/systemctl status *',
                                '',
                                '# Ansible automation: scoped to package management and service control',
                                'ansible ALL=(ALL) NOPASSWD: /usr/bin/apt-get, /usr/bin/apt, /usr/bin/systemctl',
                                '',
                                '# Deploy user: application deployment only',
                                'deploy  ALL=(www-data) NOPASSWD: /usr/bin/rsync',
                                'deploy  ALL=(www-data) NOPASSWD: /usr/bin/cp',
                                '',
                                '# Additional service-account policies from drop-in directory',
                                '@includedir /etc/sudoers.d'
                            ].join('\n')
                        },

                        // ── /etc/sudoers.d/ ──────────────────────────────────
                        'sudoers.d': {
                            type: 'dir',
                            children: {

                                // The README is standard Ubuntu noise
                                'README': {
                                    type: 'file',
                                    content: [
                                        'As of Debian version 1.7.2p1-1, the default /etc/sudoers file created on',
                                        'installation of the package now includes the directive:',
                                        '',
                                        '  @includedir /etc/sudoers.d',
                                        '',
                                        'The files in that directory will be processed in alphabetical order.',
                                        'The file itself must not contain a trailing ~ or a . in the filename.',
                                        '',
                                        'Note that there must be at least one file in the sudoers.d directory',
                                        '(this one will do), and all files in the directory should be readable',
                                        'by root only.'
                                    ].join('\n')
                                },

                                // FLAG: nopasswd_account
                                //   -> cat /etc/sudoers.d/veridian-svc
                                //      contains: svc-deploy ALL=(ALL) NOPASSWD: ALL
                                //   -> value to submit: svc-deploy
                                'veridian-svc': {
                                    type: 'file',
                                    content: [
                                        '# /etc/sudoers.d/veridian-svc',
                                        '# Veridian deployment service account sudo policy',
                                        '# Created: 2025-09-12 by infra-provisioning (build image default)',
                                        '#',
                                        '# TODO(infra): scope this to specific deployment commands before go-live.',
                                        '# Current setting is a broad NOPASSWD grant left over from image testing.',
                                        '#',
                                        'svc-deploy ALL=(ALL) NOPASSWD: ALL'
                                    ].join('\n')
                                }

                            }
                        },

                        // ── /etc/hosts + /etc/hostname (context) ────────────
                        'hostname': { type: 'file', content: 'web-dmz-02' },

                        'hosts': {
                            type: 'file',
                            content: [
                                '127.0.0.1   localhost',
                                '127.0.1.1   web-dmz-02',
                                '10.10.10.25 web-dmz-02.veridian.internal web-dmz-02',
                                '10.10.1.5   deploy-jump.veridian.internal',
                                '10.10.1.10  int-core-01.veridian.internal',
                                '10.10.50.10 db-primary-01.veridian.internal'
                            ].join('\n')
                        }

                    } // end /etc children
                },

                'tmp': { type: 'dir', children: {} },

                // /var exists so paths like /var/log resolve cleanly
                'var': {
                    type: 'dir',
                    children: {
                        'log': {
                            type: 'dir',
                            children: {
                                'nginx': {
                                    type: 'dir',
                                    children: {
                                        'error.log': {
                                            type: 'file',
                                            content: [
                                                '2026/05/17 08:00:01 [notice] 1412#1412: using the "epoll" event method',
                                                '2026/05/17 08:00:01 [notice] 1412#1412: nginx/1.24.0 (Ubuntu)',
                                                '2026/05/17 08:00:01 [notice] 1412#1412: built by gcc 11.4.0 (Ubuntu 11.4.0-1ubuntu1~22.04)',
                                                '2026/05/17 08:00:01 [notice] 1412#1412: OS: Linux 5.15.0-101-generic',
                                                '2026/05/17 08:00:01 [warn] 1412#1412: SSLv3 is enabled -- deprecated protocol; ensure compliance review is complete',
                                                '2026/05/17 08:00:01 [notice] 1412#1412: start worker processes'
                                            ].join('\n')
                                        }
                                    }
                                }
                            }
                        }
                    }
                }

            } // end / children
        }
    },

    // =========================================================
    // TERMINAL COMMANDS (custom additions)
    //
    // grep is PIPE-only in Terminal.js built-ins.
    // We add it as a standalone file-search command here so
    // `grep PATTERN /path/file` works directly, which is the
    // natural audit pattern students will use.
    // =========================================================

    commands: {

        // ── grep: file-based AND pipe-aware ────────────────────
        // Handles: grep PATTERN FILE          (direct file search)
        //          cat FILE | grep PATTERN    (piped stdin via term._pipedStdin)
        //          grep -i PATTERN FILE       (case-insensitive)
        //          grep -v PATTERN FILE       (invert match)
        //          grep -c PATTERN FILE       (count matches)
        //          grep -n PATTERN FILE       (show line numbers)
        //
        // Terminal.js sets term._pipedStdin = <previous stdout> before
        // calling any custom command handler in a pipeline segment.
        // When a file arg is absent but _pipedStdin is non-empty, filter
        // those lines by the pattern instead of erroring.
        'grep': function(args, term, engine) {
            if (!args.length) {
                return 'Usage: grep [OPTIONS] PATTERN FILE\n  -i  case-insensitive\n  -v  invert match (lines NOT matching)\n  -c  count matching lines\n  -n  show line numbers\n\nExample: grep PATTERN /etc/ssh/sshd_config\nExample: cat /etc/sudoers.d/veridian-svc | grep PATTERN';
            }

            // Parse flags and positional args
            var flags      = args.filter(function(a) { return a.startsWith('-'); });
            var nonFlag    = args.filter(function(a) { return !a.startsWith('-'); });
            var pattern    = nonFlag[0] || '';
            var filePath   = nonFlag[1] || '';

            var caseInsensitive = flags.some(function(f) { return f.includes('i'); });
            var invertMatch     = flags.some(function(f) { return f.includes('v'); });
            var countOnly       = flags.some(function(f) { return f.includes('c'); });
            var showLineNums    = flags.some(function(f) { return f.includes('n'); });

            if (!pattern) return 'grep: missing pattern\nUsage: grep PATTERN FILE';

            // Determine the content to search: piped stdin OR a named file.
            // Terminal.js populates term._pipedStdin when this command runs
            // as a pipeline segment (e.g. cat file | grep pattern).
            var content;
            if (filePath) {
                // Named file argument: resolve it in the virtual filesystem
                var node = term._getNode(filePath);
                if (!node) return 'grep: ' + filePath + ': No such file or directory';
                if (node.type === 'dir') return 'grep: ' + filePath + ': Is a directory';
                content = node.content || '';
            } else if (term._pipedStdin) {
                // No file arg, but piped input is available -- filter stdin
                content = term._pipedStdin;
            } else {
                // Neither a file arg nor piped input: real grep error
                return 'grep: missing file argument\nUsage: grep PATTERN FILE\n       cat FILE | grep PATTERN';
            }

            var lines = content.split('\n');

            var re;
            try {
                re = new RegExp(pattern, caseInsensitive ? 'i' : '');
            } catch (e) {
                return 'grep: invalid regular expression: ' + pattern;
            }

            var matched = [];
            lines.forEach(function(line, idx) {
                var hits = re.test(line);
                var keep = invertMatch ? !hits : hits;
                if (keep) matched.push({ num: idx + 1, text: line });
            });

            if (countOnly) return String(matched.length);
            if (!matched.length) return ''; // grep exits silently when no match

            if (showLineNums) {
                return matched.map(function(m) { return m.num + ':' + m.text; }).join('\n');
            }
            return matched.map(function(m) { return m.text; }).join('\n');
        },

        // ── wc -l shorthand ───────────────────────────────────
        // Lets students count lines: wc -l /home/analyst/listening_ports.txt
        'wc': function(args, term) {
            var lineMode  = args.includes('-l');
            var wordMode  = args.includes('-w');
            var filePaths = args.filter(function(a) { return !a.startsWith('-'); });

            if (!filePaths.length) {
                // Piped input (e.g. grep PATTERN FILE | wc -l): no file arg, count term._pipedStdin
                if (term && term._pipedStdin) {
                    var _s = term._pipedStdin;
                    var _sl = _s === '' ? 0 : _s.replace(/\n+$/, '').split('\n').length;
                    var _sw = _s.split(/\s+/).filter(Boolean).length;
                    if (lineMode) return '  ' + _sl;
                    if (wordMode) return '  ' + _sw;
                    return '  ' + _sl + '  ' + _sw + '  ' + _s.length;
                }
                return 'Usage: wc [-l] [-w] FILE\nExample: wc -l /var/log/auth.log';
            }

            var results = [];
            filePaths.forEach(function(fp) {
                var node = term._getNode(fp);
                if (!node) { results.push('wc: ' + fp + ': No such file or directory'); return; }
                if (node.type === 'dir') { results.push('wc: ' + fp + ': Is a directory'); return; }
                var c = node.content || '';
                var lineCount = c.split('\n').length;
                var wordCount = c.split(/\s+/).filter(Boolean).length;
                if (lineMode) results.push('  ' + lineCount + ' ' + fp);
                else if (wordMode) results.push('  ' + wordCount + ' ' + fp);
                else results.push('  ' + lineCount + '  ' + wordCount + '  ' + c.length + ' ' + fp);
            });
            return results.join('\n');
        },

        // ── help override (supplements built-in with audit context) ──
        'help': function(args, term) {
            return [
                'HARDENING AUDIT -- COMMAND REFERENCE',
                '',
                'File inspection:',
                '  ls [PATH]               List directory contents',
                '  cat FILE                Display full file contents',
                '  head [-n N] FILE        First N lines (default 10)',
                '  tail [-n N] FILE        Last N lines (default 10)',
                '  find PATH [-name PAT]   Search for files',
                '',
                'Search and filter:',
                '  grep [-ivnc] PAT FILE   Search for pattern in file',
                '    -i  case-insensitive  -v  invert  -n  line nums  -c  count',
                '  wc -l FILE              Count lines in a file',
                '',
                'Navigation:',
                '  cd PATH                 Change directory',
                '  pwd                     Print working directory',
                '  clear                   Clear screen',
                '',
                'Key config file locations:',
                '  /home/analyst/audit_task.txt        Audit brief and checklist',
                '  /home/analyst/listening_ports.txt   Active listening services (netstat)',
                '  /etc/ssh/sshd_config                SSH daemon configuration',
                '  /etc/nginx/ssl.conf                 Nginx TLS/SSL settings',
                '  /etc/passwd                         Local user accounts',
                '  /etc/sudoers                        Main sudo policy',
                '  /etc/sudoers.d/veridian-svc         Service account sudo drop-in',
                '',
                'Firewall ruleset:',
                '  Use the FirewallManager device (Firewall icon on desktop).',
                '  Look for ACCEPT rules on unexpected ports from 0.0.0.0/0.',
                '',
                'Key investigation patterns:',
                '  grep "PermitRootLogin" /etc/ssh/sshd_config',
                '  grep "ssl_protocols" /etc/nginx/ssl.conf',
                '  grep "NOPASSWD" /etc/sudoers.d/veridian-svc',
                '  grep "23/" /home/analyst/listening_ports.txt'
            ].join('\n');
        }

    },

    // =========================================================
    // FIREWALL MANAGER DATA (BlueTeam.js FirewallManager device)
    //
    // Overly permissive ruleset for a DMZ server:
    //   - Port 3306 (MySQL) allowed inbound from 0.0.0.0/0 -- the FLAG exposed_port
    //   - Port 22 allowed inbound from 0.0.0.0/0 (should be jump-host only -- noise)
    //   - Port 80 and 443 are expected (Nginx)
    //   - No explicit egress restriction
    //
    // Students must open FirewallManager, read the rules, and
    // identify port 3306 as the unnecessarily exposed port.
    // =========================================================

    firewall: {
        rules: [
            // Expected inbound: HTTPS customer portal
            { chain: 'INPUT',  src: '0.0.0.0/0',     dst: '10.10.10.25', port: '443',  protocol: 'tcp', action: 'ACCEPT' },
            // Expected inbound: HTTP (redirect to HTTPS)
            { chain: 'INPUT',  src: '0.0.0.0/0',     dst: '10.10.10.25', port: '80',   protocol: 'tcp', action: 'ACCEPT' },
            // SSH inbound -- overly broad (should be jump-host 10.10.1.5 only; broad is noise, not the flag)
            { chain: 'INPUT',  src: '0.0.0.0/0',     dst: '10.10.10.25', port: '22',   protocol: 'tcp', action: 'ACCEPT' },
            // UNNECESSARY EXPOSED PORT: MySQL from any source -- the flag value is 3306
            { chain: 'INPUT',  src: '0.0.0.0/0',     dst: '10.10.10.25', port: '3306', protocol: 'tcp', action: 'ACCEPT' },
            // Internal management: allow from management VLAN (legitimate)
            { chain: 'INPUT',  src: '10.10.1.0/24',  dst: '10.10.10.25', port: 'any',  protocol: 'any', action: 'ACCEPT' },
            // Outbound: unrestricted (build default -- acceptable noise)
            { chain: 'OUTPUT', src: '10.10.10.25',   dst: '0.0.0.0/0',   port: 'any',  protocol: 'any', action: 'ACCEPT' }
        ]
    },

    // =========================================================
    // FLAGS
    //
    // All five flags are find-and-submit: the student discovers
    // the exact value from the config evidence and types it into
    // the Submit Flag panel. BoxEngine validates against Firestore
    // flag_registry/{boxId}/flags/{flagId}.
    //
    // FIRESTORE SEEDING (flag_registry/shield-sp-blueteam-config-audit):
    //   cleartext_service    -> telnet
    //   root_login_directive -> yes
    //   weak_tls             -> SSLv3
    //   exposed_port         -> 3306
    //   nopasswd_account     -> svc-deploy
    // =========================================================

    flags: [
        {
            id:          'cleartext_service',
            points:      100,
            label:       'Cleartext Remote Service',
            description: 'The name of the insecure cleartext remote-access service that is currently listening on WEB-DMZ-02. Find it in the listening-ports file. Submit the service name exactly as it appears in the service notes column.'
        },
        {
            id:          'root_login_directive',
            points:      100,
            label:       'PermitRootLogin Value',
            description: 'The current value of the PermitRootLogin directive in /etc/ssh/sshd_config. Submit only the value (not the directive name). This is the insecure default that must be changed before go-live.'
        },
        {
            id:          'weak_tls',
            points:      150,
            label:       'Weak TLS Protocol Enabled',
            description: 'The OLDEST, most vulnerable protocol version enabled in /etc/nginx/ssl.conf -- the one that predates TLSv1.0 and was broken by the POODLE attack (2014). Several deprecated versions are enabled; submit the single weakest one, exactly as it appears in the ssl_protocols directive (capitalization exact).'
        },
        {
            id:          'exposed_port',
            points:      150,
            label:       'Unnecessary Exposed Port',
            description: 'The port number of the service allowed inbound from any source (0.0.0.0/0) in the firewall ruleset that should not be internet-accessible. Find it in the FirewallManager device. Submit the port number only.'
        },
        {
            id:          'nopasswd_account',
            points:      200,
            label:       'NOPASSWD Sudo Account',
            description: 'The username of the service account that has an unrestricted NOPASSWD: ALL sudo rule. Read /etc/sudoers.d/veridian-svc to find it. Submit the username exactly as it appears.'
        }
    ],

    // =========================================================
    // SCORING
    // =========================================================

    scoring: {
        base:              1000,
        minScore:          0,
        maxScore:          700,
        hintPenalty:       true,
        wrongFlagPenalty:  -25,
        speedBonus:        { threshold: 1800000, points: 100 },
        timeBonusThreshold: 2400
    },

    // =========================================================
    // HINTS
    //
    // Progressive: first two hints give strategy, third gives the
    // exact command that surfaces the value. Only the FINAL hint
    // per flag uses {{FLAG:id}} (largest penalty -- confirms answer).
    // No hint may contain a flag value except the final {{FLAG:id}}.
    // =========================================================

    hints: [

        // ── cleartext_service ─────────────────────────────────
        {
            id:      'hint_cleartext_1',
            flagId:  'cleartext_service',
            text:    'Check which services are currently listening on WEB-DMZ-02. The listening-ports snapshot in your home directory records every active service, its port, and the program name. Look for any remote-access protocol that transmits credentials and data in plaintext.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_cleartext_2',
            flagId:  'cleartext_service',
            text:    'Open /home/analyst/listening_ports.txt and look at the service notes section at the bottom. Port 22 is SSH (encrypted -- expected). Port 23 belongs to a legacy remote-access protocol that sends all traffic in cleartext. The service name appears in the notes column next to its port number.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_cleartext_3',
            flagId:  'cleartext_service',
            text:    'Run: grep "23/" /home/analyst/listening_ports.txt\n\nThe notes at the bottom of the file name the service. Submit that service name exactly.\n\nThe value to submit: {{FLAG:cleartext_service}}',
            cost:    75,
            penalty: -75
        },

        // ── root_login_directive ──────────────────────────────
        {
            id:      'hint_root_1',
            flagId:  'root_login_directive',
            text:    'The SSH daemon configuration is at /etc/ssh/sshd_config. One of the most critical hardening directives is PermitRootLogin -- when set to its insecure default, it allows attackers to target the root account directly over SSH. Read the file to find its current value.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_root_2',
            flagId:  'root_login_directive',
            text:    'The PermitRootLogin directive is in the Authentication section of sshd_config. Run: grep "PermitRootLogin" /etc/ssh/sshd_config\n\nThe line shows "PermitRootLogin <value>". Submit only the value (the word after PermitRootLogin), not the full directive line.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_root_3',
            flagId:  'root_login_directive',
            text:    'The build image left PermitRootLogin at its insecure default -- a single short word. The hardened value would be "no" or "prohibit-password". The current value is neither of those.\n\nThe value to submit: {{FLAG:root_login_directive}}',
            cost:    75,
            penalty: -75
        },

        // ── weak_tls ──────────────────────────────────────────
        {
            id:      'hint_tls_1',
            flagId:  'weak_tls',
            text:    'Nginx TLS/SSL settings are in /etc/nginx/ssl.conf. The ssl_protocols directive controls which protocol versions Nginx will accept. A hardened server should support only TLSv1.2 and TLSv1.3 -- any older version is a critical finding for an internet-facing server.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_tls_2',
            flagId:  'weak_tls',
            text:    'Run: grep "ssl_protocols" /etc/nginx/ssl.conf\n\nThe matching line lists every protocol version currently enabled. TLSv1.2 is acceptable. Anything older (TLSv1.1, TLSv1.0, or the oldest) must be identified. Submit the name of the weakest protocol listed -- the oldest and most vulnerable one.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_tls_3',
            flagId:  'weak_tls',
            text:    'The ssl_protocols line in ssl.conf includes a deprecated protocol from the 1990s that was broken by the POODLE attack in 2014. It predates TLSv1.0. Submit it exactly as written in the directive -- capitalization matters.\n\nThe value to submit: {{FLAG:weak_tls}}',
            cost:    75,
            penalty: -75
        },

        // ── exposed_port ──────────────────────────────────────
        {
            id:      'hint_port_1',
            flagId:  'exposed_port',
            text:    'Open the FirewallManager device (click the Firewall icon on the desktop). Review every INPUT chain ACCEPT rule. WEB-DMZ-02 is a web server -- only HTTP (80), HTTPS (443), and SSH (22) should be reachable from the internet. Any other port allowed from 0.0.0.0/0 is a finding.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_port_2',
            flagId:  'exposed_port',
            text:    'In the FirewallManager, read the INPUT rules with src=0.0.0.0/0 one by one. Ports 80, 443, and 22 are expected for a web server. There is a fourth rule that allows a database protocol port inbound from any source -- a service that should never be internet-accessible on a DMZ host.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_port_3',
            flagId:  'exposed_port',
            text:    'The unnecessarily exposed port is the default port for the most widely used open-source relational database. You can also cross-reference it in /home/analyst/listening_ports.txt -- the same port appears in the active listeners with "mysqld" as the process.\n\nThe value to submit: {{FLAG:exposed_port}}',
            cost:    75,
            penalty: -75
        },

        // ── nopasswd_account ──────────────────────────────────
        {
            id:      'hint_nopasswd_1',
            flagId:  'nopasswd_account',
            text:    'Review the privilege escalation configuration. The main /etc/sudoers file has scoped sudo rules. Ubuntu also loads per-file policies from /etc/sudoers.d/ -- check that directory for additional drop-in files. Any account with NOPASSWD: ALL is a critical finding on an internet-facing server.',
            cost:    25,
            penalty: -25
        },
        {
            id:      'hint_nopasswd_2',
            flagId:  'nopasswd_account',
            text:    'Run: ls /etc/sudoers.d/\n\nYou will see a drop-in file specific to Veridian service accounts. Read it: cat /etc/sudoers.d/veridian-svc\n\nThe file contains a single sudo rule. Look at the username on the left side of the NOPASSWD: ALL grant. That username is the flag value.',
            cost:    50,
            penalty: -50
        },
        {
            id:      'hint_nopasswd_3',
            flagId:  'nopasswd_account',
            text:    'The NOPASSWD account is a Veridian deployment service account. The build image left it with an unrestricted ALL grant for testing convenience. You can also see this account in /etc/passwd.\n\nThe value to submit: {{FLAG:nopasswd_account}}',
            cost:    75,
            penalty: -75
        }

    ],

    // =========================================================
    // CERT OBJECTIVES (assessment mode compatibility)
    //
    // certObjectives.mappings is the live format (flat array under
    // certObjectives) -- NOT a standalone objectiveMappings block.
    // =========================================================

    certObjectives: {
        certPath: 'CompTIA Security+ SY0-701',
        mappings: [
            {
                flagId:      'cleartext_service',
                objective:   '4.1',
                description: 'Apply common security techniques to computing resources -- disable unnecessary services, implement secure protocols',
                skill:       'Identifying cleartext remote-access services (Telnet) in a listening-ports inventory'
            },
            {
                flagId:      'root_login_directive',
                objective:   '4.1',
                description: 'Apply common security techniques to computing resources -- hardening SSH configuration to secure baselines',
                skill:       'Reading and evaluating SSH daemon configuration directives for insecure defaults'
            },
            {
                flagId:      'weak_tls',
                objective:   '2.5',
                description: 'Explain the security implications of proper hardware, software, and data asset management -- cryptographic protocol deprecation',
                skill:       'Identifying deprecated TLS/SSL protocol versions in Nginx ssl_protocols directive'
            },
            {
                flagId:      'exposed_port',
                objective:   '4.1',
                description: 'Apply common security techniques to computing resources -- firewall rule review and unnecessary service exposure',
                skill:       'Auditing firewall rulesets to identify unnecessarily internet-exposed database ports'
            },
            {
                flagId:      'nopasswd_account',
                objective:   '4.1',
                description: 'Apply common security techniques to computing resources -- least-privilege principle and sudo policy hardening',
                skill:       'Identifying over-privileged NOPASSWD sudo grants in sudoers drop-in files'
            }
        ]
    },

    // =========================================================
    // STATE RESET (BOX-006 pattern -- idempotent on script load)
    // =========================================================

    resetState: function() {
        // No internal _state needed for a pure find-and-submit box.
        // BoxEngine manages flag submission state in Firestore.
    }

};

// Auto-reset on load (BOX-006 backfill 2026-05-23)
// Use window.VFCAConfig -- the bare name is not in scope after the window= assignment.
if (window.VFCAConfig) window.VFCAConfig.resetState();
