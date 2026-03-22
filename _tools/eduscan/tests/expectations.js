'use strict';

/**
 * EduScan Test Suite — Expected issue codes per fixture.
 *
 * Rules:
 *   - Empty array: fixture must produce ZERO issues (false-positive check)
 *   - Non-empty array: every listed code must appear; extra codes are OK
 */
module.exports = {
    'clean.html':             [],
    'html-issues.html':       ['HTML-001', 'HTML-003', 'HTML-005', 'HTML-006', 'HTML-007'],
    'js-issues.html':         ['JS-001', 'JS-002', 'JS-005', 'JS-006'],
    'engine-issues.html':     ['ENG-001', 'ENG-002', 'ENG-003'],
    'path-issues.html':       ['PATH-001', 'PATH-002', 'PATH-003', 'PATH-DUP-001'],
    'path-depth-issues.html': ['PATH-DEPTH-001', 'PATH-DEPTH-002'],
    'naming-issues.html':     ['NAME-002'],
    'html-strict-issues.html': ['HTML-004', 'HTML-008', 'HTML-009', 'HTML-010'],
    'js-strict-issues.html':   ['JS-003', 'JS-004', 'SCOPE-001'],
    'path-strict-issues.html': ['PATH-004', 'PATH-005'],
    'naming-full-issues.html': ['NAME-003', 'NAME-004'],
    'heuristic-issues.html':   ['HEUR-001', 'HEUR-002', 'HEUR-003', 'HEUR-004', 'HEUR-005', 'HEUR-007', 'MATH-001', 'DATA-001', 'HEUR-011', 'HEUR-012', 'HEUR-015', 'HEUR-016'],
    'nav-issues.html':          ['NAV-001'],
    'emoji-issues.html':         ['EMOJI-001', 'EMOJI-002', 'EMOJI-003', 'EMOJI-004', 'EMOJI-006'],
    'semantic-issues.html':       ['SEM-001', 'SEM-002'],
    'ux-issues.html':             ['UX-001'],
    'turtle-issues.html':          ['TURTLE-001', 'TURTLE-002'],
    'flex-overflow-issues.html':    ['FLEX-001'],
    'sandbox-issues.html':           ['SANDBOX-002', 'SANDBOX-003', 'SANDBOX-007'],
    'lt-issues.html':                 ['LT-001', 'LT-002', 'LT-003', 'LT-004'],
    'progress-issues.html':            ['PROG-001', 'PROG-002'],
    'xp-issues.js':                     ['XP-001', 'XP-002', 'XP-003', 'XP-004']
};
