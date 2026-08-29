const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({args:['--no-sandbox']});
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const u = req.url();
    if (u.includes('AccessGuard.js') || u.includes('FirebaseAuth.js') || u.includes('firebase') || u.includes('SandboxLauncher.js') || u.includes('ModuleProgress.js')) {
      req.abort();
    } else req.continue();
  });
  const fileUrl = 'file:///home/eq/ai-content/hexworth-prime/_app/houses/cloud/openstack/labs/cloud-openstack-cinder-live.lab.html';
  const widths = [
    {width:1366,height:768},{width:1440,height:900},{width:1536,height:864},
    {width:1920,height:1080},{width:1100,height:800},{width:999,height:800},{width:900,height:800}
  ];
  for (const vp of widths) {
    await page.setViewport(vp);
    await page.goto(fileUrl, {waitUntil:'domcontentloaded', timeout:15000}).catch(e=>console.log('goto err', e.message));
    const info = await page.evaluate(() => {
      const paras = Array.from(document.querySelectorAll('p'));
      const stepPara = paras.find(p => p.textContent.includes('Now press') && p.textContent.includes('Record the attachment'));
      if (stepPara) stepPara.scrollIntoView({block:'center'});
      const stepRect = stepPara ? stepPara.getBoundingClientRect() : null;
      const dock = document.querySelector('.term-dock');
      const dockRect = dock ? dock.getBoundingClientRect() : null;
      const dockStyle = dock ? getComputedStyle(dock) : null;
      const launcherDiv = document.getElementById('cinder-launcher');
      const launcherRect = launcherDiv ? launcherDiv.getBoundingClientRect() : null;
      // check overlap between term-dock bottom and steps card top / next step content
      const stepsCard = document.querySelectorAll('.card')[1]; // second .card is Mission Steps
      const stepsCardRect = stepsCard ? stepsCard.getBoundingClientRect() : null;
      return {
        vpH: window.innerHeight,
        stepParaRect: stepRect ? {top:stepRect.top, bottom:stepRect.bottom} : null,
        dockPosition: dockStyle ? dockStyle.position : null,
        dockRect: dockRect ? {top:dockRect.top, bottom:dockRect.bottom, height:dockRect.height} : null,
        launcherRect: launcherRect ? {top:launcherRect.top, bottom:launcherRect.bottom} : null,
        stepsCardTop: stepsCardRect ? stepsCardRect.top : null,
      };
    });
    const dockVisible = info.dockRect && info.dockRect.top < info.vpH && info.dockRect.bottom > 0;
    console.log(JSON.stringify(vp), 'dockPos='+info.dockPosition, 'dockVisible='+dockVisible, JSON.stringify(info));
  }
  await browser.close();
})();
