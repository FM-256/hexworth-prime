/**
 * EduScan - Regex Patterns for Content Detection
 *
 * These patterns identify content types and extract configuration
 * from HTML and JavaScript files.
 */

const PATTERNS = {
    // ═══════════════════════════════════════════════════════════════
    // QUIZ DETECTION
    // ═══════════════════════════════════════════════════════════════
    quiz: {
        // Detect QuizEngine instantiation
        detect: /new\s+QuizEngine\s*\(\s*\{/,

        // Extract configuration values
        moduleId: /moduleId:\s*['"]([^'"]+)['"]/,
        houseId: /houseId:\s*['"]([^'"]+)['"]/,
        trackProgress: /trackProgress:\s*(true|false)/,
        passingScore: /passingScore:\s*(\d+)/,
        title: /title:\s*['"]([^'"]+)['"]/,
        achievement: /achievement:\s*['"]([^'"]+)['"]/,
        timeLimit: /timeLimit:\s*(\d+|null)/,

        // Count questions (find questions array, count objects)
        questionsArray: /questions:\s*\[([\s\S]*?)\]\s*,?\s*(?:onComplete|$|\})/,
        questionObject: /\{\s*question:/g
    },

    // ═══════════════════════════════════════════════════════════════
    // PRESENTATION DETECTION
    // ═══════════════════════════════════════════════════════════════
    presentation: {
        // Detect saveProgress function call
        detectSaveProgress: /saveProgress\s*\(/,

        // Detect ProgressManager usage
        detectProgressManager: /ProgressManager\.completeModule\s*\(/,

        // Detect slide structure
        detectSlides: /class\s*=\s*["'][^"']*slide[^"']*["']/gi,

        // Extract configuration from saveProgress call
        // saveProgress('house', 'moduleId', { ... })
        saveProgressArgs: /saveProgress\s*\(\s*['"]([^'"]+)['"]\s*,\s*['"]([^'"]+)['"]/,

        // Detect PresentationEngine
        detectPresentationEngine: /new\s+PresentationEngine|PresentationEngine\.init/
    },

    // ═══════════════════════════════════════════════════════════════
    // LAB DETECTION
    // ═══════════════════════════════════════════════════════════════
    lab: {
        // Detect lab indicators
        detectLabEngine: /new\s+LabEngine\s*\(/,
        detectLabClass: /class\s*=\s*["'][^"']*lab-container[^"']*["']/i,
        detectTerminal: /class\s*=\s*["'][^"']*terminal[^"']*["']/i,

        // Lab-specific patterns
        detectCodeEditor: /class\s*=\s*["'][^"']*code-editor[^"']*["']/i,
        detectSandbox: /sandbox|iframe.*srcdoc/i,

        // Extract lab config
        labModuleId: /labId:\s*['"]([^'"]+)['"]/,
        labHouseId: /houseId:\s*['"]([^'"]+)['"]/
    },

    // ═══════════════════════════════════════════════════════════════
    // APPLET DETECTION
    // ═══════════════════════════════════════════════════════════════
    applet: {
        // Interactive tool indicators
        detectCanvas: /<canvas/i,
        detectSVG: /<svg[^>]*class/i,
        detectD3: /d3\.(select|json|csv)/,
        detectChart: /new\s+Chart\s*\(|Chart\.js/,
        detectVisualization: /visualization|simulator|interactive/i,

        // Tool tracking
        detectToolExplore: /ProgressManager\.completeModule.*['"]tool['"]/
    },

    // ═══════════════════════════════════════════════════════════════
    // A+ CORE DETECTION (Special case)
    // ═══════════════════════════════════════════════════════════════
    aplusCore: {
        // Detect A+ Core 1/2 quiz patterns
        detectCore1: /aplus-core1-progress|core1.*quiz/i,
        detectCore2: /aplus-core2-progress|core2.*quiz/i,

        // Extract chapter
        chapterMatch: /ch(\d{2})/i,

        // Storage key patterns
        storageCore1: /localStorage\.(get|set)Item\s*\(\s*['"]aplus-core1-progress['"]/,
        storageCore2: /localStorage\.(get|set)Item\s*\(\s*['"]aplus-core2-progress['"]/
    },

    // ═══════════════════════════════════════════════════════════════
    // GENERAL PATTERNS
    // ═══════════════════════════════════════════════════════════════
    general: {
        // HTML title extraction
        htmlTitle: /<title>([^<]+)<\/title>/i,

        // Script src detection
        scriptSrc: /<script[^>]+src\s*=\s*["']([^"']+)["']/gi,

        // Component includes
        componentInclude: /src\s*=\s*["'][^"']*components\/([^"']+)["']/gi,

        // House detection from path
        housePath: /houses\/(\w+)\//,

        // Course detection
        coursePath: /courses\/([^/]+)\//,

        // Module path pattern
        modulePath: /modules\/([^/]+)\//
    },

    // ═══════════════════════════════════════════════════════════════
    // VALIDATION PATTERNS
    // ═══════════════════════════════════════════════════════════════
    validation: {
        // Valid house names
        validHouses: /^(web|shield|forge|script|cloud|code|key|eye)$/,

        // moduleId should NOT have these patterns
        badModuleIdPrefix: /^(web|shield|forge|script|cloud|code|key|eye)-/,
        badModuleIdSuffix: /-quiz$/,

        // contentId format (for assignment matching)
        contentIdFormat: /^(web|shield|forge|script|cloud|code|key|eye)-(.+)$/
    }
};

/**
 * Extract all matches for a pattern
 */
function extractAll(content, pattern) {
    const matches = [];
    let match;
    const regex = new RegExp(pattern.source, pattern.flags || 'g');
    while ((match = regex.exec(content)) !== null) {
        matches.push(match[1] || match[0]);
    }
    return matches;
}

/**
 * Extract first match for a pattern
 */
function extractFirst(content, pattern) {
    const match = content.match(pattern);
    return match ? (match[1] || match[0]) : null;
}

/**
 * Test if content matches a pattern
 */
function test(content, pattern) {
    return pattern.test(content);
}

module.exports = {
    PATTERNS,
    extractAll,
    extractFirst,
    test
};
