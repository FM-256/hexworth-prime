const path = require('path');
const fs = require('fs');
const puppeteer = require('puppeteer');

const LAB = path.resolve('/home/eq/ai-content/hexworth-prime/_app/houses/cloud/ms-102/labs/ms102-ch05-exchange.lab.html');
const HTML = fs.readFileSync(LAB, 'utf8');
const PAGE_URL = 'https://hexworth.com/__ms102-ch05-chris-test';

async function fresh(browser, fn) {
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on('request', req => {
        if (req.url() === PAGE_URL) { req.respond({ contentType: 'text/html', body: HTML }); return; }
        req.abort();
    });
    await page.evaluateOnNewDocument(() => { try { localStorage.clear(); } catch (e) {} });
    await page.goto(PAGE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('#task1');
    const out = await fn(page);
    await page.close();
    return out;
}

(async () => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });

    // Test A: create TWO mailboxes before confirming T6 -> count should be 14, and entering 13 should fail, 14 should pass
    const a = await fresh(browser, async (page) => page.evaluate(() => {
        document.getElementById('mbDisplayName').value = 'IT Support Team';
        document.getElementById('mbEmail').value = 'itsupport';
        createSharedMailbox();
        // create a second mailbox before confirming checkpoint
        document.getElementById('mbDisplayName').value = 'Second Team';
        document.getElementById('mbEmail').value = 'secondteam';
        openNewMailbox(); // toggled hidden->visible, but createSharedMailbox doesn't need form visible
        createSharedMailbox();
        var liveCount = document.getElementById('sharedCount').textContent.trim();
        // try stale answer 13
        document.getElementById('cp6input').value = '13';
        verifyCheckpointInput(6, 'cp6input', 1);
        var afterStale = !!window.completed[6];
        // try correct live answer
        document.getElementById('cp6input').value = liveCount;
        verifyCheckpointInput(6, 'cp6input', 1);
        var afterLive = !!window.completed[6];
        return { liveCount: liveCount, afterStale: afterStale, afterLive: afterLive };
    }));
    console.log('Test A (2 mailboxes, live-read T6):', JSON.stringify(a));

    // Test B: confirm correctValue/norm are NOT on window (console-reachable oracle check)
    const b = await fresh(browser, async (page) => page.evaluate(() => {
        return {
            correctValueOnWindow: typeof window.correctValue,
            normOnWindow: typeof window.norm,
            answerCheckpointOnWindow: typeof window.answerCheckpoint,
            verifyCheckpointInputOnWindow: typeof window.verifyCheckpointInput
        };
    }));
    console.log('Test B (console oracle check):', JSON.stringify(b));

    // Test C: brute-force all 3 options on cp8 in sequence without reading -- does 2nd wrong attempt after 1st wrong still work (no lockout), and does eventual correct still register?
    const c = await fresh(browser, async (page) => page.evaluate(() => {
        function clickOpt(label) {
            var btns = document.querySelectorAll('#cp8 .cp-opt');
            for (var i=0;i<btns.length;i++){ if(btns[i].textContent.trim()===label){btns[i].click(); return;} }
        }
        clickOpt('Encrypt External Finance Mail'); // wrong
        var s1 = !!window.completed[8];
        clickOpt('Add Legal Disclaimer'); // wrong
        var s2 = !!window.completed[8];
        clickOpt('Block Macro Attachments'); // correct
        var s3 = !!window.completed[8];
        return { s1, s2, s3 };
    }));
    console.log('Test C (brute force MC, sanity - not a block, just characterizing):', JSON.stringify(c));

    // Test D: T6 input disabled after success (can't be edited to a different stale value later)
    const d = await fresh(browser, async (page) => page.evaluate(() => {
        document.getElementById('mbDisplayName').value = 'IT Support Team';
        document.getElementById('mbEmail').value = 'itsupport';
        createSharedMailbox();
        var liveCount = document.getElementById('sharedCount').textContent.trim();
        document.getElementById('cp6input').value = liveCount;
        verifyCheckpointInput(6, 'cp6input', 1);
        return { disabled: document.getElementById('cp6input').disabled, completed6: !!window.completed[6] };
    }));
    console.log('Test D (T6 input disabled post-success):', JSON.stringify(d));

    await browser.close();
})();
