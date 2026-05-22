/* ============================================================
   PIS-L01: Specimen Classification
   Principles of Information Security -- CTF Lab
   Malware taxonomy: identify and classify 6 unknown specimens
   SY0-701: 2.3, 2.4
   ============================================================ */

const PISL01Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'Specimen Classification',
    subtitle: 'Hexworth Containment -- Intake Processing',
    description: 'Six unknown specimens arrived at the intake dock. Behavior reports are logged in the analysis queue. Examine each specimen, classify it by malware type, and file containment reports before the next BSL-2 transfer.',
    difficulty: 'Easy',
    estimatedTime: 30,
    accent: '#22c55e',
    storageKey: 'hexworth_lab_pis_l01',
    registryId: 'pis-l01-specimen-classification',
    trackerKey: 'lab_pis_l01',

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'HEXWORTH CONTAINMENT WORKSTATION v4.2.1',
            'Biosafety Analyst Terminal -- BSL-1 Clearance',
            'Initializing specimen analysis subsystem...',
            'Connecting to intake queue... OK',
            'Loading behavior report database... OK',
            'Taxonomy reference loaded: /etc/containment/taxonomy.db'
        ],
        grubEntries: [
            'Containment Analyst OS 22.04 LTS',
            'Containment Analyst OS (recovery mode)'
        ],
        loginUser: 'analyst'
    },

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'Six specimens arrived via the overnight transfer from Field Station 7. All are unclassified -- the field team did not have time to profile them before evacuation. Behavior telemetry was captured automatically and is waiting in the intake queue. You have 30 minutes before these specimens are moved to BSL-2 storage. Classification must be filed before transfer or they default to UNKNOWN and the entire bay goes on lockdown.',
        scenario: 'Each specimen has a behavior log. Read it carefully. Every specimen maps exactly to one malware family in the standard taxonomy: virus, worm, trojan, ransomware, rootkit, or RAT. Your job is to examine the behavior, determine the type, and file the containment report. Misclassification triggers a containment alert -- the system will tell you when you are wrong.',
        outro: 'All six specimens have been correctly classified and containment reports filed. BSL-2 transfer cleared. Good work, analyst. The taxonomy assignment ensures the right isolation protocols are applied. A misclassified specimen means the wrong countermeasures -- and something gets out.',

        goals: [
            'Distinguish the six classic malware families -- virus, worm, trojan, ransomware, rootkit, RAT -- from behavior telemetry alone',
            'Apply the trojan-vs-RAT discrimination: automated payload (trojan) vs live interactive remote control (RAT)',
            'Apply the virus-vs-worm discrimination: requires host-file execution (virus) vs autonomous network propagation (worm)',
            'Use a reference taxonomy (/etc/containment/taxonomy.db) to map observed indicators to family definitions',
            'File correct classifications under a 30-minute clock -- three flags unlock as paired classifications complete'
        ],

        toolkit: [
            { name: 'intake',   purpose: 'List the six specimens pending classification',                                            sample: 'intake' },
            { name: 'examine',  purpose: "Read a specimen's behavior report -- file artifacts, network artifacts, analyst notes",   sample: 'examine SPX-001' },
            { name: 'cat',      purpose: 'Read the taxonomy reference -- definitions and key indicators per family',                 sample: 'cat /etc/containment/taxonomy.db' },
            { name: 'classify', purpose: 'File a containment classification -- flags unlock as pairs are completed',                 sample: 'classify SPX-001 RAT' },
            { name: 'report',   purpose: 'Show classification progress across all six specimens',                                    sample: 'report' },
            { name: 'help',     purpose: 'Command reference',                                                                        sample: 'help' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'analyst',
        hostname: 'intake-ws-01',
        startDir: '/home/analyst',
        welcome: 'Hexworth Containment Analyst Workstation\nBSL-1 Clearance Active\n\n*** ALERT: 6 UNCLASSIFIED SPECIMENS IN INTAKE QUEUE ***\n*** Classification required before BSL-2 transfer ***\n*** Estimated transfer window: 30 minutes ***\n\nType "intake" to list pending specimens.\nType "help" for command reference.\n'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    // Glyph icons match the existing convention in this file (4 pre-existing
    // icons below). Lab config.js files are a known EduScan emoji-validator
    // coverage gap (validator scans `components`, `config`, `utils`, etc., not
    // `houses/`). Decision recorded in _docs/operations/pis-briefing-resummon-2026-05-09.md.
    desktop: {
        icons: [
            { id: 'briefing', label: 'Briefing',    icon: '\uD83D\uDCCB',    app: 'briefing' },
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD',    app: 'notes'    },
            { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1',    app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9',    app: 'flags'    }
        ]
    },

    // Custom desktop-icon dispatch \u2014 invoked by BoxEngine's `default:` extension
    // hook (BoxEngine.js:1110-1115) for any icon whose `app` is not built-in.
    // `this` binds to the config object via `this.config.onAppLaunch(...)` call site.
    onAppLaunch: function(iconDef, engine) {
        if (iconDef && iconDef.app === 'briefing') {
            // Re-summon \u2014 bypass skip-next-time storage; lab is already running
            // so the launch callback is a no-op.
            BriefingPage.show(this, function() {}, { force: true });
        }
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
                        'analyst': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: 'SPECIMEN INTAKE NOTES\n=====================\nAll 6 arrived in the overnight batch from Field Station 7.\nBehavior logs were captured by automated telemetry.\n\nMalware taxonomy (from /etc/containment/taxonomy.db):\n  virus      -- Attaches to host files, spreads on execution\n  worm       -- Self-replicates across networks without host file\n  trojan     -- Disguised as legitimate software, opens backdoor\n  ransomware -- Encrypts files, demands payment for decryption key\n  rootkit    -- Hides presence, grants persistent elevated access\n  RAT        -- Remote access trojan, command-and-control channel\n\nCommands:\n  intake               -- list all specimens in queue\n  examine <id>         -- read behavior report for a specimen\n  classify <id> <type> -- file containment classification\n  report               -- show classification status\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'intake\nexamine SPX-001\nexamine SPX-002\n'
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'containment': {
                            type: 'dir',
                            children: {
                                'taxonomy.db': {
                                    type: 'file',
                                    content: 'HEXWORTH CONTAINMENT -- PATHOGEN TAXONOMY v3.1\n\nvirus\n  Definition: Attaches executable code to legitimate host files.\n  Requires: host execution to propagate\n  Key indicators: file size inflation, modified timestamps on executables, PE header injection\n  Containment: isolate host, rebuild from clean image\n\nworm\n  Definition: Self-replicating contagion. No host file required.\n  Requires: network access\n  Key indicators: mass network scan activity, replication to network shares, auto-spreading without user action\n  Containment: network isolation, VLAN segmentation, patch vulnerability exploited\n\ntrojan\n  Definition: Disguised as legitimate software. Hidden payload.\n  Requires: user execution\n  Key indicators: unexpected outbound connections after install, process spawning from app dir, credential harvest\n  Containment: remove application, credential rotation\n\nransomware\n  Definition: Encrypts target files, demands payment.\n  Requires: write access to target filesystem\n  Key indicators: mass file rename (e.g., .locked extension), ransom note dropped, shadow copies deleted\n  Containment: offline backup restore, key recovery if available\n\nrootkit\n  Definition: Hides attacker presence. Grants persistent elevated access.\n  Requires: kernel or boot-level access\n  Key indicators: hidden processes, discrepancy between ps and /proc, modified system binaries, boot sector changes\n  Containment: offline analysis, clean OS reinstall\n\nRAT\n  Definition: Remote Access Trojan. Persistent C2 channel.\n  Requires: outbound internet access\n  Key indicators: beacon traffic to C2 server, remote command execution, keylogging, screenshot capture\n  Containment: C2 blocking, endpoint isolation, credential rotation\n'
                                }
                            }
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    children: {
                        'intake': {
                            type: 'dir',
                            children: {
                                'SPX-001': {
                                    type: 'dir',
                                    children: {
                                        'behavior.log': {
                                            type: 'file',
                                            content: 'SPECIMEN BEHAVIOR REPORT\nID: SPX-001\nCapture Date: 2026-04-09T02:14:00Z\nCapture Source: Field Station 7 -- Endpoint FS7-WS-04\n\nBEHAVIOR OBSERVATIONS:\n  [02:14:01] Process launched from email attachment: "invoice_Q1.exe"\n  [02:14:03] Spawned child process: cmd.exe\n  [02:14:04] Outbound TCP connection established: 185.220.101.47:4444\n  [02:14:05] Keylogger module loaded into memory\n  [02:14:07] Periodic beacon traffic: 185.220.101.47:4444 every 60s\n  [02:14:09] Screenshot captured, exfiltrated to C2\n  [02:14:12] Remote shell session opened by external operator\n  [02:14:20] Downloaded secondary payload from C2\n\nFILE ARTIFACTS:\n  invoice_Q1.exe (1.2 MB, signed with expired cert)\n  %APPDATA%\\svchost32.exe (persistence mechanism)\n  %TEMP%\\ks_log.dat (keylog buffer)\n\nNETWORK ARTIFACTS:\n  185.220.101.47:4444 (C2 server, TOR exit node)\n  Beacon interval: 60 seconds\n\nANALYST NOTES:\n  Operator manually issued commands after initial infection.\n  Persistent, interactive remote control observed.\n'
                                        }
                                    }
                                },
                                'SPX-002': {
                                    type: 'dir',
                                    children: {
                                        'behavior.log': {
                                            type: 'file',
                                            content: 'SPECIMEN BEHAVIOR REPORT\nID: SPX-002\nCapture Date: 2026-04-09T03:45:00Z\nCapture Source: Field Station 7 -- Network Monitor\n\nBEHAVIOR OBSERVATIONS:\n  [03:45:01] Process origin: email attachment "resume_2026.pdf.exe"\n  [03:45:04] Modified 14 legitimate executable files in C:\\Windows\\System32\\\n  [03:45:05] Injected malicious code into explorer.exe header\n  [03:45:06] On execution of any modified .exe: replicates to that file\n  [03:45:08] Does NOT spread over network independently\n  [03:45:10] Payload activates: data corruption routine on Fridays\n  [03:45:11] Each infected file grows by approximately 4 KB\n\nFILE ARTIFACTS:\n  14 modified executables in System32\n  Each infected file has identical 4KB appended payload\n  File modification timestamps altered\n\nNETWORK ARTIFACTS:\n  No outbound network connections observed\n  No scanning activity\n\nANALYST NOTES:\n  Spreads only when infected executables are run.\n  Requires host file execution to propagate. No autonomous network movement.\n'
                                        }
                                    }
                                },
                                'SPX-003': {
                                    type: 'dir',
                                    children: {
                                        'behavior.log': {
                                            type: 'file',
                                            content: 'SPECIMEN BEHAVIOR REPORT\nID: SPX-003\nCapture Date: 2026-04-09T07:22:00Z\nCapture Source: Field Station 7 -- File Server FS7-NAS-01\n\nBEHAVIOR OBSERVATIONS:\n  [07:22:01] First seen on endpoint FS7-WS-09 after USB insertion\n  [07:22:03] Immediately began scanning subnet 192.168.7.0/24\n  [07:22:04] Exploited SMB vulnerability (CVE-2017-0144) on 12 hosts\n  [07:22:05] Copied itself to all 12 vulnerable hosts\n  [07:22:06] Began scanning from each newly infected host\n  [07:22:09] Spread to adjacent subnet 192.168.8.0/24\n  [07:22:12] No user interaction required on remote hosts\n  [07:22:15] Did NOT attach to existing files\n\nFILE ARTIFACTS:\n  Dropped standalone executable on each host\n  No host-file infection observed\n\nNETWORK ARTIFACTS:\n  Massive TCP/445 sweep from all infected hosts\n  Exponential host count: 1 -> 12 -> 144 within 30 minutes\n\nANALYST NOTES:\n  Self-replicating contagion. Exploits network vulnerability directly.\n  No human interaction required on target machines.\n'
                                        }
                                    }
                                },
                                'SPX-004': {
                                    type: 'dir',
                                    children: {
                                        'behavior.log': {
                                            type: 'file',
                                            content: 'SPECIMEN BEHAVIOR REPORT\nID: SPX-004\nCapture Date: 2026-04-09T09:15:00Z\nCapture Source: Field Station 7 -- Endpoint FS7-WS-11\n\nBEHAVIOR OBSERVATIONS:\n  [09:15:01] Installed as "FastPDF Converter Pro" -- user-initiated install\n  [09:15:05] PDF conversion functionality works as advertised\n  [09:15:06] In background: scanned for browser credential stores\n  [09:15:08] Extracted passwords from Chrome, Firefox profiles\n  [09:15:09] Established outbound connection to 91.108.4.123\n  [09:15:10] Exfiltrated credential dump, screenshots\n  [09:15:12] No keyboard/mouse control by remote operator\n  [09:15:15] Continues running silently in background\n\nFILE ARTIFACTS:\n  FastPDFConverter.exe (legitimate-looking installer)\n  %APPDATA%\\pdf_svc.exe (persistent background process)\n  %TEMP%\\creds_dump.bin (credential cache)\n\nNETWORK ARTIFACTS:\n  Single exfil connection to 91.108.4.123:443\n  No interactive sessions observed\n\nANALYST NOTES:\n  Disguised as useful software. Hidden malicious payload.\n  No remote operator interaction. Automated credential theft.\n  This is NOT interactive remote control -- no live operator commands.\n'
                                        }
                                    }
                                },
                                'SPX-005': {
                                    type: 'dir',
                                    children: {
                                        'behavior.log': {
                                            type: 'file',
                                            content: 'SPECIMEN BEHAVIOR REPORT\nID: SPX-005\nCapture Date: 2026-04-09T11:30:00Z\nCapture Source: Field Station 7 -- Endpoint FS7-WS-03\n\nBEHAVIOR OBSERVATIONS:\n  [11:30:01] Executed via phishing link -- user clicked\n  [11:30:03] Began enumerating local filesystem\n  [11:30:04] Identified target extensions: .docx .xlsx .pdf .jpg .pst\n  [11:30:05] Deleted all Volume Shadow Copies (VSS)\n  [11:30:06] Began encrypting files: renamed to .hexlock extension\n  [11:30:09] 14,882 files encrypted within 4 minutes\n  [11:30:10] Dropped RANSOM_NOTE.txt on Desktop and all directories\n  [11:30:11] Established connection to Bitcoin address monitoring service\n  [11:30:12] Displayed ransom demand: 2.5 BTC within 72 hours\n\nFILE ARTIFACTS:\n  RANSOM_NOTE.txt (in every directory)\n  14,882 files renamed with .hexlock extension\n  No backup copies remain (VSS wiped)\n\nNETWORK ARTIFACTS:\n  Bitcoin payment monitor: blockchain.info API calls\n  No data exfiltration observed (encrypt-only variant)\n\nANALYST NOTES:\n  Classic encrypt-and-demand pattern. VSS deletion prevents backup recovery.\n  Files are unrecoverable without the decryption key.\n'
                                        }
                                    }
                                },
                                'SPX-006': {
                                    type: 'dir',
                                    children: {
                                        'behavior.log': {
                                            type: 'file',
                                            content: 'SPECIMEN BEHAVIOR REPORT\nID: SPX-006\nCapture Date: 2026-04-09T14:55:00Z\nCapture Source: Field Station 7 -- Server FS7-SRV-02\n\nBEHAVIOR OBSERVATIONS:\n  [14:55:01] Loaded via kernel exploit (CVE-2024-1086)\n  [14:55:03] Installed as kernel module: /lib/modules/5.15/extra/snd_ctrl.ko\n  [14:55:04] Hooked sys_getdents64 -- hides own files from ls, find\n  [14:55:05] Hooked sys_kill -- hides own processes from ps, top\n  [14:55:06] Modified /proc entries to remove own PID\n  [14:55:08] Patched login binary: accepts hardcoded backdoor password\n  [14:55:09] Discrepancy detected: 23 processes in /proc, only 19 shown by ps\n  [14:55:11] System binaries ls, ps, netstat replaced with tampered versions\n\nFILE ARTIFACTS:\n  /lib/modules/5.15/extra/snd_ctrl.ko (kernel module)\n  Modified: /bin/ls, /bin/ps, /bin/netstat\n  Patched: /bin/login\n\nNETWORK ARTIFACTS:\n  No network activity detected by netstat (but hook may hide it)\n  Honeypot sensor detected TCP/443 outbound not shown in netstat\n\nANALYST NOTES:\n  Kernel-level. Cannot trust standard analysis tools on infected host.\n  Process count discrepancy is the giveaway. Must analyze offline.\n'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // INTERNAL STATE
    // ═══════════════════════════════════════════════════════

    // Track classifications filed for each specimen
    _classifications: {
        'SPX-001': null,
        'SPX-002': null,
        'SPX-003': null,
        'SPX-004': null,
        'SPX-005': null,
        'SPX-006': null
    },

    // Ground truth answers
    _answers: {
        'SPX-001': 'rat',
        'SPX-002': 'virus',
        'SPX-003': 'worm',
        'SPX-004': 'trojan',
        'SPX-005': 'ransomware',
        'SPX-006': 'rootkit'
    },

    // Valid taxonomy types accepted by the classify command
    _validTypes: ['virus', 'worm', 'trojan', 'ransomware', 'rootkit', 'rat'],

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {

        // intake -- list all specimens with current classification status
        'intake': function(args, term, engine) {
            const c = engine.config._classifications;
            const fmt = (id) => {
                const status = c[id] ? `[CLASSIFIED: ${c[id].toUpperCase()}]` : '[UNCLASSIFIED]';
                return `  ${id}  ${status}`;
            };
            return `INTAKE QUEUE -- Field Station 7 Batch\n${'='.repeat(45)}\n${fmt('SPX-001')}\n${fmt('SPX-002')}\n${fmt('SPX-003')}\n${fmt('SPX-004')}\n${fmt('SPX-005')}\n${fmt('SPX-006')}\n\nUse: examine <id> to read behavior report\nUse: classify <id> <type> to file report`;
        },

        // examine <specimen-id> -- read behavior log
        'examine': function(args, term, engine) {
            const id = (args[0] || '').toUpperCase();
            if (!id) return 'Usage: examine <specimen-id>\nExample: examine SPX-001';

            const validIds = ['SPX-001', 'SPX-002', 'SPX-003', 'SPX-004', 'SPX-005', 'SPX-006'];
            if (!validIds.includes(id)) {
                return `Error: Specimen ${id} not found in intake queue.\nValid IDs: SPX-001 through SPX-006`;
            }

            // Read behavior log from filesystem
            const logPath = term.fs['/'].children.var.children.intake.children[id].children['behavior.log'];
            return logPath.content;
        },

        // classify <specimen-id> <type> -- file containment classification
        'classify': function(args, term, engine) {
            const id = (args[0] || '').toUpperCase();
            const type = (args[1] || '').toLowerCase();

            if (!id || !type) {
                return 'Usage: classify <specimen-id> <type>\nTypes: virus, worm, trojan, ransomware, rootkit, RAT\nExample: classify SPX-001 RAT';
            }

            const validIds = ['SPX-001', 'SPX-002', 'SPX-003', 'SPX-004', 'SPX-005', 'SPX-006'];
            if (!validIds.includes(id)) {
                return `Error: Specimen ${id} not found in intake queue.`;
            }

            if (!engine.config._validTypes.includes(type)) {
                return `Error: "${type}" is not a recognized pathogen type.\nValid types: virus, worm, trojan, ransomware, rootkit, RAT`;
            }

            const correct = engine.config._answers[id];
            if (type !== correct) {
                return `CLASSIFICATION REJECTED -- ${id}\nSubmitted: ${type.toUpperCase()}\nStatus: MISMATCH -- behavior indicators do not support this classification.\nReview the behavior log: examine ${id}\nHint: pay attention to propagation method, persistence mechanism, and network behavior.`;
            }

            // Correct classification
            engine.config._classifications[id] = type;

            let output = `CLASSIFICATION ACCEPTED -- ${id}\nType: ${type.toUpperCase()}\nStatus: FILED -- containment protocol assigned\n`;

            // Check flag conditions after classification
            const filed = Object.values(engine.config._classifications).filter(v => v !== null).length;

            // Flag 1: SPX-001 and SPX-002 both correctly classified
            if (engine.config._classifications['SPX-001'] && engine.config._classifications['SPX-002'] && !engine.config._flag1Awarded) {
                engine.config._flag1Awarded = true;
                engine.awardFlag('flag1');
                output += '\n[CONTAINMENT MILESTONE] Specimens 1 and 2 classified. Flag unlocked.';
            }

            // Flag 2: SPX-003 and SPX-004 both correctly classified
            if (engine.config._classifications['SPX-003'] && engine.config._classifications['SPX-004'] && !engine.config._flag2Awarded) {
                engine.config._flag2Awarded = true;
                engine.awardFlag('flag2');
                output += '\n[CONTAINMENT MILESTONE] Specimens 3 and 4 classified. Flag unlocked.';
            }

            // Flag 3: SPX-005 and SPX-006 both correctly classified
            if (engine.config._classifications['SPX-005'] && engine.config._classifications['SPX-006'] && !engine.config._flag3Awarded) {
                engine.config._flag3Awarded = true;
                engine.awardFlag('flag3');
                output += '\n[CONTAINMENT MILESTONE] Specimens 5 and 6 classified. Full intake clearance granted.';
            }

            return output;
        },

        // report -- display current classification progress
        'report': function(args, term, engine) {
            const c = engine.config._classifications;
            const total = Object.keys(c).length;
            const done = Object.values(c).filter(v => v !== null).length;

            let lines = [
                'INTAKE CLASSIFICATION REPORT',
                '='.repeat(40),
                `Progress: ${done}/${total} specimens classified`,
                ''
            ];

            for (const [id, classification] of Object.entries(c)) {
                const status = classification
                    ? `FILED -- ${classification.toUpperCase()}`
                    : 'PENDING';
                lines.push(`  ${id}  ${status}`);
            }

            lines.push('');
            if (done < total) {
                lines.push(`Remaining: ${total - done} specimen(s) require classification.`);
                lines.push('BSL-2 transfer is BLOCKED until all specimens are classified.');
            } else {
                lines.push('All specimens classified. BSL-2 transfer CLEARED.');
            }

            return lines.join('\n');
        },

        // help -- command reference
        'help': function(args, term, engine) {
            return 'ANALYST WORKSTATION -- COMMAND REFERENCE\n\n  intake               List all specimens in intake queue\n  examine <id>         Read behavior report for a specimen\n  classify <id> <type> File containment classification\n  report               Show classification progress\n  cat <file>           Read a file\n  ls <path>            List directory contents\n\nSpecimen IDs: SPX-001 through SPX-006\nClassification types: virus, worm, trojan, ransomware, rootkit, RAT';
        }
    },

    // Flag state tracking
    _flag1Awarded: false,
    _flag2Awarded: false,
    _flag3Awarded: false,

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        {
            id: 'flag1',
            value: 'FLAG{pis-l01-specimen-classification_flag1_specimens_1-2_classi}',
            label: 'Specimens 1-2 Classified',
            description: 'Correctly classified SPX-001 (RAT) and SPX-002 (virus).',
            points: 250,
            autoCheck: true
        },
        {
            id: 'flag2',
            value: 'FLAG{pis-l01-specimen-classification_flag2_specimens_3-4_classi}',
            label: 'Specimens 3-4 Classified',
            description: 'Correctly classified SPX-003 (worm) and SPX-004 (trojan).',
            points: 250,
            autoCheck: true
        },
        {
            id: 'flag3',
            value: 'FLAG{pis-l01-specimen-classification_flag3_specimens_5-6_classi}',
            label: 'Specimens 5-6 Classified',
            description: 'Correctly classified SPX-005 (ransomware) and SPX-006 (rootkit).',
            points: 250,
            autoCheck: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
        minScore: 0,
        maxScore: 750,
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
            text: 'Focus on the propagation method. A worm spreads autonomously over the network. A virus requires a host file to execute. They never need a user to do anything on the remote machine -- vs. a trojan, which needs the user to run it.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint2',
            text: 'The key difference between a trojan and a RAT: a trojan performs automated tasks (credential theft, exfil) but does not give an attacker a live interactive shell. A RAT gives the attacker real-time remote control -- look for "remote operator" or "interactive session" in the behavior log.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'A rootkit hides at the kernel level. The giveaway is a discrepancy between what the system reports and what actually exists -- more processes in /proc than ps shows, modified system binaries, hooked syscalls. Ransomware is simpler: look for mass file encryption and a ransom note.',
            cost: 50,
            penalty: -50
        }
    ],

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'CompTIA Security+ SY0-701',
        mappings: [
            { flagId: 'flag1', objective: '2.4', description: 'Analyze indicators of malicious activity', skill: 'RAT identification via C2 beacon and interactive shell indicators; virus identification via host-file infection pattern' },
            { flagId: 'flag2', objective: '2.3', description: 'Compare and contrast vulnerability types', skill: 'Worm identification via autonomous network propagation; trojan identification via disguised legitimate software' },
            { flagId: 'flag3', objective: '2.4', description: 'Analyze indicators of malicious activity', skill: 'Ransomware identification via file encryption and ransom note; rootkit identification via kernel-level hiding and syscall hooking' }
        ]
    }

};
