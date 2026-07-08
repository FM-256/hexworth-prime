#!/usr/bin/env node
/**
 * test-multimodal-grading.js
 *
 * Pre-deploy logic test for the gradeQuiz multi-modal extension. Faithfully replicates the exact
 * per-question grading branch from functions/index.js gradeQuiz (mc/gui/terminal) and asserts each
 * type grades correctly. Its whole purpose is Nancy's silent-fail concern: a terminal question whose
 * branch is missing/misordered would compare string===array in the final else and grade 0 with NO
 * crash. This catches that. The authoritative check is the live gradeQuiz smoke test post-deploy.
 */

// ---- Faithful copy of the grading branch (keep in sync with index.js gradeQuiz) ----
function gradeOne(expected, submitted, qType) {
  // Unwrap object-wrapped answers.
  if (expected && typeof expected === 'object' && !Array.isArray(expected)) {
    if (expected.ms) { qType = 'ms'; expected = expected.ms; }
    else if (expected.order) { qType = 'order'; expected = expected.order; }
    else if (expected.terminal) { qType = 'terminal'; expected = expected.terminal; }
  }
  if (submitted === undefined) return false;
  if (qType === 'terminal') {
    const accepted = Array.isArray(expected) ? expected : [];
    const norm = (s) => String(s).trim().toLowerCase();
    return typeof submitted === 'string' && accepted.some((a) => norm(a) === norm(submitted));
  }
  if (Array.isArray(expected) && Array.isArray(submitted)) {
    if (submitted.length !== expected.length) return false;
    if (qType === 'order') return submitted.every((v, j) => v === expected[j]);
    const s = [...submitted].sort((a, b) => a - b), e = [...expected].sort((a, b) => a - b);
    return s.every((v, j) => v === e[j]);
  }
  return submitted === expected;
}

// ---- Cases ----
const cases = [
  // MC: index equality
  ['mc correct', 3, 3, 'mc', true],
  ['mc wrong', 3, 1, 'mc', false],
  // GUI: string id equality (no dedicated type; falls to final else)
  ['gui correct', 'boot-option-1', 'boot-option-1', 'gui', true],
  ['gui wrong', 'boot-option-1', 'fast-boot', 'gui', false],
  // TERMINAL: the silent-fail target
  ['terminal exact', { terminal: ['ipconfig /flushdns'] }, 'ipconfig /flushdns', 'terminal', true],
  ['terminal case-insensitive', { terminal: ['ipconfig /flushdns'] }, 'IPCONFIG /FlushDNS', 'terminal', true],
  ['terminal trims whitespace', { terminal: ['sfc /scannow'] }, '  sfc /scannow  ', 'terminal', true],
  ['terminal variant list', { terminal: ['shutdown /r /t 0', 'shutdown -r -t 0'] }, 'shutdown -r -t 0', 'terminal', true],
  ['terminal wrong', { terminal: ['ipconfig /flushdns'] }, 'ipconfig /renew', 'terminal', false],
  ['terminal empty', { terminal: ['ipconfig /flushdns'] }, '', 'terminal', false],
  // Regression: ms/order still work
  ['ms unordered', { ms: [0, 2] }, [2, 0], 'ms', true],
  ['order exact', { order: [0, 1, 2] }, [0, 1, 2], 'order', true],
  ['order wrong', { order: [0, 1, 2] }, [0, 2, 1], 'order', false],
];

let fail = 0;
for (const [name, expected, submitted, qType, want] of cases) {
  const got = gradeOne(expected, submitted, qType);
  const ok = got === want;
  if (!ok) fail++;
  console.log(`  ${ok ? 'OK  ' : 'FAIL'} ${name}: got ${got}, want ${want}`);
}
console.log(fail === 0 ? '\nALL PASS (terminal branch grades correctly; no silent string===array 0-fail)' : `\n${fail} FAIL`);
process.exit(fail === 0 ? 0 : 1);
