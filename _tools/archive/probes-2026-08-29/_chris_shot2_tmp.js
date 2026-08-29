const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({args:['--no-sandbox']});
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const u = req.url();
    if (u.includes('AccessGuard.js') || u.includes('FirebaseAuth.js') || u.includes('firebase')) req.abort();
    else req.continue();
  });
  const fileUrl = 'file:///home/eq/ai-content/hexworth-prime/_app/houses/cloud/openstack/labs/cloud-openstack-cinder-live.lab.html';
  await page.setViewport({width:1366,height:768});
  await page.goto(fileUrl, {waitUntil:'networkidle0', timeout:15000});
  const dbg = await page.evaluate(() => {
    const wrapper = document.querySelector('.sandbox-launcher');
    const iframeWrap = wrapper.querySelector('.sandbox-launcher__iframe-wrap');
    const openBtn = wrapper.querySelector('.sandbox-launcher__btn--open');
    const launchBtn = wrapper.querySelector('.sandbox-launcher__btn--launch');
    const destroyBtn = wrapper.querySelector('.sandbox-launcher__btn--destroy');
    const timerEl = wrapper.querySelector('.sandbox-launcher__timer');
    const recordBtn = Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='Record the attachment');
    launchBtn.style.display = 'none';
    openBtn.style.display = '';
    destroyBtn.style.display = '';
    timerEl.style.display = '';
    if (recordBtn) recordBtn.style.display = '';
    iframeWrap.style.display = '';
    wrapper.classList.add('is-embedded');
    const paras = Array.from(document.querySelectorAll('p'));
    const stepPara = paras.find(p => p.textContent.includes('Now press') && p.textContent.includes('Record the attachment'));
    stepPara.style.outline = '5px solid red';
    stepPara.style.background = 'yellow';
    stepPara.scrollIntoView({block:'center'});
    const r = stepPara.getBoundingClientRect();
    const btnR = recordBtn.getBoundingClientRect();
    return { scrollY: window.scrollY, stepRectTop: r.top, stepRectBottom: r.bottom, btnTop: btnR.top, btnBottom: btnR.bottom,
      dockZ: getComputedStyle(document.querySelector('.term-dock')).zIndex,
      elAtPoint: (function(){ const cx = r.left+10, cy=(r.top+r.bottom)/2; const el = document.elementFromPoint(cx,cy); return el ? el.outerHTML.slice(0,120) : null; })()
    };
  });
  console.log(JSON.stringify(dbg, null, 2));
  await new Promise(r=>setTimeout(r, 200));
  await page.screenshot({path:'/home/eq/ai-content/hexworth-prime/_chris_overlap_1366_v2.png'});
  await browser.close();
})();
