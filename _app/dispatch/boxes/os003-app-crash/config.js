/* ============================================================
   DISPATCH LAB — Box OS3: Application Crash
   CompTIA A+ Core 2 — Application Crash (3.1)
   5 distinct scenarios
   ============================================================ */

var OS3Config = {

    title: 'Application Crash',
    subtitle: 'Has Stopped Working — A+ Core 2 Application Troubleshooting',
    difficulty: 'Intermediate',
    accent: '#3b82f6',
    storageKey: 'hexworth_lab_os3',
    registryId: 'os003-app-crash',
    trackerKey: 'lab_os3',

    tutorialMode: true,
    tutorial: {
        steps: [
            { title: 'Open the Help Desk Ticket', tip: 'Read the complaint.', trigger: { event: 'window_open', match: { type: 'ticket' } } },
            { title: 'Check diagnostics', tip: 'Open the diagnostic panel to inspect the system.', trigger: { event: 'window_open', match: { type: 'hw_panel' } } },
            { title: 'Investigate the root cause', tip: 'Use Command Prompt and the diagnostic panel to identify the problem.', trigger: { event: 'command', match: { cmd: 'contains:help' }, alt: [{ event: 'window_open', match: { type: 'hw_panel' } }] } },
            { title: 'Apply the fix', tip: 'Each scenario has a different fix. Apply it via the diagnostic panel.', trigger: { event: 'window_open', match: { type: 'hw_panel' } } },
            { title: 'Capture the flag', tip: 'After fixing the issue, locate the token.', trigger: { event: 'flag_correct', match: { flagId: 'fixed' } } }
        ]
    },

    certObjectives: { certPath: 'A+ Core 2', mappings: [
        { flagId: 'fixed', objective: '3.1', description: 'Troubleshoot common Windows OS problems', skill: 'Application Dependencies, Compatibility, Profiles' }
    ] },

    _scenarioFlags: { missing_vcredist: null, dll_not_found: null, compat_mode: null, corrupt_profile: null, dotnet_conflict: null },

    _scenarios: [
        {
            id: 'missing_vcredist',
            name: 'Missing Visual C++ Redistributable',
            ticketSubject: 'New app crashes immediately on launch with "missing VCRUNTIME140.dll"',
            ticketDetail: 'I downloaded and installed a new application but when I try to open it I get an error: "The program can\'t start because VCRUNTIME140.dll is missing from your computer." I tried reinstalling the application and it still happens.',
            ticketExtra: 'IT Note: VCRUNTIME140.dll is part of the Visual C++ 2015-2022 Redistributable. Many applications require this runtime. It may have been removed during a cleanup or was never installed on this machine. Download and install the VC++ Redistributable from Microsoft. In this lab: the installer is not staged on the machine, so use Apply Fix in the App Panel — it stands in for obtaining and running the official package. You can still confirm the fault from Command Prompt with dir and wmic.',
            affectedDevice: 0,
            fixDescription: 'Install Visual C++ 2015-2022 Redistributable (x64 and x86)',
            stateOverrides: { _missingVcredist: true }
        },
        {
            id: 'dll_not_found',
            name: 'DLL Not Found Error',
            ticketSubject: 'Program crashes with "MSVCP120.dll not found" error',
            ticketDetail: 'When I try to run our inventory management software, I get: "The program can\'t start because MSVCP120.dll is missing." This is critical business software. It was working last week. IT ran a system cleanup on Friday — could that have removed something?',
            ticketExtra: 'IT Note: MSVCP120.dll is from VC++ 2013 Redistributable. The system cleanup on Friday may have removed older redistributables. Business-critical software often depends on specific older runtimes. Install VC++ 2013 Redistributable. Going forward, mark these as protected from cleanup. In this lab: the installer is not staged on the machine, so use Apply Fix in the App Panel; confirm the fault first with dir and wmic.',
            affectedDevice: 0,
            fixDescription: 'Install Visual C++ 2013 Redistributable to restore MSVCP120.dll',
            stateOverrides: { _dllNotFound: true }
        },
        {
            id: 'compat_mode',
            name: 'Compatibility Mode Needed',
            ticketSubject: 'Legacy application from 2012 will not run on Windows 10 — "not compatible"',
            ticketDetail: 'We have a legacy application from 2012 that we still need for accessing old project archives. It will not run on Windows 10 — it either crashes immediately or says "This app can\'t run on your PC." The vendor went out of business so there are no updates. We need this to work.',
            ticketExtra: 'IT Note: Legacy 32-bit applications sometimes have Windows version checks that reject Windows 10. Right-click the executable, Properties, Compatibility tab. Try running in Windows 7 or Windows 8 compatibility mode. Also try "Run as Administrator" if it needs elevated permissions for registry/file access.',
            affectedDevice: 0,
            fixDescription: 'Set compatibility mode to Windows 7 and enable Run as Administrator',
            stateOverrides: { _compatMode: true }
        },
        {
            id: 'corrupt_profile',
            name: 'Corrupt User Profile',
            ticketSubject: 'All my apps crash but they work fine when I log in as a different user',
            ticketDetail: 'Every application I try to open crashes within seconds — Chrome, Word, Outlook, everything. But when I logged into the same computer with a different user account, everything works perfectly. My account seems to be broken. I have important desktop files and bookmarks I cannot lose.',
            ticketExtra: 'IT Note: If apps crash only under one profile, the user profile is corrupt. The NTUSER.DAT registry hive or AppData folders may be damaged. Create a new profile and migrate the user data (Desktop, Documents, Favorites, Chrome profile). Do not delete the old profile until data is confirmed migrated.',
            affectedDevice: 0,
            fixDescription: 'Create new user profile and migrate data from corrupt profile',
            stateOverrides: { _corruptProfile: true }
        },
        {
            id: 'dotnet_conflict',
            name: '.NET Framework Version Conflict',
            ticketSubject: 'Business app says ".NET Framework 3.5 required" but I thought we had .NET',
            ticketDetail: 'When I try to run our legacy accounting software, it says ".NET Framework 3.5 is required but is not installed." But I know the computer has .NET because other apps use it. How can .NET be both installed and not installed?',
            ticketExtra: 'IT Note: Windows 10 includes .NET 4.x but .NET 3.5 (which includes 2.0) is an optional Windows Feature that must be enabled separately. Go to Control Panel > Programs > Turn Windows Features On/Off > check ".NET Framework 3.5". Windows will download and install the older framework alongside 4.x.',
            affectedDevice: 0,
            fixDescription: 'Enable .NET Framework 3.5 via Windows Features (Turn Windows Features On/Off)',
            stateOverrides: { _dotnetConflict: true }
        }
    ],

    _defaultHints: [
        { id: 'hint1', text: 'Read the ticket and check the diagnostic panel.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Each scenario has a unique root cause. Investigate carefully.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use the diagnostic panel to inspect and fix components.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The flag appears after applying the fix.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        missing_vcredist: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Confirm with dir C:\\Windows\\System32\\vcruntime140.dll and wmic product get name. The installer is not on this machine — obtaining and running the official package is the App Panel\'s Apply Fix.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        dll_not_found: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Confirm with dir C:\\Windows\\System32\\msvcp120.dll and wmic product get name. The 2013 installer is not on this machine — use the App Panel\'s Apply Fix.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        compat_mode: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Compatibility settings live in the registry. Set them with: reg add "HKCU\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers" /v "C:\\Legacy\\InventoryPro.exe" /d "~ WIN7 RUNASADMIN" /f  — or use the App Panel.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        corrupt_profile: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Check the profile size with dir /s C:\\Users\\username | find "File(s)", then clear the corrupt caches: del /q /s C:\\Users\\username\\AppData\\Local\\Temp\\*. Renaming the profile is the heavier alternative — that one is the App Panel.', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ],
        dotnet_conflict: [
            { id: 'hint1', text: 'Read the ticket and internal notes for clues.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the diagnostic panel and inspect the affected component.', cost: 50, penalty: -50 },
            { id: 'hint3', text: 'Check what is installed with reg query "HKLM\\SOFTWARE\\Microsoft\\NET Framework Setup\\NDP" /s, then enable it: dism /online /enable-feature /featurename:NetFx3 /all', cost: 100, penalty: -100 },
            { id: 'hint4', text: 'Apply the fix in the diagnostic panel.', cost: 150, penalty: -150 }
        ]
    },

    _ensureScenario(engine) { if (!engine.state._scenarioSelected) return false; if (engine.state._scenarioId != null && !OS3Config._flagRestored) { OS3Config._flagRestored = true; var s = OS3Config._scenarios[engine.state._scenarioId]; if (s) OS3Config.hints = OS3Config._scenarioHints[s.id] || OS3Config._defaultHints; } return true; },
    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx; engine.state._scenarioSelected = true;
        engine.state._missingVcredist = false; engine.state._dllNotFound = false; engine.state._compatMode = false; engine.state._corruptProfile = false; engine.state._dotnetConflict = false;
        engine.state._labComplete = false; engine.state._flagRevealed = false;
        /* Simulated machine state the terminal acts on, reset per scenario so a
         * half-finished repair cannot carry into the next ticket. */
        engine.state._dllPresent = false; engine.state._compatSet = false;
        engine.state._cachesCleared = false; engine.state._netfx3Enabled = false;
        engine.state._compatExe = null; engine.state._compatValue = null;
        var ov = OS3Config._scenarios[idx].stateOverrides || {}; for (var k in ov) engine.state[k] = ov[k];
        OS3Config._flagRestored = true; OS3Config.hints = OS3Config._scenarioHints[OS3Config._scenarios[idx].id] || OS3Config._defaultHints; engine.save();
    },
    _getScenario(engine) { return engine.state._scenarioId == null ? null : OS3Config._scenarios[engine.state._scenarioId]; },
    _requireScenario(engine) { return engine.state._scenarioSelected ? null : '\nERROR: No active ticket.\nOpen the Help Desk Ticket first.'; },
    _escHtml(str) { var d = document.createElement('div'); d.textContent = str; return d.innerHTML; },

    /* ────────────────────────────────────────────────────────────────────────────
       WHAT THIS BOX CAN AND CANNOT DO, and why.

       Measured on hexworth.com 2026-09-16: the walkthrough documents 16 commands, 15 of
       which failed outright and the 16th — `dir C:\Windows\System32\vcruntime140.dll`,
       scenario 1's entire diagnostic — answered about C:\Users\Technician instead. A
       confidently wrong answer to "is the DLL there?" is worse than no answer.

       DIAGNOSIS works everywhere: dir over a real per-scenario file model, wmic product,
       reg query, findstr, find.

       THE FIX is a terminal operation in three scenarios and a panel action in two:

         compat_mode      reg add …\AppCompatFlags\Layers   — how compatibility flags are
                                                              really set, and A+ 5.1 material
         corrupt_profile  del the AppData caches            — the walkthrough's own Option A
         dotnet_conflict  dism /online /enable-feature      — the documented fix

         missing_vcredist } PANEL ONLY. Not because installers are hard, but because
         dll_not_found    } vc_redist.x64.exe is a file this machine does not have. The
                            ticket says "Download and install the VC++ Redistributable from
                            Microsoft" — the download is a real step the technician must
                            perform. Pre-staging the installer so a command could consume it
                            would fabricate that step, and would gut the walkthrough's own
                            warning about grabbing DLLs from random sites, which only means
                            anything if acquiring the official package is something the
                            student actually reasons about. So the terminal answers those
                            installer names exactly as Windows does — the file is not there.
       ──────────────────────────────────────────────────────────────────────────── */

    /* THE ONLY PLACE A SCENARIO IS MARKED COMPLETE. Panel and terminal both route here, so
     * the two cannot disagree about what "done" means — and it writes the scenario's own
     * stateOverrides key, which a mirrored pair of writers would forget (os002's lesson). */
    _completeScenario(engine, notice) {
        var sc = OS3Config._getScenario(engine);
        if (!sc || engine.state._flagRevealed) return;
        engine.state[Object.keys(sc.stateOverrides)[0]] = false;
        engine.state._flagRevealed = true;
        engine.state._labComplete = true;
        engine.save();
        engine.notify(notice || 'Fix applied. Check the App Panel for the token.', 'success');
        OS3Config._renderPanel(engine);
    },

    /* Each scenario names the condition its OWN hint3 and ticket describe. */
    _checkComplete(engine) {
        var sc = OS3Config._getScenario(engine);
        if (!sc || engine.state._flagRevealed) return '';
        if (sc.id === 'compat_mode' && engine.state._compatSet) {
            OS3Config._completeScenario(engine, 'Compatibility layer applied. Token available in the App Panel.');
            /* Named from what was written, not from the walkthrough's example. Any of the ten
             * OS layers resolves this ticket, so hardcoding "Windows 7" told nine of them a
             * falsehood about their own fix. */
            var applied = String(engine.state._compatValue || '').split(/\s+/).filter(function (x) {
                return OS3Config._COMPAT_OS_LAYERS.indexOf(x.toUpperCase()) > -1;
            })[0];
            return '\nThe application now starts under the ' + (applied ? applied.toUpperCase() : 'requested') + ' compatibility layer.\n';
        }
        if (sc.id === 'corrupt_profile' && engine.state._cachesCleared) {
            OS3Config._completeScenario(engine, 'Profile caches cleared. Token available in the App Panel.');
            return '\nThe corrupt cache is gone and the applications start normally for this user.\n';
        }
        if (sc.id === 'dotnet_conflict' && engine.state._netfx3Enabled) {
            OS3Config._completeScenario(engine, '.NET Framework 3.5 enabled. Token available in the App Panel.');
            return '\n.NET Framework 3.5 is enabled and the application launches.\n';
        }
        return '';
    },

    /* Which runtime DLL this scenario is about, or null if the scenario is not about one. */
    /* AppCompatFlags\Layers tokens, split by what they actually DO.
     *
     * An OS layer makes the application believe it is running on an older Windows — that is
     * the emulation this ticket's root cause needs. A modifier changes something else about
     * how the process runs: RUNASADMIN requests elevation, HIGHDPIAWARE changes DPI
     * scaling, 640X480 forces a resolution. All are real, all are accepted by Windows, and
     * none of them alone resolves "this app was built for Windows 7 and refuses to start
     * on Windows 10".
     *
     * These are two lists rather than one because a single whitelist is what let
     * /d "RUNASADMIN" alone complete the scenario — a student getting full credit without
     * ever touching compatibility mode. The walkthrough frames it the same way: Step 1 is
     * the Windows 7 layer, "also try Run as administrator" is secondary.
     *
     * DERIVED BY THE TEST, NOT RESTATED IN IT. os003-completability enumerates both arrays
     * off this config and tries EVERY token on its own, so a token added here is covered
     * without anyone remembering to guess it. That is the answer to four straight rounds of
     * hand-picked near-misses: the machine enumerates the whitelist, not me. */
    _COMPAT_OS_LAYERS: ['WIN95', 'WIN98', 'WINXPSP2', 'WINXPSP3', 'VISTARTM', 'VISTASP2', 'WIN7RTM', 'WIN7', 'WIN8RTM', 'WIN8'],
    _COMPAT_MODIFIERS: ['RUNASADMIN', 'HIGHDPIAWARE', '640X480', 'DISABLEDXMAXIMIZEDWINDOWEDMODE'],

    /* One canonical size per file, so no branch can contradict another. */
    _DLL_SIZES: { 'vcruntime140.dll': 95712, 'msvcp120.dll': 456792 },

    /* The profile the fault follows, and the accounts this machine has. */
    _AFFECTED_USER: 'username',
    _ACCOUNTS: ['Technician', 'Public', 'username'],

    /* SUBSTRINGS ARE NOT IDENTIFIERS.
     * `del` gated on t.indexOf('username') and `dism` on low.indexOf('netfx3'), so
     * C:\Users\notusername\..., C:\Users\myusername2\..., /featurename:netfx3legacyfoo and
     * /featurename:notnetfx3 all completed their tickets. Chris reproduced every one live.
     *
     * Worth recording WHY, because the first fix was wrong in an instructive way: Nancy had
     * found this class using `Public` and `Technician`, and I closed those two strings and
     * the verb direction while leaving indexOf in place. She had told me the round before
     * that I was automating instances rather than the pattern, and I did it again one
     * function over. These helpers exist so no handler in this box compares an identifier
     * by substring again. */

    /* The account a Windows path belongs to: C:\Users\<account>\... -> '<account>'. */
    /* Reads the account from the RESOLVED path, so `\..\` cannot point it at one profile
     * while the command acts on another. */
    _accountInPath(raw) {
        var segs = OS3Config._resolvePath(raw).split('\\').filter(Boolean);
        for (var i = 0; i < segs.length - 1; i++) {
            if (segs[i].toLowerCase() === 'users') return segs[i + 1];
        }
        return null;
    },

    /* The value of a `/switch:value` argument, compared exactly by the caller. */
    /* NEVER DETECT A FLAG, VERB OR KEY BY SEARCHING THE FLATTENED COMMAND LINE.
     *
     * Round five of one disease. `reg add`'s key gate was
     * low.indexOf('appcompatflags') && low.indexOf('layers') where low was the WHOLE joined
     * argv, so both words could be smuggled in through a filename —
     * /v "C:\Legacy\AppCompatFlagsLayers.exe" against a nonsense registry key completed the
     * ticket. `dism`'s verb check had the same shape: the garbage token `foo/enable-feature`
     * contains the substring, so it credited an enable that was never requested.
     *
     * Both functions already extracted their OTHER arguments correctly. The gate one line
     * above the correct code was the thing nobody had looked at. So these primitives exist
     * and every gate in this box now uses them: a switch is an EXACT token, and a value is
     * read from the argv position that is supposed to hold it. There is a structural check
     * in os003-completability asserting no handler here calls indexOf on a rejoined string
     * again. */
    /* A STRUCTURED IDENTIFIER IS VALIDATED BY ITS STRUCTURE, NOT BY CONTAINMENT.
     *
     * Round six, and the distinction is Chris's: a source-shape assertion can catch "read
     * the wrong variable"; it cannot catch "validated the right variable with the wrong
     * logic". The key gate had been correctly scoped to the key argument the round before —
     * and still accepted `HKCU\Software\Whatever\AppCompatFlagsLayersXYZ` and
     * `HKCU\LayersAppCompatFlagsBogus`, because it only asked whether two words appeared
     * somewhere in the text, in any order, concatenated or not. Neither is a real registry
     * path.
     *
     * Unlike the /v filename — deliberately unconstrained, because the ticket never names
     * the application — a registry key is NOT ambiguous. There is exactly one real path for
     * this, and the ticket and walkthrough both use it. Requiring that shape is grading
     * whether the student wrote the real key, not grading a guess.
     *
     * Same primitive as _accountInPath: split into segments, compare specific ones. */
    /* THE WHOLE KEY, ANCHORED — not a recognisable pair of segments floating in it.
     *
     * _keyPathHas required AppCompatFlags\Layers to be adjacent and ordered, which killed the
     * concatenation and reordering tricks but still accepted
     * `HKCU\Software\ZzzMadeUpVendorNoSuchThing\Whatever\AppCompatFlags\Layers` (everything
     * before the pair fabricated) and `AppCompatFlags\Layers` with no hive at all — which
     * real reg.exe rejects outright as a syntactically invalid path.
     *
     * The walkthrough and hint3 both state the exact key, so there is no "grading a guess"
     * argument for tolerating a fabricated or missing prefix, the way there is for the /v
     * filename. The canonical paths are named once and compared whole. Hive aliases are
     * normalised because reg.exe accepts both forms and a student typing
     * HKEY_CURRENT_USER is not making a mistake. */
    _HIVES: { hkcu: 'hkcu', hkey_current_user: 'hkcu', hklm: 'hklm', hkey_local_machine: 'hklm',
              hkcr: 'hkcr', hkey_classes_root: 'hkcr', hku: 'hku', hkey_users: 'hku',
              hkcc: 'hkcc', hkey_current_config: 'hkcc' },
    _KEY_LAYERS: 'hkcu\\software\\microsoft\\windows nt\\currentversion\\appcompatflags\\layers',
    _KEY_NDP: 'hklm\\software\\microsoft\\net framework setup\\ndp',

    /* null when the key has no valid hive — reg.exe's own rule. */
    _canonKey(key) {
        var segs = String(key || '').replace(/\//g, '\\').split('\\')
            .map(function (x) { return x.trim().toLowerCase(); }).filter(Boolean);
        if (!segs.length) return null;
        var hive = OS3Config._HIVES[segs[0]];
        if (!hive) return null;
        segs[0] = hive;
        return segs.join('\\');
    },

    _keyPathHas(key, seq) {
        var segs = String(key || '').replace(/\//g, '\\').split('\\')
            .map(function (x) { return x.trim().toLowerCase(); }).filter(Boolean);
        var want = seq.map(function (x) { return x.toLowerCase(); });
        for (var i = 0; i + want.length <= segs.length; i++) {
            var hit = true;
            for (var j = 0; j < want.length; j++) { if (segs[i + j] !== want[j]) { hit = false; break; } }
            if (hit) return true;
        }
        return false;
    },

    _hasSwitch(args, name) {
        var n = name.toLowerCase();
        return (args || []).some(function (a) { return a.toLowerCase() === n; });
    },

    /* The value occupying argv positions from `from` up to the first /switch. Quotes are
     * stripped upstream, so a registry key with spaces arrives as several tokens. */
    _leadingValue(args, from) {
        var out = [];
        for (var i = from; i < (args || []).length; i++) {
            if (args[i].charAt(0) === '/') break;
            out.push(args[i]);
        }
        return out.join(' ').replace(/^"|"$/g, '');
    },

    _switchColonValue(args, name) {
        var lead = name.toLowerCase() + ':';
        var hits = (args || []).filter(function (a) { return a.toLowerCase().indexOf(lead) === 0; });
        /* Taking the FIRST match meant `/featurename:NetFx3 /featurename:Bogus` succeeded
         * while the reverse order failed. Real dism.exe accepts the switch once; a repeat is
         * an error either way round, so ambiguity is reported rather than silently resolved. */
        if (hits.length > 1) return { ambiguous: true };
        return hits.length ? hits[0].slice(lead.length).replace(/^"|"$/g, '') : null;
    },

    _dllFor(engine) {
        var sc = OS3Config._getScenario(engine);
        if (!sc) return null;
        if (sc.id === 'missing_vcredist') return { name: 'vcruntime140.dll', size: OS3Config._DLL_SIZES['vcruntime140.dll'], pkg: 'Microsoft Visual C++ 2015-2022 Redistributable' };
        if (sc.id === 'dll_not_found') return { name: 'msvcp120.dll', size: OS3Config._DLL_SIZES['msvcp120.dll'], pkg: 'Microsoft Visual C++ 2013 Redistributable' };
        return null;
    },

    /* ONE RESOLVER. EVERY HANDLER CONSUMES THE RESOLVED PATH, NEVER THE RAW STRING.
     *
     * Four review rounds found the same disease in four places: an identifier pulled out of
     * one fragment of a string while the surrounding claim went unexamined. The fourth was
     * `C:\Users\username\..\Public\AppData\Local\Temp\*` completing the corrupt-profile
     * ticket — a path that really resolves to PUBLIC's cache — while
     * `C:\Users\Public\..\username\AppData\...`, which genuinely resolves to the affected
     * account, was rejected. `_accountInPath` was reading the segment after the first
     * `Users` token and never asking what the path actually names once Windows applies `..`.
     *
     * Chris's words, and they are the right general fix rather than a fourth patch: before
     * any handler derives an identifier from a path, run it through one shared resolver that
     * collapses . and .. the way Windows does, and have every handler consume that.
     * `_dirEntry` already sidestepped this by matching whole normalized paths against a
     * table, which is why dir and cd never had it. */
    _resolvePath(raw) {
        var t = String(raw || '').trim().replace(/^["']|["']$/g, '').replace(/\//g, '\\');
        var drive = '';
        var m = t.match(/^([a-zA-Z]:)\\?/);
        if (m) { drive = m[1].toLowerCase(); t = t.slice(m[0].length); }
        else if (t.indexOf('\\\\') === 0) { drive = '\\\\'; t = t.slice(2); }
        var out = [];
        t.split('\\').forEach(function (seg) {
            if (!seg || seg === '.') return;
            if (seg === '..') { out.pop(); return; }   // Windows clamps at the root
            out.push(seg);
        });
        var joined = out.join('\\');
        if (drive === '\\\\') return ('\\\\' + joined).toLowerCase();
        return (drive ? drive + '\\' : '') + joined.toLowerCase();
    },

    _normPath(raw) {
        var t = OS3Config._resolvePath(raw).replace(/\\+$/, '');
        return t === 'c:' ? 'c:\\' : t;
    },

    /* A SMALL, HONEST FILE MODEL — not os002's. os002 needed mutating byte-accounted state
     * shared across five commands; os003 needs one fact per scenario: is this DLL present
     * right now. Anything not listed answers cmd.exe's real "File Not Found". */
    _dirEntry(engine, rawPath) {
        var e = OS3Config._dirExplicit(engine, rawPath);
        if (e) return e;
        /* DIR AND CD MUST AGREE, OR DIR IS LYING. box-shell-consistency's SHELL-002 caught
         * `dir` advertising AppData, Desktop and Documents at the start directory while `cd`
         * refused all three. Anything a listing shows as <DIR> is now somewhere cd can go,
         * by construction rather than by remembering to add it twice. */
        var label = OS3Config._advertisedDir(engine, OS3Config._normPath(rawPath));
        return label ? { label: label, items: [], totalFiles: 0, totalBytes: 0 } : null;
    },

    _advertisedDir(engine, path) {
        var i = path.lastIndexOf('\\');
        if (i < 2) return null;
        var parent = path.slice(0, i);
        if (parent === 'c:') parent = 'c:\\';
        var leaf = path.slice(i + 1);
        var pe = OS3Config._dirExplicit(engine, parent);
        if (!pe || !pe.items) return null;
        var hit = null;
        pe.items.forEach(function (it) { if (it.dir && it.name.toLowerCase() === leaf) hit = it.name; });
        return hit ? (pe.label.replace(/\\+$/, '') + '\\' + hit) : null;
    },

    _dirExplicit(engine, rawPath) {
        var path = OS3Config._normPath(rawPath);
        var dll = OS3Config._dllFor(engine);
        var sys32 = 'c:\\windows\\system32';
        if (dll && path === sys32 + '\\' + dll.name) {
            if (!engine.state._dllPresent) return null;   // genuinely absent — File Not Found
            return { label: 'C:\\Windows\\System32', file: { name: dll.name, size: dll.size } };
        }
        if (path === sys32 + '\\vcruntime140.dll' || path === sys32 + '\\msvcp120.dll') {
            /* The OTHER scenario's DLL. Present, because only the active ticket's runtime is
             * missing — saying both are gone would invent a second fault. Size comes from the
             * SAME table the active-scenario branch uses: it was hardcoded to 95712 here, so
             * msvcp120.dll measured 95,712 bytes in one ticket and 456,792 in another. One
             * file, two sizes, depending on which ticket happened to be open. */
            var other = path.split('\\').pop();
            return { label: 'C:\\Windows\\System32', file: { name: other, size: OS3Config._DLL_SIZES[other] || 95712 } };
        }
        if (path === sys32) return { label: 'C:\\Windows\\System32', items: [{ name: 'drivers', dir: true }, { name: 'config', dir: true }], totalFiles: 4821, totalBytes: 2147483648 };
        if (path === 'c:\\users' ) return { label: 'C:\\Users', items: [{ name: 'Public', dir: true }, { name: 'Technician', dir: true }, { name: 'username', dir: true }], totalFiles: 18244, totalBytes: 6012954214 };
        if (path === 'c:\\users\\username' || path === 'c:\\users\\technician' || path === 'c:\\users\\public') {
            /* THE BLOAT BELONGS TO ONE ACCOUNT, WHICH IS THE WHOLE DIAGNOSIS.
             * `bloated` was computed from _cachesCleared alone and applied to EVERY profile,
             * so `dir /s C:\Users\username` and `dir /s C:\Users\Technician` returned the
             * identical 214,877 files / 56.9 GB. The ticket's entire root-cause argument is
             * that the fault follows the USER — "when I logged in with a different account,
             * everything works" — and the walkthrough tells the student to compare profiles.
             * A student running exactly that comparison was told the clean control account
             * was just as bloated, which teaches the opposite of the lesson. Chris found it.
             * Only the affected profile is ever bloated, and only until it is cleared. */
            var who = path.split('\\').pop();
            var isAffected = who === OS3Config._AFFECTED_USER.toLowerCase();
            var bloated = isAffected && !engine.state._cachesCleared;
            var label = isAffected ? 'C:\\Users\\' + OS3Config._AFFECTED_USER : (who === 'public' ? 'C:\\Users\\Public' : 'C:\\Users\\Technician');
            return { label: label,
                     items: [{ name: 'AppData', dir: true }, { name: 'Desktop', dir: true }, { name: 'Documents', dir: true }],
                     totalFiles: bloated ? 214877 : 9122,
                     totalBytes: bloated ? 56908574720 : 4402341478 };
        }
        if (path === 'c:\\' || path === 'c:') return { label: 'C:\\', items: [{ name: 'Program Files', dir: true }, { name: 'Users', dir: true }, { name: 'Windows', dir: true }] };
        /* LOOKING MUST MATCH DOING.
         * The table stopped at the account root, so `dir C:\Users\username\AppData` reported
         * 0 files / 0 dirs and anything below it answered File Not Found — while `del` on
         * that exact path cheerfully removed 18,442 files. The ticket's entire subject is a
         * 53 GB bloated AppData, and a student who checked before deleting (which A+ trains
         * explicitly: verify before you act) was told the folder did not exist. Chris found
         * it by doing what a careful person does rather than what an attacker does.
         *
         * Modelled sparsely but honestly, and derived from the SAME _cachesCleared state that
         * `del` mutates, so the two commands cannot tell different stories. */
        var um = path.match(/^c:\\users\\([^\\]+)\\appdata(?:\\(.*))?$/);
        if (um) {
            var uname = um[1];
            var rest = um[2] || '';
            var known = OS3Config._ACCOUNTS.map(function (x) { return x.toLowerCase(); });
            if (known.indexOf(uname) === -1) return null;
            var real = OS3Config._ACCOUNTS.filter(function (x) { return x.toLowerCase() === uname; })[0];
            var base = 'C:\\Users\\' + real + '\\AppData';
            var dirty = (uname === OS3Config._AFFECTED_USER.toLowerCase()) && !engine.state._cachesCleared;
            var TF = 18442, TB = 51539607552;
            if (rest === '') return { label: base, items: [{ name: 'Local', dir: true }, { name: 'LocalLow', dir: true }, { name: 'Roaming', dir: true }], totalFiles: dirty ? TF : 0, totalBytes: dirty ? TB : 0 };
            if (rest === 'local') return { label: base + '\\Local', items: [{ name: 'Microsoft', dir: true }, { name: 'Temp', dir: true }], totalFiles: dirty ? TF : 0, totalBytes: dirty ? TB : 0 };
            if (rest === 'local\\temp') {
                if (!dirty) return { label: base + '\\Local\\Temp', items: [], totalFiles: 0, totalBytes: 0 };
                return { label: base + '\\Local\\Temp', items: [
                    { name: 'chrome_BITS_a41c', dir: true },
                    { name: 'wct9A2F.tmp', size: 2411724800 },
                    { name: 'ntuser.dat.LOG3', size: 1073741824 }
                ], totalFiles: TF, totalBytes: TB };
            }
            if (rest === 'local\\microsoft') return { label: base + '\\Local\\Microsoft', items: [{ name: 'Office', dir: true }, { name: 'Windows', dir: true }] };
            if (rest === 'local\\microsoft\\office') return { label: base + '\\Local\\Microsoft\\Office', items: [{ name: '16.0', dir: true }] };
            if (rest === 'local\\microsoft\\office\\16.0') return { label: base + '\\Local\\Microsoft\\Office\\16.0', items: [{ name: 'OfficeFileCache', dir: true }], totalFiles: dirty ? 3204 : 0, totalBytes: dirty ? 5368709120 : 0 };
            if (rest === 'locallow') return { label: base + '\\LocalLow', items: [], totalFiles: 0, totalBytes: 0 };
            if (rest === 'roaming') return { label: base + '\\Roaming', items: [], totalFiles: 0, totalBytes: 0 };
            return null;
        }
        if (path === 'c:\\windows') return { label: 'C:\\Windows', items: [{ name: 'System32', dir: true }, { name: 'Temp', dir: true }] };
        return null;
    },

    _pad(str, n) { str = String(str); return new Array(Math.max(0, n - str.length) + 1).join(' ') + str; },
    _commas(n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ','); },


    boot: { biosLines: ['UEFI BIOS v2.20', 'Memory: 16384 MB', 'Boot: NVMe0'], grubEntries: ['Windows 10 Pro'], loginUser: 'Technician' },
    desktop: { icons: [
        { id: 'cmd', label: 'Command\nPrompt', icon: '>_', app: 'terminal' },
        { id: 'hw_panel', label: 'App\nPanel', icon: 'APP', app: 'hw_panel' },
        { id: 'ticket', label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' },
        { id: 'hints', label: 'Hints', icon: '?', app: 'hints' },
        { id: 'reset', label: 'Reset\nLab', icon: 'RST', app: 'reset_lab' }
    ] },
    terminal: { user: 'Technician', hostname: 'HELPDESK01', startDir: 'C:\\Users\\Technician', promptStyle: 'windows', welcome: 'Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation. All rights reserved.\n' },
    filesystem: { '/': { type: 'dir', children: {} } },
    flags: [{ id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }],
    scoring: {
        minScore: 0, base: 0, maxScore: 600, hintPenalty: true, wrongFlagPenalty: 0, speedBonus: { threshold: 600000, points: 100 }, timeBonusThreshold: 1800 },
    hints: [
        { id: 'hint1', text: 'Check the diagnostic panel.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Each scenario has a unique root cause.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use the panel to inspect and fix.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Flag after fix.', cost: 50, penalty: -50 }
    ],
    lore: { intro: 'Application Crash scenarios test your ability to diagnose and resolve real-world A+ Core 2 problems.', scenario: 'Five distinct failure modes, each requiring different tools and approaches.', outro: 'Issue resolved. Solid troubleshooting identified and fixed the root cause.' },
    phases: [
        { id: 'investigate', name: 'Investigation', description: 'Read ticket and check status.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Identify root cause.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Apply the fix.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Confirm and get flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    commands: {
        whoami: function() { return 'HELPDESK01\\Technician'; },
        hostname: function() { return 'HELPDESK01'; },
        cls: function(a, t) { t.outputEl.innerHTML = ''; return ''; },
        systeminfo: function() { return '\nHost Name: HELPDESK01\nOS: Windows 10 Pro 10.0.19045\nTotal Physical Memory: 16,384 MB'; },

        /* Windows `cd`. Without an override, `cd` fell through to Terminal.js's POSIX
         * builtin, which walks this box's declared `filesystem` and answers
         * "cd: X: No such file or directory" — a bash error inside a Windows command
         * prompt. This box's `dir` advertises no enterable directory, so the honest
         * behaviour is cmd.exe's own: print the current directory for a bare `cd`, and
         * refuse anything else exactly as Windows does for a path that is not there.
         * MUST NOT return null: Terminal.js reads null as "fall through to the builtin",
         * which is the very fallthrough this exists to stop. */
        cd: function(args, term, engine) {
            var raw = (args || []).filter(function (a) { return a.indexOf('/') !== 0; })[0];
            var cwd = (term && term.cwd) || 'C:\\Users\\Technician';
            if (!raw) return cwd;
            if (raw === '.') return '';
            var target;
            if (raw === '\\') target = 'C:\\';
            else if (raw === '..') { var i = cwd.lastIndexOf('\\'); target = (i <= 2) ? 'C:\\' : cwd.slice(0, i); }
            else if (/^[a-z]:/i.test(raw)) target = raw;
            else target = cwd.replace(/\\+$/, '') + '\\' + raw;
            var e = OS3Config._dirEntry(engine, target);
            if (!e || e.file) return 'The system cannot find the path specified.';
            if (term) { term.cwd = e.label; if (typeof term._updatePrompt === 'function') term._updatePrompt(); }
            return '';
        },

        /* IT IGNORED ITS ARGUMENT. `dir` returned one canned string no matter what was
         * asked, so scenario 1's whole diagnostic — `dir C:\Windows\System32\vcruntime140.dll`,
         * i.e. "is the missing DLL actually missing?" — answered about C:\Users\Technician.
         * Not a missing feature: a confident wrong answer to the question the ticket is about. */
        dir: function(args, term, engine) {
            var a = args || [];
            var recurse = a.some(function (x) { return x.toLowerCase() === '/s'; });
            var path = a.filter(function (x) { return x.charAt(0) !== '/'; }).join(' ') || (term && term.cwd) || 'C:\\Users\\Technician';
            var e = OS3Config._dirEntry(engine, path);
            if (!e) {
                /* cmd.exe names the PARENT directory and then says File Not Found; it does
                 * not echo the missing file's own path as if it were a directory. */
                var i = String(path).lastIndexOf('\\');
                var parent = i > 2 ? String(path).slice(0, i) : String(path);
                return '\n Volume in drive C has no label.\n Volume Serial Number is 7A31-C0D4\n\n Directory of ' + parent + '\n\nFile Not Found';
            }
            var out = '\n Volume in drive C has no label.\n Volume Serial Number is 7A31-C0D4\n\n Directory of ' + e.label + '\n\n';
            if (e.file) {
                out += '09/28/2025  11:04 AM    ' + OS3Config._pad(OS3Config._commas(e.file.size), 14) + ' ' + e.file.name + '\n';
                out += '\n' + OS3Config._pad('1', 15) + ' File(s) ' + OS3Config._commas(e.file.size) + ' bytes';
                return out;
            }
            var dirs = 0;
            (e.items || []).forEach(function (it) { if (it.dir) { dirs++; out += '09/28/2025  11:04 AM    <DIR>          ' + it.name + '\n'; } });
            out += '\n' + OS3Config._pad('0', 15) + ' File(s)               0 bytes\n';
            if (recurse) {
                out += '\n     Total Files Listed:\n' + OS3Config._pad(String(e.totalFiles != null ? e.totalFiles : 0), 15)
                    + ' File(s) ' + OS3Config._commas(e.totalBytes || 0) + ' bytes\n';
            }
            out += OS3Config._pad(String(dirs), 15) + ' Dir(s)  ' + OS3Config._commas(94371840000) + ' bytes free';
            return out;
        },

        /* ── wmic: what runtimes are installed ─────────────────────────────────── */
        wmic: function(args, term, engine) {
            var gate = OS3Config._requireScenario(engine); if (gate) return gate;
            var joined = (args || []).join(' ').toLowerCase();
            if (!OS3Config._hasSwitch(args || [], 'product')) return '\nInvalid alias verb.';
            var dll = OS3Config._dllFor(engine);
            var rows = [
                'Microsoft Visual C++ 2012 Redistributable (x64)   11.0.61030',
                'Microsoft Visual C++ 2019 Redistributable (x86)   14.29.30153'
            ];
            /* The package that owns the missing DLL is absent from this list until it is
             * installed — that IS the diagnosis this command exists for. */
            if (!dll || engine.state._dllPresent) rows.push((dll ? dll.pkg : 'Microsoft Visual C++ 2015-2022 Redistributable (x64)') + '   14.38.33130');
            rows.sort();

            /* THE WHERE CLAUSE IS NOT DECORATION.
             * It was never read: `where "Name like 'TotallyFakeVendorXYZ%'"` returned the same
             * two Visual C++ rows as any other filter. A tool that ignores what it was asked
             * and answers confidently is the exact defect this whole box was rebuilt to remove
             * — and it was sitting in the one command scenarios 1 and 2 lean on for diagnosis.
             * Chris found it. Terminal._parseLine strips quotes, so the pattern is recovered
             * from the rejoined argv between `like` and `get`. */
            var like = (args || []).join(' ').match(/\blike\b\s+(.*?)(?:\s+get\b.*)?$/i);
            if (like) {
                var pat = like[1].trim().replace(/^["']|["']$/g, '');
                var rx = new RegExp('^' + pat.split('%').map(function (x) {
                    return x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                }).join('.*') + '$', 'i');
                rows = rows.filter(function (r) { return rx.test(r.split(/\s{2,}/)[0].trim()); });
            }
            if (!rows.length) return '\nNo Instance(s) Available.';
            return '\nName                                              Version\n' + rows.join('\n') + '\n';
        },

        /* ── reg: query .NET versions, and SET the compatibility layer ──────────── */
        reg: function(args, term, engine) {
            var gate = OS3Config._requireScenario(engine); if (gate) return gate;
            var a = args || [];
            var verb = (a[0] || '').toLowerCase();
            var joined = a.join(' ');
            var low = joined.toLowerCase();
            var regKey = OS3Config._leadingValue(a, 1).toLowerCase();
            if (verb === 'query') {
                var canon = OS3Config._canonKey(regKey);
                if (canon && (canon === OS3Config._KEY_NDP || canon.indexOf(OS3Config._KEY_NDP + '\\') === 0)) {
                    var V35 = '\nHKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\NET Framework Setup\\NDP\\v3.5\n    Version    REG_SZ    3.5.30729.4926\n';
                    var V4 = '\nHKEY_LOCAL_MACHINE\\SOFTWARE\\Microsoft\\NET Framework Setup\\NDP\\v4\\Full\n    Version    REG_SZ    4.8.04084\n';
                    /* A query NAMING v3.5 answers about v3.5 only. Returning the v4 subtree as
                     * well would tell a student checking whether 3.5 is present that something
                     * unrelated is — the same shape of confidently-wrong answer that `dir`
                     * was giving about the wrong directory. */
                    if (canon === OS3Config._KEY_NDP + '\\v3.5') return engine.state._netfx3Enabled ? V35 : '\nERROR: The system was unable to find the specified registry key or value.';
                    return V4 + (engine.state._netfx3Enabled ? V35 : '');
                }
                if (OS3Config._canonKey(regKey) === OS3Config._KEY_LAYERS) {
                    if (!engine.state._compatSet) return '\nERROR: The system was unable to find the specified registry key or value.';
                    /* Echoes the value actually written. Verifying your own work is exactly
                     * what the walkthrough models, and it has to show YOUR work. */
                    return '\nHKEY_CURRENT_USER\\Software\\Microsoft\\Windows NT\\CurrentVersion\\AppCompatFlags\\Layers\n    '
                        + (engine.state._compatExe || 'C:\\Legacy\\InventoryPro.exe') + '    REG_SZ    '
                        + (engine.state._compatValue || '~ WIN7 RUNASADMIN') + '\n';
                }
                return '\nERROR: The system was unable to find the specified registry key or value.';
            }
            if (verb === 'add') {
                /* HKLM vs HKCU IS NOT AN ATTACK, IT IS TUESDAY.
                 * A wrong hive was correctly refused credit and then answered with the same
                 * bare "The operation completed successfully." as any unrelated write — total
                 * silence about why nothing happened. AppCompatFlags\Layers genuinely exists
                 * under BOTH hives on a real machine (machine-wide and per-user), so a
                 * technician reaching for the wrong one is completely ordinary. The
                 * wrong-modifier case one branch down already explains itself in plain
                 * language; this now does too. Chris found it while looking for plausible
                 * mistakes rather than crafted payloads. */
                var canonAdd = OS3Config._canonKey(regKey);
                if (canonAdd) {
                    var tail = canonAdd.slice(canonAdd.indexOf('\\') + 1);
                    var wantTail = OS3Config._KEY_LAYERS.slice(OS3Config._KEY_LAYERS.indexOf('\\') + 1);
                    var hive = canonAdd.slice(0, canonAdd.indexOf('\\'));
                    if (tail === wantTail && hive !== 'hkcu') {
                        return '\nThe operation completed successfully.\n\n'
                            + 'Written under ' + hive.toUpperCase() + ', but the application still will not start.\n'
                            + 'Layers exists under both hives: HKLM sets a compatibility layer for every user on\n'
                            + 'the machine, HKCU for the signed-in one. Windows reads the per-user key for this,\n'
                            + 'so the value has to go under HKCU.';
                    }
                }
                if (canonAdd === OS3Config._KEY_LAYERS) {
                    /* THE VALUE HAS TO MEAN SOMETHING.
                     * This used to credit the fix on the key path alone, ignoring /v and /d
                     * entirely — Nancy completed the scenario with
                     * /v "C:\totally\wrong\NotepadPlusPlus.exe" /d "GARBAGE_NOT_A_REAL_COMPAT_STRING".
                     * Writing a nonsense string into Layers changes nothing on a real machine,
                     * so it must not resolve the ticket here either.
                     *
                     * Deliberately NOT pinned to one exact exe path: the ticket says "a legacy
                     * application from 2012" without naming the binary, so demanding a
                     * particular filename would be grading a guess. What IS required is the
                     * shape that works — a value naming an executable, and a compatibility
                     * layer Windows actually recognises. */
                    /* PARSE THE ARGV, NOT THE REJOINED STRING.
                     * Terminal._parseLine STRIPS QUOTES before a handler ever sees the line,
                     * so `/d "~ WIN7 RUNASADMIN"` arrives as three separate tokens and a
                     * regex like /\/d\s+("[^"]*"|\S+)/ captures just `~`. That is the same
                     * trap that made pr001's `wmic where Name="X"` unreachable for ANY input
                     * earlier today — second time in one session, so it is written down here.
                     * A switch value is therefore every token up to the next /switch. */
                    var switchVal = function (flag) {
                        var i = -1;
                        for (var k = 0; k < a.length; k++) { if (a[k].toLowerCase() === flag) { i = k; break; } }
                        if (i === -1) return '';
                        var parts = [];
                        for (var j = i + 1; j < a.length && a[j].charAt(0) !== '/'; j++) parts.push(a[j]);
                        return parts.join(' ').replace(/^"|"$/g, '');
                    };
                    var vVal = switchVal('/v');
                    var dVal = switchVal('/d');
                    if (!/\.exe$/i.test(vVal)) return '\nERROR: The value name must be the full path to an executable, e.g.\n       /v "C:\\Legacy\\App.exe"';
                    var dTokens = dVal.toUpperCase().split(/\s+/).filter(Boolean);
                    var hasOsLayer = dTokens.some(function (t) { return OS3Config._COMPAT_OS_LAYERS.indexOf(t) > -1; });
                    var hasModifier = dTokens.some(function (t) { return OS3Config._COMPAT_MODIFIERS.indexOf(t) > -1; });
                    if (!hasOsLayer && !hasModifier) {
                        return '\nERROR: The data is not a recognised compatibility layer.\n\n'
                            + 'Layers values are space-separated tokens, e.g. "~ WIN7 RUNASADMIN".\n'
                            + 'Valid modes include WIN95, WIN98, WINXPSP3, VISTASP2, WIN7, WIN8;\n'
                            + 'RUNASADMIN, HIGHDPIAWARE and 640X480 modify how the process runs.';
                    }
                    if (!hasOsLayer) {
                        /* A real value that does not address this fault. Windows accepts it, so
                         * the write succeeds — but the application still refuses to start,
                         * because none of these makes it believe it is on an older Windows. */
                        engine.save();
                        return '\nThe operation completed successfully.\n\n'
                            + 'Value written, but the application still will not start. ' + dTokens.join(' ') + ' changes how the\n'
                            + 'process runs, not which Windows version it thinks it is on. This app was built for\n'
                            + 'Windows 7 — it needs an OS compatibility layer such as WIN7.';
                    }
                    /* REMEMBER WHAT THEY ACTUALLY WROTE.
                     * The completion notice hardcoded "Windows 7" and `reg query` answered
                     * with a fixed C:\Legacy\InventoryPro.exe ... ~ WIN7 RUNASADMIN no matter
                     * what was supplied. A student who set WIN8 on their own binary, then did
                     * what the walkthrough models — reg add followed by reg query to confirm
                     * the write — saw a different app and a different layer than they had
                     * typed, and every reason to think they had got it wrong when they had
                     * not. The box confidently describing something other than what happened
                     * is the ORIGINAL defect of this box, in its success path this time. */
                    engine.state._compatSet = true;
                    engine.state._compatExe = vVal;
                    engine.state._compatValue = dTokens.join(' ');
                    engine.save();
                    return '\nThe operation completed successfully.\n' + OS3Config._checkComplete(engine);
                }
                return '\nThe operation completed successfully.';
            }
            return '\nERROR: Invalid syntax.\nType "REG /?" for usage.';
        },

        /* ── dism: enable the optional feature ──────────────────────────────────── */
        dism: function(args, term, engine) {
            var gate = OS3Config._requireScenario(engine); if (gate) return gate;
            var low = (args || []).join(' ').toLowerCase();
            var head = '\nDeployment Image Servicing and Management tool\nVersion: 10.0.19041.3636\n\n';
            if (!low) return head + 'DISM /Online /Enable-Feature /FeatureName:NetFx3 /All';
            if (!OS3Config._hasSwitch(args || [], '/online')) return head + 'Error: 87\n\nThe command was not recognized. Specify /Online.';
            /* THE BOX TOLD THE STUDENT TO RUN THIS AND THEN DID NOT HAVE IT.
             * The unknown-feature error recommended /Get-Features; running it answered
             * "Error: 87 Unrecognized option" — a dead end generated by the box's own hint.
             * That is the bar this whole rebuild is measured against, failed by one line of
             * help text. Implemented rather than removed, because the listing is a real
             * diagnostic: it shows NetFx3's state, which is the fact scenario 5 turns on. */
            if (OS3Config._hasSwitch(args || [], '/get-features')) {
                return head + 'Image Version: 10.0.19045.3803\n\n'
                    + 'Feature Name                                  State\n'
                    + '--------------------------------------------- -------------\n'
                    + 'NetFx3                                        ' + (engine.state._netfx3Enabled ? 'Enabled' : 'Disabled') + '\n'
                    + 'NetFx4-AdvSrvs                                Enabled\n'
                    + 'Printing-PrintToPDFServices-Features          Enabled\n'
                    + 'WindowsMediaPlayer                            Enabled\n\n'
                    + 'The operation completed successfully.\n';
            }
            /* The feature name is compared EXACTLY. `indexOf('netfx3')` credited
             * /featurename:netfx3legacyfoo, /featurename:notnetfx3 and /featurename:XNetFx3X
             * — features that do not exist. */
            var feature = OS3Config._switchColonValue(args || [], '/featurename');
            if (feature && feature.ambiguous) return head + 'Error: 87\n\n/FeatureName was specified more than once.';
            if (feature !== null && feature.toLowerCase() !== 'netfx3') {
                return head + 'Error: 0x800f080c\n\nFeature name ' + feature + ' is unknown.\n'
                    + 'A feature name must match exactly; run /Get-Features to list them.';
            }
            if (feature !== null && feature.toLowerCase() === 'netfx3') {
                /* THE VERB DECIDES, NOT THE FEATURE NAME.
                 * This branch used to fire on the substring 'netfx3' alone, so
                 * `dism /online /disable-feature /featurename:netfx3 /all` — the literal
                 * OPPOSITE of the documented fix — reported success and COMPLETED the
                 * scenario. Nancy reproduced it against a running box. Rewarding the exact
                 * wrong action is worse than rewarding a sloppy right one. */
                if (OS3Config._hasSwitch(args || [], '/disable-feature')) {
                    engine.state._netfx3Enabled = false; engine.save();
                    OS3Config._renderPanel(engine);
                    return head + 'Image Version: 10.0.19045.3803\n\n[==========================100.0%==========================]\nThe operation completed successfully.\n\n.NET Framework 3.5 is now DISABLED. The application still will not start.';
                }
                if (!OS3Config._hasSwitch(args || [], '/enable-feature')) return head + 'Error: 87\n\nAn option is not recognized. To turn a feature on, use /Enable-Feature.';
                if (engine.state._netfx3Enabled) return head + 'Image Version: 10.0.19045.3803\n\nThe feature is already enabled.\nThe operation completed successfully.\n';
                engine.state._netfx3Enabled = true; engine.save();
                return head + 'Image Version: 10.0.19045.3803\n\n[==========================100.0%==========================]\nThe operation completed successfully.\n' + OS3Config._checkComplete(engine);
            }
            if (OS3Config._hasSwitch(args || [], '/enable-feature')) return head + 'Error: 0x800f080c\n\nNo feature name was given. Use /FeatureName:<name>.';
            return head + 'Error: 87\n\nUnrecognized option.';
        },

        /* ── del: clear the corrupt profile caches (walkthrough scenario 4, Option A) ── */
        del: function(args, term, engine) {
            var gate = OS3Config._requireScenario(engine); if (gate) return gate;
            var t = (args || []).filter(function (x) { return x.charAt(0) !== '/'; }).join(' ').toLowerCase();
            if (!t) return '\nThe syntax of the command is incorrect.';
            /* Segments of the RESOLVED path. A substring test on the raw string would
             * accept a file merely named "appdata-temp" somewhere unrelated. */
            var segs = OS3Config._resolvePath(t).split('\\').filter(Boolean);
            var hasSeg = function (name) { return segs.some(function (x) { return x === name; }); };
            /* THE FOLDER HAS TO BE ONE `dir` AGREES EXISTS.
             * del validated the path's SHAPE and never asked _dirEntry whether it was real,
             * which is how it deleted 18,442 files from a folder dir reported as not found.
             * The deepest wildcard-free prefix is resolved instead — `...\Temp\*` asks about
             * `...\Temp`, and the walkthrough's `...\Office\16.0\*\Cache\*` asks about
             * `...\Office\16.0`. */
            var prefix = [];
            for (var pi = 0; pi < segs.length; pi++) { if (segs[pi].indexOf('*') > -1) break; prefix.push(segs[pi]); }
            if (hasSeg('appdata') && (hasSeg('temp') || hasSeg('cache')) && !OS3Config._dirEntry(engine, prefix.join('\\'))) {
                return '\nThe system cannot find the path specified.';
            }
            if (hasSeg('appdata') && (hasSeg('temp') || hasSeg('cache'))) {
                /* THE RIGHT ACTION ON THE WRONG ACCOUNT IS NOT THE FIX.
                 * This used to credit any user's AppData — Nancy completed the ticket with
                 * C:\Users\Public\AppData\Local\Temp\*. The whole diagnosis of this scenario is
                 * that the fault is confined to ONE profile ("when I logged in with a
                 * different user account, everything works"), so clearing somebody else's
                 * cache is precisely the mistake the scenario exists to catch. */
                var rawPath = (args || []).filter(function (x) { return x.charAt(0) !== '/'; }).join(' ');
                /* VALIDATE THE WHOLE CLAIM, NOT ONE FRAGMENT OF IT.
                 * This checked the account segment and nothing else, so
                 * `del D:\Users\username\AppData\Local\Temp\*`, the same on Z:, and a UNC
                 * path to a fileserver that does not exist all completed the ticket. This
                 * machine has one drive. Same shape as the two rounds before: an identifier
                 * verified in isolation while the surrounding claim went unexamined. */
                var norm = OS3Config._normPath(rawPath);   // resolved: . and .. collapsed
                if (norm.indexOf('c:\\users\\') !== 0) {
                    return '\nThe system cannot find the path specified.\n\n'
                        + 'User profiles on this machine live under C:\\Users. There is no other drive.';
                }
                var acct = OS3Config._accountInPath(rawPath);
                if (!acct || acct.toLowerCase() !== OS3Config._AFFECTED_USER.toLowerCase()) {
                    if (acct && OS3Config._ACCOUNTS.map(function (a) { return a.toLowerCase(); }).indexOf(acct.toLowerCase()) === -1) {
                        return '\nThe system cannot find the path specified.\n\nThere is no account named ' + acct + ' on this machine.';
                    }
                    return '\n    0 File(s) deleted.\n\nNothing was cleared for the affected account. The fault follows one profile —\n'
                        + 'check the ticket for whose it is.';
                }
                if (engine.state._cachesCleared) return '\n    0 File(s) deleted.\n';
                engine.state._cachesCleared = true; engine.save();
                return '\n    18,442 File(s) deleted.\n' + OS3Config._checkComplete(engine);
            }
            return '\nCould Not Find ' + (args || []).filter(function (x) { return x.charAt(0) !== '/'; }).join(' ');
        },

        /* ── findstr: the pipe half of scenario 5's diagnostic ──────────────────── */
        findstr: function(args, term) {
            var a = (args || []).filter(function (x) { return x.charAt(0) !== '/'; });
            if (!a.length) return 'FINDSTR: Bad command line';
            if (term && typeof term._pipedStdin === 'string') {
                var n = String(a[0]);
                return String(term._pipedStdin).split('\n').filter(function (l) { return l.indexOf(n) > -1; }).join('\n');
            }
            return 'FINDSTR: Cannot open ' + (a[1] || a[0]);
        },
        /* Linux builtins reach the student unless the box refuses them: Terminal.js provides
         * ls/cat/pwd/head/tail/man/uname/file/history, so in a cmd.exe prompt `ls` answered with
         * the GNU error "ls: cannot access '...'" — a Linux tool reporting failure inside a
         * Windows shell. cmd.exe has none of these, so its own not-recognized message is the
         * honest answer. NT1 already did this; 49 other Windows boxes did not. */
        ls: function() { return "'ls' is not recognized as an internal or external command,\noperable program or batch file.\n\nDid you mean: dir"; },
        cat: function() { return "'cat' is not recognized as an internal or external command,\noperable program or batch file.\n\nDid you mean: type"; },
        pwd: function() { return "'pwd' is not recognized as an internal or external command,\noperable program or batch file.\n\nDid you mean: cd"; },
        head: function() { return "'head' is not recognized as an internal or external command,\noperable program or batch file."; },
        tail: function() { return "'tail' is not recognized as an internal or external command,\noperable program or batch file."; },
        man: function() { return "'man' is not recognized as an internal or external command,\noperable program or batch file.\n\nDid you mean: help"; },
        uname: function() { return "'uname' is not recognized as an internal or external command,\noperable program or batch file.\n\nDid you mean: systeminfo"; },
        file: function() { return "'file' is not recognized as an internal or external command,\noperable program or batch file."; },
        history: function() { return "'history' is not recognized as an internal or external command,\noperable program or batch file.\n\nDid you mean: doskey /history"; },
        /* The remaining Terminal.js builtins this box would otherwise inherit.
         * Measured: `id` answered "uid=1000(Administrator) ... groups=...,27(sudo)" — a POSIX
         * identity string, sudo and all — in EVERY Windows-family box, and `find` returned GNU's
         * exact error format. An earlier pass fixed nine commands chosen by hand; the real
         * builtin surface is 23, which is why this second pass exists. Commands whose inherited
         * behaviour is already right for this shell (echo, help, exit, and clear/alias under
         * PowerShell) are deliberately left alone. */
        id: function() { return "'id' is not recognized as an internal or external command,\noperable program or batch file.\n\nDid you mean: whoami"; },
        export: function() { return "'export' is not recognized as an internal or external command,\noperable program or batch file.\n\nDid you mean: set"; },
        alias: function() { return "'alias' is not recognized as an internal or external command,\noperable program or batch file.\n\nDid you mean: doskey"; },
        clear: function() { return "'clear' is not recognized as an internal or external command,\noperable program or batch file.\n\nDid you mean: cls"; },
        /* TWO bugs, both measured, both identical to os002's. (1) piped stdin was ignored.
         * (2) the gate was `a.length < 2`, but real `FIND "string"` reading a pipe has ONE
         * argument — so the legitimate piped form was rejected before stdin was consulted.
         * Scenario 4's `dir /s C:\Users\username | find "Total"` hit exactly that. */
        find: function(args, term) {
            var a = (args || []).filter(function (x) { return x.charAt(0) !== '/'; });
            if (!a.length) return 'FIND: Parameter format not correct';
            if (term && typeof term._pipedStdin === 'string') {
                var n = String(a[0]);
                return String(term._pipedStdin).split('\n').filter(function (l) { return l.indexOf(n) > -1; }).join('\n');
            }
            if (a.length < 2) return 'FIND: Parameter format not correct';
            return 'File not found - ' + a[1];
        },
        ifconfig: function() { return '\'ifconfig\' is not recognized.'; },
        sudo: function() { return '\'sudo\' is not recognized.'; },
        help: function() { return '\nApplication troubleshooting tools in this image:\n\n  dir <path>                check whether a file or folder exists\n  wmic product get name     list installed runtimes and redistributables\n  reg query <key>           read the registry (.NET versions, compatibility layers)\n  reg add <key> /v .. /d .. write a registry value\n  dism /online /enable-feature /featurename:NetFx3   enable an optional Windows feature\n  del <path>                delete files\n  find / findstr            filter piped output\n  cd, whoami, hostname, systeminfo, cls\n\nThe App Panel on the desktop shows live component status and can apply the fix.'; }
    },

    onAppLaunch(iconDef, engine) {
        if (['hw_panel', 'services', 'disk_mgmt', 'devmgr', 'event_viewer'].includes(iconDef.app) && !engine.state._scenarioSelected) { engine.notify('Open the Help Desk Ticket first.', 'error'); return; }
        switch (iconDef.app) {
            case 'ticket': OS3Config._openTicket(iconDef, engine); break;
            case 'hw_panel': case 'services': case 'disk_mgmt': case 'devmgr': case 'event_viewer': OS3Config._openPanel(iconDef, engine); break;
            case 'reset_lab': engine.resetLab(); break;
        }
    },

    _openTicket(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        var c = document.createElement('div'); c.id = 'ticketContainer'; c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', c);
        OS3Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) OS3Config._renderTicket(engine, c); else OS3Config._renderPicker(engine, c);
    },

    _renderPicker(engine, container) {
        var pv = ['User — "New app crashes immediately on launch with "missing VCRUNTIM..."', 'User — "Program crashes with "MSVCP120.dll not found" error"', 'User — "Legacy application from 2012 will not run on Windows 10 — "n..."', 'User — "All my apps crash but they work fine when I log in as a diff..."', 'User — "Business app says ".NET Framework 3.5 required" but I though..."'];
        var html = '<div style="text-align:center; margin-bottom:20px;"><div style="color:#3b82f6; font-weight:bold; font-size:1.1rem;">HELP DESK QUEUE</div></div><div>';
        OS3Config._scenarios.forEach(function(s, i) { html += '<button class="os3-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer;"><span style="color:#3b82f6; font-weight:bold;">OS3-' + (3000 + i) + '</span><div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + pv[i] + '</div></button>'; });
        html += '</div><div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;"><button id="os3Rand" style="padding:10px 28px; background:#3b82f6; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-family:Consolas,monospace;">Random</button></div>';
        container.innerHTML = html;
        container.querySelectorAll('.os3-btn').forEach(function(b) { b.addEventListener('click', function() { OS3Config._applyScenario(engine, parseInt(this.getAttribute('data-idx'))); OS3Config._renderTicket(engine, container); }); });
        document.getElementById('os3Rand').addEventListener('click', function() { OS3Config._applyScenario(engine, Math.floor(Math.random() * 5)); OS3Config._renderTicket(engine, container); });
    },

    _renderTicket(engine, container) {
        var sc = OS3Config._getScenario(engine);
        var subs = ['User A — Department', 'User B — Department', 'User C — Department', 'User D — Department', 'User E — Department'];
        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;"><span style="color:#3b82f6; font-weight:bold;">TICKET #OS3-' + (3000 + engine.state._scenarioId) + '</span></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">SUBJECT</div><div style="font-weight:bold;">' + OS3Config._escHtml(sc.ticketSubject) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">DESCRIPTION</div><div style="background:rgba(255,255,255,0.04); padding:12px; border-radius:4px; line-height:1.6;">' + OS3Config._escHtml(sc.ticketDetail) + '</div></div>'
            + '<div style="margin-bottom:12px;"><div style="color:#888; font-size:0.7rem;">INTERNAL NOTES</div><div style="background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.2); padding:12px; border-radius:4px; color:#93c5fd;">' + OS3Config._escHtml(sc.ticketExtra) + '</div></div>'
            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px; color:#2ecc71; font-weight:bold;">ASSIGNED TO: YOU</div>';
    },

    /* The literal id "hwContainer" was assigned here while onAppLaunch routes FIVE apps to
     * this opener (hw_panel, services, disk_mgmt, devmgr, event_viewer). os003 ships a
     * desktop icon for only one of them, so the collision cannot fire today — but it is the
     * exact bug that rendered os002's panel blank with contentLengths [235, 0], and "not
     * currently reachable" is a weaker guarantee than "impossible". */
    _openPanel(iconDef, engine) {
        if (engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); OS3Config._renderPanel(engine); return; }
        var c = document.createElement('div'); c.setAttribute('data-os3-panel', iconDef.id); c.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Application Crash — Diagnostics', iconDef.icon, c); OS3Config._renderPanel(engine);
    },

    _renderPanel(engine) {
        var nodes = document.querySelectorAll('[data-os3-panel]');
        if (!nodes.length) return;
        var sc = OS3Config._getScenario(engine);
        if (!sc) { Array.prototype.forEach.call(nodes, function (n) { n.innerHTML = '<div style="color:#888;">No active scenario.</div>'; }); return; }
        var isIssue = engine.state[Object.keys(sc.stateOverrides)[0]];
        var dll = OS3Config._dllFor(engine);
        var panelOnly = (sc.id === 'missing_vcredist' || sc.id === 'dll_not_found');

        var html = '<div style="font-size:1rem; font-weight:bold; color:#3b82f6; margin-bottom:16px;">Application Crash — Diagnostics</div>';
        html += '<div style="margin-bottom:12px; padding:12px; background:' + (isIssue ? 'rgba(59,130,246,0.06)' : 'rgba(255,255,255,0.02)') + '; border:1px solid ' + (isIssue ? 'rgba(59,130,246,0.25)' : 'rgba(255,255,255,0.06)') + '; border-radius:4px;">'
            + '<div style="font-weight:bold; color:' + (isIssue ? '#3b82f6' : '#2ecc71') + ';">' + OS3Config._escHtml(sc.name) + '</div>';
        if (isIssue) {
            /* It announced the FIX under the word "ISSUE DETECTED". The scenario carries
             * `name` for the problem and `fixDescription` for the remedy; they are now
             * labelled as what they are. (Whether a panel should state the remedy at all is
             * task 391, which spans all eight boxes on this template.) */
            html += '<div style="color:#aaa; font-size:0.75rem; margin:4px 0 2px;">STATUS: unresolved</div>'
                + '<div style="color:#93c5fd; font-size:0.75rem; margin:0 0 8px;">RECOMMENDED FIX: ' + OS3Config._escHtml(sc.fixDescription) + '</div>'
                + '<button class="os3-panel-fix" style="padding:6px 16px; background:#3b82f6; color:#fff; border:none; border-radius:3px; cursor:pointer; font-size:0.75rem; font-weight:bold;">Apply Fix</button>';
            html += panelOnly
                ? '<div style="color:#666; font-size:0.7rem; margin-top:6px;">The redistributable installer is not present on this machine — the download is a step the technician performs. Apply Fix stands in for obtaining and running the official package.</div>'
                : '<div style="color:#666; font-size:0.7rem; margin-top:6px;">Or perform the repair yourself in Command Prompt — type <span style="color:#93c5fd;">help</span> for the tools.</div>';
        } else {
            html += '<div style="color:#aaa; font-size:0.75rem; margin:4px 0 8px;">Issue resolved. Application starts normally.</div>';
        }
        html += '</div>';

        /* A diagnostics panel that reflects nothing the student changed is decoration. */
        html += '<div style="padding:12px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.06); border-radius:4px; margin-bottom:12px;">'
            + '<div style="font-weight:bold; color:#2ecc71; margin-bottom:6px;">System Summary</div>';
        if (dll) html += '<div style="color:#aaa; font-size:0.75rem;">' + dll.name + ': <span style="color:' + (engine.state._dllPresent ? '#2ecc71' : '#e74c3c') + ';">' + (engine.state._dllPresent ? 'present' : 'NOT FOUND') + '</span></div>';
        html += '<div style="color:#aaa; font-size:0.75rem;">.NET 3.5 feature: <span style="color:' + (engine.state._netfx3Enabled ? '#2ecc71' : '#888') + ';">' + (engine.state._netfx3Enabled ? 'enabled' : 'not enabled') + '</span>'
            + ' &nbsp;|&nbsp; Compatibility layer: <span style="color:' + (engine.state._compatSet ? '#2ecc71' : '#888') + ';">' + OS3Config._escHtml(engine.state._compatSet ? (engine.state._compatValue || 'WIN7 RUNASADMIN') : 'none') + '</span>'
            + (engine.state._compatSet && engine.state._compatExe ? '<span style="color:#666;"> on ' + OS3Config._escHtml(engine.state._compatExe.split('\\').pop()) + '</span>' : '') + '</div>'
            + '<div style="color:#aaa; font-size:0.75rem;">Profile caches: ' + (engine.state._cachesCleared ? 'cleared' : 'populated') + '</div>'
            + '</div>';

        if (engine.state._flagRevealed) {
            html += '<div style="margin-top:16px; background:rgba(46,204,113,0.1); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;"><div style="color:#2ecc71; font-weight:bold;">Fix Confirmed</div><div class="os3-flag-slot" style="margin-top:4px;">Token: loading...</div></div>';
        }

        Array.prototype.forEach.call(nodes, function (node) {
            node.innerHTML = html;
            var fix = node.querySelector('.os3-panel-fix');
            if (fix) fix.addEventListener('click', function () {
                /* The panel is what "obtaining and installing the package" looks like here,
                 * so it is also what makes the DLL present. */
                if (panelOnly) { engine.state._dllPresent = true; engine.save(); }
                OS3Config._completeScenario(engine, 'Fix applied. Check the App Panel for the token.');
            });
        });

        if (engine.state._flagRevealed) {
            setTimeout(function () {
                BoxEngine.requestFlagText(sc.id).then(function (f) {
                    Array.prototype.forEach.call(document.querySelectorAll('.os3-flag-slot'), function (el) { el.textContent = 'Token: ' + (f || 'N/A'); });
                });
            }, 0);
        }
    },

    _confirmReset(engine) {
        var o = document.createElement('div'); o.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        o.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9;"><div style="color:#3b82f6; font-weight:bold; margin-bottom:12px;">Reset Lab?</div><div style="display:flex; gap:12px; justify-content:center;"><button id="os3RC" style="padding:8px 24px; background:#3b82f6; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold;">Reset</button><button id="os3CC" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer;">Cancel</button></div></div>';
        document.getElementById('arena').appendChild(o);
        document.getElementById('os3RC').addEventListener('click', function() { OS3Config._flagRestored = false; OS3Config.hints = OS3Config._defaultHints; engine.reset(); });
        document.getElementById('os3CC').addEventListener('click', function() { o.remove(); });
        o.addEventListener('click', function(e) { if (e.target === o) o.remove(); });
    }
};