# Linux Mastery - Complete Solutions Guide

**Course:** Linux Mastery (Script House)
**Total Modules:** 53
**Last Updated:** January 26, 2026

---

## Section 1: Getting Started (5 modules)

### LM-01: Welcome to Linux
**Tasks:**
1. Type `whoami` - displays current username
2. Type `pwd` - shows current working directory
3. Type `date` - displays current date/time
4. Type `clear` - clears the terminal screen

### LM-02: First Commands
**Tasks:**
1. `echo "Hello, Linux!"` - prints text to screen
2. `whoami` - shows username (learner)
3. `hostname` - shows system name (linux-mastery)
4. `uptime` - shows system uptime
5. `cal` - displays calendar

### LM-03: Getting Help
**Tasks:**
1. `man ls` - view manual for ls command
2. `ls --help` - view help for ls
3. `whatis pwd` - one-line description of pwd
4. `apropos search` - search for commands related to "search"

### LM-04: Terminal Environment
**Tasks:**
1. `echo $HOME` - display HOME variable
2. `echo $PATH` - display PATH variable
3. `env` - list all environment variables
4. `history` - show command history

### LM-05: Section 1 Practice
**Challenges:**
1. `whoami` - identify yourself
2. `pwd` - find current location
3. `echo "I am learning Linux"` - print message
4. `date` - display date
5. `cal` - show calendar
6. `man cat` or `cat --help` - get help on cat

---

## Section 2: Navigation & Files (7 modules)

### LM-06: Navigation
**Tasks:**
1. `cd /etc` - change to /etc directory
2. `cd ~` or `cd` - return to home directory
3. `cd ..` - go up one level
4. `cd ~/Documents` - navigate to Documents

### LM-07: Listing Files
**Tasks:**
1. `ls` - basic listing
2. `ls -l` - long format listing
3. `ls -a` - show hidden files
4. `ls -lh` - long format with human-readable sizes

### LM-08: File Operations
**Tasks:**
1. `touch newfile.txt` - create empty file
2. `mkdir projects` - create directory
3. `rm oldfile.txt` - remove file
4. `rmdir emptydir` - remove empty directory

### LM-09: Copy & Move
**Tasks:**
1. `cp file1.txt file2.txt` - copy file
2. `cp -r dir1 dir2` - copy directory recursively
3. `mv old.txt new.txt` - rename file
4. `mv file.txt ~/Documents/` - move file

### LM-10: Viewing Files
**Tasks:**
1. `cat file.txt` - display entire file
2. `head -5 file.txt` - show first 5 lines
3. `tail -10 file.txt` - show last 10 lines
4. `less largefile.txt` - paginated viewing (q to quit)

### LM-11: Finding Files
**Tasks:**
1. `find . -name "*.txt"` - find txt files in current dir
2. `find /home -type d` - find directories
3. `locate passwd` - quick search (uses database)
4. `which python3` - find command location

### LM-12: Section 2 Practice
**Challenges:**
1. `cd /var/log` then `pwd` - navigate and verify
2. `ls -la` - list all with details
3. `touch practice.txt` - create file
4. `mkdir testdir` - create directory
5. `cp practice.txt testdir/` - copy file
6. `find . -name "*.log"` - find log files

---

## Section 3: Text Processing (8 modules)

### LM-13: grep Basics
**Tasks:**
1. `grep "error" logfile.txt` - search for "error"
2. `grep -i "warning" file.txt` - case-insensitive search
3. `grep -n "pattern" file.txt` - show line numbers
4. `grep -r "TODO" .` - recursive search

### LM-14: Regular Expressions
**Tasks:**
1. `grep "^Start" file.txt` - lines starting with "Start"
2. `grep "end$" file.txt` - lines ending with "end"
3. `grep "[0-9]" file.txt` - lines with digits
4. `grep -E "cat|dog" file.txt` - match cat OR dog

### LM-15: sed Editor
**Tasks:**
1. `sed 's/old/new/' file.txt` - replace first occurrence
2. `sed 's/old/new/g' file.txt` - replace all occurrences
3. `sed -n '5,10p' file.txt` - print lines 5-10
4. `sed '/pattern/d' file.txt` - delete matching lines

### LM-16: awk Processing
**Tasks:**
1. `awk '{print $1}' file.txt` - print first column
2. `awk -F: '{print $1}' /etc/passwd` - colon delimiter
3. `awk '{sum += $1} END {print sum}' nums.txt` - sum column
4. `awk 'NR > 1' file.txt` - skip header line

### LM-17: sort & uniq
**Tasks:**
1. `sort file.txt` - sort alphabetically
2. `sort -n numbers.txt` - numeric sort
3. `sort -r file.txt` - reverse sort
4. `sort file.txt | uniq` - remove duplicates
5. `sort file.txt | uniq -c` - count occurrences

### LM-18: cut & paste
**Tasks:**
1. `cut -d',' -f1 data.csv` - first field, comma delimiter
2. `cut -c1-10 file.txt` - first 10 characters
3. `paste file1.txt file2.txt` - merge files side by side
4. `paste -d',' file1.txt file2.txt` - merge with comma

### LM-19: Text Pipelines
**Tasks:**
1. `cat file.txt | grep "error" | wc -l` - count error lines
2. `ps aux | grep nginx | awk '{print $2}'` - get nginx PIDs
3. `cat access.log | cut -d' ' -f1 | sort | uniq -c | sort -rn | head` - top IPs
4. `find . -name "*.log" | xargs grep "ERROR"` - search in found files

### LM-20: Section 3 Practice
**Challenges:**
1. `grep -i "error" /var/log/syslog` - find errors
2. `sed 's/foo/bar/g' file.txt` - replace all
3. `awk -F: '{print $1, $3}' /etc/passwd` - users and UIDs
4. `sort data.txt | uniq -c | sort -rn` - frequency count
5. `cat log.txt | grep "WARN" | wc -l` - count warnings
6. `cut -d',' -f2 data.csv | sort | uniq` - unique values in column 2

---

## Section 4: Permissions & Users (7 modules)

### LM-21: Users & Groups
**Tasks:**
1. `whoami` - current user
2. `id` - user ID, group ID, groups
3. `groups` - list groups user belongs to
4. `cat /etc/passwd` - view user accounts
5. `cat /etc/group` - view groups

### LM-22: File Permissions
**Tasks:**
1. `ls -l file.txt` - view permissions
2. Identify: `r` (read=4), `w` (write=2), `x` (execute=1)
3. Understand: owner, group, others (rwxrwxrwx)
4. `stat file.txt` - detailed file info

### LM-23: chmod
**Tasks:**
1. `chmod 755 script.sh` - rwxr-xr-x
2. `chmod 644 file.txt` - rw-r--r--
3. `chmod +x script.sh` - add execute
4. `chmod u+w,g-w file.txt` - symbolic mode
5. `chmod -R 755 directory/` - recursive

### LM-24: chown
**Tasks:**
1. `chown user file.txt` - change owner
2. `chown user:group file.txt` - change owner and group
3. `chown :group file.txt` - change group only
4. `chown -R user:group dir/` - recursive

### LM-25: sudo
**Tasks:**
1. `sudo command` - run as root
2. `sudo -i` - interactive root shell
3. `sudo -u otheruser command` - run as another user
4. `sudo cat /etc/shadow` - view protected file

### LM-26: Special Permissions
**Tasks:**
1. `chmod u+s program` - setuid (4xxx)
2. `chmod g+s directory` - setgid (2xxx)
3. `chmod +t directory` - sticky bit (1xxx)
4. `ls -l` - identify special perms (s, S, t, T)

### LM-27: Section 4 Practice
**Challenges:**
1. `id` - view your identity
2. `ls -la` - check permissions
3. `chmod 700 secret.txt` - owner only
4. `chmod +x myscript.sh` - make executable
5. `sudo cat /etc/shadow` - privileged read
6. Create file with specific permissions

**Badge Earned:** (None for this section - capstone only)

---

## Section 5: Processes (7 modules)

### LM-28: Process Basics
**Tasks:**
1. `ps` - list your processes
2. `ps aux` - all processes, detailed
3. `ps -ef` - full format listing
4. `pgrep nginx` - find process by name

### LM-29: ps & top
**Tasks:**
1. `ps aux --sort=-%cpu | head` - top CPU consumers
2. `ps aux --sort=-%mem | head` - top memory consumers
3. `top` - interactive process viewer (q to quit)
4. `htop` - enhanced top (if installed)

### LM-30: Background Jobs
**Tasks:**
1. `command &` - run in background
2. `Ctrl+Z` - suspend foreground process
3. `bg` - resume in background
4. `fg` - bring to foreground
5. `jobs` - list background jobs
6. `nohup command &` - persist after logout

### LM-31: Signals & kill
**Tasks:**
1. `kill PID` - send SIGTERM (graceful)
2. `kill -9 PID` - send SIGKILL (force)
3. `kill -STOP PID` - pause process
4. `kill -CONT PID` - resume process
5. `killall processname` - kill by name
6. `pkill pattern` - kill by pattern

### LM-32: cron
**Tasks:**
1. `crontab -l` - list cron jobs
2. `crontab -e` - edit cron jobs
3. Format: `* * * * * command` (min hour day month weekday)
4. `0 2 * * * /backup.sh` - daily at 2 AM
5. `*/15 * * * * /check.sh` - every 15 minutes
6. `@daily`, `@hourly`, `@reboot` - special strings

### LM-33: systemd
**Tasks:**
1. `systemctl status nginx` - check service status
2. `systemctl start nginx` - start service
3. `systemctl stop nginx` - stop service
4. `systemctl restart nginx` - restart service
5. `systemctl enable nginx` - enable at boot
6. `systemctl disable nginx` - disable at boot
7. `journalctl -u nginx` - view service logs

### LM-34: Section 5 Practice
**Challenges:**
1. `ps aux | grep mining` - find suspicious process
2. `kill PID` - terminate process
3. `command &` then `jobs` - background job
4. `pkill -f python` - kill all python processes
5. `crontab -l` - view scheduled tasks
6. `systemctl status sshd` - check SSH service
7. `systemctl restart nginx` - restart web server
8. `journalctl -u nginx --since "1 hour ago"` - recent logs

**Badge Earned:** Process Master

---

## Section 6: Networking Basics (6 modules)

### LM-35: Network Info
**Tasks:**
1. `ip addr` or `ip a` - show IP addresses
2. `ip link` - show network interfaces
3. `hostname` - display hostname
4. `hostname -I` - show all IPs
5. `cat /etc/hosts` - view hosts file

### LM-36: Connectivity
**Tasks:**
1. `ping localhost` - test local connectivity
2. `ping -c 4 google.com` - ping 4 times
3. `traceroute google.com` - trace network path
4. `ss -tuln` - show listening ports
5. `netstat -tuln` - alternative (older)

### LM-37: DNS Tools
**Tasks:**
1. `dig google.com` - DNS lookup
2. `dig google.com +short` - short answer
3. `nslookup google.com` - alternative lookup
4. `host google.com` - simple lookup
5. `cat /etc/resolv.conf` - view DNS servers

### LM-38: Downloading
**Tasks:**
1. `curl https://example.com` - fetch URL content
2. `curl -O https://example.com/file.zip` - download file
3. `curl -I https://example.com` - headers only
4. `wget https://example.com/file.zip` - download file
5. `wget -q -O output.html https://example.com` - quiet, rename

### LM-39: SSH Basics
**Tasks:**
1. `ssh user@host` - connect to remote host
2. `ssh-keygen -t ed25519` - generate SSH key pair
3. `ls ~/.ssh/` - view SSH directory
4. `cat ~/.ssh/id_ed25519.pub` - view public key
5. `scp file.txt user@host:/path/` - secure copy

### LM-40: Section 6 Practice
**Challenges:**
1. `ip addr | grep inet` - find IP addresses
2. `ping -c 3 localhost` - test connectivity
3. `dig example.com +short` - DNS lookup
4. `ss -tuln | grep :22` - check SSH port
5. `curl -I https://httpbin.org/get` - get headers
6. `wget -O test.html https://example.com` - download page
7. `ssh-keygen -t ed25519` - generate key
8. `curl https://httpbin.org/headers` - view request headers

**Badge Earned:** Network Navigator

---

## Section 7: Shell Scripting (8 modules)

### LM-41: First Script
**Tasks:**
1. Create script: `echo '#!/bin/bash' > hello.sh && echo 'echo "Hello World"' >> hello.sh`
2. `chmod +x hello.sh` - make executable
3. `./hello.sh` - run script
4. `bash hello.sh` - alternative execution

### LM-42: Variables
**Tasks:**
1. `NAME="Linux"` - assign variable (no spaces!)
2. `echo $NAME` - use variable
3. `echo "Hello, ${NAME}!"` - in string
4. `DATE=$(date)` - command substitution
5. `echo "Today is $DATE"`

### LM-43: User Input
**Tasks:**
1. `read name` then type input - read into variable
2. `read -p "Enter name: " name` - prompt
3. `read -s password` - silent input (passwords)
4. `$1`, `$2`, `$@` - positional arguments
5. `$#` - number of arguments

### LM-44: Conditionals
**Tasks:**
1. Basic if:
```bash
if [ "$x" -eq 5 ]; then
    echo "x is 5"
fi
```
2. if-else:
```bash
if [ -f "file.txt" ]; then
    echo "File exists"
else
    echo "File not found"
fi
```
3. Numeric: `-eq`, `-ne`, `-lt`, `-gt`, `-le`, `-ge`
4. String: `=`, `!=`, `-z` (empty), `-n` (not empty)
5. File: `-f` (file), `-d` (directory), `-e` (exists), `-r` (readable)

### LM-45: Loops
**Tasks:**
1. For loop:
```bash
for i in 1 2 3 4 5; do
    echo "Number: $i"
done
```
2. For with range:
```bash
for i in {1..10}; do
    echo $i
done
```
3. While loop:
```bash
count=0
while [ $count -lt 5 ]; do
    echo $count
    ((count++))
done
```
4. Loop over files:
```bash
for file in *.txt; do
    echo "Processing $file"
done
```

### LM-46: Functions
**Tasks:**
1. Define function:
```bash
greet() {
    echo "Hello, $1!"
}
greet "World"
```
2. Local variables:
```bash
myfunc() {
    local myvar="local"
    echo $myvar
}
```
3. Return values:
```bash
add() {
    echo $(($1 + $2))
}
result=$(add 5 3)
```

### LM-47: Practical Scripts
**Example scripts to understand:**

1. **Backup Script:**
```bash
#!/bin/bash
BACKUP_DIR="/backup"
DATE=$(date +%Y%m%d)
tar -czf "$BACKUP_DIR/backup_$DATE.tar.gz" /home/user/documents
echo "Backup completed: backup_$DATE.tar.gz"
```

2. **Log Analyzer:**
```bash
#!/bin/bash
LOG="/var/log/syslog"
echo "Error count: $(grep -c ERROR $LOG)"
echo "Warning count: $(grep -c WARN $LOG)"
```

3. **System Health Check:**
```bash
#!/bin/bash
echo "=== System Health ==="
echo "Uptime: $(uptime -p)"
echo "Disk: $(df -h / | tail -1 | awk '{print $5}')"
echo "Memory: $(free -h | grep Mem | awk '{print $3 "/" $2}')"
```

### LM-48: Section 7 Practice
**Challenges:**
1. Create greeting script with user input
2. Script that accepts command line args
3. Script that checks if file exists
4. Script that loops through files in directory
5. Script with a function
6. Create a simple backup script
7. Script that validates input
8. Script that uses all concepts together

**Badge Earned:** Script Wizard

---

## Section 8: Beyond Basics (5 modules)

### LM-49: Links
**Tasks:**
1. `ln file.txt hardlink.txt` - create hard link
2. `ln -s file.txt symlink.txt` - create symbolic link
3. `ls -l` - view links (symlinks show ->)
4. `readlink symlink.txt` - show link target
5. `ls -i` - show inodes (hard links share inode)

**Key Differences:**
- Hard link: Same inode, survives original deletion
- Soft link: Different inode, breaks if original deleted

### LM-50: Text Editors
**nano shortcuts:**
- `Ctrl+O` - Save (Write Out)
- `Ctrl+X` - Exit
- `Ctrl+W` - Search
- `Ctrl+K` - Cut line
- `Ctrl+U` - Paste

**vim survival:**
- `i` - Enter insert mode
- `Esc` - Return to normal mode
- `:w` - Save
- `:q` - Quit
- `:wq` or `ZZ` - Save and quit
- `:q!` - Quit without saving
- `dd` - Delete line
- `yy` - Copy line
- `p` - Paste

### LM-51: Package Management
**Tasks (Debian/Ubuntu):**
1. `sudo apt update` - refresh package list
2. `sudo apt upgrade` - upgrade packages
3. `sudo apt install package` - install package
4. `sudo apt remove package` - remove package
5. `apt search keyword` - search packages
6. `apt show package` - package details
7. `dpkg -l` - list installed packages
8. `dpkg -L package` - list package files

### LM-52: Environment & PATH
**Tasks:**
1. `env` - show all environment variables
2. `echo $PATH` - show PATH
3. `export MYVAR="value"` - set variable
4. `PATH=$PATH:/new/path` - add to PATH
5. Edit `~/.bashrc` for permanent changes
6. `alias ll='ls -la'` - create alias
7. `source ~/.bashrc` - reload config

### LM-53: Next Steps
**Tasks:**
1. Review progress
2. Explore certification paths (Linux+, LPIC-1)
3. Discover resources (man pages, tldr, explainshell)
4. Set up practice environment (VM, WSL, cloud)
5. Type `celebrate` in terminal for badge!

**Badge Earned:** Linux Apprentice

---

## Quick Reference - All Badges

| Badge | Section | Requirement |
|-------|---------|-------------|
| Process Master | Section 5 | Complete LM-34 Practice |
| Network Navigator | Section 6 | Complete LM-40 Practice |
| Script Wizard | Section 7 | Complete LM-48 Practice |
| Linux Apprentice | Section 8 | Complete LM-53 (entire course) |

---

## Troubleshooting Common Issues

### Terminal Not Working
- Ensure module uses: `new LinuxTerminal('terminal', { user: 'learner', hostname: 'linux-mastery', height: '350px' });`
- Check browser console for JavaScript errors

### Progress Not Saving
- Check localStorage: `localStorage.getItem('hexworth_progress')`
- Clear and retry: `localStorage.removeItem('hexworth_progress')`

### Commands Not Recognized
- LinuxTerminal has simulated commands - not all Linux commands work
- Check LinuxTerminal.js for supported commands

---

*This solutions guide is for instructor/admin reference. Do not share with students.*
