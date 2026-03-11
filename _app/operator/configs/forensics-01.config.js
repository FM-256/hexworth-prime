/* ================================================================
   FORENSICS-01: Cold Case -- Mission Config
   ================================================================
   Terminal-mode mission. Custom commands: examine, strings,
   timeline, recover, hash, report.
   ================================================================ */

var FORENSICS_01_CONFIG = {
    id: 'forensics-01',
    title: 'FORENSICS-01 / COLD CASE',
    subtitle: 'Case closed. Evidence secured. Report filed.',
    category: 'forensics',
    difficulty: 2,
    inputMode: 'terminal',
    prompt: 'examiner@forensics:~$',

    grid: {
        rows: 4,
        cols: 5,
        start: { col: 0, row: 0 },
        cells: [
            ['evidence-ws', 'empty',       'disk-image',  'memory-dump', 'wall'],
            ['empty',       'registry',    'empty',       'browser-data','email-store'],
            ['wall',        'event-logs',  'empty',       'empty',       'wall'],
            ['wall',        'wall',        'recycle-bin',  'wall',        'wall']
        ]
    },

    nodes: {
        'evidence-ws':  { label: 'EVIDENCE-WS',  abbr: 'EWS', ip: 'localhost',   desc: 'Forensic examination workstation',           os: 'SIFT Workstation 22.04' },
        'disk-image':   { label: 'DISK-IMAGE',   abbr: 'DSK', ip: '\u2014',      desc: 'Raw disk image (suspect-hdd.dd)',             os: 'NTFS / 500GB' },
        'memory-dump':  { label: 'MEM-DUMP',     abbr: 'MEM', ip: '\u2014',      desc: 'Volatile memory capture (8GB RAM dump)',      os: 'Volatility 3' },
        'registry':     { label: 'REGISTRY',     abbr: 'REG', ip: '\u2014',      desc: 'Windows registry hive exports',               os: 'Windows 11' },
        'browser-data': { label: 'BROWSER',      abbr: 'BRW', ip: '\u2014',      desc: 'Chrome browser history and cache',            os: 'Chrome 120' },
        'email-store':  { label: 'EMAIL',        abbr: 'EML', ip: '\u2014',      desc: 'Outlook PST archive',                         os: 'Outlook 2021' },
        'event-logs':   { label: 'EVENT-LOGS',   abbr: 'EVT', ip: '\u2014',      desc: 'Windows Event Log exports (evtx)',            os: 'Windows 11' },
        'recycle-bin':  { label: 'RECYCLE-BIN',  abbr: 'RCB', ip: '\u2014',      desc: 'Recovered deleted files from $Recycle.Bin',   os: 'NTFS' }
    },

    traps: [],
    gates: {},

    objectives: [
        { id: 'disk-imaged',       label: 'Image the disk',              check: 'diskImaged' },
        { id: 'dropper-found',     label: 'Find malware dropper',        check: 'dropperFound' },
        { id: 'evidence-recovered',label: 'Recover deleted evidence',    check: 'evidenceRecovered' },
        { id: 'timeline-built',    label: 'Build forensic timeline',     check: 'timelineBuilt' }
    ],

    integrity: 3,

    completion: {
        title: 'COLD CASE',
        subtitle: 'Case closed. Evidence secured. Report filed.',
        storageKey: 'hexworth_operator_forensics01'
    },

    briefing: [
        { text: '\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557', type: 'heading' },
        { text: '\u2551  MISSION: FORENSICS-01 \u2014 COLD CASE       \u2551', type: 'heading' },
        { text: '\u2560\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2563', type: 'heading' },
        { text: '\u2551  Suspected data exfiltration from laptop. \u2551', type: 'heading' },
        { text: '\u2551  Image the disk. Find the dropper.        \u2551', type: 'heading' },
        { text: '\u2551  Recover evidence. Build the timeline.    \u2551', type: 'heading' },
        { text: '\u255A\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255D', type: 'heading' },
        { text: '', type: 'system' },
        { text: '[SYS] Examiner online at EVIDENCE-WS (localhost)', type: 'success' },
        { text: '[SYS] Type "help" for command reference', type: 'info' },
        { text: '[SYS] Type "examine" to inspect current source', type: 'info' },
        { text: '', type: 'system' }
    ]
};
