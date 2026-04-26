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
                this._execute(cmd);
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
    _execute(line) {
        const trimmed = line.trim();
        // Print the command line
        this._appendLine(this._getPromptText() + trimmed, 'term-cmd');

        if (!trimmed) {
            this._scrollToBottom();
            return;
        }

        // Add to history
        this.history.push(trimmed);
        this.historyIndex = -1;

        // Parse command and args
        const parts = this._parseLine(trimmed);
        const cmd = parts[0].toLowerCase();
        const args = parts.slice(1);

        // Check for box-defined custom commands first
        const customCommands = this.config.commands || {};
        const isCustom = !!customCommands[cmd];

        // Research instrumentation: log every command to BoxEngine event log
        if (this.engine && this.engine._logEvent) {
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
            const output = customCommands[cmd](args, this, this.engine);
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

    _cmdHead(args) {
        let n = 10;
        const files = [];
        for (const arg of args) {
            if (arg.startsWith('-n')) { n = parseInt(arg.slice(2)) || 10; }
            else if (arg.startsWith('-') && !isNaN(parseInt(arg.slice(1)))) { n = parseInt(arg.slice(1)); }
            else { files.push(arg); }
        }
        for (const f of files) {
            const node = this._getNode(f);
            if (!node) { this._appendError(`head: ${f}: No such file or directory`); continue; }
            if (!this._checkPermission(node)) { this._appendError(`head: ${f}: Permission denied`); continue; }
            const lines = (node.content || '').split('\n').slice(0, n);
            this._appendOutput(lines.join('\n'));
        }
    }

    _cmdTail(args) {
        let n = 10;
        const files = [];
        for (const arg of args) {
            if (arg.startsWith('-n')) { n = parseInt(arg.slice(2)) || 10; }
            else if (arg.startsWith('-') && !isNaN(parseInt(arg.slice(1)))) { n = parseInt(arg.slice(1)); }
            else { files.push(arg); }
        }
        for (const f of files) {
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
