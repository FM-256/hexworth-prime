/*
 * RETIRED LEARNING PATHS -- cysa, cysa-plus  (archived 2026-07-28)
 *
 * Removed from _app/components/LearningPaths.js on the operator ruling
 * ("retire both, archive first") after a content verification. Kept verbatim so
 * either can be restored by pasting the block back into the paths object and
 * re-adding its PATH_HOUSE_MAP entry in _app/js/handler-dashboard.js.
 *
 * WHY RETIRED
 *   cysa      -- 32 modules, the eye-cysa chapter sequence. Verified: 100% of its
 *                modules are already presented by the canonical hub page at
 *                /houses/eye/cysa/index.html. Zero unique content; a second copy of
 *                a course students can already reach.
 *   cysa-plus -- 21 modules, a SOC-analyst track (SOC ops, CVSS, risk, incident
 *                response, NIST 800-86, evidence handling, compliance) drawn from the
 *                eye and shield houses. Shares ZERO modules with cysa. Its hub was
 *                already retired deliberately in commit 35fef0307 ("promote 2 dedicated
 *                cert courses to canonical, retire 2 thin stubs") -- removed from
 *                HubRegistry and firestore.rules, page meta-refreshed to the canonical
 *                course. This path definition was the leftover half of that decision.
 *
 * WHAT WAS NOT LOST: every one of cysa-plus's 21 module files stays reachable -- 12
 * through other path definitions (security-operations, security-plus, casp-plus, cse)
 * and 9 through ContentCatalog house browsing. What ends is the ordered cross-house
 * sequence, which is what "thin aggregate" referred to.
 *
 * The 'cysa' tag in _app/config/content-registry.js is a SEPARATE certification tag
 * read by terminal.html's cert filter. It does not reference these definitions and was
 * deliberately left in place.
 */

// -- cysa --
'cysa': {
            name: 'CompTIA CySA+',
            description: 'CS0-003 — SOC analyst curriculum: threat intelligence, vulnerability management, cloud security, IAM, security operations, incident response, forensics, risk management, compliance',
            icon: '/assets/images/icons/icon-detective.webp',
            color: '#a855f7',
            courseHref: 'houses/eye/cysa/index.html',
            modules: [
                { id: 'eye-cysa-ch01-pres', title: 'Ch 1: Today\'s Cybersecurity Analyst', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch01-analyst.presentation.html' },
                { id: 'eye-cysa-ch01-lab', title: 'Ch 1 Lab: Cybersecurity Analyst Foundations', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch01-analyst.lab.html' },
                { id: 'eye-cysa-ch02-pres', title: 'Ch 2: Using Threat Intelligence', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch02-threat-intel.presentation.html' },
                { id: 'eye-cysa-ch02-lab', title: 'Ch 2 Lab: Threat Intelligence Analysis', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch02-threat-intel.lab.html' },
                { id: 'eye-cysa-ch03-pres', title: 'Ch 3: Reconnaissance & Intelligence Gathering', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch03-recon.presentation.html' },
                { id: 'eye-cysa-ch03-lab', title: 'Ch 3 Lab: Reconnaissance Techniques', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch03-recon.lab.html' },
                { id: 'eye-cysa-ch04-pres', title: 'Ch 4: Vulnerability Management Program', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch04-vuln-mgmt.presentation.html' },
                { id: 'eye-cysa-ch04-lab', title: 'Ch 4 Lab: Vulnerability Management', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch04-vuln-mgmt.lab.html' },
                { id: 'eye-cysa-ch05-pres', title: 'Ch 5: Analyzing Vulnerability Scans', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch05-vuln-scans.presentation.html' },
                { id: 'eye-cysa-ch05-lab', title: 'Ch 5 Lab: Vulnerability Scan Analysis', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch05-vuln-scans.lab.html' },
                { id: 'eye-cysa-ch06-pres', title: 'Ch 6: Cloud Security', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch06-cloud.presentation.html' },
                { id: 'eye-cysa-ch06-lab', title: 'Ch 6 Lab: Cloud Security Controls', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch06-cloud.lab.html' },
                { id: 'eye-cysa-ch07-pres', title: 'Ch 7: Infrastructure Security & Controls', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch07-infra.presentation.html' },
                { id: 'eye-cysa-ch07-lab', title: 'Ch 7 Lab: Infrastructure Security', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch07-infra.lab.html' },
                { id: 'eye-cysa-ch08-pres', title: 'Ch 8: Identity & Access Management', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch08-iam.presentation.html' },
                { id: 'eye-cysa-ch08-lab', title: 'Ch 8 Lab: IAM Security', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch08-iam.lab.html' },
                { id: 'eye-cysa-ch09-pres', title: 'Ch 9: Software & Hardware Development Security', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch09-dev-security.presentation.html' },
                { id: 'eye-cysa-ch09-lab', title: 'Ch 9 Lab: Development Security', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch09-dev-security.lab.html' },
                { id: 'eye-cysa-ch10-pres', title: 'Ch 10: Security Operations & Monitoring', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch10-secops.presentation.html' },
                { id: 'eye-cysa-ch10-lab', title: 'Ch 10 Lab: Security Operations', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch10-secops.lab.html' },
                { id: 'eye-cysa-ch11-pres', title: 'Ch 11: Building an Incident Response Program', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch11-ir.presentation.html' },
                { id: 'eye-cysa-ch11-lab', title: 'Ch 11 Lab: Incident Response', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch11-ir.lab.html' },
                { id: 'eye-cysa-ch12-pres', title: 'Ch 12: Analyzing Indicators of Compromise', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch12-ioc.presentation.html' },
                { id: 'eye-cysa-ch12-lab', title: 'Ch 12 Lab: IOC Analysis', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch12-ioc.lab.html' },
                { id: 'eye-cysa-ch13-pres', title: 'Ch 13: Forensic Analysis & Techniques', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch13-forensics.presentation.html' },
                { id: 'eye-cysa-ch13-lab', title: 'Ch 13 Lab: Digital Forensics', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch13-forensics.lab.html' },
                { id: 'eye-cysa-ch14-pres', title: 'Ch 14: Containment, Eradication & Recovery', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch14-recovery.presentation.html' },
                { id: 'eye-cysa-ch14-lab', title: 'Ch 14 Lab: Incident Recovery', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch14-recovery.lab.html' },
                { id: 'eye-cysa-ch15-pres', title: 'Ch 15: Risk Management', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch15-risk.presentation.html' },
                { id: 'eye-cysa-ch15-lab', title: 'Ch 15 Lab: Risk Management', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch15-risk.lab.html' },
                { id: 'eye-cysa-ch16-pres', title: 'Ch 16: Policy & Compliance', type: 'presentation', href: 'houses/eye/cysa/presentations/eye-cysa-ch16-compliance.presentation.html' },
                { id: 'eye-cysa-ch16-lab', title: 'Ch 16 Lab: Policy & Compliance', type: 'lab', href: 'houses/eye/cysa/labs/eye-cysa-ch16-compliance.lab.html' }
            ]
        },

        // Windows Server Administration (AZ-800) — Cloud House

// -- cysa-plus --
'cysa-plus': {
            name: 'CompTIA CySA+ (CS0-003)',
            description: 'Security analyst certification prep covering threat detection, analysis, vulnerability management, incident response, and security operations',
            icon: '/assets/images/icons/icon-magnifier.webp',
            color: '#a855f7',
            courseHref: 'houses/eye/cysa/index.html',
            modules: [
                // Domain 1: Security Operations
                {
                    id: 'eye-soc-operations',
                    title: 'SOC Operations',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/eye/presentations/eye-soc-operations.presentation.html',
                    prerequisites: []
                },
                {
                    id: 'eye-soc-simulator',
                    title: 'SOC Simulator',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '45 min',
                    href: 'houses/eye/tools/eye-soc.tool.html',
                    prerequisites: ['eye-soc-operations']
                },
                {
                    id: 'cyberops-soc-overview',
                    title: 'SOC Overview',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/eye/applets/cyberops/eye-soc-overview.applet.html',
                    prerequisites: ['eye-soc-simulator']
                },
                {
                    id: 'cyberops-soc-metrics',
                    title: 'SOC Metrics',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/eye/applets/cyberops/eye-soc-metrics.applet.html',
                    prerequisites: ['cyberops-soc-overview']
                },
                {
                    id: 'eye-soc-quiz',
                    title: 'SOC Operations Quiz',
                    type: 'quiz',
                    difficulty: 'intermediate',
                    duration: '15 min',
                    href: 'houses/eye/quizzes/eye-soc.quiz.html',
                    prerequisites: ['cyberops-soc-metrics']
                },
                {
                    id: 'eye-soc-lab',
                    title: 'SOC Operations Lab',
                    type: 'lab',
                    difficulty: 'intermediate',
                    duration: '40 min',
                    href: 'houses/eye/labs/eye-soc.lab.html',
                    prerequisites: ['eye-soc-quiz']
                },
                // Domain 2: Vulnerability Management
                {
                    id: 'shield-risk-management',
                    title: 'Risk Management',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/applets/risk/risk_management/shield-risk-management.applet.html',
                    prerequisites: ['eye-soc-lab']
                },
                {
                    id: 'shield-risk-analysis',
                    title: 'Risk Analysis',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/shield/applets/risk/risk_analysis/shield-risk-analysis.applet.html',
                    prerequisites: ['shield-risk-management']
                },
                {
                    id: 'cyberops-risk-rating',
                    title: 'Risk Rating & CVSS',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/eye/applets/cyberops/eye-risk-rating.applet.html',
                    prerequisites: ['shield-risk-analysis']
                },
                {
                    id: 'cyberops-cvss-terminology',
                    title: 'CVSS Terminology',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/eye/applets/cyberops/eye-cvss-terminology.applet.html',
                    prerequisites: ['cyberops-risk-rating']
                },
                {
                    id: 'cyberops-attack-surface-vuln',
                    title: 'Attack Surface & Vulnerabilities',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '25 min',
                    href: 'houses/eye/applets/cyberops/eye-attack-surface-vuln.applet.html',
                    prerequisites: ['cyberops-cvss-terminology']
                },
                {
                    id: 'shield-cve-lookup',
                    title: 'CVE Lookup Tool',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/shield/tools/shield-cve-lookup.tool.html',
                    prerequisites: ['cyberops-attack-surface-vuln']
                },
                // Domain 3: Incident Response & Management
                {
                    id: 'shield-incident-sim',
                    title: 'Incident Response',
                    type: 'tool',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/tools/shield-incident-response.tool.html',
                    prerequisites: ['shield-cve-lookup']
                },
                {
                    id: 'cyberops-irp-elements',
                    title: 'Incident Response Plan Elements',
                    type: 'applet',
                    difficulty: 'intermediate',
                    duration: '20 min',
                    href: 'houses/eye/applets/cyberops/eye-irp-elements.applet.html',
                    prerequisites: ['shield-incident-sim']
                },
                {
                    id: 'shield-ir-forensics',
                    title: 'IR & Forensics Lab',
                    type: 'lab',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/shield/labs/shield-ir-forensics.lab.html',
                    prerequisites: ['cyberops-irp-elements']
                },
                {
                    id: 'cyberops-nist-800-86',
                    title: 'NIST 800-86 Forensics',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '20 min',
                    href: 'houses/eye/applets/cyberops/eye-nist-800-86.applet.html',
                    prerequisites: ['shield-ir-forensics']
                },
                {
                    id: 'cyberops-evidence-types',
                    title: 'Evidence Types',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '20 min',
                    href: 'houses/eye/applets/cyberops/eye-evidence-types.applet.html',
                    prerequisites: ['cyberops-nist-800-86']
                },
                // Domain 4: Reporting & Communication
                {
                    id: 'cse-06-monitoring',
                    title: 'Security Monitoring & Incident Response',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/presentations/shield-cse-06-security-monitoring-incident-response.presentation.html',
                    prerequisites: ['cyberops-evidence-types']
                },
                {
                    id: 'cse-07-risk',
                    title: 'Risk Assessment & Management',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/presentations/shield-cse-07-risk-assessment-management.presentation.html',
                    prerequisites: ['cse-06-monitoring']
                },
                {
                    id: 'cse-08-compliance',
                    title: 'Compliance & Governance',
                    type: 'presentation',
                    difficulty: 'intermediate',
                    duration: '30 min',
                    href: 'houses/shield/presentations/shield-cse-08-compliance-governance.presentation.html',
                    prerequisites: ['cse-07-risk']
                },
                {
                    id: 'shield-cysa-toolkit',
                    title: 'CySA+ Analyst Toolkit',
                    type: 'applet',
                    difficulty: 'advanced',
                    duration: '45 min',
                    href: 'houses/shield/applets/operations/shield-cysa-analyst-toolkit.applet.html',
                    prerequisites: ['cse-08-compliance']
                }
            ]
        },

        // CompTIA CASP+ CAS-004 — Shield House (Advanced)
