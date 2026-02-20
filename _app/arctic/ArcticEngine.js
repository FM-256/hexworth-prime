/**
 * ArcticEngine.js — Hexworth Prime Arctic Linux Content Hub
 *
 * Shared rendering engine. Provides two public methods:
 *   ArcticEngine.renderHub()      — renders the full hub page
 *   ArcticEngine.renderDistrict(districtId) — renders a single district page
 *
 * Reads/writes progress via localStorage key: hexworth_arctic_progress
 * (JSON object mapping module id → true)
 *
 * Depends on: ArcticData.js (must be loaded before this file)
 */

const ArcticEngine = (() => {

    // -------------------------------------------------------------------------
    // Internal state
    // -------------------------------------------------------------------------
    let _progress = {};

    // -------------------------------------------------------------------------
    // Progress helpers
    // -------------------------------------------------------------------------

    function _loadProgress() {
        try {
            _progress = JSON.parse(localStorage.getItem('hexworth_arctic_progress') || '{}');
        } catch (e) {
            _progress = {};
        }
    }

    function _saveProgress() {
        localStorage.setItem('hexworth_arctic_progress', JSON.stringify(_progress));
    }

    function _markComplete(moduleId) {
        _progress[moduleId] = true;
        _saveProgress();
    }

    function _isComplete(moduleId) {
        return !!_progress[moduleId];
    }

    // -------------------------------------------------------------------------
    // Shared utilities
    // -------------------------------------------------------------------------

    /** Inject base CSS and shared structural styles into the document head. */
    function _injectStyles(extraCss) {
        const style = document.createElement('style');
        style.textContent = _getBaseCSS() + (extraCss || '');
        document.head.appendChild(style);
    }

    /** Build and inject the shared snowfall container into body. */
    function _buildSnowfall(container) {
        const FLAKE_COUNT = 45;
        const chars = ['\u2022', '\u00B7', '*', '\u2219', '\u2607'];
        for (let i = 0; i < FLAKE_COUNT; i++) {
            const flake = document.createElement('span');
            flake.className = 'ae-snowflake';
            flake.textContent = chars[Math.floor(Math.random() * chars.length)];
            flake.style.left = Math.random() * 100 + '%';
            flake.style.fontSize = (5 + Math.random() * 9) + 'px';
            flake.style.opacity = String(0.2 + Math.random() * 0.5);
            flake.style.animationDuration = (9 + Math.random() * 14) + 's';
            flake.style.animationDelay = -(Math.random() * 22) + 's';
            container.appendChild(flake);
        }
    }

    /** Build the shared sticky header. backHref=null omits the back button. */
    function _buildHeader(title, subtitle, backLabel, backHref) {
        const header = document.createElement('div');
        header.className = 'ae-header';
        header.innerHTML = `
            <div class="ae-header-left">
                <div class="ae-header-icon">&#x1F9CA;</div>
                <div>
                    <div class="ae-header-title">${title}</div>
                    <div class="ae-header-sub">${subtitle}</div>
                </div>
            </div>
            <div class="ae-header-right">
                ${backHref ? `<a href="${backHref}" class="ae-btn">&larr; ${backLabel}</a>` : ''}
            </div>`;
        return header;
    }

    // -------------------------------------------------------------------------
    // HUB RENDERER
    // -------------------------------------------------------------------------

    /**
     * renderHub() — Entry point for index.html.
     * Replaces document.body content with the full Arctic hub UI.
     */
    function renderHub() {
        _loadProgress();
        document.title = 'The Arctic \u2014 Hexworth Prime';
        _injectStyles(_getHubCSS());

        const body = document.body;
        body.innerHTML = '';

        // Snowfall layer
        const snow = document.createElement('div');
        snow.className = 'ae-snowfall';
        _buildSnowfall(snow);
        body.appendChild(snow);

        // Aurora ambient layer
        const aurora = document.createElement('div');
        aurora.className = 'ae-aurora';
        body.appendChild(aurora);

        // Header with back-to-dashboard
        body.appendChild(_buildHeader('The Arctic', 'Linux Content Hub', 'Dashboard', '../dashboard.html'));

        // Main wrapper
        const main = document.createElement('main');
        main.className = 'ae-main';

        // Hero block with Tux
        main.appendChild(_buildHeroBlock());

        // Overall progress bar
        main.appendChild(_buildOverallProgress());

        // Faction switcher + district grid
        main.appendChild(_buildFactionSection());

        // Progression diagram
        main.appendChild(_buildProgressionDiagram());

        // Footer
        const footer = document.createElement('div');
        footer.className = 'ae-footer';
        footer.innerHTML = 'The Arctic &mdash; Hexworth Prime Linux Content Hub &mdash; Mayor Tux Presiding';
        main.appendChild(footer);

        body.appendChild(main);

        // Activate first faction tab by default
        _activateFactionTab('penguin');
    }

    function _buildHeroBlock() {
        const hero = document.createElement('div');
        hero.className = 'ae-hero';
        hero.innerHTML = `
            <div class="ae-tux-wrap">
                <img class="ae-tux" src="assets/tux.svg" alt="Tux the Penguin">
                <div class="ae-tux-label">Mayor Tux &mdash; Your Guide</div>
            </div>
            <h1 class="ae-title">The Arctic</h1>
            <div class="ae-subtitle">Linux Command Hub &mdash; Master Every Layer</div>`;
        return hero;
    }

    function _buildOverallProgress() {
        const allModules = ArcticData.districts.flatMap(d => d.modules);
        const total = allModules.length;
        const completed = allModules.filter(m => _isComplete(m.id)).length;
        const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

        const wrap = document.createElement('div');
        wrap.className = 'ae-overall-progress';
        wrap.innerHTML = `
            <div class="ae-progress-header">
                <span class="ae-progress-label">Overall Progress</span>
                <span class="ae-progress-count">${completed} / ${total} modules &mdash; ${pct}%</span>
            </div>
            <div class="ae-progress-track">
                <div class="ae-progress-fill" style="width:${pct}%"></div>
            </div>`;
        return wrap;
    }

    function _buildFactionSection() {
        const section = document.createElement('div');
        section.className = 'ae-faction-section';

        // Faction tab bar
        const tabBar = document.createElement('div');
        tabBar.className = 'ae-faction-tabs';

        ArcticData.factions.forEach(faction => {
            const unlocked = ArcticData.isFactionUnlocked(faction.id, _progress);
            const factionPct = Math.round(ArcticData.getFactionCompletion(faction.id, _progress) * 100);

            const tab = document.createElement('button');
            tab.className = `ae-faction-tab ae-faction-tab--${faction.id}`;
            tab.id = `tab-${faction.id}`;
            tab.setAttribute('data-faction', faction.id);
            tab.setAttribute('aria-pressed', 'false');
            tab.innerHTML = `
                <span class="ae-tab-icon">${faction.icon}</span>
                <span class="ae-tab-name">${faction.name}</span>
                <span class="ae-tab-pct">${unlocked ? factionPct + '%' : '\uD83D\uDD12'}</span>`;

            if (!unlocked) {
                tab.classList.add('ae-faction-tab--locked');
                tab.setAttribute('title', _getLockReason(faction));
            }

            tab.addEventListener('click', () => _activateFactionTab(faction.id));
            tabBar.appendChild(tab);
        });

        section.appendChild(tabBar);

        // Panel container — one panel per faction
        const panels = document.createElement('div');
        panels.className = 'ae-faction-panels';
        panels.id = 'faction-panels';

        ArcticData.factions.forEach(faction => {
            const panel = _buildFactionPanel(faction);
            panels.appendChild(panel);
        });

        section.appendChild(panels);
        return section;
    }

    function _getLockReason(faction) {
        if (faction.id === 'parrot') {
            return `Complete 60% of Penguin Collective to unlock`;
        }
        if (faction.id === 'dragon') {
            return `Complete 60% of Parrot Division to unlock`;
        }
        return '';
    }

    function _buildFactionPanel(faction) {
        const unlocked = ArcticData.isFactionUnlocked(faction.id, _progress);
        const districts = ArcticData.getFactionDistricts(faction.id);

        const panel = document.createElement('div');
        panel.className = `ae-faction-panel ae-faction-panel--${faction.id}`;
        panel.id = `panel-${faction.id}`;
        panel.setAttribute('hidden', '');

        if (!unlocked) {
            // Locked state
            const parentFaction = ArcticData.getFaction(faction.unlockRequirement);
            const parentPct = Math.round(ArcticData.getFactionCompletion(faction.unlockRequirement, _progress) * 100);
            panel.innerHTML = `
                <div class="ae-locked-panel">
                    <div class="ae-locked-icon">\uD83D\uDD12</div>
                    <div class="ae-locked-name">${faction.icon} ${faction.name}</div>
                    <div class="ae-locked-tagline">"${faction.tagline}"</div>
                    <div class="ae-locked-desc">${faction.description}</div>
                    <div class="ae-locked-gate">
                        Complete ${Math.round(faction.unlockThreshold * 100)}% of
                        ${parentFaction ? parentFaction.name : 'previous faction'} to unlock.
                        Currently at ${parentPct}%.
                    </div>
                    <div class="ae-locked-progress-track">
                        <div class="ae-locked-progress-fill ae-locked-fill--${faction.unlockRequirement}"
                             style="width:${parentPct}%"></div>
                    </div>
                </div>`;
            return panel;
        }

        // Unlocked — faction header
        const header = document.createElement('div');
        header.className = `ae-faction-header ae-faction-header--${faction.id}`;
        header.innerHTML = `
            <span class="ae-faction-icon-lg">${faction.icon}</span>
            <div class="ae-faction-meta">
                <div class="ae-faction-name">${faction.name}</div>
                <div class="ae-faction-tagline">"${faction.tagline}"</div>
                <div class="ae-faction-desc">${faction.description}</div>
            </div>`;
        panel.appendChild(header);

        // District grid
        const grid = document.createElement('div');
        grid.className = 'ae-district-grid';

        districts.forEach(district => {
            grid.appendChild(_buildDistrictCard(district));
        });

        panel.appendChild(grid);
        return panel;
    }

    function _buildDistrictCard(district) {
        const completion = ArcticData.getDistrictCompletion(district.id, _progress);
        const pct = Math.round(completion * 100);
        const completed = district.modules.filter(m => _isComplete(m.id)).length;
        const total = district.modules.length;

        // Determine difficulty label
        const diffLabels = ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert', 'Elite', 'Master'];
        const diffLabel = diffLabels[district.difficulty] || '';

        const card = document.createElement('a');
        card.className = `ae-district-card ae-district-card--${district.faction}`;
        card.href = `districts/${district.id}/index.html`;
        card.innerHTML = `
            <div class="ae-card-top">
                <span class="ae-card-icon">${district.icon}</span>
                <span class="ae-card-faction-badge ae-badge--${district.faction}">${ArcticData.getFaction(district.faction).name.split(' ')[0]}</span>
            </div>
            <div class="ae-card-name">${district.name}</div>
            <div class="ae-card-desc">${district.description}</div>
            <div class="ae-card-meta">
                <span class="ae-card-diff ae-diff--${district.faction}">${diffLabel}</span>
                <span class="ae-card-count">${total} items</span>
            </div>
            <div class="ae-card-progress-track">
                <div class="ae-card-progress-fill ae-card-fill--${district.faction}" style="width:${pct}%"></div>
            </div>
            <div class="ae-card-progress-label">${completed}/${total} &mdash; ${pct}%</div>`;

        return card;
    }

    function _buildProgressionDiagram() {
        const wrap = document.createElement('div');
        wrap.className = 'ae-progression';
        wrap.innerHTML = `
            <div class="ae-section-label">Progression Path</div>
            <div class="ae-progression-flow">
                <span class="ae-prog-node ae-prog-node--penguin">&#x1F427; Penguin Collective</span>
                <span class="ae-prog-arrow">&rarr;</span>
                <span class="ae-prog-node ae-prog-node--parrot">&#x1F99C; Parrot Division</span>
                <span class="ae-prog-arrow">&rarr;</span>
                <span class="ae-prog-node ae-prog-node--dragon">&#x1F409; Dragon Order</span>
            </div>
            <div class="ae-prog-note">
                You can't harden what you can't administer.
                You can't pen-test what you can't harden.
            </div>`;
        return wrap;
    }

    function _activateFactionTab(factionId) {
        // Deactivate all tabs and panels
        document.querySelectorAll('.ae-faction-tab').forEach(t => {
            t.setAttribute('aria-pressed', 'false');
            t.classList.remove('ae-faction-tab--active');
        });
        document.querySelectorAll('.ae-faction-panel').forEach(p => {
            p.setAttribute('hidden', '');
        });

        // Activate the requested tab
        const tab = document.getElementById('tab-' + factionId);
        if (tab) {
            tab.setAttribute('aria-pressed', 'true');
            tab.classList.add('ae-faction-tab--active');
        }

        const panel = document.getElementById('panel-' + factionId);
        if (panel) {
            panel.removeAttribute('hidden');
        }
    }

    // -------------------------------------------------------------------------
    // DISTRICT RENDERER
    // -------------------------------------------------------------------------

    /**
     * renderDistrict(districtId) — Entry point for district index pages.
     * Replaces document.body with the full district UI.
     */
    function renderDistrict(districtId) {
        _loadProgress();

        const district = ArcticData.getDistrict(districtId);
        if (!district) {
            document.body.innerHTML = '<p style="color:#f00;padding:2rem">District not found: ' + districtId + '</p>';
            return;
        }

        const faction = ArcticData.getFaction(district.faction);
        document.title = district.name + ' \u2014 The Arctic';

        _injectStyles(_getDistrictCSS());

        const body = document.body;
        body.innerHTML = '';

        // Snowfall
        const snow = document.createElement('div');
        snow.className = 'ae-snowfall';
        _buildSnowfall(snow);
        body.appendChild(snow);

        // Aurora
        const aurora = document.createElement('div');
        aurora.className = 'ae-aurora';
        body.appendChild(aurora);

        // Header with back button
        body.appendChild(_buildHeader('The Arctic', 'Linux Content Hub', 'Back to Hub', '../../index.html'));

        // Main
        const main = document.createElement('main');
        main.className = 'ae-main ae-district-main';

        // District hero
        main.appendChild(_buildDistrictHero(district, faction));

        // Module list
        main.appendChild(_buildModuleList(district, faction));

        // Footer
        const footer = document.createElement('div');
        footer.className = 'ae-footer';
        footer.innerHTML = `${district.name} &mdash; ${faction ? faction.name : ''} &mdash; The Arctic`;
        main.appendChild(footer);

        body.appendChild(main);
    }

    function _buildDistrictHero(district, faction) {
        const completion = ArcticData.getDistrictCompletion(district.id, _progress);
        const pct = Math.round(completion * 100);
        const completed = district.modules.filter(m => _isComplete(m.id)).length;
        const total = district.modules.length;

        const hero = document.createElement('div');
        hero.className = `ae-district-hero ae-district-hero--${district.faction}`;
        hero.innerHTML = `
            <div class="ae-district-hero-icon">${district.icon}</div>
            <div class="ae-district-hero-content">
                <div class="ae-district-hero-badge ae-badge--${district.faction}">${faction ? faction.name : ''}</div>
                <h1 class="ae-district-hero-name">${district.name}</h1>
                <p class="ae-district-hero-desc">${district.description}</p>
                <p class="ae-district-hero-lore">${district.lore}</p>
                <div class="ae-district-hero-progress">
                    <div class="ae-progress-header">
                        <span class="ae-progress-label">District Progress</span>
                        <span class="ae-progress-count">${completed} / ${total} &mdash; ${pct}%</span>
                    </div>
                    <div class="ae-progress-track">
                        <div class="ae-progress-fill ae-fill--${district.faction}" style="width:${pct}%"></div>
                    </div>
                </div>
            </div>`;
        return hero;
    }

    function _buildModuleList(district, faction) {
        const wrap = document.createElement('div');
        wrap.className = 'ae-module-list-wrap';

        const label = document.createElement('div');
        label.className = 'ae-section-label';
        label.textContent = 'District Modules';
        wrap.appendChild(label);

        const list = document.createElement('div');
        list.className = 'ae-module-list';

        district.modules.forEach(mod => {
            const done = _isComplete(mod.id);
            const item = document.createElement('div');
            item.className = `ae-module-item ae-module-item--${district.faction}${done ? ' ae-module-item--done' : ''}`;

            const typeIcon = ArcticData.getTypeIcon(mod.type);
            const typeLabel = ArcticData.getTypeLabel(mod.type);

            item.innerHTML = `
                <div class="ae-module-check" data-id="${mod.id}" title="Mark complete">
                    ${done ? '\u2713' : '\u25CB'}
                </div>
                <div class="ae-module-type-icon" title="${typeLabel}">${typeIcon}</div>
                <div class="ae-module-body">
                    <a class="ae-module-title ae-link--${district.faction}" href="${mod.href}"
                       target="_blank" rel="noopener">${mod.title}</a>
                    <span class="ae-module-type-badge ae-type-badge--${mod.type}">${typeLabel}</span>
                </div>`;

            // Toggle completion on check click (without navigating)
            const checkEl = item.querySelector('.ae-module-check');
            checkEl.addEventListener('click', (e) => {
                e.stopPropagation();
                if (_isComplete(mod.id)) {
                    delete _progress[mod.id];
                    _saveProgress();
                    item.classList.remove('ae-module-item--done');
                    checkEl.textContent = '\u25CB';
                } else {
                    _markComplete(mod.id);
                    item.classList.add('ae-module-item--done');
                    checkEl.textContent = '\u2713';
                }
                // Update the progress bar without re-rendering
                _refreshDistrictProgress(district);
            });

            list.appendChild(item);
        });

        wrap.appendChild(list);
        return wrap;
    }

    /** Recalculate and update the district hero progress bar in-place. */
    function _refreshDistrictProgress(district) {
        const completion = ArcticData.getDistrictCompletion(district.id, _progress);
        const pct = Math.round(completion * 100);
        const completed = district.modules.filter(m => _isComplete(m.id)).length;
        const total = district.modules.length;

        const fillEl = document.querySelector('.ae-district-hero-progress .ae-progress-fill');
        const countEl = document.querySelector('.ae-district-hero-progress .ae-progress-count');
        if (fillEl) fillEl.style.width = pct + '%';
        if (countEl) countEl.textContent = `${completed} / ${total} \u2014 ${pct}%`;
    }

    // -------------------------------------------------------------------------
    // CSS — base shared between hub and district
    // -------------------------------------------------------------------------

    function _getBaseCSS() {
        return `
/* ============================================================
   ArcticEngine — Base CSS (shared: hub + districts)
   ============================================================ */

*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

body {
    min-height: 100vh;
    background: #0a1628;
    font-family: 'Courier New', Courier, monospace;
    color: #c8dff0;
    overflow-x: hidden;
}

/* Aurora ambient gradient layer */
.ae-aurora {
    position: fixed;
    inset: 0;
    background:
        radial-gradient(ellipse at 15% 0%, rgba(0,212,255,0.08) 0%, transparent 50%),
        radial-gradient(ellipse at 85% 5%, rgba(0,170,200,0.06) 0%, transparent 40%),
        radial-gradient(ellipse at 50% 100%, rgba(10,30,70,0.80) 0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
}

/* Snowfall */
.ae-snowfall {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    overflow: hidden;
}

.ae-snowflake {
    position: absolute;
    top: -12px;
    color: rgba(180,220,255,0.55);
    animation: ae-fall linear infinite;
}

@keyframes ae-fall {
    0%   { transform: translateY(-12px) rotate(0deg);   opacity: 0.8; }
    100% { transform: translateY(100vh) rotate(360deg); opacity: 0.15; }
}

/* Header */
.ae-header {
    position: sticky;
    top: 0;
    z-index: 200;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 14px 28px;
    background: rgba(5,15,35,0.92);
    border-bottom: 1px solid rgba(0,212,255,0.12);
    backdrop-filter: blur(14px);
}

.ae-header-left { display: flex; align-items: center; gap: 14px; }

.ae-header-icon {
    width: 38px; height: 38px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(0,212,255,0.08);
    border: 1px solid rgba(0,212,255,0.18);
    border-radius: 7px;
    font-size: 1.2rem;
}

.ae-header-title {
    font-size: 0.9rem;
    color: #00d4ff;
    letter-spacing: 0.18em;
    text-transform: uppercase;
}

.ae-header-sub {
    font-size: 0.5rem;
    color: #5a8aaa;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    margin-top: 1px;
}

.ae-btn {
    padding: 7px 16px;
    border: 1px solid rgba(0,212,255,0.20);
    border-radius: 4px;
    color: #5aaacf;
    font-size: 0.62rem;
    letter-spacing: 0.08em;
    text-decoration: none;
    font-family: inherit;
    transition: border-color 0.2s, color 0.2s;
    cursor: pointer;
    background: transparent;
}
.ae-btn:hover { border-color: rgba(0,212,255,0.45); color: #00d4ff; }

/* Main wrapper */
.ae-main {
    position: relative;
    z-index: 2;
    max-width: 960px;
    margin: 0 auto;
    padding: 40px 24px 80px;
}

/* Section label */
.ae-section-label {
    font-size: 0.48rem;
    letter-spacing: 0.40em;
    color: #4a7090;
    text-transform: uppercase;
    margin-bottom: 18px;
}

/* Progress bar shared styles */
.ae-progress-header {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 7px;
}
.ae-progress-label {
    font-size: 0.55rem;
    color: #5a8aaa;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}
.ae-progress-count {
    font-size: 0.55rem;
    color: #3a6a8a;
}
.ae-progress-track {
    height: 5px;
    background: rgba(0,212,255,0.08);
    border-radius: 3px;
    overflow: hidden;
    border: 1px solid rgba(0,212,255,0.10);
}
.ae-progress-fill {
    height: 100%;
    background: linear-gradient(90deg, #0077aa, #00d4ff);
    border-radius: 3px;
    transition: width 0.4s ease;
}

/* Faction-colored progress fills */
.ae-fill--penguin { background: linear-gradient(90deg, #1a6a9a, #3ab8e0); }
.ae-fill--parrot  { background: linear-gradient(90deg, #1a7a5a, #3ac8a0); }
.ae-fill--dragon  { background: linear-gradient(90deg, #8a2020, #d05050); }

/* Footer */
.ae-footer {
    text-align: center;
    padding: 30px 20px 10px;
    font-size: 0.44rem;
    color: #2a4a6a;
    letter-spacing: 0.15em;
    text-transform: uppercase;
}

/* Faction badge pill */
.ae-badge--penguin {
    background: rgba(0,180,230,0.12);
    border: 1px solid rgba(0,180,230,0.22);
    color: #5ab8e0;
    padding: 2px 10px;
    border-radius: 3px;
    font-size: 0.46rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
}
.ae-badge--parrot {
    background: rgba(0,160,120,0.12);
    border: 1px solid rgba(0,160,120,0.22);
    color: #3ab89a;
    padding: 2px 10px;
    border-radius: 3px;
    font-size: 0.46rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
}
.ae-badge--dragon {
    background: rgba(180,40,40,0.12);
    border: 1px solid rgba(180,40,40,0.22);
    color: #c06060;
    padding: 2px 10px;
    border-radius: 3px;
    font-size: 0.46rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
}

@media (max-width: 640px) {
    .ae-main { padding: 24px 16px 60px; }
    .ae-header { padding: 12px 16px; }
}`;
    }

    // -------------------------------------------------------------------------
    // CSS — hub-specific additions
    // -------------------------------------------------------------------------

    function _getHubCSS() {
        return `
/* ============================================================
   ArcticEngine — Hub CSS
   ============================================================ */

/* Hero */
.ae-hero { text-align: center; margin-bottom: 36px; }
.ae-tux-wrap { margin-bottom: 20px; display: inline-block; }
.ae-tux {
    width: 100px;
    filter: drop-shadow(0 0 24px rgba(0,212,255,0.25));
    transition: filter 0.3s;
}
.ae-tux:hover { filter: drop-shadow(0 0 36px rgba(0,212,255,0.50)); }
.ae-tux-label {
    font-size: 0.46rem;
    color: #3a6a8a;
    letter-spacing: 0.28em;
    text-transform: uppercase;
    margin-top: 8px;
}
.ae-title {
    font-size: 2.4rem;
    color: #00d4ff;
    letter-spacing: 0.20em;
    text-transform: uppercase;
    text-shadow: 0 0 40px rgba(0,212,255,0.30);
    margin-bottom: 8px;
}
.ae-subtitle {
    font-size: 0.65rem;
    color: #3a6a8a;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    margin-bottom: 32px;
}

/* Overall progress */
.ae-overall-progress {
    background: rgba(0,212,255,0.04);
    border: 1px solid rgba(0,212,255,0.10);
    border-radius: 8px;
    padding: 18px 22px;
    margin-bottom: 40px;
}

/* Faction section */
.ae-faction-section { margin-bottom: 40px; }

/* Faction tab bar */
.ae-faction-tabs {
    display: flex;
    gap: 3px;
    margin-bottom: 0;
    border-bottom: 1px solid rgba(0,212,255,0.10);
}

.ae-faction-tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 14px 10px;
    background: rgba(0,212,255,0.03);
    border: 1px solid rgba(0,212,255,0.08);
    border-bottom: none;
    border-radius: 6px 6px 0 0;
    cursor: pointer;
    font-family: inherit;
    transition: background 0.2s, border-color 0.2s;
    color: #5a8aaa;
}
.ae-faction-tab:hover { background: rgba(0,212,255,0.07); }
.ae-faction-tab--active {
    background: rgba(0,212,255,0.08);
    border-color: rgba(0,212,255,0.20);
    color: #c8dff0;
}
.ae-faction-tab--locked { opacity: 0.45; cursor: default; }
.ae-faction-tab--locked:hover { background: rgba(0,212,255,0.03); }

.ae-tab-icon { font-size: 1.3rem; }
.ae-tab-name { font-size: 0.52rem; letter-spacing: 0.12em; text-transform: uppercase; }
.ae-tab-pct  { font-size: 0.5rem; color: #3a6a8a; }

/* Faction panels */
.ae-faction-panels {
    background: rgba(0,5,20,0.40);
    border: 1px solid rgba(0,212,255,0.10);
    border-top: none;
    border-radius: 0 0 8px 8px;
    padding: 28px 22px;
    min-height: 220px;
}
.ae-faction-panel[hidden] { display: none; }

/* Locked panel state */
.ae-locked-panel {
    text-align: center;
    padding: 40px 20px;
    color: #3a6a8a;
}
.ae-locked-icon { font-size: 2.5rem; margin-bottom: 14px; }
.ae-locked-name { font-size: 1rem; letter-spacing: 0.15em; text-transform: uppercase; margin-bottom: 6px; color: #5a8aaa; }
.ae-locked-tagline { font-style: italic; font-size: 0.65rem; color: #2a5a7a; margin-bottom: 12px; }
.ae-locked-desc { font-size: 0.6rem; line-height: 1.7; max-width: 500px; margin: 0 auto 20px; color: #3a6a8a; }
.ae-locked-gate { font-size: 0.55rem; color: #2a4a6a; margin-bottom: 14px; }
.ae-locked-progress-track {
    max-width: 300px; margin: 0 auto;
    height: 5px; background: rgba(0,212,255,0.08);
    border-radius: 3px; overflow: hidden;
}
.ae-locked-progress-fill { height: 100%; border-radius: 3px; transition: width 0.4s; }
.ae-locked-fill--penguin { background: linear-gradient(90deg, #1a6a9a, #3ab8e0); }
.ae-locked-fill--parrot  { background: linear-gradient(90deg, #1a7a5a, #3ac8a0); }

/* Faction header */
.ae-faction-header {
    display: flex;
    align-items: flex-start;
    gap: 20px;
    margin-bottom: 28px;
    padding-bottom: 20px;
    border-bottom: 1px solid rgba(0,212,255,0.08);
}
.ae-faction-icon-lg { font-size: 2.8rem; flex-shrink: 0; line-height: 1; }
.ae-faction-name {
    font-size: 0.9rem;
    color: #c8dff0;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 3px;
}
.ae-faction-tagline {
    font-style: italic;
    font-size: 0.65rem;
    color: #5a8aaa;
    margin-bottom: 8px;
}
.ae-faction-desc { font-size: 0.6rem; color: #4a7090; line-height: 1.7; }

/* District grid */
.ae-district-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 14px;
}

/* District cards */
.ae-district-card {
    display: block;
    text-decoration: none;
    padding: 18px;
    border-radius: 8px;
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
    position: relative;
    overflow: hidden;
}
.ae-district-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    transition: opacity 0.2s;
}
.ae-district-card:hover { transform: translateY(-3px); }

/* Penguin card */
.ae-district-card--penguin {
    background: rgba(0,120,180,0.08);
    border: 1px solid rgba(0,180,230,0.14);
    color: #c8dff0;
}
.ae-district-card--penguin::before { background: linear-gradient(90deg, #1a6a9a, #3ab8e0); }
.ae-district-card--penguin:hover { border-color: rgba(0,180,230,0.30); box-shadow: 0 4px 20px rgba(0,180,230,0.10); }

/* Parrot card */
.ae-district-card--parrot {
    background: rgba(0,120,90,0.08);
    border: 1px solid rgba(0,160,120,0.14);
    color: #c8dff0;
}
.ae-district-card--parrot::before { background: linear-gradient(90deg, #1a7a5a, #3ac8a0); }
.ae-district-card--parrot:hover { border-color: rgba(0,160,120,0.30); box-shadow: 0 4px 20px rgba(0,160,120,0.10); }

/* Dragon card */
.ae-district-card--dragon {
    background: rgba(140,20,20,0.08);
    border: 1px solid rgba(180,40,40,0.14);
    color: #c8dff0;
}
.ae-district-card--dragon::before { background: linear-gradient(90deg, #8a2020, #d05050); }
.ae-district-card--dragon:hover { border-color: rgba(180,40,40,0.30); box-shadow: 0 4px 20px rgba(180,40,40,0.10); }

.ae-card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
.ae-card-icon { font-size: 1.6rem; }
.ae-card-name {
    font-size: 0.72rem;
    color: #a8cfe0;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 6px;
}
.ae-card-desc { font-size: 0.56rem; color: #4a7090; line-height: 1.65; margin-bottom: 12px; }
.ae-card-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.ae-card-diff {
    font-size: 0.46rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 3px;
}
.ae-diff--penguin { background: rgba(0,180,230,0.08); color: #3a9ac0; border: 1px solid rgba(0,180,230,0.14); }
.ae-diff--parrot  { background: rgba(0,160,120,0.08); color: #2a9a7a; border: 1px solid rgba(0,160,120,0.14); }
.ae-diff--dragon  { background: rgba(180,40,40,0.08); color: #c06060; border: 1px solid rgba(180,40,40,0.14); }
.ae-card-count { font-size: 0.48rem; color: #3a6a8a; }
.ae-card-progress-track { height: 4px; background: rgba(0,212,255,0.06); border-radius: 2px; overflow: hidden; margin-bottom: 6px; }
.ae-card-progress-fill { height: 100%; border-radius: 2px; transition: width 0.4s; }
.ae-card-fill--penguin { background: linear-gradient(90deg, #1a6a9a, #3ab8e0); }
.ae-card-fill--parrot  { background: linear-gradient(90deg, #1a7a5a, #3ac8a0); }
.ae-card-fill--dragon  { background: linear-gradient(90deg, #8a2020, #d05050); }
.ae-card-progress-label { font-size: 0.44rem; color: #3a6a8a; text-align: right; }

/* Progression diagram */
.ae-progression { text-align: center; margin-bottom: 20px; }
.ae-progression-flow { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; margin-bottom: 12px; }
.ae-prog-node {
    padding: 8px 18px;
    border-radius: 4px;
    font-size: 0.55rem;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    font-weight: bold;
}
.ae-prog-node--penguin {
    background: rgba(0,180,230,0.10);
    border: 1px solid rgba(0,180,230,0.22);
    color: #3ab8e0;
}
.ae-prog-node--parrot {
    background: rgba(0,160,120,0.10);
    border: 1px solid rgba(0,160,120,0.22);
    color: #3ac8a0;
}
.ae-prog-node--dragon {
    background: rgba(180,40,40,0.10);
    border: 1px solid rgba(180,40,40,0.22);
    color: #d05050;
}
.ae-prog-arrow { color: #2a4a6a; font-size: 0.8rem; }
.ae-prog-note { font-size: 0.52rem; color: #2a4a6a; font-style: italic; }

@media (max-width: 600px) {
    .ae-faction-tabs { flex-direction: column; border-bottom: none; }
    .ae-faction-tab { flex-direction: row; justify-content: flex-start; gap: 10px; border-radius: 5px; border-bottom: 1px solid rgba(0,212,255,0.08); }
    .ae-district-grid { grid-template-columns: 1fr; }
    .ae-title { font-size: 1.7rem; }
    .ae-progression-flow { flex-direction: column; gap: 6px; }
    .ae-prog-arrow { transform: rotate(90deg); }
}`;
    }

    // -------------------------------------------------------------------------
    // CSS — district-specific additions
    // -------------------------------------------------------------------------

    function _getDistrictCSS() {
        return `
/* ============================================================
   ArcticEngine — District CSS
   ============================================================ */

.ae-district-main { max-width: 800px; }

/* District hero */
.ae-district-hero {
    display: flex;
    gap: 24px;
    align-items: flex-start;
    padding: 28px;
    border-radius: 10px;
    margin-bottom: 40px;
}
.ae-district-hero--penguin {
    background: rgba(0,120,180,0.09);
    border: 1px solid rgba(0,180,230,0.16);
}
.ae-district-hero--parrot {
    background: rgba(0,100,80,0.09);
    border: 1px solid rgba(0,160,120,0.16);
}
.ae-district-hero--dragon {
    background: rgba(120,20,20,0.09);
    border: 1px solid rgba(180,40,40,0.16);
}

.ae-district-hero-icon { font-size: 3.2rem; flex-shrink: 0; line-height: 1; padding-top: 4px; }
.ae-district-hero-content { flex: 1; }
.ae-district-hero-badge { display: inline-block; margin-bottom: 10px; }
.ae-district-hero-name {
    font-size: 1.4rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: #c8dff0;
    margin-bottom: 10px;
}
.ae-district-hero-desc {
    font-size: 0.65rem;
    color: #4a7090;
    line-height: 1.7;
    margin-bottom: 8px;
}
.ae-district-hero-lore {
    font-size: 0.58rem;
    font-style: italic;
    color: #2a5070;
    line-height: 1.65;
    margin-bottom: 18px;
}
.ae-district-hero-progress { margin-top: 6px; }

/* Module list */
.ae-module-list-wrap { margin-bottom: 40px; }
.ae-module-list { display: flex; flex-direction: column; gap: 5px; }

.ae-module-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 6px;
    transition: background 0.15s;
}
.ae-module-item--penguin {
    background: rgba(0,120,180,0.06);
    border: 1px solid rgba(0,180,230,0.10);
}
.ae-module-item--penguin:hover { background: rgba(0,120,180,0.10); }
.ae-module-item--parrot {
    background: rgba(0,100,80,0.06);
    border: 1px solid rgba(0,160,120,0.10);
}
.ae-module-item--parrot:hover { background: rgba(0,100,80,0.10); }
.ae-module-item--dragon {
    background: rgba(120,20,20,0.06);
    border: 1px solid rgba(180,40,40,0.10);
}
.ae-module-item--dragon:hover { background: rgba(120,20,20,0.10); }

/* Completed state */
.ae-module-item--done { opacity: 0.60; }
.ae-module-item--done .ae-module-title { text-decoration: line-through; }

/* Completion checkbox / toggle */
.ae-module-check {
    flex-shrink: 0;
    width: 24px; height: 24px;
    display: flex; align-items: center; justify-content: center;
    border-radius: 4px;
    background: rgba(0,212,255,0.05);
    border: 1px solid rgba(0,212,255,0.15);
    cursor: pointer;
    font-size: 0.75rem;
    color: #3a9ac0;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
    user-select: none;
}
.ae-module-check:hover { background: rgba(0,212,255,0.12); border-color: rgba(0,212,255,0.35); }
.ae-module-item--done .ae-module-check {
    background: rgba(0,212,255,0.12);
    color: #00d4ff;
    border-color: rgba(0,212,255,0.35);
}

.ae-module-type-icon { flex-shrink: 0; font-size: 1rem; }

.ae-module-body { flex: 1; display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }

.ae-module-title {
    font-size: 0.65rem;
    letter-spacing: 0.04em;
    text-decoration: none;
    transition: color 0.15s;
}
.ae-link--penguin { color: #5ab8e0; }
.ae-link--penguin:hover { color: #00d4ff; }
.ae-link--parrot  { color: #3ac8a0; }
.ae-link--parrot:hover  { color: #5ae8c0; }
.ae-link--dragon  { color: #d06060; }
.ae-link--dragon:hover  { color: #f08080; }

/* Type badge */
.ae-module-type-badge {
    font-size: 0.42rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    padding: 1px 7px;
    border-radius: 3px;
    flex-shrink: 0;
}
.ae-type-badge--module  { background: rgba(100,180,255,0.10); color: #5a9ac0; border: 1px solid rgba(100,180,255,0.18); }
.ae-type-badge--lab     { background: rgba(80,220,160,0.10);  color: #3ab890; border: 1px solid rgba(80,220,160,0.18); }
.ae-type-badge--applet  { background: rgba(180,140,255,0.10); color: #9a7ad0; border: 1px solid rgba(180,140,255,0.18); }
.ae-type-badge--quiz    { background: rgba(255,200,80,0.10);  color: #c0a030; border: 1px solid rgba(255,200,80,0.18); }
.ae-type-badge--tool    { background: rgba(255,140,80,0.10);  color: #c07030; border: 1px solid rgba(255,140,80,0.18); }
.ae-type-badge--game    { background: rgba(255,80,120,0.10);  color: #c03060; border: 1px solid rgba(255,80,120,0.18); }
.ae-type-badge--review  { background: rgba(80,200,220,0.10);  color: #30a0b0; border: 1px solid rgba(80,200,220,0.18); }

@media (max-width: 600px) {
    .ae-district-hero { flex-direction: column; padding: 20px; }
    .ae-district-hero-icon { font-size: 2.2rem; }
    .ae-district-hero-name { font-size: 1rem; }
    .ae-module-item { padding: 10px 12px; }
}`;
    }

    // -------------------------------------------------------------------------
    // Public API
    // -------------------------------------------------------------------------
    return {
        renderHub,
        renderDistrict
    };

})();
