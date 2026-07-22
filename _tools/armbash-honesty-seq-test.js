const fs = require('fs');
const puppeteer = require('puppeteer');
const ROOT = '/home/eq/ai-content/hexworth-prime';
const LT = fs.readFileSync(ROOT + '/_app/components/LinuxTerminal.js', 'utf8');
const STUB = 'window.AccessGuard={require:function(){}};window.AchievementManager={award:function(){},unlock:function(){}};' +
  'window.ModuleProgress={complete:function(){},get:function(){return null;},load:function(){return null;},getProgress:function(){return null;}};';

// One SEQUENTIAL run per module: every literal TASK_INSTRUCTIONS command typed in order,
// exactly as a student following the panel top-to-bottom would. Checks ALL gated task chips
// end up completed:true. (run/hash/stderr are pinned-ungated, not this fix's concern, included
// just to complete the natural flow where needed.)
const CASES = {
  'arm-bash-01-intro': {
    seq: ['echo $SHELL', "echo '#!/bin/bash' > hello.sh", 'echo \'echo "Hello Bash!"\' >> hello.sh', 'chmod +x hello.sh'],
    gated: ['echo', 'shebang', 'script', 'chmod'],
  },
  'arm-bash-02-variables': {
    seq: ['NAME="Alice"', 'echo "Hello $NAME"', 'TODAY=$(date +%Y-%m-%d)', 'echo $((10 + 5))', 'echo $HOME'],
    gated: ['assign', 'expand', 'cmdsub', 'arith', 'env'],
  },
  'arm-bash-03-input-output': {
    seq: ['printf "Name: %s\\n" "Alice"', 'echo "hello" > test.txt', 'echo "line two" >> test.txt', 'ls /etc | wc -l', 'ls /nonexistent 2> /dev/null'],
    gated: ['printf', 'redirect', 'append', 'pipe', 'stderr'],
  },
  'arm-bash-07-text-processing': {
    seq: ['grep "root" /etc/passwd', "echo 'hello world' | sed 's/world/bash/'", "awk -F: '{print $1}' /etc/passwd | head -3", 'cut -d: -f1 /etc/passwd | head -3', 'cut -d: -f7 /etc/passwd | sort | uniq -c'],
    gated: ['grep', 'sed', 'awk', 'cut', 'pipeline'],
  },
  'arm-bash-08-system-admin': {
    seq: ['df -h', 'crontab -l', 'tar -czf test.tar.gz /etc/hostname', 'free -h'],
    gated: ['disk', 'cron', 'backup', 'monitor'],
  },
  'arm-bash-09-security-scripts': {
    seq: ['ss -tlnp', 'who', 'find /usr/bin -perm -4000 2>/dev/null', 'sha256sum /etc/passwd'],
    gated: ['ports', 'users', 'perms'],
  },
};

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  let allPass = true;
  for (const mod of Object.keys(CASES)) {
    const MOD = fs.readFileSync(ROOT + '/_app/houses/code/armory/bash/' + mod + '.module.html', 'utf8');
    const { seq, gated } = CASES[mod];
    const PAGE = 'https://hexworth.com/__seq-' + mod;
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', req => {
      const u = req.url();
      if (u === PAGE) return req.respond({ contentType: 'text/html', body: MOD });
      if (/LinuxTerminal\.js/.test(u)) return req.respond({ contentType: 'application/javascript', body: LT });
      if (/AccessGuard\.js|AchievementManager\.js|ModuleProgress\.js/.test(u)) return req.respond({ contentType: 'application/javascript', body: STUB });
      req.abort();
    });
    await page.evaluateOnNewDocument(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} });
    await page.goto(PAGE, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 200));
    const result = await page.evaluate((seq, gated) => {
      var T = LinuxTerminal;
      seq.forEach(function(c) { T.execute(c); });
      var out = {};
      gated.forEach(function(t) {
        var c = document.querySelector('.task-chip[data-task="' + t + '"]');
        out[t] = !!(c && c.classList.contains('completed'));
      });
      return out;
    }, seq, gated);
    await page.close();
    const modOk = gated.every(t => result[t] === true);
    if (!modOk) allPass = false;
    console.log('  ' + (modOk ? 'PASS' : 'FAIL') + '  ' + mod + '  ' + JSON.stringify(result));
  }
  await browser.close();
  console.log('\n  SEQUENTIAL-FLOW RESULT: ' + (allPass ? 'PASS' : 'FAIL') + '\n');
  process.exit(allPass ? 0 : 1);
})();
