/**
 * EduScan - Tags Validator
 *
 * Validates tag-array consistency across ContentCatalog modules.
 *
 * Rules:
 * - TAG-001: Case-variant tags. The same tag exists in 2+ casings (e.g.,
 *            'siem' AND 'SIEM'). Breaks tag-based filtering — searching for
 *            'siem' misses 'SIEM'-tagged modules. Fix: lowercase canonicalization
 *            (already applied to current catalog as of Stragglers 2026-04-30).
 *            MEDIUM. Auto-fixable.
 *
 * - TAG-002: Modules with no tags. Discoverability hole — module won't surface
 *            in tag-based search or topic filtering. Currently 2564 of 3020
 *            (~85%) lack tags entirely. Large-scope content cleanup; flagged
 *            as INFO not blocker.
 *
 * Created: 2026-04-30 (Stragglers QA pass)
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

class TagsValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.rootPath = options.rootPath || './_app';
        this.catalogFile = options.catalogFile || 'components/ContentCatalog.js';
    }

    validate() {
        const issues = [];
        const summary = { totalModules: 0, noTags: 0, caseVariantPairs: 0 };
        const catalog = this._loadCatalog();
        if (!catalog) return { issues, summary };

        summary.totalModules = catalog.MODULES.length;

        // TAG-001: case variants
        const lc = new Map();  // lowercase -> Set of original-case forms
        for (const m of catalog.MODULES) {
            for (const t of (m.tags || [])) {
                const k = t.toLowerCase();
                if (!lc.has(k)) lc.set(k, new Set());
                lc.get(k).add(t);
            }
        }
        const variants = Array.from(lc.entries()).filter(([_, vs]) => vs.size > 1);
        summary.caseVariantPairs = variants.length;
        for (const [canon, vs] of variants) {
            issues.push({
                code: 'TAG-001',
                severity: 'medium',
                category: 'tags',
                message: `Tag '${canon}' has ${vs.size} casings: ${Array.from(vs).join(', ')}. Tag filtering is case-sensitive — variants split the discovery surface.`,
                file: this.catalogFile,
                fix: `Canonicalize to lowercase. Already auto-fixed on Stragglers branch via tag-array regex pass.`,
            });
        }

        // TAG-002: modules with no tags (info — large existing scope)
        const noTags = catalog.MODULES.filter(m => !m.tags || m.tags.length === 0);
        summary.noTags = noTags.length;
        if (noTags.length > 0) {
            // One summary issue rather than thousands
            issues.push({
                code: 'TAG-002',
                severity: 'info',
                category: 'tags',
                message: `${noTags.length} of ${catalog.MODULES.length} catalog modules have no tags. Discoverability hole — these modules won't surface in tag-based search or topic filtering. Sample: ${noTags.slice(0, 3).map(m => m.id).join(', ')}.`,
                file: this.catalogFile,
                fix: `Add tags to high-traffic modules first (per house: top 10 by completion). Bulk back-fill not necessary if existing search/filter UX surfaces ids and titles.`,
            });
        }

        return { issues, summary };
    }

    _loadCatalog() {
        try {
            const code = fs.readFileSync(path.resolve(this.rootPath, this.catalogFile), 'utf8');
            const ctx = vm.createContext({ window: {}, console });
            vm.runInContext(code, ctx);
            return ctx.window.ContentCatalog;
        } catch (e) {
            return null;
        }
    }
}

module.exports = TagsValidator;
