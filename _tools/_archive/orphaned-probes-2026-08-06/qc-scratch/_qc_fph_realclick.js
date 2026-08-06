const puppeteer = require('puppeteer');
const path = require('path');
const FILE='file://'+path.resolve('_app/houses/forge/applets/comptia-aplus/core-1/labs/forge-front-panel-header.lab.html');
const STUB='window.AccessGuard={require(){},requireAdmin(){}};';
(async()=>{
const b=await puppeteer.launch({headless:'new',args:['--no-sandbox']});
const p=await b.newPage();
await p.setViewport({width:1280,height:900});
await p.setRequestInterception(true);
p.on('request',r=>{const u=r.url();
 if(u.endsWith('/components/AccessGuard.js'))r.respond({status:200,contentType:'application/javascript',body:STUB});
 else if(u.startsWith('http')&&(u.includes('/_lib/')||u.includes('/assets/')))r.abort();
 else r.continue();});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto(FILE,{waitUntil:'domcontentloaded'});
await p.evaluate(()=>{window.__done=null;const o=ModuleProgress.complete;ModuleProgress.complete=function(...a){window.__done=a;try{return o.apply(this,a)}catch(e){}};});
// real clicks only
await p.click('#btn-identify');
async function realPlaceSwitch(id){await p.click('#chip-'+id);await p.click(`.pin-socket[data-group-id="${id}"][data-pin-idx="0"]`);}
async function realPlaceLed(id){await p.click('#chip-'+id);await p.click('#orient-normal');await p.click(`.pin-socket[data-group-id="${id}"][data-pin-idx="0"]`);}
await realPlaceSwitch('pwr-sw');
await realPlaceSwitch('reset-sw');
await realPlaceLed('pwr-led');
await realPlaceLed('hdd-led');
// speaker non-polar, pin-idx 0 is non-NC
await p.click('#chip-speaker');await p.click('.pin-socket[data-group-id="speaker"][data-pin-idx="0"]');
const connDisabled=await p.evaluate(()=>document.getElementById('btn-connect').disabled);
await p.click('#btn-connect');
await p.click('#btn-post');
await new Promise(r=>setTimeout(r,2600));
const out=await p.evaluate(()=>({done:window.__done,modal:document.getElementById('results-modal').classList.contains('active'),title:document.getElementById('modal-title').textContent,badges:document.getElementById('modal-badges').innerText}));
console.log(JSON.stringify({realClick_connectBtnDisabledBeforeClick:connDisabled,out,errs},null,2));
await b.close();
})().catch(e=>{console.error(e);process.exit(1)});
