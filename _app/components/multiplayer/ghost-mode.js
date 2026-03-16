/**
 * GhostMode.js - Asynchronous Multiplayer / Ghost Replay System
 *
 * Records a player's game session (inputs, scores, timestamps) and saves
 * it as a "ghost" in Firestore. Other players can race against the ghost
 * by replaying the recorded session in parallel.
 *
 * Usage:
 *   // Recording
 *   GhostMode.startRecording('threatswarm');
 *   GhostMode.recordFrame({ x: 100, y: 200, score: 50, action: 'fire' });
 *   const ghostId = await GhostMode.stopRecording({ finalScore: 1200 });
 *
 *   // Replaying
 *   const ghost = await GhostMode.loadGhost(ghostId);
 *   GhostMode.startReplay(ghost, (frame) => { renderGhostAt(frame); });
 *   GhostMode.stopReplay();
 *
 *   // Browse ghosts
 *   const ghosts = await GhostMode.getTopGhosts('threatswarm', 5);
 *
 * Sprint F-25: 2-Player Mode for Arcade Games
 */
const GhostMode = (function () {
    'use strict';

    // ── Constants ──────────────────────────────────────────────────────
    const COLLECTION = 'gameGhosts';
    const MAX_FRAMES = 18000;       // 5 min at 60fps
    const FRAME_SAMPLE_RATE = 3;    // Record every 3rd frame (20fps effective)
    const MAX_GHOSTS_PER_GAME = 50; // Cap stored ghosts per game

    // ── Recording State ───────────────────────────────────────────────
    let recording = false;
    let recordingGameId = null;
    let frames = [];
    let startTime = 0;
    let frameCounter = 0;

    // ── Replay State ──────────────────────────────────────────────────
    let replaying = false;
    let replayTimer = null;
    let replayIndex = 0;
    let replayFrames = [];
    let replayCallback = null;
    let replayStartTime = 0;

    // ── Firebase Helpers ──────────────────────────────────────────────

    function _getDb() {
        const { getFirestore } = window.firebaseFirestore;
        const { getApps } = window.firebaseApp;
        if (getApps().length === 0) throw new Error('[GhostMode] Firebase not initialized');
        return getFirestore(getApps()[0]);
    }

    function _fs() {
        return window.firebaseFirestore;
    }

    function _getUser() {
        if (typeof FirebaseAuth !== 'undefined' && FirebaseAuth.getUser) {
            const user = FirebaseAuth.getUser();
            if (user) return user;
        }
        return { uid: 'anon', displayName: 'Anonymous' };
    }

    // ── Recording API ─────────────────────────────────────────────────

    /**
     * Start recording a game session.
     * @param {string} gameId - Game identifier
     */
    function startRecording(gameId) {
        if (recording) stopRecording();

        recording = true;
        recordingGameId = gameId;
        frames = [];
        frameCounter = 0;
        startTime = performance.now();

        console.log('[GhostMode] Recording started for:', gameId);
    }

    /**
     * Record a single frame of game state.
     * Call this from your game loop.
     * @param {object} frameData - Serializable state snapshot
     */
    function recordFrame(frameData) {
        if (!recording) return;

        frameCounter++;

        // Sample at reduced rate to keep payload manageable
        if (frameCounter % FRAME_SAMPLE_RATE !== 0) return;
        if (frames.length >= MAX_FRAMES) return;

        frames.push({
            t: Math.round(performance.now() - startTime),
            d: frameData
        });
    }

    /**
     * Stop recording and optionally save to Firestore.
     * @param {object} [summary] - Final stats { finalScore, result, etc. }
     * @param {boolean} [save=true] - Whether to persist to Firestore
     * @returns {Promise<string|null>} Ghost document ID, or null if not saved
     */
    async function stopRecording(summary = {}, save = true) {
        if (!recording) return null;

        recording = false;
        const duration = Math.round(performance.now() - startTime);

        console.log(`[GhostMode] Recording stopped: ${frames.length} frames, ${duration}ms`);

        if (!save || frames.length === 0) {
            frames = [];
            return null;
        }

        const user = _getUser();
        const ghostData = {
            gameId: recordingGameId,
            playerUid: user.uid,
            playerName: user.displayName || 'Ghost',
            frames: frames,
            frameCount: frames.length,
            duration: duration,
            summary: summary,
            createdAt: Date.now()
        };

        try {
            const db = _getDb();
            const { collection, addDoc } = _fs();
            const docRef = await addDoc(collection(db, COLLECTION), ghostData);
            console.log('[GhostMode] Ghost saved:', docRef.id);
            frames = [];
            return docRef.id;
        } catch (e) {
            console.error('[GhostMode] Failed to save ghost:', e.message);
            frames = [];
            return null;
        }
    }

    // ── Replay API ────────────────────────────────────────────────────

    /**
     * Load a ghost recording from Firestore.
     * @param {string} ghostId - Document ID
     * @returns {Promise<object>} Ghost data
     */
    async function loadGhost(ghostId) {
        const db = _getDb();
        const { doc, getDoc } = _fs();

        const snap = await getDoc(doc(db, COLLECTION, ghostId));
        if (!snap.exists()) throw new Error('Ghost not found: ' + ghostId);

        return { id: snap.id, ...snap.data() };
    }

    /**
     * Get top ghost recordings for a game, sorted by score.
     * @param {string} gameId
     * @param {number} [limit=10]
     * @returns {Promise<Array>}
     */
    async function getTopGhosts(gameId, limit = 10) {
        const db = _getDb();
        const { collection, query, where, orderBy, limit: limitFn, getDocs } = _fs();

        const q = query(
            collection(db, COLLECTION),
            where('gameId', '==', gameId),
            orderBy('summary.finalScore', 'desc'),
            limitFn(limit)
        );

        const snap = await getDocs(q);
        const ghosts = [];
        snap.forEach(d => ghosts.push({ id: d.id, ...d.data() }));
        return ghosts;
    }

    /**
     * Start replaying a ghost recording.
     * Uses requestAnimationFrame for smooth playback synced to timestamps.
     *
     * @param {object} ghost - Ghost data from loadGhost()
     * @param {function} callback - Called each frame with frame data
     * @param {object} [options] - { speed: 1.0, onComplete: fn }
     */
    function startReplay(ghost, callback, options = {}) {
        if (replaying) stopReplay();
        if (!ghost || !ghost.frames || ghost.frames.length === 0) {
            console.warn('[GhostMode] No frames to replay');
            return;
        }

        replaying = true;
        replayFrames = ghost.frames;
        replayCallback = callback;
        replayIndex = 0;
        replayStartTime = performance.now();

        const speed = options.speed || 1.0;
        const onComplete = options.onComplete || function () {};

        function tick() {
            if (!replaying) return;

            const elapsed = (performance.now() - replayStartTime) * speed;

            // Advance through frames that should have played by now
            while (replayIndex < replayFrames.length &&
                   replayFrames[replayIndex].t <= elapsed) {
                try {
                    replayCallback(replayFrames[replayIndex].d, replayIndex, replayFrames.length);
                } catch (e) {
                    console.error('[GhostMode] Replay callback error:', e);
                }
                replayIndex++;
            }

            if (replayIndex >= replayFrames.length) {
                replaying = false;
                onComplete();
                console.log('[GhostMode] Replay complete');
                return;
            }

            replayTimer = requestAnimationFrame(tick);
        }

        replayTimer = requestAnimationFrame(tick);
        console.log('[GhostMode] Replay started:', replayFrames.length, 'frames');
    }

    /**
     * Stop the current replay.
     */
    function stopReplay() {
        replaying = false;
        if (replayTimer) {
            cancelAnimationFrame(replayTimer);
            replayTimer = null;
        }
        replayCallback = null;
        replayFrames = [];
        replayIndex = 0;
    }

    /**
     * Get current replay progress (0-1).
     */
    function getReplayProgress() {
        if (!replaying || replayFrames.length === 0) return 0;
        return replayIndex / replayFrames.length;
    }

    // ── Utility ───────────────────────────────────────────────────────

    /**
     * Delete a ghost recording.
     * @param {string} ghostId
     */
    async function deleteGhost(ghostId) {
        const db = _getDb();
        const { doc, deleteDoc } = _fs();
        await deleteDoc(doc(db, COLLECTION, ghostId));
    }

    /**
     * Get the current player's ghosts for a specific game.
     * @param {string} gameId
     * @returns {Promise<Array>}
     */
    async function getMyGhosts(gameId) {
        const db = _getDb();
        const user = _getUser();
        const { collection, query, where, orderBy, getDocs } = _fs();

        const q = query(
            collection(db, COLLECTION),
            where('gameId', '==', gameId),
            where('playerUid', '==', user.uid),
            orderBy('createdAt', 'desc')
        );

        const snap = await getDocs(q);
        const ghosts = [];
        snap.forEach(d => ghosts.push({ id: d.id, ...d.data() }));
        return ghosts;
    }

    // ── Public API ────────────────────────────────────────────────────

    return {
        // Recording
        startRecording,
        recordFrame,
        stopRecording,

        // Replay
        loadGhost,
        startReplay,
        stopReplay,
        getReplayProgress,

        // Browse
        getTopGhosts,
        getMyGhosts,
        deleteGhost,

        // State
        isRecording: function () { return recording; },
        isReplaying: function () { return replaying; }
    };

})();
