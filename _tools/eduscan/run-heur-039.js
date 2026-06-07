const path = require('path');
const fs = require('fs');
const HeuristicsValidator = require('./validators/syntax/heuristics');

const ROOT = path.join(__dirname, '../..');
const wsaDir = path.join(ROOT, '_app/houses/cloud/modules/wsa');
const modules = fs.readdirSync(wsaDir).filter(d => d.startsWith('m')).sort();

const validator = new HeuristicsValidator();
const allFindings = [];

for (const mod of modules) {
    const p = path.join(wsaDir, mod, 'cloud-presentation.module.html');
    if (!fs.existsSync(p)) continue;
    const file = {
        path: p,
        content: fs.readFileSync(p, 'utf8')
    };
    const issues = validator.checkWsaHasVisualTextBudget(file);
    for (const i of issues) {
        allFindings.push({ mod, ...i });
    }
}

// Per-module count
const byMod = {};
for (const f of allFindings) {
    if (!byMod[f.mod]) byMod[f.mod] = [];
    byMod[f.mod].push(f);
}

console.log('=== HEUR-039 dry-run on 19 WSA cat-contract files ===');
console.log(`Total findings: ${allFindings.length}\n`);
console.log('Per-module:');
for (const mod of modules) {
    const n = (byMod[mod] || []).length;
    console.log(`  ${mod.padEnd(34)} ${String(n).padStart(3)}`);
}

// Reconcile against classifier output
console.log('\n=== Reconcile against classifier (per-slide textChars) ===');
const classifier = JSON.parse(fs.readFileSync('/tmp/overflow-classification.json', 'utf8'));
const classifierByMod = {};
for (const s of classifier.slides) {
    if (!classifierByMod[s.mod]) classifierByMod[s.mod] = [];
    classifierByMod[s.mod].push(s);
}
// HEUR-039 universe: ALL has-visual slides with .slide-text > 600c (regardless of overflow)
// Classifier universe: only OVERFLOWING slides
// Difference: HEUR-039 will flag has-visual slides with >600c that DON'T currently overflow
// (e.g., because tables/lists/images make up the difference)

let heurOverlaps = 0;
let heurOnly = 0;
let classOverflowMissedByHeur = 0;

for (const mod of modules) {
    const hf = byMod[mod] || [];
    const cs = classifierByMod[mod] || [];
    const hfLines = new Set(hf.map(f => f.line));
    const csIdx = new Set(cs.map(s => s.slideIndex));
    for (const line of hfLines) {
        if (csIdx.has(line)) heurOverlaps++;
        else heurOnly++;
    }
    for (const s of cs) {
        if (!hfLines.has(s.slideIndex) && s.shape.hasVisual && s.shape.slideTextChars > 600) {
            classOverflowMissedByHeur++;
            console.log(`  MISS: ${mod} slide ${s.slideIndex} — classifier=${s.shape.slideTextChars}c hasVisual=${s.shape.hasVisual} overflow=${s.overflowPx}px`);
        }
    }
}

console.log(`\n  HEUR overlaps classifier-overflow: ${heurOverlaps}`);
console.log(`  HEUR-only (passes >600c, does NOT currently overflow): ${heurOnly}`);
console.log(`  Classifier-overflow missed by HEUR: ${classOverflowMissedByHeur}`);

// Spot-check: m11-iis slide 7 should be 1368 chars per classifier
const m11slide7Heur = (byMod['m11-iis'] || []).find(f => f.line === 7);
const m11slide7Cls = (classifierByMod['m11-iis'] || []).find(s => s.slideIndex === 7);
console.log('\n=== Spot-check: m11-iis slide 7 ===');
console.log(`  Classifier: textChars=${m11slide7Cls?.shape?.slideTextChars}, overflow=${m11slide7Cls?.overflowPx}px`);
console.log(`  HEUR-039: ${m11slide7Heur?.message || 'NOT FOUND'}`);
