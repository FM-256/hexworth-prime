#!/usr/bin/env node
'use strict';

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

/**
 * Cloud Functions Spoke Adapter
 *
 * Pre-deploy gate for Firebase Cloud Functions. Runs tests, shows diffs,
 * and provides safe targeted deployment commands.
 *
 * Nexus integration:
 *   nexus functions test       Run the test suite
 *   nexus functions diff       Show what changed in index.js
 *   nexus functions deploy     Test → diff → confirm → deploy (targeted)
 *   nexus functions list       List all exported functions
 *
 * This adapter NEVER runs `firebase deploy --only functions` (full deploy).
 * It always targets specific functions to prevent accidental overwrites.
 */
module.exports = function createFunctionsAdapter({ name, dataPath, projectRoot }) {

    const functionsDir = path.resolve(projectRoot, 'functions');
    const indexPath = path.join(functionsDir, 'index.js');

    /**
     * Run the gradeQuiz test suite.
     * Returns { passed, failed, total, output }
     */
    function runTests() {
        try {
            const output = execSync('node tests/gradeQuiz.test.js', {
                cwd: functionsDir,
                encoding: 'utf8',
                timeout: 30000
            });
            const match = output.match(/(\d+) passed, (\d+) failed, (\d+) total/);
            return {
                passed: match ? parseInt(match[1]) : 0,
                failed: match ? parseInt(match[2]) : 0,
                total: match ? parseInt(match[3]) : 0,
                success: !output.includes('FAIL'),
                output
            };
        } catch (err) {
            return {
                passed: 0,
                failed: 1,
                total: 1,
                success: false,
                output: err.stdout || err.message
            };
        }
    }

    /**
     * Get git diff for functions/index.js (staged and unstaged).
     * Returns the diff string or null if no changes.
     */
    function getDiff() {
        try {
            const diff = execSync('git diff HEAD -- functions/index.js', {
                cwd: projectRoot,
                encoding: 'utf8',
                timeout: 10000
            });
            return diff.trim() || null;
        } catch (err) {
            return null;
        }
    }

    /**
     * List all exported function names from index.js.
     */
    function listFunctions() {
        try {
            const content = fs.readFileSync(indexPath, 'utf8');
            const exports = content.match(/^exports\.(\w+)/gm) || [];
            return exports.map(e => e.replace('exports.', ''));
        } catch (err) {
            return [];
        }
    }

    /**
     * Identify which functions were modified in the current diff.
     */
    function getChangedFunctions() {
        const diff = getDiff();
        if (!diff) return [];

        const allFunctions = listFunctions();
        const content = fs.readFileSync(indexPath, 'utf8');
        const changed = [];

        // For each function, check if the diff touches lines within its range
        allFunctions.forEach(fn => {
            const exportPattern = new RegExp(`^exports\\.${fn}\\b`, 'm');
            const match = content.match(exportPattern);
            if (!match) return;

            // Check if the function name appears in the diff context
            if (diff.includes(`exports.${fn}`) || diff.includes(fn)) {
                changed.push(fn);
            }
        });

        return changed;
    }

    /**
     * Generate the safe deploy command for changed functions.
     */
    function getDeployCommand() {
        const changed = getChangedFunctions();
        if (changed.length === 0) return null;

        // Firebase CLI syntax for targeted deploy
        const targets = changed.map(fn => `functions:${fn}`).join(',');
        return `firebase deploy --only ${targets}`;
    }

    /**
     * Pre-deploy gate check. Returns findings in Nexus format.
     */
    function getFindings() {
        const findings = [];
        const testResult = runTests();
        const diff = getDiff();
        const changed = getChangedFunctions();

        // Finding: test failures
        if (!testResult.success) {
            findings.push({
                source: 'functions',
                code: 'CF-TEST-FAIL',
                severity: 'critical',
                message: `Cloud Function tests failed: ${testResult.failed} of ${testResult.total} tests failed`,
                detail: testResult.output,
                fix: 'Fix failing tests before deploying. Run: cd functions && npm test'
            });
        }

        // Finding: uncommitted changes to functions
        if (diff && changed.length > 0) {
            findings.push({
                source: 'functions',
                code: 'CF-UNCOMMITTED',
                severity: 'warning',
                message: `${changed.length} Cloud Function(s) have uncommitted changes: ${changed.join(', ')}`,
                detail: `Safe deploy command: ${getDeployCommand()}`,
                fix: 'Commit changes before deploying, or use targeted deploy command'
            });
        }

        return findings;
    }

    /**
     * Execute a command from the Nexus CLI.
     */
    function execute(command, args) {
        switch (command) {
            case 'test': {
                const result = runTests();
                console.log(result.output);
                return result.success;
            }

            case 'diff': {
                const diff = getDiff();
                if (!diff) {
                    console.log('  No changes to functions/index.js');
                } else {
                    console.log(diff);
                    const changed = getChangedFunctions();
                    if (changed.length > 0) {
                        console.log(`\n  Changed functions: ${changed.join(', ')}`);
                        console.log(`  Deploy command: ${getDeployCommand()}`);
                    }
                }
                return true;
            }

            case 'list': {
                const fns = listFunctions();
                console.log(`  ${fns.length} Cloud Functions exported:`);
                fns.forEach(fn => console.log(`    - ${fn}`));
                return true;
            }

            case 'deploy': {
                // Step 1: Run tests
                console.log('  Step 1: Running tests...');
                const testResult = runTests();
                console.log(testResult.output);

                if (!testResult.success) {
                    console.error('  BLOCKED: Tests failed. Fix before deploying.');
                    return false;
                }

                // Step 2: Show diff
                console.log('  Step 2: Changes to deploy:');
                const diff = getDiff();
                const changed = getChangedFunctions();

                if (!diff || changed.length === 0) {
                    console.log('  No changes to deploy.');
                    return true;
                }

                console.log(`  Functions changed: ${changed.join(', ')}`);
                const cmd = getDeployCommand();
                console.log(`  Command: ${cmd}`);

                // Step 3: Output the command (do NOT execute — human must run it)
                console.log('\n  ════════════════════════════════════════');
                console.log('  Tests passed. Run this command to deploy:');
                console.log(`  $ ${cmd}`);
                console.log('  ════════════════════════════════════════\n');
                return true;
            }

            default:
                console.log(`  Unknown command: ${command}`);
                console.log('  Available: test, diff, list, deploy');
                return false;
        }
    }

    return {
        name,
        getFindings,
        execute,
        runTests,
        getDiff,
        listFunctions,
        getChangedFunctions,
        getDeployCommand
    };
};
