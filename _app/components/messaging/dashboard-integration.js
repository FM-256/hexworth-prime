/**
 * F-23E: Dashboard Integration — Messaging Widget
 *
 * Adds a message icon with unread badge to the dashboard header,
 * and a slide-in messaging preview panel.
 *
 * Load this script in dashboard.html AFTER FirebaseAuth and FirestoreManager:
 *   <script src="/components/messaging/dashboard-integration.js"></script>
 *
 * Dependencies:
 *   - Firebase Auth (already on dashboard)
 *   - Firestore (already on dashboard)
 *   - MessagingManager.js (optional — falls back to direct Firestore if not loaded)
 *
 * @version 1.0.0
 */

const MessagingWidget = (function() {
    'use strict';

    let initialized = false;
    let db = null;
    let currentUid = null;
    let unreadListener = null;
    let panelOpen = false;

    // ═══════════════════════════════════════════════════════════════
    // INJECT STYLES
    // ═══════════════════════════════════════════════════════════════

    function injectStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* ─── Messaging Icon in Header ─── */
            .msg-header-btn {
                position: relative;
                background: none;
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 8px;
                padding: 6px 10px;
                cursor: pointer;
                color: #8b949e;
                font-size: 0.85rem;
                transition: all 0.2s;
                display: flex;
                align-items: center;
                gap: 6px;
            }

            .msg-header-btn:hover {
                border-color: #06b6d4;
                color: #06b6d4;
            }

            .msg-header-btn:focus-visible {
                outline: 2px solid #06b6d4;
                outline-offset: 2px;
            }

            .msg-header-btn .msg-icon {
                width: 16px;
                height: 16px;
            }

            .msg-unread-badge {
                position: absolute;
                top: -6px;
                right: -6px;
                background: #06b6d4;
                color: #000;
                font-size: 0.6rem;
                font-weight: 700;
                min-width: 16px;
                height: 16px;
                border-radius: 8px;
                display: none;
                align-items: center;
                justify-content: center;
                padding: 0 4px;
            }

            .msg-unread-badge.visible {
                display: flex;
            }

            /* ─── Slide-in Panel ─── */
            .msg-panel-overlay {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                background: rgba(0,0,0,0.4);
                z-index: 9998;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.25s;
            }

            .msg-panel-overlay.open {
                opacity: 1;
                pointer-events: auto;
            }

            .msg-panel {
                position: fixed;
                top: 0;
                right: 0;
                width: 380px;
                max-width: 90vw;
                height: 100vh;
                background: #0d1117;
                border-left: 1px solid #30363d;
                z-index: 9999;
                transform: translateX(100%);
                transition: transform 0.25s ease;
                display: flex;
                flex-direction: column;
            }

            .msg-panel.open {
                transform: translateX(0);
            }

            .msg-panel-header {
                padding: 16px 20px;
                border-bottom: 1px solid #30363d;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .msg-panel-header h3 {
                font-size: 1rem;
                font-weight: 600;
                color: #e6edf3;
                letter-spacing: 0.05em;
            }

            .msg-panel-close {
                background: none;
                border: none;
                color: #8b949e;
                font-size: 1.1rem;
                cursor: pointer;
                padding: 4px 8px;
            }

            .msg-panel-close:hover {
                color: #e6edf3;
            }

            .msg-panel-close:focus-visible {
                outline: 2px solid #06b6d4;
                outline-offset: 2px;
            }

            .msg-panel-body {
                flex: 1;
                overflow-y: auto;
                scrollbar-width: thin;
                scrollbar-color: #30363d transparent;
            }

            .msg-panel-item {
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 14px 20px;
                border-bottom: 1px solid #21262d;
                cursor: pointer;
                transition: background 0.15s;
            }

            .msg-panel-item:hover {
                background: #161b22;
            }

            .msg-panel-item.unread {
                background: rgba(6,182,212,0.05);
            }

            .msg-panel-avatar {
                width: 36px;
                height: 36px;
                border-radius: 50%;
                background: #161b22;
                border: 1px solid #30363d;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.75rem;
                font-weight: 600;
                color: #06b6d4;
                flex-shrink: 0;
            }

            .msg-panel-details {
                flex: 1;
                min-width: 0;
            }

            .msg-panel-name {
                font-size: 0.85rem;
                font-weight: 600;
                color: #e6edf3;
                margin-bottom: 2px;
            }

            .msg-panel-preview {
                font-size: 0.78rem;
                color: #8b949e;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .msg-panel-item.unread .msg-panel-preview {
                color: #e6edf3;
                font-weight: 500;
            }

            .msg-panel-time {
                font-size: 0.65rem;
                color: #484f58;
                flex-shrink: 0;
            }

            .msg-panel-item.unread .msg-panel-time {
                color: #06b6d4;
            }

            .msg-panel-empty {
                padding: 40px 20px;
                text-align: center;
                color: #484f58;
                font-size: 0.9rem;
            }

            .msg-panel-footer {
                padding: 12px 16px;
                border-top: 1px solid #30363d;
            }

            .msg-panel-footer a {
                display: block;
                text-align: center;
                padding: 10px;
                background: rgba(6,182,212,0.1);
                border: 1px solid #06b6d4;
                border-radius: 6px;
                color: #06b6d4;
                text-decoration: none;
                font-size: 0.85rem;
                font-weight: 500;
                transition: background 0.2s;
            }

            .msg-panel-footer a:hover {
                background: rgba(6,182,212,0.2);
            }

            .msg-panel-footer a:focus-visible {
                outline: 2px solid #06b6d4;
                outline-offset: 2px;
            }
        `;
        document.head.appendChild(style);
    }

    // ═══════════════════════════════════════════════════════════════
    // CREATE DOM
    // ═══════════════════════════════════════════════════════════════

    function createElements() {
        // Header button — inject into .header-right
        const headerRight = document.querySelector('.header-right');
        if (!headerRight) {
            console.warn('[MessagingWidget] .header-right not found in dashboard');
            return false;
        }

        const btn = document.createElement('button');
        btn.className = 'msg-header-btn';
        btn.title = 'Messages';
        btn.innerHTML = `
            <img class="msg-icon" src="/assets/images/icons/icon-mail.webp"
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';"
                 alt="Messages" />
            <span style="display:none">[Msg]</span>
            <span class="msg-unread-badge" id="msgUnreadBadge">0</span>
        `;
        btn.addEventListener('click', togglePanel);

        // Insert before user profile
        const userProfile = headerRight.querySelector('.user-profile, .github-profile-badge');
        if (userProfile) {
            headerRight.insertBefore(btn, userProfile);
        } else {
            headerRight.appendChild(btn);
        }

        // Panel overlay
        const overlay = document.createElement('div');
        overlay.className = 'msg-panel-overlay';
        overlay.id = 'msgPanelOverlay';
        overlay.addEventListener('click', closePanel);
        document.body.appendChild(overlay);

        // Panel
        const panel = document.createElement('div');
        panel.className = 'msg-panel';
        panel.id = 'msgPanel';
        panel.innerHTML = `
            <div class="msg-panel-header">
                <h3>Messages</h3>
                <button class="msg-panel-close" id="msgPanelClose">x</button>
            </div>
            <div class="msg-panel-body" id="msgPanelBody">
                <div class="msg-panel-empty">No messages yet.</div>
            </div>
            <div class="msg-panel-footer">
                <a href="/components/messaging/inbox.html">Open Full Inbox</a>
            </div>
        `;
        document.body.appendChild(panel);

        document.getElementById('msgPanelClose').addEventListener('click', closePanel);

        // Keyboard: Escape to close, focus trap within panel
        document.addEventListener('keydown', function(e) {
            if (!panelOpen) return;
            if (e.key === 'Escape') { closePanel(); return; }
            if (e.key === 'Tab') {
                const focusable = panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                if (!focusable.length) return;
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                if (e.shiftKey) {
                    if (document.activeElement === first) { e.preventDefault(); last.focus(); }
                } else {
                    if (document.activeElement === last) { e.preventDefault(); first.focus(); }
                }
            }
        });

        return true;
    }

    // ═══════════════════════════════════════════════════════════════
    // PANEL TOGGLE
    // ═══════════════════════════════════════════════════════════════

    function togglePanel() {
        if (panelOpen) {
            closePanel();
        } else {
            openPanel();
        }
    }

    let _panelTrigger = null;

    function openPanel() {
        _panelTrigger = document.activeElement;
        panelOpen = true;
        document.getElementById('msgPanelOverlay').classList.add('open');
        document.getElementById('msgPanel').classList.add('open');
        loadRecentConversations();
        // Focus the close button for keyboard users
        const closeBtn = document.getElementById('msgPanelClose');
        if (closeBtn) closeBtn.focus();
    }

    function closePanel() {
        panelOpen = false;
        document.getElementById('msgPanelOverlay').classList.remove('open');
        document.getElementById('msgPanel').classList.remove('open');
        // Return focus to trigger
        if (_panelTrigger && typeof _panelTrigger.focus === 'function') {
            _panelTrigger.focus();
            _panelTrigger = null;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // UNREAD COUNT
    // ═══════════════════════════════════════════════════════════════

    function subscribeUnreadCount() {
        if (!db || !currentUid) return;

        if (unreadListener) unreadListener();

        unreadListener = db.collection('messages')
            .where('to', '==', currentUid)
            .where('read', '==', false)
            .where('deleted', '==', false)
            .onSnapshot((snapshot) => {
                const count = snapshot.size;
                const badge = document.getElementById('msgUnreadBadge');
                if (badge) {
                    badge.textContent = count > 99 ? '99+' : count;
                    badge.classList.toggle('visible', count > 0);
                }
            });
    }

    // ═══════════════════════════════════════════════════════════════
    // RECENT CONVERSATIONS
    // ═══════════════════════════════════════════════════════════════

    async function loadRecentConversations() {
        if (!db || !currentUid) return;

        const body = document.getElementById('msgPanelBody');

        try {
            const snap = await db.collection('conversations')
                .where('participants', 'array-contains', currentUid)
                .orderBy('lastTimestamp', 'desc')
                .limit(10)
                .get();

            if (snap.empty) {
                body.innerHTML = '<div class="msg-panel-empty">No messages yet.</div>';
                return;
            }

            body.innerHTML = '';

            // Filter out conversations hidden by this user
            const visibleDocs = snap.docs.filter(d => {
                const data = d.data();
                return !data.hiddenBy || !data.hiddenBy.includes(currentUid);
            });

            if (visibleDocs.length === 0) {
                body.innerHTML = '<div class="msg-panel-empty">No messages yet.</div>';
                return;
            }

            for (const doc of visibleDocs) {
                const conv = doc.data();
                const otherUid = conv.participants.find(uid => uid !== currentUid);

                // Get user info
                let displayName = 'Unknown';
                try {
                    const userDoc = await db.collection('users').doc(otherUid).get();
                    if (userDoc.exists) {
                        const u = userDoc.data();
                        displayName = u.callsign || u.displayName || u.email || 'Unknown';
                    }
                } catch (_) {}

                // Get unread count for this conv
                const unreadSnap = await db.collection('messages')
                    .where('conversationId', '==', doc.id)
                    .where('to', '==', currentUid)
                    .where('read', '==', false)
                    .where('deleted', '==', false)
                    .get();

                const unread = unreadSnap.size > 0;
                const timeStr = conv.lastTimestamp ? formatTime(conv.lastTimestamp.toDate()) : '';
                const initials = displayName.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();

                const item = document.createElement('div');
                item.className = 'msg-panel-item' + (unread ? ' unread' : '');
                item.innerHTML = `
                    <div class="msg-panel-avatar">${initials}</div>
                    <div class="msg-panel-details">
                        <div class="msg-panel-name">${escapeHtml(displayName)}</div>
                        <div class="msg-panel-preview">${escapeHtml(conv.lastMessage || '')}</div>
                    </div>
                    <span class="msg-panel-time">${timeStr}</span>
                `;
                item.addEventListener('click', () => {
                    window.location.href = `/components/messaging/inbox.html#conv=${doc.id}`;
                });
                body.appendChild(item);
            }
        } catch (error) {
            console.error('[MessagingWidget] Failed to load conversations:', error);
            body.innerHTML = '<div class="msg-panel-empty">Failed to load messages.</div>';
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════

    function formatTime(date) {
        const now = new Date();
        const diff = now - date;
        if (diff < 86400000 && date.getDate() === now.getDate()) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        if (diff < 172800000) return 'Yesterday';
        if (diff < 604800000) return date.toLocaleDateString([], { weekday: 'short' });
        return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // ═══════════════════════════════════════════════════════════════
    // INIT
    // ═══════════════════════════════════════════════════════════════

    function init() {
        if (initialized) return;

        injectStyles();

        if (!createElements()) {
            console.warn('[MessagingWidget] Could not create UI elements');
            return;
        }

        // Get Firestore instance
        if (window.firebaseFirestore && window.firebaseApp) {
            const { getFirestore } = window.firebaseFirestore;
            const { getApps } = window.firebaseApp;
            if (getApps().length > 0) {
                db = getFirestore(getApps()[0]);
            }
        } else if (typeof firebase !== 'undefined' && firebase.firestore) {
            db = firebase.firestore();
        }

        // Get current user
        if (typeof FirebaseAuth !== 'undefined') {
            const user = FirebaseAuth.getCurrentUser();
            if (user) {
                currentUid = user.uid;
                subscribeUnreadCount();
            }

            // Listen for auth changes
            if (firebase && firebase.auth) {
                firebase.auth().onAuthStateChanged((user) => {
                    if (user) {
                        currentUid = user.uid;
                        subscribeUnreadCount();
                    } else {
                        if (unreadListener) unreadListener();
                        currentUid = null;
                    }
                });
            }
        }

        initialized = true;
        console.log('[MessagingWidget] Initialized');
    }

    // Auto-init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // Defer slightly to ensure Firebase is loaded
        setTimeout(init, 500);
    }

    return {
        init,
        openPanel,
        closePanel,
        get unreadCount() {
            const badge = document.getElementById('msgUnreadBadge');
            return badge ? parseInt(badge.textContent) || 0 : 0;
        }
    };
})();
