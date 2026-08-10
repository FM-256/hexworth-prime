/**
 * SecurityTerminal.js - Advanced Security & Network Simulation Terminal
 * Hexworth Prime - Eye House / CyberOps
 *
 * Extends LinuxTerminal.js with comprehensive security tools:
 * - nmap (full flag support, realistic output, vulnerability hints)
 * - traceroute/tracert (simulated network topology)
 * - dig/nslookup (DNS queries)
 * - whois (domain/IP lookups)
 * - tcpdump (packet capture simulation)
 * - arp (ARP table)
 * - route (routing table)
 * - ncat/nc (netcat simulation)
 *
 * Includes Virtual Network Engine with:
 * - Configurable network topology
 * - Multiple hosts with services
 * - Realistic latencies and packet loss
 * - SOC scenario support
 *
 * Usage:
 *   const secTerminal = new SecurityTerminal({
 *       container: '#terminal',
 *       inputElement: '#commandInput',
 *       scenario: 'incident-response', // or 'recon', 'forensics', etc.
 *       onObjectiveComplete: (objective) => { ... }
 *   });
 *
 * Version: 1.0.0
 * Created: January 5, 2026
 * House: Eye (CyberOps)
 */

/* STANDALONE AS OF 2026-08-10, and this was a LIVE BUG, not a refactor for taste.
 *
 * This class declared `extends LinuxTerminal`. LinuxTerminal is
 * `const LinuxTerminal = (function(){...})()`, an IIFE returning a plain OBJECT, so it is not
 * a constructor and the extends clause threw at script-load time:
 *     TypeError: Class extends value #<Object> is not a constructor
 * The failed class declaration also left `SecurityTerminal` in a permanent TDZ, so even
 * `typeof SecurityTerminal` raised. Every page loading this file got a terminal that rendered
 * its banner and prompt and then did NOTHING: verified in a browser on the nmap lab, where
 * typing a command and pressing Enter left the output length unchanged at 591 characters and
 * the text sitting in the input box. Five lab pages were affected.
 *
 * WHY STANDALONE RATHER THAN COMPOSING LinuxTerminal. Measured what the five labs actually
 * use: nmap, host, whois, dig, traceroute and tcpdump. They do not use the 60+ Linux
 * commands. LinuxTerminal is also a SINGLETON that takes ownership of a container selector,
 * and every one of these labs overrides `_displayOutput` to render into that same container
 * itself, so wiring both would have them writing to one element. The dependency surface on
 * the phantom parent was one method and five properties; this class already defined the other
 * 45 itself. Standalone is the smaller, safer change.
 *
 * If a future lab genuinely needs `ls`/`cat`/`grep` in this terminal, delegate to
 * LinuxTerminal.execute() from _executeFallback rather than reintroducing inheritance.
 */
class SecurityTerminal {
    constructor(options = {}) {
        /* State the phantom parent used to be assumed to provide. Enumerated from the real
           references in this file, not guessed: _parseCommand plus config, commandHistory,
           containerEl, currentDir and currentUser. */
        const user = options.user || 'analyst';
        const hostname = options.hostname || 'workstation';
        this.config = {
            user, hostname,
            container: options.container || null,
            inputElement: options.inputElement || null
        };
        this.currentUser = { name: user, home: `/home/${user}` };
        this.currentDir = options.startDir || this.currentUser.home;
        this.commandHistory = [];
        this.historyIndex = 0;
        this.containerEl = typeof document !== 'undefined' && options.container
            ? document.querySelector(options.container)
            : null;

        // Security terminal specific config
        this.securityConfig = {
            scenario: options.scenario || 'default',
            onObjectiveComplete: options.onObjectiveComplete || null,
            allowExternalScans: options.allowExternalScans || false,
            difficulty: options.difficulty || 'intermediate',
            hints: options.hints !== false
        };

        // Virtual network topology
        this.network = this._initNetwork(options.customNetwork);

        // Scenario objectives tracking
        this.objectives = [];
        this.completedObjectives = [];

        // Command history for security analysis
        this.scanHistory = [];

        // Initialize scenario
        this._initScenario(this.securityConfig.scenario);
    }

    /* Was inherited from the phantom parent. Splits a command line into {cmd, args},
       honouring simple single/double quoting so an argument containing a space survives
       (nmap -oN "scan out.txt"). Empty input yields {cmd:'', args:[]} rather than throwing,
       because execute() guards on the trimmed line and must never depend on this to. */
    _parseCommand(line) {
        const tokens = String(line || '').match(/"[^"]*"|'[^']*'|\S+/g) || [];
        const clean = tokens.map(t => t.replace(/^["']|["']$/g, ''));
        return { cmd: clean[0] || '', args: clean.slice(1) };
    }

    /* Replaces `super._executeCommand`. This terminal is standalone, so a command it does
       not own is reported rather than silently swallowed: a student typing `ls` should be
       told this console is a security toolset, not left staring at a dead prompt, which is
       exactly the failure mode the extends bug produced for every command. */
    _executeFallback(cmd, args, raw) {
        if (!cmd) return '';
        return `<span class="lt-error">${this._escape(cmd)}: command not found</span>\n` +
               `This console provides security tooling. Try <span class="command">sechelp</span> ` +
               `for the available commands.`;
    }

    // ═══════════════════════════════════════════════════════════════
    // VIRTUAL NETWORK ENGINE
    // ═══════════════════════════════════════════════════════════════

    _initNetwork(customNetwork) {
        if (customNetwork) return customNetwork;

        // Default virtual network topology
        return {
            // Local machine
            localhost: {
                ip: '127.0.0.1',
                hostname: 'localhost',
                mac: '00:00:00:00:00:00',
                os: 'Linux',
                services: [
                    { port: 22, service: 'ssh', version: 'OpenSSH 8.9', state: 'open' }
                ]
            },

            // Student's machine
            'student-workstation': {
                ip: '192.168.1.100',
                hostname: 'student-workstation',
                mac: '00:11:22:33:44:55',
                os: 'Linux 5.15',
                gateway: '192.168.1.1',
                dns: '192.168.1.1',
                services: [
                    { port: 22, service: 'ssh', version: 'OpenSSH 8.9p1', state: 'open', banner: 'SSH-2.0-OpenSSH_8.9p1 Ubuntu-3' },
                    { port: 80, service: 'http', version: 'nginx 1.18.0', state: 'open', banner: 'nginx/1.18.0 (Ubuntu)' }
                ]
            },

            // Network gateway/router
            'gateway': {
                ip: '192.168.1.1',
                hostname: 'gateway.local',
                mac: 'aa:bb:cc:dd:ee:ff',
                os: 'RouterOS',
                services: [
                    { port: 22, service: 'ssh', version: 'Dropbear 2020.81', state: 'open' },
                    { port: 53, service: 'domain', version: 'dnsmasq 2.85', state: 'open' },
                    { port: 80, service: 'http', version: 'RouterOS HTTP', state: 'open' }
                ]
            },

            // Web server (target)
            'web-server': {
                ip: '192.168.1.10',
                hostname: 'web01.internal',
                mac: '11:22:33:44:55:66',
                os: 'Ubuntu 22.04',
                services: [
                    { port: 22, service: 'ssh', version: 'OpenSSH 8.9p1', state: 'open', banner: 'SSH-2.0-OpenSSH_8.9p1 Ubuntu-3' },
                    { port: 80, service: 'http', version: 'Apache httpd 2.4.52', state: 'open', banner: 'Apache/2.4.52 (Ubuntu)' },
                    { port: 443, service: 'https', version: 'Apache httpd 2.4.52', state: 'open', ssl: true },
                    { port: 3306, service: 'mysql', version: 'MySQL 8.0.31', state: 'filtered', banner: '5.7.40-0ubuntu0.18.04.1' }
                ],
                vulns: ['CVE-2021-44228'] // Log4j for educational purposes
            },

            // Database server
            'db-server': {
                ip: '192.168.1.20',
                hostname: 'db01.internal',
                mac: '22:33:44:55:66:77',
                os: 'Ubuntu 20.04',
                services: [
                    { port: 22, service: 'ssh', version: 'OpenSSH 8.2p1', state: 'open' },
                    { port: 3306, service: 'mysql', version: 'MySQL 8.0.31', state: 'open' },
                    { port: 5432, service: 'postgresql', version: 'PostgreSQL 14.5', state: 'open' }
                ]
            },

            // Suspicious host (for incident response scenarios)
            'suspicious-host': {
                ip: '192.168.1.50',
                hostname: 'unknown',
                mac: '66:77:88:99:aa:bb',
                os: 'Unknown',
                services: [
                    { port: 22, service: 'ssh', version: 'OpenSSH 7.6p1', state: 'open' },
                    { port: 4444, service: 'unknown', version: 'Meterpreter?', state: 'open', suspicious: true },
                    { port: 8080, service: 'http-proxy', version: 'Cobalt Strike?', state: 'open', suspicious: true }
                ],
                ioc: true,
                notes: 'Potential C2 server - investigate immediately'
            },

            // External hosts (for traceroute)
            'isp-router-1': {
                ip: '10.0.0.1',
                hostname: 'edge-router.isp.net',
                latency: 5
            },
            'isp-router-2': {
                ip: '172.16.0.1',
                hostname: 'core-router.isp.net',
                latency: 12
            },
            'ix-router': {
                ip: '198.32.124.1',
                hostname: 'ix.equinix.com',
                latency: 25
            },
            'google-edge': {
                ip: '142.250.80.1',
                hostname: 'edge.google.com',
                latency: 35
            },
            'google-dns': {
                ip: '8.8.8.8',
                hostname: 'dns.google',
                latency: 42
            },
            'cloudflare-dns': {
                ip: '1.1.1.1',
                hostname: 'one.one.one.one',
                latency: 38
            }
        };
    }

    _initScenario(scenario) {
        const scenarios = {
            'default': {
                name: 'Free Exploration',
                description: 'Explore the virtual network freely',
                objectives: []
            },
            'recon': {
                name: 'Network Reconnaissance',
                description: 'Discover and enumerate hosts on the network',
                objectives: [
                    { id: 'discover_hosts', text: 'Discover active hosts on 192.168.1.0/24', completed: false },
                    { id: 'identify_webserver', text: 'Identify the web server IP', completed: false },
                    { id: 'enum_services', text: 'Enumerate services on the web server', completed: false },
                    { id: 'version_detect', text: 'Detect service versions', completed: false }
                ]
            },
            'incident-response': {
                name: 'Incident Response',
                description: 'Investigate a potential security breach',
                objectives: [
                    { id: 'find_suspicious', text: 'Locate the suspicious host', completed: false },
                    { id: 'identify_c2', text: 'Identify potential C2 ports', completed: false },
                    { id: 'document_iocs', text: 'Document IOCs for the SIEM', completed: false }
                ]
            },
            'traceroute-analysis': {
                name: 'Network Path Analysis',
                description: 'Map network paths and identify routing issues',
                objectives: [
                    { id: 'trace_google', text: 'Trace route to 8.8.8.8', completed: false },
                    { id: 'identify_hops', text: 'Count the number of hops', completed: false },
                    { id: 'find_latency', text: 'Identify highest latency hop', completed: false }
                ]
            }
        };

        const selectedScenario = scenarios[scenario] || scenarios['default'];
        this.objectives = [...selectedScenario.objectives];
        this.currentScenario = selectedScenario;
    }

    // ═══════════════════════════════════════════════════════════════
    // COMMAND EXECUTION OVERRIDE
    // ═══════════════════════════════════════════════════════════════

    execute(command) {
        const trimmed = command.trim();
        if (!trimmed) return;

        // Add to history
        this.commandHistory.push(trimmed);
        this.historyIndex = this.commandHistory.length;

        // Parse command - returns {cmd, args} object
        const parsed = this._parseCommand(trimmed);
        const cmd = parsed.cmd?.toLowerCase();
        const args = parsed.args || [];

        // Check if it's a security command we handle
        // Note: ping, curl, wget fall through to LinuxTerminal parent class
        const securityCommands = ['nmap', 'traceroute', 'tracert', 'dig', 'nslookup',
                                   'whois', 'tcpdump', 'arp', 'route', 'nc', 'ncat',
                                   'host', 'mtr', 'sechelp'];

        let output;
        if (securityCommands.includes(cmd)) {
            output = this._executeSecurityCommand(cmd, args, trimmed);
        } else {
            // Fall back to parent class for standard Linux commands
            output = this._executeFallback(cmd, args, trimmed);
        }

        // Display output (can be overridden by lab pages)
        this._displayOutput(trimmed, output);

        // Track for security analysis
        if (securityCommands.includes(cmd)) {
            this.scanHistory.push({ command: trimmed, timestamp: new Date(), output });
            this._checkObjectives(cmd, args, output);
        }
    }

    // Default display output - can be overridden by lab pages
    _displayOutput(command, output) {
        // If parent has containerEl, use it
        if (this.containerEl) {
            this._appendLine(`<span class="prompt">${this._getPrompt()}</span> <span class="command">${this._escape(command)}</span>`);
            if (output !== null && output !== undefined) {
                this._appendOutput(output);
            }
            this.containerEl.scrollTop = this.containerEl.scrollHeight;
        }
    }

    // Helper to get prompt string
    _getPrompt() {
        return `${this.config.user}@${this.config.hostname}:${this.currentDir.replace(this.currentUser.home, '~')}$`;
    }

    // Helper to escape HTML
    _escape(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Helper to append line to terminal
    _appendLine(html) {
        if (this.containerEl) {
            const line = document.createElement('div');
            line.className = 'terminal-line';
            line.innerHTML = html;
            this.containerEl.appendChild(line);
        }
    }

    // Helper to append output
    _appendOutput(output) {
        if (this.containerEl && output) {
            const line = document.createElement('div');
            line.className = 'terminal-line output';
            line.innerHTML = output;
            this.containerEl.appendChild(line);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // SECURITY COMMANDS
    // ═══════════════════════════════════════════════════════════════

    _executeSecurityCommand(cmd, args, fullCommand) {
        switch(cmd) {
            case 'nmap':
                return this._nmap(args);
            case 'traceroute':
            case 'tracert':
                return this._traceroute(args);
            case 'dig':
                return this._dig(args);
            case 'nslookup':
                return this._nslookup(args);
            case 'whois':
                return this._whois(args);
            case 'tcpdump':
                return this._tcpdump(args);
            case 'arp':
                return this._arp(args);
            case 'route':
                return this._route(args);
            case 'nc':
            case 'ncat':
                return this._netcat(args);
            case 'host':
                return this._host(args);
            case 'mtr':
                return this._mtr(args);
            case 'sechelp':
                return this._securityHelp();
            default:
                return `<span class="error">${cmd}: command not found</span>`;
        }
    }

    _securityHelp() {
        return `<span class="nmap-header">═══════════════════════════════════════════════════════════════</span>
<span class="highlight">              SECURITY TERMINAL - Available Tools</span>
<span class="nmap-header">═══════════════════════════════════════════════════════════════</span>

<span class="nmap-section">NETWORK SCANNING:</span>
  nmap [options] target   <span class="muted">Network scanner (use 'nmap' for help)</span>

<span class="nmap-section">ROUTE ANALYSIS:</span>
  traceroute target       <span class="muted">Trace network path to destination</span>
  mtr target              <span class="muted">My Traceroute - continuous monitoring</span>

<span class="nmap-section">DNS TOOLS:</span>
  dig domain [type]       <span class="muted">DNS lookup with details</span>
  nslookup hostname       <span class="muted">Simple DNS query</span>
  host hostname           <span class="muted">Quick DNS lookup</span>
  whois domain            <span class="muted">Domain registration info</span>

<span class="nmap-section">NETWORK INFO:</span>
  arp                     <span class="muted">Show ARP table</span>
  route                   <span class="muted">Show routing table</span>
  tcpdump [-c n]          <span class="muted">Capture network packets</span>

<span class="nmap-section">CONNECTION:</span>
  nc host port            <span class="muted">Netcat - banner grabbing</span>

<span class="nmap-section">VIRTUAL NETWORK:</span>
  192.168.1.0/24          <span class="muted">Available subnet to explore</span>
  <span class="warning">192.168.1.50</span>            <span class="muted">Suspicious host (investigate!)</span>

<span class="nmap-header">═══════════════════════════════════════════════════════════════</span>`;
    }

    // ═══════════════════════════════════════════════════════════════
    // NMAP - Comprehensive Network Scanner Simulation
    // ═══════════════════════════════════════════════════════════════

    _nmap(args) {
        if (args.length === 0) {
            return this._nmapHelp();
        }

        // Parse nmap flags
        const flags = this._parseNmapFlags(args);
        const target = flags.target;

        if (!target) {
            return '<span class="error">Nmap requires a target specification</span>\nUsage: nmap [options] target';
        }

        // Check for legal warning acknowledgment
        if (!flags.skipWarning && !this.securityConfig.allowExternalScans) {
            const isExternal = !target.startsWith('192.168.') &&
                              !target.startsWith('10.') &&
                              !target.startsWith('172.16.') &&
                              target !== 'localhost' &&
                              target !== '127.0.0.1';

            if (isExternal) {
                return `<span class="warning"><img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> WARNING: Scanning external hosts requires authorization!</span>
<span class="info">In this lab, you may scan the internal network (192.168.1.0/24) freely.</span>
<span class="muted">Add --legal-ack flag to acknowledge and proceed with simulated external scan.</span>`;
            }
        }

        // Build output based on scan type
        let output = this._generateNmapOutput(flags, target);

        return output;
    }

    _parseNmapFlags(args) {
        const flags = {
            target: null,
            scanType: 'sS', // Default: SYN scan
            portSpec: null,
            allPorts: false,
            versionDetect: false,
            osDetect: false,
            scripts: false,
            aggressive: false,
            verbose: 0,
            timing: 3,
            outputFormat: 'normal',
            skipWarning: false,
            ping: true,
            topPorts: null,
            subnet: false
        };

        for (let i = 0; i < args.length; i++) {
            const arg = args[i];

            // Scan types
            if (arg === '-sS') flags.scanType = 'sS';
            else if (arg === '-sT') flags.scanType = 'sT';
            else if (arg === '-sU') flags.scanType = 'sU';
            else if (arg === '-sV') flags.versionDetect = true;
            else if (arg === '-sC') flags.scripts = true;
            else if (arg === '-sn' || arg === '-sP') { flags.scanType = 'ping'; flags.ping = true; }

            // Port specification
            else if (arg === '-p' && args[i+1]) {
                flags.portSpec = args[++i];
            }
            else if (arg === '-p-') flags.allPorts = true;
            else if (arg.startsWith('-p')) flags.portSpec = arg.substring(2);
            else if (arg === '--top-ports' && args[i+1]) {
                flags.topPorts = parseInt(args[++i]);
            }

            // Detection
            else if (arg === '-O') flags.osDetect = true;
            else if (arg === '-A') {
                flags.aggressive = true;
                flags.versionDetect = true;
                flags.osDetect = true;
                flags.scripts = true;
            }

            // Verbosity
            else if (arg === '-v') flags.verbose = 1;
            else if (arg === '-vv') flags.verbose = 2;
            else if (arg === '-vvv') flags.verbose = 3;

            // Timing
            else if (arg.startsWith('-T')) flags.timing = parseInt(arg.substring(2)) || 3;

            // Output
            else if (arg === '-oN' || arg === '-oX' || arg === '-oG') {
                flags.outputFormat = arg;
                i++; // skip filename
            }

            // Skip warning
            else if (arg === '--legal-ack') flags.skipWarning = true;

            // No ping
            else if (arg === '-Pn') flags.ping = false;

            // Target (last non-flag argument)
            else if (!arg.startsWith('-')) {
                flags.target = arg;
                if (arg.includes('/')) flags.subnet = true;
            }
        }

        return flags;
    }

    _generateNmapOutput(flags, target) {
        const startTime = new Date().toUTCString();
        let output = '';

        // Header
        output += `<span class="nmap-header">Starting Nmap 7.94 ( https://nmap.org ) at ${startTime}</span>\n`;

        // Handle subnet scanning
        if (flags.subnet || target.endsWith('/24')) {
            return this._generateSubnetScan(flags, target);
        }

        // Ping sweep only
        if (flags.scanType === 'ping') {
            return this._generatePingSweep(flags, target);
        }

        // Find target in network
        const host = this._findHost(target);

        if (!host) {
            output += `<span class="error">Note: Host seems down. If it is really up, but blocking our ping probes, try -Pn</span>\n`;
            output += `Nmap done: 1 IP address (0 hosts up) scanned in 2.05 seconds`;
            return output;
        }

        // Verbose output
        if (flags.verbose >= 1) {
            output += `<span class="muted">Initiating ${this._getScanTypeName(flags.scanType)} Scan at ${new Date().toLocaleTimeString()}</span>\n`;
            if (flags.verbose >= 2) {
                output += `<span class="muted">Scanning ${host.ip} [${host.services?.length || 0} ports]</span>\n`;
            }
        }

        // Host discovery
        output += `Nmap scan report for ${host.hostname || host.ip}${host.hostname ? ` (${host.ip})` : ''}\n`;
        output += `Host is up (${(Math.random() * 0.005 + 0.001).toFixed(4)}s latency).\n`;

        // Port scan results
        if (host.services && host.services.length > 0) {
            output += this._generatePortTable(host, flags);
        } else {
            output += `All 1000 scanned ports on ${host.ip} are closed\n`;
        }

        // OS Detection
        if (flags.osDetect && host.os) {
            output += `\n<span class="nmap-section">OS Detection:</span>\n`;
            output += `Running: ${host.os}\n`;
            output += `OS CPE: cpe:/o:${host.os.toLowerCase().replace(' ', '_')}\n`;
            output += `OS details: ${host.os}\n`;
        }

        // Script results
        if (flags.scripts && host.services) {
            const scriptResults = this._generateScriptOutput(host);
            if (scriptResults) {
                output += `\n<span class="nmap-section">Host script results:</span>\n`;
                output += scriptResults;
            }
        }

        // MAC address
        if (host.mac && host.ip !== '127.0.0.1') {
            output += `MAC Address: ${host.mac.toUpperCase()} (${this._getMacVendor(host.mac)})\n`;
        }

        // Suspicious host warning (for training)
        if (host.ioc && this.securityConfig.hints) {
            output += `\n<span class="warning"><img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> ANALYST NOTE: Unusual services detected - recommend further investigation</span>\n`;
        }

        // Footer
        const scanTime = (Math.random() * 3 + 1).toFixed(2);
        output += `\nNmap done: 1 IP address (1 host up) scanned in ${scanTime} seconds`;

        return output;
    }

    _generatePortTable(host, flags) {
        let output = '\n';

        // Determine which ports to show
        let servicesToShow = host.services;
        if (flags.portSpec) {
            const specifiedPorts = this._parsePortSpec(flags.portSpec);
            servicesToShow = host.services.filter(s => specifiedPorts.includes(s.port));

            // Add closed ports in range
            const closedPorts = specifiedPorts.filter(p => !host.services.find(s => s.port === p));
            if (closedPorts.length > 0 && closedPorts.length <= 10) {
                closedPorts.forEach(p => {
                    servicesToShow.push({ port: p, service: 'unknown', state: 'closed' });
                });
            }
        }

        // Table header
        output += '<span class="nmap-header">PORT      STATE    SERVICE';
        if (flags.versionDetect) output += '         VERSION';
        output += '</span>\n';

        // Sort by port number
        servicesToShow.sort((a, b) => a.port - b.port);

        // Port rows
        servicesToShow.forEach(svc => {
            const portStr = `${svc.port}/tcp`.padEnd(10);
            // Pad state before adding HTML color to maintain alignment
            const stateRaw = (svc.state || 'unknown').padEnd(9);
            const stateStr = this._colorState(svc.state, stateRaw);
            const serviceStr = (svc.service || 'unknown').padEnd(13);

            output += `${portStr}${stateStr}${serviceStr}`;

            if (flags.versionDetect && svc.version) {
                output += ` ${svc.version}`;
            }
            output += '\n';

            // Script output for this port
            if (flags.scripts && svc.suspicious) {
                output += `<span class="warning">|_banner: ${svc.banner || 'Unknown banner'}</span>\n`;
                output += `<span class="error">|_SUSPICIOUS: Non-standard service on port ${svc.port}</span>\n`;
            }
        });

        return output;
    }

    _colorState(state, paddedStr) {
        // Use paddedStr if provided (for table alignment), otherwise just the state
        const text = paddedStr || state;
        switch(state) {
            case 'open': return `<span class="port-open">${text}</span>`;
            case 'closed': return `<span class="port-closed">${text}</span>`;
            case 'filtered': return `<span class="port-filtered">${text}</span>`;
            default: return text;
        }
    }

    _generateSubnetScan(flags, target) {
        const baseIP = target.replace('/24', '').split('.').slice(0, 3).join('.');
        let output = `<span class="nmap-header">Starting Nmap 7.94 ( https://nmap.org )</span>\n`;
        output += `Initiating ${flags.scanType === 'ping' ? 'Ping' : 'ARP'} Scan at ${new Date().toLocaleTimeString()}\n`;
        output += `Scanning ${target} [256 hosts]\n\n`;

        const foundHosts = [];

        // Find all hosts in our virtual network that match this subnet
        Object.values(this.network).forEach(host => {
            if (host.ip && host.ip.startsWith(baseIP)) {
                foundHosts.push(host);
            }
        });

        if (foundHosts.length === 0) {
            output += `<span class="error">No hosts found in ${target}</span>\n`;
        } else {
            foundHosts.forEach(host => {
                output += `Nmap scan report for ${host.hostname || host.ip}${host.hostname ? ` (${host.ip})` : ''}\n`;
                output += `Host is up (${(Math.random() * 0.01).toFixed(4)}s latency).\n`;
                if (host.mac) {
                    output += `MAC Address: ${host.mac.toUpperCase()} (${this._getMacVendor(host.mac)})\n`;
                }
                output += '\n';
            });
        }

        output += `Nmap done: 256 IP addresses (${foundHosts.length} hosts up) scanned in ${(Math.random() * 5 + 3).toFixed(2)} seconds`;

        // Check objectives
        if (foundHosts.length > 0) {
            this._completeObjective('discover_hosts');
        }

        return output;
    }

    _generatePingSweep(flags, target) {
        return this._generateSubnetScan({ ...flags, scanType: 'ping' }, target);
    }

    _generateScriptOutput(host) {
        let output = '';

        host.services?.forEach(svc => {
            if (svc.service === 'ssh') {
                output += `|_ssh-hostkey: 2048 SHA256:xxxxxxxxxxxxxxxxxxxxxxxxxxx (RSA)\n`;
            }
            if (svc.service === 'http' || svc.service === 'https') {
                output += `|_http-title: Welcome to ${host.hostname || 'the server'}\n`;
                output += `|_http-server-header: ${svc.version || 'Unknown'}\n`;
            }
            if (svc.service === 'mysql') {
                output += `|_mysql-info: MySQL ${svc.version || '5.7'}\n`;
            }
        });

        // Vulnerability hints
        if (host.vulns && host.vulns.length > 0) {
            output += `\n<span class="error">| vulns:</span>\n`;
            host.vulns.forEach(vuln => {
                output += `<span class="error">|   ${vuln}: Potential vulnerability detected</span>\n`;
            });
        }

        return output;
    }

    _findHost(target) {
        // Search by IP or hostname
        for (const [name, host] of Object.entries(this.network)) {
            if (host.ip === target || host.hostname === target || name === target) {
                return host;
            }
        }
        return null;
    }

    _parsePortSpec(spec) {
        const ports = [];
        const parts = spec.split(',');

        parts.forEach(part => {
            if (part.includes('-')) {
                const [start, end] = part.split('-').map(Number);
                for (let i = start; i <= Math.min(end, start + 100); i++) {
                    ports.push(i);
                }
            } else {
                ports.push(parseInt(part));
            }
        });

        return ports.filter(p => !isNaN(p));
    }

    _getScanTypeName(type) {
        const types = {
            'sS': 'SYN Stealth',
            'sT': 'TCP Connect',
            'sU': 'UDP',
            'ping': 'Ping'
        };
        return types[type] || 'Port';
    }

    _getMacVendor(mac) {
        const prefix = mac.substring(0, 8).toUpperCase();
        const vendors = {
            '00:11:22': 'CIMSYS Inc',
            '11:22:33': 'Private',
            '22:33:44': 'Private',
            'AA:BB:CC': 'Network Equipment',
            '66:77:88': 'Unknown Vendor'
        };
        return vendors[prefix] || 'Unknown';
    }

    _nmapHelp() {
        return `<span class="nmap-header">Nmap 7.94 ( https://nmap.org )</span>
Usage: nmap [Scan Type(s)] [Options] {target specification}

<span class="highlight">TARGET SPECIFICATION:</span>
  hostname, IP address, network (192.168.1.0/24)

<span class="highlight">SCAN TECHNIQUES:</span>
  -sS  TCP SYN scan (default, stealthy)
  -sT  TCP connect scan
  -sU  UDP scan
  -sn  Ping scan - no port scan
  -sV  Version detection

<span class="highlight">PORT SPECIFICATION:</span>
  -p &lt;port ranges&gt;  Only scan specified ports (e.g., -p 22,80,443)
  -p-               Scan all 65535 ports
  --top-ports &lt;n&gt;   Scan n most common ports

<span class="highlight">SERVICE/VERSION DETECTION:</span>
  -sV  Probe open ports for service/version info
  -O   Enable OS detection
  -A   Aggressive scan (OS, version, scripts, traceroute)

<span class="highlight">SCRIPT SCAN:</span>
  -sC  Equivalent to --script=default
  --script=&lt;scripts&gt;  Run specific scripts

<span class="highlight">TIMING:</span>
  -T0 to -T5  Set timing template (higher = faster)

<span class="highlight">OUTPUT:</span>
  -v   Increase verbosity
  -oN  Normal output to file

<span class="highlight">EXAMPLES:</span>
  nmap 192.168.1.10              # Basic scan
  nmap -sV -p 22,80 192.168.1.10 # Version detect on specific ports
  nmap -A 192.168.1.10           # Aggressive scan
  nmap -sn 192.168.1.0/24        # Ping sweep subnet`;
    }

    // ═══════════════════════════════════════════════════════════════
    // TRACEROUTE - Network Path Simulation
    // ═══════════════════════════════════════════════════════════════

    _traceroute(args) {
        if (args.length === 0) {
            return `Usage: traceroute [-n] [-m max_ttl] [-q nqueries] host
Try 'traceroute --help' for more information.`;
        }

        const target = args.find(a => !a.startsWith('-')) || '8.8.8.8';
        const numericOnly = args.includes('-n');
        const maxHops = 30;

        let output = `<span class="traceroute-header">traceroute to ${target}, ${maxHops} hops max, 60 byte packets</span>\n`;

        // Build route based on target
        const route = this._buildRoute(target);

        route.forEach((hop, index) => {
            const hopNum = (index + 1).toString().padStart(2, ' ');

            if (hop.timeout) {
                output += `${hopNum}  * * *\n`;
            } else {
                const latency1 = (hop.latency + Math.random() * 2).toFixed(3);
                const latency2 = (hop.latency + Math.random() * 2).toFixed(3);
                const latency3 = (hop.latency + Math.random() * 2).toFixed(3);

                if (numericOnly) {
                    output += `${hopNum}  ${hop.ip}  ${latency1} ms  ${latency2} ms  ${latency3} ms\n`;
                } else {
                    output += `${hopNum}  ${hop.hostname} (${hop.ip})  ${latency1} ms  ${latency2} ms  ${latency3} ms\n`;
                }
            }
        });

        // Check objectives
        if (target === '8.8.8.8') {
            this._completeObjective('trace_google');
        }

        return output;
    }

    _buildRoute(target) {
        // Default route to internet
        const route = [
            { ip: '192.168.1.1', hostname: 'gateway.local', latency: 1 },
            { ip: '10.0.0.1', hostname: 'edge-router.isp.net', latency: 8 },
            { ip: '172.16.0.1', hostname: 'core-router.isp.net', latency: 15 }
        ];

        // Add internet hops based on target
        if (target === '8.8.8.8' || target.includes('google')) {
            route.push({ ip: '198.32.124.1', hostname: 'ix.equinix.com', latency: 25 });
            route.push({ timeout: true }); // Simulated timeout
            route.push({ ip: '142.250.80.1', hostname: 'edge.google.com', latency: 38 });
            route.push({ ip: '8.8.8.8', hostname: 'dns.google', latency: 42 });
        } else if (target === '1.1.1.1' || target.includes('cloudflare')) {
            route.push({ ip: '198.32.124.1', hostname: 'ix.equinix.com', latency: 22 });
            route.push({ ip: '1.1.1.1', hostname: 'one.one.one.one', latency: 35 });
        } else if (target.startsWith('192.168.1.')) {
            // Local network - just gateway
            return [
                { ip: '192.168.1.1', hostname: 'gateway.local', latency: 1 },
                { ip: target, hostname: this._findHost(target)?.hostname || target, latency: 1 }
            ];
        } else {
            // Generic route
            route.push({ ip: '198.32.124.1', hostname: 'peering.internet', latency: 30 });
            route.push({ timeout: true });
            route.push({ ip: target, hostname: target, latency: 50 });
        }

        return route;
    }

    // ═══════════════════════════════════════════════════════════════
    // DNS TOOLS
    // ═══════════════════════════════════════════════════════════════

    _dig(args) {
        const target = args.find(a => !a.startsWith('-') && !a.startsWith('@') && !a.startsWith('+'));
        const recordType = args.find(a => ['A', 'AAAA', 'MX', 'NS', 'TXT', 'SOA', 'CNAME', 'PTR'].includes(a.toUpperCase())) || 'A';
        const server = args.find(a => a.startsWith('@'))?.substring(1) || '192.168.1.1';

        if (!target) {
            return `<span class="error">Usage: dig [@server] domain [type]</span>`;
        }

        const queryTime = Math.floor(Math.random() * 20 + 10);

        return `; <<>> DiG 9.18.1 <<>> ${target} ${recordType}
;; global options: +cmd
;; Got answer:
;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: ${Math.floor(Math.random() * 65535)}
;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; QUESTION SECTION:
;${target}.                  IN      ${recordType}

;; ANSWER SECTION:
${target}.           300     IN      ${recordType}      ${this._getDnsAnswer(target, recordType)}

;; Query time: ${queryTime} msec
;; SERVER: ${server}#53(${server})
;; WHEN: ${new Date().toUTCString()}
;; MSG SIZE  rcvd: 68`;
    }

    _nslookup(args) {
        const target = args[0];

        if (!target) {
            return `Usage: nslookup hostname [server]`;
        }

        return `Server:         192.168.1.1
Address:        192.168.1.1#53

Non-authoritative answer:
Name:   ${target}
Address: ${this._getDnsAnswer(target, 'A')}`;
    }

    _host(args) {
        const target = args[0];
        if (!target) return 'Usage: host hostname';

        return `${target} has address ${this._getDnsAnswer(target, 'A')}`;
    }

    _getDnsAnswer(domain, type) {
        // Simulated DNS responses
        const records = {
            'google.com': { A: '142.250.80.46', MX: '10 smtp.google.com' },
            'cloudflare.com': { A: '104.16.132.229', MX: '10 mail.cloudflare.com' },
            'example.com': { A: '93.184.216.34', MX: '10 mail.example.com' },
            'web01.internal': { A: '192.168.1.10' },
            'db01.internal': { A: '192.168.1.20' },
            'gateway.local': { A: '192.168.1.1' }
        };

        const record = records[domain];
        if (record && record[type]) return record[type];

        // Generate plausible IP for unknown domains
        return `${Math.floor(Math.random() * 200 + 50)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
    }

    // ═══════════════════════════════════════════════════════════════
    // OTHER NETWORK TOOLS
    // ═══════════════════════════════════════════════════════════════

    _whois(args) {
        const target = args[0];
        if (!target) return 'Usage: whois domain/IP';

        return `% WHOIS query for ${target}

Domain Name: ${target.toUpperCase()}
Registry Domain ID: D123456789-EXAMPLE
Registrar WHOIS Server: whois.example.com
Registrar URL: http://www.example.com
Updated Date: 2024-01-15T00:00:00Z
Creation Date: 2020-01-01T00:00:00Z
Registry Expiry Date: 2025-01-01T00:00:00Z
Registrar: Example Registrar, Inc.
Registrar IANA ID: 12345
Domain Status: clientTransferProhibited

Name Server: NS1.EXAMPLE.COM
Name Server: NS2.EXAMPLE.COM

<span class="muted">>>> NOTICE: This is simulated WHOIS data for educational purposes <<<</span>`;
    }

    _tcpdump(args) {
        const iface = args.includes('-i') ? args[args.indexOf('-i') + 1] : 'eth0';
        const count = args.includes('-c') ? parseInt(args[args.indexOf('-c') + 1]) : 5;

        let output = `<span class="tcpdump-header">tcpdump: listening on ${iface}, link-type EN10MB (Ethernet), capture size 262144 bytes</span>\n`;

        const now = new Date();
        for (let i = 0; i < Math.min(count, 10); i++) {
            const time = new Date(now.getTime() + i * 50).toTimeString().split(' ')[0];
            const srcIP = '192.168.1.100';
            const dstIP = ['192.168.1.1', '8.8.8.8', '192.168.1.10'][Math.floor(Math.random() * 3)];
            const srcPort = Math.floor(Math.random() * 50000 + 10000);
            const dstPort = [80, 443, 53, 22][Math.floor(Math.random() * 4)];
            const flags = ['S', '.', 'P', 'F', 'R'][Math.floor(Math.random() * 5)];
            const seq = Math.floor(Math.random() * 1000000);
            const len = Math.floor(Math.random() * 1400);

            output += `${time}.${String(i).padStart(6, '0')} IP ${srcIP}.${srcPort} > ${dstIP}.${dstPort}: Flags [${flags}], seq ${seq}, len ${len}\n`;
        }

        output += `\n<span class="tcpdump-footer">${count} packets captured</span>`;
        return output;
    }

    _arp(args) {
        let output = 'Address                  HWtype  HWaddress           Flags Mask            Iface\n';

        Object.values(this.network).forEach(host => {
            if (host.ip && host.mac && host.ip.startsWith('192.168.1.')) {
                output += `${host.ip.padEnd(24)} ether   ${host.mac}   C                     eth0\n`;
            }
        });

        return output;
    }

    _route(args) {
        return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         192.168.1.1     0.0.0.0         UG    100    0        0 eth0
192.168.1.0     0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
    }

    _netcat(args) {
        const target = args.find(a => !a.startsWith('-'));
        const port = args.find((a, i) => !a.startsWith('-') && i > args.indexOf(target));

        if (!target || !port) {
            return 'Usage: nc [-vlz] hostname port';
        }

        const host = this._findHost(target);
        if (!host) {
            return `nc: connect to ${target} port ${port} (tcp) failed: No route to host`;
        }

        const service = host.services?.find(s => s.port === parseInt(port));
        if (!service || service.state !== 'open') {
            return `nc: connect to ${target} port ${port} (tcp) failed: Connection refused`;
        }

        if (service.banner) {
            return `<span class="success">Connection to ${target} ${port} port [tcp/${service.service}] succeeded!</span>\n${service.banner}`;
        }

        return `<span class="success">Connection to ${target} ${port} port [tcp/${service.service}] succeeded!</span>`;
    }

    _mtr(args) {
        const target = args.find(a => !a.startsWith('-')) || '8.8.8.8';
        const route = this._buildRoute(target);

        let output = `<span class="mtr-header">My traceroute  [v0.95]</span>
Host: student-workstation                      Loss%   Snt   Last   Avg  Best  Wrst StDev
`;

        route.forEach((hop, i) => {
            if (hop.timeout) {
                output += `${(i+1).toString().padStart(2)}.|-- ???                          100.0    10    0.0   0.0   0.0   0.0   0.0\n`;
            } else {
                const loss = Math.random() < 0.05 ? (Math.random() * 5).toFixed(1) : '0.0';
                output += `${(i+1).toString().padStart(2)}.|-- ${hop.hostname.padEnd(30)} ${loss.padStart(5)}    10  ${hop.latency.toFixed(1).padStart(5)}  ${hop.latency.toFixed(1).padStart(5)}  ${(hop.latency - 1).toFixed(1).padStart(5)}  ${(hop.latency + 3).toFixed(1).padStart(5)}   ${(Math.random() * 2).toFixed(1).padStart(4)}\n`;
            }
        });

        return output;
    }

    // ═══════════════════════════════════════════════════════════════
    // OBJECTIVES & PROGRESS TRACKING
    // ═══════════════════════════════════════════════════════════════

    _completeObjective(objectiveId) {
        const objective = this.objectives.find(o => o.id === objectiveId && !o.completed);
        if (objective) {
            objective.completed = true;
            this.completedObjectives.push(objectiveId);

            if (this.securityConfig.onObjectiveComplete) {
                this.securityConfig.onObjectiveComplete(objective);
            }

            // Show notification
            this._showObjectiveNotification(objective);
        }
    }

    _checkObjectives(cmd, args, output) {
        // Auto-detect objective completions based on commands and output

        // Finding suspicious host
        if (cmd === 'nmap' && output.includes('192.168.1.50')) {
            this._completeObjective('find_suspicious');
        }

        // Identifying web server
        if (cmd === 'nmap' && output.includes('192.168.1.10') && output.includes('http')) {
            this._completeObjective('identify_webserver');
        }

        // Version detection
        if (cmd === 'nmap' && args.includes('-sV') && output.includes('VERSION')) {
            this._completeObjective('version_detect');
        }

        // Service enumeration
        if (cmd === 'nmap' && output.includes('PORT') && output.includes('SERVICE')) {
            this._completeObjective('enum_services');
        }

        // C2 identification
        if (cmd === 'nmap' && (output.includes('4444') || output.includes('8080')) && output.includes('192.168.1.50')) {
            this._completeObjective('identify_c2');
        }
    }

    _showObjectiveNotification(objective) {
        const notification = document.createElement('div');
        notification.className = 'objective-notification';
        notification.innerHTML = `
            <span class="objective-icon">✓</span>
            <span class="objective-text">Objective Complete: ${objective.text}</span>
        `;
        notification.style.cssText = `
            position: absolute;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #10b981, #059669);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            font-family: 'Segoe UI', sans-serif;
            font-size: 14px;
            z-index: 10000;
            animation: slideIn 0.5s ease, fadeOut 0.5s ease 3s forwards;
            box-shadow: 0 10px 30px rgba(16, 185, 129, 0.3);
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 4000);
    }

    // ═══════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════

    getObjectives() {
        return this.objectives;
    }

    getCompletedObjectives() {
        return this.completedObjectives;
    }

    getProgress() {
        if (this.objectives.length === 0) return 100;
        return Math.round((this.completedObjectives.length / this.objectives.length) * 100);
    }

    getScanHistory() {
        return this.scanHistory;
    }

    // Add custom hosts to the network
    addHost(name, config) {
        this.network[name] = config;
    }

    // Set custom scenario objectives
    setObjectives(objectives) {
        this.objectives = objectives;
        this.completedObjectives = [];
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecurityTerminal;
}
