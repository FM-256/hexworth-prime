/**
 * AchievementSystem.js - Achievement/Badge System for Hexworth Prime
 *
 * Manages all achievements including:
 * - Achievement definitions with icons, descriptions, points
 * - Unlock conditions and checking
 * - Notification display when achievements are earned
 * - Achievement gallery for viewing earned badges
 */

class AchievementSystem {
    static STORAGE_KEY = 'hexworth_achievements';

    // All available achievements
    static ACHIEVEMENTS = {
        // === GETTING STARTED ===
        first_login: {
            id: 'first_login',
            name: 'First Steps',
            description: 'Begin your journey at Hexworth Prime',
            icon: '👣',
            category: 'milestone',
            points: 10,
            secret: false
        },
        sorted: {
            id: 'sorted',
            name: 'Sorted!',
            description: 'Complete the house sorting ceremony',
            icon: '🎓',
            category: 'milestone',
            points: 25,
            secret: false
        },
        first_module: {
            id: 'first_module',
            name: 'Getting Started',
            description: 'Complete your first module',
            icon: '🌟',
            category: 'milestone',
            points: 50,
            secret: false
        },

        // === QUIZ ACHIEVEMENTS ===
        first_quiz: {
            id: 'first_quiz',
            name: 'Quiz Taker',
            description: 'Pass your first quiz',
            icon: '📝',
            category: 'quiz',
            points: 50,
            secret: false
        },
        perfect_score: {
            id: 'perfect_score',
            name: 'Perfectionist',
            description: 'Score 100% on any quiz',
            icon: '💯',
            category: 'quiz',
            points: 100,
            secret: false
        },
        quiz_master_10: {
            id: 'quiz_master_10',
            name: 'Quiz Apprentice',
            description: 'Pass 10 quizzes',
            icon: '📚',
            category: 'quiz',
            points: 150,
            secret: false
        },
        quiz_master_25: {
            id: 'quiz_master_25',
            name: 'Quiz Master',
            description: 'Pass 25 quizzes',
            icon: '🏆',
            category: 'quiz',
            points: 300,
            secret: false
        },
        persistence: {
            id: 'persistence',
            name: 'Persistent',
            description: 'Pass a quiz after 3 or more attempts',
            icon: '💪',
            category: 'quiz',
            points: 75,
            secret: false
        },
        speed_demon: {
            id: 'speed_demon',
            name: 'Speed Demon',
            description: 'Complete a timed quiz with 50%+ time remaining',
            icon: '⚡',
            category: 'quiz',
            points: 100,
            secret: false
        },

        // === HOUSE-SPECIFIC ACHIEVEMENTS ===
        // Shield House
        'shield-cia-master': {
            id: 'shield-cia-master',
            name: 'CIA Triad Master',
            description: 'Master the fundamentals of information security',
            icon: '🛡️',
            category: 'shield',
            points: 100,
            secret: false
        },
        shield_apprentice: {
            id: 'shield_apprentice',
            name: 'Shield Apprentice',
            description: 'Complete 5 Shield House modules',
            icon: '🛡️',
            category: 'shield',
            points: 150,
            secret: false
        },
        shield_master: {
            id: 'shield_master',
            name: 'Shield Master',
            description: 'Complete all Shield House core modules',
            icon: '⚔️',
            category: 'shield',
            points: 500,
            secret: false
        },

        // Web House
        web_apprentice: {
            id: 'web_apprentice',
            name: 'Network Novice',
            description: 'Complete 5 Web House modules',
            icon: '🌐',
            category: 'web',
            points: 150,
            secret: false
        },
        web_master: {
            id: 'web_master',
            name: 'Network Master',
            description: 'Complete all Web House core modules',
            icon: '🕸️',
            category: 'web',
            points: 500,
            secret: false
        },
        subnetting_wizard: {
            id: 'subnetting_wizard',
            name: 'Subnetting Wizard',
            description: 'Score 100% on the subnetting quiz',
            icon: '🧮',
            category: 'web',
            points: 200,
            secret: false
        },

        // Forge House
        forge_apprentice: {
            id: 'forge_apprentice',
            name: 'Forge Apprentice',
            description: 'Complete 5 Forge House modules',
            icon: '🔨',
            category: 'forge',
            points: 150,
            secret: false
        },
        forge_master: {
            id: 'forge_master',
            name: 'Master Smith',
            description: 'Complete all Forge House core modules',
            icon: '⚒️',
            category: 'forge',
            points: 500,
            secret: false
        },

        // Script House
        script_apprentice: {
            id: 'script_apprentice',
            name: 'Script Kiddie',
            description: 'Complete 5 Script House modules',
            icon: '📜',
            category: 'script',
            points: 150,
            secret: false
        },
        script_master: {
            id: 'script_master',
            name: 'Script Sorcerer',
            description: 'Complete all Script House core modules',
            icon: '🧙',
            category: 'script',
            points: 500,
            secret: false
        },

        // Cloud House
        cloud_apprentice: {
            id: 'cloud_apprentice',
            name: 'Cloud Climber',
            description: 'Complete 5 Cloud House modules',
            icon: '☁️',
            category: 'cloud',
            points: 150,
            secret: false
        },
        cloud_master: {
            id: 'cloud_master',
            name: 'Cloud Architect',
            description: 'Complete all Cloud House core modules',
            icon: '🏔️',
            category: 'cloud',
            points: 500,
            secret: false
        },

        // Code House
        code_apprentice: {
            id: 'code_apprentice',
            name: 'Code Cadet',
            description: 'Complete 5 Code House modules',
            icon: '💻',
            category: 'code',
            points: 150,
            secret: false
        },
        code_master: {
            id: 'code_master',
            name: 'DevOps Champion',
            description: 'Complete all Code House core modules',
            icon: '🚀',
            category: 'code',
            points: 500,
            secret: false
        },

        // Key House
        key_apprentice: {
            id: 'key_apprentice',
            name: 'Crypto Curious',
            description: 'Complete 5 Key House modules',
            icon: '🔑',
            category: 'key',
            points: 150,
            secret: false
        },
        key_master: {
            id: 'key_master',
            name: 'Cryptographer',
            description: 'Complete all Key House core modules',
            icon: '🔐',
            category: 'key',
            points: 500,
            secret: false
        },

        // Eye House
        eye_apprentice: {
            id: 'eye_apprentice',
            name: 'Watchful Eye',
            description: 'Complete 5 Eye House modules',
            icon: '👁️',
            category: 'eye',
            points: 150,
            secret: false
        },
        eye_master: {
            id: 'eye_master',
            name: 'All-Seeing',
            description: 'Complete all Eye House core modules',
            icon: '🔮',
            category: 'eye',
            points: 500,
            secret: false
        },

        // === LEVEL ACHIEVEMENTS ===
        level_5: {
            id: 'level_5',
            name: 'Rising Star',
            description: 'Reach Level 5',
            icon: '⭐',
            category: 'level',
            points: 100,
            secret: false
        },
        level_10: {
            id: 'level_10',
            name: 'Seasoned Learner',
            description: 'Reach Level 10',
            icon: '🌟',
            category: 'level',
            points: 250,
            secret: false
        },
        level_15: {
            id: 'level_15',
            name: 'Hexworth Master',
            description: 'Reach Level 15 (Max Level)',
            icon: '👑',
            category: 'level',
            points: 500,
            secret: false
        },

        // === SPECIAL/SECRET ACHIEVEMENTS ===
        night_owl: {
            id: 'night_owl',
            name: 'Night Owl',
            description: 'Complete a module between midnight and 4 AM',
            icon: '🦉',
            category: 'special',
            points: 50,
            secret: true
        },
        early_bird: {
            id: 'early_bird',
            name: 'Early Bird',
            description: 'Complete a module between 5 AM and 7 AM',
            icon: '🐦',
            category: 'special',
            points: 50,
            secret: true
        },
        weekend_warrior: {
            id: 'weekend_warrior',
            name: 'Weekend Warrior',
            description: 'Study on both Saturday and Sunday',
            icon: '⚔️',
            category: 'special',
            points: 75,
            secret: true
        },
        streak_7: {
            id: 'streak_7',
            name: 'Week Streak',
            description: 'Study for 7 consecutive days',
            icon: '🔥',
            category: 'special',
            points: 150,
            secret: false
        },
        multi_house: {
            id: 'multi_house',
            name: 'Renaissance Learner',
            description: 'Complete modules in all 8 houses',
            icon: '🎭',
            category: 'special',
            points: 200,
            secret: false
        },
        dark_arts_gate1: {
            id: 'dark_arts_gate1',
            name: 'Gate Keeper',
            description: 'Open the first gate to the Dark Arts',
            icon: '🚪',
            category: 'dark_arts',
            points: 100,
            secret: true
        },
        dark_arts_master: {
            id: 'dark_arts_master',
            name: 'Dark Arts Master',
            description: 'Complete all five gates',
            icon: '💀',
            category: 'dark_arts',
            points: 500,
            secret: true
        },

        // === EXPLORER ACHIEVEMENTS ===
        explorer: {
            id: 'explorer',
            name: 'Explorer',
            description: 'Visit 50 different pages',
            icon: '🗺️',
            category: 'explorer',
            points: 100,
            secret: false
        },
        lab_rat: {
            id: 'lab_rat',
            name: 'Lab Rat',
            description: 'Complete 10 hands-on labs',
            icon: '🔬',
            category: 'explorer',
            points: 200,
            secret: false
        },

        // ═══════════════════════════════════════════════════════════════
        // FACTIONLESS / DIVERGENT ACHIEVEMENTS
        // ═══════════════════════════════════════════════════════════════
        perspective_seeker: {
            id: 'perspective_seeker',
            name: 'Perspective Seeker',
            description: 'Complete at least one item in each skill tree perspective',
            icon: '🔀',
            category: 'factionless',
            points: 100,
            secret: false
        },
        fundamentals_scholar: {
            id: 'fundamentals_scholar',
            name: 'Fundamentals Scholar',
            description: 'Complete all items in the Fundamentals perspective',
            icon: '📚',
            category: 'factionless',
            points: 500,
            secret: false
        },
        tool_wielder: {
            id: 'tool_wielder',
            name: 'Tool Wielder',
            description: 'Complete all items in the Tools perspective',
            icon: '🔧',
            category: 'factionless',
            points: 500,
            secret: false
        },
        skill_master: {
            id: 'skill_master',
            name: 'Skill Master',
            description: 'Complete all items in the Skills perspective',
            icon: '⚔️',
            category: 'factionless',
            points: 500,
            secret: false
        },
        true_divergent: {
            id: 'true_divergent',
            name: 'True Divergent',
            description: 'Complete all three skill tree perspectives at 100%',
            icon: '🌟',
            category: 'factionless',
            points: 2000,
            secret: false
        },
        domain_explorer: {
            id: 'domain_explorer',
            name: 'Domain Explorer',
            description: 'Complete at least one folder in each perspective',
            icon: '🗂️',
            category: 'factionless',
            points: 200,
            secret: false
        },
        multi_domain: {
            id: 'multi_domain',
            name: 'Multi-Domain Specialist',
            description: 'Achieve 50%+ completion in 3 or more skill domains',
            icon: '🌐',
            category: 'factionless',
            points: 300,
            secret: false
        },
        jack_of_trades: {
            id: 'jack_of_trades',
            name: 'Jack of All Trades',
            description: 'Complete at least one item from every folder in the skill tree',
            icon: '🃏',
            category: 'factionless',
            points: 400,
            secret: false
        },
        the_polymath: {
            id: 'the_polymath',
            name: 'The Polymath',
            description: 'Achieve 75%+ completion across all skill tree perspectives',
            icon: '🧠',
            category: 'factionless',
            points: 1000,
            secret: false
        },
        path_finder: {
            id: 'path_finder',
            name: 'Path Finder',
            description: 'Discover all 3 perspectives of the Factionless skill tree',
            icon: '🧭',
            category: 'factionless',
            points: 50,
            secret: false
        },
        terminal_explorer: {
            id: 'terminal_explorer',
            name: 'Terminal Explorer',
            description: 'Navigate the skill tree using cd commands 50 times',
            icon: '📂',
            category: 'factionless',
            points: 75,
            secret: true
        },

        // ═══════════════════════════════════════════════════════════════
        // CROSS-HOUSE SPECIALIZATION BRANCH ACHIEVEMENTS
        // ═══════════════════════════════════════════════════════════════
        branch_security_analyst: {
            id: 'branch_security_analyst',
            name: 'Security Analyst',
            description: 'Unlock the Security Analyst career path',
            icon: '🔍',
            category: 'career',
            points: 500,
            secret: false
        },
        branch_cloud_security: {
            id: 'branch_cloud_security',
            name: 'Cloud Guardian',
            description: 'Unlock the Cloud Security Specialist path',
            icon: '🔒',
            category: 'career',
            points: 600,
            secret: false
        },
        branch_devops: {
            id: 'branch_devops',
            name: 'DevOps Engineer',
            description: 'Unlock the DevOps Engineer career path',
            icon: '🚀',
            category: 'career',
            points: 600,
            secret: false
        },
        branch_network: {
            id: 'branch_network',
            name: 'Network Architect',
            description: 'Unlock the Network Engineer career path',
            icon: '🌐',
            category: 'career',
            points: 700,
            secret: false
        },
        branch_sysadmin: {
            id: 'branch_sysadmin',
            name: 'Systems Administrator',
            description: 'Unlock the Systems Administrator path',
            icon: '🖥️',
            category: 'career',
            points: 500,
            secret: false
        },
        branch_crypto: {
            id: 'branch_crypto',
            name: 'Cryptographer',
            description: 'Unlock the Cryptographer career path',
            icon: '🔐',
            category: 'career',
            points: 700,
            secret: false
        },
        branch_pentester: {
            id: 'branch_pentester',
            name: 'Penetration Tester',
            description: 'Unlock the Penetration Tester path',
            icon: '🎯',
            category: 'career',
            points: 800,
            secret: false
        },
        branch_ir: {
            id: 'branch_ir',
            name: 'Incident Responder',
            description: 'Unlock the Incident Responder path',
            icon: '🚨',
            category: 'career',
            points: 800,
            secret: false
        },
        branch_master: {
            id: 'branch_master',
            name: 'Master Class Graduate',
            description: 'Unlock Master Class access at Level 15',
            icon: '👑',
            category: 'career',
            points: 1000,
            secret: false
        },
        triple_threat: {
            id: 'triple_threat',
            name: 'Triple Threat',
            description: 'Unlock 3 different career branches',
            icon: '⚡',
            category: 'career',
            points: 500,
            secret: false
        },
        renaissance_agent: {
            id: 'renaissance_agent',
            name: 'Renaissance Agent',
            description: 'Unlock 5 or more career branches',
            icon: '🎭',
            category: 'career',
            points: 1000,
            secret: false
        },
        complete_specialist: {
            id: 'complete_specialist',
            name: 'Complete Specialist',
            description: 'Unlock ALL career branches',
            icon: '🏆',
            category: 'career',
            points: 2500,
            secret: false
        },

        // ═══════════════════════════════════════════════════════════════
        // OPERATOR / MATRIX ACHIEVEMENTS
        // ═══════════════════════════════════════════════════════════════
        red_pill: {
            id: 'red_pill',
            name: 'Red Pill Taken',
            description: 'Choose to see how deep the rabbit hole goes',
            icon: '💊',
            category: 'operator',
            points: 100,
            secret: false
        },
        terminal_initiate: {
            id: 'terminal_initiate',
            name: 'Terminal Initiate',
            description: 'Execute your first command in the Matrix',
            icon: '⌨️',
            category: 'operator',
            points: 50,
            secret: false
        },
        command_warrior: {
            id: 'command_warrior',
            name: 'Command Line Warrior',
            description: 'Execute 50 commands in the Matrix terminal',
            icon: '🖥️',
            category: 'operator',
            points: 200,
            secret: false
        },
        neo_apprentice: {
            id: 'neo_apprentice',
            name: "Neo's Apprentice",
            description: 'Complete your first module via the terminal interface',
            icon: '🕴️',
            category: 'operator',
            points: 150,
            secret: false
        },
        the_one: {
            id: 'the_one',
            name: 'The One',
            description: 'Reach Level 10 as an Operator',
            icon: '☯️',
            category: 'operator',
            points: 500,
            secret: false
        },
        no_spoon: {
            id: 'no_spoon',
            name: 'There Is No Spoon',
            description: 'Complete all available Matrix training programs',
            icon: '🥄',
            category: 'operator',
            points: 1000,
            secret: false
        },
        operator_status: {
            id: 'operator_status',
            name: 'Operator Status',
            description: 'Guide 3 crew members through training (class assistance)',
            icon: '📞',
            category: 'operator',
            points: 300,
            secret: false
        },
        construct_master: {
            id: 'construct_master',
            name: 'Construct Master',
            description: 'Create a custom training construct (study path)',
            icon: '🏗️',
            category: 'operator',
            points: 200,
            secret: false
        },
        white_rabbit: {
            id: 'white_rabbit',
            name: 'Follow the White Rabbit',
            description: 'Find the hidden Matrix easter egg',
            icon: '🐰',
            category: 'operator',
            points: 250,
            secret: true
        },
        free_your_mind: {
            id: 'free_your_mind',
            name: 'Free Your Mind',
            description: 'Complete content from 5 different houses while in the Matrix',
            icon: '🧠',
            category: 'operator',
            points: 1500,
            secret: false
        },
        deja_vu: {
            id: 'deja_vu',
            name: 'Deja Vu',
            description: 'Complete the same module twice in the Matrix',
            icon: '🐈',
            category: 'operator',
            points: 50,
            secret: true
        },
        matrix_glitch: {
            id: 'matrix_glitch',
            name: 'Glitch in the Matrix',
            description: 'Trigger a hidden terminal animation',
            icon: '📺',
            category: 'operator',
            points: 100,
            secret: true
        },
        morpheus_wisdom: {
            id: 'morpheus_wisdom',
            name: "Morpheus' Wisdom",
            description: 'Access all terminal help documentation',
            icon: '🎩',
            category: 'operator',
            points: 75,
            secret: false
        },
        matrix_code: {
            id: 'matrix_code',
            name: 'I Know Kung Fu',
            description: 'Complete 10 modules in a single Matrix session',
            icon: '🥋',
            category: 'operator',
            points: 300,
            secret: false
        },

        // ═══════════════════════════════════════════════════════════════
        // ENHANCED HOUSE-SPECIFIC SPECIAL ACHIEVEMENTS
        // ═══════════════════════════════════════════════════════════════
        // Shield House Specials
        shield_cia_triad: {
            id: 'shield_cia_triad',
            name: 'Triad Guardian',
            description: 'Perfect score on CIA Triad fundamentals',
            icon: '🛡️',
            category: 'shield',
            points: 200,
            secret: false
        },
        shield_threat_hunter: {
            id: 'shield_threat_hunter',
            name: 'Threat Hunter',
            description: 'Complete all threat analysis modules',
            icon: '🎯',
            category: 'shield',
            points: 300,
            secret: false
        },
        shield_defender: {
            id: 'shield_defender',
            name: 'First Line Defender',
            description: 'Complete network security module with perfect score',
            icon: '🏰',
            category: 'shield',
            points: 250,
            secret: false
        },
        shield_social_engineer: {
            id: 'shield_social_engineer',
            name: 'Social Engineering Aware',
            description: 'Master social engineering defense techniques',
            icon: '🎭',
            category: 'shield',
            points: 200,
            secret: false
        },

        // Web House Specials
        web_osi_master: {
            id: 'web_osi_master',
            name: 'OSI Architect',
            description: 'Perfect understanding of OSI model layers',
            icon: '📊',
            category: 'web',
            points: 200,
            secret: false
        },
        web_vlan_virtuoso: {
            id: 'web_vlan_virtuoso',
            name: 'VLAN Virtuoso',
            description: 'Complete all switching and VLAN modules',
            icon: '🔌',
            category: 'web',
            points: 250,
            secret: false
        },
        web_routing_guru: {
            id: 'web_routing_guru',
            name: 'Routing Guru',
            description: 'Master static and dynamic routing concepts',
            icon: '🛤️',
            category: 'web',
            points: 300,
            secret: false
        },
        web_wireless_wizard: {
            id: 'web_wireless_wizard',
            name: 'Wireless Wizard',
            description: 'Complete all wireless networking content',
            icon: '📶',
            category: 'web',
            points: 200,
            secret: false
        },

        // Forge House Specials
        forge_hardware_expert: {
            id: 'forge_hardware_expert',
            name: 'Hardware Expert',
            description: 'Master all hardware components and troubleshooting',
            icon: '🔩',
            category: 'forge',
            points: 250,
            secret: false
        },
        forge_windows_whisperer: {
            id: 'forge_windows_whisperer',
            name: 'Windows Whisperer',
            description: 'Complete all Windows administration modules',
            icon: '🪟',
            category: 'forge',
            points: 300,
            secret: false
        },
        forge_troubleshooter: {
            id: 'forge_troubleshooter',
            name: 'Master Troubleshooter',
            description: 'Complete all troubleshooting methodology modules',
            icon: '🔧',
            category: 'forge',
            points: 250,
            secret: false
        },
        forge_raid_master: {
            id: 'forge_raid_master',
            name: 'RAID Master',
            description: 'Perfect score on storage and RAID concepts',
            icon: '💾',
            category: 'forge',
            points: 200,
            secret: false
        },

        // Script House Specials
        script_python_prodigy: {
            id: 'script_python_prodigy',
            name: 'Python Prodigy',
            description: 'Complete all Python fundamentals modules',
            icon: '🐍',
            category: 'script',
            points: 300,
            secret: false
        },
        script_bash_ninja: {
            id: 'script_bash_ninja',
            name: 'Bash Ninja',
            description: 'Master bash scripting and automation',
            icon: '🥷',
            category: 'script',
            points: 250,
            secret: false
        },
        script_linux_sage: {
            id: 'script_linux_sage',
            name: 'Linux Sage',
            description: 'Complete all Linux administration content',
            icon: '🐧',
            category: 'script',
            points: 300,
            secret: false
        },
        script_automator: {
            id: 'script_automator',
            name: 'The Automator',
            description: 'Master process and task automation',
            icon: '🤖',
            category: 'script',
            points: 250,
            secret: false
        },

        // Cloud House Specials
        cloud_aws_certified: {
            id: 'cloud_aws_certified',
            name: 'AWS Explorer',
            description: 'Complete all AWS fundamentals content',
            icon: '☁️',
            category: 'cloud',
            points: 300,
            secret: false
        },
        cloud_azure_adept: {
            id: 'cloud_azure_adept',
            name: 'Azure Adept',
            description: 'Complete all Azure fundamentals content',
            icon: '🔵',
            category: 'cloud',
            points: 300,
            secret: false
        },
        cloud_multi_cloud: {
            id: 'cloud_multi_cloud',
            name: 'Multi-Cloud Architect',
            description: 'Complete content across multiple cloud providers',
            icon: '🌩️',
            category: 'cloud',
            points: 400,
            secret: false
        },
        cloud_iam_master: {
            id: 'cloud_iam_master',
            name: 'IAM Master',
            description: 'Perfect score on identity and access management',
            icon: '🔑',
            category: 'cloud',
            points: 250,
            secret: false
        },

        // Code House Specials
        code_git_guru: {
            id: 'code_git_guru',
            name: 'Git Guru',
            description: 'Master version control with Git',
            icon: '📚',
            category: 'code',
            points: 250,
            secret: false
        },
        code_cicd_champion: {
            id: 'code_cicd_champion',
            name: 'CI/CD Champion',
            description: 'Complete all continuous integration content',
            icon: '♾️',
            category: 'code',
            points: 300,
            secret: false
        },
        code_container_captain: {
            id: 'code_container_captain',
            name: 'Container Captain',
            description: 'Master Docker and container concepts',
            icon: '🐳',
            category: 'code',
            points: 300,
            secret: false
        },
        code_k8s_knight: {
            id: 'code_k8s_knight',
            name: 'Kubernetes Knight',
            description: 'Complete Kubernetes orchestration content',
            icon: '☸️',
            category: 'code',
            points: 350,
            secret: false
        },

        // Key House Specials
        key_cipher_master: {
            id: 'key_cipher_master',
            name: 'Cipher Master',
            description: 'Master classical and modern ciphers',
            icon: '🔏',
            category: 'key',
            points: 250,
            secret: false
        },
        key_hash_hunter: {
            id: 'key_hash_hunter',
            name: 'Hash Hunter',
            description: 'Understand all hashing algorithms',
            icon: '#️⃣',
            category: 'key',
            points: 200,
            secret: false
        },
        key_pki_professional: {
            id: 'key_pki_professional',
            name: 'PKI Professional',
            description: 'Master public key infrastructure concepts',
            icon: '📜',
            category: 'key',
            points: 300,
            secret: false
        },
        key_entropy_expert: {
            id: 'key_entropy_expert',
            name: 'Entropy Expert',
            description: 'Understand randomness and key generation',
            icon: '🎲',
            category: 'key',
            points: 250,
            secret: false
        },

        // Eye House Specials
        eye_siem_specialist: {
            id: 'eye_siem_specialist',
            name: 'SIEM Specialist',
            description: 'Master security information and event management',
            icon: '📊',
            category: 'eye',
            points: 300,
            secret: false
        },
        eye_log_detective: {
            id: 'eye_log_detective',
            name: 'Log Detective',
            description: 'Complete all log analysis modules',
            icon: '🔍',
            category: 'eye',
            points: 250,
            secret: false
        },
        eye_pattern_hunter: {
            id: 'eye_pattern_hunter',
            name: 'Pattern Hunter',
            description: 'Identify attack patterns in log data',
            icon: '🎯',
            category: 'eye',
            points: 300,
            secret: false
        },
        eye_alert_analyst: {
            id: 'eye_alert_analyst',
            name: 'Alert Analyst',
            description: 'Master alert triage and prioritization',
            icon: '🚨',
            category: 'eye',
            points: 250,
            secret: false
        },

        // ═══════════════════════════════════════════════════════════════
        // DARK ARTS EXPANDED
        // ═══════════════════════════════════════════════════════════════
        dark_arts_gate2: {
            id: 'dark_arts_gate2',
            name: 'Second Seal',
            description: 'Pass through the second gate',
            icon: '🔓',
            category: 'dark_arts',
            points: 150,
            secret: true
        },
        dark_arts_gate3: {
            id: 'dark_arts_gate3',
            name: 'Third Eye Opens',
            description: 'Pass through the third gate',
            icon: '👁️',
            category: 'dark_arts',
            points: 200,
            secret: true
        },
        dark_arts_gate4: {
            id: 'dark_arts_gate4',
            name: 'Frequency Walker',
            description: 'Pass through the fourth gate',
            icon: '📻',
            category: 'dark_arts',
            points: 250,
            secret: true
        },
        dark_arts_gate5: {
            id: 'dark_arts_gate5',
            name: 'Synthesis Complete',
            description: 'Pass through the final gate',
            icon: '🗝️',
            category: 'dark_arts',
            points: 300,
            secret: true
        },
        dark_arts_gate6: {
            id: 'dark_arts_gate6',
            name: 'Analyst',
            description: 'Complete the static analysis challenge',
            icon: '🔬',
            category: 'dark_arts',
            points: 400,
            secret: true
        },
        dark_arts_gate7: {
            id: 'dark_arts_gate7',
            name: 'Sentinel',
            description: 'Complete the threat intelligence challenge',
            icon: '🛡️',
            category: 'dark_arts',
            points: 400,
            secret: true
        },
        dark_arts_gate8: {
            id: 'dark_arts_gate8',
            name: 'Master Investigator',
            description: 'Complete Operation Gone Dark',
            icon: '🕵️',
            category: 'dark_arts',
            points: 500,
            secret: true
        },
        dark_arts_gate9: {
            id: 'dark_arts_gate9',
            name: 'Phantom',
            description: 'Complete the reverse engineering challenge',
            icon: '👁',
            category: 'dark_arts',
            points: 500,
            secret: true
        },
        dark_arts_gate10: {
            id: 'dark_arts_gate10',
            name: 'Grandmaster',
            description: 'Complete the incident response capstone',
            icon: '💀',
            category: 'dark_arts',
            points: 1000,
            secret: true
        },
        dark_arts_vault: {
            id: 'dark_arts_vault',
            name: 'Vault Keeper',
            description: 'Access the Dark Arts Vault',
            icon: '🏛️',
            category: 'dark_arts',
            points: 500,
            secret: true
        },
        dark_arts_yara: {
            id: 'dark_arts_yara',
            name: 'YARA Initiate',
            description: 'Complete YARA rule training',
            icon: '📝',
            category: 'dark_arts',
            points: 300,
            secret: false
        },
        dark_arts_malware_basics: {
            id: 'dark_arts_malware_basics',
            name: 'Know Thy Enemy',
            description: 'Complete malware fundamentals',
            icon: '🦠',
            category: 'dark_arts',
            points: 350,
            secret: false
        },
        dark_arts_speedrun: {
            id: 'dark_arts_speedrun',
            name: 'Gate Speedrunner',
            description: 'Complete all 5 gates in under 30 minutes',
            icon: '⏱️',
            category: 'dark_arts',
            points: 500,
            secret: true
        },

        // ═══════════════════════════════════════════════════════════════
        // SURVIVAL GAMES
        // ═══════════════════════════════════════════════════════════════
        game_domain_win: {
            id: 'game_domain_win',
            name: 'Domain Defender',
            description: "Neutralize the threat in Don't Lose Your Domain",
            icon: '🛡️',
            category: 'games',
            points: 150,
            secret: false
        },
        game_domain_by_the_book: {
            id: 'game_domain_by_the_book',
            name: 'AD Incident Pro',
            description: 'Disable + remove DA + reset password in one run',
            icon: '📘',
            category: 'games',
            points: 300,
            secret: false
        },
        game_domain_speed: {
            id: 'game_domain_speed',
            name: 'Rapid Response: AD',
            description: "Speed run Don't Lose Your Domain",
            icon: '⚡',
            category: 'games',
            points: 200,
            secret: true
        },
        game_domain_all: {
            id: 'game_domain_all',
            name: 'Domain Master',
            description: "Unlock all 12 achievements in Don't Lose Your Domain",
            icon: '👑',
            category: 'games',
            points: 500,
            secret: true
        },
        game_brick_win: {
            id: 'game_brick_win',
            name: 'Endpoint Savior',
            description: "Contain the threat in Don't Brick the PC",
            icon: '💻',
            category: 'games',
            points: 150,
            secret: false
        },
        game_brick_by_the_book: {
            id: 'game_brick_by_the_book',
            name: 'CompTIA Methodologist',
            description: 'Follow full troubleshooting methodology in one run',
            icon: '📘',
            category: 'games',
            points: 300,
            secret: false
        },
        game_brick_speed: {
            id: 'game_brick_speed',
            name: 'Rapid Response: IR',
            description: "Speed run Don't Brick the PC",
            icon: '⚡',
            category: 'games',
            points: 200,
            secret: true
        },
        game_brick_all: {
            id: 'game_brick_all',
            name: 'Helpdesk Hero',
            description: "Unlock all 12 achievements in Don't Brick the PC",
            icon: '👑',
            category: 'games',
            points: 500,
            secret: true
        },
        game_phished_win: {
            id: 'game_phished_win',
            name: 'Phishing Defender',
            description: "Contain the phishing campaign in Don't Get Phished",
            icon: '🎣',
            category: 'games',
            points: 150,
            secret: false
        },
        game_phished_by_the_book: {
            id: 'game_phished_by_the_book',
            name: 'NIST IR Pro',
            description: 'Complete the full NIST IR lifecycle in one run',
            icon: '📘',
            category: 'games',
            points: 300,
            secret: false
        },
        game_phished_speed: {
            id: 'game_phished_speed',
            name: 'Rapid Response: SOC',
            description: "Speed run Don't Get Phished",
            icon: '⚡',
            category: 'games',
            points: 200,
            secret: true
        },
        game_phished_all: {
            id: 'game_phished_all',
            name: 'SOC Master',
            description: "Unlock all 12 achievements in Don't Get Phished",
            icon: '👑',
            category: 'games',
            points: 500,
            secret: true
        },
        game_server_win: {
            id: 'game_server_win',
            name: 'Server Savior',
            description: "Fix the server in Don't Kill the Server",
            icon: '🐧',
            category: 'games',
            points: 150,
            secret: false
        },
        game_server_by_the_book: {
            id: 'game_server_by_the_book',
            name: 'Methodical Sysadmin',
            description: 'Follow full sysadmin methodology in one run',
            icon: '📘',
            category: 'games',
            points: 300,
            secret: false
        },
        game_server_speed: {
            id: 'game_server_speed',
            name: 'Rapid Response: Linux',
            description: "Speed run Don't Kill the Server",
            icon: '⚡',
            category: 'games',
            points: 200,
            secret: true
        },
        game_server_all: {
            id: 'game_server_all',
            name: 'Sysadmin Legend',
            description: "Unlock all 12 achievements in Don't Kill the Server",
            icon: '👑',
            category: 'games',
            points: 500,
            secret: true
        },
        game_packet_win: {
            id: 'game_packet_win',
            name: 'Network Savior',
            description: "Fix the network in Don't Drop the Packet",
            icon: '🌐',
            category: 'games',
            points: 150,
            secret: false
        },
        game_packet_by_the_book: {
            id: 'game_packet_by_the_book',
            name: 'Network Methodologist',
            description: 'Follow full Network+ troubleshooting methodology',
            icon: '📘',
            category: 'games',
            points: 300,
            secret: false
        },
        game_packet_speed: {
            id: 'game_packet_speed',
            name: 'Rapid Response: Network',
            description: "Speed run Don't Drop the Packet",
            icon: '⚡',
            category: 'games',
            points: 200,
            secret: true
        },
        game_packet_all: {
            id: 'game_packet_all',
            name: 'Network Legend',
            description: "Unlock all 12 achievements in Don't Drop the Packet",
            icon: '👑',
            category: 'games',
            points: 500,
            secret: true
        },
        game_deploy_win: {
            id: 'game_deploy_win',
            name: 'Friday Survivor',
            description: "Fix the deploy in Don't Deploy on Friday",
            icon: '🚀',
            category: 'games',
            points: 150,
            secret: false
        },
        game_deploy_by_the_book: {
            id: 'game_deploy_by_the_book',
            name: 'CI/CD Professional',
            description: 'Follow full DevOps methodology in one run',
            icon: '📘',
            category: 'games',
            points: 300,
            secret: false
        },
        game_deploy_speed: {
            id: 'game_deploy_speed',
            name: 'Rapid Response: DevOps',
            description: "Speed run Don't Deploy on Friday",
            icon: '⚡',
            category: 'games',
            points: 200,
            secret: true
        },
        game_deploy_all: {
            id: 'game_deploy_all',
            name: 'DevOps Legend',
            description: "Unlock all 12 achievements in Don't Deploy on Friday",
            icon: '👑',
            category: 'games',
            points: 500,
            secret: true
        },
        game_troll_win: {
            id: 'game_troll_win',
            name: 'Troll Tamer',
            description: "Contain the threat in Don't Feed the Troll",
            icon: '👁️',
            category: 'games',
            points: 150,
            secret: false
        },
        game_troll_by_the_book: {
            id: 'game_troll_by_the_book',
            name: 'OSINT Professional',
            description: 'Follow full intelligence cycle in one run',
            icon: '📘',
            category: 'games',
            points: 300,
            secret: false
        },
        game_troll_speed: {
            id: 'game_troll_speed',
            name: 'Rapid Response: OSINT',
            description: "Speed run Don't Feed the Troll",
            icon: '⚡',
            category: 'games',
            points: 200,
            secret: true
        },
        game_troll_all: {
            id: 'game_troll_all',
            name: 'Intelligence Legend',
            description: "Unlock all 12 achievements in Don't Feed the Troll",
            icon: '👑',
            category: 'games',
            points: 500,
            secret: true
        },
        game_key_win: {
            id: 'game_key_win',
            name: 'Key Keeper',
            description: "Contain the leak in Don't Leak the Key",
            icon: '🔑',
            category: 'games',
            points: 150,
            secret: false
        },
        game_key_by_the_book: {
            id: 'game_key_by_the_book',
            name: 'Crypto Professional',
            description: 'Follow full crypto IR methodology in one run',
            icon: '📘',
            category: 'games',
            points: 300,
            secret: false
        },
        game_key_speed: {
            id: 'game_key_speed',
            name: 'Rapid Response: Crypto',
            description: "Speed run Don't Leak the Key",
            icon: '⚡',
            category: 'games',
            points: 200,
            secret: true
        },
        game_key_all: {
            id: 'game_key_all',
            name: 'Crypto Legend',
            description: "Unlock all 12 achievements in Don't Leak the Key",
            icon: '👑',
            category: 'games',
            points: 500,
            secret: true
        },
        game_bill_win: {
            id: 'game_bill_win',
            name: 'Budget Saver',
            description: "Stop the bleeding in Don't Check the Bill",
            icon: '💰',
            category: 'games',
            points: 150,
            secret: false
        },
        game_bill_by_the_book: {
            id: 'game_bill_by_the_book',
            name: 'Cloud Professional',
            description: 'Follow full cloud remediation methodology',
            icon: '📘',
            category: 'games',
            points: 300,
            secret: false
        },
        game_bill_speed: {
            id: 'game_bill_speed',
            name: 'Rapid Response: Cloud',
            description: "Speed run Don't Check the Bill",
            icon: '⚡',
            category: 'games',
            points: 200,
            secret: true
        },
        game_bill_all: {
            id: 'game_bill_all',
            name: 'Cloud Legend',
            description: "Unlock all 12 achievements in Don't Check the Bill",
            icon: '👑',
            category: 'games',
            points: 500,
            secret: true
        },
        game_printer_win: {
            id: 'game_printer_win',
            name: 'Printer Tamer',
            description: "Fix the printer in Don't Anger the Printer",
            icon: '🖨️',
            category: 'games',
            points: 150,
            secret: false
        },
        game_printer_by_the_book: {
            id: 'game_printer_by_the_book',
            name: 'A+ Methodologist',
            description: 'Follow full CompTIA A+ troubleshooting methodology',
            icon: '📘',
            category: 'games',
            points: 300,
            secret: false
        },
        game_printer_speed: {
            id: 'game_printer_speed',
            name: 'Rapid Response: Printer',
            description: "Speed run Don't Anger the Printer",
            icon: '⚡',
            category: 'games',
            points: 200,
            secret: true
        },
        game_printer_all: {
            id: 'game_printer_all',
            name: 'Printer Legend',
            description: "Unlock all 12 achievements in Don't Anger the Printer",
            icon: '👑',
            category: 'games',
            points: 500,
            secret: true
        },

        // Master badge - win all 10 survival games
        game_master_survivor: {
            id: 'game_master_survivor',
            name: "Don't Panic",
            description: 'Win all 10 survival games. You have stared into the abyss of every IT disaster and lived.',
            icon: '🏆',
            category: 'games',
            points: 2000,
            secret: true
        },

        // High score achievements
        game_top3: {
            id: 'game_top3',
            name: 'Podium Finish',
            description: 'Place in the top 3 on any game',
            icon: '🥉',
            category: 'games',
            points: 25,
            secret: false
        },
        game_first_highscore: {
            id: 'game_first_highscore',
            name: 'Record Setter',
            description: 'Set your first #1 high score',
            icon: '🥇',
            category: 'games',
            points: 50,
            secret: false
        },
        game_highscore_5: {
            id: 'game_highscore_5',
            name: 'Score Chaser',
            description: 'Set #1 high score in 5 different games',
            icon: '🏅',
            category: 'games',
            points: 150,
            secret: false
        },
        game_highscore_10: {
            id: 'game_highscore_10',
            name: 'Leaderboard Legend',
            description: 'Set #1 high score in 10 different games',
            icon: '👑',
            category: 'games',
            points: 300,
            secret: false
        },

        // ═══════════════════════════════════════════════════════════════
        // SEASONAL / LIMITED EDITION
        // ═══════════════════════════════════════════════════════════════
        // Halloween Season (October)
        halloween_2026: {
            id: 'halloween_2026',
            name: 'Spooky Season 2026',
            description: 'Study during Halloween week 2026',
            icon: '🎃',
            category: 'seasonal',
            points: 100,
            secret: false,
            seasonal: { month: 10, weeks: [4, 5] }
        },
        midnight_hacker: {
            id: 'midnight_hacker',
            name: 'Midnight Hacker',
            description: 'Complete a Dark Arts module at midnight on Halloween',
            icon: '🦇',
            category: 'seasonal',
            points: 200,
            secret: true,
            seasonal: { month: 10, day: 31 }
        },
        ghost_protocol: {
            id: 'ghost_protocol',
            name: 'Ghost Protocol',
            description: 'Complete 13 modules during October',
            icon: '👻',
            category: 'seasonal',
            points: 150,
            secret: false,
            seasonal: { month: 10 }
        },

        // Winter Season (December-January)
        winter_2026: {
            id: 'winter_2026',
            name: 'Winter Warrior 2026',
            description: 'Study during the winter holidays 2026',
            icon: '❄️',
            category: 'seasonal',
            points: 100,
            secret: false,
            seasonal: { months: [12, 1] }
        },
        new_year_resolution: {
            id: 'new_year_resolution',
            name: 'Resolution Keeper',
            description: 'Complete a module on New Year\'s Day',
            icon: '🎆',
            category: 'seasonal',
            points: 150,
            secret: false,
            seasonal: { month: 1, day: 1 }
        },
        snowflake_scholar: {
            id: 'snowflake_scholar',
            name: 'Snowflake Scholar',
            description: 'Maintain a 7-day streak during December',
            icon: '☃️',
            category: 'seasonal',
            points: 200,
            secret: false,
            seasonal: { month: 12 }
        },
        holiday_grind: {
            id: 'holiday_grind',
            name: 'Holiday Grind',
            description: 'Complete 25 modules during December',
            icon: '🎄',
            category: 'seasonal',
            points: 300,
            secret: false,
            seasonal: { month: 12 }
        },

        // Spring/Summer Season
        spring_awakening: {
            id: 'spring_awakening',
            name: 'Spring Awakening',
            description: 'Start a new house during spring',
            icon: '🌸',
            category: 'seasonal',
            points: 100,
            secret: false,
            seasonal: { months: [3, 4, 5] }
        },
        summer_scholar: {
            id: 'summer_scholar',
            name: 'Summer Scholar',
            description: 'Study consistently throughout summer',
            icon: '☀️',
            category: 'seasonal',
            points: 150,
            secret: false,
            seasonal: { months: [6, 7, 8] }
        },
        back_to_school: {
            id: 'back_to_school',
            name: 'Back to School',
            description: 'Resume studies in September',
            icon: '📓',
            category: 'seasonal',
            points: 100,
            secret: false,
            seasonal: { month: 9 }
        },

        // Special Events
        friday_13th: {
            id: 'friday_13th',
            name: 'Triskaidekaphile',
            description: 'Complete 13 modules on Friday the 13th',
            icon: '🔮',
            category: 'seasonal',
            points: 250,
            secret: true
        },
        pi_day: {
            id: 'pi_day',
            name: 'Pi Day Scholar',
            description: 'Study on March 14th (3.14)',
            icon: '🥧',
            category: 'seasonal',
            points: 100,
            secret: true,
            seasonal: { month: 3, day: 14 }
        },
        cyber_monday: {
            id: 'cyber_monday',
            name: 'Cyber Monday',
            description: 'Complete cybersecurity content on Cyber Monday',
            icon: '💻',
            category: 'seasonal',
            points: 150,
            secret: true
        },

        // ═══════════════════════════════════════════════════════════════
        // OASIS RINGS
        // ═══════════════════════════════════════════════════════════════
        ring_seeker: {
            id: 'ring_seeker',
            name: 'Ring Seeker',
            description: 'Attempt your first OASIS Ring challenge',
            icon: '💍',
            category: 'oasis',
            points: 100,
            secret: false
        },
        ring_bearer: {
            id: 'ring_bearer',
            name: 'Ring Bearer',
            description: 'Claim your first OASIS Ring',
            icon: '👑',
            category: 'oasis',
            points: 500,
            secret: false
        },
        ring_defender: {
            id: 'ring_defender',
            name: 'Ring Defender',
            description: 'Successfully defend a Ring against a challenger',
            icon: '🛡️',
            category: 'oasis',
            points: 200,
            secret: false
        },
        ring_collector: {
            id: 'ring_collector',
            name: 'Ring Collector',
            description: 'Hold 3 OASIS Rings simultaneously',
            icon: '💎',
            category: 'oasis',
            points: 1000,
            secret: false
        },
        lord_of_rings: {
            id: 'lord_of_rings',
            name: 'Lord of the Rings',
            description: 'Hold all 8 OASIS Rings simultaneously',
            icon: '🔥',
            category: 'oasis',
            points: 5000,
            secret: true
        },
        ring_dynasty: {
            id: 'ring_dynasty',
            name: 'Ring Dynasty',
            description: 'Hold a single Ring for 30 days',
            icon: '🏰',
            category: 'oasis',
            points: 1000,
            secret: false
        },
        ring_thief: {
            id: 'ring_thief',
            name: 'Ring Thief',
            description: 'Claim a Ring from another house',
            icon: '🗝️',
            category: 'oasis',
            points: 300,
            secret: false
        },
        fellowship: {
            id: 'fellowship',
            name: 'The Fellowship',
            description: 'Attempt all 8 Ring challenges',
            icon: '⚔️',
            category: 'oasis',
            points: 500,
            secret: false
        },
        perfect_challenger: {
            id: 'perfect_challenger',
            name: 'Perfect Challenger',
            description: 'Score a perfect run on any Ring challenge',
            icon: '✨',
            category: 'oasis',
            points: 300,
            secret: false
        },

        // ═══════════════════════════════════════════════════════════════
        // PRESTIGE / LEGENDARY
        // ═══════════════════════════════════════════════════════════════
        hexworth_legend: {
            id: 'hexworth_legend',
            name: 'Hexworth Legend',
            description: 'Complete every house at 100%',
            icon: '🏛️',
            category: 'prestige',
            points: 5000,
            secret: false
        },
        completionist: {
            id: 'completionist',
            name: 'The Completionist',
            description: 'Unlock 100 achievements',
            icon: '🎖️',
            category: 'prestige',
            points: 1000,
            secret: false
        },
        platinum_scholar: {
            id: 'platinum_scholar',
            name: 'Platinum Scholar',
            description: 'Earn 10,000 total XP',
            icon: '💎',
            category: 'prestige',
            points: 500,
            secret: false
        },
        diamond_mind: {
            id: 'diamond_mind',
            name: 'Diamond Mind',
            description: 'Earn 25,000 total XP',
            icon: '💠',
            category: 'prestige',
            points: 1000,
            secret: false
        },
        perfect_run: {
            id: 'perfect_run',
            name: 'Perfect Run',
            description: 'Score 100% on 25 different quizzes',
            icon: '⭐',
            category: 'prestige',
            points: 1500,
            secret: false
        },
        iron_will: {
            id: 'iron_will',
            name: 'Iron Will',
            description: 'Maintain a 30-day study streak',
            icon: '🔗',
            category: 'prestige',
            points: 1000,
            secret: false
        },
        streak_master: {
            id: 'streak_master',
            name: 'Streak Master',
            description: 'Maintain a 100-day study streak',
            icon: '🔥',
            category: 'prestige',
            points: 2500,
            secret: false
        },
        quiz_legend: {
            id: 'quiz_legend',
            name: 'Quiz Legend',
            description: 'Pass 100 quizzes',
            icon: '📖',
            category: 'prestige',
            points: 2000,
            secret: false
        },
        lab_master: {
            id: 'lab_master',
            name: 'Lab Master',
            description: 'Complete 50 hands-on labs',
            icon: '🧪',
            category: 'prestige',
            points: 1500,
            secret: false
        },
        dedication: {
            id: 'dedication',
            name: 'Unwavering Dedication',
            description: 'Study for 365 total days',
            icon: '📅',
            category: 'prestige',
            points: 5000,
            secret: false
        },

        // ═══════════════════════════════════════════════════════════════
        // RARE / EASTER EGGS
        // ═══════════════════════════════════════════════════════════════
        konami_code: {
            id: 'konami_code',
            name: 'Up Up Down Down',
            description: 'Discover the hidden konami code',
            icon: '🎮',
            category: 'easter_egg',
            points: 100,
            secret: true
        },
        binary_reader: {
            id: 'binary_reader',
            name: 'Binary Reader',
            description: 'Decode a hidden binary message',
            icon: '0️⃣',
            category: 'easter_egg',
            points: 150,
            secret: true
        },
        firefly_whisperer: {
            id: 'firefly_whisperer',
            name: 'Firefly Whisperer',
            description: 'Interact with 1000 digital fireflies',
            icon: '✨',
            category: 'easter_egg',
            points: 100,
            secret: true
        },
        digital_life: {
            id: 'digital_life',
            name: 'Digital Life Observer',
            description: 'Watch the firefly ecosystem for 10 minutes',
            icon: '🌌',
            category: 'easter_egg',
            points: 50,
            secret: true
        },
        console_hacker: {
            id: 'console_hacker',
            name: 'Console Hacker',
            description: 'Find the developer console easter egg',
            icon: '👩‍💻',
            category: 'easter_egg',
            points: 150,
            secret: true
        },
        time_traveler: {
            id: 'time_traveler',
            name: 'Time Traveler',
            description: 'Access Hexworth from before 6 AM and after midnight same day',
            icon: '⏰',
            category: 'easter_egg',
            points: 100,
            secret: true
        },
        founder_badge: {
            id: 'founder_badge',
            name: 'Founding Member',
            description: 'Join Hexworth Prime during the founding era',
            icon: '🏅',
            category: 'easter_egg',
            points: 500,
            secret: false,
            limited: true
        }
    };

    /**
     * Get all unlocked achievements
     */
    static getUnlockedAchievements() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const raw = JSON.parse(stored);
                // Handle mixed formats: strings from AchievementManager, objects from AchievementSystem
                return raw.map(entry => {
                    if (typeof entry === 'string') {
                        // Convert string ID to object, using definition if available
                        const def = this.ACHIEVEMENTS[entry];
                        return def ? { ...def, unlockedAt: null } : { id: entry, unlockedAt: null };
                    }
                    return entry;
                }).filter(a => a && a.id);
            }
        } catch (e) {
            console.warn('AchievementSystem: Error loading achievements', e);
        }
        return [];
    }

    /**
     * Check if an achievement is unlocked
     */
    static isUnlocked(achievementId) {
        const unlocked = this.getUnlockedAchievements();
        return unlocked.some(a => typeof a === 'string' ? a === achievementId : a.id === achievementId);
    }

    /**
     * Unlock an achievement
     */
    static unlock(achievementId) {
        if (this.isUnlocked(achievementId)) {
            return false; // Already unlocked
        }

        const achievement = this.ACHIEVEMENTS[achievementId];
        if (!achievement) {
            console.warn(`Unknown achievement: ${achievementId}`);
            return false;
        }

        const unlocked = this.getUnlockedAchievements();
        const unlockedAchievement = {
            ...achievement,
            unlockedAt: Date.now()
        };

        unlocked.push(unlockedAchievement);
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(unlocked));

        // Sync to Registry v2 storage
        if (typeof AchievementRegistry !== 'undefined') {
            AchievementRegistry.unlock(achievementId);
        }

        // Show notification — prefer unified Panel, fall back to built-in
        if (typeof AchievementPanel !== 'undefined') {
            const def = (typeof AchievementRegistry !== 'undefined') ? AchievementRegistry.getDefinition(achievementId) : null;
            AchievementPanel.queueNotification(def || achievement);
        } else {
            this.showAchievementNotification(achievement);
        }

        // Dispatch event
        window.dispatchEvent(new CustomEvent('hexworth:achievementUnlocked', {
            detail: { achievement: unlockedAchievement }
        }));

        // Award achievement XP through ProgressManager
        if (typeof ProgressManager !== 'undefined') {
            const progress = ProgressManager.getProgress();
            progress.xp += achievement.points;
            ProgressManager.saveProgress(progress);
        }

        return true;
    }

    /**
     * Check progress-based achievements
     */
    static checkProgressAchievements(progress, context = {}) {
        const newAchievements = [];

        // First module achievement
        if (progress.completedModules.length === 1) {
            if (this.unlock('first_module')) {
                newAchievements.push(this.ACHIEVEMENTS.first_module);
            }
        }

        // Level achievements
        if (progress.level >= 5) {
            if (this.unlock('level_5')) newAchievements.push(this.ACHIEVEMENTS.level_5);
        }
        if (progress.level >= 10) {
            if (this.unlock('level_10')) newAchievements.push(this.ACHIEVEMENTS.level_10);
        }
        if (progress.level >= 15) {
            if (this.unlock('level_15')) newAchievements.push(this.ACHIEVEMENTS.level_15);
        }

        // House apprentice achievements (5 modules per house)
        Object.entries(progress.houses).forEach(([houseId, house]) => {
            if (house.modulesCompleted.length >= 5) {
                const apprenticeId = `${houseId}_apprentice`;
                if (this.ACHIEVEMENTS[apprenticeId] && this.unlock(apprenticeId)) {
                    newAchievements.push(this.ACHIEVEMENTS[apprenticeId]);
                }
            }
        });

        // Multi-house achievement
        const housesWithProgress = Object.values(progress.houses)
            .filter(h => h.modulesCompleted.length > 0).length;
        if (housesWithProgress === 8) {
            if (this.unlock('multi_house')) {
                newAchievements.push(this.ACHIEVEMENTS.multi_house);
            }
        }

        // Lab rat achievement
        if (progress.labsCompleted.length >= 10) {
            if (this.unlock('lab_rat')) {
                newAchievements.push(this.ACHIEVEMENTS.lab_rat);
            }
        }

        // Time-based achievements
        const now = new Date();
        const hour = now.getHours();
        const month = now.getMonth() + 1; // 1-12
        const day = now.getDate();
        const dayOfWeek = now.getDay();

        if (hour >= 0 && hour < 4) {
            if (this.unlock('night_owl')) {
                newAchievements.push(this.ACHIEVEMENTS.night_owl);
            }
        }
        if (hour >= 5 && hour < 7) {
            if (this.unlock('early_bird')) {
                newAchievements.push(this.ACHIEVEMENTS.early_bird);
            }
        }

        // Streak achievements
        if (progress.streak >= 7) {
            if (this.unlock('streak_7')) newAchievements.push(this.ACHIEVEMENTS.streak_7);
        }
        if (progress.streak >= 30) {
            if (this.unlock('iron_will')) newAchievements.push(this.ACHIEVEMENTS.iron_will);
        }
        if (progress.streak >= 100) {
            if (this.unlock('streak_master')) newAchievements.push(this.ACHIEVEMENTS.streak_master);
        }

        // Quiz count achievements
        const quizCount = progress.quizzesPassed?.length || 0;
        if (quizCount >= 25) {
            if (this.unlock('quiz_master_25')) newAchievements.push(this.ACHIEVEMENTS.quiz_master_25);
        }
        if (quizCount >= 100) {
            if (this.unlock('quiz_legend')) newAchievements.push(this.ACHIEVEMENTS.quiz_legend);
        }

        // Perfect score count
        const perfectScores = progress.perfectScores || 0;
        if (perfectScores >= 25) {
            if (this.unlock('perfect_run')) newAchievements.push(this.ACHIEVEMENTS.perfect_run);
        }

        // Lab achievements
        const labCount = progress.labsCompleted?.length || 0;
        if (labCount >= 50) {
            if (this.unlock('lab_master')) newAchievements.push(this.ACHIEVEMENTS.lab_master);
        }

        // XP milestones
        if (progress.xp >= 10000) {
            if (this.unlock('platinum_scholar')) newAchievements.push(this.ACHIEVEMENTS.platinum_scholar);
        }
        if (progress.xp >= 25000) {
            if (this.unlock('diamond_mind')) newAchievements.push(this.ACHIEVEMENTS.diamond_mind);
        }

        // Achievement count milestones
        const unlockedCount = this.getUnlockedAchievements().length;
        if (unlockedCount >= 100) {
            if (this.unlock('completionist')) newAchievements.push(this.ACHIEVEMENTS.completionist);
        }

        // Seasonal achievements
        this.checkSeasonalAchievements(progress, { month, day, dayOfWeek, hour }, newAchievements);

        // Factionless/Divergent achievements
        if (progress.isFactionless || progress.house === 'factionless') {
            this.checkFactionlessAchievements(progress, newAchievements);
        }

        // Career branch achievements
        if (progress.divergentBranches?.length > 0) {
            this.checkCareerBranchAchievements(progress, newAchievements);
        }

        // Operator/Matrix achievements
        if (progress.isOperator || progress.house === 'operator') {
            this.checkOperatorAchievements(progress, newAchievements);
        }

        // Prestige: All houses complete
        const allHousesComplete = Object.values(progress.houses || {})
            .every(h => h.progressPercent >= 100);
        if (allHousesComplete && Object.keys(progress.houses || {}).length >= 8) {
            if (this.unlock('hexworth_legend')) newAchievements.push(this.ACHIEVEMENTS.hexworth_legend);
        }

        // Auto-generated house milestones + scholar (AchievementRegistry)
        if (typeof AchievementRegistry !== 'undefined' && typeof ContentCatalog !== 'undefined') {
            Object.entries(progress.houses || {}).forEach(([houseId, house]) => {
                const pct = house.progressPercent || 0;
                // Milestone tiers: 25%, 50%, 75%, 100%
                [25, 50, 75, 100].forEach(threshold => {
                    if (pct >= threshold) {
                        const milestoneId = `house_${houseId}_${threshold}`;
                        if (AchievementRegistry.unlock(milestoneId)) {
                            const def = AchievementRegistry.getDefinition(milestoneId);
                            if (def) {
                                if (typeof AchievementPanel !== 'undefined') {
                                    AchievementPanel.queueNotification(def);
                                }
                                newAchievements.push(def);
                            }
                        }
                    }
                });

                // House Scholar: all quizzes with perfect score (100%)
                const houseModules = ContentCatalog.getHouseModules(houseId);
                const quizModules = houseModules.filter(m =>
                    (m.components || []).includes('quiz') && m.status === 'available'
                );
                if (quizModules.length > 0) {
                    const quizHistory = progress.quizHistory || [];
                    const allPerfect = quizModules.every(qm =>
                        quizHistory.some(qh => qh.moduleId === qm.id && qh.score >= 100)
                    );
                    if (allPerfect) {
                        const scholarId = `house_${houseId}_all_perfect`;
                        if (AchievementRegistry.unlock(scholarId)) {
                            const def = AchievementRegistry.getDefinition(scholarId);
                            if (def) {
                                if (typeof AchievementPanel !== 'undefined') {
                                    AchievementPanel.queueNotification(def);
                                }
                                newAchievements.push(def);
                            }
                        }
                    }
                }
            });
        }

        return newAchievements;
    }

    /**
     * Check seasonal achievements
     */
    static checkSeasonalAchievements(progress, dateInfo, newAchievements) {
        const { month, day } = dateInfo;

        // Halloween season (October)
        if (month === 10) {
            if (this.unlock('halloween_2026')) newAchievements.push(this.ACHIEVEMENTS.halloween_2026);
            // Ghost Protocol: 13 modules in October
            const octModules = progress.monthlyModules?.[10] || 0;
            if (octModules >= 13) {
                if (this.unlock('ghost_protocol')) newAchievements.push(this.ACHIEVEMENTS.ghost_protocol);
            }
        }

        // Halloween night special
        if (month === 10 && day === 31) {
            if (this.unlock('midnight_hacker')) newAchievements.push(this.ACHIEVEMENTS.midnight_hacker);
        }

        // Winter season (December)
        if (month === 12) {
            if (this.unlock('winter_2026')) newAchievements.push(this.ACHIEVEMENTS.winter_2026);
            // Holiday grind: 25 modules in December
            const decModules = progress.monthlyModules?.[12] || 0;
            if (decModules >= 25) {
                if (this.unlock('holiday_grind')) newAchievements.push(this.ACHIEVEMENTS.holiday_grind);
            }
            // Snowflake scholar: 7-day streak in December
            if (progress.streak >= 7) {
                if (this.unlock('snowflake_scholar')) newAchievements.push(this.ACHIEVEMENTS.snowflake_scholar);
            }
        }

        // New Year's Day
        if (month === 1 && day === 1) {
            if (this.unlock('new_year_resolution')) newAchievements.push(this.ACHIEVEMENTS.new_year_resolution);
        }

        // Pi Day (March 14)
        if (month === 3 && day === 14) {
            if (this.unlock('pi_day')) newAchievements.push(this.ACHIEVEMENTS.pi_day);
        }

        // Spring (March-May)
        if (month >= 3 && month <= 5) {
            if (this.unlock('spring_awakening')) newAchievements.push(this.ACHIEVEMENTS.spring_awakening);
        }

        // Summer (June-August)
        if (month >= 6 && month <= 8) {
            if (this.unlock('summer_scholar')) newAchievements.push(this.ACHIEVEMENTS.summer_scholar);
        }

        // Back to school (September)
        if (month === 9) {
            if (this.unlock('back_to_school')) newAchievements.push(this.ACHIEVEMENTS.back_to_school);
        }
    }

    /**
     * Check Factionless/Divergent skill tree achievements
     */
    static checkFactionlessAchievements(progress, newAchievements) {
        // Check if SkillTree is available
        if (typeof SkillTree === 'undefined') return;

        const fundamentals = SkillTree.getPerspectiveStats('fundamentals');
        const tools = SkillTree.getPerspectiveStats('tools');
        const skills = SkillTree.getPerspectiveStats('skills');

        // Path Finder: discovered all 3 perspectives
        if (progress.perspectivesVisited?.length >= 3) {
            if (this.unlock('path_finder')) newAchievements.push(this.ACHIEVEMENTS.path_finder);
        }

        // Perspective Seeker: at least one in each
        if (fundamentals.completed >= 1 && tools.completed >= 1 && skills.completed >= 1) {
            if (this.unlock('perspective_seeker')) newAchievements.push(this.ACHIEVEMENTS.perspective_seeker);
        }

        // Fundamentals Scholar: 100%
        if (fundamentals.percentage >= 100) {
            if (this.unlock('fundamentals_scholar')) newAchievements.push(this.ACHIEVEMENTS.fundamentals_scholar);
        }

        // Tool Wielder: 100%
        if (tools.percentage >= 100) {
            if (this.unlock('tool_wielder')) newAchievements.push(this.ACHIEVEMENTS.tool_wielder);
        }

        // Skill Master: 100%
        if (skills.percentage >= 100) {
            if (this.unlock('skill_master')) newAchievements.push(this.ACHIEVEMENTS.skill_master);
        }

        // True Divergent: all 100%
        if (fundamentals.percentage >= 100 && tools.percentage >= 100 && skills.percentage >= 100) {
            if (this.unlock('true_divergent')) newAchievements.push(this.ACHIEVEMENTS.true_divergent);
        }

        // The Polymath: 75%+ across all
        const avgPercent = (fundamentals.percentage + tools.percentage + skills.percentage) / 3;
        if (avgPercent >= 75) {
            if (this.unlock('the_polymath')) newAchievements.push(this.ACHIEVEMENTS.the_polymath);
        }
    }

    /**
     * Check career branch achievements
     */
    static checkCareerBranchAchievements(progress, newAchievements) {
        const branches = progress.divergentBranches || [];

        // Individual branch unlocks
        const branchMapping = {
            'security_analyst': 'branch_security_analyst',
            'cloud_security': 'branch_cloud_security',
            'devops_engineer': 'branch_devops',
            'network_engineer': 'branch_network',
            'systems_admin': 'branch_sysadmin',
            'cryptographer': 'branch_crypto',
            'pentester': 'branch_pentester',
            'incident_responder': 'branch_ir',
            'master_class': 'branch_master'
        };

        branches.forEach(branchId => {
            const achievementId = branchMapping[branchId];
            if (achievementId && this.ACHIEVEMENTS[achievementId]) {
                if (this.unlock(achievementId)) {
                    newAchievements.push(this.ACHIEVEMENTS[achievementId]);
                }
            }
        });

        // Triple Threat: 3 branches
        if (branches.length >= 3) {
            if (this.unlock('triple_threat')) newAchievements.push(this.ACHIEVEMENTS.triple_threat);
        }

        // Renaissance Agent: 5 branches
        if (branches.length >= 5) {
            if (this.unlock('renaissance_agent')) newAchievements.push(this.ACHIEVEMENTS.renaissance_agent);
        }

        // Complete Specialist: all branches
        if (branches.length >= Object.keys(branchMapping).length) {
            if (this.unlock('complete_specialist')) newAchievements.push(this.ACHIEVEMENTS.complete_specialist);
        }
    }

    /**
     * Check Operator/Matrix achievements
     */
    static checkOperatorAchievements(progress, newAchievements) {
        // Red Pill Taken: completed Matrix onboarding
        if (progress.matrixOnboarded) {
            if (this.unlock('red_pill')) newAchievements.push(this.ACHIEVEMENTS.red_pill);
        }

        // Terminal Initiate: first command
        if (progress.terminalCommands >= 1) {
            if (this.unlock('terminal_initiate')) newAchievements.push(this.ACHIEVEMENTS.terminal_initiate);
        }

        // Command Line Warrior: 50 commands
        if (progress.terminalCommands >= 50) {
            if (this.unlock('command_warrior')) newAchievements.push(this.ACHIEVEMENTS.command_warrior);
        }

        // Neo's Apprentice: first module via terminal
        if (progress.terminalModules >= 1) {
            if (this.unlock('neo_apprentice')) newAchievements.push(this.ACHIEVEMENTS.neo_apprentice);
        }

        // The One: Level 10 as Operator
        if (progress.level >= 10) {
            if (this.unlock('the_one')) newAchievements.push(this.ACHIEVEMENTS.the_one);
        }

        // Morpheus' Wisdom: accessed all help docs
        if (progress.helpDocsViewed >= 10) {
            if (this.unlock('morpheus_wisdom')) newAchievements.push(this.ACHIEVEMENTS.morpheus_wisdom);
        }

        // I Know Kung Fu: 10 modules in one session
        if (progress.sessionModules >= 10) {
            if (this.unlock('matrix_code')) newAchievements.push(this.ACHIEVEMENTS.matrix_code);
        }

        // Free Your Mind: 5 different houses in Matrix
        if (progress.matrixHouses?.length >= 5) {
            if (this.unlock('free_your_mind')) newAchievements.push(this.ACHIEVEMENTS.free_your_mind);
        }
    }

    /**
     * Show achievement notification
     */
    static showAchievementNotification(achievement) {
        const notification = document.createElement('div');
        notification.className = 'hexworth-achievement-notification';
        notification.innerHTML = `
            <div class="achievement-content">
                <div class="achievement-icon">${achievement.icon}</div>
                <div class="achievement-info">
                    <div class="achievement-label">Achievement Unlocked!</div>
                    <div class="achievement-name">${achievement.name}</div>
                    <div class="achievement-desc">${achievement.description}</div>
                    <div class="achievement-points">+${achievement.points} XP</div>
                </div>
            </div>
        `;

        this.ensureNotificationStyles();
        document.body.appendChild(notification);

        // Sound effect (if available)
        this.playAchievementSound();

        // Animate in
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Remove after animation
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 500);
        }, 4000);
    }

    /**
     * Play achievement sound
     */
    static playAchievementSound() {
        try {
            // Try to play a simple achievement sound using Web Audio API
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
            oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
            oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            // Audio not supported or blocked - silent fail
        }
    }

    /**
     * Ensure notification styles are added
     */
    static ensureNotificationStyles() {
        if (document.getElementById('hexworth-achievement-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'hexworth-achievement-styles';
        styles.textContent = `
            .hexworth-achievement-notification {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%) translateY(-120%);
                background: linear-gradient(135deg, rgba(30, 20, 50, 0.98), rgba(50, 30, 70, 0.98));
                border: 2px solid #fbbf24;
                border-radius: 16px;
                padding: 20px 24px;
                min-width: 320px;
                max-width: 420px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5),
                            0 0 30px rgba(251, 191, 36, 0.3),
                            inset 0 1px 0 rgba(255, 255, 255, 0.1);
                z-index: 10001;
                transition: transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                font-family: 'Segoe UI', system-ui, sans-serif;
            }

            .hexworth-achievement-notification.show {
                transform: translateX(-50%) translateY(0);
            }

            .achievement-content {
                display: flex;
                align-items: center;
                gap: 16px;
            }

            .achievement-icon {
                font-size: 3rem;
                line-height: 1;
                filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.5));
                animation: achievementPulse 1s ease-in-out infinite;
            }

            @keyframes achievementPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.1); }
            }

            .achievement-info {
                flex: 1;
            }

            .achievement-label {
                font-size: 0.75rem;
                text-transform: uppercase;
                letter-spacing: 1px;
                color: #fbbf24;
                margin-bottom: 4px;
            }

            .achievement-name {
                font-size: 1.25rem;
                font-weight: 700;
                color: #ffffff;
                margin-bottom: 4px;
            }

            .achievement-desc {
                font-size: 0.875rem;
                color: #a0a0b0;
                margin-bottom: 8px;
            }

            .achievement-points {
                font-size: 0.875rem;
                font-weight: 600;
                color: #22c55e;
            }

            /* Shimmer effect */
            .hexworth-achievement-notification::before {
                content: '';
                position: absolute;
                top: 0;
                left: -100%;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                    90deg,
                    transparent,
                    rgba(255, 255, 255, 0.1),
                    transparent
                );
                animation: shimmer 2s infinite;
                border-radius: 16px;
            }

            @keyframes shimmer {
                0% { left: -100%; }
                100% { left: 100%; }
            }
        `;
        document.head.appendChild(styles);
    }

    /**
     * Get achievement gallery data
     */
    static getGalleryData() {
        const unlocked = this.getUnlockedAchievements();
        const unlockedIds = new Set(unlocked.map(a => a.id));

        const categories = {
            milestone: { name: 'Milestones', icon: '🚀', achievements: [] },
            quiz: { name: 'Quiz Master', icon: '📝', achievements: [] },
            level: { name: 'Leveling Up', icon: '⬆️', achievements: [] },
            explorer: { name: 'Explorer', icon: '🗺️', achievements: [] },
            special: { name: 'Special', icon: '✨', achievements: [] },
            dark_arts: { name: 'Dark Arts', icon: '💀', achievements: [] },
            factionless: { name: 'Divergent Path', icon: '🔀', achievements: [] },
            career: { name: 'Career Paths', icon: '💼', achievements: [] },
            operator: { name: 'Matrix Operator', icon: '💊', achievements: [] },
            seasonal: { name: 'Seasonal', icon: '🗓️', achievements: [] },
            prestige: { name: 'Prestige', icon: '👑', achievements: [] },
            easter_egg: { name: 'Hidden Secrets', icon: '🔮', achievements: [] }
        };

        // Add house categories
        if (typeof ProgressManager !== 'undefined' && ProgressManager.HOUSES) {
            Object.keys(ProgressManager.HOUSES).forEach(houseId => {
                categories[houseId] = {
                    name: ProgressManager.HOUSES[houseId].name,
                    icon: ProgressManager.HOUSES[houseId].icon || '🏠',
                    achievements: []
                };
            });
        }

        // Sort achievements into categories
        Object.values(this.ACHIEVEMENTS).forEach(achievement => {
            const isUnlocked = unlockedIds.has(achievement.id);
            const unlockedData = unlocked.find(a => a.id === achievement.id);

            const categoryId = categories[achievement.category] ? achievement.category : 'special';

            // Hide secret achievements that aren't unlocked
            if (achievement.secret && !isUnlocked) {
                categories[categoryId].achievements.push({
                    ...achievement,
                    name: '???',
                    description: 'Secret achievement',
                    icon: '❓',
                    locked: true
                });
            } else {
                categories[categoryId].achievements.push({
                    ...achievement,
                    locked: !isUnlocked,
                    unlockedAt: unlockedData?.unlockedAt || null
                });
            }
        });

        return categories;
    }

    /**
     * Get total achievement points earned
     */
    static getTotalPoints() {
        const unlocked = this.getUnlockedAchievements();
        return unlocked.reduce((sum, a) => sum + (a.points || 0), 0);
    }

    /**
     * Get achievement progress summary
     */
    static getProgressSummary() {
        const unlocked = this.getUnlockedAchievements();
        const total = Object.keys(this.ACHIEVEMENTS).length;
        const nonSecret = Object.values(this.ACHIEVEMENTS).filter(a => !a.secret).length;
        const unlockedNonSecret = unlocked.filter(a => !this.ACHIEVEMENTS[a.id]?.secret).length;

        return {
            unlocked: unlocked.length,
            total: total,
            percentage: Math.round((unlocked.length / total) * 100),
            displayProgress: `${unlockedNonSecret}/${nonSecret}`, // Don't reveal secret count
            points: this.getTotalPoints()
        };
    }

    /**
     * Trigger Dark Arts gate achievement
     * Call this from the gate pages when a gate is passed
     */
    static unlockDarkArtsGate(gateNumber) {
        const gateMap = {
            1: 'dark_arts_gate1',
            2: 'dark_arts_gate2',
            3: 'dark_arts_gate3',
            4: 'dark_arts_gate4',
            5: 'dark_arts_gate5',
            6: 'dark_arts_gate6',
            7: 'dark_arts_gate7',
            8: 'dark_arts_gate8',
            9: 'dark_arts_gate9',
            10: 'dark_arts_gate10'
        };

        const achievementId = gateMap[gateNumber];
        if (achievementId) {
            this.unlock(achievementId);
        }

        // Check if all 10 gates complete -> Dark Arts Grandmaster
        const allGates = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].every(g =>
            this.isUnlocked(gateMap[g])
        );
        if (allGates) {
            this.unlock('dark_arts_master');
        }

        return achievementId ? this.isUnlocked(achievementId) : false;
    }

    /**
     * Trigger Dark Arts vault access achievement
     */
    static unlockDarkArtsVault() {
        return this.unlock('dark_arts_vault');
    }

    /**
     * Trigger survival game achievements
     * @param {string} gameId - 'domain', 'brick', 'phished', 'server', 'packet', 'deploy', 'troll', 'key', 'bill', or 'printer'
     * @param {string} type - 'win', 'by_the_book', 'speed', 'all'
     */
    static unlockGameAchievement(gameId, type) {
        const id = `game_${gameId}_${type}`;
        const result = this.unlock(id);

        // Check for master badge after any game win
        if (type === 'win') {
            const allGameIds = ['domain', 'brick', 'phished', 'server', 'packet', 'deploy', 'troll', 'key', 'bill', 'printer'];
            const allWon = allGameIds.every(gid => this.isUnlocked(`game_${gid}_win`));
            if (allWon) {
                this.unlock('game_master_survivor');
            }
        }

        return result;
    }

    /**
     * Trigger branch unlock achievement
     * Call this from SkillTreeData when a branch is unlocked
     */
    static unlockCareerBranch(branchId) {
        const branchMapping = {
            'security_analyst': 'branch_security_analyst',
            'cloud_security': 'branch_cloud_security',
            'devops_engineer': 'branch_devops',
            'network_engineer': 'branch_network',
            'systems_admin': 'branch_sysadmin',
            'cryptographer': 'branch_crypto',
            'pentester': 'branch_pentester',
            'incident_responder': 'branch_ir',
            'master_class': 'branch_master',
            'dark_arts_initiate': 'dark_arts_gate1' // Special: links to Dark Arts
        };

        const achievementId = branchMapping[branchId];
        if (achievementId) {
            this.unlock(achievementId);
        }

        // Check milestone achievements
        const progress = typeof ProgressManager !== 'undefined'
            ? ProgressManager.getProgress()
            : { divergentBranches: [] };

        const branchCount = progress.divergentBranches?.length || 0;
        if (branchCount >= 3) this.unlock('triple_threat');
        if (branchCount >= 5) this.unlock('renaissance_agent');
        if (branchCount >= Object.keys(branchMapping).length - 1) { // -1 for dark_arts special
            this.unlock('complete_specialist');
        }

        return achievementId ? this.isUnlocked(achievementId) : false;
    }

    /**
     * Get achievement stats by category
     */
    static getCategoryStats() {
        const unlocked = this.getUnlockedAchievements();
        const unlockedIds = new Set(unlocked.map(a => a.id));
        const stats = {};

        Object.values(this.ACHIEVEMENTS).forEach(achievement => {
            const cat = achievement.category;
            if (!stats[cat]) {
                stats[cat] = { total: 0, unlocked: 0, points: 0, earnedPoints: 0 };
            }
            stats[cat].total++;
            stats[cat].points += achievement.points;
            if (unlockedIds.has(achievement.id)) {
                stats[cat].unlocked++;
                stats[cat].earnedPoints += achievement.points;
            }
        });

        return stats;
    }

    /**
     * Check for founding member badge (limited time)
     * Should be called on first login during founding era
     */
    static checkFoundingMember() {
        const founderEnd = new Date('2027-01-01'); // Founding era ends
        if (new Date() < founderEnd) {
            return this.unlock('founder_badge');
        }
        return false;
    }

    /**
     * Trigger easter egg achievements
     */
    static triggerEasterEgg(eggId) {
        const validEggs = [
            'konami_code',
            'binary_reader',
            'firefly_whisperer',
            'digital_life',
            'console_hacker',
            'time_traveler',
            'white_rabbit',
            'deja_vu',
            'matrix_glitch'
        ];

        if (validEggs.includes(eggId)) {
            return this.unlock(eggId);
        }
        return false;
    }
}

// Listen for high score events from GameTracker
window.addEventListener('hexworth:newHighScore', (e) => {
    const { gameId, score, rank } = e.detail;

    // Podium Finish: any top 3 placement
    if (rank <= 3) {
        AchievementSystem.unlock('game_top3');
    }

    // Record Setter: first #1 high score
    if (rank === 1) {
        AchievementSystem.unlock('game_first_highscore');

        // Count how many games the player holds a #1 high score in
        if (typeof GameTracker !== 'undefined') {
            const registry = GameTracker.getRegistry();
            let highScoreCount = 0;
            for (const gid of Object.keys(registry)) {
                const top = GameTracker.getTopScores(gid);
                if (top.length > 0) highScoreCount++;
            }
            if (highScoreCount >= 5) AchievementSystem.unlock('game_highscore_5');
            if (highScoreCount >= 10) AchievementSystem.unlock('game_highscore_10');
        }
    }
});

// Make globally available
window.AchievementSystem = AchievementSystem;
