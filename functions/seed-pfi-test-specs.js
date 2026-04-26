#!/usr/bin/env node
'use strict';

/**
 * seed-pfi-test-specs.js — Seed PFI project test specifications to Firestore.
 *
 * These specs define the automated grading criteria for each weekly project.
 * They are stored in Firestore (pfi_test_specs/{projectId}) and fetched by
 * the gradePFIProject Cloud Function at grading time.
 *
 * Usage:
 *   node seed-pfi-test-specs.js              # Seed all specs
 *   node seed-pfi-test-specs.js pfi-w1       # Seed only W1
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = path.join(__dirname, '../service-account-key.json');
if (require('fs').existsSync(serviceAccount)) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
} else {
    admin.initializeApp(); // Uses GOOGLE_APPLICATION_CREDENTIALS or default
}

const db = admin.firestore();

// ─── W1: IT System Report Generator ──────────────────────────────────
// Rubric: Variables (15), Input (10), Conditionals (15), Loops (15),
//         Formatting (15), Comments (15), Execution (15) = 100 pts
const PFI_W1 = {
    projectId: 'pfi-w1',
    title: 'IT System Report Generator',
    maxScore: 100,
    passingScore: 70,
    files: {}, // W1 has no data files

    rubricCategories: [
        { id: 'variables',    label: 'Variables & Data Types',       maxPoints: 15 },
        { id: 'input',        label: 'User Input & Type Casting',    maxPoints: 10 },
        { id: 'conditionals', label: 'Conditionals',                 maxPoints: 15 },
        { id: 'loops',        label: 'Loops',                        maxPoints: 15 },
        { id: 'formatting',   label: 'Output Formatting',            maxPoints: 15 },
        { id: 'comments',     label: 'Code Organization & Comments', maxPoints: 15 },
        { id: 'execution',    label: 'Error-Free Execution',         maxPoints: 15 }
    ],

    tests: [
        // ═══════════════════════════════════════════════════════════
        // EXECUTION TESTS — run the code with stdin, check output
        // ═══════════════════════════════════════════════════════════

        {
            id: 'exec_runs_clean',
            category: 'execution',
            name: 'Runs without errors on valid input',
            type: 'execution',
            weight: 8,
            // Menu choice 1 → enter server data → menu choice 3 (exit)
            stdin: '1\nWEB-PROD-01\n192.168.1.100\nInfrastructure\n500\n430\n3\n',
            checks: [
                { type: 'no_exception' },
                { type: 'output_not_contains', value: 'Traceback' },
                { type: 'output_not_contains', value: 'Error' }
            ]
        },

        {
            id: 'exec_server_in_output',
            category: 'formatting',
            name: 'Report shows server name and IP',
            type: 'execution',
            weight: 5,
            stdin: '1\nWEB-PROD-01\n192.168.1.100\nInfrastructure\n500\n430\n3\n',
            checks: [
                { type: 'output_contains', value: 'WEB-PROD-01' },
                { type: 'output_contains', value: '192.168.1.100' }
            ]
        },

        {
            id: 'exec_disk_percentage',
            category: 'formatting',
            name: 'Disk usage shown with decimal places',
            type: 'execution',
            weight: 5,
            stdin: '1\nSRV-01\n10.0.0.1\nIT\n500\n430\n3\n',
            checks: [
                { type: 'output_regex', pattern: '\\d+\\.\\d{2}%' }
            ]
        },

        {
            id: 'exec_status_ok',
            category: 'conditionals',
            name: 'Reports OK when usage < 75%',
            type: 'execution',
            weight: 5,
            stdin: '1\nSRV-OK\n10.0.0.1\nIT\n500\n200\n3\n',
            checks: [
                { type: 'output_contains', value: 'OK' }
            ]
        },

        {
            id: 'exec_status_warning',
            category: 'conditionals',
            name: 'Reports WARNING when usage 75-89%',
            type: 'execution',
            weight: 5,
            stdin: '1\nSRV-WARN\n10.0.0.1\nIT\n500\n400\n3\n',
            checks: [
                { type: 'output_contains', value: 'WARNING' }
            ]
        },

        {
            id: 'exec_status_critical',
            category: 'conditionals',
            name: 'Reports CRITICAL when usage >= 90%',
            type: 'execution',
            weight: 5,
            stdin: '1\nSRV-CRIT\n10.0.0.1\nIT\n500\n475\n3\n',
            checks: [
                { type: 'output_contains', value: 'CRITICAL' }
            ]
        },

        {
            id: 'exec_edge_negative',
            category: 'execution',
            name: 'Handles unusual disk values without crashing',
            type: 'execution',
            weight: 7,
            stdin: '1\nSRV-EDGE\n10.0.0.1\nIT\n0\n0\n3\n',
            checks: [
                // The program may error, but it should not produce an unhandled Traceback
                // Students get credit if they have ANY error handling
                { type: 'no_exception' }
            ]
        },

        // ═══════════════════════════════════════════════════════════
        // STATIC TESTS — check code structure without executing
        // ═══════════════════════════════════════════════════════════

        {
            id: 'static_while_loop',
            category: 'loops',
            name: 'Uses a while loop (menu system)',
            type: 'static',
            weight: 8,
            checks: [
                { type: 'code_contains', value: 'while' }
            ]
        },

        {
            id: 'static_for_loop',
            category: 'loops',
            name: 'Uses a for loop',
            type: 'static',
            weight: 7,
            checks: [
                { type: 'code_contains', value: 'for' }
            ]
        },

        {
            id: 'static_if_elif_else',
            category: 'conditionals',
            name: 'Uses if/elif/else chain',
            type: 'static',
            weight: 5,
            checks: [
                { type: 'code_contains', value: 'if' },
                { type: 'code_contains', value: 'elif' },
                { type: 'code_contains', value: 'else' }
            ]
        },

        {
            id: 'static_fstrings',
            category: 'formatting',
            name: 'Uses f-strings for output',
            type: 'static',
            weight: 5,
            checks: [
                { type: 'code_regex', pattern: 'f["\']' }
            ]
        },

        {
            id: 'static_input_calls',
            category: 'input',
            name: 'Uses input() to collect user data',
            type: 'static',
            weight: 5,
            checks: [
                { type: 'code_regex', pattern: 'input\\(' }
            ]
        },

        {
            id: 'static_type_casting',
            category: 'input',
            name: 'Casts numeric input to int or float',
            type: 'static',
            weight: 5,
            checks: [
                { type: 'code_regex', pattern: '(int|float)\\(' }
            ]
        },

        {
            id: 'static_boolean_usage',
            category: 'variables',
            name: 'Uses a boolean value (True or False)',
            type: 'static',
            weight: 5,
            checks: [
                { type: 'code_regex', pattern: '(True|False)' }
            ]
        },

        {
            id: 'static_snake_case_vars',
            category: 'variables',
            name: 'Uses snake_case variable names (5+)',
            type: 'static',
            weight: 5,
            checks: [
                { type: 'code_regex_count', pattern: '[a-z]+_[a-z]+\\s*=', minCount: 5, flags: 'm' }
            ]
        },

        {
            id: 'static_var_declarations',
            category: 'variables',
            name: 'Has 5+ variable declarations',
            type: 'static',
            weight: 5,
            checks: [
                { type: 'code_regex_count', pattern: '^\\s*[a-z_][a-z0-9_]*\\s*=', minCount: 5, flags: 'm' }
            ]
        },

        {
            id: 'static_comments',
            category: 'comments',
            name: 'Has meaningful comments (3+ lines)',
            type: 'static',
            weight: 8,
            checks: [
                { type: 'code_regex_count', pattern: '#\\s*\\w', minCount: 3 }
            ]
        },

        {
            id: 'static_section_comments',
            category: 'comments',
            name: 'Has section-level comments (menu, input, output)',
            type: 'static',
            weight: 7,
            checks: [
                { type: 'code_regex_count', pattern: '#.*(?:menu|input|output|report|calc|loop|main|section|block)', minCount: 2, flags: 'im' }
            ]
        }
    ]
};


// ─── Seeding Logic ──────────────────────────────────────────────────

const ALL_SPECS = {
    'pfi-w1': PFI_W1,
    // W2-W4 specs will be added here
};

async function seed(specId) {
    const specs = specId ? { [specId]: ALL_SPECS[specId] } : ALL_SPECS;

    for (const [id, spec] of Object.entries(specs)) {
        if (!spec) {
            console.log(`Unknown spec: ${id}`);
            continue;
        }
        await db.doc(`pfi_test_specs/${id}`).set(spec);
        console.log(`Seeded: pfi_test_specs/${id} (${spec.tests.length} tests, ${spec.maxScore} max score)`);
    }

    console.log('Done.');
    process.exit(0);
}

const targetSpec = process.argv[2] || null;
seed(targetSpec).catch(err => {
    console.error('Seed failed:', err.message);
    process.exit(1);
});
