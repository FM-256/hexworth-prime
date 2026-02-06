/**
 * EduScan - File System Scanner
 *
 * Walks directory tree, identifies content files, builds hierarchy.
 */

const fs = require('fs');
const path = require('path');

// File extensions to scan
const SCAN_EXTENSIONS = ['.html', '.htm'];

// Directories to skip
const SKIP_DIRS = [
    'node_modules',
    '.git',
    '_archive',
    '_planning',
    'assets',
    'audio',
    'images',
    'fonts'
];

// Files to skip
const SKIP_FILES = [
    '.DS_Store',
    'Thumbs.db'
];

class Scanner {
    constructor(options = {}) {
        this.rootPath = options.rootPath || './_app';
        this.verbose = options.verbose || false;
        this.stats = {
            filesScanned: 0,
            dirsScanned: 0,
            contentFiles: 0,
            skipped: 0
        };
    }

    /**
     * Scan the directory tree
     * @returns {Object} { hierarchy, files, stats }
     */
    scan() {
        const startTime = Date.now();

        if (this.verbose) {
            console.log(`[SCAN] Starting scan of: ${path.resolve(this.rootPath)}`);
        }

        const absoluteRoot = path.resolve(this.rootPath);

        if (!fs.existsSync(absoluteRoot)) {
            throw new Error(`Root path does not exist: ${absoluteRoot}`);
        }

        const hierarchy = this.buildHierarchy(absoluteRoot, '');
        const files = this.flattenFiles(hierarchy);

        const duration = Date.now() - startTime;

        return {
            hierarchy,
            files,
            stats: {
                ...this.stats,
                duration,
                rootPath: absoluteRoot
            }
        };
    }

    /**
     * Recursively build directory hierarchy
     */
    buildHierarchy(dirPath, relativePath) {
        this.stats.dirsScanned++;

        const name = path.basename(dirPath) || dirPath;
        const node = {
            name,
            type: 'directory',
            path: relativePath || name,
            children: {}
        };

        let entries;
        try {
            entries = fs.readdirSync(dirPath, { withFileTypes: true });
        } catch (err) {
            if (this.verbose) {
                console.warn(`[SCAN] Cannot read directory: ${dirPath}`);
            }
            return node;
        }

        for (const entry of entries) {
            const entryPath = path.join(dirPath, entry.name);
            const entryRelative = relativePath ? `${relativePath}/${entry.name}` : entry.name;

            if (entry.isDirectory()) {
                // Skip excluded directories
                if (SKIP_DIRS.includes(entry.name)) {
                    this.stats.skipped++;
                    continue;
                }

                // Recurse into subdirectory
                node.children[entry.name] = this.buildHierarchy(entryPath, entryRelative);

            } else if (entry.isFile()) {
                // Skip excluded files
                if (SKIP_FILES.includes(entry.name)) {
                    this.stats.skipped++;
                    continue;
                }

                const ext = path.extname(entry.name).toLowerCase();

                // Only scan content files
                if (SCAN_EXTENSIONS.includes(ext)) {
                    this.stats.filesScanned++;

                    const fileNode = this.scanFile(entryPath, entryRelative);
                    node.children[entry.name] = fileNode;
                }
            }
        }

        // Determine directory type based on path/contents
        node.dirType = this.classifyDirectory(relativePath, node.children);

        return node;
    }

    /**
     * Scan a single file and extract metadata
     */
    scanFile(filePath, relativePath) {
        let content;
        try {
            content = fs.readFileSync(filePath, 'utf8');
        } catch (err) {
            return {
                name: path.basename(filePath),
                type: 'file',
                path: relativePath,
                error: `Cannot read: ${err.message}`
            };
        }

        const ext = path.extname(filePath).toLowerCase();
        const name = path.basename(filePath);
        const size = fs.statSync(filePath).size;

        return {
            name,
            type: 'file',
            path: relativePath,
            extension: ext,
            size,
            content, // Will be parsed by parsers
            lines: content.split('\n').length
        };
    }

    /**
     * Classify directory type based on path and contents
     */
    classifyDirectory(relativePath, children) {
        if (!relativePath) return 'root';

        const pathLower = relativePath.toLowerCase();

        // House directories
        if (/^houses\/\w+$/.test(relativePath)) {
            const houseName = relativePath.split('/')[1];
            return `house:${houseName}`;
        }

        // Content type directories
        if (pathLower.includes('/quizzes')) return 'quizzes';
        if (pathLower.includes('/presentations')) return 'presentations';
        if (pathLower.includes('/labs')) return 'labs';
        if (pathLower.includes('/applets')) return 'applets';
        if (pathLower.includes('/modules')) return 'modules';
        if (pathLower.includes('/courses')) return 'courses';
        if (pathLower.includes('/components')) return 'components';
        if (pathLower.includes('/config')) return 'config';
        if (pathLower.includes('/styles')) return 'styles';

        return 'directory';
    }

    /**
     * Flatten hierarchy into array of files
     */
    flattenFiles(node, files = []) {
        if (node.type === 'file') {
            files.push(node);
        } else if (node.children) {
            for (const child of Object.values(node.children)) {
                this.flattenFiles(child, files);
            }
        }
        return files;
    }

    /**
     * Get scan statistics
     */
    getStats() {
        return this.stats;
    }
}

module.exports = Scanner;
