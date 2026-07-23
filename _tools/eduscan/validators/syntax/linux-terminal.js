/**
 * EduScan - LinuxTerminal Validator
 *
 * Detects misuse of the LinuxTerminal.js API that causes blank/broken terminals.
 * LinuxTerminal is an IIFE returning a plain object — not a constructor.
 *
 * Rules:
 * - LT-001: new LinuxTerminal() — crashes (not a constructor, it's an IIFE)
 * - LT-002: .addCommand() — method doesn't exist in the API
 * - LT-003: File includes LinuxTerminal.js but never calls ModuleProgress.complete()
 * - LT-004: Progress saves to nested .linuxMastery[] key (should be flat)
 */

class LinuxTerminalValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.profile = options.profile || 'ci';
    }

    /**
     * Validate a single file for LinuxTerminal misuse
     * @param {Object} file - { path, content }
     * @returns {Array} Issues found
     */
    validate(file) {
        if (this.profile === 'inventory') return [];

        const content = file.content;
        if (!content) return [];

        // Only check files that include LinuxTerminal.js
        if (!content.includes('LinuxTerminal.js')) return [];

        const issues = [];

        issues.push(...this.checkConstructorUsage(file));
        issues.push(...this.checkAddCommand(file));
        issues.push(...this.checkMissingModuleProgress(file));
        issues.push(...this.checkNestedProgressKey(file));
        issues.push(...this.checkPhantomRootChildren(file));

        return issues;
    }

    /**
     * LT-005: Phantom child in a root session's /root filesystem overlay.
     *
     * For root sessions (user:'root'), LinuxTerminal's #104 root-home prune
     * (LinuxTerminal.js ~line 4003) deletes every base-seeded /root/* node the
     * lab's addFilesystem overlay does not itself re-declare. So if a dir node
     * under /root lists a name in its `children` array but the overlay defines
     * no node at that path, the name shows in `ls` while `cat`/`stat` fail — a
     * phantom file (this is exactly BUG-017 on da-linux-post-exploitation).
     *
     * Scope is deliberately narrow to guarantee ZERO false positives: only
     * root sessions that claim /root in the overlay, and only children under
     * the /root subtree — that is precisely where the prune removes the base
     * fallback, so an undeclared child is unambiguously unreachable. Non-root
     * sessions and non-/root paths keep their base-seeded fallback and are NOT
     * checked here (a broader per-user base-tree-aware audit is future work;
     * a naive whole-corpus scan is ~98% false positives — see task #210). If
     * the overlay is not a statically parseable object literal, nothing is
     * flagged (conservative — no guessing).
     */
    checkPhantomRootChildren(file) {
        const issues = [];
        const content = file.content;

        // Only root sessions are subject to the /root prune.
        if (!/user\s*:\s*['"]root['"]/.test(content)) return issues;

        // Brace-match EVERY addFilesystem({...}) overlay. A lab may layer
        // several (e.g. a staged root reveal); they all merge into one
        // filesystem, so declared nodes + children accumulate across all calls.
        const overlays = [];
        let searchIdx = 0;
        while (true) {
            const callIdx = content.indexOf('addFilesystem(', searchIdx);
            if (callIdx === -1) break;
            const objStart = content.indexOf('{', callIdx);
            if (objStart === -1) break;
            let depth = 0, end = -1;
            for (let i = objStart; i < content.length; i++) {
                if (content[i] === '{') depth++;
                else if (content[i] === '}') { depth--; if (depth === 0) { end = i + 1; break; } }
            }
            if (end === -1) break;
            overlays.push({ text: content.slice(objStart, end), start: objStart });
            searchIdx = end;
        }
        if (overlays.length === 0) return issues;

        // Computed/template key ([expr]:{...}) => declared paths can't be
        // resolved statically. `[` in KEY position follows `{` or `,` (an
        // array VALUE follows `:`, so `children:[...]` does not match). If any
        // overlay uses one, skip entirely: a false negative is acceptable, a
        // false positive on a node that IS declared under a computed key is not.
        if (overlays.some(o => /[{,]\s*\[/.test(o.text))) return issues;

        // Union of all declared node paths across every overlay.
        const declared = new Set();
        for (const o of overlays) {
            const keyRe = /(['"])(\/[^'"\n]*?)\1\s*:\s*\{/g;
            let k;
            while ((k = keyRe.exec(o.text)) !== null) declared.add(k[2]);
        }
        // Only a /root-claiming overlay triggers the prune.
        if (!declared.has('/root')) return issues;

        // For each declared /root dir node, brace-match its body (so a nested
        // object before `children`, e.g. meta:{...}, can't hide the array) and
        // flag any child with no declared node in the union (fallback pruned).
        for (const o of overlays) {
            const nodeRe = /(['"])(\/root[^'"\n]*?)\1\s*:\s*\{/g;
            let m;
            while ((m = nodeRe.exec(o.text)) !== null) {
                const dirPath = m[2];
                const bodyStart = m.index + m[0].length - 1; // the '{'
                let depth = 0, bodyEnd = -1;
                for (let i = bodyStart; i < o.text.length; i++) {
                    if (o.text[i] === '{') depth++;
                    else if (o.text[i] === '}') { depth--; if (depth === 0) { bodyEnd = i + 1; break; } }
                }
                if (bodyEnd === -1) continue;
                const body = o.text.slice(bodyStart, bodyEnd);
                const childrenMatch = body.match(/children\s*:\s*\[([^\]]*)\]/);
                if (!childrenMatch) continue;
                const kids = [...childrenMatch[1].matchAll(/(['"])([^'"]+)\1/g)].map(c => c[2]);
                for (const kid of kids) {
                    const childPath = (dirPath === '/root' ? '/root/' : dirPath + '/') + kid;
                    if (!declared.has(childPath)) {
                        const line = content.substring(0, o.start + m.index).split('\n').length;
                        issues.push({
                            code: 'LT-005',
                            severity: 'medium',
                            category: 'linux-terminal',
                            message: `Root session lists "${kid}" in ${dirPath} children, but no filesystem node is declared at ${childPath}. The root-home prune removes the base-seeded fallback, so "ls" shows it while "cat"/"stat" fail (phantom file).`,
                            file: file.path,
                            line,
                            fix: `Seed a node for ${childPath} in addFilesystem(), or remove "${kid}" from the ${dirPath} children array.`
                        });
                    }
                }
            }
        }

        return issues;
    }

    /**
     * LT-001: new LinuxTerminal() — IIFE is not a constructor
     * This ALWAYS crashes: "LinuxTerminal is not a constructor"
     */
    checkConstructorUsage(file) {
        const issues = [];
        const regex = /new\s+LinuxTerminal\s*\(/g;
        let match;

        while ((match = regex.exec(file.content)) !== null) {
            const line = file.content.substring(0, match.index).split('\n').length;
            issues.push({
                code: 'LT-001',
                severity: 'critical',
                category: 'linux-terminal',
                message: `LinuxTerminal is an IIFE, not a constructor. "new LinuxTerminal()" crashes. Use LinuxTerminal.init() instead.`,
                file: file.path,
                line,
                fix: 'Replace "new LinuxTerminal(id, opts)" with "LinuxTerminal.init(moduleId, selector, opts)"'
            });
        }

        return issues;
    }

    /**
     * LT-002: .addCommand() — method doesn't exist
     * Terminal silently breaks, commands produce no output
     */
    checkAddCommand(file) {
        const issues = [];
        const regex = /\.addCommand\s*\(/g;
        let match;
        let count = 0;

        while ((match = regex.exec(file.content)) !== null) {
            count++;
        }

        if (count > 0) {
            issues.push({
                code: 'LT-002',
                severity: 'critical',
                category: 'linux-terminal',
                message: `${count} call(s) to .addCommand() — this method doesn't exist in LinuxTerminal API. Commands will silently fail.`,
                file: file.path,
                fix: 'Use LinuxTerminal.addFilesystem() for custom files and onCommand callback for detection'
            });
        }

        return issues;
    }

    /**
     * LT-003: File uses LinuxTerminal but never calls ModuleProgress.complete()
     * Module progress won't be tracked by the platform
     */
    checkMissingModuleProgress(file) {
        const issues = [];

        // Only flag modules/applets that have terminal + task tracking
        const hasTaskTracking = /completeTask|completeChallenge|completedChallenges/.test(file.content);
        const hasModuleProgress = /ModuleProgress\.complete\s*\(/.test(file.content);

        if (hasTaskTracking && !hasModuleProgress) {
            issues.push({
                code: 'LT-003',
                severity: 'medium',
                category: 'linux-terminal',
                message: 'File has task/challenge tracking but never calls ModuleProgress.complete() — progress won\'t sync to platform.',
                file: file.path,
                fix: 'Add ModuleProgress.complete(houseId, moduleId, { returnUrl }) when all tasks are done'
            });
        }

        return issues;
    }

    /**
     * LT-004: Nested progress key format (script.linuxMastery['lm-XX'])
     * Should use flat format: script['script-lm-XX-name']
     */
    checkNestedProgressKey(file) {
        const issues = [];
        const regex = /\.script\.linuxMastery\b/;

        if (regex.test(file.content)) {
            issues.push({
                code: 'LT-004',
                severity: 'medium',
                category: 'linux-terminal',
                message: 'Progress saves to nested .script.linuxMastery[] key — should use flat .script[] format.',
                file: file.path,
                fix: 'Change progress.script.linuxMastery["lm-XX"] to progress.script["script-lm-XX-name"]'
            });
        }

        return issues;
    }
}

module.exports = LinuxTerminalValidator;
