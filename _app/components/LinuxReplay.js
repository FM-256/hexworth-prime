/**
 * LinuxReplay.js - shared "Try this level again" replay for Linux Mastery modules.
 *
 * A module enables replay with ONE call at the very end of its inline script:
 *     LinuxReplay.setup(MODULE_ID, tasks);
 * MODULE_ID and tasks are the module's own const values (passed in because const does not attach to
 * window). The module's saveProgress / updateProgress / showTaskInstruction / getNextIncompleteTask are
 * top-level function declarations (global), which the helper reuses.
 *
 * A replay is an EPHEMERAL practice run of an ALREADY-complete level: it persists NOTHING, so the
 * student's earned completion and XP are untouched. Safety properties (verified by QC + Nancy review):
 *  - FAIL-CLOSED: setup() honors a replay ONLY if BOTH persistence guards actually installed (the global
 *    saveProgress + ModuleProgress.complete were wrappable) AND the level was already complete. If either
 *    guard did not take (e.g. a module that IIFE-hides saveProgress), the replay is refused, not risked.
 *  - The button appears ONLY once complete; a stale/misclicked flag on an incomplete module is ignored.
 *  - ModuleProgress.complete is wrapped EARLY (at include, before the module's loadProgress repair path
 *    runs) so a replay reload never fires real completion side-effects (activity feed, class/Firestore
 *    sync, achievements) - not even via the legacy long-key repair path.
 *  - window.__replaying is set on a confirmed replay (before ObservatoryTelemetry init) so the practice
 *    run injects no synthetic session into the consented research dataset.
 */
window.LinuxReplay = (function () {
    'use strict';
    // Page-scoped: true only after setup() CONFIRMS a replay (guards installed + level already complete).
    var replaying = false;

    // Any replay-* flag pending in sessionStorage means THIS page load is a replay attempt. One module
    // loads per page, so a generic scan is safe and lets the early ModuleProgress.complete wrap suppress
    // the loadProgress repair path (which runs before setup() has validated the specific module).
    function pending() {
        try {
            for (var i = 0; i < sessionStorage.length; i++) {
                if ((sessionStorage.key(i) || '').indexOf('replay-') === 0) return true;
            }
        } catch (e) {}
        return false;
    }
    // Suppress persistence + completion side-effects during a replay (confirmed, or still pending validation).
    function suppress() { return replaying || pending(); }

    // True if every task in the module's live tasks object is currently done.
    function allDone(tasks) {
        var ids = Object.keys(tasks || {});
        return ids.length > 0 && ids.every(function (k) { return !!tasks[k]; });
    }

    // True if the module was ALREADY completed in storage. Set-size dedups a legacy duplicate-containing
    // completedTasks array so one of the right length cannot false-positive (Nancy rollout hardening).
    function wasComplete(moduleId, taskCount) {
        try {
            var p = JSON.parse(localStorage.getItem('hexworth_progress') || '{}');
            var rec = p.script && (p.script[moduleId] || p.script['script-' + moduleId]);
            if (!rec) return false;
            if (rec.completed === true) return true;
            if (Array.isArray(rec.completedTasks)) return new Set(rec.completedTasks).size >= taskCount;
            return false;
        } catch (e) { return false; }
    }

    // Show the replay button (only ever called when the module is confirmed complete).
    function reveal() {
        var b = document.getElementById('replayBtn');
        if (b) b.style.display = '';
    }

    // Inject the button (hidden) into the task panel, plus its style once. No per-module HTML/CSS needed.
    function injectButton(moduleId) {
        if (document.getElementById('replayBtn')) return;
        var panel = document.querySelector('.panel-tasks');
        if (!panel) return;
        if (!document.getElementById('linux-replay-style')) {
            var st = document.createElement('style');
            st.id = 'linux-replay-style';
            st.textContent = '.replay-btn{margin-top:.6rem;width:100%;font-size:.72rem;font-family:"JetBrains Mono",monospace;padding:.4rem .6rem;border-radius:3px;background:rgba(78,201,176,.08);border:1px solid var(--border,#333);color:var(--text-secondary,#9aa);cursor:pointer;transition:all .2s}.replay-btn:hover{border-color:var(--green,#4ec9b0);color:var(--green,#4ec9b0);background:rgba(78,201,176,.14)}';
            document.head.appendChild(st);
        }
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'replayBtn';
        btn.className = 'replay-btn';
        btn.style.display = 'none';
        btn.title = 'Restart this level for a fresh practice run. Your completion is kept.';
        btn.innerHTML = '&#8635; Try this level again';
        // Set a one-shot flag and reload; reload re-seeds the terminal and clears the whole page state.
        btn.addEventListener('click', function () {
            sessionStorage.setItem('replay-' + moduleId, '1');
            location.reload();
        });
        panel.appendChild(btn);
    }

    // Wrap ModuleProgress.complete EARLY (at include time, before any module loadProgress repair path runs)
    // so a replay reload fires no real completion side-effects; a genuine completion reveals the button.
    (function wrapModuleProgressComplete() {
        if (window.ModuleProgress && typeof window.ModuleProgress.complete === 'function' && !window.ModuleProgress.complete.__linuxReplayWrapped) {
            var origMP = window.ModuleProgress.complete;
            window.ModuleProgress.complete = function () {
                if (suppress()) return;      // replay (confirmed or pending): no completion side-effects
                var r = origMP.apply(this, arguments);
                reveal();                    // a genuine completion reveals the replay button
                return r;
            };
            window.ModuleProgress.complete.__linuxReplayWrapped = true;
        }
    })();

    // Wrap the module's global saveProgress (defined by the inline script, so only wrappable at setup time).
    // Guards on `replaying` (a CONFIRMED replay) only, NOT pending() - saveProgress is never called before
    // setup() runs EXCEPT by a module's own loadProgress self-heal (e.g. lm-09 resets stuck partial state),
    // which must be allowed to persist. On a confirmed replay the module is complete, so no self-heal fires.
    function wrapSaveProgress() {
        if (typeof window.saveProgress === 'function' && !window.saveProgress.__linuxReplayWrapped) {
            var origSave = window.saveProgress;
            window.saveProgress = function () { if (replaying) return; return origSave.apply(this, arguments); };
            window.saveProgress.__linuxReplayWrapped = true;
        }
    }

    // Both persistence guards actually installed? Gate honoring a replay on this (fail-closed).
    function guardsInstalled() {
        return !!(window.saveProgress && window.saveProgress.__linuxReplayWrapped) &&
               !!(window.ModuleProgress && window.ModuleProgress.complete && window.ModuleProgress.complete.__linuxReplayWrapped);
    }

    // Reset the already-loaded complete state to a fresh practice run (called only on a confirmed replay).
    function resetToFresh(tasks) {
        Object.keys(tasks).forEach(function (k) { tasks[k] = false; });
        document.querySelectorAll('.task-chip').forEach(function (c) { c.classList.remove('completed', 'active'); });
        if (typeof window.updateProgress === 'function') window.updateProgress();
        if (typeof window.getNextIncompleteTask === 'function' && typeof window.showTaskInstruction === 'function') {
            var first = window.getNextIncompleteTask();
            if (first) window.showTaskInstruction(first);
        }
    }

    // Public: called once by each module at the END of its inline script (after its functions + the
    // loadProgress IIFE have run, so tasks reflects the restored state).
    function setup(moduleId, tasks) {
        if (!moduleId || !tasks) return;
        // Clear any ORPHANED replay flags from other modules (an interrupted reload could leave a
        // replay-<other> key that makes pending() suppress a different module's genuine completion later
        // in this tab). One module loads per page, so any replay-* key other than ours is stale.
        try {
            var own = 'replay-' + moduleId;
            for (var i = sessionStorage.length - 1; i >= 0; i--) {
                var k = sessionStorage.key(i);
                if (k && k.indexOf('replay-') === 0 && k !== own) sessionStorage.removeItem(k);
            }
        } catch (e) {}
        injectButton(moduleId);
        wrapSaveProgress();
        var taskCount = Object.keys(tasks).length;

        var flag = sessionStorage.getItem('replay-' + moduleId);
        if (flag) {
            sessionStorage.removeItem('replay-' + moduleId);   // one-shot: consume unconditionally
            // FAIL-CLOSED: honor the replay ONLY if both guards installed AND the level was already complete.
            if (guardsInstalled() && wasComplete(moduleId, taskCount)) {
                replaying = true;
                window.__replaying = true;                     // suppresses Observatory telemetry this reload
                reveal();
                resetToFresh(tasks);
                return;
            }
            // refused (guards did not take, or not complete) -> leave the normal restored state intact
        }
        // Normal load: offer replay only if the level is already complete.
        if (allDone(tasks) || wasComplete(moduleId, taskCount)) reveal();
    }

    return { setup: setup, isReplaying: function () { return replaying; }, reveal: reveal };
})();
