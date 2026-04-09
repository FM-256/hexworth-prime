/**
 * Python Hub — Course Content Map for Tenant Instructor Dashboard
 *
 * Static map of all tracks, modules, labs, quizzes, and tools.
 * Used by the instructor dashboard for:
 *   - Course Progress overlay (per-item completion rates)
 *   - Class Report (chapter heatmap, quiz performance)
 *   - Student Detail (per-chapter breakdown)
 *   - Chapter Health donut (Strong Grasp / Review Recommended / Refresher Alert)
 *
 * Structure mirrors network-plus-map.js:
 *   chapters[] — each "chapter" is a track or section
 *   items[]    — each item has id (matches ModuleProgress key), type, and title
 *
 * Module IDs use 'pyh-' prefix and register under house 'code'.
 * Example: ModuleProgress.complete('code', 'pyh-stdlib-01', { returnUrl: '../index.html' })
 *
 * Cross-house tracking: Zero to Python (Chapter 0) lives in the Script house
 * and registers completions under houseId 'script'. The instructor dashboard
 * must check both 'code' and 'script' module completions for full coverage.
 *
 * Python Engineering modules register under houseId 'code' with 'pye-' prefix.
 *
 * Created: 2026-04-02
 */
var PYTHON_HUB_MAP = {
    courseId: "python-hub",
    title: "Python Programming Hub",
    houseId: "code",
    totalChapters: 8,
    chapters: [
        {
            /* Chapter 0: Zero to Python prerequisite — lives in Script house.
               Module IDs use 'script' houseId. Cross-house tracking: these completions
               are registered under 'script' but displayed in the Python Hub tenant view. */
            num: 0,
            title: "Zero to Python (Prerequisite)",
            items: [
                { id: "script-python-immersive-chapter1", type: "module", title: "Ch1 — The First Bit" },
                { id: "script-python-immersive-chapter2", type: "module", title: "Ch2 — Strings" },
                { id: "script-python-immersive-chapter3", type: "module", title: "Ch3 — Flow Control" },
                { id: "script-python-immersive-chapter4", type: "module", title: "Ch4 — Functions" },
                { id: "script-python-immersive-chapter5", type: "module", title: "Ch5 — Collections" },
                { id: "script-python-immersive-chapter6", type: "module", title: "Ch6 — Dictionaries" },
                { id: "script-python-immersive-chapter7", type: "module", title: "Ch7 — Files" },
                { id: "script-python-immersive-chapter8", type: "module", title: "Ch8 — OOP" },
                { id: "script-python-certificate", type: "module", title: "Certificate of Completion" }
            ]
        },
        {
            num: 1,
            title: "Standard Library",
            items: [
                { id: "pyh-stdlib-01", type: "module", title: "Standard Library 01 — Core Built-ins" },
                { id: "pyh-stdlib-02", type: "module", title: "Standard Library 02 — String Processing" },
                { id: "pyh-stdlib-03", type: "module", title: "Standard Library 03 — File Operations" },
                { id: "pyh-stdlib-04", type: "module", title: "Standard Library 04 — Data Structures" },
                { id: "pyh-stdlib-05", type: "module", title: "Standard Library 05 — Functional Tools" },
                { id: "pyh-stdlib-06", type: "module", title: "Standard Library 06 — OS & System" },
                { id: "pyh-stdlib-07", type: "module", title: "Standard Library 07 — Networking" },
                { id: "pyh-stdlib-08", type: "module", title: "Standard Library 08 — Advanced Topics" },
                { id: "pyh-lab-stdlib-01", type: "lab", title: "Lab: Standard Library 01" },
                { id: "pyh-lab-stdlib-02", type: "lab", title: "Lab: Standard Library 02" },
                { id: "pyh-lab-stdlib-03", type: "lab", title: "Lab: Standard Library 03" },
                { id: "pyh-lab-stdlib-04", type: "lab", title: "Lab: Standard Library 04" },
                { id: "pyh-lab-stdlib-05", type: "lab", title: "Lab: Standard Library 05" },
                { id: "pyh-lab-stdlib-06", type: "lab", title: "Lab: Standard Library 06" },
                { id: "pyh-lab-stdlib-07", type: "lab", title: "Lab: Standard Library 07" },
                { id: "pyh-lab-stdlib-08", type: "lab", title: "Lab: Standard Library 08" },
                { id: "pyh-quiz-stdlib-foundations", type: "quiz", title: "Quiz: Stdlib Foundations" },
                { id: "pyh-quiz-stdlib-systems", type: "quiz", title: "Quiz: Stdlib Systems" },
                { id: "pyh-quiz-stdlib-final", type: "quiz", title: "Quiz: Stdlib Final" },
                { id: "pyh-tool-stdlib-reference", type: "tool", title: "Stdlib Quick Reference" }
            ]
        },
        {
            num: 2,
            title: "Graphics & Games",
            items: [
                { id: "pyh-graphics-01", type: "module", title: "Graphics 01 — Getting Started" },
                { id: "pyh-graphics-02", type: "module", title: "Graphics 02 — Drawing & Shapes" },
                { id: "pyh-graphics-03", type: "module", title: "Graphics 03 — Animation Basics" },
                { id: "pyh-graphics-04", type: "module", title: "Graphics 04 — User Input" },
                { id: "pyh-graphics-05", type: "module", title: "Graphics 05 — Collision Detection" },
                { id: "pyh-graphics-06", type: "module", title: "Graphics 06 — Sound & Music" },
                { id: "pyh-graphics-07", type: "module", title: "Graphics 07 — Sprites & Scenes" },
                { id: "pyh-graphics-08", type: "module", title: "Graphics 08 — Complete Game" },
                { id: "pyh-lab-graphics-01", type: "lab", title: "Lab: Graphics 01" },
                { id: "pyh-lab-graphics-02", type: "lab", title: "Lab: Graphics 02" },
                { id: "pyh-lab-graphics-03", type: "lab", title: "Lab: Graphics 03" },
                { id: "pyh-lab-graphics-04", type: "lab", title: "Lab: Graphics 04" },
                { id: "pyh-lab-graphics-05", type: "lab", title: "Lab: Graphics 05" },
                { id: "pyh-lab-graphics-06", type: "lab", title: "Lab: Graphics 06" },
                { id: "pyh-lab-graphics-07", type: "lab", title: "Lab: Graphics 07" },
                { id: "pyh-lab-graphics-08", type: "lab", title: "Lab: Graphics 08" },
                { id: "pyh-quiz-graphics-visual", type: "quiz", title: "Quiz: Graphics Visual" },
                { id: "pyh-quiz-graphics-final", type: "quiz", title: "Quiz: Graphics Final" },
                { id: "pyh-tool-graphics-reference", type: "tool", title: "Graphics Quick Reference" }
            ]
        },
        {
            num: 3,
            title: "Projects",
            items: [
                { id: "pyh-project-01", type: "module", title: "Project 01 — Portfolio Builder" },
                { id: "pyh-project-02", type: "module", title: "Project 02 — Data Dashboard" },
                { id: "pyh-project-03", type: "module", title: "Project 03 — CLI Tool" },
                { id: "pyh-project-04", type: "module", title: "Project 04 — Web Scraper" },
                { id: "pyh-project-05", type: "module", title: "Project 05 — API Client" },
                { id: "pyh-project-06", type: "module", title: "Project 06 — Capstone" },
                { id: "pyh-quiz-portfolio", type: "quiz", title: "Quiz: Portfolio Review" }
            ]
        },
        {
            num: 4,
            title: "Engineering — Foundations",
            items: [
                { id: "pye-ch01", type: "module", title: "The Engineer's Toolkit" },
                { id: "pye-ch02", type: "module", title: "Advanced Data Structures" },
                { id: "pye-ch03", type: "module", title: "Decorators & Context Managers" },
                { id: "pye-ch04", type: "module", title: "Error Handling & Logging" },
                { id: "pye-ch05", type: "module", title: "OOP Design Patterns" }
            ]
        },
        {
            num: 5,
            title: "Engineering — Applied",
            items: [
                { id: "pye-ch06", type: "module", title: "Type Hints & Testing" },
                { id: "pye-ch07", type: "module", title: "APIs & Web Services" },
                { id: "pye-ch08", type: "module", title: "Database Access" },
                { id: "pye-ch09", type: "module", title: "Async & Concurrency" },
                { id: "pye-ch10", type: "module", title: "DevOps Scripting" }
            ]
        },
        {
            num: 6,
            title: "Engineering — Assessments",
            items: [
                { id: "pye-midterm", type: "quiz", title: "Midterm Exam" },
                { id: "pye-capstone", type: "module", title: "Capstone Project" }
            ]
        },
        {
            num: 7,
            title: "Course Tools & References",
            items: [
                { id: "pyh-tool-stdlib-reference", type: "tool", title: "Stdlib Quick Reference" },
                { id: "pyh-tool-graphics-reference", type: "tool", title: "Graphics Quick Reference" }
            ]
        }
    ]
};
