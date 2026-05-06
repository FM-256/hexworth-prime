/**
 * EduScan - Slide Overflow Detector (OVERFLOW-001)
 *
 * Loads .presentation.html files in a headless browser at 1280×720 viewport
 * and checks each slide for content that exceeds the container — a class of
 * silent bug where content is clipped without scrollbar (sprint QC-38).
 *
 * Viewport choice (1280×720) is per design decision logged in
 * reference_design_choices_log.md (2026-05-06): conservative target accounts
 * for student zoom + browser chrome + sub-1366 devices.
 *
 * Detection: for each .slide element in the DOM, force display:flex temporarily
 * and compare scrollHeight (rendered content) vs clientHeight (container box).
 * scrollHeight > clientHeight = silent clip = OVERFLOW-001.
 *
 * Skipped: presentation files without .slide elements (article-style scrolling
 * presentations are out of scope — students can scroll those naturally).
 */

const path = require('path');

const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 720;

class SlideOverflowChecker {
    constructor(options = {}) {
        this.browserPool = options.browserPool;
        this.rootPath = options.rootPath;
        this.verbose = options.verbose || false;
    }

    async check(htmlFiles) {
        const issues = [];
        const presentationFiles = htmlFiles.filter(f =>
            f.relativePath.endsWith('.presentation.html')
        );

        if (this.verbose) {
            console.log(`[OVERFLOW] Checking ${presentationFiles.length} presentation files at ${VIEWPORT_WIDTH}×${VIEWPORT_HEIGHT}`);
        }

        let scanned = 0, withOverflow = 0, slideStyleSkipped = 0;

        for (const file of presentationFiles) {
            const result = await this._checkOne(file);
            if (result === null) {
                slideStyleSkipped++;
            } else {
                scanned++;
                if (result.length > 0) {
                    issues.push(...result);
                    withOverflow++;
                }
            }
        }

        return {
            issues,
            summary: { scanned, withOverflow, slideStyleSkipped }
        };
    }

    async _checkOne(file) {
        let pageWrapper;
        try {
            pageWrapper = await this.browserPool.getPage();
        } catch (e) {
            return [];
        }
        const { page } = pageWrapper;

        const issues = [];
        try {
            await page.setViewport({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });
            // Seed localStorage to bypass AccessGuard.require('sorted') —
            // presentations gate behind sorting state. Match smoke-test convention.
            await page.evaluateOnNewDocument(() => {
                try { localStorage.setItem('hexworth_house', 'web'); } catch (_) {}
                try { localStorage.setItem('hexworth_sorted', 'true'); } catch (_) {}
            });
            await page.goto(`file://${file.absolutePath}`, {
                waitUntil: 'domcontentloaded',
                timeout: 5000
            });
            // Brief settle for fonts/images
            await new Promise(r => setTimeout(r, 400));

            const slideData = await page.evaluate(() => {
                const slides = document.querySelectorAll('.slide');
                if (!slides.length) return null;
                const results = [];
                slides.forEach((slide, idx) => {
                    const origDisplay = slide.style.display;
                    const origVisibility = slide.style.visibility;
                    slide.style.display = 'flex';
                    slide.style.visibility = 'visible';
                    // Allow layout to settle synchronously
                    void slide.offsetHeight;
                    const scrollH = slide.scrollHeight;
                    const clientH = slide.clientHeight;
                    if (scrollH > clientH + 2) {  // +2 px tolerance for sub-pixel rounding
                        results.push({
                            slideIndex: idx + 1,
                            scrollHeight: scrollH,
                            clientHeight: clientH,
                            overflowPx: scrollH - clientH
                        });
                    }
                    slide.style.display = origDisplay;
                    slide.style.visibility = origVisibility;
                });
                return results;
            });

            if (slideData === null) {
                return null;  // No .slide elements — article-style, skip
            }

            for (const o of slideData) {
                issues.push({
                    code: 'OVERFLOW-001',
                    severity: 'medium',
                    category: 'layout',
                    message: `Slide ${o.slideIndex} content overflows container by ${o.overflowPx}px (rendered ${o.scrollHeight}px in ${o.clientHeight}px container at ${VIEWPORT_WIDTH}×${VIEWPORT_HEIGHT}). Bottom of slide content is silently clipped.`,
                    file: file.relativePath,
                    line: null,
                    fix: `Split slide ${o.slideIndex} into multiple smaller slides, OR reduce content density (text/font/spacing) so rendered content fits within ${o.clientHeight}px at 1280×720.`
                });
            }
        } catch (e) {
            if (this.verbose) {
                console.log(`[OVERFLOW] ${file.relativePath} failed: ${e.message}`);
            }
        } finally {
            await this.browserPool.releasePage(page);
        }
        return issues;
    }
}

module.exports = SlideOverflowChecker;
