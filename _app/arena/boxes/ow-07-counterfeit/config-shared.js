/* ═══════════════════════════════════════════════════════════════════
   OW-07: Operation Counterfeit — Shared Configuration
   Disinformation Campaign Attribution | NATO CCDCOE
   ═══════════════════════════════════════════════════════════════════ */

const CounterfeitConfig = {
    id: 'ow-07-counterfeit',
    title: 'OPERATION COUNTERFEIT',
    storageKey: 'hexworth_ow07',
    registryId: 'ow-07-counterfeit',
    startScore: 1000,
    clockStart: 8,
    clockRatio: 60,
    accentColor: '#ef4444',
    minConnectionsToSubmit: 6,

    devices: ['social', 'domains', 'payments', 'narrative', 'attribution'],

    pages: [
        { id: 'hub',         label: 'HQ',          href: 'index.html' },
        { id: 'social',      label: 'Social',      href: 'social.html' },
        { id: 'domains',     label: 'Domains',     href: 'domains.html' },
        { id: 'payments',    label: 'Financial',   href: 'payments.html' },
        { id: 'narrative',   label: 'Narrative',   href: 'narrative.html' },
        { id: 'attribution', label: 'Attribution', href: 'attribution.html' },
        { id: 'caseboard',   label: 'CaseBoard',   href: 'caseboard.html' }
    ],

    evidence: {
        'so-stylegan':       { title: 'StyleGAN Profile Photos', detail: '200+ accounts use AI-generated profile photos. StyleGAN artifacts (asymmetric earrings, blurred backgrounds, misaligned teeth) detected in 89% of flagged accounts.', source: 'social', category: 'digital' },
        'so-creation-waves': { title: 'Account Creation Waves', detail: '3 waves of account creation: Wave 1 (Jan 5-8, 60 accounts), Wave 2 (Jan 20-23, 80 accounts), Wave 3 (Feb 3-6, 65 accounts). All from same IP block.', source: 'social', category: 'digital' },
        'so-amplification':  { title: 'Coordinated Amplification Network', detail: 'Graph analysis shows 200+ accounts repost the same content within 2-5 minutes. Star topology — 12 "seed" accounts, 188 amplifiers.', source: 'social', category: 'digital' },
        'dm-nameservers':    { title: '20 Domains Share 2 Nameservers', detail: '17 of 20 fake news domains use ns1.securezone-dns.ru and ns2.securezone-dns.ru. Same privacy proxy registrar.', source: 'domains', category: 'digital' },
        'dm-hosting':        { title: '3 VPS Hosting IPs', detail: 'All 20 sites hosted on 3 VPS IPs (AS48666, non-cooperative jurisdiction). IPs also host known FROST BEAR infrastructure from 2024 campaigns.', source: 'domains', category: 'digital' },
        'py-crypto-source':  { title: 'Crypto Ad Spend — Source Wallet', detail: '$340K in crypto ad spend across 4 wallets. All funded from same source wallet 0x8a4f... which received funds from a company registered to state-affiliated media org.', source: 'payments', category: 'financial' },
        'py-state-media':    { title: 'State Media Wire Transfer', detail: 'Source wallet funded by wire from Eurasia Today Media Group — a known state-controlled media entity sanctioned by EU in 2024.', source: 'payments', category: 'financial' },
        'nr-russian-artifacts':{ title: 'Russian Language Artifacts', detail: 'Grammatical analysis: missing articles ("the", "a"), aspect confusion (perfective/imperfective), word order patterns consistent with native Russian speaker translating to English.', source: 'narrative', category: 'digital' },
        'nr-timezone':       { title: 'Moscow Business Hours Posting', detail: 'Posting activity heatmap: peaks at 09:00-18:00 Moscow time (UTC+3). Zero activity during Russian public holidays (Jan 1-8, Feb 23, Mar 8).', source: 'narrative', category: 'digital' },
        'at-frost-bear':     { title: 'TTP Match: FROST BEAR', detail: 'Tactics, techniques, and procedures match FROST BEAR (APT-28 influence arm): StyleGAN profiles, coordinated amplification, fake news domains, crypto ad payments.', source: 'attribution', category: 'people' },
        'at-opsec-failure':  { title: 'OPSEC Failure: Admin IP', detail: 'One admin account posted from IP 185.47.xx.xx which resolves to a government ministry building (confirmed via geolocation + building registry).', source: 'attribution', category: 'digital' },
        'at-ministry-ip':    { title: 'IP Geolocation: Ministry Building', detail: 'IP 185.47.xx.xx geolocates to 12 Tverskaya Street — a government ministry building. The admin account accessed the campaign dashboard from inside the building.', source: 'attribution', category: 'physical' },

        'rh-domestic-group':  { title: 'Domestic Activist Group Theory', detail: 'Initial assessment suggested domestic opposition group. But the infrastructure, funding, and language patterns are inconsistent with domestic origin.', source: 'attribution', category: 'people', isRedHerring: true },
        'rh-hacktivism':      { title: 'Hacktivist Collective Theory', detail: 'Anonymous-style hacktivist collective claimed credit on a forum. But the claim appeared 48 hours after media coverage — opportunistic, not genuine.', source: 'social', category: 'people', isRedHerring: true }
    },

    connections: [
        { id: 'conn-coordinated', label: 'Coordinated Inauthentic Behavior', from: 'so-stylegan', to: 'so-creation-waves' },
        { id: 'conn-infrastructure', label: 'Shared Infrastructure', from: 'dm-nameservers', to: 'dm-hosting' },
        { id: 'conn-financial', label: 'State Funding Trail', from: 'py-crypto-source', to: 'py-state-media' },
        { id: 'conn-language', label: 'Russian Origin Language', from: 'nr-russian-artifacts', to: 'nr-timezone' },
        { id: 'conn-attribution', label: 'FROST BEAR TTP Match', from: 'at-frost-bear', to: 'dm-hosting' },
        { id: 'conn-opsec', label: 'Admin IP from Ministry', from: 'at-opsec-failure', to: 'at-ministry-ip' },
        { id: 'conn-amplification', label: 'Bot Network Topology', from: 'so-amplification', to: 'so-creation-waves' },
        { id: 'conn-goal', label: 'Election Interference Goal', from: 'nr-russian-artifacts', to: 'so-amplification' }
    ],

    scoring: { pinEvidence: 15, pinRedHerring: -5, recoverFile: 10, connection: 25, hintPenalty: -30, wrongAnswer: -50, correctAnswer: 200 },

    answers: [ 'frost bear russia', 'frost bear', 'frost bear gru', 'russia frost bear', 'state sponsored russia' ],
    answerKeywords: [ ['frost', 'bear'], ['russia', 'state', 'gru'] ],
    nearMiss: [
        { match: ['frost', 'bear'], hint: 'Correct threat actor. What nation-state sponsors FROST BEAR?' },
        { match: ['russia'], hint: 'Correct origin. What is the specific threat actor group name? Check the TTP analysis.' },
        { match: ['domestic', 'opposition'], hint: 'The infrastructure and funding are international, not domestic. Follow the money and the language artifacts.' },
        { match: ['hacktivist', 'anonymous'], hint: 'The hacktivist claim was opportunistic. The real operation has state-level funding and infrastructure.' }
    ],

    triggers: {
        threats: [],
        tips: [
            { id: 'tip-1', minGameHours: 3, from: 'SYSTEM', text: 'Tip: Start with the social media monitor. Look at the profile photos and account creation dates.', condition: function(s) { return s.openedFiles.length >= 2; } },
            { id: 'tip-2', minGameHours: 10, from: 'SYSTEM', text: 'Tip: The posting activity heatmap reveals when the operators work. What timezone matches their schedule?', condition: function(s) { return s.pinnedEvidence.length >= 5; } }
        ],
        handler: [
            { id: 'handler-1', minGameHours: 1, from: 'NATO CCDCOE', text: 'Analyst \u2014 Three weeks before the parliamentary election, we detected a coordinated influence operation targeting the leading candidate. 200+ fake accounts, 20 fake news domains, professional content production. We need attribution before the election. Who is behind this and where does the funding come from?', condition: function() { return true; } }
        ],
        surveillance: []
    }
};
