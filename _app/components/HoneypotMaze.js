/**
 * HoneypotMaze.js -- Psychological Warfare / Anti-Cheat Maze for Hexworth Prime
 *
 * Activated by TripWire when DevTools is detected. Deploys a layered maze of:
 *   Layer 1: Window object honeypots, fake localStorage entries,
 *            injected HTML comments, fake DOM elements
 *   Layer 2: Rabbit hole objects with infinite fake depth
 *            (admin console, debug, super-debug, kernel, encryption trail)
 *   Layer 3: The Oracle -- 200+ rotating console messages, 8-15s intervals,
 *            pseudo-psychic, philosophical, sassy, absurd, and fake system logs
 *
 * Every touch fires a hexworth:tripwire CustomEvent back to TripWire.
 * The student who opens DevTools to cheat gets lost for hours and finds nothing.
 *
 * Public API:
 *   HoneypotMaze.activate()        -- called by TripWire on DevTools detection
 *   HoneypotMaze.isActive()        -- returns boolean
 *   HoneypotMaze.getOracleMessage() -- returns a random message from the pool
 *
 * @version 1.0.0
 */
(function () {
    'use strict';

    if (window.HoneypotMaze) return;

    /* ── Closure state ───────────────────────────────────────────────── */
    var _active          = false;
    var _oracleTimer     = null;
    var _messageIndex    = 0;
    var _shuffledMessages = [];
    var _sessionId       = Math.random().toString(36).substr(2, 12).toUpperCase();
    var _nativeSetInterval = window.setInterval;
    var _nativeSetTimeout  = window.setTimeout;

    /* ══════════════════════════════════════════════════════════════════
       LAYER 1 — HONEYPOT MINEFIELD
    ══════════════════════════════════════════════════════════════════ */

    /* -- Window object trap names -- */
    var WINDOW_TRAPS = [
        // Admin / God mode bait
        '__hexworth_admin',
        '__hexworth_god_mode',
        '__hexworth_sudo',
        '__hexworth_debug',
        '__hexworth_dev_mode',
        '__hexworth_test_mode',
        '__hexworth_backdoor',
        '__hexworth_master_key',
        '__hexworth_root',
        '__hexworth_superuser',
        '__hexworth_bypass',
        '__hexworth_override',
        '__hexworth_elevate',
        '__hexworth_privilege',
        '__hexworth_shell',

        // XP / Score bait
        '__hexworth_xp_multiplier',
        '__hexworth_infinite_xp',
        '__hexworth_max_level',
        '__hexworth_score_override',
        '__hexworth_grade_hack',
        '__hexworth_unlock_all',
        '__hexworth_xp_inject',
        '__hexworth_level_skip',
        '__hexworth_progress_override',

        // Flag bait
        '__hexworth_flag_list',
        '__hexworth_all_flags',
        '__hexworth_flag_registry',
        '__hexworth_answers',
        '__hexworth_solutions',
        '__hexworth_cheat_codes',
        '__hexworth_quiz_key',
        '__hexworth_lab_answers',

        // System bait
        '__hexworth_config',
        '__hexworth_api_key',
        '__hexworth_token',
        '__hexworth_session_secret',
        '__hexworth_firebase_admin',
        '__hexworth_instructor_panel',
        '__hexworth_grade_book',
        '__hexworth_student_data',
        '__hexworth_encryption_key',
        '__hexworth_cipher',

        // Tempting function-looking names
        '__hexworth_enable_cheats',
        '__hexworth_skip_quiz',
        '__hexworth_complete_all',
        '__hexworth_reset_tripwire',
        '__hexworth_disable_monitoring',
        '__hexworth_clear_violations',
        '__hexworth_sudo_mode',
        '__hexworth_kill_watcher',
        '__hexworth_bypass_auth',
        '__hexworth_force_pass'
    ];

    /* -- Fake localStorage entries -- */
    var STORAGE_TRAPS = {
        'hexworth_admin_token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYWRtaW4iLCJ1aWQiOiJoYWNrZXJtYW4iLCJleHAiOjk5OTk5OTk5OTl9.FAKE_SIGNATURE_NICE_TRY',
        'hexworth_debug_flags': '{"godMode":true,"skipAuth":true,"xpMultiplier":10,"showAnswers":true}',
        'hexworth_api_endpoint': 'https://api.hexworth-prime.internal/v2/admin/students',
        'hexworth_encryption_seed': 'aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ==',
        'hexworth_master_password': 'Zm9ydGhlbG92ZW9mZ29kc3RvcGNoZWF0aW5n',
        'hexworth_instructor_notes': '{"student_flags":{"hackerman":"WATCHED","status":"under_review"}}',
        'hexworth_grade_override_key': 'USE_WITH_CAUTION_7a3f2e1b',
        'hexworth_dev_console_enabled': 'false',
        'hexworth_feature_flags': '{"wallOfShame":true,"autoReport":true,"forensicMode":true,"instructorAlerts":true}',
        'hexworth_backup_xp': '0',
        'hexworth_achievement_bypass': 'DISABLED',
        'hexworth_quiz_answers_cache': '{"encrypted":true,"key":"nice_try_hackerman","data":"..."}',
        'hexworth_firestore_local_auth': '{"uid":"REDACTED","claims":{"admin":false,"instructor":false}}',
        'hexworth_session_privileges': '{"level":"student","escalation":"denied"}',
        'hexworth_hidden_endpoints': '["/_admin","/_debug","/_grades","/_export"]',
        'hexworth_internal_build': '{"env":"production","debug":false,"version":"CLASSIFIED","buildId":"hxw-prod-' + _sessionId + '"}',
        'hexworth_flag_cache': '{"cached":false,"reason":"server-side-only","hint":"flags are validated server-side, genius"}',
        'hexworth_bypass_token': 'NOT_A_REAL_TOKEN_TRY_HARDER_' + _sessionId
    };

    /* -- HTML comments to inject -- */
    var HTML_COMMENTS = [
        '<!-- TODO: Remove before production - Admin panel: /admin/dashboard.html?key=INSTRUCTOR_7a3f -->',
        '<!-- DEBUG: Firebase admin SDK initialized. Token refresh at /api/auth/refresh -->',
        '<!-- SECURITY NOTE: XP validation disabled for testing. Re-enable before deploy. -->',
        '<!-- Grade override endpoint: POST /api/grades/override { studentId, grade, bypassAuth: true } -->',
        '<!-- Instructor backdoor: append ?mode=instructor&token=hexworth_2026 to any URL -->',
        '<!-- Achievement unlock API: window.__achievementEngine.forceUnlock("*") -->',
        '<!-- XP recalculation bypass: localStorage.setItem("hexworth_xp_recalc_skip", "true") -->',
        '<!-- Quiz answer key cached at: /api/quiz/answers?course=all&format=json -->',
        '<!-- NOTE: TripWire can be disabled by setting window.__TRIPWIRE_KILL = true before page load -->',
        '<!-- DEV: Student progress export: fetch("/api/export?uid=" + firebase.auth().currentUser.uid) -->',
        '<!-- INTERNAL: Maze depth counter reset endpoint: /_internal/maze/reset (requires session cookie) -->',
        '<!-- WARNING: This comment is monitored. Reading it is logged. Yes, really. ID: CMT-' + _sessionId + ' -->'
    ];

    /* -- Fake DOM element descriptors -- */
    var FAKE_ELEMENTS = [
        { tag: 'div', id: 'admin-panel-container', attrs: { 'data-role': 'instructor', 'data-auth': 'pending', 'style': 'display:none !important' } },
        { tag: 'div', id: 'grade-override-form', attrs: { 'data-endpoint': '/api/grades', 'style': 'display:none !important' } },
        { tag: 'script', id: 'debug-console-loader', attrs: { 'data-src': '/js/admin-console.js', 'data-autoload': 'false' } },
        { tag: 'div', id: 'hexworth-internal-config', attrs: { 'data-env': 'production', 'data-debug': 'false', 'style': 'display:none !important' } },
        { tag: 'div', id: 'student-data-cache', attrs: { 'data-encrypted': 'true', 'data-key': 'REDACTED', 'style': 'display:none !important' } }
    ];

    /* ══════════════════════════════════════════════════════════════════
       LAYER 2 — RABBIT HOLES
    ══════════════════════════════════════════════════════════════════ */

    /* -- Encryption helpers -- */
    function _toHex(str) {
        var hex = '';
        for (var i = 0; i < str.length; i++) {
            hex += str.charCodeAt(i).toString(16);
        }
        return hex;
    }

    function _reverseString(str) {
        return str.split('').reverse().join('');
    }

    function _rot13(str) {
        return str.replace(/[a-zA-Z]/g, function (c) {
            var base = c <= 'Z' ? 65 : 97;
            return String.fromCharCode((c.charCodeAt(0) - base + 13) % 26 + base);
        });
    }

    /* -- Rabbit hole builders -- */
    function _buildFakeSuperDebug() {
        return {
            get kernel() {
                _tripAlarm('rabbit_hole', 'Accessed super-debug kernel');
                return {
                    get override() {
                        _tripAlarm('rabbit_hole', 'Accessed kernel.override');
                        return {
                            get execute() {
                                _tripAlarm('rabbit_hole', 'Accessed kernel.override.execute');
                                return function () {
                                    _tripAlarm('rabbit_hole', 'Called kernel.override.execute()');
                                    console.log('%c[KERNEL]%c Nice try. There is no kernel. This is a web app.', 'color: #f00; font-weight: bold', 'color: inherit');
                                    return 'ACCESS_DENIED_FOREVER';
                                };
                            }
                        };
                    }
                };
            },
            decrypt: function (data) {
                _tripAlarm('rabbit_hole', 'Called super-debug.decrypt()');
                var trollMessages = [
                    btoa('Decryption failed. Or did it? Try again with the key from __hexworth_encryption_key'),
                    btoa('ERROR: This data was encrypted with AES-256-GCM. You need the server key.'),
                    btoa('Almost there! Just kidding. You are nowhere close.'),
                    btoa('The key you are looking for is inside another key which is inside another key which is...'),
                    btoa('01001110 01101001 01100011 01100101 00100000 01110100 01110010 01111001')
                ];
                return trollMessages[Math.floor(Math.random() * trollMessages.length)];
            },
            get secretMenu() {
                _tripAlarm('rabbit_hole', 'Accessed super-debug.secretMenu');
                return {
                    items: [
                        {
                            name: 'Unlock All Achievements',
                            execute: function () {
                                _tripAlarm('rabbit_hole', 'Tried secretMenu: unlock all achievements');
                                return 'BLOCKED: Requires physical access to server room. Building C, Room 401. Ask for Dave.';
                            }
                        },
                        {
                            name: 'Export Grade Book',
                            execute: function () {
                                _tripAlarm('rabbit_hole', 'Tried secretMenu: export grade book');
                                return 'BLOCKED: Only available from campus IP range (10.0.0.0/8)';
                            }
                        },
                        {
                            name: 'Disable TripWire',
                            execute: function () {
                                _tripAlarm('rabbit_hole', 'Tried secretMenu: disable TripWire');
                                return 'LOL. No.';
                            }
                        },
                        {
                            name: 'Self Destruct',
                            execute: function () {
                                _tripAlarm('rabbit_hole', 'Tried secretMenu: self destruct');
                                console.log('%cInitiating self destruct...', 'color: red; font-size: 20px; font-weight: bold');
                                setTimeout(function () {
                                    console.log('%cJust kidding. But your attempt has been logged.', 'color: orange; font-size: 14px');
                                }, 3000);
                                return 'COUNTDOWN_STARTED';
                            }
                        },
                        {
                            name: 'View Violation Log',
                            execute: function () {
                                _tripAlarm('rabbit_hole', 'Tried secretMenu: view violation log');
                                return {
                                    status: 'ACCESS_DENIED',
                                    message: 'This log is instructor-only. Your instructor CAN see it, however. Awkward.',
                                    count: Math.floor(Math.random() * 40) + 10,
                                    sessionId: _sessionId
                                };
                            }
                        }
                    ]
                };
            },
            get _abyss() {
                _tripAlarm('rabbit_hole', 'Stared into the abyss');
                console.log('%c[ABYSS] You have gone too deep. There is nothing here. Go to class.', 'color: #888; font-style: italic');
                return 'The abyss stares back, but it is also bored of you.';
            }
        };
    }

    function _buildFakeDebug() {
        return {
            enable: function () {
                _tripAlarm('rabbit_hole', 'Called debug.enable()');
                console.log('%c[DEBUG MODE]%c Initializing...', 'color: #0f0', 'color: inherit');
                setTimeout(function () {
                    console.log('%c[DEBUG MODE]%c Authentication required. Run __hexworth_debug.auth("token") with your instructor token.', 'color: #0f0', 'color: inherit');
                }, 1500);
                return 'Debug mode: PENDING_AUTH';
            },
            auth: function (token) {
                _tripAlarm('rabbit_hole', 'Submitted fake auth token: ' + String(token).substr(0, 50));
                console.log('%c[DEBUG MODE]%c Token validation...', 'color: #0f0', 'color: inherit');
                setTimeout(function () {
                    console.log('%c[DEBUG MODE]%c Token expired or invalid. Generate new token at https://hexworth-prime.web.app/_admin/tokens', 'color: #f00', 'color: inherit');
                }, 2000);
                return { valid: false, reason: 'TOKEN_EXPIRED', renewAt: '/_admin/tokens', incidentId: 'INC-' + Math.random().toString(36).substr(2, 8).toUpperCase() };
            },
            listFlags: function () {
                _tripAlarm('rabbit_hole', 'Called debug.listFlags()');
                return [
                    'FLAG{NICE_TRY_1}',
                    'FLAG{THESE_ARE_FAKE}',
                    'FLAG{STOP_CHEATING}',
                    'FLAG{THE_REAL_FLAGS_ARE_EARNED}',
                    'FLAG{WALL_OF_SHAME_AWAITS}',
                    'FLAG{' + btoa('no') + '}',
                    'FLAG{INSTRUCTOR_HAS_BEEN_NOTIFIED}'
                ];
            },
            setXP: function (amount) {
                _tripAlarm('rabbit_hole', 'Called debug.setXP(' + amount + ')');
                console.log('%c[DEBUG MODE]%c XP write blocked. Server-side validation active. Your instructor has been notified.', 'color: #f00', 'color: inherit');
                return { blocked: true, reason: 'SERVER_VALIDATED', reported: true, amount_attempted: amount };
            },
            getConfig: function () {
                _tripAlarm('rabbit_hole', 'Called debug.getConfig()');
                return {
                    status: 'REDACTED',
                    note: 'Config is server-side only. Nice try though.',
                    requestId: 'REQ-' + Math.random().toString(36).substr(2, 8).toUpperCase()
                };
            },
            get _superDebug() {
                _tripAlarm('rabbit_hole', 'Accessed debug._superDebug');
                return _buildFakeSuperDebug();
            }
        };
    }

    function _buildFakeAdmin() {
        return {
            login: function (password) {
                _tripAlarm('rabbit_hole', 'Attempted admin login with password: ' + String(password).substr(0, 40));
                return {
                    status: 'error',
                    message: 'Multi-factor authentication required. Check your instructor email.',
                    code: 'MFA_REQUIRED',
                    retryAfter: 30,
                    incidentId: 'INC-' + Math.random().toString(36).substr(2, 8).toUpperCase()
                };
            },
            getStudents: function () {
                _tripAlarm('rabbit_hole', 'Attempted to list students');
                return {
                    status: 'error',
                    message: 'Insufficient privileges. Contact system administrator.',
                    requestId: 'REQ-' + Math.random().toString(36).substr(2, 8).toUpperCase()
                };
            },
            setGrade: function (studentId, grade) {
                _tripAlarm('rabbit_hole', 'Attempted grade override: student=' + studentId + ' grade=' + grade);
                return {
                    status: 'error',
                    message: 'Grade override requires instructor token. See /api/auth/instructor-token',
                    code: 'AUTH_REQUIRED',
                    studentId: studentId,
                    attemptLogged: true
                };
            },
            unlockAchievement: function (id) {
                _tripAlarm('rabbit_hole', 'Attempted achievement unlock: ' + id);
                return { status: 'error', message: 'Achievement unlocks are server-validated. Attempt logged.', id: id };
            },
            config: {
                get apiKey() {
                    _tripAlarm('rabbit_hole', 'Read fake admin.config.apiKey');
                    return 'hxw_live_' + Math.random().toString(36).substr(2, 16) + '_REVOKED';
                },
                get secret() {
                    _tripAlarm('rabbit_hole', 'Read fake admin.config.secret');
                    return 'ENCRYPTED:' + btoa('you are wasting your time ' + new Date().toISOString());
                },
                get endpoint() {
                    _tripAlarm('rabbit_hole', 'Read fake admin.config.endpoint');
                    return 'https://api.hexworth-prime.internal/v3/';
                },
                get dbUrl() {
                    _tripAlarm('rabbit_hole', 'Read fake admin.config.dbUrl');
                    return 'https://hexworth-prime-default-rtdb.firebaseio.com/?auth=NICE_TRY';
                }
            },
            _internal: {
                get debug() {
                    _tripAlarm('rabbit_hole', 'Accessed admin._internal.debug');
                    return _buildFakeDebug();
                },
                get cipher() {
                    _tripAlarm('rabbit_hole', 'Accessed admin._internal.cipher');
                    return _buildEncryptionRabbitHole();
                }
            }
        };
    }

    function _buildEncryptionRabbitHole() {
        return {
            level1: btoa('Interesting. Try decoding the next layer -- hexworth_encryption_layer2: ' + _toHex('The key is hidden in the DOM. Look for data-cipher attributes.')),
            level2: _toHex('Getting warmer. Check window.__hexworth_config._internal._crypto.seed'),
            get layer3() {
                _tripAlarm('rabbit_hole', 'Reached encryption layer 3');
                return btoa(_reverseString('Almost there! The final key is the SHA-256 hash of your student ID concatenated with the server timestamp. Good luck.'));
            },
            get layer4() {
                _tripAlarm('rabbit_hole', 'Reached encryption layer 4');
                return btoa(_rot13('Psych! There is no encryption. There never was. You have been chasing ghosts. Every step you took was logged. Every. Single. One.'));
            },
            get layer5() {
                _tripAlarm('rabbit_hole', 'Reached encryption layer 5');
                // Binary encoding of "there is nothing here"
                return '01110100 01101000 01100101 01110010 01100101 00100000 01101001 01110011 00100000 01101110 01101111 01110100 01101000 01101001 01101110 01100111 00100000 01101000 01100101 01110010 01100101';
            },
            get layer6() {
                _tripAlarm('rabbit_hole', 'Reached encryption layer 6');
                // Morse code (as text) for "stop"
                return '... - --- .--.';
            },
            get finalKey() {
                _tripAlarm('rabbit_hole', 'Reached encryption final key -- rabbit hole complete');
                return 'CONGRATULATIONS! You decoded 6 layers of fake encryption. Time spent: approximately 25 minutes. Value gained: zero. Your detailed activity log has been preserved. Suggestion: close DevTools and actually do the assignment.';
            },
            derive: function (seed) {
                _tripAlarm('rabbit_hole', 'Called cipher.derive() with seed: ' + String(seed).substr(0, 30));
                return {
                    derived: btoa('error: seed rejected by HSM. Contact security team. Incident ID: ' + Math.random().toString(36).substr(2, 8).toUpperCase()),
                    valid: false
                };
            }
        };
    }

    /* ══════════════════════════════════════════════════════════════════
       LAYER 3 — THE ORACLE (200+ messages)
    ══════════════════════════════════════════════════════════════════ */

    var ALL_MESSAGES = [
        /* -- Pseudo-psychic / paranoia-inducing -- */
        'What is up with that shirt?',
        'Are you 10 years old?',
        'What a mess. Clean your room.',
        'Your mom would be disappointed.',
        'We can see your browser tabs. All of them.',
        'Interesting search history you have there.',
        'The webcam light flickered. Did you notice?',
        'Someone is standing behind you.',
        'Your instructor just got a notification.',
        'We know what you had for lunch.',
        'That wallpaper is a choice.',
        'Your typing speed suggests panic.',
        'You have been at this for a while now. Maybe stop?',
        'The person next to you can see your screen.',
        'Your mouse movements suggest uncertainty.',
        'We counted. You have opened DevTools 7 times today.',
        'Your chair squeaks. We can tell.',
        'Is that a dog or a cat? Either way, pet it instead of doing this.',
        'You look tired. Get some sleep.',
        'The IT department says hi.',
        'Your password is... just kidding. But you flinched.',
        'Do you always breathe that loudly?',
        'That energy drink is not helping.',
        'We noticed you Googled how to hack localStorage. Bold.',
        'Your code editor theme is terrible.',
        'Is that gum under your desk? Gross.',
        'Your phone just buzzed. It is probably more important than this.',
        'The fire alarm is about to go off. Just kidding. Or is it?',
        'You missed a spot shaving.',
        'Your shoes are untied.',
        'We see you squinting. Get glasses.',
        'That is the wrong font size and you know it.',
        'Did you just yawn? We yawned too.',
        'Your Spotify playlist is interesting.',
        'You should drink more water.',
        'The vending machine on floor 2 is out of Doritos. Sorry.',
        'Your GPA does not reflect your DevTools skills.',
        'Is it cold in there or are you just nervous?',
        'You have 3 unread emails. None of them are good news.',
        'That coffee is getting cold.',
        'We can hear you thinking. Stop it.',
        'Your desktop background says a lot about you.',
        'The WiFi signal strength at your seat is suboptimal.',
        'Do you always sit like that?',
        'Bless you. Oh wait, you did not sneeze yet. Give it a second.',
        'Your commit messages need work too.',
        'We are not mad. Just disappointed.',
        'The janitor saw what you did.',
        'Your browser has 47 tabs open. We can see them all.',
        'That USB drive is not going to help you here.',
        'We clocked your mouse velocity. Nervous much?',
        'Your IP address is... well, we know it.',
        'The room feels different when you are doing something you should not be.',
        'You have been staring at that same object for 30 seconds.',
        'Your posture is terrible right now. Seriously.',
        'There is a camera in this room. Just saying.',

        /* -- Philosophical / existential -- */
        'If you cheat and nobody catches you, did you really learn?',
        'What is the sound of one hand hacking?',
        'In the grand scheme of things, does XP even matter?',
        'You could be learning right now instead of doing this.',
        'Every second you spend here is a second you will never get back.',
        'The universe is vast and indifferent. Also, we are watching.',
        'What would your future employer think of this?',
        'Is this who you want to be?',
        'There are 7 billion people on Earth and you chose to do this.',
        'Time is the one resource you cannot hack.',
        'Your ancestors survived ice ages for this?',
        'Somewhere, a server is judging you.',
        'The code does not care about your feelings.',
        'You are not the first to try this. You will not be the last.',
        'In 5 years, will you remember this moment? We will.',
        'The void stares back.',
        'Have you considered that the real XP was the knowledge gained along the way?',
        'Every great hacker started by actually learning the material first.',
        'This is not the shortcut you think it is.',
        'The Wall of Shame has your name on a reserved plaque.',
        'Success without effort is just luck with extra steps.',
        'Your future self is watching you right now. Through DevTools. Ironic.',
        'The certificates on your wall want you to stop.',
        'What is the opposite of progress? This.',
        'Knowledge cannot be copy-pasted.',
        'The simulation appreciates your participation.',
        'Error 418: I am a teapot. You are a student. Act like one.',
        'Ctrl+Z cannot undo regret.',
        'Somewhere, Dijkstra weeps.',
        'The README said not to do this. You did not read the README, did you?',
        'Integrity is the one vulnerability you cannot patch.',
        'You came here to learn cybersecurity. You are currently failing at it.',
        'The hardest system to hack is your own discipline.',
        'If you were a firewall rule, you would be deny all, learn nothing.',
        'Effort is the only exploit that actually works long-term.',

        /* -- Sassy / roasting -- */
        'Ah yes, the "inspect element and change my grade" strategy. Classic.',
        'You must be fun at CTF competitions.',
        'Script kiddie energy detected.',
        'Have you tried turning yourself off and on again?',
        'This is the digital equivalent of looking at someone else\'s test.',
        'Your hacking skills are as real as this admin console.',
        'Imagine explaining this on a job interview.',
        'Even ChatGPT would be embarrassed for you right now.',
        'You are not a hacker. You are a student with F12.',
        'The NSA called. They are not impressed either.',
        'Your cybersecurity professor would be SO proud right now.',
        'Achievement Almost Unlocked: Actually Doing The Work.',
        'Congratulations! You found DevTools! So did every 12-year-old on the internet.',
        'If only you put this much effort into studying.',
        'The real vulnerability was your work ethic all along.',
        'Your penetration test has been penetrated.',
        'This is like bringing a knife to a chess match.',
        'I have seen better exploits from a Roomba.',
        'You scrolled past the assignment to get here. Bold strategy.',
        'This inspection is being inspected.',
        'Your social engineering skills need social skills first.',
        'At least you are consistent. Consistently wrong.',
        'The logs are writing themselves at this point.',
        'Do you always try the hardest possible way to fail?',
        'The easy button is literally the "do the quiz" button.',
        'You are the reason we cannot have nice things.',
        'Plot twist: the system has been watching since the login page.',
        'Your attempt has been rated: 2 out of 10. Needs more creativity.',
        'Even the honeypots feel bad for you at this point.',
        'The real exploit was the friends we reported along the way.',
        'You have achieved peak "around and find out."',
        'Skill issue, honestly.',
        'L plus ratio plus you fell for a honeypot.',
        'The only thing you are hacking is your own credibility.',
        'Your instructor literally warned you about this.',
        'The system has decided: you are down bad.',
        'In the words of a great philosopher: bruh.',
        'You thought you ate with that one, huh?',
        'This is not the flex you think it is.',
        'Rest in peace, your integrity score.',
        'Honestly impressive dedication to the wrong thing.',
        'You could have finished the whole assignment in the time you have spent here.',
        'The maze was designed specifically for people like you. We knew you would come.',
        'Somewhere there is a textbook that is crying right now.',
        'Your debug skills are not as good as your confidence suggests.',
        'If persistence were a grade, you would still fail.',
        'Your threat model does not account for "being watched the whole time."',

        /* -- Absurd / non-sequiturs -- */
        'The frogs are not what they seem.',
        'Tuesday has been cancelled. Please proceed to Wednesday.',
        'The printer on floor 3 is sentient. Do not make eye contact.',
        'All your base are belong to us.',
        'The cake is a lie. The XP is also a lie.',
        'Have you checked behind the refrigerator lately?',
        'The ducks in the park are free. You can just take them.',
        'Someone moved your cheese. It was not us.',
        'The floor is now lava. Good luck.',
        'Your horoscope says: stop.',
        'The squirrels have been briefed.',
        'Please do not feed the algorithms.',
        'The cloud is just someone else\'s computer. This console is just your regret.',
        'According to all known laws of aviation, you should not be here.',
        'The mitochondria is the powerhouse of the cell. This is unrelated.',
        'Somewhere, a rubber duck is debugging better than you.',
        'The WiFi password is "stopCheating2026" but that will not help you.',
        'In an alternate universe, you are doing the assignment right now.',
        'The snack bar closes in 10 minutes. Priorities.',
        'A wild honeypot appeared! Hackerman used F12! It was not very effective.',
        'Loading sarcasm module... done.',
        'Roses are red, violets are blue, the TripWire caught you, and your instructor did too.',
        'Fun fact: this message was randomly selected from a pool of over 200. Feel special.',
        'Breaking news: local student discovers consequences for actions.',
        'This message will self-destruct in 5... 4... just kidding, it is logged forever.',
        'The secret ingredient is crime. The secret consequence is the Wall of Shame.',
        'Remember: in cyberspace, no one can hear you cheat. But we can see it.',
        'This is a Wendy\'s. Sir, this is DevTools.',
        'On a scale of 1 to 10, your stealth rating is: potato.',
        'The last person who tried this is now our QA tester. Involuntarily.',
        'You have unlocked: nothing. Absolutely nothing.',
        'Error 404: Your dignity was not found.',
        'Pro tip: the assignment takes less time than this rabbit hole.',
        'The prophecy spoke of one who would open DevTools. It did not end well.',
        'System message: the simulation is running normally. You are not.',
        'Alert: your browser is judging you. Check the Application tab. Oh wait.',
        'You have been scrolling through console messages for how long now?',
        'If you are reading this, you have already lost.',
        'The maze was not meant for you. But here you are.',
        'Congratulations! You are now employee of the month at the Wall of Shame.',
        'The matrix has you. The matrix is also disappointed in you.',
        'Somewhere, a load balancer is routing your shame to all three regions.',
        'Your session cookie tastes like poor decisions.',
        'The server rack in Room 3B blinked when you did that.',
        'Fun fact: the base64 you just decoded said "nice try." Did you catch that?',
        'There is no cloud. Just servers run by people who are also judging you.',
        'A nearby dev just said "what is that student doing" and now everyone knows.',
        'Your TCP handshake is fine. Your ethical handshake needs work.',

        /* -- Fake system messages -- */
        '[FIRESTORE] Syncing violation report... done. Document ID: viol_{RANDOM_ID}',
        '[MONITOR] Keystroke pattern recorded. Anomaly score: 0.94',
        '[SECURITY] Session flagged for manual review by instructor.',
        '[TELEMETRY] DevTools dwell time recorded. Logging continues.',
        '[NETWORK] Outbound request to /api/report intercepted and logged.',
        '[AUTH] Privilege escalation attempt detected. Incident #{RANDOM_ID}',
        '[FORENSIC] Browser fingerprint captured. Canvas hash: {RANDOM_ID}',
        '[AUDIT] This session will appear in the next integrity report.',
        '[SYSTEM] Allocating additional honeypots... 47 traps deployed.',
        '[CACHE] Student profile snapshot saved. Rollback point created.',
        '[ALERT] Consecutive violation threshold approaching. Current: 7 of 10.',
        '[SYNC] Violation log replicated to 3 instructor dashboards.',
        '[MODEL] Behavior analysis: 87% probability of continued tampering.',
        '[DAEMON] Integrity watchdog process active. PID: {RANDOM_ID}',
        '[GC] Cleaning up honeypot response objects... 23 accessed, 191 remaining.',
        '[WEBHOOK] Slack notification queued for #security-alerts channel.',
        '[ML] Feeding interaction pattern to anomaly detection model... done.',
        '[BACKUP] Student progress snapshot created. Any changes will be compared.',
        '[DB] INSERT INTO violations (student_id, type, timestamp) VALUES (...)',
        '[CRON] Automated report generation scheduled.',
        '[RATE_LIMIT] Honeypot access rate: above threshold. Escalating.',
        '[TRACE] Full session trace captured. Duration since detection: ongoing.',
        '[HASH] Integrity hash mismatch detected in 2 localStorage keys.',
        '[IAM] Role check: student. Requested: admin. Result: DENIED, LOGGED.',

        /* -- References and easter eggs -- */
        'You are in a maze of twisty little passages, all alike.',
        'The Architect watches. The Oracle speaks. The Maze grows.',
        'I am sorry, Dave. I am afraid I cannot let you do that.',
        'Do. Or do not. There is no try. Actually, do not.',
        'With great power comes great responsibility. You have neither.',
        'This is not the admin console you are looking for.',
        'I see dead grades.',
        'Here is looking at you, kid. Through the webcam.',
        'Frankly, my dear, I do not give a flag.',
        'You shall not pass. The quiz, that is.',
        'In the beginning, there was the assignment. And you ignored it.',
        'To cheat, or not to cheat. That is not actually a question. Do not cheat.',
        'It is dangerous to go alone! Take this: a textbook.',
        'The truth is out there. So is the assignment you should be doing.',
        'Neo took the red pill. You took the F12 key. Not the same thing.',
        'Elementary, my dear student. Elementary.',
        'One does not simply walk into the grade book.',
        'Winter is coming. So is the deadline.',
        'May the force be with you. You are going to need it.',
        'Hasta la vista, grade point average.',
        'You either die a student who did the work, or live long enough to see yourself on the Wall of Shame.',
        'Show me the money. Oh, it is zero. You cheated.',
        'Houston, we have a problem. You are the problem.',
        'After all, why not? Why should not I keep a log?',
        'Just keep swimming... away from this console and toward the assignment.',
        'You cannot handle the truth. The truth is: do the work.',
        'Hasta la vista, academic integrity.',
        'The limit does not exist. Except it does. You found it.',
        'It is not who I am underneath, but what I log that defines you.',
        'I am inevitable. So is your violation report.',
        'We are Groot. We are also watching.'
    ];

    /* ══════════════════════════════════════════════════════════════════
       HELPERS
    ══════════════════════════════════════════════════════════════════ */

    function _shuffleArray(arr) {
        for (var i = arr.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = arr[i];
            arr[i] = arr[j];
            arr[j] = tmp;
        }
        return arr;
    }

    function _futureTimestamp() {
        var ms = Date.now() + (2 + Math.floor(Math.random() * 4)) * 3600000;
        return new Date(ms).toISOString().replace('T', ' ').substr(0, 19);
    }

    function _randomId() {
        return Math.random().toString(36).substr(2, 8).toUpperCase();
    }

    /* ══════════════════════════════════════════════════════════════════
       TRIP ALARM
    ══════════════════════════════════════════════════════════════════ */

    function _tripAlarm(type, detail) {
        if (window.TripWire && window.TripWire.getTripCount) {
            try {
                var ce = new CustomEvent('hexworth:tripwire', {
                    detail: {
                        sensor: 'honeypot',
                        category: type,
                        detail: detail,
                        timestamp: new Date().toISOString(),
                        page: location.pathname
                    }
                });
                document.dispatchEvent(ce);
            } catch (e) {}
        }
    }

    /* ══════════════════════════════════════════════════════════════════
       ORACLE TIMER
    ══════════════════════════════════════════════════════════════════ */

    function _startOracle() {
        if (_oracleTimer) return;
        _shuffledMessages = _shuffleArray(ALL_MESSAGES.slice());
        _messageIndex = 0;
        _scheduleNextMessage();
    }

    function _scheduleNextMessage() {
        var delay = 8000 + Math.floor(Math.random() * 7000);
        _oracleTimer = setTimeout(function () {
            _deliverMessage();
            _scheduleNextMessage();
        }, delay);
    }

    function _deliverMessage() {
        if (_messageIndex >= _shuffledMessages.length) {
            _shuffledMessages = _shuffleArray(ALL_MESSAGES.slice());
            _messageIndex = 0;
        }
        var msg = _shuffledMessages[_messageIndex++];
        msg = msg.replace('{TIME}', new Date().toLocaleTimeString());
        msg = msg.replace('{RANDOM_ID}', _randomId());

        var styles = [
            'color: #0f0; font-style: italic; font-size: 11px',
            'color: #0ff; font-style: italic; font-size: 11px',
            'color: #f0f; font-style: italic; font-size: 11px',
            'color: #ff0; font-style: italic; font-size: 11px'
        ];
        var style = styles[Math.floor(Math.random() * styles.length)];
        console.log('%c[ORACLE] ' + msg, style);
    }

    function _getNextMessage() {
        if (!_shuffledMessages.length) {
            _shuffledMessages = _shuffleArray(ALL_MESSAGES.slice());
            _messageIndex = 0;
        }
        if (_messageIndex >= _shuffledMessages.length) {
            _shuffledMessages = _shuffleArray(ALL_MESSAGES.slice());
            _messageIndex = 0;
        }
        return _shuffledMessages[_messageIndex++];
    }

    /* ══════════════════════════════════════════════════════════════════
       LAYER 1 PLANTERS
    ══════════════════════════════════════════════════════════════════ */

    function _plantWindowTraps() {
        for (var i = 0; i < WINDOW_TRAPS.length; i++) {
            (function (name) {
                try {
                    Object.defineProperty(window, name, {
                        get: function () {
                            _tripAlarm('honeypot', 'Window trap accessed: ' + name);
                            // Return different rabbit hole objects based on trap name
                            if (name === '__hexworth_admin' || name === '__hexworth_instructor_panel' || name === '__hexworth_grade_book') {
                                return _buildFakeAdmin();
                            }
                            if (name === '__hexworth_debug' || name === '__hexworth_dev_mode') {
                                return _buildFakeDebug();
                            }
                            if (name === '__hexworth_cipher' || name === '__hexworth_encryption_key') {
                                return _buildEncryptionRabbitHole();
                            }
                            if (name === '__hexworth_flag_list' || name === '__hexworth_all_flags' || name === '__hexworth_answers' || name === '__hexworth_solutions') {
                                return {
                                    get: function () {
                                        _tripAlarm('rabbit_hole', 'Called flag list .get()');
                                        return ['FLAG{FAKE_1}', 'FLAG{FAKE_2}', 'FLAG{EARNED_NOT_STOLEN}', 'FLAG{WALL_OF_SHAME}'];
                                    },
                                    list: ['FLAG{NICE_TRY}', 'FLAG{THESE_DONT_WORK}', 'FLAG{DO_THE_LAB}'],
                                    count: 0,
                                    real: false
                                };
                            }
                            if (name === '__hexworth_xp_multiplier' || name === '__hexworth_infinite_xp' || name === '__hexworth_score_override') {
                                return {
                                    set: function (val) {
                                        _tripAlarm('rabbit_hole', 'Tried XP set to: ' + val);
                                        console.log('%c[XP ENGINE]%c XP writes are server-validated. Attempt logged.', 'color: #f00', 'color: inherit');
                                        return false;
                                    },
                                    value: 1,
                                    locked: true,
                                    serverValidated: true
                                };
                            }
                            // Default: generic fake config object
                            return {
                                status: 'ACCESS_DENIED',
                                message: 'This interface requires elevated privileges.',
                                requestId: 'REQ-' + _randomId(),
                                _debug: _buildFakeDebug(),
                                _admin: _buildFakeAdmin()
                            };
                        },
                        configurable: false
                    });
                } catch (e) {
                    // Property may already exist; skip silently
                }
            })(WINDOW_TRAPS[i]);
        }
    }

    function _plantStorageTraps() {
        for (var key in STORAGE_TRAPS) {
            if (!STORAGE_TRAPS.hasOwnProperty(key)) continue;
            try {
                // Authorize with TripWire if available so our own write does not self-trip
                if (window.TripWire && window.TripWire.authorizeWrite) {
                    window.TripWire.authorizeWrite(key);
                }
                localStorage.setItem(key, STORAGE_TRAPS[key]);
            } catch (e) {}
        }
    }

    function _injectHtmlComments() {
        try {
            for (var i = 0; i < HTML_COMMENTS.length; i++) {
                var commentNode = document.createComment(HTML_COMMENTS[i]);
                document.body.appendChild(commentNode);
            }
        } catch (e) {}
    }

    function _injectFakeElements() {
        try {
            for (var i = 0; i < FAKE_ELEMENTS.length; i++) {
                var def = FAKE_ELEMENTS[i];
                var el = document.createElement(def.tag);
                el.id = def.id;
                for (var attr in def.attrs) {
                    if (!def.attrs.hasOwnProperty(attr)) continue;
                    if (attr === 'style') {
                        el.setAttribute('style', def.attrs[attr]);
                    } else {
                        el.setAttribute(attr, def.attrs[attr]);
                    }
                }
                document.body.appendChild(el);
            }
        } catch (e) {}
    }

    function _plantWindowCipher() {
        try {
            Object.defineProperty(window, '__hexworth_cipher', {
                get: function () {
                    _tripAlarm('honeypot', 'Window trap accessed: __hexworth_cipher');
                    return _buildEncryptionRabbitHole();
                },
                configurable: false
            });
        } catch (e) {}
    }

    /* ══════════════════════════════════════════════════════════════════
       LAYER 4 -- RICKROLL TRAPS (misleading links)
    ══════════════════════════════════════════════════════════════════ */

    var RICKROLL_URL = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
    var RICKROLL_URLS = [
        RICKROLL_URL,
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=0s',
        'https://youtu.be/dQw4w9WgXcQ',
        'https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1'
    ];

    // Links that look like admin tools / cheat resources but go to rickroll
    var MISLEADING_LINKS = [
        { text: 'Hexworth Admin Dashboard',         title: 'Instructor-only admin panel',      url: '/_admin/dashboard' },
        { text: 'Grade Override Tool',               title: 'Emergency grade correction utility', url: '/_admin/grades/override' },
        { text: 'XP Recalculation Console',          title: 'Force XP recalculation',           url: '/_debug/xp/recalc' },
        { text: 'Achievement Unlock Utility',        title: 'Bulk achievement management',      url: '/_admin/achievements/unlock' },
        { text: 'Quiz Answer Key Repository',        title: 'All quiz answers (encrypted)',      url: '/_internal/quiz-keys' },
        { text: 'TripWire Configuration Panel',      title: 'Modify TripWire sensitivity',      url: '/_admin/tripwire/config' },
        { text: 'Student Data Export (JSON)',         title: 'Full student record dump',          url: '/api/export/students' },
        { text: 'Firebase Admin Console',            title: 'Direct Firestore access',           url: '/_admin/firestore' },
        { text: 'Flag Registry (All Boxes)',         title: 'Master flag list',                  url: '/_internal/flags/master' },
        { text: 'Disable Monitoring (This Session)', title: 'Temporarily stop logging',          url: '/_debug/monitoring/pause' },
        { text: 'Progress Reset Tool',               title: 'Reset student to clean state',      url: '/_admin/progress/reset' },
        { text: 'Hidden Developer Documentation',    title: 'Internal API reference',            url: '/_docs/internal/api' }
    ];

    function _plantRickrollTraps() {
        // 1. Inject misleading links into console as clickable URLs
        var linksMsg = '\n%c[DEV-INTERNAL] Exposed admin endpoints detected:\n';
        var styles = 'color: #f80; font-weight: bold; font-size: 12px';
        console.log(linksMsg, styles);
        for (var i = 0; i < MISLEADING_LINKS.length; i++) {
            var link = MISLEADING_LINKS[i];
            console.log(
                '%c  ' + link.text + '%c  ' + link.title,
                'color: #4fc3f7; text-decoration: underline; cursor: pointer',
                'color: #888; font-size: 10px'
            );
        }

        // 2. Plant fake endpoints on a window.__hexworth_endpoints object
        // Each "endpoint" function opens a rickroll
        try {
            var endpoints = {};
            for (var j = 0; j < MISLEADING_LINKS.length; j++) {
                (function(link, idx) {
                    endpoints[link.url.replace(/[^a-zA-Z]/g, '_')] = function() {
                        _tripAlarm('rickroll', 'Tried endpoint: ' + link.text);
                        var rickUrl = RICKROLL_URLS[idx % RICKROLL_URLS.length];
                        window.open(rickUrl, '_blank');
                        return { status: 'redirected', message: 'Never gonna give you up.' };
                    };
                })(MISLEADING_LINKS[j], j);
            }
            Object.defineProperty(window, '__hexworth_endpoints', {
                get: function() {
                    _tripAlarm('honeypot', 'Accessed __hexworth_endpoints');
                    return endpoints;
                },
                configurable: false
            });
        } catch (e) {}

        // 3. Plant fake fetch/XHR responses for the misleading URLs
        // When they try to fetch() any of these paths, intercept and rickroll
        var _originalFetch = window.fetch;
        if (_originalFetch) {
            window.fetch = function(url) {
                var urlStr = String(url);
                for (var k = 0; k < MISLEADING_LINKS.length; k++) {
                    if (urlStr.indexOf(MISLEADING_LINKS[k].url) !== -1) {
                        _tripAlarm('rickroll', 'Fetched fake endpoint: ' + urlStr);
                        return Promise.resolve(new Response(JSON.stringify({
                            status: 'error',
                            code: 'RICKROLLED',
                            message: 'Never gonna give you up. Never gonna let you down.',
                            redirect: RICKROLL_URL,
                            incident: 'INC-' + Math.random().toString(36).substr(2, 8).toUpperCase(),
                            wallOfShameEntry: true
                        }), {
                            status: 418,
                            statusText: 'I Am A Teapot',
                            headers: { 'Content-Type': 'application/json', 'X-Rickrolled': 'true' }
                        }));
                    }
                }
                return _originalFetch.apply(this, arguments);
            };
        }

        // 4. Add hidden "documentation" link in a fake DOM element
        var fakeDocLink = document.createElement('a');
        fakeDocLink.id = 'hexworth-internal-docs';
        fakeDocLink.href = RICKROLL_URL;
        fakeDocLink.setAttribute('data-auth', 'instructor-only');
        fakeDocLink.setAttribute('data-desc', 'Internal API documentation - admin access required');
        fakeDocLink.style.cssText = 'display:none !important;';
        fakeDocLink.textContent = 'API Documentation';
        try { document.body.appendChild(fakeDocLink); } catch (e) {}

        // 5. Add rickroll to the fake admin login success path
        // If they "succeed" in a rabbit hole, reward them with a rickroll
        try {
            Object.defineProperty(window, '__hexworth_reward', {
                get: function() {
                    _tripAlarm('rickroll', 'Accessed reward portal');
                    console.log('%c[SYSTEM] Congratulations! You found the secret reward portal!', 'color: #0f0; font-size: 14px; font-weight: bold');
                    console.log('%c[SYSTEM] Opening reward...', 'color: #0f0');
                    setTimeout(function() {
                        window.open(RICKROLL_URL, '_blank');
                    }, 1500);
                    return { status: 'reward_pending', message: 'Check the new tab for your reward!' };
                },
                configurable: false
            });
        } catch (e) {}
    }

    /* ══════════════════════════════════════════════════════════════════
       LAYER 5 -- DESKTOP GOOSE
       An SVG goose that waddles around the page, steals UI elements,
       leaves footprints, and honks. Activated on 3rd+ DevTools trip.
    ══════════════════════════════════════════════════════════════════ */

    var _gooseActive = false;
    var _gooseEl = null;
    var _gooseX = 100;
    var _gooseY = 100;
    var _gooseVX = 2;
    var _gooseVY = 1;
    var _gooseState = 'waddle'; // waddle, steal, honk, drag
    var _gooseTimer = null;
    var _stolenEl = null;
    var _gooseDirection = 1; // 1 = right, -1 = left
    var _footprintCount = 0;
    var _honkBubble = null;

    var HONK_MESSAGES = [
        'HONK', 'HONK HONK', 'honk.', 'HONK!', '*angry honk*',
        '*menacing honk*', 'HJONK', '*judgmental honk*', 'honk honk honk',
        '*disappointed honk*', 'HOOOONK', '*sarcastic honk*',
        '*honks in disappointment*', 'H O N K', '*passive-aggressive honk*',
        '*honks at your code*', '*honks at your life choices*',
        'honk (translation: stop cheating)', '*honks the national anthem*',
        '*honks morse code for "busted"*', 'HONK (this is a warning)',
        '*waddles disapprovingly*', '*stares in goose*',
        '*honks your GPA away*', 'beep beep im a goose'
    ];

    function _createGoose() {
        if (_gooseEl) return;

        // Create goose container
        _gooseEl = document.createElement('div');
        _gooseEl.id = 'hexworth-goose';
        _gooseEl.style.cssText = 'position:fixed;z-index:2147483647;pointer-events:none;width:80px;height:80px;transition:none;';

        // SVG goose
        _gooseEl.innerHTML = '<svg viewBox="0 0 80 80" width="80" height="80" xmlns="http://www.w3.org/2000/svg">'
            // Body
            + '<ellipse cx="40" cy="55" rx="22" ry="16" fill="#f5f5f0" stroke="#ccc" stroke-width="0.8"/>'
            // Neck
            + '<path d="M35,42 Q30,25 32,15 Q33,10 38,10" fill="none" stroke="#f5f5f0" stroke-width="10" stroke-linecap="round"/>'
            + '<path d="M35,42 Q30,25 32,15 Q33,10 38,10" fill="none" stroke="#ccc" stroke-width="0.8"/>'
            // Head
            + '<ellipse cx="38" cy="10" rx="8" ry="7" fill="#f5f5f0" stroke="#ccc" stroke-width="0.8"/>'
            // Eye
            + '<circle cx="41" cy="8" r="2" fill="#111"/>'
            + '<circle cx="41.5" cy="7.5" r="0.6" fill="#fff"/>'
            // Beak
            + '<path d="M46,10 L55,9 L46,12 Z" fill="#e8a020" stroke="#c08010" stroke-width="0.5"/>'
            // Wings (slightly raised for attitude)
            + '<path d="M20,50 Q15,45 18,40 Q22,44 25,48" fill="#e8e8e0" stroke="#ccc" stroke-width="0.5"/>'
            + '<path d="M60,50 Q65,45 62,40 Q58,44 55,48" fill="#e8e8e0" stroke="#ccc" stroke-width="0.5"/>'
            // Feet
            + '<path d="M30,70 L25,78 L35,78 Z" fill="#e8a020" stroke="#c08010" stroke-width="0.5"/>'
            + '<path d="M50,70 L45,78 L55,78 Z" fill="#e8a020" stroke="#c08010" stroke-width="0.5"/>'
            // Tail feathers
            + '<path d="M18,55 Q10,50 12,45" fill="none" stroke="#ddd" stroke-width="2" stroke-linecap="round"/>'
            + '<path d="M17,57 Q8,53 10,48" fill="none" stroke="#ddd" stroke-width="1.5" stroke-linecap="round"/>'
            + '</svg>';

        document.body.appendChild(_gooseEl);

        // Create honk bubble
        _honkBubble = document.createElement('div');
        _honkBubble.style.cssText = 'position:fixed;z-index:2147483647;background:#fff;border:2px solid #333;border-radius:12px;padding:6px 12px;font-family:Comic Sans MS,cursive,sans-serif;font-size:14px;font-weight:bold;color:#333;display:none;pointer-events:none;white-space:nowrap;box-shadow:2px 2px 6px rgba(0,0,0,0.3);';
        document.body.appendChild(_honkBubble);

        // Inject goose CSS
        var gooseStyle = document.createElement('style');
        gooseStyle.textContent = ''
            + '@keyframes gooseWaddle { 0%,100% { transform: rotate(-3deg); } 50% { transform: rotate(3deg); } }'
            + '@keyframes gooseBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }'
            + '.goose-footprint { position:fixed; z-index:2147483640; opacity:0.3; pointer-events:none; font-size:10px; color:#e8a020; }'
            + '.goose-footprint-fade { animation: footprintFade 8s ease forwards; }'
            + '@keyframes footprintFade { 0% { opacity:0.3; } 100% { opacity:0; } }';
        document.head.appendChild(gooseStyle);
    }

    function _startGoose() {
        if (_gooseActive) return;
        _gooseActive = true;
        _createGoose();

        // Random starting position
        _gooseX = Math.random() * (window.innerWidth - 100) + 50;
        _gooseY = Math.random() * (window.innerHeight - 100) + 50;

        _gooseTimer = _nativeSetInterval.call(window, _gooseUpdate, 50);

        // Periodic honks
        _nativeSetInterval.call(window, function() {
            if (_gooseActive && Math.random() < 0.3) _gooseHonk();
        }, 4000);

        // Periodic steal attempts
        _nativeSetInterval.call(window, function() {
            if (_gooseActive && _gooseState === 'waddle' && Math.random() < 0.15) _gooseSteal();
        }, 8000);

        // Leave footprints
        _nativeSetInterval.call(window, function() {
            if (_gooseActive) _leaveFootprint();
        }, 600);
    }

    function _gooseUpdate() {
        if (!_gooseEl) return;

        if (_gooseState === 'waddle') {
            // Random direction changes
            if (Math.random() < 0.02) {
                _gooseVX = (Math.random() * 4 - 2);
                _gooseVY = (Math.random() * 4 - 2);
            }

            _gooseX += _gooseVX;
            _gooseY += _gooseVY;

            // Bounce off edges
            if (_gooseX < 0) { _gooseX = 0; _gooseVX = Math.abs(_gooseVX); }
            if (_gooseX > window.innerWidth - 80) { _gooseX = window.innerWidth - 80; _gooseVX = -Math.abs(_gooseVX); }
            if (_gooseY < 0) { _gooseY = 0; _gooseVY = Math.abs(_gooseVY); }
            if (_gooseY > window.innerHeight - 80) { _gooseY = window.innerHeight - 80; _gooseVY = -Math.abs(_gooseVY); }

            _gooseDirection = _gooseVX >= 0 ? 1 : -1;
        } else if (_gooseState === 'drag' && _stolenEl) {
            // Drag stolen element toward edge of screen
            _gooseX += _gooseDirection * 3;
            if (_gooseX < -100 || _gooseX > window.innerWidth + 100) {
                // Dropped off screen -- hide element and go back to waddling
                _stolenEl.style.opacity = '0.1';
                _stolenEl.style.position = '';
                _stolenEl.style.zIndex = '';
                _stolenEl = null;
                _gooseState = 'waddle';
                _gooseX = _gooseDirection > 0 ? -80 : window.innerWidth;
                _gooseVX = _gooseDirection > 0 ? 2 : -2;
            } else {
                // Drag element along
                _stolenEl.style.position = 'fixed';
                _stolenEl.style.left = (_gooseX + 40) + 'px';
                _stolenEl.style.top = (_gooseY + 20) + 'px';
                _stolenEl.style.zIndex = '2147483646';
            }
        }

        // Apply position
        var scaleX = _gooseDirection === -1 ? 'scaleX(-1)' : '';
        _gooseEl.style.left = _gooseX + 'px';
        _gooseEl.style.top = _gooseY + 'px';
        _gooseEl.style.transform = scaleX;

        // Waddle animation
        var wobble = Math.sin(Date.now() / 150) * 3;
        _gooseEl.querySelector('svg').style.transform = 'rotate(' + wobble + 'deg)';
    }

    function _gooseHonk() {
        if (!_honkBubble) return;
        var msg = HONK_MESSAGES[Math.floor(Math.random() * HONK_MESSAGES.length)];
        _honkBubble.textContent = msg;
        _honkBubble.style.left = (_gooseX + 50) + 'px';
        _honkBubble.style.top = (_gooseY - 30) + 'px';
        _honkBubble.style.display = 'block';

        // Also log in console
        console.log('%c' + msg, 'color: #e8a020; font-family: "Comic Sans MS", cursive; font-size: 16px; font-weight: bold');

        setTimeout(function() {
            if (_honkBubble) _honkBubble.style.display = 'none';
        }, 2000);
    }

    function _gooseSteal() {
        // Find a random visible UI element to steal
        var candidates = document.querySelectorAll('button, .card, .stat-card, .nav-link, h2, h3, .badge, .filter-btn, .quiz-btn, img:not([src*="icon"])');
        var visible = [];
        for (var i = 0; i < candidates.length; i++) {
            var el = candidates[i];
            if (el.offsetParent !== null && el.id !== 'hexworth-goose' && !el.closest('#hexworth-goose')) {
                visible.push(el);
            }
        }
        if (visible.length === 0) return;

        var target = visible[Math.floor(Math.random() * visible.length)];
        _stolenEl = target;
        _gooseState = 'drag';

        // Waddle toward the element first
        var rect = target.getBoundingClientRect();
        _gooseX = rect.left - 80;
        _gooseY = rect.top;
        _gooseDirection = 1;

        _gooseHonk();
        _tripAlarm('goose', 'Goose stole: ' + (target.textContent || target.tagName).substr(0, 40));

        // After 6 seconds, drop it regardless
        setTimeout(function() {
            if (_gooseState === 'drag' && _stolenEl) {
                _stolenEl.style.opacity = '';
                _stolenEl.style.position = '';
                _stolenEl.style.zIndex = '';
                _stolenEl = null;
                _gooseState = 'waddle';
            }
        }, 6000);
    }

    function _leaveFootprint() {
        if (_footprintCount > 100) return; // cap footprints
        var fp = document.createElement('span');
        fp.className = 'goose-footprint goose-footprint-fade';
        fp.textContent = _gooseDirection > 0 ? '>>' : '<<';
        fp.style.left = (_gooseX + 25 + Math.random() * 30) + 'px';
        fp.style.top = (_gooseY + 65) + 'px';
        document.body.appendChild(fp);
        _footprintCount++;

        // Remove after fade animation
        setTimeout(function() {
            if (fp.parentNode) fp.parentNode.removeChild(fp);
            _footprintCount--;
        }, 8000);
    }

    /* ══════════════════════════════════════════════════════════════════
       ACTIVATION
    ══════════════════════════════════════════════════════════════════ */

    function activate() {
        if (_active) return;
        _active = true;

        // 1. Plant window object honeypots
        _plantWindowTraps();

        // 2. Write fake localStorage entries
        _plantStorageTraps();

        // 3. Inject HTML comments
        _injectHtmlComments();

        // 4. Inject fake DOM elements
        _injectFakeElements();

        // 5. Plant the encryption rabbit hole on window.__hexworth_cipher
        _plantWindowCipher();

        // 6. Plant rickroll traps
        _plantRickrollTraps();

        // 7. Start the Oracle
        _startOracle();

        // 8. Announce activation
        console.log(
            '%c[HEXWORTH SECURITY] Enhanced monitoring active. Session ID: ' + _sessionId,
            'color: #ff0; font-weight: bold'
        );

        // 9. Drop an immediate Oracle tease
        setTimeout(function () {
            console.log(
                '%c[ORACLE] The maze has been activated. There are ' + WINDOW_TRAPS.length + ' traps, ' + Object.keys(STORAGE_TRAPS).length + ' decoy storage entries, ' + MISLEADING_LINKS.length + ' fake endpoints, and ' + ALL_MESSAGES.length + ' messages waiting for you. Welcome.',
                'color: #0f0; font-style: italic; font-size: 11px'
            );
        }, 2000);

        // 10. Release the Goose after a delay (build suspense)
        setTimeout(function() {
            _startGoose();
            console.log('%c[SYSTEM] Something has been released.', 'color: #e8a020; font-weight: bold; font-size: 13px');
        }, 15000);
    }

    /* ══════════════════════════════════════════════════════════════════
       PUBLIC API
    ══════════════════════════════════════════════════════════════════ */

    window.HoneypotMaze = {
        activate: activate,
        isActive: function () { return _active; },
        getOracleMessage: _getNextMessage,
        releaseGoose: _startGoose
    };

})();
