/* ============================================================
   CTF ARENA — Browser.js
   Web browser simulator with URL bar, navigation, form handling
   ============================================================ */

const ArenaBrowser = {
    _instances: [],

    init(container, config, engine) {
        const browser = new BrowserInstance(container, config, engine);
        this._instances.push(browser);
        return browser;
    }
};

class BrowserInstance {
    constructor(container, config, engine) {
        this.config = config;
        this.engine = engine;
        this.webApp = config.webApp || {};
        this.historyStack = [];
        this.historyIndex = -1;

        this._build(container);

        // Navigate to start URL
        const startUrl = this.webApp.startUrl || Object.keys(this.webApp.pages || {})[0] || '/';
        this.navigate(startUrl);
    }

    // ────────────────────────────────────────────────
    // BUILD UI
    // ────────────────────────────────────────────────

    _build(container) {
        // Toolbar
        const toolbar = document.createElement('div');
        toolbar.className = 'browser-toolbar';

        // Nav buttons
        const navBtns = document.createElement('div');
        navBtns.className = 'browser-nav-btns';

        this.backBtn = document.createElement('button');
        this.backBtn.className = 'browser-nav-btn';
        this.backBtn.innerHTML = '&#9664;';
        this.backBtn.title = 'Back';
        this.backBtn.disabled = true;
        this.backBtn.addEventListener('click', () => this.goBack());

        this.fwdBtn = document.createElement('button');
        this.fwdBtn.className = 'browser-nav-btn';
        this.fwdBtn.innerHTML = '<img src="/assets/images/icons/icon-play.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">';
        this.fwdBtn.title = 'Forward';
        this.fwdBtn.disabled = true;
        this.fwdBtn.addEventListener('click', () => this.goForward());

        navBtns.appendChild(this.backBtn);
        navBtns.appendChild(this.fwdBtn);

        // URL bar
        const urlBar = document.createElement('div');
        urlBar.className = 'browser-url-bar';

        const urlIcon = document.createElement('span');
        urlIcon.className = 'url-icon';
        urlIcon.textContent = '\uD83D\uDD12';

        this.urlInput = document.createElement('input');
        this.urlInput.type = 'text';
        this.urlInput.value = '';
        this.urlInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') this.navigate(this.urlInput.value);
        });

        urlBar.appendChild(urlIcon);
        urlBar.appendChild(this.urlInput);

        // Go button
        const goBtn = document.createElement('button');
        goBtn.className = 'browser-go-btn';
        goBtn.textContent = 'Go';
        goBtn.addEventListener('click', () => this.navigate(this.urlInput.value));

        // View Source button
        this.srcBtn = document.createElement('button');
        this.srcBtn.className = 'browser-go-btn browser-src-btn';
        this.srcBtn.textContent = '</>';
        this.srcBtn.title = 'View Page Source';
        this.srcBtn.addEventListener('click', () => this._toggleSource());

        toolbar.appendChild(navBtns);
        toolbar.appendChild(urlBar);
        toolbar.appendChild(goBtn);
        toolbar.appendChild(this.srcBtn);

        // Page area
        this.pageEl = document.createElement('div');
        this.pageEl.className = 'browser-page';

        // Global link interception — catches any <a> click that bubbles up,
        // including links in dynamically-rendered form responses
        this.pageEl.addEventListener('click', (e) => {
            const anchor = e.target.closest('a[href]');
            if (!anchor) return;
            const href = anchor.getAttribute('href');
            if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                e.preventDefault();
                this.navigate(href);
            }
        });

        // Loading indicator
        this.loadingEl = document.createElement('div');
        this.loadingEl.className = 'browser-loading';
        this.loadingEl.textContent = 'Loading...';

        container.appendChild(toolbar);
        container.appendChild(this.loadingEl);
        container.appendChild(this.pageEl);
    }

    // ────────────────────────────────────────────────
    // NAVIGATION
    // ────────────────────────────────────────────────

    navigate(url, pushHistory = true) {
        url = url.trim();
        // Normalize URL — strip protocol+host for matching
        const pathMatch = url.match(/^(?:https?:\/\/[^/]+)?(\/.*)$/);
        const path = pathMatch ? pathMatch[1] : url;

        this.urlInput.value = url;

        // Show loading briefly
        this.loadingEl.classList.add('active');
        this.pageEl.style.opacity = '0.3';

        setTimeout(() => {
            this.loadingEl.classList.remove('active');
            this.pageEl.style.opacity = '1';
            this._renderPage(path, url);
        }, 200 + Math.random() * 200);

        // Research instrumentation: log navigation to BoxEngine event log
        if (this.engine && this.engine._logEvent) {
            this.engine._logEvent('navigate', { url: url });
        }

        // History management
        if (pushHistory) {
            // Truncate forward history
            if (this.historyIndex < this.historyStack.length - 1) {
                this.historyStack = this.historyStack.slice(0, this.historyIndex + 1);
            }
            this.historyStack.push(url);
            this.historyIndex = this.historyStack.length - 1;
        }

        this._updateNavButtons();
    }

    goBack() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.navigate(this.historyStack[this.historyIndex], false);
        }
    }

    goForward() {
        if (this.historyIndex < this.historyStack.length - 1) {
            this.historyIndex++;
            this.navigate(this.historyStack[this.historyIndex], false);
        }
    }

    _updateNavButtons() {
        this.backBtn.disabled = this.historyIndex <= 0;
        this.fwdBtn.disabled = this.historyIndex >= this.historyStack.length - 1;
    }

    // ────────────────────────────────────────────────
    // PAGE RENDERING
    // ────────────────────────────────────────────────

    _renderPage(path, fullUrl) {
        const pages = this.webApp.pages || {};

        // Try exact match first, then with/without trailing slash
        let pageDef = pages[path];
        let queryString = '';

        if (!pageDef) {
            // Try toggling trailing slash
            const alt = path.endsWith('/') ? path.slice(0, -1) : path + '/';
            pageDef = pages[alt];
        }

        if (!pageDef) {
            const qIdx = path.indexOf('?');
            if (qIdx !== -1) {
                queryString = path.slice(qIdx + 1);
                const basePath = path.slice(0, qIdx);
                pageDef = pages[basePath];
                if (!pageDef) {
                    const altBase = basePath.endsWith('/') ? basePath.slice(0, -1) : basePath + '/';
                    pageDef = pages[altBase];
                }
            }
        }

        // Try without leading slash
        if (!pageDef && !path.startsWith('/')) {
            pageDef = pages['/' + path];
        }

        // Try with leading slash removed
        if (!pageDef && path.startsWith('/')) {
            pageDef = pages[path.substring(1)];
        }

        // Smart-normalize fallback: when the student types a bare-hostname URL
        // like `https://siem.crimson-dawn.net` (no path), derive a candidate
        // page key from the leftmost subdomain. This lets lab authors key
        // pages by /subdomain (e.g. '/siem') without forcing students to know
        // the URL path layout. Purely additive — only fires if all prior
        // lookups failed. Edge cases:
        //   - apex domain (no subdomain) → no candidate, falls through to 404
        //   - 'localhost', 'www' subdomain → tried like any other; harmless
        //   - the `fullUrl` param is the unparsed user input (preserved
        //     because the parsed `path` may have stripped the host already)
        if (!pageDef && fullUrl) {
            const hostMatch = fullUrl.match(/^https?:\/\/([^/.]+)/);
            if (hostMatch) {
                const subdomain = hostMatch[1];
                pageDef = pages['/' + subdomain] || pages[subdomain];
            }
        }

        if (!pageDef) {
            this._render404(path);
            return;
        }

        // Set page title
        if (pageDef.title) {
            // Could update window title
        }

        // Render HTML content
        this.pageEl.innerHTML = '';
        this._viewingSource = false;
        this.srcBtn.classList.remove('active');
        const wrapper = document.createElement('div');
        wrapper.className = 'webapp';

        let rawHtml;
        if (typeof pageDef.html === 'function') {
            rawHtml = pageDef.html(queryString, this);
        } else {
            rawHtml = pageDef.html || '';
        }
        this._currentSource = rawHtml;
        // Resolve {{FLAG:id}} tokens if BoxEngine is available
        if (this.engine && this.engine.resolveFlagTokens) {
            rawHtml = this.engine.resolveFlagTokens(rawHtml);
        }
        wrapper.innerHTML = rawHtml;

        this.pageEl.appendChild(wrapper);

        // Wire up forms
        this._wireFormHandlers(wrapper, pageDef);

        // Wire up links
        this._wireLinks(wrapper);

        // Auto-process query string if there's a formHandler
        if (queryString && pageDef.formHandler) {
            const params = this._parseQueryString(queryString);
            this._handleFormSubmission(pageDef, params, wrapper);
        }
    }

    _render404(path) {
        this.pageEl.innerHTML = `
            <div class="webapp" style="text-align:center; padding:60px; color:#888;">
                <h2 style="color:#e74c3c; margin-bottom:8px;">404 Not Found</h2>
                <p>The requested URL <code>${this._escHtml(path)}</code> was not found on this server.</p>
            </div>
        `;
    }

    _wireFormHandlers(wrapper, pageDef) {
        const forms = wrapper.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const formData = {};
                const inputs = form.querySelectorAll('input, select, textarea');
                inputs.forEach(input => {
                    if (input.name) formData[input.name] = input.value;
                });

                if (pageDef.formHandler) {
                    this._handleFormSubmission(pageDef, formData, wrapper);
                }
            });
        });

        // Wire up ALL buttons with data-action attributes
        const actionBtns = wrapper.querySelectorAll('[data-action]');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                if (!pageDef.formHandler) return;
                const formData = {};
                // Collect all data-field inputs on the page
                const fields = wrapper.querySelectorAll('[data-field]');
                fields.forEach(field => {
                    formData[field.getAttribute('data-field')] = field.value;
                });
                this._handleFormSubmission(pageDef, formData, wrapper);
            });
        });

        // Wire up Enter key on all data-field inputs
        const fieldInputs = wrapper.querySelectorAll('[data-field]');
        fieldInputs.forEach(input => {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && pageDef.formHandler) {
                    const formData = {};
                    const fields = wrapper.querySelectorAll('[data-field]');
                    fields.forEach(field => {
                        formData[field.getAttribute('data-field')] = field.value;
                    });
                    this._handleFormSubmission(pageDef, formData, wrapper);
                }
            });
        });
    }

    _handleFormSubmission(pageDef, formData, wrapper) {
        let resultHtml = pageDef.formHandler(formData, this.engine);
        // Resolve {{FLAG:id}} tokens
        if (this.engine && this.engine.resolveFlagTokens) {
            resultHtml = this.engine.resolveFlagTokens(resultHtml);
        }
        const resultsArea = wrapper.querySelector('[data-results]');
        if (resultsArea) {
            resultsArea.innerHTML = resultHtml;
            this._wireLinks(resultsArea);
            // Append form result source for View Source
            if (this._currentSource !== undefined) {
                this._currentSource += '\n\n<!-- === Form Response === -->\n' + resultHtml;
            }
        }
    }

    _toggleSource() {
        if (!this._currentSource && this._currentSource !== '') return;
        this._viewingSource = !this._viewingSource;
        this.srcBtn.classList.toggle('active', this._viewingSource);

        if (this._viewingSource) {
            // Store rendered content so we can restore it
            this._renderedContent = this.pageEl.innerHTML;
            const pre = document.createElement('pre');
            pre.className = 'browser-source-view';
            pre.textContent = this._currentSource;
            this.pageEl.innerHTML = '';
            this.pageEl.appendChild(pre);
        } else {
            // Restore rendered view
            this.pageEl.innerHTML = this._renderedContent || '';
        }
    }

    _wireLinks(wrapper) {
        const links = wrapper.querySelectorAll('a[href]');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && !href.startsWith('#') && !href.startsWith('javascript:')) {
                    e.preventDefault();
                    this.navigate(href);
                }
            });
        });
    }

    _parseQueryString(qs) {
        const params = {};
        qs.split('&').forEach(pair => {
            const [key, value] = pair.split('=');
            if (key) params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        });
        return params;
    }

    _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
}
