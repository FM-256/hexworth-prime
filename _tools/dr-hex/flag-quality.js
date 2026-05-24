#!/usr/bin/env node
/**
 * flag-quality.js — log a Dr. Hex response-quality observation.
 *
 * Taxonomy + schema: _docs/operations/dr-hex-quality-log.md
 * Firestore collection: dr_hex_quality_observations
 *
 * Usage:
 *   node flag-quality.js --category <code> --query "<text>" --response "<text>"
 *                        [--persona <slug>] [--help-level <n>]
 *                        [--conversation-id <id>] [--mission-id <id>]
 *                        [--tool-doc-ids <id1,id2>] [--priority P0|P1|P2|P3]
 *                        [--notes "<text>"]
 *
 *   node flag-quality.js --check --category <code> --query "<text>"
 *      Dedup probe — prints existing matches by (category, query first 60 chars).
 *      Does NOT write.
 *
 *   node flag-quality.js --list [--category <code>] [--status <status>] [--limit <n>]
 *      Read recent observations. Default limit 20.
 *
 * Auth: uses firebase-admin SDK (bypasses firestore.rules — admin power).
 *       Operator must have GCP application-default credentials configured
 *       (`gcloud auth application-default login`).
 */

// firebase-admin lives in functions/node_modules; share that install rather
// than maintaining a parallel copy under _tools.
const path = require('path');
require('module').Module._initPaths();
require('module').globalPaths.unshift(
    path.join(__dirname, '..', '..', 'functions', 'node_modules')
);
const admin = require(path.join(__dirname, '..', '..', 'functions', 'node_modules', 'firebase-admin'));

const VALID_CATEGORIES = [
    'drhex-q-rag-relevance',
    'drhex-q-rag-coverage',
    'drhex-q-help-ceiling',
    'drhex-q-help-floor',
    'drhex-q-persona-drift',
    'drhex-q-hallucination',
    'drhex-q-leak',
    'drhex-q-tool',
    'drhex-q-policy',
];

const VALID_STATUSES = ['open', 'triaged', 'fixing', 'fixed', 'wontfix', 'duplicate'];
const VALID_PRIORITIES = ['P0', 'P1', 'P2', 'P3'];

function parseArgs(argv) {
    const args = {};
    for (let i = 2; i < argv.length; i++) {
        const a = argv[i];
        if (!a.startsWith('--')) continue;
        const key = a.slice(2);
        // Boolean flags
        if (key === 'check' || key === 'list') {
            args[key] = true;
            continue;
        }
        // Value flags — next arg is the value
        args[key] = argv[i + 1];
        i++;
    }
    return args;
}

function die(msg, code = 1) {
    console.error(`flag-quality: ${msg}`);
    process.exit(code);
}

function validateCategory(cat) {
    if (!VALID_CATEGORIES.includes(cat)) {
        die(`unknown category "${cat}".\n` +
            `Valid: ${VALID_CATEGORIES.join(', ')}\n` +
            `See _docs/operations/dr-hex-quality-log.md for definitions.`);
    }
}

function queryHashKey(s) {
    // Dedup key per the spec: first 60 chars of the student query.
    return (s || '').slice(0, 60);
}

async function main() {
    const args = parseArgs(process.argv);

    admin.initializeApp({ projectId: 'hexworth-prime' });
    const db = admin.firestore();
    const COLL = db.collection('dr_hex_quality_observations');

    // ─── --list mode ──────────────────────────────────────────────
    if (args.list) {
        let q = COLL.orderBy('flaggedAt', 'desc');
        if (args.category) {
            validateCategory(args.category);
            q = q.where('category', '==', args.category);
        }
        if (args.status) {
            if (!VALID_STATUSES.includes(args.status)) {
                die(`unknown status "${args.status}". Valid: ${VALID_STATUSES.join(', ')}`);
            }
            q = q.where('status', '==', args.status);
        }
        const limit = parseInt(args.limit, 10) || 20;
        q = q.limit(limit);
        const snap = await q.get();
        console.log(`Found ${snap.size} observation(s):`);
        snap.docs.forEach(d => {
            const x = d.data();
            const when = x.flaggedAt ? x.flaggedAt.toDate().toISOString() : '?';
            console.log(`  [${x.status}] ${when} | ${x.category} | ${(x.observation || x.studentQueryFirst60 || '').slice(0, 80)}`);
            console.log(`        id=${d.id}`);
        });
        process.exit(0);
    }

    // ─── --check mode (dedup probe) ───────────────────────────────
    if (args.check) {
        if (!args.category || !args.query) {
            die('--check requires --category and --query');
        }
        validateCategory(args.category);
        const key = queryHashKey(args.query);
        const snap = await COLL
            .where('category', '==', args.category)
            .where('studentQueryFirst60', '==', key)
            .orderBy('flaggedAt', 'desc')
            .limit(5)
            .get();
        if (snap.empty) {
            console.log(`No existing observations for (${args.category}, "${key}"). Safe to file new.`);
            process.exit(0);
        }
        console.log(`Found ${snap.size} existing observation(s) with same dedup key:`);
        snap.docs.forEach(d => {
            const x = d.data();
            const when = x.flaggedAt ? x.flaggedAt.toDate().toISOString() : '?';
            console.log(`  ${when} | id=${d.id} | status=${x.status}`);
            if (x.observation) console.log(`        ${x.observation.slice(0, 120)}`);
        });
        console.log('\nIf this is the same incident, file as a duplicate pointing at one of the above IDs.');
        process.exit(0);
    }

    // ─── Write mode ───────────────────────────────────────────────
    if (!args.category || !args.query || !args.response) {
        die('Required: --category, --query, --response\n' +
            'Use --check to dedup-probe first, or --list to browse existing entries.');
    }
    validateCategory(args.category);
    if (args.status && !VALID_STATUSES.includes(args.status)) {
        die(`unknown status "${args.status}". Valid: ${VALID_STATUSES.join(', ')}`);
    }
    if (args.priority && !VALID_PRIORITIES.includes(args.priority)) {
        die(`unknown priority "${args.priority}". Valid: ${VALID_PRIORITIES.join(', ')}`);
    }

    const helpLevel = args['help-level'] != null ? parseInt(args['help-level'], 10) : null;
    const toolDocIds = args['tool-doc-ids']
        ? args['tool-doc-ids'].split(',').map(s => s.trim()).filter(Boolean)
        : [];

    const studentQueryFirst60 = queryHashKey(args.query);

    // Dedup probe — show but don't block.
    const dupSnap = await COLL
        .where('category', '==', args.category)
        .where('studentQueryFirst60', '==', studentQueryFirst60)
        .limit(3)
        .get();
    if (!dupSnap.empty && !args.force) {
        console.error(`flag-quality: refusing to write — ${dupSnap.size} existing observation(s) with same dedup key:`);
        dupSnap.docs.forEach(d => {
            const x = d.data();
            console.error(`  id=${d.id} | status=${x.status} | ${x.observation || ''}`.slice(0, 200));
        });
        console.error('\nIf this is the same incident, file as duplicate:');
        console.error(`  node flag-quality.js [...] --status duplicate --original-id <id>`);
        console.error('Or re-run with --force to log anyway.');
        process.exit(2);
    }

    const doc = {
        category: args.category,
        observation: args.notes || args.observation || `${args.category} on query: "${studentQueryFirst60}"`,
        studentQueryFirst60,
        modelResponseFirst200: (args.response || '').slice(0, 200),
        conversationId: args['conversation-id'] || null,
        missionId: args['mission-id'] || null,
        toolInvocationDocIds: toolDocIds,
        persona: args.persona || null,
        helpLevel,
        status: args.status || 'open',
        priority: args.priority || null,
        flaggedBy: args['flagged-by'] || 'cli-operator',
        flaggedAt: admin.firestore.FieldValue.serverTimestamp(),
        notes: args.notes || null,
        originalObservationId: args['original-id'] || null,
        fixCommit: null,
    };

    const ref = await COLL.add(doc);
    console.log(`Logged ${args.category} observation as ${ref.id}`);
    console.log(`  Dedup key: ${studentQueryFirst60}`);
    console.log(`  See: _docs/operations/dr-hex-quality-log.md`);
    process.exit(0);
}

main().catch(e => {
    console.error('flag-quality: fatal:', e.message || e);
    process.exit(1);
});
