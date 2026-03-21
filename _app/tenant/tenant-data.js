/**
 * TenantData — Real-data layer for Hexworth Prime tenant dashboards.
 *
 * Replaces all simulated/placeholder data with live Firebase data.
 * Loaded as a shared script by all dashboard variants (index, tactical-hud,
 * command-center, clean-ops, enterprise).
 *
 * Responsibilities:
 *   1. Firebase Auth integration (Google sign-in or anonymous)
 *   2. Fetch student profile from Firestore users/{uid}
 *   3. Fetch assignments via getAssignments Cloud Function
 *   4. Fetch leaderboard data from class progress
 *   5. Update DOM elements (stat cards, mission queue, leaderboard)
 *
 * All DOM updates use graceful ID lookups — if an element ID does not
 * exist in a given variant, the update is silently skipped.
 *
 * @feature WL-DATA
 */
var TenantData = (function() {
    'use strict';

    // ── Firebase SDK version (must match the rest of the codebase) ──
    var FIREBASE_VERSION = '12.7.0';
    var CDN = 'https://www.gstatic.com/firebasejs/' + FIREBASE_VERSION;
    var CF_BASE = 'https://us-central1-hexworth-prime.cloudfunctions.net';

    var FIREBASE_CONFIG = {
        apiKey:            'AIzaSyC3tWNETi36DA8Q1I60n7t09YfU9HapA4M',
        authDomain:        'hexworth-prime.firebaseapp.com',
        projectId:         'hexworth-prime',
        storageBucket:     'hexworth-prime.firebasestorage.app',
        messagingSenderId: '11726236962',
        appId:             '1:11726236962:web:1829ea0839f2587121497b'
    };

    // ── Internal state ──
    var _app = null;
    var _auth = null;
    var _db = null;
    var _functions = null;
    var _config = null;       // tenant config (from getTenantConfig)
    var _profile = null;      // Firestore users/{uid} document
    var _assignments = null;  // result of getAssignments CF
    var _initialized = false;

    // ── SDK loaders (idempotent — reuse if already loaded) ──

    async function _loadSDK() {
        if (!window.firebaseApp) {
            window.firebaseApp = await import(CDN + '/firebase-app.js');
        }
        if (!window.firebaseAuth) {
            window.firebaseAuth = await import(CDN + '/firebase-auth.js');
        }
        if (!window.firebaseFirestore) {
            window.firebaseFirestore = await import(CDN + '/firebase-firestore.js');
        }
        if (!window.firebaseFunctions) {
            window.firebaseFunctions = await import(CDN + '/firebase-functions.js');
        }
    }

    function _initFirebaseApp() {
        var fa = window.firebaseApp;
        if (fa.getApps().length > 0) {
            _app = fa.getApps()[0];
        } else {
            _app = fa.initializeApp(FIREBASE_CONFIG);
        }
        _auth = window.firebaseAuth.getAuth(_app);
        _db = window.firebaseFirestore.getFirestore(_app);
        _functions = window.firebaseFunctions.getFunctions(_app, 'us-central1');
    }

    // ── Auth helpers ──

    /**
     * Wait for Firebase auth state to resolve.
     * Returns the current user or null.
     */
    function _waitForAuthState() {
        return new Promise(function(resolve) {
            if (_auth.currentUser) {
                resolve(_auth.currentUser);
                return;
            }
            var unsub = window.firebaseAuth.onAuthStateChanged(_auth, function(user) {
                unsub();
                resolve(user);
            });
        });
    }

    /**
     * Show a sign-in button in the header area.
     * Replaces "ANALYST" / "Analyst" label with a clickable "Sign In" button.
     */
    function _showSignInUI() {
        // Common IDs across variants for the operative/user name label
        var targets = [
            'header-operative',
            'header-user-name',
            'statusbar-operative',
            'welcome-name'
        ];

        targets.forEach(function(id) {
            var el = document.getElementById(id);
            if (!el) return;
            el.textContent = '';

            var btn = document.createElement('button');
            btn.textContent = 'Sign In';
            btn.className = 'td-signin-btn';
            btn.style.cssText = 'background:var(--brand-primary,#06b6d4);color:#000;border:none;' +
                'padding:5px 14px;border-radius:4px;font-size:0.78rem;font-weight:700;cursor:pointer;' +
                'letter-spacing:0.04em;text-transform:uppercase;';
            btn.addEventListener('click', function() {
                _doSignIn();
            });
            el.appendChild(btn);
        });
    }

    /**
     * Perform Google sign-in (preferred) or anonymous sign-in as fallback.
     */
    async function _doSignIn() {
        try {
            var authConfig = _config && _config.auth;
            var allowGoogle = authConfig && authConfig.allowGoogleSSO !== false;

            if (allowGoogle) {
                var GA = window.firebaseAuth;
                var provider = new GA.GoogleAuthProvider();
                await GA.signInWithPopup(_auth, provider);
            } else {
                await window.firebaseAuth.signInAnonymously(_auth);
            }

            // Auth state change triggers re-init
            await _onSignedIn();
        } catch (err) {
            console.error('[TenantData] Sign-in failed:', err.message);
            // If Google popup was blocked or errored, try anonymous
            if (err.code && err.code.indexOf('popup') !== -1) {
                try {
                    await window.firebaseAuth.signInAnonymously(_auth);
                    await _onSignedIn();
                } catch (anonErr) {
                    console.error('[TenantData] Anonymous fallback failed:', anonErr.message);
                }
            }
        }
    }

    /**
     * Called after successful sign-in. Fetches data and updates the dashboard.
     */
    async function _onSignedIn() {
        var user = _auth.currentUser;
        if (!user) return;

        _updateUserLabels(user);

        // Fetch profile + assignments in parallel
        try {
            var results = await Promise.allSettled([
                _fetchProfile(user.uid),
                _fetchAssignments()
            ]);

            _profile = results[0].status === 'fulfilled' ? results[0].value : null;
            _assignments = results[1].status === 'fulfilled' ? results[1].value : null;

            updateStats(_profile, _assignments);
            updateMissionQueue(_assignments);
            updateLeaderboard();
            _updateWelcome(_profile, user);
            _updateXPBar(_profile);
        } catch (err) {
            console.error('[TenantData] Data fetch error:', err);
        }
    }

    /**
     * Update header labels with the signed-in user identity.
     */
    function _updateUserLabels(user) {
        var displayName = user.displayName || user.email || 'Operative';
        var shortName = displayName.split(' ')[0]; // First name only

        _setText('header-operative', shortName.toUpperCase());
        _setText('header-user-name', shortName);
        _setText('statusbar-operative', shortName.toUpperCase());
        _setText('statusbar-user', 'Analyst: ' + shortName.toUpperCase());
        _setText('profile-name', shortName);
    }

    // ── Data fetchers ──

    /**
     * Fetch user profile from Firestore users/{uid}.
     */
    async function _fetchProfile(uid) {
        try {
            var FS = window.firebaseFirestore;
            var docRef = FS.doc(_db, 'users', uid);
            var snap = await FS.getDoc(docRef);
            if (snap.exists()) {
                return snap.data();
            }
            return null;
        } catch (err) {
            console.warn('[TenantData] Profile fetch failed:', err.message);
            return null;
        }
    }

    /**
     * Fetch assignments via the getAssignments Cloud Function.
     * Discovers the first class in the tenant, then fetches assignments for it.
     */
    async function _fetchAssignments() {
        if (!_config || !_config.tenantId) return null;

        try {
            // Discover the first class under this tenant
            var classId = await _discoverClassId();
            if (!classId) {
                console.warn('[TenantData] No classes found for tenant');
                return null;
            }

            var fn = window.firebaseFunctions.httpsCallable(_functions, 'getAssignments');
            var result = await fn({
                tenantId: _config.tenantId,
                classId: classId
            });
            return result.data;
        } catch (err) {
            console.warn('[TenantData] getAssignments failed:', err.message);
            return null;
        }
    }

    /**
     * Discover the first class ID under this tenant.
     * Queries tenants/{tenantId}/classes (limit 1).
     */
    async function _discoverClassId() {
        try {
            var FS = window.firebaseFirestore;
            var classesRef = FS.collection(_db, 'tenants', _config.tenantId, 'classes');
            var q = FS.query(classesRef, FS.limit(1));
            var snap = await FS.getDocs(q);
            if (!snap.empty) {
                return snap.docs[0].id;
            }
            return null;
        } catch (err) {
            console.warn('[TenantData] Class discovery failed:', err.message);
            return null;
        }
    }

    // ── DOM update functions ──

    /**
     * Safely set textContent on an element by ID. No-op if element missing.
     */
    function _setText(id, text) {
        var el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    /**
     * Format a number with commas (e.g., 8240 -> "8,240").
     */
    function _formatNumber(n) {
        if (n === null || n === undefined) return '--';
        return Number(n).toLocaleString('en-US');
    }

    /**
     * Pad a number to 2 digits (e.g., 5 -> "05").
     */
    function _pad(n) {
        if (n === null || n === undefined) return '--';
        var num = Number(n);
        return num < 10 ? '0' + num : String(num);
    }

    /**
     * Update stat cards across all variants.
     * Stat IDs: stat-missions, stat-flags, stat-score, stat-rank
     * Enterprise uses: kpi-missions, kpi-flags, kpi-score, kpi-rank
     */
    function updateStats(profile, assignmentsResult) {
        var assignments = (assignmentsResult && assignmentsResult.assignments) || [];
        var activeMissions = assignments.filter(function(a) {
            var progress = a.progress || {};
            return progress.status !== 'completed';
        }).length;

        var flags = (profile && profile.ctfFlagsCaptured) || 0;
        var xp = (profile && profile.xp) || 0;

        // Active missions count
        _setText('stat-missions', _pad(activeMissions));
        _setText('kpi-missions', String(activeMissions));

        // Flags captured
        _setText('stat-flags', _pad(flags));
        _setText('kpi-flags', String(flags));

        // Score / XP
        _setText('stat-score', _formatNumber(xp));
        _setText('kpi-score', _formatNumber(xp));

        // Rank — will be updated by leaderboard fetch
        // Set placeholder for now
        _setText('stat-rank', '--');
        _setText('kpi-rank', '--');

        // Subtitle/delta elements (command-center variant)
        _setText('stat-missions-delta', activeMissions + ' active');
        _setText('stat-flags-delta', flags > 0 ? flags + ' captured' : 'capture your first flag');
        _setText('stat-score-delta', xp > 0 ? _formatNumber(xp) + ' XP earned' : 'complete missions to score');
        _setText('stat-rank-delta', 'rank pending');

        // Sub labels (clean-ops variant)
        _setText('stat-missions-sub', activeMissions > 0 ? activeMissions + ' active' : '');
        _setText('stat-flags-sub', flags > 0 ? '+' + flags : '');
        _setText('stat-score-sub', xp > 0 ? '+' + _formatNumber(xp) : '');
        _setText('stat-rank-sub', '');

        // Trend labels (enterprise variant)
        _setText('kpi-missions-trend', activeMissions > 0 ? activeMissions + ' active missions' : 'No missions assigned');
        _setText('kpi-flags-trend', flags > 0 ? flags + ' flags captured' : 'Start a mission to earn flags');
        _setText('kpi-score-trend', xp > 0 ? _formatNumber(xp) + ' XP total' : 'Complete missions to earn points');
        _setText('kpi-rank-trend', 'Analyst');

        // Progress bar widths (command-center variant)
        var barMissions = document.getElementById('stat-bar-missions');
        if (barMissions) barMissions.style.width = Math.min(activeMissions * 10, 100) + '%';
        var barFlags = document.getElementById('stat-bar-flags');
        if (barFlags) barFlags.style.width = Math.min(flags * 2, 100) + '%';
        var barScore = document.getElementById('stat-bar-score');
        if (barScore) barScore.style.width = Math.min(xp / 100, 100) + '%';

        // Count labels
        _setText('objective-count', activeMissions + ' ASSIGNED // ' +
            assignments.filter(function(a) { return a.progress && a.progress.status === 'in_progress'; }).length + ' IN PROGRESS');
        _setText('mission-count', assignments.length + ' assigned');
        _setText('mission-queue-meta', assignments.length + ' assigned / ' +
            assignments.filter(function(a) { return !a.progress || a.progress.status !== 'completed'; }).length + ' active');

        // Statusbar missions (command-center)
        _setText('statusbar-missions', activeMissions + ' ACTIVE');
    }

    /**
     * Render the mission queue with real assignment data.
     * Works across all variants by checking for multiple container IDs.
     */
    function updateMissionQueue(assignmentsResult) {
        var assignments = (assignmentsResult && assignmentsResult.assignments) || [];

        // ---- Tactical HUD variant: objective-queue ----
        var objectiveQueue = document.getElementById('objective-queue');
        if (objectiveQueue) {
            _renderObjectiveQueue(objectiveQueue, assignments);
        }

        // ---- Default / Clean-ops variant: mission-queue ----
        var missionQueue = document.getElementById('mission-queue');
        if (missionQueue) {
            _renderMissionQueue(missionQueue, assignments);
        }

        // ---- Command-center variant: mission-tbody (table rows) ----
        var missionTbody = document.getElementById('mission-tbody');
        if (missionTbody) {
            _renderMissionTable(missionTbody, assignments);
        }

        // ---- Enterprise variant: mission-tbody in table ----
        var missionTable = document.getElementById('mission-table');
        var missionEmpty = document.getElementById('mission-empty');
        if (missionTable) {
            if (assignments.length > 0) {
                missionTable.style.display = '';
                if (missionEmpty) missionEmpty.style.display = 'none';
                var tbody = missionTable.querySelector('tbody') || document.getElementById('mission-tbody');
                if (tbody) _renderEnterpriseTable(tbody, assignments);
            } else {
                missionTable.style.display = 'none';
                if (missionEmpty) missionEmpty.style.display = '';
            }
        }
    }

    /**
     * Render missions into the tactical-hud objective queue.
     */
    function _renderObjectiveQueue(container, assignments) {
        if (assignments.length === 0) {
            container.innerHTML = '<div class="vc-obj-empty" style="padding:20px;text-align:center;color:var(--vc-muted,#5a6a7a);font-size:0.8rem;">No missions assigned. Check back with your instructor.</div>';
            return;
        }
        container.innerHTML = '';
        assignments.forEach(function(a) {
            var status = _getStatusInfo(a);
            var row = document.createElement('a');
            row.className = 'vc-obj-row';
            row.href = _getContentHref(a);
            row.style.cssText = 'display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid rgba(255,255,255,0.05);text-decoration:none;color:inherit;cursor:pointer;';

            var dot = document.createElement('div');
            dot.style.cssText = 'width:8px;height:8px;border-radius:50%;flex-shrink:0;background:' + status.color + ';';

            var info = document.createElement('div');
            info.style.cssText = 'flex:1;min-width:0;';
            var title = document.createElement('div');
            title.style.cssText = 'font-size:0.82rem;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;';
            title.textContent = a.title || 'Untitled Mission';
            var meta = document.createElement('div');
            meta.style.cssText = 'font-size:0.7rem;color:var(--vc-muted,#5a6a7a);margin-top:2px;';
            meta.textContent = (a.contentType || 'mission').toUpperCase() + (a.points ? ' // ' + a.points + ' pts' : '');
            info.appendChild(title);
            info.appendChild(meta);

            var badge = document.createElement('span');
            badge.style.cssText = 'font-size:0.65rem;padding:2px 8px;border-radius:3px;font-weight:600;text-transform:uppercase;letter-spacing:0.04em;background:' + status.bg + ';color:' + status.color + ';white-space:nowrap;';
            badge.textContent = status.label;

            var due = document.createElement('span');
            due.style.cssText = 'font-size:0.7rem;color:var(--vc-muted,#5a6a7a);white-space:nowrap;';
            due.textContent = _formatDueDate(a.dueDate);

            row.appendChild(dot);
            row.appendChild(info);
            row.appendChild(badge);
            row.appendChild(due);
            container.appendChild(row);
        });
    }

    /**
     * Render missions into the default / clean-ops mission queue.
     */
    function _renderMissionQueue(container, assignments) {
        if (assignments.length === 0) {
            container.innerHTML = '<div class="soc-empty vb-empty" style="padding:40px 16px;text-align:center;color:var(--brand-text-secondary);font-size:0.85rem;">No missions assigned yet. Check back with your instructor.</div>';
            return;
        }
        container.innerHTML = '';
        assignments.forEach(function(a) {
            var status = _getStatusInfo(a);
            var row = document.createElement('a');
            row.className = 'mission-row';
            row.href = _getContentHref(a);

            var dot = document.createElement('div');
            dot.className = 'mission-severity';
            dot.style.background = status.color;

            var info = document.createElement('div');
            info.className = 'mission-info';
            var title = document.createElement('div');
            title.className = 'mission-title';
            title.textContent = a.title || 'Untitled Mission';
            var meta = document.createElement('div');
            meta.className = 'mission-meta';
            meta.textContent = (a.contentType || 'mission').toUpperCase() + (a.points ? ' // ' + a.points + ' pts' : '');
            info.appendChild(title);
            info.appendChild(meta);

            var dueEl = document.createElement('span');
            dueEl.className = 'mission-due';
            dueEl.textContent = _formatDueDate(a.dueDate);

            var badge = document.createElement('span');
            badge.className = 'mission-status';
            badge.style.cssText = 'background:' + status.bg + ';color:' + status.color + ';';
            badge.textContent = status.label;

            row.appendChild(dot);
            row.appendChild(info);
            row.appendChild(dueEl);
            row.appendChild(badge);
            container.appendChild(row);
        });
    }

    /**
     * Render missions into the command-center table body.
     */
    function _renderMissionTable(tbody, assignments) {
        if (assignments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5"><div style="padding:30px;text-align:center;color:#4a6070;font-size:0.8rem;">No missions assigned. Check back with your instructor.</div></td></tr>';
            return;
        }
        tbody.innerHTML = assignments.map(function(a) {
            var status = _getStatusInfo(a);
            var priorityClass = _getPriorityClass(a);
            return '<tr onclick="window.location.href=\'' + _escapeAttr(_getContentHref(a)) + '\'" style="cursor:pointer;">' +
                '<td><span class="va-priority ' + priorityClass + '">' + priorityClass.toUpperCase() + '</span></td>' +
                '<td>' +
                    '<div class="va-mission-name">' + _escapeHtml(a.title || 'Untitled') + '</div>' +
                    '<div class="va-mission-cat">' + _escapeHtml((a.contentType || 'mission').toUpperCase()) + (a.points ? ' // ' + a.points + ' pts' : '') + '</div>' +
                '</td>' +
                '<td style="color:#4a6070;font-size:0.72rem;">' + _escapeHtml((a.contentType || 'mission').toUpperCase()) + '</td>' +
                '<td><span class="va-status-badge" style="background:' + status.bg + ';color:' + status.color + ';">' + status.label + '</span></td>' +
                '<td class="va-time">' + _escapeHtml(_formatDueDate(a.dueDate)) + '</td>' +
                '</tr>';
        }).join('');
    }

    /**
     * Render missions into the enterprise table body.
     */
    function _renderEnterpriseTable(tbody, assignments) {
        tbody.innerHTML = assignments.map(function(a) {
            var status = _getStatusInfo(a);
            return '<tr onclick="window.location.href=\'' + _escapeAttr(_getContentHref(a)) + '\'" style="cursor:pointer;">' +
                '<td>' + _escapeHtml(a.title || 'Untitled') + '</td>' +
                '<td>' + _escapeHtml((a.contentType || 'mission').toUpperCase()) + '</td>' +
                '<td>' + _escapeHtml(_getPriorityClass(a).toUpperCase()) + '</td>' +
                '<td><span style="background:' + status.bg + ';color:' + status.color + ';padding:2px 8px;border-radius:3px;font-size:0.72rem;font-weight:600;">' + status.label + '</span></td>' +
                '<td>' + _escapeHtml(_formatDueDate(a.dueDate)) + '</td>' +
                '<td>' + (a.points || '--') + '</td>' +
                '</tr>';
        }).join('');
    }

    /**
     * Get status display info for an assignment.
     */
    function _getStatusInfo(assignment) {
        var progress = assignment.progress || {};
        var progressStatus = progress.status || 'not_started';

        // Check if overdue
        if (assignment.dueDate && progressStatus !== 'completed') {
            var due = new Date(assignment.dueDate);
            if (due < new Date()) {
                return { label: 'OVERDUE', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' };
            }
        }

        switch (progressStatus) {
            case 'completed':
                return { label: 'COMPLETED', color: '#22c55e', bg: 'rgba(34,197,94,0.15)' };
            case 'in_progress':
                return { label: 'IN PROGRESS', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' };
            case 'graded':
                return { label: 'GRADED', color: '#8b5cf6', bg: 'rgba(139,92,246,0.15)' };
            default:
                return { label: 'NOT STARTED', color: '#06b6d4', bg: 'rgba(6,182,212,0.15)' };
        }
    }

    /**
     * Get priority class for an assignment (for command-center table).
     */
    function _getPriorityClass(assignment) {
        if (assignment.dueDate) {
            var due = new Date(assignment.dueDate);
            var now = new Date();
            var hoursLeft = (due - now) / 3600000;
            if (hoursLeft < 0) return 'crit';
            if (hoursLeft < 24) return 'high';
            if (hoursLeft < 72) return 'med';
        }
        return 'low';
    }

    /**
     * Build a navigation href from assignment content info.
     */
    function _getContentHref(assignment) {
        var type = assignment.contentType || '';
        var id = assignment.contentId || '';

        switch (type) {
            case 'box':
                return '/arena/boxes/' + id + '/';
            case 'module':
            case 'presentation':
                // contentId for modules/presentations is typically the full path
                return id.startsWith('/') ? id : '/' + id;
            case 'quiz':
                return id.startsWith('/') ? id : '/' + id;
            case 'lab':
                return id.startsWith('/') ? id : '/' + id;
            default:
                return id || '#';
        }
    }

    /**
     * Format a due date string for display.
     */
    function _formatDueDate(dateStr) {
        if (!dateStr) return '--';
        try {
            var d = new Date(dateStr);
            if (isNaN(d.getTime())) return '--';
            var now = new Date();
            var diff = d - now;
            var days = Math.ceil(diff / 86400000);

            if (days < 0) return 'Overdue';
            if (days === 0) return 'Due today';
            if (days === 1) return 'Due tomorrow';
            if (days <= 7) return 'Due in ' + days + 'd';

            var month = d.toLocaleDateString('en-US', { month: 'short' });
            return month + ' ' + d.getDate();
        } catch (e) {
            return '--';
        }
    }

    /**
     * Escape HTML entities for safe insertion.
     */
    function _escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    /**
     * Escape for use in HTML attributes (href in onclick).
     */
    function _escapeAttr(str) {
        return _escapeHtml(str).replace(/'/g, "\\'");
    }

    /**
     * Update welcome text with the user's callsign or display name.
     */
    function _updateWelcome(profile, user) {
        var callsign = (profile && profile.callsign) || (user && user.displayName) || 'Analyst';

        // Tactical HUD — has welcome-tenant-span but welcome-title is the wrapper
        _setText('welcome-tenant-span', callsign.toUpperCase());

        // Default dashboard — "Welcome, {name}"
        var welcomeTitle = document.getElementById('welcome-title');
        if (welcomeTitle) {
            // Only update if it is the simple text pattern (not the HUD compound element)
            var spans = welcomeTitle.querySelectorAll('span');
            if (spans.length === 0) {
                welcomeTitle.textContent = 'Welcome, ' + callsign;
            }
        }

        // Command-center sidebar
        _setText('welcome-name', callsign.toUpperCase());
        _setText('welcome-role', 'ANALYST');

        // Enterprise profile
        _setText('profile-name', callsign);

        // Fireteam / dossier (tactical HUD)
        _setText('fireteam-you-name', callsign.toUpperCase());
        _setText('dossier-callsign', callsign.toUpperCase());

        // Rank display
        var rank = _calculateRankTitle(profile);
        _setText('rank-title', rank);
        _setText('rank-name', rank.toUpperCase());
        _setText('profile-tier', rank);
        _setText('kpi-rank-trend', rank);
    }

    /**
     * Calculate a rank title based on XP thresholds.
     */
    function _calculateRankTitle(profile) {
        var xp = (profile && profile.xp) || 0;
        if (xp >= 50000) return 'Director';
        if (xp >= 25000) return 'Senior Analyst';
        if (xp >= 10000) return 'Analyst III';
        if (xp >= 5000) return 'Analyst II';
        if (xp >= 1000) return 'Analyst I';
        if (xp >= 500) return 'Recruit II';
        return 'Recruit';
    }

    /**
     * Update XP progress bar if present.
     */
    function _updateXPBar(profile) {
        var xp = (profile && profile.xp) || 0;

        // Calculate progress to next rank tier
        var tiers = [0, 500, 1000, 5000, 10000, 25000, 50000];
        var currentTier = 0;
        var nextTier = 500;
        for (var i = 0; i < tiers.length - 1; i++) {
            if (xp >= tiers[i]) {
                currentTier = tiers[i];
                nextTier = tiers[i + 1];
            }
        }
        var pct = Math.min(((xp - currentTier) / (nextTier - currentTier)) * 100, 100);
        var pctStr = Math.round(pct) + '%';

        // Tactical HUD XP bar
        var xpFill = document.getElementById('xp-fill');
        if (xpFill) xpFill.style.width = pctStr;

        // Clean-ops rank bar
        var rankBar = document.getElementById('rank-bar');
        if (rankBar) rankBar.style.width = pctStr;
        _setText('rank-pct', pctStr);
        _setText('rank-pts', _formatNumber(xp) + ' pts');
        _setText('rank-next', 'Next: ' + _formatNumber(nextTier) + ' pts');
        _setText('rank-note', xp > 0 ? _formatNumber(nextTier - xp) + ' pts to next tier' : 'Complete missions to advance');

        // Enterprise progress bar
        var profileProgress = document.getElementById('profile-progress');
        if (profileProgress) profileProgress.style.width = pctStr;
        _setText('profile-progress-note', xp > 0 ? _formatNumber(xp) + ' / ' + _formatNumber(nextTier) + ' XP' : 'Complete missions to advance');

        // Command-center rank progress
        var rankProgress = document.getElementById('rank-progress');
        if (rankProgress) rankProgress.style.width = pctStr;
    }

    /**
     * Fetch and update leaderboard data.
     * Queries the class progress collection and ranks students by total score.
     */
    async function updateLeaderboard() {
        if (!_config || !_config.tenantId) return;

        try {
            var classId = await _discoverClassId();
            if (!classId) return;

            // Use getStudentProgress CF as admin, or read own rank from class progress
            var fn = window.firebaseFunctions.httpsCallable(_functions, 'getStudentProgress');
            var result = await fn({
                tenantId: _config.tenantId,
                classId: classId
            });

            var data = result.data;

            if (data.role === 'admin' && data.students) {
                // Admin view — rank all students
                _renderLeaderboardFromProgress(data.students);
            } else if (data.assignments) {
                // Student view — we know our own progress but not others
                // Calculate completed count as a proxy rank metric
                var completed = 0;
                var myAssignments = data.assignments || {};
                Object.keys(myAssignments).forEach(function(key) {
                    if (myAssignments[key].status === 'completed') completed++;
                });
                _setText('stat-rank', completed > 0 ? '#--' : '--');
                _setText('kpi-rank', completed > 0 ? '#--' : '--');
            }
        } catch (err) {
            console.warn('[TenantData] Leaderboard fetch failed:', err.message);
        }
    }

    /**
     * Render leaderboard from admin progress data.
     */
    function _renderLeaderboardFromProgress(students) {
        // Calculate completion scores for ranking
        var ranked = students.map(function(s) {
            var completed = 0;
            var total = 0;
            var totalScore = 0;
            var assignments = s.assignments || {};
            Object.keys(assignments).forEach(function(key) {
                total++;
                if (assignments[key].status === 'completed') completed++;
                totalScore += (assignments[key].score || 0);
            });
            return {
                uid: s.studentUid,
                completed: completed,
                total: total,
                score: totalScore
            };
        });

        // Sort by score descending, then completed count
        ranked.sort(function(a, b) {
            if (b.score !== a.score) return b.score - a.score;
            return b.completed - a.completed;
        });

        // Find current user's rank
        var currentUid = _auth && _auth.currentUser ? _auth.currentUser.uid : null;
        var myRank = '--';
        for (var i = 0; i < ranked.length; i++) {
            if (ranked[i].uid === currentUid) {
                myRank = '#' + String(i + 1).padStart(2, '0');
                break;
            }
        }

        _setText('stat-rank', myRank);
        _setText('kpi-rank', myRank);

        // Cohort summary (enterprise variant)
        _setText('cohort-total', String(ranked.length));
        if (ranked.length > 0) {
            var avgScore = ranked.reduce(function(sum, r) { return sum + r.score; }, 0) / ranked.length;
            _setText('cohort-avg', _formatNumber(Math.round(avgScore)));
        }
    }

    // ── Public API ──

    /**
     * Initialize TenantData.
     *
     * Call this from the dashboard loader AFTER the tenant config has been
     * fetched and stored. Expects the tenant config object as returned by
     * getTenantConfig.
     *
     * @param {Object} tenantConfig - Tenant config from getTenantConfig CF
     */
    async function init(tenantConfig) {
        if (_initialized) return;
        _initialized = true;
        _config = tenantConfig;

        try {
            await _loadSDK();
            _initFirebaseApp();

            // Wait for auth state to resolve
            var user = await _waitForAuthState();

            if (user && !user.isAnonymous) {
                // Already signed in with a real account
                await _onSignedIn();
            } else if (user && user.isAnonymous) {
                // Anonymous user — show sign-in button but still try to load data
                _showSignInUI();
                // Try loading data anyway (anonymous users may have limited access)
                try { await _onSignedIn(); } catch (e) { /* expected for anonymous */ }
            } else {
                // Not signed in — check if tenant allows anonymous
                var allowAnon = _config.auth && _config.auth.allowAnonymous;
                if (allowAnon) {
                    await window.firebaseAuth.signInAnonymously(_auth);
                    _showSignInUI();
                    try { await _onSignedIn(); } catch (e) { /* limited access */ }
                } else {
                    _showSignInUI();
                }
            }
        } catch (err) {
            console.error('[TenantData] Init failed:', err);
        }
    }

    /**
     * Get the current user profile.
     * @returns {Object|null}
     */
    function getProfile() {
        return _profile;
    }

    /**
     * Get assignments result (from last fetch).
     * @returns {Object|null}
     */
    function getAssignments() {
        return _assignments;
    }

    /**
     * Get the leaderboard progress data.
     * Re-fetches from the CF.
     * @returns {Promise<Object|null>}
     */
    async function getProgress() {
        if (!_config || !_config.tenantId) return null;
        try {
            var classId = await _discoverClassId();
            if (!classId) return null;
            var fn = window.firebaseFunctions.httpsCallable(_functions, 'getStudentProgress');
            var result = await fn({ tenantId: _config.tenantId, classId: classId });
            return result.data;
        } catch (err) {
            console.warn('[TenantData] getProgress failed:', err.message);
            return null;
        }
    }

    /**
     * Get leaderboard (calls getStudentProgress and formats).
     * @returns {Promise<Array>}
     */
    async function getLeaderboard() {
        var data = await getProgress();
        if (!data || !data.students) return [];
        return data.students;
    }

    return {
        init: init,
        getProfile: getProfile,
        getAssignments: getAssignments,
        getProgress: getProgress,
        getLeaderboard: getLeaderboard,
        updateStats: updateStats,
        updateMissionQueue: updateMissionQueue,
        updateLeaderboard: updateLeaderboard
    };

})();
