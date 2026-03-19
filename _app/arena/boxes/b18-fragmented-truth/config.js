/* ============================================================
   CTF ARENA — Box B18: The Fragmented Truth
   Digital Forensics — Data Recovery & Filesystem Reconstruction
   Config: disk image analysis, file carving, hidden partitions, flags, hints, lore
   ============================================================ */

const B18Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Fragmented Truth',
    subtitle: 'Digital Forensics — Data Recovery & Filesystem Reconstruction',
    difficulty: 'Expert',
    accent: '#0891b2',
    storageKey: 'hexworth_ctf_b18',
    registryId: 'b18-fragmented-truth',
    trackerKey: 'ctf_b18',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'triage',
            name: 'Image Triage',
            icon: '\uD83D\uDCBE',
            description: 'Analyze the raw disk image. Identify filesystem type, partition layout, and extent of damage.',
            requiredFlags: [],
            mitre: ['T1005', 'T1074.001'],
            unlocks: ['recovery'],
            locked: false
        },
        {
            id: 'recovery',
            name: 'File Recovery',
            icon: '\uD83D\uDD27',
            description: 'Carve deleted and fragmented files from the damaged filesystem. Reconstruct the Chronos Time-Stream Log.',
            requiredFlags: [],
            mitre: ['T1005', 'T1119'],
            unlocks: ['hidden'],
            locked: true
        },
        {
            id: 'hidden',
            name: 'Hidden Partition',
            icon: '\uD83D\uDD12',
            description: 'Discover and access the hidden encrypted partition containing the Emergency Protocol Override.',
            requiredFlags: ['user'],
            mitre: ['T1006', 'T1140'],
            unlocks: ['reconstruct'],
            locked: true
        },
        {
            id: 'reconstruct',
            name: 'Full Reconstruction',
            icon: '\uD83E\uDDE9',
            description: 'Decrypt the hidden partition and extract the Emergency Protocol Override.',
            requiredFlags: ['root'],
            mitre: ['T1005', 'T1552.004'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // TUTORIAL MODE (Sprint AR-12)
    // ═══════════════════════════════════════════════════════

    tutorialMode: false,

    tutorial: {
        steps: [
            {
                title: 'Analyze the disk image',
                tip: 'Run fdisk -l or file on data_critical_01.dd to identify the image structure.',
                trigger: { event: 'command', match: { cmd: 'contains:fdisk' } }
            },
            {
                title: 'Attempt filesystem recovery',
                tip: 'Use testdisk or fsck to analyze the corrupted filesystem.',
                trigger: { event: 'command', match: { cmd: 'contains:testdisk' } }
            },
            {
                title: 'Carve deleted files',
                tip: 'Run foremost or scalpel to recover deleted text files from the image.',
                trigger: { event: 'command', match: { cmd: 'contains:foremost' } }
            },
            {
                title: 'Find the temporal anomaly timestamp',
                tip: 'Search recovered files for the Chronos log timestamp pattern.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Access the hidden partition',
                tip: 'Use binwalk to find hidden partitions, then cryptsetup to decrypt.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'CYSA+',
        mappings: [
            { flagId: 'user', objective: '3.3', description: 'Given a scenario, analyze digital forensic artifacts — Disk image analysis and file carving', skill: 'Disk Forensics & File Carving' },
            { flagId: 'user', objective: '3.4', description: 'Given a scenario, use appropriate forensic tools — Filesystem reconstruction from corrupted media', skill: 'Filesystem Reconstruction' },
            { flagId: 'root', objective: '3.5', description: 'Given a scenario, analyze forensic artifacts — Hidden partition discovery and encrypted volume analysis', skill: 'Hidden Partition Discovery' },
            { flagId: 'root', objective: '4.2', description: 'Given a scenario, apply digital forensics procedures — Evidence integrity and chain of custody', skill: 'Encrypted Volume Recovery' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'SIFT Workstation BIOS v3.0',
            'Initializing hardware...',
            'Memory Test: 32768 MB OK',
            'Detecting drives... /dev/sda (500GB SSD)',
            'External device: /dev/sdb (DATA-CRITICAL-01 image mounted)',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'SIFT Workstation Ubuntu 22.04 LTS',
            'SIFT Workstation (recovery mode)',
            'Advanced options'
        ],
        loginUser: 'forensicator'
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
        user: 'forensicator',
        hostname: 'sift-ws',
        startDir: '/home/forensicator/cases/data-critical-01',
        welcome: 'SIFT Workstation 22.04 LTS — Digital Forensics Environment\n\nType \'help\' for available commands.\n\nCase: DATA-CRITICAL-01 Recovery\nDisk Image: /home/forensicator/cases/data-critical-01/data_critical_01.dd\nStatus: Filesystem corrupted — manual analysis required\n'
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED DATA
    // ═══════════════════════════════════════════════════════

    _chronosLogFragments: [
        '[Fragment 1/4] Chronos Time-Stream Log — Temporal Research Division\nEntry 001: Baseline temporal reading established at T+0.000\nEntry 002: Minor fluctuation detected in sector 7-Alpha\nEntry 003: Fluctuation stabilized. No action required.',
        '[Fragment 2/4] Chronos Time-Stream Log — continued\nEntry 047: WARNING — Anomalous reading in sector 12-Gamma\nEntry 048: Temporal displacement measured: +4.7 microseconds\nEntry 049: Displacement increasing. Alert Level: AMBER',
        '[Fragment 3/4] Chronos Time-Stream Log — continued\nEntry 112: CRITICAL — Temporal anomaly confirmed\nEntry 113: Anomaly Timestamp: 2077-10-23_13:07:42_EST\nEntry 114: Displacement: +847.3 microseconds and growing\nEntry 115: EMERGENCY PROTOCOL RECOMMENDED',
        '[Fragment 4/4] Chronos Time-Stream Log — continued\nEntry 198: Anomaly stable but persistent\nEntry 199: Research team evacuated from sector 12-Gamma\nEntry 200: Awaiting Emergency Protocol Override authorization\n[END OF LOG — RECOVERED]'
    ],

    _hiddenPartitionData: {
        protocol: 'EMERGENCY PROTOCOL OVERRIDE DOCUMENT\n=====================================\nAuthorization Level: OMEGA\nTimestamp: 2077-10-24 00:00:00 EST\n\nOverride Code: {{FLAG:root}}\n\nInstructions:\n1. Input override code at Chronos Control Terminal\n2. Confirm temporal stabilization parameters\n3. Initiate forced collapse of anomaly field\n\nWARNING: Override is irreversible.\nAll temporal research data in sector 12-Gamma will be lost.\n\n[DOCUMENT CLASSIFICATION: COSMIC TOP SECRET]'
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', points: 200 },
        { id: 'root', points: 300 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        maxScore: 1000,
        hintPenalty: true,
        wrongFlagPenalty: -50,
        speedBonus: { threshold: 1800000, points: 200 },
        timeBonusThreshold: 3600
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start with "file data_critical_01.dd" and "fdisk -l data_critical_01.dd" to understand the image structure. The partition table is damaged — look for filesystem signatures manually.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint2',
            text: 'Use foremost to carve text files: "foremost -t txt -i data_critical_01.dd -o recovered/". The Chronos log is fragmented into 4 pieces — look for entries mentioning "Temporal anomaly" or timestamps.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'The temporal anomaly timestamp is in Fragment 3 of the Chronos log: 2077-10-23_13:07:42_EST. The flag format is {{FLAG:user}}.',
            cost: 75,
            penalty: -75
        },
        {
            id: 'hint4',
            text: 'Use "binwalk data_critical_01.dd" to find the hidden LUKS partition at the end of the image. The passphrase "chronos_override_2077" can be found via strings analysis. Use cryptsetup to open it.',
            cost: 100,
            penalty: -100
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'A crucial data drive, DATA-CRITICAL-01, containing the "Chronos Time-Stream Log" — an invaluable record of temporal anomalies — was physically damaged during a failed data transfer. Initial recovery attempts yielded only corrupted fragments. The filesystem is unmountable. However, vital portions of the log, including the precise timestamp of a critical temporal anomaly, are still recoverable. A hidden encrypted partition holding an "Emergency Protocol Override" was present on the drive, now obscured by the damage.',
        scenario: 'The disk image shows a corrupted ext4 filesystem with a damaged partition table and superblock. The Chronos Time-Stream Log was deleted and is now fragmented across non-contiguous sectors. At the end of the disk lies a hidden LUKS-encrypted partition containing the Emergency Protocol Override document. Standard tools fail — manual forensic analysis is required.',
        outro: 'The Fragmented Truth has been assembled. Through meticulous disk forensics — partition analysis, file carving, fragment reconstruction, and hidden partition discovery — you recovered both the critical temporal anomaly timestamp and the Emergency Protocol Override. The Chronos Time-Stream is restored.',
        ecer: {
            executive: 'No redundant backup strategy for critical temporal research data',
            culture: 'Data transfer procedures lacked integrity verification steps',
            employee: 'Technician attempted unsupported hot-swap during active write operations',
            regulatory: 'No data classification policy requiring encrypted backup for top-secret research'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Forensic Case Notes
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://localhost/case-notes.html',

        pages: {
            '/case-notes.html': {
                title: 'Case Notes — DATA-CRITICAL-01',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #333;">
                        <h1 style="color:#0891b2; font-size:1.4rem; font-family:Georgia,serif;">Case: DATA-CRITICAL-01 Recovery</h1>
                        <div style="color:#888; font-size:0.8rem;">SIFT Forensic Workstation — Case Management</div>
                    </div>
                    <div style="max-width:600px; margin:0 auto; color:#ccc; font-size:0.85rem; font-family:monospace;">
                        <h3 style="color:#0891b2;">Evidence Summary</h3>
                        <ul style="line-height:1.8;">
                            <li>Image: data_critical_01.dd (2GB raw disk image)</li>
                            <li>Source: DATA-CRITICAL-01 storage drive</li>
                            <li>Filesystem: ext4 (corrupted)</li>
                            <li>Partition table: MBR (damaged)</li>
                            <li>Status: Unmountable</li>
                        </ul>
                        <h3 style="color:#0891b2; margin-top:20px;">Objectives</h3>
                        <ol style="line-height:1.8;">
                            <li>Recover the Chronos Time-Stream Log (fragmented)</li>
                            <li>Extract the temporal anomaly timestamp (user flag)</li>
                            <li>Discover and access hidden partition</li>
                            <li>Recover Emergency Protocol Override (root flag)</li>
                        </ol>
                    </div>
                `
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (forensic workstation)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'forensicator': {
                            type: 'dir',
                            children: {
                                'cases': {
                                    type: 'dir',
                                    children: {
                                        'data-critical-01': {
                                            type: 'dir',
                                            children: {
                                                'data_critical_01.dd': {
                                                    type: 'file',
                                                    content: '[RAW DISK IMAGE — 2,147,483,648 bytes — binary data]'
                                                },
                                                'case_notes.txt': {
                                                    type: 'file',
                                                    content: '=== CASE: DATA-CRITICAL-01 ===\nDate: 2026-01-15\nAnalyst: forensicator\n\nEvidence:\n  data_critical_01.dd — 2GB raw disk image from damaged drive\n\nPreliminary findings:\n  - File system type: ext4 (signature found at offset 0x438)\n  - Partition table (MBR): corrupted / unreadable by fdisk\n  - Superblock: primary damaged, backup may exist\n  - Deleted files: high probability of recoverable fragments\n  - Suspicious gap at end of image: possible hidden partition\n\nTools available:\n  fdisk, gdisk, testdisk, photorec, foremost, scalpel,\n  hexedit, xxd, strings, binwalk, debugfs, cryptsetup\n\nObjectives:\n  1. Recover Chronos Time-Stream Log fragments\n  2. Extract temporal anomaly timestamp (user flag)\n  3. Discover and access hidden encrypted partition\n  4. Recover Emergency Protocol Override (root flag)'
                                                },
                                                'hashes.txt': {
                                                    type: 'file',
                                                    content: 'MD5:    a7b3c9d2e4f1a8b5c6d0e2f3a4b5c6d7\nSHA256: 1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b'
                                                },
                                                'recovered': {
                                                    type: 'dir',
                                                    children: {}
                                                }
                                            }
                                        }
                                    }
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'cd cases/data-critical-01\nfile data_critical_01.dd\nmd5sum data_critical_01.dd'
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
                                            content: '[rockyou.txt — 14,341,564 passwords — file too large to display]'
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
                        'hostname': { type: 'file', content: 'sift-ws' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\nforensicator:x:1000:1000:SIFT User,,,:/home/forensicator:/bin/bash'
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {}
                },
                'mnt': {
                    type: 'dir',
                    children: {
                        'evidence': {
                            type: 'dir',
                            children: {}
                        }
                    }
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS
    // ═══════════════════════════════════════════════════════

    commands: {
        'file': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: file <filename>';

            if (target.includes('data_critical_01') || target.includes('.dd')) {
                return 'data_critical_01.dd: DOS/MBR boot sector; partition table corrupted; extended partition table (last)';
            }
            return `${target}: data`;
        },

        'fdisk': function(args) {
            if (!args.includes('-l')) return 'Usage: fdisk -l <disk_image>';
            const image = args.find(a => !a.startsWith('-')) || '';

            if (image.includes('data_critical_01') || image.includes('.dd')) {
                return `Disk data_critical_01.dd: 2 GiB, 2147483648 bytes, 4194304 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes

Disklabel type: dos

Device                    Boot   Start     End Sectors  Size Id Type
data_critical_01.dd1             2048       ?       ?    ?  83 Linux
>>> Partition table entries are not in disk order
>>> Partition 1: bad CHS values (expected 0/32/33)
>>> WARNING: Partition table damaged — cannot determine full layout
>>> Note: Possible additional partition(s) beyond sector 3800000`;
            }
            return 'fdisk: cannot open: No such file or directory';
        },

        'gdisk': function(args) {
            if (!args.includes('-l')) return 'Usage: gdisk -l <disk_image>';
            return `GPT fdisk (gdisk) version 1.0.9

Partition table scan:
  MBR: MBR only (damaged)
  GPT: not present

Found invalid GPT and valid MBR.
MBR partition table is damaged.

Number  Start (sector)    End (sector)  Size       Code  Name
   1            2048         3799999   1.8 GiB     8300  Linux filesystem
   >>> Warning: last partition extends beyond disk image boundary
   >>> Unallocated space detected: sectors 3800000-4194303 (193 MB)`;
        },

        'testdisk': function(args) {
            const image = args.find(a => !a.startsWith('-')) || '';
            if (!image) return 'Usage: testdisk <disk_image>';

            return `TestDisk 7.2, Data Recovery Utility
Christophe GRENIER <grenier@cgsecurity.org>

Disk data_critical_01.dd - 2147 MB / 2048 MiB

Analyse:
  Partition table type: Intel/PC (MBR)

  [Partition 1] Linux ext4    2048 -> 3799999  (1835 MB)
    Superblock: damaged (primary)
    Backup superblock found at sector 32768
    Status: Filesystem recoverable with backup superblock

  [Unallocated space] 3800000 -> 4194303  (193 MB)
    Signature detected: LUKS encrypted partition
    LUKS header found at offset 0x74240000

Recommended actions:
  1. Use backup superblock to repair: fsck.ext4 -b 32768 <device>
  2. Carve files from partition 1: foremost -i data_critical_01.dd
  3. Investigate LUKS partition at end of disk`;
        },

        'foremost': function(args) {
            if (args.length === 0) return 'Usage: foremost [-t type] -i <input_file> [-o <output_dir>]';

            const hasType = args.indexOf('-t');
            const type = hasType !== -1 ? args[hasType + 1] : 'all';

            return `Foremost version 1.5.7 by Jesse Kornblum, Kris Kendall, and Nick Mikus
Audit File

Foremost started at ${new Date().toISOString().split('T')[0]}
Invocation: foremost ${args.join(' ')}
Output directory: recovered/

Processing: data_critical_01.dd
|*************************************|
${type === 'txt' || type === 'all' ? `txt:  4 files recovered
  recovered/txt/00000001.txt (Fragment 1/4 - Chronos Log)
  recovered/txt/00000002.txt (Fragment 2/4 - Chronos Log)
  recovered/txt/00000003.txt (Fragment 3/4 - Chronos Log)
  recovered/txt/00000004.txt (Fragment 4/4 - Chronos Log)` : ''}
${type === 'all' ? `jpg:  2 files recovered
png:  1 file recovered
pdf:  1 file recovered` : ''}

Foremost finished at ${new Date().toISOString().split('T')[0]}
${type === 'txt' || type === 'all' ? '8' : '0'} FILES EXTRACTED

=== recovered/txt/00000003.txt (CRITICAL — contains timestamp) ===
${B18Config._chronosLogFragments[2]}`;
        },

        'scalpel': function(args) {
            if (args.length === 0) return 'Usage: scalpel [-c config] -i <input_file> -o <output_dir>';

            return `Scalpel version 2.0
Opened image file: data_critical_01.dd

The following files were carved:
  txt:
    00000001.txt:  843 bytes (Chronos Log Fragment 1)
    00000002.txt:  756 bytes (Chronos Log Fragment 2)
    00000003.txt:  891 bytes (Chronos Log Fragment 3)
    00000004.txt:  624 bytes (Chronos Log Fragment 4)

Scalpel is done, 4 files found.`;
        },

        'strings': function(args) {
            const file = args.find(a => !a.startsWith('-')) || '';
            if (!file) return 'Usage: strings [-n length] <file>';

            if (file.includes('data_critical_01') || file.includes('.dd')) {
                const hasGrep = args.join(' ');
                if (hasGrep.includes('LUKS') || hasGrep.includes('luks') || hasGrep.includes('crypt')) {
                    return `LUKS\x01\x00\x01aes
sha256
passphrase_hint:chronos_override_2077
LUKS partition encrypted with AES-256-XTS`;
                }
                if (hasGrep.includes('chronos') || hasGrep.includes('Chronos') || hasGrep.includes('temporal') || hasGrep.includes('anomaly')) {
                    return `Chronos Time-Stream Log
Temporal Research Division
WARNING - Anomalous reading
Anomaly Timestamp: 2077-10-23_13:07:42_EST
CRITICAL - Temporal anomaly confirmed
EMERGENCY PROTOCOL RECOMMENDED
Emergency Protocol Override
chronos_override_2077`;
                }
                if (hasGrep.includes('password') || hasGrep.includes('passphrase') || hasGrep.includes('key')) {
                    return `passphrase_hint:chronos_override_2077
KeyFragment
EncryptionKey
password_required`;
                }
                // Default strings output
                return `EXT4_SUPER_MAGIC
ext4 filesystem data
htree_dirdata
lost+found
chronos_log.txt
temporal_data/
research_notes/
Chronos Time-Stream Log
Temporal Research Division
2077-10-23_13:07:42_EST
EMERGENCY PROTOCOL
chronos_override_2077
LUKS encrypted partition
emergency_protocol.txt`;
            }

            if (file.includes('00000003') || file.includes('fragment3')) {
                return B18Config._chronosLogFragments[2];
            }

            return `strings: '${file}': No such file`;
        },

        'xxd': function(args) {
            const file = args.find(a => !a.startsWith('-')) || '';
            if (!file) return 'Usage: xxd [options] <file>';

            if (file.includes('data_critical_01') || file.includes('.dd')) {
                const hasSeek = args.indexOf('-s');
                const offset = hasSeek !== -1 ? args[hasSeek + 1] : '0';

                if (offset === '0x74240000' || offset.includes('3800000') || parseInt(offset) > 1900000000) {
                    return `74240000: 4c55 4b53 babe 0001 0061 6573 0000 0000  LUKS.....aes....
74240010: 0000 0000 0000 0000 7874 732d 706c 6169  ........xts-plai
74240020: 6e36 3400 0000 0000 0000 0000 0000 0000  n64.............
74240030: 7368 6132 3536 0000 0000 0000 0000 0000  sha256..........
74240040: 0000 1000 0000 0020 6368 726f 6e6f 735f  ....... chronos_
74240050: 6f76 6572 7269 6465 5f32 3037 3700 0000  override_2077...`;
                }

                return `00000000: eb63 9000 0000 0000 0000 0000 0000 0000  .c..............
00000010: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000020: 0000 0000 0000 0000 0000 0000 0000 0000  ................
00000438: 53ef 0100 0040 0600 0020 0300 004e 0500  S....@... ...N..
00000440: 00e0 0500 0000 0000 0200 0000 0200 0000  ................
00000448: 0080 0000 0080 0000 0020 0000 6789 a500  ......... ..g...`;
            }
            return `xxd: ${file}: No such file or directory`;
        },

        'hexdump': function(args) {
            return B18Config.commands.xxd(args, null, null);
        },

        'binwalk': function(args) {
            const file = args.find(a => !a.startsWith('-')) || '';
            if (!file) return 'Usage: binwalk [options] <file>';

            const hasEntropy = args.includes('-E') || args.includes('--entropy');

            if (file.includes('data_critical_01') || file.includes('.dd')) {
                if (hasEntropy) {
                    return `DECIMAL       HEXADECIMAL     ENTROPY
-----------------------------------------------
0             0x0             0.412 (Low — mostly zeroed/corrupted)
1048576       0x100000        0.867 (High — ext4 data region)
1946157056    0x74240000      0.998 (Very High — encrypted data / LUKS)

Analysis:
  Sectors 0-2047: Boot sector (mostly zeroed)
  Sectors 2048-3799999: ext4 filesystem (fragmented data)
  Sectors 3800000-4194303: HIGH ENTROPY — likely encrypted partition`;
                }

                return `DECIMAL       HEXADECIMAL     DESCRIPTION
-----------------------------------------------
0             0x0             DOS/MBR boot sector (corrupted)
1080          0x438           ext4 filesystem superblock (damaged)
16777216      0x1000000       ext4 backup superblock
1946157056    0x74240000      LUKS encrypted volume header
                              Cipher: aes-xts-plain64
                              Hash: sha256
                              Key Size: 512 bits`;
            }
            return `binwalk: ${file}: No such file or directory`;
        },

        'cryptsetup': function(args) {
            if (args.length === 0) return 'Usage: cryptsetup open <device> <name> --type luks\n       cryptsetup luksDump <device>';

            if (args[0] === 'luksDump') {
                return `LUKS header information
Version:        1
Cipher name:    aes
Cipher mode:    xts-plain64
Hash spec:      sha256
Payload offset: 4096
MK bits:        512
UUID:           a1b2c3d4-e5f6-7890-abcd-ef1234567890

Key Slot 0: ENABLED
    Iterations: 1048576
    Salt: [32 bytes of salt data]
Key Slot 1: DISABLED
Key Slot 2: DISABLED
...
Key Slot 7: DISABLED`;
            }

            if (args[0] === 'open' || args[0] === 'luksOpen') {
                const passIdx = args.indexOf('--key-file');
                const passphrase = passIdx !== -1 ? 'file' : null;

                // Check if correct passphrase scenario
                if (args.join(' ').includes('chronos_override_2077')) {
                    return `Enter passphrase for encrypted volume:
Key slot 0 unlocked.
Command successful.
Hidden partition mapped to /dev/mapper/hidden_part

=== Contents of hidden partition ===
-rw-r--r-- 1 root root  512 Oct 23 2077 emergency_protocol.txt

=== emergency_protocol.txt ===
${B18Config._hiddenPartitionData.protocol}`;
                }

                return `Enter passphrase for encrypted volume:
No key available with this passphrase.
cryptsetup: ERROR - No usable key found.

Hint: Check strings output for passphrase clues.`;
            }

            return 'cryptsetup: Unknown action.';
        },

        'debugfs': function(args) {
            const image = args.find(a => !a.startsWith('-')) || '';
            if (!image) return 'Usage: debugfs [-b superblock] <filesystem_image>';

            const hasBackup = args.includes('-b');
            if (hasBackup) {
                return `debugfs 1.47.0 (5-Feb-2023)
Using backup superblock at block 32768

debugfs:  ls -la
 2 (12) .    2 (12) ..    11 (20) lost+found    12 (24) chronos_log.txt
 13 (20) temporal_data    14 (16) research_notes

debugfs:  stat chronos_log.txt
Inode: 12   Type: regular   Mode: 0644   Size: 3114
Fragment: Yes (4 extents, non-contiguous)
Blocks: (0-1): 10240-10241, (2-3): 25600-25601, (4-5): 38400-38401, (6): 51200
Status: DELETED — fragments may be recoverable via carving`;
            }

            return `debugfs 1.47.0 (5-Feb-2023)
debugfs: Error reading primary superblock
debugfs: Superblock checksum mismatch
Hint: Try using backup superblock with -b 32768`;
        },

        'fsck': function(args) {
            return B18Config.commands['fsck.ext4'](args);
        },

        'fsck.ext4': function(args) {
            const image = args.find(a => !a.startsWith('-')) || '';
            if (!image) return 'Usage: fsck.ext4 [-b backup_superblock] <filesystem_image>';

            const hasBackup = args.includes('-b');

            if (hasBackup) {
                return `e2fsck 1.47.0 (5-Feb-2023)
Using backup superblock at block 32768...

data_critical_01.dd: recovering journal
Pass 1: Checking inodes, blocks, and sizes
  Inode 12 (chronos_log.txt): DELETED — 4 fragments found
  Inode 13 (temporal_data/): directory intact
  Inode 14 (research_notes/): directory intact
Pass 2: Checking directory structure
Pass 3: Checking directory connectivity
Pass 4: Checking reference counts
Pass 5: Checking group summary information

data_critical_01.dd: 14/131072 files (7.1% non-contiguous), 65536/524288 blocks

Filesystem partially recovered. Deleted files may be recoverable with file carving tools.`;
            }

            return `e2fsck 1.47.0 (5-Feb-2023)
data_critical_01.dd: primary superblock damaged
e2fsck: Superblock invalid, trying backup blocks...
Hint: Run with -b 32768 to use backup superblock`;
        },

        'photorec': function(args) {
            if (args.length === 0) return 'Usage: photorec <disk_image>';

            return `PhotoRec 7.2, Data Recovery Utility
Christophe GRENIER <grenier@cgsecurity.org>

Processing: data_critical_01.dd
Partition 1: ext4 (damaged)

Pass 1: Scanning for file signatures...
  txt: 4 files recovered
  jpg: 2 files recovered
  png: 1 file recovered
  pdf: 1 file recovered

Recovery complete: 8 files saved to recup_dir.1/

Key recovered files:
  f0000001.txt — Chronos Log Fragment 1 (843 bytes)
  f0000002.txt — Chronos Log Fragment 2 (756 bytes)
  f0000003.txt — Chronos Log Fragment 3 (891 bytes) [CONTAINS TIMESTAMP]
  f0000004.txt — Chronos Log Fragment 4 (624 bytes)`;
        },

        'cat': function(args) {
            const file = args[0] || '';
            if (!file) return 'Usage: cat <file>';

            if (file.includes('00000001') || file.includes('f0000001') || file.includes('fragment1')) {
                return B18Config._chronosLogFragments[0];
            }
            if (file.includes('00000002') || file.includes('f0000002') || file.includes('fragment2')) {
                return B18Config._chronosLogFragments[1];
            }
            if (file.includes('00000003') || file.includes('f0000003') || file.includes('fragment3')) {
                return B18Config._chronosLogFragments[2];
            }
            if (file.includes('00000004') || file.includes('f0000004') || file.includes('fragment4')) {
                return B18Config._chronosLogFragments[3];
            }
            if (file.includes('emergency_protocol')) {
                return B18Config._hiddenPartitionData.protocol;
            }
            if (file.includes('case_notes')) {
                return '=== CASE: DATA-CRITICAL-01 ===\nDate: 2026-01-15\nAnalyst: forensicator\n\nEvidence: data_critical_01.dd (2GB raw disk image)\n\nObjectives:\n  1. Recover Chronos Time-Stream Log\n  2. Extract temporal anomaly timestamp\n  3. Discover hidden encrypted partition\n  4. Recover Emergency Protocol Override';
            }

            // Try filesystem lookup
            return `cat: ${file}: No such file or directory`;
        },

        'grep': function(args) {
            const pattern = args.find(a => !a.startsWith('-')) || '';
            const files = args.filter(a => !a.startsWith('-') && a !== pattern);

            if (!pattern) return 'Usage: grep [options] <pattern> [file...]';

            const hasR = args.includes('-r') || args.includes('-R') || args.includes('-a');

            if (pattern.toLowerCase().includes('timestamp') || pattern.toLowerCase().includes('anomaly') || pattern.includes('2077')) {
                return `recovered/txt/00000003.txt:Entry 113: Anomaly Timestamp: 2077-10-23_13:07:42_EST
recovered/txt/00000003.txt:Entry 114: Displacement: +847.3 microseconds and growing`;
            }

            if (pattern.toLowerCase().includes('flag') || pattern.toLowerCase().includes('override') || pattern.toLowerCase().includes('protocol')) {
                return `recovered/txt/00000004.txt:Entry 200: Awaiting Emergency Protocol Override authorization`;
            }

            if (pattern.toLowerCase().includes('chronos') || pattern.toLowerCase().includes('luks') || pattern.toLowerCase().includes('passphrase')) {
                return `Binary file data_critical_01.dd matches
Possible passphrase hint found: chronos_override_2077`;
            }

            return `grep: ${pattern}: no matches found`;
        },

        'mount': function(args) {
            if (args.length === 0) return 'Usage: mount [-o options] <device> <mountpoint>';

            const device = args.find(a => !a.startsWith('-')) || '';
            if (device.includes('data_critical_01') || device.includes('.dd')) {
                return `mount: data_critical_01.dd: can't read superblock
mount: filesystem corrupted — try fsck.ext4 -b 32768 first
mount: or use loop device with offset: mount -o loop,offset=1048576`;
            }
            if (device.includes('mapper') || device.includes('hidden')) {
                return `mount: /dev/mapper/hidden_part mounted on /mnt/evidence
Contents:
  -rw-r--r-- 1 root root 512 Oct 23 2077 emergency_protocol.txt`;
            }
            return `mount: ${device}: special device does not exist`;
        },

        'dd': function(args) {
            if (args.length === 0) return 'Usage: dd if=<input> of=<output> [bs=<size>] [skip=<blocks>] [count=<blocks>]';

            const ifArg = args.find(a => a.startsWith('if='));
            const ofArg = args.find(a => a.startsWith('of='));

            if (ifArg && ofArg) {
                return `4194304+0 records in
4194304+0 records out
2147483648 bytes (2.1 GB, 2.0 GiB) copied, 12.4567 s, 172 MB/s`;
            }
            return 'dd: missing operand';
        },

        'md5sum': function(args) {
            const file = args[0] || '';
            if (file.includes('data_critical_01')) {
                return 'a7b3c9d2e4f1a8b5c6d0e2f3a4b5c6d7  data_critical_01.dd';
            }
            return `md5sum: ${file}: No such file or directory`;
        },

        'sha256sum': function(args) {
            const file = args[0] || '';
            if (file.includes('data_critical_01')) {
                return '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b  data_critical_01.dd';
            }
            return `sha256sum: ${file}: No such file or directory`;
        },

        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            return `PING ${target}: Network is unreachable (forensic workstation is air-gapped)`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.8rem;"><thead><tr>';
        headers.forEach(h => {
            html += `<th style="padding:6px 10px; text-align:left; color:#0891b2; border-bottom:2px solid #333; background:rgba(8,145,178,0.1);">${h}</th>`;
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
