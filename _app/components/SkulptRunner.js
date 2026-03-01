/**
 * SkulptRunner.js — Lazy-loading Skulpt bridge for TurtleCanvas
 *
 * Loads skulpt.min.js + skulpt-stdlib.js on first use, then runs
 * full Python 3 code with turtle graphics rendered into a target div.
 *
 * Usage:
 *   await SkulptRunner.run(code, 'myDiv', { width: 600, height: 400 });
 */
const SkulptRunner = (function () {

    let _loading = null;   // dedup concurrent loads
    let _loaded  = false;

    /**
     * Resolve base path to vendor/skulpt/ by finding our own script tag.
     * Falls back to _app/vendor/skulpt/ if script tag not found.
     */
    function _vendorPath() {
        const scripts = document.querySelectorAll('script[src*="SkulptRunner"]');
        if (scripts.length) {
            const src = scripts[scripts.length - 1].getAttribute('src');
            const base = src.substring(0, src.lastIndexOf('/'));   // …/components
            return base + '/../vendor/skulpt/';
        }
        return '_app/vendor/skulpt/';
    }

    /**
     * Inject a <script> tag and return a Promise that resolves on load.
     */
    function _loadScript(url) {
        return new Promise(function (resolve, reject) {
            var s = document.createElement('script');
            s.src = url;
            s.onload  = resolve;
            s.onerror = function () { reject(new Error('Failed to load ' + url)); };
            document.head.appendChild(s);
        });
    }

    /**
     * Ensure Skulpt core + stdlib are loaded (once).
     * Returns a Promise that resolves when ready.
     */
    function _ensureLoaded() {
        if (_loaded) return Promise.resolve();
        if (_loading) return _loading;

        var base = _vendorPath();
        _loading = _loadScript(base + 'skulpt.min.js')
            .then(function () {
                return _loadScript(base + 'skulpt-stdlib.js');
            })
            .then(function () {
                _loaded  = true;
                _loading = null;
            })
            .catch(function (err) {
                _loading = null;    // allow retry on failure
                throw err;
            });

        return _loading;
    }

    /**
     * Run Python code with turtle output rendered into targetDivId.
     *
     * @param {string} code          - Full Python source
     * @param {string} targetDivId   - DOM id of the container div
     * @param {object} [options]     - { width, height }
     * @returns {Promise}
     */
    function run(code, targetDivId, options) {
        options = options || {};
        var w = options.width  || 600;
        var h = options.height || 400;

        return _ensureLoaded().then(function () {
            var target = document.getElementById(targetDivId);
            if (!target) throw new Error('SkulptRunner: no element #' + targetDivId);

            // Clear previous render
            target.innerHTML = '';

            // Set fixed dimensions so Skulpt's turtle canvas fits
            target.style.width  = w + 'px';
            target.style.height = h + 'px';
            target.style.overflow = 'hidden';

            // Configure Skulpt
            Sk.configure({
                output:    function () {},   // suppress print()
                read:      _builtinRead,
                __future__: Sk.python3
            });

            Sk.TurtleGraphics = Sk.TurtleGraphics || {};
            Sk.TurtleGraphics.target = targetDivId;
            Sk.TurtleGraphics.width  = w;
            Sk.TurtleGraphics.height = h;

            return Sk.misceval.asyncToPromise(function () {
                return Sk.importMainWithBody('<stdin>', false, code, true);
            });
        });
    }

    /**
     * Skulpt's read callback — returns built-in library files.
     */
    function _builtinRead(filename) {
        if (Sk.builtinFiles === undefined || Sk.builtinFiles.files[filename] === undefined) {
            throw new Error('File not found: ' + filename);
        }
        return Sk.builtinFiles.files[filename];
    }

    return { run: run, ensureLoaded: _ensureLoaded };

})();

window.SkulptRunner = SkulptRunner;
