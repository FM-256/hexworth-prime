/* ═══════════════════════════════════════════════════════════════════════════
   LagrangeEngine — Lagrange Edge box runtime

   Forked from OpenWorldEngine rather than extending it: Lagrange's trust states,
   resource ledger and link delay diverge deeply enough that shared code would
   destabilise the twelve open-world (ow- and ows-) boxes running on the original. Copy, rename,
   diverge — the flag plumbing is inherited unchanged because that is the part
   proven to credit correctly.

   ── THREE DELIBERATE DIFFERENCES FROM BoxEngine ─────────────────────────────

   1. NO FLAG PREFETCH. BoxEngine._initWithMode (BoxEngine.js:98-106) requests
      every flag in the config on page load, and deliverFlag checks only that the
      caller is signed in — so 231 boxes hand a student every answer before they
      do anything. Spoiler-class, not forgery-class (captures stay server
      validated), but it defeats the investigation. This engine never fetches a
      flag value. The player types what they worked out; the server judges it.

   2. EVERY ORBITAL ACTION COSTS ~2.2 SECONDS. ASTRAEA-9 sits near Earth-Moon L1,
      about 326,000 km out: ~1.09 s each way. There is no interactive console at
      that distance, and the box's whole thesis — the player cannot touch the
      truth — is a consequence of that number, not a metaphor. Built in from the
      first commit so missions are never paced against a responsiveness that will
      not exist.

   3. TRUST IS EARNED BY INDEPENDENCE, NOT AGREEMENT. A source cannot reach
      trusted-limited because two other sources agree with it. It requires a
      corroborator that shares no collection path, no clock source and no signing
      authority. Without that rule the ledger teaches that corroboration COUNT
      establishes truth, which is the inverse of the lesson.

   Scope: hexworth-shared/workbench/new box design/Lagrange-edge-box/
          Lagrange-Edge-MVP-Scope-v1.md  (criteria A3, B1, E1, H1)
   ═══════════════════════════════════════════════════════════════════════════ */

(function (global) {
    'use strict';

    function LagrangeEngine(config) {
        this.cfg = config;
        this.state = {
            trust: {},          // sourceId -> trust state key
            corroborations: {}, // sourceId -> [corroboratorId]
            resources: {},
            solved: {},
            hintsUsed: {},
            score: config.scoring ? config.scoring.base : 1000
        };
        Object.keys(config.resources || {}).forEach(function (k) {
            this.state.resources[k] = config.resources[k].start;
        }, this);
        (config.sensors || []).forEach(function (s) { this.state.trust[s.id] = 'unknown'; }, this);
        this._listeners = {};
        this.load();
    }

    /* ── Link delay ──────────────────────────────────────────────────────────
       Jitter is not decoration. A fixed delay reads as a loading spinner; a
       variable one reads as distance. */
    LagrangeEngine.prototype.linkDelay = function () {
        var l = this.cfg.link || {};
        var base = l.roundTripMs || 2180;
        var jitter = l.jitterMs || 0;
        return base + (jitter ? Math.floor(Math.random() * jitter) : 0);
    };

    /**
     * Run something "up there". Resolves only after the round trip, and spends
     * Link Budget. Every orbital interaction goes through here — that is what
     * makes the distance felt rather than described.
     */
    LagrangeEngine.prototype.orbital = function (label, fn, linkCost) {
        var self = this;
        var ms = this.linkDelay();
        this.emit('link:sent', { label: label, ms: ms });
        return new Promise(function (resolve) {
            setTimeout(function () {
                if (linkCost) self.spend('linkBudget', linkCost);
                var out = typeof fn === 'function' ? fn() : fn;
                self.emit('link:received', { label: label, ms: ms });
                resolve(out);
            }, ms);
        });
    };

    /* ── Resources ───────────────────────────────────────────────────────────
       Displayed here; AUTHORITATIVE ON THE SERVER. These values drive rendering
       and local feedback only. Nothing that gates scoring or completion may be
       decided by this file. Scope criterion B1. */
    LagrangeEngine.prototype.spend = function (key, amount) {
        if (this.state.resources[key] === undefined) return;
        this.state.resources[key] = Math.max(0, this.state.resources[key] - amount);
        this.emit('resource:changed', { key: key, value: this.state.resources[key] });
        this.save();
    };

    /* ── Independence test — the teaching mechanic ───────────────────────────
       Returns the axes two sources SHARE. Empty array means independent.
       The rejection reason is always surfaced to the player: being told "not
       independent" teaches nothing, being told "these share PLAT-CLK-A and
       astraea-telemetry-ca" teaches the habit. */
    LagrangeEngine.prototype.independenceOf = function (aId, bId) {
        var all = (this.cfg.sensors || []).concat(this.cfg.corroborators || []);
        var a = all.filter(function (s) { return s.id === aId; })[0];
        var b = all.filter(function (s) { return s.id === bId; })[0];
        if (!a || !b) return { ok: false, shared: [], error: 'unknown source' };
        var shared = (this.cfg.independenceAxes || []).filter(function (ax) {
            return a[ax] !== undefined && a[ax] === b[ax];
        });
        return { ok: shared.length === 0, shared: shared, a: a, b: b };
    };

    /**
     * Corroborate one source with another. This is the only route to
     * 'trusted-limited', and it refuses non-independent pairs by design.
     */
    LagrangeEngine.prototype.corroborate = function (sourceId, withId) {
        var res = this.independenceOf(sourceId, withId);
        if (!res.ok) {
            this.emit('trust:rejected', {
                sourceId: sourceId, withId: withId, shared: res.shared
            });
            return res;
        }
        if (!this.state.corroborations[sourceId]) this.state.corroborations[sourceId] = [];
        if (this.state.corroborations[sourceId].indexOf(withId) === -1) {
            this.state.corroborations[sourceId].push(withId);
        }
        var n = this.state.corroborations[sourceId].length;
        this.setTrust(sourceId, n >= 1 ? 'trusted-limited' : 'corroborated');
        return res;
    };

    LagrangeEngine.prototype.setTrust = function (sourceId, stateKey) {
        this.state.trust[sourceId] = stateKey;
        this.emit('trust:changed', { sourceId: sourceId, state: stateKey });
        this.save();
    };

    LagrangeEngine.prototype.contest = function (aId, bId) {
        this.setTrust(aId, 'contested');
        this.setTrust(bId, 'contested');
    };

    /* ── Flag submission — inherited plumbing, unchanged ─────────────────────
       Sends what the player typed to validateFlag. The value is compared
       server-side against flag_registry; this engine never holds it. */
    LagrangeEngine.prototype.submitFlag = function (submission) {
        var self = this;
        var boxId = this.cfg.registryId;
        if (!boxId || !submission) return Promise.resolve({ correct: false });

        return this.orbital('flag submission', function () { return true; }, 2)
            .then(function () {
                if (typeof FirebaseAuth === 'undefined' || !FirebaseAuth.isSignedIn()) {
                    return { correct: false, offline: true };
                }
                return FirebaseAuth.callFunction('validateFlag', {
                    boxId: boxId, submission: String(submission).trim()
                }).then(function (r) {
                    var data = (r && r.data) || r || {};
                    if (data.correct) {
                        self.state.solved[data.flagId] = true;
                        self.emit('flag:captured', { flagId: data.flagId });
                        self.save();
                    } else {
                        self.state.score -= (self.cfg.scoring
                            ? self.cfg.scoring.wrongAnswerPenalty : 50);
                        self.emit('flag:rejected', {});
                        self.save();
                    }
                    return data;
                }).catch(function (e) {
                    return { correct: false, error: e && e.message };
                });
            });
    };

    LagrangeEngine.prototype.useHint = function (flagId) {
        var list = (this.cfg.hints || {})[flagId] || [];
        var used = this.state.hintsUsed[flagId] || 0;
        if (used >= list.length) return null;
        this.state.hintsUsed[flagId] = used + 1;
        this.state.score -= (this.cfg.scoring ? this.cfg.scoring.hintPenalty : 25);
        this.save();
        return list[used];
    };

    /* ── Local persistence ───────────────────────────────────────────────────
       Convenience only. It restores a session; it never establishes truth.
       Completion is whatever flag_captures says on the server. */
    LagrangeEngine.prototype.save = function () {
        try {
            localStorage.setItem(this.cfg.storageKey, JSON.stringify(this.state));
        } catch (e) { /* private mode — the session simply will not resume */ }
    };

    LagrangeEngine.prototype.load = function () {
        try {
            var raw = localStorage.getItem(this.cfg.storageKey);
            if (!raw) return;
            var saved = JSON.parse(raw);
            if (saved && typeof saved === 'object') {
                Object.keys(saved).forEach(function (k) { this.state[k] = saved[k]; }, this);
            }
        } catch (e) { /* corrupt — start clean rather than half-restored */ }
    };

    /* ── Events ──────────────────────────────────────────────────────────── */
    LagrangeEngine.prototype.on = function (evt, fn) {
        (this._listeners[evt] = this._listeners[evt] || []).push(fn);
        return this;
    };
    LagrangeEngine.prototype.emit = function (evt, payload) {
        (this._listeners[evt] || []).forEach(function (fn) {
            try { fn(payload); } catch (e) { console.error('[LAGRANGE]', evt, e); }
        });
    };

    global.LagrangeEngine = LagrangeEngine;
    if (typeof module !== 'undefined' && module.exports) module.exports = LagrangeEngine;

})(typeof window !== 'undefined' ? window : globalThis);
