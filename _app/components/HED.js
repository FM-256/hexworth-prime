/**
 * HED.js - Host Error Detector
 * Hexworth Prime Runtime Error Monitor
 *
 * Lightweight agent that captures runtime errors in student browsers,
 * buffers them in localStorage, and exposes a public API for the
 * Health dashboard panel + floating diagnostic overlay.
 *
 * Auto-loaded by FluxCapacitor.js on every page.
 * Floating panel gated behind AccessGuard admin OR hexworth_hed_enabled flag.
 *
 * @version 1.2.0
 */

const HED = (function() {
    'use strict';

    const VERSION = '1.2.0';
    const STORAGE_KEY = 'hexworth_hed_log';
    const MAX_ENTRIES = 100;
    const MAX_MSG_LEN = 500;
    const MAX_URL_LEN = 200;

    // Cloud reporting
    const CLOUD_MAX = 10;
    const CLOUD_PENDING_KEY = 'hexworth_hed_pending';
    const SESSION_ID = (() => { try { return crypto.randomUUID(); } catch(e) { return 'xxxx-xxxx'.replace(/x/g, () => (Math.random()*16|0).toString(16)); } })();

    let _cloudBuffer = [];
    let _cloudFlushed = false;
    const _dedupMap = {};

    // Error codes
    const CODE_JS_ERROR       = 'HED-001';
    const CODE_REJECTION      = 'HED-002';
    const CODE_CONSOLE_ERROR  = 'HED-003';
    const CODE_RESOURCE_FAIL  = 'HED-004';

    // ═══════════════════════════════════════════════════════════════
    // BENIGN FILTER (ported from EduScan functional/browser.js)
    // ═══════════════════════════════════════════════════════════════

    const BENIGN_PATTERNS = [
        /firebase/i,
        /firestore/i,
        /blocked by CORS/i,
        /Refused to connect/i,
        /Refused to load/i,
        /Mixed Content/i,
        /Access-Control-Allow-Origin/i,
        /ERR_FILE_NOT_FOUND/i,
        /ERR_BLOCKED_BY_CLIENT/i,
        /ERR_INTERNET_DISCONNECTED/i,
        /Access to .* from origin 'null'/i,
        /classList.*null/i,
        /Cannot read.*null.*classList/i,
        /AccessGuard.*redirecting/i,
        /AccessGuard.*blocked/i
    ];

    function isBenign(text) {
        if (!text) return false;
        return BENIGN_PATTERNS.some(function(p) { return p.test(text); });
    }

    function isExternalResource(el) {
        if (!el || !el.src) return false;
        return /^https?:\/\//.test(el.src);
    }

    // ═══════════════════════════════════════════════════════════════
    // RING BUFFER (localStorage)
    // ═══════════════════════════════════════════════════════════════

    function readLog() {
        try {
            var raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function writeLog(log) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
        } catch (e) {
            // Quota exceeded — silently degrade
        }
    }

    function record(code, message, source) {
        var msg = String(message || '').substring(0, MAX_MSG_LEN);
        if (isBenign(msg)) return;

        var entry = {
            code: code,
            message: msg,
            url: String(window.location.href || '').substring(0, MAX_URL_LEN),
            source: String(source || '').substring(0, MAX_URL_LEN),
            timestamp: new Date().toISOString(),
            userAgent: String(navigator.userAgent || '').substring(0, 200)
        };

        var log = readLog();
        log.push(entry);
        while (log.length > MAX_ENTRIES) log.shift();
        writeLog(log);
        bufferForCloud(code, msg, entry.url, entry.source, entry.timestamp);

        // Dispatch event for real-time dashboard updates
        try {
            window.dispatchEvent(new CustomEvent('hexworth:hedError', { detail: entry }));
        } catch (e) {}
    }

    // ═══════════════════════════════════════════════════════════════
    // ERROR LISTENERS
    // ═══════════════════════════════════════════════════════════════

    // HED-001: JS errors + HED-004: Resource failures (capture phase)
    window.addEventListener('error', function(event) {
        // Resource load failure (script, link, img)
        if (event.target && event.target.tagName && event.target !== window) {
            if (isExternalResource(event.target)) return;
            var tag = event.target.tagName.toLowerCase();
            var src = event.target.src || event.target.href || '';
            record(CODE_RESOURCE_FAIL, tag + ' failed to load: ' + src, src);
            return;
        }
        // JS runtime error
        var source = (event.filename || '') + (event.lineno ? ':' + event.lineno : '') +
                     (event.colno ? ':' + event.colno : '');
        record(CODE_JS_ERROR, event.message || 'Unknown error', source);
    }, true);

    // HED-002: Unhandled promise rejections
    window.addEventListener('unhandledrejection', function(event) {
        var msg = '';
        if (event.reason) {
            msg = event.reason.message || event.reason.stack || String(event.reason);
        }
        record(CODE_REJECTION, msg || 'Unhandled promise rejection', '');
    });

    // HED-003: console.error override
    var _origConsoleError = console.error;
    console.error = function() {
        var msg = Array.prototype.slice.call(arguments).join(' ');
        record(CODE_CONSOLE_ERROR, msg, '');
        _origConsoleError.apply(console, arguments);
    };

    // Flush cloud buffer on page hide / unload
    document.addEventListener('visibilitychange', function() { if (document.visibilityState === 'hidden') flushToCloud(); });
    window.addEventListener('beforeunload', flushToCloud);
    setTimeout(drainPending, 3000);

    // ═══════════════════════════════════════════════════════════════
    // CLOUD REPORTING (Buffer → Flush → Drain)
    // ═══════════════════════════════════════════════════════════════

    function bufferForCloud(code, msg, url, source, ts) {
        if (_cloudFlushed) return;
        var key = code + '|' + msg;
        if (_dedupMap[key]) {
            _dedupMap[key].count++;
            return;
        }
        if (_cloudBuffer.length >= CLOUD_MAX) return;
        var entry = { code: code, message: msg, url: url, source: source, timestamp: ts, count: 1 };
        _cloudBuffer.push(entry);
        _dedupMap[key] = entry;
    }

    function _buildReport() {
        if (_cloudBuffer.length === 0) return null;
        var uid = null;
        var house = null;
        try {
            var cachedUser = localStorage.getItem('hexworth_firebase_user');
            if (cachedUser) { uid = JSON.parse(cachedUser).uid || null; }
            house = localStorage.getItem('hexworth_house') || null;
        } catch (e) {}
        return {
            sessionId: SESSION_ID,
            uid: uid,
            house: house,
            userAgent: String(navigator.userAgent || '').substring(0, 200),
            errors: _cloudBuffer.slice(),
            errorCount: _cloudBuffer.reduce(function(sum, e) { return sum + e.count; }, 0),
            reportedAt: null  // replaced by serverTimestamp() on write
        };
    }

    function flushToCloud() {
        if (_cloudFlushed || _cloudBuffer.length === 0) return;
        _cloudFlushed = true;
        var report = _buildReport();
        if (!report) return;

        // Try Firestore if SDK is loaded
        if (typeof firebase !== 'undefined' && firebase.firestore) {
            try {
                report.reportedAt = firebase.firestore.FieldValue.serverTimestamp();
                firebase.firestore().collection('hed_reports').add(report);
                try { sessionStorage.removeItem(CLOUD_PENDING_KEY); } catch (e) {}
                return;
            } catch (e) { /* fall through to sessionStorage */ }
        }

        _savePending(report);
    }

    function _savePending(report) {
        try {
            report.reportedAt = new Date().toISOString();
            sessionStorage.setItem(CLOUD_PENDING_KEY, JSON.stringify(report));
        } catch (e) {}
    }

    function drainPending() {
        try {
            var raw = sessionStorage.getItem(CLOUD_PENDING_KEY);
            if (!raw) return;
            if (typeof firebase === 'undefined' || !firebase.firestore) return;
            var report = JSON.parse(raw);
            report.reportedAt = firebase.firestore.FieldValue.serverTimestamp();
            firebase.firestore().collection('hed_reports').add(report);
            sessionStorage.removeItem(CLOUD_PENDING_KEY);
        } catch (e) {}
    }

    // ═══════════════════════════════════════════════════════════════
    // FLOATING DIAGNOSTIC PANEL (admin-gated)
    // ═══════════════════════════════════════════════════════════════

    var _panelEl = null;
    var _dotEl = null;
    var _panelOpen = false;
    var _errorCount = 0;

    var CODE_LABELS = {
        'HED-001': 'JS Error',
        'HED-002': 'Promise',
        'HED-003': 'Console',
        'HED-004': 'Resource'
    };

    var CODE_COLORS = {
        'HED-001': '#f87171',
        'HED-002': '#fbbf24',
        'HED-003': '#60a5fa',
        'HED-004': '#c084fc'
    };

    function _isAdmin() {
        try {
            if (localStorage.getItem('hexworth_hed_enabled') === 'true') return true;
            var role = localStorage.getItem('hexworth_role');
            if (role === 'admin' || role === 'instructor') return true;
            var guard = localStorage.getItem('hexworth_access');
            if (guard && JSON.parse(guard).admin) return true;
        } catch (e) {}
        return false;
    }

    function _injectPanelStyles() {
        if (document.getElementById('hed-panel-styles')) return;
        var s = document.createElement('style');
        s.id = 'hed-panel-styles';
        s.textContent = [
            '.hed-dot{position:fixed;bottom:16px;left:16px;width:14px;height:14px;border-radius:50%;',
            'background:#4ade80;cursor:pointer;z-index:99998;transition:all .3s;box-shadow:0 0 6px #4ade8066;',
            'border:2px solid rgba(0,0,0,.3)}',
            '.hed-dot.has-errors{background:#f87171;box-shadow:0 0 8px #f8717166;animation:hed-pulse 2s infinite}',
            '.hed-dot:hover{transform:scale(1.3)}',
            '@keyframes hed-pulse{0%,100%{box-shadow:0 0 6px #f8717166}50%{box-shadow:0 0 14px #f87171aa}}',
            '.hed-float{position:fixed;bottom:40px;left:16px;width:480px;max-height:70vh;',
            'background:#1a1a2e;border:1px solid #333;border-radius:10px;z-index:99999;',
            'font-family:"Courier New",monospace;font-size:12px;color:#e5e5e5;',
            'display:none;flex-direction:column;box-shadow:0 8px 32px rgba(0,0,0,.5)}',
            '.hed-float.open{display:flex}',
            '.hed-float-hdr{display:flex;align-items:center;padding:10px 14px;',
            'background:#0f0f1a;border-radius:10px 10px 0 0;border-bottom:1px solid #333;gap:8px}',
            '.hed-float-title{font-weight:700;font-size:13px;color:#60a5fa;flex:1}',
            '.hed-float-badge{background:#f8717122;color:#f87171;border:1px solid #f8717144;',
            'padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600}',
            '.hed-float-close{background:none;border:none;color:#666;cursor:pointer;font-size:18px;',
            'padding:0 4px;line-height:1}',
            '.hed-float-close:hover{color:#fff}',
            '.hed-float-body{overflow-y:auto;flex:1;padding:8px;max-height:calc(70vh - 90px)}',
            '.hed-float-ctrls{display:flex;gap:6px;padding:8px 14px;border-top:1px solid #333;',
            'background:#0f0f1a;border-radius:0 0 10px 10px}',
            '.hed-float-btn{padding:5px 12px;border-radius:5px;border:1px solid #333;',
            'background:#1a1a2e;color:#aaa;cursor:pointer;font-size:11px;font-family:inherit;transition:all .15s}',
            '.hed-float-btn:hover{background:#252540;color:#fff}',
            '.hed-float-btn.danger:hover{border-color:#f87171;color:#f87171}',
            '.hed-float-btn.copied{border-color:#4ade80;color:#4ade80}',
            '.hed-row{display:grid;grid-template-columns:70px 1fr;gap:8px;padding:6px 8px;',
            'border-radius:6px;margin-bottom:4px;background:rgba(255,255,255,.02);',
            'border:1px solid rgba(255,255,255,.05)}',
            '.hed-row:hover{background:rgba(255,255,255,.05)}',
            '.hed-code{font-size:10px;font-weight:600;padding:3px 6px;border-radius:3px;text-align:center;',
            'align-self:start}',
            '.hed-msg{word-break:break-word;line-height:1.4;color:#ddd}',
            '.hed-meta{font-size:10px;color:#666;margin-top:3px;display:flex;gap:10px;flex-wrap:wrap}',
            '.hed-empty{text-align:center;padding:30px 10px;color:#666;font-style:italic}',
            '@media(max-width:560px){.hed-float{left:8px;right:8px;width:auto}}'
        ].join('\n');
        document.head.appendChild(s);
    }

    function _buildPanel() {
        _injectPanelStyles();

        // Indicator dot
        _dotEl = document.createElement('div');
        _dotEl.className = 'hed-dot';
        _dotEl.title = 'HED: System Health';
        _dotEl.addEventListener('click', function() { _togglePanel(); });
        document.body.appendChild(_dotEl);

        // Floating panel
        _panelEl = document.createElement('div');
        _panelEl.className = 'hed-float';
        _panelEl.innerHTML = [
            '<div class="hed-float-hdr">',
            '  <span class="hed-float-title">HED Diagnostics</span>',
            '  <span class="hed-float-badge" id="hedBadge">0</span>',
            '  <button class="hed-float-close" id="hedClose">&times;</button>',
            '</div>',
            '<div class="hed-float-body" id="hedBody"></div>',
            '<div class="hed-float-ctrls">',
            '  <button class="hed-float-btn" id="hedCopy">Copy Log</button>',
            '  <button class="hed-float-btn" id="hedExport">Export JSON</button>',
            '  <button class="hed-float-btn danger" id="hedClear">Clear</button>',
            '</div>'
        ].join('\n');
        document.body.appendChild(_panelEl);

        document.getElementById('hedClose').addEventListener('click', function() { _togglePanel(false); });
        document.getElementById('hedCopy').addEventListener('click', _copyLog);
        document.getElementById('hedExport').addEventListener('click', exportLog);
        document.getElementById('hedClear').addEventListener('click', function() {
            clear();
            _renderPanelList();
            _updateDot();
        });

        _renderPanelList();
        _updateDot();
    }

    function _togglePanel(forceState) {
        _panelOpen = forceState !== undefined ? forceState : !_panelOpen;
        _panelEl.classList.toggle('open', _panelOpen);
        if (_panelOpen) _renderPanelList();
    }

    function _updateDot() {
        if (!_dotEl) return;
        var log = readLog();
        _errorCount = log.length;
        _dotEl.classList.toggle('has-errors', _errorCount > 0);
        _dotEl.title = 'HED: ' + (_errorCount > 0 ? _errorCount + ' error(s)' : 'All clear');
    }

    function _renderPanelList() {
        var body = document.getElementById('hedBody');
        var badge = document.getElementById('hedBadge');
        if (!body) return;

        var log = readLog();
        if (badge) badge.textContent = log.length;

        if (log.length === 0) {
            body.innerHTML = '<div class="hed-empty">All systems green — no errors recorded</div>';
            return;
        }

        var html = '';
        for (var i = log.length - 1; i >= 0; i--) {
            var e = log[i];
            var color = CODE_COLORS[e.code] || '#ccc';
            var label = CODE_LABELS[e.code] || e.code;
            var ts = '';
            try { ts = new Date(e.timestamp).toLocaleTimeString(); } catch(x) { ts = e.timestamp || ''; }
            html += '<div class="hed-row">';
            html += '<span class="hed-code" style="background:' + color + '22;color:' + color +
                    ';border:1px solid ' + color + '44">' + label + '</span>';
            html += '<div><div class="hed-msg">' + _escHtml(e.message || '') + '</div>';
            html += '<div class="hed-meta"><span>' + ts + '</span>';
            if (e.source) html += '<span>' + _escHtml(e.source) + '</span>';
            html += '</div></div></div>';
        }
        body.innerHTML = html;
    }

    function _copyLog() {
        var log = readLog();
        var text = log.map(function(e) {
            return '[' + e.timestamp + '] ' + e.code + ' ' + e.message + (e.source ? ' @ ' + e.source : '');
        }).join('\n');
        if (!text) text = 'No errors recorded.';
        try {
            navigator.clipboard.writeText(text).then(function() {
                var btn = document.getElementById('hedCopy');
                if (btn) { btn.textContent = 'Copied!'; btn.classList.add('copied'); }
                setTimeout(function() {
                    if (btn) { btn.textContent = 'Copy Log'; btn.classList.remove('copied'); }
                }, 2000);
            });
        } catch (e) {
            // Fallback: textarea copy
            var ta = document.createElement('textarea');
            ta.value = text;
            ta.style.cssText = 'position:fixed;opacity:0';
            document.body.appendChild(ta);
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
        }
    }

    function _escHtml(str) {
        var div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Initialize floating panel after DOM ready (admin-gated)
    function _initPanel() {
        if (!_isAdmin()) return;
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', _buildPanel);
        } else {
            _buildPanel();
        }
    }

    // Listen for new errors → update dot + panel
    window.addEventListener('hexworth:hedError', function() {
        _updateDot();
        if (_panelOpen) _renderPanelList();
    });

    _initPanel();

    // ═══════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════

    function dump() {
        var log = readLog();
        if (log.length === 0) {
            console.log('[HED] No errors recorded.');
            return log;
        }
        console.table(log);
        return log;
    }

    function clear() {
        try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
        console.log('[HED] Log cleared.');
    }

    function exportLog() {
        var log = readLog();
        var blob = new Blob([JSON.stringify(log, null, 2)], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'hed-log-' + new Date().toISOString().replace(/[:.]/g, '-') + '.json';
        a.click();
        URL.revokeObjectURL(a.href);
    }

    function getStats() {
        var log = readLog();
        var byCodes = {};
        for (var i = 0; i < log.length; i++) {
            var c = log[i].code;
            byCodes[c] = (byCodes[c] || 0) + 1;
        }
        return {
            total: log.length,
            byCodes: byCodes,
            oldest: log.length > 0 ? log[0].timestamp : null,
            newest: log.length > 0 ? log[log.length - 1].timestamp : null
        };
    }

    // Startup confirmation
    console.log('[HED] Error monitoring active (v' + VERSION + ')');

    return {
        version: VERSION,
        dump: dump,
        clear: clear,
        export: exportLog,
        getStats: getStats,
        getLog: readLog,
        flush: flushToCloud,
        showPanel: function() { if (_panelEl) _togglePanel(true); },
        hidePanel: function() { if (_panelEl) _togglePanel(false); }
    };
})();
