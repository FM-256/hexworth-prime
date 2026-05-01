// Extract all examData from midterm + final into JSON we can review.
const fs = require('fs');
const path = require('path');
const DIR = '/home/eq/ai-content/hexworth-prime/_app/houses/divergent/ethics-it/exams';

function extractExamData(filePath) {
    const html = fs.readFileSync(filePath, 'utf8');
    const m = html.match(/const\s+examData\s*=\s*\[/);
    if (!m) throw new Error('examData not found in ' + filePath);
    const start = m.index + m[0].length - 1;
    let depth = 0, inStr = null, esc = false, end = -1;
    for (let i = start; i < html.length; i++) {
        const c = html[i];
        if (esc) { esc = false; continue; }
        if (inStr) {
            if (c === '\\') { esc = true; continue; }
            if (c === inStr) inStr = null;
            continue;
        }
        if (c === '"' || c === "'") { inStr = c; continue; }
        if (c === '[') depth++;
        else if (c === ']') {
            depth--;
            if (depth === 0) { end = i; break; }
        }
    }
    const lit = html.substring(start, end + 1);
    return (new Function('return ' + lit))();
}

const midterm = extractExamData(path.join(DIR, 'eth-midterm.exam.html'));
const final   = extractExamData(path.join(DIR, 'eth-final.exam.html'));

const admin = require('firebase-admin');
admin.initializeApp({projectId: 'hexworth-prime'});
const db = admin.firestore();

(async () => {
    const m = (await db.collection('quiz_keys').doc('divergent-eth-midterm').get()).data();
    const f = (await db.collection('quiz_keys').doc('divergent-eth-final').get()).data();

    console.log('=== MIDTERM ===');
    console.log('  HTML examData questions:', midterm.length);
    console.log('  Firestore answers length:', (m.answers || []).length);
    console.log('  Firestore answers:', m.answers);
    console.log();
    console.log('=== FINAL ===');
    console.log('  HTML examData questions:', final.length);
    console.log('  Firestore answers length:', (f.answers || []).length);
    console.log('  Firestore answers:', f.answers);

    // Save full content for review
    fs.writeFileSync('/tmp/midterm-questions.json', JSON.stringify(midterm, null, 2));
    fs.writeFileSync('/tmp/final-questions.json', JSON.stringify(final, null, 2));
    fs.writeFileSync('/tmp/midterm-firestore.json', JSON.stringify(m.answers));
    fs.writeFileSync('/tmp/final-firestore.json', JSON.stringify(f.answers));
    console.log('\nSaved to /tmp/midterm-questions.json, /tmp/final-questions.json');
})();
