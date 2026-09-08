/**
 * ARCHIVED 2026-09-08: exports.announceAchievement and exports.announceMilestone,
 * removed from functions/index.js.
 *
 * WHY THEY WERE REMOVED
 * Both posted to the PUBLIC Discord announcements channel using CLIENT-SUPPLIED FREE TEXT, with no
 * verification that the thing being announced had ever been earned.
 *   announceAchievement took { achievementName, achievementDesc, rarity } and interpolated the name
 *     and description straight into the embed. Gated only on rarity being one of three strings the
 *     CALLER supplies.
 *   announceMilestone took { type, name, score } with NO gate at all beyond the opt-in, and no
 *     proof lookup of any kind. Strictly worse.
 * Both required the caller to have linked Discord and opted in to milestone announcements, so the
 * reachable population was narrow, but within it a single account could post arbitrary text to a
 * community channel under the platform's branding, repeatedly, with no rate limit.
 *
 * BOTH HAD ZERO CALLERS in _app (verified by grep). Dead from the UI, live as callables.
 *
 * WHY RETIRED RATHER THAN HARDENED. The proposed fix was to invert the contract: accept only a
 * badgeId, look it up in users/{uid}/server_awards, and announce the SERVER-STORED name so no client
 * text reaches Discord. An adversarial review pointed out that (a) this is the same shape as
 * updateStreak, which was retired the same day under BUG-237b for having zero callers, and (b)
 * announceMilestone cannot be proof-gated even in principle, because it is designed around quiz and
 * course CLAIMS rather than badge PROOF. Hardening two dead callables is more surface than removing
 * them. Retiring also moots three unresolved problems the review raised: an unvalidated badgeId
 * becoming a Firestore path segment, `rarity` having no server-side home (no server_awards document
 * carries that field; rarity is a client-side UI derivation from points), and the fact that
 * proof-gating stops FALSE content but not SPAM of true content, since nothing marks a badge as
 * already announced.
 *
 * SCOPE NOTE WORTH KEEPING: announceAchievement was found first and announceMilestone only during
 * review of the fix for it. Shipping one and calling the class closed would have left the identical
 * primitive live one function away.
 *
 * NO SECRETS ARE IN THIS FILE: it is handler source only. It references DISCORD_BOT_TOKEN and
 * ANNOUNCEMENTS_CHANNEL by NAME, never by value. (The updateStreak archive earlier the same day
 * nearly committed a live bot token and a bundled .env, because a DEPLOYED ARTIFACT carries its
 * runtime secrets. Source archives do not; artifact archives do. Scan before committing either.)
 *
 * TO RESTORE: paste back into functions/index.js and redeploy. Both reference only onCall,
 * cfOptions, HttpsError, db, fetch, DISCORD_BOT_TOKEN and ANNOUNCEMENTS_CHANNEL, all of which still
 * exist. Restoring re-opens the hole above; harden first if you do.
 *
 * See taskboard 369 and 371, and BUG-237b for the updateStreak precedent.
 */

// ── announceMilestone ──────────────────────────────────────────
exports.announceMilestone = onCall(cfOptions, async (request) => {
    if (!request.auth) {
        throw new HttpsError('unauthenticated', 'Must be signed in.');
    }

    const uid = request.auth.uid;
    const { type, name, score } = request.data || {};
    // type: 'quiz_ace' (90%+), 'course_complete', 'certification_ready'

    if (!type || !name) return { announced: false };

    // Check if user has a linked Discord account with announcements enabled
    const userDoc = await db.doc(`users/${uid}`).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const discordId = userData.discordId;

    if (!discordId) return { announced: false, reason: 'no_discord' };

    const linkDoc = await db.collection('discord_links').doc(discordId).get();
    if (!linkDoc.exists || !linkDoc.data().milestoneAnnouncements) {
        return { announced: false, reason: 'opted_out' };
    }

    const discordUsername = linkDoc.data().discordUsername || 'An operator';

    let embed;
    if (type === 'quiz_ace') {
        embed = {
            title: 'Quiz Ace!',
            description: `**${discordUsername}** scored **${score}%** on **${name}**`,
            color: 16766720,
            footer: { text: 'Hexworth Prime // Achievement' },
            timestamp: new Date().toISOString()
        };
    } else if (type === 'course_complete') {
        embed = {
            title: 'Course Completed!',
            description: `**${discordUsername}** has completed **${name}**`,
            color: 3066993,
            footer: { text: 'Hexworth Prime // Milestone' },
            timestamp: new Date().toISOString()
        };
    } else if (type === 'certification_ready') {
        embed = {
            title: 'Certification Ready!',
            description: `**${discordUsername}** has completed all objectives for **${name}**`,
            color: 15844367,
            footer: { text: 'Hexworth Prime // Certification Path' },
            timestamp: new Date().toISOString()
        };
    } else {
        return { announced: false, reason: 'unknown_type' };
    }

    try {
        await fetch(`https://discord.com/api/v10/channels/${ANNOUNCEMENTS_CHANNEL}/messages`, {
            method: 'POST',
            headers: { 'Authorization': 'Bot ' + DISCORD_BOT_TOKEN, 'Content-Type': 'application/json' },
            body: JSON.stringify({ embeds: [embed] })
        });
        return { announced: true };
    } catch (err) {
        console.error('[Wire] Milestone announcement failed:', err.message);
        return { announced: false, reason: 'discord_error' };
    }
});

// ── announceAchievement ────────────────────────────────────────
exports.announceAchievement = onCall(cfOptions, async (request) => {
    if (!request.auth) return { announced: false };

    const uid = request.auth.uid;
    const { achievementName, achievementDesc, rarity } = request.data || {};
    if (!achievementName) return { announced: false };

    // Only announce rare achievements
    if (rarity !== 'rare' && rarity !== 'epic' && rarity !== 'legendary') {
        return { announced: false, reason: 'common_achievement' };
    }

    const userDoc = await db.doc(`users/${uid}`).get();
    const userData = userDoc.exists ? userDoc.data() : {};
    const discordId = userData.discordId;
    if (!discordId) return { announced: false, reason: 'no_discord' };

    const linkDoc = await db.collection('discord_links').doc(discordId).get();
    if (!linkDoc.exists || !linkDoc.data().milestoneAnnouncements) {
        return { announced: false, reason: 'opted_out' };
    }

    const rarityColors = { 'rare': 3447003, 'epic': 10038562, 'legendary': 16766720 };
    const discordUsername = linkDoc.data().discordUsername || 'An operator';

    try {
        await fetch(`https://discord.com/api/v10/channels/${ANNOUNCEMENTS_CHANNEL}/messages`, {
            method: 'POST',
            headers: { 'Authorization': 'Bot ' + DISCORD_BOT_TOKEN, 'Content-Type': 'application/json' },
            body: JSON.stringify({
                embeds: [{
                    title: rarity.toUpperCase() + ' Achievement Unlocked!',
                    description: '**' + discordUsername + '** earned **' + achievementName + '**\n' + (achievementDesc || ''),
                    color: rarityColors[rarity] || 433476,
                    footer: { text: 'Hexworth Prime // Achievement' },
                    timestamp: new Date().toISOString()
                }]
            })
        });
        return { announced: true };
    } catch (err) {
        console.error('[Wire] Achievement announcement failed:', err.message);
        return { announced: false };
    }
});
