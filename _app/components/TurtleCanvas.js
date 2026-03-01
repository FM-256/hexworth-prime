/**
 * TurtleCanvas.js — Browser-based turtle graphics simulator
 *
 * Provides a canvas-based turtle interpreter that runs a subset of Python
 * turtle commands in the browser. Used by Python Hub graphics modules and
 * labs for turtle lessons.
 *
 * Usage:
 *   const t = TurtleCanvas.create('myCanvas', { width: 600, height: 400 });
 *   t.forward(100);
 *   t.right(90);
 *   t.forward(100);
 *
 * Or run Python-like code directly:
 *   t.runCode(`
 *     for i in range(4):
 *         forward(100)
 *         right(90)
 *   `);
 *
 * No external dependencies. Pure vanilla JS + Canvas 2D.
 */
const TurtleCanvas = (function () {

    /**
     * Create a turtle instance bound to a canvas element.
     * @param {string} canvasId - DOM id of the <canvas> element
     * @param {object} options  - Optional overrides: width, height
     * @returns {object} Turtle API
     */
    function create(canvasId, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) throw new Error('TurtleCanvas: no element with id "' + canvasId + '"');
        const ctx = canvas.getContext('2d');

        const width  = options.width  || canvas.width  || 600;
        const height = options.height || canvas.height || 400;
        canvas.width  = width;
        canvas.height = height;

        // -- Turtle state ------------------------------------------------
        let x         = 0;           // turtle-space x (center = 0)
        let y         = 0;           // turtle-space y (center = 0)
        let angle     = 90;          // 0 = East, 90 = North (Python default heading)
        let penIsDown = true;
        let penColor  = '#4ade80';
        let penWidth  = 2;
        let fillColor = '#4ade80';
        let filling   = false;
        let fillPath  = [];          // [[canvasX, canvasY], ...]
        let bgColor   = '#0a0e1a';
        let visible   = true;
        let speedVal  = 3;           // default: slow (visible animation)
        let animationId = 0;         // generation counter to cancel animations
        let recordingQueue = null;   // non-null = recording commands, not executing
        let _skulptActive  = false;  // true when Skulpt rendered last frame

        // Offscreen buffer stores all drawn strokes so we can redraw after
        // clearing the turtle indicator between frames.
        let drawBuffer = null;

        // ----------------------------------------------------------------
        // Coordinate helpers
        // ----------------------------------------------------------------
        function toCanvasX(tx) { return width  / 2 + tx; }
        function toCanvasY(ty) { return height / 2 - ty; }

        // ----------------------------------------------------------------
        // Internal drawing helpers
        // ----------------------------------------------------------------

        /** Ensure the offscreen buffer exists and matches canvas size. */
        function ensureBuffer() {
            if (!drawBuffer) {
                drawBuffer = document.createElement('canvas');
                drawBuffer.width  = width;
                drawBuffer.height = height;
            }
        }

        /** Paint background on a given 2d context. */
        function paintBg(target) {
            target.fillStyle = bgColor;
            target.fillRect(0, 0, width, height);
        }

        /** Composite: bg -> buffer -> turtle indicator onto the visible canvas. */
        function composite() {
            ensureBuffer();
            ctx.clearRect(0, 0, width, height);
            paintBg(ctx);
            ctx.drawImage(drawBuffer, 0, 0);
            drawTurtle();
        }

        /** Draw a line on the offscreen buffer (permanent stroke). */
        function bufferLine(x1, y1, x2, y2) {
            ensureBuffer();
            const bctx = drawBuffer.getContext('2d');
            bctx.beginPath();
            bctx.moveTo(x1, y1);
            bctx.lineTo(x2, y2);
            bctx.strokeStyle = penColor;
            bctx.lineWidth   = penWidth;
            bctx.lineCap     = 'round';
            bctx.stroke();
        }

        /** Draw a filled polygon on the offscreen buffer. */
        function bufferFill(path, color) {
            if (path.length < 2) return;
            ensureBuffer();
            const bctx = drawBuffer.getContext('2d');
            bctx.beginPath();
            bctx.moveTo(path[0][0], path[0][1]);
            for (let i = 1; i < path.length; i++) {
                bctx.lineTo(path[i][0], path[i][1]);
            }
            bctx.closePath();
            bctx.fillStyle = color;
            bctx.fill();
        }

        /** Draw a turtle-shaped stamp on the offscreen buffer. */
        function bufferStamp(tx, ty, a, color) {
            ensureBuffer();
            const bctx = drawBuffer.getContext('2d');
            const cx = toCanvasX(tx);
            const cy = toCanvasY(ty);
            bctx.save();
            bctx.translate(cx, cy);
            // Rotate so the triangle tip points in the heading direction.
            // angle=90 (North/up) should point up on canvas.  Canvas rotation
            // 0 = right.  We convert: canvas_rot = -(angle-90) in degrees,
            // which equals (90 - angle).
            bctx.rotate((90 - a) * Math.PI / 180);
            bctx.beginPath();
            bctx.moveTo(0, -10);
            bctx.lineTo(-7, 7);
            bctx.lineTo(7, 7);
            bctx.closePath();
            bctx.fillStyle = color;
            bctx.fill();
            bctx.restore();
        }

        // ----------------------------------------------------------------
        // Turtle indicator
        // ----------------------------------------------------------------
        function drawTurtle() {
            if (!visible) return;
            const cx = toCanvasX(x);
            const cy = toCanvasY(y);
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate((90 - angle) * Math.PI / 180);
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.lineTo(-7, 7);
            ctx.lineTo(7, 7);
            ctx.closePath();
            ctx.fillStyle = penColor;
            ctx.fill();
            ctx.restore();
        }

        // ----------------------------------------------------------------
        // Movement commands
        // ----------------------------------------------------------------
        function forward(distance) {
            if (distance == null) return;
            const d   = Number(distance);
            const rad = angle * Math.PI / 180;
            const newX = x + d * Math.cos(rad);
            const newY = y + d * Math.sin(rad);

            if (penIsDown) {
                bufferLine(toCanvasX(x), toCanvasY(y), toCanvasX(newX), toCanvasY(newY));
            }
            if (filling) fillPath.push([toCanvasX(newX), toCanvasY(newY)]);

            x = newX;
            y = newY;
            composite();
        }

        function backward(distance) {
            if (distance == null) return;
            forward(-Number(distance));
        }

        function left(degrees) {
            if (degrees == null) return;
            angle = (angle + Number(degrees)) % 360;
            if (angle < 0) angle += 360;
            composite();
        }

        function right(degrees) {
            if (degrees == null) return;
            angle = (angle - Number(degrees)) % 360;
            if (angle < 0) angle += 360;
            composite();
        }

        function gotoPos(tx, ty) {
            if (tx == null || ty == null) return;
            const nx = Number(tx);
            const ny = Number(ty);

            if (penIsDown) {
                bufferLine(toCanvasX(x), toCanvasY(y), toCanvasX(nx), toCanvasY(ny));
            }
            if (filling) fillPath.push([toCanvasX(nx), toCanvasY(ny)]);

            x = nx;
            y = ny;
            composite();
        }

        // ----------------------------------------------------------------
        // Pen control
        // ----------------------------------------------------------------
        function penup()   { penIsDown = false; }
        function pendown() { penIsDown = true; }

        function color(c) {
            if (c == null) return;
            penColor = String(c);
            composite();
        }

        function setWidth(w) {
            if (w == null) return;
            penWidth = Number(w);
        }

        function setSpeed(s) {
            if (s == null) return;
            speedVal = Number(s);
        }

        /** Map speedVal to ms delay per drawing command (matches Python turtle). */
        function getDelay() {
            if (speedVal === 0) return 0;
            if (speedVal >= 10) return 10;
            if (speedVal >= 6) return 30;
            if (speedVal >= 3) return 60;
            if (speedVal >= 2) return 80;
            return 100; // speed 1 = slowest
        }

        /** Commands that produce visible drawing and get animation delays. */
        const DRAWING_CMDS = new Set([
            'forward', 'fd', 'backward', 'bk', 'back',
            'goto', 'setpos', 'setposition', 'circle'
        ]);

        function setFillColor(c) {
            if (c == null) return;
            fillColor = String(c);
        }

        // ----------------------------------------------------------------
        // Drawing commands
        // ----------------------------------------------------------------
        function circle(radius, extent) {
            if (radius == null) return;
            const r   = Number(radius);
            const ext = (extent != null) ? Number(extent) : 360;

            const steps     = Math.max(Math.abs(Math.round(ext / 5)), 1);
            const stepAngle = ext / steps;
            const stepLen   = 2 * Math.PI * Math.abs(r) * Math.abs(stepAngle) / 360;

            for (let i = 0; i < steps; i++) {
                // Turn first, then step — matches Python turtle behaviour
                if (r >= 0) {
                    angle += stepAngle;
                } else {
                    angle -= stepAngle;
                }
                if (angle < 0)   angle += 360;
                if (angle >= 360) angle -= 360;

                const rad  = angle * Math.PI / 180;
                const newX = x + stepLen * Math.cos(rad);
                const newY = y + stepLen * Math.sin(rad);

                if (penIsDown) {
                    bufferLine(toCanvasX(x), toCanvasY(y), toCanvasX(newX), toCanvasY(newY));
                }
                if (filling) fillPath.push([toCanvasX(newX), toCanvasY(newY)]);

                x = newX;
                y = newY;
            }
            composite();
        }

        function beginFill() {
            filling  = true;
            fillPath = [[toCanvasX(x), toCanvasY(y)]];
        }

        function endFill() {
            if (!filling) return;
            filling = false;
            bufferFill(fillPath, fillColor);
            fillPath = [];
            composite();
        }

        function stamp() {
            bufferStamp(x, y, angle, penColor);
            composite();
        }

        function hideturtle() { visible = false; composite(); }
        function showturtle() { visible = true;  composite(); }

        // ----------------------------------------------------------------
        // Skulpt integration (advanced Python support)
        // ----------------------------------------------------------------

        /** Keywords that require a full Python interpreter. */
        const _ADVANCED_RE = /^\s*(?:def |if |elif |else:|while |class |return |try:|except|raise |with |lambda )/m;

        /** Does the code need Skulpt? Returns false for simple turtle-only scripts. */
        function _needsSkulpt(code) {
            return _ADVANCED_RE.test(code);
        }

        /** Promise that resolves when SkulptRunner.js is loaded. */
        let _skulptRunnerLoading = null;

        /** Lazy-load SkulptRunner.js (once). */
        function _ensureSkulptRunner() {
            if (window.SkulptRunner) return Promise.resolve();
            if (_skulptRunnerLoading) return _skulptRunnerLoading;

            // Resolve path relative to TurtleCanvas.js script tag
            var base = '_app/components/';
            var scripts = document.querySelectorAll('script[src*="TurtleCanvas"]');
            if (scripts.length) {
                var src = scripts[scripts.length - 1].getAttribute('src');
                base = src.substring(0, src.lastIndexOf('/') + 1);
            }

            _skulptRunnerLoading = new Promise(function (resolve, reject) {
                var s = document.createElement('script');
                s.src = base + 'SkulptRunner.js';
                s.onload  = function () { _skulptRunnerLoading = null; resolve(); };
                s.onerror = function () { _skulptRunnerLoading = null; reject(new Error('Failed to load SkulptRunner.js')); };
                document.head.appendChild(s);
            });
            return _skulptRunnerLoading;
        }

        /** Get or create the sibling Skulpt div for this canvas. */
        function _getSkulptDiv() {
            var divId = canvasId + '-skulpt';
            var div = document.getElementById(divId);
            if (!div) {
                div = document.createElement('div');
                div.id = divId;
                div.style.background = '#0a0e1a';
                div.style.width  = width + 'px';
                div.style.height = height + 'px';
                div.style.overflow = 'hidden';
                canvas.parentNode.insertBefore(div, canvas.nextSibling);
            }
            return div;
        }

        /** Strip common leading whitespace (like Python textwrap.dedent). */
        function _dedent(code) {
            var lines = code.split('\n');
            var minIndent = Infinity;
            for (var i = 0; i < lines.length; i++) {
                if (lines[i].trim() === '') continue;
                var m = lines[i].match(/^(\s*)/);
                if (m && m[1].length < minIndent) minIndent = m[1].length;
            }
            // If first line has no indent but rest do, recalculate from line 2+
            if (minIndent === 0) {
                minIndent = Infinity;
                for (var i = 1; i < lines.length; i++) {
                    if (lines[i].trim() === '') continue;
                    var m = lines[i].match(/^(\s*)/);
                    if (m && m[1].length < minIndent) minIndent = m[1].length;
                }
            }
            if (minIndent === 0 || minIndent === Infinity) return code;
            // Only strip from lines that actually have enough leading whitespace
            return lines.map(function(l) {
                if (l.trim() === '') return '';
                var indent = l.match(/^(\s*)/)[1].length;
                return indent >= minIndent ? l.substring(minIndent) : l;
            }).join('\n');
        }

        /** Ensure Skulpt's internal canvases stay transparent (page CSS may set opaque backgrounds). */
        function _ensureSkulptCanvasCSS() {
            if (document.getElementById('skulpt-canvas-fix')) return;
            var style = document.createElement('style');
            style.id = 'skulpt-canvas-fix';
            style.textContent = '[id$="-skulpt"] canvas { background: transparent !important; }';
            document.head.appendChild(style);
        }

        /** Run code through Skulpt with canvas/div swap. */
        function _runWithSkulpt(code) {
            code = _dedent(code);
            _ensureSkulptCanvasCSS();
            var div = _getSkulptDiv();

            // Swap: hide canvas, show Skulpt div
            canvas.style.display = 'none';
            div.style.display = 'block';
            div.innerHTML = '';
            _skulptActive = true;

            return _ensureSkulptRunner()
                .then(function () {
                    return SkulptRunner.run(code, div.id, { width: width, height: height });
                })
                .catch(function (err) {
                    // Show error in the Skulpt div
                    var msg = err.toString();
                    if (err.traceback) {
                        msg = err.args && err.args.v && err.args.v[0] ? err.args.v[0].v : msg;
                        msg = 'Error on line ' + err.traceback[0].lineno + ': ' + msg;
                    }
                    div.innerHTML = '<pre style="color:#ef4444;font-family:monospace;padding:16px;margin:0;white-space:pre-wrap;font-size:13px;">' +
                        msg.replace(/</g, '&lt;') + '</pre>';
                });
        }

        // ----------------------------------------------------------------
        // Canvas operations
        // ----------------------------------------------------------------
        function setBgColor(c) {
            if (c == null) return;
            bgColor = String(c);
            composite();
        }

        function clear() {
            animationId++;
            x         = 0;
            y         = 0;
            angle     = 90;
            penIsDown = true;
            penColor  = '#4ade80';
            penWidth  = 2;
            fillColor = '#4ade80';
            filling   = false;
            fillPath  = [];
            visible   = true;

            // Restore canvas if Skulpt was active
            if (_skulptActive) {
                _skulptActive = false;
                canvas.style.display = '';
                var div = document.getElementById(canvasId + '-skulpt');
                if (div) { div.style.display = 'none'; div.innerHTML = ''; }
            }

            // Wipe the offscreen buffer
            ensureBuffer();
            const bctx = drawBuffer.getContext('2d');
            bctx.clearRect(0, 0, width, height);

            composite();
        }

        // ----------------------------------------------------------------
        // Python code parser
        // ----------------------------------------------------------------

        /**
         * Internal: parse Python-like turtle code and either execute or record
         * commands.  When recordingQueue is non-null, commands are pushed to
         * the queue instead of being executed (used for animated playback).
         */
        function _parsePythonLines(pythonCode) {
            vars = {};
            if (!pythonCode) return;

            const lines = pythonCode.split('\n');
            let i = 0;

            while (i < lines.length) {
                const raw  = lines[i];
                const line = raw.trim();
                i++;

                // Skip blanks, comments, imports
                if (!line || line.startsWith('#') || line.startsWith('import ') || line.startsWith('from ')) continue;

                // ----------------------------------------------------------
                // Variable assignment:  varName = expression
                // We track simple numeric assignments so students can write
                // things like `size = 100` then `forward(size)`.
                // ----------------------------------------------------------
                // (handled via a local vars dict — see below)

                // ----------------------------------------------------------
                // For-loop: for <var> in range(<n>):
                // Also supports range(start, stop) and range(start, stop, step)
                // ----------------------------------------------------------
                const loopMatch = line.match(/^for\s+(\w+)\s+in\s+range\(([^)]+)\)\s*:/);
                if (loopMatch) {
                    const loopVar   = loopMatch[1];
                    const rangeArgs = loopMatch[2].split(',').map(a => evalExpr(a.trim(), vars));

                    let start = 0, stop = 0, step = 1;
                    if (rangeArgs.length === 1) {
                        stop = rangeArgs[0];
                    } else if (rangeArgs.length === 2) {
                        start = rangeArgs[0];
                        stop  = rangeArgs[1];
                    } else if (rangeArgs.length >= 3) {
                        start = rangeArgs[0];
                        stop  = rangeArgs[1];
                        step  = rangeArgs[2];
                    }

                    // Collect indented body lines
                    const body = [];
                    while (i < lines.length) {
                        const next = lines[i];
                        // Body line: starts with whitespace AND is not blank
                        if (next.match(/^\s/) && next.trim().length > 0) {
                            body.push(next);
                            i++;
                        } else if (next.trim().length === 0) {
                            // Blank lines inside loop body — include them
                            body.push(next);
                            i++;
                        } else {
                            break;
                        }
                    }

                    // Execute loop body
                    if (step > 0) {
                        for (let v = start; v < stop; v += step) {
                            vars[loopVar] = v;
                            executeBlock(body, vars);
                        }
                    } else if (step < 0) {
                        for (let v = start; v > stop; v += step) {
                            vars[loopVar] = v;
                            executeBlock(body, vars);
                        }
                    }
                    continue;
                }

                // ----------------------------------------------------------
                // Variable assignment:  name = expr
                // ----------------------------------------------------------
                const assignMatch = line.match(/^(\w+)\s*=\s*(.+)$/);
                if (assignMatch && !line.match(/^(?:t|turtle)\./)) {
                    const vName = assignMatch[1];
                    // Don't shadow turtle commands treated as assignments
                    if (!commandMap[vName]) {
                        vars[vName] = evalExpr(assignMatch[2], vars);
                        continue;
                    }
                }

                // ----------------------------------------------------------
                // Turtle command
                // ----------------------------------------------------------
                execTurtleLine(line, vars);
            }

        }

        // Shared variable store for runCode sessions
        let vars = {};

        /**
         * Record all turtle commands from Python code into a flat queue.
         * Does not draw — used by runCode() for animated playback.
         */
        function parseCommands(pythonCode) {
            recordingQueue = [];
            _parsePythonLines(pythonCode);
            const queue = recordingQueue;
            recordingQueue = null;
            return queue;
        }

        /**
         * Parse and execute Python-like turtle code with visible animation.
         * Drawing commands play with delays so students see each step.
         * Returns a Promise that resolves when animation completes.
         * speed(0) = instant (no animation). Default speed = 3 (slow).
         */
        function runCode(pythonCode) {
            clear();
            if (!pythonCode) return Promise.resolve();

            // Auto-scroll the canvas into view so the student doesn't miss
            // the animation.  Uses 'smooth' for a natural feel and 'center'
            // to keep surrounding context (editor, buttons) partially visible.
            canvas.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Delegate to Skulpt for advanced Python (def, if, while, etc.)
            if (_needsSkulpt(pythonCode)) {
                return _runWithSkulpt(pythonCode);
            }

            const queue = parseCommands(pythonCode);
            if (queue.length === 0) { drawTurtle(); return Promise.resolve(); }

            const myId = animationId;

            return new Promise(function (resolve) {
                let idx = 0;

                function step() {
                    while (idx < queue.length) {
                        if (myId !== animationId) { resolve(); return; }

                        var entry = queue[idx++];
                        commandMap[entry.cmd](entry.args);

                        if (DRAWING_CMDS.has(entry.cmd) && getDelay() > 0) {
                            setTimeout(step, getDelay());
                            return;
                        }
                    }
                    if (myId !== animationId) { resolve(); return; }
                    drawTurtle();
                    resolve();
                }

                step();
            });
        }

        /**
         * Synchronous (instant) code execution — preserves old runCode behavior.
         * Use when animation is not needed (e.g., grading checks).
         */
        function runCodeInstant(pythonCode) {
            clear();
            if (!pythonCode) return;
            _parsePythonLines(pythonCode);
            drawTurtle();
        }

        /**
         * Evaluate a simple expression — numbers, variable references,
         * basic arithmetic (+, -, *, /), and string literals.
         */
        function evalExpr(expr, localVars) {
            if (expr == null) return undefined;
            let s = expr.trim();

            // String literal
            if ((s.startsWith("'") && s.endsWith("'")) || (s.startsWith('"') && s.endsWith('"'))) {
                return s.slice(1, -1);
            }

            // Replace known variable names with their numeric values
            // so we can safely evaluate simple arithmetic.
            if (localVars) {
                // Sort keys longest-first to avoid partial replacement
                const keys = Object.keys(localVars).sort((a, b) => b.length - a.length);
                for (const k of keys) {
                    const v = localVars[k];
                    if (typeof v === 'number') {
                        // Word-boundary replacement
                        s = s.replace(new RegExp('\\b' + k + '\\b', 'g'), String(v));
                    }
                }
            }

            // If it's a plain number now, return it
            const num = Number(s);
            if (!isNaN(num) && s.length > 0) return num;

            // Try safe arithmetic eval (only digits, operators, parens, whitespace, dots, minus)
            if (/^[\d\s+\-*/().]+$/.test(s)) {
                try {
                    const result = Function('"use strict"; return (' + s + ')')();
                    if (typeof result === 'number' && isFinite(result)) return result;
                } catch (_) { /* fall through */ }
            }

            // Return as string
            return s;
        }

        /**
         * Execute a block of lines (used inside loops).
         */
        function executeBlock(blockLines, localVars) {
            let j = 0;
            while (j < blockLines.length) {
                const raw  = blockLines[j];
                const line = raw.trim();
                j++;

                if (!line || line.startsWith('#')) continue;

                // Nested for loop (one extra level)
                const loopMatch = line.match(/^for\s+(\w+)\s+in\s+range\(([^)]+)\)\s*:/);
                if (loopMatch) {
                    const loopVar   = loopMatch[1];
                    const rangeArgs = loopMatch[2].split(',').map(a => evalExpr(a.trim(), localVars));

                    let start = 0, stop = 0, step = 1;
                    if (rangeArgs.length === 1) {
                        stop = rangeArgs[0];
                    } else if (rangeArgs.length === 2) {
                        start = rangeArgs[0];
                        stop  = rangeArgs[1];
                    } else if (rangeArgs.length >= 3) {
                        start = rangeArgs[0];
                        stop  = rangeArgs[1];
                        step  = rangeArgs[2];
                    }

                    // Collect deeper-indented body
                    const baseIndent = raw.search(/\S/);
                    const body = [];
                    while (j < blockLines.length) {
                        const next = blockLines[j];
                        const nextIndent = next.search(/\S/);
                        if (next.trim().length === 0 || nextIndent > baseIndent) {
                            body.push(next);
                            j++;
                        } else {
                            break;
                        }
                    }

                    if (step > 0) {
                        for (let v = start; v < stop; v += step) {
                            localVars[loopVar] = v;
                            executeBlock(body, localVars);
                        }
                    } else if (step < 0) {
                        for (let v = start; v > stop; v += step) {
                            localVars[loopVar] = v;
                            executeBlock(body, localVars);
                        }
                    }
                    continue;
                }

                // Variable assignment
                const assignMatch = line.match(/^(\w+)\s*=\s*(.+)$/);
                if (assignMatch && !line.match(/^(?:t|turtle)\./)) {
                    const vName = assignMatch[1];
                    if (!commandMap[vName]) {
                        localVars[vName] = evalExpr(assignMatch[2], localVars);
                        continue;
                    }
                }

                execTurtleLine(line, localVars);
            }
        }

        /**
         * Execute a single turtle command line.
         */
        function execTurtleLine(line, localVars) {
            // Match: optional t. or turtle. prefix, then command(args)
            const match = line.match(/^(?:t\.|turtle\.)?(\w+)\(([^)]*)\)/);
            if (!match) return;

            const cmd     = match[1];
            const argsStr = match[2].trim();
            const args    = argsStr
                ? argsStr.split(',').map(a => evalExpr(a.trim(), localVars))
                : [];

            const handler = commandMap[cmd];
            if (!handler) return;

            if (recordingQueue !== null) {
                recordingQueue.push({ cmd: cmd, args: args });
            } else {
                handler(args);
            }
        }

        /**
         * Map of command names to handler functions.
         * Each handler receives an array of parsed arguments.
         */
        const commandMap = {
            forward:       (a) => forward(a[0]),
            fd:            (a) => forward(a[0]),
            backward:      (a) => backward(a[0]),
            bk:            (a) => backward(a[0]),
            back:          (a) => backward(a[0]),
            left:          (a) => left(a[0]),
            lt:            (a) => left(a[0]),
            right:         (a) => right(a[0]),
            rt:            (a) => right(a[0]),
            penup:         ()  => penup(),
            pu:            ()  => penup(),
            pendown:       ()  => pendown(),
            pd:            ()  => pendown(),
            color:         (a) => color(a[0]),
            pencolor:      (a) => color(a[0]),
            width:         (a) => setWidth(a[0]),
            pensize:       (a) => setWidth(a[0]),
            circle:        (a) => circle(a[0], a[1]),
            goto:          (a) => gotoPos(a[0], a[1]),
            setpos:        (a) => gotoPos(a[0], a[1]),
            setposition:   (a) => gotoPos(a[0], a[1]),
            begin_fill:    ()  => beginFill(),
            end_fill:      ()  => endFill(),
            speed:         (a) => setSpeed(a[0]),
            bgcolor:       (a) => setBgColor(a[0]),
            stamp:         ()  => stamp(),
            fillcolor:     (a) => setFillColor(a[0]),
            hideturtle:    ()  => hideturtle(),
            ht:            ()  => hideturtle(),
            showturtle:    ()  => showturtle(),
            st:            ()  => showturtle(),
            clear:         ()  => clear(),
            reset:         ()  => clear()
        };

        // ----------------------------------------------------------------
        // Initial render
        // ----------------------------------------------------------------
        ensureBuffer();
        composite();

        // ----------------------------------------------------------------
        // Public API
        // ----------------------------------------------------------------
        return {
            // Movement
            forward,
            fd: forward,
            backward,
            bk: backward,
            left,
            lt: left,
            right,
            rt: right,
            goto: gotoPos,
            setpos: gotoPos,
            setposition: gotoPos,

            // Pen control
            penup,
            pu: penup,
            pendown,
            pd: pendown,
            color,
            pencolor: color,
            width: setWidth,
            pensize: setWidth,
            speed: setSpeed,
            fillcolor: setFillColor,

            // Drawing
            circle,
            begin_fill: beginFill,
            end_fill: endFill,
            stamp,
            bgcolor: setBgColor,

            // Visibility
            hideturtle,
            ht: hideturtle,
            showturtle,
            st: showturtle,

            // Canvas
            clear,
            reset: clear,

            // Code runner
            runCode,
            runCodeInstant,

            // Introspection
            getState: function () {
                return {
                    x: x,
                    y: y,
                    angle: angle,
                    penDown: penIsDown,
                    penColor: penColor,
                    penWidth: penWidth,
                    fillColor: fillColor,
                    bgColor: bgColor,
                    visible: visible,
                    speed: speedVal
                };
            }
        };
    }

    // ====================================================================
    // Module export
    // ====================================================================
    return { create: create };

})();

window.TurtleCanvas = TurtleCanvas;
