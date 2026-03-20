/* ============================================================
   CTF ARENA — Box Forensics-01: The Deleted Evidence
   Disk Forensics | File Recovery & Slack Space
   Config: filesystem, disk image, flags, hints, lore
   ============================================================ */

const Forensics01Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Deleted Evidence',
    subtitle: 'Disk Forensics — File Recovery & Slack Space',
    difficulty: 'Intermediate',
    accent: '#0ea5e9',
    storageKey: 'hexworth_ctf_forensics01',
    registryId: 'forensics-01-disk-image',
    trackerKey: 'ctf_forensics01',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Image Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Examine the disk image structure. Identify partitions and filesystem type.',
            requiredFlags: [],
            mitre: ['T1005', 'T1083'],
            unlocks: ['recovery'],
            locked: false
        },
        {
            id: 'recovery',
            name: 'File Recovery',
            icon: '\uD83D\uDCC2',
            description: 'Recover deleted files from the disk image using forensic tools.',
            requiredFlags: [],
            mitre: ['T1005', 'T1039'],
            unlocks: ['analysis'],
            locked: true
        },
        {
            id: 'analysis',
            name: 'Slack Space Analysis',
            icon: '\uD83D\uDC89',
            description: 'Examine file slack space and unallocated clusters for hidden data.',
            requiredFlags: ['user'],
            mitre: ['T1564.004', 'T1027'],
            unlocks: ['reporting'],
            locked: true
        },
        {
            id: 'reporting',
            name: 'Evidence Reporting',
            icon: '\uD83D\uDCCB',
            description: 'Compile findings. Document the chain of custody and recovered evidence.',
            requiredFlags: ['root'],
            mitre: ['T1005', 'T1565.001'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // TUTORIAL MODE (Sprint AR-12)
    // ═══════════════════════════════════════════════════════

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Examine the disk image layout',
                tip: 'Open the Terminal and run: mmls /evidence/suspect_drive.dd',
                trigger: { event: 'command', match: { cmd: 'contains:mmls' } }
            },
            {
                title: 'List filesystem details',
                tip: 'Run fsstat to see the filesystem metadata and identify partition offsets.',
                trigger: { event: 'command', match: { cmd: 'contains:fsstat' } }
            },
            {
                title: 'List deleted files',
                tip: 'Use fls to list files including deleted entries: fls -rd -o 2048 /evidence/suspect_drive.dd',
                trigger: { event: 'command', match: { cmd: 'contains:fls' } }
            },
            {
                title: 'Recover the deleted document',
                tip: 'Use icat to recover the deleted file by inode number, or use foremost for automatic carving.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Find hidden data in slack space',
                tip: 'Use strings and xxd to examine raw disk sectors. Look for data hidden between file boundaries.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '4.4', description: 'Given an incident, apply mitigation techniques or controls — Digital forensics: file recovery', skill: 'Deleted File Recovery' },
            { flagId: 'user', objective: '2.3', description: 'Given a scenario, analyze application vulnerabilities — Data remnants', skill: 'Disk Image Analysis' },
            { flagId: 'root', objective: '4.4', description: 'Given an incident, apply mitigation techniques or controls — Digital forensics: slack space analysis', skill: 'Slack Space Forensics' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators — Data hiding techniques', skill: 'Anti-Forensics Detection' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'SIFT Workstation BIOS v3.8.2',
            'Initializing forensic environment...',
            'Memory Test: 16384 MB OK',
            'Detecting drives... /dev/sda1 (512GB SSD)',
            'Write-blocker status: ACTIVE',
            'Evidence drive: /dev/sdb (READ-ONLY)',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Ubuntu SIFT Workstation',
            'Ubuntu SIFT (recovery mode)',
            'Advanced options for SIFT'
        ],
        loginUser: 'investigator'
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
        user: 'investigator',
        hostname: 'sift-workstation',
        startDir: '/home/investigator',
        welcome: 'SIFT Workstation 6.1 — Digital Forensics Environment\n\nType \'help\' for available commands.\nEvidence image: /evidence/suspect_drive.dd\nWrite-blocker: ACTIVE (read-only)\n'
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED DISK IMAGE DATA
    // ═══════════════════════════════════════════════════════

    _diskImage: {
        filename: 'suspect_drive.dd',
        size: '2147483648',
        md5: 'a3f2b8c1d4e5f6a7b8c9d0e1f2a3b4c5',
        sha256: '7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8',
        partitions: [
            { start: 0, end: 2047, type: 'Primary Table (#0)', desc: 'MBR' },
            { start: 2048, end: 4194303, type: 'NTFS (0x07)', desc: 'Windows NTFS Volume' }
        ],
        fsInfo: {
            type: 'NTFS',
            clusterSize: 4096,
            totalClusters: 524032,
            freeClusters: 312448,
            volume: 'EVIDENCE_VOL',
            serial: '8A3B-C4D5'
        },
        deletedFiles: [
            { inode: 38, name: 'financial_records_Q4.xlsx', size: 24576, deleted: true },
            { inode: 42, name: 'meeting_notes_dec15.docx', size: 18432, deleted: true },
            { inode: 47, name: 'termination_letter.pdf', size: 32768, deleted: true },
            { inode: 51, name: 'offshore_accounts.csv', size: 8192, deleted: true },
            { inode: 55, name: 'shredder_log.txt', size: 4096, deleted: true }
        ],
        activeFiles: [
            { inode: 12, name: 'company_policy.pdf', size: 45056 },
            { inode: 15, name: 'employee_handbook.pdf', size: 67584 },
            { inode: 18, name: 'vacation_calendar.xlsx', size: 12288 },
            { inode: 22, name: 'desktop.ini', size: 512 },
            { inode: 25, name: 'budget_2024.xlsx', size: 36864 }
        ],
        slackData: {
            sector: 847392,
            hiddenContent: '--- ENCRYPTED TRANSFER LOG ---\nDate: 2024-12-14 03:42:17 UTC\nAccount: CH-4827-VORTEX\nAmount: $2,450,000.00\nDestination: Cayman National Bank\nRef: WIRE-X7742-GHOST\nAuth: {{FLAG:root}}\n--- END LOG ---',
            description: 'Hidden in slack space of cluster 847392, between file boundary of budget_2024.xlsx'
        }
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', points: 100 },
        { id: 'root', points: 200 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
        maxScore: 500,
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
            text: 'Start by examining the partition layout with mmls. The NTFS partition starts at sector 2048. Use that as your offset for other Sleuth Kit tools.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Use fls with the -rd flags to list deleted files recursively. The -o flag specifies the partition offset: fls -rd -o 2048 /evidence/suspect_drive.dd',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The offshore_accounts.csv (inode 51) contains the user flag. Recover it with: icat -o 2048 /evidence/suspect_drive.dd 51',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'The root flag is hidden in slack space near sector 847392. Use xxd to examine raw bytes: xxd -s 847392 /evidence/suspect_drive.dd | head -50. Or try strings on unallocated space.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'A corporate whistleblower reported suspicious financial activity at Vortex Industries. Before the internal investigation team arrived, the CFO was seen "cleaning up" their workstation. The IT department pulled the drive and created a forensic image before it could be wiped. Your mission: recover the deleted evidence and find proof of the offshore transfers.',
        scenario: 'Marcus Hale, CFO of Vortex Industries, panicked when he learned about the upcoming audit. He spent 20 minutes at his desk deleting files and running a disk cleanup utility. But he forgot one critical detail: deleted files are never truly gone until overwritten. The disk image was captured 47 minutes after the deletion attempt.',
        outro: 'The deleted evidence has been recovered. The offshore account records and hidden transfer logs prove the embezzlement scheme. Marcus Hale\'s attempt to destroy evidence only added obstruction charges to his indictment. The slack space data sealed the case.',
        ecer: {
            executive: 'CFO authorized the deletion of financial records during an active investigation',
            culture: 'No data retention policy enforced, employees had admin access to delete corporate records',
            employee: 'CFO attempted to destroy evidence using consumer-grade deletion tools instead of secure wiping',
            regulatory: 'No legal hold procedures in place, no automated backup verification for financial records'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Evidence Tracker
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://localhost:8080/evidence/',

        pages: {
            '/evidence/': {
                title: 'SIFT Evidence Tracker',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#0ea5e9; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;">SIFT Evidence Tracker</h1>
                        <div style="color:#888; font-size:0.8rem;">Case #2024-DF-4471 &mdash; Vortex Industries Financial Investigation</div>
                    </div>

                    <div style="max-width:700px; margin:0 auto;">
                        <div style="color:#888; font-size:0.7rem; letter-spacing:0.1em; margin-bottom:8px;">CASE SUMMARY</div>
                        <table style="width:100%; border-collapse:collapse; font-size:0.8rem;">
                            <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#0ea5e9; font-weight:bold;">Subject</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">Marcus Hale, CFO</td></tr>
                            <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#0ea5e9; font-weight:bold;">Evidence</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">suspect_drive.dd (2 GB disk image)</td></tr>
                            <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#0ea5e9; font-weight:bold;">MD5</td><td style="padding:6px 10px; border-bottom:1px solid #eee; font-family:monospace;">a3f2b8c1d4e5f6a7b8c9d0e1f2a3b4c5</td></tr>
                            <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#0ea5e9; font-weight:bold;">Status</td><td style="padding:6px 10px; border-bottom:1px solid #eee;">Analysis In Progress</td></tr>
                            <tr><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#0ea5e9; font-weight:bold;">Write-blocker</td><td style="padding:6px 10px; border-bottom:1px solid #eee; color:#2ecc71;">ACTIVE</td></tr>
                        </table>

                        <div style="margin-top:20px; padding:12px; background:rgba(14,165,233,0.06); border:1px solid rgba(14,165,233,0.2); border-radius:4px; font-size:0.78rem; color:#666;">
                            <strong style="color:#0ea5e9;">Objective:</strong> Recover deleted files from the suspect drive image and examine slack space for hidden evidence. Use Sleuth Kit tools (mmls, fls, icat, fsstat) and file carving utilities (foremost, scalpel) to extract evidence.
                        </div>
                    </div>
                `
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (investigator workstation)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'investigator': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== CASE BRIEFING ===\nCase: #2024-DF-4471\nSubject: Marcus Hale, CFO, Vortex Industries\nEvidence: /evidence/suspect_drive.dd\n\nAnalysis steps:\n1. mmls to examine partition layout\n2. fsstat to get filesystem details\n3. fls -rd to list deleted files\n4. icat to recover files by inode\n5. foremost/scalpel for file carving\n6. strings/xxd to examine slack space\n\nBoth flags are on the evidence drive.\nUser flag: in a recovered deleted file\nRoot flag: hidden in slack space\n\nGood luck, investigator.'
                                },
                                'tools': {
                                    type: 'dir',
                                    children: {
                                        'carving.conf': {
                                            type: 'file',
                                            content: '# Foremost configuration\n# File types to carve:\npdf    y    25000000    \\x25\\x50\\x44\\x46    \\x25\\x25\\x45\\x4f\\x46\ndoc    y    12500000    \\xd0\\xcf\\x11\\xe0\nxls    y    12500000    \\xd0\\xcf\\x11\\xe0\njpg    y    20000000    \\xff\\xd8\\xff\ncsv    y     5000000    \nzip    y    10000000    PK\\x03\\x04'
                                        }
                                    }
                                },
                                'output': {
                                    type: 'dir',
                                    children: {}
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'md5sum /evidence/suspect_drive.dd\nmmls /evidence/suspect_drive.dd\nfsstat -o 2048 /evidence/suspect_drive.dd'
                                }
                            }
                        }
                    }
                },
                'evidence': {
                    type: 'dir',
                    children: {
                        'suspect_drive.dd': {
                            type: 'file',
                            content: '[RAW DISK IMAGE — 2,147,483,648 bytes — Use forensic tools to analyze]'
                        },
                        'chain_of_custody.txt': {
                            type: 'file',
                            content: 'CHAIN OF CUSTODY LOG\n====================\nCase: #2024-DF-4471\nEvidence: Western Digital 2TB HDD (S/N: WD-4827VORTEX)\n\n2024-12-14 04:30 — Drive seized by IT Security (J. Torres)\n2024-12-14 04:45 — Write-blocker attached (Tableau T35u)\n2024-12-14 05:02 — Imaging started (dd, bs=4096)\n2024-12-14 06:18 — Imaging complete. MD5 verified.\n2024-12-14 06:20 — Original drive sealed in evidence bag #DF-4471-A\n2024-12-14 06:25 — Image transferred to SIFT workstation\n\nMD5: a3f2b8c1d4e5f6a7b8c9d0e1f2a3b4c5\nSHA256: 7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8'
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
                                    children: {}
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
                            content: 'sift-workstation'
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
    // TERMINAL COMMANDS (box-specific forensic tools)
    // ═══════════════════════════════════════════════════════

    commands: {
        'mmls': function(args, term, engine) {
            if (args.length === 0) return 'Usage: mmls [-t type] [-o offset] image_file\nDisplay the partition layout of a volume system.';
            const img = args.find(a => !a.startsWith('-')) || '';
            if (!img.includes('suspect_drive')) return `mmls: Cannot open ${img}: No such file or directory`;
            const di = Forensics01Config._diskImage;
            let output = `DOS Partition Table\nOffset Sector: 0\nUnits are in 512-byte sectors\n\n`;
            output += `      Slot      Start        End          Length       Description\n`;
            output += `000:  Meta      0000000000   0000000000   0000000001   Primary Table (#0)\n`;
            output += `001:  -------   0000000000   0000002047   0000002048   Unallocated\n`;
            output += `002:  000:000   0000002048   0004194303   0004192256   NTFS / exFAT (0x07)\n`;
            return output;
        },

        'fsstat': function(args, term, engine) {
            if (args.length === 0) return 'Usage: fsstat [-f fstype] [-o offset] image_file';
            const hasOffset = args.includes('-o');
            const img = args.find(a => !a.startsWith('-') && !args[args.indexOf(a) - 1]?.startsWith('-o')) || args[args.length - 1];
            if (!img || !img.includes('suspect_drive')) return `fsstat: Cannot open image`;
            const fs = Forensics01Config._diskImage.fsInfo;
            return `FILE SYSTEM INFORMATION\n--------------------------------------------\nFile System Type: ${fs.type}\n\nVolume Serial Number: ${fs.serial}\nVolume Name: ${fs.volume}\n\nVersion: NTFS 3.1\n\nSECTOR INFORMATION\n--------------------------------------------\nSector Size: 512\nTotal Sectors: ${fs.totalClusters * 8}\n\nCLUSTER INFORMATION\n--------------------------------------------\nCluster Size: ${fs.clusterSize}\nTotal Clusters: ${fs.totalClusters}\nFree Clusters: ${fs.freeClusters}\n\nMFT INFORMATION\n--------------------------------------------\nFirst MFT Entry: 0\nFirst MFT Data Cluster: 4\nMFT Zone Start Cluster: 1\nMFT Zone End Cluster: 16384`;
        },

        'fls': function(args, term, engine) {
            if (args.length === 0) return 'Usage: fls [-r] [-d] [-o offset] image_file\n  -r  Recurse into directories\n  -d  Show deleted files only';
            const showDeleted = args.includes('-d') || args.includes('-rd') || args.includes('-dr');
            const showRecurse = args.includes('-r') || args.includes('-rd') || args.includes('-dr');
            const di = Forensics01Config._diskImage;
            let output = '';

            if (showDeleted) {
                di.deletedFiles.forEach(f => {
                    output += `* ${f.inode}:\t${f.name}\n`;
                });
            } else {
                di.activeFiles.forEach(f => {
                    output += `r/r ${f.inode}:\t${f.name}\n`;
                });
                di.deletedFiles.forEach(f => {
                    output += `* ${f.inode}:\t${f.name}\n`;
                });
            }
            return output.trim();
        },

        'icat': function(args, term, engine) {
            if (args.length === 0) return 'Usage: icat [-o offset] image_file inode';
            const inodeArg = args[args.length - 1];
            const inode = parseInt(inodeArg);
            const di = Forensics01Config._diskImage;

            const deleted = di.deletedFiles.find(f => f.inode === inode);
            const active = di.activeFiles.find(f => f.inode === inode);

            if (inode === 51) {
                return `"Account","Bank","Amount","Date","Reference"\n"VX-Operations","First National","$145,000","2024-11-02","OP-7721"\n"VX-Reserve","Swiss Private Bank","$890,000","2024-11-15","SR-3342"\n"VX-Offshore","Cayman National","$2,450,000","2024-12-01","CN-8891"\n"VX-Shadow","Panama Intl","$1,200,000","2024-12-10","PI-4456"\n\n--- VERIFICATION CODE ---\n{{FLAG:user}}\n--- END ---`;
            }
            if (inode === 38) {
                return '[Binary data — Excel OOXML format]\nPK\\x03\\x04\\x14\\x00\\x06\\x00...\n[Use file carving tools to reconstruct]';
            }
            if (inode === 42) {
                return '[Binary data — DOCX format]\nPK\\x03\\x04\\x14\\x00\\x06\\x00...\nMeeting Notes - December 15\nAttendees: M. Hale, J. Torres, R. Chen\nTopic: Q4 Financial Discrepancies\nAction Items:\n- Review offshore account activity\n- Prepare audit response documentation\n- Schedule meeting with external auditors';
            }
            if (inode === 47) {
                return '[Binary data — PDF format]\n%PDF-1.7\nVortex Industries HR Department\nTERMINATION NOTICE\nEmployee: Marcus Hale\nPosition: Chief Financial Officer\nReason: Pending investigation into financial irregularities\nEffective: Upon completion of internal audit';
            }
            if (inode === 55) {
                return 'Secure Delete Log - 2024-12-14\n================================\n03:41:02 - Deleted: offshore_accounts.csv\n03:41:05 - Deleted: financial_records_Q4.xlsx\n03:41:08 - Deleted: meeting_notes_dec15.docx\n03:41:12 - Deleted: termination_letter.pdf\n03:41:15 - Emptied Recycle Bin\n03:41:18 - Note: Use CCleaner for secure wipe (TODO)';
            }

            if (active) {
                return `[Binary content of ${active.name} — ${active.size} bytes]`;
            }
            if (deleted) {
                return `[Recovered content of ${deleted.name} — ${deleted.size} bytes]`;
            }
            return `icat: Invalid inode number: ${inodeArg}`;
        },

        'foremost': function(args, term, engine) {
            if (args.length === 0) return 'Usage: foremost [-t type] [-o output_dir] image_file\nFile carving tool — recover files based on headers and footers.';
            const img = args.find(a => !a.startsWith('-') && a.includes('.dd'));
            if (!img) return 'foremost: No image file specified.';
            return `Processing: ${img}\n|*****************************************************|\nFounders Internet Security\nforemost version 1.5.7\nAudit File\n\nForemost started at Sat Dec 14 07:15:33 2024\nInvocation: foremost -t all -o /home/investigator/output ${img}\n\nOutput directory: /home/investigator/output\nConfiguration file: /etc/foremost.conf\n\n------------------------------------------------------------------\nFile: ${img}\nStart: Sat Dec 14 07:15:33 2024\nLength: 2 GB (2147483648 bytes)\n\nNum\tName (bs=512)\t  Size\tFile Offset\tComment\n\n0:\t00004096.pdf\t 32 KB\t  2097152\tPDF document\n1:\t00008192.xlsx\t 24 KB\t  4194304\tExcel spreadsheet\n2:\t00012288.docx\t 18 KB\t  6291456\tWord document\n3:\t00016384.csv\t  8 KB\t  8388608\tCSV data file\n4:\t00020480.pdf\t 45 KB\t 10485760\tPDF document\n\nFinish: Sat Dec 14 07:16:47 2024\n\n5 FILES EXTRACTED\n\ncsv:= 1\npdf:= 2\nxlsx:= 1\ndocx:= 1`;
        },

        'scalpel': function(args, term, engine) {
            if (args.length === 0) return 'Usage: scalpel [-o output_dir] image_file\nFile carving tool — precision recovery.';
            return `Scalpel version 2.0\nWriting results to output directory.\n\nOpening target: /evidence/suspect_drive.dd\n\nImage file pass 1/2.\nImage file pass 2/2.\n\nAllocating work queues...\nWork queues allocation complete.\n\nCarving files from image.\n\nProcessing of image file complete. 5 files carved.\n  csv: 1 files recovered\n  pdf: 2 files recovered\n  xlsx: 1 files recovered\n  docx: 1 files recovered`;
        },

        'strings': function(args, term, engine) {
            if (args.length === 0) return 'Usage: strings [-n min-len] file';
            const file = args.find(a => !a.startsWith('-')) || '';

            if (file.includes('suspect_drive')) {
                const hasGrep = args.includes('|');
                return `Vortex Industries\nfinancial_records_Q4\noffshore_accounts\nMarcus Hale\nCayman National Bank\nWIRE-X7742-GHOST\nCH-4827-VORTEX\n$2,450,000\nmeeting_notes_dec15\ntermination_letter\nQ4 Financial Discrepancies\nSecure Delete Log\nCCleaner\nSwiss Private Bank\nPanama Intl\nENCRYPTED TRANSFER LOG\nDate: 2024-12-14 03:42:17 UTC`;
            }
            if (file.includes('chain_of_custody')) {
                return 'CHAIN OF CUSTODY LOG\nCase: #2024-DF-4471\nEvidence: Western Digital 2TB HDD\nWrite-blocker attached\nImaging complete';
            }
            return `strings: '${file}': No such file`;
        },

        'xxd': function(args, term, engine) {
            if (args.length === 0) return 'Usage: xxd [-s seek] [-l len] file\nMake a hex dump of a file.';
            const file = args.find(a => !a.startsWith('-') && !args[args.indexOf(a) - 1]?.match(/^-[sl]$/)) || args[args.length - 1];

            if (file && file.includes('suspect_drive')) {
                const seekArg = args.indexOf('-s') !== -1 ? args[args.indexOf('-s') + 1] : null;
                if (seekArg && (seekArg === '847392' || parseInt(seekArg) >= 800000)) {
                    return `000cf120: 2d2d 2d20 454e 4352 5950 5445 4420 5452  --- ENCRYPTED TR\n000cf130: 414e 5346 4552 204c 4f47 202d 2d2d 0a44  ANSFER LOG ---.D\n000cf140: 6174 653a 2032 3032 342d 3132 2d31 3420  ate: 2024-12-14 \n000cf150: 3033 3a34 323a 3137 2055 5443 0a41 6363  03:42:17 UTC.Acc\n000cf160: 6f75 6e74 3a20 4348 2d34 3832 372d 564f  ount: CH-4827-VO\n000cf170: 5254 4558 0a41 6d6f 756e 743a 2024 322c  RTEX.Amount: $2,\n000cf180: 3435 302c 3030 302e 3030 0a44 6573 743a  450,000.00.Dest:\n000cf190: 2043 6179 6d61 6e20 4e61 7469 6f6e 616c   Cayman National\n000cf1a0: 2042 616e 6b0a 5265 663a 2057 4952 452d   Bank.Ref: WIRE-\n000cf1b0: 5837 3734 322d 4748 4f53 540a 4175 7468  X7742-GHOST.Auth\n000cf1c0: 3a20 7b7b 464c 4147 3a72 6f6f 747d 7d0a  : {{FLAG:root}}.`;
                }
                return `00000000: eb52 904e 5446 5320 2020 2000 0208 0000  .R.NTFS    .....\n00000010: 0000 0000 00f8 0000 3f00 ff00 0008 0000  ........?.......\n00000020: 0000 0000 8000 0080 ff3f 0300 0000 0000  .........?......\n00000030: 0400 0000 0000 0000 8a3b c4d5 0000 0000  .........;......\n00000040: 0000 0000 0000 0000 0000 0000 0000 0000  ................`;
            }
            return `xxd: ${file}: No such file or directory`;
        },

        'file': function(args, term, engine) {
            if (args.length === 0) return 'Usage: file <filename>';
            const f = args[0] || '';
            if (f.includes('suspect_drive')) return `${f}: DOS/MBR boot sector; partition 1 : ID=0x7, start-CHS (0x0,32,33), end-CHS (0x20,254,63), startsector 2048, 4192256 sectors`;
            if (f.includes('.csv')) return `${f}: CSV text`;
            if (f.includes('.pdf')) return `${f}: PDF document, version 1.7`;
            if (f.includes('.docx') || f.includes('.xlsx')) return `${f}: Microsoft OOXML`;
            return `${f}: data`;
        },

        'grep': function(args, term, engine) {
            if (args.length === 0) return 'Usage: grep [options] PATTERN [FILE...]';
            const pattern = args.find(a => !a.startsWith('-')) || '';
            const file = args.find(a => a !== pattern && !a.startsWith('-')) || '';

            if (pattern.toLowerCase().includes('flag') || pattern.toLowerCase().includes('wire') || pattern.toLowerCase().includes('cayman')) {
                return `Binary file /evidence/suspect_drive.dd matches\noffshore_accounts.csv:VX-Offshore,Cayman National,$2,450,000,2024-12-01,CN-8891`;
            }
            if (pattern.toLowerCase().includes('delete') || pattern.toLowerCase().includes('secure')) {
                return `shredder_log.txt:03:41:02 - Deleted: offshore_accounts.csv\nshredder_log.txt:03:41:15 - Emptied Recycle Bin`;
            }
            return `grep: ${file || 'stdin'}: No match`;
        },

        'cat': function(args, term, engine) {
            // Handled by base engine filesystem, but provide forensic-specific overrides
            const f = args[0] || '';
            if (f.includes('chain_of_custody')) {
                return Forensics01Config.filesystem['/'].children.evidence.children['chain_of_custody.txt'].content;
            }
            return null; // Let base engine handle
        },

        'md5sum': function(args, term, engine) {
            const f = args[0] || '';
            if (f.includes('suspect_drive')) return `a3f2b8c1d4e5f6a7b8c9d0e1f2a3b4c5  ${f}`;
            return `md5sum: ${f}: No such file or directory`;
        },

        'sha256sum': function(args, term, engine) {
            const f = args[0] || '';
            if (f.includes('suspect_drive')) return `7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8  ${f}`;
            return `sha256sum: ${f}: No such file or directory`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
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
