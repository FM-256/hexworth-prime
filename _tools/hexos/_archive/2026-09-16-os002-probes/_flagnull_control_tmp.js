const puppeteer=require('puppeteer');const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const BOXES=[['os002-update-nightmare','update_stuck'],['pr001-printer-nightmare','spooler_crash'],['nt1-network-troubleshoot',null]];
(async()=>{
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-dev-shm-usage']});
 for(const [box,flagId] of BOXES){
  const ctx=await b.createBrowserContext();const p=await ctx.newPage();
  p.on('dialog',async d=>{try{await d.dismiss()}catch(e){}});
  await p.goto(`https://hexworth.com/dispatch/boxes/${box}/`,{waitUntil:'networkidle2',timeout:60000});
  await sleep(2500);
  const r=await p.evaluate(async fid=>{
    const out={auth:'?',uid:null,flag:'?'};
    try{
      const fb=(typeof ArenaFirebase!=='undefined')?ArenaFirebase:null;
      out.hasArenaFirebase=!!fb;
      if(window.firebase&&firebase.auth){const u=firebase.auth().currentUser;out.auth=u?'signed-in':'anonymous/none';out.uid=u?(u.isAnonymous?'anon':'real'):null;}
      else out.auth='no firebase.auth global';
    }catch(e){out.auth='threw: '+e.message;}
    try{
      if(typeof BoxEngine!=='undefined'&&BoxEngine.requestFlagText){
        const f=await BoxEngine.requestFlagText(fid||undefined);
        out.flag=(f===null)?'NULL':(f===undefined?'undefined':String(f).slice(0,40));
      } else out.flag='no BoxEngine.requestFlagText';
    }catch(e){out.flag='threw: '+e.message;}
    return out;
  },flagId);
  console.log(`${box.padEnd(32)} auth=${String(r.auth).padEnd(20)} uid=${String(r.uid).padEnd(6)} flag=${r.flag}`);
  await ctx.close();
 }
 await b.close();
})();
