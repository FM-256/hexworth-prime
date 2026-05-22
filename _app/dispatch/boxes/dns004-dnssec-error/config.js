/* ============================================================
   DISPATCH LAB — Box DNS004: DNSSEC Validation Error
   DNS Troubleshooting — RRSIG expired, DS missing, key rollover
   failed, BOGUS rejection, NSEC3 false NXDOMAIN
   ============================================================ */

var DNS004Config = {

    title: 'DNSSEC Validation Error',
    subtitle: 'Trust Chain Broken — DNS Troubleshooting',
    difficulty: 'Advanced',
    accent: '#3a8fd4',
    storageKey: 'hexworth_lab_dns004',
    registryId: 'dns004-dnssec-error',
    trackerKey: 'lab_dns004',
    tutorialMode: true,
    tutorial: { steps: [
        { title: 'Open the Help Desk Ticket', tip: 'Read the DNSSEC validation failure report.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
        { title: 'Check DNSSEC status', tip: 'Use dig +dnssec or delv to inspect DNSSEC signatures and chain of trust.', trigger: { event: 'command', match: { cmd: 'contains:dig' }, alt: [{ event: 'command', match: { cmd: 'contains:delv' } }] } },
        { title: 'Identify the DNSSEC issue', tip: 'Check RRSIG expiry, DS records, key rollover status, validation results, and NSEC3.', trigger: { event: 'command', match: { cmd: 'contains:dnssec' }, alt: [{ event: 'command', match: { cmd: 'contains:rrsig' } }, { event: 'command', match: { cmd: 'contains:dnskey' } }] } },
        { title: 'Apply the fix', tip: 'Re-sign the zone, publish DS record, complete key rollover, clear BOGUS cache, or fix NSEC3.', trigger: { event: 'command', match: { cmd: 'contains:dnscmd' }, alt: [{ event: 'command', match: { cmd: 'contains:sign' } }] } },
        { title: 'Capture the flag', tip: 'After fixing DNSSEC, the recovery token appears.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
    ] },
    certObjectives: { certPath: 'Network+', mappings: [{ flagId: 'fixed', objective: '4.1', description: 'Explain common security concepts', skill: 'DNSSEC Troubleshooting' }] },
    _servers: [{ name: 'DNS-01', ip: '10.0.1.5', os: 'Windows Server 2022', role: 'DNSSEC-Signing Primary DNS' }],

    _scenarios: [
        { id: 'rrsig_expired', name: 'RRSIG Signature Expired', ticketSubject: 'DNSSEC validation failing — RRSIG signatures have expired', ticketDetail: 'DNSSEC-validating resolvers are rejecting responses for secure.contoso.com because the RRSIG (signature) records have expired. The zone was signed 90 days ago with a signature validity of 30 days, but the automatic re-signing job was disabled by accident. All RRSIG records expired 60 days ago. Validating resolvers return SERVFAIL.', ticketExtra: 'DNSSEC Note: RRSIG records have an expiration date. If the zone is not re-signed before expiry, validating resolvers will reject the responses as BOGUS. The zone must be re-signed with fresh RRSIG records.', affectedServer: 0, fixDescription: 'Re-sign the zone to generate fresh RRSIG records', stateOverrides: { _dnssecIssue: 'rrsig_expired', _fixed: false } },
        { id: 'ds_missing', name: 'DS Record Missing at Parent', ticketSubject: 'DNSSEC chain of trust broken — parent zone missing DS record', ticketDetail: 'The contoso.com zone is properly signed with DNSSEC, but the parent zone (.com) does not have a DS (Delegation Signer) record for contoso.com. Without the DS record at the parent, resolvers cannot build the chain of trust from the root down to contoso.com. Validation fails with "no valid trust anchor."', ticketExtra: 'DNSSEC Note: The DS record at the parent zone is the link in the chain of trust. It contains a hash of the child zone\'s KSK (Key Signing Key). The DS record must be submitted to the domain registrar who publishes it in the parent zone.', affectedServer: 0, fixDescription: 'Generate and submit the DS record to the parent zone registrar', stateOverrides: { _dnssecIssue: 'ds_missing', _fixed: false } },
        { id: 'key_rollover', name: 'Key Rollover Failed', ticketSubject: 'DNSSEC key rollover incomplete — new KSK not published', ticketDetail: 'A KSK (Key Signing Key) rollover was initiated but not completed. The new KSK was generated and the zone was re-signed with it, but the new DS record was never published at the parent. Resolvers that have the old trust anchor cannot validate signatures made with the new key. The old key has already been removed from the zone.', ticketExtra: 'DNSSEC Note: KSK rollover requires: 1) Generate new KSK, 2) Publish both old and new KSK in zone, 3) Submit new DS to parent, 4) Wait for propagation, 5) Remove old KSK. Step 3 was skipped and step 5 was done prematurely.', affectedServer: 0, fixDescription: 'Publish the new DS record at the parent and restore the old KSK temporarily', stateOverrides: { _dnssecIssue: 'key_rollover', _fixed: false } },
        { id: 'bogus_response', name: 'Client Rejecting BOGUS Response', ticketSubject: 'Validating resolver caching BOGUS result — domain unreachable', ticketDetail: 'A DNSSEC validation failure occurred briefly (now resolved), but the validating resolver has cached the BOGUS (invalid) result. Even though the zone is now properly signed, the resolver continues to return SERVFAIL because its negative cache holds the BOGUS entry. The cache TTL for BOGUS results is 900 seconds (15 minutes).', ticketExtra: 'Resolver Note: DNSSEC-validating resolvers cache negative results (BOGUS) to prevent repeated validation attempts. The cached BOGUS entry must be flushed, or you must wait for the cache TTL to expire.', affectedServer: 0, fixDescription: 'Flush the BOGUS cache entry on the validating resolver', stateOverrides: { _dnssecIssue: 'bogus_cache', _fixed: false } },
        { id: 'nsec3_nxdomain', name: 'NSEC3 Opt-Out Causing False NXDOMAIN', ticketSubject: 'Existing subdomain returning NXDOMAIN — NSEC3 opt-out issue', ticketDetail: 'A newly created subdomain (newapp.contoso.com) is returning authenticated NXDOMAIN responses even though the A record exists. The zone uses NSEC3 with opt-out enabled. The new record was added after the last zone signing, so no NSEC3 record covers it. Validating resolvers see the NSEC3 proof-of-nonexistence and return NXDOMAIN.', ticketExtra: 'DNSSEC Note: NSEC3 opt-out allows unsigned delegations to exist without NSEC3 records. However, when new records are added, the zone must be re-signed to update the NSEC3 chain. Without re-signing, the old NSEC3 records incorrectly prove the new name does not exist.', affectedServer: 0, fixDescription: 'Re-sign the zone to update the NSEC3 chain with the new record', stateOverrides: { _dnssecIssue: 'nsec3_nxdomain', _fixed: false } }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Use dig +dnssec to check RRSIG records and their expiration dates.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Check the chain of trust: root -> .com -> contoso.com (DS at each level).', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'DNSSEC issues: expired RRSIG, missing DS, incomplete rollover, cached BOGUS, stale NSEC3.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after fixing the DNSSEC issue.', cost: 50, penalty: -50 }
    ],
    _scenarioHints: {
        rrsig_expired: [{ id: 'hint1', text: 'RRSIG signatures have expiration dates. If expired, validation fails.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'dig +dnssec shows RRSIG records expired 60 days ago. Zone needs re-signing.', cost: 50, penalty: -50 }, { id: 'hint3', text: 'Re-sign the zone: dnscmd /offlinesign or zone re-sign command.', cost: 100, penalty: -100 }, { id: 'hint4', text: 'Fix: dnscmd DNS-01 /zonresign contoso.com. Enable automatic re-signing to prevent recurrence.', cost: 150, penalty: -150 }],
        ds_missing: [{ id: 'hint1', text: 'The zone is signed but the parent does not have a DS record. Chain of trust is broken.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'dig DS contoso.com @parent returns empty. No DS record at .com level.', cost: 50, penalty: -50 }, { id: 'hint3', text: 'Generate DS record from KSK and submit to registrar: dnssec-dsfromkey.', cost: 100, penalty: -100 }, { id: 'hint4', text: 'Fix: Generate DS with dnscmd /retrievedsrecord contoso.com, submit to registrar.', cost: 150, penalty: -150 }],
        key_rollover: [{ id: 'hint1', text: 'The KSK rollover was incomplete — new DS was never published at parent.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'The old KSK was removed but the parent still has the old DS. Trust chain broken.', cost: 50, penalty: -50 }, { id: 'hint3', text: 'Re-add the old KSK temporarily and submit the new DS to the parent.', cost: 100, penalty: -100 }, { id: 'hint4', text: 'Fix: Restore old KSK, submit new DS to registrar, wait for propagation, then remove old KSK.', cost: 150, penalty: -150 }],
        bogus_cache: [{ id: 'hint1', text: 'The zone is fixed but the resolver cached the BOGUS result. Flush the cache.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'The BOGUS cache entry has a TTL of 900 seconds. Either flush or wait.', cost: 50, penalty: -50 }, { id: 'hint3', text: 'Flush the resolver cache: ipconfig /flushdns or rndc flush on the resolver.', cost: 100, penalty: -100 }, { id: 'hint4', text: 'Fix: ipconfig /flushdns on clients. On the resolver: Clear-DnsServerCache or rndc flush.', cost: 150, penalty: -150 }],
        nsec3_nxdomain: [{ id: 'hint1', text: 'New record exists but NSEC3 chain still says it does not. Zone needs re-signing.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'The NSEC3 chain was not updated after adding the new record.', cost: 50, penalty: -50 }, { id: 'hint3', text: 'Re-sign the zone to regenerate the NSEC3 chain including the new record.', cost: 100, penalty: -100 }, { id: 'hint4', text: 'Fix: dnscmd /zonresign contoso.com. The NSEC3 chain will be rebuilt with the new record.', cost: 150, penalty: -150 }]
    },

    _ensureScenario(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !DNS004Config._flagRestored) { DNS004Config._flagRestored = true; var s = DNS004Config._scenarios[engine.state._scenarioId]; if (s) DNS004Config.hints = DNS004Config._scenarioHints[s.id] || DNS004Config._defaultHints; } return true; },
    _applyScenario(engine, idx) { engine.state._scenarioId = idx; engine.state._scenarioSelected = true; engine.state._dnssecIssue = null; engine.state._fixed = false; engine.state._labComplete = false; engine.state._flagRevealed = false; var o = DNS004Config._scenarios[idx].stateOverrides || {}; for (var k in o) engine.state[k] = o[k]; DNS004Config._flagRestored = true; DNS004Config.hints = DNS004Config._scenarioHints[DNS004Config._scenarios[idx].id] || DNS004Config._defaultHints; engine.save(); },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : DNS004Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },
    _revealFlag(engine) { engine.state._fixed = true; engine.state._flagRevealed = true; engine.state._labComplete = true; engine.save(); setTimeout(function() { engine.notify('DNSSEC issue resolved. Check DNS Manager for recovery token.', 'success'); }, 400); },

    boot: { biosLines: ['Dell PowerEdge R640', 'Memory: 32768 MB OK'], grubEntries: ['Windows Server 2022'], loginUser: 'Administrator' },
    desktop: { icons: [{ id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' }, { id: 'dns_manager', label: 'DNS\nManager', icon: 'DNS', app: 'dns_manager' }, { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }] },
    terminal: { user: 'Administrator', hostname: 'DNS-01', startDir: 'C:\\Users\\Administrator', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.20348]\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [{ id: 'hint1', text: 'Check DNSSEC with dig +dnssec.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'Verify the chain of trust.', cost: 10, penalty: -10 }, { id: 'hint3', text: 'DNSSEC has multiple failure modes.', cost: 25, penalty: -25 }, { id: 'hint4', text: 'Flag appears after fixing.', cost: 50, penalty: -50 }],
    lore: { intro: 'DNSSEC adds cryptographic trust to DNS, but when it breaks, it breaks HARD. Validating resolvers will refuse to serve data they cannot verify.', scenario: 'Each scenario targets a different part of the DNSSEC trust chain.', outro: 'DNSSEC trust chain restored. Validating resolvers are accepting signed responses again.' },
    phases: [{ id: 'investigate', name: 'Investigation', requiredFlags: [], unlocks: ['diagnose'], locked: false }, { id: 'diagnose', name: 'Diagnosis', requiredFlags: [], unlocks: ['repair'], locked: true }, { id: 'repair', name: 'Repair', requiredFlags: [], unlocks: ['verify'], locked: true }, { id: 'verify', name: 'Verification', requiredFlags: ['fixed'], unlocks: [], locked: true }],

    commands: {
        dig: function(args, term, engine) {
            var gate = DNS004Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase(); var s = DNS004Config._getScenario(engine);

            if (joined.includes('+dnssec') || joined.includes('rrsig') || joined.includes('dnskey')) {
                if (s && s.id === 'rrsig_expired' && !engine.state._fixed) return '\n;; ->>HEADER<<- opcode: QUERY, status: SERVFAIL\n;; flags: qr rd ra; QUERY: 1, ANSWER: 0\n\n;; RRSIG record found but EXPIRED:\n;; secure.contoso.com. 300 IN RRSIG A 8 3 300 20260129000000 20260130000000 12345 contoso.com.\n;; Signature expired on: Jan 30, 2026 (60 days ago)\n;; VALIDATION: FAILED — signature expired';
                if (s && s.id === 'ds_missing' && !engine.state._fixed) return '\n;; Checking DS at parent (.com):\n;; contoso.com.    IN    DS    (NO DS RECORD FOUND)\n;;\n;; Chain of trust: ROOT -> .com -> contoso.com\n;; Status: BROKEN at .com level — no DS record for contoso.com\n;; VALIDATION: FAILED — no valid trust anchor';
                if (s && s.id === 'key_rollover' && !engine.state._fixed) return '\n;; DNSKEY records in zone:\n;; contoso.com. 3600 IN DNSKEY 257 3 8 AwEAAb... (NEW KSK, tag=54321)\n;;\n;; DS record at parent (.com):\n;; contoso.com. 86400 IN DS 12345 8 2 abc123... (OLD KSK, tag=12345)\n;;\n;; MISMATCH: Parent DS references old KSK (12345) but zone only has new KSK (54321)\n;; VALIDATION: FAILED — DS does not match any DNSKEY in zone';
                if (s && s.id === 'bogus_cache' && !engine.state._fixed) return '\n;; ->>HEADER<<- opcode: QUERY, status: SERVFAIL\n;; flags: qr rd ra;\n;;\n;; Resolver has cached BOGUS result for secure.contoso.com\n;; Cache TTL remaining: 720 seconds\n;; The zone signatures are now valid, but the resolver is returning cached BOGUS.\n;; Flush the resolver cache to clear the stale negative entry.';
                if (s && s.id === 'nsec3_nxdomain' && !engine.state._fixed) return '\n;; ->>HEADER<<- opcode: QUERY, status: NXDOMAIN (authenticated)\n;; flags: qr aa rd ra ad;\n;;\n;; NSEC3 proof of non-existence for newapp.contoso.com:\n;; NSEC3 1 1 10 aabb hash1.contoso.com -> hash2.contoso.com\n;;\n;; But the A record for newapp.contoso.com EXISTS in the zone!\n;; The NSEC3 chain is stale — it was not regenerated after adding the record.\n;; Re-sign the zone to update NSEC3.';
                return '\n;; ->>HEADER<<- opcode: QUERY, status: NOERROR\n;; flags: qr aa rd ra ad; (ad = authenticated data)\n;; ANSWER SECTION:\nsecure.contoso.com. 300 IN A 10.0.1.40\nsecure.contoso.com. 300 IN RRSIG A 8 3 300 20260630000000 20260330000000 54321 contoso.com.\n\n;; VALIDATION: SECURE';
            }
            return '\nUsage: dig +dnssec <hostname>\n       dig RRSIG <hostname>\n       dig DNSKEY <zone>\n       dig DS <zone> @parent';
        },

        dnscmd: function(args, term, engine) {
            var gate = DNS004Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase(); var s = DNS004Config._getScenario(engine);

            if (joined.includes('resign') || joined.includes('sign')) {
                if (s && (s.id === 'rrsig_expired' || s.id === 'nsec3_nxdomain')) { DNS004Config._revealFlag(engine); return '\nZone contoso.com re-signed successfully.\n' + (s.id === 'rrsig_expired' ? 'All RRSIG records regenerated with new expiration dates.\nSignature validity: 30 days from now.' : 'NSEC3 chain rebuilt. newapp.contoso.com is now covered.\nAll records properly included in denial-of-existence proof.'); }
                return '\nZone signed. RRSIG records updated.';
            }

            if (joined.includes('retrieveds') || joined.includes('dsfromkey') || joined.includes('ds')) {
                if (s && s.id === 'ds_missing') { DNS004Config._revealFlag(engine); return '\nDS Record generated for contoso.com:\n  contoso.com. 86400 IN DS 54321 8 2 e5f6a7b8c9d0...\n\nSubmit this DS record to your domain registrar.\nDS record published successfully at parent zone.'; }
                if (s && s.id === 'key_rollover') { DNS004Config._revealFlag(engine); return '\nNew DS Record for KSK tag 54321:\n  contoso.com. 86400 IN DS 54321 8 2 e5f6a7b8c9d0...\n\nSubmitted to parent zone. Old KSK restored temporarily.\nKey rollover can complete once new DS propagates (24-48 hours).'; }
            }

            return '\nUsage: dnscmd /zonresign <zone>\n       dnscmd /retrievedsrecord <zone>\n       dnscmd /offlinekeyflag <zone>';
        },

        ipconfig: function(args, term, engine) {
            var gate = DNS004Config._requireScenario(engine); if (gate) return gate;
            var joined = args.join(' ').toLowerCase(); var s = DNS004Config._getScenario(engine);
            if (joined.includes('/flushdns')) {
                if (s && s.id === 'bogus_cache') { DNS004Config._revealFlag(engine); return '\nSuccessfully flushed the DNS Resolver Cache.\nBOGUS cached entry for secure.contoso.com cleared.\nNext query will perform fresh DNSSEC validation.'; }
                return '\nSuccessfully flushed the DNS Resolver Cache.';
            }
            return '\nIPv4 Address: 10.0.1.5';
        },

        nslookup: function(args, term, engine) {
            var gate = DNS004Config._requireScenario(engine); if (gate) return gate;
            var s = DNS004Config._getScenario(engine);
            if (s && !engine.state._fixed) {
                if (s.id === 'rrsig_expired' || s.id === 'ds_missing' || s.id === 'key_rollover' || s.id === 'bogus_cache') return '\nServer:  DNS-01\nAddress:  10.0.1.5\n\n*** DNS-01 can\'t find secure.contoso.com: Server failed\n\nSERVFAIL — DNSSEC validation failure.\nUse "dig +dnssec secure.contoso.com" for detailed DNSSEC diagnostics.';
                if (s.id === 'nsec3_nxdomain') return '\nServer:  DNS-01\nAddress:  10.0.1.5\n\n*** DNS-01 can\'t find newapp.contoso.com: Non-existent domain\n\nNXDOMAIN (authenticated) — NSEC3 proves this name does not exist.\nBut the record was recently added! The NSEC3 chain is stale.';
            }
            return '\nServer:  DNS-01\nAddress:  10.0.1.5\n\nName:    secure.contoso.com\nAddress:  10.0.1.40';
        },

        delv: function(args, term, engine) {
            var gate = DNS004Config._requireScenario(engine); if (gate) return gate;
            var s = DNS004Config._getScenario(engine);
            if (s && !engine.state._fixed) return '\n; unsigned answer\n; secure.contoso.com.    300   IN   A   10.0.1.40\n;; validating: FAILED\n;; reason: ' + (s.id === 'rrsig_expired' ? 'RRSIG signature expired' : s.id === 'ds_missing' ? 'no valid DS at parent' : s.id === 'key_rollover' ? 'DS/DNSKEY mismatch' : s.id === 'bogus_cache' ? 'cached BOGUS result' : 'NSEC3 proof contradicts existence');
            return '\n; fully validated\n; secure.contoso.com.    300   IN   A   10.0.1.40\n;; DNSSEC validation: SECURE';
        },

        whoami: function() { return 'DNS-01\\Administrator'; },
        hostname: function() { return 'DNS-01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        ping: function() { return '\nReply from 10.0.1.5: bytes=32 time<1ms TTL=128'; }
    },

    onAppLaunch(iconDef, engine) {
        if (iconDef.app === 'dns_manager' && !engine.state._scenarioSelected) { engine.notify('Open the Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': DNS004Config._openTicket(iconDef, engine); break;
            case 'dns_manager': DNS004Config._openDNS(iconDef, engine); break;
            case 'reset_lab': DNS004Config._confirmReset(engine); break;
        }
    },
    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c); DNS004Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) DNS004Config._renderTicket(engine, c); else DNS004Config._renderPicker(engine, c);
    },
    _renderPicker(engine, c) {
        var p = ['Security — "RRSIG signatures expired — validation failing"', 'DNS Admin — "Parent zone missing DS record"', 'DNS Admin — "KSK rollover incomplete — trust broken"', 'Users — "Resolver caching BOGUS result"', 'DevOps — "New subdomain returns false NXDOMAIN via NSEC3"'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#3a8fd4; font-weight:bold; font-size:1.1rem;">INCIDENT QUEUE</div></div><div>';
        DNS004Config._scenarios.forEach(function(s, i) { html += '<button class="dns004-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><div style="display:flex; justify-content:space-between;"><span style="color:#3a8fd4; font-weight:bold;">DNSSEC-' + (4001 + i) + '</span><span style="background:#e74c3c; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">CRITICAL</span></div><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + p[i] + '</div></button>'; });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="dns004Rand" style="padding:10px 28px; background:#3a8fd4; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
        c.innerHTML = html;
        c.querySelectorAll('.dns004-btn').forEach(function(b) { b.addEventListener('click', function() { DNS004Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); DNS004Config._renderTicket(engine, c); }); });
        document.getElementById('dns004Rand').addEventListener('click', function() { DNS004Config._applyScenario(engine, Math.floor(Math.random() * 5)); DNS004Config._renderTicket(engine, c); });
    },
    _renderTicket(engine, c) {
        var s = DNS004Config._getScenario(engine); var names = ['Security Team', 'DNS Admin — Brian Cole', 'DNS Admin — Brian Cole', 'Monitoring System', 'DevOps — Platform Team'];
        c.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><div style="display:flex; justify-content:space-between;"><span style="color:#3a8fd4; font-weight:bold;">TICKET #DNSSEC-' + (4001 + engine.state._scenarioId) + '</span><span style="background:#e74c3c; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem;">CRITICAL</span></div></div><div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">REPORTED BY</div><div>' + names[engine.state._scenarioId] + '</div></div><div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + DNS004Config._escHtml(s.ticketSubject) + '</div></div><div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + DNS004Config._escHtml(s.ticketDetail) + '</div></div>' + (s.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(58,143,212,0.08); border:1px solid rgba(58,143,212,0.2); border-radius:4px; padding:12px; color:#7ec8e3;">' + DNS004Config._escHtml(s.ticketExtra) + '</div></div>' : '') + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#888; font-size:0.7rem;">ASSIGNED TO</div><div style="color:#2ecc71; font-weight:bold;">YOU — DNSSEC Administrator</div></div>';
    },
    _openDNS(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); DNS004Config._renderDNS(engine); return; }
        var c = document.createElement('div'); c.id = 'dns004Mgr'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'DNS Manager', 'DNS', c); DNS004Config._renderDNS(engine);
    },
    _renderDNS(engine) {
        var c = document.getElementById('dns004Mgr'); if (!c) return; var s = DNS004Config._getScenario(engine);
        var html = '<div style="font-size:1rem; font-weight:bold; color:#3a8fd4; margin-bottom:16px;">DNS Manager — DNSSEC Status</div>';
        html += '<div style="padding:8px 12px; margin-bottom:8px; background:' + (engine.state._fixed ? 'rgba(46,204,113,0.06)' : 'rgba(231,76,60,0.06)') + '; border:1px solid ' + (engine.state._fixed ? 'rgba(46,204,113,0.2)' : 'rgba(231,76,60,0.2)') + '; border-radius:4px;"><div style="font-weight:bold;">DNSSEC — contoso.com</div><div style="color:' + (engine.state._fixed ? '#2ecc71' : '#e74c3c') + ';">' + (engine.state._fixed ? 'SECURE — All validations passing' : 'BROKEN — Validation failures detected') + '</div></div>';
        if (engine.state._flagRevealed && s) { html += '<div style="margin-top:16px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;"><div style="color:#2ecc71; font-weight:bold;">Resolved:</div><div style="font-size:0.8rem;">' + s.fixDescription + '</div><div id="dns004-flag" style="font-size:0.8rem; margin-top:4px;">Recovery token: loading...</div></div>'; setTimeout(function() { BoxEngine.requestFlagText(s.id).then(function(f) { var el = document.getElementById('dns004-flag'); if (el) el.textContent = 'Recovery token: ' + (f || 'Flag unavailable'); }); }, 0); }
        c.innerHTML = html;
    },
    _confirmReset(engine) {
        var o = document.createElement('div'); o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px 32px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9;"><div style="font-weight:bold; margin-bottom:12px; color:#e74c3c;">Reset Lab?</div><div style="display:flex; gap:12px; justify-content:center;"><button id="dns004RC" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="dns004CC" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('dns004RC').addEventListener('click', function() { DNS004Config._flagRestored = false; DNS004Config.hints = DNS004Config._defaultHints; engine.reset(); });
        document.getElementById('dns004CC').addEventListener('click', function() { o.remove(); }); o.addEventListener('click', function(e) { if (e.target === o) o.remove(); });
    }
};
