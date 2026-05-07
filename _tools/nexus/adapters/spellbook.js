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

    // parseSpellId: extract canonical SPELL-NNN id matching admin/console.html static array.
    // Distinct from parseId(): findings store uses full filename-as-id (parseId), but the
    // spellbook OVERLAY for the panel needs the bare SPELL-NNN form so it can match the
    // curated `_sbStaticSpells` array entries by id.
    // Verified 2026-05-07 across all 83 spell files (incl. SPELL-058.md, SPELL-000A-CURRICULUM-REFERENCE.md).
    function parseSpellId(filename) {
        const m = filename.match(/^(SPELL-[A-Z0-9]+)(?:-|\.md)/);
        return m ? m[1] : null;
    }

    // parseField: extract `**Field:** value` from spell .md body. 60-80% of spells
    // have these (severity 77%, house 66%, scribed 63%). Returns null if not present.
    function parseField(content, fieldName) {
        const re = new RegExp('\\*\\*' + fieldName + ':\\*\\*\\s*([^\\n]+)', 'i');
        const m = content.match(re);
        return m ? m[1].trim() : null;
    }

    // parseSpellTitle: H1 with SPELL-NNN: prefix → strip prefix; H1 with ISSUE-NNN: → use as-is;
    // generic H1 → use; otherwise filename-derived.
    function parseSpellTitle(content, filename) {
        let m = content.match(/^#\s*SPELL-[A-Z0-9]+:\s*(.+)$/m);
        if (m) return m[1].trim();
        m = content.match(/^#\s*ISSUE-[A-Z0-9]+:\s*(.+)$/m);
        if (m) return m[1].trim();
        m = content.match(/^#\s+(.+)$/m);
        if (m) return m[1].replace(/^SPELL-[A-Z0-9]+:\s*/i, '').trim();
        return filename.replace(/^SPELL-[A-Z0-9]+-?/, '').replace(/\.md$/, '').replace(/-/g, ' ');
    }

    // getSpellsForPublish: enriched spell array shaped for _quality_reports/spellbook
    // Firestore doc consumed by _app/admin/console.html `loadSpellbook()`.
    // Distinct from getFindings() which produces Nexus findings format.
    // Returns null fields where the .md file doesn't carry the metadata so the
    // panel can fall back to its curated static-array values.
    function getSpellsForPublish() {
        const spells = readSpellFiles();
        const out = [];
        for (const s of spells) {
            const id = parseSpellId(s.filename);
            if (!id) continue;
            out.push({
                id,
                title: parseSpellTitle(s.content, s.filename),
                status: parseStatus(s.content) || 'UNKNOWN',
                severity: parseField(s.content, 'Severity'),
                house: parseField(s.content, 'House'),
                scribed: parseField(s.content, 'Scribed'),
                type: parseField(s.content, 'Type'),
                source: parseField(s.content, 'Source'),
                filename: s.filename,
            });
        }
        return out;
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
        getSpellsForPublish,
        acceptFinding,
    };
};
