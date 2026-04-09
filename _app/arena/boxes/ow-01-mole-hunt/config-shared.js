/* ═══════════════════════════════════════════════════════════════════
   OW-01: Operation Mole Hunt — Shared Configuration
   Loaded by every device page to initialize OpenWorldEngine
   with consistent evidence catalog, connections, triggers, and scoring.
   ═══════════════════════════════════════════════════════════════════ */

const MoleHuntConfig = {
    id: 'ow-01-mole-hunt',
    title: 'OPERATION MOLE HUNT',
    storageKey: 'hexworth_ow01',
    registryId: 'ow-01-mole-hunt',
    startScore: 1000,
    clockStart: 8,
    clockRatio: 60,
    accentColor: '#dc2626',
    minConnectionsToSubmit: 5,

    devices: ['workstation', 'email', 'badge', 'siem', 'hr'],

    pages: [
        { id: 'hub',         label: 'Hub',         href: 'index.html' },
        { id: 'workstation', label: 'Workstation',  href: 'workstation.html' },
        { id: 'email',       label: 'Email',        href: 'email.html' },
        { id: 'badge',       label: 'Badge Logs',   href: 'badge.html' },
        { id: 'siem',        label: 'SIEM',         href: 'siem.html' },
        { id: 'hr',          label: 'HR Records',   href: 'hr.html' },
        { id: 'caseboard',   label: 'CaseBoard',    href: 'caseboard.html' }
    ],

    evidence: {
        'ws-usb-log':      { title: 'USB Insertion Log', detail: 'SanDisk 64GB inserted at 23:42 on Mar 12. 40GB copied. User session: eng-sarah-chen.', source: 'workstation', category: 'digital' },
        'ws-browser-hist':  { title: 'Browser History \u2014 Dropbox', detail: 'Three uploads to personal Dropbox between 23:50-00:15.', source: 'workstation', category: 'digital' },
        'ws-resign-draft':  { title: 'Resignation Letter Draft', detail: 'Unsent draft: "After being passed over for the senior architect position for the third time..."', source: 'workstation', category: 'documents' },
        'ws-job-offers':    { title: 'Competitor Job Offers', detail: 'Offers from Apex Defense ($195K) and NovaTech ($188K). Both dated late February.', source: 'workstation', category: 'documents' },
        'ws-ts-mismatch':   { title: 'Browser Timestamp Anomaly', detail: 'Browser entries at 23:30-00:30 but Windows session ended at 18:12. Timestamps were injected.', source: 'workstation', category: 'digital' },
        'ws-deleted-batch': { title: '[RECOVERED] Batch Script', detail: 'inject_history.bat \u2014 inserts fake browser history entries into Chrome SQLite database.', source: 'workstation', category: 'digital' },
        'em-perf-review':   { title: 'Performance Review Chain', detail: 'Sarah rated "Exceeds" for 3 years. No disciplinary issues. Manager recommended promotion.', source: 'email', category: 'documents' },
        'em-access-req':    { title: 'After-Hours Access Request', detail: 'Server room request submitted FROM David\'s workstation at 16:45.', source: 'email', category: 'digital' },
        'em-personal-fwd':  { title: 'Forwarded to Personal Email', detail: 'Emails forwarded to sarah.chen.personal@gmail.com at 23:55. But Sarah\'s VPN ended at 18:12.', source: 'email', category: 'digital' },
        'em-david-coded':   { title: 'David Park \u2014 Coded Messages', detail: '"The garden is ready for harvest. Package weighs about 40kg. Pick up arranged for Thursday."', source: 'email', category: 'communications' },
        'em-david-crypto':  { title: 'David Park \u2014 Crypto Wallet', detail: 'MetaMask seed phrase recovery. Wallet 0x7a3f... received 2.4 ETH ($8,400) on Mar 15.', source: 'email', category: 'financial' },
        'em-sarah-clean':   { title: 'Sarah\'s Sent Folder \u2014 Clean', detail: 'Normal work correspondence. No personal forwards, no unusual attachments in 90 days.', source: 'email', category: 'documents' },
        'bd-sarah-clone':   { title: 'Sarah\'s Badge \u2014 Server Room', detail: 'Badge MRD-1001 swiped at SERVER-ROOM-01 at 23:30 on Mar 12. But car exited at 18:15.', source: 'badge', category: 'physical' },
        'bd-parking-exit':  { title: 'Parking Garage \u2014 Sarah', detail: 'Vehicle exited garage at 18:15 on Mar 12. Did not return that evening.', source: 'badge', category: 'physical' },
        'bd-david-late':    { title: 'David Park \u2014 Late Hours', detail: 'After-hours access 14 times in past month. Enters 21:00-22:00, exits 01:00-02:00.', source: 'badge', category: 'physical' },
        'bd-visitor-log':   { title: 'Visitor Log \u2014 "Victor Park"', detail: 'David\'s "cousin" visited Feb 20 and Mar 5. Badge photo matches known espionage broker.', source: 'badge', category: 'people' },
        'bd-david-server':  { title: 'David \u2014 No Server Room Access', detail: 'David\'s badge has never swiped at SERVER-ROOM-01.', source: 'badge', category: 'physical' },
        'si-dlp-alert':     { title: 'DLP Alert \u2014 40GB USB Copy', detail: 'DLP-2026-0312: 40GB copied to USB on WS-ENG-042 (Sarah\'s machine) at 23:47.', source: 'siem', category: 'digital' },
        'si-dns-tunnel':    { title: 'DNS Tunneling \u2014 David\'s WS', detail: 'IDS Alert: DNS tunneling from WS-ENG-078 (David Park) to ns1.apex-consult.xyz. 14 days. ~38GB exfiltrated.', source: 'siem', category: 'digital' },
        'si-dns-domain':    { title: 'DNS Tunnel Domain Analysis', detail: 'ns1.apex-consult.xyz registered Feb 25 via PrivacyGuard proxy. Not a real Apex Defense domain.', source: 'siem', category: 'digital' },
        'si-login-sarah':   { title: 'Login Events \u2014 Sarah Chen', detail: 'Last login: 08:01. Last logoff: 18:12. No logins between 18:12 and USB event at 23:47.', source: 'siem', category: 'digital' },
        'si-usb-decoy':     { title: 'USB Contents Analysis', detail: 'USB contained 40GB of public marketing materials, stock photos, press releases. No classified data.', source: 'siem', category: 'digital' },
        'si-rdp-david':     { title: 'RDP Session \u2014 David to Sarah WS', detail: 'RDP from WS-ENG-078 (David) to WS-ENG-042 (Sarah) at 23:25. Session lasted 52 minutes.', source: 'siem', category: 'digital' },
        'hr-sarah-record':  { title: 'Sarah Chen \u2014 HR File', detail: 'Hired 2019. 3x "Exceeds Expectations." No disciplinary record. Recommended for promotion twice.', source: 'hr', category: 'people' },
        'hr-david-record':  { title: 'David Park \u2014 HR File', detail: 'Hired 2020. "Meets Expectations" x3. Transfer requests denied. New emergency contact Feb 22.', source: 'hr', category: 'people' },
        'hr-david-contact': { title: 'David \u2014 New Emergency Contact', detail: '"Victor Park (cousin)" \u2014 phone 555-0147 is a prepaid burner.', source: 'hr', category: 'people' },
        'hr-david-pto':     { title: 'David Park \u2014 PTO Pattern', detail: 'PTO on Feb 21 (day after Victor visit #1) and Mar 6 (day after visit #2).', source: 'hr', category: 'people' },
        'hr-salary-david':  { title: 'David Park \u2014 Salary/Benefits', detail: 'Salary $128K. Added supplemental life insurance Mar 1. Beneficiary: "V. Park."', source: 'hr', category: 'financial' },
        'rh-sarah-frustration': { title: 'Sarah\'s Frustration', detail: 'Vented about being passed over. But frustration is not evidence of espionage.', source: 'hr', category: 'people', isRedHerring: true },
        'rh-vpn-usage':     { title: 'Sarah \u2014 VPN After Hours', detail: 'Used VPN 8 times \u2014 all for legitimate code reviews (verified by Git commits).', source: 'siem', category: 'digital', isRedHerring: true },
        'rh-david-gaming':  { title: 'David \u2014 After Hours Gaming', detail: 'Steam running after hours 6 times. Policy violation, not espionage.', source: 'siem', category: 'digital', isRedHerring: true }
    },

    connections: [
        { id: 'conn-badge-clone', label: 'Badge Clone: Sarah\'s badge used while her car was gone', from: 'bd-sarah-clone', to: 'bd-parking-exit' },
        { id: 'conn-dns-source', label: 'DNS Tunnel Source: David\'s workstation, not Sarah\'s', from: 'si-dns-tunnel', to: 'si-dlp-alert' },
        { id: 'conn-visitor-broker', label: 'Visitor Match: David\'s "cousin" = espionage broker', from: 'bd-visitor-log', to: 'hr-david-contact' },
        { id: 'conn-timeline', label: 'Timeline: DNS tunneling started 2 weeks before USB copy', from: 'si-dns-tunnel', to: 'si-rdp-david' },
        { id: 'conn-payment', label: 'Financial: David\'s crypto wallet received payment after exfil', from: 'em-david-crypto', to: 'si-dns-tunnel' },
        { id: 'conn-planted', label: 'Planted Evidence: Browser history injected on Sarah\'s machine', from: 'ws-ts-mismatch', to: 'ws-deleted-batch' },
        { id: 'conn-real-payload', label: 'Real Payload: DNS tunnel carried data, USB was dummy', from: 'si-usb-decoy', to: 'si-dns-tunnel' }
    ],

    scoring: {
        pinEvidence: 15,
        pinRedHerring: -5,
        recoverFile: 10,
        connection: 25,
        hintPenalty: -30,
        wrongAnswer: -50,
        correctAnswer: 200
    },

    // Flags are server-side only (Firestore flag_registry/ow-01-mole-hunt)
    // Flag IDs mapped to connections that reveal them:
    flagConnections: {
        'conn-dns-source': 'insider',     // Confirms David is the insider -> FLAG 1
        'conn-real-payload': 'exfil',     // Confirms DNS tunnel is the method -> FLAG 2
        'conn-visitor-broker': 'handler'  // Confirms Victor is the handler -> FLAG 3
    },

    triggers: {
        threats: [
            { id: 'threat-1', minGameHours: 8, from: 'BLOCKED NUMBER', text: 'You\'re digging in the wrong direction. Sarah Chen is your insider. Close the case.', condition: function(s) { return s.openedFiles.length >= 5; } },
            { id: 'threat-2', minGameHours: 16, from: 'UNKNOWN', text: 'We know what you\'re finding. David\'s workstation is being wiped remotely. Act fast.', condition: function(s) { return s.connections.length >= 3; }, onFire: function(engine) { engine.startRemoteWipe('workstation', 0.167); } },
            { id: 'threat-3', minGameHours: 24, from: 'BLOCKED NUMBER', text: 'Last chance. Drop the DNS angle or the next investigation will be about you.', condition: function(s) { return s.connections.length >= 5; } }
        ],
        tips: [
            { id: 'tip-1', minGameHours: 2, from: 'SYSTEM', text: 'Tip: Check the parking garage logs alongside the badge access records. Timing is everything.', condition: function(s) { return s.openedFiles.length >= 3; } },
            { id: 'tip-2', minGameHours: 10, from: 'SYSTEM', text: 'Tip: The DLP alert triggered on Sarah\'s workstation. But who was logged in? Check the SIEM login events.', condition: function(s) { return s.pinnedEvidence.length >= 4 && s.connections.length < 3; } },
            { id: 'tip-3', minGameHours: 20, from: 'SYSTEM', text: 'Tip: Compare the USB contents with the DNS tunnel data volume. 40GB marketing vs 38GB via DNS. Which carried the real payload?', condition: function(s) { return s.connections.length >= 4 && s.connections.length < 7; } }
        ],
        handler: [
            { id: 'handler-1', minGameHours: 1, from: 'CISO WILLIAMS', text: 'Analyst \u2014 welcome. Sarah Chen\'s DLP alert triggered this review, but follow the evidence, not the assumption. All systems are available.', condition: function() { return true; } },
            { id: 'handler-2', minGameHours: 6, from: 'CISO WILLIAMS', text: 'Board wants Sarah terminated by end of day. I told them we need to be thorough. Don\'t let me down.', condition: function(s) { return s.openedFiles.length >= 5; } },
            { id: 'handler-3', minGameHours: 14, from: 'CISO WILLIAMS', text: 'Legal says Sarah\'s lawyer is filing wrongful termination if we act without evidence. If she\'s innocent, prove it \u2014 and find who IS responsible.', condition: function(s) { return s.pinnedEvidence.length >= 6; } },
            { id: 'handler-4', minGameHours: 22, from: 'CISO WILLIAMS', text: 'The DNS tunneling finding changes everything. If David is the real insider, get me the full picture. Who was his handler? How did the money flow?', condition: function(s) { return s.connections.length >= 4; } }
        ],
        surveillance: [
            { id: 'surv-1', minGameHours: 6, effect: 'network_spike', condition: function(s) { return s.openedFiles.length >= 3; } },
            { id: 'surv-2', minGameHours: 12, effect: 'screen_glitch', condition: function(s) { return s.pinnedEvidence.length >= 5; } },
            { id: 'surv-3', minGameHours: 18, effect: 'data_wipe', condition: function(s) { return s.connections.length >= 4; } }
        ]
    }
};
