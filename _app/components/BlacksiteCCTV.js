/**
 * BlacksiteCCTV.js - Advanced CCTV Surveillance System
 * Hexworth Prime - BLACKSITE TERMINAL
 *
 * Features:
 * - Multiple camera angles with ASCII art scenes
 * - Glitch effects, static, signal interference
 * - Night vision / thermal modes
 * - Motion detection alerts
 * - Picture-in-picture secondary feed
 * - Story progression integration
 * - Hotkey camera switching (1-4)
 * - Radio chatter audio integration
 */

const BlacksiteCCTV = (function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    // CAMERA DEFINITIONS
    // ═══════════════════════════════════════════════════════════════

    const CAMERAS = {
        'CAM-01': {
            id: 'CAM-01',
            name: 'CORRIDOR ALPHA',
            location: 'FLOOR 1 - EAST WING',
            scene: 'hallway',
            nightVision: false
        },
        'CAM-02': {
            id: 'CAM-02',
            name: 'ROOM 105',
            location: 'CONFERENCE ROOM',
            scene: 'room',
            nightVision: true
        },
        'CAM-03': {
            id: 'CAM-03',
            name: 'DEVICE FEED',
            location: 'UNDER TABLE - ZOOM',
            scene: 'bomb',
            nightVision: true
        },
        'CAM-04': {
            id: 'CAM-04',
            name: 'BALLROOM',
            location: 'SUMMIT VENUE',
            scene: 'summit',
            nightVision: false
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // ASCII ART SCENES
    // ═══════════════════════════════════════════════════════════════

    const SCENES = {
        hallway: {
            frames: [
`    ┌─────────────────────────────────────┐
    │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
    │░ ┌────┐     ┌────┐     ┌────┐     ░░│
    │░ │101 │     │103 │     │105 │ ←   ░░│
    │░ └────┘     └────┘     └────┘     ░░│
    │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
    └─────────────────────────────────────┘
         MERIDIAN HOTEL - FLOOR 1`,
`    ┌─────────────────────────────────────┐
    │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
    │░ ┌────┐     ┌────┐     ┌────┐  ●  ░░│
    │░ │101 │     │103 │     │105 │ ←   ░░│
    │░ └────┘     └────┘     └────┘     ░░│
    │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
    └─────────────────────────────────────┘
         MERIDIAN HOTEL - FLOOR 1`
            ],
            phoenixFrames: [
`    ┌─────────────────────────────────────┐
    │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
    │░ ┌────┐     ┌────┐     ┌────┐     ░░│
    │░ │101 │  ●  │103 │     │105 │     ░░│
    │░ └────┘  ↑  └────┘     └────┘     ░░│
    │░░░░░░░PHOENIX░░░░░░░░░░░░░░░░░░░░░░░│
    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
    └─────────────────────────────────────┘
      [MOTION DETECTED] AGENT APPROACHING`,
`    ┌─────────────────────────────────────┐
    │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
    │░ ┌────┐     ┌────┐     ┌────┐     ░░│
    │░ │101 │     │103 │  ●  │105 │     ░░│
    │░ └────┘     └────┘  ↑  └────┘     ░░│
    │░░░░░░░░░░░░░░░░PHOENIX░░░░░░░░░░░░░░│
    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
    └─────────────────────────────────────┘
       [MOTION DETECTED] NEAR ROOM 105`,
`    ┌─────────────────────────────────────┐
    │░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░│
    │░ ┌────┐     ┌────┐     ┌────┐     ░░│
    │░ │101 │     │103 │     │105◄├─●   ░░│
    │░ └────┘     └────┘     └────┘ ↑   ░░│
    │░░░░░░░░░░░░░░░░░░░░░░░░░░PHOENIX░░░░│
    │▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
    └─────────────────────────────────────┘
      [ALERT] PHOENIX ENTERING ROOM 105`
            ]
        },

        room: {
            frames: [
`    ╔═══════════════════════════════════════╗
    ║  ROOM 105 - CONFERENCE ROOM           ║
    ╠═══════════════════════════════════════╣
    ║                                       ║
    ║    ╔═══════════════════════╗          ║
    ║    ║   CONFERENCE TABLE    ║          ║
    ║    ║  ┌───────────────┐    ║          ║
    ║    ║  │   [DEVICE]    │    ║  ○ ○ ○   ║
    ║    ║  │    ▼ ▼ ▼      │    ║  CHAIRS  ║
    ║    ║  └───────────────┘    ║          ║
    ║    ╚═══════════════════════╝          ║
    ║                              [WINDOW] ║
    ╚═══════════════════════════════════════╝
              ⚠ DEVICE LOCATED ⚠`
            ],
            phoenixFrames: [
`    ╔═══════════════════════════════════════╗
    ║  ROOM 105 - CONFERENCE ROOM           ║
    ╠═══════════════════════════════════════╣
    ║                           ●           ║
    ║    ╔═══════════════════════╗ PHOENIX  ║
    ║    ║   CONFERENCE TABLE    ║   ↓      ║
    ║    ║  ┌───────────────┐    ║          ║
    ║    ║  │   [DEVICE]    │    ║  ○ ○ ○   ║
    ║    ║  │    ▼ ▼ ▼      │    ║  CHAIRS  ║
    ║    ║  └───────────────┘    ║          ║
    ║    ╚═══════════════════════╝          ║
    ║                              [WINDOW] ║
    ╚═══════════════════════════════════════╝
          PHOENIX IN POSITION - STANDBY`,
`    ╔═══════════════════════════════════════╗
    ║  ROOM 105 - CONFERENCE ROOM           ║
    ╠═══════════════════════════════════════╣
    ║                                       ║
    ║    ╔═══════════════════════╗          ║
    ║    ║   CONFERENCE TABLE    ║          ║
    ║    ║  ┌───────────────┐    ║          ║
    ║    ║  │   [DEVICE] ●  │    ║  ○ ○ ○   ║
    ║    ║  │    ▼ ▼ ▼  ↑   │    ║  CHAIRS  ║
    ║    ║  └───────────PHOENIX─┘           ║
    ║    ╚═══════════════════════╝          ║
    ║                              [WINDOW] ║
    ╚═══════════════════════════════════════╝
        ⚠ PHOENIX AT DEVICE - READY ⚠`
            ]
        },

        bomb: {
            frames: [
`    ╔═══════════════════════════════════════╗
    ║       IED DEVICE - CLOSE UP FEED      ║
    ╠═══════════════════════════════════════╣
    ║                                       ║
    ║      ┌─────────────────────────┐      ║
    ║      │  ╔═══╗   ┌──────────┐   │      ║
    ║      │  ║ ⏱ ║───│ C4 BLOCK │   │      ║
    ║      │  ╚═══╝   └──────────┘   │      ║
    ║      │   ││││                  │      ║
    ║      │   ████  WIRE HARNESS    │      ║
    ║      │  R R B B G G            │      ║
    ║      │  │ │ │ │ │ │            │      ║
    ║      └─────────────────────────┘      ║
    ╚═══════════════════════════════════════╝
      TIMER: [ACTIVE]  WIRES: 6B 7R 2G`,
`    ╔═══════════════════════════════════════╗
    ║       IED DEVICE - CLOSE UP FEED      ║
    ╠═══════════════════════════════════════╣
    ║                                       ║
    ║      ┌─────────────────────────┐      ║
    ║      │  ╔═══╗   ┌──────────┐   │      ║
    ║      │  ║⏱⏱⏱║───│ C4 BLOCK │   │      ║
    ║      │  ╚═══╝   └──────────┘   │      ║
    ║      │   ││││       *    *     │      ║
    ║      │   ████  WIRE HARNESS    │      ║
    ║      │  R R B B G G    *       │      ║
    ║      │  │ │ │ │ │ │            │      ║
    ║      └─────────────────────────┘      ║
    ╚═══════════════════════════════════════╝
      TIMER: [CRITICAL]  ⚠ SPARKING ⚠`
            ],
            phoenixFrames: [
`    ╔═══════════════════════════════════════╗
    ║       IED DEVICE - CLOSE UP FEED      ║
    ╠═══════════════════════════════════════╣
    ║    ┌──── PHOENIX HANDS ────┐          ║
    ║    │ ┌─────────────────────────┐      ║
    ║    ▼ │  ╔═══╗   ┌──────────┐   │      ║
    ║  ════>║ ⏱ ║───│ C4 BLOCK │   │      ║
    ║      │  ╚═══╝   └──────────┘   │      ║
    ║      │   ││││                  │      ║
    ║      │   ████  WIRE HARNESS    │      ║
    ║      │  R R B B G G            │      ║
    ║  ✂───┼──│ │ │ │ │ │            │      ║
    ║      └─────────────────────────┘      ║
    ╚═══════════════════════════════════════╝
    PHOENIX: "Wire cutters ready. Awaiting code."`
            ],
            defuseFrames: [
`    ╔═══════════════════════════════════════╗
    ║       IED DEVICE - CLOSE UP FEED      ║
    ╠═══════════════════════════════════════╣
    ║                                       ║
    ║      ┌─────────────────────────┐      ║
    ║      │  ╔═══╗   ┌──────────┐   │      ║
    ║      │  ║ ⏱ ║───│ C4 BLOCK │   │      ║
    ║      │  ╚═══╝   └──────────┘   │      ║
    ║      │   ││││                  │      ║
    ║      │   ████  WIRE HARNESS    │      ║
    ║      │  X X X X G G    ✓       │      ║
    ║      │          │ │  DISARMED  │      ║
    ║      └─────────────────────────┘      ║
    ╚═══════════════════════════════════════╝
      ████ DEVICE NEUTRALIZED ████`
            ]
        },

        summit: {
            frames: [
`    ╔═══════════════════════════════════════╗
    ║     BALLROOM - CEO SUMMIT VENUE       ║
    ╠═══════════════════════════════════════╣
    ║                                       ║
    ║   ┌─────────────────────────────────┐ ║
    ║   │          ┌─────────┐            │ ║
    ║   │  ○ ○ ○   │ PODIUM  │    ○ ○ ○   │ ║
    ║   │  ○ ○ ○   │  ████   │    ○ ○ ○   │ ║
    ║   │  ○ ○ ○   └─────────┘    ○ ○ ○   │ ║
    ║   │  ○ ○ ○                  ○ ○ ○   │ ║
    ║   │     47 EXECUTIVES PRESENT       │ ║
    ║   └─────────────────────────────────┘ ║
    ╚═══════════════════════════════════════╝
       SUMMIT STATUS: KEYNOTE IN PROGRESS`,
`    ╔═══════════════════════════════════════╗
    ║     BALLROOM - CEO SUMMIT VENUE       ║
    ╠═══════════════════════════════════════╣
    ║                                       ║
    ║   ┌─────────────────────────────────┐ ║
    ║   │          ┌─────────┐            │ ║
    ║   │  ● ○ ○   │ PODIUM  │    ○ ○ ○   │ ║
    ║   │  ○ ● ○   │  ████   │    ○ ● ○   │ ║
    ║   │  ○ ○ ●   └─────────┘    ● ○ ○   │ ║
    ║   │  ● ○ ○       ↑          ○ ○ ●   │ ║
    ║   │     47 EXECUTIVES PRESENT       │ ║
    ║   └─────────SPEAKER PRESENTING──────┘ ║
    ╚═══════════════════════════════════════╝
       ⚠ LIVES AT STAKE - TIME CRITICAL ⚠`
            ],
            safeFrames: [
`    ╔═══════════════════════════════════════╗
    ║     BALLROOM - CEO SUMMIT VENUE       ║
    ╠═══════════════════════════════════════╣
    ║                                       ║
    ║   ┌─────────────────────────────────┐ ║
    ║   │    ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓     │ ║
    ║   │    ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓     │ ║
    ║   │    ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓     │ ║
    ║   │    ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓ ✓     │ ║
    ║   │                                 │ ║
    ║   │      ALL 47 EXECUTIVES SAFE     │ ║
    ║   └─────────────────────────────────┘ ║
    ╚═══════════════════════════════════════╝
      ████ THREAT NEUTRALIZED - ALL CLEAR ████`
            ]
        },

        // Signal lost / static scene
        static: {
            frames: [
`    ╔═══════════════════════════════════════╗
    ║▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒║
    ║▒░▒▓░▒▓░▒▒░▓░▒▓░▒░▒▓░▒▓░▒▒░▓░▒▓░▒░▒▓░▒▒║
    ║▓░▒░▓▒░▓▒░▓░▒▓▒░▓░▒░▓▒░▓▒░▓░▒▓▒░▓░▒░▓▒░║
    ║▒▓░▒▒▓░▒▒░▓▒░▒▓▒░▒▓░▒▒▓░▒▒░▓▒░▒▓▒░▒▓░▒▒║
    ║░▒▓░▒▓░▒▒░▓░▒▓░▒░▒▓░▒▓░▒▒░▓░▒▓░▒░▒▓░▒▓░║
    ║▓░▒░▓▒░  SIGNAL LOST  ░▓▒░▓░▒░▓▒░▓▒░▓░▒║
    ║▒▓░▒▒▓░▒▒░▓▒░▒▓▒░▒▓░▒▒▓░▒▒░▓▒░▒▓▒░▒▓░▒▒║
    ║░▒▓░▒▓░▒▒░▓░▒▓░▒░▒▓░▒▓░▒▒░▓░▒▓░▒░▒▓░▒▓░║
    ║▓░▒░▓▒░▓▒░▓░▒▓▒░▓░▒░▓▒░▓▒░▓░▒▓▒░▓░▒░▓▒░║
    ║▒▓░▒▒▓░▒▒░▓▒░▒▓▒░▒▓░▒▒▓░▒▒░▓▒░▒▓▒░▒▓░▒▒║
    ║▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒║
    ╚═══════════════════════════════════════╝
          ⚠ RECONNECTING... ⚠`,
`    ╔═══════════════════════════════════════╗
    ║░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░║
    ║░▓░▒▓░▒░▓▒░▓░▒▓▒░▓░▒░▓░▒▓░▒░▓▒░▓░▒▓▒░▓░║
    ║▒░▓▒░▓▒░▒▓░▒▓▒░▒▓░▒░▓▒░▓▒░▒▓░▒▓▒░▒▓░▒░▓║
    ║░▓░▒░▓▒░▓░▒▓▒░▓░▒░▓░▒░▓▒░▓░▒▓▒░▓░▒░▓░▒░║
    ║▓▒░▓▒░▒▓░▒▓▒░▒▓░▒░▓▒░▓▒░▒▓░▒▓▒░▒▓░▒░▓▒░║
    ║░▓░▒░▓ NO SIGNAL ▒░▓░▒░▓▒░▓░▒▓▒░▓░▒░▓░▒║
    ║▓▒░▓▒░▒▓░▒▓▒░▒▓░▒░▓▒░▓▒░▒▓░▒▓▒░▒▓░▒░▓▒░║
    ║░▓░▒░▓▒░▓░▒▓▒░▓░▒░▓░▒░▓▒░▓░▒▓▒░▓░▒░▓░▒░║
    ║▒░▓▒░▓▒░▒▓░▒▓▒░▒▓░▒░▓▒░▓▒░▒▓░▒▓▒░▒▓░▒░▓║
    ║░▓░▒▓░▒░▓▒░▓░▒▓▒░▓░▒░▓░▒▓░▒░▓▒░▓░▒▓▒░▓░║
    ║░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░║
    ╚═══════════════════════════════════════╝
       INTERFERENCE DETECTED - STAND BY`
            ]
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // RADIO CHATTER MESSAGES
    // ═══════════════════════════════════════════════════════════════

    const RADIO_CHATTER = {
        idle: [
            "CONTROL: All units, status check.",
            "UNIT-3: Perimeter secure, no movement.",
            "CONTROL: Copy that. Stay frosty.",
            "UNIT-7: Eyes on service entrance. Clear.",
            "CONTROL: PHOENIX, what's your ETA?",
            "PHOENIX: Five minutes out. Traffic.",
            "CONTROL: Copy. BLACKSITE is online."
        ],
        approaching: [
            "PHOENIX: I'm in the building. Taking stairs.",
            "CONTROL: Roger. Elevator cameras are offline.",
            "PHOENIX: Smart. Less exposure.",
            "UNIT-3: I see him. Floor 1 corridor.",
            "CONTROL: BLACKSITE, track PHOENIX on cam.",
            "PHOENIX: Approaching Room 105 now."
        ],
        atDevice: [
            "PHOENIX: I'm at the device. It's CRIMSON.",
            "CONTROL: Confirmed. BLACKSITE is analyzing.",
            "PHOENIX: Timer shows under 3 minutes.",
            "CONTROL: Copy. Work fast, BLACKSITE.",
            "PHOENIX: Wire cutters ready. Need that code.",
            "PHOENIX: I count 6 blue, 7 red, 2 green.",
            "CONTROL: Green is the trap. Confirmed."
        ],
        critical: [
            "PHOENIX: ONE MINUTE! WHERE'S THAT CODE?!",
            "CONTROL: BLACKSITE, we need that sequence NOW!",
            "PHOENIX: I can hear the summit upstairs!",
            "CONTROL: 47 lives, BLACKSITE. Focus.",
            "PHOENIX: Thirty seconds! GIVE ME SOMETHING!",
            "CONTROL: Trust BLACKSITE. They've got this."
        ],
        success: [
            "PHOENIX: Code accepted! Cutting blue wires!",
            "PHOENIX: Blue wires cut. Moving to red.",
            "PHOENIX: Red wires cut. Timer stopped!",
            "CONTROL: CONFIRM DISARM! CONFIRM DISARM!",
            "PHOENIX: DEVICE NEUTRALIZED! WE'RE CLEAR!",
            "CONTROL: All units, threat neutralized!",
            "CONTROL: Outstanding work, BLACKSITE."
        ]
    };

    // ═══════════════════════════════════════════════════════════════
    // STATE
    // ═══════════════════════════════════════════════════════════════

    let state = {
        initialized: false,
        currentCamera: 'CAM-01',
        previousCamera: null,
        viewMode: 'normal', // normal, nightvision, thermal
        pipEnabled: false,
        pipCamera: 'CAM-03',
        animationFrame: 0,
        phoenixProgress: 0, // 0-4 (story stages)
        signalStrength: 100,
        motionDetected: false,
        container: null,
        glitchActive: false,
        autoCycle: false,
        autoCycleInterval: null,
        externalRadio: false // Use external radio panel
    };

    let elements = {};
    let callbacks = {
        onRadioMessage: null // External radio message handler
    };
    let intervals = {
        animation: null,
        chatter: null,
        glitch: null,
        motionClear: null
    };

    // ═══════════════════════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════════════════════

    function init(options = {}) {
        if (state.initialized) destroy();

        state.container = typeof options.container === 'string'
            ? document.querySelector(options.container)
            : options.container;

        if (!state.container) {
            console.error('[BlacksiteCCTV] Container not found');
            return false;
        }

        // External radio support
        state.externalRadio = options.externalRadio || false;
        callbacks.onRadioMessage = options.onRadioMessage || null;

        buildUI();
        bindEvents();
        startAnimation();
        startRandomGlitches();

        state.initialized = true;
        console.log('[BlacksiteCCTV] Initialized');

        return true;
    }

    function destroy() {
        Object.values(intervals).forEach(i => {
            if (i) clearInterval(i);
        });
        state.initialized = false;
    }

    // ═══════════════════════════════════════════════════════════════
    // UI CONSTRUCTION
    // ═══════════════════════════════════════════════════════════════

    function buildUI() {
        state.container.innerHTML = `
            <div class="cctv-system">
                <!-- Main Feed -->
                <div class="cctv-main-feed">
                    <div class="cctv-overlay-effects">
                        <div class="cctv-scanlines"></div>
                        <div class="cctv-vignette"></div>
                        <div class="cctv-glitch-overlay"></div>
                        <div class="cctv-static-overlay"></div>
                    </div>

                    <!-- Feed Header -->
                    <div class="cctv-feed-header">
                        <div class="cctv-rec-indicator">
                            <span class="cctv-rec-dot"></span>
                            <span>REC</span>
                        </div>
                        <div class="cctv-cam-info">
                            <span class="cctv-cam-id">CAM-01</span>
                            <span class="cctv-cam-name">CORRIDOR ALPHA</span>
                        </div>
                        <div class="cctv-timestamp"></div>
                    </div>

                    <!-- ASCII Scene Display -->
                    <div class="cctv-scene-container">
                        <pre class="cctv-scene-display"></pre>
                    </div>

                    <!-- Feed Footer -->
                    <div class="cctv-feed-footer">
                        <div class="cctv-location">FLOOR 1 - EAST WING</div>
                        <div class="cctv-signal">
                            <span class="cctv-signal-icon">📶</span>
                            <span class="cctv-signal-percent">100%</span>
                        </div>
                    </div>

                    <!-- Motion Alert -->
                    <div class="cctv-motion-alert">
                        <span>⚠ MOTION DETECTED</span>
                    </div>

                    <!-- Picture-in-Picture -->
                    <div class="cctv-pip">
                        <div class="cctv-pip-header">
                            <span class="cctv-pip-cam">CAM-03</span>
                            <button class="cctv-pip-close">×</button>
                        </div>
                        <pre class="cctv-pip-scene"></pre>
                    </div>
                </div>

                <!-- Control Bar -->
                <div class="cctv-controls">
                    <!-- Camera Selector -->
                    <div class="cctv-camera-grid">
                        <button class="cctv-cam-btn active" data-cam="CAM-01" title="Press 1">
                            <span class="cctv-cam-num">1</span>
                            <span class="cctv-cam-label">CORRIDOR</span>
                        </button>
                        <button class="cctv-cam-btn" data-cam="CAM-02" title="Press 2">
                            <span class="cctv-cam-num">2</span>
                            <span class="cctv-cam-label">ROOM 105</span>
                        </button>
                        <button class="cctv-cam-btn" data-cam="CAM-03" title="Press 3">
                            <span class="cctv-cam-num">3</span>
                            <span class="cctv-cam-label">DEVICE</span>
                        </button>
                        <button class="cctv-cam-btn" data-cam="CAM-04" title="Press 4">
                            <span class="cctv-cam-num">4</span>
                            <span class="cctv-cam-label">BALLROOM</span>
                        </button>
                    </div>

                    <!-- View Modes -->
                    <div class="cctv-view-modes">
                        <button class="cctv-mode-btn active" data-mode="normal" title="Normal View">
                            <span>📹</span>
                        </button>
                        <button class="cctv-mode-btn" data-mode="nightvision" title="Night Vision">
                            <span>🌙</span>
                        </button>
                        <button class="cctv-mode-btn" data-mode="thermal" title="Thermal">
                            <span>🔥</span>
                        </button>
                    </div>

                    <!-- Extra Controls -->
                    <div class="cctv-extra-controls">
                        <button class="cctv-ctrl-btn" data-action="pip" title="Picture-in-Picture">
                            <span>⧉</span> PIP
                        </button>
                        <button class="cctv-ctrl-btn" data-action="cycle" title="Auto-Cycle Cameras">
                            <span>🔄</span> CYCLE
                        </button>
                        <button class="cctv-ctrl-btn" data-action="zoom" title="Digital Zoom">
                            <span>🔍</span> ZOOM
                        </button>
                    </div>

                    <!-- PTZ Controls (cosmetic) -->
                    <div class="cctv-ptz">
                        <div class="cctv-ptz-grid">
                            <button class="cctv-ptz-btn" data-dir="up">▲</button>
                            <button class="cctv-ptz-btn" data-dir="left">◄</button>
                            <button class="cctv-ptz-btn cctv-ptz-center" data-dir="center">●</button>
                            <button class="cctv-ptz-btn" data-dir="right">►</button>
                            <button class="cctv-ptz-btn" data-dir="down">▼</button>
                        </div>
                        <span class="cctv-ptz-label">PAN/TILT</span>
                    </div>
                </div>

                <!-- Radio Chatter Display (hidden if using external radio) -->
                <div class="cctv-radio ${state.externalRadio ? 'hidden' : ''}">
                    <div class="cctv-radio-header">
                        <span class="cctv-radio-icon">📻</span>
                        <span>RADIO FEED</span>
                        <span class="cctv-radio-freq">CH-7 ENCRYPTED</span>
                    </div>
                    <div class="cctv-radio-log"></div>
                </div>
            </div>
        `;

        // Cache elements
        elements.scene = state.container.querySelector('.cctv-scene-display');
        elements.camId = state.container.querySelector('.cctv-cam-id');
        elements.camName = state.container.querySelector('.cctv-cam-name');
        elements.location = state.container.querySelector('.cctv-location');
        elements.timestamp = state.container.querySelector('.cctv-timestamp');
        elements.signalPercent = state.container.querySelector('.cctv-signal-percent');
        elements.motionAlert = state.container.querySelector('.cctv-motion-alert');
        elements.pip = state.container.querySelector('.cctv-pip');
        elements.pipScene = state.container.querySelector('.cctv-pip-scene');
        elements.pipCam = state.container.querySelector('.cctv-pip-cam');
        elements.glitchOverlay = state.container.querySelector('.cctv-glitch-overlay');
        elements.staticOverlay = state.container.querySelector('.cctv-static-overlay');
        elements.radioLog = state.container.querySelector('.cctv-radio-log');
        elements.mainFeed = state.container.querySelector('.cctv-main-feed');
        elements.camButtons = state.container.querySelectorAll('.cctv-cam-btn');
        elements.modeButtons = state.container.querySelectorAll('.cctv-mode-btn');

        // Initial render
        switchCamera('CAM-01', false);
        startTimestamp();
    }

    function bindEvents() {
        // Camera buttons
        elements.camButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                switchCamera(btn.dataset.cam, true);
            });
        });

        // View mode buttons
        elements.modeButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                setViewMode(btn.dataset.mode);
            });
        });

        // Control buttons
        state.container.querySelectorAll('.cctv-ctrl-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.dataset.action;
                if (action === 'pip') togglePIP();
                if (action === 'cycle') toggleAutoCycle();
                if (action === 'zoom') toggleZoom();
            });
        });

        // PIP close
        state.container.querySelector('.cctv-pip-close').addEventListener('click', () => {
            togglePIP(false);
        });

        // PTZ buttons (cosmetic movement effect)
        state.container.querySelectorAll('.cctv-ptz-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                triggerPTZEffect(btn.dataset.dir);
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyPress);
    }

    function handleKeyPress(e) {
        // Only handle if not typing in an input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        switch(e.key) {
            case '1': switchCamera('CAM-01', true); break;
            case '2': switchCamera('CAM-02', true); break;
            case '3': switchCamera('CAM-03', true); break;
            case '4': switchCamera('CAM-04', true); break;
            case 'n': setViewMode('nightvision'); break;
            case 't': setViewMode('thermal'); break;
            case 'p': togglePIP(); break;
            case 'c': toggleAutoCycle(); break;
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // CAMERA SWITCHING
    // ═══════════════════════════════════════════════════════════════

    function switchCamera(camId, withTransition = true) {
        if (!CAMERAS[camId]) return;

        state.previousCamera = state.currentCamera;
        state.currentCamera = camId;

        const cam = CAMERAS[camId];

        // Update UI
        elements.camId.textContent = camId;
        elements.camName.textContent = cam.name;
        elements.location.textContent = cam.location;

        // Update button states
        elements.camButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.cam === camId);
        });

        // Transition effect
        if (withTransition) {
            triggerStaticTransition();
        }

        // Render scene
        renderScene();
    }

    function triggerStaticTransition() {
        elements.staticOverlay.classList.add('active');
        state.signalStrength = 0;
        updateSignalDisplay();

        // Play static sound if audio available
        if (typeof BlacksiteAudio !== 'undefined') {
            BlacksiteAudio.static && BlacksiteAudio.static();
        }

        setTimeout(() => {
            elements.staticOverlay.classList.remove('active');
            state.signalStrength = 85 + Math.random() * 15;
            updateSignalDisplay();
        }, 300);
    }

    // ═══════════════════════════════════════════════════════════════
    // SCENE RENDERING
    // ═══════════════════════════════════════════════════════════════

    function renderScene() {
        const cam = CAMERAS[state.currentCamera];
        const sceneData = SCENES[cam.scene];
        if (!sceneData) return;

        // Determine which frame set to use based on story progress
        let frames;
        if (state.phoenixProgress >= 3 && cam.scene === 'bomb') {
            frames = sceneData.defuseFrames || sceneData.phoenixFrames || sceneData.frames;
        } else if (state.phoenixProgress >= 1 && sceneData.phoenixFrames) {
            frames = sceneData.phoenixFrames;
        } else {
            frames = sceneData.frames;
        }

        const frameIndex = state.animationFrame % frames.length;
        let content = frames[frameIndex];

        // Apply view mode filters
        content = applyViewModeFilter(content);

        elements.scene.textContent = content;

        // Update PIP if enabled
        if (state.pipEnabled) {
            renderPIPScene();
        }
    }

    function renderPIPScene() {
        const cam = CAMERAS[state.pipCamera];
        const sceneData = SCENES[cam.scene];
        if (!sceneData) return;

        const frames = sceneData.frames;
        const frameIndex = state.animationFrame % frames.length;

        // Show a simplified/smaller version
        elements.pipScene.textContent = frames[frameIndex].slice(0, 300) + '...';
        elements.pipCam.textContent = state.pipCamera;
    }

    function applyViewModeFilter(content) {
        if (state.viewMode === 'nightvision') {
            // Replace characters with green-tinted equivalents
            return content;
        } else if (state.viewMode === 'thermal') {
            // Replace with thermal-looking characters
            return content.replace(/░/g, '▒').replace(/▓/g, '█');
        }
        return content;
    }

    // ═══════════════════════════════════════════════════════════════
    // VIEW MODES
    // ═══════════════════════════════════════════════════════════════

    function setViewMode(mode) {
        state.viewMode = mode;

        elements.modeButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        elements.mainFeed.classList.remove('nightvision', 'thermal');
        if (mode !== 'normal') {
            elements.mainFeed.classList.add(mode);
        }

        renderScene();
    }

    // ═══════════════════════════════════════════════════════════════
    // PIP (Picture-in-Picture)
    // ═══════════════════════════════════════════════════════════════

    function togglePIP(force) {
        state.pipEnabled = force !== undefined ? force : !state.pipEnabled;
        elements.pip.classList.toggle('active', state.pipEnabled);

        if (state.pipEnabled) {
            // Set PIP to show device feed by default
            state.pipCamera = state.currentCamera === 'CAM-03' ? 'CAM-01' : 'CAM-03';
            renderPIPScene();
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // AUTO-CYCLE
    // ═══════════════════════════════════════════════════════════════

    function toggleAutoCycle() {
        state.autoCycle = !state.autoCycle;

        const btn = state.container.querySelector('[data-action="cycle"]');
        btn.classList.toggle('active', state.autoCycle);

        if (state.autoCycle) {
            state.autoCycleInterval = setInterval(() => {
                const cams = Object.keys(CAMERAS);
                const currentIndex = cams.indexOf(state.currentCamera);
                const nextIndex = (currentIndex + 1) % cams.length;
                switchCamera(cams[nextIndex], true);
            }, 5000);
        } else {
            clearInterval(state.autoCycleInterval);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // ZOOM (cosmetic)
    // ═══════════════════════════════════════════════════════════════

    function toggleZoom() {
        elements.scene.classList.toggle('zoomed');
    }

    // ═══════════════════════════════════════════════════════════════
    // PTZ EFFECT (cosmetic)
    // ═══════════════════════════════════════════════════════════════

    function triggerPTZEffect(direction) {
        const scene = elements.scene;
        scene.classList.add(`ptz-${direction}`);

        setTimeout(() => {
            scene.classList.remove(`ptz-${direction}`);
        }, 200);
    }

    // ═══════════════════════════════════════════════════════════════
    // GLITCH EFFECTS
    // ═══════════════════════════════════════════════════════════════

    function startRandomGlitches() {
        intervals.glitch = setInterval(() => {
            if (Math.random() < 0.1) { // 10% chance every 2 seconds
                triggerGlitch();
            }
        }, 2000);
    }

    function triggerGlitch() {
        if (state.glitchActive) return;

        state.glitchActive = true;
        elements.glitchOverlay.classList.add('active');

        // Random glitch duration
        const duration = 100 + Math.random() * 200;

        setTimeout(() => {
            elements.glitchOverlay.classList.remove('active');
            state.glitchActive = false;
        }, duration);
    }

    function triggerSignalLoss() {
        // Show static scene
        const staticFrames = SCENES.static.frames;
        elements.scene.textContent = staticFrames[Math.floor(Math.random() * staticFrames.length)];

        state.signalStrength = 0;
        updateSignalDisplay();

        // Recover after delay
        setTimeout(() => {
            state.signalStrength = 85 + Math.random() * 15;
            updateSignalDisplay();
            renderScene();
        }, 2000);
    }

    // ═══════════════════════════════════════════════════════════════
    // MOTION DETECTION
    // ═══════════════════════════════════════════════════════════════

    function triggerMotionAlert() {
        state.motionDetected = true;
        elements.motionAlert.classList.add('active');

        // Clear after 3 seconds
        clearTimeout(intervals.motionClear);
        intervals.motionClear = setTimeout(() => {
            elements.motionAlert.classList.remove('active');
            state.motionDetected = false;
        }, 3000);
    }

    // ═══════════════════════════════════════════════════════════════
    // RADIO CHATTER
    // ═══════════════════════════════════════════════════════════════

    function addRadioMessage(message, type = 'normal') {
        // If using external radio, forward to callback
        if (state.externalRadio && callbacks.onRadioMessage) {
            callbacks.onRadioMessage(message, type);
            return;
        }

        // Otherwise use internal radio log
        if (!elements.radioLog) return;

        const msgEl = document.createElement('div');
        msgEl.className = `cctv-radio-msg ${type}`;
        msgEl.innerHTML = `<span class="cctv-radio-time">${getShortTime()}</span> ${message}`;

        elements.radioLog.appendChild(msgEl);
        elements.radioLog.scrollTop = elements.radioLog.scrollHeight;

        // Limit messages
        while (elements.radioLog.children.length > 10) {
            elements.radioLog.removeChild(elements.radioLog.firstChild);
        }
    }

    function startRadioChatter(phase = 'idle') {
        clearInterval(intervals.chatter);

        const messages = RADIO_CHATTER[phase] || RADIO_CHATTER.idle;
        let index = 0;

        intervals.chatter = setInterval(() => {
            if (index < messages.length) {
                addRadioMessage(messages[index]);
                index++;
            } else {
                // Loop or stop
                index = 0;
            }
        }, 4000 + Math.random() * 3000);
    }

    // ═══════════════════════════════════════════════════════════════
    // STORY PROGRESSION
    // ═══════════════════════════════════════════════════════════════

    function setPhoenixProgress(stage) {
        state.phoenixProgress = stage;

        // Trigger appropriate events based on stage
        switch(stage) {
            case 1: // Phoenix approaching
                startRadioChatter('approaching');
                triggerMotionAlert();
                break;
            case 2: // Phoenix at device
                startRadioChatter('atDevice');
                switchCamera('CAM-03', true);
                break;
            case 3: // Critical time
                startRadioChatter('critical');
                triggerGlitch();
                break;
            case 4: // Success
                startRadioChatter('success');
                break;
        }

        renderScene();
    }

    // ═══════════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════════

    function startAnimation() {
        intervals.animation = setInterval(() => {
            state.animationFrame++;
            renderScene();
        }, 1500);
    }

    function startTimestamp() {
        const update = () => {
            const now = new Date();
            elements.timestamp.textContent = now.toISOString().replace('T', ' ').slice(0, 19);
        };
        update();
        setInterval(update, 1000);
    }

    function getShortTime() {
        const now = new Date();
        return now.toTimeString().slice(0, 8);
    }

    function updateSignalDisplay() {
        elements.signalPercent.textContent = `${Math.round(state.signalStrength)}%`;
    }

    // ═══════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════

    return {
        init,
        destroy,
        switchCamera,
        setViewMode,
        togglePIP,
        triggerGlitch,
        triggerSignalLoss,
        triggerMotionAlert,
        addRadioMessage,
        startRadioChatter,
        setPhoenixProgress,

        getState: () => ({ ...state }),
        isInitialized: () => state.initialized
    };

})();

if (typeof module !== 'undefined' && module.exports) {
    module.exports = BlacksiteCCTV;
}
