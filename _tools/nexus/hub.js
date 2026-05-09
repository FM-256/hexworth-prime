#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');
const { execSync } = require('child_process');

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

function expandTilde(p) {
    if (p.startsWith('~/') || p === '~') {
        return path.join(os.homedir(), p.slice(1));
    }
    return p;
}

function loadSpokes(config) {
    const spokes = {};
    for (const [name, spoke] of Object.entries(config.spokes || {})) {
        if (!spoke.enabled) continue;
        try {
            const adapterPath = path.resolve(__dirname, spoke.adapter);
            const dataPath = expandTilde(spoke.dataPath);
            const resolvedDataPath = path.isAbsolute(dataPath) ? dataPath : path.resolve(__dirname, dataPath);
            const factory = require(adapterPath);
            spokes[name] = factory({ name, dataPath: resolvedDataPath, projectRoot: PROJECT_ROOT });
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
    // id-prefixed key when adapter emits finding.id (e.g., quiz-sync's
    // per-cluster id, quiz-key-callsite's per-category id). Per-id
    // findings get distinct dedupKeys so each gets its own timestamp
    // refresh; without this, N findings sharing source+code+file collapse
    // to a single key and N-1 carry stale timestamps.
    //
    // Backward-compat: adapters without id (eduscan, sprint, spellbook,
    // hexcontent, deploy-check, audit) get key unchanged — bare
    // source::code::file. Their existing dedup behavior is preserved
    // exactly. Migration of existing findings.json is no-op for those.
    //
    // EduScan's 2,624 pre-existing collisions (LP-007 1,356x, LP-006 466x,
    // etc.) are an adapter-side issue (each finding represents a different
    // module/path within the same file but isn't distinguished by id) —
    // NOT addressed by this change. Tracked separately as Phase 4B
    // follow-up: eduscan adapter should emit per-finding id (e.g.,
    // line-number or module-id) to enable independent tracking.
    const idPrefix = finding.id ? `${finding.id}::` : '';
    return `${idPrefix}${finding.source}::${finding.code}::${finding.file || ''}`;
}

function syncFromSpoke(adapter, store, options) {
    const incoming = adapter.getFindings();
    const now = new Date().toISOString();
    const prune = options && options.prune;

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

    // Prune stale findings from this source that weren't in incoming data
    let pruned = 0;
    if (prune) {
        store.findings = store.findings.filter(f => {
            if (f.source !== adapter.name) return true;
            if (seen.has(dedupKey(f))) return true;
            pruned++;
            return false;
        });
    }

    return { added, refreshed, pruned, total: incoming.length };
}

// --- Triage ---

function triageToSpoke(findings, adapter, options) {
    const dryRun = options && options.dryRun !== false;

    // Group findings by code
    const groups = new Map();
    for (const f of findings) {
        if (!groups.has(f.code)) {
            groups.set(f.code, {
                code: f.code,
                source: f.source,
                severity: f.severity,
                message: f.message,
                count: 0,
                files: [],
            });
        }
        const g = groups.get(f.code);
        g.count++;
        if (f.file && g.files.length < 10) {
            g.files.push(f.file);
        }
    }

    const created = [];
    const skipped = [];

    for (const group of groups.values()) {
        if (dryRun) {
            // In dry-run, check if already tracked without writing
            const result = adapter.acceptFinding(group, { dryRun: true });
            if (result.accepted) {
                created.push({ code: group.code, severity: group.severity, count: group.count, reference: result.reference });
            } else {
                skipped.push({ code: group.code, severity: group.severity, count: group.count, reason: result.reason, reference: result.reference });
            }
        } else {
            const result = adapter.acceptFinding(group, { dryRun: false });
            if (result.accepted) {
                created.push({ code: group.code, severity: group.severity, count: group.count, reference: result.reference });
            } else {
                skipped.push({ code: group.code, severity: group.severity, count: group.count, reason: result.reason, reference: result.reference });
            }
        }
    }

    return { created, skipped, total: groups.size };
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

// --- Gate ---

function runGate(config, spokes, options) {
    const strict = options && options.strict;
    const gateConfig = config.gate || { failOn: ['critical'], sources: ['eduscan'] };
    const failOn = strict ? ['critical', 'high'] : gateConfig.failOn;
    const sources = gateConfig.sources || Object.keys(spokes);

    const bySeverity = {};
    const blocking = [];
    const polled = [];
    const skipped = [];
    const errors = [];

    for (const sourceName of sources) {
        const adapter = spokes[sourceName];
        if (!adapter) {
            skipped.push(sourceName);
            continue;
        }

        try {
            const status = getSpokeStatus(adapter);
            if (!status.available) {
                skipped.push(sourceName);
                continue;
            }

            polled.push(sourceName);
            const findings = adapter.getFindings();

            for (const f of findings) {
                bySeverity[f.severity] = (bySeverity[f.severity] || 0) + 1;
                if (failOn.includes(f.severity)) {
                    blocking.push(f);
                }
            }
        } catch (err) {
            errors.push({ source: sourceName, error: err.message });
        }
    }

    const passed = blocking.length === 0;

    return {
        passed,
        blocking,
        bySeverity,
        polled,
        skipped,
        errors,
        failOn,
    };
}

// --- Pipes ---

function pipeHedToGithub(adapter, pipeConfig, options) {
    const dryRun = options && options.dryRun;
    const threshold = (options && options.threshold) || (pipeConfig && pipeConfig.threshold) || 3;
    const labels = (pipeConfig && pipeConfig.labels) || ['bug', 'hed-auto'];

    const findings = adapter.getFindings();
    if (!findings.length) {
        return { created: [], skipped: [], noData: true };
    }

    // Filter by threshold (count >= threshold)
    const eligible = findings.filter(f => (f.meta && f.meta.count || 1) >= threshold);

    const created = [];
    const skipped = [];

    for (const finding of eligible) {
        const signature = `[${finding.code}]`;
        const title = `${signature} ${finding.message}`;

        // Check for existing open issue with same signature
        let alreadyExists = false;
        try {
            const searchResult = execSync(
                `gh issue list --state open --search "${signature}" --json title --limit 20`,
                { encoding: 'utf8', timeout: 15000, stdio: ['pipe', 'pipe', 'pipe'] }
            );
            const issues = JSON.parse(searchResult || '[]');
            alreadyExists = issues.some(i => i.title && i.title.includes(signature));
        } catch (err) {
            // gh CLI not available or not authenticated — skip dedup check
        }

        if (alreadyExists) {
            skipped.push({ code: finding.code, reason: 'existing issue' });
            continue;
        }

        if (dryRun) {
            created.push({ code: finding.code, title, wouldCreate: true });
            continue;
        }

        // Create the issue
        try {
            const labelFlag = labels.map(l => `-l "${l}"`).join(' ');
            const body = `Auto-created by Nexus pipe (hed-github).\n\n**Code:** ${finding.code}\n**Severity:** ${finding.severity}\n**Occurrences:** ${finding.meta && finding.meta.count || 'unknown'}\n**Message:** ${finding.message}`;
            execSync(
                `gh issue create --title "${title.replace(/"/g, '\\"')}" --body "${body.replace(/"/g, '\\"')}" ${labelFlag}`,
                { encoding: 'utf8', timeout: 30000, stdio: ['pipe', 'pipe', 'pipe'] }
            );
            created.push({ code: finding.code, title });
        } catch (err) {
            skipped.push({ code: finding.code, reason: `gh error: ${err.message}` });
        }
    }

    return { created, skipped, noData: false, threshold };
}

// --- Pull ---

function pullHed(config, options) {
    const pullConfig = (config.pull && config.pull.hed) || {};
    const url = pullConfig.url;
    if (!url) {
        return Promise.resolve({ success: false, reason: 'No pull.hed.url in config' });
    }

    // Resolve API key: env var → .hed-key file → none
    let apiKey = process.env.NEXUS_HED_KEY || null;
    if (!apiKey) {
        const keyFile = path.join(__dirname, '.hed-key');
        if (fs.existsSync(keyFile)) {
            apiKey = fs.readFileSync(keyFile, 'utf8').trim();
        }
    }

    const outPath = path.join(__dirname, 'hed-export.json');

    return new Promise((resolve) => {
        const parsedUrl = new URL(url);
        const reqOptions = {
            hostname: parsedUrl.hostname,
            port: parsedUrl.port || 443,
            path: parsedUrl.pathname + parsedUrl.search,
            method: 'GET',
            headers: {},
            timeout: 15000,
        };
        if (apiKey) {
            reqOptions.headers['x-api-key'] = apiKey;
        }

        const req = https.request(reqOptions, (res) => {
            let body = '';
            res.on('data', chunk => { body += chunk; });
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    resolve({ success: false, reason: `HTTP ${res.statusCode}: ${body.slice(0, 200)}` });
                    return;
                }
                try {
                    const data = JSON.parse(body);
                    const entries = Array.isArray(data) ? data : [];
                    fs.writeFileSync(outPath, JSON.stringify(entries, null, 2) + '\n');
                    resolve({ success: true, count: entries.length, path: outPath });
                } catch (err) {
                    resolve({ success: false, reason: `JSON parse error: ${err.message}` });
                }
            });
        });

        req.on('error', (err) => {
            resolve({ success: false, reason: err.message });
        });

        req.on('timeout', () => {
            req.destroy();
            resolve({ success: false, reason: 'Request timed out' });
        });

        req.end();
    });
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
    triageToSpoke,
    dedupKey,
    computeStats,

    // Gate, Pipes & Pull
    runGate,
    pipeHedToGithub,
    pullHed,

    // Formatters
    C,
    SEVERITY_ORDER,
    padRight,
    stripAnsi,
    truncate,
    severityColor,
    timeAgo,
};
