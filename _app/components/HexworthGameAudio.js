/**
 * HexworthGameAudio.js -- Procedural game-show audio for PIS Jeopardy + Kahoot
 *
 * All sounds synthesized via Web Audio API. No MP3 files required, no
 * licensing concerns, no bytes-over-wire beyond this script. Modeled on the
 * proven BlacksiteAudio.js pattern (see _app/components/BlacksiteAudio.js).
 *
 * Public API:
 *   HexworthGameAudio.init()                  // call on first user click
 *   HexworthGameAudio.resume()                // resume suspended AudioContext
 *
 *   // Jeopardy
 *   HexworthGameAudio.startThink()            // loop while clue is on-screen
 *   HexworthGameAudio.stopThink()
 *   HexworthGameAudio.dailyDouble()           // DD splash sting (one-shot)
 *   HexworthGameAudio.finalFanfare()          // final score modal (one-shot)
 *
 *   // Kahoot
 *   HexworthGameAudio.startTimer(durationSec) // looping countdown ticks
 *   HexworthGameAudio.stopTimer()
 *   HexworthGameAudio.streak()                // streak bonus (one-shot)
 *
 *   // Shared one-shots
 *   HexworthGameAudio.correct()
 *   HexworthGameAudio.wrong()
 *
 *   // Volume / mute (persists via localStorage 'hexworth_audio_pref')
 *   HexworthGameAudio.setVolume(0..1)
 *   HexworthGameAudio.toggleMute() -> bool (new muted state)
 *   HexworthGameAudio.isMuted()
 *   HexworthGameAudio.isEnabled() -> bool   // user-preference, not browser state
 *   HexworthGameAudio.setEnabled(bool)
 */

const HexworthGameAudio = (function() {
    'use strict';

    const STORAGE_KEY = 'hexworth_audio_pref';   // 'on' | 'off'

    let ctx           = null;
    let masterGain    = null;
    let initialized   = false;
    let muted         = false;
    let masterVolume  = 0.4;     // sane default; mute toggle pivots from here

    // Active loop state
    let thinkLoop     = null;    // { gain, stop:Function }
    let timerLoop     = null;    // { tickTimer, stopRequested }

    // ── Init ───────────────────────────────────────────────────────
    function init() {
        if (initialized) return true;
        try {
            ctx        = new (window.AudioContext || window.webkitAudioContext)();
            masterGain = ctx.createGain();
            masterGain.gain.value = masterVolume;
            masterGain.connect(ctx.destination);
            initialized = true;
            return true;
        } catch (e) {
            console.warn('[HexworthGameAudio] Web Audio API unavailable:', e);
            return false;
        }
    }

    function resume() {
        if (ctx && ctx.state === 'suspended') {
            ctx.resume();
        }
    }

    /**
     * Combined init+resume. Called at the top of every sound-producing
     * method so the FIRST user gesture that triggers a game event
     * (e.g. first Jeopardy cell click) creates the AudioContext inline,
     * avoiding the lazy-init race where startThink() would run before
     * the board-level lazy-init handler had a chance to call init().
     * Web Audio policy is satisfied because we're already inside the
     * user-gesture callback that produced the sound request.
     */
    function ensureRunning() {
        if (!initialized) { if (!init()) return false; }
        if (ctx.state === 'suspended') ctx.resume();
        return true;
    }

    // ── Voice helpers ──────────────────────────────────────────────
    function makeOsc(freq, type) {
        const o = ctx.createOscillator();
        o.type      = type || 'sine';
        o.frequency.value = freq;
        return o;
    }

    /** ADSR-style envelope: returns a gain node, schedules attack+release. */
    function envGain(startT, attack, sustain, release, peak) {
        const g = ctx.createGain();
        const p = peak == null ? 0.6 : peak;
        g.gain.setValueAtTime(0, startT);
        g.gain.linearRampToValueAtTime(p,    startT + attack);
        g.gain.linearRampToValueAtTime(p,    startT + attack + sustain);
        g.gain.linearRampToValueAtTime(0,    startT + attack + sustain + release);
        return g;
    }

    function bleep(freq, when, dur, type, peak) {
        if (!ensureRunning() || muted) return;
        const o  = makeOsc(freq, type || 'square');
        const g  = envGain(when, 0.005, dur, 0.05, peak == null ? 0.35 : peak);
        o.connect(g).connect(masterGain);
        o.start(when);
        o.stop(when + dur + 0.1);
    }

    // ── JEOPARDY: 30-second tense think loop ───────────────────────
    // Approximation of "thinking" mood, not a copy of the Merv Griffin
    // theme. Plays an ascending pentatonic-flavored arpeggio over a
    // soft bass pulse. Loops indefinitely until stopThink() is called.
    function startThink() {
        if (!ensureRunning() || muted) return;
        stopThink();
        const loopGain = ctx.createGain();
        loopGain.gain.value = 0.25;
        loopGain.connect(masterGain);

        // C minor 7 arpeggio in a "thinking" register
        const notes  = [261.63, 311.13, 392.00, 466.16]; // C4, Eb4, G4, Bb4
        const bassN  = [130.81, 196.00];                 // C3, G3
        const tempo  = 60 / 84;   // 84 BPM -> ~0.714s per beat
        const step   = tempo / 2;  // eighth note

        let beat   = 0;
        let active = true;
        function nextBar() {
            if (!active) return;
            const tStart = ctx.currentTime + 0.02;
            // Bass on beats 1 + 3 (alternating root/fifth)
            for (let b = 0; b < 4; b++) {
                const bassF = bassN[(beat + b) & 1];
                const o = makeOsc(bassF, 'sine');
                const g = envGain(tStart + b * tempo, 0.02, tempo * 0.7, 0.05, 0.55);
                o.connect(g).connect(loopGain);
                o.start(tStart + b * tempo);
                o.stop(tStart + (b+1) * tempo);
            }
            // Melody arpeggio (8 eighths per bar)
            for (let i = 0; i < 8; i++) {
                const noteF = notes[i % notes.length];
                const o = makeOsc(noteF, 'triangle');
                const g = envGain(tStart + i * step, 0.01, step * 0.6, 0.05, 0.45);
                o.connect(g).connect(loopGain);
                o.start(tStart + i * step);
                o.stop(tStart + (i+1) * step + 0.02);
            }
            beat++;
            setTimeout(nextBar, 4 * tempo * 1000);
        }
        nextBar();
        thinkLoop = {
            gain: loopGain,
            stop: function() {
                active = false;
                loopGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.2);
                setTimeout(function() {
                    try { loopGain.disconnect(); } catch(_){}
                }, 250);
            }
        };
    }

    function stopThink() {
        if (thinkLoop) {
            thinkLoop.stop();
            thinkLoop = null;
        }
    }

    // ── JEOPARDY: Daily Double sting ───────────────────────────────
    // Rising bright fanfare ~1.2s: ascending C major triad with shimmer.
    function dailyDouble() {
        if (!ensureRunning() || muted) return;
        const t0 = ctx.currentTime + 0.02;
        const triad = [523.25, 659.25, 783.99]; // C5, E5, G5
        for (let i = 0; i < triad.length; i++) {
            const o = makeOsc(triad[i], 'sawtooth');
            const g = envGain(t0 + i * 0.08, 0.015, 0.55, 0.25, 0.4);
            const lp = ctx.createBiquadFilter();
            lp.type = 'lowpass'; lp.frequency.value = 2400; lp.Q.value = 0.8;
            o.connect(lp).connect(g).connect(masterGain);
            o.start(t0 + i * 0.08);
            o.stop(t0 + i * 0.08 + 0.85);
        }
        // Bright top shimmer
        const top = makeOsc(1046.50, 'triangle'); // C6
        const topG = envGain(t0 + 0.24, 0.04, 0.55, 0.3, 0.25);
        top.connect(topG).connect(masterGain);
        top.start(t0 + 0.24);
        top.stop(t0 + 1.15);
    }

    // ── JEOPARDY: Final fanfare (3-note ascending + sustained chord) ─
    function finalFanfare() {
        if (!ensureRunning() || muted) return;
        const t0 = ctx.currentTime + 0.05;
        const lead = [523.25, 659.25, 783.99]; // C5, E5, G5
        for (let i = 0; i < 3; i++) {
            const o = makeOsc(lead[i], 'square');
            const g = envGain(t0 + i * 0.18, 0.01, 0.13, 0.04, 0.35);
            o.connect(g).connect(masterGain);
            o.start(t0 + i * 0.18);
            o.stop(t0 + (i+1) * 0.18 + 0.04);
        }
        // Sustained closing chord
        const chord = [523.25, 659.25, 783.99, 1046.50];
        const start = t0 + 0.6;
        chord.forEach(function(f) {
            const o = makeOsc(f, 'triangle');
            const g = envGain(start, 0.04, 1.2, 0.6, 0.22);
            o.connect(g).connect(masterGain);
            o.start(start);
            o.stop(start + 1.9);
        });
    }

    // ── KAHOOT: timer countdown ticks ──────────────────────────────
    // Schedules quarter-note ticks for `durationSec`. Tick gets sharper
    // and slightly higher-pitched in the final 5 seconds for urgency.
    function startTimer(durationSec) {
        if (!ensureRunning() || muted) return;
        stopTimer();
        const dur = durationSec || 30;
        const startMs = Date.now();
        let active = true;
        function tickNext() {
            if (!active) return;
            const elapsed = (Date.now() - startMs) / 1000;
            const remain  = dur - elapsed;
            if (remain <= 0) return;
            // Tick: short percussive blip
            const freq = remain <= 5 ? 1000 : 600;
            bleep(freq, ctx.currentTime + 0.005, remain <= 5 ? 0.06 : 0.04, 'square', 0.18);
            // Interval shortens in the last 5s (urgency)
            const nextMs = remain <= 5 ? 200 : 1000;
            setTimeout(tickNext, nextMs);
        }
        timerLoop = { stop: function() { active = false; } };
        tickNext();
    }

    function stopTimer() {
        if (timerLoop) {
            timerLoop.stop();
            timerLoop = null;
        }
    }

    // ── KAHOOT: streak bonus (one-shot) ────────────────────────────
    function streak() {
        if (!ensureRunning() || muted) return;
        const t0 = ctx.currentTime + 0.02;
        const seq = [523.25, 659.25, 783.99, 1046.50]; // C-E-G-C ascending
        for (let i = 0; i < seq.length; i++) {
            const o = makeOsc(seq[i], 'triangle');
            const g = envGain(t0 + i * 0.06, 0.005, 0.08, 0.04, 0.30);
            o.connect(g).connect(masterGain);
            o.start(t0 + i * 0.06);
            o.stop(t0 + (i+1) * 0.06 + 0.05);
        }
    }

    // ── Shared one-shots ───────────────────────────────────────────
    function correct() {
        if (!ensureRunning() || muted) return;
        const t0 = ctx.currentTime + 0.01;
        // Two-note major third "ding" (C5 -> E5) with bell-like timbre
        [{f: 523.25, when: 0},    {f: 659.25, when: 0.10}].forEach(function(n) {
            const o = makeOsc(n.f, 'triangle');
            const g = envGain(t0 + n.when, 0.005, 0.25, 0.15, 0.40);
            o.connect(g).connect(masterGain);
            o.start(t0 + n.when);
            o.stop(t0 + n.when + 0.42);
        });
    }

    function wrong() {
        if (!ensureRunning() || muted) return;
        const t0 = ctx.currentTime + 0.01;
        // Descending semitone with muffled timbre
        const o = makeOsc(220, 'sawtooth');
        o.frequency.setValueAtTime(220, t0);
        o.frequency.exponentialRampToValueAtTime(110, t0 + 0.28);
        const lp = ctx.createBiquadFilter();
        lp.type = 'lowpass'; lp.frequency.value = 600; lp.Q.value = 1.4;
        const g = envGain(t0, 0.005, 0.22, 0.1, 0.34);
        o.connect(lp).connect(g).connect(masterGain);
        o.start(t0);
        o.stop(t0 + 0.35);
    }

    // ── Volume / mute / preference ─────────────────────────────────
    // Known limitation: mute() stops the currently-playing think loop +
    // timer ticks immediately. unmute() restores masterGain but does
    // NOT restart whatever loop was active before the mute. So a
    // student who mutes mid-clue + unmutes mid-clue gets silence for
    // the rest of that clue/question. Re-triggering loops here would
    // require the module to track active context (which game, which
    // event), which adds state we don't currently keep. Acceptable for
    // a self-paced review: the next event (close modal, next question)
    // re-enters the playing state correctly.
    function setVolume(v) {
        masterVolume = Math.max(0, Math.min(1, v));
        if (masterGain) masterGain.gain.value = muted ? 0 : masterVolume;
    }
    function getVolume() { return masterVolume; }
    function mute() {
        muted = true;
        if (masterGain) masterGain.gain.value = 0;
        stopThink(); stopTimer();
    }
    function unmute() {
        muted = false;
        if (masterGain) masterGain.gain.value = masterVolume;
    }
    function toggleMute() {
        if (muted) unmute(); else mute();
        try { localStorage.setItem(STORAGE_KEY, muted ? 'off' : 'on'); } catch(_){}
        return muted;
    }
    function isMuted()  { return muted; }
    function isEnabled() {
        try {
            const v = localStorage.getItem(STORAGE_KEY);
            // Default ON for first-time visit; explicit 'off' silences.
            return v !== 'off';
        } catch(_) { return true; }
    }
    function setEnabled(on) {
        try { localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off'); } catch(_){}
        if (on) unmute(); else mute();
    }

    // Apply persisted preference at module-load time so the toggle UI
    // can read the initial state without an extra round-trip.
    (function applyStoredPref() {
        try {
            const v = localStorage.getItem(STORAGE_KEY);
            if (v === 'off') muted = true;
        } catch(_){}
    })();

    return {
        init: init,
        resume: resume,
        startThink: startThink,
        stopThink:  stopThink,
        dailyDouble: dailyDouble,
        finalFanfare: finalFanfare,
        startTimer: startTimer,
        stopTimer:  stopTimer,
        streak:     streak,
        correct:    correct,
        wrong:      wrong,
        setVolume:  setVolume,
        getVolume:  getVolume,
        mute:       mute,
        unmute:     unmute,
        toggleMute: toggleMute,
        isMuted:    isMuted,
        isEnabled:  isEnabled,
        setEnabled: setEnabled
    };
})();

// Expose explicitly on window so other top-level <script> tags can use
// `window.HexworthGameAudio.x()` (top-level `const` does NOT attach to
// window automatically; bare access still works in the same realm).
if (typeof window !== 'undefined') {
    window.HexworthGameAudio = HexworthGameAudio;
}
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HexworthGameAudio;
}
