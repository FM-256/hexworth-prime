#!/usr/bin/env node
/**
 * draft-fw-quiz-keys.js — Generate DRAFT quiz_keys for the 16 STR-40 quizzes
 *                        from explanation text + cross-quiz pool matching.
 *
 * Output: functions/fw-quiz-keys-DRAFT.json
 *
 * IMPORTANT: This output is a STARTING POINT, not verified keys. Per CLAUDE.md
 * Rule #9, every server-graded quiz key must be verified before pushing to
 * Firestore. The script flags low-confidence answers — operator must review
 * those manually before seeding.
 *
 * Methodology:
 *   - Weekly quizzes (10 fw-w*-* quizzes) have inline `explanation:` fields.
 *     For each option, score by: full text containment in explanation (100pt),
 *     first-half presence (30pt), keyword overlap (3pt/word).
 *     Top score = suggested answer index. Tie within 15pt = uncertain.
 *
 *   - Exams (fw-midterm/final, fl-midterm/final, csp-midterm/final) have NO
 *     explanations. Match each exam question to the closest weekly quiz
 *     question by text similarity (≥0.65 ratio). Use the matched quiz's
 *     answer text to find the corresponding option in the exam.
 *
 * Confidence flagged per question. Operator workflow:
 *   1. node draft-fw-quiz-keys.js     # produces DRAFT JSON
 *   2. Review uncertain questions in stdout output
 *   3. Manually edit fw-quiz-keys-DRAFT.json to correct any wrong answers
 *   4. Rename to fw-quiz-keys.json + write seed-fw-keys.js
 *   5. node seed-fw-keys.js --dry-run  # verify
 *   6. node seed-fw-keys.js            # push to Firestore
 *   7. node verify-quiz-keys.js fw-w1-logical fw-w1-physical ...  # final check
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../_app');

const QUIZZES = [
    ['fw-w1-logical', 'quiz', 'houses/shield/intro-security/quizzes/fw-w1-logical.quiz.html'],
    ['fw-w1-physical', 'quiz', 'houses/shield/intro-security/quizzes/fw-w1-physical.quiz.html'],
    ['fw-w2-malware', 'quiz', 'houses/shield/intro-security/quizzes/fw-w2-malware.quiz.html'],
    ['fw-w2-wireless', 'quiz', 'houses/shield/intro-security/quizzes/fw-w2-wireless.quiz.html'],
    ['fw-w3-os-security', 'quiz', 'houses/shield/intro-security/quizzes/fw-w3-os-security.quiz.html'],
    ['fw-w3-social', 'quiz', 'houses/shield/intro-security/quizzes/fw-w3-social.quiz.html'],
    ['fw-w3-workstation', 'quiz', 'houses/shield/intro-security/quizzes/fw-w3-workstation.quiz.html'],
    ['fw-w4-data', 'quiz', 'houses/shield/intro-security/quizzes/fw-w4-data.quiz.html'],
    ['fw-w4-mobile', 'quiz', 'houses/shield/intro-security/quizzes/fw-w4-mobile.quiz.html'],
    ['fw-w4-soho', 'quiz', 'houses/shield/intro-security/quizzes/fw-w4-soho.quiz.html'],
    ['fw-midterm', 'exam', 'houses/shield/intro-security/exams/fw-midterm.exam.html'],
    ['fw-final', 'exam', 'houses/shield/intro-security/exams/fw-final.exam.html'],
    ['fl-midterm', 'exam', 'houses/web/intro-networks/exams/fl-midterm.exam.html'],
    ['fl-final', 'exam', 'houses/web/intro-networks/exams/fl-final.exam.html'],
    ['divergent-csp-midterm', 'exam', 'houses/divergent/cybersecurity-policy/exams/csp-midterm.exam.html'],
    ['divergent-csp-final', 'exam', 'houses/divergent/cybersecurity-policy/exams/csp-final.exam.html'],
];

function parseObjects(body) {
    const items = [];
    let depth = 0, current = '', inStr = null, esc = false;
    for (const ch of body) {
        if (esc) { current += ch; esc = false; continue; }
        if (ch === '\\') { current += ch; esc = true; continue; }
        if (inStr) {
            current += ch;
            if (ch === inStr) inStr = null;
            continue;
        }
        if (ch === "'" || ch === '"') { inStr = ch; current += ch; continue; }
        if (ch === '{') { if (depth === 0) current = ''; depth++; current += ch; }
        else if (ch === '}') { depth--; current += ch; if (depth === 0) { items.push(current); current = ''; } }
        else current += ch;
    }
    return items;
}

function parseQuiz(content) {
    let m = content.match(/questions:\s*\[(.*?)\]\s*\n\s*\}\s*\)/s);
    if (!m) m = content.match(/questions:\s*\[(.*?)\];/s);
    if (!m) return null;
    const items = parseObjects(m[1]);
    return items.map(raw => {
        const qm = raw.match(/question:\s*["'](.+?)["'](?=\s*,\s*options)/s);
        const om = raw.match(/options:\s*\[(.*?)\](?=\s*,\s*(?:explanation|correct))/s);
        const em = raw.match(/explanation:\s*["'](.+?)["'](?=\s*\})/s);
        if (!qm || !om) return null;
        const options = [...om[1].matchAll(/["'](.+?)["']/g)].map(x => x[1]);
        return { q: qm[1], options, explanation: em ? em[1] : '' };
    }).filter(Boolean);
}

function parseExam(content) {
    let m = content.match(/examData\s*=\s*\[(.*?)\];/s);
    if (!m) m = content.match(/(?:exam|quiz)Questions\s*=\s*\[(.*?)\];/s);
    if (!m) return null;
    const items = parseObjects(m[1]);
    return items.map(raw => {
        const qm = raw.match(/q:\s*["'](.+?)["'](?=\s*,\s*a)/s);
        const am = raw.match(/a:\s*\[(.*?)\]/s);
        if (!qm || !am) return null;
        const options = [...am[1].matchAll(/["'](.+?)["']/g)].map(x => x[1]);
        return { q: qm[1], options, explanation: '' };
    }).filter(Boolean);
}

function normalize(s) {
    return s.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/\s+/g, ' ').trim();
}

function similarity(a, b) {
    // Lightweight Jaccard on words
    const wa = new Set(normalize(a).split(' ').filter(x => x.length > 2));
    const wb = new Set(normalize(b).split(' ').filter(x => x.length > 2));
    const inter = [...wa].filter(x => wb.has(x)).length;
    const union = new Set([...wa, ...wb]).size;
    return union === 0 ? 0 : inter / union;
}

function deriveFromExplanation(options, explanation) {
    if (!explanation || !options.length) return { idx: null, confidence: 0 };
    const exp = explanation.toLowerCase();
    const half = exp.slice(0, Math.floor(exp.length / 2));
    const scores = options.map(opt => {
        const o = opt.toLowerCase();
        let s = 0;
        if (exp.includes(o)) s += 100;
        if (half.includes(o)) s += 30;
        for (const w of o.match(/\b[a-z][a-z0-9]{3,}\b/g) || []) {
            if (exp.includes(w)) s += 3;
        }
        return s;
    });
    const max = Math.max(...scores);
    if (max === 0) return { idx: null, confidence: 0 };
    const sorted = [...scores].sort((a, b) => b - a);
    const margin = sorted[0] - (sorted[1] || 0);
    return {
        idx: scores.indexOf(max),
        confidence: max >= 100 ? 'high' : (margin >= 20 ? 'medium' : 'low'),
    };
}

function findInPool(question, pool) {
    let best = null, bestScore = 0;
    for (const entry of pool) {
        const s = similarity(question, entry.q);
        if (s > bestScore) { bestScore = s; best = entry; }
    }
    return bestScore >= 0.5 ? { entry: best, score: bestScore } : null;
}

// Phase 1: build pool of high-confidence quiz answers
const pool = [];
const allParsed = {};
for (const [qid, type, rel] of QUIZZES) {
    const full = path.join(ROOT, rel);
    if (!fs.existsSync(full)) continue;
    const content = fs.readFileSync(full, 'utf8');
    const questions = type === 'quiz' ? parseQuiz(content) : parseExam(content);
    if (!questions) { console.log(`  PARSE FAIL: ${qid}`); continue; }
    allParsed[qid] = { type, questions };
    if (type !== 'quiz') continue;
    for (const q of questions) {
        const r = deriveFromExplanation(q.options, q.explanation);
        if (r.idx !== null && r.confidence !== 'low') {
            pool.push({ q: q.q, options: q.options, answerIdx: r.idx, source: qid });
        }
    }
}
console.log(`Pool: ${pool.length} high-confidence quiz answers`);

// Phase 2: derive answers for every quiz/exam
const drafts = [];
let totalQ = 0, totalLow = 0;
for (const [qid, type, rel] of QUIZZES) {
    if (!allParsed[qid]) continue;
    const { questions } = allParsed[qid];
    const answers = []; const flags = [];
    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        let result = null;
        if (q.explanation) {
            result = deriveFromExplanation(q.options, q.explanation);
        }
        if (!result || result.idx === null || result.confidence === 'low') {
            const match = findInPool(q.q, pool);
            if (match) {
                const poolAnsText = normalize(match.entry.options[match.entry.answerIdx]);
                let bestJ = -1, bestSim = 0;
                for (let j = 0; j < q.options.length; j++) {
                    const sim = poolAnsText === normalize(q.options[j]) ? 1 :
                                similarity(poolAnsText, normalize(q.options[j]));
                    if (sim > bestSim) { bestSim = sim; bestJ = j; }
                }
                if (bestSim >= 0.6) {
                    result = { idx: bestJ, confidence: bestSim >= 0.95 ? 'medium' : 'low' };
                }
            }
        }
        if (!result || result.idx === null) {
            answers.push(0);
            flags.push({ i, q: q.q.slice(0, 90), options: q.options, suggested: 0, confidence: 'NONE' });
        } else {
            answers.push(result.idx);
            if (result.confidence === 'low') {
                flags.push({ i, q: q.q.slice(0, 90), options: q.options, suggested: result.idx, confidence: 'low' });
            }
        }
    }
    drafts.push({
        quiz_id: qid,
        question_count: questions.length,
        passing_score: 70,
        answers_DRAFT: answers,
        review_required_count: flags.length,
        review_required: flags,
    });
    totalQ += questions.length;
    totalLow += flags.length;
    console.log(`  ${qid.padEnd(25)} ${type.padEnd(5)} ${String(questions.length).padStart(2)}q · review_required=${String(flags.length).padStart(2)}`);
}

const outPath = path.resolve(__dirname, 'fw-quiz-keys-DRAFT.json');
fs.writeFileSync(outPath, JSON.stringify(drafts, null, 2));
console.log(`\nDraft written: ${outPath}`);
console.log(`Total: ${totalQ} questions, ${totalLow} require manual review (${(100*totalLow/totalQ).toFixed(0)}%)`);
console.log(`\nNEXT STEPS for operator (per CLAUDE.md Rule #9):`);
console.log(`  1. Review the ${totalLow} flagged questions in fw-quiz-keys-DRAFT.json`);
console.log(`  2. Edit the answers_DRAFT array to correct any wrong auto-derived answers`);
console.log(`  3. Rename to fw-quiz-keys.json (drop _DRAFT)`);
console.log(`  4. Write seed-fw-keys.js (model on seed-aplus-core1-keys.js)`);
console.log(`  5. node seed-fw-keys.js --dry-run  # preview`);
console.log(`  6. node seed-fw-keys.js            # push to Firestore`);
console.log(`  7. node verify-quiz-keys.js fw-w1-logical ... etc.`);
