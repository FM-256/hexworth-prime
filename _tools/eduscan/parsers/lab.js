/**
 * EduScan - Lab Parser
 *
 * Detects lab/hands-on content with terminals, code editors, etc.
 */

const { PATTERNS, extractFirst, test } = require('../utils/patterns');

/**
 * Parse file content for lab indicators
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

    // Check for lab indicators
    const hasLabEngine = test(content, PATTERNS.lab.detectLabEngine);
    const hasLabClass = test(content, PATTERNS.lab.detectLabClass);
    const hasTerminal = test(content, PATTERNS.lab.detectTerminal);
    const hasCodeEditor = test(content, PATTERNS.lab.detectCodeEditor);
    const hasSandbox = test(content, PATTERNS.lab.detectSandbox);

    // Also check path for lab indicators
    const pathLower = filePath.toLowerCase();
    const isInLabsDir = pathLower.includes('/labs/');
    const hasLabInName = pathLower.includes('lab');

    // Determine if this is a lab
    const isLab = hasLabEngine || hasLabClass ||
                  (hasTerminal && (isInLabsDir || hasLabInName)) ||
                  (hasCodeEditor && (isInLabsDir || hasLabInName));

    if (!isLab) {
        return result;
    }

    result.detected = true;

    // Extract configuration
    result.config = {
        type: 'lab',
        engine: hasLabEngine ? 'LabEngine' : 'custom',
        hasTerminal,
        hasCodeEditor,
        hasSandbox,
        moduleId: extractFirst(content, PATTERNS.lab.labModuleId),
        houseId: extractFirst(content, PATTERNS.lab.labHouseId)
    };

    // Check for progress tracking
    result.config.tracksProgress = checkProgressTracking(content);

    // Validate and collect issues
    validateConfig(result, filePath);

    return result;
}

/**
 * Check if lab has progress tracking
 */
function checkProgressTracking(content) {
    // Check for various progress tracking patterns
    return test(content, PATTERNS.presentation.detectProgressManager) ||
           test(content, PATTERNS.presentation.detectSaveProgress) ||
           /trackProgress\s*:\s*true/.test(content) ||
           /completeModule|markComplete|saveProgress/.test(content);
}

/**
 * Validate lab configuration
 */
function validateConfig(result, filePath) {
    const config = result.config;
    const pathHouse = extractHouseFromPath(filePath);

    // TRACK-003: Lab without progress tracking
    if (!config.tracksProgress) {
        result.issues.push({
            code: 'TRACK-003',
            severity: 'warning',
            type: 'lab_no_tracking',
            message: 'Lab has no visible progress tracking mechanism',
            fix: 'Add ProgressManager.completeModule() call to track lab completion'
        });
    }

    // CFG-003: Lab missing moduleId
    if (!config.moduleId && config.engine === 'LabEngine') {
        result.issues.push({
            code: 'CFG-003',
            severity: 'warning',
            type: 'lab_missing_moduleId',
            message: 'Lab uses LabEngine but has no moduleId configured',
            fix: 'Add moduleId to LabEngine configuration'
        });
    }

    // SYNC-006: houseId mismatch for lab
    if (config.houseId && pathHouse && config.houseId !== pathHouse) {
        result.issues.push({
            code: 'SYNC-006',
            severity: 'warning',
            type: 'lab_houseId_mismatch',
            message: `Lab houseId '${config.houseId}' doesn't match path house '${pathHouse}'`,
            current: config.houseId,
            expected: pathHouse,
            fix: `Change houseId to '${pathHouse}'`
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
