/**
 * EduScan - Slide Overflow Detector for Cat-Contract Modules (OVERFLOW-001b)
 *
 * Companion to OVERFLOW-001. OVERFLOW-001 scopes to *.presentation.html and
 * measures .slide directly. That works for legacy presentations but silently
 * misses content overflow on WSA cat-contract modules because:
 *   (a) WSA files are named *.cloud-presentation.module.html (out of scope)
 *   (b) cat-contract sets overflow:hidden on .slide, capping scrollHeight
 *       at clientHeight — real overflow lives in inner .slide-content
 *
 * This rule:
 *   - scopes to *.cloud-presentation.module.html
 *   - activates each .slide via classList (matches student-visible state)
 *   - measures the inner .slide-content scrollHeight vs clientHeight
 *   - skips (counts) slides missing .slide-content (not cat-contract)
 *
 * Viewport 1280×720 per reference_design_choices_log.md. AccessGuard bypass
 * via localStorage seed (matches OVERFLOW-001 + smoke tests). +2px tolerance
 * matches OVERFLOW-001 for sub-pixel rounding.
 *
 * Severity: high (matches HEUR-038 — both are correctness failures on the
 * same cat-contract file class, and TRIAGE_SEVERITY_GATE in nexus/publish.js
 * gates on critical+high only).
 */

const path = require('path');

const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 720;

class SlideOverflowCatChecker {
    constructor(options = {}) {
        this.browserPool = options.browserPool;
        this.rootPath = options.rootPath;
        this.verbose = options.verbose || false;
    }

    async check(htmlFiles) {
        const issues = [];
        const catFiles = htmlFiles.filter(f =>
            f.relativePath.endsWith('cloud-presentation.module.html')
        );

        if (this.verbose) {
            console.log(`[OVERFLOW-cat] Checking ${catFiles.length} cat-contract files at ${VIEWPORT_WIDTH}×${VIEWPORT_HEIGHT}`);
        }

        let scanned = 0, withOverflow = 0, missingContract = 0;

        for (const file of catFiles) {
            const result = await this._checkOne(file);
            if (result === null) continue;  // file errored on getPage
            scanned++;
            if (result.issues.length > 0) {
                issues.push(...result.issues);
                withOverflow++;
            }
            missingContract += result.missingContract;
        }

        return {
            issues,
            summary: { scanned, withOverflow, missingContract }
        };
    }

    async _checkOne(file) {
        let pageWrapper;
        try {
            pageWrapper = await this.browserPool.getPage();
        } catch (e) {
            return null;
        }
        const { page } = pageWrapper;

        const issues = [];
        let missingContract = 0;

        try {
            await page.setViewport({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });
            // Seed localStorage to bypass AccessGuard.require('sorted') —
            // presentations gate behind sorting state. hexworth_sorted is kept
            // for parity with OVERFLOW-001 (only hexworth_house actually gates
            // AccessGuard.isSorted() per current code).
            await page.evaluateOnNewDocument(() => {
                try { localStorage.setItem('hexworth_house', 'web'); } catch (_) {}
                try { localStorage.setItem('hexworth_sorted', 'true'); } catch (_) {}
            });
            await page.goto(`file://${file.absolutePath}`, {
                waitUntil: 'domcontentloaded',
                timeout: 5000
            });
            await new Promise(r => setTimeout(r, 400));

            const result = await page.evaluate(() => {
                const slides = Array.from(document.querySelectorAll('.slide'));
                if (!slides.length) return { overflows: [], missingContract: 0 };

                const overflows = [];
                let missingContract = 0;

                // Snapshot prior .active state for restore
                const priorActive = slides.filter(s => s.classList.contains('active'));

                slides.forEach((slide, idx) => {
                    // Activate ONLY this slide — matches student-visible state.
                    slides.forEach(s => s.classList.remove('active'));
                    slide.classList.add('active');
                    void slide.offsetHeight;  // force reflow

                    const target = slide.querySelector('.slide-content');
                    if (!target) {
                        missingContract++;
                        return;
                    }

                    const scrollH = target.scrollHeight;
                    const clientH = target.clientHeight;
                    if (scrollH > clientH + 2) {  // +2 px matches OVERFLOW-001
                        overflows.push({
                            slideIndex: idx + 1,
                            dataSlide: slide.getAttribute('data-slide') || null,
                            scrollHeight: scrollH,
                            clientHeight: clientH,
                            overflowPx: scrollH - clientH
                        });
                    }
                });

                // Restore prior .active state (defensive — page is closed after
                // this evaluate, but keeps the contract honest for future reuse)
                slides.forEach(s => s.classList.remove('active'));
                priorActive.forEach(s => s.classList.add('active'));

                return { overflows, missingContract };
            });

            for (const o of result.overflows) {
                const slideLabel = o.dataSlide && o.dataSlide !== String(o.slideIndex)
                    ? `Slide ${o.slideIndex} (data-slide="${o.dataSlide}")`
                    : `Slide ${o.slideIndex}`;

                issues.push({
                    code: 'OVERFLOW-001b',
                    severity: 'high',
                    category: 'layout',
                    message: `${slideLabel} inner content overflows .slide-content by ${o.overflowPx}px (rendered ${o.scrollHeight}px in ${o.clientHeight}px container at ${VIEWPORT_WIDTH}×${VIEWPORT_HEIGHT}). Cat-contract sets overflow:hidden on .slide — clipped content is invisible to students.`,
                    file: file.relativePath,
                    line: null,
                    fix: `Split ${slideLabel} into 2+ smaller slides keyed by topic boundary (one concept per slide per slide_design_pattern.md), or reduce content density. The cat-contract clips silently; students lose the bottom ${o.overflowPx}px of every render.`
                });
            }
            missingContract += result.missingContract;

        } catch (e) {
            if (this.verbose) {
                console.log(`[OVERFLOW-cat] ${file.relativePath} failed: ${e.message}`);
            }
        } finally {
            await this.browserPool.releasePage(page);
        }
        return { issues, missingContract };
    }
}

module.exports = SlideOverflowCatChecker;
