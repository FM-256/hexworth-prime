/**
 * Python for IT — Course Content Map for Tenant Instructor Dashboard
 *
 * COP1034C: Programming for Technology Professionals
 * 4-week course: MTTh 9am-1pm (12 class meetings, 48 contact hours)
 * Textbook: Lambert, K.A. (2024) Fundamentals of Python: First Programs, 3rd Ed.
 *
 * Used by the instructor dashboard for:
 *   - Course Progress overlay (per-item completion rates)
 *   - Class Report (chapter heatmap, quiz performance)
 *   - Student Detail (per-week breakdown)
 *   - Chapter Health donut (Strong Grasp / Review Recommended / Refresher Alert)
 *
 * Module IDs use 'pfi-' prefix and register under house 'code'.
 *
 * Lab structure: Each week has a PythonSandbox environment (10 challenges)
 * plus a graded project checkpoint. Old Q&A labs archived.
 *
 * Created: 2026-04-02
 * Updated: 2026-04-03 — sandbox labs replace Q&A labs, OOP added, applied merged
 */
var PYTHON_FOR_IT_MAP = {
    courseId: "python-for-it",
    title: "Python for IT — COP1034C",
    houseId: "code",
    totalChapters: 4,
    chapters: [
        {
            /* Week 1: Data Types, Expressions, Control Statements (Obj 1, 2)
               Mon: Data types + expressions
               Tue: Conditionals (if/elif/else)
               Thu: Loops + practice + Quiz 1 */
            num: 1,
            title: "Week 1 — Data Types & Control Flow",
            items: [
                { id: "pfi-setup-guide",       type: "lab",          title: "First Things First: Environment Setup" },
                { id: "pfi-course-intro",      type: "presentation", title: "Course Introduction" },
                { id: "pfi-w1-datatypes",     type: "presentation", title: "Data Types, Variables & Expressions" },
                { id: "pfi-w1-conditionals",   type: "presentation", title: "Control Flow: Conditionals" },
                { id: "pfi-w1-loops",          type: "presentation", title: "Control Flow: Loops" },
                { id: "pfi-sandbox-tour",      type: "lab",          title: "Sandbox Tour (Start Here)" },
                { id: "pfi-w1-sandbox",        type: "lab",          title: "Week 1 Coding Sandbox (10 challenges)" },
                { id: "pfi-w1-checkpoint",     type: "lab",          title: "Week 1 Checkpoint (Sandbox-Validated)" },
                { id: "pfi-w1-quiz",           type: "quiz",         title: "Quiz 1: Data Types & Control Flow" },
                { id: "pfi-w1-project",        type: "lab",          title: "Project 1: IT System Report Generator" }
            ]
        },
        {
            /* Week 2: Strings, Files, Lists, Dictionaries (Obj 3, 4)
               Mon: Strings + text files
               Tue: Lists and tuples
               Thu: Dictionaries + data processing + Quiz 2 */
            num: 2,
            title: "Week 2 — Strings, Files & Data Structures",
            items: [
                { id: "pfi-w2-strings",        type: "presentation", title: "String Processing & Text Files" },
                { id: "pfi-w2-lists",          type: "presentation", title: "Lists & Tuples" },
                { id: "pfi-w2-dicts",          type: "presentation", title: "Dictionaries & Data Processing" },
                { id: "pfi-w2-sandbox",        type: "lab",          title: "Week 2 Coding Sandbox (10 challenges)" },
                { id: "pfi-w2-checkpoint",     type: "lab",          title: "Week 2 Checkpoint (Sandbox-Validated)" },
                { id: "pfi-w2-quiz",           type: "quiz",         title: "Quiz 2: Strings, Files & Data Structures" },
                { id: "pfi-w2-project",        type: "lab",          title: "Project 2: Server Log Analyzer" }
            ]
        },
        {
            /* Week 3: Functions, Graphics, OOP (Obj 5, 6, 7-partial)
               Mon: Functions
               Tue: Graphics + image processing
               Thu: OOP + project + Quiz 3 */
            num: 3,
            title: "Week 3 — Functions, Graphics & OOP",
            items: [
                { id: "pfi-w3-functions",      type: "presentation", title: "Functions: Design, Scope & Parameters" },
                { id: "pfi-w3-graphics",       type: "presentation", title: "Graphics & Image Processing" },
                { id: "pfi-w3-oop",            type: "presentation", title: "Object-Oriented Programming" },
                { id: "pfi-w3-sandbox",        type: "lab",          title: "Week 3 Coding Sandbox (10 challenges)" },
                { id: "pfi-w3-checkpoint",     type: "lab",          title: "Week 3 Checkpoint (Sandbox-Validated)" },
                { id: "pfi-w3-quiz",           type: "quiz",         title: "Quiz 3: Functions, Graphics & OOP" },
                { id: "pfi-w3-project",        type: "lab",          title: "Graphics Mini-Project" },
                { id: "pfi-w3-project-oop",    type: "lab",          title: "Project 3: Network Device Manager" }
            ]
        },
        {
            /* Week 4: GUI, Error Handling, Networking, Algorithms, Final (Obj 7, 8, 9)
               Mon: GUI with Tkinter
               Tue: Error Handling + Networking + Algorithms (combined)
               Thu: Final Exam + Final Project due */
            num: 4,
            title: "Week 4 — GUI, Applied Python & Final",
            items: [
                { id: "pfi-w4-gui",            type: "presentation", title: "GUI Programming with Tkinter" },
                { id: "pfi-w4-applied",        type: "presentation", title: "Error Handling, Networking & Algorithms" },
                { id: "pfi-w4-sandbox",        type: "lab",          title: "Week 4 Coding Sandbox (10 challenges)" },
                { id: "pfi-w4-checkpoint",     type: "lab",          title: "Week 4 Checkpoint (Sandbox-Validated)" },
                { id: "pfi-w4-final-exam",     type: "quiz",         title: "Final Exam" },
                { id: "pfi-w4-final-project",  type: "lab",          title: "Final Project Submission" }
            ]
        }
    ]
};
