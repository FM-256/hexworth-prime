// BUG-048 enumeration -- classifies escaped-unicode occurrences in _app using the
// EXACT sets from _tools/eduscan/validators/syntax/emoji.js (EXCLUDED_CODEPOINTS
// lines 66-85, emoji ranges line 22). Objective + reproducible per Nancy's condition.
const fs = require('fs'), path = require('path');
const EXCLUDED = new Set([0x2713,0x2714,0x2717,0x2718,0x2705,0x274C,0x274E,0x2192,0x2190,0x2191,0x2193,0xFE0E,0xFE0F,0x200D,0x25BC,0x25B8,0x25CB,0x25CF,0x25BA,0x25B2,0x25AA,0x25BE,0x25B9,0x25C0,0x25C4,0x25B3,0x25C6,0x25C7,0x25C8,0x25C9,0x25CE,0x25EF,0x25D0,0x25C1,0x25EB,0x25E2,0x25FB,0x25B6,0x25B7,0x25BD,0x25BF,0x2605,0x2606,0x2726,0x2727,0x2756,0x2734,0x2665,0x2661,0x2610,0x2611,0x2612,0x2715,0x2691,0x2742,0x2736]);
function inEmojiRanges(cp){return (cp>=0x1F300&&cp<=0x1F9FF)||(cp>=0x2600&&cp<=0x27BF)||cp===0x2B50||(cp>=0xFE00&&cp<=0xFE0F)||cp===0x200D||(cp>=0x1FA00&&cp<=0x1FAFF)||(cp>=0x231A&&cp<=0x231B)||(cp>=0x23E9&&cp<=0x23FA)||(cp>=0x2934&&cp<=0x2935);}
const SKIP=/node_modules|vendor|_archive|\.webp$|\.png$|\.jpg$|\.wav$|\.mp3$|\.woff/;
const files={};
function walk(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(SKIP.test(p))continue;if(e.isDirectory())walk(p);else if(/\.(html|js|css|json)$/.test(e.name)){scan(p);}}}
function scan(p){
  const src=fs.readFileSync(p,'utf8');
  const real=new Set();let realN=0,exclN=0;
  // \u{...} form
  for(const m of src.matchAll(/\\u\{([0-9a-fA-F]{1,6})\}/g)){const cp=parseInt(m[1],16);if(!inEmojiRanges(cp))continue;if(EXCLUDED.has(cp))exclN++;else{realN++;real.add(cp);}}
  // surrogate-pair form \uD8xx\uDCxx
  for(const m of src.matchAll(/\\u[Dd]([89ABab])[0-9A-Fa-f]{2}\\u[Dd][C-Fc-f][0-9A-Fa-f]{2}/g)){
    const hex=m[0].match(/[0-9a-fA-F]{4}/g);const hi=parseInt(hex[0],16),lo=parseInt(hex[1],16);
    const cp=(hi-0xD800)*0x400+(lo-0xDC00)+0x10000;
    if(!inEmojiRanges(cp))continue;if(EXCLUDED.has(cp))exclN++;else{realN++;real.add(cp);}}
  // bare BMP escape \uXXXX in emoji ranges
  for(const m of src.matchAll(/\\u([0-9a-fA-F]{4})(?!\})/g)){const cp=parseInt(m[1],16);if(cp>=0xD800&&cp<=0xDFFF)continue;if(!inEmojiRanges(cp))continue;if(EXCLUDED.has(cp)||cp===0xFE0E)exclN++;else{realN++;real.add(cp);}}
  if(realN||exclN)files[p]={realN,exclN,chars:[...real].map(c=>String.fromCodePoint(c)).join(' ')};
}
walk('_app');
const pict=Object.entries(files).filter(([,v])=>v.realN>0).sort((a,b)=>b[1].realN-a[1].realN);
const typo=Object.entries(files).filter(([,v])=>v.realN===0);
console.log('=== PICTOGRAPHIC (fix list):',pict.length,'files,',pict.reduce((n,[,v])=>n+v.realN,0),'occurrences ===');
for(const [f,v] of pict)console.log(`  ${f}  real=${v.realN} excluded=${v.exclN}  [${v.chars}]`);
console.log('=== TYPOGRAPHIC-ONLY (style call, untouched):',typo.length,'files,',typo.reduce((n,[,v])=>n+v.exclN,0),'occurrences ===');
