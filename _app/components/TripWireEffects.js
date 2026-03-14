/**
 * TripWireEffects.js — Visual Consequences for Hacking Attempts
 *
 * Listens for hexworth:tripwire events and delivers escalating
 * visual chaos. Educational and entertaining — the punishment
 * IS the content.
 *
 * Escalation tiers (generic fallback):
 *   Trip 1     -> Glitch + warning toast
 *   Trip 2     -> Fake trace sequence
 *   Trip 3     -> ACCESS DENIED takeover
 *   Trip 4     -> Fake file deletion
 *   Trip 5     -> Page upside-down + gravity flip
 *   Trip 6     -> BSOD (Blue Screen of Death)
 *   Trip 7     -> "Calling campus security" prank
 *   Trip 8     -> Page slowly fades to nothing
 *   Trip 9     -> The Matrix rain takeover
 *   Trip 10+   -> Redirect to Wall of Shame
 *
 * Sensor-specific effects (bypass tier system):
 *   Storage    -> Screen cracks like broken glass
 *   Cross-tab  -> Portal breach (crack + purple toast)
 *   Decoy      -> Honeypot takeover (amber)
 *   Console    -> Terminal intercept toast (orange)
 *   Runtime    -> Frozen lock toast (purple)
 *   DOM        -> Element revert flash (cyan)
 *   Timer      -> Clock distortion toast (yellow)
 *   XSS        -> Injection warning toast (hot pink)
 *   DevTools   -> Consent modal (handled by TripWire.js)
 *
 * Ambient effects (every trip):
 *   - Console ASCII art flood
 *   - Screen shake + color glitch
 *   - Fake notification sound (Web Audio API beep)
 *   - Random page elements start spinning/melting
 *
 * Audio engine (all tiers):
 *   - Tier-matched synthesized sounds (beep, modem, klaxon, HDD, etc.)
 *   - Escalating heartbeat (80bpm -> 180bpm)
 *   - Terminal typing clicks
 *   - Speech synthesis ("Access denied", "Wake up", etc.)
 *   - Zero audio files — pure Web Audio API
 *
 * @version 4.0.0
 */
(function () {
  'use strict';

  if (window.__TripWireEffects) return;

  /* ── Constants ─────────────────────────────────────────────── */
  var WALL_OF_SHAME = '/wall-of-shame/';
  var GLITCH_MS     = 3000;
  var TAKEOVER_MS   = 8000;
  var DELETE_MS     = 10000;
  var BSOD_MS       = 10000;
  var MATRIX_MS     = 10000;

  var TRACE_LINES = [
    'INITIALIZING TRACE PROTOCOL...',
    'SPOOFING COUNTERMEASURES: BYPASSED',
    'RESOLVING MAC ADDRESS... 4A:2C:8F:1D:B3:E7',
    'GEOLOCATING NODE...',
    'CONNECTING TO ADMIN NODE...',
    'QUERYING STUDENT DATABASE...',
    'CROSS-REFERENCING IP LOGS...',
    'CHECKING BROWSER FINGERPRINT...',
    'MATCH FOUND.',
    '',
    'STUDENT IDENTIFIED.',
    'ACADEMIC INTEGRITY MODULE: ENGAGED',
    'LOGGING INCIDENT TO INSTRUCTOR DASHBOARD...',
    'SCREENSHOT CAPTURED.',
    'INCIDENT REPORT #' + Math.floor(Math.random() * 9000 + 1000) + ' FILED.',
    '',
    'Have a nice day. We will be in touch.'
  ];

  var DELETE_LINES = [
    'C:\\HEXWORTH\\STUDENT_DATA> dir /s',
    '  Directory of C:\\HEXWORTH\\STUDENT_DATA\\',
    '  03/11/2026  02:14 AM    <DIR>          progress',
    '  03/11/2026  02:14 AM    <DIR>          achievements',
    '  03/11/2026  02:14 AM    <DIR>          certificates',
    '  03/11/2026  02:14 AM         253,000   xp_balance.dat',
    '',
    'C:\\HEXWORTH\\STUDENT_DATA> del /f /s /q *.*',
    'Deleting progress\\modules.json.......... done.',
    'Deleting progress\\labs.json............. done.',
    'Deleting achievements\\earned.db......... done.',
    'Deleting achievements\\badges.db......... done.',
    'Deleting xp_balance.dat................ done.',
    'Deleting certificates\\*.pdf............ done.',
    'Deleting graduation_status.xml......... done.',
    'Deleting recommendation_letters.docx... done.',
    '',
    '   8 file(s) deleted.',
    '   0 bytes remaining.',
    '',
    'ALL STUDENT DATA PURGED.',
    '',
    'Just kidding.',
    'But your instructor HAS been notified.',
    'Check the Wall of Shame.'
  ];

  var SECURITY_LINES = [
    '[HEXWORTH SECURITY SYSTEM v3.7.1]',
    '',
    'ALERT LEVEL: CRITICAL',
    'VIOLATION: Unauthorized data manipulation detected',
    'RESPONSE: Escalating to campus security...',
    '',
    'Dialing extension 4771...',
    'CONNECTED.',
    '',
    'CAMPUS SECURITY: "We have a 10-71 in the computer lab."',
    'DISPATCH: "Copy that. Unit en route. ETA 3 minutes."',
    'CAMPUS SECURITY: "Student appears to be using DevTools."',
    'DISPATCH: "Understood. Sending the serious one."',
    '',
    '...',
    '',
    'Relax. We are not actually calling anyone.',
    'But we COULD forward this to your instructor.',
    'Something to think about.'
  ];

  var BUSTED_QUOTES = [
    'You thought you were clever.',
    'The system sees all.',
    'Nice try, script kiddie.',
    'Your DevTools skills need work.',
    'Did you really think that would work?',
    'Achievement Unlocked: Got Caught.',
    'Pro tip: the XP is server-validated.',
    'Somewhere, an instructor is laughing.',
    'This incident has been logged.',
    'TripWire says hello.',
    'Ctrl+Shift+I was a mistake.',
    'Your localStorage called. It said no.',
    'Error 403: Cheating Not Permitted.',
    'Hack the planet? You cannot even hack the gradebook.',
    'The real exploit was the friends you made along the way.',
    'Have you tried actually studying?',
    'Your attempt has been noted. And mocked.',
    'Alert: Student exceeded maximum hubris threshold.',
    'The best hackers never get caught. You are not the best.',
    'Roses are red, violets are blue, we logged your attempt, and your MAC address too.'
  ];

  var BSOD_ERROR_CODES = [
    'STUDENT_INTEGRITY_VIOLATION',
    'UNAUTHORIZED_XP_MANIPULATION',
    'DEVTOOLS_ABUSE_DETECTED',
    'LOCALSTORAGE_TAMPERING_FAULT',
    'ACHIEVEMENT_INJECTION_OVERFLOW',
    'GRADE_INFLATION_EXCEPTION'
  ];

  /* ── Category-specific effect messages ──────────────────────
   * Each bypass category from TripWire.js gets tailored toast
   * text and console messages. Keyed by dispatch category.
   * ─────────────────────────────────────────────────────────── */
  var CATEGORY_MESSAGES = {
    // Sensor 1: Storage Integrity
    storage_tampering: {
      toast:   'STORAGE TAMPERING DETECTED',
      detail:  'Your localStorage changes have been reverted. Nice try.',
      console: 'Storage integrity sensor tripped. All writes are checksummed and snapshotted.',
      teach:   'In production, server-side validation prevents client-side data manipulation.'
    },
    cross_tab_tampering: {
      toast:   'CROSS-TAB BYPASS DETECTED',
      detail:  'Opening another tab to edit localStorage? We monitor that too.',
      console: 'Cross-tab storage event intercepted. Suspicious value delta flagged.',
      teach:   'Real apps use server-authoritative state. Client storage is just a cache.'
    },
    // Sensor 2: Runtime Object Freeze
    runtime_manipulation: {
      toast:   'RUNTIME MANIPULATION BLOCKED',
      detail:  'Object.defineProperty cannot save you. This property is frozen.',
      console: 'Console attempted to override a protected runtime property.',
      teach:   'Object.freeze() and non-configurable descriptors are real JS hardening techniques.'
    },
    // Sensor 3: DOM MutationObserver
    dom_tampering: {
      toast:   'DOM TAMPERING DETECTED',
      detail:  'Protected elements are watched by MutationObserver. Your edit was reverted.',
      console: 'MutationObserver caught unauthorized DOM modification.',
      teach:   'MutationObservers are used in real security tools to detect DOM-based attacks.'
    },
    // Sensor 4: Console Injection
    console_injection: {
      toast:   'CONSOLE INJECTION DETECTED',
      detail:  'Calling internal methods from DevTools console is monitored.',
      console: 'Stack trace analysis identified console-origin function call.',
      teach:   'Stack trace forensics can distinguish legitimate code paths from console injection.'
    },
    // Sensor 5: Timer Manipulation
    timer_manipulation: {
      toast:   'TIMER MANIPULATION DETECTED',
      detail:  'Clock drift or timer replacement detected. The heartbeat knows.',
      console: 'Heartbeat anomaly or native timer replacement detected.',
      teach:   'Anti-cheat systems use heartbeat monitors to detect time manipulation in games.'
    },
    // Sensor 6: Decoy Flags (Honeypots)
    honeypot_access: {
      toast:   'HONEYPOT TRIGGERED',
      detail:  'That variable was planted to catch you. You fell for it.',
      console: 'Decoy property getter fired. Honeypot access logged.',
      teach:   'Honeypots are a real defensive technique. The bait looked too good to pass up.'
    },
    // Sensor 7: XSS Pattern Detection
    xss_attempt: {
      toast:   'XSS PATTERN DETECTED',
      detail:  'Script injection patterns detected in input field.',
      console: 'Input matched known XSS payload signature.',
      teach:   'Input validation and output encoding are the primary defenses against XSS.'
    },
    // Sensor 8: DevTools Detection
    devtools_opened: {
      toast:   'DEVELOPER TOOLS DETECTED',
      detail:  'This session is now monitored. All actions are being recorded.',
      console: 'Window size delta or debugger timing detected DevTools panel.',
      teach:   'DevTools detection uses viewport measurements and debugger statement timing.'
    },
    devtools_consent: {
      toast:   'MONITORING ACKNOWLEDGED',
      detail:  'You accepted the risk. Every console command is now logged.',
      console: 'Student consented to monitoring. Session forensics active.',
      teach:   'Consent-based monitoring is standard in enterprise and educational environments.'
    },
    devtools_denial: {
      toast:   'STILL MONITORED',
      detail:  'Clicking "Close DevTools" does not stop the monitoring.',
      console: 'Student clicked denial but DevTools remain open. Monitoring continues.',
      teach:   'In security, closing the dialog does not close the investigation.'
    }
  };

  /* ── State ─────────────────────────────────────────────────── */
  var fxCount = 0;
  var activeOverlay = null;
  var audioCtx = null;

  /* ── Utility ───────────────────────────────────────────────── */
  function randomQuote() {
    return BUSTED_QUOTES[Math.floor(Math.random() * BUSTED_QUOTES.length)];
  }

  function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function injectStyle() {
    if (document.getElementById('tw-fx-style')) return;
    var style = document.createElement('style');
    style.id = 'tw-fx-style';
    style.textContent = [
      '@keyframes tw-glitch {',
      '  0%   { transform: translate(0); filter: hue-rotate(0deg); }',
      '  10%  { transform: translate(-5px, 3px); filter: hue-rotate(90deg); }',
      '  20%  { transform: translate(3px, -2px); filter: hue-rotate(180deg); }',
      '  30%  { transform: translate(-3px, 5px); filter: hue-rotate(270deg); }',
      '  40%  { transform: translate(5px, -3px); filter: hue-rotate(360deg); }',
      '  50%  { transform: translate(-2px, 2px); filter: hue-rotate(45deg); }',
      '  60%  { transform: translate(4px, -4px); filter: hue-rotate(135deg); }',
      '  70%  { transform: translate(-4px, 3px); filter: hue-rotate(225deg); }',
      '  80%  { transform: translate(2px, -5px); filter: hue-rotate(315deg); }',
      '  90%  { transform: translate(-3px, 1px); filter: hue-rotate(60deg); }',
      '  100% { transform: translate(0); filter: hue-rotate(0deg); }',
      '}',
      '@keyframes tw-flicker {',
      '  0%, 100% { opacity: 1; }',
      '  50%      { opacity: 0.8; }',
      '  75%      { opacity: 0.95; }',
      '}',
      '@keyframes tw-pulse-red {',
      '  0%, 100% { box-shadow: 0 0 20px rgba(255,0,0,0.3); }',
      '  50%      { box-shadow: 0 0 60px rgba(255,0,0,0.8); }',
      '}',
      '@keyframes tw-shake {',
      '  0%, 100% { transform: translateX(0); }',
      '  10% { transform: translateX(-10px) rotate(-1deg); }',
      '  20% { transform: translateX(10px) rotate(1deg); }',
      '  30% { transform: translateX(-8px) rotate(-0.5deg); }',
      '  40% { transform: translateX(8px) rotate(0.5deg); }',
      '  50% { transform: translateX(-5px); }',
      '  60% { transform: translateX(5px); }',
      '  70% { transform: translateX(-3px); }',
      '  80% { transform: translateX(3px); }',
      '  90% { transform: translateX(-1px); }',
      '}',
      '@keyframes tw-spin-el {',
      '  from { transform: rotate(0deg); }',
      '  to { transform: rotate(360deg); }',
      '}',
      '@keyframes tw-melt {',
      '  0% { transform: scaleY(1) translateY(0); filter: blur(0); }',
      '  50% { transform: scaleY(1.5) translateY(30px); filter: blur(2px); }',
      '  100% { transform: scaleY(3) translateY(80px); filter: blur(5px); opacity: 0; }',
      '}',
      '@keyframes tw-matrix-fall {',
      '  0% { transform: translateY(-100%); }',
      '  100% { transform: translateY(100vh); }',
      '}',
      '@keyframes tw-crack-spread {',
      '  0% { clip-path: circle(0% at var(--crack-x, 50%) var(--crack-y, 50%)); }',
      '  100% { clip-path: circle(150% at var(--crack-x, 50%) var(--crack-y, 50%)); }',
      '}',
      '@keyframes tw-fade-page {',
      '  0% { opacity: 1; filter: blur(0); }',
      '  50% { opacity: 0.5; filter: blur(2px); }',
      '  100% { opacity: 0; filter: blur(10px); }',
      '}',
      '.tw-glitch-active {',
      '  animation: tw-glitch 0.15s ease-in-out infinite !important;',
      '}',
      '.tw-shake-active {',
      '  animation: tw-shake 0.5s ease-in-out !important;',
      '}',
      '.tw-overlay {',
      '  position: absolute;',
      '  top: 0; left: 0;',
      '  width: 100%; height: 100%;',
      '  min-height: 100vh;',
      '  z-index: 999999;',
      '  display: flex;',
      '  flex-direction: column;',
      '  align-items: center;',
      '  justify-content: center;',
      '  font-family: "Courier New", Courier, monospace;',
      '  pointer-events: all;',
      '  transition: opacity 0.5s;',
      '}',
      '.tw-overlay-dark {',
      '  background: rgba(0, 0, 0, 0.97);',
      '  color: #ff3333;',
      '}',
      '.tw-overlay-terminal {',
      '  background: #0a0a0a;',
      '  color: #00ff41;',
      '  align-items: flex-start;',
      '  padding: 40px;',
      '}',
      '.tw-overlay-bsod {',
      '  background: #0078d7;',
      '  color: white;',
      '  text-align: left;',
      '  padding: 10% 15%;',
      '}',
      '.tw-toast {',
      '  position: absolute;',
      '  top: 20px;',
      '  right: 20px;',
      '  z-index: 999998;',
      '  background: #1a0000;',
      '  border: 2px solid #ff3333;',
      '  color: #ff3333;',
      '  padding: 16px 24px;',
      '  font-family: "Courier New", Courier, monospace;',
      '  font-size: 14px;',
      '  max-width: 400px;',
      '  animation: tw-pulse-red 1s ease-in-out infinite;',
      '  pointer-events: none;',
      '}',
      '.tw-big-text {',
      '  font-size: clamp(36px, 8vw, 96px);',
      '  font-weight: bold;',
      '  text-transform: uppercase;',
      '  text-shadow: 0 0 20px currentColor;',
      '  animation: tw-flicker 0.5s ease-in-out infinite;',
      '}',
      '.tw-sub-text {',
      '  font-size: clamp(14px, 2.5vw, 24px);',
      '  margin-top: 20px;',
      '  opacity: 0.8;',
      '}',
      '.tw-terminal-line {',
      '  font-size: clamp(12px, 1.5vw, 18px);',
      '  line-height: 1.8;',
      '  white-space: pre;',
      '  opacity: 0;',
      '  transition: opacity 0.3s;',
      '}',
      '.tw-terminal-line.visible { opacity: 1; }',
      '.tw-cursor {',
      '  display: inline-block;',
      '  width: 10px;',
      '  height: 18px;',
      '  background: #00ff41;',
      '  animation: tw-flicker 0.7s step-end infinite;',
      '  vertical-align: middle;',
      '  margin-left: 4px;',
      '}',
      '.tw-scanlines {',
      '  position: absolute;',
      '  top: 0; left: 0;',
      '  width: 100%; height: 100%;',
      '  background: repeating-linear-gradient(',
      '    0deg,',
      '    transparent,',
      '    transparent 2px,',
      '    rgba(0,255,65,0.03) 2px,',
      '    rgba(0,255,65,0.03) 4px',
      '  );',
      '  pointer-events: none;',
      '  z-index: 1000000;',
      '}',
      '.tw-crack-overlay {',
      '  position: absolute;',
      '  top: 0; left: 0;',
      '  width: 100%; height: 100%;',
      '  z-index: 999998;',
      '  pointer-events: none;',
      '  background: radial-gradient(circle at var(--crack-x, 50%) var(--crack-y, 50%),',
      '    transparent 0%, transparent 2%,',
      '    rgba(255,255,255,0.8) 2%, transparent 2.5%,',
      '    transparent 4%, rgba(255,255,255,0.6) 4%, transparent 4.3%,',
      '    transparent 7%, rgba(255,255,255,0.4) 7%, transparent 7.2%,',
      '    transparent 12%, rgba(255,255,255,0.3) 12%, transparent 12.1%,',
      '    transparent 18%, rgba(255,255,255,0.2) 18%, transparent 18.1%,',
      '    transparent 25%, rgba(255,255,255,0.1) 25%, transparent 25.1%',
      '  ),',
      '  linear-gradient(var(--crack-angle1, 35deg),',
      '    transparent 45%, rgba(255,255,255,0.5) 49.5%, rgba(0,0,0,0.3) 50%,',
      '    rgba(255,255,255,0.5) 50.5%, transparent 55%',
      '  ),',
      '  linear-gradient(var(--crack-angle2, 120deg),',
      '    transparent 47%, rgba(255,255,255,0.4) 49.5%, rgba(0,0,0,0.2) 50%,',
      '    rgba(255,255,255,0.4) 50.5%, transparent 53%',
      '  ),',
      '  linear-gradient(var(--crack-angle3, 200deg),',
      '    transparent 46%, rgba(255,255,255,0.3) 49.5%, rgba(0,0,0,0.2) 50%,',
      '    rgba(255,255,255,0.3) 50.5%, transparent 54%',
      '  );',
      '  animation: tw-crack-spread 0.3s ease-out forwards;',
      '}',
      '.tw-matrix-column {',
      '  position: absolute;',
      '  top: -100%;',
      '  font-family: "Courier New", monospace;',
      '  font-size: 14px;',
      '  color: #00ff41;',
      '  writing-mode: vertical-rl;',
      '  text-orientation: upright;',
      '  letter-spacing: 3px;',
      '  text-shadow: 0 0 10px #00ff41;',
      '  animation: tw-matrix-fall linear forwards;',
      '  opacity: 0.8;',
      '  white-space: nowrap;',
      '}',
      '.tw-bsod-frown {',
      '  font-size: clamp(60px, 12vw, 120px);',
      '  margin-bottom: 20px;',
      '}',
      '.tw-bsod-title {',
      '  font-size: clamp(20px, 4vw, 36px);',
      '  margin-bottom: 20px;',
      '}',
      '.tw-bsod-body {',
      '  font-size: clamp(12px, 2vw, 18px);',
      '  line-height: 2;',
      '  max-width: 700px;',
      '}',
      '.tw-bsod-progress {',
      '  margin-top: 30px;',
      '  font-size: clamp(14px, 2vw, 20px);',
      '}',
      '.tw-upside-down {',
      '  transform: rotate(180deg) !important;',
      '  transition: transform 2s ease-in-out !important;',
      '}',
      '.tw-spinning-el {',
      '  animation: tw-spin-el 2s linear infinite !important;',
      '}',
      '.tw-melting-el {',
      '  animation: tw-melt 3s ease-in forwards !important;',
      '}'
    ].join('\n');
    document.head.appendChild(style);
  }

  function removeOverlay() {
    if (activeOverlay && activeOverlay.parentNode) {
      activeOverlay.style.opacity = '0';
      var el = activeOverlay;
      setTimeout(function () {
        if (el.parentNode) el.parentNode.removeChild(el);
      }, 600);
      activeOverlay = null;
    }
    document.body.classList.remove('tw-glitch-active');
    document.body.classList.remove('tw-shake-active');
  }

  /* ══════════════════════════════════════════════════════════════
   * AUDIO ENGINE — Tier-matched synthesized sounds
   * All sounds are generated via Web Audio API (zero files).
   * ══════════════════════════════════════════════════════════════ */

  function _ensureAudio() {
    try {
      if (!audioCtx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return false;
        audioCtx = new AC();
      }
      if (audioCtx.state === 'suspended') audioCtx.resume();
      return true;
    } catch (e) { return false; }
  }

  function _osc(type, freq, vol, start, dur) {
    var o = audioCtx.createOscillator();
    var g = audioCtx.createGain();
    o.connect(g);
    g.connect(audioCtx.destination);
    o.type = type;
    o.frequency.value = freq;
    g.gain.value = vol;
    o.start(start);
    o.stop(start + dur);
    return { osc: o, gain: g };
  }

  /* Tier 1: Single sharp beep — quick stab */
  function audioSharpBeep() {
    if (!_ensureAudio()) return;
    var t = audioCtx.currentTime;
    _osc('square', 1200, 0.1, t, 0.08);
    _osc('square', 800, 0.06, t + 0.1, 0.06);
  }

  /* Tier 2: Dial-up modem — sells the "trace" */
  function audioDialUp() {
    if (!_ensureAudio()) return;
    var t = audioCtx.currentTime;
    // Carrier tone
    var carrier = _osc('sine', 1070, 0.06, t, 2.5);
    // Modulation sweep
    var sweep = _osc('sawtooth', 300, 0.03, t, 0.8);
    sweep.osc.frequency.linearRampToValueAtTime(2400, t + 0.8);
    // Static burst
    _osc('sawtooth', 4000, 0.02, t + 0.9, 0.3);
    _osc('square', 1650, 0.04, t + 1.3, 0.4);
    _osc('square', 1850, 0.04, t + 1.8, 0.4);
    // Handshake screech
    var screech = _osc('sawtooth', 600, 0.03, t + 2.2, 0.6);
    screech.osc.frequency.linearRampToValueAtTime(2000, t + 2.8);
  }

  /* Tier 3: Klaxon alarm — oscillating siren */
  function audioKlaxon() {
    if (!_ensureAudio()) return;
    var t = audioCtx.currentTime;
    for (var i = 0; i < 6; i++) {
      _osc('square', 800, 0.07, t + (i * 0.4), 0.2);
      _osc('square', 600, 0.07, t + (i * 0.4) + 0.2, 0.2);
    }
  }

  /* Tier 4: Hard drive grinding — white noise bursts */
  function audioHDDGrind() {
    if (!_ensureAudio()) return;
    var t = audioCtx.currentTime;
    // Simulate grinding with detuned oscillators
    for (var i = 0; i < 8; i++) {
      var freq = 100 + Math.random() * 200;
      var s = _osc('sawtooth', freq, 0.04, t + (i * 0.3), 0.25);
      // Add a click at each "sector"
      _osc('square', 4000 + Math.random() * 2000, 0.03, t + (i * 0.3), 0.02);
    }
    // Final mechanical stop
    _osc('triangle', 80, 0.06, t + 2.4, 0.3);
  }

  /* Tier 5: Gravity whoosh — pitch sweep down */
  function audioGravityDrop() {
    if (!_ensureAudio()) return;
    var t = audioCtx.currentTime;
    var whoosh = _osc('sine', 1200, 0.08, t, 1.5);
    whoosh.osc.frequency.exponentialRampToValueAtTime(60, t + 1.5);
    whoosh.gain.gain.linearRampToValueAtTime(0, t + 1.5);
    // Impact thud
    _osc('sine', 40, 0.12, t + 1.5, 0.3);
    _osc('triangle', 60, 0.08, t + 1.5, 0.2);
  }

  /* Tier 6: Windows error chord — the classic BSOD "dunnn" */
  function audioBSODChord() {
    if (!_ensureAudio()) return;
    var t = audioCtx.currentTime;
    // Dark minor chord
    var notes = [130.81, 155.56, 196.00, 261.63]; // C3, Eb3, G3, C4
    notes.forEach(function (freq) {
      var n = _osc('sine', freq, 0.06, t, 2.0);
      n.gain.gain.linearRampToValueAtTime(0, t + 2.0);
    });
    // Add a subtle detuned layer for that unsettling feel
    _osc('triangle', 131.5, 0.03, t, 2.0);
    _osc('triangle', 196.5, 0.03, t, 2.0);
  }

  /* Tier 7: Phone ringing — sell "calling security" */
  function audioPhoneRing() {
    if (!_ensureAudio()) return;
    var t = audioCtx.currentTime;
    // Classic phone ring: two tones played together, on-off pattern
    for (var ring = 0; ring < 3; ring++) {
      var start = t + (ring * 2.0);
      // Ring on (0.8s)
      _osc('sine', 440, 0.05, start, 0.8);
      _osc('sine', 480, 0.05, start, 0.8);
      // Silence (1.2s gap)
    }
  }

  /* Tier 8: Flatline — long monotone as page dies */
  function audioFlatline() {
    if (!_ensureAudio()) return;
    var t = audioCtx.currentTime;
    // Hospital monitor beeps getting slower
    var intervals = [0, 0.4, 0.8, 1.3, 1.9, 2.6, 3.5];
    intervals.forEach(function (offset) {
      _osc('sine', 1000, 0.06, t + offset, 0.1);
    });
    // Then the flatline
    var flat = _osc('sine', 1000, 0.07, t + 4.5, 4.0);
    flat.gain.gain.linearRampToValueAtTime(0, t + 8.5);
  }

  /* Tier 9: Matrix digital rain — cascading random tones */
  function audioMatrixRain() {
    if (!_ensureAudio()) return;
    var t = audioCtx.currentTime;
    // Rapid cascading tones
    for (var i = 0; i < 40; i++) {
      var freq = 200 + Math.random() * 2000;
      var when = t + (i * 0.12) + (Math.random() * 0.05);
      _osc('sine', freq, 0.02, when, 0.08);
    }
    // Underlying bass drone
    var drone = _osc('sawtooth', 55, 0.04, t, 5.0);
    drone.gain.gain.linearRampToValueAtTime(0, t + 5.0);
  }

  /* Tier 10: Air raid siren — full sweep */
  function audioAirRaid() {
    if (!_ensureAudio()) return;
    var t = audioCtx.currentTime;
    // Sweeping siren: up and down
    for (var cycle = 0; cycle < 2; cycle++) {
      var s = t + (cycle * 1.5);
      var up = _osc('sawtooth', 400, 0.06, s, 0.75);
      up.osc.frequency.linearRampToValueAtTime(1200, s + 0.75);
      var down = _osc('sawtooth', 1200, 0.06, s + 0.75, 0.75);
      down.osc.frequency.linearRampToValueAtTime(400, s + 1.5);
    }
  }

  /* Storage: Glass crack impact */
  function audioCrackImpact() {
    if (!_ensureAudio()) return;
    var t = audioCtx.currentTime;
    // Sharp crack
    _osc('square', 3000, 0.1, t, 0.03);
    _osc('sawtooth', 5000, 0.06, t, 0.02);
    // Shatter tinkle
    for (var i = 0; i < 8; i++) {
      var freq = 2000 + Math.random() * 6000;
      _osc('sine', freq, 0.02, t + 0.05 + (i * 0.04), 0.06);
    }
    // Low rumble
    _osc('triangle', 50, 0.08, t + 0.03, 0.4);
  }

  /* Console injection: keyboard clatter + warning */
  function audioConsoleInjection() {
    if (!_ensureAudio()) return;
    var t = audioCtx.currentTime;
    // Rapid keystrokes
    for (var i = 0; i < 12; i++) {
      var freq = 2500 + Math.random() * 4000;
      _osc('square', freq, 0.02, t + (i * 0.06), 0.015);
    }
    // Warning chime
    _osc('sine', 880, 0.08, t + 0.8, 0.12);
    _osc('sine', 660, 0.08, t + 0.95, 0.12);
    _osc('sine', 440, 0.06, t + 1.1, 0.2);
  }

  /* Runtime manipulation: locked vault clunk */
  function audioRuntimeLock() {
    if (!_ensureAudio()) return;
    var t = audioCtx.currentTime;
    // Heavy bolt sliding
    _osc('triangle', 80, 0.1, t, 0.15);
    _osc('sawtooth', 120, 0.05, t + 0.05, 0.1);
    // Metal clank
    _osc('square', 2200, 0.08, t + 0.18, 0.04);
    _osc('square', 1800, 0.06, t + 0.22, 0.03);
    // Deep lock thud
    _osc('sine', 55, 0.12, t + 0.28, 0.25);
  }

  /* DOM tampering: glitch stutter */
  function audioDomGlitch() {
    if (!_ensureAudio()) return;
    var t = audioCtx.currentTime;
    // Digital stutter — rapid on/off tones
    for (var i = 0; i < 6; i++) {
      _osc('square', 440 + (i * 110), 0.05, t + (i * 0.08), 0.04);
    }
    // Revert whoosh
    var whoosh = _osc('sine', 800, 0.06, t + 0.55, 0.3);
    whoosh.osc.frequency.exponentialRampToValueAtTime(200, t + 0.85);
  }

  /* Timer manipulation: clock tick going haywire */
  function audioTimerHaywire() {
    if (!_ensureAudio()) return;
    var t = audioCtx.currentTime;
    // Normal ticks accelerating
    var intervals = [0, 0.4, 0.7, 0.9, 1.0, 1.08, 1.14, 1.18, 1.21, 1.23];
    intervals.forEach(function (offset) {
      _osc('square', 3200, 0.04, t + offset, 0.01);
    });
    // Spring snap
    var snap = _osc('sawtooth', 1600, 0.07, t + 1.3, 0.3);
    snap.osc.frequency.exponentialRampToValueAtTime(100, t + 1.6);
    // Broken tick
    _osc('triangle', 200, 0.05, t + 1.7, 0.15);
  }

  /* XSS attempt: injection syringe hiss */
  function audioXssHiss() {
    if (!_ensureAudio()) return;
    var t = audioCtx.currentTime;
    // Rising hiss
    var hiss = _osc('sawtooth', 6000, 0.03, t, 0.4);
    hiss.osc.frequency.linearRampToValueAtTime(12000, t + 0.4);
    hiss.gain.gain.linearRampToValueAtTime(0.06, t + 0.2);
    hiss.gain.gain.linearRampToValueAtTime(0, t + 0.4);
    // Sharp rejection beep
    _osc('square', 1000, 0.08, t + 0.5, 0.1);
    _osc('square', 800, 0.08, t + 0.65, 0.15);
  }

  /* Cross-tab: portal breach sound */
  function audioCrossTabBreach() {
    if (!_ensureAudio()) return;
    var t = audioCtx.currentTime;
    // Dimensional rift — two detuned sweeps
    var up = _osc('sine', 200, 0.05, t, 0.6);
    up.osc.frequency.linearRampToValueAtTime(1200, t + 0.6);
    var down = _osc('sine', 1200, 0.05, t, 0.6);
    down.osc.frequency.linearRampToValueAtTime(200, t + 0.6);
    // Portal slam shut
    _osc('square', 80, 0.1, t + 0.65, 0.08);
    _osc('triangle', 60, 0.08, t + 0.7, 0.15);
  }

  /* Decoy: Honeypot buzz */
  function audioHoneypotBuzz() {
    if (!_ensureAudio()) return;
    var t = audioCtx.currentTime;
    // Angry bee buzz
    _osc('sawtooth', 150, 0.06, t, 0.5);
    _osc('square', 153, 0.04, t, 0.5);
    // Warning sting
    _osc('square', 880, 0.08, t + 0.6, 0.1);
    _osc('square', 660, 0.08, t + 0.75, 0.1);
    _osc('square', 440, 0.08, t + 0.9, 0.15);
  }

  /* Heartbeat — gets faster with tier, subtle background pulse */
  function audioHeartbeat(tier) {
    if (!_ensureAudio()) return;
    var t = audioCtx.currentTime;
    var bpm = Math.min(60 + (tier * 20), 180); // 80bpm at tier 1, up to 180
    var interval = 60.0 / bpm;
    var beats = Math.min(tier + 2, 8);
    for (var i = 0; i < beats; i++) {
      var when = t + (i * interval);
      // lub
      _osc('sine', 55, 0.1, when, 0.08);
      _osc('sine', 40, 0.06, when, 0.1);
      // dub (slightly delayed)
      _osc('sine', 45, 0.07, when + 0.12, 0.06);
    }
  }

  /* Typing clicks — for terminal sequences */
  function audioTypingClicks(count, duration) {
    if (!_ensureAudio()) return;
    var t = audioCtx.currentTime;
    var interval = duration / count;
    for (var i = 0; i < count; i++) {
      var when = t + (i * interval) + (Math.random() * interval * 0.3);
      var freq = 3000 + Math.random() * 3000;
      _osc('square', freq, 0.015, when, 0.008);
    }
  }

  /* Speech synthesis — robot voice announcements */
  function speak(text, rate, pitch) {
    try {
      if (!window.speechSynthesis) return;
      var u = new SpeechSynthesisUtterance(text);
      u.rate = rate || 0.8;
      u.pitch = pitch || 0.3;
      u.volume = 0.7;
      // Try to find a robotic voice
      var voices = speechSynthesis.getVoices();
      for (var i = 0; i < voices.length; i++) {
        var name = voices[i].name.toLowerCase();
        if (name.indexOf('google') !== -1 || name.indexOf('daniel') !== -1 ||
            name.indexOf('alex') !== -1 || name.indexOf('microsoft') !== -1) {
          u.voice = voices[i];
          break;
        }
      }
      speechSynthesis.speak(u);
    } catch (e) { /* speech not available */ }
  }

  /* Master audio dispatcher — plays tier-matched sound */
  function playTierAudio(tier, sensor, category) {
    // Always play heartbeat (escalating)
    audioHeartbeat(tier);

    // Sensor-specific overrides
    if (sensor === 'storage' && category === 'cross_tab_tampering') { audioCrossTabBreach(); return; }
    if (sensor === 'storage')  { audioCrackImpact(); return; }
    if (sensor === 'decoy')    { audioHoneypotBuzz(); return; }
    if (sensor === 'console')  { audioConsoleInjection(); return; }
    if (sensor === 'runtime')  { audioRuntimeLock(); return; }
    if (sensor === 'dom')      { audioDomGlitch(); return; }
    if (sensor === 'timer')    { audioTimerHaywire(); return; }
    if (sensor === 'xss')      { audioXssHiss(); return; }

    switch (tier) {
      case 1:
        audioSharpBeep();
        break;
      case 2:
        audioDialUp();
        audioTypingClicks(60, 6);
        speak('Initiating trace protocol.', 0.7, 0.1);
        break;
      case 3:
        audioKlaxon();
        setTimeout(function () { speak('Access denied.', 0.6, 0.2); }, 1500);
        break;
      case 4:
        audioHDDGrind();
        audioTypingClicks(80, 8);
        setTimeout(function () { speak('Deleting student data.', 0.8, 0.1); }, 2000);
        setTimeout(function () { speak('Just kidding.', 1.0, 0.5); }, 7000);
        break;
      case 5:
        audioGravityDrop();
        speak('Gravity anomaly detected.', 0.7, 0.2);
        break;
      case 6:
        audioBSODChord();
        setTimeout(function () { speak('Your hexworth ran into a problem.', 0.6, 0.1); }, 1500);
        break;
      case 7:
        audioPhoneRing();
        audioTypingClicks(70, 10);
        setTimeout(function () { speak('Calling campus security.', 0.7, 0.2); }, 2000);
        setTimeout(function () { speak('Unit en route.', 0.8, 0.3); }, 6000);
        break;
      case 8:
        audioFlatline();
        setTimeout(function () { speak('Was it worth it?', 0.5, 0.1); }, 5500);
        break;
      case 9:
        audioMatrixRain();
        setTimeout(function () { speak('Wake up.', 0.6, 0.1); }, 2000);
        setTimeout(function () { speak('The tripwire has you.', 0.5, 0.2); }, 4000);
        break;
      default:
        audioAirRaid();
        speak('Redirecting to the wall of shame.', 0.8, 0.2);
        break;
    }
  }

  /* ── Ambient: Spin Random Page Elements ────────────────────── */
  function chaosElements(mode) {
    var tags = ['h1', 'h2', 'h3', 'p', 'button', 'img', 'a', 'li'];
    var targets = [];
    tags.forEach(function (tag) {
      var els = document.querySelectorAll(tag);
      for (var i = 0; i < els.length; i++) {
        if (Math.random() < 0.15) targets.push(els[i]);
      }
    });

    var className = mode === 'melt' ? 'tw-melting-el' : 'tw-spinning-el';
    targets.forEach(function (el) {
      el.classList.add(className);
    });

    // Undo after effect
    setTimeout(function () {
      targets.forEach(function (el) {
        el.classList.remove(className);
        el.style.transform = '';
        el.style.filter = '';
        el.style.opacity = '';
      });
    }, GLITCH_MS + 1000);
  }

  /* ── Terminal Overlay Builder ───────────────────────────────── */
  function buildTerminalOverlay(headerText, headerColor, lines, duration) {
    injectStyle();
    document.body.classList.add('tw-glitch-active');
    document.body.classList.add('tw-shake-active');

    var overlay = document.createElement('div');
    overlay.className = 'tw-overlay tw-overlay-terminal';
    overlay.style.top = window.scrollY + 'px';

    var scanlines = document.createElement('div');
    scanlines.className = 'tw-scanlines';
    overlay.appendChild(scanlines);

    var container = document.createElement('div');
    container.style.position = 'relative';
    container.style.zIndex = '1000001';
    container.style.width = '100%';

    var header = document.createElement('div');
    header.style.color = headerColor || '#ff3333';
    header.style.fontSize = '20px';
    header.style.fontWeight = 'bold';
    header.style.marginBottom = '30px';
    header.textContent = headerText;
    container.appendChild(header);

    var lineEls = [];
    for (var i = 0; i < lines.length; i++) {
      var line = document.createElement('div');
      line.className = 'tw-terminal-line';
      var text = lines[i];
      if (text.indexOf('done.') !== -1) line.style.color = '#ff4444';
      if (text.indexOf('Just kidding') !== -1 || text.indexOf('Relax') !== -1) {
        line.style.color = '#00ff41';
        line.style.fontSize = '20px';
        line.style.fontWeight = 'bold';
      }
      if (text.indexOf('IDENTIFIED') !== -1 || text.indexOf('MATCH') !== -1 ||
          text.indexOf('PURGED') !== -1 || text.indexOf('ALL') !== -1) {
        line.style.color = '#ff4444';
        line.style.fontWeight = 'bold';
      }
      line.textContent = text || ' ';
      container.appendChild(line);
      lineEls.push(line);
    }

    var cursorLine = document.createElement('div');
    cursorLine.className = 'tw-terminal-line visible';
    var cursor = document.createElement('span');
    cursor.className = 'tw-cursor';
    cursorLine.appendChild(cursor);
    container.appendChild(cursorLine);

    overlay.appendChild(container);
    document.body.appendChild(overlay);
    activeOverlay = overlay;

    var lineDelay = Math.min(400, (duration - 2000) / lines.length);
    lineEls.forEach(function (el, idx) {
      setTimeout(function () {
        el.classList.add('visible');
        // Typing click for each line appearing
        if (lines[idx] && lines[idx].length > 0) {
          audioTypingClicks(lines[idx].length, lineDelay * 0.8);
        }
      }, lineDelay * (idx + 1));
    });

    setTimeout(function () {
      document.body.classList.remove('tw-glitch-active');
      document.body.classList.remove('tw-shake-active');
      removeOverlay();
    }, duration);
  }

  /* ═══════════════════════════════════════════════════════════════
   * TIER 1: Glitch + Toast
   * ═══════════════════════════════════════════════════════════════ */
  function effectGlitchToast() {
    injectStyle();
    document.body.classList.add('tw-glitch-active');
    document.body.classList.add('tw-shake-active');

    var toast = document.createElement('div');
    toast.className = 'tw-toast';
    toast.innerHTML = '[!] TRIPWIRE ACTIVATED<br>' +
      '<span style="font-size:12px;opacity:0.7;">' + randomQuote() + '</span>';
    toast.style.top = (20 + window.scrollY) + 'px';
    document.body.appendChild(toast);

    chaosElements('spin');

    setTimeout(function () {
      document.body.classList.remove('tw-glitch-active');
      document.body.classList.remove('tw-shake-active');
    }, GLITCH_MS);

    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, GLITCH_MS + 2000);
  }

  /* ═══════════════════════════════════════════════════════════════
   * TIER 2: Fake Trace Sequence
   * ═══════════════════════════════════════════════════════════════ */
  function effectTraceSequence() {
    buildTerminalOverlay(
      '[TRIPWIRE] INTRUSION DETECTED - INITIATING TRACE',
      '#ff3333',
      TRACE_LINES,
      TAKEOVER_MS
    );
    chaosElements('spin');
  }

  /* ═══════════════════════════════════════════════════════════════
   * TIER 3: ACCESS DENIED Takeover
   * ═══════════════════════════════════════════════════════════════ */
  function effectAccessDenied() {
    injectStyle();
    document.body.classList.add('tw-glitch-active');

    var overlay = document.createElement('div');
    overlay.className = 'tw-overlay tw-overlay-dark';
    overlay.style.top = window.scrollY + 'px';

    var scanlines = document.createElement('div');
    scanlines.className = 'tw-scanlines';
    overlay.appendChild(scanlines);

    var content = document.createElement('div');
    content.style.textAlign = 'center';
    content.style.zIndex = '1000001';
    content.style.position = 'relative';

    var bigText = document.createElement('div');
    bigText.className = 'tw-big-text';
    bigText.textContent = 'ACCESS DENIED';
    content.appendChild(bigText);

    var sub = document.createElement('div');
    sub.className = 'tw-sub-text';
    sub.textContent = randomQuote();
    content.appendChild(sub);

    var tripInfo = document.createElement('div');
    tripInfo.style.marginTop = '40px';
    tripInfo.style.fontSize = '14px';
    tripInfo.style.opacity = '0.5';
    tripInfo.style.color = '#00ff41';
    var count = window.TripWire ? window.TripWire.getTripCount() : fxCount;
    tripInfo.textContent = 'INCIDENT #' + count + ' LOGGED | SESSION FLAGGED';
    content.appendChild(tripInfo);

    var wallLink = document.createElement('div');
    wallLink.style.marginTop = '30px';
    wallLink.style.fontSize = '16px';
    wallLink.style.color = '#ff6666';
    var linkSpan = document.createElement('span');
    linkSpan.textContent = 'Your exploits have been recorded on the ';
    wallLink.appendChild(linkSpan);
    var anchor = document.createElement('span');
    anchor.style.textDecoration = 'underline';
    anchor.style.cursor = 'pointer';
    anchor.textContent = 'Wall of Shame';
    anchor.addEventListener('click', function () {
      window.location.href = WALL_OF_SHAME;
    });
    wallLink.appendChild(anchor);
    wallLink.appendChild(document.createTextNode('.'));
    content.appendChild(wallLink);

    overlay.appendChild(content);
    document.body.appendChild(overlay);
    activeOverlay = overlay;

    setTimeout(function () {
      document.body.classList.remove('tw-glitch-active');
      removeOverlay();
    }, TAKEOVER_MS);
  }

  /* ═══════════════════════════════════════════════════════════════
   * TIER 4: Fake File Deletion
   * ═══════════════════════════════════════════════════════════════ */
  function effectFakeDeletion() {
    buildTerminalOverlay(
      '[TRIPWIRE] SECURITY VIOLATION THRESHOLD EXCEEDED',
      '#ff3333',
      DELETE_LINES,
      DELETE_MS
    );
  }

  /* ═══════════════════════════════════════════════════════════════
   * TIER 5: Page Upside-Down + Gravity Flip
   * ═══════════════════════════════════════════════════════════════ */
  function effectUpsideDown() {
    injectStyle();

    // Flip the entire page content upside down
    document.documentElement.classList.add('tw-upside-down');

    // Toast appears (right-side up for maximum confusion)
    var toast = document.createElement('div');
    toast.className = 'tw-toast';
    toast.style.top = (20 + window.scrollY) + 'px';
    toast.style.transform = 'rotate(180deg)';
    toast.innerHTML = '[TRIPWIRE] GRAVITY ANOMALY DETECTED<br>' +
      '<span style="font-size:12px;opacity:0.7;">Your hacking attempt destabilized the page matrix.</span>';
    document.body.appendChild(toast);

    setTimeout(function () {
      document.documentElement.classList.remove('tw-upside-down');
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 8000);
  }

  /* ═══════════════════════════════════════════════════════════════
   * TIER 6: BSOD (Blue Screen of Death)
   * ═══════════════════════════════════════════════════════════════ */
  function effectBSOD() {
    injectStyle();

    var overlay = document.createElement('div');
    overlay.className = 'tw-overlay tw-overlay-bsod';
    overlay.style.top = window.scrollY + 'px';

    var content = document.createElement('div');
    content.style.zIndex = '1000001';
    content.style.position = 'relative';

    var frown = document.createElement('div');
    frown.className = 'tw-bsod-frown';
    frown.textContent = ':(';
    content.appendChild(frown);

    var title = document.createElement('div');
    title.className = 'tw-bsod-title';
    title.textContent = 'Your Hexworth ran into a problem and needs to restart.';
    content.appendChild(title);

    var body = document.createElement('div');
    body.className = 'tw-bsod-body';
    var errorCode = randomFrom(BSOD_ERROR_CODES);
    body.innerHTML = [
      'We are collecting some error info, and then we will',
      'restart things for you.',
      '',
      'If you would like to know more, you can search online later for this error:',
      '',
      '<span style="font-weight:bold;">Stop code: ' + errorCode + '</span>',
      '',
      'What failed: STUDENT_INTEGRITY.sys',
      'Triggered by: DevTools manipulation attempt #' + fxCount,
      '',
      'This error has been reported to your instructor.'
    ].join('<br>');
    content.appendChild(body);

    var progress = document.createElement('div');
    progress.className = 'tw-bsod-progress';
    progress.textContent = '0% complete';
    content.appendChild(progress);

    overlay.appendChild(content);
    document.body.appendChild(overlay);
    activeOverlay = overlay;

    // Fake progress counter
    var pct = 0;
    var progressInterval = setInterval(function () {
      pct += Math.floor(Math.random() * 15) + 5;
      if (pct > 100) pct = 100;
      progress.textContent = pct + '% complete';
      if (pct >= 100) {
        clearInterval(progressInterval);
        setTimeout(function () {
          progress.textContent = 'Just kidding. But stop cheating.';
          progress.style.color = '#ffaa00';
        }, 1000);
      }
    }, 800);

    setTimeout(function () {
      clearInterval(progressInterval);
      removeOverlay();
    }, BSOD_MS);
  }

  /* ═══════════════════════════════════════════════════════════════
   * TIER 7: "Calling Campus Security"
   * ═══════════════════════════════════════════════════════════════ */
  function effectCallSecurity() {
    buildTerminalOverlay(
      '[HEXWORTH SECURITY] VIOLATION ESCALATION PROTOCOL',
      '#ff3333',
      SECURITY_LINES,
      12000
    );
  }

  /* ═══════════════════════════════════════════════════════════════
   * TIER 8: Page Slowly Fades to Nothing
   * ═══════════════════════════════════════════════════════════════ */
  function effectFadeToBlack() {
    injectStyle();

    // Slowly fade out all page content
    var pageContent = document.body;
    pageContent.style.transition = 'opacity 5s ease-out, filter 5s ease-out';
    pageContent.style.opacity = '0';
    pageContent.style.filter = 'blur(10px)';

    // After it fades, show a message
    setTimeout(function () {
      var overlay = document.createElement('div');
      overlay.className = 'tw-overlay tw-overlay-dark';
      overlay.style.top = window.scrollY + 'px';
      overlay.style.opacity = '1';

      var content = document.createElement('div');
      content.style.textAlign = 'center';
      content.style.zIndex = '1000001';
      content.style.position = 'relative';

      var bigText = document.createElement('div');
      bigText.className = 'tw-big-text';
      bigText.style.fontSize = '48px';
      bigText.style.color = '#666';
      bigText.textContent = 'WAS IT WORTH IT?';
      content.appendChild(bigText);

      var sub = document.createElement('div');
      sub.className = 'tw-sub-text';
      sub.style.color = '#444';
      sub.style.marginTop = '30px';
      sub.textContent = 'Your page privileges have been temporarily revoked.';
      content.appendChild(sub);

      var sub2 = document.createElement('div');
      sub2.style.marginTop = '50px';
      sub2.style.fontSize = '14px';
      sub2.style.color = '#333';
      sub2.textContent = 'Restoring in 5 seconds...';
      content.appendChild(sub2);

      overlay.appendChild(content);
      document.body.appendChild(overlay);
      activeOverlay = overlay;

      // Restore
      setTimeout(function () {
        pageContent.style.transition = 'opacity 1s ease-in, filter 1s ease-in';
        pageContent.style.opacity = '1';
        pageContent.style.filter = '';
        removeOverlay();
      }, 5000);
    }, 5000);
  }

  /* ═══════════════════════════════════════════════════════════════
   * TIER 9: The Matrix Rain Takeover
   * ═══════════════════════════════════════════════════════════════ */
  function effectMatrixRain() {
    injectStyle();

    var overlay = document.createElement('div');
    overlay.className = 'tw-overlay';
    overlay.style.top = window.scrollY + 'px';
    overlay.style.background = '#000';
    overlay.style.overflow = 'hidden';

    // Generate matrix rain columns
    var chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*(){}[]|;:,./<>?~`TRIPWIREBUSTED';
    var numCols = Math.floor(window.innerWidth / 20);

    for (var i = 0; i < numCols; i++) {
      var col = document.createElement('div');
      col.className = 'tw-matrix-column';
      col.style.left = (i * 20) + 'px';
      col.style.animationDuration = (Math.random() * 3 + 2) + 's';
      col.style.animationDelay = (Math.random() * 3) + 's';
      col.style.opacity = Math.random() * 0.5 + 0.3;
      col.style.fontSize = (Math.floor(Math.random() * 8) + 12) + 'px';

      var text = '';
      var len = Math.floor(Math.random() * 30) + 10;
      for (var j = 0; j < len; j++) {
        text += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      col.textContent = text;
      overlay.appendChild(col);
    }

    // Center message
    var msgBox = document.createElement('div');
    msgBox.style.position = 'absolute';
    msgBox.style.top = '50%';
    msgBox.style.left = '50%';
    msgBox.style.transform = 'translate(-50%, -50%)';
    msgBox.style.zIndex = '1000002';
    msgBox.style.textAlign = 'center';

    var bigText = document.createElement('div');
    bigText.className = 'tw-big-text';
    bigText.style.color = '#00ff41';
    bigText.style.textShadow = '0 0 30px #00ff41, 0 0 60px #00ff41';
    bigText.textContent = 'WAKE UP';
    msgBox.appendChild(bigText);

    var sub = document.createElement('div');
    sub.className = 'tw-sub-text';
    sub.style.color = '#00ff41';
    sub.style.marginTop = '20px';
    sub.textContent = 'The TripWire has you...';
    msgBox.appendChild(sub);

    setTimeout(function () {
      sub.textContent = 'Follow the white rabbit to the Wall of Shame.';
    }, 3000);

    setTimeout(function () {
      sub.textContent = randomQuote();
    }, 6000);

    overlay.appendChild(msgBox);
    document.body.appendChild(overlay);
    activeOverlay = overlay;

    setTimeout(function () {
      removeOverlay();
    }, MATRIX_MS);
  }

  /* ═══════════════════════════════════════════════════════════════
   * TIER 10+: Wall of Shame Redirect
   * ═══════════════════════════════════════════════════════════════ */
  function effectRedirectToWall() {
    injectStyle();

    var overlay = document.createElement('div');
    overlay.className = 'tw-overlay tw-overlay-dark';
    overlay.style.top = window.scrollY + 'px';

    var content = document.createElement('div');
    content.style.textAlign = 'center';
    content.style.zIndex = '1000001';
    content.style.position = 'relative';

    var bigText = document.createElement('div');
    bigText.className = 'tw-big-text';
    bigText.style.color = '#ff3333';
    bigText.textContent = 'ENOUGH.';
    content.appendChild(bigText);

    var statsLine = document.createElement('div');
    statsLine.style.marginTop = '20px';
    statsLine.style.fontSize = '16px';
    statsLine.style.color = '#ff6666';
    statsLine.textContent = 'You have triggered TripWire ' + fxCount + ' times this session.';
    content.appendChild(statsLine);

    var sub = document.createElement('div');
    sub.className = 'tw-sub-text';
    sub.style.marginTop = '30px';
    sub.textContent = 'Redirecting to Wall of Shame in 3...';
    content.appendChild(sub);

    overlay.appendChild(content);
    document.body.appendChild(overlay);
    activeOverlay = overlay;

    var countdown = 3;
    var interval = setInterval(function () {
      countdown--;
      if (countdown > 0) {
        sub.textContent = 'Redirecting to Wall of Shame in ' + countdown + '...';
      } else {
        clearInterval(interval);
        window.location.href = WALL_OF_SHAME;
      }
    }, 1000);
  }

  /* ═══════════════════════════════════════════════════════════════
   * SPECIAL: Decoy / Honeypot
   * ═══════════════════════════════════════════════════════════════ */
  function effectDecoyBusted() {
    injectStyle();
    document.body.classList.add('tw-glitch-active');

    var overlay = document.createElement('div');
    overlay.className = 'tw-overlay tw-overlay-dark';
    overlay.style.top = window.scrollY + 'px';

    var scanlines = document.createElement('div');
    scanlines.className = 'tw-scanlines';
    overlay.appendChild(scanlines);

    var content = document.createElement('div');
    content.style.textAlign = 'center';
    content.style.zIndex = '1000001';
    content.style.position = 'relative';

    var bigText = document.createElement('div');
    bigText.className = 'tw-big-text';
    bigText.style.color = '#ffaa00';
    bigText.textContent = 'HONEYPOT';
    content.appendChild(bigText);

    var sub1 = document.createElement('div');
    sub1.className = 'tw-sub-text';
    sub1.style.color = '#ffcc44';
    sub1.style.fontSize = '24px';
    sub1.textContent = 'You just accessed a decoy variable.';
    content.appendChild(sub1);

    var sub2 = document.createElement('div');
    sub2.className = 'tw-sub-text';
    sub2.style.fontSize = '18px';
    sub2.style.color = '#ff6666';
    sub2.textContent = 'That was planted specifically to catch you.';
    content.appendChild(sub2);

    var sub3 = document.createElement('div');
    sub3.style.marginTop = '30px';
    sub3.style.fontSize = '16px';
    sub3.style.color = '#00ff41';
    sub3.textContent = 'In real pentesting, honeypots like this catch careless attackers.';
    content.appendChild(sub3);

    var sub4 = document.createElement('div');
    sub4.style.marginTop = '15px';
    sub4.style.fontSize = '14px';
    sub4.style.color = '#666';
    sub4.textContent = 'Congratulations: you are the careless attacker.';
    content.appendChild(sub4);

    overlay.appendChild(content);
    document.body.appendChild(overlay);
    activeOverlay = overlay;

    setTimeout(function () {
      document.body.classList.remove('tw-glitch-active');
      removeOverlay();
    }, TAKEOVER_MS);
  }

  /* ═══════════════════════════════════════════════════════════════
   * SPECIAL: Storage Tampering -> Screen Cracks
   * ═══════════════════════════════════════════════════════════════ */
  function effectScreenCrack() {
    injectStyle();

    var crack = document.createElement('div');
    crack.className = 'tw-crack-overlay';
    crack.style.top = window.scrollY + 'px';
    // Random crack origin
    crack.style.setProperty('--crack-x', (Math.random() * 60 + 20) + '%');
    crack.style.setProperty('--crack-y', (Math.random() * 60 + 20) + '%');
    crack.style.setProperty('--crack-angle1', (Math.random() * 360) + 'deg');
    crack.style.setProperty('--crack-angle2', (Math.random() * 360) + 'deg');
    crack.style.setProperty('--crack-angle3', (Math.random() * 360) + 'deg');
    document.body.appendChild(crack);

    // Shake on impact
    document.body.classList.add('tw-shake-active');

    // Toast
    var toast = document.createElement('div');
    toast.className = 'tw-toast';
    toast.style.top = (20 + window.scrollY) + 'px';
    toast.innerHTML = '[!] STORAGE TAMPERING DETECTED<br>' +
      '<span style="font-size:12px;opacity:0.7;">Your changes have been reverted. Nice try.</span>';
    document.body.appendChild(toast);

    setTimeout(function () {
      document.body.classList.remove('tw-shake-active');
    }, 1000);

    setTimeout(function () {
      if (crack.parentNode) crack.parentNode.removeChild(crack);
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 5000);
  }

  /* ═══════════════════════════════════════════════════════════════
   * SPECIAL: Console Injection -> Terminal Intercept
   * ═══════════════════════════════════════════════════════════════ */
  function effectConsoleIntercept(detail) {
    injectStyle();
    document.body.classList.add('tw-shake-active');

    var toast = document.createElement('div');
    toast.className = 'tw-toast';
    toast.style.top = (20 + window.scrollY) + 'px';
    toast.style.borderColor = '#ff6600';
    toast.style.color = '#ff6600';
    toast.innerHTML = '[!] CONSOLE INJECTION DETECTED<br>' +
      '<span style="font-size:12px;opacity:0.7;">' +
      (detail || 'Function call intercepted from DevTools console.') + '</span><br>' +
      '<span style="font-size:11px;opacity:0.5;color:#ffaa00;">Stack trace forensics identified the call origin.</span>';
    document.body.appendChild(toast);

    setTimeout(function () {
      document.body.classList.remove('tw-shake-active');
    }, 1000);

    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 5000);
  }

  /* ═══════════════════════════════════════════════════════════════
   * SPECIAL: Runtime Manipulation -> Frozen Lock
   * ═══════════════════════════════════════════════════════════════ */
  function effectRuntimeLock(detail) {
    injectStyle();
    document.body.classList.add('tw-shake-active');

    var toast = document.createElement('div');
    toast.className = 'tw-toast';
    toast.style.top = (20 + window.scrollY) + 'px';
    toast.style.borderColor = '#8855ff';
    toast.style.color = '#8855ff';
    toast.innerHTML = '[!] RUNTIME MANIPULATION BLOCKED<br>' +
      '<span style="font-size:12px;opacity:0.7;">' +
      (detail || 'Property is frozen. Object.defineProperty cannot override it.') + '</span><br>' +
      '<span style="font-size:11px;opacity:0.5;color:#aa88ff;">Non-configurable descriptors resist console reassignment.</span>';
    document.body.appendChild(toast);

    setTimeout(function () {
      document.body.classList.remove('tw-shake-active');
    }, 1000);

    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 5000);
  }

  /* ═══════════════════════════════════════════════════════════════
   * SPECIAL: DOM Tampering -> Element Revert Flash
   * ═══════════════════════════════════════════════════════════════ */
  function effectDomRevert(detail) {
    injectStyle();
    document.body.classList.add('tw-glitch-active');

    var toast = document.createElement('div');
    toast.className = 'tw-toast';
    toast.style.top = (20 + window.scrollY) + 'px';
    toast.style.borderColor = '#00ccff';
    toast.style.color = '#00ccff';
    toast.innerHTML = '[!] DOM TAMPERING DETECTED<br>' +
      '<span style="font-size:12px;opacity:0.7;">' +
      (detail || 'Protected element modification reverted by MutationObserver.') + '</span><br>' +
      '<span style="font-size:11px;opacity:0.5;color:#66ddff;">DOM integrity monitoring is active on all [data-protected] elements.</span>';
    document.body.appendChild(toast);

    setTimeout(function () {
      document.body.classList.remove('tw-glitch-active');
    }, GLITCH_MS);

    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 5000);
  }

  /* ═══════════════════════════════════════════════════════════════
   * SPECIAL: Timer Manipulation -> Clock Distortion
   * ═══════════════════════════════════════════════════════════════ */
  function effectTimerDistortion(detail) {
    injectStyle();
    document.body.classList.add('tw-shake-active');

    var toast = document.createElement('div');
    toast.className = 'tw-toast';
    toast.style.top = (20 + window.scrollY) + 'px';
    toast.style.borderColor = '#ffcc00';
    toast.style.color = '#ffcc00';
    toast.innerHTML = '[!] TIMER MANIPULATION DETECTED<br>' +
      '<span style="font-size:12px;opacity:0.7;">' +
      (detail || 'Heartbeat anomaly or native timer replacement detected.') + '</span><br>' +
      '<span style="font-size:11px;opacity:0.5;color:#ffdd44;">The heartbeat monitor cross-checks Date.now, performance.now, and setInterval drift.</span>';
    document.body.appendChild(toast);

    setTimeout(function () {
      document.body.classList.remove('tw-shake-active');
    }, 1000);

    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 5000);
  }

  /* ═══════════════════════════════════════════════════════════════
   * SPECIAL: XSS Attempt -> Injection Warning
   * ═══════════════════════════════════════════════════════════════ */
  function effectXssWarning(detail) {
    injectStyle();
    document.body.classList.add('tw-glitch-active');
    document.body.classList.add('tw-shake-active');

    var toast = document.createElement('div');
    toast.className = 'tw-toast';
    toast.style.top = (20 + window.scrollY) + 'px';
    toast.style.borderColor = '#ff0066';
    toast.style.color = '#ff0066';
    toast.innerHTML = '[!] XSS PATTERN DETECTED<br>' +
      '<span style="font-size:12px;opacity:0.7;">' +
      (detail || 'Script injection pattern detected in input field.') + '</span><br>' +
      '<span style="font-size:11px;opacity:0.5;color:#ff4488;">Input validation caught a known XSS payload signature.</span>';
    document.body.appendChild(toast);

    setTimeout(function () {
      document.body.classList.remove('tw-glitch-active');
      document.body.classList.remove('tw-shake-active');
    }, GLITCH_MS);

    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 5000);
  }

  /* ═══════════════════════════════════════════════════════════════
   * SPECIAL: Cross-Tab Tampering -> Portal Breach
   * ═══════════════════════════════════════════════════════════════ */
  function effectCrossTabBreach(detail) {
    injectStyle();
    document.body.classList.add('tw-shake-active');

    // Use screen crack effect as base (storage-family)
    effectScreenCrack();

    var toast = document.createElement('div');
    toast.className = 'tw-toast';
    toast.style.top = (70 + window.scrollY) + 'px'; // offset below the screen crack toast
    toast.style.borderColor = '#cc44ff';
    toast.style.color = '#cc44ff';
    toast.innerHTML = '[!] CROSS-TAB BYPASS DETECTED<br>' +
      '<span style="font-size:12px;opacity:0.7;">' +
      (detail || 'Suspicious storage write detected from another tab.') + '</span><br>' +
      '<span style="font-size:11px;opacity:0.5;color:#dd88ff;">The storage event listener validates cross-tab value deltas.</span>';
    document.body.appendChild(toast);

    setTimeout(function () {
      document.body.classList.remove('tw-shake-active');
    }, 1000);

    setTimeout(function () {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 6000);
  }

  /* ═══════════════════════════════════════════════════════════════
   * Console Flood (runs with every effect)
   * ═══════════════════════════════════════════════════════════════ */
  function consoleFlood(sensor, category) {
    try {
      var s0 = 'color:#ff3333;font-size:24px;font-weight:bold;text-shadow:2px 2px #000;';
      var s1 = 'color:#ff6666;font-size:14px;';
      var s2 = 'color:#00ff41;font-size:12px;';
      var s3 = 'color:#ffaa00;font-size:12px;';
      var s4 = 'color:#ff3333;font-size:10px;font-family:monospace;';
      var s5 = 'color:#66ccff;font-size:11px;font-style:italic;';

      var catMsg = CATEGORY_MESSAGES[category];

      console.log('%c[TRIPWIRE] INTRUSION DETECTED', s0);
      console.log('%cSensor: ' + sensor + ' | Category: ' + (category || 'unknown') + ' | Incident #' + fxCount, s1);
      if (catMsg) {
        console.log('%c' + catMsg.console, s1);
        console.log('%c[LESSON] ' + catMsg.teach, s5);
      }
      console.log('%cSession flagged for instructor review.', s2);
      console.log('%c' + randomQuote(), s3);

      // Big ASCII art
      console.log(
        '%c' +
        '  _____ ____  ___ ______        _____ ____  _____\n' +
        ' |_   _|  _ \\|_ _|  _ \\ \\      / /_ _|  _ \\| ____|\n' +
        '   | | | |_) || || |_) \\ \\ /\\ / / | || |_) |  _|\n' +
        '   | | |  _ < | ||  __/ \\ V  V /  | ||  _ <| |___\n' +
        '   |_| |_| \\_\\___|_|     \\_/\\_/  |___|_| \\_\\_____|\n' +
        '\n' +
        '   You have been detected. Your moves are logged.\n' +
        '   Trip count this session: ' + fxCount + '\n' +
        '   Sensors tripped: ' + (window.TripWire ? window.TripWire.getSensorsTripped().join(', ') : sensor) + '\n',
        s4
      );

      // Bonus: spam some fake "tracking" messages
      if (fxCount >= 3) {
        console.log('%c[ADMIN] Forwarding incident report...', s3);
        console.log('%c[ADMIN] Browser fingerprint captured', s3);
        console.log('%c[ADMIN] Screenshot queued', s3);
      }
    } catch (e) { /* console locked down */ }
  }

  /* ═══════════════════════════════════════════════════════════════
   * Master Dispatcher
   * ═══════════════════════════════════════════════════════════════ */
  function onTrip(e) {
    fxCount++;
    var detail = e.detail || {};
    var sensor   = detail.sensor   || 'unknown';
    var category = detail.category || 'unknown';
    var info     = detail.detail   || '';

    // Always flood the console (with category-specific messages)
    consoleFlood(sensor, category);

    // Play sensor-matched audio + heartbeat + speech
    playTierAudio(fxCount, sensor, category);

    // Skip visual effects on Wall of Shame page
    if (window.location.pathname.indexOf('wall-of-shame') !== -1) return;

    // ── Sensor-specific effects (bypass first trip into tier system) ──

    // Storage: cross-tab tampering gets portal breach variant
    if (sensor === 'storage' && category === 'cross_tab_tampering') {
      effectCrossTabBreach(info);
      return;
    }

    // Storage: all other tampering gets screen crack
    if (sensor === 'storage') {
      effectScreenCrack();
      return;
    }

    // Decoy sensor gets honeypot takeover
    if (sensor === 'decoy') {
      effectDecoyBusted();
      return;
    }

    // Console injection: terminal intercept toast
    if (sensor === 'console') {
      effectConsoleIntercept(info);
      return;
    }

    // Runtime manipulation: frozen lock toast
    if (sensor === 'runtime') {
      effectRuntimeLock(info);
      return;
    }

    // DOM tampering: element revert flash
    if (sensor === 'dom') {
      effectDomRevert(info);
      return;
    }

    // Timer manipulation: clock distortion
    if (sensor === 'timer') {
      effectTimerDistortion(info);
      return;
    }

    // XSS attempt: injection warning
    if (sensor === 'xss') {
      effectXssWarning(info);
      return;
    }

    // DevTools: consent/denial are handled by TripWire.js modal, skip visual
    if (sensor === 'devtools' && (category === 'devtools_consent' || category === 'devtools_denial')) {
      return;
    }

    // ── Escalating tiers (for devtools_opened + any unknown sensors) ──
    switch (fxCount) {
      case 1:  effectGlitchToast(); break;
      case 2:  effectTraceSequence(); break;
      case 3:  effectAccessDenied(); break;
      case 4:  effectFakeDeletion(); break;
      case 5:  effectUpsideDown(); break;
      case 6:  effectBSOD(); break;
      case 7:  effectCallSecurity(); break;
      case 8:  effectFadeToBlack(); break;
      case 9:  effectMatrixRain(); break;
      default: effectRedirectToWall(); break;
    }
  }

  /* ── Init ───────────────────────────────────────────────────── */
  document.addEventListener('hexworth:tripwire', onTrip);

  window.__TripWireEffects = {
    version: '4.0.0',
    getFxCount: function () { return fxCount; }
  };

})();
