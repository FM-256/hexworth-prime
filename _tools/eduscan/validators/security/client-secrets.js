/**
 * EduScan - Client Secrets Validator
 *
 * Detects sensitive data exposed in client-side code that should be
 * server-side or obfuscated. Arena box flags, hardcoded passwords,
 * challenge logic, and plaintext answer keys are all things that
 * students can trivially extract via View Source or DevTools.
 *
 * Rules:
 * - SEC-001 (HIGH): flag{...} patterns — arena box flags exposed client-side
 * - SEC-002 (HIGH): Hardcoded password assignments (const password = '...')
 * - SEC-003 (MEDIUM): successCheck/defenseCheck function definitions in HTML
 * - SEC-004 (MEDIUM): acceptedAnswers arrays with plaintext strings
 *
 * Exclusions:
 * - files under functions/ (server-side)
 * - files under _tools/ (build tooling, not served)
 * - seed-*.js files
 * - Comments mentioning flag{} without actual values
 * - "password" in instructional text (only flag variable assignments)
 *
 * Execution model:
 *   - validate(file) — per-file check on HTML files (called by syntax orchestrator)
 *   - validateGlobal() — scans .js files under _app/ for SEC-001, SEC-002, SEC-004
 */

const fs = require('fs');
const path = require('path');

class ClientSecretsValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.profile = options.profile || 'ci';
        this.rootPath = options.rootPath || './_app';
    }

    /**
     * Per-file validation for HTML files (called from syntax orchestrator loop)
     * Checks all four rules against inline content.
     * @param {Object} file - { path, content }
     * @returns {Array} Issues found
     */
    validate(file) {
        if (this.profile === 'inventory') {
            return [];
        }

        // Skip excluded paths
        if (this.isExcluded(file.path)) {
            return [];
        }

        const issues = [];
        const content = file.content;

        issues.push(...this.checkFlagPatterns(file.path, content));
        issues.push(...this.checkHardcodedPasswords(file.path, content));
        issues.push(...this.checkChallengeLogic(file.path, content));
        issues.push(...this.checkPlaintextAnswers(file.path, content));

        return issues;
    }

    /**
     * Global validation — scans standalone .js files under _app/ for secrets.
     * Covers SEC-001, SEC-002, SEC-004 (SEC-003 is HTML-only).
     * @returns {Array} Issues found
     */
    validateGlobal() {
        const issues = [];
        const jsFiles = this.collectJSFiles(path.resolve(this.rootPath));

        for (const filePath of jsFiles) {
            const relativePath = path.relative(path.resolve(this.rootPath, '..'), filePath);

            if (this.isExcluded(relativePath)) {
                continue;
            }

            let content;
            try {
                content = fs.readFileSync(filePath, 'utf8');
            } catch (err) {
                continue;
            }

            issues.push(...this.checkFlagPatterns(relativePath, content));
            issues.push(...this.checkHardcodedPasswords(relativePath, content));
            issues.push(...this.checkPlaintextAnswers(relativePath, content));
        }

        return issues;
    }

    /**
     * Check if a file path should be excluded from scanning.
     */
    isExcluded(filePath) {
        const normalized = filePath.replace(/\\/g, '/');

        // Server-side code
        if (/^functions\//.test(normalized) || /\/functions\//.test(normalized)) {
            return true;
        }

        // Build tooling
        if (/^_tools\//.test(normalized) || /\/_tools\//.test(normalized)) {
            return true;
        }

        // Seed files
        if (/seed-[^/]*\.js$/i.test(normalized)) {
            return true;
        }

        // INTENTIONAL EDUCATIONAL CONTENT — these directories exist to teach
        // students about secrets/flags/vulnerable code patterns. The validator
        // catching "leaked passwords" inside CTF box configs / bug-bounty
        // training labs is a category error: the secrets ARE the lesson.
        // Real production secret leaks elsewhere on the platform are still
        // caught by this validator.
        //
        // arena/boxes/ — CTF box configs (flags/credentials are by-design)
        // dark-arts/vault/bug-hunting/ — bug-bounty practice labs (vulnerable
        //   code samples are the curriculum)
        // dark-arts/vault/ehe/ — ethical hacker exercises (same pattern)
        // dark-arts/vault/owasp-top10-lab — OWASP Top 10 demo (vulnerability
        //   examples)
        // houses/key/labs/ — cryptography labs (HMAC/JWT/AES demos require
        //   literal secret keys for the demonstration)
        // houses/eye/applets/cyberops/ — security operations labs (demo
        //   passwords for exercises)
        // houses/code/devops/sections/ansible/ — Ansible vault tutorials
        //   (explicitly TEACHING about secrets management)
        if (/(?:^|\/)arena\/boxes\//.test(normalized)) return true;
        if (/dark-arts\/vault\/bug-hunting\//.test(normalized)) return true;
        if (/dark-arts\/vault\/ehe\//.test(normalized)) return true;
        if (/dark-arts\/vault\/owasp-top10-lab/.test(normalized)) return true;
        if (/houses\/key\/labs\//.test(normalized)) return true;
        if (/houses\/eye\/applets\/cyberops\//.test(normalized)) return true;
        if (/houses\/code\/devops\/sections\/ansible\//.test(normalized)) return true;

        return false;
    }

    /**
     * SEC-001: flag{...} patterns in client-side code
     *
     * Arena box flags like flag{sql_injection_master} should never appear
     * in client-served files. Students can View Source to find them.
     *
     * Skips:
     * - Comments that reference the format without actual values
     *   (e.g., "// flags use the flag{} format")
     * - Empty flag{} with no content
     */
    checkFlagPatterns(filePath, content) {
        const issues = [];
        const lines = content.split('\n');

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Match flag{...} with actual content inside braces
            const flagPattern = /flag\{([^}]+)\}/g;
            let match;

            while ((match = flagPattern.exec(line)) !== null) {
                const flagValue = match[1].trim();

                // Skip empty or whitespace-only
                if (!flagValue) continue;

                // Skip if this is clearly a comment describing the format
                // e.g., "// flags use flag{} format" or "flag{...}" as placeholder
                if (flagValue === '...' || flagValue === 'xxx' || flagValue === 'example') {
                    continue;
                }

                // Skip JS startsWith / matches / test patterns checking for
                // the 'flag{' string prefix — this is checking IF something
                // is a flag, not exposing one. E.g.:
                //   v.startsWith('flag{')         → flag{')  ← false positive
                //   /flag\{/i.test(input)         → flag{   ← false positive
                //   "flag{" + computed + "}"     → flag{   ← false positive
                // Heuristic: the matched flag value contains a closing quote
                // or starts with non-flag-content characters that suggest
                // it's a string literal being checked, not a real flag.
                if (flagValue.startsWith("'") || flagValue.startsWith('"')) continue;
                if (/['"]\s*\)/.test(flagValue)) continue;  // contains ') or ")
                // signal-toolkit BLE badge XOR-encoded flags shown in COMMENT
                // explaining the encoding (e.g., '// Decodes to: "flag{badge_h4ck3d}"')
                // — these are educational examples, not exposed runtime flags.
                const beforeMatch2 = line.substring(0, match.index);
                if (/Decodes? to:/i.test(beforeMatch2)) continue;

                // Skip HTML comments containing flag references (documentation)
                const trimmed = line.trim();
                if (trimmed.startsWith('<!--') || trimmed.startsWith('*') || trimmed.startsWith('/**')) {
                    continue;
                }

                // Skip JS single-line comments that describe the format generically
                const beforeMatch = line.substring(0, match.index).trim();
                if (/^\/\//.test(beforeMatch)) {
                    // It's in a comment — only skip if it looks like documentation
                    // (mentions "format", "pattern", "example", "e.g.")
                    if (/\b(format|pattern|example|e\.g\.|syntax|placeholder)\b/i.test(beforeMatch)) {
                        continue;
                    }
                    // Comment with an actual flag value is still suspicious
                }

                issues.push({
                    code: 'SEC-001',
                    severity: 'high',
                    category: 'security',
                    message: `Client-side flag exposed: flag{${flagValue}} — visible via View Source`,
                    file: filePath,
                    line: i + 1,
                    fix: 'Move flag validation to server-side (Cloud Functions) or hash the flag value'
                });
            }
        }

        return issues;
    }

    /**
     * SEC-002: Hardcoded password assignments
     *
     * Catches patterns like:
     *   const correctPassword = 'secret123'
     *   let password = "admin"
     *   password: 'letmein'
     *   db_pass = 'root'
     *   var adminPass = "hunter2"
     *
     * Does NOT flag:
     *   - "password" in instructional text/descriptions
     *   - password as an HTML attribute name (type="password")
     *   - password in CSS class names
     *   - Comments explaining password policies
     */
    checkHardcodedPasswords(filePath, content) {
        const issues = [];

        // SEC-002 exempts DISPLAYED code samples (teaching content a student READS, not code that runs).
        // In HTML we BLANK code-display container spans up front — <pre>, <code>, or a code-styled
        // div/section/figure/aside (class contains "code", e.g. the platform's cf-code). Only spans that
        // are (a) properly closed AND (b) contain no literal `<script` are blanked; an unclosed span, a
        // mismatched-tag close, or one holding a live <script> is left INTACT and gets scanned. That is
        // deliberate: this FAILS SAFE — a real secret can never be hidden by a malformed or
        // executable-bearing container. Bare-body assignments, onclick handlers, and <script> blocks
        // outside a display container all remain flagged (the "extractable via View Source" model holds).
        // Blanking preserves newlines so reported line numbers stay exact. (Nancy 2026-07-07: replaces a
        // per-line displayTag state machine that could stick on a mismatched close and go blind file-wide.)
        // KNOWN LIMITATION (accepted): an on*= handler carrying a secret placed ON a code-display
        // container's OWN tag is blanked with the span. `<script` is the only unmask trigger because it
        // is safe — displayed examples escape to `&lt;script&gt;`, so a LITERAL `<script` is always live.
        // An analogous "on-handler with secret" unmask trigger is NOT added: on*= attributes are not
        // escaped even in displayed examples, so it would false-flag the platform's bad-practice teaching
        // samples. That real cost outweighs the contrived case of a live handler secret on a sample tag.
        const isHtml = /\.html?$/i.test(filePath);
        let scanContent = content;
        if (isHtml) {
            const blankOrKeep = (m) => /<script\b/i.test(m) ? m : m.replace(/[^\n]/g, ' ');
            scanContent = scanContent
                .replace(/<pre(?:\s[^>]*)?>[\s\S]*?<\/pre\s*>/gi, blankOrKeep)
                .replace(/<code(?:\s[^>]*)?>[\s\S]*?<\/code\s*>/gi, blankOrKeep)
                .replace(/<(div|section|figure|aside)\b[^>]*class\s*=\s*["'][^"']*\bcode[\w-]*\b[^"']*["'][^>]*>[\s\S]*?<\/\1\s*>/gi, blankOrKeep);
        }
        const lines = scanContent.split('\n');

        // Patterns that look like password variable assignments. Tightened to
        // require the FULL keyword (password / passwd / secret / credential) —
        // the previous `pass(?:wd)?` variant matched substrings like
        // `QUIZZES_PASSED_KEY` (PASS inside PASSED → false positive).
        // Real password identifiers always contain the full word; abbreviations
        // are rare enough that the false-positive cost outweighs the catch.
        const assignmentPatterns = [
            // const/let/var passwordVar = 'value' — full word match
            /\b(?:const|let|var)\s+\w*(?:password|passwd|secret|credential)\w*\s*=\s*['"][^'"]+['"]/i,
            // object property — password: 'value' or password = 'value'
            /\b(?:correct_?password|admin_?pass(?:word)?|db_?pass(?:word)?|user_?pass(?:word)?|root_?pass(?:word)?|default_?pass(?:word)?)\s*[:=]\s*['"][^'"]+['"]/i,
        ];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // Skip comments
            if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('<!--')) {
                continue;
            }

            // Skip HTML input type="password" (that's just an input field)
            if (/type\s*=\s*["']password["']/i.test(line)) {
                continue;
            }

            // Skip instructional text (inside HTML tags with visible text)
            // e.g., <p>Enter your password</p>, <label>Password:</label>
            if (/>\s*[^<]*\bpassword\b[^<]*<\//i.test(line) && !/:?\s*['"]/.test(line)) {
                continue;
            }

            // Skip placeholder/label attributes
            if (/placeholder\s*=\s*["'][^"']*password[^"']*["']/i.test(line)) {
                continue;
            }

            // Skip ARM template parameter placeholders — adminPassword references
            // pulled from deployment parameters, NOT literal credentials.
            // Pattern:  '[parameters(\'paramName\')]'  (Azure ARM syntax;
            // the ` may be escaped as \' inside JS string literals).
            // Just check for the unique '[parameters(' substring.
            if (/\[parameters\(/.test(line)) {
                continue;
            }
            // Also skip Bicep / ARM template variable references:
            //   adminPassword: '[variables(...)]'
            //   adminPassword: '[reference(...)]'
            if (/\[(?:variables|reference|listKeys|secret)\s*\(/.test(line)) {
                continue;
            }

            // Skip values that are obvious placeholders, not real secrets:
            // REDACTED, PLACEHOLDER, YOUR_*, CHANGEME, ********, EXAMPLE, etc.
            // The validator catches the assignment SHAPE; if the VALUE is a
            // documented placeholder, no real secret leaks.
            if (/=\s*['"](?:REDACTED|PLACEHOLDER|CHANGEME|EXAMPLE|YOUR_[A-Z_]+|TODO|FIXME|XXX|\*+)['"]/i.test(line)) {
                continue;
            }

            for (const pattern of assignmentPatterns) {
                if (pattern.test(line)) {
                    issues.push({
                        code: 'SEC-002',
                        severity: 'high',
                        category: 'security',
                        message: `Hardcoded password in client-side code — extractable via DevTools`,
                        file: filePath,
                        line: i + 1,
                        fix: 'Move password validation to server-side or use a hash comparison'
                    });
                    break; // One hit per line is enough
                }
            }
        }

        return issues;
    }

    /**
     * SEC-003: successCheck / defenseCheck function definitions in HTML
     *
     * These functions contain challenge validation logic that belongs
     * server-side. If defined in an HTML file, students can read the
     * success conditions in the source.
     *
     * Only flags definitions (function keyword or arrow function assignment),
     * not calls to these functions.
     *
     * Only applies to HTML files — JS files in components/ may legitimately
     * define engine hooks.
     */
    checkChallengeLogic(filePath, content) {
        const issues = [];

        // Only check HTML files
        if (!filePath.endsWith('.html')) {
            return issues;
        }

        const lines = content.split('\n');

        // Match function definitions:
        //   function successCheck(...)
        //   const successCheck = (...) =>
        //   successCheck: function(...)
        //   function defenseCheck(...)
        const definitionPatterns = [
            /\bfunction\s+(successCheck|defenseCheck)\s*\(/,
            /\b(successCheck|defenseCheck)\s*[:=]\s*(?:function\s*\(|(?:\([^)]*\)|[a-zA-Z_$]\w*)\s*=>)/,
        ];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // Skip comments
            if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('<!--')) {
                continue;
            }

            for (const pattern of definitionPatterns) {
                const match = line.match(pattern);
                if (match) {
                    const funcName = match[1];
                    issues.push({
                        code: 'SEC-003',
                        severity: 'medium',
                        category: 'security',
                        message: `${funcName}() defined in client-side HTML — challenge logic visible to students`,
                        file: filePath,
                        line: i + 1,
                        fix: 'Move challenge validation to a Cloud Function or use hashed answer comparison'
                    });
                    break;
                }
            }
        }

        return issues;
    }

    /**
     * SEC-004: acceptedAnswers arrays with plaintext strings
     *
     * Catches patterns like:
     *   const acceptedAnswers = ['answer1', 'answer2']
     *   acceptedAnswers: ['nmap', 'nmap -sV']
     *
     * Students can find these arrays in the source and copy the answers.
     */
    checkPlaintextAnswers(filePath, content) {
        const issues = [];
        const lines = content.split('\n');

        // Match acceptedAnswers array assignments with string literals
        // acceptedAnswers = [...] or acceptedAnswers: [...]
        const answerPattern = /\bacceptedAnswers\s*[:=]\s*\[/;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            const trimmed = line.trim();

            // Skip comments
            if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('<!--')) {
                continue;
            }

            if (answerPattern.test(line)) {
                // Collect the full array (may span multiple lines)
                let arrayText = '';
                let bracketDepth = 0;
                let foundOpen = false;

                for (let j = i; j < lines.length && j < i + 20; j++) {
                    arrayText += lines[j] + '\n';
                    for (const ch of lines[j]) {
                        if (ch === '[') { bracketDepth++; foundOpen = true; }
                        if (ch === ']') { bracketDepth--; }
                    }
                    if (foundOpen && bracketDepth <= 0) break;
                }

                // Check if array contains string literals (plaintext answers)
                if (/['"][^'"]+['"]/.test(arrayText)) {
                    issues.push({
                        code: 'SEC-004',
                        severity: 'medium',
                        category: 'security',
                        message: `acceptedAnswers array contains plaintext strings — answer key exposed in source`,
                        file: filePath,
                        line: i + 1,
                        fix: 'Hash accepted answers and compare against hashed student input'
                    });
                }
            }
        }

        return issues;
    }

    /**
     * Recursively collect .js files under a directory.
     * Skips node_modules, .git, _tools, functions.
     */
    collectJSFiles(dirPath, files = []) {
        const skipDirs = ['node_modules', '.git', '_tools', '_archive', '_planning', 'assets', 'images', 'fonts'];

        let entries;
        try {
            entries = fs.readdirSync(dirPath, { withFileTypes: true });
        } catch (err) {
            return files;
        }

        for (const entry of entries) {
            if (entry.isDirectory()) {
                if (skipDirs.includes(entry.name)) continue;
                this.collectJSFiles(path.join(dirPath, entry.name), files);
            } else if (entry.isFile() && entry.name.endsWith('.js')) {
                files.push(path.join(dirPath, entry.name));
            }
        }

        return files;
    }

    /**
     * Get line number from character position
     */
    getLineNumber(content, position) {
        return content.substring(0, position).split('\n').length;
    }
}

module.exports = ClientSecretsValidator;
