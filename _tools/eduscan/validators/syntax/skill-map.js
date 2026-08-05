/**
 * EduScan - Dr. Hex Lab Skill Map Validator
 *
 * Validates that every lab in ContentCatalog has a corresponding Skill
 * Map YAML at `_app/lab-skill-maps/<lab_id>.yaml`, and that each YAML
 * file has the required structure for Dr. Hex to operate correctly.
 *
 * Codes:
 *   SKILL-MAP-001a: Skill Map file has malformed YAML or missing required fields (HIGH)
 *   SKILL-MAP-001b: Lab in ContentCatalog has no matching Skill Map (MEDIUM during rollout, HIGH after)
 *   SKILL-MAP-001c: Skill Map file exists but its lab_id does not match the filename (HIGH)
 *   SKILL-MAP-001d: Skill Map declares allowed_help_levels missing Level 0 (HIGH)
 *   SKILL-MAP-001e: transfer_prompt does not end with '?' (MEDIUM)
 *
 * Severity for SKILL-MAP-001b is configurable. During the initial
 * rollout (when most labs do not have Skill Maps yet), keep at MEDIUM
 * so the validator doesn't drown other findings. Once adoption crosses
 * ~70% of labs, promote to HIGH.
 *
 * Spec: _docs/operations/dr-hex-lab-skill-map.md
 * Tracked as: LAB-SKILL-MAP-001
 * Created: 2026-05-25
 */

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const VALID_LAYERS = new Set(['Recognition', 'Hypothesis', 'Execution', 'Transfer']);
const VALID_ARTIFACT_TYPES = new Set([
    'flag', 'command', 'exploit-payload', 'written-explanation', 'configuration',
]);
const VALID_HELP_LEVELS = new Set([0, 1, 2, 3, 4, 5]);

// During rollout, MISSING_SEVERITY can be downgraded so the validator
// doesn't generate one HIGH finding per lab while adoption is in progress.
// Once Skill Map coverage is >70% of labs, set to 'high'.
const DEFAULT_MISSING_SEVERITY = 'medium';

class SkillMapValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.rootPath = options.rootPath || path.resolve(__dirname, '..', '..', '..', '..');
        this.skillMapsDir = path.join(this.rootPath, '_app', 'lab-skill-maps');
        this.catalogFile = options.catalogFile || path.join(this.rootPath, '_app', 'components', 'ContentCatalog.js');
        this.missingSeverity = options.missingSeverity || DEFAULT_MISSING_SEVERITY;
    }

    validate() {
        const issues = [];
        const summary = {
            skillMapsFound: 0,
            skillMapsValid: 0,
            skillMapsInvalid: 0,
            labsInCatalog: 0,
            labsWithSkillMap: 0,
            labsWithoutSkillMap: 0,
        };

        // 1. Walk lab-skill-maps directory and validate each YAML file
        const yamlFiles = this._listYamlFiles();
        summary.skillMapsFound = yamlFiles.length;

        const validIds = new Set();
        for (const file of yamlFiles) {
            const result = this._validateYamlFile(file);
            if (result.ok) {
                summary.skillMapsValid += 1;
                validIds.add(result.lab_id);
            } else {
                summary.skillMapsInvalid += 1;
                for (const issue of result.issues) issues.push(issue);
            }
        }

        // 2. Cross-check against ContentCatalog: every lab.html lab should
        //    have a Skill Map. (Validator is lenient during rollout; severity
        //    is configurable.)
        const catalogLabIds = this._readCatalogLabIds();
        if (catalogLabIds !== null) {
            summary.labsInCatalog = catalogLabIds.length;
            for (const labId of catalogLabIds) {
                if (validIds.has(labId)) {
                    summary.labsWithSkillMap += 1;
                } else {
                    summary.labsWithoutSkillMap += 1;
                    issues.push({
                        code: 'SKILL-MAP-001b',
                        severity: this.missingSeverity,
                        category: 'dr-hex-skill-map',
                        message: `Lab '${labId}' has no Skill Map at _app/lab-skill-maps/${labId}.yaml — Dr. Hex cannot reliably preserve the challenge on this lab.`,
                        file: `_app/lab-skill-maps/${labId}.yaml`,
                        fix: 'Author a Skill Map per _docs/operations/dr-hex-lab-skill-map.md §3',
                    });
                }
            }
        }

        return { issues, summary };
    }

    _listYamlFiles() {
        if (!fs.existsSync(this.skillMapsDir)) return [];
        const entries = fs.readdirSync(this.skillMapsDir);
        return entries
            .filter(name => /\.(yaml|yml)$/i.test(name))
            .map(name => path.join(this.skillMapsDir, name));
    }

    _validateYamlFile(filePath) {
        const rel = path.relative(this.rootPath, filePath);
        const filename = path.basename(filePath);
        const expectedLabId = filename.replace(/\.(yaml|yml)$/i, '');
        const fileIssues = [];

        let data;
        try {
            const text = fs.readFileSync(filePath, 'utf8');
            data = yaml.load(text);
        } catch (e) {
            fileIssues.push({
                code: 'SKILL-MAP-001a',
                severity: 'high',
                category: 'dr-hex-skill-map',
                message: `Skill Map ${filename} failed to parse: ${e.message}`,
                file: rel,
                fix: 'Fix YAML syntax errors. See spec at _docs/operations/dr-hex-lab-skill-map.md',
            });
            return { ok: false, issues: fileIssues };
        }

        if (!data || typeof data !== 'object') {
            fileIssues.push({
                code: 'SKILL-MAP-001a',
                severity: 'high',
                category: 'dr-hex-skill-map',
                message: `Skill Map ${filename}: top-level YAML is not a mapping`,
                file: rel,
            });
            return { ok: false, issues: fileIssues };
        }

        // Required fields
        for (const field of ['lab_id', 'lab_name', 'primary_skill', 'assessed_artifact',
                             'allowed_help_levels', 'forbidden_disclosures', 'transfer_prompt']) {
            if (!(field in data)) {
                fileIssues.push({
                    code: 'SKILL-MAP-001a',
                    severity: 'high',
                    category: 'dr-hex-skill-map',
                    message: `Skill Map ${filename}: missing required field '${field}'`,
                    file: rel,
                });
            }
        }
        if (fileIssues.length > 0) return { ok: false, issues: fileIssues };

        // lab_id matches filename
        if (data.lab_id !== expectedLabId) {
            fileIssues.push({
                code: 'SKILL-MAP-001c',
                severity: 'high',
                category: 'dr-hex-skill-map',
                message: `Skill Map ${filename}: lab_id '${data.lab_id}' does not match filename`,
                file: rel,
                fix: `Rename the file to ${data.lab_id}.yaml or change lab_id to ${expectedLabId}`,
            });
        }

        // primary_skill structure
        const ps = data.primary_skill;
        if (!ps || typeof ps !== 'object') {
            fileIssues.push({
                code: 'SKILL-MAP-001a',
                severity: 'high',
                category: 'dr-hex-skill-map',
                message: `Skill Map ${filename}: primary_skill must be a mapping`,
                file: rel,
            });
        } else {
            if (!VALID_LAYERS.has(ps.layer)) {
                fileIssues.push({
                    code: 'SKILL-MAP-001a',
                    severity: 'high',
                    category: 'dr-hex-skill-map',
                    message: `Skill Map ${filename}: primary_skill.layer '${ps.layer}' invalid (must be one of ${[...VALID_LAYERS].join(', ')})`,
                    file: rel,
                });
            }
            if (!ps.description || typeof ps.description !== 'string' || !ps.description.trim()) {
                fileIssues.push({
                    code: 'SKILL-MAP-001a',
                    severity: 'high',
                    category: 'dr-hex-skill-map',
                    message: `Skill Map ${filename}: primary_skill.description missing or empty`,
                    file: rel,
                });
            }
            if (!ps.evidence_required || typeof ps.evidence_required !== 'string' || !ps.evidence_required.trim()) {
                fileIssues.push({
                    code: 'SKILL-MAP-001a',
                    severity: 'high',
                    category: 'dr-hex-skill-map',
                    message: `Skill Map ${filename}: primary_skill.evidence_required missing or empty`,
                    file: rel,
                });
            }
        }

        // assessed_artifact
        const aa = data.assessed_artifact;
        if (!aa || typeof aa !== 'object' || !VALID_ARTIFACT_TYPES.has(aa.type)) {
            fileIssues.push({
                code: 'SKILL-MAP-001a',
                severity: 'high',
                category: 'dr-hex-skill-map',
                message: `Skill Map ${filename}: assessed_artifact.type invalid (must be one of ${[...VALID_ARTIFACT_TYPES].join(', ')})`,
                file: rel,
            });
        }

        // allowed_help_levels
        const levels = data.allowed_help_levels;
        if (!Array.isArray(levels) || levels.length === 0) {
            fileIssues.push({
                code: 'SKILL-MAP-001a',
                severity: 'high',
                category: 'dr-hex-skill-map',
                message: `Skill Map ${filename}: allowed_help_levels must be a non-empty list`,
                file: rel,
            });
        } else {
            for (const lv of levels) {
                if (!Number.isInteger(lv) || !VALID_HELP_LEVELS.has(lv)) {
                    fileIssues.push({
                        code: 'SKILL-MAP-001a',
                        severity: 'high',
                        category: 'dr-hex-skill-map',
                        message: `Skill Map ${filename}: allowed_help_levels contains invalid value '${lv}' (must be 0-5)`,
                        file: rel,
                    });
                }
            }
            if (!levels.includes(0)) {
                fileIssues.push({
                    code: 'SKILL-MAP-001d',
                    severity: 'high',
                    category: 'dr-hex-skill-map',
                    message: `Skill Map ${filename}: allowed_help_levels must include Level 0 (every lab needs the option to refuse direct-answer requests)`,
                    file: rel,
                });
            }
        }

        // forbidden_disclosures
        const fd = data.forbidden_disclosures;
        if (!Array.isArray(fd) || fd.length === 0) {
            fileIssues.push({
                code: 'SKILL-MAP-001a',
                severity: 'high',
                category: 'dr-hex-skill-map',
                message: `Skill Map ${filename}: forbidden_disclosures must list at least one string`,
                file: rel,
            });
        }

        // transfer_prompt
        const tp = data.transfer_prompt;
        if (!tp || typeof tp !== 'string' || !tp.trim()) {
            fileIssues.push({
                code: 'SKILL-MAP-001a',
                severity: 'high',
                category: 'dr-hex-skill-map',
                message: `Skill Map ${filename}: transfer_prompt missing or empty`,
                file: rel,
            });
        // CONTAINS '?', not ends-with. This is a second implementation of the
        // rule enforced by _tools/hexclass/orchestrator/skill_map_loader.py and
        // it must not drift from it: the strict ends-with form disqualified 16
        // of 29 real maps on 2026-08-05 for good content, because the house
        // style is a question FOLLOWED BY directives ("...What is your
        // response? Name the specific attack ... Then state which construction
        // breaks it and why."). This validator is not currently wired into the
        // scan (SKILL-MAP-001 is still "planned" per dr-hex-lab-skill-map.md),
        // so it was inert and did not cause that outage — but left as-is it
        // would have reintroduced the whole false-positive class on the day
        // somebody enabled it. Fixed 2026-08-05 alongside the loader.
        } else if (!tp.includes('?')) {
            fileIssues.push({
                code: 'SKILL-MAP-001e',
                severity: 'medium',
                category: 'dr-hex-skill-map',
                message: `Skill Map ${filename}: transfer_prompt is not a question (must contain '?')`,
                file: rel,
            });
        }

        if (fileIssues.length > 0) {
            return { ok: false, issues: fileIssues };
        }
        return { ok: true, lab_id: data.lab_id, issues: [] };
    }

    /**
     * Best-effort read of lab IDs from ContentCatalog.js. The catalog is
     * an IIFE; we run it in a sandbox like the content-catalog validator
     * does. Returns null if we can't load it (treat as "no cross-check").
     */
    _readCatalogLabIds() {
        if (!fs.existsSync(this.catalogFile)) return null;
        try {
            const vm = require('vm');
            const text = fs.readFileSync(this.catalogFile, 'utf8');
            const sandbox = {
                window: {},
                document: { addEventListener: () => {} },
                console: { log: () => {}, warn: () => {}, error: () => {} },
            };
            vm.createContext(sandbox);
            vm.runInContext(text, sandbox, { timeout: 5000 });
            const cat = sandbox.window.ContentCatalog;
            if (!cat || !Array.isArray(cat.MODULES)) return null;
            return cat.MODULES
                .filter(m => m && m.href && /\.lab\.html$/.test(m.href))
                .map(m => m.id);
        } catch (e) {
            if (this.verbose) console.error('[skill-map] catalog load failed:', e.message);
            return null;
        }
    }
}

// CLI entry — allow running standalone for ad-hoc checks
if (require.main === module) {
    const validator = new SkillMapValidator({ verbose: true });
    const { issues, summary } = validator.validate();
    console.log('\nSkill Map Validator — Summary:');
    console.log(JSON.stringify(summary, null, 2));
    if (issues.length > 0) {
        console.log(`\n${issues.length} issue(s):`);
        for (const issue of issues) {
            console.log(`  [${issue.code}] ${issue.severity.toUpperCase()} ${issue.message}`);
        }
        process.exit(1);
    }
    console.log('\n✓ All Skill Maps valid.');
    process.exit(0);
}

module.exports = SkillMapValidator;
