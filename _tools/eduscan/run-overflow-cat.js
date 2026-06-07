const path = require('path');
const fs = require('fs');
const BrowserPool = require('./validators/functional/browser');
const SlideOverflowCatChecker = require('./validators/functional/slide-overflow-b');

(async () => {
    const wsaDir = path.join(__dirname, '../../_app/houses/cloud/modules/wsa');
    const modules = fs.readdirSync(wsaDir).filter(d => d.startsWith('m'));
    const htmlFiles = [];
    for (const m of modules) {
        const f = path.join(wsaDir, m, 'cloud-presentation.module.html');
        if (fs.existsSync(f)) {
            htmlFiles.push({
                absolutePath: f,
                relativePath: path.relative(path.join(__dirname,'../..'), f)
            });
        }
    }
    console.log(`Discovered ${htmlFiles.length} WSA cat-contract files`);

    const pool = new BrowserPool({ verbose: false, concurrency: 4 });
    await pool.launch();

    try {
        const checker = new SlideOverflowCatChecker({
            browserPool: pool,
            rootPath: path.join(__dirname,'../..'),
            verbose: true
        });
        const result = await checker.check(htmlFiles);

        console.log('\n=== SUMMARY ===');
        console.log(JSON.stringify(result.summary, null, 2));
        console.log(`Total findings: ${result.issues.length}`);

        // Group by file
        const byFile = {};
        for (const i of result.issues) {
            const m = i.file.match(/wsa\/(m\d+[^/]+)/);
            const mod = m ? m[1] : i.file;
            if (!byFile[mod]) byFile[mod] = [];
            byFile[mod].push(i);
        }
        console.log('\n=== Per-module ===');
        for (const [mod, items] of Object.entries(byFile)) {
            const sizes = items.map(i => parseInt(i.message.match(/by (\d+)px/)[1])).sort((a,b)=>b-a);
            console.log(`  ${mod}: ${items.length} overflowing slides — sizes: ${sizes.join(', ')}`);
        }

        // Sanity: m03 slide 2 should be ~829px
        const m03 = result.issues.filter(i => i.file.includes('m03-storage'));
        const m03slide2 = m03.find(i => /Slide 2[^0-9]/.test(i.message));
        if (m03slide2) {
            console.log('\n=== Sanity check ===');
            console.log(`m03 Slide 2: ${m03slide2.message.match(/by \d+px/)[0]} (expected ~829px from earlier diagnostic)`);
        }

        fs.writeFileSync('/tmp/overflow-001b-output.json', JSON.stringify(result, null, 2));
        console.log('\nFull output → /tmp/overflow-001b-output.json');
    } finally {
        await pool.shutdown();
    }
})().catch(e => { console.error(e); process.exit(1); });
