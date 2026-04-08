/* ═══════════════════════════════════════════════════════════════════
   C2Terminal.js — Hybrid Collapsible Handler Widget
   ═══════════════════════════════════════════════════════════════════
   An in-browser encrypted-channel simulator for multi-device CTF
   operations. Renders as a collapsible corner widget that expands
   into a sidebar chat panel. Persists state across device pages
   via sessionStorage (Firestore integration in Phase 2).

   Usage:
     C2Terminal.init({
         operationId: 'blackwire',
         storageKey:  'hexworth_c2_blackwire',
         handler:     { callsign: 'HANDLER', accent: '#10b981' },
         student:     { callsign: 'OPERATIVE' },
         narrative:   [ ... ],   // see NarrativeConfig below
         devices:     [ ... ],   // device unlock order
         flags:       { ... },   // flag definitions
         hints:       { ... },   // hint text per flag
         onFlagSubmit: fn,       // callback for flag validation
         onDeviceUnlock: fn      // callback when device becomes active
     });

   NarrativeConfig entry:
     { trigger: 'connect',                message: '...' }
     { trigger: 'flag',  flagId: 'f1',    message: '...' }
     { trigger: 'flags', count: 2,        message: '...' }
     { trigger: 'allFlags', device: 'gw', message: '...' }
     { trigger: 'intel', time: 300000,    message: '...' }   // ms after connect
     { trigger: 'pressure',              message: '...' }

   ═══════════════════════════════════════════════════════════════════ */

const C2Terminal = (() => {
    'use strict';

    /* ── State ────────────────────────────────────────────────── */
    let _cfg      = null;
    let _el       = null;   // root widget element
    let _chat     = null;   // message container
    let _input    = null;   // input field
    let _badge    = null;   // notification badge
    let _expanded = false;
    let _connected = false;
    let _unread   = 0;
    let _history  = [];     // command history
    let _histIdx  = -1;
    let _messages = [];     // persisted chat log
    let _flagsFound = [];
    let _startTime  = null;
    let _hintCount  = 0;
    let _intelDropped = {};
    let _pressureFired = false;
    let _devicesUnlocked = [];
    let _intelTimers = [];
    let _encryptInterval = null;

    /* ── Constants ────────────────────────────────────────────── */
    const ENCRYPT_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    const TYPE_SPEED    = 18;  // ms per char for handler messages
    const WIDGET_SIZE   = 52;

    /* ── Public API ──────────────────────────────────────────── */

    function init(cfg) {
        _cfg = cfg;
        _loadState();
        _render();
        _bindKeys();
        if (_connected) _restoreChat();
        if (_connected) _startIntelTimers();
    }

    function destroy() {
        _intelTimers.forEach(t => clearTimeout(t));
        _intelTimers = [];
        if (_encryptInterval) { clearInterval(_encryptInterval); _encryptInterval = null; }
        if (_el && _el.parentNode) _el.parentNode.removeChild(_el);
        _el = null;
    }

    /** Externally submit a flag (e.g. from BoxEngine) */
    function submitFlag(flagId) {
        if (_flagsFound.includes(flagId)) return;
        _flagsFound.push(flagId);
        _saveState();
        _checkNarrativeTriggers('flag', flagId);
    }

    /** External: get flags found */
    function getFlags() { return _flagsFound.slice(); }

    /** External: check if device is unlocked */
    function isDeviceUnlocked(deviceId) {
        if (!_cfg || !_cfg.devices) return true;
        const dev = _cfg.devices.find(d => d.id === deviceId);
        if (!dev) return true;
        if (!dev.requireFlags) return true;
        return dev.requireFlags.every(f => _flagsFound.includes(f));
    }

    /** Push a handler message externally */
    function handlerMessage(text) {
        _addMessage('handler', text);
    }

    /** Fire pressure event externally */
    function firePressure() {
        if (_pressureFired) return;
        _pressureFired = true;
        _saveState();
        _checkNarrativeTriggers('pressure');
    }

    /* ── Rendering ───────────────────────────────────────────── */

    function _render() {
        if (_el) _el.remove();

        _el = document.createElement('div');
        _el.id = 'c2-terminal-widget';
        _el.innerHTML = `
            <div class="c2-collapsed" id="c2-collapsed">
                <div class="c2-icon">
                    <img src="/assets/images/icons/icon-radar.webp" alt="" width="24" height="24">
                </div>
                <div class="c2-badge" id="c2-badge" style="display:none">0</div>
                <div class="c2-pulse"></div>
            </div>
            <div class="c2-panel" id="c2-panel" style="display:none">
                <div class="c2-panel-header">
                    <div class="c2-panel-title">
                        <img src="/assets/images/icons/icon-lock.webp" alt="" width="14" height="14">
                        <span>SECURE CHANNEL</span>
                        <span class="c2-encrypt-anim" id="c2-encrypt"></span>
                    </div>
                    <div class="c2-panel-controls">
                        <button class="c2-btn-minimize" id="c2-minimize" title="Minimize">_</button>
                    </div>
                </div>
                <div class="c2-chat" id="c2-chat"></div>
                <div class="c2-input-wrap">
                    <span class="c2-prompt">&gt;</span>
                    <input type="text" id="c2-input" class="c2-input"
                           placeholder="Type /help for commands..."
                           autocomplete="off" spellcheck="false">
                </div>
            </div>
        `;

        _injectStyles();
        document.body.appendChild(_el);

        _chat  = _el.querySelector('#c2-chat');
        _input = _el.querySelector('#c2-input');
        _badge = _el.querySelector('#c2-badge');

        // Bind events
        _el.querySelector('#c2-collapsed').addEventListener('click', _expand);
        _el.querySelector('#c2-minimize').addEventListener('click', _collapse);
        _input.addEventListener('keydown', _onKeyDown);

        // Encryption animation
        _runEncryptAnim();

        // Scroll tracking — keep widget pinned to viewport bottom-right
        _updatePosition();
        window.addEventListener('scroll', _updatePosition, { passive: true });
        window.addEventListener('resize', _updatePosition, { passive: true });
    }

    function _updatePosition() {
        if (!_el) return;
        _el.style.top = (window.scrollY + window.innerHeight - (_expanded ? 520 : 72)) + 'px';
        _el.style.left = (window.scrollX + window.innerWidth - (_expanded ? 400 : 72)) + 'px';
        _el.style.bottom = 'auto';
        _el.style.right = 'auto';
    }

    function _injectStyles() {
        if (document.getElementById('c2-terminal-styles')) return;
        const style = document.createElement('style');
        style.id = 'c2-terminal-styles';
        style.textContent = `
            /* ── C2 Widget Container ──────────────────────── */
            #c2-terminal-widget {
                position: absolute;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                font-family: 'Courier New', Courier, monospace;
            }

            /* ── Collapsed State (corner icon) ───────────── */
            .c2-collapsed {
                width: ${WIDGET_SIZE}px;
                height: ${WIDGET_SIZE}px;
                border-radius: 50%;
                background: #0a0d14;
                border: 2px solid #1e3a2f;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                position: relative;
                transition: border-color 0.3s, box-shadow 0.3s;
                box-shadow: 0 2px 12px rgba(0,0,0,0.5);
            }
            .c2-collapsed:hover {
                border-color: #10b981;
                box-shadow: 0 0 20px rgba(16,185,129,0.3);
            }
            .c2-icon { display: flex; align-items: center; justify-content: center; }
            .c2-icon img { filter: brightness(0.8); transition: filter 0.2s; }
            .c2-collapsed:hover .c2-icon img { filter: brightness(1.2); }

            /* Notification badge */
            .c2-badge {
                position: absolute;
                top: -4px;
                right: -4px;
                background: #ef4444;
                color: #fff;
                font-size: 0.65rem;
                font-weight: bold;
                min-width: 18px;
                height: 18px;
                border-radius: 9px;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 4px;
                box-shadow: 0 1px 4px rgba(0,0,0,0.4);
                animation: c2-badge-pop 0.3s ease-out;
            }
            @keyframes c2-badge-pop {
                0% { transform: scale(0); }
                70% { transform: scale(1.2); }
                100% { transform: scale(1); }
            }

            /* Pulse ring for new messages */
            .c2-pulse {
                position: absolute;
                inset: -4px;
                border-radius: 50%;
                border: 2px solid rgba(16,185,129,0.4);
                animation: c2-pulse-ring 2s ease-out infinite;
                pointer-events: none;
                display: none;
            }
            .c2-collapsed.has-unread .c2-pulse { display: block; }
            @keyframes c2-pulse-ring {
                0% { transform: scale(1); opacity: 1; }
                100% { transform: scale(1.5); opacity: 0; }
            }

            /* ── Expanded Panel ──────────────────────────── */
            .c2-panel {
                width: 380px;
                height: 500px;
                background: #0a0d14;
                border: 1px solid #1e3a2f;
                border-radius: 8px;
                display: flex;
                flex-direction: column;
                box-shadow: 0 4px 24px rgba(0,0,0,0.6);
                animation: c2-slide-up 0.25s ease-out;
                overflow: hidden;
            }
            @keyframes c2-slide-up {
                from { opacity: 0; transform: translateY(20px); }
                to   { opacity: 1; transform: translateY(0); }
            }

            /* Panel header */
            .c2-panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 14px;
                background: #0d1117;
                border-bottom: 1px solid #1e3a2f;
                flex-shrink: 0;
            }
            .c2-panel-title {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #10b981;
                font-size: 0.7rem;
                font-weight: bold;
                letter-spacing: 0.15em;
                text-transform: uppercase;
            }
            .c2-encrypt-anim {
                color: #1e3a2f;
                font-size: 0.6rem;
                font-family: monospace;
                overflow: hidden;
                max-width: 100px;
            }
            .c2-panel-controls { display: flex; gap: 6px; }
            .c2-btn-minimize {
                background: none;
                border: 1px solid #1e3a2f;
                color: #4b5563;
                width: 24px;
                height: 24px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.7rem;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: color 0.2s, border-color 0.2s;
            }
            .c2-btn-minimize:hover { color: #e5e7eb; border-color: #374151; }

            /* Chat area */
            .c2-chat {
                flex: 1;
                overflow-y: auto;
                padding: 12px 14px;
                display: flex;
                flex-direction: column;
                gap: 8px;
                scrollbar-width: thin;
                scrollbar-color: #1e3a2f transparent;
            }
            .c2-chat::-webkit-scrollbar { width: 4px; }
            .c2-chat::-webkit-scrollbar-thumb { background: #1e3a2f; border-radius: 2px; }

            /* Messages */
            .c2-msg {
                font-size: 0.78rem;
                line-height: 1.5;
                color: #c9d1d9;
                word-break: break-word;
            }
            .c2-msg-handler {
                border-left: 2px solid #10b981;
                padding-left: 10px;
            }
            .c2-msg-handler .c2-msg-sender {
                color: #10b981;
                font-weight: bold;
                font-size: 0.7rem;
                letter-spacing: 0.05em;
                margin-bottom: 2px;
            }
            .c2-msg-student {
                border-left: 2px solid #3b82f6;
                padding-left: 10px;
            }
            .c2-msg-student .c2-msg-sender {
                color: #3b82f6;
                font-weight: bold;
                font-size: 0.7rem;
                letter-spacing: 0.05em;
                margin-bottom: 2px;
            }
            .c2-msg-system {
                color: #6b7280;
                font-style: italic;
                font-size: 0.72rem;
                text-align: center;
                padding: 4px 0;
            }
            .c2-msg-success {
                border-left: 2px solid #22c55e;
                padding-left: 10px;
                color: #22c55e;
            }
            .c2-msg-error {
                border-left: 2px solid #ef4444;
                padding-left: 10px;
                color: #ef4444;
            }
            .c2-msg-intel {
                border-left: 2px solid #f59e0b;
                padding-left: 10px;
                background: rgba(245, 158, 11, 0.05);
                padding: 6px 10px;
                border-radius: 0 4px 4px 0;
            }
            .c2-msg-intel .c2-msg-sender {
                color: #f59e0b;
                font-weight: bold;
                font-size: 0.7rem;
            }

            /* Typing indicator */
            .c2-typing {
                display: flex;
                gap: 4px;
                padding: 4px 0;
                align-items: center;
            }
            .c2-typing-dot {
                width: 5px;
                height: 5px;
                background: #10b981;
                border-radius: 50%;
                animation: c2-typing-bounce 1.2s infinite;
            }
            .c2-typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .c2-typing-dot:nth-child(3) { animation-delay: 0.4s; }
            @keyframes c2-typing-bounce {
                0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
                40% { transform: translateY(-4px); opacity: 1; }
            }

            /* Input area */
            .c2-input-wrap {
                display: flex;
                align-items: center;
                padding: 8px 14px;
                background: #0d1117;
                border-top: 1px solid #1e3a2f;
                gap: 6px;
                flex-shrink: 0;
            }
            .c2-prompt {
                color: #10b981;
                font-weight: bold;
                font-size: 0.85rem;
            }
            .c2-input {
                flex: 1;
                background: none;
                border: none;
                color: #e5e7eb;
                font-family: 'Courier New', Courier, monospace;
                font-size: 0.8rem;
                outline: none;
                caret-color: #10b981;
            }
            .c2-input::placeholder { color: #374151; }

            /* Mobile */
            @media (max-width: 480px) {
                .c2-panel {
                    width: calc(100vw - 20px);
                    height: 60vh;
                }
            }
        `;
        document.head.appendChild(style);
    }

    /* ── Expand / Collapse ───────────────────────────────────── */

    function _expand() {
        _expanded = true;
        _unread = 0;
        _badge.style.display = 'none';
        _el.querySelector('#c2-collapsed').style.display = 'none';
        _el.querySelector('#c2-collapsed').classList.remove('has-unread');
        _el.querySelector('#c2-panel').style.display = 'flex';
        _updatePosition();
        _input.focus();
        _scrollToBottom();
    }

    function _collapse() {
        _expanded = false;
        _el.querySelector('#c2-panel').style.display = 'none';
        _el.querySelector('#c2-collapsed').style.display = 'flex';
        _updatePosition();
    }

    /* ── Encryption Animation ────────────────────────────────── */

    function _runEncryptAnim() {
        const el = _el.querySelector('#c2-encrypt');
        if (!el) return;
        let str = '';
        _encryptInterval = setInterval(() => {
            str = '';
            for (let i = 0; i < 12; i++) {
                str += ENCRYPT_CHARS[Math.floor(Math.random() * ENCRYPT_CHARS.length)];
            }
            el.textContent = str;
        }, 150);
    }

    /* ── Chat Messages ───────────────────────────────────────── */

    function _addMessage(type, text, skipSave) {
        const entry = { type, text, time: Date.now() };
        _messages.push(entry);
        if (!skipSave) _saveState();

        if (type === 'handler' || type === 'intel') {
            _showTypingThenMessage(entry);
        } else {
            _renderMessage(entry);
            _scrollToBottom();
        }

        // Update badge if collapsed
        if (!_expanded && type !== 'student') {
            _unread++;
            _badge.textContent = _unread;
            _badge.style.display = 'flex';
            _el.querySelector('#c2-collapsed').classList.add('has-unread');
        }
    }

    function _showTypingThenMessage(entry) {
        // Show typing indicator
        const typing = document.createElement('div');
        typing.className = 'c2-typing';
        typing.innerHTML = '<div class="c2-typing-dot"></div><div class="c2-typing-dot"></div><div class="c2-typing-dot"></div>';
        _chat.appendChild(typing);
        _scrollToBottom();

        const delay = Math.min(entry.text.length * TYPE_SPEED, 2000);
        setTimeout(() => {
            typing.remove();
            _renderMessage(entry);
            _scrollToBottom();
        }, delay);
    }

    function _renderMessage(entry) {
        const div = document.createElement('div');

        switch (entry.type) {
            case 'handler':
                div.className = 'c2-msg c2-msg-handler';
                div.innerHTML = `<div class="c2-msg-sender">${_cfg.handler.callsign}</div><div>${_formatText(entry.text)}</div>`;
                break;
            case 'student':
                div.className = 'c2-msg c2-msg-student';
                div.innerHTML = `<div class="c2-msg-sender">${_cfg.student.callsign}</div><div>${_escHtml(entry.text)}</div>`;
                break;
            case 'system':
                div.className = 'c2-msg c2-msg-system';
                div.textContent = entry.text;
                break;
            case 'success':
                div.className = 'c2-msg c2-msg-success';
                div.innerHTML = `<div>${_escHtml(entry.text)}</div>`;
                break;
            case 'error':
                div.className = 'c2-msg c2-msg-error';
                div.innerHTML = `<div>${_escHtml(entry.text)}</div>`;
                break;
            case 'intel':
                div.className = 'c2-msg c2-msg-intel';
                div.innerHTML = `<div class="c2-msg-sender">INTEL DROP</div><div>${_formatText(entry.text)}</div>`;
                break;
        }

        _chat.appendChild(div);
    }

    function _restoreChat() {
        _messages.forEach(entry => _renderMessage(entry));
        _scrollToBottom();
    }

    function _scrollToBottom() {
        if (_chat) {
            requestAnimationFrame(() => {
                _chat.scrollTop = _chat.scrollHeight;
            });
        }
    }

    /* ── Command Processing ──────────────────────────────────── */

    function _onKeyDown(e) {
        if (e.key === 'Enter') {
            const raw = _input.value.trim();
            if (!raw) return;
            _input.value = '';
            _history.push(raw);
            _histIdx = _history.length;
            _processCommand(raw);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (_histIdx > 0) {
                _histIdx--;
                _input.value = _history[_histIdx];
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (_histIdx < _history.length - 1) {
                _histIdx++;
                _input.value = _history[_histIdx];
            } else {
                _histIdx = _history.length;
                _input.value = '';
            }
        }
    }

    function _processCommand(raw) {
        _addMessage('student', raw);

        // Not connected yet — only /connect and /help work
        if (!_connected && !raw.startsWith('/connect') && !raw.startsWith('/help')) {
            _addMessage('system', 'Channel not authenticated. Type /connect to begin.');
            return;
        }

        const parts = raw.split(/\s+/);
        const cmd   = parts[0].toLowerCase();
        const args  = parts.slice(1);

        switch (cmd) {
            case '/connect':  _cmdConnect(); break;
            case '/flag':     _cmdFlag(args.join(' ')); break;
            case '/status':   _cmdStatus(); break;
            case '/intel':    _cmdIntel(); break;
            case '/hint':     _cmdHint(args[0]); break;
            case '/report':   _cmdReport(); break;
            case '/help':     _cmdHelp(); break;
            case '/clear':    _chat.innerHTML = ''; break;
            default:
                _addMessage('error', 'Unknown command. Type /help for available commands.');
        }
    }

    /* ── Commands ─────────────────────────────────────────────── */

    function _cmdConnect() {
        if (_connected) {
            _addMessage('system', 'Already connected to secure channel.');
            return;
        }
        _connected = true;
        _startTime = Date.now();
        _saveState();

        _addMessage('system', 'Establishing encrypted channel...');
        setTimeout(() => {
            _addMessage('system', 'AES-256-GCM handshake complete. Channel secured.');
            _checkNarrativeTriggers('connect');
            _startIntelTimers();
        }, 800);
    }

    function _cmdFlag(flagStr) {
        if (!flagStr) {
            _addMessage('error', 'Usage: /flag FLAG{...}');
            return;
        }

        // Validate format
        if (!/^FLAG\{.+\}$/i.test(flagStr)) {
            _addMessage('error', 'Invalid flag format. Expected: FLAG{...}');
            return;
        }

        // Delegate to config callback for validation
        if (_cfg.onFlagSubmit) {
            const result = _cfg.onFlagSubmit(flagStr, _flagsFound);
            if (result.duplicate) {
                _addMessage('system', 'Flag already submitted.');
            } else if (result.correct) {
                _flagsFound.push(result.flagId);
                _addMessage('success', 'FLAG ACCEPTED: ' + result.flagId.toUpperCase() + ' [+' + (result.points || 100) + ' pts]');
                _saveState();
                _checkNarrativeTriggers('flag', result.flagId);
                // Check device unlocks
                if (_cfg.onDeviceUnlock) {
                    (_cfg.devices || []).forEach(dev => {
                        if (dev.requireFlags && dev.requireFlags.length > 0 &&
                            dev.requireFlags.every(f => _flagsFound.includes(f)) &&
                            !_devicesUnlocked.includes(dev.id)) {
                            _devicesUnlocked.push(dev.id);
                            _saveState();
                            _cfg.onDeviceUnlock(dev.id);
                        }
                    });
                }
            } else {
                _addMessage('error', 'Incorrect flag. ' + (result.message || 'Try again.'));
            }
        }
    }

    function _cmdStatus() {
        const elapsed = _startTime ? _formatElapsed(Date.now() - _startTime) : '00:00:00';
        // Count only flags on active devices
        let totalFlags = 0;
        let activeDeviceNames = [];
        if (_cfg.devices) {
            _cfg.devices.forEach(d => {
                if (d.status === 'active') {
                    totalFlags += (d.flags || []).length;
                    activeDeviceNames.push(d.name);
                }
            });
        }
        if (totalFlags === 0 && _cfg.flags) totalFlags = Object.keys(_cfg.flags).length;
        const found = _flagsFound.length;

        let deviceStatus = '';
        if (_cfg.devices) {
            deviceStatus = _cfg.devices.map(d => {
                const unlocked = isDeviceUnlocked(d.id);
                const icon = unlocked ? '[ACTIVE]' : '[LOCKED]';
                return '  ' + d.name + ' ' + icon;
            }).join('\n');
        }

        const lines = [
            'OPERATION STATUS',
            '________________',
            '',
            'Time elapsed: ' + elapsed,
            'Flags: ' + found + '/' + totalFlags,
            'Hints used: ' + _hintCount,
            '',
            'DEVICES:',
            deviceStatus,
            '',
            'Score: ' + _calcScore()
        ];
        _addMessage('handler', lines.join('\n'));
    }

    function _cmdIntel() {
        const available = (_cfg.narrative || []).filter(n =>
            n.trigger === 'intel' && _intelDropped[n.id || n.time]
        );
        if (available.length === 0) {
            _addMessage('handler', 'No new intelligence available. Continue investigation.');
        } else {
            _addMessage('system', 'Replaying ' + available.length + ' intel drop(s):');
            available.forEach(n => {
                // Render directly without adding to messages array (already stored from original drop)
                _renderMessage({ type: 'intel', text: n.message, time: Date.now() });
            });
            _scrollToBottom();
        }
    }

    function _cmdHint(flagRef) {
        if (!flagRef) {
            _addMessage('error', 'Usage: /hint [flag#]  (e.g., /hint 1)');
            return;
        }
        const hintKey = 'f' + flagRef.replace(/[^0-9]/g, '');
        if (_cfg.hints && _cfg.hints[hintKey]) {
            _hintCount++;
            _saveState();
            _addMessage('handler', 'HINT for Flag ' + flagRef + ': ' + _cfg.hints[hintKey] + '\n\n[-25 pts]');
        } else {
            _addMessage('error', 'No hint available for flag ' + flagRef + '.');
        }
    }

    function _cmdReport() {
        const totalFlags = _cfg.flags ? Object.keys(_cfg.flags).length : 0;
        if (_flagsFound.length < totalFlags) {
            _addMessage('handler', 'All flags must be submitted before filing the incident report. ' +
                _flagsFound.length + '/' + totalFlags + ' flags found.');
            return;
        }
        _addMessage('handler',
            'Incident Report submission opened.\n\n' +
            'Your report should include:\n' +
            '1. Executive summary of the breach\n' +
            '2. Timeline of attacker activity\n' +
            '3. Each flag mapped to a MITRE ATT&CK technique\n' +
            '4. Recommendations for each attack vector\n' +
            '5. Indicator of Compromise (IOC) list\n\n' +
            'Submit your report through the assignment portal.\n' +
            'Report quality: +0 to +500 bonus points.\n\n' +
            'Your handler signing off. Outstanding work, operative.'
        );
    }

    function _cmdHelp() {
        const lines = [
            'AVAILABLE COMMANDS',
            '__________________',
            '',
            '/connect        — Authenticate with secure channel',
            '/flag FLAG{...} — Submit a captured flag',
            '/status         — Operation progress and score',
            '/intel          — View available intelligence',
            '/hint [flag#]   — Request hint (costs -25 pts)',
            '/report         — Submit incident response report',
            '/clear          — Clear chat display',
            '/help           — Show this menu'
        ];
        _addMessage('handler', lines.join('\n'));
    }

    /* ── Narrative Engine ────────────────────────────────────── */

    function _checkNarrativeTriggers(event, data) {
        if (!_cfg.narrative) return;
        _cfg.narrative.forEach(n => {
            if (n._fired) return;

            let match = false;
            switch (n.trigger) {
                case 'connect':
                    match = (event === 'connect');
                    break;
                case 'flag':
                    match = (event === 'flag' && data === n.flagId);
                    break;
                case 'flags':
                    match = (event === 'flag' && _flagsFound.length >= n.count);
                    break;
                case 'allFlags':
                    if (event === 'flag' && n.device && _cfg.devices) {
                        const dev = _cfg.devices.find(d => d.id === n.device);
                        if (dev && dev.flags) {
                            match = dev.flags.every(f => _flagsFound.includes(f));
                        }
                    }
                    break;
                case 'pressure':
                    match = (event === 'pressure');
                    break;
            }

            if (match) {
                n._fired = true;
                // Delay slightly for narrative pacing
                const delay = n.delay || 500;
                setTimeout(() => {
                    if (n.type === 'intel') {
                        _addMessage('intel', n.message);
                    } else {
                        _addMessage('handler', n.message);
                    }
                }, delay);
            }
        });
    }

    /* ── Intel Timers ────────────────────────────────────────── */

    function _startIntelTimers() {
        if (!_cfg.narrative) return;
        _cfg.narrative.forEach(n => {
            if (n.trigger === 'intel' && n.time && !n._fired && !_intelDropped[n.id || n.time]) {
                const elapsed = _startTime ? (Date.now() - _startTime) : 0;
                const remaining = n.time - elapsed;
                if (remaining > 0) {
                    const t = setTimeout(() => {
                        n._fired = true;
                        _intelDropped[n.id || n.time] = true;
                        _addMessage('intel', n.message);
                        _saveState();
                    }, remaining);
                    _intelTimers.push(t);
                } else if (!n._fired) {
                    // Already past the drop time, fire immediately
                    n._fired = true;
                    _intelDropped[n.id || n.time] = true;
                }
            }
        });
    }

    /* ── Scoring ─────────────────────────────────────────────── */

    function _calcScore() {
        let score = 0;
        // Base per flag
        _flagsFound.forEach(fId => {
            const f = _cfg.flags ? _cfg.flags[fId] : null;
            score += (f ? f.points : 100);
        });
        // Speed bonus
        if (_startTime && _cfg.scoring && _cfg.scoring.speedThreshold) {
            const elapsed = Date.now() - _startTime;
            if (elapsed < _cfg.scoring.speedThreshold) {
                score += (_cfg.scoring.speedBonus || 50) * _flagsFound.length;
            }
        }
        // Hint penalty
        score -= _hintCount * 25;
        // No hints bonus
        if (_hintCount === 0 && _flagsFound.length > 0) {
            score += 200;
        }
        return Math.max(0, score);
    }

    /* ── State Persistence ───────────────────────────────────── */

    function _saveState() {
        if (!_cfg || !_cfg.storageKey) return;
        const state = {
            connected:        _connected,
            startTime:        _startTime,
            flagsFound:       _flagsFound,
            hintCount:        _hintCount,
            messages:         _messages.slice(-200), // cap at 200 messages
            intelDropped:     _intelDropped,
            pressureFired:    _pressureFired,
            devicesUnlocked:  _devicesUnlocked
        };
        try {
            sessionStorage.setItem(_cfg.storageKey, JSON.stringify(state));
        } catch (e) { /* quota exceeded — OK */ }
    }

    function _loadState() {
        if (!_cfg || !_cfg.storageKey) return;
        try {
            const raw = sessionStorage.getItem(_cfg.storageKey);
            if (!raw) return;
            const state = JSON.parse(raw);
            _connected     = state.connected || false;
            _startTime     = state.startTime || null;
            _flagsFound    = state.flagsFound || [];
            _hintCount     = state.hintCount || 0;
            _messages      = state.messages || [];
            _intelDropped     = state.intelDropped || {};
            _pressureFired    = state.pressureFired || false;
            _devicesUnlocked  = state.devicesUnlocked || [];

            // Mark narrative entries that already fired
            if (_cfg.narrative) {
                _cfg.narrative.forEach(n => {
                    if (n.trigger === 'connect' && _connected) n._fired = true;
                    if (n.trigger === 'flag' && _flagsFound.includes(n.flagId)) n._fired = true;
                    if (n.trigger === 'flags' && _flagsFound.length >= n.count) n._fired = true;
                    if (n.trigger === 'pressure' && _pressureFired) n._fired = true;
                    if (n.trigger === 'intel' && _intelDropped[n.id || n.time]) n._fired = true;
                    if (n.trigger === 'allFlags' && n.device && _cfg.devices) {
                        const dev = _cfg.devices.find(d => d.id === n.device);
                        if (dev && dev.flags && dev.flags.every(f => _flagsFound.includes(f))) n._fired = true;
                    }
                });
            }
        } catch (e) { /* corrupt state — start fresh */ }
    }

    /* ── Helpers ──────────────────────────────────────────────── */

    function _formatElapsed(ms) {
        const s = Math.floor(ms / 1000);
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        return [h, m, sec].map(v => String(v).padStart(2, '0')).join(':');
    }

    function _escHtml(str) {
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    function _formatText(str) {
        // Escape HTML, then convert \n to <br>
        return _escHtml(str).replace(/\n/g, '<br>');
    }

    function _bindKeys() {
        // Global: Ctrl+Shift+C toggles C2 panel
        document.addEventListener('keydown', e => {
            if (e.ctrlKey && e.shiftKey && e.key === 'C') {
                e.preventDefault();
                if (_expanded) _collapse();
                else _expand();
            }
        });
    }

    /* ── Public Surface ──────────────────────────────────────── */

    return {
        init,
        destroy,
        submitFlag,
        getFlags,
        isDeviceUnlocked,
        handlerMessage,
        firePressure,
        expand: _expand,
        collapse: _collapse
    };

})();
