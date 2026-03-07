/**
 * EduScan Test Fixture — XP Pipeline Issues
 *
 * Triggers: XP-001, XP-002, XP-003, XP-004
 * PATH_OVERRIDE: components/xp-issues.js
 */

// XP-001: Duplicate rate constant (should only be in XPCalculator.js)
const XP_BY_TYPE = {
    module: 1000,
    lab: 500,
    quiz: 200
};

// XP-002: Hardcoded XP in FieldValue.increment()
async function awardXP(uid) {
    await db.doc(`users/${uid}`).update({
        xp: admin.firestore.FieldValue.increment(500)
    });
}

// XP-003: Quiz perfect threshold === 100 (should be >= 90)
function checkPerfectScore(score) {
    if (numScore === 100) {
        awardBonus();
    }
}

// XP-004: setUserProfile writing xp: without Math.max guard
function saveProgress(uid, newXP) {
    setUserProfile(uid, {
        xp: newXP,
        lastUpdated: Date.now()
    });
}
