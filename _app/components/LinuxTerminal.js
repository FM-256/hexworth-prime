/**
 * ===============================================================================
 * LinuxTerminal.js - Comprehensive Linux Terminal Simulator
 * ===============================================================================
 *
 * Hexworth Prime - House of Script
 *
 * A full-featured terminal engine for Linux labs.
 * Includes virtual filesystem, 60+ commands, pipes, redirection, and more.
 *
 * Architecture:
 * - IIFE (Immediately Invoked Function Expression) for encapsulation
 * - Simulated Linux filesystem with /home, /etc, /var, /tmp, /usr, /bin, etc.
 * - Tab completion for commands and paths
 * - Command history with arrow key navigation
 * - Pipe and redirection simulation
 * - Module-specific filesystem overlays for different labs
 * - Objective system for lab progress tracking
 *
 * Usage:
 *   LinuxTerminal.init('LIN-M01', '#terminal-container', {
 *       objectives: [
 *           { id: 'ls', desc: 'List directory contents with ls' },
 *           { id: 'cd', desc: 'Change directory with cd' }
 *       ]
 *   });
 *
 * Version: 2.0.0
 * Created: December 27, 2025
 * Refactored: February 2026 (IIFE pattern)
 *
 * ===============================================================================
 */

// IIFE singleton — NOT a class. Only one terminal can exist per page because
// filesystem, cwd, command history, and DOM refs are shared mutable state.
// Calling `new LinuxTerminal()` would create duplicate state and break event
// handlers. Instead, call LinuxTerminal.init() once per page.
const LinuxTerminal = (function() {
    'use strict';

    // =========================================================================
    // CONFIGURATION & STATE MANAGEMENT
    // =========================================================================

    const config = {
        moduleId: null,
        container: null,
        user: 'student',
        hostname: 'hexworth',
        startDir: '/home/student',
        height: '350px',
        onCommand: null,
        onObjectiveComplete: null,
        suppressUnknown: false,
    };

    const state = {
        currentDir: '/home/student',
        commandHistory: [],
        historyIndex: -1,
        isInitialized: false,
        env: {},
        fs: {},
        objectives: [],
        objectivesCompleted: {},
        currentUser: null,
        containerEl: null,
        outputEl: null,
        inputEl: null,
        promptEl: null,
        titleEl: null,
        packages: {},
        services: {},
        umask: '0022',
        _keydownHandler: null,
        _clickHandler: null,
        sudoPassword: 'P@55w0rd!!',
        sudoPending: null,        // { args, cmdLine } — waiting for password
        sudoAuthenticated: false, // true after correct password (cached for session)
        sudoAttempts: 0,
        bgJobs: [],              // simulated background jobs [{id, pid, cmd, status}]
        nextJobId: 1,
        nextBgPid: 10000,
    };

    // =========================================================================
    // BASE FILESYSTEM
    // =========================================================================

    function _createBaseFilesystem(user) {
        return {
            '/': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['home', 'etc', 'var', 'tmp', 'usr', 'bin', 'sbin', 'opt', 'root', 'dev', 'proc'] },
            '/home': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: [user] },
            [`/home/${user}`]: { type: 'dir', perms: 'drwxr-xr-x', owner: user, group: user, children: ['Documents', 'Downloads', 'scripts', '.bashrc', '.profile', 'notes.txt', 'readme.md', 'users.txt', 'log.txt', 'scores.txt'] },
            [`/home/${user}/users.txt`]: { type: 'file', perms: '-rw-r--r--', owner: user, group: user, size: 192, content: 'john 25 engineer austin\njane 30 designer seattle\nadmin 45 sysadmin denver\nguest 22 visitor boston\nmike 35 analyst chicago\nsara 28 developer portland\n' },
            [`/home/${user}/log.txt`]: { type: 'file', perms: '-rw-r--r--', owner: user, group: user, size: 384, content: '2025-01-15 09:00:12 INFO Server started on port 8080\n2025-01-15 09:05:33 WARNING Disk usage at 85%\n2025-01-15 09:12:07 ERROR Connection refused to database\n2025-01-15 09:15:44 INFO Retry successful\n2025-01-15 09:30:00 ERROR Timeout waiting for response\n2025-01-15 09:45:22 CRITICAL Out of memory exception\n2025-01-15 10:00:01 INFO Service restarted\n2025-01-15 10:05:18 WARNING CPU usage at 92%\n' },
            [`/home/${user}/scores.txt`]: { type: 'file', perms: '-rw-r--r--', owner: user, group: user, size: 160, content: 'alice 95 math\nbob 78 science\ncharlie 88 math\ndiana 92 science\neve 67 math\nfrank 85 science\ngrace 99 math\n' },
            [`/home/${user}/Documents`]: { type: 'dir', perms: 'drwxr-xr-x', owner: user, group: user, children: ['report.txt', 'data.csv', 'project'] },
            [`/home/${user}/Documents/project`]: { type: 'dir', perms: 'drwxr-xr-x', owner: user, group: user, children: ['main.py', 'config.json', 'README.md'] },
            [`/home/${user}/Documents/report.txt`]: { type: 'file', perms: '-rw-r--r--', owner: user, group: user, size: 2048, content: 'Quarterly Report Q4 2025\n========================\n\nExecutive Summary:\nThis report covers system administration activities.\n\nKey Metrics:\n- Uptime: 99.9%\n- Security incidents: 0\n- Patches applied: 47\n\nRecommendations:\n1. Upgrade kernel to 6.x series\n2. Implement automated backups\n3. Review firewall rules\n' },
            [`/home/${user}/Documents/data.csv`]: { type: 'file', perms: '-rw-r--r--', owner: user, group: user, size: 512, content: 'id,name,value,status\n1,alpha,100,active\n2,beta,200,inactive\n3,gamma,150,active\n4,delta,300,active\n5,epsilon,50,inactive\n' },
            [`/home/${user}/Documents/project/main.py`]: { type: 'file', perms: '-rwxr-xr-x', owner: user, group: user, size: 1024, content: '#!/usr/bin/env python3\n"""Main application entry point."""\n\nimport sys\nimport config\n\ndef main():\n    print("Hello from Hexworth!")\n    return 0\n\nif __name__ == "__main__":\n    sys.exit(main())\n' },
            [`/home/${user}/Documents/project/config.json`]: { type: 'file', perms: '-rw-r--r--', owner: user, group: user, size: 256, content: '{\n  "app_name": "hexworth-demo",\n  "version": "1.0.0",\n  "debug": false,\n  "port": 8080\n}\n' },
            [`/home/${user}/Documents/project/README.md`]: { type: 'file', perms: '-rw-r--r--', owner: user, group: user, size: 384, content: '# Project README\n\nA sample project for learning Linux commands.\n\n## Usage\n\n```bash\npython3 main.py\n```\n\n## License\n\nMIT\n' },
            [`/home/${user}/Downloads`]: { type: 'dir', perms: 'drwxr-xr-x', owner: user, group: user, children: ['archive.tar.gz', 'image.png', 'installer.sh'] },
            [`/home/${user}/Downloads/archive.tar.gz`]: { type: 'file', perms: '-rw-r--r--', owner: user, group: user, size: 15360, content: '[binary data]' },
            [`/home/${user}/Downloads/image.png`]: { type: 'file', perms: '-rw-r--r--', owner: user, group: user, size: 24576, content: '[binary data]' },
            [`/home/${user}/Downloads/installer.sh`]: { type: 'file', perms: '-rwxr-xr-x', owner: user, group: user, size: 4096, content: '#!/bin/bash\necho "Installing..."\nsleep 2\necho "Done!"\n' },
            [`/home/${user}/scripts`]: { type: 'dir', perms: 'drwxr-xr-x', owner: user, group: user, children: ['backup.sh', 'monitor.sh', 'deploy.sh'] },
            [`/home/${user}/scripts/backup.sh`]: { type: 'file', perms: '-rwxr-xr-x', owner: user, group: user, size: 512, content: '#!/bin/bash\n# Backup script\ntar -czf backup_$(date +%Y%m%d).tar.gz ~/Documents\necho "Backup complete"\n' },
            [`/home/${user}/scripts/monitor.sh`]: { type: 'file', perms: '-rwxr-xr-x', owner: user, group: user, size: 384, content: '#!/bin/bash\n# System monitor\necho "CPU: $(uptime)"\necho "Memory: $(free -h | grep Mem)"\necho "Disk: $(df -h / | tail -1)"\n' },
            [`/home/${user}/scripts/deploy.sh`]: { type: 'file', perms: '-rwxr-xr-x', owner: user, group: user, size: 256, content: '#!/bin/bash\necho "Deploying application..."\ncd ~/Documents/project\npython3 main.py\n' },
            [`/home/${user}/.bashrc`]: { type: 'file', perms: '-rw-r--r--', owner: user, group: user, size: 3024, content: '# ~/.bashrc\nexport PATH=$PATH:~/bin\nalias ll="ls -la"\nalias la="ls -A"\nalias l="ls -CF"\n' },
            [`/home/${user}/.profile`]: { type: 'file', perms: '-rw-r--r--', owner: user, group: user, size: 807, content: '# ~/.profile\nif [ -f ~/.bashrc ]; then\n    . ~/.bashrc\nfi\n' },
            [`/home/${user}/notes.txt`]: { type: 'file', perms: '-rw-r--r--', owner: user, group: user, size: 256, content: 'Linux Learning Notes\n====================\n\n1. Use man pages for help\n2. Tab completion saves time\n3. History with arrow keys\n4. Ctrl+C to interrupt\n5. Ctrl+L to clear screen\n' },
            [`/home/${user}/readme.md`]: { type: 'file', perms: '-rw-r--r--', owner: user, group: user, size: 128, content: '# Welcome to Hexworth Linux Labs\n\nThis is your home directory. Explore and learn!\n' },
            '/etc': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['passwd', 'group', 'shadow', 'hostname', 'hosts', 'resolv.conf', 'fstab'] },
            '/etc/passwd': { type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 1024, content: `root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\n${user}:x:1000:1000:${user.charAt(0).toUpperCase() + user.slice(1)} User:/home/${user}:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\n` },
            '/etc/group': { type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 512, content: `root:x:0:\n${user}:x:1000:${user}\nsudo:x:27:${user}\nusers:x:100:${user}\ndocker:x:999:${user}\nwww-data:x:998:${user}\n` },
            '/etc/shadow': { type: 'file', perms: '-rw-------', owner: 'root', group: 'shadow', size: 256, content: '[Permission denied - requires root]' },
            '/etc/hostname': { type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 16, content: 'hexworth\n' },
            '/etc/hosts': { type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 256, content: '127.0.0.1\tlocalhost\n127.0.1.1\thexworth\n::1\t\tlocalhost ip6-localhost ip6-loopback\n' },
            '/etc/resolv.conf': { type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 64, content: 'nameserver 8.8.8.8\nnameserver 8.8.4.4\n' },
            '/etc/fstab': { type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 512, content: '# /etc/fstab: static file system information.\nUUID=abc-123 /               ext4    errors=remount-ro 0       1\nUUID=def-456 /home           ext4    defaults          0       2\n' },
            '/var': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['log', 'www', 'tmp'] },
            '/var/log': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['syslog', 'auth.log', 'dmesg'] },
            '/var/log/syslog': { type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm', size: 8192, content: 'Dec 27 09:00:01 hexworth CRON[1234]: (root) CMD (test -x /usr/sbin/anacron)\nDec 27 09:15:22 hexworth systemd[1]: Started Daily apt download activities.\nDec 27 09:30:45 hexworth kernel: [UFW BLOCK] IN=eth0 OUT= SRC=192.168.1.100\n' },
            '/var/log/auth.log': { type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm', size: 4096, content: `Dec 27 08:30:00 hexworth sshd[5678]: Accepted publickey for ${user}\nDec 27 08:30:00 hexworth systemd-logind[890]: New session 1 of user ${user}.\nDec 27 08:45:12 hexworth sudo: ${user} : TTY=pts/0 ; PWD=/home/${user} ; USER=root ; COMMAND=/bin/apt update\n` },
            '/var/log/dmesg': { type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm', size: 2048, content: '[    0.000000] Linux version 6.1.0-hexworth\n[    0.000001] Command line: BOOT_IMAGE=/vmlinuz\n[    0.523456] CPU: 4 cores detected\n[    1.234567] Memory: 8192MB available\n' },
            '/var/www': { type: 'dir', perms: 'drwxr-xr-x', owner: 'www-data', group: 'www-data', children: ['html'] },
            '/var/www/html': { type: 'dir', perms: 'drwxr-xr-x', owner: 'www-data', group: 'www-data', children: ['index.html'] },
            '/var/www/html/index.html': { type: 'file', perms: '-rw-r--r--', owner: 'www-data', group: 'www-data', size: 256, content: '<!DOCTYPE html>\n<html>\n<head><title>Welcome</title></head>\n<body><h1>It works!</h1></body>\n</html>\n' },
            '/var/tmp': { type: 'dir', perms: 'drwxrwxrwt', owner: 'root', group: 'root', children: [] },
            '/tmp': { type: 'dir', perms: 'drwxrwxrwt', owner: 'root', group: 'root', children: ['session.tmp'] },
            '/tmp/session.tmp': { type: 'file', perms: '-rw-------', owner: user, group: user, size: 64, content: 'session_id=abc123\n' },
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

    function _initEnv() {
        const pid = 1000 + Math.floor(Math.random() * 9000); // Simulated shell PID
        return {
            USER: config.user,
            HOME: `/home/${config.user}`,
            PWD: config.startDir,
            SHELL: '/bin/bash',
            PATH: '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
            TERM: 'xterm-256color',
            LANG: 'en_US.UTF-8',
            HOSTNAME: config.hostname,
            PS1: '\\u@\\h:\\w\\$ ',
            PPID: '1',
            BASHPID: String(pid),
            EDITOR: 'nano',
            LOGNAME: config.user
        };
    }

    function _initCurrentUser() {
        return {
            username: config.user,
            uid: 1000,
            gid: 1000,
            groups: [
                { gid: 1000, name: config.user },
                { gid: 27, name: 'sudo' },
                { gid: 100, name: 'users' },
                { gid: 999, name: 'docker' },
                { gid: 998, name: 'www-data' }
            ],
            home: `/home/${config.user}`,
            shell: '/bin/bash'
        };
    }

    // =========================================================================
    // INITIALIZATION
    // =========================================================================

    function init(moduleId, containerSelector, options = {}) {
        config.moduleId = moduleId;
        config.container = containerSelector;

        // Apply options
        if (options.user) config.user = options.user;
        if (options.hostname) config.hostname = options.hostname;
        if (options.startDir) config.startDir = options.startDir;
        if (options.height) config.height = options.height;
        if (options.onCommand) config.onCommand = options.onCommand;
        if (options.onObjectiveComplete) config.onObjectiveComplete = options.onObjectiveComplete;
        if (options.suppressUnknown) config.suppressUnknown = true;

        // Set objectives
        if (options.objectives) {
            state.objectives = options.objectives;
            state.objectivesCompleted = {};
        } else {
            state.objectives = [];
            state.objectivesCompleted = {};
        }

        // Initialize state
        state.currentDir = config.startDir;
        state.commandHistory = [];
        state.historyIndex = -1;
        state.env = _initEnv();
        state.currentUser = _initCurrentUser();
        state.fs = JSON.parse(JSON.stringify(_createBaseFilesystem(config.user)));
        state.umask = '0022';
        state.packages = {};
        state.services = {};

        // Build UI
        _buildUI();
        state.isInitialized = true;

        // Print welcome message
        _printWelcome();

        // Record start time for time-on-task analytics
        try {
            const startKey = 'hexworth_start_times';
            const starts = JSON.parse(localStorage.getItem(startKey) || '{}');
            const contentKey = moduleId.toLowerCase();
            if (!starts[contentKey]) {
                starts[contentKey] = Date.now();
                localStorage.setItem(startKey, JSON.stringify(starts));
            }
        } catch(e) { /* non-critical */ }
    }

    // =========================================================================
    // UI CONSTRUCTION
    // =========================================================================

    function _buildUI() {
        const container = document.querySelector(config.container);
        if (!container) {
            console.error(`LinuxTerminal: Container not found: ${config.container}`);
            return;
        }

        state.containerEl = container;
        const height = config.height || '350px';

        container.innerHTML = `
            <div class="lt-terminal">
                <div class="lt-terminal-header">
                    <div class="lt-dots">
                        <span class="lt-dot lt-dot-red"></span>
                        <span class="lt-dot lt-dot-yellow"></span>
                        <span class="lt-dot lt-dot-green"></span>
                    </div>
                    <span class="lt-terminal-title">${config.user}@${config.hostname}:~</span>
                </div>
                <div class="lt-output" id="lt-output"></div>
                <div class="lt-input-line">
                    <span class="lt-prompt" id="lt-prompt">${config.user}@${config.hostname}:~$</span>
                    <input type="text"
                           class="lt-input"
                           id="lt-input"
                           placeholder="Type a command..."
                           autocomplete="off"
                           autocorrect="off"
                           autocapitalize="off"
                           spellcheck="false">
                </div>
            </div>
        `;

        // Store element references
        state.outputEl = container.querySelector('#lt-output');
        state.inputEl = container.querySelector('#lt-input');
        state.promptEl = container.querySelector('#lt-prompt');
        state.titleEl = container.querySelector('.lt-terminal-title');

        // Attach event listeners
        _attachEventListeners();

        // Inject styles
        _injectStyles();

        // Focus the input
        setTimeout(() => {
            if (state.inputEl) state.inputEl.focus();
        }, 100);
    }

    function _printWelcome() {
        const welcome = `Welcome to ${config.hostname} (Linux 6.1.0-hexworth)
<span class="lt-success">System ready.</span>

Connected as: <span class="lt-highlight">${config.user}@${config.hostname}</span>
Module: <span class="lt-highlight">${config.moduleId}</span>

Type <span class="lt-cmd">help</span> for available commands.
`;
        _printOutput(welcome);
    }

    function _injectStyles() {
        if (document.getElementById('lt-terminal-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'lt-terminal-styles';
        styles.textContent = `
            .lt-terminal {
                background: #0d1117;
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 8px;
                overflow: hidden;
                font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
                font-size: 14px;
                height: 100%;
                display: flex;
                flex-direction: column;
            }
            .lt-terminal-header {
                background: #1a1a2e;
                padding: 10px 15px;
                display: flex;
                align-items: center;
                gap: 8px;
                border-bottom: 1px solid rgba(255,255,255,0.1);
            }
            .lt-dots {
                display: flex;
                gap: 6px;
            }
            .lt-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
            }
            .lt-dot-red { background: #ef4444; }
            .lt-dot-yellow { background: #eab308; }
            .lt-dot-green { background: #22c55e; }
            .lt-terminal-title {
                margin-left: 10px;
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.85rem;
                color: #8b949e;
            }
            .lt-output {
                padding: 15px;
                flex: 1;
                min-height: 0;
                ${config.height === '100%' ? '' : `max-height: ${config.height || '350px'};`}
                overflow-y: auto;
                font-family: 'JetBrains Mono', monospace;
                font-size: 14px;
                line-height: 1.5;
                background: #0d1117;
                color: #e0e0e0;
            }
            .lt-input-line {
                display: flex;
                align-items: center;
                padding: 10px 15px;
                background: #1a1a2e;
                border-top: 1px solid rgba(255,255,255,0.1);
            }
            .lt-prompt {
                color: #22c55e;
                font-family: 'JetBrains Mono', monospace;
                font-size: 14px;
                margin-right: 8px;
                white-space: nowrap;
            }
            .lt-input {
                flex: 1;
                background: transparent;
                border: none;
                color: #e0e0e0;
                font-family: 'JetBrains Mono', monospace;
                font-size: 14px;
                outline: none;
            }
            .lt-input::placeholder {
                color: #808080;
            }
            .lt-line {
                white-space: pre-wrap;
                word-wrap: break-word;
                margin: 0;
                padding: 0;
                line-height: 1.5;
            }
            .lt-line.lt-output-line {
                color: #e0e0e0;
            }
            .lt-error { color: #ef4444; }
            .lt-success { color: #22c55e; }
            .lt-highlight { color: #eab308; }
            .lt-cmd { color: #60a5fa; }
            .lt-dir { color: #60a5fa; font-weight: bold; }
            .lt-exec { color: #22c55e; }
            .lt-prompt-text { color: #22c55e; }
            .lt-command-text { color: #e0e0e0; }
        `;
        document.head.appendChild(styles);
    }

    // =========================================================================
    // EVENT HANDLING
    // =========================================================================

    function _attachEventListeners() {
        state._keydownHandler = function(e) {
            // sudo password mode — intercept all input
            if (state.sudoPending) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    _handleSudoPassword(state.inputEl.value);
                    state.inputEl.value = '';
                } else if (e.key === 'c' && e.ctrlKey) {
                    e.preventDefault();
                    _cancelSudo();
                }
                // During password mode, suppress all other special keys
                return;
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                _handleExecute(state.inputEl.value);
                state.inputEl.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                _historyUp();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                _historyDown();
            } else if (e.key === 'Tab') {
                e.preventDefault();
                _tabComplete();
            } else if (e.key === 'c' && e.ctrlKey) {
                e.preventDefault();
                _interrupt();
            } else if (e.key === 'l' && e.ctrlKey) {
                e.preventDefault();
                _clear();
            }
        };

        state.inputEl.addEventListener('keydown', state._keydownHandler);

        state._clickHandler = function(e) {
            if (state.inputEl && !e.target.closest('a, button, .learning-panel')) {
                state.inputEl.focus();
            }
        };

        if (state.containerEl) {
            state.containerEl.addEventListener('click', state._clickHandler);
        }
    }

    // =========================================================================
    // OBJECTIVE SYSTEM
    // =========================================================================

    function _checkObjective(id) {
        if (state.objectives.find(o => o.id === id) && !state.objectivesCompleted[id]) {
            state.objectivesCompleted[id] = true;
            const obj = state.objectives.find(o => o.id === id);
            _printOutput(`\n<span class="lt-success">\u2713 Objective: ${obj.desc}</span>`);

            if (config.onObjectiveComplete) {
                config.onObjectiveComplete(id);
            }

            const allComplete = state.objectives.every(o => state.objectivesCompleted[o.id]);
            if (allComplete && state.objectives.length > 0) {
                _printOutput(`\n<span class="lt-success">\ud83c\udf89 All objectives complete!</span>`);
            }
        }
    }

    function completeObjective(id) {
        _checkObjective(id);
    }

    // =========================================================================
    // COMMAND EXECUTION
    // =========================================================================

    function _handleExecute(cmdLine) {
        cmdLine = cmdLine.trim();
        if (!cmdLine) return;

        // Add to history
        state.commandHistory.push(cmdLine);
        state.historyIndex = state.commandHistory.length;

        // Display command
        _appendLine(`<span class="lt-prompt-text">${_getPrompt()}</span> <span class="lt-command-text">${_escape(cmdLine)}</span>`);

        // Handle background jobs (trailing &)
        if (/&\s*$/.test(cmdLine) && !cmdLine.includes('&&')) {
            const bgCmd = cmdLine.replace(/&\s*$/, '').trim();
            const jobId = state.nextJobId++;
            const pid = state.nextBgPid++;
            const isNohup = bgCmd.startsWith('nohup ');
            const actualCmd = isNohup ? bgCmd.replace(/^nohup\s+/, '') : bgCmd;
            state.bgJobs.push({ id: jobId, pid: pid, cmd: actualCmd, status: 'Running', nohup: isNohup });
            let bgOutput = '';
            if (isNohup) {
                bgOutput = `<span class="lt-warning">nohup: ignoring input and appending output to 'nohup.out'</span>\n[${jobId}] ${pid}`;
            } else {
                bgOutput = `[${jobId}] ${pid}`;
            }
            _appendOutput(bgOutput);
            // Fire callback with both bg-start and nohup if applicable
            if (config.onCommand) {
                config.onCommand(cmdLine, bgOutput, 'bg-start', [actualCmd]);
                if (isNohup) config.onCommand(cmdLine, bgOutput, 'nohup', [actualCmd]);
            }
            return;
        }

        // Handle pipes
        if (cmdLine.includes('|')) {
            _executePipeline(cmdLine);
            _checkObjective('pipe');
            return;
        }

        // Handle output redirection
        if (cmdLine.includes('>')) {
            _executeRedirect(cmdLine);
            _checkObjective('redirect');
            return;
        }

        // Parse and execute single command
        const { cmd, args } = _parseCommand(cmdLine);
        const output = _executeCommand(cmd, args, cmdLine);

        // Callback fires first — if it returns true, suppress default output
        // Skip callback if sudo is waiting for password (callback fires after auth)
        let handled = false;
        if (config.onCommand && !state.sudoPending) {
            handled = config.onCommand(cmdLine, output, cmd, args);
        }

        if (!handled && output !== null && output !== undefined) {
            _appendOutput(output);
        }

        // Scroll to bottom
        const scrollTarget = state.outputEl || state.containerEl;
        if (scrollTarget) {
            scrollTarget.scrollTop = scrollTarget.scrollHeight;
        }
    }

    function execute(cmdLine) {
        if (!state.isInitialized) {
            console.error('LinuxTerminal: Not initialized');
            return;
        }
        _handleExecute(cmdLine);
    }

    function _parseCommand(cmdLine) {
        const parts = [];
        const singleQuoted = []; // Track which parts were single-quoted (no expansion)
        let current = '';
        let inQuote = false;
        let quoteChar = '';
        let currentIsSingleQuoted = false;

        for (let i = 0; i < cmdLine.length; i++) {
            const char = cmdLine[i];
            if ((char === '"' || char === "'") && !inQuote) {
                inQuote = true;
                quoteChar = char;
                if (char === "'" && current === '') currentIsSingleQuoted = true;
            } else if (char === quoteChar && inQuote) {
                inQuote = false;
                quoteChar = '';
            } else if (char === ' ' && !inQuote) {
                if (current) {
                    parts.push(current);
                    singleQuoted.push(currentIsSingleQuoted);
                    current = '';
                    currentIsSingleQuoted = false;
                }
            } else {
                current += char;
            }
        }
        if (current) {
            parts.push(current);
            singleQuoted.push(currentIsSingleQuoted);
        }

        // Expand variables and braces (skip single-quoted parts — bash behavior)
        const expanded = parts.map((p, idx) => singleQuoted[idx] ? p : _expandVars(p));
        const braceExpanded = [];
        expanded.forEach((p, idx) => {
            if (singleQuoted[idx]) {
                braceExpanded.push(p);
            } else {
                braceExpanded.push(..._expandBraces(p));
            }
        });

        return {
            cmd: braceExpanded[0] || '',
            args: braceExpanded.slice(1)
        };
    }

    // Expand simple brace patterns: path/{a,b,c} → [path/a, path/b, path/c]
    function _expandBraces(str) {
        const match = str.match(/^(.*)\{([^{}]+)\}(.*)$/);
        if (!match) return [str];
        const [, prefix, inner, suffix] = match;
        const items = inner.split(',');
        // Recursively expand in case of nested braces
        return items.flatMap(item => _expandBraces(prefix + item + suffix));
    }

    function _expandVars(str) {
        function _lookup(varName) {
            if (state.env[varName] !== undefined) return state.env[varName];
            // Try uppercase — students often type $shell instead of $SHELL
            const upper = varName.toUpperCase();
            if (state.env[upper] !== undefined) return state.env[upper];
            return '';
        }
        // Handle special shell variables first
        return str.replace(/\$\$/g, state.env.BASHPID || '1234')
                  .replace(/\$\?/g, '0')
                  .replace(/\$\{(\w+)\}/g, (_, v) => _lookup(v))
                  .replace(/\$(\w+)/g, (_, v) => _lookup(v));
    }

    function _executeCommand(cmd, args, fullLine) {
        // Check for --help flag
        if (args.includes('--help') || args.includes('-h')) {
            return _getHelp(cmd);
        }

        switch (cmd) {
            // --------------- Navigation ---------------
            case 'pwd':
                return state.currentDir;

            case 'cd': {
                const result = _cd(args);
                _checkObjective('cd');
                return result;
            }

            case 'ls': {
                const result = _ls(args);
                _checkObjective('ls');
                return result;
            }

            // --------------- File Operations ---------------
            case 'cat': {
                const result = _cat(args);
                _checkObjective('cat');
                return result;
            }

            case 'head': {
                const result = _head(args);
                _checkObjective('head');
                return result;
            }

            case 'tail': {
                const result = _tail(args);
                _checkObjective('tail');
                return result;
            }

            case 'less':
            case 'more':
                return _cat(args); // Simplified

            case 'touch': {
                const result = _touch(args);
                _checkObjective('touch');
                return result;
            }

            case 'mkdir': {
                const result = _mkdir(args);
                _checkObjective('mkdir');
                return result;
            }

            case 'rm': {
                const result = _rm(args);
                _checkObjective('rm');
                return result;
            }

            case 'rmdir':
                return _rmdir(args);

            case 'cp': {
                const result = _cp(args);
                _checkObjective('cp');
                return result;
            }

            case 'mv': {
                const result = _mv(args);
                _checkObjective('mv');
                return result;
            }

            case 'file':
                return _file(args);

            case 'stat':
                return _stat(args);

            // --------------- Search ---------------
            case 'find': {
                const result = _find(args);
                _checkObjective('find');
                return result;
            }

            case 'grep': {
                const result = _grep(args);
                _checkObjective('grep');
                return result;
            }

            case 'which':
                return _which(args);

            case 'whereis':
                return _whereis(args);

            case 'locate':
                return _locate(args);

            // --------------- User Info ---------------
            case 'whoami':
                return state.currentUser.username;

            case 'id':
                return _id(args);

            case 'groups':
                return _groups(args);

            case 'who':
                return `${state.currentUser.username}  pts/0        Dec 27 09:00 (:0)`;

            case 'w':
                return ` 09:30:00 up 1 day,  2:30,  1 user,  load average: 0.15, 0.10, 0.05
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT
${state.currentUser.username}  pts/0    :0               09:00    0.00s  0.05s  0.01s bash`;

            case 'users':
                return state.currentUser.username;

            case 'last':
                return `${state.currentUser.username}  pts/0        :0               Dec 27 09:00   still logged in
reboot   system boot  6.1.0-hexworth   Dec 27 06:30   still running`;

            // --------------- System Info ---------------
            case 'uname': {
                const result = _uname(args);
                _checkObjective('uname');
                return result;
            }

            case 'hostname':
                return config.hostname;

            case 'uptime':
                return ' 09:30:00 up 1 day,  2:30,  1 user,  load average: 0.15, 0.10, 0.05';

            case 'date':
                return new Date().toString();

            case 'cal':
                return _cal();

            case 'df': {
                const result = _df(args);
                _checkObjective('df');
                return result;
            }

            case 'du':
                return _du(args);

            case 'tree': {
                const result = _tree(args);
                _checkObjective('tree');
                return result;
            }

            case 'free': {
                const result = _free(args);
                _checkObjective('free');
                return result;
            }

            case 'ps': {
                const result = _ps(args);
                _checkObjective('ps');
                return result;
            }

            case 'top':
                return '<span class="lt-output-line">top - 09:30:00 up 1 day, 1 user, load average: 0.15, 0.10, 0.05\nTasks: 127 total, 1 running, 126 sleeping\n%Cpu(s): 2.3 us, 1.0 sy, 0.0 ni, 96.5 id\nMiB Mem: 8000.0 total, 4000.0 free, 2000.0 used\n\n  PID USER      PR  NI    VIRT    RES  COMMAND\n    1 root      20   0  168940  11340  systemd\n  890 student   20   0   18520   3940  bash\n</span><span class="lt-highlight">[Press q to exit - simulated]</span>';

            case 'htop':
                return '<span class="lt-error">htop: command not installed. Try: sudo apt install htop</span>';

            // --------------- Text Processing ---------------
            case 'echo': {
                // Variables already expanded by _parseCommand → _expandVars
                const result = args.join(' ');
                _checkObjective('echo');
                // Return a zero-width space for empty echo so it renders a blank line
                return result || '\u200b';
            }

            case 'printf':
                return args.join(' ').replace(/\\n/g, '\n').replace(/\\t/g, '\t');

            case 'wc': {
                const result = _wc(args);
                _checkObjective('wc');
                return result;
            }

            case 'sort': {
                const result = _sort(args);
                _checkObjective('sort');
                return result;
            }

            case 'uniq':
                return _uniq(args);

            case 'cut': {
                const result = _cut(args);
                _checkObjective('cut');
                return result;
            }

            case 'tr':
                return '<span class="lt-highlight">tr: character translation - see man tr</span>';

            case 'sed': {
                const result = _sed(args);
                _checkObjective('sed');
                return result;
            }

            case 'awk': {
                const result = _awk(args);
                _checkObjective('awk');
                return result;
            }

            // --------------- Permissions ---------------
            case 'chmod': {
                const result = _chmod(args);
                _checkObjective('chmod');
                return result;
            }

            case 'chown': {
                const result = _chown(args);
                _checkObjective('chown');
                return result;
            }

            case 'chgrp':
                return _chgrp(args);

            case 'umask':
                return _umask(args);

            // --------------- Environment ---------------
            case 'env':
            case 'printenv':
                return Object.entries(state.env).map(([k, v]) => `${k}=${v}`).join('\n');

            case 'export':
                return _export(args);

            case 'set':
                return Object.entries(state.env).map(([k, v]) => `${k}=${v}`).join('\n');

            case 'unset':
                if (args[0]) delete state.env[args[0]];
                return null;

            // --------------- Help & Docs ---------------
            case 'help':
                return _help();

            case 'man': {
                const result = _man(args);
                _checkObjective('man');
                return result;
            }

            case 'info':
                return _man(args);

            case 'whatis': {
                if (!args.length) return 'whatis what?';
                const descriptions = {
                    'ls': 'ls (1) - list directory contents',
                    'cd': 'cd (1) - change the working directory',
                    'cat': 'cat (1) - concatenate files and print on the standard output',
                    'grep': 'grep (1) - print lines that match patterns',
                    'chmod': 'chmod (1) - change file mode bits',
                    'chown': 'chown (1) - change file owner and group',
                    'man': 'man (1) - an interface to the system reference manuals',
                    'whoami': 'whoami (1) - print effective user name',
                    'id': 'id (1) - print real and effective user and group IDs',
                    'pwd': 'pwd (1) - print name of current/working directory',
                    'cp': 'cp (1) - copy files and directories',
                    'mv': 'mv (1) - move (rename) files',
                    'rm': 'rm (1) - remove files or directories',
                    'mkdir': 'mkdir (1) - make directories',
                    'touch': 'touch (1) - change file timestamps',
                    'find': 'find (1) - search for files in a directory hierarchy',
                    'head': 'head (1) - output the first part of files',
                    'tail': 'tail (1) - output the last part of files',
                    'wc': 'wc (1) - print newline, word, and byte counts for each file',
                    'sort': 'sort (1) - sort lines of text files',
                    'uniq': 'uniq (1) - report or omit repeated lines',
                    'cut': 'cut (1) - remove sections from each line of files',
                    'sed': 'sed (1) - stream editor for filtering and transforming text',
                    'awk': 'awk (1) - pattern scanning and processing language',
                    'echo': 'echo (1) - display a line of text',
                    'ps': 'ps (1) - report a snapshot of the current processes',
                    'kill': 'kill (1) - send a signal to a process',
                    'df': 'df (1) - report file system disk space usage',
                    'du': 'du (1) - estimate file space usage',
                    'free': 'free (1) - display amount of free and used memory',
                    'uname': 'uname (1) - print system information',
                    'ping': 'ping (8) - send ICMP ECHO_REQUEST to network hosts',
                    'ssh': 'ssh (1) - OpenSSH remote login client',
                    'scp': 'scp (1) - OpenSSH secure file copy',
                    'tar': 'tar (1) - an archiving utility',
                    'whatis': 'whatis (1) - display one-line manual page descriptions',
                    'type': 'type (1) - write a description of command type',
                    'history': 'history (3) - GNU History Library'
                };
                return descriptions[args[0]] || `${args[0]}: nothing appropriate.`;
            }

            case 'apropos': {
                if (!args.length) return 'apropos what?';
                return `${args[0]}: nothing appropriate.`;
            }

            case 'type':
                return _type(args);

            case 'alias':
                return 'll=\'ls -la\'\nla=\'ls -A\'\nl=\'ls -CF\'';

            // --------------- History ---------------
            case 'history':
                return state.commandHistory.map((c, i) => `  ${i + 1}  ${c}`).join('\n');

            // --------------- Terminal ---------------
            case 'clear':
                _clear();
                return null;

            case 'reset':
                _clear();
                return null;

            case 'exit':
            case 'logout':
                return '<span class="lt-highlight">logout: cannot exit simulated terminal</span>';

            // --------------- Network (simulated) ---------------
            case 'ping':
                return `PING ${args[0] || 'localhost'} (127.0.0.1): 56 data bytes\n64 bytes from 127.0.0.1: icmp_seq=0 ttl=64 time=0.1 ms\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.1 ms\n--- ${args[0] || 'localhost'} ping statistics ---\n2 packets transmitted, 2 received, 0% packet loss`;

            case 'ifconfig': {
                _checkObjective('ifconfig');
                return `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500\n        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255\n        inet6 fe80::1  prefixlen 64  scopeid 0x20<link>\n        ether 00:11:22:33:44:55  txqueuelen 1000\n\nlo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536\n        inet 127.0.0.1  netmask 255.0.0.0\n        inet6 ::1  prefixlen 128  scopeid 0x10<host>`;
            }

            case 'ip': {
                _checkObjective('ifconfig');
                const ipSub = args[0] || 'addr';
                if (ipSub === 'addr' || ipSub === 'a' || ipSub === 'address') {
                    return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 state UNKNOWN\n    inet 127.0.0.1/8 scope host lo\n    inet6 ::1/128 scope host\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 state UP\n    inet 192.168.1.100/24 brd 192.168.1.255 scope global eth0\n    inet6 fe80::1/64 scope link`;
                }
                if (ipSub === 'link' || ipSub === 'l') {
                    return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN\n    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP\n    link/ether 00:11:22:33:44:55 brd ff:ff:ff:ff:ff:ff`;
                }
                if (ipSub === 'route' || ipSub === 'r') {
                    return `default via 192.168.1.1 dev eth0 proto dhcp\n192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.100`;
                }
                if (ipSub === 'neigh' || ipSub === 'n') {
                    return `192.168.1.1 dev eth0 lladdr aa:bb:cc:dd:ee:ff REACHABLE`;
                }
                return `Usage: ip [ addr | link | route | neigh ] [show]`;
            }

            case 'netstat':
            case 'ss': {
                const ssFlags = args.join('');
                const ssLines = ['Netid  State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port'];
                if (ssFlags.includes('t') || ssFlags.includes('a') || !ssFlags) {
                    ssLines.push('tcp    LISTEN  0       128     0.0.0.0:22            0.0.0.0:*');
                    ssLines.push('tcp    LISTEN  0       128     0.0.0.0:80            0.0.0.0:*');
                    if (!ssFlags.includes('l')) ssLines.push('tcp    ESTAB   0       0       192.168.1.100:22      192.168.1.1:54321');
                }
                if (ssFlags.includes('u') || ssFlags.includes('a')) {
                    ssLines.push('udp    UNCONN  0       0       0.0.0.0:68            0.0.0.0:*');
                }
                if (ssFlags.includes('n')) {
                    return ssLines.join('\n');
                }
                return ssLines.join('\n').replace(':22 ', ':ssh ').replace(':80 ', ':http ').replace(':68 ', ':bootpc ');
            }

            case 'mtr': {
                const mtrTarget = args.find(a => !a.startsWith('-')) || 'localhost';
                return `Start: ${new Date().toLocaleTimeString()}\nHOST: ${state.env.HOSTNAME || 'linux-mastery'}    Loss%  Snt   Last   Avg  Best  Wrst\n  1.|-- gateway           0.0%    10    1.2   1.3   0.9   2.1\n  2.|-- isp-router        0.0%    10    5.4   5.6   4.8   7.2\n  3.|-- ${mtrTarget}      0.0%    10   12.1  12.3  11.5  14.2`;
            }

            case 'curl': {
                const curlUrl = args.find(a => !a.startsWith('-')) || 'http://example.com';
                if (args.includes('-I') || args.includes('--head')) {
                    return `HTTP/1.1 200 OK\nContent-Type: text/html; charset=UTF-8\nContent-Length: 1256\nConnection: keep-alive\nServer: nginx/1.18.0\nDate: ${new Date().toUTCString()}\nCache-Control: max-age=604800`;
                }
                if (args.includes('-o') || args.includes('-O')) {
                    return `<span class="lt-highlight">curl: downloading ${curlUrl} to file</span>`;
                }
                return `<!DOCTYPE html>\n<html>\n<head><title>Example Page</title></head>\n<body>\n<h1>Example Domain</h1>\n<p>This domain is for use in illustrative examples.</p>\n</body>\n</html>`;
            }

            case 'wget': {
                const wgetUrl = args.find(a => !a.startsWith('-')) || 'http://example.com';
                return `--${new Date().toISOString()}--  ${wgetUrl}\nResolving ${new URL('http://' + wgetUrl.replace(/https?:\/\//, '')).hostname}... 93.184.216.34\nConnecting to ${wgetUrl}... connected.\nHTTP request sent, awaiting response... 200 OK\nLength: 1256 (1.2K) [text/html]\nSaving to: 'index.html'\n\nindex.html          100%[==================>]   1.23K  --.-KB/s    in 0s\n\n${new Date().toISOString()} - 'index.html' saved [1256/1256]`;
            }

            // --------------- Package Management (simulated) ---------------
            case 'apt':
            case 'apt-get': {
                _checkObjective('apt');
                return '<span class="lt-highlight">apt: package management simulated - requires sudo</span>';
            }

            case 'dpkg':
                return '<span class="lt-highlight">dpkg: package query simulated</span>';

            case 'sudo': {
                const result = _sudo(args);
                _checkObjective('sudo');
                return result;
            }

            // --------------- Job Control ---------------
            case 'jobs': {
                if (state.bgJobs.length === 0) return null;
                return state.bgJobs.map(j =>
                    `[${j.id}]${j.id === state.bgJobs.length ? '+' : '-'}  ${j.status}                 ${j.cmd}${j.status === 'Running' ? ' &' : ''}`
                ).join('\n');
            }

            case 'fg': {
                const fgId = args[0] ? parseInt(args[0].replace('%', '')) : (state.bgJobs.length > 0 ? state.bgJobs[state.bgJobs.length - 1].id : 0);
                const fgJob = state.bgJobs.find(j => j.id === fgId);
                if (!fgJob) return `bash: fg: ${args[0] || '%1'}: no such job`;
                fgJob.status = 'Done';
                state.bgJobs = state.bgJobs.filter(j => j.status !== 'Done');
                return `${fgJob.cmd}\n<span class="lt-highlight">[${fgJob.id}] Done</span>`;
            }

            case 'bg': {
                const bgId = args[0] ? parseInt(args[0].replace('%', '')) : (state.bgJobs.length > 0 ? state.bgJobs[state.bgJobs.length - 1].id : 0);
                const bgJob = state.bgJobs.find(j => j.id === bgId);
                if (!bgJob) return `bash: bg: ${args[0] || '%1'}: no such job`;
                bgJob.status = 'Running';
                return `[${bgJob.id}]+ ${bgJob.cmd} &`;
            }

            case 'nohup': {
                if (args.length === 0) return 'nohup: missing operand';
                const nohupCmd = args.join(' ');
                return `<span class="lt-warning">nohup: ignoring input and appending output to 'nohup.out'</span>`;
            }

            case 'disown': {
                const disId = args[0] ? parseInt(args[0].replace('%', '')) : (state.bgJobs.length > 0 ? state.bgJobs[state.bgJobs.length - 1].id : 0);
                state.bgJobs = state.bgJobs.filter(j => j.id !== disId);
                return null;
            }

            // --------------- Miscellaneous ---------------
            case 'sleep':
                return `<span class="lt-highlight">sleep: would wait ${args[0] || 1} seconds</span>`;

            case 'true':
                return null;

            case 'false':
                return null;

            case 'yes':
                return 'y\ny\ny\n<span class="lt-highlight">[interrupted - infinite output]</span>';

            case 'seq': {
                const seqStart = parseInt(args[0]) || 1;
                const seqEnd = parseInt(args[1]) || parseInt(args[0]) || 10;
                return Array.from({ length: Math.min(seqEnd - seqStart + 1, 20) }, (_, i) => seqStart + i).join('\n');
            }

            case 'time':
                return `real\t0m0.001s\nuser\t0m0.000s\nsys\t0m0.001s`;

            case 'xargs':
                return '<span class="lt-highlight">xargs: would build and execute command lines</span>';

            case 'tee':
                return '<span class="lt-highlight">tee: would write to file and stdout</span>';

            case 'tar': {
                _checkObjective('tar');
                return '<span class="lt-highlight">tar: archive operations simulated</span>';
            }

            case 'gzip':
            case 'gunzip':
            case 'zip':
            case 'unzip':
                return '<span class="lt-highlight">Compression operations simulated</span>';

            case 'ln': {
                const result = _ln(args);
                _checkObjective('ln');
                return result;
            }

            case 'readlink':
                return '<span class="lt-highlight">readlink: would show symlink target</span>';

            case 'basename':
                return args[0] ? args[0].split('/').pop() : '';

            case 'dirname':
                return args[0] ? args[0].split('/').slice(0, -1).join('/') || '/' : '.';

            case 'realpath':
                return _resolvePath(args[0] || '.');

            case 'kill': {
                _checkObjective('kill');
                const sigArg = args.find(a => a.startsWith('-'));
                const pidArg = args.find(a => !a.startsWith('-')) || '';
                const sig = sigArg ? sigArg.replace('-', '') : 'TERM';
                return `<span class="lt-highlight">kill: sent signal ${sig.toUpperCase()} to process ${pidArg}</span>`;
            }

            case 'killall': {
                if (!args[0]) return 'killall: too few arguments';
                const kaName = args.find(a => !a.startsWith('-')) || '';
                return `<span class="lt-highlight">killall: sent signal to all ${kaName} processes</span>`;
            }

            case 'pkill': {
                if (!args[0]) return 'pkill: no matching criteria specified';
                const pkPattern = args.find(a => !a.startsWith('-')) || '';
                return `<span class="lt-highlight">pkill: signalled processes matching "${pkPattern}"</span>`;
            }

            case 'pgrep': {
                if (!args[0]) return 'pgrep: no matching criteria specified';
                const pgPattern = args.find(a => !a.startsWith('-')) || '';
                // Return simulated PIDs for common processes
                const pgMap = { 'nginx': '599\n600', 'bash': String(state.env.BASHPID || '1234'), 'sshd': '512', 'apache': '601\n602', 'cron': '410', 'systemd': '1' };
                const pgMatch = Object.entries(pgMap).find(([k]) => pgPattern.includes(k) || k.includes(pgPattern));
                return pgMatch ? pgMatch[1] : `<span class="lt-highlight">${Math.floor(Math.random() * 9000 + 1000)}</span>`;
            }

            // --------------- Network Tools ---------------
            case 'traceroute':
            case 'tracepath': {
                const trTarget = args[0] || 'localhost';
                return `traceroute to ${trTarget}, 30 hops max, 60 byte packets\n 1  gateway (10.0.0.1)  1.234 ms  1.112 ms  0.998 ms\n 2  isp-router (172.16.0.1)  5.678 ms  5.432 ms  5.210 ms\n 3  ${trTarget} (93.184.216.34)  12.345 ms  12.123 ms  11.998 ms`;
            }

            case 'dig': {
                const digTarget = args.find(a => !a.startsWith('-') && !a.startsWith('+') && !a.startsWith('@')) || 'localhost';
                const digType = args.find(a => ['A', 'AAAA', 'MX', 'NS', 'TXT', 'CNAME', 'SOA', 'PTR', 'ANY'].includes(a.toUpperCase())) || 'A';
                return `; <<>> DiG 9.18.18 <<>> ${digTarget} ${digType}\n;; global options: +cmd\n;; Got answer:\n;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 12345\n;; ANSWER SECTION:\n${digTarget}.\t\t300\tIN\t${digType.toUpperCase()}\t93.184.216.34\n\n;; Query time: 23 msec\n;; SERVER: 8.8.8.8#53(8.8.8.8)\n;; WHEN: ${new Date().toUTCString()}\n;; MSG SIZE  rcvd: 56`;
            }

            case 'nslookup': {
                const nsTarget = args[0] || 'localhost';
                return `Server:\t\t8.8.8.8\nAddress:\t8.8.8.8#53\n\nNon-authoritative answer:\nName:\t${nsTarget}\nAddress: 93.184.216.34`;
            }

            case 'host': {
                const hostTarget = args[0] || 'localhost';
                return `${hostTarget} has address 93.184.216.34\n${hostTarget} has IPv6 address 2606:2800:220:1:248:1893:25c8:1946\n${hostTarget} mail is handled by 0 ${hostTarget}.`;
            }

            // --------------- SSH Tools ---------------
            case 'ssh': {
                if (args.length === 0) return 'usage: ssh [-p port] [user@]hostname [command]';
                if (args.includes('-keygen') || args[0] === '-keygen') return `<span class="lt-error">Did you mean: ssh-keygen?</span>`;
                const sshTarget = args.find(a => !a.startsWith('-')) || '';
                return `<span class="lt-highlight">ssh: would connect to ${sshTarget}\nssh: connection simulated (not a real network)</span>`;
            }

            case 'ssh-keygen': {
                const keyType = args.includes('-t') ? args[args.indexOf('-t') + 1] || 'rsa' : 'rsa';
                const keyBits = keyType === 'ed25519' ? 256 : 3072;
                return `Generating public/private ${keyType} key pair.\nYour identification has been saved in /home/${state.currentUser?.name || 'student'}/.ssh/id_${keyType}\nYour public key has been saved in /home/${state.currentUser?.name || 'student'}/.ssh/id_${keyType}.pub\nThe key fingerprint is:\nSHA256:xR4jK9mN2pL5qW8vT1yB3zF6hD0cA7eG+nU4sO2iVw ${state.currentUser?.name || 'student'}@${state.env.HOSTNAME || 'linux-mastery'}\nThe key's randomart image is:\n+---[${keyType.toUpperCase()} ${keyBits}]----+\n|       .o+.      |\n|      . =o.o     |\n|     . o.+= .    |\n|    . +.=o.o     |\n|   . o.=S+.      |\n|    o.+oB.+      |\n|   ..+.= + .     |\n|    .o= . .      |\n|    .oE          |\n+----[SHA256]-----+`;
            }

            case 'scp': {
                if (args.length < 2) return 'usage: scp [-r] source ... target';
                return `<span class="lt-highlight">scp: would copy ${args[args.length - 2]} to ${args[args.length - 1]}\nscp: transfer simulated (not a real network)</span>`;
            }

            case 'ssh-copy-id': {
                const scpTarget = args.find(a => !a.startsWith('-')) || 'user@host';
                return `<span class="lt-highlight">/usr/bin/ssh-copy-id: INFO: attempting to log in with the new key(s)\nNumber of key(s) added: 1\n\nNow try logging into "${scpTarget}" to verify.</span>`;
            }

            // --------------- System Services ---------------
            case 'systemctl': {
                const sctlAction = args[0] || 'list-units';
                const sctlUnit = args[1] || '';
                const sctlServices = {
                    'ssh': { active: 'active', enabled: 'enabled', desc: 'OpenBSD Secure Shell server' },
                    'sshd': { active: 'active', enabled: 'enabled', desc: 'OpenSSH server daemon' },
                    'nginx': { active: 'active', enabled: 'enabled', desc: 'A high performance web server' },
                    'apache2': { active: 'inactive', enabled: 'disabled', desc: 'The Apache HTTP Server' },
                    'cron': { active: 'active', enabled: 'enabled', desc: 'Regular background program processing' },
                    'networking': { active: 'active', enabled: 'enabled', desc: 'Raise network interfaces' },
                    'ufw': { active: 'active', enabled: 'enabled', desc: 'Uncomplicated firewall' },
                    'mysql': { active: 'inactive', enabled: 'disabled', desc: 'MySQL Community Server' },
                    'docker': { active: 'inactive', enabled: 'disabled', desc: 'Docker Application Container Engine' },
                    'rsyslog': { active: 'active', enabled: 'enabled', desc: 'System Logging Service' },
                };
                const svc = sctlServices[sctlUnit.replace('.service', '')] || null;
                switch (sctlAction) {
                    case 'status': {
                        if (!sctlUnit) return 'Unit name argument required.';
                        const s = svc || { active: 'inactive', enabled: 'disabled', desc: 'Unknown service' };
                        const dot = s.active === 'active' ? '<span style="color:#22c55e">●</span>' : '<span style="color:#888">●</span>';
                        return `${dot} ${sctlUnit}\n     Loaded: loaded (/lib/systemd/system/${sctlUnit}.service; ${s.enabled})\n     Active: ${s.active} (running) since ${new Date().toUTCString()}\n   Main PID: ${Math.floor(Math.random() * 9000 + 1000)} (${sctlUnit.replace('.service','')})\n     CGroup: /system.slice/${sctlUnit}.service`;
                    }
                    case 'start':
                        if (!sctlUnit) return 'Unit name argument required.';
                        if (svc) svc.active = 'active';
                        return null;
                    case 'stop':
                        if (!sctlUnit) return 'Unit name argument required.';
                        if (svc) svc.active = 'inactive';
                        return null;
                    case 'restart':
                        if (!sctlUnit) return 'Unit name argument required.';
                        if (svc) svc.active = 'active';
                        return null;
                    case 'reload':
                        if (!sctlUnit) return 'Unit name argument required.';
                        return null;
                    case 'enable':
                        if (!sctlUnit) return 'Unit name argument required.';
                        if (svc) svc.enabled = 'enabled';
                        return `Created symlink /etc/systemd/system/multi-user.target.wants/${sctlUnit}.service -> /lib/systemd/system/${sctlUnit}.service.`;
                    case 'disable':
                        if (!sctlUnit) return 'Unit name argument required.';
                        if (svc) svc.enabled = 'disabled';
                        return `Removed /etc/systemd/system/multi-user.target.wants/${sctlUnit}.service.`;
                    case 'is-active':
                        return svc ? svc.active : 'inactive';
                    case 'is-enabled':
                        return svc ? svc.enabled : 'disabled';
                    case 'list-units':
                    default:
                        return Object.entries(sctlServices).filter(([,v]) => v.active === 'active').map(([k, v]) =>
                            `  ${k}.service\t\tloaded active running\t${v.desc}`
                        ).join('\n');
                }
            }

            case 'journalctl': {
                const jUnit = args.includes('-u') ? args[args.indexOf('-u') + 1] || '' : '';
                const jLines = args.includes('-n') ? parseInt(args[args.indexOf('-n') + 1]) || 10 : 5;
                const now = new Date();
                const logs = [];
                for (let i = jLines - 1; i >= 0; i--) {
                    const t = new Date(now - i * 60000);
                    const ts = t.toLocaleString('en-US', { month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
                    const src = jUnit || ['systemd', 'kernel', 'sshd', 'cron', 'nginx'][i % 5];
                    const msgs = ['Started service.', 'Received connection.', 'Process exited normally.', 'Configuration loaded.', 'Listening on port 80.'];
                    logs.push(`${ts} ${state.env.HOSTNAME || 'linux-mastery'} ${src}[${1000 + i}]: ${msgs[i % msgs.length]}`);
                }
                return `-- Journal begins at ${now.toUTCString()} --\n` + logs.join('\n');
            }

            // --------------- Cron ---------------
            case 'crontab': {
                if (!state._crontab) state._crontab = ['# Edit this file to introduce tasks to be run by cron.', '# m h dom mon dow command'];
                if (args.includes('-l')) {
                    return state._crontab.join('\n');
                }
                if (args.includes('-e')) {
                    return `<span class="lt-highlight">crontab: editing crontab\nTip: Use <code>crontab-add "schedule" "command"</code> to add entries in this terminal.</span>`;
                }
                if (args.includes('-r')) {
                    state._crontab = ['# Edit this file to introduce tasks to be run by cron.', '# m h dom mon dow command'];
                    return '<span class="lt-highlight">crontab: crontab removed</span>';
                }
                return 'usage: crontab [-l | -e | -r]';
            }

            case 'crontab-add': {
                if (!state._crontab) state._crontab = ['# Edit this file to introduce tasks to be run by cron.', '# m h dom mon dow command'];
                if (args.length < 2) return 'usage: crontab-add "schedule" "command"\nExample: crontab-add "0 2 * * *" "/usr/bin/backup.sh"';
                // Join all args and try to parse
                const cronFull = args.join(' ');
                state._crontab.push(cronFull);
                return `<span class="lt-highlight">crontab: entry added: ${_escape(cronFull)}</span>`;
            }

            // --------------- Text Editors ---------------
            case 'nano': {
                const nanoFile = args.find(a => !a.startsWith('-')) || '';
                if (!nanoFile) return 'Usage: nano [filename]';
                // Check if file exists, show content
                const nanoPath = _resolvePath(nanoFile);
                const nanoNode = _getNode(nanoPath);
                if (nanoNode && typeof nanoNode === 'string') {
                    return `<span class="lt-highlight">nano: opening ${nanoFile} (read-only in this terminal)</span>\n<span class="lt-output">${_escape(nanoNode)}</span>\n<span class="lt-highlight">[ Use cat/echo to view/create files in this terminal ]</span>`;
                }
                return `<span class="lt-highlight">nano: would create new file ${nanoFile}\n[ Use touch/echo to create files in this terminal ]</span>`;
            }

            case 'vim':
            case 'vi': {
                const viFile = args.find(a => !a.startsWith('-') && a !== '--') || '';
                if (!viFile) return `<span class="lt-highlight">vim: opening empty buffer (read-only in this terminal)\n[ Press i for insert, :wq to save, :q! to quit ]\n[ Use cat/echo to view/create files in this terminal ]</span>`;
                const viPath = _resolvePath(viFile);
                const viNode = _getNode(viPath);
                if (viNode && typeof viNode === 'string') {
                    return `<span class="lt-highlight">vim: opening ${viFile} (read-only in this terminal)</span>\n<span class="lt-output">${_escape(viNode)}</span>\n<span class="lt-highlight">[ Use cat/echo to view/create files in this terminal ]</span>`;
                }
                return `<span class="lt-highlight">vim: would create new file ${viFile}\n[ Use touch/echo to create files in this terminal ]</span>`;
            }

            case '/bin/bash':
            case '/bin/sh':
            case '/usr/bin/bash':
            case 'bash':
            case 'sh':
                return `<span class="lt-highlight">bash: cannot start a nested shell in this terminal. Use <code>echo $SHELL</code> to see your current shell.</span>`;

            default:
                // Check if it's an assignment (VAR=value)
                if (cmd.includes('=')) {
                    const [varName, ...valueParts] = cmd.split('=');
                    state.env[varName] = valueParts.join('=');
                    return null;
                }
                // When suppressUnknown is set, let the onCommand callback handle unknown commands
                if (config.suppressUnknown && config.onCommand) return null;
                return `<span class="lt-error">${_escape(cmd)}: command not found</span>`;
        }
    }

    // =========================================================================
    // COMMAND IMPLEMENTATIONS
    // =========================================================================

    function _cd(args) {
        let target = args[0] || state.currentUser.home;

        if (target === '~') target = state.currentUser.home;
        if (target === '-') target = state.env.OLDPWD || state.currentDir;
        if (target.startsWith('~/')) target = state.currentUser.home + target.slice(1);

        const newPath = _resolvePath(target);
        const node = state.fs[newPath];

        if (!node) {
            return `<span class="lt-error">cd: ${target}: No such file or directory</span>`;
        }
        if (node.type !== 'dir') {
            return `<span class="lt-error">cd: ${target}: Not a directory</span>`;
        }

        state.env.OLDPWD = state.currentDir;
        state.currentDir = newPath;
        state.env.PWD = newPath;
        _updatePrompt();
        return null;
    }

    function _ls(args) {
        let showAll = false;
        let longFormat = false;
        let humanReadable = false;
        let targetPaths = [];

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
            const path = _resolvePath(targetPath);
            const node = state.fs[path];

            if (!node) {
                results.push(`<span class="lt-error">ls: cannot access '${targetPath}': No such file or directory</span>`);
                continue;
            }

            if (node.type === 'file') {
                if (longFormat) {
                    results.push(_formatLsLong(path, node));
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
                        results.push(_formatLsLong(path, node));
                    } else if (item === '..') {
                        const parentPath = path.split('/').slice(0, -1).join('/') || '/';
                        results.push(_formatLsLong(parentPath, state.fs[parentPath] || node));
                    } else {
                        const itemPath = path === '/' ? `/${item}` : `${path}/${item}`;
                        const itemNode = state.fs[itemPath];
                        if (itemNode) {
                            results.push(_formatLsLong(itemPath, itemNode));
                        }
                    }
                }
            } else {
                const colored = items.map(item => {
                    const itemPath = path === '/' ? `/${item}` : `${path}/${item}`;
                    const itemNode = state.fs[itemPath];
                    if (item === '.' || item === '..') return `<span class="lt-dir">${item}</span>`;
                    if (!itemNode) return item;
                    if (itemNode.type === 'dir') return `<span class="lt-dir">${item}/</span>`;
                    if (itemNode.perms && itemNode.perms.includes('x')) return `<span class="lt-exec">${item}*</span>`;
                    return item;
                });
                results.push(colored.join('  '));
            }
        }

        return results.join('\n');
    }

    function _formatLsLong(path, node) {
        const name = path.split('/').pop() || '/';
        const size = (node.size || 4096).toString().padStart(8);
        const date = 'Dec 27 09:00';
        let displayName = name;

        if (node.type === 'dir') {
            displayName = `<span class="lt-dir">${name}</span>`;
        } else if (node.perms && node.perms.includes('x')) {
            displayName = `<span class="lt-exec">${name}</span>`;
        }

        return `${node.perms} 1 ${node.owner.padEnd(8)} ${node.group.padEnd(8)} ${size} ${date} ${displayName}`;
    }

    function _canRead(node) {
        if (state.currentUser.uid === 0) return true; // root can read anything
        if (node.owner === state.currentUser.username) {
            return node.perms && node.perms[1] === 'r';
        }
        // Check group/other read permission (simplified: check 'other' read bit)
        return node.perms && node.perms[7] === 'r';
    }

    function _cat(args) {
        if (args.length === 0) {
            return '<span class="lt-highlight">cat: reading from stdin (Ctrl+C to exit)</span>';
        }

        const results = [];
        for (const arg of args) {
            if (arg.startsWith('-')) continue;
            const path = _resolvePath(arg);
            const node = state.fs[path];

            if (!node) {
                results.push(`<span class="lt-error">cat: ${arg}: No such file or directory</span>`);
            } else if (node.type === 'dir') {
                results.push(`<span class="lt-error">cat: ${arg}: Is a directory</span>`);
            } else if (!_canRead(node)) {
                results.push(`<span class="lt-error">cat: ${arg}: Permission denied</span>`);
            } else {
                results.push(node.content || '');
            }
        }
        return results.join('\n');
    }

    function _head(args) {
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
            return '<span class="lt-highlight">head: reading from stdin</span>';
        }

        const results = [];
        for (const file of files) {
            const path = _resolvePath(file);
            const node = state.fs[path];
            if (!node) {
                results.push(`<span class="lt-error">head: ${file}: No such file</span>`);
            } else if (node.content) {
                results.push(node.content.split('\n').slice(0, lines).join('\n'));
            }
        }
        return results.join('\n');
    }

    function _tail(args) {
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
            return '<span class="lt-highlight">tail: reading from stdin</span>';
        }

        const results = [];
        for (const file of files) {
            const path = _resolvePath(file);
            const node = state.fs[path];
            if (!node) {
                results.push(`<span class="lt-error">tail: ${file}: No such file</span>`);
            } else if (node.content) {
                const allLines = node.content.split('\n');
                results.push(allLines.slice(-lines).join('\n'));
            }
        }
        return results.join('\n');
    }

    function _touch(args) {
        for (const arg of args) {
            if (arg.startsWith('-')) continue;
            const path = _resolvePath(arg);
            if (!state.fs[path]) {
                const parentPath = path.split('/').slice(0, -1).join('/') || '/';
                const fileName = path.split('/').pop();
                const parent = state.fs[parentPath];
                if (parent && parent.type === 'dir') {
                    state.fs[path] = {
                        type: 'file',
                        perms: '-rw-r--r--',
                        owner: state.currentUser.username,
                        group: state.currentUser.username,
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

    function _mkdir(args) {
        let makeParents = false;
        const dirs = [];

        for (const arg of args) {
            if (arg === '-p') makeParents = true;
            else if (!arg.startsWith('-')) dirs.push(arg);
        }

        // Collect errors instead of returning early — process ALL dirs like real mkdir
        const errors = [];

        for (const dir of dirs) {
            const path = _resolvePath(dir);

            if (makeParents) {
                // Build each segment of the path
                const parts = path.split('/').filter(Boolean);
                let current = '';
                for (const part of parts) {
                    current += '/' + part;
                    if (!state.fs[current]) {
                        const parentDir = current.split('/').slice(0, -1).join('/') || '/';
                        const parentNode = state.fs[parentDir];
                        state.fs[current] = {
                            type: 'dir',
                            perms: 'drwxr-xr-x',
                            owner: state.currentUser.username,
                            group: state.currentUser.username,
                            children: []
                        };
                        if (parentNode && parentNode.children && !parentNode.children.includes(part)) {
                            parentNode.children.push(part);
                        }
                    }
                }
            } else {
                if (state.fs[path]) {
                    errors.push(`<span class="lt-error">mkdir: cannot create directory '${dir}': File exists</span>`);
                    continue;
                }

                const parentPath = path.split('/').slice(0, -1).join('/') || '/';
                const dirName = path.split('/').pop();
                const parent = state.fs[parentPath];

                if (!parent) {
                    errors.push(`<span class="lt-error">mkdir: cannot create directory '${dir}': No such file or directory</span>`);
                    continue;
                }

                if (parent.type === 'dir') {
                    state.fs[path] = {
                        type: 'dir',
                        perms: 'drwxr-xr-x',
                        owner: state.currentUser.username,
                        group: state.currentUser.username,
                        children: []
                    };
                    if (!parent.children.includes(dirName)) {
                        parent.children.push(dirName);
                    }
                }
            }
        }
        return errors.length ? errors.join('\n') : null;
    }

    function _rm(args) {
        let recursive = false;
        let force = false;
        const files = [];

        for (const arg of args) {
            if (arg.includes('r') && arg.startsWith('-')) recursive = true;
            if (arg.includes('f') && arg.startsWith('-')) force = true;
            if (!arg.startsWith('-')) files.push(arg);
        }

        for (const file of files) {
            const path = _resolvePath(file);
            const node = state.fs[path];

            if (!node) {
                if (!force) {
                    return `<span class="lt-error">rm: cannot remove '${file}': No such file or directory</span>`;
                }
                continue;
            }

            if (node.type === 'dir' && !recursive) {
                return `<span class="lt-error">rm: cannot remove '${file}': Is a directory</span>`;
            }

            const parentPath = path.split('/').slice(0, -1).join('/') || '/';
            const fileName = path.split('/').pop();
            const parent = state.fs[parentPath];
            if (parent && parent.children) {
                parent.children = parent.children.filter(c => c !== fileName);
            }
            delete state.fs[path];
        }
        return null;
    }

    function _rmdir(args) {
        for (const arg of args) {
            if (arg.startsWith('-')) continue;
            const path = _resolvePath(arg);
            const node = state.fs[path];

            if (!node) {
                return `<span class="lt-error">rmdir: failed to remove '${arg}': No such file or directory</span>`;
            }
            if (node.type !== 'dir') {
                return `<span class="lt-error">rmdir: failed to remove '${arg}': Not a directory</span>`;
            }
            if (node.children && node.children.length > 0) {
                return `<span class="lt-error">rmdir: failed to remove '${arg}': Directory not empty</span>`;
            }

            const parentPath = path.split('/').slice(0, -1).join('/') || '/';
            const dirName = path.split('/').pop();
            const parent = state.fs[parentPath];
            if (parent && parent.children) {
                parent.children = parent.children.filter(c => c !== dirName);
            }
            delete state.fs[path];
        }
        return null;
    }

    function _cp(args) {
        if (args.length < 2) {
            return '<span class="lt-error">cp: missing file operand</span>';
        }

        const src = _resolvePath(args[args.length - 2]);
        const dst = _resolvePath(args[args.length - 1]);
        const srcNode = state.fs[src];

        if (!srcNode) {
            return `<span class="lt-error">cp: cannot stat '${args[args.length - 2]}': No such file or directory</span>`;
        }

        const dstNode = state.fs[dst];
        let targetPath = dst;

        if (dstNode && dstNode.type === 'dir') {
            targetPath = dst + '/' + src.split('/').pop();
        }

        state.fs[targetPath] = { ...srcNode };

        const parentPath = targetPath.split('/').slice(0, -1).join('/') || '/';
        const fileName = targetPath.split('/').pop();
        const parent = state.fs[parentPath];
        if (parent && parent.children && !parent.children.includes(fileName)) {
            parent.children.push(fileName);
        }

        return null;
    }

    function _mv(args) {
        if (args.length < 2) {
            return '<span class="lt-error">mv: missing file operand</span>';
        }

        const src = _resolvePath(args[0]);
        const srcNode = state.fs[src];

        if (!srcNode) {
            return `<span class="lt-error">mv: cannot stat '${args[0]}': No such file or directory</span>`;
        }

        const result = _cp(args);
        if (result && result.includes('lt-error')) return result;

        const srcParent = src.split('/').slice(0, -1).join('/') || '/';
        const srcName = src.split('/').pop();
        const parent = state.fs[srcParent];
        if (parent && parent.children) {
            parent.children = parent.children.filter(c => c !== srcName);
        }
        delete state.fs[src];

        return null;
    }

    function _file(args) {
        if (args.length === 0) return '<span class="lt-error">file: missing operand</span>';

        const results = [];
        for (const arg of args) {
            const path = _resolvePath(arg);
            const node = state.fs[path];

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

    function _stat(args) {
        if (args.length === 0) return '<span class="lt-error">stat: missing operand</span>';

        const path = _resolvePath(args[0]);
        const node = state.fs[path];

        if (!node) {
            return `<span class="lt-error">stat: cannot statx '${args[0]}': No such file or directory</span>`;
        }

        return `  File: ${args[0]}
  Size: ${node.size || 4096}      Blocks: ${Math.ceil((node.size || 4096) / 512)}   ${node.type === 'dir' ? 'directory' : 'regular file'}
Access: (${node.perms})  Uid: ( ${node.owner === 'root' ? '0' : '1000'}/${node.owner})   Gid: ( ${node.group === 'root' ? '0' : '1000'}/${node.group})
Access: 2025-12-27 09:00:00.000000000 +0000
Modify: 2025-12-27 09:00:00.000000000 +0000
Change: 2025-12-27 09:00:00.000000000 +0000`;
    }

    function _find(args) {
        let startPath = '.';
        let namePattern = null;
        let typeFilter = null;
        let permFilter = null;

        for (let i = 0; i < args.length; i++) {
            if (args[i] === '-name' && args[i + 1]) {
                namePattern = args[i + 1].replace(/\*/g, '.*');
                i++;
            } else if (args[i] === '-type' && args[i + 1]) {
                typeFilter = args[i + 1];
                i++;
            } else if (args[i] === '-perm' && args[i + 1]) {
                permFilter = args[i + 1];
                i++;
            } else if (!args[i].startsWith('-')) {
                startPath = args[i];
            }
        }

        const basePath = _resolvePath(startPath);
        const results = [];

        for (const [path, node] of Object.entries(state.fs)) {
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

            // Permission filter: -4000 (SUID), -2000 (SGID), -1000 (sticky)
            if (permFilter && node.perms) {
                const perm = permFilter.replace(/^-/, '');
                if (perm === '4000' && !node.perms.includes('s') && !(node.perms[3] === 's' || node.perms[3] === 'S')) continue;
                if (perm === '2000' && !(node.perms[6] === 's' || node.perms[6] === 'S')) continue;
                if (perm === '1000' && !(node.perms[9] === 't' || node.perms[9] === 'T')) continue;
            }

            results.push(path);
        }

        return results.join('\n') || '<span class="lt-output-line">No matches found</span>';
    }

    function _grep(args) {
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

        if (!pattern) return '<span class="lt-error">grep: missing pattern</span>';
        if (files.length === 0) return '<span class="lt-highlight">grep: reading from stdin</span>';

        const results = [];
        const regex = new RegExp(pattern, ignoreCase ? 'i' : '');

        for (const file of files) {
            const path = _resolvePath(file);
            const node = state.fs[path];

            if (!node || node.type === 'dir') continue;
            if (!node.content) continue;

            const lines = node.content.split('\n');
            for (let i = 0; i < lines.length; i++) {
                if (regex.test(lines[i])) {
                    const prefix = files.length > 1 ? `${file}:` : '';
                    const lineNum = showLineNumbers ? `${i + 1}:` : '';
                    const highlighted = lines[i].replace(regex, '<span class="lt-highlight">$&</span>');
                    results.push(`${prefix}${lineNum}${highlighted}`);
                }
            }
        }

        return results.join('\n') || '';
    }

    function _sed(args) {
        if (args.length === 0) return '<span class="lt-error">sed: missing expression</span>';

        let inPlace = false;
        let backupExt = null;
        let suppressOutput = false;
        let expression = null;
        let fileName = null;

        // Parse args: flags, expression, filename
        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (arg === '-n') {
                suppressOutput = true;
            } else if (arg === '-i') {
                inPlace = true;
            } else if (arg.startsWith('-i') && arg.length > 2) {
                // -i.bak style
                inPlace = true;
                backupExt = arg.substring(2);
            } else if (!expression) {
                expression = arg.replace(/^['"]|['"]$/g, '');
            } else {
                fileName = arg;
            }
        }

        if (!expression) return '<span class="lt-error">sed: missing expression</span>';

        // Substitute command: s/old/new/ or s/old/new/g
        const subMatch = expression.match(/^s(.)(.+?)\1(.*?)\1(g?)$/);
        // Delete command: /pattern/d
        const delMatch = expression.match(/^\/(.*?)\/d$/);
        // Print command: /pattern/p
        const printMatch = expression.match(/^\/(.*?)\/p$/);

        if (!subMatch && !delMatch && !printMatch) {
            return '<span class="lt-error">sed: unsupported expression: ' + expression + '</span>';
        }

        // If no filename, expect stdin (not supported in this sim)
        if (!fileName) return '<span class="lt-highlight">sed: reading from stdin (not supported in this simulation)</span>';

        const path = _resolvePath(fileName);
        const node = state.fs[path];

        if (!node) return `<span class="lt-error">sed: can't read ${fileName}: No such file or directory</span>`;
        if (node.type === 'dir') return `<span class="lt-error">sed: read error on ${fileName}: Is a directory</span>`;
        if (!node.content && node.content !== '') return `<span class="lt-error">sed: can't read ${fileName}: No such file or directory</span>`;

        const lines = node.content.split('\n');
        let resultLines = [];

        if (subMatch) {
            const searchStr = subMatch[2];
            const replaceStr = subMatch[3];
            const globalFlag = subMatch[4] === 'g';
            const regex = new RegExp(searchStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), globalFlag ? 'g' : '');

            for (const line of lines) {
                const newLine = line.replace(regex, replaceStr);
                if (!suppressOutput) {
                    if (newLine !== line) {
                        // Highlight the replacements in output
                        const displayRegex = new RegExp(replaceStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), globalFlag ? 'g' : '');
                        const highlighted = newLine.replace(displayRegex, '<span class="lt-highlight">$&</span>');
                        resultLines.push(highlighted);
                    } else {
                        resultLines.push(line);
                    }
                }
            }

            // In-place editing
            if (inPlace) {
                if (backupExt) {
                    state.fs[path + backupExt] = {
                        type: 'file',
                        content: node.content,
                        permissions: node.permissions || 'rw-r--r--',
                        owner: node.owner || state.currentUser.username,
                        group: node.group || state.currentUser.groups[0].name,
                        modified: node.modified || new Date().toISOString()
                    };
                }
                const newContent = lines.map(l => l.replace(regex, replaceStr)).join('\n');
                state.fs[path].content = newContent;
                state.fs[path].modified = new Date().toISOString();
                if (inPlace) return ''; // -i produces no output
            }
        } else if (delMatch) {
            const pattern = delMatch[1];
            const regex = new RegExp(pattern);

            for (const line of lines) {
                if (!regex.test(line)) {
                    resultLines.push(line);
                }
            }

            if (inPlace) {
                if (backupExt) {
                    state.fs[path + backupExt] = {
                        type: 'file',
                        content: node.content,
                        permissions: node.permissions || 'rw-r--r--',
                        owner: node.owner || state.currentUser.username,
                        group: node.group || state.currentUser.groups[0].name,
                        modified: node.modified || new Date().toISOString()
                    };
                }
                state.fs[path].content = resultLines.join('\n');
                state.fs[path].modified = new Date().toISOString();
                return '';
            }
        } else if (printMatch) {
            const pattern = printMatch[1];
            const regex = new RegExp(pattern);

            for (const line of lines) {
                const matches = regex.test(line);
                if (suppressOutput) {
                    // -n: only print lines explicitly selected by /p
                    if (matches) {
                        const highlighted = line.replace(regex, '<span class="lt-highlight">$&</span>');
                        resultLines.push(highlighted);
                    }
                } else {
                    // Without -n: print all lines, matching lines duplicated by /p
                    if (matches) {
                        const highlighted = line.replace(regex, '<span class="lt-highlight">$&</span>');
                        resultLines.push(highlighted);
                        resultLines.push(highlighted);
                    } else {
                        resultLines.push(line);
                    }
                }
            }

            if (inPlace) {
                return '';
            }
        }

        return resultLines.join('\n');
    }

    function _awk(args) {
        if (args.length === 0) return '<span class="lt-error">awk: missing program</span>';

        let separator = null;
        let program = null;
        let files = [];

        // Parse args: extract -F separator, quoted program, and filenames
        let i = 0;
        while (i < args.length) {
            const arg = args[i];
            if (arg === '-F' && i + 1 < args.length) {
                separator = args[i + 1].replace(/^['"]|['"]$/g, '');
                i += 2;
                continue;
            } else if (arg.startsWith('-F') && arg.length > 2) {
                separator = arg.substring(2).replace(/^['"]|['"]$/g, '');
                i++;
                continue;
            }

            // Reconstruct the awk program from shell-split tokens
            // Program can be: '{print $1}' or '/pattern/ {print $1}' etc.
            if (!program) {
                let raw = arg;
                // Strip leading single quote if present
                if (raw.startsWith("'")) raw = raw.substring(1);
                // Check if the program is fully contained in this token
                if (raw.endsWith("'")) {
                    program = raw.substring(0, raw.length - 1);
                } else if (raw.endsWith('}') && raw.includes('{')) {
                    // Complete {action} or /pattern/ {action} in one token
                    program = raw;
                } else if (raw.startsWith('/') && !raw.includes('{')) {
                    // Bare /pattern/ without {action} — e.g. awk '/ERROR/' file
                    program = raw;
                } else if (arg.startsWith("'") || arg.startsWith('{') || arg.startsWith('/')) {
                    // Multi-token program — join until closing }' or just '
                    let parts = [raw];
                    i++;
                    while (i < args.length) {
                        let part = args[i];
                        if (part.endsWith("'")) {
                            parts.push(part.substring(0, part.length - 1));
                            break;
                        } else if (part.endsWith("}")) {
                            parts.push(part);
                            break;
                        }
                        parts.push(part);
                        i++;
                    }
                    program = parts.join(' ');
                } else {
                    program = raw;
                }
            } else {
                files.push(arg);
            }
            i++;
        }

        if (!program) return '<span class="lt-error">awk: missing program</span>';
        if (files.length === 0) return '<span class="lt-highlight">awk: reading from stdin (not supported in this simulation)</span>';

        // Parse the awk program into pattern and action
        // Forms: '{action}', '/pattern/ {action}', 'NR==N', 'NR==N {action}'
        let patternRegex = null;
        let nrCondition = null;
        let action = null;

        const progTrimmed = program.replace(/^\{|\}$/g, '').trim();

        // Check for /pattern/ {action}
        const patternActionMatch = program.match(/^\/(.*?)\/\s*\{(.*)\}$/);
        // Check for NR==N {action} or just NR==N
        const nrActionMatch = program.match(/^NR\s*==\s*(\d+)\s*(?:\{(.*)\})?$/);
        // Check for plain {action}
        const plainActionMatch = program.match(/^\{(.*)\}$/);

        if (patternActionMatch) {
            patternRegex = new RegExp(patternActionMatch[1]);
            action = patternActionMatch[2].trim();
        } else if (nrCondition === null && nrActionMatch) {
            nrCondition = parseInt(nrActionMatch[1]);
            action = nrActionMatch[2] ? nrActionMatch[2].trim() : 'print $0';
        } else if (plainActionMatch) {
            action = plainActionMatch[1].trim();
        } else {
            // Try as a bare condition like NR==3 without braces (already caught above)
            // Or treat the whole thing as an action
            action = progTrimmed;
        }

        if (!action) action = 'print $0';

        const results = [];
        const fs = separator || /\s+/;

        for (const file of files) {
            const path = _resolvePath(file);
            const node = state.fs[path];

            if (!node) {
                results.push(`<span class="lt-error">awk: ${file}: No such file or directory</span>`);
                continue;
            }
            if (node.type === 'dir') {
                results.push(`<span class="lt-error">awk: ${file}: Is a directory</span>`);
                continue;
            }
            if (!node.content && node.content !== '') continue;

            const lines = node.content.split('\n');

            for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
                const line = lines[lineIdx];
                const nr = lineIdx + 1;

                // Apply pattern/condition filters
                if (patternRegex && !patternRegex.test(line)) continue;
                if (nrCondition !== null && nr !== nrCondition) continue;

                // Split line into fields
                const fields = separator
                    ? line.split(separator)
                    : line.trim().split(/\s+/);
                const nf = fields.length;

                // Process the action (handle print statements)
                const printMatch = action.match(/^print\s+(.*)$/);
                if (printMatch) {
                    const printArgs = printMatch[1];
                    // Split print arguments by comma
                    const parts = printArgs.split(/\s*,\s*/);
                    const outputParts = [];

                    for (const part of parts) {
                        const token = part.trim();
                        if (token === '$0') {
                            outputParts.push(line);
                        } else if (token === 'NR') {
                            outputParts.push(String(nr));
                        } else if (token === 'NF') {
                            outputParts.push(String(nf));
                        } else if (token.startsWith('$')) {
                            const fieldNum = parseInt(token.substring(1));
                            if (fieldNum === 0) {
                                outputParts.push(line);
                            } else if (fieldNum >= 1 && fieldNum <= nf) {
                                outputParts.push(fields[fieldNum - 1]);
                            } else {
                                outputParts.push('');
                            }
                        } else if (token.startsWith('"') && token.endsWith('"')) {
                            outputParts.push(token.slice(1, -1));
                        } else {
                            outputParts.push(token);
                        }
                    }

                    results.push(outputParts.join(' '));
                } else {
                    // If no recognized action, print the whole line
                    results.push(line);
                }
            }
        }

        return results.join('\n') || '';
    }

    function _which(args) {
        const commands = {
            'ls': '/usr/bin/ls', 'cat': '/usr/bin/cat', 'cp': '/usr/bin/cp', 'mv': '/usr/bin/mv',
            'rm': '/usr/bin/rm', 'mkdir': '/usr/bin/mkdir', 'bash': '/usr/bin/bash',
            'python': '/usr/bin/python3', 'python3': '/usr/bin/python3', 'vim': '/usr/bin/vim',
            'git': '/usr/bin/git', 'curl': '/usr/bin/curl', 'wget': '/usr/bin/wget',
            'nginx': '/usr/sbin/nginx', 'apache2': '/usr/sbin/apache2',
            'ssh': '/usr/bin/ssh', 'scp': '/usr/bin/scp', 'rsync': '/usr/bin/rsync',
            'grep': '/usr/bin/grep', 'find': '/usr/bin/find', 'sed': '/usr/bin/sed',
            'awk': '/usr/bin/awk', 'head': '/usr/bin/head', 'tail': '/usr/bin/tail',
            'less': '/usr/bin/less', 'more': '/usr/bin/more', 'nano': '/usr/bin/nano',
            'docker': '/usr/bin/docker', 'systemctl': '/usr/bin/systemctl',
            'sudo': '/usr/bin/sudo', 'apt': '/usr/bin/apt', 'node': '/usr/bin/node',
            'npm': '/usr/bin/npm', 'tar': '/usr/bin/tar', 'gzip': '/usr/bin/gzip',
            'chmod': '/usr/bin/chmod', 'chown': '/usr/bin/chown', 'chgrp': '/usr/bin/chgrp'
        };

        return args.map(cmd => commands[cmd] || `${cmd}: not found`).join('\n');
    }

    function _whereis(args) {
        const locations = {
            'bash': 'bash: /usr/bin/bash /etc/bash.bashrc /usr/share/man/man1/bash.1.gz',
            'nginx': 'nginx: /usr/sbin/nginx /etc/nginx /usr/share/nginx /usr/share/man/man8/nginx.8.gz',
            'python': 'python: /usr/bin/python3 /usr/lib/python3.10 /usr/share/man/man1/python.1.gz',
            'python3': 'python3: /usr/bin/python3 /usr/lib/python3.10 /usr/share/man/man1/python3.1.gz',
            'vim': 'vim: /usr/bin/vim /etc/vim /usr/share/vim /usr/share/man/man1/vim.1.gz',
            'git': 'git: /usr/bin/git /usr/share/git-core /usr/share/man/man1/git.1.gz',
            'ssh': 'ssh: /usr/bin/ssh /etc/ssh /usr/share/man/man1/ssh.1.gz',
            'docker': 'docker: /usr/bin/docker /etc/docker /usr/share/man/man1/docker.1.gz',
            'grep': 'grep: /usr/bin/grep /usr/share/man/man1/grep.1.gz',
            'find': 'find: /usr/bin/find /usr/share/man/man1/find.1.gz',
            'ls': 'ls: /usr/bin/ls /usr/share/man/man1/ls.1.gz'
        };
        return args.map(cmd => locations[cmd] || `${cmd}: /usr/bin/${cmd} /usr/share/man/man1/${cmd}.1.gz`).join('\n');
    }

    function _locate(args) {
        if (args.length === 0) {
            return '<span class="lt-error">locate: no pattern to search for</span>';
        }

        const pattern = args[0].replace(/['"]/g, '').replace(/\*/g, '.*');
        const regex = new RegExp(pattern, 'i');
        const results = [];

        for (const path of Object.keys(state.fs)) {
            const name = path.split('/').pop();
            if (regex.test(name) || regex.test(path)) {
                results.push(path);
            }
        }

        if (results.length === 0) {
            return '<span class="lt-output-line">No matches found</span>';
        }

        return results.sort().join('\n');
    }

    function _id(args) {
        if (args.includes('-u')) {
            if (args.includes('-n')) return state.currentUser.username;
            return state.currentUser.uid.toString();
        }
        if (args.includes('-g')) {
            if (args.includes('-n')) return state.currentUser.groups[0].name;
            return state.currentUser.gid.toString();
        }
        if (args.includes('-G')) {
            if (args.includes('-n')) return state.currentUser.groups.map(g => g.name).join(' ');
            return state.currentUser.groups.map(g => g.gid).join(' ');
        }

        const groups = state.currentUser.groups.map(g => `${g.gid}(${g.name})`).join(',');
        return `uid=${state.currentUser.uid}(${state.currentUser.username}) gid=${state.currentUser.gid}(${state.currentUser.groups[0].name}) groups=${groups}`;
    }

    function _groups(args) {
        return state.currentUser.groups.map(g => g.name).join(' ');
    }

    function _uname(args) {
        if (args.includes('-a')) {
            return `Linux ${config.hostname} 6.1.0-hexworth #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux`;
        }
        if (args.includes('-r')) return '6.1.0-hexworth';
        if (args.includes('-n')) return config.hostname;
        if (args.includes('-m')) return 'x86_64';
        if (args.includes('-s')) return 'Linux';
        if (args.includes('-o')) return 'GNU/Linux';
        return 'Linux';
    }

    function _cal() {
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

    function _df(args) {
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

    function _du(args) {
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

    function _tree(args) {
        let targetPath = state.currentDir;
        for (const arg of args) {
            if (!arg.startsWith('-')) {
                targetPath = _resolvePath(arg);
                break;
            }
        }

        const node = state.fs[targetPath];
        if (!node) return `<span class="lt-error">${args[0] || targetPath}: No such file or directory</span>`;
        if (node.type !== 'dir') return _escape(targetPath.split('/').pop());

        const lines = [];
        const dirName = targetPath === '/' ? '/' : targetPath.split('/').pop() || '.';
        lines.push(dirName);
        let dirCount = 0, fileCount = 0;

        function walk(dirPath, prefix) {
            const dir = state.fs[dirPath];
            if (!dir || !dir.children) return;
            const children = [...dir.children].sort();
            children.forEach((child, i) => {
                const isLast = i === children.length - 1;
                const connector = isLast ? '└── ' : '├── ';
                const childPath = dirPath === '/' ? '/' + child : dirPath + '/' + child;
                const childNode = state.fs[childPath];
                if (childNode && childNode.type === 'dir') {
                    lines.push(prefix + connector + '<span class="lt-highlight">' + _escape(child) + '</span>');
                    dirCount++;
                    walk(childPath, prefix + (isLast ? '    ' : '│   '));
                } else {
                    lines.push(prefix + connector + _escape(child));
                    fileCount++;
                }
            });
        }

        walk(targetPath, '');
        lines.push('');
        lines.push(`${dirCount} director${dirCount === 1 ? 'y' : 'ies'}, ${fileCount} file${fileCount === 1 ? '' : 's'}`);
        return lines.join('\n');
    }

    function _free(args) {
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

    function _ps(args) {
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

    function _wc(args) {
        let countLines = true, countWords = true, countBytes = true;
        const files = [];

        for (const arg of args) {
            if (arg === '-l') { countLines = true; countWords = false; countBytes = false; }
            else if (arg === '-w') { countLines = false; countWords = true; countBytes = false; }
            else if (arg === '-c') { countLines = false; countWords = false; countBytes = true; }
            else if (!arg.startsWith('-')) files.push(arg);
        }

        if (files.length === 0) return '<span class="lt-highlight">wc: reading from stdin</span>';

        const results = [];
        for (const file of files) {
            const path = _resolvePath(file);
            const node = state.fs[path];
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

    function _sort(args) {
        let reverse = args.includes('-r');
        let numeric = args.includes('-n');
        let file = args.find(a => !a.startsWith('-'));

        if (!file) return '<span class="lt-highlight">sort: reading from stdin</span>';

        const path = _resolvePath(file);
        const node = state.fs[path];
        if (!node || !node.content) return `<span class="lt-error">sort: ${file}: No such file</span>`;

        let lines = node.content.split('\n').filter(l => l);
        if (numeric) {
            lines.sort((a, b) => parseFloat(a) - parseFloat(b));
        } else {
            lines.sort();
        }
        if (reverse) lines.reverse();

        return lines.join('\n');
    }

    function _uniq(args) {
        let countMode = args.includes('-c');
        let file = args.find(a => !a.startsWith('-'));

        if (!file) return '<span class="lt-highlight">uniq: reading from stdin</span>';

        const path = _resolvePath(file);
        const node = state.fs[path];
        if (!node || !node.content) return `<span class="lt-error">uniq: ${file}: No such file</span>`;

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

    function _cut(args) {
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

        if (!file) return '<span class="lt-highlight">cut: reading from stdin</span>';
        if (!fields) return '<span class="lt-error">cut: you must specify a list of fields</span>';

        const path = _resolvePath(file);
        const node = state.fs[path];
        if (!node || !node.content) return `<span class="lt-error">cut: ${file}: No such file</span>`;

        return node.content.split('\n').map(line => {
            const parts = line.split(delimiter);
            return fields.map(f => parts[f] || '').join(delimiter);
        }).join('\n');
    }

    function _chmod(args) {
        if (args.length < 2) return '<span class="lt-error">chmod: missing operand</span>';

        const mode = args[0];
        const target = args[args.length - 1];
        const path = _resolvePath(target);
        const node = state.fs[path];

        if (!node) {
            return `<span class="lt-error">chmod: cannot access '${target}': No such file or directory</span>`;
        }

        const isDir = node.type === 'dir';
        const typeChar = isDir ? 'd' : '-';

        if (/^[0-7]{3,4}$/.test(mode)) {
            const octal = mode.slice(-3);
            const symbolic = _octalToSymbolic(octal);
            node.perms = typeChar + symbolic;
            return null;
        }

        const match = mode.match(/^([ugoa]*)([+-=])([rwxXst]*)$/);
        if (match) {
            const [, who, op, perms] = match;
            const currentPerms = (node.perms || '---------').substring(1);
            const newPerms = _applySymbolicMode(currentPerms, who || 'a', op, perms);
            node.perms = typeChar + newPerms;
            return null;
        }

        return `<span class="lt-error">chmod: invalid mode: '${mode}'</span>`;
    }

    function _octalToSymbolic(octal) {
        const map = { '0': '---', '1': '--x', '2': '-w-', '3': '-wx', '4': 'r--', '5': 'r-x', '6': 'rw-', '7': 'rwx' };
        return octal.split('').map(d => map[d] || '---').join('');
    }

    function _symbolicToOctal(symbolic) {
        const permStr = symbolic.length === 10 ? symbolic.substring(1) : symbolic;
        let octal = '';
        for (let i = 0; i < 3; i++) {
            const chunk = permStr.substring(i * 3, i * 3 + 3);
            let val = 0;
            if (chunk[0] === 'r') val += 4;
            if (chunk[1] === 'w') val += 2;
            if (chunk[2] === 'x' || chunk[2] === 's' || chunk[2] === 't') val += 1;
            octal += val;
        }
        return octal;
    }

    function _applySymbolicMode(current, who, op, perms) {
        let permArray = current.split('');
        const positions = {
            u: [0, 1, 2],
            g: [3, 4, 5],
            o: [6, 7, 8],
            a: [0, 1, 2, 3, 4, 5, 6, 7, 8]
        };

        let indices = [];
        for (const w of (who || 'a')) {
            if (positions[w]) indices.push(...positions[w]);
        }
        indices = [...new Set(indices)];

        for (const p of perms) {
            const offset = p === 'r' ? 0 : (p === 'w' ? 1 : (p === 'x' ? 2 : -1));
            if (offset === -1) continue;

            indices.forEach(i => {
                const pos = Math.floor(i / 3) * 3 + offset;
                if (op === '+') permArray[pos] = p;
                else if (op === '-') permArray[pos] = '-';
                else if (op === '=') {
                    const base = Math.floor(i / 3) * 3;
                    if (op === '=' && !perms.includes('r')) permArray[base] = '-';
                    if (op === '=' && !perms.includes('w')) permArray[base + 1] = '-';
                    if (op === '=' && !perms.includes('x')) permArray[base + 2] = '-';
                    permArray[pos] = p;
                }
            });
        }

        return permArray.join('');
    }

    function _chown(args) {
        if (args.length < 2) return '<span class="lt-error">chown: missing operand</span>';

        const ownerSpec = args[0];
        const target = args[args.length - 1];
        const path = _resolvePath(target);
        const node = state.fs[path];

        if (!node) {
            return `<span class="lt-error">chown: cannot access '${target}': No such file or directory</span>`;
        }

        const [newOwner, newGroup] = ownerSpec.split(':');
        if (newOwner) node.owner = newOwner;
        if (newGroup) node.group = newGroup;

        return null;
    }

    function _chgrp(args) {
        if (args.length < 2) return '<span class="lt-error">chgrp: missing operand</span>';

        const newGroup = args[0];
        const target = args[args.length - 1];
        const path = _resolvePath(target);
        const node = state.fs[path];

        if (!node) {
            return `<span class="lt-error">chgrp: cannot access '${target}': No such file or directory</span>`;
        }

        node.group = newGroup;
        return null;
    }

    function _umask(args) {
        if (args.length === 0) {
            return state.umask;
        }

        const mask = args[0];
        if (/^[0-7]{3,4}$/.test(mask)) {
            state.umask = mask.length === 4 ? mask : '0' + mask;
            return null;
        }

        return `<span class="lt-error">umask: invalid mask: '${mask}'</span>`;
    }

    function _export(args) {
        if (args.length === 0) {
            return Object.entries(state.env).map(([k, v]) => `declare -x ${k}="${v}"`).join('\n');
        }
        for (const arg of args) {
            if (arg.includes('=')) {
                const [name, ...valueParts] = arg.split('=');
                state.env[name] = valueParts.join('=');
            }
        }
        return null;
    }

    function _ln(args) {
        let symbolic = args.includes('-s');
        let force = args.includes('-f');
        const nonFlags = args.filter(a => !a.startsWith('-'));

        if (nonFlags.length < 2) {
            return '<span class="lt-error">ln: missing file operand</span>';
        }

        return `<span class="lt-success">ln: link created${symbolic ? ' (symbolic)' : ''}</span>`;
    }

    function _sudo(args) {
        if (args.length === 0) {
            return '<span class="lt-error">sudo: requires a command</span>';
        }

        // Parse sudo flags before the subcommand
        let targetUser = 'root';
        let subArgs = [...args];
        let i = 0;
        while (i < subArgs.length) {
            if (subArgs[i] === '-u' && i + 1 < subArgs.length) {
                targetUser = subArgs[i + 1];
                subArgs.splice(i, 2);
            } else if (subArgs[i] === '-l') {
                // sudo -l: list privileges (no password needed for display)
                if (state.sudoAuthenticated) {
                    return _sudoListPrivileges();
                }
                state.sudoPending = { args: args, cmdLine: 'sudo ' + args.join(' '), type: 'list' };
                _enterPasswordMode();
                return null; // output handled async
            } else if (subArgs[i] === '-k') {
                state.sudoAuthenticated = false;
                return '<span class="lt-highlight">sudo: credential cache cleared</span>';
            } else if (subArgs[i] === '-v') {
                if (state.sudoAuthenticated) {
                    return '<span class="lt-highlight">sudo: credential cache refreshed</span>';
                }
                state.sudoPending = { args: args, cmdLine: 'sudo ' + args.join(' '), type: 'validate' };
                _enterPasswordMode();
                return null;
            } else if (subArgs[i] === '-i' || subArgs[i] === '-s') {
                if (state.sudoAuthenticated) {
                    return '<span class="lt-highlight">root@' + config.hostname + ':~# </span><span class="lt-output-line">[Simulated root shell — type exit to return]</span>';
                }
                state.sudoPending = { args: args, cmdLine: 'sudo ' + args.join(' '), type: 'shell' };
                _enterPasswordMode();
                return null;
            } else {
                break;
            }
            i++;
        }

        if (subArgs.length === 0) {
            return '<span class="lt-error">sudo: requires a command after options</span>';
        }

        // If already authenticated this session, run immediately
        if (state.sudoAuthenticated) {
            return _executeSudoCommand(subArgs, targetUser);
        }

        // Otherwise, enter password mode
        state.sudoPending = { args: args, subArgs: subArgs, targetUser: targetUser, cmdLine: 'sudo ' + args.join(' '), type: 'command' };
        _enterPasswordMode();
        return null; // output handled by password callback
    }

    function _enterPasswordMode() {
        _appendOutput(`<span class="lt-highlight">[sudo] password for ${state.currentUser.username}: </span>`);
        state.promptEl.textContent = '';
        state.inputEl.type = 'password';
        state.inputEl.placeholder = '';
        state.sudoAttempts = 0;
        state.inputEl.focus();
    }

    function _cancelSudo() {
        state.sudoPending = null;
        state.inputEl.type = 'text';
        state.promptEl.textContent = _getPrompt() + ' ';
        state.inputEl.placeholder = 'Type a command...';
        _appendOutput('<span class="lt-error">^C</span>');
        state.inputEl.focus();
    }

    function _handleSudoPassword(password) {
        if (password === state.sudoPassword) {
            state.sudoAuthenticated = true;
            state.inputEl.type = 'text';
            state.promptEl.textContent = _getPrompt() + ' ';
            state.inputEl.placeholder = 'Type a command...';

            const pending = state.sudoPending;
            state.sudoPending = null;

            if (!pending) return;

            let output = null;
            if (pending.type === 'command') {
                output = _executeSudoCommand(pending.subArgs, pending.targetUser);
            } else if (pending.type === 'list') {
                output = _sudoListPrivileges();
            } else if (pending.type === 'shell') {
                output = '<span class="lt-highlight">root@' + config.hostname + ':~# </span><span class="lt-output-line">[Simulated root shell — type exit to return]</span>';
            } else if (pending.type === 'validate') {
                output = '<span class="lt-highlight">sudo: credential cache refreshed</span>';
            }

            if (output) _appendOutput(output);

            // Fire the onCommand callback so task validators see it
            if (config.onCommand && pending.cmdLine) {
                const { cmd, args } = _parseCommand(pending.cmdLine);
                config.onCommand(pending.cmdLine, output, cmd, args);
            }

            // Scroll to bottom
            const scrollTarget = state.outputEl || state.containerEl;
            if (scrollTarget) scrollTarget.scrollTop = scrollTarget.scrollHeight;
        } else {
            state.sudoAttempts++;
            if (state.sudoAttempts >= 3) {
                _appendOutput('<span class="lt-error">sudo: 3 incorrect password attempts</span>');
                state.inputEl.type = 'text';
                state.promptEl.textContent = _getPrompt() + ' ';
                state.inputEl.placeholder = 'Type a command...';
                state.sudoPending = null;
            } else {
                _appendOutput('<span class="lt-error">Sorry, try again.</span>');
                _appendOutput(`<span class="lt-highlight">[sudo] password for ${state.currentUser.username}: </span>`);
            }
        }
        state.inputEl.focus();
    }

    function _executeSudoCommand(subArgs, targetUser) {
        // Save current user, temporarily become target user
        const originalUser = state.currentUser.username;
        const originalUid = state.currentUser.uid;
        state.currentUser.username = targetUser;
        state.currentUser.uid = targetUser === 'root' ? 0 : 1000;

        // Execute the subcommand
        const output = _executeCommand(subArgs[0], subArgs.slice(1), subArgs.join(' '));

        // Restore original user
        state.currentUser.username = originalUser;
        state.currentUser.uid = originalUid;

        return output;
    }

    function _sudoListPrivileges() {
        return `User ${state.currentUser.username} may run the following commands on ${config.hostname}:
    (ALL : ALL) ALL`;
    }

    function _type(args) {
        if (args.length === 0) return '';
        const builtins = ['cd', 'pwd', 'echo', 'export', 'alias', 'history', 'exit'];
        return args.map(cmd => {
            if (builtins.includes(cmd)) return `${cmd} is a shell builtin`;
            return `${cmd} is /usr/bin/${cmd}`;
        }).join('\n');
    }

    // =========================================================================
    // HELP & DOCUMENTATION
    // =========================================================================

    function _help() {
        return `<span class="lt-highlight">Hexworth Linux Terminal - Available Commands</span>

<span class="lt-success">Navigation:</span>        cd, pwd, ls
<span class="lt-success">File Operations:</span>   cat, head, tail, touch, mkdir, rm, rmdir, cp, mv, file, stat
<span class="lt-success">Search:</span>            find, grep, which, whereis
<span class="lt-success">User Info:</span>         whoami, id, groups, who, w, users
<span class="lt-success">System Info:</span>       uname, hostname, uptime, date, cal, df, du, free, ps, top
<span class="lt-success">Text Processing:</span>   echo, wc, sort, uniq, cut, tr
<span class="lt-success">Permissions:</span>       chmod, chown, chgrp, umask
<span class="lt-success">Environment:</span>       env, export, set, unset
<span class="lt-success">Help:</span>              help, man, type, alias
<span class="lt-success">Terminal:</span>          clear, history, exit

<span class="lt-highlight">Tips:</span> Use Tab for completion, arrow keys for history, Ctrl+C to interrupt, Ctrl+L to clear`;
    }

    function _man(args) {
        if (args.length === 0) {
            return '<span class="lt-error">What manual page do you want?\nUsage: man [command]</span>';
        }

        const manPages = {
            'ls': `<span class="lt-highlight">LS(1)                     User Commands                     LS(1)</span>

<span class="lt-success">NAME</span>
       ls - list directory contents

<span class="lt-success">SYNOPSIS</span>
       ls [OPTION]... [FILE]...

<span class="lt-success">DESCRIPTION</span>
       List information about the FILEs (current directory by default).

<span class="lt-success">OPTIONS</span>
       -a, --all          do not ignore entries starting with .
       -l                 use a long listing format
       -h, --human-readable  print sizes in human readable format
       -R, --recursive    list subdirectories recursively`,

            'cd': `<span class="lt-highlight">CD(1)                     User Commands                     CD(1)</span>

<span class="lt-success">NAME</span>
       cd - change the working directory

<span class="lt-success">SYNOPSIS</span>
       cd [directory]

<span class="lt-success">DESCRIPTION</span>
       Change the current directory to [directory].
       If no directory given, changes to HOME.

       cd -    Change to previous directory
       cd ~    Change to home directory`,

            'cat': `<span class="lt-highlight">CAT(1)                    User Commands                    CAT(1)</span>

<span class="lt-success">NAME</span>
       cat - concatenate files and print on stdout

<span class="lt-success">SYNOPSIS</span>
       cat [OPTION]... [FILE]...

<span class="lt-success">DESCRIPTION</span>
       Concatenate FILE(s) to standard output.
       With no FILE, read standard input.`,

            'grep': `<span class="lt-highlight">GREP(1)                   User Commands                   GREP(1)</span>

<span class="lt-success">NAME</span>
       grep - print lines matching a pattern

<span class="lt-success">SYNOPSIS</span>
       grep [OPTIONS] PATTERN [FILE...]

<span class="lt-success">DESCRIPTION</span>
       Search for PATTERN in each FILE.

<span class="lt-success">OPTIONS</span>
       -i, --ignore-case    ignore case distinctions
       -n, --line-number    print line number with output
       -r, --recursive      search directories recursively
       -v, --invert-match   select non-matching lines`,

            'chmod': `<span class="lt-highlight">CHMOD(1)                  User Commands                  CHMOD(1)</span>

<span class="lt-success">NAME</span>
       chmod - change file mode bits

<span class="lt-success">SYNOPSIS</span>
       chmod [OPTION]... MODE[,MODE]... FILE...

<span class="lt-success">DESCRIPTION</span>
       Change the mode of each FILE to MODE.

<span class="lt-success">MODES</span>
       Numeric: 755, 644, 600, etc.
       Symbolic: u+x, g-w, o=r, a+r`,

            'whoami': `<span class="lt-highlight">WHOAMI(1)                 User Commands                 WHOAMI(1)</span>

<span class="lt-success">NAME</span>
       whoami - print effective user name

<span class="lt-success">SYNOPSIS</span>
       whoami

<span class="lt-success">DESCRIPTION</span>
       Print the user name associated with the current effective user ID.`,

            'id': `<span class="lt-highlight">ID(1)                     User Commands                     ID(1)</span>

<span class="lt-success">NAME</span>
       id - print real and effective user and group IDs

<span class="lt-success">SYNOPSIS</span>
       id [OPTION]... [USER]

<span class="lt-success">OPTIONS</span>
       -u     print only the effective user ID
       -g     print only the effective group ID
       -G     print all group IDs
       -n     print a name instead of a number`,

            'groups': `<span class="lt-highlight">GROUPS(1)                 User Commands                 GROUPS(1)</span>

<span class="lt-success">NAME</span>
       groups - print the groups a user is in

<span class="lt-success">SYNOPSIS</span>
       groups [USERNAME]...

<span class="lt-success">DESCRIPTION</span>
       Print group memberships for each USERNAME.`,

            'man': `<span class="lt-highlight">MAN(1)                    User Commands                    MAN(1)</span>

<span class="lt-success">NAME</span>
       man - an interface to the system reference manuals

<span class="lt-success">SYNOPSIS</span>
       man [section] name ...

<span class="lt-success">DESCRIPTION</span>
       man is the system's manual pager. Each page argument given to
       man is normally the name of a program, utility or function.

<span class="lt-success">SECTIONS</span>
       1   Executable programs or shell commands
       2   System calls
       3   Library calls
       4   Special files (usually found in /dev)
       5   File formats and conventions (e.g. /etc/passwd)
       6   Games
       7   Miscellaneous
       8   System administration commands (usually root only)

<span class="lt-success">EXAMPLES</span>
       man ls         Show the manual page for ls
       man 5 passwd   Show the passwd file format (section 5)
       man -k search  Search manual page names and descriptions`,

            'sed': `<span class="lt-highlight">SED(1)                    User Commands                    SED(1)</span>

<span class="lt-success">NAME</span>
       sed - stream editor for filtering and transforming text

<span class="lt-success">SYNOPSIS</span>
       sed [OPTIONS] 'EXPRESSION' [FILE]

<span class="lt-success">DESCRIPTION</span>
       sed reads input line by line, applies editing commands from
       EXPRESSION, and writes the result to standard output. The
       original input file is not modified unless -i is used.

<span class="lt-success">COMMANDS</span>
       s/old/new/     Substitute first occurrence of 'old' with 'new'
                      on each line
       s/old/new/g    Substitute ALL occurrences of 'old' with 'new'
                      on each line (global flag)
       /pattern/d     Delete lines matching 'pattern'
       /pattern/p     Print lines matching 'pattern' (use with -n
                      to print ONLY matching lines)

<span class="lt-success">FLAGS</span>
       -n             Suppress automatic printing of pattern space.
                      Only lines explicitly selected by /p are output.
       -i             Edit file in place (overwrite original file)
       -i.EXT         Edit in place, saving backup with extension .EXT
                      (e.g., -i.bak creates file.bak before modifying)
       g              (suffix) Global flag for substitute command.
                      Without it, only the first match per line is replaced.

<span class="lt-success">EXAMPLES</span>
       sed 's/http/https/' urls.txt
              Replace first 'http' with 'https' on each line

       sed 's/foo/bar/g' data.txt
              Replace every 'foo' with 'bar' throughout the file

       sed '/^#/d' config.txt
              Delete all comment lines (starting with #)

       sed -n '/error/p' log.txt
              Print only lines containing 'error'

       sed -i 's/old/new/g' file.txt
              Replace all 'old' with 'new' and save changes to file

       sed -i.bak 's/old/new/g' file.txt
              Same as above, but keep original as file.txt.bak`,

            'awk': `<span class="lt-highlight">AWK(1)                    User Commands                    AWK(1)</span>

<span class="lt-success">NAME</span>
       awk - pattern scanning and text processing language

<span class="lt-success">SYNOPSIS</span>
       awk [OPTIONS] 'program' [FILE...]
       awk [-F separator] '/pattern/ {action}' [FILE...]

<span class="lt-success">DESCRIPTION</span>
       awk scans each input FILE for lines that match any of a set of
       patterns. For each matching line, awk executes the associated
       action. If no pattern is given, every line matches.

       The default field separator is whitespace. Fields are referenced
       as $1, $2, ... $N. $0 refers to the entire line.

<span class="lt-success">BUILT-IN VARIABLES</span>
       $0         The entire input line
       $1..$N     The Nth field of the current line
       NR         Current line number (Number of Records)
       NF         Number of fields in the current line
       FS         Field separator (default: whitespace)

<span class="lt-success">OPTIONS</span>
       -F sep     Set the field separator to sep

<span class="lt-success">PATTERNS</span>
       /regex/    Match lines containing the regular expression
       NR==N      Match only line number N
       (none)     Match all lines (when only {action} is given)

<span class="lt-success">EXAMPLES</span>
       awk '{print $1}' file.txt          Print the first field of each line
       awk '{print $1, $3}' file.txt      Print the 1st and 3rd fields
       awk '{print $0}' file.txt          Print each entire line
       awk '{print NR, $0}' file.txt      Print line numbers with content
       awk '/error/ {print $0}' log.txt   Print lines matching "error"
       awk -F: '{print $1}' /etc/passwd   Use : as field separator
       awk '{print NF}' file.txt          Print field count per line
       awk 'NR==3' file.txt               Print only the 3rd line`
        };

        return manPages[args[0]] || `<span class="lt-error">No manual entry for ${args[0]}</span>`;
    }

    function _getHelp(cmd) {
        const helps = {
            'ls': 'Usage: ls [OPTION]... [FILE]...\nList directory contents.\n\n  -a  show hidden files\n  -l  long format\n  -h  human-readable sizes',
            'cd': 'Usage: cd [DIRECTORY]\nChange the working directory.',
            'cat': 'Usage: cat [FILE]...\nConcatenate files and print to stdout.',
            'grep': 'Usage: grep [OPTIONS] PATTERN [FILE]...\nSearch for PATTERN in files.',
        };
        return helps[cmd] || `${cmd}: --help not available`;
    }

    // =========================================================================
    // PIPES & REDIRECTION
    // =========================================================================

    function _executePipeline(cmdLine) {
        const commands = cmdLine.split('|').map(c => c.trim());
        let input = '';

        for (const cmd of commands) {
            const { cmd: command, args } = _parseCommand(cmd);
            const output = _executeCommand(command, args, cmd);
            if (output) input = output;
        }

        if (input) _appendOutput(input);

        // Scroll to bottom
        const scrollTarget = state.outputEl || state.containerEl;
        if (scrollTarget) {
            scrollTarget.scrollTop = scrollTarget.scrollHeight;
        }

        // Callback
        if (config.onCommand) {
            config.onCommand(cmdLine, input, 'pipe', []);
        }
    }

    function _executeRedirect(cmdLine) {
        const append = cmdLine.includes('>>');
        const parts = cmdLine.split(append ? '>>' : '>');
        const cmd = parts[0].trim();
        const file = parts[1] ? parts[1].trim() : null;

        if (!file) {
            _appendOutput('<span class="lt-error">Syntax error: missing filename</span>');
            return;
        }

        const { cmd: command, args } = _parseCommand(cmd);
        const output = _executeCommand(command, args, cmd);

        const path = _resolvePath(file);
        const textOutput = output ? output.replace(/<[^>]*>/g, '') : '';

        if (state.fs[path]) {
            state.fs[path].content = append ? (state.fs[path].content || '') + textOutput : textOutput;
        } else {
            _touch([file]);
            if (state.fs[path]) {
                state.fs[path].content = textOutput;
            }
        }

        _appendOutput(`<span class="lt-output-line">[Output redirected to ${file}]</span>`);

        // Scroll to bottom
        const scrollTarget = state.outputEl || state.containerEl;
        if (scrollTarget) {
            scrollTarget.scrollTop = scrollTarget.scrollHeight;
        }

        // Callback
        if (config.onCommand) {
            config.onCommand(cmdLine, output, 'redirect', []);
        }
    }

    // =========================================================================
    // UTILITIES
    // =========================================================================

    function _resolvePath(path) {
        if (!path) return state.currentDir;

        if (path === '~') return state.currentUser.home;
        if (path.startsWith('~/')) path = state.currentUser.home + path.slice(1);

        let resolved;
        if (path.startsWith('/')) {
            resolved = path;
        } else {
            resolved = state.currentDir === '/' ? '/' + path : state.currentDir + '/' + path;
        }

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

    function _getPrompt() {
        const dir = state.currentDir === state.currentUser.home ? '~' :
                    state.currentDir.replace(state.currentUser.home, '~');
        return `${state.currentUser.username}@${config.hostname}:${dir}$`;
    }

    function _updatePrompt() {
        const prompt = _getPrompt();

        if (state.promptEl) {
            state.promptEl.textContent = prompt + ' ';
        }

        if (state.titleEl) {
            const cwd = state.currentDir;
            const displayPath = cwd.startsWith(state.currentUser.home)
                ? '~' + cwd.slice(state.currentUser.home.length)
                : cwd;
            state.titleEl.textContent = `${config.user}@${config.hostname}:${displayPath}`;
        }
    }

    function _historyUp() {
        if (state.historyIndex > 0) {
            state.historyIndex--;
            state.inputEl.value = state.commandHistory[state.historyIndex];
        }
    }

    function _historyDown() {
        if (state.historyIndex < state.commandHistory.length - 1) {
            state.historyIndex++;
            state.inputEl.value = state.commandHistory[state.historyIndex];
        } else {
            state.historyIndex = state.commandHistory.length;
            state.inputEl.value = '';
        }
    }

    function _tabComplete() {
        const input = state.inputEl.value;
        const parts = input.split(' ');
        const current = parts[parts.length - 1];

        if (!current) return;

        const isFirstWord = parts.length === 1;
        let matches = [];

        if (isFirstWord) {
            const commands = ['ls', 'cd', 'pwd', 'cat', 'head', 'tail', 'grep', 'find', 'mkdir', 'rm', 'cp', 'mv',
                           'touch', 'chmod', 'chown', 'echo', 'whoami', 'id', 'groups', 'ps', 'top', 'df', 'du',
                           'free', 'uname', 'man', 'help', 'clear', 'history', 'export', 'env',
                           'sort', 'uniq', 'cut', 'wc', 'file', 'stat', 'rmdir', 'tree', 'which', 'whereis',
                           'locate', 'who', 'w', 'users', 'last', 'hostname', 'uptime', 'date', 'cal',
                           'sudo', 'apt', 'kill', 'tar', 'ln', 'sed', 'awk', 'tr', 'less', 'more',
                           'ping', 'ifconfig', 'ip', 'netstat', 'ss', 'curl', 'wget',
                           'alias', 'type', 'set', 'unset', 'printenv', 'seq', 'time',
                           'basename', 'dirname', 'realpath', 'tee', 'xargs'];
            matches = commands.filter(c => c.startsWith(current));
        } else {
            const basePath = current.includes('/') ?
                _resolvePath(current.substring(0, current.lastIndexOf('/'))) :
                state.currentDir;
            const prefix = current.includes('/') ? current.substring(current.lastIndexOf('/') + 1) : current;
            const node = state.fs[basePath];

            if (node && node.children) {
                matches = node.children.filter(c => c.startsWith(prefix));
            }
        }

        if (matches.length === 1) {
            parts[parts.length - 1] = isFirstWord ? matches[0] :
                (current.includes('/') ? current.substring(0, current.lastIndexOf('/') + 1) + matches[0] : matches[0]);
            state.inputEl.value = parts.join(' ');
        } else if (matches.length > 1) {
            _appendOutput(matches.join('  '));
        }
    }

    function _interrupt() {
        _appendLine('<span class="lt-error">^C</span>');
        state.inputEl.value = '';
    }

    function _clear() {
        const target = state.outputEl || state.containerEl;
        if (target) {
            target.innerHTML = '';
        }
    }

    function _appendLine(html) {
        const line = document.createElement('div');
        line.className = 'lt-line';
        line.innerHTML = html;
        const target = state.outputEl || state.containerEl;
        if (target) {
            target.appendChild(line);
            target.scrollTop = target.scrollHeight;
        }
    }

    function _appendOutput(output) {
        if (!output) return;
        const line = document.createElement('div');
        line.className = 'lt-line lt-output-line';
        line.innerHTML = output;
        const target = state.outputEl || state.containerEl;
        if (target) {
            target.appendChild(line);
            target.scrollTop = target.scrollHeight;
        }
    }

    function _printOutput(text) {
        _appendOutput(text);
    }

    function _escape(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // =========================================================================
    // PUBLIC API - destroy
    // =========================================================================

    function destroy() {
        if (state.inputEl && state._keydownHandler) {
            state.inputEl.removeEventListener('keydown', state._keydownHandler);
        }
        if (state.containerEl && state._clickHandler) {
            state.containerEl.removeEventListener('click', state._clickHandler);
        }
        if (state.containerEl) {
            state.containerEl.innerHTML = '';
        }

        state.isInitialized = false;
        state.containerEl = null;
        state.outputEl = null;
        state.inputEl = null;
        state.promptEl = null;
        state.titleEl = null;
        state._keydownHandler = null;
        state._clickHandler = null;
    }

    function getState() {
        return { ...state };
    }

    // =========================================================================
    // PUBLIC API - print / clear (for lab integration)
    // =========================================================================

    /**
     * Print styled text to the terminal output
     * @param {string} text - Text or HTML to display
     * @param {string} [className] - Optional CSS class (lt-success, lt-error, lt-highlight, lt-cmd)
     */
    function print(text, className) {
        const line = document.createElement('div');
        line.className = 'lt-line' + (className ? ' ' + className : '');
        line.innerHTML = text;
        const target = state.outputEl || state.containerEl;
        if (target) {
            target.appendChild(line);
            target.scrollTop = target.scrollHeight;
        }
    }

    /**
     * Clear all terminal output
     */
    function clear() {
        if (state.outputEl) {
            state.outputEl.innerHTML = '';
        }
    }

    // =========================================================================
    // RETURN PUBLIC API
    // =========================================================================

    return {
        init,
        destroy,
        execute,
        getState,
        completeObjective,

        // Module overlays for labs to inject custom content
        addFilesystem: (overlay) => Object.assign(state.fs, overlay),
        addPackages: (pkgs) => Object.assign(state.packages, pkgs),
        addServices: (svcs) => Object.assign(state.services, svcs),

        // Lab integration convenience methods
        print,
        clear,
        getCwd: () => state.currentDir,
        getFs: () => state.fs,
        getHistory: () => [...state.commandHistory],
    };

})();

// ===============================================================================
// END OF LinuxTerminal.js
// ===============================================================================
//
// Implementation Complete (v2.0.0):
// - IIFE encapsulation matching PSTerminal.js architecture
// - Objective system with _checkObjective() and completeObjective()
// - lt- CSS class prefix to avoid conflicts with PSTerminal
// - 60+ commands preserved (ls, cd, cat, grep, find, chmod, chown, etc.)
// - Pipes and redirection
// - Tab completion, command history, Ctrl+C interrupt
// - Module overlay API (addFilesystem, addPackages, addServices)
// - init/destroy lifecycle
// - Time-on-task analytics
//
// ===============================================================================
