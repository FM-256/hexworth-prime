/**
 * LinuxTerminal.js - Comprehensive Linux Terminal Simulator
 * Hexworth Prime - Script House
 *
 * A full-featured terminal engine for Linux labs.
 * Includes virtual filesystem, 40+ commands, pipes, redirection, and more.
 *
 * Usage:
 *   const terminal = new LinuxTerminal({
 *       container: '#terminal',
 *       inputElement: '#commandInput',
 *       user: 'student',
 *       hostname: 'hexworth',
 *       onCommand: (cmd, output) => { // callback for task checking }
 *   });
 *
 * Version: 1.0.0
 * Created: December 27, 2025
 */

class LinuxTerminal {
    constructor(options = {}) {
        // Configuration
        this.config = {
            container: options.container || '#terminal',
            inputElement: options.inputElement || '#commandInput',
            promptElement: options.promptElement || null,
            user: options.user || 'student',
            hostname: options.hostname || 'hexworth',
            startDir: options.startDir || '/home/student',
            onCommand: options.onCommand || null,
            onOutput: options.onOutput || null,
        };

        // State
        this.currentDir = this.config.startDir;
        this.commandHistory = [];
        this.historyIndex = -1;
        this.env = this._initEnv();
        this.fs = this._initFilesystem();

        // User info
        this.currentUser = {
            username: this.config.user,
            uid: 1000,
            gid: 1000,
            groups: [
                { gid: 1000, name: this.config.user },
                { gid: 27, name: 'sudo' },
                { gid: 100, name: 'users' },
                { gid: 999, name: 'docker' },
                { gid: 998, name: 'www-data' }
            ],
            home: `/home/${this.config.user}`,
            shell: '/bin/bash'
        };

        // Initialize
        this._init();
    }

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    _init() {
        this.containerEl = document.querySelector(this.config.container);
        this.inputEl = document.querySelector(this.config.inputElement);

        if (!this.containerEl || !this.inputEl) {
            console.error('LinuxTerminal: Container or input element not found');
            return;
        }

        this._setupEventListeners();
        this._updatePrompt();
    }

    _setupEventListeners() {
        this.inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.execute(this.inputEl.value);
                this.inputEl.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this._historyUp();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this._historyDown();
            } else if (e.key === 'Tab') {
                e.preventDefault();
                this._tabComplete();
            } else if (e.key === 'c' && e.ctrlKey) {
                e.preventDefault();
                this._interrupt();
            } else if (e.key === 'l' && e.ctrlKey) {
                e.preventDefault();
                this.clear();
            }
        });

        // Keep focus on input
        document.addEventListener('click', (e) => {
            if (!e.target.closest('a, button, .learning-panel')) {
                this.inputEl.focus();
            }
        });
    }

    _initEnv() {
        return {
            USER: this.config.user,
            HOME: `/home/${this.config.user}`,
            PWD: this.config.startDir,
            SHELL: '/bin/bash',
            PATH: '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
            TERM: 'xterm-256color',
            LANG: 'en_US.UTF-8',
            HOSTNAME: this.config.hostname,
            PS1: '\\u@\\h:\\w\\$ ',
            EDITOR: 'nano',
            LOGNAME: this.config.user
        };
    }

    _initFilesystem() {
        // Virtual filesystem structure
        return {
            '/': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['home', 'etc', 'var', 'tmp', 'usr', 'bin', 'sbin', 'opt', 'root', 'dev', 'proc'] },
            '/home': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['student'] },
            '/home/student': { type: 'dir', perms: 'drwxr-xr-x', owner: 'student', group: 'student', children: ['Documents', 'Downloads', 'scripts', '.bashrc', '.profile', 'notes.txt', 'readme.md'] },
            '/home/student/Documents': { type: 'dir', perms: 'drwxr-xr-x', owner: 'student', group: 'student', children: ['report.txt', 'data.csv', 'project'] },
            '/home/student/Documents/project': { type: 'dir', perms: 'drwxr-xr-x', owner: 'student', group: 'student', children: ['main.py', 'config.json', 'README.md'] },
            '/home/student/Documents/report.txt': { type: 'file', perms: '-rw-r--r--', owner: 'student', group: 'student', size: 2048, content: 'Quarterly Report Q4 2025\n========================\n\nExecutive Summary:\nThis report covers system administration activities.\n\nKey Metrics:\n- Uptime: 99.9%\n- Security incidents: 0\n- Patches applied: 47\n\nRecommendations:\n1. Upgrade kernel to 6.x series\n2. Implement automated backups\n3. Review firewall rules\n' },
            '/home/student/Documents/data.csv': { type: 'file', perms: '-rw-r--r--', owner: 'student', group: 'student', size: 512, content: 'id,name,value,status\n1,alpha,100,active\n2,beta,200,inactive\n3,gamma,150,active\n4,delta,300,active\n5,epsilon,50,inactive\n' },
            '/home/student/Documents/project/main.py': { type: 'file', perms: '-rwxr-xr-x', owner: 'student', group: 'student', size: 1024, content: '#!/usr/bin/env python3\n"""Main application entry point."""\n\nimport sys\nimport config\n\ndef main():\n    print("Hello from Hexworth!")\n    return 0\n\nif __name__ == "__main__":\n    sys.exit(main())\n' },
            '/home/student/Documents/project/config.json': { type: 'file', perms: '-rw-r--r--', owner: 'student', group: 'student', size: 256, content: '{\n  "app_name": "hexworth-demo",\n  "version": "1.0.0",\n  "debug": false,\n  "port": 8080\n}\n' },
            '/home/student/Documents/project/README.md': { type: 'file', perms: '-rw-r--r--', owner: 'student', group: 'student', size: 384, content: '# Project README\n\nA sample project for learning Linux commands.\n\n## Usage\n\n```bash\npython3 main.py\n```\n\n## License\n\nMIT\n' },
            '/home/student/Downloads': { type: 'dir', perms: 'drwxr-xr-x', owner: 'student', group: 'student', children: ['archive.tar.gz', 'image.png', 'installer.sh'] },
            '/home/student/Downloads/archive.tar.gz': { type: 'file', perms: '-rw-r--r--', owner: 'student', group: 'student', size: 15360, content: '[binary data]' },
            '/home/student/Downloads/image.png': { type: 'file', perms: '-rw-r--r--', owner: 'student', group: 'student', size: 24576, content: '[binary data]' },
            '/home/student/Downloads/installer.sh': { type: 'file', perms: '-rwxr-xr-x', owner: 'student', group: 'student', size: 4096, content: '#!/bin/bash\necho "Installing..."\nsleep 2\necho "Done!"\n' },
            '/home/student/scripts': { type: 'dir', perms: 'drwxr-xr-x', owner: 'student', group: 'student', children: ['backup.sh', 'monitor.sh', 'deploy.sh'] },
            '/home/student/scripts/backup.sh': { type: 'file', perms: '-rwxr-xr-x', owner: 'student', group: 'student', size: 512, content: '#!/bin/bash\n# Backup script\ntar -czf backup_$(date +%Y%m%d).tar.gz ~/Documents\necho "Backup complete"\n' },
            '/home/student/scripts/monitor.sh': { type: 'file', perms: '-rwxr-xr-x', owner: 'student', group: 'student', size: 384, content: '#!/bin/bash\n# System monitor\necho "CPU: $(uptime)"\necho "Memory: $(free -h | grep Mem)"\necho "Disk: $(df -h / | tail -1)"\n' },
            '/home/student/scripts/deploy.sh': { type: 'file', perms: '-rwxr-xr-x', owner: 'student', group: 'student', size: 256, content: '#!/bin/bash\necho "Deploying application..."\ncd ~/Documents/project\npython3 main.py\n' },
            '/home/student/.bashrc': { type: 'file', perms: '-rw-r--r--', owner: 'student', group: 'student', size: 3024, content: '# ~/.bashrc\nexport PATH=$PATH:~/bin\nalias ll="ls -la"\nalias la="ls -A"\nalias l="ls -CF"\n' },
            '/home/student/.profile': { type: 'file', perms: '-rw-r--r--', owner: 'student', group: 'student', size: 807, content: '# ~/.profile\nif [ -f ~/.bashrc ]; then\n    . ~/.bashrc\nfi\n' },
            '/home/student/notes.txt': { type: 'file', perms: '-rw-r--r--', owner: 'student', group: 'student', size: 256, content: 'Linux Learning Notes\n====================\n\n1. Use man pages for help\n2. Tab completion saves time\n3. History with arrow keys\n4. Ctrl+C to interrupt\n5. Ctrl+L to clear screen\n' },
            '/home/student/readme.md': { type: 'file', perms: '-rw-r--r--', owner: 'student', group: 'student', size: 128, content: '# Welcome to Hexworth Linux Labs\n\nThis is your home directory. Explore and learn!\n' },
            '/etc': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['passwd', 'group', 'shadow', 'hostname', 'hosts', 'resolv.conf', 'fstab'] },
            '/etc/passwd': { type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 1024, content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\nstudent:x:1000:1000:Student User:/home/student:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\n' },
            '/etc/group': { type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 512, content: 'root:x:0:\nstudent:x:1000:student\nsudo:x:27:student\nusers:x:100:student\ndocker:x:999:student\nwww-data:x:998:student\n' },
            '/etc/shadow': { type: 'file', perms: '-rw-------', owner: 'root', group: 'shadow', size: 256, content: '[Permission denied - requires root]' },
            '/etc/hostname': { type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 16, content: 'hexworth\n' },
            '/etc/hosts': { type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 256, content: '127.0.0.1\tlocalhost\n127.0.1.1\thexworth\n::1\t\tlocalhost ip6-localhost ip6-loopback\n' },
            '/etc/resolv.conf': { type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 64, content: 'nameserver 8.8.8.8\nnameserver 8.8.4.4\n' },
            '/etc/fstab': { type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 512, content: '# /etc/fstab: static file system information.\nUUID=abc-123 /               ext4    errors=remount-ro 0       1\nUUID=def-456 /home           ext4    defaults          0       2\n' },
            '/var': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['log', 'www', 'tmp'] },
            '/var/log': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['syslog', 'auth.log', 'dmesg'] },
            '/var/log/syslog': { type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm', size: 8192, content: 'Dec 27 09:00:01 hexworth CRON[1234]: (root) CMD (test -x /usr/sbin/anacron)\nDec 27 09:15:22 hexworth systemd[1]: Started Daily apt download activities.\nDec 27 09:30:45 hexworth kernel: [UFW BLOCK] IN=eth0 OUT= SRC=192.168.1.100\n' },
            '/var/log/auth.log': { type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm', size: 4096, content: 'Dec 27 08:30:00 hexworth sshd[5678]: Accepted publickey for student\nDec 27 08:30:00 hexworth systemd-logind[890]: New session 1 of user student.\nDec 27 08:45:12 hexworth sudo: student : TTY=pts/0 ; PWD=/home/student ; USER=root ; COMMAND=/bin/apt update\n' },
            '/var/log/dmesg': { type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm', size: 2048, content: '[    0.000000] Linux version 6.1.0-hexworth\n[    0.000001] Command line: BOOT_IMAGE=/vmlinuz\n[    0.523456] CPU: 4 cores detected\n[    1.234567] Memory: 8192MB available\n' },
            '/var/www': { type: 'dir', perms: 'drwxr-xr-x', owner: 'www-data', group: 'www-data', children: ['html'] },
            '/var/www/html': { type: 'dir', perms: 'drwxr-xr-x', owner: 'www-data', group: 'www-data', children: ['index.html'] },
            '/var/www/html/index.html': { type: 'file', perms: '-rw-r--r--', owner: 'www-data', group: 'www-data', size: 256, content: '<!DOCTYPE html>\n<html>\n<head><title>Welcome</title></head>\n<body><h1>It works!</h1></body>\n</html>\n' },
            '/var/tmp': { type: 'dir', perms: 'drwxrwxrwt', owner: 'root', group: 'root', children: [] },
            '/tmp': { type: 'dir', perms: 'drwxrwxrwt', owner: 'root', group: 'root', children: ['session.tmp'] },
            '/tmp/session.tmp': { type: 'file', perms: '-rw-------', owner: 'student', group: 'student', size: 64, content: 'session_id=abc123\n' },
            '/usr': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['bin', 'sbin', 'lib', 'share', 'local'] },
            '/usr/bin': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['python3', 'vim', 'git', 'curl', 'wget'] },
            '/usr/sbin': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: [] },
            '/usr/lib': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: [] },
            '/usr/share': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['man', 'doc'] },
            '/usr/share/man': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: [] },
            '/usr/share/doc': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: [] },
            '/usr/local': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['bin', 'lib'] },
            '/usr/local/bin': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: [] },
            '/usr/local/lib': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: [] },
            '/bin': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['bash', 'sh', 'ls', 'cat', 'cp', 'mv', 'rm', 'mkdir', 'rmdir'] },
            '/sbin': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['init', 'shutdown', 'reboot'] },
            '/opt': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: [] },
            '/root': { type: 'dir', perms: 'drwx------', owner: 'root', group: 'root', children: [] },
            '/dev': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['null', 'zero', 'random', 'tty'] },
            '/proc': { type: 'dir', perms: 'dr-xr-xr-x', owner: 'root', group: 'root', children: ['cpuinfo', 'meminfo', 'version', 'uptime'] },
            '/proc/cpuinfo': { type: 'file', perms: '-r--r--r--', owner: 'root', group: 'root', size: 1024, content: 'processor\t: 0\nvendor_id\t: GenuineIntel\nmodel name\t: Intel Core i7-9700K\ncpu MHz\t\t: 3600.000\ncache size\t: 12288 KB\ncpu cores\t: 8\n' },
            '/proc/meminfo': { type: 'file', perms: '-r--r--r--', owner: 'root', group: 'root', size: 512, content: 'MemTotal:        8192000 kB\nMemFree:         4096000 kB\nMemAvailable:    6144000 kB\nBuffers:          512000 kB\nCached:          1024000 kB\n' },
            '/proc/version': { type: 'file', perms: '-r--r--r--', owner: 'root', group: 'root', size: 128, content: 'Linux version 6.1.0-hexworth (gcc version 12.2.0) #1 SMP PREEMPT_DYNAMIC\n' },
            '/proc/uptime': { type: 'file', perms: '-r--r--r--', owner: 'root', group: 'root', size: 32, content: '86400.00 172800.00\n' }
        };
    }

    // ═══════════════════════════════════════════════════════════════
    // COMMAND EXECUTION
    // ═══════════════════════════════════════════════════════════════

    execute(cmdLine) {
        cmdLine = cmdLine.trim();
        if (!cmdLine) return;

        // Add to history
        this.commandHistory.push(cmdLine);
        this.historyIndex = this.commandHistory.length;

        // Display command
        this._appendLine(`<span class="prompt">${this._getPrompt()}</span> <span class="command">${this._escape(cmdLine)}</span>`);

        // Handle pipes
        if (cmdLine.includes('|')) {
            this._executePipeline(cmdLine);
            return;
        }

        // Handle output redirection
        if (cmdLine.includes('>')) {
            this._executeRedirect(cmdLine);
            return;
        }

        // Parse and execute single command
        const { cmd, args } = this._parseCommand(cmdLine);
        const output = this._executeCommand(cmd, args, cmdLine);

        if (output !== null && output !== undefined) {
            this._appendOutput(output);
        }

        // Scroll to bottom
        this.containerEl.scrollTop = this.containerEl.scrollHeight;

        // Callback
        if (this.config.onCommand) {
            this.config.onCommand(cmdLine, output, cmd, args);
        }
    }

    _parseCommand(cmdLine) {
        // Handle quoted strings
        const parts = [];
        let current = '';
        let inQuote = false;
        let quoteChar = '';

        for (let i = 0; i < cmdLine.length; i++) {
            const char = cmdLine[i];
            if ((char === '"' || char === "'") && !inQuote) {
                inQuote = true;
                quoteChar = char;
            } else if (char === quoteChar && inQuote) {
                inQuote = false;
                quoteChar = '';
            } else if (char === ' ' && !inQuote) {
                if (current) {
                    parts.push(current);
                    current = '';
                }
            } else {
                current += char;
            }
        }
        if (current) parts.push(current);

        // Expand environment variables
        const expanded = parts.map(p => this._expandVars(p));

        return {
            cmd: expanded[0] || '',
            args: expanded.slice(1)
        };
    }

    _expandVars(str) {
        return str.replace(/\$(\w+)/g, (match, varName) => {
            return this.env[varName] || '';
        }).replace(/\$\{(\w+)\}/g, (match, varName) => {
            return this.env[varName] || '';
        });
    }

    _executeCommand(cmd, args, fullLine) {
        // Check for --help flag
        if (args.includes('--help') || args.includes('-h')) {
            return this._getHelp(cmd);
        }

        switch (cmd) {
            // ─────────────── Navigation ───────────────
            case 'pwd':
                return this.currentDir;

            case 'cd':
                return this._cd(args);

            case 'ls':
                return this._ls(args);

            // ─────────────── File Operations ───────────────
            case 'cat':
                return this._cat(args);

            case 'head':
                return this._head(args);

            case 'tail':
                return this._tail(args);

            case 'less':
            case 'more':
                return this._cat(args); // Simplified

            case 'touch':
                return this._touch(args);

            case 'mkdir':
                return this._mkdir(args);

            case 'rm':
                return this._rm(args);

            case 'rmdir':
                return this._rmdir(args);

            case 'cp':
                return this._cp(args);

            case 'mv':
                return this._mv(args);

            case 'file':
                return this._file(args);

            case 'stat':
                return this._stat(args);

            // ─────────────── Search ───────────────
            case 'find':
                return this._find(args);

            case 'grep':
                return this._grep(args);

            case 'which':
                return this._which(args);

            case 'whereis':
                return this._whereis(args);

            case 'locate':
                return '<span class="error">locate: database not available in simulation</span>';

            // ─────────────── User Info ───────────────
            case 'whoami':
                return this.currentUser.username;

            case 'id':
                return this._id(args);

            case 'groups':
                return this._groups(args);

            case 'who':
                return `${this.currentUser.username}  pts/0        Dec 27 09:00 (:0)`;

            case 'w':
                return ` 09:30:00 up 1 day,  2:30,  1 user,  load average: 0.15, 0.10, 0.05
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT
${this.currentUser.username}  pts/0    :0               09:00    0.00s  0.05s  0.01s bash`;

            case 'users':
                return this.currentUser.username;

            case 'last':
                return `${this.currentUser.username}  pts/0        :0               Dec 27 09:00   still logged in
reboot   system boot  6.1.0-hexworth   Dec 27 06:30   still running`;

            // ─────────────── System Info ───────────────
            case 'uname':
                return this._uname(args);

            case 'hostname':
                return this.config.hostname;

            case 'uptime':
                return ' 09:30:00 up 1 day,  2:30,  1 user,  load average: 0.15, 0.10, 0.05';

            case 'date':
                return new Date().toString();

            case 'cal':
                return this._cal();

            case 'df':
                return this._df(args);

            case 'du':
                return this._du(args);

            case 'free':
                return this._free(args);

            case 'ps':
                return this._ps(args);

            case 'top':
                return '<span class="output">top - 09:30:00 up 1 day, 1 user, load average: 0.15, 0.10, 0.05\nTasks: 127 total, 1 running, 126 sleeping\n%Cpu(s): 2.3 us, 1.0 sy, 0.0 ni, 96.5 id\nMiB Mem: 8000.0 total, 4000.0 free, 2000.0 used\n\n  PID USER      PR  NI    VIRT    RES  COMMAND\n    1 root      20   0  168940  11340  systemd\n  890 student   20   0   18520   3940  bash\n</span><span class="highlight">[Press q to exit - simulated]</span>';

            case 'htop':
                return '<span class="error">htop: command not installed. Try: sudo apt install htop</span>';

            // ─────────────── Text Processing ───────────────
            case 'echo':
                return args.join(' ');

            case 'printf':
                return args.join(' ').replace(/\\n/g, '\n').replace(/\\t/g, '\t');

            case 'wc':
                return this._wc(args);

            case 'sort':
                return this._sort(args);

            case 'uniq':
                return this._uniq(args);

            case 'cut':
                return this._cut(args);

            case 'tr':
                return this._tr(args);

            case 'sed':
                return '<span class="highlight">sed: stream editing simulated - see man sed for usage</span>';

            case 'awk':
                return '<span class="highlight">awk: text processing simulated - see man awk for usage</span>';

            // ─────────────── Permissions ───────────────
            case 'chmod':
                return this._chmod(args);

            case 'chown':
                return this._chown(args);

            case 'chgrp':
                return this._chgrp(args);

            case 'umask':
                return args.length ? '<span class="success">umask set</span>' : '0022';

            // ─────────────── Environment ───────────────
            case 'env':
            case 'printenv':
                return Object.entries(this.env).map(([k, v]) => `${k}=${v}`).join('\n');

            case 'export':
                return this._export(args);

            case 'set':
                return Object.entries(this.env).map(([k, v]) => `${k}=${v}`).join('\n');

            case 'unset':
                if (args[0]) delete this.env[args[0]];
                return null;

            // ─────────────── Help & Docs ───────────────
            case 'help':
                return this._help();

            case 'man':
                return this._man(args);

            case 'info':
                return this._man(args);

            case 'type':
                return this._type(args);

            case 'alias':
                return 'll=\'ls -la\'\nla=\'ls -A\'\nl=\'ls -CF\'';

            // ─────────────── History ───────────────
            case 'history':
                return this.commandHistory.map((c, i) => `  ${i + 1}  ${c}`).join('\n');

            // ─────────────── Terminal ───────────────
            case 'clear':
                this.clear();
                return null;

            case 'reset':
                this.clear();
                return null;

            case 'exit':
            case 'logout':
                return '<span class="highlight">logout: cannot exit simulated terminal</span>';

            // ─────────────── Network (simulated) ───────────────
            case 'ping':
                return `PING ${args[0] || 'localhost'} (127.0.0.1): 56 data bytes\n64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.1 ms\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.1 ms\n--- ${args[0] || 'localhost'} ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss`;

            case 'ifconfig':
            case 'ip':
                return `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::1  prefixlen 64  scopeid 0x20<link>
        ether 00:11:22:33:44:55  txqueuelen 1000

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>`;

            case 'netstat':
            case 'ss':
                return `Netid  State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port
tcp    LISTEN  0       128     0.0.0.0:22            0.0.0.0:*
tcp    LISTEN  0       128     0.0.0.0:80            0.0.0.0:*
tcp    ESTAB   0       0       192.168.1.100:22      192.168.1.1:54321`;

            case 'curl':
            case 'wget':
                return '<span class="highlight">Network commands simulated - would download from ' + (args[0] || 'URL') + '</span>';

            // ─────────────── Package Management (simulated) ───────────────
            case 'apt':
            case 'apt-get':
                return '<span class="highlight">apt: package management simulated - requires sudo</span>';

            case 'dpkg':
                return '<span class="highlight">dpkg: package query simulated</span>';

            case 'sudo':
                return this._sudo(args);

            // ─────────────── Miscellaneous ───────────────
            case 'sleep':
                return `<span class="highlight">sleep: would wait ${args[0] || 1} seconds</span>`;

            case 'true':
                return null;

            case 'false':
                return null;

            case 'yes':
                return 'y\ny\ny\n<span class="highlight">[interrupted - infinite output]</span>';

            case 'seq':
                const start = parseInt(args[0]) || 1;
                const end = parseInt(args[1]) || parseInt(args[0]) || 10;
                return Array.from({ length: Math.min(end - start + 1, 20) }, (_, i) => start + i).join('\n');

            case 'time':
                return `real\t0m0.001s\nuser\t0m0.000s\nsys\t0m0.001s`;

            case 'xargs':
                return '<span class="highlight">xargs: would build and execute command lines</span>';

            case 'tee':
                return '<span class="highlight">tee: would write to file and stdout</span>';

            case 'tar':
                return '<span class="highlight">tar: archive operations simulated</span>';

            case 'gzip':
            case 'gunzip':
            case 'zip':
            case 'unzip':
                return '<span class="highlight">Compression operations simulated</span>';

            case 'ln':
                return this._ln(args);

            case 'readlink':
                return '<span class="highlight">readlink: would show symlink target</span>';

            case 'basename':
                return args[0] ? args[0].split('/').pop() : '';

            case 'dirname':
                return args[0] ? args[0].split('/').slice(0, -1).join('/') || '/' : '.';

            case 'realpath':
                return this._resolvePath(args[0] || '.');

            default:
                // Check if it's an assignment (VAR=value)
                if (cmd.includes('=')) {
                    const [varName, ...valueParts] = cmd.split('=');
                    this.env[varName] = valueParts.join('=');
                    return null;
                }
                return `<span class="error">${this._escape(cmd)}: command not found</span>`;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // COMMAND IMPLEMENTATIONS
    // ═══════════════════════════════════════════════════════════════

    _cd(args) {
        let target = args[0] || this.currentUser.home;

        // Handle special paths
        if (target === '~') target = this.currentUser.home;
        if (target === '-') target = this.env.OLDPWD || this.currentDir;
        if (target.startsWith('~/')) target = this.currentUser.home + target.slice(1);

        const newPath = this._resolvePath(target);
        const node = this.fs[newPath];

        if (!node) {
            return `<span class="error">cd: ${target}: No such file or directory</span>`;
        }
        if (node.type !== 'dir') {
            return `<span class="error">cd: ${target}: Not a directory</span>`;
        }

        this.env.OLDPWD = this.currentDir;
        this.currentDir = newPath;
        this.env.PWD = newPath;
        this._updatePrompt();
        return null;
    }

    _ls(args) {
        let showAll = false;
        let longFormat = false;
        let humanReadable = false;
        let targetPaths = [];

        // Parse flags
        for (const arg of args) {
            if (arg.startsWith('-')) {
                if (arg.includes('a')) showAll = true;
                if (arg.includes('l')) longFormat = true;
                if (arg.includes('h')) humanReadable = true;
                if (arg.includes('A')) showAll = true;
            } else {
                targetPaths.push(arg);
            }
        }

        if (targetPaths.length === 0) targetPaths.push('.');

        const results = [];
        for (const targetPath of targetPaths) {
            const path = this._resolvePath(targetPath);
            const node = this.fs[path];

            if (!node) {
                results.push(`<span class="error">ls: cannot access '${targetPath}': No such file or directory</span>`);
                continue;
            }

            if (node.type === 'file') {
                if (longFormat) {
                    results.push(this._formatLsLong(path, node));
                } else {
                    results.push(path.split('/').pop());
                }
                continue;
            }

            let items = [...(node.children || [])];
            if (showAll) {
                items = ['.', '..', ...items];
            } else {
                items = items.filter(i => !i.startsWith('.'));
            }

            if (longFormat) {
                results.push(`total ${items.length * 4}`);
                for (const item of items) {
                    if (item === '.') {
                        results.push(this._formatLsLong(path, node));
                    } else if (item === '..') {
                        const parentPath = path.split('/').slice(0, -1).join('/') || '/';
                        results.push(this._formatLsLong(parentPath, this.fs[parentPath] || node));
                    } else {
                        const itemPath = path === '/' ? `/${item}` : `${path}/${item}`;
                        const itemNode = this.fs[itemPath];
                        if (itemNode) {
                            results.push(this._formatLsLong(itemPath, itemNode));
                        }
                    }
                }
            } else {
                // Colorize output
                const colored = items.map(item => {
                    const itemPath = path === '/' ? `/${item}` : `${path}/${item}`;
                    const itemNode = this.fs[itemPath];
                    if (item === '.' || item === '..') return `<span class="dir">${item}</span>`;
                    if (!itemNode) return item;
                    if (itemNode.type === 'dir') return `<span class="dir">${item}/</span>`;
                    if (itemNode.perms && itemNode.perms.includes('x')) return `<span class="exec">${item}*</span>`;
                    return item;
                });
                results.push(colored.join('  '));
            }
        }

        return results.join('\n');
    }

    _formatLsLong(path, node) {
        const name = path.split('/').pop() || '/';
        const size = (node.size || 4096).toString().padStart(8);
        const date = 'Dec 27 09:00';
        let displayName = name;

        if (node.type === 'dir') {
            displayName = `<span class="dir">${name}</span>`;
        } else if (node.perms && node.perms.includes('x')) {
            displayName = `<span class="exec">${name}</span>`;
        }

        return `${node.perms} 1 ${node.owner.padEnd(8)} ${node.group.padEnd(8)} ${size} ${date} ${displayName}`;
    }

    _cat(args) {
        if (args.length === 0) {
            return '<span class="highlight">cat: reading from stdin (Ctrl+C to exit)</span>';
        }

        const results = [];
        for (const arg of args) {
            if (arg.startsWith('-')) continue;
            const path = this._resolvePath(arg);
            const node = this.fs[path];

            if (!node) {
                results.push(`<span class="error">cat: ${arg}: No such file or directory</span>`);
            } else if (node.type === 'dir') {
                results.push(`<span class="error">cat: ${arg}: Is a directory</span>`);
            } else {
                results.push(node.content || '');
            }
        }
        return results.join('\n');
    }

    _head(args) {
        let lines = 10;
        let files = [];

        for (let i = 0; i < args.length; i++) {
            if (args[i] === '-n' && args[i + 1]) {
                lines = parseInt(args[i + 1]);
                i++;
            } else if (!args[i].startsWith('-')) {
                files.push(args[i]);
            }
        }

        if (files.length === 0) {
            return '<span class="highlight">head: reading from stdin</span>';
        }

        const results = [];
        for (const file of files) {
            const path = this._resolvePath(file);
            const node = this.fs[path];
            if (!node) {
                results.push(`<span class="error">head: ${file}: No such file</span>`);
            } else if (node.content) {
                results.push(node.content.split('\n').slice(0, lines).join('\n'));
            }
        }
        return results.join('\n');
    }

    _tail(args) {
        let lines = 10;
        let files = [];

        for (let i = 0; i < args.length; i++) {
            if (args[i] === '-n' && args[i + 1]) {
                lines = parseInt(args[i + 1]);
                i++;
            } else if (!args[i].startsWith('-')) {
                files.push(args[i]);
            }
        }

        if (files.length === 0) {
            return '<span class="highlight">tail: reading from stdin</span>';
        }

        const results = [];
        for (const file of files) {
            const path = this._resolvePath(file);
            const node = this.fs[path];
            if (!node) {
                results.push(`<span class="error">tail: ${file}: No such file</span>`);
            } else if (node.content) {
                const allLines = node.content.split('\n');
                results.push(allLines.slice(-lines).join('\n'));
            }
        }
        return results.join('\n');
    }

    _touch(args) {
        for (const arg of args) {
            if (arg.startsWith('-')) continue;
            const path = this._resolvePath(arg);
            if (!this.fs[path]) {
                const parentPath = path.split('/').slice(0, -1).join('/') || '/';
                const fileName = path.split('/').pop();
                const parent = this.fs[parentPath];
                if (parent && parent.type === 'dir') {
                    this.fs[path] = {
                        type: 'file',
                        perms: '-rw-r--r--',
                        owner: this.currentUser.username,
                        group: this.currentUser.username,
                        size: 0,
                        content: ''
                    };
                    if (!parent.children.includes(fileName)) {
                        parent.children.push(fileName);
                    }
                }
            }
        }
        return null;
    }

    _mkdir(args) {
        let makeParents = false;
        const dirs = [];

        for (const arg of args) {
            if (arg === '-p') makeParents = true;
            else if (!arg.startsWith('-')) dirs.push(arg);
        }

        for (const dir of dirs) {
            const path = this._resolvePath(dir);
            if (this.fs[path]) {
                return `<span class="error">mkdir: cannot create directory '${dir}': File exists</span>`;
            }

            const parentPath = path.split('/').slice(0, -1).join('/') || '/';
            const dirName = path.split('/').pop();
            const parent = this.fs[parentPath];

            if (!parent && !makeParents) {
                return `<span class="error">mkdir: cannot create directory '${dir}': No such file or directory</span>`;
            }

            if (parent && parent.type === 'dir') {
                this.fs[path] = {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: this.currentUser.username,
                    group: this.currentUser.username,
                    children: []
                };
                if (!parent.children.includes(dirName)) {
                    parent.children.push(dirName);
                }
            }
        }
        return null;
    }

    _rm(args) {
        let recursive = false;
        let force = false;
        const files = [];

        for (const arg of args) {
            if (arg.includes('r') && arg.startsWith('-')) recursive = true;
            if (arg.includes('f') && arg.startsWith('-')) force = true;
            if (!arg.startsWith('-')) files.push(arg);
        }

        for (const file of files) {
            const path = this._resolvePath(file);
            const node = this.fs[path];

            if (!node) {
                if (!force) {
                    return `<span class="error">rm: cannot remove '${file}': No such file or directory</span>`;
                }
                continue;
            }

            if (node.type === 'dir' && !recursive) {
                return `<span class="error">rm: cannot remove '${file}': Is a directory</span>`;
            }

            // Remove from parent
            const parentPath = path.split('/').slice(0, -1).join('/') || '/';
            const fileName = path.split('/').pop();
            const parent = this.fs[parentPath];
            if (parent && parent.children) {
                parent.children = parent.children.filter(c => c !== fileName);
            }
            delete this.fs[path];
        }
        return null;
    }

    _rmdir(args) {
        for (const arg of args) {
            if (arg.startsWith('-')) continue;
            const path = this._resolvePath(arg);
            const node = this.fs[path];

            if (!node) {
                return `<span class="error">rmdir: failed to remove '${arg}': No such file or directory</span>`;
            }
            if (node.type !== 'dir') {
                return `<span class="error">rmdir: failed to remove '${arg}': Not a directory</span>`;
            }
            if (node.children && node.children.length > 0) {
                return `<span class="error">rmdir: failed to remove '${arg}': Directory not empty</span>`;
            }

            const parentPath = path.split('/').slice(0, -1).join('/') || '/';
            const dirName = path.split('/').pop();
            const parent = this.fs[parentPath];
            if (parent && parent.children) {
                parent.children = parent.children.filter(c => c !== dirName);
            }
            delete this.fs[path];
        }
        return null;
    }

    _cp(args) {
        if (args.length < 2) {
            return '<span class="error">cp: missing file operand</span>';
        }

        const src = this._resolvePath(args[args.length - 2]);
        const dst = this._resolvePath(args[args.length - 1]);
        const srcNode = this.fs[src];

        if (!srcNode) {
            return `<span class="error">cp: cannot stat '${args[args.length - 2]}': No such file or directory</span>`;
        }

        // Create copy
        const dstNode = this.fs[dst];
        let targetPath = dst;

        if (dstNode && dstNode.type === 'dir') {
            targetPath = dst + '/' + src.split('/').pop();
        }

        this.fs[targetPath] = { ...srcNode };

        // Update parent
        const parentPath = targetPath.split('/').slice(0, -1).join('/') || '/';
        const fileName = targetPath.split('/').pop();
        const parent = this.fs[parentPath];
        if (parent && parent.children && !parent.children.includes(fileName)) {
            parent.children.push(fileName);
        }

        return null;
    }

    _mv(args) {
        if (args.length < 2) {
            return '<span class="error">mv: missing file operand</span>';
        }

        const src = this._resolvePath(args[0]);
        const dst = this._resolvePath(args[1]);
        const srcNode = this.fs[src];

        if (!srcNode) {
            return `<span class="error">mv: cannot stat '${args[0]}': No such file or directory</span>`;
        }

        // Copy then delete
        const result = this._cp(args);
        if (result && result.includes('error')) return result;

        // Remove original
        const srcParent = src.split('/').slice(0, -1).join('/') || '/';
        const srcName = src.split('/').pop();
        const parent = this.fs[srcParent];
        if (parent && parent.children) {
            parent.children = parent.children.filter(c => c !== srcName);
        }
        delete this.fs[src];

        return null;
    }

    _file(args) {
        if (args.length === 0) return '<span class="error">file: missing operand</span>';

        const results = [];
        for (const arg of args) {
            const path = this._resolvePath(arg);
            const node = this.fs[path];

            if (!node) {
                results.push(`${arg}: cannot open (No such file)`);
            } else if (node.type === 'dir') {
                results.push(`${arg}: directory`);
            } else if (arg.endsWith('.sh')) {
                results.push(`${arg}: Bourne-Again shell script, ASCII text executable`);
            } else if (arg.endsWith('.py')) {
                results.push(`${arg}: Python script, ASCII text executable`);
            } else if (arg.endsWith('.json')) {
                results.push(`${arg}: JSON data, ASCII text`);
            } else if (arg.endsWith('.html')) {
                results.push(`${arg}: HTML document, ASCII text`);
            } else if (arg.endsWith('.tar.gz') || arg.endsWith('.tgz')) {
                results.push(`${arg}: gzip compressed data`);
            } else if (arg.endsWith('.png') || arg.endsWith('.jpg')) {
                results.push(`${arg}: image data`);
            } else {
                results.push(`${arg}: ASCII text`);
            }
        }
        return results.join('\n');
    }

    _stat(args) {
        if (args.length === 0) return '<span class="error">stat: missing operand</span>';

        const path = this._resolvePath(args[0]);
        const node = this.fs[path];

        if (!node) {
            return `<span class="error">stat: cannot statx '${args[0]}': No such file or directory</span>`;
        }

        return `  File: ${args[0]}
  Size: ${node.size || 4096}      Blocks: ${Math.ceil((node.size || 4096) / 512)}   ${node.type === 'dir' ? 'directory' : 'regular file'}
Access: (${node.perms})  Uid: ( ${node.owner === 'root' ? '0' : '1000'}/${node.owner})   Gid: ( ${node.group === 'root' ? '0' : '1000'}/${node.group})
Access: 2025-12-27 09:00:00.000000000 +0000
Modify: 2025-12-27 09:00:00.000000000 +0000
Change: 2025-12-27 09:00:00.000000000 +0000`;
    }

    _find(args) {
        let startPath = '.';
        let namePattern = null;
        let typeFilter = null;

        for (let i = 0; i < args.length; i++) {
            if (args[i] === '-name' && args[i + 1]) {
                namePattern = args[i + 1].replace(/\*/g, '.*');
                i++;
            } else if (args[i] === '-type' && args[i + 1]) {
                typeFilter = args[i + 1];
                i++;
            } else if (!args[i].startsWith('-')) {
                startPath = args[i];
            }
        }

        const basePath = this._resolvePath(startPath);
        const results = [];

        for (const [path, node] of Object.entries(this.fs)) {
            if (!path.startsWith(basePath)) continue;

            if (typeFilter) {
                if (typeFilter === 'f' && node.type !== 'file') continue;
                if (typeFilter === 'd' && node.type !== 'dir') continue;
            }

            if (namePattern) {
                const name = path.split('/').pop();
                const regex = new RegExp(`^${namePattern}$`);
                if (!regex.test(name)) continue;
            }

            results.push(path);
        }

        return results.join('\n') || '<span class="output">No matches found</span>';
    }

    _grep(args) {
        let ignoreCase = false;
        let showLineNumbers = false;
        let pattern = null;
        let files = [];

        for (let i = 0; i < args.length; i++) {
            if (args[i] === '-i') ignoreCase = true;
            else if (args[i] === '-n') showLineNumbers = true;
            else if (args[i].startsWith('-')) continue;
            else if (!pattern) pattern = args[i];
            else files.push(args[i]);
        }

        if (!pattern) return '<span class="error">grep: missing pattern</span>';
        if (files.length === 0) return '<span class="highlight">grep: reading from stdin</span>';

        const results = [];
        const regex = new RegExp(pattern, ignoreCase ? 'i' : '');

        for (const file of files) {
            const path = this._resolvePath(file);
            const node = this.fs[path];

            if (!node || node.type === 'dir') continue;
            if (!node.content) continue;

            const lines = node.content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                if (regex.test(lines[i])) {
                    const prefix = files.length > 1 ? `${file}:` : '';
                    const lineNum = showLineNumbers ? `${i + 1}:` : '';
                    const highlighted = lines[i].replace(regex, '<span class="highlight">$&</span>');
                    results.push(`${prefix}${lineNum}${highlighted}`);
                }
            }
        }

        return results.join('\n') || '';
    }

    _which(args) {
        const commands = {
            'ls': '/bin/ls', 'cat': '/bin/cat', 'cp': '/bin/cp', 'mv': '/bin/mv',
            'rm': '/bin/rm', 'mkdir': '/bin/mkdir', 'bash': '/bin/bash',
            'python3': '/usr/bin/python3', 'vim': '/usr/bin/vim',
            'git': '/usr/bin/git', 'curl': '/usr/bin/curl', 'wget': '/usr/bin/wget'
        };

        return args.map(cmd => commands[cmd] || `${cmd} not found`).join('\n');
    }

    _whereis(args) {
        return args.map(cmd => `${cmd}: /usr/bin/${cmd} /usr/share/man/man1/${cmd}.1.gz`).join('\n');
    }

    _id(args) {
        if (args.includes('-u')) {
            if (args.includes('-n')) return this.currentUser.username;
            return this.currentUser.uid.toString();
        }
        if (args.includes('-g')) {
            if (args.includes('-n')) return this.currentUser.groups[0].name;
            return this.currentUser.gid.toString();
        }
        if (args.includes('-G')) {
            if (args.includes('-n')) return this.currentUser.groups.map(g => g.name).join(' ');
            return this.currentUser.groups.map(g => g.gid).join(' ');
        }

        const groups = this.currentUser.groups.map(g => `${g.gid}(${g.name})`).join(',');
        return `uid=${this.currentUser.uid}(${this.currentUser.username}) gid=${this.currentUser.gid}(${this.currentUser.groups[0].name}) groups=${groups}`;
    }

    _groups(args) {
        return this.currentUser.groups.map(g => g.name).join(' ');
    }

    _uname(args) {
        if (args.includes('-a')) {
            return `Linux ${this.config.hostname} 6.1.0-hexworth #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux`;
        }
        if (args.includes('-r')) return '6.1.0-hexworth';
        if (args.includes('-n')) return this.config.hostname;
        if (args.includes('-m')) return 'x86_64';
        if (args.includes('-s')) return 'Linux';
        if (args.includes('-o')) return 'GNU/Linux';
        return 'Linux';
    }

    _cal() {
        const now = new Date();
        const month = now.toLocaleString('default', { month: 'long' });
        const year = now.getFullYear();
        return `     ${month} ${year}
Su Mo Tu We Th Fr Sa
       1  2  3  4  5
 6  7  8  9 10 11 12
13 14 15 16 17 18 19
20 21 22 23 24 25 26
27 28 29 30 31`;
    }

    _df(args) {
        const human = args.includes('-h');
        if (human) {
            return `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        50G   15G   33G  31% /
/dev/sda2       100G   45G   50G  47% /home
tmpfs           4.0G   12M  4.0G   1% /tmp`;
        }
        return `Filesystem     1K-blocks     Used Available Use% Mounted on
/dev/sda1       52428800 15728640  34603008  31% /
/dev/sda2      104857600 47185920  52428800  47% /home
tmpfs            4194304    12288   4182016   1% /tmp`;
    }

    _du(args) {
        const human = args.includes('-h');
        const summary = args.includes('-s');

        let path = '.';
        for (const arg of args) {
            if (!arg.startsWith('-')) {
                path = arg;
                break;
            }
        }

        if (summary) {
            return human ? '24M\t' + path : '24576\t' + path;
        }

        return human ?
            `4.0K\t${path}/Documents
8.0K\t${path}/Downloads
4.0K\t${path}/scripts
24M\t${path}` :
            `4096\t${path}/Documents
8192\t${path}/Downloads
4096\t${path}/scripts
24576\t${path}`;
    }

    _free(args) {
        const human = args.includes('-h');
        if (human) {
            return `              total        used        free      shared  buff/cache   available
Mem:          7.8Gi       2.0Gi       4.0Gi       128Mi       1.8Gi       5.5Gi
Swap:         2.0Gi          0B       2.0Gi`;
        }
        return `              total        used        free      shared  buff/cache   available
Mem:        8192000     2048000     4096000      131072     1884000     5632000
Swap:       2097152           0     2097152`;
    }

    _ps(args) {
        if (args.includes('aux') || args.includes('-aux')) {
            return `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1 168940 11340 ?        Ss   06:30   0:02 /sbin/init
root       234  0.0  0.1  72308  6124 ?        Ss   06:30   0:00 /usr/sbin/sshd
student    890  0.0  0.0  18520  3940 pts/0    Ss   09:00   0:00 -bash
student   1234  0.0  0.0  15420  2100 pts/0    R+   09:30   0:00 ps aux`;
        }
        if (args.includes('-ef')) {
            return `UID        PID  PPID  C STIME TTY          TIME CMD
root         1     0  0 06:30 ?        00:00:02 /sbin/init
root       234     1  0 06:30 ?        00:00:00 /usr/sbin/sshd
student    890   234  0 09:00 pts/0    00:00:00 -bash
student   1234   890  0 09:30 pts/0    00:00:00 ps -ef`;
        }
        return `  PID TTY          TIME CMD
  890 pts/0    00:00:00 bash
 1234 pts/0    00:00:00 ps`;
    }

    _wc(args) {
        let countLines = true, countWords = true, countBytes = true;
        const files = [];

        for (const arg of args) {
            if (arg === '-l') { countLines = true; countWords = false; countBytes = false; }
            else if (arg === '-w') { countLines = false; countWords = true; countBytes = false; }
            else if (arg === '-c') { countLines = false; countWords = false; countBytes = true; }
            else if (!arg.startsWith('-')) files.push(arg);
        }

        if (files.length === 0) return '<span class="highlight">wc: reading from stdin</span>';

        const results = [];
        for (const file of files) {
            const path = this._resolvePath(file);
            const node = this.fs[path];
            if (!node || !node.content) continue;

            const content = node.content;
            const lines = content.split('\n').length;
            const words = content.split(/\s+/).filter(w => w).length;
            const bytes = content.length;

            const parts = [];
            if (countLines) parts.push(lines.toString().padStart(7));
            if (countWords) parts.push(words.toString().padStart(7));
            if (countBytes) parts.push(bytes.toString().padStart(7));
            parts.push(file);

            results.push(parts.join(' '));
        }
        return results.join('\n');
    }

    _sort(args) {
        let reverse = args.includes('-r');
        let numeric = args.includes('-n');
        let file = args.find(a => !a.startsWith('-'));

        if (!file) return '<span class="highlight">sort: reading from stdin</span>';

        const path = this._resolvePath(file);
        const node = this.fs[path];
        if (!node || !node.content) return `<span class="error">sort: ${file}: No such file</span>`;

        let lines = node.content.split('\n').filter(l => l);
        if (numeric) {
            lines.sort((a, b) => parseFloat(a) - parseFloat(b));
        } else {
            lines.sort();
        }
        if (reverse) lines.reverse();

        return lines.join('\n');
    }

    _uniq(args) {
        let countMode = args.includes('-c');
        let file = args.find(a => !a.startsWith('-'));

        if (!file) return '<span class="highlight">uniq: reading from stdin</span>';

        const path = this._resolvePath(file);
        const node = this.fs[path];
        if (!node || !node.content) return `<span class="error">uniq: ${file}: No such file</span>`;

        const lines = node.content.split('\n');
        const result = [];
        let prevLine = null;
        let count = 0;

        for (const line of lines) {
            if (line === prevLine) {
                count++;
            } else {
                if (prevLine !== null) {
                    result.push(countMode ? `${count.toString().padStart(7)} ${prevLine}` : prevLine);
                }
                prevLine = line;
                count = 1;
            }
        }
        if (prevLine !== null) {
            result.push(countMode ? `${count.toString().padStart(7)} ${prevLine}` : prevLine);
        }

        return result.join('\n');
    }

    _cut(args) {
        let delimiter = '\t';
        let fields = null;
        let file = null;

        for (let i = 0; i < args.length; i++) {
            if (args[i] === '-d' && args[i + 1]) {
                delimiter = args[i + 1];
                i++;
            } else if (args[i] === '-f' && args[i + 1]) {
                fields = args[i + 1].split(',').map(f => parseInt(f) - 1);
                i++;
            } else if (!args[i].startsWith('-')) {
                file = args[i];
            }
        }

        if (!file) return '<span class="highlight">cut: reading from stdin</span>';
        if (!fields) return '<span class="error">cut: you must specify a list of fields</span>';

        const path = this._resolvePath(file);
        const node = this.fs[path];
        if (!node || !node.content) return `<span class="error">cut: ${file}: No such file</span>`;

        return node.content.split('\n').map(line => {
            const parts = line.split(delimiter);
            return fields.map(f => parts[f] || '').join(delimiter);
        }).join('\n');
    }

    _tr(args) {
        return '<span class="highlight">tr: character translation - see man tr</span>';
    }

    _chmod(args) {
        if (args.length < 2) return '<span class="error">chmod: missing operand</span>';
        return `<span class="success">chmod: mode changed for ${args[args.length - 1]}</span>`;
    }

    _chown(args) {
        if (args.length < 2) return '<span class="error">chown: missing operand</span>';
        return `<span class="error">chown: changing ownership requires root privileges</span>`;
    }

    _chgrp(args) {
        if (args.length < 2) return '<span class="error">chgrp: missing operand</span>';
        return `<span class="error">chgrp: changing group requires appropriate privileges</span>`;
    }

    _export(args) {
        if (args.length === 0) {
            return Object.entries(this.env).map(([k, v]) => `declare -x ${k}="${v}"`).join('\n');
        }
        for (const arg of args) {
            if (arg.includes('=')) {
                const [name, ...valueParts] = arg.split('=');
                this.env[name] = valueParts.join('=');
            }
        }
        return null;
    }

    _ln(args) {
        let symbolic = args.includes('-s');
        let force = args.includes('-f');
        const nonFlags = args.filter(a => !a.startsWith('-'));

        if (nonFlags.length < 2) {
            return '<span class="error">ln: missing file operand</span>';
        }

        return `<span class="success">ln: link created${symbolic ? ' (symbolic)' : ''}</span>`;
    }

    _sudo(args) {
        if (args.length === 0) {
            return '<span class="error">sudo: requires a command</span>';
        }
        const subCmd = args[0];

        if (subCmd === 'su' || (subCmd === '-i')) {
            return '<span class="highlight">root@hexworth:~# </span><span class="output">[Simulated root shell - type exit to return]</span>';
        }

        return `<span class="highlight">[sudo] password for ${this.currentUser.username}: </span><span class="output">\n[Command would execute as root: ${args.join(' ')}]</span>`;
    }

    _type(args) {
        if (args.length === 0) return '';
        const builtins = ['cd', 'pwd', 'echo', 'export', 'alias', 'history', 'exit'];
        return args.map(cmd => {
            if (builtins.includes(cmd)) return `${cmd} is a shell builtin`;
            return `${cmd} is /usr/bin/${cmd}`;
        }).join('\n');
    }

    // ═══════════════════════════════════════════════════════════════
    // HELP & DOCUMENTATION
    // ═══════════════════════════════════════════════════════════════

    _help() {
        return `<span class="highlight">Hexworth Linux Terminal - Available Commands</span>

<span class="success">Navigation:</span>        cd, pwd, ls
<span class="success">File Operations:</span>   cat, head, tail, touch, mkdir, rm, rmdir, cp, mv, file, stat
<span class="success">Search:</span>            find, grep, which, whereis
<span class="success">User Info:</span>         whoami, id, groups, who, w, users
<span class="success">System Info:</span>       uname, hostname, uptime, date, cal, df, du, free, ps, top
<span class="success">Text Processing:</span>   echo, wc, sort, uniq, cut, tr
<span class="success">Permissions:</span>       chmod, chown, chgrp, umask
<span class="success">Environment:</span>       env, export, set, unset
<span class="success">Help:</span>              help, man, type, alias
<span class="success">Terminal:</span>          clear, history, exit

<span class="highlight">Tips:</span> Use Tab for completion, ↑↓ for history, Ctrl+C to interrupt, Ctrl+L to clear`;
    }

    _man(args) {
        if (args.length === 0) {
            return '<span class="error">What manual page do you want?\nUsage: man [command]</span>';
        }

        const manPages = {
            'ls': `<span class="highlight">LS(1)                     User Commands                     LS(1)</span>

<span class="success">NAME</span>
       ls - list directory contents

<span class="success">SYNOPSIS</span>
       ls [OPTION]... [FILE]...

<span class="success">DESCRIPTION</span>
       List information about the FILEs (current directory by default).

<span class="success">OPTIONS</span>
       -a, --all          do not ignore entries starting with .
       -l                 use a long listing format
       -h, --human-readable  print sizes in human readable format
       -R, --recursive    list subdirectories recursively`,

            'cd': `<span class="highlight">CD(1)                     User Commands                     CD(1)</span>

<span class="success">NAME</span>
       cd - change the working directory

<span class="success">SYNOPSIS</span>
       cd [directory]

<span class="success">DESCRIPTION</span>
       Change the current directory to [directory].
       If no directory given, changes to HOME.

       cd -    Change to previous directory
       cd ~    Change to home directory`,

            'cat': `<span class="highlight">CAT(1)                    User Commands                    CAT(1)</span>

<span class="success">NAME</span>
       cat - concatenate files and print on stdout

<span class="success">SYNOPSIS</span>
       cat [OPTION]... [FILE]...

<span class="success">DESCRIPTION</span>
       Concatenate FILE(s) to standard output.
       With no FILE, read standard input.`,

            'grep': `<span class="highlight">GREP(1)                   User Commands                   GREP(1)</span>

<span class="success">NAME</span>
       grep - print lines matching a pattern

<span class="success">SYNOPSIS</span>
       grep [OPTIONS] PATTERN [FILE...]

<span class="success">DESCRIPTION</span>
       Search for PATTERN in each FILE.

<span class="success">OPTIONS</span>
       -i, --ignore-case    ignore case distinctions
       -n, --line-number    print line number with output
       -r, --recursive      search directories recursively
       -v, --invert-match   select non-matching lines`,

            'chmod': `<span class="highlight">CHMOD(1)                  User Commands                  CHMOD(1)</span>

<span class="success">NAME</span>
       chmod - change file mode bits

<span class="success">SYNOPSIS</span>
       chmod [OPTION]... MODE[,MODE]... FILE...

<span class="success">DESCRIPTION</span>
       Change the mode of each FILE to MODE.

<span class="success">MODES</span>
       Numeric: 755, 644, 600, etc.
       Symbolic: u+x, g-w, o=r, a+r`,

            'whoami': `<span class="highlight">WHOAMI(1)                 User Commands                 WHOAMI(1)</span>

<span class="success">NAME</span>
       whoami - print effective user name

<span class="success">SYNOPSIS</span>
       whoami

<span class="success">DESCRIPTION</span>
       Print the user name associated with the current effective user ID.`,

            'id': `<span class="highlight">ID(1)                     User Commands                     ID(1)</span>

<span class="success">NAME</span>
       id - print real and effective user and group IDs

<span class="success">SYNOPSIS</span>
       id [OPTION]... [USER]

<span class="success">OPTIONS</span>
       -u     print only the effective user ID
       -g     print only the effective group ID
       -G     print all group IDs
       -n     print a name instead of a number`,

            'groups': `<span class="highlight">GROUPS(1)                 User Commands                 GROUPS(1)</span>

<span class="success">NAME</span>
       groups - print the groups a user is in

<span class="success">SYNOPSIS</span>
       groups [USERNAME]...

<span class="success">DESCRIPTION</span>
       Print group memberships for each USERNAME.`
        };

        return manPages[args[0]] || `<span class="error">No manual entry for ${args[0]}</span>`;
    }

    _getHelp(cmd) {
        const helps = {
            'ls': 'Usage: ls [OPTION]... [FILE]...\nList directory contents.\n\n  -a  show hidden files\n  -l  long format\n  -h  human-readable sizes',
            'cd': 'Usage: cd [DIRECTORY]\nChange the working directory.',
            'cat': 'Usage: cat [FILE]...\nConcatenate files and print to stdout.',
            'grep': 'Usage: grep [OPTIONS] PATTERN [FILE]...\nSearch for PATTERN in files.',
        };
        return helps[cmd] || `${cmd}: --help not available`;
    }

    // ═══════════════════════════════════════════════════════════════
    // PIPES & REDIRECTION
    // ═══════════════════════════════════════════════════════════════

    _executePipeline(cmdLine) {
        const commands = cmdLine.split('|').map(c => c.trim());
        let input = '';

        for (const cmd of commands) {
            const { cmd: command, args } = this._parseCommand(cmd);

            // For piped commands, we'd pass input as stdin
            // Simplified: just execute and show result
            const output = this._executeCommand(command, args, cmd);
            if (output) input = output;
        }

        if (input) this._appendOutput(input);
    }

    _executeRedirect(cmdLine) {
        const append = cmdLine.includes('>>');
        const parts = cmdLine.split(append ? '>>' : '>');
        const cmd = parts[0].trim();
        const file = parts[1]?.trim();

        if (!file) {
            this._appendOutput('<span class="error">Syntax error: missing filename</span>');
            return;
        }

        const { cmd: command, args } = this._parseCommand(cmd);
        const output = this._executeCommand(command, args, cmd);

        // Create/update file with output
        const path = this._resolvePath(file);
        const textOutput = output?.replace(/<[^>]*>/g, '') || '';

        if (this.fs[path]) {
            this.fs[path].content = append ? (this.fs[path].content || '') + textOutput : textOutput;
        } else {
            this._touch([file]);
            if (this.fs[path]) {
                this.fs[path].content = textOutput;
            }
        }

        this._appendOutput(`<span class="output">[Output redirected to ${file}]</span>`);
    }

    // ═══════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════

    _resolvePath(path) {
        if (!path) return this.currentDir;

        // Handle home directory
        if (path === '~') return this.currentUser.home;
        if (path.startsWith('~/')) path = this.currentUser.home + path.slice(1);

        // Handle absolute vs relative
        let resolved;
        if (path.startsWith('/')) {
            resolved = path;
        } else {
            resolved = this.currentDir === '/' ? '/' + path : this.currentDir + '/' + path;
        }

        // Normalize path (handle . and ..)
        const parts = resolved.split('/').filter(p => p && p !== '.');
        const normalized = [];

        for (const part of parts) {
            if (part === '..') {
                normalized.pop();
            } else {
                normalized.push(part);
            }
        }

        return '/' + normalized.join('/');
    }

    _getPrompt() {
        const dir = this.currentDir === this.currentUser.home ? '~' :
                    this.currentDir.replace(this.currentUser.home, '~');
        return `${this.currentUser.username}@${this.config.hostname}:${dir}$`;
    }

    _updatePrompt() {
        if (this.config.promptElement) {
            const promptEl = document.querySelector(this.config.promptElement);
            if (promptEl) {
                promptEl.textContent = this._getPrompt() + ' ';
            }
        }
    }

    _historyUp() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.inputEl.value = this.commandHistory[this.historyIndex];
        }
    }

    _historyDown() {
        if (this.historyIndex < this.commandHistory.length - 1) {
            this.historyIndex++;
            this.inputEl.value = this.commandHistory[this.historyIndex];
        } else {
            this.historyIndex = this.commandHistory.length;
            this.inputEl.value = '';
        }
    }

    _tabComplete() {
        const input = this.inputEl.value;
        const parts = input.split(' ');
        const current = parts[parts.length - 1];

        if (!current) return;

        // Determine if completing command or file
        const isFirstWord = parts.length === 1;
        let matches = [];

        if (isFirstWord) {
            // Command completion
            const commands = ['ls', 'cd', 'pwd', 'cat', 'head', 'tail', 'grep', 'find', 'mkdir', 'rm', 'cp', 'mv',
                           'touch', 'chmod', 'chown', 'echo', 'whoami', 'id', 'groups', 'ps', 'top', 'df', 'du',
                           'free', 'uname', 'man', 'help', 'clear', 'history', 'export', 'env'];
            matches = commands.filter(c => c.startsWith(current));
        } else {
            // File/directory completion
            const basePath = current.includes('/') ?
                this._resolvePath(current.substring(0, current.lastIndexOf('/'))) :
                this.currentDir;
            const prefix = current.includes('/') ? current.substring(current.lastIndexOf('/') + 1) : current;
            const node = this.fs[basePath];

            if (node && node.children) {
                matches = node.children.filter(c => c.startsWith(prefix));
            }
        }

        if (matches.length === 1) {
            parts[parts.length - 1] = isFirstWord ? matches[0] :
                (current.includes('/') ? current.substring(0, current.lastIndexOf('/') + 1) + matches[0] : matches[0]);
            this.inputEl.value = parts.join(' ');
        } else if (matches.length > 1) {
            this._appendOutput(matches.join('  '));
        }
    }

    _interrupt() {
        this._appendLine('<span class="error">^C</span>');
        this.inputEl.value = '';
    }

    clear() {
        this.containerEl.innerHTML = '';
    }

    _appendLine(html) {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = html;
        this.containerEl.appendChild(line);
    }

    _appendOutput(output) {
        if (!output) return;
        const line = document.createElement('div');
        line.className = 'terminal-line output';
        line.innerHTML = output;
        this.containerEl.appendChild(line);
    }

    _escape(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ═══════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════

    /**
     * Add a custom command
     */
    addCommand(name, handler) {
        this.customCommands = this.customCommands || {};
        this.customCommands[name] = handler;
    }

    /**
     * Add files to the virtual filesystem
     */
    addFiles(files) {
        for (const [path, content] of Object.entries(files)) {
            if (typeof content === 'string') {
                this.fs[path] = {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: this.currentUser.username,
                    group: this.currentUser.username,
                    size: content.length,
                    content: content
                };
            } else {
                this.fs[path] = content;
            }

            // Add to parent directory
            const parentPath = path.split('/').slice(0, -1).join('/') || '/';
            const fileName = path.split('/').pop();
            if (this.fs[parentPath] && this.fs[parentPath].children) {
                if (!this.fs[parentPath].children.includes(fileName)) {
                    this.fs[parentPath].children.push(fileName);
                }
            }
        }
    }

    /**
     * Print a message to the terminal
     */
    print(message, className = 'output') {
        this._appendLine(`<span class="${className}">${message}</span>`);
        this.containerEl.scrollTop = this.containerEl.scrollHeight;
    }

    /**
     * Get current directory
     */
    getCwd() {
        return this.currentDir;
    }

    /**
     * Get command history
     */
    getHistory() {
        return [...this.commandHistory];
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LinuxTerminal;
}
