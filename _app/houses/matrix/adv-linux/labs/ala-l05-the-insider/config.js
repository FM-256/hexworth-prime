/* ============================================================
   ALA-L05: The Insider
   Advanced Linux Administration -- CTF Lab
   Incident response, auth log analysis, 2FA hardening
   ============================================================ */

const ALAL05Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Insider',
    subtitle: 'Advanced Linux Administration -- Incident Response',
    description: 'Cell-016 shows unauthorized activity. An unknown actor gained access at 03:40 using password authentication, escalated with sudo, and exfiltrated credential data before disconnecting at 03:58. Investigate the breach, identify what was taken, and harden the cell against re-entry.',
    difficulty: 'Hard',
    estimatedTime: 45,
    accent: '#22d3ee',
    storageKey: 'hexworth_lab_ala_l05',
    registryId: 'ala-l05-the-insider',
    trackerKey: 'lab_ala_l05',

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'CELL-016 BIOS v2.1.0',
            'Initializing hardware...',
            'Memory Test: 8192 MB OK',
            'Detecting drives... /dev/sda1 (256GB SSD)',
            'Network: eth0 link detected, eth1 link UP',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Ubuntu 22.04 LTS',
            'Ubuntu 22.04 LTS (recovery mode)',
            'Advanced options for Ubuntu'
        ],
        loginUser: 'operator'
    },

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'Grid Command flagged an anomaly on Cell-016 at 08:00. Auth logs show an 18-minute session starting at 03:40 from an external IP. The account used was yours. You were not logged in at 03:40. Someone used your credentials. Find out exactly what they did, remove the persistence they left, and lock the door behind them.',
        scenario: 'Password authentication was enabled on sshd. The attacker brute-forced the operator password from 203.0.113.77 -- three failed attempts, then success on the fourth. They escalated with sudo three times: reading /etc/shadow, copying /etc/passwd to /tmp/.p, and enumerating .key files under /home. They also added an SSH key to authorized_keys for persistent re-entry. The session ended at 03:58.',
        outro: 'Two-factor authentication is active. The rogue authorized key has been removed. The breach timeline is documented. Cell-016 is hardened. Grid Command has the incident report. The attacker will not get a second session.'
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'operator',
        hostname: 'cell-016',
        startDir: '/home/operator',
        welcome: 'Ubuntu 22.04.3 LTS \\n \\l\n\nWelcome to CELL-016\nLast login: Thu Apr 10 08:01:44 2026 from 10.0.0.1\n\n*** SECURITY ALERT: Anomalous session detected ***\n*** Review /var/log/auth.log immediately ***\n*** Contact: Grid Security Operations ***\n\nType \'help\' for available commands.\n'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal',  label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'notes',     label: 'Notes',       icon: '\uD83D\uDCDD',    app: 'notes'    },
            { id: 'hints',     label: 'Hints',       icon: '\uD83D\uDCA1',    app: 'hints'    },
            { id: 'flags',     label: 'Submit Flag', icon: '\uD83D\uDEA9',    app: 'flags'    }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED FILESYSTEM
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'operator': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: 'Incident flagged by Grid Command at 08:00.\nAnomaly window: 03:40 -- 03:58 from unknown external IP.\nMy shift does not start until 06:00. I was not logged in.\nCheck auth.log first. Then authorized_keys.\nHardening steps: disable password auth, add 2FA.\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    // Attacker cleared this; only legitimate recent commands remain
                                    content: 'ls\nwhoami\ncat notes.txt\n'
                                },
                                '.ssh': {
                                    type: 'dir',
                                    children: {
                                        'authorized_keys': {
                                            type: 'file',
                                            // Legitimate key + rogue key added during the session
                                            content: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOperatorKeyCell016GridAccess operator@grid-command\nssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7rogue...intruder@203.0.113.77\n'
                                        },
                                        'known_hosts': {
                                            type: 'file',
                                            content: '10.0.0.1 ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIGridCommandHostKey\n'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'root': {
                    type: 'dir',
                    children: {
                        '.bash_history': {
                            type: 'file',
                            // sudo escalations preserve root history even when operator history is cleared
                            content: '# Commands run via sudo during unauthorized session\ncat /etc/shadow\ncp /etc/passwd /tmp/.p\nfind /home -name "*.key"\nmkdir /tmp/.k\nfind /home -name "*.key" > /tmp/.k/keys.txt\n'
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {
                        '.p': {
                            type: 'file',
                            // Copy of /etc/passwd placed here by attacker
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nsyslog:x:104:110::/home/syslog:/usr/sbin/nologin\noperator:x:1000:1000:Grid Operator:/home/operator:/bin/bash\nsvc-monitor:x:1001:1001:Grid Monitor Service:/nonexistent:/bin/false\n'
                        },
                        '.k': {
                            type: 'dir',
                            children: {
                                'keys.txt': {
                                    type: 'file',
                                    content: '/home/operator/.ssh/authorized_keys\n'
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
                            content: 'cell-016\n'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nsyslog:x:104:110::/home/syslog:/usr/sbin/nologin\noperator:x:1000:1000:Grid Operator:/home/operator:/bin/bash\nsvc-monitor:x:1001:1001:Grid Monitor Service:/nonexistent:/bin/false\n'
                        },
                        'shadow': {
                            type: 'file',
                            // Requires sudo -- BoxEngine enforces this via the cat command handler
                            content: 'root:$6$rounds=5000$salt$hashedpasswordroot:19451:0:99999:7:::\noperator:$6$rounds=5000$salt$hashedpasswordoperator:19451:0:99999:7:::\nsvc-monitor:!:19451::::::\n'
                        },
                        'sudoers.d': {
                            type: 'dir',
                            children: {
                                'operator': {
                                    type: 'file',
                                    content: 'operator ALL=(ALL) NOPASSWD: /usr/bin/systemctl, /usr/bin/apt, /usr/bin/cat, /usr/bin/find, /usr/bin/cp\n'
                                }
                            }
                        },
                        'ssh': {
                            type: 'dir',
                            children: {
                                'sshd_config': {
                                    type: 'file',
                                    // PasswordAuthentication yes is the entry vector
                                    content: '# OpenSSH Server Configuration -- cell-016\nPort 22\nProtocol 2\nHostKey /etc/ssh/ssh_host_rsa_key\nHostKey /etc/ssh/ssh_host_ed25519_key\nPermitRootLogin no\nPasswordAuthentication yes\nPubkeyAuthentication yes\nAuthorizedKeysFile .ssh/authorized_keys\nKbdInteractiveAuthentication no\nX11Forwarding no\nPrintMotd no\nAcceptEnv LANG LC_*\nSubsystem sftp /usr/lib/openssh/sftp-server\n'
                                }
                            }
                        },
                        'pam.d': {
                            type: 'dir',
                            children: {
                                'sshd': {
                                    type: 'file',
                                    // Standard sshd PAM config -- no 2FA configured yet (the hardening gap)
                                    content: '# PAM configuration for the Secure Shell daemon\n@include common-auth\n@include common-account\n@include common-session\n@include common-password\n'
                                },
                                'common-auth': {
                                    type: 'file',
                                    content: 'auth    [success=1 default=ignore]  pam_unix.so nullok\nauth    requisite                   pam_deny.so\nauth    required                    pam_permit.so\n'
                                }
                            }
                        }
                    }
                },
                'opt': {
                    type: 'dir',
                    children: {
                        'verify': {
                            type: 'dir',
                            children: {
                                'test-2fa.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Verification script: confirms 2FA is active on sshd\n# Checks PAM config and sshd_config for required directives\nset -e\n\nPAM_OK=0\nSSHD_OK=0\n\ngrep -q "pam_google_authenticator.so" /etc/pam.d/sshd && PAM_OK=1\ngrep -q "KbdInteractiveAuthentication yes" /etc/ssh/sshd_config && SSHD_OK=1\n\nif [ $PAM_OK -eq 1 ] && [ $SSHD_OK -eq 1 ]; then\n    echo "[PASS] 2FA configuration verified."\n    echo "[PASS] pam_google_authenticator.so present in /etc/pam.d/sshd"\n    echo "[PASS] KbdInteractiveAuthentication enabled in sshd_config"\n    echo "FLAG: FLAG{ala-l05-the-insider_flag1_2fa_configured}"\nelse\n    [ $PAM_OK -eq 0 ] && echo "[FAIL] pam_google_authenticator.so not found in /etc/pam.d/sshd"\n    [ $SSHD_OK -eq 0 ] && echo "[FAIL] KbdInteractiveAuthentication not set to yes in sshd_config"\nfi\n'
                                }
                            }
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    children: {
                        'log': {
                            type: 'dir',
                            children: {
                                'auth.log': {
                                    type: 'file',
                                    // Pre-planted incident evidence -- exact timestamps from build guide spec
                                    content: 'Apr 10 03:40:11 cell-016 sshd[9842]: Failed password for operator from 203.0.113.77 port 51234 ssh2\nApr 10 03:40:14 cell-016 sshd[9842]: Failed password for operator from 203.0.113.77 port 51235 ssh2\nApr 10 03:40:17 cell-016 sshd[9842]: Failed password for operator from 203.0.113.77 port 51236 ssh2\nApr 10 03:40:20 cell-016 sshd[9843]: Accepted password for operator from 203.0.113.77 port 51237 ssh2\nApr 10 03:40:20 cell-016 sshd[9843]: pam_unix(sshd:session): session opened for user operator by (uid=0)\nApr 10 03:47:33 cell-016 sudo[9901]: operator : TTY=pts/0 ; PWD=/root ; USER=root ; COMMAND=/usr/bin/cat /etc/shadow\nApr 10 03:47:44 cell-016 sudo[9911]: operator : TTY=pts/0 ; PWD=/root ; USER=root ; COMMAND=/usr/bin/cp /etc/passwd /tmp/.p\nApr 10 03:51:02 cell-016 sudo[9934]: operator : TTY=pts/0 ; PWD=/root ; USER=root ; COMMAND=/usr/bin/find /home -name "*.key"\nApr 10 03:58:17 cell-016 sshd[9843]: Disconnected from user operator 203.0.113.77 port 51237\nApr 10 08:01:44 cell-016 sshd[10201]: Accepted publickey for operator from 10.0.0.1 port 44892 ssh2\nApr 10 08:01:44 cell-016 sshd[10201]: pam_unix(sshd:session): session opened for user operator by (uid=0)\n'
                                },
                                'syslog': {
                                    type: 'file',
                                    content: 'Apr 10 03:40:19 cell-016 systemd-logind[685]: New session 42 of user operator.\nApr 10 03:58:18 cell-016 systemd-logind[685]: Session 42 logged out. Waiting for processes to exit.\nApr 10 08:01:44 cell-016 systemd-logind[685]: New session 43 of user operator.\n'
                                }
                            }
                        }
                    }
                },
                'proc': {
                    type: 'dir',
                    children: {}
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // INTERNAL STATE (BoxEngine reads these)
    // ═══════════════════════════════════════════════════════

    // Track which hardening steps the operator has completed
    _state: {
        rogueKeyRemoved: false,     // rogue key removed from authorized_keys
        pamUpdated: false,          // pam_google_authenticator.so added to /etc/pam.d/sshd
        sshdUpdated: false,         // KbdInteractiveAuthentication yes + PasswordAuthentication no
        sshdReloaded: false,        // systemctl reload sshd run after config changes
        breachAnswered: false       // Flag 2: student submitted correct IP + method
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {

        // grep -- search files; primary investigation tool for this lab
        'grep': function(args, term, engine) {
            const pattern = args.find(a => !a.startsWith('-')) || '';
            const fileArg = args[args.length - 1];
            const iFlag = args.includes('-i');
            const nFlag = args.includes('-n') || args.includes('-rn');
            const rFlag = args.includes('-r') || args.includes('-rn');

            // grep against auth.log -- most common investigation command
            if (fileArg && fileArg.includes('auth.log') || fileArg === '/var/log/auth.log') {
                const log = term.fs['/'].children.var.children.log.children['auth.log'].content;
                const lines = log.split('\n').filter(l => l.length > 0);
                const matches = lines.filter(l => {
                    if (iFlag) return l.toLowerCase().includes(pattern.toLowerCase());
                    return l.includes(pattern);
                });
                if (matches.length === 0) return '';
                if (nFlag) return matches.map((l, i) => `${i + 1}:${l}`).join('\n');
                return matches.join('\n');
            }

            // grep against authorized_keys -- for persistence check
            if (fileArg && fileArg.includes('authorized_keys')) {
                const content = term.fs['/'].children.home.children.operator.children['.ssh'].children['authorized_keys'].content;
                const lines = content.split('\n').filter(l => l.length > 0);
                const matches = lines.filter(l => iFlag ? l.toLowerCase().includes(pattern.toLowerCase()) : l.includes(pattern));
                return matches.join('\n');
            }

            // grep against sshd_config
            if (fileArg && fileArg.includes('sshd_config')) {
                const content = term.fs['/'].children.etc.children.ssh.children['sshd_config'].content;
                const lines = content.split('\n').filter(l => l.length > 0);
                const matches = lines.filter(l => iFlag ? l.toLowerCase().includes(pattern.toLowerCase()) : l.includes(pattern));
                return matches.join('\n');
            }

            // grep against pam.d/sshd
            if (fileArg && (fileArg.includes('pam.d/sshd') || fileArg === '/etc/pam.d/sshd')) {
                const content = term.fs['/'].children.etc.children['pam.d'].children['sshd'].content;
                const lines = content.split('\n').filter(l => l.length > 0);
                const matches = lines.filter(l => iFlag ? l.toLowerCase().includes(pattern.toLowerCase()) : l.includes(pattern));
                return matches.join('\n');
            }

            return `grep: ${fileArg}: No such file or directory`;
        },

        // cat -- display file contents; enforces sudo requirement for /etc/shadow
        'cat': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';

            // /etc/shadow requires sudo -- simulate the restriction
            if (target === '/etc/shadow' || target === 'shadow') {
                return `cat: /etc/shadow: Permission denied\nUse: sudo cat /etc/shadow`;
            }

            // Delegate everything else to BoxEngine filesystem walker
            return null;
        },

        // sudo -- elevate for specific allowed commands
        'sudo': function(args, term, engine) {
            const cmd = args[0] || '';
            const rest = args.slice(1);

            if (cmd === 'cat' && rest.includes('/etc/shadow')) {
                return term.fs['/'].children.etc.children['shadow'].content;
            }

            if (cmd === 'apt' || cmd === 'apt-get') {
                const sub = rest[0] || '';
                const pkg = rest[1] || '';
                if (sub === 'install' && pkg === 'libpam-google-authenticator') {
                    engine.config._state.pamPackageInstalled = true;
                    return `Reading package lists... Done\nBuilding dependency tree... Done\nThe following NEW packages will be installed:\n  libpam-google-authenticator\n0 upgraded, 1 newly installed, 0 to remove and 0 not upgraded.\nNeed to get 48.2 kB of archives.\nGet:1 http://archive.ubuntu.com/ubuntu jammy/universe amd64 libpam-google-authenticator amd64 20191231-2 [48.2 kB]\nFetched 48.2 kB in 0s (312 kB/s)\nSelecting previously unselected package libpam-google-authenticator.\nPreparing to unpack .../libpam-google-authenticator_20191231-2_amd64.deb ...\nUnpacking libpam-google-authenticator (20191231-2) ...\nSetting up libpam-google-authenticator (20191231-2) ...\nProcessing triggers for man-db (2.10.2-1) ...\n`;
                }
                return `sudo apt: unrecognized package or subcommand`;
            }

            if (cmd === 'systemctl') {
                const sub = rest[0] || '';
                const unit = (rest[1] || '').replace(/\.service$/, '');
                if ((sub === 'reload' || sub === 'restart') && (unit === 'sshd' || unit === 'ssh')) {
                    if (!engine.config._state.pamUpdated || !engine.config._state.sshdUpdated) {
                        return `Warning: Reloading sshd -- config changes may not be complete.\nJob for ssh.service done.`;
                    }
                    engine.config._state.sshdReloaded = true;
                    return ``;
                }
                if (sub === 'status' && (unit === 'sshd' || unit === 'ssh')) {
                    return `\u25CF ssh.service - OpenBSD Secure Shell server\n     Loaded: loaded (/lib/systemd/system/ssh.service; enabled)\n     Active: active (running) since Thu 2026-04-10 08:01:00 UTC; 1h 0min ago\n   Main PID: 10201 (sshd)\n\nApr 10 08:01:00 cell-016 systemd[1]: Started OpenBSD Secure Shell server.`;
                }
                return `sudo systemctl: use 'sudo systemctl reload sshd' or 'sudo systemctl restart sshd'`;
            }

            if (cmd === 'nano' || cmd === 'vi' || cmd === 'vim') {
                return `[Editor simulation] Use the write command to modify files.\nExample: write /etc/ssh/sshd_config PasswordAuthentication no`;
            }

            return `sudo: ${cmd}: command not found`;
        },

        // google-authenticator -- TOTP setup simulation
        'google-authenticator': function(args, term, engine) {
            if (!engine.config._state.pamPackageInstalled) {
                return `bash: google-authenticator: command not found\nInstall with: sudo apt install libpam-google-authenticator`;
            }
            const hasFlags = args.includes('-t') || args.includes('-d') || args.includes('-f');
            if (hasFlags) {
                // Mark TOTP as configured and write the secret to the user directory
                engine.config._state.totpConfigured = true;
                term.fs['/'].children.home.children.operator.children['.google_authenticator'] = {
                    type: 'file',
                    content: 'JBSWY3DPEHPK3PXP\n\" RATE_LIMIT 3 30\n\" WINDOW_SIZE 17\n\" TOTP_AUTH\n18173513\n69416278\n31730827\n11042096\n52049834\n'
                };
                return `Do you want authentication tokens to be time-based (y/n) y\n\nYour new secret key is: JBSWY3DPEHPK3PXP\nYour verification code is 123456\nYour emergency scratch codes are:\n  18173513\n  69416278\n  31730827\n  11042096\n  52049834\n\nDo you want me to update your "/home/operator/.google_authenticator" file (y/n) y\n\nDo you want to disallow multiple uses of the same authentication\ntoken? (y/n) y\n\nBy default, a new token is generated every 30 seconds. (y/n) y\n\nIf the computer through which you are logging in is not hardened against brute-force\nlogin attempts, you can enable rate-limiting (y/n) y\n\nConfiguration complete. Add the following to /etc/pam.d/sshd:\n  auth required pam_google_authenticator.so\n`;
            }
            return `Usage: google-authenticator -t -d -f -r 3 -R 30 -W\nOptions:\n  -t  Time-based tokens\n  -d  Disallow reuse\n  -f  Force write without prompts\n  -r  Rate limit (attempts)\n  -R  Rate window (seconds)\n  -W  Minimal window`;
        },

        // write -- BoxEngine file editor simulation (replaces nano/vi for config edits)
        'write': function(args, term, engine) {
            const file = args[0] || '';
            const content = args.slice(1).join(' ');

            if (!file) return `Usage: write <file> <content>\nExample: write /etc/ssh/sshd_config PasswordAuthentication no`;

            // Edit PAM sshd config to add google-authenticator
            if (file === '/etc/pam.d/sshd') {
                if (!content.includes('pam_google_authenticator.so')) {
                    return `write: append the line: auth required pam_google_authenticator.so\nto /etc/pam.d/sshd`;
                }
                engine.config._state.pamUpdated = true;
                term.fs['/'].children.etc.children['pam.d'].children['sshd'].content =
                    term.fs['/'].children.etc.children['pam.d'].children['sshd'].content +
                    'auth required pam_google_authenticator.so\n';
                return `Written: /etc/pam.d/sshd`;
            }

            // Edit sshd_config
            if (file === '/etc/ssh/sshd_config') {
                const hasKbd = content.includes('KbdInteractiveAuthentication yes');
                const hasNoPass = content.includes('PasswordAuthentication no');
                if (hasKbd || hasNoPass) {
                    if (hasKbd) {
                        term.fs['/'].children.etc.children.ssh.children['sshd_config'].content =
                            term.fs['/'].children.etc.children.ssh.children['sshd_config'].content
                                .replace('KbdInteractiveAuthentication no', 'KbdInteractiveAuthentication yes');
                    }
                    if (hasNoPass) {
                        term.fs['/'].children.etc.children.ssh.children['sshd_config'].content =
                            term.fs['/'].children.etc.children.ssh.children['sshd_config'].content
                                .replace('PasswordAuthentication yes', 'PasswordAuthentication no');
                    }
                    engine.config._state.sshdUpdated = true;
                    return `Written: /etc/ssh/sshd_config`;
                }
                return `write: specify one or both of:\n  KbdInteractiveAuthentication yes\n  PasswordAuthentication no`;
            }

            // Remove rogue key from authorized_keys
            if (file === '/home/operator/.ssh/authorized_keys') {
                if (content.includes('ssh-ed25519') && !content.includes('intruder')) {
                    engine.config._state.rogueKeyRemoved = true;
                    term.fs['/'].children.home.children.operator.children['.ssh'].children['authorized_keys'].content =
                        'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOperatorKeyCell016GridAccess operator@grid-command\n';
                    return `Written: /home/operator/.ssh/authorized_keys`;
                }
                return `write: provide only the legitimate key to keep. Rogue key detected in current content.`;
            }

            return `write: ${file}: permission denied or file not recognized for simulation`;
        },

        // /opt/verify/test-2fa.sh -- awards Flag 1 when 2FA config is complete
        '/opt/verify/test-2fa.sh': function(args, term, engine) {
            const pamOK = engine.config._state.pamUpdated;
            const sshdOK = engine.config._state.sshdUpdated;
            const reloaded = engine.config._state.sshdReloaded;

            if (!pamOK) {
                return `[FAIL] pam_google_authenticator.so not found in /etc/pam.d/sshd\nAdd: auth required pam_google_authenticator.so`;
            }
            if (!sshdOK) {
                return `[FAIL] KbdInteractiveAuthentication not set to yes in sshd_config\nSet: KbdInteractiveAuthentication yes\nAlso set: PasswordAuthentication no`;
            }
            if (!reloaded) {
                return `[FAIL] sshd has not been reloaded since config changes.\nRun: sudo systemctl reload sshd`;
            }
            // All checks pass -- award Flag 1
            engine.awardFlag('flag1');
            return `[PASS] 2FA configuration verified.\n[PASS] pam_google_authenticator.so present in /etc/pam.d/sshd\n[PASS] KbdInteractiveAuthentication enabled in sshd_config\n[PASS] sshd reloaded with new configuration\n\nFLAG: FLAG{ala-l05-the-insider_flag1_2fa_configured}`;
        },

        // systemctl -- sshd management only for this lab
        'systemctl': function(args, term, engine) {
            const sub = args[0] || '';
            const rawUnit = args[1] || '';
            const unit = rawUnit.replace(/\.service$/, '');

            if (sub === 'status') {
                if (unit === 'sshd' || unit === 'ssh') {
                    return `\u25CF ssh.service - OpenBSD Secure Shell server\n     Loaded: loaded (/lib/systemd/system/ssh.service; enabled)\n     Active: active (running) since Thu 2026-04-10 08:01:00 UTC; 1h 0min ago\n   Main PID: 10201 (sshd)\n\nApr 10 08:01:00 cell-016 systemd[1]: Started OpenBSD Secure Shell server.`;
                }
            }

            if (sub === 'reload' || sub === 'restart') {
                if (unit === 'sshd' || unit === 'ssh') {
                    return `Failed to reload ssh.service: Access denied\nSee system logs and 'systemctl status ssh.service' for details.\nHint: use sudo`;
                }
            }

            return `systemctl: use sudo for service management: sudo systemctl reload sshd`;
        },

        // answer -- submit Flag 2 (breach investigation answers)
        'answer': function(args, term, engine) {
            const input = args.join(' ').toLowerCase();
            const hasIP = input.includes('203.0.113.77');
            const hasMethod = input.includes('password');

            if (hasIP && hasMethod) {
                engine.config._state.breachAnswered = true;
                engine.awardFlag('flag2');
                return `[CORRECT] Entry vector: 203.0.113.77 via password authentication.\nFLAG: FLAG{ala-l05-the-insider_flag2_entry_vector_identif}`;
            }
            if (hasIP && !hasMethod) {
                return `[PARTIAL] IP address correct. What authentication method was used? (hint: check the auth.log Accepted line)`;
            }
            if (!hasIP && hasMethod) {
                return `[PARTIAL] Method correct. What was the source IP address?`;
            }
            return `Usage: answer <ip-address> <auth-method>\nExample: answer 203.0.113.77 password\nHint: grep 'Accepted' /var/log/auth.log`;
        },

        // files-accessed -- submit Flag 3 (list of files accessed during breach)
        'files-accessed': function(args, term, engine) {
            const input = args.join(' ');
            const hasShadow = input.includes('/etc/shadow') || input.includes('shadow');
            const hasPasswd = input.includes('/tmp/.p') || (input.includes('/etc/passwd') && input.includes('/tmp'));
            const hasKeys = input.includes('.key') || input.includes('keys.txt') || input.includes('/home');

            if (hasShadow && hasPasswd && hasKeys) {
                engine.awardFlag('flag3');
                return `[CORRECT] All three accessed resources identified:\n  1. /etc/shadow (read via sudo)\n  2. /etc/passwd (copied to /tmp/.p via sudo)\n  3. /home/**/*.key files (enumerated via sudo find)\nFLAG: FLAG{ala-l05-the-insider_flag3_accessed_files_liste}`;
            }
            const missing = [];
            if (!hasShadow) missing.push('/etc/shadow');
            if (!hasPasswd) missing.push('/etc/passwd (copied to /tmp/.p)');
            if (!hasKeys) missing.push('.key file enumeration under /home');
            return `[INCOMPLETE] Missing from your list: ${missing.join(', ')}\nCheck /var/log/auth.log sudo entries and /root/.bash_history`;
        },

        // ping -- basic connectivity check
        'ping': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] <destination>';
            if (target === '127.0.0.1' || target === 'localhost') {
                return `PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.031 ms\n\n--- 127.0.0.1 ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss`;
            }
            return `PING ${target} (${target}) 56(84) bytes of data.\n64 bytes from ${target}: icmp_seq=1 ttl=64 time=1.1 ms\n\n--- ${target} ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss`;
        },

        // ls -- directory listing with awareness of authorized_keys state
        'ls': function(args, term, engine) {
            const longFlag = args.includes('-la') || args.includes('-l') || args.includes('-a') || args.includes('-al');
            const path = args.find(a => !a.startsWith('-')) || '.';

            if (path.includes('.ssh') || path === '/home/operator/.ssh') {
                const keys = engine.config._state.rogueKeyRemoved
                    ? (longFlag ? '-rw------- 1 operator operator  72 Apr 10 09:00 authorized_keys' : 'authorized_keys')
                    : (longFlag ? '-rw------- 1 operator operator 143 Apr 10 03:45 authorized_keys' : 'authorized_keys');
                const kh = longFlag ? '-rw-r--r-- 1 operator operator  62 Apr 10 06:01 known_hosts' : 'known_hosts';
                if (longFlag) {
                    return `total 16\ndrwx------ 2 operator operator 4096 Apr 10 09:00 .\ndrwxr-xr-x 5 operator operator 4096 Apr 10 08:01 ..\n${keys}\n${kh}`;
                }
                return `authorized_keys  known_hosts`;
            }

            // Delegate to BoxEngine default filesystem walker
            return null;
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        {
            id: 'flag1',
            value: 'FLAG{ala-l05-the-insider_flag1_2fa_configured}',
            label: '2FA Configured',
            description: 'PAM google-authenticator configured and sshd reloaded with KbdInteractiveAuthentication.',
            points: 300,
            autoCheck: true
        },
        {
            id: 'flag2',
            value: 'FLAG{ala-l05-the-insider_flag2_entry_vector_identif}',
            label: 'Entry Vector Identified',
            description: 'Correct source IP (203.0.113.77) and authentication method (password) submitted.',
            points: 200,
            autoCheck: true
        },
        {
            id: 'flag3',
            value: 'FLAG{ala-l05-the-insider_flag3_accessed_files_liste}',
            label: 'Accessed Files Listed',
            description: 'All three accessed resources identified: /etc/shadow, /etc/passwd copy, .key enumeration.',
            points: 200,
            autoCheck: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
        minScore: 0,
        maxScore: 700,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 1800000, points: 100 },
        timeBonusThreshold: 2700
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'grep \'Accepted\' /var/log/auth.log will show you when and how the attacker got in. Note the source IP and authentication method.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint2',
            text: 'Check authorized_keys -- the attacker added a persistence key. Compare cat /home/operator/.ssh/authorized_keys and identify anything that does not belong to grid-command.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'The sudo log entries in auth.log show every command run with elevated privileges. Also check /root/.bash_history for the full command list.',
            cost: 50,
            penalty: -50
        }
    ],

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'LPI-LPIC-1',
        mappings: [
            { flagId: 'flag1', objective: '110.3', description: 'Securing data with encryption', skill: 'PAM configuration and multi-factor authentication' },
            { flagId: 'flag2', objective: '110.1', description: 'Perform security administration tasks', skill: 'Auth log analysis and incident timeline reconstruction' },
            { flagId: 'flag3', objective: '108.2', description: 'System logging', skill: 'sudo audit trail analysis and file access forensics' }
        ]
    },

    resetState: function() {
        this._state = {
        rogueKeyRemoved: false,     // rogue key removed from authorized_keys
        pamUpdated: false,          // pam_google_authenticator.so added to /etc/pam.d/sshd
        sshdUpdated: false,         // KbdInteractiveAuthentication yes + PasswordAuthentication no
        sshdReloaded: false,        // systemctl reload sshd run after config changes
        breachAnswered: false       // Flag 2: student submitted correct IP + method
    };
    }


};


// Auto-reset state on script load (BOX-006 backfill 2026-05-23)
if (typeof ALAL05Config !== 'undefined') ALAL05Config.resetState();
