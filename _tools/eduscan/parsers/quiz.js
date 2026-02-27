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

// Valid house names for validation (all 12 houses including AI and secret/special)
const VALID_HOUSES = ['web', 'shield', 'forge', 'script', 'cloud', 'code', 'key', 'eye', 'ai', 'dark-arts', 'matrix', 'divergent'];

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

    // Check for QuizEngine, ModuleProgress.completeQuiz, or ProgressManager.completeModule with quiz type
    const hasQuizEngine = test(content, PATTERNS.quiz.detect);
    const hasModuleProgressQuiz = /ModuleProgress\.completeQuiz\s*\(/.test(content);
    const hasProgressManagerQuiz = /ProgressManager\.completeModule\s*\([^)]*['"]quiz['"]/.test(content);

    if (!hasQuizEngine && !hasModuleProgressQuiz && !hasProgressManagerQuiz) {
        return result;
    }

    result.detected = true;

    // Extract ignore directives
    const ignoreDirectives = extractIgnoreDirectives(content);

    // Extract configuration
    if (hasQuizEngine) {
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
    } else if (hasModuleProgressQuiz) {
        // ModuleProgress-based quiz — extract from ModuleProgress.completeQuiz('house', 'id', ...)
        const mpPattern = /ModuleProgress\.completeQuiz\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/;
        const mpMatch = content.match(mpPattern);
        result.config = {
            type: 'quiz',
            engine: 'ModuleProgress',
            moduleId: mpMatch ? mpMatch[2] : null,
            houseId: mpMatch ? mpMatch[1] : extractHouseFromPath(filePath),
            trackProgress: true,
            passingScore: extractNumber(content, PATTERNS.quiz.passingScore) || 70,
            title: extractFirst(content, PATTERNS.quiz.title) || extractFirst(content, /\<title\>([^<]+)/i),
            achievement: extractFirst(content, PATTERNS.quiz.achievement),
            timeLimit: null,
            questionCount: countQuestions(content)
        };
    } else {
        // ProgressManager.completeModule-based quiz — extract moduleId and houseId
        // Pattern: ProgressManager.completeModule('moduleId', 'houseId', 'quiz', ...)
        const pmPattern = /ProgressManager\.completeModule\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/;
        const pmMatch = content.match(pmPattern);
        result.config = {
            type: 'quiz',
            engine: 'ProgressManager',
            moduleId: pmMatch ? pmMatch[1] : null,
            houseId: pmMatch ? pmMatch[2] : extractHouseFromPath(filePath),
            trackProgress: true,
            passingScore: extractNumber(content, PATTERNS.quiz.passingScore) || 70,
            title: extractFirst(content, PATTERNS.quiz.title) || extractFirst(content, /\<title\>([^<]+)/i),
            achievement: extractFirst(content, PATTERNS.quiz.achievement),
            timeLimit: null,
            questionCount: countQuestions(content)
        };
    }

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
 * Compute the correct moduleId — only flag WRONG house prefix (cross-house)
 * A correct house prefix (matching pathHouse) and -quiz suffix are both valid.
 * @param {string} moduleId - Current moduleId
 * @param {string} pathHouse - House detected from file path
 * @returns {{ corrected: string, hasCrossHousePrefix: boolean }}
 */
function computeCorrectModuleId(moduleId, pathHouse) {
    if (!moduleId) return { corrected: null, hasCrossHousePrefix: false };

    // Check if moduleId starts with a house prefix
    let detectedPrefix = null;
    for (const house of VALID_HOUSES) {
        if (moduleId.startsWith(house + '-')) {
            detectedPrefix = house;
            break;
        }
    }

    // Only flag if the prefix is a DIFFERENT house than the file's path house
    if (detectedPrefix && pathHouse && detectedPrefix !== pathHouse) {
        // Cross-house prefix — strip the wrong prefix, add correct one
        const withoutPrefix = moduleId.substring(detectedPrefix.length + 1);
        return { corrected: pathHouse + '-' + withoutPrefix, hasCrossHousePrefix: true };
    }

    // Same-house prefix or no prefix or no pathHouse — moduleId is fine
    return { corrected: moduleId, hasCrossHousePrefix: false };
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

    // Compute what the moduleId SHOULD be — only flags cross-house prefix mismatches
    const { corrected: suggestedModuleId, hasCrossHousePrefix } = computeCorrectModuleId(config.moduleId, pathHouse);

    // ID-001: Cross-house moduleId prefix (genuinely broken — wrong house)
    // Only critical for QuizEngine — ModuleProgress handles its own IDs
    if (hasCrossHousePrefix && config.engine === 'QuizEngine') {
        const ignoreCheck = shouldIgnore('ID-001', ignoreDirectives);

        if (ignoreCheck.ignored) {
            result.ignored.push({
                code: 'ID-001',
                reason: ignoreCheck.reason
            });
        } else {
            result.issues.push({
                code: 'ID-001',
                severity: 'critical',
                category: 'sync',
                type: 'moduleId_malformed',
                message: `moduleId '${config.moduleId}' has wrong house prefix (expected '${pathHouse}') — will break sync`,
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
    const match = filePath.match(/houses\/([\w-]+)\//);
    return match ? match[1] : null;
}

module.exports = {
    parse,
    computeCorrectModuleId,
    VALID_HOUSES
};
