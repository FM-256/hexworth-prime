// Measures the frame cost of the hub environment on a CPU-THROTTLED profile — the student
// laptop case, not this machine.
//
// Why: I twice told a reviewer "performance is unmeasured, I am not claiming it is fine." It
// stayed unmeasured while the design got HEAVIER: round 1 animated only on pointer input (idle =
// zero compositor work); the current build runs three infinite keyframe animations (46s/34s/26s
// plus an 11s pulse) over blurred full-viewport layers, with backdrop-filter on every card. That
// is a materially different profile, so the old non-claim does not carry over.
//
// Compares the SAME page with the environment on (cloud-master) and off (a control hub), so the
// number attributable to the environment is a delta rather than an absolute nobody can read.
//
// usage: BASE=https://... node _tools/eduscan/smoke/hub-env-perf-probe.js
const puppeteer = require('puppeteer');

const BASE = process.env.BASE;
const THROTTLE = Number(process.env.THROTTLE || 6);   // 6x slowdown ~ a low-end laptop
const SECONDS = Number(process.env.SECONDS || 6);

// stress = 'idle' | 'pointer'. Idle measures the ambient keyframe drift only. POINTER also
// drives the pointermove handler, which writes a transform to all three layers every frame --
// the case a real student is actually in, and one this probe originally did not cover at all.
// Nancy caught that gap and tested it by hand; it lives here now so the coverage is permanent
// rather than something someone remembered to do once.
async function measure(browser, id, throttle, stress) {
  const page = await browser.newPage();
  await page.setCacheEnabled(false);
  await page.setViewport({ width: 1440, height: 900 });
  await page.evaluateOnNewDocument(() => { localStorage.setItem('hexworth_house', 'cloud'); });
  const client = await page.createCDPSession();
  await client.send('Emulation.setCPUThrottlingRate', { rate: throttle });
  await page.goto(`${BASE}/houses/hub/${id}`, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await new Promise((r) => setTimeout(r, 3500));        // let the hub render + settle

  // Sweep the pointer across the viewport for the whole sample window, ~60Hz.
  let sweeping = false;
  if (stress === 'pointer') {
    sweeping = true;
    (async () => {
      let t = 0;
      while (sweeping) {
        t += 0.05;
        const x = 720 + Math.sin(t) * 620;
        const y = 450 + Math.cos(t * 0.7) * 380;
        try { await page.mouse.move(x, y); } catch (e) { break; }
        await new Promise((r) => setTimeout(r, 16));
      }
    })();
  }

  const envOn = await page.evaluate(() => document.body.classList.contains('env-on'));

  // rAF sampling: count frames and their deltas over a fixed wall-clock window, with no input.
  const stats = await page.evaluate((secs) => new Promise((resolve) => {
    const deltas = [];
    let last = performance.now();
    const stop = last + secs * 1000;
    function tick(now) {
      deltas.push(now - last);
      last = now;
      if (now < stop) { requestAnimationFrame(tick); }
      else {
        deltas.sort((a, b) => a - b);
        const p = (q) => deltas[Math.min(deltas.length - 1, Math.floor(deltas.length * q))];
        resolve({
          frames: deltas.length,
          fps: +(deltas.length / secs).toFixed(1),
          medianMs: +p(0.5).toFixed(1),
          p95Ms: +p(0.95).toFixed(1),
          worstMs: +deltas[deltas.length - 1].toFixed(1),
          janky: deltas.filter((d) => d > 50).length,   // >50ms = a visibly dropped frame
        });
      }
    }
    requestAnimationFrame(tick);
  }), SECONDS);

  sweeping = false;
  await page.close();
  return { id, envOn, stress, ...stats };
}

(async () => {
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  let fail = 0;
  try {
    console.log(`CPU throttle ${THROTTLE}x, ${SECONDS}s sample per case (idle + continuous pointer)\n`);
    const on = await measure(browser, 'cloud-master', THROTTLE, 'idle');
    const onPtr = await measure(browser, 'cloud-master', THROTTLE, 'pointer');
    const off = await measure(browser, 'openstack', THROTTLE, 'idle');

    for (const r of [on, onPtr, off]) {
      console.log(`  ${r.id.padEnd(14)} env=${String(r.envOn).padEnd(5)} ${r.stress.padEnd(7)} ` +
        `${String(r.fps).padStart(5)} fps | median ${String(r.medianMs).padStart(5)}ms | ` +
        `p95 ${String(r.p95Ms).padStart(6)}ms | worst ${String(r.worstMs).padStart(6)}ms | dropped ${r.janky}`);
    }

    const dFps = +(off.fps - on.fps).toFixed(1);
    const dP95 = +(on.p95Ms - off.p95Ms).toFixed(1);
    console.log(`\n  DELTA attributable to the environment: ${dFps} fps slower, p95 +${dP95}ms`);

    // Thresholds. 24fps is the floor where continuous motion still reads as motion rather than
    // stutter; p95 over 50ms means one frame in twenty is visibly dropped.
    // Both stress cases must clear the bar. Idle alone would miss the pointermove path, which
    // writes a transform to every layer per frame and is what a real student triggers.
    const okFps = on.fps >= 24;
    const okP95 = on.p95Ms <= 50;
    const okFpsPtr = onPtr.fps >= 24;
    const okP95Ptr = onPtr.p95Ms <= 50;
    console.log(`  ${okFps ? 'PASS' : 'FAIL'}  idle    >=24fps on a ${THROTTLE}x-throttled CPU (${on.fps})`);
    console.log(`  ${okP95 ? 'PASS' : 'FAIL'}  idle    p95 <=50ms (${on.p95Ms}ms)`);
    console.log(`  ${okFpsPtr ? 'PASS' : 'FAIL'}  pointer >=24fps under continuous input (${onPtr.fps})`);
    console.log(`  ${okP95Ptr ? 'PASS' : 'FAIL'}  pointer p95 <=50ms (${onPtr.p95Ms}ms)`);
    if (!okFps || !okP95 || !okFpsPtr || !okP95Ptr) { fail = 1; }
  } finally { await browser.close().catch(() => {}); }
  console.log(fail ? '\n  PERF GATE FAILED' : '\n  PERF GATE PASSED');
  process.exit(fail);
})().catch((e) => { console.error('PROBE ERROR: ' + e.message); process.exit(1); });
