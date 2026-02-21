/**
 * EduScan - Core System Smoke Tests
 *
 * Tests that interactive systems (XP, achievements, game tracking, access gating)
 * actually work by running them in a real browser environment.
 *
 * Issue Codes:
 *   FUNC-010: ProgressManager XP award
 *   FUNC-011: AchievementRegistry persistence
 *   FUNC-012: GameTracker record
 *   FUNC-013: AccessGuard blocks unauthorized
 *   FUNC-014: QuizEngine instantiation
 *   FUNC-015: Achievement v1/v2 bridge
 *   FUNC-016: ProgressManager level calculation
 *   FUNC-017: GameTracker top scores
 *   FUNC-020: SyncUtils scalar merge (local wins)
 *   FUNC-021: SyncUtils nested object recursion
 *   FUNC-022: SyncUtils array union dedup
 *   FUNC-023: SyncUtils restoreSyncBlob full simulation
 */

const path = require('path');

class SmokeTests {
    constructor(options = {}) {
        this.browserPool = options.browserPool;
        this.fixturesDir = options.fixturesDir || path.join(__dirname, '../../tests/fixtures');
        this.verbose = options.verbose || false;
    }

    /**
     * Run all smoke tests
     * @returns {Object} { issues, summary }
     */
    async run() {
        const issues = [];
        let passed = 0;
        let failed = 0;

        const tests = this._getTestDefinitions();

        for (const test of tests) {
            if (this.verbose) {
                console.log(`[SMOKE] Running: ${test.name}...`);
            }

            try {
                const result = await this._runTest(test);
                if (result.error) {
                    failed++;
                    issues.push({
                        code: test.code,
                        severity: test.severity,
                        message: `Smoke test failed: ${test.name} — ${result.error}`,
                        file: test.harness || 'smoke-harness.html',
                        fix: test.failMessage,
                        category: 'functional'
                    });
                    if (this.verbose) {
                        console.log(`[SMOKE]   FAIL: ${result.error}`);
                    }
                } else {
                    passed++;
                    if (this.verbose) {
                        console.log(`[SMOKE]   PASS`);
                    }
                }
            } catch (err) {
                failed++;
                issues.push({
                    code: test.code,
                    severity: test.severity,
                    message: `Smoke test crashed: ${test.name} — ${err.message}`,
                    file: test.harness || 'smoke-harness.html',
                    fix: test.failMessage,
                    category: 'functional'
                });
                if (this.verbose) {
                    console.log(`[SMOKE]   CRASH: ${err.message}`);
                }
            }
        }

        return {
            issues,
            summary: {
                total: tests.length,
                passed,
                failed
            }
        };
    }

    /**
     * Run a single smoke test
     * @param {Object} test - Test definition
     * @returns {Object} { error } - null if passed, string if failed
     */
    async _runTest(test) {
        const { page } = await this.browserPool.getPage();

        try {
            // Set up localStorage BEFORE page loads
            const harnessFile = test.harness || 'smoke-harness.html';
            const harnessPath = path.join(this.fixturesDir, harnessFile);
            const fileUrl = `file://${harnessPath}`;

            // evaluateOnNewDocument runs before any page script
            await page.evaluateOnNewDocument((setup) => {
                // Clear specified keys
                if (setup.clear) {
                    for (const key of setup.clear) {
                        localStorage.removeItem(key);
                    }
                }
                // Clear ALL localStorage if requested
                if (setup.clearAll) {
                    localStorage.clear();
                    sessionStorage.clear();
                }
                // Set specific keys
                if (setup.set) {
                    for (const [key, value] of Object.entries(setup.set)) {
                        if (value === null) {
                            localStorage.removeItem(key);
                        } else {
                            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
                        }
                    }
                }
            }, test.setup || {});

            // Navigate to harness
            await page.goto(fileUrl, { waitUntil: 'domcontentloaded' });

            // Wait for scripts to initialize (DOMContentLoaded handlers)
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Run the test assertion
            const error = await page.evaluate(test.test);

            return { error };

        } finally {
            await this.browserPool.releasePage(page);
        }
    }

    /**
     * Get all smoke test definitions
     * @returns {Array} Test definitions
     */
    _getTestDefinitions() {
        return [
            // FUNC-010: ProgressManager XP Award
            {
                code: 'FUNC-010',
                name: 'ProgressManager XP Award',
                severity: 'critical',
                setup: {
                    clear: ['hexworth_progress', 'hexworth_achievements', 'hexworth_achievements_v2'],
                    set: {
                        'hexworth_house': 'shield',
                        'hexworth_theme': 'shield'
                    }
                },
                test: `(() => {
                    try {
                        if (typeof ProgressManager === 'undefined') return 'ProgressManager not loaded';
                        ProgressManager.completeModule('smoke-test-mod', 'shield', 'quiz', { score: 90 });
                        const raw = localStorage.getItem('hexworth_progress');
                        if (!raw) return 'hexworth_progress not written to localStorage';
                        const p = JSON.parse(raw);
                        if (!p.xp || p.xp <= 0) return 'XP not awarded (xp=' + p.xp + ')';
                        // Check module recorded - may be string or object
                        if (!p.completedModules || !p.completedModules.some(m =>
                            (typeof m === 'string' ? m : (m && m.id)) === 'smoke-test-mod'
                        )) return 'Module not recorded in completedModules';
                        return null; // PASS
                    } catch (e) { return 'Exception: ' + e.message; }
                })()`,
                failMessage: 'ProgressManager.completeModule() failed to write XP to localStorage'
            },

            // FUNC-011: AchievementRegistry Persistence
            {
                code: 'FUNC-011',
                name: 'AchievementRegistry Persistence',
                severity: 'critical',
                setup: {
                    clear: ['hexworth_achievements_v2', 'hexworth_achievements'],
                    set: {
                        'hexworth_house': 'shield',
                        'hexworth_theme': 'shield'
                    }
                },
                test: `(() => {
                    try {
                        if (typeof AchievementRegistry === 'undefined') return 'AchievementRegistry not loaded';
                        const result = AchievementRegistry.unlock('first_visit');
                        // Check v2 storage
                        const v2Raw = localStorage.getItem('hexworth_achievements_v2');
                        if (!v2Raw) return 'hexworth_achievements_v2 not written';
                        const v2 = JSON.parse(v2Raw);
                        if (!v2.unlocked || !v2.unlocked['first_visit']) return 'first_visit not in v2 unlocked map';
                        // Check backward compat (old key)
                        const oldRaw = localStorage.getItem('hexworth_achievements');
                        if (!oldRaw) return 'hexworth_achievements not written (backward compat)';
                        const old = JSON.parse(oldRaw);
                        const oldIds = old.map(e => typeof e === 'string' ? e : (e && e.id || ''));
                        if (!oldIds.includes('first_visit')) return 'first_visit not in old achievements array';
                        return null; // PASS
                    } catch (e) { return 'Exception: ' + e.message; }
                })()`,
                failMessage: 'AchievementRegistry.unlock() failed to persist to v2 AND v1 storage'
            },

            // FUNC-012: GameTracker Record
            {
                code: 'FUNC-012',
                name: 'GameTracker Record',
                severity: 'critical',
                setup: {
                    clear: ['hexworth_game_tracker'],
                    set: {
                        'hexworth_house': 'shield',
                        'hexworth_theme': 'shield'
                    }
                },
                test: `(() => {
                    try {
                        if (typeof GameTracker === 'undefined') return 'GameTracker not loaded';
                        // 'domain' is a registered game ID
                        GameTracker.record('domain', { result: 'success', score: 500, timeElapsed: 60 });
                        const raw = localStorage.getItem('hexworth_game_tracker');
                        if (!raw) return 'hexworth_game_tracker not written';
                        const data = JSON.parse(raw);
                        if (!data['domain']) return 'domain game entry not created';
                        if (!data['domain'].plays || data['domain'].plays < 1) return 'plays not incremented';
                        if (!data['domain'].wins || data['domain'].wins < 1) return 'wins not incremented for success result';
                        return null; // PASS
                    } catch (e) { return 'Exception: ' + e.message; }
                })()`,
                failMessage: 'GameTracker.record() failed to save stats to localStorage'
            },

            // FUNC-013: AccessGuard Blocks Unauthorized
            {
                code: 'FUNC-013',
                name: 'AccessGuard Blocks Unauthorized',
                severity: 'high',
                harness: 'smoke-guard.html',
                setup: {
                    clearAll: true  // No house, no gates, no god mode
                },
                test: `(() => {
                    try {
                        // AccessGuard.require('house', 'shield') should have hidden content
                        // Check that the body is hidden (display:none or visibility:hidden via style tag)
                        const hideStyle = document.getElementById('access-guard-hide');
                        const preloadStyle = document.getElementById('access-guard-preload');
                        if (hideStyle || preloadStyle) return null; // PASS — content is hidden

                        // Also check computed style
                        const bodyDisplay = window.getComputedStyle(document.body).display;
                        const bodyVisibility = window.getComputedStyle(document.body).visibility;
                        if (bodyDisplay === 'none' || bodyVisibility === 'hidden') return null; // PASS

                        // Check if page was redirected (URL changed)
                        if (window.location.href.includes('sorting') || window.location.href.includes('unauthorized')) {
                            return null; // PASS — redirected away
                        }

                        // Content should NOT be visible
                        const text = document.body.innerText.trim();
                        if (text.includes('Protected Content Visible')) {
                            return 'AccessGuard did NOT hide content — protected text is visible without authorization';
                        }

                        return null; // Content hidden by some other mechanism
                    } catch (e) { return 'Exception: ' + e.message; }
                })()`,
                failMessage: 'AccessGuard.require() did not block unauthorized access'
            },

            // FUNC-014: QuizEngine Instantiation
            {
                code: 'FUNC-014',
                name: 'QuizEngine Instantiation',
                severity: 'high',
                setup: {
                    set: {
                        'hexworth_house': 'shield',
                        'hexworth_theme': 'shield'
                    }
                },
                test: `(() => {
                    try {
                        if (typeof QuizEngine === 'undefined') return 'QuizEngine not loaded';
                        const quiz = new QuizEngine({
                            containerId: 'harness',
                            questions: [{ question: 'Test?', options: ['A', 'B'], correct: 0 }],
                            moduleId: 'smoke-quiz',
                            trackProgress: false
                        });
                        if (!quiz) return 'QuizEngine constructor returned falsy';
                        return null; // PASS
                    } catch (e) { return 'Exception: ' + e.message; }
                })()`,
                failMessage: 'QuizEngine could not be instantiated without runtime errors'
            },

            // FUNC-015: Achievement v1/v2 Bridge
            {
                code: 'FUNC-015',
                name: 'Achievement v1/v2 Bridge',
                severity: 'high',
                setup: {
                    clear: ['hexworth_achievements_v2', 'hexworth_achievements'],
                    set: {
                        'hexworth_house': 'shield',
                        'hexworth_theme': 'shield',
                        // Pre-seed old format with a string ID
                        'hexworth_achievements': '["first_visit"]'
                    }
                },
                test: `(() => {
                    try {
                        if (typeof AchievementManager === 'undefined') return 'AchievementManager not loaded';
                        // unlock 'sorted' through Manager — should sync to Registry v2
                        AchievementManager.unlock('sorted');
                        // Check v2 has 'sorted'
                        const v2Raw = localStorage.getItem('hexworth_achievements_v2');
                        if (!v2Raw) return 'hexworth_achievements_v2 not created by bridge';
                        const v2 = JSON.parse(v2Raw);
                        if (!v2.unlocked || !v2.unlocked['sorted']) return 'sorted not synced to v2 storage';
                        return null; // PASS
                    } catch (e) { return 'Exception: ' + e.message; }
                })()`,
                failMessage: 'AchievementManager.unlock() did not sync to AchievementRegistry v2'
            },

            // FUNC-016: Level Calculation
            {
                code: 'FUNC-016',
                name: 'ProgressManager Level Calculation',
                severity: 'medium',
                setup: {
                    set: {
                        'hexworth_house': 'shield',
                        'hexworth_theme': 'shield'
                    }
                },
                test: `(() => {
                    try {
                        if (typeof ProgressManager === 'undefined') return 'ProgressManager not loaded';
                        // 1200 XP = Level 3 (threshold: 0, 500, 1200, ...)
                        const level = ProgressManager.calculateLevel(1500);
                        if (typeof level !== 'number') return 'calculateLevel did not return number';
                        if (level < 3) return 'calculateLevel(1500) returned ' + level + ', expected >= 3';
                        return null; // PASS
                    } catch (e) { return 'Exception: ' + e.message; }
                })()`,
                failMessage: 'ProgressManager.calculateLevel() returned incorrect level'
            },

            // FUNC-017: GameTracker Top Scores
            {
                code: 'FUNC-017',
                name: 'GameTracker Top Scores',
                severity: 'medium',
                setup: {
                    clear: ['hexworth_game_tracker'],
                    set: {
                        'hexworth_house': 'shield',
                        'hexworth_theme': 'shield'
                    }
                },
                test: `(() => {
                    try {
                        if (typeof GameTracker === 'undefined') return 'GameTracker not loaded';
                        // Record 5 games with different scores
                        GameTracker.record('domain', { result: 'success', score: 100, timeElapsed: 60 });
                        GameTracker.record('domain', { result: 'success', score: 500, timeElapsed: 50 });
                        GameTracker.record('domain', { result: 'success', score: 300, timeElapsed: 45 });
                        GameTracker.record('domain', { result: 'success', score: 800, timeElapsed: 30 });
                        GameTracker.record('domain', { result: 'success', score: 200, timeElapsed: 55 });
                        const top = GameTracker.getTopScores('domain');
                        if (!Array.isArray(top)) return 'getTopScores did not return array';
                        if (top.length > 3) return 'getTopScores returned ' + top.length + ' entries (expected max 3)';
                        if (top.length < 1) return 'getTopScores returned empty array';
                        // Check sorted descending
                        for (let i = 1; i < top.length; i++) {
                            if (top[i].score > top[i-1].score) {
                                return 'Scores not sorted descending: ' + top.map(s => s.score).join(', ');
                            }
                        }
                        // Highest should be 800
                        if (top[0].score !== 800) return 'Top score should be 800, got ' + top[0].score;
                        return null; // PASS
                    } catch (e) { return 'Exception: ' + e.message; }
                })()`,
                failMessage: 'GameTracker.getTopScores() did not return sorted top-3'
            },

            // ── Sync Merge Tests (smoke-sync.html) ──────────────────────

            // FUNC-020: Scalar merge — local wins
            {
                code: 'FUNC-020',
                name: 'SyncUtils Scalar Merge (local wins)',
                severity: 'critical',
                harness: 'smoke-sync.html',
                setup: {},
                test: `(() => {
                    try {
                        if (typeof SyncUtils === 'undefined') return 'SyncUtils not loaded';
                        // Local scalar should always win
                        const r1 = SyncUtils.deepMerge('cloud-val', 'local-val');
                        if (r1 !== 'local-val') return 'String: expected "local-val", got "' + r1 + '"';
                        const r2 = SyncUtils.deepMerge(100, 200);
                        if (r2 !== 200) return 'Number: expected 200, got ' + r2;
                        const r3 = SyncUtils.deepMerge(true, false);
                        if (r3 !== false) return 'Boolean: expected false, got ' + r3;
                        return null; // PASS
                    } catch (e) { return 'Exception: ' + e.message; }
                })()`,
                failMessage: 'SyncUtils.deepMerge() did not let local scalar win over cloud'
            },

            // FUNC-021: Nested object recursion — cloud keys preserved, local overwrites leaves
            {
                code: 'FUNC-021',
                name: 'SyncUtils Nested Object Merge',
                severity: 'critical',
                harness: 'smoke-sync.html',
                setup: {},
                test: `(() => {
                    try {
                        if (typeof SyncUtils === 'undefined') return 'SyncUtils not loaded';
                        const cloud = {
                            settings: { theme: 'dark', volume: 50 },
                            stats: { visits: 10 },
                            cloudOnly: 'preserved'
                        };
                        const local = {
                            settings: { theme: 'light', lang: 'en' },
                            stats: { visits: 15 },
                            localOnly: 'added'
                        };
                        const m = SyncUtils.deepMerge(cloud, local);

                        // Cloud-only key preserved
                        if (m.cloudOnly !== 'preserved') return 'Cloud-only key "cloudOnly" lost';
                        // Local-only key added
                        if (m.localOnly !== 'added') return 'Local-only key "localOnly" not added';
                        // Nested: local overwrites leaf
                        if (m.settings.theme !== 'light') return 'settings.theme should be "light" (local), got "' + m.settings.theme + '"';
                        // Nested: cloud leaf preserved when not in local
                        if (m.settings.volume !== 50) return 'settings.volume should be 50 (cloud), got ' + m.settings.volume;
                        // Nested: local-only nested key added
                        if (m.settings.lang !== 'en') return 'settings.lang should be "en" (local), got ' + m.settings.lang;
                        // Scalar merge in nested: local wins
                        if (m.stats.visits !== 15) return 'stats.visits should be 15 (local), got ' + m.stats.visits;
                        return null; // PASS
                    } catch (e) { return 'Exception: ' + e.message; }
                })()`,
                failMessage: 'SyncUtils.deepMerge() failed recursive object merge — shallow merge bug regression'
            },

            // FUNC-022: Array union — deduplication by JSON equality
            {
                code: 'FUNC-022',
                name: 'SyncUtils Array Union Dedup',
                severity: 'high',
                harness: 'smoke-sync.html',
                setup: {},
                test: `(() => {
                    try {
                        if (typeof SyncUtils === 'undefined') return 'SyncUtils not loaded';
                        // Simple strings
                        const r1 = SyncUtils.deepMerge(['a', 'b', 'c'], ['b', 'c', 'd']);
                        if (!Array.isArray(r1)) return 'String array: did not return array';
                        if (r1.length !== 4) return 'String array: expected 4 items, got ' + r1.length + ' (' + r1.join(',') + ')';
                        if (!r1.includes('a') || !r1.includes('d')) return 'String array: missing a or d';

                        // Object entries (achievements-style)
                        const cloud = [{ id: 'ach1', ts: 100 }, { id: 'ach2', ts: 200 }];
                        const local = [{ id: 'ach2', ts: 200 }, { id: 'ach3', ts: 300 }];
                        const r2 = SyncUtils.deepMerge(cloud, local);
                        if (!Array.isArray(r2)) return 'Object array: did not return array';
                        // local first + cloud unique: ach2, ach3, ach1
                        if (r2.length !== 3) return 'Object array: expected 3 items, got ' + r2.length;
                        const ids = r2.map(o => o.id);
                        if (!ids.includes('ach1') || !ids.includes('ach2') || !ids.includes('ach3'))
                            return 'Object array: missing one of ach1/ach2/ach3, got ' + ids.join(',');

                        // Duplicate detection: same object in both → no duplication
                        const dup = SyncUtils.deepMerge(['x'], ['x']);
                        if (dup.length !== 1) return 'Dup check: expected 1 item, got ' + dup.length;

                        return null; // PASS
                    } catch (e) { return 'Exception: ' + e.message; }
                })()`,
                failMessage: 'SyncUtils.deepMerge() array union/dedup logic is broken'
            },

            // FUNC-023: Full restoreSyncBlob simulation
            {
                code: 'FUNC-023',
                name: 'SyncUtils restoreSyncBlob Full Sim',
                severity: 'critical',
                harness: 'smoke-sync.html',
                setup: {},
                test: `(() => {
                    try {
                        if (typeof SyncUtils === 'undefined') return 'SyncUtils not loaded';
                        if (typeof SyncUtils.restoreSyncBlob !== 'function') return 'restoreSyncBlob not a function';

                        // Simulate cloud blob (JSON strings, like Firestore)
                        const cloudBlob = {
                            'hexworth_progress': JSON.stringify({ xp: 500, level: 2, completedModules: ['mod-a'] }),
                            'hexworth_achievements_v2': JSON.stringify({ unlocked: { first_visit: true, sorted: true } }),
                            'hexworth_settings': JSON.stringify({ theme: 'dark', volume: 80 }),
                            'cloud_only_key': JSON.stringify({ data: 'from-cloud' })
                        };

                        // Simulate local state (some keys present, some missing)
                        const localState = {
                            'hexworth_progress': JSON.stringify({ xp: 800, level: 3, completedModules: ['mod-a', 'mod-b'] }),
                            'hexworth_settings': JSON.stringify({ theme: 'light', lang: 'en' }),
                            'local_only_key': JSON.stringify({ data: 'from-local' })
                        };

                        const { merged, restored, mergedCount } = SyncUtils.restoreSyncBlob(cloudBlob, localState);

                        // 1. Missing key restored from cloud
                        if (!merged['cloud_only_key']) return 'cloud_only_key not restored from cloud';
                        if (restored < 1) return 'restored count should be >= 1, got ' + restored;

                        // 2. Existing key deep-merged
                        const prog = JSON.parse(merged['hexworth_progress']);
                        if (prog.xp !== 800) return 'progress.xp should be 800 (local), got ' + prog.xp;
                        if (!prog.completedModules.includes('mod-a') || !prog.completedModules.includes('mod-b'))
                            return 'progress.completedModules missing local modules';

                        // 3. Settings merged (cloud keys preserved, local overwrites)
                        const settings = JSON.parse(merged['hexworth_settings']);
                        if (settings.theme !== 'light') return 'settings.theme should be "light" (local), got ' + settings.theme;
                        if (settings.volume !== 80) return 'settings.volume should be 80 (cloud), got ' + settings.volume;
                        if (settings.lang !== 'en') return 'settings.lang should be "en" (local), got ' + settings.lang;

                        // 4. Local-only key untouched
                        if (!merged['local_only_key']) return 'local_only_key should be preserved';

                        // 5. Missing key (achievements) restored from cloud
                        if (!merged['hexworth_achievements_v2']) return 'achievements_v2 not restored from cloud';
                        if (restored < 2) return 'restored count should be >= 2, got ' + restored;

                        // 6. mergedCount reflects merged keys (progress + settings)
                        if (mergedCount < 2) return 'mergedCount should be >= 2, got ' + mergedCount;

                        return null; // PASS
                    } catch (e) { return 'Exception: ' + e.message; }
                })()`,
                failMessage: 'SyncUtils.restoreSyncBlob() failed — write-before-read or shallow merge regression'
            }
        ];
    }
}

module.exports = SmokeTests;
