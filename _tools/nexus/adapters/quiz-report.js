#!/usr/bin/env node
'use strict';

const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

/**
 * Quiz Coverage Report Spoke Adapter
 *
 * Shows comprehensive quiz health: key coverage, SM pages, engine types,
 * placeholder detection, and answer verification status.
 *
 * Nexus integration:
 *   nexus quiz-report          Full report
 *   nexus quiz-report --json   Machine-readable output
 */
module.exports = function createQuizReportAdapter({ name, dataPath, projectRoot }) {

    const appDir = path.resolve(projectRoot, '_app');
    const keysPath = path.join(projectRoot, 'functions/quiz_keys.json');

    function generateReport() {
        const keys = fs.existsSync(keysPath) ? JSON.parse(fs.readFileSync(keysPath, 'utf8')) : {};
        const keyCount = Object.keys(keys).length;

        // Find all quiz files
        const quizFiles = execSync('find ' + appDir + ' -name "*.quiz.html" -type f 2>/dev/null', {encoding:'utf8',timeout:10000}).trim().split('\n').filter(Boolean);

        // Categorize
        let serverGraded = 0, clientGraded = 0, noModuleId = 0, withKey = 0, withoutKey = 0;
        let mismatches = 0, placeholderKeys = 0;

        quizFiles.forEach(f => {
            const content = fs.readFileSync(f, 'utf8');
            if (content.includes('serverGrading')) serverGraded++;
            else if (/correct:\s*\d+/.test(content)) clientGraded++;
            else noModuleId++;

            const midMatch = content.match(/moduleId['"]?\s*:\s*['"]([^'"]+)/) || content.match(/MODULE_ID\s*=\s*['"]([^'"]+)/);
            if (midMatch) {
                const mid = midMatch[1];
                const hasKey = Object.keys(keys).some(k => k === mid || k === mid + '-quiz' || k.replace(/-quiz$/, '') === mid);
                if (hasKey) withKey++;
                else withoutKey++;
            }
        });

        // Check key integrity
        Object.keys(keys).forEach(k => {
            const key = keys[k];
            if (key.questionCount !== key.answers.length) mismatches++;
            // Check for cycling placeholder
            const pat = [0,1,2,3];
            let matches = 0;
            key.answers.forEach((a,i) => { if (a === pat[i%4]) matches++; });
            if (key.answers.length >= 8 && matches/key.answers.length > 0.9) placeholderKeys++;
        });

        return {
            totalQuizFiles: quizFiles.length,
            serverGraded,
            clientGraded,
            customEngine: noModuleId,
            totalKeys: keyCount,
            withKey,
            withoutKey,
            mismatches,
            placeholderKeys,
            coverage: Math.round(withKey / quizFiles.length * 100)
        };
    }

    return {
        name,
        commands: {
            '': (args, flags) => {
                const r = generateReport();
                const C = {green:'\x1b[32m',red:'\x1b[31m',yellow:'\x1b[33m',cyan:'\x1b[36m',bold:'\x1b[1m',dim:'\x1b[2m',reset:'\x1b[0m'};

                if (flags.json) { console.log(JSON.stringify(r, null, 2)); return r; }

                console.log('');
                console.log(`${C.bold}QUIZ COVERAGE REPORT${C.reset}`);
                console.log(`${C.dim}${'─'.repeat(50)}${C.reset}`);
                console.log(`  Quiz files:      ${C.bold}${r.totalQuizFiles}${C.reset}`);
                console.log(`    Server-graded:   ${C.green}${r.serverGraded}${C.reset}`);
                console.log(`    Client-graded:   ${C.red}${r.clientGraded}${C.reset} ${C.dim}(answers in source)${C.reset}`);
                console.log(`    Custom engine:   ${C.yellow}${r.customEngine}${C.reset}`);
                console.log('');
                console.log(`  Answer keys:     ${C.bold}${r.totalKeys}${C.reset}`);
                console.log(`    With key:        ${C.green}${r.withKey}${C.reset}`);
                console.log(`    Without key:     ${r.withoutKey > 0 ? C.red : C.green}${r.withoutKey}${C.reset}`);
                console.log(`    Mismatches:      ${r.mismatches > 0 ? C.red : C.green}${r.mismatches}${C.reset}`);
                console.log(`    Placeholders:    ${r.placeholderKeys > 0 ? C.red : C.green}${r.placeholderKeys}${C.reset}`);
                console.log('');
                console.log(`  Coverage:        ${r.coverage >= 90 ? C.green : r.coverage >= 70 ? C.yellow : C.red}${C.bold}${r.coverage}%${C.reset}`);
                console.log(`${C.dim}${'─'.repeat(50)}${C.reset}`);
                console.log('');
                return r;
            }
        },
        getFindings() { return []; }
    };
};
