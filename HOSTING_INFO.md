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

## Access Methods

### 1. Web Hosted (Full Features)
**URL:** https://hexworth-prime.web.app

| Feature | Status |
|---------|--------|
| All content & quizzes | ✅ Works |
| Progress tracking | ✅ Works |
| Achievements | ✅ Works |
| Firebase Google Sign-in | ✅ Works |
| House sorting | ✅ Works |
| Dark Arts gates | ✅ Works |

### 2. Local / Offline (Most Features)
**How:** Open `START.html` directly in browser

| Feature | Status |
|---------|--------|
| All content & quizzes | ✅ Works |
| Progress tracking | ✅ Works (localStorage) |
| Achievements | ✅ Works (localStorage) |
| Firebase Google Sign-in | ❌ Requires HTTPS |
| House sorting | ✅ Works |
| Dark Arts gates | ✅ Works |
| God Mode / Master Key | ✅ Works |

**Note:** Running locally is fully functional for learning. The only missing feature is Google sign-in for admin access, but God Mode and Master Key provide equivalent access locally.

---

## Why Firebase Hosting?

1. **Firebase Authentication** - Google sign-in requires a real HTTPS domain
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

## For Local Users

If distributing as a ZIP file for offline use:
1. Extract the ZIP
2. Open `START.html` in any modern browser
3. All learning content works without internet
4. Progress saves to browser's localStorage
5. Use God Mode (console) or Master Key (5 clicks on black hole) for full access

---

*Last Updated: December 23, 2025*
