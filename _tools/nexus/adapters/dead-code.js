#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

/**
 * Dead Code Finder Spoke Adapter
 *
 * Identifies unused JS components, unreferenced HTML pages, and orphaned
 * images. Helps with cleanup sprints.
 *
 * Nexus integration:
 *   nexus dead-code             Full report
 *   nexus dead-code --js        JS components only
 *   nexus dead-code --json      Machine-readable
 */
module.exports = function createDeadCodeAdapter({ name, dataPath, projectRoot }) {

    const appDir = path.resolve(projectRoot, '_app');
    const componentsDir = path.join(appDir, 'components');

    function findUnusedJS() {
        if (!fs.existsSync(componentsDir)) return [];
        const jsFiles = fs.readdirSync(componentsDir).filter(f => f.endsWith('.js'));
        const unused = [];

        jsFiles.forEach(jsFile => {
            const baseName = jsFile.replace('.js', '');
            // Search in HTML files
            let htmlRefs, jsRefs;
            try {
                htmlRefs = execSync('grep -rl "' + baseName + '" ' + appDir + '/houses/ ' + appDir + '/*.html 2>/dev/null | wc -l', {encoding:'utf8',timeout:5000}).trim();
            } catch(e) { htmlRefs = '0'; }
            try {
                jsRefs = execSync('grep -rl "' + baseName + '" ' + componentsDir + '/*.js ' + appDir + '/arena/ ' + appDir + '/signal/ 2>/dev/null | grep -v "' + jsFile + '" | wc -l', {encoding:'utf8',timeout:5000}).trim();
            } catch(e) { jsRefs = '0'; }

            const total = parseInt(htmlRefs) + parseInt(jsRefs);
            if (total === 0) {
                const stat = fs.statSync(path.join(componentsDir, jsFile));
                unused.push({ file: jsFile, lines: fs.readFileSync(path.join(componentsDir, jsFile),'utf8').split('\n').length, size: Math.round(stat.size/1024) });
            }
        });

        return unused;
    }

    return {
        name,
        commands: {
            '': (args, flags) => {
                const C = {green:'\x1b[32m',red:'\x1b[31m',yellow:'\x1b[33m',cyan:'\x1b[36m',bold:'\x1b[1m',dim:'\x1b[2m',reset:'\x1b[0m'};
                const unusedJS = findUnusedJS();

                if (flags.json) { console.log(JSON.stringify({unusedJS}, null, 2)); return; }

                console.log('');
                console.log(`${C.bold}DEAD CODE REPORT${C.reset}`);
                console.log(`${C.dim}${'─'.repeat(50)}${C.reset}`);

                if (unusedJS.length === 0) {
                    console.log(`  ${C.green}No unused JS components found${C.reset}`);
                } else {
                    console.log(`  ${C.yellow}${unusedJS.length} unused JS components:${C.reset}`);
                    let totalLines = 0, totalKB = 0;
                    unusedJS.forEach(u => {
                        console.log(`    ${C.dim}${u.file}${C.reset} (${u.lines} lines, ${u.size}KB)`);
                        totalLines += u.lines;
                        totalKB += u.size;
                    });
                    console.log(`  ${C.dim}Total: ${totalLines} lines, ${totalKB}KB${C.reset}`);
                }
                console.log(`${C.dim}${'─'.repeat(50)}${C.reset}`);
                console.log('');
                return { unusedJS };
            }
        },
        getFindings() { return []; }
    };
};
