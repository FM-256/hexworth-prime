/* ============================================================
   DISPATCH LAB — Box HW001: Dead Workstation
   CompTIA A+ Core 1 — Hardware Troubleshooting
   Config: hardware state, inspection panel, GUI tools, scenarios
   5 distinct scenarios with unique symptoms, POST codes, and flag locations
   ============================================================ */

var HW1Config = {

    // ==========================================================
    // BOX METADATA
    // ==========================================================

    title: 'Dead Workstation: It\'s Dead, Jim',
    subtitle: 'CompTIA A+ Core 1 — Hardware Troubleshooting',
    difficulty: 'Intermediate',
    accent: '#e67e22',
    storageKey: 'hexworth_lab_hw1',
    registryId: 'hw001-dead-workstation',
    trackerKey: 'lab_hw1',

    // ==========================================================
    // TUTORIAL MODE
    // ==========================================================

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Read the Help Desk Ticket',
                tip: 'Double-click the Help Desk Ticket icon to read the user complaint and understand the symptoms.',
                trigger: { event: 'window_open', match: { type: 'ticket' } }
            },
            {
                title: 'Press the Power Button',
                tip: 'Click the POWER button on the desktop to attempt boot. Watch what happens — the POST behavior is your first diagnostic clue.',
                trigger: { event: 'window_open', match: { type: 'boot_attempt' } }
            },
            {
                title: 'Open the Case and Inspect Hardware',
                tip: 'Double-click "Open Case" to inspect the PC internals. Click on components to Inspect, Reseat, or Remove them.',
                trigger: { event: 'window_open', match: { type: 'open_case' } }
            },
            {
                title: 'Consult POST Codes if needed',
                tip: 'Beep codes and POST LED codes narrow down which component failed. Open "POST Codes" for a reference table.',
                trigger: { event: 'window_open', match: { type: 'post_reference' } }
            },
            {
                title: 'Fix the hardware and reboot',
                tip: 'Use the Parts Bin to replace dead components, or Reseat to fix unseated hardware. Then press POWER again to verify.',
                trigger: { event: 'flag_correct', match: { flagId: 'fixed' } }
            }
        ]
    },

    // ==========================================================
    // CERT OBJECTIVES
    // ==========================================================

    certObjectives: {
        certPath: 'A+ Core 1 (220-1101)',
        mappings: [
            { flagId: 'fixed', objective: '3.1', description: 'Troubleshoot common hardware problems', skill: 'POST code interpretation, component diagnosis' },
            { flagId: 'fixed', objective: '3.4', description: 'Install and configure motherboard components', skill: 'RAM seating, PCIe GPU installation, CPU heatsink mounting' },
            { flagId: 'fixed', objective: '3.5', description: 'Install and configure power supplies', skill: 'PSU voltage testing, ATX replacement' }
        ]
    },

    // ==========================================================
    // SCENARIO DEFINITIONS
    // ==========================================================

    _scenarioFlags: {
        unseated_ram:  null,
        dead_gpu:      null,
        failed_psu:    null,
        cpu_overheat:  null,
        bad_sata:      null
    },

    _scenarios: [
        {
            id: 'unseated_ram',
            name: 'Unseated RAM',
            ticketSubject: 'PC powers on then beeps — no display',
            ticketDetail: 'My computer turned itself off during that big Windows update last night — I think we lost power briefly. Now when I press the power button the fans spin up and then it starts beeping at me three times, over and over. Nothing shows on my monitor. I checked the cable.',
            ticketExtra: 'IT Note: Building had a brief power fluctuation at 02:14 last night. UPS logs show three workstations lost power mid-session. This workstation is one of them.',
            bootBehavior: 'fans_beep_no_video',
            beepCode: '3 short beeps',
            postLed: 'D3',
            postLedDesc: 'Memory training failure',
            symptomText: 'Fans spin up to full speed. POST speaker emits 3 short beeps repeatedly. Monitor shows no signal. POST LED on motherboard displays code: D3.',
            fixSteps: ['reseat_ram0'],
            fixDescription: 'Reseat DIMM 1 — it was jarred loose during the power event',
            brokenComponents: { ram0: 'unseated' },
            flagLocation: 'Windows Event Log after successful boot'
        },
        {
            id: 'dead_gpu',
            name: 'Dead GPU',
            ticketSubject: 'Power button blinks and beeps — no picture',
            ticketDetail: 'My PC is making a weird beeping noise — one long beep then three short ones. The fans spin briefly then it just sits there. No picture at all. I tried plugging the monitor into the other port on the back of the computer but still nothing. This started happening after I moved desks yesterday.',
            ticketExtra: 'IT Note: Workstation was physically relocated to a different floor yesterday. Moving team did not document whether the case was opened during transit.',
            bootBehavior: 'fans_brief_beep_no_video',
            beepCode: '1 long + 3 short beeps',
            postLed: 'A6',
            postLedDesc: 'Video initialization failure',
            symptomText: 'Fans spin briefly then slow. POST speaker emits 1 long beep followed by 3 short beeps. No video signal. POST LED on motherboard displays code: A6. GPU fan remains stationary.',
            fixSteps: ['remove_gpu', 'install_gpu_replacement'],
            fixDescription: 'Replace the dead GPU from the Parts Bin',
            brokenComponents: { gpu: 'dead' },
            flagLocation: 'Device Manager GPU properties after successful boot'
        },
        {
            id: 'failed_psu',
            name: 'Failed PSU',
            ticketSubject: 'Computer completely dead — nothing happens',
            ticketDetail: 'My computer is completely dead. I press the power button and absolutely nothing happens. No fans, no beeps, no lights, nothing. It was fine when I left on Friday. I checked the power strip — everything else plugged into it works fine.',
            ticketExtra: 'IT Note: This workstation model (OptiPlex 7090) has had documented PSU failures in humid environments. Building HVAC was offline over the weekend.',
            bootBehavior: 'nothing',
            beepCode: 'None — no power',
            postLed: 'None — no power',
            postLedDesc: 'No power to system',
            symptomText: 'Pressing the power button produces no response whatsoever. No fans spin, no LEDs light, no beep codes. The workstation is completely unresponsive. Wall outlet confirmed working.',
            fixSteps: ['multimeter_psu', 'remove_psu', 'install_psu_replacement'],
            fixDescription: 'Test PSU with Multimeter to confirm dead, then replace from Parts Bin',
            brokenComponents: { psu: 'dead' },
            flagLocation: 'POST screen after successful boot'
        },
        {
            id: 'cpu_overheat',
            name: 'CPU Overheating',
            ticketSubject: 'Computer turns itself off within seconds of booting',
            ticketDetail: 'My computer boots up and shows the Dell logo for a few seconds, then powers itself right back off. I can turn it on again and the same thing happens. If I wait a few minutes it does the same thing. My old laptop used to do this when it overheated.',
            ticketExtra: 'IT Note: Workstation is 3 years old. Records show it has never had preventative maintenance. Thermal compound has not been replaced since manufacture.',
            bootBehavior: 'bios_splash_then_shutdown',
            beepCode: 'None during shutdown',
            postLed: '00 briefly (then loss of power)',
            postLedDesc: 'POST OK, then thermal shutdown',
            symptomText: 'System POSTs successfully and reaches BIOS splash screen. Hardware Monitor shows CPU temperature at 96C. Thermal protection triggers automatic shutdown approximately 5 seconds after power-on. Cycle repeats identically.',
            fixSteps: ['remove_heatsink', 'clean_paste', 'apply_new_paste', 'reseat_heatsink'],
            fixDescription: 'Remove CPU heatsink, clean dried thermal paste, apply new paste from Parts Bin, reseat heatsink',
            brokenComponents: { cpuHeatsink: 'tilted', thermalPaste: 'dried' },
            flagLocation: 'BIOS Hardware Monitor after successful boot'
        },
        {
            id: 'bad_sata',
            name: 'Bad SATA Cable',
            ticketSubject: 'No bootable device found error on startup',
            ticketDetail: 'My computer starts up, shows the Dell screen, but then instead of loading Windows I get an error that says "No bootable device found." I haven\'t installed anything new or changed anything. I need to get into my files — are they gone?',
            ticketExtra: 'IT Note: Drive health was checked 2 weeks ago — SMART data reported healthy. Unlikely to be drive failure. Drive is present and spinning according to audio cue reported by user.',
            bootBehavior: 'post_ok_no_boot_device',
            beepCode: '1 short beep (normal POST)',
            postLed: '00 (POST OK)',
            postLedDesc: 'POST OK — boot device not found',
            symptomText: 'System completes POST normally (1 short beep, LED 00). BIOS splash appears. Windows Boot Manager then displays: "No bootable device — insert boot disk and press any key." Drive sounds are audible.',
            fixSteps: ['remove_sata0', 'install_sata0_replacement'],
            fixDescription: 'Replace the damaged SATA cable on port 0 (boot drive) from the Parts Bin',
            brokenComponents: { sata0: 'frayed' },
            flagLocation: 'Command Prompt after successful boot'
        }
    ],

    // ==========================================================
    // HARDWARE COMPONENT STATE
    // ==========================================================

    _defaultComponents: {
        ram0: 'seated',        // seated, unseated, removed
        ram1: 'seated',        // seated, removed
        gpu: 'installed',      // installed, removed, dead
        psu: 'installed',      // installed, removed, dead
        cpuHeatsink: 'seated', // seated, removed, tilted
        thermalPaste: 'good',  // good, dried, cleaned, applied
        sata0: 'connected',    // connected, removed, frayed
        sata1: 'connected'     // connected, removed
    },

    // Parts installed from the bin
    _partBinUsed: {
        gpu: false,
        psu: false,
        thermalPaste: false,
        sata0: false
    },

    // ==========================================================
    // SCENARIO HINTS
    // ==========================================================

    _defaultHints: [
        { id: 'hint1', text: 'Start by pressing the POWER button. The boot behavior — what happens and what doesn\'t — is your first diagnostic data point.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Open the Case and click on components to Inspect them. Visual cues reveal hardware faults. POST codes tell you which subsystem failed.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use the POST Codes reference to decode beep codes. Different beep patterns point to different failed components.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'The fix may require removing a component first, then installing a replacement from the Parts Bin. Check that the slot is empty before installing.', cost: 50, penalty: -50 }
    ],

    _scenarioHints: {
        unseated_ram: [
            { id: 'hint1', text: 'Press POWER. Three short beeps is a classic BIOS memory error code. The POST LED code D3 confirms it: memory training failure.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the Case and inspect the RAM slots. A power interruption can jar components loose — look for anything that isn\'t fully seated.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Click DIMM 1 in the inspection panel and select Inspect — one of the sticks doesn\'t look quite right.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Click the unseated DIMM and select "Reseat." The module snaps into place. Press POWER to retry boot.', cost: 50, penalty: -50 }
        ],
        dead_gpu: [
            { id: 'hint1', text: 'Press POWER. One long beep followed by three short beeps is the AMI BIOS code for a video card failure. POST LED A6 confirms video initialization failure.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the Case. Inspect the GPU — look at the fan. A healthy GPU fan spins during POST. A dead GPU fan doesn\'t.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'The GPU is dead and cannot be reseated. You need to remove it, then install a replacement from the Parts Bin.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Click the GPU, select Remove. Then open Parts Bin, click the replacement GPU to install it. Press POWER to retry boot.', cost: 50, penalty: -50 }
        ],
        failed_psu: [
            { id: 'hint1', text: 'Absolutely nothing happens when you press POWER — no fans, no beeps, no lights. This means no power is reaching the system. Start at the power supply.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the Multimeter tool. Test the PSU voltage rails. A healthy PSU shows +12V, +5V, +3.3V. A dead one shows 0V on all rails.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'All voltage rails read 0.0V. The PSU is confirmed dead. Open the Case, click the PSU, and select Remove.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'With the PSU removed, open Parts Bin and install the 550W replacement. Press POWER — the system should boot.', cost: 50, penalty: -50 }
        ],
        cpu_overheat: [
            { id: 'hint1', text: 'Press POWER. The system reaches the BIOS splash then shuts down after 5 seconds. This is thermal protection — the CPU is overheating and the BIOS is cutting power to prevent damage.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the Case and inspect the CPU socket area. A properly seated heatsink sits flush and level. Dried or cracked thermal paste means heat isn\'t transferring.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Click the CPU heatsink and select Remove Heatsink. Inspect the thermal compound — it\'s dried out. Use the Parts Bin thermal paste to fix this.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Click the heatsink and select Clean Old Paste first, then apply new Arctic MX-4 from the Parts Bin, then reseat the heatsink. Press POWER to retry.', cost: 50, penalty: -50 }
        ],
        bad_sata: [
            { id: 'hint1', text: 'POST completes normally — the system isn\'t broken at the hardware level. The drive exists but can\'t be seen. Check the connection between the drive and motherboard.', cost: 0, penalty: 0 },
            { id: 'hint2', text: 'Open the Case. Inspect the SATA cables. SATA port 0 is the primary boot drive connection. Look for physical damage on the cables.', cost: 10, penalty: -10 },
            { id: 'hint3', text: 'Click on SATA Port 0 cable and Inspect it. The cable insulation is frayed near the motherboard connector — it\'s making intermittent contact at best.', cost: 25, penalty: -25 },
            { id: 'hint4', text: 'Click the SATA Port 0 cable and select Remove. Then open Parts Bin and install a replacement SATA cable on Port 0. Press POWER to retry boot.', cost: 50, penalty: -50 }
        ]
    },

    // ==========================================================
    // HELPERS
    // ==========================================================

    _ensureScenario(engine) {
        if (!engine.state._scenarioSelected) return false;
        if (engine.state._scenarioId != null && !HW1Config._flagRestored) {
            HW1Config._flagRestored = true;
            const scenario = HW1Config._scenarios[engine.state._scenarioId];
            if (scenario) {
                HW1Config.hints = HW1Config._scenarioHints[scenario.id] || HW1Config._defaultHints;
            }
        }
        return true;
    },

    _applyScenario(engine, idx) {
        engine.state._scenarioId = idx;
        engine.state._scenarioSelected = true;

        const scenario = HW1Config._scenarios[idx];

        // Reset component state, then apply broken components
        engine.state._components = JSON.parse(JSON.stringify(HW1Config._defaultComponents));
        const broken = scenario.brokenComponents || {};
        for (const key in broken) {
            engine.state._components[key] = broken[key];
        }

        engine.state._partBinUsed = JSON.parse(JSON.stringify(HW1Config._partBinUsed));
        engine.state._bootAttempted = false;
        engine.state._caseOpen = false;
        engine.state._labComplete = false;
        engine.state._flagRevealed = false;
        engine.state._multimeterTested = false;
        engine.state._heatsinkRemoved = false;
        engine.state._pasteCleaned = false;

        HW1Config._flagRestored = true;
        HW1Config.hints = HW1Config._scenarioHints[scenario.id] || HW1Config._defaultHints;

        engine.save();
    },

    _getScenario(engine) {
        if (engine.state._scenarioId == null) return null;
        return HW1Config._scenarios[engine.state._scenarioId];
    },

    _getComponents(engine) {
        return engine.state._components || HW1Config._defaultComponents;
    },

    _requireScenario(engine) {
        if (!engine.state._scenarioSelected) {
            return '\nERROR: No active ticket assigned.\nOpen the Help Desk Ticket first to receive your assignment.';
        }
        return null;
    },

    _requireBoot(engine) {
        if (!engine.state._labComplete) {
            return '\nSystem has not booted successfully. Fix the hardware fault first.';
        }
        return null;
    },

    // Check whether the hardware is in a fixed state for the current scenario
    _checkHardwareFix(engine) {
        const scenario = HW1Config._getScenario(engine);
        if (!scenario) return false;
        const c = HW1Config._getComponents(engine);

        switch (scenario.id) {
            case 'unseated_ram':
                return c.ram0 === 'seated';

            case 'dead_gpu':
                return c.gpu === 'installed' && engine.state._partBinUsed && engine.state._partBinUsed.gpu;

            case 'failed_psu':
                return c.psu === 'installed' && engine.state._partBinUsed && engine.state._partBinUsed.psu;

            case 'cpu_overheat':
                return c.cpuHeatsink === 'seated' && c.thermalPaste === 'applied';

            case 'bad_sata':
                return c.sata0 === 'connected' && engine.state._partBinUsed && engine.state._partBinUsed.sata0;

            default:
                return false;
        }
    },

    _attemptBoot(engine) {
        const scenario = HW1Config._getScenario(engine);
        if (!scenario) {
            engine.notify('Open the Help Desk Ticket first to receive your assignment.', 'error');
            return;
        }

        engine.state._bootAttempted = true;

        const fixed = HW1Config._checkHardwareFix(engine);

        if (fixed) {
            HW1Config._bootSuccess(engine);
        } else {
            HW1Config._bootFail(engine, scenario);
        }
    },

    _bootFail(engine, scenario) {
        const container = document.createElement('div');
        container.style.cssText = 'padding:24px; font-family:Consolas,monospace; font-size:0.8rem; background:#0a0a0a; color:#33ff33; height:100%; overflow-y:auto;';

        let html = '<div style="color:#e74c3c; font-weight:bold; font-size:0.9rem; margin-bottom:16px; border-bottom:1px solid #e74c3c; padding-bottom:8px;">BOOT SEQUENCE — FAILURE</div>';

        switch (scenario.bootBehavior) {
            case 'nothing':
                html += '<div style="color:#888; font-style:italic; text-align:center; margin:40px 0;">'
                    + '[Complete silence. No fans. No LEDs. No response.]'
                    + '</div>'
                    + '<div style="color:#e74c3c; margin-top:16px;">Power delivery failure confirmed. No voltage on ATX rails.</div>';
                break;

            case 'fans_beep_no_video':
                html += '<div>Applying power...</div>'
                    + '<div style="color:#2ecc71;">CPU fan: SPINNING</div>'
                    + '<div style="color:#2ecc71;">Case fan: SPINNING</div>'
                    + '<div style="color:#e74c3c;">GPU fan: NOT DETECTED</div>'
                    + '<div style="margin-top:12px; color:#f39c12;">POST speaker: *** beep *** beep *** beep ***  (3 short)</div>'
                    + '<div style="margin-top:12px;">Monitor: <span style="color:#e74c3c;">NO SIGNAL</span></div>'
                    + '<div style="margin-top:12px; color:#f39c12;">POST LED code: <strong style="color:#ffff00;">D3</strong> — ' + scenario.postLedDesc + '</div>';
                break;

            case 'fans_brief_beep_no_video':
                html += '<div>Applying power...</div>'
                    + '<div style="color:#2ecc71;">CPU fan: SPINNING</div>'
                    + '<div style="color:#2ecc71;">Case fan: SPINNING (brief)</div>'
                    + '<div style="color:#e74c3c;">GPU fan: NOT SPINNING</div>'
                    + '<div style="margin-top:12px; color:#f39c12;">POST speaker: *** beeeeeep *** beep *** beep *** beep ***  (1 long, 3 short)</div>'
                    + '<div style="margin-top:12px;">Monitor: <span style="color:#e74c3c;">NO SIGNAL</span></div>'
                    + '<div style="margin-top:12px; color:#f39c12;">POST LED code: <strong style="color:#ffff00;">A6</strong> — ' + scenario.postLedDesc + '</div>';
                break;

            case 'bios_splash_then_shutdown':
                html += '<div>Applying power...</div>'
                    + '<div style="color:#2ecc71;">All fans spinning...</div>'
                    + '<div style="color:#2ecc71; margin-top:8px;">POST: Memory OK, Storage OK, Video OK</div>'
                    + '<div style="color:#2ecc71;">POST speaker: * beep * (1 short — normal)</div>'
                    + '<div style="margin-top:12px; border:1px solid #666; padding:12px; background:#111;">'
                    + '<div style="color:#fff; text-align:center; font-size:1rem; font-weight:bold;">DELL</div>'
                    + '<div style="color:#888; text-align:center; font-size:0.75rem; margin-top:4px;">OptiPlex 7090 | BIOS Version A22</div>'
                    + '</div>'
                    + '<div style="color:#f39c12; margin-top:12px;">BIOS Hardware Monitor: CPU Temp = <strong style="color:#e74c3c;">96C</strong></div>'
                    + '<div style="color:#e74c3c; margin-top:8px; font-weight:bold;">WARNING: CPU temperature critical — thermal protection initiated</div>'
                    + '<div style="color:#e74c3c; margin-top:4px;">System shutting down to prevent damage...</div>'
                    + '<div style="color:#888; margin-top:12px; font-style:italic;">[Power cuts. Silence.]</div>';
                break;

            case 'post_ok_no_boot_device':
                html += '<div>Applying power...</div>'
                    + '<div style="color:#2ecc71;">All fans spinning...</div>'
                    + '<div style="color:#2ecc71;">POST: Memory OK, Video OK</div>'
                    + '<div style="color:#f39c12;">POST: Storage — checking...</div>'
                    + '<div style="color:#e74c3c;">POST: SATA Port 0 — NO DEVICE DETECTED</div>'
                    + '<div style="color:#2ecc71;">POST speaker: * beep * (1 short — POST OK)</div>'
                    + '<div style="margin-top:12px; border:1px solid #666; padding:12px; background:#0d0d0d; color:#ccc;">'
                    + '<div style="color:#fff; font-weight:bold;">Windows Boot Manager</div>'
                    + '<br>'
                    + '<div style="color:#e74c3c;">No bootable device -- insert boot disk and press any key</div>'
                    + '<br>'
                    + '<div style="color:#888; font-size:0.75rem;">UEFI: No boot media detected on SATA Port 0</div>'
                    + '</div>';
                break;
        }

        html += '<div style="margin-top:20px; border-top:1px solid rgba(255,255,255,0.1); padding-top:12px; color:#888; font-size:0.75rem;">'
            + scenario.symptomText
            + '</div>';

        container.innerHTML = html;

        const title = 'Boot Attempt — ' + scenario.beepCode;
        engine.openWindow('boot_attempt', title, 'BOOT', container);
        engine.notify('Boot failed. Analyze the symptoms and fix the hardware fault.', 'error');
    },

    _bootSuccess(engine) {
        const scenario = HW1Config._getScenario(engine);
        engine.state._labComplete = true;
        engine.state._flagRevealed = true;
        engine.save();

        const container = document.createElement('div');
        container.style.cssText = 'padding:24px; font-family:Consolas,monospace; font-size:0.8rem; background:#0a0a0a; color:#33ff33; height:100%; overflow-y:auto;';

        let html = '<div style="color:#2ecc71; font-weight:bold; font-size:0.9rem; margin-bottom:16px; border-bottom:1px solid #2ecc71; padding-bottom:8px;">BOOT SEQUENCE — SUCCESS</div>';
        html += '<div>Applying power...</div>'
            + '<div style="color:#2ecc71;">All fans spinning...</div>'
            + '<div style="color:#2ecc71;">POST: Memory OK</div>'
            + '<div style="color:#2ecc71;">POST: Storage OK — SATA Port 0: SAMSUNG 860 EVO 500GB</div>'
            + '<div style="color:#2ecc71;">POST: Video OK</div>'
            + '<div style="color:#2ecc71;">POST speaker: * beep * (1 short — POST OK)</div>'
            + '<div style="margin-top:12px; border:1px solid #2ecc71; padding:12px; background:#0d1a0d;">'
            + '<div style="color:#fff; text-align:center; font-size:1rem; font-weight:bold;">DELL</div>'
            + '<div style="color:#888; text-align:center; font-size:0.75rem; margin-top:4px;">OptiPlex 7090 | BIOS Version A22</div>'
            + '</div>'
            + '<div style="color:#2ecc71; margin-top:12px;">Loading Windows Boot Manager...</div>'
            + '<div style="color:#2ecc71; margin-top:4px;">Starting Windows 10 Pro...</div>'
            + '<div style="margin-top:16px; border:1px solid #2ecc71; padding:16px; background:#0a1a0a; border-radius:4px;">'
            + '<div style="color:#2ecc71; font-weight:bold; margin-bottom:8px;">HARDWARE FAULT RESOLVED</div>'
            + '<div style="color:#c8e6c9;">Fix applied: ' + HW1Config._escHtml(scenario.fixDescription) + '</div>'
            + '</div>';

        // Scenario-specific flag reveal location
        switch (scenario.id) {
            case 'failed_psu':
                html += '<div style="margin-top:16px; border:1px solid #2ecc71; padding:12px; background:rgba(46,204,113,0.05); border-radius:4px;">'
                    + '<div style="color:#f39c12; font-weight:bold; margin-bottom:6px;">POST Screen — System Summary:</div>'
                    + '<div style="color:#ccc;">PSU: 550W 80+ Bronze — Rails: +12V OK, +5V OK, +3.3V OK</div>'
                    + '<div style="color:#ccc;">Recovery token logged: <strong id="hw1-flag-psu" style="color:#2ecc71;">loading...</strong></div>'
                    + '</div>';
                break;

            case 'bad_sata':
                html += '<div style="margin-top:16px; color:#888; font-size:0.75rem;">Open Command Prompt after boot to retrieve the flag.</div>';
                break;

            default:
                html += '<div style="margin-top:16px; color:#888; font-size:0.75rem;">The flag has been logged to the system. Check the relevant tool (BIOS, Device Manager, or Event Log) to retrieve it.</div>';
                break;
        }

        container.innerHTML = html;
        engine.openWindow('boot_success', 'Boot Sequence — SUCCESS', 'BOOT', container);

        // Async flag delivery for PSU scenario
        if (scenario.id === 'failed_psu') {
            BoxEngine.requestFlagText('failed_psu').then(function(flagText) {
                var el = document.getElementById('hw1-flag-psu');
                if (el) el.textContent = flagText || 'Flag unavailable';
            });
            setTimeout(() => {
                engine.notify('Hardware repaired! Flag logged to POST screen. Submit it to complete the lab.', 'success');
            }, 500);
        } else {
            setTimeout(() => {
                engine.notify('Hardware repaired! System booted successfully. Find and submit the flag.', 'success');
            }, 500);
        }
    },

    // ==========================================================
    // BOOT SEQUENCE (Windows)
    // ==========================================================

    boot: {
        biosLines: [
            'Dell Inc. BIOS Version A22',
            'Initializing hardware...',
            'CPU: Intel Core i7-11700 @ 2.50GHz',
            'Memory Test: 16384 MB OK',
            'Detecting storage... SATA Port 0: SAMSUNG 860 EVO 500GB',
            'Video: NVIDIA GeForce GTX 1650 detected',
            'Loading Windows Boot Manager...'
        ],
        grubEntries: [
            'Windows 10 Pro',
            'Windows Recovery Environment'
        ],
        loginUser: 'Technician'
    },

    // ==========================================================
    // DESKTOP ICONS
    // ==========================================================

    desktop: {
        icons: [
            { id: 'power',        label: 'POWER',          icon: 'PWR', app: 'power_button' },
            { id: 'open-case',    label: 'Open Case',      icon: 'CASE', app: 'open_case' },
            { id: 'parts-bin',    label: 'Parts Bin',      icon: 'PART', app: 'parts_bin' },
            { id: 'multimeter',   label: 'Multimeter',     icon: 'VOLT', app: 'multimeter' },
            { id: 'post-ref',     label: 'POST Codes',     icon: 'POST', app: 'post_reference' },
            { id: 'bios',         label: 'BIOS Setup',     icon: 'BIOS', app: 'bios' },
            { id: 'cmd',          label: 'Command\nPrompt', icon: '>_',  app: 'terminal' },
            { id: 'ticket',       label: 'Help Desk\nTicket', icon: 'HD', app: 'ticket' },
            { id: 'hints',        label: 'Hints',          icon: '?',   app: 'hints' },
            { id: 'reset',        label: 'Reset\nLab',     icon: 'RST', app: 'reset_lab' }
        ]
    },

    // ==========================================================
    // TERMINAL CONFIG
    // ==========================================================

    terminal: {
        user: 'Technician',
        hostname: 'WORKSTATION01',
        startDir: 'C:\\Users\\Technician',
        promptStyle: 'windows',
        welcome: 'Microsoft Windows [Version 10.0.19045.3803]\n(c) Microsoft Corporation. All rights reserved.\n\nNote: System just booted after hardware repair. Limited diagnostics available.\n'
    },

    // ==========================================================
    // FILESYSTEM (minimal)
    // ==========================================================

    filesystem: {
        '/': {
            type: 'dir',
            children: {}
        }
    },

    // ==========================================================
    // FLAGS
    // ==========================================================

    flags: [
        { id: 'fixed', value: '{{FLAG:scenarioId}}', points: 500 }
    ],

    // ==========================================================
    // SCORING
    // ==========================================================

    scoring: {
        base: 0,
        maxScore: 600,
        hintPenalty: true,
        wrongFlagPenalty: 0,
        speedBonus: { threshold: 600000, points: 100 },
        timeBonusThreshold: 1800
    },

    // ==========================================================
    // HINTS (replaced per-scenario by _applyScenario)
    // ==========================================================

    hints: [
        { id: 'hint1', text: 'Press the POWER button first. The boot behavior is your first clue.', cost: 0, penalty: 0 },
        { id: 'hint2', text: 'Open the Case and inspect components. Visual faults are visible if you look closely.', cost: 10, penalty: -10 },
        { id: 'hint3', text: 'Use the POST Codes reference to decode beep codes and LED codes.', cost: 25, penalty: -25 },
        { id: 'hint4', text: 'Some faults require removing a component before installing a replacement from the Parts Bin.', cost: 50, penalty: -50 }
    ],

    // ==========================================================
    // LORE
    // ==========================================================

    lore: {
        intro: 'A critical workstation has been flagged dead. The user has a client demo in hours, and all their work is local. Your job: diagnose the hardware fault, fix it, and get the machine running.',
        scenario: 'Every workstation failure has a root cause. Use the inspection panel to examine components, POST codes to narrow down the subsystem, and the Parts Bin to replace what cannot be saved.',
        outro: 'Hardware fault resolved. The workstation is operational. The user can access their files, the demo will proceed, and Marcus Chen owes you a coffee.'
    },

    // ==========================================================
    // PHASES
    // ==========================================================

    phases: [
        { id: 'triage', name: 'Triage', description: 'Read the ticket and attempt a boot to observe symptoms.', requiredFlags: [], unlocks: ['diagnose'], locked: false },
        { id: 'diagnose', name: 'Diagnosis', description: 'Open the case and inspect components. Decode POST codes.', requiredFlags: [], unlocks: ['repair'], locked: true },
        { id: 'repair', name: 'Repair', description: 'Apply the fix — reseat, replace, or restore the faulty component.', requiredFlags: [], unlocks: ['verify'], locked: true },
        { id: 'verify', name: 'Verification', description: 'Retry boot, confirm system is operational, retrieve flag.', requiredFlags: ['fixed'], unlocks: [], locked: true }
    ],

    // ==========================================================
    // CUSTOM COMMANDS
    // ==========================================================

    commands: {

        systeminfo: function(args, term, engine) {
            const boot = HW1Config._requireBoot(engine);
            if (boot) return boot;
            const scenario = HW1Config._getScenario(engine);
            return '\nHost Name:                 WORKSTATION01'
                + '\nOS Name:                   Microsoft Windows 10 Pro'
                + '\nOS Version:                10.0.19045 N/A Build 19045'
                + '\nSystem Manufacturer:       Dell Inc.'
                + '\nSystem Model:              OptiPlex 7090'
                + '\nSystem Type:               x64-based PC'
                + '\nProcessor(s):              Intel(R) Core(TM) i7-11700 @ 2.50GHz'
                + '\nTotal Physical Memory:     16,384 MB'
                + '\nAvailable Physical Memory: 11,240 MB'
                + '\nBIOS Version:              Dell A22'
                + '\nHardware repair:           ' + (scenario ? HW1Config._escHtml(scenario.fixDescription) : 'N/A');
        },

        'wmic': function(args, term, engine) {
            const boot = HW1Config._requireBoot(engine);
            if (boot) return boot;
            const line = args.join(' ').toLowerCase();

            if (line.includes('memorychip')) {
                return '\nNode - WORKSTATION01'
                    + '\n\nBankLabel  Capacity    DeviceLocator  Speed'
                    + '\nCHAN-A DIMM0  8589934592  DIMM1          3200'
                    + '\nCHAN-A DIMM1  8589934592  DIMM2          3200';
            }
            if (line.includes('videocontroller') || line.includes('video')) {
                const scenario = HW1Config._getScenario(engine);
                const gpuName = (scenario && scenario.id === 'dead_gpu')
                    ? 'NVIDIA GeForce GTX 1650 (Replacement)'
                    : 'NVIDIA GeForce GTX 1650';
                return '\nNode - WORKSTATION01\n\nName\n' + gpuName;
            }
            if (line.includes('diskdrive') || line.includes('disk')) {
                return '\nNode - WORKSTATION01'
                    + '\n\nModel                      Size'
                    + '\nSAMSUNG 860 EVO 500GB      500107862016';
            }
            if (line.includes('cpu') || line.includes('processor')) {
                return '\nNode - WORKSTATION01'
                    + '\n\nName                                          MaxClockSpeed'
                    + '\nIntel(R) Core(TM) i7-11700 @ 2.50GHz         4900';
            }
            return '\nwmic usage: wmic memorychip list brief\n            wmic path win32_videocontroller get name\n            wmic diskdrive list brief\n            wmic cpu get name,maxclockspeed';
        },

        help: function() {
            return '\nAvailable commands (hardware diagnostic context):'
                + '\n  systeminfo           — Display system hardware summary'
                + '\n  wmic memorychip list brief  — List installed RAM modules'
                + '\n  wmic path win32_videocontroller get name  — GPU information'
                + '\n  wmic diskdrive list brief    — Storage device list'
                + '\n  wmic cpu get name,maxclockspeed  — CPU information'
                + '\n  cls                  — Clear screen'
                + '\n  exit                 — Close terminal'
                + '\n'
                + '\nNote: Most hardware diagnostics are done through the GUI tools.'
                + '\n      Open the Case, Multimeter, BIOS, or POST Codes panels.';
        },

        cls: function(args, term) { term.outputEl.innerHTML = ''; return null; },

        dir: function() {
            return ' Volume in drive C has no label.\n Volume Serial Number is A4B1-2C3D\n\n Directory of C:\\Users\\Technician\n\n03/13/2026  09:15 AM    <DIR>          .\n03/13/2026  09:15 AM    <DIR>          ..\n03/13/2026  09:15 AM    <DIR>          Desktop\n03/13/2026  09:15 AM    <DIR>          Documents\n               0 File(s)              0 bytes\n               4 Dir(s)  421,477,052,416 bytes free';
        },

        hostname: function() { return 'WORKSTATION01'; },

        whoami: function() { return 'WORKSTATION01\\Technician'; },

        // Block Linux commands politely
        ifconfig: function() { return '\'ifconfig\' is not recognized. Did you mean: ipconfig'; },
        grep: function() { return '\'grep\' is not recognized as an internal or external command.'; },
        sudo: function() { return '\'sudo\' is not recognized as an internal or external command.'; },
        ls: function() { return '\'ls\' is not recognized. Did you mean: dir'; },
        cat: function() { return '\'cat\' is not recognized. Did you mean: type'; },
        nano: function() { return '\'nano\' is not recognized as an internal or external command.'; },
        vim: function() { return '\'vim\' is not recognized as an internal or external command.'; }
    },

    // ==========================================================
    // CUSTOM WINDOW HANDLERS
    // ==========================================================

    onAppLaunch(iconDef, engine) {
        const requireTicket = ['open_case', 'parts_bin', 'multimeter', 'bios', 'post_reference'];
        if (requireTicket.includes(iconDef.app) && !engine.state._scenarioSelected) {
            engine.notify('Open the Help Desk Ticket first to receive your assignment.', 'error');
            return;
        }

        switch (iconDef.app) {
            case 'ticket':        HW1Config._openTicket(iconDef, engine); break;
            case 'power_button':  HW1Config._doPowerButton(iconDef, engine); break;
            case 'open_case':     HW1Config._openCase(iconDef, engine); break;
            case 'parts_bin':     HW1Config._openPartsBin(iconDef, engine); break;
            case 'multimeter':    HW1Config._openMultimeter(iconDef, engine); break;
            case 'post_reference':HW1Config._openPostReference(iconDef, engine); break;
            case 'bios':          HW1Config._openBios(iconDef, engine); break;
            case 'reset_lab':     HW1Config._confirmReset(engine); break;
        }
    },

    // ==========================================================
    // POWER BUTTON
    // ==========================================================

    _doPowerButton(iconDef, engine) {
        if (!engine.state._scenarioSelected) {
            engine.notify('Open the Help Desk Ticket first to receive your assignment.', 'error');
            return;
        }
        HW1Config._attemptBoot(engine);
    },

    // ==========================================================
    // HELP DESK TICKET
    // ==========================================================

    _openTicket(iconDef, engine) {
        if (engine._windows && engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        const container = document.createElement('div');
        container.id = 'ticketContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#1a1a2e; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Help Desk Ticket', 'HD', container);
        HW1Config._ensureScenario(engine);
        if (engine.state._scenarioSelected) {
            HW1Config._renderTicket(engine, container);
        } else {
            HW1Config._renderScenarioPicker(engine, container);
        }
    },

    _renderScenarioPicker(engine, container) {
        const ticketPreviews = [
            'Marcus Chen — "PC beeps and shows nothing"',
            'Jess Hartley — "Beeping, no picture after office move"',
            'Ray Okonkwo — "Won\'t turn on at all since the weekend"',
            'Dana Wu — "Shuts off 5 seconds after turning on"',
            'Tariq Malik — "No bootable device error on startup"'
        ];

        let html = '<div style="text-align:center; margin-bottom:20px;">'
            + '<div style="color:#e67e22; font-weight:bold; font-size:1.1rem; margin-bottom:8px;">DISPATCH — HELP DESK QUEUE</div>'
            + '<div style="color:#888; font-size:0.75rem;">Select a ticket to begin your assignment, or let the system assign one randomly.</div>'
            + '</div><div style="margin-bottom:16px;">';

        HW1Config._scenarios.forEach(function(s, i) {
            html += '<button class="hw1-scenario-btn" data-idx="' + i + '" style="display:block; width:100%; text-align:left; padding:12px 16px; margin-bottom:8px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:4px; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem; cursor:pointer; transition:border-color 0.2s;">'
                + '<div style="display:flex; justify-content:space-between; align-items:center;">'
                + '<span style="color:#e67e22; font-weight:bold;">HW-' + (1000 + i) + '</span>'
                + '<span style="background:#e74c3c; color:#fff; padding:1px 8px; border-radius:3px; font-size:0.65rem;">CRITICAL</span>'
                + '</div>'
                + '<div style="color:#aaa; font-size:0.7rem; margin-top:4px;">' + ticketPreviews[i] + '</div>'
                + '</button>';
        });
        html += '</div>';

        html += '<div style="text-align:center; border-top:1px solid rgba(255,255,255,0.1); padding-top:16px;">'
            + '<button id="hw1RandomBtn" style="padding:10px 28px; background:#e67e22; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.85rem; font-family:Consolas,monospace;">Random Assignment</button>'
            + '</div>';

        container.innerHTML = html;

        container.querySelectorAll('.hw1-scenario-btn').forEach(function(btn) {
            btn.addEventListener('mouseenter', function() { this.style.borderColor = '#e67e22'; });
            btn.addEventListener('mouseleave', function() { this.style.borderColor = 'rgba(255,255,255,0.12)'; });
            btn.addEventListener('click', function() {
                HW1Config._applyScenario(engine, parseInt(this.getAttribute('data-idx')));
                HW1Config._renderTicket(engine, container);
            });
        });

        document.getElementById('hw1RandomBtn').addEventListener('click', function() {
            HW1Config._applyScenario(engine, Math.floor(Math.random() * HW1Config._scenarios.length));
            HW1Config._renderTicket(engine, container);
        });
    },

    _renderTicket(engine, container) {
        const scenario = HW1Config._getScenario(engine);
        const submitters = [
            'Marcus Chen — VP of Sales',
            'Jess Hartley — Design Department',
            'Ray Okonkwo — IT Operations',
            'Dana Wu — Finance Department',
            'Tariq Malik — Engineering'
        ];
        const submitter = submitters[engine.state._scenarioId] || 'Employee';

        container.innerHTML = '<div style="border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:12px; margin-bottom:16px;">'
            + '<div style="display:flex; justify-content:space-between; align-items:center;">'
            + '<span style="color:#e67e22; font-weight:bold; font-size:1rem;">DISPATCH TICKET #HW-' + (1000 + engine.state._scenarioId) + '</span>'
            + '<span style="background:#e74c3c; color:#fff; padding:2px 10px; border-radius:3px; font-size:0.7rem; font-weight:bold;">PRIORITY: CRITICAL</span>'
            + '</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBMITTED BY</div>'
            + '<div>' + submitter + '</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DATE</div>'
            + '<div>March 13, 2026 — 8:03 AM</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">SUBJECT</div>'
            + '<div style="font-weight:bold;">' + HW1Config._escHtml(scenario.ticketSubject) + '</div></div>'

            + '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">DESCRIPTION</div>'
            + '<div style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:12px; line-height:1.6;">'
            + HW1Config._escHtml(scenario.ticketDetail)
            + '</div></div>'

            + (scenario.ticketExtra ? '<div style="margin-bottom:16px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">INTERNAL NOTES</div>'
            + '<div style="background:rgba(255,165,0,0.08); border:1px solid rgba(255,165,0,0.2); border-radius:4px; padding:12px; line-height:1.6; color:#ffcc80;">'
            + HW1Config._escHtml(scenario.ticketExtra) + '</div></div>' : '')

            + '<div style="background:rgba(230,126,34,0.08); border:1px solid rgba(230,126,34,0.25); border-radius:4px; padding:12px; margin-bottom:16px;">'
            + '<div style="color:#e67e22; font-weight:bold; font-size:0.75rem; margin-bottom:4px;">CERT OBJECTIVES</div>'
            + '<div style="color:#aaa; font-size:0.72rem;">A+ Core 1: 3.1 (Hardware troubleshooting) | 3.4 (Motherboard components) | 3.5 (Power supplies)</div>'
            + '</div>'

            + '<div style="border-top:1px solid rgba(255,255,255,0.1); padding-top:12px;">'
            + '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">ASSIGNED TO</div>'
            + '<div style="color:#2ecc71; font-weight:bold;">YOU — Desktop Support Technician</div></div>';
    },

    // ==========================================================
    // HARDWARE INSPECTION PANEL (Open Case)
    // ==========================================================

    _openCase(iconDef, engine) {
        if (engine._windows && engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        const container = document.createElement('div');
        container.id = 'caseContainer';
        container.style.cssText = 'padding:16px; overflow-y:auto; height:100%; background:#111827; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Hardware Inspection Panel', 'CASE', container);
        engine.state._caseOpen = true;
        HW1Config._renderCasePanel(engine, container);
    },

    _renderCasePanel(engine, container) {
        const c = HW1Config._getComponents(engine);
        const scenario = HW1Config._getScenario(engine);

        // Color each component based on state
        const ramColor0 = c.ram0 === 'unseated' ? '#e74c3c' : c.ram0 === 'removed' ? '#666' : '#2ecc71';
        const ramColor1 = c.ram1 === 'removed' ? '#666' : '#2ecc71';
        const gpuColor  = c.gpu === 'dead' ? '#e74c3c' : c.gpu === 'removed' ? '#666' : '#2ecc71';
        const gpuFan    = c.gpu === 'dead' ? '#e74c3c' : c.gpu === 'removed' ? '#555' : '#2ecc71';
        const psuColor  = c.psu === 'dead' ? '#e74c3c' : c.psu === 'removed' ? '#666' : '#2ecc71';
        const cpuColor  = c.cpuHeatsink === 'tilted' ? '#f39c12' : c.cpuHeatsink === 'removed' ? '#888' : '#2ecc71';
        const sata0Color = c.sata0 === 'frayed' ? '#e74c3c' : c.sata0 === 'removed' ? '#666' : '#2ecc71';
        const sata1Color = c.sata1 === 'removed' ? '#666' : '#2ecc71';

        // State labels for status bar
        const stateLabel = function(state) {
            switch(state) {
                case 'seated':    return 'SEATED';
                case 'unseated':  return 'UNSEATED';
                case 'removed':   return 'REMOVED';
                case 'installed': return 'INSTALLED';
                case 'dead':      return 'DEAD';
                case 'tilted':    return 'TILTED';
                case 'good':      return 'OK';
                case 'dried':     return 'DRIED';
                case 'cleaned':   return 'CLEANED';
                case 'applied':   return 'APPLIED';
                case 'connected': return 'CONNECTED';
                case 'frayed':    return 'FRAYED';
                default:          return state.toUpperCase();
            }
        };

        let html = '<div style="margin-bottom:12px; display:flex; justify-content:space-between; align-items:center;">'
            + '<div style="color:#e67e22; font-weight:bold;">Mid-Tower PC — Interior View</div>'
            + '<div style="font-size:0.7rem; color:#888;">Click any component to interact</div>'
            + '</div>';

        // SVG diagram of PC interior
        html += '<div style="background:#0a0e14; border:2px solid #2a3a4a; border-radius:4px; padding:16px; margin-bottom:16px; position:relative;">';
        html += '<svg width="100%" viewBox="0 0 560 380" xmlns="http://www.w3.org/2000/svg" style="max-width:560px; display:block; margin:0 auto;">';

        // Case outline
        html += '<rect x="10" y="10" width="540" height="360" fill="#0d1520" stroke="#2a3a4a" stroke-width="2" rx="4"/>';

        // Motherboard background
        html += '<rect x="180" y="30" width="340" height="300" fill="#0e1a10" stroke="#1a3a1a" stroke-width="1" rx="3"/>';
        html += '<text x="350" y="50" fill="#1e3a1e" font-family="Consolas" font-size="11" text-anchor="middle">MOTHERBOARD — ASUS PRIME B560M-A</text>';

        // PSU area (top-left of case)
        const psuFill = c.psu === 'dead' ? '#3a0a0a' : c.psu === 'removed' ? '#111' : '#0d1a0a';
        const psuStroke = psuColor;
        html += '<g id="hw1-psu" style="cursor:pointer;" data-comp="psu">';
        html += '<rect x="20" y="20" width="140" height="100" fill="' + psuFill + '" stroke="' + psuStroke + '" stroke-width="2" rx="3"/>';
        html += '<text x="90" y="55" fill="' + psuColor + '" font-family="Consolas" font-size="10" text-anchor="middle" font-weight="bold">PSU</text>';
        html += '<text x="90" y="70" fill="' + psuColor + '" font-family="Consolas" font-size="9" text-anchor="middle">550W 80+ Bronze</text>';
        html += '<text x="90" y="85" fill="' + psuColor + '" font-family="Consolas" font-size="8" text-anchor="middle">State: ' + stateLabel(c.psu) + '</text>';
        // PSU fan circle
        if (c.psu !== 'removed') {
            const fanFill = c.psu === 'dead' ? '#2a0a0a' : '#0d250d';
            const fanStroke = c.psu === 'dead' ? '#e74c3c' : '#2ecc71';
            html += '<circle cx="90" cy="105" r="12" fill="' + fanFill + '" stroke="' + fanStroke + '" stroke-width="1"/>';
            html += '<text x="90" y="109" fill="' + fanStroke + '" font-family="Consolas" font-size="8" text-anchor="middle">' + (c.psu === 'dead' ? 'DEAD' : 'FAN') + '</text>';
        }
        html += '</g>';

        // CPU / heatsink
        const cpuFill = c.cpuHeatsink === 'tilted' ? '#2a1a00' : c.cpuHeatsink === 'removed' ? '#111' : '#0d1a0a';
        const cpuStroke = cpuColor;
        html += '<g id="hw1-cpu" style="cursor:pointer;" data-comp="cpu">';
        html += '<rect x="280" y="60" width="80" height="80" fill="' + cpuFill + '" stroke="' + cpuStroke + '" stroke-width="2" rx="3"/>';
        html += '<text x="320" y="95" fill="' + cpuColor + '" font-family="Consolas" font-size="9" text-anchor="middle" font-weight="bold">CPU HEATSINK</text>';
        html += '<text x="320" y="108" fill="' + cpuColor + '" font-family="Consolas" font-size="8" text-anchor="middle">i7-11700</text>';
        html += '<text x="320" y="120" fill="' + cpuColor + '" font-family="Consolas" font-size="8" text-anchor="middle">' + stateLabel(c.cpuHeatsink) + '</text>';
        // Heatsink fan
        if (c.cpuHeatsink !== 'removed') {
            const hsFanStroke = c.cpuHeatsink === 'tilted' ? '#f39c12' : '#2ecc71';
            html += '<circle cx="320" cy="75" r="10" fill="#0a1408" stroke="' + hsFanStroke + '" stroke-width="1"/>';
            html += '<text x="320" y="79" fill="' + hsFanStroke + '" font-family="Consolas" font-size="7" text-anchor="middle">FAN</text>';
        }
        html += '</g>';

        // Thermal paste indicator (only visible if heatsink removed or tilted)
        if (c.cpuHeatsink === 'removed' || c.cpuHeatsink === 'tilted') {
            const pasteColor = c.thermalPaste === 'dried' ? '#8B4513' : c.thermalPaste === 'cleaned' ? '#888' : c.thermalPaste === 'applied' ? '#c8a0f0' : '#c8a0f0';
            html += '<g id="hw1-paste" style="cursor:pointer;" data-comp="paste">';
            html += '<rect x="290" y="68" width="60" height="60" fill="' + pasteColor + '" opacity="0.3" rx="2"/>';
            html += '<text x="320" y="95" fill="' + pasteColor + '" font-family="Consolas" font-size="8" text-anchor="middle">PASTE</text>';
            html += '<text x="320" y="107" fill="' + pasteColor + '" font-family="Consolas" font-size="7" text-anchor="middle">' + stateLabel(c.thermalPaste) + '</text>';
            html += '</g>';
        }

        // RAM slots
        const ram0Fill = c.ram0 === 'unseated' ? '#2a0a0a' : c.ram0 === 'removed' ? '#111' : '#0a1a1a';
        html += '<g id="hw1-ram0" style="cursor:pointer;" data-comp="ram0">';
        html += '<rect x="390" y="60" width="30" height="100" fill="' + ram0Fill + '" stroke="' + ramColor0 + '" stroke-width="2" rx="2"/>';
        html += '<text x="405" y="100" fill="' + ramColor0 + '" font-family="Consolas" font-size="8" text-anchor="middle" transform="rotate(-90, 405, 100)">DIMM1 ' + stateLabel(c.ram0) + '</text>';
        html += '</g>';

        html += '<g id="hw1-ram1" style="cursor:pointer;" data-comp="ram1">';
        html += '<rect x="430" y="60" width="30" height="100" fill="#0a1a1a" stroke="' + ramColor1 + '" stroke-width="2" rx="2"/>';
        html += '<text x="445" y="100" fill="' + ramColor1 + '" font-family="Consolas" font-size="8" text-anchor="middle" transform="rotate(-90, 445, 100)">DIMM2 ' + stateLabel(c.ram1) + '</text>';
        html += '</g>';

        // GPU (PCIe x16)
        const gpuFill = c.gpu === 'dead' ? '#2a0808' : c.gpu === 'removed' ? '#111' : '#0a1215';
        html += '<g id="hw1-gpu" style="cursor:pointer;" data-comp="gpu">';
        html += '<rect x="190" y="180" width="300" height="60" fill="' + gpuFill + '" stroke="' + gpuColor + '" stroke-width="2" rx="3"/>';
        html += '<text x="340" y="205" fill="' + gpuColor + '" font-family="Consolas" font-size="9" text-anchor="middle" font-weight="bold">GPU — NVIDIA GeForce GTX 1650</text>';
        html += '<text x="340" y="220" fill="' + gpuColor + '" font-family="Consolas" font-size="8" text-anchor="middle">PCIe x16 | State: ' + stateLabel(c.gpu) + '</text>';
        // GPU fan
        if (c.gpu !== 'removed') {
            html += '<circle cx="220" cy="210" r="14" fill="' + (c.gpu === 'dead' ? '#1a0505' : '#081510') + '" stroke="' + gpuFan + '" stroke-width="1"/>';
            html += '<text x="220" y="214" fill="' + gpuFan + '" font-family="Consolas" font-size="7" text-anchor="middle">' + (c.gpu === 'dead' ? 'DEAD' : 'FAN') + '</text>';
        }
        html += '</g>';

        // SATA ports on mobo edge
        const sata0Stroke = sata0Color;
        const sata1Stroke = sata1Color;
        html += '<text x="490" y="175" fill="#888" font-family="Consolas" font-size="8" text-anchor="middle">SATA PORTS</text>';

        html += '<g id="hw1-sata0" style="cursor:pointer;" data-comp="sata0">';
        html += '<rect x="470" y="180" width="40" height="20" fill="#0a100a" stroke="' + sata0Stroke + '" stroke-width="2" rx="2"/>';
        html += '<text x="490" y="194" fill="' + sata0Stroke + '" font-family="Consolas" font-size="7" text-anchor="middle">P0 ' + (c.sata0 === 'frayed' ? 'FRAYED' : stateLabel(c.sata0)) + '</text>';
        html += '</g>';

        html += '<g id="hw1-sata1" style="cursor:pointer;" data-comp="sata1">';
        html += '<rect x="470" y="205" width="40" height="20" fill="#0a100a" stroke="' + sata1Stroke + '" stroke-width="1.5" rx="2"/>';
        html += '<text x="490" y="219" fill="' + sata1Stroke + '" font-family="Consolas" font-size="7" text-anchor="middle">P1 ' + stateLabel(c.sata1) + '</text>';
        html += '</g>';

        // SATA cables (drawn as lines to drives)
        if (c.sata0 !== 'removed') {
            const cableStroke = c.sata0 === 'frayed' ? '#e74c3c' : '#2ecc71';
            const cableDash = c.sata0 === 'frayed' ? '5,3' : 'none';
            html += '<line x1="470" y1="190" x2="100" y2="280" stroke="' + cableStroke + '" stroke-width="2" stroke-dasharray="' + cableDash + '"/>';
        }
        if (c.sata1 !== 'removed') {
            html += '<line x1="470" y1="215" x2="100" y2="310" stroke="#2ecc71" stroke-width="1.5" stroke-dasharray="none"/>';
        }

        // Drive bays
        html += '<rect x="20" y="270" width="80" height="30" fill="#0a1208" stroke="#2ecc71" stroke-width="1" rx="2"/>';
        html += '<text x="60" y="289" fill="#2ecc71" font-family="Consolas" font-size="7" text-anchor="middle">SSD 500GB</text>';
        html += '<rect x="20" y="305" width="80" height="30" fill="#0a1208" stroke="#2ecc71" stroke-width="1" rx="2"/>';
        html += '<text x="60" y="324" fill="#2ecc71" font-family="Consolas" font-size="7" text-anchor="middle">HDD 2TB</text>';

        // Front panel LEDs
        html += '<rect x="20" y="160" width="12" height="6" fill="' + (c.psu !== 'dead' && c.psu !== 'removed' ? '#00ff44' : '#333') + '" rx="1"/>';
        html += '<text x="35" y="167" fill="#888" font-family="Consolas" font-size="7">PWR LED</text>';
        html += '<rect x="20" y="170" width="12" height="6" fill="#aaaaff" rx="1" opacity="' + (c.psu !== 'dead' && c.psu !== 'removed' ? '1' : '0.2') + '"/>';
        html += '<text x="35" y="177" fill="#888" font-family="Consolas" font-size="7">HDD LED</text>';

        html += '</svg>';
        html += '</div>';

        // Component status table
        html += '<div style="background:#0a0e14; border:1px solid #1a2a3a; border-radius:4px; padding:12px; margin-bottom:16px; font-size:0.75rem;">';
        html += '<div style="color:#e67e22; font-weight:bold; margin-bottom:8px;">Component Status</div>';
        html += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:4px 16px;">';

        const compRows = [
            { label: 'DIMM1 (RAM)', state: c.ram0, color: ramColor0 },
            { label: 'DIMM2 (RAM)', state: c.ram1, color: ramColor1 },
            { label: 'GPU', state: c.gpu, color: gpuColor },
            { label: 'PSU', state: c.psu, color: psuColor },
            { label: 'CPU Heatsink', state: c.cpuHeatsink, color: cpuColor },
            { label: 'Thermal Paste', state: c.thermalPaste, color: c.thermalPaste === 'good' || c.thermalPaste === 'applied' ? '#2ecc71' : c.thermalPaste === 'dried' ? '#e74c3c' : '#888' },
            { label: 'SATA Port 0', state: c.sata0, color: sata0Color },
            { label: 'SATA Port 1', state: c.sata1, color: sata1Color }
        ];
        compRows.forEach(function(r) {
            html += '<div style="display:flex; justify-content:space-between;">'
                + '<span style="color:#888;">' + r.label + '</span>'
                + '<span style="color:' + r.color + ';">' + stateLabel(r.state) + '</span>'
                + '</div>';
        });
        html += '</div></div>';

        // Component action buttons
        html += '<div style="background:#0a0e14; border:1px solid #1a2a3a; border-radius:4px; padding:12px;">';
        html += '<div style="color:#e67e22; font-weight:bold; margin-bottom:10px;">Component Actions</div>';
        html += '<div style="display:flex; flex-wrap:wrap; gap:6px;" id="hw1CaseActions">';
        html += HW1Config._buildComponentActions(engine, c);
        html += '</div></div>';

        container.innerHTML = html;

        HW1Config._wireComponentSVGClicks(engine, container, c);
        HW1Config._wireActionButtons(engine, container);
    },

    _buildComponentActions(engine, c) {
        const scenario = HW1Config._getScenario(engine);
        let html = '';

        const btn = function(id, label, color) {
            color = color || '#e67e22';
            return '<button data-action="' + id + '" style="padding:6px 14px; background:rgba(255,255,255,0.05); border:1px solid ' + color + '; color:' + color + '; border-radius:3px; cursor:pointer; font-family:Consolas,monospace; font-size:0.75rem;">' + label + '</button>';
        };

        // DIMM1
        if (c.ram0 === 'unseated') {
            html += btn('reseat_ram0', 'Reseat DIMM1', '#2ecc71');
        } else if (c.ram0 === 'seated') {
            html += btn('inspect_ram0', 'Inspect DIMM1', '#888');
            html += btn('remove_ram0', 'Remove DIMM1', '#e74c3c');
        } else if (c.ram0 === 'removed') {
            html += btn('inspect_ram0', 'DIMM1 slot empty', '#555');
        }

        // DIMM2
        if (c.ram1 === 'seated') {
            html += btn('inspect_ram1', 'Inspect DIMM2', '#888');
        } else if (c.ram1 === 'removed') {
            html += btn('inspect_ram1', 'DIMM2 slot empty', '#555');
        }

        // GPU
        if (c.gpu === 'installed') {
            html += btn('inspect_gpu', 'Inspect GPU', '#888');
            html += btn('remove_gpu', 'Remove GPU', '#e74c3c');
        } else if (c.gpu === 'dead') {
            html += btn('inspect_gpu', 'Inspect GPU (DEAD)', '#e74c3c');
            html += btn('remove_gpu', 'Remove Dead GPU', '#e74c3c');
        } else if (c.gpu === 'removed') {
            html += btn('inspect_gpu', 'PCIe slot empty', '#555');
        }

        // PSU
        if (c.psu === 'installed') {
            html += btn('inspect_psu', 'Inspect PSU', '#888');
            html += btn('remove_psu', 'Remove PSU', '#e74c3c');
        } else if (c.psu === 'dead') {
            html += btn('inspect_psu', 'Inspect PSU (DEAD)', '#e74c3c');
            html += btn('remove_psu', 'Remove Dead PSU', '#e74c3c');
        } else if (c.psu === 'removed') {
            html += btn('inspect_psu', 'PSU bay empty', '#555');
        }

        // CPU Heatsink
        if (c.cpuHeatsink === 'seated') {
            html += btn('inspect_cpu', 'Inspect Heatsink', '#888');
            html += btn('remove_heatsink', 'Remove Heatsink', '#e74c3c');
        } else if (c.cpuHeatsink === 'tilted') {
            html += btn('inspect_cpu', 'Inspect Heatsink (TILTED)', '#f39c12');
            html += btn('remove_heatsink', 'Remove Heatsink', '#e74c3c');
        } else if (c.cpuHeatsink === 'removed') {
            html += btn('inspect_cpu', 'CPU socket exposed', '#888');
            if (c.thermalPaste === 'dried') {
                html += btn('clean_paste', 'Clean Old Paste', '#f39c12');
            } else if (c.thermalPaste === 'cleaned') {
                html += btn('reseat_heatsink', 'Reseat Heatsink (dry)', '#888');
            } else if (c.thermalPaste === 'applied') {
                html += btn('reseat_heatsink', 'Reseat Heatsink', '#2ecc71');
            }
        }

        // SATA cables
        if (c.sata0 === 'connected') {
            html += btn('inspect_sata0', 'Inspect SATA Port 0 cable', '#888');
        } else if (c.sata0 === 'frayed') {
            html += btn('inspect_sata0', 'Inspect SATA Port 0 (FRAYED)', '#e74c3c');
            html += btn('remove_sata0', 'Remove SATA Port 0 cable', '#e74c3c');
        } else if (c.sata0 === 'removed') {
            html += btn('inspect_sata0', 'SATA Port 0 empty', '#555');
        }
        if (c.sata1 === 'connected') {
            html += btn('inspect_sata1', 'Inspect SATA Port 1 cable', '#888');
        }

        return html;
    },

    _wireComponentSVGClicks(engine, container, c) {
        // SVG group clicks map to actions for quick targeting
        const svgMap = {
            'hw1-psu': c.psu !== 'removed' ? 'inspect_psu' : null,
            'hw1-cpu': c.cpuHeatsink !== 'removed' ? 'inspect_cpu' : null,
            'hw1-gpu': c.gpu !== 'removed' ? 'inspect_gpu' : null,
            'hw1-ram0': 'inspect_ram0',
            'hw1-ram1': 'inspect_ram1',
            'hw1-sata0': c.sata0 !== 'removed' ? 'inspect_sata0' : null,
            'hw1-sata1': 'inspect_sata1'
        };
        for (const id in svgMap) {
            const el = container.querySelector('#' + id);
            if (el && svgMap[id]) {
                el.addEventListener('click', function() {
                    HW1Config._executeAction(svgMap[id], engine);
                });
            }
        }
    },

    _wireActionButtons(engine, container) {
        const actionsDiv = container.querySelector('#hw1CaseActions');
        if (!actionsDiv) return;
        actionsDiv.querySelectorAll('button[data-action]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                HW1Config._executeAction(action, engine);
            });
        });
    },

    _executeAction(action, engine) {
        const c = HW1Config._getComponents(engine);
        const scenario = HW1Config._getScenario(engine);
        let notify = null;

        switch (action) {
            // Inspect actions
            case 'inspect_ram0':
                if (c.ram0 === 'unseated') {
                    notify = { msg: 'DIMM1: Module is not fully seated. The left retaining clip is open and the DIMM sits approximately 3mm too high on the left side. This module was jarred loose.', type: 'warn' };
                } else if (c.ram0 === 'seated') {
                    const normal = !scenario || scenario.brokenComponents.ram0 !== 'unseated';
                    notify = { msg: normal ? 'DIMM1: Seated correctly. Both retaining clips locked. Module flush with slot.' : 'DIMM1: Seated correctly. Repair confirmed.', type: 'info' };
                } else {
                    notify = { msg: 'DIMM1 slot is empty. Install a DDR4 DIMM from the Parts Bin if needed.', type: 'info' };
                }
                break;

            case 'inspect_ram1':
                notify = { msg: 'DIMM2: Seated correctly. Both retaining clips locked. Module flush with slot.', type: 'info' };
                break;

            case 'inspect_gpu':
                if (c.gpu === 'dead') {
                    notify = { msg: 'GPU: Fan is stationary — no spin during power-on. PCIe power connectors seated. Card appears physically intact but is electrically dead. No output on any port.', type: 'warn' };
                } else if (c.gpu === 'installed') {
                    notify = { msg: 'GPU: Fan spinning normally. PCIe x16 fully engaged. Both power connectors seated. Status: operational.', type: 'info' };
                } else {
                    notify = { msg: 'PCIe x16 slot is empty. Install a GPU from the Parts Bin if needed.', type: 'info' };
                }
                break;

            case 'inspect_psu':
                if (c.psu === 'dead') {
                    notify = { msg: 'PSU: Fan is completely still. No LED indicators lit. Modular cables seated correctly. Wall outlet tested — confirmed live. PSU is electrically dead.', type: 'warn' };
                } else if (c.psu === 'installed') {
                    notify = { msg: 'PSU: Fan spinning. Green LED on. ATX 24-pin and EPS connectors seated. All modular cables attached. Status: operational.', type: 'info' };
                } else {
                    notify = { msg: 'PSU bay is empty. Install a replacement PSU from the Parts Bin.', type: 'info' };
                }
                break;

            case 'inspect_cpu':
                if (c.cpuHeatsink === 'tilted') {
                    notify = { msg: 'CPU Heatsink: Rear-left mounting post is not locked. Heatsink tilts 8 degrees off-level. Thermal compound visible at the raised gap — dried and cracked. Insufficient contact with CPU IHS. This is the cause of thermal runaway.', type: 'warn' };
                } else if (c.cpuHeatsink === 'seated') {
                    notify = { msg: 'CPU Heatsink: All four mounting posts locked. Heatsink level and flush. Fan connector seated. Thermal paste contact appears adequate. Status: operational.', type: 'info' };
                } else {
                    notify = { msg: 'CPU socket exposed. Thermal paste visible on IHS. State: ' + c.thermalPaste, type: 'info' };
                }
                break;

            case 'inspect_sata0':
                if (c.sata0 === 'frayed') {
                    notify = { msg: 'SATA Port 0 cable: Insulation is frayed and split approximately 2cm from the motherboard connector. Multiple conductors partially exposed. This cable makes intermittent contact — insufficient for reliable drive detection.', type: 'warn' };
                } else if (c.sata0 === 'connected') {
                    notify = { msg: 'SATA Port 0 cable: Insulation intact. Both connectors fully engaged with locking clips. Status: operational.', type: 'info' };
                } else {
                    notify = { msg: 'SATA Port 0 is empty. Install a replacement cable from the Parts Bin.', type: 'info' };
                }
                break;

            case 'inspect_sata1':
                notify = { msg: 'SATA Port 1 cable: Insulation intact. Both connectors fully engaged. Status: operational.', type: 'info' };
                break;

            // Repair actions
            case 'reseat_ram0':
                if (c.ram0 === 'unseated') {
                    c.ram0 = 'seated';
                    engine.save();
                    notify = { msg: 'DIMM1 reseated. Both retaining clips clicked into place. Module is now flush with the slot.', type: 'success' };
                }
                break;

            case 'remove_ram0':
                c.ram0 = 'removed';
                engine.save();
                notify = { msg: 'DIMM1 removed. Retaining clips released. Slot is now empty.', type: 'info' };
                break;

            case 'remove_gpu':
                if (c.gpu !== 'removed') {
                    c.gpu = 'removed';
                    engine.save();
                    notify = { msg: 'GPU removed. PCIe x16 slot is now empty. Install a replacement from the Parts Bin.', type: 'info' };
                }
                break;

            case 'remove_psu':
                if (c.psu !== 'removed') {
                    c.psu = 'removed';
                    engine.save();
                    notify = { msg: 'PSU removed. Modular cables disconnected. Bay is empty. Install a replacement from the Parts Bin.', type: 'info' };
                }
                break;

            case 'remove_heatsink':
                if (c.cpuHeatsink !== 'removed') {
                    engine.state._heatsinkRemoved = true;
                    c.cpuHeatsink = 'removed';
                    if (scenario && scenario.id === 'cpu_overheat') {
                        c.thermalPaste = 'dried';
                    }
                    engine.save();
                    notify = { msg: 'CPU heatsink removed. Mounting posts released. CPU IHS is now exposed. Thermal compound visible — inspect it.', type: 'info' };
                }
                break;

            case 'clean_paste':
                if (c.thermalPaste === 'dried') {
                    c.thermalPaste = 'cleaned';
                    engine.state._pasteCleaned = true;
                    engine.save();
                    notify = { msg: 'Old thermal compound cleaned from CPU IHS and heatsink base. Both surfaces are now bare. Apply fresh thermal paste from the Parts Bin before reseating the heatsink.', type: 'info' };
                }
                break;

            case 'reseat_heatsink':
                if (c.cpuHeatsink === 'removed') {
                    if (c.thermalPaste === 'applied') {
                        c.cpuHeatsink = 'seated';
                        engine.save();
                        notify = { msg: 'CPU heatsink reseated. All four mounting posts locked. Fresh thermal compound compressed evenly. Fan connector attached.', type: 'success' };
                    } else {
                        notify = { msg: 'Apply thermal paste first before reseating the heatsink. Open the Parts Bin to get Arctic MX-4.', type: 'error' };
                    }
                }
                break;

            case 'remove_sata0':
                if (c.sata0 !== 'removed') {
                    c.sata0 = 'removed';
                    engine.save();
                    notify = { msg: 'SATA Port 0 cable removed. Port is now empty. Install a replacement cable from the Parts Bin.', type: 'info' };
                }
                break;
        }

        if (notify) {
            engine.notify(notify.msg, notify.type);
        }

        // Refresh panel
        const caseContainer = document.getElementById('caseContainer');
        if (caseContainer) {
            HW1Config._renderCasePanel(engine, caseContainer);
        }
    },

    // ==========================================================
    // PARTS BIN
    // ==========================================================

    _openPartsBin(iconDef, engine) {
        if (engine._windows && engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        const container = document.createElement('div');
        container.id = 'partsBinContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#111827; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Parts Bin', 'PART', container);
        HW1Config._renderPartsBin(engine, container);
    },

    _renderPartsBin(engine, container) {
        const c = HW1Config._getComponents(engine);
        const partBin = engine.state._partBinUsed || {};

        const parts = [
            {
                id: 'ddr4_dimm',
                name: 'DDR4 DIMM 8GB',
                spec: 'Kingston Fury Beast, 3200MHz, CL16',
                desc: 'Standard desktop RAM module. Install into an empty DIMM slot.',
                action: 'install_ram0',
                available: c.ram0 === 'removed'
            },
            {
                id: 'gpu_replacement',
                name: 'GPU — NVIDIA GeForce GTX 1650',
                spec: '4GB GDDR6, PCIe x16, 2x DP, 1x HDMI',
                desc: 'Direct replacement for the installed card. Install into empty PCIe x16 slot.',
                action: 'install_gpu',
                available: c.gpu === 'removed'
            },
            {
                id: 'psu_replacement',
                name: 'PSU — 550W 80+ Bronze',
                spec: 'Corsair CX550, ATX, 80 PLUS Bronze, Semi-modular',
                desc: 'Replace a dead power supply unit. Install into empty PSU bay.',
                action: 'install_psu',
                available: c.psu === 'removed'
            },
            {
                id: 'thermal_paste',
                name: 'Thermal Paste — Arctic MX-4',
                spec: '4g syringe, 8.5 W/m*K thermal conductivity',
                desc: 'Apply to cleaned CPU IHS before reseating heatsink.',
                action: 'apply_paste',
                available: c.cpuHeatsink === 'removed' && c.thermalPaste === 'cleaned'
            },
            {
                id: 'sata_cable',
                name: 'SATA Cable — 6Gbps',
                spec: '50cm, right-angle connectors, locking clip',
                desc: 'Replace a damaged SATA data cable. Connect to an empty SATA port.',
                action: 'install_sata0',
                available: c.sata0 === 'removed'
            },
            {
                id: 'sata_ssd',
                name: 'SATA SSD — 256GB',
                spec: 'Samsung 870 EVO, 560MB/s read',
                desc: 'Spare drive. Only use if drive is confirmed failed — check cables first.',
                action: null,
                available: false,
                redHerring: true
            }
        ];

        let html = '<div style="color:#e67e22; font-weight:bold; margin-bottom:12px;">Parts Bin — Available Stock</div>'
            + '<div style="color:#888; font-size:0.72rem; margin-bottom:16px;">Click a part to install it. Parts can only be installed if the matching slot is empty.</div>';

        html += '<div style="display:grid; gap:10px;">';
        parts.forEach(function(part) {
            const usable = part.available && part.action;
            const used = partBin[part.action ? part.action.replace('install_', '').replace('apply_', 'thermal') : ''];
            const borderColor = part.redHerring ? '#555' : usable ? '#2ecc71' : '#333';
            const opacity = part.redHerring ? '0.5' : usable ? '1' : '0.6';

            html += '<div style="background:rgba(255,255,255,0.03); border:1px solid ' + borderColor + '; border-radius:4px; padding:12px; opacity:' + opacity + ';">';
            html += '<div style="display:flex; justify-content:space-between; align-items:flex-start; gap:12px;">';
            html += '<div style="flex:1;">';
            html += '<div style="font-weight:bold; color:' + (part.redHerring ? '#888' : '#c8e6c9') + '; margin-bottom:4px;">' + HW1Config._escHtml(part.name) + '</div>';
            html += '<div style="color:#888; font-size:0.7rem; margin-bottom:4px;">' + HW1Config._escHtml(part.spec) + '</div>';
            html += '<div style="color:#aaa; font-size:0.72rem;">' + HW1Config._escHtml(part.desc) + '</div>';
            if (part.redHerring) {
                html += '<div style="color:#f39c12; font-size:0.7rem; margin-top:4px;">Note: Verify cable integrity before replacing the drive.</div>';
            }
            html += '</div>';
            if (usable) {
                html += '<button data-part-action="' + part.action + '" style="flex-shrink:0; padding:8px 16px; background:#2ecc71; color:#000; border:none; border-radius:4px; cursor:pointer; font-family:Consolas,monospace; font-size:0.75rem; font-weight:bold; white-space:nowrap;">Install</button>';
            } else if (!usable && !part.redHerring) {
                html += '<span style="flex-shrink:0; color:#555; font-size:0.72rem; padding:8px;">Not available</span>';
            }
            html += '</div></div>';
        });
        html += '</div>';

        container.innerHTML = html;

        // Wire install buttons
        container.querySelectorAll('button[data-part-action]').forEach(function(btn) {
            btn.addEventListener('click', function() {
                const action = this.getAttribute('data-part-action');
                HW1Config._installPart(action, engine);
            });
        });
    },

    _installPart(action, engine) {
        const c = HW1Config._getComponents(engine);
        const partBin = engine.state._partBinUsed || {};
        let msg = '';

        switch (action) {
            case 'install_ram0':
                if (c.ram0 === 'removed') {
                    c.ram0 = 'seated';
                    partBin.ram0 = true;
                    engine.save();
                    msg = 'DDR4 DIMM installed in DIMM1 slot. Retaining clips locked.';
                }
                break;

            case 'install_gpu':
                if (c.gpu === 'removed') {
                    c.gpu = 'installed';
                    partBin.gpu = true;
                    engine.save();
                    msg = 'GPU installed in PCIe x16 slot. Power connectors attached.';
                }
                break;

            case 'install_psu':
                if (c.psu === 'removed') {
                    c.psu = 'installed';
                    partBin.psu = true;
                    engine.save();
                    msg = 'PSU installed. ATX 24-pin and EPS connectors attached. Modular cables routed.';
                }
                break;

            case 'apply_paste':
                if (c.thermalPaste === 'cleaned') {
                    c.thermalPaste = 'applied';
                    partBin.thermalPaste = true;
                    engine.save();
                    msg = 'Arctic MX-4 applied to CPU IHS. Small pea-sized dot in center. Now reseat the heatsink.';
                }
                break;

            case 'install_sata0':
                if (c.sata0 === 'removed') {
                    c.sata0 = 'connected';
                    partBin.sata0 = true;
                    engine.save();
                    msg = 'New SATA cable installed on Port 0. Both connectors seated with locking clips engaged.';
                }
                break;
        }

        engine.state._partBinUsed = partBin;
        engine.save();

        if (msg) engine.notify(msg, 'success');

        // Refresh Parts Bin and Case panels
        const pbContainer = document.getElementById('partsBinContainer');
        if (pbContainer) HW1Config._renderPartsBin(engine, pbContainer);
        const caseContainer = document.getElementById('caseContainer');
        if (caseContainer) HW1Config._renderCasePanel(engine, caseContainer);
    },

    // ==========================================================
    // MULTIMETER
    // ==========================================================

    _openMultimeter(iconDef, engine) {
        if (engine._windows && engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        const container = document.createElement('div');
        container.id = 'multimeterContainer';
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#111827; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'Multimeter — PSU Voltage Test', 'VOLT', container);
        HW1Config._renderMultimeter(engine, container);
    },

    _renderMultimeter(engine, container) {
        const c = HW1Config._getComponents(engine);
        const scenario = HW1Config._getScenario(engine);
        const isDead = c.psu === 'dead';
        const isRemoved = c.psu === 'removed';
        const tested = engine.state._multimeterTested;

        const rails = [
            { rail: '+12V', normal: '12.1', dead: '0.0', color: '#e74c3c' },
            { rail: '+5V',  normal: '5.05', dead: '0.0', color: '#f39c12' },
            { rail: '+3.3V',normal: '3.31', dead: '0.0', color: '#3498db' },
            { rail: '-12V', normal: '-12.0',dead: '0.0', color: '#9b59b6' }
        ];

        let html = '<div style="color:#e67e22; font-weight:bold; margin-bottom:12px;">ATX Power Supply — Voltage Rails</div>';
        html += '<div style="color:#888; font-size:0.72rem; margin-bottom:16px;">Connect the multimeter probes to the ATX 24-pin connector and select a rail to test.</div>';

        // Meter display
        html += '<div style="background:#0a0a0a; border:2px solid #333; border-radius:8px; padding:20px; margin-bottom:16px; text-align:center;">';
        html += '<div style="font-size:0.7rem; color:#888; margin-bottom:4px;">DIGITAL MULTIMETER — DC VOLTS</div>';

        if (!tested) {
            html += '<div style="font-size:2rem; color:#33ff33; font-family:"Courier New",monospace; letter-spacing:6px; min-height:60px; display:flex; align-items:center; justify-content:center;">- - . - -</div>';
            html += '<div style="color:#888; font-size:0.7rem; margin-top:8px;">Select a rail below to take a reading</div>';
        } else if (isRemoved) {
            html += '<div style="font-size:2rem; color:#e74c3c; font-family:"Courier New",monospace; letter-spacing:6px; min-height:60px; display:flex; align-items:center; justify-content:center;">OL</div>';
            html += '<div style="color:#e74c3c; font-size:0.7rem; margin-top:8px;">Open circuit — PSU not installed</div>';
        }

        html += '</div>';

        // Rail test buttons
        if (!isRemoved) {
            html += '<div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:16px;" id="hw1MultimeterRails">';
            rails.forEach(function(r) {
                html += '<button data-rail="' + r.rail + '" data-normal="' + r.normal + '" data-dead="' + r.dead + '" '
                    + 'style="padding:12px; background:#0a0e14; border:1px solid ' + r.color + '; border-radius:4px; cursor:pointer; font-family:Consolas,monospace;">';
                html += '<div style="color:' + r.color + '; font-weight:bold; font-size:0.9rem; margin-bottom:6px;">Test ' + r.rail + '</div>';
                html += '<div id="reading-' + r.rail.replace(/[^a-zA-Z0-9]/g, '') + '" style="font-size:1.4rem; color:#33ff33; letter-spacing:3px;">- -</div>';
                html += '</button>';
            });
            html += '</div>';
        }

        // Summary (shown after all rails tested or if PSU removed)
        if (isDead && engine.state._labComplete) {
            // Should not happen — dead PSU means no boot — but handle gracefully
        }

        html += '<div style="background:#0a0e14; border:1px solid #1a2a3a; border-radius:4px; padding:12px; font-size:0.75rem;">';
        html += '<div style="color:#e67e22; font-weight:bold; margin-bottom:8px;">ATX Rail Specifications</div>';
        rails.forEach(function(r) {
            const tol = r.rail === '-12V' ? '+/- 10%' : '+/- 5%';
            const min = r.rail === '+12V' ? '11.40V' : r.rail === '+5V' ? '4.75V' : r.rail === '+3.3V' ? '3.135V' : '-13.2V';
            const max = r.rail === '+12V' ? '12.60V' : r.rail === '+5V' ? '5.25V' : r.rail === '+3.3V' ? '3.465V' : '-10.8V';
            html += '<div style="display:flex; justify-content:space-between; margin-bottom:4px;">';
            html += '<span style="color:' + r.color + ';">' + r.rail + '</span>';
            html += '<span style="color:#888;">Nominal: ' + r.normal + 'V | Tolerance: ' + tol + ' (' + min + ' to ' + max + ')</span>';
            html += '</div>';
        });
        html += '</div>';

        container.innerHTML = html;

        // Wire rail test buttons
        const railsDiv = container.querySelector('#hw1MultimeterRails');
        if (railsDiv) {
            railsDiv.querySelectorAll('button[data-rail]').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    engine.state._multimeterTested = true;
                    const rail = this.getAttribute('data-rail');
                    const normal = this.getAttribute('data-normal');
                    const dead = this.getAttribute('data-dead');
                    const reading = isDead ? dead : normal;
                    const readEl = document.getElementById('reading-' + rail.replace(/[^a-zA-Z0-9]/g, ''));
                    if (readEl) {
                        readEl.textContent = reading + 'V';
                        readEl.style.color = isDead ? '#e74c3c' : '#33ff33';
                    }
                    // Update main display
                    const mainDisplay = container.querySelector('[style*="font-size:2rem"]');
                    if (mainDisplay) {
                        mainDisplay.textContent = reading + 'V';
                        mainDisplay.style.color = isDead ? '#e74c3c' : '#33ff33';
                    }
                    if (isDead) {
                        engine.notify(rail + ' rail reads 0.0V. No output. PSU is confirmed dead.', 'warn');
                    } else {
                        engine.notify(rail + ' rail reads ' + reading + 'V. Within spec.', 'success');
                    }
                    engine.save();
                });
            });
        }
    },

    // ==========================================================
    // POST CODE REFERENCE
    // ==========================================================

    _openPostReference(iconDef, engine) {
        if (engine._windows && engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        const container = document.createElement('div');
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#111827; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'POST Code Reference', 'POST', container);

        const beepCodes = [
            { code: '1 short beep', meaning: 'Normal POST — system is healthy', component: 'All', severity: 'OK' },
            { code: '2 short beeps', meaning: 'Memory parity error (older BIOS)', component: 'RAM', severity: 'WARN' },
            { code: '3 short beeps', meaning: 'Memory initialization failure', component: 'RAM', severity: 'FAIL' },
            { code: '4 short beeps', meaning: 'Timer failure', component: 'Motherboard', severity: 'FAIL' },
            { code: '5 short beeps', meaning: 'CPU error', component: 'CPU', severity: 'FAIL' },
            { code: '6 short beeps', meaning: 'Keyboard controller failure', component: 'Keyboard/MB', severity: 'FAIL' },
            { code: '1 long + 2 short', meaning: 'Video error (Award BIOS)', component: 'GPU', severity: 'FAIL' },
            { code: '1 long + 3 short', meaning: 'Video initialization failure (AMI BIOS)', component: 'GPU', severity: 'FAIL' },
            { code: '1 long + 8 short', meaning: 'Display/video test failure', component: 'GPU/Monitor', severity: 'FAIL' },
            { code: 'Continuous long', meaning: 'RAM not seated or not detected', component: 'RAM', severity: 'FAIL' },
            { code: 'No beeps / no power', meaning: 'PSU failure or no power delivery', component: 'PSU', severity: 'FAIL' },
            { code: 'High-low repeating', meaning: 'CPU overheating warning', component: 'CPU/Thermal', severity: 'WARN' }
        ];

        const ledCodes = [
            { code: '00', meaning: 'System POST OK — all hardware initialized', severity: 'OK' },
            { code: '10', meaning: 'CPU microcode loading', severity: 'INFO' },
            { code: '19', meaning: 'Pre-memory GPU initialization', severity: 'INFO' },
            { code: '2C', meaning: 'Memory detection started', severity: 'INFO' },
            { code: 'D3', meaning: 'Memory training failure — DIMM not seated or incompatible', severity: 'FAIL' },
            { code: 'D4', meaning: 'Memory installation check failure', severity: 'FAIL' },
            { code: 'A0', meaning: 'IDE initialization started', severity: 'INFO' },
            { code: 'A6', meaning: 'Video initialization failure — GPU error or unseated', severity: 'FAIL' },
            { code: 'A9', meaning: 'Boot device selection', severity: 'INFO' },
            { code: 'AA', meaning: 'BIOS Setup loaded', severity: 'INFO' },
            { code: 'FF', meaning: 'OS handoff complete', severity: 'OK' }
        ];

        const sevColor = { 'OK': '#2ecc71', 'WARN': '#f39c12', 'FAIL': '#e74c3c', 'INFO': '#3498db' };

        let html = '<div style="color:#e67e22; font-weight:bold; font-size:1rem; margin-bottom:16px;">POST Beep Codes — AMI BIOS (Standard)</div>';
        html += '<table style="width:100%; border-collapse:collapse; margin-bottom:24px;">';
        html += '<tr><th style="text-align:left; color:#888; font-size:0.7rem; padding:4px 8px; border-bottom:1px solid #222;">BEEP PATTERN</th><th style="text-align:left; color:#888; font-size:0.7rem; padding:4px 8px; border-bottom:1px solid #222;">MEANING</th><th style="text-align:left; color:#888; font-size:0.7rem; padding:4px 8px; border-bottom:1px solid #222;">COMPONENT</th><th style="text-align:center; color:#888; font-size:0.7rem; padding:4px 8px; border-bottom:1px solid #222;">STATUS</th></tr>';
        beepCodes.forEach(function(r) {
            html += '<tr style="border-bottom:1px solid #111;">';
            html += '<td style="padding:6px 8px; color:#c8e6c9;">' + HW1Config._escHtml(r.code) + '</td>';
            html += '<td style="padding:6px 8px; color:#aaa; font-size:0.75rem;">' + HW1Config._escHtml(r.meaning) + '</td>';
            html += '<td style="padding:6px 8px; color:#888; font-size:0.75rem;">' + HW1Config._escHtml(r.component) + '</td>';
            html += '<td style="padding:6px 8px; text-align:center;"><span style="color:' + sevColor[r.severity] + '; font-size:0.7rem; font-weight:bold;">' + r.severity + '</span></td>';
            html += '</tr>';
        });
        html += '</table>';

        html += '<div style="color:#e67e22; font-weight:bold; font-size:1rem; margin-bottom:12px;">POST LED Debug Codes (Motherboard Diagnostic LED)</div>';
        html += '<table style="width:100%; border-collapse:collapse;">';
        html += '<tr><th style="text-align:left; color:#888; font-size:0.7rem; padding:4px 8px; border-bottom:1px solid #222;">HEX CODE</th><th style="text-align:left; color:#888; font-size:0.7rem; padding:4px 8px; border-bottom:1px solid #222;">MEANING</th><th style="text-align:center; color:#888; font-size:0.7rem; padding:4px 8px; border-bottom:1px solid #222;">STATUS</th></tr>';
        ledCodes.forEach(function(r) {
            html += '<tr style="border-bottom:1px solid #111;">';
            html += '<td style="padding:6px 8px; color:#ffff00; font-weight:bold;">' + HW1Config._escHtml(r.code) + '</td>';
            html += '<td style="padding:6px 8px; color:#aaa; font-size:0.75rem;">' + HW1Config._escHtml(r.meaning) + '</td>';
            html += '<td style="padding:6px 8px; text-align:center;"><span style="color:' + sevColor[r.severity] + '; font-size:0.7rem; font-weight:bold;">' + r.severity + '</span></td>';
            html += '</tr>';
        });
        html += '</table>';

        html += '<div style="margin-top:20px; background:rgba(230,126,34,0.05); border:1px solid rgba(230,126,34,0.2); border-radius:4px; padding:12px; font-size:0.72rem; color:#aaa;">';
        html += '<strong style="color:#e67e22;">Troubleshooting Order:</strong> No power at all (PSU) → No beeps, fans dead (PSU/Power button) → Beep codes without video (RAM or GPU per code) → POST OK but no boot (Storage/cables) → POST OK, boots then dies (Thermal)';
        html += '</div>';

        container.innerHTML = html;
    },

    // ==========================================================
    // BIOS SETUP
    // ==========================================================

    _openBios(iconDef, engine) {
        if (engine._windows && engine._windows[iconDef.id]) { engine._focusWindow(iconDef.id); return; }
        const container = document.createElement('div');
        container.style.cssText = 'padding:20px; overflow-y:auto; height:100%; background:#0a0a2a; color:#c8e6c9; font-family:Consolas,monospace; font-size:0.8rem;';
        engine.openWindow(iconDef.id, 'BIOS Setup Utility', 'BIOS', container);

        if (!engine.state._labComplete) {
            container.innerHTML = '<div style="text-align:center; padding:40px 20px;">'
                + '<div style="font-size:1rem; color:#e74c3c; font-weight:bold; margin-bottom:12px;">BIOS NOT ACCESSIBLE</div>'
                + '<div style="color:#888; line-height:1.6;">The system failed POST and did not reach BIOS Setup.<br><br>'
                + 'Fix the hardware fault and achieve a successful boot to access BIOS.</div>'
                + '</div>';
            return;
        }

        const scenario = HW1Config._getScenario(engine);
        const c = HW1Config._getComponents(engine);
        const isCpuScenario = scenario && scenario.id === 'cpu_overheat';
        const cpuTempNow = isCpuScenario ? '42' : '38';

        let html = '<div style="background:#000080; color:#fff; padding:12px 16px; margin-bottom:16px; display:flex; justify-content:space-between; align-items:center;">';
        html += '<div style="font-weight:bold;">ASUS UEFI BIOS Utility — Advanced Mode</div>';
        html += '<div style="font-size:0.75rem;">Version A22 | Build Date: 01/15/2025</div>';
        html += '</div>';

        // Tabs
        const tabs = ['System Info', 'Boot Order', 'Hardware Monitor'];
        html += '<div style="display:flex; gap:0; margin-bottom:16px; border-bottom:1px solid #333;">';
        tabs.forEach(function(t, i) {
            const active = i === (isCpuScenario ? 2 : 0);
            html += '<div style="padding:8px 20px; cursor:pointer; border-bottom:2px solid ' + (active ? '#e67e22' : 'transparent') + '; color:' + (active ? '#e67e22' : '#888') + ';">' + t + '</div>';
        });
        html += '</div>';

        // System Info tab
        html += '<div id="bios-sysinfo">';
        html += '<div style="display:grid; gap:6px;">';
        const sysRows = [
            ['System Model', 'Dell OptiPlex 7090'],
            ['BIOS Version', 'A22 (01/15/2025)'],
            ['CPU', 'Intel Core i7-11700 @ 2.50GHz'],
            ['CPU Cores', '8 Cores / 16 Threads'],
            ['Total Memory', '16384 MB DDR4'],
            ['Memory Speed', '3200 MHz'],
            ['GPU', scenario && scenario.id === 'dead_gpu' ? 'NVIDIA GeForce GTX 1650 (Replacement Unit)' : 'NVIDIA GeForce GTX 1650'],
            ['Primary Storage', c.sata0 !== 'removed' ? 'SAMSUNG 860 EVO 500GB (SATA Port 0)' : 'No device detected on SATA Port 0'],
            ['Secondary Storage', 'WD Blue 2TB (SATA Port 1)']
        ];
        sysRows.forEach(function(r) {
            html += '<div style="display:flex; padding:6px 8px; border-bottom:1px solid #111;">'
                + '<span style="width:200px; color:#888;">' + r[0] + '</span>'
                + '<span style="color:#c8e6c9;">' + HW1Config._escHtml(r[1]) + '</span>'
                + '</div>';
        });
        html += '</div></div>';

        // Hardware Monitor (shown by default for overheat scenario)
        html += '<div style="margin-top:20px;">';
        html += '<div style="color:#e67e22; font-weight:bold; margin-bottom:10px;">Hardware Monitor</div>';
        const monRows = [
            ['CPU Temperature', cpuTempNow + 'C', cpuTempNow > 80 ? '#e74c3c' : '#2ecc71'],
            ['System Temperature', '31C', '#2ecc71'],
            ['CPU Fan Speed', '1850 RPM', '#2ecc71'],
            ['Chassis Fan Speed', '1200 RPM', '#2ecc71'],
            ['CPU Core Voltage', '1.152V', '#2ecc71'],
            ['+12V Rail', '12.06V', '#2ecc71'],
            ['+5V Rail', '5.04V', '#2ecc71']
        ];
        monRows.forEach(function(r) {
            html += '<div style="display:flex; padding:6px 8px; border-bottom:1px solid #111;">'
                + '<span style="width:200px; color:#888;">' + r[0] + '</span>'
                + '<span style="color:' + r[2] + ';">' + HW1Config._escHtml(r[1]) + '</span>'
                + '</div>';
        });

        if (isCpuScenario && engine.state._labComplete) {
            html += '<div style="margin-top:16px; background:rgba(46,204,113,0.08); border:1px solid rgba(46,204,113,0.3); border-radius:4px; padding:12px;">'
                + '<div style="color:#2ecc71; font-weight:bold; margin-bottom:6px;">Thermal Recovery Log:</div>'
                + '<div style="color:#aaa; font-size:0.75rem;">Previous shutdown: 2026-03-13 08:04:22 — CPU temp 96C</div>'
                + '<div style="color:#aaa; font-size:0.75rem;">Thermal fix applied: Heatsink reseated, new compound</div>'
                + '<div style="color:#aaa; font-size:0.75rem;">Recovery token: <strong id="hw1-flag-cpu" style="color:#2ecc71;">loading...</strong></div>'
                + '</div>';
        }
        html += '</div>';

        // Boot order section
        html += '<div style="margin-top:20px;">';
        html += '<div style="color:#e67e22; font-weight:bold; margin-bottom:10px;">Boot Order</div>';
        const drives = c.sata0 !== 'removed' ? ['1. SAMSUNG 860 EVO 500GB (SATA Port 0)', '2. WD Blue 2TB (SATA Port 1)', '3. UEFI: Network Boot'] : ['1. [No device detected — SATA Port 0]', '2. WD Blue 2TB (SATA Port 1)', '3. UEFI: Network Boot'];
        drives.forEach(function(d, i) {
            const color = d.includes('No device') ? '#e74c3c' : '#c8e6c9';
            html += '<div style="padding:6px 8px; border-bottom:1px solid #111; color:' + color + ';">' + HW1Config._escHtml(d) + '</div>';
        });

        if (scenario && scenario.id === 'bad_sata' && engine.state._labComplete) {
            html += '<div style="margin-top:12px; background:rgba(46,204,113,0.05); border:1px solid #2ecc71; border-radius:4px; padding:10px; font-size:0.75rem; color:#2ecc71;">SATA Port 0 device now detected after cable replacement.</div>';
        }
        html += '</div>';

        container.innerHTML = html;

        // Async flag delivery for CPU overheat scenario
        if (isCpuScenario && engine.state._labComplete) {
            BoxEngine.requestFlagText('cpu_overheat').then(function(flagText) {
                var el = document.getElementById('hw1-flag-cpu');
                if (el) el.textContent = flagText || 'Flag unavailable';
            });
        }
    },

    // ==========================================================
    // RESET LAB
    // ==========================================================

    _confirmReset(engine) {
        const overlay = document.createElement('div');
        overlay.style.cssText = 'position:absolute; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.7); display:flex; align-items:center; justify-content:center; z-index:9999;';
        overlay.innerHTML = '<div style="background:#1a1a2e; border:1px solid rgba(255,255,255,0.2); border-radius:8px; padding:24px 32px; text-align:center; font-family:Consolas,monospace; color:#c8e6c9; max-width:360px;">'
            + '<div style="font-size:1rem; font-weight:bold; margin-bottom:12px; color:#e74c3c;">Reset Lab?</div>'
            + '<div style="font-size:0.8rem; color:#aaa; margin-bottom:20px;">This will clear all progress, generate a new hardware fault scenario, and restart from the beginning.</div>'
            + '<div style="display:flex; gap:12px; justify-content:center;">'
            + '<button id="hw1ResetConfirm" style="padding:8px 24px; background:#e74c3c; color:#fff; border:none; border-radius:4px; cursor:pointer; font-weight:bold; font-size:0.8rem;">Reset</button>'
            + '<button id="hw1ResetCancel" style="padding:8px 24px; background:rgba(255,255,255,0.1); color:#ccc; border:1px solid rgba(255,255,255,0.2); border-radius:4px; cursor:pointer; font-size:0.8rem;">Cancel</button>'
            + '</div></div>';

        const arena = document.getElementById('arena');
        arena.appendChild(overlay);

        document.getElementById('hw1ResetConfirm').addEventListener('click', function() {
            HW1Config._flagRestored = false;
            HW1Config.hints = HW1Config._defaultHints;
            engine.reset();
        });
        document.getElementById('hw1ResetCancel').addEventListener('click', function() { overlay.remove(); });
        overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });
    },

    // ==========================================================
    // UTILITY METHODS
    // ==========================================================

    _escHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = String(str);
        return div.innerHTML;
    }
};
