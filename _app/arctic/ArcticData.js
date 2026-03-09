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

    version: '3.0.0',

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
            icon: '\u2745',
            color: '#3a8ab0',
            colorBg: 'rgba(200,225,245,0.50)',
            colorBorder: 'rgba(100,180,220,0.25)',
            colorAccent: '#7ac4e8',
            unlockRequirement: null,          // always unlocked
            unlockThreshold: 0,
            districtCount: 7
        },
        {
            id: 'parrot',
            name: 'Parrot Division',
            tagline: 'Defend the system.',
            description: 'Blue team operations, hardening, log investigation, and incident response. You cannot defend what you have not first mastered.',
            icon: '\u2660',
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
            icon: '\u2694',
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
    // District definitions — 12 total across 3 factions.
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
            icon: '\u25A0',
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
                { id: 'lm-11-find-files',  title: 'Finding Files',            type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-11-finding-files.module.html' },
                { id: 'lm-12-s2-practice', title: 'Section 2 Practice',       type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-12-section2-practice.module.html' },
                // CLH course modules + applets (lesson → practice → assessment)
                // CLH-001: Intro to Hacker CLI (lesson → lab → quiz)
                { id: 'clh-001-intro',      title: 'CLH-001: Intro to Hacker CLI (Lesson)', type: 'module', href: '../../../houses/script/courses/clh/modules/clh-001/script-intro.module.html' },
                { id: 'clh-001-applet',     title: 'CLH-001: Intro to Hacker CLI', type: 'applet', href: '../../../houses/script/applets/linux/script-clh-001-intro-to-hacker-cli.applet.html' },
                { id: 'clh-001-lab',        title: 'CLH-001: Hacker CLI Lab',     type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-001/script-lab.lab.html', progressKey: 'script-clh-001-lab' },
                { id: 'clh-001-quiz',       title: 'CLH-001: CLI Basics (Quiz)',   type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-001/script-quiz.quiz.html' },
                // CLH-002
                { id: 'clh-002-intro',      title: 'CLH-002: Navigation Recon (Lesson)', type: 'module', href: '../../../houses/script/courses/clh/modules/clh-002/script-intro.module.html' },
                { id: 'clh-002-applet',     title: 'CLH-002: Navigation Recon',    type: 'applet', href: '../../../houses/script/applets/linux/script-clh-002-navigation-recon.applet.html' },
                { id: 'clh-002-lab',        title: 'CLH-002: Navigation Recon (Lab)',   type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-002/script-lab.lab.html', progressKey: 'script-clh-002-lab' },
                { id: 'clh-002-quiz',       title: 'CLH-002: Navigation Recon (Quiz)',  type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-002/script-quiz.quiz.html' },
                // CLH-006
                { id: 'clh-006-intro',      title: 'CLH-006: File Operations (Lesson)', type: 'module', href: '../../../houses/script/courses/clh/modules/clh-006/script-intro.module.html' },
                { id: 'clh-006-applet',     title: 'CLH-006: File Operations',     type: 'applet', href: '../../../houses/script/applets/linux/script-clh-006-file-operations.applet.html' },
                { id: 'clh-006-lab',        title: 'CLH-006: File Operations (Lab)',    type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-006/script-lab.lab.html', progressKey: 'script-clh-006-lab' },
                { id: 'clh-006-quiz',       title: 'CLH-006: File Operations (Quiz)',   type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-006/script-quiz.quiz.html' },
                // CLH-007
                { id: 'clh-007-intro',      title: 'CLH-007: Permissions (Lesson)', type: 'module', href: '../../../houses/script/courses/clh/modules/clh-007/script-intro.module.html' },
                { id: 'clh-007-applet',     title: 'CLH-007: Permissions',         type: 'applet', href: '../../../houses/script/applets/linux/script-clh-007-permissions.applet.html' },
                { id: 'clh-007-lab',        title: 'CLH-007: Permissions (Lab)',       type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-007/script-lab.lab.html', progressKey: 'script-clh-007-lab' },
                { id: 'clh-007-quiz',       title: 'CLH-007: Permissions (Quiz)',      type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-007/script-quiz.quiz.html' },
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
                // Orphaned standalone content
                { id: 'applet-cmd-translator', title: 'Command Translator',        type: 'applet', href: '../../../houses/script/applets/linux/script-command-translator.applet.html' },
                { id: 'applet-fs-navigator',   title: 'Filesystem Navigator',      type: 'applet', href: '../../../houses/script/applets/linux/script-linux-filesystem-navigator.applet.html' },
                { id: 'applet-user-identity',  title: 'User Identity Lab',         type: 'applet', href: '../../../houses/script/applets/linux/script-linux-lab-001-user-identity.applet.html' },
                { id: 'applet-file-nav',       title: 'File Navigation Lab',       type: 'applet', href: '../../../houses/script/applets/linux/script-linux-lab-002-file-navigation.applet.html' },
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
            icon: '\u25B6',
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
                { id: 'clh-008-intro',      title: 'CLH-008: Shell Scripting (Lesson)', type: 'module', href: '../../../houses/script/courses/clh/modules/clh-008/script-intro.module.html' },
                { id: 'clh-008-applet',     title: 'CLH-008: Shell Scripting',     type: 'applet', href: '../../../houses/script/applets/linux/script-clh-008-shell-scripting.applet.html' },
                { id: 'clh-008-lab',        title: 'CLH-008: Shell Scripting (Lab)',    type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-008/script-lab.lab.html', progressKey: 'script-clh-008-lab' },
                { id: 'clh-008-quiz',       title: 'CLH-008: Shell Scripting (Quiz)',   type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-008/script-quiz.quiz.html' },
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
            icon: '\u2261',
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
                // CLH course modules + applets (lesson → practice → assessment)
                // CLH-003
                { id: 'clh-003-intro',      title: 'CLH-003: Pattern Hunting (Lesson)', type: 'module', href: '../../../houses/script/courses/clh/modules/clh-003/script-intro.module.html' },
                { id: 'clh-003-applet',     title: 'CLH-003: Pattern Hunting',     type: 'applet', href: '../../../houses/script/applets/linux/script-clh-003-pattern-hunting.applet.html' },
                { id: 'clh-003-lab',        title: 'CLH-003: Pattern Hunting (Lab)',    type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-003/script-lab.lab.html', progressKey: 'script-clh-003-lab' },
                { id: 'clh-003-quiz',       title: 'CLH-003: Pattern Hunting (Quiz)',   type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-003/script-quiz.quiz.html' },
                // CLH-009
                { id: 'clh-009-intro',      title: 'CLH-009: Text Processing (Lesson)', type: 'module', href: '../../../houses/script/courses/clh/modules/clh-009/script-intro.module.html' },
                { id: 'clh-009-applet',     title: 'CLH-009: Text Processing',     type: 'applet', href: '../../../houses/script/applets/linux/script-clh-009-text-processing.applet.html' },
                { id: 'clh-009-lab',        title: 'CLH-009: Text Processing (Lab)',    type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-009/script-lab.lab.html', progressKey: 'script-clh-009-lab' },
                { id: 'clh-009-quiz',       title: 'CLH-009: Text Processing (Quiz)',   type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-009/script-quiz.quiz.html' },
                // CLH-010
                { id: 'clh-010-intro',      title: 'CLH-010: I/O Redirection (Lesson)', type: 'module', href: '../../../houses/script/courses/clh/modules/clh-010/script-intro.module.html' },
                { id: 'clh-010-applet',     title: 'CLH-010: I/O Redirection',     type: 'applet', href: '../../../houses/script/applets/linux/script-clh-010-io-redirection.applet.html' },
                { id: 'clh-010-lab',        title: 'CLH-010: I/O Redirection (Lab)',    type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-010/script-lab.lab.html', progressKey: 'script-clh-010-lab' },
                { id: 'clh-010-quiz',       title: 'CLH-010: I/O Redirection (Quiz)',   type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-010/script-quiz.quiz.html' },
                // CLH-011
                { id: 'clh-011-intro',      title: 'CLH-011: Advanced Grep (Lesson)', type: 'module', href: '../../../houses/script/courses/clh/modules/clh-011/script-intro.module.html' },
                { id: 'clh-011-applet',     title: 'CLH-011: Advanced Grep',       type: 'applet', href: '../../../houses/script/applets/linux/script-clh-011-advanced-grep.applet.html' },
                { id: 'clh-011-lab',        title: 'CLH-011: Advanced Grep (Lab)',      type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-011/script-lab.lab.html', progressKey: 'script-clh-011-lab' },
                { id: 'clh-011-quiz',       title: 'CLH-011: Advanced Grep (Quiz)',     type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-011/script-quiz.quiz.html' },
                { id: 'lab-bash-pipes',     title: 'Pipes Lab',                    type: 'lab', href: '../../../houses/script/labs/linux/script-bash-pipes.lab.html' },
                { id: 'lab-bash-io',        title: 'I/O Redirection Lab',          type: 'lab', href: '../../../houses/script/labs/linux/script-bash-io-redirect.lab.html' },
                { id: 'lab-bash-io-drill',  title: 'Redirect Drill',               type: 'lab', href: '../../../houses/script/labs/linux/script-bash-redirect-drill.lab.html' },
                { id: 'lab-text-viewing',   title: 'Text Viewing Lab',             type: 'lab', href: '../../../houses/script/labs/linux/script-linux-text-viewing.lab.html' },
                { id: 'lab-viewing-drill',  title: 'Viewing Drill',                type: 'lab', href: '../../../houses/script/labs/linux/script-linux-viewing-drill.lab.html' },
                { id: 'lab-wildcards',      title: 'Wildcards Lab',                type: 'lab', href: '../../../houses/script/labs/linux/script-linux-wildcards.lab.html' },
                { id: 'mission-text-view',  title: 'Mission: Text Viewing',        type: 'lab', href: '../../../houses/script/linux/labs/script-mission-text-viewing.lab.html' },
                { id: 'review-regex-runner',title: 'Regex Runner (Game)',          type: 'review', href: '../../../houses/script/reviews/script-regex-runner.html' },
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
            icon: '\u2699',
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
                // CLH course modules + applets (lesson → practice → assessment)
                // CLH-004
                { id: 'clh-004-intro',      title: 'CLH-004: Process Investigation (Lesson)', type: 'module', href: '../../../houses/script/courses/clh/modules/clh-004/script-intro.module.html' },
                { id: 'clh-004-applet',     title: 'CLH-004: Process Investigation', type: 'applet', href: '../../../houses/script/applets/linux/script-clh-004-process-investigation.applet.html' },
                { id: 'clh-004-lab',        title: 'CLH-004: Process Investigation (Lab)',  type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-004/script-lab.lab.html', progressKey: 'script-clh-004-lab' },
                { id: 'clh-004-quiz',       title: 'CLH-004: Process Investigation (Quiz)', type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-004/script-quiz.quiz.html' },
                // CLH-013 (primary district: sysadmin)
                { id: 'clh-013-intro',      title: 'CLH-013: Environment (Lesson)', type: 'module', href: '../../../houses/script/courses/clh/modules/clh-013/script-intro.module.html' },
                { id: 'clh-013-applet',     title: 'CLH-013: Environment',         type: 'applet', href: '../../../houses/script/applets/linux/script-clh-013-environment.applet.html' },
                { id: 'clh-013-lab',        title: 'CLH-013: Environment (Lab)',       type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-013/script-lab.lab.html', progressKey: 'script-clh-013-lab' },
                { id: 'clh-013-quiz',       title: 'CLH-013: Environment (Quiz)',      type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-013/script-quiz.quiz.html' },
                // CLH-014
                { id: 'clh-014-intro',      title: 'CLH-014: Process Control (Lesson)', type: 'module', href: '../../../houses/script/courses/clh/modules/clh-014/script-intro.module.html' },
                { id: 'clh-014-applet',     title: 'CLH-014: Process Control',    type: 'applet', href: '../../../houses/script/applets/linux/script-clh-014-process-control.applet.html' },
                { id: 'clh-014-lab',        title: 'CLH-014: Process Control (Lab)',    type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-014/script-lab.lab.html', progressKey: 'script-clh-014-lab' },
                { id: 'clh-014-quiz',       title: 'CLH-014: Process Control (Quiz)',   type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-014/script-quiz.quiz.html' },
                // CLH-023
                { id: 'clh-023-intro',      title: 'CLH-023: Services (Lesson)',   type: 'module', href: '../../../houses/script/courses/clh/modules/clh-023/script-intro.module.html' },
                { id: 'clh-023-applet',     title: 'CLH-023: Services',           type: 'applet', href: '../../../houses/script/applets/linux/script-clh-023-services.applet.html' },
                { id: 'clh-023-lab',        title: 'CLH-023: Services (Lab)',         type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-023/script-lab.lab.html', progressKey: 'script-clh-023-lab' },
                { id: 'clh-023-quiz',       title: 'CLH-023: Services (Quiz)',        type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-023/script-quiz.quiz.html' },
                // CLH-024
                { id: 'clh-024-intro',      title: 'CLH-024: Cron (Lesson)',       type: 'module', href: '../../../houses/script/courses/clh/modules/clh-024/script-intro.module.html' },
                { id: 'clh-024-applet',     title: 'CLH-024: Cron',               type: 'applet', href: '../../../houses/script/applets/linux/script-clh-024-cron.applet.html' },
                { id: 'clh-024-lab',        title: 'CLH-024: Cron (Lab)',             type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-024/script-lab.lab.html', progressKey: 'script-clh-024-lab' },
                { id: 'clh-024-quiz',       title: 'CLH-024: Cron (Quiz)',            type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-024/script-quiz.quiz.html' },
                // CLH-025
                { id: 'clh-025-intro',      title: 'CLH-025: Packages (Lesson)',   type: 'module', href: '../../../houses/script/courses/clh/modules/clh-025/script-intro.module.html' },
                { id: 'clh-025-applet',     title: 'CLH-025: Packages',           type: 'applet', href: '../../../houses/script/applets/linux/script-clh-025-packages.applet.html' },
                { id: 'clh-025-lab',        title: 'CLH-025: Packages (Lab)',         type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-025/script-lab.lab.html', progressKey: 'script-clh-025-lab' },
                { id: 'clh-025-quiz',       title: 'CLH-025: Packages (Quiz)',        type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-025/script-quiz.quiz.html' },
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
                { id: 'game-dont-kill',     title: "Don't Kill the Server (Game)", type: 'game', href: '../../../houses/script/games/script-dont-kill-the-server.html' },
                { id: 'lm-27-s4-practice', title: 'Section 4 Practice',       type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-27-section4-practice.module.html' },
                { id: 'lm-34-s5-practice', title: 'Section 5 Practice',       type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-34-section5-practice.module.html' },
                { id: 'lab-warmup-nav',    title: 'Warmup: Navigation',       type: 'lab', href: '../../../houses/script/linux/labs/script-warmup-navigation.lab.html' },
                { id: 'lab-template-warmup',title: 'Template Warmup Lab',     type: 'lab', href: '../../../houses/script/linux/labs/script-template-warmup.lab.html' },
                // Orphaned standalone content
                { id: 'applet-ubuntu-components', title: 'Ubuntu Components',      type: 'applet', href: '../../../houses/script/applets/linux/script-ubuntu-components.applet.html' },
                { id: 'tool-automation',          title: 'Automation Reference',   type: 'tool',   href: '../../../houses/script/tools/script-automation.tool.html' },
                { id: 'tool-quick-ref',    title: 'Quick Reference',          type: 'tool', href: '../../../houses/script/linux/script-quick.reference.html' }
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
            icon: '\u2605',
            description: 'The final Penguin district. Advanced Linux topics aligned to CompTIA Linux+ — environment management, storage, access control, monitoring, and Vim.',
            lore: 'The certification vault at the heart of the Penguin Collective. Earn your rank before venturing to the Parrot Division.',
            difficulty: 4,
            modules: [
                // CLH course modules + applets (lesson → practice → assessment)
                // CLH-016
                { id: 'clh-016-intro',      title: 'CLH-016: System Intelligence (Lesson)', type: 'module', href: '../../../houses/script/courses/clh/modules/clh-016/script-intro.module.html' },
                { id: 'clh-016-applet',     title: 'CLH-016: System Intelligence', type: 'applet', href: '../../../houses/script/applets/linux/script-clh-016-system-intel.applet.html' },
                { id: 'clh-016-lab',        title: 'CLH-016: System Intelligence (Lab)',  type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-016/script-lab.lab.html', progressKey: 'script-clh-016-lab' },
                { id: 'clh-016-quiz',       title: 'CLH-016: System Intelligence (Quiz)', type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-016/script-quiz.quiz.html' },
                // CLH-017
                { id: 'clh-017-intro',      title: 'CLH-017: Find & Locate (Lesson)', type: 'module', href: '../../../houses/script/courses/clh/modules/clh-017/script-intro.module.html' },
                { id: 'clh-017-applet',     title: 'CLH-017: Find & Locate',       type: 'applet', href: '../../../houses/script/applets/linux/script-clh-017-find-locate.applet.html' },
                { id: 'clh-017-lab',        title: 'CLH-017: Find & Locate (Lab)',      type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-017/script-lab.lab.html', progressKey: 'script-clh-017-lab' },
                { id: 'clh-017-quiz',       title: 'CLH-017: Find & Locate (Quiz)',     type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-017/script-quiz.quiz.html' },
                // CLH-018
                { id: 'clh-018-intro',      title: 'CLH-018: Archive Operations (Lesson)', type: 'module', href: '../../../houses/script/courses/clh/modules/clh-018/script-intro.module.html' },
                { id: 'clh-018-applet',     title: 'CLH-018: Archive Operations',  type: 'applet', href: '../../../houses/script/applets/linux/script-clh-018-archive-ops.applet.html' },
                { id: 'clh-018-lab',        title: 'CLH-018: Archive Operations (Lab)',  type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-018/script-lab.lab.html', progressKey: 'script-clh-018-lab' },
                { id: 'clh-018-quiz',       title: 'CLH-018: Archive Operations (Quiz)', type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-018/script-quiz.quiz.html' },
                // CLH-019
                { id: 'clh-019-intro',      title: 'CLH-019: Disk Forensics (Lesson)', type: 'module', href: '../../../houses/script/courses/clh/modules/clh-019/script-intro.module.html' },
                { id: 'clh-019-applet',     title: 'CLH-019: Disk Forensics',      type: 'applet', href: '../../../houses/script/applets/linux/script-clh-019-disk-forensics.applet.html' },
                { id: 'clh-019-lab',        title: 'CLH-019: Disk Forensics (Lab)',    type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-019/script-lab.lab.html', progressKey: 'script-clh-019-lab' },
                { id: 'clh-019-quiz',       title: 'CLH-019: Disk Forensics (Quiz)',   type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-019/script-quiz.quiz.html' },
                // CLH-020
                { id: 'clh-020-intro',      title: 'CLH-020: User Recon (Lesson)', type: 'module', href: '../../../houses/script/courses/clh/modules/clh-020/script-intro.module.html' },
                { id: 'clh-020-applet',     title: 'CLH-020: User Recon',          type: 'applet', href: '../../../houses/script/applets/linux/script-clh-020-user-recon.applet.html' },
                { id: 'clh-020-lab',        title: 'CLH-020: User Recon (Lab)',        type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-020/script-lab.lab.html', progressKey: 'script-clh-020-lab' },
                { id: 'clh-020-quiz',       title: 'CLH-020: User Recon (Quiz)',       type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-020/script-quiz.quiz.html' },
                // CLH-026
                { id: 'clh-026-intro',      title: 'CLH-026: Access Control (Lesson)', type: 'module', href: '../../../houses/script/courses/clh/modules/clh-026/script-intro.module.html' },
                { id: 'clh-026-applet',     title: 'CLH-026: Access Control',      type: 'applet', href: '../../../houses/script/applets/linux/script-clh-026-access.applet.html' },
                { id: 'clh-026-lab',        title: 'CLH-026: Access Control (Lab)',    type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-026/script-lab.lab.html', progressKey: 'script-clh-026-lab' },
                { id: 'clh-026-quiz',       title: 'CLH-026: Access Control (Quiz)',   type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-026/script-quiz.quiz.html' },
                // CLH-027
                { id: 'clh-027-intro',      title: 'CLH-027: Users (Advanced) (Lesson)', type: 'module', href: '../../../houses/script/courses/clh/modules/clh-027/script-intro.module.html' },
                { id: 'clh-027-applet',     title: 'CLH-027: Users (Advanced)',    type: 'applet', href: '../../../houses/script/applets/linux/script-clh-027-users.applet.html' },
                { id: 'clh-027-lab',        title: 'CLH-027: Users (Advanced) (Lab)',   type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-027/script-lab.lab.html', progressKey: 'script-clh-027-lab' },
                { id: 'clh-027-quiz',       title: 'CLH-027: Users (Advanced) (Quiz)',  type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-027/script-quiz.quiz.html' },
                // CLH-028
                { id: 'clh-028-intro',      title: 'CLH-028: Monitoring (Lesson)', type: 'module', href: '../../../houses/script/courses/clh/modules/clh-028/script-intro.module.html' },
                { id: 'clh-028-applet',     title: 'CLH-028: Monitoring',          type: 'applet', href: '../../../houses/script/applets/linux/script-clh-028-monitoring.applet.html' },
                { id: 'clh-028-lab',        title: 'CLH-028: Monitoring (Lab)',        type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-028/script-lab.lab.html', progressKey: 'script-clh-028-lab' },
                { id: 'clh-028-quiz',       title: 'CLH-028: Monitoring (Quiz)',       type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-028/script-quiz.quiz.html' },
                // CLH-029
                { id: 'clh-029-intro',      title: 'CLH-029: Vim (Lesson)',        type: 'module', href: '../../../houses/script/courses/clh/modules/clh-029/script-intro.module.html' },
                { id: 'clh-029-applet',     title: 'CLH-029: Vim',                 type: 'applet', href: '../../../houses/script/applets/linux/script-clh-029-vim.applet.html' },
                { id: 'clh-029-lab',        title: 'CLH-029: Vim (Lab)',               type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-029/script-lab.lab.html', progressKey: 'script-clh-029-lab' },
                { id: 'clh-029-quiz',       title: 'CLH-029: Vim (Quiz)',              type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-029/script-quiz.quiz.html' },
                // CLH-030
                { id: 'clh-030-intro',      title: 'CLH-030: Chimera (Lesson)',    type: 'module', href: '../../../houses/script/courses/clh/modules/clh-030/script-intro.module.html' },
                { id: 'clh-030-applet',     title: 'CLH-030: Chimera (Capstone)',  type: 'applet', href: '../../../houses/script/applets/linux/script-clh-030-chimera.applet.html' },
                { id: 'clh-030-lab',        title: 'CLH-030: Chimera (Lab)',           type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-030/script-lab.lab.html', progressKey: 'script-clh-030-lab' },
                { id: 'clh-030-quiz',       title: 'CLH-030: Chimera (Quiz)',          type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-030/script-quiz.quiz.html' },
                // CLH-031: applet only in cert-prep (primary lab is in arena district)
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
                // Orphaned encryption/checksum labs
                { id: 'lab-checksum',       title: 'Checksum Verification Lab',   type: 'lab', href: '../../../houses/script/linux/labs/script-checksum-verify.lab.html' },
                { id: 'lab-gpg',            title: 'GPG Encryption Lab',          type: 'lab', href: '../../../houses/script/linux/labs/script-gpg-encryption.lab.html' },
                { id: 'review-terminal-vel',title: 'Terminal Velocity (Game)',     type: 'review', href: '../../../houses/script/reviews/script-terminal-velocity.html' },
                { id: 'review-perm-puzzle', title: 'Permission Puzzle (Game)',     type: 'review', href: '../../../houses/script/reviews/script-permission-puzzle.html' },
                { id: 'review-linux-cli',   title: 'Linux CLI Review',             type: 'review', href: '../../../houses/script/reviews/script-linux-cli-review.html' },
                { id: 'review-la-comp',    title: 'LA Comprehensive Review',  type: 'review', href: '../../../houses/script/linux/reviews/script-la-comprehensive-review.html' }
            ]
        },

        // -----------------------------------------------------------------------
        // PENGUIN FACTION — District 6: Linux Administration (NEW)
        // Full Linux Admin course — 12 chapters with presentations, quizzes, labs.
        // -----------------------------------------------------------------------
        {
            id: 'linux-admin',
            name: 'Linux Administration',
            faction: 'penguin',
            icon: '\u25C6',
            description: 'The full Linux Administration course. 12 chapters covering distros, processes, daemons, networking, encryption, and compilation — each with a presentation, quiz, and hands-on lab.',
            lore: 'The deepest wing of the Penguin Collective. Only those who have mastered the fundamentals earn access to the full administration curriculum.',
            difficulty: 3,
            modules: [
                // Chapter 01 — Introduction
                { id: 'la-ch01-pres',  title: 'Ch01: Introduction (Presentation)',    type: 'module', href: '../../../houses/script/linux/presentations/script-la-ch01-intro.presentation.html' },
                { id: 'la-ch01-quiz',  title: 'Ch01: Introduction (Quiz)',            type: 'quiz',   href: '../../../houses/script/linux/quizzes/script-la-ch01-quiz.quiz.html' },
                { id: 'la-ch01-lab',   title: 'Ch01: Introduction (Lab)',             type: 'lab',    href: '../../../houses/script/linux/labs/script-la-ch01-intro.lab.html' },
                // Chapter 02 — Distros
                { id: 'la-ch02-pres',  title: 'Ch02: Distros (Presentation)',         type: 'module', href: '../../../houses/script/linux/presentations/script-la-ch02-distros.presentation.html' },
                { id: 'la-ch02-quiz',  title: 'Ch02: Distros (Quiz)',                 type: 'quiz',   href: '../../../houses/script/linux/quizzes/script-la-ch02-quiz.quiz.html' },
                { id: 'la-ch02-lab',   title: 'Ch02: Distros (Lab)',                  type: 'lab',    href: '../../../houses/script/linux/labs/script-la-ch02-distros.lab.html' },
                // Chapter 03 — Grep & Pipes
                { id: 'la-ch03-pres',  title: 'Ch03: Grep & Pipes (Presentation)',    type: 'module', href: '../../../houses/script/linux/presentations/script-la-ch03-grep-pipes.presentation.html' },
                { id: 'la-ch03-quiz',  title: 'Ch03: Grep & Pipes (Quiz)',            type: 'quiz',   href: '../../../houses/script/linux/quizzes/script-la-ch03-quiz.quiz.html' },
                { id: 'la-ch03-lab',   title: 'Ch03: Grep & Pipes (Lab)',             type: 'lab',    href: '../../../houses/script/linux/labs/script-la-ch03-grep-pipes.lab.html' },
                // Chapter 04 — Processes
                { id: 'la-ch04-pres',  title: 'Ch04: Processes (Presentation)',       type: 'module', href: '../../../houses/script/linux/presentations/script-la-ch04-processes.presentation.html' },
                { id: 'la-ch04-quiz',  title: 'Ch04: Processes (Quiz)',               type: 'quiz',   href: '../../../houses/script/linux/quizzes/script-la-ch04-quiz.quiz.html' },
                { id: 'la-ch04-lab',   title: 'Ch04: Processes (Lab)',                type: 'lab',    href: '../../../houses/script/linux/labs/script-la-ch04-processes.lab.html' },
                // Chapter 05 — Daemons
                { id: 'la-ch05-pres',  title: 'Ch05: Daemons (Presentation)',         type: 'module', href: '../../../houses/script/linux/presentations/script-la-ch05-daemons.presentation.html' },
                { id: 'la-ch05-quiz',  title: 'Ch05: Daemons (Quiz)',                 type: 'quiz',   href: '../../../houses/script/linux/quizzes/script-la-ch05-quiz.quiz.html' },
                { id: 'la-ch05-lab',   title: 'Ch05: Daemons (Lab)',                  type: 'lab',    href: '../../../houses/script/linux/labs/script-la-ch05-daemons.lab.html' },
                // Chapter 06 — Init & X Windows
                { id: 'la-ch06-pres',  title: 'Ch06: Init & X Windows (Presentation)',type: 'module', href: '../../../houses/script/linux/presentations/script-la-ch06-init-xwindows.presentation.html' },
                { id: 'la-ch06-quiz',  title: 'Ch06: Init & X Windows (Quiz)',        type: 'quiz',   href: '../../../houses/script/linux/quizzes/script-la-ch06-quiz.quiz.html' },
                { id: 'la-ch06-lab',   title: 'Ch06: Init & X Windows (Lab)',         type: 'lab',    href: '../../../houses/script/linux/labs/script-la-ch06-init-xwindows.lab.html' },
                // Chapter 07 — Display Managers
                { id: 'la-ch07-pres',  title: 'Ch07: Display Managers (Presentation)',type: 'module', href: '../../../houses/script/linux/presentations/script-la-ch07-display-mgr.presentation.html' },
                { id: 'la-ch07-quiz',  title: 'Ch07: Display Managers (Quiz)',        type: 'quiz',   href: '../../../houses/script/linux/quizzes/script-la-ch07-quiz.quiz.html' },
                { id: 'la-ch07-lab',   title: 'Ch07: Display Managers (Lab)',         type: 'lab',    href: '../../../houses/script/linux/labs/script-la-ch07-display-mgr.lab.html' },
                // Chapter 08 — Network Config
                { id: 'la-ch08-pres',  title: 'Ch08: Network Config (Presentation)',  type: 'module', href: '../../../houses/script/linux/presentations/script-la-ch08-network.presentation.html' },
                { id: 'la-ch08-quiz',  title: 'Ch08: Network Config (Quiz)',          type: 'quiz',   href: '../../../houses/script/linux/quizzes/script-la-ch08-quiz.quiz.html' },
                { id: 'la-ch08-lab',   title: 'Ch08: Network Config (Lab)',           type: 'lab',    href: '../../../houses/script/linux/labs/script-la-ch08-network.lab.html' },
                // Chapter 09 — IPv4
                { id: 'la-ch09-pres',  title: 'Ch09: IPv4 (Presentation)',            type: 'module', href: '../../../houses/script/linux/presentations/script-la-ch09-ipv4.presentation.html' },
                { id: 'la-ch09-quiz',  title: 'Ch09: IPv4 (Quiz)',                    type: 'quiz',   href: '../../../houses/script/linux/quizzes/script-la-ch09-quiz.quiz.html' },
                { id: 'la-ch09-lab',   title: 'Ch09: IPv4 (Lab)',                     type: 'lab',    href: '../../../houses/script/linux/labs/script-la-ch09-ipv4.lab.html' },
                // Chapter 10 — Compression
                { id: 'la-ch10-pres',  title: 'Ch10: Compression (Presentation)',     type: 'module', href: '../../../houses/script/linux/presentations/script-la-ch10-compression.presentation.html' },
                { id: 'la-ch10-quiz',  title: 'Ch10: Compression (Quiz)',             type: 'quiz',   href: '../../../houses/script/linux/quizzes/script-la-ch10-quiz.quiz.html' },
                { id: 'la-ch10-lab',   title: 'Ch10: Compression (Lab)',              type: 'lab',    href: '../../../houses/script/linux/labs/script-la-ch10-compression.lab.html' },
                // Chapter 11 — Encryption
                { id: 'la-ch11-pres',  title: 'Ch11: Encryption (Presentation)',      type: 'module', href: '../../../houses/script/linux/presentations/script-la-ch11-encryption.presentation.html' },
                { id: 'la-ch11-quiz',  title: 'Ch11: Encryption (Quiz)',              type: 'quiz',   href: '../../../houses/script/linux/quizzes/script-la-ch11-quiz.quiz.html' },
                { id: 'la-ch11-lab',   title: 'Ch11: Encryption (Lab)',               type: 'lab',    href: '../../../houses/script/linux/labs/script-la-ch11-encryption.lab.html' },
                // Chapter 12 — Compiling
                { id: 'la-ch12-pres',  title: 'Ch12: Compiling (Presentation)',       type: 'module', href: '../../../houses/script/linux/presentations/script-la-ch12-compile.presentation.html' },
                { id: 'la-ch12-quiz',  title: 'Ch12: Compiling (Quiz)',               type: 'quiz',   href: '../../../houses/script/linux/quizzes/script-la-ch12-quiz.quiz.html' },
                { id: 'la-ch12-lab',   title: 'Ch12: Compiling (Lab)',                type: 'lab',    href: '../../../houses/script/linux/labs/script-la-ch12-compile.lab.html' }
            ]
        },

        // -----------------------------------------------------------------------
        // PENGUIN FACTION — District 7: Databases
        // SQL fundamentals, joins, aggregation, window functions, database
        // design, and data engineering patterns.
        // -----------------------------------------------------------------------
        {
            id: 'databases',
            name: 'Databases',
            faction: 'penguin',
            icon: '\u25C8',
            description: 'The data vaults of the Arctic. Master SQL from SELECT to window functions, design schemas, and learn the patterns that power data pipelines at scale.',
            lore: 'Every system writes to a database. The Penguins who master data are the ones who truly control the infrastructure.',
            difficulty: 2,
            sandboxLabId: 'db-sql',
            modules: [
                // Section 1: SQL Foundations
                { id: 'db-01-intro',          title: 'Introduction to Databases & SQL',   type: 'module', href: '../../../houses/script/modules/databases/script-db-01-intro.module.html' },
                { id: 'db-02-select',         title: 'SELECT Basics',                     type: 'module', href: '../../../houses/script/modules/databases/script-db-02-select.module.html' },
                { id: 'db-03-where',          title: 'WHERE Clause & Operators',          type: 'module', href: '../../../houses/script/modules/databases/script-db-03-where.module.html' },
                { id: 'db-04-sorting',        title: 'Sorting & Limiting Results',        type: 'module', href: '../../../houses/script/modules/databases/script-db-04-sorting.module.html' },
                { id: 'db-05-foundations-lab', title: 'SQL Foundations Lab',               type: 'lab',    href: '../../../houses/script/modules/databases/script-db-05-foundations.lab.html' },
                // Section 2: Data Manipulation
                { id: 'db-06-crud',           title: 'INSERT, UPDATE & DELETE',           type: 'module', href: '../../../houses/script/modules/databases/script-db-06-crud.module.html' },
                { id: 'db-07-nulls',          title: 'Working with NULLs',                type: 'module', href: '../../../houses/script/modules/databases/script-db-07-nulls.module.html' },
                { id: 'db-08-strings',        title: 'String Functions',                  type: 'module', href: '../../../houses/script/modules/databases/script-db-08-strings.module.html' },
                { id: 'db-09-numbers',        title: 'Numeric Functions & Math',          type: 'module', href: '../../../houses/script/modules/databases/script-db-09-numbers.module.html' },
                { id: 'db-10-dates',          title: 'Date & Time Functions',             type: 'module', href: '../../../houses/script/modules/databases/script-db-10-dates.module.html' },
                { id: 'db-11-data-lab',       title: 'Data Manipulation Lab',             type: 'lab',    href: '../../../houses/script/modules/databases/script-db-11-data.lab.html' },
                // Section 3: Joins & Multi-Table Queries
                { id: 'db-12-inner-join',     title: 'INNER JOIN',                        type: 'module', href: '../../../houses/script/modules/databases/script-db-12-inner-join.module.html' },
                { id: 'db-13-outer-joins',    title: 'Outer Joins (LEFT, RIGHT, FULL)',   type: 'module', href: '../../../houses/script/modules/databases/script-db-13-outer-joins.module.html' },
                { id: 'db-14-advanced-joins', title: 'Self Joins, Cross Joins & UNION',   type: 'module', href: '../../../houses/script/modules/databases/script-db-14-advanced-joins.module.html' },
                { id: 'db-15-subqueries',     title: 'Subqueries',                        type: 'module', href: '../../../houses/script/modules/databases/script-db-15-subqueries.module.html' },
                { id: 'db-16-ctes',           title: 'Common Table Expressions',          type: 'module', href: '../../../houses/script/modules/databases/script-db-16-ctes.module.html' },
                { id: 'db-17-joins-lab',      title: 'Multi-Table Queries Lab',           type: 'lab',    href: '../../../houses/script/modules/databases/script-db-17-joins.lab.html' },
                // Section 4: Aggregation & Analytics
                { id: 'db-18-aggregates',     title: 'Aggregate Functions',               type: 'module', href: '../../../houses/script/modules/databases/script-db-18-aggregates.module.html' },
                { id: 'db-19-group-by',       title: 'GROUP BY & HAVING',                 type: 'module', href: '../../../houses/script/modules/databases/script-db-19-group-by.module.html' },
                { id: 'db-20-window-funcs',   title: 'Window Functions',                  type: 'module', href: '../../../houses/script/modules/databases/script-db-20-window-funcs.module.html' },
                { id: 'db-21-pivoting',       title: 'Pivoting & Reshaping Data',         type: 'module', href: '../../../houses/script/modules/databases/script-db-21-pivoting.module.html' },
                { id: 'db-22-analytics-lab',  title: 'Analytics Lab',                     type: 'lab',    href: '../../../houses/script/modules/databases/script-db-22-analytics.lab.html' },
                // Section 5: Database Design & Administration
                { id: 'db-23-data-types',     title: 'Data Types & Schema Design',        type: 'module', href: '../../../houses/script/modules/databases/script-db-23-data-types.module.html' },
                { id: 'db-24-constraints',    title: 'Constraints & Referential Integrity',type: 'module', href: '../../../houses/script/modules/databases/script-db-24-constraints.module.html' },
                { id: 'db-25-indexes',        title: 'Indexes & Query Performance',       type: 'module', href: '../../../houses/script/modules/databases/script-db-25-indexes.module.html' },
                { id: 'db-26-metadata',       title: 'Database Metadata & Introspection', type: 'module', href: '../../../houses/script/modules/databases/script-db-26-metadata.module.html' },
                { id: 'db-27-admin-lab',      title: 'Database Admin Lab',                type: 'lab',    href: '../../../houses/script/modules/databases/script-db-27-admin.lab.html' },
                // Section 6: Data Engineering Patterns
                { id: 'db-28-ingestion',      title: 'Data Ingestion Patterns',           type: 'module', href: '../../../houses/script/modules/databases/script-db-28-ingestion.module.html' },
                { id: 'db-29-errors',         title: 'Error Management & Idempotency',    type: 'module', href: '../../../houses/script/modules/databases/script-db-29-errors.module.html' },
                { id: 'db-30-quality',        title: 'Data Quality & Validation',         type: 'module', href: '../../../houses/script/modules/databases/script-db-30-quality.module.html' },
                { id: 'db-31-pipelines',      title: 'Data Pipelines & ETL',              type: 'module', href: '../../../houses/script/modules/databases/script-db-31-pipelines.module.html' },
                { id: 'db-32-engineering-lab', title: 'Data Engineering Lab',              type: 'lab',    href: '../../../houses/script/modules/databases/script-db-32-engineering.lab.html' },
                // Section 7: Assessment
                { id: 'db-33-sql-quiz',       title: 'SQL Fundamentals Quiz',             type: 'quiz',   href: '../../../houses/script/modules/databases/script-db-33-sql.quiz.html' },
                { id: 'db-34-advanced-quiz',  title: 'Advanced SQL Quiz',                 type: 'quiz',   href: '../../../houses/script/modules/databases/script-db-34-advanced.quiz.html' },
                { id: 'db-35-capstone',       title: 'Database Capstone Lab',             type: 'lab',    href: '../../../houses/script/modules/databases/script-db-35-capstone.lab.html' }
            ]
        },

        // -----------------------------------------------------------------------
        // PARROT FACTION — District 8: Log Analysis
        // Log investigation, forensics, SIEM basics.
        // -----------------------------------------------------------------------
        {
            id: 'log-analysis',
            name: 'Log Analysis',
            faction: 'parrot',
            icon: '\u2502',
            description: 'The art of reading the ice — logs tell stories. Investigate system logs, track intruders, and feed your findings into SIEM workflows.',
            lore: 'The Parrot Division\'s first lesson: every action leaves a trace. The analysts who read logs are the ones who find the attackers.',
            difficulty: 3,
            modules: [
                // CLH-005 (primary district: log-analysis)
                { id: 'clh-005-intro',      title: 'CLH-005: Log Analysis (Lesson)',   type: 'module', href: '../../../houses/script/courses/clh/modules/clh-005/script-intro.module.html' },
                { id: 'clh-005-applet',     title: 'CLH-005: Log Analysis',           type: 'applet', href: '../../../houses/script/applets/linux/script-clh-005-log-analysis.applet.html' },
                { id: 'clh-005-lab',        title: 'CLH-005: Log Analysis (Lab)',      type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-005/script-lab.lab.html', progressKey: 'script-clh-005-lab' },
                { id: 'clh-005-quiz',       title: 'CLH-005: Log Analysis (Quiz)',     type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-005/script-quiz.quiz.html' },
                // CLH-010 duplicate reference (primary is text-processing; no course modules here)
                { id: 'clh-010-log-applet', title: 'CLH-010: I/O & Log Streams',      type: 'applet', href: '../../../houses/script/applets/linux/script-clh-010-io-redirection.applet.html' },
                { id: 'lab-log-analysis',   title: 'Log Analysis Lab',                type: 'lab', href: '../../../houses/script/labs/linux/script-linux-log-analysis.lab.html' },
                { id: 'lab-log-mission',    title: 'Mission: Log Analysis',           type: 'lab', href: '../../../houses/script/labs/linux/script-linux-log-analysis-mission.lab.html' },
                { id: 'lab-log-prep',       title: 'Log Analysis Prep',               type: 'lab', href: '../../../houses/script/labs/linux/script-linux-log-analysis-prep.lab.html' },
                { id: 'lab-log-invest-prep',title: 'Log Investigation Prep',          type: 'lab', href: '../../../houses/script/labs/linux/script-linux-log-investigation-prep.lab.html' },
                { id: 'tool-log-mgmt',      title: 'Log Management Tool',             type: 'tool', href: '../../../houses/script/tools/script-log-management.tool.html' }
            ]
        },

        // -----------------------------------------------------------------------
        // PARROT FACTION — District 8 (was 7): Hardening
        // Security hardening, access control, firewall management.
        // + Shield defensive labs, firewall builder applet
        // -----------------------------------------------------------------------
        {
            id: 'hardening',
            name: 'System Hardening',
            faction: 'parrot',
            icon: '\u25B2',
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
                { id: 'game-sudo-flap',     title: 'Sudo Flap (Game)',               type: 'game', href: '../../../houses/script/games/script-sudo-flap.html' },
                { id: 'game-sudo-su',       title: 'sudo su (Game)',                 type: 'game', href: '../../../houses/script/games/script-sudo-su.html' },
                { id: 'game-chmod777',      title: 'Chmod 777 Adventure (Game)',     type: 'game', href: '../../../houses/script/games/script-text-adventure-chmod777.html' },
                // Shield defensive labs
                { id: 'shield-firewall',       title: 'Firewall Lab',                   type: 'lab', href: '../../../houses/shield/labs/linux/shield-linux-firewall.lab.html', progressHouse: 'shield' },
                { id: 'shield-firewall-drill', title: 'Firewall Drill',                 type: 'lab', href: '../../../houses/shield/labs/linux/shield-linux-firewall-drill.lab.html', progressHouse: 'shield' },
                { id: 'shield-audit',          title: 'Audit Lab',                      type: 'lab', href: '../../../houses/shield/labs/linux/shield-linux-audit.lab.html', progressHouse: 'shield' },
                { id: 'shield-audit-drill',    title: 'Audit Drill',                    type: 'lab', href: '../../../houses/shield/labs/linux/shield-linux-audit-drill.lab.html', progressHouse: 'shield' },
                { id: 'shield-file-integrity', title: 'File Integrity Lab',             type: 'lab', href: '../../../houses/shield/labs/linux/shield-linux-file-integrity.lab.html', progressHouse: 'shield' },
                { id: 'shield-hardening',      title: 'Hardening Lab',                  type: 'lab', href: '../../../houses/shield/labs/linux/shield-linux-hardening.lab.html', progressHouse: 'shield' },
                { id: 'shield-password-policy',title: 'Password Policy Lab',            type: 'lab', href: '../../../houses/shield/labs/linux/shield-linux-password-policy.lab.html', progressHouse: 'shield' },
                { id: 'shield-perms-drill',    title: 'Permissions Drill',              type: 'lab', href: '../../../houses/shield/labs/linux/shield-linux-perms-drill.lab.html', progressHouse: 'shield' },
                { id: 'shield-selinux',        title: 'SELinux Lab',                    type: 'lab', href: '../../../houses/shield/labs/linux/shield-linux-selinux.lab.html', progressHouse: 'shield' },
                { id: 'shield-ssh-drill',      title: 'SSH Drill',                      type: 'lab', href: '../../../houses/shield/labs/linux/shield-linux-ssh-drill.lab.html', progressHouse: 'shield' },
                { id: 'shield-ssh-hard-prep',  title: 'SSH Hardening Prep',             type: 'lab', href: '../../../houses/shield/labs/linux/shield-linux-ssh-hardening-prep.lab.html', progressHouse: 'shield' },
                { id: 'shield-ssh-security',   title: 'SSH Security Lab',               type: 'lab', href: '../../../houses/shield/labs/linux/shield-linux-ssh-security.lab.html', progressHouse: 'shield' },
                { id: 'shield-sudo',           title: 'Sudo Lab',                       type: 'lab', href: '../../../houses/shield/labs/linux/shield-linux-sudo.lab.html', progressHouse: 'shield' },
                { id: 'shield-sudo-policy',    title: 'Sudo Policy Prep',               type: 'lab', href: '../../../houses/shield/labs/linux/shield-linux-sudo-policy-prep.lab.html', progressHouse: 'shield' },
                // Shield firewall builder applet
                { id: 'shield-fw-builder',     title: 'Firewall Builder',               type: 'applet', href: '../../../houses/shield/applets/network/shield-linux-firewall-builder.applet.html', progressHouse: 'shield' }
            ]
        },

        // -----------------------------------------------------------------------
        // PARROT FACTION — District 9 (was 8): Incident Response
        // IR procedures, environment forensics, capstone labs.
        // + Anonymity labs (Tor, VPN, advanced OPSEC), process monitor
        // -----------------------------------------------------------------------
        {
            id: 'incident-response',
            name: 'Incident Response',
            faction: 'parrot',
            icon: '\u26A0',
            description: 'When the breach happens, respond. CLH IR procedures, environment forensics, and the Parrot capstone scenario.',
            lore: 'The Parrot Division\'s final test. An incident has occurred — and only the most prepared analysts can contain it.',
            difficulty: 5,
            modules: [
                // CLH-013 duplicate (primary: sysadmin — no course modules here)
                { id: 'clh-013-ir-applet',  title: 'CLH-013: Environment (IR Context)', type: 'applet', href: '../../../houses/script/applets/linux/script-clh-013-environment.applet.html' },
                // CLH-015 (primary district: incident-response)
                { id: 'clh-015-intro',      title: 'CLH-015: Capstone (Lesson)',         type: 'module', href: '../../../houses/script/courses/clh/modules/clh-015/script-intro.module.html' },
                { id: 'clh-015-applet',     title: 'CLH-015: Capstone',                 type: 'applet', href: '../../../houses/script/applets/linux/script-clh-015-capstone.applet.html' },
                { id: 'clh-015-lab',        title: 'CLH-015: Capstone (Lab)',            type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-015/script-lab.lab.html', progressKey: 'script-clh-015-lab' },
                { id: 'clh-015-quiz',       title: 'CLH-015: Capstone (Quiz)',           type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-015/script-quiz.quiz.html' },
                { id: 'clh-016-ir-applet',  title: 'CLH-016: System Intelligence',      type: 'applet', href: '../../../houses/script/applets/linux/script-clh-016-system-intel.applet.html' },
                { id: 'clh-019-ir-applet',  title: 'CLH-019: Disk Forensics',           type: 'applet', href: '../../../houses/script/applets/linux/script-clh-019-disk-forensics.applet.html' },
                { id: 'clh-028-ir-applet',  title: 'CLH-028: Monitoring',               type: 'applet', href: '../../../houses/script/applets/linux/script-clh-028-monitoring.applet.html' },
                { id: 'lab-bash-log-proc',  title: 'Bash Log Processor Prep',           type: 'lab', href: '../../../houses/script/labs/linux/script-bash-log-processor-prep.lab.html' },
                { id: 'lab-sysadmin-ref',   title: 'SysAdmin Reference Lab',            type: 'lab', href: '../../../houses/script/labs/linux/script-linux-sysadmin-reference.lab.html' },
                { id: 'lab-file-mgmt-prep', title: 'File Management Prep',              type: 'lab', href: '../../../houses/script/labs/linux/script-linux-file-mgmt-prep.lab.html' },
                // Anonymity & OPSEC labs
                { id: 'lab-anonymity-tor',  title: 'Anonymity: Tor',                  type: 'lab', href: '../../../houses/script/linux/labs/script-anonymity-tor.lab.html' },
                { id: 'lab-anonymity-vpn',  title: 'Anonymity: VPN',                  type: 'lab', href: '../../../houses/script/linux/labs/script-anonymity-vpn.lab.html' },
                { id: 'lab-anonymity-adv',  title: 'Anonymity: Advanced OPSEC',       type: 'lab', href: '../../../houses/script/linux/labs/script-anonymity-advanced.lab.html' },
                { id: 'lab-process-monitor',title: 'Process Monitor Lab',              type: 'lab', href: '../../../houses/script/linux/labs/script-process-monitor.lab.html' }
            ]
        },

        // -----------------------------------------------------------------------
        // DRAGON FACTION — District 10 (was 9): Offensive Tools
        // Kali/Parrot tools, enumeration, exploitation fundamentals.
        // + 13 Dark Arts offensive Linux labs
        // -----------------------------------------------------------------------
        {
            id: 'offensive-tools',
            name: 'Offensive Tools',
            faction: 'dragon',
            icon: '\u2620',
            description: 'Learn to think like the attacker. Enumeration, reconnaissance, and exploitation — the offensive side of the Linux command line.',
            lore: 'Dragon recruits study offense to understand defense at a level no textbook can teach. To break the system is to know the system.',
            difficulty: 5,
            modules: [
                { id: 'clh-002-off-applet', title: 'CLH-002: Navigation Recon',      type: 'applet', href: '../../../houses/script/applets/linux/script-clh-002-navigation-recon.applet.html' },
                { id: 'clh-003-off-applet', title: 'CLH-003: Pattern Hunting',       type: 'applet', href: '../../../houses/script/applets/linux/script-clh-003-pattern-hunting.applet.html' },
                { id: 'clh-016-off-applet', title: 'CLH-016: System Intelligence',   type: 'applet', href: '../../../houses/script/applets/linux/script-clh-016-system-intel.applet.html' },
                { id: 'lab-file-search-off',title: 'File Search Lab',                type: 'lab', href: '../../../houses/script/labs/linux/script-linux-file-search.lab.html' },
                { id: 'lab-mission-file-search', title: 'Mission: File Search',      type: 'lab', href: '../../../houses/script/linux/labs/script-mission-file-search.lab.html' },
                { id: 'game-shell-sprint',  title: 'Shell Sprint (Game)',            type: 'game', href: '../../../houses/script/games/script-shell-sprint.applet.html' },
                { id: 'game-pipe-snake',    title: 'Pipe Snake (Game)',              type: 'game', href: '../../../houses/script/games/script-pipe-snake.applet.html' },
                // Dark Arts offensive labs
                { id: 'da-nmap-drill',      title: 'Nmap Drill',                     type: 'lab', href: '../../../dark-arts/vault/labs/linux/da-linux-nmap-drill.lab.html', progressHouse: 'dark-arts' },
                { id: 'da-nmap-advanced',   title: 'Nmap Advanced',                  type: 'lab', href: '../../../dark-arts/vault/labs/linux/da-linux-nmap-advanced.lab.html', progressHouse: 'dark-arts' },
                { id: 'da-hash-drill',      title: 'Hash Drill',                     type: 'lab', href: '../../../dark-arts/vault/labs/linux/da-linux-hash-drill.lab.html', progressHouse: 'dark-arts' },
                { id: 'da-hashcat',         title: 'Hashcat Lab',                    type: 'lab', href: '../../../dark-arts/vault/labs/linux/da-linux-hashcat.lab.html', progressHouse: 'dark-arts' },
                { id: 'da-recon-drill',     title: 'Recon Drill',                    type: 'lab', href: '../../../dark-arts/vault/labs/linux/da-linux-recon-drill.lab.html', progressHouse: 'dark-arts' },
                { id: 'da-enumeration',     title: 'Enumeration Prep',               type: 'lab', href: '../../../dark-arts/vault/labs/linux/da-linux-enumeration-prep.lab.html', progressHouse: 'dark-arts' },
                { id: 'da-enumscripts',     title: 'Enum Scripts Lab',               type: 'lab', href: '../../../dark-arts/vault/labs/linux/da-linux-enumscripts.lab.html', progressHouse: 'dark-arts' },
                { id: 'da-exploitation',    title: 'Exploitation Prep',              type: 'lab', href: '../../../dark-arts/vault/labs/linux/da-linux-exploitation-prep.lab.html', progressHouse: 'dark-arts' },
                { id: 'da-hydra',           title: 'Hydra Lab',                      type: 'lab', href: '../../../dark-arts/vault/labs/linux/da-linux-hydra.lab.html', progressHouse: 'dark-arts' },
                { id: 'da-metasploit',      title: 'Metasploit Lab',                 type: 'lab', href: '../../../dark-arts/vault/labs/linux/da-linux-metasploit.lab.html', progressHouse: 'dark-arts' },
                { id: 'da-privesc',         title: 'Privilege Escalation Lab',       type: 'lab', href: '../../../dark-arts/vault/labs/linux/da-linux-privesc.lab.html', progressHouse: 'dark-arts' },
                { id: 'da-reverse-shells',  title: 'Reverse Shells Lab',             type: 'lab', href: '../../../dark-arts/vault/labs/linux/da-linux-reverse-shells.lab.html', progressHouse: 'dark-arts' },
                { id: 'da-post-exploit',    title: 'Post-Exploitation Lab',          type: 'lab', href: '../../../dark-arts/vault/labs/linux/da-linux-post-exploitation.lab.html', progressHouse: 'dark-arts' }
            ]
        },

        // -----------------------------------------------------------------------
        // DRAGON FACTION — District 11 (was 10): Network Operations
        // SSH deep dive, network recon, firewall ops.
        // + SSH basics & advanced labs
        // -----------------------------------------------------------------------
        {
            id: 'network-ops',
            name: 'Network Operations',
            faction: 'dragon',
            icon: '\u25CE',
            description: 'The Arctic\'s communication layer. SSH operations, network reconnaissance, DNS investigation, and firewall control from the command line.',
            lore: 'Dragon operators must control the network. Lateral movement, tunneling, and scanning — the tradecraft of network-level offense.',
            difficulty: 5,
            modules: [
                // CLH course modules + applets (lesson → practice → assessment)
                // CLH-012
                { id: 'clh-012-intro',      title: 'CLH-012: Network Basics (Lesson)', type: 'module', href: '../../../houses/script/courses/clh/modules/clh-012/script-intro.module.html' },
                { id: 'clh-012-applet',     title: 'CLH-012: Network Basics',        type: 'applet', href: '../../../houses/script/applets/linux/script-clh-012-network-basics.applet.html' },
                { id: 'clh-012-lab',        title: 'CLH-012: Network Basics (Lab)',    type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-012/script-lab.lab.html', progressKey: 'script-clh-012-lab' },
                { id: 'clh-012-quiz',       title: 'CLH-012: Network Basics (Quiz)',   type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-012/script-quiz.quiz.html' },
                // CLH-021
                { id: 'clh-021-intro',      title: 'CLH-021: SSH Operations (Lesson)', type: 'module', href: '../../../houses/script/courses/clh/modules/clh-021/script-intro.module.html' },
                { id: 'clh-021-applet',     title: 'CLH-021: SSH Operations',        type: 'applet', href: '../../../houses/script/applets/linux/script-clh-021-ssh-ops.applet.html' },
                { id: 'clh-021-lab',        title: 'CLH-021: SSH Operations (Lab)',    type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-021/script-lab.lab.html', progressKey: 'script-clh-021-lab' },
                { id: 'clh-021-quiz',       title: 'CLH-021: SSH Operations (Quiz)',   type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-021/script-quiz.quiz.html' },
                // CLH-022
                { id: 'clh-022-intro',      title: 'CLH-022: Network Recon (Lesson)', type: 'module', href: '../../../houses/script/courses/clh/modules/clh-022/script-intro.module.html' },
                { id: 'clh-022-applet',     title: 'CLH-022: Network Recon',         type: 'applet', href: '../../../houses/script/applets/linux/script-clh-022-network-recon.applet.html' },
                { id: 'clh-022-lab',        title: 'CLH-022: Network Recon (Lab)',     type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-022/script-lab.lab.html', progressKey: 'script-clh-022-lab' },
                { id: 'clh-022-quiz',       title: 'CLH-022: Network Recon (Quiz)',    type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-022/script-quiz.quiz.html' },
                { id: 'lm-35-network-info', title: 'Network Information',            type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-35-network-info.module.html' },
                { id: 'lm-36-connectivity', title: 'Connectivity Testing',           type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-36-connectivity.module.html' },
                { id: 'lm-37-dns',          title: 'DNS Tools (dig/nslookup)',       type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-37-dns-tools.module.html' },
                { id: 'lm-38-downloading',  title: 'Downloading (wget/curl)',        type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-38-downloading.module.html' },
                { id: 'lm-39-ssh',          title: 'SSH Basics',                     type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-39-ssh-basics.module.html' },
                { id: 'lm-40-s6-practice',  title: 'Section 6 Practice',            type: 'module', href: '../../../houses/script/modules/linux-mastery/script-lm-40-section6-practice.module.html' },
                { id: 'lab-ssh',            title: 'SSH Lab',                        type: 'lab', href: '../../../houses/script/labs/linux/script-linux-ssh.lab.html' },
                { id: 'lab-network-drill',  title: 'Network Drill',                  type: 'lab', href: '../../../houses/script/labs/linux/script-linux-network-drill.lab.html' },
                // SSH labs
                { id: 'lab-ssh-basics',     title: 'SSH Basics Lab',                 type: 'lab', href: '../../../houses/script/linux/labs/script-ssh-basics.lab.html' },
                { id: 'lab-ssh-advanced',   title: 'SSH Advanced Lab',               type: 'lab', href: '../../../houses/script/linux/labs/script-ssh-advanced.lab.html' }
            ]
        },

        // -----------------------------------------------------------------------
        // DRAGON FACTION — District 12 (was 11): Arena
        // CTF showcase, BoxEngine integration. A1-A20.
        // -----------------------------------------------------------------------
        {
            id: 'arena',
            name: 'The Arena',
            faction: 'dragon',
            icon: '\u2588',
            description: 'The frozen arena at the top of the world. Full CTF boxes, exploitation challenges, and the ultimate test of everything learned in the Arctic.',
            lore: 'Only those who have walked all districts may enter the Arena. Here, the Dragon Order proves mastery.',
            difficulty: 6,
            modules: [
                { id: 'arena-a1',   title: 'A1: Ancient Ledger (SQL Injection)',   type: 'lab', href: '../../../arena/boxes/a1-ancient-ledger/index.html' },
                { id: 'arena-a2',   title: 'A2: Whispering Wall',                  type: 'lab', href: '../../../arena/boxes/a2-whispering-wall/index.html' },
                { id: 'arena-a3',   title: 'A3: Phantom Shell',                   type: 'lab', href: '../../../arena/boxes/a3-phantom-shell/index.html' },
                { id: 'arena-a4',   title: 'A4: Lost Root',                      type: 'lab', href: '../../../arena/boxes/a4-lost-root/index.html' },
                { id: 'arena-a5',   title: "A5: Custodian's Key",                type: 'lab', href: '../../../arena/boxes/a5-custodians-key/index.html' },
                { id: 'arena-a6',   title: 'A6: Broken Cipher',                  type: 'lab', href: '../../../arena/boxes/a6-broken-cipher/index.html' },
                { id: 'arena-a7',   title: 'A7: Hollow Database',                type: 'lab', href: '../../../arena/boxes/a7-hollow-database/index.html' },
                { id: 'arena-a8',   title: 'A8: Forgotten Upload',               type: 'lab', href: '../../../arena/boxes/a8-forgotten-upload/index.html' },
                { id: 'arena-a9',   title: 'A9: Rusted Lock',                    type: 'lab', href: '../../../arena/boxes/a9-rusted-lock/index.html' },
                { id: 'arena-a10',  title: 'A10: Glass Tunnel',                  type: 'lab', href: '../../../arena/boxes/a10-glass-tunnel/index.html' },
                { id: 'arena-a11',  title: 'A11: Dockerized Vault',              type: 'lab', href: '../../../arena/boxes/a11-dockerized-vault/index.html' },
                { id: 'arena-a12',  title: 'A12: Mobile Scapegoat',              type: 'lab', href: '../../../arena/boxes/a12-mobile-scapegoat/index.html' },
                { id: 'arena-a13',  title: 'A13: Rogue Sensor',                  type: 'lab', href: '../../../arena/boxes/a13-rogue-sensor/index.html' },
                { id: 'arena-a14',  title: 'A14: Ghost Machine',                 type: 'lab', href: '../../../arena/boxes/a14-ghost-machine/index.html' },
                { id: 'arena-a15',  title: 'A15: Spectral Interceptor',          type: 'lab', href: '../../../arena/boxes/a15-spectral-interceptor/index.html' },
                { id: 'arena-a16',  title: 'A16: Corrupted Core',                type: 'lab', href: '../../../arena/boxes/a16-corrupted-core/index.html' },
                { id: 'arena-a17',  title: 'A17: Whisper Campaign',              type: 'lab', href: '../../../arena/boxes/a17-whisper-campaign/index.html' },
                { id: 'arena-a18',  title: 'A18: Ghost RAM',                     type: 'lab', href: '../../../arena/boxes/a18-ghost-ram/index.html' },
                { id: 'arena-a19',  title: 'A19: Foundation\'s Fault',           type: 'lab', href: '../../../arena/boxes/a19-foundations-fault/index.html' },
                { id: 'arena-a20',  title: 'A20: Project Chimera',               type: 'lab', href: '../../../arena/boxes/a20-project-chimera/index.html' },
                { id: 'clh-030-arena',title: 'CLH-030: Chimera (Multi-Skill)',     type: 'applet', href: '../../../houses/script/applets/linux/script-clh-030-chimera.applet.html' },
                { id: 'clh-031-arena',title: 'CLH-031: Blackout (Final Boss)',     type: 'applet', href: '../../../houses/script/applets/linux/script-clh-031-blackout.applet.html' },
                // CLH-031 course content (intro briefing → lab → debrief quiz)
                { id: 'clh-031-intro',title: 'CLH-031: Blackout (Briefing)',       type: 'module', href: '../../../houses/script/courses/clh/modules/clh-031/script-intro.module.html' },
                { id: 'clh-031-lab',  title: 'CLH-031: Blackout (Lab)',            type: 'lab',    href: '../../../houses/script/courses/clh/modules/clh-031/script-lab.lab.html', progressKey: 'script-clh-031-lab' },
                { id: 'clh-031-quiz', title: 'CLH-031: Blackout (Debrief)',        type: 'quiz',   href: '../../../houses/script/courses/clh/modules/clh-031/script-quiz.quiz.html' }
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
            module:   '\u25A0',   // filled square
            lab:      '\u25CB',   // circle
            applet:   '\u25BA',   // right pointer
            quiz:     '\u25C6',   // diamond
            tool:     '\u2736',   // six-pointed star
            game:     '\u2605',   // star
            review:   '\u21BB'    // clockwise arrow
        };
        return icons[type] || '\u25A1'; // open square fallback
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
