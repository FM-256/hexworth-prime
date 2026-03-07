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
