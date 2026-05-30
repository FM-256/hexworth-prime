/**
 * HexAILabAttempt, AI-19 + AI-20 helper for educational labs that use
 * client-side answer validation (no CTF flag path).
 *
 * Records a per-exercise attempt to users/{uid}/lab_attempts via the
 * hexAiRecordLabAttempt CF, then dispatches the
 * `hexworth:lab-attempt-submitted` event that <hex-ai-button> listens
 * for to refetch its mood-ring state.
 *
 * Usage in a lab page (replaces the existing wrong/right plumbing):
 *
 *   <script type="module">
 *     import { recordLabAttempt }
 *       from '/_lib/HexAILabAttempt.js';
 *
 *     async function checkExercise1() {
 *       const answer = document.getElementById('ex1-answer').value;
 *       const correct = (answer === expected);
 *       if (correct) {
 *         showFeedback(1, 'success', '...');
 *         markComplete(1);
 *       } else {
 *         showFeedback(1, 'error', '...');
 *       }
 *       // One line, fire and forget. Failure is non-fatal to the
 *       // lab UX; the student still sees feedback either way.
 *       recordLabAttempt('key-hmac', '1', correct);
 *     }
 *   </script>
 *
 * Non-fatal by design: if the user isn't signed in, the CF errors, the
 * network drops, anything else, we log the warning and move on. The
 * mood-ring is a UX nicety; the underlying lab is the actual lesson.
 *
 * The mission_id passed here is the SAME string mounted on the
 * <hex-ai-button mission-id="..."> on the same page. Convention: the
 * file basename without the suffix (e.g. `key-hmac` for `key-hmac.lab.html`).
 */

import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-functions.js';

// Reuse an existing Firebase app if the page already initialized one
// (e.g. via HexAIButton on the same page), otherwise initialize ours.
const firebaseConfig = {
    apiKey: 'AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M',
    authDomain: 'hexworth-prime.firebaseapp.com',
    projectId: 'hexworth-prime',
    storageBucket: 'hexworth-prime.firebasestorage.app',
    messagingSenderId: '11726236962',
    appId: '1:11726236962:web:1829ea0839f2587121497b',
};
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app, 'us-central1');
const recordFn = httpsCallable(functions, 'hexAiRecordLabAttempt');

/**
 * Record a lab attempt + nudge the mood-ring to refetch.
 *
 * @param {string} missionId    matches the <hex-ai-button mission-id="...">
 *                              on the page. ≤64 alphanum/_/- chars.
 * @param {string} exerciseId   per-page exercise key (e.g. "1", "2",
 *                              "key-mode", or whatever the page uses).
 *                              ≤32 alphanum/_/- chars.
 * @param {boolean} correct     true if the student's answer was right.
 * @returns {Promise<void>}     resolves whether the record succeeded or
 *                              not. Errors are logged and swallowed.
 */
export async function recordLabAttempt(missionId, exerciseId, correct) {
    // Defensive: if no signed-in user, skip the CF entirely. Anonymous
    // students still get the lab experience; the mood ring just stays
    // calm for them. (Mood ring requires auth anyway.)
    if (!auth.currentUser) {
        return;
    }
    try {
        await recordFn({
            mission_id: missionId,
            exercise_id: String(exerciseId),
            correct: !!correct,
        });
    } catch (e) {
        // Non-fatal. Log so a developer can spot it in the console.
        console.warn('[HexAILabAttempt] record failed:', e?.message || e);
        return;
    }
    // Fire the event AFTER the CF resolves. HexAIButton already has an
    // 800ms internal debounce to let Firestore propagate before its
    // refetch, so we don't need to add another delay here.
    try {
        window.dispatchEvent(new CustomEvent('hexworth:lab-attempt-submitted'));
    } catch (e) {
        // CustomEvent failure is exotic but possible in non-browser
        // contexts; swallow silently.
    }
}
