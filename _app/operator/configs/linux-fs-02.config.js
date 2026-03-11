/* ================================================================
   LINUX-FS-02: Root Hunt — Config
   ================================================================
   Incident response mission. Analyst navigates a compromised server
   filesystem looking for persistence mechanisms: malicious cron,
   attacker SSH key, SUID backdoor. Terminal-input mode with
   context-sensitive commands (ls, cat, find, grep, crontab, remove).
   ================================================================ */

var LINUX_FS_02_CONFIG = {
    id: 'linux-fs-02',
    title: 'LINUX-FS-02 / ROOT HUNT',
    subtitle: 'Investigate a compromised server. Find and remove persistence.',
    category: 'linux-filesystem',
    difficulty: 2,
    inputMode: 'terminal',
    prompt: 'analyst@linux:~$',

    grid: {
        rows: 4,
        cols: 5,
        start: { col: 0, row: 0 },
        cells: [
            ['etc-cron',   'var-log',    'empty',       'wall',       'wall'],
            ['empty',      'home-admin', 'empty',       'ssh-config', 'wall'],
            ['wall',       'tmp-hidden', 'empty',       'empty',      'usr-sbin'],
            ['wall',       'empty',      'proc-list',   'root-dir',   'empty']
        ]
    },

    nodes: {
        'etc-cron':   { label: '/ETC/CRON.D',  abbr: 'CRN', ip: 'srv-web01', os: 'Ubuntu 22.04 LTS', ports: ['N/A'], desc: 'Cron job directory -- scheduled task definitions' },
        'var-log':    { label: '/VAR/LOG',      abbr: 'LOG', ip: 'srv-web01', os: 'Ubuntu 22.04 LTS', ports: ['N/A'], desc: 'System log directory -- auth.log, syslog, kern.log' },
        'home-admin': { label: '/HOME/ADMIN',   abbr: 'HME', ip: 'srv-web01', os: 'Ubuntu 22.04 LTS', ports: ['N/A'], desc: 'Admin user home directory' },
        'ssh-config': { label: '/ETC/SSH',      abbr: 'SSH', ip: 'srv-web01', os: 'OpenSSH 9.6',      ports: ['22/SSH'], desc: 'SSH server configuration and authorized keys' },
        'tmp-hidden': { label: '/TMP/.CACHE',   abbr: 'TMP', ip: 'srv-web01', os: 'Ubuntu 22.04 LTS', ports: ['N/A'], desc: 'Hidden temp directory -- suspicious artifacts' },
        'usr-sbin':   { label: '/USR/SBIN',     abbr: 'BIN', ip: 'srv-web01', os: 'Ubuntu 22.04 LTS', ports: ['N/A'], desc: 'System binaries -- administrative commands' },
        'proc-list':  { label: '/PROC',         abbr: 'PRC', ip: 'srv-web01', os: 'Ubuntu 22.04 LTS', ports: ['N/A'], desc: 'Process listing -- running daemons and services' },
        'root-dir':   { label: '/ROOT',         abbr: 'ROT', ip: 'srv-web01', os: 'Ubuntu 22.04 LTS', ports: ['N/A'], desc: 'Root user home directory' }
    },

    traps: [],
    gates: {},

    objectives: [
        { id: 'cron',    label: 'MALICIOUS CRON FOUND -- backdoor scheduled task identified',      check: 'maliciousCronFound' },
        { id: 'ip',      label: 'ATTACKER IP IDENTIFIED -- source of compromise confirmed',        check: 'attackerIPFound' },
        { id: 'ssh',     label: 'SSH KEY REMOVED -- unauthorized access key purged',                check: 'sshKeyRemoved' },
        { id: 'suid',    label: 'SUID BACKDOOR FOUND -- privilege escalation binary identified',   check: 'suidBackdoorFound' }
    ],

    integrity: 3,

    completion: {
        title: 'ROOT HUNT',
        subtitle: 'Persistence cleared. Server reclaimed.',
        storageKey: 'hexworth_operator_linuxfs02'
    }
};
