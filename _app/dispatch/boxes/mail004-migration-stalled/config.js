/* ============================================================
   DISPATCH LAB — Box MAIL004: Mailbox Migration Stalled
   CompTIA Network+ — Exchange Migration Troubleshooting (N10-009)
   5 scenarios: MRS proxy down, large mailbox timeout, corrupt items,
   throttling policy, target quota exceeded
   ============================================================ */

var MAIL004Config = {

    title: 'Mailbox Migration Stalled',
    subtitle: 'Migration Stuck — Exchange Online Move Requests',
    difficulty: 'Advanced',
    accent: '#10b981',
    storageKey: 'hexworth_lab_mail004',
    registryId: 'mail004-migration-stalled',
    trackerKey: 'lab_mail004',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the migration failure complaint.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check migration status', tip: 'Open Migration Dashboard or run Get-MoveRequest to see stalled migrations.', trigger: { event: 'window_open', match: { type: 'migration_dash' } } },
            { title: 'Investigate the failure', tip: 'Use Get-MoveRequestStatistics, Get-MigrationBatch, or Test-MRSHealth to find the root cause.', trigger: { event: 'command', match: { cmd: 'contains:get-' } } },
            { title: 'Apply the fix', tip: 'Use Set-MoveRequest, Set-MigrationEndpoint, or Resume-MoveRequest to fix the migration.', trigger: { event: 'command', match: { cmd: 'contains:set-' }, alt: [{ event: 'command', match: { cmd: 'contains:resume-' } }] } },
            { title: 'Capture the flag', tip: 'After fixing the migration, check the Migration Dashboard for the recovery token.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'Network+',
        mappings: [
            { flagId: 'fixed', objective: '1.6', description: 'Explain network services — SMTP, HTTPS endpoints', skill: 'Exchange Migration Endpoint Management' },
            { flagId: 'fixed', objective: '5.3', description: 'Troubleshoot common network service issues', skill: 'Mailbox Migration Troubleshooting' }
        ]
    },

    _scenarios: [
        {
            id: 'mrs_proxy_down',
            name: 'MRS Proxy Endpoint Not Responding',
            ticketSubject: 'Migration batch stuck at 0% — MRS proxy endpoint unreachable',
            ticketDetail: 'We started a migration batch of 50 mailboxes to Exchange Online last night and it is stuck at 0%. Every move request shows "Failed" with "The call to the MRS Proxy endpoint failed." The on-prem MRS Proxy was working fine last week. No mailboxes have started copying.',
            ticketExtra: 'IT Note: The MRS Proxy service runs on the CAS role. It was disabled during a security hardening pass last weekend. The endpoint https://mail.ourcompany.com/EWS/mrsproxy.svc needs to be accessible.',
            fixDescription: 'Re-enable MRS Proxy on the Exchange CAS server and resume move requests',
            stateOverrides: { _mrsProxyDown: true }
        },
        {
            id: 'large_mailbox_timeout',
            name: 'Large Mailbox Timeout',
            ticketSubject: 'CEO mailbox migration failing at 60% — timeout after 100GB transferred',
            ticketDetail: 'The CEO\'s 168GB mailbox migration has failed three times. It gets to about 60% (100GB) and then times out with "MRS request timed out." The default timeout is not sufficient for this mailbox size. Other smaller mailboxes have migrated successfully.',
            ticketExtra: 'IT Note: Default IncrementalSyncInterval and LargeItemLimit may not be sufficient for 168GB mailbox. Consider increasing the timeout and enabling incremental sync with a larger batch window.',
            fixDescription: 'Increase the move request timeout and enable incremental sync for the large mailbox',
            stateOverrides: { _largeMailboxTimeout: true, _mailboxSize: '168GB', _currentProgress: '60%' }
        },
        {
            id: 'corrupt_items_exceeded',
            name: 'Corrupt Items Exceeding Bad Item Limit',
            ticketSubject: 'Finance team migration stalled — too many corrupt items',
            ticketDetail: 'The Finance department migration batch is stalled. 12 out of 30 mailboxes show "StalledDueToCorruptItems" status. The bad item limit is set to 10 but several mailboxes have 50+ corrupt items from years of PST imports. The default limit is blocking the migration.',
            ticketExtra: 'IT Note: BadItemLimit is currently 10 (default). Finance mailboxes have extensive PST import history with known corruption. Increasing BadItemLimit to 100 and LargeItemLimit to 50 should allow the migration to continue while still catching major issues.',
            fixDescription: 'Increase BadItemLimit and LargeItemLimit, then resume stalled move requests',
            stateOverrides: { _corruptItemsExceeded: true, _badItemLimit: 10 }
        },
        {
            id: 'throttling_policy',
            name: 'Throttling Policy Limiting Migration',
            ticketSubject: 'Migration crawling — only 2 mailboxes moving at once despite 100 queued',
            ticketDetail: 'We have 100 mailboxes in the migration batch but only 2 are actively moving. The rest show "Queued" status. At this rate, the migration window will be blown by 3 weeks. Other tenants report moving 20-30 concurrent mailboxes. Our migration throughput is severely limited.',
            ticketExtra: 'IT Note: The MRS throttling policy on-prem limits MaxConcurrentMigrations to 2. The default for E3 tenants should support up to 50 concurrent moves. The policy was set to 2 during initial testing and never increased for production migration.',
            fixDescription: 'Increase MaxConcurrentMigrations in the MRS throttling policy',
            stateOverrides: { _throttled: true, _maxConcurrent: 2 }
        },
        {
            id: 'target_quota_exceeded',
            name: 'Target Quota Exceeded in Exchange Online',
            ticketSubject: 'Senior VP mailbox migration failing — "target mailbox quota exceeded"',
            ticketDetail: 'The Senior VP\'s 95GB mailbox migration failed with "MapiExceptionShutoffQuotaExceeded." The Exchange Online plan only provides 50GB for E1 licenses. The VP was supposed to be on E3 (100GB) but was assigned E1 by mistake. Three other executives have the same issue.',
            ticketExtra: 'IT Note: Verify the Exchange Online license assigned to the VP and the other executives. E1 = 50GB, E3 = 100GB, E5 = 100GB. The license assignment in Azure AD may need updating before the migration can succeed.',
            fixDescription: 'Upgrade the Exchange Online license from E1 (50GB) to E3 (100GB) and resume migration',
            stateOverrides: { _quotaExceeded: true, _currentLicense: 'E1 (50GB)', _mailboxSize: '95GB' }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Open the Migration Dashboard to see which move requests are failing and why.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use Get-MoveRequest and Get-MoveRequestStatistics to get detailed failure information.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Check MRS health, throttling policies, bad item limits, and license assignments.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Use Set-MoveRequest or Set-MigrationEndpoint with the correct parameters to fix the issue.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        mrs_proxy_down: [
            { id: 'hint1', text: 'All migrations at 0% — the MRS Proxy endpoint is not responding.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run Test-MRSHealth to check if the MRS Proxy service is enabled and accessible.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'MRS Proxy was disabled during hardening. It needs to be re-enabled on the CAS server.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: Set-MRSProxy enable — then Resume-MoveRequest all to restart the migrations.', cost: 150, penalty: -150 }
        ],
        large_mailbox_timeout: [
            { id: 'hint1', text: 'The 168GB mailbox times out at 60%. The default timeout is too short for this size.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run Get-MoveRequestStatistics to see the timeout value and sync interval.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Increase IncrementalSyncInterval and CompletionTimeout for this move request.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: Set-MoveRequest fix-timeout — increases timeout for large mailbox migration.', cost: 150, penalty: -150 }
        ],
        corrupt_items_exceeded: [
            { id: 'hint1', text: 'Mailboxes stalled due to corrupt items. The bad item limit is too low.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run Get-MoveRequestStatistics to see how many bad items were encountered vs the limit.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'BadItemLimit is 10 but mailboxes have 50+. Increase to 100 and LargeItemLimit to 50.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: Set-MoveRequest fix-baditems — increases limits and resumes stalled moves.', cost: 150, penalty: -150 }
        ],
        throttling_policy: [
            { id: 'hint1', text: 'Only 2 concurrent migrations despite 100 queued. Check the throttling policy.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run Get-MRSThrottlingPolicy to see the MaxConcurrentMigrations setting.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'MaxConcurrentMigrations is set to 2. Increase to 30-50 for production migration.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: Set-MRSThrottlingPolicy fix-concurrent — increases to 30 concurrent moves.', cost: 150, penalty: -150 }
        ],
        target_quota_exceeded: [
            { id: 'hint1', text: 'Migration failing with quota exceeded. Check the Exchange Online license.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Run Get-MailboxQuota to see the target mailbox quota vs the mailbox size.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'VP has E1 license (50GB) but mailbox is 95GB. Needs E3 (100GB).', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: Set-License upgrade-e3 — upgrades to E3 license and resumes migration.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !MAIL004Config._flagRestored) {
            MAIL004Config._flagRestored = true;
            var s = MAIL004Config._scenarios[engine.state._scenarioId];
            if (s) MAIL004Config.hints = MAIL004Config._scenarioHints[s.id] || MAIL004Config._defaultHints;
        }
        return true;
    },

    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._scenarioSelected = true;
        engine.state._mrsProxyDown = false;
        engine.state._largeMailboxTimeout = false;
        engine.state._corruptItemsExceeded = false;
        engine.state._throttled = false;
        engine.state._quotaExceeded = false;
        engine.state._labComplete = false;
        engine.state._flagRevealed = false;
        engine.state._fixApplied = false;
        var overrides = MAIL004Config._scenarios[idx].stateOverrides || {};
        for (var key in overrides) { engine.state[key] = overrides[key]; }
        MAIL004Config._flagRestored = true;
        MAIL004Config.hints = MAIL004Config._scenarioHints[MAIL004Config._scenarios[idx].id] || MAIL004Config._defaultHints;
        engine.save();
    },

    _getScenario(engine) { return engine.state._scenarioId == null ? null : MAIL004Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['Dell PowerEdge R740 UEFI', 'Memory: 131072 MB', 'RAID: PERC H740P', 'Loading Windows Server...'], grubEntries: ['Windows Server 2019'], loginUser: 'MigAdmin' },

    desktop: {
        icons: [
            { id: 'terminal',        label: 'Exchange\nManagement Shell', icon: 'PS',  app: 'terminal' },
            { id: 'migration_dash',  label: 'Migration\nDashboard',       icon: 'MIG', app: 'migration_dash' },
            { id: 'move_requests',   label: 'Move\nRequests',             icon: 'MOV', app: 'move_requests' },
            { id: 'server_info',     label: 'Server\nInfo',               icon: 'SRV', app: 'server_info' },
            { id: 'ticket',          label: 'Help Desk\nTicket',          icon: 'HD',  app: 'ticket' },
            { id: 'hints',           label: 'Hints',                      icon: '?',   app: 'hints' },
            { id: 'reset',           label: 'Reset\nLab',                 icon: 'RST', app: 'reset_lab' }
        ]
    },

    terminal: { user: 'MigAdmin', hostname: 'EXCH-MIG01', startDir: 'C:\\Users\\MigAdmin', promptStyle: 'windows', welcome: 'Exchange Management Shell — Migration Console\nConnected to EXCH-MIG01.ourcompany.com\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Check the Migration Dashboard for stalled move requests.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use Get-MoveRequest and Get-MoveRequestStatistics for details.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Check MRS health, throttling, bad items, and license assignments.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Use Set- or Resume- cmdlets to fix and restart.', cost: 50, penalty: -50 }
    ],
    lore: { intro: 'Mailbox migrations to Exchange Online have stalled. Move requests are failing for various reasons. Diagnose and fix the migration blockers.', scenario: 'Each scenario presents a different migration failure. Use Exchange cmdlets to diagnose MRS health, throttling, item limits, and license issues.', outro: 'Migration resumed. Mailboxes are moving to Exchange Online. Your migration expertise unblocked the stalled batch.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read ticket and check migration dashboard.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify the migration blocker.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Fix the issue and resume migrations.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm migrations and capture flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {

        'get-moverequest': function(args, term, engine) {
            var gate = MAIL004Config._requireScenario(engine);
            if (gate) return gate;
            var s = MAIL004Config._getScenario(engine);
            if (engine.state._fixApplied) return '\nAlias              Status         PercentComplete\n-----              ------         ---------------\n(all move requests resumed — InProgress or Completed)\n';
            var outputs = {
                mrs_proxy_down: '\nAlias              Status         PercentComplete\n-----              ------         ---------------\njdoe               Failed         0\nmmartinez          Failed         0\nkwilson            Failed         0\n... (50 total, all Failed at 0%)\n\nStatusDetail: The call to https://mail.ourcompany.com/EWS/mrsproxy.svc failed.\n',
                large_mailbox_timeout: '\nAlias              Status              PercentComplete\n-----              ------              ---------------\nceo.johnson        Failed              60\n\nStatusDetail: MRS request timed out after transferring 100GB of 168GB.\nFailureType: CommunicationErrorTransientException\n',
                corrupt_items_exceeded: '\nAlias              Status                    PercentComplete\n-----              ------                    ---------------\nfin.adams          StalledDueToCorruptItems  45\nfin.baker          StalledDueToCorruptItems  38\nfin.clark          StalledDueToCorruptItems  52\n... (12 of 30 stalled)\n\nBadItemsEncountered: 53    BadItemLimit: 10\n',
                throttling_policy: '\nAlias              Status         PercentComplete\n-----              ------         ---------------\nuser001            InProgress     78\nuser002            InProgress     42\nuser003            Queued         0\nuser004            Queued         0\n... (98 Queued, 2 InProgress)\n\nNote: Only 2 concurrent moves active. 98 waiting in queue.\n',
                target_quota_exceeded: '\nAlias              Status         PercentComplete\n-----              ------         ---------------\nvp.svenson         Failed         0\nexec.torres        Failed         0\nexec.kim           Failed         0\n\nStatusDetail: MapiExceptionShutoffQuotaExceeded\nTarget mailbox quota: 50GB (E1)  Source mailbox: 95GB\n'
            };
            return outputs[s.id] || '\n(no move requests)\n';
        },

        'get-moverequeststatistics': function(args, term, engine) {
            var gate = MAIL004Config._requireScenario(engine);
            if (gate) return gate;
            var s = MAIL004Config._getScenario(engine);
            var details = {
                mrs_proxy_down: 'FailureType: MRSProxyConnectionException\nMessage: Cannot connect to MRS Proxy at https://mail.ourcompany.com/EWS/mrsproxy.svc\nRemoteServerName: EXCH-MIG01.ourcompany.com\nMRSProxyEnabled: False',
                large_mailbox_timeout: 'TotalMailboxSize: 168GB\nBytesTransferred: 100GB (60%)\nFailureType: CommunicationErrorTransientException\nMessage: Connection timed out after 01:00:00\nIncrementalSyncInterval: 00:00:00 (disabled)\nCompletionTimeout: 01:00:00',
                corrupt_items_exceeded: 'BadItemsEncountered: 53\nBadItemLimit: 10\nLargeItemsEncountered: 12\nLargeItemLimit: 0\nMessage: Too many bad items (53 > limit 10). Migration suspended.',
                throttling_policy: 'MaxConcurrentMigrations: 2\nActiveMigrations: 2\nQueuedMigrations: 98\nMessage: Throttling policy limiting concurrent moves to 2.',
                target_quota_exceeded: 'SourceMailboxSize: 95GB\nTargetQuota: 50GB (E1 License)\nLicenseAssigned: Microsoft 365 E1\nMessage: MapiExceptionShutoffQuotaExceeded — target quota 50GB < source 95GB'
            };
            return '\nDisplayName              : ' + (s.id === 'large_mailbox_timeout' ? 'CEO Johnson' : s.id === 'target_quota_exceeded' ? 'VP Svenson' : 'Migration Batch') + '\nStatus                   : ' + (engine.state._fixApplied ? 'InProgress' : 'Failed') + '\n' + (details[s.id] || '') + '\n';
        },

        'test-mrshealth': function(args, term, engine) {
            var gate = MAIL004Config._requireScenario(engine);
            if (gate) return gate;
            if (engine.state._mrsProxyDown) {
                return '\nServer           Result    Message\n------           ------    -------\nEXCH-MIG01      FAILED    MRSProxy service is DISABLED on this server.\n                          Endpoint: https://mail.ourcompany.com/EWS/mrsproxy.svc — NOT RESPONDING\n                          Enable MRSProxy: Set-WebServicesVirtualDirectory -MRSProxyEnabled $true\n';
            }
            return '\nServer           Result    Message\n------           ------    -------\nEXCH-MIG01      PASSED    MRSProxy service is enabled and responding.\n';
        },

        'get-mrsthrottlingpolicy': function(args, term, engine) {
            var gate = MAIL004Config._requireScenario(engine);
            if (gate) return gate;
            var max = engine.state._throttled ? '2' : '30';
            return '\nMaxConcurrentMigrations     : ' + max + '\nMaxConcurrentMovesPerUser   : 5\nMigrationBandwidthLimit     : Unlimited\n' + (engine.state._throttled ? '\nWARNING: MaxConcurrentMigrations=2 is severely limiting throughput.\nRecommended: 30-50 for production migration batches.\n' : '');
        },

        'get-mailboxquota': function(args, term, engine) {
            var gate = MAIL004Config._requireScenario(engine);
            if (gate) return gate;
            if (engine.state._quotaExceeded) {
                return '\nUser              License    QuotaGB   MailboxGB   Status\n----              -------    -------   ---------   ------\nvp.svenson        E1         50        95          EXCEEDED\nexec.torres       E1         50        72          EXCEEDED\nexec.kim          E1         50        68          EXCEEDED\n\nNote: E1 license provides 50GB. These mailboxes need E3 (100GB).\n';
            }
            return '\nUser              License    QuotaGB   MailboxGB   Status\n----              -------    -------   ---------   ------\nvp.svenson        E3         100       95          OK\n';
        },

        'set-mrsproxy': function(args, term, engine) {
            var gate = MAIL004Config._requireScenario(engine);
            if (gate) return gate;
            var s = MAIL004Config._getScenario(engine);
            if (s.id === 'mrs_proxy_down' && args.join(' ').toLowerCase().includes('enable')) {
                engine.state._mrsProxyDown = false;
                engine.state._fixApplied = true;
                engine.state._flagRevealed = true;
                engine.state._labComplete = true;
                engine.save();
                setTimeout(function() { engine.notify('MRS Proxy enabled. Migration endpoint responding. Check Migration Dashboard.', 'success'); }, 400);
                return '\nMRS Proxy enabled on EXCH-MIG01.\nEndpoint https://mail.ourcompany.com/EWS/mrsproxy.svc is now accessible.\nRun Resume-MoveRequest -all to restart migrations.\n';
            }
            return '\nUsage: Set-MRSProxy enable\n';
        },

        'set-moverequest': function(args, term, engine) {
            var gate = MAIL004Config._requireScenario(engine);
            if (gate) return gate;
            var s = MAIL004Config._getScenario(engine);
            var joined = args.join(' ').toLowerCase();

            if (s.id === 'large_mailbox_timeout' && (joined.includes('fix') || joined.includes('timeout'))) {
                engine.state._fixApplied = true;
                engine.state._flagRevealed = true;
                engine.state._labComplete = true;
                engine.save();
                setTimeout(function() { engine.notify('Move request timeout increased. Large mailbox migration will use incremental sync. Check Migration Dashboard.', 'success'); }, 400);
                return '\nMove request for CEO Johnson updated:\n  CompletionTimeout: 24:00:00\n  IncrementalSyncInterval: 01:00:00\n  LargeItemLimit: 100\nMigration resumed with extended timeout.\n';
            }
            if (s.id === 'corrupt_items_exceeded' && (joined.includes('fix') || joined.includes('baditems') || joined.includes('baditem'))) {
                engine.state._fixApplied = true;
                engine.state._flagRevealed = true;
                engine.state._labComplete = true;
                engine.save();
                setTimeout(function() { engine.notify('Bad item limits increased. Stalled migrations resumed. Check Migration Dashboard.', 'success'); }, 400);
                return '\n12 stalled move requests updated:\n  BadItemLimit: 100\n  LargeItemLimit: 50\nAll stalled migrations resumed.\n';
            }
            return '\nUsage: Set-MoveRequest fix-timeout     (increase timeout for large mailbox)\n       Set-MoveRequest fix-baditems    (increase bad/large item limits)\n';
        },

        'set-mrsthrottlingpolicy': function(args, term, engine) {
            var gate = MAIL004Config._requireScenario(engine);
            if (gate) return gate;
            var s = MAIL004Config._getScenario(engine);
            if (s.id === 'throttling_policy' && args.join(' ').toLowerCase().includes('fix')) {
                engine.state._throttled = false;
                engine.state._fixApplied = true;
                engine.state._flagRevealed = true;
                engine.state._labComplete = true;
                engine.save();
                setTimeout(function() { engine.notify('Throttling policy updated. 30 concurrent migrations now active. Check Migration Dashboard.', 'success'); }, 400);
                return '\nMRS Throttling Policy updated:\n  MaxConcurrentMigrations: 30 (was: 2)\n98 queued migrations now starting.\n';
            }
            return '\nUsage: Set-MRSThrottlingPolicy fix-concurrent\n';
        },

        'set-license': function(args, term, engine) {
            var gate = MAIL004Config._requireScenario(engine);
            if (gate) return gate;
            var s = MAIL004Config._getScenario(engine);
            if (s.id === 'target_quota_exceeded' && args.join(' ').toLowerCase().includes('upgrade')) {
                engine.state._quotaExceeded = false;
                engine.state._fixApplied = true;
                engine.state._flagRevealed = true;
                engine.state._labComplete = true;
                engine.save();
                setTimeout(function() { engine.notify('Licenses upgraded to E3. Quota now 100GB. Migrations resumed. Check Migration Dashboard.', 'success'); }, 400);
                return '\nLicense updated for 3 users:\n  vp.svenson:    E1 (50GB) -> E3 (100GB)\n  exec.torres:   E1 (50GB) -> E3 (100GB)\n  exec.kim:      E1 (50GB) -> E3 (100GB)\nMove requests resumed.\n';
            }
            return '\nUsage: Set-License upgrade-e3\n';
        },

        'resume-moverequest': function(args, term, engine) {
            var gate = MAIL004Config._requireScenario(engine);
            if (gate) return gate;
            if (engine.state._fixApplied) return '\nAll move requests resumed and in progress.\n';
            return '\nCannot resume — root cause not yet fixed.\nUse Get-MoveRequestStatistics to identify the blocker.\n';
        },

        ping: function(args, term, engine) {
            var gate = MAIL004Config._requireScenario(engine);
            if (gate) return gate;
            if (!args.length) return '\nUsage: ping target\n';
            return '\nPinging ' + args[args.length - 1] + '...\nReply: bytes=32 time=2ms TTL=128\n';
        },

        whoami: function() { return 'OURCOMPANY\\MigAdmin'; },
        hostname: function() { return 'EXCH-MIG01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        dir: function() { return ' Directory of C:\\Users\\MigAdmin\n'; },
        ifconfig: function() { return '\'ifconfig\' is not recognized.'; }
    },

    onAppLaunch(iconDef, engine) {
        var req = ['migration_dash', 'move_requests', 'server_info'];
        if (req.includes(iconDef.app) && !engine.state._scenarioSelected) { engine.notify('Open the Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket':         MAIL004Config._openTicket(iconDef, engine); break;
            case 'migration_dash': MAIL004Config._openMigDash(iconDef, engine); break;
            case 'move_requests':  MAIL004Config._openMoveReqs(iconDef, engine); break;
            case 'server_info':    MAIL004Config._openServerInfo(iconDef, engine); break;
            case 'reset_lab':      MAIL004Config._confirmReset(engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        MAIL004Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) { MAIL004Config._renderTicket(engine, c); } else { MAIL004Config._renderPicker(engine, c); }
    },

    _renderPicker(engine, c) {
        var previews = ['Ops Team — "Migration batch stuck at 0% — MRS proxy unreachable"', 'CTO Office — "CEO mailbox timing out at 60%"', 'Finance — "12 mailboxes stalled on corrupt items"', 'Project Lead — "Only 2 of 100 mailboxes moving"', 'EA Office — "VP mailbox migration quota exceeded"'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#10b981; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">MIGRATION QUEUE</div></div><div>';
        MAIL004Config._scenarios.forEach(function(s, i) {
            html += '<button class="m4btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><div style="display:flex; justify-content:space-between;"><span style="color:#10b981; font-weight:bold;">MIG-' + (1000 + i) + '</span><span style="background:#e74c3c; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">URGENT</span></div><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>';
        });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="m4rand" style="padding:10px 28px; background:#10b981; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random Assignment</button></div>';
        c.innerHTML = html;
        c.querySelectorAll('.m4btn').forEach(function(b) {
            b.addEventListener('mouseenter', function() { this.style.borderColor = '#10b981'; });
            b.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; });
            b.addEventListener('click', function() { MAIL004Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); MAIL004Config._renderTicket(engine, c); });
        });
        document.getElementById('m4rand').addEventListener('click', function() { MAIL004Config._applyScenario(engine, Math.floor(Math.random() * MAIL004Config._scenarios.length)); MAIL004Config._renderTicket(engine, c); });
    },

    _renderTicket(engine, c) {
        var s = MAIL004Config._getScenario(engine);
        var subs = ['Ops Team Lead', 'CTO Office', 'Finance Director', 'Migration Project Lead', 'Executive Assistant'];
        c.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><div style="display:flex; justify-content:space-between;"><span style="color:#10b981; font-weight:bold;">MIGRATION TICKET #MIG-' + (1000 + engine.state._scenarioId) + '</span><span style="background:#e74c3c; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">URGENT</span></div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBMITTED BY</div><div>' + subs[engine.state._scenarioId] + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + MAIL004Config._escHtml(s.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + MAIL004Config._escHtml(s.ticketDetail) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#a7f3d0;">' + MAIL004Config._escHtml(s.ticketExtra) + '</div></div>'
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#10b981; font-weight:bold;">ASSIGNED TO: YOU — Migration Administrator</div></div>';
    },

    _openMigDash(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); MAIL004Config._renderMigDash(engine); return; }
        var c = document.createElement('div'); c.id = 'migDashContainer';
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Migration Dashboard', 'MIG', c);
        MAIL004Config._renderMigDash(engine);
    },

    _renderMigDash(engine) {
        var c = document.getElementById('migDashContainer'); if (!c) return;
        var s = MAIL004Config._getScenario(engine);
        var html = '<div style="font-size:1rem; font-weight:bold; color:#10b981; margin-bottom:16px;">Migration Dashboard</div>';
        if (engine.state._fixApplied) {
            html += '<div style="background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:4px; padding:16px; text-align:center;"><div style="color:#10b981; font-weight:bold; font-size:1.1rem;">Migration Resumed</div><div style="color:#a7f3d0;">All move requests are progressing normally.</div></div>';
            if (engine.state._flagRevealed) {
                html += '<div style="margin-top:16px; background:rgba(16,185,129,0.1); border:1px solid rgba(16,185,129,0.3); border-radius:4px; padding:12px;"><div style="color:#10b981; font-weight:bold;">Fix Confirmed:</div><div id="m4flag" style="color:#c8e6c9;">Recovery token: loading...</div></div>';
            }
        } else {
            var stats = {
                mrs_proxy_down: { failed: 50, inprog: 0, queued: 0, error: 'MRS Proxy endpoint unreachable' },
                large_mailbox_timeout: { failed: 1, inprog: 0, queued: 0, error: 'Timeout at 60% (100GB/168GB)' },
                corrupt_items_exceeded: { failed: 0, inprog: 18, queued: 0, error: '12 stalled on corrupt items (53 > limit 10)' },
                throttling_policy: { failed: 0, inprog: 2, queued: 98, error: 'MaxConcurrentMigrations = 2' },
                target_quota_exceeded: { failed: 3, inprog: 0, queued: 0, error: 'Target quota 50GB exceeded (95GB mailbox)' }
            };
            var st = stats[s.id];
            html += '<div style="display:flex; gap:12px; margin-bottom:16px;">'
                + '<div style="flex:1; background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; padding:12px; text-align:center;"><div style="color:#e74c3c; font-size:1.5rem; font-weight:bold;">' + st.failed + '</div><div style="color:#888; font-size:0.7rem;">Failed</div></div>'
                + '<div style="flex:1; background:rgba(245,158,11,0.08); border:1px solid rgba(245,158,11,0.2); border-radius:4px; padding:12px; text-align:center;"><div style="color:#f59e0b; font-size:1.5rem; font-weight:bold;">' + st.inprog + '</div><div style="color:#888; font-size:0.7rem;">In Progress</div></div>'
                + '<div style="flex:1; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; text-align:center;"><div style="font-size:1.5rem; font-weight:bold;">' + st.queued + '</div><div style="color:#888; font-size:0.7rem;">Queued</div></div></div>'
                + '<div style="background:rgba(231,76,60,0.08); border:1px solid rgba(231,76,60,0.2); border-radius:4px; padding:12px;"><div style="color:#e74c3c; font-weight:bold;">Primary Error:</div><div style="color:#ffcc80; margin-top:4px;">' + st.error + '</div></div>';
        }
        c.innerHTML = html;
        if (engine.state._flagRevealed && engine.state._fixApplied) {
            BoxEngine.requestFlagText(s.id).then(function(ft) { var el = document.getElementById('m4flag'); if (el) el.textContent = 'Recovery token: ' + (ft || 'Flag unavailable'); });
        }
    },

    _openMoveReqs(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Move Requests', 'MOV', c);
        c.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#10b981; margin-bottom:16px;">Move Requests Detail</div><div style="font-size:0.75rem; color:#888;">Use Get-MoveRequest and Get-MoveRequestStatistics in the Exchange Management Shell for live data.</div>';
    },

    _openServerInfo(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Server Info', 'SRV', c);
        c.innerHTML = '<div style="font-size:1rem; font-weight:bold; color:#10b981; margin-bottom:16px;">Migration Infrastructure</div><div style="font-size:0.75rem; color:#aaa; line-height:1.8;"><div>On-Prem: EXCH-MIG01 (10.0.1.20) — Exchange 2019 CU12</div><div>MRS Proxy: https://mail.ourcompany.com/EWS/mrsproxy.svc</div><div>Target: Microsoft 365 E3/E1 (Exchange Online)</div><div>Migration Batch: 100 mailboxes total</div><div>Bandwidth: 1Gbps dedicated migration VLAN</div></div>';
    },

    _confirmReset(engine) {
        var o = document.createElement('div');
        o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px 32px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9; max-width:360px;"><div style="color:#e74c3c; font-weight:bold; margin-bottom:12px;">Reset Lab?</div><div style="color:#aaa; font-size:0.8rem; margin-bottom:20px;">Clear all progress and restart.</div><div style="display:flex; gap:12px; justify-content:center;"><button id="m4rc" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="m4cc" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('m4rc').addEventListener('click', function() { MAIL004Config._flagRestored = false; MAIL004Config.hints = MAIL004Config._defaultHints; engine.reset(); });
        document.getElementById('m4cc').addEventListener('click', function() { o.remove(); });
        o.addEventListener('click', function(e) { if (e.target === o) o.remove(); });
    }
};
