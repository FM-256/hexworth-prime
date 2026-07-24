#!/usr/bin/env node
/* BUG-021 Armory checkpoint QC — gameability scan.
 *
 * Flags checkpoints whose expected answer is transcribable from an adjacent
 * teaching comment / output span in the module content (the leak class Nancy
 * caught in the JS reference family: a student passes by copying `// 15` next
 * to the referenced call, demonstrating nothing).
 *
 * Tightened per Nancy: match the answer specifically inside a
 * `class="comment">//…` or `class="output">…` span (or a bare `// …` in the
 * de-escaped code), NOT bare word-boundary anywhere in the file — that
 * over-counts on common tokens.
 *
 *   node gameability-scan.js <family-dir>
 *   e.g. node gameability-scan.js _app/houses/code/armory/c
 *
 * Exit 0 = clean (only trivial/acceptable flags); prints POSSIBLE LEAK lines
 * for manual read. A flag is NOT proof of a leak (short/common tokens, or the
 * accepted "value visible in an INPUT literal the student must operate on"
 * shape) — every hit needs a human read, but a clean scan means no obvious
 * transcribe-the-comment leak remains.
 */
const fs = require('fs');
const path = require('path');

const dir = process.argv[2];
if (!dir) { console.error('usage: gameability-scan.js <family-dir>'); process.exit(1); }

const files = fs.readdirSync(dir).filter(f => f.endsWith('.module.html') || (f.startsWith('pg-') && f.endsWith('.html')));
let flags = 0, scanned = 0;

for (const f of files) {
  const html = fs.readFileSync(path.join(dir, f), 'utf8');
  const cpIdx = html.indexOf('var CHECKPOINTS');
  if (cpIdx < 0) { console.log(`  ${f}: NO CHECKPOINTS`); continue; }
  const content = html.slice(0, cpIdx);            // module content only, not the checkpoint block
  const deesc = content.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
  const block = html.slice(cpIdx);
  const cps = [...block.matchAll(/id:\s*'([^']+)'[\s\S]*?answer:\s*(\[[^\]]*\]|'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")/g)];
  for (const c of cps) {
    scanned++;
    const id = c[1];
    const ans = c[2].replace(/^['"]|['"]$/g, '');
    const esc = ans.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Capture the actual matched context so a real output-comment leak can't be
    // rationalized away as "input-visible" (the exact mistake that let js-05 cp3
    // through Nancy+coordinator until Chris caught the printed `// 200`).
    let ctx = null;
    for (const re of [
      new RegExp('(class="comment"[^>]*>[^<]*' + esc + '[^<]*)'),
      new RegExp('(class="output"[^>]*>[^<]*' + esc + '[^<]*)'),
    ]) { const m = content.match(re); if (m) { ctx = m[1]; break; } }
    if (!ctx) { const m = deesc.match(new RegExp('(//[^\\n]*\\b' + esc + '\\b[^\\n]*)')); if (m) ctx = m[1]; }
    const trivial = ans.length <= 2 || ['true', 'false', 'GET', 'HEAD', 'POST', 'null', 'void'].includes(ans);
    if (ctx && !trivial) {
      console.log(`  POSSIBLE LEAK ${f} ${id} ans=${JSON.stringify(ans)}`);
      console.log(`      matched-in-content: ${ctx.replace(/<[^>]+>/g, '').trim().slice(0, 90)}`);
      console.log(`      -> if this is an OUTPUT/comment showing the result, it IS a leak; dismiss ONLY if a coincidental token in unrelated code.`);
      flags++;
    }
  }
}
console.log(`checkpoints scanned: ${scanned} | possible non-trivial leaks: ${flags}`);
console.log(flags === 0 ? 'SCAN CLEAN (no obvious transcribe-the-comment leaks)' : 'REVIEW each POSSIBLE LEAK by hand — flag != proof, but confirm each is the accepted input-visible shape, not an output-comment transcribe.');
