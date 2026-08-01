// ISOLATED per case. The previous suite ran every input in ONE page session, so once a legitimate
// answer granted task 7 the chip stayed visible and every later negative case read as a pass.
// That made a working fix look broken. State must not carry between cases.
const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({ headless:'new', args:['--no-sandbox','--disable-setuid-sandbox'] });
  const S='SUM(FactSales[TotalAmount])';
  const cases = [
    ['v2 exploit Region="channel"',   `X = CALCULATE(${S}, FactSales[Region]="channel")`, false],
    ['bare word channel',             `X = CALCULATE(${S}, channel)`, false],
    ['bare column, no operator',      `X = CALCULATE(${S}, FactSales[Channel])`, false],
    ['CALCULATEBLAH prefix',          `X = CALCULATEBLAH(${S}, "factsales[channel]")`, false],
    ['quoted literal, no operator',   `X = CALCULATE(${S}, "factsales[channel]")`, false],
    ['quoted col+operator (Nancy)',   `X = CALCULATE(${S}, "factsales[channel]=x")`, false],
    ['single-quoted col+operator',    `X = CALCULATE(${S}, 'factsales[channel]=x')`, false],
    ['comment-like trailer (Nancy)',  `X = CALCULATE(${S}, FactSales[Region]="x") /* factsales[channel]=1 */`, false],
    ['Nancy: unterminated comment',   `X = CALCULATE(${S}, FactSales[Region]="x") /* factsales[channel]=1`, false],
    ['Nancy: adjacent-quote smuggle', `X = CALCULATE(${S}, ""factsales[channel]=1"")`, false],
    ['Nancy: quote-smuggle variant',  `X = CALCULATE(${S}, FactSales[Region]="x"factsales[channel]=1"y")`, false],
    ['unterminated line comment',     `X = CALCULATE(${S}, FactSales[Region]="x") // factsales[channel]=1`, false],
    ['unterminated single quote',     `X = CALCULATE(${S}, 'factsales[channel]=1`, false],
    ['wrong column entirely',         `X = CALCULATE(${S}, FactSales[Region]="EMEA")`, false],
    ['legit =',                       `X = CALCULATE(${S}, FactSales[Channel]="Online")`, true],
    ['legit <>',                      `X = CALCULATE(${S}, FactSales[Channel]<>"Retail")`, true],
    ['legit spaced =',                `X = CALCULATE(${S}, FactSales[Channel] = "Online")`, true],
    ['legit lowercase',               `X = calculate(${S}, factsales[channel]="online")`, true],
  ];
  let ok = true;
  for (const [label, dax, want] of cases) {
    const p = await b.newPage();
    await p.setCacheEnabled(false);
    await p.evaluateOnNewDocument(() => localStorage.setItem('hexworth_house','cloud'));
    await p.goto('http://localhost:8961/houses/cloud/pl-300/labs/pl300-ch02-model-data.lab.html',{waitUntil:'domcontentloaded'});
    await new Promise(r=>setTimeout(r,700));
    await p.evaluate((d)=>{ document.getElementById('daxInput').value=d; evaluateDax(); }, dax);
    await new Promise(r=>setTimeout(r,120));
    const got = await p.evaluate(()=>{const e=document.getElementById('ck-7');
      return !!(e && getComputedStyle(e).display!=='none');});
    await p.close();
    if (got !== want) ok = false;
    console.log('  ' + (got===want?'  ':'XX') + ' ' + label.padEnd(30) + '-> ' + String(got).padEnd(5) + ' (expect ' + want + ')');
  }
  await b.close();
  // Nancy, 2026-08-01: this line said "9 illegitimate / 4 legitimate" long after the case list
  // grew to 18. A stale summary is worse than none -- a future reader trusts the one-liner over
  // the per-case XX marks it contradicts. Counts now come from the cases themselves.
  //
  // THIS SUITE IS EXPECTED TO EXIT 1. Two cases assert want:false against inputs the shipped
  // check still accepts (the empty-string-pair pair). They are left RED on purpose rather than
  // carved out, so the gap re-announces itself on every future run instead of going quiet.
  // cases are [label, dax, want] TUPLES, not objects -- c.want would be undefined on every
  // element and silently report "0 illegitimate, 18 legitimate", which is exactly the kind of
  // confident wrong total this edit exists to remove.
  var neg = cases.filter(function (c) { return !c[2]; }).length;
  var pos = cases.length - neg;
  console.log(ok ? '\n  PASS: ' + neg + ' illegitimate rejected, ' + pos
                   + ' legitimate accepted, each in a clean session'
                 : '\n  FAIL -- see XX above. Two of these are the KNOWN-OPEN cases; any OTHER'
                   + '\n  failing line is a regression.');
  process.exit(ok?0:1);
})();
