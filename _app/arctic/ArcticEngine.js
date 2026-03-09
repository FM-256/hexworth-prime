/**
 * ArcticEngine.js — Hexworth Prime Arctic Linux Content Hub v3.0
 *
 * Rendering engine for the Arctic hub and district pages.
 *
 * Public API:
 *   ArcticEngine.renderHub()              — hub index page
 *   ArcticEngine.renderDistrict(id)       — district detail page
 *
 * Progress storage: localStorage key 'hexworth_arctic_progress'
 *   Format: JSON object mapping module id → true
 *
 * Depends on ArcticData.js (must be loaded first).
 *
 * Design principles:
 *   - All CSS injected via JS (no external stylesheets)
 *   - No emoji — geometric Unicode chars only (★ ● ▸ ◆ etc.)
 *   - No external dependencies
 *   - Hub: all 12 districts visible; locked factions shown fogged but readable
 *   - District: vertical node-path flow with forking lab+quiz branches
 *   - Fog of war: lifts progressively as modules are completed
 */

const ArcticEngine = (() => {

    // =========================================================================
    // CONSTANTS
    // =========================================================================

    const PROGRESS_KEY = 'hexworth_arctic_progress';
    const ARCTIC_NEXT_KEY = 'hexworth_arctic_next';
    const FLAKE_COUNT  = 40;

    // Module types that are standalone challenge nodes (not grouped into sections)
    const CHALLENGE_TYPES = new Set(['game', 'review']);

    // Module types that act as the "lesson" head of a section
    const LESSON_TYPES = new Set(['module']);

    // Module types that are branch items within a section
    const BRANCH_TYPES = new Set(['lab', 'quiz', 'applet', 'tool']);

    // Visual config per module type
    const TYPE_META = {
        module:  { label: 'Module',      icon: '[]',  colorVar: '--ae-type-module'  },
        lab:     { label: 'Lab',         icon: '[+]', colorVar: '--ae-type-lab'     },
        applet:  { label: 'Interactive', icon: '[>]', colorVar: '--ae-type-applet'  },
        quiz:    { label: 'Quiz',        icon: '[?]', colorVar: '--ae-type-quiz'    },
        tool:    { label: 'Tool',        icon: '[T]', colorVar: '--ae-type-tool'    },
        game:    { label: 'Game',        icon: '[*]', colorVar: '--ae-type-game'    },
        review:  { label: 'Review',      icon: '[R]', colorVar: '--ae-type-review'  }
    };

    // Faction accent colors (kept in sync with ArcticData.js faction colors)
    const FACTION_COLOR = {
        penguin: { main: '#3ab8e0', dark: '#1a6a9a', dim: 'rgba(58,184,224,0.12)', border: 'rgba(58,184,224,0.22)' },
        parrot:  { main: '#3ac8a0', dark: '#1a7a5a', dim: 'rgba(58,200,160,0.12)', border: 'rgba(58,200,160,0.22)' },
        dragon:  { main: '#d05050', dark: '#8a2020', dim: 'rgba(208,80,80,0.12)',  border: 'rgba(208,80,80,0.22)'  }
    };

    const DIFF_LABELS = ['', 'Beginner', 'Intermediate', 'Advanced', 'Expert', 'Elite', 'Master'];

    // =========================================================================
    // PROGRESS STORE
    // =========================================================================

    let _progress = {};

    function _loadProgress() {
        try {
            _progress = JSON.parse(localStorage.getItem(PROGRESS_KEY) || '{}');
        } catch (_) {
            _progress = {};
        }
    }

    function _saveProgress() {
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(_progress));
    }

    function _isComplete(id) {
        return !!_progress[id];
    }

    function _setComplete(id, value) {
        if (value) {
            _progress[id] = new Date().toISOString();
        } else {
            delete _progress[id];
        }
        _saveProgress();
    }

    /**
     * Detect completions from hexworth_progress for a district's modules.
     * Checks multiple houses (script, shield, dark-arts) and supports
     * explicit progressKey overrides for modules with unreliable href fallback.
     */
    function _autoDetectCompletions(district) {
        let changed = false;
        try {
            const hp = JSON.parse(localStorage.getItem('hexworth_progress') || '{}');
            for (const mod of district.modules) {
                if (_isComplete(mod.id)) continue;
                const house = mod.progressHouse || 'script';
                const houseProgress = hp[house] || {};

                // 1. Explicit progressKey (overrides href-derived matching)
                if (mod.progressKey && houseProgress[mod.progressKey]?.completed) {
                    _progress[mod.id] = new Date().toISOString();
                    changed = true;
                    continue;
                }
                // 2. Direct ID match
                if (houseProgress[mod.id]?.completed) {
                    _progress[mod.id] = new Date().toISOString();
                    changed = true;
                    continue;
                }
                // 3. Href-derived filename fallback (skip if progressKey set — avoids collision)
                if (!mod.progressKey && mod.href) {
                    const fname = mod.href.split('/').pop()
                        .replace(/\.(module|lab|quiz|applet|tool|game|review)\.html$/, '');
                    if (fname && houseProgress[fname]?.completed) {
                        _progress[mod.id] = new Date().toISOString();
                        changed = true;
                    }
                }
            }
        } catch (e) { /* non-critical */ }
        if (changed) _saveProgress();
    }

    // =========================================================================
    // SECTION GROUPING
    // =========================================================================

    /**
     * Group a flat module array into sections for the district flow view.
     *
     * Rules:
     *   - A 'module' type starts a new section and acts as its lesson head.
     *   - lab / quiz / applet / tool items after a module head belong to that section.
     *   - 'game' and 'review' are standalone challenge nodes (never grouped).
     *   - If the list starts with non-module items before the first module,
     *     they form a loose "preamble" section with no head.
     *
     * Returns an array of section objects:
     *   { head: module|null, branches: module[], isSingle: bool, isChallenge: bool }
     */
    function _buildSections(modules) {
        const sections = [];
        let current    = null;

        modules.forEach(mod => {
            if (CHALLENGE_TYPES.has(mod.type)) {
                // Flush current section first
                if (current) { sections.push(current); current = null; }
                sections.push({ head: mod, branches: [], isSingle: true, isChallenge: true });
                return;
            }

            if (LESSON_TYPES.has(mod.type)) {
                // Start a new section
                if (current) sections.push(current);
                current = { head: mod, branches: [], isSingle: false, isChallenge: false };
                return;
            }

            // lab / quiz / applet / tool
            if (current) {
                current.branches.push(mod);
            } else {
                // Preamble: no lesson head yet
                current = { head: null, branches: [mod], isSingle: false, isChallenge: false };
            }
        });

        if (current) sections.push(current);

        // If a section has a head but zero branches, mark it as single node
        sections.forEach(s => {
            if (!s.isChallenge && s.branches.length === 0) s.isSingle = true;
        });

        return sections;
    }

    /**
     * Determine which sections are unlocked given current progress.
     *
     * Rule: The first section is always unlocked. Each subsequent section
     * unlocks when all modules in ALL previous sections are complete.
     *
     * Returns a Set of section indices that are unlocked.
     */
    function _computeUnlockedSections(sections) {
        // All sections unlocked — fog of war disabled
        const unlocked = new Set();
        sections.forEach((_, idx) => unlocked.add(idx));
        return unlocked;
    }

    // =========================================================================
    // RESUME / NEXT INCOMPLETE
    // =========================================================================

    /**
     * Find the next incomplete module id across all districts (hub resume).
     */
    function _findGlobalResume() {
        for (const district of ArcticData.districts) {
            for (const mod of district.modules) {
                if (!_isComplete(mod.id)) {
                    return { districtId: district.id, moduleId: mod.id, moduleHref: mod.href };
                }
            }
        }
        return null;
    }

    /**
     * Find the next incomplete module id within a district.
     * Returns the module object or null if everything is done.
     */
    function _findDistrictResume(district) {
        return district.modules.find(m => !_isComplete(m.id)) || null;
    }

    /**
     * Store the next module's href so ModuleProgress.complete() can
     * navigate there instead of returning to the course index page.
     * Called when a user clicks a module link from the Arctic district view.
     */
    function _stashNextModule(district, currentModId) {
        const mods = district.modules;
        const idx = mods.findIndex(m => m.id === currentModId);
        if (idx >= 0 && idx < mods.length - 1) {
            const next = mods[idx + 1];
            // Resolve href to absolute URL using current page as base (Arctic district page)
            const resolved = new URL(next.href, window.location.href).href;
            localStorage.setItem(ARCTIC_NEXT_KEY, JSON.stringify({
                href: resolved,
                title: next.title,
                districtId: district.id
            }));
        } else {
            // Last module in district — clear so completion returns to district page
            localStorage.removeItem(ARCTIC_NEXT_KEY);
        }
    }

    // =========================================================================
    // CSS INJECTION
    // =========================================================================

    /** Inject a <style> tag into <head>. Safe to call multiple times (idempotent). */
    function _injectStyles(css) {
        if (document.getElementById('ae-styles')) return;
        const tag = document.createElement('style');
        tag.id = 'ae-styles';
        tag.textContent = css;
        document.head.appendChild(tag);
    }

    // =========================================================================
    // SHARED DOM UTILITIES
    // =========================================================================

    /** Create an element with a class name and optional extra attributes. */
    function _el(tag, className, attrs) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        if (attrs) Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
        return el;
    }

    /** Build the snowfall layer and append flakes to the container. */
    function _buildSnowfall() {
        const layer = _el('div', 'ae-snowfall');
        const chars = ['\u2022', '\u00B7', '\u2219', '\u2605', '\u2B51'];
        for (let i = 0; i < FLAKE_COUNT; i++) {
            const flake = document.createElement('span');
            flake.className = 'ae-flake';
            flake.textContent = chars[Math.floor(Math.random() * chars.length)];
            flake.style.cssText = [
                `left:${(Math.random() * 100).toFixed(1)}%`,
                `font-size:${(4 + Math.random() * 8).toFixed(1)}px`,
                `opacity:${(0.15 + Math.random() * 0.40).toFixed(2)}`,
                `animation-duration:${(10 + Math.random() * 16).toFixed(1)}s`,
                `animation-delay:${(-(Math.random() * 24)).toFixed(1)}s`
            ].join(';');
            layer.appendChild(flake);
        }
        return layer;
    }

    /** Build the sticky page header. backHref=null omits the back button. */
    function _buildHeader(title, subtitle, backLabel, backHref) {
        const hdr  = _el('div', 'ae-header');
        const left = _el('div', 'ae-header-left');

        // Crystal/snowflake icon (no emoji — just geometric)
        const icon = _el('div', 'ae-header-icon');
        icon.textContent = '\u2745'; // Unicode snowflake asterism

        const meta  = _el('div', 'ae-header-meta');
        const ttl   = _el('div', 'ae-header-title');
        ttl.textContent = title;
        const sub   = _el('div', 'ae-header-sub');
        sub.textContent = subtitle;
        meta.appendChild(ttl);
        meta.appendChild(sub);
        left.appendChild(icon);
        left.appendChild(meta);

        const right = _el('div', 'ae-header-right');
        if (backHref) {
            const btn = document.createElement('a');
            btn.className = 'ae-btn';
            btn.href = backHref;
            btn.textContent = '\u2190 ' + backLabel; // left arrow
            right.appendChild(btn);
        }

        hdr.appendChild(left);
        hdr.appendChild(right);
        return hdr;
    }

    /** Build a faction-colored progress bar widget. */
    function _buildProgressBar(completed, total, faction) {
        const pct   = total > 0 ? Math.round((completed / total) * 100) : 0;
        const fc    = FACTION_COLOR[faction] || FACTION_COLOR.penguin;
        const wrap  = _el('div', 'ae-prog-bar-wrap');

        const row   = _el('div', 'ae-prog-bar-row');
        const lbl   = _el('span', 'ae-prog-bar-label');
        lbl.textContent = 'Progress';
        const cnt   = _el('span', 'ae-prog-bar-count');
        cnt.textContent = `${completed} / ${total} \u2014 ${pct}%`;
        row.appendChild(lbl);
        row.appendChild(cnt);

        const track = _el('div', 'ae-prog-bar-track');
        const fill  = _el('div', 'ae-prog-bar-fill');
        fill.style.width = pct + '%';
        fill.style.background = `linear-gradient(90deg, ${fc.dark}, ${fc.main})`;
        track.appendChild(fill);

        wrap.appendChild(row);
        wrap.appendChild(track);
        return { wrap, fill, cnt };
    }

    // =========================================================================
    // HUB RENDERER
    // =========================================================================

    /**
     * renderHub() — Entry point called by arctic/index.html.
     * Wipes document.body and builds the full hub UI.
     */
    function renderHub() {
        _loadProgress();

        // Run detection for ALL districts so the hub shows accurate progress
        for (const district of ArcticData.districts) {
            _autoDetectCompletions(district);
        }

        document.title = 'The Arctic \u2014 Hexworth Prime';
        _injectStyles(_getBaseCSS() + _getHubCSS());

        const body = document.body;
        body.innerHTML = '';

        body.appendChild(_buildSnowfall());

        const aurora = _el('div', 'ae-aurora');
        body.appendChild(aurora);

        body.appendChild(_buildHeader('The Arctic', 'Linux Content Hub', 'Dashboard', '../dashboard.html'));

        const main = _el('main', 'ae-main');

        main.appendChild(_buildHubHero());
        main.appendChild(_buildOverallProgressBar());
        main.appendChild(_buildFactionSection());
        main.appendChild(_buildProgressionDiagram());

        const footer = _el('div', 'ae-footer');
        footer.textContent = 'The Arctic \u2014 Hexworth Prime Linux Content Hub \u2014 Mayor Tux Presiding';
        main.appendChild(footer);

        body.appendChild(main);

        // Activate the first faction tab by default
        _activateFactionTab('penguin');
    }

    // -------------------------------------------------------------------------
    // Hub: Hero block
    // -------------------------------------------------------------------------

    function _buildHubHero() {
        const hero = _el('div', 'ae-hub-hero');

        // Tux placeholder (SVG inline or image fallback)
        const tuxWrap = _el('div', 'ae-tux-wrap');
        const tuxImg  = document.createElement('img');
        tuxImg.src    = 'assets/tux.svg';
        tuxImg.alt    = 'Tux the Penguin';
        tuxImg.className = 'ae-tux';
        // Fallback glyph if image fails
        tuxImg.onerror = () => {
            tuxImg.style.display = 'none';
            const glyph = _el('div', 'ae-tux-glyph');
            glyph.textContent = '\u25CF'; // filled circle stand-in
            tuxWrap.insertBefore(glyph, tuxImg);
        };
        const tuxLbl = _el('div', 'ae-tux-label');
        tuxLbl.textContent = 'Mayor Tux \u2014 Your Guide';
        tuxWrap.appendChild(tuxImg);
        tuxWrap.appendChild(tuxLbl);

        const h1 = document.createElement('h1');
        h1.className   = 'ae-hub-title';
        h1.textContent = 'The Arctic';

        const sub = _el('div', 'ae-hub-subtitle');
        sub.textContent = 'Linux Command Hub \u2014 Master Every Layer';

        hero.appendChild(tuxWrap);
        hero.appendChild(h1);
        hero.appendChild(sub);
        return hero;
    }

    // -------------------------------------------------------------------------
    // Hub: Overall progress bar + resume button
    // -------------------------------------------------------------------------

    function _buildOverallProgressBar() {
        const allMods   = ArcticData.districts.flatMap(d => d.modules);
        const total     = allMods.length;
        const completed = allMods.filter(m => _isComplete(m.id)).length;
        const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

        const wrap = _el('div', 'ae-overall-wrap');

        // Header row
        const row  = _el('div', 'ae-overall-row');
        const lbl  = _el('span', 'ae-overall-label');
        lbl.textContent = 'Overall Progress';
        const cnt  = _el('span', 'ae-overall-count');
        cnt.textContent = `${completed} / ${total} modules \u2014 ${pct}%`;
        row.appendChild(lbl);
        row.appendChild(cnt);

        // Progress bar
        const track = _el('div', 'ae-overall-track');
        const fill  = _el('div', 'ae-overall-fill');
        fill.style.width = pct + '%';
        track.appendChild(fill);

        wrap.appendChild(row);
        wrap.appendChild(track);

        // Resume button
        const resume = _findGlobalResume();
        if (resume && completed < total) {
            const district = ArcticData.getDistrict(resume.districtId);
            const btn = document.createElement('a');
            btn.className = 'ae-resume-btn';
            btn.href = `districts/${resume.districtId}/index.html`;
            btn.innerHTML = '\u25BA Continue \u2014 ' + (district ? district.name : resume.districtId);
            wrap.appendChild(btn);
        } else if (completed === total && total > 0) {
            const done = _el('div', 'ae-complete-badge');
            done.textContent = '\u2605 All districts complete \u2605';
            wrap.appendChild(done);
        }

        return wrap;
    }

    // -------------------------------------------------------------------------
    // Hub: Faction tabs + panels
    // -------------------------------------------------------------------------

    function _buildFactionSection() {
        const section = _el('div', 'ae-faction-section');

        const tabBar = _el('div', 'ae-faction-tabs');
        ArcticData.factions.forEach(faction => {
            tabBar.appendChild(_buildFactionTab(faction));
        });
        section.appendChild(tabBar);

        const panelWrap = _el('div', 'ae-faction-panels');
        panelWrap.id = 'ae-faction-panels';
        ArcticData.factions.forEach(faction => {
            panelWrap.appendChild(_buildFactionPanel(faction));
        });
        section.appendChild(panelWrap);

        return section;
    }

    function _buildFactionTab(faction) {
        const pct      = Math.round(ArcticData.getFactionCompletion(faction.id, _progress) * 100);
        const fc       = FACTION_COLOR[faction.id];

        const btn = _el('button', `ae-faction-tab ae-faction-tab--${faction.id}`);
        btn.id    = 'ae-tab-' + faction.id;
        btn.setAttribute('data-faction', faction.id);
        btn.setAttribute('aria-pressed', 'false');
        btn.style.setProperty('--fc-main',   fc.main);
        btn.style.setProperty('--fc-dim',    fc.dim);
        btn.style.setProperty('--fc-border', fc.border);

        const nameEl = _el('span', 'ae-tab-name');
        nameEl.textContent = faction.name;

        const pctEl = _el('span', 'ae-tab-pct');
        pctEl.textContent = pct + '%';

        btn.appendChild(nameEl);
        btn.appendChild(pctEl);
        btn.addEventListener('click', () => _activateFactionTab(faction.id));
        return btn;
    }

    function _getLockReason(faction) {
        const parent = ArcticData.getFaction(faction.unlockRequirement);
        if (!parent) return '';
        const pct = Math.round(ArcticData.getFactionCompletion(faction.unlockRequirement, _progress) * 100);
        return `Complete ${Math.round(faction.unlockThreshold * 100)}% of ${parent.name} to unlock (currently ${pct}%)`;
    }

    function _buildFactionPanel(faction) {
        const districts = ArcticData.getFactionDistricts(faction.id);
        const fc        = FACTION_COLOR[faction.id];

        const panel = _el('div', `ae-faction-panel ae-faction-panel--${faction.id}`);
        panel.id    = 'ae-panel-' + faction.id;
        panel.setAttribute('hidden', '');
        panel.style.setProperty('--fc-main',   fc.main);
        panel.style.setProperty('--fc-dim',    fc.dim);
        panel.style.setProperty('--fc-dark',   fc.dark);
        panel.style.setProperty('--fc-border', fc.border);

        // Faction header (shown for both locked and unlocked)
        const hdr = _el('div', 'ae-panel-hdr');
        const nm  = _el('div', 'ae-panel-name');
        nm.textContent = faction.name;
        const tl  = _el('div', 'ae-panel-tagline');
        tl.textContent = '\u201C' + faction.tagline + '\u201D';
        const ds  = _el('div', 'ae-panel-desc');
        ds.textContent = faction.description;
        hdr.appendChild(nm);
        hdr.appendChild(tl);
        hdr.appendChild(ds);

        panel.appendChild(hdr);

        // District grid — all districts always accessible (fog disabled)
        const grid = _el('div', 'ae-district-grid');
        districts.forEach(district => {
            grid.appendChild(_buildDistrictCard(district, true));
        });
        panel.appendChild(grid);

        return panel;
    }

    /**
     * Build a district card for the hub grid.
     * If factionUnlocked=false, the card is fogged: visible but desaturated + locked.
     */
    function _buildDistrictCard(district, factionUnlocked) {
        const completion = ArcticData.getDistrictCompletion(district.id, _progress);
        const pct        = Math.round(completion * 100);
        const completed  = district.modules.filter(m => _isComplete(m.id)).length;
        const total      = district.modules.length;
        const diffLabel  = DIFF_LABELS[district.difficulty] || '';
        const fc         = FACTION_COLOR[district.faction];

        const card = document.createElement('a');
        card.className = `ae-district-card ae-district-card--${district.faction}`;
        card.href      = `districts/${district.id}/index.html`;
        card.style.setProperty('--fc-main',   fc.main);
        card.style.setProperty('--fc-dim',    fc.dim);
        card.style.setProperty('--fc-dark',   fc.dark);
        card.style.setProperty('--fc-border', fc.border);

        // Fog of war disabled — all districts accessible
        // if (!factionUnlocked) { ... }

        // Top row: icon + badge
        const topRow  = _el('div', 'ae-card-top');
        const iconEl  = _el('span', 'ae-card-icon');
        iconEl.textContent = district.icon || '\u25CF';
        const badge   = _el('span', `ae-faction-badge ae-faction-badge--${district.faction}`);
        badge.textContent = ArcticData.getFaction(district.faction).name.split(' ')[0];
        topRow.appendChild(iconEl);
        topRow.appendChild(badge);

        // Name + description
        const nameEl = _el('div', 'ae-card-name');
        nameEl.textContent = district.name;
        const descEl = _el('div', 'ae-card-desc');
        descEl.textContent = district.description;

        // Meta row: difficulty + count
        const metaRow = _el('div', 'ae-card-meta');
        const diffEl  = _el('span', `ae-card-diff ae-card-diff--${district.faction}`);
        diffEl.textContent = diffLabel;
        const cntEl   = _el('span', 'ae-card-count');
        cntEl.textContent = total + ' items';
        metaRow.appendChild(diffEl);
        metaRow.appendChild(cntEl);

        // Progress bar
        const track = _el('div', 'ae-card-track');
        const fill  = _el('div', 'ae-card-fill');
        fill.style.width      = pct + '%';
        fill.style.background = `linear-gradient(90deg, ${fc.dark}, ${fc.main})`;
        track.appendChild(fill);

        const progLbl = _el('div', 'ae-card-prog-label');
        progLbl.textContent = factionUnlocked
            ? `${completed}/${total} \u2014 ${pct}%`
            : '\u25A0 \u25A0 \u25A0 locked';

        card.appendChild(topRow);
        card.appendChild(nameEl);
        card.appendChild(descEl);
        card.appendChild(metaRow);
        card.appendChild(track);
        card.appendChild(progLbl);

        return card;
    }

    function _activateFactionTab(factionId) {
        document.querySelectorAll('.ae-faction-tab').forEach(t => {
            t.setAttribute('aria-pressed', 'false');
            t.classList.remove('ae-faction-tab--active');
        });
        document.querySelectorAll('.ae-faction-panel').forEach(p => {
            p.setAttribute('hidden', '');
        });
        const tab = document.getElementById('ae-tab-' + factionId);
        if (tab) {
            tab.setAttribute('aria-pressed', 'true');
            tab.classList.add('ae-faction-tab--active');
        }
        const panel = document.getElementById('ae-panel-' + factionId);
        if (panel) panel.removeAttribute('hidden');
    }

    // -------------------------------------------------------------------------
    // Hub: Progression diagram
    // -------------------------------------------------------------------------

    function _buildProgressionDiagram() {
        const wrap = _el('div', 'ae-progression');
        const lbl  = _el('div', 'ae-section-label');
        lbl.textContent = 'Progression Path';

        const flow = _el('div', 'ae-prog-flow');
        ArcticData.factions.forEach((faction, idx) => {
            const fc    = FACTION_COLOR[faction.id];
            const node  = _el('span', 'ae-prog-node');
            node.textContent = faction.name;
            node.style.setProperty('--fc-main',   fc.main);
            node.style.setProperty('--fc-dim',    fc.dim);
            node.style.setProperty('--fc-border', fc.border);
            flow.appendChild(node);
            if (idx < ArcticData.factions.length - 1) {
                const arrow = _el('span', 'ae-prog-arrow');
                arrow.textContent = '\u2192'; // right arrow
                flow.appendChild(arrow);
            }
        });

        const note = _el('div', 'ae-prog-note');
        note.textContent = "You can't harden what you can't administer. You can't break what you can't defend.";

        wrap.appendChild(lbl);
        wrap.appendChild(flow);
        wrap.appendChild(note);
        return wrap;
    }

    // =========================================================================
    // DISTRICT RENDERER
    // =========================================================================

    /**
     * renderDistrict(districtId) — Entry point called by each district shell page.
     * Wipes document.body and builds the full district UI.
     */
    function renderDistrict(districtId) {
        _loadProgress();

        const district = ArcticData.getDistrict(districtId);
        if (!district) {
            document.body.innerHTML = `<p style="color:#f55;padding:2rem;font-family:monospace">
                District not found: ${districtId}</p>`;
            return;
        }

        _autoDetectCompletions(district);

        const faction = ArcticData.getFaction(district.faction);
        document.title = district.name + ' \u2014 The Arctic';
        _injectStyles(_getBaseCSS() + _getDistrictCSS());

        const fc   = FACTION_COLOR[district.faction] || FACTION_COLOR.penguin;
        const body = document.body;
        body.innerHTML = '';
        body.style.setProperty('--fc-main',   fc.main);
        body.style.setProperty('--fc-dim',    fc.dim);
        body.style.setProperty('--fc-dark',   fc.dark);
        body.style.setProperty('--fc-border', fc.border);

        body.appendChild(_buildSnowfall());

        const aurora = _el('div', 'ae-aurora');
        body.appendChild(aurora);

        body.appendChild(_buildHeader(
            'The Arctic',
            'Linux Content Hub',
            'Back to Hub',
            '../../index.html'
        ));

        const main = _el('main', 'ae-main ae-district-main');
        main.id = 'ae-district-main';

        main.appendChild(_buildDistrictHero(district, faction, fc));

        // Sandbox terminal — render if SandboxLauncher is available
        if (typeof SandboxLauncher !== 'undefined') {
            const sandboxMount = _el('div', 'ae-sandbox-mount');
            const labId = district.sandboxLabId || 'arctic';
            SandboxLauncher.renderButton(sandboxMount, labId);
            main.appendChild(sandboxMount);
        }

        main.appendChild(_buildModuleFlow(district, fc));

        const footer = _el('div', 'ae-footer');
        footer.textContent = `${district.name} \u2014 ${faction ? faction.name : ''} \u2014 The Arctic`;
        main.appendChild(footer);

        body.appendChild(main);
    }

    // -------------------------------------------------------------------------
    // District: Hero block
    // -------------------------------------------------------------------------

    function _buildDistrictHero(district, faction, fc) {
        const completed = district.modules.filter(m => _isComplete(m.id)).length;
        const total     = district.modules.length;
        const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

        const hero = _el('div', `ae-district-hero ae-district-hero--${district.faction}`);

        // Left: big icon
        const iconCol = _el('div', 'ae-dhero-icon');
        iconCol.textContent = district.icon || '\u25CF';

        // Right: content
        const content = _el('div', 'ae-dhero-content');

        const badge = _el('span', `ae-faction-badge ae-faction-badge--${district.faction}`);
        badge.textContent = faction ? faction.name : district.faction;

        const h1 = document.createElement('h1');
        h1.className   = 'ae-dhero-name';
        h1.textContent = district.name;

        const desc = _el('p', 'ae-dhero-desc');
        desc.textContent = district.description;

        const lore = _el('p', 'ae-dhero-lore');
        lore.textContent = district.lore || '';

        // Difficulty badge
        const diff = _el('span', `ae-dhero-diff ae-dhero-diff--${district.faction}`);
        diff.textContent = (DIFF_LABELS[district.difficulty] || '') + ' difficulty';

        // Progress bar
        const { wrap: progWrap, fill: progFill, cnt: progCnt } = _buildProgressBar(completed, total, district.faction);
        progWrap.className += ' ae-dhero-progress';
        progWrap.id = 'ae-dhero-prog-wrap';
        // Store refs for live updates
        progFill.id = 'ae-dhero-prog-fill';
        progCnt.id  = 'ae-dhero-prog-cnt';

        // Resume button within hero
        const resumeMod = _findDistrictResume(district);
        if (resumeMod && completed < total) {
            const rBtn = _el('button', 'ae-district-resume-btn');
            rBtn.textContent = '\u25BA Continue \u2014 ' + resumeMod.title;
            rBtn.addEventListener('click', () => {
                const target = document.getElementById('ae-node-' + resumeMod.id);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    target.classList.add('ae-node--highlight');
                    setTimeout(() => target.classList.remove('ae-node--highlight'), 2200);
                }
            });
            content.appendChild(badge);
            content.appendChild(h1);
            content.appendChild(desc);
            content.appendChild(lore);
            content.appendChild(diff);
            content.appendChild(progWrap);
            content.appendChild(rBtn);
        } else {
            content.appendChild(badge);
            content.appendChild(h1);
            content.appendChild(desc);
            content.appendChild(lore);
            content.appendChild(diff);
            content.appendChild(progWrap);
        }

        hero.appendChild(iconCol);
        hero.appendChild(content);
        return hero;
    }

    // -------------------------------------------------------------------------
    // District: Module flow (the main vertical path with forks)
    // -------------------------------------------------------------------------

    function _buildModuleFlow(district, fc) {
        const wrap = _el('div', 'ae-flow-wrap');

        const lbl = _el('div', 'ae-section-label');
        lbl.textContent = 'Learning Path';
        wrap.appendChild(lbl);

        const sections      = _buildSections(district.modules);
        const unlockedSecs  = _computeUnlockedSections(sections);

        const path = _el('div', 'ae-flow-path');

        sections.forEach((sec, secIdx) => {
            const isUnlocked = unlockedSecs.has(secIdx);

            if (sec.isChallenge) {
                path.appendChild(_buildChallengeNode(sec.head, district, isUnlocked, secIdx, sections));
                return;
            }

            // Section: head (lesson) + optional branches
            const secWrap = _el('div', `ae-section-wrap${isUnlocked ? '' : ' ae-section-wrap--fog'}`);
            secWrap.setAttribute('data-section', secIdx);

            if (sec.head) {
                secWrap.appendChild(_buildLessonNode(sec.head, district, isUnlocked));
            }

            if (sec.branches.length > 0) {
                // If there are multiple branches, render fork layout
                secWrap.appendChild(_buildBranchGroup(sec.branches, district, isUnlocked, sec.head));
            }

            path.appendChild(secWrap);

            // Connector between sections (not after last)
            if (secIdx < sections.length - 1) {
                const conn = _el('div', 'ae-path-connector');
                const line = _el('div', 'ae-path-line');
                conn.appendChild(line);
                path.appendChild(conn);
            }
        });

        wrap.appendChild(path);
        return wrap;
    }

    /** Build a single lesson (module-type) node. */
    function _buildLessonNode(mod, district, isUnlocked) {
        const done = _isComplete(mod.id);
        const cls  = [
            'ae-node',
            'ae-node--lesson',
            `ae-node--${district.faction}`,
            done       ? 'ae-node--done'   : '',
            !isUnlocked ? 'ae-node--fog'   : ''
        ].filter(Boolean).join(' ');

        const node = _el('div', cls);
        node.id    = 'ae-node-' + mod.id;

        _populateNode(node, mod, district, isUnlocked, 'lesson');
        return node;
    }

    /** Build a group of branch nodes (labs, quizzes, applets, tools). */
    function _buildBranchGroup(branches, district, isUnlocked, head) {
        const group = _el('div', 'ae-branch-group');

        // Fork indicator line (only if more than one branch)
        if (branches.length > 1) {
            const forkBar = _el('div', 'ae-fork-bar');
            group.appendChild(forkBar);
        }

        const branchRow = _el('div', `ae-branch-row ae-branch-row--${branches.length > 1 ? 'multi' : 'single'}`);

        branches.forEach(mod => {
            const done = _isComplete(mod.id);
            const cls  = [
                'ae-node',
                'ae-node--branch',
                `ae-node--${district.faction}`,
                `ae-node--type-${mod.type}`,
                done       ? 'ae-node--done' : '',
                !isUnlocked ? 'ae-node--fog' : ''
            ].filter(Boolean).join(' ');

            const node = _el('div', cls);
            node.id    = 'ae-node-' + mod.id;

            _populateNode(node, mod, district, isUnlocked, 'branch');
            branchRow.appendChild(node);
        });

        group.appendChild(branchRow);
        return group;
    }

    /** Build a challenge (game/review) node — standalone, special styling. */
    function _buildChallengeNode(mod, district, isUnlocked, secIdx, sections) {
        // Count how many total modules precede this challenge
        const precedingCount = sections
            .slice(0, secIdx)
            .reduce((sum, s) => {
                const headCount = s.head ? 1 : 0;
                return sum + headCount + s.branches.length;
            }, 0);

        const done = _isComplete(mod.id);
        const cls  = [
            'ae-node',
            'ae-node--challenge',
            `ae-node--${district.faction}`,
            done       ? 'ae-node--done' : '',
            !isUnlocked ? 'ae-node--fog' : ''
        ].filter(Boolean).join(' ');

        const node = _el('div', cls);
        node.id    = 'ae-node-' + mod.id;

        if (!isUnlocked) {
            // Fog state: show as mystery
            const badge = _el('div', 'ae-challenge-badge');
            badge.textContent = '\u25B2 CHALLENGE';
            const lockedTitle = _el('div', 'ae-node-title ae-node-title--fog');
            lockedTitle.textContent = '??? \u2014 Unlocks after ' + precedingCount + ' modules';
            node.appendChild(badge);
            node.appendChild(lockedTitle);
        } else {
            const badge = _el('div', 'ae-challenge-badge');
            badge.textContent = '\u25B2 CHALLENGE';
            _populateNode(node, mod, district, isUnlocked, 'challenge');
            node.insertBefore(badge, node.firstChild);
        }

        return node;
    }

    /**
     * Populate a node element with its content:
     *   - Type badge
     *   - Title (link if unlocked, text if fogged)
     *   - Completion stamp + toggle button
     */
    function _populateNode(node, mod, district, isUnlocked, nodeRole) {
        const done     = _isComplete(mod.id);
        const meta     = TYPE_META[mod.type] || TYPE_META.module;

        // Type badge
        const typeBadge = _el('span', `ae-node-type-badge ae-node-type-badge--${mod.type}`);
        typeBadge.textContent = meta.label;

        // Title
        const titleEl = _el('div', 'ae-node-title');
        if (isUnlocked) {
            const link = document.createElement('a');
            link.className = `ae-node-link ae-node-link--${district.faction}`;
            link.href      = mod.href;
            link.target    = '_blank';
            link.rel       = 'noopener';
            link.textContent = mod.title;
            link.addEventListener('click', () => _stashNextModule(district, mod.id));
            titleEl.appendChild(link);
        } else {
            titleEl.textContent = mod.title;
            titleEl.classList.add('ae-node-title--fog');
        }

        // Completion stamp (read-only — earned by finishing the module)
        const footer = _el('div', 'ae-node-footer');

        if (done) {
            const stamp = _el('span', 'ae-node-stamp');
            stamp.textContent = '\u2713 Complete';
            footer.appendChild(stamp);
        }

        node.appendChild(typeBadge);
        node.appendChild(titleEl);
        node.appendChild(footer);
    }

    /**
     * After a toggle, recompute which sections are unlocked and update fog CSS classes.
     * Does NOT re-render — mutates existing DOM in place.
     */
    function _refreshDistrictFog(district) {
        const sections     = _buildSections(district.modules);
        const unlockedSecs = _computeUnlockedSections(sections);

        sections.forEach((sec, secIdx) => {
            const unlocked = unlockedSecs.has(secIdx);
            const allMods  = sec.head ? [sec.head, ...sec.branches] : [...sec.branches];

            allMods.forEach(mod => {
                const node = document.getElementById('ae-node-' + mod.id);
                if (!node) return;
                node.classList.toggle('ae-node--fog', !unlocked);

                // Update link vs plain text in title
                const titleEl = node.querySelector('.ae-node-title');
                if (titleEl) {
                    if (unlocked && !titleEl.querySelector('a')) {
                        // Upgrade to a link
                        const link = document.createElement('a');
                        link.className   = `ae-node-link ae-node-link--${district.faction}`;
                        link.href        = mod.href;
                        link.target      = '_blank';
                        link.rel         = 'noopener';
                        link.textContent = mod.title;
                        link.addEventListener('click', () => _stashNextModule(district, mod.id));
                        titleEl.textContent = '';
                        titleEl.classList.remove('ae-node-title--fog');
                        titleEl.appendChild(link);
                    } else if (!unlocked && titleEl.querySelector('a')) {
                        // Downgrade to plain text
                        titleEl.textContent = mod.title;
                        titleEl.classList.add('ae-node-title--fog');
                    }
                }
            });

            // Update section wrapper fog class
            const secWrap = document.querySelector(`[data-section="${secIdx}"]`);
            if (secWrap) secWrap.classList.toggle('ae-section-wrap--fog', !unlocked);
        });
    }

    /** Update the hero progress bar without re-rendering. */
    function _refreshDistrictProgress(district) {
        const completed = district.modules.filter(m => _isComplete(m.id)).length;
        const total     = district.modules.length;
        const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

        const fillEl = document.getElementById('ae-dhero-prog-fill');
        const cntEl  = document.getElementById('ae-dhero-prog-cnt');
        if (fillEl) fillEl.style.width = pct + '%';
        if (cntEl)  cntEl.textContent  = `${completed} / ${total} \u2014 ${pct}%`;
    }

    // =========================================================================
    // BASE CSS (shared by hub and district)
    // =========================================================================

    function _getBaseCSS() {
        return `
/* ============================================================
   ArcticEngine v3.0 — Base Styles
   ============================================================ */

*, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

:root {
    --ae-bg:          #0a1628;
    --ae-cyan:        #00d4ff;
    --ae-cyan-dim:    rgba(0,212,255,0.09);
    --ae-cyan-border: rgba(0,212,255,0.14);
    --ae-text:        #c8dff0;
    --ae-text-muted:  #5a8aaa;
    --ae-text-dim:    #3a6a8a;
    --ae-type-module: #5a9ac0;
    --ae-type-lab:    #3ab890;
    --ae-type-applet: #9a7ad0;
    --ae-type-quiz:   #c0a030;
    --ae-type-tool:   #c07030;
    --ae-type-game:   #d0a020;
    --ae-type-review: #30a0b0;
}

body {
    min-height: 100vh;
    background: var(--ae-bg);
    font-family: 'Courier New', Courier, monospace;
    color: var(--ae-text);
    overflow-x: hidden;
}

/* --- Aurora ambient layer --- */
.ae-aurora {
    position: fixed;
    inset: 0;
    background:
        radial-gradient(ellipse at 15% 0%,  rgba(0,212,255,0.07) 0%, transparent 50%),
        radial-gradient(ellipse at 85% 5%,  rgba(0,160,200,0.05) 0%, transparent 40%),
        radial-gradient(ellipse at 50% 100%,rgba(10,30,70,0.80)  0%, transparent 60%);
    pointer-events: none;
    z-index: 0;
}

/* --- Snowfall --- */
.ae-snowfall {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 1;
    overflow: hidden;
}

.ae-flake {
    position: absolute;
    top: -14px;
    color: rgba(180,220,255,0.5);
    animation: ae-fall linear infinite;
}

@keyframes ae-fall {
    from { transform: translateY(-14px) rotate(0deg);   opacity: 0.9; }
    to   { transform: translateY(101vh) rotate(360deg); opacity: 0.1; }
}

/* --- Sticky header --- */
.ae-header {
    position: sticky;
    top: 0;
    z-index: 200;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 13px 28px;
    background: rgba(4,12,30,0.93);
    border-bottom: 1px solid var(--ae-cyan-border);
    backdrop-filter: blur(16px);
}

.ae-header-left {
    display: flex;
    align-items: center;
    gap: 14px;
}

.ae-header-icon {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.15rem;
    color: var(--ae-cyan);
    background: var(--ae-cyan-dim);
    border: 1px solid var(--ae-cyan-border);
    border-radius: 6px;
}

.ae-header-title {
    font-size: 0.85rem;
    color: var(--ae-cyan);
    letter-spacing: 0.18em;
    text-transform: uppercase;
}

.ae-header-sub {
    font-size: 0.48rem;
    color: var(--ae-text-muted);
    letter-spacing: 0.25em;
    text-transform: uppercase;
    margin-top: 1px;
}

.ae-btn {
    display: inline-block;
    padding: 7px 15px;
    border: 1px solid rgba(0,212,255,0.20);
    border-radius: 4px;
    color: var(--ae-text-muted);
    font-size: 0.60rem;
    letter-spacing: 0.08em;
    text-decoration: none;
    font-family: inherit;
    background: transparent;
    cursor: pointer;
    transition: border-color 0.2s, color 0.2s;
}
.ae-btn:hover {
    border-color: rgba(0,212,255,0.45);
    color: var(--ae-cyan);
}

/* --- Main wrapper --- */
.ae-main {
    position: relative;
    z-index: 2;
    max-width: 960px;
    margin: 0 auto;
    padding: 44px 24px 80px;
}

/* --- Section label --- */
.ae-section-label {
    font-size: 0.48rem;
    letter-spacing: 0.40em;
    color: var(--ae-text-dim);
    text-transform: uppercase;
    margin-bottom: 20px;
}

/* --- Shared progress bar widget --- */
.ae-prog-bar-wrap { }

.ae-prog-bar-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 7px;
}

.ae-prog-bar-label {
    font-size: 0.52rem;
    color: var(--ae-text-muted);
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.ae-prog-bar-count {
    font-size: 0.52rem;
    color: var(--ae-text-dim);
}

.ae-prog-bar-track {
    height: 5px;
    background: rgba(0,212,255,0.07);
    border-radius: 3px;
    overflow: hidden;
    border: 1px solid rgba(0,212,255,0.09);
}

.ae-prog-bar-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.45s ease;
}

/* --- Faction badge pill --- */
.ae-faction-badge {
    display: inline-block;
    padding: 2px 10px;
    border-radius: 3px;
    font-size: 0.44rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
}
.ae-faction-badge--penguin {
    background: rgba(0,180,230,0.10);
    border: 1px solid rgba(0,180,230,0.20);
    color: #5ab8e0;
}
.ae-faction-badge--parrot {
    background: rgba(0,160,120,0.10);
    border: 1px solid rgba(0,160,120,0.20);
    color: #3ab89a;
}
.ae-faction-badge--dragon {
    background: rgba(180,40,40,0.10);
    border: 1px solid rgba(180,40,40,0.20);
    color: #c06060;
}

/* --- Footer --- */
.ae-footer {
    text-align: center;
    padding: 30px 20px 10px;
    font-size: 0.44rem;
    color: #2a4a6a;
    letter-spacing: 0.15em;
    text-transform: uppercase;
}

@media (max-width: 640px) {
    .ae-main   { padding: 24px 14px 60px; }
    .ae-header { padding: 12px 16px; }
}`;
    }

    // =========================================================================
    // HUB CSS
    // =========================================================================

    function _getHubCSS() {
        return `
/* ============================================================
   ArcticEngine v3.0 — Hub Styles
   ============================================================ */

/* Hub hero */
.ae-hub-hero {
    text-align: center;
    margin-bottom: 40px;
}

.ae-tux-wrap {
    display: inline-block;
    margin-bottom: 18px;
}

.ae-tux {
    width: 96px;
    display: block;
    margin: 0 auto;
    filter: drop-shadow(0 0 20px rgba(0,212,255,0.20));
    transition: filter 0.3s;
}
.ae-tux:hover {
    filter: drop-shadow(0 0 32px rgba(0,212,255,0.45));
}

.ae-tux-glyph {
    font-size: 3rem;
    color: var(--ae-cyan);
    opacity: 0.5;
}

.ae-tux-label {
    font-size: 0.46rem;
    color: var(--ae-text-dim);
    letter-spacing: 0.28em;
    text-transform: uppercase;
    margin-top: 8px;
}

.ae-hub-title {
    font-size: 2.4rem;
    color: var(--ae-cyan);
    letter-spacing: 0.20em;
    text-transform: uppercase;
    text-shadow: 0 0 40px rgba(0,212,255,0.28);
    margin-bottom: 8px;
}

.ae-hub-subtitle {
    font-size: 0.63rem;
    color: var(--ae-text-dim);
    letter-spacing: 0.22em;
    text-transform: uppercase;
    margin-bottom: 30px;
}

/* Overall progress block */
.ae-overall-wrap {
    background: var(--ae-cyan-dim);
    border: 1px solid var(--ae-cyan-border);
    border-radius: 8px;
    padding: 20px 24px;
    margin-bottom: 44px;
}

.ae-overall-row {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 8px;
}

.ae-overall-label {
    font-size: 0.55rem;
    color: var(--ae-text-muted);
    letter-spacing: 0.14em;
    text-transform: uppercase;
}

.ae-overall-count {
    font-size: 0.55rem;
    color: var(--ae-text-dim);
}

.ae-overall-track {
    height: 6px;
    background: rgba(0,212,255,0.07);
    border-radius: 3px;
    overflow: hidden;
    border: 1px solid rgba(0,212,255,0.09);
    margin-bottom: 16px;
}

.ae-overall-fill {
    height: 100%;
    background: linear-gradient(90deg, #0077aa, #00d4ff);
    border-radius: 3px;
    transition: width 0.5s ease;
}

.ae-resume-btn {
    display: inline-block;
    padding: 8px 20px;
    background: rgba(0,212,255,0.08);
    border: 1px solid rgba(0,212,255,0.22);
    border-radius: 4px;
    color: var(--ae-cyan);
    font-size: 0.62rem;
    letter-spacing: 0.08em;
    text-decoration: none;
    font-family: inherit;
    transition: background 0.2s, border-color 0.2s;
    cursor: pointer;
}
.ae-resume-btn:hover {
    background: rgba(0,212,255,0.14);
    border-color: rgba(0,212,255,0.40);
}

.ae-complete-badge {
    font-size: 0.62rem;
    color: #3ac880;
    letter-spacing: 0.10em;
    text-align: center;
    padding-top: 8px;
}

/* Faction tabs */
.ae-faction-section { margin-bottom: 44px; }

.ae-faction-tabs {
    display: flex;
    gap: 3px;
    margin-bottom: 0;
    border-bottom: 1px solid var(--ae-cyan-border);
}

.ae-faction-tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    padding: 14px 10px;
    background: rgba(0,212,255,0.025);
    border: 1px solid rgba(0,212,255,0.07);
    border-bottom: none;
    border-radius: 6px 6px 0 0;
    cursor: pointer;
    font-family: inherit;
    color: var(--ae-text-muted);
    transition: background 0.2s, border-color 0.2s;
}
.ae-faction-tab:hover:not(.ae-faction-tab--locked) {
    background: rgba(0,212,255,0.06);
}

/* Active tab uses the faction color variable set inline on the button */
.ae-faction-tab--active {
    background: var(--fc-dim, rgba(0,212,255,0.08));
    border-color: var(--fc-border, rgba(0,212,255,0.18));
    color: var(--ae-text);
}

.ae-faction-tab--locked {
    opacity: 0.42;
    cursor: default;
}

.ae-tab-name {
    font-size: 0.52rem;
    letter-spacing: 0.12em;
    text-transform: uppercase;
}

.ae-tab-pct {
    font-size: 0.48rem;
    color: var(--ae-text-dim);
}

/* Faction panels */
.ae-faction-panels {
    background: rgba(0,4,18,0.45);
    border: 1px solid var(--ae-cyan-border);
    border-top: none;
    border-radius: 0 0 9px 9px;
    padding: 30px 24px;
    min-height: 200px;
}

.ae-faction-panel[hidden] { display: none; }

/* Panel header */
.ae-panel-hdr { margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid rgba(0,212,255,0.07); }
.ae-panel-hdr--locked { opacity: 0.80; }

.ae-panel-name {
    font-size: 0.9rem;
    color: var(--ae-text);
    letter-spacing: 0.15em;
    text-transform: uppercase;
    margin-bottom: 4px;
}

.ae-panel-tagline {
    font-style: italic;
    font-size: 0.63rem;
    color: var(--ae-text-muted);
    margin-bottom: 10px;
}

.ae-panel-desc {
    font-size: 0.60rem;
    color: var(--ae-text-dim);
    line-height: 1.75;
    max-width: 600px;
    margin-bottom: 12px;
}

/* Lock gate bar */
.ae-lock-gate { margin-top: 14px; }

.ae-lock-gate-msg {
    font-size: 0.54rem;
    color: #3a6a8a;
    letter-spacing: 0.06em;
    margin-bottom: 8px;
}

.ae-lock-track {
    height: 4px;
    background: rgba(0,212,255,0.06);
    border-radius: 3px;
    overflow: hidden;
    max-width: 300px;
}

.ae-lock-fill {
    height: 100%;
    border-radius: 3px;
    transition: width 0.45s;
}

/* District grid */
.ae-district-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 14px;
}

/* District cards */
.ae-district-card {
    display: block;
    text-decoration: none;
    padding: 18px;
    border-radius: 8px;
    border: 1px solid var(--fc-border, rgba(0,212,255,0.12));
    background: var(--fc-dim, rgba(0,212,255,0.04));
    position: relative;
    overflow: hidden;
    transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
}

/* Top accent line per faction */
.ae-district-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--fc-dark, #1a6a9a), var(--fc-main, #00d4ff));
    opacity: 0.7;
    transition: opacity 0.2s;
}

.ae-district-card:hover:not(.ae-district-card--fogged) {
    transform: translateY(-3px);
    box-shadow: 0 6px 24px rgba(0,0,0,0.30);
    border-color: var(--fc-main, #00d4ff);
}
.ae-district-card:hover:not(.ae-district-card--fogged)::before {
    opacity: 1;
}

/* Fogged (locked faction) state */
.ae-district-card--fogged {
    filter: saturate(0.35) brightness(0.65);
    cursor: not-allowed;
    pointer-events: auto;
}

.ae-card-top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
}

.ae-card-icon {
    font-size: 1.55rem;
    line-height: 1;
}

.ae-card-name {
    font-size: 0.70rem;
    color: #a8cfe0;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin-bottom: 6px;
}

.ae-card-desc {
    font-size: 0.55rem;
    color: var(--ae-text-dim);
    line-height: 1.68;
    margin-bottom: 14px;
}

.ae-card-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.ae-card-diff {
    font-size: 0.44rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 2px 8px;
    border-radius: 3px;
    background: var(--fc-dim, rgba(0,212,255,0.06));
    border: 1px solid var(--fc-border, rgba(0,212,255,0.12));
    color: var(--fc-main, #00d4ff);
}

.ae-card-count {
    font-size: 0.46rem;
    color: var(--ae-text-dim);
}

.ae-card-track {
    height: 4px;
    background: rgba(0,212,255,0.06);
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 6px;
}

.ae-card-fill {
    height: 100%;
    border-radius: 2px;
    transition: width 0.45s;
}

.ae-card-prog-label {
    font-size: 0.44rem;
    color: var(--ae-text-dim);
    text-align: right;
}

/* Progression diagram */
.ae-progression {
    text-align: center;
    margin-bottom: 20px;
    padding: 24px 20px;
    background: rgba(0,212,255,0.025);
    border: 1px solid rgba(0,212,255,0.07);
    border-radius: 8px;
}

.ae-prog-flow {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 14px;
}

.ae-prog-node {
    padding: 8px 18px;
    border-radius: 4px;
    font-size: 0.54rem;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    background: var(--fc-dim);
    border: 1px solid var(--fc-border);
    color: var(--fc-main);
}

.ae-prog-arrow {
    color: var(--ae-text-dim);
    font-size: 0.9rem;
}

.ae-prog-note {
    font-size: 0.52rem;
    color: var(--ae-text-dim);
    font-style: italic;
}

@media (max-width: 600px) {
    .ae-faction-tabs     { flex-direction: column; border-bottom: none; }
    .ae-faction-tab      { flex-direction: row; justify-content: space-between; border-radius: 5px; border-bottom: 1px solid rgba(0,212,255,0.07); }
    .ae-district-grid    { grid-template-columns: 1fr; }
    .ae-hub-title        { font-size: 1.7rem; }
    .ae-prog-flow        { flex-direction: column; gap: 6px; }
    .ae-prog-arrow       { transform: rotate(90deg); display: inline-block; }
}`;
    }

    // =========================================================================
    // DISTRICT CSS
    // =========================================================================

    function _getDistrictCSS() {
        return `
/* ============================================================
   ArcticEngine v3.0 — District Styles
   ============================================================ */

.ae-district-main { max-width: 860px; }

/* District hero */
.ae-district-hero {
    display: flex;
    gap: 26px;
    align-items: flex-start;
    padding: 28px;
    border-radius: 10px;
    margin-bottom: 44px;
    border: 1px solid var(--fc-border);
    background: var(--fc-dim);
    position: relative;
    overflow: hidden;
}

/* Top accent line */
.ae-district-hero::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 2px;
    background: linear-gradient(90deg, var(--fc-dark), var(--fc-main));
}

.ae-dhero-icon {
    font-size: 3.2rem;
    flex-shrink: 0;
    line-height: 1;
    padding-top: 4px;
}

.ae-dhero-content { flex: 1; }

.ae-dhero-name {
    font-size: 1.4rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--ae-text);
    margin: 8px 0 10px;
}

.ae-dhero-desc {
    font-size: 0.64rem;
    color: var(--ae-text-dim);
    line-height: 1.72;
    margin-bottom: 8px;
}

.ae-dhero-lore {
    font-size: 0.58rem;
    font-style: italic;
    color: #2a5070;
    line-height: 1.65;
    margin-bottom: 16px;
}

.ae-dhero-diff {
    display: inline-block;
    font-size: 0.44rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 2px 10px;
    border-radius: 3px;
    margin-bottom: 16px;
    background: var(--fc-dim);
    border: 1px solid var(--fc-border);
    color: var(--fc-main);
}

.ae-dhero-progress { margin-bottom: 14px; }

.ae-district-resume-btn {
    display: inline-block;
    padding: 8px 18px;
    background: var(--fc-dim);
    border: 1px solid var(--fc-main);
    border-radius: 4px;
    color: var(--fc-main);
    font-size: 0.62rem;
    letter-spacing: 0.08em;
    font-family: inherit;
    cursor: pointer;
    transition: background 0.2s;
}
.ae-district-resume-btn:hover {
    background: rgba(0,212,255,0.12);
}

/* ============================================================
   Flow path — vertical node trail
   ============================================================ */

.ae-flow-wrap { margin-bottom: 40px; }

.ae-flow-path {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0;
}

/* Connector between sections */
.ae-path-connector {
    display: flex;
    justify-content: center;
    padding: 4px 0;
}

.ae-path-line {
    width: 2px;
    height: 32px;
    background: linear-gradient(to bottom, var(--fc-dark, #1a6a9a), transparent);
    opacity: 0.5;
}

/* Section wrapper */
.ae-section-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
}

/* Fogged section: dim + blur, smooth transition */
.ae-section-wrap--fog .ae-node {
    filter: saturate(0.25) brightness(0.60);
    pointer-events: none;
}
.ae-section-wrap--fog .ae-node-link {
    pointer-events: none;
}

/* ============================================================
   Node styles
   ============================================================ */

.ae-node {
    width: 100%;
    max-width: 600px;
    padding: 14px 18px;
    border-radius: 7px;
    border: 1px solid var(--fc-border);
    background: var(--fc-dim);
    position: relative;
    transition:
        filter 0.35s ease,
        opacity 0.35s ease,
        box-shadow 0.2s ease,
        border-color 0.2s ease;
    overflow: hidden;
}

/* Left accent stripe */
.ae-node::before {
    content: '';
    position: absolute;
    top: 0; bottom: 0; left: 0;
    width: 3px;
    background: linear-gradient(to bottom, var(--fc-main), var(--fc-dark));
    opacity: 0.6;
    border-radius: 7px 0 0 7px;
}

/* Lesson nodes: wider, top-of-section prominence */
.ae-node--lesson {
    background: rgba(0,212,255,0.04);
    border-color: var(--fc-border);
    margin: 0 auto;
}

/* Branch nodes: slightly smaller visual weight */
.ae-node--branch {
    background: rgba(0,0,20,0.25);
    border-color: rgba(255,255,255,0.06);
    flex: 1;
    min-width: 200px;
}

/* Hover states (non-fogged) */
.ae-node:not(.ae-node--fog):hover {
    border-color: var(--fc-main);
    box-shadow: 0 4px 20px rgba(0,0,0,0.28);
}

/* Done node */
.ae-node--done {
    background: rgba(0,200,100,0.04);
    border-color: rgba(0,200,100,0.20);
    opacity: 0.75;
}
.ae-node--done::before {
    background: linear-gradient(to bottom, #3ac880, #1a7840);
}

/* Fog node (handled via parent .ae-section-wrap--fog,
   but also settable directly for challenge nodes) */
.ae-node--fog {
    filter: saturate(0.25) brightness(0.60);
    pointer-events: none;
}

/* Highlight pulse (used by resume button) */
@keyframes ae-highlight-pulse {
    0%   { box-shadow: 0 0 0  0px rgba(0,212,255,0.5); }
    50%  { box-shadow: 0 0 0 10px rgba(0,212,255,0.0); }
    100% { box-shadow: 0 0 0  0px rgba(0,212,255,0.0); }
}

.ae-node--highlight {
    animation: ae-highlight-pulse 1.1s ease 2;
    border-color: var(--ae-cyan) !important;
}

/* Challenge nodes */
.ae-node--challenge {
    max-width: 600px;
    margin: 0 auto;
    border-color: rgba(210,170,20,0.30);
    background: rgba(210,170,20,0.05);
}
.ae-node--challenge::before {
    background: linear-gradient(to bottom, #d0a020, #7a5a10);
}
.ae-node--challenge:hover:not(.ae-node--fog) {
    border-color: #d0a020;
    box-shadow: 0 4px 20px rgba(210,160,20,0.15);
}

/* ============================================================
   Node internals
   ============================================================ */

.ae-node-type-badge {
    display: inline-block;
    font-size: 0.42rem;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    padding: 1px 7px;
    border-radius: 3px;
    margin-bottom: 7px;
}

.ae-node-type-badge--module  { background: rgba(100,180,255,0.10); color: var(--ae-type-module);  border: 1px solid rgba(100,180,255,0.18); }
.ae-node-type-badge--lab     { background: rgba(80,220,160,0.10);  color: var(--ae-type-lab);     border: 1px solid rgba(80,220,160,0.18); }
.ae-node-type-badge--applet  { background: rgba(180,140,255,0.10); color: var(--ae-type-applet);  border: 1px solid rgba(180,140,255,0.18); }
.ae-node-type-badge--quiz    { background: rgba(255,200,80,0.10);  color: var(--ae-type-quiz);    border: 1px solid rgba(255,200,80,0.18); }
.ae-node-type-badge--tool    { background: rgba(255,140,80,0.10);  color: var(--ae-type-tool);    border: 1px solid rgba(255,140,80,0.18); }
.ae-node-type-badge--game    { background: rgba(210,170,20,0.12);  color: var(--ae-type-game);    border: 1px solid rgba(210,170,20,0.25); }
.ae-node-type-badge--review  { background: rgba(80,200,220,0.10);  color: var(--ae-type-review);  border: 1px solid rgba(80,200,220,0.18); }

.ae-node-title {
    font-size: 0.66rem;
    color: var(--ae-text);
    letter-spacing: 0.04em;
    line-height: 1.5;
    margin-bottom: 10px;
}

.ae-node-title--fog {
    color: var(--ae-text-dim);
    font-style: italic;
}

.ae-node-link {
    text-decoration: none;
    color: var(--fc-main, #00d4ff);
    transition: color 0.15s;
}
.ae-node-link:hover { color: var(--ae-cyan); text-decoration: underline; }

.ae-node-footer {
    display: flex;
    align-items: center;
    gap: 10px;
}

.ae-node-stamp {
    font-size: 0.46rem;
    color: #3ac880;
    letter-spacing: 0.10em;
}

.ae-node-toggle {
    padding: 4px 12px;
    font-size: 0.48rem;
    letter-spacing: 0.06em;
    font-family: inherit;
    background: rgba(0,212,255,0.05);
    border: 1px solid rgba(0,212,255,0.15);
    border-radius: 3px;
    color: var(--ae-text-muted);
    cursor: pointer;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
}
.ae-node-toggle:hover {
    background: rgba(0,212,255,0.10);
    color: var(--ae-text);
    border-color: rgba(0,212,255,0.30);
}

.ae-node-toggle--done {
    background: rgba(0,200,100,0.08);
    border-color: rgba(0,200,100,0.25);
    color: #3ac880;
}
.ae-node-toggle--done:hover {
    background: rgba(200,50,50,0.08);
    border-color: rgba(200,50,50,0.25);
    color: #d06060;
}

/* Challenge badge */
.ae-challenge-badge {
    display: inline-block;
    font-size: 0.46rem;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    padding: 2px 10px;
    border-radius: 3px;
    background: rgba(210,170,20,0.10);
    border: 1px solid rgba(210,170,20,0.28);
    color: #d0a020;
    margin-bottom: 9px;
}

/* ============================================================
   Branch group (fork layout)
   ============================================================ */

.ae-branch-group {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;
}

/* Horizontal fork bar connecting head to branches */
.ae-fork-bar {
    width: 60%;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--fc-dark, #1a6a9a), transparent);
    opacity: 0.50;
    margin: 0 auto;
}

/* Branch row */
.ae-branch-row {
    display: flex;
    gap: 10px;
    width: 100%;
    margin-top: 0;
    flex-wrap: wrap;
}

.ae-branch-row--multi {
    justify-content: stretch;
}

.ae-branch-row--single {
    justify-content: center;
}

.ae-branch-row--single .ae-node--branch {
    max-width: 600px;
    flex: none;
    width: 100%;
}

/* Add a small top connector from section head to branch row */
.ae-branch-group::before {
    content: '';
    display: block;
    width: 2px;
    height: 12px;
    background: linear-gradient(to bottom, var(--fc-dark), transparent);
    opacity: 0.45;
    margin: 0 auto;
}

@media (max-width: 640px) {
    .ae-district-hero { flex-direction: column; padding: 18px; gap: 16px; }
    .ae-dhero-icon    { font-size: 2.2rem; }
    .ae-dhero-name    { font-size: 1rem; }
    .ae-branch-row    { flex-direction: column; }
    .ae-node          { max-width: 100%; }
    .ae-branch-group  { max-width: 100%; }
    .ae-node--branch  { min-width: 0; }
}`;
    }

    // =========================================================================
    // PUBLIC API
    // =========================================================================

    // Cross-tab sync: reload when progress changes in another tab.
    // The 'storage' event only fires in OTHER tabs, so no reload loops.
    window.addEventListener('storage', (e) => {
        if (e.key === 'hexworth_progress' || e.key === PROGRESS_KEY) {
            window.location.reload();
        }
    });

    return {
        renderHub,
        renderDistrict
    };

})();
