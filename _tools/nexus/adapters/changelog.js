#!/usr/bin/env node
'use strict';

const { execSync } = require('child_process');

/**
 * Changelog Generator Spoke Adapter
 *
 * Generates a human-readable changelog from git log since last deploy,
 * grouped by category (feat, fix, docs, chore).
 *
 * Nexus integration:
 *   nexus changelog            Show changelog since origin/master
 *   nexus changelog --since=v7 Since a specific tag
 *   nexus changelog --md       Output as Markdown
 */
module.exports = function createChangelogAdapter({ name, dataPath, projectRoot }) {

    function generateChangelog(since) {
        const ref = since || 'origin/master';
        let log;
        try {
            log = execSync('git log ' + ref + '..HEAD --oneline --no-decorate', {
                cwd: projectRoot, encoding: 'utf8', timeout: 10000
            }).trim();
        } catch(e) { return { error: 'Could not read git log', commits: [] }; }

        if (!log) return { commits: [], categories: {} };

        const commits = log.split('\n').map(line => {
            const match = line.match(/^([a-f0-9]+)\s+(.+)$/);
            if (!match) return null;
            const msg = match[2];
            let category = 'other';
            if (msg.startsWith('feat:')) category = 'features';
            else if (msg.startsWith('fix:')) category = 'fixes';
            else if (msg.startsWith('docs:')) category = 'docs';
            else if (msg.startsWith('chore:')) category = 'chore';
            return { hash: match[1], message: msg, category };
        }).filter(Boolean);

        const categories = {};
        commits.forEach(c => {
            if (!categories[c.category]) categories[c.category] = [];
            categories[c.category].push(c);
        });

        return { total: commits.length, categories };
    }

    return {
        name,
        commands: {
            '': (args, flags) => {
                const result = generateChangelog(flags.since);
                const C = {green:'\x1b[32m',yellow:'\x1b[33m',cyan:'\x1b[36m',bold:'\x1b[1m',dim:'\x1b[2m',reset:'\x1b[0m'};

                if (flags.md) {
                    console.log('# Changelog\n');
                    const labels = {features:'Features',fixes:'Bug Fixes',docs:'Documentation',chore:'Maintenance',other:'Other'};
                    Object.entries(result.categories).forEach(([cat, commits]) => {
                        console.log('## ' + (labels[cat]||cat) + '\n');
                        commits.forEach(c => console.log('- ' + c.message.replace(/^(feat|fix|docs|chore):\s*/, '')));
                        console.log('');
                    });
                    return result;
                }

                console.log('');
                console.log(`${C.bold}CHANGELOG${C.reset} ${C.dim}(${result.total} commits)${C.reset}`);
                console.log(`${C.dim}${'─'.repeat(50)}${C.reset}`);

                const labels = {features:'Features',fixes:'Bug Fixes',docs:'Documentation',chore:'Maintenance',other:'Other'};
                const icons = {features:'★',fixes:'●',docs:'◆',chore:'○',other:'·'};
                const colors = {features:C.green,fixes:C.yellow,docs:C.cyan,chore:C.dim,other:C.dim};

                Object.entries(result.categories).forEach(([cat, commits]) => {
                    console.log(`\n  ${colors[cat]||''}${C.bold}${labels[cat]||cat}${C.reset} ${C.dim}(${commits.length})${C.reset}`);
                    commits.slice(0, 15).forEach(c => {
                        const msg = c.message.replace(/^(feat|fix|docs|chore):\s*/, '');
                        console.log(`    ${icons[cat]||'·'} ${msg}`);
                    });
                    if (commits.length > 15) console.log(`    ${C.dim}... and ${commits.length-15} more${C.reset}`);
                });

                console.log(`\n${C.dim}${'─'.repeat(50)}${C.reset}`);
                console.log('');
                return result;
            }
        },
        getFindings() { return []; }
    };
};
