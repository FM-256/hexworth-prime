/**
 * Advanced Linux Administration — Course Content Map for Tenant Instructor Dashboard
 *
 * CTS4321C: Advanced Linux Administration (Matrix house).
 *
 * Used by _app/tenant/instructor.html via getActiveCourseMap() (keyed by courseId
 * "adv-linux") as the COMPLETION DENOMINATOR for:
 *   - Course Progress overlay (per-item completion rates)
 *   - Chapter Health donut + Class Report
 *   - Student Detail (per-week breakdown)
 *
 * Each item `id` is the EXACT string written to a student's tenant progress doc on
 * completion (verified 2026-06-14 against the live save calls in the adv-linux content
 * tree AND real captured progress in the summer-2026 ALA class):
 *   - presentations / lecture / reviews -> modulesCompleted[]
 *       (ModuleProgress.complete('matrix', id))
 *   - quizzes / exams                   -> quizScores{id}
 *       (ModuleProgress.completeQuiz('matrix', id, pct))
 *
 * Type convention: reviews and the lecture companion are typed "presentation" to match the
 * established map convention (python-for-it-map.js) and the dashboard typeColors/CSS badge
 * set — they all write to modulesCompleted and display identically; the review/refresher
 * distinction is carried by the chapter title and item titles, not a bespoke type string.
 *
 * LABS EXCLUDED ON PURPOSE: ala-l01..l12 and the in-class scavenger hunt are Arena/BoxEngine
 * boxes that save to users/{uid}/flag_captures — a different silo, NOT modulesCompleted or
 * labsCompleted. The dashboard compute (instructor.html:2650) counts only modulesCompleted /
 * quizScores / labsCompleted, so listing labs here would inflate the denominator and never
 * resolve. Labs are tracked via the flag_captures bridge (separate, write-path work).
 *
 * Created: 2026-06-14
 */
var ADV_LINUX_MAP = {
    courseId: "adv-linux",
    title: "Advanced Linux Administration (CTS4321C)",
    houseId: "matrix",
    totalChapters: 5,
    chapters: [
        {
            num: 1,
            title: "Foundations Refresher",
            items: [
                { id: "ala-r1", type: "presentation", title: "Refresher: Cell Navigation" },
                { id: "ala-r2", type: "presentation", title: "Refresher: Access Control" },
                { id: "ala-r3", type: "presentation", title: "Refresher: Process Authority" },
                { id: "ala-r4", type: "presentation", title: "Refresher: Grid Basics" },
                { id: "ala-r5", type: "presentation", title: "Refresher: Signal Processing" }
            ]
        },
        {
            num: 2,
            title: "Week 1 — CLI Operations & Networking",
            items: [
                { id: "ala-w1-cli",            type: "presentation", title: "CLI Operations" },
                { id: "ala-w1-systemd",        type: "presentation", title: "systemd Deep Dive" },
                { id: "ala-w1-network-config", type: "presentation", title: "Network Configuration" },
                { id: "ala-w1-network-diag",   type: "presentation", title: "Network Diagnostics" },
                { id: "ala-w1-lecture",        type: "presentation", title: "Week 1 Lecture Companion" },
                { id: "ala-w1-quiz",           type: "quiz",         title: "Week 1 Quiz" }
            ]
        },
        {
            num: 3,
            title: "Week 2 — Hardening & Package Management",
            items: [
                { id: "ala-w2-firewalls",      type: "presentation", title: "Firewalls" },
                { id: "ala-w2-authentication", type: "presentation", title: "Authentication Hardening" },
                { id: "ala-w2-antivirus",      type: "presentation", title: "Antivirus & Threat Scanning" },
                { id: "ala-w2-packages",       type: "presentation", title: "Package Management" },
                { id: "ala-w2-quiz",           type: "quiz",         title: "Week 2 Quiz" },
                { id: "ala-midterm",           type: "quiz",         title: "Midterm Exam" }
            ]
        },
        {
            num: 4,
            title: "Week 3 — DNS & Automation",
            items: [
                { id: "ala-w3-dns-fundamentals", type: "presentation", title: "DNS Fundamentals" },
                { id: "ala-w3-bind-deployment",  type: "presentation", title: "BIND Deployment" },
                { id: "ala-w3-bash-scripting",   type: "presentation", title: "Bash Scripting" },
                { id: "ala-w3-automation",       type: "presentation", title: "Automation & Scheduling" },
                { id: "ala-w3-quiz",             type: "quiz",         title: "Week 3 Quiz" }
            ]
        },
        {
            num: 5,
            title: "Week 4 — Integrity & Performance",
            items: [
                { id: "ala-w4-file-integrity", type: "presentation", title: "File Integrity Monitoring" },
                { id: "ala-w4-performance",    type: "presentation", title: "Performance Monitoring" },
                { id: "ala-w4-log-management", type: "presentation", title: "Log Management" },
                { id: "ala-w4-quiz",           type: "quiz",         title: "Week 4 Quiz" },
                { id: "ala-final",             type: "quiz",         title: "Final Exam" }
            ]
        }
    ]
};
