const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox']});
  for (const w of [320,375,400,480,600,639,640,700,800,1024,1280]){
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => { localStorage.setItem('hexworth_house','phoenix'); });
    await page.setViewport({width: w, height: 800});
    await page.goto('http://localhost:8842/dashboard.html', {waitUntil:'networkidle0', timeout:20000});
    await new Promise(r=>setTimeout(r,800));
    const tripwireFired = await page.evaluate(()=>!!document.body.innerText.includes('TRIPWIRE'));
    console.log('width',w,'tripwireFired:',tripwireFired);
    await page.close();
  }
  await browser.close();
})();
