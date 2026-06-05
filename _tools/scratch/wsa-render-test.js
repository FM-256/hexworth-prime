const puppeteer = require('puppeteer');
(async () => {
    const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox','--disable-dev-shm-usage'] });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 720 });
    await page.evaluateOnNewDocument(() => { try { localStorage.setItem('hexworth_house','cloud'); localStorage.setItem('hexworth_sorted','true'); } catch(_){} });
    await page.goto('file:///tmp/m10-test.html', { waitUntil: 'networkidle0', timeout: 8000 });
    await new Promise(r => setTimeout(r, 600));
    await page.evaluate(() => {
        document.querySelectorAll('.slide').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.slide')[4].classList.add('active');
    });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: '/tmp/wsa-sweep/m10-test-S05-stripped.png', fullPage: false });
    const meta = await page.evaluate(() => {
        const s = document.querySelectorAll('.slide')[4];
        const t = s.querySelector('.tv-text');
        const v = s.querySelector('.tv-visual');
        const grid = s.querySelector('.text-visual-grid');
        return {
            slideH: s.clientHeight, slideScrollH: s.scrollHeight,
            tvTextWidth: t ? t.clientWidth : null,
            tvVisualPresent: !!v,
            gridCols: grid ? getComputedStyle(grid).gridTemplateColumns : null
        };
    });
    console.log(JSON.stringify(meta, null, 2));
    await browser.close();
})();
