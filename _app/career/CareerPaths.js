/**
 * CareerPaths.js — Hexworth Prime canonical career-path vocabulary.
 *
 * The single controlled vocabulary that bridges the Projects/Signal catalog to careers
 * (P3 of the hub revamp). Project entries reference these `id`s in their `careerRoles[]`
 * field; the bridge renders "careers this prepares you for" (project -> path) and
 * "projects/mission-chain to get there" (path -> projects, via ProjectsData.getByCareerRole).
 *
 * Spans all 12 houses. Absorbs CareerExplorerEngine.js's 8 security domains (see `absorbs`)
 * so the security career content stays linked to one vocabulary instead of two.
 *
 * Usage:
 *   CareerPaths.get('ai-engineer')
 *   CareerPaths.getAll()
 *   CareerPaths.getByHouse('code')
 *   CareerPaths.getByGroup('Security')
 */
const CareerPaths = {

    version: '1.0.0',

    // Display groupings for the "Choose Your Career Path" entry experience.
    groups: ['Engineering & Development', 'Infrastructure & Operations', 'Security'],

    // Each path: { id, name, group, tagline, houses[], absorbs? (CareerExplorerEngine domain id),
    //             relatedPaths[] (adjacent paths for "also consider"), northStarCert (anchor cert) }
    // Note: seniority lives at the ROLE level inside the absorbed CareerExplorerEngine domains
    // (entry→executive); paths are seniority-agnostic destinations. P6's tier ladder maps to those.
    paths: [
        // ── Engineering & Development ──
        { id: 'software-developer',  name: 'Software Developer',   group: 'Engineering & Development', tagline: 'Design, build, and ship applications and services.',          houses: ['code', 'divergent'],     relatedPaths: ['appsec-engineer', 'devops-engineer'], northStarCert: 'AWS Certified Developer – Associate' },
        { id: 'ai-engineer',         name: 'AI Engineer',          group: 'Engineering & Development', tagline: 'Build AI/ML systems, agents, and the pipelines behind them.', houses: ['ai', 'matrix'],          relatedPaths: ['data-analyst', 'software-developer'], northStarCert: 'Azure AI Engineer Associate' },
        { id: 'data-analyst',        name: 'Data Analyst',         group: 'Engineering & Development', tagline: 'Turn raw data into insight, visualizations, and decisions.',  houses: ['matrix'],                relatedPaths: ['ai-engineer', 'soc-analyst'], northStarCert: 'Google Data Analytics Certificate' },
        { id: 'hardware-engineer',   name: 'Hardware Engineer',    group: 'Engineering & Development', tagline: 'Design and program embedded systems and physical hardware.',  houses: ['forge'],                 relatedPaths: ['sysadmin', 'network-engineer'], northStarCert: 'Arm Accredited Engineer' },

        // ── Infrastructure & Operations ──
        { id: 'cloud-engineer',      name: 'Cloud Engineer',       group: 'Infrastructure & Operations', tagline: 'Architect, deploy, and run cloud infrastructure.',          houses: ['cloud'],                 relatedPaths: ['cloud-security-engineer', 'devops-engineer'], northStarCert: 'AWS Certified Solutions Architect – Associate' },
        { id: 'devops-engineer',     name: 'DevOps Engineer',      group: 'Infrastructure & Operations', tagline: 'Automate build, test, deploy, and operations end to end.',  houses: ['script', 'code', 'cloud'], relatedPaths: ['cloud-engineer', 'sysadmin'], northStarCert: 'Certified Kubernetes Administrator (CKA)' },
        { id: 'sysadmin',            name: 'Systems Administrator', group: 'Infrastructure & Operations', tagline: 'Stand up and maintain systems, servers, and labs.',        houses: ['forge', 'script', 'web', 'divergent'], relatedPaths: ['devops-engineer', 'network-engineer'], northStarCert: 'Red Hat Certified System Administrator (RHCSA)' },
        { id: 'network-engineer',    name: 'Network Engineer',     group: 'Infrastructure & Operations', tagline: 'Design, build, and troubleshoot networks.',                 houses: ['web'],                   relatedPaths: ['sysadmin', 'soc-analyst'], northStarCert: 'Cisco CCNA' },

        // ── Security (absorbs CareerExplorerEngine domains) ──
        { id: 'soc-analyst',             name: 'SOC Analyst',            group: 'Security', tagline: 'Detect, triage, and respond to security threats.',          houses: ['shield', 'eye'],        absorbs: 'soc',          relatedPaths: ['forensics-analyst', 'data-analyst'], northStarCert: 'CompTIA CySA+' },
        { id: 'penetration-tester',      name: 'Penetration Tester',     group: 'Security', tagline: 'Find and ethically exploit weaknesses before attackers do.', houses: ['dark-arts'],            absorbs: 'pentest',      relatedPaths: ['appsec-engineer', 'forensics-analyst'], northStarCert: 'OSCP' },
        { id: 'grc-analyst',             name: 'GRC Analyst',            group: 'Security', tagline: 'Govern risk, write policy, and prove compliance.',           houses: ['shield'],               absorbs: 'grc',          relatedPaths: ['security-architect', 'security-leadership'], northStarCert: 'CISA' },
        { id: 'cloud-security-engineer', name: 'Cloud Security Engineer',group: 'Security', tagline: 'Secure cloud environments, identities, and workloads.',       houses: ['cloud', 'shield'],      absorbs: 'cloudsec',     relatedPaths: ['cloud-engineer', 'security-architect'], northStarCert: 'AWS Certified Security – Specialty' },
        { id: 'forensics-analyst',       name: 'Forensics Analyst',      group: 'Security', tagline: 'Investigate incidents and recover digital evidence.',         houses: ['eye', 'dark-arts'],     absorbs: 'forensics',    relatedPaths: ['soc-analyst', 'penetration-tester'], northStarCert: 'GIAC GCFA' },
        { id: 'security-architect',      name: 'Security Architect',     group: 'Security', tagline: 'Design systems that are secure by construction.',             houses: ['shield', 'code', 'key'],absorbs: 'architecture', relatedPaths: ['appsec-engineer', 'cloud-security-engineer'], northStarCert: 'CISSP' },
        { id: 'appsec-engineer',         name: 'Application Security Engineer', group: 'Security', tagline: 'Secure software across the development lifecycle.',     houses: ['code', 'shield', 'key'],absorbs: 'appsec',       relatedPaths: ['software-developer', 'security-architect'], northStarCert: 'CSSLP' },
        { id: 'security-leadership',     name: 'Security Leadership',    group: 'Security', tagline: 'Lead security teams and own risk from team lead to CISO.',     houses: ['shield'],               absorbs: 'management',   relatedPaths: ['grc-analyst', 'security-architect'], northStarCert: 'CISM' }
    ],

    /** Get a career path by id. */
    get(id) {
        return this.paths.find(p => p.id === id) || null;
    },

    /** All career paths. */
    getAll() {
        return this.paths;
    },

    /** Career paths that draw on a given house. */
    getByHouse(houseId) {
        return this.paths.filter(p => p.houses.includes(houseId));
    },

    /** Career paths in a display group. */
    getByGroup(group) {
        return this.paths.filter(p => p.group === group);
    },

    /** Valid path ids — used to validate ProjectsData.careerRoles references. */
    ids() {
        return this.paths.map(p => p.id);
    }
};

// Browser global (loaded via <script>, accessed from other script blocks) + Node export for tooling.
if (typeof window !== 'undefined') { window.CareerPaths = CareerPaths; }
if (typeof module !== 'undefined' && module.exports) { module.exports = CareerPaths; }
