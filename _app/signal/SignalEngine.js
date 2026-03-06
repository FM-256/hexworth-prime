/**
 * SignalEngine.js — Hexworth Prime Hardware Projects Hub ("The Signal")
 *
 * Shared rendering engine. Provides two public methods:
 *   SignalEngine.renderHub()          — renders the full hub page
 *   SignalEngine.renderSection(id)    — renders a single section page
 *
 * Hardware-specific features beyond Forge:
 *   - Platform filter bar (Arduino / ESP32 CYD / ESP32 DevKit / Pi)
 *   - Parts list expansion (collapsible per project)
 *   - Cost + build time badges on each project card
 *   - Prerequisite chain display
 *   - "Build Your Kit" platform cost summary
 *   - Difficulty badges with tier colors
 *
 * Reads/writes progress via localStorage key: hexworth_signal_progress
 * Depends on: SignalData.js (must be loaded before this file)
 */

const SignalEngine = (() => {

    // -------------------------------------------------------------------------
    // Internal state
    // -------------------------------------------------------------------------
    let _progress = {};
    let _basePath = '../../'; // relative path from hub page to _app/
    const PRIMARY = '#ff6b35';
    const PRIMARY_DIM = 'rgba(255, 107, 53, 0.15)';

    // -------------------------------------------------------------------------
    // Progress helpers
    // -------------------------------------------------------------------------

    function _loadProgress() {
        try {
            _progress = JSON.parse(localStorage.getItem('hexworth_signal_progress') || '{}');
        } catch (e) {
            _progress = {};
        }
    }

    function _saveProgress() {
        localStorage.setItem('hexworth_signal_progress', JSON.stringify(_progress));
    }

    function _isComplete(projectId) {
        return !!_progress[projectId];
    }

    function _toggleComplete(projectId) {
        if (_progress[projectId]) {
            delete _progress[projectId];
        } else {
            _progress[projectId] = Date.now();
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
        header.className = 'se-header';
        header.innerHTML = `
            <div class="se-header-left">
                <img class="se-header-icon" src="${_basePath}assets/images/icons/icon-antenna.webp" alt="Signal" width="32" height="32"
                     onerror="this.onerror=null;this.src='${_basePath}assets/images/icons/icon-signal.webp'">
                <div>
                    <div class="se-header-title">${title}</div>
                    <div class="se-header-sub">${subtitle}</div>
                </div>
            </div>
            <div class="se-header-right">
                ${backHref ? `<a href="${backHref}" class="se-btn">&larr; ${backLabel}</a>` : ''}
            </div>`;
        return header;
    }

    function _buildParticles(container) {
        const COUNT = 25;
        for (let i = 0; i < COUNT; i++) {
            const p = document.createElement('span');
            p.className = 'se-particle';
            p.style.left = Math.random() * 100 + '%';
            p.style.animationDuration = (6 + Math.random() * 10) + 's';
            p.style.animationDelay = -(Math.random() * 16) + 's';
            p.style.opacity = String(0.15 + Math.random() * 0.35);
            p.style.fontSize = (3 + Math.random() * 5) + 'px';
            container.appendChild(p);
        }
    }

    /** Resolve an icon path from SignalData to current page depth. */
    function _icon(path) {
        return _basePath === '../../' ? path : path.replace('../../', _basePath);
    }

    function _diffBadge(difficulty) {
        const d = SignalData.difficulties[difficulty];
        if (!d) return '';
        return `<span class="se-diff-badge" style="--diff-color:${d.color}">${d.label}</span>`;
    }

    function _platformBadge(platformId) {
        const p = SignalData.platforms[platformId];
        if (!p) return '';
        return `<span class="se-platform-badge" style="--plat-color:${p.color}">${p.name}</span>`;
    }

    // =========================================================================
    // HUB RENDERER
    // =========================================================================

    function renderHub() {
        _loadProgress();
        document.title = 'The Signal \u2014 Hardware Projects \u2014 Hexworth Prime';
        _injectStyles(_getHubCSS());

        const body = document.body;
        body.innerHTML = '';

        // Particle layer
        const particles = document.createElement('div');
        particles.className = 'se-particles';
        _buildParticles(particles);
        body.appendChild(particles);

        // Ambient glow
        const glow = document.createElement('div');
        glow.className = 'se-glow';
        body.appendChild(glow);

        // Header
        body.appendChild(_buildHeader('The Signal', 'Hardware Projects Hub', 'Dashboard', '../../dashboard.html'));

        // Main wrapper
        const main = document.createElement('main');
        main.className = 'se-main';

        // Hero
        main.appendChild(_buildHero());

        // Overall progress
        main.appendChild(_buildOverallProgress());

        // Platform overview (Build Your Kit)
        main.appendChild(_buildPlatformOverview());

        // Track tabs + section grid
        main.appendChild(_buildTrackSection());

        // Footer
        const footer = document.createElement('div');
        footer.className = 'se-footer';
        footer.innerHTML = 'The Signal &mdash; Hexworth Prime Hardware Hub';
        main.appendChild(footer);

        body.appendChild(main);

        // Default to first track
        _activateTrack('foundations');
    }

    function _buildHero() {
        const total = SignalData.getTotalProjects();
        const platforms = Object.keys(SignalData.platforms).length;
        const hero = document.createElement('div');
        hero.className = 'se-hero';
        hero.innerHTML = `
            <h1 class="se-title">The Signal</h1>
            <div class="se-subtitle">Hardware Security &mdash; From First Circuit to Field Tools</div>
            <div class="se-hero-stats">
                <div class="se-stat">
                    <span class="se-stat-num">${total}</span>
                    <span class="se-stat-label">Projects</span>
                </div>
                <div class="se-stat">
                    <span class="se-stat-num">${SignalData.tracks.length}</span>
                    <span class="se-stat-label">Tracks</span>
                </div>
                <div class="se-stat">
                    <span class="se-stat-num">${platforms}</span>
                    <span class="se-stat-label">Platforms</span>
                </div>
            </div>`;
        return hero;
    }

    function _buildOverallProgress() {
        const total = SignalData.getTotalProjects();
        const completed = SignalData.getCompletedCount(_progress);
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

        const wrap = document.createElement('div');
        wrap.className = 'se-overall-progress';
        wrap.innerHTML = `
            <div class="se-progress-header">
                <span class="se-progress-label">Overall Progress</span>
                <span class="se-progress-count">${completed} / ${total} projects &mdash; ${pct}%</span>
            </div>
            <div class="se-progress-track">
                <div class="se-progress-fill" style="width:${pct}%"></div>
            </div>`;
        return wrap;
    }

    function _buildPlatformOverview() {
        const wrap = document.createElement('div');
        wrap.className = 'se-platform-overview';

        const label = document.createElement('div');
        label.className = 'se-section-label';
        label.textContent = 'Build Your Kit';
        wrap.appendChild(label);

        const grid = document.createElement('div');
        grid.className = 'se-plat-grid';

        Object.entries(SignalData.platforms).forEach(([id, plat]) => {
            const projects = SignalData.getByPlatform(id);
            const completed = projects.filter(p => _progress[p.id]).length;

            const card = document.createElement('div');
            card.className = 'se-plat-card';
            card.style.setProperty('--plat-color', plat.color);
            card.style.cursor = 'pointer';

            // Build project list for this platform
            let projectListHtml = projects.map(proj => {
                const section = SignalData.sections.find(s => s.projects.some(p => p.id === proj.id));
                const diff = SignalData.difficulties[proj.difficulty];
                const done = _progress[proj.id];
                return `<a href="sections/${section ? section.id : ''}/index.html" class="se-plat-project${done ? ' se-plat-project--done' : ''}">
                    <span class="se-plat-proj-id">${proj.id}</span>
                    <span class="se-plat-proj-title">${proj.title}</span>
                    <span class="se-diff-badge" style="--diff-color:${diff ? diff.color : '#888'}">${diff ? diff.label : ''}</span>
                    <span class="se-meta-tag se-meta-time">${proj.buildTime}</span>
                    <span class="se-meta-tag se-meta-cost">${proj.cost}</span>
                </a>`;
            }).join('');

            card.innerHTML = `
                <div class="se-plat-card-top">
                    <img class="se-plat-icon" src="${_icon(plat.icon)}" alt="" width="28" height="28"
                         onerror="this.onerror=null;this.src='${_basePath}assets/images/icons/icon-memory.webp'">
                    <div class="se-plat-expand-hint">&#9662;</div>
                </div>
                <div class="se-plat-name">${plat.name}</div>
                <div class="se-plat-kit">${plat.kit}</div>
                <div class="se-plat-meta">
                    <span>~$${plat.approxCost}</span>
                    <span>${projects.length} projects</span>
                    <span>${completed}/${projects.length} done</span>
                </div>
                <div class="se-plat-projects" hidden>
                    <div class="se-plat-projects-label">${plat.name} Projects</div>
                    ${projectListHtml}
                </div>`;

            card.addEventListener('click', (e) => {
                if (e.target.closest('.se-plat-project')) return; // let links navigate
                const list = card.querySelector('.se-plat-projects');
                const hint = card.querySelector('.se-plat-expand-hint');
                const open = !list.hidden;
                list.hidden = open;
                card.classList.toggle('se-plat-card--open', !open);
                hint.innerHTML = open ? '&#9662;' : '&#9652;';
            });

            grid.appendChild(card);
        });

        wrap.appendChild(grid);
        return wrap;
    }

    function _buildTrackSection() {
        const section = document.createElement('div');
        section.className = 'se-track-section';

        // Tab bar
        const tabBar = document.createElement('div');
        tabBar.className = 'se-track-tabs';

        SignalData.tracks.forEach(track => {
            const stats = SignalData.getTrackStats(track.id, _progress);
            const tab = document.createElement('button');
            tab.className = 'se-track-tab';
            tab.id = `tab-${track.id}`;
            tab.setAttribute('data-track', track.id);
            tab.innerHTML = `
                <img class="se-tab-icon" src="${_icon(track.icon)}" alt="" width="20" height="20">
                <span class="se-tab-name">${track.name}</span>
                <span class="se-tab-pct">${stats.pct}%</span>`;
            tab.addEventListener('click', () => _activateTrack(track.id));
            tabBar.appendChild(tab);
        });

        section.appendChild(tabBar);

        // Panel container
        const panels = document.createElement('div');
        panels.className = 'se-track-panels';
        panels.id = 'track-panels';

        SignalData.tracks.forEach(track => {
            panels.appendChild(_buildTrackPanel(track));
        });

        section.appendChild(panels);
        return section;
    }

    function _buildTrackPanel(track) {
        const panel = document.createElement('div');
        panel.className = 'se-track-panel';
        panel.id = `panel-${track.id}`;
        panel.setAttribute('hidden', '');

        // Track header
        const header = document.createElement('div');
        header.className = 'se-panel-header';
        header.innerHTML = `
            <div class="se-panel-title">${track.name}</div>
            <div class="se-panel-desc">${track.description}</div>`;
        panel.appendChild(header);

        // Section cards
        const grid = document.createElement('div');
        grid.className = 'se-section-grid';

        const sections = SignalData.getTrackSections(track.id);
        sections.forEach(sec => {
            grid.appendChild(_buildSectionCard(sec));
        });

        panel.appendChild(grid);
        return panel;
    }

    function _buildSectionCard(sec) {
        const stats = SignalData.getSectionStats(sec.id, _progress);

        const card = document.createElement('a');
        card.className = 'se-section-card';
        card.href = `sections/${sec.id}/index.html`;
        card.style.setProperty('--section-color', sec.color);

        // Platform breakdown
        const platforms = [...new Set(sec.projects.map(p => p.platform))];
        const platIcons = platforms.map(pid => {
            const pl = SignalData.platforms[pid];
            return pl ? `<img src="${_icon(pl.icon)}" alt="${pl.name}" title="${pl.name}" width="18" height="18" style="border-radius:3px"
                              onerror="this.onerror=null;this.src='${_basePath}assets/images/icons/icon-memory.webp'">` : '';
        }).join('');

        card.innerHTML = `
            <div class="se-card-top">
                <img class="se-card-icon" src="${_icon(sec.icon)}" alt="" width="36" height="36">
                <div class="se-card-badge">${stats.total} projects</div>
            </div>
            <div class="se-card-name">${sec.name}</div>
            <div class="se-card-desc">${sec.description}</div>
            <div class="se-card-platforms">${platIcons}</div>
            <div class="se-card-progress">
                <div class="se-card-track">
                    <div class="se-card-fill" style="width:${stats.pct}%"></div>
                </div>
                <span class="se-card-pct">${stats.pct}%</span>
            </div>`;

        return card;
    }

    function _activateTrack(trackId) {
        document.querySelectorAll('.se-track-tab').forEach(t => {
            t.classList.toggle('se-track-tab--active', t.getAttribute('data-track') === trackId);
        });
        SignalData.tracks.forEach(track => {
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
        _basePath = '../../../../'; // from sections/{id}/ to _app/
        _loadProgress();
        const section = SignalData.getSection(sectionId);
        if (!section) {
            document.body.innerHTML = '<p style="color:#e74c3c;padding:2rem">Section not found: ' + sectionId + '</p>';
            return;
        }

        document.title = section.name + ' \u2014 The Signal \u2014 Hexworth Prime';
        _injectStyles(_getSectionCSS(section.color));

        const body = document.body;
        body.innerHTML = '';

        // Particles
        const particles = document.createElement('div');
        particles.className = 'se-particles';
        _buildParticles(particles);
        body.appendChild(particles);

        // Header
        body.appendChild(_buildHeader(section.name, 'The Signal', 'The Signal', '../../index.html'));

        // Main
        const main = document.createElement('main');
        main.className = 'se-main';

        // Section hero
        main.appendChild(_buildSectionHero(section));

        // Platform filter
        main.appendChild(_buildPlatformFilter(section));

        // Project list
        main.appendChild(_buildProjectList(section));

        // Footer
        const footer = document.createElement('div');
        footer.className = 'se-footer';
        footer.innerHTML = `${section.name} &mdash; The Signal &mdash; Hexworth Prime`;
        main.appendChild(footer);

        body.appendChild(main);
    }

    function _buildSectionHero(section) {
        const stats = SignalData.getSectionStats(section.id, _progress);
        const hero = document.createElement('div');
        hero.className = 'se-section-hero';
        hero.innerHTML = `
            <img class="se-section-icon" src="${_icon(section.icon)}" alt="" width="48" height="48">
            <h1 class="se-section-title">${section.name}</h1>
            <div class="se-section-desc">${section.description}</div>
            <div class="se-section-stats">
                <span>${stats.completed} / ${stats.total} complete</span>
                <span>&mdash;</span>
                <span>${stats.pct}%</span>
            </div>
            <div class="se-progress-track" style="max-width:400px;margin:0 auto">
                <div class="se-progress-fill" style="width:${stats.pct}%"></div>
            </div>`;
        return hero;
    }

    function _buildPlatformFilter(section) {
        const platforms = [...new Set(section.projects.map(p => p.platform))];
        if (platforms.length <= 1) return document.createElement('div'); // no filter needed

        const wrap = document.createElement('div');
        wrap.className = 'se-filter-bar';

        const allBtn = document.createElement('button');
        allBtn.className = 'se-filter-btn se-filter-btn--active';
        allBtn.textContent = 'All';
        allBtn.addEventListener('click', () => _filterProjects(null, wrap));
        wrap.appendChild(allBtn);

        platforms.forEach(pid => {
            const plat = SignalData.platforms[pid];
            if (!plat) return;
            const btn = document.createElement('button');
            btn.className = 'se-filter-btn';
            btn.setAttribute('data-platform', pid);
            btn.innerHTML = `<img src="${_icon(plat.icon)}" alt="" width="16" height="16" style="border-radius:3px;vertical-align:middle"
                                  onerror="this.onerror=null;this.src='${_basePath}assets/images/icons/icon-memory.webp'"> ${plat.name}`;
            btn.addEventListener('click', () => _filterProjects(pid, wrap));
            wrap.appendChild(btn);
        });

        return wrap;
    }

    function _filterProjects(platformId, filterBar) {
        // Update active button
        filterBar.querySelectorAll('.se-filter-btn').forEach(b => {
            const bPlat = b.getAttribute('data-platform');
            b.classList.toggle('se-filter-btn--active', platformId === null ? !bPlat : bPlat === platformId);
        });

        // Show/hide projects
        document.querySelectorAll('.se-project-item').forEach(item => {
            if (!platformId) {
                item.style.display = '';
            } else {
                item.style.display = item.getAttribute('data-platform') === platformId ? '' : 'none';
            }
        });
    }

    function _buildProjectList(section) {
        const list = document.createElement('div');
        list.className = 'se-project-list';

        section.projects.forEach((proj, i) => {
            const done = _isComplete(proj.id);
            const item = document.createElement('div');
            item.className = 'se-project-item' + (done ? ' se-project-item--done' : '');
            item.setAttribute('data-platform', proj.platform);

            const num = String(i + 1).padStart(2, '0');
            const diff = SignalData.difficulties[proj.difficulty];
            const plat = SignalData.platforms[proj.platform];

            // Prerequisite badges
            let prereqHtml = '';
            if (proj.prerequisites.length) {
                prereqHtml = '<div class="se-prereq-row">' +
                    proj.prerequisites.map(preId => {
                        const pre = SignalData.getProject(preId);
                        return pre ? `<span class="se-prereq-badge" title="Requires: ${pre.title}">${preId}</span>` : '';
                    }).join('') + '</div>';
            }

            // Parts summary
            const kitParts = proj.parts.filter(p => p.inKit).length;
            const extraParts = proj.parts.filter(p => !p.inKit).length;

            item.innerHTML = `
                <div class="se-project-main">
                    <div class="se-project-check" data-id="${proj.id}">
                        <div class="se-check-box${done ? ' se-check-box--checked' : ''}">${done ? '&#10003;' : ''}</div>
                    </div>
                    <div class="se-project-num">${num}</div>
                    <div class="se-project-info">
                        <div class="se-project-title">${proj.title}</div>
                        <div class="se-project-meta">
                            ${_diffBadge(proj.difficulty)}
                            ${_platformBadge(proj.platform)}
                            <span class="se-meta-tag se-meta-time">${proj.buildTime}</span>
                            <span class="se-meta-tag se-meta-cost">${proj.cost}</span>
                        </div>
                        ${prereqHtml}
                    </div>
                    <button class="se-expand-btn" title="Parts list">
                        <img src="${_basePath}assets/images/icons/icon-tools.webp" alt="" width="16" height="16" style="border-radius:3px">
                    </button>
                </div>
                <div class="se-project-details" hidden>
                    <div class="se-parts-table">
                        <div class="se-parts-header">
                            <span>Component</span><span>Qty</span><span>In Kit?</span>
                        </div>
                        ${proj.parts.map(p => `
                            <div class="se-parts-row">
                                <span>${p.component}</span>
                                <span>${p.qty}</span>
                                <span class="${p.inKit ? 'se-kit-yes' : 'se-kit-no'}">${p.inKit ? 'Yes' : 'No'}</span>
                            </div>
                        `).join('')}
                    </div>
                    ${proj.outcomes.length ? `
                    <div class="se-outcomes">
                        <div class="se-outcomes-label">What You'll Build</div>
                        <ul>${proj.outcomes.map(o => `<li>${o}</li>`).join('')}</ul>
                    </div>` : ''}
                    ${proj.skills.length ? `
                    <div class="se-skills-row">
                        ${proj.skills.map(sk => `<span class="se-skill-tag">${SignalData.skills[sk] || sk}</span>`).join('')}
                    </div>` : ''}
                </div>`;

            // Checkbox toggle
            const checkBox = item.querySelector('.se-project-check');
            checkBox.style.cursor = 'pointer';
            checkBox.addEventListener('click', (e) => {
                e.stopPropagation();
                _toggleComplete(proj.id);
                const box = checkBox.querySelector('.se-check-box');
                const nowDone = _isComplete(proj.id);
                box.classList.toggle('se-check-box--checked', nowDone);
                box.innerHTML = nowDone ? '&#10003;' : '';
                item.classList.toggle('se-project-item--done', nowDone);
                _updateSectionProgress(section);
            });

            // Expand/collapse parts
            const expandBtn = item.querySelector('.se-expand-btn');
            const details = item.querySelector('.se-project-details');
            expandBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                const open = !details.hidden;
                details.hidden = open;
                expandBtn.classList.toggle('se-expand-btn--open', !open);
            });

            // Click row to navigate (if has href)
            if (proj.href && proj.status === 'ready') {
                item.querySelector('.se-project-main').style.cursor = 'pointer';
                item.querySelector('.se-project-main').addEventListener('click', (e) => {
                    if (e.target.closest('.se-project-check') || e.target.closest('.se-expand-btn')) return;
                    window.location.href = proj.href;
                });
            }

            list.appendChild(item);
        });

        return list;
    }

    function _updateSectionProgress(section) {
        const stats = SignalData.getSectionStats(section.id, _progress);
        const statsEl = document.querySelector('.se-section-stats');
        if (statsEl) {
            statsEl.innerHTML = `
                <span>${stats.completed} / ${stats.total} complete</span>
                <span>&mdash;</span>
                <span>${stats.pct}%</span>`;
        }
        const fill = document.querySelector('.se-progress-fill');
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
.se-header {
    position: sticky; top: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 24px;
    background: rgba(10, 10, 15, 0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255, 107, 53, 0.2);
}
.se-header-left { display: flex; align-items: center; gap: 12px; }
.se-header-icon { border-radius: 6px; }
.se-header-title { font-size: 16px; font-weight: 700; color: ${PRIMARY}; }
.se-header-sub { font-size: 12px; color: #8b949e; }
.se-btn {
    padding: 6px 14px; border-radius: 6px; font-size: 13px; font-weight: 600;
    background: ${PRIMARY_DIM}; color: ${PRIMARY};
    border: 1px solid rgba(255, 107, 53, 0.25);
    transition: all 0.2s;
}
.se-btn:hover { background: rgba(255, 107, 53, 0.25); }

/* Main */
.se-main { max-width: 1000px; margin: 0 auto; padding: 24px 20px 60px; position: relative; z-index: 1; }

/* Particles */
.se-particles { position: fixed; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
.se-particle {
    position: absolute; bottom: -10px; color: ${PRIMARY}; border-radius: 50%;
    animation: seFloat linear infinite;
}
@keyframes seFloat {
    0% { transform: translateY(0) rotate(0deg); opacity: 0; }
    10% { opacity: var(--o, 0.3); }
    90% { opacity: var(--o, 0.3); }
    100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
}

/* Glow */
.se-glow {
    position: fixed; top: -200px; left: 50%; width: 600px; height: 400px;
    transform: translateX(-50%);
    background: radial-gradient(ellipse, rgba(255, 107, 53, 0.08) 0%, transparent 70%);
    pointer-events: none; z-index: 0;
}

/* Progress bar (shared) */
.se-overall-progress { margin-bottom: 32px; }
.se-progress-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
.se-progress-label { font-size: 14px; font-weight: 600; color: ${PRIMARY}; }
.se-progress-count { font-size: 13px; color: #8b949e; }
.se-progress-track {
    height: 8px; background: rgba(255,255,255,0.06); border-radius: 4px; overflow: hidden;
}
.se-progress-fill {
    height: 100%; background: linear-gradient(90deg, ${PRIMARY}, #ff9a6c);
    border-radius: 4px; transition: width 0.4s ease;
}

/* Difficulty & platform badges */
.se-diff-badge {
    font-size: 10px; padding: 2px 7px; border-radius: 3px;
    background: color-mix(in srgb, var(--diff-color) 15%, transparent);
    color: var(--diff-color); font-weight: 700; letter-spacing: 0.3px;
    text-transform: uppercase;
}
.se-platform-badge {
    font-size: 10px; padding: 2px 7px; border-radius: 3px;
    background: color-mix(in srgb, var(--plat-color) 12%, transparent);
    color: var(--plat-color); font-weight: 600;
}

/* Footer */
.se-footer {
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
.se-hero { text-align: center; padding: 48px 0 32px; }
.se-title {
    font-size: 42px; font-weight: 800; color: #fff;
    background: linear-gradient(135deg, ${PRIMARY}, #ff9a6c, #ffcc80);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    background-clip: text;
}
.se-subtitle { font-size: 16px; color: #8b949e; margin-top: 8px; }
.se-hero-stats { display: flex; justify-content: center; gap: 48px; margin-top: 24px; }
.se-stat { text-align: center; }
.se-stat-num { display: block; font-size: 28px; font-weight: 800; color: ${PRIMARY}; }
.se-stat-label { font-size: 12px; color: #8b949e; text-transform: uppercase; letter-spacing: 1px; }

/* Platform overview */
.se-platform-overview { margin-bottom: 32px; }
.se-section-label {
    font-size: 14px; font-weight: 700; color: ${PRIMARY};
    letter-spacing: 0.05em; margin-bottom: 12px;
}
.se-plat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px; }
.se-plat-card {
    padding: 16px; border-radius: 10px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    transition: all 0.25s;
}
.se-plat-card:hover {
    background: rgba(255,255,255,0.05);
    border-color: var(--plat-color);
}
.se-plat-card-top { display: flex; justify-content: space-between; align-items: flex-start; }
.se-plat-icon { border-radius: 6px; margin-bottom: 8px; }
.se-plat-expand-hint { font-size: 10px; color: #555; transition: color 0.2s; }
.se-plat-card:hover .se-plat-expand-hint { color: var(--plat-color); }
.se-plat-name { font-size: 14px; font-weight: 700; color: #fff; }
.se-plat-kit { font-size: 11px; color: #8b949e; margin-top: 2px; }
.se-plat-meta {
    display: flex; gap: 12px; margin-top: 10px;
    font-size: 11px; color: var(--plat-color); font-weight: 600;
}
.se-plat-card--open {
    border-color: var(--plat-color);
    background: rgba(255,255,255,0.05);
    grid-column: 1 / -1;
}
.se-plat-projects {
    margin-top: 12px; padding-top: 10px;
    border-top: 1px solid rgba(255,255,255,0.06);
}
.se-plat-projects-label {
    font-size: 10px; color: #666; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;
}
.se-plat-project {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 8px; margin: 2px 0; border-radius: 6px;
    text-decoration: none; color: #e0e0e0;
    transition: background 0.15s;
}
.se-plat-project:hover { background: rgba(255,255,255,0.06); }
.se-plat-project--done { opacity: 0.5; }
.se-plat-project--done .se-plat-proj-title { text-decoration: line-through; }
.se-plat-proj-id { font-size: 10px; color: #555; font-weight: 700; min-width: 38px; }
.se-plat-proj-title { flex: 1; font-size: 12px; font-weight: 600; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Track tabs */
.se-track-section { margin-top: 8px; }
.se-track-tabs { display: flex; gap: 4px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0; overflow-x: auto; }
.se-track-tab {
    display: flex; align-items: center; gap: 8px;
    padding: 10px 18px; border: none; background: none; color: #8b949e;
    font-size: 13px; font-weight: 600; cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: all 0.2s; white-space: nowrap;
}
.se-track-tab:hover { color: #e0e0e0; }
.se-track-tab--active {
    color: ${PRIMARY}; border-bottom-color: ${PRIMARY};
}
.se-tab-icon { border-radius: 4px; }
.se-tab-pct { font-size: 11px; opacity: 0.6; }

/* Track panels */
.se-panel-header { padding: 24px 0 16px; }
.se-panel-title { font-size: 20px; font-weight: 700; color: #fff; }
.se-panel-desc { font-size: 14px; color: #8b949e; margin-top: 4px; }

/* Section grid */
.se-section-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-top: 8px; }
.se-section-card {
    display: block; padding: 20px; border-radius: 12px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    transition: all 0.25s;
}
.se-section-card:hover {
    background: rgba(255,255,255,0.05);
    border-color: var(--section-color, ${PRIMARY});
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}
.se-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
.se-card-icon { border-radius: 8px; }
.se-card-badge {
    font-size: 11px; padding: 3px 8px; border-radius: 4px;
    background: rgba(255,255,255,0.06); color: #8b949e;
}
.se-card-name { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 6px; }
.se-card-desc { font-size: 13px; color: #8b949e; line-height: 1.5; margin-bottom: 10px; min-height: 40px; }
.se-card-platforms { display: flex; gap: 6px; margin-bottom: 10px; }
.se-card-progress { display: flex; align-items: center; gap: 10px; }
.se-card-track { flex: 1; height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; }
.se-card-fill { height: 100%; background: var(--section-color, ${PRIMARY}); border-radius: 2px; transition: width 0.3s; }
.se-card-pct { font-size: 12px; color: #8b949e; min-width: 30px; text-align: right; }

/* Responsive */
@media (max-width: 700px) {
    .se-hero-stats { gap: 24px; }
    .se-title { font-size: 32px; }
    .se-track-tabs { overflow-x: auto; }
    .se-section-grid { grid-template-columns: 1fr; }
    .se-plat-grid { grid-template-columns: 1fr 1fr; }
}
@media (max-width: 480px) {
    .se-plat-grid { grid-template-columns: 1fr; }
}
`;
    }

    // =========================================================================
    // CSS — Section page
    // =========================================================================

    function _getSectionCSS(color) {
        return `
/* Section hero */
.se-section-hero { text-align: center; padding: 40px 0 28px; }
.se-section-icon { border-radius: 10px; margin-bottom: 12px; }
.se-section-title { font-size: 32px; font-weight: 800; color: #fff; }
.se-section-desc { font-size: 14px; color: #8b949e; margin-top: 6px; max-width: 600px; margin-left: auto; margin-right: auto; }
.se-section-stats { display: flex; justify-content: center; gap: 12px; margin: 16px 0 10px; font-size: 14px; color: ${color}; }

/* Platform filter */
.se-filter-bar {
    display: flex; gap: 6px; flex-wrap: wrap;
    padding: 12px 0; margin-bottom: 12px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
}
.se-filter-btn {
    padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600;
    background: rgba(255,255,255,0.04); color: #8b949e;
    border: 1px solid rgba(255,255,255,0.08);
    cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; gap: 6px;
}
.se-filter-btn:hover { background: rgba(255,255,255,0.08); color: #e0e0e0; }
.se-filter-btn--active {
    background: ${PRIMARY_DIM}; color: ${PRIMARY};
    border-color: rgba(255, 107, 53, 0.3);
}

/* Project list */
.se-project-list { max-width: 780px; margin: 0 auto; }
.se-project-item {
    border-radius: 10px;
    border: 1px solid rgba(255,255,255,0.05);
    margin-bottom: 8px; transition: all 0.2s;
    overflow: hidden;
}
.se-project-item:hover { background: rgba(255,255,255,0.02); border-color: rgba(255,255,255,0.1); }
.se-project-item--done { opacity: 0.55; }
.se-project-item--done .se-project-title { text-decoration: line-through; }

.se-project-main {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 16px;
}

.se-project-check { flex-shrink: 0; }
.se-check-box {
    width: 22px; height: 22px; border-radius: 4px;
    border: 2px solid rgba(255,255,255,0.15);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; color: ${color}; transition: all 0.2s;
}
.se-check-box--checked {
    background: ${color}; border-color: ${color}; color: #fff;
}

.se-project-num { font-size: 12px; color: #555; font-weight: 700; min-width: 22px; }
.se-project-info { flex: 1; min-width: 0; }
.se-project-title { font-size: 14px; font-weight: 600; color: #e0e0e0; }
.se-project-meta { display: flex; gap: 6px; margin-top: 5px; flex-wrap: wrap; align-items: center; }
.se-meta-tag {
    font-size: 10px; padding: 2px 6px; border-radius: 3px;
    background: rgba(255,255,255,0.06); color: #8b949e;
    font-weight: 600;
}
.se-meta-time { color: #60a5fa; }
.se-meta-cost { color: #4ade80; }

/* Prerequisite badges */
.se-prereq-row { display: flex; gap: 4px; margin-top: 4px; }
.se-prereq-badge {
    font-size: 9px; padding: 1px 5px; border-radius: 3px;
    background: rgba(255, 107, 53, 0.1); color: ${PRIMARY};
    font-weight: 600; letter-spacing: 0.3px;
}

/* Expand button */
.se-expand-btn {
    flex-shrink: 0; padding: 6px; border-radius: 6px;
    background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
    cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center;
}
.se-expand-btn:hover { background: rgba(255,255,255,0.08); }
.se-expand-btn--open { background: ${PRIMARY_DIM}; border-color: rgba(255, 107, 53, 0.3); }

/* Project details (expandable) */
.se-project-details {
    padding: 0 16px 14px;
    border-top: 1px solid rgba(255,255,255,0.04);
}

/* Parts table */
.se-parts-table { margin-top: 12px; }
.se-parts-header {
    display: grid; grid-template-columns: 1fr 50px 60px; gap: 8px;
    font-size: 10px; color: #666; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.5px; padding-bottom: 6px;
    border-bottom: 1px solid rgba(255,255,255,0.05);
}
.se-parts-row {
    display: grid; grid-template-columns: 1fr 50px 60px; gap: 8px;
    font-size: 12px; padding: 5px 0;
    border-bottom: 1px solid rgba(255,255,255,0.02);
}
.se-kit-yes { color: #4ade80; font-weight: 600; }
.se-kit-no { color: #f87171; font-weight: 600; }

/* Outcomes */
.se-outcomes { margin-top: 12px; }
.se-outcomes-label { font-size: 11px; color: #666; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px; }
.se-outcomes ul { list-style: none; padding: 0; }
.se-outcomes li {
    font-size: 12px; color: #aaa; padding: 3px 0 3px 16px;
    position: relative;
}
.se-outcomes li::before {
    content: ''; position: absolute; left: 0; top: 10px;
    width: 6px; height: 6px; border-radius: 50%;
    background: ${color};
}

/* Skills row */
.se-skills-row { display: flex; gap: 4px; flex-wrap: wrap; margin-top: 10px; }
.se-skill-tag {
    font-size: 10px; padding: 2px 7px; border-radius: 3px;
    background: rgba(255,255,255,0.04); color: #888;
    font-weight: 600;
}

/* Responsive */
@media (max-width: 600px) {
    .se-section-title { font-size: 24px; }
    .se-project-main { padding: 10px 12px; gap: 8px; }
    .se-project-num { display: none; }
    .se-parts-header, .se-parts-row { grid-template-columns: 1fr 40px 50px; }
}
`;
    }

    // =========================================================================
    // PROJECT PAGE RENDERER
    // =========================================================================

    function renderProject(projectId) {
        _basePath = '../../../../'; // from sections/{id}/ to _app/
        _loadProgress();

        const proj = SignalData.getProject(projectId);
        if (!proj) {
            document.body.innerHTML = '<p style="color:#e74c3c;padding:2rem">Project not found: ' + projectId + '</p>';
            return;
        }

        // Find parent section
        const section = SignalData.sections.find(s => s.projects.some(p => p.id === projectId));
        const diff = SignalData.difficulties[proj.difficulty];
        const plat = SignalData.platforms[proj.platform];
        const color = section ? section.color : PRIMARY;

        document.title = proj.title + ' \u2014 The Signal \u2014 Hexworth Prime';
        _injectStyles(_getProjectCSS(color));

        const body = document.body;
        body.innerHTML = '';

        // Particles
        const particles = document.createElement('div');
        particles.className = 'se-particles';
        _buildParticles(particles);
        body.appendChild(particles);

        // Header
        body.appendChild(_buildHeader(proj.id.toUpperCase(), 'The Signal', section ? section.name : 'Back', 'index.html'));

        // Main
        const main = document.createElement('main');
        main.className = 'se-main';

        // ---- Project Hero ----
        const hero = document.createElement('div');
        hero.className = 'sp-hero';
        const done = _isComplete(proj.id);
        hero.innerHTML = `
            <div class="sp-hero-id">${proj.id.toUpperCase()}</div>
            <h1 class="sp-hero-title">${proj.title}</h1>
            <div class="sp-hero-badges">
                ${diff ? `<span class="se-diff-badge" style="--diff-color:${diff.color}">${diff.label}</span>` : ''}
                ${plat ? `<span class="se-platform-badge" style="--plat-color:${plat.color}">${plat.name}</span>` : ''}
                <span class="sp-badge sp-badge-time">${proj.buildTime}</span>
                <span class="sp-badge sp-badge-cost">${proj.cost}</span>
            </div>`;
        main.appendChild(hero);

        // ---- Mark Complete toggle ----
        const completeBar = document.createElement('div');
        completeBar.className = 'sp-complete-bar';
        const completeBtn = document.createElement('button');
        completeBtn.className = 'sp-complete-btn' + (done ? ' sp-complete-btn--done' : '');
        completeBtn.innerHTML = done ? '&#10003; Completed' : 'Mark as Complete';
        completeBtn.addEventListener('click', () => {
            _toggleComplete(proj.id);
            const nowDone = _isComplete(proj.id);
            completeBtn.className = 'sp-complete-btn' + (nowDone ? ' sp-complete-btn--done' : '');
            completeBtn.innerHTML = nowDone ? '&#10003; Completed' : 'Mark as Complete';
        });
        completeBar.appendChild(completeBtn);
        main.appendChild(completeBar);

        // ---- Prerequisites ----
        if (proj.prerequisites.length) {
            const prereqBox = document.createElement('div');
            prereqBox.className = 'sp-card';
            let prereqHtml = '<div class="sp-card-label">Prerequisites</div><div class="sp-prereq-list">';
            proj.prerequisites.forEach(preId => {
                const pre = SignalData.getProject(preId);
                const preDone = _isComplete(preId);
                prereqHtml += `<div class="sp-prereq-item ${preDone ? 'sp-prereq-item--done' : ''}">
                    <span class="sp-prereq-check">${preDone ? '&#10003;' : ''}</span>
                    <span class="sp-prereq-id">${preId}</span>
                    <span>${pre ? pre.title : preId}</span>
                </div>`;
            });
            prereqHtml += '</div>';
            prereqBox.innerHTML = prereqHtml;
            main.appendChild(prereqBox);
        }

        // ---- What You'll Build (outcomes) ----
        if (proj.outcomes.length) {
            const outBox = document.createElement('div');
            outBox.className = 'sp-card';
            outBox.innerHTML = `
                <div class="sp-card-label">What You'll Build</div>
                <ul class="sp-outcomes">
                    ${proj.outcomes.map(o => `<li>${o}</li>`).join('')}
                </ul>`;
            main.appendChild(outBox);
        }

        // ---- Parts Manifest ----
        const partsBox = document.createElement('div');
        partsBox.className = 'sp-card';
        const kitCount = proj.parts.filter(p => p.inKit).length;
        const extraCount = proj.parts.filter(p => !p.inKit).length;
        partsBox.innerHTML = `
            <div class="sp-card-label">Parts Manifest</div>
            <div class="sp-parts-summary">
                <span class="sp-parts-stat sp-parts-kit">${kitCount} in kit</span>
                ${extraCount > 0 ? `<span class="sp-parts-stat sp-parts-extra">${extraCount} additional</span>` : ''}
            </div>
            <div class="sp-parts-table">
                <div class="sp-parts-header">
                    <span>Component</span><span>Qty</span><span>In Kit?</span>
                </div>
                ${proj.parts.map(p => `
                    <div class="sp-parts-row">
                        <span>${p.component}</span>
                        <span>${p.qty}</span>
                        <span class="${p.inKit ? 'sp-kit-yes' : 'sp-kit-no'}">${p.inKit ? 'Yes' : 'No'}</span>
                    </div>
                `).join('')}
            </div>`;
        main.appendChild(partsBox);

        // ---- Platform Info ----
        if (plat) {
            const platBox = document.createElement('div');
            platBox.className = 'sp-card';
            platBox.innerHTML = `
                <div class="sp-card-label">Platform</div>
                <div class="sp-platform-info">
                    <img src="${_icon(plat.icon)}" alt="" width="32" height="32" style="border-radius:6px"
                         onerror="this.onerror=null;this.src='${_basePath}assets/images/icons/icon-memory.webp'">
                    <div>
                        <div class="sp-plat-name">${plat.name}</div>
                        <div class="sp-plat-kit">${plat.kit} &mdash; ~$${plat.approxCost}</div>
                        <div class="sp-plat-desc">${plat.description}</div>
                    </div>
                </div>`;
            main.appendChild(platBox);
        }

        // ---- Skills ----
        if (proj.skills.length) {
            const skillBox = document.createElement('div');
            skillBox.className = 'sp-card';
            skillBox.innerHTML = `
                <div class="sp-card-label">Skills</div>
                <div class="sp-skills-grid">
                    ${proj.skills.map(sk => `<span class="sp-skill-chip">${SignalData.skills[sk] || sk}</span>`).join('')}
                </div>`;
            main.appendChild(skillBox);
        }

        // ---- Build Guide ----
        const guide = window.SignalGuides && window.SignalGuides[projectId];
        if (guide) {
            main.appendChild(_buildGuide(guide, color));
        } else {
            const guideBox = document.createElement('div');
            guideBox.className = 'sp-card sp-guide-card';
            guideBox.innerHTML = `
                <div class="sp-card-label">Build Guide</div>
                <div class="sp-coming-soon">
                    <img src="${_basePath}assets/images/icons/icon-construction.webp" alt="" width="40" height="40" style="border-radius:8px;opacity:0.5"
                         onerror="this.onerror=null;this.src='${_basePath}assets/images/icons/icon-tools.webp'">
                    <div class="sp-coming-title">Under Construction</div>
                    <div class="sp-coming-desc">Wiring diagrams, step-by-step instructions, and firmware code are coming soon.</div>
                </div>`;
            main.appendChild(guideBox);
        }

        // ---- XP Info ----
        if (diff) {
            const xpBox = document.createElement('div');
            xpBox.className = 'sp-xp-bar';
            xpBox.innerHTML = `<span class="sp-xp-label">Completion XP</span><span class="sp-xp-value" style="color:${diff.color}">${diff.xp} XP</span>`;
            main.appendChild(xpBox);
        }

        // Footer
        const footer = document.createElement('div');
        footer.className = 'se-footer';
        footer.innerHTML = `${proj.id.toUpperCase()} &mdash; The Signal &mdash; Hexworth Prime`;
        main.appendChild(footer);

        body.appendChild(main);
    }

    // =========================================================================
    // Build Guide renderer
    // =========================================================================

    function _buildGuide(guide, color) {
        const wrap = document.createElement('div');
        wrap.className = 'sp-guide';

        // Intro
        if (guide.intro) {
            const introBox = document.createElement('div');
            introBox.className = 'sp-card';
            introBox.innerHTML = `<div class="sp-card-label">Overview</div><div class="sp-guide-intro">${guide.intro}</div>`;
            wrap.appendChild(introBox);
        }

        // Wiring / circuit
        if (guide.wiring) {
            const wireBox = document.createElement('div');
            wireBox.className = 'sp-card';
            wireBox.innerHTML = `<div class="sp-card-label">Wiring Diagram</div><pre class="sp-wiring">${_escHtml(guide.wiring)}</pre>`;
            if (guide.wiringNotes) {
                wireBox.innerHTML += `<div class="sp-wiring-notes">${guide.wiringNotes}</div>`;
            }
            wrap.appendChild(wireBox);
        }

        // Steps
        if (guide.steps && guide.steps.length) {
            guide.steps.forEach((step, i) => {
                const stepBox = document.createElement('div');
                stepBox.className = 'sp-card sp-step-card';
                let html = `<div class="sp-step-header"><span class="sp-step-num">Step ${i + 1}</span><span class="sp-step-title">${step.title}</span></div>`;
                html += `<div class="sp-step-body">${step.content}</div>`;
                if (step.code) {
                    html += `<div class="sp-code-label">${step.language || 'Code'}</div><pre class="sp-code"><code>${_escHtml(step.code)}</code></pre>`;
                }
                if (step.tip) {
                    html += `<div class="sp-tip">${step.tip}</div>`;
                }
                stepBox.innerHTML = html;
                wrap.appendChild(stepBox);
            });
        }

        // Testing
        if (guide.testing) {
            const testBox = document.createElement('div');
            testBox.className = 'sp-card';
            testBox.innerHTML = `<div class="sp-card-label">Testing &amp; Verification</div><div class="sp-guide-text">${guide.testing}</div>`;
            wrap.appendChild(testBox);
        }

        // Troubleshooting
        if (guide.troubleshooting) {
            const troubleBox = document.createElement('div');
            troubleBox.className = 'sp-card';
            troubleBox.innerHTML = `<div class="sp-card-label">Troubleshooting</div><div class="sp-guide-text">${guide.troubleshooting}</div>`;
            wrap.appendChild(troubleBox);
        }

        // Challenge / stretch goals
        if (guide.challenges) {
            const chalBox = document.createElement('div');
            chalBox.className = 'sp-card';
            chalBox.innerHTML = `<div class="sp-card-label">Stretch Challenges</div><div class="sp-guide-text">${guide.challenges}</div>`;
            wrap.appendChild(chalBox);
        }

        return wrap;
    }

    function _escHtml(str) {
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    // =========================================================================
    // CSS — Project page
    // =========================================================================

    function _getProjectCSS(color) {
        return `
/* Project hero */
.sp-hero { text-align: center; padding: 40px 0 20px; }
.sp-hero-id {
    font-size: 12px; color: ${PRIMARY}; font-weight: 700;
    letter-spacing: 2px; margin-bottom: 8px;
}
.sp-hero-title { font-size: 28px; font-weight: 800; color: #fff; margin-bottom: 14px; }
.sp-hero-badges { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }
.sp-badge {
    font-size: 11px; padding: 3px 10px; border-radius: 4px;
    background: rgba(255,255,255,0.06); font-weight: 600;
}
.sp-badge-time { color: #60a5fa; }
.sp-badge-cost { color: #4ade80; }

/* Complete bar */
.sp-complete-bar { text-align: center; margin: 12px 0 28px; }
.sp-complete-btn {
    padding: 10px 28px; border-radius: 8px; font-size: 14px; font-weight: 700;
    background: ${PRIMARY_DIM}; color: ${PRIMARY};
    border: 1px solid rgba(255, 107, 53, 0.3);
    cursor: pointer; transition: all 0.2s;
    letter-spacing: 0.3px;
}
.sp-complete-btn:hover { background: rgba(255, 107, 53, 0.25); }
.sp-complete-btn--done {
    background: rgba(74, 222, 128, 0.12); color: #4ade80;
    border-color: rgba(74, 222, 128, 0.3);
}
.sp-complete-btn--done:hover { background: rgba(74, 222, 128, 0.2); }

/* Cards */
.sp-card {
    background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.06);
    border-radius: 12px; padding: 20px 24px; margin-bottom: 16px;
    max-width: 700px; margin-left: auto; margin-right: auto;
}
.sp-card-label {
    font-size: 11px; font-weight: 700; color: ${color};
    text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px;
}

/* Prerequisites */
.sp-prereq-list { display: flex; flex-direction: column; gap: 6px; }
.sp-prereq-item {
    display: flex; align-items: center; gap: 10px;
    padding: 8px 12px; border-radius: 6px;
    background: rgba(255,255,255,0.02); font-size: 13px;
}
.sp-prereq-item--done { opacity: 0.6; }
.sp-prereq-check {
    width: 20px; height: 20px; border-radius: 4px;
    border: 2px solid rgba(255,255,255,0.12);
    display: flex; align-items: center; justify-content: center;
    font-size: 12px; color: #4ade80; flex-shrink: 0;
}
.sp-prereq-item--done .sp-prereq-check {
    background: #4ade80; border-color: #4ade80; color: #fff;
}
.sp-prereq-id {
    font-size: 10px; color: #555; font-weight: 700; min-width: 36px;
}

/* Outcomes */
.sp-outcomes { list-style: none; padding: 0; }
.sp-outcomes li {
    font-size: 14px; color: #bbb; padding: 6px 0 6px 20px;
    position: relative; line-height: 1.5;
}
.sp-outcomes li::before {
    content: ''; position: absolute; left: 0; top: 13px;
    width: 8px; height: 8px; border-radius: 50%;
    background: ${color};
}

/* Parts */
.sp-parts-summary { display: flex; gap: 12px; margin-bottom: 12px; }
.sp-parts-stat {
    font-size: 12px; font-weight: 600; padding: 3px 10px;
    border-radius: 4px;
}
.sp-parts-kit { background: rgba(74, 222, 128, 0.1); color: #4ade80; }
.sp-parts-extra { background: rgba(248, 113, 113, 0.1); color: #f87171; }
.sp-parts-table { margin-top: 4px; }
.sp-parts-header {
    display: grid; grid-template-columns: 1fr 50px 60px; gap: 8px;
    font-size: 10px; color: #555; font-weight: 700; text-transform: uppercase;
    letter-spacing: 0.5px; padding-bottom: 8px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
}
.sp-parts-row {
    display: grid; grid-template-columns: 1fr 50px 60px; gap: 8px;
    font-size: 13px; padding: 8px 0;
    border-bottom: 1px solid rgba(255,255,255,0.03);
}
.sp-kit-yes { color: #4ade80; font-weight: 600; }
.sp-kit-no { color: #f87171; font-weight: 600; }

/* Platform info */
.sp-platform-info { display: flex; align-items: flex-start; gap: 14px; }
.sp-plat-name { font-size: 15px; font-weight: 700; color: #fff; }
.sp-plat-kit { font-size: 12px; color: #8b949e; margin-top: 2px; }
.sp-plat-desc { font-size: 12px; color: #666; margin-top: 4px; line-height: 1.4; }

/* Skills */
.sp-skills-grid { display: flex; gap: 6px; flex-wrap: wrap; }
.sp-skill-chip {
    font-size: 12px; padding: 5px 12px; border-radius: 6px;
    background: rgba(255,255,255,0.04); color: #aaa;
    border: 1px solid rgba(255,255,255,0.06);
    font-weight: 600;
}

/* Build guide coming soon */
.sp-guide-card { border-style: dashed; }
.sp-coming-soon { text-align: center; padding: 24px 0; }
.sp-coming-title {
    font-size: 16px; font-weight: 700; color: #666; margin-top: 12px;
}
.sp-coming-desc { font-size: 13px; color: #555; margin-top: 6px; }

/* Build guide content */
.sp-guide { max-width: 700px; margin: 0 auto; }
.sp-guide .sp-card { margin-bottom: 16px; }
.sp-guide-intro { font-size: 14px; color: #bbb; line-height: 1.7; }
.sp-guide-intro p { margin-bottom: 10px; }
.sp-guide-text { font-size: 13px; color: #bbb; line-height: 1.7; }
.sp-guide-text p { margin-bottom: 8px; }
.sp-guide-text ul { padding-left: 18px; margin: 8px 0; }
.sp-guide-text li { margin-bottom: 4px; }

/* Wiring */
.sp-wiring {
    font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
    font-size: 11px; line-height: 1.4; color: #8b949e;
    background: #0d1117; border: 1px solid rgba(255,255,255,0.06);
    border-radius: 8px; padding: 16px; overflow-x: auto;
    white-space: pre;
}
.sp-wiring-notes { font-size: 12px; color: #666; margin-top: 10px; line-height: 1.5; }

/* Steps */
.sp-step-card { border-left: 3px solid ${color}; }
.sp-step-header { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.sp-step-num {
    font-size: 10px; font-weight: 800; color: ${color};
    background: color-mix(in srgb, ${color} 12%, transparent);
    padding: 3px 10px; border-radius: 4px; letter-spacing: 0.5px;
    text-transform: uppercase; white-space: nowrap;
}
.sp-step-title { font-size: 15px; font-weight: 700; color: #fff; }
.sp-step-body { font-size: 13px; color: #bbb; line-height: 1.7; }
.sp-step-body p { margin-bottom: 8px; }
.sp-step-body ul, .sp-step-body ol { padding-left: 18px; margin: 8px 0; }
.sp-step-body li { margin-bottom: 4px; }
.sp-step-body strong { color: #e0e0e0; }
.sp-step-body code {
    font-family: 'Cascadia Code', 'Fira Code', monospace;
    font-size: 12px; background: rgba(255,255,255,0.06);
    padding: 1px 5px; border-radius: 3px; color: ${color};
}

/* Code blocks */
.sp-code-label {
    font-size: 10px; color: #555; font-weight: 700;
    text-transform: uppercase; letter-spacing: 0.5px; margin: 12px 0 6px;
}
.sp-code {
    font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
    font-size: 12px; line-height: 1.5; color: #c9d1d9;
    background: #0d1117; border: 1px solid rgba(255,255,255,0.06);
    border-radius: 8px; padding: 16px; overflow-x: auto;
    white-space: pre; margin: 0;
}

/* Tips */
.sp-tip {
    margin-top: 10px; padding: 10px 14px; border-radius: 6px;
    background: rgba(250, 204, 21, 0.06); border-left: 3px solid #facc15;
    font-size: 12px; color: #ccc; line-height: 1.5;
}

/* XP bar */
.sp-xp-bar {
    display: flex; justify-content: space-between; align-items: center;
    max-width: 700px; margin: 8px auto 0;
    padding: 12px 24px; border-radius: 8px;
    background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.04);
}
.sp-xp-label { font-size: 12px; color: #666; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
.sp-xp-value { font-size: 18px; font-weight: 800; }

/* Responsive */
@media (max-width: 600px) {
    .sp-hero-title { font-size: 22px; }
    .sp-card { padding: 16px; }
    .sp-parts-header, .sp-parts-row { grid-template-columns: 1fr 40px 50px; }
}
`;
    }

    // =========================================================================
    // Public API
    // =========================================================================

    return {
        renderHub,
        renderSection,
        renderProject
    };

})();
