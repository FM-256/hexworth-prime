/* ================================================================
   LINUX-FS-03: Privilege Escalation -- Config
   ================================================================
   Tier 2 Linux admin mission. Player starts as unprivileged user
   on a compromised server. Must enumerate the filesystem to find
   privilege escalation vectors: SUID binaries, misconfigured sudo,
   writable cron jobs. Three distinct privesc paths -- any one
   grants root. Then read /etc/shadow and capture the flag in /root.

   Converted to TerminalInterpreter config-driven pattern.
   Custom commands: ls, cat, find, sudo, id, whoami, exploit,
                    passwd, uname
   Overrides: scan, move (filesystem language), status, help
   ================================================================ */

var LINUX_FS_03_CONFIG = {
    id: 'linux-fs-03',
    missionTitle: 'LINUX-FS-03',
    title: 'Privilege Escalation',
    subtitle: 'Enumerate. Exploit. Escalate to root.',
    category: 'linux-admin',
    difficulty: 2,
    inputMode: 'terminal',
    promptText: 'user@target:~$ ',
    promptLabel: 'OPERATOR TERMINAL',

    briefing: [
        'You have initial access as a low-privilege user on a Linux server.',
        'Enumerate the system to find privilege escalation vectors.',
        'Escalate to root, read /etc/shadow, and capture the flag in /root.'
    ],

    notFoundMsg: 'Unknown command: {cmd}. Type "help".',

    grid: {
        rows: 5,
        cols: 5,
        start: { col: 0, row: 0 },
        cells: [
            ['user-home',    'var-log',       'empty',         'cron-directory', 'wall'],
            ['empty',        'etc-shadow',    'empty',         'usr-local-bin',  'wall'],
            ['tmp-world',    'empty',         'opt-webapp',    'empty',          'proc-system'],
            ['wall',         'dev-shm',       'empty',         'srv-database',   'empty'],
            ['wall',         'wall',          'backup-mount',  'empty',          'root-home']
        ]
    },

    nodes: {
        'user-home':      { label: '/HOME/USER',       abbr: 'USR', ip: 'target', os: 'Ubuntu 22.04 LTS', ports: ['N/A'], desc: 'Low-privilege user home directory -- your starting point' },
        'var-log':        { label: '/VAR/LOG',          abbr: 'LOG', ip: 'target', os: 'Ubuntu 22.04 LTS', ports: ['N/A'], desc: 'System logs -- authentication and service activity' },
        'etc-shadow':     { label: '/ETC',              abbr: 'ETC', ip: 'target', os: 'Ubuntu 22.04 LTS', ports: ['N/A'], desc: 'System configuration -- passwd, shadow, sudoers' },
        'tmp-world':      { label: '/TMP',              abbr: 'TMP', ip: 'target', os: 'Ubuntu 22.04 LTS', ports: ['N/A'], desc: 'World-writable temp directory -- anyone can write here' },
        'opt-webapp':     { label: '/OPT/WEBAPP',       abbr: 'WEB', ip: 'target', os: 'Ubuntu 22.04 LTS', ports: ['8080/HTTP'], desc: 'Web application directory -- config files and credentials' },
        'srv-database':   { label: '/SRV/DATABASE',     abbr: 'DB',  ip: 'target', os: 'Ubuntu 22.04 LTS', ports: ['3306/MySQL'], desc: 'Database service directory -- backups and configs' },
        'cron-directory': { label: '/ETC/CRON.D',       abbr: 'CRN', ip: 'target', os: 'Ubuntu 22.04 LTS', ports: ['N/A'], desc: 'Cron job directory -- scheduled tasks running as root' },
        'usr-local-bin':  { label: '/USR/LOCAL/BIN',    abbr: 'BIN', ip: 'target', os: 'Ubuntu 22.04 LTS', ports: ['N/A'], desc: 'Local binaries -- custom tools and utilities' },
        'proc-system':    { label: '/PROC',             abbr: 'PRC', ip: 'target', os: 'Ubuntu 22.04 LTS', ports: ['N/A'], desc: 'Process and kernel information -- system enumeration' },
        'root-home':      { label: '/ROOT',             abbr: 'ROT', ip: 'target', os: 'Ubuntu 22.04 LTS', ports: ['N/A'], desc: 'Root home directory -- the final objective' },
        'backup-mount':   { label: '/MNT/BACKUP',       abbr: 'BAK', ip: 'target', os: 'Ubuntu 22.04 LTS', ports: ['N/A'], desc: 'Backup mount point -- old system snapshots' },
        'dev-shm':        { label: '/DEV/SHM',          abbr: 'SHM', ip: 'target', os: 'Ubuntu 22.04 LTS', ports: ['N/A'], desc: 'Shared memory tmpfs -- sometimes used for staging' }
    },

    traps: [],

    gates: {
        'root-home': { requires: 'privesc', message: 'Permission denied. /root is only accessible as root.' }
    },

    customState: {
        currentUser: 'user',
        suidFound: false,
        cronExploitable: false,
        sudoMisconfig: false,
        privesc: false,
        shadowRead: false
    },

    statusFields: [
        { key: 'suidFound',       label: 'SUID vector',     trueText: 'FOUND',   falseText: 'PENDING' },
        { key: 'cronExploitable', label: 'Cron vector',     trueText: 'FOUND',   falseText: 'PENDING' },
        { key: 'sudoMisconfig',   label: 'Sudo vector',     trueText: 'FOUND',   falseText: 'PENDING' },
        { key: 'privesc',         label: 'Root access',     trueText: 'ESCALATED', falseText: 'UNPRIVILEGED' },
        { key: 'shadowRead',      label: '/etc/shadow',     trueText: 'READ',    falseText: 'LOCKED' }
    ],

    objectives: [
        { id: 'enum',     label: 'ENUMERATE -- discover 4 filesystem locations',                          check: 'nodesDiscovered.size >= 4' },
        { id: 'vector',   label: 'VECTOR FOUND -- identify a privilege escalation path',                  check: 'suidFound || cronExploitable || sudoMisconfig' },
        { id: 'privesc',  label: 'ESCALATED -- gain root access via exploit',                             check: 'privesc' },
        { id: 'shadow',   label: 'SHADOW READ -- read /etc/shadow as root',                               check: 'shadowRead' },
        { id: 'flag',     label: 'FLAG CAPTURED -- retrieve flag from /root',                             check: 'nodesDiscovered.has("root-home")' }
    ],

    integrity: 3,

    completion: {
        title: 'PRIVILEGE ESCALATION',
        subtitle: 'Root achieved. System owned.',
        storageKey: 'hexworth_operator_linuxfs03'
    },

    /* ----------------------------------------------------------------
       Terminal Commands -- privesc mission, context-sensitive per node
       ---------------------------------------------------------------- */
    terminalCommands: {

        /* Override scan with filesystem language */
        'scan': {
            help: 'Survey area',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var col=s.position.col, row=s.position.row, cellType=c.grid.cells[row][col];
                e.printLine('Scanning filesystem...','system'); e.printLine('','system');
                if (cellType!=='empty'&&cellType!=='wall') { var cur=c.nodes[cellType]; e.printLine('Current: '+cur.label+' on '+cur.ip,'heading'); e.printLine(cur.desc,'info'); }
                else e.printLine('Current: Filesystem path (no notable directory)','heading');
                e.printLine('','system'); e.printLine('Adjacent:','heading');
                var dirs=[{name:'North',dc:0,dr:-1},{name:'South',dc:0,dr:1},{name:'East',dc:1,dr:0},{name:'West',dc:-1,dr:0}];
                for (var i=0;i<dirs.length;i++) {
                    var d=dirs[i],nc=col+d.dc,nr=row+d.dr;
                    if (nc<0||nc>=c.grid.cols||nr<0||nr>=c.grid.rows) { e.printLine('  '+d.name+': [filesystem boundary]','system'); continue; }
                    var type=c.grid.cells[nr][nc];
                    if (type==='wall') { e.printLine('  '+d.name+': [no path]','system'); continue; }
                    var key=nc+','+nr; if (!s.visibility[key]||s.visibility[key]==='hidden') s.visibility[key]='revealed';
                    if (type==='empty') e.printLine('  '+d.name+': Filesystem path','info');
                    else { var info=c.nodes[type]; e.printLine('  '+d.name+': '+info.label+' on '+info.ip,'node-info'); }
                }
                e.updateGrid(); e.saveState();
            }
        },

        /* Override move with filesystem language */
        'move': {
            help: 'Move (n/s/e/w)',
            syntax: 'move <dir>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: move <direction>','error'); return; }
                var dirMap={'north':[0,-1],'n':[0,-1],'south':[0,1],'s':[0,1],'east':[1,0],'e':[1,0],'west':[-1,0],'w':[-1,0]};
                var dir=args[0].toLowerCase(); if (!dirMap[dir]) { e.printLine('Unknown direction.','error'); return; }
                var d=dirMap[dir], nc=s.position.col+d[0], nr=s.position.row+d[1];
                if (nc<0||nc>=c.grid.cols||nr<0||nr>=c.grid.rows) { e.printLine('No path beyond filesystem boundary.','error'); return; }
                var cellType=c.grid.cells[nr][nc];
                if (cellType==='wall') { e.printLine('No traversable path.','error'); return; }
                /* Gate check */
                if (c.gates[cellType]) {
                    var gate=c.gates[cellType];
                    if (!s[gate.requires]) { e.printLine(gate.message,'error'); return; }
                }
                s.position={col:nc,row:nr}; s.visibility[nc+','+nr]='visited';
                if (cellType!=='empty' && c.nodes[cellType]) s.nodesDiscovered.add(cellType);
                e.revealAdjacent(nc,nr);
                var dirFull={n:'north',s:'south',e:'east',w:'west'}, dirName=dirFull[dir]||dir;
                if (cellType==='empty') e.printLine('cd '+dirName+'... filesystem path.','system');
                else { var info=c.nodes[cellType]; e.printLine('cd '+info.label,'success'); e.printLine(info.desc,'info'); }
                e.checkObjectives(); e.updateGrid(); e.saveState();
            }
        },

        /* cd alias for move */
        'cd': {
            help: 'Alias for move',
            syntax: 'cd <dir>',
            handler: function(args, ctx) {
                ctx.config.terminalCommands['move'].handler(args, ctx);
            }
        },

        /* Override help with mission-specific command list */
        'help': {
            help: 'Show this reference',
            handler: function(args, ctx) {
                var e = ctx.engine;
                e.printLine('', 'system');
                e.printLine('\u2550\u2550\u2550 COMMAND REFERENCE \u2550\u2550\u2550', 'heading');
                e.printLine('  scan              Survey area', 'info');
                e.printLine('  move <dir>        Move (n/s/e/w)', 'info');
                e.printLine('  ls                List directory contents', 'info');
                e.printLine('  cat <file>        Read a file', 'info');
                e.printLine('  find <type>       Find specific file types (suid, writable)', 'info');
                e.printLine('  sudo -l           Check sudo permissions', 'info');
                e.printLine('  id                Show current user and groups', 'info');
                e.printLine('  whoami            Show current user', 'info');
                e.printLine('  exploit <vector>  Exploit a found vector (suid, cron, sudo)', 'info');
                e.printLine('  passwd            Read /etc/passwd (shadow requires root)', 'info');
                e.printLine('  uname             Show kernel version', 'info');
                e.printLine('  status / help / clear', 'info');
            }
        },

        /* Override status with privesc-specific info */
        'status': {
            help: 'Show position and objectives',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];
                var prompt = s.privesc ? 'root@target:~# ' : 'user@target:~$ ';
                e.printLine('','system');
                e.printLine('[STATUS] User: '+(s.privesc ? 'root (uid=0)' : 'user (uid=1000)'),'info');
                e.printLine('[STATUS] Prompt: '+prompt,'info');
                e.printLine('[STATUS] Position: '+(cellType!=='empty'&&c.nodes[cellType] ? c.nodes[cellType].label : 'filesystem path'),'info');
                e.printLine('[STATUS] Dirs discovered: '+s.nodesDiscovered.size,'info');
                var vectors=0; if(s.suidFound)vectors++; if(s.cronExploitable)vectors++; if(s.sudoMisconfig)vectors++;
                e.printLine('[STATUS] Vectors found: '+vectors+'/3','info');
                e.printLine('[STATUS] Escalated: '+(s.privesc?'YES':'NO'),'info');
                var done=0; for (var i=0;i<s.objectives.length;i++) if(s.objectives[i]) done++;
                e.printLine('[STATUS] Objectives: '+done+'/'+c.objectives.length,'info');
            }
        },

        /* Context-sensitive ls */
        'ls': {
            help: 'List directory contents',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var node = c.grid.cells[s.position.row][s.position.col];
                e.printLine('','system');

                if (node==='user-home') {
                    e.printLine('total 32','system');
                    e.printLine('drwxr-xr-x  user user  Desktop/','info');
                    e.printLine('drwxr-xr-x  user user  Documents/','info');
                    e.printLine('-rw-r--r--  user user  .bashrc','info');
                    e.printLine('-rw-r--r--  user user  .bash_history','info');
                    e.printLine('-rw-r--r--  user user  notes.txt','info');
                }
                else if (node==='var-log') {
                    e.printLine('total 2.4G','system');
                    e.printLine('-rw-r-----  syslog adm   auth.log','info');
                    e.printLine('-rw-r-----  syslog adm   syslog','info');
                    e.printLine('-rw-r-----  syslog adm   kern.log','info');
                    e.printLine('-rw-r--r--  root   root  dpkg.log','info');
                    e.printLine('','system');
                    e.printLine('Hint: cat auth.log for login activity.','system');
                }
                else if (node==='etc-shadow') {
                    e.printLine('total 480','system');
                    e.printLine('-rw-r--r--  root root  passwd','info');
                    e.printLine('-rw-r-----  root shadow  shadow      <- [RESTRICTED]','warning');
                    e.printLine('-rw-r--r--  root root  sudoers','info');
                    e.printLine('-rw-r--r--  root root  hosts','info');
                    e.printLine('','system');
                    e.printLine('Hint: cat sudoers to check sudo config. shadow requires root.','system');
                }
                else if (node==='tmp-world') {
                    e.printLine('total 8','system');
                    e.printLine('-rw-rw-rw-  user   user   session.tmp','info');
                    e.printLine('-rwxr-xr-x  www    www    .php_sess','info');
                    e.printLine('drwxrwxrwx  root   root   systemd-private/','info');
                    e.printLine('','system');
                    e.printLine('[!] World-writable directory. Check for writable scripts.','warning');
                }
                else if (node==='opt-webapp') {
                    e.printLine('total 120','system');
                    e.printLine('-rw-r--r--  www  www   index.php','info');
                    e.printLine('-rw-r--r--  www  www   config.php','info');
                    e.printLine('-rw-r--r--  www  www   .env          <- [CREDENTIALS?]','warning');
                    e.printLine('drwxr-xr-x  www  www   uploads/','info');
                    e.printLine('','system');
                    e.printLine('Hint: cat .env for database credentials.','system');
                }
                else if (node==='srv-database') {
                    e.printLine('total 256','system');
                    e.printLine('-rw-r--r--  mysql mysql  my.cnf','info');
                    e.printLine('-rw-------  mysql mysql  db_backup.sql.gz','info');
                    e.printLine('-rw-r--r--  root  root   maintenance.sh','info');
                    e.printLine('','system');
                    e.printLine('Hint: cat maintenance.sh','system');
                }
                else if (node==='cron-directory') {
                    e.printLine('total 20','system');
                    e.printLine('-rw-r--r--  root root  logrotate','info');
                    e.printLine('-rw-r--r--  root root  apt-compat','info');
                    e.printLine('-rwxrwxrwx  root root  backup.sh     <- [WORLD-WRITABLE!]','warning');
                    e.printLine('-rw-r--r--  root root  certbot','info');
                    e.printLine('','system');
                    e.printLine('[!] backup.sh is world-writable but runs as root!','warning');
                    e.printLine('Hint: cat backup.sh to inspect. find writable to confirm.','system');
                }
                else if (node==='usr-local-bin') {
                    e.printLine('total 340','system');
                    e.printLine('-rwxr-xr-x  root root  docker-compose','info');
                    e.printLine('-rwsr-xr-x  root root  nmap           <- [SUID SET!]','warning');
                    e.printLine('-rwxr-xr-x  root root  node','info');
                    e.printLine('-rwxr-xr-x  root root  certbot','info');
                    e.printLine('','system');
                    e.printLine('[!] nmap has SUID bit set -- GTFOBins candidate.','warning');
                    e.printLine('Hint: find suid to enumerate.','system');
                }
                else if (node==='proc-system') {
                    e.printLine('PID    USER      COMMAND','heading');
                    e.printLine('1      root      /sbin/init','info');
                    e.printLine('312    root      /usr/sbin/sshd -D','info');
                    e.printLine('418    root      /usr/sbin/cron -f','info');
                    e.printLine('502    mysql     /usr/sbin/mysqld --basedir=/usr','info');
                    e.printLine('678    www       /usr/sbin/apache2 -k start','info');
                    e.printLine('1201   root      /bin/bash /etc/cron.d/backup.sh','warning');
                    e.printLine('','system');
                    e.printLine('[!] PID 1201: backup.sh running as root via cron.','warning');
                }
                else if (node==='root-home') {
                    e.printLine('total 16','system');
                    e.printLine('-rw-r--r--  root root  .bashrc','info');
                    e.printLine('-rw-r--r--  root root  .bash_history','info');
                    e.printLine('-rw-------  root root  flag.txt','info');
                    e.printLine('drwx------  root root  .ssh/','info');
                    e.printLine('','system');
                    e.printLine('[!] flag.txt -- the objective.','success');
                }
                else if (node==='backup-mount') {
                    e.printLine('total 512','system');
                    e.printLine('-rw-r--r--  root root  etc-shadow.bak     <- [OLD SHADOW COPY]','warning');
                    e.printLine('-rw-r--r--  root root  passwd.bak','info');
                    e.printLine('-rw-r--r--  root root  home-backup.tar.gz','info');
                    e.printLine('','system');
                    e.printLine('Hint: cat etc-shadow.bak -- old password hashes, readable!','system');
                }
                else if (node==='dev-shm') {
                    e.printLine('total 4','system');
                    e.printLine('-rw-rw-rw-  user user   .exploit_cache','info');
                    e.printLine('-rw-r--r--  root root   .kernel_info','info');
                    e.printLine('','system');
                    e.printLine('Hint: cat .kernel_info for version details.','system');
                }
                else e.printLine('ls: not at a named directory.','error');
            }
        },

        /* Context-sensitive cat */
        'cat': {
            help: 'Read a file',
            syntax: 'cat <file>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: cat <filename>','error'); return; }
                var file=args.join(' ').toLowerCase(), node=c.grid.cells[s.position.row][s.position.col];
                e.printLine('','system');

                /* /home/user */
                if (node==='user-home'&&file==='notes.txt') {
                    e.printLine('cat /home/user/notes.txt','heading');
                    e.printLine('Recon checklist:','info');
                    e.printLine('  - Check sudo permissions (sudo -l)','info');
                    e.printLine('  - Look for SUID binaries (find suid)','info');
                    e.printLine('  - Inspect cron jobs for writable scripts','info');
                    e.printLine('  - Check /opt for exposed credentials','info');
                    e.printLine('  - Enumerate kernel version (uname)','info');
                }
                else if (node==='user-home'&&file==='.bash_history') {
                    e.printLine('cat /home/user/.bash_history','heading');
                    e.printLine('sudo -l','info');
                    e.printLine('find / -perm /4000 2>/dev/null','info');
                    e.printLine('cat /opt/webapp/.env','info');
                    e.printLine('ls -la /etc/cron.d/','info');
                }
                /* /var/log */
                else if (node==='var-log'&&(file==='auth.log'||file==='auth')) {
                    e.printLine('cat /var/log/auth.log (tail -20)','heading');
                    e.printLine('Mar 11 02:14:07 target sshd: Accepted password for user from 10.0.0.50','info');
                    e.printLine('Mar 11 02:14:09 target sudo: user : TTY=pts/0 ; COMMAND=/usr/bin/vim /etc/hosts','warning');
                    e.printLine('Mar 11 03:30:01 target CRON[1201]: (root) CMD (/etc/cron.d/backup.sh)','warning');
                    e.printLine('Mar 11 04:00:01 target CRON[1305]: (root) CMD (/etc/cron.d/backup.sh)','warning');
                    e.printLine('','system');
                    e.printLine('[!] Cron running backup.sh as root every 30 min.','warning');
                    e.printLine('[!] User has sudo access to /usr/bin/vim.','warning');
                }
                /* /etc */
                else if (node==='etc-shadow'&&file==='sudoers') {
                    e.printLine('cat /etc/sudoers (readable entries)','heading');
                    e.printLine('root    ALL=(ALL:ALL) ALL','info');
                    e.printLine('user    ALL=(root) NOPASSWD: /usr/bin/vim    <- [MISCONFIGURED!]','warning');
                    e.printLine('','system');
                    e.printLine('[!] user can run vim as root with no password!','warning');
                    e.printLine('[!] GTFOBins: vim -c ":!/bin/bash" for root shell.','warning');
                    if (!s.sudoMisconfig) { s.sudoMisconfig=true; e.checkObjectives(); }
                }
                else if (node==='etc-shadow'&&file==='shadow') {
                    if (!s.privesc) {
                        e.printLine('cat: /etc/shadow: Permission denied','error');
                        e.printLine('[!] shadow file requires root access.','warning');
                    } else {
                        e.printLine('cat /etc/shadow','heading');
                        e.printLine('root:$6$rounds=5000$xK9z...:19422:0:99999:7:::','warning');
                        e.printLine('daemon:*:19422:0:99999:7:::','info');
                        e.printLine('www-data:*:19422:0:99999:7:::','info');
                        e.printLine('mysql:!:19422:0:99999:7:::','info');
                        e.printLine('user:$6$rounds=5000$aB3c...:19422:0:99999:7:::','warning');
                        e.printLine('','system');
                        e.printLine('[+] /etc/shadow read successfully as root.','success');
                        if (!s.shadowRead) { s.shadowRead=true; e.checkObjectives(); }
                    }
                }
                else if (node==='etc-shadow'&&file==='passwd') {
                    e.printLine('cat /etc/passwd','heading');
                    e.printLine('root:x:0:0:root:/root:/bin/bash','info');
                    e.printLine('daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin','info');
                    e.printLine('www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin','info');
                    e.printLine('mysql:x:27:27:MySQL Server:/var/lib/mysql:/bin/false','info');
                    e.printLine('user:x:1000:1000:user:/home/user:/bin/bash','info');
                }
                /* /opt/webapp */
                else if (node==='opt-webapp'&&(file==='.env'||file==='env')) {
                    e.printLine('cat /opt/webapp/.env','heading');
                    e.printLine('DB_HOST=localhost','info');
                    e.printLine('DB_USER=root','warning');
                    e.printLine('DB_PASS=S3cur3_R00t_P@ss!','warning');
                    e.printLine('DB_NAME=webapp_prod','info');
                    e.printLine('APP_SECRET=a1b2c3d4e5f6','info');
                    e.printLine('','system');
                    e.printLine('[!] Database root password exposed in plaintext.','warning');
                    e.printLine('[!] Password reuse? Try su root or check MySQL.','warning');
                }
                else if (node==='opt-webapp'&&file==='config.php') {
                    e.printLine('cat /opt/webapp/config.php','heading');
                    e.printLine('<?php','info');
                    e.printLine('  $db = new PDO("mysql:host=localhost;dbname=webapp_prod",','info');
                    e.printLine('    getenv("DB_USER"), getenv("DB_PASS"));','info');
                    e.printLine('?>','info');
                }
                /* /etc/cron.d */
                else if (node==='cron-directory'&&(file==='backup.sh'||file==='backup')) {
                    e.printLine('cat /etc/cron.d/backup.sh','heading');
                    e.printLine('#!/bin/bash','info');
                    e.printLine('# Backup script -- runs as root every 30 min','info');
                    e.printLine('tar czf /mnt/backup/home-backup.tar.gz /home/ 2>/dev/null','info');
                    e.printLine('cp /etc/shadow /mnt/backup/etc-shadow.bak','info');
                    e.printLine('echo "Backup complete: $(date)" >> /var/log/backup.log','info');
                    e.printLine('','system');
                    e.printLine('[!] This script is WORLD-WRITABLE and runs as ROOT.','warning');
                    e.printLine('[!] Overwrite it to execute arbitrary commands as root.','warning');
                    if (!s.cronExploitable) { s.cronExploitable=true; e.checkObjectives(); }
                }
                /* /usr/local/bin */
                else if (node==='usr-local-bin'&&file==='nmap') {
                    e.printLine('file /usr/local/bin/nmap','heading');
                    e.printLine('ELF 64-bit LSB executable, x86-64','info');
                    e.printLine('-rwsr-xr-x 1 root root 2.8M  /usr/local/bin/nmap','warning');
                    e.printLine('','system');
                    e.printLine('[!] SUID nmap -- interactive mode gives root shell.','warning');
                    e.printLine('[!] GTFOBins: nmap --interactive then !sh','warning');
                }
                /* /srv/database */
                else if (node==='srv-database'&&(file==='maintenance.sh'||file==='maintenance')) {
                    e.printLine('cat /srv/database/maintenance.sh','heading');
                    e.printLine('#!/bin/bash','info');
                    e.printLine('# DB maintenance -- run manually by admin','info');
                    e.printLine('mysql -u root -p"S3cur3_R00t_P@ss!" -e "OPTIMIZE TABLE webapp_prod.*"','warning');
                    e.printLine('','system');
                    e.printLine('[!] Root DB password hardcoded in script.','warning');
                }
                else if (node==='srv-database'&&file==='my.cnf') {
                    e.printLine('cat /srv/database/my.cnf','heading');
                    e.printLine('[mysqld]','info');
                    e.printLine('bind-address = 127.0.0.1','info');
                    e.printLine('port = 3306','info');
                    e.printLine('datadir = /var/lib/mysql','info');
                }
                /* /root (only reachable after privesc) */
                else if (node==='root-home'&&(file==='flag.txt'||file==='flag')) {
                    e.printLine('cat /root/flag.txt','heading');
                    e.printLine('','system');
                    e.printLine('FLAG{pr1v3sc_m4st3r_r00t3d}','success');
                    e.printLine('','system');
                    e.printLine('[+] FLAG CAPTURED. Mission complete.','success');
                    e.checkObjectives();
                }
                else if (node==='root-home'&&file==='.bash_history') {
                    e.printLine('cat /root/.bash_history','heading');
                    e.printLine('chmod u+s /usr/local/bin/nmap','warning');
                    e.printLine('visudo','info');
                    e.printLine('chmod 777 /etc/cron.d/backup.sh','warning');
                    e.printLine('','system');
                    e.printLine('[!] Admin left SUID on nmap, opened cron script, and edited sudoers.','warning');
                    e.printLine('[!] Three misconfigurations from one careless admin.','warning');
                }
                /* /mnt/backup */
                else if (node==='backup-mount'&&(file==='etc-shadow.bak'||file==='shadow.bak')) {
                    e.printLine('cat /mnt/backup/etc-shadow.bak','heading');
                    e.printLine('[Old shadow backup -- readable without root!]','warning');
                    e.printLine('root:$6$rounds=5000$oLd...:19300:0:99999:7:::','warning');
                    e.printLine('user:$6$rounds=5000$oLd...:19300:0:99999:7:::','warning');
                    e.printLine('','system');
                    e.printLine('[!] Old password hashes. Could be cracked offline.','warning');
                    e.printLine('[!] But current /etc/shadow requires root access.','system');
                }
                else if (node==='backup-mount'&&file==='passwd.bak') {
                    e.printLine('cat /mnt/backup/passwd.bak','heading');
                    e.printLine('root:x:0:0:root:/root:/bin/bash','info');
                    e.printLine('user:x:1000:1000:user:/home/user:/bin/bash','info');
                }
                /* /dev/shm */
                else if (node==='dev-shm'&&file==='.kernel_info') {
                    e.printLine('cat /dev/shm/.kernel_info','heading');
                    e.printLine('Linux target 5.4.0-42-generic #46-Ubuntu SMP','info');
                    e.printLine('Potentially vulnerable to CVE-2021-4034 (PwnKit)','warning');
                    e.printLine('','system');
                    e.printLine('[!] Kernel exploit possible but not needed -- find a simpler vector.','system');
                }
                else if (node==='dev-shm'&&file==='.exploit_cache') {
                    e.printLine('cat /dev/shm/.exploit_cache','heading');
                    e.printLine('# Staging notes','info');
                    e.printLine('# Vectors identified:','info');
                    e.printLine('#   1. SUID nmap in /usr/local/bin','info');
                    e.printLine('#   2. Writable cron job /etc/cron.d/backup.sh','info');
                    e.printLine('#   3. sudo vim NOPASSWD in /etc/sudoers','info');
                }
                /* /proc */
                else if (node==='proc-system'&&file==='version') {
                    e.printLine('cat /proc/version','heading');
                    e.printLine('Linux version 5.4.0-42-generic (buildd@lgw01-amd64-038)','info');
                }
                else { e.printLine('cat: '+file+': No such file or permission denied.','error'); }
                e.saveState();
            }
        },

        /* find -- search for SUID binaries or writable files */
        'find': {
            help: 'Find file types (suid, writable)',
            syntax: 'find <type>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: find suid | find writable','error'); return; }
                var query=args[0].toLowerCase(), node=c.grid.cells[s.position.row][s.position.col];
                e.printLine('','system');

                if (query==='suid'||query==='-perm') {
                    if (node==='usr-local-bin') {
                        e.printLine('find / -perm /4000 -type f 2>/dev/null','heading');
                        e.printLine('/usr/bin/passwd','info');
                        e.printLine('/usr/bin/sudo','info');
                        e.printLine('/usr/bin/mount','info');
                        e.printLine('/usr/local/bin/nmap              <- [NON-STANDARD SUID]','warning');
                        e.printLine('','system');
                        e.printLine('[!] nmap with SUID -- exploit via interactive mode.','warning');
                        if (!s.suidFound) { s.suidFound=true; e.checkObjectives(); }
                    } else {
                        e.printLine('find: run from /USR/LOCAL/BIN for best results.','system');
                        e.printLine('Standard SUID binaries: /usr/bin/passwd, /usr/bin/sudo, /usr/bin/mount','info');
                    }
                }
                else if (query==='writable'||query==='-writable') {
                    if (node==='cron-directory') {
                        e.printLine('find /etc/cron.d -writable -type f 2>/dev/null','heading');
                        e.printLine('/etc/cron.d/backup.sh   -rwxrwxrwx  root  root','warning');
                        e.printLine('','system');
                        e.printLine('[!] backup.sh is writable by any user and executed as root by cron.','warning');
                        if (!s.cronExploitable) { s.cronExploitable=true; e.checkObjectives(); }
                    } else {
                        e.printLine('find: try from /ETC/CRON.D to find writable cron jobs.','system');
                    }
                }
                else {
                    e.printLine('find: supported searches: suid, writable','system');
                }
                e.saveState();
            }
        },

        /* sudo -- check sudo permissions */
        'sudo': {
            help: 'Check sudo permissions',
            syntax: 'sudo -l',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                e.printLine('','system');
                if (args.length && args[0]==='-l') {
                    e.printLine('sudo -l','heading');
                    e.printLine('Matching Defaults entries for user on target:','info');
                    e.printLine('    env_reset, mail_badpass','info');
                    e.printLine('','system');
                    e.printLine('User user may run the following commands on target:','info');
                    e.printLine('    (root) NOPASSWD: /usr/bin/vim    <- [MISCONFIGURED!]','warning');
                    e.printLine('','system');
                    e.printLine('[!] user can run vim as root without a password.','warning');
                    e.printLine('[!] GTFOBins: sudo vim -c ":!/bin/bash"','warning');
                    if (!s.sudoMisconfig) { s.sudoMisconfig=true; e.checkObjectives(); }
                } else {
                    e.printLine('Usage: sudo -l (check permissions)','system');
                    e.printLine('Exploits are done via the "exploit" command.','system');
                }
                e.saveState();
            }
        },

        /* id -- show current user */
        'id': {
            help: 'Show current user and groups',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state;
                if (s.privesc) {
                    e.printLine('uid=0(root) gid=0(root) groups=0(root)','success');
                } else {
                    e.printLine('uid=1000(user) gid=1000(user) groups=1000(user),27(sudo)','info');
                }
            }
        },

        /* whoami -- show current user */
        'whoami': {
            help: 'Show current user',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state;
                if (s.privesc) {
                    e.printLine('root','success');
                } else {
                    e.printLine('user','info');
                }
            }
        },

        /* exploit -- execute a privesc vector */
        'exploit': {
            help: 'Exploit a found vector',
            syntax: 'exploit <vector>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: exploit <suid|cron|sudo>','error'); return; }
                var vector=args[0].toLowerCase();
                e.printLine('','system');

                if (s.privesc) {
                    e.printLine('[+] Already running as root.','success');
                    return;
                }

                if (vector==='suid'||vector==='nmap') {
                    if (!s.suidFound) { e.printLine('exploit: SUID vector not yet discovered. Enumerate first.','error'); return; }
                    e.printLine('Exploiting SUID nmap...','system');
                    e.printLine('$ /usr/local/bin/nmap --interactive','info');
                    e.printLine('nmap> !sh','info');
                    e.printLine('# whoami','info');
                    e.printLine('root','success');
                    e.printLine('','system');
                    e.printLine('[+] PRIVILEGE ESCALATION SUCCESSFUL via SUID nmap.','success');
                    e.printLine('[+] You are now root. Prompt: root@target:~#','success');
                    s.privesc=true; s.currentUser='root';
                    e.checkObjectives();
                }
                else if (vector==='cron'||vector==='cronjob') {
                    if (!s.cronExploitable) { e.printLine('exploit: Writable cron vector not yet discovered. Enumerate first.','error'); return; }
                    e.printLine('Exploiting writable cron job...','system');
                    e.printLine('$ echo "cp /bin/bash /tmp/rootbash && chmod u+s /tmp/rootbash" > /etc/cron.d/backup.sh','info');
                    e.printLine('[*] Waiting for cron execution (30 min cycle)...','system');
                    e.printLine('[*] /tmp/rootbash created with SUID bit.','info');
                    e.printLine('$ /tmp/rootbash -p','info');
                    e.printLine('# whoami','info');
                    e.printLine('root','success');
                    e.printLine('','system');
                    e.printLine('[+] PRIVILEGE ESCALATION SUCCESSFUL via writable cron job.','success');
                    e.printLine('[+] You are now root. Prompt: root@target:~#','success');
                    s.privesc=true; s.currentUser='root';
                    e.checkObjectives();
                }
                else if (vector==='sudo'||vector==='vim') {
                    if (!s.sudoMisconfig) { e.printLine('exploit: Sudo misconfiguration not yet discovered. Enumerate first.','error'); return; }
                    e.printLine('Exploiting sudo vim NOPASSWD...','system');
                    e.printLine('$ sudo vim -c ":!/bin/bash"','info');
                    e.printLine('# whoami','info');
                    e.printLine('root','success');
                    e.printLine('','system');
                    e.printLine('[+] PRIVILEGE ESCALATION SUCCESSFUL via sudo vim escape.','success');
                    e.printLine('[+] You are now root. Prompt: root@target:~#','success');
                    s.privesc=true; s.currentUser='root';
                    e.checkObjectives();
                }
                else {
                    e.printLine('exploit: unknown vector "'+vector+'". Try: suid, cron, sudo','error');
                }
                e.saveState();
            }
        },

        /* passwd -- read /etc/passwd or /etc/shadow */
        'passwd': {
            help: 'Read /etc/passwd (shadow requires root)',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state;
                e.printLine('','system');
                e.printLine('cat /etc/passwd','heading');
                e.printLine('root:x:0:0:root:/root:/bin/bash','info');
                e.printLine('daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin','info');
                e.printLine('www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin','info');
                e.printLine('mysql:x:27:27:MySQL Server:/var/lib/mysql:/bin/false','info');
                e.printLine('user:x:1000:1000:user:/home/user:/bin/bash','info');
                e.printLine('','system');
                if (s.privesc) {
                    e.printLine('Use "cat shadow" at /ETC to read /etc/shadow as root.','system');
                } else {
                    e.printLine('/etc/shadow requires root access. Escalate first.','warning');
                }
            }
        },

        /* uname -- show kernel version */
        'uname': {
            help: 'Show kernel version',
            handler: function(args, ctx) {
                var e = ctx.engine;
                e.printLine('Linux target 5.4.0-42-generic #46-Ubuntu SMP x86_64','info');
                e.printLine('','system');
                e.printLine('[!] Kernel 5.4.0-42 -- potentially vulnerable to PwnKit (CVE-2021-4034).','warning');
                e.printLine('[!] Kernel exploits are noisy. Look for simpler vectors first.','system');
            }
        }
    }
};
