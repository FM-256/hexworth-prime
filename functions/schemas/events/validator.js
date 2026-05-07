/**
 * Event payload validator — analytics-v2.
 *
 * Tiny hand-rolled JSON-Schema-subset validator. Avoids ajv to keep CF cold-start
 * fast and dependency surface small. Supports the subset of JSON Schema we use:
 *   - type: string | number | integer | boolean | object | null
 *   - required[]
 *   - properties{}
 *   - additionalProperties: false
 *   - enum
 *   - minimum / maximum
 *   - type as array (e.g., ["number", "null"])
 *
 * Returns: { valid: bool, errors: [{ path, message }] }
 */

const { getSchema } = require('./index');

function _typeOf(v) {
    if (v === null) return 'null';
    if (Array.isArray(v)) return 'array';
    if (Number.isInteger(v)) return 'integer';
    return typeof v;
}

function _allowedTypes(schemaType) {
    if (Array.isArray(schemaType)) return schemaType;
    return [schemaType];
}

function _validateNode(value, schema, path, errors) {
    if (!schema) return;

    // Type check
    if (schema.type !== undefined) {
        const allowed = _allowedTypes(schema.type);
        const actual = _typeOf(value);
        // 'integer' is a subset of 'number'
        const matched = allowed.some(t => {
            if (t === actual) return true;
            if (t === 'number' && actual === 'integer') return true;
            return false;
        });
        if (!matched) {
            errors.push({ path, message: `expected type ${allowed.join('|')}, got ${actual}` });
            return;
        }
    }

    // Enum
    if (schema.enum !== undefined) {
        if (!schema.enum.includes(value)) {
            errors.push({ path, message: `value not in enum [${schema.enum.join(', ')}]` });
            return;
        }
    }

    // Numeric bounds
    if (typeof value === 'number') {
        if (schema.minimum !== undefined && value < schema.minimum) {
            errors.push({ path, message: `value ${value} < minimum ${schema.minimum}` });
        }
        if (schema.maximum !== undefined && value > schema.maximum) {
            errors.push({ path, message: `value ${value} > maximum ${schema.maximum}` });
        }
    }

    // Object: required + properties + additionalProperties
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // required
        for (const req of schema.required || []) {
            if (!(req in value)) {
                errors.push({ path: `${path}.${req}`, message: `required field missing` });
            }
        }
        // properties
        const props = schema.properties || {};
        const allowedKeys = new Set(Object.keys(props));
        for (const [k, v] of Object.entries(value)) {
            if (props[k] !== undefined) {
                _validateNode(v, props[k], `${path}.${k}`, errors);
            } else if (schema.additionalProperties === false) {
                errors.push({ path: `${path}.${k}`, message: `unexpected field (additionalProperties: false)` });
            }
        }
    }
}

/**
 * Validate an event payload against its schema.
 *
 * @param {string} typeName  Event type name (e.g., 'nav.session_start')
 * @param {object} payload   The payload object to validate
 * @returns {{valid: boolean, errors: Array<{path: string, message: string}>}}
 */
function validateEventPayload(typeName, payload) {
    const schema = getSchema(typeName);
    if (!schema) {
        return { valid: false, errors: [{ path: '$', message: `unknown event type "${typeName}"` }] };
    }
    const errors = [];
    _validateNode(payload, schema, '$', errors);
    return { valid: errors.length === 0, errors };
}

module.exports = { validateEventPayload };
