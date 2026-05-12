/**
 * Principles of Information Security (CIS2350C) — Course Content Map for Tenant Instructor Dashboard
 *
 * Used by the instructor dashboard for:
 *   - Course Progress overlay (per-item completion rates)
 *   - Class Report (chapter heatmap, quiz performance)
 *   - Student Detail (per-week breakdown)
 *
 * Auto-generated from hub HTML 2026-05-12. Edit either the hub wkN array
 * or this file to keep them in sync — they're independent registries today.
 * (See HubRegistry task for the future central-source plan.)
 */
var INFOSEC_MAP = {
    courseId: "infosec",
    title: "Principles of Information Security \u2014 CIS2350C",
    houseId: "shield",
    totalChapters: 5,
    chapters: [
        {
            num: 0,
            title: "Refresher Modules",
            items: [
                { id: "pis-r1"                                , type: "presentation"  , title: "Facility Overview" },
                { id: "pis-r2"                                , type: "presentation"  , title: "Threat Landscape Briefing" },
                { id: "pis-r3"                                , type: "presentation"  , title: "Network Foundations" },
                { id: "pis-r4"                                , type: "presentation"  , title: "Operating System Foundations" },
                { id: "pis-r5"                                , type: "presentation"  , title: "Security Mindset" }
            ]
        },
        {
            num: 1,
            title: "Week 1 \u2014 Foundations (CIA, Threats, Malware, SocEng, Controls)",
            items: [
                { id: "pis-w1-cia-triad"                      , type: "presentation"  , title: "CIA Triad and Security Fundamentals" },
                { id: "pis-w1-security-controls"              , type: "presentation"  , title: "Security Controls" },
                { id: "pis-w1-threat-actors"                  , type: "presentation"  , title: "Threat Actors and Vectors" },
                { id: "pis-w1-social-engineering"             , type: "presentation"  , title: "Social Engineering" },
                { id: "pis-w1-malware"                        , type: "presentation"  , title: "Malware Taxonomy" },
                { id: "pis-l01"                               , type: "lab"           , title: "Specimen Classification" },
                { id: "pis-l02"                               , type: "lab"           , title: "Human Vector Drill" },
                { id: "pis-l03"                               , type: "lab"           , title: "Outbreak Intelligence" },
                { id: "pis-w1-quiz"                           , type: "quiz"          , title: "Week 1 Quiz" },
                { id: "pis-w1-lecture"                        , type: "presentation"  , title: "Week 1 Lecture: Foundations" }
            ]
        },
        {
            num: 2,
            title: "Week 2 \u2014 Attacks, Devices, Cryptography + Midterm",
            items: [
                { id: "pis-w2-app-attacks"                    , type: "presentation"  , title: "Application Attacks" },
                { id: "pis-w2-network-attacks"                , type: "presentation"  , title: "Network-Based Attacks" },
                { id: "pis-w2-device-security"                , type: "presentation"  , title: "Device Security" },
                { id: "pis-w2-cryptography"                   , type: "presentation"  , title: "Cryptography Fundamentals" },
                { id: "pis-l04"                               , type: "lab"           , title: "Injection Vector" },
                { id: "pis-l05"                               , type: "lab"           , title: "Field Equipment Audit" },
                { id: "pis-l06"                               , type: "lab"           , title: "Vault Seal Operations" },
                { id: "pis-w2-quiz"                           , type: "quiz"          , title: "Week 2 Quiz" },
                { id: "pis-midterm"                           , type: "presentation"  , title: "pis-midterm" }
            ]
        },
        {
            num: 3,
            title: "Week 3 \u2014 Network Defense, PKI, SecOps",
            items: [
                { id: "pis-w3-network-architecture"           , type: "presentation"  , title: "Network Security Architecture" },
                { id: "pis-w3-wireless-cloud"                 , type: "presentation"  , title: "Wireless and Cloud Security" },
                { id: "pis-w3-pki"                            , type: "presentation"  , title: "PKI and Certificate Management" },
                { id: "pis-w3-security-operations"            , type: "presentation"  , title: "Security Operations" },
                { id: "pis-l07"                               , type: "lab"           , title: "Lab Isolation Protocol" },
                { id: "pis-l08"                               , type: "lab"           , title: "Clearance Forge" },
                { id: "pis-l09"                               , type: "lab"           , title: "Outbreak Detection" },
                { id: "pis-w3-quiz"                           , type: "quiz"          , title: "Week 3 Quiz" }
            ]
        },
        {
            num: 4,
            title: "Week 4 \u2014 Auth, Identity, Risk, IR + Final",
            items: [
                { id: "pis-w4-authentication"                 , type: "presentation"  , title: "Authentication and Access Control" },
                { id: "pis-w4-identity-management"            , type: "presentation"  , title: "Identity and Account Management" },
                { id: "pis-w4-risk-governance"                , type: "presentation"  , title: "Risk Management and Governance" },
                { id: "pis-w4-incident-response"              , type: "presentation"  , title: "Incident Response and Recovery" },
                { id: "pis-l10"                               , type: "lab"           , title: "Dual-Integrity Access" },
                { id: "pis-l11"                               , type: "lab"           , title: "Containment Breach" },
                { id: "pis-l12"                               , type: "lab"           , title: "Full Facility Inspection: Capstone" },
                { id: "pis-w4-quiz"                           , type: "quiz"          , title: "Week 4 Quiz" },
                { id: "pis-final"                             , type: "presentation"  , title: "pis-final" }
            ]
        }
    ]
};
