'use strict';
// CAT-002 fix template — register undeclared content file in ContentCatalog.
//
// Trigger: EduScan finds an HTML file matching content patterns (.presentation,
// .quiz, .lab, .applet, .tool, .module) under houses/{house}/ but the file is
// not declared as a module in ContentCatalog.js.
//
// Fix: append a module entry to MODULES with derived id/title/href/components.
//
// SAFETY (Nancy promotion rule):
//   - Reject files with DRAFT/TODO/WIP in <title> (likely incomplete content)
//   - Reject if module ID would collide with existing
//   - Reject if title cannot be extracted
//   - Reject if house cannot be derived from path
//   - Reject if type cannot be inferred from suffix
//   - Backup ContentCatalog.js before write (.bak file)
//   - One file per apply() call (not batched) — lets the validator catch
//     issues before the next file is touched
//
// CALLER CONTRACT (Nancy round 6 — IMPORTANT for future orchestrator):
//   - The .bak file is single-generation: each apply() OVERWRITES the prior
//     .bak. If the validator returns validated:false because the catalog
//     has a parse error, the orchestrator MUST stop processing and require
//     human intervention before the next apply() — otherwise the only
//     known-good catalog backup gets overwritten by a corrupt one.
//   - Recommended pattern: orchestrator calls apply() → validate() →
//     ONLY proceed to next item if validated:true. On false, halt.
//   - For non-standard house basePaths (e.g., matrix=operator/), the
//     href derivation here may be wrong. Currently safe (all 280 known
//     CAT-002 findings are in standard houses) but worth re-verifying
//     before promoting CAT-002 to AUTO_FIX_ELIGIBLE_RULES.
//
// Contract: see _tools/nexus/fix-templates/CONTRACT.md

const fs = require('fs');
const path = require('path');

const ROOT_APP = path.resolve(__dirname, '../../../_app');
const CATALOG_PATH = path.resolve(ROOT_APP, 'components/ContentCatalog.js');

const SUFFIX_TO_COMPONENTS = {
    '.presentation.html': ['presentation'],
    '.quiz.html':         ['quiz'],
    '.lab.html':          ['lab'],
    '.applet.html':       ['applet'],
    '.tool.html':         ['applet', 'tool'],
    '.module.html':       ['module'],
};

function deriveSuffix(filename) {
    for (const s of Object.keys(SUFFIX_TO_COMPONENTS)) {
        if (filename.endsWith(s)) return s;
    }
    return null;
}

function deriveHouse(filePath) {
    const m = filePath.match(/^(?:_app\/)?houses\/([a-z-]+)\//);
    return m ? m[1] : null;
}

function deriveModuleId(houseId, filePath) {
    const filename = path.basename(filePath);
    const base = filename.replace(/\.(presentation|quiz|lab|applet|tool|module)\.html$/, '');
    // Prefix with houseId to namespace; lowercase + alnum/dash only
    const slug = (houseId + '-' + base).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    return slug;
}

function readFileSafe(absPath) {
    try { return fs.readFileSync(absPath, 'utf8'); } catch (e) { return null; }
}

function deriveTitle(absPath) {
    const content = readFileSafe(absPath);
    if (!content) return null;
    const t = content.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (t) return t[1].trim();
    const h1 = content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    return h1 ? h1[1].trim() : null;
}

function deriveDescription(absPath, fallback) {
    const content = readFileSafe(absPath);
    if (!content) return fallback;
    const m = content.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
    return m ? m[1].trim() : fallback;
}

/**
 * Resolve a relative path from a CAT-002 finding into an absolute disk path.
 * Findings carry `_app/houses/...` style; strip the `_app/` prefix.
 */
function relativePathToAbs(rel) {
    const stripped = rel.replace(/^_app\//, '');
    return path.resolve(ROOT_APP, stripped);
}

/**
 * Compute the planned module entry for one undeclared file.
 * Returns { feasible, module?, blockers: [], risks: [] }.
 */
function planForFile(filePath) {
    const result = { feasible: false, module: null, blockers: [], risks: [], filePath };

    const houseId = deriveHouse(filePath);
    if (!houseId) {
        result.blockers.push(`cannot derive house from path: ${filePath}`);
        return result;
    }

    const filename = path.basename(filePath);
    const suffix = deriveSuffix(filename);
    if (!suffix) {
        result.blockers.push(`no known content suffix on: ${filename}`);
        return result;
    }

    const absPath = relativePathToAbs(filePath);
    if (!fs.existsSync(absPath)) {
        result.blockers.push(`file does not exist on disk: ${absPath}`);
        return result;
    }

    const title = deriveTitle(absPath);
    if (!title) {
        result.blockers.push(`cannot extract <title> or <h1> from file`);
        return result;
    }

    if (/\b(draft|todo|wip|placeholder)\b/i.test(title)) {
        result.blockers.push(`title looks like a draft: "${title}"`);
        return result;
    }

    const moduleId = deriveModuleId(houseId, filePath);
    const description = deriveDescription(absPath, title);
    const href = filePath.replace(/^(?:_app\/)?houses\/[a-z-]+\//, '');
    const components = SUFFIX_TO_COMPONENTS[suffix];

    // Surface non-blocker risks
    if (description === title) {
        result.risks.push('no <meta description> — using title as fallback');
    }
    if (filePath.includes('_archive')) {
        result.blockers.push('file is under _archive — likely not navigable');
        return result;
    }
    if (filePath.includes('/draft')) {
        result.blockers.push('file path contains "/draft" — likely not navigable');
        return result;
    }

    result.feasible = true;
    result.module = {
        house: houseId,
        id: moduleId,
        title: title,
        description: description,
        icon: '/assets/images/icons/icon-folder.webp',  // generic; operator can edit later
        status: 'available',
        components: components,
        href: href,
        category: 'general',
    };
    return result;
}

/**
 * Read the existing ContentCatalog and find existing module IDs.
 * Returns { ids: Set<string>, parseError: string | null }.
 *
 * Per Nancy QC: a silent empty Set on parse error meant apply()
 * would proceed against a corrupt catalog, append to it, and write
 * the corrupt-plus-append as the new .bak. Now propagates the error
 * so apply() can refuse to run when the catalog is unparseable.
 */
function loadExistingIds() {
    const vm = require('vm');
    const code = readFileSafe(CATALOG_PATH);
    if (!code) return { ids: new Set(), parseError: 'cannot read ContentCatalog.js' };
    try {
        const ctx = vm.createContext({ window: {} });
        vm.runInContext(code, ctx);
        const cat = ctx.window.ContentCatalog;
        if (!cat || !Array.isArray(cat.MODULES)) {
            return { ids: new Set(), parseError: 'ContentCatalog loaded but has no MODULES array' };
        }
        return { ids: new Set(cat.MODULES.map(m => m.id)), parseError: null };
    } catch (e) {
        return { ids: new Set(), parseError: 'ContentCatalog.js failed to parse: ' + e.message };
    }
}

module.exports = {
    ruleCode: 'CAT-002',
    description: 'Register undeclared content file in ContentCatalog',
    touchesExtensions: ['.js'],

    /**
     * dryRun: analyze the queue item's childPaths, return per-file plans.
     * No writes.
     */
    async dryRun(item) {
        const paths = Array.isArray(item.childPaths) ? item.childPaths : [];
        if (paths.length === 0) {
            return {
                feasible: false,
                summary: 'item has no childPaths',
                plannedActions: [],
                risks: [],
                blockers: ['no files to analyze'],
            };
        }
        const { ids: existingIds, parseError } = loadExistingIds();
        if (parseError) {
            return {
                feasible: false,
                summary: 'cannot proceed — ' + parseError,
                plannedActions: [],
                risks: [],
                blockers: [parseError, 'fix the catalog parse error before any auto-fix can run'],
            };
        }
        const plans = paths.map(p => planForFile(p));
        const feasiblePlans = plans.filter(p => p.feasible);
        const blockedPlans = plans.filter(p => !p.feasible);

        // Check for ID collisions among feasible plans
        const collisions = [];
        for (const p of feasiblePlans) {
            if (existingIds.has(p.module.id)) {
                collisions.push(`id collision: ${p.module.id} already in catalog`);
                p.feasible = false;
                p.blockers.push('module id already exists in ContentCatalog');
            }
        }

        const finalFeasible = plans.filter(p => p.feasible);
        const finalBlocked = plans.filter(p => !p.feasible);

        return {
            feasible: finalFeasible.length > 0,
            summary: `${finalFeasible.length} of ${paths.length} files could be auto-registered`,
            plannedActions: finalFeasible.map(p => ({
                action: 'register-module',
                file: p.filePath,
                detail: `id=${p.module.id} title="${p.module.title}"`,
            })),
            risks: collisions.concat(
                feasiblePlans.flatMap(p => p.risks.map(r => `${p.filePath}: ${r}`))
            ),
            blockers: finalBlocked.map(p => `${p.filePath}: ${p.blockers.join('; ')}`),
        };
    },

    /**
     * rollback: restore ContentCatalog from the .bak file written by apply().
     * Called by the autofix-apply orchestrator when validate() returns
     * validated:false. Returns { restored: bool, summary: string }.
     *
     * Single-generation .bak limitation (Nancy round 6): if rollback is
     * called twice in a row without an intervening successful apply, the
     * second call has nothing meaningful to restore.
     */
    async rollback(applyResult) {
        const bakPath = CATALOG_PATH + '.bak';
        if (!fs.existsSync(bakPath)) {
            return { restored: false, summary: 'no .bak file present — cannot rollback' };
        }
        try {
            const bakContent = fs.readFileSync(bakPath, 'utf8');
            fs.writeFileSync(CATALOG_PATH, bakContent, 'utf8');
            return {
                restored: true,
                summary: `restored ContentCatalog.js from ${bakPath}`,
            };
        } catch (err) {
            return {
                restored: false,
                summary: `rollback failed: ${err.message}`,
            };
        }
    },

    /**
     * apply: register ONE file's worth of modules to ContentCatalog.
     * Idempotent: if all modules already exist, no-op success.
     * One file per call by design — the validator runs between calls.
     *
     * @param {Object} item - triage queue item; expects item.childPaths[0] to be the target
     */
    async apply(item) {
        const paths = Array.isArray(item.childPaths) ? item.childPaths : [];
        if (paths.length === 0) {
            return { success: false, summary: 'no childPaths to apply', filesChanged: [] };
        }

        // Process ONE file per apply() call. Caller batches.
        const targetPath = paths[0];
        const plan = planForFile(targetPath);
        if (!plan.feasible) {
            return {
                success: false,
                summary: `cannot register ${targetPath}: ${plan.blockers.join('; ')}`,
                filesChanged: [],
                error: plan.blockers.join('; '),
            };
        }

        const { ids: existingIds, parseError } = loadExistingIds();
        if (parseError) {
            // Refuse to apply against an unparseable catalog — appending
            // would compound the corruption AND overwrite the .bak alias
            // with the corrupt content.
            return {
                success: false,
                summary: 'refusing to apply: ' + parseError,
                filesChanged: [],
                error: parseError,
            };
        }
        if (existingIds.has(plan.module.id)) {
            // Idempotent — already registered, treat as success
            return {
                success: true,
                summary: `module ${plan.module.id} already in catalog (no-op)`,
                filesChanged: [],
                idempotent: true,
            };
        }

        // Backup + read catalog. Timestamped .bak (Nancy round 7 fix):
        // single-generation .bak overwrote prior backup on each apply, so
        // a corrupt apply followed by another apply lost the only known-good
        // copy. Now each apply gets its own .bak.{epoch}.bak file. The plain
        // .bak filename is also written as a "latest" alias for rollback().
        const catalogCode = readFileSafe(CATALOG_PATH);
        if (!catalogCode) {
            return { success: false, summary: 'cannot read ContentCatalog.js', filesChanged: [], error: 'catalog unreadable' };
        }
        const ts = Date.now();
        const tsBakPath = CATALOG_PATH + '.' + ts + '.bak';
        fs.writeFileSync(tsBakPath, catalogCode, 'utf8');
        fs.writeFileSync(CATALOG_PATH + '.bak', catalogCode, 'utf8');  // alias for rollback()

        // Find the MODULES array end and insert before the closing ]
        // Strategy: locate the literal `];\n` that closes MODULES. The catalog
        // uses `const MODULES = [...]` so the first `];` after `const MODULES =`
        // marks the closing bracket. This is a string-edit, not an AST edit —
        // simpler and reversible via the .bak file.
        const modulesStart = catalogCode.indexOf('const MODULES = [');
        if (modulesStart < 0) {
            return { success: false, summary: 'cannot locate MODULES array in catalog', filesChanged: [], error: 'MODULES array not found' };
        }
        // Find the closing `];` for MODULES — search forward for the first
        // line that's just whitespace + `];` after the opening bracket
        const closingMatch = catalogCode.slice(modulesStart).match(/\n\s*\];/);
        if (!closingMatch) {
            return { success: false, summary: 'cannot locate MODULES closing bracket', filesChanged: [], error: 'MODULES close not found' };
        }
        const closingIdx = modulesStart + closingMatch.index;

        const moduleLine = '        ' + JSON.stringify(plan.module) + ',\n';
        const before = catalogCode.slice(0, closingIdx + 1);  // include the \n
        const after = catalogCode.slice(closingIdx + 1);
        const newCode = before + moduleLine + after;

        fs.writeFileSync(CATALOG_PATH, newCode, 'utf8');

        return {
            success: true,
            summary: `registered ${plan.module.id} in ContentCatalog`,
            filesChanged: ['_app/components/ContentCatalog.js'],
            module: plan.module,
        };
    },
};
