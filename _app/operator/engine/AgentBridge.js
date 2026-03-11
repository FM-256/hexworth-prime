/* ================================================================
   AgentBridge.js -- Agent API for Operator Missions
   ================================================================
   Extracted from inline mission code. Config-driven: gates, traps,
   and node info all come from the mission config object.

   Usage:
     <script src="engine/OperatorEngine.js"></script>
     <script src="engine/AgentBridge.js"></script>
     <script>
       var engine = OperatorEngine.init(config);
       var agent  = AgentBridge.create(engine);
     </script>

   The bridge object returned by create() is what the Python
   interpreter sees as the `agent` variable. All methods are async
   for visual pacing (await engine.delay()).

   OP-6: Agent Tier Framework
   --------------------------
   Mission configs can declare `agent: { tier: N }` (1-5) to gate
   which bridge methods are available. Default is Tier 5 (all methods)
   for backwards compatibility. Locked methods print ACCESS DENIED.

   Depends on: OperatorEngine.js (loaded first)
   No build step. No modules. Raw script tag.
   ================================================================ */

(function() {
    'use strict';

    // ----------------------------------------------------------------
    //  TIER DEFINITIONS (OP-6)
    // ----------------------------------------------------------------

    var TIER_METHODS = {
        1: ['move', 'scan', 'status'],
        2: ['move', 'scan', 'status', 'sweep', 'ping'],
        3: ['move', 'scan', 'status', 'sweep', 'ping', 'nmap', 'exploit', 'spoof', 'decrypt', 'patch'],
        4: null,   // all methods (future: class-based agent support)
        5: null    // all methods (future: multi-agent)
    };

    // Reverse lookup: method name -> minimum tier required
    var METHOD_MIN_TIER = {};
    (function buildMinTierMap() {
        // Walk tiers 1-3 to find the first tier each method appears
        for (var t = 1; t <= 3; t++) {
            var methods = TIER_METHODS[t];
            for (var i = 0; i < methods.length; i++) {
                if (!METHOD_MIN_TIER[methods[i]]) {
                    METHOD_MIN_TIER[methods[i]] = t;
                }
            }
        }
    })();

    // All bridge method names (used for tier 4/5 "allow all")
    var ALL_METHOD_NAMES = ['move', 'scan', 'status', 'sweep', 'ping',
                            'nmap', 'exploit', 'spoof', 'decrypt', 'patch'];

    function getAllowedMethods(tier) {
        if (tier >= 4) return ALL_METHOD_NAMES.slice();
        return (TIER_METHODS[tier] || ALL_METHOD_NAMES).slice();
    }

    function getMinTier(methodName) {
        return METHOD_MIN_TIER[methodName] || 1;
    }

    // ----------------------------------------------------------------
    //  DIRECTION MAPS (shared by move, sweep)
    // ----------------------------------------------------------------

    var DIR_VECTORS = {
        'north': [0, -1],  'n': [0, -1],
        'south': [0, 1],   's': [0, 1],
        'east':  [1, 0],   'e': [1, 0],
        'west':  [-1, 0],  'w': [-1, 0]
    };

    var DIR_OFFSETS = {
        'north': { dc: 0, dr: -1 },  'n': { dc: 0, dr: -1 },
        'south': { dc: 0, dr: 1 },   's': { dc: 0, dr: 1 },
        'east':  { dc: 1, dr: 0 },   'e': { dc: 1, dr: 0 },
        'west':  { dc: -1, dr: 0 },  'w': { dc: -1, dr: 0 }
    };

    // Expand shorthand to full name
    var DIR_FULL = { n: 'north', s: 'south', e: 'east', w: 'west' };

    function expandDir(d) {
        return DIR_FULL[d] || d;
    }

    // ----------------------------------------------------------------
    //  HELPER: find gate config for a cell type
    // ----------------------------------------------------------------

    function findGateForCell(config, cellType) {
        var gates = config.gates || {};
        return gates[cellType] || null;
    }

    // ----------------------------------------------------------------
    //  HELPER: find gate that requires a specific action on a node
    // ----------------------------------------------------------------

    function findGateByAction(config, nodeType, requiredAction) {
        var gates = config.gates || {};
        var gate  = gates[nodeType];
        if (gate && gate.requires === requiredAction) return gate;
        return null;
    }

    // ----------------------------------------------------------------
    //  HELPER: resolve obstacle for exploit/spoof/nmap gate actions
    //  Returns { node, gate } or null. Prints errors on failure.
    // ----------------------------------------------------------------

    function resolveObstacle(engine, target, requiredAction, label) {
        var state  = engine.getState();
        var config = engine.getConfig();
        var node   = engine.resolveNode(String(target));

        if (!node) {
            engine.printLine('[' + label + '] Failed to resolve: ' + String(target), 'error');
            return null;
        }
        if (node.visibility === 'hidden') {
            engine.printLine('[' + label + '] Host unreachable. Scan area first.', 'error');
            return null;
        }

        // Find gate entry for this node type
        var gate = findGateByAction(config, node.type, requiredAction);
        if (!gate) {
            engine.printLine('[' + label + '] Wrong target. This tool does not work on ' + node.type + ' nodes.', 'error');
            return null;
        }

        // Already cleared?
        if (state[gate.flag]) {
            engine.printLine('[' + label + '] Already cleared.', 'system');
            return { node: node, gate: gate, cleared: true };
        }

        return { node: node, gate: gate, cleared: false };
    }

    // ----------------------------------------------------------------
    //  FACTORY: AgentBridge.create(engine)
    // ----------------------------------------------------------------

    function create(engine) {

        // Convenience refs (re-fetched each call for live state)
        function S()  { return engine.getState(); }
        function C()  { return engine.getConfig(); }

        // Increment command counter on every user-facing call
        function tick() {
            S().agentCmdCount++;
        }

        // Grid dimensions from config
        function cols() { return C().grid.cols; }
        function rows() { return C().grid.rows; }
        function cell(r, c) { return C().grid.cells[r][c]; }

        // Node info lookup
        function nodeInfo(type) {
            return C().nodes[type] || null;
        }

        // ============================================================
        //  1. move(dir)
        // ============================================================

        async function move(dir) {
            tick();
            var d = typeof dir === 'string' ? dir.toLowerCase() : '';

            if (!DIR_VECTORS[d]) {
                engine.printLine('[MOVE] Invalid direction: ' + String(dir), 'error');
                return false;
            }

            var state  = S();
            var config = C();

            // Integrity zero guard
            if (state.integrity <= 0) {
                engine.printLine('[MOVE] AGENT COMPROMISED. Integrity at zero. Reset mission to continue.', 'error');
                return false;
            }

            var delta   = DIR_VECTORS[d];
            var newCol  = state.position.col + delta[0];
            var newRow  = state.position.row + delta[1];
            var dirName = expandDir(d);

            // Bounds check
            if (newCol < 0 || newCol >= cols() || newRow < 0 || newRow >= rows()) {
                engine.printLine('[MOVE] Edge of network. Cannot move ' + dirName + '.', 'error');
                return false;
            }

            var cellType = cell(newRow, newCol);

            // Wall check
            if (cellType === 'wall') {
                engine.printLine('[MOVE] Blocked. No path ' + dirName + '.', 'error');
                return false;
            }

            // Gate check -- fully config-driven
            var gate = findGateForCell(config, cellType);
            if (gate && !state[gate.flag]) {
                var actionHint = 'agent.' + gate.requires + '("' + cellType + '")';
                engine.printLine('[MOVE] ' + cellType.toUpperCase() + ' blocking access. Run ' + actionHint + ' first.', 'warning');
                return false;
            }

            // Trap check -- unscanned trapped nodes trigger damage
            var destKey = newCol + ',' + newRow;
            var traps   = config.traps || [];

            if (traps.indexOf(cellType) !== -1 &&
                !state.scannedCells[destKey] &&
                state.visibility[destKey] !== 'visited') {

                state.integrity--;
                state.trapsTriggered++;

                var trapInfo = nodeInfo(cellType);
                var trapLabel = trapInfo ? trapInfo.label : cellType;

                engine.printLine('', 'system');
                engine.printLine('[TRAP] *** BOOBY TRAP TRIGGERED on ' + trapLabel + '! ***', 'error');
                engine.printLine('[TRAP] Agent bounced back. Integrity: ' + state.integrity + '/' + (config.integrity || 3), 'warning');

                if (state.integrity <= 0) {
                    engine.printLine('[TRAP] *** AGENT COMPROMISED *** Integrity depleted. Reset mission.', 'error');
                }

                // Visual feedback on the trapped cell
                var trapCell = document.querySelector('.grid-cell[data-col="' + newCol + '"][data-row="' + newRow + '"]');
                if (trapCell) {
                    trapCell.classList.add('trap-triggered');
                    setTimeout(function() { trapCell.classList.remove('trap-triggered'); }, 1200);
                }

                engine.updateIntegrityUI();
                engine.saveState();
                await engine.delay(150);
                return false;
            }

            // Safe passage through a previously scanned trap
            if (traps.indexOf(cellType) !== -1 && state.scannedCells[destKey]) {
                engine.printLine('[MOVE] Trap disarmed by prior scan. Safe passage.', 'success');
            }

            // Execute the move
            state.position = { col: newCol, row: newRow };
            state.visibility[newCol + ',' + newRow] = 'visited';

            if (cellType !== 'empty') {
                state.nodesDiscovered.add(cellType);
            }

            engine.revealAdjacent(newCol, newRow);

            var info  = nodeInfo(cellType);
            var label = (cellType !== 'empty' && info) ? info.label : 'Clear path';
            engine.printLine('[MOVE] Moving ' + dirName + '... ' + label, cellType !== 'empty' ? 'success' : 'system');

            engine.checkObjectives();
            engine.updateGrid();
            engine.saveState();
            await engine.delay(150);
            return true;
        }

        // ============================================================
        //  2. scan()
        // ============================================================

        async function scan() {
            tick();
            var state   = S();
            var config  = C();
            var col     = state.position.col;
            var row     = state.position.row;
            var results = [];
            var traps   = config.traps || [];

            var dirs = [
                { name: 'north', dc: 0,  dr: -1 },
                { name: 'south', dc: 0,  dr: 1  },
                { name: 'east',  dc: 1,  dr: 0  },
                { name: 'west',  dc: -1, dr: 0  }
            ];

            engine.printLine('[SCAN] Scanning area...', 'system');

            for (var i = 0; i < dirs.length; i++) {
                var d  = dirs[i];
                var nc = col + d.dc;
                var nr = row + d.dr;

                if (nc < 0 || nc >= cols() || nr < 0 || nr >= rows()) continue;
                var type = cell(nr, nc);
                if (type === 'wall') continue;

                var key = nc + ',' + nr;

                // Reveal if hidden
                if (!state.visibility[key] || state.visibility[key] === 'hidden') {
                    state.visibility[key] = 'revealed';
                }
                // Mark as scanned (disarms traps)
                state.scannedCells[key] = true;

                if (type !== 'empty') {
                    var info = nodeInfo(type);
                    if (info) {
                        results.push({ name: info.label, ip: info.ip, direction: d.name });
                        engine.printLine('[SCAN] Adjacent: ' + info.label + ' (' + d.name + ')', 'node-info');

                        if (traps.indexOf(type) !== -1) {
                            engine.printLine('[SCAN] *** TRAP DETECTED on ' + info.label + ' *** -- approach with caution', 'warning');
                        }
                    }
                }
            }

            if (results.length === 0) {
                engine.printLine('[SCAN] No nodes adjacent.', 'system');
            }

            engine.updateGrid();
            engine.saveState();
            await engine.delay(150);
            return results;
        }

        // ============================================================
        //  3. sweep(dir)
        // ============================================================

        async function sweep(dir) {
            tick();
            var d = typeof dir === 'string' ? dir.toLowerCase() : '';
            var dirName = expandDir(d);

            if (!DIR_OFFSETS[d]) {
                engine.printLine('[SWEEP] Invalid direction: ' + String(dir), 'error');
                engine.printLine('[SWEEP] Use: agent.sweep("north"), "south", "east", or "west"', 'info');
                return null;
            }

            var state  = S();
            var config = C();
            var delta  = DIR_OFFSETS[d];
            var nc     = state.position.col + delta.dc;
            var nr     = state.position.row + delta.dr;
            var traps  = config.traps || [];

            // Bounds check
            if (nc < 0 || nc >= cols() || nr < 0 || nr >= rows()) {
                engine.printLine('[SWEEP] Nothing ' + dirName + ' -- edge of network.', 'system');
                return null;
            }

            var type = cell(nr, nc);
            if (type === 'wall') {
                engine.printLine('[SWEEP] No path ' + dirName + ' -- blocked.', 'system');
                return null;
            }

            var key = nc + ',' + nr;
            state.scannedCells[key] = true;

            if (!state.visibility[key] || state.visibility[key] === 'hidden') {
                state.visibility[key] = 'revealed';
            }

            if (traps.indexOf(type) !== -1) {
                var info = nodeInfo(type);
                var trapLabel = info ? info.label : type;
                engine.printLine('[SWEEP] *** TRAP DETECTED ' + dirName + ' on ' + trapLabel + ' *** -- disarmed by scan', 'warning');

                // Visual indicator
                var warnCell = document.querySelector('.grid-cell[data-col="' + nc + '"][data-row="' + nr + '"]');
                if (warnCell) warnCell.classList.add('trap-warned');
            } else {
                var sweepInfo = nodeInfo(type);
                var sweepLabel = (type !== 'empty' && sweepInfo) ? sweepInfo.label : 'clear path';
                engine.printLine('[SWEEP] ' + dirName + ': ' + sweepLabel + ' -- no threats detected.', 'success');
            }

            engine.updateGrid();
            engine.saveState();
            await engine.delay(150);
            return { direction: dirName, clear: traps.indexOf(type) === -1 };
        }

        // ============================================================
        //  4. ping(target)
        // ============================================================

        async function ping(target) {
            tick();
            var node = engine.resolveNode(String(target));
            if (!node) {
                engine.printLine('[PING] Unknown host: ' + String(target), 'error');
                return false;
            }
            if (node.visibility === 'hidden') {
                engine.printLine('[PING] No route to host. Scan the area first.', 'error');
                return false;
            }

            var ms = (Math.random() * 5 + 0.5).toFixed(1);
            engine.printLine('[PING] ' + node.info.ip + ' (' + node.info.label + ') time=' + ms + 'ms', 'node-info');
            await engine.delay(150);
            return true;
        }

        // ============================================================
        //  5. nmap(target)
        // ============================================================

        async function nmap(target) {
            tick();
            var state  = S();
            var config = C();
            var node   = engine.resolveNode(String(target));

            if (!node) {
                engine.printLine('[NMAP] Failed to resolve: ' + String(target), 'error');
                return null;
            }
            if (node.visibility === 'hidden') {
                engine.printLine('[NMAP] Host down. Scan area first.', 'error');
                return null;
            }

            var info = node.info;
            engine.printLine('[NMAP] Scanning ' + info.label + ' (' + info.ip + ')...', 'system');
            engine.printLine('[NMAP] OS: ' + info.os, 'node-info');

            var ports = info.ports || [];
            for (var p = 0; p < ports.length; p++) {
                engine.printLine('[NMAP] PORT ' + ports[p] + '  open', 'node-info');
            }

            // Track nmap targets and mark cell as scanned
            state.nmapTargets.add(node.type);
            state.scannedCells[node.col + ',' + node.row] = true;

            var result = {
                label: info.label,
                ip:    info.ip,
                ports: ports,
                os:    info.os,
                vuln:  null
            };

            // Gate check: if this node has a gate that requires 'nmap',
            // set the flag and expose the vulnerability
            var gate = findGateByAction(config, node.type, 'nmap');
            if (gate && !state[gate.flag]) {
                var vuln = info.vuln || 'CVE-UNKNOWN';
                engine.printLine('[NMAP] VULNERABILITY DETECTED', 'warning');
                engine.printLine('[NMAP] ' + vuln + ': ' + (info.vulnDesc || 'Exploitable vulnerability found'), 'warning');
                engine.printLine('[NMAP] ' + info.label + ' neutralized. Path clear.', 'success');
                state[gate.flag] = true;
                result.vuln = vuln;
            }

            engine.checkObjectives();
            engine.updateGrid();
            engine.saveState();
            await engine.delay(150);
            return result;
        }

        // ============================================================
        //  6. exploit(target)
        // ============================================================

        async function exploit(target) {
            tick();
            var state = S();
            var res   = resolveObstacle(engine, target, 'exploit', 'EXPLOIT');
            if (!res) return null;
            if (res.cleared) return { status: 'already_cleared' };

            var node = res.node;
            var gate = res.gate;
            var info = node.info;
            var vuln = info.vuln || 'CVE-UNKNOWN';

            engine.printLine('[EXPLOIT] Targeting ' + info.label + ' (' + info.ip + ')...', 'system');
            engine.printLine('[EXPLOIT] ' + vuln + ': ' + (info.vulnDesc || 'Exploitable vulnerability'), 'warning');
            engine.printLine('[EXPLOIT] ' + info.label + ' silenced. Threat neutralized.', 'success');

            state[gate.flag] = true;

            engine.checkObjectives();
            engine.updateGrid();
            engine.saveState();
            await engine.delay(150);
            return { status: 'exploited', vuln: vuln };
        }

        // ============================================================
        //  7. spoof(target)
        // ============================================================

        async function spoof(target) {
            tick();
            var state = S();
            var res   = resolveObstacle(engine, target, 'spoof', 'SPOOF');
            if (!res) return null;
            if (res.cleared) return { status: 'already_cleared' };

            var node = res.node;
            var gate = res.gate;
            var info = node.info;
            var vuln = info.vuln || 'CVE-UNKNOWN';

            engine.printLine('[SPOOF] Analyzing ' + info.label + ' (' + info.ip + ')...', 'system');
            engine.printLine('[SPOOF] ' + vuln + ': ' + (info.vulnDesc || 'Spoofable vulnerability'), 'warning');
            engine.printLine('[SPOOF] ' + info.label + ' spoofed. Trap disarmed.', 'success');

            state[gate.flag] = true;

            engine.checkObjectives();
            engine.updateGrid();
            engine.saveState();
            await engine.delay(150);
            return { status: 'spoofed', vuln: vuln };
        }

        // ============================================================
        //  8. decrypt(target) -- decrypt ransomware-encrypted nodes
        // ============================================================

        async function decrypt(target) {
            tick();
            var state = S();
            var res   = resolveObstacle(engine, target, 'decrypt', 'DECRYPT');
            if (!res) return null;
            if (res.cleared) return { status: 'already_cleared' };

            var node = res.node;
            var gate = res.gate;
            var info = node.info;
            var vuln = info.vuln || 'CVE-UNKNOWN';

            engine.printLine('[DECRYPT] Decrypting ' + info.label + ' (' + info.ip + ')...', 'system');
            engine.printLine('[DECRYPT] ' + vuln + ': ' + (info.vulnDesc || 'Weak encryption key recovered'), 'warning');
            engine.printLine('[DECRYPT] Ransomware neutralized. Node recovered.', 'success');

            state[gate.flag] = true;

            engine.checkObjectives();
            engine.updateGrid();
            engine.saveState();
            await engine.delay(150);
            return { status: 'decrypted', vuln: vuln };
        }

        // ============================================================
        //  9. patch(target) -- patch corrupted firmware segments
        // ============================================================

        async function patch(target) {
            tick();
            var state = S();
            var res   = resolveObstacle(engine, target, 'patch', 'PATCH');
            if (!res) return null;
            if (res.cleared) return { status: 'already_cleared' };

            var node = res.node;
            var gate = res.gate;
            var info = node.info;
            var vuln = info.vuln || 'CVE-UNKNOWN';

            engine.printLine('[PATCH] Patching ' + info.label + ' (' + info.ip + ')...', 'system');
            engine.printLine('[PATCH] ' + vuln + ': ' + (info.vulnDesc || 'Firmware integrity bypass'), 'warning');
            engine.printLine('[PATCH] Firmware restored. Segment online.', 'success');

            state[gate.flag] = true;

            engine.checkObjectives();
            engine.updateGrid();
            engine.saveState();
            await engine.delay(150);
            return { status: 'patched', vuln: vuln };
        }

        // ============================================================
        //  10. status()
        // ============================================================

        async function status() {
            tick();
            var state  = S();
            var config = C();
            var pos    = cell(state.position.row, state.position.col);
            var info   = nodeInfo(pos);
            var posLabel = (pos !== 'empty' && pos !== 'wall' && info) ? info.label : 'EMPTY';
            var maxInt   = config.integrity || 3;

            engine.printLine('[STATUS] === AGENT STATUS ===', 'heading');
            engine.printLine('[STATUS] Position: ' + posLabel + ' (' + state.position.col + ',' + state.position.row + ')', 'info');
            engine.printLine('[STATUS] Nodes discovered: ' + state.nodesDiscovered.size, 'info');
            engine.printLine('[STATUS] Agent commands: ' + state.agentCmdCount, 'info');
            engine.printLine('[STATUS] Integrity: ' + state.integrity + '/' + maxInt,
                state.integrity === maxInt ? 'info' : state.integrity > 0 ? 'warning' : 'error');
            engine.printLine('[STATUS] Traps triggered: ' + state.trapsTriggered,
                state.trapsTriggered > 0 ? 'warning' : 'info');

            // Objectives summary
            var completedCount = 0;
            for (var i = 0; i < state.objectives.length; i++) {
                if (state.objectives[i]) completedCount++;
            }
            engine.printLine('[STATUS] Objectives: ' + completedCount + '/' + state.objectives.length,
                completedCount === state.objectives.length ? 'success' : 'info');

            // Individual objective lines
            var objectives = config.objectives || [];
            for (var j = 0; j < objectives.length; j++) {
                var shortLabel = objectives[j].label.split(' -- ')[0];
                var check = state.objectives[j] ? '[x]' : '[ ]';
                engine.printLine('[STATUS]   ' + check + ' ' + shortLabel,
                    state.objectives[j] ? 'success' : 'system');
            }

            await engine.delay(50);
            return {
                position:   posLabel,
                discovered: state.nodesDiscovered.size,
                objectives: completedCount + '/' + state.objectives.length
            };
        }

        // ============================================================
        //  BUILD THE BRIDGE OBJECT
        // ============================================================

        var bridge = {
            move:    move,
            scan:    scan,
            sweep:   sweep,
            ping:    ping,
            nmap:    nmap,
            exploit: exploit,
            spoof:   spoof,
            decrypt: decrypt,
            patch:   patch,
            status:  status
        };

        // --------------------------------------------------------
        //  Read-only properties via getters
        // --------------------------------------------------------

        // agent.position -- current cell type label (lowercase)
        Object.defineProperty(bridge, 'position', {
            get: function() {
                var state = S();
                var type  = cell(state.position.row, state.position.col);
                var info  = nodeInfo(type);
                return (type !== 'empty' && type !== 'wall' && info)
                    ? info.label.toLowerCase()
                    : 'empty';
            },
            enumerable: true
        });

        // agent.discovered -- array of discovered node type keys
        Object.defineProperty(bridge, 'discovered', {
            get: function() {
                return Array.from(S().nodesDiscovered);
            },
            enumerable: true
        });

        // --------------------------------------------------------
        //  OP-6: Agent Tier Framework
        // --------------------------------------------------------

        var agentConfig  = C().agent || {};
        var currentTier  = agentConfig.tier || 5;
        var allowedNames = getAllowedMethods(currentTier);

        // agent.tier -- read-only current tier number
        Object.defineProperty(bridge, 'tier', {
            get: function() { return currentTier; },
            enumerable: true
        });

        // agent.commands -- read-only array of available method names
        Object.defineProperty(bridge, 'commands', {
            get: function() { return allowedNames.slice(); },
            enumerable: true
        });

        // Gate locked methods: replace with ACCESS DENIED stub
        for (var m = 0; m < ALL_METHOD_NAMES.length; m++) {
            var methodName = ALL_METHOD_NAMES[m];
            if (allowedNames.indexOf(methodName) === -1) {
                (function(name) {
                    var requiredTier = getMinTier(name);
                    bridge[name] = function() {
                        engine.printLine(
                            '[ACCESS DENIED] ' + name + '() requires Tier ' +
                            requiredTier + ' clearance. Current: Tier ' + currentTier,
                            'error'
                        );
                        return undefined;
                    };
                })(methodName);
            }
        }

        // agent.help() -- formatted command list with tier badges
        bridge.help = function() {
            engine.printLine('[HELP] === AGENT COMMAND REFERENCE (Tier ' + currentTier + ') ===', 'heading');
            engine.printLine('[HELP] ----------------------------------------', 'system');
            for (var i = 0; i < ALL_METHOD_NAMES.length; i++) {
                var name = ALL_METHOD_NAMES[i];
                var minT = getMinTier(name);
                if (allowedNames.indexOf(name) !== -1) {
                    engine.printLine('[HELP]   agent.' + name + '()    [Tier ' + minT + ']', 'success');
                } else {
                    engine.printLine('[HELP]   agent.' + name + '()    [LOCKED -- Tier ' + minT + ']', 'error');
                }
            }
            engine.printLine('[HELP] ----------------------------------------', 'system');
            engine.printLine('[HELP] Available: ' + allowedNames.length + '/' + ALL_METHOD_NAMES.length + ' commands', 'info');
        };

        return bridge;
    }

    // ----------------------------------------------------------------
    //  Expose as global
    // ----------------------------------------------------------------

    window.AgentBridge = {
        create: create
    };

})();
