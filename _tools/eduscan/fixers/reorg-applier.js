/**
 * EduScan - Reorganization Applier
 *
 * Moves files to proper directories and updates all references.
 * Creates a rollback file for safe undo.
 *
 * Usage:
 *   node reorg-applier.js [--dry-run]
 *
 * Created: 2026-02-07
 */

const fs = require('fs');
const path = require('path');

class ReorgApplier {
    constructor(options = {}) {
        this.rootPath = options.rootPath || './_app';
        this.dryRun = options.dryRun || false;
        this.verbose = options.verbose || false;
        this.mapPath = options.mapPath || './_tools/reports/REORG_MAP.json';
        this.rollbackPath = options.rollbackPath || './_tools/reports/REORG_ROLLBACK.json';
        this.backupDir = options.backupDir || './_tools/reports/reorg-backups';
    }

    /**
     * Calculate relative path from one file to another
     */
    calculateRelativePath(fromFile, toFile) {
        const fromDir = path.dirname(fromFile);
        const toDir = path.dirname(toFile);
        return path.relative(fromDir, toDir);
    }

    /**
     * Update relative paths inside a file when it moves
     */
    updateInternalPaths(content, oldPath, newPath) {
        const oldDir = path.dirname(oldPath);
        const newDir = path.dirname(newPath);

        if (oldDir === newDir) {
            return content; // No change needed
        }

        // Calculate depth change
        const oldDepth = oldDir.split('/').length;
        const newDepth = newDir.split('/').length;
        const depthDiff = oldDepth - newDepth;

        let updated = content;

        // Find all relative paths that go up (../)
        const pathPatterns = [
            /(src=["'])(\.\.[^"']+)(["'])/g,
            /(href=["'])(\.\.[^"']+)(["'])/g,
        ];

        for (const pattern of pathPatterns) {
            updated = updated.replace(pattern, (match, prefix, relativePath, suffix) => {
                // Count current ../ segments
                const upCount = (relativePath.match(/\.\.\//g) || []).length;

                // Calculate new path
                // If we moved deeper, we need more ../
                // If we moved shallower, we need fewer ../
                const newUpCount = upCount - depthDiff;

                if (newUpCount < 0) {
                    // Can't go negative, path is broken
                    return match;
                }

                // Rebuild path
                const pathParts = relativePath.split('/').filter(p => p !== '..');
                const newPrefix = '../'.repeat(newUpCount);
                const newPath = newPrefix + pathParts.join('/');

                return prefix + newPath + suffix;
            });
        }

        return updated;
    }

    /**
     * Update references to a moved file in other files
     */
    updateExternalReferences(oldPath, newPath, filesToUpdate) {
        const updates = [];

        for (const file of filesToUpdate) {
            const fullPath = path.join(this.rootPath, file);
            if (!fs.existsSync(fullPath)) continue;

            let content = fs.readFileSync(fullPath, 'utf8');
            const originalContent = content;

            // Replace old path with new path
            // Handle various path formats
            const oldBasename = path.basename(oldPath);
            const newBasename = path.basename(newPath);

            // Full path replacement
            if (content.includes(oldPath)) {
                content = content.split(oldPath).join(newPath);
            }

            // Relative path patterns - more complex
            // For now, handle the most common patterns in LearningPaths.js and configs

            if (content !== originalContent) {
                updates.push({
                    file: file,
                    changes: 1
                });

                if (!this.dryRun) {
                    fs.writeFileSync(fullPath, content);
                }
            }
        }

        return updates;
    }

    /**
     * Find all files that might reference the moved files
     */
    findReferencingFiles() {
        const referenceFiles = [];

        // Key files that contain references
        const keyFiles = [
            'components/LearningPaths.js',
            'config/content-registry.js',
            'config/content-registry-migrated.js'
        ];

        for (const file of keyFiles) {
            const fullPath = path.join(this.rootPath, file);
            if (fs.existsSync(fullPath)) {
                referenceFiles.push(file);
            }
        }

        return referenceFiles;
    }

    /**
     * Apply the reorganization
     */
    apply() {
        console.log('╔═══════════════════════════════════════════════════════════════╗');
        console.log('║           EDUSCAN - Reorganization Applier                    ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝');
        console.log('');

        if (this.dryRun) {
            console.log('[MODE] DRY RUN - No changes will be made\n');
        }

        // Load map
        if (!fs.existsSync(this.mapPath)) {
            console.log('[ERROR] Reorganization map not found:', this.mapPath);
            console.log('        Run reorg-mapper.js first.');
            return { success: false, error: 'Map not found' };
        }

        const map = JSON.parse(fs.readFileSync(this.mapPath, 'utf8'));
        console.log(`[INFO] Loaded ${map.moves.length} planned moves\n`);

        const results = {
            filesMoved: 0,
            filesSkipped: 0,
            referencesUpdated: 0,
            errors: [],
            moves: [],
            modifiedFiles: []
        };

        // Create backup directory
        if (!this.dryRun && !fs.existsSync(this.backupDir)) {
            fs.mkdirSync(this.backupDir, { recursive: true });
        }

        // Find files that need reference updates
        const referencingFiles = this.findReferencingFiles();
        console.log(`[INFO] Will update references in ${referencingFiles.length} files\n`);

        // Backup referencing files
        const backedUpFiles = [];
        if (!this.dryRun) {
            for (const file of referencingFiles) {
                const fullPath = path.join(this.rootPath, file);
                if (fs.existsSync(fullPath)) {
                    const backupPath = path.join(this.backupDir, file.replace(/\//g, '_'));
                    fs.copyFileSync(fullPath, backupPath);
                    backedUpFiles.push({ file, backupPath });
                }
            }
        }

        // Read all referencing files content for batch updates
        const fileContents = {};
        for (const file of referencingFiles) {
            const fullPath = path.join(this.rootPath, file);
            if (fs.existsSync(fullPath)) {
                fileContents[file] = fs.readFileSync(fullPath, 'utf8');
            }
        }

        console.log('════════════════════════════════════════════════════════════════');
        console.log('PHASE 1: Moving Files');
        console.log('════════════════════════════════════════════════════════════════\n');

        // Apply moves
        for (const move of map.moves) {
            const oldFullPath = path.join(this.rootPath, move.oldPath);
            const newFullPath = path.join(this.rootPath, move.newPath);

            // Check source exists
            if (!fs.existsSync(oldFullPath)) {
                if (this.verbose) {
                    console.log(`  [SKIP] ${move.oldPath} (not found)`);
                }
                results.filesSkipped++;
                continue;
            }

            // Check destination doesn't exist
            if (fs.existsSync(newFullPath)) {
                console.log(`  [CONFLICT] ${move.newPath} already exists`);
                results.errors.push({
                    file: move.oldPath,
                    error: 'Destination already exists'
                });
                continue;
            }

            // Ensure destination directory exists
            const destDir = path.dirname(newFullPath);
            if (!this.dryRun && !fs.existsSync(destDir)) {
                fs.mkdirSync(destDir, { recursive: true });
            }

            // Read file content
            let content = fs.readFileSync(oldFullPath, 'utf8');

            // Update internal paths in the file
            const updatedContent = this.updateInternalPaths(content, move.oldPath, move.newPath);

            // Move file
            if (!this.dryRun) {
                fs.writeFileSync(newFullPath, updatedContent);
                fs.unlinkSync(oldFullPath);
            }

            results.filesMoved++;
            results.moves.push(move);

            // Update references in other files
            for (const file of Object.keys(fileContents)) {
                if (fileContents[file].includes(move.oldPath)) {
                    fileContents[file] = fileContents[file].split(move.oldPath).join(move.newPath);
                    results.referencesUpdated++;
                }
            }

            if (this.verbose) {
                console.log(`  [MOVED] ${move.filename}`);
                console.log(`          ${move.oldPath}`);
                console.log(`       → ${move.newPath}`);
            }
        }

        console.log(`\n[SUMMARY] Moved ${results.filesMoved} files, Skipped ${results.filesSkipped}\n`);

        console.log('════════════════════════════════════════════════════════════════');
        console.log('PHASE 2: Updating References');
        console.log('════════════════════════════════════════════════════════════════\n');

        // Write updated reference files
        for (const [file, content] of Object.entries(fileContents)) {
            const fullPath = path.join(this.rootPath, file);
            if (!this.dryRun) {
                fs.writeFileSync(fullPath, content);
            }
            results.modifiedFiles.push({ file });
            console.log(`  [UPDATED] ${file}`);
        }

        console.log(`\n[SUMMARY] Updated ${results.modifiedFiles.length} files with ${results.referencesUpdated} reference changes\n`);

        // Create rollback file
        if (!this.dryRun && results.filesMoved > 0) {
            const rollback = {
                timestamp: new Date().toISOString(),
                moves: results.moves.map(m => ({
                    oldPath: m.newPath,  // Swap for undo
                    newPath: m.oldPath
                })),
                modifiedFiles: backedUpFiles
            };

            fs.writeFileSync(this.rollbackPath, JSON.stringify(rollback, null, 2));
            console.log(`[ROLLBACK] Saved to ${this.rollbackPath}`);
        }

        // Final summary
        console.log('\n════════════════════════════════════════════════════════════════');
        console.log('FINAL SUMMARY');
        console.log('════════════════════════════════════════════════════════════════');
        console.log(`  Files Moved:        ${results.filesMoved}`);
        console.log(`  Files Skipped:      ${results.filesSkipped}`);
        console.log(`  References Updated: ${results.referencesUpdated}`);
        console.log(`  Errors:             ${results.errors.length}`);

        if (results.errors.length > 0) {
            console.log('\n[ERRORS]');
            results.errors.forEach(e => console.log(`  - ${e.file}: ${e.error}`));
        }

        if (this.dryRun) {
            console.log('\n[INFO] Dry run complete. Run without --dry-run to apply changes.');
        }

        return {
            success: true,
            ...results
        };
    }
}

// CLI
if (require.main === module) {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run') || args.includes('-n');
    const verbose = args.includes('--verbose') || args.includes('-v');

    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
EduScan Reorganization Applier

Usage: node reorg-applier.js [options]

Options:
  -n, --dry-run    Show what would be moved without making changes
  -v, --verbose    Show detailed output
  -h, --help       Show this help message

This tool moves files according to REORG_MAP.json and updates all references.
Run reorg-mapper.js first to generate the map.
        `);
        process.exit(0);
    }

    const applier = new ReorgApplier({ dryRun, verbose });
    applier.apply();
}

module.exports = ReorgApplier;
