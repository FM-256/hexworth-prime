/* ============================================================
   PIS-L10: Dual-Integrity Access
   Principles of Information Security -- CTF Lab
   Authentication system: LDAP directory, MFA enrollment,
   RBAC for BSL-1 through BSL-4 with two-person integrity
   SY0-701: 5.3, 5.4
   ============================================================ */

const PISL10Config = {

    // =========================================================
    // BOX METADATA
    // =========================================================

    title: 'Dual-Integrity Access',
    subtitle: 'Hexworth Containment -- Authentication System Build',
    description: 'Build the complete authentication and access control system for Hexworth Containment. Configure the LDAP directory with the correct OU structure, enroll all personnel in MFA, and implement RBAC policies for BSL-1 through BSL-4. BSL-4 requires two-person integrity -- no single analyst can access it alone.',
    difficulty: 'Hard',
    estimatedTime: 45,
    accent: '#06b6d4',
    storageKey: 'hexworth_lab_pis_l10',
    registryId: 'pis-l10-dual-integrity-access',
    trackerKey: 'lab_pis_l10',

    // =========================================================
    // BOOT SEQUENCE
    // =========================================================

    boot: {
        biosLines: [
            'HEXWORTH CONTAINMENT WORKSTATION v4.2.1',
            'Identity and Access Management Terminal -- BSL-4 Clearance',
            'OpenLDAP 2.6 (simulated): LOADED',
            'TOTP/MFA server: ONLINE',
            'RBAC policy engine: INITIALIZED',
            'WARNING: IAM system not configured -- all clearance gates OPEN'
        ],
        grubEntries: [
            'Containment Analyst OS 22.04 LTS',
            'Containment Analyst OS (recovery mode)'
        ],
        loginUser: 'iam-admin'
    },

    // =========================================================
    // LORE
    // =========================================================

    lore: {
        intro: 'The facility\'s identity and access management system was wiped during the recent security incident. The clearance gate database is empty. Every door in the facility is currently open to anyone with a network connection. Before the morning shift begins, you need to rebuild the entire IAM system from scratch: LDAP directory, MFA enrollment, and role-based access control for all four biosafety levels. BSL-4 has a special requirement: two-person integrity. No analyst can enter alone.',
        scenario: 'Build in three phases. First: configure the LDAP directory with the correct organizational unit structure (BSL-1 through BSL-4 clearance groups, plus admin). Second: enroll all 12 facility personnel in MFA using TOTP. Third: implement RBAC policies -- each BSL level has specific permissions, and BSL-4 requires the dual-integrity flag. Test each phase before moving to the next.',
        outro: 'IAM system fully operational. LDAP directory configured with correct OU hierarchy. All 12 personnel enrolled in MFA. RBAC policies in place for BSL-1 through BSL-4. Dual-integrity gate enforced at BSL-4 -- access attempt from single analyst correctly rejected. Hexworth Containment clearance gates are now active and enforcing minimum clearance protocol.',

        goals: [
            "Build an LDAP directory with the correct OU structure mapping BSL clearance levels to access groups",
            "Enroll all 12 facility personnel in TOTP-based multi-factor authentication",
            "Implement RBAC policies that grant least-privilege access tied to BSL level and job role",
            "Enforce two-person integrity at BSL-4: no single analyst can enter alone, regardless of clearance",
            "Practice phased build-and-verify: each phase (LDAP → MFA → RBAC) tested before the next layer is added"
        ],

        toolkit: [
            { name: "ldap-admin", purpose: "Configure LDAP directory: OUs, users, group memberships", sample: "ldap-admin add-ou bsl-4" },
            { name: "mfa-enroll", purpose: "Enroll a user in TOTP MFA -- generates secret + QR code", sample: "mfa-enroll dr-mira" },
            { name: "rbac-policy", purpose: "Define a role-based access policy mapping BSL levels to permissions", sample: "rbac-policy add bsl-4 enter --require-dual" },
            { name: "access-test", purpose: "Simulate a user attempting access -- verifies LDAP + MFA + RBAC together", sample: "access-test dr-mira bsl-4" },
            { name: "verify-dual-integrity", purpose: "Confirm BSL-4 enforces two-person integrity (single-user attempts denied)", sample: "verify-dual-integrity" },
            { name: "help", purpose: "Command reference", sample: "help" }
        ]
    },

    // =========================================================
    // TERMINAL CONFIG
    // =========================================================

    terminal: {
        user: 'iam-admin',
        hostname: 'iam-ws-01',
        startDir: '/home/iam-admin',
        welcome: 'Hexworth Containment -- IAM Administration Terminal\nBSL-4 Clearance Active\n\n*** WARNING: IAM SYSTEM NOT CONFIGURED ***\n  LDAP directory: EMPTY\n  MFA enrollment:  0/12 personnel\n  RBAC policies:  NONE ACTIVE\n  BSL-4 gate:     OPEN (critical)\n\nBuild sequence:\n  Phase 1: ldap-admin  Configure LDAP directory\n  Phase 2: mfa-enroll  Enroll all personnel in MFA\n  Phase 3: rbac-policy Define access control policies\n  Phase 4: access-test Verify access controls work\n  Phase 5: verify-dual-integrity  Test BSL-4 two-person gate\n\nType "help" for command reference.\nType "ldap-admin status" to see directory state.\n'
    },

    // =========================================================
    // DESKTOP ICONS
    // =========================================================

    desktop: {
        icons: [
            { id: 'briefing', label: 'Briefing',    icon: '\uD83D\uDCCB',    app: 'briefing' },
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'notes',    label: 'Notes',       icon: '\uD83D\uDCDD',    app: 'notes'    },
            { id: 'hints',    label: 'Hints',       icon: '\uD83D\uDCA1',    app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9',    app: 'flags'    }
        ]
    },

    // Custom desktop-icon dispatch \u2014 invoked by BoxEngine's `default:` extension
    // hook (BoxEngine.js:1110-1115) for any icon whose `app` is not built-in.
    onAppLaunch: function(iconDef, engine) {
        if (iconDef && iconDef.app === 'briefing') {
            // Re-summon \u2014 bypass skip-next-time storage; lab is already running
            // so the launch callback is a no-op.
            BriefingPage.show(this, function() {}, { force: true });
        }
    },

    // =========================================================
    // SIMULATED FILESYSTEM
    // =========================================================

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'iam-admin': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: 'IAM BUILD NOTES -- HEXWORTH CONTAINMENT\n========================================\n\nPHASE 1: LDAP DIRECTORY\n  Base DN: dc=hexworth,dc=internal\n  Required OUs:\n    ou=bsl1-analysts,dc=hexworth,dc=internal\n    ou=bsl2-analysts,dc=hexworth,dc=internal\n    ou=bsl3-analysts,dc=hexworth,dc=internal\n    ou=bsl4-analysts,dc=hexworth,dc=internal\n    ou=admins,dc=hexworth,dc=internal\n  Commands:\n    ldap-admin create-ou <ou-name>      Create an organizational unit\n    ldap-admin add-user <user> <ou>     Add user to an OU\n    ldap-admin status                   Show directory state\n\nFACILITY PERSONNEL (12 total):\n  BSL-1 clearance:  analyst-01, analyst-02, analyst-03\n  BSL-2 clearance:  analyst-04, analyst-05, analyst-06\n  BSL-3 clearance:  analyst-07, analyst-08, analyst-09\n  BSL-4 clearance:  analyst-10, analyst-11\n  Admins:           admin-01\n\nPHASE 2: MFA ENROLLMENT\n  All 12 personnel must be enrolled in TOTP MFA.\n  Command: mfa-enroll <username>\n  Or bulk: mfa-enroll --all\n\nPHASE 3: RBAC POLICIES\n  BSL-1: read access to lab1 resources only\n  BSL-2: read/write access to lab1 and lab2 resources\n  BSL-3: full access to labs 1, 2, 3\n  BSL-4: full access to all labs + special pathogen vault\n    REQUIREMENT: BSL-4 access requires two simultaneous authenticated users\n  Command: rbac-policy <role> <permissions> [--dual-integrity]\n\nPHASE 4-5: TESTING\n  access-test <user> <resource>       Test access for a user\n  verify-dual-integrity               Confirm BSL-4 requires 2-person auth\n'
                                },
                                'personnel.txt': {
                                    type: 'file',
                                    content: 'HEXWORTH CONTAINMENT -- PERSONNEL REGISTRY\n\nBSL-1 ANALYSTS (Lab 1 access only):\n  analyst-01  Dr. Chen Wei          Research Analyst I\n  analyst-02  Dr. Maria Santos      Research Analyst I\n  analyst-03  James Okafor          Lab Technician\n\nBSL-2 ANALYSTS (Labs 1-2 access):\n  analyst-04  Dr. Priya Patel       Research Analyst II\n  analyst-05  Dr. Tobias Müller     Research Analyst II\n  analyst-06  Dr. Yuki Tanaka       Containment Specialist\n\nBSL-3 ANALYSTS (Labs 1-3 access):\n  analyst-07  Dr. Keisha Williams   Senior Researcher\n  analyst-08  Dr. Ivan Petrov       Pathogen Containment Specialist\n  analyst-09  Dr. Leila Ahmadi      Senior Analyst\n\nBSL-4 ANALYSTS (All labs -- two-person integrity required):\n  analyst-10  Dr. Samuel Osei       Principal Researcher\n  analyst-11  Dr. Elena Vasquez     Director of Containment\n\nADMINISTRATORS:\n  admin-01    Facility Administrator  Full system access\n'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ldap-admin status\ncat personnel.txt\n'
                                }
                            }
                        }
                    }
                }
            }
        }
    },

    // =========================================================
    // INTERNAL STATE
    // =========================================================

    _state: {
        ldapOUs: {},            // ou-name -> true (plain object as set)
        ldapUsers: {},          // username -> { ou, clearance }
        mfaEnrolled: {},        // username -> true (plain object as set)
        rbacPolicies: {},       // role -> { permissions, dualIntegrity }
        accessTests: []
    },

    // All personnel that must be enrolled
    _allPersonnel: ['analyst-01','analyst-02','analyst-03','analyst-04','analyst-05','analyst-06','analyst-07','analyst-08','analyst-09','analyst-10','analyst-11','admin-01'],

    // Expected OU structure
    _requiredOUs: ['bsl1-analysts', 'bsl2-analysts', 'bsl3-analysts', 'bsl4-analysts', 'admins'],

    // Personnel to OU mapping
    _personnelMap: {
        'analyst-01': 'bsl1-analysts', 'analyst-02': 'bsl1-analysts', 'analyst-03': 'bsl1-analysts',
        'analyst-04': 'bsl2-analysts', 'analyst-05': 'bsl2-analysts', 'analyst-06': 'bsl2-analysts',
        'analyst-07': 'bsl3-analysts', 'analyst-08': 'bsl3-analysts', 'analyst-09': 'bsl3-analysts',
        'analyst-10': 'bsl4-analysts', 'analyst-11': 'bsl4-analysts',
        'admin-01':   'admins'
    },

    _flag1Awarded: false,
    _flag2Awarded: false,
    _flag3Awarded: false,

    // =========================================================
    // TERMINAL COMMANDS
    // =========================================================

    commands: {

        // ldap-admin -- manage the LDAP directory
        'ldap-admin': function(args, term, engine) {
            const sub = args[0];

            // -- status --
            if (sub === 'status' || !sub) {
                const ouCount   = Object.keys(engine.config._state.ldapOUs).length;
                const userCount = Object.keys(engine.config._state.ldapUsers).length;
                const ouList    = Object.keys(engine.config._state.ldapOUs);
                return `LDAP DIRECTORY STATUS -- dc=hexworth,dc=internal\n${'='.repeat(50)}\nOUs configured: ${ouCount}/5\nUsers added:    ${userCount}/12\nRequired OUs:   ${engine.config._requiredOUs.join(', ')}\n\nCurrent OUs: ${ouCount > 0 ? ouList.join(', ') : '(none)'}\nUsers placed: ${userCount > 0 ? Object.keys(engine.config._state.ldapUsers).join(', ') : '(none)'}\n\nUse: ldap-admin create-ou <ou-name>\nUse: ldap-admin add-user <username> <ou-name>\nSee ~/notes.txt for required structure.`;
            }

            // -- create-ou --
            if (sub === 'create-ou') {
                const ouName = args[1];
                if (!ouName) return 'Usage: ldap-admin create-ou <ou-name>\nExample: ldap-admin create-ou bsl1-analysts';

                if (!engine.config._requiredOUs.includes(ouName)) {
                    return `Error: "${ouName}" is not a required OU.\nRequired OUs: ${engine.config._requiredOUs.join(', ')}`;
                }

                if (engine.config._state.ldapOUs[ouName]) {
                    return `Error: OU "${ouName}" already exists.`;
                }

                engine.config._state.ldapOUs[ouName] = true;
                const count = Object.keys(engine.config._state.ldapOUs).length;
                let output = `OU created: ou=${ouName},dc=hexworth,dc=internal\nOUs configured: ${count}/5`;

                // Check flag1 condition
                const allOUsCreated = engine.config._requiredOUs.every(ou => engine.config._state.ldapOUs[ou]);
                const allUsersPlaced = Object.keys(engine.config._state.ldapUsers).length >= 12;
                if (allOUsCreated && allUsersPlaced && !engine.config._flag1Awarded) {
                    engine.config._flag1Awarded = true;
                    engine.awardFlag('flag1');
                    output += '\n\n[IAM MILESTONE] LDAP directory configured with correct OU structure and all personnel. Flag unlocked.';
                }

                return output;
            }

            // -- add-user --
            if (sub === 'add-user') {
                const username = args[1];
                const ouName   = args[2];

                if (!username || !ouName) {
                    return 'Usage: ldap-admin add-user <username> <ou-name>\nExample: ldap-admin add-user analyst-01 bsl1-analysts\nSee ~/personnel.txt for the full personnel list.';
                }

                if (!engine.config._allPersonnel.includes(username)) {
                    return `Error: "${username}" is not in the facility personnel registry.\nSee ~/personnel.txt for valid usernames.`;
                }

                if (!engine.config._state.ldapOUs[ouName]) {
                    return `Error: OU "${ouName}" does not exist.\nCreate it first: ldap-admin create-ou ${ouName}`;
                }

                const correctOU = engine.config._personnelMap[username];
                if (ouName !== correctOU) {
                    return `Error: ${username} does not belong in "${ouName}".\nCheck ~/notes.txt for the correct OU assignments.\nHint: BSL-1 analysts go in bsl1-analysts, etc.`;
                }

                if (engine.config._state.ldapUsers[username]) {
                    return `Error: ${username} is already in the directory (ou=${engine.config._state.ldapUsers[username].ou}).`;
                }

                // Derive clearance level from OU name
                const clearanceMap = {
                    'bsl1-analysts': 1, 'bsl2-analysts': 2,
                    'bsl3-analysts': 3, 'bsl4-analysts': 4, 'admins': 4
                };
                engine.config._state.ldapUsers[username] = { ou: ouName, clearance: clearanceMap[ouName] || 1 };

                const userCount = Object.keys(engine.config._state.ldapUsers).length;
                let output = `User added: cn=${username},ou=${ouName},dc=hexworth,dc=internal\nUsers in directory: ${userCount}/12`;

                const allOUsCreated = engine.config._requiredOUs.every(ou => engine.config._state.ldapOUs[ou]);
                if (allOUsCreated && userCount >= 12 && !engine.config._flag1Awarded) {
                    engine.config._flag1Awarded = true;
                    engine.awardFlag('flag1');
                    output += '\n\n[IAM MILESTONE] LDAP directory configured with correct OU structure and all 12 personnel. Flag unlocked.';
                }

                return output;
            }

            return 'Usage: ldap-admin <status|create-ou|add-user>\nSee ~/notes.txt for details.';
        },

        // mfa-enroll -- enroll personnel in TOTP MFA
        'mfa-enroll': function(args, term, engine) {
            const target = args[0];

            if (!target) {
                return 'Usage:\n  mfa-enroll <username>    Enroll one person\n  mfa-enroll --all         Enroll all facility personnel\nExample: mfa-enroll analyst-01';
            }

            if (target === '--all') {
                // Enroll everyone
                const notYetEnrolled = engine.config._allPersonnel.filter(u => !engine.config._state.mfaEnrolled[u]);
                if (notYetEnrolled.length === 0) {
                    return 'All 12 personnel are already enrolled in MFA.';
                }

                notYetEnrolled.forEach(u => { engine.config._state.mfaEnrolled[u] = true; });
                const enrolledCount = Object.keys(engine.config._state.mfaEnrolled).length;

                let output = `BULK MFA ENROLLMENT COMPLETE\n${'='.repeat(45)}\nEnrolled: ${notYetEnrolled.join(', ')}\n\nTotal enrolled: ${enrolledCount}/12\nMFA type: TOTP (Time-based One-Time Password, RFC 6238)\nTokens sent to registered devices via secure channel.\n`;

                if (enrolledCount >= 12 && !engine.config._flag2Awarded) {
                    engine.config._flag2Awarded = true;
                    engine.awardFlag('flag2');
                    output += '\n[MFA MILESTONE] All 12 personnel enrolled in TOTP MFA. Flag unlocked.';
                }

                return output;
            }

            if (!engine.config._allPersonnel.includes(target)) {
                return `Error: "${target}" not in personnel registry.\nSee ~/personnel.txt for valid usernames.\nOr use: mfa-enroll --all`;
            }

            if (engine.config._state.mfaEnrolled[target]) {
                return `${target} is already enrolled in MFA.\nEnrolled: ${Object.keys(engine.config._state.mfaEnrolled).length}/12`;
            }

            engine.config._state.mfaEnrolled[target] = true;
            const enrolledCount = Object.keys(engine.config._state.mfaEnrolled).length;

            let output = `MFA ENROLLMENT: ${target}\n  Method:  TOTP (Google Authenticator compatible)\n  Secret:  [32-char base32 -- sent to registered device]\n  QR code: Provisioned to ${target}@hexworth.internal\n  Backup codes: 8 codes generated, sealed in Director safe\n\nEnrolled: ${enrolledCount}/12`;

            if (enrolledCount >= 12 && !engine.config._flag2Awarded) {
                engine.config._flag2Awarded = true;
                engine.awardFlag('flag2');
                output += '\n\n[MFA MILESTONE] All 12 personnel enrolled in TOTP MFA. Flag unlocked.';
            }

            return output;
        },

        // rbac-policy -- define role-based access control policies
        'rbac-policy': function(args, term, engine) {
            const role        = args[0];
            const permissions = args[1];
            const dualFlag    = args.includes('--dual-integrity');

            if (!role || !permissions) {
                return 'Usage: rbac-policy <role> <permissions> [--dual-integrity]\nRoles: bsl1-role, bsl2-role, bsl3-role, bsl4-role, admin-role\nPermissions: read, read-write, full-access\nExample: rbac-policy bsl1-role read\nExample: rbac-policy bsl4-role full-access --dual-integrity';
            }

            const validRoles = ['bsl1-role', 'bsl2-role', 'bsl3-role', 'bsl4-role', 'admin-role'];
            const validPerms = ['read', 'read-write', 'full-access'];

            if (!validRoles.includes(role)) {
                return `Error: "${role}" is not a valid role.\nValid roles: ${validRoles.join(', ')}`;
            }

            if (!validPerms.includes(permissions)) {
                return `Error: "${permissions}" is not a valid permission set.\nValid: ${validPerms.join(', ')}`;
            }

            engine.config._state.rbacPolicies[role] = { permissions, dualIntegrity: dualFlag };

            const policyCount = Object.keys(engine.config._state.rbacPolicies).length;

            let output = `RBAC POLICY CREATED: ${role}\n  Permissions: ${permissions}\n  Dual-integrity required: ${dualFlag ? 'YES (two-person authentication)' : 'NO'}\n  Assigned to: ou=${role.replace('-role', '-analysts')},dc=hexworth,dc=internal\n\nActive policies: ${policyCount}/5`;

            // Check flag3: all 5 policies created, bsl4 has dual-integrity
            const allPoliciesSet = validRoles.every(r => engine.config._state.rbacPolicies[r]);
            const bsl4HasDualIntegrity = engine.config._state.rbacPolicies['bsl4-role'] &&
                                         engine.config._state.rbacPolicies['bsl4-role'].dualIntegrity;

            if (allPoliciesSet && bsl4HasDualIntegrity && !engine.config._flag3Awarded) {
                // Also require LDAP and MFA to be done
                if (engine.config._flag1Awarded && engine.config._flag2Awarded) {
                    engine.config._flag3Awarded = true;
                    engine.awardFlag('flag3');
                    output += '\n\n[ACCESS CONTROL MILESTONE] All RBAC policies active. BSL-4 dual-integrity enforced. Flag unlocked.\nRun verify-dual-integrity to test the two-person gate.';
                } else {
                    output += '\n\nAll policies set. Complete LDAP and MFA phases to unlock this flag.';
                }
            }

            return output;
        },

        // access-test -- test what a user can access
        'access-test': function(args, term, engine) {
            const username = args[0];
            const resource = args[1];

            if (!username || !resource) {
                return 'Usage: access-test <username> <resource>\nResources: lab1, lab2, lab3, lab4, lab4-vault, admin-console\nExample: access-test analyst-04 lab2';
            }

            if (!engine.config._allPersonnel.includes(username)) {
                return `Error: "${username}" not in personnel registry.`;
            }

            const userEntry = engine.config._state.ldapUsers[username];
            if (!userEntry) {
                return `Error: ${username} not in LDAP directory.\nAdd with: ldap-admin add-user ${username} <ou-name>`;
            }

            if (!engine.config._state.mfaEnrolled[username]) {
                return `Error: ${username} not enrolled in MFA.\nEnroll with: mfa-enroll ${username}`;
            }

            const clearance = userEntry.clearance;
            const roleKey   = userEntry.ou === 'admins' ? 'admin-role' : `bsl${clearance}-role`;
            const policy    = engine.config._state.rbacPolicies[roleKey];

            if (!policy) {
                return `No RBAC policy defined for ${roleKey}.\nCreate with: rbac-policy ${roleKey} <permissions>`;
            }

            const resourceLevels = { 'lab1': 1, 'lab2': 2, 'lab3': 3, 'lab4': 4, 'lab4-vault': 4, 'admin-console': 4 };
            const requiredLevel  = resourceLevels[resource];

            if (requiredLevel === undefined) {
                return `Unknown resource "${resource}".\nValid: lab1, lab2, lab3, lab4, lab4-vault, admin-console`;
            }

            // Admins have full access
            if (userEntry.ou === 'admins') {
                return `ACCESS TEST: ${username} --> ${resource}\n\n  User clearance: ADMIN\n  Resource level: BSL-${requiredLevel}\n  MFA status:     ENROLLED\n  RBAC policy:    admin-role (full-access)\n\n  RESULT: ACCESS GRANTED\n  Note: Dual-integrity not required for admin console access.`;
            }

            if (clearance < requiredLevel) {
                return `ACCESS TEST: ${username} --> ${resource}\n\n  User clearance: BSL-${clearance}\n  Resource level: BSL-${requiredLevel} required\n  MFA status:     ENROLLED\n  RBAC policy:    ${roleKey} (${policy.permissions})\n\n  RESULT: ACCESS DENIED -- Insufficient clearance\n  Minimum clearance for ${resource}: BSL-${requiredLevel}`;
            }

            if (resource === 'lab4' || resource === 'lab4-vault') {
                if (policy.dualIntegrity) {
                    return `ACCESS TEST: ${username} --> ${resource}\n\n  User clearance: BSL-${clearance}\n  Resource level: BSL-4\n  MFA status:     ENROLLED\n  RBAC policy:    bsl4-role (${policy.permissions})\n  Dual-integrity: REQUIRED\n\n  RESULT: PENDING -- Dual-integrity check needed\n  ${username} is authorized for BSL-4 individually, but access requires\n  a second BSL-4 analyst to authenticate simultaneously.\n  This is by design. Run verify-dual-integrity to test the two-person gate.`;
                }
            }

            return `ACCESS TEST: ${username} --> ${resource}\n\n  User clearance: BSL-${clearance}\n  Resource level: BSL-${requiredLevel}\n  MFA status:     ENROLLED\n  RBAC policy:    ${roleKey} (${policy.permissions})\n\n  RESULT: ACCESS GRANTED`;
        },

        // verify-dual-integrity -- test that BSL-4 requires two-person authentication
        'verify-dual-integrity': function(args, term, engine) {
            const bsl4Policy = engine.config._state.rbacPolicies['bsl4-role'];

            if (!bsl4Policy) {
                return 'Error: No RBAC policy for bsl4-role.\nCreate with: rbac-policy bsl4-role full-access --dual-integrity';
            }

            if (!bsl4Policy.dualIntegrity) {
                return 'DUAL-INTEGRITY VERIFICATION -- FAILED\n\nThe bsl4-role policy does not have --dual-integrity enabled.\nBSL-4 access MUST require two-person authentication per containment directive.\n\nRe-create the policy:\n  rbac-policy bsl4-role full-access --dual-integrity';
            }

            if (!engine.config._flag1Awarded || !engine.config._flag2Awarded) {
                return 'DUAL-INTEGRITY VERIFICATION -- BLOCKED\nComplete LDAP directory setup and MFA enrollment before testing access controls.';
            }

            let output = `DUAL-INTEGRITY ACCESS TEST -- BSL-4 PATHOGEN VAULT\n${'='.repeat(60)}\n\nTest 1: Single analyst access attempt\n  Initiator: analyst-10 (Dr. Samuel Osei, BSL-4)\n  Resource:  lab4-vault\n  MFA token: VALID\n  Clearance: BSL-4\n\n  Checking dual-integrity requirement...\n  Policy: bsl4-role requires two authenticated users simultaneously\n  Second authenticator: NONE PRESENT\n\n  RESULT: ACCESS DENIED\n  "BSL-4 access requires two authorized personnel.\n   Initiating dual-integrity challenge. Please have a second\n   BSL-4 analyst authenticate within 60 seconds."\n\nTest 2: Two-person simultaneous authentication\n  Analyst 1: analyst-10 (Dr. Samuel Osei, BSL-4)    MFA: VALID\n  Analyst 2: analyst-11 (Dr. Elena Vasquez, BSL-4)   MFA: VALID\n  Both present: YES\n  Time window: 12 seconds (within 60s requirement)\n\n  Checking dual-integrity requirement...\n  Two authenticated BSL-4 analysts confirmed simultaneously.\n\n  RESULT: ACCESS GRANTED\n  "Dual-integrity satisfied. Both analysts authenticated.\n   BSL-4 vault access logged: INC-2026-0409-ACCESS-001\n   Session time limit: 30 minutes. Alert if either analyst leaves."\n\nTest 3: Unauthorized clearance attempt\n  Analyst:  analyst-07 (BSL-3, with analyst-08 BSL-3)\n  Resource: lab4-vault\n  Both present: YES but BSL-3 clearance\n\n  RESULT: ACCESS DENIED\n  "Dual-integrity satisfied but clearance insufficient.\n   BSL-4 vault requires BSL-4 clearance regardless of headcount."\n\nDUAL-INTEGRITY SUMMARY:\n  Single BSL-4 user:         DENIED (correct behavior)\n  Two BSL-4 users together:  GRANTED (correct behavior)\n  Two BSL-3 users together:  DENIED (correct behavior)\n  Policy is working as intended.\n`;

            if (!engine.config._flag3Awarded) {
                engine.config._flag3Awarded = true;
                engine.awardFlag('flag3');
                output += '\n[ACCESS CONTROL MILESTONE] RBAC policies with dual-integrity for BSL-4 verified. Flag unlocked.';
            }

            return output;
        },

        // help -- command reference
        'help': function(args, term, engine) {
            return 'IAM ADMIN TERMINAL -- COMMAND REFERENCE\n\n  ldap-admin status                     Show LDAP directory state\n  ldap-admin create-ou <ou-name>        Create organizational unit\n  ldap-admin add-user <user> <ou>       Add user to OU\n  mfa-enroll <username>                 Enroll user in TOTP MFA\n  mfa-enroll --all                      Enroll all 12 personnel\n  rbac-policy <role> <perms> [--dual-integrity]  Set access policy\n  access-test <user> <resource>         Test user access\n  verify-dual-integrity                 Test BSL-4 two-person gate\n  cat <file>                            Read a file\n  ls <path>                             List directory\n\nRoles: bsl1-role, bsl2-role, bsl3-role, bsl4-role, admin-role\nPermissions: read, read-write, full-access\nResources: lab1, lab2, lab3, lab4, lab4-vault, admin-console\n\nSee ~/notes.txt and ~/personnel.txt for full reference.';
        }
    },

    // =========================================================
    // FLAGS
    // =========================================================

    flags: [
        {
            id: 'flag1',
            value: 'FLAG{pis-l10-dual-integrity-access_flag1_ldap_directory_confi}',
            label: 'LDAP Directory Configured',
            description: 'Created correct OU structure and added all 12 personnel to the LDAP directory.',
            points: 250,
            autoCheck: true
        },
        {
            id: 'flag2',
            value: 'FLAG{pis-l10-dual-integrity-access_flag2_mfa_enrolled_for_all}',
            label: 'MFA Enrolled for All Personnel',
            description: 'Enrolled all 12 facility personnel in TOTP multi-factor authentication.',
            points: 250,
            autoCheck: true
        },
        {
            id: 'flag3',
            value: 'FLAG{pis-l10-dual-integrity-access_flag3_rbac_with_bsl-4_dual}',
            label: 'RBAC with BSL-4 Dual-Integrity',
            description: 'Implemented RBAC policies for all BSL levels with two-person integrity enforced at BSL-4.',
            points: 250,
            autoCheck: true
        }
    ],

    // =========================================================
    // SCORING
    // =========================================================

    scoring: {
        base: 1000,
        minScore: 0,
        maxScore: 750,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 },
        timeBonusThreshold: 2700
    },

    // =========================================================
    // HINTS
    // =========================================================

    hints: [
        {
            id: 'hint1',
            text: 'Start with "ldap-admin status" to see the current state. Create the 5 required OUs first (bsl1-analysts, bsl2-analysts, bsl3-analysts, bsl4-analysts, admins). Then add users with "ldap-admin add-user". Check ~/notes.txt for which analyst goes in which OU.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint2',
            text: 'For MFA, you can enroll everyone at once with "mfa-enroll --all" instead of enrolling one by one. This saves time and is perfectly valid -- bulk enrollment is common in enterprise IAM deployments.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'For RBAC, create a policy for each of the 5 roles. BSL-4 specifically needs the --dual-integrity flag: "rbac-policy bsl4-role full-access --dual-integrity". Once all policies are active and LDAP and MFA are complete, run verify-dual-integrity to test the two-person gate.',
            cost: 50,
            penalty: -50
        }
    ],

    // =========================================================
    // CERT OBJECTIVES
    // =========================================================

    certObjectives: {
        certPath: 'CompTIA Security+ SY0-701',
        mappings: [
            { flagId: 'flag1', objective: '5.4', description: 'Summarize elements of effective security governance', skill: 'LDAP directory services: organizational unit design, user provisioning, and directory-based identity management' },
            { flagId: 'flag2', objective: '5.3', description: 'Compare and contrast authentication and authorization', skill: 'Multi-factor authentication implementation: TOTP enrollment, backup codes, and authentication factor principles' },
            { flagId: 'flag3', objective: '5.4', description: 'Summarize elements of effective security governance', skill: 'Role-based access control: policy design, least privilege, and two-person integrity for high-security access' }
        ]
    }

};
