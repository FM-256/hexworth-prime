#!/usr/bin/env node
/**
 * Registry Generator - Auto-generate content-registry.js entries
 *
 * Scans _app/houses/ and _app/dark-arts/ for content files,
 * extracts metadata, groups related files into component bundles,
 * cross-references existing registry entries, and outputs
 * merge-ready JS that can be appended to content-registry.js.
 *
 * Usage:
 *   node _tools/eduscan/generators/registry-generator.js
 *   node _tools/eduscan/generators/registry-generator.js --dry-run
 *   node _tools/eduscan/generators/registry-generator.js --output staging.js
 */

const fs = require('fs');
const path = require('path');

// ═══════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════

const ROOT = path.resolve(__dirname, '../../../_app');
const REGISTRY_PATH = path.resolve(ROOT, 'config/content-registry.js');

const SCAN_DIRS = [
    path.join(ROOT, 'houses'),
    path.join(ROOT, 'dark-arts')
];

// File type suffixes that map to content types
const TYPE_SUFFIXES = {
    '.applet.html':       'applet',
    '.lab.html':          'lab',
    '.quiz.html':         'quiz',
    '.presentation.html': 'presentation',
    '.tool.html':         'tool',
    '.module.html':       'module',
    '.exam.html':         'exam',
    '.simulator.html':    'simulator',
    '.reference.html':    'reference',
    '.textbook.html':     'textbook',
    '.barricade.html':    'barricade'
};

// Types that trigger REG-001 in EduScan (must be registered)
const TRACKABLE_TYPES = ['quiz', 'presentation', 'lab', 'applet'];

// Default duration by content type (minutes)
const DEFAULT_DURATION = {
    quiz: 15,
    lab: 30,
    presentation: 20,
    applet: 25,
    module: 45,
    tool: 20,
    exam: 30,
    simulator: 60,
    reference: 15,
    textbook: 45,
    barricade: 10
};

// House domain keywords for topic generation
const HOUSE_TOPICS = {
    forge:      ['hardware', 'systems'],
    web:        ['networking', 'protocols'],
    shield:     ['security', 'defense'],
    cloud:      ['cloud', 'infrastructure'],
    script:     ['linux', 'command-line'],
    eye:        ['monitoring', 'analysis'],
    key:        ['cryptography', 'encryption'],
    code:       ['development', 'devops'],
    'dark-arts': ['offensive-security', 'ethical-hacking']
};

// ═══════════════════════════════════════════════════════════════
// FILE SCANNING
// ═══════════════════════════════════════════════════════════════

function scanContentFiles(dirs) {
    const files = [];

    function walk(dir) {
        if (!fs.existsSync(dir)) return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                walk(fullPath);
            } else if (entry.name.endsWith('.html') && entry.name !== 'index.html') {
                files.push(fullPath);
            }
        }
    }

    for (const dir of dirs) {
        walk(dir);
    }

    return files;
}

// ═══════════════════════════════════════════════════════════════
// METADATA EXTRACTION
// ═══════════════════════════════════════════════════════════════

function getContentType(filename) {
    for (const [suffix, type] of Object.entries(TYPE_SUFFIXES)) {
        if (filename.endsWith(suffix)) {
            return type;
        }
    }
    return null;
}

function getRelativePath(fullPath) {
    // Path relative to _app/, using forward slashes
    return path.relative(ROOT, fullPath).replace(/\\/g, '/');
}

function getComponentPath(fullPath) {
    // Component paths in registry use houses/ or dark-arts/ prefix (relative to _app/)
    return getRelativePath(fullPath);
}

function extractHouse(relativePath) {
    // houses/{house}/... or dark-arts/...
    const houseMatch = relativePath.match(/^houses\/([^/]+)\//);
    if (houseMatch) return houseMatch[1];

    if (relativePath.startsWith('dark-arts/')) return 'dark-arts';

    return null;
}

function extractTitle(fullPath) {
    try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const titleMatch = content.match(/<title>([^<]+)<\/title>/i);
        if (titleMatch) {
            let title = titleMatch[1].trim();
            // SEP = dash, en-dash, em-dash, or pipe as separator
            const SEP = /\s*[\-\u2013\u2014|]\s*/;
            const sepSrc = SEP.source;

            // Strip common suffixes iteratively (most specific first)
            const suffixPatterns = [
                // Platform / branding
                new RegExp(sepSrc + 'House of (the )?\\w+$', 'i'),
                new RegExp(sepSrc + 'Hexworth\\s*(Prime|Academy)?\\s*(Dark Arts Vault)?$', 'i'),
                new RegExp(sepSrc + 'The Dark Arts$', 'i'),
                new RegExp(sepSrc + 'Dark Arts Vault$', 'i'),
                new RegExp(sepSrc + '\\w+ House\\s*(Game|CyberOps)?$', 'i'),
                // CompTIA / certification suffixes
                new RegExp(sepSrc + 'CompTIA\\s+A\\+\\s+(Core\\s+\\d\\s+)?Lab$', 'i'),
                new RegExp(sepSrc + 'CompTIA\\s+A\\+\\s+Core\\s+\\d$', 'i'),
                new RegExp(sepSrc + 'CompTIA\\s+[\\w\\s+]+$', 'i'),
                new RegExp(sepSrc + 'A\\+\\s+Core\\s+\\d$', 'i'),
                // CyberOps suffixes
                new RegExp(sepSrc + 'CyberOps\\s+200-201$', 'i'),
                new RegExp(sepSrc + 'CyberOps\\s+Week\\s+\\d+$', 'i'),
                new RegExp(sepSrc + 'CyberOps\\s+Associate$', 'i'),
                new RegExp(sepSrc + 'CyberOps$', 'i'),
                // Other cert / course suffixes
                new RegExp(sepSrc + 'EC-Council\\s+\\w+$', 'i'),
                new RegExp(sepSrc + 'CySA\\+$', 'i'),
                new RegExp(sepSrc + 'CASP\\+$', 'i'),
                // Course / house suffixes
                new RegExp(sepSrc + 'House of Script$', 'i'),
                new RegExp(sepSrc + 'CLH\\s+[\\w\\s]+$', 'i'),
                new RegExp(sepSrc + 'Linux\\s+Essentials$', 'i'),
                new RegExp(sepSrc + 'IT Support Scenarios$', 'i'),
                new RegExp(sepSrc + 'Deep Dive$', 'i'),
                new RegExp(sepSrc + 'Hexworth\\s+Enterprise$', 'i'),
                new RegExp(sepSrc + 'Demo$', 'i'),
            ];

            for (const pat of suffixPatterns) {
                title = title.replace(pat, '');
            }

            // Decode common HTML entities
            title = title
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#39;/g, "'");

            // Strip leading type prefixes: "Lab: ", "Quiz: ", etc.
            title = title
                .replace(/^(Lab|Quiz|Module|Presentation|Exam):\s*/i, '')
                .trim();
            return title;
        }
    } catch (e) {
        // File read error, use fallback
    }
    return null;
}

function deriveBaseName(filename) {
    // Strip type suffix to get base name
    for (const suffix of Object.keys(TYPE_SUFFIXES)) {
        if (filename.endsWith(suffix)) {
            return filename.slice(0, -suffix.length);
        }
    }
    // Plain .html - strip just .html
    return filename.replace(/\.html$/, '');
}

function titleFromId(id) {
    // Convert kebab-case ID to Title Case, stripping house prefix
    return id
        .replace(/^[a-z]+-/, '') // strip house prefix (first segment)
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
}

function extractTopicsFromTitle(title) {
    // Extract meaningful keywords from title
    const stopWords = new Set([
        'the', 'a', 'an', 'and', 'or', 'of', 'for', 'in', 'on', 'to', 'with',
        'is', 'it', 'lab', 'quiz', 'module', 'presentation', 'applet', 'tool',
        'house', 'intro', 'introduction', 'practice', 'review', 'advanced',
        'basic', 'basics', 'fundamentals', 'essentials'
    ]);

    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .split(/\s+/)
        .filter(w => w.length > 2 && !stopWords.has(w))
        .slice(0, 3)
        .map(w => w.replace(/\s+/g, '-'));
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT GROUPING
// ═══════════════════════════════════════════════════════════════

function groupIntoEntries(fileInfos) {
    // Strategy:
    // 1. Group files by house + base name
    // 2. Files sharing a base name become components of one module entry
    // 3. For course-structured content (clh modules etc.), group by directory
    // 4. Standalone files get their own entry

    const groups = new Map(); // groupKey -> { files: [], house, baseName }

    for (const info of fileInfos) {
        const groupKey = computeGroupKey(info);

        if (!groups.has(groupKey)) {
            groups.set(groupKey, {
                files: [],
                house: info.house,
                baseName: info.baseName,
                groupKey
            });
        }
        groups.get(groupKey).files.push(info);
    }

    return groups;
}

function computeGroupKey(info) {
    // For course-structured content like CLH modules with subdirectories,
    // group by the module directory
    const clhMatch = info.relativePath.match(
        /houses\/([^/]+)\/courses\/([^/]+)\/modules\/([^/]+)\//
    );
    if (clhMatch) {
        return `${clhMatch[1]}::course::${clhMatch[2]}-${clhMatch[3]}`;
    }

    // For module-directory-structured content (e.g., WSA modules),
    // group by the module directory path
    const moduleDirMatch = info.relativePath.match(
        /houses\/([^/]+)\/modules\/([^/]+)\/([^/]+)\//
    );
    if (moduleDirMatch) {
        return `${moduleDirMatch[1]}::moddir::${moduleDirMatch[2]}-${moduleDirMatch[3]}`;
    }

    // For files whose base name doesn't start with the house prefix,
    // include parent directory to avoid collisions across subdirectories
    const parentDir = path.dirname(info.relativePath);
    if (!info.baseName.startsWith(`${info.house}-`)) {
        return `${info.house}::${parentDir}::${info.baseName}`;
    }

    // Default: group by house + base name
    return `${info.house}::${info.baseName}`;
}

function buildEntryFromGroup(group) {
    const { files, house } = group;

    // Determine entry ID
    let entryId = deriveEntryId(group);

    // Determine entry type
    let entryType = deriveEntryType(files);

    // Build components map — handle collisions by appending a suffix
    const components = {};
    const keyCount = {};
    for (const file of files) {
        let componentKey = mapTypeToComponentKey(file.contentType);
        if (componentKey) {
            if (components[componentKey]) {
                // Collision: derive a unique key from the filename
                const fileStem = deriveBaseName(file.filename);
                const shortSuffix = fileStem.replace(/^[^-]+-/, ''); // strip house prefix
                componentKey = shortSuffix || componentKey + (keyCount[componentKey] || 2);
            }
            keyCount[componentKey] = (keyCount[componentKey] || 1) + 1;
            components[componentKey] = file.componentPath;
        }
    }

    // Extract best title (prefer presentation, then module, then first file)
    let title = null;
    const titlePriority = ['presentation', 'module', 'lab', 'quiz', 'applet', 'tool'];
    for (const pType of titlePriority) {
        const f = files.find(f => f.contentType === pType);
        if (f && f.title) {
            title = f.title;
            break;
        }
    }
    if (!title) {
        title = files[0].title || titleFromId(entryId);
    }

    // Generate topics
    const houseTopics = HOUSE_TOPICS[house] || [];
    const titleTopics = extractTopicsFromTitle(title);
    const topics = [...new Set([...titleTopics, ...houseTopics])].slice(0, 5);

    // Generate description
    const typeLabel = entryType === 'module' ? 'module' : entryType;
    const houseLabel = house === 'dark-arts' ? 'Dark Arts' : house;
    const description = `${title} \u2014 ${typeLabel} content for ${houseLabel} house`;

    return {
        id: entryId,
        title,
        description,
        house,
        type: entryType,
        difficulty: 'beginner',
        duration: DEFAULT_DURATION[entryType] || 20,
        topics,
        paths: [],
        components,
        prerequisites: [],
        objectives: []
    };
}

function deriveEntryId(group) {
    const { files, house, baseName, groupKey } = group;

    // Course-structured content
    if (groupKey.includes('::course::')) {
        const coursePart = groupKey.split('::course::')[1];
        return `${house}-${coursePart}`;
    }

    // Module-directory-structured content (e.g., WSA)
    if (groupKey.includes('::moddir::')) {
        const moddirPart = groupKey.split('::moddir::')[1];
        return `${house}-${moddirPart}`;
    }

    // Use the base name; ensure house prefix
    if (baseName.startsWith(`${house}-`) || baseName.startsWith('da-')) {
        return baseName;
    }
    return `${house}-${baseName}`;
}

function deriveEntryType(files) {
    // If multiple trackable types, it's a module
    const trackableFiles = files.filter(f => TRACKABLE_TYPES.includes(f.contentType));
    if (trackableFiles.length > 1) return 'module';

    // If a single file, use its content type
    if (files.length === 1) return files[0].contentType;

    // Mixed: check if it includes presentation + something
    const types = new Set(files.map(f => f.contentType));
    if (types.has('presentation') && (types.has('lab') || types.has('quiz') || types.has('applet'))) {
        return 'module';
    }

    // Default to first file's type
    return files[0].contentType;
}

function mapTypeToComponentKey(contentType) {
    // Map content type to component key used in registry
    const mapping = {
        presentation: 'presentation',
        applet: 'applet',
        lab: 'lab',
        quiz: 'quiz',
        tool: 'applet',       // tools are listed as applet components
        module: 'module',
        exam: 'quiz',         // exams are listed as quiz components
        simulator: 'applet',  // simulators as applet components
        reference: 'reference',
        textbook: 'textbook',
        barricade: 'barricade'
    };
    return mapping[contentType] || contentType;
}

// ═══════════════════════════════════════════════════════════════
// CROSS-REFERENCE WITH EXISTING REGISTRY
// ═══════════════════════════════════════════════════════════════

function loadExistingRegistry() {
    if (!fs.existsSync(REGISTRY_PATH)) {
        console.warn('Registry file not found:', REGISTRY_PATH);
        return { ids: new Set(), paths: new Set() };
    }

    const content = fs.readFileSync(REGISTRY_PATH, 'utf8');

    // Extract all entry IDs
    const ids = new Set();
    const idPattern = /{\s*id:\s*['"]([^'"]+)['"]/g;
    let match;
    while ((match = idPattern.exec(content)) !== null) {
        ids.add(match[1]);
    }

    // Extract all component paths referenced in the registry
    const paths = new Set();
    const pathPattern = /(?:presentation|applet|lab|quiz|tool|module|simulator|reference|textbook|barricade):\s*['"]([^'"]+)['"]/g;
    while ((match = pathPattern.exec(content)) !== null) {
        paths.add(normalizePath(match[1]));
    }

    return { ids, paths };
}

function normalizePath(p) {
    return p
        .replace(/\\/g, '/')
        .replace(/^\.\//, '')
        .replace(/^_app\//, '')
        .toLowerCase();
}

function isAlreadyRegistered(entry, existingRegistry) {
    // Check if the entry ID already exists
    if (existingRegistry.ids.has(entry.id)) return true;

    // Check if ALL component paths are already referenced
    const componentPaths = Object.values(entry.components);
    if (componentPaths.length > 0) {
        const allRegistered = componentPaths.every(
            cp => existingRegistry.paths.has(normalizePath(cp))
        );
        if (allRegistered) return true;
    }

    return false;
}

// ═══════════════════════════════════════════════════════════════
// OUTPUT FORMATTING
// ═══════════════════════════════════════════════════════════════

function formatEntry(entry, indent = '        ') {
    const lines = [];
    lines.push(`${indent}'${entry.id}': {`);
    lines.push(`${indent}    id: '${entry.id}',`);
    lines.push(`${indent}    title: '${escapeJs(entry.title)}',`);
    lines.push(`${indent}    description: '${escapeJs(entry.description)}',`);
    lines.push(`${indent}    house: '${entry.house}',`);
    lines.push(`${indent}    type: '${entry.type}',`);
    lines.push(`${indent}    difficulty: '${entry.difficulty}',`);
    lines.push(`${indent}    duration: ${entry.duration},`);
    lines.push(`${indent}    topics: [${entry.topics.map(t => `'${t}'`).join(', ')}],`);
    lines.push(`${indent}    paths: [],`);
    lines.push(`${indent}    components: {`);

    const compEntries = Object.entries(entry.components);
    for (let i = 0; i < compEntries.length; i++) {
        const [key, val] = compEntries[i];
        const comma = i < compEntries.length - 1 ? ',' : '';
        const quotedKey = key.includes('-') ? `'${key}'` : key;
        lines.push(`${indent}        ${quotedKey}: '${val}'${comma}`);
    }

    lines.push(`${indent}    },`);
    lines.push(`${indent}    prerequisites: [],`);
    lines.push(`${indent}    objectives: []`);
    lines.push(`${indent}},`);

    return lines.join('\n');
}

function escapeJs(str) {
    return str.replace(/'/g, "\\'").replace(/\n/g, '\\n');
}

function formatOutput(entriesByHouse) {
    const lines = [];
    lines.push('');
    lines.push('        // ═══════════════════════════════════════════════════════════════');
    lines.push('        // AUTO-GENERATED ENTRIES (registry-generator.js)');
    lines.push('        // Generated: ' + new Date().toISOString().split('T')[0]);
    lines.push('        // ═══════════════════════════════════════════════════════════════');

    const houseOrder = ['forge', 'web', 'shield', 'cloud', 'script', 'eye', 'key', 'code', 'dark-arts'];

    for (const house of houseOrder) {
        const entries = entriesByHouse[house];
        if (!entries || entries.length === 0) continue;

        const houseLabel = house === 'dark-arts'
            ? 'DARK ARTS - Offensive Security'
            : `${house.toUpperCase()} HOUSE`;

        lines.push('');
        lines.push(`        // \u2500\u2500\u2500 ${houseLabel} (auto-generated) \u2500\u2500\u2500`);

        // Sort entries by ID for consistency
        entries.sort((a, b) => a.id.localeCompare(b.id));

        for (const entry of entries) {
            lines.push(formatEntry(entry));
        }
    }

    return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════

function main() {
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const outputIdx = args.indexOf('--output');
    const outputFile = outputIdx !== -1 ? args[outputIdx + 1] : null;

    console.log('Registry Generator');
    console.log('==================\n');

    // Step 1: Scan files
    console.log('Scanning content files...');
    const allFiles = scanContentFiles(SCAN_DIRS);
    console.log(`  Found ${allFiles.length} HTML files\n`);

    // Step 2: Extract metadata and filter to typed content
    console.log('Extracting metadata...');
    const fileInfos = [];
    let skippedNoType = 0;

    for (const fullPath of allFiles) {
        const filename = path.basename(fullPath);
        const contentType = getContentType(filename);

        if (!contentType) {
            skippedNoType++;
            continue;
        }

        const relativePath = getRelativePath(fullPath);
        const componentPath = getComponentPath(fullPath);
        const house = extractHouse(relativePath);
        const baseName = deriveBaseName(filename);
        const title = extractTitle(fullPath);

        fileInfos.push({
            fullPath,
            filename,
            relativePath,
            componentPath,
            contentType,
            house,
            baseName,
            title
        });
    }
    console.log(`  ${fileInfos.length} typed content files`);
    console.log(`  ${skippedNoType} skipped (no type suffix)\n`);

    // Step 3: Group into entries
    console.log('Grouping into registry entries...');
    const groups = groupIntoEntries(fileInfos);
    console.log(`  ${groups.size} groups formed\n`);

    // Step 4: Build entries
    const entries = [];
    for (const group of groups.values()) {
        entries.push(buildEntryFromGroup(group));
    }
    console.log(`  ${entries.length} entries built\n`);

    // Step 5: Cross-reference with existing registry
    console.log('Cross-referencing existing registry...');
    const existing = loadExistingRegistry();
    console.log(`  ${existing.ids.size} existing IDs`);
    console.log(`  ${existing.paths.size} existing component paths\n`);

    const newEntries = entries.filter(e => !isAlreadyRegistered(e, existing));
    const skippedExisting = entries.length - newEntries.length;
    console.log(`  ${skippedExisting} entries already registered (skipped)`);
    console.log(`  ${newEntries.length} NEW entries to generate\n`);

    // Step 6: Organize by house
    const entriesByHouse = {};
    for (const entry of newEntries) {
        const h = entry.house || 'unknown';
        if (!entriesByHouse[h]) entriesByHouse[h] = [];
        entriesByHouse[h].push(entry);
    }

    // Print summary
    console.log('Summary by house:');
    for (const [house, hEntries] of Object.entries(entriesByHouse).sort()) {
        console.log(`  ${house}: ${hEntries.length} new entries`);
    }
    console.log('');

    // Step 7: Generate output
    const output = formatOutput(entriesByHouse);

    if (dryRun) {
        console.log('=== DRY RUN - Preview ===\n');
        // Show first 50 lines
        const previewLines = output.split('\n').slice(0, 50);
        console.log(previewLines.join('\n'));
        if (output.split('\n').length > 50) {
            console.log(`\n... (${output.split('\n').length - 50} more lines)`);
        }
        console.log(`\nTotal output: ${output.split('\n').length} lines`);
        return;
    }

    if (outputFile) {
        // Write to staging file
        const outputPath = path.resolve(outputFile);
        fs.writeFileSync(outputPath, output, 'utf8');
        console.log(`Output written to: ${outputPath}`);
        console.log(`Lines: ${output.split('\n').length}`);
    } else {
        // Default: write to stdout
        console.log('=== Generated Output ===');
        process.stdout.write(output);
        console.log('\n');
    }

    // Print merge instructions
    console.log('\nMerge instructions:');
    console.log('  1. Open _app/config/content-registry.js');
    console.log('  2. Find the closing brace of the content object (line ~10583)');
    console.log('  3. Paste the generated entries BEFORE that closing brace');
    console.log('  4. Run: node _tools/eduscan/tests/run.js');
    console.log('  5. Run: node _tools/eduscan/cli.js --profile strict');
}

main();
