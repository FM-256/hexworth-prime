const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({headless: 'new', args: ['--no-sandbox']});

  // 1. Desktop view, no reduced motion
  {
    const page = await browser.newPage();
    await page.setViewport({width: 1280, height: 800});
    await page.goto('http://localhost:8842/dashboard.html', {waitUntil: 'networkidle0'});
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
      };
    });
    console.log('DESKTOP INFO:', JSON.stringify(info, null, 2));
    await page.screenshot({path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/2f9c2d95-8de7-4fbb-bf58-ed2b72f793dd/scratchpad/desktop_header.png', clip: {x:0,y:0,width:1280,height:120}});
    await page.close();
  }

  // 2. Narrow viewport <640px
  {
    const page = await browser.newPage();
    await page.setViewport({width: 400, height: 800});
    await page.goto('http://localhost:8842/dashboard.html', {waitUntil: 'networkidle0'});
    const info = await page.evaluate(() => {
      const el = document.querySelector('.hexos-callout');
      const span = el ? el.querySelector('span') : null;
      const img = el ? el.querySelector('img') : null;
      return {
        spanDisplay: span ? getComputedStyle(span).display : null,
        imgDisplay: img ? getComputedStyle(img).display : null,
        calloutRect: el ? el.getBoundingClientRect() : null,
      };
    });
    console.log('NARROW INFO:', JSON.stringify(info, null, 2));
    await page.screenshot({path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/2f9c2d95-8de7-4fbb-bf58-ed2b72f793dd/scratchpad/narrow_header.png', clip: {x:0,y:0,width:400,height:120}});
    await page.close();
  }

  // 3. Reduced motion emulation
  {
    const page = await browser.newPage();
    await page.emulateMediaFeatures([{name: 'prefers-reduced-motion', value: 'reduce'}]);
    await page.setViewport({width: 1280, height: 800});
    await page.goto('http://localhost:8842/dashboard.html', {waitUntil: 'networkidle0'});
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
    await page.setViewport({width: 1280, height: 900});
    await page.goto('http://localhost:8842/dashboard.html', {waitUntil: 'networkidle0'});
    // try clicking hamburger/avatar trigger
    const clicked = await page.evaluate(() => {
      const hamburger = document.getElementById('navHamburger');
      if (hamburger) { hamburger.click(); return 'navHamburger'; }
      return null;
    });
    await new Promise(r => setTimeout(r, 300));
    const menu = await page.evaluate(() => {
      const m = document.getElementById('navMenu');
      return m ? {display: getComputedStyle(m).display, html_snippet: m.innerHTML.slice(0,300)} : null;
    });
    console.log('CLICKED:', clicked, 'MENU:', JSON.stringify(menu));
    await page.screenshot({path: '/tmp/claude-1000/-home-eq-ai-content-hexworth-prime/2f9c2d95-8de7-4fbb-bf58-ed2b72f793dd/scratchpad/menu_open.png', fullPage: false});
    await page.close();
  }

  await browser.close();
})();
