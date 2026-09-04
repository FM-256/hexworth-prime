/* ================================================================
   OperatorEngine.js — Shared Operator Mission Engine
   ================================================================
   Extracted from 20 inline mission files. Config-driven: each
   mission passes a config object to OperatorEngine.init(config).

   Provides: grid rendering, fog of war, output console, node
   resolution, objectives, integrity meter, save/load, mission
   complete overlay, and editor UI (Python or terminal mode).

   Usage:
     <script src="engine/OperatorEngine.js"></script>
     <script>
       var config = { id: 'python-04', ... };
       var engine = OperatorEngine.init(config);
     </script>

   No build step. No modules. Raw script tag.
   ================================================================ */

(function() {
    'use strict';

    // ----------------------------------------------------------------
    //  Internal refs — set during init()
    // ----------------------------------------------------------------
    var _state   = null;   // current game state
    var _config  = null;   // mission config
    var _els     = {};     // cached DOM elements
    var _callbacks = {};   // editor callbacks (onRun, onStop, onReset)

    // ----------------------------------------------------------------
    //  1. STATE FACTORY
    // ----------------------------------------------------------------

    function createState(config) {
        var objectives = [];
        for (var i = 0; i < config.objectives.length; i++) {
            objectives.push(false);
        }

        // Build gate flags dynamically from config
        var gateFlags = {};
        if (config.gates) {
            var gateKeys = Object.keys(config.gates);
            for (var g = 0; g < gateKeys.length; g++) {
                gateFlags[config.gates[gateKeys[g]].flag] = false;
            }
        }

        var state = {
            position:        { col: config.grid.start.col, row: config.grid.start.row },
            visibility:      {},
            objectives:      objectives,
            nodesDiscovered: new Set(),
            nmapTargets:     new Set(),
            agentCmdCount:   0,
            startTime:       Date.now(),
            completed:       false,
            integrity:       config.integrity || 3,
            trapsTriggered:  0,
            scannedCells:    {},
            /* Metroidvania v2: obstacle clearing state */
            jumpedCells:        {},   // per-transit: holes cleared by jump()
            extinguishedCells:  {},   // per-transit: fires cleared by extinguish()
            defeatedEnemies:    {},   // per-transit: enemies cleared by fight()
            permanentCleared:   {},   // permanent: cells cleared by bridge/fireproof/terminate
            items:              []    // collectible items (keys, etc.)
        };

        // Merge gate flags onto state
        var flagKeys = Object.keys(gateFlags);
        for (var f = 0; f < flagKeys.length; f++) {
            state[flagKeys[f]] = false;
        }

        // Mark starting cell as visited, discover the start node
        var startKey = config.grid.start.col + ',' + config.grid.start.row;
        state.visibility[startKey] = 'visited';
        var startType = config.grid.cells[config.grid.start.row][config.grid.start.col];
        if (startType !== 'empty' && startType !== 'wall') {
            state.nodesDiscovered.add(startType);
        }

        return state;
    }

    // ----------------------------------------------------------------
    //  2. GRID RENDERING
    //  The grid is a CSS Grid of cells. Each cell has 3 child elements:
    //    .cell-icon  — node abbreviation (GTW, RTR, FWL) or '?' when fogged
    //    .cell-label — full node label (GATEWAY, ROUTER) when visited
    //    .cell-agent — player position indicator (hidden unless current)
    //  Visual states: wall, current, vis-hidden, vis-revealed, vis-visited,
    //    empty-vis, bypassed (gate cleared), scanned, trap-warned
    // ----------------------------------------------------------------

    /** Build the initial grid DOM (empty cells). Called once during init. */
    function buildGrid(config, container) {
        container.innerHTML = '';
        container.style.gridTemplateColumns = 'repeat(' + config.grid.cols + ', 1fr)';
        container.style.gridTemplateRows    = 'repeat(' + config.grid.rows + ', 1fr)';

        for (var r = 0; r < config.grid.rows; r++) {
            for (var c = 0; c < config.grid.cols; c++) {
                var cell = document.createElement('div');
                cell.className = 'grid-cell';
                cell.dataset.col  = c;
                cell.dataset.row  = r;
                cell.dataset.type = config.grid.cells[r][c];

                var icon = document.createElement('div');
                icon.className = 'cell-icon';

                var label = document.createElement('div');
                label.className = 'cell-label';

                var agent = document.createElement('div');
                agent.className = 'cell-agent';
                agent.style.display = 'none';

                cell.appendChild(icon);
                cell.appendChild(label);
                cell.appendChild(agent);
                container.appendChild(cell);
            }
        }
    }

    /** Refresh all grid cell visuals based on current state (position, visibility, gates, traps). */
    function updateGrid(state, config) {
        var rows  = config.grid.rows;
        var cols  = config.grid.cols;
        var cells = config.grid.cells;
        var nodes = config.nodes;
        var traps = config.traps || [];
        var gates = config.gates || {};

        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                var cell = _els.gridContainer.querySelector(
                    '.grid-cell[data-col="' + c + '"][data-row="' + r + '"]'
                );
                if (!cell) continue;

                var type      = cells[r][c];
                var key       = c + ',' + r;
                var vis       = state.visibility[key] || 'hidden';
                var isCurrent = (state.position.col === c && state.position.row === r);

                // Reset classes
                cell.className    = 'grid-cell';
                cell.dataset.col  = c;
                cell.dataset.row  = r;
                cell.dataset.type = type;

                // Visibility class
                if (type === 'wall') {
                    cell.classList.add('wall');
                } else if (isCurrent) {
                    cell.classList.add('current');
                } else {
                    cell.classList.add('vis-' + vis);
                    if (type === 'empty' && vis !== 'hidden') {
                        cell.classList.add('empty-vis');
                    }
                }

                // Gate bypassed state
                var gateKeys = Object.keys(gates);
                for (var gi = 0; gi < gateKeys.length; gi++) {
                    var gateId   = gateKeys[gi];
                    var gateCfg  = gates[gateId];
                    if (type === gateId && state[gateCfg.flag]) {
                        cell.classList.add('bypassed');
                    }
                }

                // Trap / scan visual states
                if (state.scannedCells[key]) cell.classList.add('scanned');
                if (traps.indexOf(type) !== -1 && state.scannedCells[key]) {
                    cell.classList.add('trap-warned');
                }

                // Cell content
                var iconEl  = cell.querySelector('.cell-icon');
                var labelEl = cell.querySelector('.cell-label');
                var agentEl = cell.querySelector('.cell-agent');

                if (type === 'wall') {
                    iconEl.textContent  = '';
                    labelEl.textContent = '';
                } else if (vis === 'hidden' && !isCurrent) {
                    iconEl.textContent  = '?';
                    labelEl.textContent = '';
                } else if (type === 'empty') {
                    iconEl.textContent  = '\u00B7';
                    labelEl.textContent = '';
                } else {
                    var info = nodes[type];
                    if (info) {
                        iconEl.textContent  = info.abbr;
                        labelEl.textContent = (vis === 'visited' || isCurrent) ? info.label : '';
                    } else {
                        iconEl.textContent  = '?';
                        labelEl.textContent = '';
                    }
                }

                agentEl.style.display = isCurrent ? 'block' : 'none';
            }
        }
    }

    // ----------------------------------------------------------------
    //  3. FOG OF WAR
    //  Adjacent cells (N/S/E/W) are revealed when the player moves.
    //  'hidden' → 'revealed' (visible but not visited) on first exposure.
    //  'revealed' → 'visited' when the player actually enters the cell.
    //  Walls are never revealed. Animation: 'just-revealed' class for 500ms.
    // ----------------------------------------------------------------

    /** Reveal the 4 cardinal neighbors of (col, row). Skips walls and already-visible cells. */
    function revealAdjacent(state, config, col, row) {
        var dirs  = [[0, -1], [0, 1], [1, 0], [-1, 0]];
        var rows  = config.grid.rows;
        var cols  = config.grid.cols;
        var cells = config.grid.cells;

        for (var d = 0; d < dirs.length; d++) {
            var nc = col + dirs[d][0];
            var nr = row + dirs[d][1];
            if (nc < 0 || nc >= cols || nr < 0 || nr >= rows) continue;
            if (cells[nr][nc] === 'wall') continue;

            var key = nc + ',' + nr;
            if (!state.visibility[key] || state.visibility[key] === 'hidden') {
                state.visibility[key] = 'revealed';
                // Trigger reveal animation
                var cellEl = _els.gridContainer.querySelector(
                    '.grid-cell[data-col="' + nc + '"][data-row="' + nr + '"]'
                );
                if (cellEl) {
                    cellEl.classList.add('just-revealed');
                    (function(el) {
                        setTimeout(function() { el.classList.remove('just-revealed'); }, 500);
                    })(cellEl);
                }
            }
        }
    }

    // ----------------------------------------------------------------
    //  4. OUTPUT CONSOLE
    //  Scrolling text output visible below the code editor (Python mode)
    //  or as the main terminal output (terminal mode). Capped at 200 lines
    //  to prevent DOM bloat on long-running missions.
    // ----------------------------------------------------------------

    /** Append a line to the output console. Types: system, success, error, warning, info, heading. */
    function printLine(text, type) {
        var output = _els.outputConsole;
        if (!output) return;
        var line = document.createElement('div');
        line.className = 'out-line out-' + (type || 'system');
        line.textContent = text;
        output.appendChild(line);
        // Cap at 200 lines
        while (output.children.length > 200) {
            output.removeChild(output.firstChild);
        }
        output.scrollTop = output.scrollHeight;
    }

    // ----------------------------------------------------------------
    //  5. NODE RESOLUTION
    //  Translates user input ('router', 'RTR', '10.0.0.2') into a grid
    //  node entry. Supports exact match (type, label, IP, abbreviation)
    //  and partial match (substring). If multiple matches, prompts user
    //  to be more specific. Returns { type, col, row, visibility, info }.
    // ----------------------------------------------------------------

    /** Fuzzy-resolve a target string to a grid node. Returns single match or null. */
    function resolveNode(target, config, state) {
        var q       = String(target).toLowerCase();
        var exact   = [];
        var partial = [];
        var rows    = config.grid.rows;
        var cols    = config.grid.cols;
        var cells   = config.grid.cells;
        var nodes   = config.nodes;

        for (var r = 0; r < rows; r++) {
            for (var c = 0; c < cols; c++) {
                var type = cells[r][c];
                if (type === 'empty' || type === 'wall') continue;
                var info = nodes[type];
                if (!info) continue;

                var vis   = state.visibility[c + ',' + r] || 'hidden';
                var entry = { type: type, col: c, row: r, visibility: vis, info: info };

                if (q === type ||
                    q === info.label.toLowerCase() ||
                    q === info.ip ||
                    q === info.abbr.toLowerCase()) {
                    exact.push(entry);
                } else if (type.indexOf(q) !== -1 ||
                           info.label.toLowerCase().indexOf(q) !== -1) {
                    partial.push(entry);
                }
            }
        }

        var results = exact.length > 0 ? exact : partial;

        if (results.length === 1) return results[0];
        if (results.length > 1) {
            printLine('Multiple matches. Be more specific:', 'warning');
            for (var m = 0; m < results.length; m++) {
                printLine('  ' + results[m].info.label + ' (' + results[m].info.ip + ')', 'info');
            }
            return null;
        }
        return null;
    }

    // ----------------------------------------------------------------
    //  6. OBJECTIVES SYSTEM
    //  Each mission defines objectives with check expressions evaluated
    //  against game state. Expressions support: Set.has(), .size comparisons,
    //  .indexOf(), boolean flags, numeric comparisons, AND (&&), OR (||).
    //  Example: 'nodesDiscovered.size >= 4 && firewallBypassed'
    //  All objectives complete → triggers SEC-4 server validation → completion.
    // ----------------------------------------------------------------

    /** Update the objectives bar UI — marks completed objectives with checkmarks. */
    function updateObjectivesUI(state, config) {
        for (var i = 0; i < config.objectives.length; i++) {
            var el = _els.objBar.querySelector('#obj-' + i);
            if (!el) continue;
            var check = el.querySelector('.obj-check');
            if (state.objectives[i]) {
                el.classList.add('complete');
                check.textContent = '\u2713';
            } else {
                el.classList.remove('complete');
                check.textContent = '';
            }
        }
    }

    /**
     * Evaluate an objective check expression against state.
     * Expressions like 'nodesDiscovered.size >= 4' or 'nmapTargets.has("router")'
     * are evaluated by mapping known property paths to actual state values.
     */
    function evaluateCheck(checkExpr, state) {
        // Build a safe evaluation context
        // Replace known state references with actual values
        try {
            var expr = checkExpr;

            // Handle Set.has() calls: nmapTargets.has("x") or nodesDiscovered.has("x")
            var hasMatch = expr.match(/^(\w+)\.has\(["']([^"']+)["']\)$/);
            if (hasMatch) {
                var setName = hasMatch[1];
                var value   = hasMatch[2];
                if (state[setName] && typeof state[setName].has === 'function') {
                    return state[setName].has(value);
                }
                return false;
            }

            // Handle Set.has() with OR: nmapTargets.has("a") || nmapTargets.has("b")
            var orParts = expr.split(/\s*\|\|\s*/);
            if (orParts.length > 1) {
                for (var op = 0; op < orParts.length; op++) {
                    if (evaluateCheck(orParts[op].trim(), state)) return true;
                }
                return false;
            }

            // Handle Set.has() with AND: flagA && flagB
            var andParts = expr.split(/\s*&&\s*/);
            if (andParts.length > 1) {
                for (var ap = 0; ap < andParts.length; ap++) {
                    if (!evaluateCheck(andParts[ap].trim(), state)) return false;
                }
                return true;
            }

            // Handle .indexOf() comparisons: flagsFound.indexOf("root-home") !== -1
            var idxMatch = expr.match(/^(\w+)\.indexOf\(["']([^"']+)["']\)\s*(>=|<=|===|==|>|<|!==|!=)\s*(-?\d+)$/);
            if (idxMatch) {
                var arrName  = idxMatch[1];
                var searchVal = idxMatch[2];
                var idxOp    = idxMatch[3];
                var idxNum   = parseInt(idxMatch[4], 10);
                var arr      = state[arrName];
                var idx      = (Array.isArray(arr)) ? arr.indexOf(searchVal) : -1;
                switch (idxOp) {
                    case '>=':  return idx >= idxNum;
                    case '<=':  return idx <= idxNum;
                    case '>':   return idx > idxNum;
                    case '<':   return idx < idxNum;
                    case '===': case '==': return idx === idxNum;
                    case '!==': case '!=': return idx !== idxNum;
                }
                return false;
            }

            // Handle .size comparisons: nodesDiscovered.size >= 4
            var sizeMatch = expr.match(/^(\w+)\.size\s*(>=|<=|===|==|>|<|!==|!=)\s*(\d+)$/);
            if (sizeMatch) {
                var setObj  = state[sizeMatch[1]];
                var op      = sizeMatch[2];
                var num     = parseInt(sizeMatch[3], 10);
                var sz      = (setObj && typeof setObj.size === 'number') ? setObj.size : 0;
                switch (op) {
                    case '>=':  return sz >= num;
                    case '<=':  return sz <= num;
                    case '>':   return sz > num;
                    case '<':   return sz < num;
                    case '===': case '==': return sz === num;
                    case '!==': case '!=': return sz !== num;
                }
                return false;
            }

            // Handle plain boolean flag: firewallBypassed, c2BeaconSilenced, etc.
            if (/^\w+$/.test(expr)) {
                return !!state[expr];
            }

            // Handle simple comparison: integrity >= 2, trapsTriggered === 0
            var cmpMatch = expr.match(/^(\w+)\s*(>=|<=|===|==|>|<|!==|!=)\s*(\d+)$/);
            if (cmpMatch) {
                var val = state[cmpMatch[1]];
                var cmpOp = cmpMatch[2];
                var cmpNum = parseInt(cmpMatch[3], 10);
                if (val === undefined) return false;
                switch (cmpOp) {
                    case '>=':  return val >= cmpNum;
                    case '<=':  return val <= cmpNum;
                    case '>':   return val > cmpNum;
                    case '<':   return val < cmpNum;
                    case '===': case '==': return val === cmpNum;
                    case '!==': case '!=': return val !== cmpNum;
                }
            }

            return false;
        } catch (e) {
            return false;
        }
    }

    /** Re-evaluate all objectives. Announces newly completed ones. Triggers completion if all done. */
    function checkObjectives(state, config) {
        var prev = state.objectives.slice();

        for (var i = 0; i < config.objectives.length; i++) {
            state.objectives[i] = evaluateCheck(config.objectives[i].check, state);
        }

        // Announce newly completed objectives
        for (var j = 0; j < state.objectives.length; j++) {
            if (state.objectives[j] && !prev[j]) {
                printLine('', 'system');
                printLine('[OBJECTIVE COMPLETE] ' + config.objectives[j].label, 'success');
            }
        }

        updateObjectivesUI(state, config);

        // All complete?
        if (!state.completed) {
            var allDone = true;
            for (var k = 0; k < state.objectives.length; k++) {
                if (!state.objectives[k]) { allDone = false; break; }
            }
            if (allDone) {
                // SEC-4: Server-side validation before awarding completion
                _validateCompletionViaServer(state, config);
            }
        }
    }

    // ----------------------------------------------------------------
    //  6b. SEC-4: SERVER-SIDE COMPLETION VALIDATION
    // ----------------------------------------------------------------

    /**
     * Build a serializable state snapshot for server validation.
     * Converts Sets to arrays, includes customState keys and built-in keys.
     */
    function buildStateSnapshot(state) {
        var snapshot = {};
        var keys = Object.keys(state);
        for (var i = 0; i < keys.length; i++) {
            var key = keys[i];
            var val = state[key];
            // Skip internal/non-serializable keys
            if (key === 'position' || key === 'visibility' || key === 'objectives' ||
                key === 'startTime' || key === 'completed' || key === 'scannedCells') {
                continue;
            }
            if (val && typeof val === 'object' && typeof val.has === 'function') {
                // Set -- convert to array
                snapshot[key] = Array.from(val);
            } else if (typeof val === 'boolean' || typeof val === 'number' || typeof val === 'string') {
                snapshot[key] = val;
            } else if (Array.isArray(val)) {
                snapshot[key] = val;
            }
        }
        return snapshot;
    }

    /**
     * Finalize mission completion -- called after server validation succeeds
     * or as offline fallback.
     */
    function finalizeCompletion(state, config, source) {
        state.completed = true;
        var elapsed = Math.floor((Date.now() - state.startTime) / 1000);

        printLine('', 'system');
        printLine('\u2550\u2550\u2550 ALL OBJECTIVES COMPLETE \u2550\u2550\u2550', 'heading');
        printLine('Mission ' + config.id.toUpperCase() + ' accomplished.', 'success');
        if (source === 'local') {
            printLine('[OFFLINE] Completion recorded locally. Server sync pending.', 'warning');
        }

        if (_els.headerStatus) {
            _els.headerStatus.textContent = 'COMPLETE';
            _els.headerStatus.style.color = '#39ff14';
        }

        // Save completion + clear save state
        saveCompletion(state, config);
        clearSaveState(config);

        // Tag completion source for later sync
        try {
            var compKey = getCompletionKey(config);
            var saved = localStorage.getItem(compKey);
            if (saved) {
                var data = JSON.parse(saved);
                data.source = source || 'server';
                localStorage.setItem(compKey, JSON.stringify(data));
            }
        } catch (e) { /* best effort */ }

        // Fire external hooks
        fireCompletionHooks(state, config, elapsed);

        setTimeout(function() {
            showMissionComplete(state, config, elapsed);
        }, 1500);
    }

    /**
     * SEC-4: Validate mission completion via server before awarding XP.
     * Pattern matches BoxEngine._validateFlagViaServer.
     *
     * If server validates: finalize completion (award XP, show overlay).
     * If server rejects: log warning, do NOT award completion.
     * If server unavailable (offline): allow local completion with source:'local' tag.
     */
    function _validateCompletionViaServer(state, config) {
        var hasAuth = typeof FirebaseAuth !== 'undefined' &&
                      typeof FirebaseAuth.isSignedIn === 'function' &&
                      FirebaseAuth.isSignedIn();

        if (!hasAuth) {
            // Offline / not signed in -- fallback to local completion
            finalizeCompletion(state, config, 'local');
            return;
        }

        var snapshot = buildStateSnapshot(state);

        printLine('', 'system');
        printLine('Validating mission completion...', 'system');

        FirebaseAuth.callFunction('validateMissionCompletion', {
            missionId: config.id,
            stateSnapshot: snapshot
        }).then(function(result) {
            var data = result.data || result;
            if (data.valid && data.missionComplete) {
                finalizeCompletion(state, config, 'server');
            } else {
                // Server rejected -- objectives may have been manipulated
                printLine('[VALIDATION FAILED] Server could not verify mission completion.', 'error');
                printLine('Objectives may not be legitimately completed.', 'warning');
                console.warn('[OPERATOR] Server rejected mission completion for ' + config.id, data);
                // Do NOT finalize -- no XP awarded
                state.completed = false;
            }
        }).catch(function(err) {
            // Server unavailable -- fallback to local completion
            console.warn('[OPERATOR] Server validation unavailable, falling back to local:', err.message);
            finalizeCompletion(state, config, 'local');
        });
    }

    // ----------------------------------------------------------------
    //  7. INTEGRITY SYSTEM
    //  Pip-based health meter. Each trap triggered or failed action costs
    //  1 pip. At 1 pip: 'critical' CSS class adds red warning. At 0 pips:
    //  mission could fail (not currently enforced — future feature).
    //  Default: 3 pips, configurable per mission via config.integrity.
    // ----------------------------------------------------------------

    /** Update the integrity pip display — active (green) vs lost (dark) pips. */
    function updateIntegrityUI(state, config) {
        var maxInt = config.integrity || 3;
        var meter  = _els.integrityMeter;
        if (!meter) return;

        // Update pips
        for (var i = 0; i < maxInt; i++) {
            var pip = meter.querySelector('#int-pip-' + i);
            if (!pip) continue;
            pip.className = 'integrity-pip ' + (i < state.integrity ? 'active' : 'lost');
        }

        // Critical state
        if (state.integrity <= 1) {
            meter.classList.add('critical');
        } else {
            meter.classList.remove('critical');
        }
    }

    // ----------------------------------------------------------------
    //  8. SAVE / LOAD
    //  Auto-saves state to localStorage after every agent command.
    //  On mission load, checks for saved state and offers resume.
    //  Sets must be serialized to arrays (JSON doesn't support Set).
    //  Gate flags are persisted alongside standard state fields.
    //  Completion stats saved separately from save-state (different key).
    // ----------------------------------------------------------------

    /** Get the localStorage key for in-progress save state. */
    function getSaveKey(config) {
        return 'hexworth_operator_' + config.id + '_save';
    }

    /** Get the localStorage key for completion stats (separate from save state). */
    function getCompletionKey(config) {
        if (config.completion && config.completion.storageKey) {
            return config.completion.storageKey;
        }
        return 'hexworth_operator_' + config.id;
    }

    /** Serialize current state to localStorage. Converts Sets to arrays for JSON compat. */
    function saveState(state, config) {
        try {
            // Collect gate flags
            var data = {
                position:        state.position,
                visibility:      state.visibility,
                objectives:      state.objectives,
                nodesDiscovered: Array.from(state.nodesDiscovered),
                nmapTargets:     Array.from(state.nmapTargets),
                agentCmdCount:   state.agentCmdCount,
                startTime:       state.startTime,
                integrity:       state.integrity,
                trapsTriggered:  state.trapsTriggered,
                scannedCells:       state.scannedCells,
                /* Metroidvania v2 obstacle state */
                jumpedCells:        state.jumpedCells || {},
                extinguishedCells:  state.extinguishedCells || {},
                defeatedEnemies:    state.defeatedEnemies || {},
                permanentCleared:   state.permanentCleared || {},
                items:              state.items || []
            };

            // Persist gate flags
            if (config.gates) {
                var gateKeys = Object.keys(config.gates);
                for (var g = 0; g < gateKeys.length; g++) {
                    var flag = config.gates[gateKeys[g]].flag;
                    data[flag] = state[flag];
                }
            }

            localStorage.setItem(getSaveKey(config), JSON.stringify(data));
        } catch (e) { /* localStorage unavailable */ }
    }

    /** Restore state from localStorage. Rebuilds Sets from saved arrays. Returns null if no save exists. */
    function loadState(config) {
        try {
            var saved = localStorage.getItem(getSaveKey(config));
            if (!saved) return null;
            var data = JSON.parse(saved);

            // Rebuild state from serialized data
            var state = {
                position:        data.position,
                visibility:      data.visibility,
                objectives:      data.objectives,
                nodesDiscovered: new Set(data.nodesDiscovered),
                nmapTargets:     new Set(data.nmapTargets),
                agentCmdCount:   data.agentCmdCount || 0,
                startTime:       data.startTime,
                completed:       false,
                integrity:       data.integrity !== undefined ? data.integrity : (config.integrity || 3),
                trapsTriggered:  data.trapsTriggered || 0,
                scannedCells:       data.scannedCells || {},
                /* Metroidvania v2 obstacle state */
                jumpedCells:        data.jumpedCells || {},
                extinguishedCells:  data.extinguishedCells || {},
                defeatedEnemies:    data.defeatedEnemies || {},
                permanentCleared:   data.permanentCleared || {},
                items:              data.items || []
            };

            // Restore gate flags
            if (config.gates) {
                var gateKeys = Object.keys(config.gates);
                for (var g = 0; g < gateKeys.length; g++) {
                    var flag = config.gates[gateKeys[g]].flag;
                    state[flag] = data[flag] || false;
                }
            }

            return state;
        } catch (e) {
            return null;
        }
    }

    /** Create fresh state and reveal starting cell neighbors. */
    function resetState(config) {
        var state = createState(config);
        revealAdjacent(state, config, config.grid.start.col, config.grid.start.row);
        return state;
    }

    function clearSaveState(config) {
        try { localStorage.removeItem(getSaveKey(config)); } catch (e) {}
    }

    /** Write final completion stats to localStorage (time, commands, nodes, integrity, traps). */
    function saveCompletion(state, config) {
        try {
            var elapsed = Math.floor((Date.now() - state.startTime) / 1000);
            var stats = {
                completed:       true,
                time:            elapsed,
                agentCmds:       state.agentCmdCount,
                nodesDiscovered: state.nodesDiscovered.size,
                integrity:       state.integrity,
                trapsTriggered:  state.trapsTriggered,
                timestamp:       Date.now()
            };
            localStorage.setItem(getCompletionKey(config), JSON.stringify(stats));
        } catch (e) {}
    }

    // ----------------------------------------------------------------
    //  9. MISSION COMPLETE
    //  Overlay shown after all objectives validated. Displays stats:
    //  nodes discovered, commands used, elapsed time, integrity remaining.
    //  fireCompletionHooks() bridges to ModuleProgress + GameTracker.
    // ----------------------------------------------------------------

    /** Populate and display the mission complete overlay with final stats. */
    function showMissionComplete(state, config, elapsed) {
        var mins    = Math.floor(elapsed / 60);
        var secs    = elapsed % 60;
        var timeStr = mins > 0 ? mins + 'm ' + secs + 's' : secs + 's';
        var maxInt  = config.integrity || 3;

        if (_els.statNodes)     _els.statNodes.textContent     = state.nodesDiscovered.size;
        if (_els.statCommands)  _els.statCommands.textContent  = state.agentCmdCount;
        if (_els.statTime)      _els.statTime.textContent      = timeStr;
        if (_els.statIntegrity) _els.statIntegrity.textContent = state.integrity + '/' + maxInt;

        if (_els.missionComplete) {
            _els.missionComplete.classList.add('visible');
        }
    }

    /** Notify external systems: ModuleProgress (XP/progress) and GameTracker (score/stats). */
    function fireCompletionHooks(state, config, elapsed) {
        // ModuleProgress integration
        if (typeof window.ModuleProgress !== 'undefined' &&
            typeof window.ModuleProgress.complete === 'function') {
            // BUG-045: this was `complete(config.id)` -- one arg against
            // complete(houseId, moduleId, options), so moduleId was undefined and the
            // function THREW at its prettyTitle line, silently (the catch below ate it)
            // after already writing a bucket named after the mission. The `op-` prefix is
            // deliberate: progress.completedModules is a GLOBAL unscoped namespace and bare
            // mission ids collide with real content elsewhere (js-01..js-05 are Armory
            // challenge ids; crypto-01/02 are Arena box ids) -- namespacing now costs nothing
            // and stops 124 generic ids from poisoning that namespace later.
            // silent + no-return-to-dashboard is REQUIRED, not decorative (Chris caught this):
            // Operator has its OWN completion UI (#mission-complete, z-index 8000). Left to its
            // defaults, ModuleProgress paints a generic "Module Complete!" overlay at z-index
            // 100000 that completely covers the mission's own reward card -- a regression that
            // only became reachable once the throw above stopped aborting execution early.
            /* BUG-253: the house is 'matrix', NOT 'operator'. `operator` was never a house --
               ProgressManager.HOUSES has no such entry -- so these completions landed in a bucket
               that no house-scoped feature could read. It rendered a nameless card pinned at 0%,
               undercounted House of the Matrix by exactly the missions the student HAD finished,
               and surfaced on the dashboard as the literal text "Resume operations in operator."

               Decided 4-0 (Nancy, Mallory, Chris, primary) on 2026-09-03. ContentCatalog files all
               24 op-* missions as house 'matrix'; every comparable sub-hub already attributes to
               its parent house (Backbone -> web, Code Armory -> code, Bug Hunting -> dark-arts);
               and this hub's own back-link reads "← MATRIX". Making 'operator' a real twelfth
               house was rejected because Object.keys(HOUSES).length is the maxXP denominator, so
               it would have lowered every student's completion percentage platform-wide.

               The 'op-' prefix stays: progress.completedModules is a GLOBAL unscoped namespace and
               bare mission ids collide with real content elsewhere. Existing progress written
               under the old bucket is moved by ProgressManager.migrateOperatorHouseToMatrix(). */
            try {
                window.ModuleProgress.complete('matrix', 'op-' + config.id,
                    { silent: true, returnToDashboard: false });
            } catch (e) {}
        }

        // Completion reward: award permanent tool if config specifies one
        // Used by "The Bridge" (L28) and future tool-granting levels
        if (config.completionReward && config.completionReward.tool) {
            try {
                var toolName = config.completionReward.tool;
                var inv = JSON.parse(localStorage.getItem('hexworth_operator_inventory') || '{"tools":[]}');
                if (inv.tools.indexOf(toolName) === -1) {
                    inv.tools.push(toolName);
                    if (!inv.earnedIn) inv.earnedIn = {};
                    inv.earnedIn[toolName] = config.id;
                    localStorage.setItem('hexworth_operator_inventory', JSON.stringify(inv));
                    printLine('', 'system');
                    printLine('*** PERMANENT TOOL EARNED: ' + toolName.toUpperCase() + ' ***', 'heading');
                    printLine('This tool is now available in ALL levels.', 'success');
                }
            } catch (e) { /* localStorage error */ }
        }

        // GameTracker integration
        if (typeof window.GameTracker !== 'undefined' &&
            typeof window.GameTracker.record === 'function') {
            try {
                window.GameTracker.record({
                    game:     'operator-' + config.id,
                    score:    state.nodesDiscovered.size,
                    time:     elapsed,
                    metadata: {
                        agentCmds:   state.agentCmdCount,
                        integrity:   state.integrity,
                        traps:       state.trapsTriggered
                    }
                });
            } catch (e) {}
        }
    }

    // ----------------------------------------------------------------
    //  10. EDITOR UI (Python Mode)
    //  Code editor with line numbers, syntax highlighting placeholder,
    //  toolbar (RUN/STOP/CLEAR/RESET), and output console. Tab inserts
    //  4 spaces. Ctrl+Enter / Cmd+Enter runs script. Terminal mode
    //  missions skip this entirely — TerminalInterpreter builds its
    //  own input row inside the output console area.
    // ----------------------------------------------------------------

    /** Build the Python code editor panel. Returns interface: getCode, setOutput, onRun, etc. */
    function buildEditor(container) {
        // Toolbar
        var toolbar = document.createElement('div');
        toolbar.className = 'editor-toolbar';

        var btnRun = document.createElement('button');
        btnRun.className   = 'editor-btn';
        btnRun.id          = 'btn-run';
        btnRun.textContent = '> RUN';

        var btnStop = document.createElement('button');
        btnStop.className   = 'editor-btn stop-btn';
        btnStop.id          = 'btn-stop';
        btnStop.disabled    = true;
        btnStop.innerHTML   = '&#9632; STOP';

        var btnClear = document.createElement('button');
        btnClear.className   = 'editor-btn';
        btnClear.id          = 'btn-clear';
        btnClear.textContent = 'CLEAR OUT';

        var btnReset = document.createElement('button');
        btnReset.className   = 'editor-btn reset-btn';
        btnReset.id          = 'btn-reset';
        btnReset.textContent = 'RESET';

        var spacer = document.createElement('div');
        spacer.className = 'toolbar-spacer';

        var hint = document.createElement('span');
        hint.className   = 'toolbar-hint';
        hint.textContent = 'Ctrl+Enter = Run';

        toolbar.appendChild(btnRun);
        toolbar.appendChild(btnStop);
        toolbar.appendChild(btnClear);
        toolbar.appendChild(btnReset);
        toolbar.appendChild(spacer);
        toolbar.appendChild(hint);

        // Editor area (line numbers + textarea)
        var editorArea = document.createElement('div');
        editorArea.className = 'editor-area';

        var lineNumbers = document.createElement('div');
        lineNumbers.className = 'line-numbers';
        lineNumbers.id        = 'line-numbers';
        lineNumbers.textContent = '1';

        var codeInput = document.createElement('textarea');
        codeInput.className   = 'code-input';
        codeInput.id          = 'code-input';
        codeInput.spellcheck  = false;
        codeInput.placeholder = '# Write Python here\nagent.scan()\nagent.move(\'east\')';

        editorArea.appendChild(lineNumbers);
        editorArea.appendChild(codeInput);

        // Output console
        var outputConsole = document.createElement('div');
        outputConsole.className = 'output-console';
        outputConsole.id        = 'output-console';

        container.appendChild(toolbar);
        container.appendChild(editorArea);
        container.appendChild(outputConsole);

        // Cache references
        _els.lineNumbers   = lineNumbers;
        _els.codeInput     = codeInput;
        _els.outputConsole  = outputConsole;
        _els.btnRun         = btnRun;
        _els.btnStop        = btnStop;

        // Line number sync
        function updateLineNumbers() {
            var lines = codeInput.value.split('\n');
            var nums  = '';
            for (var i = 1; i <= Math.max(lines.length, 1); i++) {
                nums += i + '\n';
            }
            lineNumbers.textContent = nums;
        }

        function syncScroll() {
            lineNumbers.scrollTop = codeInput.scrollTop;
        }

        // Tab key inserts 4 spaces
        codeInput.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                e.preventDefault();
                var start = this.selectionStart;
                var end   = this.selectionEnd;
                this.value = this.value.substring(0, start) + '    ' + this.value.substring(end);
                this.selectionStart = this.selectionEnd = start + 4;
                updateLineNumbers();
            }
            // Ctrl+Enter or Cmd+Enter runs script
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
                if (_callbacks.onRun) _callbacks.onRun();
            }
        });

        codeInput.addEventListener('input',  updateLineNumbers);
        codeInput.addEventListener('scroll', syncScroll);

        // Button wiring
        btnRun.addEventListener('click', function() {
            if (_callbacks.onRun) _callbacks.onRun();
        });
        btnStop.addEventListener('click', function() {
            if (_callbacks.onStop) _callbacks.onStop();
        });
        btnClear.addEventListener('click', function() {
            outputConsole.innerHTML = '';
        });
        btnReset.addEventListener('click', function() {
            if (_callbacks.onReset) _callbacks.onReset();
        });

        updateLineNumbers();

        // Return editor interface
        return {
            getCode: function() {
                return codeInput.value;
            },
            setOutput: function(text) {
                outputConsole.textContent = text;
            },
            clearOutput: function() {
                outputConsole.innerHTML = '';
            },
            onRun: function(cb) {
                _callbacks.onRun = cb;
            },
            onStop: function(cb) {
                _callbacks.onStop = cb;
            },
            onReset: function(cb) {
                _callbacks.onReset = cb;
            },
            focus: function() {
                codeInput.focus();
            },
            setReadOnly: function(val) {
                codeInput.readOnly = val;
            }
        };
    }

    // ----------------------------------------------------------------
    //  11. DOM BUILDER — constructs full mission layout
    //  Creates the 3-panel layout: header (back + title + status),
    //  objectives bar + integrity meter, and main content split into
    //  grid panel (left) + editor/terminal panel (right). Also builds
    //  the mission briefing overlay and completion overlay.
    // ----------------------------------------------------------------

    /** Build the entire mission DOM structure and inject into rootEl. */
    function buildDOM(config, rootEl) {
        // Header
        var header = document.createElement('div');
        header.className = 'mission-header';

        var backLink = document.createElement('a');
        backLink.className   = 'mission-header-back';
        backLink.href        = '../index.html';
        backLink.innerHTML   = '&larr; OPERATOR';

        var titleEl = document.createElement('div');
        titleEl.className   = 'mission-header-title';
        titleEl.textContent = config.title || config.id.toUpperCase();

        var statusEl = document.createElement('div');
        statusEl.className   = 'mission-header-status';
        statusEl.id          = 'header-status';
        statusEl.textContent = 'IN PROGRESS';

        // Help button (reopens move list + legend)
        var helpBtn = document.createElement('button');
        helpBtn.style.cssText = 'background:rgba(255,107,53,0.10);color:#ff6b35;border:1px solid rgba(255,107,53,0.25);border-radius:5px;padding:4px 10px;font-family:inherit;font-size:12px;font-weight:700;cursor:pointer;margin-left:auto;';
        helpBtn.textContent = '? Help';
        helpBtn.title = 'Show move list and grid legend';
        helpBtn.onclick = function() { showHelpOverlay(config); };

        header.appendChild(backLink);
        header.appendChild(titleEl);
        header.appendChild(helpBtn);
        header.appendChild(statusEl);
        rootEl.appendChild(header);

        _els.headerStatus = statusEl;

        // Objectives bar
        var objBar = document.createElement('div');
        objBar.className = 'obj-bar';

        var objLabel = document.createElement('span');
        objLabel.className   = 'obj-label';
        objLabel.textContent = 'OBJ';
        objBar.appendChild(objLabel);

        for (var i = 0; i < config.objectives.length; i++) {
            var objItem = document.createElement('div');
            objItem.className = 'obj-item';
            objItem.id        = 'obj-' + i;

            var objCheck = document.createElement('span');
            objCheck.className = 'obj-check';

            var shortLabel = config.objectives[i].label.split(' -- ')[0] ||
                             config.objectives[i].label.split(' \u2014 ')[0];
            objItem.appendChild(objCheck);
            objItem.appendChild(document.createTextNode(' ' + shortLabel));
            objBar.appendChild(objItem);
        }

        // Integrity meter
        var meter = document.createElement('div');
        meter.className = 'integrity-meter';
        meter.id        = 'integrity-meter';

        var intLabel = document.createElement('span');
        intLabel.textContent = 'INT';
        meter.appendChild(intLabel);

        var maxInt = config.integrity || 3;
        for (var p = 0; p < maxInt; p++) {
            var pip = document.createElement('div');
            pip.className = 'integrity-pip active';
            pip.id        = 'int-pip-' + p;
            meter.appendChild(pip);
        }
        objBar.appendChild(meter);
        rootEl.appendChild(objBar);

        _els.objBar         = objBar;
        _els.integrityMeter = meter;

        // Split layout
        var layout = document.createElement('div');
        layout.className = 'mission-layout';

        // Map panel (left)
        var mapPanel = document.createElement('div');
        mapPanel.className = 'map-panel';

        var gridContainer = document.createElement('div');
        gridContainer.className = 'grid-container';
        gridContainer.id        = 'grid-container';
        mapPanel.appendChild(gridContainer);
        layout.appendChild(mapPanel);

        _els.gridContainer = gridContainer;

        // Editor panel (right)
        var editorPanel = document.createElement('div');
        editorPanel.className = 'editor-panel';
        editorPanel.id        = 'editor-panel';
        layout.appendChild(editorPanel);

        rootEl.appendChild(layout);

        // Mission complete overlay
        var mcOverlay = document.createElement('div');
        mcOverlay.className = 'mission-complete';
        mcOverlay.id        = 'mission-complete';

        var completionTitle    = (config.completion && config.completion.title)    || config.id.toUpperCase();
        var completionSubtitle = (config.completion && config.completion.subtitle) || 'Mission accomplished.';

        mcOverlay.innerHTML =
            '<div class="mc-card">' +
                '<div class="mc-badge">MISSION COMPLETE</div>' +
                '<div class="mc-title">' + completionTitle + '</div>' +
                '<div class="mc-subtitle">' + completionSubtitle + '</div>' +
                '<div class="mc-stats">' +
                    '<div><div class="mc-stat-value" id="stat-nodes">0</div><div class="mc-stat-label">Nodes</div></div>' +
                    '<div><div class="mc-stat-value" id="stat-commands">0</div><div class="mc-stat-label">Agent Cmds</div></div>' +
                    '<div><div class="mc-stat-value" id="stat-time">0s</div><div class="mc-stat-label">Time</div></div>' +
                    '<div><div class="mc-stat-value" id="stat-integrity">0/0</div><div class="mc-stat-label">Integrity</div></div>' +
                '</div>' +
                '<a href="../index.html" class="mc-btn">RETURN TO OPERATOR</a>' +
            '</div>';

        rootEl.appendChild(mcOverlay);

        _els.missionComplete = mcOverlay;
        _els.statNodes       = mcOverlay.querySelector('#stat-nodes');
        _els.statCommands    = mcOverlay.querySelector('#stat-commands');
        _els.statTime        = mcOverlay.querySelector('#stat-time');
        _els.statIntegrity   = mcOverlay.querySelector('#stat-integrity');

        return {
            gridContainer: gridContainer,
            editorPanel:   editorPanel
        };
    }

    // ----------------------------------------------------------------
    //  UTILITY
    // ----------------------------------------------------------------

    function delay(ms) {
        return new Promise(function(r) { setTimeout(r, ms); });
    }

    function padRight(str, len) {
        while (str.length < len) str += ' ';
        return str;
    }

    // ----------------------------------------------------------------
    //  10b. TERMINAL UI (for terminal-mode missions)
    // ----------------------------------------------------------------

    function buildTerminal(container, config) {
        var promptText = config.prompt || config.promptText || 'operator:~$';

        // Terminal bar (decorative dots + label)
        var termBar = document.createElement('div');
        termBar.className = 'term-bar';

        for (var d = 0; d < 3; d++) {
            var dot = document.createElement('div');
            dot.className = 'term-dot';
            termBar.appendChild(dot);
        }

        var barLabel = document.createElement('span');
        barLabel.className = 'term-bar-label';
        barLabel.textContent = 'OPERATOR TERMINAL';
        termBar.appendChild(barLabel);

        // Output area
        var termOutput = document.createElement('div');
        termOutput.className = 'term-output';
        termOutput.id = 'term-output';

        // Input row
        var inputRow = document.createElement('div');
        inputRow.className = 'term-input-row';

        var promptEl = document.createElement('span');
        promptEl.className = 'term-prompt-text';
        promptEl.textContent = promptText;

        var termInput = document.createElement('input');
        termInput.type = 'text';
        termInput.className = 'term-input';
        termInput.id = 'term-input';
        termInput.autocomplete = 'off';
        termInput.spellcheck = false;

        inputRow.appendChild(promptEl);
        inputRow.appendChild(termInput);

        container.appendChild(termBar);
        container.appendChild(termOutput);
        container.appendChild(inputRow);

        // Cache references
        _els.outputConsole = termOutput;

        // Command history
        var commandHistory = [];
        var historyIndex = -1;
        var _onCommand = null;

        // Input handling
        termInput.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                var cmd = this.value.trim();
                if (cmd) {
                    commandHistory.push(cmd);
                    historyIndex = commandHistory.length;
                    // Echo command
                    printLine(promptText + ' ' + cmd, 'prompt-echo');
                    if (_onCommand) _onCommand(cmd);
                }
                this.value = '';
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (historyIndex > 0) {
                    historyIndex--;
                    this.value = commandHistory[historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (historyIndex < commandHistory.length - 1) {
                    historyIndex++;
                    this.value = commandHistory[historyIndex];
                } else {
                    historyIndex = commandHistory.length;
                    this.value = '';
                }
            }
        });

        // Click anywhere in terminal to focus input
        container.addEventListener('click', function(e) {
            if (e.target.tagName !== 'INPUT') termInput.focus();
        });

        return {
            onCommand: function(cb) { _onCommand = cb; },
            focus: function() { termInput.focus(); },
            clearOutput: function() { termOutput.innerHTML = ''; }
        };
    }

    // ----------------------------------------------------------------
    //  11. INIT -- Entry Point
    // ----------------------------------------------------------------

    // ----------------------------------------------------------------
    //  MISSION BRIEFING OVERLAY
    // ----------------------------------------------------------------

    function buildBriefing(config, rootEl, onStart) {
        // Check skip preference
        if (localStorage.getItem('hexworth_operator_skip_briefing') === 'true') {
            onStart();
            return;
        }

        var overlay = document.createElement('div');
        overlay.style.cssText = 'position:fixed;inset:0;z-index:200;background:#08080f;display:flex;justify-content:center;align-items:flex-start;overflow-y:auto;padding:40px 20px;font-family:"Courier New",Courier,monospace;';

        var card = document.createElement('div');
        card.style.cssText = 'max-width:680px;width:100%;';

        // Accent bar
        var accent = config.accent || '#ff6b35';
        var accentBar = document.createElement('div');
        accentBar.style.cssText = 'height:3px;background:' + accent + ';border-radius:2px;margin-bottom:24px;';
        card.appendChild(accentBar);

        // Title
        var title = document.createElement('div');
        title.style.cssText = 'font-size:1.4rem;font-weight:700;color:#f1f5f9;letter-spacing:1px;margin-bottom:4px;';
        title.textContent = config.title || config.id;
        card.appendChild(title);

        var sub = document.createElement('div');
        sub.style.cssText = 'font-size:0.82rem;color:#64748b;margin-bottom:20px;';
        sub.textContent = config.subtitle || '';
        card.appendChild(sub);

        // Scenario
        // Mission brief — use config.brief if provided, otherwise generic
        var scenario = document.createElement('div');
        scenario.style.cssText = 'font-size:0.82rem;color:#94a3b8;line-height:1.7;margin-bottom:14px;padding:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.06);border-radius:6px;';
        var modeLabel = config.inputMode === 'terminal' ? 'terminal commands' : 'Python code';
        var briefText = config.brief || ('Write ' + modeLabel + ' to control your agent through a network grid. Navigate nodes, scan for threats, bypass gates, and complete all objectives. Traps damage your integrity &mdash; scan before you move.');
        scenario.innerHTML = briefText;

        // Success condition — shown if config.successCondition is set
        if (config.successCondition) {
            var successEl = document.createElement('div');
            successEl.style.cssText = 'font-size:0.78rem;color:#4ade80;line-height:1.5;margin-bottom:20px;padding:10px 14px;background:rgba(74,222,128,0.06);border:1px solid rgba(74,222,128,0.18);border-left:3px solid #4ade80;border-radius:0 6px 6px 0;';
            successEl.innerHTML = '<strong style="color:#4ade80;">Mission Success:</strong> ' + config.successCondition;
            card.appendChild(successEl);
        }
        card.appendChild(scenario);

        // Objectives
        if (config.objectives && config.objectives.length > 0) {
            var objTitle = document.createElement('div');
            objTitle.style.cssText = 'font-size:0.72rem;font-weight:700;color:' + accent + ';text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;';
            objTitle.textContent = 'OBJECTIVES';
            card.appendChild(objTitle);

            var objList = document.createElement('ul');
            objList.style.cssText = 'font-size:0.8rem;color:#c0c0d0;line-height:1.8;margin:0 0 20px 20px;padding:0;';
            for (var i = 0; i < config.objectives.length; i++) {
                var li = document.createElement('li');
                li.textContent = config.objectives[i].label;
                objList.appendChild(li);
            }
            card.appendChild(objList);
        }

        // Move list / Command reference
        var cmdTitle = document.createElement('div');
        cmdTitle.style.cssText = 'font-size:0.72rem;font-weight:700;color:' + accent + ';text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;';
        cmdTitle.textContent = config.inputMode === 'terminal' ? 'COMMAND REFERENCE' : 'MOVE LIST';
        card.appendChild(cmdTitle);

        var commands = [];
        if (config.inputMode === 'terminal') {
            commands = [
                ['move <dir>', 'Move one cell: north, south, east, west'],
                ['scan', 'Scan ALL 4 adjacent cells at once — reveals nodes, disarms traps'],
                ['sweep <dir>', 'Scan ONE specific cell in a direction — cheaper than full scan'],
                ['nmap <node>', 'Port scan a discovered node — required to clear firewall gates'],
                ['status', 'Show current position, integrity, discovered nodes, objectives'],
                ['ping <node>', 'Check if a discovered node is reachable from current position'],
                ['help', 'Show available commands']
            ];
        } else {
            commands = [
                ['agent.move("north")', 'Move one cell in a direction (north/south/east/west)'],
                ['agent.scan()', 'Scan ALL 4 adjacent cells at once — reveals nodes, disarms traps'],
                ['agent.sweep("dir")', 'Scan ONE specific cell in a direction — cheaper than full scan'],
                ['agent.nmap("node")', 'Port scan a discovered node — required to clear firewall gates'],
                ['agent.status()', 'Show current position, integrity, discovered nodes, objectives'],
                ['agent.ping("node")', 'Check if a discovered node is reachable from current position'],
                ['for / if / while', 'Standard Python control flow works — use loops to reduce commands']
            ];
        }

        var cmdGrid = document.createElement('div');
        cmdGrid.style.cssText = 'display:grid;grid-template-columns:auto 1fr;gap:4px 14px;font-size:0.78rem;margin-bottom:20px;';
        for (var c = 0; c < commands.length; c++) {
            var cmdName = document.createElement('code');
            cmdName.style.cssText = 'color:' + accent + ';background:rgba(255,255,255,0.05);padding:2px 8px;border-radius:3px;white-space:nowrap;';
            cmdName.textContent = commands[c][0];
            var cmdDesc = document.createElement('span');
            cmdDesc.style.cssText = 'color:#94a3b8;padding-top:2px;';
            cmdDesc.textContent = commands[c][1];
            cmdGrid.appendChild(cmdName);
            cmdGrid.appendChild(cmdDesc);
        }
        card.appendChild(cmdGrid);

        // Grid legend
        var legTitle = document.createElement('div');
        legTitle.style.cssText = 'font-size:0.72rem;font-weight:700;color:' + accent + ';text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;';
        legTitle.textContent = 'GRID LEGEND';
        card.appendChild(legTitle);

        var legendItems = [
            ['\u25C6', '#4ade80', 'Your Agent — current position'],
            ['\u25A3', '#94a3b8', 'Network Node — move onto it to discover'],
            ['\u25A1', '#334155', 'Fog of War — unexplored, use scan to reveal'],
            ['\u2718', '#ef4444', 'Trap — damages integrity if you enter unscanned'],
            ['\u25A8', '#f59e0b', 'Gate — requires nmap on the gate node to clear'],
            ['\u2605', '#a855f7', 'Target — your final objective'],
            ['\u2588', '#0f172a', 'Wall — impassable terrain']
        ];

        var legGrid = document.createElement('div');
        legGrid.style.cssText = 'display:grid;grid-template-columns:24px auto 1fr;gap:4px 10px;font-size:0.78rem;margin-bottom:24px;';
        for (var l = 0; l < legendItems.length; l++) {
            var sym = document.createElement('span');
            sym.style.cssText = 'color:' + legendItems[l][1] + ';text-align:center;font-size:1rem;';
            sym.textContent = legendItems[l][0];
            var lbl = document.createElement('span');
            lbl.style.cssText = 'color:#e2e8f0;font-weight:600;';
            lbl.textContent = legendItems[l][0] === '\u2718' ? 'Trap' : legendItems[l][0] === '\u25A8' ? 'Gate' : legendItems[l][0] === '\u2605' ? 'Target' : '';
            var ldesc = document.createElement('span');
            ldesc.style.cssText = 'color:#94a3b8;';
            ldesc.textContent = legendItems[l][2];
            legGrid.appendChild(sym);
            legGrid.appendChild(lbl);
            legGrid.appendChild(ldesc);
        }
        card.appendChild(legGrid);

        // Tips
        var tips = document.createElement('div');
        tips.style.cssText = 'font-size:0.75rem;color:#64748b;line-height:1.6;margin-bottom:24px;padding:10px 14px;background:rgba(255,107,53,0.06);border:1px solid rgba(255,107,53,0.15);border-radius:6px;';
        tips.innerHTML = '<strong style="color:' + accent + ';">Tips:</strong> Always scan before moving into unknown territory. ' +
            '<code style="color:' + accent + ';">scan()</code> reveals all 4 adjacent cells at once. ' +
            '<code style="color:' + accent + ';">sweep("dir")</code> reveals only 1 cell &mdash; use it to save commands when you know which direction you\'re heading. ' +
            'Traps are invisible until scanned. Gates must be cleared with <code style="color:' + accent + ';">nmap()</code> while standing on the gate cell. ' +
            'Your integrity meter is your health &mdash; reach zero and the mission fails.';
        card.appendChild(tips);

        // Buttons
        var btnRow = document.createElement('div');
        btnRow.style.cssText = 'display:flex;gap:12px;align-items:center;';

        var btnStart = document.createElement('button');
        btnStart.style.cssText = 'padding:12px 32px;background:' + accent + ';color:#fff;border:none;border-radius:6px;font-family:inherit;font-size:0.9rem;font-weight:700;cursor:pointer;letter-spacing:0.5px;transition:opacity 0.2s;';
        btnStart.textContent = 'BEGIN MISSION';
        btnStart.onmouseover = function() { this.style.opacity = '0.85'; };
        btnStart.onmouseout = function() { this.style.opacity = '1'; };
        btnStart.onclick = function() {
            overlay.style.transition = 'opacity 0.3s';
            overlay.style.opacity = '0';
            setTimeout(function() { overlay.remove(); onStart(); }, 300);
        };
        btnRow.appendChild(btnStart);

        var skipLink = document.createElement('span');
        skipLink.style.cssText = 'font-size:0.72rem;color:#64748b;cursor:pointer;';
        skipLink.textContent = 'Skip briefings';
        skipLink.onclick = function() {
            localStorage.setItem('hexworth_operator_skip_briefing', 'true');
            overlay.remove();
            onStart();
        };
        btnRow.appendChild(skipLink);

        card.appendChild(btnRow);
        overlay.appendChild(card);
        rootEl.appendChild(overlay);
    }

    // Help button handler — reopens legend as a slide-out
    function showHelpOverlay(config) {
        var existing = document.getElementById('op-help-overlay');
        if (existing) { existing.remove(); return; }

        var overlay = document.createElement('div');
        overlay.id = 'op-help-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:150;background:rgba(0,0,0,0.6);display:flex;justify-content:flex-end;';
        overlay.onclick = function(e) { if (e.target === overlay) overlay.remove(); };

        var panel = document.createElement('div');
        panel.style.cssText = 'width:380px;max-width:90vw;height:100vh;background:#0d1117;border-left:1px solid rgba(255,255,255,0.08);overflow-y:auto;padding:20px;animation:opSlideIn 0.2s ease-out;font-family:"Courier New",Courier,monospace;';

        // Inject animation
        if (!document.getElementById('op-help-anim')) {
            var style = document.createElement('style');
            style.id = 'op-help-anim';
            style.textContent = '@keyframes opSlideIn{from{transform:translateX(100%)}to{transform:translateX(0)}}';
            document.head.appendChild(style);
        }

        var accent = config.accent || '#ff6b35';
        var header = document.createElement('div');
        header.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.08);';
        header.innerHTML = '<span style="font-size:14px;font-weight:700;color:' + accent + ';">MOVE LIST & LEGEND</span>';
        var closeBtn = document.createElement('button');
        closeBtn.style.cssText = 'background:none;border:none;color:#64748b;font-size:18px;cursor:pointer;';
        closeBtn.textContent = '\u00D7';
        closeBtn.onclick = function() { overlay.remove(); };
        header.appendChild(closeBtn);
        panel.appendChild(header);

        // Reuse the briefing content builder for commands + legend
        var commands = [];
        if (config.inputMode === 'terminal') {
            commands = [
                ['move <dir>', 'Move: north/south/east/west'],
                ['scan', 'Scan adjacent cells'],
                ['nmap <node>', 'Port scan a node'],
                ['status', 'Show position and objectives'],
                ['sweep <dir>', 'Scan one direction'],
                ['ping <node>', 'Check node reachability'],
                ['help', 'Show commands']
            ];
        } else {
            commands = [
                ['agent.move("dir")', 'Move agent'],
                ['agent.scan()', 'Scan adjacent'],
                ['agent.nmap("node")', 'Port scan node'],
                ['agent.status()', 'Show status'],
                ['agent.sweep("dir")', 'Scan direction'],
                ['agent.ping("node")', 'Ping node']
            ];
        }

        var cmdSec = document.createElement('div');
        cmdSec.style.cssText = 'margin-bottom:16px;';
        cmdSec.innerHTML = '<div style="font-size:0.7rem;font-weight:700;color:' + accent + ';text-transform:uppercase;letter-spacing:0.4px;margin-bottom:8px;">COMMANDS</div>';
        var cmdHtml = '';
        for (var i = 0; i < commands.length; i++) {
            cmdHtml += '<div style="display:flex;gap:8px;margin-bottom:4px;font-size:0.75rem;"><code style="color:' + accent + ';white-space:nowrap;">' + commands[i][0] + '</code><span style="color:#94a3b8;">' + commands[i][1] + '</span></div>';
        }
        cmdSec.innerHTML += cmdHtml;
        panel.appendChild(cmdSec);

        // Legend
        var legSec = document.createElement('div');
        legSec.innerHTML = '<div style="font-size:0.7rem;font-weight:700;color:' + accent + ';text-transform:uppercase;letter-spacing:0.4px;margin-bottom:8px;">GRID LEGEND</div>' +
            '<div style="font-size:0.75rem;color:#94a3b8;line-height:2;">' +
            '<span style="color:#4ade80;">\u25A0</span> Your Agent &nbsp; ' +
            '<span style="color:#94a3b8;">\u25A3</span> Node &nbsp; ' +
            '<span style="color:#1e293b;">\u25A0</span> Fog &nbsp; ' +
            '<span style="color:#ef4444;">\u2718</span> Trap &nbsp; ' +
            '<span style="color:#f59e0b;">\u25A8</span> Gate &nbsp; ' +
            '<span style="color:#a855f7;">\u2605</span> Target &nbsp; ' +
            '<span style="color:#0f172a;">\u25A0</span> Wall' +
            '</div>';
        panel.appendChild(legSec);

        // Objectives
        if (config.objectives) {
            var objSec = document.createElement('div');
            objSec.style.cssText = 'margin-top:16px;';
            objSec.innerHTML = '<div style="font-size:0.7rem;font-weight:700;color:' + accent + ';text-transform:uppercase;letter-spacing:0.4px;margin-bottom:8px;">OBJECTIVES</div>';
            var objHtml = '';
            for (var j = 0; j < config.objectives.length; j++) {
                objHtml += '<div style="font-size:0.75rem;color:#c0c0d0;margin-bottom:4px;">\u25CB ' + config.objectives[j].label + '</div>';
            }
            objSec.innerHTML += objHtml;
            panel.appendChild(objSec);
        }

        overlay.appendChild(panel);
        document.body.appendChild(overlay);

        // Close on Escape
        function escHandler(e) {
            if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', escHandler); }
        }
        document.addEventListener('keydown', escHandler);
    }

    function init(config) {
        _config = config;
        _els    = {};

        // Find or create root element
        var rootEl = document.body;

        // Build full DOM structure
        var layout = buildDOM(config, rootEl);

        // Build the grid
        buildGrid(config, layout.gridContainer);

        // Build editor or terminal UI based on inputMode
        var isTerminal = (config.inputMode === 'terminal');
        var editor = null;
        var terminal = null;

        if (isTerminal) {
            layout.editorPanel.classList.add('term-panel');
            terminal = buildTerminal(layout.editorPanel, config);
        } else {
            editor = buildEditor(layout.editorPanel);
        }

        // Attempt to load saved state, or create fresh
        var restored = loadState(config);
        if (restored && !restored.completed) {
            _state = restored;
        } else {
            _state = resetState(config);
        }

        // Initial render
        updateGrid(_state, config);
        updateObjectivesUI(_state, config);
        updateIntegrityUI(_state, config);

        // Show mission briefing overlay (first time only)
        buildBriefing(config, rootEl, function() {
            if (editor) editor.focus();
        });
        if (terminal) terminal.focus();

        // Show briefing for terminal mode on fresh start
        if (isTerminal && !restored && config.briefing) {
            var briefing = config.briefing;
            for (var b = 0; b < briefing.length; b++) {
                if (typeof briefing[b] === 'string') {
                    printLine(briefing[b], 'info');
                } else {
                    printLine(briefing[b].text, briefing[b].type || 'system');
                }
            }
        }

        // ---- Engine interface for AgentBridge ----

        var engineAPI = {
            // State accessors
            getState: function() { return _state; },
            getConfig: function() { return _config; },

            // Grid
            updateGrid: function() {
                updateGrid(_state, _config);
            },

            // Fog of war
            revealAdjacent: function(col, row) {
                revealAdjacent(_state, _config, col, row);
            },

            // Output
            printLine: printLine,

            // Node resolution
            resolveNode: function(target) {
                return resolveNode(target, _config, _state);
            },

            // Objectives
            checkObjectives: function() {
                checkObjectives(_state, _config);
            },

            // Integrity
            updateIntegrityUI: function() {
                updateIntegrityUI(_state, _config);
            },

            // Save / load
            saveState: function() {
                saveState(_state, _config);
            },
            resetMission: function() {
                if (editor) editor.clearOutput();
                if (terminal) terminal.clearOutput();
                clearSaveState(_config);
                _state = resetState(_config);
                updateGrid(_state, _config);
                updateObjectivesUI(_state, _config);
                updateIntegrityUI(_state, _config);
                if (_els.headerStatus) {
                    _els.headerStatus.textContent = 'IN PROGRESS';
                    _els.headerStatus.style.color = '';
                }
                if (_els.missionComplete) {
                    _els.missionComplete.classList.remove('visible');
                }
                // Re-show briefing on reset
                if (isTerminal && config.briefing) {
                    var brief = config.briefing;
                    for (var i = 0; i < brief.length; i++) {
                        if (typeof brief[i] === 'string') {
                            printLine(brief[i], 'info');
                        } else {
                            printLine(brief[i].text, brief[i].type || 'system');
                        }
                    }
                }
            },

            // Editor (null for terminal mode)
            editor: editor,

            // Terminal (null for editor mode)
            terminal: terminal,

            // Utility
            delay: delay,
            padRight: padRight
        };

        // Wire reset callbacks
        if (editor) {
            editor.onReset(function() {
                engineAPI.resetMission();
            });
        }

        return engineAPI;
    }

    // ----------------------------------------------------------------
    //  Expose as global
    // ----------------------------------------------------------------

    window.OperatorEngine = {
        init:            init,
        createState:     createState,
        buildGrid:       buildGrid,
        updateGrid:      updateGrid,
        revealAdjacent:  revealAdjacent,
        printLine:       printLine,
        resolveNode:     resolveNode,
        checkObjectives: checkObjectives,
        updateObjectivesUI: updateObjectivesUI,
        updateIntegrityUI:  updateIntegrityUI,
        saveState:       saveState,
        loadState:       loadState,
        resetState:      resetState,
        showMissionComplete: showMissionComplete,
        buildEditor:     buildEditor,
        buildTerminal:   buildTerminal,
        delay:           delay
    };

})();
