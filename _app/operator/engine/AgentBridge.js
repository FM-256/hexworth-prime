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
        2: ['move', 'scan', 'status', 'sweep', 'ping', 'jump', 'extinguish', 'fight', 'unlock'],
        3: ['move', 'scan', 'status', 'sweep', 'ping', 'jump', 'extinguish', 'fight', 'unlock',
            'nmap', 'exploit', 'spoof', 'decrypt', 'patch',
            'bridge', 'fireproof', 'terminate'],
        4: null,   // all methods
        5: null    // all methods
    };

    // Reverse lookup: method name -> minimum tier required
    var METHOD_MIN_TIER = {};
    (function buildMinTierMap() {
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
                            'jump', 'extinguish', 'fight', 'unlock',
                            'nmap', 'exploit', 'spoof', 'decrypt', 'patch',
                            'bridge', 'fireproof', 'terminate'];

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
        //  SHARED HELPER: Resolve direction to destination cell key
        //  Used by move() AND all countermeasure methods to ensure
        //  the same key is computed for the same cell. (Nancy blocker)
        // ============================================================

        /**
         * Given a direction string, compute the destination cell coordinates
         * and return { col, row, key, cellType, inBounds }.
         * Returns null if direction is invalid.
         */
        function _resolveDest(dir) {
            var d = typeof dir === 'string' ? dir.toLowerCase() : '';
            if (!DIR_VECTORS[d]) return null;

            var state  = S();
            var delta  = DIR_VECTORS[d];
            var nc     = state.position.col + delta[0];
            var nr     = state.position.row + delta[1];

            if (nc < 0 || nc >= cols() || nr < 0 || nr >= rows()) {
                return { col: nc, row: nr, key: nc + ',' + nr, cellType: null, inBounds: false };
            }

            return {
                col: nc,
                row: nr,
                key: nc + ',' + nr,
                cellType: cell(nr, nc),
                inBounds: true
            };
        }

        // ============================================================
        //  OBSTACLE HELPERS
        //  Shared logic for countermeasure methods (jump/extinguish/fight)
        //  and permanent tool methods (bridge/fireproof/terminate).
        // ============================================================

        /**
         * Generic obstacle clearing function. All countermeasure and
         * permanent tool methods route through this.
         *
         * @param {string} dir - Direction (north/south/east/west)
         * @param {string[]} validTypes - Cell types this action works on
         * @param {object} stateMap - State object to mark cleared (e.g., state.jumpedCells)
         * @param {string} actionLabel - Display label (e.g., 'JUMP', 'BRIDGE')
         * @param {string} successMsg - Message on success
         * @param {string} wrongTypeMsg - Message when used on wrong obstacle
         * @param {boolean} permanent - If true, also marks state.permanentCleared
         * @returns {boolean} true if obstacle cleared
         */
        async function _clearObstacle(dir, validTypes, stateMap, actionLabel, successMsg, wrongTypeMsg, permanent) {
            tick();
            var dest = _resolveDest(dir);
            var dirName = expandDir(typeof dir === 'string' ? dir.toLowerCase() : '');

            if (!dest) {
                engine.printLine('[' + actionLabel + '] Invalid direction: ' + String(dir), 'error');
                return false;
            }
            if (!dest.inBounds) {
                engine.printLine('[' + actionLabel + '] Nothing ' + dirName + ' — edge of grid.', 'error');
                return false;
            }
            if (dest.cellType === 'wall') {
                engine.printLine('[' + actionLabel + '] Blocked — wall ' + dirName + '.', 'error');
                return false;
            }

            /* Check if the target cell is a valid obstacle type for this action */
            if (validTypes.indexOf(dest.cellType) === -1) {
                engine.printLine('[' + actionLabel + '] ' + wrongTypeMsg, 'error');
                return false;
            }

            /* Check if already cleared */
            if (stateMap[dest.key]) {
                engine.printLine('[' + actionLabel + '] Already cleared.', 'system');
                return true;
            }

            /* Clear the obstacle */
            stateMap[dest.key] = true;
            if (permanent) {
                S().permanentCleared[dest.key] = true;
            }

            var info = nodeInfo(dest.cellType);
            var label = info ? info.label : dest.cellType;
            engine.printLine('[' + actionLabel + '] ' + successMsg + ' (' + label + ', ' + dirName + ')', 'success');

            engine.updateGrid();
            engine.saveState();
            await engine.delay(150);
            return true;
        }

        /**
         * Read persistent inventory from localStorage.
         * Returns array of tool names (e.g., ['bridge', 'fireproof', 'terminate']).
         */
        function _getInventory() {
            try {
                var raw = localStorage.getItem('hexworth_operator_inventory');
                if (!raw) return [];
                var data = JSON.parse(raw);
                return data.tools || [];
            } catch (e) { return []; }
        }

        /**
         * Check if a permanent tool is in the persistent inventory.
         */
        function _hasTool(toolName) {
            return _getInventory().indexOf(toolName) !== -1;
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

            // ── OBSTACLE CHECKS (Metroidvania v2) ──────────────────
            // Each obstacle type blocks movement unless the matching
            // countermeasure or permanent tool has been used on this cell.
            // Permanent tools (from inventory) auto-clear on contact.
            // Per-transit tools require explicit action before moving.

            var obstacles = config.obstacles || {};

            // Hole check — requires jump() or permanent bridge tool
            if (obstacles.holes && obstacles.holes.indexOf(cellType) !== -1) {
                if (state.permanentCleared && state.permanentCleared[destKey]) {
                    engine.printLine('[MOVE] Bridged gap. Safe passage.', 'success');
                } else if (state.jumpedCells && state.jumpedCells[destKey]) {
                    engine.printLine('[MOVE] Jumping over gap...', 'success');
                    delete state.jumpedCells[destKey]; /* per-transit: consumed on use */
                } else {
                    state.integrity--;
                    var holeInfo = nodeInfo(cellType);
                    engine.printLine('', 'system');
                    engine.printLine('[HAZARD] *** FELL INTO HOLE (' + (holeInfo ? holeInfo.label : cellType) + ')! ***', 'error');
                    engine.printLine('[HAZARD] Use agent.jump(dir) first, or agent.bridge(dir) if you have it.', 'warning');
                    engine.printLine('[HAZARD] Integrity: ' + state.integrity + '/' + (config.integrity || 3), 'warning');
                    if (state.integrity <= 0) {
                        engine.printLine('[HAZARD] *** AGENT COMPROMISED *** Reset mission.', 'error');
                    }
                    engine.updateIntegrityUI();
                    engine.saveState();
                    await engine.delay(150);
                    return false;
                }
            }

            // Fire check — requires extinguish() or permanent fireproof tool
            if (obstacles.fires && obstacles.fires.indexOf(cellType) !== -1) {
                if (state.permanentCleared && state.permanentCleared[destKey]) {
                    engine.printLine('[MOVE] Fireproofed path. Safe passage.', 'success');
                } else if (state.extinguishedCells && state.extinguishedCells[destKey]) {
                    engine.printLine('[MOVE] Fire extinguished. Passing through...', 'success');
                    delete state.extinguishedCells[destKey]; /* per-transit: consumed */
                } else {
                    state.integrity--;
                    var fireInfo = nodeInfo(cellType);
                    engine.printLine('', 'system');
                    engine.printLine('[HAZARD] *** BURNED BY FIRE (' + (fireInfo ? fireInfo.label : cellType) + ')! ***', 'error');
                    engine.printLine('[HAZARD] Use agent.extinguish(dir) first, or agent.fireproof(dir) if you have it.', 'warning');
                    engine.printLine('[HAZARD] Integrity: ' + state.integrity + '/' + (config.integrity || 3), 'warning');
                    if (state.integrity <= 0) {
                        engine.printLine('[HAZARD] *** AGENT COMPROMISED *** Reset mission.', 'error');
                    }
                    engine.updateIntegrityUI();
                    engine.saveState();
                    await engine.delay(150);
                    return false;
                }
            }

            // Enemy check — requires fight() or permanent terminate tool
            if (obstacles.enemies && obstacles.enemies.indexOf(cellType) !== -1) {
                if (state.permanentCleared && state.permanentCleared[destKey]) {
                    engine.printLine('[MOVE] Threat eliminated. Safe passage.', 'success');
                } else if (state.defeatedEnemies && state.defeatedEnemies[destKey]) {
                    engine.printLine('[MOVE] Enemy defeated. Passing through...', 'success');
                    delete state.defeatedEnemies[destKey]; /* per-transit: consumed */
                } else {
                    state.integrity--;
                    var enemyInfo = nodeInfo(cellType);
                    engine.printLine('', 'system');
                    engine.printLine('[HAZARD] *** ATTACKED BY ' + (enemyInfo ? enemyInfo.label : 'ENEMY') + '! ***', 'error');
                    engine.printLine('[HAZARD] Use agent.fight(dir) first, or agent.terminate(dir) if you have it.', 'warning');
                    engine.printLine('[HAZARD] Integrity: ' + state.integrity + '/' + (config.integrity || 3), 'warning');
                    if (state.integrity <= 0) {
                        engine.printLine('[HAZARD] *** AGENT COMPROMISED *** Reset mission.', 'error');
                    }
                    engine.updateIntegrityUI();
                    engine.saveState();
                    await engine.delay(150);
                    return false;
                }
            }

            // Locked door check — requires key in state.items
            if (cellType && cellType.indexOf('locked') === 0) {
                if (state.unlockedDoors && state.unlockedDoors[destKey]) {
                    engine.printLine('[MOVE] Door unlocked. Passing through.', 'success');
                } else {
                    var keyCount = 0;
                    for (var ki = 0; ki < (state.items || []).length; ki++) {
                        if (state.items[ki] === 'key') keyCount++;
                    }
                    engine.printLine('', 'system');
                    engine.printLine('[LOCKED] Door is locked. ' + (keyCount > 0 ? 'Use agent.unlock(dir) with your key.' : 'Find a key first.'), 'warning');
                    return false;
                }
            }

            // Execute the move
            state.position = { col: newCol, row: newRow };
            state.visibility[newCol + ',' + newRow] = 'visited';

            if (cellType !== 'empty') {
                state.nodesDiscovered.add(cellType);
            }

            engine.revealAdjacent(newCol, newRow);

            // Auto-pickup: key nodes are collected when the agent enters the cell
            if (cellType && cellType.indexOf('key') === 0) {
                if (!state.items) state.items = [];
                state.items.push('key');
                var keyInfo = nodeInfo(cellType);
                engine.printLine('[PICKUP] Collected KEY' + (keyInfo ? ' (' + keyInfo.label + ')' : '') + '! Keys: ' + state.items.filter(function(i){return i==='key';}).length, 'success');
            }

            // Auto-pickup: tool nodes add permanent tools to inventory
            if (cellType && cellType.indexOf('tool-') === 0) {
                var toolName = cellType.replace('tool-', '');
                try {
                    var inv = JSON.parse(localStorage.getItem('hexworth_operator_inventory') || '{"tools":[]}');
                    if (inv.tools.indexOf(toolName) === -1) {
                        inv.tools.push(toolName);
                        if (!inv.earnedIn) inv.earnedIn = {};
                        inv.earnedIn[toolName] = C().id;
                        localStorage.setItem('hexworth_operator_inventory', JSON.stringify(inv));
                        engine.printLine('', 'system');
                        engine.printLine('[TOOL ACQUIRED] *** ' + toolName.toUpperCase() + ' *** added to permanent inventory!', 'heading');
                        engine.printLine('[TOOL ACQUIRED] This tool persists across all levels.', 'success');
                    }
                } catch (e) { /* localStorage error */ }
            }

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
        //  OBSTACLE COUNTERMEASURES (per-transit — consumed on use)
        //  These clear an obstacle for ONE crossing. The obstacle
        //  remains on the grid for return trips.
        // ============================================================

        /** Jump over a hole in the adjacent cell. Per-transit: consumed when you cross. */
        async function jump(dir) {
            var config = C();
            var obstacles = config.obstacles || {};
            var holes = obstacles.holes || [];
            return _clearObstacle(dir, holes, S().jumpedCells, 'JUMP',
                'Cleared gap', 'Cannot jump here — no hole in that direction.', false);
        }

        /** Extinguish fire in the adjacent cell. Per-transit: fire returns after crossing. */
        async function extinguish(dir) {
            var config = C();
            var obstacles = config.obstacles || {};
            var fires = obstacles.fires || [];
            return _clearObstacle(dir, fires, S().extinguishedCells, 'EXTINGUISH',
                'Fire suppressed', 'Cannot extinguish here — no fire in that direction.', false);
        }

        /** Fight an enemy in the adjacent cell. Per-transit: enemy returns after crossing. */
        async function fight(dir) {
            var config = C();
            var obstacles = config.obstacles || {};
            var enemies = obstacles.enemies || [];
            return _clearObstacle(dir, enemies, S().defeatedEnemies, 'FIGHT',
                'Enemy defeated', 'Cannot fight here — no enemy in that direction.', false);
        }

        /** Unlock a locked door in the adjacent cell. Consumes one key from state.items. */
        async function unlock(dir) {
            tick();
            var dest = _resolveDest(dir);
            var dirName = expandDir(typeof dir === 'string' ? dir.toLowerCase() : '');

            if (!dest) {
                engine.printLine('[UNLOCK] Invalid direction: ' + String(dir), 'error');
                return false;
            }
            if (!dest.inBounds || dest.cellType === 'wall') {
                engine.printLine('[UNLOCK] Nothing to unlock ' + dirName + '.', 'error');
                return false;
            }

            /* Check target is a locked door */
            if (!dest.cellType || dest.cellType.indexOf('locked') !== 0) {
                engine.printLine('[UNLOCK] No locked door ' + dirName + '.', 'error');
                return false;
            }

            /* Check already unlocked */
            var state = S();
            if (state.unlockedDoors && state.unlockedDoors[dest.key]) {
                engine.printLine('[UNLOCK] Already unlocked.', 'system');
                return true;
            }

            /* Check for key in inventory */
            if (!state.items) state.items = [];
            var keyIdx = state.items.indexOf('key');
            if (keyIdx === -1) {
                engine.printLine('[UNLOCK] No key in inventory. Find a key first.', 'error');
                return false;
            }

            /* Consume key and unlock door */
            state.items.splice(keyIdx, 1);  /* remove one key */
            if (!state.unlockedDoors) state.unlockedDoors = {};
            state.unlockedDoors[dest.key] = true;

            var doorInfo = nodeInfo(dest.cellType);
            engine.printLine('[UNLOCK] Door opened! (' + (doorInfo ? doorInfo.label : dest.cellType) + ', ' + dirName + '). Key consumed. Keys remaining: ' + state.items.filter(function(i){return i==='key';}).length, 'success');

            engine.updateGrid();
            engine.saveState();
            await engine.delay(150);
            return true;
        }

        // ============================================================
        //  PERMANENT TOOLS (require tool in persistent inventory)
        //  These clear an obstacle PERMANENTLY. The obstacle is removed
        //  from the grid for all future visits to this level.
        // ============================================================

        /** Bridge a hole permanently. Requires 'bridge' tool in inventory.
         *  Named bridge_tool internally to avoid collision with the bridge object. */
        async function bridge_tool(dir) {
            if (!_hasTool('bridge')) {
                engine.printLine('[BRIDGE] Tool not in inventory. Find the bridge tool first.', 'error');
                return false;
            }
            var config = C();
            var obstacles = config.obstacles || {};
            var holes = obstacles.holes || [];
            return _clearObstacle(dir, holes, S().permanentCleared, 'BRIDGE',
                'Gap filled permanently', 'Cannot bridge here — no hole in that direction.', true);
        }

        /** Fireproof a path permanently. Requires 'fireproof' tool in inventory. */
        async function fireproof(dir) {
            if (!_hasTool('fireproof')) {
                engine.printLine('[FIREPROOF] Tool not in inventory. Find the fireproof tool first.', 'error');
                return false;
            }
            var config = C();
            var obstacles = config.obstacles || {};
            var fires = obstacles.fires || [];
            return _clearObstacle(dir, fires, S().permanentCleared, 'FIREPROOF',
                'Path fireproofed permanently', 'Cannot fireproof here — no fire in that direction.', true);
        }

        /** Terminate an enemy permanently. Requires 'terminate' tool in inventory. */
        async function terminate(dir) {
            if (!_hasTool('terminate')) {
                engine.printLine('[TERMINATE] Tool not in inventory. Find the terminate tool first.', 'error');
                return false;
            }
            var config = C();
            var obstacles = config.obstacles || {};
            var enemies = obstacles.enemies || [];
            return _clearObstacle(dir, enemies, S().permanentCleared, 'TERMINATE',
                'Threat eliminated permanently', 'Cannot terminate here — no enemy in that direction.', true);
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
            move:       move,
            scan:       scan,
            sweep:      sweep,
            ping:       ping,
            nmap:       nmap,
            exploit:    exploit,
            spoof:      spoof,
            decrypt:    decrypt,
            patch:      patch,
            status:     status,
            /* Obstacle countermeasures (per-transit) */
            jump:       jump,
            extinguish: extinguish,
            fight:      fight,
            unlock:     unlock,
            /* Permanent tools (require inventory) */
            bridge:     bridge_tool,   /* renamed to avoid collision with bridge object */
            fireproof:  fireproof,
            terminate:  terminate
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

        // agent.items -- current level items (keys, etc.)
        // Students use: if 'key' in agent.items
        Object.defineProperty(bridge, 'items', {
            get: function() {
                return (S().items || []).slice();  // return copy
            },
            enumerable: true
        });

        // agent.tools -- persistent inventory (array of tool names)
        // Students use: if 'bridge' in agent.tools
        // Or: gun = agent.terminate (first-class function assignment)
        Object.defineProperty(bridge, 'tools', {
            get: function() {
                return _getInventory();
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
