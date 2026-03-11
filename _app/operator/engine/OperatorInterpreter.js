/* ================================================================
   OperatorInterpreter.js — Python Interpreter for Operator Missions
   ================================================================
   Extracted from python-04.mission.html. Three-stage pipeline:
     1. tokenize(code)    -> flat token array
     2. parse(tokens)     -> AST
     3. interpret(ast, agentBridge, printFn) -> command count

   Exposes window.OperatorInterpreter with tokenize, parse,
   interpret, run, cancel, reset.
   ================================================================ */

(function() {
    'use strict';

    var CANCEL_FLAG = false;

    /* ================================================================
       SECTION 1: TOKENIZER / LEXER
       Input:  raw Python source string
       Output: flat token array
       Token types: KEYWORD, OPERATOR, DELIMITER, NUMBER, STRING,
                    IDENTIFIER, NEWLINE, INDENT, DEDENT, EOF
       ================================================================ */

    var KEYWORDS = [
        'if', 'elif', 'else', 'for', 'while', 'in', 'def', 'return',
        'True', 'False', 'None', 'and', 'or', 'not', 'break', 'continue', 'pass'
    ];

    // Sorted longest-first to prefer longest match
    var OPERATORS = [
        '**', '//', '==', '!=', '<=', '>=', '+=', '-=', '*=', '//=', '/=', '%=',
        '<', '>', '+', '-', '*', '/', '%', '='
    ];

    var DELIMITERS = ['(', ')', ':', '[', ']', ',', '.'];

    function tokenize(source) {
        var tokens = [];
        var i = 0;
        var line = 1;
        var indentStack = [0];
        var atLineStart = true;

        while (i < source.length) {

            // -- Handle indentation at start of each logical line --
            if (atLineStart) {
                var indent = 0;
                while (i < source.length && (source[i] === ' ' || source[i] === '\t')) {
                    indent += source[i] === '\t' ? 4 : 1;
                    i++;
                }
                // Skip blank lines and comment-only lines entirely
                if (i < source.length && (source[i] === '\n' || source[i] === '#')) {
                    if (source[i] === '#') {
                        while (i < source.length && source[i] !== '\n') i++;
                    }
                    if (i < source.length && source[i] === '\n') { i++; line++; }
                    continue;
                }
                if (i >= source.length) break;

                var currentIndent = indentStack[indentStack.length - 1];
                if (indent > currentIndent) {
                    indentStack.push(indent);
                    tokens.push({ type: 'INDENT', line: line });
                } else {
                    while (indent < indentStack[indentStack.length - 1]) {
                        indentStack.pop();
                        tokens.push({ type: 'DEDENT', line: line });
                    }
                }
                atLineStart = false;
            }

            var ch = source[i];

            // -- Whitespace (non-newline) --
            if (ch === ' ' || ch === '\t') { i++; continue; }

            // -- Comment --
            if (ch === '#') {
                while (i < source.length && source[i] !== '\n') i++;
                continue;
            }

            // -- Newline --
            if (ch === '\n') {
                if (tokens.length > 0) {
                    var lastType = tokens[tokens.length - 1].type;
                    if (lastType !== 'NEWLINE' && lastType !== 'INDENT' && lastType !== 'DEDENT') {
                        tokens.push({ type: 'NEWLINE', line: line });
                    }
                }
                i++; line++; atLineStart = true;
                continue;
            }

            // -- String literal (single or double quote) --
            if (ch === '"' || ch === "'") {
                var quote = source[i++];
                var str = '';
                while (i < source.length && source[i] !== quote) {
                    if (source[i] === '\\' && i + 1 < source.length) {
                        i++;
                        var esc = source[i];
                        if      (esc === 'n')     str += '\n';
                        else if (esc === 't')     str += '\t';
                        else if (esc === '\\')    str += '\\';
                        else if (esc === quote)   str += quote;
                        else                      str += '\\' + esc;
                        i++;
                    } else {
                        str += source[i++];
                    }
                }
                if (i < source.length) i++; // consume closing quote
                tokens.push({ type: 'STRING', value: str, line: line });
                continue;
            }

            // -- Number literal --
            if (ch >= '0' && ch <= '9') {
                var num = '';
                while (i < source.length && ((source[i] >= '0' && source[i] <= '9') || source[i] === '.')) {
                    num += source[i++];
                }
                tokens.push({ type: 'NUMBER', value: parseFloat(num), line: line });
                continue;
            }

            // -- Identifier / Keyword --
            if ((ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_') {
                var ident = '';
                while (i < source.length &&
                       ((source[i] >= 'a' && source[i] <= 'z') ||
                        (source[i] >= 'A' && source[i] <= 'Z') ||
                        (source[i] >= '0' && source[i] <= '9') ||
                        source[i] === '_')) {
                    ident += source[i++];
                }
                if (KEYWORDS.indexOf(ident) !== -1) {
                    tokens.push({ type: 'KEYWORD', value: ident, line: line });
                } else {
                    tokens.push({ type: 'IDENTIFIER', value: ident, line: line });
                }
                continue;
            }

            // -- Operators (longest match first) --
            var matched = false;
            for (var oi = 0; oi < OPERATORS.length; oi++) {
                var op = OPERATORS[oi];
                if (source.substr(i, op.length) === op) {
                    tokens.push({ type: 'OPERATOR', value: op, line: line });
                    i += op.length;
                    matched = true;
                    break;
                }
            }
            if (matched) continue;

            // -- Delimiters --
            if (DELIMITERS.indexOf(ch) !== -1) {
                tokens.push({ type: 'DELIMITER', value: ch, line: line });
                i++;
                continue;
            }

            // Unknown character -- skip silently
            i++;
        }

        // Emit remaining DEDENT tokens to close any open blocks
        while (indentStack.length > 1) {
            indentStack.pop();
            tokens.push({ type: 'DEDENT', line: line });
        }
        tokens.push({ type: 'EOF', line: line });
        return tokens;
    }


    /* ================================================================
       SECTION 2: PARSER
       Recursive-descent parser. Produces an AST from the token array.
       AST node types: Literal, List, Name, Attr, Index, Call, BinOp,
       UnaryOp, Assign, AugAssign, If, For, While, FuncDef, Return,
       Break, Continue, Pass, Expr
       Operator precedence (low to high):
         or < and < comparison < add/sub < mul/div/mod/power < unary < postfix
       ================================================================ */

    function parse(tokens) {
        var pos = 0;

        function current() { return tokens[pos] || { type: 'EOF', line: 0 }; }
        function advance()  { return tokens[pos++]; }

        function expect(type, value) {
            var t = current();
            if (t.type !== type || (value !== undefined && t.value !== value)) {
                throw new SyntaxError(
                    'Line ' + t.line + ': expected ' +
                    (value !== undefined ? value : type) +
                    ', got ' + (t.value !== undefined ? t.value : t.type)
                );
            }
            return advance();
        }

        function match(type, value) {
            var t = current();
            if (t.type === type && (value === undefined || t.value === value)) {
                advance();
                return true;
            }
            return false;
        }

        function skipNewlines() {
            while (current().type === 'NEWLINE') advance();
        }

        /* -- Expression Parsing -- */

        // Atom: literal, list, paren-expr, name, unary not/minus
        function parseAtom() {
            var t = current();

            // List literal [a, b, c]
            if (t.type === 'DELIMITER' && t.value === '[') {
                advance();
                var elems = [];
                while (!(current().type === 'DELIMITER' && current().value === ']') && current().type !== 'EOF') {
                    elems.push(parseExpr());
                    if (current().type === 'DELIMITER' && current().value === ',') advance();
                }
                expect('DELIMITER', ']');
                return { type: 'List', elems: elems, line: t.line };
            }

            // Parenthesized expression
            if (t.type === 'DELIMITER' && t.value === '(') {
                advance();
                var expr = parseExpr();
                expect('DELIMITER', ')');
                return expr;
            }

            if (t.type === 'NUMBER')  { advance(); return { type: 'Literal', value: t.value, line: t.line }; }
            if (t.type === 'STRING')  { advance(); return { type: 'Literal', value: t.value, line: t.line }; }
            if (t.type === 'KEYWORD' && t.value === 'True')  { advance(); return { type: 'Literal', value: true,  line: t.line }; }
            if (t.type === 'KEYWORD' && t.value === 'False') { advance(); return { type: 'Literal', value: false, line: t.line }; }
            if (t.type === 'KEYWORD' && t.value === 'None')  { advance(); return { type: 'Literal', value: null,  line: t.line }; }

            // Unary not
            if (t.type === 'KEYWORD' && t.value === 'not') {
                advance();
                return { type: 'UnaryOp', op: 'not', operand: parseComparison(), line: t.line };
            }

            // Unary minus
            if (t.type === 'OPERATOR' && t.value === '-') {
                advance();
                return { type: 'UnaryOp', op: '-', operand: parseAtom(), line: t.line };
            }

            if (t.type === 'IDENTIFIER') {
                advance();
                return { type: 'Name', name: t.value, line: t.line };
            }

            throw new SyntaxError(
                'Line ' + t.line + ': unexpected token ' +
                (t.value !== undefined ? "'" + t.value + "'" : t.type)
            );
        }

        // Postfix: call, attribute access, index
        function parsePostfix(node) {
            while (true) {
                var t = current();

                // Function call: node(args...)
                if (t.type === 'DELIMITER' && t.value === '(') {
                    advance();
                    var args = [];
                    while (!(current().type === 'DELIMITER' && current().value === ')') && current().type !== 'EOF') {
                        args.push(parseExpr());
                        if (current().type === 'DELIMITER' && current().value === ',') advance();
                    }
                    expect('DELIMITER', ')');
                    node = { type: 'Call', func: node, args: args, line: t.line };
                }
                // Attribute access: node.attr
                else if (t.type === 'DELIMITER' && t.value === '.') {
                    advance();
                    var attr = expect('IDENTIFIER');
                    node = { type: 'Attr', obj: node, attr: attr.value, line: t.line };
                }
                // Index: node[expr]
                else if (t.type === 'DELIMITER' && t.value === '[') {
                    advance();
                    var index = parseExpr();
                    expect('DELIMITER', ']');
                    node = { type: 'Index', obj: node, index: index, line: t.line };
                }
                else break;
            }
            return node;
        }

        function parsePrimary() { return parsePostfix(parseAtom()); }

        // Power, multiplicative operators
        function parseMulDiv() {
            var left = parsePrimary();
            while (current().type === 'OPERATOR') {
                var v = current().value;
                if (v === '*' || v === '/' || v === '%' || v === '//' || v === '**') {
                    var op = advance();
                    left = { type: 'BinOp', op: op.value, left: left, right: parsePrimary(), line: op.line };
                } else break;
            }
            return left;
        }

        // Additive operators
        function parseAddSub() {
            var left = parseMulDiv();
            while (current().type === 'OPERATOR' && (current().value === '+' || current().value === '-')) {
                var op = advance();
                left = { type: 'BinOp', op: op.value, left: left, right: parseMulDiv(), line: op.line };
            }
            return left;
        }

        // Comparison operators and 'in' / 'not in'
        function parseComparison() {
            var left = parseAddSub();
            while (current().type === 'OPERATOR' && ['==', '!=', '<', '>', '<=', '>='].indexOf(current().value) !== -1) {
                var op = advance();
                left = { type: 'BinOp', op: op.value, left: left, right: parseAddSub(), line: op.line };
            }
            // 'not in' -- two keyword tokens
            if (current().type === 'KEYWORD' && current().value === 'not') {
                var savedPos = pos;
                advance();
                if (current().type === 'KEYWORD' && current().value === 'in') {
                    advance();
                    left = { type: 'BinOp', op: 'not in', left: left, right: parseAddSub(), line: left.line };
                } else {
                    pos = savedPos; // backtrack if not 'not in'
                }
            }
            // 'in' operator
            if (current().type === 'KEYWORD' && current().value === 'in') {
                advance();
                left = { type: 'BinOp', op: 'in', left: left, right: parseAddSub(), line: left.line };
            }
            return left;
        }

        // Logical 'and'
        function parseAnd() {
            var left = parseComparison();
            while (current().type === 'KEYWORD' && current().value === 'and') {
                advance();
                left = { type: 'BinOp', op: 'and', left: left, right: parseComparison(), line: left.line };
            }
            return left;
        }

        // Logical 'or'
        function parseOr() {
            var left = parseAnd();
            while (current().type === 'KEYWORD' && current().value === 'or') {
                advance();
                left = { type: 'BinOp', op: 'or', left: left, right: parseAnd(), line: left.line };
            }
            return left;
        }

        function parseExpr() { return parseOr(); }

        /* -- Statement Parsing -- */

        // Parse an indented block of statements
        function parseBlock() {
            expect('INDENT');
            var stmts = [];
            while (current().type !== 'DEDENT' && current().type !== 'EOF') {
                skipNewlines();
                if (current().type === 'DEDENT' || current().type === 'EOF') break;
                stmts.push(parseStatement());
                skipNewlines();
            }
            if (current().type === 'DEDENT') advance();
            return stmts;
        }

        function parseStatement() {
            var t = current();

            // -- if / elif / else --
            if (t.type === 'KEYWORD' && t.value === 'if') {
                advance();
                var cond = parseExpr();
                expect('DELIMITER', ':');
                skipNewlines();
                var body = parseBlock();
                var elifs = [];
                var elseBody = null;
                while (current().type === 'KEYWORD' && current().value === 'elif') {
                    advance();
                    var elifCond = parseExpr();
                    expect('DELIMITER', ':');
                    skipNewlines();
                    elifs.push({ cond: elifCond, body: parseBlock() });
                }
                if (current().type === 'KEYWORD' && current().value === 'else') {
                    advance();
                    expect('DELIMITER', ':');
                    skipNewlines();
                    elseBody = parseBlock();
                }
                return { type: 'If', cond: cond, body: body, elifs: elifs, elseBody: elseBody, line: t.line };
            }

            // -- for loop --
            if (t.type === 'KEYWORD' && t.value === 'for') {
                advance();
                var varName = expect('IDENTIFIER').value;
                expect('KEYWORD', 'in');
                var iter = parseExpr();
                expect('DELIMITER', ':');
                skipNewlines();
                var forBody = parseBlock();
                return { type: 'For', varName: varName, iter: iter, body: forBody, line: t.line };
            }

            // -- while loop --
            if (t.type === 'KEYWORD' && t.value === 'while') {
                advance();
                var whileCond = parseExpr();
                expect('DELIMITER', ':');
                skipNewlines();
                var whileBody = parseBlock();
                return { type: 'While', cond: whileCond, body: whileBody, line: t.line };
            }

            // -- function definition --
            if (t.type === 'KEYWORD' && t.value === 'def') {
                advance();
                var funcName = expect('IDENTIFIER').value;
                expect('DELIMITER', '(');
                var params = [];
                while (!(current().type === 'DELIMITER' && current().value === ')') && current().type !== 'EOF') {
                    params.push(expect('IDENTIFIER').value);
                    if (current().type === 'DELIMITER' && current().value === ',') advance();
                }
                expect('DELIMITER', ')');
                expect('DELIMITER', ':');
                skipNewlines();
                var funcBody = parseBlock();
                return { type: 'FuncDef', name: funcName, params: params, body: funcBody, line: t.line };
            }

            // -- return --
            if (t.type === 'KEYWORD' && t.value === 'return') {
                advance();
                var retVal = null;
                if (current().type !== 'NEWLINE' && current().type !== 'EOF' && current().type !== 'DEDENT') {
                    retVal = parseExpr();
                }
                return { type: 'Return', value: retVal, line: t.line };
            }

            // -- break / continue / pass --
            if (t.type === 'KEYWORD' && (t.value === 'break' || t.value === 'continue' || t.value === 'pass')) {
                advance();
                var capName = t.value.charAt(0).toUpperCase() + t.value.slice(1);
                return { type: capName, line: t.line };
            }

            // -- expression statement or assignment --
            var expr = parseExpr();

            // Simple assignment: target = value
            if (current().type === 'OPERATOR' && current().value === '=') {
                advance();
                var val = parseExpr();
                return { type: 'Assign', target: expr, value: val, line: t.line };
            }

            // Augmented assignment: target += value, etc.
            if (current().type === 'OPERATOR' &&
                ['+=', '-=', '*=', '/=', '//=', '%='].indexOf(current().value) !== -1) {
                var augOp = advance().value;
                var augVal = parseExpr();
                // Strip trailing '=' to get the base operator (e.g. '+=' -> '+')
                return { type: 'AugAssign', target: expr, op: augOp.slice(0, -1), value: augVal, line: t.line };
            }

            return { type: 'Expr', expr: expr, line: t.line };
        }

        // -- Top-level program --
        function parseProgram() {
            var stmts = [];
            skipNewlines();
            while (current().type !== 'EOF') {
                stmts.push(parseStatement());
                skipNewlines();
            }
            return { type: 'Program', body: stmts };
        }

        return parseProgram();
    }


    /* ================================================================
       SECTION 3: INTERPRETER (async)
       Tree-walk interpreter. Each node type maps to eval/exec logic.
       Async to allow await on agent bridge methods.
       Uses signal objects (BreakSignal, ContinueSignal, ReturnSignal)
       to implement control flow across call stack.
       ================================================================ */

    // Signal objects used for non-local control flow
    function StopExecution()       { this.message = 'StopExecution'; }
    function BreakSignal()         { this.message = 'break'; }
    function ContinueSignal()      { this.message = 'continue'; }
    function ReturnSignal(value)   { this.value = value; }

    async function interpret(ast, agentBridge, printFn) {
        var globalScope = {};
        var cmdCount = 0;

        // Default printFn to console.log if not provided
        var outputFn = printFn || function(text) { console.log(text); };

        /* -- Python-style string representation -- */
        function pyStr(v) {
            if (v === null)  return 'None';
            if (v === true)  return 'True';
            if (v === false) return 'False';
            if (Array.isArray(v)) {
                return '[' + v.map(function(e) {
                    return typeof e === 'string' ? "'" + e + "'" : pyStr(e);
                }).join(', ') + ']';
            }
            if (typeof v === 'object') {
                var pairs = [];
                for (var k in v) {
                    pairs.push("'" + k + "': " + (typeof v[k] === 'string' ? "'" + v[k] + "'" : pyStr(v[k])));
                }
                return '{' + pairs.join(', ') + '}';
            }
            return String(v);
        }

        /* -- Python-style truthiness -- */
        function isTruthy(v) {
            if (v === null || v === undefined || v === false || v === 0 || v === '') return false;
            if (Array.isArray(v) && v.length === 0) return false;
            if (typeof v === 'object' && v !== null && !Array.isArray(v) && Object.keys(v).length === 0) return false;
            return true;
        }

        /* -- Built-in functions available in script scope -- */
        var builtins = {
            print: function() {
                var args = Array.prototype.slice.call(arguments);
                var text = args.map(function(a) { return pyStr(a); }).join(' ');
                outputFn(text);
            },
            len: function(obj) {
                if (obj === null || obj === undefined) throw new Error('object of type NoneType has no len()');
                if (typeof obj === 'string' || Array.isArray(obj)) return obj.length;
                if (typeof obj === 'object') return Object.keys(obj).length;
                throw new Error("object of type '" + typeof obj + "' has no len()");
            },
            range: function(a, b, step) {
                var start = 0, end = a, s = 1;
                if (b !== undefined) { start = a; end = b; }
                if (step !== undefined) s = step;
                if (s === 0) throw new Error('range() arg 3 must not be zero');
                var result = [];
                if (s > 0) { for (var ri = start; ri < end; ri += s) result.push(ri); }
                else       { for (var ri = start; ri > end; ri += s) result.push(ri); }
                return result;
            },
            str:   function(v) { return pyStr(v); },
            int:   function(v) { return parseInt(v) || 0; },
            float: function(v) { return parseFloat(v) || 0.0; },
            bool:  function(v) { return isTruthy(v); },
            list:  function(v) {
                if (typeof v === 'string') return v.split('');
                if (Array.isArray(v)) return v.slice();
                return [];
            },
            type: function(v) {
                if (v === null)              return 'NoneType';
                if (typeof v === 'boolean')  return 'bool';
                if (typeof v === 'number')   return Number.isInteger(v) ? 'int' : 'float';
                if (typeof v === 'string')   return 'str';
                if (Array.isArray(v))        return 'list';
                if (typeof v === 'object')   return 'dict';
                return typeof v;
            },
            abs:   function(v) { return Math.abs(v); },
            max:   function() { return Math.max.apply(null, Array.prototype.slice.call(arguments)); },
            min:   function() { return Math.min.apply(null, Array.prototype.slice.call(arguments)); },
            round: function(v, n) { var f = Math.pow(10, n || 0); return Math.round(v * f) / f; }
        };

        /* -- Node Evaluator -- */
        async function evalNode(node, scope) {
            if (CANCEL_FLAG) throw new StopExecution();

            switch (node.type) {

                case 'Literal': return node.value;

                case 'List': {
                    var elems = [];
                    for (var i = 0; i < node.elems.length; i++) {
                        elems.push(await evalNode(node.elems[i], scope));
                    }
                    return elems;
                }

                case 'Name': {
                    if (node.name in scope)      return scope[node.name];
                    if (node.name in globalScope) return globalScope[node.name];
                    if (node.name in builtins)    return builtins[node.name];
                    if (node.name === 'agent')    return agentBridge;
                    throw new Error("name '" + node.name + "' is not defined");
                }

                case 'Attr': {
                    var obj = await evalNode(node.obj, scope);
                    if (obj === null || obj === undefined) {
                        throw new Error("cannot access attribute '" + node.attr + "' of " + pyStr(obj));
                    }
                    // Support property getters (e.g. agent.position, agent.discovered)
                    var desc = Object.getOwnPropertyDescriptor(obj, node.attr);
                    if (desc && desc.get) return desc.get.call(obj);
                    if (typeof obj[node.attr] === 'function') {
                        return { __boundMethod: true, obj: obj, method: node.attr };
                    }
                    return obj[node.attr];
                }

                case 'Index': {
                    var indexObj = await evalNode(node.obj, scope);
                    var idx = await evalNode(node.index, scope);
                    if (indexObj === null || indexObj === undefined) throw new Error('cannot index ' + pyStr(indexObj));
                    // Python-style negative indexing
                    if (typeof idx === 'number' && idx < 0 && Array.isArray(indexObj)) idx = indexObj.length + idx;
                    return indexObj[idx];
                }

                case 'Call': {
                    var func = await evalNode(node.func, scope);
                    var callArgs = [];
                    for (var ci = 0; ci < node.args.length; ci++) {
                        callArgs.push(await evalNode(node.args[ci], scope));
                    }

                    // Bound method on the agent bridge
                    if (func && func.__boundMethod) {
                        var result = func.obj[func.method].apply(func.obj, callArgs);
                        if (result instanceof Promise) result = await result;
                        cmdCount++;
                        return result;
                    }

                    // User-defined function: create local scope inheriting globals
                    if (func && func.__userFunc) {
                        var localScope = {};
                        for (var k in globalScope) localScope[k] = globalScope[k];
                        for (var j = 0; j < func.params.length; j++) {
                            localScope[func.params[j]] = callArgs[j] !== undefined ? callArgs[j] : null;
                        }
                        try {
                            await execBlock(func.body, localScope);
                        } catch (e) {
                            if (e instanceof ReturnSignal) return e.value;
                            throw e;
                        }
                        return null;
                    }

                    // Built-in function
                    if (typeof func === 'function') return func.apply(null, callArgs);

                    throw new Error("'" + pyStr(func) + "' object is not callable");
                }

                case 'BinOp': {
                    // Short-circuit evaluation for boolean operators
                    if (node.op === 'and') {
                        var lv = await evalNode(node.left, scope);
                        return isTruthy(lv) ? await evalNode(node.right, scope) : lv;
                    }
                    if (node.op === 'or') {
                        var lv2 = await evalNode(node.left, scope);
                        return isTruthy(lv2) ? lv2 : await evalNode(node.right, scope);
                    }

                    var left  = await evalNode(node.left,  scope);
                    var right = await evalNode(node.right, scope);

                    switch (node.op) {
                        case '+':
                            if (typeof left === 'string' || typeof right === 'string') return String(left) + String(right);
                            if (Array.isArray(left) && Array.isArray(right)) return left.concat(right);
                            return left + right;
                        case '-':  return left - right;
                        case '*':
                            if (typeof left === 'string' && typeof right === 'number') {
                                var s = ''; for (var si = 0; si < right; si++) s += left; return s;
                            }
                            if (Array.isArray(left) && typeof right === 'number') {
                                var a = []; for (var ai = 0; ai < right; ai++) a = a.concat(left); return a;
                            }
                            return left * right;
                        case '/':  return left / right;
                        case '//': return Math.floor(left / right);
                        case '%':  return left % right;
                        case '**': return Math.pow(left, right);
                        case '==': return left === right;
                        case '!=': return left !== right;
                        case '<':  return left < right;
                        case '>':  return left > right;
                        case '<=': return left <= right;
                        case '>=': return left >= right;
                        case 'in':
                            if (typeof right === 'string')  return right.indexOf(String(left)) !== -1;
                            if (Array.isArray(right))        return right.indexOf(left) !== -1;
                            if (typeof right === 'object' && right !== null) return left in right;
                            return false;
                        case 'not in':
                            if (typeof right === 'string')  return right.indexOf(String(left)) === -1;
                            if (Array.isArray(right))        return right.indexOf(left) === -1;
                            return true;
                    }
                    throw new Error('Unknown operator: ' + node.op);
                }

                case 'UnaryOp': {
                    var operand = await evalNode(node.operand, scope);
                    if (node.op === 'not') return !isTruthy(operand);
                    if (node.op === '-')   return -operand;
                    throw new Error('Unknown unary operator: ' + node.op);
                }
            }

            throw new Error('Unknown AST node type: ' + node.type);
        }

        /* -- Block Executor -- */
        async function execBlock(stmts, scope) {
            for (var i = 0; i < stmts.length; i++) {
                if (CANCEL_FLAG) throw new StopExecution();
                await execStmt(stmts[i], scope);
            }
        }

        /* -- Statement Executor -- */
        async function execStmt(node, scope) {
            if (CANCEL_FLAG) throw new StopExecution();

            switch (node.type) {

                case 'Expr': {
                    await evalNode(node.expr, scope);
                    return;
                }

                case 'Assign': {
                    var val = await evalNode(node.value, scope);
                    if (node.target.type === 'Name') {
                        // Write to local scope; if name exists in global, update global
                        if (scope !== globalScope && !(node.target.name in scope) && (node.target.name in globalScope)) {
                            globalScope[node.target.name] = val;
                        } else {
                            scope[node.target.name] = val;
                        }
                    } else if (node.target.type === 'Index') {
                        var assignObj = await evalNode(node.target.obj, scope);
                        var assignIdx = await evalNode(node.target.index, scope);
                        assignObj[assignIdx] = val;
                    } else if (node.target.type === 'Attr') {
                        var attrObj = await evalNode(node.target.obj, scope);
                        attrObj[node.target.attr] = val;
                    }
                    return;
                }

                case 'AugAssign': {
                    // Read current value
                    var curVal;
                    if (node.target.type === 'Name') {
                        curVal = (node.target.name in scope) ? scope[node.target.name] : globalScope[node.target.name];
                    } else {
                        curVal = await evalNode(node.target, scope);
                    }
                    var augRhs = await evalNode(node.value, scope);
                    var augResult;
                    switch (node.op) {
                        case '+':  augResult = curVal + augRhs; break;
                        case '-':  augResult = curVal - augRhs; break;
                        case '*':  augResult = curVal * augRhs; break;
                        case '/':  augResult = curVal / augRhs; break;
                        case '//': augResult = Math.floor(curVal / augRhs); break;
                        case '%':  augResult = curVal % augRhs; break;
                        default:   augResult = curVal + augRhs; break;
                    }
                    if (node.target.type === 'Name') {
                        if (node.target.name in scope) scope[node.target.name] = augResult;
                        else globalScope[node.target.name] = augResult;
                    }
                    return;
                }

                case 'If': {
                    var ifCond = await evalNode(node.cond, scope);
                    if (isTruthy(ifCond)) {
                        await execBlock(node.body, scope);
                        return;
                    }
                    for (var ei = 0; ei < node.elifs.length; ei++) {
                        var elifCond = await evalNode(node.elifs[ei].cond, scope);
                        if (isTruthy(elifCond)) {
                            await execBlock(node.elifs[ei].body, scope);
                            return;
                        }
                    }
                    if (node.elseBody) await execBlock(node.elseBody, scope);
                    return;
                }

                case 'For': {
                    var iter = await evalNode(node.iter, scope);
                    // Coerce objects to key arrays, strings to char arrays
                    if (!Array.isArray(iter)) {
                        if (typeof iter === 'string') {
                            iter = iter.split('');
                        } else if (typeof iter === 'object' && iter !== null) {
                            iter = Object.keys(iter);
                        } else {
                            throw new Error('Line ' + node.line + ": '" + pyStr(iter) + "' object is not iterable");
                        }
                    }
                    var forCount = 0;
                    for (var fi = 0; fi < iter.length; fi++) {
                        if (CANCEL_FLAG) throw new StopExecution();
                        if (++forCount > 1000) throw new Error('Loop limit exceeded (1000 iterations max)');
                        scope[node.varName] = iter[fi];
                        try {
                            await execBlock(node.body, scope);
                        } catch (e) {
                            if (e instanceof BreakSignal)    break;
                            if (e instanceof ContinueSignal) continue;
                            throw e;
                        }
                    }
                    return;
                }

                case 'While': {
                    var whileCount = 0;
                    while (isTruthy(await evalNode(node.cond, scope))) {
                        if (CANCEL_FLAG) throw new StopExecution();
                        if (++whileCount > 1000) throw new Error('Loop limit exceeded (1000 iterations max)');
                        try {
                            await execBlock(node.body, scope);
                        } catch (e) {
                            if (e instanceof BreakSignal)    break;
                            if (e instanceof ContinueSignal) continue;
                            throw e;
                        }
                    }
                    return;
                }

                case 'FuncDef': {
                    // Store function definition in global scope so it is callable anywhere
                    globalScope[node.name] = { __userFunc: true, params: node.params, body: node.body };
                    return;
                }

                case 'Return': {
                    var retV = node.value ? await evalNode(node.value, scope) : null;
                    throw new ReturnSignal(retV);
                }

                case 'Break':    throw new BreakSignal();
                case 'Continue': throw new ContinueSignal();
                case 'Pass':     return;
            }
        }

        // Run the top-level program body in global scope
        await execBlock(ast.body, globalScope);
        return cmdCount;
    }


    /* ================================================================
       PUBLIC API
       ================================================================ */

    window.OperatorInterpreter = {

        tokenize: tokenize,
        parse: parse,
        interpret: interpret,

        /**
         * Convenience wrapper: tokenize + parse + interpret in one call.
         * Returns { cmdCount, error } where error is null on success.
         */
        run: async function(code, agentBridge, printFn) {
            try {
                CANCEL_FLAG = false;
                var tokens = tokenize(code);
                var ast    = parse(tokens);
                var cmdCount = await interpret(ast, agentBridge, printFn);
                return { cmdCount: cmdCount, error: null };
            } catch (e) {
                if (e instanceof StopExecution) {
                    return { cmdCount: 0, error: null }; // cancelled, not an error
                }
                return { cmdCount: 0, error: e.message || String(e) };
            }
        },

        /** Set the cancel flag to stop execution mid-run. */
        cancel: function() {
            CANCEL_FLAG = true;
        },

        /** Clear the cancel flag before a new run. */
        reset: function() {
            CANCEL_FLAG = false;
        }
    };

})();
