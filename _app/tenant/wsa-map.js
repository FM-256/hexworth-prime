/**
 * Windows Server Administration — Course Content Map for Tenant Instructor Dashboard
 *
 * CTS1328C (Cloud house). Used by _app/tenant/instructor.html via getActiveCourseMap()
 * (courseId "wsa") as the COMPLETION DENOMINATOR.
 *
 * One chapter per module (M01-M19); each module has 4 tracked components:
 *   presentation -> ${presId} (split: wsa-m##-pres, or cloud-wsa-m##-presentation for m05/06/10-13)
 *   GUI lab      -> cloud-wsa-m##-guilab
 *   PowerShell lab -> cloud-wsa-m##-pslab
 *   quiz         -> wsa-m##  (quizScores key)
 *
 * These ids are written to the class progress doc by (a) the backfill that recovers existing
 * progress from each student's localStorage mirror (wsa-course-progress) and (b) — once the
 * forward fix lands — the WSA pages themselves. Map ids and backfill ids are generated from a
 * single source (/tmp/wsa_idmap.js at build time) so they always match.
 *
 * Generated: 2026-06-15
 */
var WSA_MAP = {
    courseId: "wsa",
    title: "Windows Server Administration (CTS1328C)",
    houseId: "cloud",
    totalChapters: 19,
    chapters: [
        {
            num: 1,
            title: "M01 — Server Installation & Configuration",
            items: [
            { id: "wsa-m01-pres", type: "presentation", title: "Presentation" },
            { id: "cloud-wsa-m01-guilab", type: "lab", title: "GUI Lab" },
            { id: "cloud-wsa-m01-pslab", type: "lab", title: "PowerShell Lab" },
            { id: "wsa-m01", type: "quiz", title: "Quiz" }
            ]
        },
        {
            num: 2,
            title: "M02 — Active Directory Domain Services",
            items: [
            { id: "wsa-m02-pres", type: "presentation", title: "Presentation" },
            { id: "cloud-wsa-m02-guilab", type: "lab", title: "GUI Lab" },
            { id: "cloud-wsa-m02-pslab", type: "lab", title: "PowerShell Lab" },
            { id: "wsa-m02", type: "quiz", title: "Quiz" }
            ]
        },
        {
            num: 3,
            title: "M03 — Storage & File Systems",
            items: [
            { id: "wsa-m03-pres", type: "presentation", title: "Presentation" },
            { id: "cloud-wsa-m03-guilab", type: "lab", title: "GUI Lab" },
            { id: "cloud-wsa-m03-pslab", type: "lab", title: "PowerShell Lab" },
            { id: "wsa-m03", type: "quiz", title: "Quiz" }
            ]
        },
        {
            num: 4,
            title: "M04 — Hyper-V Virtualization",
            items: [
            { id: "wsa-m04-pres", type: "presentation", title: "Presentation" },
            { id: "cloud-wsa-m04-guilab", type: "lab", title: "GUI Lab" },
            { id: "cloud-wsa-m04-pslab", type: "lab", title: "PowerShell Lab" },
            { id: "wsa-m04", type: "quiz", title: "Quiz" }
            ]
        },
        {
            num: 5,
            title: "M05 — Docker Containers",
            items: [
            { id: "cloud-wsa-m05-presentation", type: "presentation", title: "Presentation" },
            { id: "cloud-wsa-m05-guilab", type: "lab", title: "GUI Lab" },
            { id: "cloud-wsa-m05-pslab", type: "lab", title: "PowerShell Lab" },
            { id: "wsa-m05", type: "quiz", title: "Quiz" }
            ]
        },
        {
            num: 6,
            title: "M06 — Failover Clustering",
            items: [
            { id: "cloud-wsa-m06-presentation", type: "presentation", title: "Presentation" },
            { id: "cloud-wsa-m06-guilab", type: "lab", title: "GUI Lab" },
            { id: "cloud-wsa-m06-pslab", type: "lab", title: "PowerShell Lab" },
            { id: "wsa-m06", type: "quiz", title: "Quiz" }
            ]
        },
        {
            num: 7,
            title: "M07 — Monitoring & Performance",
            items: [
            { id: "wsa-m07-pres", type: "presentation", title: "Presentation" },
            { id: "cloud-wsa-m07-guilab", type: "lab", title: "GUI Lab" },
            { id: "cloud-wsa-m07-pslab", type: "lab", title: "PowerShell Lab" },
            { id: "wsa-m07", type: "quiz", title: "Quiz" }
            ]
        },
        {
            num: 8,
            title: "M08 — DNS & Name Resolution",
            items: [
            { id: "wsa-m08-pres", type: "presentation", title: "Presentation" },
            { id: "cloud-wsa-m08-guilab", type: "lab", title: "GUI Lab" },
            { id: "cloud-wsa-m08-pslab", type: "lab", title: "PowerShell Lab" },
            { id: "wsa-m08", type: "quiz", title: "Quiz" }
            ]
        },
        {
            num: 9,
            title: "M09 — DHCP Services",
            items: [
            { id: "wsa-m09-pres", type: "presentation", title: "Presentation" },
            { id: "cloud-wsa-m09-guilab", type: "lab", title: "GUI Lab" },
            { id: "cloud-wsa-m09-pslab", type: "lab", title: "PowerShell Lab" },
            { id: "wsa-m09", type: "quiz", title: "Quiz" }
            ]
        },
        {
            num: 10,
            title: "M10 — Group Policy",
            items: [
            { id: "cloud-wsa-m10-presentation", type: "presentation", title: "Presentation" },
            { id: "cloud-wsa-m10-guilab", type: "lab", title: "GUI Lab" },
            { id: "cloud-wsa-m10-pslab", type: "lab", title: "PowerShell Lab" },
            { id: "wsa-m10", type: "quiz", title: "Quiz" }
            ]
        },
        {
            num: 11,
            title: "M11 — IIS & Web Services",
            items: [
            { id: "cloud-wsa-m11-presentation", type: "presentation", title: "Presentation" },
            { id: "cloud-wsa-m11-guilab", type: "lab", title: "GUI Lab" },
            { id: "cloud-wsa-m11-pslab", type: "lab", title: "PowerShell Lab" },
            { id: "wsa-m11", type: "quiz", title: "Quiz" }
            ]
        },
        {
            num: 12,
            title: "M12 — Remote Desktop Services",
            items: [
            { id: "cloud-wsa-m12-presentation", type: "presentation", title: "Presentation" },
            { id: "cloud-wsa-m12-guilab", type: "lab", title: "GUI Lab" },
            { id: "cloud-wsa-m12-pslab", type: "lab", title: "PowerShell Lab" },
            { id: "wsa-m12", type: "quiz", title: "Quiz" }
            ]
        },
        {
            num: 13,
            title: "M13 — Certificate Services (PKI)",
            items: [
            { id: "cloud-wsa-m13-presentation", type: "presentation", title: "Presentation" },
            { id: "cloud-wsa-m13-guilab", type: "lab", title: "GUI Lab" },
            { id: "cloud-wsa-m13-pslab", type: "lab", title: "PowerShell Lab" },
            { id: "wsa-m13", type: "quiz", title: "Quiz" }
            ]
        },
        {
            num: 14,
            title: "M14 — Advanced Networking",
            items: [
            { id: "wsa-m14-pres", type: "presentation", title: "Presentation" },
            { id: "cloud-wsa-m14-guilab", type: "lab", title: "GUI Lab" },
            { id: "cloud-wsa-m14-pslab", type: "lab", title: "PowerShell Lab" },
            { id: "wsa-m14", type: "quiz", title: "Quiz" }
            ]
        },
        {
            num: 15,
            title: "M15 — AD Sites & Replication",
            items: [
            { id: "wsa-m15-pres", type: "presentation", title: "Presentation" },
            { id: "cloud-wsa-m15-guilab", type: "lab", title: "GUI Lab" },
            { id: "cloud-wsa-m15-pslab", type: "lab", title: "PowerShell Lab" },
            { id: "wsa-m15", type: "quiz", title: "Quiz" }
            ]
        },
        {
            num: 16,
            title: "M16 — Backup & Disaster Recovery",
            items: [
            { id: "wsa-m16-pres", type: "presentation", title: "Presentation" },
            { id: "cloud-wsa-m16-guilab", type: "lab", title: "GUI Lab" },
            { id: "cloud-wsa-m16-pslab", type: "lab", title: "PowerShell Lab" },
            { id: "wsa-m16", type: "quiz", title: "Quiz" }
            ]
        },
        {
            num: 17,
            title: "M17 — Windows Firewall & Security",
            items: [
            { id: "wsa-m17-pres", type: "presentation", title: "Presentation" },
            { id: "cloud-wsa-m17-guilab", type: "lab", title: "GUI Lab" },
            { id: "cloud-wsa-m17-pslab", type: "lab", title: "PowerShell Lab" },
            { id: "wsa-m17", type: "quiz", title: "Quiz" }
            ]
        },
        {
            num: 18,
            title: "M18 — PowerShell Automation",
            items: [
            { id: "wsa-m18-pres", type: "presentation", title: "Presentation" },
            { id: "cloud-wsa-m18-guilab", type: "lab", title: "GUI Lab" },
            { id: "cloud-wsa-m18-pslab", type: "lab", title: "PowerShell Lab" },
            { id: "wsa-m18", type: "quiz", title: "Quiz" }
            ]
        },
        {
            num: 19,
            title: "M19 — Troubleshooting & Migration",
            items: [
            { id: "wsa-m19-pres", type: "presentation", title: "Presentation" },
            { id: "cloud-wsa-m19-guilab", type: "lab", title: "GUI Lab" },
            { id: "cloud-wsa-m19-pslab", type: "lab", title: "PowerShell Lab" },
            { id: "wsa-m19", type: "quiz", title: "Quiz" }
            ]
        }
    ]
};
