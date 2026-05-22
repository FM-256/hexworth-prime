/* ============================================================
   DISPATCH LAB — Box EM003: Calendar Catastrophe
   CompTIA A+ Core 2 — Calendar & Scheduling Troubleshooting
   Config: wrong address, double-booking, timezone, delegate,
   mobile sync
   5 distinct scenarios
   ============================================================ */

var EM003Config = {

    title: 'Calendar Catastrophe',
    subtitle: 'Meeting Mayhem — Calendar Troubleshooting',
    difficulty: 'Beginner',
    accent: '#22c55e',
    storageKey: 'hexworth_lab_em003',
    registryId: 'em003-calendar-issues',
    trackerKey: 'lab_em003',
    tutorialMode: true,

    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the calendar issue reported by the user.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check the Calendar Admin Console', tip: 'Review room bookings, user calendar settings, and delegate permissions.', trigger: { event: 'window_open', match: { type: 'cal_console' } } },
            { title: 'Investigate with CLI', tip: 'Use cal-audit, room-check, tz-check, and delegate-check to diagnose.', trigger: { event: 'command', match: { cmd: 'contains:cal-audit' }, alt: [{ event: 'command', match: { cmd: 'contains:room-check' } }, { event: 'command', match: { cmd: 'contains:tz-check' } }] } },
            { title: 'Apply the fix', tip: 'Correct the calendar setting, booking, timezone, or permission.', trigger: { event: 'command', match: { cmd: 'contains:cal-fix' } } },
            { title: 'Capture the flag', tip: 'After fixing the calendar issue, the flag appears.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: {
        certPath: 'A+ Core 2',
        mappings: [
            { flagId: 'fixed', objective: '1.6', description: 'Configure email client settings', skill: 'Calendar and Scheduling Configuration' },
            { flagId: 'fixed', objective: '4.6', description: 'Troubleshoot common networking issues', skill: 'Collaboration Tool Troubleshooting' }
        ]
    },

    _scenarioFlags: { wrong_address: null, double_booked: null, timezone_offset: null, delegate_access: null, mobile_sync: null },

    _scenarios: [
        {
            id: 'wrong_address',
            name: 'Meeting Invite Not Received',
            ticketSubject: 'VP says she never got the board meeting invite — organizer says it was sent',
            ticketDetail: 'VP of Operations Karen Brooks says she never received the calendar invite for the quarterly board meeting scheduled for April 2. The meeting organizer (CEO\'s assistant Julia Reed) says she sent the invite to all VPs. Karen checked her inbox, junk, and deleted items — nothing. Other VPs received the invite without issue. Julia confirmed she typed Karen\'s email manually instead of using the address book.',
            ticketExtra: 'IT Note: When manually typing addresses, a common error is using the wrong domain or a typo in the username. Check what address Julia actually sent the invite to. The GAL (Global Address List) has Karen as kbrooks@corp.hexworth.local. Julia may have used kbrooks@hexworth.local (missing corp subdomain) or kbrookes@corp.hexworth.local (extra e).',
            affectedUser: 'kbrooks',
            fixDescription: 'Identify wrong address, resend invite to correct address',
            stateOverrides: { _wrongAddress: true, _sentTo: 'kbrookes@corp.hexworth.local' }
        },
        {
            id: 'double_booked',
            name: 'Room Double-Booked',
            ticketSubject: 'Conference Room A shows double-booked at 2 PM — two teams showing up',
            ticketDetail: 'Two separate meetings are both booked in Conference Room A at 2:00 PM today. The Sales team booked it for a client call and the Engineering team booked it for a sprint review. Both teams received confirmation from the room calendar. The room should only accept one booking per time slot. This is the third double-booking this month.',
            ticketExtra: 'IT Note: Conference room calendars should be set to auto-accept/auto-decline based on availability. If the room is set to "auto-accept all" without conflict checking, double bookings can occur. Check the room mailbox resource settings. The room may need the "AllowConflicts" setting changed to $false.',
            affectedUser: 'Conference Room A',
            fixDescription: 'Fix room calendar auto-accept settings to prevent conflicts',
            stateOverrides: { _doubleBooked: true }
        },
        {
            id: 'timezone_offset',
            name: 'Timezone Offset',
            ticketSubject: 'Remote employee\'s meetings show 3 hours off — she\'s in Pacific but calendar shows Eastern',
            ticketDetail: 'Rachel Foster recently transferred from the New York office to the Portland office. All her calendar events now show 3 hours too early. A meeting scheduled for 2 PM Pacific shows as 2 PM on her calendar but the actual meeting is at 2 PM Eastern (which is 11 AM her time). Her Outlook timezone setting still shows Eastern Time. She\'s missed two meetings already today because of this.',
            ticketExtra: 'IT Note: When users relocate, their Outlook timezone setting doesn\'t automatically update. The timezone is set in Outlook options AND in the Exchange mailbox. Both need to match the user\'s new location. Check: (1) Outlook client timezone, (2) Exchange mailbox timezone, (3) Windows OS timezone.',
            affectedUser: 'rfoster',
            fixDescription: 'Update timezone settings in Outlook, Exchange, and Windows',
            stateOverrides: { _wrongTimezone: true, _currentTz: 'Eastern', _correctTz: 'Pacific' }
        },
        {
            id: 'delegate_access',
            name: 'Delegate Can\'t Manage Calendar',
            ticketSubject: 'Executive assistant can\'t create meetings on CEO\'s behalf — permission error',
            ticketDetail: 'Executive assistant Julia Reed needs to manage CEO James Whitfield\'s calendar. She was recently promoted from a different role and needs delegate access. When she tries to open his calendar in Outlook, she gets "You do not have permission to view this calendar." She was told by the previous assistant that she should be able to create, modify, and respond to meetings on his behalf.',
            ticketExtra: 'IT Note: Calendar delegation requires explicit permission grants in Exchange. The previous assistant (Maria Santos) had "Editor" and "Delegate" permissions on the CEO\'s calendar. Julia needs the same permissions assigned. This is done through the CEO\'s mailbox calendar permissions, not Julia\'s account.',
            affectedUser: 'jreed',
            fixDescription: 'Grant delegate and editor permissions on CEO calendar',
            stateOverrides: { _noDelegateAccess: true }
        },
        {
            id: 'mobile_sync',
            name: 'Shared Calendar Not Syncing on Mobile',
            ticketSubject: 'Team shared calendar shows on desktop Outlook but not on iPhone',
            ticketDetail: 'Project manager David Okafor has a shared team calendar "PM-Team-Calendar" that he uses to track project milestones. It shows up fine in Outlook on his desktop but does not appear on his iPhone\'s Outlook app. He\'s tried removing and re-adding his account on the phone. The default calendar (his personal calendar) syncs fine — only the shared calendar is missing.',
            ticketExtra: 'IT Note: Shared/additional calendars do not automatically sync to mobile devices via ActiveSync or the Outlook mobile app. Shared calendars need to be explicitly published or the mobile client needs to be configured to show shared calendars. In Outlook mobile, shared calendars must be added through Settings > Add Shared Calendar. The calendar must also have sharing enabled on the server side.',
            affectedUser: 'dokafor',
            fixDescription: 'Enable shared calendar on mobile by adding through Outlook mobile settings',
            stateOverrides: { _mobileNotSyncing: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Open the Calendar Admin Console to review settings and permissions.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Use cal-audit, room-check, tz-check, delegate-check to investigate.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Each calendar issue has a different root cause.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Use cal-fix to apply the correction.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        wrong_address: [
            { id: 'hint1', text: 'Use "cal-audit --invite board-meeting" to see who the invite was sent to.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The invite was sent to kbrookes@ (extra e). Karen\'s correct address is kbrooks@.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Resend the invite: "cal-fix --resend-invite kbrooks board-meeting"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: cal-fix --resend-invite kbrooks board-meeting', cost: 150, penalty: -150 }
        ],
        double_booked: [
            { id: 'hint1', text: 'Use "room-check conference-a" to see the room\'s booking settings.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The room has AllowConflicts=True. It accepts all bookings regardless of conflicts.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Fix the setting: "cal-fix --room-conflicts conference-a disable"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: cal-fix --room-conflicts conference-a disable', cost: 150, penalty: -150 }
        ],
        timezone_offset: [
            { id: 'hint1', text: 'Use "tz-check rfoster" to see timezone settings across all layers.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'All three (Outlook, Exchange, Windows) show Eastern. All need to be Pacific.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Update all: "cal-fix --timezone rfoster Pacific"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: cal-fix --timezone rfoster Pacific', cost: 150, penalty: -150 }
        ],
        delegate_access: [
            { id: 'hint1', text: 'Use "delegate-check jwhitfield" to see who has calendar permissions.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Julia (jreed) has no permissions. Maria Santos (former assistant) still has Editor+Delegate.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Grant access: "cal-fix --delegate jwhitfield jreed editor"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: cal-fix --delegate jwhitfield jreed editor', cost: 150, penalty: -150 }
        ],
        mobile_sync: [
            { id: 'hint1', text: 'Use "cal-audit --shared dokafor" to check shared calendar sync status.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'The shared calendar is not configured for mobile sync. It needs server-side sharing enabled.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Enable mobile sync: "cal-fix --mobile-sync dokafor PM-Team-Calendar"', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Run: cal-fix --mobile-sync dokafor PM-Team-Calendar', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !EM003Config._flagRestored) { EM003Config._flagRestored = true; var s = EM003Config._scenarios[engine.state._scenarioId]; if (s) EM003Config.hints = EM003Config._scenarioHints[s.id] || EM003Config._defaultHints; } return true; },
    _applyScenario(engine, idx) { engine.state._scenarioId = idx; engine.state._scenarioSelected = true; engine.state._wrongAddress = false; engine.state._doubleBooked = false; engine.state._wrongTimezone = false; engine.state._noDelegateAccess = false; engine.state._mobileNotSyncing = false; engine.state._labComplete = false; engine.state._flagRevealed = false; var o = EM003Config._scenarios[idx].stateOverrides || {}; for (var k in o) engine.state[k] = o[k]; EM003Config._flagRestored = true; EM003Config.hints = EM003Config._scenarioHints[EM003Config._scenarios[idx].id] || EM003Config._defaultHints; engine.save(); },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : EM003Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    boot: { biosLines: ['UEFI BIOS v2.20', 'Memory: 16384 MB OK', 'Loading Windows...'], grubEntries: ['Windows 10 Pro'], loginUser: 'Technician' },
    desktop: { icons: [{ id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' }, { id: 'cal', label: 'Calendar\nAdmin', icon: 'CAL', app: 'cal_console' }, { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' }, { id: 'hints', label: 'Hints', icon: '?', app: 'hints' }, { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }] },
    terminal: { user: 'Technician', hostname: 'HELPDESK01', startDir: 'C:\\Users\\Technician', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [{ id: 'hint1', text: 'Check the Calendar Admin Console.', cost: 0, penalty: 0 }, { id: 'hint2', text: 'Use CLI tools to diagnose.', cost: 10, penalty: -10 }, { id: 'hint3', text: 'Each scenario has a different cause.', cost: 25, penalty: -25 }, { id: 'hint4', text: 'Use cal-fix to resolve.', cost: 50, penalty: -50 }],
    lore: { intro: 'Calendars are a mess. Meetings are missed, rooms are double-booked, and mobile sync is broken. Fix the scheduling chaos.', scenario: 'Each scenario represents a different calendar management failure.', outro: 'Calendar crisis resolved. Meetings are back on track.' },
    phases: [{ id: 'investigate', name: 'Investigation', description: 'Read the ticket.', requiredFlags: [], unlocks: ['diagnose'], locked: false }, { id: 'diagnose', name: 'Diagnosis', description: 'Find the root cause.', requiredFlags: [], unlocks: ['fix'], locked: true }, { id: 'fix', name: 'Fix', description: 'Apply correction.', requiredFlags: [], unlocks: ['verify'], locked: true }, { id: 'verify', name: 'Verification', description: 'Confirm resolution.', requiredFlags: ['fixed'], unlocks: [], locked: true }],

    commands: {
        'cal-audit': function(args, term, engine) {
            var gate = EM003Config._requireScenario(engine); if (gate) return gate;
            var scenario = EM003Config._getScenario(engine); var joined = args.join(' ').toLowerCase();
            if (scenario && scenario.id === 'wrong_address' && joined.includes('board-meeting')) {
                return '\nCalendar Audit — Board Meeting (April 2, 2026)\n===============================================\n  Organizer: jreed (Julia Reed)\n  Recipients:\n    vpatel@corp.hexworth.local    — DELIVERED\n    mthompson@corp.hexworth.local — DELIVERED\n    kbrookes@corp.hexworth.local  — BOUNCED (550 user not found)\n    rjohnson@corp.hexworth.local  — DELIVERED\n\n  [!] kbrookes@ does not exist. Correct address: kbrooks@ (no extra e)\n  [!] Julia typed the address manually instead of using the GAL';
            }
            if (scenario && scenario.id === 'mobile_sync' && joined.includes('--shared') && joined.includes('dokafor')) {
                return '\nShared Calendar Audit — dokafor\n================================\n  Calendar: PM-Team-Calendar\n  Desktop Sync: ACTIVE (Outlook 365 desktop client)\n  Mobile Sync: NOT CONFIGURED\n  Server-side sharing: Enabled\n  Mobile app: Outlook iOS v4.2\n\n  [!] Shared calendar not added in Outlook mobile settings\n  [!] Mobile requires explicit shared calendar addition via app settings';
            }
            return '\nUsage: cal-audit --invite <meeting-name> | --shared <user>';
        },

        'room-check': function(args, term, engine) {
            var gate = EM003Config._requireScenario(engine); if (gate) return gate;
            var scenario = EM003Config._getScenario(engine); var target = args[0] || '';
            if (target.includes('conference-a')) {
                var output = '\nRoom Calendar Settings — Conference Room A\n============================================\n  Mailbox: conference-a@corp.hexworth.local\n  Capacity: 20 people\n  Equipment: Projector, Whiteboard, Video Conf\n  Auto-Accept: Enabled\n  AllowConflicts: ';
                if (scenario && scenario.id === 'double_booked' && engine.state._doubleBooked) {
                    output += 'TRUE [!] PROBLEM — Room accepts all bookings even when busy\n\n  Current Bookings for Today:\n    14:00-15:00  "Sales Client Call" (booked by: tharris)\n    14:00-15:30  "Sprint Review" (booked by: jlee)\n    [!] CONFLICT at 14:00-15:00';
                } else {
                    output += 'FALSE (correct — conflicts are rejected)';
                }
                return output;
            }
            return '\nUsage: room-check <room-name>';
        },

        'tz-check': function(args, term, engine) {
            var gate = EM003Config._requireScenario(engine); if (gate) return gate;
            var scenario = EM003Config._getScenario(engine); var target = args[0] || '';
            if (scenario && scenario.id === 'timezone_offset' && target === 'rfoster') {
                return '\nTimezone Check — rfoster (Rachel Foster)\n==========================================\n  Windows OS timezone:     Eastern Standard Time (UTC-5)\n  Outlook client timezone: Eastern Standard Time (UTC-5)\n  Exchange mailbox tz:     Eastern Standard Time (UTC-5)\n  Physical location:       Portland, OR (Pacific Time, UTC-8)\n\n  [!] ALL THREE TIMEZONE SETTINGS ARE WRONG\n  [!] User relocated to Portland — timezone should be Pacific (UTC-8)\n  [!] 3-hour offset explains why meetings appear at wrong times';
            }
            return '\nUsage: tz-check <username>';
        },

        'delegate-check': function(args, term, engine) {
            var gate = EM003Config._requireScenario(engine); if (gate) return gate;
            var scenario = EM003Config._getScenario(engine); var target = args[0] || '';
            if (target === 'jwhitfield') {
                var output = '\nCalendar Permissions — jwhitfield (CEO James Whitfield)\n========================================================\n  Delegates:\n    msantos — Editor + Delegate (Send on Behalf) [Former assistant — STALE]';
                if (scenario && scenario.id === 'delegate_access' && engine.state._noDelegateAccess) {
                    output += '\n\n  [!] jreed (Julia Reed, current assistant) has NO permissions\n  [!] She needs Editor + Delegate to manage the CEO\'s calendar';
                } else {
                    output += '\n    jreed — Editor + Delegate (Send on Behalf)';
                }
                return output;
            }
            return '\nUsage: delegate-check <calendar-owner>';
        },

        'cal-fix': function(args, term, engine) {
            var gate = EM003Config._requireScenario(engine); if (gate) return gate;
            var scenario = EM003Config._getScenario(engine); var joined = args.join(' ').toLowerCase();

            if (scenario && scenario.id === 'wrong_address' && joined.includes('--resend-invite') && joined.includes('kbrooks')) {
                engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Board meeting invite resent to correct address.', 'success'); }, 400);
                return '\nCalendar Fix — Resend Invite\n=============================\n  Resending board meeting invite to kbrooks@corp.hexworth.local... OK\n  Karen Brooks received the invite and accepted.\n  Notifying organizer (Julia Reed) about the address typo... OK\n\n  Tip: Always use the GAL/address book instead of typing addresses manually.\n\n=== FLAG: EM003{wrong_address_resent_gal} ===';
            }
            if (scenario && scenario.id === 'double_booked' && joined.includes('--room-conflicts') && joined.includes('conference-a') && joined.includes('disable')) {
                engine.state._doubleBooked = false; engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Room conflict checking enabled. Double-bookings prevented.', 'success'); }, 400);
                return '\nRoom Calendar Fix — Conference Room A\n=======================================\n  Setting AllowConflicts to $false... OK\n  Enabling automatic conflict detection... OK\n  Declining conflicting booking (Sprint Review moved to Room B)... OK\n\n  Conference Room A will now auto-decline conflicting bookings.\n\n=== FLAG: EM003{double_booked_conflicts_disabled} ===';
            }
            if (scenario && scenario.id === 'timezone_offset' && joined.includes('--timezone') && joined.includes('rfoster') && joined.includes('pacific')) {
                engine.state._wrongTimezone = false; engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Timezone updated to Pacific across all systems.', 'success'); }, 400);
                return '\nTimezone Fix — rfoster\n=======================\n  Updating Windows OS timezone to Pacific... OK\n  Updating Outlook client timezone to Pacific... OK\n  Updating Exchange mailbox timezone to Pacific... OK\n\n  All calendar events will now display in Pacific Time.\n  Rachel\'s meetings are correctly aligned to Portland hours.\n\n=== FLAG: EM003{timezone_offset_pacific_set} ===';
            }
            if (scenario && scenario.id === 'delegate_access' && joined.includes('--delegate') && joined.includes('jwhitfield') && joined.includes('jreed')) {
                engine.state._noDelegateAccess = false; engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Julia now has delegate access to CEO calendar.', 'success'); }, 400);
                return '\nDelegate Permission Fix\n========================\n  Granting jreed Editor permission on jwhitfield calendar... OK\n  Granting jreed Delegate (Send on Behalf) permission... OK\n  Removing stale msantos permissions... OK\n\n  Julia Reed can now view, create, modify, and respond to meetings\n  on behalf of CEO James Whitfield.\n\n=== FLAG: EM003{delegate_access_granted} ===';
            }
            if (scenario && scenario.id === 'mobile_sync' && joined.includes('--mobile-sync') && joined.includes('dokafor')) {
                engine.state._mobileNotSyncing = false; engine.state._labComplete = true; engine.state._flagRevealed = true; engine.save();
                setTimeout(function() { engine.notify('Shared calendar now syncing to mobile device.', 'success'); }, 400);
                return '\nMobile Calendar Sync Fix\n=========================\n  Enabling server-side shared calendar for mobile sync... OK\n  Pushing PM-Team-Calendar to dokafor\'s Outlook mobile... OK\n  Sync status: ACTIVE\n\n  David should see the shared calendar appear in Outlook mobile\n  within 5 minutes. Pull-to-refresh to force immediate sync.\n\n=== FLAG: EM003{mobile_sync_shared_calendar} ===';
            }

            return '\nUsage: cal-fix [action]\n  --resend-invite <user> <meeting>   Resend calendar invite\n  --room-conflicts <room> disable    Fix room conflict settings\n  --timezone <user> <timezone>       Update user timezone\n  --delegate <owner> <user> editor   Grant delegate access\n  --mobile-sync <user> <calendar>    Enable mobile calendar sync';
        },

        whoami: function() { return 'HELPDESK01\\Technician'; },
        hostname: function() { return 'HELPDESK01'; },
        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },
        ifconfig: function() { return '\'ifconfig\' is not recognized.'; },
        grep: function() { return '\'grep\' is not recognized.'; },
        sudo: function() { return '\'sudo\' is not recognized.'; }
    },

    onAppLaunch(iconDef, engine) {
        if (iconDef.app === 'cal_console' && !engine.state._scenarioSelected) { engine.notify('Open the ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': EM003Config._openTicket(iconDef, engine); break;
            case 'cal_console': EM003Config._openCalConsole(iconDef, engine); break;
            case 'reset_lab': if (confirm('Reset?')) engine.resetLab(); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer';
        c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        EM003Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) { EM003Config._renderTicket(engine, c); } else { EM003Config._renderPicker(engine, c); }
    },

    _renderPicker(engine, container) {
        var p = ['Karen Brooks — "Never got the board meeting invite"', 'Facilities — "Conference Room A double-booked at 2 PM"', 'Rachel Foster — "Meetings show 3 hours off after office transfer"', 'Julia Reed — "Can\'t manage CEO calendar — permission error"', 'David Okafor — "Shared team calendar not showing on iPhone"'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#22c55e; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">CALENDAR HELP DESK QUEUE</div></div><div style="margin-bottom:16px;">';
        EM003Config._scenarios.forEach(function(s, i) { html += '<button class="em-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><div style="display:flex; justify-content:space-between;"><span style="color:#22c55e; font-weight:bold;">CAL-' + (1000 + i) + '</span><span style="background:#f59e0b; color:#000; padding:1px 8px; border-radius:3px; font-size:0.65rem;">URGENT</span></div><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + p[i] + '</div></button>'; });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="emRandomBtn" style="padding:10px 28px; background:#22c55e; color:#000; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.em-scenario-btn').forEach(function(btn) { btn.addEventListener('click', function() { EM003Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); EM003Config._renderTicket(engine, container); }); });
        document.getElementById('emRandomBtn').addEventListener('click', function() { EM003Config._applyScenario(engine, Math.floor(Math.random() * EM003Config._scenarios.length)); EM003Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var s = EM003Config._getScenario(engine);
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><span style="color:#22c55e; font-weight:bold; font-size:1rem;">TICKET #CAL-' + (1000 + engine.state._scenarioId) + '</span></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">REPORTED BY</div><div style="font-weight:bold; color:#22c55e;">' + s.affectedUser + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + EM003Config._escHtml(s.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">' + EM003Config._escHtml(s.ticketDetail) + '</div></div>'
            + (s.ticketExtra ? '<div style="margin-bottom:16px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#86efac;">' + EM003Config._escHtml(s.ticketExtra) + '</div></div>' : '')
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;"><div style="color:#2ecc71; font-weight:bold;">Assigned to: YOU</div></div>';
    },

    _openCalConsole(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'calContainer';
        c.style.cssText = 'padding:16px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Calendar Admin Console', 'CAL', c);
        var sc = engine.state._labComplete ? '#22c55e' : '#f59e0b';
        c.innerHTML = '<div style="color:#22c55e; font-weight:bold; font-size:1rem; margin-bottom:12px;">Calendar Admin Console</div><div style="padding:12px; background:rgba(' + (engine.state._labComplete ? '34,197,94' : '245,158,11') + ',0.08); border:1px solid rgba(' + (engine.state._labComplete ? '34,197,94' : '245,158,11') + ',0.2); border-radius:4px; text-align:center;"><div style="color:' + sc + '; font-weight:bold;">' + (engine.state._labComplete ? 'ALL NORMAL' : 'ISSUES DETECTED') + '</div></div><div style="margin-top:16px; color:#888; font-size:0.75rem;">Use: cal-audit, room-check, tz-check, delegate-check, cal-fix</div>';
    }
};
