# Linux Lab Template Pattern

**Established:** December 27, 2025
**Based on:** L-001: User Identity (v2.14.3)
**Location:** `_app/houses/script/applets/linux/linux-lab-001-user-identity.html`

---

## Template Structure

### Layout: Two-Panel Design
```
┌──────────────────────────────────────────────────────────────────┐
│ [L-XXX] Title                                    [← Script House] │  <- Compact header
├────────────────────────────────────────────┬─────────────────────┤
│ ● ○ ○  student@hexworth:~                  │                     │
│────────────────────────────────────────────│   Learning Guide    │
│                                            │                     │
│   Terminal Output Area                     │   • Concept         │
│   (scrollable)                             │   • Command docs    │
│                                            │   • Examples        │
│                                            │   • Pro tips        │
│────────────────────────────────────────────│                     │
│ student@hexworth:~$ [input stays fixed]    │                     │
├────────────────────────────────────────────┤                     │
│ Current Task  [① ─ ② ─ ③]                  │                     │
│ ┌────────────────────────────────────────┐ │                     │
│ │ Task Title                             │ │                     │
│ │ Description                            │ │                     │
│ │ $ hint                                 │ │                     │
│ └────────────────────────────────────────┘ │                     │
└────────────────────────────────────────────┴─────────────────────┘
```

---

## Key Features

### 1. Compact Header (~40px)
- Lab badge: `L-XXX`
- Title: Short, descriptive
- Back link to Script House

### 2. Terminal (Main Attraction)
- Fills available space
- Output scrolls, input stays fixed at bottom
- macOS-style dots (red/yellow/green)
- Prompt: `student@hexworth:~$`
- Command history (arrow keys)

### 3. Task Panel (Bottom of Terminal)
- Step indicators: ① ─ ② ─ ③ (shows ✓ when complete)
- Single task displayed at a time
- Includes hint showing command syntax
- Sequential completion enforced

### 4. Learning Panel (Right Side)
- 400px fixed width
- Scrollable
- Sections: Why it matters, Command docs, Examples, Pro tips

---

## JavaScript Structure

```javascript
// Simulated user for this lab
const currentUser = {
    username: 'student',
    uid: 1000,
    gid: 1000,
    groups: [...],
    hostname: 'hexworth'
};

// Task data with display info
const taskData = {
    1: {
        title: 'Task Title',
        description: 'What to do',
        hint: '$ command',
        check: (cmd) => cmd.trim() === 'command'
    },
    // ... more tasks
};

// Commands implemented
switch(cmd) {
    case 'help': // List available commands
    case 'clear': // Clear terminal
    case 'man': // Manual pages
    case 'command1': // Lab-specific
    case 'command2': // Lab-specific
}
```

---

## File Naming Convention

```
linux-lab-XXX-topic.html

Examples:
- linux-lab-001-user-identity.html
- linux-lab-002-file-navigation.html
- linux-lab-003-file-permissions.html
```

---

## Registration Checklist

When creating a new lab:

1. **Create the lab file** in `_app/houses/script/applets/linux/`
2. **Add to ContentRegistry** (`_app/config/content-registry.js`)
   - Entry in modules section
   - Add to CompTIA Linux+ path
3. **Add to Script House index** (`_app/houses/script/index.html`)
   - Add to `SAMPLE_MODULES` array
   - Update `linux-labs` category count

---

## Color Theme (Script House Green)

```css
--bg-dark: #052e16;
--bg-gradient: linear-gradient(135deg, #052e16 0%, #14532d 100%);
--primary: #22c55e;
--primary-light: #4ade80;
--text: #86efac;
--text-muted: #bbf7d0;
--task-active: #fbbf24;  /* Yellow for current task */
--border: #166534;
```

---

## Template File

Copy `linux-lab-001-user-identity.html` and modify:
1. Title and lab number
2. `currentUser` object (if different user context needed)
3. `taskData` object with new tasks
4. Command implementations in `switch(cmd)`
5. Learning panel content

---

*Reference: L-001 established as template on December 27, 2025*

