const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({ headless:'new', args:['--no-sandbox','--disable-dev-shm-usage'] });
  const p = await b.newPage();
  const errs=[], fails=[];
  p.on('pageerror', e => errs.push(e.message.slice(0,120)));
  p.on('requestfailed', r => fails.push(r.url().split('/').pop() + ' ' + (r.failure()||{}).errorText));
  await p.goto('http://127.0.0.1:5660/admin/console.html', { waitUntil:'domcontentloaded', timeout:45000 });
  await new Promise(r=>setTimeout(r,2500));
  console.log('  final url :', p.url());
  console.log('  title     :', await p.title());
  console.log('  QRCode    :', await p.evaluate(()=>typeof QRCode));
  console.log('  container :', await p.evaluate(()=>!!document.getElementById('ctfJoinQr')));
  console.log('  renderFn  :', await p.evaluate(()=>typeof window.renderJoinQr));
  console.log('  scripts   :', await p.evaluate(()=>[...document.querySelectorAll('script[src]')].map(s=>s.src.split('/').pop()).join(',')));
  console.log('  pageerrors:', errs.slice(0,3).join(' | ') || 'none');
  console.log('  failed req:', fails.slice(0,4).join(' | ') || 'none');
  await b.close();
})();
