/**
 * OSINTLabEngine.js — 5-Stage OSINT Investigation Simulator
 *
 * Fictional target: MeridianTech Corp
 * Stages: Passive Recon → Social Media → Technical Recon → Physical/Environmental → Intel Report
 * Usage: OSINTLabEngine.init()
 */
const OSINTLabEngine = (() => {
    const STORAGE_KEY = 'hexworth_osint_lab';
    const ACCENT = '#22d3ee';

    const STAGES = [
        {
            id: 'passive',
            title: 'Passive Reconnaissance',
            icon: '<img src="/assets/images/icons/icon-magnifier.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
            description: 'Gather publicly available information about MeridianTech Corp without directly interacting with their systems.',
            tools: [
                {
                    name: 'whois',
                    syntax: 'whois meridiantech.com',
                    description: 'WHOIS domain registration lookup',
                    output: `Domain Name: MERIDIANTECH.COM\nRegistry Domain ID: 298174521_DOMAIN_COM-VRSN\nRegistrar: GoDaddy.com, LLC\nRegistrar IANA ID: 146\nCreation Date: 2019-03-14T08:22:31Z\nRegistry Expiry: 2026-03-14T08:22:31Z\nRegistrant Organization: MeridianTech Corporation\nRegistrant State/Province: Virginia\nRegistrant Country: US\nRegistrant Email: admin@meridiantech.com\nName Server: NS-1142.AWSDNS-14.ORG\nName Server: NS-731.AWSDNS-27.NET\nDNSSEC: unsigned`,
                    clues: ['Registered in Virginia', 'Uses AWS DNS (Route 53)', 'Admin email: admin@meridiantech.com', 'Domain created March 2019', 'DNSSEC not enabled']
                },
                {
                    name: 'dig',
                    syntax: 'dig meridiantech.com ANY',
                    description: 'DNS record enumeration',
                    output: `;; ANSWER SECTION:\nmeridiantech.com.      300  IN  A      52.73.142.88\nmeridiantech.com.      300  IN  MX     10 mail.meridiantech.com.\nmeridiantech.com.      300  IN  MX     20 mail2.meridiantech.com.\nmeridiantech.com.      300  IN  TXT    "v=spf1 include:_spf.google.com include:amazonses.com ~all"\nmeridiantech.com.      300  IN  NS     ns-1142.awsdns-14.org.\nmeridiantech.com.      300  IN  NS     ns-731.awsdns-27.net.\nmail.meridiantech.com. 300  IN  A      35.190.88.12`,
                    clues: ['IP: 52.73.142.88 (AWS us-east-1)', 'Uses Google Workspace for email (SPF)', 'Also uses Amazon SES', 'Two MX records — primary and backup', 'SPF uses ~all (softfail, not -all)']
                },
                {
                    name: 'google',
                    syntax: 'site:meridiantech.com filetype:pdf',
                    description: 'Google dorking for documents',
                    output: `Results for site:meridiantech.com filetype:pdf\n\n1. MeridianTech Employee Handbook 2024.pdf\n   meridiantech.com/hr/docs/handbook-2024.pdf\n   "...all employees must complete annual security training..."\n\n2. Q3 2025 Financial Summary.pdf\n   meridiantech.com/investors/q3-2025-summary.pdf\n   "...revenue of $47.2M... 312 employees..."\n\n3. MeridianTech-AWS-Architecture-Overview.pdf\n   meridiantech.com/engineering/MeridianTech-AWS-Architecture-Overview.pdf\n   "...multi-region deployment... us-east-1 primary..."\n\n4. Vendor-Security-Questionnaire-Template.pdf\n   meridiantech.com/procurement/vendor-security-questionnaire.pdf\n   "...SOC 2 Type II certification in progress..."`,
                    clues: ['312 employees, $47.2M revenue', 'Employee handbook exposed on public site', 'AWS architecture document publicly accessible', 'SOC 2 Type II in progress (not yet certified)', 'HR docs accessible without auth']
                }
            ],
            questions: [
                { q: 'Based on the WHOIS results, what cloud provider does MeridianTech likely use for their infrastructure?', options: ['Microsoft Azure', 'Amazon Web Services (AWS)', 'Google Cloud Platform', 'DigitalOcean'], correct: 1, hint: 'Look at the Name Server entries.' },
                { q: 'What critical security misconfiguration is revealed by the Google dorking results?', options: ['Weak password policy', 'Sensitive documents (HR handbook, architecture docs) publicly accessible', 'Missing SSL certificate', 'Open database ports'], correct: 1, hint: 'Consider what documents should NOT be publicly indexed.' },
                { q: 'The SPF record uses ~all instead of -all. What does this mean for email security?', options: ['All email is encrypted', 'Unauthorized senders are hard-rejected', 'Unauthorized senders get a softfail — emails may still be delivered', 'SPF is disabled'], correct: 2, hint: '~all = softfail, -all = hardfail.' }
            ]
        },
        {
            id: 'social',
            title: 'Social Media OSINT',
            icon: '<img src="/assets/images/icons/icon-users.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
            description: 'Analyze social media profiles and metadata to gather intelligence about MeridianTech employees and operations.',
            tools: [
                {
                    name: 'linkedin',
                    syntax: 'search linkedin "MeridianTech" employees',
                    description: 'LinkedIn employee analysis',
                    output: `MeridianTech Corporation — LinkedIn Profile Analysis\n\nKey Personnel Found:\n━━━━━━━━━━━━━━━━━━━━\n• David Chen — CTO (since 2020)\n  Education: MIT, MS Computer Science\n  Skills: AWS, Kubernetes, Python, Terraform\n  Recent post: "Excited to announce our migration to EKS!"\n\n• Sarah Williams — CISO (since 2023)\n  Education: Georgetown, MS Cybersecurity\n  Certifications: CISSP, CISM\n  Recent post: "Just finished our CMMC Level 2 gap analysis"\n\n• Marcus Johnson — DevOps Lead\n  Skills: Jenkins, Docker, Ansible, GitLab CI\n  Recent post: "Finally automated our deployment pipeline! #DevOps"\n\n• Elena Rodriguez — HR Director\n  Recent post: "Hiring 15 new engineers in Q1!"\n\nCompany Stats: 312 employees | 47 posted jobs | 89% response rate`,
                    clues: ['CTO reveals tech stack: AWS, Kubernetes, Terraform', 'CISO mentions CMMC Level 2 gap analysis', 'DevOps lead reveals CI/CD tools: Jenkins, GitLab CI', 'Actively hiring 15 engineers — rapid growth', 'CTO announced EKS migration publicly']
                },
                {
                    name: 'exiftool',
                    syntax: 'exiftool MeridianTech-Team-Photo.jpg',
                    description: 'Image metadata extraction',
                    output: `ExifTool Version: 12.76\nFile Name: MeridianTech-Team-Photo.jpg\nFile Size: 4.2 MB\nFile Type: JPEG\nMIME Type: image/jpeg\nCamera Model: iPhone 15 Pro Max\nGPS Latitude: 38.8977° N\nGPS Longitude: 77.0365° W\nCreate Date: 2025:09:15 14:32:11\nSoftware: Adobe Photoshop 2025\nAuthor: sarah.williams@meridiantech.com\nCopyright: MeridianTech Corp\nXMP Creator Tool: Adobe Photoshop 25.3`,
                    clues: ['GPS coordinates: 38.8977°N, 77.0365°W (Washington DC area)', 'Photo taken Sept 15, 2025', 'Author email leaked: sarah.williams@meridiantech.com', 'Email format: firstname.lastname@meridiantech.com', 'Photo edited in Photoshop — may have been modified']
                },
                {
                    name: 'twitter',
                    syntax: 'search twitter "@MeridianTechHQ"',
                    description: 'Twitter/X account analysis',
                    output: `@MeridianTechHQ — Twitter Analysis\n\nBio: "Defense contractor specializing in secure cloud solutions.\nVirginia | Est. 2019"\n\nRecent Tweets:\n━━━━━━━━━━━━━━\n• "Proud to announce our FedRAMP authorization! <img src="/assets/images/icons/icon-star.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">"\n• "Our team at AWS re:Invent was amazing! Special thanks\n   to @david_chen_mtech for the keynote."\n• "We're hiring! Check out 15 new positions on our careers\n   page. #infosec #cloudsecurity"\n• "Happy hour at The Capital Grille in Tysons Corner tonight!\n   Great team bonding. <img src="/assets/images/icons/icon-camera.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">"\n\nFollowing: AWS, CISA, NIST, DoD CIO, Lockheed Martin,\nNorthrop Grumman, Palo Alto Networks, CrowdStrike`,
                    clues: ['Defense contractor with FedRAMP authorization', 'Located near Tysons Corner, Virginia', 'Employee name format confirmed: David Chen → @david_chen_mtech', 'Following list reveals partners/vendors: Palo Alto, CrowdStrike', 'Social posts reveal employee gathering locations']
                }
            ],
            questions: [
                { q: 'What email naming convention does MeridianTech use, based on the metadata analysis?', options: ['first.last@meridiantech.com', 'flast@meridiantech.com', 'firstlast@meridiantech.com', 'first_last@meridiantech.com'], correct: 0, hint: 'Check the EXIF author field.' },
                { q: 'An attacker could use LinkedIn posts to craft a targeted phishing email. Which employee post reveals the MOST useful technical information?', options: ['Elena Rodriguez mentioning hiring plans', 'David Chen announcing EKS migration', 'Sarah Williams mentioning CMMC gap analysis', 'Marcus Johnson revealing the CI/CD toolchain'], correct: 3, hint: 'Which post reveals specific tools that could be used in a supply chain or infrastructure attack?' },
                { q: 'The GPS coordinates in the team photo metadata point to which area?', options: ['New York City', 'Washington DC area', 'San Francisco', 'Chicago'], correct: 1, hint: '38.89°N, 77.04°W is a well-known location.' }
            ]
        },
        {
            id: 'technical',
            title: 'Technical Reconnaissance',
            icon: '<img src="/assets/images/icons/icon-desktop.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
            description: 'Discover technical infrastructure, exposed services, and certificate information without active exploitation.',
            tools: [
                {
                    name: 'shodan',
                    syntax: 'shodan search org:"MeridianTech"',
                    description: 'Shodan internet-facing asset discovery',
                    output: `Shodan Results for org:"MeridianTech"\n\nTotal Results: 23 hosts found\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n52.73.142.88 (aws us-east-1)\n  Port 443: nginx/1.24.0 — TLS 1.2, TLS 1.3\n  Port 80: HTTP → 301 redirect to HTTPS\n  Port 22: OpenSSH 8.9p1 Ubuntu\n  Headers: X-Powered-By: Express\n\n35.190.88.12 (aws us-east-1)\n  Port 25: Postfix SMTP\n  Port 443: Microsoft Exchange 2019\n  Port 993: IMAP over TLS\n\n52.73.142.90 (aws us-east-1)\n  Port 443: nginx/1.24.0\n  Port 8080: Jenkins 2.426.1\n  Port 5432: PostgreSQL 15.4\n  Banner: "Welcome to MeridianTech Staging"\n\n52.73.142.91 (aws us-east-1)\n  Port 443: Kubernetes API Server v1.28\n  Port 6443: Kubernetes API (authenticated)\n  Port 10250: kubelet`,
                    clues: ['SSH (port 22) exposed on production web server', 'Jenkins on port 8080 publicly accessible', 'PostgreSQL database port 5432 exposed to internet', 'Staging server identifiable by banner', 'Kubernetes API server exposed on port 6443']
                },
                {
                    name: 'crtsh',
                    syntax: 'curl "https://crt.sh/?q=%.meridiantech.com&output=json"',
                    description: 'Certificate transparency log search',
                    output: `Certificate Transparency Results for *.meridiantech.com\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nSubdomains discovered:\n• www.meridiantech.com\n• mail.meridiantech.com\n• vpn.meridiantech.com\n• staging.meridiantech.com\n• dev.meridiantech.com\n• api.meridiantech.com\n• jenkins.meridiantech.com\n• grafana.meridiantech.com\n• gitlab.meridiantech.com\n• k8s-dashboard.meridiantech.com\n• vault.meridiantech.com (HashiCorp Vault)\n• sentry.meridiantech.com\n\nCertificate Issuer: Let's Encrypt (most)\nCertificate Issuer: DigiCert (vpn.meridiantech.com)\nOldest cert: 2019-04-01 (www)\nNewest cert: 2025-12-01 (k8s-dashboard)`,
                    clues: ['12 subdomains discovered via cert transparency', 'Jenkins, GitLab, Grafana, Vault, Sentry all have public DNS', 'Kubernetes dashboard has public certificate', 'VPN endpoint identified: vpn.meridiantech.com', 'Dev and staging environments have public certs']
                },
                {
                    name: 'subfinder',
                    syntax: 'subfinder -d meridiantech.com -silent',
                    description: 'Subdomain enumeration',
                    output: `Subdomain Enumeration: meridiantech.com\n\nDiscovered 18 unique subdomains:\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nwww.meridiantech.com\nmail.meridiantech.com\nmail2.meridiantech.com\nvpn.meridiantech.com\nstaging.meridiantech.com\ndev.meridiantech.com\napi.meridiantech.com\njenkins.meridiantech.com\ngrafana.meridiantech.com\ngitlab.meridiantech.com\nk8s-dashboard.meridiantech.com\nvault.meridiantech.com\nsentry.meridiantech.com\nredis.meridiantech.com         ← NEW\nbackup.meridiantech.com        ← NEW\ntest-api.meridiantech.com      ← NEW\nold.meridiantech.com           ← NEW\nadmin.meridiantech.com         ← NEW\njira.meridiantech.com          ← NEW\n\nSources: crt.sh, DNSdumpster, VirusTotal, Shodan`,
                    clues: ['redis.meridiantech.com — Redis exposed publicly?', 'backup.meridiantech.com — Backup system discoverable', 'old.meridiantech.com — Legacy system still running', 'admin.meridiantech.com — Admin panel discoverable', 'Total attack surface: 18+ subdomains']
                }
            ],
            questions: [
                { q: 'Which Shodan finding represents the HIGHEST risk to MeridianTech?', options: ['SSH on port 22 of the web server', 'Jenkins on port 8080 and PostgreSQL on 5432 exposed to the internet on the staging server', 'SMTP on port 25 of the mail server', 'Kubernetes API on port 6443'], correct: 1, hint: 'Consider which services should NEVER be internet-facing and which combination creates the most risk.' },
                { q: 'What technique revealed the most subdomains that weren\'t found by cert transparency alone?', options: ['WHOIS lookup', 'Active subdomain brute-forcing via subfinder using multiple passive sources', 'DNS zone transfer', 'Port scanning'], correct: 1, hint: 'Compare the crt.sh results to the subfinder results.' },
                { q: 'An attacker discovers k8s-dashboard.meridiantech.com has a public certificate. Why is this concerning?', options: ['Kubernetes dashboards should use self-signed certs', 'A public Kubernetes dashboard could allow cluster access if not properly secured', 'Certificate transparency is a vulnerability', 'Kubernetes doesn\'t need TLS'], correct: 1, hint: 'Think about what access a Kubernetes dashboard provides.' }
            ]
        },
        {
            id: 'physical',
            title: 'Physical & Environmental',
            icon: '<img src="/assets/images/icons/icon-building.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
            description: 'Analyze physical security through satellite imagery, public records, and environmental intelligence gathering.',
            tools: [
                {
                    name: 'maps',
                    syntax: 'analyze satellite-imagery 38.8977N 77.0365W',
                    description: 'Satellite imagery and geolocation analysis',
                    output: `Geolocation Analysis: 38.8977°N, 77.0365°W\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nLocation: Tysons Corner, Virginia 22102\nBuilding: Meridian Corporate Center, Suite 400-410\nBuilding Type: Class A Office (12 floors)\nParking: Underground garage (badge access)\nNearest Transit: Tysons Corner Metro (Silver Line)\n\nObservations from Street View / Satellite:\n• Loading dock on south side — no camera visible\n• Roof has 3 HVAC units and satellite dish\n• Badge reader visible at main entrance (HID brand)\n• Security guard desk visible in lobby\n• Emergency exit on east side — appears to have alarm\n• Dumpster area behind building — partially fenced\n• Adjacent tenants: Law firm (3rd floor), Accounting firm (5th floor)`,
                    clues: ['Building identified: Tysons Corner, VA', 'Loading dock has no visible cameras', 'HID badge system at main entrance', 'Dumpster area partially fenced (dumpster diving opportunity)', 'Multi-tenant building — shared physical infrastructure']
                },
                {
                    name: 'dumpster',
                    syntax: 'simulate dumpster-dive meridiantech',
                    description: 'Simulated dumpster diving analysis',
                    output: `Dumpster Dive Analysis — MeridianTech (Simulated)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nItems Found in Recycling:\n• Shredded paper (cross-cut) — reconstitution unlikely\n• Unshredded printouts:\n  - IT asset disposal form (lists 12 laptop serial numbers)\n  - Meeting agenda: "Q1 Security Roadmap" with attendee names\n  - Printed email chain about VPN migration timeline\n• Food delivery receipts with employee names\n• Amazon shipping labels (IT equipment orders)\n• Post-it notes with "Meridian2024!" and "Staging-DB-Pass"\n\nItems Found Near Loading Dock:\n• 3 hard drives in standard trash (not shredded/degaussed)\n• Old network switch with configuration still in memory\n• Employee badge — expired but readable (Sarah Williams)`,
                    clues: ['Potential passwords found: "Meridian2024!", "Staging-DB-Pass"', 'Hard drives not sanitized before disposal', 'IT asset disposal forms reveal equipment details', 'Expired badge still readable — could be cloned', 'VPN migration timeline exposed in printed emails']
                },
                {
                    name: 'records',
                    syntax: 'search public-records "MeridianTech Corporation" Virginia',
                    description: 'Public records search',
                    output: `Public Records Search: MeridianTech Corporation\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\nVirginia SCC Registration:\n  Entity ID: S8847291\n  Status: Active\n  Incorporated: 2019-02-28\n  Agent: David Chen, 8000 Towers Crescent Dr, Tysons, VA 22102\n  Annual Report: Filed 2025-06-15\n\nFederal Contract Awards (USAspending.gov):\n  FY2024: $12.3M — DoD Cloud Migration Services\n  FY2025: $8.7M — DISA Secure Communications Platform\n  Total Awards: $21M across 2 fiscal years\n\nFCC Licenses:\n  Radio License: KJ4MTC (amateur, David Chen)\n\nBuilding Permits (Fairfax County):\n  2024-08: Electrical upgrade for server room (Suite 408)\n  2025-01: HVAC modification for data center cooling`,
                    clues: ['Confirmed DoD contractor ($21M in federal contracts)', 'Registered agent is the CTO with personal address', 'Building permits reveal server room location (Suite 408)', 'FCC license links CTO to amateur radio callsign', 'DISA contract — handles classified-adjacent communications']
                }
            ],
            questions: [
                { q: 'What is the MOST serious physical security finding from the dumpster dive?', options: ['Shredded paper found in recycling', 'Post-it notes with what appear to be passwords', 'Food delivery receipts with employee names', 'Unsanitized hard drives disposed of in regular trash'], correct: 3, hint: 'Which finding could contain the most sensitive data and represents the biggest compliance failure?' },
                { q: 'Building permits revealed the server room is in Suite 408. How could an attacker use this information?', options: ['To schedule a building tour', 'To target physical access or social engineering against that specific area', 'To file competing building permits', 'This information is not useful to an attacker'], correct: 1, hint: 'Knowing the exact location of high-value assets enables targeted physical attacks.' },
                { q: 'MeridianTech is a multi-tenant building. Why does this complicate physical security?', options: ['Other tenants might compete for contracts', 'Shared physical infrastructure means less control over who enters the building', 'Multi-tenant buildings have better security', 'It doesn\'t — each suite is independent'], correct: 1, hint: 'Think about shared lobbies, elevators, parking garages, and HVAC systems.' }
            ]
        },
        {
            id: 'report',
            title: 'Intelligence Report',
            icon: '<img src="/assets/images/icons/icon-barchart.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">',
            description: 'Compile your findings into a structured intelligence report. Assess overall threat level and provide recommendations.',
            isReport: true,
            sections: [
                {
                    title: 'Executive Summary',
                    prompt: 'Based on your investigation, what is the overall security posture of MeridianTech?',
                    options: [
                        { label: 'Critical Risk', value: 'critical', desc: 'Multiple severe exposures requiring immediate action' },
                        { label: 'High Risk', value: 'high', desc: 'Significant findings that could lead to compromise' },
                        { label: 'Moderate Risk', value: 'moderate', desc: 'Some concerns but generally adequate controls' },
                        { label: 'Low Risk', value: 'low', desc: 'Minor issues, strong security posture overall' }
                    ],
                    correct: 'high',
                    explanation: 'MeridianTech has HIGH risk: publicly exposed Jenkins/PostgreSQL, sensitive documents indexed by Google, passwords in dumpster, unsanitized hard drives, and over-sharing on social media. However, they do have some controls (badge access, SPF records, HTTPS) and are pursuing compliance (CMMC, SOC 2, FedRAMP).'
                },
                {
                    title: 'Top 5 Critical Findings',
                    prompt: 'Rank the most critical findings from your investigation.',
                    findings: [
                        'Jenkins and PostgreSQL exposed to internet on staging server',
                        'Sensitive documents (architecture, HR handbook) publicly indexed',
                        'Unsanitized hard drives in regular trash',
                        'Employee passwords found on Post-it notes in trash',
                        'CMMC-relevant employee posts revealing security posture on social media',
                        'Kubernetes dashboard and 18+ subdomains discoverable',
                        'Expired employee badge found (clonable)',
                        'SPF softfail configuration (~all instead of -all)'
                    ],
                    topPicks: [0, 1, 2, 3, 5]
                },
                {
                    title: 'Recommendations',
                    prompt: 'What are the priority remediation steps?',
                    recommendations: [
                        { priority: 'CRITICAL', text: 'Immediately restrict Jenkins, PostgreSQL, and Kubernetes dashboard from public internet access' },
                        { priority: 'CRITICAL', text: 'Implement media sanitization procedures per NIST SP 800-88 for all disposed equipment' },
                        { priority: 'HIGH', text: 'Remove sensitive documents from public web directories and implement access controls' },
                        { priority: 'HIGH', text: 'Enforce clean desk policy and prohibit writing passwords on physical media' },
                        { priority: 'HIGH', text: 'Implement social media guidelines to prevent disclosure of technical infrastructure details' },
                        { priority: 'MEDIUM', text: 'Harden SPF record to use -all (hardfail) instead of ~all (softfail)' },
                        { priority: 'MEDIUM', text: 'Disable SSH access on production servers; use bastion host pattern' },
                        { priority: 'LOW', text: 'Install cameras at loading dock and fully fence dumpster area' }
                    ]
                }
            ]
        }
    ];

    function getState() {
        try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch { return {}; }
    }
    function saveState(s) { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); }

    function init() {
        document.title = 'OSINT Investigation Lab — MeridianTech Corp';
        const state = getState();
        if (!state.clues) state.clues = [];
        if (!state.stageProgress) state.stageProgress = {};
        if (!state.currentStage) state.currentStage = 0;
        saveState(state);
        renderApp();
    }

    function renderApp() {
        const state = getState();
        const root = document.getElementById('osint-root') || document.createElement('div');
        root.id = 'osint-root';

        root.innerHTML = `
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{background:#0a0a0f;color:#e2e8f0;font-family:'Segoe UI',system-ui,sans-serif;min-height:100vh}
#osint-root{max-width:1100px;margin:0 auto;padding:1rem}

.osint-header{background:linear-gradient(135deg,#0a1628 0%,${ACCENT}11 100%);border:1px solid ${ACCENT}33;border-radius:12px;padding:1.5rem 2rem;margin-bottom:1.5rem;position:relative;overflow:hidden}
.osint-header::before{content:'';position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,transparent,${ACCENT},transparent)}
.osint-header h1{font-size:1.5rem;color:#fff;margin-bottom:.25rem}
.osint-header .subtitle{color:${ACCENT};font-size:.9rem;font-weight:500}
.osint-header .target{color:#64748b;font-size:.82rem;margin-top:.5rem}
.osint-header .target strong{color:#e2e8f0}

.osint-stages{display:flex;gap:4px;margin-bottom:1.5rem;flex-wrap:wrap}
.osint-stage-btn{flex:1;min-width:120px;padding:.6rem .75rem;border:1px solid rgba(255,255,255,.08);border-radius:8px;background:rgba(255,255,255,.02);color:#64748b;font-size:.78rem;cursor:pointer;transition:all .2s;text-align:center;display:flex;align-items:center;justify-content:center;gap:.4rem}
.osint-stage-btn:hover{background:rgba(255,255,255,.05);color:#94a3b8}
.osint-stage-btn.active{background:${ACCENT}15;color:${ACCENT};border-color:${ACCENT}44}
.osint-stage-btn.complete{border-color:#22c55e44;color:#22c55e}
.osint-stage-btn.complete::after{content:'✓';font-size:.7rem}
.osint-stage-btn.locked{opacity:.4;cursor:not-allowed}

.osint-panel{display:none;animation:osintFade .3s ease}
.osint-panel.active{display:block}
@keyframes osintFade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}

.osint-stage-header{margin-bottom:1.5rem}
.osint-stage-header h2{color:#fff;font-size:1.2rem;display:flex;align-items:center;gap:.5rem}
.osint-stage-header p{color:#94a3b8;font-size:.85rem;margin-top:.35rem}

/* Terminal */
.osint-terminal{background:#0d1117;border:1px solid #21262d;border-radius:10px;overflow:hidden;margin-bottom:1rem;font-family:'Cascadia Code','Fira Code',monospace}
.osint-terminal-bar{background:#161b22;padding:.5rem 1rem;display:flex;align-items:center;gap:.5rem;border-bottom:1px solid #21262d}
.osint-terminal-dot{width:10px;height:10px;border-radius:50%}
.osint-terminal-bar .title{color:#8b949e;font-size:.75rem;margin-left:.5rem}
.osint-terminal-body{padding:1rem;max-height:400px;overflow-y:auto;font-size:.8rem;line-height:1.6}
.osint-terminal-body .prompt{color:${ACCENT}}
.osint-terminal-body .cmd{color:#e2e8f0}
.osint-terminal-body .output{color:#8b949e;white-space:pre-wrap}

.osint-tool-btns{display:flex;gap:.5rem;margin-bottom:1rem;flex-wrap:wrap}
.osint-tool-btn{padding:.5rem 1rem;border:1px solid ${ACCENT}33;border-radius:8px;background:${ACCENT}08;color:${ACCENT};font-size:.8rem;cursor:pointer;transition:all .2s;font-family:monospace}
.osint-tool-btn:hover{background:${ACCENT}15;border-color:${ACCENT}66}
.osint-tool-btn.used{border-color:#22c55e44;color:#22c55e;background:#22c55e08}
.osint-tool-btn .desc{color:#64748b;font-size:.7rem;font-family:'Segoe UI',sans-serif;display:block;margin-top:2px}

/* Clues */
.osint-clues{margin-top:1rem}
.osint-clue-list{list-style:none;display:flex;flex-direction:column;gap:.35rem}
.osint-clue{padding:.5rem .75rem;background:${ACCENT}06;border:1px solid ${ACCENT}22;border-radius:6px;font-size:.8rem;color:#cbd5e1;display:flex;align-items:flex-start;gap:.5rem}
.osint-clue::before{content:'';display:inline-block;width:1.1em;height:1.1em;background:url(/assets/images/icons/icon-magnifier.webp) center/contain no-repeat;vertical-align:middle;font-size:.7rem;flex-shrink:0;margin-top:2px}
.osint-clue.new{animation:clueFlash .5s ease}
@keyframes clueFlash{0%{background:${ACCENT}22}100%{background:${ACCENT}06}}

/* Questions */
.osint-question{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1.25rem;margin-bottom:.75rem}
.osint-q-text{color:#e2e8f0;font-size:.88rem;line-height:1.5;margin-bottom:.75rem}
.osint-q-opt{display:block;width:100%;text-align:left;padding:.55rem .85rem;margin-bottom:.3rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:6px;color:#cbd5e1;font-size:.82rem;cursor:pointer;transition:all .15s}
.osint-q-opt:hover:not(.answered){background:rgba(255,255,255,.06)}
.osint-q-opt.correct{background:#22c55e12;border-color:#22c55e55;color:#22c55e}
.osint-q-opt.wrong{background:#ef444412;border-color:#ef444455;color:#ef4444}
.osint-q-opt.right-answer{border-color:#22c55e33}
.osint-q-hint{font-size:.75rem;color:#64748b;margin-top:.5rem;font-style:italic}
.osint-q-hint.show{color:${ACCENT}}

/* Report */
.osint-report-section{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.06);border-radius:10px;padding:1.5rem;margin-bottom:1rem}
.osint-report-section h3{color:#fff;font-size:1rem;margin-bottom:.75rem}
.osint-report-option{display:block;width:100%;text-align:left;padding:.65rem 1rem;margin-bottom:.35rem;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:8px;color:#cbd5e1;font-size:.85rem;cursor:pointer;transition:all .15s}
.osint-report-option:hover{background:rgba(255,255,255,.06)}
.osint-report-option.selected{background:${ACCENT}12;border-color:${ACCENT}44;color:${ACCENT}}
.osint-report-option .desc{font-size:.75rem;color:#64748b;margin-top:2px}

.osint-finding{display:flex;align-items:flex-start;gap:.5rem;padding:.5rem .75rem;margin-bottom:.35rem;background:rgba(255,255,255,.02);border-radius:6px;font-size:.82rem;color:#94a3b8}
.osint-finding.critical{border-left:3px solid #ef4444}
.osint-finding.high{border-left:3px solid #f97316}
.osint-finding.medium{border-left:3px solid #eab308}
.osint-finding.low{border-left:3px solid #22c55e}
.osint-priority{font-size:.65rem;font-weight:700;padding:1px 6px;border-radius:4px;flex-shrink:0}
.osint-priority.CRITICAL{background:#ef444422;color:#ef4444}
.osint-priority.HIGH{background:#f9731622;color:#f97316}
.osint-priority.MEDIUM{background:#eab30822;color:#eab308}
.osint-priority.LOW{background:#22c55e22;color:#22c55e}

.osint-clue-count{display:inline-flex;align-items:center;gap:.35rem;background:${ACCENT}12;color:${ACCENT};padding:3px 10px;border-radius:12px;font-size:.75rem;font-weight:600;margin-top:.75rem}

.osint-next-btn{background:${ACCENT}22;color:${ACCENT};border:1px solid ${ACCENT}44;padding:.6rem 1.5rem;border-radius:8px;cursor:pointer;font-size:.85rem;font-weight:500;transition:all .2s;margin-top:1rem}
.osint-next-btn:hover{background:${ACCENT}33}

.osint-back{display:inline-flex;align-items:center;gap:.4rem;color:#64748b;text-decoration:none;font-size:.82rem;margin-bottom:1rem;transition:color .2s}
.osint-back:hover{color:${ACCENT}}

@media(max-width:640px){
    #osint-root{padding:.75rem}
    .osint-header{padding:1rem 1.25rem}
    .osint-header h1{font-size:1.2rem}
    .osint-stage-btn{min-width:0;font-size:.7rem;padding:.5rem .5rem}
    .osint-terminal-body{font-size:.72rem}
}
</style>

<a class="osint-back" href="../../../index.html">‹ Back to Shield House</a>

<div class="osint-header">
    <h1><img src="/assets/images/icons/icon-magnifier.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> OSINT Investigation Lab</h1>
    <div class="subtitle">Open Source Intelligence — Passive Reconnaissance Exercise</div>
    <div class="target"><strong>Target:</strong> MeridianTech Corporation — Defense contractor, Tysons Corner, VA</div>
    <div class="target"><strong>Objective:</strong> Gather intelligence using only publicly available sources. Do not interact with target systems.</div>
    <div class="osint-clue-count" id="clueCounter"><img src="/assets/images/icons/icon-magnifier.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> ${state.clues.length} clues collected</div>
</div>

<div class="osint-stages" id="stageNav"></div>
<div id="stageContent"></div>
`;
        if (!document.getElementById('osint-root')) document.body.appendChild(root);
        renderStageNav();
        renderStage(state.currentStage);
    }

    function renderStageNav() {
        const state = getState();
        const nav = document.getElementById('stageNav');
        nav.innerHTML = STAGES.map((s, i) => {
            const isComplete = state.stageProgress[i] && state.stageProgress[i].complete;
            const isCurrent = i === state.currentStage;
            const isLocked = i > 0 && !state.stageProgress[i - 1]?.complete && i !== state.currentStage;
            let cls = 'osint-stage-btn';
            if (isCurrent) cls += ' active';
            if (isComplete) cls += ' complete';
            if (isLocked) cls += ' locked';
            return `<button class="${cls}" data-stage="${i}">${s.icon} ${s.title}</button>`;
        }).join('');

        nav.querySelectorAll('.osint-stage-btn:not(.locked)').forEach(btn => {
            btn.addEventListener('click', () => {
                const st = getState();
                st.currentStage = parseInt(btn.dataset.stage);
                saveState(st);
                renderStageNav();
                renderStage(st.currentStage);
            });
        });
    }

    function renderStage(idx) {
        const stage = STAGES[idx];
        const state = getState();
        const content = document.getElementById('stageContent');

        if (stage.isReport) {
            renderReport(stage);
            return;
        }

        const progress = state.stageProgress[idx] || { toolsUsed: [], answersGiven: {} };

        content.innerHTML = `
            <div class="osint-panel active">
                <div class="osint-stage-header">
                    <h2>${stage.icon} Stage ${idx + 1}: ${stage.title}</h2>
                    <p>${stage.description}</p>
                </div>

                <div class="osint-tool-btns" id="toolBtns">
                    ${stage.tools.map((t, ti) => `
                        <button class="osint-tool-btn ${progress.toolsUsed.includes(ti) ? 'used' : ''}" data-tool="${ti}">
                            $ ${t.syntax}
                            <span class="desc">${t.description}</span>
                        </button>
                    `).join('')}
                </div>

                <div class="osint-terminal" id="terminal">
                    <div class="osint-terminal-bar">
                        <div class="osint-terminal-dot" style="background:#ff5f56"></div>
                        <div class="osint-terminal-dot" style="background:#ffbd2e"></div>
                        <div class="osint-terminal-dot" style="background:#27c93f"></div>
                        <span class="title">OSINT Terminal — Stage ${idx + 1}</span>
                    </div>
                    <div class="osint-terminal-body" id="terminalBody">
                        <span class="prompt">agent@hexworth</span>:<span class="cmd">~$ </span><span class="output">Select a tool above to execute...</span>
                    </div>
                </div>

                <div class="osint-clues" id="cluePanel" style="${progress.toolsUsed.length ? '' : 'display:none'}">
                    <h3 style="color:${ACCENT};font-size:.9rem;margin-bottom:.5rem">Clues Discovered</h3>
                    <ul class="osint-clue-list" id="clueList"></ul>
                </div>

                <div id="questionsPanel" style="${progress.toolsUsed.length >= stage.tools.length ? '' : 'display:none'}">
                    <h3 style="color:#fff;font-size:1rem;margin:1.5rem 0 .75rem">Analysis Questions</h3>
                    ${stage.questions.map((q, qi) => renderStageQuestion(q, qi, progress.answersGiven)).join('')}
                </div>

                <div id="nextPanel" style="display:none">
                    <button class="osint-next-btn" id="nextStageBtn">Continue to ${idx < STAGES.length - 1 ? 'Stage ' + (idx + 2) + ': ' + STAGES[idx + 1].title : 'Intelligence Report'} →</button>
                </div>
            </div>
        `;

        // Render existing clues
        renderClueList(idx, progress);

        // Check if stage is already complete
        checkStageComplete(idx);

        // Tool buttons
        content.querySelectorAll('.osint-tool-btn').forEach(btn => {
            btn.addEventListener('click', () => executeTool(idx, parseInt(btn.dataset.tool)));
        });

        // Question options
        content.querySelectorAll('.osint-q-opt:not(.answered)').forEach(btn => {
            btn.addEventListener('click', () => {
                answerStageQuestion(idx, parseInt(btn.dataset.qi), parseInt(btn.dataset.oi));
            });
        });

        // Next button
        const nextBtn = document.getElementById('nextStageBtn');
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                const st = getState();
                st.currentStage = Math.min(idx + 1, STAGES.length - 1);
                saveState(st);
                renderStageNav();
                renderStage(st.currentStage);
            });
        }
    }

    function executeTool(stageIdx, toolIdx) {
        const stage = STAGES[stageIdx];
        const tool = stage.tools[toolIdx];
        const state = getState();
        if (!state.stageProgress[stageIdx]) state.stageProgress[stageIdx] = { toolsUsed: [], answersGiven: {} };
        const progress = state.stageProgress[stageIdx];

        if (!progress.toolsUsed.includes(toolIdx)) {
            progress.toolsUsed.push(toolIdx);
            tool.clues.forEach(c => {
                if (!state.clues.includes(c)) state.clues.push(c);
            });
            saveState(state);
        }

        // Update terminal
        const body = document.getElementById('terminalBody');
        body.innerHTML = `<span class="prompt">agent@hexworth</span>:<span class="cmd">~$ ${tool.syntax}</span>\n<span class="output">${tool.output}</span>\n\n<span class="prompt">agent@hexworth</span>:<span class="cmd">~$ </span>`;
        body.scrollTop = body.scrollHeight;

        // Mark button as used
        const btn = document.querySelector(`.osint-tool-btn[data-tool="${toolIdx}"]`);
        if (btn) btn.classList.add('used');

        // Show clue panel
        document.getElementById('cluePanel').style.display = '';
        renderClueList(stageIdx, state.stageProgress[stageIdx]);

        // Update clue counter
        document.getElementById('clueCounter').innerHTML = '<img src="/assets/images/icons/icon-magnifier.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> ' + state.clues.length + ' clues collected';

        // Show questions if all tools used
        if (progress.toolsUsed.length >= stage.tools.length) {
            document.getElementById('questionsPanel').style.display = '';
        }

        checkStageComplete(stageIdx);
    }

    function renderClueList(stageIdx, progress) {
        const stage = STAGES[stageIdx];
        const list = document.getElementById('clueList');
        if (!list) return;
        const allClues = [];
        progress.toolsUsed.forEach(ti => {
            stage.tools[ti].clues.forEach(c => allClues.push(c));
        });
        list.innerHTML = allClues.map(c => `<li class="osint-clue">${c}</li>`).join('');
    }

    function renderStageQuestion(q, qi, answers) {
        const answered = qi in answers;
        const userAnswer = answers[qi];
        return `
        <div class="osint-question">
            <div class="osint-q-text">${q.q}</div>
            ${q.options.map((opt, oi) => {
                let cls = 'osint-q-opt';
                if (answered) {
                    cls += ' answered';
                    if (oi === q.correct) cls += ' correct right-answer';
                    else if (oi === userAnswer && oi !== q.correct) cls += ' wrong';
                }
                return `<button class="${cls}" data-qi="${qi}" data-oi="${oi}">${opt}</button>`;
            }).join('')}
            ${answered ? `<div class="osint-q-hint show"><img src="/assets/images/icons/icon-lightning.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> ${q.hint}</div>` : ''}
        </div>`;
    }

    function answerStageQuestion(stageIdx, qi, oi) {
        const state = getState();
        const progress = state.stageProgress[stageIdx];
        if (!progress) return;
        if (qi in progress.answersGiven) return;
        progress.answersGiven[qi] = oi;
        saveState(state);
        renderStage(stageIdx);
    }

    function checkStageComplete(stageIdx) {
        const state = getState();
        const stage = STAGES[stageIdx];
        const progress = state.stageProgress[stageIdx] || { toolsUsed: [], answersGiven: {} };
        const allToolsUsed = progress.toolsUsed.length >= stage.tools.length;
        const allAnswered = Object.keys(progress.answersGiven).length >= stage.questions.length;

        if (allToolsUsed && allAnswered) {
            progress.complete = true;
            saveState(state);
            const nextPanel = document.getElementById('nextPanel');
            if (nextPanel) nextPanel.style.display = '';
            renderStageNav();
        }
    }

    /* ── Report Stage ── */
    function renderReport(stage) {
        const state = getState();
        const reportState = state.reportAnswers || {};
        const content = document.getElementById('stageContent');

        content.innerHTML = `
            <div class="osint-panel active">
                <div class="osint-stage-header">
                    <h2>${stage.icon} ${stage.title}</h2>
                    <p>${stage.description}</p>
                    <div class="osint-clue-count" style="margin-top:.75rem"><img src="/assets/images/icons/icon-magnifier.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> ${state.clues.length} total clues collected across all stages</div>
                </div>

                ${stage.sections.map((sec, si) => renderReportSection(sec, si, reportState)).join('')}

                <div id="reportComplete" style="display:${isReportComplete(reportState) ? '' : 'none'}">
                    <div style="text-align:center;padding:2rem;background:rgba(34,211,238,.05);border:1px solid ${ACCENT}33;border-radius:12px;margin-top:1.5rem">
                        <div style="font-size:2.5rem;margin-bottom:.5rem"><img src="/assets/images/icons/icon-trophy.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"></div>
                        <div style="font-size:1.2rem;color:#fff;font-weight:600;margin-bottom:.25rem">Investigation Complete</div>
                        <div style="color:#94a3b8;font-size:.85rem">You've completed the MeridianTech OSINT investigation. Your intelligence report has been filed.</div>
                    </div>
                </div>
            </div>
        `;

        // Bind report interactions
        content.querySelectorAll('.osint-report-option').forEach(btn => {
            btn.addEventListener('click', () => {
                const si = parseInt(btn.dataset.si);
                const val = btn.dataset.value;
                const st = getState();
                if (!st.reportAnswers) st.reportAnswers = {};
                st.reportAnswers[si] = val;
                saveState(st);
                renderReport(stage);
                if (isReportComplete(st.reportAnswers)) {
                    recordOSINTScore(st);
                }
            });
        });
    }

    function renderReportSection(sec, si, reportState) {
        if (sec.options) {
            const selected = reportState[si];
            return `
            <div class="osint-report-section">
                <h3>${sec.title}</h3>
                <p style="color:#94a3b8;font-size:.85rem;margin-bottom:1rem">${sec.prompt}</p>
                ${sec.options.map(opt => `
                    <button class="osint-report-option ${selected === opt.value ? 'selected' : ''}" data-si="${si}" data-value="${opt.value}">
                        <strong>${opt.label}</strong>
                        <div class="desc">${opt.desc}</div>
                    </button>
                `).join('')}
                ${selected ? `<div style="margin-top:.75rem;padding:.75rem 1rem;background:${ACCENT}08;border-left:3px solid ${ACCENT}66;border-radius:0 6px 6px 0;color:#94a3b8;font-size:.82rem">${sec.explanation}</div>` : ''}
            </div>`;
        }

        if (sec.findings) {
            return `
            <div class="osint-report-section">
                <h3>${sec.title}</h3>
                <p style="color:#94a3b8;font-size:.85rem;margin-bottom:1rem">${sec.prompt}</p>
                ${sec.findings.map((f, fi) => `
                    <div class="osint-finding ${sec.topPicks.includes(fi) ? 'critical' : ''}">
                        <span style="color:${ACCENT};font-weight:600;min-width:16px">${fi + 1}.</span> ${f}
                        ${sec.topPicks.includes(fi) ? '<span style="color:#ef4444;font-size:.7rem;margin-left:auto"><img src="/assets/images/icons/icon-star.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> TOP 5</span>' : ''}
                    </div>
                `).join('')}
            </div>`;
        }

        if (sec.recommendations) {
            return `
            <div class="osint-report-section">
                <h3>${sec.title}</h3>
                <p style="color:#94a3b8;font-size:.85rem;margin-bottom:1rem">${sec.prompt}</p>
                ${sec.recommendations.map(r => `
                    <div class="osint-finding ${r.priority.toLowerCase()}">
                        <span class="osint-priority ${r.priority}">${r.priority}</span>
                        ${r.text}
                    </div>
                `).join('')}
            </div>`;
        }

        return '';
    }

    function isReportComplete(reportState) {
        return reportState && reportState[0];
    }

    function recordOSINTScore(state) {
        const totalClues = 0;
        STAGES.forEach(s => { if (s.tools) s.tools.forEach(t => { totalClues + t.clues.length; }); });
        let correctAnswers = 0;
        let totalQuestions = 0;
        STAGES.forEach((s, si) => {
            if (s.questions) {
                s.questions.forEach((q, qi) => {
                    totalQuestions++;
                    const progress = state.stageProgress[si];
                    if (progress && progress.answersGiven[qi] === q.correct) correctAnswers++;
                });
            }
        });

        if (typeof GameTracker !== 'undefined') {
            try {
                GameTracker.record('osint-lab', {
                    result: correctAnswers / totalQuestions >= 0.6 ? 'success' : 'failure',
                    score: correctAnswers,
                    maxScore: totalQuestions,
                    cluesFound: state.clues.length
                });
            } catch(e) {}
        }

        try {
            const progress = JSON.parse(localStorage.getItem('hexworth_progress') || '{}');
            if (!progress.shield) progress.shield = {};
            progress.shield['osint-lab'] = {
                completed: true,
                score: correctAnswers,
                total: totalQuestions,
                clues: state.clues.length,
                timestamp: Date.now()
            };
            localStorage.setItem('hexworth_progress', JSON.stringify(progress));
        } catch(e) {}
    }

    return { init };
})();
