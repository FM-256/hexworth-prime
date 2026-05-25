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
    h2 { margin: 0; font-size: 1rem; font-weight: 600; }
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
    .msg.thinking { color: #8a8a9a; font-style: italic; }
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
    }

    connectedCallback() {
        const ctx = this._ctx || {};
        this._missionId = ctx.missionId || null;
        this._house = ctx.house || null;
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
    }

    _render() {
        this.shadowRoot.innerHTML = `
            <style>${STYLE}</style>
            <header>
                <h2>Dr. Hex${this._house ? ` · ${escapeHtml(this._house)}` : ''}</h2>
                <button class="close-btn" aria-label="Close chat">×</button>
            </header>
            <div class="messages" role="log" aria-live="polite"></div>
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
            });
            const data = result.data;
            thinkingNode.remove();
            const aiNode = this._appendMessage('ai', data.response || '(no response)');
            // Append metadata footer
            const meta = document.createElement('div');
            meta.className = 'meta';
            meta.textContent = `${data.persona_name || 'Dr. Hex'} · ${data.help_level_label || ''} · ${Math.round((data.latency_ms || 0) / 1000)}s`;
            aiNode.appendChild(meta);
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
