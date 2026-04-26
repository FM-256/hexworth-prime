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


// ─── W2: Server Log Analyzer ─────────────────────────────────────────
const PFI_W2 = {
    projectId: 'pfi-w2',
    title: 'Server Log Analyzer',
    maxScore: 100,
    passingScore: 70,
    files: {},
    rubricCategories: [
        { id: 'fileio',      label: 'File I/O (with open)',          maxPoints: 15 },
        { id: 'strings',     label: 'String Methods & Slicing',     maxPoints: 20 },
        { id: 'dicts',       label: 'Dictionaries & Sets',          maxPoints: 20 },
        { id: 'lists',       label: 'Lists & Data Storage',         maxPoints: 15 },
        { id: 'output',      label: 'Report Output & File Write',   maxPoints: 15 },
        { id: 'comments',    label: 'Code Organization & Comments', maxPoints: 15 }
    ],
    tests: [
        { id: 'exec_runs', category: 'output', name: 'Runs without errors', type: 'execution', weight: 8,
          stdin: '', checks: [{ type: 'no_exception' }] },
        { id: 'static_with_open', category: 'fileio', name: 'Uses with open() context manager', type: 'static', weight: 8,
          checks: [{ type: 'code_regex', pattern: 'with\\s+open\\(' }] },
        { id: 'static_read', category: 'fileio', name: 'Reads file content', type: 'static', weight: 7,
          checks: [{ type: 'code_regex', pattern: '\\.(read|readlines|readline)\\(' }] },
        { id: 'static_split', category: 'strings', name: 'Uses split()', type: 'static', weight: 5,
          checks: [{ type: 'code_contains', value: '.split(' }] },
        { id: 'static_strip', category: 'strings', name: 'Uses strip()', type: 'static', weight: 5,
          checks: [{ type: 'code_contains', value: '.strip(' }] },
        { id: 'static_upper_lower', category: 'strings', name: 'Uses upper() or lower()', type: 'static', weight: 5,
          checks: [{ type: 'code_regex', pattern: '\\.(upper|lower)\\(' }] },
        { id: 'static_slicing', category: 'strings', name: 'Uses string slicing', type: 'static', weight: 5,
          checks: [{ type: 'code_regex', pattern: '\\[\\d*:\\d*\\]' }] },
        { id: 'static_dict', category: 'dicts', name: 'Uses a dictionary', type: 'static', weight: 8,
          checks: [{ type: 'code_regex', pattern: '(\\{\\s*["\'][^"\']+["\']\\s*:|dict\\(|\\[\\s*["\'])' }] },
        { id: 'static_set', category: 'dicts', name: 'Uses a set', type: 'static', weight: 7,
          checks: [{ type: 'code_regex', pattern: '(set\\(|\\{[^:}]+\\}(?!\\s*\\]))' }] },
        { id: 'static_dict_count', category: 'dicts', name: 'Counts by severity in dict', type: 'static', weight: 5,
          checks: [{ type: 'code_regex', pattern: '(INFO|WARNING|ERROR|CRITICAL)' }] },
        { id: 'static_list_append', category: 'lists', name: 'Uses list (append or comprehension)', type: 'static', weight: 8,
          checks: [{ type: 'code_regex', pattern: '(\\.append\\(|\\[.*for.*in)' }] },
        { id: 'static_tuple_or_dict_entry', category: 'lists', name: 'Stores entries as tuple or dict', type: 'static', weight: 7,
          checks: [{ type: 'code_regex', pattern: '(tuple\\(|\\(.*,.*\\)|\\{["\']timestamp)' }] },
        { id: 'static_write_file', category: 'output', name: 'Writes output to a file', type: 'static', weight: 8,
          checks: [{ type: 'code_regex', pattern: 'open\\([^)]*["\']w["\']' }] },
        { id: 'static_fstrings', category: 'output', name: 'Uses f-strings for formatting', type: 'static', weight: 7,
          checks: [{ type: 'code_regex', pattern: 'f["\']' }] },
        { id: 'static_comments', category: 'comments', name: 'Has meaningful comments (5+)', type: 'static', weight: 8,
          checks: [{ type: 'code_regex_count', pattern: '#\\s*\\w', minCount: 5 }] },
        { id: 'static_sections', category: 'comments', name: 'Has section-level comments', type: 'static', weight: 7,
          checks: [{ type: 'code_regex_count', pattern: '#.*(?:parse|read|file|report|output|summary|count|dict|set|write|log)', minCount: 2, flags: 'im' }] }
    ]
};

// ─── W3: Network Device Manager ──────────────────────────────────────
const PFI_W3 = {
    projectId: 'pfi-w3',
    title: 'Network Device Manager',
    maxScore: 100,
    passingScore: 70,
    files: {},
    rubricCategories: [
        { id: 'classes',      label: 'Classes & __init__/__str__',    maxPoints: 20 },
        { id: 'inheritance',  label: 'Inheritance & Override',        maxPoints: 20 },
        { id: 'methods',      label: 'Methods & Functionality',      maxPoints: 20 },
        { id: 'manager',      label: 'DeviceManager Class',          maxPoints: 15 },
        { id: 'menu',         label: 'Menu & Functions',             maxPoints: 10 },
        { id: 'comments',     label: 'Code Organization & Comments', maxPoints: 15 }
    ],
    tests: [
        { id: 'exec_runs', category: 'menu', name: 'Runs without errors', type: 'execution', weight: 5,
          stdin: '0\n', checks: [{ type: 'no_exception' }] },
        { id: 'static_class_def', category: 'classes', name: 'Defines at least 2 classes', type: 'static', weight: 8,
          checks: [{ type: 'code_regex_count', pattern: '^class\\s+\\w+', minCount: 2, flags: 'm' }] },
        { id: 'static_init', category: 'classes', name: 'Has __init__ methods', type: 'static', weight: 6,
          checks: [{ type: 'code_regex_count', pattern: 'def __init__\\(self', minCount: 2 }] },
        { id: 'static_str', category: 'classes', name: 'Has __str__ methods', type: 'static', weight: 6,
          checks: [{ type: 'code_regex', pattern: 'def __str__\\(self' }] },
        { id: 'static_inheritance', category: 'inheritance', name: 'Uses inheritance (class Child(Parent))', type: 'static', weight: 10,
          checks: [{ type: 'code_regex', pattern: 'class\\s+\\w+\\(\\w+\\)' }] },
        { id: 'static_super', category: 'inheritance', name: 'Uses super().__init__', type: 'static', weight: 5,
          checks: [{ type: 'code_contains', value: 'super().__init__' }] },
        { id: 'static_override', category: 'inheritance', name: 'Overrides a method in child class', type: 'static', weight: 5,
          checks: [{ type: 'code_regex_count', pattern: 'def (get_info|display|__str__|describe|status)\\(self', minCount: 2 }] },
        { id: 'static_methods_count', category: 'methods', name: 'Classes have 3+ methods each', type: 'static', weight: 10,
          checks: [{ type: 'code_regex_count', pattern: '\\s+def\\s+\\w+\\(self', minCount: 8 }] },
        { id: 'static_manager_list', category: 'manager', name: 'DeviceManager has a devices list', type: 'static', weight: 5,
          checks: [{ type: 'code_regex', pattern: 'self\\.devices\\s*=' }] },
        { id: 'static_add_remove', category: 'manager', name: 'Has add_device and remove_device', type: 'static', weight: 5,
          checks: [{ type: 'code_contains', value: 'def add_device' }, { type: 'code_contains', value: 'def remove_device' }] },
        { id: 'static_find_list', category: 'manager', name: 'Has find and list methods', type: 'static', weight: 5,
          checks: [{ type: 'code_regex', pattern: 'def (find_device|find|list_all|list_devices|display_all)' }] },
        { id: 'static_menu_funcs', category: 'menu', name: 'Menu uses top-level functions', type: 'static', weight: 5,
          checks: [{ type: 'code_regex_count', pattern: '^def\\s+\\w+\\(', minCount: 3, flags: 'm' }] },
        { id: 'static_turtle', category: 'methods', name: 'Uses turtle graphics', type: 'static', weight: 5,
          checks: [{ type: 'code_regex', pattern: '(import turtle|from turtle|turtle\\.)' }] },
        { id: 'static_polymorphism', category: 'methods', name: 'Iterates mixed device types', type: 'static', weight: 5,
          checks: [{ type: 'code_regex', pattern: 'for\\s+\\w+\\s+in\\s+.*devices' }] },
        { id: 'static_comments', category: 'comments', name: 'Has meaningful comments (5+)', type: 'static', weight: 8,
          checks: [{ type: 'code_regex_count', pattern: '#\\s*\\w', minCount: 5 }] },
        { id: 'static_docstrings', category: 'comments', name: 'Has docstrings on classes/methods', type: 'static', weight: 7,
          checks: [{ type: 'code_regex_count', pattern: '"""[^"]+"""', minCount: 3 }] }
    ]
};

// ─── W4: Final Project (Comprehensive) ───────────────────────────────
const PFI_W4 = {
    projectId: 'pfi-w4',
    title: 'Final Project — IT Dashboard',
    maxScore: 100,
    passingScore: 70,
    files: {},
    rubricCategories: [
        { id: 'functions',    label: 'Functions & Docstrings',       maxPoints: 20 },
        { id: 'structure',    label: 'Control Flow & Logic',        maxPoints: 15 },
        { id: 'errors',       label: 'Error Handling',              maxPoints: 15 },
        { id: 'documentation',label: 'Documentation & Comments',    maxPoints: 15 },
        { id: 'validation',   label: 'Input Validation',            maxPoints: 15 },
        { id: 'execution',    label: 'Error-Free Execution',        maxPoints: 20 }
    ],
    tests: [
        // Execution tests — flexible stdin that works for any menu structure
        { id: 'exec_runs', category: 'execution', name: 'Runs without errors', type: 'execution', weight: 10,
          stdin: '0\n', checks: [{ type: 'no_exception' }] },
        { id: 'exec_exit_clean', category: 'execution', name: 'Exits cleanly on quit command', type: 'execution', weight: 5,
          stdin: '0\n', checks: [{ type: 'output_not_contains', value: 'Traceback' }] },
        { id: 'exec_invalid_input', category: 'execution', name: 'Handles invalid menu input', type: 'execution', weight: 5,
          stdin: 'xyz\n0\n', checks: [{ type: 'no_exception' }] },
        // Static: functions
        { id: 'static_func_count', category: 'functions', name: 'Has 3+ functions with def', type: 'static', weight: 8,
          checks: [{ type: 'code_regex_count', pattern: '^def\\s+\\w+\\(', minCount: 3, flags: 'm' }] },
        { id: 'static_docstrings', category: 'functions', name: 'Functions have docstrings', type: 'static', weight: 7,
          checks: [{ type: 'code_regex_count', pattern: 'def\\s+\\w+\\([^)]*\\):\\s*\\n\\s*("""|\'{3})', minCount: 3 }] },
        { id: 'static_return', category: 'functions', name: 'At least one function returns a value', type: 'static', weight: 5,
          checks: [{ type: 'code_regex', pattern: '\\breturn\\s+\\S' }] },
        // Static: control flow
        { id: 'static_loop', category: 'structure', name: 'Uses a loop (for or while)', type: 'static', weight: 5,
          checks: [{ type: 'code_regex', pattern: '(\\bfor\\b|\\bwhile\\b)' }] },
        { id: 'static_conditional', category: 'structure', name: 'Uses if/elif/else', type: 'static', weight: 5,
          checks: [{ type: 'code_contains', value: 'if' }, { type: 'code_contains', value: 'else' }] },
        { id: 'static_import', category: 'structure', name: 'Uses imports (stdlib or own modules)', type: 'static', weight: 5,
          checks: [{ type: 'code_regex', pattern: '(^import\\s|^from\\s)', flags: 'm' }] },
        // Static: error handling
        { id: 'static_try_except', category: 'errors', name: 'Has try/except blocks', type: 'static', weight: 8,
          checks: [{ type: 'code_contains', value: 'try:' }, { type: 'code_contains', value: 'except' }] },
        { id: 'static_specific_except', category: 'errors', name: 'Catches specific exceptions', type: 'static', weight: 7,
          checks: [{ type: 'code_regex', pattern: 'except\\s+(ValueError|TypeError|FileNotFoundError|KeyError|IndexError|IOError|AttributeError)' }] },
        // Static: documentation
        { id: 'static_header', category: 'documentation', name: 'Has file header comment/docstring', type: 'static', weight: 5,
          checks: [{ type: 'code_regex', pattern: '^(#|""")' }] },
        { id: 'static_comments', category: 'documentation', name: 'Has inline comments (5+)', type: 'static', weight: 5,
          checks: [{ type: 'code_regex_count', pattern: '#\\s*\\w', minCount: 5 }] },
        { id: 'static_section_comments', category: 'documentation', name: 'Section-level comments', type: 'static', weight: 5,
          checks: [{ type: 'code_regex_count', pattern: '#.*(?:menu|main|function|class|import|config|constant|helper|feature|section)', minCount: 2, flags: 'im' }] },
        // Static: input validation
        { id: 'static_input_validation', category: 'validation', name: 'Validates user input', type: 'static', weight: 8,
          checks: [{ type: 'code_regex', pattern: '(input\\(.*\\)\\.strip|isdigit\\(\\)|try.*int\\(input)' }] },
        { id: 'static_input_calls', category: 'validation', name: 'Uses input() for interaction', type: 'static', weight: 7,
          checks: [{ type: 'code_regex', pattern: 'input\\(' }] }
    ]
};

// ─── Seeding Logic ──────────────────────────────────────────────────

const ALL_SPECS = {
    'pfi-w1': PFI_W1,
    'pfi-w2': PFI_W2,
    'pfi-w3': PFI_W3,
    'pfi-w4': PFI_W4,
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
