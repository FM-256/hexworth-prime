/**
 * EduScan - Reorganization Undo Tool
 *
 * Reverses file moves using REORG_ROLLBACK.json
 *
 * Usage:
 *   node reorg-undo.js [--dry-run]
 *
 * Created: 2026-02-07
 */

const fs = require('fs');
const path = require('path');

class ReorgUndo {
    constructor(options = {}) {
        this.dryRun = options.dryRun || false;
        this.verbose = options.verbose || false;
        this.rootPath = options.rootPath || './_app';
        this.rollbackPath = options.rollbackPath || './_tools/reports/REORG_ROLLBACK.json';
    }

    /**
     * Execute the undo operation
     */
    undo() {
        console.log('╔═══════════════════════════════════════════════════════════════╗');
        console.log('║           EDUSCAN - Reorganization Undo                       ║');
        console.log('╚═══════════════════════════════════════════════════════════════╝');
        console.log('');

        if (this.dryRun) {
            console.log('[MODE] DRY RUN - No changes will be made\n');
        }

        // Load rollback file
        const absolutePath = path.resolve(this.rollbackPath);
        if (!fs.existsSync(absolutePath)) {
            console.log('[ERROR] Rollback file not found:', absolutePath);
            console.log('        Run reorg-applier.js first to create a rollback file.');
            return { success: false, error: 'Rollback file not found' };
        }

        const rollback = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
        console.log(`[INFO] Loaded rollback from: ${rollback.timestamp}`);
        console.log(`[INFO] Original operation moved ${rollback.moves.length} files\n`);

        const results = {
            filesMoved: 0,
            filesSkipped: 0,
            filesRestored: 0,
            errors: []
        };

        // Phase 1: Restore modified files from backups
        console.log('════════════════════════════════════════════════════════════════');
        console.log('PHASE 1: Restoring Modified Files from Backups');
        console.log('════════════════════════════════════════════════════════════════\n');

        if (rollback.modifiedFiles && rollback.modifiedFiles.length > 0) {
            for (const mod of rollback.modifiedFiles) {
                if (mod.backupPath && fs.existsSync(mod.backupPath)) {
                    if (!this.dryRun) {
                        const backupContent = fs.readFileSync(mod.backupPath, 'utf8');
                        fs.writeFileSync(path.join(this.rootPath, mod.file), backupContent);
                        fs.unlinkSync(mod.backupPath); // Remove backup after restore
                    }
                    results.filesRestored++;
                    if (this.verbose) {
                        console.log(`  [RESTORED] ${mod.file}`);
                    }
                }
            }
            console.log(`[SUMMARY] Restored ${results.filesRestored} files from backups\n`);
        } else {
            console.log('[INFO] No modified files to restore\n');
        }

        // Phase 2: Reverse file moves
        console.log('════════════════════════════════════════════════════════════════');
        console.log('PHASE 2: Reversing File Moves');
        console.log('════════════════════════════════════════════════════════════════\n');

        // Process in reverse order
        const moves = [...rollback.moves].reverse();

        for (const move of moves) {
            const currentPath = path.join(this.rootPath, move.oldPath);
            const originalPath = path.join(this.rootPath, move.newPath);

            // Check if the moved file exists
            if (!fs.existsSync(currentPath)) {
                if (this.verbose) {
                    console.log(`  [SKIP] ${move.oldPath} (not found)`);
                }
                results.filesSkipped++;
                continue;
            }

            // Check if original path would conflict
            if (fs.existsSync(originalPath)) {
                console.log(`  [CONFLICT] ${move.newPath} already exists`);
                results.errors.push({
                    file: move.oldPath,
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

            // Move back
            if (!this.dryRun) {
                // Read content and restore internal paths
                const content = fs.readFileSync(currentPath, 'utf8');
                fs.writeFileSync(originalPath, content);
                fs.unlinkSync(currentPath);
            }

            results.filesMoved++;
            if (this.verbose) {
                console.log(`  [UNDO] ${move.oldPath}`);
                console.log(`      → ${move.newPath}`);
            }
        }

        console.log(`\n[SUMMARY] Files moved back: ${results.filesMoved}, Skipped: ${results.filesSkipped}\n`);

        // Final summary
        console.log('════════════════════════════════════════════════════════════════');
        console.log('FINAL SUMMARY');
        console.log('════════════════════════════════════════════════════════════════');
        console.log(`  Files Moved Back:    ${results.filesMoved}`);
        console.log(`  Files Skipped:       ${results.filesSkipped}`);
        console.log(`  Files Restored:      ${results.filesRestored}`);
        console.log(`  Errors:              ${results.errors.length}`);

        if (results.errors.length > 0) {
            console.log('\n[ERRORS]');
            for (const err of results.errors) {
                console.log(`  - ${err.file}: ${err.error}`);
            }
        }

        if (!this.dryRun && results.filesMoved > 0) {
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
EduScan Reorganization Undo Tool

Usage: node reorg-undo.js [options]

Options:
  -n, --dry-run    Show what would be undone without making changes
  -v, --verbose    Show detailed output
  -h, --help       Show this help message

This tool reverses the moves applied by reorg-applier.js using
the REORG_ROLLBACK.json file.
        `);
        process.exit(0);
    }

    const undo = new ReorgUndo({ dryRun, verbose });
    undo.undo();
}

module.exports = ReorgUndo;
