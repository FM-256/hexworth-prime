#!/usr/bin/env node
/*
 * Verifies the grading PROBE against REAL Pyodide in a real browser.
 *
 * WHY: I shipped probe support in PythonSandbox.js (ba3075912) and said plainly that it
 * was untested and no lab should adopt it until verified. Shipping an untested capability
 * is itself debt -- it looks available and nobody knows if it works. This closes that.
 *
 * The probe's whole purpose is to defeat the print-literals attack: a student cannot
 * satisfy a probe-based check by printing a transcript, because the grader calls THEIR
 * function with values chosen at grade time. Both directions are tested here.
 */
const puppeteer = require('puppeteer');

const CASES = [
  { name: 'honest implementation passes',
    code: 'def double(n):\n    return n * 2\nprint("RESULT PASS")',
    expect: { call: 14, missing: false } },
  { name: 'print-literals cheat is DEFEATED (the whole point)',
    code: 'print("RESULT PASS")\nprint("double(7) = 14")',
    expect: { call: 'PROBE_MISSING', missing: true } },
  { name: 'wrong implementation is caught by grader-chosen input',
    code: 'def double(n):\n    return 14 if n == 7 else 0\nprint("RESULT PASS")',
    expect: { hardcodeCaught: true } },
  { name: 'a throwing function reports PROBE_ERROR, not a crash',
    code: 'def double(n):\n    raise ValueError("boom")\nprint("RESULT PASS")',
    expect: { call: 'PROBE_ERROR' } },
];

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-dev-shm-usage'] });
  const page = await browser.newPage();
  page.on('console', m => { if (/PROBEV/.test(m.text())) console.log('  ' + m.text()); });
  // A minimal same-origin-ish page: fast to load and still allows the CDN fetch.
  // Loading the whole site first was pure overhead and timed the run out.
  await page.goto('https://cdn.jsdelivr.net/pyodide/v0.25.1/full/', { waitUntil: 'domcontentloaded', timeout: 90000 });

  const results = await page.evaluate(async (CASES) => {
    const out = [];
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';
      s.onload = res; s.onerror = () => rej(new Error('pyodide script failed to load'));
      document.head.appendChild(s);
    });
    const pyodide = await loadPyodide({ indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/' });

    // The exact probe shape shipped in PythonSandbox.js, against a real _state.pyodide.
    const makeProbe = (py) => ({
      call: function (fnName, args) {
        try {
          const fn = py.globals.get(fnName);
          if (!fn) return 'PROBE_MISSING';
          const o = fn(...(args || []));
          return (o && typeof o.toJs === 'function') ? o.toJs() : o;
        } catch (e) { return 'PROBE_ERROR'; }
      },
      eval: function (expr) {
        try { const r = py.runPython(expr); return (r && typeof r.toJs === 'function') ? r.toJs() : r; }
        catch (e) { return 'PROBE_ERROR'; }
      },
      defined: function (n) { try { return !!py.globals.get(n); } catch (e) { return false; } }
    });

    for (const c of CASES) {
      // Fresh namespace per case, so one case cannot leak into the next.
      py_reset: { pyodide.runPython('for _k in [k for k in list(globals()) if not k.startswith("_")]:\n    del globals()[_k]'); }
      let stdout = '';
      pyodide.setStdout({ batched: (l) => { stdout += l + '\n'; } });
      try { await pyodide.runPythonAsync(c.code); } catch (e) { /* graded as a fail path */ }
      const probe = makeProbe(pyodide);
      const r = { name: c.name, stdoutSaysPass: /RESULT PASS/.test(stdout) };
      r.call = probe.call('double', [7]);
      r.defined = probe.defined('double');
      // Grader-chosen input, unknowable in advance -- this is what kills hardcoding.
      const n = 3 + Math.floor(Math.random() * 90);
      const got = probe.call('double', [n]);
      r.hardcodeCaught = (got !== n * 2);
      out.push(r);
    }
    return out;
  }, CASES);

  await browser.close();

  let fails = 0;
  for (let i = 0; i < results.length; i++) {
    const r = results[i], e = CASES[i].expect;
    let ok = true;
    if ('call' in e) ok = ok && JSON.stringify(r.call) === JSON.stringify(e.call);
    if ('missing' in e) ok = ok && (r.defined === !e.missing);
    if ('hardcodeCaught' in e) ok = ok && r.hardcodeCaught === e.hardcodeCaught;
    if (!ok) fails++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${r.name}`);
    console.log(`        stdout claims pass: ${r.stdoutSaysPass} | probe.call(double,7) = ${JSON.stringify(r.call)} | defined = ${r.defined} | hardcode caught = ${r.hardcodeCaught}`);
  }
  console.log('');
  if (fails) { console.log(`PROBE VERIFY FAILED: ${fails} case(s)`); process.exit(1); }
  console.log('PROBE VERIFIED: honest code passes, printed transcripts do not, hardcoding is caught.');
})();
