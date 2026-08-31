const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  // Ensure unsorted state (no hexworth_house key) -> pill/hb-link should never paint
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });

  // Clear storage before any navigation
  await page.evaluateOnNewDocument(() => {
    try { localStorage.clear(); } catch (e) {}
  });

  const client = await page.target().createCDPSession();
  const frames = [];
  client.on('Page.screencastFrame', async (frame) => {
    frames.push({ ts: Date.now(), data: frame.data });
    await client.send('Page.screencastFrameAck', { sessionId: frame.sessionId });
  });
  await client.send('Page.startScreencast', { format: 'png', quality: 100, everyNthFrame: 1 });

  const t0 = Date.now();
  await page.goto('http://localhost:8842/dashboard.html', { waitUntil: 'load', timeout: 30000 });
  // capture a bit more after load in case pill appears late
  await new Promise(r => setTimeout(r, 500));
  await client.send('Page.stopScreencast');

  console.log('Total frames captured:', frames.length);

  // Save all frames, we'll inspect them for the pill text via pixel-crop is hard;
  // instead use a lighter check: for each saved frame, load into a canvas is overkill.
  // Save frames to disk for inspection instead.
  const outDir = '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/2f9c2d95-8de7-4fbb-bf58-ed2b72f793dd/scratchpad/frames_unsorted';
  fs.mkdirSync(outDir, { recursive: true });
  frames.forEach((f, i) => {
    fs.writeFileSync(`${outDir}/frame_${String(i).padStart(3,'0')}_t${f.ts - t0}ms.png`, Buffer.from(f.data, 'base64'));
  });

  await browser.close();
  console.log('done, saved to', outDir);
})();
