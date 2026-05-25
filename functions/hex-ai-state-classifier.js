/**
 * hex-ai-state-classifier.js — pure state-machine classifier for the
 * floating Dr. Hex mood-ring button. Extracted from hex-ai-bridge.js
 * so it can be unit-tested standalone (no Firebase context required).
 *
 * The CF reads Firestore + composes the inputs to this function. This
 * function decides the state from those inputs. Zero Firebase deps;
 * runs in plain Node.
 */

const STATE_CONFIG = {
    calm:         { color: '#67e8f9', pulse_ms: 0,    suggested_prompt: 'Ask me anything about this lab' },
    noticing:     { color: '#fbbf24', pulse_ms: 4000, suggested_prompt: 'Hint?' },
    active:       { color: '#fb923c', pulse_ms: 2000, suggested_prompt: 'Want a hint on what to try next?' },
    insistent:    { color: '#ef4444', pulse_ms: 700,  suggested_prompt: "Let's pair on this — click here" },
    celebrating:  { color: '#a78bfa', pulse_ms: 1500, suggested_prompt: 'Nice — onto the next?' },
};

/**
 * Classify the student's current ambient state from their recent
 * attempt activity.
 *
 * Inputs (all required):
 *   attempts:         array of { ts: epoch ms, flagId: string|null }
 *                     ordered most-recent first; from flag_attempts
 *                     within the 20-min window
 *   captures:         array of { ts: epoch ms, flagId: string }
 *                     ordered most-recent first; within the 20-min window
 *   capturedFlagIds:  Set<string> of all-time captured flag IDs for
 *                     this mission (used to classify attempt correctness)
 *   nowMs:            epoch ms — pass Date.now() in prod; pass a fixed
 *                     value in tests
 *
 * Returns: { state, color, pulse_ms, suggested_prompt, window_summary }
 *
 * State machine — attempt-driven, never idle-driven:
 *   celebrating:  any capture in last 60s
 *   calm:         no attempts OR most-recent was correct
 *   insistent:    ≥6 incorrect in last 20 min AND no captures in window
 *   active:       ≥4 incorrect in last 10 min AND no captures in window
 *   noticing:     ≥2 incorrect in last 5 min
 *   calm (default fallback)
 */
function classifyAmbientState({ attempts, captures, capturedFlagIds, nowMs }) {
    if (typeof nowMs !== 'number') {
        throw new Error('classifyAmbientState: nowMs required');
    }
    const since5min  = nowMs - 5 * 60 * 1000;
    const since10min = nowMs - 10 * 60 * 1000;
    const since60s   = nowMs - 60 * 1000;

    const isIncorrect = (a) => {
        if (!a.flagId || a.flagId === '__scan__') return true;
        return !capturedFlagIds.has(a.flagId);
    };

    const attempts5  = attempts.filter(a => a.ts >= since5min);
    const attempts10 = attempts.filter(a => a.ts >= since10min);
    const captures60s = captures.filter(c => c.ts >= since60s);

    const incorrect5  = attempts5.filter(isIncorrect).length;
    const incorrect10 = attempts10.filter(isIncorrect).length;
    const incorrect20 = attempts.filter(isIncorrect).length;

    const mostRecentAttempt = attempts[0] || null;
    const mostRecentWasCorrect = mostRecentAttempt && !isIncorrect(mostRecentAttempt);

    let state;
    if (captures60s.length > 0) {
        state = 'celebrating';
    } else if (attempts.length === 0 || mostRecentWasCorrect) {
        state = 'calm';
    } else if (incorrect20 >= 6 && captures.length === 0) {
        state = 'insistent';
    } else if (incorrect10 >= 4 && captures.length === 0) {
        state = 'active';
    } else if (incorrect5 >= 2) {
        state = 'noticing';
    } else {
        state = 'calm';
    }

    const cfg = STATE_CONFIG[state];
    return {
        state,
        color: cfg.color,
        pulse_ms: cfg.pulse_ms,
        suggested_prompt: cfg.suggested_prompt,
        window_summary: {
            attempts_5min:    attempts5.length,
            incorrect_5min:   incorrect5,
            attempts_10min:   attempts10.length,
            incorrect_10min:  incorrect10,
            captures_60s:     captures60s.length,
            captures_20min:   captures.length,
            incorrect_20min:  incorrect20,
        },
    };
}

module.exports = { classifyAmbientState, STATE_CONFIG };
