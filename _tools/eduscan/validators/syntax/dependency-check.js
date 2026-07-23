/**
 * EduScan - Dependency Check Validator
 *
 * Catches "wired up but never plugged in" bugs — where content files
 * reference globals (ProgressManager, GameTracker, etc.) that were never
 * loaded via <script> tags. These cause silent failures: students complete
 * work but get zero credit in the instructor pipeline.
 *
 * Five dependency pairs:
 *   DEP-001  trackProgress: true (QuizEngine config) → ProgressSystem.js
 *   DEP-002  ProgressManager.completeModule/.complete  → ProgressSystem.js OR ProgressManager.js
 *   DEP-003  GameTracker.record                        → GameTracker.js
 *   DEP-004  ModuleProgress.complete                   → ModuleProgress.js
 *   DEP-005  AchievementSystem.unlock / AchievementManager.unlock
 *                                                      → AchievementSystem.js OR AchievementManager.js
 *
 * Severity rationale:
 *   HIGH   (DEP-001, DEP-002, DEP-004) — breaks instructor pipeline sync/grading
 *   MEDIUM (DEP-003, DEP-005)          — breaks game recording / achievement unlocks
 */

class DependencyCheckValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.profile = options.profile || 'ci';
    }

    // ═══════════════════════════════════════════════════════════════
    // DEPENDENCY RULES
    // Each rule defines:
    //   code       - Issue code (DEP-xxx)
    //   severity   - HIGH or MEDIUM
    //   callPattern - RegExp to detect the usage in file content
    //   scriptPattern - RegExp to detect a satisfying <script src="..."> tag
    //   description - Human-readable explanation
    // ═══════════════════════════════════════════════════════════════
    rules = [
        {
            code: 'DEP-001',
            severity: 'high',
            callPattern: /trackProgress\s*:\s*true/,
            scriptPattern: /src\s*=\s*["'][^"']*ProgressSystem\.js["']/i,
            callLabel: 'trackProgress: true',
            scriptLabel: 'ProgressSystem.js',
            description: 'Quiz has trackProgress: true but ProgressSystem.js is not loaded — progress will silently fail'
        },
        {
            code: 'DEP-002',
            severity: 'high',
            callPattern: /ProgressManager\s*\.\s*(?:completeModule|complete)\s*\(/,
            scriptPattern: /src\s*=\s*["'][^"']*(?:ProgressSystem|ProgressManager)\.js["']/i,
            callLabel: 'ProgressManager.completeModule()/complete()',
            scriptLabel: 'ProgressSystem.js or ProgressManager.js',
            description: 'Calls ProgressManager but neither ProgressSystem.js nor ProgressManager.js is loaded'
        },
        {
            code: 'DEP-003',
            severity: 'medium',
            callPattern: /GameTracker\s*\.\s*record\s*\(/,
            scriptPattern: /src\s*=\s*["'][^"']*GameTracker\.js["']/i,
            callLabel: 'GameTracker.record()',
            scriptLabel: 'GameTracker.js',
            description: 'Calls GameTracker.record() but GameTracker.js is not loaded — scores will not be recorded'
        },
        {
            code: 'DEP-004',
            severity: 'high',
            callPattern: /ModuleProgress\s*\.\s*complete\s*\(/,
            scriptPattern: /src\s*=\s*["'][^"']*ModuleProgress\.js["']/i,
            callLabel: 'ModuleProgress.complete()',
            scriptLabel: 'ModuleProgress.js',
            description: 'Calls ModuleProgress.complete() but ModuleProgress.js is not loaded — module completion will not track'
        },
        {
            code: 'DEP-005',
            severity: 'medium',
            callPattern: /(?:AchievementSystem|AchievementManager)\s*\.\s*unlock\s*\(/,
            scriptPattern: /src\s*=\s*["'][^"']*(?:AchievementSystem|AchievementManager|ProgressSystem)\.js["']/i,
            callLabel: 'AchievementSystem.unlock()/AchievementManager.unlock()',
            scriptLabel: 'AchievementSystem.js or AchievementManager.js',
            description: 'Calls achievement unlock but no achievement script is loaded — achievement will silently fail'
        }
    ];

    /**
     * Validate a single file for missing dependency script tags
     * @param {Object} file - Parsed file object with .content and .path
     * @returns {Array} Issues found
     */
    validate(file) {
        const issues = [];
        const content = file.content;
        const filePath = file.path;

        if (!content) return issues;

        // Neutralize non-code contexts via the shared hardened util (see
        // strip-noncode.js for the Task #207 ordering constraints). Inline
        // JS strings/comments are blanked FIRST, THEN HTML comments — so a
        // commented-out <script>Foo.bar()</script> can neither fire a rule
        // (call-pattern side) nor satisfy one (script-tag side). Previously
        // HTML comments were never stripped here (false DEP-004 positives on
        // comment-wrapped scripts) and script tags were extracted from RAW
        // content (a commented-out src tag counted as a real load).
        const { neutralizeInlineScripts, stripHtmlComments, stripPreserveLines } =
            require('../../utils/strip-noncode.js');
        const stripPL = stripPreserveLines;

        // Tag-presence source: HTML comments removed, but attribute values
        // (src="...") kept intact for extractScriptTags' pattern matching.
        const liveContent = stripHtmlComments(neutralizeInlineScripts(content));
        const scriptTags = this.extractScriptTags(liveContent);

        // Call-pattern source: additionally strip documentation/example
        // contexts where a call-pattern substring is text, not an invocation:
        //   - <code>...</code>, <pre>...</pre> (documentation/code samples)
        //   - HTML attribute values (titles, placeholders, error msgs)
        let scanContent = content
            .replace(/(<(code|pre|textarea)\b[^>]*>)([\s\S]*?)(<\/\2>)/gi,
                (_f, o, _n, b, c) => o + stripPL(b) + c)
            .replace(/=(["'])([\s\S]*?)\1/g,
                (_f, q, v) => '=' + q + stripPL(v) + q);
        scanContent = stripHtmlComments(neutralizeInlineScripts(scanContent));

        for (const rule of this.rules) {
            // Step 1: Does the file contain the call pattern? (use sanitized
            // content so doc/string false positives don't trigger)
            const callMatch = rule.callPattern.exec(scanContent);
            if (!callMatch) continue;

            // Step 2: Is the call inside a typeof guard? (e.g., `typeof GameTracker !== 'undefined'`)
            // Even guarded calls are issues — the guard prevents the crash but the
            // functionality still silently fails. We still flag it but note the guard.
            const hasGuard = this.hasTypeofGuard(content, callMatch, rule);

            // Step 3: Is the required script tag present?
            const hasScript = scriptTags.some(tag => rule.scriptPattern.test(tag));

            if (!hasScript) {
                // Find the line number of the call pattern for better reporting
                const line = this.getLineNumber(content, callMatch.index);

                issues.push({
                    code: rule.code,
                    severity: rule.severity,
                    category: 'dependency',
                    message: `${rule.callLabel} used but ${rule.scriptLabel} not loaded` +
                             (hasGuard ? ' (typeof guard present — silent no-op)' : ''),
                    file: filePath,
                    line,
                    description: rule.description,
                    fix: `Add <script src=".../${rule.scriptLabel.split(' or ')[0]}"></script> to this file`,
                    autoFixable: true,
                    guarded: hasGuard
                });

                if (this.verbose) {
                    console.log(`[DEP-CHECK] ${rule.code} in ${filePath}:${line} — ${rule.callLabel} without ${rule.scriptLabel}`);
                }
            }
        }

        return issues;
    }

    /**
     * Extract all <script ...> tags from HTML content
     * Returns the full tag string (not the content between tags)
     * @param {string} content - HTML content
     * @returns {string[]} Array of script tag strings
     */
    extractScriptTags(content) {
        const tags = [];
        const pattern = /<script\b[^>]*>/gi;
        let match;
        while ((match = pattern.exec(content)) !== null) {
            tags.push(match[0]);
        }
        return tags;
    }

    /**
     * Check if the call pattern is wrapped in a typeof guard
     * e.g., `if (typeof ProgressManager !== 'undefined') ProgressManager.completeModule(...)`
     * @param {string} content - Full file content
     * @param {Object} callMatch - RegExp match object for the call pattern
     * @param {Object} rule - The dependency rule being checked
     * @returns {boolean}
     */
    hasTypeofGuard(content, callMatch, rule) {
        // Look at the ~200 chars before the call for a typeof guard
        const lookback = content.substring(Math.max(0, callMatch.index - 200), callMatch.index);

        // Extract the global name from the call label (first word before the dot)
        const globalName = rule.callLabel.match(/^(\w+)/)[1];

        // Check for typeof guard pattern
        const guardPattern = new RegExp(`typeof\\s+${globalName}\\s*!==?\\s*['"]undefined['"]`);
        return guardPattern.test(lookback);
    }

    /**
     * Get line number for a character position
     * @param {string} content - File content
     * @param {number} index - Character index
     * @returns {number} Line number (1-based)
     */
    getLineNumber(content, index) {
        const before = content.substring(0, index);
        return (before.match(/\n/g) || []).length + 1;
    }
}

module.exports = DependencyCheckValidator;
