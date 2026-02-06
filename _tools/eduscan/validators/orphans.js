/**
 * EduScan - Orphan Detector (Phase 3)
 *
 * Detects orphaned content with detailed reason codes:
 * 1. Registry Orphans (REG-ORPHAN-001): Declared in registry but file missing on disk
 * 2. Filesystem Orphans (FS-ORPHAN-001): Files exist but unreachable from entry points
 * 3. Dead Paths (FS-DEADPATH-001): Entire directories with no inbound references
 *
 * Reason Codes for FS-ORPHAN-001:
 * - NOT-IN-REGISTRY: File not declared in content-registry.js
 * - NOT-LINKED: File not linked from any crawled page
 * - ROUTER-ONLY: Only referenced dynamically (in registry but not linked)
 * - PATH-MISMATCH: Case sensitivity or path format issues
 * - LIFECYCLE-ARCHIVE: Marked as archived via directive
 * - LIFECYCLE-DRAFT: Marked as draft via directive
 * - ENTRYPOINT-MISSING: Would be reachable but entry point is missing
 */

const fs = require('fs');
const path = require('path');

// Reason code constants
const REASON = {
    NOT_IN_REGISTRY: 'NOT-IN-REGISTRY',
    NOT_LINKED: 'NOT-LINKED',
    ROUTER_ONLY: 'ROUTER-ONLY',
    PATH_MISMATCH: 'PATH-MISMATCH',
    LIFECYCLE_ARCHIVE: 'LIFECYCLE-ARCHIVE',
    LIFECYCLE_DRAFT: 'LIFECYCLE-DRAFT',
    ENTRYPOINT_MISSING: 'ENTRYPOINT-MISSING'
};

class OrphanDetector {
    constructor(options = {}) {
        this.rootPath = options.rootPath || './_app';
        this.verbose = options.verbose || false;
        this.deep = options.deep || false;

        // Reachability mode: 'links' (default) or 'links+registry'
        this.reachabilityMode = options.reachabilityMode || 'links';

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
        this.reachable = new Set();           // Files reachable via links
        this.registryPaths = new Set();       // Files declared in registry
        this.crawled = new Set();
        this.linkedFrom = new Map();          // Track where each file is linked from
        this.lifecycleDirectives = new Map(); // Track lifecycle directives per file
    }

    /**
     * Detect all orphans
     * @param {Array} contentFiles - Array of content file objects from parser
     * @param {Object} registry - Parsed registry object
     * @returns {Object} Orphan detection results
     */
    detect(contentFiles, registry) {
        const results = {
            registryOrphans: [],
            filesystemOrphans: [],
            deadPaths: [],
            issues: [],
            summary: {
                registryOrphans: 0,
                filesystemOrphans: 0,
                deadPaths: 0,
                byReason: {}
            }
        };

        // Build registry paths set
        if (registry && registry.entries) {
            this.buildRegistryPathsSet(registry);
        }

        // Phase 1: Registry Orphans (quick, always run)
        if (registry && registry.entries) {
            this.detectRegistryOrphans(registry, results);
        }

        // Phase 2: Filesystem Orphans (deep crawl if enabled)
        if (this.deep) {
            // Extract lifecycle directives from content files
            this.extractLifecycleDirectives(contentFiles);

            // Build reachability graph
            this.buildReachabilityGraph(registry);

            // Detect orphans with reason codes
            this.detectFilesystemOrphans(contentFiles, registry, results);
            this.detectDeadPaths(results);
        }

        // Update summary
        results.summary.registryOrphans = results.registryOrphans.length;
        results.summary.filesystemOrphans = results.filesystemOrphans.length;
        results.summary.deadPaths = results.deadPaths.length;

        // Count by reason
        for (const orphan of results.filesystemOrphans) {
            const reason = orphan.reason || 'UNKNOWN';
            results.summary.byReason[reason] = (results.summary.byReason[reason] || 0) + 1;
        }

        return results;
    }

    /**
     * Build a Set of all paths declared in registry
     */
    buildRegistryPathsSet(registry) {
        this.registryPaths.clear();

        for (const entry of registry.entries) {
            const paths = this.extractPathsFromEntry(entry);
            for (const p of paths) {
                if (!this.isExternalUrl(p)) {
                    // Normalize and add to set
                    const normalized = this.normalizePath(path.resolve(this.rootPath, p));
                    this.registryPaths.add(normalized);

                    // Also add without _app prefix for matching
                    const alt = p.replace(/^_app\//, '').toLowerCase();
                    this.registryPaths.add(alt);
                }
            }
        }

        if (this.verbose) {
            console.log(`[ORPHAN] Loaded ${this.registryPaths.size} registry paths`);
        }
    }

    /**
     * Extract lifecycle directives from content files
     */
    extractLifecycleDirectives(contentFiles) {
        this.lifecycleDirectives.clear();

        for (const file of contentFiles) {
            if (file.content) {
                const directive = this.parseLifecycleDirective(file.content);
                if (directive) {
                    this.lifecycleDirectives.set(file.path, directive);
                }
            }
        }

        if (this.verbose && this.lifecycleDirectives.size > 0) {
            console.log(`[ORPHAN] Found ${this.lifecycleDirectives.size} lifecycle directives`);
        }
    }

    /**
     * Parse lifecycle directive from file content
     * <!-- eduscan-lifecycle: status="draft|live|archive" owner="Name" -->
     */
    parseLifecycleDirective(content) {
        const pattern = /<!--\s*eduscan-lifecycle:\s*([^>]+)-->/i;
        const match = content.match(pattern);

        if (!match) return null;

        const directive = {
            status: null,
            owner: null
        };

        // Extract status
        const statusMatch = match[1].match(/status\s*=\s*["']([^"']+)["']/i);
        if (statusMatch) {
            directive.status = statusMatch[1].toLowerCase();
        }

        // Extract owner
        const ownerMatch = match[1].match(/owner\s*=\s*["']([^"']+)["']/i);
        if (ownerMatch) {
            directive.owner = ownerMatch[1];
        }

        return directive;
    }

    /**
     * Phase 1: Detect registry entries with no matching file
     */
    detectRegistryOrphans(registry, results) {
        if (this.verbose) {
            console.log('[ORPHAN] Checking registry entries for missing files...');
        }

        for (const entry of registry.entries) {
            const paths = this.extractPathsFromEntry(entry);

            for (const componentPath of paths) {
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
                        fix: `Remove entry '${entry.id}' from content-registry.js OR restore the missing file`,
                        action: 'remove_or_restore',
                        autoFixable: false,
                        confidence: 0.7,
                        remediation: {
                            option1: {
                                action: 'Remove registry entry',
                                searchPattern: this.generateRegistrySearchPattern(entry.id),
                                confidence: 0.6
                            },
                            option2: {
                                action: 'Restore missing file',
                                targetPath: componentPath,
                                confidence: 0.4
                            }
                        }
                    });
                }
            }
        }

        if (this.verbose) {
            console.log(`[ORPHAN] Found ${results.registryOrphans.length} registry orphans`);
        }
    }

    /**
     * Extract all file paths from a registry entry
     */
    extractPathsFromEntry(entry) {
        const paths = [];

        if (entry.path) {
            paths.push(entry.path);
        }

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
     * Build reachability graph from entry points
     */
    buildReachabilityGraph(registry) {
        if (this.verbose) {
            console.log('[ORPHAN] Building reachability graph...');
        }

        this.reachable.clear();
        this.crawled.clear();
        this.linkedFrom.clear();

        // Start from each entry point
        for (const entry of this.entryPoints) {
            const entryPath = path.resolve(this.rootPath, entry);
            if (fs.existsSync(entryPath)) {
                this.crawlFile(entryPath, 'entrypoint');
            }
        }

        // Also crawl content-registry.js
        const registryPath = path.resolve(this.rootPath, 'config/content-registry.js');
        if (fs.existsSync(registryPath)) {
            this.crawlFile(registryPath, 'registry');
        }

        // If reachability mode includes registry, mark all registry paths as reachable
        if (this.reachabilityMode === 'links+registry') {
            for (const regPath of this.registryPaths) {
                this.reachable.add(regPath);
            }
            if (this.verbose) {
                console.log(`[ORPHAN] Added ${this.registryPaths.size} registry paths as reachable`);
            }
        }

        if (this.verbose) {
            console.log(`[ORPHAN] Reachability graph: ${this.reachable.size} files reachable`);
        }
    }

    /**
     * Recursively crawl a file for references
     */
    crawlFile(filePath, source = 'link') {
        const normalizedPath = this.normalizePath(filePath);

        if (this.crawled.has(normalizedPath)) {
            return;
        }
        this.crawled.add(normalizedPath);
        this.reachable.add(normalizedPath);

        let content;
        try {
            content = fs.readFileSync(filePath, 'utf8');
        } catch (err) {
            return;
        }

        const references = this.extractReferences(content, filePath);

        for (const ref of references) {
            const refPath = this.resolveReference(ref, filePath);
            if (refPath && fs.existsSync(refPath)) {
                // Track where this file is linked from
                const normalizedRef = this.normalizePath(refPath);
                if (!this.linkedFrom.has(normalizedRef)) {
                    this.linkedFrom.set(normalizedRef, []);
                }
                this.linkedFrom.get(normalizedRef).push({
                    from: normalizedPath,
                    source
                });

                this.crawlFile(refPath, 'link');
            }
        }
    }

    /**
     * Extract file references from content
     */
    extractReferences(content, sourceFile) {
        const references = new Set();

        for (const pattern of this.referencePatterns) {
            pattern.lastIndex = 0;

            let match;
            while ((match = pattern.exec(content)) !== null) {
                let ref = match[1] || match[0];
                ref = ref.replace(/^['"]|['"]$/g, '');

                if (ref.startsWith('http') || ref.startsWith('//') ||
                    ref.startsWith('#') || ref.startsWith('data:') ||
                    ref.startsWith('javascript:') || ref.startsWith('mailto:')) {
                    continue;
                }

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
        if (ref.startsWith('./') || ref.startsWith('../')) {
            return path.resolve(path.dirname(sourceFile), ref);
        }

        if (ref.startsWith('houses/') || ref.startsWith('config/') ||
            ref.startsWith('components/') || ref.startsWith('utils/')) {
            return path.resolve(this.rootPath, ref);
        }

        if (ref.includes('/')) {
            return path.resolve(this.rootPath, ref);
        }

        return path.resolve(path.dirname(sourceFile), ref);
    }

    /**
     * Phase 2b: Detect filesystem orphans with reason codes
     */
    detectFilesystemOrphans(contentFiles, registry, results) {
        if (this.verbose) {
            console.log('[ORPHAN] Analyzing unreachable content...');
        }

        for (const file of contentFiles) {
            const normalizedPath = this.normalizePath(
                path.resolve(this.rootPath, '..', file.path)
            );
            const altPath = this.normalizePath(
                path.resolve(this.rootPath, file.path.replace(/^_app\//, ''))
            );
            const simplePath = file.path.replace(/^_app\//, '').toLowerCase();

            const isReachable = this.reachable.has(normalizedPath) ||
                               this.reachable.has(altPath) ||
                               this.isPathReachable(file.path);

            if (!isReachable) {
                // Determine the reason code
                const reasonAnalysis = this.analyzeOrphanReason(file, simplePath, registry);
                const severity = this.categorizeSeverity(file.path, reasonAnalysis);
                const category = this.categorizeOrphan(file.path);

                const orphan = {
                    path: file.path,
                    contentType: file.contentType,
                    house: file.house,
                    severity,
                    category,
                    reason: reasonAnalysis.reason,
                    reasonDetail: reasonAnalysis.detail,
                    nearestParent: this.findNearestParentIndex(file.path),
                    lifecycle: this.lifecycleDirectives.get(file.path) || null
                };

                // Generate remediation suggestions
                const remediation = this.generateRemediation(orphan, reasonAnalysis);
                orphan.recommendation = remediation.primary;
                orphan.remediation = remediation;

                results.filesystemOrphans.push(orphan);

                results.issues.push({
                    code: 'FS-ORPHAN-001',
                    severity,
                    category: 'reachability',
                    reason: reasonAnalysis.reason,
                    reasonDetail: reasonAnalysis.detail,
                    message: `Unreachable content [${reasonAnalysis.reason}]: ${file.path}`,
                    file: file.path,
                    contentType: file.contentType,
                    orphanCategory: category,
                    nearestParent: orphan.nearestParent,
                    fix: remediation.primary,
                    action: remediation.action,
                    autoFixable: remediation.autoFixable,
                    confidence: remediation.confidence,
                    remediation: remediation.options
                });
            }
        }

        if (this.verbose) {
            console.log(`[ORPHAN] Found ${results.filesystemOrphans.length} filesystem orphans`);
        }
    }

    /**
     * Analyze why a file is unreachable
     */
    analyzeOrphanReason(file, simplePath, registry) {
        // Check lifecycle directive first
        const lifecycle = this.lifecycleDirectives.get(file.path);
        if (lifecycle) {
            if (lifecycle.status === 'archive') {
                return {
                    reason: REASON.LIFECYCLE_ARCHIVE,
                    detail: `Marked as archived${lifecycle.owner ? ` by ${lifecycle.owner}` : ''}`
                };
            }
            if (lifecycle.status === 'draft') {
                return {
                    reason: REASON.LIFECYCLE_DRAFT,
                    detail: `Marked as draft${lifecycle.owner ? ` by ${lifecycle.owner}` : ''}`
                };
            }
        }

        // Check if in registry
        const inRegistry = this.isInRegistry(file.path);

        // Check if any entry points are missing
        const missingEntryPoints = this.entryPoints.filter(ep => {
            const epPath = path.resolve(this.rootPath, ep);
            return !fs.existsSync(epPath);
        });

        // Check for potential path mismatch
        const hasPotentialMismatch = this.checkPathMismatch(file.path);

        // Determine reason
        if (missingEntryPoints.length > 0 && this.wouldBeReachableFrom(file.path, missingEntryPoints)) {
            return {
                reason: REASON.ENTRYPOINT_MISSING,
                detail: `Entry point(s) missing: ${missingEntryPoints.join(', ')}`
            };
        }

        if (hasPotentialMismatch) {
            return {
                reason: REASON.PATH_MISMATCH,
                detail: hasPotentialMismatch
            };
        }

        if (inRegistry && this.reachabilityMode === 'links') {
            return {
                reason: REASON.ROUTER_ONLY,
                detail: 'In registry but only accessible via dynamic routing (dashboard), not direct links'
            };
        }

        if (!inRegistry) {
            return {
                reason: REASON.NOT_IN_REGISTRY,
                detail: 'Not declared in content-registry.js'
            };
        }

        return {
            reason: REASON.NOT_LINKED,
            detail: 'Not linked from any crawled page'
        };
    }

    /**
     * Check if file is in registry
     */
    isInRegistry(filePath) {
        const normalized = filePath.replace(/^_app\//, '').toLowerCase();

        for (const regPath of this.registryPaths) {
            if (typeof regPath === 'string' && regPath.toLowerCase().includes(normalized)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Check for path mismatch issues (case sensitivity, format)
     */
    checkPathMismatch(filePath) {
        const normalized = filePath.toLowerCase();

        // Check if a similar path exists with different case
        for (const reachable of this.reachable) {
            if (typeof reachable === 'string') {
                const reachableLower = reachable.toLowerCase();
                if (reachableLower !== reachable && reachableLower.includes(normalized)) {
                    return `Case sensitivity issue: expected '${reachable}'`;
                }
            }
        }

        // Check for common path format issues
        if (filePath.includes('\\')) {
            return 'Uses backslashes instead of forward slashes';
        }

        return null;
    }

    /**
     * Check if file would be reachable from given entry points
     */
    wouldBeReachableFrom(filePath, entryPoints) {
        // This is a heuristic - check if the file is in a path that matches entry point patterns
        const fileDir = path.dirname(filePath);

        for (const ep of entryPoints) {
            const epDir = path.dirname(ep);
            if (fileDir.includes(epDir) || epDir.includes(fileDir)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Generate remediation suggestions based on reason
     */
    generateRemediation(orphan, reasonAnalysis) {
        const remediation = {
            primary: '',
            action: 'investigate',
            autoFixable: false,
            confidence: 0.5,
            options: []
        };

        switch (reasonAnalysis.reason) {
            case REASON.NOT_IN_REGISTRY:
                remediation.primary = `Register in content-registry.js and link from ${orphan.nearestParent || 'house index'}`;
                remediation.action = 'register_and_link';
                remediation.autoFixable = false;
                remediation.confidence = 0.8;
                remediation.options = [
                    {
                        action: 'Add to content-registry.js',
                        template: this.generateRegistryTemplate(orphan),
                        confidence: 0.7
                    },
                    {
                        action: `Add link in ${orphan.nearestParent || 'index.html'}`,
                        template: `<a href="${orphan.path.replace('_app/', '')}">...</a>`,
                        confidence: 0.6
                    }
                ];
                break;

            case REASON.NOT_LINKED:
                remediation.primary = `Add link from ${orphan.nearestParent || 'appropriate index'}`;
                remediation.action = 'add_link';
                remediation.autoFixable = true;
                remediation.confidence = 0.85;
                if (orphan.nearestParent) {
                    remediation.options = [{
                        action: `Add link in ${orphan.nearestParent}`,
                        targetFile: orphan.nearestParent,
                        insertHtml: `<a href="${this.relativePath(orphan.nearestParent, orphan.path)}">${orphan.contentType}: ${path.basename(orphan.path, '.html')}</a>`,
                        confidence: 0.8
                    }];
                }
                break;

            case REASON.ROUTER_ONLY:
                remediation.primary = 'Already in registry - accessible via dashboard. Add direct link for discoverability.';
                remediation.action = 'optional_link';
                remediation.autoFixable = false;
                remediation.confidence = 0.9;
                break;

            case REASON.LIFECYCLE_ARCHIVE:
                remediation.primary = 'Archived content - move to _archive folder or delete if no longer needed';
                remediation.action = 'archive_or_delete';
                remediation.autoFixable = false;
                remediation.confidence = 0.7;
                break;

            case REASON.LIFECYCLE_DRAFT:
                remediation.primary = 'Draft content - finish and publish, or delete if abandoned';
                remediation.action = 'finish_or_delete';
                remediation.autoFixable = false;
                remediation.confidence = 0.6;
                break;

            case REASON.PATH_MISMATCH:
                remediation.primary = `Fix path: ${reasonAnalysis.detail}`;
                remediation.action = 'fix_path';
                remediation.autoFixable = true;
                remediation.confidence = 0.9;
                break;

            case REASON.ENTRYPOINT_MISSING:
                remediation.primary = `Restore missing entry point(s): ${reasonAnalysis.detail}`;
                remediation.action = 'restore_entrypoint';
                remediation.autoFixable = false;
                remediation.confidence = 0.75;
                break;

            default:
                remediation.primary = 'Investigate and either link, archive, or delete';
                remediation.action = 'investigate';
                remediation.confidence = 0.5;
        }

        return remediation;
    }

    /**
     * Generate a registry entry template
     */
    generateRegistryTemplate(orphan) {
        const id = path.basename(orphan.path, '.html').replace(/[^a-z0-9-]/gi, '-');
        return `'${orphan.house}-${id}': {
    id: '${orphan.house}-${id}',
    title: '${id}',
    house: '${orphan.house}',
    type: '${orphan.contentType}',
    components: {
        ${orphan.contentType}: '${orphan.path.replace('_app/', '')}'
    }
}`;
    }

    /**
     * Calculate relative path from one file to another
     */
    relativePath(from, to) {
        const fromDir = path.dirname(from.replace('_app/', ''));
        const toPath = to.replace('_app/', '');
        return path.relative(fromDir, toPath);
    }

    /**
     * Generate search pattern for registry entry
     */
    generateRegistrySearchPattern(entryId) {
        return `'${entryId}':\\s*\\{[^}]+\\}`;
    }

    /**
     * Check if a path is reachable (fuzzy matching)
     */
    isPathReachable(filePath) {
        const normalized = filePath.toLowerCase()
            .replace(/\\/g, '/')
            .replace(/^_app\//, '');

        for (const reachable of this.reachable) {
            if (typeof reachable === 'string') {
                if (reachable.toLowerCase().includes(normalized) ||
                    normalized.includes(reachable.toLowerCase())) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * Phase 2c: Detect dead paths
     */
    detectDeadPaths(results) {
        if (this.verbose) {
            console.log('[ORPHAN] Checking for dead content directories...');
        }

        const contentDirs = this.findContentDirectories();

        for (const dir of contentDirs) {
            const hasReachableContent = this.directoryHasReachableContent(dir);

            if (!hasReachableContent) {
                const files = this.listFilesInDirectory(dir);
                const deadPath = {
                    directory: dir,
                    files,
                    severity: this.categorizeDirectorySeverity(dir),
                    recommendation: this.getDeadPathRemediation(dir, files)
                };

                results.deadPaths.push(deadPath);

                results.issues.push({
                    code: 'FS-DEADPATH-001',
                    severity: deadPath.severity,
                    category: 'reachability',
                    message: `Unreferenced directory: ${dir} (${files.length} files)`,
                    directory: dir,
                    fileCount: files.length,
                    fix: deadPath.recommendation.primary,
                    action: deadPath.recommendation.action,
                    autoFixable: false,
                    confidence: deadPath.recommendation.confidence,
                    remediation: deadPath.recommendation.options
                });
            }
        }

        if (this.verbose) {
            console.log(`[ORPHAN] Found ${results.deadPaths.length} dead paths`);
        }
    }

    /**
     * Get remediation for dead path
     */
    getDeadPathRemediation(dir, files) {
        const isArchive = this.archiveFolders.some(f => dir.toLowerCase().includes(f));

        if (isArchive) {
            return {
                primary: 'Already in archive - delete if no longer needed',
                action: 'delete',
                confidence: 0.6,
                options: [{
                    action: 'Delete directory',
                    command: `rm -rf "${dir}"`,
                    confidence: 0.5
                }]
            };
        }

        return {
            primary: `Move to _archive or create index reference in parent`,
            action: 'archive_or_link',
            confidence: 0.7,
            options: [
                {
                    action: 'Move to archive',
                    command: `mv "${dir}" "_archive/${path.basename(dir)}"`,
                    confidence: 0.7
                },
                {
                    action: 'Create index.html in directory',
                    template: this.generateIndexTemplate(dir, files),
                    confidence: 0.6
                }
            ]
        };
    }

    /**
     * Generate index template for dead directory
     */
    generateIndexTemplate(dir, files) {
        const title = path.basename(dir);
        const htmlFiles = files.filter(f => f.endsWith('.html'));
        const links = htmlFiles.map(f => `  <li><a href="${f}">${f}</a></li>`).join('\n');

        return `<!DOCTYPE html>
<html>
<head><title>${title}</title></head>
<body>
  <h1>${title}</h1>
  <ul>
${links}
  </ul>
</body>
</html>`;
    }

    /**
     * Find all content directories
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
     * Check if directory has reachable content
     */
    directoryHasReachableContent(dir) {
        const absoluteDir = path.resolve(this.rootPath, dir);

        for (const reachable of this.reachable) {
            if (typeof reachable === 'string' &&
                (reachable.startsWith(absoluteDir) || reachable.includes(dir.replace(/\\/g, '/')))) {
                return true;
            }
        }
        return false;
    }

    /**
     * List files in directory
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
            // Directory doesn't exist
        }

        return files;
    }

    /**
     * Categorize severity based on file location and reason
     */
    categorizeSeverity(filePath, reasonAnalysis = null) {
        const lower = filePath.toLowerCase();

        // Lifecycle directives override location-based severity
        if (reasonAnalysis) {
            if (reasonAnalysis.reason === REASON.LIFECYCLE_ARCHIVE) return 'low';
            if (reasonAnalysis.reason === REASON.LIFECYCLE_DRAFT) return 'low';
            if (reasonAnalysis.reason === REASON.ROUTER_ONLY) return 'low';
        }

        // Archive/legacy = low
        for (const folder of this.archiveFolders) {
            if (lower.includes(`/${folder}/`) || lower.includes(`\\${folder}\\`)) {
                return 'low';
            }
        }

        // Draft/WIP = low
        for (const indicator of this.draftIndicators) {
            if (lower.includes(indicator)) {
                return 'low';
            }
        }

        // Live house content = high
        if (/houses\/\w+\/(modules|labs|applets|presentations|courses)/.test(lower)) {
            return 'high';
        }

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

        for (const folder of this.archiveFolders) {
            if (lower.includes(`/${folder}/`)) {
                return 'archived';
            }
        }

        for (const indicator of this.draftIndicators) {
            if (lower.includes(indicator)) {
                return 'draft';
            }
        }

        if (/houses\/\w+\//.test(lower)) {
            return 'unlinked';
        }

        return 'unknown';
    }

    /**
     * Find nearest parent index
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
     * Infer house from path
     */
    inferHouse(filePath) {
        const match = filePath.match(/houses\/(\w+)\//);
        return match ? match[1] : null;
    }

    /**
     * Check if URL is external
     */
    isExternalUrl(pathStr) {
        if (!pathStr) return false;
        return pathStr.startsWith('http://') ||
               pathStr.startsWith('https://') ||
               pathStr.startsWith('//');
    }

    /**
     * Normalize path
     */
    normalizePath(filePath) {
        return path.resolve(filePath).replace(/\\/g, '/');
    }
}

// Export reason codes for external use
OrphanDetector.REASON = REASON;

module.exports = OrphanDetector;
