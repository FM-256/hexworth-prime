#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * ToDo Spoke Adapter
 *
 * Reads ~/.todo-data.json and surfaces pending items as low-severity findings.
 * Read-only sink — acceptFinding returns rejected.
 */
module.exports = function createToDoAdapter({ name, dataPath, projectRoot }) {

    function resolvePath(p) {
        if (p.startsWith('~')) return path.join(os.homedir(), p.slice(1));
        return path.resolve(__dirname, p);
    }

    function readData() {
        const resolved = resolvePath(dataPath);
        if (!fs.existsSync(resolved)) return null;
        try {
            return JSON.parse(fs.readFileSync(resolved, 'utf8'));
        } catch (err) {
            return null;
        }
    }

    function getFindings() {
        const data = readData();
        if (!data || !data.todos) return [];

        const now = new Date().toISOString();

        return data.todos
            .filter(t => !t.done)
            .map(t => ({
                source: name,
                code: `TODO-${t.id}`,
                severity: 'low',
                message: t.text || t.title || '(untitled)',
                file: null,
                line: null,
                timestamp: t.created || now,
                meta: {
                    done: false,
                    id: t.id,
                }
            }));
    }

    function getStatus() {
        const data = readData();
        if (!data) {
            return { available: false, reason: 'todo data file not found' };
        }

        const todos = data.todos || [];
        const pending = todos.filter(t => !t.done).length;
        const done = todos.filter(t => t.done).length;

        return {
            available: true,
            name: 'ToDo',
            totalItems: todos.length,
            counts: { pending, done },
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
