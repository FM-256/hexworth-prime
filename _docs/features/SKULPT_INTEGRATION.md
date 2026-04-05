# Skulpt Integration

**Components:** TurtleCanvas.js, SkulptRunner.js, vendor/skulpt/
**Added:** 2026-03

## Purpose

TurtleCanvas.js includes a built-in Python parser that handles `for` loops, variable assignments, and all standard turtle commands. But it cannot handle `def`, `if/elif/else`, `while`, `class`, `try/except`, recursion, or any other Python control flow beyond `for x in range()`.

Students in Python Hub Project 03 (Fractal Tree) need `def` and `if` for recursive functions. Rather than extend the built-in parser into a full Python interpreter, we integrate [Skulpt](https://skulpt.org/) — a Python-to-JavaScript compiler that runs real Python 3 in the browser.

## Architecture: Three-Stage Lazy Loading

```
Student clicks Run
        |
        v
  TurtleCanvas.runCode(code)
        |
        v
  _needsSkulpt(code) ──── false ──> Built-in parser (instant, no downloads)
        |
       true
        v
  _ensureSkulptRunner()
        |
        v
  Loads SkulptRunner.js (7 KB)
        |
        v
  SkulptRunner._ensureSkulpt()
        |
        v
  Loads skulpt.min.js (800 KB) + skulpt-stdlib.js (2.2 MB)
        |
        v
  Skulpt compiles & runs Python with turtle module
```

**Why lazy?** The Skulpt vendor files total ~3 MB. Most turtle lessons use simple `for` loops and don't need Skulpt. Lazy loading means zero cost for 90%+ of pages.

## Detection: `_needsSkulpt()`

```js
const _ADVANCED_RE = /^\s*(?:def |if |elif |else:|while |class |return |try:|except|raise |with |lambda )/m;
```

The regex checks for Python keywords at the start of any line (with optional leading whitespace). If any match, the code routes to Skulpt. Otherwise, the fast built-in parser handles it.

**Bug fixed:** Original regex was `/^(?:def |if |...)` — no `\s*` — so indented keywords inside functions weren't detected. A `def draw_branch():` at column 0 worked, but the `if` on line 2 (indented) didn't trigger Skulpt mode. Fixed by adding `^\s*`.

## Canvas/Div Swap

Skulpt's turtle module creates its own `<canvas>` elements inside a container div. TurtleCanvas handles this by:

1. Creating a sibling `<div id="{canvasId}-skulpt">` next to the original canvas
2. Hiding the original canvas (`display: none`)
3. Showing the Skulpt div (`display: block`)
4. Passing the div ID to `SkulptRunner.run(code, divId, options)`
5. On `clear()`, swapping back: hide div, show canvas

## Transparency Fix: `_ensureSkulptCanvasCSS()`

Skulpt's turtle module creates a stack of internal canvases:

| z-index | Canvas | Purpose |
|---------|--------|---------|
| 1 | Background | Background color fill |
| 2 | Drawing | Lines, fills, stamps |
| 3 | Sprite | Turtle cursor arrow |

If any page CSS sets `background` on `.turtle-canvas-container canvas`, ALL three canvases get an opaque background. The sprite layer (z-3) hides the drawing layer (z-2) — the turtle cursor is visible but no lines appear.

**Fix:** `_ensureSkulptCanvasCSS()` injects a one-time `<style>` tag:
```css
[id$="-skulpt"] canvas { background: transparent !important; }
```

This forces all Skulpt-internal canvases to be transparent, so the stacking works correctly. The container div provides the dark background.

**EduScan rule TURTLE-001** prevents recurrence by flagging `.turtle-canvas-container canvas { background: ... }` in page CSS.

## Whitespace Normalization: `_dedent()`

When code lives inside a `<textarea>` in an HTML template, the HTML indentation leaks into the code content:

```html
<textarea>
            import turtle
            for i in range(4):
                forward(100)
                right(90)
</textarea>
```

The textarea value starts each line with 12 spaces of HTML template indent. Python (and Skulpt) treats this as a syntax error.

`_dedent()` strips the common leading whitespace, matching Python's `textwrap.dedent()`.

**Bug fixed:** Original implementation calculated minimum indent across ALL lines. If line 1 had zero indent but lines 2+ had 8 spaces (copy-paste from textarea), `minIndent = 0` and nothing was stripped. Fixed by recalculating from line 2+ when line 1 has zero indent.

**EduScan rule TURTLE-002** flags textarea content with embedded common indent as a source-level warning.

## Error Handling

Skulpt errors are caught and displayed inside the Skulpt div:

```html
<pre style="color:#ef4444;font-family:monospace;padding:16px;...">
Error on line 5: name 'turtl' is not defined
</pre>
```

If Skulpt has traceback info, the line number is extracted. Otherwise the raw error string is shown. HTML entities are escaped to prevent XSS.

## CSP Requirement

Skulpt compiles Python to JavaScript and uses `eval()` internally. This requires `'unsafe-eval'` in the `script-src` Content Security Policy directive.

In `firebase.json`, the CSP header includes:
```
script-src 'self' 'unsafe-eval' ...
```

This is scoped to the entire app (not just turtle pages) because CSP headers are set at the hosting level in Firebase.

## Key Files

| File | Purpose |
|------|---------|
| `_app/components/TurtleCanvas.js` | Turtle interpreter, Skulpt detection, canvas/div swap |
| `_app/components/SkulptRunner.js` | Skulpt lazy loader, Python execution bridge |
| `_app/vendor/skulpt/skulpt.min.js` | Skulpt compiler (~800 KB) |
| `_app/vendor/skulpt/skulpt-stdlib.js` | Skulpt standard library (~2.2 MB) |
| `firebase.json` | CSP header with `'unsafe-eval'` |
