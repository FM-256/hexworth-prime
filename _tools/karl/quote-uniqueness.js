#!/usr/bin/env node
/**
 * quote-uniqueness.js — Pre-Karl validator for verifying-quote reuse across
 * solution pages.
 *
 * Walks ~/hexworth-shared/Solutions/ recursively for Quiz-*_ANSWERS.md and extracts every
 * `Verifying quote: *"..."*` block alongside its `URL:` line. Reports any
 * (quote, URL) pair appearing more than once.
 *
 * Per Nancy review (2026-05-07):
 *   - Dedup key = (normalized_quote, source_url) — same quote from same URL
 *     is legitimate citation reuse (MEDIUM at most). Same quote from
 *     DIFFERENT URLs is the real problem (HIGH).
 *   - Minimum 8 words to count — short quotes coincidentally match.
 *   - Coverage report visible — show parsed-quote count per file so green
 *     output isn't misleading on files where format isn't recognized.
 *   - NO exit code 1 — false-positive rate not yet characterized.
 *     Stays informational until corpus matures.
 *
 * Created 2026-05-07 per Sprint #13.
 *
 * Usage:
 *   node _tools/karl/quote-uniqueness.js               # human-readable
 *   node _tools/karl/quote-uniqueness.js --json        # JSON output
 *   node _tools/karl/quote-uniqueness.js --quiet       # only duplicates
 *   node _tools/karl/quote-uniqueness.js --verbose     # per-file coverage
 */

'use strict';

const fs = require('fs');
const path = require('path');

const SOLUTIONS_ROOT = path.resolve(process.env.HOME || '/home/eq', 'hexworth-shared/Solutions');
const MIN_WORDS = 8;

const args = process.argv.slice(2);
const flags = {
    json: args.includes('--json'),
    quiet: args.includes('--quiet'),
    verbose: args.includes('--verbose'),
};

// ── Walk Solutions for ANSWERS.md ─────────────────────────────────────
function walkAnswers(dir) {
    const out = [];
    if (!fs.existsSync(dir)) return out;
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        if (e.name.startsWith('_')) continue;
        const full = path.join(dir, e.name);
        if (e.isDirectory()) out.push(...walkAnswers(full));
        else if (e.isFile() && /Quiz-.*_ANSWERS\.md$/i.test(e.name)) out.push(full);
    }
    return out;
}

// ── Normalize quote: collapse whitespace, lowercase, strip surrounding
//    punctuation. Keep word boundaries so word-count is meaningful.
function normalizeQuote(q) {
    return q.toLowerCase()
        .replace(/[“”‘’]/g, '"')   // smart quotes → ASCII
        .replace(/[*_`]/g, '')                          // markdown emphasis
        .replace(/^[\s"'.,;:!?\-—]+/, '')              // leading punctuation
        .replace(/[\s"'.,;:!?\-—]+$/, '')              // trailing punctuation
        .replace(/\s+/g, ' ')                           // collapse whitespace
        .trim();
}

function wordCount(q) {
    return q.split(/\s+/).filter(Boolean).length;
}

// ── Extract (question, quote, URL) triples from one ANSWERS.md ──────
// Format observed (Shield-FW Quiz-W1-Logical_ANSWERS.md, v7):
//   ## Question 1
//   ...
//   - URL: https://...
//   - Verifying quote: *"..."*
//   - Tier: Primary
//   - Verification level: ...
function parseAnswersFile(filepath) {
    const content = fs.readFileSync(filepath, 'utf8');
    const lines = content.split('\n');

    const triples = [];
    let currentQ = null;
    let pendingUrl = null;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Question heading
        const qMatch = line.match(/^##\s*Question\s*(\d+)/i);
        if (qMatch) { currentQ = parseInt(qMatch[1], 10); pendingUrl = null; continue; }
        // URL line
        const urlMatch = line.match(/^\s*-\s*URL:\s*(\S+)/i);
        if (urlMatch) { pendingUrl = urlMatch[1].trim(); continue; }
        // Verifying quote line
        const quoteMatch = line.match(/^\s*-\s*Verifying\s+quote:\s*\*?["“]([^"*”]+)["”*]/i)
            || line.match(/^\s*-\s*Verifying\s+quote:\s*\*([^*]+)\*/i);
        if (quoteMatch) {
            const rawQuote = quoteMatch[1].trim();
            triples.push({
                file: filepath,
                question: currentQ,
                rawQuote,
                normalized: normalizeQuote(rawQuote),
                wordCount: wordCount(normalizeQuote(rawQuote)),
                url: pendingUrl,
            });
        }
    }
    return triples;
}

// ── MAIN ──────────────────────────────────────────────────────────────
function main() {
    const files = walkAnswers(SOLUTIONS_ROOT);
    const perFileCoverage = [];
    const allTriples = [];
    for (const f of files) {
        const triples = parseAnswersFile(f);
        perFileCoverage.push({ file: f.replace(SOLUTIONS_ROOT + '/', ''), parsed: triples.length });
        allTriples.push(...triples);
    }

    // Filter on minimum word count
    const eligible = allTriples.filter(t => t.wordCount >= MIN_WORDS && t.normalized && t.url);
    const tooShort = allTriples.filter(t => t.wordCount < MIN_WORDS).length;
    const noUrl = allTriples.filter(t => !t.url).length;

    // Build dedup map: key = `${normalized}\n${url}`
    const sameQuoteSameUrl = new Map();
    const normToInstances = new Map();    // for cross-URL detection

    for (const t of eligible) {
        const sameKey = t.normalized + '\n' + t.url;
        if (!sameQuoteSameUrl.has(sameKey)) sameQuoteSameUrl.set(sameKey, []);
        sameQuoteSameUrl.get(sameKey).push(t);

        if (!normToInstances.has(t.normalized)) normToInstances.set(t.normalized, []);
        normToInstances.get(t.normalized).push(t);
    }

    // Categorize duplicates
    const sameQuoteSameUrlDups = [];     // legitimate reuse, MEDIUM
    const sameQuoteDifferentUrlDups = []; // suspicious, HIGH

    for (const [key, instances] of sameQuoteSameUrl) {
        if (instances.length > 1) sameQuoteSameUrlDups.push({ key, instances });
    }
    for (const [norm, instances] of normToInstances) {
        // Get distinct URLs
        const urls = new Set(instances.map(t => t.url));
        if (urls.size > 1) sameQuoteDifferentUrlDups.push({ norm, instances, urls: [...urls] });
    }

    const summary = {
        scannedAt: new Date().toISOString(),
        filesScanned: files.length,
        quotesParsed: allTriples.length,
        eligible: eligible.length,
        skippedTooShort: tooShort,
        skippedNoUrl: noUrl,
        legitimateReuseGroups: sameQuoteSameUrlDups.length,
        suspiciousCrossUrlGroups: sameQuoteDifferentUrlDups.length,
        minWords: MIN_WORDS,
    };

    if (flags.json) {
        console.log(JSON.stringify({
            summary,
            perFileCoverage,
            sameQuoteSameUrlDups: sameQuoteSameUrlDups.map(d => ({
                normalized: d.instances[0].normalized.substring(0, 80) + (d.instances[0].normalized.length > 80 ? '...' : ''),
                url: d.instances[0].url,
                instances: d.instances.map(t => ({ file: t.file.replace(SOLUTIONS_ROOT + '/', ''), question: t.question })),
            })),
            sameQuoteDifferentUrlDups: sameQuoteDifferentUrlDups.map(d => ({
                normalized: d.norm.substring(0, 80) + (d.norm.length > 80 ? '...' : ''),
                urls: d.urls,
                instances: d.instances.map(t => ({ file: t.file.replace(SOLUTIONS_ROOT + '/', ''), question: t.question, url: t.url })),
            })),
        }, null, 2));
        return;
    }

    if (!flags.quiet) {
        console.log('quote-uniqueness — verifying-quote dedup scanner');
        console.log('');
        console.log('  ANSWERS.md files scanned:  ' + summary.filesScanned);
        console.log('  Total quotes parsed:       ' + summary.quotesParsed);
        console.log('  Eligible (>= ' + MIN_WORDS + ' words + URL): ' + summary.eligible);
        console.log('  Skipped (too short):       ' + summary.skippedTooShort);
        console.log('  Skipped (no URL):          ' + summary.skippedNoUrl);
        console.log('');
    }

    if (flags.verbose) {
        console.log('Per-file coverage:');
        for (const c of perFileCoverage) {
            const flag = c.parsed === 0 ? '  ⚠️ NO QUOTES PARSED' : '';
            console.log('  ' + c.parsed.toString().padStart(3) + '  ' + c.file + flag);
        }
        console.log('');
    }

    if (sameQuoteDifferentUrlDups.length > 0) {
        console.log('🔴 SUSPICIOUS — same quote from different URLs (' + sameQuoteDifferentUrlDups.length + ' groups):');
        for (const d of sameQuoteDifferentUrlDups) {
            console.log('  Quote: "' + d.norm.substring(0, 80) + (d.norm.length > 80 ? '...' : '') + '"');
            console.log('  URLs:');
            for (const u of d.urls) console.log('    - ' + u);
            console.log('  Instances:');
            for (const t of d.instances) {
                console.log('    - ' + t.file.replace(SOLUTIONS_ROOT + '/', '') + ' Q' + t.question);
            }
            console.log('');
        }
    }

    if (sameQuoteSameUrlDups.length > 0 && !flags.quiet) {
        console.log('🟡 LEGITIMATE REUSE — same quote, same URL (' + sameQuoteSameUrlDups.length + ' groups, MEDIUM):');
        for (const d of sameQuoteSameUrlDups.slice(0, 10)) {
            const t = d.instances[0];
            console.log('  Quote: "' + t.normalized.substring(0, 80) + '"');
            console.log('  URL: ' + t.url);
            console.log('  Used in ' + d.instances.length + ' places: ' + d.instances.map(x => path.basename(x.file).replace('_ANSWERS.md', '') + '/Q' + x.question).join(', '));
            console.log('');
        }
        if (sameQuoteSameUrlDups.length > 10) console.log('  ... and ' + (sameQuoteSameUrlDups.length - 10) + ' more groups');
        console.log('');
    }

    if (sameQuoteSameUrlDups.length === 0 && sameQuoteDifferentUrlDups.length === 0 && !flags.quiet) {
        console.log('✓ No duplicate quotes detected in eligible quote set.');
    }

    // No exit-1 per Nancy review — informational until false-positive rate
    // is characterized at scale.
    process.exit(0);
}

main();
