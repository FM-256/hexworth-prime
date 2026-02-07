/**
 * ContentRegistry - Migrated Entries
 * Generated: 2025-12-27T18:24:50.376Z
 *
 * These entries were auto-generated from SAMPLE_MODULES.
 * Review and merge into content-registry.js
 *
 * Stats:
 * - Existing entries: 107
 * - New entries: 433
 * - Total after merge: 540
 */

const MIGRATED_ENTRIES = {

        // ─────────────────────────────────────────────────────────────
        // SHIELD HOUSE - 134 new entries
        // ─────────────────────────────────────────────────────────────
        'shield-yara-training': {
            id: 'shield-yara-training',
            title: 'YARA Rules Training Lab',
            description: 'Write malware detection rules. Interactive rule builder with simulated samples.',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 45,
            topics: ['threats', 'security'],
            paths: [],
            components: {
                quiz: 'houses/shield/tools/shield-yara.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-osint-dorking': {
            id: 'shield-osint-dorking',
            title: 'OSINT: Google Dorking Lab',
            description: 'Learn Google search operators for security reconnaissance - find exposed files, configs & vulnerabilities',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 55,
            topics: ['threats', 'security'],
            paths: [],
            components: {
                lab: 'houses/shield/labs/shield-osint-google-dorking.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-security-fundamentals-complete': {
            id: 'shield-security-fundamentals-complete',
            title: 'Security Fundamentals (Complete)',
            description: 'Comprehensive: CIA Triad, threats, authentication, cryptography, network security with 15-question quiz',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 25,
            topics: ['fundamentals', 'security'],
            paths: [],
            components: {
                quiz: 'houses/shield/presentations/shield-security-fundamentals.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-biometrics': {
            id: 'shield-biometrics',
            title: 'Biometrics',
            description: 'Biometric authentication methods',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['access-control', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/access/biometrics/shield-biometrics.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-kerberos': {
            id: 'shield-kerberos',
            title: 'Kerberos',
            description: 'Kerberos authentication protocol',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['access-control', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/access/kerberos/shield-kerberos.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-aaa-simulator': {
            id: 'shield-aaa-simulator',
            title: 'AAA Flow Simulator',
            description: 'Interactive Authentication, Authorization, Accounting workflow',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['access-control', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/access/shield-aaa-flow.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-access-models': {
            id: 'shield-access-models',
            title: 'Access Control Models',
            description: 'Compare RBAC, MAC, DAC, ABAC with scenario selector',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['access-control', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/access/shield-access-control-models.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-ac': {
            id: 'shield-cmmc-ac',
            title: 'CMMC Access Control',
            description: 'CMMC access control domain',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_access_control/shield-acv2.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-au': {
            id: 'shield-cmmc-au',
            title: 'CMMC Audit & Accountability',
            description: 'Audit and accountability controls',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_audit_accountability/shield-auv2.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-at': {
            id: 'shield-cmmc-at',
            title: 'CMMC Awareness Training',
            description: 'Security awareness training',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_awareness_training/shield-atv2.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-cm': {
            id: 'shield-cmmc-cm',
            title: 'CMMC Config Management',
            description: 'Configuration management controls',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_config_management/shield-cmv2.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-cui': {
            id: 'shield-cmmc-cui',
            title: 'CMMC CUI',
            description: 'Controlled Unclassified Information',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_cui/shield-cui-2.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-framework': {
            id: 'shield-cmmc-framework',
            title: 'CMMC Framework',
            description: 'CMMC framework overview',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_framework/shield-cmmc-frameworkv2.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-ia': {
            id: 'shield-cmmc-ia',
            title: 'CMMC Identification & Auth',
            description: 'Identification and authentication',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_identification_auth/shield-iav2.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-ir': {
            id: 'shield-cmmc-ir',
            title: 'CMMC Incident Response',
            description: 'Incident response controls',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_incident_response/shield-irv2.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-ma': {
            id: 'shield-cmmc-ma',
            title: 'CMMC Maintenance',
            description: 'System maintenance controls',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_maintenance/shield-mav2.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-mp': {
            id: 'shield-cmmc-mp',
            title: 'CMMC Media Protection',
            description: 'Media protection controls',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_media_protection/shield-mpv2.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-ps': {
            id: 'shield-cmmc-ps',
            title: 'CMMC Personnel Security',
            description: 'Personnel security controls',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_personnel_security/shield-psv2.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-pe': {
            id: 'shield-cmmc-pe',
            title: 'CMMC Physical Protection',
            description: 'Physical protection controls',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_physical_protection/shield-pev2.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-quiz': {
            id: 'shield-cmmc-quiz',
            title: 'CMMC Quiz',
            description: 'Test CMMC knowledge',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                quiz: 'houses/shield/applets/compliance/cmmc_quiz/shield-cmmc-test-knowledge2.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-ra': {
            id: 'shield-cmmc-ra',
            title: 'CMMC Risk Assessment',
            description: 'Risk assessment controls',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_risk_assessment/shield-rav2.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-ca': {
            id: 'shield-cmmc-ca',
            title: 'CMMC Security Assessment',
            description: 'Security assessment controls',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_security_assessment/shield-cav2.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-sc': {
            id: 'shield-cmmc-sc',
            title: 'CMMC System/Comm Protection',
            description: 'System and communications protection',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_system_comm_protection/shield-scv2.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cmmc-si': {
            id: 'shield-cmmc-si',
            title: 'CMMC System/Info Integrity',
            description: 'System and information integrity',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/cmmc_system_info_integrity/shield-siv2.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-framework-selector': {
            id: 'shield-framework-selector',
            title: 'Framework Selector',
            description: 'Compare and choose security frameworks (NIST, ISO, COBIT, CIS, PCI-DSS)',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/compliance/shield-framework-selector.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-block-mode': {
            id: 'shield-block-mode',
            title: 'Block Cipher Modes',
            description: 'Block cipher encryption modes',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/block_mode/shield-block.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-blockchain': {
            id: 'shield-blockchain',
            title: 'Blockchain',
            description: 'Blockchain technology explained',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/blockchain/shield-blockchain.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-checksum': {
            id: 'shield-checksum',
            title: 'Checksum Verifier',
            description: 'File integrity verification',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/shield-checksum-verifier.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cryptomatch': {
            id: 'shield-cryptomatch',
            title: 'CryptoMatch Game',
            description: 'Match crypto concepts',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/cryptomatch/shield-crypto-match.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-diffie-hellman': {
            id: 'shield-diffie-hellman',
            title: 'Diffie-Hellman',
            description: 'Key exchange protocol',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/diffie_hellman/shield-diffie-hellman.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-digital-sig': {
            id: 'shield-digital-sig',
            title: 'Digital Signatures',
            description: 'Digital signature creation',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/digital_signatures/shield-digital-signature.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-encrypt-data': {
            id: 'shield-encrypt-data',
            title: 'Encrypt Data',
            description: 'Data encryption exercise',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security', 'encryption'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/encrypt_data/shield-encrypt-data.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-encryption': {
            id: 'shield-encryption',
            title: 'Encryption Fundamentals',
            description: 'Encryption basics',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security', 'encryption'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/encryption/shield-encryption-jedit-6-1.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-factor-prime': {
            id: 'shield-factor-prime',
            title: 'Prime Factorization',
            description: 'RSA prime factoring',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/factor_prime/shield-factor-prime.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-gpg-lab': {
            id: 'shield-gpg-lab',
            title: 'GPG Encryption Lab',
            description: 'GPG encryption practice',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cryptography', 'security', 'encryption'],
            paths: [],
            components: {
                lab: 'houses/shield/applets/crypto/shield-gpg-encryption.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-hashing': {
            id: 'shield-hashing',
            title: 'Hashing',
            description: 'Hash function concepts',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security', 'hashing'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/hashing/shield-hashing.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-hashing-vo': {
            id: 'shield-hashing-vo',
            title: 'Hashing (Narrated)',
            description: 'Narrated hashing tutorial',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security', 'hashing'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/hashing_narrated/shield-hashing-vo.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-encryption2': {
            id: 'shield-encryption2',
            title: 'Encryption II',
            description: 'Advanced encryption',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security', 'encryption'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/hashing_steganography/shield-encryption-ii.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-hash-lab': {
            id: 'shield-hash-lab',
            title: 'Hash Lab',
            description: 'Hashing hands-on lab',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cryptography', 'security', 'hashing'],
            paths: [],
            components: {
                lab: 'houses/shield/applets/crypto/hashing_steganography/shield-hash.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-stego': {
            id: 'shield-stego',
            title: 'Steganography',
            description: 'Hide data in images',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/hashing_steganography/shield-stego.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-encrypt-task': {
            id: 'shield-encrypt-task',
            title: 'Encryption Task',
            description: 'Encryption exercise',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security', 'encryption'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/hashing_steganography/shield-encryption-task.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-hash-steg-pres': {
            id: 'shield-hash-steg-pres',
            title: 'Hash & Steg Presentation',
            description: 'Hashing and steganography slides',
            house: 'shield',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cryptography', 'security', 'hashing'],
            paths: [],
            components: {
                presentation: 'houses/shield/applets/crypto/hashing_steganography/shield-hash-steg.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-hash-v3': {
            id: 'shield-hash-v3',
            title: 'Hashing v3',
            description: 'Updated hashing module',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security', 'hashing'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/hashing_steganography/shield-hash-v3.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-hashing-lab': {
            id: 'shield-hashing-lab',
            title: 'Hashing Lab',
            description: 'Hashing practice lab',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cryptography', 'security', 'hashing'],
            paths: [],
            components: {
                lab: 'houses/shield/applets/crypto/hashing_steganography/shield-hashing.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-pki': {
            id: 'shield-pki',
            title: 'PKI',
            description: 'Public Key Infrastructure',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/pki/shield-pki.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-rsa': {
            id: 'shield-rsa',
            title: 'RSA',
            description: 'RSA encryption algorithm',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/crypto/rsa/shield-rsa.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-career': {
            id: 'shield-career',
            title: 'Career Exploration',
            description: 'Cybersecurity career paths, progression, salaries & certifications',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/fundamentals/career_exploration/index.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-controls': {
            id: 'shield-controls',
            title: 'Cybersecurity Controls',
            description: 'Security control types',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/fundamentals/cybersecurity_controls/shield-cybersecurity-controls.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-data-roles': {
            id: 'shield-data-roles',
            title: 'Data Roles',
            description: 'Data ownership and roles',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/fundamentals/data_roles/shield-dataroles.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-design-principles': {
            id: 'shield-design-principles',
            title: 'Design Principles',
            description: 'Security design principles',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/fundamentals/design_principles/shield-cybersecuritydesignprinciples.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-ethics-challenge': {
            id: 'shield-ethics-challenge',
            title: 'Ethics Challenge',
            description: 'Cybersecurity ethics scenarios',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/fundamentals/ethics_challenge/shield-ethics-challenge.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-ethics-conduct': {
            id: 'shield-ethics-conduct',
            title: 'Ethics & Professional Conduct',
            description: 'Professional ethics in security',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/fundamentals/ethics_conduct/shield-ethics-prof-conduct.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-physical': {
            id: 'shield-physical',
            title: 'Physical Protection',
            description: 'Physical security controls',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/fundamentals/physical_protection/shield-physical-environmental.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-privacy': {
            id: 'shield-privacy',
            title: 'Privacy',
            description: 'Privacy principles and laws',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/fundamentals/privacy/shield-privacy.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-best-practices': {
            id: 'shield-best-practices',
            title: 'Security Best Practices',
            description: 'Security best practices guide',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/fundamentals/shield-security-best-practices.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cube': {
            id: 'shield-cube',
            title: 'The Cube',
            description: 'Cybersecurity cube concept',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/fundamentals/the_cube/shield-cube.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-asset-classification': {
            id: 'shield-asset-classification',
            title: 'Asset Classification Wizard',
            description: 'Classify data assets per government and commercial standards',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/fundamentals/shield-asset-classification-wizard.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-data-lifecycle': {
            id: 'shield-data-lifecycle',
            title: 'Data Lifecycle Visualizer',
            description: 'Track data through creation, storage, usage, archival, and destruction',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/fundamentals/shield-data-lifecycle.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cookie-caper': {
            id: 'shield-cookie-caper',
            title: 'Cookie Caper',
            description: 'Web cookies security game',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/games/cookie_caper/shield-cookies.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-hat-match': {
            id: 'shield-hat-match',
            title: 'Cyber Hat Match',
            description: 'Match hacker types',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/games/cyber_hat_match/shield-hatmatch.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-scramble': {
            id: 'shield-scramble',
            title: 'Cyber Scramble',
            description: 'Security term scramble',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/games/cyber_scramble/shield-cyberscramble.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-eh-case': {
            id: 'shield-eh-case',
            title: 'Ethical Hacking Case',
            description: 'Ethical hacking scenario',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/games/ethical_hacking_case/shield-eh-exam-1-a.exam.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-hangman': {
            id: 'shield-hangman',
            title: 'Hacker Hangman',
            description: 'Security terms hangman',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['fundamentals', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/games/hacker_hangman/shield-hangman.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-crime': {
            id: 'shield-crime',
            title: 'What',
            description: 'Identify cyber crimes',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/games/whats_my_crime/shield-crime.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-browser': {
            id: 'shield-browser',
            title: 'Browser Security Hardening',
            description: 'Secure browser configuration',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['network-security', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/network/shield-browser-security-hardening.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-eap': {
            id: 'shield-eap',
            title: 'EAP',
            description: 'Extensible Authentication Protocol',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['network-security', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/network/eap/shield-eap.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-home-network': {
            id: 'shield-home-network',
            title: 'Home Network Security',
            description: 'Secure your home network',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['network-security', 'security', 'networking'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/network/shield-home-network-security.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-ids-ips': {
            id: 'shield-ids-ips',
            title: 'IDS/IPS',
            description: 'Intrusion detection/prevention',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['network-security', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/network/ids_ips/shield-ids-ips.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-linux-fw': {
            id: 'shield-linux-fw',
            title: 'Linux Firewall Builder',
            description: 'Build iptables rules',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['network-security', 'security', 'linux'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/network/shield-linux-firewall-builder.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-nat-pat': {
            id: 'shield-nat-pat',
            title: 'NAT/PAT',
            description: 'Network address translation',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['network-security', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/network/nat_pat/shield-nat.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-protocol': {
            id: 'shield-protocol',
            title: 'Protocol Analysis',
            description: 'Network protocol analysis',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['network-security', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/network/protocol_analysis/shield-protocol-analysis.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-handshake': {
            id: 'shield-handshake',
            title: 'Three-Way Handshake',
            description: 'TCP handshake animation',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['network-security', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/network/threeway_handshake/shield-threeway-handshake1-audio.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-vpn': {
            id: 'shield-vpn',
            title: 'VPN',
            description: 'Virtual Private Networks',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['network-security', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/network/vpn/shield-vpn.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-wireless-sec': {
            id: 'shield-wireless-sec',
            title: 'Wireless Security',
            description: 'WiFi security protocols',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['network-security', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/network/wireless_security/shield-wireless-security.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-change-mgmt': {
            id: 'shield-change-mgmt',
            title: 'Change Management',
            description: 'Change management process',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/risk/shield-change-management.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-config-mgmt': {
            id: 'shield-config-mgmt',
            title: 'Configuration Management',
            description: 'Config management controls',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/risk/config_management/shield-config-mgmt.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-scenario': {
            id: 'shield-scenario',
            title: 'Cybersecurity Scenario',
            description: 'Security scenario exercise',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/risk/cybersecurity_scenario/shield-cyber-scenario.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-incident-sim': {
            id: 'shield-incident-sim',
            title: 'Incident Response Simulator',
            description: 'IR workflow practice',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/risk/shield-incident-response.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-pspg': {
            id: 'shield-pspg',
            title: 'Policies & Procedures',
            description: 'Security policies and procedures',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/risk/pspg/shield-pspg.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-risk-analysis': {
            id: 'shield-risk-analysis',
            title: 'Risk Analysis',
            description: 'Risk analysis methods',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/risk/risk_analysis/shield-risk-analysis.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-bia-calculator': {
            id: 'shield-bia-calculator',
            title: 'BIA Calculator',
            description: 'Calculate MTD, RTO, RPO, WRT for business continuity planning',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/risk/shield-bia.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-crisc-calculator': {
            id: 'shield-crisc-calculator',
            title: 'CRISC Risk Calculator',
            description: 'Risk appetite, Three Lines of Defense, risk matrix and register',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/risk/shield-crisc-risk.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-buffer-overflow': {
            id: 'shield-buffer-overflow',
            title: 'Buffer Overflow',
            description: 'Buffer overflow attacks',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/buffer_overflow/shield-bufferoverflow.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-code-injection': {
            id: 'shield-code-injection',
            title: 'Code Injection',
            description: 'Code injection attacks',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/code_injection/shield-codeinjection.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-xss': {
            id: 'shield-xss',
            title: 'Cross-Site Scripting',
            description: 'XSS attack types',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/cross_site_scripting/shield-crosssitescripting.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-google-hacking': {
            id: 'shield-google-hacking',
            title: 'Google Hacking',
            description: 'Google dorking techniques',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/google_hacking/shield-googlehacking.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-heartbleed': {
            id: 'shield-heartbleed',
            title: 'Heartbleed',
            description: 'Heartbleed vulnerability',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/heartbleed/shield-heartbleed.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-malware-ref': {
            id: 'shield-malware-ref',
            title: 'Malware Types Reference',
            description: 'Malware classification guide',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/shield-malware-types.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-meltdown': {
            id: 'shield-meltdown',
            title: 'Meltdown & Spectre',
            description: 'CPU vulnerabilities',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/meltdown_spectre/shield-meltdown-spectre.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-os-injection': {
            id: 'shield-os-injection',
            title: 'OS Command Injection',
            description: 'Command injection attacks',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/os_command_injection/shield-oscommandinjection.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-osint': {
            id: 'shield-osint',
            title: 'OSINT',
            description: 'Open source intelligence',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/osint/shield-osint.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-osint-challenge': {
            id: 'shield-osint-challenge',
            title: 'OSINT Challenge',
            description: 'OSINT practice challenge',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/osint_challenge/shield-osint-pd-challenge.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-pentest': {
            id: 'shield-pentest',
            title: 'Penetration Testing',
            description: 'Pen testing methodology',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/pen_testing/shield-pen-testing.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-phishing': {
            id: 'shield-phishing',
            title: 'Phishing Mystery',
            description: 'Identify phishing attacks',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/phishing_mystery/shield-phishing.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-ransomware': {
            id: 'shield-ransomware',
            title: 'Ransomware',
            description: 'Ransomware attack simulation',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/ransomware/shield-ransomware-attack.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-se-tactics': {
            id: 'shield-se-tactics',
            title: 'Social Engineering Tactics',
            description: 'SE attack techniques',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/social_engineering_tactics/shield-social-engineering-tactics.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-spoofing': {
            id: 'shield-spoofing',
            title: 'Spoofing',
            description: 'Spoofing attack types',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/spoofing/shield-spoofing1.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-stuxnet': {
            id: 'shield-stuxnet',
            title: 'Stuxnet',
            description: 'Stuxnet case study',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/stuxnet/shield-stuxnet.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-threat-actors': {
            id: 'shield-threat-actors',
            title: 'Threat Actors',
            description: 'Types of threat actors',
            house: 'shield',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['threats', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/applets/threats/threat_actors/shield-threat-actors.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-security-pres': {
            id: 'shield-security-pres',
            title: 'Security Presentation',
            description: 'Security fundamentals slides',
            house: 'shield',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['fundamentals', 'security'],
            paths: [],
            components: {
                presentation: 'houses/shield/presentations/shield-security.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cia-quiz': {
            id: 'shield-cia-quiz',
            title: 'CIA Triad Quiz',
            description: 'Test CIA triad knowledge',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['fundamentals', 'security'],
            paths: [],
            components: {
                quiz: 'houses/shield/quizzes/shield-cia-triad.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-06-monitoring': {
            id: 'cse-06-monitoring',
            title: 'CSE: Security Monitoring & IR',
            description: 'Cloud logging, SIEM/SOAR, CSPM, and incident response workflows',
            house: 'shield',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                presentation: 'houses/shield/presentations/shield-cse-06-security-monitoring-incident-response.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-07-risk': {
            id: 'cse-07-risk',
            title: 'CSE: Risk Assessment & Management',
            description: 'Cloud risk categories, NIST RMF, controls, and risk response strategies',
            house: 'shield',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                presentation: 'houses/shield/presentations/shield-cse-07-risk-assessment-management.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-08-compliance': {
            id: 'cse-08-compliance',
            title: 'CSE: Compliance & Governance',
            description: 'GDPR, HIPAA, PCI-DSS, SOX, NIST CSF, and cloud compliance tools',
            house: 'shield',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                presentation: 'houses/shield/presentations/shield-cse-08-compliance-governance.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-06-quiz': {
            id: 'cse-06-quiz',
            title: 'CSE: Security Monitoring Quiz',
            description: 'Test SIEM, SOAR, and IR knowledge',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                quiz: 'houses/shield/quizzes/shield-cse-06.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-07-quiz': {
            id: 'cse-07-quiz',
            title: 'CSE: Risk Management Quiz',
            description: 'Test risk assessment and NIST RMF knowledge',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                quiz: 'houses/shield/quizzes/shield-cse-07.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-08-quiz': {
            id: 'cse-08-quiz',
            title: 'CSE: Compliance Quiz',
            description: 'Test GDPR, HIPAA, PCI-DSS compliance knowledge',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                quiz: 'houses/shield/quizzes/shield-cse-08.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-zero-trust': {
            id: 'shield-zero-trust',
            title: 'Zero Trust Architecture',
            description: 'NIST SP 800-207 tenets, deperimeterization, microsegmentation, continuous verification',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 25,
            topics: ['architecture', 'security'],
            paths: [],
            components: {
                quiz: 'houses/shield/applets/architecture/shield-zero-trust.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-ir-forensics': {
            id: 'shield-ir-forensics',
            title: 'Incident Response & Forensics Lab',
            description: 'NIST SP 800-61R2 IR lifecycle, RFC 3227 volatility, digital forensics, IOC detection',
            house: 'shield',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 55,
            topics: ['operations', 'security'],
            paths: [],
            components: {
                lab: 'houses/shield/applets/operations/shield-ir-forensics.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-ics-scada': {
            id: 'shield-ics-scada',
            title: 'ICS/SCADA Security Simulator',
            description: 'Industrial control systems, PLCs, RTUs, HMIs, Modbus/DNP3 protocols, critical infrastructure',
            house: 'shield',
            type: 'lab',
            difficulty: 'intermediate',
            duration: 55,
            topics: ['operations', 'security'],
            paths: [],
            components: {
                lab: 'houses/shield/applets/operations/shield-ics-scada-security.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-laws-regulations': {
            id: 'shield-laws-regulations',
            title: 'Laws & Regulations Reference',
            description: 'GDPR, HIPAA, SOX, GLBA, CCPA, PCI-DSS - US/international privacy and security laws',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 25,
            topics: ['compliance', 'security', 'aws'],
            paths: [],
            components: {
                quiz: 'houses/shield/applets/compliance/shield-laws-regulations.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-security-models': {
            id: 'shield-security-models',
            title: 'Security Models Visualizer',
            description: 'Bell-LaPadula, Biba, Clark-Wilson, Brewer-Nash - confidentiality and integrity models',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 25,
            topics: ['architecture', 'security'],
            paths: [],
            components: {
                quiz: 'houses/shield/applets/architecture/shield-security-models.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-secure-sdlc': {
            id: 'shield-secure-sdlc',
            title: 'Secure SDLC Framework',
            description: 'SDLC phases, DevSecOps, SAST/DAST/IAST, OWASP Top 10, CMM/CMMI maturity levels',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 25,
            topics: ['fundamentals', 'security'],
            paths: [],
            components: {
                quiz: 'houses/shield/applets/fundamentals/shield-secure-sdlc-framework.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-business-continuity': {
            id: 'shield-business-continuity',
            title: 'Business Continuity Planner',
            description: 'BIA, BCP, DRP - RTO, RPO, MTD calculations, hot/warm/cold sites, backup strategies',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 25,
            topics: ['risk-management', 'security'],
            paths: [],
            components: {
                quiz: 'houses/shield/applets/risk/shield-business-continuity-planner.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-governance-dashboard': {
            id: 'shield-governance-dashboard',
            title: 'Security Governance Dashboard',
            description: 'Policy hierarchy, roles & responsibilities, control frameworks, (ISC)² Code of Ethics',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 25,
            topics: ['compliance', 'security'],
            paths: [],
            components: {
                quiz: 'houses/shield/applets/fundamentals/shield-security-governance-dashboard.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cve-lookup': {
            id: 'shield-cve-lookup',
            title: 'CVE Lookup Tool',
            description: 'Search and analyze CVE vulnerabilities',
            house: 'shield',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['threats', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/tools/shield-cve-lookup.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-google-dorking': {
            id: 'shield-google-dorking',
            title: 'Google Dorking OSINT',
            description: 'OSINT techniques using Google search operators',
            house: 'shield',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['threats', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/tools/shield-google-dorking-osint.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-attack-vector': {
            id: 'shield-attack-vector',
            title: 'Attack Vector Challenge',
            description: 'Interactive attack vector identification',
            house: 'shield',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['threats', 'security'],
            paths: [],
            components: {
                applet: 'houses/shield/challenges/shield-attack-vector-challenge.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-fundamentals-lab': {
            id: 'shield-fundamentals-lab',
            title: 'Security Fundamentals Lab',
            description: 'Hands-on exercises: CIA Triad, controls, ethics, design principles',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['fundamentals', 'security'],
            paths: [],
            components: {
                lab: 'houses/shield/labs/shield-security-fundamentals.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-fundamentals-quiz': {
            id: 'shield-fundamentals-quiz',
            title: 'Security Fundamentals Quiz',
            description: '15-question assessment covering core security concepts',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['fundamentals', 'security'],
            paths: [],
            components: {
                quiz: 'houses/shield/quizzes/shield-security-fundamentals.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-network-lab': {
            id: 'shield-network-lab',
            title: 'Network Security Lab',
            description: 'Hands-on: Firewalls, VPNs, IDS/IPS, protocols, wireless security',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['network-security', 'security', 'networking'],
            paths: [],
            components: {
                lab: 'houses/shield/labs/shield-network-security.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-network-quiz': {
            id: 'shield-network-quiz',
            title: 'Network Security Quiz',
            description: '15-question assessment on network defense concepts',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['network-security', 'security', 'networking'],
            paths: [],
            components: {
                quiz: 'houses/shield/quizzes/shield-network-security.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-crypto-lab': {
            id: 'shield-crypto-lab',
            title: 'Cryptography Lab',
            description: 'Hands-on: Encryption, hashing, key exchange, signatures, PKI',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cryptography', 'security'],
            paths: [],
            components: {
                lab: 'houses/shield/labs/shield-cryptography.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-crypto-quiz': {
            id: 'shield-crypto-quiz',
            title: 'Cryptography Quiz',
            description: '15-question assessment on cryptographic concepts',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cryptography', 'security'],
            paths: [],
            components: {
                quiz: 'houses/shield/quizzes/shield-cryptography.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-access-lab': {
            id: 'shield-access-lab',
            title: 'Access Control Lab',
            description: 'Hands-on: DAC/MAC/RBAC, biometrics, Kerberos, IAM',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['access-control', 'security'],
            paths: [],
            components: {
                lab: 'houses/shield/labs/shield-access-control.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-access-quiz': {
            id: 'shield-access-quiz',
            title: 'Access Control Quiz',
            description: '15-question assessment on authentication and authorization',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['access-control', 'security'],
            paths: [],
            components: {
                quiz: 'houses/shield/quizzes/shield-access-control.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-compliance-lab': {
            id: 'shield-compliance-lab',
            title: 'Compliance & Governance Lab',
            description: 'Hands-on: GDPR, HIPAA, PCI-DSS, CMMC frameworks',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['compliance', 'security'],
            paths: [],
            components: {
                lab: 'houses/shield/labs/shield-compliance.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-compliance-quiz': {
            id: 'shield-compliance-quiz',
            title: 'Compliance & Governance Quiz',
            description: '15-question assessment on regulatory compliance',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['compliance', 'security'],
            paths: [],
            components: {
                quiz: 'houses/shield/quizzes/shield-compliance.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-threats-lab': {
            id: 'shield-threats-lab',
            title: 'Threats & Attack Vectors Lab',
            description: 'Hands-on: Malware, social engineering, web attacks, OSINT',
            house: 'shield',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['threats', 'security'],
            paths: [],
            components: {
                lab: 'houses/shield/labs/shield-threats.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-threats-quiz': {
            id: 'shield-threats-quiz',
            title: 'Threats & Attack Vectors Quiz',
            description: '15-question assessment on threat landscape',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['threats', 'security'],
            paths: [],
            components: {
                quiz: 'houses/shield/quizzes/shield-threats.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cysa-toolkit': {
            id: 'shield-cysa-toolkit',
            title: 'CySA+ v3 Analyst Toolkit',
            description: 'Security operations, vulnerability management, threat intel, and incident response reference',
            house: 'shield',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 25,
            topics: ['operations', 'security'],
            paths: [],
            components: {
                quiz: 'houses/shield/applets/operations/shield-cysa-analyst-toolkit.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cfr310-ir': {
            id: 'shield-cfr310-ir',
            title: 'CFR-310 Incident Response',
            description: 'IR lifecycle, Windows/Linux tools, IOC checklist, containment strategies, data sources',
            house: 'shield',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 25,
            topics: ['operations', 'security'],
            paths: [],
            components: {
                quiz: 'houses/shield/applets/operations/shield-cfr-310-incident-response.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-pentest-toolkit': {
            id: 'shield-pentest-toolkit',
            title: 'PenTest+ Penetration Testing Toolkit',
            description: 'Pentest methodologies, recon, exploitation, OWASP Top 10, privilege escalation, reporting',
            house: 'shield',
            type: 'quiz',
            difficulty: 'intermediate',
            duration: 25,
            topics: ['operations', 'security'],
            paths: [],
            components: {
                quiz: 'houses/shield/applets/operations/shield-pentest-plus-toolkit.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'shield-cism-dashboard': {
            id: 'shield-cism-dashboard',
            title: 'CISM Management Dashboard',
            description: 'ISACA CISM 4 domains - governance, risk, program development, incident management',
            house: 'shield',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 25,
            topics: ['compliance', 'security'],
            paths: [],
            components: {
                quiz: 'houses/shield/applets/governance/shield-cism-management-dashboard.applet.html'
            },
            prerequisites: [],
            objectives: []
        }
,

        // ─────────────────────────────────────────────────────────────
        // WEB HOUSE - 71 new entries
        // ─────────────────────────────────────────────────────────────
        'web-burp-training': {
            id: 'web-burp-training',
            title: 'Burp Suite Training Lab',
            description: 'Interactive web app security testing. Intercept, modify, and analyze HTTP requests.',
            house: 'web',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 45,
            topics: ['simulators', 'networking'],
            paths: [],
            components: {
                quiz: 'houses/web/tools/web-burp.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-sqlmap-training': {
            id: 'web-sqlmap-training',
            title: 'SQLMap Training Lab',
            description: 'SQL injection automation simulator. Database enumeration, data extraction, and injection techniques.',
            house: 'web',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 45,
            topics: ['simulators', 'networking'],
            paths: [],
            components: {
                quiz: 'houses/web/tools/web-sqlmap.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-gobuster-training': {
            id: 'web-gobuster-training',
            title: 'Gobuster Training Lab',
            description: 'Directory and DNS enumeration simulator. Hidden paths, subdomains, and vhost discovery.',
            house: 'web',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 45,
            topics: ['simulators', 'networking'],
            paths: [],
            components: {
                quiz: 'houses/web/tools/web-gobuster.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-nikto-training': {
            id: 'web-nikto-training',
            title: 'Nikto Training Lab',
            description: 'Web server vulnerability scanner simulator. Misconfigurations, outdated software, and dangerous files.',
            house: 'web',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 45,
            topics: ['simulators', 'networking'],
            paths: [],
            components: {
                quiz: 'houses/web/tools/web-nikto.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-networking-guide': {
            id: 'web-networking-guide',
            title: 'Networking Interactive Guide',
            description: 'Chapters 7-10: IP addressing, subnetting, NAT/PAT, routing protocols with flashcards and quiz',
            house: 'web',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 35,
            topics: ['visualizers', 'networking'],
            paths: [],
            components: {
                quiz: 'houses/web/applets/web-networking-interactive.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-exam-flashcards': {
            id: 'web-exam-flashcards',
            title: 'Networking Exam Flashcards',
            description: '85 flashcards covering all networking topics - Windows, CIDR, OSI, cabling, wireless & more',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['visualizers', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/web-networking-exam-flashcards.exam.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-ipv6-challenge': {
            id: 'web-ipv6-challenge',
            title: 'IPv6 Challenge',
            description: 'Practice IPv6 addressing exercises',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/ip-addressing/IPv6Challenge/web-ipv6-challenge.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-nat': {
            id: 'web-nat',
            title: 'NAT Visualization',
            description: 'Network Address Translation concepts',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/ip-addressing/NAT/web-nat.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-vlsm-challenge': {
            id: 'web-vlsm-challenge',
            title: 'VLSM Challenge',
            description: 'Variable length subnet masking practice',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/ip-addressing/VLSM_challenge/web-vlsm-challenge.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-binary-converter': {
            id: 'web-binary-converter',
            title: 'Binary/Decimal Converter',
            description: 'Convert between binary and decimal',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/ip-addressing/web-binary-decimal-converter.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-binary-ip': {
            id: 'web-binary-ip',
            title: 'Binary IP Addressing',
            description: 'Understand IP addresses in binary',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/ip-addressing/binaryIP/web-binary-ip.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-class-a': {
            id: 'web-class-a',
            title: 'Class A Networks',
            description: 'Class A IP addressing explained',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/ip-addressing/classA/web-class-a.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-class-b': {
            id: 'web-class-b',
            title: 'Class B Networks',
            description: 'Class B IP addressing explained',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/ip-addressing/classB/web-class-b.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-intro-subnetting': {
            id: 'web-intro-subnetting',
            title: 'Intro to Subnetting',
            description: 'Subnetting fundamentals',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/ip-addressing/intro_subnetting/web-intro-subnetting.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-mac-addressing': {
            id: 'web-mac-addressing',
            title: 'MAC Addressing',
            description: 'Physical addressing exercises',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/ip-addressing/macaddressing/web-emate-pizzaparty-exercise-102918.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-network-classes': {
            id: 'web-network-classes',
            title: 'Network Classes',
            description: 'IP address classes visualization',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/ip-addressing/network_classes2/web-network-classes2.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-network-addressing': {
            id: 'web-network-addressing',
            title: 'Understanding Addresses',
            description: 'IP addressing fundamentals',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/ip-addressing/networkaddressing/web-emate-understanding-addresses.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-acl-viz': {
            id: 'web-acl-viz',
            title: 'ACL Visualizer',
            description: 'Access Control Lists visualization',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['visualizers', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/web-acl.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-cable-viz': {
            id: 'web-cable-viz',
            title: 'Cable Visualizer',
            description: 'Network cable types and standards',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['visualizers', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/web-cable.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-devices-viz': {
            id: 'web-devices-viz',
            title: 'Devices Visualizer',
            description: 'Network device types and roles',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['visualizers', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/web-devices.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-etherchannel-viz': {
            id: 'web-etherchannel-viz',
            title: 'EtherChannel Visualizer',
            description: 'Link aggregation visualization',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['routing-switching', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/web-etherchannel.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-fhrp-viz': {
            id: 'web-fhrp-viz',
            title: 'FHRP Visualizer',
            description: 'Gateway redundancy protocols',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['routing-switching', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/web-fhrp.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-ipv6-viz': {
            id: 'web-ipv6-viz',
            title: 'IPv6 Visualizer',
            description: 'IPv6 addressing visualization',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/web-ipv6.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-osi-deep-viz': {
            id: 'web-osi-deep-viz',
            title: 'OSI Deep Dive Visualizer',
            description: 'Detailed OSI layer exploration',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['visualizers', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/web-osi-deep-dive.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-osi-viz': {
            id: 'web-osi-viz',
            title: 'OSI Visualizer',
            description: 'OSI model interactive diagram',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['visualizers', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/web-osi.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-ospf-cost-viz': {
            id: 'web-ospf-cost-viz',
            title: 'OSPF Cost Visualizer',
            description: 'OSPF cost calculation tool',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['routing-switching', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/web-ospf-cost.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-port-viz': {
            id: 'web-port-viz',
            title: 'Port Visualizer',
            description: 'Common ports and protocols',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['visualizers', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/web-port.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-qos-viz': {
            id: 'web-qos-viz',
            title: 'QoS Visualizer',
            description: 'Quality of Service concepts',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['visualizers', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/web-qos.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-security-viz': {
            id: 'web-security-viz',
            title: 'Security Visualizer',
            description: 'Network security concepts',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['visualizers', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/web-security.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-stp-viz': {
            id: 'web-stp-viz',
            title: 'STP Visualizer',
            description: 'Spanning Tree Protocol simulation',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['routing-switching', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/web-stp.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-subnetting-viz': {
            id: 'web-subnetting-viz',
            title: 'Subnetting Visualizer',
            description: 'Subnet calculation visualization',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['ip-addressing', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/web-subnetting.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-switch-ops-viz': {
            id: 'web-switch-ops-viz',
            title: 'Switch Operations Visualizer',
            description: 'Switch forwarding process',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['routing-switching', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/web-switch-operations.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-topology-viz': {
            id: 'web-topology-viz',
            title: 'Topology Visualizer',
            description: 'Network topology types',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['visualizers', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/web-topology.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-troubleshoot-viz': {
            id: 'web-troubleshoot-viz',
            title: 'Troubleshooting Visualizer',
            description: 'Network troubleshooting process',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['visualizers', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/web-troubleshooting.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-vlan-viz': {
            id: 'web-vlan-viz',
            title: 'VLAN Visualizer',
            description: 'Virtual LAN concepts',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['routing-switching', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/web-vlan.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-wireless-arch-viz': {
            id: 'web-wireless-arch-viz',
            title: 'Wireless Architecture Visualizer',
            description: 'Wireless network architecture',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['wireless', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/web-wireless-architecture.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-wireless-viz': {
            id: 'web-wireless-viz',
            title: 'Wireless Visualizer',
            description: 'WiFi standards and concepts',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['wireless', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/visualizers/web-wireless.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-http-codes': {
            id: 'web-http-codes',
            title: 'HTTP Status Codes',
            description: 'HTTP response codes reference',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['visualizers', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/services/web-http-status-codes.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-smb': {
            id: 'web-smb',
            title: 'SMB File Sharing Guide',
            description: 'SMB protocol and file sharing',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['visualizers', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/services/web-smb-file-sharing.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-server-compare': {
            id: 'web-server-compare',
            title: 'Web Server Comparison',
            description: 'Compare Apache, Nginx, IIS',
            house: 'web',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['visualizers', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/applets/services/web-server-comparison.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-arp-pres': {
            id: 'web-arp-pres',
            title: 'ARP Presentation',
            description: 'Address Resolution Protocol',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: [],
            components: {
                presentation: 'houses/web/presentations/web-arp.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-cables-pres': {
            id: 'web-cables-pres',
            title: 'Cables Presentation',
            description: 'Network cabling types',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: [],
            components: {
                presentation: 'houses/web/presentations/web-cables.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-devices-pres': {
            id: 'web-devices-pres',
            title: 'Devices Presentation',
            description: 'Network devices overview',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: [],
            components: {
                presentation: 'houses/web/presentations/web-devices.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-dhcp-pres': {
            id: 'web-dhcp-pres',
            title: 'DHCP Presentation',
            description: 'Dynamic Host Configuration',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: [],
            components: {
                presentation: 'houses/web/presentations/web-dhcp.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-dns-pres': {
            id: 'web-dns-pres',
            title: 'DNS Presentation',
            description: 'Domain Name System',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: [],
            components: {
                presentation: 'houses/web/presentations/web-dns.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-eigrp-pres': {
            id: 'web-eigrp-pres',
            title: 'EIGRP Presentation',
            description: 'Enhanced Interior Gateway Routing',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: [],
            components: {
                presentation: 'houses/web/presentations/web-eigrp.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-etherchannel-pres': {
            id: 'web-etherchannel-pres',
            title: 'EtherChannel Presentation',
            description: 'Link aggregation',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: [],
            components: {
                presentation: 'houses/web/presentations/web-etherchannel.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-ipv6-pres': {
            id: 'web-ipv6-pres',
            title: 'IPv6 Presentation',
            description: 'IPv6 addressing slides',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: [],
            components: {
                presentation: 'houses/web/presentations/web-ipv6.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-nat-pres': {
            id: 'web-nat-pres',
            title: 'NAT Presentation',
            description: 'Network Address Translation',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: [],
            components: {
                presentation: 'houses/web/presentations/web-nat.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-network-essentials-pres': {
            id: 'web-network-essentials-pres',
            title: 'Network Essentials',
            description: 'Networking fundamentals overview',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: [],
            components: {
                presentation: 'houses/web/presentations/web-network-essentials.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-ntp-pres': {
            id: 'web-ntp-pres',
            title: 'NTP Presentation',
            description: 'Network Time Protocol',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: [],
            components: {
                presentation: 'houses/web/presentations/web-ntp.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-osi-deep-pres': {
            id: 'web-osi-deep-pres',
            title: 'OSI Deep Dive',
            description: 'Detailed OSI model exploration',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: [],
            components: {
                presentation: 'houses/web/presentations/web-osi-deep-dive.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-osi-model-pres': {
            id: 'web-osi-model-pres',
            title: 'OSI Model',
            description: 'OSI 7-layer model reference',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: [],
            components: {
                presentation: 'houses/web/presentations/web-osi-model.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-ports-pres': {
            id: 'web-ports-pres',
            title: 'Ports Presentation',
            description: 'Common ports and protocols',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: [],
            components: {
                presentation: 'houses/web/presentations/web-ports.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-subnetting-pres': {
            id: 'web-subnetting-pres',
            title: 'Subnetting Presentation',
            description: 'IP subnetting fundamentals',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: [],
            components: {
                presentation: 'houses/web/presentations/web-subnetting.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-switch-ops-pres': {
            id: 'web-switch-ops-pres',
            title: 'Switch Operations',
            description: 'Layer 2 switching concepts',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: [],
            components: {
                presentation: 'houses/web/presentations/web-switch-operations.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-topologies-pres': {
            id: 'web-topologies-pres',
            title: 'Topologies Presentation',
            description: 'Network topology types',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: [],
            components: {
                presentation: 'houses/web/presentations/web-topologies.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-troubleshoot-pres': {
            id: 'web-troubleshoot-pres',
            title: 'Troubleshooting Presentation',
            description: 'Network troubleshooting methods',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['presentations', 'networking'],
            paths: [],
            components: {
                presentation: 'houses/web/presentations/web-troubleshooting.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-wireless-arch-pres': {
            id: 'web-wireless-arch-pres',
            title: 'Wireless Architecture',
            description: 'Wireless network design',
            house: 'web',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['wireless', 'networking'],
            paths: [],
            components: {
                presentation: 'houses/web/presentations/web-wireless-architecture.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-network-sim-v2': {
            id: 'web-network-sim-v2',
            title: 'Network Simulator v2',
            description: 'Interactive network simulation',
            house: 'web',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['simulators', 'networking'],
            paths: [],
            components: {
                lab: 'houses/web/simulators/web-interactive-network-simulatorv2.simulator.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-osi-quiz': {
            id: 'web-osi-quiz',
            title: 'OSI Model Quiz',
            description: 'Test OSI model knowledge',
            house: 'web',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['visualizers', 'networking'],
            paths: [],
            components: {
                quiz: 'houses/web/quizzes/web-osi.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-subnetting-quiz': {
            id: 'web-subnetting-quiz',
            title: 'Subnetting Quiz',
            description: 'Test subnetting skills',
            house: 'web',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['ip-addressing', 'networking'],
            paths: [],
            components: {
                quiz: 'houses/web/quizzes/web-subnetting.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-ports-quiz': {
            id: 'web-ports-quiz',
            title: 'Ports & Protocols Quiz',
            description: 'Test networking ports knowledge',
            house: 'web',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['visualizers', 'networking'],
            paths: [],
            components: {
                quiz: 'houses/web/quizzes/web-networking-fundamentals-ports.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-subnet-calc': {
            id: 'web-subnet-calc',
            title: 'Subnet Calculator',
            description: 'Calculate subnets, CIDR, and IP ranges',
            house: 'web',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['ip-addressing', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/tools/web-subnet.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-dns-reference': {
            id: 'web-dns-reference',
            title: 'DNS Header Reference',
            description: 'DNS packet structure reference',
            house: 'web',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['presentations', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/tools/web-dns-header.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-ip-addressing-module': {
            id: 'web-ip-addressing-module',
            title: 'IP Addressing (Ch 7-10)',
            description: 'Comprehensive IP addressing module',
            house: 'web',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['ip-addressing', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/modules/web-ip-addressing-ch7-10.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-flashcards': {
            id: 'web-flashcards',
            title: 'Networking Flashcards',
            description: 'Study flashcards for networking concepts',
            house: 'web',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['visualizers', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/modules/web-networking-flashcards.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-textbook': {
            id: 'web-textbook',
            title: 'Networking Textbook (Ch 7-20)',
            description: 'Complete networking textbook reference',
            house: 'web',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['presentations', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/textbook/web-networking-textbook-ch7-20.textbook.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-midterm': {
            id: 'web-midterm',
            title: 'Networking Midterm Exam',
            description: 'Comprehensive midterm assessment',
            house: 'web',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['labs', 'networking'],
            paths: [],
            components: {
                applet: 'houses/web/exams/web-networking-midterm.exam.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-networking-fundamentals-lab': {
            id: 'web-networking-fundamentals-lab',
            title: 'Networking Fundamentals Lab',
            description: 'OSI model, IP addressing, TCP/UDP, devices, VLANs, and routing with interactive exercises',
            house: 'web',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['labs', 'networking'],
            paths: [],
            components: {
                lab: 'houses/web/labs/web-networking-fundamentals.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'web-static-routes-lab': {
            id: 'web-static-routes-lab',
            title: 'Static Routes Lab',
            description: 'Build a multi-layer Packet Tracer topology with static routing',
            house: 'web',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['labs', 'networking'],
            paths: [],
            components: {
                lab: 'houses/web/labs/web-static-routes.lab.html'
            },
            prerequisites: [],
            objectives: []
        }
,

        // ─────────────────────────────────────────────────────────────
        // CLOUD HOUSE - 35 new entries
        // ─────────────────────────────────────────────────────────────
        'cloud-architecture-designer': {
            id: 'cloud-architecture-designer',
            title: 'Cloud Architecture Designer',
            description: 'Interactive tool for designing cloud architectures',
            house: 'cloud',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cloud'],
            paths: [],
            components: {
                applet: 'houses/cloud/applets/architecture/cloud-architecture-designer.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-support-plans': {
            id: 'cloud-support-plans',
            title: 'AWS Support Plans',
            description: 'Compare AWS support tiers and features',
            house: 'cloud',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cloud', 'aws'],
            paths: [],
            components: {
                applet: 'houses/cloud/applets/aws/cloud-ch03-support-plans.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-regions': {
            id: 'cloud-regions',
            title: 'AWS Regions Explorer',
            description: 'Global infrastructure and availability zones',
            house: 'cloud',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cloud', 'aws'],
            paths: [],
            components: {
                applet: 'houses/cloud/applets/aws/cloud-ch04-aws-regions.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-iam-quiz': {
            id: 'cloud-iam-quiz',
            title: 'IAM Security Quiz',
            description: 'Test your AWS IAM knowledge',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cloud'],
            paths: [],
            components: {
                quiz: 'houses/cloud/applets/aws/cloud-ch05-iam-security.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-ec2-visualizer': {
            id: 'cloud-ec2-visualizer',
            title: 'EC2 Instance Visualizer',
            description: 'Interactive EC2 instance types and pricing',
            house: 'cloud',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cloud'],
            paths: [],
            components: {
                applet: 'houses/cloud/applets/aws/cloud-ch07-ec2-instance.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-storage-quiz': {
            id: 'cloud-storage-quiz',
            title: 'Storage Services Quiz',
            description: 'Test your AWS storage knowledge',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cloud'],
            paths: [],
            components: {
                quiz: 'houses/cloud/applets/aws/cloud-ch08-storage.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-database-quiz': {
            id: 'cloud-database-quiz',
            title: 'Database Services Quiz',
            description: 'Test your AWS database knowledge',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cloud'],
            paths: [],
            components: {
                quiz: 'houses/cloud/applets/aws/cloud-ch09-database.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-networking-quiz': {
            id: 'cloud-networking-quiz',
            title: 'VPC Networking Quiz',
            description: 'Test your AWS networking knowledge',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cloud', 'networking'],
            paths: [],
            components: {
                quiz: 'houses/cloud/applets/aws/cloud-ch10-networking.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-automation': {
            id: 'cloud-automation',
            title: 'AWS Automation Explorer',
            description: 'CloudFormation, Elastic Beanstalk, and automation',
            house: 'cloud',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cloud', 'aws'],
            paths: [],
            components: {
                applet: 'houses/cloud/applets/aws/cloud-ch11-automation.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-use-cases': {
            id: 'cloud-use-cases',
            title: 'AWS Use Cases',
            description: 'Real-world AWS implementation scenarios',
            house: 'cloud',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cloud', 'aws'],
            paths: [],
            components: {
                applet: 'houses/cloud/applets/aws/cloud-ch12-use-cases.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-fundamentals-quiz': {
            id: 'cloud-fundamentals-quiz',
            title: 'Cloud Fundamentals Quiz',
            description: 'Test your cloud computing basics',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cloud'],
            paths: [],
            components: {
                quiz: 'houses/cloud/applets/fundamentals/cloud-ch01-cloud-fundamentals.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-visualizer': {
            id: 'cloud-visualizer',
            title: 'Cloud Visualizer',
            description: 'Interactive cloud concepts visualization',
            house: 'cloud',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cloud'],
            paths: [],
            components: {
                applet: 'houses/cloud/applets/fundamentals/cloud-cloud.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-lab-simulator': {
            id: 'cloud-lab-simulator',
            title: 'Cloud Lab Simulator',
            description: 'Hands-on cloud environment simulation',
            house: 'cloud',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cloud'],
            paths: [],
            components: {
                lab: 'houses/cloud/labs/cloud-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-aws-fundamentals-pres': {
            id: 'cloud-aws-fundamentals-pres',
            title: 'AWS Fundamentals Presentation',
            description: 'Slide deck covering AWS basics',
            house: 'cloud',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cloud', 'aws'],
            paths: [],
            components: {
                presentation: 'houses/cloud/presentations/cloud-aws-fundamentals.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-presentation': {
            id: 'cloud-presentation',
            title: 'Cloud Computing Presentation',
            description: 'Comprehensive cloud concepts slides',
            house: 'cloud',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cloud'],
            paths: [],
            components: {
                presentation: 'houses/cloud/presentations/cloud-cloud.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-01-fundamentals': {
            id: 'cse-01-fundamentals',
            title: 'CSE: Cloud Fundamentals',
            description: 'Cloud computing basics and shared responsibility model',
            house: 'cloud',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cloud'],
            paths: [],
            components: {
                presentation: 'houses/cloud/presentations/cloud-cse-01-cloud-fundamentals.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-02-iam': {
            id: 'cse-02-iam',
            title: 'CSE: Identity & Access Management',
            description: 'IAM, RBAC, MFA, and identity federation in cloud',
            house: 'cloud',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cloud'],
            paths: [],
            components: {
                presentation: 'houses/cloud/presentations/cloud-cse-02-identity-access-management.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-03-encryption': {
            id: 'cse-03-encryption',
            title: 'CSE: Data Protection & Encryption',
            description: 'Encryption at rest/transit, key management, DLP',
            house: 'cloud',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cloud', 'encryption'],
            paths: [],
            components: {
                presentation: 'houses/cloud/presentations/cloud-cse-03-data-protection-encryption.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-04-network': {
            id: 'cse-04-network',
            title: 'CSE: Network Security',
            description: 'VPC, NACLs, security groups, firewalls, IDS/IPS',
            house: 'cloud',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cloud', 'networking'],
            paths: [],
            components: {
                presentation: 'houses/cloud/presentations/cloud-cse-04-network-security.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-05-appsec': {
            id: 'cse-05-appsec',
            title: 'CSE: Application Security',
            description: 'Secure SDLC, WAF, OWASP Top 10, container security',
            house: 'cloud',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cloud'],
            paths: [],
            components: {
                presentation: 'houses/cloud/presentations/cloud-cse-05-application-security.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-01-quiz': {
            id: 'cse-01-quiz',
            title: 'CSE: Cloud Fundamentals Quiz',
            description: 'Test your cloud computing basics knowledge',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cloud'],
            paths: [],
            components: {
                quiz: 'houses/cloud/quizzes/cloud-cse-01.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-02-quiz': {
            id: 'cse-02-quiz',
            title: 'CSE: IAM Quiz',
            description: 'Test identity and access management knowledge',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cloud'],
            paths: [],
            components: {
                quiz: 'houses/cloud/quizzes/cloud-cse-02.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-03-quiz': {
            id: 'cse-03-quiz',
            title: 'CSE: Data Protection Quiz',
            description: 'Test encryption and data protection knowledge',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cloud'],
            paths: [],
            components: {
                quiz: 'houses/cloud/quizzes/cloud-cse-03.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-04-quiz': {
            id: 'cse-04-quiz',
            title: 'CSE: Network Security Quiz',
            description: 'Test cloud network security knowledge',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cloud', 'networking'],
            paths: [],
            components: {
                quiz: 'houses/cloud/quizzes/cloud-cse-04.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-05-quiz': {
            id: 'cse-05-quiz',
            title: 'CSE: Application Security Quiz',
            description: 'Test application security knowledge',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cloud'],
            paths: [],
            components: {
                quiz: 'houses/cloud/quizzes/cloud-cse-05.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-06-monitoring': {
            id: 'cse-06-monitoring',
            title: 'CSE: Security Monitoring & IR',
            description: 'SIEM, SOAR, CSPM, CNAPP, and incident response',
            house: 'cloud',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cloud'],
            paths: [],
            components: {
                presentation: 'houses/cloud/presentations/cloud-cse-06-security-monitoring-ir.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-06-quiz': {
            id: 'cse-06-quiz',
            title: 'CSE: Monitoring & IR Quiz',
            description: 'Test cloud monitoring and IR knowledge',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cloud'],
            paths: [],
            components: {
                quiz: 'houses/cloud/quizzes/cloud-cse-06.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-07-risk': {
            id: 'cse-07-risk',
            title: 'CSE: Risk Assessment & Management',
            description: 'Risk frameworks, NIST RMF, quantitative vs qualitative',
            house: 'cloud',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cloud'],
            paths: [],
            components: {
                presentation: 'houses/cloud/presentations/cloud-cse-07-risk-assessment.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-07-quiz': {
            id: 'cse-07-quiz',
            title: 'CSE: Risk Assessment Quiz',
            description: 'Test cloud risk management knowledge',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cloud'],
            paths: [],
            components: {
                quiz: 'houses/cloud/quizzes/cloud-cse-07.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-08-compliance': {
            id: 'cse-08-compliance',
            title: 'CSE: Compliance & Governance',
            description: 'GDPR, FISMA, PCI-DSS, HIPAA, NIST, ISO, CSA CCM',
            house: 'cloud',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cloud'],
            paths: [],
            components: {
                presentation: 'houses/cloud/presentations/cloud-cse-08-compliance-governance.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cse-08-quiz': {
            id: 'cse-08-quiz',
            title: 'CSE: Compliance Quiz - Final',
            description: 'Final quiz covering cloud compliance frameworks',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cloud'],
            paths: [],
            components: {
                quiz: 'houses/cloud/quizzes/cloud-cse-08.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-aws-quiz': {
            id: 'cloud-aws-quiz',
            title: 'AWS Fundamentals Quiz',
            description: 'Comprehensive AWS knowledge test',
            house: 'cloud',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cloud', 'aws'],
            paths: [],
            components: {
                quiz: 'houses/cloud/quizzes/cloud-aws-fundamentals.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-aws-services-lab': {
            id: 'cloud-aws-services-lab',
            title: 'AWS Services Lab',
            description: 'Hands-on exercises for AWS infrastructure, compute, storage, databases, VPC, and IAM',
            house: 'cloud',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cloud', 'aws'],
            paths: [],
            components: {
                lab: 'houses/cloud/labs/cloud-aws-services.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-architecture-lab': {
            id: 'cloud-architecture-lab',
            title: 'Cloud Architecture Lab',
            description: 'Design patterns, multi-cloud strategies, high availability, and IaC principles',
            house: 'cloud',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cloud'],
            paths: [],
            components: {
                lab: 'houses/cloud/labs/cloud-architecture.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'cloud-security-lab': {
            id: 'cloud-security-lab',
            title: 'Cloud Security Lab',
            description: 'Shared responsibility, IAM, encryption, network security, and compliance for CLF-C02',
            house: 'cloud',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cloud'],
            paths: [],
            components: {
                lab: 'houses/cloud/labs/cloud-security.lab.html'
            },
            prerequisites: [],
            objectives: []
        }
,

        // ─────────────────────────────────────────────────────────────
        // FORGE HOUSE - 37 new entries
        // ─────────────────────────────────────────────────────────────
        'forge-admin-tools-explorer': {
            id: 'forge-admin-tools-explorer',
            title: 'Admin Tools Explorer',
            description: 'Interactive Windows administrative tools guide',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: [],
            components: {
                applet: 'houses/forge/applets/forge-admin-tools.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-command-translator': {
            id: 'forge-command-translator',
            title: 'Command Translator',
            description: 'Translate commands between Windows and Linux',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: [],
            components: {
                applet: 'houses/forge/applets/forge-command-translator.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-control-panel-explorer': {
            id: 'forge-control-panel-explorer',
            title: 'Control Panel Explorer',
            description: 'Interactive Control Panel navigation guide',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: [],
            components: {
                applet: 'houses/forge/applets/forge-control-panel.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-settings-explorer': {
            id: 'forge-settings-explorer',
            title: 'Settings Explorer',
            description: 'Interactive Windows Settings app guide',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: [],
            components: {
                applet: 'houses/forge/applets/forge-settings.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-system-tools-sim': {
            id: 'forge-system-tools-sim',
            title: 'System Tools Simulator',
            description: 'Simulate Windows system management tools',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: [],
            components: {
                applet: 'houses/forge/applets/forge-system-tools-sim.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-windows-edition-selector': {
            id: 'forge-windows-edition-selector',
            title: 'Windows Edition Selector',
            description: 'Compare and select Windows editions',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems', 'windows'],
            paths: [],
            components: {
                applet: 'houses/forge/applets/forge-windows-edition-selector.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-backup-planner': {
            id: 'forge-backup-planner',
            title: 'Backup Strategy Planner',
            description: 'Design backup and recovery strategies',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/forge-backup-strategy-planner.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-cpu-architecture': {
            id: 'forge-cpu-architecture',
            title: 'CPU Architecture',
            description: 'Interactive CPU components and architecture',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/cpu_architecture/forge-cpu-architecture.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-display-types': {
            id: 'forge-display-types',
            title: 'Display Technologies',
            description: 'Monitor types and display technologies',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/display_types/forge-display-types.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-hard-drive': {
            id: 'forge-hard-drive',
            title: 'Hard Drive Geometry',
            description: 'Hard drive structure and geometry concepts',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/hard_drive_geometry/forge-hard-drive-geometry1.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-laptop-hardware': {
            id: 'forge-laptop-hardware',
            title: 'Laptop Hardware',
            description: 'Laptop-specific components and upgrades',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/laptop_hardware/forge-laptop-hardware.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-mobile-accessories': {
            id: 'forge-mobile-accessories',
            title: 'Mobile Accessories',
            description: 'Mobile device accessories and connections',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/mobile_accessories/forge-mobile-accessories.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-motherboards': {
            id: 'forge-motherboards',
            title: 'Motherboards',
            description: 'Motherboard components and form factors',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/motherboards/forge-motherboards.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-multimeter': {
            id: 'forge-multimeter',
            title: 'Multimeter Training',
            description: 'Learn to use a multimeter for hardware testing',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/multimeter/forge-multimeter-jedit-v1.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-network-cables': {
            id: 'forge-network-cables',
            title: 'Network Cables',
            description: 'Cable types, standards, and termination',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems', 'networking'],
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/network_cables/forge-network-cables.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-network-ports': {
            id: 'forge-network-ports',
            title: 'Network Ports',
            description: 'Physical network port types and usage',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems', 'networking'],
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/network_ports/forge-network-ports.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-peripheral-devices': {
            id: 'forge-peripheral-devices',
            title: 'Peripheral Devices',
            description: 'Input/output devices and connections',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/peripheral_devices/forge-peripheral-devices.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-power-supplies': {
            id: 'forge-power-supplies',
            title: 'Power Supplies',
            description: 'PSU specifications and power requirements',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/power_supplies/forge-power-supplies.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-printers': {
            id: 'forge-printers',
            title: 'Printers',
            description: 'Printer types, maintenance, and troubleshooting',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/printers/forge-printers.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-raid-storage': {
            id: 'forge-raid-storage',
            title: 'RAID Storage',
            description: 'RAID configurations and storage arrays',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/raid_storage/forge-raid-storage.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-ram-types': {
            id: 'forge-ram-types',
            title: 'RAM Types',
            description: 'Memory types, speeds, and compatibility',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/ram_types/forge-ram-types.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-storage-devices': {
            id: 'forge-storage-devices',
            title: 'Storage Devices',
            description: 'HDD, SSD, and storage technologies',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/storage_devices/forge-storage-devices.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-virtualization': {
            id: 'forge-virtualization',
            title: 'Virtualization',
            description: 'Virtual machines and hypervisors',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems'],
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/virtualization/forge-virtualization.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-wireless': {
            id: 'forge-wireless',
            title: 'Wireless Networking',
            description: 'WiFi standards and wireless technologies',
            house: 'forge',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['systems', 'networking'],
            paths: [],
            components: {
                applet: 'houses/forge/applets/hardware/wireless_networking/forge-wireless-networking.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-admin-tools-lab': {
            id: 'forge-admin-tools-lab',
            title: 'Admin Tools Lab',
            description: 'Hands-on administrative tools practice',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['systems'],
            paths: [],
            components: {
                lab: 'houses/forge/labs/forge-admin-tools.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-control-panel-lab': {
            id: 'forge-control-panel-lab',
            title: 'Control Panel Lab',
            description: 'Hands-on Control Panel exercises',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['systems'],
            paths: [],
            components: {
                lab: 'houses/forge/labs/forge-control-panel.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-macos-linux-lab': {
            id: 'forge-macos-linux-lab',
            title: 'macOS & Linux Lab',
            description: 'Cross-platform OS exercises',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['systems', 'linux'],
            paths: [],
            components: {
                lab: 'houses/forge/labs/forge-lab-macos-linux.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-system-tools-lab': {
            id: 'forge-system-tools-lab',
            title: 'System Tools Lab',
            description: 'Practice with system utilities',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['systems'],
            paths: [],
            components: {
                lab: 'houses/forge/labs/forge-system-tools.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-windows-editions-lab': {
            id: 'forge-windows-editions-lab',
            title: 'Windows Editions Lab',
            description: 'Compare Windows editions hands-on',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['systems', 'windows'],
            paths: [],
            components: {
                lab: 'houses/forge/labs/forge-windows-editions.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-windows-settings-lab': {
            id: 'forge-windows-settings-lab',
            title: 'Windows Settings Lab',
            description: 'Settings app configuration exercises',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['systems', 'windows'],
            paths: [],
            components: {
                lab: 'houses/forge/labs/forge-windows-settings.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-windows-admin-quiz': {
            id: 'forge-windows-admin-quiz',
            title: 'Windows Admin Quiz',
            description: 'Test Windows administration knowledge',
            house: 'forge',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['systems', 'windows'],
            paths: [],
            components: {
                quiz: 'houses/forge/quizzes/forge-windows-admin.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-aplus-core2-quiz': {
            id: 'forge-aplus-core2-quiz',
            title: 'A+ Core 2 Quiz (Ch 19-22)',
            description: 'CompTIA A+ Core 2 chapters 19-22 assessment',
            house: 'forge',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['systems'],
            paths: [],
            components: {
                quiz: 'houses/forge/quizzes/forge-aplus-core2-ch19-22.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-aplus-jeopardy': {
            id: 'forge-aplus-jeopardy',
            title: 'A+ Jeopardy',
            description: 'CompTIA A+ review in Jeopardy format',
            house: 'forge',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['systems'],
            paths: [],
            components: {
                applet: 'houses/forge/games/forge-aplus-jeopardy.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-cpu-arch-ref': {
            id: 'forge-cpu-arch-ref',
            title: 'CPU Architecture Reference',
            description: 'CPU architecture and components reference',
            house: 'forge',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['systems'],
            paths: [],
            components: {
                applet: 'houses/forge/reference/forge-cpu-architecture.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-windows-shortcuts': {
            id: 'forge-windows-shortcuts',
            title: 'Windows Shortcuts Reference',
            description: 'Essential Windows keyboard shortcuts',
            house: 'forge',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['systems', 'windows'],
            paths: [],
            components: {
                applet: 'houses/forge/reference/forge-windows-shortcuts.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-hardware-lab': {
            id: 'forge-hardware-lab',
            title: 'Hardware Essentials Lab',
            description: 'Hands-on exercises covering CPUs, motherboards, RAM, storage, and power supplies',
            house: 'forge',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['systems'],
            paths: [],
            components: {
                lab: 'houses/forge/labs/forge-hardware-essentials.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'forge-hardware-quiz': {
            id: 'forge-hardware-quiz',
            title: 'Hardware Essentials Quiz',
            description: '15 questions covering A+ Core 1 hardware topics',
            house: 'forge',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['systems'],
            paths: [],
            components: {
                quiz: 'houses/forge/quizzes/forge-hardware-essentials.quiz.html'
            },
            prerequisites: [],
            objectives: []
        }
,

        // ─────────────────────────────────────────────────────────────
        // SCRIPT HOUSE - 68 new entries
        // ─────────────────────────────────────────────────────────────
        'script-macos-linux-lab': {
            id: 'script-macos-linux-lab',
            title: 'macOS & Linux Lab',
            description: 'Hands-on practice with macOS and Linux systems',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['scripting', 'linux'],
            paths: [],
            components: {
                lab: 'houses/script/applets/linux/script-lab-macos-linux.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-python-file-handling': {
            id: 'script-python-file-handling',
            title: 'Python File Handling',
            description: 'Reading, writing, and manipulating files',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['scripting', 'python'],
            paths: [],
            components: {
                applet: 'houses/script/applets/python/script-python-chapter7-file-handling.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-package-manager': {
            id: 'script-package-manager',
            title: 'Package Manager',
            description: 'Managing software with apt, yum, and pip',
            house: 'script',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['scripting'],
            paths: [],
            components: {
                applet: 'houses/script/applets/sysadmin/script-package-manager.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-automation-presentation': {
            id: 'script-automation-presentation',
            title: 'Automation Presentation',
            description: 'Slide deck on automation fundamentals',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/presentations/script-automation.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-macos-linux-basics': {
            id: 'script-macos-linux-basics',
            title: 'macOS & Linux Basics',
            description: 'Introduction to macOS and Linux operating systems',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['scripting', 'linux'],
            paths: [],
            components: {
                presentation: 'houses/script/presentations/script-macos-linux-basics.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-scripting-basics': {
            id: 'script-scripting-basics',
            title: 'Scripting Basics',
            description: 'Fundamentals of shell scripting',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/presentations/script-scripting-basics.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-quiz': {
            id: 'script-linux-quiz',
            title: 'Linux Basics Quiz',
            description: 'Test your Linux knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['scripting', 'linux'],
            paths: [],
            components: {
                quiz: 'houses/script/quizzes/script-linux-basics.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-001': {
            id: 'clh-001',
            title: 'CLH-001: Introduction to Hacker CLI',
            description: 'Begin your journey as a command line operator. Reconnaissance basics.',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-001/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-002': {
            id: 'clh-002',
            title: 'CLH-002: Navigation & Reconnaissance',
            description: 'Navigate filesystems and extract intel from target directories.',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-002/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-003': {
            id: 'clh-003',
            title: 'CLH-003: Pattern Hunting',
            description: 'Hunt for hidden codes using grep. Find the secret in mystery.txt.',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-003/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-004': {
            id: 'clh-004',
            title: 'CLH-004: Process Investigation',
            description: 'Hunt suspicious processes. Find the malware hiding in the process list.',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-004/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-005': {
            id: 'clh-005',
            title: 'CLH-005: Log Analysis',
            description: 'Analyze system logs. Find error patterns and document anomalies.',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-005/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-006': {
            id: 'clh-006',
            title: 'CLH-006: File Operations',
            description: 'Create, copy, move, and delete files during field operations.',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-006/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-007': {
            id: 'clh-007',
            title: 'CLH-007: Permissions & Access Control',
            description: 'Decode permission matrices and secure sensitive files.',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-007/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-008': {
            id: 'clh-008',
            title: 'CLH-008: Shell Scripting Basics',
            description: 'Write and execute shell scripts for automated operations.',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-008/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-009': {
            id: 'clh-009',
            title: 'CLH-009: Text Processing',
            description: 'Extract and analyze data with cut, sort, uniq, awk, and sed.',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-009/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-010': {
            id: 'clh-010',
            title: 'CLH-010: I/O Redirection',
            description: 'Control data streams with redirects, pipes, and tee.',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-010/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-011': {
            id: 'clh-011',
            title: 'CLH-011: Advanced Grep & Regex',
            description: 'Hunt patterns with grep flags and regular expressions.',
            house: 'script',
            type: 'lab',
            difficulty: 'advanced',
            duration: 45,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-011/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-012': {
            id: 'clh-012',
            title: 'CLH-012: Network Basics',
            description: 'Probe network connectivity with ping, netstat, ss, and ip commands.',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['clh', 'scripting', 'networking'],
            paths: [],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-012/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-013': {
            id: 'clh-013',
            title: 'CLH-013: Environment Variables',
            description: 'Master shell environment with env, export, and PATH manipulation.',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-013/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-014': {
            id: 'clh-014',
            title: 'CLH-014: Process Control',
            description: 'Manage processes with ps, kill, jobs, bg, fg, and nohup.',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-014/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-015': {
            id: 'clh-015',
            title: 'CLH-015: Capstone Mission',
            description: 'Final investigation. Apply all skills. Earn CLI Engineer certification.',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/courses/clh/modules/clh-015/script-lab.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-001-quiz': {
            id: 'clh-001-quiz',
            title: 'CLH-001 Quiz',
            description: 'Test CLH-001 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/script-clh-001.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-002-quiz': {
            id: 'clh-002-quiz',
            title: 'CLH-002 Quiz',
            description: 'Test CLH-002 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/script-clh-002.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-003-quiz': {
            id: 'clh-003-quiz',
            title: 'CLH-003 Quiz',
            description: 'Test CLH-003 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/script-clh-003.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-004-quiz': {
            id: 'clh-004-quiz',
            title: 'CLH-004 Quiz',
            description: 'Test CLH-004 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/script-clh-004.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-005-quiz': {
            id: 'clh-005-quiz',
            title: 'CLH-005 Quiz',
            description: 'Test CLH-005 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/script-clh-005.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-006-quiz': {
            id: 'clh-006-quiz',
            title: 'CLH-006 Quiz',
            description: 'Test CLH-006 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/script-clh-006.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-007-quiz': {
            id: 'clh-007-quiz',
            title: 'CLH-007 Quiz',
            description: 'Test CLH-007 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/script-clh-007.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-008-quiz': {
            id: 'clh-008-quiz',
            title: 'CLH-008 Quiz',
            description: 'Test CLH-008 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/script-clh-008.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-009-quiz': {
            id: 'clh-009-quiz',
            title: 'CLH-009 Quiz',
            description: 'Test CLH-009 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/script-clh-009.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-010-quiz': {
            id: 'clh-010-quiz',
            title: 'CLH-010 Quiz',
            description: 'Test CLH-010 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/script-clh-010.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-011-quiz': {
            id: 'clh-011-quiz',
            title: 'CLH-011 Quiz',
            description: 'Test CLH-011 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/script-clh-011.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-012-quiz': {
            id: 'clh-012-quiz',
            title: 'CLH-012 Quiz',
            description: 'Test CLH-012 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/script-clh-012.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-013-quiz': {
            id: 'clh-013-quiz',
            title: 'CLH-013 Quiz',
            description: 'Test CLH-013 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/script-clh-013.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-014-quiz': {
            id: 'clh-014-quiz',
            title: 'CLH-014 Quiz',
            description: 'Test CLH-014 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/script-clh-014.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-015-quiz': {
            id: 'clh-015-quiz',
            title: 'CLH-015 Quiz',
            description: 'Test CLH-015 knowledge',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/clh/script-clh-015.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-001-presentation': {
            id: 'clh-001-presentation',
            title: 'CLH-001 Reading',
            description: 'Introduction to the Hacker CLI concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/script-clh-001-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-002-presentation': {
            id: 'clh-002-presentation',
            title: 'CLH-002 Reading',
            description: 'Navigation & Reconnaissance concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/script-clh-002-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-003-presentation': {
            id: 'clh-003-presentation',
            title: 'CLH-003 Reading',
            description: 'Network Analysis concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/script-clh-003-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-004-presentation': {
            id: 'clh-004-presentation',
            title: 'CLH-004 Reading',
            description: 'Text Analysis & Pattern Hunting concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/script-clh-004-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-005-presentation': {
            id: 'clh-005-presentation',
            title: 'CLH-005 Reading',
            description: 'Process Investigation concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/script-clh-005-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-006-presentation': {
            id: 'clh-006-presentation',
            title: 'CLH-006 Reading',
            description: 'Permissions & Access Control concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/script-clh-006-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-007-presentation': {
            id: 'clh-007-presentation',
            title: 'CLH-007 Reading',
            description: 'Shell Scripting Basics concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/script-clh-007-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-008-presentation': {
            id: 'clh-008-presentation',
            title: 'CLH-008 Reading',
            description: 'Advanced Shell Scripting concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/script-clh-008-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-009-presentation': {
            id: 'clh-009-presentation',
            title: 'CLH-009 Reading',
            description: 'System Administration concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/script-clh-009-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-010-presentation': {
            id: 'clh-010-presentation',
            title: 'CLH-010 Reading',
            description: 'Log Analysis & Forensics concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/script-clh-010-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-011-presentation': {
            id: 'clh-011-presentation',
            title: 'CLH-011 Reading',
            description: 'Network Reconnaissance concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/script-clh-011-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-012-presentation': {
            id: 'clh-012-presentation',
            title: 'CLH-012 Reading',
            description: 'Web Enumeration concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/script-clh-012-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-013-presentation': {
            id: 'clh-013-presentation',
            title: 'CLH-013 Reading',
            description: 'Incident Response concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/script-clh-013-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-014-presentation': {
            id: 'clh-014-presentation',
            title: 'CLH-014 Reading',
            description: 'Automation & Tooling concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/script-clh-014-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'clh-015-presentation': {
            id: 'clh-015-presentation',
            title: 'CLH-015 Reading',
            description: 'Capstone Challenge preparation',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['clh', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/clh/script-clh-015-intro.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-lab': {
            id: 'script-linux-lab',
            title: 'Linux/Bash Lab',
            description: 'Hands-on exercises for shell navigation, file operations, text processing, and scripting',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['linux', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/labs/script-linux-bash.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-linux-quiz': {
            id: 'script-linux-quiz',
            title: 'Linux/Bash Quiz',
            description: '15 questions covering essential Linux and Bash concepts',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['linux', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/quizzes/script-linux-bash.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-python-lab': {
            id: 'script-python-lab',
            title: 'Python Programming Lab',
            description: 'From basics to OOP with hands-on exercises covering all Python fundamentals',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['python', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/labs/script-python.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-python-quiz': {
            id: 'script-python-quiz',
            title: 'Python Programming Quiz',
            description: '15 questions testing Python syntax, data structures, and OOP',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['python', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/quizzes/script-python.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'python-ch1-presentation': {
            id: 'python-ch1-presentation',
            title: 'Python Ch.1 Reading',
            description: 'The First Bit - Python introduction concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['python', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/presentations/python/script-python-chapter1.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'python-ch2-presentation': {
            id: 'python-ch2-presentation',
            title: 'Python Ch.2 Reading',
            description: 'Strings - Text manipulation concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['python', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/presentations/python/script-python-chapter2.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'python-ch3-presentation': {
            id: 'python-ch3-presentation',
            title: 'Python Ch.3 Reading',
            description: 'Flow Control - Conditionals and loops',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['python', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/presentations/python/script-python-chapter3.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'python-ch4-presentation': {
            id: 'python-ch4-presentation',
            title: 'Python Ch.4 Reading',
            description: 'Functions - Reusable code concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['python', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/presentations/python/script-python-chapter4.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'python-ch5-presentation': {
            id: 'python-ch5-presentation',
            title: 'Python Ch.5 Reading',
            description: 'Collections - Lists and tuples concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['python', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/presentations/python/script-python-chapter5.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'python-ch6-presentation': {
            id: 'python-ch6-presentation',
            title: 'Python Ch.6 Reading',
            description: 'Dictionaries - Key-value pair concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['python', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/presentations/python/script-python-chapter6.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'python-ch7-presentation': {
            id: 'python-ch7-presentation',
            title: 'Python Ch.7 Reading',
            description: 'File Handling - Reading and writing files',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['python', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/presentations/python/script-python-chapter7.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'python-ch8-presentation': {
            id: 'python-ch8-presentation',
            title: 'Python Ch.8 Reading',
            description: 'OOP - Object-oriented programming concepts',
            house: 'script',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['python', 'scripting'],
            paths: [],
            components: {
                presentation: 'houses/script/presentations/python/script-python-chapter8.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-powershell-lab': {
            id: 'script-powershell-lab',
            title: 'PowerShell Automation Lab',
            description: 'Master Windows automation with object pipelines, scripting, and system administration',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['powershell', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/labs/script-powershell.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-powershell-quiz': {
            id: 'script-powershell-quiz',
            title: 'PowerShell Automation Quiz',
            description: '15 questions on cmdlets, pipelines, and Windows automation',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['powershell', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/quizzes/script-powershell.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-sysadmin-lab': {
            id: 'script-sysadmin-lab',
            title: 'Sysadmin & Automation Lab',
            description: 'Cross-platform automation for logs, backups, scheduling, and user management',
            house: 'script',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['sysadmin', 'scripting'],
            paths: [],
            components: {
                lab: 'houses/script/labs/script-sysadmin.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'script-sysadmin-quiz': {
            id: 'script-sysadmin-quiz',
            title: 'Sysadmin & Automation Quiz',
            description: '15 questions on automation best practices and system administration',
            house: 'script',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['sysadmin', 'scripting'],
            paths: [],
            components: {
                quiz: 'houses/script/quizzes/script-sysadmin.quiz.html'
            },
            prerequisites: [],
            objectives: []
        }
,

        // ─────────────────────────────────────────────────────────────
        // CODE HOUSE - 31 new entries
        // ─────────────────────────────────────────────────────────────
        'code-version-control': {
            id: 'code-version-control',
            title: 'Version Control Guide',
            description: 'Comprehensive Git guide: workflows, branching strategies, and GitHub integration',
            house: 'code',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['devops'],
            paths: [],
            components: {
                applet: 'houses/code/presentations/code-git-basics.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-automation-devops': {
            id: 'code-automation-devops',
            title: 'Network Automation & DevOps',
            description: 'REST APIs, NETCONF, RESTCONF, and automation fundamentals',
            house: 'code',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 45,
            topics: ['devops', 'networking'],
            paths: [],
            components: {
                presentation: 'houses/code/presentations/code-automation.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-api-visualizer': {
            id: 'code-api-visualizer',
            title: 'API & Automation Visualizer',
            description: 'Interactive visualization of network automation and API concepts',
            house: 'code',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['devops'],
            paths: [],
            components: {
                applet: 'houses/code/applets/code-automation.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-devnet-guide': {
            id: 'code-devnet-guide',
            title: 'Cisco DevNet Sandbox Guide',
            description: 'Complete guide to DevNet labs, Python automation, and Ansible playbooks',
            house: 'code',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['devops'],
            paths: [],
            components: {
                applet: 'houses/code/applets/code-terraform.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-config-management': {
            id: 'code-config-management',
            title: 'Configuration Management',
            description: 'Infrastructure as Code principles and configuration automation',
            house: 'code',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['devops'],
            paths: [],
            components: {
                applet: 'houses/code/applets/config_management/code-config-mgmt.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-docker-basics': {
            id: 'code-docker-basics',
            title: 'Docker Basics',
            description: 'Container fundamentals: images, containers, and Docker commands',
            house: 'code',
            type: 'lab',
            difficulty: 'beginner',
            duration: 65,
            topics: ['devops', 'docker'],
            paths: [],
            components: {
                lab: 'houses/code/presentations/code-docker-fundamentals.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-unit-testing': {
            id: 'code-unit-testing',
            title: 'Unit Testing',
            description: 'Test-driven development and unit testing fundamentals',
            house: 'code',
            type: 'lab',
            difficulty: 'beginner',
            duration: 65,
            topics: ['devops'],
            paths: [],
            components: {},
            prerequisites: [],
            objectives: []
        },
        'code-cloudformation-designer': {
            id: 'code-cloudformation-designer',
            title: 'CloudFormation Designer',
            description: 'Visual CloudFormation template builder',
            house: 'code',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['devops'],
            paths: [],
            components: {
                applet: 'houses/code/applets/code-cloudformation-designer.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-docker-playground': {
            id: 'code-docker-playground',
            title: 'Docker Playground',
            description: 'Interactive Docker container sandbox',
            house: 'code',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['devops', 'docker'],
            paths: [],
            components: {
                applet: 'houses/code/applets/code-docker-playground.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-kubernetes-sim': {
            id: 'code-kubernetes-sim',
            title: 'Kubernetes Cluster Simulator',
            description: 'Simulate Kubernetes cluster operations',
            house: 'code',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['devops'],
            paths: [],
            components: {
                applet: 'houses/code/applets/code-kubernetes-cluster-sim.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-pipeline-builder': {
            id: 'code-pipeline-builder',
            title: 'Pipeline Builder',
            description: 'Design and visualize CI/CD pipelines',
            house: 'code',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['devops'],
            paths: [],
            components: {
                applet: 'houses/code/applets/code-pipeline-builder.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-sprint-simulator': {
            id: 'code-sprint-simulator',
            title: 'Sprint Simulator',
            description: 'Agile sprint planning and simulation',
            house: 'code',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['devops'],
            paths: [],
            components: {
                applet: 'houses/code/applets/code-sprint.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-cicd-lab': {
            id: 'code-cicd-lab',
            title: 'CI/CD Lab',
            description: 'Hands-on CI/CD pipeline implementation',
            house: 'code',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['devops'],
            paths: [],
            components: {
                lab: 'houses/code/labs/code-cicd.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-cloudformation-lab': {
            id: 'code-cloudformation-lab',
            title: 'CloudFormation Lab',
            description: 'Build infrastructure with CloudFormation',
            house: 'code',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['devops'],
            paths: [],
            components: {
                lab: 'houses/code/labs/code-cloudformation.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-docker-lab': {
            id: 'code-docker-lab',
            title: 'Docker Lab',
            description: 'Container creation and management exercises',
            house: 'code',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['devops', 'docker'],
            paths: [],
            components: {
                lab: 'houses/code/labs/code-docker.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-kubernetes-lab': {
            id: 'code-kubernetes-lab',
            title: 'Kubernetes Lab',
            description: 'Deploy and manage Kubernetes workloads',
            house: 'code',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['devops'],
            paths: [],
            components: {
                lab: 'houses/code/labs/code-kubernetes.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-terraform-lab': {
            id: 'code-terraform-lab',
            title: 'Terraform Lab',
            description: 'Infrastructure provisioning with Terraform',
            house: 'code',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['devops'],
            paths: [],
            components: {
                lab: 'houses/code/labs/code-terraform.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-agile-sdlc': {
            id: 'code-agile-sdlc',
            title: 'Agile & SDLC',
            description: 'Software development lifecycle and Agile methodologies',
            house: 'code',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['devops'],
            paths: [],
            components: {
                presentation: 'houses/code/presentations/code-agile-sdlc.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-cicd-fundamentals': {
            id: 'code-cicd-fundamentals',
            title: 'CI/CD Fundamentals',
            description: 'Continuous Integration and Delivery concepts',
            house: 'code',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['devops'],
            paths: [],
            components: {
                presentation: 'houses/code/presentations/code-cicd-fundamentals.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-cloudformation-fundamentals': {
            id: 'code-cloudformation-fundamentals',
            title: 'CloudFormation Fundamentals',
            description: 'AWS infrastructure as code with CloudFormation',
            house: 'code',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['devops'],
            paths: [],
            components: {
                presentation: 'houses/code/presentations/code-cloudformation-fundamentals.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-kubernetes-fundamentals': {
            id: 'code-kubernetes-fundamentals',
            title: 'Kubernetes Fundamentals',
            description: 'Container orchestration with Kubernetes',
            house: 'code',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['devops'],
            paths: [],
            components: {
                presentation: 'houses/code/presentations/code-kubernetes-fundamentals.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-terraform-fundamentals': {
            id: 'code-terraform-fundamentals',
            title: 'Terraform Fundamentals',
            description: 'Multi-cloud infrastructure with Terraform',
            house: 'code',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['devops'],
            paths: [],
            components: {
                presentation: 'houses/code/presentations/code-terraform-fundamentals.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-agile-quiz': {
            id: 'code-agile-quiz',
            title: 'Agile Quiz',
            description: 'Test your Agile and SDLC knowledge',
            house: 'code',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['devops'],
            paths: [],
            components: {
                quiz: 'houses/code/quizzes/code-agile.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-cicd-quiz': {
            id: 'code-cicd-quiz',
            title: 'CI/CD Quiz',
            description: 'Test your CI/CD knowledge',
            house: 'code',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['devops'],
            paths: [],
            components: {
                quiz: 'houses/code/quizzes/code-cicd.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-cloudformation-quiz': {
            id: 'code-cloudformation-quiz',
            title: 'CloudFormation Quiz',
            description: 'Test your CloudFormation knowledge',
            house: 'code',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['devops'],
            paths: [],
            components: {
                quiz: 'houses/code/quizzes/code-cloudformation.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-docker-quiz': {
            id: 'code-docker-quiz',
            title: 'Docker Quiz',
            description: 'Test your Docker knowledge',
            house: 'code',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['devops', 'docker'],
            paths: [],
            components: {
                quiz: 'houses/code/quizzes/code-docker.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-kubernetes-quiz': {
            id: 'code-kubernetes-quiz',
            title: 'Kubernetes Quiz',
            description: 'Test your Kubernetes knowledge',
            house: 'code',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['devops'],
            paths: [],
            components: {
                quiz: 'houses/code/quizzes/code-kubernetes.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-terraform-quiz': {
            id: 'code-terraform-quiz',
            title: 'Terraform Quiz',
            description: 'Test your Terraform knowledge',
            house: 'code',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['devops'],
            paths: [],
            components: {
                quiz: 'houses/code/quizzes/code-terraform.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-data-format-converter': {
            id: 'code-data-format-converter',
            title: 'Data Format Converter',
            description: 'Convert between JSON, XML, and YAML formats with syntax highlighting and validation',
            house: 'code',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['devops'],
            paths: [],
            components: {
                applet: 'houses/code/applets/code-data-format-converter.applet.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-api-explorer': {
            id: 'code-api-explorer',
            title: 'API Explorer',
            description: 'Build and test HTTP requests with headers, parameters, auth, and response visualization',
            house: 'code',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['devops'],
            paths: [],
            components: {
                applet: 'houses/code/applets/code-api.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'code-ansible-visualizer': {
            id: 'code-ansible-visualizer',
            title: 'Ansible Playbook Visualizer',
            description: 'Parse and visualize Ansible playbook structure - plays, tasks, handlers, and variables',
            house: 'code',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['devops'],
            paths: [],
            components: {
                applet: 'houses/code/applets/code-ansible-playbook.tool.html'
            },
            prerequisites: [],
            objectives: []
        }
,

        // ─────────────────────────────────────────────────────────────
        // KEY HOUSE - 36 new entries
        // ─────────────────────────────────────────────────────────────
        'key-symmetric-vs-asymmetric': {
            id: 'key-symmetric-vs-asymmetric',
            title: 'Symmetric vs Asymmetric',
            description: 'Understanding the differences and use cases for each approach',
            house: 'key',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 35,
            topics: ['cryptography'],
            paths: [],
            components: {
                presentation: 'houses/key/presentations/key-advanced-symmetric.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-hashing-integrity': {
            id: 'key-hashing-integrity',
            title: 'Hashing & Integrity',
            description: 'Hash functions, checksums, and verifying data integrity',
            house: 'key',
            type: 'lab',
            difficulty: 'beginner',
            duration: 65,
            topics: ['cryptography', 'hashing'],
            paths: [],
            components: {
                lab: 'houses/key/tools/key-hmac.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-digital-signatures': {
            id: 'key-digital-signatures',
            title: 'Digital Signatures',
            description: 'Creating and verifying digital signatures for authentication',
            house: 'key',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 35,
            topics: ['cryptography'],
            paths: [],
            components: {
                presentation: 'houses/key/tools/key-cert.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-pki-deep-dive': {
            id: 'key-pki-deep-dive',
            title: 'PKI Deep Dive',
            description: 'Certificate authorities, chains of trust, and PKI infrastructure',
            house: 'key',
            type: 'lab',
            difficulty: 'beginner',
            duration: 65,
            topics: ['cryptography'],
            paths: [],
            components: {
                lab: 'houses/key/presentations/key-certificates.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-tls-ssl': {
            id: 'key-tls-ssl',
            title: 'TLS/SSL Explained',
            description: 'Transport Layer Security protocols and secure web communications',
            house: 'key',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 35,
            topics: ['cryptography'],
            paths: [],
            components: {},
            prerequisites: [],
            objectives: []
        },
        'key-cryptography-fundamentals': {
            id: 'key-cryptography-fundamentals',
            title: 'Cryptography Fundamentals (CEH)',
            description: 'Complete CEH coverage: classical ciphers, symmetric/asymmetric, hashing, PKI, digital signatures, crypto tools & GAK ethics',
            house: 'key',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 35,
            topics: ['cryptography'],
            paths: [],
            components: {
                quiz: 'houses/key/presentations/key-cryptography-fundamentals.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-aes-lab': {
            id: 'key-aes-lab',
            title: 'AES Encryption Lab',
            description: 'Hands-on AES encryption implementation and analysis',
            house: 'key',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cryptography', 'encryption'],
            paths: [],
            components: {
                lab: 'houses/key/labs/key-aes.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-attack-lab': {
            id: 'key-attack-lab',
            title: 'Cryptographic Attack Lab',
            description: 'Practice common cryptographic attacks and defenses',
            house: 'key',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cryptography'],
            paths: [],
            components: {
                lab: 'houses/key/labs/key-attack.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-cert-lab': {
            id: 'key-cert-lab',
            title: 'Certificate Lab',
            description: 'Create and manage digital certificates',
            house: 'key',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cryptography'],
            paths: [],
            components: {
                lab: 'houses/key/labs/key-cert.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-ecc-lab': {
            id: 'key-ecc-lab',
            title: 'Elliptic Curve Lab',
            description: 'Implement ECC algorithms and key exchange',
            house: 'key',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cryptography'],
            paths: [],
            components: {
                lab: 'houses/key/labs/key-ecc.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-hmac-lab': {
            id: 'key-hmac-lab',
            title: 'HMAC Lab',
            description: 'Message authentication code implementation',
            house: 'key',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cryptography'],
            paths: [],
            components: {
                lab: 'houses/key/labs/key-hmac.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-hsm-lab': {
            id: 'key-hsm-lab',
            title: 'HSM Lab',
            description: 'Hardware Security Module operations',
            house: 'key',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cryptography'],
            paths: [],
            components: {
                lab: 'houses/key/labs/key-hsm.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-kdf-lab': {
            id: 'key-kdf-lab',
            title: 'Key Derivation Lab',
            description: 'Key derivation function implementation',
            house: 'key',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cryptography'],
            paths: [],
            components: {
                lab: 'houses/key/labs/key-kdf.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-pqc-lab': {
            id: 'key-pqc-lab',
            title: 'Post-Quantum Crypto Lab',
            description: 'Quantum-resistant cryptography experiments',
            house: 'key',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cryptography'],
            paths: [],
            components: {
                lab: 'houses/key/labs/key-pqc.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-cryptanalysis': {
            id: 'key-cryptanalysis',
            title: 'Cryptanalysis',
            description: 'Breaking ciphers and analyzing weaknesses',
            house: 'key',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cryptography'],
            paths: [],
            components: {
                presentation: 'houses/key/presentations/key-cryptanalysis.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-elliptic-curve': {
            id: 'key-elliptic-curve',
            title: 'Elliptic Curve Cryptography',
            description: 'ECC fundamentals and applications',
            house: 'key',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cryptography'],
            paths: [],
            components: {
                presentation: 'houses/key/presentations/key-elliptic-curve.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-key-derivation': {
            id: 'key-key-derivation',
            title: 'Key Derivation',
            description: 'KDFs, PBKDF2, Argon2, and key stretching',
            house: 'key',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cryptography'],
            paths: [],
            components: {
                presentation: 'houses/key/presentations/key-derivation.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-key-management': {
            id: 'key-key-management',
            title: 'Key Management',
            description: 'Key lifecycle, rotation, and best practices',
            house: 'key',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cryptography'],
            paths: [],
            components: {
                presentation: 'houses/key/presentations/key-management.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-message-auth': {
            id: 'key-message-auth',
            title: 'Message Authentication',
            description: 'MACs, HMAC, and message integrity',
            house: 'key',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cryptography'],
            paths: [],
            components: {
                presentation: 'houses/key/presentations/key-message-authentication.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-post-quantum': {
            id: 'key-post-quantum',
            title: 'Post-Quantum Cryptography',
            description: 'Quantum computing threats and PQC algorithms',
            house: 'key',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['cryptography'],
            paths: [],
            components: {
                presentation: 'houses/key/presentations/key-post-quantum.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-cert-quiz': {
            id: 'key-cert-quiz',
            title: 'Certificates Quiz',
            description: 'Test your PKI and certificate knowledge',
            house: 'key',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cryptography'],
            paths: [],
            components: {
                quiz: 'houses/key/quizzes/key-cert.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-cryptanalysis-quiz': {
            id: 'key-cryptanalysis-quiz',
            title: 'Cryptanalysis Quiz',
            description: 'Test your cipher breaking knowledge',
            house: 'key',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cryptography'],
            paths: [],
            components: {
                quiz: 'houses/key/quizzes/key-cryptanalysis.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-ecc-quiz': {
            id: 'key-ecc-quiz',
            title: 'ECC Quiz',
            description: 'Test your elliptic curve knowledge',
            house: 'key',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cryptography'],
            paths: [],
            components: {
                quiz: 'houses/key/quizzes/key-ecc.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-hsm-quiz': {
            id: 'key-hsm-quiz',
            title: 'HSM Quiz',
            description: 'Test your hardware security module knowledge',
            house: 'key',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cryptography'],
            paths: [],
            components: {
                quiz: 'houses/key/quizzes/key-hsm.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-kdf-quiz': {
            id: 'key-kdf-quiz',
            title: 'KDF Quiz',
            description: 'Test your key derivation knowledge',
            house: 'key',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cryptography'],
            paths: [],
            components: {
                quiz: 'houses/key/quizzes/key-kdf.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-mac-quiz': {
            id: 'key-mac-quiz',
            title: 'MAC Quiz',
            description: 'Test your message authentication knowledge',
            house: 'key',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cryptography'],
            paths: [],
            components: {
                quiz: 'houses/key/quizzes/key-mac.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-pqc-quiz': {
            id: 'key-pqc-quiz',
            title: 'PQC Quiz',
            description: 'Test your post-quantum cryptography knowledge',
            house: 'key',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cryptography'],
            paths: [],
            components: {
                quiz: 'houses/key/quizzes/key-pqc.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-symmetric-quiz': {
            id: 'key-symmetric-quiz',
            title: 'Symmetric Encryption Quiz',
            description: 'Test your symmetric crypto knowledge',
            house: 'key',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['cryptography', 'encryption'],
            paths: [],
            components: {
                quiz: 'houses/key/quizzes/key-symmetric.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-aes-explorer': {
            id: 'key-aes-explorer',
            title: 'AES Explorer',
            description: 'Interactive AES encryption visualization',
            house: 'key',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography'],
            paths: [],
            components: {
                applet: 'houses/key/tools/key-aes.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-cryptanalysis-tool': {
            id: 'key-cryptanalysis-tool',
            title: 'Cryptanalysis Lab Tool',
            description: 'Cipher analysis and breaking tools',
            house: 'key',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography'],
            paths: [],
            components: {
                applet: 'houses/key/tools/key-cryptanalysis.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-ecc-visualizer': {
            id: 'key-ecc-visualizer',
            title: 'ECC Visualizer',
            description: 'Elliptic curve visualization and calculations',
            house: 'key',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography'],
            paths: [],
            components: {
                applet: 'houses/key/tools/key-ecc.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-kdf-analyzer': {
            id: 'key-kdf-analyzer',
            title: 'KDF Analyzer',
            description: 'Key derivation function analysis tool',
            house: 'key',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography'],
            paths: [],
            components: {
                applet: 'houses/key/tools/key-kdf.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-lifecycle': {
            id: 'key-lifecycle',
            title: 'Key Lifecycle Manager',
            description: 'Key generation, storage, and rotation simulator',
            house: 'key',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography'],
            paths: [],
            components: {
                applet: 'houses/key/tools/key-lifecycle.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-pqc-explorer': {
            id: 'key-pqc-explorer',
            title: 'PQC Explorer',
            description: 'Post-quantum cryptography algorithm explorer',
            house: 'key',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['cryptography'],
            paths: [],
            components: {
                applet: 'houses/key/tools/key-pqc.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-hash-stego-intro': {
            id: 'key-hash-stego-intro',
            title: 'Hash & Steganography Intro',
            description: 'Introduction to hashing and steganography concepts',
            house: 'key',
            type: 'module',
            difficulty: 'beginner',
            duration: 30,
            topics: ['cryptography', 'hashing'],
            paths: [],
            components: {
                applet: 'houses/key/modules/key-hash-stego-intro.module.html'
            },
            prerequisites: [],
            objectives: []
        },
        'key-crypto-stego-lab': {
            id: 'key-crypto-stego-lab',
            title: 'Crypto & Steganography Lab',
            description: 'Hands-on cryptography and steganography exercises',
            house: 'key',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['cryptography'],
            paths: [],
            components: {
                lab: 'houses/key/labs/key-crypto-stego.lab.html'
            },
            prerequisites: [],
            objectives: []
        }
,

        // ─────────────────────────────────────────────────────────────
        // EYE HOUSE - 21 new entries
        // ─────────────────────────────────────────────────────────────
        'eye-wireshark-training': {
            id: 'eye-wireshark-training',
            title: 'Wireshark Training Lab',
            description: 'Master network protocol analysis with interactive filter practice and challenges',
            house: 'eye',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 45,
            topics: ['monitoring'],
            paths: [],
            components: {
                quiz: 'houses/eye/tools/eye-wireshark.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-packet-analyzer': {
            id: 'eye-packet-analyzer',
            title: 'Packet Analyzer',
            description: 'Interactive Wireshark-style packet analysis tool for security operations',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['monitoring'],
            paths: [],
            components: {
                applet: 'houses/eye/tools/eye-packet.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-traffic-lab': {
            id: 'eye-traffic-lab',
            title: 'Traffic Analysis Lab',
            description: 'Hands-on exercises analyzing real network traffic patterns',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['monitoring'],
            paths: [],
            components: {
                lab: 'houses/eye/labs/eye-traffic.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-siem-intro': {
            id: 'eye-siem-intro',
            title: 'SIEM Introduction',
            description: 'Understanding Security Information and Event Management systems',
            house: 'eye',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 35,
            topics: ['monitoring'],
            paths: [],
            components: {
                presentation: 'houses/eye/presentations/eye-siem-fundamentals.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-splunk-basics': {
            id: 'eye-splunk-basics',
            title: 'Splunk Fundamentals',
            description: 'Search Processing Language (SPL) and basic queries',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 65,
            topics: ['monitoring'],
            paths: [],
            components: {
                lab: 'houses/eye/tools/eye-siem.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-threat-hunting': {
            id: 'eye-threat-hunting',
            title: 'Threat Hunting',
            description: 'Proactive search for threats in your environment',
            house: 'eye',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 35,
            topics: ['monitoring'],
            paths: [],
            components: {
                quiz: 'houses/eye/presentations/eye-threat-hunting.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-incident-timeline': {
            id: 'eye-incident-timeline',
            title: 'Incident Timeline',
            description: 'Constructing chronological event sequences for investigations',
            house: 'eye',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 35,
            topics: ['monitoring'],
            paths: [],
            components: {
                presentation: 'houses/eye/labs/eye-correlation.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-hunting-lab': {
            id: 'eye-hunting-lab',
            title: 'Threat Hunting Lab',
            description: 'Hands-on practice with proactive threat hunting techniques',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['monitoring'],
            paths: [],
            components: {
                lab: 'houses/eye/labs/eye-hunting.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-siem-lab': {
            id: 'eye-siem-lab',
            title: 'SIEM Lab',
            description: 'Practical exercises with SIEM platforms and log correlation',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['monitoring'],
            paths: [],
            components: {
                lab: 'houses/eye/labs/eye-siem.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-soc-lab': {
            id: 'eye-soc-lab',
            title: 'SOC Operations Lab',
            description: 'Security Operations Center workflow simulation',
            house: 'eye',
            type: 'lab',
            difficulty: 'beginner',
            duration: 45,
            topics: ['monitoring'],
            paths: [],
            components: {
                lab: 'houses/eye/labs/eye-soc.lab.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-log-correlation': {
            id: 'eye-log-correlation',
            title: 'Log Correlation',
            description: 'Connecting events across multiple log sources',
            house: 'eye',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['monitoring'],
            paths: [],
            components: {
                presentation: 'houses/eye/presentations/eye-log-correlation.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-network-traffic': {
            id: 'eye-network-traffic',
            title: 'Network Traffic Analysis',
            description: 'Deep dive into network traffic patterns and anomaly detection',
            house: 'eye',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['monitoring', 'networking'],
            paths: [],
            components: {
                presentation: 'houses/eye/presentations/eye-network-traffic-analysis.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-soc-operations': {
            id: 'eye-soc-operations',
            title: 'SOC Operations',
            description: 'Security Operations Center procedures and best practices',
            house: 'eye',
            type: 'presentation',
            difficulty: 'beginner',
            duration: 25,
            topics: ['monitoring'],
            paths: [],
            components: {
                presentation: 'houses/eye/presentations/eye-soc-operations.presentation.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-correlation-quiz': {
            id: 'eye-correlation-quiz',
            title: 'Correlation Quiz',
            description: 'Test your log correlation and event analysis skills',
            house: 'eye',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['monitoring'],
            paths: [],
            components: {
                quiz: 'houses/eye/quizzes/eye-correlation.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-hunting-quiz': {
            id: 'eye-hunting-quiz',
            title: 'Threat Hunting Quiz',
            description: 'Assess your threat hunting knowledge',
            house: 'eye',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['monitoring'],
            paths: [],
            components: {
                quiz: 'houses/eye/quizzes/eye-hunting.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-siem-quiz': {
            id: 'eye-siem-quiz',
            title: 'SIEM Quiz',
            description: 'Test your SIEM concepts and query skills',
            house: 'eye',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['monitoring'],
            paths: [],
            components: {
                quiz: 'houses/eye/quizzes/eye-siem.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-soc-quiz': {
            id: 'eye-soc-quiz',
            title: 'SOC Operations Quiz',
            description: 'Evaluate your SOC workflow knowledge',
            house: 'eye',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['monitoring'],
            paths: [],
            components: {
                quiz: 'houses/eye/quizzes/eye-soc.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-traffic-quiz': {
            id: 'eye-traffic-quiz',
            title: 'Traffic Analysis Quiz',
            description: 'Test your network traffic analysis skills',
            house: 'eye',
            type: 'quiz',
            difficulty: 'beginner',
            duration: 15,
            topics: ['monitoring'],
            paths: [],
            components: {
                quiz: 'houses/eye/quizzes/eye-traffic.quiz.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-correlation-engine': {
            id: 'eye-correlation-engine',
            title: 'Correlation Engine',
            description: 'Interactive tool for building correlation rules',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['monitoring'],
            paths: [],
            components: {
                applet: 'houses/eye/tools/eye-correlation.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-hunt-workbench': {
            id: 'eye-hunt-workbench',
            title: 'Hunt Workbench',
            description: 'Threat hunting workspace with hypothesis tracking',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['monitoring'],
            paths: [],
            components: {
                applet: 'houses/eye/tools/eye-hunt.tool.html'
            },
            prerequisites: [],
            objectives: []
        },
        'eye-soc-simulator': {
            id: 'eye-soc-simulator',
            title: 'SOC Simulator',
            description: 'Simulate Security Operations Center workflows and triage',
            house: 'eye',
            type: 'applet',
            difficulty: 'beginner',
            duration: 20,
            topics: ['monitoring'],
            paths: [],
            components: {
                applet: 'houses/eye/tools/eye-soc.tool.html'
            },
            prerequisites: [],
            objectives: []
        }

};

module.exports = MIGRATED_ENTRIES;
