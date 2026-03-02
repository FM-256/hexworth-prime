/**
 * RiskManagementData.js — Risk management topic data
 *
 * 5 topics covering risk analysis, management, configuration, PSPG, and scenarios
 * Used by RiskManagementRenderer.js
 */
const RiskManagementData = {

    // ═══════════════════════════════════════════════════════════════════
    // RISK MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════
    risk_management: {
        id: 'risk_management',
        name: 'Risk Management',
        icon: '/assets/images/icons/icon-scales.webp',
        color: '#a855f7',
        subtitle: 'Identify, assess, mitigate, monitor',
        description: 'Risk management is the systematic process of identifying, assessing, and controlling threats to an organization\'s assets. It forms the foundation of every security program and drives resource allocation decisions.',
        keyConcepts: ['Risk Identification', 'Risk Assessment', 'Risk Mitigation', 'Risk Acceptance', 'Risk Transference', 'Risk Avoidance', 'Residual Risk'],
        sections: [
            {
                title: 'Risk Concepts',
                icon: '/assets/images/icons/icon-target.webp',
                content: 'Understanding core risk terminology is essential before diving into the risk management process.',
                details: ['Threat: any potential danger that could exploit a vulnerability', 'Vulnerability: a weakness that could be exploited', 'Risk: the likelihood of a threat exploiting a vulnerability AND its impact', 'Risk = Threat x Vulnerability x Impact (conceptual formula)', 'Asset: anything of value to the organization (data, systems, people, reputation)', 'Exposure: the potential loss when a threat exploits a vulnerability', 'Countermeasure / Control: a measure taken to reduce risk'],
                realWorld: 'A company runs an unpatched web server (vulnerability) facing the internet. An APT group is targeting their industry (threat). The server hosts customer PII (asset). The risk is quantified as HIGH because a breach would cost millions in fines and reputation damage (impact).'
            },
            {
                title: 'Risk Response Strategies',
                icon: '/assets/images/icons/icon-shield.webp',
                content: 'After assessing risk, organizations must choose how to respond. There are four primary strategies for handling risk.',
                details: ['Mitigation (Reduction): implement controls to reduce risk to acceptable level', 'Acceptance: acknowledge the risk and choose to live with it (cost of control > potential loss)', 'Transference (Sharing): shift risk to a third party (insurance, outsourcing, SLAs)', 'Avoidance: eliminate the risk by eliminating the activity or asset', 'Residual Risk: risk remaining after controls are applied (can never be zero)', 'Risk appetite/tolerance: level of risk the organization is willing to accept'],
                realWorld: 'A company faces the risk of data breach from their aging on-premises email server. They mitigate (encrypt data, patch regularly), transfer (purchase cyber insurance), and partially avoid (migrate to Microsoft 365, eliminating the on-premises server). The residual risk from M365 is accepted as within their risk tolerance.'
            },
            {
                title: 'Risk Assessment Methods',
                icon: '/assets/images/icons/icon-barchart.webp',
                content: 'Risk assessments can be qualitative (subjective ratings), quantitative (dollar values), or a combination of both.',
                details: ['Qualitative: uses descriptive scales (High/Medium/Low)', 'Risk matrix: plots likelihood vs. impact on a grid', 'Quantitative: assigns dollar values to risk', 'AV (Asset Value): dollar value of the asset', 'EF (Exposure Factor): percentage of asset lost in an incident (0-100%)', 'SLE (Single Loss Expectancy): AV x EF', 'ARO (Annualized Rate of Occurrence): how often per year', 'ALE (Annualized Loss Expectancy): SLE x ARO'],
                realWorld: 'A server worth $50,000 (AV) with a 40% exposure factor (EF) has an SLE of $20,000. If the risk event occurs twice per year (ARO=2), the ALE is $40,000. A $25,000 annual control that eliminates the risk is cost-justified because $25K < $40K ALE.'
            },
            {
                title: 'Risk Management Frameworks',
                icon: '/assets/images/icons/icon-scroll.webp',
                content: 'Industry frameworks provide structured approaches to risk management that organizations can adopt and customize.',
                details: ['NIST RMF (800-37): Categorize, Select, Implement, Assess, Authorize, Monitor', 'NIST CSF: Identify, Protect, Detect, Respond, Recover', 'ISO 27005: risk management for information security', 'FAIR: quantitative risk analysis framework (Factor Analysis of Information Risk)', 'OCTAVE: self-directed risk assessment developed by CERT/CC', 'COBIT: governance framework linking IT to business objectives'],
                realWorld: 'A federal agency follows NIST RMF: they categorize their systems (FIPS 199), select controls from NIST 800-53, implement the controls, assess their effectiveness through testing, authorize the system to operate (ATO), and continuously monitor for changes and new threats.'
            }
        ],
        interactive: {
            type: 'scenario_matcher',
            title: 'Risk Response Decision Engine',
            instructions: 'Choose the most appropriate risk response for each scenario.',
            items: [
                { scenario: 'The cost of a firewall ($5,000/yr) is less than the ALE of the threat it mitigates ($50,000/yr).', answer: 'Mitigate (implement the firewall)', explanation: 'When the control cost is less than the expected loss, mitigation is cost-justified.' },
                { scenario: 'A company purchases cyber insurance to cover potential breach costs.', answer: 'Transfer (insurance)', explanation: 'Insurance transfers the financial impact of a risk to the insurance company.' },
                { scenario: 'After implementing all reasonable controls, some risk remains. Management signs off.', answer: 'Accept (residual risk)', explanation: 'Residual risk is accepted when it falls within the organization\'s risk tolerance and further controls are not cost-effective.' },
                { scenario: 'A company decides not to offer a risky new service because the potential liability exceeds the revenue.', answer: 'Avoid (eliminate the activity)', explanation: 'Avoidance eliminates the risk by not engaging in the risky activity.' },
                { scenario: 'A server has an ALE of $500 and the cheapest control costs $10,000/year.', answer: 'Accept (control cost exceeds expected loss)', explanation: 'When the cost of mitigation exceeds the expected loss, accepting the risk is the rational business decision.' },
                { scenario: 'A company outsources payment processing to a PCI-compliant third party.', answer: 'Transfer (outsource to specialist)', explanation: 'Outsourcing payment processing transfers PCI compliance risk (and associated breach risk) to the specialized provider.' }
            ]
        },
        quiz: [
            { question: 'What is the formula for Annualized Loss Expectancy (ALE)?', options: ['AV x EF', 'SLE x ARO', 'Threat x Vulnerability', 'AV x ARO'], correct: 1, explanation: 'ALE = SLE x ARO. Single Loss Expectancy multiplied by the Annualized Rate of Occurrence gives the expected annual loss.' },
            { question: 'A server worth $100,000 has an EF of 50% and ARO of 0.5. What is the ALE?', options: ['$50,000', '$25,000', '$100,000', '$75,000'], correct: 1, explanation: 'SLE = $100,000 x 0.50 = $50,000. ALE = $50,000 x 0.5 = $25,000 per year.' },
            { question: 'What type of risk remains after all controls are implemented?', options: ['Inherent risk', 'Residual risk', 'Transferred risk', 'Avoided risk'], correct: 1, explanation: 'Residual risk is the risk that remains after all controls and mitigation strategies have been applied. It can never be reduced to zero.' },
            { question: 'When is risk acceptance the appropriate response?', options: ['Always', 'When the cost of mitigation exceeds the expected loss', 'Never, all risks must be mitigated', 'Only for critical systems'], correct: 1, explanation: 'Risk acceptance is appropriate when the cost of controls exceeds the expected loss, or when the residual risk falls within the organization\'s defined risk tolerance.' },
            { question: 'Which NIST framework provides a six-step risk management process for federal systems?', options: ['NIST CSF', 'NIST RMF (800-37)', 'NIST 800-53', 'NIST 800-171'], correct: 1, explanation: 'NIST RMF (Risk Management Framework, SP 800-37) defines six steps: Categorize, Select, Implement, Assess, Authorize, Monitor.' },
            { question: 'What is the difference between qualitative and quantitative risk assessment?', options: ['Qualitative is faster; quantitative is slower', 'Qualitative uses descriptive ratings (H/M/L); quantitative assigns dollar values', 'There is no difference', 'Qualitative is for IT; quantitative is for business'], correct: 1, explanation: 'Qualitative uses subjective scales (High/Medium/Low), while quantitative assigns specific dollar values (AV, SLE, ALE) to calculate risk in financial terms.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // RISK ANALYSIS
    // ═══════════════════════════════════════════════════════════════════
    risk_analysis: {
        id: 'risk_analysis',
        name: 'Risk Analysis',
        icon: '/assets/images/icons/icon-barchart.webp',
        color: '#a855f7',
        subtitle: 'Quantitative & qualitative risk assessment techniques',
        description: 'Risk analysis is the process of estimating the likelihood and impact of potential threats. Both qualitative and quantitative methods provide different but complementary views of organizational risk.',
        keyConcepts: ['AV', 'SLE', 'ARO', 'ALE', 'EF', 'Risk Matrix', 'FAIR', 'Cost-Benefit Analysis'],
        sections: [
            {
                title: 'Quantitative Risk Analysis',
                icon: '/assets/images/icons/icon-money.webp',
                content: 'Assigns specific dollar values to assets, threats, and losses. Provides objective, measurable data for risk-based decisions.',
                details: ['Asset Value (AV): total value of the asset in dollars', 'Exposure Factor (EF): percentage of asset lost (0% to 100%)', 'Single Loss Expectancy (SLE) = AV x EF', 'Annualized Rate of Occurrence (ARO): expected frequency per year', 'Annualized Loss Expectancy (ALE) = SLE x ARO', 'Cost-benefit: control is justified when annual cost < (ALE_before - ALE_after)'],
                realWorld: 'A database server (AV=$200K) faces ransomware risk. EF=60% (data loss + downtime). SLE=$120K. Ransomware hits similar companies once every two years (ARO=0.5). ALE=$60K/year. A $40K/year backup solution that reduces EF to 5% brings ALE down to $5K. Savings: $60K-$5K-$40K = $15K/year net benefit.'
            },
            {
                title: 'Qualitative Risk Analysis',
                icon: '/assets/images/icons/icon-target.webp',
                content: 'Uses subjective rating scales and expert judgment to assess risk. Faster and easier than quantitative but less precise.',
                details: ['Uses categories: High, Medium, Low (or 1-5 scales)', 'Risk matrix: plots Likelihood (rows) vs. Impact (columns)', 'Delphi technique: anonymous expert consensus', 'Brainstorming: open group identification of risks', 'Interviews: one-on-one expert assessment', 'Best for initial screening when quantitative data is unavailable'],
                realWorld: 'A startup with no historical data conducts a qualitative risk assessment using a 5x5 matrix. They rate "cloud account compromise" as Likelihood=4, Impact=5, giving a risk score of 20 (Critical). This prioritizes MFA implementation even without dollar figures.'
            },
            {
                title: 'Risk Matrix & Heat Maps',
                icon: '/assets/images/icons/icon-map.webp',
                content: 'Visual tools that display risk levels across multiple threats, helping leadership understand the overall risk landscape at a glance.',
                details: ['5x5 matrix: Likelihood (1-5) x Impact (1-5) = Risk Score (1-25)', 'Color coding: Green (1-4 Low), Yellow (5-12 Medium), Orange (13-16 High), Red (17-25 Critical)', 'Heat maps show risk distribution across business units or threat categories', 'Risk register: document listing all identified risks with scores, owners, and treatment plans', 'Risk appetite line: the threshold above which risks must be treated'],
                realWorld: 'A CISO presents a risk heat map to the board showing 3 critical risks (red), 12 high risks (orange), and 25 medium risks (yellow). The board authorizes budget for the three critical items and reviews the high-risk items quarterly.'
            },
            {
                title: 'FAIR Framework',
                icon: '/assets/images/icons/icon-memory.webp',
                content: 'Factor Analysis of Information Risk (FAIR) is a quantitative framework that decomposes risk into measurable factors.',
                details: ['Loss Event Frequency: how often a loss is expected', 'Threat Event Frequency: how often threats act against assets', 'Vulnerability: probability a threat succeeds', 'Loss Magnitude: the financial impact of a loss event', 'Primary Loss: direct costs (response, recovery, replacement)', 'Secondary Loss: indirect costs (fines, reputation, customer loss)', 'FAIR provides a structured decomposition for complex risk scenarios'],
                realWorld: 'Using FAIR, an analyst estimates: Threat events against the web app occur 100 times/year. The app is vulnerable 5% of the time (patching lag). Loss events = 5/year. Average primary loss = $50K, secondary loss = $100K. Risk = 5 x $150K = $750K/year, justifying a $500K security investment.'
            }
        ],
        interactive: {
            type: 'scenario_matcher',
            title: 'Risk Calculation Workshop',
            instructions: 'Solve each risk analysis problem.',
            items: [
                { scenario: 'AV = $500,000, EF = 20%. What is the SLE?', answer: '$100,000', explanation: 'SLE = AV x EF = $500,000 x 0.20 = $100,000.' },
                { scenario: 'SLE = $100,000, ARO = 0.25. What is the ALE?', answer: '$25,000', explanation: 'ALE = SLE x ARO = $100,000 x 0.25 = $25,000.' },
                { scenario: 'ALE before control = $80,000. ALE after control = $10,000. Control costs $50,000/year.', answer: 'Implement (net savings $20,000/year)', explanation: 'Net benefit = ($80K - $10K) - $50K = $20K/year savings. The control is cost-justified.' },
                { scenario: 'A risk has Likelihood=5 and Impact=4 on a 5x5 matrix. What is the risk score?', answer: '20 (Critical)', explanation: 'Risk Score = 5 x 4 = 20, which falls in the Critical (red) zone of a standard 5x5 matrix.' },
                { scenario: 'ALE before = $30,000. Control costs $40,000/year.', answer: 'Do NOT implement (control costs more than the risk)', explanation: 'The control costs $40K but only eliminates $30K of risk. It is not cost-justified.' },
                { scenario: 'A database has AV=$1M, EF=100%, ARO=0.01. What is the ALE?', answer: '$10,000', explanation: 'SLE = $1M x 1.0 = $1M. ALE = $1M x 0.01 = $10,000. Despite catastrophic impact, the low probability keeps ALE manageable.' }
            ]
        },
        quiz: [
            { question: 'SLE stands for:', options: ['System Loss Estimate', 'Single Loss Expectancy', 'Security Level Evaluation', 'Standard Loss Exposure'], correct: 1, explanation: 'SLE = Single Loss Expectancy, the expected monetary loss each time a risk event occurs (AV x EF).' },
            { question: 'If AV = $200,000 and EF = 30%, what is the SLE?', options: ['$60,000', '$140,000', '$200,000', '$30,000'], correct: 0, explanation: 'SLE = AV x EF = $200,000 x 0.30 = $60,000.' },
            { question: 'When is qualitative risk analysis preferred over quantitative?', options: ['Always', 'When precise dollar values are available', 'When historical data is limited and quick prioritization is needed', 'Never, quantitative is always better'], correct: 2, explanation: 'Qualitative analysis is preferred when historical data is limited, when quick initial assessment is needed, or when precise dollar values are impractical to determine.' },
            { question: 'A control costs $25,000/year. ALE before = $60,000, ALE after = $15,000. Is it justified?', options: ['Yes, net savings = $20,000/year', 'No, the control is too expensive', 'Not enough information', 'Only if the ARO increases'], correct: 0, explanation: 'Savings = ($60K - $15K) - $25K = $20K/year. The control saves $20K more than it costs annually.' },
            { question: 'In the FAIR framework, what two factors compose Loss Event Frequency?', options: ['AV and EF', 'Threat Event Frequency and Vulnerability', 'Likelihood and Impact', 'SLE and ARO'], correct: 1, explanation: 'FAIR decomposes Loss Event Frequency into Threat Event Frequency (how often threats act) multiplied by Vulnerability (probability the threat succeeds).' },
            { question: 'What is a risk register?', options: ['A hardware device that detects threats', 'A document listing all identified risks with their scores, owners, and treatment plans', 'A type of firewall log', 'A regulatory compliance form'], correct: 1, explanation: 'A risk register is a central document that tracks all identified risks, their assessment scores, assigned owners, mitigation plans, and status.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // CONFIGURATION MANAGEMENT
    // ═══════════════════════════════════════════════════════════════════
    config_management: {
        id: 'config_management',
        name: 'Configuration Management',
        icon: '/assets/images/icons/icon-gear.webp',
        color: '#a855f7',
        subtitle: 'Baselines, change control & configuration auditing',
        description: 'Configuration management ensures systems are deployed and maintained in a known, secure state. It encompasses baselines, change control, patch management, and configuration auditing.',
        keyConcepts: ['Baseline', 'Change Control', 'Patch Management', 'Hardening', 'CIS Benchmarks', 'SCCM', 'Golden Image'],
        sections: [
            {
                title: 'Configuration Baselines',
                icon: '/assets/images/icons/icon-ruler.webp',
                content: 'A baseline is a documented, approved configuration that serves as the standard for all deployments. Any deviation from baseline indicates potential drift or compromise.',
                details: ['Security baseline: minimum security configuration for a system type', 'CIS Benchmarks: industry-standard hardening guides for every OS/application', 'DISA STIGs: Department of Defense security technical implementation guides', 'Golden image: pre-configured, hardened OS image for rapid deployment', 'Configuration drift: gradual deviation from baseline over time', 'Automated tools detect and remediate drift (Puppet, Chef, Ansible)'],
                realWorld: 'An organization creates a golden Windows Server image based on CIS Level 2 benchmarks. Every new server is deployed from this image. Weekly scans compare running configurations against the baseline, and any drift (like a newly enabled service) triggers an alert and automatic remediation.'
            },
            {
                title: 'Change Management Process',
                icon: '/assets/images/icons/icon-notepad.webp',
                content: 'Formal change management ensures modifications are planned, tested, approved, and documented before implementation.',
                details: ['RFC (Request for Change): formal proposal describing the change', 'CAB (Change Advisory Board): reviews and approves/denies changes', 'Impact analysis: what could go wrong? what systems are affected?', 'Test in staging/dev environment first', 'Rollback plan: how to undo the change if it fails', 'Post-implementation review: verify the change achieved its goal', 'Emergency changes: expedited process for critical security patches'],
                realWorld: 'A sysadmin wants to upgrade the firewall firmware. They submit an RFC describing the change, impact analysis (30 minutes of potential connectivity loss), rollback plan (revert to current firmware), and a maintenance window. The CAB approves, and the change is implemented during the window with the rollback plan ready.'
            },
            {
                title: 'Patch Management',
                icon: '/assets/images/icons/icon-wrench.webp',
                content: 'Systematic process of identifying, testing, and applying software updates to fix vulnerabilities and bugs. One of the most critical operational security activities.',
                details: ['Vulnerability scanning identifies missing patches', 'Prioritize by CVSS score and exploitability', 'Test patches in staging before production deployment', 'Emergency patching for actively exploited vulnerabilities (zero-day)', 'Patch Tuesday: Microsoft releases patches second Tuesday monthly', 'Track patch compliance: % of systems fully patched', 'Virtual patching: WAF/IPS rules as temporary mitigation when patching is delayed'],
                realWorld: 'A critical zero-day CVE is published on Friday afternoon. The security team deploys virtual patches (WAF rules blocking the exploit pattern) within 2 hours. Over the weekend, they test the vendor patch in staging. Monday morning, the patch is rolled out to production with a 99.5% success rate.'
            },
            {
                title: 'System Hardening',
                icon: '/assets/images/icons/icon-shield.webp',
                content: 'Reducing the attack surface by removing unnecessary services, applying security configurations, and following the principle of least functionality.',
                details: ['Disable unnecessary services and ports', 'Remove default accounts and change default passwords', 'Enable audit logging and monitoring', 'Apply principle of least functionality', 'Encrypt data at rest and in transit', 'Configure host-based firewall', 'Regular vulnerability assessments to verify hardening effectiveness'],
                realWorld: 'A web server hardening checklist: disable FTP, SSH only via key auth, remove default IIS/Apache pages, configure TLS 1.2+ only, disable directory listing, set secure HTTP headers (HSTS, CSP, X-Frame-Options), enable SELinux in enforcing mode, and install EDR agent.'
            }
        ],
        interactive: {
            type: 'scenario_matcher',
            title: 'Configuration Management Scenarios',
            instructions: 'Identify the correct configuration management practice for each scenario.',
            items: [
                { scenario: 'A server running in production has different settings than the documented standard.', answer: 'Configuration drift (remediate to baseline)', explanation: 'When a system deviates from its baseline, this is configuration drift that must be detected and corrected.' },
                { scenario: 'A sysadmin wants to upgrade the database version on a production server.', answer: 'Submit RFC through change management', explanation: 'All production changes must go through the formal change management process with RFC, impact analysis, and CAB approval.' },
                { scenario: 'A critical vulnerability is being actively exploited in the wild.', answer: 'Emergency patch (expedited change process)', explanation: 'Actively exploited vulnerabilities justify emergency patching with an expedited approval process.' },
                { scenario: 'New servers are deployed with unnecessary services running by default.', answer: 'System hardening (apply security baseline)', explanation: 'Default installations include unnecessary services. Hardening removes them and applies the security baseline.' },
                { scenario: 'The organization needs standardized security configurations for all Windows servers.', answer: 'Adopt CIS Benchmarks / DISA STIGs', explanation: 'CIS Benchmarks and DISA STIGs provide tested, standardized security configurations for common platforms.' },
                { scenario: 'A change was deployed but caused unexpected application failures.', answer: 'Execute rollback plan', explanation: 'When a change causes problems, the pre-planned rollback procedure restores the system to its previous working state.' }
            ]
        },
        quiz: [
            { question: 'What is a "golden image" in configuration management?', options: ['A backup of the most valuable server', 'A pre-configured, hardened OS image used as the deployment standard', 'The original vendor installation media', 'A photo of the server rack for documentation'], correct: 1, explanation: 'A golden image is a pre-configured, hardened operating system image that serves as the standard template for all new server deployments.' },
            { question: 'What does the CAB do in change management?', options: ['Provides transportation for IT staff', 'Reviews, approves, or denies change requests', 'Installs patches automatically', 'Monitors network traffic'], correct: 1, explanation: 'The Change Advisory Board (CAB) is a group that reviews RFCs, assesses risk and impact, and approves or denies proposed changes.' },
            { question: 'What is configuration drift?', options: ['Moving servers to a new data center', 'Gradual deviation of system settings from the established baseline', 'A type of network attack', 'The speed at which configurations are applied'], correct: 1, explanation: 'Configuration drift occurs when system configurations gradually deviate from the approved baseline, often through ad-hoc changes, updates, or manual modifications.' },
            { question: 'Which industry standard provides hardening benchmarks for operating systems?', options: ['PCI-DSS', 'CIS Benchmarks', 'HIPAA', 'GDPR'], correct: 1, explanation: 'CIS (Center for Internet Security) Benchmarks provide detailed, tested security configuration guides for virtually every operating system and major application.' },
            { question: 'What is virtual patching?', options: ['Patching virtual machines only', 'Using WAF/IPS rules to block exploit patterns while a permanent patch is tested and deployed', 'Downloading patches from the internet', 'Patching without rebooting'], correct: 1, explanation: 'Virtual patching uses WAF or IPS rules to block known exploit patterns, providing protection while the actual software patch is being tested and deployed.' },
            { question: 'Why is a rollback plan essential for every change?', options: ['Regulatory requirement only', 'To quickly restore the system if the change causes problems', 'To create extra documentation', 'It is optional for minor changes'], correct: 1, explanation: 'A rollback plan ensures the organization can quickly restore the system to its previous working state if the change causes unexpected problems or failures.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // POLICIES, STANDARDS, PROCEDURES, GUIDELINES (PSPG)
    // ═══════════════════════════════════════════════════════════════════
    pspg: {
        id: 'pspg',
        name: 'Policies, Standards, Procedures & Guidelines',
        icon: '/assets/images/icons/icon-scroll.webp',
        color: '#a855f7',
        subtitle: 'The hierarchy of security governance documents',
        description: 'Security governance requires a hierarchy of documents that translate high-level business objectives into actionable security requirements. Understanding the differences between policies, standards, procedures, and guidelines is fundamental to security governance.',
        keyConcepts: ['Policy', 'Standard', 'Procedure', 'Guideline', 'Baseline', 'Governance', 'Compliance'],
        sections: [
            {
                title: 'Policies (What)',
                icon: '/assets/images/icons/icon-building.webp',
                content: 'Policies are high-level statements of management intent. They define WHAT must be done but not HOW. Approved by senior leadership, they are mandatory and enforceable.',
                details: ['Highest level of governance documents', 'Defined by executive management / board', 'Mandatory for all employees', 'Broad scope, technology-neutral', 'Example: "All company data must be classified and protected according to its sensitivity"', 'Types: organizational, issue-specific, system-specific', 'Reviewed annually or after significant changes'],
                realWorld: 'A company\'s Information Security Policy states: "All electronic communications containing sensitive data must be encrypted." This tells everyone WHAT to do but does not specify which encryption tool or algorithm to use.'
            },
            {
                title: 'Standards (How specific)',
                icon: '/assets/images/icons/icon-ruler.webp',
                content: 'Standards define specific, mandatory requirements for implementing policies. They specify WHICH technologies, configurations, or methods must be used.',
                details: ['Derived from policies, more specific', 'Mandatory compliance required', 'Technology-specific: names exact products, versions, settings', 'Example: "Email encryption must use TLS 1.2 or higher with AES-256"', 'Often based on industry standards (CIS, NIST, ISO)', 'Updated when technology changes'],
                realWorld: 'The encryption standard derived from the above policy states: "AES-256 must be used for data at rest. TLS 1.2+ for data in transit. RSA 2048+ for key exchange. All certificate must use SHA-256 signatures." This tells staff exactly which algorithms to use.'
            },
            {
                title: 'Procedures (How step-by-step)',
                icon: '/assets/images/icons/icon-clock.webp',
                content: 'Procedures are detailed, step-by-step instructions for performing a specific task. They tell the operator exactly HOW to do something.',
                details: ['Most detailed governance documents', 'Step-by-step instructions', 'Task-specific and role-specific', 'Mandatory for the roles they apply to', 'Example: "Step 1: Open GPO editor. Step 2: Navigate to... Step 3: Set encryption to AES-256..."', 'Include screenshots, commands, and expected results', 'Updated when processes or tools change'],
                realWorld: 'The procedure for enabling BitLocker encryption: "1. Open Control Panel > BitLocker. 2. Click Turn on BitLocker. 3. Select Password + TPM. 4. Back up recovery key to AD. 5. Choose Encrypt entire drive. 6. Select XTS-AES 256-bit. 7. Click Start Encrypting. 8. Verify encryption status shows 100%."'
            },
            {
                title: 'Guidelines (Recommendations)',
                icon: '/assets/images/icons/icon-lightning.webp',
                content: 'Guidelines are recommendations and best practices. They suggest what SHOULD be done but are NOT mandatory. They provide flexibility for judgment.',
                details: ['Advisory, not mandatory', 'Provide flexibility and recommendations', 'Example: "It is recommended to use a password manager for generating complex passwords"', 'Often provide multiple acceptable approaches', 'Help with decisions where rigid rules are impractical', 'Can become mandatory if adopted as standards'],
                realWorld: 'A password guideline recommends: "Consider using a password manager such as 1Password, Bitwarden, or KeePass. Passphrases of 16+ characters are preferred over complex 8-character passwords. Where supported, passwordless authentication (FIDO2) is recommended." The employee chooses which method fits their workflow.'
            }
        ],
        interactive: {
            type: 'scenario_matcher',
            title: 'Classify the Document',
            instructions: 'Identify whether each statement is a Policy, Standard, Procedure, or Guideline.',
            items: [
                { scenario: '"All company laptops must have full-disk encryption enabled."', answer: 'Policy', explanation: 'This is a high-level mandatory statement of WHAT must be done, without specifying how. It\'s a policy.' },
                { scenario: '"Laptop encryption must use BitLocker with XTS-AES 256-bit and TPM 2.0."', answer: 'Standard', explanation: 'This specifies exact technologies and configurations required. It\'s a standard.' },
                { scenario: '"Step 1: Right-click the drive. Step 2: Select Turn on BitLocker. Step 3: Choose TPM + PIN..."', answer: 'Procedure', explanation: 'Step-by-step instructions for a specific task. This is a procedure.' },
                { scenario: '"Consider using passphrases of 16+ characters for better security and memorability."', answer: 'Guideline', explanation: 'A recommendation using advisory language ("consider"). This is a guideline.' },
                { scenario: '"All remote access must use approved VPN technology."', answer: 'Policy', explanation: 'A mandatory requirement statement without specifying which VPN. This is a policy.' },
                { scenario: '"Remote VPN connections must use IKEv2 with AES-256 and SHA-512."', answer: 'Standard', explanation: 'Specific technology and configuration requirements. This is a standard.' }
            ]
        },
        quiz: [
            { question: 'Which governance document is the HIGHEST level and approved by executive management?', options: ['Procedure', 'Standard', 'Policy', 'Guideline'], correct: 2, explanation: 'Policies are the highest-level governance documents, approved by senior leadership, defining mandatory requirements.' },
            { question: 'A document states "Use AES-256 for all data at rest encryption." This is a:', options: ['Policy', 'Standard', 'Procedure', 'Guideline'], correct: 1, explanation: 'This specifies a particular technology and configuration (AES-256), making it a standard.' },
            { question: 'Which document type is NOT mandatory?', options: ['Policy', 'Standard', 'Procedure', 'Guideline'], correct: 3, explanation: 'Guidelines are recommendations and best practices. They are advisory, not mandatory.' },
            { question: 'Step-by-step instructions for configuring a firewall rule would be documented in a:', options: ['Policy', 'Standard', 'Procedure', 'Guideline'], correct: 2, explanation: 'Procedures provide detailed, step-by-step instructions for performing specific tasks.' },
            { question: 'What is the correct hierarchy from broadest to most specific?', options: ['Standard > Policy > Guideline > Procedure', 'Policy > Standard > Procedure > Guideline', 'Guideline > Policy > Standard > Procedure', 'Procedure > Standard > Policy > Guideline'], correct: 1, explanation: 'The hierarchy: Policy (broadest, WHAT) > Standard (specific requirements) > Procedure (step-by-step HOW) > Guideline (recommendations, optional).' },
            { question: 'How often should security policies typically be reviewed?', options: ['Every 5 years', 'Annually or after significant organizational/technology changes', 'Only when a breach occurs', 'Monthly'], correct: 1, explanation: 'Policies should be reviewed at least annually and whenever significant changes occur (new technology, organizational restructuring, regulatory updates, or security incidents).' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // CYBERSECURITY SCENARIO EXERCISE
    // ═══════════════════════════════════════════════════════════════════
    cyber_scenario: {
        id: 'cyber_scenario',
        name: 'Cybersecurity Scenario Exercise',
        icon: '/assets/images/icons/icon-joystick.webp',
        color: '#a855f7',
        subtitle: 'Incident response decision-making simulation',
        description: 'Practice making critical security decisions under pressure through realistic cybersecurity scenarios. Each scenario presents a multi-step incident where your choices determine the outcome.',
        keyConcepts: ['Incident Response', 'Decision Making', 'Triage', 'Containment', 'Evidence Preservation', 'Communication'],
        sections: [
            {
                title: 'Preparation Phase',
                icon: '/assets/images/icons/icon-books.webp',
                content: 'Effective incident response starts long before an incident occurs. The preparation phase ensures your team has the tools, training, and procedures needed.',
                details: ['Incident response plan documented and tested', 'IR team identified with clear roles and escalation paths', 'Communication plan: who to notify, in what order, through what channels', 'Forensic tools ready: write blockers, imaging software, chain of custody forms', 'Playbooks for common scenarios (ransomware, data breach, insider threat)', 'Regular tabletop exercises and simulation drills'],
                realWorld: 'A company runs a quarterly tabletop exercise. This quarter\'s scenario: "Ransomware encrypts the finance department at 2 AM on Saturday." The exercise reveals their backup validation process had not been tested in 6 months, leading to an immediate fix.'
            },
            {
                title: 'Detection & Analysis',
                icon: '/assets/images/icons/icon-magnifier.webp',
                content: 'Identifying that an incident is occurring, determining its scope, and making initial triage decisions. Speed and accuracy are critical.',
                details: ['Initial detection: SIEM alert, user report, threat intelligence', 'Triage: is this a true positive? what is the severity?', 'Scope assessment: how many systems affected? what data at risk?', 'Evidence collection: preserve logs, memory dumps, disk images', 'Timeline construction: when did it start? what was the attack path?', 'IOC (Indicators of Compromise) identification and sharing'],
                realWorld: 'The SOC receives a SIEM alert: unusual data transfer from the finance server to an external IP at 3 AM. The analyst confirms it is not a false positive, identifies 50GB of data was exfiltrated, and determines the attacker used a compromised service account that was created 2 weeks ago.'
            },
            {
                title: 'Containment & Eradication',
                icon: '/assets/images/icons/icon-shield.webp',
                content: 'Stopping the incident from spreading while preserving evidence for investigation. Containment must be balanced against operational impact.',
                details: ['Short-term containment: isolate affected systems, block malicious IPs/domains', 'Evidence preservation: image affected systems BEFORE cleanup', 'Long-term containment: patch vulnerabilities, reset compromised credentials', 'Eradication: remove malware, close backdoors, verify clean state', 'Avoid: turning off systems (destroys volatile evidence), alerting attacker', 'Coordinate with legal before contacting law enforcement'],
                realWorld: 'During an active breach, the IR team isolates the compromised server by moving it to a quarantine VLAN (maintaining network state for forensics rather than unplugging it). They capture a memory dump, image the disk, then block the C2 domain at the firewall. Only after evidence is preserved do they begin cleanup.'
            },
            {
                title: 'Recovery & Lessons Learned',
                icon: '/assets/images/icons/icon-refresh.webp',
                content: 'Restoring systems to normal operation and conducting a thorough post-incident review to improve future response.',
                details: ['Restore from known-clean backups (not just "cleaning" compromised systems)', 'Monitor restored systems intensely for signs of re-compromise', 'Validate all restored data integrity', 'Post-incident review (PIR) within 1-2 weeks', 'Root cause analysis: what allowed the incident to occur?', 'Update IR plan, playbooks, and controls based on lessons learned', 'Metrics: time to detect, time to contain, time to recover'],
                realWorld: 'After a ransomware incident, the company restores from backups but discovers the attacker had access for 3 weeks before deploying ransomware. The PIR reveals the attacker entered through a phishing email, moved laterally via unpatched SMB, and deployed ransomware from a domain admin account. The company implements email sandboxing, SMB signing, and PAM (privileged access management).'
            }
        ],
        interactive: {
            type: 'scenario_matcher',
            title: 'Incident Response Decision Making',
            instructions: 'Choose the best action for each incident response scenario.',
            items: [
                { scenario: 'You receive a SIEM alert about unusual outbound data transfer at 3 AM. First action?', answer: 'Verify the alert (true positive?) and assess scope', explanation: 'Before taking action, confirm it is a real incident and understand its scope to avoid wasting resources on false positives.' },
                { scenario: 'A server is confirmed compromised with active data exfiltration. What is the containment priority?', answer: 'Isolate to quarantine VLAN (preserve evidence, stop exfiltration)', explanation: 'Move to a quarantine VLAN to stop data loss while preserving network-based evidence. Do not power off (destroys memory evidence).' },
                { scenario: 'Ransomware is spreading across the network. Should you pay the ransom?', answer: 'No. Contain, assess backups, engage IR team', explanation: 'FBI recommends against paying ransom. Contain the spread, verify backup integrity, and engage incident response professionals.' },
                { scenario: 'You have identified the compromised server. Should you immediately delete the malware?', answer: 'No. Image the disk and capture memory first (preserve evidence)', explanation: 'Forensic evidence must be preserved before any remediation. Image the disk, capture memory, then begin cleanup.' },
                { scenario: 'The incident is resolved. What happens next?', answer: 'Conduct a post-incident review (lessons learned) within 1-2 weeks', explanation: 'The PIR identifies root causes, gaps in response, and improvements for the IR plan, playbooks, and security controls.' },
                { scenario: 'During containment, the CEO asks for a status update for the board.', answer: 'Provide factual, confirmed information only (avoid speculation)', explanation: 'Communication during incidents must be factual. Share only confirmed information and avoid speculation that could mislead leadership or create legal liability.' }
            ]
        },
        quiz: [
            { question: 'What is the FIRST step when a potential security incident is detected?', options: ['Shut down all affected systems immediately', 'Verify and triage the alert (is it real? what is the severity?)', 'Notify the media', 'Format and rebuild all servers'], correct: 1, explanation: 'The first step is verification and triage: confirm the incident is real (not a false positive), assess severity, and determine scope before taking action.' },
            { question: 'During an active breach, why should you NOT simply power off the compromised server?', options: ['It might damage the hardware', 'It destroys volatile evidence in memory (RAM)', 'The server will not restart properly', 'It is against company policy'], correct: 1, explanation: 'Volatile evidence in RAM (running processes, network connections, encryption keys, malware in memory) is destroyed when the system loses power.' },
            { question: 'What is the purpose of a quarantine VLAN during incident containment?', options: ['To provide internet access to investigators', 'To isolate compromised systems while preserving their network state for forensics', 'To speed up system recovery', 'To backup all affected data'], correct: 1, explanation: 'A quarantine VLAN isolates the compromised system from the production network (stopping lateral movement and exfiltration) while keeping it powered on for forensic evidence collection.' },
            { question: 'What should the post-incident review (PIR) focus on?', options: ['Assigning blame to the person responsible', 'Root cause analysis, response effectiveness, and improvements to prevent recurrence', 'Calculating the exact cost of the incident', 'Writing a press release'], correct: 1, explanation: 'The PIR focuses on root cause (how did it happen?), response evaluation (what worked? what did not?), and improvements (how do we prevent this and respond better next time?).' },
            { question: 'Why is evidence preservation critical during incident response?', options: ['For social media posts', 'For legal proceedings, insurance claims, and understanding the full attack scope', 'It is not critical, speed is more important', 'Only for law enforcement cases'], correct: 1, explanation: 'Preserved evidence supports legal action, insurance claims, regulatory compliance, and thorough root cause analysis to understand and prevent future incidents.' },
            { question: 'What are the correct incident response phases in order?', options: ['Containment, Detection, Recovery, Preparation', 'Preparation, Detection & Analysis, Containment & Eradication, Recovery, Lessons Learned', 'Detection, Eradication, Recovery, Documentation', 'Analysis, Prevention, Monitoring, Reporting'], correct: 1, explanation: 'The NIST incident response lifecycle: Preparation > Detection & Analysis > Containment, Eradication & Recovery > Post-Incident Activity (Lessons Learned).' }
        ]
    }
};
