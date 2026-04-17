/**
 * WiresharkEngine.js — Hexworth Prime Wireshark Hub
 *
 * Config-driven hub renderer. Public methods:
 *   WiresharkEngine.renderHub()  — renders the full hub landing page
 *
 * Reads/writes progress via localStorage key: hexworth_wireshark_progress
 * Depends on: WiresharkData.js (must be loaded before this file)
 *
 * Section expand/collapse is driven by click events on section cards.
 * Active section is tracked in _activeSection (string id or null).
 */

const WiresharkEngine = (() => {

    let _progress = {};
    let _activeSection = null;

    // Theme constants derived from WiresharkData hub config
    const ACCENT      = '#06b6d4';
    const ACCENT_DIM  = 'rgba(6, 182, 212, 0.15)';
    const GREEN       = '#4ade80';
    const GREEN_DIM   = 'rgba(74, 222, 128, 0.12)';
    const INDIGO      = '#6366f1';
    const BG_DARK     = '#0a0a0f';
    const BG_CARD     = '#12121a';

    // ── Progress ──────────────────────────────────────────────────────────

    function _loadProgress() {
        try {
            _progress = JSON.parse(localStorage.getItem(WiresharkData.hub.progressKey) || '{}');
        } catch { _progress = {}; }
    }

    function _isComplete(id) { return !!_progress[id]; }

    function _trackCompletion() {
        let done = 0, total = 0;
        WiresharkData.sections.forEach(s => {
            s.modules.forEach(m => {
                total++;
                if (_isComplete(m.id)) done++;
            });
        });
        return { done, total, pct: total ? Math.round((done / total) * 100) : 0 };
    }

    function _sectionCompletion(section) {
        const done = section.modules.filter(m => _isComplete(m.id)).length;
        return { done, total: section.moduleCount, pct: Math.round((done / section.moduleCount) * 100) };
    }

    // ── Render Hub ────────────────────────────────────────────────────────

    function renderHub() {
        _loadProgress();
        const comp = _trackCompletion();

        _injectFonts();
        _injectStyles();

        const root = document.createElement('div');
        root.className = 'wh-root';

        _buildParticles(root);

        root.appendChild(_buildHeader());
        root.appendChild(_buildHero(comp));
        root.appendChild(_buildSectionGrid());
        root.appendChild(_buildCertSection());

        document.body.appendChild(root);
    }

    // ── Header ────────────────────────────────────────────────────────────

    function _buildHeader() {
        const header = document.createElement('div');
        header.className = 'wh-header';
        header.innerHTML = `
            <div class="wh-header-left">
                <img class="wh-header-icon" src="${WiresharkData.hub.icon}" alt="" width="28" height="28">
                <div>
                    <div class="wh-header-title">${WiresharkData.hub.name}</div>
                    <div class="wh-header-sub">${WiresharkData.hub.tagline}</div>
                </div>
            </div>
            <div class="wh-header-right">
                <a href="${(typeof TenantRouter !== 'undefined' && TenantRouter.isActive()) ? TenantRouter.getUrl('dashboard') : '/dashboard.html'}" class="wh-btn">&larr; ${(typeof TenantRouter !== 'undefined' && TenantRouter.isActive()) ? TenantRouter.getName() : 'Dashboard'}</a>
            </div>`;
        return header;
    }

    // ── Hero ──────────────────────────────────────────────────────────────

    function _buildHero(comp) {
        const hero = document.createElement('div');
        hero.className = 'wh-hero';
        hero.innerHTML = `
            <div class="wh-hero-badge">
                <img src="../../assets/images/icons/icon-network.webp" alt="" width="20" height="20">
                Eye House &mdash; Packet Analysis
            </div>
            <h2 class="wh-hero-title">${WiresharkData.hub.name}</h2>
            <p class="wh-hero-desc">${WiresharkData.hub.description}</p>
            <div class="wh-hero-stats">
                <div class="wh-stat">
                    <span class="wh-stat-num">${WiresharkData.stats.totalModules}</span>
                    <span class="wh-stat-label">Modules</span>
                </div>
                <div class="wh-stat">
                    <span class="wh-stat-num">${WiresharkData.stats.sections}</span>
                    <span class="wh-stat-label">Sections</span>
                </div>
                <div class="wh-stat">
                    <span class="wh-stat-num">${WiresharkData.stats.estimatedHours}h</span>
                    <span class="wh-stat-label">Est. Hours</span>
                </div>
                <div class="wh-stat">
                    <span class="wh-stat-num">${comp.pct}%</span>
                    <span class="wh-stat-label">Complete</span>
                </div>
            </div>
            <div class="wh-progress-bar">
                <div class="wh-progress-fill" style="width:${comp.pct}%"></div>
            </div>
            <div class="wh-progress-text">${comp.done} / ${comp.total} modules completed</div>`;
        return hero;
    }

    // ── Section Grid ──────────────────────────────────────────────────────

    function _buildSectionGrid() {
        const wrapper = document.createElement('div');
        wrapper.className = 'wh-section-wrapper';

        const heading = document.createElement('h3');
        heading.className = 'wh-section-heading';
        heading.textContent = 'Sections';
        wrapper.appendChild(heading);

        const subtext = document.createElement('p');
        subtext.className = 'wh-section-subtext';
        subtext.textContent = 'Select a section to view its modules.';
        wrapper.appendChild(subtext);

        const grid = document.createElement('div');
        grid.className = 'wh-grid';
        grid.id = 'wh-section-grid';

        WiresharkData.sections.forEach(section => {
            grid.appendChild(_buildSectionCard(section));
        });

        wrapper.appendChild(grid);

        // Module list panel — populated when a card is clicked
        const panel = document.createElement('div');
        panel.className = 'wh-module-panel';
        panel.id = 'wh-module-panel';
        panel.style.display = 'none';
        wrapper.appendChild(panel);

        return wrapper;
    }

    function _buildSectionCard(section) {
        const sc = _sectionCompletion(section);

        const card = document.createElement('div');
        card.className = 'wh-section-card';
        card.id = `wh-card-${section.id}`;
        card.setAttribute('role', 'button');
        card.setAttribute('tabindex', '0');
        card.setAttribute('aria-expanded', 'false');
        card.style.setProperty('--sec-color', section.color);
        card.style.setProperty('--sec-dim', section.colorDim);

        // Favorites
        const hasFav = typeof FavoritesManager !== 'undefined';
        const isFav = hasFav && FavoritesManager.isFavorite(section.id);
        const favHtml = hasFav ? `<button class="wh-fav-btn${isFav ? ' favorited' : ''}" data-sec-id="${section.id}">${isFav ? '\u2665' : '\u2661'}</button>` : '';

        card.innerHTML = `
            ${favHtml}
            <div class="wh-card-header">
                <img src="${section.icon}" alt="" class="wh-card-icon" width="22" height="22">
                <div class="wh-card-info">
                    <div class="wh-card-name">${section.name}</div>
                    <div class="wh-card-meta">${section.moduleCount} modules</div>
                </div>
                <div class="wh-card-pct" style="color:${section.color}">${sc.pct}%</div>
            </div>
            <p class="wh-card-desc">${section.description}</p>
            <div class="wh-card-progress">
                <div class="wh-card-progress-fill" style="width:${sc.pct}%;background:${section.color}"></div>
            </div>
            <div class="wh-card-footer">
                <div class="wh-type-pills">
                    ${_buildTypePills(section)}
                </div>
                <span class="wh-card-expand-hint">View modules</span>
            </div>`;

        // Wire up favorite button
        const favBtn = card.querySelector('.wh-fav-btn');
        if (favBtn) {
            favBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const meta = {
                    title: section.name,
                    house: 'wireshark',
                    type: 'wireshark-section',
                    href: 'wireshark/index.html'
                };
                const nowFav = FavoritesManager.toggle(section.id, meta);
                favBtn.classList.toggle('favorited', nowFav);
                favBtn.textContent = nowFav ? '\u2665' : '\u2661';
            });
        }

        card.addEventListener('click', () => _toggleSection(section));
        card.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); _toggleSection(section); }
        });

        return card;
    }

    /** Renders a compact row of type badges (lab/module/tool) for a section */
    function _buildTypePills(section) {
        const counts = { lab: 0, module: 0, tool: 0 };
        section.modules.forEach(m => { if (counts[m.type] !== undefined) counts[m.type]++; });
        return Object.entries(counts)
            .filter(([, n]) => n > 0)
            .map(([type, n]) => `<span class="wh-type-pill wh-type-${type}">${n} ${type}${n > 1 ? 's' : ''}</span>`)
            .join('');
    }

    // ── Section Toggle ────────────────────────────────────────────────────

    function _toggleSection(section) {
        const panel = document.getElementById('wh-module-panel');
        const prevId = _activeSection;

        // Deactivate all cards
        WiresharkData.sections.forEach(s => {
            const c = document.getElementById(`wh-card-${s.id}`);
            if (c) { c.classList.remove('active'); c.setAttribute('aria-expanded', 'false'); }
        });

        // Clicking the already-open section closes it
        if (prevId === section.id) {
            _activeSection = null;
            panel.style.display = 'none';
            panel.innerHTML = '';
            return;
        }

        _activeSection = section.id;
        const card = document.getElementById(`wh-card-${section.id}`);
        if (card) { card.classList.add('active'); card.setAttribute('aria-expanded', 'true'); }

        _renderModulePanel(section, panel);
        panel.style.display = 'block';

        // Scroll panel into view smoothly
        requestAnimationFrame(() => {
            panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
    }

    function _renderModulePanel(section, panel) {
        const sc = _sectionCompletion(section);

        panel.style.setProperty('--panel-color', section.color);
        panel.style.setProperty('--panel-dim', section.colorDim);
        panel.innerHTML = `
            <div class="wh-panel-header">
                <img src="${section.icon}" alt="" width="20" height="20">
                <div class="wh-panel-title" style="color:${section.color}">${section.name}</div>
                <div class="wh-panel-progress-text">${sc.done}/${sc.total} done</div>
                <button class="wh-panel-close" id="wh-panel-close" aria-label="Close section">&times;</button>
            </div>
            <div class="wh-module-list">
                ${section.modules.map(m => _buildModuleRow(m, section.color)).join('')}
            </div>`;

        document.getElementById('wh-panel-close').addEventListener('click', (e) => {
            e.stopPropagation();
            _toggleSection(section); // closes because _activeSection matches
        });
    }

    function _buildModuleRow(m, color) {
        const done = _isComplete(m.id);
        const diffClass = `wh-diff-${m.difficulty}`;
        const checkHtml = done
            ? `<img src="../../assets/images/icons/icon-checkbox.webp" alt="done" class="wh-mod-check-img" width="14" height="14">`
            : `<span class="wh-mod-bullet"></span>`;

        return `
            <a href="${m.href}" class="wh-mod-row ${done ? 'completed' : ''}">
                <span class="wh-mod-check">${checkHtml}</span>
                <span class="wh-mod-id">${m.id.toUpperCase()}</span>
                <span class="wh-mod-title">${m.title}</span>
                <span class="wh-mod-subtitle">${m.subtitle}</span>
                <span class="wh-mod-badges">
                    <span class="wh-type-pill wh-type-${m.type}">${m.type}</span>
                    <span class="wh-diff-badge ${diffClass}">${m.difficulty}</span>
                    <span class="wh-mod-duration">${m.duration}</span>
                </span>
            </a>`;
    }

    // ── Cert Section ──────────────────────────────────────────────────────

    function _buildCertSection() {
        const section = document.createElement('div');
        section.className = 'wh-cert-wrapper';
        section.innerHTML = `
            <h3 class="wh-section-heading">Certification Alignment</h3>
            <p class="wh-section-subtext">Wireshark Hub modules map directly to these certification objectives.</p>
            <div class="wh-cert-grid">
                ${WiresharkData.stats.certAlignments.map(cert => `
                    <div class="wh-cert-badge">${cert}</div>
                `).join('')}
            </div>`;
        return section;
    }

    // ── Particles ─────────────────────────────────────────────────────────

    function _buildParticles(container) {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        for (let i = 0; i < 18; i++) {
            const p = document.createElement('span');
            p.className = 'wh-particle';
            // Alternate between cyan and green accent particles
            p.style.color = i % 3 === 0 ? GREEN : ACCENT;
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDuration = (7 + Math.random() * 10) + 's';
            p.style.animationDelay = -(Math.random() * 17) + 's';
            p.style.opacity = String(0.08 + Math.random() * 0.2);
            p.style.fontSize = (3 + Math.random() * 4) + 'px';
            container.appendChild(p);
        }
    }

    // ── Fonts ─────────────────────────────────────────────────────────────

    function _injectFonts() {
        if (document.getElementById('wh-fonts')) return;
        const link = document.createElement('link');
        link.id = 'wh-fonts';
        link.rel = 'stylesheet';
        link.href = 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap';
        document.head.appendChild(link);
    }

    // ── Styles ────────────────────────────────────────────────────────────

    function _injectStyles() {
        if (document.getElementById('wh-styles')) return;
        const style = document.createElement('style');
        style.id = 'wh-styles';
        style.textContent = `
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { background: ${BG_DARK}; font-family: 'Inter', system-ui, sans-serif; color: #e0e0e0; }

            .wh-root { min-height: 100vh; position: relative; overflow-x: hidden; }

            /* ── Header ── */
            .wh-header {
                display: flex; justify-content: space-between; align-items: center;
                padding: 12px 25px; background: ${BG_CARD};
                border-bottom: 1px solid rgba(6, 182, 212, 0.15);
                position: sticky; top: 0; z-index: 100;
            }
            .wh-header-left { display: flex; align-items: center; gap: 12px; }
            .wh-header-icon { border-radius: 6px; }
            .wh-header-title { font-size: 1rem; font-weight: 700; color: ${ACCENT}; }
            .wh-header-sub { font-size: 0.7rem; color: #8b949e; }
            .wh-header-right { display: flex; gap: 8px; }
            .wh-btn {
                color: #8b949e; text-decoration: none; padding: 6px 14px;
                border: 1px solid rgba(255,255,255,0.1); border-radius: 6px;
                font-size: 0.8rem; transition: all 0.2s;
            }
            .wh-btn:hover { background: ${ACCENT}; color: #fff; border-color: ${ACCENT}; }

            /* ── Hero ── */
            .wh-hero {
                max-width: 820px; margin: 40px auto 20px; padding: 0 25px; text-align: center;
            }
            .wh-hero-badge {
                display: inline-flex; align-items: center; gap: 7px;
                font-size: 0.72rem; font-weight: 600; text-transform: uppercase; letter-spacing: 0.07em;
                color: ${ACCENT}; background: ${ACCENT_DIM}; border: 1px solid rgba(6,182,212,0.25);
                border-radius: 20px; padding: 5px 14px; margin-bottom: 16px;
                font-family: 'JetBrains Mono', monospace;
            }
            .wh-hero-title {
                font-size: 2.1rem; font-weight: 700; color: #f1f5f9; margin-bottom: 12px;
                /* Subtle cyan/indigo gradient on the title */
                background: linear-gradient(135deg, ${ACCENT} 0%, ${INDIGO} 100%);
                -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                background-clip: text;
            }
            .wh-hero-desc { color: #8b949e; font-size: 0.95rem; line-height: 1.65; max-width: 620px; margin: 0 auto 26px; }
            .wh-hero-stats { display: flex; justify-content: center; gap: 32px; margin-bottom: 22px; flex-wrap: wrap; }
            .wh-stat { display: flex; flex-direction: column; align-items: center; }
            .wh-stat-num {
                font-size: 1.6rem; font-weight: 700; color: ${ACCENT};
                font-family: 'JetBrains Mono', monospace;
            }
            .wh-stat-label { font-size: 0.7rem; color: #8b949e; text-transform: uppercase; letter-spacing: 0.05em; }
            .wh-progress-bar {
                width: 100%; max-width: 420px; height: 6px;
                background: rgba(255,255,255,0.06); border-radius: 3px;
                margin: 0 auto 8px; overflow: hidden;
            }
            .wh-progress-fill {
                height: 100%;
                background: linear-gradient(90deg, ${ACCENT}, ${INDIGO});
                border-radius: 3px; transition: width 0.5s ease;
            }
            .wh-progress-text { font-size: 0.75rem; color: #8b949e; }

            /* ── Section wrapper ── */
            .wh-section-wrapper { max-width: 1060px; margin: 32px auto 0; padding: 0 25px 80px; }
            .wh-section-heading {
                font-size: 1.15rem; color: ${ACCENT}; margin-bottom: 8px;
                padding-left: 12px; border-left: 3px solid ${ACCENT};
            }
            .wh-section-subtext { color: #8b949e; font-size: 0.83rem; margin-bottom: 20px; }

            /* ── Section Grid ── */
            .wh-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(460px, 1fr));
                gap: 18px;
            }

            /* ── Section Card ── */
            .wh-section-card {
                position: relative;
                background: ${BG_CARD}; border: 1px solid rgba(255,255,255,0.07);
                border-radius: 10px; padding: 18px 20px; cursor: pointer;
                transition: border-color 0.2s, box-shadow 0.2s;
                outline: none;
            }
            /* Favorite heart button */
            .wh-fav-btn {
                position: absolute; top: 10px; right: 10px;
                background: none; border: none; font-size: 1.2rem;
                cursor: pointer; opacity: 0.3; transition: all 0.2s;
                padding: 2px 4px; line-height: 1; z-index: 2; color: #e0e0e0;
            }
            .wh-fav-btn:hover { opacity: 0.8; transform: scale(1.2); }
            .wh-fav-btn.favorited { opacity: 1; color: #ef4444; }
            .wh-section-card:hover,
            .wh-section-card:focus-visible {
                border-color: var(--sec-color, ${ACCENT});
                box-shadow: 0 0 0 1px var(--sec-color, ${ACCENT}) inset;
            }
            .wh-section-card.active {
                border-color: var(--sec-color, ${ACCENT});
                background: color-mix(in srgb, var(--sec-dim) 40%, ${BG_CARD} 60%);
            }
            .wh-card-header { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
            .wh-card-icon { border-radius: 4px; flex-shrink: 0; }
            .wh-card-info { flex: 1; }
            .wh-card-name { font-size: 0.95rem; font-weight: 600; color: var(--sec-color, ${ACCENT}); }
            .wh-card-meta { font-size: 0.7rem; color: #8b949e; margin-top: 1px; }
            .wh-card-pct { font-size: 1.05rem; font-weight: 700; font-family: 'JetBrains Mono', monospace; }
            .wh-card-desc { font-size: 0.8rem; color: #8b949e; line-height: 1.55; margin-bottom: 12px; }
            .wh-card-progress {
                height: 3px; background: rgba(255,255,255,0.05);
                border-radius: 2px; overflow: hidden; margin-bottom: 12px;
            }
            .wh-card-progress-fill { height: 100%; border-radius: 2px; transition: width 0.5s ease; }
            .wh-card-footer { display: flex; align-items: center; justify-content: space-between; }
            .wh-type-pills { display: flex; gap: 5px; flex-wrap: wrap; }
            .wh-card-expand-hint { font-size: 0.7rem; color: #8b949e; }
            .wh-section-card.active .wh-card-expand-hint { color: var(--sec-color, ${ACCENT}); }

            /* ── Type / Difficulty pills ── */
            .wh-type-pill {
                font-size: 0.62rem; font-weight: 600; text-transform: uppercase;
                padding: 2px 7px; border-radius: 3px; letter-spacing: 0.04em;
                font-family: 'JetBrains Mono', monospace;
            }
            .wh-type-module { background: rgba(6,182,212,0.1); color: ${ACCENT}; border: 1px solid rgba(6,182,212,0.25); }
            .wh-type-lab { background: ${GREEN_DIM}; color: ${GREEN}; border: 1px solid rgba(74,222,128,0.3); }
            .wh-type-tool { background: rgba(251,191,36,0.1); color: #fbbf24; border: 1px solid rgba(251,191,36,0.3); }
            .wh-diff-badge {
                font-size: 0.62rem; font-weight: 600; text-transform: uppercase;
                padding: 2px 7px; border-radius: 3px; letter-spacing: 0.04em;
                font-family: 'JetBrains Mono', monospace;
            }
            .wh-diff-beginner { background: rgba(74,222,128,0.08); color: #4ade80; border: 1px solid rgba(74,222,128,0.2); }
            .wh-diff-intermediate { background: rgba(251,191,36,0.08); color: #fbbf24; border: 1px solid rgba(251,191,36,0.2); }
            .wh-diff-advanced { background: rgba(248,113,113,0.08); color: #f87171; border: 1px solid rgba(248,113,113,0.2); }

            /* ── Module Panel ── */
            .wh-module-panel {
                margin-top: 18px; background: ${BG_CARD};
                border: 1px solid var(--panel-color, ${ACCENT});
                border-radius: 10px; overflow: hidden;
                animation: whPanelIn 0.18s ease;
            }
            @keyframes whPanelIn {
                from { opacity: 0; transform: translateY(-8px); }
                to   { opacity: 1; transform: translateY(0); }
            }
            .wh-panel-header {
                display: flex; align-items: center; gap: 10px;
                padding: 14px 18px; background: rgba(255,255,255,0.02);
                border-bottom: 1px solid rgba(255,255,255,0.06);
            }
            .wh-panel-title { flex: 1; font-size: 0.95rem; font-weight: 600; }
            .wh-panel-progress-text { font-size: 0.72rem; color: #8b949e; font-family: 'JetBrains Mono', monospace; }
            .wh-panel-close {
                background: none; border: none; color: #8b949e; font-size: 1.3rem;
                cursor: pointer; line-height: 1; padding: 0 4px; transition: color 0.15s;
            }
            .wh-panel-close:hover { color: #e0e0e0; }

            .wh-module-list { padding: 8px 0; }
            .wh-mod-row {
                display: grid;
                grid-template-columns: 22px 52px 1fr 1.6fr auto;
                align-items: center; gap: 10px;
                padding: 9px 18px; text-decoration: none; color: #c0c0c0;
                font-size: 0.8rem; transition: background 0.15s;
                border-bottom: 1px solid rgba(255,255,255,0.03);
            }
            .wh-mod-row:last-child { border-bottom: none; }
            .wh-mod-row:hover { background: rgba(255,255,255,0.03); }
            .wh-mod-row.completed { color: #6b7280; }
            .wh-mod-row.completed .wh-mod-title { text-decoration: line-through; opacity: 0.55; }
            .wh-mod-check { display: flex; align-items: center; justify-content: center; }
            .wh-mod-check-img { display: block; }
            .wh-mod-bullet {
                width: 6px; height: 6px; border-radius: 50%;
                border: 1.5px solid rgba(255,255,255,0.22);
                display: block;
            }
            .wh-mod-id {
                font-size: 0.65rem; font-family: 'JetBrains Mono', monospace;
                color: #8b949e; letter-spacing: 0.03em;
            }
            .wh-mod-title { font-weight: 500; }
            .wh-mod-subtitle { font-size: 0.74rem; color: #8b949e; }
            .wh-mod-badges { display: flex; align-items: center; gap: 5px; justify-content: flex-end; flex-wrap: wrap; }
            .wh-mod-duration { font-size: 0.65rem; color: #8b949e; font-family: 'JetBrains Mono', monospace; white-space: nowrap; }

            /* ── Cert wrapper ── */
            .wh-cert-wrapper { max-width: 1060px; margin: 0 auto; padding: 0 25px 80px; }
            .wh-cert-grid { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 4px; }
            .wh-cert-badge {
                padding: 8px 16px; background: ${ACCENT_DIM};
                border: 1px solid rgba(6,182,212,0.25); border-radius: 6px;
                font-size: 0.8rem; color: ${ACCENT}; font-weight: 500;
            }

            /* ── Particles ── */
            .wh-particle {
                position: fixed; pointer-events: none;
                animation: whFloat linear infinite;
            }
            .wh-particle::after { content: '.'; }
            @keyframes whFloat {
                0%   { transform: translateY(100vh); opacity: 0; }
                10%  { opacity: var(--wh-particle-op, 0.15); }
                90%  { opacity: var(--wh-particle-op, 0.15); }
                100% { transform: translateY(-10vh); opacity: 0; }
            }

            /* ── Accessibility ── */
            @media (prefers-reduced-motion: reduce) {
                .wh-particle { display: none; }
                .wh-section-card, .wh-btn, .wh-mod-row { transition: none; }
                .wh-progress-fill, .wh-card-progress-fill { transition: none; }
                .wh-module-panel { animation: none; }
            }
            @media (prefers-contrast: more) {
                .wh-section-card { border-color: rgba(255,255,255,0.3); }
                .wh-mod-row.completed { color: #9ca3af; }
            }

            /* ── Mobile ── */
            @media (max-width: 640px) {
                .wh-grid { grid-template-columns: 1fr; }
                .wh-hero-title { font-size: 1.5rem; }
                .wh-hero-stats { gap: 18px; }
                .wh-section-wrapper, .wh-cert-wrapper { padding: 0 16px 60px; }
                .wh-header { padding: 10px 16px; }
                .wh-mod-row {
                    grid-template-columns: 22px 1fr;
                    grid-template-rows: auto auto auto;
                }
                .wh-mod-id { display: none; }
                .wh-mod-subtitle { grid-column: 2; }
                .wh-mod-badges { grid-column: 2; justify-content: flex-start; }
            }
            @media (max-width: 900px) {
                .wh-grid { grid-template-columns: 1fr; }
            }
        `;
        document.head.appendChild(style);
    }

    // ── Public API ────────────────────────────────────────────────────────

    return { renderHub };

})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = WiresharkEngine;
}
