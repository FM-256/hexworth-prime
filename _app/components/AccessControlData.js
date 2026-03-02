/**
 * AccessControlData.js — Access control topic data
 *
 * 3 topics covering access control models, biometrics, and Kerberos
 * Used by AccessControlRenderer.js
 */
const AccessControlData = {

    // ═══════════════════════════════════════════════════════════════════
    // ACCESS CONTROL MODELS
    // ═══════════════════════════════════════════════════════════════════
    access_control: {
        id: 'access_control',
        name: 'Access Control Models',
        icon: '/assets/images/icons/icon-padlock.webp',
        color: '#a855f7',
        subtitle: 'DAC, MAC, RBAC, ABAC & Rule-Based',
        description: 'Access control models define how permissions are granted and enforced. Choosing the right model depends on the security requirements, organizational structure, and regulatory environment.',
        keyConcepts: ['DAC', 'MAC', 'RBAC', 'ABAC', 'Rule-Based', 'Lattice-Based', 'Bell-LaPadula', 'Biba'],
        sections: [
            {
                title: 'Discretionary Access Control (DAC)',
                icon: '/assets/images/icons/icon-users.webp',
                content: 'The resource owner decides who gets access. DAC is flexible but relies on users to make good security decisions. Most common in consumer operating systems.',
                details: ['Owner of the resource controls permissions', 'Common in Windows NTFS and Unix file systems', 'Flexible but prone to human error', 'No central enforcement of security policy', 'Risk: owner can share access too broadly', 'Identity-based: permissions tied to user identity'],
                realWorld: 'On a shared Windows file server, each department manager sets permissions on their folders. The marketing manager shares a folder with "Everyone" for convenience, accidentally exposing confidential campaign data to the entire company.'
            },
            {
                title: 'Mandatory Access Control (MAC)',
                icon: '/assets/images/icons/icon-castle.webp',
                content: 'A central authority (the system) enforces access based on security labels. Users cannot override the system\'s access decisions regardless of ownership.',
                details: ['System enforces access policy, not the user', 'Uses security labels/classifications (Top Secret, Secret, Confidential, Unclassified)', 'Bell-LaPadula: "no read up, no write down" (confidentiality)', 'Biba Model: "no read down, no write up" (integrity)', 'Used in military and government systems (SELinux, trusted OS)', 'Most restrictive but most secure model'],
                realWorld: 'In a classified government network, a user with "Secret" clearance can read Secret and Confidential documents but cannot access Top Secret files. The system enforces this regardless of who owns the file. Even the file creator cannot share a Top Secret document with a Secret-cleared user.'
            },
            {
                title: 'Role-Based Access Control (RBAC)',
                icon: '/assets/images/icons/icon-mask.webp',
                content: 'Access permissions are assigned to roles, and users are assigned to roles based on their job function. The most widely used model in enterprise environments.',
                details: ['Permissions assigned to roles, not individuals', 'Users are assigned one or more roles', 'Simplifies administration for large organizations', 'Supports separation of duties and least privilege', 'Role hierarchy: senior roles inherit junior role permissions', 'Examples: Active Directory groups, AWS IAM roles, database roles'],
                realWorld: 'A hospital defines roles: Physician, Nurse, Pharmacist, Billing. Physicians can view and modify medical records. Nurses can view records but not modify prescriptions. Pharmacists can view prescriptions but not diagnoses. When Dr. Smith joins, she is assigned the Physician role and immediately gets all associated permissions.'
            },
            {
                title: 'Attribute-Based Access Control (ABAC)',
                icon: '/assets/images/icons/icon-tag.webp',
                content: 'Access decisions based on attributes of the user, resource, action, and environment. The most granular and flexible model, capable of expressing complex access policies.',
                details: ['User attributes: department, clearance, role, location', 'Resource attributes: classification, owner, sensitivity', 'Action attributes: read, write, execute, delete', 'Environment attributes: time of day, IP address, device type', 'Policies evaluate combinations of attributes dynamically', 'Examples: AWS IAM policies, XACML, Azure AD Conditional Access'],
                realWorld: 'A policy states: "Allow access to financial reports IF user.department=Finance AND user.clearance>=Confidential AND environment.time is business hours AND environment.location is corporate network." A finance manager at the office during work hours gets access; the same person at home after hours does not.'
            }
        ],
        interactive: {
            type: 'scenario_matcher',
            title: 'Choose the Access Control Model',
            instructions: 'Select the most appropriate access control model for each scenario.',
            items: [
                { scenario: 'A military system must enforce "no read up, no write down" based on clearance levels.', answer: 'MAC (Mandatory)', explanation: 'MAC with Bell-LaPadula enforces classification-based access that users cannot override.' },
                { scenario: 'A company wants to assign permissions based on job titles (Manager, Analyst, Intern).', answer: 'RBAC (Role-Based)', explanation: 'RBAC maps permissions to roles based on job functions, the most common enterprise model.' },
                { scenario: 'A user creates a file and wants to share it with specific colleagues.', answer: 'DAC (Discretionary)', explanation: 'DAC allows the resource owner to decide who gets access to their files.' },
                { scenario: 'Access should depend on user department, time of day, device type, and data sensitivity.', answer: 'ABAC (Attribute-Based)', explanation: 'ABAC evaluates multiple attributes dynamically, supporting complex conditional policies.' },
                { scenario: 'A firewall needs to allow traffic based on source IP and port number rules.', answer: 'Rule-Based', explanation: 'Rule-based access control applies predefined rules uniformly to all subjects, common in firewalls.' },
                { scenario: 'A hospital assigns different access levels for Doctors, Nurses, and Administrative Staff.', answer: 'RBAC (Role-Based)', explanation: 'RBAC groups users by role and assigns appropriate permissions to each role.' }
            ]
        },
        quiz: [
            { question: 'Which access control model allows the resource OWNER to determine who has access?', options: ['MAC', 'RBAC', 'DAC', 'ABAC'], correct: 2, explanation: 'Discretionary Access Control (DAC) gives the resource owner discretion over who can access their resources.' },
            { question: 'Bell-LaPadula model enforces "no read up, no write down." Which security property does it protect?', options: ['Availability', 'Integrity', 'Confidentiality', 'Authentication'], correct: 2, explanation: 'Bell-LaPadula protects confidentiality: users cannot read above their clearance (no read up) and cannot write to lower levels (no write down) to prevent information leakage.' },
            { question: 'The Biba model is the inverse of Bell-LaPadula. What does it protect?', options: ['Confidentiality', 'Integrity', 'Availability', 'Nonrepudiation'], correct: 1, explanation: 'Biba protects integrity: "no read down, no write up" prevents contamination from lower integrity levels.' },
            { question: 'A company assigns permissions to "Sales Rep," "Sales Manager," and "VP Sales" groups. What model is this?', options: ['DAC', 'MAC', 'RBAC', 'Rule-Based'], correct: 2, explanation: 'RBAC assigns permissions to roles (job functions), and users are assigned to roles. This is the most common enterprise model.' },
            { question: 'An access policy states: "IF user.location=HQ AND time=9AM-5PM AND device=managed THEN allow." What model?', options: ['DAC', 'MAC', 'RBAC', 'ABAC'], correct: 3, explanation: 'ABAC evaluates multiple attributes (location, time, device) to make dynamic access decisions.' },
            { question: 'Which model is MOST restrictive and commonly used in military/government classified systems?', options: ['DAC', 'RBAC', 'MAC', 'ABAC'], correct: 2, explanation: 'MAC is the most restrictive model. A central authority enforces access based on security labels; users cannot override the system\'s decisions.' },
            { question: 'What is the primary risk of DAC?', options: ['Too complex to administer', 'Users may grant access too broadly due to poor security decisions', 'Requires security clearances for all users', 'Does not support file permissions'], correct: 1, explanation: 'DAC relies on resource owners to make security decisions. Users may over-share access for convenience, creating security risks.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // BIOMETRICS
    // ═══════════════════════════════════════════════════════════════════
    biometrics: {
        id: 'biometrics',
        name: 'Biometric Authentication',
        icon: '/assets/images/icons/icon-eye.webp',
        color: '#a855f7',
        subtitle: 'Fingerprint, iris, facial recognition & behavioral biometrics',
        description: 'Biometrics use unique physical or behavioral characteristics to verify identity. As an authentication factor ("something you are"), biometrics provide strong identity verification but raise privacy concerns and cannot be changed if compromised.',
        keyConcepts: ['FAR', 'FRR', 'CER/EER', 'Fingerprint', 'Iris Scan', 'Facial Recognition', 'Voice Recognition', 'Behavioral'],
        sections: [
            {
                title: 'Biometric Types',
                icon: '/assets/images/icons/icon-shield.webp',
                content: 'Biometrics fall into two categories: physiological (physical characteristics) and behavioral (patterns of behavior). Each type has different accuracy, cost, and user acceptance levels.',
                details: ['Physiological: fingerprint, iris, retina, facial geometry, palm vein, hand geometry', 'Behavioral: typing patterns (keystroke dynamics), gait analysis, voice patterns, signature dynamics', 'Fingerprint: most common, low cost, well-accepted, can be spoofed with prints', 'Iris scan: highly accurate, contactless, works through glasses, expensive', 'Facial recognition: convenient, contactless, can be fooled by photos/masks in basic systems', 'Palm vein: very accurate, difficult to spoof, requires specialized scanner'],
                realWorld: 'A data center uses palm vein scanning for entry because it is nearly impossible to spoof (veins are internal) and has one of the lowest false acceptance rates. Employees simply wave their hand over the scanner without touching anything.'
            },
            {
                title: 'Error Rates: FAR, FRR & CER',
                icon: '/assets/images/icons/icon-barchart.webp',
                content: 'The effectiveness of a biometric system is measured by its error rates. Understanding FAR, FRR, and CER is essential for choosing and tuning biometric systems.',
                details: ['FAR (False Acceptance Rate): unauthorized person incorrectly accepted (Type II error)', 'FRR (False Rejection Rate): authorized person incorrectly rejected (Type I error)', 'CER/EER (Crossover/Equal Error Rate): point where FAR = FRR (lower is better)', 'Tightening security: decreases FAR but increases FRR (fewer false accepts, more false rejects)', 'Loosening security: decreases FRR but increases FAR (fewer false rejects, more false accepts)', 'CER is the standard metric for comparing biometric systems'],
                realWorld: 'A high-security facility needs very low FAR (cannot let unauthorized people in), so they set the fingerprint scanner sensitivity very high. This increases FRR (authorized employees sometimes need to scan twice), but the trade-off is acceptable for security.'
            },
            {
                title: 'Biometric Enrollment & Matching',
                icon: '/assets/images/icons/icon-gear.webp',
                content: 'During enrollment, the system captures a reference template of the biometric feature. During authentication, a new scan is compared against the stored template.',
                details: ['Enrollment: initial capture of biometric data (multiple samples for accuracy)', 'Template: mathematical representation of the biometric (not the raw image)', 'One-to-one matching: verification (compare against one template - "Is this person who they claim?")', 'One-to-many matching: identification (compare against all templates - "Who is this person?")', 'Liveness detection: ensures a real person is present (not a photo, recording, or prosthetic)', 'Template protection: templates should be encrypted and stored securely'],
                realWorld: 'Airport facial recognition uses one-to-many matching: a traveler\'s face is compared against a watchlist database of known threats. Corporate access uses one-to-one matching: an employee scans their badge (claims identity) then scans their fingerprint (verifies the claim).'
            },
            {
                title: 'Privacy & Security Concerns',
                icon: '/assets/images/icons/icon-siren.webp',
                content: 'Unlike passwords, biometrics cannot be changed if compromised. This creates unique privacy and security challenges.',
                details: ['Cannot be reset: a compromised fingerprint is compromised forever', 'Biometric databases are high-value targets for attackers', 'Function creep: biometric data collected for one purpose used for another', 'Surveillance concerns: facial recognition in public spaces', 'Legal frameworks: BIPA (Illinois), GDPR (EU) regulate biometric data', 'Cancelable biometrics: mathematical transforms that can be revoked without losing the original biometric'],
                realWorld: 'In 2019, a breach exposed fingerprint data for 1 million users from a biometric security platform. Unlike passwords, these users cannot change their fingerprints. This incident accelerated interest in cancelable biometrics, where a one-way transformation is applied to the biometric template so the transform can be revoked and re-issued.'
            }
        ],
        interactive: {
            type: 'scenario_matcher',
            title: 'Biometric System Design',
            instructions: 'Choose the best biometric approach for each scenario.',
            items: [
                { scenario: 'A high-security vault requires the lowest possible false acceptance rate, regardless of user convenience.', answer: 'Iris scan (highest accuracy, lowest FAR)', explanation: 'Iris scans have extremely low FAR and are nearly impossible to spoof, ideal for high-security environments.' },
                { scenario: 'A smartphone manufacturer needs a convenient, low-cost biometric for consumer device unlock.', answer: 'Fingerprint (low cost, well-accepted)', explanation: 'Fingerprint sensors are inexpensive, fast, and widely accepted by consumers.' },
                { scenario: 'An airport needs to identify travelers against a watchlist without stopping them.', answer: 'Facial recognition (contactless, one-to-many)', explanation: 'Facial recognition can identify individuals in a crowd without requiring them to stop or interact with a device.' },
                { scenario: 'A company wants continuous authentication that verifies identity throughout a session.', answer: 'Behavioral biometrics (keystroke dynamics)', explanation: 'Behavioral biometrics continuously analyze typing patterns, mouse movements, etc., to verify identity throughout a session.' },
                { scenario: 'A biometric system has too many false rejections, frustrating authorized users.', answer: 'Lower the sensitivity threshold (decrease FRR, accept slightly higher FAR)', explanation: 'Reducing sensitivity decreases false rejections but increases the chance of false acceptance.' },
                { scenario: 'A company is concerned about biometric template theft.', answer: 'Implement cancelable biometrics with encrypted template storage', explanation: 'Cancelable biometrics apply revocable transforms to templates, so compromised templates can be re-issued.' }
            ]
        },
        quiz: [
            { question: 'What does FAR (False Acceptance Rate) measure?', options: ['Rate at which authorized users are rejected', 'Rate at which unauthorized users are incorrectly accepted', 'Rate at which the system is available', 'Rate of biometric template creation'], correct: 1, explanation: 'FAR measures how often the system incorrectly accepts an unauthorized person (Type II error).' },
            { question: 'What is CER/EER and why is it important?', options: ['The maximum processing speed of the scanner', 'The point where FAR equals FRR, used to compare biometric systems (lower is better)', 'The cost-to-error ratio of the system', 'The enrollment error rate'], correct: 1, explanation: 'CER (Crossover Error Rate) or EER (Equal Error Rate) is where FAR and FRR are equal. It is the standard benchmark for comparing biometric system accuracy.' },
            { question: 'Which biometric type is MOST difficult to spoof?', options: ['Fingerprint', 'Facial geometry (basic camera)', 'Palm vein pattern', 'Voice recognition'], correct: 2, explanation: 'Palm vein patterns are internal to the body and require blood flow to be detected, making them extremely difficult to replicate or spoof.' },
            { question: 'What is the key difference between verification and identification in biometrics?', options: ['Verification uses hardware; identification uses software', 'Verification is one-to-one matching; identification is one-to-many matching', 'Verification is faster; identification is more accurate', 'There is no difference'], correct: 1, explanation: 'Verification compares against one template (is this person who they claim?). Identification compares against all templates in the database (who is this person?).' },
            { question: 'Why can biometrics NOT be treated the same as passwords from a security perspective?', options: ['Biometrics are always more secure than passwords', 'Biometrics cannot be changed if compromised', 'Biometrics are cheaper to implement', 'Biometrics work on all devices'], correct: 1, explanation: 'Unlike passwords that can be reset, compromised biometric data (fingerprints, iris patterns) cannot be changed. This makes biometric database breaches particularly severe.' },
            { question: 'What is "liveness detection" in biometric systems?', options: ['Checking if the biometric device is powered on', 'Ensuring a real, living person is present (not a photo, recording, or prosthetic)', 'Testing the system uptime', 'Detecting if the user is alive vs. deceased'], correct: 1, explanation: 'Liveness detection prevents spoofing by verifying that the biometric sample comes from a real, present person, not a photograph, recording, or artificial replica.' }
        ]
    },

    // ═══════════════════════════════════════════════════════════════════
    // KERBEROS
    // ═══════════════════════════════════════════════════════════════════
    kerberos: {
        id: 'kerberos',
        name: 'Kerberos Authentication',
        icon: '/assets/images/icons/icon-token.webp',
        color: '#a855f7',
        subtitle: 'Ticket-based network authentication protocol',
        description: 'Kerberos is a network authentication protocol that uses tickets to allow nodes to prove their identity securely over a non-secure network. It is the default authentication protocol in Active Directory environments.',
        keyConcepts: ['KDC', 'TGT', 'Service Ticket', 'AS', 'TGS', 'Realm', 'Mutual Authentication', 'Ticket Granting'],
        sections: [
            {
                title: 'Kerberos Architecture',
                icon: '/assets/images/icons/icon-construction.webp',
                content: 'Kerberos uses a trusted third party (KDC - Key Distribution Center) to authenticate users and services. The KDC has two components: the Authentication Service (AS) and the Ticket Granting Service (TGS).',
                details: ['KDC (Key Distribution Center): trusted third party that issues tickets', 'AS (Authentication Service): verifies user identity, issues TGT', 'TGS (Ticket Granting Service): issues service tickets using TGT', 'TGT (Ticket Granting Ticket): proves user is authenticated', 'Service Ticket: grants access to a specific service', 'Realm: the Kerberos authentication domain (often matches AD domain)'],
                realWorld: 'When you log into a Windows domain-joined computer, Active Directory\'s Kerberos implementation authenticates you. The domain controller (KDC) issues you a TGT. When you access a file share, your computer uses the TGT to get a service ticket for that specific file server, all without sending your password again.'
            },
            {
                title: 'The Kerberos Process (6 Steps)',
                icon: '/assets/images/icons/icon-refresh.webp',
                content: 'Kerberos authentication involves six messages exchanged between the client, KDC, and service server.',
                details: ['Step 1 (AS-REQ): Client sends authentication request to AS with username', 'Step 2 (AS-REP): AS returns TGT encrypted with TGS secret key + session key encrypted with user\'s password hash', 'Step 3 (TGS-REQ): Client presents TGT to TGS, requests service ticket', 'Step 4 (TGS-REP): TGS returns service ticket encrypted with service\'s secret key', 'Step 5 (AP-REQ): Client presents service ticket to the service server', 'Step 6 (AP-REP): Service server verifies ticket and grants access (mutual auth optional)'],
                realWorld: 'Alice opens Outlook to check email. Her workstation sends an AS-REQ to the KDC. The KDC sends back a TGT. The workstation then requests a service ticket for the Exchange server (TGS-REQ/TGS-REP). Finally, Outlook presents the service ticket to Exchange (AP-REQ) and gets access to Alice\'s mailbox.'
            },
            {
                title: 'Kerberos Security Features',
                icon: '/assets/images/icons/icon-padlock.webp',
                content: 'Kerberos provides several security guarantees including mutual authentication, replay protection, and password never traversing the network.',
                details: ['Password never sent over the network (only password hash used locally)', 'Mutual authentication: server proves identity to client too', 'Timestamps prevent replay attacks (5-minute clock skew tolerance)', 'Tickets have expiration times (TGT typically 10 hours)', 'Symmetric encryption: shared secrets between KDC and each principal', 'Single Sign-On (SSO): authenticate once, access many services'],
                realWorld: 'A Kerberos ticket captured by an attacker has a 10-hour lifetime. After expiration, it is useless. The 5-minute clock skew tolerance means replaying a captured ticket must happen almost immediately to succeed, and timestamps in the authenticator prevent even that.'
            },
            {
                title: 'Kerberos Attacks',
                icon: '/assets/images/icons/icon-siren.webp',
                content: 'Despite strong design, Kerberos implementations are targeted by sophisticated attacks, particularly in Active Directory environments.',
                details: ['Kerberoasting: requesting service tickets and cracking them offline to reveal service account passwords', 'Golden Ticket: forging TGTs with the stolen krbtgt account hash (complete domain compromise)', 'Silver Ticket: forging service tickets with a stolen service account hash', 'Pass-the-Ticket: stealing and reusing existing tickets from memory', 'AS-REP Roasting: cracking AS-REP for accounts without pre-authentication', 'Mitigations: strong service account passwords, AES encryption, PAC validation, Credential Guard'],
                realWorld: 'An attacker runs Mimikatz on a compromised domain controller and extracts the krbtgt hash. They create a Golden Ticket with domain admin privileges and a 10-year expiration. Even after the initial compromise is remediated, the Golden Ticket remains valid until the krbtgt password is reset TWICE.'
            }
        ],
        interactive: {
            type: 'scenario_matcher',
            title: 'Kerberos Protocol Walkthrough',
            instructions: 'Identify the correct Kerberos step or attack for each scenario.',
            items: [
                { scenario: 'A user logs into their Windows workstation and receives a TGT from the domain controller.', answer: 'AS-REQ/AS-REP (Authentication Service exchange)', explanation: 'The initial login triggers the AS exchange: the client requests authentication, and the KDC returns a TGT.' },
                { scenario: 'A user accesses a file share and their workstation presents the TGT to get a service ticket.', answer: 'TGS-REQ/TGS-REP (Ticket Granting exchange)', explanation: 'When accessing a service, the client presents its TGT to the TGS to receive a service ticket for that specific service.' },
                { scenario: 'An attacker requests service tickets for all SPNs and cracks them offline.', answer: 'Kerberoasting attack', explanation: 'Kerberoasting requests service tickets (encrypted with service account password hashes) and cracks them offline.' },
                { scenario: 'An attacker steals the krbtgt account hash and creates forged TGTs.', answer: 'Golden Ticket attack', explanation: 'With the krbtgt hash, an attacker can forge TGTs with any privileges and any expiration, achieving persistent domain compromise.' },
                { scenario: 'A captured Kerberos ticket is replayed 10 minutes after the original request.', answer: 'Replay attack (blocked by timestamp validation)', explanation: 'Kerberos timestamps and 5-minute clock skew tolerance prevent replay attacks beyond a very short window.' },
                { scenario: 'A user authenticates once at login and accesses email, file shares, and intranet without re-entering credentials.', answer: 'Single Sign-On (SSO) via TGT', explanation: 'The TGT enables SSO: after initial authentication, the workstation automatically requests service tickets as needed.' }
            ]
        },
        quiz: [
            { question: 'What does the KDC stand for in Kerberos?', options: ['Key Decryption Center', 'Kerberos Domain Controller', 'Key Distribution Center', 'Kerberos Data Center'], correct: 2, explanation: 'KDC is the Key Distribution Center, the trusted third party that issues and validates Kerberos tickets.' },
            { question: 'What two services make up the KDC?', options: ['DNS and DHCP', 'Authentication Service (AS) and Ticket Granting Service (TGS)', 'Active Directory and LDAP', 'Certificate Authority and OCSP'], correct: 1, explanation: 'The KDC contains the Authentication Service (AS), which verifies identity and issues TGTs, and the Ticket Granting Service (TGS), which issues service tickets.' },
            { question: 'Why is the user\'s password never sent over the network in Kerberos?', options: ['Kerberos does not use passwords', 'The password hash is used locally to decrypt the AS-REP; the password itself never leaves the client', 'Passwords are sent encrypted with TLS', 'The KDC already knows all passwords'], correct: 1, explanation: 'The client uses the password hash locally to decrypt the session key from the AS-REP. The actual password or its hash is never transmitted over the network.' },
            { question: 'What is a Golden Ticket attack?', options: ['Stealing a valid TGT from memory', 'Forging TGTs using the stolen krbtgt account hash', 'Cracking service ticket passwords offline', 'Replaying expired Kerberos tickets'], correct: 1, explanation: 'A Golden Ticket is a forged TGT created using the krbtgt hash. It gives the attacker unlimited domain access with arbitrary privileges and expiration.' },
            { question: 'How does Kerberos prevent replay attacks?', options: ['By using biometric authentication', 'By encrypting all traffic with TLS', 'By using timestamps with a 5-minute clock skew tolerance', 'By blocking all duplicate packets'], correct: 2, explanation: 'Kerberos uses timestamps in authenticators. Messages older than the 5-minute clock skew tolerance are rejected, preventing replay attacks.' },
            { question: 'What is Kerberoasting?', options: ['Overloading the KDC with requests', 'Requesting service tickets and cracking them offline to reveal service account passwords', 'Resetting the krbtgt password', 'Flooding the network with forged tickets'], correct: 1, explanation: 'Kerberoasting: any domain user can request service tickets (encrypted with service account hashes). Weak service account passwords can be cracked offline.' },
            { question: 'After a Golden Ticket compromise, what must be done to invalidate the forged tickets?', options: ['Reset all user passwords', 'Reset the krbtgt account password TWICE', 'Restart the domain controller', 'Enable Kerberos pre-authentication'], correct: 1, explanation: 'The krbtgt password must be reset twice (Kerberos remembers the current and previous password). A single reset leaves the previous hash valid for creating Golden Tickets.' }
        ]
    }
};
