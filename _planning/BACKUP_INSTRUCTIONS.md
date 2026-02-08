# Hexworth Prime - Backup & Recovery Instructions

**Created:** February 5, 2026
**Stable Checkpoint:** v3.10.6-stable
**Commit:** 8fe4142

---

## Current Stable Version

**Tag:** `v3.10.6-stable`
**Date:** February 5, 2026
**Deployed To:** https://hexworth-prime.web.app

### Features Working at This Checkpoint

- Handler Dashboard with full class management
- Roster management (add/remove students, CSV export)
- Assignment system (create, assign, track)
- Progress tracking with Firestore sync
- Student detail modal with per-assignment breakdown
- All CSV exports (roster, grades, progress summary)
- Print-friendly class summary report
- CLH Course Home with 31 modules across 7 tiers
- CLH category modal (Course Home / Browse Modules / Cancel)
- Handler status syncs to Firebase (survives localStorage clears)
- Student join flow + auto-sync progress to Firestore
- Content Browser with full search/filter
- All 9 houses fully linked (378+ modules)

---

## Quick Revert (Keep History)

If something breaks and you want to deploy the stable version while keeping git history:

```bash
cd "/home/eq/Ai content creation/Hexworth Prime"

# Checkout the stable tag (detached HEAD)
git checkout v3.10.6-stable

# Deploy this version
firebase deploy --only hosting

# Return to master when ready to continue development
git checkout master
```

---

## Hard Reset (Discard All Changes Since Checkpoint)

If things are badly broken and you want to completely reset to the stable version:

```bash
cd "/home/eq/Ai content creation/Hexworth Prime"

# Reset master to the stable checkpoint
git reset --hard v3.10.6-stable

# Force push to remote (WARNING: destroys commits after this point)
git push --force origin master

# Deploy
firebase deploy --only hosting
```

**WARNING:** This permanently deletes all commits made after v3.10.6-stable. Only use if you cannot identify/fix the issue.

---

## View Tag Info

```bash
# See tag details
git show v3.10.6-stable

# List all tags
git tag -l

# See commit the tag points to
git rev-parse v3.10.6-stable
```

---

## Create New Stable Checkpoint

When you reach another stable state worth preserving:

```bash
# Create annotated tag
git tag -a v3.X.X-stable -m "STABLE CHECKPOINT: Brief description

Features working:
- Feature 1
- Feature 2

Deployed: [Date]
Commit: [hash]"

# Push tag to remote
git push origin v3.X.X-stable
```

---

## Firebase Rollback (Alternative)

Firebase Hosting keeps previous deployments. You can rollback via the Firebase Console:

1. Go to https://console.firebase.google.com/project/hexworth-prime/hosting
2. Click "Release history"
3. Find the deployment from February 5, 2026 (v3.10.6)
4. Click the three-dot menu → "Rollback"

This is faster than git checkout + deploy if you just need the site working immediately.

---

## Emergency Contacts / Resources

- **Firebase Console:** https://console.firebase.google.com/project/hexworth-prime
- **GitHub Repo:** https://github.com/FM-256/hexworth-prime
- **Live Site:** https://hexworth-prime.web.app

---

## Checkpoint History

| Tag | Date | Commit | Notes |
|-----|------|--------|-------|
| v3.10.6-stable | Feb 5, 2026 | 8fe4142 | Handler Dashboard complete, CLH Course Home, Firebase handler sync |

*Add new checkpoints to this table as they're created.*
