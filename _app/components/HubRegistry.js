/**
 * HubRegistry, Single source of truth for platform hubs and tenant-assignable
 * courses.
 *
 * Status: consumed live by _app/catalog.html (the hub catalog page) and the admin Hub Health
 * panel; hubHref values here are the canonical link targets students land on, so keep them
 * pointing at real course-hub pages (not house roots or redirect stubs). See
 * _docs/architecture/hub-registry-design.md for the broader migration plan (houses reading from
 * this registry is Option B, staged).
 *
 * Nancy v1 review (2026-05-09) addressed:
 *  - `dashboardHref` removed: every entry except cyberops had `/lobby.html`,
 *    making it consumer-level routing not hub-level data. Consumers now pass
 *    a routing function to adapters.
 *  - `status` field removed 2026-05-09 (all 19 entries were 'live'; YAGNI) and
 *    RETURNED 2026-07-28 with defined semantics: `status: 'workshop'` =
 *    quarantined lifecycle state (hidden from student surfaces, admin-testable,
 *    tracked in the Workshop shelf + Hub Health HUD). ABSENT status = live.
 *    See "Lifecycle status" in _docs/architecture/unified-hub-registry.md.
 *  - Phase 1 ships THIS FILE ONLY. Script-tag injection into 13 consumer
 *    pages requires CSP header audit first (Nancy concern 1).
 *
 * Schema:
 *  - id: stable string written to tenant.licensing.contentAccess.{courses|hubs}
 *  - category: 'cert-prep' | 'course' | 'platform-hub' | 'tool' (drives the catalog category filter)
 *  - label, sublabel: display text. sublabel is descriptor / catalog code.
 *  - catalogCode: official exam/course code (optional, courses only)
 *  - icon: webp icon path
 *  - hubHref: canonical hub URL (used by lobby + nav, also as a default
 *    route fallback for consumers that pass `h => h.hubHref` as routingFn)
 *  - tenantAssignable: boolean. Filters assignable() / courses() / platformHubs().
 *  - sortOrder: integer for explicit ordering. No implicit alphabetical.
 *  - origin: 'derived' on hubs added from the page-inventory scan (2026-07-26+). ABSENT = one of the
 *    original hand-curated 22. Lets us distinguish the original catalog from the derived additions.
 *
 * Adapter pattern: each consumer's COURSE_MAP shape (academy uses
 * {name,desc,icon,href}, clean-ops uses {title,desc,...}, etc.) gets a
 * dedicated adapter function. Adapters take (hub, routingFn) and return
 * the consumer-shape entry. routingFn is called per hub to determine the
 * href value, consumers pass `() => '/lobby.html'` to route through the
 * lobby (default for tenant dashboards) or `h => h.hubHref` to navigate
 * directly (default for the lobby itself).
 */

(function (root) {
    'use strict';

    var HUBS = [
        // ─── Original 22 (hand-curated). Platform hubs first, then courses. Derived hubs (origin:'derived',
        //     from the 2026-07-26 inventory scan) are appended in their own block below. ───
        {
            id: 'wireshark',
            category: 'platform-hub',
            label: 'Wireshark Hub',
            sublabel: '32 modules',
            icon: '/assets/images/icons/icon-antenna.webp',
            hubHref: '/wireshark/index.html',
            tenantAssignable: true,
            house: 'eye',
            sortOrder: 1
        },
        {
            id: 'forensics',
            category: 'platform-hub',
            label: 'Forensics Hub',
            sublabel: '60 modules',
            icon: '/assets/images/icons/icon-magnifier.webp',
            hubHref: '/houses/eye/forensics/index.html',
            tenantAssignable: true,
            house: 'eye',
            sortOrder: 2
        },
        {
            id: 'bug-hunting',
            category: 'platform-hub',
            label: 'Bug Hunting Dojo',
            sublabel: 'Security research',
            icon: '/assets/images/icons/icon-spider.webp',
            hubHref: '/dark-arts/vault/bug-hunting/index.html',
            tenantAssignable: true,
            house: 'dark-arts',
            sortOrder: 3
        },
        {
            id: 'signal',
            category: 'platform-hub',
            label: 'Signal Toolkit',
            sublabel: 'Hardware projects',
            icon: '/assets/images/icons/icon-signal.webp',
            hubHref: '/signal/index.html',
            tenantAssignable: true,
            house: 'forge',
            sortOrder: 4
        },
        {
            id: 'arctic-cli',
            category: 'platform-hub',
            label: 'Arctic CLI Training',
            sublabel: 'Linux fundamentals',
            icon: '/assets/images/icons/icon-penguin.webp',
            hubHref: '/arctic/index.html',
            tenantAssignable: true,
            house: 'matrix',
            sortOrder: 5
        },

        // ─── Courses (14, original 12 + ethics-it + infosec from Task #96) ─
        {
            id: 'network-plus',
            category: 'cert-prep',
            catalogCode: 'N10-009',
            label: 'CompTIA Network+',
            sublabel: 'N10-009',
            icon: '/assets/images/icons/icon-globe.webp',
            hubHref: '/houses/web/network-plus/index.html',
            tenantAssignable: true,
            house: 'web',
            sortOrder: 10
        },
        {
            id: 'cyberops',
            category: 'cert-prep',
            catalogCode: '200-201',
            label: 'CyberOps',
            sublabel: '200-201',
            icon: '/assets/images/icons/icon-shield.webp',
            hubHref: '/houses/eye/modules/cyberops/index.html',
            tenantAssignable: true,
            house: 'eye',
            sortOrder: 20
        },
        {
            id: 'aplus-core1',
            category: 'cert-prep',
            catalogCode: '220-1101',
            label: 'CompTIA A+ Core 1',
            sublabel: '220-1101',
            icon: '/assets/images/icons/icon-wrench.webp',
            hubHref: '/houses/forge/applets/comptia-aplus/core-1/index.html',
            tenantAssignable: true,
            house: 'forge',
            sortOrder: 30
        },
        {
            id: 'aplus-core2',
            category: 'cert-prep',
            catalogCode: '220-1102',
            label: 'CompTIA A+ Core 2',
            sublabel: '220-1102',
            icon: '/assets/images/icons/icon-wrench.webp',
            hubHref: '/houses/forge/applets/comptia-aplus/core-2/index.html',
            tenantAssignable: true,
            house: 'forge',
            sortOrder: 40
        },
        {
            id: 'md-100',
            category: 'cert-prep',
            catalogCode: 'MD-100',
            label: 'MD-100',
            sublabel: 'Windows Client',
            icon: '/assets/images/icons/icon-terminal.webp',
            hubHref: '/houses/forge/md-100/index.html',
            tenantAssignable: true,
            house: 'forge',
            sortOrder: 50
        },
        {
            id: 'md-101',
            category: 'cert-prep',
            catalogCode: 'MD-101',
            label: 'MD-101',
            sublabel: 'Windows Devices',
            icon: '/assets/images/icons/icon-terminal.webp',
            hubHref: '/houses/forge/md-101/index.html',
            tenantAssignable: true,
            house: 'forge',
            sortOrder: 60
        },
        {
            id: 'feh',
            category: 'course',
            label: 'FEH',
            sublabel: 'Foundations of Ethical Hacking',
            icon: '/assets/images/icons/icon-magnifier.webp',
            hubHref: '/houses/dark-arts/feh/index.html',
            tenantAssignable: true,
            house: 'dark-arts',
            sortOrder: 70
        },
        {
            id: 'python-hub',
            category: 'course',
            label: 'Python Programming',
            sublabel: 'Python Hub',
            icon: '/assets/images/icons/icon-terminal.webp',
            hubHref: '/houses/code/modules/python-hub/index.html',
            tenantAssignable: true,
            house: 'code',
            sortOrder: 80
        },
        {
            id: 'python-for-it',
            category: 'course',
            catalogCode: 'COP1034C',
            label: 'Python for IT',
            sublabel: 'COP1034C',
            icon: '/assets/images/icons/icon-terminal.webp',
            hubHref: '/houses/code/python-for-it/index.html',
            tenantAssignable: true,
            house: 'code',
            sortOrder: 90
        },
        {
            id: 'security-plus',
            category: 'cert-prep',
            catalogCode: 'SY0-701',
            label: 'CompTIA Security+',
            sublabel: 'SY0-701',
            icon: '/assets/images/icons/icon-shield.webp',
            hubHref: '/houses/shield/security-plus/index.html',
            tenantAssignable: true,
            house: 'shield',
            sortOrder: 100
        },
        {
            id: 'isc2-cc',
            category: 'cert-prep',
            catalogCode: 'CC',
            label: 'ISC2 Certified in Cybersecurity',
            sublabel: 'CC',
            icon: '/assets/images/icons/icon-key.webp',
            hubHref: '/houses/shield/isc2-cc/index.html',
            tenantAssignable: true,
            house: 'shield',
            sortOrder: 110
        },
        {
            id: 'server-plus',
            category: 'cert-prep',
            catalogCode: 'SK0-005',
            label: 'CompTIA Server+',
            sublabel: 'SK0-005',
            icon: '/assets/images/icons/icon-keyboard.webp',
            hubHref: '/houses/cloud/server-plus/index.html',
            catalogCategories: ['server-plus'],
            /* server-plus reuses WSA's module set (hrefs under modules/wsa/), deliberate --
               same audited cross-house pattern as aws-ccp/azure-fundamentals. */
            catalogCrossHouse: true,
            parent: 'cloud-master', tenantAssignable: true,
            house: 'cloud',
            // Curriculum order ruled 2026-08-02 (#241): flagship-first, then tier order
            // (fundamentals -> associate -> specialist), thin shared-content indexes last.
            // The 11 cloud-master children PERMUTE their existing sortOrder values, so the
            // child set's global positions are untouched -- only which child sits where.
            sortOrder: 629
        },
        {
            id: 'wsa',
            category: 'course',
            catalogCode: 'CTS1328C',
            label: 'Windows Server Administration',
            sublabel: 'CTS1328C',
            icon: '/assets/images/icons/icon-server.webp',
            hubHref: '/houses/cloud/modules/wsa/index.html',
            tenantAssignable: true,
            house: 'cloud',
            sortOrder: 125
        },
        {
            id: 'adv-linux',
            category: 'course',
            catalogCode: 'CTS4321C',
            label: 'Advanced Linux Administration',
            sublabel: 'CTS4321C',
            icon: '/assets/images/icons/icon-terminal.webp',
            hubHref: '/houses/matrix/adv-linux/index.html',
            tenantAssignable: true,
            house: 'matrix',
            sortOrder: 127
        },
        {
            id: 'ethics-it',
            category: 'course',
            catalogCode: 'CIS4253',
            label: 'Ethics in IT',
            sublabel: 'CIS4253',
            icon: '/assets/images/icons/icon-scales.webp',
            hubHref: '/houses/divergent/ethics-it/index.html',
            tenantAssignable: true,
            house: 'divergent',
            sortOrder: 130
        },
        {
            id: 'domino-effect',
            category: 'course',
            catalogCode: 'CIS2208',
            label: 'The Domino Effect',
            sublabel: 'CIS2208',
            icon: '/assets/images/icons/icon-chain.webp',
            // Course content lives under the legacy folder slug 'cybersecurity-policy'
            // even though the course was rebranded "The Domino Effect" (CIS2208).
            hubHref: '/houses/divergent/cybersecurity-policy/index.html',
            tenantAssignable: true,
            house: 'divergent',
            sortOrder: 135
        },
        {
            id: 'infosec',
            category: 'course',
            catalogCode: 'CIS2350C',
            label: 'Principles of Information Security',
            sublabel: 'CIS2350C',
            icon: '/assets/images/icons/icon-padlock.webp',
            hubHref: '/houses/shield/infosec/index.html',
            tenantAssignable: true,
            house: 'shield',
            sortOrder: 140
        },
        // ── cert-prep hubs (derived from the CertPathRenderer stub pages, 2026-07-26). These full
        //    cert-prep courses existed live but were never in the registry; added so the catalog can
        //    see + filter them. Canonical page = the clean /houses/<slug>/ stub. Covers pending. ──
        { id: 'casp-plus', origin: 'derived',            category: 'cert-prep', catalogCode: 'CAS-004', label: 'CompTIA CASP+',            sublabel: 'CAS-004', icon: '/assets/images/icons/icon-shield.webp',   hubHref: '/houses/casp-plus/index.html',            tenantAssignable: true, house: 'shield', sortOrder: 220 },
        { id: 'comptia-linux', origin: 'derived',        category: 'cert-prep', catalogCode: 'XK0-005', label: 'CompTIA Linux+',           sublabel: 'XK0-005', icon: '/assets/images/icons/icon-penguin.webp',  hubHref: '/houses/comptia-linux/index.html',        tenantAssignable: true, house: 'matrix', sortOrder: 230 },
        // comptia-network was MISSING here while its page existed and the manifest listed it, so
        // nothing rendered a link and the course was reachable only by typing the URL. Found by
        // the HEXOS-3 dead-entry gate, which is the class of bug it was built for.
        { id: 'comptia-network', origin: 'derived',      category: 'cert-prep', catalogCode: 'N10-009', label: 'CompTIA Network+',         sublabel: 'N10-009', icon: '/assets/images/icons/icon-network.webp',  hubHref: '/houses/comptia-network/index.html',      tenantAssignable: true, house: 'web',    sortOrder: 231 },
        { id: 'aws-ccp', origin: 'derived',              category: 'cert-prep', catalogCode: 'CLF-C02', label: 'AWS Cloud Practitioner',   sublabel: 'CLF-C02', icon: '/assets/images/icons/icon-cloud.webp',    hubHref: '/houses/aws-ccp/index.html',              catalogCategories: ['aws'], catalogCrossHouse: true /* aws content lives under houses/cloud, deliberate (audited) */, parent: 'cloud-master', tenantAssignable: true, house: 'cloud', sortOrder: 250 },
        { id: 'aws-developer', origin: 'derived',        category: 'cert-prep', catalogCode: 'DVA-C02', label: 'AWS Developer Associate',  sublabel: 'DVA-C02', icon: '/assets/images/icons/icon-cloud.webp',    hubHref: '/houses/aws-developer/index.html',        parent: 'cloud-master', tenantAssignable: true, house: 'cloud', sortOrder: 627 },
        { id: 'azure-fundamentals', origin: 'derived',   category: 'cert-prep', catalogCode: 'AZ-900',  label: 'Azure Fundamentals',      sublabel: 'AZ-900',  icon: '/assets/images/icons/icon-cloud.webp',    hubHref: '/houses/azure-fundamentals/index.html',   catalogCategories: ['az-900'], catalogCrossHouse: true /* az-900 content lives under houses/cloud/az-900, deliberate (audited) */, parent: 'cloud-master', tenantAssignable: true, house: 'cloud', sortOrder: 260 },
        { id: 'security-operations', origin: 'derived',  category: 'cert-prep', catalogCode: '',        label: 'Security Operations',     sublabel: 'SOC Analyst', icon: '/assets/images/icons/icon-radar.webp', hubHref: '/houses/security-operations/index.html',  tenantAssignable: true, house: 'eye', sortOrder: 270 },
        { id: 'devops-fundamentals', origin: 'derived',  category: 'cert-prep', catalogCode: '',        label: 'DevOps Fundamentals',     sublabel: 'DevOps',  icon: '/assets/images/icons/icon-gear.webp',     hubHref: '/houses/devops-fundamentals/index.html',  tenantAssignable: true, house: 'cloud', sortOrder: 280 },
        { id: 'cryptography-track', origin: 'derived',   category: 'cert-prep', catalogCode: '',        label: 'Cryptography Track',      sublabel: 'Cryptography', icon: '/assets/images/icons/icon-key.webp', hubHref: '/houses/cryptography-track/index.html',   tenantAssignable: true, house: 'key', sortOrder: 290 },
        // status:'workshop' = quarantined lifecycle state (Frank 2026-07-28): page is admin-gated,
        // hidden from student surfaces (tenantAssignable:false is the hiding flag), listed on the
        // Workshop shelf + Hub Health HUD Workshop section. house = where it returns when fixed.
        { id: 'security-plus-crypto', origin: 'derived', category: 'cert-prep', catalogCode: '',        label: 'Security+ Cryptography',  sublabel: 'SY0-701 domain', icon: '/assets/images/icons/icon-key.webp', hubHref: '/houses/security-plus-crypto/index.html', tenantAssignable: false, status: 'workshop', house: 'key', sortOrder: 300 },
        // ── additional hubs derived from the inventory scan (2026-07-26). Real hub landing pages that
        //    existed but were unregistered. Container hubs = the parent only (their sub-tracks are modules,
        //    NOT registered). Covers pending -> icon-fallback in the catalog. ──
        // Container / anthology hubs (parent registered; sub-tracks are modules, excluded).
        { id: 'cortex', origin: 'derived',              category: 'platform-hub', label: 'The Cortex',            sublabel: 'AI/ML Hub',            icon: '/assets/images/icons/icon-brain.webp',    hubHref: '/houses/ai/cortex/index.html',                 tenantAssignable: true, house: 'ai', sortOrder: 310 },
        { id: 'code-armory', origin: 'derived',         category: 'platform-hub', label: 'The Code Armory',       sublabel: 'Programming Languages', icon: '/assets/images/icons/icon-code.webp',    hubHref: '/houses/code/armory/index.html',               tenantAssignable: true, house: 'code', sortOrder: 320 },
        { id: 'algorithm-chamber', origin: 'derived',   category: 'platform-hub', label: 'Algorithm Chamber',     sublabel: 'CS Fundamentals',      icon: '/assets/images/icons/icon-branch.webp',   hubHref: '/houses/code/algorithm-chamber/index.html',    tenantAssignable: true, house: 'code', sortOrder: 330 },
        { id: 'proving-grounds', origin: 'derived',     category: 'platform-hub', label: 'The Proving Grounds',   sublabel: 'Offensive / Red Team', icon: '/assets/images/icons/icon-swords.webp',   hubHref: '/houses/dark-arts/offensive/index.html',       tenantAssignable: true, house: 'dark-arts', sortOrder: 340 },
        { id: 'backbone', origin: 'derived',            category: 'platform-hub', label: 'The Backbone',          sublabel: 'Advanced Networking',  icon: '/assets/images/icons/icon-network.webp',  hubHref: '/houses/web/backbone/index.html',              tenantAssignable: true, house: 'web', sortOrder: 350 },
        // Standalone cert-prep hubs.
        { id: 'az-104', origin: 'derived',              category: 'cert-prep', catalogCode: 'AZ-104',  label: 'Azure Administrator',   sublabel: 'AZ-104', icon: '/assets/images/icons/icon-cloud.webp',    hubHref: '/houses/cloud/az-104/index.html',              catalogCategories: ['az-104'], parent: 'cloud-master', tenantAssignable: true, house: 'cloud', sortOrder: 420 },
        { id: 'ai-900', origin: 'derived',              category: 'cert-prep', catalogCode: 'AI-900',  label: 'Azure AI Fundamentals', sublabel: 'AI-900', icon: '/assets/images/icons/icon-brain.webp',    hubHref: '/houses/ai/ai-900/index.html',                 tenantAssignable: true, house: 'ai', sortOrder: 370 },
        { id: 'ai-102', origin: 'derived',              category: 'cert-prep', catalogCode: 'AI-102',  label: 'Azure AI Engineer',     sublabel: 'AI-102', icon: '/assets/images/icons/icon-brain.webp',    hubHref: '/houses/ai/certifications/ai-102/index.html',  tenantAssignable: true, house: 'ai', sortOrder: 380 },
        { id: 'ehe', origin: 'derived',                 category: 'cert-prep', catalogCode: 'EHEv1',   label: 'Ethical Hacking Essentials', sublabel: 'EC-Council EHE', icon: '/assets/images/icons/icon-mask.webp', hubHref: '/dark-arts/vault/ehe/index.html',          tenantAssignable: true, house: 'dark-arts', sortOrder: 390 },
        // Academic course hubs (CIS/CTS coded).
        { id: 'intro-networks', origin: 'derived',      category: 'course', catalogCode: 'CTS1090C', label: 'Introduction to Networks', sublabel: 'CTS1090C', icon: '/assets/images/icons/icon-globe.webp',   hubHref: '/houses/web/intro-networks/index.html',        tenantAssignable: true, house: 'web', sortOrder: 400 },
        { id: 'net-essentials', origin: 'derived',      category: 'course', catalogCode: 'CTS1305C', label: 'Essentials of Networking', sublabel: 'CTS1305C', icon: '/assets/images/icons/icon-network.webp', hubHref: '/houses/web/net-essentials/index.html',        tenantAssignable: true, house: 'web', sortOrder: 410 },
        { id: 'cloud-essentials', origin: 'derived',    category: 'course', catalogCode: 'CTS2145C', label: 'Cloud Essentials',       sublabel: 'CTS2145C', icon: '/assets/images/icons/icon-cloud.webp',    hubHref: '/houses/cloud/cloud-essentials/index.html',    catalogCategories: ['cloud'], parent: 'cloud-master', tenantAssignable: true, house: 'cloud', sortOrder: 240 },
        { id: 'hardware-support', origin: 'derived',    category: 'course', catalogCode: 'CTS1150C', label: 'Hardware Support',       sublabel: 'CTS1150C', icon: '/assets/images/icons/icon-wrench.webp',   hubHref: '/houses/forge/hardware-support/index.html',    tenantAssignable: true, house: 'forge', sortOrder: 430 },
        { id: 'intro-security', origin: 'derived',      category: 'course', catalogCode: 'CTS1120C', label: 'Introduction to Security', sublabel: 'CTS1120C', icon: '/assets/images/icons/icon-shield.webp', hubHref: '/houses/shield/intro-security/index.html',     tenantAssignable: true, house: 'shield', sortOrder: 440 },
        { id: 'cybersecurity-ethics', origin: 'derived', category: 'course', catalogCode: 'CIS2253', label: 'Cybersecurity Ethics',  sublabel: 'CIS2253', icon: '/assets/images/icons/icon-scales.webp',   hubHref: '/houses/divergent/cybersecurity-ethics/index.html', tenantAssignable: true, house: 'divergent', sortOrder: 450 },
        { id: 'linux-essentials', origin: 'derived',    category: 'course', catalogCode: 'CTS2165C', label: 'Linux Essentials',       sublabel: 'CTS2165C', icon: '/assets/images/icons/icon-penguin.webp', hubHref: '/houses/script/linux-essentials/index.html',   tenantAssignable: true, house: 'script', sortOrder: 460 },
        // Skills-track course hubs (no cert code, but top-level courses).
        { id: 'linux-mastery', origin: 'derived',       category: 'course', label: 'Linux Mastery',          sublabel: '55 modules',       icon: '/assets/images/icons/icon-penguin.webp',  hubHref: '/houses/script/modules/linux-mastery/index.html',    tenantAssignable: true, house: 'script', sortOrder: 470 },
        { id: 'grep-pipe-mastery', origin: 'derived',   category: 'course', label: 'Grep & Pipe Mastery',    sublabel: 'Command-line',     icon: '/assets/images/icons/icon-terminal.webp', hubHref: '/houses/script/courses/grep-pipe-mastery/index.html', tenantAssignable: true, house: 'script', sortOrder: 480 },
        { id: 'databases', origin: 'derived',           category: 'course', label: 'Database Track',         sublabel: 'Databases',        icon: '/assets/images/icons/icon-database.webp', hubHref: '/houses/script/modules/databases/index.html',        tenantAssignable: true, house: 'script', sortOrder: 490 },
        { id: 'zero-to-python', origin: 'derived',      category: 'course', label: 'Zero to Python',        sublabel: 'Beginner Python', icon: '/assets/images/icons/icon-snake.webp',    hubHref: '/houses/script/modules/python/index.html',           tenantAssignable: true, house: 'script', sortOrder: 500 },
        // Observatory-vs-catalog reconciliation (2026-07-26): scheduled courses the Observatory teaches
        // that the page-scan missed (plainly-rendered, no hub-renderer signal). Real course pages.
        { id: 'projects',      origin: 'derived',       category: 'platform-hub', label: 'Projects Hub',        sublabel: 'Hands-On Projects', icon: '/assets/images/icons/icon-rocket.webp',  hubHref: '/projects/index.html',                        tenantAssignable: true, house: 'observatory', sortOrder: 510 },
        // The Rig (2026-07-29, design: _docs/architecture/the-rig-sandbox-hub.md): consolidated sandbox
        // front door; shelf renders from SandboxLauncher.getBrowsableLabs() (fail-closed browsable flags).
        // tenantAssignable:false is DELIBERATE until the graded-vs-free-play capacity ruling lands.
        { id: 'the-rig',       category: 'platform-hub', label: 'The Rig',            sublabel: 'Sandbox Bay',   icon: '/assets/images/icons/icon-terminal.webp', hubHref: '/rig/index.html',                             tenantAssignable: false, house: 'observatory', sortOrder: 515 },
        { id: 'clh',           origin: 'derived',       category: 'course', label: 'Command Line Hacker',       sublabel: 'CLH',             icon: '/assets/images/icons/icon-terminal.webp', hubHref: '/houses/script/courses/clh/index.html',       tenantAssignable: true, house: 'script', sortOrder: 520 },
        { id: 'linux-admin',   origin: 'derived',       category: 'course', label: 'Linux Administration',      sublabel: 'Linux',           icon: '/assets/images/icons/icon-penguin.webp',  hubHref: '/houses/script/linux/index.html',             tenantAssignable: true, house: 'script', sortOrder: 530 },
        // Multi-list (LearningPaths) reconciliation (2026-07-26): tracks with real landing pages not yet registered.
        { id: 'cse',             origin: 'derived',     category: 'cert-prep', catalogCode: 'CSE v1', label: 'Cloud Security Engineer', sublabel: 'EC-Council CSE', icon: '/assets/images/icons/icon-cloud.webp',  hubHref: '/houses/cloud/cse/index.html',              catalogCategories: ['cloud-security-engineering'], catalogCrossHouse: true, /* the real CSE course (verified vs EC-Council syllabus 2026-08-02): files live in the house's shared presentations/labs/quizzes dirs, not under cse/. Category 'cse' is CIS2253 ethics -- never wire that one. */              parent: 'cloud-master', tenantAssignable: true, house: 'cloud', sortOrder: 122 },
        { id: 'openstack',       origin: 'derived',     category: 'course', catalogCode: 'OpenStack', label: 'OpenStack Cloud',          sublabel: 'Live Cloud Labs', icon: '/assets/images/icons/icon-cloud.webp',    hubHref: '/houses/cloud/openstack/index.html',          catalogCategories: ['openstack'], parent: 'cloud-master', tenantAssignable: true, house: 'cloud', sortOrder: 120 },
        { id: 'cyber-framework', origin: 'derived',     category: 'course', label: 'Cyber Law & Policy',       sublabel: 'Framework',       icon: '/assets/images/icons/icon-scales.webp',   hubHref: '/houses/shield/cyber-framework/index.html',   tenantAssignable: true, house: 'shield', sortOrder: 560 },
        { id: 'python-programming', origin: 'derived',  category: 'course', catalogCode: 'COP2891', label: 'Python (Snake Pit)', sublabel: 'COP2891', icon: '/assets/images/icons/icon-snake.webp',    hubHref: '/houses/code/python-programming/index.html',        tenantAssignable: true, house: 'code', sortOrder: 590 },
        // ─── Derived wave 3 (2026-07-26): course-tree reconciliation (gen-catalog-from-tree.js), 82 hubs, sortOrder 600+ ───
        { id: 'api', origin: 'derived', category: 'platform-hub', label: 'API Security', sublabel: 'Cloud', icon: '/assets/images/icons/icon-keyboard.webp', hubHref: '/houses/cloud/api/index.html', tenantAssignable: true, house: 'cloud', sortOrder: 600 },
        { id: 'vault', origin: 'derived', category: 'platform-hub', label: 'The Vault', sublabel: 'Dark Arts', icon: '/assets/images/icons/icon-spider.webp', hubHref: '/dark-arts/vault/index.html', tenantAssignable: true, house: 'dark-arts', sortOrder: 601 },
        { id: 'ai-advanced', origin: 'derived', category: 'course', label: 'Advanced AI Features', sublabel: 'AI', icon: '/assets/images/icons/icon-brain.webp', hubHref: '/houses/ai/advanced/index.html', tenantAssignable: true, house: 'ai', sortOrder: 602 },
        { id: 'ai-agents', origin: 'derived', category: 'course', label: 'Agent Architecture', sublabel: 'AI', icon: '/assets/images/icons/icon-brain.webp', hubHref: '/houses/ai/agents/index.html', tenantAssignable: true, house: 'ai', sortOrder: 603 },
        { id: 'ai-automation', origin: 'derived', category: 'course', label: 'N8N and Automation', sublabel: 'AI', icon: '/assets/images/icons/icon-brain.webp', hubHref: '/houses/ai/automation/index.html', tenantAssignable: true, house: 'ai', sortOrder: 604 },
        { id: 'azure-openai', origin: 'derived', category: 'course', label: 'Azure OpenAI Service', sublabel: 'AI', icon: '/assets/images/icons/icon-brain.webp', hubHref: '/houses/ai/azure-openai/index.html', tenantAssignable: true, house: 'ai', sortOrder: 605 },
        { id: 'cli-tools', origin: 'derived', category: 'course', label: 'CLI and Developer Tools', sublabel: 'AI', icon: '/assets/images/icons/icon-brain.webp', hubHref: '/houses/ai/cli-tools/index.html', tenantAssignable: true, house: 'ai', sortOrder: 606 },
        { id: 'adversarial', origin: 'derived', category: 'course', label: 'Adversarial ML', sublabel: 'The Cortex', icon: '/assets/images/icons/icon-brain.webp', hubHref: '/houses/ai/cortex/adversarial/index.html', parent: 'cortex', tenantAssignable: true, house: 'ai', sortOrder: 607 },
        { id: 'cnn', origin: 'derived', category: 'course', label: 'CNNs', sublabel: 'The Cortex', icon: '/assets/images/icons/icon-brain.webp', hubHref: '/houses/ai/cortex/cnn/index.html', parent: 'cortex', tenantAssignable: true, house: 'ai', sortOrder: 608 },
        { id: 'cyber-ml', origin: 'derived', category: 'course', label: 'ML for Cybersecurity', sublabel: 'The Cortex', icon: '/assets/images/icons/icon-brain.webp', hubHref: '/houses/ai/cortex/cyber-ml/index.html', parent: 'cortex', tenantAssignable: true, house: 'ai', sortOrder: 609 },
        { id: 'deep-learning', origin: 'derived', category: 'course', label: 'Deep Learning Fundamentals', sublabel: 'The Cortex', icon: '/assets/images/icons/icon-brain.webp', hubHref: '/houses/ai/cortex/deep-learning/index.html', parent: 'cortex', tenantAssignable: true, house: 'ai', sortOrder: 610 },
        { id: 'cortex-foundations', origin: 'derived', category: 'course', label: 'AI Foundations, History & Ethics', sublabel: 'The Cortex', icon: '/assets/images/icons/icon-brain.webp', hubHref: '/houses/ai/cortex/foundations/index.html', parent: 'cortex', tenantAssignable: true, house: 'ai', sortOrder: 611 },
        { id: 'generative', origin: 'derived', category: 'course', label: 'Generative AI', sublabel: 'The Cortex', icon: '/assets/images/icons/icon-brain.webp', hubHref: '/houses/ai/cortex/generative/index.html', parent: 'cortex', tenantAssignable: true, house: 'ai', sortOrder: 612 },
        { id: 'cortex-math', origin: 'derived', category: 'course', label: 'Mathematics for Machine Learning', sublabel: 'The Cortex', icon: '/assets/images/icons/icon-brain.webp', hubHref: '/houses/ai/cortex/math/index.html', parent: 'cortex', tenantAssignable: true, house: 'ai', sortOrder: 613 },
        { id: 'mlops', origin: 'derived', category: 'course', label: 'MLOps', sublabel: 'The Cortex', icon: '/assets/images/icons/icon-brain.webp', hubHref: '/houses/ai/cortex/mlops/index.html', parent: 'cortex', tenantAssignable: true, house: 'ai', sortOrder: 614 },
        { id: 'nlp', origin: 'derived', category: 'course', label: 'Natural Language Processing', sublabel: 'The Cortex', icon: '/assets/images/icons/icon-brain.webp', hubHref: '/houses/ai/cortex/nlp/index.html', parent: 'cortex', tenantAssignable: true, house: 'ai', sortOrder: 615 },
        { id: 'cortex-rl', origin: 'derived', category: 'course', label: 'Reinforcement Learning', sublabel: 'The Cortex', icon: '/assets/images/icons/icon-brain.webp', hubHref: '/houses/ai/cortex/rl/index.html', parent: 'cortex', tenantAssignable: true, house: 'ai', sortOrder: 616 },
        { id: 'supervised', origin: 'derived', category: 'course', label: 'Supervised Learning', sublabel: 'The Cortex', icon: '/assets/images/icons/icon-brain.webp', hubHref: '/houses/ai/cortex/supervised/index.html', parent: 'cortex', tenantAssignable: true, house: 'ai', sortOrder: 617 },
        { id: 'transformers', origin: 'derived', category: 'course', label: 'RNNs & Transformers', sublabel: 'The Cortex', icon: '/assets/images/icons/icon-brain.webp', hubHref: '/houses/ai/cortex/transformers/index.html', parent: 'cortex', tenantAssignable: true, house: 'ai', sortOrder: 618 },
        { id: 'unsupervised', origin: 'derived', category: 'course', label: 'Unsupervised Learning', sublabel: 'The Cortex', icon: '/assets/images/icons/icon-brain.webp', hubHref: '/houses/ai/cortex/unsupervised/index.html', parent: 'cortex', tenantAssignable: true, house: 'ai', sortOrder: 619 },
        { id: 'api-auth', origin: 'derived', category: 'course', label: 'Authentication & Authorization', sublabel: 'API Security', icon: '/assets/images/icons/icon-keyboard.webp', hubHref: '/houses/cloud/api/auth/index.html', parent: 'api', tenantAssignable: true, house: 'cloud', sortOrder: 620 },
        { id: 'cloud-patterns', origin: 'derived', category: 'course', label: 'Cloud APIs', sublabel: 'API Security', icon: '/assets/images/icons/icon-keyboard.webp', hubHref: '/houses/cloud/api/cloud-patterns/index.html', parent: 'api', tenantAssignable: true, house: 'cloud', sortOrder: 621 },
        { id: 'api-design', origin: 'derived', category: 'course', label: 'API Design & Documentation', sublabel: 'API Security', icon: '/assets/images/icons/icon-keyboard.webp', hubHref: '/houses/cloud/api/design/index.html', parent: 'api', tenantAssignable: true, house: 'cloud', sortOrder: 622 },
        { id: 'event-driven', origin: 'derived', category: 'course', label: 'Webhooks, WebSockets & Event-Driven', sublabel: 'API Security', icon: '/assets/images/icons/icon-keyboard.webp', hubHref: '/houses/cloud/api/event-driven/index.html', parent: 'api', tenantAssignable: true, house: 'cloud', sortOrder: 623 },
        { id: 'owasp', origin: 'derived', category: 'course', label: 'OWASP API Top 10', sublabel: 'API Security', icon: '/assets/images/icons/icon-keyboard.webp', hubHref: '/houses/cloud/api/owasp/index.html', parent: 'api', tenantAssignable: true, house: 'cloud', sortOrder: 624 },
        { id: 'pentest', origin: 'derived', category: 'course', label: 'Hands-On API Penetration Testing', sublabel: 'API Security', icon: '/assets/images/icons/icon-keyboard.webp', hubHref: '/houses/cloud/api/pentest/index.html', parent: 'api', tenantAssignable: true, house: 'cloud', sortOrder: 625 },
        { id: 'rate-limiting', origin: 'derived', category: 'course', label: 'Rate Limiting, Throttling & Caching', sublabel: 'API Security', icon: '/assets/images/icons/icon-keyboard.webp', hubHref: '/houses/cloud/api/rate-limiting/index.html', parent: 'api', tenantAssignable: true, house: 'cloud', sortOrder: 626 },
        { id: 'api-capstone', origin: 'derived', category: 'course', label: 'API Capstone -- Build & Secure a Full API', sublabel: 'API Security', icon: '/assets/images/icons/icon-keyboard.webp', hubHref: '/houses/cloud/api/capstone/index.html', parent: 'api', tenantAssignable: true, house: 'cloud', sortOrder: 627 },
        { id: 'ms-102', origin: 'derived', category: 'cert-prep', catalogCode: 'MS-102', label: 'Microsoft 365 Administrator', sublabel: 'MS-102', icon: '/assets/images/icons/icon-keyboard.webp', hubHref: '/houses/cloud/ms-102/index.html', catalogCategories: ['ms-102'], parent: 'cloud-master', tenantAssignable: true, house: 'cloud', sortOrder: 540 },
        { id: 'ms-900', origin: 'derived', category: 'cert-prep', catalogCode: 'MS-900', label: 'Microsoft 365 Fundamentals', sublabel: 'MS-900', icon: '/assets/images/icons/icon-keyboard.webp', hubHref: '/houses/cloud/ms-900/index.html', catalogCategories: ['ms-900'], parent: 'cloud-master', tenantAssignable: true, house: 'cloud', sortOrder: 360 },
        { id: 'pl-300', origin: 'derived', category: 'cert-prep', catalogCode: 'PL-300', label: 'Power BI Data Analyst', sublabel: 'PL-300', icon: '/assets/images/icons/icon-keyboard.webp', hubHref: '/houses/cloud/pl-300/index.html', catalogCategories: ['pl-300'], parent: 'cloud-master', tenantAssignable: true, house: 'cloud', sortOrder: 550 },
        { id: 'complexity', origin: 'derived', category: 'course', label: 'Big O and Complexity', sublabel: 'Algorithm Chamber', icon: '/assets/images/icons/icon-branch.webp', hubHref: '/houses/code/algorithm-chamber/complexity/index.html', parent: 'algorithm-chamber', tenantAssignable: true, house: 'code', sortOrder: 630 },
        { id: 'data-structures', origin: 'derived', category: 'course', label: 'Data Structures', sublabel: 'Algorithm Chamber', icon: '/assets/images/icons/icon-branch.webp', hubHref: '/houses/code/algorithm-chamber/data-structures/index.html', parent: 'algorithm-chamber', tenantAssignable: true, house: 'code', sortOrder: 631 },
        { id: 'discrete-math', origin: 'derived', category: 'course', label: 'Discrete Mathematics', sublabel: 'Algorithm Chamber', icon: '/assets/images/icons/icon-branch.webp', hubHref: '/houses/code/algorithm-chamber/discrete-math/index.html', parent: 'algorithm-chamber', tenantAssignable: true, house: 'code', sortOrder: 632 },
        { id: 'algorithm-chamber-dp', origin: 'derived', category: 'course', label: 'Divide and Conquer + DP', sublabel: 'Algorithm Chamber', icon: '/assets/images/icons/icon-branch.webp', hubHref: '/houses/code/algorithm-chamber/dp/index.html', parent: 'algorithm-chamber', tenantAssignable: true, house: 'code', sortOrder: 633 },
        { id: 'geometry', origin: 'derived', category: 'course', label: 'Computational Geometry', sublabel: 'Algorithm Chamber', icon: '/assets/images/icons/icon-branch.webp', hubHref: '/houses/code/algorithm-chamber/geometry/index.html', parent: 'algorithm-chamber', tenantAssignable: true, house: 'code', sortOrder: 634 },
        { id: 'graphs', origin: 'derived', category: 'course', label: 'Graph Theory', sublabel: 'Algorithm Chamber', icon: '/assets/images/icons/icon-branch.webp', hubHref: '/houses/code/algorithm-chamber/graphs/index.html', parent: 'algorithm-chamber', tenantAssignable: true, house: 'code', sortOrder: 635 },
        { id: 'greedy', origin: 'derived', category: 'course', label: 'Greedy Algorithms', sublabel: 'Algorithm Chamber', icon: '/assets/images/icons/icon-branch.webp', hubHref: '/houses/code/algorithm-chamber/greedy/index.html', parent: 'algorithm-chamber', tenantAssignable: true, house: 'code', sortOrder: 636 },
        { id: 'sorting', origin: 'derived', category: 'course', label: 'Sorting & Searching', sublabel: 'Algorithm Chamber', icon: '/assets/images/icons/icon-branch.webp', hubHref: '/houses/code/algorithm-chamber/sorting/index.html', parent: 'algorithm-chamber', tenantAssignable: true, house: 'code', sortOrder: 637 },
        { id: 'strings', origin: 'derived', category: 'course', label: 'String Algorithms', sublabel: 'Algorithm Chamber', icon: '/assets/images/icons/icon-branch.webp', hubHref: '/houses/code/algorithm-chamber/strings/index.html', parent: 'algorithm-chamber', tenantAssignable: true, house: 'code', sortOrder: 638 },
        { id: 'assembly', origin: 'derived', category: 'course', label: 'Assembly', sublabel: 'The Code Armory', icon: '/assets/images/icons/icon-code.webp', hubHref: '/houses/code/armory/assembly/index.html', parent: 'code-armory', tenantAssignable: true, house: 'code', sortOrder: 639 },
        { id: 'bash', origin: 'derived', category: 'course', label: 'Bash & Shell Scripting', sublabel: 'The Code Armory', icon: '/assets/images/icons/icon-code.webp', hubHref: '/houses/code/armory/bash/index.html', parent: 'code-armory', tenantAssignable: true, house: 'code', sortOrder: 640 },
        { id: 'armory-c', origin: 'derived', category: 'course', label: 'C Programming', sublabel: 'The Code Armory', icon: '/assets/images/icons/icon-code.webp', hubHref: '/houses/code/armory/c/index.html', parent: 'code-armory', tenantAssignable: true, house: 'code', sortOrder: 641 },
        { id: 'cpp', origin: 'derived', category: 'course', label: 'C++', sublabel: 'The Code Armory', icon: '/assets/images/icons/icon-code.webp', hubHref: '/houses/code/armory/cpp/index.html', parent: 'code-armory', tenantAssignable: true, house: 'code', sortOrder: 642 },
        { id: 'csharp', origin: 'derived', category: 'course', label: 'C# / .NET', sublabel: 'The Code Armory', icon: '/assets/images/icons/icon-code.webp', hubHref: '/houses/code/armory/csharp/index.html', parent: 'code-armory', tenantAssignable: true, house: 'code', sortOrder: 643 },
        { id: 'armory-go', origin: 'derived', category: 'course', label: 'Go', sublabel: 'The Code Armory', icon: '/assets/images/icons/icon-code.webp', hubHref: '/houses/code/armory/go/index.html', parent: 'code-armory', tenantAssignable: true, house: 'code', sortOrder: 644 },
        { id: 'java', origin: 'derived', category: 'course', label: 'Java', sublabel: 'The Code Armory', icon: '/assets/images/icons/icon-code.webp', hubHref: '/houses/code/armory/java/index.html', parent: 'code-armory', tenantAssignable: true, house: 'code', sortOrder: 645 },
        { id: 'javascript', origin: 'derived', category: 'course', label: 'JavaScript & TypeScript', sublabel: 'The Code Armory', icon: '/assets/images/icons/icon-code.webp', hubHref: '/houses/code/armory/javascript/index.html', parent: 'code-armory', tenantAssignable: true, house: 'code', sortOrder: 646 },
        { id: 'lua-perl-r', origin: 'derived', category: 'course', label: 'Lua / Perl / R', sublabel: 'The Code Armory', icon: '/assets/images/icons/icon-code.webp', hubHref: '/houses/code/armory/lua-perl-r/index.html', parent: 'code-armory', tenantAssignable: true, house: 'code', sortOrder: 647 },
        { id: 'php', origin: 'derived', category: 'course', label: 'PHP', sublabel: 'The Code Armory', icon: '/assets/images/icons/icon-code.webp', hubHref: '/houses/code/armory/php/index.html', parent: 'code-armory', tenantAssignable: true, house: 'code', sortOrder: 648 },
        { id: 'powershell', origin: 'derived', category: 'course', label: 'PowerShell', sublabel: 'The Code Armory', icon: '/assets/images/icons/icon-code.webp', hubHref: '/houses/code/armory/powershell/index.html', parent: 'code-armory', tenantAssignable: true, house: 'code', sortOrder: 649 },
        { id: 'armory-python', origin: 'derived', category: 'course', label: 'Python', sublabel: 'The Code Armory', icon: '/assets/images/icons/icon-code.webp', hubHref: '/houses/code/armory/python/index.html', parent: 'code-armory', tenantAssignable: true, house: 'code', sortOrder: 650 },
        { id: 'python-graphics', origin: 'derived', category: 'course', label: 'Python Graphics', sublabel: 'The Code Armory', icon: '/assets/images/icons/icon-code.webp', hubHref: '/houses/code/armory/python-graphics/index.html', parent: 'code-armory', tenantAssignable: true, house: 'code', sortOrder: 651 },
        { id: 'ruby', origin: 'derived', category: 'course', label: 'Ruby', sublabel: 'The Code Armory', icon: '/assets/images/icons/icon-code.webp', hubHref: '/houses/code/armory/ruby/index.html', parent: 'code-armory', tenantAssignable: true, house: 'code', sortOrder: 652 },
        { id: 'rust', origin: 'derived', category: 'course', label: 'Rust', sublabel: 'The Code Armory', icon: '/assets/images/icons/icon-code.webp', hubHref: '/houses/code/armory/rust/index.html', parent: 'code-armory', tenantAssignable: true, house: 'code', sortOrder: 653 },
        { id: 'armory-sql', origin: 'derived', category: 'course', label: 'SQL', sublabel: 'The Code Armory', icon: '/assets/images/icons/icon-code.webp', hubHref: '/houses/code/armory/sql/index.html', parent: 'code-armory', tenantAssignable: true, house: 'code', sortOrder: 654 },
        { id: 'swift-kotlin', origin: 'derived', category: 'course', label: 'Swift / Kotlin', sublabel: 'The Code Armory', icon: '/assets/images/icons/icon-code.webp', hubHref: '/houses/code/armory/swift-kotlin/index.html', parent: 'code-armory', tenantAssignable: true, house: 'code', sortOrder: 655 },
        { id: 'devops', origin: 'derived', category: 'course', label: 'DevOps', sublabel: 'Code', icon: '/assets/images/icons/icon-terminal.webp', hubHref: '/houses/code/devops/index.html', tenantAssignable: true, house: 'code', sortOrder: 656 },
        { id: 'ceh', origin: 'derived', category: 'course', label: 'CEH v12', sublabel: 'The Proving Grounds', icon: '/assets/images/icons/icon-swords.webp', hubHref: '/houses/dark-arts/offensive/ceh/index.html', parent: 'proving-grounds', tenantAssignable: true, house: 'dark-arts', sortOrder: 657 },
        { id: 'intro-computers', origin: 'derived', category: 'course', label: 'First Boot', sublabel: 'The Forge', icon: '/assets/images/icons/icon-wrench.webp', hubHref: '/houses/forge/intro-computers/index.html', tenantAssignable: true, house: 'forge', sortOrder: 658 },
        { id: 'piverse', origin: 'derived', category: 'course', label: 'PiVerse', sublabel: 'Matrix', icon: '/assets/images/icons/icon-terminal.webp', hubHref: '/houses/matrix/piverse/index.html', tenantAssignable: true, house: 'matrix', sortOrder: 659 },
        { id: 'protocore', origin: 'derived', category: 'course', label: 'ProtoCore', sublabel: 'Matrix', icon: '/assets/images/icons/icon-terminal.webp', hubHref: '/houses/matrix/protocore/index.html', tenantAssignable: true, house: 'matrix', sortOrder: 660 },
        { id: 'cmmc', origin: 'derived', category: 'course', label: 'CMMC', sublabel: 'Shield', icon: '/assets/images/icons/icon-shield.webp', hubHref: '/houses/shield/compliance/cmmc/index.html', tenantAssignable: true, house: 'shield', sortOrder: 661 },
        { id: 'ms-security', origin: 'derived', category: 'course', label: 'Microsoft Security-101', sublabel: 'Shield', icon: '/assets/images/icons/icon-shield.webp', hubHref: '/houses/shield/ms-security/index.html', tenantAssignable: true, house: 'shield', sortOrder: 662 },
        { id: 'sc-200', origin: 'derived', category: 'cert-prep', catalogCode: 'SC-200', label: 'Microsoft Security Operations Analyst', sublabel: 'SC-200', icon: '/assets/images/icons/icon-shield.webp', hubHref: '/houses/shield/sc-200/index.html', tenantAssignable: true, house: 'shield', sortOrder: 663 },
        { id: 'sc-900', origin: 'derived', category: 'cert-prep', catalogCode: 'SC-900', label: 'Microsoft Security, Compliance, and Identity Fundamentals', sublabel: 'SC-900', icon: '/assets/images/icons/icon-shield.webp', hubHref: '/houses/shield/sc-900/index.html', tenantAssignable: true, house: 'shield', sortOrder: 664 },
        { id: 'security-101', origin: 'derived', category: 'course', label: 'Security 101', sublabel: 'Shield', icon: '/assets/images/icons/icon-shield.webp', hubHref: '/houses/shield/security-101/index.html', tenantAssignable: true, house: 'shield', sortOrder: 665 },
        { id: 'bgp', origin: 'derived', category: 'course', label: 'BGP', sublabel: 'The Backbone', icon: '/assets/images/icons/icon-network.webp', hubHref: '/houses/web/backbone/bgp/index.html', parent: 'backbone', tenantAssignable: true, house: 'web', sortOrder: 666 },
        { id: 'carrier', origin: 'derived', category: 'course', label: '5G & Carrier Networks', sublabel: 'The Backbone', icon: '/assets/images/icons/icon-network.webp', hubHref: '/houses/web/backbone/carrier/index.html', parent: 'backbone', tenantAssignable: true, house: 'web', sortOrder: 667 },
        { id: 'datacenter', origin: 'derived', category: 'course', label: 'Data Center Networking', sublabel: 'The Backbone', icon: '/assets/images/icons/icon-network.webp', hubHref: '/houses/web/backbone/datacenter/index.html', parent: 'backbone', tenantAssignable: true, house: 'web', sortOrder: 668 },
        { id: 'backbone-forensics', origin: 'derived', category: 'course', label: 'Network Forensics', sublabel: 'The Backbone', icon: '/assets/images/icons/icon-network.webp', hubHref: '/houses/web/backbone/forensics/index.html', parent: 'backbone', tenantAssignable: true, house: 'web', sortOrder: 669 },
        { id: 'infiniband', origin: 'derived', category: 'course', label: 'InfiniBand & RDMA', sublabel: 'The Backbone', icon: '/assets/images/icons/icon-network.webp', hubHref: '/houses/web/backbone/infiniband/index.html', parent: 'backbone', tenantAssignable: true, house: 'web', sortOrder: 670 },
        { id: 'ipv6', origin: 'derived', category: 'course', label: 'Advanced IPv6', sublabel: 'The Backbone', icon: '/assets/images/icons/icon-network.webp', hubHref: '/houses/web/backbone/ipv6/index.html', parent: 'backbone', tenantAssignable: true, house: 'web', sortOrder: 671 },
        { id: 'mpls', origin: 'derived', category: 'course', label: 'MPLS & Service Provider Technologies', sublabel: 'The Backbone', icon: '/assets/images/icons/icon-network.webp', hubHref: '/houses/web/backbone/mpls/index.html', parent: 'backbone', tenantAssignable: true, house: 'web', sortOrder: 672 },
        { id: 'netsec', origin: 'derived', category: 'course', label: 'Network Security Architecture', sublabel: 'The Backbone', icon: '/assets/images/icons/icon-network.webp', hubHref: '/houses/web/backbone/netsec/index.html', parent: 'backbone', tenantAssignable: true, house: 'web', sortOrder: 673 },
        { id: 'optical', origin: 'derived', category: 'course', label: 'Optical Networking', sublabel: 'The Backbone', icon: '/assets/images/icons/icon-network.webp', hubHref: '/houses/web/backbone/optical/index.html', parent: 'backbone', tenantAssignable: true, house: 'web', sortOrder: 674 },
        { id: 'qos', origin: 'derived', category: 'course', label: 'QoS', sublabel: 'The Backbone', icon: '/assets/images/icons/icon-network.webp', hubHref: '/houses/web/backbone/qos/index.html', parent: 'backbone', tenantAssignable: true, house: 'web', sortOrder: 675 },
        { id: 'routing', origin: 'derived', category: 'course', label: 'Advanced Routing', sublabel: 'The Backbone', icon: '/assets/images/icons/icon-network.webp', hubHref: '/houses/web/backbone/routing/index.html', parent: 'backbone', tenantAssignable: true, house: 'web', sortOrder: 676 },
        { id: 'sdn', origin: 'derived', category: 'course', label: 'Software-Defined Networking', sublabel: 'The Backbone', icon: '/assets/images/icons/icon-network.webp', hubHref: '/houses/web/backbone/sdn/index.html', parent: 'backbone', tenantAssignable: true, house: 'web', sortOrder: 677 },
        { id: 'sdwan', origin: 'derived', category: 'course', label: 'Advanced SD-WAN', sublabel: 'The Backbone', icon: '/assets/images/icons/icon-network.webp', hubHref: '/houses/web/backbone/sdwan/index.html', parent: 'backbone', tenantAssignable: true, house: 'web', sortOrder: 678 },
        { id: 'wireless', origin: 'derived', category: 'course', label: 'Advanced Wireless', sublabel: 'The Backbone', icon: '/assets/images/icons/icon-network.webp', hubHref: '/houses/web/backbone/wireless/index.html', parent: 'backbone', tenantAssignable: true, house: 'web', sortOrder: 679 },
        { id: 'wifi-arsenal', origin: 'derived', category: 'course', label: 'WiFi Arsenal', sublabel: 'The Vault', icon: '/assets/images/icons/icon-spider.webp', hubHref: '/dark-arts/vault/wifi-arsenal/index.html', parent: 'vault', tenantAssignable: true, house: 'dark-arts', sortOrder: 680 },
        { id: 'toolkit', origin: 'derived', category: 'course', label: 'The Signal Toolkit: Essential Software', sublabel: 'Signal', icon: '/assets/images/icons/icon-signal.webp', hubHref: '/signal/toolkit/index.html', parent: 'signal', tenantAssignable: true, house: 'forge', sortOrder: 681 },
        { id: 'eye-cysa', origin: 'derived', category: 'cert-prep', catalogCode: 'CS0-003', label: 'CompTIA CySA+', sublabel: 'CS0-003', icon: '/assets/images/icons/icon-radar.webp', hubHref: '/houses/eye/cysa/index.html', tenantAssignable: true, house: 'eye', sortOrder: 690 },
        { id: 'web-ccna', origin: 'derived', category: 'cert-prep', catalogCode: '200-301', label: 'Cisco CCNA', sublabel: '200-301', icon: '/assets/images/icons/icon-network.webp', hubHref: '/houses/web/ccna/index.html', tenantAssignable: true, house: 'web', sortOrder: 700 },
    ];

    function _filter(predicate) {
        return HUBS.filter(predicate);
    }

    function _byId(id) {
        for (var i = 0; i < HUBS.length; i++) {
            if (HUBS[i].id === id) return HUBS[i];
        }
        return null;
    }

    var HubRegistry = {
        all: function () { return HUBS.slice(); },
        byId: _byId,
        assignable: function () { return _filter(function (h) { return h.tenantAssignable === true; }); },
        courses: function () { return _filter(function (h) { return h.category === 'course' && h.tenantAssignable; }); },
        platformHubs: function () { return _filter(function (h) { return h.category === 'platform-hub' && h.tenantAssignable; }); },
        sorted: function (filterFn) {
            var arr = filterFn ? _filter(filterFn) : HUBS.slice();
            return arr.sort(function (a, b) {
                return (a.sortOrder || 999) - (b.sortOrder || 999);
            });
        },
        // A house page's projection of its owned hubs (north-star step 1). Returns TOP-LEVEL
        // hubs only: entries with a `parent` are container members and render inside their
        // container's page, not as sibling cartridges ("Container grouping" ruling); entries
        // with status 'workshop' are quarantined and render only behind the admin barricade.
        byHouse: function (houseId) {
            return HubRegistry.sorted(function (h) {
                return h.house === houseId && !h.parent && h.status !== 'workshop';
            });
        },
        // ── Dynamic (Firestore-backed) hubs, task #225 ──────────────
        // Merges admin-created hubs from the `hubRegistry` Firestore collection with the static
        // 19+ above. Firestore is HubRegistry's PERSISTENCE LAYER for browser-created hubs, not a
        // competing registry, same schema, doc-id == hub id. Async because it reads Firestore.
        //
        // opts = {
        //   db,                       // Firestore db handle
        //   firestore,                // { collection, query, where, getDocs } (modular SDK)
        //   isAdmin,                  // bool, admins list unconstrained; non-admins are forced
        //                             //        to where('status','==','published') so the rules
        //                             //        `list` gate is satisfiable (see firestore.rules
        //                             //        hubRegistry block). A non-admin unconstrained list
        //                             //        would be DENIED WHOLESALE by Firestore.
        //   onError                   // optional (err) => void
        // }
        //
        // Guarantees (both adversarial-review, Nancy R2):
        //  #4 status-normalization, every STATIC entry lacks a `status` field; it is defaulted to
        //     'published' here so a consumer doing `if (h.status !== 'published') hide()` over the
        //     merged array never hides the 19+ real courses.
        //  #5 STATIC WINS, a static id ALWAYS overrides a same-id dynamic doc, so a stray/typo'd
        //     Firestore doc can never shadow a live hardcoded course at read time (defense-in-depth
        //     with the rules-level reserved-id rejection on create).
        //
        // NEVER THROWS: a registry read must not break a consumer page. On any Firestore error
        // (offline, rules deny, missing context) it falls back to the static-only list.
        allWithDynamic: function (opts) {
            opts = opts || {};
            var normalizedStatic = HUBS.map(function (h) {
                return h.status ? h : Object.assign({}, h, { status: 'published' });
            });
            if (!opts.db || !opts.firestore || typeof opts.firestore.getDocs !== 'function') {
                // No Firestore context, static-only baseline (also the SSR/offline path).
                return Promise.resolve(normalizedStatic.slice());
            }
            var fs = opts.firestore;
            var col;
            try {
                col = fs.collection(opts.db, 'hubRegistry');
            } catch (e) {
                if (opts.onError) { opts.onError(e); }
                return Promise.resolve(normalizedStatic.slice());
            }
            var q = opts.isAdmin ? col : fs.query(col, fs.where('status', '==', 'published'));
            return Promise.resolve(fs.getDocs(q)).then(function (snap) {
                var dynamic = [];
                snap.forEach(function (d) {
                    var data = d.data() || {};
                    data.id = d.id; // doc id is authoritative for the hub id
                    dynamic.push(data);
                });
                var staticIds = {};
                normalizedStatic.forEach(function (h) { staticIds[h.id] = true; });
                // STATIC WINS: drop any dynamic doc colliding with a static id, then append static.
                return dynamic.filter(function (d) { return !staticIds[d.id]; }).concat(normalizedStatic);
            }, function (err) {
                if (opts.onError) { opts.onError(err); }
                return normalizedStatic.slice();
            });
        },
        // Adapter functions for the 5 dashboard COURSE_MAP shapes (Phase 3
        // refactor uses these so existing dashboard read-side code is
        // unchanged). Each adapter takes (hub, routingFn) and returns the
        // entry in the consumer's expected shape. routingFn(h) returns the
        // href, consumers pass `() => '/lobby.html'` for tenant-dashboard
        // routing, or `h => h.hubHref` for direct hub navigation (lobby).
        adapters: {
            // Used by lobby.html (3-field shape, label includes catalog code)
            nameOnly: function (h, routingFn) {
                return {
                    name: h.catalogCode ? h.label + ' ' + h.catalogCode : h.label,
                    icon: h.icon,
                    href: routingFn(h)
                };
            },
            // Used by 5 dashboards: academy, minimalist, nightshift, campus, federal
            nameDesc: function (h, routingFn) {
                return { name: h.label, desc: h.sublabel, icon: h.icon, href: routingFn(h) };
            },
            // Used by 3 dashboards: clean-ops, tactical-hud, tenant/index
            titleDesc: function (h, routingFn) {
                return { title: h.label, desc: h.sublabel, icon: h.icon, href: routingFn(h) };
            },
            // Used by command-center
            titleSub: function (h, routingFn) {
                return { title: h.label, sub: h.sublabel, icon: h.icon, href: routingFn(h) };
            },
            // Used by enterprise COURSE_MAP
            nameSub: function (h, routingFn) {
                return { name: h.label, sub: h.sublabel, icon: h.icon, href: routingFn(h) };
            },
            // Used by enterprise NAV_COURSE_MAP
            labelOnly: function (h, routingFn) {
                return { label: h.label, icon: h.icon, href: routingFn(h) };
            }
        }
    };

    if (typeof root !== 'undefined') {
        root.HubRegistry = HubRegistry;
    }
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = HubRegistry;
    }
})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
