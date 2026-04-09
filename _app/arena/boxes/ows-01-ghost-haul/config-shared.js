/* ═══════════════════════════════════════════════════════════════════
   OWS-01: Operation Ghost Haul — Shared Configuration
   TMS Credential Theft — Freight Schedule Exfiltration
   ═══════════════════════════════════════════════════════════════════ */

const GhostHaulConfig = {
    id: 'ows-01-ghost-haul',
    title: 'OPERATION GHOST HAUL',
    storageKey: 'hexworth_ows01',
    registryId: 'ows-01-ghost-haul',
    startScore: 1000,
    clockStart: 7,
    clockRatio: 60,
    accentColor: '#f97316',
    minConnectionsToSubmit: 5,

    devices: ['tms', 'email', 'iam', 'network', 'gps'],

    pages: [
        { id: 'hub',     label: 'Hub',      href: 'index.html' },
        { id: 'tms',     label: 'TMS',       href: 'tms.html' },
        { id: 'email',   label: 'Email',     href: 'email.html' },
        { id: 'iam',     label: 'IAM',       href: 'iam.html' },
        { id: 'network', label: 'Network',   href: 'network.html' },
        { id: 'gps',     label: 'GPS/Fleet', href: 'gps.html' },
        { id: 'caseboard', label: 'CaseBoard', href: 'caseboard.html' }
    ],

    evidence: {
        'tms-electronics-query': { title: 'TMS: Targeted Electronics Load Queries', detail: 'Tor sessions queried ONLY electronics loads >$50K with pickup within 48 hours. 7 queries matched 7 stolen loads.', source: 'tms', category: 'digital' },
        'tms-bol-downloads':     { title: 'TMS: 7 BOL PDFs Downloaded', detail: '7 Bill of Lading documents downloaded during Tor sessions \u2014 one for each stolen load. BOLs contain pickup location, time, carrier, driver name.', source: 'tms', category: 'digital' },
        'em-phishing':           { title: 'Email: Phishing Email (fc-update.com)', detail: 'Dispatcher t.williams received phishing email from fleetcommand-support@fc-update.com (typosquat) on Feb 15. Clicked credential harvesting link.', source: 'email', category: 'digital' },
        'em-mfa-request':        { title: 'Email: MFA Removal Request', detail: 'MFA removal request sent FROM the compromised t.williams account to IT admin j.martinez on Feb 16. Admin complied without verification.', source: 'email', category: 'digital' },
        'em-password-reset':     { title: 'Email: Password Reset 4 Hours After Phish', detail: 'Password reset confirmation for t.williams at 20:12 on Feb 15 \u2014 4 hours after phishing click at 16:08.', source: 'email', category: 'digital' },
        'iam-tor-sessions':      { title: 'IAM: Tor Exit Node Sessions', detail: 'Account dispatch-t.williams logged in from IP 185.220.101.xx (Tor) on 7 dates matching theft dates. Always 02:00-04:00 AM.', source: 'iam', category: 'digital' },
        'iam-mfa-disabled':      { title: 'IAM: MFA Disabled by Admin', detail: 'MFA disabled for t.williams by admin-j.martinez on Feb 16 at 09:15. Request came from compromised email.', source: 'iam', category: 'digital' },
        'iam-dual-sessions':     { title: 'IAM: Simultaneous Sessions', detail: 'Account t.williams active from 2 IPs simultaneously on 3 occasions: legitimate home IP + Tor exit node.', source: 'iam', category: 'digital' },
        'net-tor-traffic':       { title: 'Network: Tor Traffic to TMS', detail: 'VPN logs show t.williams sessions from Tor exit nodes. Data transfer: TMS queries + BOL PDF downloads only.', source: 'network', category: 'digital' },
        'gps-impostor-timing':   { title: 'GPS: Impostor Arrived Before Real Carrier', detail: 'For all 7 stolen loads, a vehicle matching the carrier description arrived at pickup 15-30 minutes BEFORE the real carrier.', source: 'gps', category: 'physical' },
        'gps-theft-correlation': { title: 'GPS: 7 Thefts Match 7 Tor Sessions', detail: 'Each of the 7 theft dates matches a Tor login session the night before. The attacker queried the load, downloaded the BOL, and sent an impostor the next day.', source: 'gps', category: 'digital' },

        'rh-williams-clean':    { title: 'T. Williams \u2014 Not the Insider', detail: 'T. Williams is a victim of credential theft. She was at home asleep during the Tor sessions. Her legitimate login IP is a residential Comcast address.', source: 'iam', category: 'people', isRedHerring: true },
        'rh-internal-theory':   { title: 'Internal Conspiracy Theory', detail: 'Initial suspicion that a warehouse worker was tipping off thieves. But warehouse staff have no access to TMS or BOL data.', source: 'tms', category: 'people', isRedHerring: true }
    },

    connections: [
        { id: 'conn-phishing', label: 'Phishing Led to Credential Theft', from: 'em-phishing', to: 'em-password-reset' },
        { id: 'conn-mfa', label: 'MFA Removed via Compromised Email', from: 'em-mfa-request', to: 'iam-mfa-disabled' },
        { id: 'conn-tor', label: 'Tor Sessions Targeted Electronics Loads', from: 'iam-tor-sessions', to: 'tms-electronics-query' },
        { id: 'conn-bol', label: 'BOL Downloads Match Stolen Loads', from: 'tms-bol-downloads', to: 'gps-theft-correlation' },
        { id: 'conn-dual', label: 'Simultaneous Sessions Prove External Access', from: 'iam-dual-sessions', to: 'net-tor-traffic' },
        { id: 'conn-timing', label: 'Impostor Arrived Before Real Carrier', from: 'gps-impostor-timing', to: 'tms-electronics-query' },
        { id: 'conn-timeline', label: '7 Thefts Match 7 Tor Session Dates', from: 'gps-theft-correlation', to: 'iam-tor-sessions' }
    ],

    // Flags server-side only (Firestore flag_registry/ows-01-ghost-haul)
    flagConnections: {
        'conn-phishing': 'vector',
        'conn-tor': 'account',
        'conn-bol': 'method'
    },

    scoring: { pinEvidence: 15, pinRedHerring: -5, recoverFile: 10, connection: 25, hintPenalty: -30, wrongAnswer: -50, correctAnswer: 200 },

    triggers: {
        threats: [
            { id: 'threat-1', minGameHours: 10, from: 'UNKNOWN', text: 'Another load just got picked up by the wrong driver. Your investigation is too slow. They\'re still active.', condition: function(s) { return s.pinnedEvidence.length >= 4; } }
        ],
        tips: [
            { id: 'tip-1', minGameHours: 3, from: 'SYSTEM', text: 'Tip: Check the IAM console for login anomalies. Look at IP addresses and timestamps.', condition: function(s) { return s.openedFiles.length >= 3; } },
            { id: 'tip-2', minGameHours: 8, from: 'SYSTEM', text: 'Tip: The phishing email and the MFA removal happened within 24 hours. That\'s the attack chain.', condition: function(s) { return s.pinnedEvidence.length >= 5; } }
        ],
        handler: [
            { id: 'handler-1', minGameHours: 1, from: 'VP LOGISTICS', text: 'Analyst \u2014 7 high-value electronics loads stolen in 3 weeks. Every time, someone shows up with the correct BOL, MC number, and driver name. The real carriers arrive to find the loads gone. Someone is inside our TMS. Find out how they got in and stop the bleeding.', condition: function() { return true; } }
        ],
        surveillance: []
    }
};
