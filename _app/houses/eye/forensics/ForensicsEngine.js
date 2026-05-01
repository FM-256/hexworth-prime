/**
 * ForensicsEngine.js — Hexworth Prime Digital Forensics Hub
 *
 * Config-driven hub renderer. Public methods:
 *   ForensicsEngine.renderHub()  — renders the full hub landing page
 *
 * Reads/writes progress via localStorage key: hexworth_forensics_progress
 * Depends on: ForensicsData.js (must be loaded before this file)
 */

const ForensicsEngine = (() => {

    let _progress = {};
    const ACCENT = '#818cf8';
    const ACCENT_DIM = 'rgba(129, 140, 248, 0.15)';
    const BG_DARK = '#0a0a0f';
    const BG_CARD = '#12121a';

    // ── Progress ──────────────────────────────────────────────────────────

    function _loadProgress() {
        try {
            _progress = JSON.parse(localStorage.getItem(ForensicsData.hub.progressKey) || '{}');
        } catch { _progress = {}; }
    }

    function _isComplete(id) { return !!_progress[id]; }

    function _trackCompletion() {
        let done = 0, total = 0;
        ForensicsData.tracks.forEach(t => {
            t.modules.forEach(m => {
                total++;
                if (_isComplete(m.id)) done++;
            });
        });
        return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
    }

    // ── Render Hub ────────────────────────────────────────────────────────

    function renderHub() {
        _loadProgress();
        const comp = _trackCompletion();

        _injectFonts();
        _injectStyles();

        const root = document.createElement('div');
        root.className = 'fh-root';

        // Particles
        _buildParticles(root);

        // Header
        root.appendChild(_buildHeader());

        // Hero
        root.appendChild(_buildHero(comp));

        // Track grid
        root.appendChild(_buildTrackGrid());

        // Cross-linked content
        root.appendChild(_buildCrossLinks());

        // Cert alignment
        root.appendChild(_buildCertSection());

        document.body.appendChild(root);
    }

    // ── Header ────────────────────────────────────────────────────────────

    function _buildHeader() {
        const header = document.createElement('div');
        header.className = 'fh-header';
        header.innerHTML = `
            <div class="fh-header-left">
                <img class="fh-header-icon" src="${ForensicsData.hub.icon}" alt="" width="28" height="28">
                <div>
                    <div class="fh-header-title">${ForensicsData.hub.name}</div>
                    <div class="fh-header-sub">${ForensicsData.hub.tagline}</div>
                </div>
            </div>
            <div class="fh-header-right">
                <a href="${(typeof TenantRouter !== 'undefined' && TenantRouter.isActive()) ? TenantRouter.getUrl('dashboard') : '/dashboard.html'}" class="fh-btn">&larr; ${(typeof TenantRouter !== 'undefined' && TenantRouter.isActive()) ? TenantRouter.getName() : 'Dashboard'}</a>
            </div>`;
        return header;
    }

    // ── Hero ──────────────────────────────────────────────────────────────

    function _buildHero(comp) {
        const hero = document.createElement('div');
        hero.className = 'fh-hero';
        hero.innerHTML = `
            <h2 class="fh-hero-title">${ForensicsData.hub.name}</h2>
            <p class="fh-hero-desc">${ForensicsData.hub.description}</p>
            <div class="fh-hero-stats">
                <div class="fh-stat">
                    <span class="fh-stat-num">${ForensicsData.stats.totalModules}</span>
                    <span class="fh-stat-label">Modules</span>
                </div>
                <div class="fh-stat">
                    <span class="fh-stat-num">${ForensicsData.stats.tracks}</span>
                    <span class="fh-stat-label">Tracks</span>
                </div>
                <div class="fh-stat">
                    <span class="fh-stat-num">${comp.pct}%</span>
                    <span class="fh-stat-label">Complete</span>
                </div>
                <div class="fh-stat">
                    <span class="fh-stat-num">${ForensicsData.stats.certAlignments.length}</span>
                    <span class="fh-stat-label">Cert Alignments</span>
                </div>
            </div>
            <div class="fh-progress-bar">
                <div class="fh-progress-fill" style="width:${comp.pct}%"></div>
            </div>
            <div class="fh-progress-text">${comp.done} / ${comp.total} modules completed</div>`;
        return hero;
    }

    // ── Track Grid ────────────────────────────────────────────────────────

    function _buildTrackGrid() {
        const section = document.createElement('div');
        section.className = 'fh-section';

        const heading = document.createElement('h3');
        heading.className = 'fh-section-title';
        heading.textContent = 'Learning Tracks';
        section.appendChild(heading);

        const grid = document.createElement('div');
        grid.className = 'fh-track-grid';

        ForensicsData.tracks.forEach(track => {
            const trackDone = track.modules.filter(m => _isComplete(m.id)).length;
            const trackPct = Math.round((trackDone / track.moduleCount) * 100);

            const card = document.createElement('div');
            card.className = 'fh-track-card';
            card.style.setProperty('--track-color', track.color);
            card.style.setProperty('--track-dim', track.colorDim);

            // Favorites
            const hasFav = typeof FavoritesManager !== 'undefined';
            const isFav = hasFav && FavoritesManager.isFavorite(track.id);
            const favHtml = hasFav ? `<button class="fh-fav-btn${isFav ? ' favorited' : ''}" data-track-id="${track.id}">${isFav ? '\u2665' : '\u2661'}</button>` : '';

            card.innerHTML = `
                ${favHtml}
                <div class="fh-track-header">
                    <img src="${track.icon}" alt="" class="fh-track-icon" width="24" height="24">
                    <div class="fh-track-info">
                        <div class="fh-track-name">${track.name}</div>
                        <div class="fh-track-count">${track.moduleCount} modules</div>
                    </div>
                    <div class="fh-track-pct" style="color:${track.color}">${trackPct}%</div>
                </div>
                <p class="fh-track-desc">${track.description}</p>
                <div class="fh-track-progress">
                    <div class="fh-track-progress-fill" style="width:${trackPct}%;background:${track.color}"></div>
                </div>
                <div class="fh-track-modules">
                    ${track.modules.map(m => `
                        <a href="${m.href}" class="fh-module-link ${_isComplete(m.id) ? 'completed' : ''} ${m.isCapstone ? 'capstone' : ''}">
                            <span class="fh-module-check">${_isComplete(m.id) ? '<img src="../../assets/images/icons/icon-checkbox.webp" alt="done" width="14" height="14">' : '<span class="fh-module-bullet"></span>'}</span>
                            <span class="fh-module-title">${m.title}</span>
                            ${m.isCapstone ? '<span class="fh-capstone-badge">Capstone</span>' : ''}
                        </a>
                    `).join('')}
                </div>`;

            // Wire up favorite button
            const favBtn = card.querySelector('.fh-fav-btn');
            if (favBtn) {
                favBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const meta = {
                        title: track.name,
                        house: 'forensics',
                        type: 'forensics-track',
                        href: 'houses/eye/forensics/index.html'
                    };
                    const nowFav = FavoritesManager.toggle(track.id, meta);
                    favBtn.classList.toggle('favorited', nowFav);
                    favBtn.textContent = nowFav ? '\u2665' : '\u2661';
                });
            }

            grid.appendChild(card);
        });

        section.appendChild(grid);
        return section;
    }

    // ── Cross Links ───────────────────────────────────────────────────────

    function _buildCrossLinks() {
        const section = document.createElement('div');
        section.className = 'fh-section';

        section.innerHTML = `
            <h3 class="fh-section-title">Integrated from Across Hexworth</h3>
            <p class="fh-section-desc">These existing modules from other houses connect to forensics topics. Complete them to deepen your investigation skills.</p>
            <div class="fh-crosslink-grid">
                ${ForensicsData.existingModules.map(m => `
                    <a href="${m.path}" class="fh-crosslink-card">
                        <span class="fh-crosslink-source">${m.source}</span>
                        <span class="fh-crosslink-title">${m.title}</span>
                    </a>
                `).join('')}
            </div>`;

        return section;
    }

    // ── Cert Alignment ────────────────────────────────────────────────────

    function _buildCertSection() {
        const section = document.createElement('div');
        section.className = 'fh-section fh-cert-section';

        section.innerHTML = `
            <h3 class="fh-section-title">Certification Alignment</h3>
            <p class="fh-section-desc">Forensics Hub modules map directly to these certification objectives.</p>
            <div class="fh-cert-grid">
                ${ForensicsData.stats.certAlignments.map(cert => `
                    <div class="fh-cert-badge">${cert}</div>
                `).join('')}
            </div>`;

        return section;
    }

    // ── Particles ─────────────────────────────────────────────────────────

    function _buildParticles(container) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        for (let i = 0; i < 20; i++) {
            const p = document.createElement('span');
            p.className = 'fh-particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDuration = (6 + Math.random() * 10) + 's';
            p.style.animationDelay = -(Math.random() * 16) + 's';
            p.style.opacity = String(0.1 + Math.random() * 0.25);
            p.style.fontSize = (3 + Math.random() * 5) + 'px';
            container.appendChild(p);
        }
    }

    // ── Fonts ─────────────────────────────────────────────────────────────

    function _injectFonts() {
        if (document.getElementById('fh-fonts')) return;
        const link = document.createElement('link');
        link.id = 'fh-fonts';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap';
        document.head.appendChild(link);
    }

    // ── Styles ────────────────────────────────────────────────────────────

    function _injectStyles() {
        if (document.getElementById('fh-styles')) return;
        const style = document.createElement('style');
        style.id = 'fh-styles';
        style.textContent = `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: ${BG_DARK}; font-family: 'Inter', system-ui, sans-serif; color: #e0e0e0; }

            .fh-root { min-height: 100vh; position: relative; overflow: hidden; }

            /* Header */
            .fh-header {
                display: flex; justify-content: space-between; align-items: center;
                padding: 12px 25px; background: ${BG_CARD}; border-bottom: 1px solid rgba(255,255,255,0.1);
                position: sticky; top: 0; z-index: 100;
            }
            .fh-header-left { display: flex; align-items: center; gap: 12px; }
            .fh-header-icon { border-radius: 6px; }
            .fh-header-title { font-size: 1rem; font-weight: 700; color: ${ACCENT}; }
            .fh-header-sub { font-size: 0.7rem; color: #8b949e; }
            .fh-header-right { display: flex; gap: 8px; }
            .fh-btn {
                color: #8b949e; text-decoration: none; padding: 6px 14px;
                border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; font-size: 0.8rem; transition: all 0.2s;
            }
            .fh-btn:hover { background: ${ACCENT}; color: #fff; border-color: ${ACCENT}; }

            /* Hero */
            .fh-hero {
                max-width: 800px; margin: 40px auto 20px; padding: 0 25px; text-align: center;
            }
            .fh-hero-title { font-size: 2rem; font-weight: 700; color: ${ACCENT}; margin-bottom: 12px; }
            .fh-hero-desc { color: #8b949e; font-size: 0.95rem; line-height: 1.6; max-width: 600px; margin: 0 auto 25px; }
            .fh-hero-stats { display: flex; justify-content: center; gap: 30px; margin-bottom: 20px; flex-wrap: wrap; }
            .fh-stat { display: flex; flex-direction: column; align-items: center; }
            .fh-stat-num { font-size: 1.5rem; font-weight: 700; color: #e0e0e0; font-family: 'JetBrains Mono', monospace; }
            .fh-stat-label { font-size: 0.7rem; color: #8b949e; text-transform: uppercase; letter-spacing: 0.05em; }
            .fh-progress-bar {
                width: 100%; max-width: 400px; height: 6px; background: rgba(255,255,255,0.08);
                border-radius: 3px; margin: 0 auto 8px; overflow: hidden;
            }
            .fh-progress-fill { height: 100%; background: ${ACCENT}; border-radius: 3px; transition: width 0.5s ease; }
            .fh-progress-text { font-size: 0.75rem; color: #8b949e; }

            /* Section */
            .fh-section { max-width: 1000px; margin: 30px auto; padding: 0 25px; }
            .fh-section-title {
                font-size: 1.2rem; color: ${ACCENT}; margin-bottom: 12px; padding-left: 12px;
                border-left: 3px solid ${ACCENT};
            }
            .fh-section-desc { color: #8b949e; font-size: 0.85rem; margin-bottom: 18px; }

            /* Track Grid */
            .fh-track-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(440px, 1fr)); gap: 20px; }
            .fh-track-card {
                position: relative;
                background: ${BG_CARD}; border: 1px solid rgba(255,255,255,0.08);
                border-radius: 10px; padding: 20px; transition: border-color 0.2s;
            }
            .fh-track-card:hover { border-color: var(--track-color, ${ACCENT}); }
            /* Favorite heart button */
            .fh-fav-btn {
                position: absolute; top: 10px; right: 10px;
                background: none; border: none; font-size: 1.2rem;
                cursor: pointer; opacity: 0.3; transition: all 0.2s;
                padding: 2px 4px; line-height: 1; z-index: 2; color: #e0e0e0;
            }
            .fh-fav-btn:hover { opacity: 0.8; transform: scale(1.2); }
            .fh-fav-btn.favorited { opacity: 1; color: #ef4444; }
            .fh-track-header { display: flex; align-items: center; gap: 12px; margin-bottom: 10px; }
            .fh-track-icon { border-radius: 4px; }
            .fh-track-info { flex: 1; }
            .fh-track-name { font-size: 0.95rem; font-weight: 600; color: var(--track-color, ${ACCENT}); }
            .fh-track-count { font-size: 0.7rem; color: #8b949e; }
            .fh-track-pct { font-size: 1.1rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
            .fh-track-desc { font-size: 0.8rem; color: #8b949e; line-height: 1.5; margin-bottom: 12px; }
            .fh-track-progress {
                height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px;
                overflow: hidden; margin-bottom: 14px;
            }
            .fh-track-progress-fill { height: 100%; border-radius: 2px; transition: width 0.5s ease; }

            /* Module Links */
            .fh-track-modules { display: flex; flex-direction: column; gap: 4px; }
            .fh-module-link {
                display: flex; align-items: center; gap: 8px; padding: 6px 10px;
                text-decoration: none; color: #c0c0c0; font-size: 0.8rem; border-radius: 5px;
                transition: background 0.15s;
            }
            .fh-module-link:hover { background: rgba(255,255,255,0.04); }
            .fh-module-link.completed { color: #6b7280; }
            .fh-module-link.completed .fh-module-title { text-decoration: line-through; opacity: 0.6; }
            .fh-module-check { width: 16px; height: 16px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
            .fh-module-bullet {
                width: 6px; height: 6px; border-radius: 50%;
                border: 1.5px solid rgba(255,255,255,0.25);
            }
            .fh-module-title { flex: 1; }
            .fh-capstone-badge {
                font-size: 0.6rem; font-weight: 600; text-transform: uppercase;
                padding: 2px 6px; border-radius: 3px; letter-spacing: 0.05em;
                background: rgba(251, 146, 60, 0.15); color: #fb923c; border: 1px solid rgba(251, 146, 60, 0.3);
            }

            /* Cross Links */
            .fh-crosslink-grid {
                display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px;
            }
            .fh-crosslink-card {
                display: flex; flex-direction: column; gap: 4px; padding: 12px 16px;
                background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06);
                border-radius: 8px; text-decoration: none; transition: all 0.2s;
            }
            .fh-crosslink-card:hover { border-color: ${ACCENT}; background: rgba(129, 140, 248, 0.05); }
            .fh-crosslink-source {
                font-size: 0.65rem; color: #8b949e; text-transform: uppercase;
                letter-spacing: 0.05em; font-family: 'JetBrains Mono', monospace;
            }
            .fh-crosslink-title { font-size: 0.82rem; color: #c0c0c0; }

            /* Cert Badges */
            .fh-cert-grid { display: flex; flex-wrap: wrap; gap: 10px; }
            .fh-cert-badge {
                padding: 8px 16px; background: ${ACCENT_DIM}; border: 1px solid rgba(129, 140, 248, 0.25);
                border-radius: 6px; font-size: 0.8rem; color: ${ACCENT}; font-weight: 500;
            }
            .fh-cert-section { margin-bottom: 80px; }

            /* Particles */
            .fh-particle {
                position: absolute; color: ${ACCENT}; pointer-events: none;
                animation: fhFloat linear infinite;
            }
            .fh-particle::after { content: '.'; }
            @keyframes fhFloat {
                0% { transform: translateY(100vh); opacity: 0; }
                10% { opacity: var(--particle-opacity, 0.2); }
                90% { opacity: var(--particle-opacity, 0.2); }
                100% { transform: translateY(-10vh); opacity: 0; }
            }

            /* Reduced motion */
            @media (prefers-reduced-motion: reduce) {
                .fh-particle { display: none; }
                .fh-track-card, .fh-btn, .fh-crosslink-card, .fh-module-link { transition: none; }
                .fh-progress-fill, .fh-track-progress-fill { transition: none; }
            }

            /* High contrast */
            @media (prefers-contrast: more) {
                .fh-track-card { border-color: rgba(255,255,255,0.3); }
                .fh-btn { border-color: rgba(255,255,255,0.4); }
            }

            /* Mobile */
            @media (max-width: 600px) {
                .fh-track-grid { grid-template-columns: 1fr; }
                .fh-crosslink-grid { grid-template-columns: 1fr; }
                .fh-hero-title { font-size: 1.4rem; }
                .fh-hero-stats { gap: 16px; }
                .fh-section { padding: 0 16px; }
                .fh-header { padding: 10px 16px; }
            }

            @media (max-width: 480px) {
                .fh-track-grid { grid-template-columns: 1fr; }
            }
        `;
        document.head.appendChild(style);
    }

    // ── Public API ────────────────────────────────────────────────────────

    return { renderHub };

})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ForensicsEngine;
}
