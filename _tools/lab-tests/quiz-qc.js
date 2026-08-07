#!/usr/bin/env node
/**
 * @catalog what    A+ ch25 quiz: anti-tell heuristics, grounding, server scoring math
 * @catalog run     node _tools/lab-tests/quiz-qc.js
 * @catalog status  GATE
 *
 * Moved out of a session scratchpad on 2026-08-07. These suites caught the defects
 * that ten review rounds were spent on, and they existed only for the length of one
 * session. Run them before touching the labs they cover, and via run-all.js in the
 * deploy chain.
 */
const REPO = require('path').resolve(__dirname, '..', '..');
/* ch25 quiz QC: derive nothing by eye. Read the authored questions out of the live engine
   config, apply the key, and test every anti-tell heuristic the assessment standard names. */
const http=require('http'),fs=require('fs'),path=require('path');
const puppeteer=require(require('path').join(REPO,'node_modules','puppeteer'));
const ROOT=require('path').join(REPO,'_app');
const MIME={'.html':'text/html','.js':'text/javascript','.webp':'image/webp'};
const srv=http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);
 fs.readFile(path.join(ROOT,p),(e,b)=>{if(e){r.writeHead(404);return r.end();}
 r.writeHead(200,{'Content-Type':MIME[path.extname(p)]||'application/octet-stream'});r.end(b);});});
let P=0,F=0;const ck=(l,ok,d)=>{ok?P++:F++;console.log(`  ${ok?'PASS':'FAIL'}  ${l}${d?'  -> '+d:''}`);};
const U='/houses/forge/applets/comptia-aplus/core-2/quizzes/forge-ch25.quiz.html';
/* authored-order key */
const KEY=[1,0,2,0,3,1,0,3,2,2,1,2,0,2,1,2,3,3,3,1];
(async()=>{
 await new Promise(r=>srv.listen(0,'127.0.0.1',r));
 const b=await puppeteer.launch({headless:'new',args:['--no-sandbox','--disable-setuid-sandbox']});
 const pg=await b.newPage(); await pg.setViewport({width:1280,height:900});
 await pg.setRequestInterception(true);
 pg.on('request',r=>/AccessGuard|FirebaseAuth|AchievementManager|HexAIButton|ObservatoryTelemetry/.test(r.url())?r.abort():r.continue());
 const errs=[]; pg.on('pageerror',e=>{if(!/AccessGuard|FirebaseAuth|AchievementManager/.test(e.message))errs.push(e.message);});
 await pg.goto(`http://127.0.0.1:${srv.address().port}`+U,{waitUntil:'networkidle2'});
 await new Promise(r=>setTimeout(r,600));

 /* MUST read originalQuestions: start() replaces config.questions with the shuffled,
    pooled subset, and applying the authored key to shuffled options measures nothing. */
 const cfg = await pg.evaluate(()=>({
   n: quiz.originalQuestions.length, pool: quiz.config.poolSize,
   drawn: quiz.config.questions.length,
   server: quiz.config.serverGrading, moduleId: quiz.config.moduleId,
   qs: quiz.originalQuestions.map(q=>({q:q.question,o:q.options,src:q.source,ex:q.explanation}))
 }));

 console.log('\nSTRUCTURE');
 ck('20-item bank', cfg.n===20, cfg.n+' authored questions');
 ck('start() serves the whole bank', cfg.drawn===cfg.n, cfg.drawn+' served');
 ck('key length matches the bank', KEY.length===cfg.n, KEY.length+' vs '+cfg.n);
 ck('server-graded', cfg.server===true);
 ck('quizId is the moduleId the engine posts', cfg.moduleId==='core2-ch25', cfg.moduleId);
 /* poolSize MUST stay absent until gradeQuiz can score a drawn subset (taskboard #295).
    This assertion is a regression guard: re-adding it silently caps every student at 60%. */
 ck('poolSize is absent, because the server cannot grade a subset',
    !cfg.pool, cfg.pool ? 'poolSize='+cfg.pool+' WILL FAIL EVERY STUDENT' : 'absent');
 ck('every item has 4 options', cfg.qs.every(q=>q.o.length===4));
 ck('every item carries a source tag', cfg.qs.every(q=>!!q.src));
 ck('every item has an explanation', cfg.qs.every(q=>q.ex && q.ex.length>40));
 ck('NO answer key in the shipped HTML', await pg.evaluate(()=>
    !quiz.originalQuestions.some(q=>'correct' in q || 'answer' in q || 'correctIndex' in q)));

 console.log('\nANTI-TELL HEURISTICS');
 const dist=[0,0,0,0]; KEY.forEach(k=>dist[k]++);
 ck('correct answer spread across all four positions', dist.every(d=>d>=4),
    'A='+dist[0]+' B='+dist[1]+' C='+dist[2]+' D='+dist[3]);
 let longest=0;
 cfg.qs.forEach((q,i)=>{ const lens=q.o.map(o=>o.length);
   if (lens[KEY[i]] === Math.max(...lens)) longest++; });
 ck('correct is not systematically the longest option', longest <= cfg.n*0.45,
    longest+'/'+cfg.n+' ('+Math.round(longest/cfg.n*100)+'%)');
 let shortest=0;
 cfg.qs.forEach((q,i)=>{ const lens=q.o.map(o=>o.length);
   if (lens[KEY[i]] === Math.min(...lens)) shortest++; });
 ck('nor systematically the shortest', shortest <= cfg.n*0.45, shortest+'/'+cfg.n);
 const allNone = cfg.qs.map((q,i)=>({i,last:q.o[3],correct:KEY[i]===3}))
   .filter(x=>/^(All|None) of the above$/.test(x.last));
 ck('All/None items are authored LAST', allNone.length>0, allNone.length+' such items');
 ck('All-of-the-above is correct exactly once',
    allNone.filter(x=>/^All/.test(x.last)&&x.correct).length===1);
 ck('None-of-the-above is correct exactly once',
    allNone.filter(x=>/^None/.test(x.last)&&x.correct).length===1);
 const yesno = cfg.qs.map((q,i)=>({q:q.q,correct:q.o[KEY[i]]}))
   .filter(x=>/\bAre they right\?|\bIs (he|she|they) right\?/.test(x.q));
 ck('"is the colleague right" items do not all resolve to no',
    yesno.length===0 || yesno.filter(x=>/^No/.test(x.correct)).length < yesno.length || yesno.length===1,
    yesno.length+' such items');

 console.log('\nGROUNDING (correct answers must trace to this chapter)');
 const deck=fs.readFileSync(require('path').join(REPO,'_app','houses','forge','applets','comptia-aplus','core-2','presentations','forge-virtualization.presentation.html'),'utf8');
 const lab=fs.readFileSync(require('path').join(REPO,'_app','houses','forge','applets','comptia-aplus','core-2','labs','forge-virtualization.lab.html'),'utf8');
 const src=(deck+lab).toLowerCase();
 const TERMS=['type 1','type 2','no bootable medium','guest additions','vmware tools',
   'internal network','lan segment','.vmdk','.vdi','snapshot','vt-x','amd-v','hyper-v',
   'bridged','nat','host-only','vm escape','consolidat'];
 const missing=TERMS.filter(t=>!src.includes(t));
 ck('every key concept appears in the chapter source', missing.length===0, missing.join(', '));

 console.log('\nSERVER SCORING (reproduce gradeQuiz, do not assume it)');
 /* The gap that shipped an unpassable quiz: quiz-qc.js checked structure and never once
    scored a submission. This mirrors functions/index.js gradeQuiz exactly:
        const total = answerKey.length;
        for (i=0..total) { if (submitted === undefined) wrong; else compare; }
        percentage = round(score/total*100)
    A perfect run must score 100, not 60. */
 const served = await pg.evaluate(()=>quiz.config.questions.length);
 const gradeLikeServer = (answerMap) => {
   const key = KEY, total = key.length; let score = 0;
   for (let i = 0; i < total; i++) {
     const submitted = answerMap[String(i)];
     if (submitted === undefined) continue;
     if (submitted === key[i]) score++;
   }
   return { score, total, percentage: Math.round((score/total)*100) };
 };
 /* build the answerMap the client would post for a PERFECT attempt, from the drawn set,
    mapping display option back to authored index exactly as QuizEngine does */
 const perfect = await pg.evaluate((key)=>{
   const map = {};
   quiz.config.questions.forEach(q => {
     const oi = q._originalIndex;
     const correctText = q._originalOptions[key[oi]];
     map[String(oi)] = q.options.indexOf(correctText);   /* display index */
     /* QuizEngine remaps display -> authored before posting, so mirror that */
     map[String(oi)] = q._originalOptions.indexOf(q.options[map[String(oi)]]);
   });
   return map;
 }, KEY);
 const res = gradeLikeServer(perfect);
 ck('every authored question is served (no undrawn slots)', served===cfg.n,
    served+' served of '+cfg.n+' keyed');
 ck('a PERFECT attempt scores 100, not a capped fraction',
    res.percentage===100, `${res.score}/${res.total} = ${res.percentage}%`);
 ck('a perfect attempt therefore passes', res.percentage>=70);
 /* negative control: the check must be able to fail */
 const partial = Object.fromEntries(Object.entries(perfect).slice(0,12));
 const pr = gradeLikeServer(partial);
 ck('control: a 12-of-20 submission would have scored 60 and failed',
    pr.percentage===60 && pr.percentage<70, `${pr.score}/${pr.total} = ${pr.percentage}%`);

 console.log('\nLIVE BOOT');
 const rendered = await pg.evaluate(()=>{
   const c=document.getElementById('quiz-container');
   return { html: c.innerHTML.length,
            shown: c.querySelectorAll('.quiz-question, [class*=question]').length };
 });
 ck('the engine rendered', rendered.html>500, rendered.html+' chars');
 ck('no console errors', errs.length===0, errs.slice(0,2).join(' | '));

 fs.writeFileSync('ch25-key.json', JSON.stringify(
   { 'core2-ch25': { answers: KEY, passingScore: 70, questionCount: KEY.length } }, null, 2));
 console.log('\nkey written to ch25-key.json (NOT seeded)');
 console.log(`${P} passed, ${F} failed`);
 await b.close(); srv.close(); process.exitCode=F?1:0;
})();
