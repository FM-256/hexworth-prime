/**
 * HexAIChatPanel — student-facing chat panel for Dr. Hex (v1, 2026-05-25)
 *
 * Opens as a side-panel overlay. Reuses the orchestrator's /chat
 * blocking path via the existing hexAiChat callable function (NOT
 * the streaming HTTP endpoint — keeps the chat panel simple; v2
 * can swap in streaming for incremental token reveal).
 *
 * Conversation memory: a single conversation_id is minted per page
 * load (UUID v4) and persisted in sessionStorage so re-opening the
 * panel within the same session continues the conversation.
 *
 * Loaded lazily by HexAIButton — kept out of every-page bundle.
 *
 * Public API:
 *   openHexAIChatPanel({ missionId, house, initialPrompt, onAttemptSubmitted })
 */

import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js';
import { getFunctions, httpsCallable } from 'https://www.gstatic.com/firebasejs/12.7.0/firebase-functions.js';

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
const chatFn = httpsCallable(functions, 'hexAiChat');
const engagementFn = httpsCallable(functions, 'hexAiEngagementEvent');

// ── TELEMETRY-001: post-intervention engagement instrumentation ───────────
// Emit engagement events to the server so we can answer: "did the student
// continue productive work AFTER Dr. Hex intervened?" — the production-truth
// metric from dr-hex-constitution.md §7 + dr-hex-production-stability.md §5.
//
// Beacons fail silently when the receiving CF is not deployed yet. The
// instrumentation is wired so the data starts flowing the moment the
// hexAiEngagementEvent CF lands in production.
async function _sendEngagementEvent(eventType, payload = {}) {
    try {
        if (!auth.currentUser) return;
        await engagementFn({
            event_type: eventType,
            mission_id: payload.mission_id || null,
            house: payload.house || null,
            intervention_id: payload.intervention_id || null,
            conversation_id: payload.conversation_id || null,
            metadata: payload.metadata || {},
            ts_iso: new Date().toISOString(),
        });
    } catch (err) {
        // Silent — receiving CF may not be deployed yet. Don't spam users.
        if (typeof console !== 'undefined' && console.debug) {
            console.debug('[hex-ai engagement beacon dropped]', eventType, err?.code || err?.message);
        }
    }
}

const STYLE = `
    :host {
        position: fixed;
        top: 0; right: 0; bottom: 0;
        width: min(440px, 100vw);
        z-index: 9100;
        background: #0d0d12;
        color: #e0e0e0;
        border-left: 1px solid #2a2a3a;
        display: flex;
        flex-direction: column;
        box-shadow: -8px 0 32px rgba(0, 0, 0, 0.6);
        font-family: -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    @media (max-width: 600px) {
        :host { width: 100vw; }
    }
    header {
        padding: 14px 18px;
        border-bottom: 1px solid #2a2a3a;
        background: #15151c;
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    h2 {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
        color: #f0f0f5;
        display: flex;
        align-items: center;
        gap: 0.6rem;
    }
    h2 img.panel-mascot {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: var(--panel-mascot-bg, #67e8f9);
        padding: 3px;
        flex-shrink: 0;
    }
    h2 .header-house {
        font-size: 0.85rem;
        font-weight: 500;
        color: #8a8a9a;
        letter-spacing: 0.02em;
    }
    button.close-btn {
        background: none;
        border: none;
        color: #8a8a9a;
        font-size: 1.5rem;
        cursor: pointer;
        padding: 4px 10px;
        border-radius: 4px;
    }
    button.close-btn:hover { background: #2a2a3a; color: #e0e0e0; }
    .messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    .msg { padding: 10px 14px; border-radius: 8px; max-width: 90%; line-height: 1.45; font-size: 0.92rem; white-space: pre-wrap; }
    .msg.user { background: #2a3a5a; align-self: flex-end; }
    .msg.ai   { background: #1a1a24; align-self: flex-start; border: 1px solid #2a2a3a; }
    .msg.ai .meta { font-size: 0.72rem; color: #8a8a9a; margin-top: 6px; }
    .msg.ai .downvote-row {
        display: flex;
        gap: 8px;
        margin-top: 6px;
        font-size: 0.74rem;
        color: #6a6a7a;
    }
    .msg.ai .downvote-btn {
        background: none;
        border: none;
        color: #6a6a7a;
        cursor: pointer;
        padding: 2px 6px;
        border-radius: 4px;
        font: inherit;
    }
    .msg.ai .downvote-btn:hover { background: #2a2a3a; color: #c0c0d0; }
    .msg.ai .downvote-btn.active { color: #ef4444; background: #2a1a1a; }
    .msg.thinking { color: #8a8a9a; font-style: italic; }
    .suggested-row {
        padding: 0.4rem 16px 0;
        display: flex;
        gap: 0.4rem;
        flex-wrap: wrap;
    }
    .suggested-row .chip {
        background: #1e1e2a;
        border: 1px solid #3a3a4a;
        border-radius: 999px;
        padding: 0.3rem 0.75rem;
        font-size: 0.78rem;
        color: #c0c0d0;
        cursor: pointer;
        font: inherit;
        font-size: 0.78rem;
    }
    .suggested-row .chip:hover {
        background: #2a2a3a;
        border-color: #5a5ae4;
        color: #e0e0e0;
    }
    .suggested-row .chip:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    footer {
        padding: 12px 16px;
        border-top: 1px solid #2a2a3a;
        background: #15151c;
        display: flex;
        gap: 8px;
    }
    textarea {
        flex: 1;
        background: #0d0d12;
        color: #e0e0e0;
        border: 1px solid #3a3a4a;
        border-radius: 6px;
        padding: 8px 10px;
        font: inherit;
        resize: none;
        min-height: 38px;
        max-height: 120px;
    }
    button.send-btn {
        background: #4a4ad4;
        color: #fff;
        border: 1px solid #5a5ae4;
        padding: 8px 16px;
        border-radius: 6px;
        font: inherit;
        cursor: pointer;
    }
    button.send-btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .signin-banner {
        padding: 20px;
        text-align: center;
        color: #b0b0c0;
        font-size: 0.9rem;
    }
`;

let _panelInstance = null;

class HexAIChatPanel extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._convId = null;
        this._missionId = null;
        this._house = null;
        this._inFlight = false;
        // TELEMETRY-001: track the most recent intervention so subsequent
        // events (downvote, walkthrough_opened, tab_closed) can be joined
        // to it server-side.
        this._lastInterventionId = null;
        this._lastInterventionTs = 0;
        this._beforeUnloadHandler = null;
    }

    connectedCallback() {
        const ctx = this._ctx || {};
        this._missionId = ctx.missionId || null;
        this._house = ctx.house || null;
        // 2026-05-26: capture the button's current mood-ring state so we can
        // pick the matching mascot variant for the panel header.
        this._initialState = ctx.state || 'calm';
        this._initialPromptForChip = (ctx.initialPrompt || '').trim();
        // Mood-ring color matching for the header mascot background
        const STATE_BG = {
            calm: '#67e8f9', noticing: '#fbbf24', active: '#fb923c',
            insistent: '#ef4444', celebrating: '#a78bfa',
        };
        // Set as inline style so it applies even though Shadow DOM blocks
        // inherited CSS custom properties from the outer page.
        this.style.setProperty('--panel-mascot-bg', STATE_BG[this._initialState] || STATE_BG.calm);
        // Persist conversation per page-session
        const key = `hex_ai_conv_id_${this._missionId || 'global'}`;
        let stored = sessionStorage.getItem(key);
        if (!stored) {
            stored = crypto.randomUUID();
            sessionStorage.setItem(key, stored);
        }
        this._convId = stored;
        this._render();
        const initial = (ctx.initialPrompt || '').trim();
        if (initial && initial !== 'Ask me anything about this lab') {
            this.shadowRoot.querySelector('textarea').value = initial;
        }

        // TELEMETRY-001: tab_closed beacon. Fires when the student leaves
        // the page after Dr. Hex has intervened in this session. Helps
        // catch the "abandoned" outcome — see Constitution §19.1 premortem.
        this._beforeUnloadHandler = () => {
            if (this._lastInterventionId) {
                const sinceMs = Date.now() - this._lastInterventionTs;
                // Only emit if the intervention happened relatively recently
                // (≤ 10 min) — otherwise the leaving is not tied to it.
                if (sinceMs <= 10 * 60 * 1000) {
                    _sendEngagementEvent('tab_closed', {
                        mission_id: this._missionId,
                        house: this._house,
                        intervention_id: this._lastInterventionId,
                        conversation_id: this._convId,
                        metadata: { since_intervention_ms: sinceMs },
                    });
                }
            }
        };
        window.addEventListener('beforeunload', this._beforeUnloadHandler);

        // TELEMETRY-001: walkthrough_opened beacon. Document-level link
        // listener catches clicks on links pointing to walkthrough docs.
        // Best-effort — students who right-click → "open in new tab" are
        // not counted, but that's fine; the metric is directional.
        document.addEventListener('click', this._handleDocClick = (e) => {
            const a = e.target && e.target.closest && e.target.closest('a[href]');
            if (!a) return;
            const href = a.getAttribute('href') || '';
            if (/walkthrough|solution[s]?\//i.test(href)) {
                _sendEngagementEvent('walkthrough_opened', {
                    mission_id: this._missionId,
                    house: this._house,
                    intervention_id: this._lastInterventionId,
                    conversation_id: this._convId,
                    metadata: { href },
                });
            }
        }, true);
    }

    disconnectedCallback() {
        if (this._beforeUnloadHandler) {
            window.removeEventListener('beforeunload', this._beforeUnloadHandler);
        }
        if (this._handleDocClick) {
            document.removeEventListener('click', this._handleDocClick, true);
        }
    }

    // Suggested-prompt chips for first-touch student. Picks up the
    // state-specific suggested_prompt from the button + adds a couple
    // generic starter moves. Chips disappear after first send (no
    // re-suggestion mid-conversation — would feel pushy).
    _suggestedPrompts() {
        if (this._chipsConsumed) return null;
        const fromState = this._initialPromptForChip || '';
        // Generic fallback chips when no state-specific prompt
        const GENERIC = [
            "Where did I get stuck?",
            "What should I try next?",
        ];
        if (fromState && fromState !== 'Ask me anything about this lab') {
            // Use the state-specific prompt + one generic
            return [fromState, GENERIC[1]];
        }
        return GENERIC;
    }

    _render() {
        this.shadowRoot.innerHTML = `
            <style>${STYLE}</style>
            <header>
                <h2>
                    <img class="panel-mascot" src="/assets/images/icons/dr-hex-${this._initialState}.svg" alt="" aria-hidden="true">
                    <span>Dr. Hex</span>
                    ${this._house ? `<span class="header-house">· ${escapeHtml(this._house)}</span>` : ''}
                </h2>
                <button class="close-btn" aria-label="Close chat">×</button>
            </header>
            <div class="messages" role="log" aria-live="polite"></div>
            ${this._suggestedPrompts() ? `
            <div class="suggested-row" id="suggested-row">
                ${this._suggestedPrompts().map(p => `<button type="button" class="chip">${escapeHtml(p)}</button>`).join('')}
            </div>` : ''}
            <footer>
                <textarea
                    aria-label="Type your question for Dr. Hex"
                    placeholder="Ask Dr. Hex about this lab…"
                    rows="1"
                ></textarea>
                <button class="send-btn" type="button">Send</button>
            </footer>
        `;
        const closeBtn = this.shadowRoot.querySelector('button.close-btn');
        const sendBtn = this.shadowRoot.querySelector('button.send-btn');
        const ta = this.shadowRoot.querySelector('textarea');

        closeBtn.addEventListener('click', () => this._close());
        sendBtn.addEventListener('click', () => this._send());
        ta.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this._send();
            }
        });
        // Suggested-prompt chips — click pre-fills + sends immediately.
        const chips = this.shadowRoot.querySelectorAll('.suggested-row .chip');
        for (const chip of chips) {
            chip.addEventListener('click', () => {
                if (this._inFlight) return;
                ta.value = chip.textContent;
                this._chipsConsumed = true;
                const row = this.shadowRoot.querySelector('.suggested-row');
                if (row) row.remove();
                this._send();
            });
        }
        ta.focus();
    }

    async _send() {
        if (this._inFlight) return;
        const ta = this.shadowRoot.querySelector('textarea');
        const msg = ta.value.trim();
        if (!msg) return;
        if (msg.length > 2000) {
            this._appendMessage('ai', 'Message too long — please keep questions under 2000 characters.');
            return;
        }
        if (!auth.currentUser) {
            this._appendMessage('ai', 'Please sign in to chat with Dr. Hex.');
            return;
        }
        ta.value = '';
        this._inFlight = true;
        this._setSendButtonDisabled(true);
        this._appendMessage('user', msg);
        const thinkingNode = this._appendMessage('thinking', 'Dr. Hex is thinking…');

        try {
            const result = await chatFn({
                message: msg,
                house: this._house || undefined,
                mission_id: this._missionId || undefined,
                conversation_id: this._convId,
                // 2026-05-26: send page location so Dr. Hex always knows
                // WHERE the student is — even on house/course landing
                // pages where no mission_id is set. Dr. Hex was previously
                // blind on those pages and would say things like "I don't
                // know which lab you're on."
                page_path: window.location.pathname,
                page_title: document.title,
            });
            const data = result.data;
            thinkingNode.remove();
            const aiNode = this._appendMessage('ai', data.response || '(no response)');
            // Append metadata footer
            const meta = document.createElement('div');
            meta.className = 'meta';
            meta.textContent = `${data.persona_name || 'Dr. Hex'} · ${data.help_level_label || ''} · ${Math.round((data.latency_ms || 0) / 1000)}s`;
            aiNode.appendChild(meta);

            // TELEMETRY-001: intervention_sent + downvote UI.
            const interventionId = crypto.randomUUID();
            this._lastInterventionId = interventionId;
            this._lastInterventionTs = Date.now();
            _sendEngagementEvent('intervention_sent', {
                mission_id: this._missionId,
                house: this._house,
                intervention_id: interventionId,
                conversation_id: this._convId,
                metadata: {
                    help_level_label: data.help_level_label || null,
                    response_length: (data.response || '').length,
                    latency_ms: data.latency_ms || null,
                },
            });

            // Downvote button — UI element to surface explicit student dissatisfaction.
            const row = document.createElement('div');
            row.className = 'downvote-row';
            row.innerHTML = `<button type="button" class="downvote-btn" aria-label="Mark this response as unhelpful">unhelpful?</button>`;
            const btn = row.querySelector('button');
            btn.addEventListener('click', () => {
                btn.classList.toggle('active');
                const active = btn.classList.contains('active');
                _sendEngagementEvent(active ? 'downvote_response' : 'downvote_response_cleared', {
                    mission_id: this._missionId,
                    house: this._house,
                    intervention_id: interventionId,
                    conversation_id: this._convId,
                });
            });
            aiNode.appendChild(row);

            // Best-effort external_ai_signal: detect a copy of Dr. Hex's
            // own response text. Students who copy the AI's answer to paste
            // somewhere else (likely another AI) are a directional signal.
            // The aiNode listener is removed when aiNode is GC'd with the
            // panel.
            aiNode.addEventListener('copy', () => {
                _sendEngagementEvent('external_ai_signal', {
                    mission_id: this._missionId,
                    house: this._house,
                    intervention_id: interventionId,
                    conversation_id: this._convId,
                    metadata: { signal: 'copied_dr_hex_response' },
                });
            });
        } catch (err) {
            thinkingNode.remove();
            const code = err.code || 'error';
            let msg = 'Dr. Hex isn\'t available right now.';
            if (code.includes('unauthenticated')) msg = 'Please sign in to chat.';
            else if (code.includes('resource-exhausted') || code.includes('429')) msg = 'You\'re sending messages too quickly. Wait a minute and try again.';
            else if (code.includes('deadline-exceeded')) msg = 'Dr. Hex took too long to respond. Try a shorter question.';
            this._appendMessage('ai', msg);
        } finally {
            this._inFlight = false;
            this._setSendButtonDisabled(false);
            ta.focus();
        }
    }

    _appendMessage(kind, text) {
        const div = document.createElement('div');
        div.className = `msg ${kind}`;
        div.textContent = text;
        this.shadowRoot.querySelector('.messages').appendChild(div);
        div.scrollIntoView({ block: 'end' });
        return div;
    }

    _setSendButtonDisabled(state) {
        this.shadowRoot.querySelector('button.send-btn').disabled = state;
    }

    _close() {
        if (_panelInstance === this) _panelInstance = null;
        this.remove();
    }
}

customElements.define('hex-ai-chat-panel', HexAIChatPanel);

function escapeHtml(s) {
    return String(s ?? '')
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function openHexAIChatPanel(ctx = {}) {
    if (_panelInstance) {
        _panelInstance._close();
    }
    const el = document.createElement('hex-ai-chat-panel');
    el._ctx = ctx;
    document.body.appendChild(el);
    _panelInstance = el;
    return el;
}
