/**
 * HED.js - Host Error Detector
 * Hexworth Prime Runtime Error Monitor
 *
 * Lightweight agent that captures runtime errors in student browsers,
 * buffers them in localStorage, and exposes a public API for the
 * Health dashboard panel.
 *
 * Auto-loaded by FluxCapacitor.js on every page.
 *
 * @version 1.0.0
 */

const HED = (function() {
    'use strict';

    const VERSION = '1.0.0';
    const STORAGE_KEY = 'hexworth_hed_log';
    const MAX_ENTRIES = 50;
    const MAX_MSG_LEN = 500;
    const MAX_URL_LEN = 200;

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
        getLog: readLog
    };
})();
