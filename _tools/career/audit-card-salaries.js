#!/usr/bin/env node
/**
 * audit-card-salaries.js
 *
 * @catalog what    Re-derives every career-paths.html card's salary band from that house's own
 * @catalog what    careers.html and reports card-vs-source drift plus any role a card names that
 * @catalog what    its source page does not have.
 * @catalog run     node _tools/career/audit-card-salaries.js [--json]
 * @catalog status  TOOL
 *
 * WHY
 * ---
 * career-paths.html shows a salary band per house. Those numbers were hand-authored and nothing
 * checked them, so on 2026-08-29 a card shipped claiming a $185K ceiling while listing a $210K
 * role directly above it. Pay data is the worst thing on a careers page to get wrong, and the
 * only durable fix is to derive it from a source and keep re-deriving.
 *
 * THE HARD PART IS PARSING, AND A CLEAN ZERO IS A SMELL
 * ----------------------------------------------------
 * The 13 careers pages use at least two families of structure and many class vocabularies. A
 * first pass reported "0 roles found" for five houses and that was the PARSER failing, not the
 * data missing. Both families are handled here and the tool reports how many roles it found per
 * page, so a zero is visible as a parser problem rather than silently becoming "no data".
 *   - JS data array:  title: '...', level: '...', salary: '$NNK to $NNK'   (matrix, eye, code,
 *                     forge, script)
 *   - HTML blocks:    a title element then a salary element, where the class vocabulary varies
 *                     (career-role-title / role-title / fc-role-title, and
 *                      career-role-salary / role-salary / span.salary)
 *
 * Exit code is 0 for a clean report and 1 if any card drifts or names a role its page lacks, so
 * this can back a test or a gate.
 */

const fs = require('fs');
const path = require('path');

const REPO = path.resolve(__dirname, '../..');
const APP = path.join(REPO, '_app');
const PAGE = path.join(APP, 'career/career-paths.html');

/** Roles + bands from one careers page, trying both structural families. */
function extractRoles(html) {
    const out = [];

    // Family 1: JS data array entries.
    for (const m of html.matchAll(/title: *'([^']+)'[\s\S]{0,400}?salary: *'\$(\d{2,3})K to \$(\d{2,3})K/g)) {
        out.push({ title: m[1], lo: +m[2], hi: +m[3] });
    }

    // Family 2: an HTML title element followed by a salary element. Kept as one regex over the
    // union of observed class names rather than a per-house special case, so a new page with a
    // familiar vocabulary is picked up without editing this file.
    const RE = /(?:career-role-title|role-title|fc-role-title|role-name)"[^>]*>([^<]{3,70})<[\s\S]{0,1200}?(?:career-role-salary|role-salary|fc-role-salary|class="salary)[^>]*>\$(\d{2,3})K\s*(?:to|-|–)\s*\$(\d{2,3})K/g;
    for (const m of html.matchAll(RE)) {
        out.push({ title: m[1], lo: +m[2], hi: +m[3] });
    }

    return out.map(r => ({ ...r, title: r.title.replace(/&amp;/g, '&').trim() }));
}

/** "Data Protection Officer (GDPR / CCPA)" and "Data Protection Officer" should match. */
function normalize(s) {
    return s.toLowerCase().replace(/\([^)]*\)/g, '').replace(/[^a-z0-9]/g, '');
}

/**
 * Several source pages give one entry two names: "Vulnerability Researcher, Exploit Developer",
 * "SOC Analyst (Tier 3) / Senior SOC Analyst". A card naming either half is naming a role the
 * page really has, so split on comma and slash and try each part. Without this the miss looks
 * like a content gap when it is only a punctuation difference.
 */
function titleVariants(title) {
    const parts = title.split(/\s*[,/]\s*/).map(s => s.trim()).filter(s => s.length > 3);
    return [title, ...parts];
}

function matchRole(named, roles) {
    const n = normalize(named);
    // normalize() drops parenthesised text and punctuation, so a step like "(Analyst)" becomes
    // "". Every string startsWith("") is true, which would silently match EVERY role and span a
    // salary band across unrelated ones. An unmatchable name is a miss, not a wildcard.
    if (!n) return null;
    const hit = pred => roles.filter(r => titleVariants(r.title).some(v => pred(normalize(v))));
    let best = hit(v => v === n);
    if (!best.length) best = hit(v => v.startsWith(n) || n.startsWith(v));
    if (!best.length) return null;
    // Several matches (a role listed at two levels): span them all, do not pick one arbitrarily.
    return { lo: Math.min(...best.map(r => r.lo)), hi: Math.max(...best.map(r => r.hi)),
        titles: best.map(r => r.title) };
}

/**
 * A roadmap step is a MILESTONE ("Foundations", "Hardening") or a JOB CLAIM ("Red Team Lead").
 * Only job claims have to name a real role. Detected by the trailing noun rather than by a
 * hand-kept allowlist, so a new card is covered without editing this file.
 *
 * This check exists because the salary fix was scoped to `careers:` and stopped there, while the
 * `roadmap:` array one field below still promised "Cryptographer" and "PKI Engineer" for House of
 * the Key -- the exact two titles the commit message cited as the platform mis-selling that
 * house. Fixing one field and not the one beside it is why this is now enforced.
 */
// Matched ANYWHERE in the step, not anchored to the last word: "Director of Cryptographic
// Engineering" ends in "Engineering" and an end-anchored test skipped it, which is precisely the
// House of the Key claim this check exists for.
const JOB_NOUN = /\b(Analyst|Engineer|Architect|Lead|Officer|Administrator|Sysadmin|Tester|Researcher|Developer|Director|Consultant|Manager|Operator|Specialist|Investigator|Hunter|Responder|Reviewer|Hacker|Pentester)\b/i;

/** "GRC Analyst Role" is a milestone phrasing of the real role "GRC Analyst". */
const stripMilestoneSuffix = s => s.replace(/\s+(Role|Position)$/i, '');

function cards() {
    const page = fs.readFileSync(PAGE, 'utf8');
    const out = [];
    const re = /name: '([^']+)',\s*\n\s*id: '([^']+)',[\s\S]*?careers: \[([^\]]+)\][\s\S]*?salary: '([^']+)'[\s\S]*?roadmap: \[([\s\S]*?)\n\s*\]\n\s*\}/g;
    for (const m of page.matchAll(re)) {
        out.push({
            name: m[1], id: m[2],
            roles: [...m[3].matchAll(/'([^']+)'/g)].map(x => x[1]),
            salary: m[4],
            steps: [...m[5].matchAll(/step: '([^']+)'/g)].map(x => x[1]).filter(s => JOB_NOUN.test(s)),
        });
    }
    return out;
}

function sourceFor(id) {
    return id === 'signal' ? 'signal/careers.html' : `houses/${id}/careers.html`;
}

function main() {
    const asJson = process.argv.includes('--json');
    const report = [];

    for (const c of cards()) {
        const rel = sourceFor(c.id);
        const file = path.join(APP, rel);
        if (!fs.existsSync(file)) { report.push({ ...c, error: 'no source page' }); continue; }
        const roles = extractRoles(fs.readFileSync(file, 'utf8'));

        const matched = c.roles.map(r => ({ named: r, hit: matchRole(r, roles) }));
        const missing = matched.filter(m => !m.hit).map(m => m.named);

        // Roadmap steps that are job claims are held to the same bar as `careers:`. The
        // milestone suffix is stripped first, so "GRC Analyst Role" is checked as "GRC Analyst".
        const badSteps = c.steps
            .map(stripMilestoneSuffix)
            .filter(s => !matchRole(s, roles))
            .map(s => `roadmap: ${s}`);
        missing.push(...badSteps);
        let derived = null;
        if (!missing.length && matched.length) {
            const lo = Math.min(...matched.map(m => m.hit.lo));
            const hi = Math.max(...matched.map(m => m.hit.hi));
            derived = `$${lo},000 - $${hi},000`;
        }
        report.push({ name: c.name, id: c.id, source: rel, rolesOnPage: roles.length,
            card: c.salary, derived, missing, ok: derived !== null && derived === c.salary });
    }

    if (asJson) { console.log(JSON.stringify(report, null, 2)); }
    else {
        console.log(`${'house'.padEnd(11)} ${'src roles'.padEnd(9)} ${'card'.padEnd(22)} ${'derived'.padEnd(22)} status`);
        for (const r of report) {
            const status = r.error ? r.error
                : r.missing.length ? `NOT ON PAGE: ${r.missing.join(', ')}`
                : r.ok ? 'ok' : 'DRIFT';
            console.log(`${r.name.padEnd(11)} ${String(r.rolesOnPage).padEnd(9)} ${r.card.padEnd(22)} ${(r.derived || '-').padEnd(22)} ${status}`);
        }
        const bad = report.filter(r => !r.ok);
        console.log(`\n${report.length - bad.length}/${report.length} cards match their source.`);
        if (bad.length) console.log(`${bad.length} need attention.`);
    }

    process.exitCode = report.every(r => r.ok) ? 0 : 1;
}

main();
