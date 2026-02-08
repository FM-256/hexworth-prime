# Content Placeholders Audit - January 29, 2026

## Summary
- **Coming Soon Modules**: 1
- **Placeholder Alerts**: 8
- **Missing Files**: 0

## Priority Fix
Replace ugly `alert('This module is coming soon!')` with a styled modal or toast notification.

---

## Coming Soon Modules

### Key House
| Module | Title | Status |
|--------|-------|--------|
| key-tls-ssl | TLS/SSL Explained | Coming Soon (no href) |

---

## Placeholder Alerts by House

These lines contain `alert('This module is coming soon!')` and need to be replaced with better UX:

| House | File | Line | Notes |
|-------|------|------|-------|
| shield | index.html | 1210 | Unknown module |
| web | index.html | 1231 | Unknown module |
| cloud | index.html | 1430 | Unknown module |
| forge | index.html | 1564 | Unknown module |
| script | index.html | 1783 | Unknown module |
| code | index.html | 1212 | Unknown module |
| key | index.html | 1268 | Unknown module |
| eye | index.html | 1141 | Unknown module |

---

## Recommended Fix

Create a global "Coming Soon" handler:

```javascript
// In a shared component
function showComingSoon(moduleName) {
    // Show styled modal instead of alert
    const modal = document.createElement('div');
    modal.className = 'coming-soon-modal';
    modal.innerHTML = `
        <div class="coming-soon-content">
            <span class="coming-soon-icon">🚧</span>
            <h3>Coming Soon</h3>
            <p>${moduleName || 'This module'} is under development.</p>
            <button onclick="this.closest('.coming-soon-modal').remove()">Got it</button>
        </div>
    `;
    document.body.appendChild(modal);
}
```

Then replace all `alert('This module is coming soon!')` with `showComingSoon('Module Name')`.

---

## Raw Audit Data

```json
{
  "summary": {
    "comingSoon": 1,
    "placeholderPaths": 8,
    "missingFiles": 0
  },
  "exportedAt": "2026-01-29T05:42:57.241Z"
}
```

---

*Generated from ContentCatalog audit*
