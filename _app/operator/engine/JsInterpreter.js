/* ================================================================
   JsInterpreter.js — Sandboxed JavaScript Executor for Operator
   ================================================================
   Executes student-written JavaScript in a restricted sandbox.
   Unlike OperatorInterpreter.js (which builds a custom Python
   tokenizer/parser/AST), this leverages the browser's native JS
   engine via the Function constructor with a locked-down scope.

   Usage:
     <script src="engine/OperatorEngine.js"></script>
     <script src="engine/AgentBridge.js"></script>
     <script src="engine/JsInterpreter.js"></script>
     <script src="configs/js-01.config.js"></script>
     <script>
       var engine = OperatorEngine.init(JS_01_CONFIG);
       var agent  = AgentBridge.create(engine);
       JsInterpreter.run(code, agent, engine.printLine)
           .then(function(result) { ... });
     </script>

   API (mirrors OperatorInterpreter):
     JsInterpreter.run(code, agentBridge, printFn) -> Promise<{cmdCount, error}>
     JsInterpreter.cancel()  -- stop execution mid-run
     JsInterpreter.reset()   -- clear cancel flag

   Security:
     - Student code runs inside new Function() — no access to outer scope
     - Dangerous globals (window, document, fetch, localStorage, etc.)
       are explicitly shadowed with undefined in the function body
     - Only whitelisted objects are passed into the sandbox
     - Infinite loop protection via iteration counter injection
     - Execution timeout (30 seconds) kills runaway code
     - No eval(), no import(), no dynamic script loading

   Depends on: OperatorEngine.js, AgentBridge.js
   No build step. No modules. Raw script tag.
   ================================================================ */

(function() {
    'use strict';

    // ----------------------------------------------------------------
    //  CANCEL / TIMEOUT STATE
    // ----------------------------------------------------------------

    var CANCEL_FLAG = false;
    var TIMEOUT_MS = 30000;  // 30-second execution timeout
    var MAX_LOOP_ITERATIONS = 100000;  // infinite loop guard

    // Custom error for cancellation (mirrors Python interpreter pattern)
    function StopExecution() { this.message = 'Execution cancelled'; }
    StopExecution.prototype = Object.create(Error.prototype);

    // ----------------------------------------------------------------
    //  DANGEROUS GLOBALS TO SHADOW
    //  These are set to undefined inside the sandbox function scope
    //  so student code cannot access them even via implicit globals.
    // ----------------------------------------------------------------

    var BLOCKED_GLOBALS = [
        'window', 'self', 'globalThis', 'top', 'parent', 'frames',
        'document', 'location', 'history', 'navigator',
        'fetch', 'XMLHttpRequest', 'WebSocket', 'EventSource',
        'localStorage', 'sessionStorage', 'indexedDB', 'caches',
        'importScripts', 'Worker', 'SharedWorker', 'ServiceWorker',
        'eval', 'Function',
        'alert', 'confirm', 'prompt', 'print',
        'open', 'close', 'postMessage',
        'requestAnimationFrame', 'cancelAnimationFrame',
        'setInterval',  // setTimeout is whitelisted with guard
        'clearInterval',
        'MutationObserver', 'IntersectionObserver', 'ResizeObserver',
        'crypto',       // prevent crypto API access
        'performance',  // prevent timing attacks
        'Notification', 'BroadcastChannel',
        'Proxy', 'Reflect',  // prevent metaprogramming escapes
        '__proto__', 'constructor'  // prevent prototype pollution
    ];

    // ----------------------------------------------------------------
    //  INFINITE LOOP PROTECTION
    //  Injects a counter check into for/while/do-while loops.
    //  If a loop exceeds MAX_LOOP_ITERATIONS, throws an error.
    // ----------------------------------------------------------------

    // ----------------------------------------------------------------
    //  SANDBOX ESCAPE PROTECTION
    //  Blocks constructor chain attacks that bypass the global shadow.
    //  e.g. Array.constructor('return this')() to get window.
    //  Nancy review (2026-04-06): new Function() sandbox is bypassable
    //  via constructor chains. This is a soft sandbox — block known
    //  escape patterns before execution rather than attempting full
    //  isolation (which would require Web Workers + postMessage).
    // ----------------------------------------------------------------

    /* Patterns that indicate sandbox escape attempts */
    var BLOCKED_PATTERNS = [
        /\.constructor\s*\(/g,              // obj.constructor(...)
        /\['constructor'\]/g,               // obj['constructor']
        /\["constructor"\]/g,               // obj["constructor"]
        /\.__proto__/g,                     // obj.__proto__
        /\['__proto__'\]/g,                 // obj['__proto__']
        /\["__proto__"\]/g,                 // obj["__proto__"]
        /Object\.getPrototypeOf/g,          // Object.getPrototypeOf()
        /Object\.setPrototypeOf/g,          // Object.setPrototypeOf()
        /Reflect\s*\./g,                    // Reflect.construct etc
        /Proxy\s*\(/g,                      // new Proxy()
        /\bimport\s*\(/g,                   // dynamic import()
        /\brequire\s*\(/g,                  // Node.js require()
        /\beval\s*\(/g,                     // eval()
        /\bFunction\s*\(/g                  // Function constructor
    ];

    /**
     * Scans student code for sandbox escape patterns.
     * Returns null if clean, or an error message describing the violation.
     */
    function checkSandboxEscapes(code) {
        for (var i = 0; i < BLOCKED_PATTERNS.length; i++) {
            BLOCKED_PATTERNS[i].lastIndex = 0;  // reset regex state
            if (BLOCKED_PATTERNS[i].test(code)) {
                return 'Blocked: this pattern is not allowed in Operator missions. ' +
                       'Use the agent API to interact with the grid.';
            }
        }
        return null;
    }

    /**
     * Pre-processes student code to inject loop guards.
     * Inserts `if(++__lc>MAX){throw new Error(...)}` after every
     * opening brace that follows a loop keyword.
     *
     * Handles: for(...){, while(...){, do {
     * Does NOT handle: single-statement loops without braces
     * (students must use braces — reasonable for learning).
     */
    function injectLoopGuards(code) {
        var max = MAX_LOOP_ITERATIONS;
        var guard = 'if(++__lc>' + max + '){throw new Error("Loop exceeded ' +
                    max + ' iterations — possible infinite loop. Check your loop condition.");}';

        // Match: for/while/do followed by optional parens and opening brace
        // Uses a simple regex — not a full parser, but sufficient for
        // student code that follows standard formatting patterns.
        var loopPattern = /\b(for\s*\([^)]*\)\s*\{|while\s*\([^)]*\)\s*\{|do\s*\{)/g;

        return code.replace(loopPattern, function(match) {
            return match + '\n' + guard + '\n';
        });
    }

    // ----------------------------------------------------------------
    //  COMMAND COUNTER
    //  Wraps agent bridge methods to count how many agent commands
    //  the student's code executed (for scoring and feedback).
    // ----------------------------------------------------------------

    /**
     * Creates a proxy around the agent bridge that counts method calls,
     * checks the cancel flag, and supports callback-style invocation.
     *
     * AgentBridge methods are async (return Promises). For the JS
     * Metroidvania's callback hell → promises → async/await arc,
     * we need to support THREE calling conventions:
     *
     *   1. Callback:    agent.scan(function(results) { ... })
     *   2. Promise:     agent.scan().then(results => ...)
     *   3. Async/await: const results = await agent.scan()
     *
     * The shim detects if the last argument is a function (callback).
     * If so, it strips the callback, calls the async method, then
     * passes the result to the callback via .then(). This lets all
     * three patterns work with the same AgentBridge underneath.
     *
     * Nancy review (2026-04-06): This shim keeps AgentBridge unchanged
     * and avoids coupling the engine to one language's patterns.
     */
    function createCountingProxy(agentBridge, cancelCheckFn) {
        var cmdCount = 0;
        var proxy = {};

        // Copy all properties from the bridge
        var keys = Object.keys(agentBridge);
        for (var i = 0; i < keys.length; i++) {
            (function(key) {
                var val = agentBridge[key];
                if (typeof val === 'function') {
                    // Wrap functions with cancel check, counting, and callback detection
                    proxy[key] = function() {
                        if (cancelCheckFn()) {
                            throw new StopExecution();
                        }
                        cmdCount++;

                        // Detect callback-style invocation:
                        // If the last argument is a function, treat it as a callback.
                        // Strip it from args, call the async method, .then(callback).
                        var args = Array.prototype.slice.call(arguments);
                        var lastArg = args.length > 0 ? args[args.length - 1] : null;

                        if (typeof lastArg === 'function') {
                            var cb = args.pop();
                            var promise = val.apply(agentBridge, args);
                            // Chain the callback onto the Promise
                            return promise.then(cb);
                        }

                        // Standard call — returns a Promise (works with .then() and await)
                        return val.apply(agentBridge, args);
                    };
                } else if (typeof val === 'object' && val !== null) {
                    // Preserve object properties (like agent.position)
                    Object.defineProperty(proxy, key, {
                        get: function() { return agentBridge[key]; },
                        enumerable: true
                    });
                } else {
                    // Preserve primitive properties
                    Object.defineProperty(proxy, key, {
                        get: function() { return agentBridge[key]; },
                        enumerable: true
                    });
                }
            })(keys[i]);
        }

        // Expose the count for retrieval after execution
        proxy.__getCmdCount = function() { return cmdCount; };

        return proxy;
    }

    // ----------------------------------------------------------------
    //  SAFE CONSOLE
    //  Students get console.log() but it routes to the mission output,
    //  not the browser console.
    // ----------------------------------------------------------------

    function createSafeConsole(printFn) {
        function formatArgs(args) {
            var parts = [];
            for (var i = 0; i < args.length; i++) {
                var arg = args[i];
                if (arg === null) { parts.push('null'); }
                else if (arg === undefined) { parts.push('undefined'); }
                else if (typeof arg === 'object') {
                    try { parts.push(JSON.stringify(arg, null, 2)); }
                    catch (e) { parts.push(String(arg)); }
                }
                else { parts.push(String(arg)); }
            }
            return parts.join(' ');
        }

        return {
            log: function() { printFn(formatArgs(arguments), 'info'); },
            warn: function() { printFn(formatArgs(arguments), 'warning'); },
            error: function() { printFn(formatArgs(arguments), 'error'); },
            info: function() { printFn(formatArgs(arguments), 'info'); },
            dir: function() { printFn(formatArgs(arguments), 'node-info'); },
            table: function(data) {
                // Simple table rendering for arrays of objects
                if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
                    var cols = Object.keys(data[0]);
                    printFn(cols.join('\t'), 'heading');
                    for (var r = 0; r < Math.min(data.length, 50); r++) {
                        var row = [];
                        for (var c = 0; c < cols.length; c++) {
                            row.push(data[r][cols[c]] != null ? String(data[r][cols[c]]) : '');
                        }
                        printFn(row.join('\t'), 'node-info');
                    }
                } else {
                    printFn(formatArgs([data]), 'info');
                }
            }
        };
    }

    // ----------------------------------------------------------------
    //  SAFE SETTIMEOUT
    //  Students can use setTimeout but with a maximum delay of 5 seconds
    //  and no access to setInterval (which could outlive execution).
    // ----------------------------------------------------------------

    function createSafeTimeout(cancelCheckFn) {
        return function safeTimeout(fn, delay) {
            if (typeof fn !== 'function') return;
            // Cap delay at 5 seconds — anything longer is likely a mistake
            var safeDelay = Math.min(Math.max(0, delay || 0), 5000);
            return setTimeout(function() {
                if (!cancelCheckFn()) {
                    try { fn(); }
                    catch (e) { /* swallow errors in timeout callbacks */ }
                }
            }, safeDelay);
        };
    }

    // ----------------------------------------------------------------
    //  ERROR FORMATTING
    //  Parses JS errors into student-friendly messages with line
    //  numbers and common typo suggestions.
    // ----------------------------------------------------------------

    /* Common typos and their corrections */
    var TYPO_SUGGESTIONS = {
        'filtr':       'filter',
        'fitler':      'filter',
        'filer':       'filter',
        'lenght':      'length',
        'legth':       'length',
        'lenth':       'length',
        'consol':      'console',
        'consloe':     'console',
        'consoel':     'console',
        'fucntion':    'function',
        'funciton':    'function',
        'funcion':     'function',
        'retrun':      'return',
        'reutrn':      'return',
        'undefiend':   'undefined',
        'flase':       'false',
        'ture':        'true',
        'inclues':     'includes',
        'incldes':     'includes',
        'forEahc':     'forEach',
        'foreahc':     'forEach',
        'foreEach':    'forEach'
    };

    function formatError(error, code) {
        var msg = error.message || String(error);

        // Try to extract line number from error stack
        var lineMatch = msg.match(/line (\d+)/i) ||
                        (error.stack && error.stack.match(/<anonymous>:(\d+)/));
        var lineNum = lineMatch ? parseInt(lineMatch[1]) : null;

        // Adjust line number to account for injected code
        // (shadow block + async wrapper add ~3 lines before student code)
        if (lineNum !== null) {
            lineNum = Math.max(1, lineNum - 3);
        }

        // Check for typo suggestions
        var suggestion = '';
        var typoKeys = Object.keys(TYPO_SUGGESTIONS);
        for (var i = 0; i < typoKeys.length; i++) {
            if (msg.indexOf(typoKeys[i]) !== -1) {
                suggestion = '\n        Did you mean: ' + TYPO_SUGGESTIONS[typoKeys[i]] + '?';
                break;
            }
        }

        // Format the error message
        var formatted = msg;
        if (lineNum !== null) {
            formatted = 'Line ' + lineNum + ': ' + msg;
        }
        if (suggestion) {
            formatted += suggestion;
        }

        return formatted;
    }

    // ----------------------------------------------------------------
    //  MAIN EXECUTOR
    //  Builds and runs the sandboxed function.
    // ----------------------------------------------------------------

    /**
     * Executes student JavaScript code in a restricted sandbox.
     *
     * @param {string} code - Student's JavaScript source code
     * @param {object} agentBridge - AgentBridge instance (from AgentBridge.create())
     * @param {function} printFn - Output function (engine.printLine)
     * @returns {Promise<{cmdCount: number, error: string|null}>}
     */
    async function execute(code, agentBridge, printFn) {
        // 1. Create sandbox components
        var agentProxy = createCountingProxy(agentBridge, function() { return CANCEL_FLAG; });
        var safeConsole = createSafeConsole(printFn);
        var safeTimeout = createSafeTimeout(function() { return CANCEL_FLAG; });

        // 2. Build the sandbox parameter map — ONLY these are accessible
        var sandbox = {
            agent:       agentProxy,
            console:     safeConsole,
            setTimeout:  safeTimeout,
            clearTimeout: clearTimeout,
            Math:        Math,
            JSON:        JSON,
            parseInt:    parseInt,
            parseFloat:  parseFloat,
            isNaN:       isNaN,
            isFinite:    isFinite,
            String:      String,
            Number:      Number,
            Boolean:     Boolean,
            Array:       Array,
            Object:      Object,
            Map:         Map,
            Set:         Set,
            Promise:     Promise,
            RegExp:      RegExp,
            Date:        Date,
            Error:       Error,
            TypeError:   TypeError,
            RangeError:  RangeError,
            __lc:        0   // loop counter for infinite loop guard
        };

        // 3. Build the shadow block — override dangerous globals with undefined
        var shadowLines = [];
        for (var g = 0; g < BLOCKED_GLOBALS.length; g++) {
            shadowLines.push('var ' + BLOCKED_GLOBALS[g] + ' = undefined;');
        }
        var shadowBlock = shadowLines.join('\n');

        // 4. Check for sandbox escape patterns BEFORE execution
        var escapeError = checkSandboxEscapes(code);
        if (escapeError) {
            return { cmdCount: 0, error: escapeError };
        }

        // 5. Inject loop guards into student code
        var guardedCode = injectLoopGuards(code);

        // 6. Wrap student code in async IIFE so top-level await works
        //    Student writes:  let r = await agent.scan()
        //    We wrap as:      return (async function() { let r = await agent.scan() })()
        var wrappedCode = shadowBlock + '\n' +
            'return (async function __studentMain() {\n' +
            '"use strict";\n' +
            guardedCode + '\n' +
            '})();';

        // 7. Build the sandboxed function
        var paramNames = Object.keys(sandbox);
        var paramValues = paramNames.map(function(k) { return sandbox[k]; });

        var sandboxedFn;
        try {
            /* jshint -W054 */  // Suppress "The Function constructor is a form of eval"
            sandboxedFn = new Function(paramNames.join(','), wrappedCode);
            /* jshint +W054 */
        } catch (syntaxError) {
            // Syntax errors are caught here (before execution)
            return {
                cmdCount: 0,
                error: formatError(syntaxError, code)
            };
        }

        // 8. Execute with timeout race
        try {
            await Promise.race([
                sandboxedFn.apply(null, paramValues),
                new Promise(function(_, reject) {
                    setTimeout(function() {
                        CANCEL_FLAG = true;  // signal cancellation
                        reject(new Error(
                            'Execution timeout (' + (TIMEOUT_MS / 1000) + 's). ' +
                            'Your code ran too long. Check for infinite loops.'
                        ));
                    }, TIMEOUT_MS);
                })
            ]);

            return {
                cmdCount: agentProxy.__getCmdCount(),
                error: null
            };
        } catch (runtimeError) {
            if (runtimeError instanceof StopExecution) {
                // Cancelled by user — not an error
                return { cmdCount: agentProxy.__getCmdCount(), error: null };
            }
            return {
                cmdCount: agentProxy.__getCmdCount(),
                error: formatError(runtimeError, code)
            };
        }
    }

    // ----------------------------------------------------------------
    //  PUBLIC API (mirrors OperatorInterpreter)
    // ----------------------------------------------------------------

    window.JsInterpreter = {

        /**
         * Run student JavaScript code in the sandbox.
         * Returns { cmdCount, error } where error is null on success.
         */
        run: async function(code, agentBridge, printFn) {
            CANCEL_FLAG = false;
            return execute(code, agentBridge, printFn);
        },

        /** Set the cancel flag to stop execution mid-run. */
        cancel: function() {
            CANCEL_FLAG = true;
        },

        /** Clear the cancel flag before a new run. */
        reset: function() {
            CANCEL_FLAG = false;
        }
    };

})();
