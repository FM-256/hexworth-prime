/**
 * AnnouncementWidget.js — Compact announcement display for embedding in any page.
 *
 * Fetches the latest 3 active announcements from the Firestore `announcements`
 * collection and renders a minimal widget with title, priority badge, and
 * relative timestamp.
 *
 * Usage:
 *   <div id="ann-widget"></div>
 *   <script src="components/AnnouncementWidget.js"></script>
 *   <script>AnnouncementWidget.init(document.getElementById('ann-widget'));</script>
 *
 * Requires: FirebaseAuth.js loaded and initialized (for Firestore SDK access).
 */
const AnnouncementWidget = (function() {
    'use strict';

    const MAX_ITEMS = 3;
    const PRIORITY_ORDER = { urgent: 0, normal: 1, info: 2 };

    const PRIORITY_COLORS = {
        urgent: { bg: 'rgba(224,64,64,0.12)', text: '#e08080' },
        normal: { bg: 'rgba(90,90,106,0.12)', text: '#8080a0' },
        info:   { bg: 'rgba(60,140,220,0.10)', text: '#6cb0ee' }
    };

    /**
     * Initialize the widget inside a container element.
     * @param {HTMLElement} containerEl - DOM element to render into
     * @param {Object} [options] - Optional config
     * @param {number} [options.limit] - Max items to show (default 3)
     * @param {string} [options.house] - Filter to a specific house
     */
    async function init(containerEl, options) {
        if (!containerEl) {
            console.warn('[AnnouncementWidget] No container element provided');
            return;
        }

        const limit = (options && options.limit) || MAX_ITEMS;
        const houseFilter = (options && options.house) || null;

        // Show loading state
        containerEl.innerHTML = renderShell('Loading...');

        try {
            const announcements = await fetchAnnouncements(limit, houseFilter);
            containerEl.innerHTML = renderWidget(announcements);
        } catch (e) {
            console.error('[AnnouncementWidget] Failed to load:', e);
            containerEl.innerHTML = renderShell('Unable to load announcements.');
        }
    }

    /**
     * Fetch active announcements from Firestore.
     */
    async function fetchAnnouncements(limit, houseFilter) {
        // Ensure Firestore SDK is available
        let firestoreModule = window.firebaseFirestore;
        if (!firestoreModule) {
            firestoreModule = await import('https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js');
            window.firebaseFirestore = firestoreModule;
        }

        const { getFirestore } = firestoreModule;
        const { getApps } = window.firebaseApp;

        if (getApps().length === 0) {
            throw new Error('Firebase app not initialized');
        }

        const db = getFirestore(getApps()[0]);
        const { collection, query, where, orderBy, getDocs } = firestoreModule;

        const q = query(
            collection(db, 'announcements'),
            where('active', '==', true),
            orderBy('created', 'desc')
        );

        const snapshot = await getDocs(q);
        const results = [];

        snapshot.forEach(docSnap => {
            const data = docSnap.data();
            // Skip expired
            if (data.expires && data.expires.toMillis() < Date.now()) return;
            // House filter
            if (houseFilter && data.houses && data.houses.length > 0 && !data.houses.includes(houseFilter)) return;
            results.push({ id: docSnap.id, ...data });
        });

        // Sort: urgent first, then newest
        results.sort((a, b) => {
            const pa = PRIORITY_ORDER[a.priority] ?? 1;
            const pb = PRIORITY_ORDER[b.priority] ?? 1;
            if (pa !== pb) return pa - pb;
            const ta = a.created?.toMillis?.() || 0;
            const tb = b.created?.toMillis?.() || 0;
            return tb - ta;
        });

        return results.slice(0, limit);
    }

    /**
     * Render the full widget HTML.
     */
    function renderWidget(announcements) {
        if (!announcements || announcements.length === 0) {
            return renderShell('No announcements.');
        }

        const items = announcements.map(a => {
            const pc = PRIORITY_COLORS[a.priority] || PRIORITY_COLORS.normal;
            const timeStr = a.created?.toDate
                ? formatRelativeTime(a.created.toDate())
                : '';

            return `
                <div style="
                    padding: 8px 10px;
                    border-bottom: 1px solid rgba(90,90,106,0.06);
                    display: flex;
                    align-items: center;
                    gap: 8px;
                ">
                    <span style="
                        padding: 1px 6px;
                        border-radius: 2px;
                        font-size: 0.4rem;
                        letter-spacing: 0.12em;
                        text-transform: uppercase;
                        background: ${pc.bg};
                        color: ${pc.text};
                        flex-shrink: 0;
                    ">${escapeHtml(a.priority || 'normal')}</span>
                    <span style="
                        font-size: 0.7rem;
                        color: #b0b0c0;
                        flex: 1;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    ">${escapeHtml(a.title || 'Untitled')}</span>
                    <span style="
                        font-size: 0.5rem;
                        color: #404050;
                        flex-shrink: 0;
                    ">${escapeHtml(timeStr)}</span>
                </div>
            `;
        }).join('');

        return `
            <div style="
                border: 1px solid rgba(90,90,106,0.1);
                border-radius: 6px;
                background: rgba(12,12,18,0.5);
                overflow: hidden;
                font-family: 'Courier New', monospace;
            ">
                <div style="
                    padding: 8px 12px;
                    border-bottom: 1px solid rgba(90,90,106,0.08);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <span style="
                        font-size: 0.55rem;
                        color: #5cacee;
                        letter-spacing: 0.15em;
                        text-transform: uppercase;
                    ">Announcements</span>
                    <a href="/announcements/" style="
                        font-size: 0.5rem;
                        color: #505060;
                        text-decoration: none;
                        letter-spacing: 0.08em;
                    ">View all</a>
                </div>
                ${items}
            </div>
        `;
    }

    /**
     * Render a shell with a status message (loading, empty, error).
     */
    function renderShell(message) {
        return `
            <div style="
                border: 1px solid rgba(90,90,106,0.1);
                border-radius: 6px;
                background: rgba(12,12,18,0.5);
                overflow: hidden;
                font-family: 'Courier New', monospace;
            ">
                <div style="
                    padding: 8px 12px;
                    border-bottom: 1px solid rgba(90,90,106,0.08);
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                ">
                    <span style="
                        font-size: 0.55rem;
                        color: #5cacee;
                        letter-spacing: 0.15em;
                        text-transform: uppercase;
                    ">Announcements</span>
                    <a href="/announcements/" style="
                        font-size: 0.5rem;
                        color: #505060;
                        text-decoration: none;
                        letter-spacing: 0.08em;
                    ">View all</a>
                </div>
                <div style="
                    padding: 16px 12px;
                    text-align: center;
                    font-size: 0.65rem;
                    color: #404050;
                ">${escapeHtml(message)}</div>
            </div>
        `;
    }

    // ── Helpers ──

    function escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatRelativeTime(date) {
        const diff = Date.now() - date.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (seconds < 60) return 'just now';
        if (minutes < 60) return minutes + 'm ago';
        if (hours < 24) return hours + 'h ago';
        if (days < 30) return days + 'd ago';
        return date.toLocaleDateString();
    }

    return { init };
})();
