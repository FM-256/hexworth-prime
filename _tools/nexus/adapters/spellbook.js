#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Spellbook Spoke Adapter
 *
 * Reads spell markdown files from _spellbook/spells/SPELL-*.md.
 * Surfaces SCRIBED and CAST spells as findings.
 * Read-only sink — acceptFinding returns rejected.
 *
 * Supports two formats:
 *   1. YAML front-matter:  ---\nSTATUS: CAST\n---
 *   2. Legacy markdown:    **Status:** Cast
 */
module.exports = function createSpellbookAdapter({ name, dataPath, projectRoot }) {

    function getSpellsDir() {
        return path.resolve(projectRoot, dataPath);
    }

    function readSpellFiles() {
        const dir = getSpellsDir();
        if (!fs.existsSync(dir)) return [];

        try {
            return fs.readdirSync(dir)
                .filter(f => f.startsWith('SPELL-') && f.endsWith('.md'))
                .map(f => {
                    const content = fs.readFileSync(path.join(dir, f), 'utf8');
                    return { filename: f, content };
                });
        } catch (err) {
            return [];
        }
    }

    function parseStatus(content) {
        // YAML front-matter: ---\nSTATUS: CAST\n---
        const yamlMatch = content.match(/^---\s*\n[\s\S]*?STATUS:\s*(\w+)[\s\S]*?\n---/i);
        if (yamlMatch) return yamlMatch[1].toUpperCase();

        // Legacy markdown: **Status:** Cast
        const mdMatch = content.match(/\*\*Status:\*\*\s*(\w+)/i);
        if (mdMatch) return mdMatch[1].toUpperCase();

        return null;
    }

    function parseTitle(content, filename) {
        // Try first H1
        const h1 = content.match(/^#\s+(.+)$/m);
        if (h1) return h1[1].trim();

        // Fallback to filename
        return filename.replace('.md', '');
    }

    function parseId(filename) {
        // SPELL-042.md → SPELL-042
        return filename.replace('.md', '');
    }

    function getFindings() {
        const spells = readSpellFiles();
        if (!spells.length) return [];

        const now = new Date().toISOString();
        const findings = [];

        for (const spell of spells) {
            const status = parseStatus(spell.content);
            if (!status || (status !== 'SCRIBED' && status !== 'CAST')) continue;

            findings.push({
                source: name,
                code: parseId(spell.filename),
                severity: status === 'SCRIBED' ? 'medium' : 'low',
                message: parseTitle(spell.content, spell.filename),
                file: path.join(getSpellsDir(), spell.filename),
                line: null,
                timestamp: now,
                meta: {
                    status,
                }
            });
        }

        return findings;
    }

    function getStatus() {
        const spells = readSpellFiles();
        if (!spells.length) {
            const dir = getSpellsDir();
            if (!fs.existsSync(dir)) {
                return { available: false, reason: 'spellbook directory not found' };
            }
            return { available: true, name: 'Spellbook', totalSpells: 0, counts: {} };
        }

        const counts = {};
        for (const spell of spells) {
            const status = parseStatus(spell.content) || 'UNKNOWN';
            counts[status] = (counts[status] || 0) + 1;
        }

        return {
            available: true,
            name: 'Spellbook',
            totalSpells: spells.length,
            counts,
        };
    }

    function acceptFinding() {
        return { accepted: false, reason: 'read-only spoke' };
    }

    return {
        name,
        getFindings,
        getStatus,
        acceptFinding,
    };
};
