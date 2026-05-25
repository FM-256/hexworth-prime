#!/usr/bin/env node
/**
 * hex-ai-button-presence-audit.js — finds lab pages that don't yet
 * include the floating Dr. Hex mood-ring button.
 *
 * Standalone validator; not yet wired into the main scanner spoke
 * list (planned follow-up). Run on demand:
 *
 *     node _tools/eduscan/hex-ai-button-presence-audit.js
 *
 * Outputs a markdown report to stdout listing every lab-style page
 * missing the <hex-ai-button> custom element + the HexAIButton.js
 * script include.
 *
 * What counts as a "lab page" for this validator:
 *  - File path matches one of:
 *      _app/houses/<slug>/**.html  (excluding _archive, _drafts)
 *      _app/dispatch/<box>/**.html
 *  - File contains either:
 *      a script that loads ContentCatalog.js (curriculum page), OR
 *      a div with id matching /lab-engine|box-engine|quiz-shell/, OR
 *      a data-mission-id attribute
 *  - File is NOT an admin page (skip _app/admin/)
 *  - File is NOT a renderer/shared component
 *
 * What counts as "button present":
 *  - Contains the string `<hex-ai-button` anywhere
 *  - AND contains `HexAIButton.js` in a script src
 *
 * Severity: MEDIUM. A missing button doesn't break a page; it just
 * means the AI surface is unavailable to students on that page.
 *
 * Code: HEX-AI-001 (provisional — assign formal HEUR/XREF code when
 * wiring into the scanner spoke list).
 */
const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '..', '..');
const APP = path.join(REPO, '_app');

const SKIP_DIRS = new Set([
    '_archive', '_drafts', 'admin', 'components', '_shared',
    'assets', 'fonts', 'images', '_lib',
]);

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

function isLabPage(content, filepath) {
    if (filepath.includes('/admin/')) return false;
    if (filepath.includes('/_archive/') || filepath.includes('/_drafts/')) return false;
    const inLabDir =
        filepath.includes('/_app/houses/') ||
        filepath.includes('/_app/dispatch/');
    if (!inLabDir) return false;
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
    return /<hex-ai-button/.test(content) && /HexAIButton\.js/.test(content);
}

function main() {
    const labRoots = [
        path.join(APP, 'houses'),
        path.join(APP, 'dispatch'),
    ];
    const allHtml = [];
    for (const root of labRoots) walk(root, allHtml);

    const labs = [];
    const missing = [];
    for (const f of allHtml) {
        const content = fs.readFileSync(f, 'utf8');
        if (!isLabPage(content, f)) continue;
        labs.push(f);
        if (!hasButton(content)) missing.push(f);
    }

    const total = labs.length;
    const ok = total - missing.length;
    const pct = total ? Math.round(ok / total * 100) : 0;

    const out = [];
    out.push('# Hex AI Button Presence Audit');
    out.push('');
    out.push('Code: HEX-AI-001 (provisional)');
    out.push('Generated: ' + new Date().toISOString());
    out.push('');
    out.push(`## Summary`);
    out.push('');
    out.push(`- Lab-style pages found: **${total}**`);
    out.push(`- Pages WITH button: **${ok}** (${pct}%)`);
    out.push(`- Pages MISSING button: **${missing.length}**`);
    out.push('');
    if (missing.length === 0) {
        out.push('✅ All eligible lab pages include the floating Dr. Hex button.');
    } else {
        out.push('## Pages missing the button');
        out.push('');
        out.push('To fix: add to the page (just before `</body>`):');
        out.push('');
        out.push('```html');
        out.push('<hex-ai-button mission-id="<your-mission-id>" house="<house-slug>"></hex-ai-button>');
        out.push('<script type="module" src="/_lib/HexAIButton.js"></script>');
        out.push('```');
        out.push('');
        out.push('### Affected files');
        out.push('');
        for (const f of missing) {
            const rel = path.relative(REPO, f);
            out.push(`- \`${rel}\``);
        }
    }

    const report = out.join('\n') + '\n';
    process.stdout.write(report);

    // Exit code: 1 if any missing (so CI/cron can flag), 0 if all OK
    process.exit(missing.length > 0 ? 1 : 0);
}

if (require.main === module) main();
