# Hexworth Prime - Web Hosting Information

**IMPORTANT: READ THIS FIRST**

---

## Live Web Application

**URL:** https://hexworth-prime.web.app

---

## Hosting Details

| Property | Value |
|----------|-------|
| **Platform** | Firebase Hosting |
| **Project ID** | hexworth-prime |
| **Deploy Command** | `firebase deploy --only hosting` |
| **Public Directory** | `_app/` |

---

## Why Firebase Hosting?

1. **Firebase Authentication** - Required a real domain (not `file://`) to work properly
2. **Free Tier** - Generous limits for educational use
3. **SSL Included** - Automatic HTTPS
4. **Fast CDN** - Global content delivery

---

## Deploy Process

```bash
# From project root
cd "/home/eq/Ai content creation/Hexworth Prime"
firebase deploy --only hosting
```

---

## Configuration File

See `firebase.json` in project root:
- Public directory: `_app/`
- No SPA rewrites (multi-page app)
- Proper MIME types for JS/CSS

---

## Access Methods

1. **Web (Primary):** https://hexworth-prime.web.app
2. **Local:** Open `START.html` directly (some features limited)

---

*Last Updated: December 23, 2025*
