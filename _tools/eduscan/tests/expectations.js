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
    'js-issues.html':         ['JS-001', 'JS-002'],
    'engine-issues.html':     ['ENG-001', 'ENG-002', 'ENG-003'],
    'path-issues.html':       ['PATH-001', 'PATH-002', 'PATH-003', 'PATH-DUP-001'],
    'path-depth-issues.html': ['PATH-DEPTH-001', 'PATH-DEPTH-002'],
    'naming-issues.html':     ['NAME-002']
};
