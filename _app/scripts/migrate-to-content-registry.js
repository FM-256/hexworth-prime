#!/usr/bin/env node
/**
 * migrate-to-content-registry.js
 *
 * Migrates SAMPLE_MODULES entries from house index.html files
 * to ContentRegistry.js format.
 *
 * Usage: node scripts/migrate-to-content-registry.js
 *
 * This script:
 * 1. Reads all SAMPLE_MODULES from each house's index.html
 * 2. Reads existing ContentRegistry.js entries
 * 3. Identifies missing entries
 * 4. Generates ContentRegistry format entries
 * 5. Outputs a new content-registry-migrated.js file
 */

const fs = require('fs');
const path = require('path');

// Configuration
const HOUSES = ['shield', 'web', 'cloud', 'forge', 'script', 'code', 'key', 'eye'];
const APP_DIR = path.join(__dirname, '..');
const HOUSES_DIR = path.join(APP_DIR, 'houses');
const REGISTRY_PATH = path.join(APP_DIR, 'config', 'content-registry.js');
const OUTPUT_PATH = path.join(APP_DIR, 'config', 'content-registry-migrated.js');

// Stats
const stats = {
    totalSampleModules: 0,
    existingRegistry: 0,
    newEntries: 0,
    houses: {}
};

/**
 * Extract SAMPLE_MODULES from a house index.html file
 */
function extractSampleModules(houseId) {
    const indexPath = path.join(HOUSES_DIR, houseId, 'index.html');

    if (!fs.existsSync(indexPath)) {
        console.log(`  ⚠️  No index.html found for ${houseId}`);
        return [];
    }

    const content = fs.readFileSync(indexPath, 'utf8');

    // Find SAMPLE_MODULES array using regex
    const modulesMatch = content.match(/const\s+SAMPLE_MODULES\s*=\s*\[([\s\S]*?)\];/);

    if (!modulesMatch) {
        console.log(`  ⚠️  No SAMPLE_MODULES found in ${houseId}/index.html`);
        return [];
    }

    const modulesString = modulesMatch[1];
    const modules = [];

    // Parse individual module objects
    // Match objects like {id: '...', title: '...', ...}
    const objectRegex = /\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g;
    let match;

    while ((match = objectRegex.exec(modulesString)) !== null) {
        const objString = match[1];

        // Extract properties
        const module = {};

        // id
        const idMatch = objString.match(/id:\s*['"]([^'"]+)['"]/);
        if (idMatch) module.id = idMatch[1];

        // title
        const titleMatch = objString.match(/title:\s*['"]([^'"]+)['"]/);
        if (titleMatch) module.title = titleMatch[1];

        // description
        const descMatch = objString.match(/description:\s*['"]([^'"]+)['"]/);
        if (descMatch) module.description = descMatch[1];

        // icon
        const iconMatch = objString.match(/icon:\s*['"]([^'"]+)['"]/);
        if (iconMatch) module.icon = iconMatch[1];

        // status
        const statusMatch = objString.match(/status:\s*['"]([^'"]+)['"]/);
        if (statusMatch) module.status = statusMatch[1];

        // category
        const categoryMatch = objString.match(/category:\s*['"]([^'"]+)['"]/);
        if (categoryMatch) module.category = categoryMatch[1];

        // href
        const hrefMatch = objString.match(/href:\s*['"]([^'"]+)['"]/);
        if (hrefMatch) module.href = hrefMatch[1];

        // components array
        const componentsMatch = objString.match(/components:\s*\[([^\]]+)\]/);
        if (componentsMatch) {
            const compString = componentsMatch[1];
            module.components = compString.match(/['"]([^'"]+)['"]/g)?.map(s => s.replace(/['"]/g, '')) || [];
        }

        if (module.id) {
            module.house = houseId;
            modules.push(module);
        }
    }

    return modules;
}

/**
 * Extract existing ContentRegistry entries
 */
function extractExistingRegistry() {
    if (!fs.existsSync(REGISTRY_PATH)) {
        console.log('⚠️  ContentRegistry.js not found');
        return new Set();
    }

    const content = fs.readFileSync(REGISTRY_PATH, 'utf8');
    const ids = new Set();

    // Match all content entry IDs
    const idRegex = /'([a-z]+-[a-z0-9-]+)':\s*\{/g;
    let match;

    while ((match = idRegex.exec(content)) !== null) {
        ids.add(match[1]);
    }

    return ids;
}

/**
 * Determine content type from href and components
 */
function determineType(module) {
    const href = module.href || '';
    const components = module.components || [];

    if (href.includes('/quizzes/') || components.includes('quiz')) return 'quiz';
    if (href.includes('/labs/') || components.includes('lab')) return 'lab';
    if (href.includes('/presentations/') || components.includes('presentation')) return 'presentation';
    if (href.includes('/tools/')) return 'tool';
    if (href.includes('/applets/') || components.includes('applet')) return 'applet';

    return 'module';
}

/**
 * Estimate difficulty from category or title
 */
function estimateDifficulty(module) {
    const title = (module.title || '').toLowerCase();
    const category = (module.category || '').toLowerCase();

    if (title.includes('advanced') || title.includes('expert')) return 'advanced';
    if (title.includes('intermediate') || category.includes('operations')) return 'intermediate';
    if (title.includes('fundamental') || title.includes('intro') || title.includes('basic')) return 'beginner';

    // Default based on category
    if (category === 'fundamentals' || category === 'basics') return 'beginner';
    if (category === 'operations' || category === 'governance') return 'intermediate';

    return 'beginner';
}

/**
 * Estimate duration based on type
 */
function estimateDuration(module) {
    const type = determineType(module);
    const components = module.components || [];

    let base = 30;
    if (type === 'quiz') base = 15;
    if (type === 'presentation') base = 25;
    if (type === 'lab') base = 45;
    if (type === 'tool') base = 30;
    if (type === 'applet') base = 20;

    // Add time for multiple components
    if (components.length > 1) base += (components.length - 1) * 10;

    return base;
}

/**
 * Generate topics from category and title
 */
function generateTopics(module) {
    const topics = [];
    const category = module.category || '';
    const title = (module.title || '').toLowerCase();
    const house = module.house;

    // Add category as topic
    if (category) topics.push(category.replace(/-/g, '-'));

    // House-specific topics
    const houseTopic = {
        shield: 'security',
        web: 'networking',
        cloud: 'cloud',
        forge: 'systems',
        script: 'scripting',
        code: 'devops',
        key: 'cryptography',
        eye: 'monitoring'
    };
    if (houseTopic[house]) topics.push(houseTopic[house]);

    // Title-based topics
    if (title.includes('linux')) topics.push('linux');
    if (title.includes('windows')) topics.push('windows');
    if (title.includes('python')) topics.push('python');
    if (title.includes('aws')) topics.push('aws');
    if (title.includes('azure')) topics.push('azure');
    if (title.includes('docker')) topics.push('docker');
    if (title.includes('network')) topics.push('networking');
    if (title.includes('encrypt')) topics.push('encryption');
    if (title.includes('hash')) topics.push('hashing');

    return [...new Set(topics)].slice(0, 5);
}

/**
 * Build full component path
 */
function buildComponentPath(house, href, type) {
    if (!href) return null;
    return `houses/${house}/${href}`;
}

/**
 * Convert SAMPLE_MODULES entry to ContentRegistry format
 */
function convertToRegistryFormat(module) {
    const type = determineType(module);
    const componentPath = buildComponentPath(module.house, module.href, type);

    // Build components object
    const components = {};
    if (componentPath) {
        if (type === 'quiz') components.quiz = componentPath;
        else if (type === 'presentation') components.presentation = componentPath;
        else if (type === 'lab') components.lab = componentPath;
        else if (type === 'tool') components.tool = componentPath;
        else components.applet = componentPath;
    }

    return {
        id: module.id,
        title: module.title || 'Untitled',
        description: module.description || '',
        house: module.house,
        type: type,
        difficulty: estimateDifficulty(module),
        duration: estimateDuration(module),
        topics: generateTopics(module),
        paths: [],
        components: components,
        prerequisites: [],
        objectives: []
    };
}

/**
 * Format entry as JavaScript code
 */
function formatEntry(entry) {
    const indent = '        ';
    let code = `${indent}'${entry.id}': {\n`;
    code += `${indent}    id: '${entry.id}',\n`;
    code += `${indent}    title: '${entry.title.replace(/'/g, "\\'")}',\n`;
    code += `${indent}    description: '${entry.description.replace(/'/g, "\\'")}',\n`;
    code += `${indent}    house: '${entry.house}',\n`;
    code += `${indent}    type: '${entry.type}',\n`;
    code += `${indent}    difficulty: '${entry.difficulty}',\n`;
    code += `${indent}    duration: ${entry.duration},\n`;
    code += `${indent}    topics: [${entry.topics.map(t => `'${t}'`).join(', ')}],\n`;
    code += `${indent}    paths: [],\n`;

    // Components
    const compEntries = Object.entries(entry.components);
    if (compEntries.length > 0) {
        code += `${indent}    components: {\n`;
        compEntries.forEach(([key, val], i) => {
            code += `${indent}        ${key}: '${val}'${i < compEntries.length - 1 ? ',' : ''}\n`;
        });
        code += `${indent}    },\n`;
    } else {
        code += `${indent}    components: {},\n`;
    }

    code += `${indent}    prerequisites: [],\n`;
    code += `${indent}    objectives: []\n`;
    code += `${indent}}`;

    return code;
}

/**
 * Main migration function
 */
function migrate() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('  SAMPLE_MODULES → ContentRegistry Migration');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Get existing registry entries
    console.log('📖 Reading existing ContentRegistry.js...');
    const existingIds = extractExistingRegistry();
    stats.existingRegistry = existingIds.size;
    console.log(`   Found ${existingIds.size} existing entries\n`);

    // Collect all SAMPLE_MODULES
    console.log('📖 Reading SAMPLE_MODULES from all houses...');
    const allModules = [];

    for (const house of HOUSES) {
        const modules = extractSampleModules(house);
        stats.houses[house] = { total: modules.length, new: 0 };
        allModules.push(...modules);
        console.log(`   ${house}: ${modules.length} modules`);
    }

    stats.totalSampleModules = allModules.length;
    console.log(`\n   Total: ${allModules.length} modules across all houses\n`);

    // Find missing entries
    console.log('🔍 Identifying missing entries...');
    const missingModules = allModules.filter(m => !existingIds.has(m.id));
    stats.newEntries = missingModules.length;

    for (const module of missingModules) {
        stats.houses[module.house].new++;
    }

    console.log(`   ${missingModules.length} modules need to be added\n`);

    // Show per-house breakdown
    console.log('📊 Per-house breakdown:');
    for (const house of HOUSES) {
        const h = stats.houses[house];
        const pct = h.total > 0 ? Math.round((h.new / h.total) * 100) : 0;
        console.log(`   ${house}: ${h.new} new of ${h.total} total (${pct}% missing)`);
    }
    console.log('');

    // Convert to registry format
    console.log('🔄 Converting to ContentRegistry format...');
    const newEntries = missingModules.map(convertToRegistryFormat);

    // Group by house for organized output
    const entriesByHouse = {};
    for (const entry of newEntries) {
        if (!entriesByHouse[entry.house]) entriesByHouse[entry.house] = [];
        entriesByHouse[entry.house].push(entry);
    }

    // Generate output code
    let outputCode = `/**
 * ContentRegistry - Migrated Entries
 * Generated: ${new Date().toISOString()}
 *
 * These entries were auto-generated from SAMPLE_MODULES.
 * Review and merge into content-registry.js
 *
 * Stats:
 * - Existing entries: ${stats.existingRegistry}
 * - New entries: ${stats.newEntries}
 * - Total after merge: ${stats.existingRegistry + stats.newEntries}
 */

const MIGRATED_ENTRIES = {
`;

    let isFirstHouse = true;
    for (const house of HOUSES) {
        const entries = entriesByHouse[house] || [];
        if (entries.length === 0) continue;

        // Add comma after previous house's last entry
        if (!isFirstHouse) {
            outputCode += ',\n';
        }
        isFirstHouse = false;

        outputCode += `\n        // ─────────────────────────────────────────────────────────────\n`;
        outputCode += `        // ${house.toUpperCase()} HOUSE - ${entries.length} new entries\n`;
        outputCode += `        // ─────────────────────────────────────────────────────────────\n`;

        for (let i = 0; i < entries.length; i++) {
            outputCode += formatEntry(entries[i]);
            if (i < entries.length - 1) outputCode += ',';
            outputCode += '\n';
        }
    }

    outputCode += `\n};\n\nmodule.exports = MIGRATED_ENTRIES;\n`;

    // Write output file
    fs.writeFileSync(OUTPUT_PATH, outputCode);
    console.log(`\n✅ Generated: ${OUTPUT_PATH}`);

    // Summary
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`  Existing ContentRegistry entries: ${stats.existingRegistry}`);
    console.log(`  SAMPLE_MODULES total:             ${stats.totalSampleModules}`);
    console.log(`  New entries generated:            ${stats.newEntries}`);
    console.log(`  After merge:                      ${stats.existingRegistry + stats.newEntries}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('📋 Next steps:');
    console.log('   1. Review content-registry-migrated.js');
    console.log('   2. Merge entries into content-registry.js');
    console.log('   3. Deploy and verify on Dashboard');
    console.log('');
}

// Run migration
migrate();
