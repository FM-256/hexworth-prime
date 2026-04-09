/* ============================================================
   DISPATCH LAB — Box AD-006: Replication Failure
   AD Replication & Sites/Services Troubleshooting
   A+ Core 2 & Security+ — 5 scenarios
   ============================================================ */

var AD006Config = {
    title: 'Replication Failure',
    subtitle: 'AD Replication & Sites Troubleshooting — A+ / Security+',
    difficulty: 'Expert',
    accent: '#8b5cf6',
    storageKey: 'hexworth_lab_ad006',
    registryId: 'ad006-replication-failure',
    trackerKey: 'lab_ad006',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the replication alert to understand which DCs are affected.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check replication status', tip: 'Run repadmin /replsummary or repadmin /showrepl to see replication health across all DCs.', trigger: { event: 'command', match: { cmd: 'contains:repadmin' } } },
            { title: 'Identify the root cause', tip: 'Check sites and services, DNS SRV records, lingering objects, or USN rollback status.', trigger: { event: 'command', match: { cmd: 'contains:repadmin' }, alt: [{ event: 'command', match: { cmd: 'contains:dcdiag' } }, { event: 'command', match: { cmd: 'contains:nslookup' } }] } },
            { title: 'Fix the replication issue', tip: 'Apply the appropriate fix: associate subnets, remove lingering objects, fix DNS records, or resolve USN rollback.', trigger: { event: 'command', match: { cmd: 'contains:repadmin' }, alt: [{ event: 'window_open', match: { type: 'sites_services' } }] } },
            { title: 'Verify and capture the flag', tip: 'Force replication and verify it succeeds. Flag appears after successful sync.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'A+ Core 2 / Security+',
        mappings: [
            { flagId: 'fixed', objective: '2.5', description: 'Given a scenario, implement cybersecurity resilience', skill: 'AD Replication Troubleshooting' },
            { flagId: 'fixed', objective: '3.8', description: 'Implement identity and account management controls', skill: 'Sites and Services Configuration' },
            { flagId: 'fixed', objective: '4.1', description: 'Summarize monitoring resources', skill: 'DCDiag and Repadmin Analysis' }
        ]
    },

    _dcList: [
        { name: 'DC01', site: 'HQ-Site', ip: '192.168.1.10', os: 'Windows Server 2022', role: 'PDC Emulator, Schema Master' },
        { name: 'DC02', site: 'HQ-Site', ip: '192.168.1.11', os: 'Windows Server 2022', role: 'RID Master, Infrastructure Master' },
        { name: 'DC03', site: 'Branch-Site', ip: '10.10.1.10', os: 'Windows Server 2022', role: 'Domain Naming Master' },
        { name: 'DC04', site: 'DR-Site', ip: '172.16.1.10', os: 'Windows Server 2019', role: 'Global Catalog' }
    ],

    _sites: [
        { name: 'HQ-Site', subnets: ['192.168.1.0/24'], link: 'DEFAULTIPSITELINK' },
        { name: 'Branch-Site', subnets: ['10.10.1.0/24'], link: 'HQ-Branch-Link' },
        { name: 'DR-Site', subnets: ['172.16.1.0/24'], link: 'HQ-DR-Link' }
    ],

    _scenarios: [
        {
            id: 'repl_lag',
            name: 'DC-to-DC Replication Lag — Sites and Services',
            ticketSubject: 'Branch office users see stale data — password changes take hours to replicate',
            ticketDetail: 'Users at the branch office (DC03) are reporting that password changes made at HQ take 3-4 hours to replicate. When a user changes their password at HQ, they cannot log into branch office resources for hours. The site link schedule should replicate every 15 minutes.',
            ticketExtra: 'IT Note: The "HQ-Branch-Link" site link has its replication interval set to 180 minutes (3 hours) instead of the expected 15 minutes. Someone changed it during a bandwidth conservation effort months ago and never reverted it. Fix: Set the replication interval back to 15 minutes in Sites and Services.',
            fixDescription: 'Change HQ-Branch-Link site link replication interval from 180 to 15 minutes',
            stateOverrides: { _replIntervalFixed: false }
        },
        {
            id: 'subnet_missing',
            name: 'Subnets Not Associated with Correct Site',
            ticketSubject: 'New office subnet 10.20.1.0/24 authenticating against wrong DC — slow logins',
            ticketDetail: 'A new satellite office was set up on subnet 10.20.1.0/24. Users there are experiencing 15-second login delays. Network traces show authentication requests going to DC01 at HQ instead of DC03 at the branch. The satellite office is physically adjacent to the branch and should use DC03.',
            ticketExtra: 'IT Note: The subnet 10.20.1.0/24 was never added to AD Sites and Services. Without a subnet-to-site mapping, clients fall back to the default site (HQ-Site) and authenticate against DC01 over the WAN link. Fix: Add subnet 10.20.1.0/24 to Branch-Site in Sites and Services.',
            fixDescription: 'Add subnet 10.20.1.0/24 to Branch-Site in AD Sites and Services',
            stateOverrides: { _subnetFixed: false }
        },
        {
            id: 'lingering_objects',
            name: 'Lingering Objects Blocking Replication',
            ticketSubject: 'Replication from DC04 (DR site) failing with error 8606 — "insufficient attributes"',
            ticketDetail: 'DC04 at the DR site has not replicated successfully for 95 days. repadmin /showrepl shows error 8606 for all partitions replicating from DC04. The error message says "Insufficient attributes were given to create an object." DC04 was offline for maintenance and exceeded the tombstone lifetime (90 days).',
            ticketExtra: 'IT Note: DC04 was offline for 95 days during a data center move, exceeding the 90-day tombstone lifetime. Lingering objects on DC04 are blocking replication. Fix: Use repadmin /removelingeringobjects to clean DC04, then force replication. If objects cannot be removed, the strict replication consistency flag may need to be temporarily relaxed.',
            fixDescription: 'Remove lingering objects from DC04 with repadmin, then force replication sync',
            stateOverrides: { _lingeringFixed: false }
        },
        {
            id: 'usn_rollback',
            name: 'USN Rollback Detected',
            ticketSubject: 'DC02 showing "DSA not writable" error — possible USN rollback from VM snapshot restore',
            ticketDetail: 'DC02 is no longer accepting changes or replicating. Event Viewer shows Event ID 2095 (USN rollback detected). Investigation reveals that a VM administrator restored DC02 from an old snapshot during troubleshooting instead of using a proper system state backup. The USN (Update Sequence Number) went backwards.',
            ticketExtra: 'IT Note: USN rollback is a critical AD error caused by restoring a DC from a non-AD-aware snapshot. DC02\'s USN went backwards, which means other DCs will refuse to replicate with it to prevent data corruption. Fix: DC02 must be demoted (dcpromo) and re-promoted, or the database can be forcefully resynced. The NTDS database is in a quarantined state.',
            fixDescription: 'Demote DC02 with dcpromo, clean up metadata, then re-promote it to restore replication',
            stateOverrides: { _usnFixed: false }
        },
        {
            id: 'dns_srv_missing',
            name: '_msdcs DNS SRV Record Missing',
            ticketSubject: 'Clients cannot locate DC03 — "domain controller not found" errors at branch',
            ticketDetail: 'Branch office clients are getting "A domain controller for the domain hexworth.local could not be contacted" errors. DC03 is running and reachable by IP, but clients cannot discover it via DNS. nslookup for _ldap._tcp.Branch-Site._sites.dc._msdcs.hexworth.local returns no results.',
            ticketExtra: 'IT Note: The DNS SRV records for DC03 under _msdcs.hexworth.local are missing. This can happen when the Netlogon service fails to register, or when DNS scavenging deletes stale records. Fix: Restart Netlogon service on DC03 to force SRV record re-registration, or manually create the SRV records. Also run dcdiag /test:dns to verify.',
            fixDescription: 'Restart Netlogon on DC03 to re-register SRV records, verify with nslookup',
            stateOverrides: { _dnsFixed: false }
        }
    ],

    _eventLogs: {
        repl_lag: [
            { id: 1, time: '2026-03-29T06:00:00', eventId: 1311, source: 'DC01', username: 'SYSTEM', category: 'Replication', desc: 'Replication to DC03 (Branch-Site) completed. Next replication in 180 minutes.', detail: 'Source DC: DC01\nDestination DC: DC03\nSite Link: HQ-Branch-Link\nReplication Interval: 180 minutes\nExpected Interval: 15 minutes\nLast successful replication: 2026-03-29 06:00:00\nNext scheduled: 2026-03-29 09:00:00' }
        ],
        subnet_missing: [
            { id: 1, time: '2026-03-29T08:00:00', eventId: 5807, source: 'DC01', username: 'SYSTEM', category: 'Netlogon', desc: 'Client from IP 10.20.1.50 — no subnet/site mapping found.', detail: 'Client IP: 10.20.1.50\nSubnet: 10.20.1.0/24\nSite mapping: NOT FOUND\nFallback: Default-First-Site-Name (HQ-Site)\nResult: Client directed to DC01 (HQ) instead of nearest DC\nLatency impact: ~150ms round trip to HQ vs ~2ms to Branch DC03' }
        ],
        lingering_objects: [
            { id: 1, time: '2026-03-29T04:00:00', eventId: 1988, source: 'DC01', username: 'SYSTEM', category: 'Replication', desc: 'Replication from DC04 blocked — lingering objects detected (error 8606).', detail: 'Source DC: DC04 (DR-Site)\nDestination DC: DC01 (HQ-Site)\nError: 8606 — Insufficient attributes to create object\nCause: DC04 offline for 95 days (tombstone lifetime = 90 days)\nLingering objects: 47 detected\nReplication status: BLOCKED' }
        ],
        usn_rollback: [
            { id: 1, time: '2026-03-29T02:00:00', eventId: 2095, source: 'DC02', username: 'SYSTEM', category: 'Replication', desc: 'CRITICAL: USN rollback detected on DC02. AD database quarantined.', detail: 'DC: DC02 (HQ-Site)\nCurrent USN: 145000\nExpected USN: 189000 (went BACKWARDS)\nCause: VM snapshot restore (non-AD-aware)\nStatus: DSA not writable\nReplication: HALTED with all partners\nFix: Demote and re-promote DC02, or forceful recovery.' }
        ],
        dns_srv_missing: [
            { id: 1, time: '2026-03-29T07:00:00', eventId: 5774, source: 'DC03', username: 'SYSTEM', category: 'Netlogon', desc: 'Netlogon failed to register SRV DNS records for DC03.', detail: 'DC: DC03 (Branch-Site)\nDNS Server: 192.168.1.10 (DC01)\nFailed records:\n  _ldap._tcp.Branch-Site._sites.dc._msdcs.hexworth.local\n  _kerberos._tcp.Branch-Site._sites.dc._msdcs.hexworth.local\n  _gc._tcp.Branch-Site._sites.dc._msdcs.hexworth.local\nError: DNS dynamic update failed (timeout)\nNote: Netlogon service may need restart to retry registration.' }
        ]
    },

    _defaultHints: [
        { id: 'hint1', text: 'Run repadmin /replsummary to get an overview of replication health across all DCs.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use repadmin /showrepl for detailed per-DC replication status, including errors and last sync times.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Check dcdiag /test:replications, Sites and Services configuration, and DNS SRV records.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Each scenario has a specific fix: site link interval, subnet mapping, lingering objects, USN recovery, or DNS re-registration.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        repl_lag: [
            { id: 'hint1', text: 'Check the site link replication interval. How often is HQ-Branch-Link configured to replicate?', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The interval is 180 minutes. Standard is 15 minutes. Someone changed it for bandwidth conservation.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Open Sites and Services or use Set-ADReplicationSiteLink to change the interval back to 15 minutes.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Fix: Set replication interval to 15 on HQ-Branch-Link, then repadmin /syncall /AdeP to force immediate sync.', cost: 50, penalty: -50 }
        ],
        subnet_missing: [
            { id: 'hint1', text: 'Check what subnets are registered in Sites and Services. Is 10.20.1.0/24 there?', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Subnet 10.20.1.0/24 is not in Sites and Services. Clients fall back to HQ-Site (slow WAN auth).', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Add the subnet: New-ADReplicationSubnet -Name "10.20.1.0/24" -Site "Branch-Site"', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After adding the subnet, satellite office clients will auto-discover DC03 at the branch. Verify with nltest /dsgetdc:hexworth.local.', cost: 50, penalty: -50 }
        ],
        lingering_objects: [
            { id: 'hint1', text: 'DC04 was offline too long. Check how long and what the tombstone lifetime is.', cost: 0, penalty: 0 },
            { id: 'hint2', text: '95 days offline, tombstone lifetime is 90 days. Lingering objects on DC04 block replication (error 8606).', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Use repadmin /removelingeringobjects DC04 DC01 <partitionDN> /advisory_mode first to preview, then without /advisory_mode to remove.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After removing lingering objects, run repadmin /syncall DC04 /AdeP to force full resync.', cost: 50, penalty: -50 }
        ],
        usn_rollback: [
            { id: 'hint1', text: 'Event 2095 on DC02 means USN rollback. This is caused by restoring from a non-AD-aware snapshot.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'DC02 must be demoted and re-promoted. The AD database is quarantined and cannot be trusted.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Run dcpromo to demote DC02, clean metadata with ntdsutil, then re-promote DC02 to the domain.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Full recovery: (1) dcpromo /forceremoval on DC02, (2) ntdsutil metadata cleanup on DC01, (3) re-promote DC02, (4) verify replication.', cost: 50, penalty: -50 }
        ],
        dns_srv_missing: [
            { id: 'hint1', text: 'Clients cannot find DC03 via DNS. Check if SRV records exist for DC03 under _msdcs.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'nslookup for _ldap._tcp.Branch-Site._sites.dc._msdcs.hexworth.local returns no results. SRV records are missing.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Restart the Netlogon service on DC03: Restart-Service Netlogon -ComputerName DC03. It will re-register SRV records.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After restarting Netlogon, verify with: nslookup -type=srv _ldap._tcp.Branch-Site._sites.dc._msdcs.hexworth.local', cost: 50, penalty: -50 }
        ]
    },

    _ensureScenario: function(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !AD006Config._flagRestored) { AD006Config._flagRestored = true; var s = AD006Config._scenarios[engine.state._scenarioId]; if (s) AD006Config.hints = AD006Config._scenarioHints[s.id] || AD006Config._defaultHints; } return true; },
    _applyScenario: function(engine, idx) { engine.state._scenarioId = idx; engine.state._scenarioSelected = true; engine.state._replIntervalFixed = false; engine.state._subnetFixed = false; engine.state._lingeringFixed = false; engine.state._usnFixed = false; engine.state._dnsFixed = false; engine.state._labComplete = false; engine.state._flagRevealed = false; AD006Config._flagRestored = true; AD006Config.hints = AD006Config._scenarioHints[AD006Config._scenarios[idx].id] || AD006Config._defaultHints; engine.save(); },
    _getScenario: function(engine) { return engine.state._scenarioId != null ? AD006Config._scenarios[engine.state._scenarioId] : null; },
    _requireScenario: function(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket. Open Help Desk Ticket first.\n'; },
    _escHtml: function(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },
    _checkFix: function(engine) {
        var s = AD006Config._getScenario(engine); if (!s || engine.state._labComplete) return;
        var done = false;
        if (s.id === 'repl_lag') done = engine.state._replIntervalFixed;
        if (s.id === 'subnet_missing') done = engine.state._subnetFixed;
        if (s.id === 'lingering_objects') done = engine.state._lingeringFixed;
        if (s.id === 'usn_rollback') done = engine.state._usnFixed;
        if (s.id === 'dns_srv_missing') done = engine.state._dnsFixed;
        if (done) { engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save(); engine.requestFlagText(s.id).then(function(f) { engine.notify(f ? 'Replication issue resolved. Check repadmin output for closure token.' : 'Fixed. Flag pending.', 'success'); }).catch(function() { engine.notify('Fixed. Flag pending.', 'success'); }); }
    },

    boot: { biosLines: ['Dell PowerEdge R750 — BIOS v2.12.1', 'Intel Xeon Gold 5315Y x2', 'Memory: 65536 MB OK', 'RAID-10 OK', 'Loading Windows Boot Manager...'], grubEntries: ['Windows Server 2022 (DC01)'], loginUser: 'Administrator' },
    desktop: { icons: [{ id: 'powershell', label: 'PowerShell', icon: 'PS', app: 'terminal' }, { id: 'event_viewer', label: 'Event\nViewer', icon: 'EVT', app: 'event_viewer' }, { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' }, { id: 'notes', label: 'Notepad', icon: 'TXT', app: 'notes' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }] },
    terminal: { user: 'Administrator', hostname: 'DC01', startDir: 'C:\\Windows\\System32', promptStyle: 'powershell', welcome: 'Windows PowerShell\nCopyright (C) Microsoft Corporation.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:ad006}}', points: 500 }],
    scoring: { base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 2400 },
    hints: [{ id: 'hint1', text: 'Use repadmin to check replication status.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'Check site links, subnets, and DNS SRV records.', cost: 10, penalty: -10 }, { id: 'hint3', text: 'Identify the specific replication blocker.', cost: 25, penalty: -25 }, { id: 'hint4', text: 'Apply the fix and force replication sync.', cost: 50, penalty: -50 }],
    lore: { intro: 'AD replication between domain controllers is failing or severely delayed. As Domain Admin, diagnose and fix the replication infrastructure.', scenario: 'AD replication issues can stem from site link misconfiguration, missing subnet mappings, lingering objects from extended DC downtime, USN rollback from improper VM snapshot restores, or missing DNS SRV records.', outro: 'Replication restored across all domain controllers. Authentication is working properly at all sites.' },
    phases: [{ id: 'investigate', name: 'Investigation', requiredFlags: [], unlocks: ['diagnose'], locked: false }, { id: 'diagnose', name: 'Diagnosis', requiredFlags: [], unlocks: ['repair'], locked: true }, { id: 'repair', name: 'Remediation', requiredFlags: [], unlocks: ['verify'], locked: true }, { id: 'verify', name: 'Verification', requiredFlags: ['fixed'], unlocks: [], locked: true }],

    commands: {
        repadmin: function(args, term, engine) {
            var gate = AD006Config._requireScenario(engine); if (gate) return gate;
            var lower = args.join(' ').toLowerCase(); var s = AD006Config._getScenario(engine);
            if (lower.includes('/replsummary')) {
                var out = '\nReplication Summary Start\n  Beginning data collection for replication summary.\n\n';
                out += 'Source DC      Largest Delta  Fails/Total  %% Error\n';
                out += 'DC01           0:15           0 / 5        0\n';
                if (s.id === 'repl_lag') out += 'DC03           3:00           0 / 5        0    (interval=180min!)\n';
                else out += 'DC03           0:15           0 / 5        0\n';
                if (s.id === 'lingering_objects') out += 'DC04           95d:0:0        5 / 5        100  (error 8606)\n';
                else if (s.id === 'usn_rollback') out += 'DC04           0:15           0 / 5        0\n';
                else out += 'DC04           0:15           0 / 5        0\n';
                if (s.id === 'usn_rollback') out += 'DC02           QUARANTINED    5 / 5        100  (USN ROLLBACK)\n';
                else out += 'DC02           0:15           0 / 5        0\n';
                return out;
            }
            if (lower.includes('/showrepl')) {
                var out = '\nRepadmin: running command /showrepl against DC01\n\n';
                if (s.id === 'lingering_objects') out += 'DC04 via RPC\n    DC=hexworth,DC=local\n        Last attempt @ 2026-03-29 04:00:00 FAILED\n        Error 8606: Insufficient attributes given to create an object\n        47 lingering objects detected.\n        Replication BLOCKED.\n';
                else if (s.id === 'usn_rollback') out += 'DC02 via RPC\n    DC=hexworth,DC=local\n        Last attempt @ 2026-03-29 02:00:00 FAILED\n        Error 8457: USN rollback detected. DC02 is quarantined.\n        DSA is NOT writable.\n';
                else out += 'DC01 <-> DC02: Last sync successful\nDC01 <-> DC03: Last sync successful\nDC01 <-> DC04: Last sync successful\n';
                return out;
            }
            if (lower.includes('/removelingeringobjects') && s.id === 'lingering_objects') {
                engine.state._lingeringFixed = true; engine.save();
                engine.notify('Lingering objects removed from DC04. Replication unblocked.', 'success');
                AD006Config._checkFix(engine);
                return '\nRepadmin: Removing lingering objects from DC04...\n  47 lingering objects found and removed.\n  Replication unblocked.\nRun repadmin /syncall DC04 to force full resync.\n';
            }
            if (lower.includes('/syncall')) {
                return '\nSyncing all partitions...\n  DC=hexworth,DC=local: sync completed.\n  CN=Configuration,DC=hexworth,DC=local: sync completed.\n  CN=Schema,CN=Configuration,DC=hexworth,DC=local: sync completed.\n';
            }
            return '\nRepadmin usage:\n  /replsummary — Summary of all DC replication\n  /showrepl — Detailed replication status\n  /syncall /AdeP — Force sync all partitions\n  /removelingeringobjects <DC> <refDC> <partitionDN>\n';
        },

        dcdiag: function(args, term, engine) {
            var gate = AD006Config._requireScenario(engine); if (gate) return gate;
            var s = AD006Config._getScenario(engine);
            var out = '\nDomain Controller Diagnosis\n\nPerforming initial setup:\n  Ldap search capability attribute search: PASS\n  Verifying DC list...\n\n';
            out += 'Testing DC01:\n  Connectivity: PASS\n  Replication: PASS\n  DNS: PASS\n\n';
            if (s.id === 'usn_rollback') out += 'Testing DC02:\n  Connectivity: PASS\n  Replication: FAIL (USN rollback detected)\n  DNS: PASS\n  *** DC02 requires demotion and re-promotion ***\n\n';
            else out += 'Testing DC02:\n  Connectivity: PASS\n  Replication: PASS\n  DNS: PASS\n\n';
            if (s.id === 'dns_srv_missing') out += 'Testing DC03:\n  Connectivity: PASS\n  Replication: PASS\n  DNS: FAIL — SRV records not registered\n  *** Restart Netlogon service to re-register ***\n\n';
            else out += 'Testing DC03:\n  Connectivity: PASS\n  Replication: PASS\n  DNS: PASS\n\n';
            if (s.id === 'lingering_objects') out += 'Testing DC04:\n  Connectivity: PASS\n  Replication: FAIL (error 8606 — lingering objects)\n  DNS: PASS\n\n';
            else out += 'Testing DC04:\n  Connectivity: PASS\n  Replication: PASS\n  DNS: PASS\n\n';
            return out;
        },

        nslookup: function(args, term, engine) {
            var gate = AD006Config._requireScenario(engine); if (gate) return gate;
            var lower = args.join(' ').toLowerCase(); var s = AD006Config._getScenario(engine);
            if (lower.includes('_msdcs') || lower.includes('_ldap') || lower.includes('srv')) {
                if (s.id === 'dns_srv_missing' && !engine.state._dnsFixed) {
                    return '\nServer:  DC01.hexworth.local\nAddress: 192.168.1.10\n\n*** DC01.hexworth.local can\'t find _ldap._tcp.Branch-Site._sites.dc._msdcs.hexworth.local: Non-existent domain\n\nNote: SRV records for DC03 are MISSING.\n';
                }
                return '\nServer:  DC01.hexworth.local\nAddress: 192.168.1.10\n\n_ldap._tcp.Branch-Site._sites.dc._msdcs.hexworth.local\n  SRV service location:\n    priority = 0\n    weight = 100\n    port = 389\n    svr hostname = DC03.hexworth.local\n';
            }
            return '\nnslookup: Specify a hostname or SRV record.\nExample: nslookup -type=srv _ldap._tcp.dc._msdcs.hexworth.local\n';
        },

        'restart-service': function(args, term, engine) {
            var gate = AD006Config._requireScenario(engine); if (gate) return gate;
            var lower = args.join(' ').toLowerCase(); var s = AD006Config._getScenario(engine);
            if (lower.includes('netlogon') && s.id === 'dns_srv_missing') {
                engine.state._dnsFixed = true; engine.save();
                engine.notify('Netlogon restarted on DC03. SRV records re-registered successfully.', 'success');
                AD006Config._checkFix(engine);
                return '\nNetlogon service restarted on DC03.\nDNS SRV records re-registered:\n  _ldap._tcp.Branch-Site._sites.dc._msdcs.hexworth.local -> DC03\n  _kerberos._tcp.Branch-Site._sites.dc._msdcs.hexworth.local -> DC03\n';
            }
            return '\nRestart-Service : Specify a service name.\n';
        },

        'new-adreplicationsubnet': function(args, term, engine) {
            var gate = AD006Config._requireScenario(engine); if (gate) return gate;
            var lower = args.join(' ').toLowerCase();
            if (lower.includes('10.20.1.0') && lower.includes('branch')) {
                engine.state._subnetFixed = true; engine.save();
                engine.notify('Subnet 10.20.1.0/24 added to Branch-Site. Satellite clients will now use DC03.', 'success');
                AD006Config._checkFix(engine);
                return '\n(no output — subnet 10.20.1.0/24 added to Branch-Site)\n';
            }
            return '\nNew-ADReplicationSubnet : Specify -Name "subnet" -Site "sitename".\n';
        },

        'set-adreplicationsitelink': function(args, term, engine) {
            var gate = AD006Config._requireScenario(engine); if (gate) return gate;
            var lower = args.join(' ').toLowerCase();
            if (lower.includes('hq-branch') && (lower.includes('15') || lower.includes('replicationfrequency'))) {
                engine.state._replIntervalFixed = true; engine.save();
                engine.notify('HQ-Branch-Link replication interval set to 15 minutes.', 'success');
                AD006Config._checkFix(engine);
                return '\n(no output — site link replication frequency updated to 15 minutes)\n';
            }
            return '\nSet-ADReplicationSiteLink : Specify -Identity and -ReplicationFrequencyInMinutes.\n';
        },

        dcpromo: function(args, term, engine) {
            var gate = AD006Config._requireScenario(engine); if (gate) return gate;
            var lower = args.join(' ').toLowerCase(); var s = AD006Config._getScenario(engine);
            if (s.id === 'usn_rollback' && lower.includes('/forceremoval')) {
                engine.state._usnFixed = true; engine.save();
                engine.notify('DC02 forcefully demoted. Clean up metadata and re-promote when ready.', 'success');
                AD006Config._checkFix(engine);
                return '\nDomain Controller Demotion\n\nDC02 is being forcefully demoted...\nRemoving Active Directory Domain Services...\nThe server was successfully demoted.\n\nNext steps:\n1. Clean up metadata: ntdsutil -> metadata cleanup -> remove selected server DC02\n2. Re-promote: Install-ADDSDomainController\n';
            }
            return '\ndcpromo : Use /forceremoval for USN rollback recovery.\n';
        },

        whoami: function() { return 'HEXWORTH\\Administrator'; },
        hostname: function() { return 'DC01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; }
    },

    onAppLaunch: function(iconDef, engine) {
        if (iconDef.app === 'event_viewer' && !engine.state._scenarioSelected) { engine.notify('Open Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': AD006Config._openTicket(iconDef, engine); break;
            case 'event_viewer': AD006Config._openEV(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset lab?')) engine.resetLab(); break;
        }
    },

    _openTicket: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'tc006'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        AD006Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) { var s = AD006Config._getScenario(engine); c.innerHTML = '<div style="color:#8b5cf6; font-weight:bold; font-size:1rem; margin-bottom:16px;">INCIDENT #INC-' + (4400 + engine.state._scenarioId) + '</div><div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + AD006Config._escHtml(s.ticketSubject) + '</div></div><div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + AD006Config._escHtml(s.ticketDetail) + '</div></div><div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(139,92,246,0.08); border:1px solid rgba(139,92,246,0.25); border-radius:4px; padding:12px; line-height:1.6; color:#c4b5fd;">' + AD006Config._escHtml(s.ticketExtra) + '</div></div><div style="color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div>'; }
        else {
            var previews = ['Branch replication takes 3 hours instead of 15 min', 'New satellite office auth going to wrong DC', 'DC04 replication blocked — 95 days offline', 'DC02 USN rollback from bad VM snapshot', 'Branch clients cannot find DC03 — DNS SRV missing'];
            var h = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#8b5cf6; font-weight:bold; font-size:1.1rem;">AD REPLICATION FAILURES</div></div>';
            AD006Config._scenarios.forEach(function(s, i) { h += '<button class="sb" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; cursor:pointer; font-family:Consolas,monospace;"><span style="color:#8b5cf6; font-weight:bold;">INC-' + (4400+i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>'; });
            h += '<div style="text-align:center; padding-top:16px;"><button id="rb" style="padding:10px 28px; background:#8b5cf6; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
            c.innerHTML = h;
            c.querySelectorAll('.sb').forEach(function(b) { b.addEventListener('click', function() { AD006Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); AD006Config._openTicket(iconDef, engine); }); });
            document.getElementById('rb').addEventListener('click', function() { AD006Config._applyScenario(engine, Math.floor(Math.random()*5)); AD006Config._openTicket(iconDef, engine); });
        }
    },

    _openEV: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.style.cssText = 'display:flex; flex-direction:column; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Event Viewer', 'EVT', c);
        var s = AD006Config._getScenario(engine); var logs = s ? (AD006Config._eventLogs[s.id] || []) : [];
        var h = '<div style="padding:10px 16px; border-bottom:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2);"><span style="color:#8b5cf6; font-weight:bold;">Replication Event Log</span></div><div style="flex:1; overflow-y:auto;">';
        logs.forEach(function(e) { var col = e.eventId === 2095 ? '#e74c3c' : e.eventId === 1988 ? '#e74c3c' : '#e67e22'; h += '<div style="border-bottom:1px solid rgba(255,255,255,0.04); cursor:pointer;" onclick="this.querySelector(\'.d\').style.display=this.querySelector(\'.d\').style.display===\'none\'?\'block\':\'none\'"><div style="display:flex; padding:6px 12px;"><span style="flex:1.5; color:#888; font-size:0.75rem;">' + e.time.replace('T',' ').substring(0,19) + '</span><span style="flex:0.5; color:' + col + '; font-weight:bold;">' + e.eventId + '</span><span style="flex:3; font-size:0.75rem;">' + e.desc + '</span></div><div class="d" style="display:none; background:rgba(0,0,0,0.3); border-left:3px solid ' + col + '; padding:10px 16px; font-size:0.75rem; white-space:pre-wrap; color:#aaa;">' + e.detail + '</div></div>'; });
        h += '</div>'; c.innerHTML = h;
    }
};
