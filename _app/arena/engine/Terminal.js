/**
 * CTF ARENA — Terminal.js
 * Terminal emulator with virtual filesystem and custom commands.
 *
 * Provides a browser-based terminal for CTF arena boxes. Each box config
 * defines a virtual filesystem, available commands, and custom command
 * handlers. Students interact with the terminal to investigate scenarios,
 * run diagnostic commands, and capture flags.
 *
 * Architecture:
 *   ArenaTerminal.init(container, config, engine) → TerminalInstance
 *   - container: DOM element to render the terminal into
 *   - config: Box config with filesystem, terminal settings, custom commands
 *   - engine: BoxEngine instance for flag validation and state management
 *
 * Built-in commands: ls, cd, cat, pwd, whoami, clear, help, history
 * Custom commands: defined per-box in config.commands[]
 *
 * Virtual filesystem: config.filesystem defines directory tree as nested objects.
 * Files are strings (content), directories are objects (children).
 *
 * @module ArenaTerminal
 * @version 1.0.0
 */

const ArenaTerminal = {
    /** @type {TerminalInstance[]} Active terminal instances */
    _instances: [],

    /**
     * Create and initialize a new terminal instance.
     * @param {HTMLElement} container - DOM element for the terminal
     * @param {Object} config - Box configuration with filesystem and commands
     * @param {Object} engine - BoxEngine instance for state and flag validation
     * @returns {TerminalInstance} The initialized terminal
     */
    init(container, config, engine) {
        const term = new TerminalInstance(container, config, engine);
        this._instances.push(term);
        return term;
    }
};

class TerminalInstance {
    constructor(container, config, engine) {
        this.config = config;
        this.engine = engine;
        this.cwd = config.terminal?.startDir || '/home/kali';
        this.user = config.terminal?.user || 'kali';
        this.hostname = config.terminal?.hostname || 'kali';
        this.history = [];
        this.historyIndex = -1;
        this.fs = this._buildFS(config.filesystem || {});

        this._build(container);
        this._printWelcome();
    }

    // ────────────────────────────────────────────────
    // BUILD UI
    // ────────────────────────────────────────────────

    /** Build the terminal DOM: output area, input line, and event listeners */
    _build(container) {
        container.setAttribute('role', 'application');
        container.setAttribute('aria-label', 'Terminal emulator');

        this.outputEl = document.createElement('div');
        this.outputEl.className = 'terminal-output';
        this.outputEl.setAttribute('role', 'log');
        this.outputEl.setAttribute('aria-live', 'polite');
        this.outputEl.setAttribute('aria-label', 'Terminal output');

        const inputLine = document.createElement('div');
        inputLine.className = 'terminal-input-line';

        this.promptEl = document.createElement('span');
        this.promptEl.className = 'prompt';
        this.promptEl.setAttribute('aria-hidden', 'true');
        this._updatePrompt();

        this.inputEl = document.createElement('input');
        this.inputEl.type = 'text';
        this.inputEl.autocomplete = 'off';
        this.inputEl.spellcheck = false;
        this.inputEl.setAttribute('aria-label', 'Terminal command input');

        inputLine.appendChild(this.promptEl);
        inputLine.appendChild(this.inputEl);

        container.appendChild(this.outputEl);
        container.appendChild(inputLine);

        // Focus input when clicking anywhere in terminal
        container.addEventListener('click', () => this.inputEl.focus());

        // Key handlers
        this.inputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = this.inputEl.value;
                this.inputEl.value = '';
                // Fire-and-forget suits a keypress, but a rejected promise must not vanish: an async
                // handler that throws would otherwise leave the student at a prompt that did nothing.
                Promise.resolve(this._execute(cmd)).catch((err) => {
                    this._appendOutput('<span class="term-error">command failed: '
                        + String(err && err.message ? err.message : err) + '</span>');
                    this._scrollToBottom();
                });
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.historyIndex < this.history.length - 1) {
                    this.historyIndex++;
                    this.inputEl.value = this.history[this.history.length - 1 - this.historyIndex];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.historyIndex > 0) {
                    this.historyIndex--;
                    this.inputEl.value = this.history[this.history.length - 1 - this.historyIndex];
                } else {
                    this.historyIndex = -1;
                    this.inputEl.value = '';
                }
            } else if (e.key === 'Tab') {
                e.preventDefault();
                this._tabComplete();
            } else if (e.key === 'l' && e.ctrlKey) {
                e.preventDefault();
                this.outputEl.innerHTML = '';
            }
        });

        // Auto-focus
        setTimeout(() => this.inputEl.focus(), 100);
    }

    // ────────────────────────────────────────────────
    // FILESYSTEM
    // ────────────────────────────────────────────────

    /** Convert the flat filesystem config into a navigable directory tree */
    _buildFS(fsConfig) {
        // Deep clone the filesystem config
        return JSON.parse(JSON.stringify(fsConfig));
    }

    /** Resolve a relative or absolute path against the current working directory */
    _resolvePath(path) {
        // Expand ~ to the user's home dir so `cat ~/notes.txt`, `cd ~`, etc. work
        // for EVERY command (previously only `ls` expanded ~, so cat/head/find/cd
        // on a ~ path failed — walkthroughs use `cat ~/notes.txt`). Only touches
        // paths that start with ~, which otherwise always fail, so it cannot regress.
        if (path === '~') path = '/home/' + this.user;
        else if (path.startsWith('~/')) path = '/home/' + this.user + path.slice(1);
        if (!path.startsWith('/')) {
            path = this.cwd + '/' + path;
        }
        // Normalize: resolve . and ..
        const parts = path.split('/').filter(Boolean);
        const resolved = [];
        for (const part of parts) {
            if (part === '.') continue;
            if (part === '..') { resolved.pop(); continue; }
            resolved.push(part);
        }
        return '/' + resolved.join('/');
    }

    /** Traverse the filesystem tree and return the node at the given path */
    _getNode(path) {
        const resolved = this._resolvePath(path);
        if (resolved === '/') return this.fs['/'];

        const parts = resolved.split('/').filter(Boolean);
        let node = this.fs['/'];
        for (const part of parts) {
            if (!node || node.type !== 'dir' || !node.children || !node.children[part]) {
                return null;
            }
            node = node.children[part];
        }
        return node;
    }

    _checkPermission(node) {
        if (!node.owner) return true;
        if (node.owner === this.user) return true;
        if (this.engine.state.godMode) return true;
        return false;
    }

    // ────────────────────────────────────────────────
    // COMMAND EXECUTION
    // ────────────────────────────────────────────────

    /** Parse and execute a command line, dispatching to built-in or custom handlers */
    /* ASYNC, because a box custom command may be. Ten boxes (the whole nt1-nt010 dispatch
       networking series) declare async handlers that await a server call for their flag text.
       This dispatcher called them WITHOUT await, so `output` was a Promise, _appendOutput
       stringified it, and the student saw the literal text "[object Promise]" where the command
       output belonged. Reported by the operator after a whole class stalled on nt1: they fixed
       the network, ran the command the hint names, and the flag that should have been inside
       that output was replaced by that string.
       Worse than a blank line, because the `output === null` fall-through below can never fire
       for a Promise, so the built-in handler could not rescue it either. */
    async _execute(line, _suppressPrompt) {
        const trimmed = line.trim();
        // Print the command line (skipped for && sub-segments — prompt already shown)
        if (!_suppressPrompt) this._appendLine(this._getPromptText() + trimmed, 'term-cmd');

        if (!trimmed) {
            this._scrollToBottom();
            return;
        }

        // Add to history (top-level lines only, not && sub-segments)
        if (!_suppressPrompt) {
            this.history.push(trimmed);
            this.historyIndex = -1;
        }

        // ── && sequencing (opt-in via config.shellChaining) ──────────
        // Real shells run "A && B" left to right; the lab walkthroughs (and
        // students) use it heavily, e.g. `cd /opt/verify && ./check-alpha.sh`.
        // Opt-in ONLY: command-injection CTF boxes (e.g. a3-phantom-shell) pass
        // && through to a custom handler as an injection payload, so the engine
        // must leave it intact unless the box explicitly sets shellChaining: true.
        // The sim has no exit codes, so segments run in order (no short-circuit).
        if (this.config.shellChaining && !_suppressPrompt) {
            const andSegments = this._splitAndSegments(trimmed);
            if (andSegments.length > 1) {
                // Log the full typed line once; sub-segments suppress their own log.
                if (this.engine && this.engine._logEvent) {
                    this.engine._logEvent('command', {
                        cmd: trimmed,
                        type: 'chain',
                        phase: this.engine._classifyCommand ? this.engine._classifyCommand(trimmed) : 'OTHER'
                    });
                }
                /* Sequential, not forEach. Now that _execute is async, forEach would fire every segment
                   at once and `a && b && c` would race instead of chaining, which is the opposite of
                   what && means. */
                for (const seg of andSegments) { if (seg) await this._execute(seg, true); }
                this._scrollToBottom();
                return;
            }
        }

        // ── Pipe handling ─────────────────────────────────────────
        // Split on " | " outside quoted strings. If more than one
        // segment, run as a pipeline: each command's stdout becomes
        // the next command's stdin. Final result is printed.
        // Required for synthesis-formula commands like
        //   echo -n "..." | sha256sum | awk '{...}'
        // which the walkthrough teaches and students try literally.
        const segments = this._splitPipeSegments(trimmed);
        if (segments.length > 1) {
            let stdin = '';
            for (let i = 0; i < segments.length; i++) {
                stdin = await this._executeSegmentCapture(segments[i], stdin);
                if (stdin === null) return; // segment errored & printed
            }
            if (stdin) this._appendOutput(stdin);
            this._scrollToBottom();
            return;
        }

        // Parse command and args (single command, no pipe)
        const parts = this._parseLine(trimmed);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        // Check for box-defined custom commands first
        const customCommands = this.config.commands || {};
        const isCustom = !!customCommands[cmd];

        // Research instrumentation: log every command to BoxEngine event log
        // (&& sub-segments are suppressed — the full chained line is logged once
        // in the shellChaining branch above, so analytics see what was typed).
        if (!_suppressPrompt && this.engine && this.engine._logEvent) {
            this.engine._logEvent('command', {
                cmd: trimmed,
                type: isCustom ? 'custom' : 'builtin',
                phase: this.engine._classifyCommand ? this.engine._classifyCommand(trimmed) : 'OTHER'
            });
        }

        if (isCustom) {
            // Intercept --help for custom commands (but NOT -h — many tools use -h for host/hostname)
            if (args.includes('--help') || (args.length === 1 && args[0] === 'help')) {
                this._appendOutput(`Usage: ${cmd} [options] [arguments]\nType 'help' for a list of available commands.`);
                this._scrollToBottom();
                return;
            }
            const output = await customCommands[cmd](args, this, this.engine);
            // If custom command returns null, fall through to built-in handler
            // This allows context-aware overrides that defer to defaults when not in their context
            if (output === null) {
                // Fall through to built-in commands below
            } else {
                if (output) this._appendOutput(output);
                this._scrollToBottom();
                return;
            }
        }

        // Built-in commands
        switch (cmd) {
            case 'ls': this._cmdLs(args); break;
            case 'cd': this._cmdCd(args); break;
            case 'pwd': this._cmdPwd(); break;
            case 'cat': this._cmdCat(args); break;
            case 'head': this._cmdHead(args); break;
            case 'tail': this._cmdTail(args); break;
            case 'find': this._cmdFind(args); break;
            case 'whoami': this._appendOutput(this.user); break;
            case 'id': this._appendOutput(`uid=1000(${this.user}) gid=1000(${this.user}) groups=1000(${this.user}),27(sudo)`); break;
            case 'hostname': this._appendOutput(this.hostname); break;
            case 'uname': this._cmdUname(args); break;
            case 'file': this._cmdFile(args); break;
            case 'clear': this.outputEl.innerHTML = ''; break;
            case 'help': this._cmdHelp(); break;
            case 'history': this._cmdHistory(); break;
            case 'echo': this._appendOutput(args.join(' ')); break;
            case 'date': this._appendOutput(new Date().toString()); break;
            case 'export': this._appendOutput(''); break;
            case 'alias': this._appendOutput(''); break;
            case 'man': this._cmdMan(args); break;
            case 'sudo': this._appendError(`[sudo] password for ${this.user}: \nSorry, try again.`); break;
            case 'exit': this.engine.closeWindow('terminal'); break;
            case 'reset': this._cmdReset(); break;
            default:
                this._appendError(`${cmd}: command not found`);
        }

        this._scrollToBottom();
    }

    // ────────────────────────────────────────────────
    // PIPE PIPELINE — split a command line on " | " outside quoted
    // strings, then run each segment with the previous segment's
    // stdout as stdin. Supports `echo "x" | sha256sum`, sha256sum
    // hashing stdin instead of a file, and `awk '{...}'` with the
    // specific patterns the walkthroughs teach. Designed to make
    // the literal walkthrough commands work; not a full shell.
    // ────────────────────────────────────────────────

    /** Split a command line on top-level "&&" (outside quotes). Each returned
     *  segment is one command in an A && B && C chain. Quotes are preserved so
     *  the segment can be re-parsed by _parseLine. Used only when the box opts in
     *  via config.shellChaining (see _execute). */
    _splitAndSegments(line) {
        const segs = [];
        let cur = '', q = null;
        for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (q) { cur += c; if (c === q) q = null; continue; }   // inside a quote
            if (c === '"' || c === "'") { q = c; cur += c; continue; }
            if (c === '&' && line[i + 1] === '&') { segs.push(cur.trim()); cur = ''; i++; continue; }
            cur += c;
        }
        segs.push(cur.trim());
        return segs.filter(s => s.length > 0);
    }

    /** Split a command line on top-level pipe characters (outside quotes). */
    _splitPipeSegments(line) {
        const segments = [];
        let current = '';
        let quote = null;
        for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (quote) {
                current += c;
                if (c === quote) quote = null;
                continue;
            }
            if (c === '"' || c === "'") { quote = c; current += c; continue; }
            if (c === '|') {
                segments.push(current.trim());
                current = '';
                continue;
            }
            current += c;
        }
        if (current.trim()) segments.push(current.trim());
        return segments;
    }

    /** Run one pipe segment with provided stdin; return its stdout
     *  as a string, or null if a hard error already printed. */
    async _executeSegmentCapture(segmentLine, stdin) {
        const parts = this._parseLine(segmentLine);
        if (!parts.length) return stdin;
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        // Try custom box commands first (e.g. lab-registered sha256sum)
        const customCommands = this.config.commands || {};
        if (customCommands[cmd]) {
            // Make stdin available to the custom command via term._pipedStdin
            this._pipedStdin = stdin;
            try {
                const out = await customCommands[cmd](args, this, this.engine);
                if (out === null) {
                    // Fall through to builtin handlers
                } else {
                    return (typeof out === 'string' ? out : String(out || '')).replace(/\n$/, '');
                }
            } finally {
                this._pipedStdin = null;
            }
        }

        // Pipe-aware builtins:
        switch (cmd) {
            case 'echo': {
                // Strip leading -n flag (no trailing newline). For our
                // simple pipeline, output never carries a trailing newline
                // anyway — captured string only.
                let out = args;
                if (out[0] === '-n') out = out.slice(1);
                return out.join(' ');
            }
            case 'cat': {
                // cat with no args reads stdin
                if (args.length === 0) return stdin;
                // cat with file args: read each file's content
                const out = [];
                for (const a of args) {
                    const node = this._getNode(this._resolvePath(a));
                    if (node && node.type === 'file') out.push(node.content || '');
                }
                return out.join('\n');
            }
            case 'awk': {
                return this._awkOnStdin(args.join(' '), stdin);
            }
            case 'tr': {
                // Support common case: tr a-z A-Z (uppercase) or tr -d <char>
                if (args[0] === '-d' && args[1]) return stdin.split(args[1]).join('');
                if (args[0] && args[1]) {
                    // Very rough — only the upper-case case is common
                    if (args[0] === 'a-z' && args[1] === 'A-Z') return stdin.toUpperCase();
                    if (args[0] === 'A-Z' && args[1] === 'a-z') return stdin.toLowerCase();
                }
                return stdin;
            }
            case 'head': {
                const n = this._lineCountArg(args, 10);
                return stdin.split('\n').slice(0, n).join('\n');
            }
            case 'tail': {
                const n = this._lineCountArg(args, 10);
                return stdin.split('\n').slice(-n).join('\n');
            }
            case 'grep': {
                if (!args.length) return '';
                const pattern = args[args.length - 1];
                try {
                    const re = new RegExp(pattern);
                    return stdin.split('\n').filter(l => re.test(l)).join('\n');
                } catch { return ''; }
            }
            case 'wc': {
                const lines = stdin ? stdin.split('\n').length : 0;
                const words = stdin ? stdin.split(/\s+/).filter(Boolean).length : 0;
                const chars = stdin ? stdin.length : 0;
                if (args[0] === '-l') return String(lines);
                if (args[0] === '-w') return String(words);
                if (args[0] === '-c') return String(chars);
                return `    ${lines}    ${words}    ${chars}`;
            }
            case 'sort': {
                // Supports -r (reverse), -n (numeric), -h (human sizes: 4.2G > 892M).
                // Flags may be combined, e.g. `sort -rh` (used by `du -h | sort -rh`).
                const flags = args.filter(a => a.startsWith('-')).join('');
                const reverse = flags.includes('r');
                const human = flags.includes('h');
                const numeric = flags.includes('n');
                const sizeToBytes = (s) => {
                    const m = String(s).trim().match(/^([\d.]+)\s*([KMGT])?/i);
                    if (!m) return -Infinity;
                    const mult = { K: 1e3, M: 1e6, G: 1e9, T: 1e12 }[(m[2] || '').toUpperCase()] || 1;
                    return parseFloat(m[1]) * mult;
                };
                let lines = (stdin || '').split('\n').filter(l => l.length > 0);
                if (human) lines.sort((a, b) => sizeToBytes(a) - sizeToBytes(b));
                else if (numeric) lines.sort((a, b) => parseFloat(a) - parseFloat(b));
                else lines.sort();
                if (reverse) lines.reverse();
                return lines.join('\n');
            }
        }

        // Unknown command in a pipeline — error out
        this._appendError(`${cmd}: command not found`);
        return null;
    }

    /** Minimal awk implementation — supports the few patterns the
     *  PIS-final walkthrough teaches. Most importantly:
     *    awk '{print toupper(substr($1,1,16))}'
     *  Returns first field of stdin, first 16 chars, upper case. */
    _awkOnStdin(programArg, stdin) {
        // Strip surrounding quotes
        let prog = programArg.trim();
        if ((prog.startsWith("'") && prog.endsWith("'")) ||
            (prog.startsWith('"') && prog.endsWith('"'))) {
            prog = prog.slice(1, -1);
        }
        // Split stdin into lines (sha256sum output is typically one line)
        const lines = (stdin || '').split('\n').filter(Boolean);
        const out = [];
        for (const line of lines) {
            const fields = line.split(/\s+/).filter(Boolean);
            // toupper(substr($1, 1, 16))
            let m = prog.match(/print\s+toupper\s*\(\s*substr\s*\(\s*\$(\d+)\s*,\s*1\s*,\s*(\d+)\s*\)\s*\)/);
            if (m) {
                const f = fields[parseInt(m[1], 10) - 1] || '';
                out.push(f.slice(0, parseInt(m[2], 10)).toUpperCase());
                continue;
            }
            // toupper($N)
            m = prog.match(/print\s+toupper\s*\(\s*\$(\d+)\s*\)/);
            if (m) { out.push((fields[parseInt(m[1], 10) - 1] || '').toUpperCase()); continue; }
            // substr($N, 1, K) — no toupper
            m = prog.match(/print\s+substr\s*\(\s*\$(\d+)\s*,\s*1\s*,\s*(\d+)\s*\)/);
            if (m) {
                const f = fields[parseInt(m[1], 10) - 1] || '';
                out.push(f.slice(0, parseInt(m[2], 10)));
                continue;
            }
            // {print $N}
            m = prog.match(/print\s+\$(\d+)/);
            if (m) { out.push(fields[parseInt(m[1], 10) - 1] || ''); continue; }
            // {print} or {print $0}
            if (/print\s*(\$0)?\s*\}?$/.test(prog)) { out.push(line); continue; }
            // Unknown pattern — pass through
            out.push(line);
        }
        return out.join('\n');
    }

    /** Parse a command line into tokens, respecting quoted strings */
    _parseLine(line) {
        // Simple argument parsing (handles basic quoting)
        const parts = [];
        let current = '';
        let inQuote = null;

        for (let i = 0; i < line.length; i++) {
            const ch = line[i];
            if (inQuote) {
                if (ch === inQuote) { inQuote = null; }
                else { current += ch; }
            } else if (ch === '"' || ch === "'") {
                inQuote = ch;
            } else if (ch === ' ') {
                if (current) { parts.push(current); current = ''; }
            } else {
                current += ch;
            }
        }
        if (current) parts.push(current);
        return parts;
    }

    // ────────────────────────────────────────────────
    // BUILT-IN COMMANDS
    // ────────────────────────────────────────────────

    /** List directory contents with optional -l (long) and -a (hidden) flags */
    _cmdLs(args) {
        let path = this.cwd;
        let showAll = false;
        let longFormat = false;

        for (const arg of args) {
            if (arg === '-a' || arg === '-la' || arg === '-al') showAll = true;
            if (arg === '-l' || arg === '-la' || arg === '-al') longFormat = true;
            if (!arg.startsWith('-')) path = arg;
        }

        const node = this._getNode(path);
        if (!node) { this._appendError(`ls: cannot access '${path}': No such file or directory`); return; }
        if (node.type !== 'dir') {
            this._appendOutput(path.split('/').pop());
            return;
        }

        const entries = Object.keys(node.children || {});
        if (!showAll) {
            // Filter hidden files
        }

        if (longFormat) {
            const lines = entries.map(name => {
                const child = node.children[name];
                const type = child.type === 'dir' ? 'd' : '-';
                const perms = child.owner === 'root' ? 'rw-r-----' : 'rw-r--r--';
                const owner = child.owner || this.user;
                const size = child.content ? child.content.length : 4096;
                const color = child.type === 'dir' ? 'term-info' : '';
                return `<span class="${color}">${type}${perms}  1 ${owner}  ${owner}  ${String(size).padStart(6)}  ${name}</span>`;
            });
            this._appendHtml(lines.join('\n'));
        } else {
            const colored = entries.map(name => {
                const child = node.children[name];
                if (child.type === 'dir') return `<span class="term-info">${name}/</span>`;
                return name;
            });
            this._appendHtml(colored.join('  '));
        }
    }

    /** Change the current working directory */
    _cmdCd(args) {
        let target = args[0] || '/home/' + this.user;

        if (target === '~') target = '/home/' + this.user;
        if (target.startsWith('~/')) target = '/home/' + this.user + target.slice(1);

        const resolved = this._resolvePath(target);
        const node = this._getNode(resolved);

        if (!node) { this._appendError(`cd: ${target}: No such file or directory`); return; }
        if (node.type !== 'dir') { this._appendError(`cd: ${target}: Not a directory`); return; }

        this.cwd = resolved;
        this._updatePrompt();
    }

    _cmdPwd() {
        this._appendOutput(this.cwd);
    }

    /** Display file contents to the terminal output */
    _cmdCat(args) {
        if (!args.length) { this._appendError('cat: missing operand'); return; }

        for (const arg of args) {
            if (arg.startsWith('-')) continue;
            const node = this._getNode(arg);
            if (!node) { this._appendError(`cat: ${arg}: No such file or directory`); continue; }
            if (node.type === 'dir') { this._appendError(`cat: ${arg}: Is a directory`); continue; }
            if (!this._checkPermission(node)) {
                this._appendError(`cat: ${arg}: Permission denied`);
                continue;
            }
            this._appendOutput(node.content || '');
        }
    }

    /**
     * Parse a head/tail line-count argument, supporting all three real-world forms:
     *   `-n N` (spaced), `-nN` (attached to -n), and `-N` (bare number).
     * Returns `def` when no valid count flag is present. Used by both the pipe-path
     * head/tail (in _executeSegmentCapture) and the non-pipe _cmdHead/_cmdTail so a
     * walkthrough's `grep ... | head -5` and a sample's `head -n 30 FILE` both work.
     */
    _lineCountArg(args, def) {
        let n = def;
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-n' && args[i + 1] != null) { n = parseInt(args[i + 1], 10); i++; }
            else if (/^-n\d+$/.test(a)) { n = parseInt(a.slice(2), 10); }
            else if (/^-\d+$/.test(a)) { n = parseInt(a.slice(1), 10); }
        }
        if (!Number.isFinite(n) || n < 0) n = def;
        return n;
    }

    /** Return the file operands from head/tail args (everything that isn't a flag/count). */
    _fileOperands(args) {
        const files = [];
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (a === '-n' && args[i + 1] != null) { i++; continue; }   // consume `-n N`
            if (a.startsWith('-')) continue;                            // skip `-n5`, `-5`, other flags
            files.push(a);
        }
        return files;
    }

    _cmdHead(args) {
        const n = this._lineCountArg(args, 10);
        for (const f of this._fileOperands(args)) {
            const node = this._getNode(f);
            if (!node) { this._appendError(`head: ${f}: No such file or directory`); continue; }
            if (!this._checkPermission(node)) { this._appendError(`head: ${f}: Permission denied`); continue; }
            const lines = (node.content || '').split('\n').slice(0, n);
            this._appendOutput(lines.join('\n'));
        }
    }

    _cmdTail(args) {
        const n = this._lineCountArg(args, 10);
        for (const f of this._fileOperands(args)) {
            const node = this._getNode(f);
            if (!node) { this._appendError(`tail: ${f}: No such file or directory`); continue; }
            if (!this._checkPermission(node)) { this._appendError(`tail: ${f}: Permission denied`); continue; }
            const lines = (node.content || '').split('\n');
            this._appendOutput(lines.slice(-n).join('\n'));
        }
    }

    /** Search the filesystem tree for files matching a name pattern */
    _cmdFind(args) {
        let startPath = '.';
        let namePattern = null;

        for (let i = 0; i < args.length; i++) {
            if (args[i] === '-name' && args[i+1]) { namePattern = args[i+1]; i++; }
            else if (!args[i].startsWith('-')) { startPath = args[i]; }
        }

        const resolved = this._resolvePath(startPath);
        const results = [];

        const walk = (path, node) => {
            if (!node) return;
            const name = path.split('/').pop() || '/';
            if (!namePattern || this._matchGlob(name, namePattern)) {
                results.push(path);
            }
            if (node.type === 'dir' && node.children) {
                for (const [childName, childNode] of Object.entries(node.children)) {
                    walk(path === '/' ? '/' + childName : path + '/' + childName, childNode);
                }
            }
        };

        const startNode = this._getNode(resolved);
        if (!startNode) { this._appendError(`find: '${startPath}': No such file or directory`); return; }
        walk(resolved, startNode);
        this._appendOutput(results.join('\n'));
    }

    _matchGlob(name, pattern) {
        const regex = new RegExp('^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
        return regex.test(name);
    }

    _cmdFile(args) {
        for (const arg of args) {
            if (arg.startsWith('-')) continue;
            const node = this._getNode(arg);
            if (!node) { this._appendOutput(`${arg}: cannot open (No such file or directory)`); continue; }
            if (node.type === 'dir') { this._appendOutput(`${arg}: directory`); continue; }
            const ext = arg.split('.').pop();
            const types = { txt: 'ASCII text', sh: 'Bourne-Again shell script', py: 'Python script', conf: 'ASCII text', log: 'ASCII text' };
            this._appendOutput(`${arg}: ${types[ext] || 'data'}`);
        }
    }

    _cmdUname(args) {
        if (args.includes('-a')) {
            this._appendOutput('Linux kali 6.1.0-kali9-amd64 #1 SMP PREEMPT_DYNAMIC Debian 6.1.27-1kali1 x86_64 GNU/Linux');
        } else {
            this._appendOutput('Linux');
        }
    }

    _cmdHelp() {
        const builtins = ['ls', 'cd', 'pwd', 'cat', 'head', 'tail', 'find', 'whoami', 'id', 'file', 'echo', 'clear', 'help', 'history', 'exit'];
        const customs = Object.keys(this.config.commands || {});

        let output = '<span class="term-info">Built-in commands:</span>\n  ' + builtins.join(', ');
        if (customs.length) {
            output += '\n\n<span class="term-info">Available tools:</span>\n  ' + customs.join(', ');
        }
        this._appendHtml(output);
    }

    _cmdMan(args) {
        if (!args[0]) {
            this._appendOutput('What manual page do you want?\nUsage: man <command>');
            return;
        }
        const topic = args[0].toLowerCase();
        const customs = Object.keys(this.config.commands || {});
        const builtins = ['ls', 'cd', 'pwd', 'cat', 'head', 'tail', 'find', 'whoami', 'id', 'file', 'echo', 'clear', 'help', 'history', 'exit', 'hostname', 'uname', 'date', 'man'];

        if (customs.includes(topic)) {
            this._appendOutput(`${topic.toUpperCase()}(1)\n\nNAME\n    ${topic} - available in this environment\n\nSYNOPSIS\n    ${topic} [options] [arguments]\n\nDESCRIPTION\n    Run '${topic} --help' for usage information.\n    Type 'help' to see all available commands.`);
        } else if (builtins.includes(topic)) {
            this._appendOutput(`${topic.toUpperCase()}(1)\n\nNAME\n    ${topic} - shell builtin\n\nSYNOPSIS\n    ${topic} [arguments]\n\nDESCRIPTION\n    Built-in shell command. Type 'help' for command list.`);
        } else {
            this._appendOutput(`No manual entry for ${topic}`);
        }
    }

    _cmdHistory() {
        const lines = this.history.map((cmd, i) => `  ${String(i + 1).padStart(4)}  ${cmd}`);
        this._appendOutput(lines.join('\n'));
    }

    _cmdReset() {
        this.engine.reset();
    }

    // ────────────────────────────────────────────────
    // TAB COMPLETION
    // ────────────────────────────────────────────────

    /** Handle Tab key: auto-complete commands and file/directory names */
    _tabComplete() {
        const line = this.inputEl.value;
        const parts = line.split(' ');
        const partial = parts[parts.length - 1] || '';

        if (parts.length <= 1) {
            // Complete commands
            const builtins = ['ls', 'cd', 'pwd', 'cat', 'head', 'tail', 'find', 'whoami', 'id', 'file', 'echo', 'clear', 'help', 'history', 'exit', 'hostname', 'uname', 'date'];
            const customs = Object.keys(this.config.commands || {});
            const all = [...builtins, ...customs];
            const matches = all.filter(c => c.startsWith(partial));
            if (matches.length === 1) {
                this.inputEl.value = matches[0] + ' ';
            } else if (matches.length > 1) {
                this._appendOutput(matches.join('  '));
            }
            return;
        }

        // Complete file/directory paths
        let dirPath, prefix;
        const lastSlash = partial.lastIndexOf('/');
        if (lastSlash >= 0) {
            dirPath = partial.slice(0, lastSlash) || '/';
            prefix = partial.slice(lastSlash + 1);
        } else {
            dirPath = this.cwd;
            prefix = partial;
        }

        const node = this._getNode(dirPath);
        if (!node || node.type !== 'dir') return;

        const matches = Object.keys(node.children || {}).filter(n => n.startsWith(prefix));
        if (matches.length === 1) {
            const match = matches[0];
            const child = node.children[match];
            const suffix = child.type === 'dir' ? '/' : ' ';
            parts[parts.length - 1] = (lastSlash >= 0 ? partial.slice(0, lastSlash + 1) : '') + match + suffix;
            this.inputEl.value = parts.join(' ');
        } else if (matches.length > 1) {
            this._appendOutput(matches.join('  '));
        }
    }

    // ────────────────────────────────────────────────
    // OUTPUT HELPERS
    // ────────────────────────────────────────────────

    _getPromptText() {
        // Custom prompt override — set by box configs for context switching
        if (this._customPrompt) return this._customPrompt;
        if (this.config.terminal?.promptStyle === 'windows') {
            return `${this.cwd}>`;
        }
        const shortCwd = this.cwd.replace('/home/' + this.user, '~');
        return `${this.user}@${this.hostname}:${shortCwd}$ `;
    }

    _updatePrompt() {
        if (this.promptEl) {
            this.promptEl.textContent = this._getPromptText();
        }
    }

    _printWelcome() {
        const welcome = this.config.terminal?.welcome ||
            `Linux ${this.hostname} 6.1.0-kali9-amd64\nType 'help' for available commands.\n`;
        this._appendHtml(`<span class="term-info">${welcome.replace(/\n/g, '<br>')}</span>`);
    }

    _appendLine(text, cls) {
        const line = document.createElement('div');
        if (cls) line.className = cls;
        line.textContent = text;
        this.outputEl.appendChild(line);
    }

    /** Append text to the terminal output area (supports HTML via innerHTML) */
    _appendOutput(text) {
        if (!text && text !== '') return;
        // SEC-2: Resolve {{FLAG:id}} tokens via engine
        if (this.engine && this.engine.resolveFlagTokens) {
            text = this.engine.resolveFlagTokens(text);
        }
        const line = document.createElement('div');
        line.className = 'term-output';
        line.textContent = text;
        this.outputEl.appendChild(line);
    }

    /** Append an error message (red text) to the terminal output */
    _appendError(text) {
        const line = document.createElement('div');
        line.className = 'term-error';
        line.textContent = text;
        this.outputEl.appendChild(line);
    }

    _appendHtml(html) {
        // SEC-2: Resolve {{FLAG:id}} tokens via engine
        if (this.engine && this.engine.resolveFlagTokens) {
            html = this.engine.resolveFlagTokens(html);
        }
        const line = document.createElement('div');
        line.className = 'term-output';
        line.innerHTML = html;
        this.outputEl.appendChild(line);
    }

    _scrollToBottom() {
        this.outputEl.scrollTop = this.outputEl.scrollHeight;
    }
}
