/**
 * EduScan - Validator Orchestrator
 *
 * Cross-references parsed content with registry and validates sync compatibility.
 */

const fs = require('fs');
const path = require('path');

class ValidatorOrchestrator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.registryPath = options.registryPath || './_app/config/content-registry.js';
        this.registry = null;
    }

    /**
     * Load and parse content-registry.js
     */
    loadRegistry() {
        const absolutePath = path.resolve(this.registryPath);

        if (!fs.existsSync(absolutePath)) {
            if (this.verbose) {
                console.warn(`[VALIDATE] Registry not found: ${absolutePath}`);
            }
            return null;
        }

        try {
            const content = fs.readFileSync(absolutePath, 'utf8');
            this.registry = this.parseRegistry(content);
            return this.registry;
        } catch (err) {
            console.error(`[VALIDATE] Error loading registry: ${err.message}`);
            return null;
        }
    }

    /**
     * Parse content-registry.js to extract entries
     * This is a simplified parser - the registry is JS not JSON
     */
    parseRegistry(content) {
        const entries = [];

        // Look for content entries in various formats
        // Format 1: { id: 'xxx', ... }
        const idPattern = /{\s*id:\s*['"]([^'"]+)['"]/g;
        let match;

        while ((match = idPattern.exec(content)) !== null) {
            entries.push({
                id: match[1],
                raw: this.extractEntryBlock(content, match.index)
            });
        }

        // Also try to extract paths from entries
        entries.forEach(entry => {
            if (entry.raw) {
                const pathMatch = entry.raw.match(/(?:path|href|url):\s*['"]([^'"]+)['"]/);
                if (pathMatch) {
                    entry.path = pathMatch[1];
                }

                // Extract component paths (presentation, applet, lab, quiz, etc.)
                entry.componentPaths = [];
                const compPattern = /(?:presentation|applet|lab|quiz|tool|module|simulator|reference|textbook|barricade):\s*['"]([^'"]+\.html)['"]/g;
                let compMatch;
                while ((compMatch = compPattern.exec(entry.raw)) !== null) {
                    entry.componentPaths.push(compMatch[1]);
                }

                const typeMatch = entry.raw.match(/type:\s*['"]([^'"]+)['"]/);
                if (typeMatch) {
                    entry.type = typeMatch[1];
                }

                const houseMatch = entry.raw.match(/house(?:Id)?:\s*['"]([^'"]+)['"]/);
                if (houseMatch) {
                    entry.house = houseMatch[1];
                }
            }
        });

        return {
            entries,
            ids: entries.map(e => e.id),
            count: entries.length
        };
    }

    /**
     * Extract a block of content starting from an index
     */
    extractEntryBlock(content, startIndex) {
        let braceCount = 0;
        let started = false;
        let endIndex = startIndex;

        for (let i = startIndex; i < content.length && i < startIndex + 1000; i++) {
            if (content[i] === '{') {
                braceCount++;
                started = true;
            } else if (content[i] === '}') {
                braceCount--;
                if (started && braceCount === 0) {
                    endIndex = i + 1;
                    break;
                }
            }
        }

        return content.substring(startIndex, endIndex);
    }

    /**
     * Validate all parsed content
     * @param {Array} content - Parsed content from ParserOrchestrator
     * @returns {Object} Validation results
     */
    validate(content) {
        // Load registry if not already loaded
        if (!this.registry) {
            this.loadRegistry();
        }

        const results = {
            issues: [],
            registryGaps: {
                unregistered: [], // Files not in registry
                orphaned: []      // Registry entries with no file
            },
            syncStatus: {
                ready: 0,
                notReady: 0,
                unknown: 0
            }
        };

        // Get all content file paths (normalized)
        const contentPaths = new Set(content.map(c => this.normalizePath(c.path)));

        // Check each content item
        for (const item of content) {
            // Collect issues from parsing
            if (item.issues && item.issues.length > 0) {
                for (const issue of item.issues) {
                    results.issues.push({
                        ...issue,
                        file: item.path
                    });
                }
            }

            // Check registry coverage
            if (this.registry) {
                const isRegistered = this.isContentRegistered(item);
                if (!isRegistered && this.shouldBeRegistered(item)) {
                    results.registryGaps.unregistered.push({
                        path: item.path,
                        type: item.contentType,
                        house: item.house
                    });

                    results.issues.push({
                        code: 'REG-001',
                        severity: 'warning',
                        type: 'not_registered',
                        message: `Content file is not registered in content-registry.js`,
                        file: item.path,
                        fix: 'Add entry to content-registry.js'
                    });
                }
            }

            // Determine sync readiness
            const syncReady = this.isSyncReady(item);
            if (syncReady === true) {
                results.syncStatus.ready++;
            } else if (syncReady === false) {
                results.syncStatus.notReady++;
            } else {
                results.syncStatus.unknown++;
            }
        }

        // Check for orphaned registry entries
        if (this.registry) {
            for (const entry of this.registry.entries) {
                if (entry.path) {
                    const normalizedPath = this.normalizePath(entry.path);
                    if (!contentPaths.has(normalizedPath)) {
                        results.registryGaps.orphaned.push({
                            id: entry.id,
                            path: entry.path
                        });

                        results.issues.push({
                            code: 'REG-002',
                            severity: 'warning',
                            type: 'orphaned_entry',
                            message: `Registry entry '${entry.id}' has no matching file`,
                            registryPath: entry.path,
                            fix: 'Remove entry from content-registry.js or create the file'
                        });
                    }
                }
            }
        }

        // Sort issues by severity
        results.issues.sort((a, b) => {
            const order = { critical: 0, warning: 1, suspect: 2, info: 3 };
            return (order[a.severity] || 4) - (order[b.severity] || 4);
        });

        return results;
    }

    /**
     * Check if content is registered
     */
    isContentRegistered(item) {
        if (!this.registry) return null;

        // Check by path
        const normalizedPath = this.normalizePath(item.path);
        for (const entry of this.registry.entries) {
            if (entry.path && this.normalizePath(entry.path) === normalizedPath) {
                return true;
            }

            // Check component paths (presentation, applet, lab, quiz, etc.)
            if (entry.componentPaths) {
                for (const cp of entry.componentPaths) {
                    if (this.normalizePath(cp) === normalizedPath) {
                        return true;
                    }
                }
            }
        }

        // Check by id patterns
        const possibleIds = this.generatePossibleIds(item);
        for (const id of possibleIds) {
            if (this.registry.ids.includes(id)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Generate possible IDs for a content item
     */
    generatePossibleIds(item) {
        const ids = [];

        // From config
        if (item.config) {
            if (item.config.moduleId) {
                ids.push(item.config.moduleId);
                if (item.house) {
                    ids.push(`${item.house}-${item.config.moduleId}`);
                }
            }
        }

        // From filename
        const filename = path.basename(item.path, path.extname(item.path));
        ids.push(filename);
        if (item.house) {
            ids.push(`${item.house}-${filename}`);
        }

        return ids;
    }

    /**
     * Determine if content should be registered
     */
    shouldBeRegistered(item) {
        // Only track actual content, not indexes or core files
        const role = item.role || '';
        if (role.includes('index') || role.includes('core')) {
            return false;
        }

        // Content types that should be registered
        const trackableTypes = ['quiz', 'presentation', 'lab', 'applet'];
        return trackableTypes.includes(item.contentType);
    }

    /**
     * Determine if content is sync-ready
     */
    isSyncReady(item) {
        // Not applicable to non-content
        if (!['quiz', 'presentation', 'lab', 'applet'].includes(item.contentType)) {
            return null;
        }

        // Check for critical issues
        if (item.issues) {
            const criticalIssues = item.issues.filter(i => i.severity === 'critical');
            if (criticalIssues.length > 0) {
                return false;
            }
        }

        // Check for required configuration
        if (item.contentType === 'quiz') {
            if (!item.config.moduleId || item.config.trackProgress === false) {
                return false;
            }
        }

        if (item.contentType === 'presentation') {
            if (!item.config.tracksProgress) {
                return false;
            }
        }

        return true;
    }

    /**
     * Normalize file path for comparison
     */
    normalizePath(filePath) {
        if (!filePath) return '';
        return filePath
            .replace(/\\/g, '/')
            .replace(/^\.\//, '')
            .replace(/^_app\//, '')
            .replace(/houses\//, '')
            .toLowerCase();
    }
}

module.exports = ValidatorOrchestrator;
