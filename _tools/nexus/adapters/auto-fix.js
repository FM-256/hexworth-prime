#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

/**
 * Auto-Fix Runner Spoke Adapter
 *
 * Applies safe, mechanical fixes for known EduScan patterns.
 * Only fixes patterns that are 100% safe — no judgment calls.
 *
 * Nexus integration:
 *   nexus fix                 Dry run — show what would be fixed
 *   nexus fix --apply         Actually apply fixes
 *   nexus fix --type=icons    Fix only icon paths
 */
module.exports = function createAutoFixAdapter({ name, dataPath, projectRoot }) {

    const appDir = path.resolve(projectRoot, '_app');

    // Fix 1: Double-slash icon paths (..//assets/ → /assets/)
    function fixDoubleSlashPaths(apply) {
        let count = 0;
        try {
            const files = execSync('grep -rl "\\.\\.//assets/images/icons/" ' + appDir + '/ 2>/dev/null', {encoding:'utf8',timeout:10000}).trim().split('\n').filter(Boolean);
            files.forEach(f => {
                if (apply) {
                    const content = fs.readFileSync(f, 'utf8');
                    fs.writeFileSync(f, content.replace(/\.\.\/+\/assets\/images\/icons\//g, '/assets/images/icons/'));
                }
                count++;
            });
        } catch(e) { /* no matches */ }
        return { name: 'Double-slash paths', count, pattern: '..//assets/ → /assets/' };
    }

    // Fix 2: Over-deep relative icon paths (../../../../assets/ → /assets/)
    function fixDeepIconPaths(apply) {
        let count = 0;
        try {
            const files = execSync('grep -rl "../../../../assets/images/icons/" ' + appDir + '/houses/ 2>/dev/null', {encoding:'utf8',timeout:10000}).trim().split('\n').filter(Boolean);
            files.forEach(f => {
                if (apply) {
                    const content = fs.readFileSync(f, 'utf8');
                    fs.writeFileSync(f, content.replace(/\.\.\/\.\.\/\.\.\/\.\.\/assets\/images\/icons\//g, '/assets/images/icons/'));
                }
                count++;
            });
        } catch(e) { /* no matches */ }
        return { name: 'Over-deep icon paths', count, pattern: '../../../../assets/ → /assets/' };
    }

    // Fix 3: h3→h2 in files with h1+h3 but no h2
    function fixHeadingHierarchy(apply) {
        let count = 0;
        try {
            const files = execSync('find ' + appDir + '/houses -name "*.html" -type f', {encoding:'utf8',timeout:10000}).trim().split('\n').filter(Boolean);
            files.forEach(f => {
                const content = fs.readFileSync(f, 'utf8');
                const hasH1 = content.includes('<h1');
                const hasH2 = content.includes('<h2');
                const hasH3 = content.includes('<h3');
                const hasH4 = content.includes('<h4');
                if (hasH1 && !hasH2 && hasH3 && !hasH4) {
                    if (apply) fs.writeFileSync(f, content.replace(/<h3/g, '<h2').replace(/<\/h3>/g, '</h2>'));
                    count++;
                }
            });
        } catch(e) { /* error */ }
        return { name: 'Heading h3→h2', count, pattern: 'h1+h3 (no h2) → promote h3 to h2' };
    }

    return {
        name,
        commands: {
            '': (args, flags) => {
                const apply = flags.apply || false;
                const typeFilter = flags.type || null;
                const C = {green:'\x1b[32m',red:'\x1b[31m',yellow:'\x1b[33m',cyan:'\x1b[36m',bold:'\x1b[1m',dim:'\x1b[2m',reset:'\x1b[0m'};

                const fixers = [fixDoubleSlashPaths, fixDeepIconPaths, fixHeadingHierarchy];
                const results = [];

                fixers.forEach(fixer => {
                    const r = fixer(apply);
                    results.push(r);
                });

                console.log('');
                console.log(`${C.bold}AUTO-FIX ${apply ? 'APPLIED' : 'DRY RUN'}${C.reset}`);
                console.log(`${C.dim}${'─'.repeat(50)}${C.reset}`);

                let totalFixed = 0;
                results.forEach(r => {
                    const icon = r.count > 0 ? (apply ? `${C.green}✓${C.reset}` : `${C.yellow}~${C.reset}`) : `${C.dim}-${C.reset}`;
                    console.log(`  ${icon} ${r.name}: ${r.count > 0 ? C.bold : C.dim}${r.count} files${C.reset}`);
                    if (r.count > 0) console.log(`    ${C.dim}${r.pattern}${C.reset}`);
                    totalFixed += r.count;
                });

                console.log(`${C.dim}${'─'.repeat(50)}${C.reset}`);
                if (!apply && totalFixed > 0) {
                    console.log(`  ${C.yellow}${totalFixed} files can be fixed. Run with --apply to apply.${C.reset}`);
                } else if (apply && totalFixed > 0) {
                    console.log(`  ${C.green}${totalFixed} files fixed.${C.reset}`);
                } else {
                    console.log(`  ${C.green}Nothing to fix.${C.reset}`);
                }
                console.log('');
                return { applied: apply, total: totalFixed, results };
            }
        },
        getFindings() { return []; }
    };
};
