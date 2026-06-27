const admin=require('firebase-admin');
try{ admin.initializeApp({projectId:'hexworth-prime'}); }catch(e){}
const db=admin.firestore();
const boxes=Object.keys(require('./box_flags.json')).filter(k=>k.startsWith('shield-sp-blueteam'));
(async()=>{
  let seeded=0,missing=[];
  for(const b of boxes){
    try{
      const d=await db.doc('flag_registry/'+b).get();
      if(d.exists){const f=d.data().flags||{};console.log('  SEEDED  '+b+'  ('+Object.keys(f).length+' flags)');seeded++;}
      else {console.log('  MISSING '+b);missing.push(b);}
    }catch(e){console.log('  ERR '+b+': '+e.message.split('\n')[0]);}
  }
  console.log(`\n${seeded}/${boxes.length} seeded; missing: ${missing.length?missing.join(', '):'none'}`);
  process.exit(0);
})();
