/**
 * EduScan - Applet Parser
 *
 * Detects interactive tools, visualizations, simulations.
 */

const { PATTERNS, extractFirst, test } = require('../utils/patterns');

/**
 * Parse file content for applet/interactive tool indicators
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

    // Check for applet indicators
    const hasCanvas = test(content, PATTERNS.applet.detectCanvas);
    const hasSVG = test(content, PATTERNS.applet.detectSVG);
    const hasD3 = test(content, PATTERNS.applet.detectD3);
    const hasChart = test(content, PATTERNS.applet.detectChart);
    const hasVisualization = test(content, PATTERNS.applet.detectVisualization);
    const hasToolExplore = test(content, PATTERNS.applet.detectToolExplore);

    // Also check path for applet indicators
    const pathLower = filePath.toLowerCase();
    const isInAppletsDir = pathLower.includes('/applets/');
    const isInToolsDir = pathLower.includes('/tools/');
    const hasAppletInName = pathLower.includes('applet') ||
                            pathLower.includes('simulator') ||
                            pathLower.includes('visualiz');

    // Determine if this is an applet
    // Must have interactive elements AND be in right location OR have clear naming
    const hasInteractiveElements = hasCanvas || hasSVG || hasD3 || hasChart;
    const isInRightLocation = isInAppletsDir || isInToolsDir || hasAppletInName;

    const isApplet = (hasInteractiveElements && isInRightLocation) ||
                     hasVisualization ||
                     hasToolExplore;

    if (!isApplet) {
        return result;
    }

    result.detected = true;

    // Determine applet subtype
    let subtype = 'interactive';
    if (hasChart || hasD3) subtype = 'visualization';
    if (pathLower.includes('simulator')) subtype = 'simulator';
    if (pathLower.includes('calculator')) subtype = 'calculator';
    if (pathLower.includes('converter')) subtype = 'converter';

    // Extract configuration
    result.config = {
        type: 'applet',
        subtype,
        hasCanvas,
        hasSVG,
        hasD3,
        hasChart,
        libraries: detectLibraries(content)
    };

    // Check for progress tracking
    result.config.tracksProgress = hasToolExplore ||
                                   test(content, PATTERNS.presentation.detectProgressManager);

    // Extract module info if present
    const moduleMatch = content.match(/moduleId:\s*['"]([^'"]+)['"]/);
    if (moduleMatch) {
        result.config.moduleId = moduleMatch[1];
    }

    const houseMatch = content.match(/houseId:\s*['"]([^'"]+)['"]/);
    if (houseMatch) {
        result.config.houseId = houseMatch[1];
    }

    // Validate and collect issues
    validateConfig(result, filePath);

    return result;
}

/**
 * Detect JavaScript libraries used
 */
function detectLibraries(content) {
    const libraries = [];

    if (/d3\./.test(content) || /d3-/.test(content)) libraries.push('D3.js');
    if (/Chart\./.test(content) || /new Chart/.test(content)) libraries.push('Chart.js');
    if (/three\./.test(content) || /THREE\./.test(content)) libraries.push('Three.js');
    if (/p5\./.test(content)) libraries.push('p5.js');
    if (/anime\./.test(content) || /anime\(/.test(content)) libraries.push('Anime.js');
    if (/gsap\./.test(content) || /gsap\(/.test(content)) libraries.push('GSAP');
    if (/Phaser\./.test(content)) libraries.push('Phaser');
    if (/fabric\./.test(content)) libraries.push('Fabric.js');
    if (/konva\./.test(content) || /Konva\./.test(content)) libraries.push('Konva');

    return libraries;
}

/**
 * Validate applet configuration
 */
function validateConfig(result, filePath) {
    const config = result.config;

    // TRACK-004: Applet without progress tracking
    if (!config.tracksProgress) {
        result.issues.push({
            code: 'TRACK-004',
            severity: 'info',
            type: 'applet_no_tracking',
            message: 'Applet has no progress tracking (may be intentional for tools)',
            fix: 'Add ProgressManager.completeModule() if completion should be tracked'
        });
    }

    // CFG-004: Applet using deprecated library
    if (config.libraries.includes('jQuery')) {
        result.issues.push({
            code: 'CFG-004',
            severity: 'info',
            type: 'deprecated_library',
            message: 'Applet uses jQuery which is deprecated in this project',
            fix: 'Consider migrating to vanilla JavaScript'
        });
    }
}

module.exports = { parse };
