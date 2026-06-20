/**
 * HexAIButton — floating mood-ring button for Dr. Hex (v1, 2026-05-25)
 *
 * Always-visible widget that pulses based on the student's recent
 * lab activity. Click → opens a chat panel. State is attempt-driven
 * (not idle-driven) per design 2026-05-25:
 *
 *   calm        soft cyan,   no pulse        — on-task or fresh
 *   noticing    warm yellow, 4s pulse        — 2+ wrong recently
 *   active      bright orange, 2s pulse      — 4+ wrong, stuck
 *   insistent   red,         700ms pulse     — 6+ wrong, no progress
 *   celebrating purple shimmer 1.5s          — flag captured <60s ago
 *
 * Event-driven: state is fetched on page load AND on the custom
 * `hexworth:lab-attempt-submitted` event. Pages that submit attempts
 * (validateFlag, gate check, lab-engine actions) should dispatch
 * this event after the submission lands.
 *
 * Accessibility:
 *   - ARIA label updates per state (state name appears in screen reader)
 *   - prefers-reduced-motion: pulse animations disable; color still changes
 *   - Visible color contrast >= 4.5:1 against the dark site background
 *
 * Usage (drop into a page):
 *   <script type="module" src="/_lib/HexAIButton.js"></script>
 *   <hex-ai-button mission-id="lab-py-01" house="code"></hex-ai-button>
 *
 * If mission-id is null/missing, button stays in calm mode and never
 * fetches state (acts as a chat entry only).
 */

import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js';
import { getAuth, onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-functions.js';

// Firebase init — reuse the existing app if one already exists on the page
const firebaseConfig = {
    apiKey: "AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M",
    authDomain: "hexworth-prime.firebaseapp.com",
    projectId: "hexworth-prime",
    storageBucket: "hexworth-prime.firebasestorage.app",
    messagingSenderId: "11726236962",
    appId: "1:11726236962:web:1829ea0839f2587121497b"
};
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
const auth = getAuth(app);
const functions = getFunctions(app, 'us-central1');
const ambientStateFn = httpsCallable(functions, 'hexAiAmbientState');
// Server-only attempt recorder (anti-cheat: clients can't write lab_attempts
// directly). Used by the window.__hexLabRecord global the button registers below.
const recordLabFn = httpsCallable(functions, 'hexAiRecordLabAttempt');

class HexAIButton extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._state = 'calm';
        this._missionId = null;
        this._house = null;
        this._previousState = null;
        this._authUser = null;
        this._chatPanel = null;
        // True while an admin demo has manually previewed a state; suppresses
        // visibilitychange-triggered server refetches so the preview isn't clobbered.
        this._previewActive = false;
    }

    connectedCallback() {
        this._missionId = this.getAttribute('mission-id') || null;
        this._house = this.getAttribute('house') || null;

        // Register the page-level lab-attempt recorder, keyed to THIS button's
        // mission-id — the exact id the mood-ring queries. Callers (QuizEngine's
        // _recordHexLabAttempt, lab check functions) invoke window.__hexLabRecord
        // without needing to know the id; arg1 is an ignored hint kept for call-site
        // compatibility. This is why the irregular moduleId↔mission-id mismatch
        // across quiz pages doesn't matter — we always record under mission-id.
        // NOTE: on the ~22 key pages an inline block reassigns this global AFTER us
        // (module order); harmless — those pass their own correct mission-id.
        // Skipped on no-escalate (CTF) buttons: those drive state purely from
        // flag_attempts/flag_captures, never lab_attempts, so leaving the global
        // unregistered prevents any future in-box code from accidentally writing
        // lab_attempts under a box registryId and corrupting its ambient state.
        if (this._missionId && typeof window !== 'undefined' && !this.hasAttribute('no-escalate')) {
            window.__hexLabRecord = (_idHint, exerciseId, correct) => {
                if (!auth.currentUser) return Promise.resolve();
                return recordLabFn({
                    mission_id: this._missionId,
                    exercise_id: String(exerciseId),
                    correct: !!correct,
                })
                    // Dispatch ONLY on success so a failed record never nudges a
                    // refetch. The button's own _bindEvents listener catches this
                    // and refetches state (800ms debounce) — no record, no loop.
                    .then(() => window.dispatchEvent(
                        new CustomEvent('hexworth:lab-attempt-submitted')))
                    .catch(e => console.warn(
                        '[HexAIButton] lab attempt record failed:', e?.message || e));
            };
        }

        // On LAB pages only, load the DOM observer that watches for answer-outcome
        // classes and feeds window.__hexLabRecord — these page types have no shared
        // engine, so this is how the mood-ring reacts to struggle with zero per-page
        // wiring. Scoped to *.lab.html AND *.applet.html (interactive exercises with
        // answer-outcome classes); NOT quizzes (QuizEngine self-reports) or static
        // presentations. Lazy + non-blocking; failure is non-fatal.
        if (this._missionId && typeof location !== 'undefined'
            && (location.pathname.endsWith('.lab.html')
                || location.pathname.endsWith('.applet.html'))) {
            import('/_lib/HexAILabObserver.js').catch(e => console.warn(
                '[HexAIButton] lab observer load failed:', e?.message || e));
        }

        this._render();
        this._bindEvents();
        onAuthStateChanged(auth, (user) => {
            this._authUser = user;
            if (user && this._missionId) {
                this._fetchState();
            }
        });
    }

    _render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: fixed;
                    bottom: 24px;
                    right: 24px;
                    z-index: 9000;
                }
                @media (max-width: 600px) {
                    :host {
                        bottom: 16px;
                        right: 16px;
                    }
                }
                button.dr-hex-fab {
                    width: 64px;
                    height: 64px;
                    border-radius: 50%;
                    border: 2px solid rgba(255, 255, 255, 0.15);
                    background: var(--hex-bg, #67e8f9);
                    color: #0d0d12;
                    cursor: pointer;
                    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4),
                                0 0 0 0 var(--hex-bg, #67e8f9);
                    transition: background 600ms ease, box-shadow 300ms ease;
                    font-size: 28px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 0;
                    position: relative;
                    overflow: hidden;
                }
                button.dr-hex-fab img.mascot {
                    width: 86%;
                    height: 86%;
                    object-fit: contain;
                    pointer-events: none;
                    /* SVG is centered in a square viewBox; scale to fill the
                       circular button while keeping aspect ratio. */
                }
                button.dr-hex-fab:hover {
                    transform: scale(1.06);
                }
                button.dr-hex-fab:focus-visible {
                    outline: 3px solid #fff;
                    outline-offset: 4px;
                }

                /* Pulse — emits a ring outward */
                button.dr-hex-fab.pulse::after {
                    content: '';
                    position: absolute;
                    inset: -2px;
                    border-radius: 50%;
                    border: 2px solid var(--hex-bg, #67e8f9);
                    animation: hex-pulse var(--hex-pulse-ms, 2000ms) ease-out infinite;
                    pointer-events: none;
                }
                @keyframes hex-pulse {
                    0%   { transform: scale(1);   opacity: 0.8; }
                    100% { transform: scale(1.7); opacity: 0;  }
                }
                @media (prefers-reduced-motion: reduce) {
                    button.dr-hex-fab.pulse::after { animation: none; }
                    button.dr-hex-fab { transition: background 200ms; }
                }

                /* Celebrating shimmer */
                button.dr-hex-fab.celebrating {
                    background: linear-gradient(45deg, #a78bfa, #f472b6, #67e8f9, #a78bfa);
                    background-size: 300% 300%;
                    animation: hex-shimmer 2.5s linear infinite;
                }
                @keyframes hex-shimmer {
                    0%   { background-position:   0% 50%; }
                    100% { background-position: 300% 50%; }
                }
                @media (prefers-reduced-motion: reduce) {
                    button.dr-hex-fab.celebrating { animation: none; }
                }

                /* Tooltip surface */
                .dr-hex-label {
                    position: absolute;
                    right: 76px;
                    top: 50%;
                    transform: translateY(-50%);
                    background: #15151c;
                    color: #e0e0e0;
                    padding: 8px 12px;
                    border-radius: 6px;
                    font-size: 13px;
                    white-space: nowrap;
                    opacity: 0;
                    pointer-events: none;
                    transition: opacity 200ms;
                    border: 1px solid #2a2a3a;
                }
                button.dr-hex-fab:hover + .dr-hex-label,
                button.dr-hex-fab:focus + .dr-hex-label {
                    opacity: 1;
                }
            </style>
            <button
                class="dr-hex-fab"
                aria-label="Dr. Hex AI tutor — state: calm. Click to chat."
                title="Ask Dr. Hex"
                style="--hex-bg: #67e8f9;"
            ><img class="mascot" src="/assets/images/icons/dr-hex-calm.svg" alt="" aria-hidden="true"></button>
            <span class="dr-hex-label">Ask Dr. Hex</span>
        `;
    }

    _bindEvents() {
        const btn = this.shadowRoot.querySelector('button.dr-hex-fab');
        btn.addEventListener('click', () => this._openChat());

        // Refetch state after a lab attempt is submitted. Debounce-TRAILING: reset
        // the timer on each event so rapid bursts collapse to ONE refetch, fired
        // 800ms after the LAST event. This both dedups (e.g. the Arena awardFlag path
        // dispatches twice — an early one from _reportFlagCapture and a post-write one
        // from validateAction) AND keeps the timing correct (the refetch lands after
        // the final, server-committed event), so we never waste a CF call or miss the
        // capture. 800ms also lets the Firestore commit propagate.
        let labAttemptTimer = null;
        window.addEventListener('hexworth:lab-attempt-submitted', () => {
            if (this._authUser && this._missionId) {
                clearTimeout(labAttemptTimer);
                labAttemptTimer = setTimeout(() => this._fetchState(), 800);
            }
        });

        // Refetch on visibility regain (student tabbed away and back)
        // — bounded so we don't burn reads on every micro-tabbing
        let lastRefetch = 0;
        document.addEventListener('visibilitychange', () => {
            if (document.visibilityState === 'visible' &&
                Date.now() - lastRefetch > 30000 &&
                this._authUser && this._missionId &&
                // Don't clobber a manually-previewed state (admin demo) on tab regain.
                !this._previewActive) {
                lastRefetch = Date.now();
                this._fetchState();
            }
        });
    }

    async _fetchState() {
        // A real server fetch always exits preview mode — the live state wins.
        this._previewActive = false;
        try {
            const result = await ambientStateFn({
                mission_id: this._missionId,
                previous_state: this._previousState,
            });
            const data = result.data;
            this._applyState(data);
            this._previousState = data.state;
        } catch (e) {
            // Fail-quiet — button stays in last-known state. Don't
            // spam the user with errors from an ambient feature.
            console.warn('[HexAIButton] state fetch failed:', e.code || e.message);
        }
    }

    _applyState(data) {
        const btn = this.shadowRoot.querySelector('button.dr-hex-fab');
        if (!btn) return;
        // no-escalate (CTF/Arena): wrong flag attempts are normal exploration, not
        // struggle — collapse the noticing/active/insistent ramp to calm so the
        // button stays available (one click for help) without nagging. Celebrating
        // (flag capture) and calm pass through unchanged.
        if (this.hasAttribute('no-escalate') &&
            (data.state === 'noticing' || data.state === 'active' || data.state === 'insistent')) {
            // Force the neutral prompt — keeping the escalated server prompt (e.g.
            // "Let's pair on this") would mismatch the calm visual in the chat pre-fill.
            data = { state: 'calm', color: '#67e8f9', pulse_ms: 0,
                suggested_prompt: 'Ask me anything about this box' };
        }
        btn.style.setProperty('--hex-bg', data.color);
        btn.style.setProperty('--hex-pulse-ms', `${data.pulse_ms || 2000}ms`);
        btn.classList.remove('pulse', 'celebrating');
        if (data.state === 'celebrating') {
            btn.classList.add('celebrating');
        } else if (data.pulse_ms > 0) {
            btn.classList.add('pulse');
        }
        // 2026-05-26: swap the mascot SVG so the EYE color matches the
        // mood-ring color. State-variant set generated by
        // tools/recolor_drhex_mascot.py from the hooded-figure source.
        // Valid states: calm | noticing | active | insistent | celebrating.
        const mascot = btn.querySelector('img.mascot');
        const validStates = ['calm', 'noticing', 'active', 'insistent', 'celebrating'];
        if (mascot && validStates.includes(data.state)) {
            mascot.src = `/assets/images/icons/dr-hex-${data.state}.svg`;
        }
        btn.setAttribute(
            'aria-label',
            `Dr. Hex AI tutor — state: ${data.state}. ${data.suggested_prompt}`
        );
        btn.title = data.suggested_prompt;
        this._state = data.state;
        // Store the suggested prompt for the chat panel to pre-fill
        this._suggestedPrompt = data.suggested_prompt;
    }

    // previewState(state) — ADMIN/DEMO helper only. Applies a mood-ring state
    // directly, bypassing the server ambient classifier and its time-windowed
    // priority (celebrating masks all states for 60s; active/insistent are blocked
    // for 20min after any capture), so the admin demo can show each emotion on
    // demand. Gated behind the `preview-mode` attribute, which only the admin demo
    // sets — a no-op on the 2,400+ student lab pages, so an accidental/injected
    // call can't make Dr. Hex misreport a student's real state. Real state always
    // comes from _fetchState(); any server fetch clears _previewActive and wins.
    previewState(state) {
        if (!this.hasAttribute('preview-mode')) return;
        // Keep in sync with STATE_CONFIG in functions/hex-ai-state-classifier.js
        const PREVIEW = {
            calm:        { color: '#67e8f9', pulse_ms: 0,    suggested_prompt: 'Ask me anything about this lab' },
            noticing:    { color: '#fbbf24', pulse_ms: 4000, suggested_prompt: 'Hint?' },
            active:      { color: '#fb923c', pulse_ms: 2000, suggested_prompt: 'Want a hint on what to try next?' },
            insistent:   { color: '#ef4444', pulse_ms: 700,  suggested_prompt: "Let's pair on this — click here" },
            celebrating: { color: '#a78bfa', pulse_ms: 1500, suggested_prompt: 'Nice — onto the next?' },
        };
        const cfg = PREVIEW[state];
        if (!cfg) return;
        // Suppress visibilitychange refetch (see _bindEvents) so a tab-regain
        // during a live demo can't overwrite the previewed state.
        this._previewActive = true;
        this._applyState({ state, ...cfg });
    }

    _openChat() {
        if (!this._authUser) {
            // Trigger a sign-in popup via the same Firebase auth instance
            console.warn('[HexAIButton] not signed in — chat requires Firebase auth');
            return;
        }
        // Open the chat panel by importing it lazily
        import('/_lib/HexAIChatPanel.js').then(({ openHexAIChatPanel }) => {
            openHexAIChatPanel({
                missionId: this._missionId,
                house: this._house,
                initialPrompt: this._suggestedPrompt || '',
                // 2026-05-26: pass the current mood-ring state so the chat
                // panel header can mirror the mascot eye color.
                state: this._state || 'calm',
                onAttemptSubmitted: () => {
                    // After student submits a message via the chat panel,
                    // the button could refresh state — but chat msgs don't
                    // affect lab attempt counts so we skip.
                },
            });
        }).catch(e => {
            console.error('[HexAIButton] chat panel load failed:', e);
        });
    }
}

customElements.define('hex-ai-button', HexAIButton);

export { HexAIButton };
