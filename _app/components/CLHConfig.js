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
                    children: ['Documents', 'missions', 'scripts', 'tools', '.bashrc', '.bash_history', '.classified']
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
                    content: `ssh handler@deadrop.onion
cat /etc/shadow
rm -rf /var/log/*
history -c
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
            },

            objectives: [
                {
                    id: 1,
                    task: 'RECON: Identify Operator',
                    hint: 'Identify your current user account: whoami',
                    check: (cmd, state) => cmd.trim() === 'whoami'
                },
                {
                    id: 2,
                    task: 'RECON: Locate Position',
                    hint: 'Determine your filesystem position: pwd',
                    check: (cmd, state) => cmd.trim() === 'pwd'
                },
                {
                    id: 3,
                    task: 'RECON: Identify Target System',
                    hint: 'Identify the hostname: hostname',
                    check: (cmd, state) => cmd.trim() === 'hostname'
                },
                {
                    id: 4,
                    task: 'SURVEY: Assess Environment',
                    hint: 'Survey your surroundings: ls',
                    check: (cmd, state) => cmd.trim() === 'ls' || cmd.startsWith('ls ')
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
                    children: ['Documents', 'intel', 'scripts', 'logs', '.bash_history', '.bashrc']
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
                    content: 'whoami\nls\ncd intel\ncat briefing.txt\n'
                },
                '/home/operator/.bashrc': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 24,
                    content: '# Operator shell config\n'
                },
            },

            objectives: [
                {
                    id: 1,
                    task: 'SURVEY: Map the Territory',
                    hint: 'Use ls to survey your current location',
                    check: (cmd, state) => cmd.trim() === 'ls' || cmd.startsWith('ls ')
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
                    check: (cmd, state) => cmd.includes('ls') && cmd.includes('-') &&
                                   (cmd.includes('l') && cmd.includes('a'))
                },
                {
                    id: 4,
                    task: 'EXTRACT: Read the Briefing',
                    hint: 'Access the briefing.txt file: cat briefing.txt',
                    check: (cmd, state) => cmd.trim() === 'cat briefing.txt' ||
                                   cmd.trim() === 'cat ./briefing.txt'
                },
                {
                    id: 5,
                    task: 'EXFIL: Return to Base',
                    hint: 'Navigate back to home: cd ~ (or cd)',
                    check: (cmd, state) => state.currentDir === '/home/operator'
                },
            ],

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
                    children: ['evidence', 'tools', '.bash_history']
                },
                '/home/operator/evidence': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['mystery.txt', 'notes.txt', 'README.txt']
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
                    content: 'ls\ncd evidence\ncat mystery.txt\n'
                },
            },

            objectives: [
                {
                    id: 1,
                    task: 'RECON: Survey the Evidence',
                    hint: 'Examine the evidence directory: ls evidence/',
                    check: (cmd, state) => cmd.includes('ls') && cmd.includes('evidence')
                },
                {
                    id: 2,
                    task: 'INTEL: Examine the Target File',
                    hint: 'Preview mystery.txt: cat evidence/mystery.txt',
                    check: (cmd, state) => cmd.includes('cat') && cmd.includes('mystery')
                },
                {
                    id: 3,
                    task: 'HUNT: Search for "Secret"',
                    hint: 'Use grep to find lines with "Secret"',
                    check: (cmd, state) => cmd.includes('grep') && (cmd.includes('Secret') || cmd.includes('secret'))
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
                    check: (cmd, state) => cmd.includes('grep') && cmd.includes('-n') &&
                                   (cmd.includes('Secret') || cmd.includes('Code'))
                },
            ],

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
                    children: ['analysis', 'tools', '.bash_history']
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
                    content: 'ls\ncd analysis\ncat processes.txt\n'
                },
            },

            objectives: [
                {
                    id: 1,
                    task: 'Locate the analysis directory',
                    hint: 'Try: ls',
                    check: (cmd, state) => cmd.trim() === 'ls' || cmd.trim().startsWith('ls ')
                },
                {
                    id: 2,
                    task: 'Enter the analysis directory',
                    hint: 'Try: cd analysis',
                    check: (cmd, state) => state.currentDir.includes('/analysis')
                },
                {
                    id: 3,
                    task: 'Review the process list',
                    hint: 'Try: cat processes.txt',
                    check: (cmd, state) => cmd.includes('cat') && cmd.includes('processes')
                },
                {
                    id: 4,
                    task: 'Find the anomaly with grep',
                    hint: 'Try: grep "unknown" processes.txt',
                    check: (cmd, state, output) => output && output.includes('unknown_process')
                },
                {
                    id: 5,
                    task: 'Confirm the threat by CPU usage',
                    hint: 'Try: grep "8.2" processes.txt',
                    check: (cmd, state, output) => cmd.includes('grep') && output && output.includes('8.2')
                },
            ],

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
                    children: ['logs', 'reports', '.bash_history', '.classified_memo']
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
                    children: []
                },
                '/home/operator/.bash_history': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 42,
                    content: 'ls\ncd logs\nhead system.log\n'
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
                    task: 'Locate log files',
                    hint: 'Try: ls',
                    check: (cmd, state) => cmd.trim() === 'ls' || cmd.trim().startsWith('ls ')
                },
                {
                    id: 2,
                    task: 'Enter the logs directory',
                    hint: 'Try: cd logs',
                    check: (cmd, state) => state.currentDir.includes('/logs')
                },
                {
                    id: 3,
                    task: 'Preview the system log',
                    hint: 'Try: head system.log',
                    check: (cmd, state) => cmd.includes('head') && cmd.includes('system')
                },
                {
                    id: 4,
                    task: 'Find all ERROR entries',
                    hint: 'Try: grep "ERROR" system.log',
                    check: (cmd, state, output) => cmd.includes('grep') && (cmd.toLowerCase().includes('error') || cmd.includes('ERROR')) && output && output.includes('ERROR')
                },
                {
                    id: 5,
                    task: 'Count error entries',
                    hint: 'Try: grep -c "ERROR" system.log',
                    check: (cmd, state) => cmd.includes('grep') && cmd.includes('-c') && (cmd.toLowerCase().includes('error') || cmd.includes('ERROR'))
                },
            ],

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
                    children: ['intel', 'temp', '.bash_history', '.dead_drop']
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
                '/home/operator/.bash_history': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 12,
                    content: ''
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
                    children: ['secure', 'public', '.shadow_network']
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
            },

            objectives: [
                {
                    id: 1,
                    task: 'Analyze current permissions',
                    hint: 'Try: ls -la secure/',
                    check: (cmd, state) => cmd.includes('ls') && cmd.includes('-l') && cmd.includes('secure')
                },
                {
                    id: 2,
                    task: 'Restrict secret.txt to 600',
                    hint: 'Try: chmod 600 secure/secret.txt',
                    check: (cmd, state) => cmd.includes('chmod') && cmd.includes('600') && cmd.includes('secret')
                },
                {
                    id: 3,
                    task: 'Make deploy.sh executable (755)',
                    hint: 'Try: chmod 755 secure/deploy.sh',
                    check: (cmd, state) => cmd.includes('chmod') && cmd.includes('755') && cmd.includes('deploy')
                },
                {
                    id: 4,
                    task: 'Verify permission changes',
                    hint: 'Try: ls -la secure/',
                    check: (cmd, state) => cmd.includes('ls') && cmd.includes('-l') && cmd.includes('secure')
                },
                {
                    id: 5,
                    task: 'Audit with stat command',
                    hint: 'Try: stat secure/audit.log',
                    check: (cmd, state) => cmd.includes('stat') && cmd.includes('audit')
                },
            ],

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
                    children: ['scripts', 'data', '.bash_history', '.exfil_protocol']
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
                    size: 0,
                    content: ''
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
            },

            objectives: [
                {
                    id: 1,
                    task: 'Examine existing scripts',
                    hint: 'Try: ls scripts/',
                    check: (cmd, state) => cmd.includes('ls') && cmd.includes('scripts')
                },
                {
                    id: 2,
                    task: 'Read the recon script',
                    hint: 'Try: cat scripts/recon.sh',
                    check: (cmd, state) => cmd.includes('cat') && cmd.includes('recon')
                },
                {
                    id: 3,
                    task: 'Execute the recon script',
                    hint: 'Try: bash scripts/recon.sh',
                    check: (cmd, state) => (cmd.includes('bash') || cmd.includes('./')) && cmd.includes('recon')
                },
                {
                    id: 4,
                    task: 'Run the backup script',
                    hint: 'Try: bash scripts/backup.sh',
                    check: (cmd, state) => (cmd.includes('bash') || cmd.includes('./')) && cmd.includes('backup')
                },
                {
                    id: 5,
                    task: 'Verify backup results',
                    hint: 'Try: ls -la',
                    check: (cmd, state) => cmd.includes('ls') && cmd.includes('-l')
                },
            ],

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
                    children: ['intel', 'reports', '.bash_history']
                },
                '/home/operator/intel': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['access.log', 'users.db', 'network.log']
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
TCP 172.16.0.23:61234 -> 10.0.0.5:80 TIME_WAIT`
                },
                '/home/operator/reports': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: []
                },
                '/home/operator/.bash_history': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 0,
                    content: ''
                },
            },

            objectives: [
                {
                    id: 1,
                    task: 'EXTRACT: Cut IP Addresses',
                    hint: 'Use cut to extract IPs: cut -d \' \' -f 1 intel/access.log',
                    check: (cmd, state) => cmd.includes('cut') && cmd.includes('-d') && cmd.includes('-f') &&
                               (cmd.includes('1') || cmd.includes('access'))
                },
                {
                    id: 2,
                    task: 'ORGANIZE: Sort the Log Entries',
                    hint: 'Sort the log: sort intel/access.log',
                    check: (cmd, state) => cmd.includes('sort') && cmd.includes('access')
                },
                {
                    id: 3,
                    task: 'ANALYZE: Count Unique IPs',
                    hint: 'Pipe commands: cut -d \' \' -f 1 intel/access.log | sort | uniq -c',
                    check: (cmd, state) => cmd.includes('uniq') && (cmd.includes('-c') || cmd.includes('sort'))
                },
                {
                    id: 4,
                    task: 'PARSE: Extract Usernames with AWK',
                    hint: 'Use awk: awk -F: \'{print $1}\' intel/users.db',
                    check: (cmd, state) => cmd.includes('awk') && (cmd.includes('print') || cmd.includes('users'))
                },
                {
                    id: 5,
                    task: 'SANITIZE: Redact IPs with SED',
                    hint: 'Use sed to replace IPs with [REDACTED]',
                    check: (cmd, state) => cmd.includes('sed') && cmd.includes('s/') &&
                               (cmd.includes('REDACTED') || cmd.includes('access'))
                },
            ],

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
                    children: ['intel', 'reports', '.bash_history']
                },
                '/home/operator/intel': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['access.log', 'targets.txt', 'notes.txt']
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
                    size: 56,
                    content: 'Analyst notes: Monitor 192.168.1.105 for persistence\n'
                },
                '/home/operator/reports': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['mission.log']
                },
                '/home/operator/reports/mission.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 0,
                    content: ''
                },
                '/home/operator/.bash_history': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 0,
                    content: ''
                },
            },

            objectives: [
                {
                    id: 1,
                    task: 'CAPTURE: Redirect Output to File',
                    hint: 'Save ls output: ls intel > reports/filelist.txt',
                    check: (cmd, state, output, terminal) => {
                        if (cmd.includes('>') && !cmd.includes('>>') && cmd.includes('reports')) {
                            return true;
                        }
                        return false;
                    }
                },
                {
                    id: 2,
                    task: 'APPEND: Add Timestamp to Log',
                    hint: 'Append date: date >> reports/mission.log',
                    check: (cmd, state) => cmd.includes('>>') && cmd.includes('mission.log')
                },
                {
                    id: 3,
                    task: 'PIPELINE: Filter and Count',
                    hint: 'Count 192.168 entries: grep "192.168" intel/access.log | wc -l',
                    check: (cmd, state) => cmd.includes('|') && cmd.includes('grep') &&
                               (cmd.includes('wc') || cmd.includes('access'))
                },
                {
                    id: 4,
                    task: 'CHAIN: Multi-Stage Pipeline',
                    hint: 'Extract and analyze: cut -d \' \' -f 1 intel/access.log | sort | uniq -c',
                    check: (cmd, state) => {
                        const pipeCount = (cmd.match(/\|/g) || []).length;
                        return pipeCount >= 2 && (cmd.includes('sort') || cmd.includes('uniq'));
                    }
                },
                {
                    id: 5,
                    task: 'TEE: Split the Stream',
                    hint: 'Output to screen AND file: ls -la intel | tee reports/inventory.txt',
                    check: (cmd, state) => cmd.includes('tee') && cmd.includes('reports')
                },
            ],

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
                    children: ['logs', 'reports', '.bash_history']
                },
                '/home/operator/logs': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['system.log', 'auth.log', 'network.log']
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
                '/home/operator/reports': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: []
                },
                '/home/operator/.bash_history': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 0,
                    content: ''
                },
            },

            objectives: [
                {
                    id: 1,
                    task: 'HUNT: Case-Insensitive Search',
                    hint: 'Find "error" (any case): grep -i "error" logs/system.log',
                    check: (cmd, state) => cmd.includes('grep') && cmd.includes('-i') &&
                               (cmd.toLowerCase().includes('error') || cmd.includes('system.log'))
                },
                {
                    id: 2,
                    task: 'EXCLUDE: Invert the Match',
                    hint: 'Show non-success lines: grep -v "success" logs/auth.log',
                    check: (cmd, state) => cmd.includes('grep') && cmd.includes('-v') &&
                               (cmd.includes('success') || cmd.includes('auth.log'))
                },
                {
                    id: 3,
                    task: 'COUNT: Quantify the Threat',
                    hint: 'Count FAILED logins: grep -c "FAILED" logs/auth.log',
                    check: (cmd, state) => cmd.includes('grep') && cmd.includes('-c') &&
                               (cmd.includes('FAILED') || cmd.includes('auth.log'))
                },
                {
                    id: 4,
                    task: 'LOCATE: Show Line Numbers',
                    hint: 'Show with line numbers: grep -n "192.168" logs/network.log',
                    check: (cmd, state) => cmd.includes('grep') && cmd.includes('-n') &&
                               (cmd.includes('192.168') || cmd.includes('network'))
                },
                {
                    id: 5,
                    task: 'REGEX: Match IP Pattern',
                    hint: 'Use regex: grep -E "[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+" logs/network.log',
                    check: (cmd, state) => (cmd.includes('grep') && cmd.includes('-E')) ||
                               cmd.includes('egrep') || (cmd.includes('[0-9]') && cmd.includes('\\.'))
                },
            ],

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
                    children: ['intel', '.bash_history']
                },
                '/home/operator/intel': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['targets.txt', 'scan_results.txt']
                },
                '/home/operator/intel/targets.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 98,
                    content: `10.0.0.5 - Primary server
10.0.0.10 - Database
10.0.0.15 - Web server
192.168.1.1 - Gateway`
                },
                '/home/operator/intel/scan_results.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 89,
                    content: `Port scan results:
22/tcp open ssh
80/tcp open http
443/tcp open https
3306/tcp open mysql`
                },
                '/home/operator/.bash_history': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 0,
                    content: ''
                },
            },

            objectives: [
                {
                    id: 1,
                    task: 'RECON: Check Host Connectivity',
                    hint: 'Test connectivity: ping 10.0.0.5',
                    check: (cmd, state) => cmd.includes('ping') && (cmd.includes('10.0.0.5') || cmd.includes('target'))
                },
                {
                    id: 2,
                    task: 'SCAN: List Listening Ports',
                    hint: 'Show listening ports: netstat -tuln',
                    check: (cmd, state) => cmd.includes('netstat') && (cmd.includes('-t') || cmd.includes('-u') || cmd.includes('-l'))
                },
                {
                    id: 3,
                    task: 'ANALYZE: Socket Statistics',
                    hint: 'Show connections: ss -tp',
                    check: (cmd, state) => cmd.includes('ss') && (cmd.includes('-t') || cmd.includes('-p'))
                },
                {
                    id: 4,
                    task: 'IDENTIFY: Show IP Configuration',
                    hint: 'Display IPs: ip addr',
                    check: (cmd, state) => cmd.includes('ip') && (cmd.includes('addr') || cmd.includes('a'))
                },
                {
                    id: 5,
                    task: 'MAP: View Routing Table',
                    hint: 'Show routes: ip route',
                    check: (cmd, state) => cmd.includes('ip') && cmd.includes('route')
                },
            ],

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
                    children: ['.bashrc', '.profile', '.bash_history']
                },
                '/home/operator/.bashrc': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 67,
                    content: '# Operator shell config\nexport PS1="\\u@\\h:\\w$ "\nalias ll="ls -la"\n'
                },
                '/home/operator/.profile': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 45,
                    content: '# Profile settings\nexport PATH=$PATH:$HOME/bin\n'
                },
                '/home/operator/.bash_history': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 0,
                    content: ''
                },
            },

            objectives: [
                {
                    id: 1,
                    task: 'SURVEY: List All Variables',
                    hint: 'Display all: env',
                    check: (cmd, state) => cmd.includes('env') || cmd.includes('printenv')
                },
                {
                    id: 2,
                    task: 'INSPECT: Check Your PATH',
                    hint: 'Show PATH: echo $PATH',
                    check: (cmd, state) => cmd.includes('echo') && cmd.includes('PATH')
                },
                {
                    id: 3,
                    task: 'IDENTIFY: Find Your Home',
                    hint: 'Show HOME: echo $HOME',
                    check: (cmd, state) => cmd.includes('echo') && cmd.includes('HOME')
                },
                {
                    id: 4,
                    task: 'CREATE: Set Mission Variable',
                    hint: 'Create variable: export MISSION=active',
                    check: (cmd, state) => cmd.includes('export') && cmd.includes('MISSION')
                },
                {
                    id: 5,
                    task: 'EXTEND: Add Tools to PATH',
                    hint: 'Extend PATH: export PATH=$PATH:/opt/shadow-tools',
                    check: (cmd, state) => cmd.includes('export') && cmd.includes('PATH') && cmd.includes('/opt')
                },
            ],

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
                    children: ['monitor.sh', 'intel', '.bash_history']
                },
                '/home/operator/monitor.sh': {
                    type: 'file',
                    perms: '-rwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    size: 98,
                    content: `#!/bin/bash
# Continuous monitoring script
while true; do
  date >> /tmp/monitor.log
  sleep 60
done`
                },
                '/home/operator/intel': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'operator',
                    group: 'operator',
                    children: ['processes.txt']
                },
                '/home/operator/intel/processes.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 134,
                    content: `Known malicious processes:
- rogue_agent (cryptominer)
- backdoor_shell (reverse shell)
- keylogger_x (keylogger)`
                },
                '/home/operator/.bash_history': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 0,
                    content: ''
                },
            },

            objectives: [
                {
                    id: 1,
                    task: 'SURVEY: List Running Processes',
                    hint: 'Show all processes: ps aux',
                    check: (cmd, state) => cmd.includes('ps') && (cmd.includes('aux') || cmd.includes('-ef') || cmd.includes('-e'))
                },
                {
                    id: 2,
                    task: 'HUNT: Find Suspicious Process',
                    hint: 'Filter processes: ps aux | grep rogue',
                    check: (cmd, state) => cmd.includes('ps') && cmd.includes('grep')
                },
                {
                    id: 3,
                    task: 'TERMINATE: Kill by PID',
                    hint: 'Kill process: kill 6666',
                    check: (cmd, state) => cmd.includes('kill') && cmd.includes('6666')
                },
                {
                    id: 4,
                    task: 'MANAGE: View Background Jobs',
                    hint: 'List jobs: jobs',
                    check: (cmd, state) => cmd.includes('jobs')
                },
                {
                    id: 5,
                    task: 'PERSIST: Run Immune to Hangup',
                    hint: 'Run persistent: nohup ./monitor.sh &',
                    check: (cmd, state) => cmd.includes('nohup')
                },
            ],

            remoteHosts: null,
        },

        // ──────────────────────────────────────────────────────────
        // CLH-015: Capstone Mission
        // Theme: Final comprehensive challenge
        // ──────────────────────────────────────────────────────────
        'CLH-015': {
            title: 'Capstone Mission',
            description: 'Operation Shadowstrike. Apply all skills to investigate a compromised server.',
            prerequisites: ['CLH-014'],
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
                    children: ['.bash_history']
                },
                '/home/operator/.bash_history': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 0,
                    content: ''
                },
                '/evidence': {
                    type: 'dir',
                    perms: 'drwxr-xr-x',
                    owner: 'root',
                    group: 'root',
                    children: ['access.log', 'auth.log', 'exfil.log', 'timeline.txt']
                },
                '/evidence/access.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'root',
                    group: 'root',
                    size: 678,
                    content: `192.168.1.105 - - [15/Jan/2024:03:42:15] "GET /index.html" 200
192.168.1.105 - - [15/Jan/2024:03:43:22] "GET /admin/login.php" 200
10.0.0.88 - - [15/Jan/2024:03:44:01] "POST /admin/login.php" 401
10.0.0.88 - - [15/Jan/2024:03:44:15] "POST /admin/login.php" 401
10.0.0.88 - - [15/Jan/2024:03:44:33] "POST /admin/login.php" 200
10.0.0.88 - - [15/Jan/2024:03:45:12] "GET /admin/users.php" 200
10.0.0.88 - - [15/Jan/2024:03:46:01] "POST /admin/export.php" 200
10.0.0.88 - - [15/Jan/2024:03:47:22] "POST /admin/upload.php" 200
10.0.0.88 - - [15/Jan/2024:03:48:45] "GET /admin/config.php" 200
192.168.1.42 - - [15/Jan/2024:03:50:01] "GET /index.html" 200`
                },
                '/evidence/auth.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'root',
                    group: 'root',
                    size: 456,
                    content: `Jan 15 03:42:01 shadow sshd[1234]: success login for admin from 192.168.1.105
Jan 15 03:43:15 shadow sshd[1235]: FAILED login for root from 10.0.0.88
Jan 15 03:43:22 shadow sshd[1235]: FAILED login for admin from 10.0.0.88
Jan 15 03:43:45 shadow sshd[1235]: FAILED login for operator from 10.0.0.88
Jan 15 03:44:01 shadow sshd[1235]: FAILED login for root from 10.0.0.88
Jan 15 03:44:33 shadow sshd[1236]: success login for admin from 10.0.0.88
Jan 15 03:50:15 shadow sshd[1237]: success login for operator from 192.168.1.42`
                },
                '/evidence/exfil.log': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'root',
                    group: 'root',
                    size: 378,
                    content: `2024-01-15 03:46:15 TRANSFER 10.0.0.88 -> external user_database.sql 15728640 bytes
2024-01-15 03:46:45 TRANSFER 10.0.0.88 -> external config_backup.tar 2097152 bytes
2024-01-15 03:47:22 TRANSFER 10.0.0.88 -> external ssh_keys.tar.gz 524288 bytes
2024-01-15 03:47:55 TRANSFER 10.0.0.88 -> external passwords.csv 1048576 bytes
2024-01-15 03:48:30 TRANSFER 10.0.0.88 -> external shadow_copy 4096 bytes`
                },
                '/evidence/timeline.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'root',
                    group: 'root',
                    size: 456,
                    content: `INCIDENT TIMELINE - Operation Shadowstrike
============================================
03:42 - Normal admin login from 192.168.1.105
03:43 - Brute force attempts begin from 10.0.0.88
03:44 - Attacker gains access via compromised credentials
03:45 - Reconnaissance of admin panel begins
03:46 - Mass data exfiltration initiated
03:47 - SSH keys and credentials stolen
03:48 - Configuration files accessed
03:50 - Legitimate user login (unaware of breach)
============================================
ATTACKER IP: 10.0.0.88
STATUS: ACTIVE THREAT`
                },
            },

            objectives: [
                {
                    id: 1,
                    task: 'PHASE 1: Initial Reconnaissance',
                    hint: 'Navigate to evidence: cd /evidence && ls -la',
                    check: (cmd, state) => (cmd.includes('cd') && cmd.includes('evidence')) ||
                               (cmd.includes('ls') && cmd.includes('evidence'))
                },
                {
                    id: 2,
                    task: 'PHASE 2: Log Analysis',
                    hint: 'Find POST requests: grep "POST" /evidence/access.log',
                    check: (cmd, state) => cmd.includes('grep') && cmd.includes('POST') && cmd.includes('access')
                },
                {
                    id: 3,
                    task: 'PHASE 3: Extract Attacker IPs',
                    hint: 'Extract unique IPs: grep FAILED /evidence/auth.log | cut -d " " -f 6 | sort | uniq',
                    check: (cmd, state) => cmd.includes('uniq') && (cmd.includes('auth') || cmd.includes('FAILED'))
                },
                {
                    id: 4,
                    task: 'PHASE 4: Identify Exfiltration',
                    hint: 'Find large transfers: grep -E "[0-9]{7,}" /evidence/exfil.log',
                    check: (cmd, state) => cmd.includes('grep') && cmd.includes('exfil')
                },
                {
                    id: 5,
                    task: 'PHASE 5: Generate Report',
                    hint: 'Save report: echo "Investigation Complete" > /evidence/report.txt',
                    check: (cmd, state) => cmd.includes('>') && cmd.includes('report')
                },
            ],

            remoteHosts: null,
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

        // Expose constants for debugging
        _MODULES: MODULES,
        _TIERS: TIERS,
    };

})();
