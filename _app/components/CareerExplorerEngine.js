/**
 * CareerExplorerEngine.js — Cybersecurity Career Browser
 *
 * 4 tabs: Browse Roles | Career Paths | Certification Map | NICE Framework
 * Usage: CareerExplorerEngine.init()
 */
const CareerExplorerEngine = (() => {
    const ACCENT = '#a78bfa';
    const STORAGE_KEY = 'hexworth_career_explorer';

    const DOMAINS = [
        {
            id: 'soc', name: 'Security Operations (SOC)', icon: '🔍', color: '#3b82f6',
            description: 'Monitor, detect, and respond to security threats in real-time.',
            roles: [
                { title: 'SOC Analyst (Tier 1)', level: 'entry', salary: '$55K–$75K', description: 'Monitor SIEM alerts, triage security events, and escalate incidents. The front line of defense.', certs: ['CompTIA Security+', 'CompTIA CySA+', 'Splunk Core Certified User'], skills: ['SIEM operation', 'Log analysis', 'Ticketing systems', 'Basic networking'], dayInLife: 'Review overnight alerts, triage incoming events, update tickets, escalate suspicious patterns to Tier 2, document findings.' },
                { title: 'SOC Analyst (Tier 2)', level: 'mid', salary: '$75K–$100K', description: 'Deep-dive investigation of escalated incidents, threat hunting, and tuning detection rules.', certs: ['CompTIA CySA+', 'GCIA', 'Splunk Certified Power User'], skills: ['Threat hunting', 'Packet analysis', 'Malware triage', 'SIEM tuning'], dayInLife: 'Investigate escalated alerts, perform threat hunting, write detection rules, mentor Tier 1 analysts, participate in incident response.' },
                { title: 'SOC Manager', level: 'senior', salary: '$110K–$145K', description: 'Lead the SOC team, develop processes, manage metrics, and coordinate with stakeholders.', certs: ['CISSP', 'CISM', 'GSOM'], skills: ['Team leadership', 'Metrics/KPIs', 'Process development', 'Vendor management'], dayInLife: 'Review SOC metrics, conduct team standups, brief leadership on threats, coordinate with IR team, plan training exercises.' },
                { title: 'Director of Security Operations', level: 'executive', salary: '$160K–$220K', description: 'Strategic oversight of all security monitoring capabilities, budget, and organizational defense posture.', certs: ['CISSP', 'CISM', 'CRISC'], skills: ['Strategic planning', 'Budget management', 'Executive communication', 'Program development'], dayInLife: 'Executive briefings, budget planning, vendor evaluation, risk committee meetings, cross-functional security alignment.' }
            ]
        },
        {
            id: 'pentest', name: 'Penetration Testing', icon: '🎯', color: '#ef4444',
            description: 'Ethically hack systems to find vulnerabilities before malicious actors do.',
            roles: [
                { title: 'Junior Penetration Tester', level: 'entry', salary: '$60K–$80K', description: 'Assist with vulnerability assessments, run scanning tools, and document findings under guidance.', certs: ['CompTIA PenTest+', 'eJPT', 'CEH'], skills: ['Nmap', 'Burp Suite', 'Basic scripting', 'Report writing'], dayInLife: 'Run vulnerability scans, test web applications, attempt exploits in controlled environments, document findings.' },
                { title: 'Penetration Tester', level: 'mid', salary: '$90K–$130K', description: 'Conduct full penetration tests across networks, applications, and cloud environments.', certs: ['OSCP', 'GPEN', 'GWAPT'], skills: ['Exploit development', 'Privilege escalation', 'Web app testing', 'Active Directory attacks'], dayInLife: 'Scope engagements, perform network/app penetration tests, write detailed reports, present findings to clients.' },
                { title: 'Senior Penetration Tester / Red Team Lead', level: 'senior', salary: '$130K–$170K', description: 'Lead red team operations simulating advanced persistent threats. Develop custom tools and TTPs.', certs: ['OSEP', 'OSCE3', 'CRTO'], skills: ['C2 frameworks', 'Custom tooling', 'Evasion techniques', 'Physical security testing'], dayInLife: 'Plan adversary simulations, develop custom malware/C2, coordinate multi-phase attacks, debrief blue team, improve organizational resilience.' },
                { title: 'VP of Offensive Security', level: 'executive', salary: '$180K–$250K', description: 'Build and lead offensive security programs, set testing methodologies, and advise executive leadership.', certs: ['CISSP', 'OSEE', 'CREST CRT'], skills: ['Program management', 'Methodology development', 'Client relations', 'Team building'], dayInLife: 'Set offensive security strategy, review engagement quality, advise board on threat landscape, hire and develop talent.' }
            ]
        },
        {
            id: 'grc', name: 'Governance, Risk & Compliance', icon: '📋', color: '#eab308',
            description: 'Ensure organizations meet regulatory requirements and manage security risk effectively.',
            roles: [
                { title: 'GRC Analyst', level: 'entry', salary: '$55K–$75K', description: 'Support compliance assessments, maintain policy documentation, and track remediation efforts.', certs: ['CompTIA Security+', 'SSCP', 'ISO 27001 Lead Implementer'], skills: ['Policy writing', 'Risk registers', 'Compliance frameworks', 'Documentation'], dayInLife: 'Update compliance tracking spreadsheets, review policies, support audit preparation, schedule remediation follow-ups.' },
                { title: 'GRC Manager', level: 'mid', salary: '$90K–$120K', description: 'Manage compliance programs, lead risk assessments, and coordinate with auditors.', certs: ['CISA', 'CRISC', 'CGEIT'], skills: ['Risk management', 'Audit coordination', 'Framework mapping', 'Vendor risk management'], dayInLife: 'Lead risk assessments, coordinate audit responses, manage compliance calendar, review third-party risk reports.' },
                { title: 'CISO / Chief Risk Officer', level: 'executive', salary: '$200K–$350K', description: 'Set organizational security strategy, manage risk appetite, and report to the board of directors.', certs: ['CISSP', 'CISM', 'CRISC', 'CGEIT'], skills: ['Executive leadership', 'Board presentations', 'Risk appetite setting', 'Security strategy'], dayInLife: 'Board briefings, risk committee meetings, regulatory engagement, M&A security reviews, crisis management, budget decisions.' }
            ]
        },
        {
            id: 'cloudsec', name: 'Cloud Security', icon: '☁️', color: '#38bdf8',
            description: 'Secure cloud infrastructure, applications, and data across AWS, Azure, and GCP.',
            roles: [
                { title: 'Cloud Security Analyst', level: 'entry', salary: '$65K–$85K', description: 'Monitor cloud environments for misconfigurations, review IAM policies, and support cloud security tooling.', certs: ['AWS Cloud Practitioner', 'CompTIA Cloud+', 'AZ-900'], skills: ['Cloud console navigation', 'IAM basics', 'Security groups', 'Cloud monitoring'], dayInLife: 'Review CSPM alerts, check S3 bucket permissions, audit IAM policies, update cloud security documentation.' },
                { title: 'Cloud Security Engineer', level: 'mid', salary: '$110K–$150K', description: 'Design and implement security controls in cloud environments, automate compliance, and architect secure solutions.', certs: ['AWS Security Specialty', 'AZ-500', 'CCSP'], skills: ['Infrastructure as Code', 'Container security', 'Cloud-native security tools', 'CI/CD pipeline security'], dayInLife: 'Write Terraform security modules, configure GuardDuty/Defender, review architecture designs, implement automated compliance checks.' },
                { title: 'Cloud Security Architect', level: 'senior', salary: '$150K–$200K', description: 'Design enterprise cloud security architecture, set standards, and guide organizations through cloud transformations.', certs: ['CCSP', 'AWS Solutions Architect Pro', 'CCAK'], skills: ['Multi-cloud architecture', 'Zero trust design', 'Cloud governance', 'Security reference architectures'], dayInLife: 'Review cloud architectures, design security reference patterns, evaluate new cloud services, advise on cloud strategy, mentor engineers.' }
            ]
        },
        {
            id: 'forensics', name: 'Digital Forensics', icon: '🔬', color: '#a855f7',
            description: 'Investigate cyber incidents, recover digital evidence, and support legal proceedings.',
            roles: [
                { title: 'Digital Forensics Analyst', level: 'entry', salary: '$55K–$75K', description: 'Collect and preserve digital evidence, create forensic images, and assist with basic analysis.', certs: ['CompTIA Security+', 'GFCE', 'EnCE'], skills: ['Evidence collection', 'Disk imaging', 'Chain of custody', 'Basic analysis'], dayInLife: 'Image hard drives, document evidence handling, run initial forensic tools, write preliminary findings reports.' },
                { title: 'Senior Forensics Investigator', level: 'mid', salary: '$85K–$120K', description: 'Lead forensic investigations, perform advanced analysis (memory, network, mobile), and serve as expert witness.', certs: ['GCFE', 'GCFA', 'CHFI'], skills: ['Memory forensics', 'Timeline analysis', 'Malware analysis', 'Expert testimony'], dayInLife: 'Lead complex investigations, perform memory/disk analysis, reconstruct attack timelines, prepare court-ready reports, testify as expert witness.' },
                { title: 'Forensics Lab Director', level: 'senior', salary: '$120K–$165K', description: 'Manage forensics lab operations, set investigation standards, and coordinate with law enforcement.', certs: ['CISSP', 'GCFA', 'CCE'], skills: ['Lab management', 'Process development', 'Law enforcement liaison', 'Quality assurance'], dayInLife: 'Manage lab caseload, review investigator reports, coordinate with legal and law enforcement, maintain tool certifications, train team.' }
            ]
        },
        {
            id: 'architecture', name: 'Security Architecture', icon: '🏗️', color: '#f97316',
            description: 'Design secure systems, networks, and applications from the ground up.',
            roles: [
                { title: 'Security Engineer', level: 'entry', salary: '$70K–$95K', description: 'Implement security controls, configure security tools, and maintain security infrastructure.', certs: ['CompTIA Security+', 'GSEC', 'SSCP'], skills: ['Firewall management', 'IDS/IPS', 'SIEM deployment', 'Endpoint security'], dayInLife: 'Configure security tools, respond to engineering tickets, implement firewall rules, deploy endpoint agents, update security infrastructure.' },
                { title: 'Security Architect', level: 'mid', salary: '$120K–$165K', description: 'Design security architecture for enterprise systems, review designs, and establish security standards.', certs: ['CISSP-ISSAP', 'SABSA', 'TOGAF'], skills: ['Enterprise architecture', 'Threat modeling', 'Security patterns', 'Technology evaluation'], dayInLife: 'Review architecture proposals, create threat models, design security controls, evaluate new technologies, update security standards.' },
                { title: 'Chief Security Architect', level: 'senior', salary: '$170K–$230K', description: 'Set enterprise security architecture vision, establish technology strategy, and guide organizational security direction.', certs: ['CISSP-ISSAP', 'SABSA SCF', 'CCSP'], skills: ['Enterprise strategy', 'Zero trust architecture', 'Technology roadmapping', 'Executive influence'], dayInLife: 'Define security architecture strategy, lead architecture review boards, evaluate emerging threats, guide technology investments, mentor architects.' }
            ]
        },
        {
            id: 'appsec', name: 'Application Security', icon: '💻', color: '#22c55e',
            description: 'Secure the software development lifecycle and find vulnerabilities in applications.',
            roles: [
                { title: 'Application Security Analyst', level: 'entry', salary: '$65K–$85K', description: 'Run SAST/DAST scans, triage findings, and support developers in secure coding practices.', certs: ['CompTIA Security+', 'GWEB', 'CSSLP'], skills: ['OWASP Top 10', 'SAST/DAST tools', 'Secure coding basics', 'Bug tracking'], dayInLife: 'Run application scans, triage findings, meet with dev teams about vulnerabilities, update secure coding guidelines.' },
                { title: 'Application Security Engineer', level: 'mid', salary: '$100K–$145K', description: 'Build security into CI/CD pipelines, perform code reviews, and lead threat modeling sessions.', certs: ['OSWE', 'GWEB', 'CSSLP'], skills: ['Code review', 'Threat modeling', 'CI/CD security', 'API security'], dayInLife: 'Lead threat modeling sessions, review pull requests for security, integrate security tools into pipelines, mentor developers, research new attack techniques.' },
                { title: 'Head of Product Security', level: 'senior', salary: '$160K–$220K', description: 'Lead application security program, set SDLC security standards, and manage bug bounty programs.', certs: ['CISSP', 'CSSLP', 'OSWE'], skills: ['SDLC governance', 'Bug bounty management', 'Security champions program', 'Vendor security'], dayInLife: 'Set product security strategy, manage bug bounty program, review high-severity vulns, coordinate security champions, report to leadership.' }
            ]
        },
        {
            id: 'management', name: 'Security Management', icon: '👔', color: '#ec4899',
            description: 'Lead security teams, programs, and organizational security strategy.',
            roles: [
                { title: 'Security Team Lead', level: 'mid', salary: '$100K–$130K', description: 'Lead a team of security professionals, manage projects, and coordinate security initiatives.', certs: ['CISSP', 'CISM', 'PMP'], skills: ['People management', 'Project management', 'Stakeholder communication', 'Resource planning'], dayInLife: 'Team standups, 1:1s with reports, project status updates, cross-team coordination, hiring interviews, performance reviews.' },
                { title: 'Director of Information Security', level: 'senior', salary: '$150K–$200K', description: 'Manage multiple security teams, set departmental strategy, and represent security to leadership.', certs: ['CISSP', 'CISM', 'CRISC'], skills: ['Department management', 'Budget ownership', 'Strategic planning', 'Executive communication'], dayInLife: 'Department strategy meetings, budget reviews, leadership briefings, vendor negotiations, organizational change management.' },
                { title: 'CISO', level: 'executive', salary: '$200K–$400K+', description: 'Chief Information Security Officer — the top security executive. Sets vision, manages risk at the enterprise level, and reports to the board.', certs: ['CISSP', 'CISM', 'CRISC', 'NACD Cyber-Risk Oversight'], skills: ['Board-level communication', 'Enterprise risk management', 'Regulatory navigation', 'Organizational leadership'], dayInLife: 'Board presentations, regulatory meetings, crisis management, M&A security reviews, strategic planning, media/analyst briefings.' }
            ]
        }
    ];

    const NICE_CATEGORIES = [
        { id: 'SP', name: 'Securely Provision', roles: ['Security Architect', 'Security Engineer', 'Cloud Security Engineer', 'Application Security Engineer'], description: 'Conceptualizes, designs, procures, or builds secure IT systems.' },
        { id: 'OM', name: 'Operate & Maintain', roles: ['SOC Analyst (Tier 1)', 'Cloud Security Analyst', 'GRC Analyst'], description: 'Provides support, administration, and maintenance to ensure effective IT system performance and security.' },
        { id: 'OV', name: 'Oversee & Govern', roles: ['CISO', 'GRC Manager', 'Director of Information Security', 'Security Team Lead'], description: 'Provides leadership, management, direction, and advocacy for cybersecurity.' },
        { id: 'PR', name: 'Protect & Defend', roles: ['SOC Analyst (Tier 2)', 'SOC Manager', 'Digital Forensics Analyst', 'Senior Forensics Investigator'], description: 'Identifies, analyzes, and mitigates threats to IT systems and networks.' },
        { id: 'AN', name: 'Analyze', roles: ['SOC Analyst (Tier 2)', 'Senior Forensics Investigator', 'Application Security Analyst'], description: 'Performs highly specialized review and evaluation of incoming cybersecurity information.' },
        { id: 'CO', name: 'Collect & Operate', roles: ['Penetration Tester', 'Senior Penetration Tester / Red Team Lead'], description: 'Performs specialized denial and deception operations and collection of cybersecurity information.' },
        { id: 'IN', name: 'Investigate', roles: ['Digital Forensics Analyst', 'Senior Forensics Investigator', 'Forensics Lab Director'], description: 'Investigates cybersecurity events or crimes related to IT systems and digital evidence.' }
    ];

    const CERT_MAP = [
        { cert: 'CompTIA Security+', level: 'entry', roles: ['SOC Analyst (Tier 1)', 'GRC Analyst', 'Security Engineer', 'Application Security Analyst', 'Cloud Security Analyst', 'Digital Forensics Analyst'], color: '#22c55e' },
        { cert: 'CompTIA CySA+', level: 'entry', roles: ['SOC Analyst (Tier 1)', 'SOC Analyst (Tier 2)'], color: '#22c55e' },
        { cert: 'CompTIA PenTest+', level: 'entry', roles: ['Junior Penetration Tester'], color: '#22c55e' },
        { cert: 'CEH', level: 'entry', roles: ['Junior Penetration Tester'], color: '#22c55e' },
        { cert: 'OSCP', level: 'mid', roles: ['Penetration Tester'], color: '#eab308' },
        { cert: 'OSWE', level: 'mid', roles: ['Application Security Engineer', 'Head of Product Security'], color: '#eab308' },
        { cert: 'AWS Security Specialty', level: 'mid', roles: ['Cloud Security Engineer'], color: '#eab308' },
        { cert: 'CCSP', level: 'mid', roles: ['Cloud Security Engineer', 'Cloud Security Architect'], color: '#eab308' },
        { cert: 'CISSP', level: 'senior', roles: ['SOC Manager', 'CISO', 'Security Architect', 'Director of Information Security', 'Forensics Lab Director'], color: '#ef4444' },
        { cert: 'CISM', level: 'senior', roles: ['SOC Manager', 'CISO', 'Director of Information Security', 'Security Team Lead'], color: '#ef4444' },
        { cert: 'GCFA', level: 'mid', roles: ['Senior Forensics Investigator', 'Forensics Lab Director'], color: '#eab308' },
        { cert: 'GPEN', level: 'mid', roles: ['Penetration Tester'], color: '#eab308' },
        { cert: 'CRISC', level: 'senior', roles: ['GRC Manager', 'CISO', 'Director of Information Security'], color: '#ef4444' },
        { cert: 'CISA', level: 'mid', roles: ['GRC Manager'], color: '#eab308' }
    ];

    function getState() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
    }
    function saveState(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

    function init() {
        document.title = 'Cybersecurity Career Explorer';
        renderApp();
    }

    function renderApp() {
        const root = document.getElementById('career-root') || document.createElement('div');
        root.id = 'career-root';
        root.innerHTML = `
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0f;color:#e2e8f0;font-family:'Segoe UI',system-ui,sans-serif;min-height:100vh}
#career-root{max-width:1100px;margin:0 auto;padding:1rem}

.career-header{background:linear-gradient(135deg,#1a1028 0%,${ACCENT}11 100%);border:1px solid ${ACCENT}33;border-radius:12px;padding:1.5rem 2rem;margin-bottom:1.5rem;position:relative;overflow:hidden}
.career-header::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,${ACCENT},transparent)}
.career-header h1{font-size:1.5rem;color:#fff}
.career-header p{color:#94a3b8;font-size:.88rem;margin-top:.35rem}

.career-tabs{display:flex;gap:4px;margin-bottom:1.5rem;background:rgba(255,255,255,.03);border-radius:10px;padding:4px;flex-wrap:wrap}
.career-tab{flex:1;padding:.6rem 1rem;border-radius:8px;border:none;background:transparent;color:#94a3b8;font-size:.82rem;font-weight:500;cursor:pointer;transition:all .2s;min-width:110px;text-align:center}
.career-tab:hover{background:rgba(255,255,255,.06);color:#e2e8f0}
.career-tab.active{background:${ACCENT}22;color:${ACCENT};border:1px solid ${ACCENT}44}

.career-panel{display:none;animation:careerFade .3s ease}
.career-panel.active{display:block}
@keyframes careerFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

/* Domain Cards */
.career-domains{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:1rem}
.career-domain{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1.25rem;cursor:pointer;transition:all .2s}
.career-domain:hover{border-color:${ACCENT}44;background:rgba(255,255,255,.05)}
.career-domain.expanded{grid-column:1/-1;cursor:default}
.career-domain-head{display:flex;align-items:center;gap:.75rem}
.career-domain-icon{font-size:1.8rem}
.career-domain-name{font-size:1rem;font-weight:600;color:#fff}
.career-domain-desc{color:#64748b;font-size:.78rem;margin-top:.15rem}
.career-domain-count{margin-left:auto;color:#64748b;font-size:.75rem}

/* Role Cards */
.career-roles{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:.75rem;margin-top:1rem}
.career-role{background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:1rem;transition:all .2s}
.career-role:hover{border-color:rgba(255,255,255,.12)}
.career-role-title{font-size:.92rem;font-weight:600;color:#fff}
.career-role-level{display:inline-block;font-size:.65rem;padding:2px 8px;border-radius:10px;font-weight:600;margin-top:.25rem}
.career-role-level.entry{background:#22c55e18;color:#22c55e;border:1px solid #22c55e33}
.career-role-level.mid{background:#eab30818;color:#eab308;border:1px solid #eab30833}
.career-role-level.senior{background:#f9731618;color:#f97316;border:1px solid #f9731633}
.career-role-level.executive{background:#ef444418;color:#ef4444;border:1px solid #ef444433}
.career-role-salary{color:${ACCENT};font-size:.82rem;font-weight:500;margin-top:.4rem}
.career-role-desc{color:#94a3b8;font-size:.8rem;line-height:1.5;margin-top:.4rem}
.career-role-section{margin-top:.6rem}
.career-role-label{font-size:.7rem;color:${ACCENT};font-weight:600;text-transform:uppercase;letter-spacing:.3px;margin-bottom:.25rem}
.career-role-tags{display:flex;flex-wrap:wrap;gap:.3rem}
.career-role-tag{background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);padding:2px 8px;border-radius:4px;font-size:.72rem;color:#94a3b8}
.career-role-day{color:#64748b;font-size:.78rem;font-style:italic;line-height:1.5;margin-top:.4rem}

/* Career Paths */
.career-path-track{margin-bottom:1.5rem}
.career-path-title{color:#fff;font-size:1rem;font-weight:600;margin-bottom:.75rem;display:flex;align-items:center;gap:.5rem}
.career-path-flow{display:flex;gap:0;align-items:stretch;overflow-x:auto;padding-bottom:.5rem}
.career-path-node{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:8px;padding:.75rem 1rem;min-width:180px;max-width:220px;flex-shrink:0;position:relative}
.career-path-node::after{content:'→';position:absolute;right:-14px;top:50%;transform:translateY(-50%);color:#64748b;font-size:1rem;z-index:1}
.career-path-node:last-child::after{display:none}
.career-path-node .title{font-size:.82rem;font-weight:600;color:#fff}
.career-path-node .years{font-size:.7rem;color:${ACCENT};margin-top:.2rem}
.career-path-node .salary{font-size:.72rem;color:#64748b;margin-top:.15rem}
.career-path-arrow{display:flex;align-items:center;color:#64748b;font-size:1rem;padding:0 .25rem;flex-shrink:0}

/* Cert Map */
.cert-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:.75rem}
.cert-card{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:1rem}
.cert-name{font-size:.92rem;font-weight:600;color:#fff;display:flex;align-items:center;gap:.5rem}
.cert-level{font-size:.65rem;padding:2px 8px;border-radius:10px;font-weight:600}
.cert-roles{margin-top:.5rem}
.cert-role-tag{display:inline-block;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);padding:2px 8px;border-radius:4px;font-size:.72rem;color:#94a3b8;margin:.15rem .15rem 0 0}

/* NICE */
.nice-category{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1.25rem;margin-bottom:.75rem}
.nice-cat-head{display:flex;align-items:center;gap:.75rem}
.nice-cat-id{background:${ACCENT}22;color:${ACCENT};padding:4px 12px;border-radius:6px;font-size:.75rem;font-weight:700;font-family:monospace}
.nice-cat-name{font-size:1rem;font-weight:600;color:#fff}
.nice-cat-desc{color:#94a3b8;font-size:.82rem;margin-top:.35rem}
.nice-cat-roles{margin-top:.75rem;display:flex;flex-wrap:wrap;gap:.35rem}

.career-back{display:inline-flex;align-items:center;gap:.4rem;color:#64748b;text-decoration:none;font-size:.82rem;margin-bottom:1rem;transition:color .2s}
.career-back:hover{color:${ACCENT}}

@media(max-width:640px){
    #career-root{padding:.75rem}
    .career-header{padding:1rem 1.25rem}
    .career-header h1{font-size:1.2rem}
    .career-tab{min-width:0;font-size:.75rem;padding:.5rem .6rem}
    .career-domains{grid-template-columns:1fr}
    .career-path-flow{flex-direction:column}
    .career-path-node::after{content:'↓';right:50%;top:auto;bottom:-14px;transform:translateX(50%)}
    .career-path-node{min-width:auto;max-width:none}
}
</style>

<a class="career-back" href="../../../index.html">‹ Back to Shield House</a>

<div class="career-header">
    <h1>🎯 Cybersecurity Career Explorer</h1>
    <p>Explore career paths, required certifications, salary ranges, and day-in-the-life descriptions for cybersecurity professionals.</p>
</div>

<div class="career-tabs">
    <button class="career-tab active" data-tab="roles">Browse Roles</button>
    <button class="career-tab" data-tab="paths">Career Paths</button>
    <button class="career-tab" data-tab="certs">Certification Map</button>
    <button class="career-tab" data-tab="nice">NICE Framework</button>
</div>

<div id="panel-roles" class="career-panel active"></div>
<div id="panel-paths" class="career-panel"></div>
<div id="panel-certs" class="career-panel"></div>
<div id="panel-nice" class="career-panel"></div>
`;
        if (!document.getElementById('career-root')) document.body.appendChild(root);

        renderRoles();
        renderPaths();
        renderCerts();
        renderNICE();
        bindTabs();

        // Track visit
        try {
            const progress = JSON.parse(localStorage.getItem('hexworth_progress') || '{}');
            if (!progress.shield) progress.shield = {};
            if (!progress.shield['career-explorer']) {
                progress.shield['career-explorer'] = { completed: true, timestamp: Date.now() };
                localStorage.setItem('hexworth_progress', JSON.stringify(progress));
            }
        } catch(e) {}
    }

    function bindTabs() {
        document.querySelectorAll('.career-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.career-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.career-panel').forEach(p => p.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
            });
        });
    }

    function renderRoles() {
        const panel = document.getElementById('panel-roles');
        panel.innerHTML = `<div class="career-domains" id="domainGrid">
            ${DOMAINS.map((d, di) => `
                <div class="career-domain" data-domain="${di}">
                    <div class="career-domain-head">
                        <span class="career-domain-icon">${d.icon}</span>
                        <div>
                            <div class="career-domain-name">${d.name}</div>
                            <div class="career-domain-desc">${d.description}</div>
                        </div>
                        <span class="career-domain-count">${d.roles.length} roles</span>
                    </div>
                </div>
            `).join('')}
        </div>
        <div id="roleDetail" style="display:none"></div>`;

        panel.querySelectorAll('.career-domain').forEach(card => {
            card.addEventListener('click', () => {
                const di = parseInt(card.dataset.domain);
                showDomainRoles(di);
            });
        });
    }

    function showDomainRoles(di) {
        const d = DOMAINS[di];
        const detail = document.getElementById('roleDetail');
        const grid = document.getElementById('domainGrid');
        grid.style.display = 'none';
        detail.style.display = '';
        detail.innerHTML = `
            <button style="background:transparent;border:1px solid rgba(255,255,255,.12);color:#94a3b8;padding:.4rem 1rem;border-radius:6px;cursor:pointer;font-size:.8rem;margin-bottom:1rem" id="backToDomainsBtn">← All Domains</button>
            <div style="display:flex;align-items:center;gap:.75rem;margin-bottom:1rem">
                <span style="font-size:2rem">${d.icon}</span>
                <div>
                    <div style="font-size:1.1rem;font-weight:600;color:#fff">${d.name}</div>
                    <div style="color:#64748b;font-size:.82rem">${d.description}</div>
                </div>
            </div>
            <div class="career-roles">
                ${d.roles.map(r => `
                    <div class="career-role">
                        <div class="career-role-title">${r.title}</div>
                        <span class="career-role-level ${r.level}">${r.level.charAt(0).toUpperCase() + r.level.slice(1)}</span>
                        <div class="career-role-salary">${r.salary}</div>
                        <div class="career-role-desc">${r.description}</div>
                        <div class="career-role-section">
                            <div class="career-role-label">Key Certifications</div>
                            <div class="career-role-tags">${r.certs.map(c => `<span class="career-role-tag">${c}</span>`).join('')}</div>
                        </div>
                        <div class="career-role-section">
                            <div class="career-role-label">Core Skills</div>
                            <div class="career-role-tags">${r.skills.map(s => `<span class="career-role-tag">${s}</span>`).join('')}</div>
                        </div>
                        <div class="career-role-section">
                            <div class="career-role-label">A Day in the Life</div>
                            <div class="career-role-day">${r.dayInLife}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        document.getElementById('backToDomainsBtn').addEventListener('click', () => {
            detail.style.display = 'none';
            grid.style.display = '';
        });
    }

    function renderPaths() {
        const panel = document.getElementById('panel-paths');
        const tracks = [
            {
                name: 'SOC / Blue Team Track', icon: '🔍', color: '#3b82f6',
                nodes: [
                    { title: 'SOC Analyst (Tier 1)', years: '0–2 years', salary: '$55K–$75K' },
                    { title: 'SOC Analyst (Tier 2)', years: '2–4 years', salary: '$75K–$100K' },
                    { title: 'SOC Manager', years: '5–8 years', salary: '$110K–$145K' },
                    { title: 'Director of SecOps', years: '8+ years', salary: '$160K–$220K' }
                ]
            },
            {
                name: 'Offensive Security Track', icon: '🎯', color: '#ef4444',
                nodes: [
                    { title: 'Jr. Penetration Tester', years: '0–2 years', salary: '$60K–$80K' },
                    { title: 'Penetration Tester', years: '2–5 years', salary: '$90K–$130K' },
                    { title: 'Red Team Lead', years: '5–8 years', salary: '$130K–$170K' },
                    { title: 'VP Offensive Security', years: '8+ years', salary: '$180K–$250K' }
                ]
            },
            {
                name: 'GRC / Leadership Track', icon: '📋', color: '#eab308',
                nodes: [
                    { title: 'GRC Analyst', years: '0–2 years', salary: '$55K–$75K' },
                    { title: 'GRC Manager', years: '3–5 years', salary: '$90K–$120K' },
                    { title: 'Director of InfoSec', years: '6–10 years', salary: '$150K–$200K' },
                    { title: 'CISO', years: '10+ years', salary: '$200K–$400K+' }
                ]
            },
            {
                name: 'Cloud Security Track', icon: '☁️', color: '#38bdf8',
                nodes: [
                    { title: 'Cloud Security Analyst', years: '0–2 years', salary: '$65K–$85K' },
                    { title: 'Cloud Security Engineer', years: '2–5 years', salary: '$110K–$150K' },
                    { title: 'Cloud Security Architect', years: '5+ years', salary: '$150K–$200K' }
                ]
            },
            {
                name: 'Digital Forensics Track', icon: '🔬', color: '#a855f7',
                nodes: [
                    { title: 'Forensics Analyst', years: '0–2 years', salary: '$55K–$75K' },
                    { title: 'Sr. Forensics Investigator', years: '3–6 years', salary: '$85K–$120K' },
                    { title: 'Forensics Lab Director', years: '6+ years', salary: '$120K–$165K' }
                ]
            },
            {
                name: 'Application Security Track', icon: '💻', color: '#22c55e',
                nodes: [
                    { title: 'AppSec Analyst', years: '0–2 years', salary: '$65K–$85K' },
                    { title: 'AppSec Engineer', years: '2–5 years', salary: '$100K–$145K' },
                    { title: 'Head of Product Security', years: '5+ years', salary: '$160K–$220K' }
                ]
            }
        ];

        panel.innerHTML = tracks.map(t => `
            <div class="career-path-track">
                <div class="career-path-title"><span>${t.icon}</span> ${t.name}</div>
                <div class="career-path-flow">
                    ${t.nodes.map(n => `
                        <div class="career-path-node" style="border-color:${t.color}33">
                            <div class="title">${n.title}</div>
                            <div class="years">${n.years}</div>
                            <div class="salary">${n.salary}</div>
                        </div>
                    `).join(`<div class="career-path-arrow">→</div>`)}
                </div>
            </div>
        `).join('');
    }

    function renderCerts() {
        const panel = document.getElementById('panel-certs');
        const levels = [
            { key: 'entry', label: 'Entry-Level', color: '#22c55e' },
            { key: 'mid', label: 'Mid-Level', color: '#eab308' },
            { key: 'senior', label: 'Senior / Executive', color: '#ef4444' }
        ];

        panel.innerHTML = levels.map(lvl => `
            <h3 style="color:${lvl.color};font-size:1rem;margin:1rem 0 .75rem;display:flex;align-items:center;gap:.5rem">
                <span style="width:12px;height:12px;border-radius:50%;background:${lvl.color};display:inline-block"></span>
                ${lvl.label} Certifications
            </h3>
            <div class="cert-grid">
                ${CERT_MAP.filter(c => c.level === lvl.key).map(c => `
                    <div class="cert-card" style="border-left:3px solid ${c.color}">
                        <div class="cert-name">${c.cert}</div>
                        <div class="cert-roles">
                            ${c.roles.map(r => `<span class="cert-role-tag">${r}</span>`).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
        `).join('');
    }

    function renderNICE() {
        const panel = document.getElementById('panel-nice');
        panel.innerHTML = `
            <p style="color:#94a3b8;font-size:.85rem;margin-bottom:1rem">The <strong style="color:#fff">NICE Cybersecurity Workforce Framework</strong> (NIST SP 800-181) categorizes cybersecurity work into seven categories. Here's how our career roles map to each.</p>
            ${NICE_CATEGORIES.map(cat => `
                <div class="nice-category">
                    <div class="nice-cat-head">
                        <span class="nice-cat-id">${cat.id}</span>
                        <span class="nice-cat-name">${cat.name}</span>
                    </div>
                    <div class="nice-cat-desc">${cat.description}</div>
                    <div class="nice-cat-roles">
                        ${cat.roles.map(r => `<span class="career-role-tag">${r}</span>`).join('')}
                    </div>
                </div>
            `).join('')}
        `;
    }

    return { init };
})();
