// Render the REAL _app/admin/observatory.html in a headless browser with representative
// sample data, and screenshot it — so the dashboard can be shown without a live admin
// sign-in or touching the production research dataset. Overrides only the auth/gate scripts
// (AccessGuard.js + FirebaseAuth.js + firebase-init.js) via request interception; every other
// asset (the page itself, styles, icons) is served real from _app. NOT a test — a viewer.
const fs = require('fs'), path = require('path'), http = require('http'), pup = require('puppeteer');
const ROOT = path.resolve('_app');
const OUT = process.argv[2] || path.resolve('_tools/observatory/observatory-dashboard.png');

// A 1x1 transparent PNG for any icon that would otherwise 404 (keeps the shot clean).
const PIXEL = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==', 'base64');

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, s) => {
    const p = decodeURIComponent(q.url.split('?')[0]);
    const file = path.join(ROOT, p);
    if (!file.startsWith(ROOT)) { s.writeHead(403); s.end(); return; }
    fs.readFile(file, (err, buf) => {
        if (err) {
            if (/\.(webp|png|svg|jpg|jpeg|gif|ico)$/i.test(p)) { s.writeHead(200, { 'Content-Type': 'image/png' }); s.end(PIXEL); return; }
            s.writeHead(404); s.end(); return;
        }
        s.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
        s.end(buf);
    });
});

// The stub that stands in for firebase-init.js: defines ArenaFirebase + a modular-Firestore
// shim backed by an in-memory sample dataset, so the dashboard's real loadData()/renderAll()
// run unchanged.
const STUB = `
window.FirebaseAuth = window.FirebaseAuth || { init: function(){}, waitForAuth: function(){ return Promise.resolve(null); } };
(function(){
  var DAY = 86400000, now = Date.now();
  function ts(msAgo){ var d = new Date(now - msAgo); return { toDate: function(){ return d; } }; }
  var CLASSES = [
    { id:'summer-2026-aplus', label:'Summer 2026 - A+ Core 1' },
    { id:'fall-2026-aplus',   label:'Fall 2026 - A+ Core 1' }
  ];
  var NAMES = ['Jordan Rivera','Priya Nair','Marcus Chen','Aisha Bello','Diego Santos','Hana Kim','Liam O\\'Connor','Sofia Rossi','Noah Baptiste','Yuki Tanaka','Grace Mbeki','Omar Haddad'];
  var CH = ['ch01-motherboards','ch02-cpus','ch03-ram','ch04-storage','ch05-power','ch06-peripherals'];
  var LAB = ['forge-lab-psu-swap','forge-lab-ram-install','forge-lab-ssd-clone'];
  var QUIZ = ['aplus-core1-prep-r1','aplus-core1-prep-r2'];
  var PLAT = ['Win32','MacIntel','Linux x86_64','iPhone','Linux armv8l'];
  var VP = ['1920x1080','1440x900','1366x768','390x844','1280x800'];
  var CONN = ['4g','wifi','4g','3g','4g'];
  var ERRS = ['TypeError: Cannot read properties of null','ReferenceError: BoxEngine is not defined','Uncaught (in promise) NetworkError'];
  function pick(a, i){ return a[i % a.length]; }
  function rnd(n){ return Math.floor(Math.random()*n); }

  var STUDENTS = [], ACTIVITY = [];
  for (var i=0;i<12;i++){
    var cls = CLASSES[i % 2];
    var fv = (i < 9) ? 'cerbi-v2-2026-07-05' : 'cerbi-v1-2026-06-21';   // most re-consented, a few not yet
    var uid = 'stu-' + (100+i);
    STUDENTS.push({ uid:uid, id:uid, name:NAMES[i], displayName:NAMES[i], email:NAMES[i].toLowerCase().replace(/[^a-z]/g,'.')+'@student.edu',
      classId:cls.id, className:cls.label, formVersion:fv, enrolledAt:new Date(now-(i+1)*DAY).toISOString() });

    // device (once)
    ACTIVITY.push({ type:'device', uid:uid, classId:cls.id, at:ts(i*DAY+3600000), path:'/houses/forge/applets/comptia-aplus/core-1/chapters/'+pick(CH,i)+'/index.html',
      viewport:pick(VP,i), platform:pick(PLAT,i), connection:pick(CONN,i), reducedMotion:(i%4===0) });

    var views = 3 + rnd(5);
    for (var v=0; v<views; v++){
      var mod = pick(CH, i+v), when = i*DAY + v*1800000 + rnd(600000);
      ACTIVITY.push({ type:'page_view', uid:uid, classId:cls.id, at:ts(when), course:'comptia-aplus/core-1',
        path:'/houses/forge/applets/comptia-aplus/core-1/chapters/'+mod+'/index.html' });
      var dur = 120 + rnd(1500);
      ACTIVITY.push({ type:'session_end', uid:uid, classId:cls.id, at:ts(when-1000), sessionId:uid+'-'+v,
        durationSec:dur, activeSec:Math.round(dur*(0.5+Math.random()*0.4)), maxScrollPct:40+rnd(61),
        path:'/houses/forge/applets/comptia-aplus/core-1/chapters/'+mod+'/index.html' });
    }
    // completions (fewer)
    var comps = 1 + rnd(4);
    for (var c=0; c<comps; c++){
      var isQuiz = (c % 3 === 2);
      var mid = isQuiz ? 'forge-'+pick(QUIZ,c) : (c%2 ? 'forge-'+pick(LAB,c) : 'forge-'+pick(CH,i+c));
      ACTIVITY.push({ type:'content_complete', uid:uid, classId:cls.id, at:ts(i*DAY+c*2400000), moduleId:mid,
        score: isQuiz ? (70 + rnd(31)) : null, path:'/houses/forge/applets/comptia-aplus/core-1/'+(isQuiz?'quizzes':'chapters')+'/'+mid+'/index.html' });
    }
    // a course_click + a house_dwell for the older views
    ACTIVITY.push({ type:'course_click', uid:uid, classId:cls.id, at:ts(i*DAY+300000), name:'A+ Core 1', target:'obs-aplus-core1', path:'/houses/observatory/index.html' });
    ACTIVITY.push({ type:'house_dwell', uid:uid, classId:cls.id, at:ts(i*DAY+200000), seconds:60+rnd(900), path:'/houses/observatory/index.html' });
  }
  // a handful of client errors across a few students
  for (var e=0;e<5;e++){
    var su = STUDENTS[rnd(STUDENTS.length)];
    ACTIVITY.push({ type:'client_error', uid:su.uid, classId:su.classId, at:ts(e*7200000+3600000), message:pick(ERRS,e),
      source:'/houses/forge/applets/comptia-aplus/core-1/labs/forge-lab-ram-install/index.html' });
  }
  ACTIVITY.sort(function(a,b){ return b.at.toDate() - a.at.toDate(); });   // newest first, like the real orderBy('at','desc')

  function snap(list, idKey){ return { size:list.length, forEach:function(cb){ list.forEach(function(it,ix){ cb({ id: (idKey && it[idKey]) || String(ix), data:function(){ return it; } }); }); } }; }

  window.firebaseFirestore = {
    collection: function(db, name){ return { name:name }; },
    where: function(field, op, val){ return { __where:true, field:field, op:op, val:val }; },
    orderBy: function(){ return { __ob:true }; },
    limit: function(n){ return { __lim:n }; },
    query: function(coll){ var args = Array.prototype.slice.call(arguments,1); return { name:coll.name, where: args.filter(function(a){ return a && a.__where; })[0] }; },
    getDocs: async function(ref){
      var name = ref.name, w = ref.where;
      if (name === 'observatory_enrollment') return snap(STUDENTS, 'uid');
      if (name === 'observatory_classes') return snap(CLASSES.map(function(c){ return { id:c.id, label:c.label }; }), 'id');
      if (name === 'observatory_withdrawals') return snap([{ id:'stu-999' }], 'id');
      if (name === 'observatory_activity'){
        var list = w ? ACTIVITY.filter(function(ev){ return ev.type === w.val; }) : ACTIVITY;
        return snap(list, null);
      }
      return snap([], null);
    }
  };
  window.ArenaFirebase = { isReady: async function(){}, db:{}, auth:{ currentUser:{ uid:'admin-preview', isAnonymous:false } } };
})();
`;

(async () => {
    await new Promise(r => srv.listen(0, r));
    const port = srv.address().port;
    const browser = await pup.launch({ headless: 'new', args: ['--no-sandbox'] });
    const pg = await browser.newPage();
    await pg.setViewport({ width: 1440, height: 1000, deviceScaleFactor: 2 });
    const logs = [];
    pg.on('console', m => logs.push(m.type() + ': ' + m.text()));
    pg.on('pageerror', e => logs.push('PAGEERROR: ' + e.message));
    await pg.setRequestInterception(true);
    pg.on('request', req => {
        const u = req.url();
        // AccessGuard.require('admin') runs in the page head and would block/redirect the
        // dashboard without a real admin session; stub it to a no-op so the page renders.
        // (The real admin gate is the Firestore rules server-side; this only affects the shot.)
        if (/AccessGuard\.js/.test(u)) return req.respond({ status: 200, contentType: 'text/javascript', body: 'window.AccessGuard={require:function(){},isAdmin:function(){return Promise.resolve(true);}};' });
        if (/firebase-init\.js/.test(u)) return req.respond({ status: 200, contentType: 'text/javascript', body: STUB });
        if (/FirebaseAuth\.js/.test(u)) return req.respond({ status: 200, contentType: 'text/javascript', body: 'window.FirebaseAuth={init:function(){},waitForAuth:function(){return Promise.resolve(null);}};' });
        req.continue();
    });
    await pg.goto('http://localhost:' + port + '/admin/observatory.html', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));
    const status = await pg.evaluate(() => { const s = document.getElementById('status'); return s ? s.textContent : '(no #status)'; });
    console.log('status line:', status);
    const sections = await pg.evaluate(() => Array.from(document.querySelectorAll('h2')).map(h => h.textContent.trim()));
    console.log('sections:', JSON.stringify(sections));
    const errs = logs.filter(l => /PAGEERROR/.test(l));
    console.log('page errors:', errs.length, errs.slice(0, 3).join(' | '));
    await pg.screenshot({ path: OUT, fullPage: true });
    console.log('screenshot ->', OUT);
    await browser.close();
    await new Promise(r => srv.close(r));
})();
