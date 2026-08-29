const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({args:['--no-sandbox']});
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    const u = req.url();
    if (u.includes('AccessGuard.js') || u.includes('FirebaseAuth.js') || u.includes('firebase')) {
      req.abort();
    } else req.continue();
  });
  const fileUrl = 'file:///home/eq/ai-content/hexworth-prime/_app/houses/cloud/openstack/labs/cloud-openstack-cinder-live.lab.html';
  const widths = [
    {width:1366,height:768},{width:1440,height:900},{width:1536,height:864},
    {width:1920,height:1080},{width:1100,height:800}
  ];
  for (const vp of widths) {
    await page.setViewport(vp);
    await page.goto(fileUrl, {waitUntil:'networkidle0', timeout:15000}).catch(e=>console.log('goto err', e.message));
    const info = await page.evaluate(() => {
      // Simulate a REAL student who launched the sandbox and clicked Open Terminal:
      // call updateUI-equivalent state by directly manipulating what renderButton would do
      // in 'running' state with a fake url, via triggering the internal openBtn click path.
      // We can't call updateUI directly (closure), so we drive it through the public
      // SandboxLauncher API surface indirectly: simulate by finding the open button and
      // firing its handler is not exposed pre-launch. Instead, directly show the elements
      // exactly as updateUI+openBtn.onclick would, matching the CSS classes it sets.
      const wrapper = document.querySelector('.sandbox-launcher');
      const iframeWrap = wrapper.querySelector('.sandbox-launcher__iframe-wrap');
      const openBtn = wrapper.querySelector('.sandbox-launcher__btn--open');
      const launchBtn = wrapper.querySelector('.sandbox-launcher__btn--launch');
      const destroyBtn = wrapper.querySelector('.sandbox-launcher__btn--destroy');
      const timerEl = wrapper.querySelector('.sandbox-launcher__timer');
      const recordBtn = Array.from(document.querySelectorAll('button')).find(b=>b.textContent.trim()==='Record the attachment');
      // Replicate updateUI('running', ...) + the openBtn.onclick embedded-mode branch
      launchBtn.style.display = 'none';
      openBtn.style.display = '';
      destroyBtn.style.display = '';
      timerEl.style.display = '';
      if (recordBtn) recordBtn.style.display = '';
      iframeWrap.style.display = '';
      wrapper.classList.add('is-embedded');

      const paras = Array.from(document.querySelectorAll('p'));
      const stepPara = paras.find(p => p.textContent.includes('Now press') && p.textContent.includes('Record the attachment'));
      stepPara.scrollIntoView({block:'center'});

      const dock = document.querySelector('.term-dock');
      const dockRect = dock.getBoundingClientRect();
      const btnRect = recordBtn ? recordBtn.getBoundingClientRect() : null;
      const stepRect = stepPara.getBoundingClientRect();
      const vh = window.innerHeight;
      const stepsCard = document.querySelectorAll('.card')[1];
      const stepsCardTitleTop = stepsCard.querySelector('h2').getBoundingClientRect().top;
      return {
        vh,
        dockTop: dockRect.top, dockBottom: dockRect.bottom, dockHeight: dockRect.height,
        btnTop: btnRect ? btnRect.top : null, btnBottom: btnRect ? btnRect.bottom : null,
        btnVisible: btnRect ? (btnRect.bottom > 0 && btnRect.top < vh) : null,
        stepTop: stepRect.top, stepBottom: stepRect.bottom,
        overlapDockOverStep: dockRect.bottom > stepRect.top, // dock covering the very paragraph telling them to press it?
        missionStepsHeaderTop: stepsCardTitleTop,
      };
    });
    console.log(JSON.stringify(vp), JSON.stringify(info));
  }
  await browser.close();
})();
