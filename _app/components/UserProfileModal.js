/**
 * UserProfileModal.js - Public Profile Viewer
 *
 * Click a leaderboard entry to view that user's public profile.
 * Full-color dossier card with mascot banner, XP bar, and house theming.
 *
 * @requires FirestoreManager.js
 * @requires FirebaseAuth.js (optional, for "YOU" badge)
 */

(function() {
    'use strict';

    let overlay = null;

    const houseColors = {
        web:        { primary: '#60a5fa', glow: 'rgba(96,165,250,0.4)',  bg: 'rgba(96,165,250,0.08)' },
        shield:     { primary: '#a855f7', glow: 'rgba(168,85,247,0.4)',  bg: 'rgba(168,85,247,0.08)' },
        cloud:      { primary: '#06b6d4', glow: 'rgba(6,182,212,0.4)',   bg: 'rgba(6,182,212,0.08)' },
        forge:      { primary: '#f97316', glow: 'rgba(249,115,22,0.4)',  bg: 'rgba(249,115,22,0.08)' },
        script:     { primary: '#22c55e', glow: 'rgba(34,197,94,0.4)',   bg: 'rgba(34,197,94,0.08)' },
        code:       { primary: '#ec4899', glow: 'rgba(236,72,153,0.4)',  bg: 'rgba(236,72,153,0.08)' },
        key:        { primary: '#eab308', glow: 'rgba(234,179,8,0.4)',   bg: 'rgba(234,179,8,0.08)' },
        eye:        { primary: '#6366f1', glow: 'rgba(99,102,241,0.4)',  bg: 'rgba(99,102,241,0.08)' },
        'dark-arts':{ primary: '#94a3b8', glow: 'rgba(148,163,184,0.4)', bg: 'rgba(148,163,184,0.08)' },
        matrix:     { primary: '#ef4444', glow: 'rgba(239,68,68,0.4)',   bg: 'rgba(239,68,68,0.08)' },
        divergent:  { primary: '#facc15', glow: 'rgba(250,204,21,0.4)',  bg: 'rgba(250,204,21,0.08)' }
    };

    const houseData = {
        web:        { name: 'House of the Web',       domain: 'Networking & Connections' },
        shield:     { name: 'House of the Shield',    domain: 'Security & Defense' },
        cloud:      { name: 'House of the Cloud',     domain: 'Infrastructure & Scale' },
        forge:      { name: 'House of the Forge',     domain: 'Hardware & Systems' },
        script:     { name: 'House of the Script',    domain: 'Automation & Efficiency' },
        code:       { name: 'House of the Code',      domain: 'Development & DevOps' },
        key:        { name: 'House of the Key',       domain: 'Cryptography & Identity' },
        eye:        { name: 'House of the Eye',       domain: 'Monitoring & Analysis' },
        'dark-arts':{ name: 'House of the Dark Arts', domain: 'Offensive Security & Research' },
        matrix:     { name: 'House of the Matrix',    domain: 'Mechanics & Operations' },
        divergent:  { name: 'The Factionless',        domain: 'All Domains' }
    };

    const tierBadges = {
        founding_member: { icon: '/assets/images/icons/icon-diamond.webp',     label: 'Founding Member', color: '#ffd700', bg: 'rgba(255,215,0,0.15)' },
        early_adopter:   { icon: '/assets/images/icons/icon-target.webp',      label: 'Early Adopter',   color: '#87ceeb', bg: 'rgba(135,206,235,0.15)' },
        beta_tester:     { icon: '/assets/images/icons/icon-microscope.webp',  label: 'Beta Tester',     color: '#9370db', bg: 'rgba(147,112,219,0.15)' },
        free:            { icon: '/assets/images/icons/icon-detective.webp',   label: 'Operative',       color: '#888',    bg: 'rgba(136,136,136,0.1)' }
    };

    function computeLevel(xp) {
        return Math.max(1, Math.floor((1 + Math.sqrt(1 + (xp || 0) / 12.5)) / 2));
    }

    function xpForLevel(lvl) {
        return Math.floor(12.5 * (2 * lvl - 1) * (2 * lvl - 1) - 12.5);
    }

    function esc(str) {
        if (typeof escapeHtml === 'function') return escapeHtml(str);
        const d = document.createElement('div');
        d.textContent = str;
        return d.innerHTML;
    }

    function capitalize(s) {
        return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
    }

    // Elapsed time formatter for integrity shame timer
    function _formatElapsed(isoDate) {
        if (!isoDate) return '???';
        // Handle Firestore Timestamp objects
        const d = isoDate.toDate ? isoDate.toDate() : new Date(isoDate);
        const ms = Date.now() - d.getTime();
        const mins = Math.floor(ms / 60000);
        const hrs = Math.floor(mins / 60);
        const days = Math.floor(hrs / 24);
        if (days > 0) return days + 'd ' + (hrs % 24) + 'h';
        if (hrs > 0) return hrs + 'h ' + (mins % 60) + 'm';
        return mins + 'm';
    }

    function formatDate(ts) {
        if (!ts) return 'Unknown';
        const d = ts.toDate ? ts.toDate() : new Date(ts);
        return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }

    function formatNumber(n) {
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 10000) return (n / 1000).toFixed(1) + 'K';
        return (n || 0).toLocaleString();
    }

    function buildAvatar(profile) {
        if (profile.photoURL) {
            return `<img src="${esc(profile.photoURL)}" alt="avatar" class="upm-avatar-img">`;
        }
        if (typeof generateAvatar === 'function') {
            return generateAvatar(profile.callsign || profile.displayName || 'User', 96);
        }
        const initials = (profile.callsign || profile.displayName || '?')
            .split(/[_\s]/).map(w => w[0]).join('').toUpperCase().slice(0, 2);
        return `<span class="upm-avatar-initials">${esc(initials)}</span>`;
    }

    function ensureOverlay() {
        if (overlay) return overlay;

        // Use the static modal already in dashboard.html if it exists
        overlay = document.getElementById('userProfileModal');

        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'userProfileModal';
            overlay.className = 'modal-overlay';
            overlay.setAttribute('role', 'dialog');
            overlay.setAttribute('aria-modal', 'true');
            overlay.setAttribute('aria-label', 'User profile');
            document.body.appendChild(overlay);
        }

        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) close();
        });

        document.addEventListener('keydown', function(e) {
            if (!overlay.classList.contains('active')) return;
            if (e.key === 'Escape') { close(); return; }
            // Focus trap: Tab cycles within modal
            if (e.key === 'Tab') {
                const focusable = overlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
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

        return overlay;
    }

    let _triggerEl = null;

    function close() {
        if (!overlay) return;
        overlay.classList.remove('active');
        overlay.innerHTML = '';
        // Return focus to the element that opened the modal
        if (_triggerEl && typeof _triggerEl.focus === 'function') {
            _triggerEl.focus();
            _triggerEl = null;
        }
    }

    async function viewUserProfile(uid) {
        if (!uid) return;

        // Remember trigger element for focus restoration
        _triggerEl = document.activeElement;

        const el = ensureOverlay();
        el.innerHTML = renderLoading();

        // Fix for body.style.filter breaking position:fixed —
        // position overlay at current scroll so it covers the viewport
        el.style.position = 'absolute';
        el.style.top = window.scrollY + 'px';
        el.style.left = '0';
        el.style.width = '100%';
        el.style.height = window.innerHeight + 'px';

        el.classList.add('active');

        try {
            const profile = await FirestoreManager.getUserProfile(uid);
            if (!profile) {
                el.innerHTML = renderError('Agent dossier not found');
                return;
            }
            el.innerHTML = renderProfile(profile);
            // Focus the close button for keyboard users
            const closeBtn = el.querySelector('.upm-close');
            if (closeBtn) closeBtn.focus();
        } catch (err) {
            console.error('[UserProfileModal] Error:', err);
            el.innerHTML = renderError('Dossier retrieval failed');
        }
    }

    function renderLoading() {
        return `
            <div class="modal-content upm-modal-content">
                <button class="upm-close" onclick="viewUserProfile.close()" aria-label="Close profile">&times;</button>
                <div class="upm-loading">
                    <div class="upm-spinner"></div>
                    <p>Retrieving agent dossier<span class="upm-dots"></span></p>
                </div>
            </div>
        `;
    }

    function renderError(msg) {
        return `
            <div class="modal-content upm-modal-content">
                <button class="upm-close" onclick="viewUserProfile.close()" aria-label="Close profile">&times;</button>
                <div class="upm-loading">
                    <img src="/assets/images/icons/icon-siren.webp" alt="" style="width:40px;height:40px;margin-bottom:12px">
                    <p style="color:#f87171">${esc(msg)}</p>
                </div>
            </div>
        `;
    }

    function renderProfile(p) {
        const house = p.house || 'divergent';
        const colors = houseColors[house] || houseColors.divergent;
        const hInfo = houseData[house] || houseData.divergent;
        const tier = tierBadges[p.tier] || tierBadges.free;

        // For current user, use fresh XPCalculator result instead of stale Firestore XP
        const currentUser = typeof FirebaseAuth !== 'undefined' && FirebaseAuth.getUser();
        const isSelfProfile = currentUser && currentUser.uid === p.uid;
        let rawXP, level;
        if (isSelfProfile && typeof XPCalculator !== 'undefined') {
            const freshCalc = XPCalculator.recalculate();
            rawXP = freshCalc.xp;
            level = freshCalc.level;
        } else {
            rawXP = p.totalXP || p.xp || 0;
            level = p.level || computeLevel(rawXP);
        }
        const currentLevelXP = xpForLevel(level);
        const nextLevelXP = xpForLevel(level + 1);
        const xpRange = nextLevelXP - currentLevelXP;
        const xpProgress = Math.min(rawXP - currentLevelXP, xpRange);
        const xpPct = xpRange > 0 ? Math.round((xpProgress / xpRange) * 100) : 0;

        const modules = Array.isArray(p.modulesCompleted) ? p.modulesCompleted.length : 0;
        const achievements = Array.isArray(p.achievements) ? p.achievements.length : 0;
        const labs = Array.isArray(p.labsCompleted) ? p.labsCompleted.length : 0;
        const quizzes = p.quizzes ? Object.keys(p.quizzes).length : 0;
        const streak = p.streak || 0;
        const boxesPwned = p.ctfBoxesPwned || 0;
        const flagsCaptured = p.ctfFlagsCaptured || 0;
        const gamesPlayed = p.gamesPlayed || 0;
        const callsign = esc(p.callsign || p.displayName || 'Anonymous');

        const isSelf = isSelfProfile;

        const mascotSrc = `/assets/images/mascots/${house}-hero.webp`;
        const emblemSrc = `/assets/images/emblems/${house}.webp`;

        return `
            <div class="modal-content upm-modal-content" style="--hc: ${colors.primary}; --hg: ${colors.glow}; --hbg: ${colors.bg}">
                <button class="upm-close" onclick="viewUserProfile.close()" aria-label="Close profile">&times;</button>

                <!-- Banner -->
                <div class="upm-banner">
                    <img src="${mascotSrc}" alt="" class="upm-banner-mascot" onerror="this.style.display='none'">
                    <div class="upm-banner-gradient"></div>
                    <div class="upm-banner-scanlines"></div>
                </div>

                <!-- Avatar + Identity -->
                <div class="upm-identity">
                    <div class="upm-avatar-ring">
                        ${buildAvatar(p)}
                    </div>
                    <div class="upm-id-text">
                        <div class="upm-callsign">
                            @${callsign}${isSelf ? '<span class="upm-you">YOU</span>' : ''}
                        </div>
                        <div class="upm-house-row">
                            <img src="${emblemSrc}" alt="" class="upm-house-emblem" onerror="this.style.display='none'">
                            <span class="upm-house-name">${esc(hInfo.name)}</span>
                        </div>
                        <div class="upm-house-domain">${esc(hInfo.domain)}</div>
                    </div>
                </div>

                <!-- Tier Badge -->
                <div class="upm-tier-badge" style="background:${tier.bg};border-color:${tier.color}">
                    <img src="${tier.icon}" alt="" class="upm-tier-icon">
                    <span class="upm-tier-label" style="color:${tier.color}">${esc(tier.label)}</span>
                </div>

                <!-- Level + XP Bar (or integrity shame) -->
                ${p.integrity && p.integrity.status === 'violated' ? (() => {
                    const gc = p.integrity.peakGarbage || p.integrity.garbageCount || 0;
                    const elapsed = _formatElapsed(p.integrity.detectedAt);
                    let shameText;
                    if (gc >= 50) shameText = 'I tried to cheat for ' + elapsed;
                    else if (gc >= 20) shameText = 'Nice try, Script Kiddie';
                    else shameText = 'INTEGRITY CHECK FAILED';
                    return `<div class="upm-level-section">
                        <div class="upm-level-header">
                            <span class="upm-level-badge" style="background:#ef4444;color:#fff;padding:2px 8px;border-radius:4px;font-size:0.7rem">FLAGGED</span>
                            <span class="upm-xp-text" style="color:#ef4444;font-style:italic">${esc(shameText)}</span>
                        </div>
                        <div class="upm-xp-track">
                            <div class="upm-xp-fill" style="width:100%;background:linear-gradient(90deg,#ef4444,#dc2626)"></div>
                        </div>
                        <div class="upm-xp-labels">
                            <span style="color:#ef4444">${gc} garbage entries</span>
                            <span style="color:#ef4444">Admin review required</span>
                        </div>
                    </div>`;
                })() : `<div class="upm-level-section">
                    <div class="upm-level-header">
                        <span class="upm-level-badge">LVL ${level}</span>
                        <span class="upm-xp-text">${formatNumber(rawXP)} XP</span>
                    </div>
                    <div class="upm-xp-track">
                        <div class="upm-xp-fill" style="width:${xpPct}%">
                            <div class="upm-xp-shine"></div>
                        </div>
                    </div>
                    <div class="upm-xp-labels">
                        <span>${formatNumber(currentLevelXP)}</span>
                        <span>${formatNumber(nextLevelXP)}</span>
                    </div>
                </div>`}

                <!-- Stats Grid -->
                <div class="upm-stats">
                    <div class="upm-stat">
                        <img src="/assets/images/icons/icon-books.webp" alt="" class="upm-stat-icon-img">
                        <span class="upm-stat-val">${modules}</span>
                        <span class="upm-stat-label">Modules</span>
                    </div>
                    <div class="upm-stat">
                        <img src="/assets/images/icons/icon-trophy.webp" alt="" class="upm-stat-icon-img">
                        <span class="upm-stat-val">${achievements}</span>
                        <span class="upm-stat-label">Achievements</span>
                    </div>
                    <div class="upm-stat">
                        <img src="/assets/images/icons/icon-flask.webp" alt="" class="upm-stat-icon-img">
                        <span class="upm-stat-val">${labs}</span>
                        <span class="upm-stat-label">Labs</span>
                    </div>
                    <div class="upm-stat">
                        <img src="/assets/images/icons/icon-clipboard.webp" alt="" class="upm-stat-icon-img">
                        <span class="upm-stat-val">${quizzes}</span>
                        <span class="upm-stat-label">Quizzes</span>
                    </div>
                    <div class="upm-stat upm-stat-streak ${streak >= 3 ? 'upm-streak-hot' : ''}">
                        <img src="/assets/images/icons/${streak >= 3 ? 'icon-explosion' : 'icon-lightning'}.webp" alt="" class="upm-stat-icon-img">
                        <span class="upm-stat-val">${streak}</span>
                        <span class="upm-stat-label">Streak</span>
                    </div>
                </div>

                <!-- CTF + Games Stats -->
                <div class="upm-stats upm-stats-ctf">
                    <div class="upm-stat">
                        <img src="/assets/images/icons/icon-skull.webp" alt="" class="upm-stat-icon-img">
                        <span class="upm-stat-val">${boxesPwned}</span>
                        <span class="upm-stat-label">Boxes Pwned</span>
                    </div>
                    <div class="upm-stat">
                        <img src="/assets/images/icons/icon-footprint.webp" alt="" class="upm-stat-icon-img">
                        <span class="upm-stat-val">${flagsCaptured}</span>
                        <span class="upm-stat-label">Flags</span>
                    </div>
                    <div class="upm-stat">
                        <img src="/assets/images/icons/icon-joystick.webp" alt="" class="upm-stat-icon-img">
                        <span class="upm-stat-val">${gamesPlayed}</span>
                        <span class="upm-stat-label">Games</span>
                    </div>
                </div>

                <!-- Message Button (other users only) -->
                ${!isSelf ? `<div class="upm-action-row">
                    <button class="upm-msg-btn" onclick="window.location.href='/components/messaging/inbox.html#new=${esc(p.uid)}'">
                        <img src="/assets/images/icons/icon-email.webp" alt="" class="upm-msg-icon">
                        Send Message
                    </button>
                </div>` : ''}

                <!-- Footer -->
                <div class="upm-footer">
                    <span class="upm-footer-dot"></span>
                    Agent active since ${formatDate(p.createdAt)}
                </div>
            </div>
        `;
    }

    // ─── Styles ──────────────────────────────────────────────
    function injectStyles() {
        if (document.getElementById('user-profile-modal-styles')) return;

        const s = document.createElement('style');
        s.id = 'user-profile-modal-styles';
        s.textContent = `
            /* Card — overrides on .modal-content */
            .upm-modal-content {
                background: linear-gradient(160deg, #111827 0%, #0f172a 50%, #111827 100%) !important;
                border: 1px solid var(--hc, #333) !important;
                border-radius: 20px !important;
                max-width: 440px !important;
                padding: 0 !important;
                box-shadow: 0 0 40px var(--hg, rgba(0,0,0,0.5)), 0 0 80px rgba(0,0,0,0.3);
                overflow: hidden !important;
            }


            /* Close */
            .upm-close {
                position: absolute;
                top: 10px;
                left: 12px;
                background: rgba(0,0,0,0.5);
                border: 1px solid rgba(255,255,255,0.15);
                color: #999;
                font-size: 1.4rem;
                cursor: pointer;
                padding: 4px 10px;
                line-height: 1;
                border-radius: 8px;
                transition: all 0.2s;
                z-index: 10;
                backdrop-filter: blur(4px);
            }
            .upm-close:hover { color: #fff; border-color: rgba(255,255,255,0.3); }
            .upm-close:focus-visible { outline: 2px solid #06b6d4; outline-offset: 2px; }
            .upm-msg-btn:focus-visible { outline: 2px solid #06b6d4; outline-offset: 2px; }

            /* Banner */
            .upm-banner {
                position: relative;
                height: 140px;
                overflow: hidden;
                background: linear-gradient(135deg, rgba(0,0,0,0.9), var(--hbg, rgba(30,30,50,0.5)));
            }
            .upm-banner-mascot {
                position: absolute;
                right: -10px;
                bottom: -20px;
                height: 180px;
                object-fit: contain;
                opacity: 0.35;
                filter: saturate(1.3);
                pointer-events: none;
            }
            .upm-banner-gradient {
                position: absolute;
                inset: 0;
                background: linear-gradient(180deg, transparent 30%, #111827 100%);
            }
            .upm-banner-scanlines {
                position: absolute;
                inset: 0;
                background: repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    rgba(0,0,0,0.08) 2px,
                    rgba(0,0,0,0.08) 4px
                );
                pointer-events: none;
            }

            /* Identity */
            .upm-identity {
                display: flex;
                align-items: center;
                gap: 16px;
                padding: 0 24px;
                margin-top: -36px;
                position: relative;
                z-index: 2;
            }
            .upm-avatar-ring {
                width: 80px;
                height: 80px;
                min-width: 80px;
                border-radius: 50%;
                border: 3px solid var(--hc, #444);
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #1a1a2e;
                box-shadow: 0 0 20px var(--hg, rgba(0,0,0,0.3));
            }
            .upm-avatar-img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            .upm-avatar-initials {
                font-size: 1.6rem;
                font-weight: 700;
                color: var(--hc, #888);
            }
            .upm-id-text {
                flex: 1;
                min-width: 0;
                padding-top: 38px;
            }
            .upm-callsign {
                font-size: 1.15rem;
                font-weight: 700;
                color: #f0f0f0;
                font-family: 'JetBrains Mono', 'Fira Code', monospace;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .upm-you {
                font-size: 0.5rem;
                padding: 2px 6px;
                background: #39ff14;
                color: #000;
                border-radius: 4px;
                font-weight: 800;
                vertical-align: middle;
                margin-left: 8px;
                letter-spacing: 0.05em;
            }
            .upm-house-row {
                display: flex;
                align-items: center;
                gap: 6px;
                margin-top: 4px;
            }
            .upm-house-emblem {
                width: 18px;
                height: 18px;
                object-fit: contain;
            }
            .upm-house-name {
                font-size: 0.8rem;
                font-weight: 600;
                color: var(--hc, #aaa);
            }
            .upm-house-domain {
                font-size: 0.68rem;
                color: #808080;
                margin-top: 2px;
                letter-spacing: 0.04em;
            }

            /* Tier */
            .upm-tier-badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                margin: 16px 24px 0;
                padding: 5px 14px;
                border-radius: 20px;
                border: 1px solid;
                font-size: 0.72rem;
            }
            .upm-tier-icon { width: 16px; height: 16px; object-fit: contain; }
            .upm-tier-label { font-weight: 600; letter-spacing: 0.04em; }

            /* Level + XP */
            .upm-level-section {
                margin: 18px 24px 0;
            }
            .upm-level-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 8px;
            }
            .upm-level-badge {
                font-size: 0.85rem;
                font-weight: 800;
                color: var(--hc, #aaa);
                font-family: 'JetBrains Mono', 'Fira Code', monospace;
                letter-spacing: 0.06em;
            }
            .upm-xp-text {
                font-size: 0.75rem;
                color: #888;
                font-family: 'JetBrains Mono', 'Fira Code', monospace;
            }
            .upm-xp-track {
                height: 8px;
                background: rgba(255,255,255,0.06);
                border-radius: 10px;
                overflow: hidden;
                position: relative;
            }
            .upm-xp-fill {
                height: 100%;
                background: linear-gradient(90deg, var(--hc, #39ff14), color-mix(in srgb, var(--hc, #39ff14) 70%, white));
                border-radius: 10px;
                position: relative;
                transition: width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
                min-width: 4px;
            }
            .upm-xp-shine {
                position: absolute;
                inset: 0;
                background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
                animation: upmShine 2s ease-in-out infinite;
            }
            @keyframes upmShine {
                0%, 100% { transform: translateX(-100%); }
                50% { transform: translateX(100%); }
            }
            .upm-xp-labels {
                display: flex;
                justify-content: space-between;
                margin-top: 4px;
                font-size: 0.6rem;
                color: #444;
                font-family: 'JetBrains Mono', 'Fira Code', monospace;
            }

            /* Stats */
            .upm-stats {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 8px;
                margin: 20px 24px 0;
            }
            .upm-stats-ctf {
                grid-template-columns: repeat(3, 1fr);
                margin-top: 8px;
            }
            .upm-stat {
                text-align: center;
                padding: 14px 4px 10px;
                background: rgba(255,255,255,0.02);
                border-radius: 12px;
                border: 1px solid rgba(255,255,255,0.05);
                transition: all 0.2s;
            }
            .upm-stat:hover {
                background: var(--hbg, rgba(255,255,255,0.04));
                border-color: rgba(255,255,255,0.1);
                transform: translateY(-1px);
            }
            .upm-stat-icon-img {
                width: 28px;
                height: 28px;
                object-fit: contain;
                margin-bottom: 6px;
                display: block;
                margin-left: auto;
                margin-right: auto;
                opacity: 0.85;
            }
            .upm-stat-val {
                display: block;
                font-size: 1.05rem;
                font-weight: 800;
                color: #fff;
                font-family: 'JetBrains Mono', 'Fira Code', monospace;
            }
            .upm-stat-label {
                display: block;
                font-size: 0.55rem;
                color: #808080;
                text-transform: uppercase;
                letter-spacing: 0.08em;
                margin-top: 4px;
            }

            /* Streak animation */
            .upm-stat-streak.upm-streak-hot {
                background: rgba(255,100,0,0.08);
                border-color: rgba(255,100,0,0.2);
            }
            .upm-stat-streak.upm-streak-hot .upm-stat-icon-img {
                animation: upmFlame 0.6s ease-in-out infinite alternate;
            }
            @keyframes upmFlame {
                from { transform: scale(1); }
                to { transform: scale(1.15); }
            }

            /* Message Button */
            .upm-action-row {
                margin: 20px 24px 0;
            }
            .upm-msg-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                width: 100%;
                padding: 10px 16px;
                background: rgba(6,182,212,0.1);
                border: 1px solid rgba(6,182,212,0.3);
                border-radius: 10px;
                color: #06b6d4;
                font-size: 0.82rem;
                font-weight: 600;
                font-family: 'JetBrains Mono', 'Fira Code', monospace;
                letter-spacing: 0.04em;
                cursor: pointer;
                transition: all 0.2s;
            }
            .upm-msg-btn:hover {
                background: rgba(6,182,212,0.2);
                border-color: #06b6d4;
                transform: translateY(-1px);
            }
            .upm-msg-icon {
                width: 18px;
                height: 18px;
                object-fit: contain;
            }

            /* Footer */
            .upm-footer {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                margin: 20px 24px 0;
                padding: 16px 0;
                border-top: 1px solid rgba(255,255,255,0.06);
                font-size: 0.68rem;
                color: #444;
                letter-spacing: 0.05em;
            }
            .upm-footer-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: #39ff14;
                animation: upmPulse 2s ease-in-out infinite;
            }
            @keyframes upmPulse {
                0%, 100% { opacity: 1; box-shadow: 0 0 4px #39ff14; }
                50% { opacity: 0.4; box-shadow: none; }
            }

            /* Loading dots */
            .upm-dots::after {
                content: '';
                animation: upmDots 1.5s steps(4, end) infinite;
            }
            @keyframes upmDots {
                0% { content: ''; }
                25% { content: '.'; }
                50% { content: '..'; }
                75% { content: '...'; }
            }

            /* Loading */
            .upm-loading {
                text-align: center;
                padding: 60px 20px;
                color: #8a8a8a;
            }
            .upm-spinner {
                width: 36px;
                height: 36px;
                border: 3px solid rgba(255,255,255,0.08);
                border-top-color: var(--hc, #39ff14);
                border-radius: 50%;
                animation: upmSpin 0.8s linear infinite;
                margin: 0 auto 18px;
            }
            @keyframes upmSpin {
                to { transform: rotate(360deg); }
            }

            /* Mobile */
            @media (max-width: 500px) {
                .upm-banner { height: 110px; }
                .upm-identity { padding: 0 16px; gap: 12px; margin-top: -30px; }
                .upm-avatar-ring { width: 64px; height: 64px; min-width: 64px; }
                .upm-id-text { padding-top: 32px; }
                .upm-callsign { font-size: 1rem; }
                .upm-tier-badge,
                .upm-level-section,
                .upm-stats,
                .upm-action-row,
                .upm-footer { margin-left: 16px; margin-right: 16px; }
                .upm-stats {
                    grid-template-columns: repeat(3, 1fr);
                }
                .upm-stat { padding: 10px 2px 8px; }
                .upm-stat-val { font-size: 0.9rem; }
                .upm-stat-icon-img { width: 22px; height: 22px; }
            }

            /* Reduced motion */
            @media (prefers-reduced-motion: reduce) {
                .upm-xp-shine { animation: none; }
                .upm-spinner { animation: none; }
                .upm-footer-dot { animation: none; }
                .upm-stat-streak.upm-streak-hot .upm-stat-icon-img { animation: none; }
                .upm-dots::after { animation: none; }
                .upm-xp-fill { transition: none; }
                .upm-stat { transition: none; }
                .upm-stat:hover { transform: none; }
                .upm-close { transition: none; }
                .upm-msg-btn { transition: none; }
                .upm-msg-btn:hover { transform: none; }
            }

            /* High contrast */
            @media (prefers-contrast: more) {
                .upm-modal-content { border-width: 2px !important; }
                .upm-stat { border-color: rgba(255,255,255,0.2); }
                .upm-house-domain { color: #aaa; }
                .upm-footer { color: #888; border-top-color: rgba(255,255,255,0.15); }
                .upm-xp-labels span { color: #888; }
            }
        `;
        document.head.appendChild(s);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectStyles);
    } else {
        injectStyles();
    }

    // Expose global
    window.viewUserProfile = viewUserProfile;
    window.viewUserProfile.close = close;

})();
