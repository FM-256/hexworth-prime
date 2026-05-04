#!/usr/bin/env node
'use strict';

/**
 * EduScan Staged Runner — Stage 1 Pre-Commit Lint
 *
 * Runs ONLY per-file validators against the named files. Designed to be invoked
 * from a Git pre-commit hook with the list of staged files.
 *
 * Per the safety net architecture (_docs/operations/safety-net-architecture.md
 * §"Stage 1 — Pre-commit"), this runner deliberately:
 *   - INCLUDES the .validate(file) method of every per-file validator
 *   - EXCLUDES global validators (PROG-003, HUB-001, XREF-001, content-catalog,
 *     assignment-links, learning-paths, csp, palette, tags) — those run at Stage 2
 *   - EXCLUDES the .validateGlobal() halves of partial validators (heuristics
 *     renderer/overlay sweeps, sandbox global, xp-audit global) — also Stage 2
 *
 * Usage:
 *   node _tools/eduscan/staged.js <file1> <file2> ...
 *
 * Exit codes:
 *   0 — no critical issues found (warnings/info do not block)
 *   1 — at least one critical issue found
 *   2 — runner error (bad args, missing file, validator crash)
 *
 * Override (emergency only — logged):
 *   PRECOMMIT_BYPASS=1 PRECOMMIT_BYPASS_REASON="why" git commit ...
 */

const fs = require('fs');
const path = require('path');

// ── PER-FILE VALIDATORS (Stage 1 contract) ───────────────────────────
// Order matters only for output predictability. Each validator is independent.

const VALIDATORS = [
    { name: 'emoji',          mod: './validators/syntax/emoji' },
    { name: 'naming',         mod: './validators/syntax/naming' },
    { name: 'paths',          mod: './validators/syntax/paths' },
    { name: 'heuristics',     mod: './validators/syntax/heuristics' },
    { name: 'html',           mod: './validators/syntax/html' },
    { name: 'js',             mod: './validators/syntax/js' },
    { name: 'progress-keys',  mod: './validators/syntax/progress-keys' },
    { name: 'dependency',     mod: './validators/syntax/dependency-check' },
    { name: 'engine',         mod: './validators/syntax/engine' },
    { name: 'flex-overflow',  mod: './validators/syntax/flex-overflow' },
    { name: 'navigation',     mod: './validators/syntax/navigation' },
    { name: 'semantic',       mod: './validators/syntax/semantic' },
    { name: 'ux',             mod: './validators/syntax/ux' },
    { name: 'linux-terminal', mod: './validators/syntax/linux-terminal' },
    { name: 'sandbox',        mod: './validators/syntax/sandbox' },
    { name: 'turtle',         mod: './validators/syntax/turtle' },
    { name: 'xp-audit',       mod: './validators/syntax/xp-audit' },
    { name: 'content-blob',   mod: './validators/syntax/content-blob' },
];

// Severities that BLOCK a commit. Lower severities print but do not fail.
const BLOCKING_SEVERITIES = new Set(['critical', 'high']);

// File extensions the staged runner cares about. Other staged files (md, png,
// gitignore, etc.) are silently skipped — the per-file validators don't apply.
const SCANNABLE_EXTS = new Set(['.html', '.js', '.css', '.json']);

// ── FILE LOADING ─────────────────────────────────────────────────────
// Validators expect { path, content } objects with absolute paths or paths
// relative to project root. The hook passes whatever git diff returns (paths
// relative to repo root). We resolve once, here.

function loadFile(filePath) {
    // git returns repo-root-relative paths. Resolve to absolute for fs ops.
    // CRITICAL: validators (notably paths.js) expect either absolute paths or
    // paths relative to their rootPath. Passing repo-root-relative paths like
    // "_app/index.html" produces false positives because the validator
    // interprets the leading "_app/" segment as part of the file's location
    // within rootPath, mis-resolving relative <script src> references.
    const abs = path.isAbsolute(filePath) ? filePath : path.resolve(filePath);
    if (!fs.existsSync(abs)) {
        // Could be a deleted file in the diff — skip silently.
        return null;
    }
    let content;
    try {
        content = fs.readFileSync(abs, 'utf8');
    } catch (e) {
        // Binary file, permission issue — skip.
        return null;
    }
    return { path: abs, content };
}

// ── MAIN ─────────────────────────────────────────────────────────────

function main() {
    const args = process.argv.slice(2);

    if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
        process.stdout.write(
            'EduScan staged runner — Stage 1 pre-commit lint\n' +
            'Usage: node _tools/eduscan/staged.js <file1> <file2> ...\n' +
            'Exits 0 if no critical/high issues, 1 otherwise.\n'
        );
        process.exit(args.length === 0 ? 2 : 0);
    }

    const scannable = args
        .filter(p => SCANNABLE_EXTS.has(path.extname(p)))
        .map(loadFile)
        .filter(f => f !== null);

    if (scannable.length === 0) {
        // Nothing to scan — pass.
        process.exit(0);
    }

    // Instantiate validators once (avoids repeated catalog/asset loads).
    // Each validator's options.rootPath defaults to ./_app where needed.
    const validators = VALIDATORS.map(v => {
        try {
            const Mod = require(v.mod);
            return { name: v.name, instance: new Mod({ rootPath: '_app', profile: 'ci' }) };
        } catch (e) {
            process.stderr.write(`[staged] WARNING: failed to load ${v.name}: ${e.message}\n`);
            return null;
        }
    }).filter(v => v !== null);

    const allIssues = [];
    const start = Date.now();

    for (const file of scannable) {
        // The per-file validators in this list assume HTML content. The main
        // EduScan orchestrator (validators/syntax/index.js) restricts every
        // per-file validator to .html files for the same reason — running
        // html.js / progress-keys.js / etc. on a .js file produces noise like
        // "Unclosed <script> tag" because the parser interprets JS source as
        // partial HTML. Skip non-HTML at Stage 1; richer per-file checks for
        // .js/.css/.json are future work.
        if (!file.path.endsWith('.html')) continue;

        for (const v of validators) {
            let issues;
            try {
                issues = v.instance.validate(file);
            } catch (e) {
                process.stderr.write(`[staged] validator ${v.name} crashed on ${file.path}: ${e.message}\n`);
                continue;
            }
            if (!issues) continue;
            // Some validators return { issues: [...] }, others return array directly.
            const arr = Array.isArray(issues) ? issues : (issues.issues || []);
            for (const i of arr) {
                allIssues.push({ ...i, validator: v.name });
            }
        }
    }

    const elapsed = Date.now() - start;

    // ── REPORT ────────────────────────────────────────────────────────
    const blocking = allIssues.filter(i => BLOCKING_SEVERITIES.has(i.severity));
    const advisory = allIssues.filter(i => !BLOCKING_SEVERITIES.has(i.severity));

    if (allIssues.length === 0) {
        process.stdout.write(`[staged] OK — ${scannable.length} file(s) clean (${elapsed}ms)\n`);
        process.exit(0);
    }

    if (blocking.length > 0) {
        process.stdout.write(`[staged] BLOCKED — ${blocking.length} blocking issue(s) in ${scannable.length} file(s):\n`);
        for (const i of blocking) {
            process.stdout.write(`  ${i.severity.toUpperCase()} ${i.code} ${i.file}${i.line ? ':' + i.line : ''}\n    ${i.message.split('\n')[0].substring(0, 200)}\n`);
        }
    }
    if (advisory.length > 0) {
        process.stdout.write(`[staged] ${advisory.length} advisory issue(s) (non-blocking):\n`);
        for (const i of advisory.slice(0, 10)) {
            process.stdout.write(`  ${i.severity} ${i.code} ${i.file}${i.line ? ':' + i.line : ''}\n`);
        }
        if (advisory.length > 10) {
            process.stdout.write(`  ... +${advisory.length - 10} more\n`);
        }
    }

    process.stdout.write(`[staged] ${blocking.length === 0 ? 'PASS' : 'FAIL'} — ${elapsed}ms\n`);
    process.exit(blocking.length === 0 ? 0 : 1);
}

main();
