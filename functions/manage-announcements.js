/**
 * manage-announcements.js — Cloud Function helpers for the announcement system.
 *
 * Firestore Schema: `announcements/{id}`
 * ─────────────────────────────────────────────────────────────────────
 * Field        Type              Required   Description
 * ─────────────────────────────────────────────────────────────────────
 * title        string            yes        Announcement title (max 120 chars)
 * body         string            yes        Body text, supports markdown-lite (max 2000 chars)
 * author       string            yes        Display name of creator
 * authorUid    string            yes        Firebase Auth UID of creator
 * priority     string            yes        One of: "urgent", "normal", "info"
 * houses       array<string>     no         House IDs this applies to (empty = global)
 * active       boolean           yes        Whether the announcement is visible
 * created      Timestamp         yes        Server-generated creation time
 * expires      Timestamp         no         Auto-hide after this time (null = never)
 * ─────────────────────────────────────────────────────────────────────
 *
 * Usage:
 *   These are standalone helper functions. Import and wire them into your
 *   Cloud Functions entry point (index.js) as needed:
 *
 *     const { createAnnouncement, cleanupExpired } = require('./manage-announcements');
 *     exports.createAnnouncement = createAnnouncement;
 *     exports.cleanupExpiredAnnouncements = cleanupExpired;
 *
 * Dependencies: firebase-admin, firebase-functions/v2
 */

const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { onSchedule } = require('firebase-functions/v2/scheduler');
const { getFirestore, FieldValue, Timestamp } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// ── Configuration ──

const VALID_PRIORITIES = ['urgent', 'normal', 'info'];
const VALID_HOUSES = ['eye', 'code', 'key', 'shield', 'script', 'forge', 'cloud'];
const MAX_TITLE_LENGTH = 120;
const MAX_BODY_LENGTH = 2000;

const ADMIN_EMAILS = require('./admin-emails'); // single source of truth — NOTE: adds jorden@ (was drifted); reviewed decision 2026-07-02

const CF_OPTIONS = { region: 'us-central1' };

// ── Helpers ──

/**
 * Verify the caller has admin privileges.
 * Checks custom claims first, then falls back to email allowlist.
 */
async function verifyAdmin(request) {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const uid = request.auth.uid;
    const email = (request.auth.token.email || '').toLowerCase();

    // Check custom claims
    if (request.auth.token.admin === true) return true;

    // Fallback: email allowlist
    if (ADMIN_EMAILS.includes(email)) return true;

    throw new HttpsError('permission-denied', 'Admin access required.');
}

/**
 * Validate announcement data fields.
 * Returns sanitized data or throws HttpsError.
 */
function validateAnnouncementData(data) {
    if (!data) {
        throw new HttpsError('invalid-argument', 'No data provided.');
    }

    // Title
    if (!data.title || typeof data.title !== 'string') {
        throw new HttpsError('invalid-argument', 'Title is required and must be a string.');
    }
    const title = data.title.trim();
    if (title.length === 0) {
        throw new HttpsError('invalid-argument', 'Title cannot be empty.');
    }
    if (title.length > MAX_TITLE_LENGTH) {
        throw new HttpsError('invalid-argument', `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`);
    }

    // Body
    if (!data.body || typeof data.body !== 'string') {
        throw new HttpsError('invalid-argument', 'Body is required and must be a string.');
    }
    const body = data.body.trim();
    if (body.length === 0) {
        throw new HttpsError('invalid-argument', 'Body cannot be empty.');
    }
    if (body.length > MAX_BODY_LENGTH) {
        throw new HttpsError('invalid-argument', `Body must be ${MAX_BODY_LENGTH} characters or fewer.`);
    }

    // Priority
    const priority = data.priority || 'normal';
    if (!VALID_PRIORITIES.includes(priority)) {
        throw new HttpsError('invalid-argument', `Priority must be one of: ${VALID_PRIORITIES.join(', ')}`);
    }

    // Houses
    let houses = [];
    if (data.houses && Array.isArray(data.houses)) {
        houses = data.houses.filter(h => VALID_HOUSES.includes(h));
    }

    // Expires
    let expires = null;
    if (data.expires) {
        const expiresDate = new Date(data.expires);
        if (isNaN(expiresDate.getTime())) {
            throw new HttpsError('invalid-argument', 'Invalid expires date.');
        }
        if (expiresDate.getTime() <= Date.now()) {
            throw new HttpsError('invalid-argument', 'Expires date must be in the future.');
        }
        expires = Timestamp.fromDate(expiresDate);
    }

    return { title, body, priority, houses, expires };
}

// ── Cloud Functions ──

/**
 * createAnnouncement — Callable function for admins to create announcements.
 *
 * Input: { title, body, priority?, houses?, expires? }
 * Returns: { id, message }
 */
const createAnnouncement = onCall(CF_OPTIONS, async (request) => {
    await verifyAdmin(request);

    const validated = validateAnnouncementData(request.data);
    const email = request.auth.token.email || '';
    const displayName = request.auth.token.name || email;

    const docData = {
        title: validated.title,
        body: validated.body,
        priority: validated.priority,
        houses: validated.houses,
        author: displayName,
        authorUid: request.auth.uid,
        active: true,
        created: FieldValue.serverTimestamp()
    };

    if (validated.expires) {
        docData.expires = validated.expires;
    }

    const db = getFirestore();
    const ref = await db.collection('announcements').add(docData);

    console.log(`[Announcements] Created "${validated.title}" (${ref.id}) by ${email}`);

    return { id: ref.id, message: 'Announcement created.' };
});

/**
 * cleanupExpired — Scheduled function to deactivate expired announcements.
 *
 * Runs on a cron schedule. Queries for active announcements with an
 * `expires` timestamp in the past and sets `active: false`.
 *
 * Wire into index.js with a schedule, e.g.:
 *   exports.cleanupExpiredAnnouncements = cleanupExpired;
 *
 * Default schedule: every day at 03:00 UTC.
 */
const cleanupExpired = onSchedule(
    { ...CF_OPTIONS, schedule: 'every day 03:00', timeZone: 'UTC' },
    async (event) => {
        const db = getFirestore();
        const now = Timestamp.now();

        const snapshot = await db.collection('announcements')
            .where('active', '==', true)
            .where('expires', '<=', now)
            .get();

        if (snapshot.empty) {
            console.log('[Announcements] No expired announcements to clean up.');
            return;
        }

        const batch = db.batch();
        let count = 0;

        snapshot.forEach(doc => {
            batch.update(doc.ref, { active: false });
            count++;
        });

        await batch.commit();
        console.log(`[Announcements] Deactivated ${count} expired announcement(s).`);
    }
);

module.exports = { createAnnouncement, cleanupExpired };
