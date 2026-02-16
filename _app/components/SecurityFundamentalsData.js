/**
 * SecurityFundamentalsData.js — Core cybersecurity fundamentals topic data
 *
 * 9 topics covering foundational security concepts
 * Used by SecurityFundamentalsRenderer.js
 */
const SecurityFundamentalsData = {

    // ═══════════════════════════════════════════════════════════════════
    // FIVE PILLARS — CIA + Authenticity + Nonrepudiation
    // ═══════════════════════════════════════════════════════════════════
    five_pillars: {
        id: 'five_pillars',
        name: 'The Five Pillars of Information Security',
        icon: '\u26d1',
        color: '#a855f7',
        subtitle: 'Confidentiality, Integrity, Availability, Authenticity & Nonrepudiation',
        description: 'The five pillars form the bedrock of every information security program. Understanding how they interrelate is critical for designing effective security architectures.',
        keyConcepts: ['Confidentiality', 'Integrity', 'Availability', 'Authenticity', 'Nonrepudiation'],
        sections: [
            {
                title: 'Confidentiality',
                icon: '\ud83d\udd12',
                content: 'Ensuring information is accessible only to those authorized to access it. Confidentiality breaches occur when data is exposed to unauthorized parties.',
                details: ['Encryption (AES-256, RSA)', 'Access control lists (ACLs)', 'Data classification (Public, Internal, Confidential, Restricted)', 'Need-to-know principle', 'Data masking and tokenization'],
                realWorld: 'A hospital encrypts patient records at rest and in transit, implements role-based access so nurses see care plans but not billing data, and uses DLP to prevent email exfiltration of PHI.'
            },
            {
                title: 'Integrity',
                icon: '\u2714\ufe0f',
                content: 'Guaranteeing accuracy and completeness of data. Integrity controls ensure information has not been altered by unauthorized parties during storage or transit.',
                details: ['Hashing algorithms (SHA-256, SHA-3)', 'Digital signatures', 'Checksums and CRC', 'Version control systems', 'Database constraints and triggers'],
                realWorld: 'A bank uses SHA-256 hashes on wire transfer records. Before processing, the system recomputes the hash and compares it to the stored value. Any mismatch triggers an alert and blocks the transaction.'
            },
            {
                title: 'Availability',
                icon: '\u26a1',
                content: 'Ensuring authorized users can access information and resources when needed. Availability attacks (like DDoS) aim to deny legitimate access.',
                details: ['Redundancy and failover', 'Load balancers', 'Backup and disaster recovery', 'SLA uptime guarantees (99.9%, 99.99%)', 'DDoS mitigation (CloudFlare, AWS Shield)'],
                realWorld: 'An e-commerce platform uses multi-region deployment with auto-scaling, database replication with automatic failover, and CDN caching to maintain 99.99% uptime during peak sales events.'
            },
            {
                title: 'Authenticity',
                icon: '\ud83c\udfab',
                content: 'Verifying that users, systems, and data are genuine. Authentication confirms identity before granting access to resources.',
                details: ['Multi-factor authentication (MFA)', 'Certificate-based authentication', 'Biometrics (fingerprint, facial recognition)', 'Token-based systems (OAuth, SAML)', 'PKI and digital certificates'],
                realWorld: 'A defense contractor requires CAC (Common Access Card) plus PIN to access classified systems, with certificate validation against the DoD PKI before establishing any session.'
            },
            {
                title: 'Nonrepudiation',
                icon: '\ud83d\udcdd',
                content: 'Preventing someone from denying an action they performed. Nonrepudiation provides irrefutable evidence of who did what and when.',
                details: ['Digital signatures with private keys', 'Audit trails and logging', 'Timestamping authorities', 'Chain of custody documentation', 'Blockchain-based proof records'],
                realWorld: 'A legal firm uses digitally signed emails with timestamps from a trusted authority. If a client later denies sending a contract approval, the firm can produce the cryptographic proof of origin.'
            }
        ],
        interactive: {
            type: 'scenario_matcher',
            title: 'Pillar Identification Challenge',
            instructions: 'Match each scenario to the primary security pillar it addresses.',
            items: [
                { scenario: 'A company deploys AES-256 encryption on all laptops.', answer: 'Confidentiality', explanation: 'Encryption prevents unauthorized access to data, protecting confidentiality.' },
                { scenario: 'A bank uses SHA-256 checksums to verify wire transfer records.', answer: 'Integrity', explanation: 'Hashing verifies data has not been tampered with, ensuring integrity.' },
                { scenario: 'An ISP deploys redundant DNS servers across three data centers.', answer: 'Availability', explanation: 'Redundancy ensures services remain accessible even if one server fails.' },
                { scenario: 'A hospital implements smart card authentication for EHR access.', answer: 'Authenticity', explanation: 'Smart cards verify the identity of users before granting access.' },
                { scenario: 'A government agency requires digital signatures on all classified transmissions.', answer: 'Nonrepudiation', explanation: 'Digital signatures provide cryptographic proof of who sent the message.' },
                { scenario: 'A cloud provider guarantees 99.99% uptime in their SLA with automatic failover.', answer: 'Availability', explanation: 'SLA uptime guarantees and failover mechanisms support availability.' },
                { scenario: 'A law firm archives emails with timestamps from a trusted certificate authority.', answer: 'Nonrepudiation', explanation: 'Timestamped archives provide undeniable proof of communication.' },
                { scenario: 'A military network uses RBAC to restrict Top Secret files to cleared personnel only.', answer: 'Confidentiality', explanation: 'Role-based access control limits who can view classified information.' }
            ]
        },
        quiz: [
            { question: 'Which pillar is PRIMARILY addressed by encrypting data at rest with AES-256?', options: ['Integrity', 'Confidentiality', 'Availability', 'Nonrepudiation'], correct: 1, explanation: 'Encryption at rest protects confidentiality by making data unreadable to unauthorized parties, even if they gain physical access to storage media.' },
            { question: 'A system uses SHA-256 hashing to verify that a downloaded file has not been altered. Which pillar does this protect?', options: ['Confidentiality', 'Authenticity', 'Integrity', 'Availability'], correct: 2, explanation: 'Hash comparison detects unauthorized modification of data, which is the core of integrity verification.' },
            { question: 'Your organization implements geographically dispersed backup sites. Which pillar is this PRIMARILY supporting?', options: ['Confidentiality', 'Integrity', 'Availability', 'Nonrepudiation'], correct: 2, explanation: 'Geographic redundancy ensures services remain available even if an entire data center goes offline due to disaster.' },
            { question: 'A user digitally signs an email. Which TWO pillars are supported?', options: ['Confidentiality and Availability', 'Integrity and Nonrepudiation', 'Authenticity and Confidentiality', 'Availability and Integrity'], correct: 1, explanation: 'Digital signatures verify data has not been altered (integrity) and prove who sent it (nonrepudiation).' },
            { question: 'Which scenario represents a failure of the Authenticity pillar?', options: ['A server goes down during a DDoS attack', 'An attacker uses stolen credentials to impersonate a legitimate user', 'A database record is modified without authorization', 'Sensitive files are accessed by an unauthorized employee'], correct: 1, explanation: 'Authenticity failures occur when the system cannot distinguish between legitimate users and imposters using stolen credentials.' },
            { question: 'A hospital implements MFA, encryption, and audit logging. Which pillar is NOT directly addressed by these three controls?', options: ['Confidentiality', 'Authenticity', 'Availability', 'Nonrepudiation'], correct: 2, explanation: 'MFA addresses authenticity, encryption addresses confidentiality, and audit logging addresses nonrepudiation. None of these directly ensure availability.' },
            { question: 'What distinguishes Nonrepudiation from Authenticity?', options: ['Nonrepudiation uses biometrics; authenticity does not', 'Authenticity verifies identity; nonrepudiation proves an action cannot be denied', 'They are the same concept with different names', 'Nonrepudiation is only for network traffic; authenticity is for physical access'], correct: 1, explanation: 'Authenticity confirms WHO someone is. Nonrepudiation proves WHAT they did and that they cannot deny having done it, typically through digital signatures and audit trails.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // THE McCUMBER CUBE
    // ═══════════════════════════════════════════════════════════════════
    the_cube: {
        id: 'the_cube',
        name: 'The McCumber Cube',
        icon: '\ud83d\udce6',
        color: '#a855f7',
        subtitle: 'A 3D framework for information security',
        description: 'John McCumber\'s cube model provides a three-dimensional framework for thinking about information assurance. Each axis represents a different dimension of security, and every cell in the 3x3x3 cube represents a unique security consideration.',
        keyConcepts: ['Security Goals', 'Information States', 'Security Measures', '27 Cells', 'McCumber Model'],
        sections: [
            {
                title: 'Dimension 1: Security Goals (CIA)',
                icon: '\ud83c\udfaf',
                content: 'The first axis represents the three fundamental security objectives that all information security programs must address.',
                details: ['Confidentiality - Preventing unauthorized disclosure', 'Integrity - Preventing unauthorized modification', 'Availability - Ensuring timely, reliable access'],
                realWorld: 'When designing a new payroll system, the architect maps each feature against all three goals: encryption for confidentiality, checksums for integrity, and redundant servers for availability.'
            },
            {
                title: 'Dimension 2: Information States',
                icon: '\ud83d\udcc0',
                content: 'The second axis represents the three states in which information can exist. Security controls must address all three states.',
                details: ['Storage (Data at Rest) - Files on disk, databases, backups', 'Transmission (Data in Transit) - Network packets, email, file transfers', 'Processing (Data in Use) - Active computation, RAM, CPU registers'],
                realWorld: 'A cloud provider encrypts data at rest (AES-256), in transit (TLS 1.3), and is developing confidential computing to protect data in use (Intel SGX enclaves).'
            },
            {
                title: 'Dimension 3: Security Measures',
                icon: '\ud83d\udee1\ufe0f',
                content: 'The third axis represents the three categories of countermeasures available to protect information.',
                details: ['Technology - Hardware and software controls (firewalls, IDS, encryption)', 'Policy & Practices - Written rules, procedures, standards, guidelines', 'Human Factors - Training, awareness, education, culture'],
                realWorld: 'To address insider threats, an organization deploys DLP software (technology), creates an acceptable use policy (policy), and runs quarterly security awareness training (human factors).'
            },
            {
                title: 'How the Cube Works',
                icon: '\ud83e\udde9',
                content: 'Each cell at the intersection of one element from each dimension represents a specific security concern. For example: Confidentiality + Storage + Technology = disk encryption.',
                details: ['3 x 3 x 3 = 27 unique security cells', 'Each cell should have at least one control', 'Gaps in coverage = vulnerabilities', 'Use the cube to audit your security program', 'Map existing controls to identify blind spots'],
                realWorld: 'A CISO uses the McCumber Cube during an annual security review: "We have strong technology controls for data in transit, but our policy coverage for data in processing is weak. We need SOPs for how employees handle sensitive data in memory-intensive applications."'
            }
        ],
        interactive: {
            type: 'cube_mapper',
            title: 'Map the Control to the Cube Cell',
            instructions: 'For each security control, identify which cube cell it belongs to (Goal + State + Measure).',
            items: [
                { scenario: 'Full-disk encryption on employee laptops', answer: 'Confidentiality + Storage + Technology', explanation: 'Disk encryption is a technology control that protects the confidentiality of data at rest.' },
                { scenario: 'TLS 1.3 for all web traffic', answer: 'Confidentiality + Transmission + Technology', explanation: 'TLS protects data in transit using technology (protocol encryption).' },
                { scenario: 'Acceptable use policy for email', answer: 'Confidentiality + Transmission + Policy', explanation: 'Email policies address how users should handle confidential data being transmitted.' },
                { scenario: 'Annual security awareness training on phishing', answer: 'Confidentiality + Transmission + Human Factors', explanation: 'Training helps people recognize phishing attempts targeting data sent over networks.' },
                { scenario: 'Database integrity checks using checksums', answer: 'Integrity + Storage + Technology', explanation: 'Checksums are technology that verifies stored data has not been modified.' },
                { scenario: 'Redundant power supplies in the data center', answer: 'Availability + Processing + Technology', explanation: 'UPS systems ensure servers remain operational (available for processing).' },
                { scenario: 'Change management procedures for production databases', answer: 'Integrity + Storage + Policy', explanation: 'Change management policies govern how stored data can be modified, protecting integrity.' },
                { scenario: 'Training staff to verify callers before sharing information', answer: 'Confidentiality + Processing + Human Factors', explanation: 'Training humans to verify identity before sharing active information addresses confidentiality during processing.' }
            ]
        },
        quiz: [
            { question: 'How many unique security cells does the McCumber Cube contain?', options: ['9', '18', '27', '36'], correct: 2, explanation: 'The cube has 3 dimensions with 3 elements each: 3 x 3 x 3 = 27 unique cells.' },
            { question: 'Which dimension of the McCumber Cube includes "Processing" as an element?', options: ['Security Goals', 'Information States', 'Security Measures', 'Risk Assessment'], correct: 1, explanation: 'Information States includes Storage, Transmission, and Processing.' },
            { question: 'A firewall rule blocking unauthorized traffic maps to which cube cell?', options: ['Confidentiality + Transmission + Technology', 'Availability + Storage + Policy', 'Integrity + Processing + Human Factors', 'Confidentiality + Storage + Technology'], correct: 0, explanation: 'A firewall is technology that protects the confidentiality of data in transmission by blocking unauthorized network traffic.' },
            { question: 'What is the primary purpose of the McCumber Cube?', options: ['To encrypt data using three-dimensional algorithms', 'To provide a comprehensive framework for evaluating security coverage', 'To classify malware types into categories', 'To rank security threats by severity'], correct: 1, explanation: 'The McCumber Cube helps security professionals systematically evaluate whether their security program addresses all combinations of goals, states, and measures.' },
            { question: '"Security awareness training about proper file storage" maps to which cell?', options: ['Integrity + Storage + Human Factors', 'Confidentiality + Storage + Human Factors', 'Availability + Transmission + Policy', 'Integrity + Processing + Technology'], correct: 1, explanation: 'Training (Human Factors) about how to store files properly (Storage) to keep them from unauthorized access (Confidentiality).' },
            { question: 'An organization has strong technology and policy controls but weak human factors. Which axis of the cube is underserved?', options: ['Security Goals', 'Information States', 'Security Measures', 'All three'], correct: 2, explanation: 'Security Measures has three elements: Technology, Policy & Practices, and Human Factors. Weak human factors means one element of this dimension is lacking.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // CYBERSECURITY CONTROLS
    // ═══════════════════════════════════════════════════════════════════
    cybersecurity_controls: {
        id: 'cybersecurity_controls',
        name: 'Cybersecurity Controls',
        icon: '\ud83d\udee1\ufe0f',
        color: '#a855f7',
        subtitle: 'Administrative, Technical & Physical controls',
        description: 'Security controls are safeguards or countermeasures designed to protect the confidentiality, integrity, and availability of information. They are categorized by type (administrative, technical, physical) and function (preventive, detective, corrective, deterrent, compensating).',
        keyConcepts: ['Administrative Controls', 'Technical Controls', 'Physical Controls', 'Preventive', 'Detective', 'Corrective', 'Deterrent', 'Compensating'],
        sections: [
            {
                title: 'Administrative (Managerial) Controls',
                icon: '\ud83d\udccb',
                content: 'Policies, procedures, and organizational measures that define the rules and expectations for security behavior.',
                details: ['Security policies and procedures', 'Risk assessments and audits', 'Security awareness training', 'Incident response plans', 'Background checks and hiring practices', 'Change management processes'],
                realWorld: 'A company creates an Acceptable Use Policy stating that employees must not use company devices for personal crypto mining. Violation results in disciplinary action up to termination.'
            },
            {
                title: 'Technical (Logical) Controls',
                icon: '\u2699\ufe0f',
                content: 'Hardware and software mechanisms used to protect information systems and data. These are automated controls enforced by technology.',
                details: ['Firewalls and IDS/IPS', 'Encryption (at rest and in transit)', 'Access control lists (ACLs)', 'Multi-factor authentication', 'Antivirus and endpoint protection', 'SIEM and log management'],
                realWorld: 'A financial institution deploys a next-gen firewall with deep packet inspection, IDS alerts feeding into a SIEM, and EDR on every endpoint with automated threat response.'
            },
            {
                title: 'Physical Controls',
                icon: '\ud83c\udfdb\ufe0f',
                content: 'Tangible mechanisms that protect personnel, hardware, and the physical environment from threats.',
                details: ['Locks, fences, and gates', 'Security guards and cameras (CCTV)', 'Badge readers and biometric scanners', 'Environmental controls (fire suppression, HVAC)', 'Cable locks and hardware enclosures', 'Mantrap/sally port entry systems'],
                realWorld: 'A data center uses six layers of physical security: perimeter fence with razor wire, guard booth, badge + biometric at the door, mantraps, caged racks, and 24/7 CCTV with 90-day retention.'
            },
            {
                title: 'Control Functions',
                icon: '\ud83c\udfaf',
                content: 'Controls are further classified by their function: what they are designed to accomplish in the security lifecycle.',
                details: ['Preventive - Stop incidents before they occur (firewall rules, door locks)', 'Detective - Identify incidents in progress or after (IDS, audit logs, CCTV)', 'Corrective - Fix issues after detection (patching, restoring backups)', 'Deterrent - Discourage attacks (warning banners, security cameras)', 'Compensating - Alternative controls when primary controls are infeasible'],
                realWorld: 'After a breach, an organization applies corrective controls (patches the vulnerability), enhances detective controls (adds file integrity monitoring), and implements compensating controls (network segmentation) while a full solution is developed.'
            }
        ],
        interactive: {
            type: 'control_classifier',
            title: 'Classify the Control',
            instructions: 'For each security control, identify its type (Administrative, Technical, or Physical) AND its function (Preventive, Detective, Corrective, Deterrent, or Compensating).',
            items: [
                { scenario: 'Security awareness training program', answer: 'Administrative + Preventive', explanation: 'Training is an organizational measure (administrative) designed to prevent incidents through education.' },
                { scenario: 'Intrusion Detection System (IDS)', answer: 'Technical + Detective', explanation: 'An IDS is software/hardware (technical) that identifies attacks in progress (detective).' },
                { scenario: 'Security cameras at building entrances', answer: 'Physical + Detective/Deterrent', explanation: 'Cameras are physical controls that both detect intrusions and deter potential attackers.' },
                { scenario: 'Firewall blocking unauthorized ports', answer: 'Technical + Preventive', explanation: 'A firewall is technology that prevents unauthorized network access.' },
                { scenario: 'Backup restoration after ransomware', answer: 'Technical + Corrective', explanation: 'Restoring from backups is a technology-based corrective action after an incident.' },
                { scenario: '"Authorized Personnel Only" sign', answer: 'Physical + Deterrent', explanation: 'A warning sign is a physical deterrent control discouraging unauthorized access.' },
                { scenario: 'Requiring two people to access the safe', answer: 'Administrative + Preventive', explanation: 'Dual-person control is a policy measure preventing unauthorized solo access.' },
                { scenario: 'Encrypting a USB drive when full-disk encryption is not available on legacy systems', answer: 'Technical + Compensating', explanation: 'USB encryption compensates for the lack of full-disk encryption on older systems.' }
            ]
        },
        quiz: [
            { question: 'A company requires all employees to complete annual security awareness training. What type of control is this?', options: ['Technical', 'Physical', 'Administrative', 'Compensating'], correct: 2, explanation: 'Security awareness training is an organizational policy/procedure (administrative control) designed to educate employees.' },
            { question: 'Which control function is BEST described as "stopping an incident before it happens"?', options: ['Detective', 'Corrective', 'Preventive', 'Compensating'], correct: 2, explanation: 'Preventive controls are designed to stop security incidents from occurring in the first place.' },
            { question: 'An IDS alerts the SOC to suspicious network activity. What type and function is this?', options: ['Administrative + Preventive', 'Technical + Detective', 'Physical + Deterrent', 'Technical + Corrective'], correct: 1, explanation: 'An IDS is a technology tool (technical) that identifies threats (detective function).' },
            { question: 'After a data breach, the IT team patches the exploited vulnerability. This is an example of what control function?', options: ['Preventive', 'Detective', 'Corrective', 'Deterrent'], correct: 2, explanation: 'Patching after a breach is a corrective action that fixes the issue after it has been detected.' },
            { question: 'A mantrap at a data center entrance is what type of control?', options: ['Technical', 'Administrative', 'Physical', 'Compensating'], correct: 2, explanation: 'A mantrap is a tangible, physical access control mechanism that restricts entry to authorized personnel.' },
            { question: 'When is a compensating control appropriate?', options: ['Always, as a best practice', 'When the primary control is too expensive to implement', 'When the primary control cannot be implemented and an alternative provides equivalent protection', 'Only during incident response'], correct: 2, explanation: 'Compensating controls are used when the intended primary control is infeasible, providing alternative protection that meets the security objective.' },
            { question: 'Which combination BEST represents defense in depth?', options: ['Multiple firewalls from the same vendor', 'Administrative + Technical + Physical controls layered together', 'Only technical controls at every network layer', 'Policies covering every department'], correct: 1, explanation: 'Defense in depth combines multiple control types (administrative, technical, physical) in layers so that failure of one control does not compromise security.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // DATA ROLES
    // ═══════════════════════════════════════════════════════════════════
    data_roles: {
        id: 'data_roles',
        name: 'Data Roles & Responsibilities',
        icon: '\ud83d\udc65',
        color: '#a855f7',
        subtitle: 'Owner, Custodian, Processor, Controller, User',
        description: 'Data governance assigns specific roles and responsibilities to ensure information is properly managed, protected, and used throughout its lifecycle. Understanding these roles is critical for compliance with regulations like GDPR, HIPAA, and CCPA.',
        keyConcepts: ['Data Owner', 'Data Custodian', 'Data Controller', 'Data Processor', 'Data Steward', 'Data User', 'Data Subject'],
        sections: [
            {
                title: 'Data Owner',
                icon: '\ud83d\udc51',
                content: 'The person or entity ultimately accountable for the data. The data owner determines classification, access policies, and acceptable use. Usually a senior executive or department head.',
                details: ['Determines data classification level', 'Approves access requests', 'Defines retention and destruction policies', 'Accountable for data breaches affecting their data', 'Usually a business leader, not IT'],
                realWorld: 'The VP of Finance is the data owner for all financial records. She approves who gets access to the ERP system, determines that financial data is classified as "Confidential," and defines the 7-year retention policy.'
            },
            {
                title: 'Data Custodian',
                icon: '\ud83d\udd27',
                content: 'The person or team responsible for the day-to-day management and technical protection of data. They implement the policies defined by the data owner.',
                details: ['Implements backups and recovery', 'Manages encryption and access controls', 'Performs system patching and maintenance', 'Monitors for unauthorized access', 'Typically IT staff or database administrators'],
                realWorld: 'The DBA team implements the VP of Finance\'s policies: encrypting financial databases with AES-256, running nightly backups, configuring RBAC in the ERP system, and monitoring access logs for anomalies.'
            },
            {
                title: 'Data Controller (GDPR)',
                icon: '\ud83d\udccb',
                content: 'Under GDPR, the entity that determines the purposes and means of processing personal data. The controller decides WHY and HOW data is processed.',
                details: ['Determines purpose of data collection', 'Decides what data to collect', 'Responsible for lawful basis of processing', 'Must respond to data subject requests', 'Liable for compliance violations'],
                realWorld: 'An online retailer (controller) decides to collect customer email addresses for marketing. They determine the legal basis (consent), create the privacy notice, and are responsible if data is mishandled.'
            },
            {
                title: 'Data Processor (GDPR)',
                icon: '\u2699\ufe0f',
                content: 'Under GDPR, any entity that processes personal data on behalf of a controller. Processors follow the controller\'s instructions and have their own compliance obligations.',
                details: ['Processes data only as instructed by controller', 'Must maintain processing records', 'Required to implement appropriate security', 'Must notify controller of breaches', 'Examples: cloud providers, payroll services, marketing platforms'],
                realWorld: 'The retailer uses Mailchimp (processor) to send marketing emails. Mailchimp processes customer data only as the retailer instructs, maintains its own security controls, and must notify the retailer of any breach.'
            },
            {
                title: 'Data Steward & Data User',
                icon: '\ud83d\udcca',
                content: 'Data stewards ensure data quality and governance compliance. Data users are authorized individuals who access and use data in their daily work.',
                details: ['Steward: ensures data quality, consistency, and metadata accuracy', 'Steward: bridges business and IT understanding of data', 'User: accesses data within authorized boundaries', 'User: must follow acceptable use policies', 'Data Subject: the individual whose data is collected (GDPR term)'],
                realWorld: 'A data steward in the marketing department ensures customer records are clean and deduplicated. A sales rep (data user) queries the CRM to contact leads, following the company\'s data handling policy.'
            }
        ],
        interactive: {
            type: 'scenario_matcher',
            title: 'Who Is Responsible?',
            instructions: 'Match each scenario to the correct data role.',
            items: [
                { scenario: 'The CIO decides that customer PII should be classified as "Restricted."', answer: 'Data Owner', explanation: 'Data owners determine classification levels for the data they are accountable for.' },
                { scenario: 'A DBA configures AES-256 encryption on the customer database.', answer: 'Data Custodian', explanation: 'Data custodians implement the technical controls defined by the data owner.' },
                { scenario: 'A cloud hosting provider stores and processes data as instructed by its client.', answer: 'Data Processor', explanation: 'Under GDPR, processors handle data on behalf of and under the instructions of the controller.' },
                { scenario: 'A company decides to collect user browsing behavior for personalized ads.', answer: 'Data Controller', explanation: 'Controllers determine the purpose and means of processing personal data.' },
                { scenario: 'An analyst in the HR department reviews employee attendance reports.', answer: 'Data User', explanation: 'Data users access and use data within their authorized boundaries for business purposes.' },
                { scenario: 'A team lead validates that all customer addresses in the CRM are formatted correctly.', answer: 'Data Steward', explanation: 'Data stewards ensure data quality, consistency, and proper formatting.' }
            ]
        },
        quiz: [
            { question: 'Who is ultimately ACCOUNTABLE for determining data classification?', options: ['Data Custodian', 'Data User', 'Data Owner', 'Data Processor'], correct: 2, explanation: 'The data owner has ultimate accountability for their data, including determining its classification level and access policies.' },
            { question: 'Under GDPR, who determines the PURPOSE of processing personal data?', options: ['Data Processor', 'Data Subject', 'Data Controller', 'Data Custodian'], correct: 2, explanation: 'The data controller decides why (purpose) and how (means) personal data is processed.' },
            { question: 'A DBA implements encryption and manages backups. What role is this?', options: ['Data Owner', 'Data Custodian', 'Data Controller', 'Data Steward'], correct: 1, explanation: 'Data custodians handle the day-to-day technical management and protection of data, implementing the owner\'s policies.' },
            { question: 'Your company uses AWS to host customer data. Under GDPR, AWS is the:', options: ['Data Controller', 'Data Owner', 'Data Processor', 'Data Subject'], correct: 2, explanation: 'AWS processes data on behalf of your company (the controller). AWS is the processor; your company remains the controller.' },
            { question: 'What distinguishes a Data Owner from a Data Custodian?', options: ['Owners are technical; custodians are managerial', 'Owners set policy; custodians implement it', 'Custodians have more authority than owners', 'There is no meaningful difference'], correct: 1, explanation: 'Data owners define policies, classification, and access rules (business side). Data custodians implement those policies through technical controls (IT side).' },
            { question: 'Who should respond to a GDPR Data Subject Access Request (DSAR)?', options: ['Data Processor', 'Data Custodian', 'Data Controller', 'Data User'], correct: 2, explanation: 'The data controller is responsible for responding to data subject requests under GDPR, though they may involve the processor in fulfilling the request.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // DESIGN PRINCIPLES
    // ═══════════════════════════════════════════════════════════════════
    design_principles: {
        id: 'design_principles',
        name: 'Security Design Principles',
        icon: '\ud83c\udfd7\ufe0f',
        color: '#a855f7',
        subtitle: 'Foundational principles for building secure systems',
        description: 'Security design principles guide architects and developers in building systems that are secure by design. These time-tested principles, many originating from Saltzer and Schroeder (1975), remain the foundation of modern security architecture.',
        keyConcepts: ['Least Privilege', 'Defense in Depth', 'Fail Secure', 'Separation of Duties', 'Zero Trust', 'Economy of Mechanism', 'Open Design'],
        sections: [
            {
                title: 'Least Privilege',
                icon: '\ud83d\udd11',
                content: 'Every user, process, and system should operate with the minimum set of permissions needed to perform its function. No more, no less.',
                details: ['Users get only the access their role requires', 'Service accounts have scoped permissions', 'Temporary privilege escalation (sudo, just-in-time access)', 'Regular access reviews to remove stale permissions', 'Applies to programs, processes, and network connections too'],
                realWorld: 'An AWS Lambda function that reads from S3 gets an IAM role with s3:GetObject on one specific bucket, not s3:* on *. If compromised, the blast radius is limited to that one bucket.'
            },
            {
                title: 'Defense in Depth',
                icon: '\ud83c\udff0',
                content: 'Multiple layers of security controls so that if one layer fails, others continue to provide protection. No single point of failure.',
                details: ['Network: firewall + IDS + segmentation', 'Endpoint: AV + EDR + host firewall + application whitelisting', 'Data: encryption + access controls + DLP + masking', 'Physical: fence + camera + badge + mantrap', 'Administrative: policy + training + audits + incident response'],
                realWorld: 'A bank protects its core banking system with: perimeter firewall, WAF, network segmentation, microsegmentation, host-based IDS, application-level encryption, database access controls, and quarterly pen tests.'
            },
            {
                title: 'Fail Secure / Fail Safe',
                icon: '\ud83d\udea8',
                content: 'When a system fails, it should default to a secure state rather than an open/permissive state. Failure should not bypass security controls.',
                details: ['Fail Secure: system denies all access on failure (secure default)', 'Fail Safe: system protects human safety on failure (emergency exits unlock)', 'Firewalls should default-deny if rules cannot be loaded', 'Authentication failures should deny access, not grant it', 'Distinguish between safety-critical and security-critical systems'],
                realWorld: 'A building access system is configured to fail secure (doors lock on power failure), but fire exits fail safe (they unlock during emergencies to protect life). Different failure modes for different priorities.'
            },
            {
                title: 'Separation of Duties & Zero Trust',
                icon: '\ud83e\udd1d',
                content: 'No single person should have enough authority to compromise a critical process. Zero Trust takes this further: never trust, always verify.',
                details: ['Separation: developer cannot deploy to production alone', 'Separation: two-person control for critical operations', 'Zero Trust: verify every request regardless of source', 'Zero Trust: assume breach; minimize blast radius', 'Micro-segmentation and continuous authentication'],
                realWorld: 'A defense contractor requires two authorized personnel to launch any classified data transfer (separation of duties). Their network uses Zero Trust: even internal traffic is authenticated, encrypted, and logged at every hop.'
            },
            {
                title: 'Additional Principles',
                icon: '\ud83d\udcd0',
                content: 'Several other principles from Saltzer & Schroeder round out the security design toolkit.',
                details: ['Economy of Mechanism - Keep security simple; complex systems have more bugs', 'Complete Mediation - Check every access, every time (no caching of permissions)', 'Open Design - Security should not depend on secrecy of the mechanism (Kerckhoffs\' principle)', 'Least Common Mechanism - Minimize shared components between users/processes', 'Psychological Acceptability - Security should not make the system unusable'],
                realWorld: 'AES encryption follows Open Design: the algorithm is public, but security depends on the key. This is far more trustworthy than a proprietary "secret" algorithm that could hide flaws.'
            }
        ],
        interactive: {
            type: 'scenario_matcher',
            title: 'Name That Principle',
            instructions: 'Identify which security design principle each scenario demonstrates.',
            items: [
                { scenario: 'A web application grants the database service account read-only access to exactly three tables it needs.', answer: 'Least Privilege', explanation: 'The service account has the minimum permissions needed for its function.' },
                { scenario: 'An organization uses firewalls, IDS, endpoint protection, and encryption together.', answer: 'Defense in Depth', explanation: 'Multiple overlapping security layers ensure no single point of failure.' },
                { scenario: 'A firewall blocks all traffic when its configuration cannot be loaded.', answer: 'Fail Secure', explanation: 'The system defaults to a deny-all state when it encounters a failure.' },
                { scenario: 'Two people must approve a wire transfer over $10,000.', answer: 'Separation of Duties', explanation: 'Requiring two approvers prevents any single person from making unauthorized transfers.' },
                { scenario: 'Internal network traffic is authenticated and encrypted just like external traffic.', answer: 'Zero Trust', explanation: 'Zero Trust assumes no implicit trust based on network location.' },
                { scenario: 'A company publishes its security architecture for peer review.', answer: 'Open Design', explanation: 'Security does not depend on secrecy of the mechanism.' },
                { scenario: 'An SSO system checks permissions on every page load, not just at login.', answer: 'Complete Mediation', explanation: 'Every access request is verified, with no reliance on cached authorization.' },
                { scenario: 'A new security feature is designed to be invisible to end users.', answer: 'Psychological Acceptability', explanation: 'Security controls should not make the system unusable or frustrate legitimate users.' }
            ]
        },
        quiz: [
            { question: 'Which principle states that every user should operate with the minimum permissions necessary?', options: ['Defense in Depth', 'Least Privilege', 'Separation of Duties', 'Complete Mediation'], correct: 1, explanation: 'Least Privilege requires granting only the minimum access needed for a user or process to perform its function.' },
            { question: 'A firewall defaults to "deny all" when its rule set fails to load. Which principle is this?', options: ['Fail Secure', 'Fail Safe', 'Defense in Depth', 'Zero Trust'], correct: 0, explanation: 'Fail Secure means the system defaults to a secure (deny) state upon failure.' },
            { question: 'What is the key difference between Fail Secure and Fail Safe?', options: ['They are the same concept', 'Fail Secure prioritizes security; Fail Safe prioritizes human safety', 'Fail Safe is more secure than Fail Secure', 'Fail Secure is for networks; Fail Safe is for applications'], correct: 1, explanation: 'Fail Secure locks down on failure (security priority), while Fail Safe opens up to protect lives (safety priority, like fire exits).' },
            { question: 'Which principle is violated when a developer can both write code AND deploy it to production without review?', options: ['Least Privilege', 'Defense in Depth', 'Separation of Duties', 'Open Design'], correct: 2, explanation: 'Separation of Duties requires that no single person controls an entire critical process. Development and deployment should require different people.' },
            { question: '"Never trust, always verify" is the mantra of which principle?', options: ['Defense in Depth', 'Fail Secure', 'Least Privilege', 'Zero Trust'], correct: 3, explanation: 'Zero Trust assumes no implicit trust based on network location or previous authentication. Every request is verified.' },
            { question: 'The AES algorithm is publicly documented. Which principle does this follow?', options: ['Economy of Mechanism', 'Open Design', 'Least Common Mechanism', 'Complete Mediation'], correct: 1, explanation: 'Open Design (Kerckhoffs\' Principle) states that security should not depend on secrecy of the mechanism. AES is public; security depends on the key.' },
            { question: 'An organization implements a WAF, network firewall, EDR, and disk encryption. Which principle is being applied?', options: ['Least Privilege', 'Complete Mediation', 'Defense in Depth', 'Economy of Mechanism'], correct: 2, explanation: 'Multiple overlapping security controls at different layers exemplify Defense in Depth.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // ETHICS & PROFESSIONAL CONDUCT
    // ═══════════════════════════════════════════════════════════════════
    ethics_conduct: {
        id: 'ethics_conduct',
        name: 'Ethics & Professional Conduct',
        icon: '\u2696\ufe0f',
        color: '#a855f7',
        subtitle: 'Codes of ethics in cybersecurity professions',
        description: 'Cybersecurity professionals are entrusted with access to sensitive systems and data. Professional codes of ethics establish the behavioral standards that build trust with employers, clients, and the public.',
        keyConcepts: ['(ISC)\u00b2 Code of Ethics', 'ISACA Code of Ethics', 'CompTIA Code of Conduct', 'Professional Responsibility', 'Ethical Hacking Boundaries'],
        sections: [
            {
                title: '(ISC)\u00b2 Code of Ethics',
                icon: '\ud83c\udfc6',
                content: 'The (ISC)\u00b2 Code of Ethics applies to all CISSP, CCSP, and SSCP holders. Its four canons are ordered by priority.',
                details: ['Canon 1: Protect society, the common good, necessary public trust, and the infrastructure', 'Canon 2: Act honorably, honestly, justly, responsibly, and legally', 'Canon 3: Provide diligent and competent service to principals', 'Canon 4: Advance and protect the profession', 'Canons are prioritized: society first, profession last'],
                realWorld: 'A CISSP discovers a critical vulnerability in their company\'s product that endangers public safety. Canon 1 (society) takes priority: they must report it, even if Canon 3 (service to employer) conflicts.'
            },
            {
                title: 'ISACA Code of Professional Ethics',
                icon: '\ud83d\udcdc',
                content: 'ISACA\'s code applies to CISA, CISM, CRISC, and CGEIT holders. It emphasizes governance, risk, and compliance.',
                details: ['Support the implementation of appropriate standards and procedures for IT', 'Perform duties with objectivity, due diligence, and professional care', 'Serve the interests of stakeholders in a lawful manner', 'Maintain privacy and confidentiality of information', 'Maintain competency in respective fields and only undertake those activities within competence'],
                realWorld: 'A CISM auditor discovers their client is not compliant with PCI-DSS. Even though reporting the finding will cost the client business, the auditor must report accurately, as objectivity and due diligence require it.'
            },
            {
                title: 'Ethical Hacking Boundaries',
                icon: '\ud83d\udee1\ufe0f',
                content: 'Penetration testers and ethical hackers operate under strict rules of engagement. The line between ethical and criminal hacking is authorization.',
                details: ['ALWAYS have written authorization (scope, timeline, methods)', 'Stay within the defined scope (no scope creep)', 'Report ALL findings to the client, including accidental finds', 'Do not access, copy, or exfiltrate real data beyond what is needed to prove the finding', 'Do not cause intentional service disruption unless explicitly authorized', 'Responsible disclosure: give vendors time to patch before public disclosure'],
                realWorld: 'A pen tester finds a way to access the HR database during an engagement scoped only to the web application. They immediately stop, document the access path, report it to the client, and do not view any HR data.'
            },
            {
                title: 'Whistleblowing & Disclosure',
                icon: '\ud83d\udce2',
                content: 'When ethical obligations conflict with employer directives, professionals must understand their legal protections and moral obligations.',
                details: ['Legal protections vary by jurisdiction', 'Internal channels should be exhausted first (chain of command)', 'Document everything', 'Regulatory bodies (SEC, CISA, Inspector General) are external options', 'Sarbanes-Oxley, Dodd-Frank protect financial whistleblowers', 'False Claims Act protects those reporting government fraud'],
                realWorld: 'A security analyst discovers their company is hiding a data breach that affected millions of customers. After internal reporting is ignored, they contact the relevant regulatory body under whistleblower protection laws.'
            }
        ],
        interactive: {
            type: 'scenario_matcher',
            title: 'Ethics Decision Challenge',
            instructions: 'For each scenario, identify the correct ethical action.',
            items: [
                { scenario: 'Your employer asks you to hide a security breach from regulators.', answer: 'Refuse and report through proper channels', explanation: '(ISC)\u00b2 Canon 1: Protect society takes priority over employer instructions. Hiding breaches violates legal and ethical obligations.' },
                { scenario: 'During a pen test, you accidentally access systems outside the agreed scope.', answer: 'Stop immediately, document, and report to client', explanation: 'Ethical hackers must stay within scope. Accidental access should be reported, but the data should not be further explored.' },
                { scenario: 'A colleague shares answers to a certification exam.', answer: 'Decline and report the violation', explanation: 'All major security certifications prohibit sharing exam content. Accepting compromises the profession (Canon 4).' },
                { scenario: 'You discover a critical zero-day in a popular open-source library.', answer: 'Responsibly disclose to the maintainers before publishing', explanation: 'Responsible disclosure gives vendors time to patch before public knowledge enables exploitation.' },
                { scenario: 'A client asks you to test their competitor\'s network "as a favor."', answer: 'Refuse: this is unauthorized access, regardless of who requests it', explanation: 'Testing without written authorization from the network owner is illegal, period.' },
                { scenario: 'You realize you lack the expertise to complete a security assessment.', answer: 'Decline or bring in a qualified professional', explanation: 'All codes of ethics require only undertaking work within your competence.' }
            ]
        },
        quiz: [
            { question: 'What is the FIRST canon of the (ISC)\u00b2 Code of Ethics?', options: ['Provide competent service to principals', 'Act honorably and legally', 'Advance and protect the profession', 'Protect society, the common good, and the infrastructure'], correct: 3, explanation: 'Canon 1 is "Protect society, the common good, necessary public trust, and the infrastructure." It takes priority over all other canons.' },
            { question: 'A CISSP discovers a vulnerability that could endanger public safety. Their employer says to ignore it. What should they do?', options: ['Follow employer instructions (Canon 3)', 'Report it, as Canon 1 (society) takes priority over Canon 3 (employer)', 'Quit immediately without reporting', 'Exploit it to demonstrate the risk'], correct: 1, explanation: 'The canons are prioritized. Canon 1 (protect society) overrides Canon 3 (serve principals) when they conflict.' },
            { question: 'What LEGALLY separates ethical hacking from criminal hacking?', options: ['The tools used', 'The hacker\'s intent', 'Written authorization from the system owner', 'Whether the hacker finds any vulnerabilities'], correct: 2, explanation: 'Authorization is the legal distinction. Without explicit written permission, accessing a system is illegal regardless of intent or tools.' },
            { question: 'A penetration tester finds a critical SQL injection vulnerability but it is outside their scope of engagement. What is the ethical action?', options: ['Exploit it fully to show the client the risk', 'Ignore it since it is out of scope', 'Report the finding to the client without further exploitation', 'Post about it on social media to pressure the client'], correct: 2, explanation: 'Report the finding without further exploitation. The discovery is valuable, but going beyond scope without authorization is unethical.' },
            { question: 'Under responsible disclosure, how should a researcher handle a zero-day vulnerability?', options: ['Immediately publish it publicly for maximum awareness', 'Sell it to the highest bidder', 'Notify the vendor privately and give them reasonable time to patch before publishing', 'Keep it secret forever'], correct: 2, explanation: 'Responsible disclosure means notifying the vendor first and giving them reasonable time (typically 90 days) to develop a patch before public disclosure.' },
            { question: 'ISACA\'s code of ethics emphasizes which of these responsibilities?', options: ['Breaking systems to test them without permission', 'Performing duties with objectivity, due diligence, and professional care', 'Sharing audit findings publicly to pressure compliance', 'Prioritizing speed over accuracy in audits'], correct: 1, explanation: 'ISACA requires objectivity, due diligence, and professional care in all professional activities.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // ETHICS CHALLENGE (Scenario-based)
    // ═══════════════════════════════════════════════════════════════════
    ethics_challenge: {
        id: 'ethics_challenge',
        name: 'Ethics Challenge',
        icon: '\ud83e\udde0',
        color: '#a855f7',
        subtitle: 'Real-world ethical dilemma scenarios',
        description: 'Test your understanding of cybersecurity ethics with challenging real-world scenarios. Each scenario presents a dilemma where multiple options may seem reasonable, but only one aligns with professional codes of conduct.',
        keyConcepts: ['Ethical Dilemmas', 'Professional Judgment', 'Competing Priorities', 'Duty of Care', 'Legal Compliance'],
        sections: [
            {
                title: 'When Ethics Conflict',
                icon: '\u2696\ufe0f',
                content: 'The hardest ethical decisions arise when two legitimate principles collide: loyalty to your employer versus public safety, client confidentiality versus legal obligations, or personal gain versus professional duty.',
                details: ['Hierarchy of obligations: public safety > law > employer > self', 'Document everything, especially verbal instructions', 'Consult legal counsel when unsure', 'Industry codes provide a framework, not all answers', 'Good intentions do not excuse bad actions'],
                realWorld: 'A security consultant discovers that their client\'s medical device has a vulnerability that could harm patients. The client says "it\'s a known issue, we\'ll fix it next quarter." The consultant faces a dilemma: client confidentiality vs. public safety.'
            },
            {
                title: 'The Gray Areas',
                icon: '\ud83c\udf2b\ufe0f',
                content: 'Not every situation has a clear black-and-white answer. Ethical frameworks help navigate the gray areas where reasonable people might disagree.',
                details: ['Bug bounty scope vs. curiosity', 'Collecting threat intelligence from dark web forums', 'Using offensive tools for defensive research', 'Reporting colleague misconduct vs. loyalty', 'Competitive intelligence gathering vs. espionage'],
                realWorld: 'A threat intelligence analyst monitors dark web forums for their company\'s stolen data. They notice another company\'s data for sale. Are they ethically obligated to notify the other company? Most codes would say yes.'
            },
            {
                title: 'Legal vs. Ethical',
                icon: '\ud83d\udcdc',
                content: 'Legal compliance and ethical behavior are related but not identical. Something can be legal but unethical, or ethical but technically illegal.',
                details: ['Collecting data "because we can" vs. "because we should"', 'Legal surveillance that erodes public trust', 'Selling security tools to authoritarian regimes (legal, ethical?)', 'Responsible disclosure may violate terms of service', 'CFAA (Computer Fraud and Abuse Act) has been criticized as overly broad'],
                realWorld: 'A security researcher discovers a vulnerability in a government website while casually browsing. Reporting it could help millions of citizens, but the CFAA theoretically criminalizes the access that led to the discovery.'
            }
        ],
        interactive: {
            type: 'scenario_matcher',
            title: 'What Would You Do?',
            instructions: 'Choose the most ethical response to each dilemma.',
            items: [
                { scenario: 'Your client\'s CEO asks you to install a keylogger on an employee\'s computer without their knowledge, claiming they suspect embezzlement.', answer: 'Advise the CEO to involve HR and Legal first', explanation: 'Even if legal in some jurisdictions with employer-owned equipment, covert surveillance should involve proper legal and HR channels.' },
                { scenario: 'You find customer credit card numbers stored in plaintext in your company\'s database. Management says "it\'s not your department."', answer: 'Escalate through proper channels, document the finding', explanation: 'You have a duty to report security risks. Escalate through the chain of command and document your attempts.' },
                { scenario: 'A recruiter offers you double your salary to bring your current employer\'s security architecture documentation to a competitor.', answer: 'Decline: this is theft of trade secrets and a violation of your NDA', explanation: 'Regardless of financial incentive, sharing proprietary information violates ethics codes, NDAs, and likely trade secret laws.' },
                { scenario: 'During a penetration test, you discover evidence of actual criminal activity (child exploitation material) on a server.', answer: 'Immediately stop testing, preserve evidence, and report to law enforcement', explanation: 'Legal obligations to report crimes override client confidentiality. Stop, preserve, report.' },
                { scenario: 'A vendor gives you an expensive gift after you recommended their product to your company.', answer: 'Disclose the gift to management and follow your company\'s gift policy', explanation: 'Accepting gifts from vendors can create conflicts of interest. Transparency through disclosure is the ethical path.' }
            ]
        },
        quiz: [
            { question: 'When ethical obligations conflict, what is the CORRECT priority order?', options: ['Employer > Law > Public > Self', 'Self > Employer > Public > Law', 'Public Safety > Law > Employer > Self', 'Law > Public > Self > Employer'], correct: 2, explanation: 'The hierarchy is: public safety first, then legal compliance, then employer obligations, then self-interest.' },
            { question: 'During an authorized pen test, you discover evidence of a crime. What should you do?', options: ['Include it in your final report and move on', 'Stop testing, preserve evidence, notify law enforcement', 'Ignore it; it is outside your scope', 'Confront the suspect directly'], correct: 1, explanation: 'Discovery of criminal activity triggers legal obligations that override the pen test scope. Stop, preserve, report.' },
            { question: 'A colleague confides they are selling company vulnerability data to a competitor. What should you do?', options: ['Keep their confidence since they trusted you', 'Report through proper channels (HR, security, compliance)', 'Confront them and give them a chance to stop', 'Join the scheme for a share of the profit'], correct: 1, explanation: 'Duty to the organization and the profession requires reporting. Keeping the secret makes you complicit.' },
            { question: 'Why is "it was just a gray area" NOT a valid defense for unethical behavior?', options: ['Because all ethical situations are clearly black or white', 'Because professional codes of ethics provide frameworks for navigating gray areas', 'Because only illegal actions are unethical', 'Because ethics do not apply to cybersecurity'], correct: 1, explanation: 'Professional codes exist specifically to guide decisions in gray areas. "I was not sure" is why the codes exist.' },
            { question: 'A company legally collects employee browsing data without informing them. Is this ethical?', options: ['Yes, it is legal so it is ethical', 'No, ethical practice requires transparency even when the law does not mandate it', 'It depends on what they find', 'Only if the employees are using company equipment'], correct: 1, explanation: 'Legal compliance is the minimum bar. Ethical practice requires transparency, informed consent, and proportionality.' },
            { question: 'What is the ethical obligation when you realize you lack the expertise for a security engagement?', options: ['Accept it and learn on the job', 'Accept it but charge less', 'Decline or bring in a qualified team member', 'Accept it since the client chose you'], correct: 2, explanation: 'All codes of ethics require only performing work within your competence. Accepting work you cannot do competently is unethical regardless of intent.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // PHYSICAL & ENVIRONMENTAL PROTECTION
    // ═══════════════════════════════════════════════════════════════════
    physical_protection: {
        id: 'physical_protection',
        name: 'Physical & Environmental Security',
        icon: '\ud83c\udfdb\ufe0f',
        color: '#a855f7',
        subtitle: 'Protecting people, hardware, and facilities',
        description: 'Physical security protects personnel, hardware, software, and data from physical actions and events that could cause serious loss or damage. Environmental controls protect against natural and man-made environmental threats.',
        keyConcepts: ['Perimeter Security', 'Access Control Systems', 'Environmental Controls', 'Fire Suppression', 'CCTV', 'HVAC', 'Mantraps'],
        sections: [
            {
                title: 'Perimeter & Facility Security',
                icon: '\ud83c\udff0',
                content: 'The first line of physical defense. Multiple rings of security from the property boundary to the server rack.',
                details: ['Fences (6ft minimum, 8ft with barbed wire for high security)', 'Bollards and vehicle barriers', 'Security lighting (critical around entrances and parking)', 'Guard stations and visitor management', 'Landscaping for natural surveillance (CPTED principles)'],
                realWorld: 'A data center uses CPTED (Crime Prevention Through Environmental Design): clear sight lines, no hiding spots, motion-activated lighting, and bollards rated to stop a 15,000-lb vehicle at 50 mph.'
            },
            {
                title: 'Physical Access Controls',
                icon: '\ud83d\udd10',
                content: 'Mechanisms that control who can enter specific areas. Layered from public areas through increasingly restricted zones.',
                details: ['Badge readers (proximity, smart card)', 'Biometric scanners (fingerprint, iris, palm vein)', 'PIN pads and combination locks', 'Mantraps / sally ports (anti-tailgating)', 'Anti-passback systems', 'Visitor escort policies'],
                realWorld: 'AWS data centers use a layered approach: badge + PIN at the perimeter, biometric + badge at the building, mantrap at the data floor, and two-person access for critical infrastructure. No phones, cameras, or USB devices allowed past the lobby.'
            },
            {
                title: 'Environmental Controls',
                icon: '\ud83c\udf21\ufe0f',
                content: 'Systems that protect equipment from environmental hazards including temperature, humidity, water, fire, and power issues.',
                details: ['HVAC: Server rooms at 64-75\u00b0F (18-24\u00b0C), 40-60% humidity', 'Fire suppression: FM-200, Novec 1230, or Inergen (not water near servers)', 'Water detection: sensors under raised floors', 'UPS (Uninterruptible Power Supply) for immediate backup', 'Generator for extended outages', 'Hot/cold aisle containment for efficient cooling'],
                realWorld: 'A Tier IV data center maintains 2N+1 redundancy on cooling (double the needed capacity plus one spare). If the primary HVAC fails, the redundant system activates within seconds. Water sensors under the raised floor trigger alerts before any equipment is damaged.'
            },
            {
                title: 'Surveillance & Monitoring',
                icon: '\ud83d\udcf9',
                content: 'Continuous monitoring of physical spaces using cameras, sensors, and security personnel.',
                details: ['CCTV with 90+ day retention', 'Motion sensors and infrared detectors', 'Tamper-evident seals on equipment', 'Security guard patrols (random schedules)', 'Alarm systems with central monitoring', 'Environmental sensors (temperature, humidity, smoke, water)'],
                realWorld: 'A government SCIF uses 360-degree cameras at every entry point, vibration sensors on walls and floors, RF shielding to prevent signal leakage, and tempest-rated equipment to prevent electromagnetic emanation eavesdropping.'
            }
        ],
        interactive: {
            type: 'scenario_matcher',
            title: 'Physical Security Assessment',
            instructions: 'Identify the correct physical security control for each scenario.',
            items: [
                { scenario: 'Unauthorized vehicles could ram through the front entrance.', answer: 'Bollards or vehicle barriers', explanation: 'Bollards rated for the expected vehicle weight and speed prevent vehicle-borne attacks.' },
                { scenario: 'Employees hold the door open for people behind them without verifying badges.', answer: 'Mantrap/sally port with anti-tailgating', explanation: 'Mantraps require each person to authenticate individually, preventing tailgating.' },
                { scenario: 'The server room temperature spikes when the primary HVAC fails.', answer: 'Redundant HVAC with automatic failover', explanation: 'Redundant cooling systems prevent thermal damage when the primary system fails.' },
                { scenario: 'A fire breaks out near the server racks.', answer: 'Clean agent fire suppression (FM-200 or Novec 1230)', explanation: 'Clean agent systems extinguish fires without damaging electronic equipment, unlike water sprinklers.' },
                { scenario: 'Power outage during business hours affects the data center.', answer: 'UPS for immediate power + generator for extended outage', explanation: 'UPS provides instant battery backup while generators spin up for longer-term power.' },
                { scenario: 'Someone accesses the server room, removes a hard drive, and leaves with no record.', answer: 'CCTV + badge logging + tamper-evident seals', explanation: 'Combined surveillance, access logging, and tamper evidence would detect and document the theft.' }
            ]
        },
        quiz: [
            { question: 'What is the recommended temperature range for a server room?', options: ['50-60\u00b0F (10-16\u00b0C)', '64-75\u00b0F (18-24\u00b0C)', '80-90\u00b0F (27-32\u00b0C)', 'Temperature does not matter with proper cooling'], correct: 1, explanation: 'ASHRAE recommends 64-75\u00b0F (18-24\u00b0C) for data center environments. Too cold wastes energy; too hot risks equipment damage.' },
            { question: 'Which fire suppression system is MOST appropriate for a server room?', options: ['Water sprinklers', 'FM-200 or Novec 1230', 'Halon (banned in most countries)', 'Sand buckets'], correct: 1, explanation: 'Clean agent systems like FM-200 or Novec 1230 extinguish fires without water damage to electronics and are environmentally safe.' },
            { question: 'What is a mantrap?', options: ['A type of malware', 'A honeypot for network attacks', 'A small room with two interlocking doors that prevents tailgating', 'A type of firewall'], correct: 2, explanation: 'A mantrap is a physical access control with two doors: the first must close and lock before the second opens, ensuring each person authenticates individually.' },
            { question: 'What does CPTED stand for?', options: ['Computer Protection Through Encryption and Defense', 'Crime Prevention Through Environmental Design', 'Cybersecurity Planning Through Enterprise Defense', 'Critical Protection of Technology and Electronic Data'], correct: 1, explanation: 'CPTED (Crime Prevention Through Environmental Design) uses physical design to deter criminal behavior through natural surveillance, access control, and territorial reinforcement.' },
            { question: 'A UPS provides power for approximately how long during an outage?', options: ['Minutes (enough for generator startup or graceful shutdown)', '24 hours', '1 week', 'Indefinitely'], correct: 0, explanation: 'UPS typically provides 5-30 minutes of battery backup, enough to bridge to generator startup or perform graceful server shutdown.' },
            { question: 'What is the purpose of hot/cold aisle containment in a data center?', options: ['To separate classified from unclassified equipment', 'To improve cooling efficiency by separating hot exhaust from cold intake air', 'To create fire barriers between server rows', 'To reduce noise levels'], correct: 1, explanation: 'Hot/cold aisle containment prevents hot exhaust air from mixing with cold intake air, significantly improving cooling efficiency and reducing energy costs.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // PRIVACY
    // ═══════════════════════════════════════════════════════════════════
    privacy: {
        id: 'privacy',
        name: 'Privacy Concepts & Regulations',
        icon: '\ud83d\udd75\ufe0f',
        color: '#a855f7',
        subtitle: 'PII, PHI, GDPR, CCPA, and privacy principles',
        description: 'Privacy is the right of individuals to control how their personal information is collected, used, and shared. Understanding privacy regulations and data protection principles is essential for every cybersecurity professional.',
        keyConcepts: ['PII', 'PHI', 'GDPR', 'CCPA', 'Data Minimization', 'Right to be Forgotten', 'Privacy by Design'],
        sections: [
            {
                title: 'Types of Protected Information',
                icon: '\ud83d\udcc2',
                content: 'Different categories of personal data have different protection requirements. Understanding what constitutes protected information is the first step in privacy compliance.',
                details: ['PII (Personally Identifiable Information): SSN, name, address, email, biometrics', 'PHI (Protected Health Information): medical records, prescriptions, insurance claims', 'PCI DSS data: credit card numbers, CVV, cardholder data', 'Sensitive PII: data that could cause substantial harm if disclosed (SSN, financial accounts)', 'Non-sensitive PII: publicly available data (name, address in phone book)'],
                realWorld: 'A hospital database contains patient names (PII), medical diagnoses (PHI), and insurance billing codes (PCI data if credit cards are stored). Each category has different regulatory requirements: HIPAA for PHI, PCI-DSS for payment data, and various state laws for PII.'
            },
            {
                title: 'GDPR (EU)',
                icon: '\ud83c\uddea\ud83c\uddfa',
                content: 'The General Data Protection Regulation is the world\'s strongest privacy law. It applies to any organization that processes EU residents\' data, regardless of where the organization is located.',
                details: ['Right to access: individuals can request their data', 'Right to erasure ("right to be forgotten")', 'Data portability: transfer data between services', 'Breach notification within 72 hours', 'Fines up to 4% of global annual revenue or 20M EUR', 'Requires Data Protection Officer (DPO) for many organizations', 'Lawful basis required for all processing (consent, contract, legal, vital, public, legitimate interest)'],
                realWorld: 'A US-based SaaS company with EU customers must comply with GDPR. When a German user exercises their Right to Erasure, the company must delete all their personal data within 30 days and confirm deletion to the user.'
            },
            {
                title: 'CCPA/CPRA (California)',
                icon: '\ud83c\uddfa\ud83c\uddf8',
                content: 'The California Consumer Privacy Act (and its amendment CPRA) gives California residents significant control over their personal data.',
                details: ['Right to know what data is collected', 'Right to delete personal information', 'Right to opt-out of data sales', 'Right to non-discrimination for exercising privacy rights', 'Applies to businesses meeting revenue/data thresholds', '"Do Not Sell My Personal Information" link required'],
                realWorld: 'An e-commerce company with California customers must display a "Do Not Sell My Personal Information" link on their website and honor opt-out requests within 45 days.'
            },
            {
                title: 'Privacy by Design',
                icon: '\ud83c\udfd7\ufe0f',
                content: 'A framework that embeds privacy into the design of systems and processes from the beginning, not as an afterthought.',
                details: ['Proactive, not reactive: anticipate privacy risks', 'Privacy as the default setting', 'Privacy embedded into design architecture', 'Full functionality: privacy and functionality, not privacy OR functionality', 'End-to-end security: full lifecycle protection', 'Visibility and transparency', 'Respect for user privacy'],
                realWorld: 'A new app collects only the minimum data needed (data minimization), encrypts it by default, allows users to delete their account and all data, and provides a clear, readable privacy policy before any data is collected.'
            }
        ],
        interactive: {
            type: 'scenario_matcher',
            title: 'Privacy Regulation Matcher',
            instructions: 'Match each scenario to the relevant privacy regulation or principle.',
            items: [
                { scenario: 'A German citizen requests that a US company delete all their personal data.', answer: 'GDPR (Right to Erasure)', explanation: 'GDPR applies to EU residents\' data regardless of where the company is located.' },
                { scenario: 'A California resident wants to know what data a website has collected about them.', answer: 'CCPA (Right to Know)', explanation: 'CCPA gives California residents the right to know what personal data is collected.' },
                { scenario: 'A new app is designed to collect only the email address needed for login, nothing more.', answer: 'Privacy by Design (Data Minimization)', explanation: 'Collecting only necessary data follows the data minimization principle of Privacy by Design.' },
                { scenario: 'A company suffers a data breach affecting EU customers and notifies regulators within 72 hours.', answer: 'GDPR (Breach Notification)', explanation: 'GDPR requires breach notification to supervisory authorities within 72 hours.' },
                { scenario: 'A website displays "Do Not Sell My Personal Information" at the bottom of every page.', answer: 'CCPA (Opt-Out of Sale)', explanation: 'CCPA requires businesses that sell personal data to provide an opt-out mechanism.' },
                { scenario: 'A patient requests a copy of all their medical records from a hospital.', answer: 'HIPAA (Right of Access)', explanation: 'HIPAA gives patients the right to access their protected health information.' }
            ]
        },
        quiz: [
            { question: 'Which of the following is considered PII?', options: ['A company\'s stock price', 'An employee\'s Social Security Number', 'The weather forecast', 'Open-source software code'], correct: 1, explanation: 'PII is any information that can identify a specific individual. SSN is a classic example of sensitive PII.' },
            { question: 'Under GDPR, how quickly must a data breach be reported to the supervisory authority?', options: ['24 hours', '48 hours', '72 hours', '30 days'], correct: 2, explanation: 'GDPR Article 33 requires notification to the supervisory authority within 72 hours of becoming aware of a personal data breach.' },
            { question: 'What is the maximum GDPR fine?', options: ['$1 million USD', '2% of global revenue', '4% of global annual revenue or 20M EUR (whichever is higher)', '$500,000 per violation'], correct: 2, explanation: 'GDPR\'s maximum fine for the most serious violations is 4% of global annual turnover or 20 million euros, whichever is greater.' },
            { question: 'Which principle requires collecting only the data necessary for the stated purpose?', options: ['Data Maximization', 'Data Minimization', 'Data Portability', 'Data Retention'], correct: 1, explanation: 'Data minimization requires collecting only the minimum amount of personal data needed for the specific purpose.' },
            { question: 'What is "Privacy by Design"?', options: ['Encrypting all data after a breach', 'Embedding privacy into system design from the start, not as an afterthought', 'Designing privacy policies', 'A GDPR fine category'], correct: 1, explanation: 'Privacy by Design is a framework that proactively embeds privacy protections into the design of systems, not as a bolt-on after development.' },
            { question: 'A hospital stores patient medical records. Under which regulation are these PRIMARILY protected?', options: ['CCPA', 'PCI-DSS', 'HIPAA', 'SOX'], correct: 2, explanation: 'HIPAA (Health Insurance Portability and Accountability Act) specifically governs the protection of Protected Health Information (PHI) in healthcare.' },
            { question: 'Under CCPA, what right allows consumers to prevent companies from selling their data?', options: ['Right to Know', 'Right to Delete', 'Right to Opt-Out', 'Right to Portability'], correct: 2, explanation: 'CCPA gives consumers the right to opt-out of the sale of their personal information, typically via a "Do Not Sell My Personal Information" link.' }
        ]
    }
};
