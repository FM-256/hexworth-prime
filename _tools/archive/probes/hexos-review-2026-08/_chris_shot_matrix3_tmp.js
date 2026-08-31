const puppeteer = require('puppeteer');

async function withSession(page) {
  await page.evaluateOnNewDocument(() => {
    localStorage.setItem('hexworth_house', 'phoenix');
  });
}

(async () => {
  const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox']});

  // 1. Desktop view, no reduced motion
  {
    const page = await browser.newPage();
    await withSession(page);
    await page.setViewport({width: 1280, height: 800});
    await page.goto('http://localhost:8842/dashboard.html', {waitUntil: 'networkidle0', timeout: 20000});
    await new Promise(r=>setTimeout(r,500));
    console.log('URL after load:', page.url());
    const info = await page.evaluate(() => {
      const el = document.querySelector('.hexos-callout');
      const menuLink = Array.from(document.querySelectorAll('#navMenu a, nav a')).find(a => a.textContent.includes('Hex OS'));
      const adminGroup = document.getElementById('adminMenuGroup');
      let insideAdmin = false;
      if (menuLink && adminGroup) insideAdmin = adminGroup.contains(menuLink);
      const rect = el ? el.getBoundingClientRect() : null;
      const style = el ? getComputedStyle(el) : null;
      return {
        calloutExists: !!el,
        calloutVisible: el ? (style.display !== 'none' && style.visibility !== 'hidden' && rect.width > 0 && rect.height > 0) : false,
        calloutRect: rect,
        calloutText: el ? el.textContent.trim() : null,
        calloutHref: el ? el.getAttribute('href') : null,
        calloutAnimationName: style ? style.animationName : null,
        menuLinkExists: !!menuLink,
        menuLinkHref: menuLink ? menuLink.getAttribute('href') : null,
        insideAdminGroup: insideAdmin,
        adminGroupDisplay: adminGroup ? getComputedStyle(adminGroup).display : null,
        isAdminMenuVisibleToThisUser: adminGroup ? getComputedStyle(adminGroup).display !== 'none' : null,
      };
    });
    console.log('DESKTOP INFO:', JSON.stringify(info, null, 2));
    await page.screenshot({path: '/home/eq/ai-content/hexworth-prime/_chris_desktop_header.png', clip: {x:0,y:0,width:1280,height:130}});
    await page.close();
  }

  // 2. Narrow viewport <640px
  {
    const page = await browser.newPage();
    await withSession(page);
    await page.setViewport({width: 400, height: 800});
    await page.goto('http://localhost:8842/dashboard.html', {waitUntil: 'networkidle0', timeout: 20000});
    await new Promise(r=>setTimeout(r,500));
    const info = await page.evaluate(() => {
      const el = document.querySelector('.hexos-callout');
      const span = el ? el.querySelector('span') : null;
      const img = el ? el.querySelector('img') : null;
      return {
        spanDisplay: span ? getComputedStyle(span).display : null,
        imgDisplay: img ? getComputedStyle(img).display : null,
        calloutRect: el ? el.getBoundingClientRect() : null,
        bodyScrollWidth: document.body.scrollWidth,
        windowInnerWidth: window.innerWidth,
      };
    });
    console.log('NARROW INFO:', JSON.stringify(info, null, 2));
    await page.screenshot({path: '/home/eq/ai-content/hexworth-prime/_chris_narrow_header.png', clip: {x:0,y:0,width:400,height:130}});
    await page.close();
  }

  // 3. Reduced motion emulation
  {
    const page = await browser.newPage();
    await withSession(page);
    await page.emulateMediaFeatures([{name: 'prefers-reduced-motion', value: 'reduce'}]);
    await page.setViewport({width: 1280, height: 800});
    await page.goto('http://localhost:8842/dashboard.html', {waitUntil: 'networkidle0', timeout: 20000});
    await new Promise(r=>setTimeout(r,500));
    const info = await page.evaluate(() => {
      const el = document.querySelector('.hexos-callout');
      const style = el ? getComputedStyle(el) : null;
      return {
        animationName: style ? style.animationName : null,
        opacity: style ? style.opacity : null,
      };
    });
    console.log('REDUCED MOTION INFO:', JSON.stringify(info, null, 2));
    await page.close();
  }

  // 4. Menu open, non-admin - screenshot full menu
  {
    const page = await browser.newPage();
    await withSession(page);
    await page.setViewport({width: 1280, height: 1100});
    await page.goto('http://localhost:8842/dashboard.html', {waitUntil: 'networkidle0', timeout: 20000});
    await new Promise(r=>setTimeout(r,500));
    const trigger = await page.evaluate(() => {
      const candidates = ['navHamburger', 'hamburgerBtn', 'menuTrigger', 'avatarMenuTrigger'];
      for (const id of candidates) { if (document.getElementById(id)) return id; }
      // fallback: find element with onclick referencing navMenu
      const all = Array.from(document.querySelectorAll('*'));
      const el = all.find(e => e.getAttribute && e.getAttribute('onclick') && e.getAttribute('onclick').includes('navMenu'));
      return el ? (el.id || el.className) : null;
    });
    console.log('trigger candidate:', trigger);
    // force menu open directly for screenshot purposes
    await page.evaluate(() => {
      const m = document.getElementById('navMenu');
      if (m) m.style.display = 'block';
      // expand all collapsed sections so the Hex OS line is visible in the shot
    });
    await new Promise(r=>setTimeout(r,300));
    const menuInfo = await page.evaluate(() => {
      const m = document.getElementById('navMenu');
      const adminGroup = document.getElementById('adminMenuGroup');
      return {
        menuDisplay: m ? getComputedStyle(m).display : null,
        adminGroupDisplay: adminGroup ? getComputedStyle(adminGroup).display : null,
      };
    });
    console.log('menuInfo:', JSON.stringify(menuInfo));
    await page.screenshot({path: '/home/eq/ai-content/hexworth-prime/_chris_menu_open.png'});
    await page.close();
  }

  await browser.close();
})();
