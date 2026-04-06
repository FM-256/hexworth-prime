# Operator JavaScript — Metroidvania Design Document

**Created:** 2026-04-06
**Status:** DRAFT (pending adversarial review)
**Authors:** EQ + Claude Code
**Mirror of:** OPERATOR_PYTHON_V2_METROIDVANIA.md
**Inspiration:** Same Metroidvania loop. Different language. Different insight.

---

## 1. The Core Insight

**JavaScript's async/event-driven nature IS the mission's operational tempo.**

Python taught procedural thinking — do this, then this, then this.
JavaScript teaches **reactive thinking** — when this happens, do that.

| Game Concept | JavaScript Reality |
|-------------|-------------------|
| Reacting to threats | `agent.on('threat', handler)` (event listener) |
| Building a toolkit | `const toolkit = { fire: dir => agent.extinguish(dir) }` (object + arrow) |
| Processing scan intel | `results.filter(n => n.hasFlag).map(n => n.direction)` (array methods) |
| Sequential ops | `await agent.scan(); await agent.move('north')` (async/await) |
| Parallel ops | `Promise.all([agent.scan(), agent.ping('east')])` (concurrent execution) |
| Crafting reusable tools | `function makeHandler(tool) { return dir => tool(dir) }` (closure) |
| Unpacking intel | `const { name, direction, ports } = node` (destructuring) |
| Combining inventories | `const all = [...weapons, ...tools]` (spread operator) |

The student who writes `results.filter(n => n.name.includes('ENEMY'))` didn't learn
"higher-order functions" from a textbook. They needed to find enemies in a noisy scan.
The filter IS the radar. The callback IS the reflex. The promise IS the mission sequence.

---

## 2. Why JavaScript Is Different From Python

### The Pain Points Are Different

**Python's pain arc:** if/elif chains → dispatch tables (dictionary)
**JavaScript's pain arc:** callback hell → promises → async/await

Python forces students to discover **data structures** (dicts).
JavaScript forces students to discover **control flow patterns** (async).

### The Interpreter Is Different

Python needed a custom tokenizer/parser/interpreter (800+ lines) because browsers
don't run Python. JavaScript IS the browser's native language.

**JsInterpreter.js approach:**
- Sandboxed execution using `new Function()` constructor
- Restricted scope — only `agent`, `console.log`, and allowed globals
- No `window`, `document`, `fetch`, `localStorage` — none of the dangerous stuff
- Infinite loop protection via iteration counter
- Auto-wraps student code in async IIFE so `await` works at top level
- Execution timeout (30 seconds) to catch infinite loops

Estimated size: ~250 lines (vs 800+ for Python interpreter).

### The Agent API Is The Same

`AgentBridge.js` is language-agnostic. The same `agent.scan()`, `agent.move()`,
`agent.jump()`, etc. work identically in Python and JavaScript missions. The only
difference is HOW the student writes code to call these methods.

```javascript
// Python student writes:
// for node in agent.scan():
//     if 'ENEMY' in node['name']:
//         agent.fight(node['direction'])

// JavaScript student writes:
agent.scan().forEach(node => {
    if (node.name.includes('ENEMY')) {
        agent.fight(node.direction)
    }
})
```

Same agent. Same grid. Same tools. Different syntax. Different patterns.

---

## 3. JavaScript Feature Progression

### Tier 1: Basics (Levels 1-7)
Students learn JS syntax by calling agent methods directly.

| Level | JS Feature | Game Context |
|-------|-----------|-------------|
| JS-01 | Method calls, semicolons | `agent.scan(); agent.move('north');` |
| JS-02 | `let`/`const` variables | `let result = agent.scan();` |
| JS-03 | `if`/`else` | Check scan results, avoid traps |
| JS-04 | `for` loop | `for (let i = 0; i < results.length; i++)` |
| JS-05 | `while` loop | Navigate until target found |
| JS-06 | Functions (`function` keyword) | `function safemove(dir) { ... }` |
| JS-07 | String methods | `.includes()`, `.indexOf()` for scan parsing |

### Tier 2: Array Power (Levels 8-13)
Scan results are arrays. JavaScript's array methods are the intelligence tools.

| Level | JS Feature | Game Context |
|-------|-----------|-------------|
| JS-08 | `.forEach()` | Process all scan results |
| JS-09 | `.filter()` | Find threats in scan results |
| JS-10 | `.map()` | Extract directions from filtered nodes |
| JS-11 | `.find()` | Locate specific target |
| JS-12 | Arrow functions `=>` | Shorter callbacks: `n => n.hasFlag` |
| JS-13 | Chaining | `.filter(...).map(...).forEach(...)` |

### Tier 3: Objects & Patterns (Levels 14-17)
Students build toolkits using objects — JS equivalent of Python dicts.

| Level | JS Feature | Game Context |
|-------|-----------|-------------|
| JS-14 | Object literals | `const toolkit = { scan: agent.scan }` |
| JS-15 | Object bracket notation | `toolkit[threat](direction)` (dispatch!) |
| JS-16 | Template literals | `` `Found ${name} at ${dir}` `` |
| JS-17 | Destructuring | `const { name, direction } = node` |

### Tier 4: Obstacles & Async (Levels 18-27)
Obstacles introduced. Operations become async. Callback hell → promises → async/await.

| Level | JS Feature | Game Context |
|-------|-----------|-------------|
| JS-18 | First obstacle (holes) | `agent.jump('north')` — new method |
| JS-19 | Callbacks | `agent.scan(function(results) { ... })` |
| JS-20 | Fires introduced | Multiple obstacle handlers needed |
| JS-21 | Callback nesting (PAIN) | 3+ levels deep — pyramid of doom |
| JS-22 | Promises | `agent.scan().then(r => ...)` — the escape |
| JS-23 | Promise chaining | `.then().then().then()` |
| JS-24 | Enemies introduced | Full threat response needed |
| JS-25 | `async`/`await` | `const r = await agent.scan()` — clean async |
| JS-26 | Keys & locked doors | Async key collection sequence |
| JS-27 | All obstacles combined | if/else + async + array methods |

### Tier 5: Tool Forge (Levels 28-37)
Permanent tools earned. Metroidvania backtracking begins.

| Level | JS Feature | Game Context |
|-------|-----------|-------------|
| JS-28 | Earn `bridge` | Completion reward. Bootstrap moment. |
| JS-29 | Backtrack to JS-18 | Bridge holes. New areas accessible. |
| JS-30 | Closures | `function makeHandler(tool) { return dir => tool(dir) }` |
| JS-31 | Earn `fireproof` | Grid pickup behind bridged holes |
| JS-32 | Backtrack with fireproof | Old fire levels now trivial |
| JS-33 | `try`/`catch` | Error handling for failed operations |
| JS-34 | Earn `terminate` | Grid pickup behind fires + holes |
| JS-35 | Backtrack with terminate | Old enemy levels cleared permanently |
| JS-36 | Spread operator | `const all = [...holes, ...fires, ...enemies]` |
| JS-37 | Earn `tunnel` | Grid pickup behind all 3 obstacle types |

### Tier 6: Full Metroidvania (Levels 38-50)
All tools, all obstacles, advanced JS patterns emerge.

| Level | JS Feature | Game Context |
|-------|-----------|-------------|
| JS-38 | Tunnel through walls | Heavy wall grids |
| JS-39 | Backtrack to maze | Tunnel reveals hidden areas |
| JS-40 | `Map` / `Set` | `new Set(results.map(n => n.type))` — unique threats |
| JS-41 | `Promise.all()` | Parallel operations for efficiency |
| JS-42 | Event listeners | `agent.on('threat', handler)` — reactive |
| JS-43 | Backtrack: Mega | All tools unlock hidden areas |
| JS-44 | Generator-like patterns | Iterator protocol for complex sweeps |
| JS-45 | Ternary chains | `threat === 'fire' ? extinguish(d) : fight(d)` |
| JS-46 | Optional chaining | `node?.ports?.includes('SSH')` |
| JS-47 | `reduce()` | Aggregate threat counts across scan |
| JS-48 | Nested destructuring | `const { name, meta: { threat } } = node` |
| JS-49 | Compose everything | Open-ended, your design |
| JS-50 | Iron Curtain JS | Finale. Every tool. Every pattern. |

---

## 4. The Callback Hell → Async Arc (Key Pedagogical Moment)

### The Setup (Levels 19-21)

Level 19 introduces callbacks. Student writes:
```javascript
agent.scan(function(results) {
    agent.move('north')
})
```

Level 20 adds fire obstacles. Now they need to process results inside the callback:
```javascript
agent.scan(function(results) {
    results.forEach(function(node) {
        if (node.name.includes('FIRE')) {
            agent.extinguish(node.direction, function() {
                agent.move(node.direction)
            })
        }
    })
})
```

Level 21 requires scanning after each move. **Three levels deep:**
```javascript
agent.scan(function(results) {
    agent.move('north', function() {
        agent.scan(function(results2) {
            agent.move('east', function() {
                agent.scan(function(results3) {
                    // 5 LEVELS DEEP. THE PYRAMID OF DOOM.
                })
            })
        })
    })
})
```

### The Pain (Level 21)
The student FEELS the pain. The code works. But it's unreadable. They can't add
another layer without losing track of the nesting. This is callback hell.

### The Escape (Level 22-23)
Level 22 introduces `.then()`. Same operations, flat chain:
```javascript
agent.scan()
    .then(results => agent.move('north'))
    .then(() => agent.scan())
    .then(results => agent.move('east'))
    .then(() => agent.scan())
```

### The Resolution (Level 25)
Level 25 introduces `async`/`await`. Same operations, reads like prose:
```javascript
async function infiltrate() {
    let results = await agent.scan()
    await agent.move('north')
    results = await agent.scan()
    await agent.move('east')
    results = await agent.scan()
}
```

The student didn't learn "asynchronous programming patterns" from a textbook.
They escaped callback hell because the GAME made nested callbacks unbearable.

---

## 5. Interpreter Architecture: JsInterpreter.js

### Why Not eval()
`eval()` executes in the current scope — student code could access `window`,
`document`, Firebase, localStorage, other scripts. Unacceptable.

### The Sandboxed Approach
```javascript
function executeStudentCode(code, agentBridge, printFn) {
    // 1. Define the sandbox — ONLY what students can access
    var sandbox = {
        agent: agentBridge,
        console: { log: printFn, warn: printFn, error: printFn },
        Math: Math,
        JSON: JSON,
        parseInt: parseInt,
        parseFloat: parseFloat,
        String: String,
        Number: Number,
        Array: Array,
        Object: Object,
        Map: Map,
        Set: Set,
        Promise: Promise,
        setTimeout: guardedTimeout  // with max delay limit
    };

    // 2. Shadow dangerous globals by overriding them in function scope
    var blockedGlobals = 'window,document,fetch,XMLHttpRequest,localStorage,' +
                         'sessionStorage,indexedDB,navigator,location,history';
    var shadowBlock = blockedGlobals.split(',')
        .map(function(g) { return 'var ' + g + ' = undefined;'; }).join('\n');

    // 3. Wrap student code in async IIFE
    var wrappedCode = shadowBlock + '\n' +
        'return (async function() {\n' + code + '\n})();';

    // 4. Build the function with sandbox params
    var paramNames = Object.keys(sandbox);
    var paramValues = paramNames.map(function(k) { return sandbox[k]; });
    var fn = new Function(paramNames.join(','), wrappedCode);

    // 5. Execute with timeout
    return Promise.race([
        fn.apply(null, paramValues),
        new Promise(function(_, reject) {
            setTimeout(function() { reject(new Error('Execution timeout (30s)')); }, 30000);
        })
    ]);
}
```

### Infinite Loop Protection
Inject a counter into `while` and `for` loops via simple regex pre-processing:
```javascript
// Before: while (true) { ... }
// After:  while (true) { if (++__loopCount > 50000) throw new Error('Infinite loop'); ... }
```

### Error Reporting
Catch errors and display them in the mission output with line numbers:
```
[ERROR] Line 7: results.filtr is not a function
        Did you mean: results.filter() ?
```

Common typo suggestions built in (filtr→filter, consol→console, lenght→length).

---

## 6. Obstacle & Tool System

### Identical to Python Track
The obstacle system (holes, fires, enemies, walls, locked doors) and tool chain
(bridge, fireproof, terminate, tunnel) are ENGINE-level features that already exist
in AgentBridge.js and OperatorEngine.js. JavaScript missions use them identically.

### Persistent Inventory Is Shared... Or Not?

**Design decision needed:**
- **Option A:** Shared inventory — tools earned in Python are available in JS and vice versa
- **Option B:** Per-language inventory — each track has its own tool progression

**Recommendation: Option B (per-language inventory).**
Why: The Metroidvania arc depends on earning tools at specific points in the
progression. If a student completes Python first, they'd start JS with all 4
permanent tools, breaking the entire Metroidvania loop. Each track should be
a self-contained experience.

Storage: `hexworth_operator_inventory_js` (vs `hexworth_operator_inventory` for Python).

---

## 7. How JS Track Differs From Python Track

| Aspect | Python Track | JavaScript Track |
|--------|-------------|-----------------|
| Interpreter | Custom tokenizer/parser/AST (800+ lines) | Sandboxed native execution (~250 lines) |
| Core arc | Procedural → dispatch tables | Callbacks → promises → async/await |
| Pain point | if/elif chains | Callback hell (pyramid of doom) |
| Discovery moment | Dictionary as dispatch table | `.then()` chains → `async`/`await` |
| Array processing | `for x in list:` | `.filter()`, `.map()`, `.forEach()` |
| Object access | `node['name']` | `node.name` / destructuring |
| Function style | `def safemove(dir):` | `const safemove = dir => { ... }` |
| String building | `f"Found {name}"` | `` `Found ${name}` `` |
| Unique features | List comprehensions, tuples | Promises, async/await, closures, spread |

---

## 8. Hub Integration

### New Tab
`ALL | LINUX | WINDOWS | PYTHON | JAVASCRIPT | CISCO`

### JavaScript Tier Structure (in hub)
```javascript
var JS_TIERS = [
    { name: 'JS TIER 1 — BASICS',       subtitle: 'Syntax & Logic',     missions: ['JS-01' .. 'JS-07'] },
    { name: 'JS TIER 2 — ARRAY POWER',  subtitle: 'filter, map, find',  missions: ['JS-08' .. 'JS-13'] },
    { name: 'JS TIER 3 — OBJECTS',       subtitle: 'Toolkits & Patterns',missions: ['JS-14' .. 'JS-17'] },
    { name: 'JS TIER 4 — ASYNC',         subtitle: 'Callbacks → Await',  missions: ['JS-18' .. 'JS-27'] },
    { name: 'JS TIER 5 — TOOL FORGE',   subtitle: 'Permanent Power',    missions: ['JS-28' .. 'JS-37'] },
    { name: 'JS TIER 6 — METROIDVANIA', subtitle: 'Master Operator',    missions: ['JS-38' .. 'JS-50'] }
];
```

### Domain
New domain entry: `'JAVASCRIPT': { label: 'JavaScript', color: '#f7df1e', icon: 'icon-js.webp' }`
(Using JavaScript's signature yellow.)

---

## 9. Success Criteria

Same as Python track, plus:
1. Callback hell → promises → async/await arc happens naturally (levels 19-25)
2. Students never need to know async programming exists until the game makes them need it
3. Array methods feel like intelligence tools, not academic exercises
4. Per-language inventory prevents cross-track shortcutting
5. A student who completed Python finds JS fresh — different patterns, different thinking
6. A student who starts with JS can complete it without Python experience
7. Sandboxed interpreter prevents XSS, DOM access, or any security boundary escape

---

## 10. Files To Create

- `engine/JsInterpreter.js` — Sandboxed JS executor (~250 lines)
- `configs/js-01.config.js` through `configs/js-50.config.js` — 50 mission configs
- `missions/js-01.mission.html` through `missions/js-50.mission.html` — 50 mission loaders
- Update `index.html` — Add JAVASCRIPT domain, JS_TIERS, new tab

---

*Draft pending adversarial review. Do not build until Nancy approves.*
