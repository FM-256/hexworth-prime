# Grep & Pipe Mastery - BLACKSITE Terminal

**Created:** January 23, 2026
**Completed:** January 25, 2026
**Status:** COMPLETE - Deployed v3.2.0
**Codename:** BLACKSITE

---

## Overview

The Grep & Pipe Mastery course teaches grep flags, regex patterns, and pipe chains through an immersive bomb defusal narrative. Users play as BLACKSITE analysts providing remote support to field agent PHOENIX who must defuse a bomb at the Meridian Hotel.

---

## Course Structure

### 7 Labs Total

| Lab | Type | Location | Purpose |
|-----|------|----------|---------|
| Grep Basics | Slide Mini-Lab | index.html Section 1 | Practice grep flags |
| Regex Patterns | Slide Mini-Lab | index.html Section 2 | Practice regex patterns |
| Pipe Chains | Slide Mini-Lab | index.html Section 3 | Practice pipe commands |
| GPM-TRACE | BLACKSITE Mission | CLHConfig.js | Trace RAVEN to Room 105 |
| GPM-DECODE | BLACKSITE Mission | CLHConfig.js | Decode CRIMSON wire protocol |
| GPM-EXTRACT | BLACKSITE Mission | CLHConfig.js | Extract wire counts via pipes |
| GPM-DEFUSE | BLACKSITE Mission | CLHConfig.js | Deliver disarm code to PHOENIX |

### Slide Mini-Labs (Practice Mode)
Located in `index.html`, these are embedded practice environments:
- Generic log file filesystems
- 8 objectives each
- No timer pressure
- Skill-building before main mission

### BLACKSITE Modules (Mission Mode)
Located in `CLHConfig.js`, these are the main narrative experience:
- Full bomb defusal story
- Countdown timers
- Insight questions as "wire cutting" moments
- Radio system for hints

---

## Narrative Elements

### Story Arc
1. **TRACE**: Intelligence intercepts reveal threat actor RAVEN targeting Meridian Hotel CEO Summit
2. **DECODE**: Decode CRIMSON wire protocol from encrypted transmissions
3. **EXTRACT**: Extract wire counts (6 BLUE, 7 RED, 2 GREEN) for field agent PHOENIX
4. **DEFUSE**: Deliver kill code 0230 (timer setting 02:30:00) to PHOENIX before detonation

### Key Characters
- **RAVEN**: Threat actor who planted the IED
- **PHOENIX**: Field agent on-site awaiting analyst support
- **GHOST-7**: Mysterious watcher who provides hints via radio

### Critical Data Points
- **Target Location**: Room 105 (IP: 192.168.1.105)
- **Wire Counts**: 6 BLUE (ground), 7 RED (primary), 2 GREEN (trap)
- **Defusal Sequence**: BLUE first, RED last, NEVER GREEN
- **Kill Code**: 0230 (derived from timer setting 02:30:00)

---

## Radio System ("The Watcher")

### Implementation
A tunable radio system that provides context-aware hints without tracking user progress (stateless).

### Commands
- `tune <freq>` - Tune to specific frequency
- `tune <name>` - Tune by channel name (e.g., `tune ghost`)
- `scan` - Scan all available frequencies
- `radio` - Alias for scan (no args) or tune (with args)

### Frequencies
| MHz | Name | Type | Content |
|-----|------|------|---------|
| 147.3 | STATIC | noise | White noise |
| 152.8 | SECURITY | ambient | Hotel security chatter |
| 156.1 | CONSORTIUM | lore | Encrypted enemy comms |
| 161.7 | GHOST-7 | hints | Context-aware hints |
| 173.5 | NUMBERS | easter | Creepy numbers station |
| 88.1 | EMERGENCY | solutions | Direct solutions (burns channel) |

### Discovery Paths
1. **Keyword triggers**: Typing `help`, `stuck`, or `sos` suggests tuning 161.7
2. **Hidden .signal files**: Each module has a hidden dead drop file with radio hints
3. **BRIEFING.txt**: Contains unofficial addendum mentioning 161.7 MHz

### Man Pages
Full man pages exist for `scan`, `tune`, and `radio` commands in CLHTerminal.js.

---

## Files Modified/Created

### Core Files
| File | Changes |
|------|---------|
| `CLHConfig.js` | GPM-TRACE, GPM-DECODE, GPM-EXTRACT, GPM-DEFUSE modules with filesystems, objectives, radio content, insight phases |
| `CLHTerminal.js` | Radio system (tune/scan/radio commands), keyword detection, channel broadcasts, man pages |
| `blacksite-demo.html` | Updated module IDs and tab labels |

### File Locations
- **Course**: `_app/houses/script/courses/grep-pipe-mastery/`
  - `index.html` - Main course with slide mini-labs
  - `blacksite-demo.html` - BLACKSITE mission launcher
- **Config**: `_app/components/CLHConfig.js` - Module definitions
- **Terminal**: `_app/components/CLHTerminal.js` - Terminal engine

---

## Insight Questions (Wire Cutting Moments)

### GPM-TRACE
**Question**: Based on your grep analysis, which IP address repeatedly accessed the admin panel and matches the "105" pattern from RAVEN's target room?

**Answer**: 192.168.1.105 (Room 105)

### GPM-DECODE
**Question**: The encrypted CRIMSON protocol revealed the wire cutting sequence. Based on your regex pattern analysis, what is the correct wire color order?

**Answer**: RED-RED-BLUE (matches repeated failure pattern)

### GPM-EXTRACT
**Question**: Your pipe analysis revealed the wire counts: 6 BLUE (ground), 7 RED (primary), 2 GREEN (trap). According to CRIMSON protocol, what's the correct defusal sequence?

**Answer**: BLUE first (isolate ground), then RED (disable primary), NEVER touch GREEN

### GPM-DEFUSE
**Question**: FINAL DISARM SEQUENCE. The bomb's failsafe requires a 4-digit code derived from your investigation. What is the disarm code?

**Answer**: 0230 (timestamp when root access was gained, 02:30:00)

---

## Solutions Reference

See `GPM_SOLUTIONS_GUIDE.md` for complete command solutions for all 7 labs.

---

## Technical Notes

### Timer Limits
- GPM-TRACE: 7 minutes (420s)
- GPM-DECODE: 6 minutes (360s)
- GPM-EXTRACT: 5 minutes (300s)
- GPM-DEFUSE: 4 minutes (240s)

### Stateless Design
The radio system is intentionally stateless:
- No tracking of attempts or progress
- Works correctly after page refresh
- Hints are context-aware based on current objective
- Emergency channel "burns" narratively but not mechanically

### Objective Checks
All objective check functions validate command patterns only (not output):
- Allows variations of correct commands
- Works on page refresh
- No hard-coded output dependencies

---

## Deployment

- **Version**: 3.2.0 "BLACKSITE"
- **Release Date**: January 25, 2026
- **Git Commit**: e0b2e9b
- **Firebase**: Deployed to hexworth-prime.web.app

---

## Archive

The original planning documents from January 23, 2026 have been superseded by this completed specification. The continuation prompt (`GPM_CONTINUATION_PROMPT.md`) has been deleted as it is no longer needed.

---

*Completed January 25, 2026*
