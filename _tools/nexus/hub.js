#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// --- Constants ---

const PROJECT_ROOT = path.resolve(__dirname, '../..');
const CONFIG_FILE = path.join(__dirname, 'nexus.config.json');
const FINDINGS_FILE = path.join(__dirname, 'findings.json');

// ANSI color codes (matches Sprint Master convention)
const C = {
    reset:   '\x1b[0m',
    bold:    '\x1b[1m',
    dim:     '\x1b[2m',
    red:     '\x1b[31m',
    green:   '\x1b[32m',
    yellow:  '\x1b[33m',
    blue:    '\x1b[34m',
    magenta: '\x1b[35m',
    cyan:    '\x1b[36m',
    white:   '\x1b[37m',
    gray:    '\x1b[90m',
};

const SEVERITY_ORDER = ['critical', 'high', 'medium', 'low', 'info'];

const DEFAULT_CONFIG = {
    version: 1,
    spokes: {
        eduscan: {
            adapter: './adapters/eduscan.js',
            dataPath: '../reports/TREASURE_MAP.json',
            enabled: true
        },
        sprint: {
            adapter: './adapters/sprint-master.js',
            dataPath: '../sprint-master/sprints.json',
            enabled: true
        }
    }
};

// --- Config ---

function getProjectRoot() {
    return PROJECT_ROOT;
}

function loadConfig() {
    if (!fs.existsSync(CONFIG_FILE)) {
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 4) + '\n');
    }
    try {
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    } catch (err) {
        console.error(`  ${C.yellow}Warning: corrupt nexus.config.json — recreating defaults${C.reset}`);
        fs.writeFileSync(CONFIG_FILE, JSON.stringify(DEFAULT_CONFIG, null, 4) + '\n');
        return { ...DEFAULT_CONFIG };
    }
}

// --- Spoke Registry ---

function loadSpokes(config) {
    const spokes = {};
    for (const [name, spoke] of Object.entries(config.spokes || {})) {
        if (!spoke.enabled) continue;
        try {
            const adapterPath = path.resolve(__dirname, spoke.adapter);
            const dataPath = path.resolve(__dirname, spoke.dataPath);
            const factory = require(adapterPath);
            spokes[name] = factory({ name, dataPath, projectRoot: PROJECT_ROOT });
        } catch (err) {
            console.error(`  ${C.yellow}Warning: could not load spoke "${name}" — ${err.message}${C.reset}`);
        }
    }
    return spokes;
}

function getSpokeStatus(adapter) {
    try {
        return adapter.getStatus();
    } catch (err) {
        return { available: false, error: err.message };
    }
}

// --- Findings Store ---

function loadFindings() {
    if (!fs.existsSync(FINDINGS_FILE)) {
        return {
            version: 1,
            lastSync: null,
            findings: [],
            stats: { total: 0, bySeverity: {}, bySource: {} }
        };
    }
    try {
        return JSON.parse(fs.readFileSync(FINDINGS_FILE, 'utf8'));
    } catch (err) {
        console.error(`  ${C.yellow}Warning: corrupt findings.json — starting fresh${C.reset}`);
        return {
            version: 1,
            lastSync: null,
            findings: [],
            stats: { total: 0, bySeverity: {}, bySource: {} }
        };
    }
}

function saveFindings(store) {
    store.lastSync = new Date().toISOString();
    store.stats = computeStats(store.findings);
    fs.writeFileSync(FINDINGS_FILE, JSON.stringify(store, null, 2) + '\n');
}

function dedupKey(finding) {
    return `${finding.source}::${finding.code}::${finding.file || ''}`;
}

function syncFromSpoke(adapter, store) {
    const incoming = adapter.getFindings();
    const now = new Date().toISOString();

    // Build lookup of existing findings by dedup key
    const existing = new Map();
    store.findings.forEach((f, i) => {
        if (f.source === adapter.name) {
            existing.set(dedupKey(f), i);
        }
    });

    let added = 0;
    let refreshed = 0;

    // Track which keys we've seen from this source
    const seen = new Set();

    for (const finding of incoming) {
        const key = dedupKey(finding);
        seen.add(key);

        if (existing.has(key)) {
            // Refresh timestamp on existing finding
            store.findings[existing.get(key)].timestamp = now;
            refreshed++;
        } else {
            // New finding
            finding.timestamp = now;
            store.findings.push(finding);
            added++;
        }
    }

    return { added, refreshed, total: incoming.length };
}

function computeStats(findings) {
    const stats = {
        total: findings.length,
        bySeverity: {},
        bySource: {}
    };

    for (const f of findings) {
        stats.bySeverity[f.severity] = (stats.bySeverity[f.severity] || 0) + 1;
        stats.bySource[f.source] = (stats.bySource[f.source] || 0) + 1;
    }

    return stats;
}

// --- Formatters ---

function stripAnsi(str) {
    return str.replace(/\x1b\[[0-9;]*m/g, '');
}

function padRight(str, len) {
    const visible = stripAnsi(str);
    if (visible.length >= len) return str;
    return str + ' '.repeat(len - visible.length);
}

function truncate(str, maxLen) {
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen - 1) + '…';
}

function severityColor(severity) {
    switch (severity) {
        case 'critical': return C.red;
        case 'high':     return C.yellow;
        case 'medium':   return C.cyan;
        case 'low':      return C.gray;
        case 'info':     return C.dim;
        default:         return C.white;
    }
}

function timeAgo(isoString) {
    if (!isoString) return 'never';
    const diff = Date.now() - new Date(isoString).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

// --- Exports ---

module.exports = {
    // Config
    loadConfig,
    getProjectRoot,
    CONFIG_FILE,
    FINDINGS_FILE,

    // Registry
    loadSpokes,
    getSpokeStatus,

    // Store
    loadFindings,
    saveFindings,
    syncFromSpoke,
    dedupKey,
    computeStats,

    // Formatters
    C,
    SEVERITY_ORDER,
    padRight,
    stripAnsi,
    truncate,
    severityColor,
    timeAgo,
};
