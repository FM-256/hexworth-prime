#!/usr/bin/env node
'use strict';

const https = require('https');
const http = require('http');

/**
 * Smoke Test Suite Spoke Adapter
 *
 * Post-deploy verification: checks critical pages return 200 with
 * expected content markers. Fast production health check.
 *
 * Nexus integration:
 *   nexus smoke                  Test production (hexworth-prime.web.app)
 *   nexus smoke --host=localhost Test local dev server
 */
module.exports = function createSmokeTestAdapter({ name, dataPath, projectRoot }) {

    const TESTS = [
        { path: '/', name: 'Login Page', expect: 'Hexworth' },
        { path: '/dashboard.html', name: 'Dashboard', expect: 'dashboard' },
        { path: '/houses/shield/index.html', name: 'Shield Hub', expect: 'Shield' },
        { path: '/houses/web/index.html', name: 'Web Hub', expect: 'Web' },
        { path: '/houses/forge/index.html', name: 'Forge Hub', expect: 'Forge' },
        { path: '/arena/index.html', name: 'Arena Hub', expect: 'Arena' },
        { path: '/pulse.html', name: 'Pulse Dashboard', expect: 'Pulse' },
        { path: '/admin/console.html', name: 'Admin Console', expect: 'Admin' },
        { path: '/components/QuizEngine.js', name: 'QuizEngine JS', expect: 'QuizEngine' },
        { path: '/components/ModuleProgress.js', name: 'ModuleProgress JS', expect: 'ModuleProgress' },
    ];

    function runTest(host, testPath, expectText) {
        return new Promise(resolve => {
            const isLocal = host.includes('localhost') || host.includes('127.0.0.1');
            const protocol = isLocal ? http : https;
            const port = isLocal ? (parseInt(host.split(':')[1]) || 5000) : 443;
            const hostname = host.split(':')[0];
            const url = (isLocal ? 'http' : 'https') + '://' + host + testPath;

            const start = Date.now();
            const req = protocol.get({
                hostname, port, path: testPath,
                headers: { 'User-Agent': 'NexusSmokeTest/1.0' },
                timeout: 10000
            }, res => {
                let body = '';
                res.on('data', d => body += d.toString().substring(0, 5000)); // Cap at 5KB
                res.on('end', () => {
                    const ms = Date.now() - start;
                    const hasContent = body.toLowerCase().includes(expectText.toLowerCase());
                    resolve({
                        pass: res.statusCode === 200 && hasContent,
                        status: res.statusCode,
                        ms,
                        hasContent,
                        path: testPath
                    });
                });
            });
            req.on('error', e => resolve({ pass: false, status: 0, ms: Date.now()-start, error: e.message, path: testPath }));
            req.on('timeout', () => { req.destroy(); resolve({ pass: false, status: 0, ms: 10000, error: 'timeout', path: testPath }); });
        });
    }

    return {
        name,
        commands: {
            '': async (args, flags) => {
                const host = flags.host || 'hexworth-prime.web.app';
                const C = {green:'\x1b[32m',red:'\x1b[31m',yellow:'\x1b[33m',cyan:'\x1b[36m',bold:'\x1b[1m',dim:'\x1b[2m',reset:'\x1b[0m'};

                console.log('');
                console.log(`${C.bold}SMOKE TEST${C.reset} ${C.dim}(${host})${C.reset}`);
                console.log(`${C.dim}${'─'.repeat(50)}${C.reset}`);

                let passed = 0, failed = 0;
                for (const test of TESTS) {
                    const result = await runTest(host, test.path, test.expect);
                    const icon = result.pass ? `${C.green}✓${C.reset}` : `${C.red}✗${C.reset}`;
                    const time = result.ms < 500 ? C.green : result.ms < 2000 ? C.yellow : C.red;
                    console.log(`  ${icon} ${test.name.padEnd(22)} ${result.status || 'ERR'}  ${time}${result.ms}ms${C.reset}`);
                    if (result.pass) passed++; else failed++;
                }

                console.log(`${C.dim}${'─'.repeat(50)}${C.reset}`);
                const verdict = failed === 0 ? `${C.green}${C.bold}ALL PASS${C.reset}` : `${C.red}${C.bold}${failed} FAILED${C.reset}`;
                console.log(`  ${verdict} ${C.dim}(${passed}/${TESTS.length})${C.reset}`);
                console.log('');
                return { passed, failed, total: TESTS.length };
            }
        },
        getFindings() { return []; }
    };
};
