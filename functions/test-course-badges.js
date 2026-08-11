#!/usr/bin/env node
/*
 * @catalog what    Unit tests for server-issued course completion badges (#275 completion signal).
 * @catalog run     node functions/test-course-badges.js
 * @catalog status  GATE
 *
 * Offline, fake Firestore, milliseconds. This decides whether a student is declared finished,
 * which in turn will release their OpenStack slot, so the adversarial cases matter more than
 * the happy path.
 *
 * Unit-test the course-badge evaluation against a fake Firestore, offline.
   The load-bearing property is that it counts DISTINCT MISSIONS, not documents, and that it
   cannot be talked into awarding by anything a client controls. */
const cb = require('./course-badges');
let pass=0,fail=0;
const t=(n,c,d)=>{c?(pass++,console.log('  PASS  '+n+(d?'  -> '+d:''))):(fail++,console.log('  FAIL  '+n+(d?'  -> '+d:'')));};

function fakeDb(awards, hasBadge) {
  return {
    collection: () => ({ get: async () => ({ forEach: f => awards.forEach(a => f({ data: () => a })) }) }),
    doc: () => ({ get: async () => ({ exists: !!hasBadge }) })
  };
}
const mk = n => Array.from({length:n},(_,i)=>({mission:'obs-mission-'+(i+1)}));

(async()=>{
  let r = await cb.evaluate(fakeDb(mk(17)), 'u');
  t('17 distinct missions is NOT complete', r[0].complete === false, `count=${r[0].count}`);

  r = await cb.evaluate(fakeDb(mk(18)), 'u');
  t('18 distinct missions IS complete', r[0].complete === true, `count=${r[0].count}`);

  // the bug that document-counting would have: same mission awarded many times
  r = await cb.evaluate(fakeDb(Array.from({length:30},()=>({mission:'obs-mission-1'}))), 'u');
  t('30 awards of ONE mission is not 30 missions', r[0].complete === false, `count=${r[0].count}`);

  // malformed docs must not inflate the count
  r = await cb.evaluate(fakeDb([...mk(17), {}, {mission:''}, {mission:null}]), 'u');
  t('docs with no mission field do not count', r[0].complete === false, `count=${r[0].count}`);

  r = await cb.evaluate(fakeDb(mk(18), true), 'u');
  t('an already-held badge is reported, not re-awarded', r[0].alreadyAwarded === true);

  r = await cb.evaluate(fakeDb(mk(25)), 'u');
  t('more than enough still completes', r[0].complete === true, `count=${r[0].count}`);

  t('exactly one course is registered, on purpose', cb.COURSES.length === 1);
  t('and it is marked as a sandbox course', cb.COURSES[0].sandboxCourse === true);

  console.log(`\n${pass}/${pass+fail} checks passed`);
  process.exit(fail?1:0);
})();
