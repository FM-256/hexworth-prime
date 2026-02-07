/**
 * EduScan - Rename Undo Tool
 *
 * Reverses file renames using RENAME_ROLLBACK.json
 *
 * Usage:
 *   node rename-undo.js [--dry-run]
 *
 * Created: 2026-02-07 (architecture/module-registry branch)
 */

const fs = require('fs');
const path = require('path');

class RenameUndo {
    constructor(options = {}) {
        this.dryRun = options.dryRun || false;
        this.verbose = options.verbose || false;
        this.rootPath = options.rootPath || './_app';
        this.rollbackPath = options.rollbackPath || './_tools/reports/RENAME_ROLLBACK.json';
    }

    /**
     * Execute the undo operation
     */
    undo() {
        console.log('======================================================================');
        console.log('             EDUSCAN - Rename Undo Tool                              ');
        console.log('======================================================================');
        console.log('');

        if (this.dryRun) {
            console.log('[MODE] DRY RUN - No changes will be made\n');
        }

        // Load rollback file
        const absolutePath = path.resolve(this.rollbackPath);
        if (!fs.existsSync(absolutePath)) {
            console.log('[ERROR] Rollback file not found:', absolutePath);
            console.log('        Run rename-applier.js first to create a rollback file.');
            return { success: false, error: 'Rollback file not found' };
        }

        const rollback = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
        console.log(`[INFO] Loaded rollback from: ${rollback.timestamp}`);
        console.log(`[INFO] Original operation renamed ${rollback.renames.length} files\n`);

        const results = {
            filesRenamed: 0,
            filesSkipped: 0,
            refsRestored: 0,
            errors: []
        };

        // Phase 1: Restore modified files from backups
        console.log('====================================================================');
        console.log('PHASE 1: Restoring Modified Files from Backups');
        console.log('====================================================================\n');

        if (rollback.modifiedFiles && rollback.modifiedFiles.length > 0) {
            for (const mod of rollback.modifiedFiles) {
                if (mod.backupPath && fs.existsSync(mod.backupPath)) {
                    if (!this.dryRun) {
                        const backupContent = fs.readFileSync(mod.backupPath, 'utf8');
                        fs.writeFileSync(path.resolve(this.rootPath, mod.file), backupContent);
                        fs.unlinkSync(mod.backupPath); // Remove backup after restore
                    }
                    results.refsRestored++;
                    if (this.verbose) {
                        console.log(`  [RESTORED] ${mod.file}`);
                    }
                }
            }
            console.log(`[SUMMARY] Restored ${results.refsRestored} files from backups\n`);
        } else {
            console.log('[INFO] No modified files to restore\n');
        }

        // Phase 2: Reverse file renames
        console.log('====================================================================');
        console.log('PHASE 2: Reversing File Renames');
        console.log('====================================================================\n');

        // Process in reverse order
        const renames = [...rollback.renames].reverse();

        for (const rename of renames) {
            const currentPath = path.resolve(this.rootPath, rename.newPath);
            const originalPath = path.resolve(this.rootPath, rename.oldPath);

            // Check if the renamed file exists
            if (!fs.existsSync(currentPath)) {
                if (this.verbose) {
                    console.log(`  [SKIP] ${rename.newPath} (not found)`);
                }
                results.filesSkipped++;
                continue;
            }

            // Check if original path would conflict
            if (fs.existsSync(originalPath)) {
                console.log(`  [CONFLICT] ${rename.oldPath} already exists`);
                results.errors.push({
                    file: rename.newPath,
                    error: 'Original path already exists'
                });
                continue;
            }

            // Ensure directory exists
            const dir = path.dirname(originalPath);
            if (!fs.existsSync(dir)) {
                if (!this.dryRun) {
                    fs.mkdirSync(dir, { recursive: true });
                }
            }

            // Rename back
            if (!this.dryRun) {
                fs.renameSync(currentPath, originalPath);
            }

            results.filesRenamed++;
            if (this.verbose) {
                console.log(`  [UNDO] ${rename.newPath} → ${rename.oldPath}`);
            }
        }

        console.log(`\n[SUMMARY] Files renamed back: ${results.filesRenamed}, Skipped: ${results.filesSkipped}\n`);

        // Final summary
        console.log('====================================================================');
        console.log('FINAL SUMMARY');
        console.log('====================================================================');
        console.log(`  Files Renamed Back:  ${results.filesRenamed}`);
        console.log(`  Files Skipped:       ${results.filesSkipped}`);
        console.log(`  Files Restored:      ${results.refsRestored}`);
        console.log(`  Errors:              ${results.errors.length}`);

        if (results.errors.length > 0) {
            console.log('\n[ERRORS]');
            for (const err of results.errors) {
                console.log(`  - ${err.file}: ${err.error}`);
            }
        }

        if (!this.dryRun && results.filesRenamed > 0) {
            // Archive the rollback file
            const archivePath = this.rollbackPath.replace('.json', `-used-${Date.now()}.json`);
            fs.renameSync(absolutePath, archivePath);
            console.log(`\n[INFO] Rollback file archived to: ${archivePath}`);
        }

        if (this.dryRun) {
            console.log('\n[INFO] Dry run complete. Run without --dry-run to apply undo.');
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
EduScan Rename Undo Tool

Usage: node rename-undo.js [options]

Options:
  -n, --dry-run    Show what would be undone without making changes
  -v, --verbose    Show detailed output
  -h, --help       Show this help message

This tool reverses the renames applied by rename-applier.js using
the RENAME_ROLLBACK.json file.
        `);
        process.exit(0);
    }

    const undo = new RenameUndo({ dryRun, verbose });
    undo.undo();
}

module.exports = RenameUndo;
