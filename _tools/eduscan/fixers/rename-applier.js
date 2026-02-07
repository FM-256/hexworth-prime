#!/usr/bin/env node

/**
 * EduScan - Rename Applier Tool
 *
 * Applies file renames from RENAME_MAP.json and updates all references.
 *
 * Features:
 * - Renames files according to the mapping
 * - Updates internal references in HTML files (href, src)
 * - Updates references in LearningPaths.js
 * - Updates references in JS config files
 * - Creates rollback file for undoing changes
 * - Batch processing with configurable size
 * - Dry run mode for preview
 *
 * Usage:
 *   node rename-applier.js [options]
 *
 * Options:
 *   --dry-run       Show what would happen, don't apply
 *   --batch N       Process N files at a time (default: 50)
 *   --only-files    Only rename files, don't update references
 *   --only-refs     Only update references, don't rename
 *   --input <path>  Input RENAME_MAP.json path
 *   --verbose, -v   Verbose output
 *   --help, -h      Show help
 *
 * Created: 2026-02-07
 */

const fs = require('fs');
const path = require('path');

class RenameApplier {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.dryRun = options.dryRun || false;
        this.batchSize = options.batchSize || 50;
        this.onlyFiles = options.onlyFiles || false;
        this.onlyRefs = options.onlyRefs || false;
        this.rootPath = options.rootPath || './_app';
        this.inputPath = options.inputPath || './_tools/reports/RENAME_MAP.json';
        this.rollbackPath = options.rollbackPath || './_tools/reports/RENAME_ROLLBACK.json';
        this.backupDir = options.backupDir || './_tools/reports/backups';

        // Config files that may contain references
        this.configFiles = [
            'components/LearningPaths.js',
            'config/content-registry.js',
            'config/content-registry-migrated.js',
            'config/skill-tree.js'
        ];

        // Statistics
        this.stats = {
            filesRenamed: 0,
            filesSkipped: 0,
            referencesUpdated: 0,
            filesModified: 0,
            errors: []
        };

        // Rollback data
        this.rollback = {
            generated: null,
            renames: [],
            modifiedFiles: []
        };
    }

    /**
     * Load the rename map from JSON file
     * @returns {Object|null} Rename map or null on error
     */
    loadRenameMap() {
        const absolutePath = path.resolve(this.inputPath);

        if (!fs.existsSync(absolutePath)) {
            console.error(`[ERROR] Rename map not found: ${absolutePath}`);
            console.error('[INFO] Run rename-mapper.js first to generate the map.');
            return null;
        }

        try {
            const content = fs.readFileSync(absolutePath, 'utf8');
            const map = JSON.parse(content);

            if (!map.renames || !Array.isArray(map.renames)) {
                console.error('[ERROR] Invalid rename map format: missing "renames" array');
                return null;
            }

            return map;
        } catch (error) {
            console.error(`[ERROR] Failed to parse rename map: ${error.message}`);
            return null;
        }
    }

    /**
     * Verify source file exists and target doesn't
     * @param {Object} rename Rename entry
     * @returns {Object} Verification result
     */
    verifyRename(rename) {
        const housesPath = path.resolve(this.rootPath, 'houses');
        const sourcePath = path.join(housesPath, rename.oldPath);
        const targetPath = path.join(housesPath, rename.newPath);

        const result = {
            valid: true,
            reason: null,
            sourcePath,
            targetPath
        };

        if (!fs.existsSync(sourcePath)) {
            result.valid = false;
            result.reason = 'Source file does not exist';
            return result;
        }

        if (fs.existsSync(targetPath) && sourcePath.toLowerCase() !== targetPath.toLowerCase()) {
            result.valid = false;
            result.reason = 'Target file already exists';
            return result;
        }

        return result;
    }

    /**
     * Rename a single file
     * @param {Object} rename Rename entry
     * @param {Object} verification Verification result
     * @returns {boolean} Success status
     */
    renameFile(rename, verification) {
        if (this.dryRun) {
            if (this.verbose) {
                console.log(`  [DRY] Would rename: ${rename.oldName} -> ${rename.newName}`);
            }
            return true;
        }

        try {
            // If same name different case, need intermediate rename
            if (verification.sourcePath.toLowerCase() === verification.targetPath.toLowerCase()) {
                const tempPath = verification.sourcePath + '.renaming';
                fs.renameSync(verification.sourcePath, tempPath);
                fs.renameSync(tempPath, verification.targetPath);
            } else {
                fs.renameSync(verification.sourcePath, verification.targetPath);
            }

            // Record for rollback
            this.rollback.renames.push({
                oldPath: rename.newPath,  // Swap for rollback
                newPath: rename.oldPath,
                sourcePath: verification.targetPath,
                targetPath: verification.sourcePath
            });

            return true;
        } catch (error) {
            this.stats.errors.push({
                type: 'rename',
                file: rename.oldPath,
                error: error.message
            });
            return false;
        }
    }

    /**
     * Find all HTML files that might reference the renamed files
     * @returns {Array} List of HTML file paths
     */
    findHtmlFiles() {
        const files = [];
        const housesPath = path.resolve(this.rootPath, 'houses');

        if (fs.existsSync(housesPath)) {
            this.walkDirectory(housesPath, files, '.html');
        }

        return files;
    }

    /**
     * Recursively walk directory and collect files with extension
     */
    walkDirectory(dir, files, extension) {
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory()) {
                    this.walkDirectory(fullPath, files, extension);
                } else if (entry.isFile() && entry.name.endsWith(extension)) {
                    files.push(fullPath);
                }
            }
        } catch (error) {
            // Skip directories we can't read
        }
    }

    /**
     * Build a lookup map for efficient reference finding
     * @param {Array} renames List of rename entries
     * @returns {Map} oldName -> rename entry
     */
    buildReferenceLookup(renames) {
        const lookup = new Map();

        for (const rename of renames) {
            // Map by filename only
            lookup.set(rename.oldName, rename);

            // Also map by path segments for cross-directory references
            const pathParts = rename.oldPath.split('/');
            for (let i = 0; i < pathParts.length; i++) {
                const partialPath = pathParts.slice(i).join('/');
                if (!lookup.has(partialPath)) {
                    lookup.set(partialPath, rename);
                }
            }
        }

        return lookup;
    }

    /**
     * Update references in a single file
     * @param {string} filePath Path to file
     * @param {Array} renames All rename entries
     * @param {Map} lookup Reference lookup map
     * @returns {Object} Update result
     */
    updateFileReferences(filePath, renames, lookup) {
        const result = {
            modified: false,
            updatesCount: 0,
            updates: []
        };

        let content;
        try {
            content = fs.readFileSync(filePath, 'utf8');
        } catch (error) {
            this.stats.errors.push({
                type: 'read',
                file: filePath,
                error: error.message
            });
            return result;
        }

        const originalContent = content;
        const fileDir = path.dirname(filePath);
        const housesPath = path.resolve(this.rootPath, 'houses');

        // Process each rename
        for (const rename of renames) {
            // Generate various reference patterns to search for
            const patterns = this.generateReferencePatterns(filePath, rename, housesPath);

            for (const { pattern, replacement, type } of patterns) {
                if (content.includes(pattern)) {
                    content = this.replaceAll(content, pattern, replacement);
                    result.updates.push({
                        pattern,
                        replacement,
                        type
                    });
                    result.updatesCount++;
                }
            }
        }

        if (content !== originalContent) {
            result.modified = true;

            if (!this.dryRun) {
                // Backup original
                this.backupFile(filePath, originalContent);

                // Write updated content
                try {
                    fs.writeFileSync(filePath, content, 'utf8');
                } catch (error) {
                    this.stats.errors.push({
                        type: 'write',
                        file: filePath,
                        error: error.message
                    });
                    return result;
                }
            }
        }

        return result;
    }

    /**
     * Generate all possible reference patterns for a rename
     * @param {string} sourceFile File being updated
     * @param {Object} rename Rename entry
     * @param {string} housesPath Houses directory path
     * @returns {Array} Array of {pattern, replacement, type}
     */
    generateReferencePatterns(sourceFile, rename, housesPath) {
        const patterns = [];
        const sourceDir = path.dirname(sourceFile);

        // Calculate paths
        const oldFileAbs = path.join(housesPath, rename.oldPath);
        const newFileAbs = path.join(housesPath, rename.newPath);

        // Relative paths from source file
        const oldRelative = path.relative(sourceDir, oldFileAbs).replace(/\\/g, '/');
        const newRelative = path.relative(sourceDir, newFileAbs).replace(/\\/g, '/');

        // Pattern types for HTML attributes

        // 1. href="path/to/file.html"
        patterns.push({
            pattern: `href="${oldRelative}"`,
            replacement: `href="${newRelative}"`,
            type: 'href-double'
        });

        // 2. href='path/to/file.html'
        patterns.push({
            pattern: `href='${oldRelative}'`,
            replacement: `href='${newRelative}'`,
            type: 'href-single'
        });

        // 3. src="path/to/file.html"
        patterns.push({
            pattern: `src="${oldRelative}"`,
            replacement: `src="${newRelative}"`,
            type: 'src-double'
        });

        // 4. src='path/to/file.html'
        patterns.push({
            pattern: `src='${oldRelative}'`,
            replacement: `src='${newRelative}'`,
            type: 'src-single'
        });

        // 5. Same-directory references (just filename)
        if (path.dirname(oldFileAbs) === sourceDir) {
            patterns.push({
                pattern: `href="${rename.oldName}"`,
                replacement: `href="${rename.newName}"`,
                type: 'href-same-dir'
            });
            patterns.push({
                pattern: `href='${rename.oldName}'`,
                replacement: `href='${rename.newName}'`,
                type: 'href-same-dir-single'
            });
        }

        // 6. JS string references (for config files)
        patterns.push({
            pattern: `'${oldRelative}'`,
            replacement: `'${newRelative}'`,
            type: 'js-single'
        });
        patterns.push({
            pattern: `"${oldRelative}"`,
            replacement: `"${newRelative}"`,
            type: 'js-double'
        });

        // 7. References from houses/ root (absolute-ish paths)
        patterns.push({
            pattern: `href="${rename.oldPath}"`,
            replacement: `href="${rename.newPath}"`,
            type: 'href-houses-root'
        });
        patterns.push({
            pattern: `'${rename.oldPath}'`,
            replacement: `'${rename.newPath}'`,
            type: 'js-houses-root'
        });

        // 8. References with houses/ prefix
        patterns.push({
            pattern: `href="houses/${rename.oldPath}"`,
            replacement: `href="houses/${rename.newPath}"`,
            type: 'href-with-houses'
        });
        patterns.push({
            pattern: `'houses/${rename.oldPath}'`,
            replacement: `'houses/${rename.newPath}'`,
            type: 'js-with-houses'
        });

        return patterns;
    }

    /**
     * Update references in LearningPaths.js
     * @param {Array} renames All rename entries
     * @returns {Object} Update result
     */
    updateLearningPaths(renames) {
        const lpPath = path.resolve(this.rootPath, 'components/LearningPaths.js');

        if (!fs.existsSync(lpPath)) {
            if (this.verbose) {
                console.log('[WARN] LearningPaths.js not found, skipping');
            }
            return { modified: false, updatesCount: 0 };
        }

        let content;
        try {
            content = fs.readFileSync(lpPath, 'utf8');
        } catch (error) {
            this.stats.errors.push({
                type: 'read',
                file: lpPath,
                error: error.message
            });
            return { modified: false, updatesCount: 0 };
        }

        const originalContent = content;
        let updatesCount = 0;

        for (const rename of renames) {
            // LearningPaths uses paths relative to the house folder
            // e.g., 'presentations/cia-triad.html' or 'houses/shield/applets/...'

            // Pattern 1: href: 'path/to/old.html'
            const hrefPatterns = [
                // Direct filename match in href
                { old: `href: '${rename.oldName}'`, new: `href: '${rename.newName}'` },
                // Path within house
                { old: `href: '${rename.oldPath}'`, new: `href: '${rename.newPath}'` },
                // With houses/ prefix
                { old: `href: 'houses/${rename.oldPath}'`, new: `href: 'houses/${rename.newPath}'` },
                // Double quotes
                { old: `href: "${rename.oldName}"`, new: `href: "${rename.newName}"` },
                { old: `href: "${rename.oldPath}"`, new: `href: "${rename.newPath}"` },
                { old: `href: "houses/${rename.oldPath}"`, new: `href: "houses/${rename.newPath}"` }
            ];

            for (const { old, new: replacement } of hrefPatterns) {
                if (content.includes(old)) {
                    content = this.replaceAll(content, old, replacement);
                    updatesCount++;
                }
            }

            // Also check for partial path matches (subdirectory-relative)
            // e.g., 'applets/access/old.html' -> 'applets/access/new.html'
            const pathParts = rename.oldPath.split('/');
            const newPathParts = rename.newPath.split('/');

            // Skip house prefix, try various depths
            for (let i = 1; i < pathParts.length; i++) {
                const partialOld = pathParts.slice(i).join('/');
                const partialNew = newPathParts.slice(i).join('/');

                const partialPatterns = [
                    { old: `href: '${partialOld}'`, new: `href: '${partialNew}'` },
                    { old: `href: "${partialOld}"`, new: `href: "${partialNew}"` }
                ];

                for (const { old, new: replacement } of partialPatterns) {
                    if (content.includes(old)) {
                        content = this.replaceAll(content, old, replacement);
                        updatesCount++;
                    }
                }
            }
        }

        const modified = content !== originalContent;

        if (modified && !this.dryRun) {
            this.backupFile(lpPath, originalContent);
            try {
                fs.writeFileSync(lpPath, content, 'utf8');
            } catch (error) {
                this.stats.errors.push({
                    type: 'write',
                    file: lpPath,
                    error: error.message
                });
            }
        }

        return { modified, updatesCount };
    }

    /**
     * Update references in JS config files
     * @param {Array} renames All rename entries
     * @returns {Object} Combined results
     */
    updateConfigFiles(renames) {
        const results = {
            filesModified: 0,
            totalUpdates: 0
        };

        for (const configFile of this.configFiles) {
            // Skip LearningPaths.js as it's handled separately
            if (configFile.includes('LearningPaths')) continue;

            const configPath = path.resolve(this.rootPath, configFile);

            if (!fs.existsSync(configPath)) {
                continue;
            }

            let content;
            try {
                content = fs.readFileSync(configPath, 'utf8');
            } catch (error) {
                continue;
            }

            const originalContent = content;
            let updatesCount = 0;

            for (const rename of renames) {
                // Various path patterns that might appear in config files
                const patterns = [
                    { old: `'${rename.oldPath}'`, new: `'${rename.newPath}'` },
                    { old: `"${rename.oldPath}"`, new: `"${rename.newPath}"` },
                    { old: `'houses/${rename.oldPath}'`, new: `'houses/${rename.newPath}'` },
                    { old: `"houses/${rename.oldPath}"`, new: `"houses/${rename.newPath}"` },
                    { old: `'${rename.oldName}'`, new: `'${rename.newName}'` },
                    { old: `"${rename.oldName}"`, new: `"${rename.newName}"` }
                ];

                for (const { old, new: replacement } of patterns) {
                    if (content.includes(old)) {
                        content = this.replaceAll(content, old, replacement);
                        updatesCount++;
                    }
                }
            }

            if (content !== originalContent) {
                results.filesModified++;
                results.totalUpdates += updatesCount;

                if (!this.dryRun) {
                    this.backupFile(configPath, originalContent);
                    try {
                        fs.writeFileSync(configPath, content, 'utf8');
                    } catch (error) {
                        this.stats.errors.push({
                            type: 'write',
                            file: configPath,
                            error: error.message
                        });
                    }
                }
            }
        }

        return results;
    }

    /**
     * Replace all occurrences of a string
     * @param {string} str Source string
     * @param {string} search Search string
     * @param {string} replacement Replacement string
     * @returns {string} Result string
     */
    replaceAll(str, search, replacement) {
        // Escape special regex characters in search string
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        return str.replace(new RegExp(escaped, 'g'), replacement);
    }

    /**
     * Backup a file before modifying it
     * @param {string} filePath File to backup
     * @param {string} content Original content
     */
    backupFile(filePath, content) {
        // Ensure backup directory exists
        if (!fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }

        // Create unique backup filename
        const relativePath = path.relative(path.resolve(this.rootPath), filePath);
        const safeFilename = relativePath.replace(/[/\\]/g, '_');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(this.backupDir, `${timestamp}_${safeFilename}`);

        try {
            fs.writeFileSync(backupPath, content, 'utf8');

            // Record for rollback
            this.rollback.modifiedFiles.push({
                originalPath: filePath,
                backupPath: backupPath
            });
        } catch (error) {
            // Non-fatal, just log
            if (this.verbose) {
                console.log(`[WARN] Could not backup ${filePath}: ${error.message}`);
            }
        }
    }

    /**
     * Save rollback file
     */
    saveRollback() {
        if (this.dryRun) return;

        this.rollback.generated = new Date().toISOString();

        const rollbackDir = path.dirname(this.rollbackPath);
        if (!fs.existsSync(rollbackDir)) {
            fs.mkdirSync(rollbackDir, { recursive: true });
        }

        try {
            fs.writeFileSync(this.rollbackPath, JSON.stringify(this.rollback, null, 2), 'utf8');
            console.log(`[INFO] Rollback file saved: ${this.rollbackPath}`);
        } catch (error) {
            console.error(`[ERROR] Could not save rollback file: ${error.message}`);
        }
    }

    /**
     * Process renames in batches
     * @param {Array} renames All rename entries
     * @returns {Object} Processing results
     */
    processRenamesBatched(renames) {
        const totalBatches = Math.ceil(renames.length / this.batchSize);

        console.log(`[INFO] Processing ${renames.length} files in ${totalBatches} batch(es) of ${this.batchSize}`);

        for (let i = 0; i < totalBatches; i++) {
            const start = i * this.batchSize;
            const end = Math.min(start + this.batchSize, renames.length);
            const batch = renames.slice(start, end);

            console.log(`\n[BATCH ${i + 1}/${totalBatches}] Processing files ${start + 1} to ${end}...`);

            for (const rename of batch) {
                const verification = this.verifyRename(rename);

                if (!verification.valid) {
                    this.stats.filesSkipped++;
                    if (this.verbose) {
                        console.log(`  [SKIP] ${rename.oldName}: ${verification.reason}`);
                    }
                    continue;
                }

                const success = this.renameFile(rename, verification);
                if (success) {
                    this.stats.filesRenamed++;
                    if (this.verbose && !this.dryRun) {
                        console.log(`  [OK] ${rename.oldName} -> ${rename.newName}`);
                    }
                } else {
                    this.stats.filesSkipped++;
                }
            }
        }
    }

    /**
     * Apply renames from an array of rename entries
     * Used by NamingFixer for programmatic rename application
     * @param {Array} renames - Array of rename objects
     * @returns {Object} Results
     */
    applyRenames(renames) {
        if (!renames || renames.length === 0) {
            return {
                success: true,
                stats: {
                    total: 0,
                    success: 0,
                    failed: 0
                },
                successful: [],
                failed: [],
                references: null
            };
        }

        const results = {
            success: true,
            stats: {
                total: renames.length,
                success: 0,
                failed: 0
            },
            successful: [],
            failed: []
        };

        // Phase 1: Rename files
        if (!this.onlyRefs) {
            for (const rename of renames) {
                const verification = this.verifyRename(rename);

                if (!verification.valid) {
                    results.stats.failed++;
                    results.failed.push({
                        oldPath: rename.oldPath,
                        newPath: rename.newPath,
                        error: verification.reason
                    });
                    continue;
                }

                const success = this.renameFile(rename, verification);
                if (success) {
                    results.stats.success++;
                    results.successful.push({
                        oldPath: rename.oldPath,
                        newPath: rename.newPath,
                        oldName: rename.oldName,
                        newName: rename.newName
                    });

                    if (this.verbose) {
                        console.log(`[APPLIER] OK: ${rename.oldName} -> ${rename.newName}`);
                    }
                } else {
                    results.stats.failed++;
                    results.failed.push({
                        oldPath: rename.oldPath,
                        newPath: rename.newPath,
                        error: 'Rename operation failed'
                    });

                    if (this.verbose) {
                        console.log(`[APPLIER] FAILED: ${rename.oldName}`);
                    }
                }
            }
        }

        // Phase 2: Update references
        if (!this.onlyFiles && results.stats.success > 0) {
            const lookup = this.buildReferenceLookup(renames);

            // Update HTML files
            const htmlFiles = this.findHtmlFiles();
            let filesUpdated = 0;
            let refsUpdated = 0;

            for (const htmlFile of htmlFiles) {
                const result = this.updateFileReferences(htmlFile, renames, lookup);
                if (result.modified) {
                    filesUpdated++;
                    refsUpdated += result.updatesCount;
                }
            }

            // Update LearningPaths.js
            const lpResult = this.updateLearningPaths(renames);
            if (lpResult.modified) {
                filesUpdated++;
                refsUpdated += lpResult.updatesCount;
            }

            // Update config files
            const configResult = this.updateConfigFiles(renames);
            filesUpdated += configResult.filesModified;
            refsUpdated += configResult.totalUpdates;

            results.references = {
                filesUpdated: filesUpdated,
                referencesUpdated: refsUpdated
            };
        }

        return results;
    }

    /**
     * Main run function
     * @returns {Object} Results
     */
    run() {
        console.log('======================================================================');
        console.log('             EDUSCAN - Rename Applier Tool                           ');
        console.log('======================================================================');
        console.log('');

        if (this.dryRun) {
            console.log('[MODE] DRY RUN - No changes will be made');
        }
        if (this.onlyFiles) {
            console.log('[MODE] Only renaming files, not updating references');
        }
        if (this.onlyRefs) {
            console.log('[MODE] Only updating references, not renaming files');
        }
        console.log('');

        // Load rename map
        const renameMap = this.loadRenameMap();
        if (!renameMap) {
            return { success: false, stats: this.stats };
        }

        const renames = renameMap.renames;
        console.log(`[INFO] Loaded ${renames.length} rename entries from ${this.inputPath}`);

        if (renames.length === 0) {
            console.log('[INFO] No files to rename. Exiting.');
            return { success: true, stats: this.stats };
        }

        // Phase 1: Rename files
        if (!this.onlyRefs) {
            console.log('\n====================================================================');
            console.log('PHASE 1: Renaming Files');
            console.log('====================================================================');

            this.processRenamesBatched(renames);

            console.log(`\n[SUMMARY] Files renamed: ${this.stats.filesRenamed}, Skipped: ${this.stats.filesSkipped}`);
        }

        // Phase 2: Update references
        if (!this.onlyFiles) {
            console.log('\n====================================================================');
            console.log('PHASE 2: Updating References');
            console.log('====================================================================');

            // Build lookup for efficient reference finding
            const lookup = this.buildReferenceLookup(renames);

            // 2a: Update HTML files
            console.log('\n[STEP 2a] Updating HTML file references...');
            const htmlFiles = this.findHtmlFiles();
            console.log(`[INFO] Found ${htmlFiles.length} HTML files to check`);

            let htmlModified = 0;
            let htmlUpdates = 0;

            for (const htmlFile of htmlFiles) {
                const result = this.updateFileReferences(htmlFile, renames, lookup);
                if (result.modified) {
                    htmlModified++;
                    htmlUpdates += result.updatesCount;
                    if (this.verbose) {
                        console.log(`  [UPDATED] ${path.relative(this.rootPath, htmlFile)} (${result.updatesCount} refs)`);
                    }
                }
            }

            console.log(`[SUMMARY] HTML files modified: ${htmlModified}, References updated: ${htmlUpdates}`);

            // 2b: Update LearningPaths.js
            console.log('\n[STEP 2b] Updating LearningPaths.js...');
            const lpResult = this.updateLearningPaths(renames);
            if (lpResult.modified) {
                console.log(`[SUMMARY] LearningPaths.js: ${lpResult.updatesCount} references updated`);
            } else {
                console.log('[SUMMARY] LearningPaths.js: No updates needed');
            }

            // 2c: Update config files
            console.log('\n[STEP 2c] Updating JS config files...');
            const configResult = this.updateConfigFiles(renames);
            console.log(`[SUMMARY] Config files modified: ${configResult.filesModified}, Updates: ${configResult.totalUpdates}`);

            // Update stats
            this.stats.filesModified = htmlModified + (lpResult.modified ? 1 : 0) + configResult.filesModified;
            this.stats.referencesUpdated = htmlUpdates + lpResult.updatesCount + configResult.totalUpdates;
        }

        // Save rollback
        if (!this.dryRun) {
            this.saveRollback();
        }

        // Final summary
        console.log('\n====================================================================');
        console.log('FINAL SUMMARY');
        console.log('====================================================================');
        console.log(`  Files Renamed:       ${this.stats.filesRenamed}`);
        console.log(`  Files Skipped:       ${this.stats.filesSkipped}`);
        console.log(`  Files Modified:      ${this.stats.filesModified}`);
        console.log(`  References Updated:  ${this.stats.referencesUpdated}`);
        console.log(`  Errors:              ${this.stats.errors.length}`);

        if (this.stats.errors.length > 0) {
            console.log('\n[ERRORS]');
            for (const error of this.stats.errors.slice(0, 10)) {
                console.log(`  - [${error.type}] ${error.file}: ${error.error}`);
            }
            if (this.stats.errors.length > 10) {
                console.log(`  ... and ${this.stats.errors.length - 10} more`);
            }
        }

        if (this.dryRun) {
            console.log('\n[INFO] Dry run complete. Run without --dry-run to apply changes.');
        } else {
            console.log(`\n[INFO] Rollback file: ${this.rollbackPath}`);
            console.log('[INFO] Backups saved in: ' + this.backupDir);
        }

        return {
            success: this.stats.errors.length === 0,
            stats: this.stats,
            rollback: this.rollback
        };
    }
}

// CLI handling
function parseArgs(args) {
    const options = {
        dryRun: false,
        verbose: false,
        batchSize: 50,
        onlyFiles: false,
        onlyRefs: false,
        rootPath: './_app',
        inputPath: './_tools/reports/RENAME_MAP.json',
        rollbackPath: './_tools/reports/RENAME_ROLLBACK.json',
        help: false
    };

    for (let i = 0; i < args.length; i++) {
        const arg = args[i];
        const nextArg = args[i + 1];

        switch (arg) {
            case '--dry-run':
            case '-n':
                options.dryRun = true;
                break;
            case '--verbose':
            case '-v':
                options.verbose = true;
                break;
            case '--batch':
            case '-b':
                if (nextArg && !nextArg.startsWith('-')) {
                    options.batchSize = parseInt(nextArg, 10) || 50;
                    i++;
                }
                break;
            case '--only-files':
                options.onlyFiles = true;
                break;
            case '--only-refs':
                options.onlyRefs = true;
                break;
            case '--input':
            case '-i':
                if (nextArg && !nextArg.startsWith('-')) {
                    options.inputPath = nextArg;
                    i++;
                }
                break;
            case '--output':
            case '-o':
                if (nextArg && !nextArg.startsWith('-')) {
                    options.rollbackPath = nextArg;
                    i++;
                }
                break;
            case '--path':
            case '-p':
                if (nextArg && !nextArg.startsWith('-')) {
                    options.rootPath = nextArg;
                    i++;
                }
                break;
            case '--help':
            case '-h':
                options.help = true;
                break;
        }
    }

    // Validate conflicting options
    if (options.onlyFiles && options.onlyRefs) {
        console.error('[ERROR] Cannot use --only-files and --only-refs together');
        process.exit(1);
    }

    return options;
}

function showHelp() {
    console.log(`
EduScan Rename Applier - Apply file renames and update references

Usage:
  node rename-applier.js [options]

Options:
  -n, --dry-run          Show what would happen, don't apply changes
  -v, --verbose          Show detailed output for each operation
  -b, --batch <N>        Process N files at a time (default: 50)
  --only-files           Only rename files, don't update references
  --only-refs            Only update references, don't rename files
  -i, --input <path>     Path to RENAME_MAP.json (default: ./_tools/reports/RENAME_MAP.json)
  -o, --output <path>    Path for rollback file (default: ./_tools/reports/RENAME_ROLLBACK.json)
  -p, --path <dir>       Root app directory (default: ./_app)
  -h, --help             Show this help

Reference Updates:
  - href="path/to/old.html" -> href="path/to/new.html"
  - src="path/to/old.html" -> src="path/to/new.html"
  - 'path/to/old.html' -> 'path/to/new.html' (JS files)
  - Same folder: href="old.html" -> href="new.html"

Safety Features:
  - Verifies source file exists before renaming
  - Verifies target doesn't already exist
  - Creates backups of modified files
  - Generates rollback file for undoing changes

Examples:
  # Preview what would happen
  node rename-applier.js --dry-run --verbose

  # Apply renames in batches of 25
  node rename-applier.js --batch 25

  # Only rename files, skip reference updates
  node rename-applier.js --only-files

  # Only update references (files already renamed)
  node rename-applier.js --only-refs

Rollback:
  The rollback file can be used to undo all changes. The backups directory
  contains copies of all modified files before changes were applied.
`);
}

// Main execution
if (require.main === module) {
    const args = process.argv.slice(2);
    const options = parseArgs(args);

    if (options.help) {
        showHelp();
        process.exit(0);
    }

    const applier = new RenameApplier(options);
    const result = applier.run();

    process.exit(result.success ? 0 : 1);
}

module.exports = RenameApplier;
