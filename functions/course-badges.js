/**
 * course-badges.js — SERVER-ISSUED course completion badges, and the record a slot release
 * can be driven from.
 *
 * WHY THIS SHAPE, and it is the third design after two were checked and discarded.
 *
 * Taskboard #275 needed a trustworthy answer to "has this student finished the course", so the
 * OpenStack slot they hold for life can go back to the pool. Operator policy, 2026-08-11: the
 * slot is released on course completion, and the student tears their own sandbox down as part
 * of finishing.
 *
 * DISCARDED 1, a Firestore trigger reading course progress. Completion is not stored anywhere.
 * CourseProgress.js COMPUTES it client-side from a component list, so a server trigger would
 * have to replicate the course model and would drift from the client on the first module added.
 *
 * DISCARDED 2, trusting a client "I finished" call. announceMilestone already accepts a
 * client-supplied course name, but it is a Discord notification, not a record. Anything a
 * client asserts is worth nothing as an authorisation to release infrastructure.
 *
 * WHAT ACTUALLY WORKS. awardMissionBadge re-grades each Observatory mission SERVER-SIDE against
 * bc1's service-key-gated /grade-for endpoint, and only a badgeEligible verdict writes
 * users/{uid}/server_awards/{badgeId}. That subcollection has no client write rule, so it is
 * Cloud-Function-only by default-deny: a tamper-evident proof, one per mission. Completion is
 * therefore COUNTABLE from evidence the server itself produced, with no new grading and no
 * client claim in the chain.
 *
 * ⚠ THE COUNT IS OVER DISTINCT MISSIONS, not documents. A re-award writes the same badgeId with
 * merge:true, so counting documents would be correct today and wrong the first time a badge id
 * is reused or a mission is renamed. Distinct mission slugs is the property that actually means
 * "eighteen different missions were passed".
 *
 * THE FULL CHAIN, all three hops now live: awardCourseBadge writes the badge, then relays
 * through bc1 (service key) to the bc2 claim service (bridge secret), which applies the
 * emptiness guard. Cloud Functions cannot reach bc2 directly because the claim service binds to
 * a tailscale address; bc1 can, and GCP can reach bc1, which is how awardMissionBadge already
 * calls /grade-for.
 *
 * ⚠ WHAT THIS RECYCLES, HONESTLY: only students who FINISH. Measured 2026-08-11, the pool was
 * 4 of 50 bound with 18.5 GB free RAM, and claim() checks RAM before slots, so neither
 * constraint was close to binding. A pool fills with people who START a course and stop, and
 * completion-triggered release never fires for them. Their slot stays bound, and if they left
 * servers running the emptiness guard correctly refuses forever. That case is unaddressed by
 * design, and the leak that actually threatened the pool (QC runs minting a uid per run) was
 * already closed separately by giving all 15 harnesses a FIXED QC identity.
 */
'use strict';

/**
 * Courses whose completion is provable from server-issued evidence.
 *
 * ⚠ ONLY ONE ENTRY, ON PURPOSE. I drafted five course badges (OpenStack, Forge, Linux Mastery,
 * Databases, Cell-Sigma) and then checked what each could actually prove. server_awards has
 * exactly one writer, awardMissionBadge, and it is called from one place, the Observatory. The
 * other four courses have grading of various kinds (flag_registry, quiz_keys, claim_service
 * verify) but nothing that records "this student finished". A badge for them would be
 * client-asserted, which is the thing discarded above. They belong here once their completion
 * is made server-provable, and not before: a completion badge that can be claimed is worse than
 * no badge, because a slot release would then be triggerable by a client.
 */
const COURSES = [
    {
        courseId: 'observatory-command-mastery',
        badgeId: 'obs_mission_18',          // already the terminal badge in ObservatoryBadges.js
        name: 'Command Master',
        requiresDistinctMissions: 18,
        /* Every server_awards doc today is an Observatory mission award, so an unfiltered count
           is correct right now. It is filtered anyway: the moment a second course starts using
           awardMissionBadge, an unfiltered count would hand Command Master to someone who never
           touched the Observatory. Left null until the mission slugs are known, which means the
           count stays unfiltered and this comment is the warning attached to that. */
        missionPrefix: null,
        sandboxCourse: true                  // holds an OpenStack pool slot; releasable on completion
    }
];

/**
 * Count distinct missions a uid has server-issued proof for.
 * Reads only; the caller decides what to do with the number.
 */
async function distinctMissionsPassed(db, uid, missionPrefix) {
    const snap = await db.collection(`users/${uid}/server_awards`).get();
    const missions = new Set();
    snap.forEach(d => {
        const m = (d.data() || {}).mission;
        if (typeof m !== 'string' || !m) return;
        if (missionPrefix && !m.startsWith(missionPrefix)) return;
        missions.add(m);
    });
    return { count: missions.size, missions: [...missions].sort() };
}

/**
 * Which courses this uid has now completed, and which of those are still unawarded.
 * Pure evaluation against server evidence: no writes, no client input.
 */
async function evaluate(db, uid) {
    const out = [];
    for (const c of COURSES) {
        const { count, missions } = await distinctMissionsPassed(db, uid, c.missionPrefix);
        const complete = count >= c.requiresDistinctMissions;
        const already = complete
            ? (await db.doc(`users/${uid}/server_awards/${c.badgeId}`).get()).exists
            : false;
        out.push({ ...c, count, missions, complete, alreadyAwarded: already });
    }
    return out;
}

module.exports = { COURSES, distinctMissionsPassed, evaluate };
