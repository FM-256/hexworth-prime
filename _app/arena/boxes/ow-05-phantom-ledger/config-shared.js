/* ═══════════════════════════════════════════════════════════════════
   OW-05: Operation Phantom Ledger — Shared Configuration
   Money Laundering Network Analysis | Pacific Coast Regional Bank
   ═══════════════════════════════════════════════════════════════════ */

const PhantomLedgerConfig = {
    id: 'ow-05-phantom-ledger',
    title: 'OPERATION PHANTOM LEDGER',
    storageKey: 'hexworth_ow05',
    registryId: 'ow-05-phantom-ledger',
    startScore: 1000,
    clockStart: 8,
    clockRatio: 60,
    accentColor: '#22c55e',
    minConnectionsToSubmit: 7,

    devices: ['banking', 'sar', 'email', 'shell', 'surveillance'],

    pages: [
        { id: 'hub',          label: 'Hub',          href: 'index.html' },
        { id: 'banking',      label: 'Banking',      href: 'banking.html' },
        { id: 'sar',          label: 'SAR/CTR',      href: 'sar.html' },
        { id: 'email',        label: 'Email',        href: 'email.html' },
        { id: 'shell',        label: 'Registry',     href: 'shell.html' },
        { id: 'surveillance', label: 'Surveillance', href: 'surveillance.html' },
        { id: 'caseboard',    label: 'CaseBoard',    href: 'caseboard.html' }
    ],

    evidence: {
        'bk-structuring':    { title: 'Structuring Pattern: 340 Transactions at $9,500', detail: '340 cash deposits of exactly $9,500 across 12 accounts over 18 months. Just below $10K CTR threshold.', source: 'banking', category: 'financial' },
        'bk-wire-overrides':  { title: 'VP Morrison Compliance Overrides', detail: 'VP Morrison overrode compliance holds on 8 wire transfers totaling $12M. Notes: "verified client, no further review."', source: 'banking', category: 'financial' },
        'bk-wire-destinations':{ title: 'Wire Destinations — 4 Countries', detail: 'Wires routed to: Cyprus, Panama, Cayman Islands, Belize. All through shell company accounts.', source: 'banking', category: 'financial' },
        'sr-sar-pattern':     { title: 'SAR Filings — Same 12 Accounts', detail: '14 SARs filed on the same 12 accounts. All flagged for structuring, all dismissed by VP Morrison.', source: 'sar', category: 'financial' },
        'sr-ctr-absence':     { title: 'Missing CTRs — Transactions Suppressed', detail: '340 deposits at $9,500 should have triggered mandatory review. VP Morrison marked them as "business operating expenses."', source: 'sar', category: 'financial' },
        'em-morrison-client':  { title: 'Morrison Email — "Valued Client" Treatment', detail: 'VP Morrison directed tellers to process deposits for these 12 accounts without questions. "These are valued commercial clients."', source: 'email', category: 'communications' },
        'em-morrison-lifestyle':{ title: 'Morrison Personal Email — Luxury Purchases', detail: '$2.1M yacht purchase, $890K lake house renovation, Porsche 911 lease — on $185K salary.', source: 'email', category: 'financial' },
        'sh-12-shells':       { title: '12 Shell Companies — Same Registered Agent', detail: 'All 12 accounts belong to shell companies sharing the same registered agent address in Wilmington, DE.', source: 'shell', category: 'financial' },
        'sh-beneficial-owner': { title: 'Beneficial Owner — Cyprus Holding', detail: 'All shells trace through 3 layers to Kyros Holdings Ltd (Cyprus). Beneficial owner: Dimitri Karabas.', source: 'shell', category: 'people' },
        'sh-sanctions':       { title: 'Karabas — OFAC Sanctioned Individual', detail: 'Dimitri Karabas sanctioned under EO 13722 for involvement in transnational organized crime (2024).', source: 'shell', category: 'people' },
        'sv-meetings':        { title: 'Surveillance: Morrison Met Karabas 4 Times', detail: 'Physical surveillance photos: VP Morrison and Karabas at private club in Beverly Hills on 4 occasions.', source: 'surveillance', category: 'physical' },
        'sv-restaurant':      { title: 'Surveillance: Restaurant Receipts', detail: 'Morrison expensed 4 dinners at Il Cielo (Beverly Hills) — $2,400 total. Matched to surveillance dates.', source: 'surveillance', category: 'financial' },

        // Red herrings
        'rh-teller-error':    { title: 'Teller Error Reports', detail: 'Two tellers filed error reports about unusual deposits in 2025. Both resolved as "client preference for cash." Not evidence of teller complicity.', source: 'banking', category: 'financial', isRedHerring: true },
        'rh-other-vp':        { title: 'VP Chen — High-Value Client Portfolio', detail: 'VP Jennifer Chen manages 8 high-net-worth accounts. All passed compliance review. No connection to the 12 shell accounts.', source: 'banking', category: 'people', isRedHerring: true }
    },

    connections: [
        { id: 'conn-structuring', label: 'Structuring: 340 transactions at $9,500 = deliberate CTR avoidance', from: 'bk-structuring', to: 'sr-ctr-absence' },
        { id: 'conn-shell-network', label: 'Shell Network: 12 companies share one registered agent', from: 'sh-12-shells', to: 'bk-structuring' },
        { id: 'conn-beneficial', label: 'Beneficial Owner: All shells trace to Cyprus entity (Karabas)', from: 'sh-beneficial-owner', to: 'sh-12-shells' },
        { id: 'conn-vp-complicity', label: 'VP Complicity: Morrison overrode compliance on $12M in wires', from: 'bk-wire-overrides', to: 'sr-sar-pattern' },
        { id: 'conn-lifestyle', label: 'VP Lifestyle: $3M+ purchases on $185K salary', from: 'em-morrison-lifestyle', to: 'bk-wire-overrides' },
        { id: 'conn-meetings', label: 'Physical Meetings: Morrison and Karabas met 4 times', from: 'sv-meetings', to: 'sh-beneficial-owner' },
        { id: 'conn-laundering', label: 'Trade-Based Laundering: Import payments through shell exporters', from: 'bk-wire-destinations', to: 'sh-12-shells' },
        { id: 'conn-flow', label: 'Flow Pattern: Cash in -> shells -> offshore accounts', from: 'bk-structuring', to: 'bk-wire-destinations' },
        { id: 'conn-sanctions', label: 'Sanctions Violation: Karabas is OFAC-sanctioned', from: 'sh-sanctions', to: 'sv-meetings' }
    ],

    scoring: { pinEvidence: 15, pinRedHerring: -5, recoverFile: 10, connection: 25, hintPenalty: -30, wrongAnswer: -50, correctAnswer: 200 },

    answers: [
        'trade based laundering vp morrison',
        'vp morrison trade based laundering',
        'morrison trade laundering',
        'trade based money laundering morrison',
        'vp morrison'
    ],
    answerKeywords: [
        ['morrison'],
        ['trade', 'laundering', 'structuring']
    ],
    nearMiss: [
        { match: ['morrison'], hint: 'Right suspect. But what was the specific laundering technique? Look at how the money moved through the shell companies.' },
        { match: ['trade', 'laundering'], hint: 'Correct method. Now who inside the bank facilitated it?' },
        { match: ['karabas'], hint: 'Karabas is the beneficial owner of the shells, but the question is who INSIDE THE BANK enabled the scheme.' },
        { match: ['structuring'], hint: 'Structuring was how cash entered the system. But how did it leave? The wire transfers tell the rest of the story.' }
    ],

    triggers: {
        threats: [
            { id: 'threat-1', minGameHours: 8, from: 'BLOCKED NUMBER', text: 'Morrison has lawyers. If you don\'t have the full picture, this goes nowhere. Take your time.', condition: function(s) { return s.pinnedEvidence.length >= 5; } }
        ],
        tips: [
            { id: 'tip-1', minGameHours: 3, from: 'SYSTEM', text: 'Tip: Start with the SAR filings. They flag the accounts. Then trace backwards to the banking terminal for transaction detail.', condition: function(s) { return s.openedFiles.length >= 3; } },
            { id: 'tip-2', minGameHours: 15, from: 'SYSTEM', text: 'Tip: Follow the money forward: cash deposits -> shell accounts -> wire transfers -> offshore. Who approved the wires?', condition: function(s) { return s.connections.length >= 4; } }
        ],
        handler: [
            { id: 'handler-1', minGameHours: 1, from: 'FINCEN SUPERVISOR', text: 'Analyst \u2014 Pacific Coast Regional Bank has $47M in suspicious transaction volume across 12 accounts over 18 months. The compliance team filed SARs but they keep getting dismissed internally. Someone at the bank is protecting these accounts. Find the pattern, find the enabler.', condition: function() { return true; } }
        ],
        surveillance: []
    }
};
