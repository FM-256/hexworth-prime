# GitHub OAuth Setup for Hexworth Prime

This guide walks through setting up GitHub OAuth integration for user authentication and cloud sync.

---

## Overview

Hexworth Prime uses GitHub OAuth to:
1. **Authenticate users** with their GitHub identity
2. **Display user profiles** (avatar, username) in the dashboard
3. **Enable cloud sync** of progress via GitHub Gists

---

## Step 1: Create a GitHub OAuth App

1. Go to **GitHub Developer Settings**:
   - https://github.com/settings/developers

2. Click **"New OAuth App"**

3. Fill in the application details:
   | Field | Value |
   |-------|-------|
   | **Application name** | `Hexworth Prime` |
   | **Homepage URL** | Your deployment URL (e.g., `https://yoursite.com`) |
   | **Authorization callback URL** | `https://github.com/login/device/callback` |
   | **Application description** | Educational platform for IT/Cybersecurity training |

4. Click **"Register application"**

5. Copy your **Client ID** (you'll need this in the next step)

> **Note:** For Device Flow authentication (which Hexworth uses), you don't need the Client Secret. The Device Flow is designed for client-side apps.

---

## Step 2: Configure Hexworth Prime

### Option A: Set Client ID via localStorage (Development)

Open browser console and run:
```javascript
localStorage.setItem('hexworth_github_client_id', 'YOUR_CLIENT_ID_HERE');
```

Then refresh the page.

### Option B: Hardcode Client ID (Production)

Edit `_app/dashboard.html` and find this section:
```javascript
githubAuth = new GitHubAuth({
    clientId: localStorage.getItem('hexworth_github_client_id') || 'YOUR_CLIENT_ID',
```

Replace `'YOUR_CLIENT_ID'` with your actual Client ID:
```javascript
githubAuth = new GitHubAuth({
    clientId: 'Iv1.abc123yourClientId',
```

### Option C: Environment-Based Config

Create a config file at `_app/config/github-config.js`:
```javascript
const GitHubConfig = {
    clientId: 'Iv1.abc123yourClientId',
    scopes: ['read:user', 'gist']
};
```

Then import it in dashboard.html and index.html.

---

## Step 3: Enable Device Flow

GitHub Device Flow must be enabled for your OAuth App:

1. Go to your OAuth App settings
2. Scroll to **"Device Flow"** section
3. Check **"Enable Device Flow"**
4. Save changes

---

## How It Works

### Authentication Flow

```
User clicks "Sign In"
        ↓
GitHubAuth.js initiates Device Flow
        ↓
User sees: "Enter code XXXX-YYYY at github.com/login/device"
        ↓
User visits GitHub, enters code
        ↓
GitHub authorizes the app
        ↓
GitHubAuth.js receives access token
        ↓
Profile is fetched and stored locally
        ↓
Avatar and username appear in dashboard header
```

### Token Storage

Tokens are stored in localStorage:
- `hexworth_github_token` - Access token
- `hexworth_github_profile` - Cached profile data
- `hexworth_username` - Username for display
- `hexworth_avatar` - Avatar URL

### Cloud Sync (Gists)

Once authenticated, users can:
- **Backup** progress to a private GitHub Gist
- **Restore** progress from any device
- **Auto-sync** on a configurable interval

Gist data includes:
- House assignment
- Module progress
- Streak data
- Achievements
- Settings preferences
- Dark Arts gate progress

---

## Scopes Required

| Scope | Purpose |
|-------|---------|
| `read:user` | Read GitHub profile (username, avatar, email) |
| `gist` | Create/update/read private Gists for cloud sync |

---

## Troubleshooting

### "Device flow is not enabled"
→ Enable Device Flow in your OAuth App settings (see Step 3)

### "Client ID invalid"
→ Verify the Client ID is correct and the app is registered

### "Authorization timeout"
→ User didn't enter the code in time (10 minutes limit). Try again.

### Profile not showing
→ Check browser console for errors. May need to re-authenticate.

---

## Security Notes

1. **Client ID is public** - It's safe to include in client-side code
2. **No Client Secret needed** - Device Flow doesn't require it
3. **Tokens stored locally** - Each user has their own token in their browser
4. **Gists are private** - Backups are created as private Gists by default
5. **Token scope is minimal** - Only read:user and gist permissions

---

## For Instructors

If deploying Hexworth Prime for a class:

1. Create **one OAuth App** for your deployment
2. Set the Client ID in the deployed code
3. Students authenticate with their own GitHub accounts
4. Progress syncs to their individual Gists

Consider creating a class-specific OAuth App with a descriptive name like:
- `Hexworth Prime - IT101 Fall 2025`

---

## Local Development

For local file:// URLs, Device Flow still works because it uses GitHub's hosted callback. Just:

1. Create an OAuth App
2. Enable Device Flow
3. Set any Homepage URL (e.g., `http://localhost:3000`)
4. The callback URL doesn't matter for Device Flow

---

## Alternative: Personal Access Token

Users can also authenticate with a Personal Access Token (PAT):

1. Go to https://github.com/settings/tokens/new
2. Create token with `read:user` and `gist` scopes
3. Click "Personal Access Token" in the login modal
4. Paste the token

This is useful for:
- Testing without OAuth App setup
- Users who prefer manual token management
- Environments where Device Flow is blocked

---

*Last updated: December 19, 2025*
