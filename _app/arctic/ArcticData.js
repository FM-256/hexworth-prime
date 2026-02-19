/**
 * ArcticData.js — Hexworth Prime Arctic Linux Content Hub
 *
 * Defines all factions, districts, and module mappings for the Arctic hub.
 * Module hrefs are relative from the district page depth:
 *   _app/arctic/districts/{name}/index.html
 * So all content paths start with ../../../houses/script/...
 *
 * Progress is tracked in localStorage as: hexworth_arctic_progress
 */

const ArcticData = {

    version: '1.0.0',

    // ---------------------------------------------------------------------------
    // Faction definitions — Penguin is always unlocked; Parrot and Dragon gate
    // on percentage completion of the preceding faction's districts.
    // ---------------------------------------------------------------------------
    factions: [
        {
            id: 'penguin',
            name: 'Penguin Collective',
            tagline: 'Understand the system.',
            description: 'Master the fundamentals: navigation, administration, scripting, and certification prep. No one defends or breaks what they do not first understand.',
            icon: '\u{1F427}',
            color: '#3a8ab0',
            colorBg: 'rgba(200,225,245,0.50)',
            colorBorder: 'rgba(100,180,220,0.25)',
            colorAccent: '#7ac4e8',
            unlockRequirement: null,          // always unlocked
            unlockThreshold: 0,
            districtCount: 5
        },
        {
            id: 'parrot',
            name: 'Parrot Division',
            tagline: 'Defend the system.',
            description: 'Blue team operations, hardening, log investigation, and incident response. You cannot defend what you have not first mastered.',
            icon: '\u{1F99C}',
            color: '#2a8a6a',
            colorBg: 'rgba(190,235,225,0.45)',
            colorBorder: 'rgba(60,180,140,0.25)',
            colorAccent: '#4ab89a',
            unlockRequirement: 'penguin',     // requires 60% of Penguin districts complete
            unlockThreshold: 0.60,
            districtCount: 3
        },
        {
            id: 'dragon',
            name: 'Dragon Order',
            tagline: 'Break the system.',
            description: 'Offensive security, enumeration, exploitation, and CTF mastery. The highest rank — earned only through the full journey.',
            icon: '\u{1F409}',
            color: '#a04040',
            colorBg: 'rgba(240,215,215,0.45)',
            colorBorder: 'rgba(180,80,80,0.20)',
            colorAccent: '#c05050',
            unlockRequirement: 'parrot',      // requires 60% of Parrot districts complete
            unlockThreshold: 0.60,
            districtCount: 3
        }
    ],

    // ---------------------------------------------------------------------------
    // District definitions — 11 total across 3 factions.
    // Each module entry has: id, title, type, href (relative from district page).
    // type: 'module' | 'lab' | 'applet' | 'quiz' | 'tool' | 'game' | 'review'
    // ---------------------------------------------------------------------------
    districts: [

        // -----------------------------------------------------------------------
        // PENGUIN FACTION — District 1: CLI Fundamentals
        // Core navigation, file ops, permissions, user management.
        // -----------------------------------------------------------------------
        {
            id: 'cli-fundamentals',
            name: 'CLI Fundamentals',
            faction: 'penguin',
            icon: '\u{1F4BB}',
            description: 'Your foundation in the frozen north. Master navigation, file operations, permissions, and user management before the blizzard hits.',
            lore: 'The first district every recruit passes through. Mayor Tux himself teaches navigation — because you cannot survive the Arctic without knowing the terrain.',
            difficulty: 1,
            modules: [
                // Linux Mastery course — introduction section
                { id: 'lm-01-welcome',      title: 'Welcome to Linux',        type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-01-welcome.module.html' },
                { id: 'lm-02-first-cmds',   title: 'First Commands',          type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-02-first-commands.module.html' },
                { id: 'lm-03-getting-help', title: 'Getting Help (man, --help)',type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-03-getting-help.module.html' },
                { id: 'lm-04-terminal-env', title: 'Terminal Environment',     type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-04-terminal-environment.module.html' },
                { id: 'lm-05-s1-practice',  title: 'Section 1 Practice',      type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-05-section1-practice.module.html' },
                { id: 'lm-06-navigation',   title: 'Navigation Deep Dive',     type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-06-navigation.module.html' },
                { id: 'lm-07-listing',      title: 'Listing Files (ls)',       type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-07-listing-files.module.html' },
                { id: 'lm-08-file-ops',     title: 'File Operations',          type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-08-file-operations.module.html' },
                { id: 'lm-09-copy-move',    title: 'Copy, Move, Remove',       type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-09-copy-move.module.html' },
                // CLH applets
                { id: 'clh-001-applet',     title: 'CLH-001: Intro to Hacker CLI', type: 'applet', href: '../../../houses/script/applets/linux/script-clh-001-intro-to-hacker-cli.applet.html' },
                { id: 'clh-002-applet',     title: 'CLH-002: Navigation Recon',    type: 'applet', href: '../../../houses/script/applets/linux/script-clh-002-navigation-recon.applet.html' },
                { id: 'clh-006-applet',     title: 'CLH-006: File Operations',     type: 'applet', href: '../../../houses/script/applets/linux/script-clh-006-file-operations.applet.html' },
                { id: 'clh-007-applet',     title: 'CLH-007: Permissions',         type: 'applet', href: '../../../houses/script/applets/linux/script-clh-007-permissions.applet.html' },
                // Labs
                { id: 'lab-nav-drill',      title: 'Navigation Drill',             type: 'lab', href: '../../../houses/script/labs/linux/script-linux-nav-drill.lab.html' },
                { id: 'lab-mkdir-drill',    title: 'Directory Creation Drill',     type: 'lab', href: '../../../houses/script/labs/linux/script-linux-mkdir-drill.lab.html' },
                { id: 'lab-file-ops',       title: 'File Operations Lab',          type: 'lab', href: '../../../houses/script/labs/linux/script-linux-file-ops.lab.html' },
                { id: 'lab-permissions',    title: 'Permissions Lab',              type: 'lab', href: '../../../houses/script/labs/linux/script-linux-permissions.lab.html' },
                { id: 'lab-permissions-drill', title: 'Permissions Drill',         type: 'lab', href: '../../../houses/script/labs/linux/script-linux-permissions-drill.lab.html' },
                { id: 'lab-users',          title: 'Users Lab',                    type: 'lab', href: '../../../houses/script/labs/linux/script-linux-users.lab.html' },
                // Mission labs
                { id: 'mission-file-ops',   title: 'Mission: File Operations',     type: 'lab', href: '../../../houses/script/linux/labs/script-mission-file-operations.lab.html' },
                { id: 'mission-perms',      title: 'Mission: Permissions',         type: 'lab', href: '../../../houses/script/linux/labs/script-mission-permissions.lab.html' },
                // Tools
                { id: 'tool-directory',     title: 'Directory Reference Tool',     type: 'tool', href: '../../../houses/script/linux/tools/script-directory.tool.html' },
                { id: 'tool-permissions',   title: 'Permissions Calculator',       type: 'tool', href: '../../../houses/script/linux/tools/script-permission.tool.html' },
                // Quiz
                { id: 'quiz-linux-basics',  title: 'Linux Basics Quiz',            type: 'quiz', href: '../../../houses/script/quizzes/script-linux-basics.quiz.html' }
            ]
        },

        // -----------------------------------------------------------------------
        // PENGUIN FACTION — District 2: Shell Scripting
        // Bash basics, variables, conditionals, loops, functions.
        // -----------------------------------------------------------------------
        {
            id: 'shell-scripting',
            name: 'Shell Scripting',
            faction: 'penguin',
            icon: '\u{1F4DC}',
            description: 'Automate your way across the tundra. Learn Bash scripting from variables and conditionals to functions and real-world scripts.',
            lore: 'The scribes of the Arctic — those who write the spells. A Penguin who cannot script is merely a tourist.',
            difficulty: 2,
            modules: [
                { id: 'lm-41-first-script', title: 'Your First Script',           type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-41-first-script.module.html' },
                { id: 'lm-42-variables',    title: 'Variables',                    type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-42-variables.module.html' },
                { id: 'lm-43-user-input',   title: 'User Input & Read',            type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-43-user-input.module.html' },
                { id: 'lm-44-conditionals', title: 'Conditionals (if/case)',       type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-44-conditionals.module.html' },
                { id: 'lm-45-loops',        title: 'Loops (for/while/until)',      type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-45-loops.module.html' },
                { id: 'lm-46-functions',    title: 'Functions',                    type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-46-functions.module.html' },
                { id: 'lm-47-practical',    title: 'Practical Scripts',            type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-47-practical-scripts.module.html' },
                { id: 'lm-48-s7-practice',  title: 'Section 7 Practice',          type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-48-section7-practice.module.html' },
                { id: 'clh-008-applet',     title: 'CLH-008: Shell Scripting',     type: 'applet', href: '../../../houses/script/applets/linux/script-clh-008-shell-scripting.applet.html' },
                { id: 'lab-bash-basics',    title: 'Bash Basics Lab',              type: 'lab', href: '../../../houses/script/labs/linux/script-bash-basics.lab.html' },
                { id: 'lab-bash-vars-drill',title: 'Variables Drill',              type: 'lab', href: '../../../houses/script/labs/linux/script-bash-variables-drill.lab.html' },
                { id: 'lab-bash-conditionals',title: 'Conditionals Lab',           type: 'lab', href: '../../../houses/script/labs/linux/script-bash-conditionals.lab.html' },
                { id: 'lab-bash-cond-drill',title: 'Conditions Drill',             type: 'lab', href: '../../../houses/script/labs/linux/script-bash-conditions-drill.lab.html' },
                { id: 'lab-bash-loops',     title: 'Loops Lab',                    type: 'lab', href: '../../../houses/script/labs/linux/script-bash-loops.lab.html' },
                { id: 'lab-bash-loops-drill',title: 'Loops Drill',                 type: 'lab', href: '../../../houses/script/labs/linux/script-bash-loops-drill.lab.html' },
                { id: 'lab-bash-functions', title: 'Functions Lab',                type: 'lab', href: '../../../houses/script/labs/linux/script-bash-functions.lab.html' },
                { id: 'lab-bash-arrays',    title: 'Arrays Lab',                   type: 'lab', href: '../../../houses/script/labs/linux/script-bash-arrays.lab.html' },
                { id: 'lab-bash-cron',      title: 'Cron Setup Lab',               type: 'lab', href: '../../../houses/script/labs/linux/script-bash-cron.lab.html' },
                { id: 'lab-bash-cron-prep', title: 'Cron Prep Lab',                type: 'lab', href: '../../../houses/script/labs/linux/script-bash-cron-setup-prep.lab.html' },
                { id: 'applet-bash-playground',title: 'Bash Scripting Playground', type: 'applet', href: '../../../houses/script/applets/linux/script-bash-scripting-playground.applet.html' },
                { id: 'quiz-bash',          title: 'Linux Bash Quiz',              type: 'quiz', href: '../../../houses/script/quizzes/script-linux-bash.quiz.html' }
            ]
        },

        // -----------------------------------------------------------------------
        // PENGUIN FACTION — District 3: Text Processing
        // Grep, pipes, awk, sed, I/O redirection.
        // -----------------------------------------------------------------------
        {
            id: 'text-processing',
            name: 'Text Processing',
            faction: 'penguin',
            icon: '\u{1F50D}',
            description: 'The art of reading between the frozen lines. Grep, sed, awk, pipes, and redirection — the tools every Linux operator lives by.',
            lore: 'In the Arctic, signals are buried in noise. The text processors are the ones who find the signal.',
            difficulty: 2,
            modules: [
                { id: 'lm-10-viewing',      title: 'Viewing Files (cat/less/more)', type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-10-viewing-files.module.html' },
                { id: 'lm-13-grep-basics',  title: 'Grep Basics',                  type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-13-grep-basics.module.html' },
                { id: 'lm-14-regex',        title: 'Regular Expressions',          type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-14-regular-expressions.module.html' },
                { id: 'lm-15-sed',          title: 'Sed Editor',                   type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-15-sed-editor.module.html' },
                { id: 'lm-16-awk',          title: 'AWK Processing',               type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-16-awk-processing.module.html' },
                { id: 'lm-17-sort-uniq',    title: 'Sort & Uniq',                  type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-17-sort-uniq.module.html' },
                { id: 'lm-18-cut-paste',    title: 'Cut & Paste',                  type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-18-cut-paste.module.html' },
                { id: 'lm-19-text-pipelines',title: 'Text Pipelines',              type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-19-text-pipelines.module.html' },
                { id: 'lm-20-s3-practice',  title: 'Section 3 Practice',          type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-20-section3-practice.module.html' },
                { id: 'clh-003-applet',     title: 'CLH-003: Pattern Hunting',     type: 'applet', href: '../../../houses/script/applets/linux/script-clh-003-pattern-hunting.applet.html' },
                { id: 'clh-009-applet',     title: 'CLH-009: Text Processing',     type: 'applet', href: '../../../houses/script/applets/linux/script-clh-009-text-processing.applet.html' },
                { id: 'clh-010-applet',     title: 'CLH-010: I/O Redirection',     type: 'applet', href: '../../../houses/script/applets/linux/script-clh-010-io-redirection.applet.html' },
                { id: 'clh-011-applet',     title: 'CLH-011: Advanced Grep',       type: 'applet', href: '../../../houses/script/applets/linux/script-clh-011-advanced-grep.applet.html' },
                { id: 'lab-bash-pipes',     title: 'Pipes Lab',                    type: 'lab', href: '../../../houses/script/labs/linux/script-bash-pipes.lab.html' },
                { id: 'lab-bash-io',        title: 'I/O Redirection Lab',          type: 'lab', href: '../../../houses/script/labs/linux/script-bash-io-redirect.lab.html' },
                { id: 'lab-bash-io-drill',  title: 'Redirect Drill',               type: 'lab', href: '../../../houses/script/labs/linux/script-bash-redirect-drill.lab.html' },
                { id: 'lab-text-viewing',   title: 'Text Viewing Lab',             type: 'lab', href: '../../../houses/script/labs/linux/script-linux-text-viewing.lab.html' },
                { id: 'lab-viewing-drill',  title: 'Viewing Drill',                type: 'lab', href: '../../../houses/script/labs/linux/script-linux-viewing-drill.lab.html' },
                { id: 'lab-wildcards',      title: 'Wildcards Lab',                type: 'lab', href: '../../../houses/script/labs/linux/script-linux-wildcards.lab.html' },
                { id: 'mission-text-view',  title: 'Mission: Text Viewing',        type: 'lab', href: '../../../houses/script/linux/labs/script-mission-text-viewing.lab.html' },
                { id: 'review-regex-runner',title: 'Regex Runner (Game)',          type: 'review', href: '../../../houses/script/reviews/regex-runner.html' },
                { id: 'tool-linux-cmd',     title: 'Linux Command Reference',      type: 'tool', href: '../../../houses/script/tools/script-linux-command.tool.html' }
            ]
        },

        // -----------------------------------------------------------------------
        // PENGUIN FACTION — District 4: SysAdmin
        // Processes, services, cron, packages, disk management.
        // -----------------------------------------------------------------------
        {
            id: 'sysadmin',
            name: 'System Administration',
            faction: 'penguin',
            icon: '\u{1F5A5}',
            description: 'Keep the Arctic running. Manage processes, services, cron jobs, packages, and disks — the core skills of any Linux sysadmin.',
            lore: 'The engineers who keep the ice generators running. Without them, the entire Arctic grinds to a frozen halt.',
            difficulty: 3,
            modules: [
                { id: 'lm-21-users-groups', title: 'Users & Groups',              type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-21-users-groups.module.html' },
                { id: 'lm-22-file-perms',   title: 'File Permissions',            type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-22-file-permissions.module.html' },
                { id: 'lm-23-chmod',        title: 'chmod',                       type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-23-chmod.module.html' },
                { id: 'lm-24-chown',        title: 'chown',                       type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-24-chown.module.html' },
                { id: 'lm-25-sudo',         title: 'sudo & Privilege Escalation', type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-25-sudo.module.html' },
                { id: 'lm-28-process-basics',title: 'Process Basics',             type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-28-process-basics.module.html' },
                { id: 'lm-29-ps-top',       title: 'ps, top, htop',               type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-29-ps-top.module.html' },
                { id: 'lm-30-bg-jobs',      title: 'Background Jobs',             type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-30-background-jobs.module.html' },
                { id: 'lm-31-signals',      title: 'Signals & Kill',              type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-31-signals-kill.module.html' },
                { id: 'lm-32-cron',         title: 'Cron Jobs',                   type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-32-cron.module.html' },
                { id: 'lm-33-systemd',      title: 'Systemd & Services',          type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-33-systemd.module.html' },
                { id: 'lm-51-packages',     title: 'Package Management',          type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-51-package-management.module.html' },
                { id: 'clh-004-applet',     title: 'CLH-004: Process Investigation', type: 'applet', href: '../../../houses/script/applets/linux/script-clh-004-process-investigation.applet.html' },
                { id: 'clh-014-applet',     title: 'CLH-014: Process Control',    type: 'applet', href: '../../../houses/script/applets/linux/script-clh-014-process-control.applet.html' },
                { id: 'clh-023-applet',     title: 'CLH-023: Services',           type: 'applet', href: '../../../houses/script/applets/linux/script-clh-023-services.applet.html' },
                { id: 'clh-024-applet',     title: 'CLH-024: Cron',               type: 'applet', href: '../../../houses/script/applets/linux/script-clh-024-cron.applet.html' },
                { id: 'clh-025-applet',     title: 'CLH-025: Packages',           type: 'applet', href: '../../../houses/script/applets/linux/script-clh-025-packages.applet.html' },
                { id: 'lab-process-drill',  title: 'Process Drill',               type: 'lab', href: '../../../houses/script/labs/linux/script-linux-process-drill.lab.html' },
                { id: 'lab-process-lifecycle',title: 'Process Lifecycle Lab',     type: 'lab', href: '../../../houses/script/labs/linux/script-linux-process-lifecycle.lab.html' },
                { id: 'lab-process-mgmt',   title: 'Process Management Lab',      type: 'lab', href: '../../../houses/script/labs/linux/script-linux-process-mgmt.lab.html' },
                { id: 'lab-service-drill',  title: 'Service Drill',               type: 'lab', href: '../../../houses/script/labs/linux/script-linux-service-drill.lab.html' },
                { id: 'lab-service-mgmt',   title: 'Service Management Lab',      type: 'lab', href: '../../../houses/script/labs/linux/script-linux-service-mgmt.lab.html' },
                { id: 'lab-systemctl',      title: 'Systemctl Lab',               type: 'lab', href: '../../../houses/script/labs/linux/script-linux-systemctl.lab.html' },
                { id: 'lab-package-mgmt',   title: 'Package Management Lab',      type: 'lab', href: '../../../houses/script/labs/linux/script-linux-package-mgmt.lab.html' },
                { id: 'lab-disk-mgmt',      title: 'Disk Management Lab',         type: 'lab', href: '../../../houses/script/labs/linux/script-linux-disk-mgmt.lab.html' },
                { id: 'lab-disk-drill',     title: 'Disk Drill',                  type: 'lab', href: '../../../houses/script/labs/linux/script-linux-disk-drill.lab.html' },
                { id: 'lab-compression',    title: 'Compression & Archives',      type: 'lab', href: '../../../houses/script/labs/linux/script-linux-compression.lab.html' },
                { id: 'tool-process',       title: 'Process Reference Tool',      type: 'tool', href: '../../../houses/script/linux/tools/script-process.tool.html' },
                { id: 'tool-service',       title: 'Service Reference Tool',      type: 'tool', href: '../../../houses/script/linux/tools/script-service.tool.html' },
                { id: 'tool-process-mgmt',  title: 'Process Management Tool',     type: 'tool', href: '../../../houses/script/tools/script-process-management.tool.html' },
                { id: 'tool-package-mgr',   title: 'Package Manager Reference',   type: 'tool', href: '../../../houses/script/tools/script-package-manager.tool.html' },
                { id: 'quiz-sysadmin',      title: 'SysAdmin Quiz',               type: 'quiz', href: '../../../houses/script/quizzes/script-sysadmin.quiz.html' },
                { id: 'game-dont-kill',     title: "Don't Kill the Server (Game)", type: 'game', href: '../../../houses/script/games/dont-kill-the-server.html' }
            ]
        },

        // -----------------------------------------------------------------------
        // PENGUIN FACTION — District 5: Cert Prep
        // Linux+ certification track (CompTIA LX0-103/104, XK0-005).
        // -----------------------------------------------------------------------
        {
            id: 'cert-prep',
            name: 'Cert Prep',
            faction: 'penguin',
            icon: '\u{1F4CB}',
            description: 'The final Penguin district. Advanced Linux topics aligned to CompTIA Linux+ — environment management, storage, access control, monitoring, and Vim.',
            lore: 'The certification vault at the heart of the Penguin Collective. Earn your rank before venturing to the Parrot Division.',
            difficulty: 4,
            modules: [
                { id: 'clh-016-applet',     title: 'CLH-016: System Intelligence', type: 'applet', href: '../../../houses/script/applets/linux/script-clh-016-system-intel.applet.html' },
                { id: 'clh-017-applet',     title: 'CLH-017: Find & Locate',       type: 'applet', href: '../../../houses/script/applets/linux/script-clh-017-find-locate.applet.html' },
                { id: 'clh-018-applet',     title: 'CLH-018: Archive Operations',  type: 'applet', href: '../../../houses/script/applets/linux/script-clh-018-archive-ops.applet.html' },
                { id: 'clh-019-applet',     title: 'CLH-019: Disk Forensics',      type: 'applet', href: '../../../houses/script/applets/linux/script-clh-019-disk-forensics.applet.html' },
                { id: 'clh-020-applet',     title: 'CLH-020: User Recon',          type: 'applet', href: '../../../houses/script/applets/linux/script-clh-020-user-recon.applet.html' },
                { id: 'clh-026-applet',     title: 'CLH-026: Access Control',      type: 'applet', href: '../../../houses/script/applets/linux/script-clh-026-access.applet.html' },
                { id: 'clh-027-applet',     title: 'CLH-027: Users (Advanced)',    type: 'applet', href: '../../../houses/script/applets/linux/script-clh-027-users.applet.html' },
                { id: 'clh-028-applet',     title: 'CLH-028: Monitoring',          type: 'applet', href: '../../../houses/script/applets/linux/script-clh-028-monitoring.applet.html' },
                { id: 'clh-029-applet',     title: 'CLH-029: Vim',                 type: 'applet', href: '../../../houses/script/applets/linux/script-clh-029-vim.applet.html' },
                { id: 'clh-030-applet',     title: 'CLH-030: Chimera (Capstone)',  type: 'applet', href: '../../../houses/script/applets/linux/script-clh-030-chimera.applet.html' },
                { id: 'clh-031-applet',     title: 'CLH-031: Blackout (Final)',    type: 'applet', href: '../../../houses/script/applets/linux/script-clh-031-blackout.applet.html' },
                { id: 'lm-26-special-perms',title: 'Special Permissions (SUID/SGID)', type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-26-special-permissions.module.html' },
                { id: 'lm-49-links',        title: 'Hard & Symbolic Links',        type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-49-links.module.html' },
                { id: 'lm-50-text-editors', title: 'Text Editors (Vim/Nano)',       type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-50-text-editors.module.html' },
                { id: 'lm-52-env-path',     title: 'Environment & PATH',           type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-52-environment-path.module.html' },
                { id: 'lm-53-next-steps',   title: 'Next Steps',                   type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-53-next-steps.module.html' },
                { id: 'lab-env-vars',       title: 'Environment Variables Lab',    type: 'lab', href: '../../../houses/script/labs/linux/script-linux-env-vars.lab.html' },
                { id: 'lab-links',          title: 'Links Lab',                    type: 'lab', href: '../../../houses/script/labs/linux/script-linux-links.lab.html' },
                { id: 'lab-file-search',    title: 'File Search Lab',              type: 'lab', href: '../../../houses/script/labs/linux/script-linux-file-search.lab.html' },
                { id: 'lab-find-drill',     title: 'Find Drill',                   type: 'lab', href: '../../../houses/script/labs/linux/script-linux-find-drill.lab.html' },
                { id: 'lab-disk-partition', title: 'Disk Partition Prep',          type: 'lab', href: '../../../houses/script/labs/linux/script-linux-disk-partition-prep.lab.html' },
                { id: 'review-terminal-vel',title: 'Terminal Velocity (Game)',     type: 'review', href: '../../../houses/script/reviews/terminal-velocity.html' },
                { id: 'review-perm-puzzle', title: 'Permission Puzzle (Game)',     type: 'review', href: '../../../houses/script/reviews/permission-puzzle.html' },
                { id: 'review-linux-cli',   title: 'Linux CLI Review',             type: 'review', href: '../../../houses/script/reviews/linux-cli-review.html' }
            ]
        },

        // -----------------------------------------------------------------------
        // PARROT FACTION — District 6: Log Analysis
        // Log investigation, forensics, SIEM basics.
        // -----------------------------------------------------------------------
        {
            id: 'log-analysis',
            name: 'Log Analysis',
            faction: 'parrot',
            icon: '\u{1F4CA}',
            description: 'The art of reading the ice — logs tell stories. Investigate system logs, track intruders, and feed your findings into SIEM workflows.',
            lore: 'The Parrot Division\'s first lesson: every action leaves a trace. The analysts who read logs are the ones who find the attackers.',
            difficulty: 3,
            modules: [
                { id: 'clh-005-applet',     title: 'CLH-005: Log Analysis',           type: 'applet', href: '../../../houses/script/applets/linux/script-clh-005-log-analysis.applet.html' },
                { id: 'clh-010-log-applet', title: 'CLH-010: I/O & Log Streams',      type: 'applet', href: '../../../houses/script/applets/linux/script-clh-010-io-redirection.applet.html' },
                { id: 'lab-log-analysis',   title: 'Log Analysis Lab',                type: 'lab', href: '../../../houses/script/labs/linux/script-linux-log-analysis.lab.html' },
                { id: 'lab-log-mission',    title: 'Mission: Log Analysis',           type: 'lab', href: '../../../houses/script/labs/linux/script-linux-log-analysis-mission.lab.html' },
                { id: 'lab-log-prep',       title: 'Log Analysis Prep',               type: 'lab', href: '../../../houses/script/labs/linux/script-linux-log-analysis-prep.lab.html' },
                { id: 'lab-log-invest-prep',title: 'Log Investigation Prep',          type: 'lab', href: '../../../houses/script/labs/linux/script-linux-log-investigation-prep.lab.html' },
                { id: 'tool-log-mgmt',      title: 'Log Management Tool',             type: 'tool', href: '../../../houses/script/tools/script-log-management.tool.html' }
            ]
        },

        // -----------------------------------------------------------------------
        // PARROT FACTION — District 7: Hardening
        // Security hardening, access control, firewall management.
        // -----------------------------------------------------------------------
        {
            id: 'hardening',
            name: 'System Hardening',
            faction: 'parrot',
            icon: '\u{1F6E1}',
            description: 'Fortify the perimeter. Learn Linux hardening — access controls, user privilege management, SSH hardening, and firewall configuration.',
            lore: 'The architects of the Arctic\'s ice walls. No attack succeeds against a properly hardened system.',
            difficulty: 4,
            modules: [
                { id: 'clh-026-hard-applet',title: 'CLH-026: Access Control',        type: 'applet', href: '../../../houses/script/applets/linux/script-clh-026-access.applet.html' },
                { id: 'clh-027-hard-applet',title: 'CLH-027: User Management',       type: 'applet', href: '../../../houses/script/applets/linux/script-clh-027-users.applet.html' },
                { id: 'clh-013-hard-applet',title: 'CLH-013: Environment Security',  type: 'applet', href: '../../../houses/script/applets/linux/script-clh-013-environment.applet.html' },
                { id: 'lab-ssh-hard',       title: 'SSH Lab',                        type: 'lab', href: '../../../houses/script/labs/linux/script-linux-ssh.lab.html' },
                { id: 'lab-network-config', title: 'Network Configuration Lab',      type: 'lab', href: '../../../houses/script/labs/linux/script-linux-network-config.lab.html' },
                { id: 'tool-perms-hard',    title: 'Permissions Reference Tool',     type: 'tool', href: '../../../houses/script/tools/script-linux-permissions.tool.html' },
                { id: 'game-sudo-flap',     title: 'Sudo Flap (Game)',               type: 'game', href: '../../../houses/script/games/sudo-flap.html' },
                { id: 'game-sudo-su',       title: 'sudo su (Game)',                 type: 'game', href: '../../../houses/script/games/sudo-su.html' },
                { id: 'game-chmod777',      title: 'Chmod 777 Adventure (Game)',     type: 'game', href: '../../../houses/script/games/text-adventure-chmod777.html' }
            ]
        },

        // -----------------------------------------------------------------------
        // PARROT FACTION — District 8: Incident Response
        // IR procedures, environment forensics, capstone labs.
        // -----------------------------------------------------------------------
        {
            id: 'incident-response',
            name: 'Incident Response',
            faction: 'parrot',
            icon: '\u{1F6A8}',
            description: 'When the breach happens, respond. CLH IR procedures, environment forensics, and the Parrot capstone scenario.',
            lore: 'The Parrot Division\'s final test. An incident has occurred — and only the most prepared analysts can contain it.',
            difficulty: 5,
            modules: [
                { id: 'clh-013-ir-applet',  title: 'CLH-013: Environment (IR Context)', type: 'applet', href: '../../../houses/script/applets/linux/script-clh-013-environment.applet.html' },
                { id: 'clh-015-applet',     title: 'CLH-015: Capstone',                 type: 'applet', href: '../../../houses/script/applets/linux/script-clh-015-capstone.applet.html' },
                { id: 'clh-016-ir-applet',  title: 'CLH-016: System Intelligence',      type: 'applet', href: '../../../houses/script/applets/linux/script-clh-016-system-intel.applet.html' },
                { id: 'clh-019-ir-applet',  title: 'CLH-019: Disk Forensics',           type: 'applet', href: '../../../houses/script/applets/linux/script-clh-019-disk-forensics.applet.html' },
                { id: 'clh-028-ir-applet',  title: 'CLH-028: Monitoring',               type: 'applet', href: '../../../houses/script/applets/linux/script-clh-028-monitoring.applet.html' },
                { id: 'lab-bash-log-proc',  title: 'Bash Log Processor Prep',           type: 'lab', href: '../../../houses/script/labs/linux/script-bash-log-processor-prep.lab.html' },
                { id: 'lab-sysadmin-ref',   title: 'SysAdmin Reference Lab',            type: 'lab', href: '../../../houses/script/labs/linux/script-linux-sysadmin-reference.lab.html' },
                { id: 'lab-file-mgmt-prep', title: 'File Management Prep',              type: 'lab', href: '../../../houses/script/labs/linux/script-linux-file-mgmt-prep.lab.html' }
            ]
        },

        // -----------------------------------------------------------------------
        // DRAGON FACTION — District 9: Offensive Tools
        // Kali/Parrot tools, enumeration, exploitation fundamentals.
        // -----------------------------------------------------------------------
        {
            id: 'offensive-tools',
            name: 'Offensive Tools',
            faction: 'dragon',
            icon: '\u{1F5E1}',
            description: 'Learn to think like the attacker. Enumeration, reconnaissance, and exploitation — the offensive side of the Linux command line.',
            lore: 'Dragon recruits study offense to understand defense at a level no textbook can teach. To break the system is to know the system.',
            difficulty: 5,
            modules: [
                { id: 'clh-002-off-applet', title: 'CLH-002: Navigation Recon',      type: 'applet', href: '../../../houses/script/applets/linux/script-clh-002-navigation-recon.applet.html' },
                { id: 'clh-003-off-applet', title: 'CLH-003: Pattern Hunting',       type: 'applet', href: '../../../houses/script/applets/linux/script-clh-003-pattern-hunting.applet.html' },
                { id: 'clh-016-off-applet', title: 'CLH-016: System Intelligence',   type: 'applet', href: '../../../houses/script/applets/linux/script-clh-016-system-intel.applet.html' },
                { id: 'lab-file-search-off',title: 'File Search Lab',                type: 'lab', href: '../../../houses/script/labs/linux/script-linux-file-search.lab.html' },
                { id: 'lab-mission-file-search', title: 'Mission: File Search',      type: 'lab', href: '../../../houses/script/linux/labs/script-mission-file-search.lab.html' },
                { id: 'game-shell-sprint',  title: 'Shell Sprint (Game)',            type: 'game', href: '../../../houses/script/games/shell-sprint.html' },
                { id: 'game-pipe-snake',    title: 'Pipe Snake (Game)',              type: 'game', href: '../../../houses/script/games/pipe-snake.html' }
            ]
        },

        // -----------------------------------------------------------------------
        // DRAGON FACTION — District 10: Network Operations
        // SSH deep dive, network recon, firewall ops.
        // -----------------------------------------------------------------------
        {
            id: 'network-ops',
            name: 'Network Operations',
            faction: 'dragon',
            icon: '\u{1F310}',
            description: 'The Arctic\'s communication layer. SSH operations, network reconnaissance, DNS investigation, and firewall control from the command line.',
            lore: 'Dragon operators must control the network. Lateral movement, tunneling, and scanning — the tradecraft of network-level offense.',
            difficulty: 5,
            modules: [
                { id: 'clh-012-applet',     title: 'CLH-012: Network Basics',        type: 'applet', href: '../../../houses/script/applets/linux/script-clh-012-network-basics.applet.html' },
                { id: 'clh-021-applet',     title: 'CLH-021: SSH Operations',        type: 'applet', href: '../../../houses/script/applets/linux/script-clh-021-ssh-ops.applet.html' },
                { id: 'clh-022-applet',     title: 'CLH-022: Network Recon',         type: 'applet', href: '../../../houses/script/applets/linux/script-clh-022-network-recon.applet.html' },
                { id: 'lm-35-network-info', title: 'Network Information',            type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-35-network-info.module.html' },
                { id: 'lm-36-connectivity', title: 'Connectivity Testing',           type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-36-connectivity.module.html' },
                { id: 'lm-37-dns',          title: 'DNS Tools (dig/nslookup)',       type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-37-dns-tools.module.html' },
                { id: 'lm-38-downloading',  title: 'Downloading (wget/curl)',        type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-38-downloading.module.html' },
                { id: 'lm-39-ssh',          title: 'SSH Basics',                     type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-39-ssh-basics.module.html' },
                { id: 'lm-40-s6-practice',  title: 'Section 6 Practice',            type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-40-section6-practice.module.html' },
                { id: 'lab-ssh',            title: 'SSH Lab',                        type: 'lab', href: '../../../houses/script/labs/linux/script-linux-ssh.lab.html' },
                { id: 'lab-network-drill',  title: 'Network Drill',                  type: 'lab', href: '../../../houses/script/labs/linux/script-linux-network-drill.lab.html' }
            ]
        },

        // -----------------------------------------------------------------------
        // DRAGON FACTION — District 11: Arena
        // CTF showcase, BoxEngine integration.
        // -----------------------------------------------------------------------
        {
            id: 'arena',
            name: 'The Arena',
            faction: 'dragon',
            icon: '\u{1F3DF}',
            description: 'The frozen arena at the top of the world. Full CTF boxes, exploitation challenges, and the ultimate test of everything learned in the Arctic.',
            lore: 'Only those who have walked all 10 districts may enter the Arena. Here, the Dragon Order proves mastery.',
            difficulty: 6,
            modules: [
                { id: 'arena-a1',   title: 'A1: Ancient Ledger (SQL Injection)',   type: 'lab', href: '../../../arena/boxes/a1-ancient-ledger/index.html' },
                { id: 'arena-a2',   title: 'A2: Whispering Wall',                  type: 'lab', href: '../../../arena/boxes/a2-whispering-wall/index.html' },
                { id: 'arena-a3',   title: 'A3: Phantom Shell',                   type: 'lab', href: '../../../arena/boxes/a3-phantom-shell/index.html' },
                { id: 'clh-030-arena',title: 'CLH-030: Chimera (Multi-Skill)',     type: 'applet', href: '../../../houses/script/applets/linux/script-clh-030-chimera.applet.html' },
                { id: 'clh-031-arena',title: 'CLH-031: Blackout (Final Boss)',     type: 'applet', href: '../../../houses/script/applets/linux/script-clh-031-blackout.applet.html' }
            ]
        }

    ],

    // ---------------------------------------------------------------------------
    // Helper methods
    // ---------------------------------------------------------------------------

    /** Return a single district definition by id. */
    getDistrict(id) {
        return this.districts.find(d => d.id === id) || null;
    },

    /** Return all districts belonging to a given faction id. */
    getFactionDistricts(factionId) {
        return this.districts.filter(d => d.faction === factionId);
    },

    /** Return a faction definition by id. */
    getFaction(factionId) {
        return this.factions.find(f => f.id === factionId) || null;
    },

    /** Return total module count across all districts. */
    getTotalModules() {
        return this.districts.reduce((sum, d) => sum + d.modules.length, 0);
    },

    /**
     * Given the hexworth_arctic_progress object, compute completion percentage
     * for a single district (0.0 – 1.0).
     */
    getDistrictCompletion(districtId, progress) {
        const district = this.getDistrict(districtId);
        if (!district || district.modules.length === 0) return 0;
        const completed = district.modules.filter(m => progress[m.id]).length;
        return completed / district.modules.length;
    },

    /**
     * Given progress and a factionId, return average completion across all
     * districts in that faction (0.0 – 1.0).
     */
    getFactionCompletion(factionId, progress) {
        const districts = this.getFactionDistricts(factionId);
        if (districts.length === 0) return 0;
        const total = districts.reduce((sum, d) => sum + this.getDistrictCompletion(d.id, progress), 0);
        return total / districts.length;
    },

    /**
     * Determine whether a faction is unlocked given current progress.
     * Penguin is always unlocked; Parrot requires 60% of Penguin;
     * Dragon requires 60% of Parrot.
     */
    isFactionUnlocked(factionId, progress) {
        const faction = this.getFaction(factionId);
        if (!faction || !faction.unlockRequirement) return true; // Penguin
        const parentCompletion = this.getFactionCompletion(faction.unlockRequirement, progress);
        return parentCompletion >= faction.unlockThreshold;
    },

    /**
     * Determine whether a district is unlocked. A district is unlocked if
     * its parent faction is unlocked.
     */
    isDistrictUnlocked(districtId, progress) {
        const district = this.getDistrict(districtId);
        if (!district) return false;
        return this.isFactionUnlocked(district.faction, progress);
    },

    /** Return the module type icon character for use in UI rendering. */
    getTypeIcon(type) {
        const icons = {
            module:   '\u{1F4D6}',
            lab:      '\u{1F9EA}',
            applet:   '\u{1F5A5}',
            quiz:     '\u{1F4DD}',
            tool:     '\u{1F527}',
            game:     '\u{1F3AE}',
            review:   '\u{1F501}'
        };
        return icons[type] || '\u{1F4C4}';
    },

    /** Return a human-readable label for a module type. */
    getTypeLabel(type) {
        const labels = {
            module:   'Module',
            lab:      'Lab',
            applet:   'Interactive',
            quiz:     'Quiz',
            tool:     'Tool',
            game:     'Game',
            review:   'Review'
        };
        return labels[type] || type;
    },

    /** Return a CSS class suffix for a faction's color scheme. */
    getFactionClass(factionId) {
        return `faction-${factionId}`;
    }
};
