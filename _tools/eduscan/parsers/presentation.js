/**
 * EduScan - Presentation Parser
 *
 * Detects presentation/slideshow content and saveProgress usage.
 */

const { PATTERNS, extractFirst, test, extractAll } = require('../utils/patterns');

/**
 * Parse file content for presentation indicators
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

    // Check for presentation indicators
    const hasSaveProgress = test(content, PATTERNS.presentation.detectSaveProgress);
    const hasProgressManager = test(content, PATTERNS.presentation.detectProgressManager);
    const hasModuleProgress = test(content, PATTERNS.presentation.detectModuleProgress);
    const hasSlides = test(content, PATTERNS.presentation.detectSlides);
    const hasPresentationEngine = test(content, PATTERNS.presentation.detectPresentationEngine);

    // Must have slides OR presentation engine OR saveProgress/ModuleProgress to be a presentation
    if (!hasSlides && !hasPresentationEngine && !hasSaveProgress && !hasModuleProgress) {
        return result;
    }

    result.detected = true;

    // Extract configuration
    result.config = {
        type: 'presentation',
        hasSaveProgress,
        hasProgressManager,
        hasModuleProgress,
        slideCount: countSlides(content),
        engine: hasPresentationEngine ? 'PresentationEngine' : 'custom'
    };

    // Extract saveProgress arguments if present
    if (hasSaveProgress) {
        const args = extractSaveProgressArgs(content);
        if (args) {
            result.config.saveProgressHouse = args.house;
            result.config.saveProgressModuleId = args.moduleId;
        }
    }

    // Extract ProgressManager.completeModule arguments if present
    if (hasProgressManager) {
        const args = extractCompleteModuleArgs(content);
        if (args) {
            result.config.progressModuleId = args.moduleId;
            result.config.progressHouseId = args.houseId;
        }
    }

    // Extract ModuleProgress.complete arguments if present
    if (hasModuleProgress) {
        const args = extractModuleProgressArgs(content);
        if (args) {
            result.config.progressModuleId = result.config.progressModuleId || args.moduleId;
            result.config.progressHouseId = result.config.progressHouseId || args.houseId;
        }
    }

    // Determine tracking status
    result.config.tracksProgress = hasSaveProgress || hasProgressManager || hasModuleProgress;

    // Validate and collect issues
    validateConfig(result, filePath);

    return result;
}

/**
 * Count slides in presentation
 */
function countSlides(content) {
    const matches = content.match(PATTERNS.presentation.detectSlides);
    return matches ? matches.length : 0;
}

/**
 * Extract arguments from saveProgress call
 * saveProgress('house', 'moduleId', { ... })
 */
function extractSaveProgressArgs(content) {
    const match = content.match(PATTERNS.presentation.saveProgressArgs);
    if (match) {
        return {
            house: match[1],
            moduleId: match[2]
        };
    }
    return null;
}

/**
 * Extract arguments from ProgressManager.completeModule call
 * ProgressManager.completeModule('moduleId', 'houseId', 'type', {...})
 */
function extractCompleteModuleArgs(content) {
    // More complex pattern for completeModule
    const pattern = /ProgressManager\.completeModule\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/;
    const match = content.match(pattern);
    if (match) {
        return {
            moduleId: match[1],
            houseId: match[2]
        };
    }
    return null;
}

/**
 * Extract arguments from ModuleProgress.complete call
 * ModuleProgress.complete('houseId', 'moduleId', {...})
 * or ModuleProgress.completeQuiz('houseId', 'quizId', score)
 */
function extractModuleProgressArgs(content) {
    const pattern = /ModuleProgress\.(?:complete|completeQuiz)\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/;
    const match = content.match(pattern);
    if (match) {
        return {
            houseId: match[1],
            moduleId: match[2]
        };
    }
    return null;
}

/**
 * Validate presentation configuration
 */
function validateConfig(result, filePath) {
    const config = result.config;
    const pathHouse = extractHouseFromPath(filePath);

    // TRACK-002: Presentation without progress tracking
    if (!config.tracksProgress && config.slideCount > 0) {
        result.issues.push({
            code: 'TRACK-002',
            severity: 'warning',
            type: 'presentation_no_tracking',
            message: 'Presentation has slides but no progress tracking',
            fix: 'Add saveProgress() call or ProgressManager.completeModule() to track completion'
        });
    }

    // SYNC-005: saveProgress house mismatch
    if (config.saveProgressHouse && pathHouse && config.saveProgressHouse !== pathHouse) {
        result.issues.push({
            code: 'SYNC-005',
            severity: 'warning',
            type: 'saveProgress_house_mismatch',
            message: `saveProgress house '${config.saveProgressHouse}' doesn't match path house '${pathHouse}'`,
            current: config.saveProgressHouse,
            expected: pathHouse,
            fix: `Change saveProgress first argument to '${pathHouse}'`
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
