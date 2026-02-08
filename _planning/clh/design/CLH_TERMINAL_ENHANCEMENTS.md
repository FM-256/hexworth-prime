# CLH Terminal Simulator - Enhancement Plan

**Created:** January 19, 2026
**Status:** In Progress
**Goal:** Create the most realistic Linux terminal simulator possible for educational purposes

---

## Overview

The CLHTerminal.js component is being enhanced to provide a near-authentic bash experience. This document tracks all planned features, implementation status, and technical details.

---

## Implementation Status

### Phase 1: Core Bash Behavior (COMPLETE)

| Feature | Status | Notes |
|---------|--------|-------|
| Tab completion (commands) | ✅ Complete | Single/double tab behavior |
| Tab completion (paths) | ✅ Complete | Supports ~, relative, absolute |
| Command history (Arrow keys) | ✅ Complete | Up/Down navigation |
| Ctrl+C (SIGINT) | ✅ Complete | Shows ^C, clears line |
| Ctrl+L (clear screen) | ✅ Complete | Clears terminal |
| Ctrl+A (beginning of line) | ✅ Complete | Cursor movement |
| Ctrl+E (end of line) | ✅ Complete | Cursor movement |
| Ctrl+U (delete to start) | ✅ Complete | Line editing |
| Ctrl+K (delete to end) | ✅ Complete | Line editing |
| Ctrl+W (delete word) | ✅ Complete | Word deletion |
| Ctrl+R (reverse search) | ✅ Complete | History search |
| Ctrl+D (EOF) | ✅ Complete | Logout on empty |
| Command chaining (&&) | ✅ Complete | AND operator |
| Command chaining (||) | ✅ Complete | OR operator |
| Command chaining (;) | ✅ Complete | Sequential |
| Pipe (|) | ✅ Complete | Basic piping |
| Variable expansion ($VAR) | ✅ Complete | Environment vars |
| Tilde expansion (~) | ✅ Complete | Home directory |
| Quote handling | ✅ Complete | Single/double quotes |

### Phase 2: Advanced Shell Features (COMPLETE)

| Feature | Status | Notes |
|---------|--------|-------|
| Wildcards (*) | ✅ Complete | Glob pattern matching |
| Single char wildcard (?) | ✅ Complete | Single char match |
| Brace expansion ({a,b}) | ✅ Complete | Multiple patterns |
| I/O redirect (>) | ✅ Complete | Write to file |
| I/O redirect (>>) | ✅ Complete | Append to file |
| I/O redirect (<) | ✅ Complete | Read from file |
| Stderr redirect (2>&1) | ✅ Complete | Redirect stderr |
| Background jobs (&) | ✅ Complete | Async execution |
| Job control (Ctrl+Z) | ✅ Complete | Suspend process |
| jobs/fg/bg commands | ✅ Complete | Job management |

### Phase 3: New Commands (COMPLETE)

#### Text Processing
| Command | Status | Description |
|---------|--------|-------------|
| sort | ✅ Complete | Sort lines (-r, -n, -u flags) |
| uniq | ✅ Complete | Filter duplicates (-c, -d, -u) |
| cut | ✅ Complete | Extract columns (-d, -f, -c) |
| tr | ✅ Complete | Translate chars (-d, -s, ranges) |
| sed | ✅ Complete | Stream editor (s//, /d, /p) |
| awk | ✅ Complete | Pattern processing ({print $1}) |
| xargs | ✅ Complete | Build commands |
| tee | ✅ Complete | Split output (-a) |

#### Crypto/Encoding
| Command | Status | Description |
|---------|--------|-------------|
| base64 | ✅ Complete | Base64 encode/decode (-d) |
| md5sum | ✅ Complete | MD5 hash simulation |
| sha256sum | ✅ Complete | SHA256 hash simulation |
| sha1sum | ✅ Complete | SHA1 hash simulation |
| strings | ✅ Complete | Extract printable strings |

#### Security/Reconnaissance
| Command | Status | Description |
|---------|--------|-------------|
| nmap | ✅ Complete | Port scanner simulation (-sV, -O, -A) |
| nc (netcat) | ✅ Complete | Network utility (-l, -v) |
| tcpdump | ✅ Complete | Packet capture sim (-i, -c) |
| whois | ✅ Complete | Domain lookup |
| dig | ✅ Exists | DNS lookup |
| nslookup | ✅ Exists | DNS lookup |

### Phase 4: Mini Vim Simulator (COMPLETE)

| Feature | Status | Notes |
|---------|--------|-------|
| Modal editing (Normal/Insert/Command) | ✅ Complete | Core vim modes |
| Insert mode (i, a, o, I, A, O) | ✅ Complete | Text entry |
| Normal mode navigation (hjkl) | ✅ Complete | Cursor movement |
| Save (:w) | ✅ Complete | Write file |
| Quit (:q, :q!) | ✅ Complete | Exit vim |
| Save and quit (:wq, :x) | ✅ Complete | Combined |
| Line operations (dd, yy, p, P) | ✅ Complete | Delete/yank/paste |
| Search (/) | ✅ Complete | Find text |
| Line numbers (:set nu) | ✅ Complete | Display setting |
| Word motion (w, b) | ✅ Complete | Word navigation |
| Line motion (0, $, G, gg) | ✅ Complete | Line navigation |
| Character delete (x) | ✅ Complete | Delete char under cursor |

### Phase 5: Easter Eggs (COMPLETE)

| Command | Status | Description |
|---------|--------|-------------|
| sl | ✅ Complete | Steam locomotive (typo for ls) |
| cowsay | ✅ Complete | ASCII cow with message |
| fortune | ✅ Complete | Random quote |
| cmatrix | ✅ Complete | Matrix rain animation |
| hollywood | ✅ Complete | Fake "hacking" display |
| lolcat | ✅ Complete | Rainbow text |
| figlet | ✅ Complete | ASCII art text |

### Phase 6: Achievement System (COMPLETE)

| Achievement | Trigger | Badge | Status |
|-------------|---------|-------|--------|
| First Command | Run any command | 🌱 | ✅ |
| Pipeline Master | Use 3+ pipes in one command | 🔗 | ✅ |
| Tab Master | Use tab completion 50 times | ⌨️ | ✅ |
| History Buff | Use Ctrl+R successfully | 📜 | ✅ |
| Vim Survivor | Exit vim with :wq | 🏆 | ✅ |
| Wildcard Wizard | Use wildcards in 10 commands | ✨ | ✅ |
| Redirect Pro | Use all redirect operators | ➡️ | ✅ |
| Easter Egg Hunter | Find 5 hidden commands | 🥚 | ✅ |
| Job Juggler | Use job control (Ctrl+Z, fg, bg) | 🎪 | ✅ |

### Phase 7: Educational Features (COMPLETE)

| Feature | Status | Description |
|---------|--------|-------------|
| Man page OPERATOR NOTES | ✅ Complete | Practical hints in all 50+ man pages |
| Smart hints | ✅ Complete | Context-aware suggestions |
| Command explanations | ✅ Complete | Explain errors educationally |
| Pro tips | ✅ Complete | Show tips based on user behavior |

---

## Technical Architecture

### File Structure
```
_app/components/
├── CLHTerminal.js      # Main terminal simulator engine
├── CLHConfig.js        # Module configurations (30 modules)
├── CLHVim.js           # Vim simulator (planned)
├── CLHAchievements.js  # Achievement tracking (planned)
└── CLHHints.js         # Smart hints system (planned)
```

### CLHTerminal.js Structure
```javascript
class CLHTerminal {
    // Core State
    - currentDir, user, hostname, env, fs
    - commandHistory, historyIndex
    - objectives, objectivesCompleted

    // Event Handling
    - _setupEventListeners()     // Keyboard shortcuts
    - _handleTabCompletion()     // Tab completion
    - _handleReverseSearchKey()  // Ctrl+R search

    // Command Processing
    - _executeWithChaining()     // Parse && || ; |
    - _parseCommandChain()       // Split into commands
    - _executeSingleCommand()    // Run one command
    - _runCommand()              // Command switch

    // Shell Features
    - _expandVariables()         // $VAR, ${VAR}
    - _expandWildcards()         // *, ?, {a,b}
    - _parseRedirection()        // >, >>, <
    - _handleRedirection()       // Write to files

    // Tab Completion
    - _getCompletionContext()    // What to complete
    - _getCommandCompletions()   // Command names
    - _getPathCompletions()      // File paths
    - _applyCompletion()         // Insert completion

    // Commands (50+)
    - _cmdLs(), _cmdCd(), _cmdCat(), ...
}
```

---

## Command Reference

### Currently Implemented (70+ commands)
```
Navigation:    pwd, ls, cd, find, locate, tree
Files:         cat, head, tail, less, more, file, stat, touch, mkdir, rm, cp, mv
Search:        grep, wc
Text:          echo
Archives:      tar, gzip, gunzip, zip, unzip
System:        uname, hostname, whoami, id, date, uptime, clear, history
Process:       ps, top, kill, pkill
Network:       ping, netstat, ss, ifconfig, ip, nslookup, dig, traceroute, arp, route
Disk:          df, du, lsblk, mount, fdisk
Users:         w, last, who, useradd, userdel, usermod, passwd, groupadd
Permissions:   chmod, chown, chgrp, getfacl
Services:      systemctl, service, crontab
Packages:      apt, apt-get, apt-cache, dpkg
Remote:        ssh, scp, ssh-keygen, curl, wget
Editors:       vim, vi, nano
Other:         env, export, alias, type, which, man, sudo, su
```

### Planned Additions
```
Text:          sort, uniq, cut, tr, sed, awk, xargs, tee
Crypto:        base64, md5sum, sha256sum, strings
Security:      nmap, nc, tcpdump, whois
Fun:           sl, cowsay, fortune, cmatrix, figlet, lolcat
```

---

## Testing Checklist

### Tab Completion
- [ ] `ls /etc/` + Tab shows directory contents
- [ ] `cat /etc/pa` + Tab completes to `passwd`
- [ ] `cd ~/` + Tab shows home directory contents
- [ ] Double-tab shows all options in columns
- [ ] Command completion: `sys` + Tab → `systemctl`

### Keyboard Shortcuts
- [ ] Ctrl+C shows ^C and clears line
- [ ] Ctrl+L clears screen
- [ ] Ctrl+A moves to start
- [ ] Ctrl+E moves to end
- [ ] Ctrl+U deletes to start
- [ ] Ctrl+K deletes to end
- [ ] Ctrl+W deletes word
- [ ] Ctrl+R enters reverse search
- [ ] Arrow Up/Down navigates history

### Command Chaining
- [ ] `ls && echo success` runs both
- [ ] `false && echo skip` skips echo
- [ ] `false || echo fallback` runs echo
- [ ] `ls; pwd; whoami` runs all three
- [ ] `cat /etc/passwd | grep root` pipes correctly

### Wildcards
- [ ] `ls *.txt` matches .txt files
- [ ] `ls file?.txt` matches single char
- [ ] `cat {a,b,c}.txt` expands braces

### Redirects
- [ ] `echo test > file.txt` creates file
- [ ] `echo more >> file.txt` appends
- [ ] `cat < input.txt` reads from file

---

## Forensics Scenario Ideas

### Suspicious Activity to Discover
1. **Cron backdoor:** Hidden cron job running at 3am
2. **Rogue process:** `cryptominer` in ps output
3. **Auth log anomaly:** Failed SSH from unusual IP
4. **SUID binary:** Suspicious executable with setuid
5. **Hidden directory:** `.backdoor` in /tmp
6. **Encoded payload:** base64 string in /var/tmp
7. **Exfiltration:** Large outbound connection in netstat
8. **Privilege escalation:** world-writable /etc/passwd

### nmap Simulation Output
```
Starting Nmap 7.92 ( https://nmap.org )
Nmap scan report for target.local (192.168.1.100)
Host is up (0.0023s latency).

PORT     STATE SERVICE     VERSION
22/tcp   open  ssh         OpenSSH 8.2p1
80/tcp   open  http        Apache httpd 2.4.41
443/tcp  open  ssl/http    Apache httpd 2.4.41
3306/tcp open  mysql       MySQL 8.0.23
8080/tcp open  http-proxy
```

---

## Notes

- All features should work without internet connection
- Terminal should feel responsive (<100ms response)
- Easter eggs should be discoverable but not intrusive
- Achievements should encourage exploration
- Smart hints should be optional (can be disabled)

---

## Changelog

### January 19, 2026 (Session 4)
- Added job control (Phase 2 complete):
  - Ctrl+Z to suspend processes
  - Background execution with & operator
  - jobs, fg, bg commands with full man pages
- Added achievement system (Phase 6 complete):
  - 10 achievements with animated popup notifications
  - Persistent storage in localStorage
  - Tracks: first command, pipeline master, tab master, history buff, vim survivor, wildcard wizard, redirect pro, easter hunter, job juggler
- Added smart hints system (Phase 7 complete):
  - Context-aware tips for common errors
  - Typo detection and suggestions
  - Educational pro tips (30% random chance)
  - Styled notification popups
- ALL PHASES NOW COMPLETE

### January 19, 2026 (Session 3)
- Added OPERATOR NOTES to all 50+ man pages with practical hints:
  - Navigation: man, ls, cd, pwd
  - File operations: cat, head, tail, grep, find
  - Text processing: sort, uniq, cut, tr, sed, awk, tee, xargs
  - Crypto/encoding: base64, md5sum, sha256sum, sha1sum, strings
  - Security/recon: nmap, nc, tcpdump, whois, dig, nslookup, ping
  - System/process: ps, top, kill, chmod, chown
  - Services/editors: systemctl, vim, nano, ssh
  - Package/misc: scp, apt, dpkg, echo, history
- Each OPERATOR NOTES section includes:
  - When to use the command (bulleted use cases)
  - Pro tips with practical forensics/security examples
  - Context-aware hints for cyber operations
- Fixed vim exit bug (added return statements after _exitVim() calls)

### January 19, 2026 (Session 2)
- Added text processing commands: sort, uniq, cut, tr, sed, awk, tee, xargs
- Added crypto/encoding commands: base64, md5sum, sha1sum, sha256sum, strings
- Added security/recon commands: nmap, nc/netcat, tcpdump, whois
- Added easter egg commands: sl, cowsay, fortune, cmatrix, figlet, lolcat, hollywood
- Implemented full mini vim simulator with modal editing (Normal/Insert/Command modes)
  - Navigation: hjkl, arrows, 0, $, w, b, G, gg
  - Insert modes: i, a, o, I, A, O
  - Editing: dd, yy, p, P, x
  - Commands: :w, :q, :q!, :wq, :x, /search, :set nu
- Updated help command and tab completion with all new commands

### January 19, 2026 (Session 1)
- Created enhancement plan document
- Implemented wildcards/globbing (*, ?, {a,b})
- Implemented I/O redirection (>, >>, <, 2>&1)
- Previously implemented: Tab completion, keyboard shortcuts, command chaining

### January 18, 2026
- Major realism overhaul
- Added bash keyboard shortcuts (Ctrl+C/L/A/E/U/K/W/R/D)
- Added command chaining (&&, ||, ;, |)
- Added double-tab completion display
- Added reverse history search

### January 17, 2026
- Fixed CLHTerminal naming conflict
- Fixed _checkObjectives parameter passing
- Added _cmdExport method

---

## References

- GNU Bash Manual: https://www.gnu.org/software/bash/manual/
- Linux man pages for command behavior
- POSIX shell specification for compatibility
