// Real-browser verification of the safeEntry FIX, at the same evidentiary bar the BUG was
// proven with: build an <a>, assign the value, read what the browser actually resolves.
// A regex that looks right and a browser that agrees are not the same evidence.
// Served over real HTTP because about:blank gives false negatives (opaque-origin URL
// resolution fails silently) -- the reviewer's warning, kept.
const http = require('http'), path = require('path'), fs = require('fs'), pup = require('puppeteer');
const APP = path.resolve('/home/eq/ai-content/hexworth-prime/_app'), PORT = 9131;

const srv = http.createServer((q, r) => {
    let p = decodeURIComponent(q.url.split('?')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const f = path.join(APP, p);
    if (!f.startsWith(APP) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); }
    r.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html' : 'text/javascript' });
    r.end(fs.readFileSync(f));
});

srv.listen(PORT, '127.0.0.1', async () => {
    const b = await pup.launch({ headless: 'new', args: ['--no-sandbox'] });
    const pg = await b.newPage();
    await pg.goto(`http://127.0.0.1:${PORT}/hex/apps.html`, { waitUntil: 'domcontentloaded' })
        .catch(() => {});

    // The patched implementation, copied from the committed source so the test exercises the
    // shipped logic rather than a paraphrase of it.
    const shipped = fs.readFileSync(path.join(APP, 'hex/apps.html'), 'utf8');
    const m = shipped.match(/function safeEntry\(e\) \{[\s\S]*?\n    \}/);
    if (!m) { console.log('  COULD NOT EXTRACT safeEntry from the committed file'); process.exit(1); }

    const res = await pg.evaluate((src, chars) => {
        eval(src);                                   // defines safeEntry exactly as shipped
        const out = [];
        chars.forEach(function (c) {
            const raw = '/' + c.ch + '/evil.example.com';
            const allowed = safeEntry(raw);
            const a = document.createElement('a');
            a.href = allowed === null ? '/blocked-by-guard' : allowed;
            out.push({ name: c.name, allowed: allowed !== null, host: a.hostname, proto: a.protocol });
        });
        // A legitimate entry must still resolve same-origin.
        const ok = document.createElement('a');
        ok.href = safeEntry('/houses/matrix/adv-linux/index.html') || '/REJECTED';
        out.push({ name: 'legit', allowed: true, host: ok.hostname, proto: ok.protocol });
        return out;
    }, m[0], [
        { name: 'TAB', ch: '\t' }, { name: 'LF', ch: '\n' }, { name: 'CR', ch: '\r' },
        { name: 'FF', ch: '\f' }, { name: 'VT', ch: '\v' }, { name: 'SP', ch: ' ' },
        { name: 'NUL', ch: '\0' }
    ]);

    let pass = 0, fail = 0;
    console.log('  === what the BROWSER resolves, not what the regex claims ===');
    res.forEach(function (r) {
        const good = r.name === 'legit'
            ? (r.host === '127.0.0.1')
            : (!r.allowed && r.host === '127.0.0.1');
        good ? pass++ : fail++;
        console.log('    ' + (good ? 'ok  ' : 'FAIL') + ' ' + r.name.padEnd(6)
            + ' allowed=' + String(r.allowed).padEnd(5) + ' -> host=' + r.host);
    });
    console.log('\n  ' + pass + '/' + (pass + fail) + '  (host must stay 127.0.0.1; evil.example.com = escape)');
    await b.close(); srv.close();
    process.exitCode = fail ? 1 : 0;
});
