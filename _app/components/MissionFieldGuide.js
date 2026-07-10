/**
 * MissionFieldGuide.js — beginner teaching layer for Linux Command Mastery missions.
 *
 * The mission manifests (bc1-baked) carry story + riddle-style task briefs but no
 * teaching layer; operator ruled 2026-07-09 the missions serve BEGINNERS, so each
 * mission card gets a collapsible "field guide" that teaches the command's moves
 * BEFORE the student starts. Content teaches the toolbox (which flag does what),
 * never task-by-task answers; every row was cross-checked against the mission's
 * canonical solution.sh in _tools/sandbox-missions/<id>/ (the grader's ground truth).
 *
 * Usage:  MissionFieldGuide.attach(cardEl, missionId, commandStar)
 *         — inserts a collapsed <details> guide into the card, or silently no-ops
 *           for unknown mission ids (future missions degrade gracefully; the
 *           fieldguide-drift-check.js QC script catches coverage gaps loudly).
 *
 * All text renders via createElement/textContent — no innerHTML anywhere.
 * Drift tripwire: _tools/sandbox-missions/fieldguide-drift-check.js diffs the
 * GUIDES keys against the real mission.json ids; run it in QC after any change
 * to missions or guides.
 */
(function () {
    'use strict';

    // Tips shown at the top of every guide. [command, explanation]; empty command
    // renders as a plain tip line. The first two are the day-one on-ramp (QC
    // 2026-07-09): finding and entering the randomized department directory
    // needs ls/cd, which the curriculum itself does not teach until missions
    // 2-3 - so every guide teaches the two moves up front.
    var COMMON = [
        ['ls', 'see what is here; START_HERE.txt in your home folder names your department directory'],
        ['cd yourdept', 'move into your department folder (cd alone brings you home)'],
        ['cat BRIEFING*.txt', 'read the briefing there first; every mission starts with it'],
        ['command > file.txt', 'saves a command\'s output into a file; most tasks grade files you create this way'],
        ['', 'Grade early, grade often. Grading is free, and every failed check tells you what is still wrong.']
    ];

    // Per-mission guides, keyed by mission.json id. rows: [command, what it does].
    var GUIDES = {
        'cat-lost-notes': [
            ['cat file', 'print a file\'s contents'],
            ['cat > f.txt', 'create a file from your keyboard: type the lines, finish with Ctrl+D'],
            ['cat >> f.txt', 'append to the end the same way; existing lines untouched'],
            ["echo 'one line' > f.txt", 'quick one-line file'],
            ['cat a.txt b.txt c.txt > out.txt', 'join files, in the order you list them'],
            ['cat -n f', 'number EVERY line'],
            ['cat -b f', 'number only the non-blank lines'],
            ['cat -A f', 'reveal all invisibles: tabs show as ^I, line ends as $'],
            ['cat -E f', 'mark only line ends with $'],
            ["echo 'header' | cat - notes.txt > memo.txt", 'the lone dash means "whatever is piped in", here the echo before it'],
            ["grep 'word' f > out.txt", 'keep only the lines containing word'],
            ['tac f > out.txt', 'cat backwards: last line first']
        ],
        'ls-first-inventory': [
            ['ls dir', 'list a directory (add > out.txt to save the listing)'],
            ['ls -a', 'include hidden dot-files, plus the . and .. pair'],
            ['ls -A', 'hidden entries WITHOUT . and .. so you can count the real ones (save your count with echo N > file.txt)'],
            ['ls -S', 'sort by size, largest first; the top line is your answer'],
            ['ls -t', 'newest first; add -r to flip it (oldest first)'],
            ['ls -R', 'recurse into every subdirectory'],
            ['ls -r', 'reverse the name order'],
            ['ls -d dir/*/', 'list only the subdirectories'],
            ['ls -i', 'show inode numbers; two names sharing one inode are the same file']
        ],
        'cd-breadcrumbs': [
            ['cd a/b/c', 'go down several levels in one move'],
            ['cd ..', 'up one level; cd ../.. climbs two at once'],
            ['cd', 'by itself: straight home'],
            ['cd /opt/...', 'absolute paths start with / and work from anywhere'],
            ['cd -', 'bounce back to wherever you JUST were'],
            ['pwd', 'print exactly where you are (pwd > f.txt saves it)'],
            ['', 'A symlink is a door: cd through it like a normal directory.'],
            ['pwd -P', 'resolve symlinks: where you PHYSICALLY are, not just the path you typed'],
            ['pwd > /home/student/yourdept/f.txt', 'write an answer into your department directory from ANYWHERE: absolute path after >'],
            ['command >> f.txt', 'appends a line instead of replacing the file'],
            ['', 'Depth: count the slashes in pwd\'s output; / is the root.']
        ],
        'cpmv-relocation': [
            ['cp src dst/', 'copy; the original stays'],
            ['mv src dst/', 'move; nothing left behind'],
            ['mv oldname newname', 'renaming IS a move within the same directory'],
            ['cp -r dir dst', 'copy a whole directory tree'],
            ['cp -p file dst', 'preserve the timestamp while copying'],
            ['cp -a dir archive', 'archive mode: recursive AND preserves everything'],
            ['mv *.log dst/', 'the shell expands wildcards; one command sweeps them all'],
            ['', 'Keep-a-copy trick: copy a file to name.bak before something overwrites it.']
        ],
        'rm-decommission': [
            ['rm file', 'gone. No trash, no undo'],
            ['', 'Preview first: ls the pattern, THEN rm the pattern.'],
            ['rm expired_*.cert', 'the wildcard matches only names of that shape'],
            ['rm -r dir', 'directories need the recursive flag'],
            ['rm dir/*', 'empties a directory but keeps the directory itself'],
            ['ls -a', 'hidden dot-files first; then rm .name'],
            ['rm -- -rf', 'a file whose NAME starts with a dash (rm ./-rf works too)']
        ],
        'mkdir-groundbreaking': [
            ['mkdir name', 'one new directory'],
            ['mkdir -p a/b/c', 'build the whole path, parents included'],
            ['mkdir d1 d2', 'several at once (brace form {b,c} works too)'],
            ['mkdir -m 700 name', 'set permissions at the moment of creation'],
            ['mkdir -v name', 'announces what it created (redirect that line with >)'],
            ['rmdir name', 'removes ONLY empty directories; that is its safety'],
            ['', 'Occupied? Move the contents out first, then rmdir.'],
            ['rmdir -p a/b/c', 'from the deepest path, removes each newly-empty parent']
        ],
        'headtail-logwatch': [
            ['head f', 'first 10 lines; tail f shows the last 10'],
            ['head -n 25 f', 'pick your line count (tail -n 3 f likewise)'],
            ['head -n 42 f | tail -n 1', 'exactly line 42: the classic combo'],
            ['head -n -20 f', 'everything EXCEPT the last 20 lines (note the minus)'],
            ['tail -n +100 f', 'from line 100 to the end (note the plus)'],
            ['head -c 32 f', 'first 32 BYTES, not lines']
        ],
        'grep-investigation': [
            ["grep 'word' f", 'lines containing word'],
            ['grep -i', 'ignore case: Denied = DENIED = denied'],
            ['grep -c', 'just COUNT the matching lines'],
            ['grep -v', 'invert: lines that do NOT match'],
            ['grep -n', 'show line numbers with the matches'],
            ['grep -w', 'whole word only (ops, but not devops)'],
            ["grep -r 'x' dir", 'search every file under a directory'],
            ["grep -E 'pattern'", 'extended regex; [a-b] inside a pattern matches any ONE character in that range'],
            ['grep -rl', 'print only the NAMES of the matching files']
        ],
        'sortuniq-ledger': [
            ['sort f', 'alphabetical order'],
            ['sort f | uniq', 'de-duplicate (uniq only works on SORTED input)'],
            ['sort -n', 'numeric order, so 900 comes before 1000'],
            ['sort -rn f | head -n 3', 'the three largest, biggest first'],
            ['sort f | uniq -c', 'count how often each line appears'],
            ['sort f | uniq -d', 'show only the duplicated lines'],
            ['sort -t, -k2 -n f', 'CSV: split on commas, sort by column 2, numerically'],
            ['sort f | uniq | wc -l', 'how many DISTINCT lines']
        ],
        'wc-census': [
            ['wc -l f', 'count lines; -w words, -c bytes, -L longest line length'],
            ['wc -l < f', 'the < trick drops the filename; just the number remains'],
            ["grep 'ERROR' f | wc -l", 'count matching lines by piping'],
            ['wc f1 f2 f3', 'per-file counts PLUS a total line'],
            ['', 'Zero is a real answer; wc proves emptiness too.']
        ],
        'less-readingroom': [
            ['less f', 'open the pager; q quits'],
            ['G', 'jump to the very end; g goes back to the top'],
            ['/word', 'search forward; n jumps to the next hit'],
            ['1500g', 'a number then g jumps to that exact line'],
            ['less -N f', 'line numbers showing'],
            ['more f', 'the older pager: space pages forward, q quits, no going back'],
            ['', 'These tasks grade FILES: find the answer in the pager, quit, then save it, e.g. echo \'the line\' > title.txt.']
        ],
        'find-sweep': [
            ['find projects -name settings.conf', 'exact name, every depth'],
            ["find projects -name '*.swp'", 'pattern match (quote it)'],
            ['find projects -type d', 'only directories; -type f only files'],
            ['find projects -type f -size +100k', 'bigger than 100 KB'],
            ['find projects -type f -perm -002', 'world-writable (the danger bit)'],
            ['find projects -type f -empty', 'zero-byte husks'],
            ["find projects -name '*.swp' -delete", 'find AND remove in one command'],
            ['find projects -type f | wc -l', 'count files by piping'],
            ['find projects -type f -mtime N', 'filter by modification age in days; a leading minus means less than, a leading plus means more than'],
            ['', 'Run these FROM the sweep/ directory so the recorded paths match.']
        ],
        'chmod-lockdown': [
            ['', 'Numeric permissions: r=4 w=2 x=1, one digit each for owner-group-other. So 600 = owner reads and writes, everyone else nothing.'],
            ['chmod 600 f', 'private; 640 lets the group read; 644 lets the world read'],
            ['chmod 444 f', 'read-only for EVERYONE, including you'],
            ['chmod u+x f', 'symbolic form: give the owner execute'],
            ['chmod go-w f', 'strip write from group AND others'],
            ['chmod 700 dir', 'directories need x to be ENTERED; 700 locks a dir to you'],
            ['find dir -type f -exec chmod 644 {} +', 'fix files at every depth'],
            ['chmod 1777 dir', 'the /tmp special: all may add, only owners delete (sticky bit)']
        ],
        'chown-handover': [
            ['sudo chown user f', 'new owner (ownership changes need sudo)'],
            ['sudo chown :group f', 'group only; owner untouched'],
            ['sudo chown user:group f', 'both at once'],
            ['sudo chown -R user:group dir', 'the whole tree'],
            ['sudo -u user cat f', 'test-drive as that user to PROVE the access'],
            ['sudo chown --reference=other f', 'copy ownership FROM another file']
        ],
        'tar-timecapsule': [
            ['tar -cf out.tar dir', 'Create an archive File from a directory'],
            ['gzip f.tar', 'compresses to f.tar.gz and REPLACES the original (copy first to keep both)'],
            ['tar -czf out.tgz dir', 'create and compress in one move (z = gzip)'],
            ['tar -tzf f.tgz', 'list contents WITHOUT extracting (t = table). Never extract blind'],
            ['tar -xzf f.tgz -C dest/', 'eXtract INTO a chosen directory'],
            ['tar -xzf f.tgz -C dest path/inside.txt', 'extract one member (path exactly as -t printed it)'],
            ['gzip -l f.gz', 'compression stats: compressed vs original size']
        ],
        'ps-runaway': [
            ['ps aux', 'every process; pipe through grep to find one'],
            ['pgrep -f name', 'just the PID(s) matching a name'],
            ['ps -o comm= -p PID', 'the reverse: PID to command name'],
            ['kill PID', 'the polite default (TERM); pkill name works by name'],
            ['kill -9 PID', 'the unignorable KILL, for processes that trap TERM'],
            ['kill -USR1 PID', 'custom signals, like "reload your config"'],
            ['pgrep -c name', 'count matching processes']
        ],
        'systemctl-servicedesk': [
            ['', 'Two independent switches: running NOW vs starting on BOOT.'],
            ['sudo systemctl start s', 'switch 1 on: running now'],
            ['sudo systemctl enable s', 'switch 2 on: survives reboot'],
            ['sudo systemctl stop s', 'switch 1 off; disable flips switch 2 off'],
            ['systemctl is-active s', 'prove switch 1; is-enabled proves switch 2'],
            ['systemctl status s', 'the full picture: state, uptime, recent log lines'],
            ['sudo systemctl restart s', 'bounce a running service']
        ],
        'ip-linecheck': [
            ['ip addr show eth0', 'the interface\'s address as address/prefix (e.g. 10.0.0.5/24)'],
            ['ip route', 'the routing table; the "default via X" line names your gateway'],
            ['ip link show lo', 'interface state (the UP/DOWN lives in the state word)'],
            ['ss -tln', 'TCP listeners with numeric ports; pipe to grep \':7681\''],
            ['ping -c 4 host', 'cap ping at 4 packets (it runs forever otherwise)'],
            ["echo 'answer' > file.txt", 'write out each answer the audit asks for']
        ]
    };

    // Build one row <li>: <code>cmd</code> + <span>desc</span>, or a plain tip
    // line when cmd is empty. textContent only.
    function buildRow(cmd, desc, cls) {
        var li = document.createElement('li');
        li.className = cls;
        if (cmd) {
            var code = document.createElement('code');
            code.textContent = cmd;
            li.appendChild(code);
        }
        var span = document.createElement('span');
        span.textContent = desc;
        li.appendChild(span);
        return li;
    }

    /**
     * Insert a collapsed field guide into a mission card. Silently no-ops when the
     * mission id has no guide (new missions must not break the card; the drift-check
     * script is the loud alarm for that gap).
     */
    function attach(cardEl, missionId, star) {
        var rows = GUIDES[missionId];
        if (!rows || !cardEl) return;

        var details = document.createElement('details');
        details.className = 'mission-fieldguide';

        var summary = document.createElement('summary');
        summary.textContent = 'New to ' + (star || 'this command') + '? Open the field guide';
        details.appendChild(summary);

        var ul = document.createElement('ul');
        ul.className = 'mission-fieldguide__list';
        COMMON.forEach(function (r) { ul.appendChild(buildRow(r[0], r[1], 'mission-fieldguide__tip')); });
        rows.forEach(function (r) { ul.appendChild(buildRow(r[0], r[1], 'mission-fieldguide__row')); });
        details.appendChild(ul);

        cardEl.appendChild(details);
    }

    window.MissionFieldGuide = {
        attach: attach,
        // Read-only manual data for the full-page Field Manual
        // (houses/observatory/field-manual.html, 2026-07-10). Returns fresh
        // arrays on every call so callers can never mutate the guides.
        manual: function () {
            return {
                common: COMMON.map(function (r) { return r.slice(); }),
                missions: Object.keys(GUIDES).map(function (id) {
                    return { id: id, rows: GUIDES[id].map(function (r) { return r.slice(); }) };
                })
            };
        },
        // exposed for the drift-check script and QC harnesses
        _ids: Object.keys(GUIDES)
    };
})();
