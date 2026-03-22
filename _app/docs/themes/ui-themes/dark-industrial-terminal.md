# Dark Industrial Terminal

**Codename:** Utilitarian Dark Ops
**Status:** Active — deployed on forensics/IR content
**Created:** 2026-03-18

Military-grade UI stripped to function. No decoration that doesn't earn its space. Think SOC analyst workstation at 2 AM, not a marketing landing page.

---

## Design Traits

| Trait | Spec |
|-------|------|
| Border radius | 3-4px max — nothing "friendly" |
| Base palette | Monochromatic dark slate (#080b12 body, #0d1117 panels, #1e2a3a borders) |
| Primary accent | Amber (#d97706 active, #b45309 deep) — single warm accent for hierarchy |
| Secondary accent | Muted indigo (#818cf8) — used sparingly for non-critical metadata |
| Success/Error | Green #16a34a / Red #dc2626 — desaturated, not neon |
| Text hierarchy | #e5e7eb headings, #9ca3af body, #6b7280 secondary, #4b5563 metadata |
| Metadata font | `'Courier New', monospace` for reference codes, labels, phase numbers |
| Body font | `'Segoe UI', system-ui, -apple-system, sans-serif` |
| Texture | Scan-line overlay via `repeating-linear-gradient` on `body::after` (respects `prefers-reduced-motion`) |
| Gradients | None on interactive elements — borders and opacity shifts only |
| Hover states | Border color shift (#1e2a3a to #374151) + subtle background opacity change |
| Active states | Amber border + amber-tinted background (rgba(180,83,9,0.08-0.12)) |
| Density | Information-dense — content earns the pixel, whitespace is minimal but deliberate |
| Icons | webp icons from `/assets/images/icons/`, 18-24px, opacity 0.7 |

## CSS Variables (Reference)

```css
/* Base */
--bg-body: #080b12;
--bg-panel: #0d1117;
--bg-hover: rgba(255,255,255,0.04);
--border: #1e2a3a;
--border-hover: #374151;

/* Accent */
--amber: #d97706;
--amber-deep: #b45309;
--amber-bg: rgba(180,83,9,0.08);
--amber-border: rgba(180,83,9,0.3);

/* Text */
--text-heading: #e5e7eb;
--text-body: #9ca3af;
--text-secondary: #6b7280;
--text-metadata: #4b5563;

/* Semantic */
--success: #16a34a;
--error: #dc2626;
--info: #818cf8;
```

## Component Patterns

### Header
- Dark background (#0d1117), no gradient
- 3px amber accent bar on bottom edge (`linear-gradient(90deg, #b45309, #d97706, #b45309)`)
- Monospace case ID / reference label

### Tabs
- Contained bar with 3px padding, same bg as panels
- Active: amber text + inset bottom border (`box-shadow: inset 0 -2px 0 #b45309`)
- No fill change on active — just color and underline

### Cards
- 4px radius, 1px border, no shadow
- Amber dot marker before h4 (`::before` pseudo-element, 6-8px square)
- If card has icon, dot marker is suppressed

### Tables
- Amber uppercase headers (0.78rem, letter-spacing 0.08em)
- Row hover: subtle amber tint on background + text brightens

### Code Blocks
- "TERMINAL" label badge in top-right corner
- Background slightly darker than panels (#0a0e14)
- Syntax colors: amber keywords, green strings, indigo highlights, gray comments

### Alerts
- 1px border + tinted background (6% opacity of accent color)
- Uppercase bold label (0.8rem, letter-spacing 0.06em)
- No border-left bar — full border instead

## Scan-Line Overlay

```css
body::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: repeating-linear-gradient(
        0deg, transparent, transparent 2px,
        rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px
    );
    z-index: 9999;
}
@media (prefers-reduced-motion: reduce) {
    body::after { display: none; }
}
```

## Deployed Examples

- `houses/eye/applets/cyberops/eye-forensic-elements.applet.html`
- `houses/shield/labs/shield-ir-forensics.lab.html`

## Real-World Parallels

Splunk dark mode, CrowdStrike Falcon UI, Bloomberg Terminal. Tools built for operators, not consumers.
