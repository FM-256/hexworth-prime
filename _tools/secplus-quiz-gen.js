// Security+ module-quiz generator. Input: a spec file (JSON array of
// {quizId, title, moduleName, questions:[{question, options[4], correct, explanation}]}).
// For each quiz it: (1) balances the correct-answer position round-robin (no skew),
// (2) emits a server-graded quiz HTML with NO answers/leak-comments + full-width +
// moduleId === quizId (the grading-id bug we hit), (3) collects the balanced key.
// Outputs HTML files + a combined keys file for seeding. ALL correctness baked in here.
const fs = require('fs');
const SPEC = process.argv[2];
const OUTDIR = '_app/houses/shield/security-plus/quizzes';
const KEYS_OUT = process.argv[3] || '/tmp/secplus-module-keys.json';
function esc(s){return String(s);}
function genHTML(spec){
  const q = JSON.stringify(spec.questions.map(x=>({question:x.question,options:x.options,explanation:x.explanation})), null, 16)
            .replace(/\n/g,'\n            ');
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <script src="../../../../components/AccessGuard.js"></script>
    <script>AccessGuard.require('sorted');</script>
    <script src="../../../../components/FirebaseAuth.js"></script>
    <script src="../../../../components/AchievementManager.js"></script>
    <script src="../../../../components/ModuleProgress.js"></script>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${esc(spec.title)} &mdash; Hexworth Prime</title>
    <style>
        * { box-sizing: border-box; }
        body { margin:0; background:#0a0e17; color:#e2e8f0; font-family:'Segoe UI',system-ui,sans-serif; min-height:100vh; display:flex; flex-direction:column; }
        .page-header { padding:18px 6vw; border-bottom:1px solid rgba(59,130,246,0.2); }
        .page-header a { color:#60a5fa; text-decoration:none; font-size:0.9rem; }
        .page-header a:hover { color:#93c5fd; }
        /* Full viewport width (hard platform rule). */
        .quiz-wrapper { flex:1; padding:30px 6vw; }
        #quiz-container { width:100%; max-width:none; }
    </style>
</head>
<body>
    <header class="page-header"><a href="../index.html">&larr; Back to Security+ Hub</a></header>
    <main class="quiz-wrapper"><div id="quiz-container"></div></main>
    <script src="../../../../components/ProgressSystem.js"></script>
    <script src="../../../../components/QuizEngine.js"></script>
    <script>
        const quiz = new QuizEngine({
            containerId: 'quiz-container',
            title: ${JSON.stringify(spec.title)},
            moduleId: ${JSON.stringify(spec.quizId)},
            achievement: ${JSON.stringify(spec.quizId)},
            passingScore: 80,
            theme: 'shield',
            houseId: 'shield',
            serverGrading: true,
            trackProgress: true,
            showFeedback: true,
            randomize: false,
            questions: ${q}
        });
    </script>
    <hex-ai-button house="shield"></hex-ai-button>
    <script type="module" src="/_lib/HexAIButton.js"></script>
</body>
</html>`;
}
const specs = JSON.parse(fs.readFileSync(SPEC,'utf8'));
if(!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR,{recursive:true});
const keys = {};
let totalQ = 0;
specs.forEach(spec=>{
  // balance: swap correct option into round-robin target position
  spec.questions.forEach((qq,i)=>{
    const tgt = i % 4, c = qq.correct;
    if(c<0||c>3) throw new Error(spec.quizId+' Q'+(i+1)+' bad correct '+c);
    const tmp=qq.options[tgt]; qq.options[tgt]=qq.options[c]; qq.options[c]=tmp;
    qq.correct = tgt;
  });
  const key = spec.questions.map(q=>q.correct);
  keys[spec.quizId] = { answers:key, passingScore:80, questionCount:key.length };
  const slug = spec.quizId.replace(/^shield-/,'');
  const path = OUTDIR+'/'+slug+'.quiz.html';
  fs.writeFileSync(path, genHTML(spec));
  const dist=[0,0,0,0]; key.forEach(x=>dist[x]++);
  totalQ += key.length;
  console.log('  '+spec.quizId+': '+key.length+' Qs, dist='+JSON.stringify(dist)+' -> '+path.replace('_app/houses/shield/security-plus/',''));
});
fs.writeFileSync(KEYS_OUT, JSON.stringify(keys,null,2));
console.log('generated '+specs.length+' quizzes, '+totalQ+' questions; keys -> '+KEYS_OUT);
