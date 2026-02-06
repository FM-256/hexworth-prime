/**
 * EduScan - Orphan Detector
 *
 * Detects two types of orphans:
 * 1. Registry Orphans (REG-ORPHAN-001): Declared in registry but file missing on disk
 * 2. Filesystem Orphans (FS-ORPHAN-001): Files exist but unreachable from entry points
 *
 * Uses a reachability graph crawl to identify dead content.
 */

const fs = require('fs');
const path = require('path');

class OrphanDetector {
    constructor(options = {}) {
        this.rootPath = options.rootPath || './_app';
        this.verbose = options.verbose || false;
        this.deep = options.deep || false; // Deep = full reachability crawl

        // Entry points for reachability graph
        this.entryPoints = [
            'index.html',
            'dashboard.html',
            'houses/web/index.html',
            'houses/shield/index.html',
            'houses/forge/index.html',
            'houses/script/index.html',
            'houses/cloud/index.html',
            'houses/code/index.html',
            'houses/key/index.html',
            'houses/eye/index.html'
        ];

        // Patterns to extract references from files
        this.referencePatterns = [
            // HTML href attributes
            /href\s*=\s*["']([^"'#]+\.html?)["']/gi,
            // JavaScript navigateTo calls
            /navigateTo\s*\(\s*["']([^"']+)["']/gi,
            // PageTransition.navigateTo
            /PageTransition\.navigateTo\s*\(\s*["']([^"']+)["']/gi,
            // window.location assignments
            /window\.location(?:\.href)?\s*=\s*["']([^"']+)["']/gi,
            // Component paths in objects
            /(?:presentation|lab|quiz|applet|tool):\s*["']([^"']+)["']/gi,
            // Generic path references
            /['"](?:houses\/[^'"]+\.html)["']/gi,
            // src attributes for scripts/iframes
            /src\s*=\s*["']([^"']+\.html?)["']/gi
        ];

        // Folders that indicate archive/legacy content
        this.archiveFolders = ['_archive', 'archive', 'legacy', 'old', 'deprecated', 'backup'];
        this.draftIndicators = ['draft', 'wip', 'test', 'temp', 'scratch'];

        // Track reachability
        this.reachable = new Set();
        this.crawled = new Set();
    }

    /**
     * Detect all orphans
     * @param {Array} contentFiles - Array of content file objects from parser
     * @param {Object} registry - Parsed registry object
     * @returns {Object} Orphan detection results
     */
    detect(contentFiles, registry) {
        const results = {
            registryOrphans: [],    // Declared but missing
            filesystemOrphans: [],  // Exist but unreachable
            deadPaths: [],          // Directories with no inbound references
            issues: [],
            summary: {
                registryOrphans: 0,
                filesystemOrphans: 0,
                deadPaths: 0
            }
        };

        // Phase 1: Registry Orphans (quick, always run)
        if (registry && registry.entries) {
            this.detectRegistryOrphans(registry, results);
        }

        // Phase 2: Filesystem Orphans (deep crawl if enabled)
        if (this.deep) {
            this.buildReachabilityGraph();
            this.detectFilesystemOrphans(contentFiles, results);
            this.detectDeadPaths(results);
        }

        // Update summary
        results.summary.registryOrphans = results.registryOrphans.length;
        results.summary.filesystemOrphans = results.filesystemOrphans.length;
        results.summary.deadPaths = results.deadPaths.length;

        return results;
    }

    /**
     * Phase 1: Detect registry entries with no matching file
     */
    detectRegistryOrphans(registry, results) {
        if (this.verbose) {
            console.log('[ORPHAN] Checking registry entries for missing files...');
        }

        for (const entry of registry.entries) {
            // Extract all component paths from the entry
            const paths = this.extractPathsFromEntry(entry);

            for (const componentPath of paths) {
                // Skip external URLs (http, https, //)
                if (this.isExternalUrl(componentPath)) {
                    continue;
                }

                const absolutePath = path.resolve(this.rootPath, componentPath);

                if (!fs.existsSync(absolutePath)) {
                    const orphan = {
                        entryId: entry.id,
                        declaredPath: componentPath,
                        absolutePath,
                        type: entry.type || 'unknown',
                        house: entry.house || this.inferHouse(componentPath)
                    };

                    results.registryOrphans.push(orphan);

                    results.issues.push({
                        code: 'REG-ORPHAN-001',
                        severity: 'critical',
                        category: 'registry',
                        message: `Registry declares '${entry.id}' but file is missing: ${componentPath}`,
                        entryId: entry.id,
                        declaredPath: componentPath,
                        fix: 'Either create the missing file or remove the registry entry',
                        action: 'create_or_remove'
                    });
                }
            }
        }

        if (this.verbose) {
            console.log(`[ORPHAN] Found ${results.registryOrphans.length} registry orphans`);
        }
    }

    /**
     * Check if a path is an external URL
     */
    isExternalUrl(pathStr) {
        if (!pathStr) return false;
        return pathStr.startsWith('http://') ||
               pathStr.startsWith('https://') ||
               pathStr.startsWith('//');
    }

    /**
     * Extract all file paths from a registry entry
     */
    extractPathsFromEntry(entry) {
        const paths = [];

        // Direct path property
        if (entry.path) {
            paths.push(entry.path);
        }

        // Components object
        if (entry.raw) {
            const componentPattern = /(?:presentation|lab|quiz|applet|tool|index):\s*["']([^"']+)["']/gi;
            let match;
            while ((match = componentPattern.exec(entry.raw)) !== null) {
                paths.push(match[1]);
            }
        }

        return paths;
    }

    /**
     * Phase 2: Build reachability graph from entry points
     */
    buildReachabilityGraph() {
        if (this.verbose) {
            console.log('[ORPHAN] Building reachability graph (deep crawl)...');
        }

        this.reachable.clear();
        this.crawled.clear();

        // Start from each entry point
        for (const entry of this.entryPoints) {
            const entryPath = path.resolve(this.rootPath, entry);
            if (fs.existsSync(entryPath)) {
                this.crawlFile(entryPath);
            }
        }

        // Also crawl content-registry.js for declared paths
        const registryPath = path.resolve(this.rootPath, 'config/content-registry.js');
        if (fs.existsSync(registryPath)) {
            this.crawlFile(registryPath);
        }

        if (this.verbose) {
            console.log(`[ORPHAN] Reachability graph: ${this.reachable.size} files reachable`);
        }
    }

    /**
     * Recursively crawl a file for references
     */
    crawlFile(filePath) {
        const normalizedPath = this.normalizePath(filePath);

        // Skip if already crawled
        if (this.crawled.has(normalizedPath)) {
            return;
        }
        this.crawled.add(normalizedPath);

        // Mark as reachable
        this.reachable.add(normalizedPath);

        // Read file content
        let content;
        try {
            content = fs.readFileSync(filePath, 'utf8');
        } catch (err) {
            return; // Can't read, skip
        }

        // Extract all references
        const references = this.extractReferences(content, filePath);

        // Crawl each reference
        for (const ref of references) {
            const refPath = this.resolveReference(ref, filePath);
            if (refPath && fs.existsSync(refPath)) {
                this.crawlFile(refPath);
            }
        }
    }

    /**
     * Extract file references from content
     */
    extractReferences(content, sourceFile) {
        const references = new Set();

        for (const pattern of this.referencePatterns) {
            // Reset regex lastIndex
            pattern.lastIndex = 0;

            let match;
            while ((match = pattern.exec(content)) !== null) {
                let ref = match[1] || match[0];

                // Clean up the reference
                ref = ref.replace(/^['"]|['"]$/g, '');

                // Skip external URLs, anchors, and data URIs
                if (ref.startsWith('http') || ref.startsWith('//') ||
                    ref.startsWith('#') || ref.startsWith('data:') ||
                    ref.startsWith('javascript:') || ref.startsWith('mailto:')) {
                    continue;
                }

                // Skip template variables
                if (ref.includes('${') || ref.includes('{{')) {
                    continue;
                }

                references.add(ref);
            }
        }

        return Array.from(references);
    }

    /**
     * Resolve a reference path relative to source file
     */
    resolveReference(ref, sourceFile) {
        // Handle relative paths
        if (ref.startsWith('./') || ref.startsWith('../')) {
            return path.resolve(path.dirname(sourceFile), ref);
        }

        // Handle paths starting with houses/, config/, etc.
        if (ref.startsWith('houses/') || ref.startsWith('config/') ||
            ref.startsWith('components/') || ref.startsWith('utils/')) {
            return path.resolve(this.rootPath, ref);
        }

        // Handle absolute-ish paths (from _app root)
        if (ref.includes('/')) {
            return path.resolve(this.rootPath, ref);
        }

        // Same directory
        return path.resolve(path.dirname(sourceFile), ref);
    }

    /**
     * Phase 2b: Detect filesystem orphans
     */
    detectFilesystemOrphans(contentFiles, results) {
        if (this.verbose) {
            console.log('[ORPHAN] Checking content files for reachability...');
        }

        for (const file of contentFiles) {
            const normalizedPath = this.normalizePath(
                path.resolve(this.rootPath, '..', file.path)
            );

            // Also try without _app prefix
            const altPath = this.normalizePath(
                path.resolve(this.rootPath, file.path.replace(/^_app\//, ''))
            );

            const isReachable = this.reachable.has(normalizedPath) ||
                               this.reachable.has(altPath) ||
                               this.isPathReachable(file.path);

            if (!isReachable) {
                const severity = this.categorizeSeverity(file.path);
                const category = this.categorizeOrphan(file.path);

                const orphan = {
                    path: file.path,
                    contentType: file.contentType,
                    house: file.house,
                    severity,
                    category,
                    nearestParent: this.findNearestParentIndex(file.path),
                    recommendation: this.getRecommendation(file.path, category)
                };

                results.filesystemOrphans.push(orphan);

                results.issues.push({
                    code: 'FS-ORPHAN-001',
                    severity,
                    category: 'reachability',
                    message: `Content file is unreachable: ${file.path}`,
                    file: file.path,
                    contentType: file.contentType,
                    orphanCategory: category,
                    nearestParent: orphan.nearestParent,
                    fix: orphan.recommendation,
                    action: this.getAction(category)
                });
            }
        }

        if (this.verbose) {
            console.log(`[ORPHAN] Found ${results.filesystemOrphans.length} filesystem orphans`);
        }
    }

    /**
     * Check if a path is reachable (fuzzy matching)
     */
    isPathReachable(filePath) {
        const normalized = filePath.toLowerCase()
            .replace(/\\/g, '/')
            .replace(/^_app\//, '');

        for (const reachable of this.reachable) {
            if (reachable.toLowerCase().includes(normalized) ||
                normalized.includes(reachable.toLowerCase())) {
                return true;
            }
        }
        return false;
    }

    /**
     * Phase 2c: Detect dead paths (directories with no references)
     */
    detectDeadPaths(results) {
        if (this.verbose) {
            console.log('[ORPHAN] Checking for dead content directories...');
        }

        // Find all content directories
        const contentDirs = this.findContentDirectories();

        for (const dir of contentDirs) {
            const hasReachableContent = this.directoryHasReachableContent(dir);

            if (!hasReachableContent) {
                const deadPath = {
                    directory: dir,
                    files: this.listFilesInDirectory(dir),
                    severity: this.categorizeDirectorySeverity(dir),
                    recommendation: 'Consider archiving or removing this directory'
                };

                results.deadPaths.push(deadPath);

                results.issues.push({
                    code: 'FS-DEADPATH-001',
                    severity: deadPath.severity,
                    category: 'reachability',
                    message: `Content directory has no inbound references: ${dir}`,
                    directory: dir,
                    fileCount: deadPath.files.length,
                    fix: deadPath.recommendation,
                    action: 'archive_or_remove'
                });
            }
        }

        if (this.verbose) {
            console.log(`[ORPHAN] Found ${results.deadPaths.length} dead paths`);
        }
    }

    /**
     * Find all directories that look like content zones
     */
    findContentDirectories() {
        const dirs = [];
        const patterns = [
            /houses\/\w+\/modules\//,
            /houses\/\w+\/courses\//,
            /houses\/\w+\/labs\//,
            /houses\/\w+\/applets\//,
            /houses\/\w+\/presentations\//
        ];

        const walk = (dir) => {
            if (!fs.existsSync(dir)) return;

            try {
                const entries = fs.readdirSync(dir, { withFileTypes: true });
                for (const entry of entries) {
                    if (entry.isDirectory()) {
                        const fullPath = path.join(dir, entry.name);
                        const relativePath = path.relative(this.rootPath, fullPath);

                        // Check if it matches content zone patterns
                        for (const pattern of patterns) {
                            if (pattern.test(relativePath)) {
                                dirs.push(relativePath);
                                break;
                            }
                        }

                        walk(fullPath);
                    }
                }
            } catch (err) {
                // Skip inaccessible directories
            }
        };

        walk(this.rootPath);
        return dirs;
    }

    /**
     * Check if a directory has any reachable content
     */
    directoryHasReachableContent(dir) {
        const absoluteDir = path.resolve(this.rootPath, dir);

        for (const reachable of this.reachable) {
            if (reachable.startsWith(absoluteDir) ||
                reachable.includes(dir.replace(/\\/g, '/'))) {
                return true;
            }
        }
        return false;
    }

    /**
     * List files in a directory
     */
    listFilesInDirectory(dir) {
        const absoluteDir = path.resolve(this.rootPath, dir);
        const files = [];

        try {
            const entries = fs.readdirSync(absoluteDir, { withFileTypes: true });
            for (const entry of entries) {
                if (entry.isFile()) {
                    files.push(entry.name);
                }
            }
        } catch (err) {
            // Directory doesn't exist or inaccessible
        }

        return files;
    }

    /**
     * Categorize severity based on file location
     */
    categorizeSeverity(filePath) {
        const lower = filePath.toLowerCase();

        // Archive/legacy = low severity
        for (const folder of this.archiveFolders) {
            if (lower.includes(`/${folder}/`) || lower.includes(`\\${folder}\\`)) {
                return 'low';
            }
        }

        // Draft/WIP = low severity
        for (const indicator of this.draftIndicators) {
            if (lower.includes(indicator)) {
                return 'low';
            }
        }

        // Live house content = high severity
        if (/houses\/\w+\/(modules|labs|applets|presentations|courses)/.test(lower)) {
            return 'high';
        }

        // Default = medium
        return 'medium';
    }

    /**
     * Categorize directory severity
     */
    categorizeDirectorySeverity(dir) {
        const lower = dir.toLowerCase();

        for (const folder of this.archiveFolders) {
            if (lower.includes(folder)) {
                return 'low';
            }
        }

        return 'medium';
    }

    /**
     * Categorize orphan type
     */
    categorizeOrphan(filePath) {
        const lower = filePath.toLowerCase();

        // Check if it's under an archive folder
        for (const folder of this.archiveFolders) {
            if (lower.includes(`/${folder}/`)) {
                return 'archived';
            }
        }

        // Check for draft indicators
        for (const indicator of this.draftIndicators) {
            if (lower.includes(indicator)) {
                return 'draft';
            }
        }

        // Check if it's in a content directory but just not linked
        if (/houses\/\w+\//.test(lower)) {
            return 'unlinked';
        }

        return 'unknown';
    }

    /**
     * Find the nearest parent index file
     */
    findNearestParentIndex(filePath) {
        let dir = path.dirname(filePath);

        while (dir && dir !== '.' && dir !== '/') {
            const indexPath = path.join(dir, 'index.html');
            const absoluteIndex = path.resolve(this.rootPath, '..', indexPath);

            if (fs.existsSync(absoluteIndex)) {
                return indexPath;
            }

            dir = path.dirname(dir);
        }

        return null;
    }

    /**
     * Get recommendation based on category
     */
    getRecommendation(filePath, category) {
        switch (category) {
            case 'archived':
                return 'Already in archive folder - consider deletion if no longer needed';
            case 'draft':
                return 'Draft content - finish and link, or delete if abandoned';
            case 'unlinked':
                return 'Register in content-registry.js and link from house index or course page';
            default:
                return 'Investigate and either link, archive, or delete';
        }
    }

    /**
     * Get action keyword
     */
    getAction(category) {
        switch (category) {
            case 'archived':
                return 'delete';
            case 'draft':
                return 'finish_or_delete';
            case 'unlinked':
                return 'register_and_link';
            default:
                return 'investigate';
        }
    }

    /**
     * Infer house from path
     */
    inferHouse(filePath) {
        const match = filePath.match(/houses\/(\w+)\//);
        return match ? match[1] : null;
    }

    /**
     * Normalize path for comparison
     */
    normalizePath(filePath) {
        return path.resolve(filePath).replace(/\\/g, '/');
    }
}

module.exports = OrphanDetector;
