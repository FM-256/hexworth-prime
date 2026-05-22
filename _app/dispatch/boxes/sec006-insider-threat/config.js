/* ============================================================
   DISPATCH LAB — Box SEC006: Insider Threat
   Security+ SY0-701 / CySA+
   5 distinct scenarios
   ============================================================ */

var SEC006Config = {

    title: 'Insider Threat',
    subtitle: 'DLP Alert Shows Sensitive Files Being Copied to USB',
    difficulty: 'Advanced',
    accent: '#dc2626',
    storageKey: 'hexworth_lab_sec006',
    registryId: 'sec006-insider-threat',
    trackerKey: 'lab_sec006',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Alert', tip: 'Read the incident report.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check the Dashboard', tip: 'Review system status.', trigger: { event: 'window_open', match: { type: 'dashboard' } } },
            { title: 'Investigate', tip: 'Use terminal tools to diagnose.', trigger: { event: 'command', match: { cmd: 'contains:status' } } },
            { title: 'Apply the fix', tip: 'Resolve the issue.', trigger: { event: 'command', match: { cmd: 'contains:fix' } } },
            { title: 'Capture the flag', tip: 'Flag appears after fix.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'Security+ SY0-701 / CySA+',
        mappings: [{ flagId: 'fixed', objective: '2.4', description: 'Analyze indicators of potentially malicious activity', skill: 'Insider Threat Detection & Response' }]
    },

    _alerts: [{ id: 'SEC006-2026-0001', severity: 'HIGH', engine: 'System Monitor', host: 'Multiple', user: 'system', detected: '2026-04-01 08:30:00' }],

    _scenarioFlags: { usb_copy: null, email_forward: null, cloud_upload: null, after_hours: null, priv_abuse: null },

    _scenarios: [
        {
            id: 'usb_copy',
            name: 'USB Copy DLP Alert',
            ticketSubject: 'DLP alert: Finance manager copying salary database to personal USB drive',
            ticketDetail: 'DLP system detected user rmiller (Finance Manager) copying CompensationDB_2026.xlsx (45MB) to a SanDisk USB drive. The file contains salary data for all 500 employees. User has been with the company 8 years but recently received a written warning for performance issues. USB policy allows encrypted corporate USB drives only.',
            ticketExtra: 'DLP Note: File hash matches the master compensation database. User rmiller has accessed this file 3 times in the last week (normal is 0-1 times per quarter). HR confirms performance issues and possible termination upcoming. This may be data theft in anticipation of departure.',
            affectedHost: 0,
            fixDescription: 'Contain data, preserve evidence, disable USB, notify HR',
            stateOverrides: { _usbCopy: true, _dlpTriggered: true }
        },
        {
            id: 'email_forward',
            name: 'Email Auto-Forward',
            ticketSubject: 'Employee set up auto-forward rule sending all emails to personal Gmail account',
            ticketDetail: 'Exchange admin found that user jpark (R&D Engineer) created a mailbox rule forwarding ALL incoming emails to jpark.personal@gmail.com. This has been active for 14 days. R&D emails contain proprietary product designs and patent-pending innovations. The user claims it was for working from home convenience.',
            ticketExtra: 'IT Note: The auto-forward rule was created 14 days ago. In that time, approximately 2,400 emails have been forwarded including 47 with "CONFIDENTIAL" in the subject. User has not given 2-week notice but LinkedIn shows updated profile with "Open to Work." Classic pre-departure data staging.',
            affectedHost: 0,
            fixDescription: 'Remove forward rule, assess data exposure, preserve evidence',
            stateOverrides: { _emailForward: true, _dataStaged: true }
        },
        {
            id: 'cloud_upload',
            name: 'Cloud Storage Upload',
            ticketSubject: 'Unusual volume of uploads to personal OneDrive from engineering workstation',
            ticketDetail: 'CASB (Cloud Access Security Broker) detected 4.2GB of uploads from user tchen (Senior Engineer) to a personal OneDrive account over the last 3 days. Normal upload volume for this user is <50MB/month. The uploads include CAD files, source code, and technical specifications for a product launching next quarter.',
            ticketExtra: 'CASB Note: tchen uploaded 847 files to personal OneDrive. File analysis shows: 312 CAD files (.dwg, .step), 289 source files (.c, .h, .py), 246 documents (.pdf, .docx). User recently interviewed at a competitor (confirmed by hiring manager contact). This appears to be IP theft.',
            affectedHost: 0,
            fixDescription: 'Block personal cloud, preserve uploads, involve legal',
            stateOverrides: { _cloudUpload: true, _ipTheft: true }
        },
        {
            id: 'after_hours',
            name: 'After-Hours Access',
            ticketSubject: 'Badge system shows employee accessing restricted areas at 2am repeatedly',
            ticketDetail: 'Physical security detected that user dwilson (IT Support Tech) has been badging into the server room between 1am-3am on 5 occasions in the past 2 weeks. His role does not require server room access and his badge access was supposed to be revoked when he transferred from Infrastructure to Help Desk 3 months ago. Security cameras show him photographing server labels and network diagrams.',
            ticketExtra: 'PhysSec Note: Badge logs show 5 visits between 1-3am. Camera footage: user photographing rack labels, IP addressing schemes, and network cable tags. This information could be used for network reconnaissance. User previously had legitimate access but it was never properly revoked during role transfer. Could be selling access information or planning an attack.',
            affectedHost: 0,
            fixDescription: 'Revoke badge access, review camera footage, investigate intent',
            stateOverrides: { _afterHours: true, _badgeNotRevoked: true }
        },
        {
            id: 'priv_abuse',
            name: 'Privilege Abuse',
            ticketSubject: 'Database admin running unauthorized queries on customer PII',
            ticketDetail: 'Splunk alert shows user asmith (DBA) executing SELECT * queries on the customer PII table (customers_pii) which contains SSNs, credit card numbers, and addresses for 50,000 customers. The DBA role should only run maintenance queries, not data extraction. Query results are being exported to CSV files on the DBA workstation.',
            ticketExtra: 'SOC Note: 7 queries executed in the last 48 hours, each returning 5,000-10,000 rows. Total records extracted: approximately 42,000. CSV files found in C:\Users\asmith\Documents\exports\. User has access to PII by nature of DBA role but export of this volume is a clear policy violation and possible data theft for sale on dark web.',
            affectedHost: 0,
            fixDescription: 'Lock DBA account, secure exported data, investigate intent',
            stateOverrides: { _privAbuse: true, _piiExport: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Review the alert details carefully.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal tools to investigate.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a different root cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after successful remediation.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        usb_copy: [
            { id: 'hint1', text: 'Run "status" to review the DLP alert details.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Finance manager copying salary DB to personal USB. Performance issues noted.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Disable USB access, preserve forensic evidence, notify HR/Legal.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix contain-preserve" to lock down and preserve evidence.', cost: 150, penalty: -150 }
        ],
        email_forward: [
            { id: 'hint1', text: 'Run "status" to check email forwarding rules.', cost: 0, penalty: 0 },
            { id: 'hint2', text: '2,400 emails forwarded to personal Gmail over 14 days, including 47 confidential.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Remove the rule, assess what was exposed, preserve evidence.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix remove-forward" to stop forwarding and preserve.', cost: 150, penalty: -150 }
        ],
        cloud_upload: [
            { id: 'hint1', text: 'Run "status" to review CASB upload analysis.', cost: 0, penalty: 0 },
            { id: 'hint2', text: '4.2GB of IP uploaded to personal OneDrive. User interviewing at competitor.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Block personal cloud access, preserve evidence, involve legal.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix block-preserve-legal" to contain the situation.', cost: 150, penalty: -150 }
        ],
        after_hours: [
            { id: 'hint1', text: 'Run "status" to review badge access logs.', cost: 0, penalty: 0 },
            { id: 'hint2', text: '5 after-hours server room visits. Camera shows photographing infrastructure.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Revoke badge, review footage, preserve evidence, investigate.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix revoke-investigate" to contain and investigate.', cost: 150, penalty: -150 }
        ],
        priv_abuse: [
            { id: 'hint1', text: 'Run "status" to review query audit logs.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'DBA exporting 42,000 customer PII records to CSV files.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Lock account, secure/delete exports, preserve evidence, involve legal.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run "fix lock-secure-investigate" to contain PII exposure.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !SEC006Config._flagRestored) {
            SEC006Config._flagRestored = true;
            var s = SEC006Config._scenarios[engine.state._scenarioId];
            if (s) SEC006Config.hints = SEC006Config._scenarioHints[s.id] || SEC006Config._defaultHints;
        }
        return true;
    },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        ['_labComplete','_flagRevealed','_usbCopy','_dlpTriggered','_emailForward','_dataStaged','_cloudUpload','_ipTheft','_afterHours','_badgeNotRevoked','_privAbuse','_piiExport','_fixApplied','_investigated'].forEach(function(k) { engine.state[k] = false; });
        var o = SEC006Config._scenarios[idx].stateOverrides || {};
        for (var k in o) engine.state[k] = o[k];
        SEC006Config._flagRestored = true;
        SEC006Config.hints = SEC006Config._scenarioHints[SEC006Config._scenarios[idx].id] || SEC006Config._defaultHints;
        engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : SEC006Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket. Open the Alert first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['System Boot...', 'Loading diagnostic tools...', 'Monitoring active', 'Console ready'], grubEntries: ['Primary', 'Recovery'], loginUser: 'Admin' },
    desktop: { icons: [ { id: 'cmd', label: 'Terminal', icon: '>_', app: 'terminal' }, { id: 'dashboard', label: 'Dashboard', icon: 'DSH', app: 'dashboard' }, { id: 'logs', label: 'Log\nViewer', icon: 'LOG', app: 'logs' }, { id: 'ticket', label: 'Alert', icon: 'TKT', app: 'ticket' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' } ] },
    terminal: { user: 'admin', hostname: 'WS-01', startDir: '/home/admin', promptStyle: 'linux', welcome: 'Insider Threat Diagnostic Console\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Check the dashboard.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use terminal for investigation.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each scenario has a unique cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Fix it and verify.', cost: 50, penalty: -50 }
    ],
    lore: { intro: 'A insider threat incident has been detected. Investigate and respond systematically.', scenario: 'Each scenario presents a different aspect of insider threat — requiring thorough investigation and remediation.', outro: 'Incident resolved. Your systematic response contained and remediated the insider threat effectively.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Review the alert.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify root cause.', requiredFlags: [], unlocks: ['remediate'], locked: true },
        { id: 'remediate', name: 'Remediation', description: 'Apply the fix.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm resolution.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        'status': function(args, term, engine) {
            var gate = SEC006Config._requireScenario(engine); if (gate) return gate;
            var s = SEC006Config._getScenario(engine);
            if (engine.state._labComplete) return '\nSystem Status: ALL CLEAR. Issue resolved.';
            if (s && s.id === 'usb_copy') return '\nUSB Copy DLP Alert: Active incident. Investigate.';
            if (s && s.id === 'email_forward') return '\nEmail Auto-Forward: Active incident. Investigate.';
            if (s && s.id === 'cloud_upload') return '\nCloud Storage Upload: Active incident. Investigate.';
            if (s && s.id === 'after_hours') return '\nAfter-Hours Access: Active incident. Investigate.';
            if (s && s.id === 'priv_abuse') return '\nPrivilege Abuse: Active incident. Investigate.';
            return '\nStatus: Normal.';
        },

        'investigate': function(args, term, engine) {
            var gate = SEC006Config._requireScenario(engine); if (gate) return gate;
            engine.state._investigated = true; engine.save();
            var s = SEC006Config._getScenario(engine);
            if (s && s.id === 'usb_copy') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'email_forward') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'cloud_upload') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'after_hours') return '\nRoot cause identified. Apply fix.';
            if (s && s.id === 'priv_abuse') return '\nRoot cause identified. Apply fix.';
            return '\nInvestigation complete.';
        },

        'fix': function(args, term, engine) {
            var gate = SEC006Config._requireScenario(engine); if (gate) return gate;
            if (!engine.state._investigated) return '\nERROR: Run "investigate" first.';
            var s = SEC006Config._getScenario(engine); var joined = args.join(' ').toLowerCase();
            if (s && s.id === 'usb_copy' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nContain data, preserve evidence, disable USB, notify HR completed.\n\n=== FLAG: SEC006{usb_copy_resolved} ===';
            }
            if (s && s.id === 'email_forward' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nRemove forward rule, assess data exposure, preserve evidence completed.\n\n=== FLAG: SEC006{email_forward_resolved} ===';
            }
            if (s && s.id === 'cloud_upload' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nBlock personal cloud, preserve uploads, involve legal completed.\n\n=== FLAG: SEC006{cloud_upload_resolved} ===';
            }
            if (s && s.id === 'after_hours' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nRevoke badge access, review camera footage, investigate intent completed.\n\n=== FLAG: SEC006{after_hours_resolved} ===';
            }
            if (s && s.id === 'priv_abuse' && joined.includes('undefined')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Issue resolved.', 'success'); }, 400);
                return '\nLock DBA account, secure exported data, investigate intent completed.\n\n=== FLAG: SEC006{priv_abuse_resolved} ===';
            }
            return '\nUsage: fix <action>. Run "investigate" first for available actions.';
        },


        whoami: function() { return 'admin'; },
        hostname: function() { return 'WS-01'; },
        clear: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        ls: function() { return 'configs  logs  scripts  tools'; },
        dir: function() { return ' Directory of current folder\n  configs  logs  scripts  tools'; }
    },

    onAppLaunch(iconDef, engine) {
        if (iconDef.app !== 'ticket' && iconDef.app !== 'terminal' && iconDef.app !== 'hints' && iconDef.app !== 'reset_lab' && !engine.state._scenarioSelected) { engine.notify('Open the Alert first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': SEC006Config._openTicket(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset this lab?')) engine.resetLab(); break;
            default: SEC006Config._openInfoWin(iconDef, engine); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px;overflow-y:auto;height:100%;background:#1a1a2e;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Insider Threat Alert', 'TKT', c);
        SEC006Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) SEC006Config._renderTicket(engine, c); else SEC006Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var previews = ['Team — "DLP alert: Finance manager copying salary database to person..."','Team — "Employee set up auto-forward rule sending all emails to pers..."','Team — "Unusual volume of uploads to personal OneDrive from engineer..."','Team — "Badge system shows employee accessing restricted areas at 2a..."','Team — "Database admin running unauthorized queries on customer PII..."'];
        var html = '<div style="text-align:center;margin-bottom:20px;"><div style="color:#dc2626;font-weight:bold;font-size:1.1rem;">INCIDENT QUEUE</div></div><div>';
        SEC006Config._scenarios.forEach(function(s,i) {
            html += '<button class="s-btn" data-idx="'+i+'" style="display:block;width:100%;text-align:left;padding:12px 16px;margin-bottom:8px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.12);border-radius:4px;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;cursor:pointer;"><div style="color:#dc2626;font-weight:bold;">SEC006-'+(1000+i)+'</div><div style="color:#aaa;font-size:0.7rem;margin-top:4px;">'+previews[i]+'</div></button>';
        });
        html += '</div><div style="text-align:center;border-top:1px solid rgba(255,255,255,0.1);padding-top:16px;"><button id="rndBtn" style="padding:10px 28px;background:#dc2626;color:#fff;border:none;border-radius:4px;cursor:pointer;font-weight:bold;font-family:Consolas,monospace;">Random Assignment</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.s-btn').forEach(function(b) { b.addEventListener('click', function() { SEC006Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); SEC006Config._renderTicket(engine, container); }); });
        document.getElementById('rndBtn').addEventListener('click', function() { SEC006Config._applyScenario(engine, Math.floor(Math.random()*SEC006Config._scenarios.length)); SEC006Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var s = SEC006Config._getScenario(engine);
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1);padding-bottom:12px;margin-bottom:16px;"><span style="color:#dc2626;font-weight:bold;font-size:1rem;">INCIDENT #SEC006-'+(1000+engine.state._scenarioId)+'</span></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">'+SEC006Config._escHtml(s.ticketSubject)+'</div></div>'
            +'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:4px;padding:12px;line-height:1.6;">'+SEC006Config._escHtml(s.ticketDetail)+'</div></div>'
            +(s.ticketExtra?'<div style="margin-bottom:16px;"><div style="color:#888;font-size:0.7rem;">NOTES</div><div style="background:rgba(0,0,0,0.2);border:1px solid #dc262633;border-radius:4px;padding:12px;line-height:1.6;color:#c4b5fd;">'+SEC006Config._escHtml(s.ticketExtra)+'</div></div>':'')
            +'<div style="border-top:1px solid rgba(255,255,255,0.1);padding-top:12px;color:#2ecc71;font-weight:bold;">ASSIGNED TO: YOU</div>';
    },

    _openInfoWin(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div');
        c.style.cssText = 'padding:16px;overflow-y:auto;height:100%;background:#1a1a2e;color:#c8e6c9;font-family:Consolas,monospace;font-size:0.8rem;';
        engine.openWindow(iconDef.id, iconDef.label.replace('\n',' '), iconDef.icon, c);
        c.innerHTML = '<div style="color:#dc2626;font-weight:bold;font-size:1rem;margin-bottom:12px;">'+iconDef.label.replace('\n',' ')+'</div><div style="color:#888;">Use terminal commands for diagnostics.</div>';
    }
};