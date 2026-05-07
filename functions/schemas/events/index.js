/**
 * Event schema registry — analytics-v2.
 *
 * Each event type has a JSON schema in ./types/<event-name>.json with:
 *   - $id            : event type name (e.g., 'nav.session_start')
 *   - required       : required payload fields
 *   - properties     : typed field definitions
 *   - additionalProperties: false (strict)
 *   - governance     : { status, consentScope, phase, dimension }
 *
 * Loaded once at CF cold-start. Validation lives in ./validator.js.
 *
 * Adding a new event type:
 *   1. Drop a new JSON schema in ./types/<name>.json
 *   2. Append to TYPES array below
 *   3. Update doc §5.2
 *   4. Nancy review for governance.status (capture-only by default)
 */

const fs = require('fs');
const path = require('path');

const TYPES_DIR = path.join(__dirname, 'types');

// Phase 1 active event types (covering dimensions 1, 2, 9, 10).
// Schemas exist for other types but are not loaded until their phase.
const PHASE_1_TYPES = [
    'nav.session_start',
    'nav.session_end',
    'nav.heartbeat',
    'item.start',
    'item.complete',
    'item.attempt',
    'help.docs_view',
    'content.scroll',
];

const _schemas = {};

function loadSchemas() {
    if (Object.keys(_schemas).length > 0) return _schemas;
    for (const typeName of PHASE_1_TYPES) {
        const filePath = path.join(TYPES_DIR, `${typeName}.json`);
        try {
            const raw = fs.readFileSync(filePath, 'utf8');
            const schema = JSON.parse(raw);
            if (schema.$id !== typeName) {
                throw new Error(`schema $id mismatch: file ${typeName}.json declares $id="${schema.$id}"`);
            }
            _schemas[typeName] = schema;
        } catch (err) {
            throw new Error(`Failed to load event schema "${typeName}": ${err.message}`);
        }
    }
    return _schemas;
}

function getSchema(typeName) {
    const schemas = loadSchemas();
    return schemas[typeName] || null;
}

function listLoadedTypes() {
    return Object.keys(loadSchemas());
}

function getGovernance(typeName) {
    const s = getSchema(typeName);
    return s ? s.governance : null;
}

module.exports = {
    loadSchemas,
    getSchema,
    listLoadedTypes,
    getGovernance,
    PHASE_1_TYPES,
};
