/**
 * EduScan - Module Registry Generator
 *
 * Scans all content files and extracts moduleId from engine configurations.
 * Generates MODULE_REGISTRY.json mapping moduleId → file path.
 *
 * This enables:
 * 1. LearningPaths validation against known modules
 * 2. Future: runtime path resolution from moduleId only
 * 3. Duplicate moduleId detection
 *
 * Created: 2026-02-07 (architecture/module-registry branch)
 */

const fs = require('fs');
const path = require('path');

class ModuleRegistryGenerator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.rootPath = options.rootPath || './_app';
        this.outputPath = options.outputPath || './_tools/reports/MODULE_REGISTRY.json';

        // Engine patterns that contain moduleId
        this.enginePatterns = [
            // QuizEngine: { moduleId: 'xxx', ... }
            /QuizEngine\s*[.:]\s*(?:init|create|configure)?\s*\(?\s*\{[^}]*moduleId:\s*['"]([^'"]+)['"]/gi,
            // LabEngine.init({ moduleId: 'xxx' })
            /LabEngine\s*\.\s*init\s*\(\s*\{[^}]*moduleId:\s*['"]([^'"]+)['"]/gi,
            // AppletFrame.init({ moduleId: 'xxx' })
            /AppletFrame\s*\.\s*init\s*\(\s*\{[^}]*moduleId:\s*['"]([^'"]+)['"]/gi,
            // SlideEngine.init({ moduleId: 'xxx' })
            /SlideEngine\s*\.\s*(?:init|create)\s*\(\s*\{[^}]*moduleId:\s*['"]([^'"]+)['"]/gi,
            // PresentationEngine({ moduleId: 'xxx' })
            /PresentationEngine\s*\(\s*\{[^}]*moduleId:\s*['"]([^'"]+)['"]/gi,
            // Generic: moduleId: 'xxx' (fallback)
            /moduleId:\s*['"]([^'"]+)['"]/gi
        ];

        // Content type detection patterns
        this.typePatterns = {
            quiz: [/QuizEngine/i, /class="quiz-/i, /quiz-container/i],
            lab: [/LabEngine/i, /class="lab-/i, /lab-container/i, /LinuxTerminal/i],
            applet: [/AppletFrame/i, /class="applet-/i, /interactive-/i],
            presentation: [/SlideEngine/i, /PresentationEngine/i, /class="slide/i, /reveal\.js/i]
        };
    }

    /**
     * Scan all HTML files and generate the module registry
     * @returns {Object} Registry with modules and stats
     */
    generate() {
        const startTime = Date.now();

        const registry = {
            version: '1.0.0',
            generated: new Date().toISOString(),
            rootPath: this.rootPath,
            modules: {},
            stats: {
                totalFiles: 0,
                modulesFound: 0,
                duplicates: 0,
                noModuleId: 0,
                byType: {
                    quiz: 0,
                    lab: 0,
                    applet: 0,
                    presentation: 0,
                    unknown: 0
                },
                byHouse: {}
            },
            duplicates: [],    // Files with duplicate moduleIds
            orphans: [],       // Files with no moduleId (now should be empty with deriving)
            derivedCount: 0,   // How many moduleIds were derived from filename
            configCount: 0     // How many moduleIds came from config
        };

        // Find all HTML files
        const htmlFiles = this.findHtmlFiles(this.rootPath);
        registry.stats.totalFiles = htmlFiles.length;

        if (this.verbose) {
            console.log(`[REGISTRY] Scanning ${htmlFiles.length} HTML files...`);
        }

        for (const filePath of htmlFiles) {
            const result = this.extractModuleInfo(filePath);

            if (!result.moduleId) {
                registry.stats.noModuleId++;
                registry.orphans.push({
                    path: this.relativePath(filePath),
                    type: result.type,
                    house: result.house
                });
                continue;
            }

            // Check for duplicates
            if (registry.modules[result.moduleId]) {
                registry.stats.duplicates++;
                registry.duplicates.push({
                    moduleId: result.moduleId,
                    files: [
                        registry.modules[result.moduleId].path,
                        this.relativePath(filePath)
                    ]
                });

                if (this.verbose) {
                    console.log(`[REGISTRY] Duplicate moduleId: ${result.moduleId}`);
                }
                continue;
            }

            // Add to registry
            const relativePath = this.relativePath(filePath);
            registry.modules[result.moduleId] = {
                path: relativePath,
                type: result.type,
                house: result.house,
                title: result.title,
                source: result.moduleIdSource  // 'config' or 'derived'
            };

            registry.stats.modulesFound++;
            registry.stats.byType[result.type] = (registry.stats.byType[result.type] || 0) + 1;

            // Track config vs derived
            if (result.moduleIdSource === 'config') {
                registry.stats.configCount++;
            } else {
                registry.stats.derivedCount++;
            }

            if (result.house) {
                registry.stats.byHouse[result.house] = (registry.stats.byHouse[result.house] || 0) + 1;
            }
        }

        registry.stats.duration = Date.now() - startTime;

        if (this.verbose) {
            console.log(`[REGISTRY] Found ${registry.stats.modulesFound} modules in ${registry.stats.duration}ms`);
            console.log(`[REGISTRY] Duplicates: ${registry.stats.duplicates}, Orphans: ${registry.stats.noModuleId}`);
        }

        return registry;
    }

    /**
     * Generate and save to file
     * @returns {Object} Registry
     */
    generateAndSave() {
        const registry = this.generate();

        // Ensure output directory exists
        const outputDir = path.dirname(this.outputPath);
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Write registry file
        fs.writeFileSync(this.outputPath, JSON.stringify(registry, null, 2));

        if (this.verbose) {
            console.log(`[REGISTRY] Saved to: ${this.outputPath}`);
        }

        return registry;
    }

    /**
     * Find all HTML files recursively
     */
    findHtmlFiles(dir) {
        const files = [];

        const entries = fs.readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                // Skip node_modules, .git, etc.
                if (entry.name.startsWith('.') || entry.name === 'node_modules') {
                    continue;
                }
                files.push(...this.findHtmlFiles(fullPath));
            } else if (entry.isFile() && entry.name.endsWith('.html')) {
                files.push(fullPath);
            }
        }

        return files;
    }

    /**
     * Extract module info from a file
     */
    extractModuleInfo(filePath) {
        const content = fs.readFileSync(filePath, 'utf8');
        const filename = path.basename(filePath, '.html');

        const result = {
            moduleId: null,
            moduleIdSource: null,  // 'config' or 'derived'
            type: 'unknown',
            house: this.extractHouse(filePath),
            title: this.extractTitle(content)
        };

        // Try each engine pattern to find moduleId from config
        for (const pattern of this.enginePatterns) {
            // Reset lastIndex for global patterns
            pattern.lastIndex = 0;
            const match = pattern.exec(content);
            if (match && match[1]) {
                result.moduleId = match[1];
                result.moduleIdSource = 'config';
                break;
            }
        }

        // Detect content type from patterns or path
        result.type = this.detectContentType(filePath, content);

        // If no moduleId found in config, derive from filename
        if (!result.moduleId) {
            result.moduleId = this.deriveModuleId(filePath, result.type, result.house);
            result.moduleIdSource = 'derived';
        }

        return result;
    }

    /**
     * Detect content type from file path and content
     */
    detectContentType(filePath, content) {
        // First check path for type hints
        const pathLower = filePath.toLowerCase();
        if (pathLower.includes('/quizzes/') || pathLower.includes('-quiz.html')) {
            return 'quiz';
        }
        if (pathLower.includes('/labs/') || pathLower.includes('-lab.html')) {
            return 'lab';
        }
        if (pathLower.includes('/applets/')) {
            return 'applet';
        }
        if (pathLower.includes('/presentations/') || pathLower.includes('-presentation.html')) {
            return 'presentation';
        }

        // Fall back to content patterns
        for (const [type, patterns] of Object.entries(this.typePatterns)) {
            for (const pattern of patterns) {
                if (pattern.test(content)) {
                    return type;
                }
            }
        }

        return 'unknown';
    }

    /**
     * Derive moduleId from filename when not set in config
     * Convention: {house}-{path-segments}-{filename} for uniqueness
     * Short filenames include parent folder(s) to avoid collisions
     */
    deriveModuleId(filePath, type, house) {
        let filename = path.basename(filePath, '.html');

        // Filenames that are likely to have duplicates across folders
        const shortOrGeneric = filename.length <= 15 ||
            ['index', 'quiz', 'lab', 'presentation', 'intro', 'main', 'home',
             'gui-lab', 'ps-lab', 'evaluation', 'simulation'].includes(filename.toLowerCase());

        // For short/generic filenames, include parent folder(s) in the moduleId
        if (shortOrGeneric) {
            const parts = filePath.replace(/\\/g, '/').split('/');
            // Folders to skip when building path-based ID
            const skipFolders = ['houses', 'modules', 'courses', 'applets', 'presentations', 'labs', 'quizzes', '_app'];
            const meaningfulParts = [];

            // Walk up from the file, collecting meaningful folder names
            for (let i = parts.length - 2; i >= 0; i--) {
                const part = parts[i].toLowerCase();
                if (skipFolders.includes(part) || part === house) continue;
                if (part.length < 2) continue;  // Skip single chars

                meaningfulParts.unshift(part);
                // Take at most 3 parent folders for full uniqueness
                if (meaningfulParts.length >= 3) break;
            }

            if (meaningfulParts.length > 0) {
                filename = meaningfulParts.join('-') + '-' + filename;
            }
        }

        // Clean up the filename
        filename = filename
            .toLowerCase()
            .replace(/[_\s]+/g, '-')     // Underscores and spaces to dashes
            .replace(/[^a-z0-9-]/g, '')  // Remove special chars
            .replace(/-+/g, '-')         // Collapse multiple dashes
            .replace(/^-|-$/g, '');      // Trim leading/trailing dashes

        // For house content, prefix with house name if not already present
        if (house && !filename.startsWith(house + '-')) {
            return `${house}-${filename}`;
        }

        return filename;
    }

    /**
     * Extract house from file path
     */
    extractHouse(filePath) {
        const houseMatch = filePath.match(/houses\/([^/]+)\//);
        return houseMatch ? houseMatch[1] : null;
    }

    /**
     * Extract title from HTML content
     */
    extractTitle(content) {
        const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
        return titleMatch ? titleMatch[1].trim() : null;
    }

    /**
     * Convert absolute path to relative (from rootPath)
     */
    relativePath(filePath) {
        return path.relative(path.resolve(this.rootPath), filePath).replace(/\\/g, '/');
    }

    /**
     * Load existing registry from file
     */
    load() {
        if (!fs.existsSync(this.outputPath)) {
            return null;
        }
        return JSON.parse(fs.readFileSync(this.outputPath, 'utf8'));
    }

    /**
     * Lookup a moduleId in the registry
     * @param {string} moduleId
     * @returns {Object|null} Module info or null
     */
    lookup(moduleId) {
        const registry = this.load();
        if (!registry) return null;
        return registry.modules[moduleId] || null;
    }
}

module.exports = ModuleRegistryGenerator;
