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

    // Source → series mapping for triage
    const SOURCE_SERIES = {
        eduscan: 'ES',
    };

    function nextId(data, seriesPrefix) {
        const prefix = seriesPrefix.toUpperCase();
        let max = 0;
        data.sprints.forEach(s => {
            if (s.series === prefix) {
                const num = parseInt(s.id.replace(/^[A-Z]+-/, '')) || 0;
                if (num > max) max = num;
            }
        });
        return `${prefix}-${max + 1}`;
    }

    function saveData(data) {
        data.meta.lastUpdated = new Date().toISOString();
        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2) + '\n');
    }

    function acceptFinding(findingGroup, options) {
        const dryRun = options && options.dryRun;
        const data = readData();
        if (!data || !data.sprints) {
            return { accepted: false, reason: 'sprints.json not available' };
        }

        const nexusKey = `${findingGroup.source}::${findingGroup.code}`;

        // Dedup: check if this code is already tracked
        const existing = data.sprints.find(s => s.nexusKey === nexusKey);
        if (existing && existing.status !== 'done') {
            return { accepted: false, reason: 'already tracked', reference: existing.id };
        }

        const series = SOURCE_SERIES[findingGroup.source] || 'QC';
        const id = nextId(data, series);

        if (dryRun) {
            return { accepted: true, reference: id };
        }

        // Build title: "CODE: message (N files)" truncated to 80 chars
        let title = `${findingGroup.code}: ${findingGroup.message}`;
        if (findingGroup.count > 1) {
            title += ` (${findingGroup.count} files)`;
        }
        if (title.length > 80) {
            title = title.slice(0, 79) + '\u2026';
        }

        // Build notes with top affected files
        let notes = 'Auto-triaged by Nexus.';
        if (findingGroup.files && findingGroup.files.length > 0) {
            notes += ' Top files:\n- ' + findingGroup.files.join('\n- ');
        }

        const today = new Date().toISOString().split('T')[0];

        const item = {
            id,
            title,
            series,
            status: 'backlog',
            priority: findingGroup.severity === 'critical' ? 'critical' : findingGroup.severity,
            houses: [],
            depends: [],
            commits: [],
            notes,
            nexusKey,
            created: today,
            updated: today,
            completed: null,
        };

        data.sprints.push(item);
        saveData(data);

        return { accepted: true, reference: id };
    }

    return {
        name,
        getFindings,
        getStatus,
        acceptFinding,
    };
};
