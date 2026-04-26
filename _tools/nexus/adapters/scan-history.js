#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Scan History Adapter
 *
 * Saves a compact snapshot after every Nexus scan and provides
 * historical comparison across scans.
 *
 * Commands:
 *   nexus history save       Save current scan as a snapshot
 *   nexus history compare    Compare last 3 scans (default)
 *   nexus history compare 5  Compare last 5 scans
 *   nexus history list       List all saved snapshots
 *   nexus history detail N   Show full breakdown for snapshot N
 */
module.exports = function createHistoryAdapter({ name, dataPath, projectRoot }) {

    const historyDir = path.resolve(projectRoot, '_tools/reports/history');
    const treasureMapPath = path.resolve(projectRoot, '_tools/reports/TREASURE_MAP.json');

    /**
     * Build a compact snapshot from the current TREASURE_MAP.json
     */
    function buildSnapshot() {
        if (!fs.existsSync(treasureMapPath)) return null;

        const data = JSON.parse(fs.readFileSync(treasureMapPath, 'utf8'));
        const issues = data.issues || [];

        // Severity counts
        const bySeverity = {};
        issues.forEach(i => {
            const s = i.severity || 'unknown';
            bySeverity[s] = (bySeverity[s] || 0) + 1;
        });

        // Per-rule counts
        const byRule = {};
        issues.forEach(i => {
            const c = i.code || 'unknown';
            byRule[c] = (byRule[c] || 0) + 1;
        });

        // Per-house counts (HIGH only)
        const highByHouse = {};
        issues.filter(i => i.severity === 'high').forEach(i => {
            const parts = (i.file || '').split('/');
            const house = parts[0] === 'houses' && parts.length >= 2 ? parts[1] : parts[0] || 'other';
            highByHouse[house] = (highByHouse[house] || 0) + 1;
        });

        // Content counts
        const content = data.contentBreakdown || {};

        // Sync status
        const sync = data.syncStatus || {};

        return {
            timestamp: new Date().toISOString(),
            scanDuration: data.scanDuration || null,
            filesScanned: data.filesScanned || 0,
            totals: {
                issues: issues.length,
                high: bySeverity.high || 0,
                medium: bySeverity.medium || 0,
                low: bySeverity.low || 0,
                suspect: bySeverity.suspect || 0,
                warning: bySeverity.warning || 0,
                error: bySeverity.error || 0,
                info: bySeverity.info || 0,
            },
            rules: byRule,
            highByHouse,
            content: {
                quizzes: content.quizzes || 0,
                presentations: content.presentations || 0,
                labs: content.labs || 0,
                applets: content.applets || 0,
            },
            sync: {
                ready: sync.ready || 0,
                notReady: sync.notReady || 0,
            },
            catalog: {
                modules: data.catalogModules || 0,
                undeclared: data.catalogUndeclared || 0,
            }
        };
    }

    /**
     * Save current scan as a timestamped snapshot.
     */
    function save() {
        const snapshot = buildSnapshot();
        if (!snapshot) {
            console.log('  No TREASURE_MAP.json found. Run a scan first.');
            return false;
        }

        if (!fs.existsSync(historyDir)) fs.mkdirSync(historyDir, { recursive: true });

        const ts = snapshot.timestamp.replace(/[:.]/g, '-').replace('T', '_').slice(0, 19);
        const filename = `scan-${ts}.json`;
        const filepath = path.join(historyDir, filename);

        fs.writeFileSync(filepath, JSON.stringify(snapshot, null, 2));
        console.log(`  Snapshot saved: ${filename}`);
        console.log(`  HIGH: ${snapshot.totals.high} | MED: ${snapshot.totals.medium} | LOW: ${snapshot.totals.low}`);
        return true;
    }

    /**
     * Load all snapshots sorted by timestamp (newest first).
     */
    function loadSnapshots() {
        if (!fs.existsSync(historyDir)) return [];

        return fs.readdirSync(historyDir)
            .filter(f => f.startsWith('scan-') && f.endsWith('.json'))
            .sort()
            .reverse()
            .map(f => {
                try {
                    const data = JSON.parse(fs.readFileSync(path.join(historyDir, f), 'utf8'));
                    data._filename = f;
                    // Derive timestamp from filename if missing (legacy snapshots)
                    if (!data.timestamp) {
                        // scan-2026-02-13T04-06-33.json → 2026-02-13T04:06:33Z
                        const m = f.match(/scan-(\d{4}-\d{2}-\d{2})[T_](\d{2})-(\d{2})-(\d{2})/);
                        if (m) data.timestamp = `${m[1]}T${m[2]}:${m[3]}:${m[4]}Z`;
                        else data.timestamp = '1970-01-01T00:00:00Z';
                    }
                    // Normalize legacy format: ensure totals object exists
                    if (!data.totals && data.summary) {
                        data.totals = {
                            high: data.summary.high || 0,
                            medium: data.summary.medium || 0,
                            low: data.summary.low || 0,
                            suspect: data.summary.suspect || 0,
                            warning: data.summary.warning || 0,
                        };
                    }
                    if (!data.totals) {
                        data.totals = { high: 0, medium: 0, low: 0, suspect: 0, warning: 0 };
                    }
                    if (!data.sync) data.sync = { ready: 0, notReady: 0 };
                    if (!data.rules) data.rules = {};
                    if (!data.highByHouse) data.highByHouse = {};
                    return data;
                } catch (e) {
                    return null;
                }
            })
            .filter(Boolean);
    }

    /**
     * Compare last N scans side-by-side.
     */
    function compare(count) {
        count = count || 3;
        const snapshots = loadSnapshots().slice(0, count).reverse(); // oldest to newest

        if (snapshots.length === 0) {
            console.log('  No scan history found. Run: nexus history save');
            return;
        }

        if (snapshots.length === 1) {
            console.log('  Only 1 snapshot found. Need at least 2 to compare.');
            showSingle(snapshots[0]);
            return;
        }

        // Header
        const colWidth = 14;
        const labelWidth = 22;
        console.log('');
        console.log('  ' + '='.repeat(labelWidth + colWidth * snapshots.length + 4));
        console.log('  SCAN HISTORY COMPARISON');
        console.log('  ' + '='.repeat(labelWidth + colWidth * snapshots.length + 4));

        // Timestamps row
        const pad = (s, w) => String(s).padStart(w);
        const lpad = (s, w) => String(s).padEnd(w);

        console.log('');
        process.stdout.write('  ' + lpad('', labelWidth));
        snapshots.forEach(s => {
            const date = s.timestamp.slice(0, 10);
            const time = s.timestamp.slice(11, 16);
            process.stdout.write(pad(`${date}`, colWidth));
        });
        console.log('');

        process.stdout.write('  ' + lpad('', labelWidth));
        snapshots.forEach(s => {
            const time = s.timestamp.slice(11, 16);
            process.stdout.write(pad(time, colWidth));
        });
        console.log('');

        console.log('  ' + '-'.repeat(labelWidth + colWidth * snapshots.length));

        // Severity rows
        const severities = ['high', 'medium', 'low', 'suspect', 'warning'];
        severities.forEach(sev => {
            process.stdout.write('  ' + lpad(sev.toUpperCase(), labelWidth));
            snapshots.forEach((s, idx) => {
                const val = s.totals[sev] || 0;
                let display = String(val);

                // Show delta from previous scan
                if (idx > 0) {
                    const prev = snapshots[idx - 1].totals[sev] || 0;
                    const delta = val - prev;
                    if (delta !== 0) {
                        display = `${val} (${delta > 0 ? '+' : ''}${delta})`;
                    }
                }
                process.stdout.write(pad(display, colWidth));
            });
            console.log('');
        });

        // Sync status
        console.log('  ' + '-'.repeat(labelWidth + colWidth * snapshots.length));
        process.stdout.write('  ' + lpad('Sync Ready', labelWidth));
        snapshots.forEach((s, idx) => {
            const val = s.sync.ready || 0;
            let display = String(val);
            if (idx > 0) {
                const prev = snapshots[idx - 1].sync.ready || 0;
                const delta = val - prev;
                if (delta !== 0) display = `${val} (${delta > 0 ? '+' : ''}${delta})`;
            }
            process.stdout.write(pad(display, colWidth));
        });
        console.log('');

        process.stdout.write('  ' + lpad('Sync Not Ready', labelWidth));
        snapshots.forEach((s, idx) => {
            const val = s.sync.notReady || 0;
            let display = String(val);
            if (idx > 0) {
                const prev = snapshots[idx - 1].sync.notReady || 0;
                const delta = val - prev;
                if (delta !== 0) display = `${val} (${delta > 0 ? '+' : ''}${delta})`;
            }
            process.stdout.write(pad(display, colWidth));
        });
        console.log('');

        // Top movers — rules with biggest delta between first and last scan
        console.log('');
        console.log('  ' + '='.repeat(labelWidth + colWidth * snapshots.length));
        console.log('  TOP MOVERS (first scan → last scan)');
        console.log('  ' + '-'.repeat(50));

        const first = snapshots[0].rules;
        const last = snapshots[snapshots.length - 1].rules;
        const allRules = new Set([...Object.keys(first), ...Object.keys(last)]);
        const deltas = [];

        allRules.forEach(rule => {
            const before = first[rule] || 0;
            const after = last[rule] || 0;
            const delta = after - before;
            if (delta !== 0) deltas.push({ rule, before, after, delta });
        });

        deltas.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));

        deltas.slice(0, 15).forEach(d => {
            const sign = d.delta > 0 ? '+' : '';
            const arrow = d.delta > 0 ? 'NEW/UP' : 'FIXED';
            console.log(`  ${d.rule.padEnd(14)} ${String(d.before).padStart(5)} → ${String(d.after).padStart(5)}  ${sign}${d.delta}  ${d.delta > 0 && d.before === 0 ? '(NEW RULE)' : ''}`);
        });

        if (deltas.length === 0) {
            console.log('  No changes between scans.');
        }

        // HIGH by house comparison
        console.log('');
        console.log('  ' + '='.repeat(labelWidth + colWidth * snapshots.length));
        console.log('  HIGH FINDINGS BY HOUSE');
        console.log('  ' + '-'.repeat(labelWidth + colWidth * snapshots.length));

        const allHouses = new Set();
        snapshots.forEach(s => Object.keys(s.highByHouse || {}).forEach(h => allHouses.add(h)));

        [...allHouses].sort().forEach(house => {
            process.stdout.write('  ' + lpad(house, labelWidth));
            snapshots.forEach((s, idx) => {
                const val = (s.highByHouse || {})[house] || 0;
                let display = String(val);
                if (idx > 0) {
                    const prev = (snapshots[idx - 1].highByHouse || {})[house] || 0;
                    const delta = val - prev;
                    if (delta !== 0) display = `${val} (${delta > 0 ? '+' : ''}${delta})`;
                }
                process.stdout.write(pad(display, colWidth));
            });
            console.log('');
        });

        console.log('');
    }

    /**
     * Show a single snapshot's details.
     */
    function showSingle(snapshot) {
        console.log(`\n  Scan: ${snapshot.timestamp}`);
        console.log(`  HIGH: ${snapshot.totals.high} | MED: ${snapshot.totals.medium} | LOW: ${snapshot.totals.low}`);
        console.log(`  Sync: ${snapshot.sync.ready} ready, ${snapshot.sync.notReady} not ready`);

        console.log('\n  Top rules:');
        Object.entries(snapshot.rules)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .forEach(([rule, count]) => {
                console.log(`    ${rule.padEnd(14)} ${count}`);
            });
    }

    /**
     * List all saved snapshots.
     */
    function list() {
        const snapshots = loadSnapshots();
        if (snapshots.length === 0) {
            console.log('  No scan history found.');
            return;
        }

        console.log(`\n  ${snapshots.length} snapshots saved:\n`);
        console.log(`  ${'#'.padStart(4)}  ${'Date'.padEnd(12)}  ${'Time'.padEnd(6)}  ${'HIGH'.padStart(5)}  ${'MED'.padStart(5)}  ${'LOW'.padStart(5)}  ${'Ready'.padStart(6)}  Filename`);
        console.log(`  ${'─'.repeat(4)}  ${'─'.repeat(12)}  ${'─'.repeat(6)}  ${'─'.repeat(5)}  ${'─'.repeat(5)}  ${'─'.repeat(5)}  ${'─'.repeat(6)}  ${'─'.repeat(30)}`);

        snapshots.forEach((s, i) => {
            const date = s.timestamp.slice(0, 10);
            const time = s.timestamp.slice(11, 16);
            console.log(`  ${String(i + 1).padStart(4)}  ${date.padEnd(12)}  ${time.padEnd(6)}  ${String(s.totals.high).padStart(5)}  ${String(s.totals.medium).padStart(5)}  ${String(s.totals.low).padStart(5)}  ${String(s.sync.ready).padStart(6)}  ${s._filename}`);
        });
        console.log('');
    }

    /**
     * Nexus spoke interface.
     */
    function getFindings() {
        return []; // History adapter produces no findings — it's a reporting tool
    }

    function execute(command, args) {
        switch (command) {
            case 'save':
                return save();

            case 'compare': {
                const count = parseInt(args[0]) || 3;
                compare(count);
                return true;
            }

            case 'list':
                list();
                return true;

            case 'detail': {
                const idx = parseInt(args[0]) || 1;
                const snapshots = loadSnapshots();
                if (idx < 1 || idx > snapshots.length) {
                    console.log(`  Invalid snapshot number. Range: 1-${snapshots.length}`);
                    return false;
                }
                showSingle(snapshots[idx - 1]);
                return true;
            }

            default:
                console.log('  Usage:');
                console.log('    nexus history save         Save current scan');
                console.log('    nexus history compare [N]  Compare last N scans (default 3)');
                console.log('    nexus history list          List all snapshots');
                console.log('    nexus history detail N     Show details for snapshot #N');
                return false;
        }
    }

    return { name, getFindings, execute, save, compare, list, loadSnapshots, buildSnapshot };
};
