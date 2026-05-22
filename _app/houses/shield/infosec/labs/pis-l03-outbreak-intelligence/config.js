/* ============================================================
   PIS-L03: Outbreak Intelligence
   Principles of Information Security -- CTF Lab
   OSINT threat profiling: CVE, MITRE ATT&CK, containment
   SY0-701: 2.2, 2.5
   ============================================================ */

const PISL03Config = {

    // =========================================================
    // BOX METADATA
    // =========================================================

    title: 'Outbreak Intelligence',
    subtitle: 'Hexworth Containment -- Outbreak Intelligence Feed',
    description: 'A new pathogen has been detected in the wild. Use the facility OSINT toolkit -- CVE database, MITRE ATT&CK framework, and live threat feeds -- to build a complete threat profile, then recommend containment measures.',
    difficulty: 'Intermediate',
    estimatedTime: 45,
    accent: '#a855f7',
    storageKey: 'hexworth_lab_pis_l03',
    registryId: 'pis-l03-outbreak-intelligence',
    trackerKey: 'lab_pis_l03',

    // =========================================================
    // BOOT SEQUENCE
    // =========================================================

    boot: {
        biosLines: [
            'HEXWORTH CONTAINMENT WORKSTATION v4.2.1',
            'Outbreak Intelligence Terminal -- BSL-1 Clearance',
            'Connecting to threat intelligence feeds... OK',
            'CVE database mirror: SYNCED (NVD 2026-04-09)',
            'MITRE ATT&CK Enterprise v19: LOADED',
            'Threat feed broker: CONNECTED (3 feeds active)'
        ],
        grubEntries: [
            'Containment Analyst OS 22.04 LTS',
            'Containment Analyst OS (recovery mode)'
        ],
        loginUser: 'analyst'
    },

    // =========================================================
    // LORE
    // =========================================================

    lore: {
        intro: 'Field teams have detected a new pathogen spreading through financial sector networks. Preliminary telemetry suggests it is exploiting a recently patched vulnerability in a common enterprise software stack. The pathogen has not been seen at Hexworth facilities yet, but we have three clients in the target sector. Intelligence division needs a complete threat profile in the next 45 minutes. Query the tools, build the profile, and recommend containment.',
        scenario: 'The target pathogen is tracked internally as OUTBREAK-7719. It exploits CVE-2024-3094 (XZ Utils backdoor) and uses MITRE ATT&CK techniques for persistence and lateral movement. Your workstation has access to simulated versions of the CVE database, MITRE ATT&CK lookup, and live threat feeds. Run the queries, synthesize the data, build the profile, then issue the containment recommendation.',
        outro: 'Threat profile complete. ATT&CK technique chain mapped. Containment recommendation issued. Intelligence division has everything needed for the client briefing. Three client facilities have been notified and have the recommended containment plan; patch decisions and timelines now rest with their incident-response teams.',

        goals: [
            "Build a complete threat profile by joining data from three intelligence sources: CVE database, MITRE ATT&CK, and live threat feeds",
            "Query specific CVEs and map them to ATT&CK technique IDs (e.g., T1059 for command-and-scripting)",
            "Synthesize multi-source intel into a containment recommendation that targets the actual TTPs in use",
            "Practice the analyst workflow: query → correlate → recommend, under a 45-minute clock",
            "Recognize that \"patched\" does not mean \"safe\" -- threat actors weaponize disclosed CVEs faster than orgs deploy patches"
        ],

        toolkit: [
            { name: "cve-search", purpose: "Look up CVE detail: severity, affected products, exploitation status", sample: "cve-search CVE-2024-3094" },
            { name: "mitre-lookup", purpose: "Look up MITRE ATT&CK technique: tactic, mitigations, detection", sample: "mitre-lookup T1059" },
            { name: "threat-feed", purpose: "Pull active threat feed entries for a campaign or actor", sample: "threat-feed OUTBREAK-7719" },
            { name: "profile", purpose: "Build/view the threat profile being assembled from queries above", sample: "profile build" },
            { name: "recommend", purpose: "Issue the containment recommendation derived from the assembled profile", sample: "recommend OUTBREAK-7719" },
            { name: "help", purpose: "Command reference", sample: "help" },
            { name: "KBA-1947", purpose: "Internal SOP: standard procedure for translating a CVE record into MITRE ATT&CK technique IDs", sample: "cat KBA-1947-CVE-to-ATTACK-Mapping.md" }
        ]
    },

    // =========================================================
    // TERMINAL CONFIG
    // =========================================================

    terminal: {
        user: 'analyst',
        hostname: 'intel-ws-01',
        startDir: '/home/analyst',
        welcome: 'Hexworth Containment -- Outbreak Intelligence Terminal\nBSL-1 Clearance Active\n\n*** NEW PATHOGEN ALERT: OUTBREAK-7719 ***\n*** Spreading in financial sector networks ***\n*** Full threat profile required within 45 minutes ***\n\nStart with: cve-search CVE-2024-3094\nSOP reference: cat KBA-1947-CVE-to-ATTACK-Mapping.md\nType "help" for all available commands.\n'
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
                        'analyst': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: 'OUTBREAK-7719 INVESTIGATION NOTES\n==================================\nInternal tracking ID: OUTBREAK-7719\nFirst detected: 2026-04-08 by financial sector ISAC\nSuspected CVE: CVE-2024-3094 (confirm with cve-search)\n\nReference: see KBA-1947-CVE-to-ATTACK-Mapping.md for the standard\ntechnique-mapping procedure.\n\nWorkflow:\n  1. cve-search <term> -- query the CVE database\n  2. mitre-lookup <technique-id> -- look up ATT&CK techniques\n  3. threat-feed -- pull live threat intelligence\n  4. profile -- review accumulated profile data\n  5. recommend -- submit containment recommendation\n\nProfile requires:\n  - CVE ID and CVSS score\n  - Attack vector and affected systems\n  - At least 2 ATT&CK technique IDs\n  - Containment recommendation based on ATT&CK\n'
                                },
                                'KBA-1947-CVE-to-ATTACK-Mapping.md': {
                                    type: 'file',
                                    content: `KBA-1947: Mapping CVE Records to MITRE ATT&CK Techniques
========================================================
Owner:        Threat Intelligence Division
Last review:  2026-03-14
Applies to:   All analysts performing initial threat profiling

PURPOSE
  Standard procedure for translating a CVE record into one or more
  MITRE ATT&CK technique IDs during initial threat profiling.

WHEN TO USE
  Any time a new CVE enters the active investigation queue and
  requires ATT&CK mapping before containment recommendations are
  filed.

PROCEDURE

  Step 1 -- Extract attack-pattern keywords from the CVE description.
    Read the CVE record returned by cve-search. Identify phrases
    that describe HOW the attack works. ATT&CK technique names
    frequently appear verbatim or near-verbatim. Common examples:

      "supply chain compromise"      -> T1195 Supply Chain Compromise
      "command/scripting interp."    -> T1059 Command and Scripting Interpreter
      "remote service" / SSH abuse   -> T1021 Remote Services
      "valid account" / cred abuse   -> T1078 Valid Accounts
      "disable security tooling"     -> T1685 Disable or Modify Tools

  Step 2 -- Resolve keywords to technique IDs.
    If the technique ID is known, run: mitre-lookup <ID>
    If the ID is not known, run: help -- the workstation lists the
    techniques present in the local mirror. The mitre-lookup error
    response also lists valid IDs with their names.

  Step 3 -- Confirm the technique matches the CVE behavior.
    Read the description returned by mitre-lookup. The local mirror
    cross-references CVE IDs in technique descriptions when a
    documented example exists. If the description does not match
    the CVE behavior, the mapping is wrong -- keep searching.

  Step 4 -- Verify profile completeness.
    Profile requires AT LEAST 2 distinct technique IDs. Run:
    profile -- confirm COMPLETE status before proceeding.

  Step 5 -- File the recommendation.
    Run: recommend -- gated on the steps above. If blocked, the
    response will name the missing profile field.

VERIFICATION
  At completion: profile shows COMPLETE; recommend succeeds; both
  flags fire in the lab tracker.

COMMON PITFALLS
  - Filing recommendation before pulling threat-feed
  - Mapping only one technique (minimum is 2)
  - Guessing T-IDs without reading descriptions

REFERENCES
  - MITRE ATT&CK Enterprise v19 (local mirror)
  - NVD: National Vulnerability Database
  - CISA Known Exploited Vulnerabilities Catalog
`
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls /home/analyst/\ncat notes.txt\ncat KBA-1947-CVE-to-ATTACK-Mapping.md\n'
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

    // Track what the analyst has queried and profiled
    _profileData: {
        cveId: null,
        cvssScore: null,
        attackVector: null,
        affectedSystems: null,
        techniques: [],
        threatFeedPulled: false,
        profileFinalized: false,
        recommendationFiled: false
    },

    _flag1Awarded: false,
    _flag2Awarded: false,

    // =========================================================
    // TERMINAL COMMANDS
    // =========================================================

    commands: {

        // cve-search <term> -- query the CVE database
        'cve-search': function(args, term, engine) {
            const query = args.join(' ').toLowerCase();
            if (!query) return 'Usage: cve-search <term>\nExample: cve-search CVE-2024-3094\nExample: cve-search xz utils';

            // Respond to any query that would find CVE-2024-3094
            if (query.includes('cve-2024-3094') || query.includes('xz') || query.includes('liblzma') || query.includes('xz-utils')) {
                engine.config._profileData.cveId = 'CVE-2024-3094';
                engine.config._profileData.cvssScore = '10.0';
                engine.config._profileData.attackVector = 'Network';
                engine.config._profileData.affectedSystems = 'XZ Utils 5.6.0-5.6.1 (liblzma), systemd-integrated Linux systems';

                return 'CVE DATABASE QUERY RESULT (synthesized from primary sources)\n' + '='.repeat(60) + '\nCVE ID:      CVE-2024-3094\nPublished:   2024-03-29\nCVSS Score:  10.0 (CRITICAL)\nCVSS Vector: CVSS:3.1/AV:N/AC:L/PR:N/UI:N/S:C/C:H/I:H/A:H\n\nDescription (composite, from NVD record + Openwall original disclosure):\n  Malicious code was discovered in the upstream tarballs of XZ Utils,\n  starting with version 5.6.0. Through a series of complex obfuscations,\n  the liblzma build process extracts a prebuilt object file from a\n  disguised test file in the source code, which modifies specific\n  functions in the liblzma code.\n\n  Technical mechanism (per Openwall original disclosure):\n  The backdoor hooks the RSA_public_decrypt function via the SSH\n  authentication flow on systems where systemd-linked sshd is present.\n  When a valid attacker-supplied payload is presented, the modified\n  function executes arbitrary code at the privilege of the sshd process\n  (typically root). This provides an unauthenticated remote-code-execution\n  primitive on affected systems.\n\nAffected Systems:\n  - XZ Utils 5.6.0, 5.6.1\n  - Any Linux distribution shipping these versions with systemd-linked sshd\n  - At time of discovery, these versions were present in Fedora 40 beta\n    and Debian unstable/testing channels (per Openwall disclosure)\n\nAttack Vector:      Network\nAuthentication:     None required\nImpact:             Full system compromise\n\nReferences:\n  NVD record (score, vector, affected versions):\n    https://nvd.nist.gov/vuln/detail/CVE-2024-3094\n  Openwall original disclosure (technical mechanism, distros at discovery):\n    https://www.openwall.com/lists/oss-security/2024/03/29/4\n  Internal: KBA-1947 (CVE-to-ATT&CK mapping procedure)\n\nNote: The NVD record uses terse generic language; the technical mechanism\n      details above are sourced from the Openwall original disclosure.\n      Always cross-reference NVD entries against the primary disclosure\n      source when the CVE description needs operational detail.\n\n[Profile updated: CVE-2024-3094 recorded]';
            }

            // Generic fallback for other searches
            return `CVE DATABASE QUERY: "${args.join(' ')}"\n\nNo exact match. Showing related results:\n  CVE-2024-3094  -- XZ Utils backdoor (CVSS 10.0, CRITICAL)\n  CVE-2024-1086  -- Linux kernel nf_tables use-after-free (CVSS 7.8)\n  CVE-2023-44487 -- HTTP/2 Rapid Reset (CVSS 7.5)\n\nTry: cve-search CVE-2024-3094  for the OUTBREAK-7719 target CVE`;
        },

        // mitre-lookup <technique-id> -- look up MITRE ATT&CK technique
        'mitre-lookup': function(args, term, engine) {
            const techId = (args[0] || '').toUpperCase();
            if (!techId) return 'Usage: mitre-lookup <technique-id>\nExample: mitre-lookup T1195\nExample: mitre-lookup T1059';

            const techniques = {
                'T1195': {
                    name: 'Supply Chain Compromise',
                    tactic: 'Initial Access',
                    description: 'Adversaries manipulate products or delivery mechanisms prior to receipt by end consumer. Can involve compromise of hardware, software, or firmware in the supply chain. CVE-2024-3094 (XZ Utils) is a documented example: attacker became trusted maintainer and inserted malicious code before release.',
                    detection: 'File integrity monitoring on software packages; hash verification against known-good sources; audit of build environments; monitor for unexpected modifications to widely-used libraries.',
                    mitigation: 'M1051 Update Software; M1013 Application Developer Guidance; use package signing and reproducible builds.'
                },
                'T1059': {
                    name: 'Command and Scripting Interpreter',
                    tactic: 'Execution',
                    description: 'Adversaries abuse command and script interpreters to execute commands, scripts, or binaries. The XZ backdoor injects arbitrary code into the SSH authentication flow -- when exploited, provides an interactive shell as root.',
                    detection: 'Monitor for anomalous process creation from sshd. Alert on root shell spawned from SSH daemon outside normal operation. Audit /proc for unexpected child processes of sshd.',
                    mitigation: 'M1038 Execution Prevention; application whitelisting; restrict scripting engines where possible.'
                },
                'T1078': {
                    name: 'Valid Accounts',
                    tactic: 'Stealth, Persistence, Privilege Escalation, Initial Access',
                    description: 'Adversaries obtain and abuse credentials of existing accounts to maintain access. After initial exploitation via the backdoor, threat actor uses valid-looking root sessions to avoid detection. (Tactic "Stealth" replaced "Defense Evasion" in ATT&CK v19 — April 2026.)',
                    detection: 'Impossible travel detection; monitor for accounts used from multiple IP addresses; baseline normal authentication patterns and alert on deviations.',
                    mitigation: 'M1032 Multi-factor Authentication; M1026 Privileged Account Management.'
                },
                'T1021': {
                    name: 'Remote Services',
                    tactic: 'Lateral Movement',
                    description: 'Adversaries use valid accounts to log into a service specifically designed to accept remote connections. SSH is the primary lateral movement vector once initial access is established via the XZ backdoor.',
                    detection: 'Monitor authentication logs for unusual SSH usage patterns. Alert on SSH connections from unexpected source IPs or to unexpected targets.',
                    mitigation: 'M1018 User Account Management; M1032 Multi-factor Authentication; M1042 Disable or Remove Feature or Program (where remote services are not required); network segmentation to limit SSH reachability is a defensive practice but ATT&CK lists Network Segmentation (M1030) as a mitigation on the sub-technique pages rather than on T1021 parent.'
                },
                'T1685': {
                    name: 'Disable or Modify Tools',
                    tactic: 'Defense Impairment',
                    description: 'Adversaries may disable, degrade, or tamper with security tools or applications (e.g., EDR tools, IDS, antivirus, logging agents, sensors) to impair or reduce visibility of defensive capabilities. Within the fictional OUTBREAK-7719 scenario, the pathogen disables auditd and clears syslog entries related to its activity after execution. (T1685 replaced T1562 in ATT&CK v19 — April 2026; the parent technique now sits under the new "Defense Impairment" tactic.)',
                    detection: 'Monitor for auditd service stopping unexpectedly; alert on log rotation outside normal schedule; compare log timestamps for gaps.',
                    mitigation: 'M1047 Audit; M1038 Execution Prevention; protect log integrity with remote syslog (SIEM); immutable logging solutions.'
                }
            };

            const tech = techniques[techId];
            if (!tech) {
                return `MITRE ATT&CK LOOKUP: ${techId}\n\nTechnique not found in local database.\nTry one of these relevant techniques:\n  T1195 -- Supply Chain Compromise (Initial Access)\n  T1059 -- Command and Scripting Interpreter (Execution)\n  T1078 -- Valid Accounts (Stealth, Persistence, Privilege Escalation, Initial Access)\n  T1021 -- Remote Services (Lateral Movement)\n  T1685 -- Disable or Modify Tools (Defense Impairment)`;
            }

            // Record this technique in the profile
            if (!engine.config._profileData.techniques.includes(techId)) {
                engine.config._profileData.techniques.push(techId);
            }

            return `MITRE ATT&CK ENTERPRISE v19\n${'='.repeat(50)}\nTechnique ID:  ${techId}\nName:          ${tech.name}\nTactic:        ${tech.tactic}\n\nDescription:\n  ${tech.description}\n\nDetection:\n  ${tech.detection}\n\nMitigation:\n  ${tech.mitigation}\n\n[Profile updated: ${techId} recorded (${engine.config._profileData.techniques.length} technique(s) total)]`;
        },

        // threat-feed -- pull live threat intelligence
        'threat-feed': function(args, term, engine) {
            engine.config._profileData.threatFeedPulled = true;

            return 'THREAT INTELLIGENCE FEED -- HEXWORTH CONTAINMENT\n' + '='.repeat(55) + '\nFeed broker: Active (3 sources)\nLast sync: 2026-04-09T14:30:00Z\n\n[ISAC-FIN] Financial Sector ISAC -- CRITICAL ALERT\n  OUTBREAK-7719 confirmed in 3 financial sector networks\n  Initial vector: CVE-2024-3094 (XZ Utils backdoor)\n  Lateral movement via SSH observed post-exploitation\n  IOCs:\n    IP addresses: 185.220.101.47, 91.108.4.123, 45.142.212.100\n    File hashes:\n      /usr/lib/x86_64-linux-gnu/liblzma.so.5.6.1\n      SHA256: 9bd18329e4bc099f87c5ab92827a13b...  (MALICIOUS)\n      SHA256: a6c0e0dde71d9ba02c8a0d29d4b47a...  (MALICIOUS)\n    Process: sshd spawning /bin/bash as root (anomalous)\n\n[CISA-ADVISORY] CISA Emergency Directive\n  All federal agencies: patch or remove XZ Utils 5.6.0/5.6.1 immediately\n  Downgrade to 5.4.x or upgrade to 5.6.2+ (backdoor removed)\n  Audit all Linux systems for affected library version\n\n[CERT-HEXWORTH] Internal threat feed\n  No Hexworth systems confirmed affected\n  3 client facilities in financial sector -- patch status: UNKNOWN\n  Recommend immediate vulnerability sweep and patch deployment\n';
        },

        // profile -- display accumulated threat profile.
        // Awards flag1 the first time profile reaches COMPLETE state — this is
        // the synthesis checkpoint the lab teaches (per SY0-701 2.2).
        'profile': function(args, term, engine) {
            const p = engine.config._profileData;
            const lines = [
                'THREAT PROFILE -- OUTBREAK-7719',
                '='.repeat(50)
            ];

            lines.push(`CVE ID:           ${p.cveId || '[NOT QUERIED -- run: cve-search CVE-2024-3094]'}`);
            lines.push(`CVSS Score:       ${p.cvssScore || '[UNKNOWN]'}`);
            lines.push(`Attack Vector:    ${p.attackVector || '[UNKNOWN]'}`);
            lines.push(`Affected Systems: ${p.affectedSystems || '[UNKNOWN]'}`);
            lines.push('');
            lines.push(`ATT&CK Techniques (${p.techniques.length} identified):`);
            if (p.techniques.length === 0) {
                lines.push('  [NONE -- run: mitre-lookup T1195 to begin]');
            } else {
                p.techniques.forEach(t => lines.push(`  ${t}`));
            }
            lines.push('');
            lines.push(`Threat Feed:      ${p.threatFeedPulled ? 'PULLED' : '[NOT PULLED -- run: threat-feed]'}`);
            lines.push('');

            // Determine completeness
            const complete = p.cveId && p.techniques.length >= 2 && p.threatFeedPulled;
            lines.push(complete
                ? 'Profile Status: COMPLETE -- ready for recommendation (run: recommend)'
                : 'Profile Status: INCOMPLETE -- gather more data before submitting'
            );

            // Award flag1 the first time the profile reaches COMPLETE.
            // This makes `profile` a genuine pedagogical checkpoint instead of
            // a decorative step the student could skip.
            if (complete && !engine.config._flag1Awarded) {
                engine.config._flag1Awarded = true;
                engine.config._profileData.profileFinalized = true;
                engine.awardFlag('flag1');
                lines.push('');
                lines.push('[INTEL MILESTONE] Threat profile complete. Flag unlocked.');
            }

            return lines.join('\n');
        },

        // recommend -- file containment recommendation. Gated on flag1 having
        // been awarded by `profile` (i.e., the synthesis step actually happened).
        'recommend': function(args, term, engine) {
            const p = engine.config._profileData;

            // Flag1 gate: profile must have reached COMPLETE state before
            // a recommendation can be filed. This forces the synthesis step.
            if (!engine.config._flag1Awarded) {
                if (!p.cveId) {
                    return 'Recommendation blocked: CVE data missing.\nRun: cve-search CVE-2024-3094\nThen confirm profile completeness: run "profile" (must show COMPLETE).';
                }
                if (p.techniques.length < 2) {
                    return `Recommendation blocked: ATT&CK technique mapping insufficient.\nRequires at least 2 techniques. Currently have: ${p.techniques.length}\nRun: mitre-lookup T1195 and mitre-lookup T1059 (or others)\nThen confirm profile completeness: run "profile" (must show COMPLETE).`;
                }
                if (!p.threatFeedPulled) {
                    return 'Recommendation blocked: Threat feed not consulted.\nRun: threat-feed\nThen confirm profile completeness: run "profile" (must show COMPLETE).';
                }
                return 'Recommendation blocked: profile not yet finalized.\nRun: profile -- the workflow requires confirming COMPLETE status before recommendations can be filed. This is the analyst-synthesis checkpoint.';
            }

            p.recommendationFiled = true;

            const techList = p.techniques.join(', ');

            // Award Flag 2: containment recommendation filed with ATT&CK mappings
            if (!engine.config._flag2Awarded) {
                engine.config._flag2Awarded = true;
                engine.awardFlag('flag2');
            }

            return 'CONTAINMENT RECOMMENDATION FILED\n' + '='.repeat(50) + '\nPathogen:         OUTBREAK-7719\nCVE:              CVE-2024-3094 (CVSS 10.0 CRITICAL)\nATT&CK Techniques: ' + techList + '\n\nIMMEDIATE ACTIONS:\n  1. Vulnerability Sweep (SY0-701: 2.5)\n     Run exposure sweep on all Linux systems with XZ Utils\n     Command: dpkg -l | grep xz-utils OR rpm -qa | grep xz-utils\n     Target: identify any system running 5.6.0 or 5.6.1\n\n  2. Inoculation (SY0-701: 2.5)\n     Downgrade XZ Utils to 5.4.x or upgrade to 5.6.2+\n     Priority: systems with systemd-linked sshd\n     Timeline: immediate (CVSS 10.0 -- no grace period)\n\n  3. Network Isolation (T1021 mitigation)\n     Block SSH from external IPs to all affected hosts until patched\n     Internal SSH: require key-based auth, disable password auth\n\n  4. Indicator Sweep (T1195 detection)\n     Hash-verify /usr/lib/x86_64-linux-gnu/liblzma.so.5*\n     Compare against known-good SHA256 values from ISAC-FIN feed\n\n  5. Log Review (T1685 detection)\n     Check for auditd gaps or syslog anomalies on all SSH-exposed hosts\n     Look for: sshd spawning bash as root (anomalous child process)\n\nThree client facilities in the target sector have been notified;\ncontainment plan distributed to their incident-response teams.\nPatch deployment authorized at the client level.';
        },

        // help -- command reference
        'help': function(args, term, engine) {
            return 'OUTBREAK INTELLIGENCE TERMINAL -- COMMAND REFERENCE\n\n  cve-search <term>       Query CVE database\n  mitre-lookup <id>       Look up ATT&CK technique\n  threat-feed             Pull live threat intelligence\n  profile                 View accumulated threat profile\n  recommend               File containment recommendation\n  cat <file>              Read a file\n\nTarget CVE: CVE-2024-3094\nTarget pathogen: OUTBREAK-7719\n\nATT&CK techniques to explore (5 available in local mirror):\n  T1195 -- Supply Chain Compromise (Initial Access)\n  T1059 -- Command and Scripting Interpreter (Execution)\n  T1078 -- Valid Accounts (Stealth, Persistence, Privilege Escalation, Initial Access)\n  T1021 -- Remote Services (Lateral Movement)\n  T1685 -- Disable or Modify Tools (Defense Impairment)\n\nReference: KBA-1947-CVE-to-ATTACK-Mapping.md (in /home/analyst)';
        }
    },

    // =========================================================
    // FLAGS
    // =========================================================

    flags: [
        {
            id: 'flag1',
            value: 'FLAG{pis-l03-outbreak-intelligence_flag1_threat_profile_compl}',
            label: 'Threat Profile Complete',
            description: 'Queried CVE-2024-3094, mapped at least 2 ATT&CK techniques, pulled threat feed.',
            points: 250,
            autoCheck: true
        },
        {
            id: 'flag2',
            value: 'FLAG{pis-l03-outbreak-intelligence_flag2_containment_recommen}',
            label: 'Containment Recommendation Filed',
            description: 'Filed a complete containment recommendation based on ATT&CK technique mitigations.',
            points: 250,
            autoCheck: true
        }
    ],

    // =========================================================
    // SCORING
    // =========================================================

    scoring: {
        // base: starting score (BoxEngine line 198: state.score = scoring.base || 1000)
        // maxScore: max FLAG points gainable from this lab (2 flags × 250 = 500).
        //          The engine's true theoretical max is base + maxScore + speedBonus.
        base: 1000,
        minScore: 0,
        maxScore: 500,
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
            text: 'The cve-search command accepts both CVE IDs (e.g., CVE-2024-3094) and keyword queries (e.g., "xz utils", "liblzma"). Both routes resolve to the same record in the local mirror. Practice the keyword route once -- in real OSINT work you often have only a partial product name to start from, not a CVE ID.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint2',
            text: 'The profile command shows what is still missing. You need at least 2 ATT&CK techniques. For a supply chain attack that achieves remote code execution, think about the Initial Access technique (how it got in) and the Execution technique (how it ran code).',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint3',
            text: 'The lab gates Flag 1 on profile reaching COMPLETE state -- which means CVE + at least 2 techniques + threat feed all in place. Map MORE than 2 techniques (5 are available: T1195, T1059, T1078, T1021, T1685) to see the full kill chain for the attack. Each technique you read gives you a separate piece of the post-exploitation narrative.',
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
            { flagId: 'flag1', objective: '4.3', description: 'Given a scenario, analyze indicators of malicious activity', skill: 'Scenario-driven OSINT correlation: query CVE database, look up MITRE ATT&CK techniques, pull threat intelligence feed, and synthesize into a coherent threat profile' },
            { flagId: 'flag2', objective: '2.5', description: 'Explain the purpose of mitigation techniques used to secure the enterprise', skill: 'Translating ATT&CK technique mappings into actionable containment and inoculation recommendations' }
        ]
    }

};
