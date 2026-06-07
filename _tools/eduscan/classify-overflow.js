/**
 * Pattern classifier for OVERFLOW-001b findings.
 *
 * For each overflowing slide, loads the live DOM (cat-contract single-slide
 * active state, matching the validator) and extracts structural shape:
 *   - has-visual layout (2-col grid)?
 *   - table dimensions (rows × cols)
 *   - list lengths (max <li> in any single <ul>/<ol>)
 *   - code block size (lines in <pre>)
 *   - image count
 *   - section count (h2/h3 stacks)
 *   - text density (chars in .slide-text or .slide-content)
 *
 * Buckets each slide into a primary pattern, then aggregates.
 */

const path = require('path');
const fs = require('fs');
const BrowserPool = require('./validators/functional/browser');

(async () => {
    const ROOT = path.join(__dirname, '../..');
    const wsaDir = path.join(ROOT, '_app/houses/cloud/modules/wsa');
    const modules = fs.readdirSync(wsaDir).filter(d => d.startsWith('m')).sort();

    // Pull files
    const fileList = modules
        .map(m => ({
            mod: m,
            absolutePath: path.join(wsaDir, m, 'cloud-presentation.module.html'),
            relativePath: `_app/houses/cloud/modules/wsa/${m}/cloud-presentation.module.html`
        }))
        .filter(f => fs.existsSync(f.absolutePath));

    const pool = new BrowserPool({ verbose: false, concurrency: 4 });
    await pool.launch();

    const allSlides = [];  // { mod, slideIndex, dataSlide, overflowPx, shape: {...} }

    try {
        for (const file of fileList) {
            const { page } = await pool.getPage();
            try {
                await page.setViewport({ width: 1280, height: 720 });
                await page.evaluateOnNewDocument(() => {
                    try { localStorage.setItem('hexworth_house', 'web'); } catch (_) {}
                    try { localStorage.setItem('hexworth_sorted', 'true'); } catch (_) {}
                });
                await page.goto(`file://${file.absolutePath}`, {
                    waitUntil: 'domcontentloaded',
                    timeout: 5000
                });
                await new Promise(r => setTimeout(r, 400));

                const slideData = await page.evaluate(() => {
                    const slides = Array.from(document.querySelectorAll('.slide'));
                    const results = [];

                    slides.forEach((slide, idx) => {
                        slides.forEach(s => s.classList.remove('active'));
                        slide.classList.add('active');
                        void slide.offsetHeight;

                        const content = slide.querySelector('.slide-content');
                        if (!content) return;

                        const scrollH = content.scrollHeight;
                        const clientH = content.clientHeight;
                        if (scrollH <= clientH + 2) return;  // not overflowing — skip

                        // Structural shape extraction
                        const tables = Array.from(content.querySelectorAll('table'));
                        const tableSizes = tables.map(t => ({
                            rows: t.querySelectorAll('tr').length,
                            cols: Math.max(0, ...Array.from(t.querySelectorAll('tr')).map(r => r.children.length))
                        }));
                        const maxTableRows = Math.max(0, ...tableSizes.map(t => t.rows));

                        const lists = Array.from(content.querySelectorAll('ul, ol'));
                        const listSizes = lists.map(l => l.children.length);
                        const maxListLen = Math.max(0, ...listSizes);
                        const totalListItems = listSizes.reduce((a,b)=>a+b, 0);

                        const pres = Array.from(content.querySelectorAll('pre'));
                        const codeLines = pres.map(p => (p.textContent || '').split('\n').length);
                        const maxCodeLines = Math.max(0, ...codeLines);
                        const totalCodeLines = codeLines.reduce((a,b)=>a+b, 0);

                        const images = content.querySelectorAll('img').length;
                        const svgs = content.querySelectorAll('svg').length;

                        const h2 = content.querySelectorAll('h2').length;
                        const h3 = content.querySelectorAll('h3').length;
                        const h4 = content.querySelectorAll('h4').length;
                        const paragraphs = content.querySelectorAll('p').length;

                        const insightBoxes = content.querySelectorAll('.insight-box, .callout, .highlight, .note').length;

                        const textChars = (content.textContent || '').replace(/\s+/g, ' ').trim().length;

                        const hasVisual = slide.classList.contains('has-visual');
                        const slideText = content.querySelector('.slide-text');
                        const slideVisual = content.querySelector('.slide-visual');
                        const slideTextChars = slideText ? (slideText.textContent || '').replace(/\s+/g,' ').trim().length : null;

                        // Stack count: top-level children in .slide-content or .slide-text
                        const stackTarget = slideText || content;
                        const topLevelChildren = stackTarget.children.length;

                        results.push({
                            slideIndex: idx + 1,
                            dataSlide: slide.getAttribute('data-slide') || null,
                            overflowPx: scrollH - clientH,
                            scrollH, clientH,
                            shape: {
                                hasVisual,
                                tables: tables.length,
                                maxTableRows,
                                tableSizes,
                                lists: lists.length,
                                maxListLen,
                                totalListItems,
                                pres: pres.length,
                                maxCodeLines,
                                totalCodeLines,
                                images,
                                svgs,
                                h2, h3, h4,
                                paragraphs,
                                insightBoxes,
                                textChars,
                                slideTextChars,
                                topLevelChildren,
                                slideTitle: (content.querySelector('.slide-title, h2')?.textContent || '').trim().slice(0, 80)
                            }
                        });
                    });

                    return results;
                });

                for (const s of slideData) {
                    allSlides.push({ mod: file.mod, ...s });
                }
                console.log(`${file.mod}: ${slideData.length} overflowing slides classified`);
            } finally {
                await pool.releasePage(page);
            }
        }
    } finally {
        await pool.shutdown();
    }

    // ============= CLASSIFY =============
    // Primary-pattern assignment: priority-ordered (most-distinctive first)
    function classify(s) {
        const sh = s.shape;
        const reasons = [];

        if (sh.maxTableRows >= 5) reasons.push(`LARGE_TABLE(${sh.maxTableRows}r)`);
        if (sh.maxListLen >= 7) reasons.push(`LONG_LIST(${sh.maxListLen}li)`);
        if (sh.maxCodeLines >= 12) reasons.push(`LONG_CODE(${sh.maxCodeLines}ln)`);
        if (sh.images + sh.svgs >= 3) reasons.push(`IMAGE_HEAVY(${sh.images + sh.svgs})`);
        if (sh.h3 >= 4) reasons.push(`MULTI_SECTION(${sh.h3}h3)`);
        if (sh.hasVisual && sh.slideTextChars && sh.slideTextChars > 700) reasons.push(`HV_DENSE_TEXT(${sh.slideTextChars}c)`);
        if (!sh.hasVisual && sh.textChars > 1200) reasons.push(`NV_DENSE_TEXT(${sh.textChars}c)`);
        if (sh.topLevelChildren >= 6) reasons.push(`STACK_TALL(${sh.topLevelChildren}ch)`);
        if (sh.insightBoxes >= 2) reasons.push(`MULTI_BOX(${sh.insightBoxes})`);

        // Primary pattern = first reason (priority order above)
        // If no reason matched, label as OTHER
        return {
            primary: reasons[0] ? reasons[0].split('(')[0] : 'OTHER',
            allPatterns: reasons
        };
    }

    const classified = allSlides.map(s => ({
        ...s,
        classification: classify(s)
    }));

    // Aggregate by primary pattern
    const byPrimary = {};
    for (const c of classified) {
        const p = c.classification.primary;
        if (!byPrimary[p]) byPrimary[p] = { count: 0, totalOverflow: 0, slides: [] };
        byPrimary[p].count++;
        byPrimary[p].totalOverflow += c.overflowPx;
        byPrimary[p].slides.push(c);
    }

    // Aggregate by has-visual
    const hvSplit = { hasVisual: 0, noVisual: 0 };
    for (const c of classified) {
        if (c.shape.hasVisual) hvSplit.hasVisual++;
        else hvSplit.noVisual++;
    }

    // Aggregate by module
    const byModule = {};
    for (const c of classified) {
        if (!byModule[c.mod]) byModule[c.mod] = {};
        const p = c.classification.primary;
        byModule[c.mod][p] = (byModule[c.mod][p] || 0) + 1;
    }

    // Report
    console.log('\n========== PATTERN DISTRIBUTION (235 slides) ==========');
    const sorted = Object.entries(byPrimary).sort((a,b) => b[1].count - a[1].count);
    for (const [pattern, data] of sorted) {
        const avgOverflow = Math.round(data.totalOverflow / data.count);
        const pct = Math.round(data.count / classified.length * 100);
        console.log(`  ${pattern.padEnd(18)} ${String(data.count).padStart(4)} slides (${String(pct).padStart(2)}%) — avg overflow ${avgOverflow}px`);
    }

    console.log('\n========== LAYOUT SPLIT ==========');
    console.log(`  has-visual (2-col grid): ${hvSplit.hasVisual}`);
    console.log(`  no-visual  (single col): ${hvSplit.noVisual}`);

    console.log('\n========== PER-MODULE DOMINANT PATTERN ==========');
    for (const mod of Object.keys(byModule).sort()) {
        const buckets = Object.entries(byModule[mod]).sort((a,b)=>b[1]-a[1]);
        const total = buckets.reduce((a,b)=>a+b[1], 0);
        const dominant = buckets[0];
        console.log(`  ${mod.padEnd(34)} total=${String(total).padStart(2)}  dominant=${dominant[0]}(${dominant[1]})  all=[${buckets.map(b=>`${b[0]}:${b[1]}`).join(', ')}]`);
    }

    console.log('\n========== TOP 10 BIGGEST CLIPS ==========');
    classified.sort((a,b) => b.overflowPx - a.overflowPx);
    for (const c of classified.slice(0, 10)) {
        console.log(`  ${c.mod} slide ${c.slideIndex} — ${c.overflowPx}px — ${c.classification.primary} — "${c.shape.slideTitle}"`);
        console.log(`      patterns: [${c.classification.allPatterns.join(', ')}]`);
    }

    console.log('\n========== OTHER bucket (unclassified) ==========');
    const others = classified.filter(c => c.classification.primary === 'OTHER');
    console.log(`  ${others.length} slides`);
    for (const c of others.slice(0, 10)) {
        const sh = c.shape;
        console.log(`  ${c.mod} slide ${c.slideIndex} (${c.overflowPx}px) — has-visual=${sh.hasVisual} text=${sh.textChars}c svgs=${sh.svgs} h3=${sh.h3} stack=${sh.topLevelChildren} title="${sh.slideTitle}"`);
    }

    fs.writeFileSync('/tmp/overflow-classification.json', JSON.stringify({
        summary: { total: classified.length, byPrimary: Object.fromEntries(sorted.map(([k,v]) => [k, v.count])), hvSplit, byModule },
        slides: classified
    }, null, 2));
    console.log('\nFull → /tmp/overflow-classification.json');
})().catch(e => { console.error(e); process.exit(1); });
