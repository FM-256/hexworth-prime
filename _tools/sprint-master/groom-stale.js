#!/usr/bin/env node
/**
 * sprint-master/groom-stale.js — surface stale-open sprints
 *
 * Self-improve infrastructure. Scans sprints.json for OPEN-status sprints
 * (status: open, in-progress, in-review, design-review) that haven't been
 * `updated` in >N days. Writes a single consolidated _triage_queue item
 * (or N items, --per-sprint) so the operator sees the rot accumulating.
 *
 * Does NOT mutate sprints.json. Read-only against the backlog. The
 * operator decides whether to close, demote, or work each one.
 *
 * Usage:
 *   node _tools/sprint-master/groom-stale.js              # default 30d, summary mode
 *   node _tools/sprint-master/groom-stale.js --days 60
 *   node _tools/sprint-master/groom-stale.js --json
 *   node _tools/sprint-master/groom-stale.js --write-triage  # write to _triage_queue
 *   node _tools/sprint-master/groom-stale.js --per-sprint --write-triage  # one item per
 */

'use strict';

const path = require('path');
const fs = require('fs');

const ARGS = process.argv.slice(2);
const argFlag = (name) => ARGS.includes('--' + name);
const argVal = (name, def) => {
    const i = ARGS.indexOf('--' + name);
    return i >= 0 && ARGS[i + 1] ? ARGS[i + 1] : def;
};

const STALENESS_DAYS = parseInt(argVal('days', '30'), 10);
const JSON_OUT = argFlag('json');
const WRITE_TRIAGE = argFlag('write-triage');
const PER_SPRINT = argFlag('per-sprint');

const OPEN_STATUSES = new Set([
    'open',
    'in-progress',
    'in_progress',
    'in-review',
    'design-review',
    'partial',
]);

function loadSprints() {
    const p = path.resolve(__dirname, 'sprints.json');
    return JSON.parse(fs.readFileSync(p, 'utf8'));
}

function findStale(sprints, days) {
    const cutoff = Date.now() - (days * 24 * 60 * 60 * 1000);
    const stale = [];
    for (const s of sprints) {
        if (!OPEN_STATUSES.has(s.status)) continue;
        if (!s.updated) continue;
        const ts = Date.parse(s.updated);
        if (Number.isNaN(ts)) continue;
        if (ts < cutoff) {
            const ageDays = Math.floor((Date.now() - ts) / (24 * 60 * 60 * 1000));
            stale.push({
                id: s.id,
                title: s.title,
                series: s.series,
                priority: s.priority,
                status: s.status,
                updated: s.updated,
                ageDays,
            });
        }
    }
    stale.sort((a, b) => b.ageDays - a.ageDays);
    return stale;
}

async function writeTriageItems(stale) {
    process.env.GOOGLE_CLOUD_PROJECT = 'hexworth-prime';
    const admin = require(path.join(
        path.resolve(__dirname, '../../functions/node_modules/firebase-admin')
    ));
    if (!admin.apps.length) admin.initializeApp({ projectId: 'hexworth-prime' });
    const db = admin.firestore();
    const col = db.collection('_triage_queue');

    if (PER_SPRINT) {
        for (const s of stale) {
            const docId = `stale_sprint_${s.id}`;
            await col.doc(docId).set({
                code: 'SPRINT-STALE',
                severity: s.priority === 'critical' || s.priority === 'high' ? 'medium' : 'low',
                source: 'sprint-master/groom-stale',
                message: `${s.id} (${s.priority}, ${s.status}) idle ${s.ageDays}d — last updated ${s.updated}: ${s.title}`,
                file: '_tools/sprint-master/sprints.json',
                status: 'open',
                detectedAt: admin.firestore.FieldValue.serverTimestamp(),
                lastSeenAt: admin.firestore.FieldValue.serverTimestamp(),
                occurrences: admin.firestore.FieldValue.increment(1),
                sprintId: s.id,
                ageDays: s.ageDays,
            }, { merge: true });
        }
        console.log(`Wrote ${stale.length} per-sprint triage items.`);
    } else {
        // One consolidated item summarizing the rot
        const byPriority = {};
        for (const s of stale) {
            byPriority[s.priority] = (byPriority[s.priority] || 0) + 1;
        }
        const summary = Object.entries(byPriority)
            .map(([p, n]) => `${n} ${p}`)
            .join(', ');
        const oldest = stale[0];
        await col.doc('sprint_staleness_summary').set({
            code: 'SPRINT-STALE-SUMMARY',
            severity: 'medium',
            source: 'sprint-master/groom-stale',
            message: `${stale.length} open sprints stale >${STALENESS_DAYS}d (${summary}). Oldest: ${oldest.id} idle ${oldest.ageDays}d.`,
            file: '_tools/sprint-master/sprints.json',
            status: 'open',
            detectedAt: admin.firestore.FieldValue.serverTimestamp(),
            lastSeenAt: admin.firestore.FieldValue.serverTimestamp(),
            occurrences: admin.firestore.FieldValue.increment(1),
            staleCount: stale.length,
            stalenessDays: STALENESS_DAYS,
        }, { merge: true });
        console.log(`Wrote consolidated sprint_staleness_summary triage item (${stale.length} sprints).`);
    }
}

async function main() {
    const data = loadSprints();
    const stale = findStale(data.sprints, STALENESS_DAYS);

    if (JSON_OUT) {
        console.log(JSON.stringify({ stalenessDays: STALENESS_DAYS, count: stale.length, stale }, null, 2));
        return;
    }

    console.log(`\nSprint staleness audit (>${STALENESS_DAYS}d idle, open statuses):\n`);
    if (stale.length === 0) {
        console.log('  No stale open sprints. Backlog is fresh.\n');
        return;
    }
    console.log(`  ${stale.length} stale-open sprints found.\n`);
    const byPriority = {};
    for (const s of stale) byPriority[s.priority] = (byPriority[s.priority] || 0) + 1;
    console.log('  By priority:', JSON.stringify(byPriority));
    console.log('\n  Top 15 oldest:');
    for (const s of stale.slice(0, 15)) {
        console.log(`    ${s.id.padEnd(10)} ${(s.priority || '?').padEnd(8)} ${s.ageDays}d  ${(s.title || '').slice(0, 60)}`);
    }
    if (stale.length > 15) {
        console.log(`    ... and ${stale.length - 15} more`);
    }

    if (WRITE_TRIAGE) {
        console.log();
        await writeTriageItems(stale);
    } else {
        console.log('\n  Run with --write-triage to surface to _triage_queue.');
        console.log('  Run with --json for machine-readable output.\n');
    }
}

main().catch(e => { console.error('Error:', e.message); process.exit(1); });
