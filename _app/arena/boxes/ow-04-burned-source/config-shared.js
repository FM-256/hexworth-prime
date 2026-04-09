/* ═══════════════════════════════════════════════════════════════════
   OW-04: Operation Burned Source — Shared Configuration
   Missing Journalist Investigation | Corrupt Federal Agent
   ═══════════════════════════════════════════════════════════════════ */

const BurnedSourceConfig = {
    id: 'ow-04-burned-source',
    title: 'OPERATION BURNED SOURCE',
    storageKey: 'hexworth_ow04',
    registryId: 'ow-04-burned-source',
    startScore: 1000,
    clockStart: 8,
    clockRatio: 60,
    accentColor: '#8b5cf6',
    minConnectionsToSubmit: 6,

    devices: ['laptop', 'phone', 'newsroom', 'osint', 'tipline'],

    pages: [
        { id: 'hub',      label: 'Hub',       href: 'index.html' },
        { id: 'laptop',   label: 'Laptop',    href: 'laptop.html' },
        { id: 'phone',    label: 'Phone',     href: 'phone.html' },
        { id: 'newsroom', label: 'Newsroom',  href: 'newsroom.html' },
        { id: 'osint',    label: 'OSINT',     href: 'osint.html' },
        { id: 'tipline',  label: 'Tip Line',  href: 'tipline.html' },
        { id: 'caseboard',label: 'CaseBoard', href: 'caseboard.html' }
    ],

    evidence: {
        'lp-article-v3':    { title: 'Article Draft v3 — Names Agent Rodriguez', detail: 'Third draft explicitly names "Agent Miguel Rodriguez, DEA" as the federal source protecting cartel financial pipeline.', source: 'laptop', category: 'documents' },
        'lp-signal-cardinal':{ title: 'Signal Chat — Source CARDINAL', detail: 'Source CARDINAL confirms Rodriguez met with cartel financial officer at marina on Feb 28.', source: 'laptop', category: 'communications' },
        'lp-tor-financials': { title: 'Tor Browser — Rodriguez Financial Research', detail: 'Elena researched Rodriguez\'s financial disclosures. Found undisclosed offshore accounts in Belize.', source: 'laptop', category: 'digital' },
        'lp-encrypted':      { title: 'Encrypted Partition — Evidence Package', detail: 'VeraCrypt volume contains the full compiled evidence package: photos, financial records, recorded conversations.', source: 'laptop', category: 'documents' },
        'ph-exif-photo':     { title: 'Photo with GPS — Rodriguez Lake House', detail: 'Photo taken at coordinates 34.1598, -118.6342 — matches a property under Rodriguez\'s wife\'s maiden name (Torres).', source: 'phone', category: 'physical' },
        'ph-voice-memo':     { title: 'Voice Memo — Confrontation Recording', detail: '47-second recording. Elena confronts someone about "protecting Vargas." Voice analysis consistent with Rodriguez.', source: 'phone', category: 'communications' },
        'ph-last-signal':    { title: 'Last Signal Message', detail: 'Final message to editor at 21:47: "At the marina. Rodriguez is here. If I don\'t check in by midnight, publish everything."', source: 'phone', category: 'communications' },
        'nr-editor-warning': { title: 'Email to Editor — "Look at the marina"', detail: 'Elena told editor: "If something happens to me, look at the marina photos and the Rodriguez connection."', source: 'newsroom', category: 'communications' },
        'nr-expense-marina': { title: 'Expense Report — Marina Surveillance', detail: 'Three expense claims for marina visits (binoculars rental, parking, gas). Feb 20, Feb 28, Mar 5.', source: 'newsroom', category: 'financial' },
        'os-property-record':{ title: 'Property Records — Lake House', detail: 'Property at 34.1598, -118.6342 owned by "Maria Torres" (Rodriguez\'s wife\'s maiden name). Purchased 2022 for $1.2M.', source: 'osint', category: 'financial' },
        'os-wife-company':   { title: 'Business Records — Torres Consulting LLC', detail: 'Torres Consulting received $2.1M in "consulting fees" from Grupo Vargas LLC — a known cartel-linked entity.', source: 'osint', category: 'financial' },
        'tl-marina-witness': { title: 'Tip: Marina Worker Saw Abduction', detail: 'Anonymous tip: "Saw a woman matching description being forced into a black SUV at Pier 7, approx 10 PM Mar 5."', source: 'tipline', category: 'people' },
        'tl-suv-plate':      { title: 'Tip: Black SUV Plate (Partial)', detail: 'Second tip from marina: "Black Suburban, government plates, partial: G-47***. Two men in suits."', source: 'tipline', category: 'physical' },

        // Red herrings
        'rh-cartel-threat':  { title: 'Cartel Threat Letter', detail: 'Anonymous letter threatening Elena received Feb 1. But letter was postmarked from out of state — cartel doesn\'t use USPS.', source: 'newsroom', category: 'communications', isRedHerring: true },
        'rh-ex-boyfriend':   { title: 'Ex-Boyfriend Motive', detail: 'Elena\'s ex filed a restraining order in 2024. But he was in New York during the disappearance (flight records confirmed).', source: 'osint', category: 'people', isRedHerring: true },
        'rh-fake-proof':     { title: 'Fabricated Proof of Life', detail: 'Message received by newsroom: "Elena is fine, she\'s laying low." But metadata shows it was sent from a VoIP number registered 2 days ago.', source: 'tipline', category: 'communications', isRedHerring: true }
    },

    connections: [
        { id: 'conn-target', label: 'Target Identified: Agent Rodriguez is the corrupt federal agent', from: 'lp-article-v3', to: 'lp-signal-cardinal' },
        { id: 'conn-marina', label: 'Marina Meeting: Rodriguez met cartel officer at the marina', from: 'lp-signal-cardinal', to: 'nr-expense-marina' },
        { id: 'conn-financial', label: 'Financial Trail: Wife\'s company received $2.1M from cartel LLC', from: 'os-wife-company', to: 'os-property-record' },
        { id: 'conn-confrontation', label: 'Confrontation: Voice memo proves Elena confronted Rodriguez', from: 'ph-voice-memo', to: 'lp-article-v3' },
        { id: 'conn-lake-house', label: 'Lake House: Photo GPS + property records = Rodriguez\'s property', from: 'ph-exif-photo', to: 'os-property-record' },
        { id: 'conn-disappearance', label: 'Abduction: Tip confirms forced entry into SUV at marina', from: 'tl-marina-witness', to: 'ph-last-signal' },
        { id: 'conn-article', label: 'Motive: Article draft v3 had enough to publish — reason to silence', from: 'lp-article-v3', to: 'nr-editor-warning' },
        { id: 'conn-encrypted', label: 'Evidence Package: Encrypted partition contains full case file', from: 'lp-encrypted', to: 'lp-tor-financials' }
    ],

    scoring: { pinEvidence: 15, pinRedHerring: -5, recoverFile: 10, connection: 25, hintPenalty: -30, wrongAnswer: -50, correctAnswer: 200 },

    answers: [
        'agent rodriguez marina',
        'rodriguez marina',
        'miguel rodriguez marina',
        'agent rodriguez pier 7',
        'rodriguez pier 7',
        'agent rodriguez'
    ],
    answerKeywords: [
        ['rodriguez'],
        ['marina', 'pier']
    ],
    nearMiss: [
        { match: ['rodriguez'], hint: 'Right person. But where was Elena last seen? The tips and her last message point to a specific location.' },
        { match: ['marina', 'pier'], hint: 'Right location. Who did Elena go to meet there? Her article draft and Signal chats name the agent.' },
        { match: ['cartel', 'vargas'], hint: 'The cartel is involved, but Elena\'s investigation was about the federal agent protecting them. Who is he?' },
        { match: ['boyfriend', 'ex'], hint: 'The ex-boyfriend was in New York during the disappearance. He\'s not involved.' }
    ],

    triggers: {
        threats: [
            { id: 'threat-1', minGameHours: 8, from: 'BLOCKED NUMBER', text: 'Drop the Rodriguez investigation. Elena made a mistake. Don\'t make the same one.', condition: function(s) { return s.pinnedEvidence.length >= 4; } },
            { id: 'threat-2', minGameHours: 14, from: 'UNKNOWN', text: 'Elena\'s phone data is being wiped remotely. Save what you can.', condition: function(s) { return s.connections.length >= 3; }, onFire: function(engine) { engine.startRemoteWipe('phone', 0.167); } }
        ],
        tips: [
            { id: 'tip-1', minGameHours: 3, from: 'SYSTEM', text: 'Tip: Start with Elena\'s article drafts on the laptop. Each version reveals more of her investigation.', condition: function(s) { return s.openedFiles.length >= 2; } },
            { id: 'tip-2', minGameHours: 12, from: 'SYSTEM', text: 'Tip: The phone photo has GPS coordinates. Cross-reference with property records in OSINT.', condition: function(s) { return s.pinnedEvidence.length >= 5; } }
        ],
        handler: [
            { id: 'handler-1', minGameHours: 1, from: 'DET. SARAH NOVAK', text: 'Analyst \u2014 Elena Vasquez disappeared 72 hours ago. She was investigating cartel money laundering through legitimate businesses. Her editor says she found something big \u2014 bigger than cartels. Her devices are at the lab. Find out what she discovered and where she went.', condition: function() { return true; } },
            { id: 'handler-2', minGameHours: 10, from: 'DET. SARAH NOVAK', text: 'Elena\'s mother is calling every hour. The newsroom is getting pressure from "sources" to drop the story. Someone wants this investigation buried. Whatever Elena found, it scared the wrong people.', condition: function(s) { return s.openedFiles.length >= 8; } }
        ],
        surveillance: [
            { id: 'surv-1', minGameHours: 6, effect: 'network_spike', condition: function(s) { return s.openedFiles.length >= 4; } },
            { id: 'surv-2', minGameHours: 16, effect: 'screen_glitch', condition: function(s) { return s.connections.length >= 4; } }
        ]
    }
};
