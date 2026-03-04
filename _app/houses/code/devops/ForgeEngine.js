/**
 * ForgeEngine.js — Hexworth Prime DevOps Content Hub ("The Forge")
 *
 * Shared rendering engine. Provides two public methods:
 *   ForgeEngine.renderHub()          — renders the full hub page
 *   ForgeEngine.renderSection(id)    — renders a single section page
 *
 * Reads/writes progress via localStorage key: hexworth_forge_progress
 * Depends on: ForgeData.js (must be loaded before this file)
 */

const ForgeEngine = (() => {

    // -------------------------------------------------------------------------
    // Internal state
    // -------------------------------------------------------------------------
    let _progress = {};
    let _basePath = '../../../'; // relative path from hub page to _app/

    // -------------------------------------------------------------------------
    // Progress helpers
    // -------------------------------------------------------------------------

    function _loadProgress() {
        try {
            _progress = JSON.parse(localStorage.getItem('hexworth_forge_progress') || '{}');
        } catch (e) {
            _progress = {};
        }
    }

    function _saveProgress() {
        localStorage.setItem('hexworth_forge_progress', JSON.stringify(_progress));
    }

    function _isComplete(moduleId) {
        return !!_progress[moduleId];
    }

    function _toggleComplete(moduleId) {
        if (_progress[moduleId]) {
            delete _progress[moduleId];
        } else {
            _progress[moduleId] = Date.now();
        }
        _saveProgress();
    }

    // -------------------------------------------------------------------------
    // Style injection
    // -------------------------------------------------------------------------

    function _injectStyles(extraCss) {
        const style = document.createElement('style');
        style.textContent = _getBaseCSS() + (extraCss || '');
        document.head.appendChild(style);
    }

    // -------------------------------------------------------------------------
    // Shared builders
    // -------------------------------------------------------------------------

    function _buildHeader(title, subtitle, backLabel, backHref) {
        const header = document.createElement('div');
        header.className = 'fe-header';
        header.innerHTML = `
            <div class="fe-header-left">
                <img class="fe-header-icon" src="${_basePath}assets/images/icons/icon-gear.webp" alt="Forge" width="32" height="32">
                <div>
                    <div class="fe-header-title">${title}</div>
                    <div class="fe-header-sub">${subtitle}</div>
                </div>
            </div>
            <div class="fe-header-right">
                ${backHref ? `<a href="${backHref}" class="fe-btn">&larr; ${backLabel}</a>` : ''}
            </div>`;
        return header;
    }

    function _buildParticles(container) {
        const COUNT = 30;
        for (let i = 0; i < COUNT; i++) {
            const p = document.createElement('span');
            p.className = 'fe-particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDuration = (6 + Math.random() * 10) + 's';
            p.style.animationDelay = -(Math.random() * 16) + 's';
            p.style.opacity = String(0.15 + Math.random() * 0.35);
            p.style.fontSize = (3 + Math.random() * 5) + 'px';
            container.appendChild(p);
        }
    }

    /** Resolve an icon path from ForgeData (relative to hub) to current page depth. */
    function _icon(path) {
        // ForgeData paths are relative from hub (devops/). For section pages, prepend ../../
        return _basePath === '../../../' ? path : path.replace('../../../', _basePath);
    }

    function _typeIcon(type) {
        const base = _basePath + 'assets/images/icons/';
        const map = {
            'module': base + 'icon-books.webp',
            'lab': base + 'icon-flask.webp',
            'quiz': base + 'icon-clipboard.webp',
            'presentation': base + 'icon-document.webp',
            'game': base + 'icon-joystick.webp',
            'review': base + 'icon-refresh.webp',
            'applet': base + 'icon-terminal.webp'
        };
        return map[type] || map['module'];
    }

    function _typeLabel(type) {
        const map = {
            'module': 'MODULE',
            'lab': 'LAB',
            'quiz': 'QUIZ',
            'presentation': 'LESSON',
            'game': 'GAME',
            'review': 'REVIEW',
            'applet': 'APPLET'
        };
        return map[type] || 'MODULE';
    }

    // =========================================================================
    // HUB RENDERER
    // =========================================================================

    function renderHub() {
        _loadProgress();
        document.title = 'The Forge \u2014 DevOps Hub \u2014 Hexworth Prime';
        _injectStyles(_getHubCSS());

        const body = document.body;
        body.innerHTML = '';

        // Particle layer
        const particles = document.createElement('div');
        particles.className = 'fe-particles';
        _buildParticles(particles);
        body.appendChild(particles);

        // Ambient glow
        const glow = document.createElement('div');
        glow.className = 'fe-glow';
        body.appendChild(glow);

        // Header
        body.appendChild(_buildHeader('The Forge', 'DevOps Content Hub', 'Dashboard', '../../../dashboard.html'));

        // Main wrapper
        const main = document.createElement('main');
        main.className = 'fe-main';

        // Hero
        main.appendChild(_buildHero());

        // Overall progress
        main.appendChild(_buildOverallProgress());

        // Track tabs + section grid
        main.appendChild(_buildTrackSection());

        // Footer
        const footer = document.createElement('div');
        footer.className = 'fe-footer';
        footer.innerHTML = 'The Forge &mdash; Hexworth Prime DevOps Hub';
        main.appendChild(footer);

        body.appendChild(main);

        // Default to first track
        _activateTrack('core');
    }

    function _buildHero() {
        const total = ForgeData.getTotalModules();
        const hero = document.createElement('div');
        hero.className = 'fe-hero';
        hero.innerHTML = `
            <h1 class="fe-title">The Forge</h1>
            <div class="fe-subtitle">DevOps Engineering &mdash; From First Commit to Production</div>
            <div class="fe-hero-stats">
                <div class="fe-stat">
                    <span class="fe-stat-num">${total}</span>
                    <span class="fe-stat-label">Modules</span>
                </div>
                <div class="fe-stat">
                    <span class="fe-stat-num">${ForgeData.sections.length}</span>
                    <span class="fe-stat-label">Sections</span>
                </div>
                <div class="fe-stat">
                    <span class="fe-stat-num">${ForgeData.tracks.length}</span>
                    <span class="fe-stat-label">Tracks</span>
                </div>
            </div>`;
        return hero;
    }

    function _buildOverallProgress() {
        const total = ForgeData.getTotalModules();
        const completed = ForgeData.getCompletedCount(_progress);
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

        const wrap = document.createElement('div');
        wrap.className = 'fe-overall-progress';
        wrap.innerHTML = `
            <div class="fe-progress-header">
                <span class="fe-progress-label">Overall Progress</span>
                <span class="fe-progress-count">${completed} / ${total} modules &mdash; ${pct}%</span>
            </div>
            <div class="fe-progress-track">
                <div class="fe-progress-fill" style="width:${pct}%"></div>
            </div>`;
        return wrap;
    }

    function _buildTrackSection() {
        const section = document.createElement('div');
        section.className = 'fe-track-section';

        // Tab bar
        const tabBar = document.createElement('div');
        tabBar.className = 'fe-track-tabs';

        ForgeData.tracks.forEach(track => {
            const stats = ForgeData.getTrackStats(track.id, _progress);
            const tab = document.createElement('button');
            tab.className = 'fe-track-tab';
            tab.id = `tab-${track.id}`;
            tab.setAttribute('data-track', track.id);
            tab.innerHTML = `
                <img class="fe-tab-icon" src="${_icon(track.icon)}" alt="" width="20" height="20">
                <span class="fe-tab-name">${track.name}</span>
                <span class="fe-tab-pct">${stats.pct}%</span>`;
            tab.addEventListener('click', () => _activateTrack(track.id));
            tabBar.appendChild(tab);
        });

        section.appendChild(tabBar);

        // Panel container
        const panels = document.createElement('div');
        panels.className = 'fe-track-panels';
        panels.id = 'track-panels';

        ForgeData.tracks.forEach(track => {
            panels.appendChild(_buildTrackPanel(track));
        });

        section.appendChild(panels);
        return section;
    }

    function _buildTrackPanel(track) {
        const panel = document.createElement('div');
        panel.className = 'fe-track-panel';
        panel.id = `panel-${track.id}`;
        panel.setAttribute('hidden', '');

        // Track header
        const header = document.createElement('div');
        header.className = 'fe-panel-header';
        header.innerHTML = `
            <div class="fe-panel-title">${track.name}</div>
            <div class="fe-panel-desc">${track.description}</div>`;
        panel.appendChild(header);

        // Section cards
        const grid = document.createElement('div');
        grid.className = 'fe-section-grid';

        const sections = ForgeData.getTrackSections(track.id);
        sections.forEach(sec => {
            grid.appendChild(_buildSectionCard(sec));
        });

        panel.appendChild(grid);
        return panel;
    }

    function _buildSectionCard(sec) {
        const stats = ForgeData.getSectionStats(sec.id, _progress);
        const readyCount = sec.modules.filter(m => m.status === 'ready').length;

        const card = document.createElement('a');
        card.className = 'fe-section-card';
        card.href = `sections/${sec.id}/index.html`;
        card.style.setProperty('--section-color', sec.color);

        card.innerHTML = `
            <div class="fe-card-top">
                <img class="fe-card-icon" src="${_icon(sec.icon)}" alt="" width="36" height="36">
                <div class="fe-card-badge">${stats.total} modules</div>
            </div>
            <div class="fe-card-name">${sec.name}</div>
            <div class="fe-card-desc">${sec.description}</div>
            <div class="fe-card-progress">
                <div class="fe-card-track">
                    <div class="fe-card-fill" style="width:${stats.pct}%"></div>
                </div>
                <span class="fe-card-pct">${stats.pct}%</span>
            </div>
            ${readyCount === 0 ? '<div class="fe-card-soon">COMING SOON</div>' : ''}`;

        return card;
    }

    function _activateTrack(trackId) {
        // Update tabs
        document.querySelectorAll('.fe-track-tab').forEach(t => {
            t.classList.toggle('fe-track-tab--active', t.getAttribute('data-track') === trackId);
        });
        // Update panels
        ForgeData.tracks.forEach(track => {
            const panel = document.getElementById(`panel-${track.id}`);
            if (panel) {
                if (track.id === trackId) panel.removeAttribute('hidden');
                else panel.setAttribute('hidden', '');
            }
        });
    }

    // =========================================================================
    // SECTION RENDERER
    // =========================================================================

    function renderSection(sectionId) {
        _basePath = '../../../../../'; // from sections/{id}/ to _app/
        _loadProgress();
        const section = ForgeData.getSection(sectionId);
        if (!section) {
            document.body.innerHTML = '<p style="color:#e74c3c;padding:2rem">Section not found: ' + sectionId + '</p>';
            return;
        }

        document.title = section.name + ' \u2014 The Forge \u2014 Hexworth Prime';
        _injectStyles(_getSectionCSS(section.color));

        const body = document.body;
        body.innerHTML = '';

        // Particles
        const particles = document.createElement('div');
        particles.className = 'fe-particles';
        _buildParticles(particles);
        body.appendChild(particles);

        // Header
        body.appendChild(_buildHeader(section.name, 'The Forge', 'The Forge', '../../index.html'));

        // Main
        const main = document.createElement('main');
        main.className = 'fe-main';

        // Section hero
        main.appendChild(_buildSectionHero(section));

        // Module list
        main.appendChild(_buildModuleList(section));

        // Footer
        const footer = document.createElement('div');
        footer.className = 'fe-footer';
        footer.innerHTML = `${section.name} &mdash; The Forge &mdash; Hexworth Prime`;
        main.appendChild(footer);

        body.appendChild(main);
    }

    function _buildSectionHero(section) {
        const stats = ForgeData.getSectionStats(section.id, _progress);
        const hero = document.createElement('div');
        hero.className = 'fe-section-hero';
        hero.innerHTML = `
            <img class="fe-section-icon" src="${_icon(section.icon)}" alt="" width="48" height="48">
            <h1 class="fe-section-title">${section.name}</h1>
            <div class="fe-section-desc">${section.description}</div>
            <div class="fe-section-stats">
                <span>${stats.completed} / ${stats.total} complete</span>
                <span>&mdash;</span>
                <span>${stats.pct}%</span>
            </div>
            <div class="fe-progress-track" style="max-width:400px;margin:0 auto">
                <div class="fe-progress-fill" style="width:${stats.pct}%"></div>
            </div>`;
        return hero;
    }

    function _buildModuleList(section) {
        const list = document.createElement('div');
        list.className = 'fe-module-list';

        section.modules.forEach((mod, i) => {
            const done = _isComplete(mod.id);
            const item = document.createElement('div');
            item.className = 'fe-module-item' + (done ? ' fe-module-item--done' : '') + (mod.status === 'coming-soon' ? ' fe-module-item--soon' : '');

            const num = String(i + 1).padStart(2, '0');

            item.innerHTML = `
                <div class="fe-module-check" data-id="${mod.id}">
                    <div class="fe-check-box${done ? ' fe-check-box--checked' : ''}">${done ? '&#10003;' : ''}</div>
                </div>
                <div class="fe-module-num">${num}</div>
                <img class="fe-module-type-icon" src="${_typeIcon(mod.type)}" alt="" width="18" height="18">
                <div class="fe-module-info">
                    <div class="fe-module-title">${mod.title}</div>
                    <div class="fe-module-meta">
                        <span class="fe-module-type-tag">${_typeLabel(mod.type)}</span>
                        ${mod.status === 'coming-soon' ? '<span class="fe-module-soon-tag">COMING SOON</span>' : ''}
                    </div>
                </div>`;

            // Checkbox toggle
            if (mod.status === 'ready') {
                const checkBox = item.querySelector('.fe-module-check');
                checkBox.style.cursor = 'pointer';
                checkBox.addEventListener('click', (e) => {
                    e.stopPropagation();
                    _toggleComplete(mod.id);
                    const box = checkBox.querySelector('.fe-check-box');
                    const nowDone = _isComplete(mod.id);
                    box.classList.toggle('fe-check-box--checked', nowDone);
                    box.innerHTML = nowDone ? '&#10003;' : '';
                    item.classList.toggle('fe-module-item--done', nowDone);
                    _updateSectionProgress(section);
                });
            }

            // Click to navigate (if ready and has href)
            if (mod.href && mod.status === 'ready') {
                item.style.cursor = 'pointer';
                item.addEventListener('click', () => {
                    window.location.href = mod.href;
                });
            }

            list.appendChild(item);
        });

        return list;
    }

    function _updateSectionProgress(section) {
        const stats = ForgeData.getSectionStats(section.id, _progress);
        const statsEl = document.querySelector('.fe-section-stats');
        if (statsEl) {
            statsEl.innerHTML = `
                <span>${stats.completed} / ${stats.total} complete</span>
                <span>&mdash;</span>
                <span>${stats.pct}%</span>`;
        }
        const fill = document.querySelector('.fe-progress-fill');
        if (fill) fill.style.width = stats.pct + '%';
    }

    // =========================================================================
    // CSS — Base (shared between hub and section pages)
    // =========================================================================

    function _getBaseCSS() {
        return `
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
    font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
    background: #0a0a0f;
    color: #e0e0e0;
    min-height: 100vh;
    overflow-x: hidden;
}
a { color: inherit; text-decoration: none; }

/* Header */
.fe-header {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 24px;
    background: rgba(10, 10, 15, 0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(16, 185, 129, 0.2);
}
.fe-header-left { display: flex; align-items: center; gap: 12px; }
.fe-header-icon { border-radius: 6px; }
.fe-header-title { font-size: 16px; font-weight: 700; color: #10b981; }
.fe-header-sub { font-size: 12px; color: #8b949e; }
.fe-btn {
    padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 600;
    background: rgba(16, 185, 129, 0.1); color: #10b981;
    border: 1px solid rgba(16, 185, 129, 0.25);
    transition: all 0.2s;
}
.fe-btn:hover { background: rgba(16, 185, 129, 0.2); }

/* Main */
.fe-main { max-width: 1000px; margin: 0 auto; padding: 24px 20px 60px; position: relative; z-index: 1; }

/* Particles */
.fe-particles { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.fe-particle {
    position: absolute; bottom: -10px; color: #10b981; border-radius: 50%;
    animation: feFloat linear infinite;
}
@keyframes feFloat {
    0% { transform: translateY(0) rotate(0deg); opacity: 0; }
    10% { opacity: var(--o, 0.3); }
    90% { opacity: var(--o, 0.3); }
    100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
}

/* Glow */
.fe-glow {
    position: fixed; top: -200px; left: 50%; width: 600px; height: 400px;
    transform: translateX(-50%);
    background: radial-gradient(ellipse, rgba(16, 185, 129, 0.08) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
}

/* Progress bar (shared) */
.fe-overall-progress { margin-bottom: 32px; }
.fe-progress-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.fe-progress-label { font-size: 14px; font-weight: 600; color: #10b981; }
.fe-progress-count { font-size: 13px; color: #8b949e; }
.fe-progress-track {
    height: 8px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden;
}
.fe-progress-fill {
    height: 100%; background: linear-gradient(90deg, #10b981, #34d399);
    border-radius: 4px; transition: width 0.4s ease;
}

/* Footer */
.fe-footer {
    text-align: center; padding: 32px 0 16px; font-size: 12px; color: #555;
    border-top: 1px solid rgba(255,255,255,0.05); margin-top: 48px;
}
`;
    }

    // =========================================================================
    // CSS — Hub-specific
    // =========================================================================

    function _getHubCSS() {
        return `
/* Hero */
.fe-hero { text-align: center; padding: 48px 0 32px; }
.fe-title {
    font-size: 42px; font-weight: 800; color: #fff;
    background: linear-gradient(135deg, #10b981, #34d399, #6ee7b7);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
}
.fe-subtitle { font-size: 16px; color: #8b949e; margin-top: 8px; }
.fe-hero-stats { display: flex; justify-content: center; gap: 48px; margin-top: 24px; }
.fe-stat { text-align: center; }
.fe-stat-num { display: block; font-size: 28px; font-weight: 800; color: #10b981; }
.fe-stat-label { font-size: 12px; color: #8b949e; text-transform: uppercase; letter-spacing: 1px; }

/* Track tabs */
.fe-track-section { margin-top: 8px; }
.fe-track-tabs { display: flex; gap: 4px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0; }
.fe-track-tab {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 18px; border: none; background: none; color: #8b949e;
    font-size: 13px; font-weight: 600; cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s;
}
.fe-track-tab:hover { color: #e0e0e0; }
.fe-track-tab--active {
    color: #10b981; border-bottom-color: #10b981;
}
.fe-tab-icon { border-radius: 4px; }
.fe-tab-pct { font-size: 11px; opacity: 0.6; }

/* Track panels */
.fe-panel-header { padding: 24px 0 16px; }
.fe-panel-title { font-size: 20px; font-weight: 700; color: #fff; }
.fe-panel-desc { font-size: 14px; color: #8b949e; margin-top: 4px; }

/* Section grid */
.fe-section-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-top: 8px; }
.fe-section-card {
    display: block; padding: 20px; border-radius: 12px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    transition: all 0.25s;
}
.fe-section-card:hover {
    background: rgba(255,255,255,0.05);
    border-color: var(--section-color, #10b981);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}
.fe-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.fe-card-icon { border-radius: 8px; }
.fe-card-badge {
    font-size: 11px; padding: 3px 8px; border-radius: 4px;
    background: rgba(255,255,255,0.06); color: #8b949e;
}
.fe-card-name { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 6px; }
.fe-card-desc { font-size: 13px; color: #8b949e; line-height: 1.5; margin-bottom: 14px; min-height: 40px; }
.fe-card-progress { display: flex; align-items: center; gap: 10px; }
.fe-card-track { flex: 1; height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; }
.fe-card-fill { height: 100%; background: var(--section-color, #10b981); border-radius: 2px; transition: width 0.3s; }
.fe-card-pct { font-size: 12px; color: #8b949e; min-width: 30px; text-align: right; }
.fe-card-soon {
    margin-top: 10px; font-size: 10px; letter-spacing: 1.5px; color: #f59e0b;
    font-weight: 700; text-transform: uppercase;
}

/* Responsive */
@media (max-width: 700px) {
    .fe-hero-stats { gap: 24px; }
    .fe-title { font-size: 32px; }
    .fe-track-tabs { overflow-x: auto; }
    .fe-section-grid { grid-template-columns: 1fr; }
}
`;
    }

    // =========================================================================
    // CSS — Section page
    // =========================================================================

    function _getSectionCSS(color) {
        return `
/* Section hero */
.fe-section-hero { text-align: center; padding: 40px 0 28px; }
.fe-section-icon { border-radius: 10px; margin-bottom: 12px; }
.fe-section-title { font-size: 32px; font-weight: 800; color: #fff; }
.fe-section-desc { font-size: 14px; color: #8b949e; margin-top: 6px; max-width: 600px; margin-left: auto; margin-right: auto; }
.fe-section-stats { display: flex; justify-content: center; gap: 12px; margin: 16px 0 10px; font-size: 14px; color: ${color}; }

/* Module list */
.fe-module-list { max-width: 700px; margin: 0 auto; }
.fe-module-item {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 16px; border-radius: 8px;
    border: 1px solid rgba(255,255,255,0.05);
    margin-bottom: 6px; transition: all 0.2s;
}
.fe-module-item:hover { background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.1); }
.fe-module-item--done { opacity: 0.6; }
.fe-module-item--done .fe-module-title { text-decoration: line-through; }
.fe-module-item--soon { opacity: 0.5; }

.fe-module-check { flex-shrink: 0; }
.fe-check-box {
    width: 22px; height: 22px; border-radius: 4px;
    border: 2px solid rgba(255,255,255,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; color: ${color}; transition: all 0.2s;
}
.fe-check-box--checked {
    background: ${color}; border-color: ${color}; color: #fff;
}

.fe-module-num { font-size: 12px; color: #555; font-weight: 700; min-width: 22px; }
.fe-module-type-icon { flex-shrink: 0; border-radius: 4px; }
.fe-module-info { flex: 1; min-width: 0; }
.fe-module-title { font-size: 14px; font-weight: 600; color: #e0e0e0; }
.fe-module-meta { display: flex; gap: 8px; margin-top: 3px; }
.fe-module-type-tag {
    font-size: 10px; padding: 1px 6px; border-radius: 3px;
    background: rgba(255,255,255,0.06); color: #8b949e;
    letter-spacing: 0.5px; font-weight: 600;
}
.fe-module-soon-tag {
    font-size: 10px; padding: 1px 6px; border-radius: 3px;
    background: rgba(245, 158, 11, 0.15); color: #f59e0b;
    letter-spacing: 0.5px; font-weight: 600;
}

/* Responsive */
@media (max-width: 600px) {
    .fe-section-title { font-size: 24px; }
    .fe-module-item { padding: 10px 12px; gap: 8px; }
    .fe-module-num { display: none; }
}
`;
    }

    // =========================================================================
    // Public API
    // =========================================================================

    return {
        renderHub,
        renderSection
    };

})();
