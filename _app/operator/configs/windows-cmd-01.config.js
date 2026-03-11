/* ================================================================
   WINDOWS-CMD-01: Workstation Triage -- Mission Config
   ================================================================
   Terminal-mode mission. Windows command prompt environment.
   Custom commands: scan, move, ipconfig, netstat, tasklist,
   taskkill, sfc, chkdsk, nslookup, ping, status.
   Objectives require running specific commands at workstation.
   ================================================================ */

var WINDOWS_CMD_01_CONFIG = {
    id: 'windows-cmd-01',
    missionTitle: 'WINDOWS-CMD-01',
    title: 'Workstation Triage',
    subtitle: 'Diagnose compromise. Terminate threat. Repair. Verify DNS.',
    category: 'windows-admin',
    difficulty: 1,
    inputMode: 'terminal',
    promptText: 'C:\\Users\\analyst>',
    promptLabel: 'COMMAND PROMPT',
    promptColor: '#e0e0e0',
    notFoundMsg: '\'{cmd}\' is not recognized as an internal or external command,\noperable program or batch file.\nType "help" for available commands.',

    grid: {
        rows: 4,
        cols: 5,
        cells: [
            ['workstation','empty','dns-server','domain-controller','wall'],
            ['empty','print-server','empty','file-server','malware-host'],
            ['wall','network-share','empty','empty','wall'],
            ['wall','wall','backup-server','wall','wall']
        ],
        start: { col: 0, row: 0 }
    },

    nodes: {
        'workstation':       { label: 'WORKSTATION', abbr: 'WKS', ip: '192.168.1.10', desc: 'Compromised Windows workstation',    ports: ['135/RPC','445/SMB','3389/RDP','5985/WinRM'],             os: 'Windows 10 Pro' },
        'dns-server':        { label: 'DNS-SRV',     abbr: 'DNS', ip: '192.168.1.2',  desc: 'Internal DNS server',               ports: ['53/DNS','135/RPC','445/SMB'],                            os: 'Windows Server 2022' },
        'domain-controller': { label: 'DC-01',       abbr: 'DC1', ip: '192.168.1.1',  desc: 'Active Directory domain controller', ports: ['53/DNS','88/Kerberos','389/LDAP','445/SMB','636/LDAPS'], os: 'Windows Server 2022' },
        'print-server':      { label: 'PRINT-SRV',   abbr: 'PRT', ip: '192.168.1.30', desc: 'Network print server',              ports: ['135/RPC','445/SMB','9100/RAW'],                          os: 'Windows Server 2019' },
        'file-server':       { label: 'FILE-SRV',    abbr: 'FSV', ip: '192.168.1.20', desc: 'Corporate file server',             ports: ['445/SMB','137/NetBIOS','138/NetBIOS'],                   os: 'Windows Server 2022' },
        'malware-host':      { label: 'MALWARE-C2',  abbr: 'C2!', ip: '203.0.113.42', desc: 'External command & control server',  ports: ['443/HTTPS','8443/CUSTOM'],                              os: 'Unknown' },
        'network-share':     { label: 'NET-SHARE',   abbr: 'SHR', ip: '192.168.1.25', desc: 'Department shared drive',           ports: ['445/SMB'],                                               os: 'NAS' },
        'backup-server':     { label: 'BACKUP-SRV',  abbr: 'BAK', ip: '192.168.1.50', desc: 'Veeam backup server',               ports: ['22/SSH','9392/VEEAM'],                                   os: 'Windows Server 2022' }
    },

    traps: [],
    gates: {},

    objectives: [
        { id: 'c2-id',       label: 'Identify C2 connection',  check: 'c2Identified' },
        { id: 'kill-proc',   label: 'Kill malicious process',  check: 'malwareKilled' },
        { id: 'repair-sys',  label: 'Repair system files',     check: 'filesRepaired' },
        { id: 'verify-dns',  label: 'Verify DNS integrity',    check: 'dnsVerified' }
    ],

    integrity: 3,

    completion: {
        title: 'WORKSTATION TRIAGE',
        subtitle: 'Threat neutralized. System restored.',
        storageKey: 'hexworth_operator_windowscmd01'
    },

    briefing: [
        'Incoming alert: workstation WKS-192.168.1.10',
        'is sending traffic to an unrecognized',
        'external IP. Diagnose the compromise,',
        'terminate the threat, repair system files,',
        'and verify DNS integrity.'
    ],

    commands: ['scan', 'move', 'ipconfig', 'netstat', 'tasklist', 'taskkill', 'sfc', 'chkdsk', 'nslookup', 'ping', 'status', 'help', 'clear'],

    // Custom state fields beyond engine baseline
    customState: {
        c2Identified: false,
        malwareKilled: false,
        filesRepaired: false,
        dnsVerified: false
    },

    // Status display for the status command
    statusFields: [
        { key: 'c2Identified', label: 'C2 connection', trueText: 'IDENTIFIED', falseText: 'UNKNOWN' },
        { key: 'malwareKilled', label: 'Malicious process', trueText: 'TERMINATED', falseText: 'ACTIVE' },
        { key: 'filesRepaired', label: 'System files', trueText: 'REPAIRED', falseText: 'UNCHECKED' },
        { key: 'dnsVerified', label: 'DNS integrity', trueText: 'VERIFIED', falseText: 'UNVERIFIED' }
    ],

    // Domain-specific terminal commands
    terminalCommands: {
        'ipconfig': {
            help: 'Show network configuration',
            handler: function(args, ctx) {
                var e = ctx.engine, c = ctx.config, s = ctx.state;
                var cellType = c.grid.cells[s.position.row][s.position.col];
                e.printLine('', 'system'); e.printLine('Windows IP Configuration', 'heading'); e.printLine('', 'system');
                if (cellType !== 'empty' && cellType !== 'wall' && c.nodes[cellType]) {
                    var info = c.nodes[cellType];
                    e.printLine('   Host Name . . . . . . . . . . : ' + info.label, 'info');
                    e.printLine('   OS  . . . . . . . . . . . . . : ' + info.os, 'info');
                    e.printLine('', 'system'); e.printLine('Ethernet adapter Ethernet0:', 'heading'); e.printLine('', 'system');
                    e.printLine('   IPv4 Address. . . . . . . . . : ' + info.ip, 'node-info');
                    e.printLine('   Subnet Mask . . . . . . . . . : 255.255.255.0', 'info');
                    e.printLine('   Default Gateway . . . . . . . : 192.168.1.1', 'info');
                    e.printLine('   DNS Server  . . . . . . . . . : 192.168.1.2', 'info');
                } else { e.printLine('   No network adapter detected at this position.', 'warning'); }
                e.printLine('', 'system');
            }
        },
        'netstat': {
            help: 'Show active connections',
            handler: function(args, ctx) {
                var e = ctx.engine, c = ctx.config, s = ctx.state;
                var cellType = c.grid.cells[s.position.row][s.position.col];
                e.printLine('', 'system'); e.printLine('Active Connections', 'heading'); e.printLine('', 'system');
                e.printLine('  Proto  Local Address          Foreign Address        State', 'info');
                if (cellType !== 'workstation') {
                    if (cellType !== 'empty' && cellType !== 'wall' && c.nodes[cellType]) { var info = c.nodes[cellType]; e.printLine('  TCP    ' + info.ip + ':445          192.168.1.10:49300     ESTABLISHED', 'system'); }
                    e.printLine('', 'system'); e.printLine('No suspicious connections detected.', 'info'); return;
                }
                e.printLine('  TCP    192.168.1.10:49152     192.168.1.1:389        ESTABLISHED', 'system');
                e.printLine('  TCP    192.168.1.10:49153     192.168.1.2:53         ESTABLISHED', 'system');
                e.printLine('  TCP    192.168.1.10:49201     203.0.113.42:443       ESTABLISHED  *', 'warning');
                e.printLine('  TCP    192.168.1.10:49202     203.0.113.42:8443      ESTABLISHED  *', 'warning');
                e.printLine('  TCP    192.168.1.10:3389      192.168.1.100:52341    ESTABLISHED', 'system');
                e.printLine('', 'system');
                e.printLine('* Suspicious outbound connections to unknown external host', 'error');
                if (!s.c2Identified) { s.c2Identified = true; e.checkObjectives(); e.saveState(); }
            }
        },
        'tasklist': {
            help: 'Show running processes',
            handler: function(args, ctx) {
                var e = ctx.engine, c = ctx.config, s = ctx.state;
                var cellType = c.grid.cells[s.position.row][s.position.col];
                e.printLine('', 'system');
                e.printLine('Image Name                     PID Session Name        Mem Usage', 'info');
                e.printLine('========================= ======== ================ ==========', 'info');
                if (cellType !== 'workstation') {
                    e.printLine('System Idle Process              0 Services                0 K', 'system');
                    e.printLine('System                           4 Services            1,024 K', 'system');
                    e.printLine('svchost.exe                    512 Services            6,432 K', 'system');
                    e.printLine('', 'system'); e.printLine('No anomalies detected on this host.', 'info'); return;
                }
                e.printLine('System Idle Process              0 Services                0 K', 'system');
                e.printLine('System                           4 Services            1,024 K', 'system');
                e.printLine('svchost.exe                    892 Services           12,432 K', 'system');
                e.printLine('svchost.exe                   1204 Services            8,756 K', 'system');
                e.printLine('explorer.exe                  3456 Console            45,892 K', 'system');
                e.printLine('svchost.exe                   4891 Services           98,432 K  *', 'warning');
                e.printLine('chrome.exe                    5123 Console            89,012 K', 'system');
                e.printLine('tasklist.exe                  7890 Console             5,120 K', 'system');
                e.printLine('', 'system');
                e.printLine('* PID 4891: Abnormal memory usage for svchost.exe -- potential malware', 'error');
            }
        },
        'taskkill': {
            help: 'Kill process by PID', syntax: 'taskkill /PID #',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state;
                var raw = args.join(' ').toLowerCase(), pidMatch = raw.match(/\/pid\s+(\d+)/);
                if (!pidMatch) { e.printLine('Usage: taskkill /PID <process_id>', 'error'); return; }
                var pid = parseInt(pidMatch[1]);
                if (pid === 4891) {
                    if (s.malwareKilled) { e.printLine('ERROR: PID 4891 has already been terminated.', 'warning'); return; }
                    e.printLine('SUCCESS: The process with PID 4891 has been terminated.', 'success');
                    e.printLine('[!] Malicious svchost.exe (98,432 K) killed.', 'success');
                    e.printLine('Outbound C2 connections should begin to drop.', 'info');
                    s.malwareKilled = true; e.checkObjectives(); e.saveState();
                } else if (pid === 0 || pid === 4) {
                    e.printLine('ERROR: Access denied. Cannot terminate system process PID ' + pid + '.', 'error');
                } else if ([892, 1204, 3456, 5123, 7890].indexOf(pid) !== -1) {
                    e.printLine('SUCCESS: The process with PID ' + pid + ' has been terminated.', 'warning');
                    e.printLine('[!] WARNING: You terminated a legitimate process. Focus on PID 4891.', 'warning');
                } else { e.printLine('ERROR: The process "' + pid + '" not found.', 'error'); }
            }
        },
        'sfc': {
            help: 'System File Checker', syntax: 'sfc /scannow',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state;
                if (args.join(' ').toLowerCase() !== '/scannow') { e.printLine('Usage: sfc /scannow', 'error'); return; }
                e.printLine('', 'system'); e.printLine('Beginning system scan. This process will take some time.', 'system');
                e.printLine('', 'system'); e.printLine('Beginning verification phase of system scan.', 'system');
                e.printLine('Verification 100% complete.', 'info'); e.printLine('', 'system');
                if (s.filesRepaired) { e.printLine('Windows Resource Protection did not find any integrity violations.', 'success'); return; }
                e.printLine('Windows Resource Protection found corrupt files and successfully repaired them.', 'success');
                e.printLine('For online repairs, details are included in the CBS log file:', 'info');
                e.printLine('C:\\Windows\\Logs\\CBS\\CBS.log', 'info'); e.printLine('', 'system');
                e.printLine('  Files repaired: 3', 'warning');
                e.printLine('  - C:\\Windows\\System32\\drivers\\tcpip.sys (replaced)', 'warning');
                e.printLine('  - C:\\Windows\\System32\\svchost.exe (replaced)', 'warning');
                e.printLine('  - C:\\Windows\\System32\\netsh.dll (replaced)', 'warning');
                s.filesRepaired = true; e.checkObjectives(); e.saveState();
            }
        },
        'chkdsk': {
            help: 'Check disk integrity',
            handler: function(args, ctx) {
                var e = ctx.engine;
                e.printLine('', 'system'); e.printLine('The type of the file system is NTFS.', 'info');
                e.printLine('Volume label is OS.', 'info'); e.printLine('', 'system');
                e.printLine('Stage 1: Examining basic file system structure ...', 'system');
                e.printLine('  523776 file records processed.', 'system');
                e.printLine('Stage 2: Examining file name linkage ...', 'system');
                e.printLine('  612040 index entries processed.', 'system');
                e.printLine('Stage 3: Examining security descriptors ...', 'system');
                e.printLine('  52416 security descriptors processed.', 'system'); e.printLine('', 'system');
                e.printLine('Windows has scanned the file system and found no problems.', 'success');
                e.printLine('No further action is required.', 'info');
            }
        },
        'nslookup': {
            help: 'DNS lookup on a node', syntax: 'nslookup <node>',
            handler: function(args, ctx) {
                var e = ctx.engine, s = ctx.state;
                if (!args.length) { e.printLine('Usage: nslookup <node name or IP>', 'error'); return; }
                var target = args.join(' '), node = e.resolveNode(target);
                if (!node) { e.printLine('*** UnKnown can\'t find ' + target + ': Non-existent domain', 'error'); return; }
                if (node.visibility === 'hidden') { e.printLine('DNS request timed out. Server not reachable.', 'error'); return; }
                var info = node.info;
                e.printLine('', 'system');
                e.printLine('Server:  dns-srv.corp.local', 'info');
                e.printLine('Address: 192.168.1.2', 'info'); e.printLine('', 'system');
                e.printLine('Name:    ' + info.label.toLowerCase() + '.corp.local', 'node-info');
                e.printLine('Address: ' + info.ip, 'node-info');
                if (node.type === 'domain-controller' && !s.dnsVerified) {
                    e.printLine('', 'system');
                    e.printLine('[+] DNS resolution for DC-01 confirmed clean.', 'success');
                    e.printLine('[+] No DNS poisoning or hijacking detected.', 'success');
                    s.dnsVerified = true; e.checkObjectives(); e.saveState();
                }
            }
        }
    }
};
