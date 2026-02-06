/**
 * EduScan - Quiz Parser
 *
 * Detects QuizEngine usage and extracts configuration.
 */

const { PATTERNS, extractFirst, test } = require('../utils/patterns');

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
        issues: []
    };

    // Check for QuizEngine
    if (!test(content, PATTERNS.quiz.detect)) {
        return result;
    }

    result.detected = true;

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
    validateConfig(result, filePath);

    return result;
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
 * Validate quiz configuration and add issues
 */
function validateConfig(result, filePath) {
    const config = result.config;
    const pathHouse = extractHouseFromPath(filePath);

    // SYNC-001: moduleId should not contain house prefix
    if (config.moduleId && pathHouse) {
        if (config.moduleId.startsWith(pathHouse + '-')) {
            result.issues.push({
                code: 'SYNC-001',
                severity: 'critical',
                type: 'moduleId_has_house_prefix',
                message: `moduleId '${config.moduleId}' contains house prefix '${pathHouse}-'`,
                current: config.moduleId,
                expected: config.moduleId.replace(pathHouse + '-', ''),
                fix: `Remove '${pathHouse}-' prefix from moduleId`
            });
        }
    }

    // SYNC-002: moduleId should not end with '-quiz'
    if (config.moduleId && config.moduleId.endsWith('-quiz')) {
        result.issues.push({
            code: 'SYNC-002',
            severity: 'critical',
            type: 'moduleId_has_quiz_suffix',
            message: `moduleId '${config.moduleId}' ends with '-quiz' suffix`,
            current: config.moduleId,
            expected: config.moduleId.replace(/-quiz$/, ''),
            fix: `Remove '-quiz' suffix from moduleId`
        });
    }

    // SYNC-003: houseId should be valid
    if (config.houseId) {
        if (!test(config.houseId, PATTERNS.validation.validHouses)) {
            result.issues.push({
                code: 'SYNC-003',
                severity: 'critical',
                type: 'invalid_houseId',
                message: `houseId '${config.houseId}' is not a valid house name`,
                current: config.houseId,
                expected: pathHouse || 'one of: web, shield, forge, script, cloud, code, key, eye',
                fix: `Change houseId to valid house name`
            });
        }
    }

    // SYNC-004: houseId should match path house
    if (config.houseId && pathHouse && config.houseId !== pathHouse) {
        result.issues.push({
            code: 'SYNC-004',
            severity: 'warning',
            type: 'houseId_path_mismatch',
            message: `houseId '${config.houseId}' doesn't match path house '${pathHouse}'`,
            current: config.houseId,
            expected: pathHouse,
            fix: `Change houseId to '${pathHouse}' to match file location`
        });
    }

    // CFG-001: Missing moduleId
    if (!config.moduleId) {
        result.issues.push({
            code: 'CFG-001',
            severity: 'warning',
            type: 'missing_moduleId',
            message: 'Quiz has no moduleId configured',
            fix: 'Add moduleId to QuizEngine configuration'
        });
    }

    // CFG-002: Missing houseId
    if (!config.houseId) {
        result.issues.push({
            code: 'CFG-002',
            severity: 'info',
            type: 'missing_houseId',
            message: 'Quiz has no explicit houseId (will auto-detect from URL)',
            fix: 'Consider adding explicit houseId for reliability'
        });
    }

    // TRACK-001: trackProgress disabled
    if (config.trackProgress === false) {
        result.issues.push({
            code: 'TRACK-001',
            severity: 'info',
            type: 'tracking_disabled',
            message: 'Progress tracking is disabled for this quiz',
            fix: 'Set trackProgress: true if completion should be tracked'
        });
    }
}

/**
 * Extract house from file path
 */
function extractHouseFromPath(filePath) {
    const match = filePath.match(/houses\/(\w+)\//);
    return match ? match[1] : null;
}

module.exports = { parse };
