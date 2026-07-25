// Throwaway preview-capture harness (scratchpad, NOT production).
// Serves _app/ locally, intercepts the Firebase Hosting /__/firebase/* scripts and
// replaces them with a MOCK firebase compat SDK seeded with representative sample
// tournament data. This renders the REAL page code (broadcast.html / tournament-podium.html)
// fully populated, with zero production writes and no dependency on prod having a live event.
// Screenshots are genuine renders of the real UI with sample data.
const http = require('http');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const APP_DIR = path.resolve(__dirname, '../../_app');
const OUT = path.resolve(__dirname, '../../_docs/features/screenshots/tournament-broadcast');
const PORT = 8791;
const MIME = { '.html':'text/html', '.js':'application/javascript', '.css':'text/css', '.json':'application/json', '.webp':'image/webp', '.svg':'image/svg+xml', '.png':'image/png' };

fs.mkdirSync(OUT, { recursive: true });

// ── Local static server for _app/ ──
function startServer() {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      let urlPath = req.url.split('?')[0];
      if (urlPath === '/') urlPath = '/index.html';
      const filePath = path.join(APP_DIR, urlPath);
      if (!filePath.startsWith(APP_DIR)) { res.writeHead(403).end(); return; }
      fs.readFile(filePath, (err, data) => {
        if (err) { res.writeHead(404).end('not found'); return; }
        res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
        res.end(data);
      });
    });
    server.listen(PORT, () => resolve(server));
  });
}

// ── Mock firebase compat SDK, injected as the /__/firebase/init.js response ──
// (the compat libs are stubbed empty; init.js defines window.firebase fully.)
const MOCK_FIREBASE = `
(function(){
  var NOW = Date.now();
  function ts(offMs){ return { toDate: function(){ return new Date(NOW + offMs); }, seconds: Math.floor((NOW+offMs)/1000) }; }
  var min = 60000;
  var TOURNAMENTS = [
    { id:'demo-autumn-clash', name:'Autumn Cyber Clash 2026', description:'Invitational CTF — Keiser University', status:'active', startTime: ts(-95*min), duration:180, createdAt: ts(-7*24*60*min) }
  ];
  // Two teams tied at 4200 to demo the BUG-022 tie-break (earlier lastSolveTime ranks higher).
  var TEAMS = [
    { id:'team-cyan',   name:'Cyan Storm',   color:'#06b6d4', score:4200, solves:['web-100','crypto-300','pwn-500','rev-200','forensics-150','misc-250','web-400'], lastSolveTime: ts(-6*min), members:['u1','u2','u3'], memberNames:['Alex Rivera','Sam Chen','Priya Nair'] },
    { id:'team-red',    name:'Red Cell',     color:'#ef4444', score:4200, solves:['web-100','crypto-300','pwn-500','rev-200','forensics-150','misc-250','web-400'], lastSolveTime: ts(-2*min), members:['u4','u5','u6'], memberNames:['Jordan Blake','Mia Torres','Dev Patel'] },
    { id:'team-blue',   name:'Blue Shield',  color:'#3b82f6', score:3500, solves:['web-100','crypto-300','pwn-500','rev-200','forensics-150','misc-250'], lastSolveTime: ts(-9*min), members:['u7','u8','u9'], memberNames:['Chris Vaughn','Lena Ford','Omar Said'] },
    { id:'team-gold',   name:'Gold Strike',  color:'#f59e0b', score:2900, solves:['web-100','crypto-300','pwn-500','rev-200','forensics-150'], lastSolveTime: ts(-14*min), members:['u10','u11'], memberNames:['Taylor Kim','Noah Reed'] },
    { id:'team-green',  name:'Green Ops',    color:'#22c55e', score:2100, solves:['web-100','crypto-300','pwn-500','rev-200'], lastSolveTime: ts(-22*min), members:['u12','u13','u14'], memberNames:['Ivy Chen','Marco Diaz','Ada Cole'] },
    { id:'team-purple', name:'Purple Haze',  color:'#a855f7', score:900,  solves:['web-100','crypto-300'], lastSolveTime: ts(-40*min), members:['u15','u16'], memberNames:['Ren Watanabe','Zoe Hart'] }
  ];
  var CHALLENGES = [
    { id:'web-100', title:'SQL Injection 101', category:'Web', points:100, order:0 },
    { id:'crypto-300', title:'RSA Redux', category:'Crypto', points:300, order:1 },
    { id:'pwn-500', title:'Heap Feng Shui', category:'Pwn', points:500, order:2 },
    { id:'rev-200', title:'Obfuscated Nightmare', category:'Rev', points:200, order:3 },
    { id:'forensics-150', title:'Packet Hunt', category:'Forensics', points:150, order:4 },
    { id:'misc-250', title:'Stego Surprise', category:'Misc', points:250, order:5 },
    { id:'web-400', title:'JWT Forge', category:'Web', points:400, order:6 }
  ];
  // Correct submissions (newest first) — feed the ticker + spotlight "recent captures".
  var SUBS = [
    { teamId:'team-red', teamName:'Red Cell', challengeId:'web-400', points:400, correct:true, timestamp: ts(-2*min) },
    { teamId:'team-cyan', teamName:'Cyan Storm', challengeId:'web-400', points:400, correct:true, timestamp: ts(-6*min) },
    { teamId:'team-blue', teamName:'Blue Shield', challengeId:'misc-250', points:250, correct:true, timestamp: ts(-9*min) },
    { teamId:'team-red', teamName:'Red Cell', challengeId:'pwn-500', points:500, correct:true, timestamp: ts(-11*min) },
    { teamId:'team-cyan', teamName:'Cyan Storm', challengeId:'pwn-500', points:500, correct:true, timestamp: ts(-13*min) },
    { teamId:'team-gold', teamName:'Gold Strike', challengeId:'forensics-150', points:150, correct:true, timestamp: ts(-14*min) },
    { teamId:'team-red', teamName:'Red Cell', challengeId:'misc-250', points:250, correct:true, timestamp: ts(-16*min) },
    { teamId:'team-blue', teamName:'Blue Shield', challengeId:'rev-200', points:200, correct:true, timestamp: ts(-18*min) },
    { teamId:'team-green', teamName:'Green Ops', challengeId:'rev-200', points:200, correct:true, timestamp: ts(-22*min) },
    { teamId:'team-cyan', teamName:'Cyan Storm', challengeId:'crypto-300', points:300, correct:true, timestamp: ts(-25*min) }
  ];

  // Minimal chainable query mock: holds an array, supports orderBy/where/limit/get/onSnapshot.
  function Query(rows){ this._rows = rows.slice(); }
  Query.prototype.orderBy = function(field, dir){
    var r = this._rows.slice();
    r.sort(function(a,b){ var av=a[field], bv=b[field];
      if (av && av.seconds!==undefined) av = av.seconds; if (bv && bv.seconds!==undefined) bv = bv.seconds;
      if (av<bv) return dir==='desc'?1:-1; if (av>bv) return dir==='desc'?-1:1; return 0; });
    return new Query(r);
  };
  Query.prototype.where = function(){ return this; };
  Query.prototype.limit = function(n){ return new Query(this._rows.slice(0, n)); };
  function snap(rows){ return { empty: rows.length===0, size: rows.length,
    forEach: function(fn){ rows.forEach(function(row){ fn({ id: row.id, exists:true, data: function(){ return row; } }); }); } }; }
  Query.prototype.get = function(){ return Promise.resolve(snap(this._rows)); };
  Query.prototype.onSnapshot = function(cb){ try { cb(snap(this._rows)); } catch(e){ console.error(e); } return function(){}; };

  function DocRef(row, subs){ this._row = row; this._subs = subs || {}; }
  DocRef.prototype.onSnapshot = function(cb){ var self=this; try { cb({ exists: !!self._row, id: self._row&&self._row.id, data: function(){ return self._row; } }); } catch(e){ console.error(e); } return function(){}; };
  DocRef.prototype.get = function(){ var self=this; return Promise.resolve({ exists: !!self._row, id: self._row&&self._row.id, data: function(){ return self._row; } }); };
  DocRef.prototype.collection = function(name){ return new Query(this._subs[name] || []); };
  DocRef.prototype.update = function(){ return Promise.resolve(); };
  DocRef.prototype.set = function(){ return Promise.resolve(); };

  function db(){}
  var DB = {
    collection: function(name){
      if (name==='tournaments'){
        var q = new Query(TOURNAMENTS);
        q.doc = function(id){ return new DocRef(TOURNAMENTS[0], { teams: TEAMS, challenges: CHALLENGES, submissions: SUBS }); };
        return q;
      }
      return new Query([]);
    },
    doc: function(pathStr){ return new DocRef(TOURNAMENTS[0], { teams: TEAMS, challenges: CHALLENGES, submissions: SUBS }); }
  };

  window.firebase = {
    apps: [{ name:'[DEFAULT]' }],
    initializeApp: function(){ return this.apps[0]; },
    app: function(){ return this.apps[0]; },
    firestore: function(){ return DB; },
    auth: function(){ return {
      currentUser: { uid:'previewViewer', displayName:'Preview Viewer' },
      signInAnonymously: function(){ return Promise.resolve({ user:{ uid:'previewViewer' } }); },
      onAuthStateChanged: function(cb){ cb({ uid:'previewViewer', displayName:'Preview Viewer' }); return function(){}; }
    }; }
  };
  window.firebase.firestore.FieldValue = { serverTimestamp: function(){ return ts(0); }, arrayUnion:function(){return{};}, arrayRemove:function(){return{};}, increment:function(){return{};} };
  window.firebase.firestore.Timestamp = { fromDate: function(d){ return ts(d.getTime()-NOW); } };
  window.firebase.auth.GoogleAuthProvider = function(){}; // referenced by lobby's sign-in button (not on load)
})();
`;

// Stubs for spectator.html's component gates so the static header (with the Big Screen link) paints
// without redirecting to /unauthorized. Only these exact component files are stubbed.
const STUBS = {
  '/components/AccessGuard.js': 'window.AccessGuard={require:function(){},getRole:function(){return "sorted";},getUser:function(){return {uid:"previewViewer"};}};',
  '/components/FirebaseAuth.js': 'window.FirebaseAuth={waitForAuth:function(){return Promise.resolve({uid:"previewViewer",displayName:"Preview Viewer"});},callFunction:function(){return Promise.resolve({data:{}});},getUser:function(){return {uid:"previewViewer"};}};',
  '/components/TenantShell.js': 'window.TenantShell={init:function(){},apply:function(){},boot:function(){}};',
};

async function main() {
  const server = await startServer();
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox','--disable-setuid-sandbox'] });

  async function newPreviewPage(w, h) {
    const page = await browser.newPage();
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    await page.setRequestInterception(true);
    page.on('request', (req) => {
      const u = req.url();
      if (u.includes('/__/firebase/')) {
        if (u.endsWith('init.js')) return req.respond({ status:200, contentType:'application/javascript', body: MOCK_FIREBASE });
        return req.respond({ status:200, contentType:'application/javascript', body: '//stub' });
      }
      const stubKey = Object.keys(STUBS).find(k => u.split('?')[0].endsWith(k));
      if (stubKey) return req.respond({ status:200, contentType:'application/javascript', body: STUBS[stubKey] });
      req.continue();
    });
    page.on('console', m => { if (m.type()==='error') console.log('  [page error]', m.text().slice(0,180)); });
    return page;
  }

  // ── broadcast.html — wait for each director scene and capture it ──
  const bp = await newPreviewPage(1600, 900);
  await bp.goto(`http://localhost:${PORT}/arena/broadcast.html`, { waitUntil:'networkidle0' });
  await new Promise(r => setTimeout(r, 1500));

  async function captureScene(label, file, timeoutMs) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const scene = await bp.$eval('#hudSceneName', el => el.textContent).catch(()=>'');
      if (scene && scene.toLowerCase().includes(label.toLowerCase())) {
        await new Promise(r => setTimeout(r, 700)); // let crossfade settle
        await bp.screenshot({ path: `${OUT}/${file}` });
        console.log(`  captured ${file} (scene=${scene})`);
        return true;
      }
      await new Promise(r => setTimeout(r, 500));
    }
    // fallback: capture whatever is on screen
    await bp.screenshot({ path: `${OUT}/${file}` });
    console.log(`  captured ${file} (fallback, scene not matched)`);
    return false;
  }
  await captureScene('Standings', 'broadcast-1-standings.png', 12000);
  await captureScene('Race', 'broadcast-2-race.png', 12000);
  await captureScene('Spotlight', 'broadcast-3-spotlight.png', 12000);
  await bp.close();

  // ── tournament-podium.html ──
  const pp = await newPreviewPage(1440, 1000);
  await pp.goto(`http://localhost:${PORT}/arena/tournament-podium.html?id=demo-autumn-clash`, { waitUntil:'networkidle0' });
  await new Promise(r => setTimeout(r, 1800));
  await pp.screenshot({ path: `${OUT}/podium.png`, fullPage: true });
  console.log('  captured podium.png');
  await pp.close();

  // ── tournament-lobby.html (registration / Choose Your Team) ──
  const lp = await newPreviewPage(1440, 1000);
  await lp.goto(`http://localhost:${PORT}/arena/tournament-lobby.html?id=demo-autumn-clash`, { waitUntil:'domcontentloaded' });
  await new Promise(r => setTimeout(r, 2000));
  await lp.screenshot({ path: `${OUT}/lobby.png`, fullPage: true });
  console.log('  captured lobby.png');
  await lp.close();

  // ── spectator.html (the Panopticon) — capture the header showing the [ Big Screen ] entry ──
  const sp = await newPreviewPage(1600, 900);
  await sp.goto(`http://localhost:${PORT}/arena/spectator.html`, { waitUntil:'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1800));
  const header = await sp.$('.spec-header');
  if (header) { await header.screenshot({ path: `${OUT}/panopticon-header.png` }); console.log('  captured panopticon-header.png (element)'); }
  else { await sp.screenshot({ path: `${OUT}/panopticon-header.png`, clip:{x:0,y:0,width:1600,height:120} }); console.log('  captured panopticon-header.png (clip fallback)'); }
  await sp.close();

  await browser.close();
  server.close();
  console.log('DONE. Shots in', OUT);
}
main().catch(e => { console.error(e); process.exit(1); });
