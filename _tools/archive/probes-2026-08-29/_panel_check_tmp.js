const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({ headless:'new', args:['--no-sandbox'] });
  const p = await b.newPage();
  await p.setRequestInterception(true);
  p.on('request', r => (/AccessGuard\.js/.test(r.url()) ? r.abort() : r.continue()));
  await p.setViewport({ width:1920, height:1080 });
  await p.goto('https://hexworth.com/houses/cloud/openstack/labs/cloud-openstack-security-sprint.lab.html?cb='+Date.now(), { waitUntil:'domcontentloaded' });
  await new Promise(x=>setTimeout(x,600));
  const m = await p.evaluate(() => {
    const launcher = document.querySelector('[id$="launcher"]');
    const card = launcher ? launcher.closest('.card') : null;
    if (!card) return { noCard:true };
    const cs = getComputedStyle(card);
    // simulate what the launcher appends after a personal-cloud launch
    const probe = document.createElement('div');
    probe.className = 'sandbox-console-panel';
    probe.style.cssText = 'margin-top:1rem;padding:1rem;border:1px solid rgba(255,255,255,.18);border-radius:8px;background:rgba(255,255,255,.04)';
    probe.textContent = 'Web console (Horizon) — user student-20 — password ••••••';
    launcher.appendChild(probe);
    const pr = probe.getBoundingClientRect();
    return {
      cardClasses: card.className,
      cardMaxWidth: cs.maxWidth,
      cardWidth: Math.round(card.getBoundingClientRect().width),
      hasCmdChild: !!card.querySelector('.cmd'),
      panelWidth: Math.round(pr.width),
      panelVisible: pr.width > 0 && pr.height > 0,
    };
  });
  console.log('  launcher card classes :', m.cardClasses);
  console.log('  card has a .cmd child :', m.hasCmdChild);
  console.log('  card computed max-width:', m.cardMaxWidth, '| rendered width', m.cardWidth);
  console.log('  simulated Horizon panel: width', m.panelWidth, '| visible', m.panelVisible);
  await b.close();
})();
