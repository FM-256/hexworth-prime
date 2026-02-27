#!/usr/bin/env node
'use strict';

const fs = require('fs');

/**
 * Sprint Master Spoke Adapter
 *
 * Reads sprints.json and exposes open/blocked items as findings for cross-tool visibility.
 * Phase 2: read-only. Phase 3 will accept findings as auto-created sprint items.
 */
module.exports = function createSprintAdapter({ name, dataPath, projectRoot }) {

    function readData() {
        if (!fs.existsSync(dataPath)) return null;
        try {
            return JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        } catch (err) {
            return null;
        }
    }

    function priorityToSeverity(priority) {
        switch (priority) {
            case 'critical': return 'critical';
            case 'high':     return 'high';
            case 'medium':   return 'medium';
            case 'low':      return 'low';
            default:         return 'medium';
        }
    }

    function isBlocked(sprint, allSprints) {
        if (!sprint.depends || sprint.depends.length === 0) return false;
        return sprint.depends.some(depId => {
            const dep = allSprints.find(s => s.id === depId);
            return !dep || dep.status !== 'done';
        });
    }

    function getFindings() {
        const data = readData();
        if (!data || !data.sprints) return [];

        const now = new Date().toISOString();

        // Only surface open and blocked items (not done/deferred)
        const actionable = data.sprints.filter(s =>
            s.status !== 'done' && s.status !== 'deferred'
        );

        return actionable.map(sprint => {
            const blocked = isBlocked(sprint, data.sprints);

            return {
                source: name,
                code: sprint.id,
                severity: priorityToSeverity(sprint.priority),
                message: sprint.title,
                file: null,
                line: null,
                timestamp: now,
                meta: {
                    status: sprint.status,
                    series: sprint.series,
                    houses: sprint.houses || [],
                    blocked,
                    depends: sprint.depends || [],
                    notes: sprint.notes || '',
                }
            };
        });
    }

    function getStatus() {
        const data = readData();
        if (!data) {
            return { available: false, reason: 'sprints.json not found' };
        }

        const sprints = data.sprints || [];
        const meta = data.meta || {};

        // Count by status
        const counts = {
            open: 0,
            'in-progress': 0,
            blocked: 0,
            done: 0,
            other: 0,
        };

        for (const s of sprints) {
            if (s.status === 'done') {
                counts.done++;
            } else if (s.status === 'in-progress') {
                counts['in-progress']++;
            } else if (s.status === 'blocked' || isBlocked(s, sprints)) {
                counts.blocked++;
            } else if (s.status === 'open' || s.status === 'partial') {
                counts.open++;
            } else {
                counts.other++;
            }
        }

        return {
            available: true,
            name: 'Sprint Master',
            totalItems: sprints.length,
            counts,
            lastUpdated: meta.lastUpdated || null,
        };
    }

    function acceptFinding() {
        return { accepted: false, reason: 'Phase 3' };
    }

    return {
        name,
        getFindings,
        getStatus,
        acceptFinding,
    };
};
