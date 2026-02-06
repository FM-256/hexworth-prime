/**
 * EduScan - Quiz Parser
 *
 * Detects QuizEngine usage and extracts configuration.
 *
 * Phase 2 Enhancements:
 * - Auto-fix suggestions with computed correct values
 * - Expanded severity model (CRITICAL, HIGH, MEDIUM, LOW)
 * - eduscan-ignore directive support
 */

const { PATTERNS, extractFirst, test } = require('../utils/patterns');

// Valid house names for validation
const VALID_HOUSES = ['web', 'shield', 'forge', 'script', 'cloud', 'code', 'key', 'eye'];

/**
 * Parse file content for quiz indicators
 * @param {string} content - File content
 * @param {string} filePath - File path for context
 * @returns {Object} { detected, config, issues }
 */
function parse(content, filePath) {
    const result = {
        detected: false,
        config: {},
        issues: [],
        ignored: []
    };

    // Check for QuizEngine
    if (!test(content, PATTERNS.quiz.detect)) {
        return result;
    }

    result.detected = true;

    // Extract ignore directives
    const ignoreDirectives = extractIgnoreDirectives(content);

    // Extract configuration
    result.config = {
        type: 'quiz',
        engine: 'QuizEngine',
        moduleId: extractFirst(content, PATTERNS.quiz.moduleId),
        houseId: extractFirst(content, PATTERNS.quiz.houseId),
        trackProgress: extractTrackProgress(content),
        passingScore: extractNumber(content, PATTERNS.quiz.passingScore),
        title: extractFirst(content, PATTERNS.quiz.title),
        achievement: extractFirst(content, PATTERNS.quiz.achievement),
        timeLimit: extractTimeLimit(content),
        questionCount: countQuestions(content)
    };

    // Validate configuration and collect issues
    validateConfig(result, filePath, ignoreDirectives);

    return result;
}

/**
 * Extract eduscan-ignore directives from content
 * Format: <!-- eduscan-ignore: ISSUE-CODE reason="explanation" -->
 * Or: <!-- eduscan-ignore-all reason="explanation" -->
 */
function extractIgnoreDirectives(content) {
    const directives = {
        all: false,
        allReason: null,
        codes: {}
    };

    // Check for ignore-all
    const ignoreAllMatch = content.match(/<!--\s*eduscan-ignore-all(?::\s*reason\s*=\s*["']([^"']+)["'])?\s*-->/i);
    if (ignoreAllMatch) {
        directives.all = true;
        directives.allReason = ignoreAllMatch[1] || 'No reason provided';
    }

    // Check for specific code ignores
    const codePattern = /<!--\s*eduscan-ignore:\s*([A-Z]+-\d+)(?:\s+reason\s*=\s*["']([^"']+)["'])?\s*-->/gi;
    let match;
    while ((match = codePattern.exec(content)) !== null) {
        directives.codes[match[1]] = match[2] || 'No reason provided';
    }

    return directives;
}

/**
 * Extract trackProgress as boolean
 */
function extractTrackProgress(content) {
    const match = extractFirst(content, PATTERNS.quiz.trackProgress);
    if (match === null) return true; // Default is true
    return match === 'true';
}

/**
 * Extract numeric value
 */
function extractNumber(content, pattern) {
    const match = extractFirst(content, pattern);
    if (match === null || match === 'null') return null;
    return parseInt(match, 10);
}

/**
 * Extract time limit
 */
function extractTimeLimit(content) {
    const match = extractFirst(content, PATTERNS.quiz.timeLimit);
    if (match === null || match === 'null') return null;
    return parseInt(match, 10);
}

/**
 * Count questions in quiz
 */
function countQuestions(content) {
    // Find the questions array
    const arrayMatch = content.match(PATTERNS.quiz.questionsArray);
    if (!arrayMatch) return 0;

    // Count question objects
    const questionsContent = arrayMatch[1];
    const matches = questionsContent.match(PATTERNS.quiz.questionObject);
    return matches ? matches.length : 0;
}

/**
 * Compute the correct moduleId by stripping house prefix and -quiz suffix
 * @param {string} moduleId - Current moduleId
 * @param {string} pathHouse - House detected from file path
 * @returns {string} Corrected moduleId
 */
function computeCorrectModuleId(moduleId, pathHouse) {
    if (!moduleId) return null;

    let corrected = moduleId;

    // Strip house prefix if present (check all houses, not just path house)
    for (const house of VALID_HOUSES) {
        if (corrected.startsWith(house + '-')) {
            corrected = corrected.substring(house.length + 1);
            break;
        }
    }

    // Strip -quiz suffix if present
    if (corrected.endsWith('-quiz')) {
        corrected = corrected.slice(0, -5);
    }

    return corrected;
}

/**
 * Check if an issue should be ignored
 */
function shouldIgnore(code, directives) {
    if (directives.all) return { ignored: true, reason: directives.allReason };
    if (directives.codes[code]) return { ignored: true, reason: directives.codes[code] };
    return { ignored: false };
}

/**
 * Validate quiz configuration and add issues
 */
function validateConfig(result, filePath, ignoreDirectives) {
    const config = result.config;
    const pathHouse = extractHouseFromPath(filePath);

    // Compute what the moduleId SHOULD be
    const suggestedModuleId = computeCorrectModuleId(config.moduleId, pathHouse);
    const hasModuleIdIssues = config.moduleId && suggestedModuleId !== config.moduleId;

    // ID-001: Combined moduleId issue (house prefix or -quiz suffix)
    // This is the primary sync-breaking issue
    if (hasModuleIdIssues) {
        const ignoreCheck = shouldIgnore('ID-001', ignoreDirectives);

        if (ignoreCheck.ignored) {
            result.ignored.push({
                code: 'ID-001',
                reason: ignoreCheck.reason
            });
        } else {
            const problems = [];
            if (config.moduleId.match(/^(web|shield|forge|script|cloud|code|key|eye)-/)) {
                problems.push('has house prefix');
            }
            if (config.moduleId.endsWith('-quiz')) {
                problems.push('ends with -quiz suffix');
            }

            result.issues.push({
                code: 'ID-001',
                severity: 'critical',
                category: 'sync',
                type: 'moduleId_malformed',
                message: `moduleId '${config.moduleId}' ${problems.join(' and ')} — will break sync`,
                current: config.moduleId,
                suggested: suggestedModuleId,
                fix: `Change moduleId to '${suggestedModuleId}'`,
                autoFixable: true,
                searchPattern: `moduleId: '${config.moduleId}'`,
                replaceWith: `moduleId: '${suggestedModuleId}'`
            });
        }
    }

    // SYNC-003: houseId should be valid
    if (config.houseId && !VALID_HOUSES.includes(config.houseId)) {
        const ignoreCheck = shouldIgnore('SYNC-003', ignoreDirectives);

        if (ignoreCheck.ignored) {
            result.ignored.push({ code: 'SYNC-003', reason: ignoreCheck.reason });
        } else {
            result.issues.push({
                code: 'SYNC-003',
                severity: 'critical',
                category: 'sync',
                type: 'invalid_houseId',
                message: `houseId '${config.houseId}' is not a valid house name`,
                current: config.houseId,
                suggested: pathHouse || VALID_HOUSES[0],
                fix: `Change houseId to '${pathHouse || 'valid house name'}'`,
                autoFixable: pathHouse !== null
            });
        }
    }

    // SYNC-004: houseId should match path house
    if (config.houseId && pathHouse && config.houseId !== pathHouse) {
        const ignoreCheck = shouldIgnore('SYNC-004', ignoreDirectives);

        if (ignoreCheck.ignored) {
            result.ignored.push({ code: 'SYNC-004', reason: ignoreCheck.reason });
        } else {
            result.issues.push({
                code: 'SYNC-004',
                severity: 'high',
                category: 'sync',
                type: 'houseId_path_mismatch',
                message: `houseId '${config.houseId}' doesn't match path house '${pathHouse}'`,
                current: config.houseId,
                suggested: pathHouse,
                fix: `Change houseId to '${pathHouse}'`,
                autoFixable: true,
                searchPattern: `houseId: '${config.houseId}'`,
                replaceWith: `houseId: '${pathHouse}'`
            });
        }
    }

    // CFG-001: Missing moduleId
    if (!config.moduleId) {
        const ignoreCheck = shouldIgnore('CFG-001', ignoreDirectives);

        if (ignoreCheck.ignored) {
            result.ignored.push({ code: 'CFG-001', reason: ignoreCheck.reason });
        } else {
            // Try to suggest moduleId from filename
            const filename = filePath.split('/').pop().replace('.html', '').replace(/-quiz$/, '');

            result.issues.push({
                code: 'CFG-001',
                severity: 'high',
                category: 'config',
                type: 'missing_moduleId',
                message: 'Quiz has no moduleId configured — progress cannot be tracked',
                suggested: filename,
                fix: `Add moduleId: '${filename}' to QuizEngine configuration`,
                autoFixable: false
            });
        }
    }

    // CFG-002: Missing houseId (lower severity - auto-detection works)
    if (!config.houseId) {
        const ignoreCheck = shouldIgnore('CFG-002', ignoreDirectives);

        if (ignoreCheck.ignored) {
            result.ignored.push({ code: 'CFG-002', reason: ignoreCheck.reason });
        } else {
            result.issues.push({
                code: 'CFG-002',
                severity: 'low',
                category: 'config',
                type: 'missing_houseId',
                message: 'Quiz has no explicit houseId (will auto-detect from URL)',
                suggested: pathHouse,
                fix: pathHouse ? `Add houseId: '${pathHouse}' for reliability` : 'Add explicit houseId',
                autoFixable: false
            });
        }
    }

    // TRACK-001: trackProgress disabled
    if (config.trackProgress === false) {
        const ignoreCheck = shouldIgnore('TRACK-001', ignoreDirectives);

        if (ignoreCheck.ignored) {
            result.ignored.push({ code: 'TRACK-001', reason: ignoreCheck.reason });
        } else {
            result.issues.push({
                code: 'TRACK-001',
                severity: 'medium',
                category: 'tracking',
                type: 'tracking_disabled',
                message: 'Progress tracking is disabled for this quiz',
                current: 'false',
                suggested: 'true',
                fix: 'Set trackProgress: true if completion should be tracked',
                autoFixable: true,
                searchPattern: 'trackProgress: false',
                replaceWith: 'trackProgress: true'
            });
        }
    }
}

/**
 * Extract house from file path
 */
function extractHouseFromPath(filePath) {
    const match = filePath.match(/houses\/(\w+)\//);
    return match ? match[1] : null;
}

module.exports = {
    parse,
    computeCorrectModuleId,
    VALID_HOUSES
};
