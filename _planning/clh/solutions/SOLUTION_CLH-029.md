# CLH-029: Vim Essentials - Solution Sheet

**Module:** CLH-029
**Title:** Vim Essentials
**Tier:** CLI Ghost
**Theme:** Master the essential text editor for field operations

---

## Scenario Overview

You are `operator@FIELD-OPS`, preparing for deployment. Every field operative must be proficient with vim - it's available on every Linux system, works over low-bandwidth connections, and leaves no GUI traces. Your mission is to learn the basics and find the handler verification code stored in your vim configuration.

---

## Objectives & Solutions

### Objective 1: OPEN - Practice File
**Task:** Open the practice file in vim
**Hint:** `$ vim training/practice.txt`

**Solution:**
```bash
vim training/practice.txt
```

**Result:** Opens vim with the practice file. Press `i` to enter insert mode, `ESC` to return to normal mode, `:q!` to quit without saving.

---

### Objective 2: READ - Vim Config
**Task:** View your vim configuration
**Hint:** `$ cat ~/.vimrc`

**Solution:**
```bash
cat ~/.vimrc
```

**Expected Output:**
```vim
" Field Operator .vimrc
" Optimized for stealth operations

set number           " Show line numbers
syntax on            " Enable syntax highlighting
set tabstop=4        " Tab = 4 spaces
set autoindent       " Auto-indent new lines
set hlsearch         " Highlight search results
set incsearch        " Incremental search
set nobackup         " No backup files (OPSEC)
set noswapfile       " No swap files (leave no trace)
set encoding=utf-8   " UTF-8 encoding

" Custom key mappings
nnoremap <leader>w :w<CR>
nnoremap <leader>q :q<CR>

" Handler verification - escape sequence
" let g:field_verification = "VIMLOCK"
" (Vim Is My Lock On Chaos Key)
```

**Analysis:** The verification code `VIMLOCK` is stored as a commented variable `g:field_verification`.

---

### Objective 3: STUDY - Vim Modes
**Task:** Learn about vim's different modes
**Hint:** `$ cat training/vim_modes.txt`

**Solution:**
```bash
cat training/vim_modes.txt
```

**Expected Output:**
```
VIM MODES EXPLAINED
===================

NORMAL MODE (default):
  - Navigation and commands
  - Press ESC to return here
  - Most time spent here when skilled

INSERT MODE:
  - Press 'i' to enter
  - Type text normally
  - Press ESC to exit

VISUAL MODE:
  - Press 'v' to enter
  - Select text with movement keys
  - Operations affect selected text

COMMAND MODE:
  - Press ':' to enter
  - Type commands like :wq, :q!, :set number
  - Press ENTER to execute

TIP: If lost, press ESC multiple times to return to Normal mode.
```

---

### Objective 4: REVIEW - Cheatsheet
**Task:** Study the vim quick reference
**Hint:** `$ cat .vim_cheatsheet`

**Solution:**
```bash
cat .vim_cheatsheet
```

**Expected Output (partial):**
```
VIM SURVIVAL CHEATSHEET
=======================
Field Operatives Edition - MEMORIZE THIS

MODES:
  i     = Insert mode (type text)
  ESC   = Return to Normal mode
  v     = Visual mode (select text)
  :     = Command mode

NAVIGATION (Normal mode):
  h j k l  = left/down/up/right
  w        = next word
  b        = previous word
  0        = start of line
  $        = end of line
  gg       = top of file
  G        = bottom of file
  :42      = go to line 42

...

FIELD VERIFICATION:
Your handler will request an escape sequence.
The code is stored in your personal vim configuration file.
```

**Analysis:** The cheatsheet tells you the verification code is in your vim config - directing you to read `.vimrc`.

---

### Objective 5: FIND - Handler Verification Code
**Task:** Locate the verification code in your vim configuration
**Hint:** The code is in your personal vim config

**Solution:**
```bash
cat ~/.vimrc | grep -i verification
```
or simply:
```bash
cat ~/.vimrc
```

**Expected Output:**
```vim
" Handler verification - escape sequence
" let g:field_verification = "VIMLOCK"
" (Vim Is My Lock On Chaos Key)
```

**Analysis:** The verification code is `VIMLOCK`, stored as a Vim global variable comment.

---

## Insight Phase

**Question:** Your handler requests verification. What is the escape sequence stored in your vim configuration?

**Answer:** `VIMLOCK`

**Accepted variations:** "VIMLOCK", "vimlock"

**How to find:** Read the `.vimrc` file and find the `g:field_verification` variable.

**Mnemonic:** VIMLOCK = "Vim Is My Lock On Chaos Key"

---

## Essential Vim Commands

### Modes
| Key | Action |
|-----|--------|
| `i` | Enter INSERT mode |
| `ESC` | Return to NORMAL mode |
| `v` | Enter VISUAL mode |
| `:` | Enter COMMAND mode |

### Navigation (Normal Mode)
| Key | Action |
|-----|--------|
| `h j k l` | left/down/up/right |
| `w` | Next word |
| `b` | Previous word |
| `0` | Start of line |
| `$` | End of line |
| `gg` | Top of file |
| `G` | Bottom of file |
| `:42` | Go to line 42 |

### Editing
| Key | Action |
|-----|--------|
| `x` | Delete character |
| `dd` | Delete line |
| `yy` | Copy (yank) line |
| `p` | Paste after cursor |
| `u` | Undo |
| `Ctrl+r` | Redo |

### File Operations
| Command | Action |
|---------|--------|
| `:w` | Save |
| `:q` | Quit |
| `:wq` | Save and quit |
| `:q!` | Quit without saving |
| `:e filename` | Open file |

### Search
| Command | Action |
|---------|--------|
| `/pattern` | Search forward |
| `?pattern` | Search backward |
| `n` | Next match |
| `N` | Previous match |

---

## Why Vim for Field Operations

1. **Universal availability** - Installed on every Linux/Unix system
2. **Works over SSH** - Even on slow, unstable connections
3. **No GUI required** - Works in any terminal
4. **Leaves minimal traces** - No swap files with proper config
5. **Powerful editing** - Complex operations with few keystrokes
6. **Scriptable** - Automate repetitive tasks

---

## OPSEC Settings in .vimrc

```vim
set nobackup         " No backup files (~filename)
set noswapfile       " No swap files (.filename.swp)
set nowritebackup    " No backup before overwriting
set viminfo=""       " Don't save command history
```

These settings ensure vim doesn't leave forensic artifacts.

---

## Common Mistakes & Fixes

| Problem | Solution |
|---------|----------|
| Stuck in INSERT mode | Press `ESC` |
| Terminal seems frozen | Press `Ctrl+Q` (Ctrl+S freezes) |
| Can't quit | `:q!` (force quit) |
| Accidentally in visual mode | Press `ESC` twice |
| Wrong file edited | `:q!` then `vim correct_file` |

---

## Additional Training Files

```bash
# Practice exercises
cat training/practice.txt

# Mission report template
cat training/mission_template.txt

# Example configs to edit
cat configs/network.conf
cat configs/services.conf

# Actual mission file
cat missions/op_serpent.txt
```

---

*Last Updated: February 2, 2026*
