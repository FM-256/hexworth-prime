/* ═══════════════════════════════════════════════════════════════════
   HatRating.js — CTF Box Rating System
   ═══════════════════════════════════════════════════════════════════
   Spy-hat themed rating widget that appears after box completion.
   Students rate 1-5 hats and optionally leave a one-line review.
   Ratings stored in Firestore (arena_ratings collection) and
   cached in localStorage for offline display.

   Usage:
     HatRating.show(boxId)          — show rating widget
     HatRating.getAverage(boxId)    — get cached average { avg, count }
     HatRating.loadAverages()       — fetch all averages from Firestore

   Firestore schema:
     arena_ratings/{boxId}/ratings/{uid}
       { rating: 1-5, review: string, timestamp: Date }
     arena_ratings/{boxId}
       { avg: number, count: number, updated: Date }
   ═══════════════════════════════════════════════════════════════════ */

const HatRating = (() => {
    'use strict';

    const STORAGE_KEY = 'hexworth_hat_ratings';
    const HAT_ICON = '/assets/images/icons/icon-hat.webp';
    let _averages = {};   // { boxId: { avg, count } }

    /* ── Init: load cached averages ──────────────────────── */

    function init() {
        try {
            const cached = localStorage.getItem(STORAGE_KEY);
            if (cached) _averages = JSON.parse(cached);
        } catch (e) { /* corrupt cache */ }
    }

    /* ── Show the rating widget ──────────────────────────── */

    function show(boxId) {
        if (!boxId) return;

        // Check if already rated
        const existingRating = _getUserRating(boxId);

        _injectStyles();

        const overlay = document.createElement('div');
        overlay.id = 'hat-rating-overlay';
        overlay.innerHTML = `
            <div class="hat-rating-card">
                <div class="hat-rating-header">
                    <img src="${HAT_ICON}" alt="" width="28" height="28" style="vertical-align:middle;">
                    <span>Rate This Box</span>
                </div>
                <div class="hat-rating-subtitle">How would you rate this challenge?</div>
                <div class="hat-rating-hats" id="hatRatingHats">
                    ${[1,2,3,4,5].map(n => `
                        <button class="hat-btn${existingRating >= n ? ' active' : ''}" data-rating="${n}" title="${_getLabel(n)}">
                            <img src="${HAT_ICON}" alt="${n} hat${n>1?'s':''}" width="36" height="36">
                        </button>
                    `).join('')}
                </div>
                <div class="hat-rating-label" id="hatRatingLabel">${existingRating ? _getLabel(existingRating) : 'Select a rating'}</div>
                <div class="hat-rating-review">
                    <input type="text" id="hatReviewInput" placeholder="One-line review (optional)"
                           maxlength="120" autocomplete="off" spellcheck="false"
                           value="${_getUserReview(boxId) || ''}">
                </div>
                <div class="hat-rating-actions">
                    <button id="hatRatingSubmit" class="hat-submit-btn"${existingRating ? '' : ' disabled'}>
                        ${existingRating ? 'Update Rating' : 'Submit Rating'}
                    </button>
                    <button id="hatRatingSkip" class="hat-skip-btn">Skip</button>
                </div>
                <div class="hat-rating-hint">Your rating helps other operatives choose their next mission.</div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Bind hat buttons
        let selectedRating = existingRating || 0;
        const hats = overlay.querySelectorAll('.hat-btn');
        const label = overlay.querySelector('#hatRatingLabel');
        const submitBtn = overlay.querySelector('#hatRatingSubmit');

        hats.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                const r = parseInt(btn.dataset.rating);
                _highlightHats(hats, r);
                label.textContent = _getLabel(r);
            });
            btn.addEventListener('mouseleave', () => {
                _highlightHats(hats, selectedRating);
                label.textContent = selectedRating ? _getLabel(selectedRating) : 'Select a rating';
            });
            btn.addEventListener('click', () => {
                selectedRating = parseInt(btn.dataset.rating);
                _highlightHats(hats, selectedRating);
                label.textContent = _getLabel(selectedRating);
                submitBtn.disabled = false;
                submitBtn.textContent = existingRating ? 'Update Rating' : 'Submit Rating';
            });
        });

        // Submit
        submitBtn.addEventListener('click', () => {
            const review = (overlay.querySelector('#hatReviewInput').value || '').trim();
            _submitRating(boxId, selectedRating, review);
            _animateSubmit(overlay);
        });

        // Skip
        overlay.querySelector('#hatRatingSkip').addEventListener('click', () => {
            _closeOverlay(overlay);
        });

        // Animate in
        requestAnimationFrame(() => overlay.classList.add('active'));
    }

    /* ── Rating labels ───────────────────────────────────── */

    function _getLabel(rating) {
        const labels = {
            1: 'Script kiddie could do this',
            2: 'Decent challenge',
            3: 'Solid box',
            4: 'Had me sweating',
            5: 'Elite-tier, would hack again'
        };
        return labels[rating] || '';
    }

    /* ── Hat highlight ───────────────────────────────────── */

    function _highlightHats(hats, count) {
        hats.forEach(h => {
            const r = parseInt(h.dataset.rating);
            if (r <= count) {
                h.classList.add('active');
            } else {
                h.classList.remove('active');
            }
        });
    }

    /* ── Submit to Firestore + localStorage ──────────────── */

    function _submitRating(boxId, rating, review) {
        // Save locally first (immediate feedback)
        _saveUserRating(boxId, rating, review);

        // Write to Firestore if available
        try {
            if (typeof firebase !== 'undefined' && firebase.firestore &&
                typeof FirebaseAuth !== 'undefined' && FirebaseAuth.isSignedIn()) {
                const user = FirebaseAuth.getUser();
                if (!user) return;
                const db = firebase.firestore();

                // Write individual rating + update aggregate atomically — read prev rating from Firestore, not localStorage
                const aggRef = db.collection('arena_ratings').doc(boxId);
                const prevRef = db.collection('arena_ratings').doc(boxId)
                    .collection('ratings').doc(user.uid);

                db.runTransaction(async (tx) => {
                    const [aggDoc, prevDoc] = await Promise.all([tx.get(aggRef), tx.get(prevRef)]);
                    const data = aggDoc.exists ? aggDoc.data() : { totalScore: 0, count: 0 };
                    const prevRating = prevDoc.exists ? (prevDoc.data().rating || 0) : 0;

                    let newTotal = (data.totalScore || 0);
                    let newCount = (data.count || 0);

                    if (prevRating) {
                        // Updating: subtract old, add new
                        newTotal = newTotal - prevRating + rating;
                    } else {
                        // New rating
                        newTotal += rating;
                        newCount += 1;
                    }

                    tx.set(aggRef, {
                        totalScore: newTotal,
                        count: newCount,
                        avg: Math.round((newTotal / newCount) * 10) / 10,
                        updated: firebase.firestore.FieldValue.serverTimestamp()
                    });

                    // Also write/update the individual rating inside the transaction
                    tx.set(prevRef, {
                        rating: rating,
                        review: review || '',
                        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                        displayName: user.displayName || 'Anonymous'
                    });

                    // Cache the new aggregate
                    _averages[boxId] = { avg: Math.round((newTotal / newCount) * 10) / 10, count: newCount };
                    _saveCachedAverages();
                }).catch(e => console.warn('[HatRating] Transaction failed:', e));
            }
        } catch (e) {
            console.warn('[HatRating] Firestore write failed:', e);
        }
    }

    /* ── localStorage helpers ────────────────────────────── */

    function _saveUserRating(boxId, rating, review) {
        try {
            const key = 'hexworth_hat_my_' + boxId;
            localStorage.setItem(key, JSON.stringify({ rating, review, time: Date.now() }));
        } catch (e) { /* quota */ }
    }

    function _getUserRating(boxId) {
        try {
            const data = JSON.parse(localStorage.getItem('hexworth_hat_my_' + boxId) || 'null');
            return data ? data.rating : 0;
        } catch (e) { return 0; }
    }

    function _getUserReview(boxId) {
        try {
            const data = JSON.parse(localStorage.getItem('hexworth_hat_my_' + boxId) || 'null');
            return data ? data.review : '';
        } catch (e) { return ''; }
    }

    function _saveCachedAverages() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(_averages));
        } catch (e) { /* quota */ }
    }

    /* ── Load all averages from Firestore ────────────────── */

    async function loadAverages() {
        try {
            if (typeof firebase === 'undefined' || !firebase.firestore) return _averages;
            const db = firebase.firestore();
            const snap = await db.collection('arena_ratings').get();
            snap.forEach(doc => {
                const data = doc.data();
                if (data.avg && data.count) {
                    _averages[doc.id] = { avg: data.avg, count: data.count };
                }
            });
            _saveCachedAverages();
        } catch (e) {
            console.warn('[HatRating] Failed to load averages:', e);
        }
        return _averages;
    }

    function getAverage(boxId) {
        return _averages[boxId] || null;
    }

    /* ── Render hat average badge (for hub cards) ────────── */

    function renderBadge(boxId) {
        const data = _averages[boxId];
        if (!data || !data.count) return '';

        const fullHats = Math.floor(data.avg);
        const hasHalf = (data.avg - fullHats) >= 0.5;
        const safeAvg = String(Number(data.avg) || 0);
        const safeCount = String(parseInt(data.count) || 0);
        let html = '<span class="hat-avg-badge" title="' + safeAvg + ' hats from ' + safeCount + ' rating' + (data.count !== 1 ? 's' : '') + '">';
        for (let i = 0; i < 5; i++) {
            const filled = i < fullHats || (i === fullHats && hasHalf);
            html += '<img src="' + HAT_ICON + '" alt="" width="14" height="14" style="opacity:' + (filled ? '1' : '0.2') + ';vertical-align:middle;">';
        }
        html += ' <span style="color:#9ca3af;font-size:0.65rem;">(' + data.count + ')</span></span>';
        return html;
    }

    /* ── Animation ───────────────────────────────────────── */

    function _animateSubmit(overlay) {
        const card = overlay.querySelector('.hat-rating-card');
        card.innerHTML = `
            <div style="text-align:center;padding:30px 20px;">
                <img src="${HAT_ICON}" alt="" width="48" height="48" style="margin-bottom:12px;">
                <div style="color:#10b981;font-size:1.1rem;font-weight:bold;margin-bottom:6px;">Rating Submitted</div>
                <div style="color:#6b7280;font-size:0.78rem;">Thanks, operative.</div>
            </div>
        `;
        setTimeout(() => _closeOverlay(overlay), 1500);
    }

    function _closeOverlay(overlay) {
        overlay.classList.remove('active');
        setTimeout(() => { if (overlay.parentNode) overlay.parentNode.removeChild(overlay); }, 300);
    }

    /* ── Styles ──────────────────────────────────────────── */

    function _injectStyles() {
        if (document.getElementById('hat-rating-styles')) return;
        const style = document.createElement('style');
        style.id = 'hat-rating-styles';
        style.textContent = `
            #hat-rating-overlay {
                position: absolute;
                top: 0; left: 0;
                width: 100%; height: 100%;
                background: rgba(0,0,0,0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 11000;
                opacity: 0;
                transition: opacity 0.3s;
                pointer-events: none;
            }
            #hat-rating-overlay.active {
                opacity: 1;
                pointer-events: auto;
            }

            .hat-rating-card {
                background: #0d1117;
                border: 1px solid #1e293b;
                border-radius: 10px;
                padding: 28px 32px;
                max-width: 400px;
                width: 90%;
                text-align: center;
                font-family: 'Courier New', Courier, monospace;
                transform: translateY(20px);
                transition: transform 0.3s;
            }
            #hat-rating-overlay.active .hat-rating-card {
                transform: translateY(0);
            }

            .hat-rating-header {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                font-size: 1.1rem;
                font-weight: bold;
                color: #e5e7eb;
                margin-bottom: 6px;
            }

            .hat-rating-subtitle {
                color: #6b7280;
                font-size: 0.75rem;
                margin-bottom: 20px;
            }

            .hat-rating-hats {
                display: flex;
                justify-content: center;
                gap: 8px;
                margin-bottom: 8px;
            }

            .hat-btn {
                background: none;
                border: 2px solid transparent;
                border-radius: 8px;
                padding: 6px;
                cursor: pointer;
                transition: transform 0.15s, border-color 0.2s;
            }
            .hat-btn img {
                display: block;
                opacity: 0.2;
                transition: opacity 0.2s, filter 0.2s;
                filter: grayscale(1);
            }
            .hat-btn.active img {
                opacity: 1;
                filter: grayscale(0);
            }
            .hat-btn:hover {
                transform: scale(1.15);
                border-color: rgba(245,158,11,0.3);
            }
            .hat-btn:hover img {
                opacity: 1;
                filter: grayscale(0);
            }

            .hat-rating-label {
                color: #f59e0b;
                font-size: 0.78rem;
                font-style: italic;
                min-height: 1.2em;
                margin-bottom: 16px;
            }

            .hat-rating-review {
                margin-bottom: 16px;
            }
            .hat-rating-review input {
                width: 100%;
                background: #0a0d14;
                border: 1px solid #1e293b;
                border-radius: 6px;
                padding: 8px 12px;
                color: #c9d1d9;
                font-family: 'Courier New', Courier, monospace;
                font-size: 0.78rem;
                outline: none;
                box-sizing: border-box;
            }
            .hat-rating-review input:focus {
                border-color: #f59e0b;
            }
            .hat-rating-review input::placeholder {
                color: #374151;
            }

            .hat-rating-actions {
                display: flex;
                gap: 10px;
                justify-content: center;
                margin-bottom: 12px;
            }

            .hat-submit-btn {
                background: rgba(245,158,11,0.15);
                color: #f59e0b;
                border: 1px solid rgba(245,158,11,0.3);
                border-radius: 6px;
                padding: 8px 20px;
                font-family: inherit;
                font-size: 0.78rem;
                font-weight: bold;
                cursor: pointer;
                transition: background 0.2s;
            }
            .hat-submit-btn:hover:not(:disabled) {
                background: rgba(245,158,11,0.25);
            }
            .hat-submit-btn:disabled {
                opacity: 0.4;
                cursor: not-allowed;
            }

            .hat-skip-btn {
                background: none;
                color: #4b5563;
                border: 1px solid #1e293b;
                border-radius: 6px;
                padding: 8px 16px;
                font-family: inherit;
                font-size: 0.78rem;
                cursor: pointer;
                transition: color 0.2s;
            }
            .hat-skip-btn:hover {
                color: #9ca3af;
            }

            .hat-rating-hint {
                color: #374151;
                font-size: 0.65rem;
            }

            /* Hub badge */
            .hat-avg-badge {
                display: inline-flex;
                align-items: center;
                gap: 2px;
            }
        `;
        document.head.appendChild(style);
    }

    /* ── Auto-init ───────────────────────────────────────── */
    init();

    /* ── Public API ──────────────────────────────────────── */
    return {
        show,
        getAverage,
        loadAverages,
        renderBadge,
        init
    };

})();
