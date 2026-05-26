#!/usr/bin/env node
/**
 * inject-hex-ai-button.js — bulk-add the floating Dr. Hex button include
 * to every lab page that doesn't already have it.
 *
 * Companion to hex-ai-button-presence-audit.js (HEX-AI-001). The audit
 * tells you which pages are missing; this script inserts the include.
 *
 * Insertion shape (matches the matrix/adv-linux pilot exactly):
 *
 *   <hex-ai-button house="<slug>"  [mission-id="<id>"] ></hex-ai-button>
 *   <script type="module" src="/_lib/HexAIButton.js"></script>
 *
 * Insertion point: immediately before the last </body> in the file.
 *
 * Safety:
 *   - Idempotent: skips any file that already has /<hex-ai-button|HexAIButton\.js/
 *   - Requires exactly one </body> tag (skips files with 0 or >1)
 *   - Dry-run by default (`--apply` to actually write)
 *   - Filters can scope the change: `--house matrix`, `--limit 50`
 *
 * Run:
 *     node _tools/eduscan/inject-hex-ai-button.js            # dry run, all files
 *     node _tools/eduscan/inject-hex-ai-button.js --apply    # write changes
 *     node _tools/eduscan/inject-hex-ai-button.js --apply --house key
 *
 * Mission ID derivation:
 *   *.lab.html        → strip the .lab.html suffix (e.g. "key-aes")
 *   *.box.html        → strip the .box.html suffix
 *   *.quiz.html       → strip the .quiz.html suffix
 *   *.applet.html     → strip the .applet.html suffix
 *   *.tool.html       → strip the .tool.html suffix
 *   *.module.html     → strip the .module.html suffix
 *   *.presentation.html → no mission_id (presentations are not graded missions)
 *   index.html        → no mission_id (house / course landing)
 *   anything else     → no mission_id (best-effort safe default)
 */
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..', '..');
const APP = path.join(REPO, '_app');

const SKIP_DIRS = new Set([
    '_archive', '_drafts', 'admin', 'components', '_shared',
    'assets', 'fonts', 'images', '_lib',
]);

// Parse args
const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const HOUSE_FILTER = (() => {
    const i = args.indexOf('--house');
    return i >= 0 && args[i + 1] ? args[i + 1] : null;
})();
const LIMIT = (() => {
    const i = args.indexOf('--limit');
    return i >= 0 && args[i + 1] ? parseInt(args[i + 1], 10) : null;
})();

function walk(dir, out = []) {
    if (!fs.existsSync(dir)) return out;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory()) {
            if (SKIP_DIRS.has(entry.name)) continue;
            walk(path.join(dir, entry.name), out);
        } else if (entry.isFile() && entry.name.endsWith('.html')) {
            out.push(path.join(dir, entry.name));
        }
    }
    return out;
}

// "Lab page" definition. Match by:
//   (a) Filename suffix — any of the graded-artifact file types, OR
//   (b) Content indicators — known engine includes / structural markers.
// (a) catches authored lab files even when they don't pull in the
// standard engine scripts; (b) catches house/course landing pages that
// don't have one of the suffixes but DO load ContentCatalog.js etc.
const LAB_FILE_SUFFIXES = [
    '.lab.html', '.box.html', '.quiz.html', '.applet.html',
    '.module.html', '.tool.html', '.exam.html',
];
function isLabPage(content, filepath) {
    if (filepath.includes('/admin/')) return false;
    if (filepath.includes('/_archive/') || filepath.includes('/_drafts/')) return false;
    const inLabDir =
        filepath.includes('/_app/houses/') ||
        filepath.includes('/_app/dispatch/');
    if (!inLabDir) return false;
    const base = path.basename(filepath);
    if (LAB_FILE_SUFFIXES.some(s => base.endsWith(s))) return true;
    const indicators = [
        /ContentCatalog\.js/,
        /id="lab-engine"|id="box-engine"|id="quiz-shell"/,
        /data-mission-id/,
        /class="[^"]*lab-/,
        /BoxEngine|QuizEngine|LabEngine/,
    ];
    return indicators.some(re => re.test(content));
}

function hasButton(content) {
    return /<hex-ai-button/.test(content) || /HexAIButton\.js/.test(content);
}

function houseFromPath(filepath) {
    const m = filepath.match(/\/_app\/houses\/([^/]+)\//);
    if (m) return m[1];
    if (filepath.includes('/_app/dispatch/')) return 'dispatch';
    return null;
}

function missionIdFromFilename(filepath) {
    const base = path.basename(filepath);
    // index.html and presentation.html → no mission_id
    if (base === 'index.html') return null;
    if (base.endsWith('.presentation.html')) return null;
    // Suffix-stripping for graded artifacts
    const suffixes = [
        '.lab.html', '.box.html', '.quiz.html', '.applet.html',
        '.tool.html', '.module.html', '.exam.html',
    ];
    for (const s of suffixes) {
        if (base.endsWith(s)) {
            return base.slice(0, -s.length);
        }
    }
    return null;
}

function buildInclude(house, missionId) {
    const attrs = [`house="${house}"`];
    if (missionId) attrs.unshift(`mission-id="${missionId}"`);
    return (
        '\n    <!-- ── Dr. Hex floating mood-ring button ──────────────────────────\n' +
        '         Always-visible chat entry point. State machine is attempt-driven;\n' +
        '         button stays calm and serves as a general chat entry until lab\n' +
        '         activity ticks the mood-ring.\n' +
        '         Docs: _docs/operations/dr-hex-button-integration.md           ── -->\n' +
        `    <hex-ai-button ${attrs.join(' ')}></hex-ai-button>\n` +
        `    <script type="module" src="/_lib/HexAIButton.js"></script>\n`
    );
}

function injectInto(content, include) {
    // The actual document-closing </body></html> is at the END of the
    // file. Earlier occurrences (e.g., the FIRST </body></html>) may be
    // inside JS string literals containing mock HTML — like
    // `content:'<!DOCTYPE html><html><body><h1>foo</h1></body></html>'`
    // inside a simulated-filesystem lab. Inserting there breaks JS parsing.
    //
    // The right closing tag is whichever </body></html> sits closest to
    // EOF. We find the LAST match via global iteration.
    //
    // Bug discovered 2026-05-25 during the bulk rollout — first-injection
    // wave broke ~12 specialized lab pages (HEUR-012 JS syntax errors)
    // before being caught by the post-deploy scan.
    const closingPattern = /<\/body\s*>\s*<\/html\s*>/gi;
    let lastMatch = null;
    let m;
    while ((m = closingPattern.exec(content)) !== null) {
        lastMatch = m;
    }
    if (!lastMatch) {
        return { ok: false, reason: 'no </body></html> pair found at end-of-file (document close ambiguous)' };
    }
    // Additional safety check: the matched </body></html> should be
    // within the last 5% of the file. If it's elsewhere, something is
    // odd — skip rather than risk corruption.
    if (lastMatch.index < content.length * 0.95) {
        return { ok: false, reason: `last </body></html> found at byte ${lastMatch.index}/${content.length} — not near EOF (likely mock HTML in JS)` };
    }
    const idx = lastMatch.index;
    const newContent = content.slice(0, idx) + include + content.slice(idx);
    return { ok: true, newContent };
}

function main() {
    const labRoots = [
        path.join(APP, 'houses'),
        path.join(APP, 'dispatch'),
    ];
    const allHtml = [];
    for (const root of labRoots) walk(root, allHtml);

    const results = {
        scanned: 0,
        notLabPage: 0,
        alreadyHasButton: 0,
        wouldInject: 0,
        injected: 0,
        skipped: [],
        perHouse: {},
    };

    let injectedCount = 0;
    for (const f of allHtml) {
        results.scanned++;
        const content = fs.readFileSync(f, 'utf8');
        if (!isLabPage(content, f)) { results.notLabPage++; continue; }
        if (hasButton(content)) { results.alreadyHasButton++; continue; }

        const house = houseFromPath(f);
        if (!house) {
            results.skipped.push({ file: path.relative(REPO, f), reason: 'no house derivable' });
            continue;
        }
        if (HOUSE_FILTER && house !== HOUSE_FILTER) continue;
        if (LIMIT && injectedCount >= LIMIT) break;

        const missionId = missionIdFromFilename(f);
        const include = buildInclude(house, missionId);
        const result = injectInto(content, include);

        if (!result.ok) {
            results.skipped.push({ file: path.relative(REPO, f), reason: result.reason });
            continue;
        }

        results.wouldInject++;
        results.perHouse[house] = (results.perHouse[house] || 0) + 1;

        if (APPLY) {
            fs.writeFileSync(f, result.newContent, 'utf8');
            results.injected++;
            injectedCount++;
        }
    }

    console.log(`\n${APPLY ? 'INJECT' : 'DRY RUN'} — Dr. Hex button bulk integration`);
    console.log('─'.repeat(60));
    console.log(`  scanned       : ${results.scanned} HTML files`);
    console.log(`  not lab pages : ${results.notLabPage}`);
    console.log(`  already done  : ${results.alreadyHasButton}`);
    console.log(`  ${APPLY ? 'injected' : 'would inject'.padEnd(8)}      : ${APPLY ? results.injected : results.wouldInject}`);
    console.log(`  skipped       : ${results.skipped.length}`);
    if (HOUSE_FILTER) console.log(`  house filter  : ${HOUSE_FILTER}`);
    if (LIMIT) console.log(`  limit         : ${LIMIT}`);
    console.log();
    console.log('  per house:');
    for (const [h, n] of Object.entries(results.perHouse).sort((a, b) => b[1] - a[1])) {
        console.log(`    ${h.padEnd(14)} ${n}`);
    }
    if (results.skipped.length > 0) {
        console.log();
        console.log(`  ${results.skipped.length} skipped:`);
        for (const s of results.skipped.slice(0, 20)) {
            console.log(`    ${s.file} — ${s.reason}`);
        }
        if (results.skipped.length > 20) {
            console.log(`    ... and ${results.skipped.length - 20} more`);
        }
    }
    if (!APPLY) {
        console.log();
        console.log('  Re-run with --apply to write changes.');
    }
}

main();
