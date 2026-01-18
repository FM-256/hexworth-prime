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

const CLHTerminal = (function() {
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

        // Check objectives
        _checkObjectives(cmdLine);

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
            case 'groups': return currentUser.groups.map(g => g.name).join(' ');
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

        const newPath = _resolvePath(target);
        const node = state.fs[newPath];

        if (!node) return _err(`cd: ${target}: No such file or directory`);
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

        if (node.type === 'dir') {
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
        let ignoreCase = false, showLineNumbers = false;
        let pattern = null;
        const files = [];

        for (let i = 0; i < args.length; i++) {
            if (args[i] === '-i') ignoreCase = true;
            else if (args[i] === '-n') showLineNumbers = true;
            else if (args[i].startsWith('-')) continue;
            else if (!pattern) pattern = args[i];
            else files.push(args[i]);
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
            for (let i = 0; i < lines.length; i++) {
                if (regex.test(lines[i])) {
                    const prefix = files.length > 1 ? `${f}:` : '';
                    const lineNum = showLineNumbers ? `${i + 1}:` : '';
                    const highlighted = lines[i].replace(regex, '<span class="clh-highlight">$&</span>');
                    results.push(`${prefix}${lineNum}${highlighted}`);
                }
                regex.lastIndex = 0;
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

    function _checkObjectives(cmdLine) {
        let anyCompleted = false;

        for (const obj of state.objectives) {
            if (state.objectivesCompleted[obj.id]) continue;

            let completed = false;
            if (typeof obj.check === 'function') {
                completed = obj.check(cmdLine, state);
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
    };

})();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CLHTerminal;
}
