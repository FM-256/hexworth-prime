# GUISimulator.js Documentation

## Overview

GUISimulator.js is a framework for simulating Windows Server management interfaces (ADUC, Server Manager, Disk Management, etc.) in Hexworth Prime's Windows Server Administration course.

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    WSAState (Central Store)                     │
│  AD: users, groups, OUs, computers                              │
│  Storage: disks, volumes, shares                                │
│  Hyper-V: vms, switches, checkpoints                            │
├─────────────────────────────────────────────────────────────────┤
│  subscribe(callback) │ dispatch(action) │ getState()            │
└───────────────┬─────────────────────────────────┬───────────────┘
                │                                 │
      ┌─────────▼─────────┐             ┌────────▼────────┐
      │   PSTerminal.js   │◄───────────►│  GUISimulator   │
      │   (PowerShell)    │  State Sync │  (GUI Windows)  │
      └───────────────────┘             └─────────────────┘
```

### Files

| File | Purpose |
|------|---------|
| `_app/components/WSAState.js` | Central state store (Redux-inspired) |
| `_app/components/GUISimulator.js` | GUI framework and components |
| `_app/components/styles/gui-simulator.css` | Shared CSS styles |

---

## Quick Start

### Basic Setup

```html
<!-- Load dependencies in order -->
<link rel="stylesheet" href="components/styles/gui-simulator.css">
<script src="components/WSAState.js"></script>
<script src="components/GUISimulator.js"></script>

<div id="gui-container"></div>

<script>
    // Initialize WSAState with data
    WSAState.init({
        adUsers: { /* ... */ },
        adGroups: { /* ... */ },
        domain: 'hexworth.local'
    });

    // Initialize GUISimulator
    GUISimulator.init('WSA-M02', '#gui-container', {
        domain: 'hexworth.local',
        hostname: 'DC01'
    });

    // Create an ADUC window
    GUISimulator.createADUC({
        onObjectiveComplete: (id) => console.log('Completed:', id)
    });
</script>
```

---

## Dual Theme System

GUISimulator supports two visual themes:

| Theme | Description | Use Case |
|-------|-------------|----------|
| `windows` | Pixel-accurate Windows Server 2022 | Training for real-world recognition |
| `hexworth` | Stylized dark theme | Hexworth Prime branding |

### Setting Theme

```javascript
// Set theme during initialization
GUISimulator.init('WSA-M02', '#container', {
    theme: 'windows'  // or 'hexworth'
});

// Change theme at runtime
GUISimulator.setTheme('hexworth');

// Toggle between themes
GUISimulator.toggleTheme();

// Get current theme
const currentTheme = GUISimulator.getTheme();
```

### Theme Toggle Button

Add a UI toggle button for users to switch themes:

```javascript
GUISimulator.createThemeToggle({
    container: '#theme-toggle-container',
    onChange: (newTheme) => {
        console.log(`Switched to ${newTheme} theme`);
    }
});
```

### Theme Constants

```javascript
GUISimulator.THEMES.WINDOWS  // 'windows'
GUISimulator.THEMES.HEXWORTH // 'hexworth'
```

### CSS Theme Classes

Themes are applied via CSS classes on the container:
- `.gui-theme-windows` - Windows Server 2022 appearance
- `.gui-theme-hexworth` - Hexworth Prime dark theme

Theme preference is automatically saved to `localStorage`.

### Visual Differences

| Element | Windows Theme | Hexworth Theme |
|---------|--------------|----------------|
| Window corners | Square (0px radius) | Rounded (8px radius) |
| Window controls | ━ ▢ ✕ buttons | Colored circles |
| Background | Light (#ffffff) | Dark (#0a0a0f) |
| Accent color | #0078d4 (blue) | #60a5fa (cyan) |
| Title bar | Dark (#1f1f1f) | Dark (#12141f) |
| Fonts | Segoe UI 12px | Segoe UI 13px |

---

## WSAState API

### Core Methods

#### `WSAState.init(initialData)`
Initialize state with data.

```javascript
WSAState.init({
    adUsers: {
        'jsmith': {
            SamAccountName: 'jsmith',
            Name: 'John Smith',
            Enabled: true,
            LockedOut: false,
            MemberOf: ['Domain Users']
        }
    },
    adGroups: { /* ... */ },
    domain: 'hexworth.local'
});
```

#### `WSAState.dispatch(action)`
Dispatch an action to modify state.

```javascript
WSAState.dispatch({
    type: 'AD_CREATE_USER',
    payload: {
        SamAccountName: 'agarcia',
        Name: 'Ana Garcia',
        Enabled: true
    },
    source: 'gui'  // 'gui' or 'terminal'
});
```

#### `WSAState.subscribe(callback)`
Subscribe to state changes. Returns unsubscribe function.

```javascript
const unsubscribe = WSAState.subscribe((state, prevState, action) => {
    console.log('Action:', action.type);
    console.log('New users:', state.adUsers);
});

// Later: unsubscribe();
```

#### `WSAState.getState()`
Get immutable copy of current state.

```javascript
const state = WSAState.getState();
console.log(state.adUsers);
```

#### `WSAState.getSlice(key)`
Get a specific state slice.

```javascript
const users = WSAState.getSlice('adUsers');
```

#### `WSAState.reset()`
Reset state to defaults.

### Action Types

```javascript
// Active Directory
'AD_CREATE_USER', 'AD_UPDATE_USER', 'AD_DELETE_USER',
'AD_ENABLE_USER', 'AD_DISABLE_USER', 'AD_UNLOCK_USER',
'AD_RESET_PASSWORD',
'AD_CREATE_GROUP', 'AD_DELETE_GROUP',
'AD_ADD_MEMBER', 'AD_REMOVE_MEMBER',
'AD_CREATE_OU', 'AD_DELETE_OU',
'AD_MOVE_OBJECT',

// Storage
'STORAGE_INIT_DISK', 'STORAGE_CREATE_PARTITION',
'STORAGE_FORMAT_VOLUME', 'STORAGE_CREATE_SHARE',

// Hyper-V
'VM_CREATE', 'VM_START', 'VM_STOP', 'VM_CHECKPOINT',

// Services
'SERVICE_START', 'SERVICE_STOP', 'SERVICE_RESTART'
```

### Convenience Actions

```javascript
// Instead of dispatch(), use shortcuts:
WSAState.actions.createUser({ SamAccountName: 'jdoe', Name: 'Jane Doe' }, 'gui');
WSAState.actions.deleteUser('jdoe', 'gui');
WSAState.actions.unlockUser('jlocked', 'gui');
WSAState.actions.createGroup({ Name: 'IT Staff' }, 'gui');
WSAState.actions.addMember({ GroupName: 'IT Staff', MemberName: 'jdoe' }, 'gui');
WSAState.actions.startVM('WEB01', 'gui');
```

---

## GUISimulator API

### Initialization

#### `GUISimulator.init(moduleId, container, options)`

```javascript
GUISimulator.init('WSA-M02', '#gui-container', {
    domain: 'hexworth.local',
    hostname: 'DC01'
});
```

#### `GUISimulator.destroy()`
Cleanup all windows, modals, and subscriptions.

---

### Window Management

#### `GUISimulator.createWindow(options)`

```javascript
const win = GUISimulator.createWindow({
    id: 'my-window',           // Unique ID
    title: 'My Window',        // Title bar text
    icon: '📁',                // Title bar icon
    width: 800,                // Initial width
    height: 500,               // Initial height
    x: 100,                    // Initial X position (null = centered)
    y: 100,                    // Initial Y position (null = centered)
    resizable: true,           // Allow resize
    minimizable: true,         // Show minimize button
    maximizable: true,         // Show maximize button
    closable: true,            // Show close button
    content: '<div>...</div>', // HTML content
    onClose: () => {},         // Close callback (return false to cancel)
    onFocus: () => {},         // Focus callback
    onBlur: () => {},          // Blur callback
    onStateChange: (state, prevState, action) => {}  // WSAState change callback
});
```

#### Other Window Methods

```javascript
GUISimulator.closeWindow('my-window');
GUISimulator.focusWindow('my-window');
GUISimulator.minimizeWindow('my-window');
GUISimulator.restoreWindow('my-window');
GUISimulator.toggleMaximize('my-window');
GUISimulator.getWindow('my-window');           // Get window instance
GUISimulator.getWindowContent('my-window');    // Get content element
```

---

### TreeView Component

#### `GUISimulator.createTreeView(options)`

```javascript
const tree = GUISimulator.createTreeView({
    container: '#tree-container',
    data: [
        {
            id: 'root',
            label: 'hexworth.local',
            icon: '🏰',
            children: [
                { id: 'users', label: 'Users', icon: '👥' },
                { id: 'computers', label: 'Computers', icon: '💻' }
            ]
        }
    ],
    expandedIds: ['root'],              // Initially expanded nodes
    selectedId: 'users',                // Initially selected node
    onSelect: (nodeId, nodeData) => {}, // Selection callback
    onContextMenu: (nodeId, nodeData, event) => {},  // Right-click callback
    onExpand: (nodeId) => {},           // Expand callback
    onCollapse: (nodeId) => {}          // Collapse callback
});

// TreeView methods
tree.select('users');
tree.expand('root');
tree.collapse('root');
tree.toggle('root');
tree.setData(newData);
tree.refresh();
tree.getData();
tree.getSelected();
```

---

### ListView Component

#### `GUISimulator.createListView(options)`

```javascript
const list = GUISimulator.createListView({
    container: '#list-container',
    columns: [
        { id: 'icon', label: '', width: 40 },
        { id: 'Name', label: 'Name', width: 200, sortable: true },
        { id: 'Type', label: 'Type', width: 100 },
        { id: 'Description', label: 'Description' }  // No width = flex
    ],
    data: [
        { Name: 'John Smith', Type: 'User', Description: 'IT Staff' },
        { Name: 'IT Admins', Type: 'Group', Description: 'Administrators' }
    ],
    sortColumn: 'Name',
    sortDirection: 'asc',
    multiSelect: false,
    emptyMessage: 'No items to display.',
    getIcon: (item) => item.Type === 'User' ? '👤' : '👥',
    onSelect: (item) => {},
    onDoubleClick: (item) => {},
    onContextMenu: (item, event) => {}
});

// ListView methods
list.select(item);
list.clearSelection();
list.setData(newData);
list.sort('Name', 'desc');
list.refresh();
list.getData();
list.getSelected();
```

---

### Context Menu

#### `GUISimulator.showContextMenu(options)`

```javascript
GUISimulator.showContextMenu({
    x: event.clientX,
    y: event.clientY,
    items: [
        { icon: '📁', label: 'New Folder', onClick: () => {} },
        { icon: '📄', label: 'New File', shortcut: 'Ctrl+N', onClick: () => {} },
        { type: 'divider' },
        { icon: '🗑️', label: 'Delete', disabled: true },
        { icon: '⚙️', label: 'Settings', submenu: true }  // Shows arrow
    ]
});

GUISimulator.closeContextMenu();
```

---

### Modal Dialogs

#### `GUISimulator.showModal(options)`

```javascript
const modal = GUISimulator.showModal({
    id: 'my-modal',
    title: 'New User',
    icon: '👤',
    width: 450,
    content: '<div id="form"></div>',
    closeOnBackdrop: true,  // Click backdrop to close
    actions: [
        { label: 'Create', primary: true, onClick: () => { /* return false to keep open */ } },
        { label: 'Cancel', onClick: () => {} }
    ]
});

// Modal methods
modal.close();
modal.getBody();               // Get body element
modal.setContent('<p>...</p>');
```

#### `GUISimulator.closeModal(id)`

#### `GUISimulator.confirm(options)`

```javascript
const result = await GUISimulator.confirm({
    title: 'Delete User?',
    message: 'This action cannot be undone.',
    icon: '⚠️',
    confirmLabel: 'Delete',
    cancelLabel: 'Cancel'
});
// result is true or false
```

#### `GUISimulator.alert(options)`

```javascript
await GUISimulator.alert({
    title: 'Success',
    message: 'User created successfully.',
    icon: '✓'
});
```

---

### Form Builder

#### `GUISimulator.buildForm(options)`

```javascript
const form = GUISimulator.buildForm({
    container: '#form-container',
    fields: [
        // Text input
        { id: 'name', type: 'text', label: 'Name', required: true, placeholder: 'Enter name' },

        // Password
        { id: 'password', type: 'password', label: 'Password', required: true },

        // Select
        {
            id: 'department',
            type: 'select',
            label: 'Department',
            placeholder: 'Select...',
            options: [
                { value: 'it', label: 'IT' },
                { value: 'hr', label: 'HR' }
            ],
            defaultValue: 'it'
        },

        // Checkbox
        { id: 'enabled', type: 'checkbox', label: 'Account enabled', checked: true },

        // Row (side-by-side fields)
        {
            type: 'row',
            fields: [
                { id: 'firstName', type: 'text', label: 'First Name' },
                { id: 'lastName', type: 'text', label: 'Last Name' }
            ]
        },

        // Textarea
        { id: 'notes', type: 'textarea', label: 'Notes', placeholder: 'Optional notes' }
    ]
});

// Form methods
const values = form.getValues();    // { name: '...', password: '...', ... }
form.setValues({ name: 'Test' });
const isValid = form.validate();    // Shows errors, returns boolean
form.reset();
form.getElement('name');            // Get input element by id
```

---

### Toolbar

#### `GUISimulator.createToolbar(options)`

```javascript
const toolbar = GUISimulator.createToolbar({
    container: '#toolbar',
    items: [
        { id: 'new', icon: '➕', label: 'New', onClick: () => {} },
        { id: 'save', icon: '💾', label: 'Save', primary: true, onClick: () => {} },
        { type: 'separator' },
        { id: 'delete', icon: '🗑️', label: 'Delete', disabled: true },
        { type: 'spacer' },  // Push remaining items to right
        { id: 'help', icon: '❓', label: 'Help', onClick: () => {} }
    ]
});

// Toolbar methods
toolbar.setItems(newItems);
toolbar.enable('delete');
toolbar.disable('delete');
toolbar.highlight('new', true);  // Adds pulse animation
```

---

### Status Bar

#### `GUISimulator.createStatusBar(options)`

```javascript
const statusbar = GUISimulator.createStatusBar({
    container: '#statusbar',
    leftItems: [
        { text: 'Connected to: hexworth.local' },
        { icon: '✓', text: 'Ready', type: 'success' }
    ],
    rightItems: [
        { text: '5 objects' }
    ]
});

// StatusBar methods
statusbar.setLeft([{ text: 'Loading...' }]);
statusbar.setRight([{ text: 'Done' }]);
statusbar.setMessage('User created', 'success');  // Shorthand for left
```

---

### App: ADUC

#### `GUISimulator.createADUC(options)`

Creates a complete Active Directory Users and Computers simulation.

```javascript
const aduc = GUISimulator.createADUC({
    windowId: 'aduc-window',
    width: 950,
    height: 600,
    onObjectiveComplete: (objectiveId) => {
        // objectiveId: 'create-ou', 'create-user', 'create-group',
        //              'add-member', 'reset-password'
        console.log('Completed:', objectiveId);
    },
    onClose: () => {}
});

// ADUC methods
aduc.refresh();  // Refresh tree and list from WSAState
```

---

## CSS Classes Reference

### Windows
- `.gui-window` - Window container
- `.gui-window.focused` - Focused window
- `.gui-window.maximized` - Maximized window
- `.gui-window-titlebar` - Title bar
- `.gui-window-content` - Content area

### Tree
- `.gui-tree` - Tree container
- `.gui-tree-item` - Tree node
- `.gui-tree-item.selected` - Selected node
- `.gui-tree-item[data-level="1"]` - Indentation level

### List
- `.gui-list` - List container
- `.gui-list-header` - Column headers
- `.gui-list-item` - List row
- `.gui-list-item.selected` - Selected row

### Forms
- `.gui-form-group` - Form field wrapper
- `.gui-form-label` - Label
- `.gui-form-label.required` - Required field label
- `.gui-form-input` - Text input
- `.gui-form-select` - Select dropdown
- `.gui-form-checkbox` - Checkbox wrapper
- `.gui-form-error` - Error message

### Buttons
- `.gui-btn` - Base button
- `.gui-btn.primary` - Primary action
- `.gui-btn.secondary` - Secondary action
- `.gui-btn.danger` - Destructive action
- `.gui-btn.sm` - Small button
- `.gui-btn.lg` - Large button

### Alerts
- `.gui-alert` - Alert box
- `.gui-alert.success` - Success (green)
- `.gui-alert.warning` - Warning (yellow)
- `.gui-alert.error` - Error (red)
- `.gui-alert.info` - Info (blue)

### Badges
- `.gui-badge` - Inline badge
- `.gui-badge.success/.warning/.error/.info/.neutral`

### Utilities
- `.gui-text-muted`, `.gui-text-secondary`, `.gui-text-primary`, `.gui-text-accent`
- `.gui-mt-1` through `.gui-mt-4` (margin-top)
- `.gui-mb-1` through `.gui-mb-4` (margin-bottom)
- `.gui-p-1` through `.gui-p-4` (padding)
- `.gui-flex`, `.gui-flex-1`, `.gui-items-center`, `.gui-justify-between`
- `.gui-hidden`, `.gui-truncate`

---

## Integration with PSTerminal

### Automatic Sync

When both PSTerminal and GUISimulator are loaded with WSAState:

1. **Terminal → GUI**: PowerShell commands dispatch to WSAState, GUI subscribes and updates
2. **GUI → Terminal**: GUI actions dispatch to WSAState, Terminal subscribes and updates

### Example: Bidirectional Sync

```javascript
// In terminal: New-ADUser -Name "John Doe" -SamAccountName jdoe
// PSTerminal dispatches: { type: 'AD_CREATE_USER', payload: {...}, source: 'terminal' }
// GUISimulator receives update, refreshes ADUC tree/list

// In GUI: Click "New User", fill form, click Create
// GUISimulator dispatches: { type: 'AD_CREATE_USER', payload: {...}, source: 'gui' }
// PSTerminal receives update, state.adUsers now includes new user
// Running Get-ADUser -Filter * shows the new user
```

### Source Filtering

Both systems filter by `source` to prevent infinite loops:

```javascript
// In PSTerminal's _handleWSAStateChange:
if (action.source === 'terminal') return;  // Skip own actions

// In GUISimulator's _handleStateChange:
if (action.source === 'gui') return;  // Skip own actions
```

---

## Lab Integration Example

```html
<script>
    // Track objectives
    const objectives = {
        'create-ou': false,
        'create-user': false,
        'create-group': false
    };

    function handleObjective(id) {
        if (objectives[id]) return;
        objectives[id] = true;

        // Update UI
        document.querySelector(`#task-${id}`).classList.add('completed');

        // Check completion
        if (Object.values(objectives).every(v => v)) {
            showCompletionBanner();
        }
    }

    // Initialize
    WSAState.init({ /* base state */ });
    GUISimulator.init('WSA-M02', '#container');
    GUISimulator.createADUC({
        onObjectiveComplete: handleObjective
    });
</script>
```

---

## Future Extensions

### Adding New Apps

```javascript
// Example: Disk Management
function createDiskManagement(options) {
    const win = GUISimulator.createWindow({
        id: 'diskmgmt',
        title: 'Disk Management',
        icon: '💿',
        content: `
            <div class="gui-menubar">...</div>
            <div id="disk-list"></div>
            <div id="disk-statusbar"></div>
        `
    });

    // Create components
    const list = GUISimulator.createListView({
        container: '#disk-list',
        columns: [
            { id: 'Number', label: 'Disk', width: 80 },
            { id: 'FriendlyName', label: 'Name' },
            { id: 'Size', label: 'Size', width: 100 }
        ],
        data: Object.values(WSAState.getSlice('disks'))
    });

    // Subscribe to state changes
    WSAState.subscribe((state, prev, action) => {
        if (action.type.startsWith('STORAGE_')) {
            list.setData(Object.values(state.disks));
        }
    });

    return { window: win, list };
}
```

### Desktop Simulation (Future)

The component architecture supports evolution to a full desktop:

```javascript
// Future: createDesktop()
// - Wallpaper background
// - Desktop icons
// - Taskbar with start menu
// - Multi-window management
```

---

## Troubleshooting

### Common Issues

1. **Components not styled**: Ensure `gui-simulator.css` is loaded
2. **State not syncing**: Check WSAState is loaded before GUISimulator
3. **Infinite loops**: Ensure actions include `source: 'gui'` or `source: 'terminal'`
4. **Tree not updating**: Call `tree.refresh()` after data changes

### Debug Mode

```javascript
// View action history
console.log(WSAState.getHistory());

// View current state
console.log(WSAState.getState());

// Manual dispatch for testing
WSAState.dispatch({
    type: 'AD_CREATE_USER',
    payload: { SamAccountName: 'test', Name: 'Test User' },
    source: 'debug'
});
```

---

*Last Updated: January 30, 2026*
