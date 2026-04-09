/* ═══════════════════════════════════════════════════════════════════
   OW-02: Operation Dead Drop — Shared Configuration
   Cryptocurrency Heist Forensics | VaultGuard DeFi Protocol
   ═══════════════════════════════════════════════════════════════════ */

const DeadDropConfig = {
    id: 'ow-02-dead-drop',
    title: 'OPERATION DEAD DROP',
    storageKey: 'hexworth_ow02',
    registryId: 'ow-02-dead-drop',
    startScore: 1000,
    clockStart: 8,
    clockRatio: 60,
    accentColor: '#f59e0b',
    minConnectionsToSubmit: 6,

    devices: ['explorer', 'contracts', 'exchange', 'comms', 'mixer'],

    pages: [
        { id: 'hub',       label: 'Hub',        href: 'index.html' },
        { id: 'explorer',  label: 'Blockchain',  href: 'explorer.html' },
        { id: 'contracts', label: 'Contracts',   href: 'contracts.html' },
        { id: 'exchange',  label: 'Exchange',    href: 'exchange.html' },
        { id: 'comms',     label: 'Comms',       href: 'comms.html' },
        { id: 'mixer',     label: 'Fund Flow',   href: 'mixer.html' },
        { id: 'caseboard', label: 'CaseBoard',   href: 'caseboard.html' }
    ],

    evidence: {
        // BLOCKCHAIN EXPLORER
        'bx-attack-tx':     { title: 'Attack Transaction', detail: 'Single TX drained 4,200 ETH from VaultGuard via 47 recursive withdraw() calls in one block.', source: 'explorer', category: 'digital' },
        'bx-hop-chain':     { title: 'Fund Hop Chain (6 wallets)', detail: 'Attack wallet -> 6 intermediate wallets in rapid succession. Each hop within 2 blocks.', source: 'explorer', category: 'financial' },
        'bx-mixer-entry':   { title: 'Tornado Cash Deposits', detail: '42 deposits of 100 ETH each into Tornado Cash from wallet #6. Total: 4,200 ETH.', source: 'explorer', category: 'financial' },
        'bx-mixer-exit':    { title: 'Tornado Cash Withdrawals', detail: '42 withdrawals from Tornado Cash to a single exchange deposit address. 73-minute interval between each.', source: 'mixer', category: 'financial' },
        'bx-exchange-dest': { title: 'Exchange Deposit Wallet', detail: 'All 42 Tornado Cash exits deposited to Kraken wallet 0x9f2a...c4d1. Account registered to "Marcus Webb."', source: 'exchange', category: 'financial' },

        // SMART CONTRACTS
        'sc-vuln-pr':       { title: 'Malicious PR #847', detail: 'PR #847 added _beforeTokenTransfer hook with reentrancy vector. Approved by auditor M. Webb.', source: 'contracts', category: 'digital' },
        'sc-audit-report':  { title: 'Audit Report — Signed Off', detail: 'BlockShield Security audit signed by Marcus Webb. Rated _beforeTokenTransfer as "Low Risk — standard hook."', source: 'contracts', category: 'documents' },
        'sc-reentrancy':    { title: 'Reentrancy in withdraw()', detail: 'withdraw() sends ETH before updating balance mapping. _beforeTokenTransfer calls back into withdraw() recursively.', source: 'contracts', category: 'digital' },

        // EXCHANGE KYC
        'ex-kyc-name':      { title: 'KYC Identity — Marcus Webb', detail: 'Account registered to "Marcus Webb" (driver license). Real auditor is "Marcus Weber" — one letter different.', source: 'exchange', category: 'people' },
        'ex-login-ip':      { title: 'Exchange Login IP', detail: 'Account accessed from 185.220.xx.xx (same VPN range as BlockShield Security\'s office network).', source: 'exchange', category: 'digital' },
        'ex-withdrawal':    { title: 'Exchange Withdrawal', detail: '4,180 ETH withdrawn to cold wallet 0x4b7e...8a2f within 48 hours of deposits completing. Only 20 ETH left (fees).', source: 'exchange', category: 'financial' },

        // DISCORD/COMMS
        'dc-reentrancy-q':  { title: 'Discord — Reentrancy Question', detail: 'User "BlockAudit_MW" asked about reentrancy guards in #dev-chat 3 days before PR #847 was submitted.', source: 'comms', category: 'communications' },
        'dc-deleted-dm':    { title: '[RECOVERED] Deleted DM', detail: 'DM from BlockAudit_MW to VaultGuard dev: "The _beforeTokenTransfer hook is safe, I reviewed it personally."', source: 'comms', category: 'communications' },
        'dc-username-match':{ title: 'Discord Username Match', detail: 'Discord user "BlockAudit_MW" profile linked to Twitter @marcus_weber_sec — matches auditor Marcus Weber.', source: 'comms', category: 'people' },

        // MIXER ANALYSIS
        'mx-timing':        { title: '73-Minute Timing Pattern', detail: 'All 42 Tornado Cash withdrawals separated by exactly 73 minutes. Automated script, not manual.', source: 'mixer', category: 'digital' },
        'mx-denomination':  { title: 'Denomination Fingerprint', detail: 'Deposits: 100 ETH each (42x). Withdrawals: 100 ETH each (42x). No mixing with other denominations — weak anonymity.', source: 'mixer', category: 'financial' },

        // RED HERRINGS
        'rh-flashloan':     { title: 'Flash Loan Theory', detail: 'Community speculated flash loan attack. But the attack TX used the attacker\'s own ETH — no flash loan protocol involved.', source: 'explorer', category: 'digital', isRedHerring: true },
        'rh-team-wallet':   { title: 'VaultGuard Team Wallet Movement', detail: 'Team multi-sig moved 500 ETH to a new cold wallet 2 days after the attack. Routine treasury management, not related.', source: 'explorer', category: 'financial', isRedHerring: true },
        'rh-other-auditor': { title: 'Second Auditor — Clean', detail: 'CertiK also reviewed the codebase. Their audit did NOT cover PR #847 (it was added after CertiK\'s review window).', source: 'contracts', category: 'documents', isRedHerring: true }
    },

    connections: [
        { id: 'conn-exploit', label: 'Exploit Vector: Reentrancy in _beforeTokenTransfer', from: 'sc-vuln-pr', to: 'sc-reentrancy' },
        { id: 'conn-audit-complicity', label: 'Audit Complicity: Auditor approved the vulnerable function', from: 'sc-audit-report', to: 'sc-vuln-pr' },
        { id: 'conn-fund-origin', label: 'Fund Flow: Attack TX through 6 hops to mixer', from: 'bx-attack-tx', to: 'bx-mixer-entry' },
        { id: 'conn-mixer-timing', label: 'Mixer Correlation: 73-minute automated withdrawal pattern', from: 'mx-timing', to: 'bx-mixer-exit' },
        { id: 'conn-exchange-endpoint', label: 'Exchange Endpoint: All mixer exits to single KYC account', from: 'bx-mixer-exit', to: 'bx-exchange-dest' },
        { id: 'conn-identity', label: 'Identity Link: KYC name variant matches auditor', from: 'ex-kyc-name', to: 'dc-username-match' },
        { id: 'conn-ip-match', label: 'IP Correlation: Exchange login IP matches auditor VPN', from: 'ex-login-ip', to: 'sc-audit-report' },
        { id: 'conn-premeditation', label: 'Premeditation: Discord reentrancy questions 3 days before PR', from: 'dc-reentrancy-q', to: 'sc-vuln-pr' }
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

    // Flags server-side only (Firestore flag_registry/ow-02-dead-drop)
    flagConnections: {
        'conn-exploit': 'exploit',        // Reentrancy identified -> FLAG 1
        'conn-mixer-timing': 'fundflow',  // Fund flow traced -> FLAG 2
        'conn-identity': 'attacker'       // Attacker unmasked -> FLAG 3
    },

    triggers: {
        threats: [
            { id: 'threat-1', minGameHours: 6, from: 'ANONYMOUS', text: 'The funds are already in cold storage. You\'re wasting your time.', condition: function(s) { return s.openedFiles.length >= 5; } },
            { id: 'threat-2', minGameHours: 12, from: 'UNKNOWN', text: 'The exchange is about to freeze the account. If you haven\'t traced the funds yet, you\'ll lose access to KYC data.', condition: function(s) { return s.connections.length >= 3; }, onFire: function(engine) { engine.startRemoteWipe('exchange', 0.167); } }
        ],
        tips: [
            { id: 'tip-1', minGameHours: 3, from: 'SYSTEM', text: 'Tip: Start with the attack transaction on the blockchain explorer. Follow the money forward from there.', condition: function(s) { return s.openedFiles.length >= 2; } },
            { id: 'tip-2', minGameHours: 10, from: 'SYSTEM', text: 'Tip: The Tornado Cash timing pattern is the key to linking deposits to withdrawals. What interval repeats?', condition: function(s) { return s.pinnedEvidence.length >= 6; } }
        ],
        handler: [
            { id: 'handler-1', minGameHours: 1, from: 'VAULTGUARD DAO', text: 'Analyst — 4,200 ETH ($14.7M) was drained from our protocol 6 hours ago. The community is in panic. We need answers before the attacker cashes out. All on-chain data and our internal records are available.', condition: function() { return true; } },
            { id: 'handler-2', minGameHours: 8, from: 'VAULTGUARD DAO', text: 'The attacker is moving funds through Tornado Cash. We can see deposits going in but can\'t link them to withdrawals. The exchange compliance team will cooperate if we can prove the connection.', condition: function(s) { return s.openedFiles.length >= 8; } }
        ],
        surveillance: [
            { id: 'surv-1', minGameHours: 8, effect: 'network_spike', condition: function(s) { return s.pinnedEvidence.length >= 4; } }
        ]
    }
};
