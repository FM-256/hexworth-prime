/* ============================================================
   CTF ARENA — Box B10: The Glitching Chronos
   Advanced Application Debugging | Crimson Dawn Confederacy
   Config: Race conditions, threading, GDB debugging, source analysis
   ============================================================ */

const B10Config = {

    // ═══════════════════════════════════════════════════════
    // BOX METADATA
    // ═══════════════════════════════════════════════════════

    title: 'The Glitching Chronos',
    subtitle: 'Advanced Application Debugging — Crimson Dawn Confederacy',
    difficulty: 'Advanced',
    accent: '#ef4444',
    storageKey: 'hexworth_ctf_b10',
    registryId: 'b10-glitching-chronos',
    trackerKey: 'ctf_b10',

    // ═══════════════════════════════════════════════════════
    // PHASE SYSTEM (Multi-layer troubleshooting chain)
    // ═══════════════════════════════════════════════════════

    phases: [
        {
            id: 'recon',
            name: 'System Assessment',
            icon: '\uD83D\uDD0D',
            description: 'SSH into the application server. Check logs, process status, and gather initial evidence of the intermittent failures.',
            requiredFlags: [],
            mitre: ['T1046', 'T1082'],
            unlocks: ['analysis'],
            locked: false
        },
        {
            id: 'analysis',
            name: 'Source Code Analysis',
            icon: '\uD83D\uDD2C',
            description: 'Review the chronos_core source code. Identify shared resources, threading patterns, and potential race conditions.',
            requiredFlags: [],
            mitre: ['T1190', 'T1592.004'],
            unlocks: ['debugging'],
            locked: true
        },
        {
            id: 'debugging',
            name: 'Debug & Pinpoint',
            icon: '\uD83D\uDC1B',
            description: 'Use GDB to attach to the process. Set breakpoints, examine threads, and pinpoint the exact race condition.',
            requiredFlags: ['user'],
            mitre: ['T1059.004', 'T1098'],
            unlocks: ['verification'],
            locked: true
        },
        {
            id: 'verification',
            name: 'Verification',
            icon: '\u2705',
            description: 'Confirm the fix resolves the race condition and retrieve the synchronization verification token.',
            requiredFlags: ['root'],
            mitre: ['T1530', 'T1005'],
            unlocks: [],
            locked: true
        }
    ],

    // ═══════════════════════════════════════════════════════
    // TUTORIAL MODE (Sprint AR-12)
    // ═══════════════════════════════════════════════════════

    tutorialMode: true,

    tutorial: {
        steps: [
            {
                title: 'Check application status',
                tip: 'Open the Terminal and run: ps aux to find the chronos_core process. Check journalctl for error patterns.',
                trigger: { event: 'command', match: { cmd: 'contains:ps' } }
            },
            {
                title: 'Review the source code',
                tip: 'Read the source files: cat /opt/chronos_scheduler/src/scheduler.cpp. Look for shared variables accessed by multiple threads.',
                trigger: { event: 'command', match: { cmd: 'contains:cat' } }
            },
            {
                title: 'Attach the debugger',
                tip: 'Run: gdb /opt/chronos_scheduler/chronos_core. Use thread apply all bt to see all thread backtraces.',
                trigger: { event: 'command', match: { cmd: 'contains:gdb' } }
            },
            {
                title: 'Identify the race condition',
                tip: 'The update_task_status function in scheduler.cpp modifies a shared counter without a mutex. Line 142.',
                trigger: { event: 'flag_correct', match: { flagId: 'user' } }
            },
            {
                title: 'Apply fix and verify',
                tip: 'After identifying the fix (add mutex), run the verification to get the stable output token.',
                trigger: { event: 'flag_correct', match: { flagId: 'root' } }
            }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // CERT OBJECTIVES (Assessment Mode — AR-7)
    // ═══════════════════════════════════════════════════════

    certObjectives: {
        certPath: 'SY0-701',
        mappings: [
            { flagId: 'user', objective: '2.3', description: 'Given a scenario, apply mitigation techniques or controls to secure an environment — Code analysis', skill: 'Race Condition Identification' },
            { flagId: 'user', objective: '2.4', description: 'Given a scenario, analyze indicators associated with application attacks — Threading bugs', skill: 'Multi-threaded Application Debugging' },
            { flagId: 'root', objective: '4.1', description: 'Given a scenario, apply common security techniques to computing resources — Secure coding', skill: 'Concurrency Fix Verification' },
            { flagId: 'root', objective: '4.4', description: 'Given a scenario, implement and maintain security processes — Application security', skill: 'Runtime Behavior Analysis' }
        ]
    },

    // ═══════════════════════════════════════════════════════
    // BOOT SEQUENCE
    // ═══════════════════════════════════════════════════════

    boot: {
        biosLines: [
            'CHRONOS-SRV-01 BIOS v4.0.1',
            'Initializing hardware...',
            'Memory Test: 32768 MB OK',
            'Detecting drives... /dev/nvme0n1 (1TB NVMe SSD)',
            'CPU: AMD EPYC 7763 (8 cores)',
            'Boot device: /dev/nvme0n1p1',
            'Loading GRUB...'
        ],
        grubEntries: [
            'Ubuntu 22.04.3 LTS',
            'Ubuntu 22.04.3 LTS (recovery mode)',
            'Advanced options for Ubuntu'
        ],
        loginUser: 'scheduler_dev'
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
        user: 'scheduler_dev',
        hostname: 'CHRONOS-SRV-01',
        startDir: '/home/scheduler_dev',
        welcome: 'Ubuntu 22.04.3 LTS — CHRONOS-SRV-01 (Application Server)\nLast login: Wed Mar 13 04:18:22 2026\n\n*** ALERT: chronos_core exhibiting intermittent failures ***\n*** Defense routines firing at wrong times / deadlocking ***\n*** Unit tests pass — production behavior unpredictable ***\n\nType \'help\' for available commands.\n'
    },

    // ═══════════════════════════════════════════════════════
    // SIMULATED DATA
    // ═══════════════════════════════════════════════════════

    _db: {
        schedulerCpp: `/*
 * chronos_core — Defense Routine Scheduler
 * Crimson Dawn Confederacy — Critical Infrastructure
 *
 * This multi-threaded scheduler coordinates defense routines
 * across the Confederacy's network. Each routine is a "task"
 * that must execute at precise intervals.
 *
 * WARNING: Recent changes by recruit J. Voss (2026-03-01)
 * introduced "performance optimizations" that removed some
 * synchronization primitives "because they were slow."
 */

#include <iostream>
#include <thread>
#include <vector>
#include <mutex>
#include <atomic>
#include <chrono>
#include <string>
#include <map>
#include <condition_variable>

// ═══════════════════════════════════════════
// SHARED STATE (accessed by multiple threads)
// ═══════════════════════════════════════════

struct TaskStatus {
    std::string name;
    int execution_count;      // How many times this task has run
    bool is_running;          // Currently executing?
    int priority;             // 1-10 priority level
    long last_run_timestamp;  // Unix timestamp of last execution
};

// Global shared state
std::map<int, TaskStatus> g_task_registry;
int g_active_task_count = 0;           // SHARED COUNTER — NO MUTEX!
int g_completed_cycles = 0;            // SHARED COUNTER — NO MUTEX!
bool g_scheduler_running = true;

// Mutex for task_registry (correctly used)
std::mutex g_registry_mutex;

// Mutex that SHOULD protect g_active_task_count — DECLARED BUT NOT USED
std::mutex g_counter_mutex;  // J. Voss: "removed lock usage — too slow"

// ═══════════════════════════════════════════
// TASK SCHEDULER FUNCTIONS
// ═══════════════════════════════════════════

void initialize_tasks() {
    std::lock_guard<std::mutex> lock(g_registry_mutex);
    g_task_registry[1] = {"shield_rotation", 0, false, 8, 0};
    g_task_registry[2] = {"sensor_sweep", 0, false, 6, 0};
    g_task_registry[3] = {"comm_encrypt", 0, false, 9, 0};
    g_task_registry[4] = {"threat_analysis", 0, false, 7, 0};
    g_task_registry[5] = {"perimeter_check", 0, false, 5, 0};
    g_task_registry[6] = {"backup_sync", 0, false, 3, 0};
    g_task_registry[7] = {"log_rotate", 0, false, 2, 0};
    g_task_registry[8] = {"patch_verify", 0, false, 4, 0};
}

/*
 * BUG IS HERE — Line 142
 * update_task_status() modifies g_active_task_count
 * WITHOUT holding g_counter_mutex.
 *
 * J. Voss removed the lock_guard on 2026-03-01:
 *   "Mutex was causing 2ms latency per task update.
 *    Removing it. The counter is just an int, it's
 *    atomic enough on x86." — WRONG.
 *
 * Two threads can read the same value of
 * g_active_task_count, both increment, and one
 * increment is lost. This causes the scheduler
 * to think fewer tasks are running than actually are,
 * leading to:
 *   1. Over-scheduling (too many tasks start)
 *   2. Incorrect completion detection
 *   3. Occasional deadlock when all threads
 *      wait for a count that will never reach 0
 */
void update_task_status(int task_id, bool starting) {  // LINE 142
    // BUG: g_counter_mutex is NOT locked here!
    // Original code had: std::lock_guard<std::mutex> lock(g_counter_mutex);
    // J. Voss removed it on 2026-03-01 for "performance"

    if (starting) {
        g_active_task_count++;    // RACE CONDITION: non-atomic read-modify-write
    } else {
        g_active_task_count--;    // RACE CONDITION: non-atomic read-modify-write
        g_completed_cycles++;     // RACE CONDITION: also unprotected
    }

    // Update task registry (this part is correctly locked)
    std::lock_guard<std::mutex> lock(g_registry_mutex);
    if (g_task_registry.count(task_id)) {
        g_task_registry[task_id].is_running = starting;
        if (starting) {
            g_task_registry[task_id].execution_count++;
            g_task_registry[task_id].last_run_timestamp =
                std::chrono::system_clock::now().time_since_epoch().count();
        }
    }
}

void execute_task(int task_id) {
    update_task_status(task_id, true);

    // Simulate task execution (variable duration)
    std::this_thread::sleep_for(
        std::chrono::milliseconds(50 + (task_id * 10))
    );

    update_task_status(task_id, false);
}

void scheduler_loop(int thread_id) {
    while (g_scheduler_running) {
        for (auto& [id, task] : g_task_registry) {
            if (!task.is_running && task.priority >= 5) {
                execute_task(id);
            }
        }
        std::this_thread::sleep_for(std::chrono::milliseconds(100));
    }
}

/*
 * wait_for_completion() — checks if all tasks are done
 * by reading g_active_task_count.
 *
 * Due to the race condition in update_task_status(),
 * g_active_task_count can become negative or remain
 * positive indefinitely, causing:
 *   - Premature completion (negative count misread as 0)
 *   - Infinite wait / deadlock (count never reaches 0)
 */
void wait_for_completion() {
    while (g_active_task_count > 0) {
        std::this_thread::sleep_for(std::chrono::milliseconds(10));
    }
    // May exit too early or never exit due to race condition
}

int main(int argc, char* argv[]) {
    std::cout << "Chronos Scheduler v3.2.1 starting..." << std::endl;
    std::cout << "Initializing defense routines..." << std::endl;

    initialize_tasks();

    // Spawn 4 worker threads
    std::vector<std::thread> workers;
    for (int i = 0; i < 4; i++) {
        workers.emplace_back(scheduler_loop, i);
    }

    std::cout << "Scheduler running with 4 worker threads." << std::endl;
    std::cout << "Press Ctrl+C to stop." << std::endl;

    // Wait for threads
    for (auto& w : workers) {
        w.join();
    }

    return 0;
}`,
        mainH: `#ifndef CHRONOS_MAIN_H
#define CHRONOS_MAIN_H

#include <string>
#include <map>
#include <mutex>

struct TaskStatus {
    std::string name;
    int execution_count;
    bool is_running;
    int priority;
    long last_run_timestamp;
};

extern std::map<int, TaskStatus> g_task_registry;
extern int g_active_task_count;
extern int g_completed_cycles;
extern bool g_scheduler_running;
extern std::mutex g_registry_mutex;
extern std::mutex g_counter_mutex;

void initialize_tasks();
void update_task_status(int task_id, bool starting);
void execute_task(int task_id);
void scheduler_loop(int thread_id);
void wait_for_completion();

#endif`,
        makefile: `CXX = g++
CXXFLAGS = -std=c++17 -Wall -Wextra -pthread -g -O0
TARGET = chronos_core

all: $(TARGET)

$(TARGET): src/scheduler.cpp
\t$(CXX) $(CXXFLAGS) -o $(TARGET) src/scheduler.cpp

debug: src/scheduler.cpp
\t$(CXX) $(CXXFLAGS) -fsanitize=thread -o $(TARGET)_tsan src/scheduler.cpp

clean:
\trm -f $(TARGET) $(TARGET)_tsan`,
        gitLog: `commit d8e4f21 (HEAD -> main)
Author: J. Voss <jvoss@crimson-dawn.internal>
Date:   Sun Mar 1 14:30:00 2026

    perf: remove mutex from update_task_status for speed

    The counter_mutex was adding 2ms latency per task update.
    Integers are "atomic enough" on x86 architecture.
    This should improve scheduler throughput by 15%.

commit a3b7c89
Author: Senior Dev <seniordev@crimson-dawn.internal>
Date:   Fri Feb 28 10:00:00 2026

    fix: add proper mutex protection to task counter

    Added g_counter_mutex to protect g_active_task_count
    and g_completed_cycles from concurrent access.
    This fixes the intermittent scheduling errors.

commit 9f2e1d0
Author: Senior Dev <seniordev@crimson-dawn.internal>
Date:   Thu Feb 27 16:00:00 2026

    feat: implement multi-threaded task scheduler

    Initial implementation of chronos_core with 4 worker
    threads and priority-based task scheduling.`,
        applicationLogs: `[2026-03-14 04:18:22] Chronos Scheduler v3.2.1 starting...
[2026-03-14 04:18:22] Initializing defense routines...
[2026-03-14 04:18:22] Scheduler running with 4 worker threads.
[2026-03-14 04:18:23] [INFO] Task shield_rotation executed (count: 1)
[2026-03-14 04:18:23] [INFO] Task sensor_sweep executed (count: 1)
[2026-03-14 04:18:23] [WARN] Active task count mismatch: expected 2, got 1
[2026-03-14 04:18:24] [INFO] Task comm_encrypt executed (count: 1)
[2026-03-14 04:18:24] [ERROR] Task shield_rotation scheduled twice — already running!
[2026-03-14 04:18:25] [WARN] Active task count: -1 (should never be negative)
[2026-03-14 04:18:26] [ERROR] Scheduler cycle completed prematurely — 3 tasks still running
[2026-03-14 04:18:30] [CRITICAL] Deadlock detected: all 4 threads waiting on task completion
[2026-03-14 04:18:30] [CRITICAL] g_active_task_count = 2, but no tasks are actually running
[2026-03-14 04:18:30] [CRITICAL] Scheduler frozen — manual restart required
[2026-03-14 04:18:45] [INFO] Watchdog timer triggered restart
[2026-03-14 04:18:45] Chronos Scheduler v3.2.1 starting...
[2026-03-14 04:18:46] [INFO] Task threat_analysis executed (count: 1)
[2026-03-14 04:18:46] [WARN] Active task count mismatch: expected 1, got 3`,
        tsanOutput: `==================
WARNING: ThreadSanitizer: data race (pid=4521)
  Write of size 4 at 0x7f8b4c001040 by thread T2:
    #0 update_task_status(int, bool) /opt/chronos_scheduler/src/scheduler.cpp:142
    #1 execute_task(int) /opt/chronos_scheduler/src/scheduler.cpp:166
    #2 scheduler_loop(int) /opt/chronos_scheduler/src/scheduler.cpp:175

  Previous write of size 4 at 0x7f8b4c001040 by thread T1:
    #0 update_task_status(int, bool) /opt/chronos_scheduler/src/scheduler.cpp:142
    #1 execute_task(int) /opt/chronos_scheduler/src/scheduler.cpp:166
    #2 scheduler_loop(int) /opt/chronos_scheduler/src/scheduler.cpp:175

  Location is global 'g_active_task_count' of size 4 at 0x7f8b4c001040

  Thread T2 (tid=4523, running) created by main thread at:
    #0 pthread_create
    #1 std::thread::thread /usr/include/c++/11/bits/std_thread.h:127
    #2 main /opt/chronos_scheduler/src/scheduler.cpp:210

  Thread T1 (tid=4522, running) created by main thread at:
    #0 pthread_create
    #1 std::thread::thread /usr/include/c++/11/bits/std_thread.h:127
    #2 main /opt/chronos_scheduler/src/scheduler.cpp:210

SUMMARY: ThreadSanitizer: data race /opt/chronos_scheduler/src/scheduler.cpp:142 in update_task_status(int, bool)
==================
WARNING: ThreadSanitizer: data race (pid=4521)
  Write of size 4 at 0x7f8b4c001044 by thread T3:
    #0 update_task_status(int, bool) /opt/chronos_scheduler/src/scheduler.cpp:149
    ...

  Location is global 'g_completed_cycles' of size 4 at 0x7f8b4c001044
==================
ThreadSanitizer: reported 2 warnings`
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
        maxScore: 500,
        hintPenalty: true,
        wrongFlagPenalty: -25,
        speedBonus: { threshold: 900000, points: 100 },
        timeBonusThreshold: 1800
    },

    // ═══════════════════════════════════════════════════════
    // HINTS
    // ═══════════════════════════════════════════════════════

    hints: [
        {
            id: 'hint1',
            text: 'Start by checking the application logs: journalctl -xeu chronos_core. Notice the "active task count mismatch" warnings and the deadlock. The counter is going negative and getting stuck.',
            cost: 10,
            penalty: -10
        },
        {
            id: 'hint2',
            text: 'Read the source code at /opt/chronos_scheduler/src/scheduler.cpp. Look at the git log — a recent commit by J. Voss removed mutex protection from update_task_status(). The comment says "atomic enough on x86" but that is wrong for non-atomic int.',
            cost: 25,
            penalty: -25
        },
        {
            id: 'hint3',
            text: 'The race condition is in update_task_status() at line 142. g_active_task_count is modified by g_active_task_count++ and g_active_task_count-- without g_counter_mutex being locked. Two threads can read the same value, both increment, and one increment is lost.',
            cost: 50,
            penalty: -50
        },
        {
            id: 'hint4',
            text: 'The user flag is: scheduler.cpp:L142:update_task_status — the exact location of the race condition. The fix is to add std::lock_guard<std::mutex> lock(g_counter_mutex) back into update_task_status(). Run the verification script after applying the fix to get the root flag.',
            cost: 75,
            penalty: -75
        }
    ],

    // ═══════════════════════════════════════════════════════
    // LORE
    // ═══════════════════════════════════════════════════════

    lore: {
        intro: 'The Chronos Scheduler, a critical multi-threaded application responsible for synchronizing defense routines across the Confederacy\'s network, is exhibiting bizarre intermittent behavior. Routines fire at wrong times, some are skipped, and the application occasionally deadlocks. Unit tests pass consistently, yet production fails unpredictably. A recent recruit\'s "performance optimization" is suspected.',
        scenario: 'Recruit J. Voss, eager to prove themselves, removed mutex protection from the update_task_status() function, believing that integer operations are "atomic enough on x86." This introduced a classic race condition: multiple threads read-modify-write the g_active_task_count variable without synchronization, causing lost updates, negative counts, and deadlocks. The senior developer who originally added the mutex is on leave.',
        outro: 'The Glitching Chronos ticks true once more. With the mutex restored in update_task_status(), g_active_task_count is properly synchronized across all four worker threads. Defense routines execute on schedule, counts are accurate, and deadlocks are eliminated. J. Voss has learned an important lesson about premature optimization.',
        ecer: {
            executive: 'No code review requirement for production changes; new recruit given commit access immediately',
            culture: 'Performance optimization prioritized over correctness; no threading expertise on review team',
            employee: 'Recruit removed synchronization primitive without understanding concurrent memory access model',
            regulatory: 'No automated concurrency testing (ThreadSanitizer, Helgrind) in CI/CD pipeline'
        }
    },

    // ═══════════════════════════════════════════════════════
    // WEB APP — Chronos Status Dashboard
    // ═══════════════════════════════════════════════════════

    webApp: {
        startUrl: 'http://10.10.14.5:9090/chronos/',

        pages: {
            '/chronos/': {
                title: 'Chronos Scheduler — Status Dashboard',
                html: `
                    <div style="text-align:center; margin-bottom:30px; padding-bottom:20px; border-bottom:1px solid #ddd;">
                        <h1 style="color:#ef4444; font-size:1.6rem; font-family:Georgia,serif; margin-bottom:4px;">Chronos Scheduler — Status Dashboard</h1>
                        <div style="color:#888; font-size:0.8rem;">CHRONOS-SRV-01 &mdash; Defense Routine Synchronization</div>
                    </div>

                    <div style="max-width:700px; margin:0 auto;">
                        <div style="background:#fef2f2; border:1px solid #fca5a5; border-radius:6px; padding:16px; margin-bottom:20px;">
                            <div style="color:#dc2626; font-weight:700; margin-bottom:8px;">CRITICAL SYSTEM ALERTS</div>
                            <div style="font-size:0.8rem; color:#7f1d1d; line-height:1.6;">
                                <div>CRITICAL: Deadlock detected — all 4 worker threads frozen</div>
                                <div>ERROR: Active task count mismatch (expected: 0, actual: 2)</div>
                                <div>ERROR: Task shield_rotation double-scheduled</div>
                                <div>WARNING: g_active_task_count went negative (-1)</div>
                                <div>INFO: Watchdog restart count: 14 (last 24h)</div>
                            </div>
                        </div>

                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:12px; margin-bottom:20px;">
                            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:14px; text-align:center;">
                                <div style="color:#64748b; font-size:0.7rem; text-transform:uppercase;">Threads</div>
                                <div style="font-size:1.2rem; font-weight:700; color:#dc2626;">4/4 STUCK</div>
                            </div>
                            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:14px; text-align:center;">
                                <div style="color:#64748b; font-size:0.7rem; text-transform:uppercase;">Task Count</div>
                                <div style="font-size:1.2rem; font-weight:700; color:#f59e0b;">2 (ghost)</div>
                            </div>
                            <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:14px; text-align:center;">
                                <div style="color:#64748b; font-size:0.7rem; text-transform:uppercase;">Restarts</div>
                                <div style="font-size:1.2rem; font-weight:700; color:#dc2626;">14</div>
                            </div>
                        </div>

                        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:14px;">
                            <div style="color:#64748b; font-size:0.7rem; text-transform:uppercase; margin-bottom:8px;">Recent Task Execution Log</div>
                            <div style="font-family:monospace; font-size:0.7rem; color:#334155; line-height:1.8;">
                                <div style="color:#dc2626;">[04:18:30] CRITICAL: Deadlock — all threads waiting</div>
                                <div style="color:#dc2626;">[04:18:26] ERROR: Premature cycle completion</div>
                                <div style="color:#f59e0b;">[04:18:25] WARN: task_count = -1</div>
                                <div style="color:#dc2626;">[04:18:24] ERROR: shield_rotation double-scheduled</div>
                                <div style="color:#f59e0b;">[04:18:23] WARN: count mismatch: 2 vs 1</div>
                            </div>
                        </div>
                    </div>
                `,
                formHandler: null
            }
        }
    },

    // ═══════════════════════════════════════════════════════
    // FILESYSTEM (target machine)
    // ═══════════════════════════════════════════════════════

    filesystem: {
        '/': {
            type: 'dir',
            children: {
                'home': {
                    type: 'dir',
                    children: {
                        'scheduler_dev': {
                            type: 'dir',
                            children: {
                                'notes.txt': {
                                    type: 'file',
                                    content: '=== MISSION BRIEFING ===\nTarget: CHRONOS-SRV-01 (localhost)\nApplication: chronos_core — Defense Routine Scheduler\nObjective: Find and fix the race condition causing intermittent failures\n\nReported symptoms:\n1. Tasks firing at wrong times\n2. Tasks being skipped\n3. Intermittent deadlocks freezing all threads\n4. Unit tests pass but production fails\n5. Recent code change by recruit J. Voss suspected\n\nSource code: /opt/chronos_scheduler/src/\nBinary: /opt/chronos_scheduler/chronos_core\n\nTools available: gdb, strace, valgrind, g++\n\nGood luck, operator.'
                                },
                                '.bash_history': {
                                    type: 'file',
                                    content: 'ssh scheduler_dev@CHRONOS-SRV-01\nps aux | grep chronos\njournalctl -xeu chronos_core\ncd /opt/chronos_scheduler/src\ncat scheduler.cpp\ngit log --oneline\ngdb ../chronos_core'
                                }
                            }
                        }
                    }
                },
                'opt': {
                    type: 'dir',
                    children: {
                        'chronos_scheduler': {
                            type: 'dir',
                            children: {
                                'chronos_core': {
                                    type: 'file',
                                    content: '[BINARY: ELF 64-bit LSB pie executable, x86-64, compiled with -g debug symbols]'
                                },
                                'chronos_core_tsan': {
                                    type: 'file',
                                    content: '[BINARY: ELF 64-bit LSB pie executable, x86-64, compiled with -fsanitize=thread]'
                                },
                                'Makefile': {
                                    type: 'file',
                                    content: null  // From _db
                                },
                                'src': {
                                    type: 'dir',
                                    children: {
                                        'scheduler.cpp': {
                                            type: 'file',
                                            content: null  // From _db
                                        },
                                        'scheduler.h': {
                                            type: 'file',
                                            content: null  // From _db.mainH
                                        }
                                    }
                                },
                                '.git': {
                                    type: 'dir',
                                    children: {
                                        'HEAD': {
                                            type: 'file',
                                            content: 'ref: refs/heads/main'
                                        }
                                    }
                                },
                                'tests': {
                                    type: 'dir',
                                    children: {
                                        'test_scheduler.cpp': {
                                            type: 'file',
                                            content: '// Unit tests for chronos_core\n// NOTE: These tests run single-threaded and will NOT catch race conditions!\n\n#include <cassert>\n#include "../src/scheduler.h"\n\nvoid test_initialize_tasks() {\n    initialize_tasks();\n    assert(g_task_registry.size() == 8);\n    assert(g_task_registry[1].name == "shield_rotation");\n}\n\nvoid test_update_task_status() {\n    // Single-threaded test — ALWAYS passes\n    g_active_task_count = 0;\n    update_task_status(1, true);  // start\n    assert(g_active_task_count == 1);\n    update_task_status(1, false); // stop\n    assert(g_active_task_count == 0);\n    // This test cannot detect the race condition!\n}\n\nint main() {\n    test_initialize_tasks();\n    test_update_task_status();\n    std::cout << "All tests passed!" << std::endl;\n    return 0;\n}\n'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'etc': {
                    type: 'dir',
                    children: {
                        'hostname': {
                            type: 'file',
                            content: 'CHRONOS-SRV-01'
                        },
                        'passwd': {
                            type: 'file',
                            content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\nscheduler_dev:x:1000:1000:Scheduler Dev,,,:/home/scheduler_dev:/bin/bash'
                        },
                        'systemd': {
                            type: 'dir',
                            children: {
                                'system': {
                                    type: 'dir',
                                    children: {
                                        'chronos_core.service': {
                                            type: 'file',
                                            content: '[Unit]\nDescription=Chronos Defense Routine Scheduler\nAfter=network.target\n\n[Service]\nType=simple\nUser=scheduler_dev\nExecStart=/opt/chronos_scheduler/chronos_core\nRestart=on-failure\nRestartSec=15\nWatchdogSec=60\n\n[Install]\nWantedBy=multi-user.target'
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                'var': {
                    type: 'dir',
                    children: {
                        'log': {
                            type: 'dir',
                            children: {
                                'chronos': {
                                    type: 'dir',
                                    children: {
                                        'chronos_core.log': {
                                            type: 'file',
                                            content: null  // From _db.applicationLogs
                                        }
                                    }
                                },
                                'syslog': {
                                    type: 'file',
                                    content: 'Mar 14 04:18:22 CHRONOS-SRV-01 systemd[1]: Started Chronos Defense Routine Scheduler.\nMar 14 04:18:30 CHRONOS-SRV-01 chronos_core[4521]: CRITICAL: Deadlock detected\nMar 14 04:18:45 CHRONOS-SRV-01 systemd[1]: chronos_core.service: Watchdog timeout!\nMar 14 04:18:45 CHRONOS-SRV-01 systemd[1]: chronos_core.service: Restart scheduled (14th restart in 24h)\nMar 14 04:19:00 CHRONOS-SRV-01 systemd[1]: Started Chronos Defense Routine Scheduler.'
                                }
                            }
                        }
                    }
                },
                'tmp': {
                    type: 'dir',
                    children: {
                        'race_condition_notes.txt': {
                            type: 'file',
                            content: 'Senior Dev notes (left before investigation started):\n\nI added g_counter_mutex specifically to protect\ng_active_task_count in commit a3b7c89 on Feb 28.\nIt was causing race conditions before that fix.\n\nIf someone removed it, the symptoms would be:\n- Task count going negative\n- Double-scheduling\n- Deadlocks in wait_for_completion()\n- Unit tests still passing (single-threaded!)\n\nThe fix is simple: add the lock_guard back.\nstd::lock_guard<std::mutex> lock(g_counter_mutex);\nat the top of update_task_status().\n\nDO NOT remove synchronization for "performance"\nwithout understanding the memory model.\n\n— Senior Dev'
                        },
                        'tsan_output.txt': {
                            type: 'file',
                            content: null  // From _db.tsanOutput
                        }
                    }
                },
                'usr': {
                    type: 'dir',
                    children: {
                        'share': {
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
        'help': function(args) {
            return `Available commands:
  System:     ls, cd, pwd, cat, grep, ps, top, htop, df, free, whoami, id, uname, clear, history
  Network:    ping, netstat, ss, ip
  Debug:      gdb, strace, ltrace, valgrind
  Build:      g++, gcc, make, git
  Files:      find, head, tail, less, wc, file, strings
  Services:   systemctl, journalctl
  Other:      sudo, man, echo, export

Type 'man <command>' for usage details.`;
        },

        'gdb': function(args, term, engine) {
            const argStr = args.join(' ');

            if (argStr.includes('chronos_core') || argStr.includes('-p')) {
                return `GNU gdb (Ubuntu 12.1-0ubuntu1~22.04) 12.1
Reading symbols from /opt/chronos_scheduler/chronos_core...
(gdb) Attached to process 4521

Loaded symbols for chronos_core.
4 threads detected:

Thread 1 (Thread 0x7f8b4c000700 — scheduler_loop):
  #0  update_task_status (task_id=3, starting=true) at scheduler.cpp:142
  #1  execute_task (task_id=3) at scheduler.cpp:166
  #2  scheduler_loop (thread_id=0) at scheduler.cpp:175

Thread 2 (Thread 0x7f8b4b800700 — scheduler_loop):
  #0  update_task_status (task_id=1, starting=false) at scheduler.cpp:142
  #1  execute_task (task_id=1) at scheduler.cpp:167
  #2  scheduler_loop (thread_id=1) at scheduler.cpp:175

Thread 3 (Thread 0x7f8b4b000700 — scheduler_loop):
  #0  update_task_status (task_id=3, starting=true) at scheduler.cpp:142
  #1  execute_task (task_id=3) at scheduler.cpp:166
  #2  scheduler_loop (thread_id=2) at scheduler.cpp:175

Thread 4 (Thread 0x7f8b4a800700 — scheduler_loop):
  #0  __GI___nanosleep at ../sysdeps/unix/sysv/linux/nanosleep.c:28
  #1  std::this_thread::sleep_for at thread:284
  #2  scheduler_loop (thread_id=3) at scheduler.cpp:178

CRITICAL OBSERVATION:
  Threads 1 and 3 are BOTH in update_task_status() for task 3
  simultaneously — one starting, one also starting.
  This is the race condition: both threads read g_active_task_count
  at the same value, both increment, and one increment is LOST.

Variable state:
  g_active_task_count = 2 (should be 3 — one increment lost)
  g_completed_cycles = 47 (should be 52 — 5 increments lost)
  g_counter_mutex: NOT LOCKED by any thread

Race condition confirmed at scheduler.cpp:142 in update_task_status()
BUG: g_counter_mutex exists but is never locked in this function.

Flag: {{FLAG:user}}

(gdb) quit`;
            }

            return 'Usage: gdb <executable> or gdb -p <pid>\n  gdb /opt/chronos_scheduler/chronos_core';
        },

        'strace': function(args) {
            const argStr = args.join(' ');
            if (argStr.includes('chronos') || argStr.includes('4521')) {
                return `strace: Process 4521 attached with 5 threads
[pid  4521] futex(0x7f8b4c001040, FUTEX_WAIT, 2, NULL) = ? ERESTARTSYS
[pid  4522] write(1, "Task shield_rotation executed", 29) = 29
[pid  4522] futex(0x7f8b4c001060, FUTEX_WAKE, 1) = 1
[pid  4523] write(1, "WARN: Active task count mismatch", 32) = 32
[pid  4523] --- CONCURRENT WRITE to 0x7f8b4c001040 (g_active_task_count) ---
[pid  4524] write(1, "Task comm_encrypt executed", 26) = 26
[pid  4524] --- CONCURRENT WRITE to 0x7f8b4c001040 (g_active_task_count) ---
[pid  4525] nanosleep({tv_sec=0, tv_nsec=100000000}, NULL) = 0
...
Multiple concurrent writes to g_active_task_count detected.
No futex/mutex protecting this address.`;
            }
            return 'Usage: strace -p <pid> or strace <command>';
        },

        'valgrind': function(args) {
            const argStr = args.join(' ');
            if (argStr.includes('helgrind') && argStr.includes('chronos')) {
                return `==4521== Helgrind, a thread error detector
==4521== Using Valgrind-3.18.1
==4521==
==4521== Possible data race during write of size 4 at 0x7f8b4c001040 by thread #2
==4521==    at 0x40142A: update_task_status(int, bool) (scheduler.cpp:142)
==4521==    by 0x4015B3: execute_task(int) (scheduler.cpp:166)
==4521==    by 0x401688: scheduler_loop(int) (scheduler.cpp:175)
==4521==
==4521== This conflicts with a previous write of size 4 by thread #3
==4521==    at 0x40142A: update_task_status(int, bool) (scheduler.cpp:142)
==4521==
==4521== Address 0x7f8b4c001040 is the global variable "g_active_task_count"
==4521== declared at scheduler.cpp:38
==4521==
==4521== ERROR SUMMARY: 2 errors from 2 contexts (data race at scheduler.cpp:142)`;
            }
            if (argStr.includes('chronos')) {
                return '==4521== Use --tool=helgrind for thread error detection.\n==4521== Use --tool=memcheck for memory error detection.';
            }
            return 'Usage: valgrind [--tool=helgrind|memcheck] <executable>';
        },

        'make': function(args) {
            if (args.includes('debug') || args.includes('tsan')) {
                return `g++ -std=c++17 -Wall -Wextra -pthread -g -O0 -fsanitize=thread -o chronos_core_tsan src/scheduler.cpp
Compiled with ThreadSanitizer. Run: ./chronos_core_tsan`;
            }
            if (args.includes('clean')) {
                return 'rm -f chronos_core chronos_core_tsan';
            }
            return `g++ -std=c++17 -Wall -Wextra -pthread -g -O0 -o chronos_core src/scheduler.cpp
Compiled successfully with debug symbols.`;
        },

        'g++': function(args) {
            return 'g++ (Ubuntu 11.4.0-1ubuntu1~22.04) 11.4.0';
        },

        'gcc': function(args) {
            return 'gcc (Ubuntu 11.4.0-1ubuntu1~22.04) 11.4.0';
        },

        'git': function(args) {
            const sub = args[0] || '';
            if (sub === 'log') {
                return B10Config._db.gitLog;
            }
            if (sub === 'diff') {
                if (args.includes('a3b7c89..d8e4f21') || args.includes('HEAD~1')) {
                    return `diff --git a/src/scheduler.cpp b/src/scheduler.cpp
--- a/src/scheduler.cpp
+++ b/src/scheduler.cpp
@@ -140,7 +140,6 @@
 void update_task_status(int task_id, bool starting) {
-    std::lock_guard<std::mutex> lock(g_counter_mutex);
     // BUG: g_counter_mutex is NOT locked here!
     // J. Voss removed it on 2026-03-01 for "performance"

The diff shows J. Voss removed the lock_guard line.`;
                }
                return '';
            }
            if (sub === 'blame' && args.includes('scheduler.cpp')) {
                return `a3b7c89 (Senior Dev  2026-02-28) void update_task_status(int task_id, bool starting) {
d8e4f21 (J. Voss     2026-03-01)     // BUG: g_counter_mutex is NOT locked here!
d8e4f21 (J. Voss     2026-03-01)     // J. Voss removed it on 2026-03-01 for "performance"
a3b7c89 (Senior Dev  2026-02-28)
a3b7c89 (Senior Dev  2026-02-28)     if (starting) {
a3b7c89 (Senior Dev  2026-02-28)         g_active_task_count++;
a3b7c89 (Senior Dev  2026-02-28)     } else {`;
            }
            if (sub === 'status') return 'On branch main\nnothing to commit, working tree clean';
            return 'Usage: git [log|diff|blame|status]';
        },

        'strings': function(args) {
            if (args[0] && args[0].includes('chronos_core')) {
                return 'Chronos Scheduler v3.2.1\nInitializing defense routines...\nScheduler running with 4 worker threads.\nCRITICAL: Deadlock detected\nWARN: Active task count mismatch\nshield_rotation\nsensor_sweep\ncomm_encrypt\nthreat_analysis\nperimeter_check\ng_active_task_count\ng_counter_mutex\nupdate_task_status';
            }
            return 'Usage: strings <file>';
        },

        'htop': function(args) {
            return `  CPU[||||||||||||           32.4%]   Tasks: 48, 192 thr; 5 running
  Mem[|||||||||||       14.2G/32.0G]   Load average: 2.84 2.12 1.88
  Swp[                   0.0K/8.0G]   Uptime: 10:22:18

    PID USER           PRI  NI  VIRT   RES   SHR S CPU%  MEM%   TIME+  Command
   4521 scheduler_dev   20   0  42.8M  18M  4200 R 28.4   0.1  142:18 /opt/chronos_scheduler/chronos_core
   4522 scheduler_dev   20   0  42.8M  18M  4200 R  7.1   0.1  142:18 (chronos_core worker-0)
   4523 scheduler_dev   20   0  42.8M  18M  4200 R  7.1   0.1  142:18 (chronos_core worker-1)
   4524 scheduler_dev   20   0  42.8M  18M  4200 D  7.1   0.1  142:18 (chronos_core worker-2)
   4525 scheduler_dev   20   0  42.8M  18M  4200 D  7.1   0.1  142:18 (chronos_core worker-3)`;
        },

        'top': function(args) {
            return `top - 04:40:40 up 10:22,  1 user,  load average: 2.84, 2.12, 1.88
Tasks:  48 total,   5 running,  43 sleeping
%Cpu(s): 32.4 us,  2.1 sy,  0.0 ni, 65.0 id,  0.3 wa

    PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM COMMAND
   4521 schedule  20   0   42.8m  18.0m   4.2m R  28.4   0.1 chronos_core
   4522 schedule  20   0   42.8m  18.0m   4.2m R   7.1   0.1 chronos_core
   4523 schedule  20   0   42.8m  18.0m   4.2m R   7.1   0.1 chronos_core`;
        },

        'ps': function(args) {
            if (args.includes('aux') || args.includes('-ef')) {
                return `USER           PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root             1  0.0  0.0 168000 12000 ?        Ss   Mar13   0:42 /lib/systemd/systemd
scheduler_d   4521 28.4  0.1  43828 18000 ?        Rl   04:18 142:18 /opt/chronos_scheduler/chronos_core
scheduler_d   4522  7.1  0.1  43828 18000 ?        Rl   04:18  35:32 /opt/chronos_scheduler/chronos_core (worker-0)
scheduler_d   4523  7.1  0.1  43828 18000 ?        Rl   04:18  35:31 /opt/chronos_scheduler/chronos_core (worker-1)
scheduler_d   4524  7.1  0.1  43828 18000 ?        Dl   04:18  35:30 /opt/chronos_scheduler/chronos_core (worker-2)
scheduler_d   4525  7.1  0.1  43828 18000 ?        Dl   04:18  35:29 /opt/chronos_scheduler/chronos_core (worker-3)
root          3001  0.0  0.0  15280  2004 ?        Ss   04:18   0:00 /usr/sbin/sshd
scheduler_d   5001  0.0  0.0  22528  4800 pts/0    Ss   04:38   0:00 -bash`;
            }
            return 'Usage: ps [aux|-ef]';
        },

        'journalctl': function(args) {
            const argStr = args.join(' ');
            if (argStr.includes('chronos')) {
                return B10Config._db.applicationLogs;
            }
            return 'No journal entries matching criteria.';
        },

        'systemctl': function(args) {
            if (args.includes('chronos')) {
                return `chronos_core.service - Chronos Defense Routine Scheduler
     Loaded: loaded (/etc/systemd/system/chronos_core.service; enabled)
     Active: active (running) since Thu 2026-03-14 04:18:22 UTC; 22min ago
   Main PID: 4521 (chronos_core)
     Status: "Running with 4 worker threads"
      Tasks: 5 (limit: 4915)
     Memory: 18.0M
        CPU: 3h 34min 12.891s
     CGroup: /system.slice/chronos_core.service
             \u2514 4521 /opt/chronos_scheduler/chronos_core

Mar 14 04:18:30 CHRONOS-SRV-01 chronos_core[4521]: CRITICAL: Deadlock detected
Mar 14 04:18:45 CHRONOS-SRV-01 systemd[1]: chronos_core.service: Watchdog timeout!
Warning: Service has been restarted 14 times in the last 24 hours.`;
            }
            return 'Unit not found.';
        },

        'dmesg': function(args) {
            return `[48291.234] chronos_core[4521]: segfault at 0 ip 000000000040142a sp 00007f8b4c000700 error 6 in chronos_core
[48292.567] chronos_core[4521]: potential deadlock detected — 4 threads in futex wait
[48293.890] watchdog: chronos_core.service — no heartbeat for 60s, restarting`;
        },

        'ltrace': function(args) {
            if (args.join(' ').includes('chronos')) {
                return `pthread_create(0x7f8b4c000700, NULL, scheduler_loop, 0) = 0
pthread_create(0x7f8b4b800700, NULL, scheduler_loop, 1) = 0
pthread_create(0x7f8b4b000700, NULL, scheduler_loop, 2) = 0
pthread_create(0x7f8b4a800700, NULL, scheduler_loop, 3) = 0
Note: No pthread_mutex_lock calls observed for g_counter_mutex.
      Expected: mutex lock before g_active_task_count modification.`;
            }
            return 'Usage: ltrace <executable>';
        },

        'ping': function(args) {
            const target = args.find(a => !a.startsWith('-')) || '';
            if (!target) return 'Usage: ping [-c count] destination';
            if (target === 'localhost' || target === '127.0.0.1') {
                return `PING ${target} 56(84) bytes of data.\n64 bytes from 127.0.0.1: icmp_seq=1 ttl=64 time=0.012 ms\n1 packets transmitted, 1 received, 0% packet loss`;
            }
            return `ping: ${target}: Name or service not known`;
        },

        'netstat': function(args) {
            return `Active Internet connections (servers and established)
Proto Recv-Q Send-Q Local Address           Foreign Address         State
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:9090            0.0.0.0:*               LISTEN`;
        },

        'ss': function(args) {
            return `Netid  State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port
tcp    LISTEN  0       128     0.0.0.0:22            0.0.0.0:*
tcp    LISTEN  0       128     0.0.0.0:9090          0.0.0.0:*`;
        },

        'ip': function(args) {
            if (args[0] === 'a' || args[0] === 'addr') {
                return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536\n    inet 127.0.0.1/8 scope host lo\n2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500\n    inet 10.10.14.5/24 brd 10.10.14.255 scope global eth0`;
            }
            return 'Usage: ip [addr|route|link]';
        },

        'df': function(args) {
            return `Filesystem      Size  Used Avail Use% Mounted on
/dev/nvme0n1p1  1000G   84G  916G   9% /
tmpfs            16G  412K   16G   1% /tmp`;
        },

        'free': function(args) {
            return `               total        used        free      shared  buff/cache   available
Mem:            32Gi       14Gi       17Gi       128Mi       1.0Gi       17Gi
Swap:          8.0Gi          0B       8.0Gi`;
        },

        'curl': function(args) {
            const url = args.find(a => !a.startsWith('-')) || '';
            if (!url) return 'curl: try \'curl --help\' for more information';
            if (url.includes('localhost:9090') || url.includes('10.10.14.5:9090')) {
                if (url.includes('/verify') || url.includes('/fixed')) {
                    return `Chronos Scheduler — Verification Complete

Race Condition: FIXED
Thread Synchronization: VERIFIED
Active Task Count: ACCURATE
Deadlocks: NONE DETECTED (24h monitoring)
Completed Cycles: 10,000 (no lost increments)

All 8 defense routines executing on schedule.
Verification Token: {{FLAG:root}}

Signed: CHRONOS-SRV-01
Timestamp: 2026-03-14T04:40:40Z`;
                }
                return '{"status":"degraded","threads":4,"active_tasks":2,"completed_cycles":47,"errors":"deadlock detected","restarts":14}';
            }
            return `curl: (7) Failed to connect: Connection refused`;
        },

        'whoami': function() { return 'scheduler_dev'; },
        'id': function() { return 'uid=1000(scheduler_dev) gid=1000(scheduler_dev) groups=1000(scheduler_dev),27(sudo)'; },
        'hostname': function() { return 'CHRONOS-SRV-01'; },
        'uname': function(args) {
            if (args.includes('-a')) return 'Linux CHRONOS-SRV-01 5.15.0-91-generic #101-Ubuntu SMP x86_64 GNU/Linux';
            return 'Linux';
        },
        'uptime': function() { return ' 04:40:40 up 10:22,  1 user,  load average: 2.84, 2.12, 1.88'; },
        'history': function() {
            return `    1  ps aux | grep chronos\n    2  journalctl -xeu chronos_core\n    3  cd /opt/chronos_scheduler\n    4  cat src/scheduler.cpp\n    5  git log --oneline\n    6  gdb chronos_core`;
        },
        'man': function(args) {
            if (!args[0]) return 'What manual page do you want?';
            if (args[0] === 'gdb') return 'GDB(1) — The GNU Debugger\n\nUsage: gdb [options] <executable>\n       gdb -p <pid>\n\nCommands: run, break, step, next, continue, print,\n          thread apply all bt, info threads, quit';
            return `${args[0].toUpperCase()}(1) — Use '${args[0]} --help' for quick usage.`;
        },
        'find': function(args) {
            const argStr = args.join(' ');
            if (argStr.includes('chronos') || argStr.includes('scheduler')) {
                return '/opt/chronos_scheduler/chronos_core\n/opt/chronos_scheduler/src/scheduler.cpp\n/opt/chronos_scheduler/src/scheduler.h\n/opt/chronos_scheduler/Makefile\n/opt/chronos_scheduler/tests/test_scheduler.cpp\n/var/log/chronos/chronos_core.log';
            }
            return 'find: specify search path and criteria';
        },
        'head': function(args) { return 'Use cat to view file contents.'; },
        'tail': function(args) { return 'Use cat to view file contents.'; },
        'less': function(args) { return 'Use cat to view file contents.'; },
        'wc': function(args) { return '  212 /opt/chronos_scheduler/src/scheduler.cpp'; },
        'file': function(args) {
            if (args[0] && args[0].includes('chronos_core')) return args[0] + ': ELF 64-bit LSB pie executable, x86-64, version 1 (SYSV), dynamically linked, with debug_info, not stripped';
            return (args[0] || 'file') + ': ASCII text';
        },
        'echo': function(args) { return args.join(' '); },
        'export': function(args) { return ''; },
        'nmap': function(args) {
            return `Starting Nmap 7.94\nNmap scan report for 10.10.14.5\nHost is up.\n\nPORT     STATE SERVICE\n22/tcp   open  ssh\n9090/tcp open  zeus-admin\n\nNmap done: 1 IP address (1 host up)`;
        },
        'sudo': function(args, term, engine) {
            const cmd = args[0];
            if (cmd && B10Config.commands[cmd]) {
                return B10Config.commands[cmd](args.slice(1), term, engine);
            }
            return `sudo: ${cmd || 'command'}: command not found`;
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
