/**
 * EduScan - Heuristics Validator
 *
 * Anomaly detection layer for patterns that don't match known signatures
 * but "smell wrong." Uses the antivirus quarantine model: flag suspects
 * with a new 'suspect' severity for human review.
 *
 * Rules:
 * - HEUR-001: Excessive inline scripts (>8 <script> blocks without src)
 * - HEUR-002: Commented-out code references (<!-- containing <script or <link)
 * - HEUR-003: TODO/FIXME/HACK markers inside <script> blocks
 * - HEUR-004: console.log in inline scripts (production hygiene)
 * - HEUR-005: Duplicate script includes (same src on multiple <script> tags)
 * - HEUR-006: Hardcoded relative href in shared JS renderer (fragile back links)
 * - HEUR-007: Code block CSS missing white-space: pre/pre-wrap (commands render as paragraph)
 * - HEUR-008: position:fixed in dynamically created overlay (breaks when body has filter/transform)
 * - HEUR-009: Empty template literal ${} in inline scripts (SyntaxError kills entire script block)
 * - HEUR-010: querySelector targets heading tag not present in HTML (e.g., h3 in selector but h2 in markup — null crash)
 * - HEUR-011: Literal </script> inside JS string or comment (HTML parser terminates script block early, killing all JS below it)
 * - HEUR-012: JS syntax error via new Function() parse check (catches unclosed strings, missing quotes, etc.)
 * - HEUR-013: innerHTML assignment with unsanitized template literal (XSS risk — user/dynamic data injected without escaping)
 * - HEUR-014: onclick with hardcoded window.location redirect (bypasses routing, breaks tenant encapsulation)
 * - HEUR-015: eval() usage in non-sandbox code (code injection risk — should use Function() or safer alternatives)
 * - HEUR-016: document.write() usage (DOM clobbering, breaks page if called after load)
 * - QUIZ-001: Quiz uses QuizEngine with serverGrading but still has client-side correct: fields (answer leak — redundant answers exposed)
 * - QUIZ-002: Quiz uses QuizEngine WITHOUT serverGrading and has client-side correct: fields (answers fully exposed via View Source)
 * - QUIZ-003: Quiz uses QuizEngine WITHOUT serverGrading and has NO correct: fields (quiz grades 0% — broken, no answers anywhere)
 * - QUIZ-004: Quiz REGRESSION — file was server-graded in baseline but serverGrading is now missing (an edit reverted the fix)
 * - QUIZ-005: Quiz KEY MISMATCH — answer key count doesn't match question count, or answer index is out of range for a question's options
 * - QUIZ-006: Custom inline quiz calls gradeQuiz Cloud Function but has no matching key in quiz_keys.json — server grading will return "Quiz key not found"
 * - QUIZ-007: quiz_keys.json questionCount field disagrees with actual question count in HTML — keys are stale or drifted after question add/remove
 * - QUIZ-008: Answer key has skewed distribution — one index exceeds 35% in 10+ question quiz or >2 of same index in 5-question quiz. Students can pattern-exploit without reading questions.
 * - QUIZ-011: Answer key matches CLASSIC-CYCLING placeholder pattern (i%4 cycle [0,1,2,3,0,1,2,3,...]). Bypasses QUIZ-008's skew threshold because distribution is perfectly even (~25% per index). Complements QUIZ-008 with zero double-fire — fires only on CLASSIC-CYCLING; ALL-ZEROS/ALL-SAME/PERIOD-CYCLING are caught by QUIZ-008 already.
 * - HEUR-017: Dynamic lazy-loading of platform component via createElement('script') (should be static <script src>; lazy loads bypass dependency checks and cause race conditions)
 * - HEUR-018: Scroll-triggered auto-completion — fires ModuleProgress.complete() inside a scroll listener (student has no deliberate action; should use a "Mark Complete" button instead)
 * - HEUR-019: Tenant config missing required fields — dashboard file lacks slug, branding, licensing, or adminUids references
 * - HEUR-020: Tenant dashboard broken asset references — absolute image/icon/CSS paths that don't resolve within _app
 * - HEUR-021: Missing house content in tenant license — tenant config licenses houses that have no content in the registry
 * - HEUR-022: Over-deep relative index.html link — href climbs more parent dirs than the file's depth inside its house (e.g., ../../../index.html from a 1-deep subfolder)
 * - HEUR-023: Broken Course Home link — href to index.html resolves to a path that doesn't exist on disk (archived or never created)
 * - HEUR-024: Missing Course Home link — page loads ModuleProgress.js but has no <a> with href ending in index.html (completion overlay "Course Home" button will be absent)
 * - HEUR-025: Module completion ID mismatch — ModuleProgress.complete() uses a different moduleId than the hub/index page expects, causing completions to silently fail (student sees no progress)
 * - HEUR-026: Course module links to house root instead of course hub — file inside a course directory (courses/xxx/) has a back/home link that escapes to the house root instead of the course's own index.html
 * - HEUR-027: Content link escapes to platform root — any file inside houses/ has an href that resolves above the house directory to the main platform dashboard (tenant isolation breach — students escape course context)
 * - HEUR-028: ModuleProgress.complete() signature mismatch — call does not follow the (houseId, moduleId, options) pattern; first arg is not a recognized house ID, or second arg appears to be a score/number instead of a module ID string
 * - HEUR-029: Looks-clickable but isn't — non-anchor element styled as clickable (role="link"/"button", cursor:pointer + tabindex, onkeydown navigation, or href on non-anchor) with no onclick attribute AND no class/id wired up via JS addEventListener('click') or .onclick assignment; mouse clicks silently fail
 * - HEUR-030: Course-hub tenant-leak — _app/houses/<h>/<c>/index.html has <a id="dashboardBtn"> but is missing the canonical TenantRouter rewrite IIFE. Tenant students clicking Dashboard leak to the house index (main hex) instead of their tenant dashboard. Detection requires BOTH `getElementById('dashboardBtn')` AND `TenantRouter.getUrl` present; if either is absent the rewriter isn't wired. HIGH (tenant-isolation breach). Canonical pattern: _app/houses/code/python-for-it/index.html (search "Tenant-aware Dashboard button").
 * - HEUR-030b: Programmatic navigation to platform page without TenantRouter. Detects (window.)?location.href= / .assign() / .replace() pointing at an absolute /dashboard.html | /sorting.html | /index.html | /unauthorized.html on tenant-context HTML, when the surrounding inline script has no TenantRouter check. Absolute path required (relative 'index.html' is course-hub-local navigation, not a leak — Nancy round 1 lesson 2026-06-05). HIGH. Pure regression protection (0 current findings).
 * - QUIZ-002b: inline-graded quiz with ans:N pattern (QC-57 Pattern A — sub-variants A1 quoted "ans":N and A2 unquoted ans:N as a line-start object property). Files (.quiz.html OR .exam.html) that don't use QuizEngine but have inline `selectAnswer(idx) { if (idx === q.ans) ... }` grading. QUIZ-002 misses these because it requires QuizEngine. Severity HIGH (MEDIUM via practice-mode marker, same demotion as QUIZ-002). Inventory: _docs/operations/qc-57-client-grading-inventory.md.
 * - HEUR-030f: Hard-coded https://hexworth.com/ URL as a nav target on tenant-context page. Patterns: <a href>, <form action>, location.href/assign/replace inside un-guarded inline scripts, PageTransition.navigateTo inside un-guarded inline scripts. SEO meta (canonical/og:url/ld+json) and resource URLs (img/script/link src) NOT flagged — structurally excluded by tag anchors and content types. Variable-assignment strings NOT flagged (audit 2026-06-06 found only 1 file, joinUrl, confirmed correct). HIGH.
 * - HEUR-030c: PageTransition.navigateTo to platform page without TenantRouter. PageTransition.js has zero TenantRouter integration (verified 2026-06-05). Any tenant-context call like PageTransition.navigateTo('dashboard.html') leaks the student to main hex. Scope: HTML under _app/houses/ and _app/tenant/, excluding _app/tenant/dashboard-X.html files which are platform pages themselves. HIGH. Pure regression protection (0 current findings).
 * - HEUR-030d: form action or iframe src to platform page on tenant-context. TenantShell's runtime overrideLinks() ONLY rewrites anchor href elements (verified at TenantShell.js:390); form actions and iframe srcs are not in its scope. Targets: /dashboard.html, /sorting.html, /index.html, /unauthorized.html. HIGH. Pure regression protection (0 current findings).
 * - HEUR-030e: Tenant-accessible HTML missing the TenantShell auto-loader chain AND has a leaking static href. Without AccessGuard.js / ModuleProgress.js / FirebaseAuth.js / TenantShell.js the runtime link rewriter is never injected, so every static href to a platform page leaks. Detection: file in scope + has leaking href + loads none of the 4 protectors. HIGH. Pure regression protection (0 current findings).
 * - HEUR-COMPLETE-QUIZ-PCT: ModuleProgress.completeQuiz() called with raw `score` count instead of `pct` percentage. The function internally evaluates `score >= passingScore` so a 12/15 score (80%) is checked as `12 >= 70 = false` and completion never persists. Fires when (a) file computes `var pct = Math.round(...)`, AND (b) 3rd arg of completeQuiz is a bare identifier that is NOT pct/percent/percentage/integer-literal/Math.round expression. HIGH (completion silently fails).
 * - HEUR-RESULT-BUTTON-STANDARD: Quiz results-card uses pre-standard buttons — `<button onclick="restartQuiz()">Try Again</button>` or `<a class="btn-hub">Back to <Course> Hub</a>`. New standard is `[Review Answers]` (calls showReviewAnswers()) + `[Return to Hub]`. Mixed state (Review Answers present alongside old buttons) also flags. MEDIUM (UX drift, no grading bug).
 * - HEUR-031: Empty slide-text wrapper. Slide page has `<div class="slide-text">` with <20 chars of non-whitespace content. Class of bug: depth-tracking regex during a slide rebuild missed the matching `</div>` boundary when slide-content had no nested divs, leaving the text wrapper empty. Caught on WSA m01 slides 6, 17, 20 (2026-05-29). CRITICAL: literal lost content. Detection: scan for `<div class="slide-text">...</div>` blocks; strip tags + whitespace; flag if <20 chars remain.
 * - HEUR-032: Broken webp icon reference. HTML references `/assets/images/icons/icon-NAME.webp` where the file does not exist on disk. Common typo source: plurality (`icon-gears` vs `icon-gear`) or synonyms (`icon-checklist` vs `icon-checkbox`). Caught on WSA m01 (2026-05-29). HIGH: visible broken-image fallback in the UI. Detection: extract every `icon-*.webp` ref from HTML, resolve against `_app/assets/images/icons/`, flag any miss.
 * - HEUR-033: SVG width-% keyframe overflow. CSS `@keyframes` definition contains `width: 100%` or similar percentage, and the animation class is applied to a `<rect>` or `<line>` inside an inline `<svg>`. SVG percentage widths resolve to the viewBox root, not the parent container, so the animated element overflows the intended bounds. Caught on WSA m01 slide 23 progress bars (2026-05-29). MEDIUM (visual overflow). Detection: pair `@keyframes` with `width: \d+%` against `class="ANIM" ... <rect|line` in svg blocks. Fix is `transform: scaleX()` with `transform-origin` set.
 * - HEUR-034: Infinite opacity 0→1 keyframe causes flicker. `@keyframes` definition starts at `opacity: 0` and ends at `opacity: 1`, AND the applying class declares `animation: ... infinite`. Creates a fade-in / fade-out flicker loop because each cycle resets opacity to 0. Caught on WSA m01 slides 17 and 26 drop-in animations (2026-05-29). MEDIUM (UX issue). Detection: parse `@keyframes` for `0%.*opacity:\s*0` AND `100%.*opacity:\s*1`; check applying class for `animation: ... infinite`.
 * - HEUR-035: Em-dash character in content. Per user style preference (memory `feedback_no_em_dashes`), the em-dash character (U+2014) should not appear in HTML content. Common alternatives: comma, colon, or period depending on grammar. Detection: count `—` characters outside `<style>`, `<script>`, and `code-block`/`pre` contexts. Going-forward enforcement only — legacy content allowlisted by file path.
 * - HEUR-036: has-visual class without visual element. Slide has `class="slide has-visual"` but its `<div class="slide-visual">` is empty or contains neither an `<svg>` nor an `<img>` element. Indicates a partially-built slide where the visual half is missing — companion bug to HEUR-031 (empty text wrapper). Detection: find each `<div class="slide(?:\s+active)?\s+has-visual"...data-slide="N"...>` block (note: implementation regex requires `slide` and `has-visual` in that order with optional `active` between — does NOT match arbitrary class ordering); check that the slide-visual child contains an `<svg` OR `<img`. Broadened 2026-06-09 after WSA rich-render swap (c8ec7a084) replaced inline SVGs with img tags referencing webp files under the wsa-visuals subtree. MEDIUM (incomplete slide). Known gap: no validator currently confirms a referenced webp under the wsa-visuals subtree actually exists on disk — HEUR-032 only covers icon-NAME.webp paths. A future author could place an img tag with a non-existent webp path and pass HEUR-036 silently.
 * - HEUR-037: <a target="_blank"> missing rel="noopener" (or rel="noreferrer" — per HTML spec noreferrer implies noopener). Tabnabbing risk via window.opener: new tab can redirect parent. Modern browsers (Chrome 88+, FF 79+, Safari 12.1+) default to implicit noopener but explicit attribute is HTML spec best practice. LOW severity — does NOT publish to Nexus triage queue per TRIAGE_SEVERITY_GATE=['critical','high']; guards against silent regression in future scans. ~35 current findings across 14 files. Detection: regex match `<a target="_blank">` that lacks both noopener and noreferrer tokens in rel attribute.
 * - HEUR-039: WSA cat-contract `.has-visual .slide-text` content budget exceeded. Static companion to OVERFLOW-001b. For each `.slide.has-visual` div in a WSA cloud-presentation.module.html file, extracts the inner `.slide-text` body, strips HTML/entities/whitespace, and counts chars. Budget = 600 chars (empirical: m01/m02 reference deck's safe ceiling is 558c; boundary cases at 634-968c clip 14-53px at 1280×720; >800c clips reliably). HIGH severity. Scope: same as HEUR-038. NOTE: m01 + m02 are NOT passing fixtures for HEUR-039 — they have ~10-11 overflowing slides each that need content rewrite. They ARE the structural fixtures for HEUR-038 (CSS contract), which is independent of content density. Dedup-stable identifier: `line: slideIndex` (overall .slide div index in source order), so partial-trim edits don't generate ghost findings. Known limitations: (1) regex skips `<script>`/`<style>` early to avoid `</div>` in JS strings throwing depth; (2) class-token matched with `(?:^|\s)has-visual(?:\s|$)` to prevent prefix-substring false positives on hypothetical `has-visual-*` variants (none today). Predicted output ~212 findings across 19 WSA files (Nancy dry-run 2026-06-07).
 * - HEUR-038: WSA presentation slide-layout contract violation. WSA cloud-presentation.module.html files must match m01/m02's flex-chain layout contract. Five fingerprints (verified against m01 + m02 source 2026-06-06): (a) `.slide-container` rule contains `flex: 1`, `min-height: 0`, `display: flex`, `flex-direction: column`; (b) `.slide` rule contains `flex: 1`, `min-height: 0` AND lacks `border-radius`, `border: 1px solid`, fixed `min-height: Npx`; (c) `.slide-content` rule contains `flex: 1`, `min-height: 0`; (d) `!important` token count in file = 0; (e) file contains NONE of the breed-marker tokens that identify non-cat templates: `text-visual-grid`, `tv-text`, `tv-visual`, `presentation-container`, `slide-area`, `slide-header`, `page-header` (m01/m02 use `.slide.has-visual .slide-content` grid + `.slide-text` + `.slide-visual` + `.header` + `.slide-container` exclusively — any of the listed tokens means a different breed). Scope: files under `_app/houses/cloud/modules/wsa/` named `cloud-presentation.module.html`. HIGH severity (real-estate regression). Predicted output at land: m01+m02 PASS, m03-m19 FAIL with per-fingerprint reasons. Reference cat fixtures: m01-fundamentals, m02-active-directory. Known limitations: (1) substring-match on `flex: 1` would false-fail if a CSS-normalizing tool emits `flex: 1 1 0%` longhand; current files use verbatim `flex: 1`. (2) !important counter does not exclude prose comments containing the literal word; no current occurrences in cat fixtures.
 */

const fs = require('fs');
const path = require('path');

// QUIZ-011 placeholder-detector load. Try/catch so a missing/broken
// detector module disables QUIZ-011 cleanly without breaking the rest
// of heuristics.js. console.warn so the failure is visible in stdout.
let PlaceholderDetector;
try {
    PlaceholderDetector = require('../../../../functions/placeholder-detector');
} catch (e) {
    console.warn('[heuristics] QUIZ-011 disabled: failed to load placeholder-detector module:', e.message);
    PlaceholderDetector = null;
}

class HeuristicsValidator {
    constructor(options = {}) {
        this.verbose = options.verbose || false;
        this.profile = options.profile || 'ci';
        this.rootPath = options.rootPath || './_app';

        // Load quarantine allowlist (generic, per-code)
        this.allowlist = this.loadAllowlist();
        // Load per-rule allowlist for HEUR-018 false positives (parallel to
        // prog003-allowlist.json pattern). Suppresses files where the
        // scroll+complete+threshold colocation is coincidental, not a real
        // scroll-completion gate.
        this.heur018Allowlist = this.loadHeur018Allowlist();
        // Load per-rule allowlist for QUIZ-011 Karl-PASS suppression. Quiz IDs
        // whose CLASSIC-CYCLING answer array has been verbatim-verified
        // against Confluence Solutions Manual are suppressed; hash drift
        // re-fires as QUIZ-011B (stale-allowlist).
        this.quiz011Allowlist = this.loadQuiz011Allowlist();
    }

    /**
     * Load quarantine allowlist from JSON file
     * @returns {Array} Allowlist entries
     */
    loadAllowlist() {
        const allowlistPath = path.resolve(__dirname, '../../quarantine-allowlist.json');
        try {
            const raw = fs.readFileSync(allowlistPath, 'utf8');
            return JSON.parse(raw);
        } catch (err) {
            if (this.verbose) {
                console.log('[HEURISTICS] No allowlist found, using empty list');
            }
            return [];
        }
    }

    /**
     * Load HEUR-018 false-positive allowlist (per-rule, file-only).
     * @returns {Set<string>} Allowlisted file paths (normalized)
     */
    loadHeur018Allowlist() {
        const allowlistPath = path.resolve(__dirname, '../../config/heur018-allowlist.json');
        try {
            const raw = fs.readFileSync(allowlistPath, 'utf8');
            const data = JSON.parse(raw);
            const files = (data.entries || []).map(e => e.file);
            return new Set(files);
        } catch (err) {
            return new Set();
        }
    }

    /**
     * Load QUIZ-011 Karl-PASS allowlist (per-rule, by quiz ID + answer hash).
     * Returns a Map<id, entry> where entry.answerHash is matched against the
     * current static array's hash at check time. Hash mismatch fires
     * QUIZ-011B (stale-allowlist) instead of suppressing.
     * @returns {Map<string, {answerHash:string, verifiedAt:string, karlAuditPath:string, confluencePage:string}>}
     */
    loadQuiz011Allowlist() {
        const allowlistPath = path.resolve(__dirname, '../../config/quiz-011-allowlist.json');
        try {
            const raw = fs.readFileSync(allowlistPath, 'utf8');
            const data = JSON.parse(raw);
            const map = new Map();
            for (const entry of (data.entries || [])) {
                map.set(entry.id, entry);
            }
            return map;
        } catch (err) {
            return new Map();
        }
    }

    /**
     * Check if an issue is allowlisted
     * @param {string} filePath - Relative file path
     * @param {string} code - Issue code (e.g., HEUR-001)
     * @returns {boolean} True if allowlisted
     */
    isAllowlisted(filePath, code) {
        const normalized = filePath.replace(/\\/g, '/');
        return this.allowlist.some(entry =>
            normalized.includes(entry.file) && entry.code === code
        );
    }

    /**
     * Validate a single file for heuristic anomalies
     * @param {Object} file - { path, content }
     * @returns {Array} Issues found
     */
    validate(file) {
        if (this.profile === 'inventory') {
            return [];
        }

        const issues = [];

        issues.push(...this.checkExcessiveInlineScripts(file));
        issues.push(...this.checkCommentedOutCode(file));
        issues.push(...this.checkTodoMarkers(file));
        issues.push(...this.checkConsoleLog(file));
        issues.push(...this.checkDuplicateScriptSrc(file));
        issues.push(...this.checkUnguardedParseInt(file));
        issues.push(...this.checkUnguardedLocalStorageArithmetic(file));
        issues.push(...this.checkCodeBlockWhitespace(file));
        issues.push(...this.checkEmptyTemplateLiterals(file));
        issues.push(...this.checkHeadingTagMismatch(file));
        issues.push(...this.checkScriptCloserInJS(file));
        issues.push(...this.checkJSSyntaxErrors(file));
        issues.push(...this.checkUnsafeInnerHTML(file));
        issues.push(...this.checkHardcodedRedirects(file));
        issues.push(...this.checkEvalUsage(file));
        issues.push(...this.checkDocumentWrite(file));
        issues.push(...this.checkQuizConfiguration(file));
        issues.push(...this.checkPatternAClientGrading(file));
        issues.push(...this.checkQuizRegression(file));
        issues.push(...this.checkQuizKeyAlignment(file));
        issues.push(...this.checkCustomQuizMissingKey(file));
        issues.push(...this.checkQuizKeyDrift(file));
        issues.push(...this.checkAnswerDistribution(file));
        issues.push(...this.checkAnswerPlaceholder(file));
        issues.push(...this.checkBrokenQuizCorrect(file));
        issues.push(...this.checkQuizParseable(file));
        issues.push(...this.checkLazyLoadedComponents(file));
        issues.push(...this.checkScrollTriggeredCompletion(file));
        issues.push(...this.checkTenantConfigFields(file));
        issues.push(...this.checkTenantBrokenAssets(file));
        issues.push(...this.checkTenantLicensedHouses(file));
        issues.push(...this.checkOverDeepIndexLinks(file));
        issues.push(...this.checkBrokenCourseHomeLinks(file));
        issues.push(...this.checkMissingCourseHomeLink(file));
        issues.push(...this.checkCompletionIdMismatch(file));
        issues.push(...this.checkCourseModuleEscapesToHouseRoot(file));
        issues.push(...this.checkContentLinkEscapesToPlatformRoot(file));
        issues.push(...this.checkModuleProgressSignature(file));
        issues.push(...this.checkLooksClickableButIsnt(file));
        issues.push(...this.checkDashboardBtnTenantRewrite(file));
        issues.push(...this.checkLocationHrefTenantLeak(file));
        issues.push(...this.checkPageTransitionTenantLeak(file));
        issues.push(...this.checkFormIframeTenantLeak(file));
        issues.push(...this.checkMissingTenantAutoLoader(file));
        issues.push(...this.checkAbsoluteHexworthUrlLeak(file));
        issues.push(...this.checkBlankTargetMissingNoopener(file));
        issues.push(...this.checkCompleteQuizPctArg(file));
        issues.push(...this.checkResultButtonStandard(file));
        issues.push(...this.checkEmptySlideText(file));
        issues.push(...this.checkBrokenIconRefs(file));
        issues.push(...this.checkSvgWidthPercentKeyframe(file));
        issues.push(...this.checkInfiniteOpacityFlicker(file));
        issues.push(...this.checkEmDashContent(file));
        issues.push(...this.checkHasVisualWithoutSvg(file));
        issues.push(...this.checkWsaSlideLayoutContract(file));
        issues.push(...this.checkWsaHasVisualTextBudget(file));
        issues.push(...this.checkDuplicateRootHtmlAttr(file));

        // Filter out allowlisted issues
        return issues.filter(issue => !this.isAllowlisted(file.path, issue.code));
    }

    /**
     * HEUR-001: Excessive inline scripts (>8 <script> blocks without src)
     */
    checkExcessiveInlineScripts(file) {
        const issues = [];
        const content = file.content;

        // Match <script> tags without src attribute
        const inlineScriptPattern = /<script(?![^>]*\bsrc\b)[^>]*>/gi;
        const matches = content.match(inlineScriptPattern);
        const count = matches ? matches.length : 0;

        if (count > 8) {
            issues.push({
                code: 'HEUR-001',
                severity: 'suspect',
                category: 'heuristic',
                message: `Excessive inline scripts: ${count} <script> blocks without src (threshold: 8)`,
                file: file.path,
                fix: 'Consider extracting inline scripts to external .js files'
            });
        }

        return issues;
    }

    /**
     * HEUR-002: Commented-out code references
     * Detects <!-- comments containing <script or <link patterns
     */
    checkCommentedOutCode(file) {
        const issues = [];
        const content = file.content;

        const commentPattern = /<!--([\s\S]*?)-->/g;
        let match;

        while ((match = commentPattern.exec(content)) !== null) {
            const commentBody = match[1];

            if (/<script\b/i.test(commentBody) || /<link\b/i.test(commentBody)) {
                const line = this.getLineNumber(content, match.index);
                issues.push({
                    code: 'HEUR-002',
                    severity: 'suspect',
                    category: 'heuristic',
                    message: 'Commented-out code reference (script or link tag in HTML comment)',
                    file: file.path,
                    line,
                    fix: 'Remove commented-out code or restore it if needed'
                });
            }
        }

        return issues;
    }

    /**
     * HEUR-003: TODO/FIXME/HACK markers inside <script> blocks
     */
    checkTodoMarkers(file) {
        const issues = [];
        const content = file.content;

        const scriptPattern = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
        let scriptMatch;

        while ((scriptMatch = scriptPattern.exec(content)) !== null) {
            const scriptContent = scriptMatch[1];
            const scriptStart = scriptMatch.index;
            const lines = scriptContent.split('\n');

            for (let i = 0; i < lines.length; i++) {
                const lineText = lines[i];
                const markerMatch = lineText.match(/\/\/\s*(TODO|FIXME|HACK)\b/i);

                if (markerMatch) {
                    const absolutePos = scriptStart + scriptContent.indexOf(lineText);
                    const line = this.getLineNumber(content, absolutePos);
                    issues.push({
                        code: 'HEUR-003',
                        severity: 'suspect',
                        category: 'heuristic',
                        message: `${markerMatch[1].toUpperCase()} marker in script: ${lineText.trim().substring(0, 60)}`,
                        file: file.path,
                        line,
                        fix: `Resolve or remove ${markerMatch[1].toUpperCase()} comment`
                    });
                }
            }
        }

        return issues;
    }

    /**
     * HEUR-004: console.log in inline scripts
     * Strips JS comments before checking to avoid false positives
     */
    checkConsoleLog(file) {
        const issues = [];
        const content = file.content;

        const scriptPattern = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
        let scriptMatch;

        while ((scriptMatch = scriptPattern.exec(content)) !== null) {
            const scriptContent = scriptMatch[1];
            const scriptStart = scriptMatch.index;

            // Strip single-line and multi-line JS comments
            const stripped = scriptContent
                .replace(/\/\/.*$/gm, '')
                .replace(/\/\*[\s\S]*?\*\//g, '');

            // Find console.log calls in stripped content
            const logPattern = /console\.log\s*\(/g;
            let logMatch;

            while ((logMatch = logPattern.exec(stripped)) !== null) {
                // Map back to original line number approximately
                const precedingContent = stripped.substring(0, logMatch.index);
                const lineOffset = precedingContent.split('\n').length - 1;
                const absolutePos = scriptStart + scriptContent.indexOf('console.log');
                const line = this.getLineNumber(content, absolutePos);

                issues.push({
                    code: 'HEUR-004',
                    severity: 'suspect',
                    category: 'heuristic',
                    message: 'console.log() in inline script (production hygiene)',
                    file: file.path,
                    line,
                    fix: 'Remove console.log or replace with proper logging'
                });
                break; // One report per script block is enough
            }
        }

        return issues;
    }

    /**
     * HEUR-005: Duplicate script includes (same src on multiple <script> tags)
     */
    checkDuplicateScriptSrc(file) {
        const issues = [];
        const content = file.content;

        const srcPattern = /<script[^>]*\bsrc\s*=\s*["']([^"']+)["'][^>]*>/gi;
        const srcMap = new Map(); // src -> [line numbers]
        let match;

        while ((match = srcPattern.exec(content)) !== null) {
            const src = match[1];
            const line = this.getLineNumber(content, match.index);

            if (!srcMap.has(src)) {
                srcMap.set(src, []);
            }
            srcMap.get(src).push(line);
        }

        for (const [src, lines] of srcMap) {
            if (lines.length > 1) {
                issues.push({
                    code: 'HEUR-005',
                    severity: 'suspect',
                    category: 'heuristic',
                    message: `Duplicate script include: "${src}" loaded ${lines.length} times (lines ${lines.join(', ')})`,
                    file: file.path,
                    line: lines[1], // Report at second occurrence
                    fix: `Remove duplicate <script src="${src}"> tag`
                });
            }
        }

        return issues;
    }

    /**
     * MATH-001: Unguarded parseInt() — missing fallback for NaN.
     *
     * parseInt() returns NaN when the input can't be parsed. Without a
     * fallback (|| 0), NaN propagates through arithmetic and corrupts
     * displayed values ("NaN%", "NaN GB", etc.).
     *
     * Detects: parseInt(x) not followed by || or ?? on the same line.
     * Ignores: parseInt(x, radix) used in a comparison or return statement
     *          where NaN is handled at the call site.
     */
    checkUnguardedParseInt(file) {
        const issues = [];
        const content = file.content;
        let fileHit = false; // One report per file max

        const scriptPattern = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
        let scriptMatch;

        while ((scriptMatch = scriptPattern.exec(content)) !== null) {
            if (fileHit) break;
            const scriptContent = scriptMatch[1];
            const scriptStart = scriptMatch.index;
            const lines = scriptContent.split('\n');

            for (let i = 0; i < lines.length; i++) {
                if (fileHit) break;
                const line = lines[i];

                // Skip comments
                const trimmed = line.trim();
                if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;

                // Only flag: parseInt() combined with + - * / on the SAME line
                // AND not guarded with || or ??
                if (!/\bparseInt\s*\(/.test(line)) continue;

                // Find the FULL parseInt(...) call by tracking paren depth
                // This avoids false positives from nested parens and regex literals
                const parseIntStart = line.search(/\bparseInt\s*\(/);
                if (parseIntStart === -1) continue;
                const openIdx = line.indexOf('(', parseIntStart + 8);
                let depth = 1, closeIdx = -1;
                for (let c = openIdx + 1; c < line.length; c++) {
                    if (line[c] === '(') depth++;
                    else if (line[c] === ')') { depth--; if (depth === 0) { closeIdx = c; break; } }
                }
                if (closeIdx === -1) continue;

                // Check what follows the full parseInt(...) call
                const afterCall = line.slice(closeIdx + 1).trimStart();
                // Check what precedes parseInt
                const beforeCall = line.slice(0, parseIntStart).trimEnd();

                // Must have arithmetic operator OUTSIDE the call
                const hasArithmeticAfter = /^[+\-*/]/.test(afterCall);
                const hasArithmeticBefore = /[+\-*/]$/.test(beforeCall);
                if (!hasArithmeticAfter && !hasArithmeticBefore) continue;

                // Check if guarded: parseInt(...) || or parseInt(...) ??
                if (/^(\|\||[?][?])/.test(afterCall)) continue;

                const absolutePos = scriptStart + scriptContent.indexOf(line);
                const lineNum = this.getLineNumber(content, absolutePos);

                issues.push({
                    code: 'MATH-001',
                    severity: 'suspect',
                    category: 'heuristic',
                    message: `Unguarded parseInt() in arithmetic — NaN will propagate if input is invalid`,
                    file: file.path,
                    line: lineNum,
                    fix: 'Add fallback: (parseInt(value, 10) || 0)'
                });
                fileHit = true;
            }
        }

        return issues;
    }

    /**
     * DATA-001: localStorage.getItem() in arithmetic without Number() coercion.
     *
     * localStorage stores strings. Using getItem() directly in arithmetic
     * causes string concatenation instead of addition:
     *   xp += localStorage.getItem('xp')  // "50" + "10" = "5010" not 60
     *
     * Detects: getItem() used with += or + without Number()/parseInt()/parseFloat().
     */
    checkUnguardedLocalStorageArithmetic(file) {
        const issues = [];
        const content = file.content;

        const scriptPattern = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
        let scriptMatch;

        while ((scriptMatch = scriptPattern.exec(content)) !== null) {
            const scriptContent = scriptMatch[1];
            const scriptStart = scriptMatch.index;
            const lines = scriptContent.split('\n');

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                const trimmed = line.trim();

                // Skip comments
                if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;

                // Pattern 1: += localStorage.getItem(...) without Number wrapper
                if (/\+=\s*localStorage\.getItem\s*\(/.test(line) &&
                    !/Number\s*\(\s*localStorage\.getItem/.test(line) &&
                    !/parseInt\s*\(\s*localStorage\.getItem/.test(line) &&
                    !/parseFloat\s*\(\s*localStorage\.getItem/.test(line)) {
                    const absolutePos = scriptStart + scriptContent.indexOf(line);
                    const lineNum = this.getLineNumber(content, absolutePos);

                    issues.push({
                        code: 'DATA-001',
                        severity: 'suspect',
                        category: 'heuristic',
                        message: `localStorage.getItem() used in += without Number() coercion — causes string concatenation instead of addition`,
                        file: file.path,
                        line: lineNum,
                        fix: 'Wrap with Number(): += Number(localStorage.getItem(...))'
                    });
                    continue;
                }

                // Pattern 2: arithmetic operator with getItem on either side
                if (/localStorage\.getItem\s*\([^)]*\)\s*[+\-*/]/.test(line) ||
                    /[+\-*/]\s*localStorage\.getItem\s*\(/.test(line)) {
                    // Check it's not already wrapped
                    if (/Number\s*\(\s*localStorage\.getItem/.test(line) ||
                        /parseInt\s*\(\s*localStorage\.getItem/.test(line) ||
                        /parseFloat\s*\(\s*localStorage\.getItem/.test(line)) {
                        continue;
                    }

                    const absolutePos = scriptStart + scriptContent.indexOf(line);
                    const lineNum = this.getLineNumber(content, absolutePos);

                    issues.push({
                        code: 'DATA-001',
                        severity: 'suspect',
                        category: 'heuristic',
                        message: `localStorage.getItem() in arithmetic expression without Number() coercion — returns string, not number`,
                        file: file.path,
                        line: lineNum,
                        fix: 'Wrap with Number(): Number(localStorage.getItem(...))'
                    });
                }
            }
        }

        return issues;
    }

    /**
     * HEUR-009: Empty template literal ${} in inline scripts
     *
     * Detects empty expressions inside template literals within <script> blocks.
     * An empty ${} is a JavaScript SyntaxError that prevents the entire script
     * block from parsing — killing all constructors, event listeners, and
     * initialization code in that block. This pattern was introduced when
     * automated tag conversion (e.g., h4→h3) stripped template expressions
     * from inside heading tags: <h4>${current.task}</h4> → <h3>${}</h3>.
     */
    checkEmptyTemplateLiterals(file) {
        const issues = [];
        const content = file.content;

        // Extract inline <script> blocks (no src attribute)
        const scriptPattern = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
        let scriptMatch;

        while ((scriptMatch = scriptPattern.exec(content)) !== null) {
            const scriptContent = scriptMatch[1];
            const scriptStart = scriptMatch.index;

            // Find empty template expressions: ${}
            const emptyExprPattern = /\$\{\s*\}/g;
            let exprMatch;

            while ((exprMatch = emptyExprPattern.exec(scriptContent)) !== null) {
                // Skip if inside a comment
                const lineStart = scriptContent.lastIndexOf('\n', exprMatch.index) + 1;
                const lineEndIdx = scriptContent.indexOf('\n', exprMatch.index);
                const lineEnd = lineEndIdx === -1 ? scriptContent.length : lineEndIdx;
                const lineText = scriptContent.substring(lineStart, lineEnd);
                if (lineText.trim().startsWith('//') || lineText.trim().startsWith('*')) continue;

                // FALSE-POSITIVE GUARD: a real empty template literal lives inside
                // a backtick-delimited template string. The `${}` substring also
                // appears benignly in:
                //   - regex character classes:  /[.*+?^${}()|[\]\\]/  (escape chars)
                //   - single/double-quoted strings:  'use ${} interpolation'  (literal text)
                //   - HTML attribute values rendered in inline scripts
                //
                // Discriminator: a TRUE empty template literal must be inside an
                // unclosed backtick template. Count unescaped backticks BEFORE
                // the ${} position in the entire script block — if odd, we're
                // inside a template (real bug). If even (incl. zero), we're
                // not (false positive — skip).
                const before = scriptContent.substring(0, exprMatch.index);
                // Count backticks not preceded by an odd number of backslashes.
                // Simple heuristic: split on backslash-runs, then count `.
                let backtickCount = 0;
                for (let i = 0; i < before.length; i++) {
                    if (before[i] === '`') {
                        // count consecutive backslashes immediately before
                        let bs = 0;
                        for (let j = i - 1; j >= 0 && before[j] === '\\'; j--) bs++;
                        if (bs % 2 === 0) backtickCount++;
                    }
                }
                if (backtickCount % 2 === 0) continue;  // not inside template

                const absolutePos = scriptStart + scriptMatch[0].indexOf(scriptContent) + exprMatch.index;
                const lineNum = this.getLineNumber(content, absolutePos);

                issues.push({
                    code: 'HEUR-009',
                    severity: 'critical',
                    category: 'heuristic',
                    message: 'Empty template literal ${} — SyntaxError kills entire <script> block (terminal, event listeners, and init code will not execute)',
                    file: file.path,
                    line: lineNum,
                    fix: 'Restore the missing expression inside ${}, e.g., ${current.task} or ${obj.task}'
                });
            }
        }

        return issues;
    }

    /**
     * HEUR-010: querySelector targets heading tag not in HTML
     *
     * Detects when a querySelector() call references a heading level
     * (e.g., .mission-header h3) that doesn't match the actual heading
     * tag in the HTML (e.g., <h2>). querySelector returns null, and
     * accessing .textContent on null throws a TypeError that crashes the
     * function. Common after automated semantic tag conversion (h3→h2, h4→h3).
     */
    checkHeadingTagMismatch(file) {
        const issues = [];
        const content = file.content;

        // Only check HTML files with both <style> and <script> blocks
        if (!file.path.endsWith('.html')) return issues;

        // Find querySelector calls that target parent + heading combinator
        // e.g., querySelector('.mission-header h3')
        const qsPattern = /querySelector\s*\(\s*['"]([^'"]+\s+h([2-6]))['"]\s*\)/g;
        let qsMatch;

        while ((qsMatch = qsPattern.exec(content)) !== null) {
            const selector = qsMatch[1];
            const headingLevel = qsMatch[2];

            // Extract the parent class from the selector (e.g., ".mission-header" from ".mission-header h3")
            const parentMatch = selector.match(/\.([a-zA-Z0-9_-]+)\s+h[2-6]/);
            if (!parentMatch) continue;
            const parentClass = parentMatch[1];

            // Check if the HTML contains that parent class with a DIFFERENT heading level
            const htmlPattern = new RegExp(
                `class\\s*=\\s*["'][^"']*\\b${parentClass}\\b[^"']*["'][\\s\\S]*?<h([2-6])>`,
                'i'
            );
            const htmlMatch = content.match(htmlPattern);

            if (htmlMatch && htmlMatch[1] !== headingLevel) {
                const lineNum = this.getLineNumber(content, qsMatch.index);
                issues.push({
                    code: 'HEUR-010',
                    severity: 'high',
                    category: 'heuristic',
                    message: `querySelector targets .${parentClass} h${headingLevel} but HTML has <h${htmlMatch[1]}> — returns null, crashes on property access`,
                    file: file.path,
                    line: lineNum,
                    fix: `Change selector to '.${parentClass} h${htmlMatch[1]}' to match the actual HTML heading level`
                });
            }
        }

        return issues;
    }

    /**
     * HEUR-006: Hardcoded relative href in shared JS renderer
     *
     * Scans .js files in the components/ directory for hardcoded relative
     * href attributes (e.g., href="../../index.html"). These are fragile
     * because shared renderers are loaded by consumer pages at different
     * directory depths, so the relative path resolves differently depending
     * on which page loads the renderer.
     *
     * This is a GLOBAL scan — called once, not per-file.
     * @returns {Array} Issues found
     */
    validateRendererLinks() {
        const issues = [];
        const componentsDir = path.resolve(this.rootPath, 'components');

        let jsFiles;
        try {
            jsFiles = fs.readdirSync(componentsDir)
                .filter(f => f.endsWith('.js') && /renderer/i.test(f));
        } catch (err) {
            return issues;
        }

        for (const filename of jsFiles) {
            const filePath = path.join(componentsDir, filename);
            let content;
            try {
                content = fs.readFileSync(filePath, 'utf8');
            } catch (err) {
                continue;
            }

            // Match href="..." with relative paths (starts with ../ or ./)
            const hrefPattern = /href\s*=\s*["'](\.\.\/[^"']+)["']/g;
            let match;

            while ((match = hrefPattern.exec(content)) !== null) {
                const href = match[1];
                const line = this.getLineNumber(content, match.index);

                if (this.isAllowlisted(`components/${filename}`, 'HEUR-006')) {
                    continue;
                }

                issues.push({
                    code: 'HEUR-006',
                    severity: 'suspect',
                    category: 'heuristic',
                    message: `Hardcoded relative href in shared renderer: ${href} — resolves differently depending on consumer page depth`,
                    file: `components/${filename}`,
                    line,
                    fix: `Use absolute path from site root (e.g., /houses/shield/index.html) instead of relative path`
                });
            }
        }

        return issues;
    }

    /**
     * HEUR-007: Code block CSS missing white-space: pre or pre-wrap
     *
     * Detects <style> blocks that define .code-block (or similar code container
     * classes) using monospace font-family but without white-space: pre or
     * pre-wrap. Without this property, browsers collapse newlines and the
     * multi-line command content renders as a single paragraph.
     */
    checkCodeBlockWhitespace(file) {
        const issues = [];
        const content = file.content;

        // Only check HTML files with inline <style> blocks
        if (!content.includes('<style>') && !content.includes('<style ')) return issues;

        // Extract all <style> blocks
        const stylePattern = /<style[^>]*>([\s\S]*?)<\/style>/gi;
        let styleMatch;

        while ((styleMatch = stylePattern.exec(content)) !== null) {
            const styleContent = styleMatch[1];
            const styleStartPos = styleMatch.index;

            // Find CSS rules that look like code/command containers:
            // .code-block, .code-block-sm, .command-block, .terminal-code, etc.
            const rulePattern = /\.(code-block(?:-\w+)?|command-block|terminal-code)\s*\{([^}]+)\}/g;
            let ruleMatch;

            while ((ruleMatch = rulePattern.exec(styleContent)) !== null) {
                const className = ruleMatch[1];
                const ruleBody = ruleMatch[2];

                // Check for monospace font (confirms this is a code container)
                const hasMonospace = /font-family\s*:.*monospace/i.test(ruleBody);
                if (!hasMonospace) continue;

                // Check for white-space: pre or pre-wrap
                const hasWhiteSpace = /white-space\s*:\s*pre(?:-wrap)?/i.test(ruleBody);
                if (hasWhiteSpace) continue;

                // This is a code block with monospace but no white-space preservation
                const line = this.getLineNumber(content, styleStartPos + ruleMatch.index);

                issues.push({
                    code: 'HEUR-007',
                    severity: 'medium',
                    category: 'heuristic',
                    message: `.${className} uses monospace font but missing white-space: pre-wrap — multi-line code/commands will render as a single paragraph`,
                    file: file.path,
                    line,
                    fix: `Add 'white-space: pre-wrap;' to the .${className} CSS rule`
                });
            }
        }

        return issues;
    }

    /**
     * HEUR-008: position:fixed in dynamically created overlay
     *
     * Scans component JS files for CSS strings containing position: fixed
     * inside dynamically created elements (createElement + appendChild).
     * position:fixed breaks when any ancestor (including body) has a CSS
     * transform, filter, or will-change property — the element becomes
     * positioned relative to that ancestor instead of the viewport.
     *
     * On dashboards with easter-egg effects that set body.style.filter,
     * this causes modals to appear at the top of the document instead of
     * the viewport, making them invisible when the user is scrolled down.
     *
     * Fix: use position:absolute with JS-calculated top (window.scrollY)
     * and height (window.innerHeight), or use a static DOM element that
     * already exists in the HTML.
     */
    validateFixedPositionOverlays() {
        const issues = [];
        const componentsDir = path.resolve(this.rootPath, 'components');

        let jsFiles;
        try {
            jsFiles = fs.readdirSync(componentsDir).filter(f => f.endsWith('.js'));
        } catch (err) {
            return issues;
        }

        for (const filename of jsFiles) {
            const filePath = path.join(componentsDir, filename);
            let content;
            try {
                content = fs.readFileSync(filePath, 'utf8');
            } catch (err) {
                continue;
            }

            // Only flag files that dynamically create elements (not static HTML)
            const createsElements = /createElement|\.innerHTML\s*=|\.className\s*=/.test(content);
            if (!createsElements) continue;

            // Look for position: fixed in CSS strings or template literals
            const fixedPattern = /position\s*:\s*fixed/gi;
            let match;

            while ((match = fixedPattern.exec(content)) !== null) {
                const line = this.getLineNumber(content, match.index);

                // Skip if in a JS comment (// or /* */)
                const lineStart = content.lastIndexOf('\n', match.index) + 1;
                const lineText = content.substring(lineStart, content.indexOf('\n', match.index));
                const trimmedLine = lineText.trim();
                if (trimmedLine.startsWith('//') || trimmedLine.startsWith('*') || trimmedLine.startsWith('/*')) {
                    continue;
                }

                if (this.isAllowlisted(`components/${filename}`, 'HEUR-008')) {
                    continue;
                }

                issues.push({
                    code: 'HEUR-008',
                    severity: 'suspect',
                    category: 'heuristic',
                    message: `position:fixed in dynamically created element — breaks when body/ancestor has CSS transform or filter (e.g., dashboard easter-egg effects set body.style.filter)`,
                    file: `components/${filename}`,
                    line,
                    fix: `Use position:absolute with JS-calculated top/height from window.scrollY/innerHeight, or use a pre-existing static DOM element from the HTML`
                });
            }
        }

        return issues;
    }

    /**
     * HEUR-011: Literal </script> inside JS string or comment
     *
     * The HTML parser doesn't understand JavaScript. When it encounters
     * </script> (case-insensitive) inside a JS string literal, template
     * literal, or comment, it terminates the <script> block. All JS after
     * that point is dead — parsed as HTML, never executed.
     *
     * The fix is to escape as <\/script> (backslash is a JS no-op but
     * breaks the HTML parser's pattern match).
     *
     * This check extracts inline script blocks using a greedy approach
     * (not the naive regex that itself falls victim to this bug), then
     * scans the raw text for </script> patterns that aren't the actual
     * closing tag.
     */
    checkScriptCloserInJS(file) {
        const issues = [];
        const content = file.content;

        // Strategy: find each inline <script> opening, then count how many
        // </script> (case-insensitive) occur before the NEXT <script> opening
        // or end of file. If count > 1, the first N-1 are inside JS code —
        // each one terminates the script block prematurely.
        //
        // We must NOT use regex to extract script blocks, because the regex
        // itself falls victim to the same </script> bug we're trying to detect.

        // Collect all <script> openings (with and without src)
        const allOpens = [];
        const openPattern = /<script\b[^>]*>/gi;
        let m;
        while ((m = openPattern.exec(content)) !== null) {
            const hasSrc = /\bsrc\s*=/i.test(m[0]);
            allOpens.push({ index: m.index, end: m.index + m[0].length, hasSrc });
        }

        // Collect all </script> closings
        const allCloses = [];
        const closePattern = /<\/script\s*>/gi;
        while ((m = closePattern.exec(content)) !== null) {
            // Skip escaped ones (preceded by backslash, like <\/script>)
            if (m.index > 0 && content[m.index - 1] === '\\') continue;
            allCloses.push(m.index);
        }

        // For each inline script opening, find how many </script> occur
        // before the next <script> tag (or end of file)
        for (let i = 0; i < allOpens.length; i++) {
            if (allOpens[i].hasSrc) continue; // skip external scripts

            const codeStart = allOpens[i].end;
            const nextOpenStart = (i + 1 < allOpens.length) ? allOpens[i + 1].index : content.length;

            // Count </script> between this code start and the next <script> opening
            const closesInRange = allCloses.filter(pos => pos >= codeStart && pos < nextOpenStart);

            // First one is legitimate; any extras are bugs
            if (closesInRange.length > 1) {
                // Flag all but the last one (the last is the real closing tag)
                for (let j = 0; j < closesInRange.length - 1; j++) {
                    const line = this.getLineNumber(content, closesInRange[j]);
                    issues.push({
                        code: 'HEUR-011',
                        severity: 'high',
                        category: 'heuristic',
                        message: 'Literal </script> inside JS code — HTML parser will terminate the script block here, killing all JS below this point',
                        file: file.path,
                        line,
                        fix: 'Escape as <\\/script> — the backslash is invisible to JS but prevents HTML parser termination'
                    });
                }
            }
        }

        return issues;
    }

    /**
     * HEUR-012: JS syntax error detection via new Function() parse
     *
     * Uses the JS engine's own parser to detect syntax errors in inline
     * script blocks. This catches missing quotes, unclosed strings,
     * unbalanced brackets, and other errors that would cause blank screens.
     *
     * Only checks inline scripts (not external .js files loaded via src).
     * Skips blocks shorter than 50 characters (trivial one-liners).
     */
    checkJSSyntaxErrors(file) {
        const issues = [];
        const content = file.content;

        // Skip files that contain JS teaching content — code examples in
        // <script> tags are parsed as executable but are actually examples.
        // backbone/ is the JS teaching series; labs and quizzes often embed
        // code samples that trigger false positive syntax errors.
        if (file.path.includes('/backbone/') ||
            file.path.includes('/network-plus/quizzes/') ||
            file.path.includes('/network-plus/labs/') ||
            file.path.includes('/piverse/electronics/quizzes/') ||
            file.path.includes('/ai-900/labs/') ||
            file.path.includes('/sc-900/labs/') ||
            file.path.includes('/ow-04-burned-source/') ||
            file.path.includes('/ip-addressing/')) {
            return issues;
        }

        // Extract inline script blocks
        const scriptPattern = /<script(?![^>]*\bsrc\b)([^>]*)>([\s\S]*?)<\/script>/gi;
        let match;

        while ((match = scriptPattern.exec(content)) !== null) {
            const attrs = match[1];
            const code = match[2];

            // Skip trivial scripts
            if (!code.trim() || code.trim().length < 50) continue;

            // Skip module scripts — import/export are valid ES module syntax
            // but new Function() parses as classic scripts (no module support)
            if (/type\s*=\s*["']module["']/i.test(attrs)) continue;

            // Skip non-JS script types: JSON-LD structured data
            // (application/ld+json), JSON config blobs, server templates, etc.
            // These have `type` attributes that signal the browser NOT to
            // execute them as JavaScript. JSON-LD content starts with { which
            // new Function() parses as a block-statement, triggering false
            // "Unexpected token ':'" syntax errors on every property colon.
            // Added 2026-06-02 (CAREER-4) when SEO JSON-LD blocks fired 25 FPs.
            if (/type\s*=\s*["'][^"']*\/(?:ld\+json|json|template|handlebars|mustache|x-template)["']/i.test(attrs)) continue;

            try {
                // new Function() parses the code without executing it
                new Function(code);
            } catch (err) {
                if (err instanceof SyntaxError) {
                    const line = this.getLineNumber(content, match.index);

                    issues.push({
                        code: 'HEUR-012',
                        severity: 'high',
                        category: 'heuristic',
                        message: `JS syntax error: ${err.message}`,
                        file: file.path,
                        line,
                        fix: 'Fix the syntax error — this kills the entire script block'
                    });
                }
            }
        }

        return issues;
    }

    /**
     * HEUR-013: innerHTML with unsanitized template literals
     *
     * Detects `element.innerHTML = \`...\${variable}...\`` where the variable
     * could contain user-controlled data. This is the primary XSS vector in
     * single-page apps that don't use a framework with auto-escaping.
     *
     * Excludes:
     * - Assignments where escapeHtml/escHtml wraps the variable
     * - Static template literals with only class names or icon paths
     * - textContent assignments (safe by definition)
     *
     * The fix is to use textContent for user data, or pass through escapeHtml().
     * innerHTML is safe for static HTML structure — dangerous when it includes
     * dynamic values from user input, API responses, or URL parameters.
     */
    checkUnsafeInnerHTML(file) {
        const issues = [];
        const content = file.content;

        // Only check .js component files — these are shared across pages
        // and have the highest XSS impact. Content HTML files use innerHTML
        // extensively for static templates which creates too much noise.
        if (!file.path.endsWith('.js')) return issues;
        if (!file.path.includes('components/')) return issues;

        // Find innerHTML assignments that interpolate variables without escaping.
        // We scan line-by-line to accurately report line numbers.
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Must have .innerHTML and a template literal with ${
            if (!line.includes('.innerHTML') || !line.includes('${')) continue;

            // Skip if the line uses escapeHtml/escHtml
            if (line.includes('escapeHtml') || line.includes('escHtml') || line.includes('esc(')) continue;

            // Skip comments
            const trimmed = line.trim();
            if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;

            // Skip safe patterns: only icons, class names, or numbers
            if (/\$\{(count|length|size|\.length|items\.|i\b|\d|'|")/.test(line)) continue;

            issues.push({
                code: 'HEUR-013',
                severity: 'high',
                category: 'heuristic',
                message: 'innerHTML in shared component with unsanitized template variable — XSS risk',
                file: file.path,
                line: i + 1,
                fix: 'Use textContent for user data, or wrap variables with escapeHtml() before inserting into innerHTML'
            });
        }

        return issues;
    }

    /**
     * HEUR-014: Hardcoded onclick window.location redirects
     *
     * Detects onclick="window.location.href='...'" patterns in HTML.
     * These hardcoded redirects bypass TenantRouter (breaking tenant
     * encapsulation) and are fragile if page paths change.
     *
     * In a pentesting context: low-severity issues like hardcoded redirects
     * combine with tenant context to create session escape vulnerabilities.
     * A tenant user clicking a hardcoded redirect lands on Hexworth Prime's
     * general dashboard — session context leak.
     *
     * The fix is to use TenantRouter.getUrl() for navigation destinations,
     * or use <a href> tags which TenantShell can intercept.
     */
    checkHardcodedRedirects(file) {
        const issues = [];
        const content = file.content;

        // Only check HTML files
        if (!file.path.endsWith('.html')) return issues;

        // Match: onclick="window.location.href='...'"  or  onclick="window.location='...'"
        const pattern = /onclick\s*=\s*["']window\.location(?:\.href)?\s*=\s*['"][^'"]+['"]/gi;
        let match;

        while ((match = pattern.exec(content)) !== null) {
            // Skip if it already uses TenantRouter
            if (match[0].includes('TenantRouter')) continue;

            // Skip tenant dashboard pages — they handle their own routing
            if (file.path.includes('tenant/')) continue;

            const line = this.getLineNumber(content, match.index);

            issues.push({
                code: 'HEUR-014',
                severity: 'medium',
                category: 'heuristic',
                message: 'Hardcoded onclick redirect — bypasses TenantRouter, breaks tenant encapsulation',
                file: file.path,
                line,
                fix: 'Use <a href> tags (interceptable by TenantShell) or call TenantRouter.getUrl() for navigation'
            });
        }

        return issues;
    }

    /**
     * HEUR-015: eval() usage in non-sandbox code
     *
     * eval() executes arbitrary strings as code. In a cybersecurity education
     * platform, this is especially dangerous because:
     * 1. Students are actively learning exploitation techniques
     * 2. Content includes real attack payloads as educational examples
     * 3. eval() with any student-influenced input = code injection
     *
     * Excludes:
     * - Arena terminal/sandbox files (eval is expected for code execution features)
     * - Educational content that mentions eval() in text (not actual calls)
     * - JSON.parse (safe alternative, different function)
     *
     * The fix: use new Function() for controlled code execution (isolates scope),
     * or JSON.parse() for data parsing.
     */
    checkEvalUsage(file) {
        const issues = [];
        const content = file.content;

        // Skip arena sandbox files where eval is expected
        if (file.path.includes('arena/') && file.path.includes('engine/')) return issues;
        if (file.path.includes('CodeRunner')) return issues;
        if (file.path.includes('SQLTerminal')) return issues;
        if (file.path.includes('sandbox')) return issues;
        // Educational sandbox content-type conventions — eval is the legitimate
        // mechanism for executing student-submitted code (Python applets,
        // calculator widgets, exam code-runners, interactive lab cells, games).
        // Per architecture: these file extensions denote single-page sandboxes.
        if (file.path.endsWith('.applet.html')) return issues;
        if (file.path.endsWith('.lab.html')) return issues;
        if (file.path.endsWith('.exam.html')) return issues;
        if (file.path.endsWith('.game.html')) return issues;
        if (file.path.endsWith('.module.html')) return issues;
        if (file.path.endsWith('.simulator.html')) return issues;
        // Educational exploitation content — eval IS the topic being taught.
        // Vault is the architectural home for offensive-security teaching content.
        if (file.path.includes('dark-arts/vault/')) return issues;

        // Extract script blocks
        const scriptBlocks = this._extractInlineScripts(content);
        const codeToCheck = file.path.endsWith('.js') ? content : scriptBlocks.join('\n');

        // Match actual eval() calls, not mentions in strings or comments
        const pattern = /\beval\s*\(/g;
        let match;

        while ((match = pattern.exec(codeToCheck)) !== null) {
            // Check if this eval is in a comment
            const lineStart = codeToCheck.lastIndexOf('\n', match.index) + 1;
            const lineText = codeToCheck.substring(lineStart, codeToCheck.indexOf('\n', match.index));
            if (lineText.trim().startsWith('//') || lineText.trim().startsWith('*')) continue;

            // Check if it's inside a string (educational reference, not actual call)
            const before = codeToCheck.substring(Math.max(0, match.index - 50), match.index);
            if (/['"`]/.test(before.slice(-1))) continue;

            const line = this.getLineNumber(codeToCheck, match.index);

            issues.push({
                code: 'HEUR-015',
                severity: 'suspect',
                category: 'heuristic',
                message: 'eval() usage — code injection risk. Use new Function() or JSON.parse() instead',
                file: file.path,
                line,
                fix: 'Replace eval() with new Function() for controlled execution or JSON.parse() for data'
            });
        }

        return issues;
    }

    /**
     * HEUR-016: document.write() usage
     *
     * document.write() after page load replaces the entire DOM. Even during
     * load, it creates race conditions and prevents streaming HTML parsing.
     * Modern alternatives: createElement + appendChild, innerHTML on a
     * container, or template elements.
     */
    checkDocumentWrite(file) {
        const issues = [];
        const content = file.content;

        const scriptBlocks = this._extractInlineScripts(content);
        const codeToCheck = file.path.endsWith('.js') ? content : scriptBlocks.join('\n');

        const pattern = /document\.write\s*\(/g;
        let match;

        while ((match = pattern.exec(codeToCheck)) !== null) {
            // Skip comments
            const lineStart = codeToCheck.lastIndexOf('\n', match.index) + 1;
            const lineText = codeToCheck.substring(lineStart, codeToCheck.indexOf('\n', match.index));
            if (lineText.trim().startsWith('//') || lineText.trim().startsWith('*')) continue;

            const line = this.getLineNumber(codeToCheck, match.index);

            issues.push({
                code: 'HEUR-016',
                severity: 'medium',
                category: 'heuristic',
                message: 'document.write() replaces the entire DOM if called after page load',
                file: file.path,
                line,
                fix: 'Use createElement + appendChild, or set innerHTML on a container element'
            });
        }

        return issues;
    }

    /**
     * QUIZ-001/002/003: Quiz configuration integrity checks
     *
     * Validates that quizzes using QuizEngine are properly configured:
     *
     * QUIZ-001 (high): serverGrading: true BUT correct: fields still present.
     *   The answers are redundant (server has them) but still exposed to
     *   students via View Source. Security leak — remove client-side answers.
     *
     * QUIZ-002 (high): NO serverGrading, HAS correct: fields.
     *   Answers are fully client-side — students can see them in source.
     *   Should migrate to serverGrading: true with Firestore keys.
     *
     * QUIZ-003 (critical): NO serverGrading, NO correct: fields.
     *   Quiz has no answers anywhere — grades everyone 0%. Broken quiz
     *   that wastes student time and gives no credit.
     *
     * Only checks .quiz.html files (by naming convention) and files that
     * contain "QuizEngine" in their content.
     */
    checkQuizConfiguration(file) {
        const issues = [];
        const content = file.content;

        // Only check files that use QuizEngine
        if (!content.includes('QuizEngine')) return issues;

        // Skip index pages that merely reference QuizEngine in links/text
        if (file.path.endsWith('index.html')) return issues;

        // Severity-demotion marker (per feedback_severity_demotion_pattern.md):
        // a quiz that explicitly declares itself a practice/prep instrument
        // gets QUIZ-002 demoted from HIGH to MEDIUM. The exposed answers
        // remain a code-smell (validator still detects), but the operator
        // has acknowledged this is not a graded surface and an in-page
        // PRACTICE banner alerts students.
        const isPracticeMode =
            /<html[^>]*\bdata-practice-mode\s*=\s*["']true["']/.test(content) ||
            /<meta\s+name=["']hex-practice-mode["']\s+content=["']true["']/.test(content);

        const hasServerGrading = /serverGrading\s*:\s*true/.test(content);
        // Match correct: N where it appears in a question context (near 'options:' or 'question:').
        // Exclude correct: 0 in counter/tracker objects (e.g., { count: 0, correct: 0 }).
        // Refined: scan ALL `correct: <int>` occurrences and reject those that
        // appear on a line ALSO containing `count:` (counter sibling pattern).
        // Real quiz-answer correct: never co-occurs with count: on one line.
        const correctAnswerRe = /^.*?\bcorrect\s*:\s*(\d+).*$/gm;
        let hasClientAnswers = false;
        let m;
        while ((m = correctAnswerRe.exec(content)) !== null) {
            const lineText = m[0];
            // Skip counter objects: same-line `count:` sibling
            if (/\bcount\s*:/.test(lineText)) continue;
            // Real answer field: any positive index, OR index 0 in a quiz with options
            const idx = parseInt(m[1], 10);
            if (idx > 0) { hasClientAnswers = true; break; }
            if (idx === 0 && /options\s*:\s*\[/.test(content)) { hasClientAnswers = true; break; }
        }

        // Count questions to distinguish real quizzes from pages that mention QuizEngine
        const questionCount = (content.match(/question\s*:\s*['"]/g) || []).length;
        if (questionCount < 2) return issues; // Not a real quiz

        if (hasServerGrading && hasClientAnswers) {
            // QUIZ-001: Server grading enabled but client answers still present
            issues.push({
                code: 'QUIZ-001',
                severity: 'high',
                category: 'quiz',
                message: 'Quiz has serverGrading: true but still contains client-side correct: fields — answers exposed redundantly via View Source',
                file: file.path,
                line: this.getLineNumber(content, content.search(/\bcorrect\s*:\s*\d/)),
                fix: 'Remove all correct: fields from questions — server-side gradeQuiz CF has the answers in Firestore'
            });
        } else if (!hasServerGrading && hasClientAnswers) {
            // QUIZ-002: No server grading, client answers exposed.
            // Demoted to MEDIUM if the quiz explicitly declares practice-mode
            // (via <html data-practice-mode="true"> or hex-practice-mode meta).
            issues.push({
                code: 'QUIZ-002',
                severity: isPracticeMode ? 'medium' : 'high',
                category: 'quiz',
                message: isPracticeMode
                    ? 'Practice quiz has client-side correct: fields (' + questionCount + ' questions). Practice-mode demotes severity but answers still visible via View Source.'
                    : 'Quiz has client-side correct: fields without serverGrading — answers visible via View Source (' + questionCount + ' questions)',
                file: file.path,
                line: this.getLineNumber(content, content.search(/\bcorrect\s*:\s*\d/)),
                fix: isPracticeMode
                    ? 'Practice mode acknowledged. To clear entirely: convert to serverGrading: true and seed answers to Firestore quiz_keys/.'
                    : 'Add serverGrading: true, add houseId, seed answers to Firestore quiz_keys/, then remove correct: fields. (Or mark <html data-practice-mode="true"> if this is explicitly a practice instrument.)'
            });
        } else if (!hasServerGrading && !hasClientAnswers) {
            // QUIZ-003: No answers anywhere — quiz is broken
            issues.push({
                code: 'QUIZ-003',
                severity: 'critical',
                category: 'quiz',
                message: 'Quiz has NO serverGrading and NO correct: fields — grades everyone 0%. Broken quiz with ' + questionCount + ' questions',
                file: file.path,
                line: this.getLineNumber(content, content.search(/QuizEngine/)),
                fix: 'Add serverGrading: true and houseId, then seed answers to Firestore quiz_keys/'
            });
        }
        // serverGrading: true + no client answers = correct configuration, no issue

        return issues;
    }

    /**
     * HEUR-030f: Hard-coded https://hexworth.com/ URL on tenant-context as
     * a nav target.
     *
     * Tenant isolation depends on TenantRouter.getUrl() for navigation.
     * Hard-coded absolute hexworth.com URLs bypass TenantRouter and
     * TenantShell's runtime overrideLinks rewriter.
     *
     * Patterns:
     *   1. <a href="https://hexworth.com/..."> (HTML attribute, masked content)
     *   2. <form action="https://hexworth.com/..."> (HTML attribute, masked content)
     *   3. location.href/assign/replace + PageTransition.navigateTo with literal
     *      hexworth.com URL, inside an inline script that has NO TenantRouter
     *      guard — matches HEUR-030b/c per-block-guard precedent.
     *
     * NOT flagged (intentional):
     *   - <link rel="canonical">, <meta property="og:url">, JSON-LD blobs —
     *     SEO directives, not user-clickable. Pattern 1's <a\b anchor and
     *     Pattern 2's <form\b anchor structurally exclude these tags.
     *   - <img src>, <script src>, <link href> stylesheets — resources.
     *   - Variable-assignment strings (var X = "https://hexworth.com/...") —
     *     audit 2026-06-06 found only pis-kahoot-host.review.html (2 lines
     *     of joinUrl), confirmed as the correct platform join URL. Documented
     *     as known gap; revisit if more variable-assignment leaks surface.
     *
     * Severity: HIGH.
     */
    checkAbsoluteHexworthUrlLeak(file) {
        const issues = [];
        const content = file.content;
        if (!content) return issues;

        const inScope = /(?:^|\/)_app\/(?:houses|tenant)\/.+\.html$/.test(file.path);
        if (!inScope) return issues;
        if (/_app\/tenant\/dashboard-[^/]+\.html$/.test(file.path)) return issues;

        // Length-preserving comment mask — m.index aligns with content positions
        const masked = content.replace(/<!--[\s\S]*?-->/g, function(m) {
            return ' '.repeat(m.length);
        });

        // Patterns 1-2: HTML attribute context. <a\b and <form\b anchors
        // structurally exclude <link>, <meta>, <img>, <script>, <iframe>.
        const attrPatterns = [
            { re: /<a\b[^>]*\bhref\s*=\s*["'](https?:\/\/hexworth\.com[^"']*)["']/gi, kind: '<a href>', fix: 'Convert to relative path so TenantShell.overrideLinks() rewrites when applicable, OR wrap with TenantRouter.getUrl().' },
            { re: /<form\b[^>]*\baction\s*=\s*["'](https?:\/\/hexworth\.com[^"']*)["']/gi, kind: '<form action>', fix: 'Convert form action to relative path or compute via TenantRouter.getUrl() at submit time.' }
        ];

        for (const { re, kind, fix } of attrPatterns) {
            let m;
            while ((m = re.exec(masked)) !== null) {
                issues.push({
                    code: 'HEUR-030f',
                    severity: 'high',
                    category: 'heuristic',
                    message: `${kind} hard-codes absolute hexworth.com URL '${m[1]}' — bypasses TenantRouter, leaks tenant context`,
                    file: file.path,
                    line: this.getLineNumber(content, m.index),
                    fix: fix
                });
            }
        }

        // Patterns 3-4: JS context. Use _extractInlineScripts + per-block
        // TenantRouter guard. Matches HEUR-030b/c precedent. JSON-LD
        // <script type="application/ld+json"> blocks are extracted by
        // _extractInlineScripts but won't match location.href= or
        // PageTransition.navigateTo regex (JSON-LD is data, not JS code).
        const scripts = this._extractInlineScripts(content);
        const jsPatterns = [
            { kindLabel: 'location nav', fix: 'Compute via TenantRouter: var url = (typeof TenantRouter !== "undefined" && TenantRouter.isActive()) ? TenantRouter.getUrl("...") : "...relative..."; location.href = url;' },
            { kindLabel: 'PageTransition.navigateTo', fix: 'Wrap target via TenantRouter.getUrl() before passing to PageTransition.navigateTo.' }
        ];

        for (const script of scripts) {
            if (/TenantRouter\s*\.\s*(?:getUrl|isActive|goToHub)/.test(script)) continue;

            // Fresh regexes per block to reset lastIndex
            const locRe = /(?:window\.)?location\s*\.\s*(?:href\s*=|assign\s*\(\s*|replace\s*\(\s*)\s*["'](https?:\/\/hexworth\.com[^"']*)["']/g;
            const ptRe  = /PageTransition\s*\.\s*navigateTo\s*\(\s*["'](https?:\/\/hexworth\.com[^"']*)["']/g;

            const reList = [
                { re: locRe, ...jsPatterns[0] },
                { re: ptRe,  ...jsPatterns[1] }
            ];

            for (const { re, kindLabel, fix } of reList) {
                let m;
                while ((m = re.exec(script)) !== null) {
                    // Locate in original content — first occurrence (script blocks
                    // may repeat; exact JS position requires extractor metadata
                    // _extractInlineScripts doesn't surface).
                    const lineIdx = content.indexOf(m[0]);
                    issues.push({
                        code: 'HEUR-030f',
                        severity: 'high',
                        category: 'heuristic',
                        message: `${kindLabel} hard-codes absolute hexworth.com URL '${m[1]}' — bypasses TenantRouter, leaks tenant context`,
                        file: file.path,
                        line: this.getLineNumber(content, lineIdx >= 0 ? lineIdx : 0),
                        fix: fix
                    });
                }
            }
        }

        return issues;
    }

    /**
     * HEUR-037: <a target="_blank"> missing rel="noopener" (or noreferrer).
     *
     * Tabnabbing risk: without rel="noopener", the new tab can access
     * window.opener and redirect the parent. Modern browsers (Chrome 88+,
     * Firefox 79+, Safari 12.1+) default to implicit noopener for
     * target="_blank", but explicit attribute is HTML spec best practice
     * and covers legacy/embedded contexts.
     *
     * Per HTML spec, rel="noreferrer" implies noopener — accepted as
     * sufficient by detection.
     *
     * Severity: LOW. Per TRIAGE_SEVERITY_GATE=['critical','high'] in
     * nexus/publish.js, LOW findings do NOT publish to the Nexus triage
     * queue — this rule guards against silent regressions in future
     * scans without blocking deploys. Findings appear in EduScan output
     * + TREASURE_MAP only.
     *
     * Edge case (0 current occurrences): a `>` literal inside an attribute
     * value would truncate the [^>] tag match. Not handled — accepting
     * theoretical false-negative for rule simplicity.
     */
    checkBlankTargetMissingNoopener(file) {
        const issues = [];
        const content = file.content;
        if (!content) return issues;
        if (!file.path.endsWith('.html')) return issues;

        const tagRe = /<a\s[^>]*target\s*=\s*["']_blank["'][^>]*>/gi;
        let m;
        while ((m = tagRe.exec(content)) !== null) {
            if (/\brel\s*=\s*["'][^"']*\b(noopener|noreferrer)\b/i.test(m[0])) continue;
            issues.push({
                code: 'HEUR-037',
                severity: 'low',
                category: 'heuristic',
                message: '<a target="_blank"> missing rel="noopener" (or noreferrer) — tabnabbing risk via window.opener (modern browsers mitigate; explicit attribute is HTML spec best practice)',
                file: file.path,
                line: this.getLineNumber(content, m.index),
                fix: 'Add rel="noopener noreferrer" to the anchor tag.'
            });
        }

        return issues;
    }

    /**
     * QUIZ-002b: inline-graded quiz with ans:N pattern (QC-57 Pattern A).
     * Catches both sub-variants:
     *   A1 quoted form:    "ans": N  (e.g., divergent/ethics-it, divergent/cybersecurity-policy)
     *   A2 unquoted form:  ans:  N   (e.g., code/python-for-it, shield/infosec — line-anchored)
     *
     * QUIZ-002 only checks files that contain "QuizEngine". The QC-57
     * inventory revealed quizzes that use a wholly inline custom grading
     * pattern (no QuizEngine class, just selectAnswer(idx) { if (idx ===
     * q.ans) ... }). These are invisible to QUIZ-002 because of its
     * L1296 `if (!content.includes('QuizEngine')) return issues;` guard.
     *
     * Detection: file ends with .quiz.html OR .exam.html, has 3+
     * "ans": N or 'ans': N matches, does NOT contain QuizEngine (else
     * QUIZ-002 handles it), and does NOT have serverGrading or gradeQuiz
     * invocation.
     *
     * Severity: HIGH (or MEDIUM if practice-mode marker present — same
     * demotion rule as QUIZ-002, per feedback_severity_demotion_pattern.md).
     *
     * Sprint: QC-57. Inventory: _docs/operations/qc-57-client-grading-inventory.md.
     */
    checkPatternAClientGrading(file) {
        const issues = [];
        const content = file.content;
        if (!content) return issues;

        // Scope: client-graded answer-bearing artifacts
        const path = file.path || '';
        if (!path.endsWith('.quiz.html') && !path.endsWith('.exam.html')) return issues;

        // QUIZ-002 owns the QuizEngine path — avoid double-flagging
        if (content.includes('QuizEngine')) return issues;

        // Server-graded paths
        if (/serverGrading\s*:\s*true/.test(content)) return issues;
        if (/\bgradeQuiz\s*\(/.test(content)) return issues;

        // Pattern A signature — at least 3 "ans": N occurrences to filter noise
        // Union of A1 (quoted: "ans":N or 'ans':N) and A2 (unquoted: ans:N
        // as a line-start object property). Line-anchor `^\s*` on the
        // unquoted variant narrows to object-literal property context —
        // avoids matching `var ans = ...`, `function ans(...)`, etc.
        const ansRe = /^\s*(?:["']ans["']|ans)\s*:\s*\d+/gm;
        const ansMatches = content.match(ansRe) || [];
        if (ansMatches.length < 3) return issues;

        // Practice-mode severity demotion (same logic as QUIZ-002)
        const isPracticeMode =
            /<html[^>]*\bdata-practice-mode\s*=\s*["']true["']/.test(content) ||
            /<meta\s+name=["']hex-practice-mode["']\s+content=["']true["']/.test(content);

        const firstMatch = content.search(ansRe);
        issues.push({
            code: 'QUIZ-002b',
            severity: isPracticeMode ? 'medium' : 'high',
            category: 'quiz',
            message: isPracticeMode
                ? 'Practice quiz uses inline custom grading with ans:N pattern (' + ansMatches.length + ' answers visible — quoted "ans":N and/or unquoted ans:N). Practice-mode demotes severity but answers still visible via View Source.'
                : 'Quiz uses inline custom grading with ans:N pattern — answers visible via View Source (' + ansMatches.length + ' answers — quoted "ans":N and/or unquoted ans:N). QC-57 sprint Pattern A.',
            file: file.path,
            line: this.getLineNumber(content, firstMatch >= 0 ? firstMatch : 0),
            fix: 'Refactor to QuizEngine + serverGrading: true. Seed answers to Firestore quiz_keys/. See _docs/operations/qc-57-client-grading-inventory.md for the QC-57 sprint plan.'
        });

        return issues;
    }

    /**
     * QUIZ-004: Quiz regression detector
     *
     * Compares each quiz file against a baseline snapshot of known
     * server-graded quizzes (quiz-baseline.json). If a file was
     * previously verified as having serverGrading: true but no longer
     * does, it means an edit reverted the server grading fix.
     *
     * This catches the exact regression pattern where:
     * 1. Quiz is migrated to server-side grading (QC-21)
     * 2. A later edit (path fix, CSS, accessibility) overwrites the file
     * 3. serverGrading: true disappears
     * 4. Quiz silently grades everyone 0%
     *
     * The baseline is regenerated after each successful QC-21 migration
     * or quiz fix session. It lives at _tools/eduscan/quiz-baseline.json.
     */
    checkQuizRegression(file) {
        const issues = [];

        // Only check files that are in the baseline
        if (!this._quizBaseline) {
            try {
                const baselinePath = require('path').resolve(__dirname, '../../quiz-baseline.json');
                this._quizBaseline = JSON.parse(require('fs').readFileSync(baselinePath, 'utf8'));
            } catch (e) {
                this._quizBaseline = { quizzes: {} };
            }
        }

        const baseline = this._quizBaseline.quizzes || {};
        if (!baseline[file.path]) return issues; // Not in baseline, skip

        // This file WAS server-graded. Is it still?
        const hasServerGrading = /serverGrading\s*:\s*true/.test(file.content);

        if (!hasServerGrading) {
            issues.push({
                code: 'QUIZ-004',
                severity: 'critical',
                category: 'quiz',
                message: 'REGRESSION: serverGrading was removed from this quiz. It was verified server-graded on ' +
                         (baseline[file.path].snapshotDate || 'unknown date') +
                         '. An edit reverted the fix — quiz now grades 0%.',
                file: file.path,
                fix: 'Restore serverGrading: true and houseId to the QuizEngine config. Check git log for what changed.'
            });
        }

        // Also check if houseId was removed (needed for server grading to work)
        if (hasServerGrading && baseline[file.path].hasHouseId && !/houseId\s*:/.test(file.content)) {
            issues.push({
                code: 'QUIZ-004',
                severity: 'critical',
                category: 'quiz',
                message: 'REGRESSION: houseId was removed from this server-graded quiz. Server grading will fail without it.',
                file: file.path,
                fix: 'Restore houseId to the QuizEngine config.'
            });
        }

        return issues;
    }

    /**
     * QUIZ-005: Quiz answer key alignment check
     *
     * For quizzes with serverGrading: true, verifies that the answer key
     * in quiz_keys.json is consistent with the quiz file:
     *   1. Answer key exists for the moduleId
     *   2. Number of answers matches number of questions
     *   3. Each answer index is within range of that question's options
     *
     * Catches: wrong answer count after questions are added/removed,
     * answer indices pointing to nonexistent options, missing keys.
     */
    checkQuizKeyAlignment(file) {
        const issues = [];
        const content = file.content;

        // Only check server-graded quizzes
        if (!content.includes('QuizEngine')) return issues;
        if (!/serverGrading\s*:\s*true/.test(content)) return issues;
        if (file.path.endsWith('index.html')) return issues;

        // Skip templates — they carry placeholder moduleIds intentionally
        if (file.path.startsWith('templates/') || file.path.includes('/templates/')) return issues;

        // Extract moduleId from the quiz config
        const moduleIdMatch = content.match(/moduleId\s*:\s*['"]([^'"]+)['"]/);
        if (!moduleIdMatch) return issues;
        const moduleId = moduleIdMatch[1];

        // Skip placeholder/example moduleIds — these are scaffolding, not deployable quizzes
        const PLACEHOLDER_IDS = new Set(['house-quiz-id', 'YOUR-QUIZ-ID', 'example-quiz', 'TODO']);
        if (PLACEHOLDER_IDS.has(moduleId)) return issues;

        // Load quiz keys (cached after first load)
        if (!this._quizKeys) {
            try {
                const keysPath = require('path').resolve(__dirname, '../../../../functions/quiz_keys.json');
                this._quizKeys = JSON.parse(require('fs').readFileSync(keysPath, 'utf8'));
            } catch (e) {
                this._quizKeys = {};
            }
        }

        const key = this._quizKeys[moduleId];

        // Check 1: Key exists
        if (!key || !Array.isArray(key.answers)) {
            issues.push({
                code: 'QUIZ-005',
                severity: 'high',
                category: 'quiz',
                message: 'No answer key found in quiz_keys.json for moduleId "' + moduleId + '" — server grading will fail',
                file: file.path,
                fix: 'Add answer key to functions/quiz_keys.json for "' + moduleId + '"'
            });
            return issues;
        }

        // Count questions in the quiz file
        const questionMatches = content.match(/question\s*:\s*['"]/g);
        const questionCount = questionMatches ? questionMatches.length : 0;

        if (questionCount < 2) return issues; // Not enough to validate

        // Check 2: Answer count matches question count
        if (key.answers.length !== questionCount) {
            issues.push({
                code: 'QUIZ-005',
                severity: 'critical',
                category: 'quiz',
                message: 'Answer key has ' + key.answers.length + ' answers but quiz has ' + questionCount + ' questions for moduleId "' + moduleId + '" — grading will be wrong',
                file: file.path,
                fix: 'Update quiz_keys.json to have exactly ' + questionCount + ' answers for "' + moduleId + '"'
            });
        }

        // Check 3: Each answer index is within range
        // Count options per question by finding 'options: [' blocks and counting
        // the quoted entries. Uses a balanced bracket approach to handle ] inside
        // option text (e.g., bash code with [ -f file.txt ]).
        const optionBlocks = content.split(/\{\s*question\s*:/);
        optionBlocks.shift(); // remove preamble

        optionBlocks.forEach((block, qIdx) => {
            if (qIdx >= key.answers.length) return;

            const optStart = block.indexOf('options');
            if (optStart === -1) return;

            // Find balanced closing ] for the options array
            const arrStart = block.indexOf('[', optStart);
            if (arrStart === -1) return;

            let depth = 1;
            let arrEnd = -1;
            for (let c = arrStart + 1; c < block.length && depth > 0; c++) {
                if (block[c] === '[') depth++;
                else if (block[c] === ']') { depth--; if (depth === 0) arrEnd = c; }
            }
            if (arrEnd === -1) return;

            const optionsContent = block.substring(arrStart + 1, arrEnd);

            // Count top-level string entries in the options array.
            // Handles both multi-line (one option per line) and inline
            // (all options on one line) formats by counting top-level
            // quoted strings separated by commas.
            let optCount = 0;
            let inStr = false;
            let strChar = '';
            for (let s = 0; s < optionsContent.length; s++) {
                const ch = optionsContent[s];
                if (inStr) {
                    // Skip escaped characters inside strings
                    if (ch === '\\') { s++; continue; }
                    if (ch === strChar) inStr = false;
                } else {
                    if (ch === '"' || ch === "'") {
                        inStr = true;
                        strChar = ch;
                        optCount++;
                    }
                }
            }

            if (optCount > 0 && key.answers[qIdx] >= optCount) {
                issues.push({
                    code: 'QUIZ-005',
                    severity: 'critical',
                    category: 'quiz',
                    message: 'Q' + qIdx + ' answer index ' + key.answers[qIdx] + ' is out of range (only ' + optCount + ' options) for moduleId "' + moduleId + '"',
                    file: file.path,
                    fix: 'Fix answer at index ' + qIdx + ' in quiz_keys.json for "' + moduleId + '" — must be 0 to ' + (optCount - 1)
                });
            }
        });

        return issues;
    }

    /**
     * QUIZ-006: Custom inline quiz calls gradeQuiz but has no key
     *
     * Catches custom quiz implementations (Engine 2) that call
     * FirebaseAuth.callFunction('gradeQuiz', { quizId: X }) but
     * where X has no matching entry in quiz_keys.json. At runtime,
     * the Cloud Function returns "Quiz key not found" and the
     * student gets 0% despite answering correctly.
     *
     * Skips files that use the standard QuizEngine (those are
     * covered by QUIZ-005).
     */
    checkCustomQuizMissingKey(file) {
        const issues = [];
        const content = file.content;

        // Only check custom quiz files that call gradeQuiz but do NOT use QuizEngine
        if (content.includes('QuizEngine')) return issues;
        if (!content.includes('gradeQuiz')) return issues;

        // Load quiz keys (cached after first load)
        if (!this._quizKeys) {
            try {
                const keysPath = require('path').resolve(__dirname, '../../../../functions/quiz_keys.json');
                this._quizKeys = JSON.parse(require('fs').readFileSync(keysPath, 'utf8'));
            } catch (e) {
                this._quizKeys = {};
            }
        }

        // Extract the quizId from the gradeQuiz call
        // Pattern 1: callFunction('gradeQuiz', { quizId: 'eth-01-quiz', ... })
        // Pattern 2: callFunction('gradeQuiz', { quizId: QUIZ_ID, ... })
        let quizId = null;

        // Try string literal first
        const literalMatch = content.match(/gradeQuiz['"],\s*\{\s*quizId\s*:\s*['"]([^'"]+)['"]/);
        if (literalMatch) {
            quizId = literalMatch[1];
        } else {
            // Try variable reference: quizId: QUIZ_ID → resolve from var/const QUIZ_ID = '...'
            const varRefMatch = content.match(/gradeQuiz['"],\s*\{\s*quizId\s*:\s*([A-Z_]+)/);
            if (varRefMatch) {
                const varName = varRefMatch[1];
                const varDefMatch = content.match(new RegExp(varName + "\\s*=\\s*['\"]([^'\"]+)['\"]"));
                if (varDefMatch) quizId = varDefMatch[1];
            }
        }

        if (!quizId) return issues; // Could not determine quizId — skip

        // Check if key exists
        if (!this._quizKeys[quizId] || !Array.isArray(this._quizKeys[quizId].answers)) {
            issues.push({
                code: 'QUIZ-006',
                severity: 'high',
                category: 'quiz',
                message: 'Custom quiz calls gradeQuiz with quizId "' + quizId + '" but no key exists in quiz_keys.json — server grading returns "Quiz key not found"',
                file: file.path,
                line: this.getLineNumber(content, content.indexOf('gradeQuiz')),
                fix: 'Add answer key to functions/quiz_keys.json for "' + quizId + '" and push to Firestore with push-quiz-keys.js'
            });
        }

        return issues;
    }

    /**
     * QUIZ-007: Quiz key drift detector
     *
     * Checks for staleness in quiz_keys.json by comparing the
     * questionCount metadata field against the actual number of
     * questions detected in the HTML file. If they disagree,
     * the keys are stale — questions were added or removed
     * without updating the answer key.
     *
     * Covers BOTH standard QuizEngine and custom inline quizzes
     * that have entries in quiz_keys.json.
     */
    checkQuizKeyDrift(file) {
        const issues = [];
        const content = file.content;

        // Must be a quiz file (skip non-quizzes)
        if (file.path.endsWith('index.html')) return issues;

        // Load quiz keys (cached)
        if (!this._quizKeys) {
            try {
                const keysPath = require('path').resolve(__dirname, '../../../../functions/quiz_keys.json');
                this._quizKeys = JSON.parse(require('fs').readFileSync(keysPath, 'utf8'));
            } catch (e) {
                this._quizKeys = {};
            }
        }

        // Extract moduleId or quizId — try multiple patterns
        let keyId = null;

        // Pattern 1: QuizEngine moduleId
        const qeMatch = content.match(/moduleId\s*:\s*['"]([^'"]+)['"]/);
        if (qeMatch) keyId = qeMatch[1];

        // Pattern 2: QUIZ_ID variable
        if (!keyId) {
            const qidMatch = content.match(/QUIZ_ID\s*=\s*['"]([^'"]+)['"]/);
            if (qidMatch) keyId = qidMatch[1];
        }

        if (!keyId) return issues;

        const key = this._quizKeys[keyId];
        if (!key || !key.questionCount) return issues; // No key or no questionCount metadata — skip

        // Count actual questions in the HTML
        // Standard pattern: question: '...' or question: "..."
        const standardCount = (content.match(/question\s*:\s*['"]/g) || []).length;
        // Custom pattern: <p class="ne-question-text"> or <span class="ne-question-num">
        const customCount = (content.match(/ne-question-text|ne-question-num/g) || []).length / 2; // each question has both elements
        // Radio group pattern: name="q0", name="q1", etc.
        const radioGroups = new Set((content.match(/name=["']q(\d+)["']/g) || []).map(m => m.match(/q(\d+)/)[1]));

        // Use the best count we can find
        let actualCount = standardCount;
        if (actualCount < 2 && radioGroups.size >= 2) actualCount = radioGroups.size;
        if (actualCount < 2 && customCount >= 2) actualCount = Math.round(customCount);

        if (actualCount < 2) return issues; // Can't determine question count — skip

        // Compare
        if (key.questionCount !== actualCount) {
            issues.push({
                code: 'QUIZ-007',
                severity: 'high',
                category: 'quiz',
                message: 'quiz_keys.json says "' + keyId + '" has ' + key.questionCount + ' questions but HTML has ' + actualCount + ' — keys are stale (questions added/removed without updating key)',
                file: file.path,
                fix: 'Update quiz_keys.json: set questionCount to ' + actualCount + ' for "' + keyId + '" and verify answers array length matches. Then push to Firestore.'
            });
        }

        return issues;
    }

    /**
     * QUIZ-008: Answer key distribution check
     *
     * Detects when answer keys are skewed — one index appears
     * disproportionately, allowing students to exploit the pattern
     * without reading the questions. These quizzes do NOT shuffle
     * options at render time, so the key index IS the visual position.
     *
     * Thresholds:
     *   5-question quiz:  no index may appear more than 2 times
     *   10+ question quiz: no index may exceed 35% of total
     */
    checkAnswerDistribution(file) {
        const issues = [];

        if (file.path.endsWith('index.html')) return issues;

        // Load quiz keys (cached)
        if (!this._quizKeys) {
            try {
                const keysPath = require('path').resolve(__dirname, '../../../../functions/quiz_keys.json');
                this._quizKeys = JSON.parse(require('fs').readFileSync(keysPath, 'utf8'));
            } catch (e) {
                this._quizKeys = {};
            }
        }

        // Find the key ID for this file
        const content = file.content;
        let keyId = null;

        const qeMatch = content.match(/moduleId\s*:\s*['"]([^'"]+)['"]/);
        if (qeMatch) keyId = qeMatch[1];

        if (!keyId) {
            const qidMatch = content.match(/QUIZ_ID\s*=\s*['"]([^'"]+)['"]/);
            if (qidMatch) keyId = qidMatch[1];
        }

        if (!keyId) return issues;

        const key = this._quizKeys[keyId];
        if (!key || !Array.isArray(key.answers)) return issues;

        // Only check integer answers (MC) — skip object-wrapped MS/ORDER
        const mcAnswers = key.answers.filter(a => typeof a === 'number');
        if (mcAnswers.length < 4) return issues; // Too few to evaluate

        // Count distribution
        const dist = {};
        mcAnswers.forEach(a => { dist[a] = (dist[a] || 0) + 1; });

        const total = mcAnswers.length;
        const maxCount = Math.max(...Object.values(dist));
        const maxIndex = Object.entries(dist).sort((a, b) => b[1] - a[1])[0][0];
        const maxPct = Math.round((maxCount / total) * 100);

        let skewed = false;

        if (total <= 7) {
            // Short quiz: no index more than 2 times
            skewed = maxCount > 2;
        } else {
            // Longer quiz: no index more than 35%
            skewed = maxPct > 35;
        }

        if (skewed) {
            const distStr = Object.entries(dist)
                .sort((a, b) => a[0] - b[0])
                .map(([idx, count]) => `[${idx}]=${count}`)
                .join(', ');

            issues.push({
                code: 'QUIZ-008',
                severity: 'medium',
                category: 'quiz',
                message: `Answer key for "${keyId}" has skewed distribution: index ${maxIndex} appears ${maxCount}/${total} times (${maxPct}%). Distribution: ${distStr}. Students can pattern-exploit.`,
                file: file.path,
                fix: `Reorder options in quiz HTML so correct answers are evenly distributed across indices 0-3, then update quiz_keys.json to match`
            });
        }

        return issues;
    }

    /**
     * QUIZ-011: Answer key matches CLASSIC-CYCLING placeholder pattern
     *
     * Detects answer arrays that exactly match the i%4 pattern
     * ([0,1,2,3,0,1,2,3,...]). These bypass QUIZ-008 (skew detection)
     * because their distribution is perfectly even (~25% per index).
     *
     * Complements QUIZ-008 — fires ONLY on CLASSIC-CYCLING. Other
     * placeholder shapes (ALL-ZEROS, ALL-SAME, PERIOD-CYCLING with
     * dominant value) trigger QUIZ-008's >35% skew threshold and are
     * not duplicated here.
     *
     * Scope is intentionally narrow: zero double-fire with QUIZ-008.
     * Triage gate (high) escalates these into the sprint queue, while
     * QUIZ-008's medium fires stay in the hygiene queue.
     *
     * Skipped if PlaceholderDetector module is unavailable.
     */
    checkAnswerPlaceholder(file) {
        const issues = [];
        if (!PlaceholderDetector) return issues;
        if (file.path.endsWith('index.html')) return issues;

        // Reuse the cache populated by checkAnswerDistribution
        if (!this._quizKeys) {
            try {
                const keysPath = require('path').resolve(__dirname, '../../../../functions/quiz_keys.json');
                this._quizKeys = JSON.parse(require('fs').readFileSync(keysPath, 'utf8'));
            } catch (e) {
                this._quizKeys = {};
            }
        }

        const content = file.content;
        let keyId = null;
        const qeMatch = content.match(/moduleId\s*:\s*['"]([^'"]+)['"]/);
        if (qeMatch) keyId = qeMatch[1];
        if (!keyId) {
            const qidMatch = content.match(/QUIZ_ID\s*=\s*['"]([^'"]+)['"]/);
            if (qidMatch) keyId = qidMatch[1];
        }
        if (!keyId) return issues;

        const key = this._quizKeys[keyId];
        if (!key || !Array.isArray(key.answers)) return issues;

        const mcAnswers = key.answers.filter(a => typeof a === 'number');
        if (mcAnswers.length < 4) return issues;

        const cls = PlaceholderDetector.classify(mcAnswers);
        if (cls !== 'CLASSIC-CYCLING') return issues;

        // Karl-PASS allowlist check: if this quiz ID has been verbatim-verified
        // against the Confluence Solutions Manual AND the static answer array
        // has not drifted since the audit, suppress the finding. Drift fires
        // QUIZ-011B (stale-allowlist — re-audit needed).
        const allowEntry = this.quiz011Allowlist.get(keyId);
        if (allowEntry && PlaceholderDetector.getAnswerHash) {
            const currentHash = PlaceholderDetector.getAnswerHash(key.answers);
            if (currentHash === allowEntry.answerHash) {
                return issues; // suppressed — Karl Mode-2 PASS still valid
            }
            issues.push({
                code: 'QUIZ-011B',
                severity: 'high',
                category: 'quiz',
                message: `Answer key for "${keyId}" was Karl-PASS allowlisted at ${allowEntry.verifiedAt} but the static array has changed since (hash drift). Re-audit required.`,
                file: file.path,
                line: 1,
                fix: `Re-run Karl Mode-2 on "${keyId}" against ${allowEntry.karlAuditPath} (Confluence ${allowEntry.confluencePage}). On PASS, update _tools/eduscan/config/quiz-011-allowlist.json with the new answerHash.`,
            });
            return issues;
        }

        issues.push({
            code: 'QUIZ-011',
            severity: 'high',
            category: 'quiz',
            message: `Answer key for "${keyId}" matches CLASSIC-CYCLING placeholder pattern: ${JSON.stringify(mcAnswers).slice(0, 80)}. Students get incorrect grading.`,
            file: file.path,
            line: 1,
            fix: `Replace placeholder answers in functions/quiz_keys.json with real answers from the quiz HTML or solutions doc. Karl Mode-2 verify before reseeding to Firestore.`,
        });

        return issues;
    }

    /**
     * QUIZ-009: Broken quiz grading — q.correct referenced but field missing
     *
     * Detects custom inline quizzes that reference q.correct (or question.correct)
     * in JavaScript grading logic but where the question data objects do not
     * contain a `correct:` field. This causes every answer to be graded wrong
     * because `undefined !== selectedIndex` is always true.
     *
     * Does NOT flag q.correctHash (hash-based verification in dark-arts labs).
     */
    checkBrokenQuizCorrect(file) {
        const issues = [];
        const content = file.content;

        // Only check files with inline quiz grading
        const usesQCorrect = /===?\s*q\.correct\b/.test(content) && !/q\.correctHash/.test(content);
        if (!usesQCorrect) return issues;

        // Check if questions data has correct: N field
        const hasCorrectField = /correct:\s*\d+/.test(content);
        if (!hasCorrectField) {
            issues.push({
                code: 'QUIZ-009',
                severity: 'high',
                category: 'quiz',
                message: 'Quiz grading references q.correct but question objects have no correct: field — every answer is graded wrong',
                file: file.path,
                fix: 'Add correct: N (0-indexed) to each question object, or migrate to QuizEngine with serverGrading'
            });
        }

        return issues;
    }

    /**
     * QUIZ-010: Quiz HTML has unparseable JavaScript in the questions block
     *
     * Detects QuizEngine-style quiz HTMLs whose `questions: [ ... ]` array
     * cannot be parsed as JavaScript by `new Function`. Almost always caused
     * by over-escaped apostrophes (`\\'` instead of `\'`) inside single-quoted
     * strings, which silently turns the rest of the questions block into
     * dangling identifiers/tokens.
     *
     * Failure mode: the quiz fails to load entirely — students see a blank
     * or broken page with no obvious error. This is a UNLOADABLE quiz =
     * total feature failure, hence severity HIGH.
     *
     * Examples caught: 6 Network+ quizzes 2026-05-08, 3 pv-e quizzes earlier.
     */
    checkQuizParseable(file) {
        const issues = [];
        if (!file.path.endsWith('.quiz.html')) return issues;
        const content = file.content;
        const qIdx = content.indexOf('questions:');
        if (qIdx < 0) return issues;
        const startBracket = content.indexOf('[', qIdx);
        if (startBracket < 0) return issues;
        let depth = 0, end = -1;
        for (let i = startBracket; i < content.length; i++) {
            if (content[i] === '[') depth++;
            else if (content[i] === ']') { depth--; if (depth === 0) { end = i; break; } }
        }
        if (end < 0) return issues;
        const block = content.substring(startBracket, end + 1);
        try {
            new Function(`return ${block};`);
        } catch (e) {
            issues.push({
                code: 'QUIZ-010',
                severity: 'high',
                category: 'quiz',
                message: `Quiz JS unparseable — questions block fails to load (${e.message.slice(0, 80)}). Quiz is UNLOADABLE for students.`,
                file: file.path,
                fix: 'Inspect the questions array for over-escaped apostrophes (`\\\\\'` → `\\\'`) or other JS syntax errors. Verify with: `new Function(questionsBlock)` in node REPL.'
            });
        }
        return issues;
    }

    /**
     * HEUR-017: Lazy-loaded platform components
     *
     * Detects createElement('script') patterns that dynamically load
     * platform components (ModuleProgress, ProgressSystem, GameTracker,
     * AchievementSystem, QuizEngine, FirebaseAuth, FluxCapacitor,
     * AccessGuard). These should be static <script src> tags because:
     *   - Static tags are detectable by DEP-004 dependency checks
     *   - Dynamic loads introduce race conditions and timing bugs
     *   - Auto-scroll triggers can fire before the student finishes reading
     *
     * Excludes: components that lazy-load OTHER components internally
     * (e.g., FluxCapacitor.js itself may createElement for sub-components).
     * Only flags HTML content files, not .js component files.
     */
    checkLazyLoadedComponents(file) {
        const issues = [];
        const content = file.content;

        // Only check HTML files (not .js component internals)
        if (!file.path.endsWith('.html')) return issues;

        // Platform components that should always be statically loaded
        const platformComponents = [
            'ModuleProgress',
            'ProgressSystem',
            'ProgressManager',
            'GameTracker',
            'AchievementSystem',
            'AchievementManager',
            'QuizEngine',
            'CompletionStamp'
        ];

        // Extract inline script blocks
        const scripts = this._extractInlineScripts(content);

        for (const block of scripts) {
            // Must contain createElement('script') pattern
            if (!block.includes('createElement')) continue;

            for (const comp of platformComponents) {
                // Check if a .src assignment references this component
                const srcPattern = new RegExp('\\.src\\s*=\\s*[\'"][^\'"]*' + comp + '\\.js[\'"]');
                if (srcPattern.test(block)) {
                    // Find the line number in the original content
                    const idx = content.indexOf(block.substring(0, 40));
                    const line = idx >= 0 ? content.substring(0, idx).split('\n').length : 0;

                    issues.push({
                        code: 'HEUR-017',
                        severity: 'high',
                        category: 'heuristic',
                        message: comp + '.js is lazy-loaded via createElement — use a static <script src> tag instead',
                        file: file.path,
                        line,
                        fix: 'Replace createElement/src pattern with <script src=".../' + comp + '.js"></script> and trigger completion via a deliberate user action (button click, not auto-scroll)'
                    });
                }
            }
        }

        return issues;
    }

    /**
     * HEUR-018: Scroll-triggered auto-completion
     *
     * Detects files that call a completion function (ModuleProgress.complete,
     * ProgressManager.complete, ProgressSystem.complete) inside a scroll
     * event listener. This pattern fires completion automatically when the
     * user scrolls past a threshold (often 80%), without requiring a
     * deliberate action like clicking a button.
     *
     * Problems with auto-scroll completion:
     *   - Student doesn't know what triggered it ("what did I do?")
     *   - Fires before the student finishes reading (80% = 20% unread)
     *   - Fast-scrolling to check page length triggers it
     *   - Irreversible once fired
     *
     * Fix: replace with a "Mark Complete" button at the bottom of the page.
     */
    checkScrollTriggeredCompletion(file) {
        const issues = [];
        const content = file.content;

        // Only check HTML files
        if (!file.path.endsWith('.html')) return issues;

        // HEUR-018 per-rule allowlist (loaded from config/heur018-allowlist.json
        // at construction time). Skip files whose scroll+complete colocation
        // is coincidental rather than a real scroll-completion gate.
        const normalized = file.path.replace(/\\/g, '/');
        for (const allowed of this.heur018Allowlist) {
            if (normalized.endsWith(allowed) || normalized.includes(allowed)) {
                return issues;
            }
        }

        // Must have a scroll listener
        if (!content.includes("addEventListener('scroll'") &&
            !content.includes('addEventListener("scroll"')) return issues;

        // Must call a completion function
        const completionPatterns = [
            'ModuleProgress.complete(',
            'ProgressManager.complete(',
            'ProgressSystem.complete(',
            'ProgressManager.completeModule('
        ];

        const hasCompletion = completionPatterns.some(p => content.includes(p));
        if (!hasCompletion) return issues;

        // Confirm the completion call is inside an inline script block
        // that also contains the scroll listener (same block = linked)
        const scripts = this._extractInlineScripts(content);

        for (const block of scripts) {
            const hasScroll = block.includes("addEventListener('scroll'") ||
                              block.includes('addEventListener("scroll"');
            const hasComplete = completionPatterns.some(p => block.includes(p));

            if (hasScroll && hasComplete) {
                // Distinguish auto-scroll completion from scroll-as-progress-bar.
                // The key signal is a SCROLL THRESHOLD — either a literal (>= 0.8)
                // or a variable (>= scrollThreshold). If the block has a scroll
                // listener + threshold + .complete(), it's auto-scroll completion.
                // If scroll just updates a progress bar with no threshold gating
                // the .complete() call, it's fine (e.g., SIEM presentations).
                // Detect scroll-gated completion by matching threshold patterns:
                //   >= 0.8, >= 0.80        (ratio form)
                //   >= 80, >= 80)          (percentage form)
                //   >= scrollThreshold     (variable — ratio)
                //   >= scrollTarget        (variable — percentage)
                //   >= threshold           (generic variable)
                const hasRatioThreshold = />=\s*0\.\d+/.test(block);
                const hasPercentThreshold = />=\s*(80|85|90|75|70)\b/.test(block);
                const hasVariableThreshold = />=\s*(scrollThreshold|scrollTarget|threshold)\b/.test(block);
                const hasScrollGating = hasRatioThreshold || hasPercentThreshold || hasVariableThreshold;
                if (!hasScrollGating) continue; // scroll is just a progress bar, not a completion gate

                // Extract threshold value for the message
                const ratioMatch = block.match(/>=\s*(0\.\d+)/);
                const pctMatch = block.match(/>=\s*(80|85|90|75|70)\b/);
                const threshold = ratioMatch ? ratioMatch[1] :
                    (pctMatch ? '0.' + pctMatch[1] : // normalize 80 -> 0.80
                    (hasVariableThreshold ? 'variable' : 'unknown'));

                // Determine if the threshold is high enough to be effectively a
                // deliberate-completion act (>= 99% of page scrolled). High-threshold
                // matches stay flagged for visibility but get demoted from medium → info
                // since the student-facing bug (premature completion) is gone.
                // Low/unknown thresholds keep medium severity (the original bug).
                let parsedThresholdValue = null;
                if (ratioMatch) {
                    parsedThresholdValue = parseFloat(ratioMatch[1]);
                } else if (pctMatch) {
                    parsedThresholdValue = parseFloat(pctMatch[1]) / 100;
                } else if (hasVariableThreshold) {
                    // Try to look up the variable's value in the same block.
                    // Captures: var/let/const NAME = NUMBER. Conservative — only
                    // matches if assignment is in the SAME script block.
                    const varAssignMatch = block.match(
                        /\b(?:var|let|const)\s+(?:scrollThreshold|scrollTarget|threshold)\s*=\s*([0-9]+(?:\.[0-9]+)?)/
                    );
                    if (varAssignMatch) {
                        const v = parseFloat(varAssignMatch[1]);
                        // Normalize percent (e.g., 80) to ratio (0.8) for comparison
                        parsedThresholdValue = v >= 1 ? v / 100 : v;
                    }
                }
                const isHighThreshold = parsedThresholdValue !== null && parsedThresholdValue >= 0.99;
                const severity = isHighThreshold ? 'info' : 'medium';

                // Find which completion function
                const comp = completionPatterns.find(p => block.includes(p)) || 'unknown';
                const compName = comp.replace('(', '');

                // Find line number
                const idx = content.indexOf("addEventListener('scroll'") !== -1
                    ? content.indexOf("addEventListener('scroll'")
                    : content.indexOf('addEventListener("scroll"');
                const line = idx >= 0 ? content.substring(0, idx).split('\n').length : 0;

                const baseMessage = compName + ' fires on scroll' +
                    (threshold !== 'unknown' ? ' at ' + (parseFloat(threshold) * 100) + '% threshold' : '');
                const message = isHighThreshold
                    ? baseMessage + ' (high threshold — effectively scroll-to-bottom; student-facing bug already mitigated, kept for visibility)'
                    : baseMessage + ' — student has no deliberate completion action';

                issues.push({
                    code: 'HEUR-018',
                    severity,
                    category: 'heuristic',
                    message,
                    file: file.path,
                    line,
                    fix: isHighThreshold
                        ? 'High-threshold scroll completion (>= 99%) is acceptable interim. Long-term: replace with explicit Mark Complete button for full intentionality.'
                        : 'Replace scroll-based auto-completion with a "Mark Complete" button that the student clicks deliberately after reading all content'
                });

                break; // one finding per file is enough
            }
        }

        return issues;
    }

    /**
     * HEUR-019: Tenant Config Missing Required Fields
     *
     * Scans tenant dashboard files for required configuration fields.
     * Tenant dashboards must reference: slug, branding, licensing, and
     * adminUids. Missing any of these means the tenant page can't
     * properly initialize, display branded content, or enforce access.
     *
     * Severity: SLA (contractual — affects paying tenant customers)
     */
    checkTenantConfigFields(file) {
        const issues = [];
        const content = file.content;

        // Only check tenant dashboard HTML files
        if (!file.path.endsWith('.html')) return issues;
        if (!file.path.includes('tenant') && !file.path.includes('dashboard')) return issues;

        // Must look like a tenant config page (has tenantConfig or tenant-config references)
        if (!content.includes('tenantConfig') && !content.includes('tenant-config') &&
            !content.includes('TenantConfig') && !content.includes('tenant_config')) return issues;

        // Skip if config is fetched dynamically from Firestore/API (not hardcoded in HTML)
        if (content.includes('Fetch tenant config') || content.includes('sessionStorage') ||
            content.includes('fetchTenantConfig') || content.includes('/api/tenant')) {
            return issues;
        }

        const requiredFields = ['slug', 'branding', 'licensing', 'adminUids'];
        const missingFields = requiredFields.filter(field => !content.includes(field));

        if (missingFields.length > 0) {
            // Find the line where tenant config is first referenced
            const configIdx = content.indexOf('tenantConfig') !== -1
                ? content.indexOf('tenantConfig')
                : content.indexOf('tenant-config') !== -1
                    ? content.indexOf('tenant-config')
                    : content.indexOf('TenantConfig') !== -1
                        ? content.indexOf('TenantConfig')
                        : content.indexOf('tenant_config');
            const line = configIdx >= 0 ? content.substring(0, configIdx).split('\n').length : 0;

            issues.push({
                code: 'HEUR-019',
                severity: 'sla',
                category: 'tenant-validation',
                message: 'Tenant config missing required fields: ' + missingFields.join(', ') +
                         ' — tenant dashboard cannot initialize properly',
                file: file.path,
                line,
                fix: 'Add the missing tenant config fields (' + missingFields.join(', ') +
                     ') to the dashboard configuration object'
            });
        }

        return issues;
    }

    /**
     * HEUR-020: Tenant Dashboard Broken Asset References
     *
     * Checks tenant dashboard HTML files for broken image, icon, and CSS
     * references that use absolute paths (starting with /) but don't
     * resolve within the _app directory. Broken branding assets mean
     * the tenant sees a broken page with missing logos/styles.
     *
     * Severity: SLA (contractual — affects paying tenant customers)
     */
    checkTenantBrokenAssets(file) {
        const issues = [];
        const content = file.content;

        // Only check tenant dashboard HTML files
        if (!file.path.endsWith('.html')) return issues;
        if (!file.path.includes('tenant') && !file.path.includes('dashboard')) return issues;

        // Find absolute asset references (src="/..." or href="/...css|png|jpg|svg|ico|webp")
        const assetPattern = /(?:src|href)\s*=\s*["'](\/[^"']+\.(?:css|png|jpg|jpeg|svg|ico|webp|gif))["']/gi;
        let match;

        while ((match = assetPattern.exec(content)) !== null) {
            const assetPath = match[1];

            // Skip dynamic paths containing template-literal interpolation
            // (e.g., /assets/images/categories/${cat}.webp). The path is
            // resolved at runtime; static fs.existsSync would always fail
            // on the literal string with `${...}` in it.
            if (assetPath.includes('${') || /\{\{/.test(assetPath)) continue;

            // Resolve against _app directory
            const resolvedPath = path.join(this.rootPath, assetPath);

            if (!fs.existsSync(resolvedPath)) {
                const line = content.substring(0, match.index).split('\n').length;

                issues.push({
                    code: 'HEUR-020',
                    severity: 'medium',
                    category: 'tenant-validation',
                    message: 'Tenant dashboard references asset that does not exist: ' + assetPath,
                    file: file.path,
                    line,
                    fix: 'Verify the asset path resolves within _app/ or use a relative path. ' +
                         'Missing asset: ' + resolvedPath
                });
            }
        }

        return issues;
    }

    /**
     * HEUR-021: Missing House Content in Tenant License
     *
     * When a tenant config specifies licensed houses (e.g., licensedHouses
     * or houses array), verify that those houses have content available
     * in the content registry. A tenant paying for a house that has no
     * content is a contractual SLA violation.
     *
     * Severity: SLA (contractual — affects paying tenant customers)
     */
    checkTenantLicensedHouses(file) {
        const issues = [];
        const content = file.content;

        // Only check files that look like tenant configs
        if (!file.path.endsWith('.html') && !file.path.endsWith('.js')) return issues;
        if (!content.includes('licensedHouses') && !content.includes('licensed_houses') &&
            !content.includes('houses:') && !content.includes('houses =')) return issues;

        // Must be a tenant-related file
        if (!file.path.includes('tenant') && !file.path.includes('config')) return issues;

        // Extract house IDs from licensed houses arrays
        // Match patterns like: licensedHouses: ['web', 'shield', 'forge']
        // or: houses: ["web", "shield"]
        const houseArrayPattern = /(?:licensedHouses|licensed_houses|houses)\s*[:=]\s*\[([^\]]+)\]/g;
        let arrayMatch;

        while ((arrayMatch = houseArrayPattern.exec(content)) !== null) {
            const houseList = arrayMatch[1];
            // Extract quoted strings from the array
            const houseIdPattern = /['"]([a-z-]+)['"]/g;
            let houseMatch;

            while ((houseMatch = houseIdPattern.exec(houseList)) !== null) {
                const houseId = houseMatch[1];

                // Check if the house directory exists and has content
                const houseDir = path.join(this.rootPath, 'houses', houseId);

                if (!fs.existsSync(houseDir)) {
                    const line = content.substring(0, arrayMatch.index).split('\n').length;

                    issues.push({
                        code: 'HEUR-021',
                        severity: 'sla',
                        category: 'tenant-validation',
                        message: 'Tenant licenses house "' + houseId +
                                 '" but no house directory exists at houses/' + houseId +
                                 '/ — tenant is paying for empty content',
                        file: file.path,
                        line,
                        fix: 'Either add content to houses/' + houseId +
                             '/ or remove "' + houseId + '" from the tenant license configuration'
                    });
                } else {
                    // House dir exists — check if it has any HTML content files
                    try {
                        const entries = fs.readdirSync(houseDir, { recursive: true });
                        const htmlFiles = entries.filter(e =>
                            typeof e === 'string' && e.endsWith('.html') && e !== 'index.html'
                        );

                        if (htmlFiles.length === 0) {
                            const line = content.substring(0, arrayMatch.index).split('\n').length;

                            issues.push({
                                code: 'HEUR-021',
                                severity: 'sla',
                                category: 'tenant-validation',
                                message: 'Tenant licenses house "' + houseId +
                                         '" but house directory has no content files — ' +
                                         'tenant is paying for empty content',
                                file: file.path,
                                line,
                                fix: 'Add course content to houses/' + houseId +
                                     '/ or remove "' + houseId + '" from the tenant license'
                            });
                        }
                    } catch (e) {
                        // Can't read directory — skip
                    }
                }
            }
        }

        return issues;
    }

    /**
     * HEUR-022: Over-deep relative index.html link
     * Detects href values that climb more parent directories than the file's
     * depth inside its house folder. e.g., ../../../index.html from presentations/
     * which is only 1 level deep inside the house.
     */
    checkOverDeepIndexLinks(file) {
        const issues = [];
        const content = file.content;

        // Only check HTML files inside houses/
        if (!file.path.includes('houses/')) return issues;

        // Find all href attributes pointing to an index.html via ../
        const hrefPattern = /href="((?:\.\.\/)+[^"]*index\.html)"/gi;
        let match;

        // Determine depth: count path segments after the house ID folder
        // e.g., houses/web/presentations/file.html → depth 1 (presentations)
        const housesMatch = file.path.match(/houses\/[^/]+\/(.+)/);
        if (!housesMatch) return issues;
        const afterHouse = housesMatch[1];
        const fileDepth = afterHouse.split('/').length - 1; // subtract the filename

        while ((match = hrefPattern.exec(content)) !== null) {
            const href = match[1];
            const dotdotCount = (href.match(/\.\.\//g) || []).length;

            // If the link climbs more levels than the file is deep inside the house,
            // it escapes the house directory — almost certainly wrong
            if (dotdotCount > fileDepth + 1) {
                const line = this.getLineNumber(content, match.index);
                issues.push({
                    code: 'HEUR-022',
                    severity: 'warning',
                    category: 'navigation',
                    message: `Over-deep relative link: "${href}" climbs ${dotdotCount} levels but file is only ${fileDepth} level(s) deep in house — link escapes house directory`,
                    file: file.path,
                    line,
                    fix: `Reduce "../" depth to match file location (expected max ${fileDepth + 1} levels for house root)`
                });
            }
        }

        return issues;
    }

    /**
     * HEUR-023: Broken Course Home link
     * Checks that every href ending in index.html actually resolves to a file on disk.
     * Catches links to archived or deleted index pages.
     */
    checkBrokenCourseHomeLinks(file) {
        const issues = [];
        const content = file.content;

        // Only check HTML files inside houses/
        if (!file.path.includes('houses/')) return issues;

        const hrefPattern = /href="([^"]*index\.html)"/gi;
        let match;

        while ((match = hrefPattern.exec(content)) !== null) {
            const href = match[1];
            // Skip absolute URLs and protocol-relative
            if (href.startsWith('http') || href.startsWith('//')) continue;

            // Resolve the path: site-root-absolute (starts with /) uses rootPath as base,
            // relative paths resolve against the file's absolute directory
            let resolved;
            if (href.startsWith('/')) {
                // Site-root-relative — resolve against rootPath (Firebase serves _app/ as /)
                resolved = path.resolve(this.rootPath, href.substring(1));
            } else {
                const absoluteFilePath = path.resolve(this.rootPath, file.path);
                const fileDir = path.dirname(absoluteFilePath);
                resolved = path.resolve(fileDir, href);
            }

            if (!fs.existsSync(resolved)) {
                const line = this.getLineNumber(content, match.index);
                issues.push({
                    code: 'HEUR-023',
                    severity: 'error',
                    category: 'navigation',
                    message: `Broken Course Home link: "${href}" resolves to ${resolved} which does not exist (archived or deleted)`,
                    file: file.path,
                    line,
                    fix: `Update href to point to a valid index.html (e.g., ../index.html or ../network-plus/index.html)`
                });
            }
        }

        return issues;
    }

    /**
     * HEUR-024: Missing Course Home link
     * Pages that load ModuleProgress.js should have at least one <a> with an
     * href ending in index.html — otherwise the completion overlay's "Course Home"
     * button won't appear.
     */
    checkMissingCourseHomeLink(file) {
        const issues = [];
        const content = file.content;

        // Only check HTML files that load ModuleProgress
        if (!content.includes('ModuleProgress')) return issues;
        if (!file.path.endsWith('.html')) return issues;

        // FALSE-POSITIVE GUARDS:
        // 1. Files named index.html ARE the Course Home — they don't need
        //    a link to themselves.
        if (/(?:^|\/)index\.html$/.test(file.path)) return issues;
        // 2. Files at platform root (no parent directory) have no parent
        //    course to link back to. These are top-level utility pages
        //    (career-quiz, bot-knowledge, lobby, etc.), not course modules.
        //    Use file.path which the orchestrator passes as relative-to-root.
        const relativePath = file.path.replace(/^.*?\/_app\//, '').replace(/^_app\//, '');
        if (!relativePath.includes('/')) return issues;
        // 3. Operator missions render the home anchor at runtime via
        //    OperatorEngine (`backLink.href = '../index.html'` at
        //    `_app/operator/engine/OperatorEngine.js:1015`). The static HTML
        //    has no anchor, but the runtime DOM does — and detectNavLinks()
        //    in ModuleProgress runs after engine init, so the overlay's
        //    Course Home button DOES appear. 127 mission files load
        //    OperatorEngine.js; zero non-mission files do, so this is a
        //    clean signal.
        if (/<script\s+[^>]*src="[^"]*OperatorEngine\.js"/i.test(content)) return issues;

        // Check for any <a> tag with href containing index.html
        const hasIndexLink = /href="[^"]*index\.html"/i.test(content);

        if (!hasIndexLink) {
            // Find the line where ModuleProgress is loaded for context
            const mpMatch = content.match(/ModuleProgress/);
            const line = mpMatch ? this.getLineNumber(content, mpMatch.index) : 1;

            issues.push({
                code: 'HEUR-024',
                severity: 'warning',
                category: 'navigation',
                message: 'Page loads ModuleProgress.js but has no <a href="...index.html"> — completion overlay "Course Home" button will be missing',
                file: file.path,
                line,
                fix: 'Add a navigation link (visible or in breadcrumbs) with href pointing to the parent index.html'
            });
        }

        return issues;
    }

    /**
     * HEUR-025: Module completion ID mismatch
     * Detects when a hub/index page defines module IDs (in a JS array or data-module attributes)
     * that don't match what the linked module files save via ModuleProgress.complete().
     *
     * Scans index.html files that contain module ID arrays (id: 'xxx') or data-module attributes.
     * For each ID found, resolves the linked module file and checks if its ModuleProgress.complete()
     * call uses a matching moduleId. Flags mismatches that cause silent completion tracking failures.
     */
    checkCompletionIdMismatch(file) {
        const issues = [];
        const content = file.content;

        // Only check index.html files that look like hub/course pages
        if (!file.path.endsWith('index.html')) return issues;

        const fileDir = path.dirname(file.path);
        let match;
        const hubModules = [];

        // Strategy 1: data-module attributes paired with hrefs (static HTML hubs like Network+)
        const dataModulePattern = /href="([^"]+)"[^>]*data-module="([^"]+)"/g;
        while ((match = dataModulePattern.exec(content)) !== null) {
            hubModules.push({ id: match[2], href: match[1], line: this.getLineNumber(content, match.index) });
        }
        const dataModulePattern2 = /data-module="([^"]+)"[^>]*href="([^"]+)"/g;
        while ((match = dataModulePattern2.exec(content)) !== null) {
            hubModules.push({ id: match[1], href: match[2], line: this.getLineNumber(content, match.index) });
        }

        // Strategy 2: JS module arrays with id: 'xxx' (dynamic hubs like CLH)
        // These hubs define module IDs in JS and generate hrefs dynamically.
        // We extract the IDs and scan all HTML files in the same directory tree
        // for ModuleProgress.complete() calls that should match.
        const jsIdPattern = /\{\s*id:\s*['"]([^'"]+)['"]/g;
        const jsIds = [];
        while ((match = jsIdPattern.exec(content)) !== null) {
            jsIds.push({ id: match[1], line: this.getLineNumber(content, match.index) });
        }

        // For Strategy 2: scan all module files under this hub's directory
        if (jsIds.length > 0 && hubModules.length === 0) {
            // Collect all ModuleProgress.complete() IDs from files in subdirectories
            const completionMap = {}; // moduleId -> [files that save it]
            try {
                const walkDir = (dir) => {
                    const entries = fs.readdirSync(dir, { withFileTypes: true });
                    for (const entry of entries) {
                        if (entry.name === '_archive' || entry.name === 'node_modules') continue;
                        const fullPath = path.join(dir, entry.name);
                        if (entry.isDirectory()) {
                            walkDir(fullPath);
                        } else if (entry.name.endsWith('.html')) {
                            try {
                                const fileContent = fs.readFileSync(fullPath, 'utf8');
                                const cpat = /ModuleProgress\.complete\s*\(\s*['"][^'"]*['"]\s*,\s*['"]([^'"]+)['"]/g;
                                let cm;
                                while ((cm = cpat.exec(fileContent)) !== null) {
                                    if (!completionMap[cm[1]]) completionMap[cm[1]] = [];
                                    completionMap[cm[1]].push(path.relative(fileDir, fullPath));
                                }
                            } catch (e) { /* skip unreadable */ }
                        }
                    }
                };
                walkDir(fileDir);
            } catch (e) { /* skip if dir walk fails */ }

            // Cross-reference: for each hub ID, check if any file saves that exact ID
            for (const jsId of jsIds) {
                if (completionMap[jsId.id]) continue; // Exact match found — good

                // Check if there's a close match (e.g., hub='clh-001', file saves='script-clh-001-intro')
                const partialMatches = Object.keys(completionMap).filter(k => k.includes(jsId.id));
                if (partialMatches.length > 0) {
                    issues.push({
                        code: 'HEUR-025',
                        severity: 'high',
                        category: 'completion-tracking',
                        message: `Module completion ID mismatch: hub expects "${jsId.id}" but module files save as "${partialMatches.join(', ')}" — completions will silently fail`,
                        file: file.path,
                        line: jsId.line,
                        fix: `Align IDs: change ModuleProgress.complete() in module files to use "${jsId.id}" or update the hub MODULES array id to match`
                    });
                }
            }

            return issues;
        }

        // Strategy 1 continued: resolve static hrefs and check targets
        if (hubModules.length === 0) return issues;

        // Deduplicate by id
        const seen = new Set();
        const uniqueModules = hubModules.filter(m => {
            if (seen.has(m.id)) return false;
            seen.add(m.id);
            return true;
        });

        for (const mod of uniqueModules) {
            if (!mod.href || mod.href.startsWith('http') || mod.href.startsWith('#') || mod.href.startsWith('javascript:')) continue;

            const targetPath = path.resolve(fileDir, mod.href);
            if (!fs.existsSync(targetPath)) continue;

            let targetContent;
            try {
                targetContent = fs.readFileSync(targetPath, 'utf8');
            } catch (e) { continue; }

            const completePattern = /ModuleProgress\.complete\s*\(\s*['"][^'"]*['"]\s*,\s*['"]([^'"]+)['"]/g;
            let completeMatch;
            const targetModuleIds = [];
            while ((completeMatch = completePattern.exec(targetContent)) !== null) {
                targetModuleIds.push(completeMatch[1]);
            }

            if (targetModuleIds.length === 0) continue;

            const matches = targetModuleIds.some(tid => tid === mod.id);
            if (!matches) {
                issues.push({
                    code: 'HEUR-025',
                    severity: 'high',
                    category: 'completion-tracking',
                    message: `Module completion ID mismatch: hub expects "${mod.id}" but ${path.basename(mod.href)} saves as "${targetModuleIds.join(', ')}" — completions will silently fail`,
                    file: file.path,
                    line: mod.line,
                    fix: `Align IDs: either change the hub id to "${targetModuleIds[0]}" or change ModuleProgress.complete() in ${path.basename(mod.href)} to use "${mod.id}"`
                });
            }
        }

        return issues;
    }

    /**
     * HEUR-026: Course module links to house root instead of course hub
     * Detects when a file inside a course directory (courses/xxx/...) has
     * index.html links that resolve to the house root instead of the course's
     * own index.html. The course hub should be the navigation target, not
     * the parent house.
     */
    checkCourseModuleEscapesToHouseRoot(file) {
        const issues = [];
        const content = file.content;

        // Only check HTML files inside a courses/ directory
        const coursesMatch = file.path.match(/houses\/([^/]+)\/courses\/([^/]+)\/(.+)/);
        if (!coursesMatch) return issues;

        const houseId = coursesMatch[1];
        const courseId = coursesMatch[2];
        const afterCourse = coursesMatch[3];

        // Skip the course's own index.html
        if (afterCourse === 'index.html') return issues;

        // Find the course's index.html
        const courseDir = file.path.match(/(.+\/courses\/[^/]+\/)/);
        if (!courseDir) return issues;
        const courseIndexPath = courseDir[1] + 'index.html';
        const courseIndexExists = fs.existsSync(path.resolve(this.rootPath, '..', courseIndexPath));

        if (!courseIndexExists) return issues; // No course index to link to

        // Find all href="...index.html" links
        const hrefPattern = /href="((?:\.\.\/)+index\.html)"/gi;
        let match;

        while ((match = hrefPattern.exec(content)) !== null) {
            const href = match[1];
            const dotdotCount = (href.match(/\.\.\//g) || []).length;

            // Calculate depth from file to course root
            const depthInCourse = afterCourse.split('/').length - 1; // subtract filename

            // If the link climbs MORE levels than needed to reach the course index,
            // it's escaping to the house or beyond
            if (dotdotCount > depthInCourse) {
                // Resolve where this link actually goes
                const fileDir = path.dirname(file.path);
                const resolved = path.resolve(fileDir, href);
                const resolvedRelative = path.relative(path.resolve(this.rootPath, '..'), resolved);

                // Check if it lands at the house root instead of the course hub
                if (!resolvedRelative.includes('courses/' + courseId)) {
                    const line = this.getLineNumber(content, match.index);
                    const expectedDepth = depthInCourse;
                    const expectedHref = '../'.repeat(expectedDepth) + 'index.html';

                    issues.push({
                        code: 'HEUR-026',
                        severity: 'high',
                        category: 'navigation',
                        message: `Course module links to house root: "${href}" resolves to ${resolvedRelative} instead of the course hub (courses/${courseId}/index.html) — student escapes the course`,
                        file: file.path,
                        line,
                        fix: `Change to "${expectedHref}" to link to the course hub instead of the house root`
                    });
                }
            }
        }

        return issues;
    }

    /**
     * HEUR-027: Content link escapes to platform root.
     *
     * Any HTML file inside houses/ that has an href resolving above
     * the house directory to the main platform dashboard. This is a
     * tenant isolation breach — students can click a link and escape
     * their course context back to the main Hexworth hub.
     *
     * Scope: all houses, all content types, all directory depths.
     * Detects href patterns like "../../../../index.html" that climb
     * past the house boundary (houses/{houseId}/) to reach _app/index.html.
     *
     * @param {Object} file - { path, content }
     * @returns {Array} Issues found
     */
    checkContentLinkEscapesToPlatformRoot(file) {
        const issues = [];
        const content = file.content;

        // Only check HTML files inside a houses/ directory
        if (!file.path.endsWith('.html')) return issues;
        const housesMatch = file.path.match(/houses\/([^/]+)\/(.+)/);
        if (!housesMatch) return issues;

        const houseId = housesMatch[1];          // e.g. "web"
        const afterHouse = housesMatch[2];       // e.g. "network-plus/exams/jeopardy.review.html"

        // Calculate depth: how many directories deep inside houses/{houseId}/
        // e.g. "network-plus/exams/jeopardy.review.html" → 2 dirs deep (network-plus, exams)
        const segments = afterHouse.split('/');
        const depthInHouse = segments.length - 1; // subtract the filename

        // Find all href="..." links with ../ patterns
        const hrefPattern = /href="((?:\.\.\/)+[^"]*index\.html[^"]*)"/gi;
        let match;

        while ((match = hrefPattern.exec(content)) !== null) {
            const href = match[1];
            const dotdotCount = (href.match(/\.\.\//g) || []).length;

            // If the link climbs MORE levels than the file's depth inside the house,
            // it escapes beyond houses/{houseId}/ to the house root or platform root
            // depthInHouse = levels inside house dir
            // +1 for the house dir itself (e.g. "web/")
            // +1 for "houses/" dir
            // If dotdotCount > depthInHouse, the link escapes the house content area
            // If dotdotCount > depthInHouse + 1, it escapes past houses/{houseId}/
            // If dotdotCount > depthInHouse + 2, it escapes past houses/ entirely (platform root)
            if (dotdotCount > depthInHouse + 1) {
                // Resolve the link to see where it actually goes
                const fileDir = path.dirname(file.path);
                const resolved = path.resolve(fileDir, href);
                const resolvedRelative = path.relative(path.resolve(this.rootPath, '..'), resolved);

                // Check if it escapes above houses/
                if (!resolvedRelative.startsWith('houses/')) {
                    const line = this.getLineNumber(content, match.index);
                    issues.push({
                        code: 'HEUR-027',
                        severity: 'high',
                        category: 'navigation',
                        message: `Content link escapes to platform root: "${href}" resolves to ${resolvedRelative} — students can leave their course/tenant context. Links inside houses/${houseId}/ should stay within the house.`,
                        file: file.path,
                        line,
                        fix: `Remove or replace this link. Course content should link to its own hub index, not the platform root.`
                    });
                }
            }
        }

        return issues;
    }

    /**
     * HEUR-028: ModuleProgress.complete() signature mismatch.
     *
     * The correct signature is:
     *   ModuleProgress.complete(houseId, moduleId, options?)
     * where houseId is one of the 12 recognized house IDs or a
     * HOUSE_ID constant, moduleId is a string, and options is an
     * optional object (typically { returnUrl: '...' }).
     *
     * Detects:
     *   - First arg is a module-style ID (contains dashes + house prefix)
     *     instead of a bare house ID — e.g. complete('web-osi-model', ...)
     *   - Second arg is a numeric variable or literal instead of a
     *     module ID string — e.g. complete(MODULE_ID, scaled)
     *   - Call has only 1 arg (missing moduleId entirely)
     *
     * @param {Object} file - { path, content }
     * @returns {Array} Issues found
     */
    checkModuleProgressSignature(file) {
        const issues = [];
        const content = file.content;

        /* Only check HTML files that load ModuleProgress */
        if (!file.path.endsWith('.html')) return issues;
        if (!content.includes('ModuleProgress')) return issues;

        /* Known valid house IDs — the 12 Hexworth houses */
        const VALID_HOUSES = [
            'web', 'eye', 'shield', 'script', 'code', 'key',
            'forge', 'cloud', 'ai', 'arctic', 'dark-arts', 'signal'
        ];

        /* Match all ModuleProgress.complete(...) calls.
           Captures everything inside the parentheses. */
        const pattern = /ModuleProgress\.complete\(([^)]+)\)/g;
        let match;

        while ((match = pattern.exec(content)) !== null) {
            const argsStr = match[1].trim();
            const line = this.getLineNumber(content, match.index);

            /* Skip if inside a comment or alert string */
            const lineText = content.substring(
                content.lastIndexOf('\n', match.index) + 1,
                content.indexOf('\n', match.index)
            );
            if (lineText.trim().startsWith('//') || lineText.trim().startsWith('*') || lineText.includes('alert(')) continue;

            /* Split args by comma (respecting nested objects/strings).
               Simple approach: split on commas not inside braces/quotes.
               For reliability, count top-level commas only. */
            const args = this._splitArgs(argsStr);

            if (args.length < 2) {
                /* Only 1 arg — missing moduleId */
                issues.push({
                    code: 'HEUR-028',
                    severity: 'high',
                    category: 'completion-tracking',
                    message: `ModuleProgress.complete() called with only ${args.length} arg(s) — expected (houseId, moduleId, options?). Module completion will silently fail.`,
                    file: file.path,
                    line,
                    fix: 'Use ModuleProgress.complete(houseId, moduleId, { returnUrl: \'../index.html\' })'
                });
                continue;
            }

            const firstArg = args[0].trim();
            const secondArg = args[1].trim();

            /* Check first arg: should be a house ID string or HOUSE_ID constant */
            const isLiteralHouse = VALID_HOUSES.some(h =>
                firstArg === `'${h}'` || firstArg === `"${h}"`
            );
            const isHouseConstant = /^HOUSE_ID$/i.test(firstArg);

            if (!isLiteralHouse && !isHouseConstant) {
                /* First arg doesn't look like a house ID.
                   Check if it looks like a moduleId (has dashes) or a variable */
                const looksLikeModuleId = /^['"][\w]+-[\w-]+['"]$/.test(firstArg);
                const isModuleConstant = /MODULE_ID|moduleId/i.test(firstArg);

                if (looksLikeModuleId || isModuleConstant) {
                    issues.push({
                        code: 'HEUR-028',
                        severity: 'high',
                        category: 'completion-tracking',
                        message: `ModuleProgress.complete() first arg "${firstArg}" looks like a moduleId, not a houseId. Expected one of: ${VALID_HOUSES.join(', ')} or HOUSE_ID constant. Completion will register under wrong key.`,
                        file: file.path,
                        line,
                        fix: `Change to ModuleProgress.complete('HOUSE_ID', ${firstArg}, { returnUrl: '../index.html' }) — replace HOUSE_ID with the correct house.`
                    });
                    continue;
                }
            }

            /* Check second arg: should NOT be a number or score variable */
            const looksLikeScore = /^(scaled|score|pct|percent|points|total\w*|result|grade|\d+)$/i.test(secondArg);
            if (looksLikeScore) {
                issues.push({
                    code: 'HEUR-028',
                    severity: 'high',
                    category: 'completion-tracking',
                    message: `ModuleProgress.complete() second arg "${secondArg}" looks like a score, not a moduleId. The score is being passed where the module identifier should be.`,
                    file: file.path,
                    line,
                    fix: `Change to ModuleProgress.complete(houseId, moduleId, { returnUrl: '../index.html' }) — pass score via options or a separate call.`
                });
            }
        }

        return issues;
    }

    /**
     * Helper: split function arguments string by top-level commas.
     * Respects nested braces, parentheses, and quoted strings so
     * that { returnUrl: '../index.html' } is treated as one arg.
     *
     * @param {string} str - The raw arguments string from inside parentheses
     * @returns {string[]} Array of argument strings
     */
    _splitArgs(str) {
        const args = [];
        let depth = 0;       /* Tracks {} and () nesting */
        let inString = null; /* Tracks quote type: ' or " or null */
        let current = '';

        for (let i = 0; i < str.length; i++) {
            const ch = str[i];

            /* Handle string boundaries */
            if ((ch === "'" || ch === '"') && (i === 0 || str[i - 1] !== '\\')) {
                if (inString === ch) inString = null;
                else if (!inString) inString = ch;
            }

            /* Track nesting depth outside strings */
            if (!inString) {
                if (ch === '{' || ch === '(') depth++;
                else if (ch === '}' || ch === ')') depth--;
                else if (ch === ',' && depth === 0) {
                    args.push(current);
                    current = '';
                    continue;
                }
            }

            current += ch;
        }

        if (current.trim()) args.push(current);
        return args;
    }

    /**
     * HEUR-029: Looks-clickable elements without click handlers.
     *
     * Catches the silent dead-click pattern: a non-anchor element styled to
     * appear clickable (role="link"/"button", cursor:pointer + tabindex,
     * onkeydown navigation, href on a non-anchor) that has neither an inline
     * onclick attribute nor a JS-attached handler keyed off its class/id.
     *
     * Suppression: if the element's class or id appears in a JS context with
     * addEventListener('click') or .onclick = wiring, assume it's JS-wired
     * and skip. Severity is 'suspect' (human triage) not 'high' (block).
     */
    checkLooksClickableButIsnt(file) {
        const issues = [];
        const content = file.content;
        if (!content) return issues;

        // Strip <style> blocks so CSS class references don't count as JS wiring
        const jsOnly = content
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<!--[\s\S]*?-->/g, '');

        // File has ANY click wiring at all? (cheap pre-check)
        const hasAnyClickWiring = /\baddEventListener\s*\(\s*['"]click['"]/i.test(jsOnly)
                                || /\.\s*onclick\s*=/i.test(jsOnly);

        const tagPattern = /<([a-z][a-z0-9]*)\b([^>]*)>/gi;
        const inherentlyClickable = new Set(['a', 'area', 'button', 'input', 'select', 'textarea', 'option', 'label', 'summary']);

        let match;
        while ((match = tagPattern.exec(content)) !== null) {
            const tagName = match[1].toLowerCase();
            const attrs = match[2];
            if (inherentlyClickable.has(tagName)) continue;

            const hasRoleLinkOrButton = /\brole\s*=\s*["'](?:link|button)["']/i.test(attrs);
            const hasCursorPointer = /\bcursor\s*:\s*pointer\b/i.test(attrs);
            const hasTabindex0 = /\btabindex\s*=\s*["']?0["']?/i.test(attrs);
            const hasNavOnKeydown = /\bonkeydown\s*=\s*["'][^"']*window\.location/i.test(attrs);
            const hasHrefAttr = /\bhref\s*=/i.test(attrs);
            const hasOnclick = /\bonclick\s*=/i.test(attrs);

            // Strong "looks clickable" signal
            const explicit = hasRoleLinkOrButton;
            // Weaker "looks clickable" requires combination
            const implicit = (hasCursorPointer && hasTabindex0)
                          || hasNavOnKeydown
                          || (hasCursorPointer && hasHrefAttr);

            if (!(explicit || implicit) || hasOnclick) continue;

            // Suppression: is this element's class or id wired in JS?
            if (hasAnyClickWiring) {
                const classMatch = attrs.match(/\bclass\s*=\s*["']([^"']+)["']/i);
                const idMatch = attrs.match(/\bid\s*=\s*["']([^"']+)["']/i);
                const classList = classMatch ? classMatch[1].split(/\s+/).filter(Boolean) : [];
                const elemId = idMatch ? idMatch[1] : null;

                // Suppression requires PROXIMITY: a query for this class/id within 500 chars
                // of an actual click attachment (.onclick = X or .addEventListener('click', X)).
                // Bare querySelector('.X') without click wiring nearby = NOT suppressed.
                const CLICK_WINDOW = 500;
                const clickAttachRe = /(?:\.\s*onclick\s*=|\.\s*addEventListener\s*\(\s*['"]click['"])/i;

                function hasNearbyClickWiring(queryRe) {
                    let m;
                    queryRe.lastIndex = 0;
                    while ((m = queryRe.exec(jsOnly)) !== null) {
                        const window = jsOnly.slice(m.index, m.index + CLICK_WINDOW);
                        if (clickAttachRe.test(window)) return true;
                    }
                    return false;
                }

                let probablyWired = false;
                if (elemId) {
                    const escId = elemId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const idQueryRe = new RegExp(`(?:getElementById\\s*\\(\\s*['"]${escId}['"]|querySelector(?:All)?\\s*\\(\\s*['"]#${escId}\\b[^'"]*['"])`, 'gi');
                    if (hasNearbyClickWiring(idQueryRe)) probablyWired = true;

                    // Variable tracking: var/let/const X = document.getElementById('Y'); ... ; X.addEventListener('click'
                    if (!probablyWired) {
                        const varAssignRe = new RegExp(`\\b(?:var|let|const)\\s+(\\w+)\\s*=\\s*(?:document\\.)?getElementById\\s*\\(\\s*['"]${escId}['"]`, 'gi');
                        let vm;
                        while ((vm = varAssignRe.exec(jsOnly)) !== null) {
                            const varName = vm[1];
                            const escVar = varName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                            if (new RegExp(`\\b${escVar}\\s*\\.\\s*addEventListener\\s*\\(\\s*['"]click['"]`, 'i').test(jsOnly)
                             || new RegExp(`\\b${escVar}\\s*\\.\\s*onclick\\s*=`, 'i').test(jsOnly)) {
                                probablyWired = true;
                                break;
                            }
                        }
                    }
                }
                if (!probablyWired) {
                    for (const cls of classList) {
                        const escCls = cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                        const clsQueryRe = new RegExp(`(?:querySelector(?:All)?\\s*\\(\\s*['"]\\.${escCls}\\b[^'"]*['"]|getElementsByClassName\\s*\\(\\s*['"]${escCls}\\b[^'"]*['"]|closest\\s*\\(\\s*['"]\\.${escCls}\\b[^'"]*['"])`, 'gi');
                        if (hasNearbyClickWiring(clsQueryRe)) {
                            probablyWired = true;
                            break;
                        }
                    }
                }
                if (probablyWired) continue;
            }

            const line = this.getLineNumber(content, match.index);
            const signals = [];
            if (hasRoleLinkOrButton) signals.push('role="link/button"');
            if (hasCursorPointer) signals.push('cursor:pointer');
            if (hasTabindex0) signals.push('tabindex="0"');
            if (hasNavOnKeydown) signals.push('onkeydown→navigation');
            if (hasHrefAttr) signals.push('href= (inert on non-anchor)');

            issues.push({
                code: 'HEUR-029',
                severity: 'suspect',
                category: 'heuristic',
                message: `<${tagName}> looks clickable (${signals.join(', ')}) but has no onclick handler and no JS-wired class/id`,
                file: file.path,
                line,
                fix: `Add onclick="..." matching intent, or convert <${tagName}> to <a href="..."> for navigation`
            });
        }

        return issues;
    }

    /**
     * HEUR-030: Course-hub tenant-leak via missing dashboardBtn rewrite.
     *
     * Scope: course-hub index.html at depth 2 inside _app/houses/ —
     * i.e., paths matching `houses/<house>/<course>/index.html`. These
     * are the tenant entry-point hubs (cert-hub, course-hub).
     *
     * Fires when the file has a static <a id="dashboardBtn"> but is
     * missing the canonical IIFE that rewrites the button to the tenant
     * dashboard via TenantRouter. Detection requires BOTH of these
     * substrings to be present (per Nancy review 2026-05-17):
     *   - getElementById('dashboardBtn')   (or "..." double-quoted)
     *   - TenantRouter.getUrl              (any method-access form)
     * If either is absent the rewriter isn't wired, and tenant students
     * clicking Dashboard will leak to the house index (main hex).
     *
     * Severity: HIGH — tenant-isolation breach. Blocks deploy.sh via the
     * Nexus pre-deploy gate.
     *
     * Canonical pattern lives in _app/houses/code/python-for-it/index.html
     * (search for the "Tenant-aware Dashboard button" comment heading).
     */
    checkDashboardBtnTenantRewrite(file) {
        const issues = [];
        const content = file.content;
        if (!content) return issues;

        // Scope check: must be a course-hub index.html at exactly 2-deep
        // inside houses/. Anchored to /index.html at end so future
        // sub-folder index files (units/, modules/) don't fire.
        if (!/(?:^|\/)houses\/[^/]+\/[^/]+\/index\.html$/.test(file.path)) {
            return issues;
        }

        // Static button present?
        const btnMatch = content.match(/id\s*=\s*["']dashboardBtn["']/);
        if (!btnMatch) return issues;

        // Strip HTML comments so a `<!-- TODO: wire dashboardBtn -->` doesn't
        // falsely satisfy the rewriter-present check. Matches HEUR-029 style.
        const stripped = content.replace(/<!--[\s\S]*?-->/g, '');

        // Both rewriter signals required. Either missing → leak.
        const hasGetById = /getElementById\s*\(\s*["']dashboardBtn["']\s*\)/.test(stripped);
        const hasRouterCall = /TenantRouter\s*\.\s*getUrl\b/.test(stripped);
        if (hasGetById && hasRouterCall) return issues;

        const line = this.getLineNumber(content, btnMatch.index);
        const missing = [];
        if (!hasGetById) missing.push("getElementById('dashboardBtn')");
        if (!hasRouterCall) missing.push('TenantRouter.getUrl');

        issues.push({
            code: 'HEUR-030',
            severity: 'high',
            category: 'heuristic',
            message: `Course hub has <a id="dashboardBtn"> but missing ${missing.join(' AND ')} — tenant students will leak to house index instead of tenant dashboard`,
            file: file.path,
            line,
            fix: 'Add the canonical IIFE before </body>. See _app/houses/code/python-for-it/index.html (search "Tenant-aware Dashboard button") for the pattern.'
        });

        return issues;
    }

    /**
     * HEUR-030b: Programmatic navigation to platform page without TenantRouter.
     *
     * Detects (window.)?location.href= / location.assign() / location.replace()
     * targeting an absolute /dashboard.html | /sorting.html | /index.html |
     * /unauthorized.html, when the surrounding inline script has NO
     * TenantRouter check.
     *
     * Scope: HTML under _app/houses/ and _app/tenant/, excluding
     * _app/tenant/dashboard-X.html (platform pages).
     *
     * ABSOLUTE PATH REQUIRED. Bare 'dashboard.html' resolves relative to
     * the current directory and is NOT a platform-root leak. (Nancy round 1
     * lesson 2026-06-05 — broad regex matched 35 relative `index.html`
     * course-hub returns that were correct navigation patterns.)
     *
     * Severity: HIGH.
     */
    checkLocationHrefTenantLeak(file) {
        const issues = [];
        const content = file.content;
        if (!content) return issues;

        const inScope = /(?:^|\/)_app\/(?:houses|tenant)\/.+\.html$/.test(file.path);
        if (!inScope) return issues;
        if (/_app\/tenant\/dashboard-[^/]+\.html$/.test(file.path)) return issues;

        const scripts = this._extractInlineScripts(content);

        for (const script of scripts) {
            // Skip if this script block already gates with TenantRouter
            if (/TenantRouter\s*\.\s*(?:getUrl|isActive|goToHub)/.test(script)) continue;
            // Regex constructed inside loop to match HEUR-030c/d/e pattern
            // (avoids /g flag lastIndex carryover across iterations — Nancy
            // round 2 consistency requirement 2026-06-06).
            const leakRe = /(?:window\.)?location\s*\.\s*(?:href\s*=|assign\s*\(\s*|replace\s*\(\s*)\s*['"](\/(?:dashboard|sorting|index|unauthorized)\.html)["']/g;
            let m;
            while ((m = leakRe.exec(script)) !== null) {
                const lineIdx = content.indexOf(m[0]);
                const targetKey = m[1].replace(/^\//, '').replace(/\.html$/, '');
                issues.push({
                    code: 'HEUR-030b',
                    severity: 'high',
                    category: 'heuristic',
                    message: `Programmatic navigation to platform page '${m[1]}' without TenantRouter rewrite — tenant student leaks to main hex`,
                    file: file.path,
                    line: this.getLineNumber(content, lineIdx >= 0 ? lineIdx : 0),
                    fix: `Wrap the redirect: var url = (typeof TenantRouter !== 'undefined' && TenantRouter.isActive()) ? TenantRouter.getUrl('${targetKey}') : '${m[1]}'; window.location.href = url;`
                });
            }
        }
        return issues;
    }

    /**
     * HEUR-030c: PageTransition.navigateTo to platform page without TenantRouter.
     *
     * PageTransition.js has zero TenantRouter integration (verified 2026-06-05).
     * Any tenant-context call to PageTransition.navigateTo() targeting a
     * platform page leaks the tenant student to main hex.
     *
     * Scope: _app/houses/**.html + _app/tenant/**.html, excluding
     * _app/tenant/dashboard-*.html (those ARE platform pages themselves
     * and legitimately route to /dashboard.html as fallback).
     *
     * Detection: extract inline scripts; flag PageTransition.navigateTo('X')
     * where X is dashboard.html / sorting.html / index.html / unauthorized.html
     * AND the surrounding script block has no TenantRouter.getUrl call.
     *
     * Severity: HIGH (matches HEUR-030 — tenant-isolation breach).
     */
    checkPageTransitionTenantLeak(file) {
        const issues = [];
        const content = file.content;
        if (!content) return issues;

        const inScope = /(?:^|\/)_app\/(?:houses|tenant)\/.+\.html$/.test(file.path);
        if (!inScope) return issues;
        if (/_app\/tenant\/dashboard-[^/]+\.html$/.test(file.path)) return issues;

        const scripts = this._extractInlineScripts(content);
        // Absolute path required — bare 'dashboard.html' resolves relative
        // to current dir and is NOT a platform-root leak. Same discipline
        // Nancy enforced on HEUR-030b regex 2026-06-06.
        const leakTargets = /^\/(?:dashboard|sorting|index|unauthorized)\.html$/;

        for (const script of scripts) {
            const callRe = /PageTransition\s*\.\s*navigateTo\s*\(\s*['"]([^'"]+)['"]/g;
            let m;
            while ((m = callRe.exec(script)) !== null) {
                if (!leakTargets.test(m[1])) continue;
                if (/TenantRouter\s*\.\s*getUrl/.test(script)) continue;
                const lineIdx = content.indexOf(m[0]);
                issues.push({
                    code: 'HEUR-030c',
                    severity: 'high',
                    category: 'heuristic',
                    message: `PageTransition.navigateTo('${m[1]}') leaks tenant context — PageTransition is not tenant-aware`,
                    file: file.path,
                    line: this.getLineNumber(content, lineIdx >= 0 ? lineIdx : 0),
                    fix: `Compute url via TenantRouter first: var url = (typeof TenantRouter !== 'undefined' && TenantRouter.isActive()) ? TenantRouter.getUrl('${m[1].replace(/^\//,'').replace(/\.html$/,'')}') : '${m[1]}'; PageTransition.navigateTo(url);`
                });
            }
        }
        return issues;
    }

    /**
     * HEUR-030d: <form action> or <iframe src> to platform page on tenant-context.
     *
     * TenantShell's runtime overrideLinks() ONLY rewrites <a href> elements
     * (TenantShell.js:390 — querySelectorAll('a[href]')). Form actions and
     * iframe srcs are not in its scope. A form with action="/dashboard.html"
     * submits the user out of tenant context regardless of TenantShell.
     *
     * Scope: same as HEUR-030c.
     * Severity: HIGH.
     */
    checkFormIframeTenantLeak(file) {
        const issues = [];
        const content = file.content;
        if (!content) return issues;

        const inScope = /(?:^|\/)_app\/(?:houses|tenant)\/.+\.html$/.test(file.path);
        if (!inScope) return issues;
        if (/_app\/tenant\/dashboard-[^/]+\.html$/.test(file.path)) return issues;

        // Length-preserving comment mask so m.index from the masked string
        // aligns with positions in `content` for accurate line-number
        // resolution. Destructive .replace(...,'') would shift positions and
        // produce wrong line numbers for repeated matches (Nancy R4 fix
        // 2026-06-06 — same fix applied below in HEUR-030f).
        const masked = content.replace(/<!--[\s\S]*?-->/g, function(m) {
            return ' '.repeat(m.length);
        });

        const patterns = [
            { re: /<form\b[^>]*\baction\s*=\s*["']\/(dashboard|sorting|index|unauthorized)\.html["']/g, kind: 'form action' },
            { re: /<iframe\b[^>]*\bsrc\s*=\s*["']\/(dashboard|sorting|index|unauthorized)\.html["']/g, kind: 'iframe src' }
        ];

        for (const { re, kind } of patterns) {
            let m;
            while ((m = re.exec(masked)) !== null) {
                issues.push({
                    code: 'HEUR-030d',
                    severity: 'high',
                    category: 'heuristic',
                    message: `${kind}="/${m[1]}.html" leaks tenant context — TenantShell only rewrites <a href>, not form/iframe`,
                    file: file.path,
                    line: this.getLineNumber(content, m.index),
                    fix: `Compute target via TenantRouter.getUrl('${m[1]}') and set the attribute at runtime, OR convert to an <a href> so TenantShell's overrideLinks() rewrites it`
                });
            }
        }
        return issues;
    }

    /**
     * HEUR-030e: Tenant-accessible page missing the TenantShell auto-loader chain
     * AND has a leaking static href.
     *
     * Without any of AccessGuard.js / ModuleProgress.js / FirebaseAuth.js /
     * TenantShell.js loaded, the runtime overrideLinks() rewriter never
     * runs and every static href to a platform page leaks. This rule only
     * flags pages that BOTH lack the chain AND already contain a leaking
     * href (otherwise a pure-content page with no nav is harmlessly
     * loader-less).
     *
     * Scope: same as HEUR-030c.
     * Severity: HIGH.
     */
    checkMissingTenantAutoLoader(file) {
        const issues = [];
        const content = file.content;
        if (!content) return issues;

        const inScope = /(?:^|\/)_app\/(?:houses|tenant)\/.+\.html$/.test(file.path);
        if (!inScope) return issues;
        if (/_app\/tenant\/dashboard-[^/]+\.html$/.test(file.path)) return issues;

        const stripped = content.replace(/<!--[\s\S]*?-->/g, '');

        // Loader chain present?
        const hasLoader = /<script\b[^>]*\bsrc\s*=\s*["'][^"']*\/(AccessGuard|ModuleProgress|FirebaseAuth|TenantShell)\.js["']/.test(stripped);
        if (hasLoader) return issues;

        // Only flag if there's actually a leaking href to fail-open against.
        const hasLeakingHref = /<a\b[^>]*\bhref\s*=\s*["']\/(dashboard|sorting|index|unauthorized)\.html["']/.test(stripped);
        if (!hasLeakingHref) return issues;

        issues.push({
            code: 'HEUR-030e',
            severity: 'high',
            category: 'heuristic',
            message: 'Tenant-accessible page has static href to a platform page but loads none of AccessGuard.js / ModuleProgress.js / FirebaseAuth.js / TenantShell.js — runtime link rewriter is never injected',
            file: file.path,
            line: 1,
            fix: 'Add <script src="/components/AccessGuard.js"></script> (or another component in the auto-loader chain) to <head>. The chain auto-injects TenantShell which rewrites platform-page hrefs at runtime via overrideLinks().'
        });
        return issues;
    }

    /**
     * Helper: extract inline script content from HTML.
     * Returns array of script block strings (code only, no tags).
     */
    _extractInlineScripts(content) {
        const blocks = [];
        const pattern = /<script(?![^>]*\bsrc\b)[^>]*>([\s\S]*?)<\/script>/gi;
        let match;
        while ((match = pattern.exec(content)) !== null) {
            if (match[1] && match[1].trim().length > 10) {
                blocks.push(match[1]);
            }
        }
        return blocks;
    }

    /**
     * Get line number from character position
     */
    /**
     * HEUR-CTF-CFG-MISACCESS — CTF lab config-state misaccess.
     *
     * Detects command handlers in lab config.js files that reference
     * `engine._X` where `_X` is a top-level config field. BoxEngine
     * stores `this.config = config` and never copies config keys onto
     * the engine instance, so `engine._X` is undefined and the command
     * silently throws.
     *
     * Algorithm:
     *   1. Build the BoxEngine instance-field allowlist DYNAMICALLY by
     *      scanning BoxEngine.js for `this._X = ` assignments. These are
     *      legitimate engine fields (e.g. _coOpMode, _devToolsOpen).
     *   2. For every _app/houses/<\!*>/labs/<\!*>/config.js, use a brace-
     *      depth line scanner to collect top-level keys starting with `_`.
     *      Strip `//` comments per line first so banner comments don't leak.
     *   3. Within the `commands: {` block, find every `engine\._X` reference.
     *      If `_X` is in the lab's state-field set AND not in the BoxEngine
     *      allowlist, fire HIGH severity.
     *
     * Discovery: 2026-05-09. Doc: ctf-config-misaccess-bug-2026-05-09.md.
     *
     * @returns {Array} Issues found
     */
    validateCTFConfigMisaccess() {
        const issues = [];

        // ── Step 1: build BoxEngine instance-field allowlist dynamically ──
        const boxEnginePath = path.resolve(this.rootPath, 'arena/engine/BoxEngine.js');
        const allowlist = new Set();
        try {
            const beContent = fs.readFileSync(boxEnginePath, 'utf8');
            const assignPattern = /\bthis\._([a-zA-Z][\w]*)\s*=/g;
            let m;
            while ((m = assignPattern.exec(beContent)) !== null) {
                allowlist.add(m[1]);
            }
        } catch (err) {
            // If BoxEngine.js is unreadable, skip the validator entirely
            // rather than firing false positives.
            if (this.verbose) {
                console.log('[HEUR-CTF-CFG-MISACCESS] BoxEngine.js unreadable — validator disabled this run');
            }
            return issues;
        }

        // ── Step 2: walk lab config.js files ──
        const housesDir = path.resolve(this.rootPath, 'houses');
        const labConfigs = [];
        try {
            const houses = fs.readdirSync(housesDir);
            for (const house of houses) {
                const houseDir = path.join(housesDir, house);
                if (!fs.statSync(houseDir).isDirectory()) continue;
                this._collectLabConfigs(houseDir, labConfigs);
            }
        } catch (err) {
            return issues;
        }

        for (const filePath of labConfigs) {
            let content;
            try {
                content = fs.readFileSync(filePath, 'utf8');
            } catch (err) { continue; }

            // Only scan files that have a commands block — skip configs without
            // command surface (e.g., mission boxes that use phases instead).
            if (!/\bcommands\s*:\s*\{/.test(content)) continue;

            const stateFields = this._collectTopLevelStateFields(content);
            if (stateFields.size === 0) continue;

            // Build the code skeleton ONCE — strings + comments removed,
            // byte alignment preserved — used for both the commands-block
            // bounds and the engine._X scan inside it.
            const skel = this._codeSkeleton(content);

            const cmdStart = skel.search(/\bcommands\s*:\s*\{/);
            if (cmdStart < 0) continue;
            const cmdBlockEnd = this._findMatchingBrace(skel, cmdStart);
            if (cmdBlockEnd < 0) continue;
            const cmdBody = skel.substring(cmdStart, cmdBlockEnd);
            const cmdBodyOffset = cmdStart;

            const ePattern = /\bengine\._([a-zA-Z][\w]*)/g;
            let match;
            const seen = new Set(); // de-dupe per (line, key)
            while ((match = ePattern.exec(cmdBody)) !== null) {
                const key = match[1];
                if (!stateFields.has(key)) continue;        // not a config-level field
                if (allowlist.has(key)) continue;            // legitimate engine field
                const absPos = cmdBodyOffset + match.index;
                const line = this.getLineNumber(content, absPos);
                const dedupKey = line + ':' + key;
                if (seen.has(dedupKey)) continue;
                seen.add(dedupKey);

                const relPath = filePath.replace(/^.*?\/_app\//, '_app/').replace(/^.*?_app\//, '_app/');
                issues.push({
                    code: 'HEUR-CTF-CFG-MISACCESS',
                    severity: 'high',
                    category: 'ctf-engine',
                    message: `Reference engine._${key} should be engine.config._${key} — config-level state lives at engine.config, not on the engine instance. _${key} is defined at top-level of this config.`,
                    file: relPath.replace(/^_app\//, ''),
                    line,
                    fix: `Change engine._${key} to engine.config._${key} in this command body. See _docs/operations/ctf-config-misaccess-bug-2026-05-09.md.`
                });
            }
        }

        return issues;
    }

    /**
     * Recursive walker — collects every config.js under any */labs/* path.
     * Helper for validateCTFConfigMisaccess.
     */
    _collectLabConfigs(dir, out) {
        let entries;
        try {
            entries = fs.readdirSync(dir, { withFileTypes: true });
        } catch (err) { return; }
        for (const ent of entries) {
            const full = path.join(dir, ent.name);
            if (ent.isDirectory()) {
                this._collectLabConfigs(full, out);
            } else if (ent.isFile() && ent.name === 'config.js' && /\/labs\//.test(full)) {
                out.push(full);
            }
        }
    }

    /**
     * Build a "code skeleton" of the source: strings, template literals,
     * comments, and regex literals are replaced with spaces (preserving byte
     * alignment) so that subsequent regex/scan ops see only the structural
     * code.
     *
     * Single-pass state machine. Handles:
     *   - `'Foo // Bar'` — `//` inside string is NOT a comment
     *   - `/^["']|["']$/g` — quote chars inside regex char-class are NOT
     *     string starts (real-world bug: ala-l09 regex confused tracker)
     *   - Template literal `${ ... }` interpolations (depth-tracked)
     *
     * Regex-literal heuristic: a `/` is the start of a regex (vs division)
     * when the previous non-whitespace token-end is one of the "regex-allowed"
     * prefix tokens (=, (, ,, ;, :, !, &, |, ?, {, }, [, return, typeof, etc).
     */
    _codeSkeleton(content) {
        const out = content.split('');
        const len = content.length;
        const regexPrev = new Set(['=', '(', ',', ';', ':', '!', '&', '|', '?', '{', '}', '[', '+', '-', '*', '%', '<', '>', '^', '~']);
        const regexPrevWords = new Set(['return', 'typeof', 'in', 'instanceof', 'new', 'delete', 'void', 'throw', 'yield', 'await', 'do', 'else', 'case']);

        let i = 0;
        while (i < len) {
            const ch = content[i];
            const next = content[i + 1];

            // Block comment
            if (ch === '/' && next === '*') {
                const end = content.indexOf('*/', i + 2);
                const stop = end < 0 ? len : end + 2;
                for (let k = i; k < stop; k++) if (content[k] !== '\n') out[k] = ' ';
                i = stop; continue;
            }
            // Line comment
            if (ch === '/' && next === '/') {
                let k = i;
                while (k < len && content[k] !== '\n') { out[k] = ' '; k++; }
                i = k; continue;
            }

            // Regex literal vs division: peek backwards
            if (ch === '/') {
                let p = i - 1;
                while (p >= 0 && /\s/.test(content[p])) p--;
                let isRegex = false;
                if (p < 0) isRegex = true;
                else {
                    const prevCh = content[p];
                    if (regexPrev.has(prevCh)) isRegex = true;
                    else if (/[a-zA-Z_$]/.test(prevCh)) {
                        // Read the preceding identifier; if it's a keyword that
                        // can precede a regex (e.g. `return /foo/`), treat as regex
                        let q = p;
                        while (q >= 0 && /[\w$]/.test(content[q])) q--;
                        const word = content.substring(q + 1, p + 1);
                        if (regexPrevWords.has(word)) isRegex = true;
                    }
                }
                if (isRegex) {
                    // Scan forward for matching `/`, respecting char-class `[...]`
                    let k = i + 1;
                    let inClass = false;
                    while (k < len) {
                        const cc = content[k];
                        if (cc === '\\') { k += 2; continue; }
                        if (cc === '\n') break; // unterminated regex — bail
                        if (inClass) {
                            if (cc === ']') inClass = false;
                        } else {
                            if (cc === '[') inClass = true;
                            else if (cc === '/') { k++; break; }
                        }
                        k++;
                    }
                    // Skip flags after closing `/`
                    while (k < len && /[gimsuy]/.test(content[k])) k++;
                    for (let m = i + 1; m < k - 1; m++) if (content[m] !== '\n') out[m] = ' ';
                    i = k; continue;
                }
                // Division — leave as-is, advance one char
                i++; continue;
            }

            // String literals
            if (ch === "'" || ch === '"' || ch === '`') {
                const quote = ch;
                let k = i + 1;
                while (k < len) {
                    if (content[k] === '\\') { k += 2; continue; }
                    if (content[k] === quote) { k++; break; }
                    if (quote === '`' && content[k] === '$' && content[k + 1] === '{') {
                        let depth = 1;
                        let m = k + 2;
                        while (m < len && depth > 0) {
                            if (content[m] === '{') depth++;
                            else if (content[m] === '}') depth--;
                            m++;
                        }
                        k = m; continue;
                    }
                    k++;
                }
                for (let m = i + 1; m < k - 1; m++) if (content[m] !== '\n') out[m] = ' ';
                i = k; continue;
            }
            i++;
        }
        return out.join('');
    }

    /**
     * Min-indent line scanner — collects top-level keys starting with `_` in
     * the lab's main config object.
     *
     * Operates on the code skeleton (strings/comments/regex stripped to
     * spaces) so `// comment _fakeKey:` and `'_string _content:'` patterns
     * are eliminated. Then per-line regex matches `^(\s+)_(\w+)\s*:`. The
     * MINIMUM indent across all matches is the top-level indent — keep only
     * keys at that depth, skip nested ones.
     *
     * Robust to: arbitrarily deep nesting, regex literals, multi-line strings,
     * line comments containing fake keys, block comments, mixed indent.
     *
     * Returns a Set<string> of field names without the leading underscore.
     */
    _collectTopLevelStateFields(content) {
        const skel = this._codeSkeleton(content);
        const lines = skel.split('\n');
        const candidates = []; // { ident, indent, line }
        const lineRe = /^(\s+)_([a-zA-Z]\w*)\s*:/;
        for (let li = 0; li < lines.length; li++) {
            const m = lineRe.exec(lines[li]);
            if (m) candidates.push({ ident: m[2], indent: m[1].length, line: li + 1 });
        }
        if (candidates.length === 0) return new Set();
        const minIndent = Math.min(...candidates.map(c => c.indent));
        const fields = new Set();
        for (const c of candidates) {
            if (c.indent === minIndent) fields.add(c.ident);
        }
        return fields;
    }

    /**
     * Find the index of the closing `}` that matches the opening `{` at or
     * after `fromIdx`. Tracks string state to avoid being fooled by braces
     * inside string literals or template literals. Returns -1 if unmatched.
     */
    _findMatchingBrace(content, fromIdx) {
        let i = content.indexOf('{', fromIdx);
        if (i < 0) return -1;
        let depth = 0;
        let inSingle = false, inDouble = false, inBacktick = false, inLineComment = false;
        const len = content.length;
        while (i < len) {
            const ch = content[i];
            const next = content[i + 1];

            if (inLineComment) {
                if (ch === '\n') inLineComment = false;
                i++; continue;
            }
            if (!inSingle && !inDouble && !inBacktick && ch === '/' && next === '/') {
                inLineComment = true; i += 2; continue;
            }
            if (!inSingle && !inDouble && !inBacktick && ch === '/' && next === '*') {
                const end = content.indexOf('*/', i + 2);
                i = end < 0 ? len : end + 2;
                continue;
            }
            if (!inDouble && !inBacktick && ch === "'" && content[i - 1] !== '\\') { inSingle = !inSingle; i++; continue; }
            if (!inSingle && !inBacktick && ch === '"' && content[i - 1] !== '\\') { inDouble = !inDouble; i++; continue; }
            if (!inSingle && !inDouble && ch === '`' && content[i - 1] !== '\\') { inBacktick = !inBacktick; i++; continue; }
            if (inSingle || inDouble || inBacktick) { i++; continue; }

            if (ch === '{') depth++;
            else if (ch === '}') {
                depth--;
                if (depth === 0) return i + 1;
            }
            i++;
        }
        return -1;
    }

    /**
     * HEUR-COMPLETE-QUIZ-PCT: ModuleProgress.completeQuiz() raw-score bug.
     *
     * The bug: client-graded quizzes compute both `score` (raw correct count,
     * e.g. 12) and `pct` (percentage, e.g. 80), then pass `score` as the 3rd
     * arg to completeQuiz(). Inside completeQuiz, the check
     *     if (score >= passingScore) { mark complete }
     * evaluates `12 >= 70 = false`, so completion is never persisted —
     * student passes the visible quiz but progress silently doesn't save.
     *
     * Detection (file-scoped, conservative — minimizes false positives):
     *   1) File contains a `var pct = Math.round(...)` (or `let pct`/`const pct`)
     *      expression — i.e. the file computes a percentage variable.
     *   2) File contains a `ModuleProgress.completeQuiz(house, id, X)` call
     *      where X is NOT one of: `pct`, `percent`, `percentage`, an integer
     *      literal >= 70, or an expression containing `Math.round(`.
     *
     * If both hold, fire HIGH. The (1) precondition is the critical false-positive
     * guard: a quiz that already passes the bare percentage as an inline expression
     * (or as a constant, or via a different variable name like `percentScore`)
     * doesn't compute a `pct` var, so won't get flagged.
     *
     * @param {Object} file - { path, content }
     * @returns {Array} Issues found
     */
    checkCompleteQuizPctArg(file) {
        const issues = [];
        const content = file.content;

        // Only quiz HTML — narrows scope and excludes hub/index pages.
        if (!file.path.endsWith('.html')) return issues;
        if (!/\.quiz\.html$/.test(file.path) && !/\.exam\.html$/.test(file.path)) return issues;

        // Must call ModuleProgress.completeQuiz at all.
        if (!content.includes('ModuleProgress.completeQuiz')) return issues;

        // Precondition: file declares a `pct` variable as a percentage.
        // Conservative — only var/let/const pct = Math.round(...) qualifies.
        const pctVarPattern = /\b(?:var|let|const)\s+pct\s*=\s*Math\.round\s*\(/;
        if (!pctVarPattern.test(content)) return issues;

        // Walk every completeQuiz(...) call and inspect the 3rd arg.
        const callPattern = /ModuleProgress\.completeQuiz\s*\(([^)]*(?:\([^)]*\)[^)]*)*)\)/g;
        let match;
        while ((match = callPattern.exec(content)) !== null) {
            const argsStr = match[1];
            const line = this.getLineNumber(content, match.index);

            // Skip lines that are commented or in alert strings.
            const lineStart = content.lastIndexOf('\n', match.index) + 1;
            const lineEnd = content.indexOf('\n', match.index);
            const lineText = content.substring(lineStart, lineEnd === -1 ? content.length : lineEnd);
            const trimmed = lineText.trim();
            if (trimmed.startsWith('//') || trimmed.startsWith('*')) continue;

            // Split args with the existing brace/paren/quote-aware helper.
            const args = this._splitArgs(argsStr);
            if (args.length < 3) continue; // 2-arg form is a different code path

            const thirdArg = args[2].trim();

            // Whitelist of acceptable 3rd-arg shapes — all of these mean
            // a percentage is already being passed.
            const okIdentifiers = /^(pct|percent|percentage)$/;
            if (okIdentifiers.test(thirdArg)) continue;
            if (/^Math\.round\s*\(/.test(thirdArg)) continue;

            // Integer literal >= 70 is a hardcoded passing percentage — likely
            // a test stub or intentional hard-pass. Accept as not-the-bug.
            const intLitMatch = thirdArg.match(/^(\d+)$/);
            if (intLitMatch) {
                const n = parseInt(intLitMatch[1], 10);
                if (n >= 70) continue;
            }

            // Anything else (a bare identifier like `score`, or `numCorrect`,
            // or `result`) is the bug. Surface the offending arg text.
            issues.push({
                code: 'HEUR-COMPLETE-QUIZ-PCT',
                severity: 'high',
                category: 'completion-tracking',
                message: `ModuleProgress.completeQuiz() 3rd arg is "${thirdArg}" but file computes a "pct" percentage variable. completeQuiz expects a PERCENTAGE; passing a raw score makes the internal "score >= passingScore" check (e.g., 12 >= 70) fail and completion never persists.`,
                file: file.path,
                line,
                fix: `Change the 3rd arg to "pct" (the percentage you already computed). Example: ModuleProgress.completeQuiz('<house>', '<id>', pct, { returnToDashboard: false })`
            });
        }

        return issues;
    }

    /**
     * HEUR-RESULT-BUTTON-STANDARD: Pre-standard quiz result buttons.
     *
     * The new quiz result-card standard is:
     *   - A `[Review Answers]` button wired to showReviewAnswers()
     *   - A `[Return to Hub]` link in .results-btns
     *   - A sibling `#reviewCard` div + backToScore() function for the
     *     per-question Review Answers view.
     *
     * The pre-standard pattern used a `[Try Again]` button calling
     * restartQuiz() and a `Back to <Course> Hub` link. This rule flags both
     * shapes so the migration sweep finishes consistently.
     *
     * MIXED-STATE NOTE: a results-card that already has "Review Answers"
     * text but still retains either old button still flags — it indicates
     * an incomplete migration, not a clean state.
     *
     * @param {Object} file - { path, content }
     * @returns {Array} Issues found
     */
    checkResultButtonStandard(file) {
        const issues = [];
        const content = file.content;

        // Only quiz HTML — exam HTMLs follow a similar pattern but we limit
        // scope per spec to .quiz.html files.
        if (!file.path.endsWith('.html')) return issues;
        if (!/\.quiz\.html$/.test(file.path) && !/\.exam\.html$/.test(file.path)) return issues;

        // Must contain a .results-card block to be relevant.
        if (!content.includes('results-card')) return issues;

        // Find every <div ... class="results-card" ...> opening tag (single or
        // double-quoted), then walk forward with a depth counter to find its
        // matching </div>. Nested divs (.score-big, .results-btns, etc.) are
        // common inside .results-card and a non-greedy regex would close on the
        // first inner </div>, missing the buttons entirely.
        const openPattern = /<div([^>]*class=(?:"[^"]*\bresults-card\b[^"]*"|'[^']*\bresults-card\b[^']*')[^>]*)>/g;
        let openMatch;
        while ((openMatch = openPattern.exec(content)) !== null) {
            const headerAttrs = openMatch[1];
            const cardLine = this.getLineNumber(content, openMatch.index);

            // Skip the reviewCard sibling — it's the per-question review view
            // and is allowed to have a "Back to Score" button by design.
            if (/id=(?:"reviewCard"|'reviewCard')/.test(headerAttrs)) continue;

            // Walk forward tracking <div> depth to find the matching </div>.
            const start = openMatch.index + openMatch[0].length;
            const divTag = /<\/?div\b[^>]*>/g;
            divTag.lastIndex = start;
            let depth = 1;
            let endIdx = -1;
            let tagMatch;
            while ((tagMatch = divTag.exec(content)) !== null) {
                if (tagMatch[0].startsWith('</')) {
                    depth--;
                    if (depth === 0) { endIdx = tagMatch.index; break; }
                } else {
                    depth++;
                }
            }
            if (endIdx === -1) continue; // unbalanced — skip rather than mis-flag
            const inner = content.substring(start, endIdx);

            // Old-pattern: <button onclick="restartQuiz()">Try Again</button>
            const tryAgainPattern = /<button[^>]*onclick="restartQuiz\(\)"[^>]*>\s*Try Again\s*<\/button>/i;
            const hasTryAgain = tryAgainPattern.test(inner);

            // Old-pattern: <a class="btn-hub">Back to <something> Hub</a>
            const backToHubPattern = /<a[^>]*class="[^"]*\bbtn-hub\b[^"]*"[^>]*>\s*Back to\s+[^<]*\bHub\s*<\/a>/i;
            const hasBackToHub = backToHubPattern.test(inner);

            if (!hasTryAgain && !hasBackToHub) continue;

            // Detect mixed state — already has Review Answers text but still
            // carries an old button. That's a partial migration; still flag.
            const hasReviewAnswers = /Review Answers/.test(inner);
            const issueParts = [];
            if (hasTryAgain) issueParts.push('"Try Again" button (calls restartQuiz())');
            if (hasBackToHub) issueParts.push('"Back to ... Hub" link');

            issues.push({
                code: 'HEUR-RESULT-BUTTON-STANDARD',
                severity: 'medium',
                category: 'ux-drift',
                message: `Quiz .results-card uses pre-standard buttons: ${issueParts.join(' + ')}.${hasReviewAnswers ? ' Also contains "Review Answers" — mixed-state, incomplete migration.' : ''} Standard is [Review Answers] (showReviewAnswers()) + [Return to Hub].`,
                file: file.path,
                line: cardLine,
                fix: 'Replace with: <button class="btn-retry" onclick="showReviewAnswers()">Review Answers</button> and <a href="../index.html" class="btn-hub">Return to Hub</a>. Add a sibling #reviewCard div + showReviewAnswers()/backToScore() functions. Exemplar: _app/houses/divergent/ethics-it/quizzes/eth-w1.quiz.html lines 439-456.'
            });
        }

        return issues;
    }

    getLineNumber(content, position) {
        return content.substring(0, position).split('\n').length;
    }

    /**
     * HEUR-031: Empty slide-text wrapper. Slide page has
     * <div class="slide-text">...</div> with <20 chars of non-whitespace
     * content. The wrapper exists structurally but the text half of the
     * Venn-diagram slide design got lost during an edit.
     */
    checkEmptySlideText(file) {
        const issues = [];
        const content = file.content;
        if (!content) return issues;
        if (!content.includes('class="slide-text"')) return issues;

        // Match each <div class="slide-text">...</div>, depth-aware via greedy
        // match of inner content up to the next </div> at sibling depth. Since
        // .slide-text wraps text only (no nested divs in practice), the simple
        // first-</div> match is correct.
        const re = /<div class="slide-text">([\s\S]*?)<\/div>\s*<div class="slide-visual"/g;
        let m;
        while ((m = re.exec(content)) !== null) {
            // Strip tags + whitespace to count actual text/code content
            const stripped = m[1].replace(/<[^>]+>/g, '').replace(/\s/g, '');
            if (stripped.length < 20) {
                issues.push({
                    code: 'HEUR-031',
                    severity: 'critical',
                    category: 'heuristic',
                    message: `Empty slide-text wrapper (${stripped.length} chars of actual content). Text half of the slide is missing.`,
                    file: file.path,
                    line: this.getLineNumber(content, m.index),
                    fix: 'Restore the original text content inside the <div class="slide-text"> wrapper. Compare to a known-good slide pattern or to a prior commit.'
                });
            }
        }
        return issues;
    }

    /**
     * HEUR-032: Broken webp icon reference. HTML cites
     * /assets/images/icons/icon-NAME.webp where NAME.webp does not exist
     * on disk under _app/assets/images/icons/. Caused visible broken-image
     * fallback in slide titles (icon-checklist vs icon-checkbox).
     */
    checkBrokenIconRefs(file) {
        const issues = [];
        const content = file.content;
        if (!content) return issues;

        const refs = [...content.matchAll(/\/assets\/images\/icons\/(icon-[a-z0-9-]+\.webp)/gi)];
        if (refs.length === 0) return issues;

        const iconsDir = path.resolve(this.rootPath, 'assets/images/icons');
        const seen = new Set();
        for (const r of refs) {
            const name = r[1];
            if (seen.has(name)) continue;
            seen.add(name);
            const absPath = path.join(iconsDir, name);
            if (!fs.existsSync(absPath)) {
                issues.push({
                    code: 'HEUR-032',
                    severity: 'high',
                    category: 'heuristic',
                    message: `Icon file does not exist: ${name} (referenced in this file but not present in _app/assets/images/icons/).`,
                    file: file.path,
                    line: this.getLineNumber(content, r.index),
                    fix: `Check the icons directory for the closest match (singular vs plural, synonyms). Common fixes: icon-checklist → icon-checkbox; icon-gears → icon-gear.`
                });
            }
        }
        return issues;
    }

    /**
     * HEUR-033: SVG width-% keyframe overflow. @keyframes contains
     * width: <num>% or width: 100%, and the applying class is used on
     * a <rect> or <line> inside an inline <svg>. SVG percentage widths
     * resolve to viewBox root, not the parent container, so the animated
     * element overflows. Fix is transform: scaleX with transform-origin.
     */
    checkSvgWidthPercentKeyframe(file) {
        const issues = [];
        const content = file.content;
        if (!content) return issues;
        if (!content.includes('<svg')) return issues;

        // Find @keyframes blocks that animate width to a percentage
        const kfRe = /@keyframes\s+([a-zA-Z0-9_-]+)\s*\{([\s\S]*?)\}\s*(?=@keyframes|\.|\/\*|<\/style>)/g;
        const offendingKeyframes = [];
        let m;
        while ((m = kfRe.exec(content)) !== null) {
            const body = m[2];
            if (/width:\s*\d+%/.test(body)) {
                offendingKeyframes.push(m[1]);
            }
        }
        if (offendingKeyframes.length === 0) return issues;

        // For each offending keyframe, find any class that applies it
        // (animation: KFNAME ...) then check if that class is used on
        // an SVG <rect>/<line> element.
        for (const kfName of offendingKeyframes) {
            // Find classes that use this keyframe name
            const classRe = new RegExp('\\.([a-zA-Z0-9_-]+)\\s*\\{[^}]*animation:[^}]*\\b' + kfName + '\\b[^}]*\\}', 'g');
            let cm;
            while ((cm = classRe.exec(content)) !== null) {
                const className = cm[1];
                // Now look for <rect|<line ... class="...className..." inside an svg
                const svgUsageRe = new RegExp('<(rect|line)\\b[^>]*class="[^"]*\\b' + className + '\\b[^"]*"', 'g');
                let svgMatch;
                while ((svgMatch = svgUsageRe.exec(content)) !== null) {
                    issues.push({
                        code: 'HEUR-033',
                        severity: 'medium',
                        category: 'heuristic',
                        message: `SVG <${svgMatch[1]}> uses class .${className} whose @keyframes ${kfName} animates width to a percentage. Width % on SVG primitives resolves to viewBox root, not container — element overflows.`,
                        file: file.path,
                        line: this.getLineNumber(content, svgMatch.index),
                        fix: `Change the @keyframes to use transform: scaleX(0) → scaleX(1) instead of width 0 → 100%. Add transform-origin: left and transform-box: fill-box to the class.`
                    });
                }
            }
        }
        return issues;
    }

    /**
     * HEUR-034: Infinite opacity 0→1 keyframe causes flicker.
     * @keyframes starts at opacity: 0 and ends at opacity: 1, AND the
     * applying class declares animation: ... infinite. Each loop resets
     * opacity to 0 then fades back in — visible flicker on every cycle.
     */
    checkInfiniteOpacityFlicker(file) {
        const issues = [];
        const content = file.content;
        if (!content) return issues;

        const kfRe = /@keyframes\s+([a-zA-Z0-9_-]+)\s*\{([\s\S]*?)\}\s*(?=@keyframes|\.|\/\*|<\/style>)/g;
        const fadeInKeyframes = [];
        let m;
        while ((m = kfRe.exec(content)) !== null) {
            const body = m[2];
            // Match 0% { ... opacity: 0 ... } and 100% { ... opacity: 1 ... }
            // Allow either keyword "from"/"to" or "0%"/"100%".
            // Lookahead (?![\d.]) — NOT (?:\b|[^.\d]): \b matches the digit-to-dot
            // boundary inside "opacity: 0.8", so the old guard false-matched every
            // decimal opacity as 0/1 and flagged intentional pulse animations
            // (298-finding false-positive class, marathon 2026-07-28, task #228 item 7).
            // (?<!\d) — a bare '0%' also matches inside '50%'/'40%' (that plus the
            // decimal bug is exactly how dotPulse's '50% { opacity: 0.8 }' fired).
            const startsZero = /(?<!\d)(?:from|0%)[^{]*\{[^}]*opacity:\s*0(?![\d.])/.test(body);
            const endsOne = /(?<!\d)(?:to|100%)[^{]*\{[^}]*opacity:\s*1(?![\d.])/.test(body);
            if (startsZero && endsOne) {
                fadeInKeyframes.push(m[1]);
            }
        }
        if (fadeInKeyframes.length === 0) return issues;

        for (const kfName of fadeInKeyframes) {
            const classRe = new RegExp('\\.([a-zA-Z0-9_-]+)\\s*\\{[^}]*animation:[^}]*\\b' + kfName + '\\b[^}]*\\binfinite\\b[^}]*\\}', 'g');
            let cm;
            while ((cm = classRe.exec(content)) !== null) {
                const className = cm[1];
                issues.push({
                    code: 'HEUR-034',
                    severity: 'medium',
                    category: 'heuristic',
                    message: `Class .${className} applies @keyframes ${kfName} (opacity 0 → 1) with animation: infinite. Each loop resets opacity to 0 causing a fade-in/fade-out flicker.`,
                    file: file.path,
                    line: this.getLineNumber(content, cm.index),
                    fix: `Change animation timing to 'forwards' instead of 'infinite' so the animation runs once and stays in its end state. Add 'opacity: 0' to the class as initial state.`
                });
            }
        }
        return issues;
    }

    /**
     * HEUR-035: Em-dash character in content. Per user style preference,
     * the em-dash (U+2014) should not appear in HTML text content.
     * Skips <style>, <script>, and code-block contexts where it may be
     * intentional. Going-forward enforcement — legacy content can be
     * allowlisted via per-rule allowlist if needed.
     */
    checkEmDashContent(file) {
        const issues = [];
        const content = file.content;
        if (!content) return issues;

        // Strip <style>, <script>, and elements with class containing "code-block" or pre tags
        const stripped = content
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<pre[\s\S]*?<\/pre>/gi, '')
            .replace(/<div class="code-block"[\s\S]*?<\/div>/gi, '')
            .replace(/<code[\s\S]*?<\/code>/gi, '');

        if (!stripped.includes('—')) return issues;
        const count = (stripped.match(/—/g) || []).length;

        // Find first occurrence position (in original content) for line number
        const firstPos = content.indexOf('—');
        issues.push({
            code: 'HEUR-035',
            severity: 'low',
            category: 'heuristic',
            message: `Em-dash character (—) used ${count} time(s) in content. Per style preference, use commas, colons, or periods instead.`,
            file: file.path,
            line: this.getLineNumber(content, firstPos),
            fix: `Replace " — " (em-dash with surrounding spaces) with ", " (comma) for clause separation, or ": " (colon) when introducing an explanation.`
        });
        return issues;
    }

    /**
     * HEUR-040: Duplicate attribute on the document root <html> tag. A
     * duplicate attribute (e.g. `<html lang="en" lang="en">`) is an HTML parse
     * error; browsers silently keep the first and discard the rest, so it
     * renders fine but is invalid and signals a buggy generator or fix-script
     * that added an attribute without guarding an existing one (BUG-019 was a
     * one-off lang-adder doing exactly this across 10 pages).
     *
     * Only the document's root <html> tag is inspected. HTML comments are
     * blanked FIRST, so a comment BEFORE the root tag containing example markup
     * — e.g. `<!-- was: <html lang="en" lang="en"> -->`, plausible given this
     * repo just fixed BUG-019 — cannot make the match fire on the comment
     * instead of the valid root (Nancy, task #212; 8 corpus files carry a
     * leading comment today). After comment-blanking, the FIRST "<html" is the
     * real root: any occurrence AFTER it lives in body content, a string, or a
     * template literal (a lab's simulated page), never a 2nd root element —
     * the same false-positive-avoidance lesson as task #208.
     *
     * Known limitations (deliberate — this is a targeted root-tag check, not a
     * general duplicate-attribute detector): (a) only attributes in `name=`
     * form are considered, so a duplicated BOOLEAN attribute (`<html itemscope
     * itemscope>`) is not flagged; (b) an attribute value containing a literal
     * `>` truncates the tag capture and can silently miss a downstream dup —
     * not a concern for real <html> tags, whose attributes never carry `>`.
     */
    checkDuplicateRootHtmlAttr(file) {
        const issues = [];
        const content = file.content;
        if (!content) return issues;

        // Blank HTML comments first (length/line-preserving, so the match
        // index still maps to the original content for getLineNumber). This
        // removes any leading-comment example markup before the real root tag.
        const { stripHtmlComments } = require('../../utils/strip-noncode.js');
        const scan = stripHtmlComments(content);

        // Grab the document's first (root) <html ...> opening tag only.
        const tagMatch = scan.match(/<html\b([^>]*)>/i);
        if (!tagMatch) return issues;

        // Blank quoted attribute VALUES first so a value that itself contains
        // an '=' (e.g. class="a=b") can't be misread as another attribute,
        // then collect the attribute names that precede an '='.
        const attrText = tagMatch[1]
            .replace(/=\s*"[^"]*"/g, '=""')
            .replace(/=\s*'[^']*'/g, "=''");
        const names = (attrText.match(/([-a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=/g) || [])
            .map(s => s.replace(/\s*=$/, '').toLowerCase());

        // Any attribute name appearing more than once on the root tag is a dup.
        const seen = new Set();
        const dups = new Set();
        for (const n of names) {
            if (seen.has(n)) dups.add(n);
            else seen.add(n);
        }

        if (dups.size > 0) {
            const line = this.getLineNumber(content, tagMatch.index);
            issues.push({
                code: 'HEUR-040',
                severity: 'low',
                category: 'heuristic',
                message: `Root <html> tag has duplicate attribute(s): ${[...dups].join(', ')}. Invalid HTML (browsers keep the first and discard the rest) — usually a generator or fix-script that added an attribute without guarding an existing one.`,
                file: file.path,
                line,
                fix: `Remove the duplicate ${[...dups].join(', ')} attribute so the <html> tag declares each attribute once.`
            });
        }
        return issues;
    }

    /**
     * HEUR-036: has-visual class without visual element. Slide has
     * class="slide has-visual" but the inner <div class="slide-visual">
     * contains neither an <svg> nor an <img> element. Companion to
     * HEUR-031 (empty text); indicates a partially-built slide where
     * the visual half is missing.
     *
     * Broadened 2026-06-09 (rich-render swap): WSA modules now use
     * <img src=".../wsa-visuals/.../*.webp"> in place of inline <svg>.
     * Rule accepts either tag as a valid visual.
     *
     * Known gap: no validator confirms that a referenced webp under
     * /assets/images/wsa-visuals/ actually exists on disk. HEUR-032
     * only covers icon-*.webp paths. A future author could reference
     * a non-existent webp file and pass HEUR-036 silently.
     */
    checkHasVisualWithoutSvg(file) {
        const issues = [];
        const content = file.content;
        if (!content) return issues;
        if (!content.includes('has-visual')) return issues;

        // Find each slide with has-visual class and check its slide-visual child
        const slideRe = /<div class="slide(?:\s+active)?\s+has-visual"[^>]*data-slide="(\d+)"[\s\S]*?<div class="slide-visual">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>/g;
        let m;
        while ((m = slideRe.exec(content)) !== null) {
            const slideNum = m[1];
            const visualInner = m[2];
            // \b boundary ensures <img\b matches <img> but not <image> (SVG element)
            if (!/<svg\b/i.test(visualInner) && !/<img\b/i.test(visualInner)) {
                issues.push({
                    code: 'HEUR-036',
                    severity: 'medium',
                    category: 'heuristic',
                    message: `Slide ${slideNum} has class "has-visual" but its <div class="slide-visual"> contains neither an <svg> nor an <img> element. Visual half of the slide is missing.`,
                    file: file.path,
                    line: this.getLineNumber(content, m.index),
                    fix: `Add either an inline <svg> visualization or an <img src=".../*.webp"> reference inside the .slide-visual wrapper, or remove the has-visual class if the slide is intentionally text-only.`
                });
            }
        }
        return issues;
    }

    /**
     * HEUR-038: WSA presentation slide-layout contract violation.
     *
     * Cat-contract (verified against m01 + m02 source 2026-06-06):
     *   • .slide-container rule contains: flex:1, min-height:0, display:flex, flex-direction:column
     *   • .slide rule contains: flex:1, min-height:0; lacks: border-radius, border:1px solid, fixed min-height:Npx
     *   • .slide-content rule contains: flex:1, min-height:0
     *   • !important count in file = 0
     *   • file contains NONE of these breed-marker tokens: text-visual-grid,
     *     tv-text, tv-visual, presentation-container, slide-area, slide-header,
     *     page-header (cat uses .slide.has-visual + .slide-text + .slide-visual
     *     + .header + .slide-container; any of the forbidden tokens means
     *     a different breed structurally even if the four outer rules match)
     *
     * Not-cat → single HIGH per file listing every failed fingerprint
     * (Option A — surgery to fix is a coordinated transform per file).
     *
     * Scope guard: WSA only for now (files under
     * _app/houses/cloud/modules/wsa/ named cloud-presentation.module.html).
     * Pattern may generalize to other course presentations later — held
     * narrow until proven.
     *
     * Reference fixtures (must PASS forever): m01-fundamentals,
     * m02-active-directory.
     *
     * Known limitations:
     *   - getRule() uses [^}]* — won't match if a rule body contains a
     *     literal `}` (e.g., nested via Sass). m01/m02 are flat CSS.
     *   - getRule() picks FIRST occurrence. m01/m02 main rules precede
     *     @media overrides; first-match is correct.
     *   - `flex: 1` substring match would false-fail on `flex: 1 1 0%`
     *     longhand. Current cat files use verbatim `flex: 1`.
     *   - !important counter does not exclude prose comments containing
     *     the literal word; no current occurrences in cat fixtures.
     */
    checkWsaSlideLayoutContract(file) {
        const issues = [];
        const content = file.content;
        if (!content) return issues;

        const filePath = file.path || '';
        if (!filePath.includes('/houses/cloud/modules/wsa/')) return issues;
        if (!filePath.endsWith('/cloud-presentation.module.html')) return issues;

        // Helper: extract a CSS rule block by literal selector match.
        // Matches `<selector> { ... }` with non-`}` body. Won't match
        // combined selectors (e.g., `.a, .b { ... }`) — by design: a
        // file using combined selectors instead of a clean dedicated
        // rule IS a contract violation.
        function getRule(selector) {
            const esc = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const re = new RegExp(esc + '\\s*\\{([^}]*)\\}');
            const m = content.match(re);
            return m ? m[1] : null;
        }

        const failures = [];

        // Fingerprint 1: .slide-container flex contract
        const containerBlock = getRule('.slide-container');
        if (!containerBlock) {
            failures.push('.slide-container rule missing or uses combined selector');
        } else {
            const needs = ['flex: 1', 'min-height: 0', 'display: flex', 'flex-direction: column'];
            const missing = needs.filter(n => !containerBlock.includes(n));
            if (missing.length) failures.push('.slide-container missing: ' + missing.join(', '));
        }

        // Fingerprint 2: .slide flex contract + no card aesthetic
        const slideBlock = getRule('.slide');
        if (!slideBlock) {
            failures.push('.slide rule missing or uses combined selector');
        } else {
            const needs = ['flex: 1', 'min-height: 0'];
            const missing = needs.filter(n => !slideBlock.includes(n));
            if (missing.length) failures.push('.slide missing: ' + missing.join(', '));
            if (/border-radius\s*:/.test(slideBlock)) failures.push('.slide has forbidden border-radius (card aesthetic)');
            if (/border\s*:\s*1px\s+solid/.test(slideBlock)) failures.push('.slide has forbidden border:1px solid');
            const mh = slideBlock.match(/min-height\s*:\s*(\d+)(px|rem|em|vh)/);
            if (mh && mh[1] !== '0') failures.push('.slide has forbidden fixed min-height: ' + mh[0]);
        }

        // Fingerprint 3: .slide-content flex contract
        const contentBlock = getRule('.slide-content');
        if (!contentBlock) {
            failures.push('.slide-content rule missing or uses combined selector');
        } else {
            const needs = ['flex: 1', 'min-height: 0'];
            const missing = needs.filter(n => !contentBlock.includes(n));
            if (missing.length) failures.push('.slide-content missing: ' + missing.join(', '));
        }

        // Fingerprint 4: !important count = 0
        const importantCount = (content.match(/!important/g) || []).length;
        if (importantCount > 0) failures.push('!important count: ' + importantCount + ' (expected 0)');

        // Fingerprint 5: forbidden breed-marker tokens. Cat (m01/m02) uses
        // .slide.has-visual + .slide-text + .slide-visual + .header +
        // .slide-container. Any of these tokens marks a different breed:
        const breedMarkers = [
            'text-visual-grid', 'tv-text', 'tv-visual',
            'presentation-container', 'slide-area', 'slide-header', 'page-header'
        ];
        const breedHits = breedMarkers.filter(tok => content.includes(tok));
        if (breedHits.length) failures.push('breed-marker tokens present: ' + breedHits.join(', '));

        if (failures.length) {
            issues.push({
                code: 'HEUR-038',
                severity: 'high',
                category: 'heuristic',
                message: 'WSA slide-layout contract violation — file does not match m01/m02 cat-fingerprint. Failed: ' + failures.join(' | '),
                file: file.path,
                line: 1,
                fix: 'Match m02 contract: .slide-container { flex:1; min-height:0; display:flex; flex-direction:column; position:relative; overflow:hidden; }, .slide { display:none; flex:1; min-height:0; padding:14px 36px; box-sizing:border-box; overflow:hidden; }, .slide-content { width:100%; max-width:1400px; flex:1; min-height:0; overflow:hidden; }, zero !important. Reference: _app/houses/cloud/modules/wsa/m02-active-directory/cloud-presentation.module.html'
            });
        }

        return issues;
    }

    /**
     * HEUR-039: WSA cat-contract `.has-visual .slide-text` content budget.
     *
     * Static companion to OVERFLOW-001b. Empirically, the cat-contract
     * has-visual layout (2-column grid at 1280×720) provides ~217px of
     * vertical space in `.slide-text`. Content authored above ~600 chars
     * (excluding markup/whitespace) reliably clips.
     *
     * Threshold derivation (verified against m01/m02 + classifier 2026-06-07):
     *   - m02 slide 18: 558 chars, 0px overflow (highest safe)
     *   - m02 slide 19: 634 chars, +39px (boundary, tolerable)
     *   - m01 slide 1: 968 chars, +14px (boundary, font-rendering grace)
     *   - m11-iis slide 7: 1368 chars, +1241px (representative bad case)
     *
     * Importantly, m01/m02 ARE the reference fixtures for HEUR-038 (CSS
     * contract) but they have content overflows too — HEUR-039 will fire
     * on ~10-11 slides each for m01/m02. The two rules are independent.
     *
     * Scope: same as HEUR-038 (WSA cloud-presentation.module.html only).
     */
    checkWsaHasVisualTextBudget(file) {
        const issues = [];
        const content = file.content;
        if (!content) return issues;

        const filePath = file.path || '';
        if (!filePath.includes('/houses/cloud/modules/wsa/')) return issues;
        if (!filePath.endsWith('/cloud-presentation.module.html')) return issues;

        const THRESHOLD = 600;

        // Balanced-div close: scans forward from `start`, returning the
        // index of the matching </div> (or -1). Counts <div> opens and
        // </div> closes in source order. Cat-contract files have clean
        // structure (HEUR-038 enforces) so this is safe.
        function findDivClose(s, start) {
            let depth = 1;
            const re = /<div\b|<\/div>/gi;
            re.lastIndex = start;
            let m;
            while ((m = re.exec(s)) !== null) {
                if (m[0].toLowerCase() === '</div>') {
                    depth--;
                    if (depth === 0) return m.index;
                } else {
                    depth++;
                }
            }
            return -1;
        }

        // Strip text content from an HTML fragment. Removes <script>/<style>
        // first (they contain non-prose tokens that would skew the count),
        // then all tags, then decodes common entities, then collapses ws.
        function extractText(html) {
            return html
                .replace(/<script\b[\s\S]*?<\/script>/gi, '')
                .replace(/<style\b[\s\S]*?<\/style>/gi, '')
                .replace(/<[^>]+>/g, ' ')
                .replace(/&nbsp;/g, ' ')
                .replace(/&amp;/g, '&')
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '"')
                .replace(/&#?\w+;/g, '')
                .replace(/\s+/g, ' ')
                .trim();
        }

        // Match top-level slide div opens. Class attr starts with "slide"
        // bounded by quote or space (excludes .slide-text/.slide-visual/etc).
        const slideRe = /<div\b([^>]*\bclass="slide(?:\s[^"]*)?")[^>]*>/g;
        let m;
        let slideIndex = 0;

        while ((m = slideRe.exec(content)) !== null) {
            slideIndex++;
            const classAttr = m[1];

            // Tightened token boundary — prevents hypothetical
            // `has-visual-*` prefix-substring false positives (per Nancy).
            // Extracts the quoted class value first, then checks tokens.
            const classValueMatch = classAttr.match(/class="([^"]*)"/);
            const classValue = classValueMatch ? classValueMatch[1] : '';
            if (!/(?:^|\s)has-visual(?:\s|$)/.test(classValue)) continue;

            // Extract data-slide for human-friendly label (may be absent
            // on non-redesigned modules — fall back to slideIndex).
            const dsMatch = m[0].match(/data-slide="([^"]*)"/);
            const dataSlide = dsMatch ? dsMatch[1] : null;

            // Balanced-extract this slide's body
            const slideBodyStart = m.index + m[0].length;
            const slideBodyEnd = findDivClose(content, slideBodyStart);
            if (slideBodyEnd === -1) continue;
            const slideHtml = content.slice(slideBodyStart, slideBodyEnd);

            // Find .slide-text within this slide body
            const stRe = /<div\b[^>]*\bclass="slide-text(?:\s[^"]*)?"[^>]*>/;
            const stMatch = slideHtml.match(stRe);
            if (!stMatch) continue;

            const stBodyStart = stMatch.index + stMatch[0].length;
            const stBodyEnd = findDivClose(slideHtml, stBodyStart);
            if (stBodyEnd === -1) continue;
            const slideTextHtml = slideHtml.slice(stBodyStart, stBodyEnd);

            const chars = extractText(slideTextHtml).length;

            if (chars > THRESHOLD) {
                const slideLabel = dataSlide && dataSlide !== String(slideIndex)
                    ? `Slide ${slideIndex} (data-slide="${dataSlide}")`
                    : `Slide ${slideIndex}`;
                issues.push({
                    code: 'HEUR-039',
                    severity: 'high',
                    category: 'heuristic',
                    // Stable dedup identifier (per Nancy): slideIndex is
                    // structural position in source, not content-derived,
                    // so partial-trim edits don't generate ghost findings.
                    line: slideIndex,
                    file: filePath,
                    message: `${slideLabel} .slide-text contains ${chars} chars (budget ${THRESHOLD}). Cat-contract has-visual layout will clip content at 1280×720.`,
                    fix: `Reduce ${slideLabel} .slide-text content to ≤${THRESHOLD} chars, or split slide into two slides at a topic boundary. Cat-contract two-column grid gives ~217px tall text column at 1280×720; text above the budget clips silently (overflow:hidden on .slide). Companion rule OVERFLOW-001b confirms at render time.`
                });
            }
        }

        return issues;
    }
}

module.exports = HeuristicsValidator;
