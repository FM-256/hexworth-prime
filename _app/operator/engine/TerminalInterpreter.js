/* ================================================================
   TerminalInterpreter.js -- Shared Terminal Command Dispatcher
   ================================================================
   Config-driven terminal UI and command routing for all terminal-mode
   Operator missions. Replaces ~150 lines of duplicated inline JS
   in each of the 16 terminal missions.

   Usage:
     <script src="engine/OperatorEngine.js"></script>
     <script src="engine/AgentBridge.js"></script>
     <script src="engine/TerminalInterpreter.js"></script>
     <script src="configs/recon-01.config.js"></script>
     <script>
       var engine = OperatorEngine.init(RECON_01_CONFIG);
       var agent  = AgentBridge.create(engine);
       TerminalInterpreter.init(RECON_01_CONFIG, engine, agent);
     </script>

   Config fields used:
     config.promptText      -- terminal prompt string (e.g. "kali@op:~$ ")
     config.promptLabel     -- terminal bar label (e.g. "TERMINAL", "COMMAND PROMPT")
     config.promptColor     -- prompt color override (default: #39ff14)
     config.briefing[]      -- array of briefing lines shown at mission start
     config.terminalCommands -- { name: { help, syntax?, handler(args, ctx) } }
     config.customState     -- { key: initialValue } for mission-specific state
     config.notFoundMsg     -- custom "command not found" message (per-domain flavor)
     config.newConcept      -- { label, description } shown in briefing if present

   Depends on: OperatorEngine.js, AgentBridge.js
   No build step. No modules. Raw script tag.
   ================================================================ */

(function() {
    'use strict';

    // ----------------------------------------------------------------
    //  DIRECTION HELPERS
    // ----------------------------------------------------------------

    var DIR_MAP = {
        'north': [0, -1], 'n': [0, -1],
        'south': [0,  1], 's': [0,  1],
        'east':  [1,  0], 'e': [1,  0],
        'west':  [-1, 0], 'w': [-1, 0]
    };

    var DIR_NAMES = { n: 'north', s: 'south', e: 'east', w: 'west' };

    function padRight(s, n) { while (s.length < n) s += ' '; return s; }

    // ----------------------------------------------------------------
    //  TERMINAL UI BUILDER
    // ----------------------------------------------------------------

    function buildTerminalUI(config) {
        var editorPanel = document.querySelector('.editor-panel');
        if (!editorPanel) return null;

        /* Grab the engine's output console BEFORE clearing the panel.
           In terminal mode, the engine creates .term-output inside .editor-panel.
           We need to preserve it so engine.printLine() still works. */
        var existingOutput = editorPanel.querySelector('.term-output') ||
                             editorPanel.querySelector('.output-console');

        editorPanel.innerHTML = '';

        // Terminal bar
        var termBar = document.createElement('div');
        termBar.style.cssText = 'padding:7px 14px;background:#0c0e14;border-bottom:1px solid rgba(57,255,20,0.1);display:flex;align-items:center;gap:6px;flex-shrink:0;';
        for (var i = 0; i < 3; i++) {
            var dot = document.createElement('div');
            dot.style.cssText = 'width:7px;height:7px;border-radius:50%;background:rgba(57,255,20,0.3);';
            termBar.appendChild(dot);
        }
        var barLabel = document.createElement('span');
        barLabel.style.cssText = 'font-size:0.55rem;color:rgba(57,255,20,0.35);letter-spacing:0.1em;margin-left:6px;';
        barLabel.textContent = config.promptLabel || 'TERMINAL';
        termBar.appendChild(barLabel);
        editorPanel.appendChild(termBar);

        /* Re-attach the engine's output console (preserved before innerHTML clear).
           This keeps the engine's _els.outputConsole reference valid so
           engine.printLine() continues to work after TerminalInterpreter takes over. */
        var outputConsole;
        if (existingOutput) {
            outputConsole = existingOutput;
            editorPanel.appendChild(outputConsole);
        } else {
            outputConsole = document.createElement('div');
            outputConsole.className = 'output-console term-output';
            outputConsole.id = 'term-output';
            editorPanel.appendChild(outputConsole);
        }

        // Input row
        var inputRow = document.createElement('div');
        inputRow.className = 'term-input-row';
        var promptSpan = document.createElement('span');
        promptSpan.className = 'term-prompt-text';
        promptSpan.textContent = config.promptText || '$ ';
        if (config.promptColor) promptSpan.style.color = config.promptColor;
        var termInput = document.createElement('input');
        termInput.type = 'text';
        termInput.className = 'term-input';
        termInput.autocomplete = 'off';
        termInput.spellcheck = false;
        if (config.promptColor) termInput.style.color = config.promptColor;
        inputRow.appendChild(promptSpan);
        inputRow.appendChild(termInput);
        editorPanel.appendChild(inputRow);

        // Click-to-focus
        editorPanel.addEventListener('click', function(e) {
            if (e.target.tagName !== 'INPUT') termInput.focus();
        });

        return { input: termInput, output: outputConsole };
    }

    // ----------------------------------------------------------------
    //  STANDARD COMMANDS (shared by all terminal missions)
    // ----------------------------------------------------------------

    function cmdScan(args, ctx) {
        var engine = ctx.engine, state = ctx.state, config = ctx.config;
        var col = state.position.col, row = state.position.row;
        var cellType = config.grid.cells[row][col];

        engine.printLine('Scanning area...', 'system');
        engine.printLine('', 'system');

        if (cellType !== 'empty' && cellType !== 'wall' && config.nodes[cellType]) {
            var cur = config.nodes[cellType];
            engine.printLine('Current: ' + cur.label + (cur.ip ? ' (' + cur.ip + ')' : ''), 'heading');
            if (cur.desc) engine.printLine(cur.desc, 'info');
        } else {
            engine.printLine('Current: Clear path (no node)', 'heading');
        }

        engine.printLine('', 'system');
        engine.printLine('Adjacent:', 'heading');

        var dirs = [
            { name: 'North', dc: 0, dr: -1 },
            { name: 'South', dc: 0, dr: 1 },
            { name: 'East',  dc: 1, dr: 0 },
            { name: 'West',  dc: -1, dr: 0 }
        ];

        for (var i = 0; i < dirs.length; i++) {
            var d = dirs[i];
            var nc = col + d.dc, nr = row + d.dr;
            if (nc < 0 || nc >= config.grid.cols || nr < 0 || nr >= config.grid.rows) {
                engine.printLine('  ' + d.name + ': [network edge]', 'system');
                continue;
            }
            var type = config.grid.cells[nr][nc];
            if (type === 'wall') {
                engine.printLine('  ' + d.name + ': [blocked]', 'system');
                continue;
            }
            var key = nc + ',' + nr;
            if (!state.visibility[key] || state.visibility[key] === 'hidden') {
                state.visibility[key] = 'revealed';
            }
            // Mark scanned to disarm traps
            state.scannedCells[key] = true;
            if (type === 'empty') {
                engine.printLine('  ' + d.name + ': Clear path', 'info');
            } else if (config.nodes[type]) {
                var info = config.nodes[type];
                engine.printLine('  ' + d.name + ': ' + info.label + (info.ip ? ' (' + info.ip + ')' : ''), 'node-info');
            }
        }

        engine.updateGrid();
        engine.saveState();
    }

    function cmdMove(args, ctx) {
        var engine = ctx.engine, state = ctx.state, config = ctx.config;

        if (!args.length) {
            engine.printLine('Usage: move <direction> (north/south/east/west or n/s/e/w)', 'error');
            return;
        }

        var dir = args[0].toLowerCase();
        var vec = DIR_MAP[dir];
        if (!vec) {
            engine.printLine('Unknown direction: ' + args[0], 'error');
            return;
        }

        var nc = state.position.col + vec[0];
        var nr = state.position.row + vec[1];

        if (nc < 0 || nc >= config.grid.cols || nr < 0 || nr >= config.grid.rows) {
            engine.printLine('Edge of network. Cannot move ' + dir + '.', 'error');
            return;
        }

        var cellType = config.grid.cells[nr][nc];
        if (cellType === 'wall') {
            engine.printLine('Blocked. No traversable path ' + dir + '.', 'error');
            return;
        }

        // Check gates
        if (config.gates && config.gates[cellType]) {
            var gate = config.gates[cellType];
            if (!state[gate.flag]) {
                engine.printLine('ACCESS DENIED -- ' + (config.nodes[cellType] ? config.nodes[cellType].label : cellType) + ' requires ' + gate.requires + ' to bypass.', 'error');
                return;
            }
        }

        // Check integrity
        if (state.integrity <= 0) {
            engine.printLine('SYSTEM COMPROMISED -- integrity at zero. Mission failed.', 'error');
            return;
        }

        // Trap check
        var destKey = nc + ',' + nr;
        if (config.traps && config.traps.indexOf(cellType) !== -1 && !state.scannedCells[destKey]) {
            state.integrity--;
            engine.printLine('[!] TRAP -- ' + (config.nodes[cellType] ? config.nodes[cellType].label : cellType) + ' triggered! Integrity -1', 'error');
            engine.updateIntegrityUI();
        }

        // Move
        state.position = { col: nc, row: nr };
        state.visibility[destKey] = 'visited';
        if (cellType !== 'empty' && config.nodes[cellType]) {
            state.nodesDiscovered.add(cellType);
        }
        engine.revealAdjacent(nc, nr);

        var dirName = DIR_NAMES[dir] || dir;
        if (cellType === 'empty') {
            engine.printLine('Moving ' + dirName + '... Clear path.', 'system');
        } else if (config.nodes[cellType]) {
            var nodeInfo = config.nodes[cellType];
            engine.printLine('Moving ' + dirName + '... ' + nodeInfo.label + (nodeInfo.ip ? ' (' + nodeInfo.ip + ')' : ''), 'success');
            if (nodeInfo.desc) engine.printLine(nodeInfo.desc, 'info');
        }

        engine.checkObjectives();
        engine.updateGrid();
        engine.saveState();
    }

    function cmdPing(args, ctx) {
        var engine = ctx.engine, config = ctx.config;

        if (!args.length) {
            engine.printLine('Usage: ping <node name or IP>', 'error');
            return;
        }

        var target = args.join(' ');
        var node = engine.resolveNode(target);

        if (!node) {
            if (target.match(/^[\d.]+$/)) {
                engine.printLine('Request timed out.', 'error');
            } else {
                engine.printLine('Ping request could not find host ' + target + '.', 'error');
            }
            return;
        }

        if (node.visibility === 'hidden') {
            engine.printLine('Request timed out. No route to host.', 'error');
            return;
        }

        var info = node.info;
        var ms = (Math.random() * 5 + 0.5).toFixed(0);
        engine.printLine('', 'system');
        engine.printLine('Pinging ' + info.ip + ' with 32 bytes of data:', 'system');
        engine.printLine('Reply from ' + info.ip + ': bytes=32 time=' + ms + 'ms TTL=128', 'node-info');
        engine.printLine('Reply from ' + info.ip + ': bytes=32 time=' + (parseInt(ms) + 1) + 'ms TTL=128', 'node-info');
        engine.printLine('', 'system');
        engine.printLine('Ping statistics for ' + info.ip + ':', 'info');
        engine.printLine('    Packets: Sent = 2, Received = 2, Lost = 0 (0% loss)', 'info');
    }

    function cmdNmap(args, ctx) {
        var engine = ctx.engine, state = ctx.state, config = ctx.config;

        if (!args.length) {
            engine.printLine('Usage: nmap <node name or IP>', 'error');
            return;
        }

        var target = args.join(' ');
        var node = engine.resolveNode(target);

        if (!node) {
            engine.printLine('Failed to resolve host: ' + target, 'error');
            return;
        }
        if (node.visibility === 'hidden') {
            engine.printLine('Host seems down. Scan the area first.', 'error');
            return;
        }

        var info = node.info;
        engine.printLine('', 'system');
        engine.printLine('Starting Nmap 7.94 scan on ' + info.ip + '...', 'system');
        engine.printLine('', 'system');
        engine.printLine('Nmap scan report for ' + info.label + ' (' + info.ip + ')', 'heading');
        engine.printLine('Host is up (0.003s latency)', 'info');
        if (info.os) engine.printLine('OS: ' + info.os, 'node-info');
        engine.printLine('', 'system');

        if (info.ports && info.ports.length) {
            engine.printLine('PORT         STATE    SERVICE', 'heading');
            for (var p = 0; p < info.ports.length; p++) {
                var parts = info.ports[p].split('/');
                engine.printLine(padRight(parts[0] + '/tcp', 13) + 'open     ' + parts[1].toLowerCase(), 'node-info');
            }
        }

        state.nmapTargets.add(node.type);

        // Trigger gate if this node type has a gate requiring 'nmap'
        if (config.gates && config.gates[node.type] && config.gates[node.type].requires === 'nmap') {
            var gate = config.gates[node.type];
            if (!state[gate.flag]) {
                engine.printLine('', 'system');
                engine.printLine('[!] VULNERABILITY DETECTED', 'warning');
                if (info.vuln) engine.printLine(info.vuln + (info.vulnDesc ? ': ' + info.vulnDesc : ''), 'warning');
                engine.printLine('', 'system');
                engine.printLine('Defenses neutralized. Path is now clear.', 'success');
                state[gate.flag] = true;
            }
        }

        engine.printLine('', 'system');
        engine.checkObjectives();
        engine.updateGrid();
        engine.saveState();
    }

    function cmdStatus(args, ctx) {
        var engine = ctx.engine, state = ctx.state, config = ctx.config;
        var cellType = config.grid.cells[state.position.row][state.position.col];
        var posLabel = (cellType !== 'empty' && cellType !== 'wall' && config.nodes[cellType])
            ? config.nodes[cellType].label : 'Clear';

        engine.printLine('', 'system');
        engine.printLine('\u2550\u2550\u2550 STATUS \u2550\u2550\u2550', 'heading');
        engine.printLine('Position: (' + state.position.col + ',' + state.position.row + ') -- ' + posLabel, 'info');
        engine.printLine('Nodes discovered: ' + state.nodesDiscovered.size, 'info');
        engine.printLine('Commands used: ' + state.agentCmdCount, 'info');
        engine.printLine('Integrity: ' + state.integrity + '/' + (config.integrity || 3), 'info');

        // Print custom status fields if defined
        if (config.statusFields) {
            engine.printLine('', 'system');
            for (var i = 0; i < config.statusFields.length; i++) {
                var sf = config.statusFields[i];
                var val = state[sf.key];
                var label = sf.label;
                var display = val ? (sf.trueText || 'COMPLETE') : (sf.falseText || 'PENDING');
                engine.printLine(label + ': ' + display, val ? 'success' : 'warning');
            }
        }

        engine.printLine('', 'system');
        engine.printLine('Objectives:', 'heading');
        for (var j = 0; j < config.objectives.length; j++) {
            var obj = config.objectives[j];
            var done = state.objectives[j];
            engine.printLine((done ? ' [X] ' : ' [ ] ') + obj.label, done ? 'success' : 'system');
        }
    }

    function cmdHelp(args, ctx, allCommands) {
        var engine = ctx.engine;
        engine.printLine('', 'system');
        engine.printLine('\u2550\u2550\u2550 COMMAND REFERENCE \u2550\u2550\u2550', 'heading');

        // Standard commands first
        var standardNames = ['scan', 'move', 'ping', 'nmap', 'status', 'help', 'clear'];
        var domainNames = [];

        for (var name in allCommands) {
            if (standardNames.indexOf(name) === -1 && name !== 'clear' && name !== 'help' && name !== 'status') {
                domainNames.push(name);
            }
        }

        // Domain commands (mission-specific) listed first — they're the interesting ones
        if (domainNames.length > 0) {
            for (var d = 0; d < domainNames.length; d++) {
                var dc = allCommands[domainNames[d]];
                var syntax = dc.syntax || domainNames[d];
                engine.printLine('  ' + padRight(syntax, 20) + (dc.help || ''), 'info');
            }
            engine.printLine('', 'system');
        }

        // Standard commands
        engine.printLine('  ' + padRight('scan', 20) + 'Survey area, reveal adjacent nodes', 'info');
        engine.printLine('  ' + padRight('move <dir>', 20) + 'Move agent (north/south/east/west or n/s/e/w)', 'info');
        engine.printLine('  ' + padRight('ping <node>', 20) + 'Ping a node by name or IP', 'info');
        engine.printLine('  ' + padRight('nmap <node>', 20) + 'Deep scan -- ports, OS, vulnerabilities', 'info');
        engine.printLine('  ' + padRight('status', 20) + 'Show position and objectives', 'info');
        engine.printLine('  ' + padRight('help', 20) + 'Show this reference', 'info');
        engine.printLine('  ' + padRight('clear', 20) + 'Clear terminal output', 'info');
        engine.printLine('', 'system');
        engine.printLine('Nodes: reference by name, abbreviation, or IP.', 'system');
    }

    // ----------------------------------------------------------------
    //  BRIEFING PRINTER
    // ----------------------------------------------------------------

    function printBriefing(config, engine) {
        var title = config.missionTitle || (config.id || 'MISSION');
        var subtitle = config.title || '';
        var headerText = title.toUpperCase() + (subtitle ? ' -- ' + subtitle.toUpperCase() : '');

        // Calculate box width
        var boxW = Math.max(headerText.length + 4, 42);

        // Box drawing
        engine.printLine('\u2554' + repeat('\u2550', boxW) + '\u2557', 'heading');
        engine.printLine('\u2551  ' + headerText + repeat(' ', boxW - headerText.length - 2) + '\u2551', 'heading');
        engine.printLine('\u2560' + repeat('\u2550', boxW) + '\u2563', 'heading');

        // New concept callout
        if (config.newConcept) {
            engine.printLine('\u2551  NEW: ' + config.newConcept.label + repeat(' ', boxW - config.newConcept.label.length - 8) + '\u2551', 'heading');
            engine.printLine('\u2560' + repeat('\u2550', boxW) + '\u2563', 'heading');
        }

        // Briefing lines
        if (config.briefing) {
            for (var b = 0; b < config.briefing.length; b++) {
                var line = config.briefing[b];
                var pad = Math.max(0, boxW - line.length - 2);
                engine.printLine('\u2551  ' + line + repeat(' ', pad) + '\u2551', 'heading');
            }
        }

        engine.printLine('\u255A' + repeat('\u2550', boxW) + '\u255D', 'heading');
        engine.printLine('', 'system');

        // Startup messages
        var cellType = config.grid.cells[config.grid.start.row || 0][config.grid.start.col || 0];
        var startNode = config.nodes[cellType];
        var startLabel = startNode ? startNode.label + (startNode.ip ? ' (' + startNode.ip + ')' : '') : 'START';
        engine.printLine('[SYS] Agent online at ' + startLabel, 'success');
        engine.printLine('[SYS] Type "help" for command reference', 'info');
        engine.printLine('[SYS] Type "scan" to survey the area', 'info');
        engine.printLine('', 'system');
    }

    function repeat(ch, n) { var s = ''; for (var i = 0; i < n; i++) s += ch; return s; }

    // ----------------------------------------------------------------
    //  COMMAND DISPATCHER
    // ----------------------------------------------------------------

    function executeCommand(input, commands, ctx, outputConsole) {
        var state = ctx.state;
        var engine = ctx.engine;
        var config = ctx.config;

        state.agentCmdCount++;
        engine.printLine((config.promptText || '$ ') + input, 'prompt-echo');

        var parts = input.trim().split(/\s+/);
        var cmd = parts[0].toLowerCase();
        var args = parts.slice(1);

        // Multi-word command matching (e.g., "show ip route")
        // Try progressively longer prefixes: "show ip route" → "show ip" → "show"
        var fullInput = parts.join(' ').toLowerCase();
        for (var wordCount = parts.length; wordCount > 1; wordCount--) {
            var multiCmd = parts.slice(0, wordCount).join(' ').toLowerCase();
            if (commands[multiCmd]) {
                cmd = multiCmd;
                args = parts.slice(wordCount);
                break;
            }
        }

        // Built-in commands that don't need config registration
        if (cmd === 'clear') {
            if (outputConsole) outputConsole.innerHTML = '';
            return;
        }

        // Lookup in registered commands
        if (commands[cmd]) {
            var cmdDef = commands[cmd];
            if (typeof cmdDef === 'function') {
                cmdDef(args, ctx);
            } else if (cmdDef.handler) {
                cmdDef.handler(args, ctx);
            }
            return;
        }

        // Command not found — domain-flavored error message
        var notFound = config.notFoundMsg || 'Unknown command: {cmd}. Type "help" for available commands.';
        var lines = notFound.replace(/\{cmd\}/g, cmd).split('\n');
        for (var i = 0; i < lines.length; i++) {
            engine.printLine(lines[i], i === 0 ? 'error' : 'system');
        }
    }

    // ----------------------------------------------------------------
    //  INIT (entry point)
    // ----------------------------------------------------------------

    function init(config, engine, agent) {
        var state = engine.getState();
        var ctx = { engine: engine, state: state, config: config, agent: agent };

        // Initialize custom state fields from config
        if (config.customState) {
            for (var key in config.customState) {
                if (state[key] === undefined) {
                    state[key] = config.customState[key];
                }
            }
        }

        // Build terminal UI
        var ui = buildTerminalUI(config);
        if (!ui) {
            console.error('[TerminalInterpreter] No .editor-panel found');
            return null;
        }

        // Register all commands
        var commands = {};

        // Standard commands (available in every terminal mission)
        commands['scan']   = { help: 'Survey area, reveal adjacent nodes', handler: cmdScan };
        commands['move']   = { help: 'Move agent (north/south/east/west or n/s/e/w)', syntax: 'move <dir>', handler: cmdMove };
        commands['ping']   = { help: 'Ping a node by name or IP', syntax: 'ping <node>', handler: cmdPing };
        commands['nmap']   = { help: 'Deep scan -- ports, OS, vulnerabilities', syntax: 'nmap <node>', handler: cmdNmap };
        commands['status'] = { help: 'Show position and objectives', handler: cmdStatus };
        commands['help']   = {
            help: 'Show this reference',
            handler: function(args, c) { cmdHelp(args, c, commands); }
        };

        // Domain-specific commands from config
        if (config.terminalCommands) {
            for (var name in config.terminalCommands) {
                commands[name] = config.terminalCommands[name];
            }
        }

        // Wire input
        var history = [];
        var histIdx = -1;

        ui.input.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                var cmd = this.value.trim();
                if (cmd) {
                    history.push(cmd);
                    histIdx = history.length;
                    executeCommand(cmd, commands, ctx, ui.output);
                }
                this.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (histIdx > 0) { histIdx--; this.value = history[histIdx]; }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (histIdx < history.length - 1) { histIdx++; this.value = history[histIdx]; }
                else { histIdx = history.length; this.value = ''; }
            } else if (e.key === 'Tab') {
                e.preventDefault();
                // Tab completion: match against registered command names
                var partial = this.value.toLowerCase().trim();
                if (partial) {
                    var matches = [];
                    for (var cname in commands) {
                        if (cname.indexOf(partial) === 0) matches.push(cname);
                    }
                    if (matches.length === 1) {
                        this.value = matches[0] + ' ';
                    } else if (matches.length > 1) {
                        engine.printLine((config.promptText || '$ ') + partial, 'prompt-echo');
                        engine.printLine(matches.join('  '), 'system');
                    }
                }
            }
        });

        // Print mission briefing
        printBriefing(config, engine);

        // Focus input
        ui.input.focus();

        // Return API for mission-specific extensions
        return {
            addCommand: function(name, def) { commands[name] = def; },
            removeCommand: function(name) { delete commands[name]; },
            execute: function(input) { executeCommand(input, commands, ctx, ui.output); },
            getContext: function() { return ctx; },
            focus: function() { ui.input.focus(); }
        };
    }

    // ----------------------------------------------------------------
    //  PUBLIC API
    // ----------------------------------------------------------------

    window.TerminalInterpreter = {
        init: init
    };

})();
