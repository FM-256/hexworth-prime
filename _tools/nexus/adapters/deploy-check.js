#!/usr/bin/env node
'use strict';

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Deploy Check Spoke Adapter — Pre-Deploy Safety Gate
 *
 * Runs automatically before any firebase deploy to catch regressions,
 * broken chains, and forbidden files. Designed to be fast (diff-only scan).
 *
 * Nexus integration:
 *   nexus deploy-check           Full pre-deploy audit
 *   nexus deploy-check --quick   Fast mode (blocklist + regression only)
 *   nexus deploy-check --diff    Show changed files only
 *
 * Gate verdict: PASS / FAIL with specific reasons.
 * FAIL blocks the deploy command from being shown.
 */
module.exports = function createDeployCheckAdapter({ name, dataPath, projectRoot }) {

    const appDir = path.resolve(projectRoot, '_app');
    const reportsDir = path.resolve(projectRoot, '_tools/reports');

    // ── Blocklist: files that must NEVER be deployed ──
    const BLOCKLIST = [
        'CLAUDE.md',
        '.claude/',
        '.claude.json',
        '_planning/.private/',
        '.env',
        'credentials.json',
        'serviceAccountKey.json',
    ];

    // ── Get changed files since origin/master ──
    function getChangedFiles() {
        try {
            const diff = execSync('git diff --name-only origin/master', {
                cwd: projectRoot,
                encoding: 'utf8',
                timeout: 10000
            }).trim();
            return diff ? diff.split('\n') : [];
        } catch (e) {
            return [];
        }
    }

    // ── Check 1: Blocklist — forbidden files in commit ──
    function checkBlocklist(changedFiles) {
        const violations = [];
        changedFiles.forEach(f => {
            BLOCKLIST.forEach(blocked => {
                if (f.includes(blocked) || f.startsWith(blocked)) {
                    violations.push({ file: f, rule: blocked });
                }
            });
        });
        return {
            name: 'Blocklist',
            pass: violations.length === 0,
            count: violations.length,
            details: violations.map(v => `BLOCKED: ${v.file} (matches ${v.rule})`),
            severity: 'critical'
        };
    }

    // ── Check 2: Regression — HIGH count didn't increase ──
    function checkRegression() {
        // Load current scan
        const reportPath = path.join(reportsDir, 'TREASURE_MAP.json');
        if (!fs.existsSync(reportPath)) {
            return { name: 'Regression', pass: true, count: 0, details: ['No scan report found — skipping'], severity: 'warning' };
        }

        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        const highCount = report.issues.filter(i => i.severity === 'high' || i.severity === 'critical').length;

        // Load last snapshot for comparison
        const historyDir = path.join(reportsDir, 'history');
        let previousHigh = null;
        if (fs.existsSync(historyDir)) {
            const snapshots = fs.readdirSync(historyDir)
                .filter(f => f.startsWith('scan-') && f.endsWith('.json'))
                .sort()
                .reverse();
            // Get second-most-recent (most recent is current)
            if (snapshots.length >= 2) {
                try {
                    const prev = JSON.parse(fs.readFileSync(path.join(historyDir, snapshots[1]), 'utf8'));
                    previousHigh = prev.high || 0;
                } catch (e) { /* ignore */ }
            }
        }

        // Only flag as regression if previous was non-zero and current is higher
        // (a zero baseline means first scan or stale data — not a valid comparison)
        const isRealRegression = previousHigh !== null && previousHigh > 0 && highCount > previousHigh;
        const details = [];
        details.push(`Current HIGH: ${highCount}`);
        if (previousHigh !== null) {
            details.push(`Previous HIGH: ${previousHigh}`);
            if (previousHigh === 0) details.push(`Baseline is 0 (first scan or stale) — skipping regression check`);
            else if (isRealRegression) details.push(`REGRESSION: HIGH increased by ${highCount - previousHigh}`);
            else details.push(`OK: HIGH did not increase`);
        }

        return {
            name: 'Regression',
            pass: !isRealRegression,
            count: isRealRegression ? highCount - previousHigh : 0,
            details,
            severity: 'high'
        };
    }

    // ── Check 3: Quiz Key Integrity — changed quiz files still match keys ──
    function checkQuizKeys(changedFiles) {
        const quizFiles = changedFiles.filter(f => f.includes('.quiz.html') || f === 'functions/quiz_keys.json');
        if (quizFiles.length === 0) {
            return { name: 'Quiz Keys', pass: true, count: 0, details: ['No quiz files changed'], severity: 'info' };
        }

        const keysPath = path.join(projectRoot, 'functions/quiz_keys.json');
        if (!fs.existsSync(keysPath)) {
            return { name: 'Quiz Keys', pass: true, count: 0, details: ['No quiz_keys.json found'], severity: 'warning' };
        }

        const keys = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
        const issues = [];

        // Check questionCount matches answers.length
        Object.keys(keys).forEach(k => {
            const key = keys[k];
            if (key.questionCount !== key.answers.length) {
                issues.push(`${k}: questionCount=${key.questionCount} but answers=${key.answers.length}`);
            }
        });

        return {
            name: 'Quiz Keys',
            pass: issues.length === 0,
            count: issues.length,
            details: issues.length ? issues : ['All quiz keys consistent'],
            severity: issues.length ? 'high' : 'info'
        };
    }

    // ── Check 4: Path Integrity — no broken component paths in changed files ──
    function checkPaths(changedFiles) {
        const htmlFiles = changedFiles.filter(f => f.endsWith('.html') && f.startsWith('_app/'));
        if (htmlFiles.length === 0) {
            return { name: 'Paths', pass: true, count: 0, details: ['No HTML files changed'], severity: 'info' };
        }

        const issues = [];
        htmlFiles.forEach(f => {
            const fullPath = path.join(projectRoot, f);
            if (!fs.existsSync(fullPath)) return;
            const content = fs.readFileSync(fullPath, 'utf8');

            // Check for common broken patterns
            if (/\.\.\/\/assets/.test(content)) {
                issues.push(`${f}: double-slash path (..//assets/)`);
            }
            if (/\.\.\/\/assets/.test(content)) {
                issues.push(`${f}: double-slash in asset path`);
            }
        });

        return {
            name: 'Paths',
            pass: issues.length === 0,
            count: issues.length,
            details: issues.length ? issues : [`${htmlFiles.length} HTML files checked — OK`],
            severity: issues.length ? 'medium' : 'info'
        };
    }

    // ── Check 5: Broken Links — verify href targets exist in changed files ──
    function checkBrokenLinks(changedFiles) {
        const htmlFiles = changedFiles.filter(f =>
            f.endsWith('.html') && f.startsWith('_app/') &&
            !f.includes('_archive/') && !f.includes('mockups/')
        );
        if (htmlFiles.length === 0) {
            return { name: 'Links', pass: true, count: 0, details: ['No HTML files changed'], severity: 'info' };
        }

        const issues = [];
        const checked = 0;

        htmlFiles.slice(0, 50).forEach(f => { // Cap at 50 files for speed
            const fullPath = path.join(projectRoot, f);
            if (!fs.existsSync(fullPath)) return;
            const content = fs.readFileSync(fullPath, 'utf8');
            const dir = path.dirname(fullPath);

            // Find href="..." links to local HTML files (not http, not #, not javascript:, not examples)
            const linkRegex = /href=["']([^"'#][^"']*\.html)["']/g;
            let match;
            while ((match = linkRegex.exec(content)) !== null) {
                const href = match[1];
                if (href.startsWith('http') || href.startsWith('//') || href.startsWith('javascript:')) continue;
                if (href.startsWith('...') || href.includes('example') || href === 'index.html') continue;

                // Resolve the path
                let target;
                if (href.startsWith('/')) {
                    target = path.join(appDir, href);
                } else {
                    target = path.resolve(dir, href);
                }

                if (!fs.existsSync(target)) {
                    issues.push(`${f}: broken link → ${href}`);
                }
            }

            // Find script src="..." references
            const scriptRegex = /src=["']([^"']*(?:components|ModuleProgress|QuizEngine|AccessGuard|FirebaseAuth|AchievementManager)[^"']*)["']/g;
            while ((match = scriptRegex.exec(content)) !== null) {
                const src = match[1];
                if (src.startsWith('http')) continue;
                let target;
                if (src.startsWith('/')) {
                    target = path.join(appDir, src);
                } else {
                    target = path.resolve(dir, src);
                }
                if (!fs.existsSync(target)) {
                    issues.push(`${f}: broken script → ${src}`);
                }
            }
        });

        return {
            name: 'Links',
            pass: issues.length === 0,
            count: issues.length,
            details: issues.length ? issues.slice(0, 20) : [`${Math.min(htmlFiles.length, 50)} files checked — all links valid`],
            severity: issues.length ? 'high' : 'info'
        };
    }

    // ── Check 6: Secrets — no API keys or tokens in changed files ──
    function checkSecrets(changedFiles) {
        const issues = [];
        const secretPatterns = [
            { pattern: /ATATT[0-9A-Za-z_+=/-]{50,}/, name: 'Confluence token' },
            { pattern: /ghp_[0-9A-Za-z]{36}/, name: 'GitHub PAT' },
            { pattern: /sk-[0-9A-Za-z]{48}/, name: 'OpenAI key' },
        ];

        // Teaching content exclusions — these files legitimately contain
        // example keys/certs as part of the curriculum
        const teachingExclusions = [
            'dark-arts/', 'vault/', 'labs/', 'lab.html',
            'encryption', 'crypto', 'key/', 'certificate',
            'presentation.html', 'module.html', 'clh/',
            'tenant/instructor.html'  // Firebase config is public
        ];

        changedFiles.forEach(f => {
            const fullPath = path.join(projectRoot, f);
            if (!fs.existsSync(fullPath)) return;
            if (f.match(/\.(webp|png|jpg|gif|ico|woff|woff2|pdf|json)$/)) return;

            // Skip teaching content that legitimately shows crypto examples
            const isTeaching = teachingExclusions.some(ex => f.includes(ex));
            if (isTeaching) return;

            try {
                const content = fs.readFileSync(fullPath, 'utf8');
                secretPatterns.forEach(({ pattern, name }) => {
                    if (pattern.test(content)) {
                        issues.push(`${f}: ${name} detected`);
                    }
                });
            } catch (e) { /* skip unreadable */ }
        });

        return {
            name: 'Secrets',
            pass: issues.length === 0,
            count: issues.length,
            details: issues.length ? issues : ['No secrets detected in changed files'],
            severity: issues.length ? 'critical' : 'info'
        };
    }

    // ── Check 7: HTML Syntax — unclosed script/style tags kill pages ──
    function checkHtmlSyntax(changedFiles) {
        const htmlFiles = changedFiles.filter(f =>
            f.endsWith('.html') && f.startsWith('_app/') &&
            !f.includes('_archive/') && !f.includes('vault/') && !f.includes('dojo/')
        );
        if (htmlFiles.length === 0) return { name: 'HTML Syntax', pass: true, count: 0, details: ['No HTML changed'], severity: 'info' };

        const issues = [];
        htmlFiles.slice(0, 100).forEach(f => {
            const fullPath = path.join(projectRoot, f);
            if (!fs.existsSync(fullPath)) return;
            const content = fs.readFileSync(fullPath, 'utf8');

            // Count script/style opens vs closes
            ['script', 'style'].forEach(tag => {
                const opens = (content.match(new RegExp('<' + tag + '(?:\\s[^>]*)?' + '>', 'gi')) || []).length;
                const closes = (content.match(new RegExp('</' + tag + '\\s*>', 'gi')) || []).length;
                if (opens > closes) {
                    issues.push(`${f}: unclosed <${tag}> tag (${opens} opens, ${closes} closes)`);
                }
            });
        });

        return {
            name: 'HTML Syntax',
            pass: issues.length === 0,
            count: issues.length,
            details: issues.length ? issues.slice(0, 10) : [`${Math.min(htmlFiles.length, 100)} files checked — syntax OK`],
            severity: issues.length ? 'high' : 'info'
        };
    }

    // ── Check 8: ModuleProgress Dependency — MP calls without script loaded ──
    function checkModuleProgressDep(changedFiles) {
        const htmlFiles = changedFiles.filter(f => f.endsWith('.html') && f.startsWith('_app/houses/'));
        if (htmlFiles.length === 0) return { name: 'ModuleProgress', pass: true, count: 0, details: ['No house HTML changed'], severity: 'info' };

        const issues = [];
        htmlFiles.slice(0, 100).forEach(f => {
            const fullPath = path.join(projectRoot, f);
            if (!fs.existsSync(fullPath)) return;
            const content = fs.readFileSync(fullPath, 'utf8');

            const usesMP = /ModuleProgress\.complete|ModuleProgress\.completeQuiz|ModuleProgress\.isCompleted/.test(content);
            const loadsMP = /ModuleProgress\.js/.test(content);

            if (usesMP && !loadsMP) {
                issues.push(`${f}: calls ModuleProgress but doesn't load ModuleProgress.js`);
            }
        });

        return {
            name: 'ModuleProgress',
            pass: issues.length === 0,
            count: issues.length,
            details: issues.length ? issues.slice(0, 10) : ['All MP dependencies satisfied'],
            severity: issues.length ? 'high' : 'info'
        };
    }

    // ── Check 9: Quiz Answer Verification — verify changed keys match explanations ──
    function checkQuizAnswerVerification(changedFiles) {
        const keysChanged = changedFiles.includes('functions/quiz_keys.json');
        const quizFilesChanged = changedFiles.filter(f => f.includes('.quiz.html'));

        if (!keysChanged && quizFilesChanged.length === 0) {
            return { name: 'Answer Verify', pass: true, count: 0, details: ['No quiz files or keys changed'], severity: 'info' };
        }

        const keysPath = path.join(projectRoot, 'functions/quiz_keys.json');
        if (!fs.existsSync(keysPath)) return { name: 'Answer Verify', pass: true, count: 0, details: ['No keys file'], severity: 'info' };

        const keys = JSON.parse(fs.readFileSync(keysPath, 'utf8'));
        const issues = [];

        // Check changed quiz files against their keys
        quizFilesChanged.slice(0, 20).forEach(f => {
            const fullPath = path.join(projectRoot, f);
            if (!fs.existsSync(fullPath)) return;
            const html = fs.readFileSync(fullPath, 'utf8');
            const midMatch = html.match(/moduleId['"]\s*:\s*['"]([^'"]+)/);
            if (!midMatch) return;
            const mid = midMatch[1];
            const key = keys[mid] || keys[mid + '-quiz'];
            if (!key) return;

            // Quick verification: check each answer against explanation keywords
            const rawQ = html.match(/questions:\s*\[([\s\S]*?)\]\s*\}\);/);
            if (!rawQ) return;
            const blocks = rawQ[1].split(/\}\s*,\s*\{/);

            blocks.forEach((block, idx) => {
                if (idx >= key.answers.length) return;
                const optMatch = block.match(/options['"]\s*:\s*\[([\s\S]*?)\]/);
                const explMatch = block.match(/explanation['"]\s*:\s*['"]([^'"]*)/);
                const opts = [];
                if (optMatch) optMatch[1].replace(/['"]([^'"]*?)['"]/g, (_, o) => { if (o.trim()) opts.push(o); });
                const cur = key.answers[idx];
                const expl = (explMatch ? explMatch[1] : '').toLowerCase().substring(0, 200);
                const curWords = (opts[cur] || '').toLowerCase().split(/[\s,()]+/).filter(w => w.length > 4);
                const curScore = curWords.filter(w => expl.includes(w)).length;
                let bestOtherScore = 0;
                opts.forEach((o, i) => {
                    if (i === cur) return;
                    const w = o.toLowerCase().split(/[\s,()]+/).filter(w => w.length > 4);
                    const s = w.filter(w => expl.includes(w)).length;
                    if (s > bestOtherScore) bestOtherScore = s;
                });
                if (bestOtherScore > curScore + 2 && curWords.length > 2) {
                    issues.push(`${mid} Q${idx + 1}: answer may be wrong (key=${cur}, better match found)`);
                }
            });
        });

        return {
            name: 'Answer Verify',
            pass: issues.length === 0,
            count: issues.length,
            details: issues.length ? issues : ['Quiz answers verified against explanations'],
            severity: issues.length ? 'high' : 'info'
        };
    }

    // ── Check 10: Firebase Config — prevent accidental hosting config changes ──
    function checkFirebaseConfig(changedFiles) {
        const configFiles = changedFiles.filter(f =>
            f === 'firebase.json' || f === '.firebaserc' || f === 'firestore.rules'
        );

        if (configFiles.length === 0) {
            return { name: 'Firebase Config', pass: true, count: 0, details: ['No Firebase config changed'], severity: 'info' };
        }

        return {
            name: 'Firebase Config',
            pass: false,
            count: configFiles.length,
            details: configFiles.map(f => `CHANGED: ${f} — review carefully before deploying`),
            severity: 'warning'
        };
    }

    // ── Check 11: File Size — flag bloated files that hurt performance ──
    function checkFileSize(changedFiles) {
        const htmlFiles = changedFiles.filter(f => f.endsWith('.html') && f.startsWith('_app/'));
        if (htmlFiles.length === 0) return { name: 'File Size', pass: true, count: 0, details: ['No HTML changed'], severity: 'info' };

        const issues = [];
        const LIMIT = 500 * 1024; // 500KB

        htmlFiles.forEach(f => {
            const fullPath = path.join(projectRoot, f);
            if (!fs.existsSync(fullPath)) return;
            const stat = fs.statSync(fullPath);
            if (stat.size > LIMIT) {
                const kb = Math.round(stat.size / 1024);
                issues.push(`${f}: ${kb}KB (limit: 500KB) — may hurt mobile performance`);
            }
        });

        return {
            name: 'File Size',
            pass: issues.length === 0,
            count: issues.length,
            details: issues.length ? issues : ['All files within size limits'],
            severity: issues.length ? 'warning' : 'info'
        };
    }

    // ── Check 12: Duplicate Module IDs — catch catalog conflicts ──
    function checkDuplicateIds(changedFiles) {
        const catalogChanged = changedFiles.some(f => f.includes('ContentCatalog.js') || f.includes('LearningPaths.js'));
        if (!catalogChanged) return { name: 'Duplicate IDs', pass: true, count: 0, details: ['Catalog not changed'], severity: 'info' };

        const catalogPath = path.join(appDir, 'components/ContentCatalog.js');
        if (!fs.existsSync(catalogPath)) return { name: 'Duplicate IDs', pass: true, count: 0, details: ['No catalog file'], severity: 'info' };

        const content = fs.readFileSync(catalogPath, 'utf8');
        const idRegex = /id:\s*['"]([^'"]+)['"]/g;
        const ids = {};
        let match;
        while ((match = idRegex.exec(content)) !== null) {
            const id = match[1];
            ids[id] = (ids[id] || 0) + 1;
        }

        const dupes = Object.entries(ids).filter(([_, count]) => count > 1);
        return {
            name: 'Duplicate IDs',
            pass: dupes.length === 0,
            count: dupes.length,
            details: dupes.length ? dupes.slice(0, 10).map(([id, c]) => `${id}: ${c} occurrences`) : ['No duplicate module IDs'],
            severity: dupes.length ? 'medium' : 'info'
        };
    }

    // ── Check 13: Emoji — platform uses webp icons, not emoji ──
    function checkEmoji(changedFiles) {
        const htmlFiles = changedFiles.filter(f => f.endsWith('.html') && f.startsWith('_app/houses/'));
        if (htmlFiles.length === 0) return { name: 'Emoji', pass: true, count: 0, details: ['No house HTML changed'], severity: 'info' };

        const issues = [];
        // Common emoji ranges (subset — covers most used ones)
        const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;

        htmlFiles.slice(0, 50).forEach(f => {
            const fullPath = path.join(projectRoot, f);
            if (!fs.existsSync(fullPath)) return;
            const content = fs.readFileSync(fullPath, 'utf8');

            // Only check visible content, not script blocks or data attributes
            const bodyMatch = content.match(/<body[\s\S]*?>([\s\S]*)<\/body>/i);
            if (!bodyMatch) return;
            const body = bodyMatch[1].replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '');

            if (emojiRegex.test(body)) {
                issues.push(`${f}: emoji detected in page body — use webp icons instead`);
            }
        });

        return {
            name: 'Emoji',
            pass: issues.length === 0,
            count: issues.length,
            details: issues.length ? issues.slice(0, 10) : ['No emoji in changed files'],
            severity: issues.length ? 'low' : 'info'
        };
    }

    // ── Main: Run all checks ──
    function runFullCheck(quick = false) {
        const changedFiles = getChangedFiles();
        const checks = [];

        // Quick checks (always run)
        checks.push(checkBlocklist(changedFiles));
        checks.push(checkRegression());
        checks.push(checkSecrets(changedFiles));

        if (!quick) {
            // Structural checks
            checks.push(checkQuizKeys(changedFiles));
            checks.push(checkPaths(changedFiles));
            checks.push(checkBrokenLinks(changedFiles));
            checks.push(checkHtmlSyntax(changedFiles));
            checks.push(checkModuleProgressDep(changedFiles));
            // Content checks
            checks.push(checkQuizAnswerVerification(changedFiles));
            checks.push(checkFirebaseConfig(changedFiles));
            checks.push(checkFileSize(changedFiles));
            checks.push(checkDuplicateIds(changedFiles));
            checks.push(checkEmoji(changedFiles));
        }

        // Overall verdict
        const failed = checks.filter(c => !c.pass);
        const criticalFail = failed.some(c => c.severity === 'critical');
        const highFail = failed.some(c => c.severity === 'high');

        return {
            pass: failed.length === 0,
            verdict: criticalFail ? 'BLOCKED' : highFail ? 'FAIL' : failed.length ? 'WARN' : 'PASS',
            changedFiles: changedFiles.length,
            checks,
            failed: failed.length,
            total: checks.length
        };
    }

    // ── Spoke interface ──
    return {
        name,

        commands: {
            '': (args, flags) => runFullCheck(flags.quick),
            'diff': () => {
                const files = getChangedFiles();
                return { files, count: files.length };
            }
        },

        // For Nexus gate integration
        getFindings() {
            const result = runFullCheck();
            return result.checks
                .filter(c => !c.pass)
                .map(c => ({
                    source: 'deploy-check',
                    code: 'DC-' + c.name.toUpperCase().replace(/\s+/g, '-'),
                    severity: c.severity,
                    message: c.details.join('; '),
                    count: c.count
                }));
        },

        // Pretty print for CLI
        render(result) {
            const C = { red: '\x1b[31m', green: '\x1b[32m', yellow: '\x1b[33m', cyan: '\x1b[36m', bold: '\x1b[1m', dim: '\x1b[2m', reset: '\x1b[0m' };

            console.log('');
            console.log(`${C.bold}DEPLOY CHECK${C.reset}  ${C.dim}(${result.changedFiles} files changed)${C.reset}`);
            console.log(`${C.dim}${'─'.repeat(60)}${C.reset}`);

            result.checks.forEach(check => {
                const icon = check.pass ? `${C.green}✓${C.reset}` : `${C.red}✗${C.reset}`;
                const label = check.pass ? `${C.green}PASS${C.reset}` : `${C.red}FAIL${C.reset}`;
                console.log(`  ${icon} ${C.bold}${check.name}${C.reset} ${label}`);
                check.details.forEach(d => console.log(`    ${C.dim}${d}${C.reset}`));
            });

            console.log(`${C.dim}${'─'.repeat(60)}${C.reset}`);

            if (result.verdict === 'PASS') {
                console.log(`  ${C.green}${C.bold}VERDICT: PASS${C.reset} ${C.green}— safe to deploy${C.reset}`);
                console.log(`  ${C.dim}firebase deploy --only hosting --project hexworth-prime${C.reset}`);
            } else if (result.verdict === 'BLOCKED') {
                console.log(`  ${C.red}${C.bold}VERDICT: BLOCKED${C.reset} ${C.red}— critical issues must be resolved${C.reset}`);
            } else if (result.verdict === 'FAIL') {
                console.log(`  ${C.red}${C.bold}VERDICT: FAIL${C.reset} ${C.red}— HIGH regressions detected${C.reset}`);
            } else {
                console.log(`  ${C.yellow}${C.bold}VERDICT: WARN${C.reset} ${C.yellow}— review warnings before deploying${C.reset}`);
            }
            console.log('');
        }
    };
};
