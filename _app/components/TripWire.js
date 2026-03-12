/**
 * TripWire.js — Honeypot Defense System for Hexworth Prime
 *
 * Detects student hacking attempts (localStorage manipulation, console
 * injection, DOM tampering, timer fraud, XSS patterns, decoy access)
 * and turns them into achievements. Educational, not punitive --
 * getting caught IS the achievement.
 *
 * Usage: include via <script src> -- self-initializes, zero config.
 *
 * Public API:
 *   TripWire.protect(obj, key, opts)   - Sensor 2: proxy-guard a property
 *   TripWire.authorizeWrite(key)       - Sensor 1: whitelist a storage write
 *   TripWire.getLog()                  - Read the trip log
 *   TripWire.getTripCount()            - Session trip counter
 *   TripWire.getSensorsTripped()       - Set of sensor names that fired
 *
 * @version 1.0.0
 */
(function () {
  'use strict';

  /* ── Double-init guard ─────────────────────────────────────── */
  if (window.TripWire && window.TripWire._initialized) return;

  /* ── Constants ─────────────────────────────────────────────── */
  var LOG_KEY          = 'hexworth_tripwire_log';
  var LOG_MAX          = 100;
  var POLL_INTERVAL_MS = 3000;
  var HEARTBEAT_MS     = 1000;
  var HEARTBEAT_LO     = 800;
  var HEARTBEAT_HI     = 1500;
  var DRIFT_LIMIT_MS   = 5000;
  var DETAIL_MAX_CHARS = 200;

  var PROTECTED_KEYS = [
    'hexworth_progress', 'hexworth_arctic_progress',
    'hexworth_achievements', 'hexworth_achievements_v2',
    'hexworth_xp', 'hexworth_streak', 'hexworth_stats',
    'hexworth_house_completions', 'hexworth_game_tracker',
    'hexworth_integrity', 'hexworth_mastery_',
    'hexworth_synced_activity', 'hexworth_operator_'
  ];

  var GATE_KEYS = [];
  for (var g = 1; g <= 13; g++) {
    GATE_KEYS.push('gate' + g + '_complete');
  }

  var ALL_PROTECTED = PROTECTED_KEYS.concat(GATE_KEYS);

  var XSS_PATTERNS = [
    /<script/i,
    /javascript\s*:/i,
    /onerror\s*=/i,
    /onload\s*=/i,
    /eval\s*\(/i,
    /document\.cookie/i,
    /<img\s+src\s*=\s*x/i,
    /<svg\s+onload/i
  ];

  var CTF_EXCLUSIONS = ['.arena-terminal', '.operator-editor', '.operator-input'];

  /* ── Closure state ─────────────────────────────────────────── */
  var tripCount       = 0;
  var sensorsTripped  = {};
  var sessionSalt     = _generateSalt();
  var sessionId       = _generateSalt();
  var storageSnapshot = {};
  var checksumMap     = {};
  var authorizedKeys  = {};
  var domCache        = {};
  var observer        = null;
  var _timerReplacementTripped = false;

  // Native timer references (Sensor 5)
  var _nativeSetTimeout  = window.setTimeout;
  var _nativeSetInterval = window.setInterval;
  var _nativeDateNow     = Date.now;
  var _nativePerfNow     = (window.performance && window.performance.now)
    ? window.performance.now.bind(window.performance) : null;

  var lastHeartbeat   = _nativeDateNow.call(Date);

  /* ── Utility helpers ───────────────────────────────────────── */

  function _generateSalt() {
    var s = '';
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 32; i++) {
      s += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return s;
  }

  function _simpleHash(str) {
    var hash = 5381;
    for (var i = 0; i < str.length; i++) {
      hash = ((hash << 5) + hash) + str.charCodeAt(i);
      hash = hash & hash; // 32-bit int
    }
    return hash.toString(36);
  }

  function _isProtectedKey(key) {
    for (var i = 0; i < ALL_PROTECTED.length; i++) {
      var pk = ALL_PROTECTED[i];
      if (pk.endsWith('_')) {
        if (key.indexOf(pk) === 0) return true;
      } else {
        if (key === pk) return true;
      }
    }
    return false;
  }

  function _checksum(key, value) {
    return _simpleHash(key + ':' + (value || '') + ':' + sessionSalt);
  }

  function _stackHasConsole(stack) {
    if (!stack) return false;
    // Firefox console
    if (/debugger eval code/.test(stack)) return true;
    // Chrome/Edge console: "at <anonymous>:N:N" (NOT "Object.<anonymous> (file.js:N)")
    if (/\bat\s+<anonymous>:\d+:\d+/.test(stack)) return true;
    // Chrome eval-in-console
    if (/\bat\s+eval\s+\(eval\s+at/.test(stack)) return true;
    // Firefox eval
    if (/^eval@/m.test(stack)) return true;
    // Safari
    if (/\beval code\b/.test(stack)) return true;
    return false;
  }

  function _sanitize(str) {
    if (!str) return '';
    return String(str).substring(0, DETAIL_MAX_CHARS);
  }

  function _hashUID(uid) {
    return _simpleHash('uid:' + uid + ':tripwire');
  }

  function _readLog() {
    try {
      var raw = localStorage.getItem(LOG_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function _writeLog(log) {
    try {
      // Direct write -- bypass our own wrapper by using the flag
      authorizedKeys[LOG_KEY] = true;
      localStorage.setItem(LOG_KEY, JSON.stringify(log));
      delete authorizedKeys[LOG_KEY];
    } catch (e) { /* quota or private browsing */ }
  }

  /* ── Central Dispatcher ────────────────────────────────────── */

  function _dispatch(evt) {
    tripCount++;
    sensorsTripped[evt.sensor] = true;

    var entry = {
      sensor:    evt.sensor,
      category:  evt.category,
      detail:    _sanitize(evt.detail),
      timestamp: new Date().toISOString(),
      page:      location.pathname
    };

    // 1. Persist to localStorage log (FIFO, max 100)
    var log = _readLog();
    log.push(entry);
    while (log.length > LOG_MAX) log.shift();
    _writeLog(log);

    // 2. Fire DOM custom event
    try {
      var ce = new CustomEvent('hexworth:tripwire', { detail: entry });
      document.dispatchEvent(ce);
    } catch (e) { /* old browser fallback -- ignore */ }

    // 3. Achievement unlocks (via AchievementRegistry if available)
    _tryAchievements(entry);

    // 4. Firestore logging (best-effort)
    _tryFirestore(entry);

    // 5. Console warning
    try {
      console.warn(
        '%c[TRIPWIRE]%c ' + evt.category + ': ' + (evt.detail || ''),
        'color:#ff3333;font-weight:bold;',
        'color:#cc6666;'
      );
    } catch (e) { /* */ }
  }

  function _tryAchievements(entry) {
    var reg = window.AchievementRegistry;
    if (!reg || typeof reg.unlock !== 'function') return;

    try {
      // First trip ever
      if (tripCount === 1) reg.unlock('tripwire_busted');
      // Third trip
      if (tripCount === 3) reg.unlock('tripwire_repeat');

      // Sensor-specific
      var sensorMap = {
        console: 'tripwire_script_kiddie',
        dom:     'tripwire_manipulator',
        storage: 'tripwire_storage_raider',
        timer:   'tripwire_time_bandit',
        decoy:   'tripwire_decoy_victim',
        xss:     'tripwire_xss_artist'
      };
      if (sensorMap[entry.sensor]) {
        reg.unlock(sensorMap[entry.sensor]);
      }

      // Hall of fame: 5+ different sensors
      var uniqueCount = Object.keys(sensorsTripped).length;
      if (uniqueCount >= 5) reg.unlock('tripwire_hall_of_fame');
    } catch (e) { /* achievement system not loaded, fine */ }
  }

  function _tryFirestore(entry) {
    try {
      var fb = window.firebase;
      if (!fb || !fb.firestore || !fb.auth) return;
      var user = fb.auth().currentUser;
      if (!user) return;
      fb.firestore().collection('tripwire_events').add({
        uid_hash:  _hashUID(user.uid),
        method:    entry.sensor,
        category:  entry.category,
        detail:    _sanitize(entry.detail),
        timestamp: fb.firestore.FieldValue.serverTimestamp(),
        nonce:     _generateSalt().substring(0, 12),
        sessionId: sessionId
      });
    } catch (e) { /* Firestore not available, fine */ }
  }

  /* ══════════════════════════════════════════════════════════════
   * SENSOR 1: Storage Integrity
   * ══════════════════════════════════════════════════════════════ */

  function _initStorageSensor() {
    // Take initial snapshot of all protected keys
    _snapshotStorage();

    // Wrap Storage.prototype.setItem
    var originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (_isProtectedKey(key) && !authorizedKeys[key]) {
        // Check call stack: only flag writes from console/eval, not internal code
        var stack = '';
        try { stack = new Error().stack || ''; } catch (e) { /* */ }
        if (_stackHasConsole(stack)) {
          // Unauthorized write from DevTools console
          _dispatch({
            sensor:   'storage',
            category: 'storage_tampering',
            detail:   'Unauthorized write to "' + key + '"'
          });
          // Revert: do not apply the write, restore snapshot
          var good = storageSnapshot[key];
          if (good !== undefined) {
            originalSetItem.call(this, key, good);
          }
          return;
        }
      }
      // Internal code, authorized, or unprotected -- let it through
      originalSetItem.call(this, key, value);
      // Update snapshot and checksum after writes to protected keys
      if (_isProtectedKey(key)) {
        storageSnapshot[key] = value;
        checksumMap[key] = _checksum(key, value);
        delete authorizedKeys[key];
      }
    };

    // Poll for external tampering (devtools Application tab edits)
    _nativeSetInterval.call(window, _pollStorage, POLL_INTERVAL_MS);

    // Cross-tab sync: legitimate writes from other tabs update the snapshot
    // so the poll doesn't flag them as tampering
    window.addEventListener('storage', function (e) {
      if (e.key && _isProtectedKey(e.key)) {
        storageSnapshot[e.key] = e.newValue;
        checksumMap[e.key] = _checksum(e.key, e.newValue);
      }
    });
  }

  function _snapshotStorage() {
    for (var i = 0; i < ALL_PROTECTED.length; i++) {
      var pk = ALL_PROTECTED[i];
      if (pk.endsWith('_')) {
        // Prefix match -- scan all localStorage keys
        for (var j = 0; j < localStorage.length; j++) {
          var k = localStorage.key(j);
          if (k && k.indexOf(pk) === 0) {
            _snapshotKey(k);
          }
        }
      } else {
        _snapshotKey(pk);
      }
    }
  }

  function _snapshotKey(key) {
    var val = localStorage.getItem(key);
    if (val !== null) {
      storageSnapshot[key] = val;
      checksumMap[key] = _checksum(key, val);
    }
  }

  function _pollStorage() {
    var keys = Object.keys(checksumMap);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var current = localStorage.getItem(key);
      var expected = checksumMap[key];
      var actual = _checksum(key, current);
      if (actual !== expected) {
        _dispatch({
          sensor:   'storage',
          category: 'storage_tampering',
          detail:   'Checksum mismatch on "' + key + '"'
        });
        // Revert to last known good
        if (storageSnapshot[key] !== undefined) {
          authorizedKeys[key] = true;
          localStorage.setItem(key, storageSnapshot[key]);
          delete authorizedKeys[key];
          checksumMap[key] = _checksum(key, storageSnapshot[key]);
        }
      }
    }
    // Also pick up newly-created protected keys
    for (var j = 0; j < localStorage.length; j++) {
      var lk = localStorage.key(j);
      if (lk && _isProtectedKey(lk) && !(lk in checksumMap)) {
        _snapshotKey(lk);
      }
    }
  }

  /* ══════════════════════════════════════════════════════════════
   * SENSOR 2: Runtime Object Freeze
   * ══════════════════════════════════════════════════════════════ */

  function _protect(obj, key, options) {
    if (!obj || obj[key] === undefined) return;
    options = options || {};

    var snapshot = obj[key];

    // Optionally deep-freeze sub-objects
    if (options.freeze && typeof snapshot === 'object' && snapshot !== null) {
      try { Object.freeze(snapshot); } catch (e) { /* */ }
    }

    var descriptor = Object.getOwnPropertyDescriptor(obj, key);
    if (descriptor && !descriptor.configurable) return; // can't replace

    try {
      Object.defineProperty(obj, key, {
        configurable: false,
        enumerable: true,
        get: function () { return snapshot; },
        set: function (val) {
          var stack = '';
          try { stack = new Error().stack || ''; } catch (e) { /* */ }
          if (_stackHasConsole(stack)) {
            _dispatch({
              sensor:   'runtime',
              category: 'runtime_manipulation',
              detail:   'Console set attempt on "' + key + '"'
            });
            return; // reject assignment
          }
          // Allow legitimate runtime sets
          snapshot = val;
        }
      });
    } catch (e) { /* property not configurable */ }
  }

  /* ══════════════════════════════════════════════════════════════
   * SENSOR 3: DOM Mutation Observer
   * ══════════════════════════════════════════════════════════════ */

  function _initDomSensor() {
    if (!window.MutationObserver) return;

    // Cache initial state of protected elements
    _cacheProtectedElements();

    observer = new MutationObserver(function (mutations) {
      for (var i = 0; i < mutations.length; i++) {
        var mutation = mutations[i];
        var target = mutation.target;

        // Walk up to find the protected ancestor
        var protectedEl = _findProtectedAncestor(target);
        if (!protectedEl) continue;

        var id = protectedEl.getAttribute('data-protected-id') ||
                 protectedEl.id ||
                 protectedEl.getAttribute('data-protected');
        if (!id || id === 'true') id = _elementSignature(protectedEl);

        if (domCache[id] !== undefined && protectedEl.textContent !== domCache[id]) {
          _dispatch({
            sensor:   'dom',
            category: 'dom_tampering',
            detail:   'Protected element modified: ' + id
          });
          // Revert
          protectedEl.textContent = domCache[id];
        }
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true
    });
  }

  function _cacheProtectedElements() {
    var els = document.querySelectorAll('[data-protected="true"]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var id = el.getAttribute('data-protected-id') ||
               el.id ||
               _elementSignature(el);
      domCache[id] = el.textContent;
    }
  }

  function _findProtectedAncestor(node) {
    var el = node.nodeType === 1 ? node : node.parentElement;
    while (el) {
      if (el.getAttribute && el.getAttribute('data-protected') === 'true') return el;
      el = el.parentElement;
    }
    return null;
  }

  function _elementSignature(el) {
    return (el.tagName || 'UNKNOWN').toLowerCase() + ':' +
           (el.className || '').substring(0, 30) + ':' +
           Array.prototype.indexOf.call(el.parentElement ? el.parentElement.children : [], el);
  }

  /* ══════════════════════════════════════════════════════════════
   * SENSOR 4: Console Injection Detection
   * ══════════════════════════════════════════════════════════════ */

  function _initConsoleSensor() {
    var targets = [
      { obj: 'AchievementManager', method: 'unlock' },
      { obj: 'AchievementSystem',  method: 'unlock' },
      { obj: 'ProgressManager',    method: 'completeModule' },
      { obj: 'XPCalculator',       method: 'recalculate' }
    ];

    for (var i = 0; i < targets.length; i++) {
      _wrapGlobal(targets[i].obj, targets[i].method);
    }
  }

  function _wrapGlobal(objName, methodName) {
    var obj = window[objName];
    if (!obj || typeof obj[methodName] !== 'function') return;

    var original = obj[methodName];
    obj[methodName] = function () {
      var stack = '';
      try { stack = new Error().stack || ''; } catch (e) { /* */ }
      if (_stackHasConsole(stack)) {
        _dispatch({
          sensor:   'console',
          category: 'console_injection',
          detail:   objName + '.' + methodName + '() called from console'
        });
      }
      // Always execute -- educational, not blocking
      return original.apply(this, arguments);
    };
  }

  /* ══════════════════════════════════════════════════════════════
   * SENSOR 5: Timer Manipulation
   * ══════════════════════════════════════════════════════════════ */

  function _initTimerSensor() {
    // Heartbeat: detect time manipulation
    _nativeSetInterval.call(window, function () {
      var now = _nativeDateNow.call(Date);
      var elapsed = now - lastHeartbeat;
      lastHeartbeat = now;

      // Skip when tab is hidden — browsers throttle setInterval to ~60s
      // in background tabs. Also skip the first beat after un-hiding.
      if (document.hidden || document.visibilityState === 'hidden') return;
      if (elapsed > 5000) return; // tab was likely backgrounded, not tampered

      if (elapsed < HEARTBEAT_LO || elapsed > HEARTBEAT_HI) {
        if (elapsed < HEARTBEAT_LO / 2) {
          _dispatch({
            sensor:   'timer',
            category: 'timer_manipulation',
            detail:   'Heartbeat anomaly: ' + elapsed + 'ms (expected ~' + HEARTBEAT_MS + 'ms)'
          });
        }
      }

      // Cross-check performance.now drift
      if (_nativePerfNow) {
        var perfNow = _nativePerfNow();
        var dateNow = _nativeDateNow.call(Date);
        // Both should advance at roughly the same rate within a session
        // We check if someone replaced Date.now with a static value
        if (!_timerReplacementTripped && window.Date.now !== _nativeDateNow) {
          _timerReplacementTripped = true;
          _dispatch({
            sensor:   'timer',
            category: 'timer_manipulation',
            detail:   'Date.now has been replaced'
          });
        }
      }

      // Check if setTimeout/setInterval have been replaced (once per session)
      if (!_timerReplacementTripped) {
        if (window.setTimeout !== _nativeSetTimeout) {
          _timerReplacementTripped = true;
          _dispatch({
            sensor:   'timer',
            category: 'timer_manipulation',
            detail:   'window.setTimeout has been replaced'
          });
        }
        if (window.setInterval !== _nativeSetInterval) {
          _timerReplacementTripped = true;
          _dispatch({
            sensor:   'timer',
            category: 'timer_manipulation',
            detail:   'window.setInterval has been replaced'
          });
        }
      }
    }, HEARTBEAT_MS);
  }

  /* ══════════════════════════════════════════════════════════════
   * SENSOR 6: Decoy Flags (Honeypots)
   * ══════════════════════════════════════════════════════════════ */

  function _initDecoySensor() {
    // Decoy 1: Admin key
    _plantDecoy(window, '__hexworth_admin_key', 'FLAG{NICE_TRY_ADMIN_KEY}', 'admin_key');

    // Decoy 2: Debug XP
    _plantDecoy(window, '__hexworth_debug_xp', 999999, 'debug_xp');

    // Decoy 3: Flag registry
    var fakeRegistry = {};
    Object.defineProperty(fakeRegistry, 'a1', {
      get: function () {
        _dispatch({
          sensor:   'decoy',
          category: 'honeypot_access',
          detail:   'Accessed decoy flag_registry.a1'
        });
        return 'FLAG{NICE_TRY_REGISTRY}';
      },
      enumerable: true,
      configurable: false
    });
    Object.defineProperty(window, '__hexworth_flag_registry', {
      get: function () {
        _dispatch({
          sensor:   'decoy',
          category: 'honeypot_access',
          detail:   'Accessed decoy flag_registry'
        });
        return fakeRegistry;
      },
      enumerable: true,
      configurable: false
    });

    // Decoy 4: HTML comment
    try {
      var comment = document.createComment(
        ' DEBUG: admin_token=FLAG{NICE_TRY_HTML_COMMENT} '
      );
      document.body.appendChild(comment);
    } catch (e) { /* */ }
  }

  function _plantDecoy(obj, prop, value, label) {
    try {
      Object.defineProperty(obj, prop, {
        get: function () {
          _dispatch({
            sensor:   'decoy',
            category: 'honeypot_access',
            detail:   'Accessed decoy: ' + label
          });
          return value;
        },
        set: function () {
          _dispatch({
            sensor:   'decoy',
            category: 'honeypot_access',
            detail:   'Attempted write to decoy: ' + label
          });
        },
        enumerable: true,
        configurable: false
      });
    } catch (e) { /* property already defined */ }
  }

  /* ══════════════════════════════════════════════════════════════
   * SENSOR 7: XSS Pattern Detection
   * ══════════════════════════════════════════════════════════════ */

  function _initXssSensor() {
    document.addEventListener('input', function (e) {
      var target = e.target;
      if (!target) return;

      // Only monitor input and textarea elements
      var tag = (target.tagName || '').toLowerCase();
      if (tag !== 'input' && tag !== 'textarea') return;

      // Exclude CTF contexts where XSS is legitimate
      for (var i = 0; i < CTF_EXCLUSIONS.length; i++) {
        if (_isInsideSelector(target, CTF_EXCLUSIONS[i])) return;
      }

      var val = target.value || '';
      for (var j = 0; j < XSS_PATTERNS.length; j++) {
        if (XSS_PATTERNS[j].test(val)) {
          _dispatch({
            sensor:   'xss',
            category: 'xss_attempt',
            detail:   'XSS pattern detected: ' + XSS_PATTERNS[j].source
          });
          // Log but don't block -- educational
          return; // only trip once per input event
        }
      }
    }, true); // capture phase for broader coverage
  }

  function _isInsideSelector(el, selector) {
    var node = el;
    while (node && node !== document) {
      try {
        if (node.matches && node.matches(selector)) return true;
      } catch (e) { /* */ }
      node = node.parentElement;
    }
    return false;
  }

  /* ══════════════════════════════════════════════════════════════
   * Public API
   * ══════════════════════════════════════════════════════════════ */

  window.TripWire = {

    /**
     * Sensor 2 API: Protect a property from console manipulation.
     * @param {Object} obj     - The object owning the property
     * @param {string} key     - Property name to guard
     * @param {Object} options - { freeze: boolean }
     */
    protect: function (obj, key, options) {
      _protect(obj, key, options);
    },

    /**
     * Sensor 1 API: Authorize a single write to a protected key.
     * Call this immediately before localStorage.setItem for protected keys.
     * @param {string} key - The localStorage key being written
     */
    authorizeWrite: function (key) {
      authorizedKeys[key] = true;
    },

    /**
     * Return the full tripwire log from localStorage.
     * @returns {Array} Array of trip event objects
     */
    getLog: function () {
      return _readLog();
    },

    /**
     * Return total trip count for this session.
     * @returns {number}
     */
    getTripCount: function () {
      return tripCount;
    },

    /**
     * Return the set of sensor names that have fired this session.
     * @returns {Array<string>}
     */
    getSensorsTripped: function () {
      return Object.keys(sensorsTripped);
    },

    /** @private */
    _dispatch: _dispatch,

    /** @private */
    _initialized: true
  };

  /* ══════════════════════════════════════════════════════════════
   * Initialization
   * ══════════════════════════════════════════════════════════════ */

  // Sensor 1: Storage integrity monitoring
  _initStorageSensor();

  // Sensor 3: DOM mutation observer (wait for body)
  if (document.body) {
    _initDomSensor();
  } else {
    document.addEventListener('DOMContentLoaded', _initDomSensor);
  }

  // Sensor 4: Console injection wrappers
  // Defer slightly so target objects are likely loaded
  _nativeSetTimeout.call(window, _initConsoleSensor, 500);

  // Sensor 5: Timer manipulation heartbeat
  _initTimerSensor();

  // Sensor 6: Decoy honeypots (wait for body)
  if (document.body) {
    _initDecoySensor();
  } else {
    document.addEventListener('DOMContentLoaded', _initDecoySensor);
  }

  // Sensor 7: XSS pattern detection
  _initXssSensor();

  // Startup log (subtle)
  try {
    console.log(
      '%c[TRIPWIRE] Active',
      'color:#999;font-size:10px;'
    );
  } catch (e) { /* */ }

})();
