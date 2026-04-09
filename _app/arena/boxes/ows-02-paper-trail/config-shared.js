/* ═══════════════════════════════════════════════════════════════════
   OWS-02: Operation Paper Trail — Shared Configuration
   Broker Email Compromise — Phantom Carrier Scheme
   ═══════════════════════════════════════════════════════════════════ */

const PaperTrailConfig = {
    id: 'ows-02-paper-trail',
    title: 'OPERATION PAPER TRAIL',
    storageKey: 'hexworth_ows02',
    registryId: 'ows-02-paper-trail',
    startScore: 1000,
    clockStart: 8,
    clockRatio: 60,
    accentColor: '#eab308',
    minConnectionsToSubmit: 6,

    devices: ['email', 'carrier', 'loadboard', 'financial', 'docs'],

    pages: [
        { id: 'hub',       label: 'Hub',        href: 'index.html' },
        { id: 'email',     label: 'Email',      href: 'email.html' },
        { id: 'carrier',   label: 'Carriers',   href: 'carrier.html' },
        { id: 'loadboard', label: 'Load Board', href: 'loadboard.html' },
        { id: 'financial', label: 'Accounting', href: 'financial.html' },
        { id: 'docs',      label: 'Documents',  href: 'docs.html' },
        { id: 'caseboard', label: 'CaseBoard',  href: 'caseboard.html' }
    ],

    evidence: {
        'em-inbox-rule':     { title: 'Email: Auto-Forward Rule', detail: 'Inbox rule forwards all emails containing "load tender" or "rate confirmation" to m.reeves.backup@proton.me. Created Feb 1.', source: 'email', category: 'digital' },
        'em-romania-login':  { title: 'Email: Romanian IP Login', detail: 'Login from 185.220.xx.xx (Romania) on Jan 30 \u2014 2 days before forwarding rule appeared.', source: 'email', category: 'digital' },
        'em-forward-timing': { title: 'Email: Phantom Got Tenders First', detail: 'Rate confirmations forwarded to Atlas Express 10-30 min BEFORE Summit dispatcher sent them to the real carrier.', source: 'email', category: 'digital' },
        'cr-atlas-clone':    { title: 'Carrier: Atlas Express MC Cloned', detail: 'Atlas Express LLC (MC-1247832) \u2014 MC number cloned from defunct Atlas Freight Inc (revoked 2024). Same number, different entity.', source: 'carrier', category: 'digital' },
        'cr-fake-insurance':  { title: 'Carrier: Forged Insurance ACORD', detail: 'Insurance cert for Atlas Express has forged ACORD form. Phone number on cert goes to VoIP service, not the listed insurer.', source: 'carrier', category: 'documents' },
        'cr-atlas-registered': { title: 'Carrier: Atlas Express \u2014 45 Days Old', detail: 'Atlas Express registered 45 days ago. 1 truck. No safety record. Registered agent: S. Volkov (Tampa, FL).', source: 'carrier', category: 'digital' },
        'lb-zero-bids':      { title: 'Load Board: Atlas Express Zero Market Activity', detail: 'Atlas Express placed 0 bids on DAT/Truckstop. All 12 loads came directly via the compromised email forward.', source: 'loadboard', category: 'digital' },
        'fn-bank-account':   { title: 'Financial: Bank Account Opened Jan 28', detail: 'All 12 payments to Atlas Express went to Wells Fargo account opened Jan 28 \u2014 2 days before the email compromise.', source: 'financial', category: 'financial' },
        'fn-factoring':      { title: 'Financial: Same Factoring Company', detail: 'Atlas Express assigned all invoices to QuikPay Capital (factors within 24 hours, 5% fee). Rapid cash-out.', source: 'financial', category: 'financial' },
        'dc-bol-comparison': { title: 'Docs: BOL Comparison \u2014 Different Drivers', detail: 'Real carrier BOL and phantom carrier BOL have identical load numbers but different driver names and truck numbers.', source: 'docs', category: 'documents' },

        'rh-driver-error':   { title: 'Driver Error Theory', detail: 'Initial theory: drivers were going to wrong pickup locations. But driver GPS confirms correct locations \u2014 loads were already gone when they arrived.', source: 'loadboard', category: 'people', isRedHerring: true },
        'rh-shipper-complicit': { title: 'Shipper Complicity Theory', detail: 'Suspicion that shippers were releasing loads intentionally. But shipper dock logs show they verified MC# and BOL \u2014 the phantom had correct documents.', source: 'docs', category: 'people', isRedHerring: true }
    },

    connections: [
        { id: 'conn-compromise', label: 'Email Compromise: Romanian IP login then forwarding rule', from: 'em-romania-login', to: 'em-inbox-rule' },
        { id: 'conn-forward', label: 'Forward Interception: Phantom got tenders before real carrier', from: 'em-forward-timing', to: 'em-inbox-rule' },
        { id: 'conn-phantom', label: 'Phantom Carrier: Cloned MC from defunct company', from: 'cr-atlas-clone', to: 'cr-atlas-registered' },
        { id: 'conn-insurance', label: 'Insurance Fraud: Forged ACORD with VoIP number', from: 'cr-fake-insurance', to: 'cr-atlas-clone' },
        { id: 'conn-financial', label: 'Financial: Bank opened 2 days before compromise', from: 'fn-bank-account', to: 'em-romania-login' },
        { id: 'conn-no-market', label: 'Zero Market Activity: All loads via email intercept', from: 'lb-zero-bids', to: 'em-forward-timing' },
        { id: 'conn-bol', label: 'BOL Mismatch: Same load number, different drivers', from: 'dc-bol-comparison', to: 'cr-atlas-clone' },
        { id: 'conn-cashout', label: 'Rapid Cash-Out via Factoring', from: 'fn-factoring', to: 'fn-bank-account' }
    ],

    // Flags server-side only (Firestore flag_registry/ows-02-paper-trail)
    flagConnections: {
        'conn-compromise': 'compromise',
        'conn-phantom': 'phantom',
        'conn-cashout': 'cashout'
    },

    scoring: { pinEvidence: 15, pinRedHerring: -5, recoverFile: 10, connection: 25, hintPenalty: -30, wrongAnswer: -50, correctAnswer: 200 },

    triggers: {
        threats: [],
        tips: [
            { id: 'tip-1', minGameHours: 3, from: 'SYSTEM', text: 'Tip: Check the email inbox rules for any forwarding to external addresses. BEC attacks often create silent email rules.', condition: function(s) { return s.openedFiles.length >= 3; } },
            { id: 'tip-2', minGameHours: 10, from: 'SYSTEM', text: 'Tip: Compare when Atlas Express received rate confirmations vs when the real carrier was notified. Who got the info first?', condition: function(s) { return s.pinnedEvidence.length >= 5; } }
        ],
        handler: [
            { id: 'handler-1', minGameHours: 1, from: 'SUMMIT LOGISTICS CEO', text: 'Analyst \u2014 12 loads stolen in 6 weeks. Every time, a carrier we never dispatched shows up with perfect paperwork. Our dispatchers swear they assigned the loads to legitimate carriers. But by the time our carrier arrives, someone else has already picked up. The loads are worth $1.8M total. Find the leak.', condition: function() { return true; } }
        ],
        surveillance: []
    }
};
