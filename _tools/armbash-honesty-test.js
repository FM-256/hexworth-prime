// Re-verification of the BUG-008 honesty gate against the EXACT TASK_INSTRUCTIONS commands
// (Nancy finding: the first pass tested simplified commands, missing that piped/redirected
// instructed commands flatten `cmd` to 'pipe'/'redirect'). Boots each ACTUAL module page and,
// for a list of [task, command, shouldComplete], runs the command and asserts the real
// `.task-chip[data-task=X].completed` DOM state. shouldComplete=false rows are error-variants
// that must remain BLOCKED by the gate.
const fs = require('fs');
const puppeteer = require('puppeteer');
const ROOT = '/home/eq/ai-content/hexworth-prime';
const LT = fs.readFileSync(ROOT + '/_app/components/LinuxTerminal.js', 'utf8');
const STUB = 'window.AccessGuard={require:function(){}};window.AchievementManager={award:function(){},unlock:function(){}};' +
  'window.ModuleProgress={complete:function(){},get:function(){return null;},load:function(){return null;},getProgress:function(){return null;}};';

// [module file, [ [task, command, shouldComplete], ... ] ]. Each row runs in a FRESH page.
const CASES = {
  'arm-bash-02-variables': [
    ['assign', 'NAME="Alice"', true],
    ['expand', 'echo "Hello $NAME"', true],
    ['cmdsub', 'TODAY=$(date +%Y-%m-%d)', true],
    ['arith', 'echo $((10 + 5))', true],
    ['env', 'echo $HOME', true],
  ],
  'arm-bash-08-system-admin': [
    ['disk', 'df -h', true],
    ['cron', 'crontab -l', true],
    ['backup', 'tar -czf test.tar.gz /etc/hostname', true],
    ['monitor', 'free -h', true],
  ],
  'arm-bash-03-input-output': [
    ['printf', 'printf "Name: %s\\n" "Alice"', true],
    ['redirect', 'echo "hello" > test.txt', true],
    ['append', 'echo "line two" >> test.txt', true],
    ['pipe', 'ls /etc | wc -l', true],
    ['stderr', 'ls /nonexistent 2> /dev/null', true],          // ungated (pinned): completes despite the error it teaches
  ],
  'arm-bash-07-text-processing': [
    ['grep', 'grep "root" /etc/passwd', true],
    ['sed', "echo 'hello world' | sed 's/world/bash/'", true], // PIPED instructed command
    ['awk', "awk -F: '{print $1}' /etc/passwd | head -3", true],// PIPED
    ['cut', 'cut -d: -f1 /etc/passwd | head -3', true],         // PIPED
    ['pipeline', 'cut -d: -f7 /etc/passwd | sort | uniq -c', true],
    ['grep', 'sedd root /etc/passwd', false],                   // command-not-found (real error) must NOT complete grep
  ],
  'arm-bash-01-intro': [
    ['chmod', 'chmod +x hello.sh', false],                      // no such file yet -> errors -> the MOTIVATING BUG-008 case must be BLOCKED
  ],
  'arm-bash-09-security-scripts': [
    ['ports', 'ss -tlnp', true],
    ['users', 'who', true],
    ['perms', 'find /usr/bin -perm -4000 2>/dev/null', true],   // REDIRECTED instructed command
  ],
};

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  let allPass = true;
  for (const mod of Object.keys(CASES)) {
    const MOD = fs.readFileSync(ROOT + '/_app/houses/code/armory/bash/' + mod + '.module.html', 'utf8');
    for (const [task, command, shouldComplete] of CASES[mod]) {
      const PAGE = 'https://hexworth.com/__' + mod + '-' + Math.abs(hash(task + command));
      const page = await browser.newPage();
      // Serve the real module HTML + real LinuxTerminal.js; stub the non-terminal deps; abort the rest.
      await page.setRequestInterception(true);
      page.on('request', req => {
        const u = req.url();
        if (u === PAGE) return req.respond({ contentType: 'text/html', body: MOD });
        if (/LinuxTerminal\.js/.test(u)) return req.respond({ contentType: 'application/javascript', body: LT });
        if (/AccessGuard\.js|AchievementManager\.js|ModuleProgress\.js/.test(u)) return req.respond({ contentType: 'application/javascript', body: STUB });
        req.abort();
      });
      // Clear web storage BEFORE the module's inline script runs, so a task completed in an earlier
      // same-origin case can't be restored from localStorage and pollute this one (test isolation).
      await page.evaluateOnNewDocument(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} });
      // Load the page and give the inline script a beat to wire LinuxTerminal.init.
      await page.goto(PAGE, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 200));
      // Run the instructed command in the real engine, then read the module's own task-chip DOM state.
      const completed = await page.evaluate((task, command) => {
        var T = (typeof LinuxTerminal !== 'undefined') ? LinuxTerminal : null;
        if (!T) return null;
        T.execute(command);
        var c = document.querySelector('.task-chip[data-task="' + task + '"]');
        return !!(c && c.classList.contains('completed'));
      }, task, command);
      await page.close();
      // Compare against the expected completion (true=must complete, false=error-variant must stay blocked).
      const ok = completed === shouldComplete;
      if (!ok) allPass = false;
      console.log('  ' + (ok ? 'PASS' : 'FAIL') + '  [' + mod.replace('arm-bash-', '') + '] ' +
        task.padEnd(9) + ' expect=' + String(shouldComplete).padEnd(5) + ' got=' + String(completed).padEnd(5) + '  ' + command);
    }
  }
  await browser.close();
  console.log('\n  RESULT: ' + (allPass ? 'PASS' : 'FAIL') + '\n');
  process.exit(allPass ? 0 : 1);
})();

// tiny deterministic string hash for a unique per-case page URL (no Math.random needed)
function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) { h = (h * 31 + s.charCodeAt(i)) | 0; } return h; }
