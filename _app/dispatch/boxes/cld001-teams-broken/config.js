/* ============================================================
   DISPATCH LAB — Box CLD-001: Teams Not Working
   Microsoft Teams Troubleshooting — Cloud+ / Azure
   5 scenarios
   ============================================================ */

var CLD001Config = {
    title: 'Teams Not Working',
    subtitle: 'Microsoft Teams Troubleshooting — Cloud+ / Azure',
    difficulty: 'Intermediate',
    accent: '#0ea5e9',
    storageKey: 'hexworth_lab_cld001',
    registryId: 'cld001-teams-broken',
    trackerKey: 'lab_cld001',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the Teams complaint to understand the specific failure.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check Teams admin settings', tip: 'Open the M365 Admin Console or use PowerShell to check Teams policies and tenant settings.', trigger: { event: 'window_open', match: { type: 'admin_console' }, alt: [{ event: 'command', match: { cmd: 'contains:Get-CsTeams' } }] } },
            { title: 'Identify the root cause', tip: 'Is it a client cache issue, an admin policy, a device conflict, or a tenant-level setting?', trigger: { event: 'command', match: { cmd: 'contains:Get-' } } },
            { title: 'Apply the fix', tip: 'Clear cache, adjust the policy, fix audio settings, enable guest access, or update communication policy.', trigger: { event: 'command', match: { cmd: 'contains:Set-' }, alt: [{ event: 'window_open', match: { type: 'admin_console' } }] } },
            { title: 'Verify and capture the flag', tip: 'Confirm Teams is working. Flag appears after fix.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'Cloud+ / Azure',
        mappings: [
            { flagId: 'fixed', objective: '2.3', description: 'Given a scenario, manage cloud resources', skill: 'Microsoft Teams Administration' },
            { flagId: 'fixed', objective: '3.1', description: 'Determine appropriate troubleshooting methodology', skill: 'SaaS Application Troubleshooting' },
            { flagId: 'fixed', objective: '4.2', description: 'Given a scenario, analyze cloud service issues', skill: 'Teams Policy and Tenant Configuration' }
        ]
    },

    _scenarios: [
        {
            id: 'cache_corrupt',
            name: 'Teams Desktop Cache Corrupt — Cannot Join Meeting',
            ticketSubject: 'Teams desktop app crashes when joining meetings — "Something went wrong" error',
            ticketDetail: 'Rachel Huang reports that Teams desktop crashes every time she tries to join a meeting. She gets a "Something went wrong" error with code CAA20001. The web version of Teams works fine. This started after a Teams update yesterday. No other users are affected.',
            ticketExtra: 'IT Note: Error CAA20001 typically indicates a corrupt local cache. The fix is to clear the Teams cache folder at %AppData%\\Microsoft\\Teams. Close Teams completely, delete the cache folders (Cache, blob_storage, databases, GPUCache, Local Storage, tmp), then restart Teams. This forces a fresh sync.',
            fixDescription: 'Clear Teams desktop cache at %AppData%\\Microsoft\\Teams, restart Teams',
            stateOverrides: { _cacheFixed: false }
        },
        {
            id: 'screenshare_blocked',
            name: 'Screen Share Blocked by Admin Policy',
            ticketSubject: 'User cannot share screen in Teams meetings — share button is grayed out',
            ticketDetail: 'Steve Evans in Marketing cannot share his screen during Teams meetings. The "Share content" button is grayed out. Other participants in the same meeting can share their screens. Steve says this started about a week ago when IT made some policy changes.',
            ticketExtra: 'IT Note: A Teams Meeting Policy called "Marketing-Restricted" was applied to Marketing users last week to limit bandwidth. However, the policy has ScreenSharingMode set to "Disabled" instead of "EntireScreen" or "SingleApplication". Fix: Update the policy to allow screen sharing.',
            fixDescription: 'Update Marketing-Restricted Teams meeting policy to allow screen sharing',
            stateOverrides: { _screenShareFixed: false }
        },
        {
            id: 'audio_echo',
            name: 'Audio Echo — Multiple Audio Devices',
            ticketSubject: 'Terrible audio echo in all Teams meetings — every word repeated',
            ticketDetail: 'Tom Wright in HR has been causing audio echo in every Teams meeting for the past week. Other participants hear everything doubled. Tom says he does not hear the echo himself. He recently got a new USB headset but also has a conference room speakerphone on his desk.',
            ticketExtra: 'IT Note: Tom has both a USB headset (Jabra Evolve2) and a Poly Sync 20 speakerphone active simultaneously. Teams is using the headset for output but the speakerphone microphone is picking up the headset audio, creating a feedback loop. Fix: In Teams Settings > Devices, set both speaker AND microphone to the same device (Jabra headset). Disable the Poly Sync mic.',
            fixDescription: 'Configure Teams to use single audio device — set both speaker and mic to Jabra headset',
            stateOverrides: { _audioFixed: false }
        },
        {
            id: 'guest_disabled',
            name: 'Guest Access Disabled in Tenant',
            ticketSubject: 'External client cannot join our Teams channel — gets "access denied"',
            ticketDetail: 'The Marketing team invited an external client (vendor@clientcorp.com) to collaborate in a Teams channel. The client accepted the invitation but gets "You don\'t have access" when trying to join. Internal users can access the channel fine. The client\'s IT confirmed their side allows external Teams access.',
            ticketExtra: 'IT Note: Guest access is disabled at the tenant level in Azure AD / Teams Admin Center. The setting "Allow guest access in Teams" is set to Off. This blocks ALL external guest collaboration. Fix: Enable guest access in Teams Admin Center > Org-wide settings > Guest access. Changes take up to 24 hours to propagate but can be expedited.',
            fixDescription: 'Enable guest access in Teams Admin Center org-wide settings',
            stateOverrides: { _guestFixed: false }
        },
        {
            id: 'external_comm',
            name: 'External Communication Policy Blocking',
            ticketSubject: 'Cannot call or chat with external Teams users — messages fail to send',
            ticketDetail: 'The CEO David Kim is trying to have a 1:1 Teams chat and call with a partner at another organization (partner@externalorg.com). The message shows "Failed to send" and calls immediately drop. Both organizations use Teams. Internal communications work perfectly.',
            ticketExtra: 'IT Note: The Teams External Access policy is blocking all federation. In Teams Admin Center > External access, "Users can communicate with other Teams users" is set to "Blocked." This prevents all external 1:1 chat and calling. Fix: Change to "Allow" or add externalorg.com to the allowed domains list.',
            fixDescription: 'Enable external access in Teams Admin Center or add the partner domain to allowed list',
            stateOverrides: { _externalFixed: false }
        }
    ],

    _eventLogs: {
        cache_corrupt: [
            { id: 1, time: '2026-03-29T08:30:00', eventId: 1000, source: 'Teams', username: 'rhuang', category: 'Application', desc: 'Teams.exe crash — error CAA20001 during meeting join.', detail: 'Application: Teams.exe\nUser: rhuang\nError: CAA20001 — Cache integrity failure\nModule: electronRenderer.js\nCache path: %AppData%\\Microsoft\\Teams\nRecommendation: Clear cache and restart application.' }
        ],
        screenshare_blocked: [
            { id: 1, time: '2026-03-29T09:00:00', eventId: 2001, source: 'TeamsAdmin', username: 'sevans', category: 'Policy', desc: 'Screen sharing blocked by meeting policy "Marketing-Restricted".', detail: 'User: sevans\nPolicy: Marketing-Restricted\nScreenSharingMode: Disabled\nNote: Policy was created 2026-03-22 to limit bandwidth for Marketing users.\nAll other meeting capabilities are allowed.' }
        ],
        audio_echo: [
            { id: 1, time: '2026-03-29T10:00:00', eventId: 3001, source: 'Teams', username: 'twright', category: 'Media', desc: 'Multiple active audio devices detected — echo risk.', detail: 'User: twright\nActive Speaker: Jabra Evolve2 75 (USB)\nActive Microphone: Poly Sync 20 (USB)\nWarning: Speaker output from Jabra is being picked up by Poly mic.\nResult: Audio feedback loop (echo) for all meeting participants.' }
        ],
        guest_disabled: [
            { id: 1, time: '2026-03-29T11:00:00', eventId: 4001, source: 'TeamsAdmin', username: 'vendor@clientcorp.com', category: 'Guest Access', desc: 'Guest access denied — tenant setting disabled.', detail: 'Guest: vendor@clientcorp.com\nInvited by: rhuang (Marketing)\nChannel: Marketing-External-Collab\nResult: Access Denied\nTenant Setting: Guest Access = OFF\nNote: Enable in Teams Admin Center > Org-wide settings.' }
        ],
        external_comm: [
            { id: 1, time: '2026-03-29T14:00:00', eventId: 5001, source: 'TeamsAdmin', username: 'dkim', category: 'Federation', desc: 'External communication blocked by federation policy.', detail: 'User: dkim (CEO)\nTarget: partner@externalorg.com\nAction: 1:1 Chat + Call\nResult: Blocked\nPolicy: External Access = Blocked (all domains)\nFix: Enable external access or add externalorg.com to allowed domains.' }
        ]
    },

    _defaultHints: [
        { id: 'hint1', text: 'Open the ticket and identify whether this is a client issue, policy issue, or tenant setting.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Client issues: clear cache. Policy issues: check Get-CsTeamsMeetingPolicy. Tenant: check admin console.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use the M365 Admin Console or PowerShell to check and modify Teams policies and settings.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Apply the fix: clear cache, update policy, fix audio device, enable guest access, or allow external comms.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        cache_corrupt: [
            { id: 'hint1', text: 'The web version works but the desktop app crashes. This points to a local client issue, not a server issue.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Error CAA20001 = corrupt cache. The cache folder is at %AppData%\\Microsoft\\Teams.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Close Teams, delete cache folders, restart Teams. Use Clear-TeamsCache in PowerShell or manual deletion.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Full fix: Stop-Process -Name Teams; Remove-Item "$env:APPDATA\\Microsoft\\Teams\\*" -Recurse; Start Teams.', cost: 50, penalty: -50 }
        ],
        screenshare_blocked: [
            { id: 'hint1', text: 'Only Steve cannot share — others can. Check if a specific Teams policy is applied to his account.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Get-CsTeamsMeetingPolicy shows "Marketing-Restricted" has ScreenSharingMode=Disabled.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Fix: Set-CsTeamsMeetingPolicy -Identity "Marketing-Restricted" -ScreenSharingMode "EntireScreen"', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'After updating the policy, it takes up to 1 hour to propagate. User should sign out and back in.', cost: 50, penalty: -50 }
        ],
        audio_echo: [
            { id: 'hint1', text: 'Tom has a new USB headset AND a speakerphone. Check if both are active in Teams device settings.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Jabra headset = speaker output, Poly speakerphone = microphone input. The Poly picks up Jabra audio = echo.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'In Teams Settings > Devices, set both speaker AND microphone to Jabra Evolve2. Unplug or disable Poly.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Fix: Set-TeamsDeviceConfig for the user, or guide them through Settings > Devices to select matching devices.', cost: 50, penalty: -50 }
        ],
        guest_disabled: [
            { id: 'hint1', text: 'External users cannot join. This is NOT a per-user issue — check tenant-level guest access settings.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Guest access is disabled at the tenant level. All external collaboration is blocked.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Enable in Teams Admin Center: Org-wide settings > Guest access > Allow guest access = On.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Fix: Set-CsTeamsClientConfiguration -AllowGuestUser $true. Changes propagate within 24 hours.', cost: 50, penalty: -50 }
        ],
        external_comm: [
            { id: 'hint1', text: 'Internal Teams works but external 1:1 chat/calls fail. Check external access / federation settings.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'External access is set to "Blocked" — all external Teams federation is disabled.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Teams Admin Center > External access > Change from Blocked to Open or add specific allowed domains.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Fix: Set-CsTenantFederationConfiguration -AllowTeamsConsumer $true -AllowPublicUsers $true', cost: 50, penalty: -50 }
        ]
    },

    _ensureScenario: function(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !CLD001Config._flagRestored) { CLD001Config._flagRestored = true; var s = CLD001Config._scenarios[engine.state._scenarioId]; if (s) CLD001Config.hints = CLD001Config._scenarioHints[s.id] || CLD001Config._defaultHints; } return true; },
    _applyScenario: function(engine, idx) { engine.state._scenarioId = idx; engine.state._scenarioSelected = true; engine.state._cacheFixed = false; engine.state._screenShareFixed = false; engine.state._audioFixed = false; engine.state._guestFixed = false; engine.state._externalFixed = false; engine.state._labComplete = false; engine.state._flagRevealed = false; CLD001Config._flagRestored = true; CLD001Config.hints = CLD001Config._scenarioHints[CLD001Config._scenarios[idx].id] || CLD001Config._defaultHints; engine.save(); },
    _getScenario: function(engine) { return engine.state._scenarioId != null ? CLD001Config._scenarios[engine.state._scenarioId] : null; },
    _requireScenario: function(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket. Open Help Desk Ticket first.\n'; },
    _escHtml: function(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },
    _checkFix: function(engine) {
        var s = CLD001Config._getScenario(engine); if (!s || engine.state._labComplete) return;
        var done = false;
        if (s.id === 'cache_corrupt') done = engine.state._cacheFixed;
        if (s.id === 'screenshare_blocked') done = engine.state._screenShareFixed;
        if (s.id === 'audio_echo') done = engine.state._audioFixed;
        if (s.id === 'guest_disabled') done = engine.state._guestFixed;
        if (s.id === 'external_comm') done = engine.state._externalFixed;
        if (done) { engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save(); engine.requestFlagText(s.id).then(function(f) { engine.notify(f ? 'Teams issue resolved. Check admin console for closure token.' : 'Fixed. Flag pending.', 'success'); }).catch(function() { engine.notify('Fixed. Flag pending.', 'success'); }); }
    },

    boot: { biosLines: ['HP ProDesk 400 G7 — BIOS v2.40', 'Intel Core i7-10700 @ 2.90GHz', 'Memory: 16384 MB DDR4 OK', 'NVMe: Samsung 970 EVO Plus 500GB', 'Network: Intel I219-V GbE', 'Loading Windows 11 Enterprise...'], grubEntries: ['Windows 11 Enterprise 23H2'], loginUser: 'Administrator' },
    desktop: { icons: [{ id: 'powershell', label: 'PowerShell', icon: 'PS', app: 'terminal' }, { id: 'admin', label: 'M365 Admin\nConsole', icon: 'M365', app: 'admin_console' }, { id: 'event_viewer', label: 'Event\nViewer', icon: 'EVT', app: 'event_viewer' }, { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' }, { id: 'notes', label: 'Notepad', icon: 'TXT', app: 'notes' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }] },
    terminal: { user: 'Administrator', hostname: 'ADMIN-PC', startDir: 'C:\\Users\\Administrator', promptStyle: 'powershell', welcome: 'Windows PowerShell\nConnected to Microsoft 365 Admin\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:cld001}}', points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 2400 },
    hints: [{ id: 'hint1', text: 'Read the ticket and determine if this is client-side or admin-side.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'Check Teams policies and tenant settings in the admin console.', cost: 10, penalty: -10 }, { id: 'hint3', text: 'Apply the appropriate fix for the specific Teams issue.', cost: 25, penalty: -25 }, { id: 'hint4', text: 'Verify the fix resolves the reported issue.', cost: 50, penalty: -50 }],
    lore: { intro: 'Microsoft Teams is the primary collaboration tool but users are experiencing various failures. As the M365 admin, diagnose and fix the issue.', scenario: 'Teams problems range from local client cache corruption to admin policy restrictions to tenant-level settings that block entire categories of communication.', outro: 'Teams issue resolved. Collaboration is restored.' },
    phases: [{ id: 'investigate', name: 'Investigation', requiredFlags: [], unlocks: ['diagnose'], locked: false }, { id: 'diagnose', name: 'Diagnosis', requiredFlags: [], unlocks: ['repair'], locked: true }, { id: 'repair', name: 'Remediation', requiredFlags: [], unlocks: ['verify'], locked: true }, { id: 'verify', name: 'Verification', requiredFlags: ['fixed'], unlocks: [], locked: true }],

    commands: {
        'get-csteamsmeetingpolicy': function(args, term, engine) {
            var gate = CLD001Config._requireScenario(engine); if (gate) return gate;
            var s = CLD001Config._getScenario(engine);
            var screenMode = (s.id === 'screenshare_blocked' && !engine.state._screenShareFixed) ? 'Disabled' : 'EntireScreen';
            return '\nIdentity                  : Marketing-Restricted\nScreenSharingMode         : ' + screenMode + '\nAllowIPVideo              : True\nAllowMeetingChat          : Enabled\nAllowPrivateMeetingNow    : True\nDesignatedPresenterRole   : EveryoneUserOverride\nAllowCloudRecording       : True\n\nIdentity                  : Global (Default)\nScreenSharingMode         : EntireScreen\nAllowIPVideo              : True\n';
        },
        'set-csteamsmeetingpolicy': function(args, term, engine) {
            var gate = CLD001Config._requireScenario(engine); if (gate) return gate;
            var lower = args.join(' ').toLowerCase();
            if (lower.includes('screensharingmode') && (lower.includes('entirescreen') || lower.includes('singleapplication'))) {
                engine.state._screenShareFixed = true; engine.save(); engine.notify('Screen sharing re-enabled for Marketing-Restricted policy.', 'success'); CLD001Config._checkFix(engine);
                return '\n(no output — policy updated. Changes propagate within 1 hour.)\n';
            }
            return '\nSet-CsTeamsMeetingPolicy : Specify -Identity and property to change.\n';
        },
        'clear-teamscache': function(args, term, engine) {
            var gate = CLD001Config._requireScenario(engine); if (gate) return gate;
            engine.state._cacheFixed = true; engine.save(); engine.notify('Teams cache cleared. Application will resync on next launch.', 'success'); CLD001Config._checkFix(engine);
            return '\nStopping Teams process...\nClearing cache at %AppData%\\Microsoft\\Teams...\n  Removed: Cache (23 MB)\n  Removed: blob_storage (1.2 MB)\n  Removed: databases (45 MB)\n  Removed: GPUCache (8 MB)\n  Removed: Local Storage (3 MB)\n  Removed: tmp (0.5 MB)\nCache cleared successfully. Restart Teams.\n';
        },
        'set-teamdeviceconfig': function(args, term, engine) {
            var gate = CLD001Config._requireScenario(engine); if (gate) return gate;
            var lower = args.join(' ').toLowerCase();
            if (lower.includes('jabra') || lower.includes('single') || lower.includes('headset')) {
                engine.state._audioFixed = true; engine.save(); engine.notify('Audio device configured to Jabra headset only. Echo eliminated.', 'success'); CLD001Config._checkFix(engine);
                return '\nTeams audio devices updated:\n  Speaker: Jabra Evolve2 75 (USB)\n  Microphone: Jabra Evolve2 75 (USB)\n  Secondary devices: None (Poly Sync 20 disabled)\n';
            }
            return '\nSet-TeamDeviceConfig : Specify audio device configuration.\n';
        },
        'set-csteamsclientconfiguration': function(args, term, engine) {
            var gate = CLD001Config._requireScenario(engine); if (gate) return gate;
            var lower = args.join(' ').toLowerCase();
            if (lower.includes('allowguestuser') && lower.includes('true')) {
                engine.state._guestFixed = true; engine.save(); engine.notify('Guest access enabled. External users can now join Teams channels.', 'success'); CLD001Config._checkFix(engine);
                return '\n(no output — guest access enabled. Changes propagate within 24 hours.)\n';
            }
            return '\nSet-CsTeamsClientConfiguration : Specify property to change.\n';
        },
        'set-cstenantfederationconfiguration': function(args, term, engine) {
            var gate = CLD001Config._requireScenario(engine); if (gate) return gate;
            var lower = args.join(' ').toLowerCase();
            if (lower.includes('allowteamsconsumer') || lower.includes('allowpublicusers') || lower.includes('true')) {
                engine.state._externalFixed = true; engine.save(); engine.notify('External federation enabled. CEO can now communicate with external partners.', 'success'); CLD001Config._checkFix(engine);
                return '\n(no output — external access enabled for all/specified domains.)\n';
            }
            return '\nSet-CsTenantFederationConfiguration : Enable external access.\n';
        },
        whoami: function() { return 'HEXWORTH\\Administrator (M365 Global Admin)'; },
        hostname: function() { return 'ADMIN-PC'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; }
    },

    onAppLaunch: function(iconDef, engine) {
        if (['admin_console','event_viewer'].indexOf(iconDef.app) !== -1 && !engine.state._scenarioSelected) { engine.notify('Open Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': CLD001Config._openTicket(iconDef, engine); break;
            case 'event_viewer': CLD001Config._openEV(iconDef, engine); break;
            case 'admin_console': CLD001Config._openAdmin(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset lab?')) engine.resetLab(); break;
        }
    },

    _openTicket: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'tc_cld001'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        CLD001Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) { var s = CLD001Config._getScenario(engine); c.innerHTML = '<div style="color:#0ea5e9; font-weight:bold; font-size:1rem; margin-bottom:16px;">INCIDENT #INC-' + (5000 + engine.state._scenarioId) + '</div><div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + CLD001Config._escHtml(s.ticketSubject) + '</div></div><div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + CLD001Config._escHtml(s.ticketDetail) + '</div></div><div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(14,165,233,0.08); border:1px solid rgba(14,165,233,0.25); border-radius:4px; padding:12px; line-height:1.6; color:#7dd3fc;">' + CLD001Config._escHtml(s.ticketExtra) + '</div></div><div style="color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div>'; }
        else {
            var previews = ['Teams crashes joining meetings — cache corrupt', 'Screen share grayed out — admin policy blocking', 'Audio echo in every meeting — dual devices', 'External client cannot join channel — guest disabled', 'Cannot chat with external Teams users — federation blocked'];
            var h = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#0ea5e9; font-weight:bold; font-size:1.1rem;">TEAMS ISSUES</div></div>';
            CLD001Config._scenarios.forEach(function(s, i) { h += '<button class="sb" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; cursor:pointer; font-family:Consolas,monospace;"><span style="color:#0ea5e9; font-weight:bold;">INC-' + (5000+i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + previews[i] + '</div></button>'; });
            h += '<div style="text-align:center; padding-top:16px;"><button id="rb" style="padding:10px 28px; background:#0ea5e9; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
            c.innerHTML = h;
            c.querySelectorAll('.sb').forEach(function(b) { b.addEventListener('click', function() { CLD001Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); CLD001Config._openTicket(iconDef, engine); }); });
            document.getElementById('rb').addEventListener('click', function() { CLD001Config._applyScenario(engine, Math.floor(Math.random()*5)); CLD001Config._openTicket(iconDef, engine); });
        }
    },

    _openEV: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.style.cssText = 'display:flex; flex-direction:column; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Event Viewer', 'EVT', c);
        var s = CLD001Config._getScenario(engine); var logs = s ? (CLD001Config._eventLogs[s.id] || []) : [];
        var h = '<div style="padding:10px 16px; border-bottom:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.2);"><span style="color:#0ea5e9; font-weight:bold;">Teams / M365 Event Log</span></div><div style="flex:1; overflow-y:auto;">';
        logs.forEach(function(e) { h += '<div style="border-bottom:1px solid rgba(255,255,255,0.04); cursor:pointer;" onclick="this.querySelector(\'.d\').style.display=this.querySelector(\'.d\').style.display===\'none\'?\'block\':\'none\'"><div style="display:flex; padding:6px 12px;"><span style="flex:1.5; color:#888; font-size:0.75rem;">' + e.time.replace('T',' ').substring(0,19) + '</span><span style="flex:0.5; color:#e67e22; font-weight:bold;">' + e.eventId + '</span><span style="flex:3; font-size:0.75rem;">' + e.desc + '</span></div><div class="d" style="display:none; background:rgba(0,0,0,0.3); border-left:3px solid #0ea5e9; padding:10px 16px; font-size:0.75rem; white-space:pre-wrap; color:#aaa;">' + e.detail + '</div></div>'; });
        h += '</div>'; c.innerHTML = h;
    },

    _openAdmin: function(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'M365 Admin Console', 'M365', c);
        var s = CLD001Config._getScenario(engine);
        var h = '<div style="font-size:0.9rem; font-weight:bold; color:#0ea5e9; margin-bottom:16px;">Microsoft 365 Admin Center — Teams Settings</div>';
        h += '<div style="padding:8px; margin-bottom:6px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px;"><div style="font-weight:bold; color:#7dd3fc;">Guest Access</div><div style="color:#888; font-size:0.75rem;">Allow guest access in Teams: ' + (s && s.id === 'guest_disabled' && !engine.state._guestFixed ? '<span style="color:#e74c3c;">OFF</span>' : '<span style="color:#2ecc71;">ON</span>') + '</div></div>';
        h += '<div style="padding:8px; margin-bottom:6px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px;"><div style="font-weight:bold; color:#7dd3fc;">External Access</div><div style="color:#888; font-size:0.75rem;">Federation: ' + (s && s.id === 'external_comm' && !engine.state._externalFixed ? '<span style="color:#e74c3c;">BLOCKED</span>' : '<span style="color:#2ecc71;">ALLOWED</span>') + '</div></div>';
        h += '<div style="padding:8px; margin-bottom:6px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px;"><div style="font-weight:bold; color:#7dd3fc;">Meeting Policies</div><div style="color:#888; font-size:0.75rem;">Marketing-Restricted: Screen Sharing = ' + (s && s.id === 'screenshare_blocked' && !engine.state._screenShareFixed ? '<span style="color:#e74c3c;">DISABLED</span>' : '<span style="color:#2ecc71;">ENABLED</span>') + '</div></div>';
        if (engine.state._flagRevealed && engine._deliveredFlags) { var fv = engine._deliveredFlags[s ? s.id : '']; if (fv) h += '<div style="margin-top:16px; padding:10px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px;"><div style="color:#2ecc71; font-weight:bold;">Closure Token:</div><div>' + fv + '</div></div>'; }
        c.innerHTML = h;
    }
};
