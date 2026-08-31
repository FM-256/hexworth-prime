const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox']});
  for (let i=0;i<3;i++){
    const page = await browser.newPage();
    await page.evaluateOnNewDocument(() => { localStorage.setItem('hexworth_house','phoenix'); });
    await page.setViewport({width: 400, height: 800});
    await page.goto('http://localhost:8842/dashboard.html', {waitUntil:'networkidle0', timeout:20000});
    await new Promise(r=>setTimeout(r,800));
    const tripwireFired = await page.evaluate(()=>!!document.body.innerText.includes('TRIPWIRE'));
    console.log('run',i,'tripwireFired:',tripwireFired);
    await page.close();
  }
  await browser.close();
})();
