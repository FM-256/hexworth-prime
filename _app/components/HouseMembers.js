/**
 * HouseMembers.js - Simulated House Community
 *
 * Creates the illusion of an active house community through
 * procedurally generated "phantom members" and activity feeds.
 *
 * Features:
 * - Seeded random generation (consistent per day)
 * - House-themed name generation
 * - Simulated activity feed with timestamps
 * - Member stats and levels
 *
 * Usage:
 *   const members = new HouseMembers('shield');
 *   members.getMembers();     // Array of member objects
 *   members.getActivity();    // Array of recent activity
 *   members.renderMemberList(container);
 *   members.renderActivityFeed(container);
 */

class HouseMembers {
    constructor(house, options = {}) {
        this.house = house;
        this.options = {
            memberCount: options.memberCount || 10,
            activityCount: options.activityCount || 8,
            seed: options.seed || this.getDateSeed(),
            ...options
        };

        // House-specific name themes
        this.houseThemes = {
            web: {
                prefixes: ['Net', 'Web', 'Link', 'Node', 'Data', 'Pixel', 'Cloud', 'Cyber'],
                suffixes: ['Runner', 'Walker', 'Weaver', 'Coder', 'Dev', 'Ninja', 'Sage', 'Pro'],
                adjectives: ['Swift', 'Agile', 'Digital', 'Virtual', 'Connected', 'Online']
            },
            shield: {
                prefixes: ['Guard', 'Shield', 'Sentinel', 'Warden', 'Defender', 'Aegis', 'Iron', 'Steel'],
                suffixes: ['Knight', 'Keeper', 'Watch', 'Wall', 'Guard', 'Armor', 'Bastion', 'Fort'],
                adjectives: ['Vigilant', 'Stalwart', 'Resolute', 'Secure', 'Protected', 'Safe']
            },
            cloud: {
                prefixes: ['Cloud', 'Sky', 'Azure', 'Nimbus', 'Stratus', 'Vapor', 'Mist', 'Aero'],
                suffixes: ['Drift', 'Float', 'Soar', 'Architect', 'Builder', 'Master', 'Pilot', 'Captain'],
                adjectives: ['Elevated', 'Scalable', 'Distributed', 'Elastic', 'Global', 'Infinite']
            },
            forge: {
                prefixes: ['Forge', 'Iron', 'Steel', 'Anvil', 'Hammer', 'Spark', 'Flame', 'Core'],
                suffixes: ['Smith', 'Maker', 'Builder', 'Crafter', 'Wright', 'Master', 'Worker', 'Hand'],
                adjectives: ['Strong', 'Tempered', 'Hardened', 'Solid', 'Built', 'Forged']
            },
            script: {
                prefixes: ['Script', 'Code', 'Byte', 'Logic', 'Algo', 'Parse', 'Compile', 'Debug'],
                suffixes: ['Writer', 'Runner', 'Master', 'Wizard', 'Guru', 'Sage', 'Monk', 'Ninja'],
                adjectives: ['Automated', 'Scripted', 'Programmed', 'Logical', 'Recursive', 'Elegant']
            },
            code: {
                prefixes: ['Code', 'Dev', 'Stack', 'Git', 'Repo', 'Branch', 'Merge', 'Commit'],
                suffixes: ['Slinger', 'Monkey', 'Ninja', 'Wizard', 'Master', 'Lord', 'King', 'Queen'],
                adjectives: ['Clean', 'Refactored', 'Optimized', 'Tested', 'Reviewed', 'Deployed']
            },
            key: {
                prefixes: ['Cipher', 'Crypt', 'Key', 'Lock', 'Hash', 'Salt', 'Token', 'Secret'],
                suffixes: ['Keeper', 'Master', 'Guard', 'Warden', 'Holder', 'Smith', 'Breaker', 'Maker'],
                adjectives: ['Encrypted', 'Secured', 'Hidden', 'Protected', 'Sealed', 'Private']
            },
            eye: {
                prefixes: ['Watch', 'Eye', 'Sight', 'Vision', 'Scope', 'Lens', 'Probe', 'Scan'],
                suffixes: ['Seer', 'Hunter', 'Tracker', 'Finder', 'Seeker', 'Observer', 'Analyst', 'Scout'],
                adjectives: ['Watchful', 'Alert', 'Aware', 'Perceptive', 'Sharp', 'Focused']
            },
            'dark-arts': {
                prefixes: ['Shadow', 'Dark', 'Void', 'Null', 'Zero', 'Ghost', 'Phantom', 'Specter'],
                suffixes: ['Walker', 'Stalker', 'Hunter', 'Shade', 'Wraith', 'Reaper', 'Lurker', 'Crawler'],
                adjectives: ['Hidden', 'Silent', 'Stealth', 'Covert', 'Obscured', 'Veiled']
            }
        };

        // Activity templates
        this.activityTemplates = [
            { type: 'module', text: 'completed {module}', icon: '📚' },
            { type: 'achievement', text: 'earned {achievement}', icon: '🏆' },
            { type: 'streak', text: 'reached a {days}-day streak', icon: '🔥' },
            { type: 'quiz', text: 'passed {quiz} with {score}%', icon: '✅' },
            { type: 'login', text: 'joined the session', icon: '👋' },
            { type: 'level', text: 'reached Level {level}', icon: '⭐' },
            { type: 'rare', text: 'discovered a {rare} firefly', icon: '✨' }
        ];

        // Module names by house
        this.moduleNames = {
            web: ['HTML Fundamentals', 'CSS Mastery', 'JavaScript Basics', 'React Intro', 'API Design', 'Responsive Design'],
            shield: ['Firewall Config', 'IDS/IPS Basics', 'Vulnerability Scanning', 'Incident Response', 'Security Policies', 'Network Defense'],
            cloud: ['AWS Essentials', 'Azure Fundamentals', 'Cloud Architecture', 'Serverless Computing', 'Container Basics', 'Cloud Security'],
            forge: ['Windows Admin', 'Linux Basics', 'System Tools', 'Control Panel', 'PowerShell Intro', 'Group Policy'],
            script: ['Bash Scripting', 'Python Basics', 'Automation 101', 'Regex Patterns', 'Task Scheduling', 'Error Handling'],
            code: ['Git Fundamentals', 'Version Control', 'Code Review', 'Testing Basics', 'CI/CD Intro', 'Documentation'],
            key: ['Encryption Basics', 'PKI Fundamentals', 'Hash Functions', 'Digital Signatures', 'Key Management', 'SSL/TLS'],
            eye: ['Log Analysis', 'SIEM Basics', 'Threat Hunting', 'Forensics Intro', 'Packet Analysis', 'Malware Detection'],
            'dark-arts': ['Malware Analysis', 'Reverse Engineering', 'Exploit Basics', 'Payload Crafting', 'Evasion Techniques', 'CTF Strategies']
        };

        // Achievement names
        this.achievementNames = ['First Steps', 'Quick Learner', 'Night Owl', 'Early Bird', 'Dedicated', 'Scholar', 'Quiz Whiz', 'Explorer'];

        // Rare firefly types
        this.rareTypes = ['Golden', 'Diamond', 'Glitch', 'Ancient', 'Void-touched'];

        // Generate members and activity
        this.members = this.generateMembers();
        this.activity = this.generateActivity();
    }

    /**
     * Get date-based seed for consistent daily generation
     */
    getDateSeed() {
        const today = new Date();
        return today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
    }

    /**
     * Seeded random number generator
     */
    seededRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    /**
     * Get random item from array using seed
     */
    randomFromArray(arr, seed) {
        const index = Math.floor(this.seededRandom(seed) * arr.length);
        return arr[index];
    }

    /**
     * Generate a username for the house
     */
    generateUsername(seed) {
        const theme = this.houseThemes[this.house] || this.houseThemes.web;
        const useAdjective = this.seededRandom(seed * 1.1) > 0.6;
        const useNumber = this.seededRandom(seed * 1.2) > 0.5;

        let name = '';

        if (useAdjective) {
            name += this.randomFromArray(theme.adjectives, seed * 2.1);
        }

        name += this.randomFromArray(theme.prefixes, seed * 3.1);
        name += this.randomFromArray(theme.suffixes, seed * 4.1);

        if (useNumber) {
            const num = Math.floor(this.seededRandom(seed * 5.1) * 999) + 1;
            name += '_' + num;
        }

        return name;
    }

    /**
     * Generate member level from XP
     */
    calculateLevel(xp) {
        // Level formula: level = floor(sqrt(xp / 100))
        return Math.floor(Math.sqrt(xp / 100)) + 1;
    }

    /**
     * Generate array of house members
     */
    generateMembers() {
        const members = [];
        const baseSeed = this.options.seed + this.house.charCodeAt(0);

        for (let i = 0; i < this.options.memberCount; i++) {
            const memberSeed = baseSeed + i * 1000;

            // Generate XP (weighted toward lower values)
            const xpRandom = this.seededRandom(memberSeed * 6.1);
            const xp = Math.floor(Math.pow(xpRandom, 0.5) * 2000) + 50;

            const level = this.calculateLevel(xp);
            const modulesCompleted = Math.floor(level * 1.5 + this.seededRandom(memberSeed * 7.1) * 5);
            const achievementCount = Math.min(Math.floor(level * 0.8 + this.seededRandom(memberSeed * 8.1) * 3), 12);
            const streak = Math.floor(this.seededRandom(memberSeed * 9.1) * 14) + 1;

            // Activity status
            const lastActiveHours = Math.floor(this.seededRandom(memberSeed * 10.1) * 48);
            const isOnline = lastActiveHours < 2;

            members.push({
                id: i,
                username: this.generateUsername(memberSeed),
                xp,
                level,
                modulesCompleted,
                achievementCount,
                streak,
                lastActiveHours,
                isOnline,
                avatar: this.generateAvatar(memberSeed)
            });
        }

        // Sort by XP (leaderboard order)
        members.sort((a, b) => b.xp - a.xp);

        // Assign ranks
        members.forEach((m, i) => m.rank = i + 1);

        return members;
    }

    /**
     * Generate simple avatar (emoji-based)
     */
    generateAvatar(seed) {
        const avatars = ['🧑‍💻', '👨‍💻', '👩‍💻', '🧑‍🔬', '👨‍🔬', '👩‍🔬', '🦊', '🐺', '🦉', '🐲', '🤖', '👾'];
        return this.randomFromArray(avatars, seed * 11.1);
    }

    /**
     * Generate activity feed
     */
    generateActivity() {
        const activity = [];
        const baseSeed = this.options.seed + this.house.charCodeAt(0) * 100;
        const modules = this.moduleNames[this.house] || this.moduleNames.web;

        for (let i = 0; i < this.options.activityCount; i++) {
            const actSeed = baseSeed + i * 500;

            // Pick a random member
            const member = this.randomFromArray(this.members, actSeed * 1.5);

            // Pick activity type
            const template = this.randomFromArray(this.activityTemplates, actSeed * 2.5);

            // Generate activity text
            let text = template.text;
            text = text.replace('{module}', this.randomFromArray(modules, actSeed * 3.5));
            text = text.replace('{achievement}', this.randomFromArray(this.achievementNames, actSeed * 4.5));
            text = text.replace('{days}', Math.floor(this.seededRandom(actSeed * 5.5) * 14) + 3);
            text = text.replace('{quiz}', this.randomFromArray(modules, actSeed * 6.5) + ' Quiz');
            text = text.replace('{score}', Math.floor(this.seededRandom(actSeed * 7.5) * 30) + 70);
            text = text.replace('{level}', Math.floor(this.seededRandom(actSeed * 8.5) * 10) + 2);
            text = text.replace('{rare}', this.randomFromArray(this.rareTypes, actSeed * 9.5));

            // Generate timestamp (within last 24 hours)
            const minutesAgo = Math.floor(this.seededRandom(actSeed * 10.5) * 1440);
            const timestamp = this.formatTimeAgo(minutesAgo);

            activity.push({
                id: i,
                member: member.username,
                avatar: member.avatar,
                text,
                icon: template.icon,
                type: template.type,
                timestamp,
                minutesAgo
            });
        }

        // Sort by time (most recent first)
        activity.sort((a, b) => a.minutesAgo - b.minutesAgo);

        return activity;
    }

    /**
     * Format minutes ago as human-readable string
     */
    formatTimeAgo(minutes) {
        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        return 'yesterday';
    }

    /**
     * Get all members
     */
    getMembers() {
        return this.members;
    }

    /**
     * Get activity feed
     */
    getActivity() {
        return this.activity;
    }

    /**
     * Get online member count
     */
    getOnlineCount() {
        return this.members.filter(m => m.isOnline).length;
    }

    /**
     * Render member list to container
     */
    renderMemberList(container) {
        if (!container) return;

        const html = `
            <div class="house-members-list">
                <div class="members-header">
                    <span class="members-title">House Members</span>
                    <span class="members-online">${this.getOnlineCount()} online</span>
                </div>
                <div class="members-grid">
                    ${this.members.slice(0, 6).map(m => `
                        <div class="member-card ${m.isOnline ? 'online' : ''}">
                            <div class="member-avatar">${m.avatar}</div>
                            <div class="member-info">
                                <div class="member-name">${m.username}</div>
                                <div class="member-stats">Lvl ${m.level} | ${m.xp} XP</div>
                            </div>
                            ${m.isOnline ? '<div class="online-indicator"></div>' : ''}
                        </div>
                    `).join('')}
                </div>
                <button class="view-all-btn" onclick="showAllMembers()">View All ${this.members.length} Members</button>
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * Render activity feed to container
     */
    renderActivityFeed(container) {
        if (!container) return;

        const html = `
            <div class="house-activity-feed">
                <div class="activity-header">
                    <span class="activity-title">House Activity</span>
                    <span class="activity-live">LIVE</span>
                </div>
                <div class="activity-list">
                    ${this.activity.map(a => `
                        <div class="activity-item">
                            <span class="activity-icon">${a.icon}</span>
                            <div class="activity-content">
                                <span class="activity-member">${a.member}</span>
                                <span class="activity-text">${a.text}</span>
                            </div>
                            <span class="activity-time">${a.timestamp}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * Render leaderboard to container
     */
    renderLeaderboard(container, userXP = 0) {
        if (!container) return;

        // Insert user into leaderboard
        const allMembers = [...this.members];
        const userRank = allMembers.filter(m => m.xp > userXP).length + 1;

        const html = `
            <div class="house-leaderboard">
                <div class="leaderboard-header">
                    <span class="leaderboard-title">House Leaderboard</span>
                </div>
                <div class="leaderboard-list">
                    ${allMembers.slice(0, 5).map((m, i) => `
                        <div class="leaderboard-row ${i < 3 ? 'top-three' : ''}">
                            <span class="rank ${i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : ''}">${i + 1}</span>
                            <span class="lb-avatar">${m.avatar}</span>
                            <span class="lb-name">${m.username}</span>
                            <span class="lb-xp">${m.xp} XP</span>
                        </div>
                    `).join('')}
                    <div class="leaderboard-divider">···</div>
                    <div class="leaderboard-row user-row">
                        <span class="rank">${userRank}</span>
                        <span class="lb-avatar">🎯</span>
                        <span class="lb-name">You</span>
                        <span class="lb-xp">${userXP} XP</span>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    /**
     * Get detailed rank info for user
     */
    getUserRankInfo(userXP) {
        const allMembers = [...this.members];
        const userRank = allMembers.filter(m => m.xp > userXP).length + 1;

        // Find member just ahead
        const memberAhead = allMembers.find(m => m.xp > userXP &&
            allMembers.filter(other => other.xp > userXP && other.xp < m.xp).length === 0);

        // Find member just behind
        const memberBehind = allMembers.find(m => m.xp < userXP &&
            allMembers.filter(other => other.xp < userXP && other.xp > m.xp).length === 0);

        return {
            rank: userRank,
            totalMembers: allMembers.length + 1, // +1 for user
            memberAhead: memberAhead ? {
                name: memberAhead.username,
                xp: memberAhead.xp,
                gap: memberAhead.xp - userXP
            } : null,
            memberBehind: memberBehind ? {
                name: memberBehind.username,
                xp: memberBehind.xp,
                gap: userXP - memberBehind.xp
            } : null,
            isFirst: userRank === 1,
            isLast: userRank === allMembers.length + 1
        };
    }

    /**
     * Check for rank changes and return notification info
     */
    checkRankChange(currentXP) {
        const storageKey = `hexworth_rank_${this.house}`;
        const stored = JSON.parse(localStorage.getItem(storageKey) || '{}');
        const currentInfo = this.getUserRankInfo(currentXP);

        const result = {
            changed: false,
            improved: false,
            dropped: false,
            passedMember: null,
            passedByMember: null,
            message: null
        };

        if (stored.rank && stored.xp !== undefined) {
            const previousRank = stored.rank;

            if (currentInfo.rank < previousRank) {
                // User moved up!
                result.changed = true;
                result.improved = true;

                // Find who they passed
                const passedMembers = this.members.filter(m =>
                    m.xp < currentXP && m.xp >= stored.xp
                );
                if (passedMembers.length > 0) {
                    result.passedMember = passedMembers[0].username;
                }
            } else if (currentInfo.rank > previousRank) {
                // User dropped (simulated member "caught up")
                result.changed = true;
                result.dropped = true;

                // Find who passed them
                const passingMembers = this.members.filter(m =>
                    m.xp > currentXP && m.xp <= stored.xp + 50 // Small threshold
                );
                if (passingMembers.length > 0) {
                    result.passedByMember = passingMembers[passingMembers.length - 1].username;
                }
            }
        }

        // Store current state
        localStorage.setItem(storageKey, JSON.stringify({
            rank: currentInfo.rank,
            xp: currentXP,
            timestamp: Date.now()
        }));

        return result;
    }

    /**
     * Get motivational message based on current standing
     */
    getMotivationalMessage(userXP) {
        const info = this.getUserRankInfo(userXP);
        const messages = [];

        if (info.isFirst) {
            messages.push({
                type: 'success',
                icon: '👑',
                text: "You're leading the house! Keep it up!"
            });
        } else if (info.memberAhead) {
            const gap = info.memberAhead.gap;
            if (gap <= 50) {
                messages.push({
                    type: 'close',
                    icon: '🔥',
                    text: `Only ${gap} XP behind ${info.memberAhead.name}!`
                });
            } else if (gap <= 150) {
                messages.push({
                    type: 'catchup',
                    icon: '💪',
                    text: `${gap} XP to catch ${info.memberAhead.name}`
                });
            }
        }

        if (info.memberBehind && info.memberBehind.gap <= 30) {
            messages.push({
                type: 'warning',
                icon: '⚠️',
                text: `${info.memberBehind.name} is only ${info.memberBehind.gap} XP behind you!`
            });
        }

        // Random encouragement
        if (messages.length === 0) {
            const encouragements = [
                { icon: '📚', text: 'Complete a module to climb the ranks!' },
                { icon: '🎯', text: 'Every XP counts toward your rank!' },
                { icon: '⭐', text: 'Keep learning to rise in the leaderboard!' }
            ];
            const idx = Math.floor(this.seededRandom(userXP) * encouragements.length);
            messages.push({ type: 'encourage', ...encouragements[idx] });
        }

        return messages;
    }

    /**
     * Simulate a member gaining XP (for dynamic feel)
     * Call periodically to make leaderboard feel alive
     */
    simulateMemberProgress() {
        // Pick a random member to "progress"
        const activeMemberIdx = Math.floor(Math.random() * this.members.length);
        const member = this.members[activeMemberIdx];

        // Small XP gain
        const gain = Math.floor(Math.random() * 25) + 5;

        return {
            member: member.username,
            xpGain: gain,
            newXP: member.xp + gain,
            activity: `${member.username} just earned ${gain} XP`
        };
    }

    /**
     * Get CSS styles for the component
     */
    static getStyles() {
        return `
            /* House Members Component Styles */
            .house-members-list,
            .house-activity-feed,
            .house-leaderboard {
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 12px;
                padding: 16px;
            }

            .members-header,
            .activity-header,
            .leaderboard-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }

            .members-title,
            .activity-title,
            .leaderboard-title {
                font-size: 0.85rem;
                font-weight: 500;
                color: #aaa;
                letter-spacing: 0.05em;
            }

            .members-online {
                font-size: 0.75rem;
                color: #4ade80;
                display: flex;
                align-items: center;
                gap: 5px;
            }

            .members-online::before {
                content: '';
                width: 6px;
                height: 6px;
                background: #4ade80;
                border-radius: 50%;
                animation: pulse 2s infinite;
            }

            .activity-live {
                font-size: 0.65rem;
                font-weight: 600;
                color: #ef4444;
                letter-spacing: 0.1em;
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }

            /* Member Grid */
            .members-grid {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 10px;
                margin-bottom: 15px;
            }

            .member-card {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 10px;
                background: rgba(255, 255, 255, 0.02);
                border-radius: 8px;
                position: relative;
                transition: background 0.2s;
            }

            .member-card:hover {
                background: rgba(255, 255, 255, 0.05);
            }

            .member-card.online {
                border-left: 2px solid #4ade80;
            }

            .member-avatar {
                font-size: 1.4rem;
            }

            .member-info {
                flex: 1;
                min-width: 0;
            }

            .member-name {
                font-size: 0.8rem;
                color: #ddd;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .member-stats {
                font-size: 0.7rem;
                color: #666;
            }

            .online-indicator {
                width: 8px;
                height: 8px;
                background: #4ade80;
                border-radius: 50%;
                position: absolute;
                top: 8px;
                right: 8px;
            }

            .view-all-btn {
                width: 100%;
                padding: 10px;
                background: rgba(var(--house-primary-rgb, 159, 122, 234), 0.1);
                border: 1px solid rgba(var(--house-primary-rgb, 159, 122, 234), 0.2);
                border-radius: 6px;
                color: var(--house-primary, #9f7aea);
                font-size: 0.8rem;
                cursor: pointer;
                transition: all 0.2s;
            }

            .view-all-btn:hover {
                background: rgba(var(--house-primary-rgb, 159, 122, 234), 0.2);
            }

            /* Activity Feed */
            .activity-list {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .activity-item {
                display: flex;
                align-items: flex-start;
                gap: 10px;
                padding: 8px 10px;
                background: rgba(255, 255, 255, 0.02);
                border-radius: 6px;
            }

            .activity-icon {
                font-size: 1rem;
                flex-shrink: 0;
            }

            .activity-content {
                flex: 1;
                min-width: 0;
                font-size: 0.8rem;
            }

            .activity-member {
                color: var(--house-primary, #9f7aea);
                font-weight: 500;
            }

            .activity-text {
                color: #999;
            }

            .activity-time {
                font-size: 0.7rem;
                color: #555;
                flex-shrink: 0;
            }

            /* Leaderboard */
            .leaderboard-list {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }

            .leaderboard-row {
                display: flex;
                align-items: center;
                gap: 10px;
                padding: 8px 10px;
                background: rgba(255, 255, 255, 0.02);
                border-radius: 6px;
            }

            .leaderboard-row.top-three {
                background: rgba(255, 215, 0, 0.05);
            }

            .leaderboard-row.user-row {
                background: rgba(var(--house-primary-rgb, 159, 122, 234), 0.1);
                border: 1px solid rgba(var(--house-primary-rgb, 159, 122, 234), 0.2);
            }

            .rank {
                width: 24px;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 0.75rem;
                font-weight: 600;
                color: #888;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 50%;
            }

            .rank.gold { background: #ffd700; color: #000; }
            .rank.silver { background: #c0c0c0; color: #000; }
            .rank.bronze { background: #cd7f32; color: #000; }

            .lb-avatar {
                font-size: 1.2rem;
            }

            .lb-name {
                flex: 1;
                font-size: 0.85rem;
                color: #ccc;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }

            .lb-xp {
                font-size: 0.8rem;
                color: #888;
                font-family: monospace;
            }

            .leaderboard-divider {
                text-align: center;
                color: #444;
                font-size: 0.8rem;
                padding: 5px 0;
            }

            /* Responsive */
            @media (max-width: 600px) {
                .members-grid {
                    grid-template-columns: 1fr;
                }
            }
        `;
    }
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HouseMembers;
}
