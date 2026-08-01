// Does the hand-added card survive incubator-generator.js? Uses the GENERATOR'S OWN regexes,
// copied from _tools/eduscan/incubator-generator.js lines 330 + 334, so this tests the real
// contract rather than my belief about it. No writes: the generator is never invoked.
const fs = require('fs');
const prev = fs.readFileSync('/home/eq/ai-content/hexworth-prime/_app/houses/cloud/incubator/index.html', 'utf8');

const prevHrefById = new Map();
const aRe = /<a[^>]*href="([^"]*)"[^>]*data-module="([^"]*)"/g;
let am; while ((am = aRe.exec(prev)) !== null) prevHrefById.set(am[2], am[1]);

const objRe = /\{\s*id:\s*['"]([^'"]+)['"]\s*,\s*subcluster:\s*['"]([^'"]+)['"]\s*,\s*title:\s*([^}]+?)\s*\}/g;
const parsed = []; let m;
while ((m = objRe.exec(prev)) !== null) parsed.push({ id: m[1], subcluster: m[2], title: m[3].trim() });

const ID = 'cloud-practitioner-final';
const entry = parsed.find(p => p.id === ID);
const href  = prevHrefById.get(ID);

console.log('  modules the merge would recover :', parsed.length);
console.log('  anchors the merge would recover :', prevHrefById.size);
console.log('');
console.log('  my entry parsed by objRe        :', entry ? `YES  subcluster='${entry.subcluster}' title=${entry.title}` : 'NO  <-- would be DROPPED on regen');
console.log('  my href recovered by aRe        :', href || 'NO  <-- would regen as href="" (dead card)');
// resolveHref prefers prev when it is truthy and not '#'
const survives = !!entry && !!href && href !== '#';
console.log('  resolveHref() would return      :', href && href !== '#' ? href + '   (prev wins, catalog not consulted)' : 'falls through to catalog');
console.log('');
console.log(survives ? '  PASS -- card survives a regen with its href intact'
                     : '  FAIL -- regen would drop or break this card');
process.exitCode = survives ? 0 : 1;
