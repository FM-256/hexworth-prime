#!/usr/bin/env node
/**
 * auto-split.js — Iterative slide splitter for OVERFLOW-001 fixes (sprint QC-45)
 *
 * For each overflowing slide in a .presentation.html file:
 *   1. Identify atomic blocks (priority order: card-grid > fact-row > step-row >
 *      list items > h3/h4 sections > paragraphs)
 *   2. Try N-way splits at increasing granularity (N=2,3,4,6,8) — balanced by
 *      atom count
 *   3. Re-render each candidate slide via Puppeteer at 1280×720 (the design
 *      contract per reference_design_choices_log.md 2026-05-06)
 *   4. Apply the smallest N that produces all-fitting slides
 *   5. Renumber slide-of-N labels file-wide
 *
 * Atomic write: writes to .tmp + renames (OS-atomic).
 *
 * USAGE:
 *   node _tools/slide-splitter/auto-split.js <file>             # dry-run (default)
 *   node _tools/slide-splitter/auto-split.js <file> --apply     # write changes
 *   node _tools/slide-splitter/auto-split.js <file> --max-iter 8
 */

const fs = require('fs');
const path = require('path');
const REPO_ROOT = path.resolve(__dirname, '../..');

const args = process.argv.slice(2);
const DRY_RUN = !args.includes('--apply');
const MAX_N = parseInt(args[args.indexOf('--max-iter') + 1]) || 8;
const FILE = args.filter(a => !a.startsWith('--') && !a.match(/^\d+$/))[0];

if (!FILE) {
    console.error('Usage: auto-split.js <file> [--apply] [--max-iter N]');
    process.exit(2);
}

const BrowserPool = require(path.join(REPO_ROOT, '_tools/eduscan/validators/functional/browser'));

const VIEWPORT_WIDTH = 1280;
const VIEWPORT_HEIGHT = 720;

// ─── Slide-block extraction ───────────────────────────────────────────

function findSlideBlocks(content) {
    // Each slide = `<div class="slide(?: active)?"...>` ... `</div>` (with nested div balancing)
    // Returns array of {start, end, html} in source order.
    const blocks = [];
    const openPat = /<div class="slide(?:\s+active)?"[^>]*>/g;
    let m;
    while ((m = openPat.exec(content)) !== null) {
        const start = m.index;
        const inner = m.index + m[0].length;
        let depth = 1, i = inner;
        while (i < content.length && depth > 0) {
            const nextOpen = content.indexOf('<div', i);
            const nextClose = content.indexOf('</div>', i);
            if (nextClose === -1) break;
            if (nextOpen !== -1 && nextOpen < nextClose) {
                depth++;
                i = nextOpen + 4;
            } else {
                depth--;
                i = nextClose + 6;
            }
        }
        blocks.push({ start, end: i, html: content.substring(start, i) });
    }
    return blocks;
}

// ─── Atomic-block detection ───────────────────────────────────────────

function findAtomicBlocks(slideHtml) {
    // Returns { strategy, prefix, atoms, suffix } where:
    //   strategy = which detection rule fired
    //   prefix   = HTML before the first atom (slide title, intros)
    //   atoms    = array of atom HTML strings (the splittable items)
    //   suffix   = HTML after the last atom (slide-number, prepared-by spans)
    // Returns null if no splittable structure found.

    // Priority 1: .card-grid* containers
    for (const gridClass of ['card-grid-4', 'card-grid-3', 'card-grid-2', 'card-grid', 'threat-grid', 'service-cards']) {
        const result = splitOnGrid(slideHtml, gridClass);
        if (result && result.atoms.length >= 2) return result;
    }
    // Priority 2: summary-facts > fact-row
    const factsResult = splitOnContainer(slideHtml, 'summary-facts', 'fact-row');
    if (factsResult && factsResult.atoms.length >= 2) return factsResult;
    // Priority 3: step-list > step-row
    const stepResult = splitOnContainer(slideHtml, 'step-list', 'step-row');
    if (stepResult && stepResult.atoms.length >= 2) return stepResult;
    // Priority 4: <ul> / <ol> direct children (when slide has a single list)
    const listResult = splitOnList(slideHtml);
    if (listResult && listResult.atoms.length >= 2) return listResult;

    return null;
}

function splitOnGrid(html, gridClass) {
    // Locate <div class="<gridClass>"...> and split its direct .card / .threat-card / .service-card children
    const containerRe = new RegExp(`(<div class="${escapeRegex(gridClass)}[^"]*"[^>]*>)([\\s\\S]*?)(</div>)\\s*(?=<span class="slide-number"|</div>)`);
    const m = html.match(containerRe);
    if (!m) return null;
    const containerOpen = m[1];
    const containerInner = m[2];
    const containerClose = m[3];

    // Find direct children of the grid (.card, .threat-card, .info-card, .service-card)
    const childItems = extractDirectDivChildren(containerInner);
    if (childItems.length < 2) return null;

    const containerStart = html.indexOf(m[0]);
    const containerEnd = containerStart + m[0].length;
    return {
        strategy: `grid:${gridClass}`,
        prefix: html.substring(0, containerStart) + containerOpen,
        atoms: childItems,
        suffix: containerClose + html.substring(containerEnd)
    };
}

function splitOnContainer(html, parentClass, childClass) {
    const containerRe = new RegExp(`(<div class="${escapeRegex(parentClass)}[^"]*"[^>]*>)([\\s\\S]*?)(</div>)`);
    const m = html.match(containerRe);
    if (!m) return null;
    const childRe = new RegExp(`<div class="${escapeRegex(childClass)}[^"]*"[^>]*>[\\s\\S]*?</div>`, 'g');
    const childItems = m[2].match(childRe) || [];
    if (childItems.length < 2) return null;
    const containerStart = html.indexOf(m[0]);
    const containerEnd = containerStart + m[0].length;
    return {
        strategy: `container:${parentClass}>${childClass}`,
        prefix: html.substring(0, containerStart) + m[1],
        atoms: childItems,
        suffix: m[3] + html.substring(containerEnd)
    };
}

function splitOnList(html) {
    const listRe = /<(ul|ol)[^>]*>([\s\S]*?)<\/\1>/;
    const m = html.match(listRe);
    if (!m) return null;
    const itemRe = /<li[^>]*>[\s\S]*?<\/li>/g;
    const items = m[2].match(itemRe) || [];
    if (items.length < 2) return null;
    const tag = m[1];
    const listStart = html.indexOf(m[0]);
    const listEnd = listStart + m[0].length;
    return {
        strategy: `list:${tag}`,
        prefix: html.substring(0, listStart) + `<${tag}>`,
        atoms: items,
        suffix: `</${tag}>` + html.substring(listEnd)
    };
}

function extractDirectDivChildren(html) {
    // Extract top-level <div ...>...</div> blocks (with nested-div balancing)
    const out = [];
    const openPat = /<div\b[^>]*>/g;
    let m;
    while ((m = openPat.exec(html)) !== null) {
        const start = m.index;
        const innerStart = start + m[0].length;
        let depth = 1, i = innerStart;
        while (i < html.length && depth > 0) {
            const nextOpen = html.indexOf('<div', i);
            const nextClose = html.indexOf('</div>', i);
            if (nextClose === -1) break;
            if (nextOpen !== -1 && nextOpen < nextClose) {
                depth++;
                i = nextOpen + 4;
            } else {
                depth--;
                i = nextClose + 6;
            }
        }
        out.push(html.substring(start, i));
        openPat.lastIndex = i;
    }
    return out;
}

function escapeRegex(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ─── Splitting ────────────────────────────────────────────────────────

function chunkBalanced(atoms, n) {
    // Split atoms into n chunks, balanced by count
    const chunks = [];
    const baseSize = Math.floor(atoms.length / n);
    let extra = atoms.length % n;
    let i = 0;
    for (let c = 0; c < n; c++) {
        const size = baseSize + (extra > 0 ? 1 : 0);
        if (extra > 0) extra--;
        chunks.push(atoms.slice(i, i + size));
        i += size;
        if (i >= atoms.length) break;
    }
    return chunks.filter(c => c.length > 0);
}

function buildSlideFromChunk(slideHtmlOriginal, atomDecomp, atomChunk, partLabel) {
    // Build a new slide HTML with the same prefix/suffix but replacing atoms with the chunk.
    // partLabel like "(Part 1 of 3)" — appended to the slide's first <h2>.
    let prefix = atomDecomp.prefix;
    if (partLabel) {
        // Append the part label to the first <h2> in the prefix
        prefix = prefix.replace(/(<h2[^>]*>)([^<]+)(<\/h2>)/, (_, open, text, close) => {
            return `${open}${text} ${partLabel}${close}`;
        });
    }
    return prefix + atomChunk.join('\n                ') + atomDecomp.suffix;
}

// ─── Oracle (Puppeteer measurement) ───────────────────────────────────

async function measureCandidatesInFile(browserPool, workingContent, slideStartByte, slideEndByte, candidatesHtml, originalAbsolutePath) {
    // Write modified content to /tmp, load via file://, measure candidate slides at their
    // file position. Returns array of { scrollHeight, clientHeight, fits } per candidate.
    const fs = require('fs');
    const replacement = candidatesHtml.join('\n\n        ');
    const modified = workingContent.substring(0, slideStartByte) + replacement + workingContent.substring(slideEndByte);
    const tmpPath = `/tmp/auto-split-test-${process.pid}-${Date.now()}.html`;
    fs.writeFileSync(tmpPath, modified);

    const wrapper = await browserPool.getPage();
    const { page } = wrapper;
    try {
        await page.setViewport({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });
        await page.evaluateOnNewDocument(() => {
            try { localStorage.setItem('hexworth_house', 'web'); } catch (_) {}
            try { localStorage.setItem('hexworth_sorted', 'true'); } catch (_) {}
        });
        await page.goto(`file://${tmpPath}`, { waitUntil: 'domcontentloaded', timeout: 5000 });
        await new Promise(r => setTimeout(r, 300));

        // Count how many slides exist before the target range so we know which indices are candidates
        const beforeContent = workingContent.substring(0, slideStartByte);
        const slidesBefore = (beforeContent.match(/<div class="slide(?:\s+active)?"/g) || []).length;
        const measurements = await page.evaluate((startIdx, count) => {
            const all = document.querySelectorAll('.slide');
            const out = [];
            for (let i = startIdx; i < startIdx + count && i < all.length; i++) {
                const slide = all[i];
                const orig = slide.style.display;
                const origVis = slide.style.visibility;
                slide.style.display = 'flex';
                slide.style.visibility = 'visible';
                void slide.offsetHeight;
                out.push({ scrollHeight: slide.scrollHeight, clientHeight: slide.clientHeight });
                slide.style.display = orig;
                slide.style.visibility = origVis;
            }
            return out;
        }, slidesBefore, candidatesHtml.length);
        return measurements;
    } catch (e) {
        return null;
    } finally {
        await browserPool.releasePage(page);
        try { fs.unlinkSync(tmpPath); } catch (_) {}
    }
}

async function measureSingleSlide(browserPool, workingContent, slideStartByte, slideEndByte, originalAbsolutePath) {
    // Measure one slide by writing the file as-is and loading it.
    const fs = require('fs');
    const tmpPath = `/tmp/auto-split-meas-${process.pid}-${Date.now()}.html`;
    fs.writeFileSync(tmpPath, workingContent);

    const wrapper = await browserPool.getPage();
    const { page } = wrapper;
    try {
        await page.setViewport({ width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT });
        await page.evaluateOnNewDocument(() => {
            try { localStorage.setItem('hexworth_house', 'web'); } catch (_) {}
            try { localStorage.setItem('hexworth_sorted', 'true'); } catch (_) {}
        });
        await page.goto(`file://${tmpPath}`, { waitUntil: 'domcontentloaded', timeout: 5000 });
        await new Promise(r => setTimeout(r, 300));

        const beforeContent = workingContent.substring(0, slideStartByte);
        const targetIdx = (beforeContent.match(/<div class="slide(?:\s+active)?"/g) || []).length;
        const m = await page.evaluate((idx) => {
            const slides = document.querySelectorAll('.slide');
            if (idx >= slides.length) return null;
            const slide = slides[idx];
            const orig = slide.style.display;
            slide.style.display = 'flex';
            void slide.offsetHeight;
            const r = { scrollHeight: slide.scrollHeight, clientHeight: slide.clientHeight };
            slide.style.display = orig;
            return r;
        }, targetIdx);
        return m;
    } catch (e) {
        return null;
    } finally {
        await browserPool.releasePage(page);
        try { fs.unlinkSync(tmpPath); } catch (_) {}
    }
}

// ─── Renumbering ──────────────────────────────────────────────────────

function renumberFile(content, originalTotal, newTotal) {
    // Replace all "Slide N of <originalTotal>" with "Slide N of <newTotal>".
    // The slide-block replacement step handled per-slide N updates already (via buildSlideFromChunk).
    // This pass updates the of-N counter platform-wide for slides that didn't get re-built.
    const re = new RegExp(`>Slide (\\d+) of ${originalTotal}<`, 'g');
    return content.replace(re, (_, n) => `>Slide ${n} of ${newTotal}<`);
}

function renumberSequential(content) {
    // After all splits, walk all "Slide X of Y" markers in source order and renumber X
    // to be 1..N sequentially. Y is the total seen in any marker.
    const markers = [...content.matchAll(/>Slide (\d+) of (\d+)</g)];
    if (markers.length === 0) return content;
    const total = markers.length;
    let result = content;
    let idx = 0;
    result = result.replace(/>Slide \d+ of \d+</g, () => {
        idx++;
        return `>Slide ${idx} of ${total}<`;
    });
    return result;
}

// ─── Main ─────────────────────────────────────────────────────────────

async function main() {
    const filePath = path.resolve(FILE);
    if (!fs.existsSync(filePath)) {
        console.error(`File not found: ${filePath}`);
        process.exit(2);
    }
    const original = fs.readFileSync(filePath, 'utf8');
    let working = original;

    const browserPool = new BrowserPool({ verbose: false, concurrency: 1 });
    await browserPool.launch();

    console.log(`auto-split: ${path.relative(REPO_ROOT, filePath)}`);
    console.log(`  mode: ${DRY_RUN ? 'DRY-RUN' : 'APPLY'}  max-iter: ${MAX_N}  viewport: ${VIEWPORT_WIDTH}×${VIEWPORT_HEIGHT}`);

    // Find all slides in original; measure overflow for each
    const slides = findSlideBlocks(working);
    console.log(`  slides: ${slides.length}`);

    const overflowingSlides = [];
    for (let i = 0; i < slides.length; i++) {
        const m = await measureSingleSlide(browserPool, working, slides[i].start, slides[i].end, filePath);
        if (m && m.scrollHeight > m.clientHeight + 2) {
            overflowingSlides.push({ idx: i, overflowPx: m.scrollHeight - m.clientHeight });
        }
    }
    console.log(`  overflowing: ${overflowingSlides.length}`);

    let splitsApplied = 0, unsplittable = 0;
    const proposals = [];

    // Process worst-first
    overflowingSlides.sort((a, b) => b.overflowPx - a.overflowPx);

    for (const { idx, overflowPx } of overflowingSlides) {
        // Re-extract slides each time since indices shift after applies (in dry-run, working unchanged)
        const currentSlides = findSlideBlocks(working);
        if (idx >= currentSlides.length) continue;
        const slideHtml = currentSlides[idx].html;

        const atomDecomp = findAtomicBlocks(slideHtml);
        if (!atomDecomp) {
            console.log(`  slide ${idx+1}: UNSPLITTABLE (no atomic blocks found, ${overflowPx}px clip) — manual review`);
            unsplittable++;
            continue;
        }

        let chosenN = null, chosenChunks = null;
        for (let N = 2; N <= MAX_N && N <= atomDecomp.atoms.length; N++) {
            const chunks = chunkBalanced(atomDecomp.atoms, N);
            if (chunks.length < N) break;
            const candidates = chunks.map((chunk, i) =>
                buildSlideFromChunk(slideHtml, atomDecomp, chunk, `(Part ${i+1} of ${chunks.length})`)
            );
            // Measure all candidates inline by writing a modified file
            const measurements = await measureCandidatesInFile(
                browserPool, working,
                currentSlides[idx].start, currentSlides[idx].end,
                candidates, filePath
            );
            if (!measurements || measurements.length !== candidates.length) continue;
            const allFit = measurements.every(m => m && m.scrollHeight <= m.clientHeight + 2);
            if (allFit) { chosenN = N; chosenChunks = chunks; break; }
        }

        if (!chosenN) {
            console.log(`  slide ${idx+1}: NO-CONVERGE up to N=${Math.min(MAX_N, atomDecomp.atoms.length)} (${overflowPx}px clip, ${atomDecomp.atoms.length} atoms) — manual review`);
            unsplittable++;
            continue;
        }

        const newSlides = chosenChunks.map((chunk, i) =>
            buildSlideFromChunk(slideHtml, atomDecomp, chunk, `(Part ${i+1} of ${chosenN})`)
        );
        proposals.push({ idx, overflowPx, atoms: atomDecomp.atoms.length, strategy: atomDecomp.strategy, N: chosenN });

        // Apply replacement (in working content)
        const slideStart = currentSlides[idx].start;
        const slideEnd = currentSlides[idx].end;
        const replacement = newSlides.join('\n\n        ');
        working = working.substring(0, slideStart) + replacement + working.substring(slideEnd);
        splitsApplied++;
        console.log(`  slide ${idx+1}: split N=${chosenN} via ${atomDecomp.strategy} (${atomDecomp.atoms.length} atoms, was ${overflowPx}px clip)`);
    }

    // Renumber sequentially
    if (splitsApplied > 0) {
        working = renumberSequential(working);
    }

    // Output
    console.log('\n─── Summary ───');
    console.log(`  splits applied:   ${splitsApplied}`);
    console.log(`  manual review:    ${unsplittable}`);
    console.log(`  total slides now: ${findSlideBlocks(working).length} (was ${slides.length})`);

    if (!DRY_RUN && splitsApplied > 0) {
        const tmpPath = filePath + '.tmp';
        fs.writeFileSync(tmpPath, working);
        fs.renameSync(tmpPath, filePath);
        console.log(`\n  ✓ wrote ${path.relative(REPO_ROOT, filePath)}`);
    } else if (DRY_RUN && splitsApplied > 0) {
        console.log(`\n  DRY-RUN — would change ${working.length - original.length >= 0 ? '+' : ''}${working.length - original.length} chars`);
        console.log(`  Run with --apply to write.`);
    }

    await browserPool.shutdown();
    process.exit(0);
}

main().catch(err => {
    console.error('auto-split failed:', err.message);
    console.error(err.stack);
    process.exit(1);
});
