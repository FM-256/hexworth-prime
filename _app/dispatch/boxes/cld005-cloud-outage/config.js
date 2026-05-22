/* ============================================================
   DISPATCH LAB — Box CLD005: Cloud Outage Response
   Cloud Outage & Incident Response — Cloud+ / Azure
   ============================================================ */

var CLD005Config = {
    title: 'Cloud Outage Response',
    subtitle: 'Cloud Outage & Incident Response — Cloud+ / Azure',
    difficulty: 'Expert',
    accent: '#0ea5e9',
    storageKey: 'hexworth_lab_cld005',
    registryId: 'cld005-cloud-outage',
    trackerKey: 'lab_cld005',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the incident details to understand the reported issue.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Investigate the issue', tip: 'Use the available tools and commands to gather diagnostic information.', trigger: { event: 'command', match: { cmd: 'contains:Get-' }, alt: [{ event: 'window_open', match: { type: 'admin_console' } }] } },
            { title: 'Identify the root cause', tip: 'Analyze the evidence to determine what is causing the problem.', trigger: { event: 'command', match: { cmd: 'contains:Get-' } } },
            { title: 'Apply the fix', tip: 'Execute the appropriate remediation steps.', trigger: { event: 'command', match: { cmd: 'contains:Set-' }, alt: [{ event: 'command', match: { cmd: 'contains:Restart-' } }] } },
            { title: 'Verify and capture the flag', tip: 'Confirm the issue is resolved. Flag appears after successful fix.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: { certPath: 'Cloud+ / Azure', mappings: [{flagId:'fixed',objective:'2.5',description:'Implement cybersecurity resilience',skill:'Cloud Outage Assessment and Response'},{flagId:'fixed',objective:'3.1',description:'Determine troubleshooting methodology',skill:'Service Health Monitoring'},{flagId:'fixed',objective:'4.2',description:'Analyze cloud service issues',skill:'Incident Response for Cloud Services'}] },

    _scenarios: [
        {id:'m365_degraded',name:'Microsoft 365 Service Degradation',ticketSubject:'Outlook and Teams intermittently failing for all users — is this us or Microsoft?',ticketDetail:'All 200 users are reporting intermittent Outlook and Teams failures. Email is delayed by 15-30 minutes, Teams meetings drop randomly. Our on-prem infrastructure looks healthy. VPN is up, internet connectivity is fine from the office.',ticketExtra:'IT Note: Check Microsoft 365 Service Health dashboard (admin.microsoft.com > Health > Service health). Microsoft has posted advisory MO123456 indicating "Users may experience delays in email delivery and Teams meeting connectivity in the North America region." This is a Microsoft-side issue. Document the incident, communicate to users, and monitor for resolution. No action required on our end except documenting the business impact.',fixDescription:'Confirm M365 service degradation, document incident, communicate to users, monitor Service Health',stateOverrides:{_m365DegradedFixed:false}},
        {id:'azure_region',name:'Azure Region Outage — Failover Assessment',ticketSubject:'Azure-hosted internal app down — "502 Bad Gateway" from App Service',ticketDetail:'Our internal expense reporting app (hosted in Azure App Service, East US region) is returning 502 errors. The Azure Status page shows an outage in the East US region. The app has no geo-redundancy configured.',ticketExtra:'IT Note: Azure East US region is experiencing an outage affecting App Service and Azure SQL. Our expense app has no failover region. Immediate actions: (1) Confirm outage on status.azure.com, (2) Assess business impact, (3) Communicate ETA from Azure status, (4) If prolonged, consider deploying a temporary instance in East US 2. Document lessons learned for DR planning.',fixDescription:'Confirm Azure outage, assess impact, communicate to stakeholders, document for DR improvements',stateOverrides:{_azureRegionFixed:false}},
        {id:'dns_propagation',name:'DNS Propagation Delay After Provider Change',ticketSubject:'Website down after DNS provider migration — "site cannot be reached" for some users',ticketDetail:'We migrated our public DNS from GoDaddy to Cloudflare yesterday. Some users (about 30%) can reach hexworth.com fine, but others get "This site can\'t be reached." Our IT team can access it from the office. Remote workers are having the most issues.',ticketExtra:'IT Note: DNS propagation after a provider change takes 24-72 hours globally. The old GoDaddy nameservers are still being cached by some ISP resolvers. The TTL on the old NS records was 86400 seconds (24 hours). Fix: Wait for full propagation. For urgent users, they can flush their local DNS cache (ipconfig /flushdns) or temporarily use 1.1.1.1 or 8.8.8.8 as their DNS resolver. Verify propagation with nslookup from different regions.',fixDescription:'Wait for DNS propagation, provide workaround (flush cache or use public DNS)',stateOverrides:{_dnsPropFixed:false}},
        {id:'cdn_cache_poison',name:'CDN Cache Poisoning — Wrong Content',ticketSubject:'Company website showing competitor content on random pages — possible breach?',ticketDetail:'Marketing reports that some pages on hexworth.com are randomly showing content from a different website. The HTML source shows correct content locally but the CDN-cached version is serving wrong pages. This started after a CDN configuration change yesterday. Security team is alarmed about a possible breach.',ticketExtra:'IT Note: This is NOT a breach — it is CDN cache poisoning from a misconfiguration. Yesterday, the CDN (Cloudflare) cache rules were updated and a wildcard rule accidentally cached responses from a shared-IP origin server that hosts multiple websites. The cached content includes another tenant on the same origin IP. Fix: Purge the CDN cache, fix the cache rules to include the Host header in the cache key, and verify the origin server only responds to our domain.',fixDescription:'Purge CDN cache, fix cache rules to include Host header, verify origin config',stateOverrides:{_cdnFixed:false}},
        {id:'tenant_locked',name:'Multi-Tenant Service Account Locked',ticketSubject:'Automated integrations failing — service account locked across 3 cloud platforms',ticketDetail:'Our automation service account (svc-integration@hexworth.com) is locked across Azure AD, Salesforce, and ServiceNow simultaneously. All automated workflows, API integrations, and scheduled reports have stopped. This affects 15 business-critical processes.',ticketExtra:'IT Note: The service account password was changed in Azure AD yesterday as part of a security rotation, but the password was not updated in Salesforce and ServiceNow. Those platforms kept trying to authenticate with the old password, triggering lockout. Azure AD smart lockout then locked the account entirely. Fix: (1) Unlock the account in Azure AD, (2) Update the password in all 3 platforms simultaneously, (3) Document all integrations using this service account for future rotations.',fixDescription:'Unlock account, update password in all 3 platforms simultaneously',stateOverrides:{_tenantLockFixed:false}}
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Open the ticket and review the symptoms carefully.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use diagnostic commands to gather more information about the issue.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Identify the specific root cause before attempting a fix.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Apply the targeted fix and verify it resolves the issue.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        m365_degraded:[{"id":"hint1","text":"All users affected, on-prem looks healthy. Check if this is a Microsoft-side issue.","cost":0,"penalty":0},{"id":"hint2","text":"Check admin.microsoft.com > Health > Service health for active advisories.","cost":10,"penalty":-10},{"id":"hint3","text":"Microsoft has posted advisory MO123456. Document impact and communicate to users.","cost":25,"penalty":-25},{"id":"hint4","text":"No action needed on our end except documentation and user communication. Monitor for resolution.","cost":50,"penalty":-50}],
        azure_region:[{"id":"hint1","text":"Check status.azure.com for the East US region status.","cost":0,"penalty":0},{"id":"hint2","text":"East US region outage confirmed. Our app has no geo-redundancy.","cost":10,"penalty":-10},{"id":"hint3","text":"Assess business impact, communicate Azure ETA to stakeholders.","cost":25,"penalty":-25},{"id":"hint4","text":"Document this as a DR gap. Recommend deploying to secondary region for future resilience.","cost":50,"penalty":-50}],
        dns_propagation:[{"id":"hint1","text":"Some users can reach the site, others cannot. This is a DNS propagation issue.","cost":0,"penalty":0},{"id":"hint2","text":"DNS provider was changed yesterday. TTL was 86400s (24h). Full propagation takes 24-72 hours.","cost":10,"penalty":-10},{"id":"hint3","text":"Workaround for affected users: ipconfig /flushdns, or set DNS to 1.1.1.1 or 8.8.8.8.","cost":25,"penalty":-25},{"id":"hint4","text":"Use nslookup or dig from multiple regions to verify propagation progress.","cost":50,"penalty":-50}],
        cdn_cache_poison:[{"id":"hint1","text":"Wrong content on some pages but HTML source is correct. This points to a caching layer issue.","cost":0,"penalty":0},{"id":"hint2","text":"CDN cache is serving content from another tenant on the shared origin IP. Not a breach.","cost":10,"penalty":-10},{"id":"hint3","text":"Purge the CDN cache: Cloudflare Dashboard > Caching > Purge Everything.","cost":25,"penalty":-25},{"id":"hint4","text":"Fix cache rules to include Host header. Verify origin only responds to hexworth.com requests.","cost":50,"penalty":-50}],
        tenant_locked:[{"id":"hint1","text":"Service account locked across all platforms simultaneously. What changed recently?","cost":0,"penalty":0},{"id":"hint2","text":"Password was rotated in Azure AD but not updated in Salesforce and ServiceNow.","cost":10,"penalty":-10},{"id":"hint3","text":"Unlock in Azure AD first, then update password in all 3 platforms at the same time.","cost":25,"penalty":-25},{"id":"hint4","text":"Document all integrations using this service account. Create a password rotation runbook.","cost":50,"penalty":-50}]
    },

    _ensureScenario: function(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !CLD005Config._flagRestored) { CLD005Config._flagRestored = true; var s = CLD005Config._scenarios[engine.state._scenarioId]; if (s) CLD005Config.hints = CLD005Config._scenarioHints[s.id] || CLD005Config._defaultHints; } return true; },
    _applyScenario: function(engine, idx) { engine.state._scenarioId = idx; engine.state._scenarioSelected = true; engine.state._m365DegradedFixed = false; engine.state._azureRegionFixed = false; engine.state._dnsPropFixed = false; engine.state._cdnFixed = false; engine.state._tenantLockFixed = false; engine.state._labComplete = false; engine.state._flagRevealed = false; CLD005Config._flagRestored = true; CLD005Config.hints = CLD005Config._scenarioHints[CLD005Config._scenarios[idx].id] || CLD005Config._defaultHints; engine.save(); },
    _getScenario: function(engine) { return engine.state._scenarioId != null ? CLD005Config._scenarios[engine.state._scenarioId] : null; },
    _requireScenario: function(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket. Open Help Desk Ticket first.\n'; },
    _escHtml: function(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },
    _checkFix: function(engine) {
        var s = CLD005Config._getScenario(engine); if (!s || engine.state._labComplete) return;
        var done = false;
        if(s.id==='m365_degraded')done=engine.state._m365DegradedFixed;
        if(s.id==='azure_region')done=engine.state._azureRegionFixed;
        if(s.id==='dns_propagation')done=engine.state._dnsPropFixed;
        if(s.id==='cdn_cache_poison')done=engine.state._cdnFixed;
        if(s.id==='tenant_locked')done=engine.state._tenantLockFixed;
        if (done) { engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save(); engine.requestFlagText(s.id).then(function(f) { engine.notify(f ? 'Issue resolved. Check admin console for closure token.' : 'Fixed. Flag pending.', 'success'); }).catch(function() { engine.notify('Fixed. Flag pending.', 'success'); }); }
    },

    boot: { biosLines: ['System BIOS v2.12.1', 'Processor: Intel Xeon / Core i7', 'Memory: OK', 'Storage: OK', 'Network: OK', 'Loading OS...'], grubEntries: ['Windows 11 Enterprise / Server 2022'], loginUser: 'Administrator' },
    desktop: { icons: [{ id: 'powershell', label: 'PowerShell', icon: 'PS', app: 'terminal' }, { id: 'admin', label: 'Admin\nConsole', icon: 'ADM', app: 'admin_console' }, { id: 'event_viewer', label: 'Event\nViewer', icon: 'EVT', app: 'event_viewer' }, { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' }, { id: 'notes', label: 'Notepad', icon: 'TXT', app: 'notes' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }] },
    terminal: { user: 'Administrator', hostname: 'ADMIN-PC', startDir: 'C:\\Users\\Administrator', promptStyle: 'powershell', welcome: 'Windows PowerShell\nConnected to admin console.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:cld005}}', points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 2400 },
    hints: [{ id: 'hint1', text: 'Read the ticket carefully.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'Use diagnostic commands to investigate.', cost: 10, penalty: -10 }, { id: 'hint3', text: 'Identify the root cause before fixing.', cost: 25, penalty: -25 }, { id: 'hint4', text: 'Apply the fix and verify.', cost: 50, penalty: -50 }],
    lore: { intro: 'Cloud Outage Response — troubleshoot and resolve the reported issue.', scenario: 'Investigate the symptoms, identify the root cause, apply the fix, and verify the resolution.', outro: 'Issue resolved successfully. Document the incident and update the knowledge base.' },
    phases: [{ id: 'investigate', name: 'Investigation', requiredFlags: [], unlocks: ['diagnose'], locked: false }, { id: 'diagnose', name: 'Diagnosis', requiredFlags: [], unlocks: ['repair'], locked: true }, { id: 'repair', name: 'Remediation', requiredFlags: [], unlocks: ['verify'], locked: true }, { id: 'verify', name: 'Verification', requiredFlags: ['fixed'], unlocks: [], locked: true }],

    commands: {
        'apply-fix': function(args, term, engine) {
            var gate = CLD005Config._requireScenario(engine); if (gate) return gate;
            var s = CLD005Config._getScenario(engine);
            if(s.id==='m365_degraded'){engine.state._m365DegradedFixed=true;engine.save();engine.notify('Issue resolved.','success');CLD005Config._checkFix(engine);return '\nFix applied successfully.\n';}
            if(s.id==='azure_region'){engine.state._azureRegionFixed=true;engine.save();engine.notify('Issue resolved.','success');CLD005Config._checkFix(engine);return '\nFix applied successfully.\n';}
            if(s.id==='dns_propagation'){engine.state._dnsPropFixed=true;engine.save();engine.notify('Issue resolved.','success');CLD005Config._checkFix(engine);return '\nFix applied successfully.\n';}
            if(s.id==='cdn_cache_poison'){engine.state._cdnFixed=true;engine.save();engine.notify('Issue resolved.','success');CLD005Config._checkFix(engine);return '\nFix applied successfully.\n';}
            if(s.id==='tenant_locked'){engine.state._tenantLockFixed=true;engine.save();engine.notify('Issue resolved.','success');CLD005Config._checkFix(engine);return '\nFix applied successfully.\n';}
            return '\nSpecify the fix to apply.\n';
        },
        whoami: function() { return 'HEXWORTH\\Administrator'; },
        hostname: function() { return 'ADMIN-PC'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; }
    },

    onAppLaunch: function(iconDef, engine) {
        if (['admin_console','event_viewer'].indexOf(iconDef.app) !== -1 && !engine.state._scenarioSelected) { engine.notify('Open Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': CLD005Config._openTicket(iconDef, engine); break;
            case 'admin_console': CLD005Config._openAdmin(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset lab?')) engine.resetLab(); break;
        }
    },

    _openTicket: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'tc_cld005cloudoutage'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        CLD005Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) {
            var s = CLD005Config._getScenario(engine);
            c.innerHTML = '<div style="color:#0ea5e9; font-weight:bold; font-size:1rem; margin-bottom:16px;">INCIDENT #INC-' + (5400 + engine.state._scenarioId) + '</div>'
                + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + CLD005Config._escHtml(s.ticketSubject) + '</div></div>'
                + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + CLD005Config._escHtml(s.ticketDetail) + '</div></div>'
                + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(14,165,233,0.08); border:1px solid rgba(14,165,233,0.25); border-radius:4px; padding:12px; line-height:1.6; color:#7dd3fc;">' + CLD005Config._escHtml(s.ticketExtra) + '</div></div>'
                + '<div style="color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div>'
                + '<div style="margin-top:16px; border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><button id="applyFixBtn" style="padding:10px 24px; background:#0ea5e9; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Apply Fix</button></div>';
            var fb = document.getElementById('applyFixBtn');
            if (fb) fb.addEventListener('click', function() {
                var s = CLD005Config._getScenario(engine);
                var overrideKey = Object.keys(s.stateOverrides)[0];
                engine.state[overrideKey] = true;
                engine.save();
                engine.notify('Fix applied: ' + s.fixDescription, 'success');
                CLD005Config._checkFix(engine);
            });
        } else {
            var h = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#0ea5e9; font-weight:bold; font-size:1.1rem;">CLOUD OUTAGE RESPONSE</div></div>';
            CLD005Config._scenarios.forEach(function(s, i) {
                h += '<button class="sb" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; cursor:pointer; font-family:Consolas,monospace;"><span style="color:#0ea5e9; font-weight:bold;">INC-' + (5400+i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + s.name + '</div></button>';
            });
            h += '<div style="text-align:center; padding-top:16px;"><button id="rb" style="padding:10px 28px; background:#0ea5e9; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
            c.innerHTML = h;
            c.querySelectorAll('.sb').forEach(function(b) { b.addEventListener('click', function() { CLD005Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); CLD005Config._openTicket(iconDef, engine); }); });
            document.getElementById('rb').addEventListener('click', function() { CLD005Config._applyScenario(engine, Math.floor(Math.random()*5)); CLD005Config._openTicket(iconDef, engine); });
        }
    },

    _openAdmin: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Admin Console', 'ADM', c);
        var s = CLD005Config._getScenario(engine);
        var h = '<div style="font-size:0.9rem; font-weight:bold; color:#0ea5e9; margin-bottom:16px;">Admin Console — Diagnostic View</div>';
        if (s) {
            h += '<div style="padding:12px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px; margin-bottom:12px;">'
                + '<div style="font-weight:bold; color:#7dd3fc;">Active Scenario: ' + s.name + '</div>'
                + '<div style="color:#888; font-size:0.75rem; margin-top:4px;">Status: ' + (engine.state._labComplete ? '<span style="color:#2ecc71;">RESOLVED</span>' : '<span style="color:#e74c3c;">OPEN</span>') + '</div></div>';
        }
        if (engine.state._flagRevealed && engine._deliveredFlags) {
            var fv = engine._deliveredFlags[s ? s.id : ''];
            if (fv) h += '<div style="padding:10px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px;"><div style="color:#2ecc71; font-weight:bold;">Closure Token:</div><div>' + fv + '</div></div>';
        }
        c.innerHTML = h;
    }
};