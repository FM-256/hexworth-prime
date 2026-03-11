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
            scannedCells:    {}
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
    // ----------------------------------------------------------------

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
    // ----------------------------------------------------------------

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
    // ----------------------------------------------------------------

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
    // ----------------------------------------------------------------

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
    // ----------------------------------------------------------------

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
                state.completed = true;
                var elapsed = Math.floor((Date.now() - state.startTime) / 1000);

                printLine('', 'system');
                printLine('\u2550\u2550\u2550 ALL OBJECTIVES COMPLETE \u2550\u2550\u2550', 'heading');
                printLine('Mission ' + config.id.toUpperCase() + ' accomplished.', 'success');

                if (_els.headerStatus) {
                    _els.headerStatus.textContent = 'COMPLETE';
                    _els.headerStatus.style.color = '#39ff14';
                }

                // Save completion + clear save state
                saveCompletion(state, config);
                clearSaveState(config);

                // Fire external hooks
                fireCompletionHooks(state, config, elapsed);

                setTimeout(function() {
                    showMissionComplete(state, config, elapsed);
                }, 1500);
            }
        }
    }

    // ----------------------------------------------------------------
    //  7. INTEGRITY SYSTEM
    // ----------------------------------------------------------------

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
    // ----------------------------------------------------------------

    function getSaveKey(config) {
        return 'hexworth_operator_' + config.id + '_save';
    }

    function getCompletionKey(config) {
        if (config.completion && config.completion.storageKey) {
            return config.completion.storageKey;
        }
        return 'hexworth_operator_' + config.id;
    }

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
                scannedCells:    state.scannedCells
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
                scannedCells:    data.scannedCells || {}
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

    function resetState(config) {
        var state = createState(config);
        revealAdjacent(state, config, config.grid.start.col, config.grid.start.row);
        return state;
    }

    function clearSaveState(config) {
        try { localStorage.removeItem(getSaveKey(config)); } catch (e) {}
    }

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
    // ----------------------------------------------------------------

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

    function fireCompletionHooks(state, config, elapsed) {
        // ModuleProgress integration
        if (typeof window.ModuleProgress !== 'undefined' &&
            typeof window.ModuleProgress.complete === 'function') {
            try { window.ModuleProgress.complete(config.id); } catch (e) {}
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
    //  10. EDITOR UI
    // ----------------------------------------------------------------

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
    //  DOM BUILDER — constructs full mission layout
    // ----------------------------------------------------------------

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

        header.appendChild(backLink);
        header.appendChild(titleEl);
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
    //  11. INIT — Entry Point
    // ----------------------------------------------------------------

    function init(config) {
        _config = config;
        _els    = {};

        // Find or create root element
        var rootEl = document.body;

        // Build full DOM structure
        var layout = buildDOM(config, rootEl);

        // Build the grid
        buildGrid(config, layout.gridContainer);

        // Build editor UI
        var editor = buildEditor(layout.editorPanel);

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
        editor.focus();

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
                editor.clearOutput();
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
            },

            // Editor
            editor: editor,

            // Utility
            delay: delay,
            padRight: padRight
        };

        // Wire editor callbacks
        editor.onReset(function() {
            engineAPI.resetMission();
        });

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
        delay:           delay
    };

})();
