/**
 * licensing.js — white-label licence checks.
 *
 * Extracted from index.js so it can be unit-tested without booting the Cloud Functions
 * bundle. index.js requires it; the behaviour is identical.
 *
 * THE MODEL. A tenant is white-label access: a branded wrapper over Hexworth. Its licence
 * says which courses it may teach. Ending a licence, ending a tenant's branding, and ending
 * a person's Hexworth access are three separate things — conflating the last two caused a
 * production outage on 2026-08-04, so nothing in this file touches user access.
 */

/**
 * Is `courseId` covered by this tenant's licence?
 *
 * WHERE THIS IS ENFORCED, AND WHY THERE. At the moment a class is CREATED (adminCreateClass),
 * with a second check at enrolment (enrollInClass) for classes that predate the flag. NOT on
 * a student's runtime path. Gating progress sync or grading would put the failure mid-lesson,
 * silently, on the person least able to act on it. Gating creation puts it on the admin
 * making the mistake, immediately. It also means no downstream writer needs its own guard:
 * if the unlicensed class never exists, nothing can write to it.
 *
 * WHAT THIS IS NOT. Not content protection. Courses are static HTML on Firebase Hosting with
 * no server in the request path, so a direct URL still resolves and quizzes still grade. The
 * honest claim is narrow: a tenant cannot be SET UP to teach a course it has not licensed.
 *
 * OPT-IN. Returns allowed:true unless `licensing.enforce === true`, so deploying this changes
 * nothing for a tenant that has not opted in. Rollback is removing one field from one
 * document — no redeploy.
 *
 * EMPTY LIST FAILS OPEN, DELIBERATELY. An opted-in tenant with no courses listed is a
 * misconfiguration. Denying everything would break a live class over a blank field — the
 * shape of the outage above. It is surfaced by `_tools/tenant/licence-preflight.js`, which
 * exits non-zero, rather than enforced here where it would be a log line nobody tails.
 *
 * @param {object} tenantData  the tenants/{slug} document data
 * @param {string} courseId    the course the class teaches
 * @returns {{allowed: boolean, enforced: boolean, reason: string, licensed: string[]}}
 */
function isCourseLicensed(tenantData, courseId) {
    const licensing = (tenantData && tenantData.licensing) || {};
    const contentAccess = licensing.contentAccess || {};
    const courses = Array.isArray(contentAccess.courses) ? contentAccess.courses : [];

    if (licensing.enforce !== true) {
        return { allowed: true, enforced: false, reason: 'enforcement not enabled', licensed: courses };
    }
    if (courses.length === 0) {
        return { allowed: true, enforced: true, reason: 'empty course list (fails open)', licensed: [] };
    }
    const allowed = courses.includes(courseId);
    return {
        allowed,
        enforced: true,
        reason: allowed ? 'licensed' : 'not in licensed courses',
        licensed: courses
    };
}

module.exports = { isCourseLicensed };
