/**
 * HexAILabObserver — Dr. Hex mood-ring input collector for educational labs.
 *
 * Labs hand-roll their own answer checking (no shared QuizEngine), so there is no
 * single call site to record attempts from. Instead this observer watches the DOM
 * for the answer-OUTCOME CSS classes labs already apply and records one lab attempt
 * per submission via window.__hexLabRecord (registered by HexAIButton, keyed to the
 * page's mission-id). That drives the mood-ring's struggle ramp (repeated wrong
 * answers → noticing → active → insistent) with ZERO per-lab wiring.
 *
 * Loaded on *.lab.html AND *.applet.html pages — HexAIButton dynamic-imports it on
 * both (interactive exercises with answer-outcome classes), so it never runs on
 * quizzes (*.quiz.html, handled by QuizEngine) or static presentations/content pages.
 *
 * Hardened after adversarial review (2026-06-13) against real lab patterns:
 *
 *  A. Allowlist trimmed to ANSWER-SPECIFIC tokens. Generic CSS state classes
 *     ('success'/'error'/'valid'/'invalid'/'pass'/'field-error') were dropped —
 *     labs use them for form validation, simulation progress bars and workflow
 *     buttons, NOT answer grading.
 *  B. NET-OUTCOME PER MUTATION BATCH. Many labs reveal ALL correct options on
 *     submit (add 'correct' to every right answer) alongside marking the student's
 *     wrong pick 'incorrect'. Recording each token would fire celebrating on a
 *     WRONG answer and suppress the struggle signal. So each DOM-change batch
 *     yields at most ONE record: if any 'incorrect' appeared → incorrect (the
 *     student got it wrong; the 'correct' tokens are just the reveal); else if any
 *     'correct' → correct.
 *  C. Records under the REAL mission-id (read from the button) and SKIPS the
 *     already-wired key labs (/houses/key/labs/) to avoid double-recording.
 *  D. CORRECT answers settle the ring to CALM, not celebrating — they are recorded
 *     on the 'quiz' no-celebrate channel (the deployed bridge reserves the purple
 *     shimmer for CTF captures and deliberate key-lab solves, not routine drill
 *     answers). INCORRECT answers use a real per-exercise id so struggle counts.
 *
 * Other false-positive controls: exact class-TOKEN match (so 'correct' never
 * matches the substring 'incorrect'); only NEWLY-added tokens (diffed vs the
 * mutation's old class value); armed 600ms after load; per-(id,outcome) dedup.
 */

// Already-wired labs explicitly call window.__hexLabRecord in their own code; the
// observer would double-record (and their reassigned global has a different arg
// shape). Skip them entirely.
if (location.pathname.includes('/houses/key/labs/')) {
    // no-op — these labs wire the recorder themselves
} else {

// Exact class tokens that signal a CORRECT answer (answer-specific only).
const CORRECT = new Set(['correct', 'correct-answer', 'result-correct', 'matched-correct', 'right']);
// Exact class tokens that signal an INCORRECT answer (answer-specific only).
const INCORRECT = new Set(['incorrect', 'wrong', 'wrong-answer', 'result-incorrect', 'matched-wrong', 'wrong-match', 'wrong-choice', 'zone-error']);
// Deliberately EXCLUDED: 'completed'/'complete'/'status-completed' (progress
// state), and the generic 'success'/'error'/'valid'/'invalid'/'pass'/'field-error'
// (form validation, simulation animations, workflow buttons — not answers).

let armed = false;
setTimeout(() => { armed = true; }, 600); // skip the initial render burst

let cachedMission;                 // resolved lazily from the button element
const recent = new Map();          // dedup: `${exerciseId}:${outcome}` -> last ts

function missionId() {
    if (cachedMission === undefined) {
        const btn = document.querySelector('hex-ai-button');
        // null (not 0) when absent — record() bails on a falsy mission so we can
        // never write a mission_id:0 garbage attempt, regardless of load order.
        cachedMission = (btn && btn.getAttribute('mission-id')) || null;
    }
    return cachedMission;
}

// Stable per-exercise key from the element or its nearest id-bearing ancestor.
function exerciseIdFor(el) {
    let n = el;
    for (let i = 0; i < 5 && n; i++) {
        if (n.dataset && n.dataset.exercise) return String(n.dataset.exercise).slice(0, 32);
        if (n.id) return String(n.id).slice(0, 32);
        n = n.parentElement;
    }
    return 'lab';
}

// Return 'correct'/'incorrect'/null for the first NEWLY-added outcome token on el.
// Incorrect is checked first so a reveal that adds both reads as incorrect.
function outcomeOf(el, oldClass) {
    if (!el || !el.classList) return null;
    const old = new Set((oldClass || '').split(/\s+/));
    for (const t of el.classList) {
        if (old.has(t)) continue;
        const lt = t.toLowerCase();
        // Exact-set match (keeps oddballs like 'zone-error'), PLUS answer-outcome
        // STEM match so the many real variants are caught: 'correct-flag',
        // 'selected-correct', 'placed-wrong', 'match-correct', 'wrong-ans', etc.
        // Incorrect is tested first because 'incorrect' contains 'correct' and a
        // reveal may add both. Only the answer-specific stems correct/incorrect/
        // wrong (+ exact 'right') match — never the generic success/error/pass/
        // fail/complete/valid tokens the original exclusions warned about.
        if (INCORRECT.has(t) || lt.includes('incorrect') || lt.includes('wrong')) {
            return { correct: false, el };
        }
        if (CORRECT.has(t) || lt.includes('correct') || lt === 'right') {
            return { correct: true, el };
        }
    }
    return null;
}

// Record one attempt. Correct → 'quiz' channel (calm, no shimmer); incorrect →
// real exercise id (granular struggle). Fire-and-forget; no-op if global absent.
function record(correct, el) {
    const mid = missionId();
    if (!mid) return; // no resolvable mission → never write a 0/garbage attempt
    const exId = correct ? 'quiz' : exerciseIdFor(el);
    const key = exId + ':' + correct;
    const now = Date.now();
    if (recent.has(key) && now - recent.get(key) < 1500) return;
    recent.set(key, now);
    try {
        if (typeof window.__hexLabRecord === 'function') {
            window.__hexLabRecord(mid, exId, correct);
        }
    } catch (e) { /* mood-ring is a side-channel; never disrupt the lab */ }
}

const observer = new MutationObserver((muts) => {
    if (!armed) return;
    // Net outcome for this whole batch: incorrect dominates over revealed corrects.
    let incorrectEl = null, correctEl = null;
    const note = (r) => {
        if (!r) return;
        if (r.correct === false) incorrectEl = incorrectEl || r.el;
        else correctEl = correctEl || r.el;
    };
    for (const m of muts) {
        if (m.type === 'attributes' && m.attributeName === 'class') {
            note(outcomeOf(m.target, m.oldValue));
        } else if (m.type === 'childList') {
            m.addedNodes.forEach((n) => {
                if (n.nodeType !== 1) return;
                note(outcomeOf(n, ''));
                // Cheap candidate query (substrings) instead of a full '*' walk.
                if (n.querySelectorAll) {
                    n.querySelectorAll('[class*="correct"],[class*="wrong"],[class*="right"],[class*="match"],[class*="result"]')
                        .forEach((c) => note(outcomeOf(c, '')));
                }
            });
        }
    }
    if (incorrectEl) record(false, incorrectEl);
    else if (correctEl) record(true, correctEl);
});

function start() {
    observer.observe(document.body, {
        subtree: true,
        attributes: true,
        attributeFilter: ['class'],
        attributeOldValue: true,
        childList: true,
    });
}

if (document.body) start();
else window.addEventListener('DOMContentLoaded', start);

}
