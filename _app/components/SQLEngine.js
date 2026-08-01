/**
 * SQLEngine.js — Simulated SQL query engine for Code Armory SQL modules
 *
 * Integrates with LinuxTerminal.js via the onCommand callback hook.
 * Intercepts SQL-looking commands, executes them against an in-memory
 * database, and renders ASCII table output into the terminal.
 *
 * Usage in a SQL module:
 *
 *   LinuxTerminal.init('SQL-01', '#terminal', SQLEngine.wrap({
 *       user: 'analyst',
 *       hostname: 'sql-lab',
 *       startDir: '/home/analyst',
 *       height: '100%',
 *       onCommand: function(cmdLine, output, cmd, args) {
 *           // module-specific task completion checks
 *       }
 *   }));
 *
 * SQLEngine.wrap(config) returns the config object with:
 *   - suppressUnknown: true   (prevents "command not found" for SQL)
 *   - onCommand: <wrapped>    (SQL interceptor + original callback chain)
 *
 * The database is session-scoped. INSERT/UPDATE/DELETE/DDL mutations
 * persist for the lifetime of the page and reset on reload.
 *
 * @version 1.0.0
 */

(function() {
    'use strict';

    // =========================================================================
    // MASTER DATABASE — seeded with cybersecurity-themed HexCorp data
    // Tables are plain JS objects: { columns: [], rows: [[...], ...] }
    // Rows store values in the same order as columns[].
    // Session-scope mutations (INSERT/UPDATE/DELETE/DDL) live here only.
    // =========================================================================

    var DB = {};

    function _seedDatabase() {
        DB = {
            // password_hash holds bcrypt-style hashes (never plaintext) — the "sensitive column" the
            // SQLi UNION lesson (arm-sql-09) exfiltrates, teaching that even hashes leak via injection.
            users: {
                columns: ['user_id', 'username', 'email', 'role', 'department', 'created_at', 'is_active', 'password_hash', 'last_login'],
                rows: [
                    [1, 'jcarter',  'jcarter@hexcorp.io',  'admin',   'IT Security', '2024-01-15 09:00:00', 1, '$2b$12$K1x9aQ7uZ3rN.oP2sVfLeuJh0bYcW4dRtGmXn6qE8sA1vB3wC5yD6', '2024-09-01 12:30:00'],
                    [2, 'mzhang',   'mzhang@hexcorp.io',   'analyst', 'SOC',         '2024-02-20 14:30:00', 1, '$2b$12$L2y8bR6vA4sO.pQ3tWgMfvKi1cZdX5eSuHnYo7rF9tB2wC4xD6zE7', '2024-09-01 08:15:01'],
                    [3, 'tknight',  'tknight@hexcorp.io',  'admin',   'Network Ops', '2024-03-10 08:15:00', 1, '$2b$12$M3z7cS5wB5tP.qR4uXhNgwLj2dAeY6fTvIoZp8sG0uC3xD5yE7aF8', '2024-09-01 13:45:22'],
                    [4, 'srojas',   'srojas@hexcorp.io',   'viewer',  'Help Desk',   '2024-04-05 11:45:00', 0, '$2b$12$N4a6dT4xC6uQ.rS5vYiOhxMk3eBfZ7gUwJp1qtH1vD4yE6zF8bG9', null],
                    [5, 'dchen',    'dchen@hexcorp.io',    'analyst', 'SOC',         '2024-05-12 16:00:00', 1, '$2b$12$O5b5eU3yD7vR.sT6wZjPiyNl4fCg08hVxKq2ruI2wE5zF7aG9cH0', '2024-09-02 07:30:15'],
                    [6, 'apatel',   'apatel@hexcorp.io',   'viewer',  'Compliance',  '2024-06-01 10:30:00', 1, '$2b$12$P6c4fV2zE8wS.tU7xAkQjzOm5gDh19iWyLr3svJ3xF6aG8bH0dI1', '2024-09-02 09:12:44'],
                    [7, 'rwilson',  'rwilson@hexcorp.io',  'admin',   'IT Security', '2024-07-18 07:00:00', 1, '$2b$12$Q7d3gW1aF9xT.uV8yBlRk0Pn6hEi20jXzMs4twK4yG7bH9cI1eJ2', '2024-09-02 11:05:09'],
                    [8, 'lnguyen',  'lnguyen@hexcorp.io',  'analyst', 'Forensics',   '2024-08-22 13:15:00', 0, '$2b$12$R8e2hX0bG0yU.vW9zCmSl1Qo7iFj31kYaNt5uxL5zH8cI0dJ2fK3', null]
                ]
            },
            login_logs: {
                columns: ['log_id', 'user_id', 'timestamp', 'status', 'ip_address'],
                rows: [
                    [101, 1, '2024-09-01 08:12:33', 'success', '10.0.1.15'],
                    [102, 2, '2024-09-01 08:15:01', 'success', '10.0.2.44'],
                    [103, 4, '2024-09-01 09:00:12', 'failed',  '192.168.5.99'],
                    [104, 1, '2024-09-01 12:30:00', 'success', '10.0.1.15'],
                    [105, 3, '2024-09-01 13:45:22', 'success', '10.0.3.10'],
                    [106, 5, '2024-09-02 07:30:15', 'success', '10.0.2.88'],
                    [107, 2, '2024-09-02 08:00:00', 'failed',  '172.16.0.5'],
                    [108, 6, '2024-09-02 09:15:30', 'success', '10.0.4.20'],
                    [109, 1, '2024-09-02 14:00:00', 'success', '10.0.1.15'],
                    [110, 7, '2024-09-03 06:45:00', 'success', '10.0.1.22'],
                    [111, 4, '2024-09-03 10:10:10', 'failed',  '192.168.5.99'],
                    [112, 8, '2024-09-03 11:30:45', 'success', '10.0.5.33']
                ]
            },
            permissions: {
                columns: ['perm_id', 'user_id', 'permission', 'granted_at'],
                rows: [
                    [1,  1, 'full_access',       '2024-01-15'],
                    [2,  1, 'audit_log',          '2024-01-15'],
                    [3,  2, 'read_logs',          '2024-02-20'],
                    [4,  2, 'write_reports',      '2024-02-20'],
                    [5,  3, 'full_access',        '2024-03-10'],
                    [6,  3, 'network_admin',      '2024-03-10'],
                    [7,  4, 'read_only',          '2024-04-05'],
                    [8,  5, 'read_logs',          '2024-05-12'],
                    [9,  5, 'incident_response',  '2024-05-12'],
                    [10, 6, 'compliance_view',    '2024-06-01'],
                    [11, 7, 'full_access',        '2024-07-18'],
                    [12, 7, 'firewall_admin',     '2024-07-18']
                ]
            },
            // Network flow records for the traffic-analysis (arm-sql-05 SUM) and data-exfil-hunt
            // (arm-sql-10) lessons. The standout exfil signal is the compromised host 192.168.1.99
            // (the incident IP the module content references) pushing data to external destinations.
            // Its three outbound flows sum to exactly 15,728,640 bytes (8388608 + 4194304 + 3145728) —
            // the value the arm-sql-05 worked-example's SUM(...) WHERE source_ip='192.168.1.99' prints.
            network_logs: {
                columns: ['flow_id', 'timestamp', 'source_ip', 'dest_ip', 'bytes_transferred', 'protocol'],
                rows: [
                    [1,  '2024-09-01 08:20:00', '10.0.1.15',    '10.0.1.5',      4200,    'HTTPS'],
                    [2,  '2024-09-01 09:05:00', '10.0.2.44',    '10.0.1.5',      15800,   'HTTPS'],
                    [3,  '2024-09-01 10:30:00', '10.0.3.10',    '10.0.1.5',      8300,    'HTTPS'],
                    [4,  '2024-09-02 02:15:00', '192.168.1.99', '203.0.113.77',  8388608, 'HTTPS'],
                    [5,  '2024-09-02 02:47:00', '192.168.1.99', '203.0.113.77',  4194304, 'HTTPS'],
                    [6,  '2024-09-02 03:10:00', '192.168.1.99', '198.51.100.9',  3145728, 'DNS'],
                    [7,  '2024-09-02 08:00:00', '10.0.4.20',    '10.0.1.5',      6100,    'HTTP'],
                    [8,  '2024-09-02 11:22:00', '10.0.1.22',    '10.0.1.5',      12400,   'HTTPS'],
                    [9,  '2024-09-03 09:40:00', '10.0.5.33',    '10.0.1.5',      5200,    'HTTPS'],
                    [10, '2024-09-03 14:10:00', '10.0.1.15',    '10.0.1.5',      3900,    'HTTPS']
                ]
            }
        };

        // Session-created tables (DDL CREATE TABLE) append here at runtime
    }

    // Initialise once
    _seedDatabase();

    // =========================================================================
    // SCHEMA DEFINITIONS — used by .schema and DESCRIBE
    // =========================================================================

    var SCHEMA_SQL = {
        users: [
            'CREATE TABLE users (',
            '  user_id       INTEGER PRIMARY KEY,',
            '  username      TEXT NOT NULL,',
            '  email         TEXT NOT NULL,',
            '  role          TEXT NOT NULL,',
            '  department    TEXT,',
            '  created_at    TEXT,',
            '  is_active     INTEGER DEFAULT 1,',
            '  password_hash TEXT',
            ');'
        ].join('\n'),
        login_logs: [
            'CREATE TABLE login_logs (',
            '  log_id     INTEGER PRIMARY KEY,',
            '  user_id    INTEGER REFERENCES users(user_id),',
            '  timestamp  TEXT,',
            '  status     TEXT,',
            '  ip_address TEXT',
            ');'
        ].join('\n'),
        permissions: [
            'CREATE TABLE permissions (',
            '  perm_id    INTEGER PRIMARY KEY,',
            '  user_id    INTEGER REFERENCES users(user_id),',
            '  permission TEXT NOT NULL,',
            '  granted_at TEXT',
            ');'
        ].join('\n'),
        network_logs: [
            'CREATE TABLE network_logs (',
            '  flow_id           INTEGER PRIMARY KEY,',
            '  timestamp         TEXT,',
            '  source_ip         TEXT,',
            '  dest_ip           TEXT,',
            '  bytes_transferred INTEGER,',
            '  protocol          TEXT',
            ');'
        ].join('\n')
    };

    // =========================================================================
    // SQL KEYWORD DETECTION — determines if a raw terminal command line is SQL
    // =========================================================================

    var SQL_LEAD_WORDS = /^\s*(select|insert|update|delete|create|drop|alter|with|begin|commit|rollback|explain|pragma|grant|revoke)\s/i;
    var DOT_COMMANDS   = /^\s*\.(tables|schema|help|dump|mode|headers|quit|exit)/i;

    function _isSQLCommand(cmdLine) {
        if (SQL_LEAD_WORDS.test(cmdLine)) return true;
        if (DOT_COMMANDS.test(cmdLine)) return true;
        // sqlite3 invocation
        if (/^\s*sqlite3\b/i.test(cmdLine)) return true;
        // Bare SHOW TABLES / DESCRIBE variants
        if (/^\s*(show\s+tables|describe\s+\w+)/i.test(cmdLine)) return true;
        return false;
    }

    // =========================================================================
    // TOKENIZER — minimal SQL tokeniser (no full AST, pattern matching only)
    // Normalises whitespace, strips trailing semicolons.
    // =========================================================================

    function _normalise(sql) {
        return sql.replace(/\s+/g, ' ').replace(/;+\s*$/, '').trim();
    }

    // =========================================================================
    // EXPRESSION EVALUATOR — handles simple math in SELECT without FROM
    // Supports: integers, floats, +, -, *, /, (, ), %, unary minus
    // =========================================================================

    function _evalMath(expr) {
        // Only allow safe numeric characters
        if (!/^[\d\s\+\-\*\/\(\)\.%]+$/.test(expr.trim())) return null;
        try {
            /*jshint evil:true */
            var result = Function('"use strict"; return (' + expr.trim() + ')')();
            if (typeof result !== 'number' || !isFinite(result)) return null;
            // Return integer if whole number, else up to 6 decimal places
            return (result % 1 === 0) ? String(result) : String(parseFloat(result.toFixed(6)));
        } catch (e) {
            return null;
        }
    }

    // =========================================================================
    // WHERE CLAUSE EVALUATOR
    // Supports: =, !=, <>, >, <, >=, <=, LIKE, IN (value list), AND, OR, NOT
    // =========================================================================

    function _colValue(row, columns, colName) {
        // Strip table alias prefix (e.g. u.username -> username)
        var bare = colName.indexOf('.') !== -1 ? colName.split('.').pop() : colName;
        var idx = columns.indexOf(bare);
        if (idx === -1) {
            // Case-insensitive fallback
            for (var i = 0; i < columns.length; i++) {
                if (columns[i].toLowerCase() === bare.toLowerCase()) return row[i];
            }
            return null;
        }
        return row[idx];
    }

    // Parse a simple WHERE token stream; returns boolean
    function _evalWhere(row, columns, whereClause) {
        if (!whereClause) return true;

        var expr = whereClause.trim();

        // Handle AND / OR splitting (outermost level only — naive but effective)
        // We scan for AND/OR not inside parentheses
        var depth = 0;
        var tokens = [];
        var current = '';
        var i, ch;

        // `BETWEEN lo AND hi` owns its AND. Splitting on it left `col BETWEEN 'a'` as a fragment
        // that matched no rule and fell through to the pass-through return below -- which is the
        // real reason BETWEEN never parsed. arm-sql-03 TEACHES and GRADES BETWEEN, so every student
        // who used it silently got every row back and a green chip. Step over that AND instead.
        var betweenOpen = false;
        // Only split at a word BOUNDARY: without this a column named `brand` or `order` is cut in
        // half, because the peek below matches the AND/OR inside the identifier.
        var atWordStart = function (idx) { return idx === 0 || /\s|\(/.test(expr[idx - 1]); };

        for (i = 0; i < expr.length; i++) {
            ch = expr[i];
            if (ch === '(') { depth++; current += ch; continue; }
            if (ch === ')') { depth--; current += ch; continue; }
            if (depth === 0 && atWordStart(i)) {
                if (/^BETWEEN\s/i.test(expr.slice(i))) { betweenOpen = true; }
                // Peek for AND
                if (/^AND\s/i.test(expr.slice(i))) {
                    if (betweenOpen) {
                        // This AND belongs to the BETWEEN, not to the condition chain.
                        betweenOpen = false;
                        current += expr.slice(i, i + 3);
                        i += 2;
                        continue;
                    }
                    tokens.push({ type: 'expr', val: current.trim() });
                    tokens.push({ type: 'op', val: 'AND' });
                    current = '';
                    i += 3; // skip 'AND'
                    continue;
                }
                // Peek for OR
                if (/^OR\s/i.test(expr.slice(i))) {
                    tokens.push({ type: 'expr', val: current.trim() });
                    tokens.push({ type: 'op', val: 'OR' });
                    current = '';
                    i += 2; // skip 'OR'
                    continue;
                }
            }
            current += ch;
        }
        if (current.trim()) tokens.push({ type: 'expr', val: current.trim() });

        if (tokens.length === 1) {
            return _evalSingleCondition(row, columns, tokens[0].val);
        }

        // Evaluate AND/OR chain (left-to-right, no precedence — good enough)
        var result = null;
        var pendingOp = null;
        for (i = 0; i < tokens.length; i++) {
            var tok = tokens[i];
            if (tok.type === 'op') { pendingOp = tok.val; continue; }
            var val = _evalSingleCondition(row, columns, tok.val);
            if (result === null) { result = val; }
            else if (pendingOp === 'AND') { result = result && val; }
            else if (pendingOp === 'OR')  { result = result || val; }
        }
        return !!result;
    }

    function _evalSingleCondition(row, columns, expr) {
        expr = expr.trim();

        // Strip outer parens
        if (expr[0] === '(' && expr[expr.length - 1] === ')') {
            expr = expr.slice(1, -1).trim();
        }

        // NOT prefix
        if (/^NOT\s+/i.test(expr)) {
            return !_evalSingleCondition(row, columns, expr.replace(/^NOT\s+/i, ''));
        }

        // LIKE operator
        var likeMatch = expr.match(/^(\S+)\s+(?:NOT\s+)?LIKE\s+'([^']*)'/i);
        if (likeMatch) {
            var likeNot = /NOT\s+LIKE/i.test(expr);
            var likeLeft = String(_colValue(row, columns, likeMatch[1]) || '');
            var pattern = likeMatch[2]
                .replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') // escape regex special chars
                .replace(/%/g, '.*')   // SQL % -> regex .*
                .replace(/_/g, '.');   // SQL _ -> regex .
            var likeResult = new RegExp('^' + pattern + '$', 'i').test(likeLeft);
            return likeNot ? !likeResult : likeResult;
        }

        // IN (value list) — not subquery, plain list
        var inMatch = expr.match(/^(\S+)\s+(NOT\s+)?IN\s+\(([^)]+)\)/i);
        if (inMatch) {
            var inNot = !!inMatch[2];
            var inLeft = _colValue(row, columns, inMatch[1]);
            var inList = inMatch[3].split(',').map(function(v) {
                v = v.trim();
                if (/^'.*'$/.test(v)) return v.slice(1, -1);
                return isNaN(v) ? v : Number(v);
            });
            var inResult = inList.indexOf(inLeft) !== -1;
            return inNot ? !inResult : inResult;
        }

        // IS NULL / IS NOT NULL
        var isNullMatch = expr.match(/^(\S+)\s+IS\s+(NOT\s+)?NULL/i);
        if (isNullMatch) {
            var isNullNot = !!isNullMatch[2];
            var isNullVal = _colValue(row, columns, isNullMatch[1]);
            var isNull = (isNullVal === null || isNullVal === undefined || isNullVal === '');
            return isNullNot ? !isNull : isNull;
        }

        // Standard comparison: col OP value
        var cmpMatch = expr.match(/^(\S+)\s*(!=|<>|>=|<=|>|<|=)\s*(.+)$/i);
        if (cmpMatch) {
            var leftRaw = _colValue(row, columns, cmpMatch[1]);
            var op      = cmpMatch[2];
            var rightRaw = cmpMatch[3].trim();

            // Strip quotes from string literals
            var right;
            if (/^'.*'$/.test(rightRaw)) {
                right = rightRaw.slice(1, -1);
            } else if (!isNaN(rightRaw)) {
                right = Number(rightRaw);
            } else {
                right = rightRaw;
            }

            // Coerce left to number if right is numeric
            var left = (typeof right === 'number' && !isNaN(Number(leftRaw)))
                ? Number(leftRaw)
                : String(leftRaw === null || leftRaw === undefined ? '' : leftRaw);

            if (typeof right === 'string') left = String(left);

            switch (op) {
                case '=':  return left == right;
                case '!=':
                case '<>': return left != right;
                case '>':  return left > right;
                case '<':  return left < right;
                case '>=': return left >= right;
                case '<=': return left <= right;
            }
        }

        // BETWEEN lo AND hi -- taught and graded by arm-sql-03. Previously unreachable because the
        // tokenizer above split it in half; with that fixed, evaluate it properly.
        var btwMatch = expr.match(/^(\S+)\s+(NOT\s+)?BETWEEN\s+(.+?)\s+AND\s+(.+)$/i);
        if (btwMatch) {
            var btwNot = !!btwMatch[2];
            var lit = function (t) {
                t = String(t).trim();
                if (/^'.*'$/.test(t)) return t.slice(1, -1);
                if (t !== '' && !isNaN(Number(t))) return Number(t);
                return _colValue(row, columns, t);
            };
            var btwVal = lit(btwMatch[1]), btwLo = lit(btwMatch[3]), btwHi = lit(btwMatch[4]);
            // Numeric when all three are numeric, else lexicographic -- the teaching set uses
            // BETWEEN on integers and on ISO dates stored as text, and both work this way.
            if (!isNaN(Number(btwVal)) && !isNaN(Number(btwLo)) && !isNaN(Number(btwHi))) {
                btwVal = Number(btwVal); btwLo = Number(btwLo); btwHi = Number(btwHi);
            } else {
                btwVal = String(btwVal); btwLo = String(btwLo); btwHi = String(btwHi);
            }
            var btwResult = (btwVal >= btwLo && btwVal <= btwHi);
            return btwNot ? !btwResult : btwResult;
        }

        // Cannot evaluate — pass through (treat as true so query doesn't silently drop rows).
        // KNOWN GAP, BUG-078 class B: this is why a garbage predicate still completes a module.
        // Closing it requires _colValue to reject unknown columns, which currently breaks the
        // JOIN-alias, subquery-substitution and CTE paths. See _tools/sql-engine-strict-wip.js.
        return true;
    }

    // =========================================================================
    // COLUMN RESOLUTION — parse SELECT column list into descriptor objects
    // Handles: *, table.*, col, alias.col, col AS alias, func(col) AS alias
    // =========================================================================

    function _parseSelectCols(colStr) {
        // Split by comma, respecting parentheses (for function calls)
        var parts = [];
        var depth = 0;
        var current = '';
        for (var i = 0; i < colStr.length; i++) {
            var ch = colStr[i];
            if (ch === '(') { depth++; current += ch; }
            else if (ch === ')') { depth--; current += ch; }
            else if (ch === ',' && depth === 0) { parts.push(current.trim()); current = ''; }
            else { current += ch; }
        }
        if (current.trim()) parts.push(current.trim());

        return parts.map(function(p) {
            p = p.trim();

            // Alias: expr AS alias
            var asMatch = p.match(/^(.+)\s+AS\s+(\S+)$/i);
            var expr = asMatch ? asMatch[1].trim() : p;
            var alias = asMatch ? asMatch[2] : null;

            // Aggregate functions
            var aggMatch = expr.match(/^(COUNT|SUM|AVG|MIN|MAX)\s*\(\s*(.+?)\s*\)$/i);
            if (aggMatch) {
                return { type: 'agg', fn: aggMatch[1].toUpperCase(), col: aggMatch[2], alias: alias || (aggMatch[1].toUpperCase() + '(' + aggMatch[2] + ')') };
            }

            // Wildcard
            if (expr === '*' || /^\w+\.\*$/.test(expr)) {
                return { type: 'star', alias: null };
            }

            // Plain column (possibly table.col)
            return { type: 'col', expr: expr, alias: alias || expr };
        });
    }

    // =========================================================================
    // AGGREGATE COMPUTATION
    // =========================================================================

    function _computeAgg(fn, col, rows, columns) {
        if (fn === 'COUNT') {
            if (col === '*') return rows.length;
            return rows.filter(function(r) {
                var v = _colValue(r, columns, col);
                return v !== null && v !== undefined && v !== '';
            }).length;
        }

        var nums = rows.map(function(r) {
            return Number(_colValue(r, columns, col));
        }).filter(function(n) { return !isNaN(n); });

        if (fn === 'SUM') return nums.reduce(function(a, b) { return a + b; }, 0);
        if (fn === 'AVG') return nums.length ? (nums.reduce(function(a, b) { return a + b; }, 0) / nums.length) : null;
        // MIN/MAX must work on TEXT too (e.g. MIN(timestamp) to find first/last occurrence — a core
        // lesson). Numeric-only min/max returned 0 for string columns. Compare numerically when every
        // value is numeric, else lexicographically (ISO timestamps sort chronologically as strings).
        if (fn === 'MIN' || fn === 'MAX') {
            var vals = rows.map(function(r) { return _colValue(r, columns, col); })
                           .filter(function(v) { return v !== null && v !== undefined && v !== ''; });
            if (!vals.length) return null;
            var allNum = vals.every(function(v) { return !isNaN(Number(v)); });
            var sorted = vals.slice().sort(allNum
                ? function(a, b) { return Number(a) - Number(b); }
                : function(a, b) { return String(a) < String(b) ? -1 : (String(a) > String(b) ? 1 : 0); });
            return fn === 'MIN' ? sorted[0] : sorted[sorted.length - 1];
        }
        return null;
    }

    // =========================================================================
    // QUERY PARSER — main entry point for SELECT execution
    // =========================================================================

    function _execSelect(sql) {
        var norm = _normalise(sql);

        // ---- Special built-in expressions (no FROM) ----

        // SELECT sqlite_version()
        if (/^select\s+sqlite_version\s*\(\s*\)/i.test(norm)) {
            return _renderScalar('sqlite_version()', '3.39.4');
        }

        // SELECT datetime('now') or datetime("now")
        if (/^select\s+datetime\s*\(\s*['"]now['"]\s*\)/i.test(norm)) {
            var now = new Date();
            var iso = now.getFullYear() + '-' +
                _pad(now.getMonth() + 1) + '-' +
                _pad(now.getDate()) + ' ' +
                _pad(now.getHours()) + ':' +
                _pad(now.getMinutes()) + ':' +
                _pad(now.getSeconds());
            return _renderScalar("datetime('now')", iso);
        }

        // SELECT date('now')
        if (/^select\s+date\s*\(\s*['"]now['"]\s*\)/i.test(norm)) {
            var d = new Date();
            var ds = d.getFullYear() + '-' + _pad(d.getMonth() + 1) + '-' + _pad(d.getDate());
            return _renderScalar("date('now')", ds);
        }

        // SELECT name FROM sqlite_master WHERE type='table'
        if (/sqlite_master/i.test(norm)) {
            var tableNames = Object.keys(DB);
            return _renderSingleCol('name', tableNames);
        }

        // SELECT <math expr> with no FROM clause
        var noFromMatch = norm.match(/^select\s+(.+)$/i);
        if (noFromMatch && !/\bfrom\b/i.test(norm)) {
            var mathExpr = noFromMatch[1].trim();
            var mathResult = _evalMath(mathExpr);
            if (mathResult !== null) {
                return _renderScalar(mathExpr, mathResult);
            }
            // Could be a string literal
            if (/^'[^']*'$/.test(mathExpr)) {
                return _renderScalar(mathExpr, mathExpr.slice(1, -1));
            }
            return _renderError('Expression could not be evaluated: ' + mathExpr);
        }

        // ---- CTE: WITH name AS (subquery) SELECT ... ----
        var cteMatch = norm.match(/^with\s+(\w+)\s+as\s*\((.+)\)\s+select\s+(.+)$/i);
        if (cteMatch) {
            return _execCTE(cteMatch[1], cteMatch[2], 'SELECT ' + cteMatch[3]);
        }

        // ---- Main SELECT parser ----
        // Extract: DISTINCT, columns, FROM, JOIN, WHERE, GROUP BY, HAVING, ORDER BY, LIMIT
        var selectParts = _dissectSelect(norm);
        if (selectParts.error) return _renderError(selectParts.error);

        return _execSelectParts(selectParts);
    }

    // Dissect a normalised SELECT into its clause components
    function _dissectSelect(norm) {
        var result = {
            distinct: false, colStr: '', table: '', join: null, where: null,
            groupBy: null, having: null, orderBy: null, orderDir: 'ASC', limit: null
        };

        // LIMIT
        var limitMatch = norm.match(/\bLIMIT\s+(\d+)/i);
        if (limitMatch) { result.limit = parseInt(limitMatch[1], 10); norm = norm.replace(/\bLIMIT\s+\d+/i, '').trim(); }

        // ORDER BY
        var orderMatch = norm.match(/\bORDER\s+BY\s+(\S+)(?:\s+(ASC|DESC))?/i);
        if (orderMatch) {
            result.orderBy = orderMatch[1].replace(/[;,]$/, '');
            result.orderDir = (orderMatch[2] || 'ASC').toUpperCase();
            norm = norm.replace(/\bORDER\s+BY\s+\S+(?:\s+(?:ASC|DESC))?/i, '').trim();
        }

        // HAVING
        var havingMatch = norm.match(/\bHAVING\s+(.+?)(?=\b(?:ORDER|LIMIT|$))/i);
        if (havingMatch) { result.having = havingMatch[1].trim(); norm = norm.replace(/\bHAVING\s+.+?(?=\b(?:ORDER|LIMIT|$))/i, '').trim(); }

        // GROUP BY
        var groupMatch = norm.match(/\bGROUP\s+BY\s+(\S+)/i);
        if (groupMatch) { result.groupBy = groupMatch[1].replace(/[;,]$/, ''); norm = norm.replace(/\bGROUP\s+BY\s+\S+/i, '').trim(); }

        // WHERE — capture everything after WHERE up to next major clause keyword
        var whereMatch = norm.match(/\bWHERE\s+(.+?)(?=\s+(?:GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|$))/i);
        if (!whereMatch) {
            // Try simpler: WHERE to end
            whereMatch = norm.match(/\bWHERE\s+(.+)$/i);
        }
        if (whereMatch) {
            result.where = whereMatch[1].trim();
            norm = norm.replace(/\bWHERE\s+.+?(?=\s+(?:GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT)|$)/i, '').trim();
            if (!result.where) {
                norm = norm.replace(/\bWHERE\s+.*/i, '').trim();
            }
        }

        // JOIN — capture everything between FROM table and WHERE/end
        var joinMatch = norm.match(/\b((?:INNER|LEFT|RIGHT|FULL\s+OUTER?|CROSS)?\s*JOIN\s+.+?)(?=\bWHERE\b|$)/i);
        if (joinMatch) {
            result.join = joinMatch[1].trim();
            norm = norm.replace(joinMatch[0], '').trim();
        }

        // FROM
        var fromMatch = norm.match(/\bFROM\s+(\S+)/i);
        if (!fromMatch) return { error: 'No FROM clause found' };
        result.table = fromMatch[1].replace(/[;,]$/, '');
        norm = norm.replace(/\bFROM\s+\S+/i, '').trim();

        // SELECT [DISTINCT] columns
        var selMatch = norm.match(/^SELECT\s+(DISTINCT\s+)?(.+)$/i);
        if (!selMatch) return { error: 'Malformed SELECT clause' };
        result.distinct = !!selMatch[1];
        result.colStr = selMatch[2].trim();

        return result;
    }

    // Execute a dissected SELECT parts object
    function _execSelectParts(p) {
        // Resolve base table (strip alias)
        var tableAlias = p.table.match(/^(\w+)(?:\s+(?:AS\s+)?(\w+))?$/i);
        var tableName  = tableAlias ? tableAlias[1] : p.table;

        var table = DB[tableName.toLowerCase()] || DB[tableName];
        if (!table) return _renderError("no such table: " + tableName);

        var columns = table.columns.slice();
        var rows    = table.rows.map(function(r) { return r.slice(); }); // shallow copy

        // ---- JOIN ----
        if (p.join) {
            var joinResult = _applyJoin(rows, columns, p.join, tableName);
            if (joinResult.error) return _renderError(joinResult.error);
            rows    = joinResult.rows;
            columns = joinResult.columns;
        }

        // ---- WHERE (with subquery substitution) ----
        var whereClause = p.where;
        if (whereClause) {
            whereClause = _substituteSubqueries(whereClause);
        }
        if (whereClause) {
            rows = rows.filter(function(r) { return _evalWhere(r, columns, whereClause); });
        }

        // ---- Resolve column descriptors ----
        var colDescs = _parseSelectCols(p.colStr);
        var hasAgg   = colDescs.some(function(d) { return d.type === 'agg'; });

        // ---- GROUP BY ----
        if (p.groupBy || hasAgg) {
            return _execGroupBy(rows, columns, colDescs, p.groupBy, p.having, p.orderBy, p.orderDir, p.limit, p.distinct);
        }

        // ---- Project columns ----
        var outCols = _resolveOutputColumns(colDescs, columns);
        var outRows = rows.map(function(r) {
            return outCols.map(function(col) { return _colValue(r, columns, col.src); });
        });

        // ---- DISTINCT ----
        if (p.distinct) {
            outRows = _applyDistinct(outRows);
        }

        // ---- ORDER BY ----
        if (p.orderBy) {
            var sortCol = p.orderBy;
            var sortIdx = outCols.findIndex(function(c) { return c.label.toLowerCase() === sortCol.toLowerCase() || c.src.toLowerCase() === sortCol.toLowerCase(); });
            if (sortIdx === -1) {
                // Try the raw source columns
                var rawIdx = columns.indexOf(sortCol) !== -1 ? columns.indexOf(sortCol) : -1;
                if (rawIdx !== -1) {
                    // Re-sort on raw data before projection was applied — re-sort outRows
                    // Best we can do: sort by string value of whatever is at that position
                }
                sortIdx = 0; // fallback
            }
            outRows.sort(function(a, b) {
                var av = a[sortIdx], bv = b[sortIdx];
                if (!isNaN(Number(av)) && !isNaN(Number(bv))) { av = Number(av); bv = Number(bv); }
                if (av < bv) return p.orderDir === 'ASC' ? -1 : 1;
                if (av > bv) return p.orderDir === 'ASC' ? 1 : -1;
                return 0;
            });
        }

        // ---- LIMIT ----
        if (p.limit !== null) {
            outRows = outRows.slice(0, p.limit);
        }

        return _renderTable(outCols.map(function(c) { return c.label; }), outRows);
    }

    // -------------------------------------------------------------------------
    // JOIN handler — supports INNER JOIN and LEFT JOIN on shared column names
    // -------------------------------------------------------------------------
    function _applyJoin(baseRows, baseCols, joinClause, baseTable) {
        // Parse one or more JOIN segments
        var joinSegments = [];
        var joinRe = /((?:INNER|LEFT|RIGHT|CROSS)?\s*JOIN)\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?\s+ON\s+(.+?)(?=(?:INNER|LEFT|RIGHT|CROSS)?\s*JOIN\b|$)/gi;
        var m;
        while ((m = joinRe.exec(joinClause)) !== null) {
            joinSegments.push({
                type: m[1].trim().toUpperCase(),
                table: m[2],
                alias: m[3] || m[2],
                on: m[4].trim()
            });
        }

        if (joinSegments.length === 0) {
            // Simpler single-join with no trailing content
            var simpleRe = /((?:INNER|LEFT|RIGHT|CROSS)?\s*JOIN)\s+(\w+)(?:\s+(?:AS\s+)?(\w+))?\s+ON\s+(.+)$/i;
            var sm = joinClause.match(simpleRe);
            if (sm) {
                joinSegments.push({ type: sm[1].trim().toUpperCase(), table: sm[2], alias: sm[3] || sm[2], on: sm[4].trim() });
            }
        }

        if (joinSegments.length === 0) return { error: 'Malformed JOIN clause' };

        var rows    = baseRows;
        var columns = baseCols.slice();

        for (var ji = 0; ji < joinSegments.length; ji++) {
            var seg = joinSegments[ji];
            var joinTable = DB[seg.table.toLowerCase()] || DB[seg.table];
            if (!joinTable) return { error: 'no such table: ' + seg.table };

            var jCols = joinTable.columns.map(function(c) { return seg.alias + '.' + c; });
            var isLeft = /LEFT/i.test(seg.type);

            // Parse ON condition: left_col = right_col
            var onMatch = seg.on.match(/(\S+)\s*=\s*(\S+)/);
            if (!onMatch) return { error: 'Unsupported ON clause: ' + seg.on };

            var leftExpr  = onMatch[1];
            var rightExpr = onMatch[2];

            // Determine which side is base vs join
            var leftIsJoin  = leftExpr.toLowerCase().indexOf((seg.alias + '.').toLowerCase()) === 0 ||
                              leftExpr.toLowerCase().indexOf((seg.table + '.').toLowerCase()) === 0;
            var rightIsJoin = rightExpr.toLowerCase().indexOf((seg.alias + '.').toLowerCase()) === 0 ||
                              rightExpr.toLowerCase().indexOf((seg.table + '.').toLowerCase()) === 0;

            // Normalise: leftColBase = column in current rows, rightColJoin = column in join table
            var leftColBase, rightColJoin;
            if (leftIsJoin) {
                leftColBase  = rightExpr;
                rightColJoin = leftExpr.split('.').pop();
            } else {
                leftColBase  = leftExpr;
                rightColJoin = rightExpr.split('.').pop();
            }

            var newCols = columns.concat(jCols);
            var newRows = [];

            rows.forEach(function(baseRow) {
                var baseVal = _colValue(baseRow, columns, leftColBase);
                var matched = false;

                joinTable.rows.forEach(function(jRow) {
                    var jIdx = joinTable.columns.indexOf(rightColJoin);
                    if (jIdx === -1) return;
                    var jVal = jRow[jIdx];
                    if (String(baseVal) === String(jVal)) {
                        newRows.push(baseRow.concat(jRow));
                        matched = true;
                    }
                });

                // LEFT JOIN: include base row even if no match (NULLs for join side)
                if (!matched && isLeft) {
                    newRows.push(baseRow.concat(new Array(joinTable.columns.length).fill(null)));
                }
            });

            rows    = newRows;
            columns = newCols;
        }

        return { rows: rows, columns: columns };
    }

    // -------------------------------------------------------------------------
    // GROUP BY + aggregation handler
    // -------------------------------------------------------------------------
    function _execGroupBy(rows, columns, colDescs, groupByCol, having, orderBy, orderDir, limit, distinct) {
        // If no GROUP BY, treat all rows as one group (for single aggregates like COUNT(*))
        var groups = {};
        var groupKeys = [];

        if (groupByCol) {
            rows.forEach(function(r) {
                var key = String(_colValue(r, columns, groupByCol));
                if (!groups[key]) { groups[key] = []; groupKeys.push(key); }
                groups[key].push(r);
            });
        } else {
            groups['__all__'] = rows;
            groupKeys = ['__all__'];
        }

        // Resolve output columns for each group
        var outCols = [];
        colDescs.forEach(function(d) {
            if (d.type === 'agg') { outCols.push(d.alias); }
            else if (d.type === 'star') { outCols = columns.slice(); }
            else { outCols.push(d.alias || d.expr); }
        });

        var outRows = groupKeys.map(function(key) {
            var groupRows = groups[key];
            return colDescs.map(function(d) {
                if (d.type === 'agg') {
                    var v = _computeAgg(d.fn, d.col, groupRows, columns);
                    return v !== null ? String(v) : '0';
                }
                if (d.type === 'star') {
                    // Expand star for first row of group
                    return groupRows[0];
                }
                var rawCol = d.expr.indexOf('.') !== -1 ? d.expr.split('.').pop() : d.expr;
                return _colValue(groupRows[0], columns, rawCol);
            });
        });

        // Flatten star expansions (rare edge case)
        outRows = outRows.map(function(r) {
            var flat = [];
            r.forEach(function(v) {
                if (Array.isArray(v)) { flat = flat.concat(v); }
                else { flat.push(v); }
            });
            return flat;
        });

        // HAVING filter — applied to aggregate result rows
        if (having) {
            // Build a synthetic column list from outCols for HAVING evaluation
            outRows = outRows.filter(function(r) { return _evalWhere(r, outCols, having); });
        }

        // ORDER BY
        if (orderBy) {
            var oIdx = outCols.findIndex
                ? outCols.findIndex(function(c) { return typeof c === 'string' && (c.toLowerCase() === orderBy.toLowerCase()); })
                : 0;
            if (oIdx < 0) oIdx = 0;
            outRows.sort(function(a, b) {
                var av = a[oIdx], bv = b[oIdx];
                if (!isNaN(Number(av)) && !isNaN(Number(bv))) { av = Number(av); bv = Number(bv); }
                if (av < bv) return orderDir === 'ASC' ? -1 : 1;
                if (av > bv) return orderDir === 'ASC' ? 1 : -1;
                return 0;
            });
        }

        if (limit !== null) outRows = outRows.slice(0, limit);

        return _renderTable(outCols, outRows);
    }

    // -------------------------------------------------------------------------
    // Subquery substitution — replaces IN (SELECT ...) with an inline list
    // -------------------------------------------------------------------------
    function _substituteSubqueries(whereClause) {
        // Match: col IN (SELECT ...)
        var subRe = /\bIN\s*\(\s*(SELECT\s+.+?)\s*\)/gi;
        return whereClause.replace(subRe, function(match, subSql) {
            var subResult = _execSelect(subSql);
            if (subResult.type === 'error') return 'IN ()';
            // Extract values from first column of each row
            var vals = (subResult.rows || []).map(function(r) {
                var v = r[0];
                return (typeof v === 'string') ? "'" + v + "'" : String(v);
            });
            return 'IN (' + vals.join(', ') + ')';
        });
    }

    // -------------------------------------------------------------------------
    // EXISTS subquery — simplified: returns bool
    // -------------------------------------------------------------------------
    function _evalExists(subSql, baseRow, baseColumns) {
        var result = _execSelect(subSql);
        return result && result.rows && result.rows.length > 0;
    }

    // -------------------------------------------------------------------------
    // CTE (WITH ... AS (...) SELECT ...)
    // -------------------------------------------------------------------------
    function _execCTE(cteName, cteQuery, mainQuery) {
        // Execute the CTE sub-query
        var cteResult = _execSelect(_normalise(cteQuery));
        if (cteResult.type === 'error') return cteResult;

        // Temporarily install CTE as a table
        var prevTable = DB[cteName.toLowerCase()];
        DB[cteName.toLowerCase()] = { columns: cteResult.columns, rows: cteResult.rows };

        var out = _execSelect(_normalise(mainQuery));

        // Restore
        if (prevTable) { DB[cteName.toLowerCase()] = prevTable; }
        else { delete DB[cteName.toLowerCase()]; }

        return out;
    }

    // -------------------------------------------------------------------------
    // Resolve output column labels and source mappings from descriptors
    // -------------------------------------------------------------------------
    function _resolveOutputColumns(colDescs, availableCols) {
        var result = [];
        colDescs.forEach(function(d) {
            if (d.type === 'star') {
                availableCols.forEach(function(c) { result.push({ label: c.split('.').pop(), src: c }); });
            } else {
                // Strip table alias from label if present
                var label = (d.alias || d.expr || '').split('.').pop();
                result.push({ label: label, src: d.expr });
            }
        });
        return result;
    }

    // -------------------------------------------------------------------------
    // DISTINCT filter on output rows
    // -------------------------------------------------------------------------
    function _applyDistinct(rows) {
        var seen = {};
        return rows.filter(function(r) {
            var key = JSON.stringify(r);
            if (seen[key]) return false;
            seen[key] = true;
            return true;
        });
    }

    // =========================================================================
    // DML / DDL HANDLERS
    // =========================================================================

    function _execInsert(sql) {
        // INSERT INTO table (col1, col2, ...) VALUES (v1, v2, ...)
        var m = sql.match(/INSERT\s+INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
        if (!m) {
            // INSERT INTO table VALUES (v1, v2, ...)
            var m2 = sql.match(/INSERT\s+INTO\s+(\w+)\s+VALUES\s*\(([^)]+)\)/i);
            if (!m2) return _renderError('Malformed INSERT statement');
            var tableName = m2[1];
            var table = DB[tableName.toLowerCase()] || DB[tableName];
            if (!table) return _renderError('no such table: ' + tableName);
            var vals = _parseValueList(m2[2]);
            table.rows.push(vals);
            return _renderOk('1 row inserted into ' + tableName);
        }

        var tn = m[1];
        var tbl = DB[tn.toLowerCase()] || DB[tn];
        if (!tbl) return _renderError('no such table: ' + tn);

        var cols = m[2].split(',').map(function(c) { return c.trim(); });
        var vals2 = _parseValueList(m[3]);

        if (cols.length !== vals2.length) return _renderError('Column count mismatch');

        // Build full row with nulls for missing columns
        var newRow = tbl.columns.map(function(c) {
            var idx = cols.indexOf(c);
            return idx !== -1 ? vals2[idx] : null;
        });

        // Auto-increment numeric PK if null
        if (newRow[0] === null) {
            var maxId = tbl.rows.reduce(function(mx, r) { return Math.max(mx, Number(r[0]) || 0); }, 0);
            newRow[0] = maxId + 1;
        }

        tbl.rows.push(newRow);
        return _renderOk('1 row inserted into ' + tn);
    }

    function _execUpdate(sql) {
        // UPDATE table SET col=val [, col=val] WHERE condition
        var m = sql.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
        if (!m) return _renderError('Malformed UPDATE statement');

        var tn = m[1];
        var tbl = DB[tn.toLowerCase()] || DB[tn];
        if (!tbl) return _renderError('no such table: ' + tn);

        var setClauses = m[2].split(',').map(function(s) { return s.trim(); });
        var whereClause = m[3] ? m[3].trim() : null;

        var updateCount = 0;
        tbl.rows = tbl.rows.map(function(row) {
            if (whereClause && !_evalWhere(row, tbl.columns, whereClause)) return row;
            var newRow = row.slice();
            setClauses.forEach(function(clause) {
                var eq = clause.match(/^(\w+)\s*=\s*(.+)$/);
                if (!eq) return;
                var colName = eq[1].trim();
                var colIdx = tbl.columns.indexOf(colName);
                if (colIdx === -1) return;
                var rawVal = eq[2].trim();
                if (/^'.*'$/.test(rawVal)) { newRow[colIdx] = rawVal.slice(1, -1); }
                else if (!isNaN(rawVal)) { newRow[colIdx] = Number(rawVal); }
                else { newRow[colIdx] = rawVal; }
            });
            updateCount++;
            return newRow;
        });

        // Honesty (BUG-008): a WHERE that matched nothing changed nothing — render it as a gradeable
        // failure (error color) so a no-op UPDATE can't earn task credit for doing nothing.
        if (whereClause && updateCount === 0) {
            return _renderError('UPDATE matched 0 rows — no row satisfied the WHERE clause');
        }
        return _renderOk(updateCount + ' row(s) updated in ' + tn);
    }

    function _execDelete(sql) {
        // DELETE FROM table [WHERE condition]
        var m = sql.match(/DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?$/i);
        if (!m) return _renderError('Malformed DELETE statement');

        var tn = m[1];
        var tbl = DB[tn.toLowerCase()] || DB[tn];
        if (!tbl) return _renderError('no such table: ' + tn);

        var whereClause = m[2] ? m[2].trim() : null;
        var originalCount = tbl.rows.length;

        if (!whereClause) {
            tbl.rows = [];
        } else {
            tbl.rows = tbl.rows.filter(function(row) { return !_evalWhere(row, tbl.columns, whereClause); });
        }

        var deleted = originalCount - tbl.rows.length;
        // Honesty (BUG-008): a WHERE that matched nothing deleted nothing — render it as a gradeable
        // failure so a no-op DELETE can't earn task credit for doing nothing.
        if (whereClause && deleted === 0) {
            return _renderError('DELETE matched 0 rows — no row satisfied the WHERE clause');
        }
        return _renderOk(deleted + ' row(s) deleted from ' + tn);
    }

    // GRANT <priv[,priv]> ON <object> TO <grantee> — access control is SIMULATED (this teaching engine
    // has no auth layer), but a WELL-FORMED statement succeeds and a malformed one errors, so the
    // honesty gate credits a real GRANT and rejects a bare `grant` keyword. (BUG-008)
    function _execGrant(sql) {
        var m = sql.match(/^GRANT\s+(.+?)\s+ON\s+([\w.*]+)\s+TO\s+(.+?);?$/i);
        if (!m) return _renderError('Malformed GRANT statement (expected: GRANT <priv> ON <object> TO <grantee>)');
        return _renderOk('privilege(s) ' + m[1].trim() + ' granted on ' + m[2].trim() + ' to ' + m[3].trim() + ' (simulated)');
    }

    // REVOKE <priv[,priv]> ON <object> FROM <grantee> — simulated, same well-formed/malformed contract.
    function _execRevoke(sql) {
        var m = sql.match(/^REVOKE\s+(.+?)\s+ON\s+([\w.*]+)\s+FROM\s+(.+?);?$/i);
        if (!m) return _renderError('Malformed REVOKE statement (expected: REVOKE <priv> ON <object> FROM <grantee>)');
        return _renderOk('privilege(s) ' + m[1].trim() + ' revoked on ' + m[2].trim() + ' from ' + m[3].trim() + ' (simulated)');
    }

    function _execCreate(sql) {
        // CREATE TABLE name (col definitions)
        var m = sql.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\((.+)\)/is);
        if (!m) return _renderError('Malformed CREATE TABLE statement');

        var tn = m[1].toLowerCase();
        if (DB[tn]) return _renderError('table ' + tn + ' already exists');

        // Extract column names from definitions
        var defs = m[2].split(',').map(function(d) { return d.trim(); });
        var cols = defs
            .filter(function(d) { return !/^(PRIMARY|FOREIGN|UNIQUE|CHECK|INDEX)\b/i.test(d); })
            .map(function(d) { return d.match(/^(\w+)/)[1]; });

        // Save schema for .schema
        SCHEMA_SQL[tn] = sql.replace(/;?\s*$/, '');

        DB[tn] = { columns: cols, rows: [] };
        return _renderOk("Table '" + m[1] + "' created");
    }

    function _execDrop(sql) {
        var m = sql.match(/DROP\s+TABLE\s+(?:IF\s+EXISTS\s+)?(\w+)/i);
        if (!m) return _renderError('Malformed DROP TABLE statement');
        var tn = m[1].toLowerCase();
        if (!DB[tn]) return _renderError('no such table: ' + m[1]);
        delete DB[tn];
        delete SCHEMA_SQL[tn];
        return _renderOk("Table '" + m[1] + "' dropped");
    }

    function _execAlter(sql) {
        // ALTER TABLE name ADD COLUMN colname type
        var addMatch = sql.match(/ALTER\s+TABLE\s+(\w+)\s+ADD\s+(?:COLUMN\s+)?(\w+)(?:\s+\w+)?/i);
        if (addMatch) {
            var tn = addMatch[1].toLowerCase();
            var tbl = DB[tn];
            if (!tbl) return _renderError('no such table: ' + addMatch[1]);
            tbl.columns.push(addMatch[2]);
            tbl.rows = tbl.rows.map(function(r) { r.push(null); return r; });
            return _renderOk("Column '" + addMatch[2] + "' added to " + addMatch[1]);
        }
        // ALTER TABLE name RENAME TO new_name
        var renameMatch = sql.match(/ALTER\s+TABLE\s+(\w+)\s+RENAME\s+TO\s+(\w+)/i);
        if (renameMatch) {
            var oldName = renameMatch[1].toLowerCase();
            var newName = renameMatch[2].toLowerCase();
            if (!DB[oldName]) return _renderError('no such table: ' + renameMatch[1]);
            DB[newName] = DB[oldName];
            delete DB[oldName];
            if (SCHEMA_SQL[oldName]) { SCHEMA_SQL[newName] = SCHEMA_SQL[oldName]; delete SCHEMA_SQL[oldName]; }
            return _renderOk("Table renamed to '" + renameMatch[2] + "'");
        }
        return _renderError('Unsupported ALTER TABLE operation');
    }

    // =========================================================================
    // TRANSACTION STUBS — visual feedback only
    // =========================================================================

    function _execTransaction(sql) {
        var norm = sql.trim().toUpperCase();
        if (/^BEGIN/.test(norm))    return _renderInfo('Transaction started. Changes are staged (session-only).');
        if (/^COMMIT/.test(norm))   return _renderInfo('Transaction committed.');
        if (/^ROLLBACK/.test(norm)) return _renderInfo('Transaction rolled back. No changes applied.');
        return _renderError('Unknown transaction command');
    }

    // =========================================================================
    // DOT-COMMAND HANDLERS (.tables, .schema, .help)
    // =========================================================================

    function _execDotCommand(cmdLine) {
        var cmd = cmdLine.trim();

        if (/^\.help$/i.test(cmd)) {
            return _renderLines([
                '.help             -- Show this message',
                '.tables           -- List names of tables',
                '.schema [TABLE]   -- Show CREATE TABLE for TABLE (or all tables)',
                '.quit             -- Exit sqlite3 (not applicable in browser mode)',
                '',
                'SQL commands also work directly. End statements with a semicolon.',
                'Type SELECT, INSERT, UPDATE, DELETE, CREATE, DROP, ALTER followed by your query.'
            ]);
        }

        if (/^\.tables$/i.test(cmd)) {
            return _renderLines(Object.keys(DB).join('  ').split('\n'));
        }

        if (/^\.schema\s*$/i.test(cmd)) {
            var all = Object.keys(SCHEMA_SQL).map(function(k) { return SCHEMA_SQL[k]; });
            return _renderLines(all.join('\n\n').split('\n'));
        }

        var schemaMatch = cmd.match(/^\.schema\s+(\w+)/i);
        if (schemaMatch) {
            var tn = schemaMatch[1].toLowerCase();
            var s  = SCHEMA_SQL[tn] || SCHEMA_SQL[schemaMatch[1]];
            if (!s) return _renderError('no such table: ' + schemaMatch[1]);
            return _renderLines(s.split('\n'));
        }

        if (/^\.(quit|exit)$/i.test(cmd)) {
            return _renderInfo('SQLite mode is always active in this environment.');
        }

        return _renderError('Unknown dot-command: ' + cmd + '  (type .help for available commands)');
    }

    // =========================================================================
    // sqlite3 COMMAND BANNER
    // =========================================================================

    function _execSqlite3Banner(args) {
        return _renderLines([
            'SQLite version 3.39.4  2022-09-29 15:55:41',
            'Enter ".help" for usage hints.',
            'Connected to hexcorp.db (in-memory, session-scoped)',
            '',
            'Available tables: ' + Object.keys(DB).join(', '),
            'Type SQL statements or dot-commands. SQL works directly from the prompt.'
        ]);
    }

    // =========================================================================
    // SHOW TABLES / DESCRIBE (MySQL compat helpers)
    // =========================================================================

    function _execShow(sql) {
        if (/^show\s+tables/i.test(sql)) {
            return _renderSingleCol('Tables_in_hexcorp', Object.keys(DB));
        }
        return _renderError('Unsupported SHOW command. Use .tables or SELECT name FROM sqlite_master.');
    }

    function _execDescribe(sql) {
        var m = sql.match(/^describe\s+(\w+)/i);
        if (!m) return _renderError('Malformed DESCRIBE statement');
        var tn = m[1].toLowerCase();
        var tbl = DB[tn] || DB[m[1]];
        if (!tbl) return _renderError('no such table: ' + m[1]);
        var headers = ['Field', 'Type', 'Null', 'Key', 'Default'];
        var rows = tbl.columns.map(function(c, i) {
            var isPK  = i === 0;
            var isInt = /id|_id|count|active/.test(c);
            return [c, isInt ? 'INTEGER' : 'TEXT', isPK ? 'NO' : 'YES', isPK ? 'PRI' : '', isPK ? '' : 'NULL'];
        });
        return _renderTable(headers, rows);
    }

    // =========================================================================
    // UTILITY HELPERS
    // =========================================================================

    function _parseValueList(str) {
        // Split comma-separated values respecting quoted strings. A quoted value's content is
        // accumulated into `current` (quote chars stripped) and pushed at the next comma or end —
        // NOT on the closing quote. The old code pushed on quote-close AND again on the following
        // comma, injecting a spurious empty value between every quoted item (so `'a','b',1` parsed
        // as 5 values, not 3) — a false "Column count mismatch" that broke every INSERT of quoted
        // strings. `sawValue` distinguishes a real (possibly empty-quoted) segment from no segment.
        var vals = [];
        var current = '';
        var inQuote = false;
        var quoteChar = '';
        var sawValue = false;
        for (var i = 0; i < str.length; i++) {
            var ch = str[i];
            if (!inQuote && (ch === "'" || ch === '"')) { inQuote = true; quoteChar = ch; sawValue = true; continue; }
            if (inQuote && ch === quoteChar) {
                if (str[i + 1] === quoteChar) { current += quoteChar; i++; continue; }   // SQL '' escape -> literal quote
                inQuote = false; continue;
            }
            if (!inQuote && ch === ',') { vals.push(current.trim()); current = ''; sawValue = false; continue; }
            current += ch; sawValue = true;
        }
        if (sawValue) vals.push(current.trim());   // don't emit a spurious value after a trailing comma
        return vals.map(function(v) {
            v = v.trim();
            if (!isNaN(v) && v !== '') return Number(v);
            if (v.toLowerCase() === 'null') return null;
            return v;
        });
    }

    function _pad(n) { return n < 10 ? '0' + n : String(n); }

    // =========================================================================
    // RENDERING — HTML output for LinuxTerminal.print()
    // All output is wrapped in a <div class="sql-result"> container.
    // Colors: #4ade80 for structure, #e2e8f0 for data, #f59e0b for metadata.
    // =========================================================================

    var C_BORDER = '#4ade80';
    var C_DATA   = '#e2e8f0';
    var C_META   = '#f59e0b';
    var C_ERR    = '#f87171';
    var C_INFO   = '#94a3b8';

    function _wrap(inner) {
        return '<div class="sql-result" style="font-family:\'JetBrains Mono\',\'Courier New\',monospace;font-size:0.82rem;line-height:1.5;white-space:pre;">' + inner + '</div>';
    }

    function _span(text, color) {
        return '<span style="color:' + color + '">' + _esc(text) + '</span>';
    }

    function _esc(s) {
        return String(s === null || s === undefined ? 'NULL' : s)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    function _renderTable(headers, rows) {
        if (rows.length === 0) {
            return {
                type: 'table', columns: headers, rows: rows,
                html: _wrap(
                    _span('(0 rows returned)', C_META)
                )
            };
        }

        // Compute column widths
        var widths = headers.map(function(h, i) {
            var maxDataLen = rows.reduce(function(mx, r) {
                return Math.max(mx, String(r[i] === null || r[i] === undefined ? 'NULL' : r[i]).length);
            }, 0);
            return Math.max(String(h).length, maxDataLen);
        });

        function buildSep() {
            return '+' + widths.map(function(w) { return '-' + _repeat('-', w) + '-'; }).join('+') + '+';
        }

        function buildRow(cells, isHeader) {
            var color = isHeader ? C_BORDER : C_DATA;
            var sep = _span('|', C_BORDER);
            var cols = cells.map(function(cell, i) {
                var s = String(cell === null || cell === undefined ? 'NULL' : cell);
                // Pad to column width
                while (s.length < widths[i]) s += ' ';
                return _span(' ' + s + ' ', color);
            });
            return sep + cols.join(sep) + sep;
        }

        var sep = _span(buildSep(), C_BORDER);
        var lines = [sep, buildRow(headers, true), sep];
        rows.forEach(function(r) { lines.push(buildRow(r, false)); });
        lines.push(sep);

        var rowLabel = rows.length === 1 ? '1 row returned' : rows.length + ' rows returned';
        lines.push(_span(rowLabel, C_META));

        return { type: 'table', columns: headers, rows: rows, html: _wrap(lines.join('\n')) };
    }

    function _renderScalar(label, value) {
        var headers = [label];
        var rows    = [[value]];
        return _renderTable(headers, rows);
    }

    function _renderSingleCol(colName, values) {
        return _renderTable([colName], values.map(function(v) { return [v]; }));
    }

    function _renderLines(lines) {
        var html = lines.map(function(l) { return _span(l, C_INFO); }).join('\n');
        return { type: 'lines', html: _wrap(html) };
    }

    function _renderOk(msg) {
        return { type: 'ok', html: _wrap(_span('-- ' + msg, C_META)) };
    }

    function _renderInfo(msg) {
        return { type: 'info', html: _wrap(_span(msg, C_INFO)) };
    }

    function _renderError(msg) {
        return { type: 'error', html: _wrap(_span('Error: ' + msg, C_ERR)) };
    }

    function _repeat(ch, n) {
        var s = '';
        for (var i = 0; i < n; i++) s += ch;
        return s;
    }

    // =========================================================================
    // MAIN DISPATCH — routes a command line to the right handler
    // Returns a result object { type, html, rows?, columns? }
    // or null if this is not a SQL command.
    // =========================================================================

    function _dispatch(cmdLine) {
        var raw  = cmdLine.trim();
        var norm = _normalise(raw);
        var lo   = norm.toLowerCase();

        // sqlite3 banner
        if (/^sqlite3\b/i.test(norm)) {
            return _execSqlite3Banner(norm.split(/\s+/).slice(1));
        }

        // Dot commands
        if (/^\./i.test(norm)) {
            return _execDotCommand(norm);
        }

        // SHOW TABLES (MySQL compat)
        if (/^show\s+tables/i.test(lo)) return _execShow(norm);

        // DESCRIBE table
        if (/^describe\s+\w+/i.test(lo)) return _execDescribe(norm);

        // Transaction stubs
        if (/^(begin|commit|rollback)/i.test(lo)) return _execTransaction(norm);

        // DDL
        if (/^create\s+table/i.test(lo)) return _execCreate(norm);
        if (/^drop\s+table/i.test(lo))   return _execDrop(norm);
        if (/^alter\s+table/i.test(lo))  return _execAlter(norm);

        // DML
        if (/^insert\s+into/i.test(lo))  return _execInsert(norm);
        if (/^update\s+\w+\s+set/i.test(lo)) return _execUpdate(norm);
        if (/^delete\s+from/i.test(lo))  return _execDelete(norm);

        // DCL (access control) — simulated: a well-formed statement succeeds, a malformed one errors,
        // so the honesty gate can tell a real GRANT/REVOKE from a bare keyword.
        if (/^grant\s/i.test(lo))  return _execGrant(norm);
        if (/^revoke\s/i.test(lo)) return _execRevoke(norm);

        // SELECT (including CTE WITH ... AS)
        if (/^(select|with)\s/i.test(lo)) return _execSelect(norm);

        // EXPLAIN — just echo back the normalised query
        if (/^explain\s/i.test(lo)) {
            return _renderLines(['QUERY PLAN', '-----------', norm.replace(/^explain\s+/i, '')]);
        }

        // PRAGMA
        if (/^pragma\s/i.test(lo)) {
            return _renderInfo('PRAGMA: ' + norm);
        }

        return null; // Not handled by SQLEngine
    }

    // =========================================================================
    // PUBLIC API
    // =========================================================================

    /**
     * SQLEngine.wrap(terminalConfig)
     *
     * Takes a LinuxTerminal config object, injects SQL interception into it,
     * and returns the modified config. The caller passes the result directly
     * to LinuxTerminal.init().
     *
     * The returned config has:
     *   suppressUnknown: true  -- prevents "command not found" for SQL input
     *   onCommand: <wrapped>   -- SQL interceptor that chains the original handler
     *
     * Example:
     *   LinuxTerminal.init('SQL-01', '#terminal', SQLEngine.wrap({
     *       user: 'analyst',
     *       hostname: 'sql-lab',
     *       startDir: '/home/analyst',
     *       height: '100%',
     *       onCommand: function(cmdLine, output, cmd, args) {
     *           // task completion checks
     *       }
     *   }));
     *
     * @param   {Object} cfg  — LinuxTerminal config object
     * @returns {Object}        Modified config, safe to pass to LinuxTerminal.init()
     */
    function wrap(cfg) {
        var originalOnCommand = cfg.onCommand || null;

        cfg.suppressUnknown = true;

        cfg.onCommand = function sqlEngineInterceptor(cmdLine, output, cmd, args) {
            // Check if this looks like a SQL command
            if (_isSQLCommand(cmdLine)) {
                var result = _dispatch(cmdLine.trim());
                if (result) {
                    // Inject the SQL output into the terminal
                    LinuxTerminal.print(result.html);
                    // Fire the original module callback so task-tracking still works.
                    // We do NOT return its value — we always return true here to suppress
                    // any "command not found" or default output from LinuxTerminal.
                    if (originalOnCommand) {
                        originalOnCommand(cmdLine, result.html, cmd, args);
                    }
                    return true; // suppress LinuxTerminal default output
                }
            }

            // Not a SQL command — delegate to original handler unchanged
            if (originalOnCommand) {
                return originalOnCommand(cmdLine, output, cmd, args);
            }
            return false;
        };

        return cfg;
    }

    /**
     * SQLEngine.exec(sql)
     *
     * Execute a SQL statement against the in-memory database directly.
     * Returns a result object { type, html, rows?, columns? }.
     * Useful for programmatic access (e.g. pre-populating output in labs).
     *
     * @param   {string} sql
     * @returns {Object} result
     */
    function exec(sql) {
        return _dispatch(_normalise(sql));
    }

    /**
     * SQLEngine.reset()
     *
     * Restore the database to its initial seeded state.
     * Call this if a module wants a clean slate on load.
     */
    function reset() {
        _seedDatabase();
    }

    /**
     * SQLEngine.getDB()
     *
     * Returns a reference to the live DB object (useful for testing/inspection).
     */
    function getDB() {
        return DB;
    }

    // Expose public API
    window.SQLEngine = {
        wrap:  wrap,
        exec:  exec,
        reset: reset,
        getDB: getDB
    };

})();
