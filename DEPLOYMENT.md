# Deployment Guide

Complete instructions for deploying Spotify Guess the Song to production.

## Table of Contents

1. [Local Development](#local-development)
2. [Vercel Deployment](#vercel-deployment)
3. [Other Hosting Options](#other-hosting-options)
4. [Troubleshooting](#troubleshooting)

---

## Local Development

### Prerequisites

- Node.js 18+
- Spotify Premium account
- Spotify Developer App

### Quick Start

1. **Copy environment template**
   ```bash
   cp .env.example .env.local
   ```

2. **Add your Spotify Client ID to .env.local**
   ```env
   VITE_SPOTIFY_CLIENT_ID=your_actual_client_id
   VITE_SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
   ```

3. **Install dependencies**
   ```bash
   npm install
   ```

4. **Add redirect URI to Spotify Developer Dashboard**
   - Go to https://developer.spotify.com/dashboard
   - Select your app
   - Click "Edit Settings"
   - Add Redirect URI: `http://localhost:3000/callback`
   - Save

5. **Start development server**
   ```bash
   npm run dev
   ```

   The app opens at `http://localhost:3000`

### Commands

```bash
npm run dev          # Start dev server on http://localhost:3000
npm run build        # Build for production (creates dist/ folder)
npm run preview      # Test production build locally
npm run setup-check  # Verify configuration
```

---

## Vercel Deployment

### Step 1: Prepare Repository

```bash
git init
git add .
git commit -m "Initial commit: Spotify Guess the Song"
```

Create a new repository on [GitHub](https://github.com/new) and push:

```bash
git remote add origin https://github.com/YOUR_USERNAME/spotify-guess-the-song.git
git branch -M main
git push -u origin main
```

### Step 2: Create Vercel Account

Go to [vercel.com](https://vercel.com) and sign up (free tier available).

### Step 3: Import Project on Vercel

1. Log into Vercel dashboard
2. Click "Add New..." → "Project"
3. Select "Import Git Repository"
4. Paste your GitHub repository URL
5. Click "Import"

Vercel auto-detects:
- **Framework**: Vite ✓
- **Build Command**: `npm run build` ✓
- **Output Directory**: `dist` ✓

### Step 4: Add Environment Variables

In Vercel project settings:

1. Click "Settings" → "Environment Variables"
2. Add two variables:

   **Variable 1:**
   - Name: `VITE_SPOTIFY_CLIENT_ID`
   - Value: Your actual Spotify Client ID
   - Environments: Production, Preview, Development
   - Click "Add"

   **Variable 2:**
   - Name: `VITE_SPOTIFY_REDIRECT_URI`
   - Value: `https://YOUR_VERCEL_PROJECT_NAME.vercel.app/callback`
   - Environments: Production, Preview, Development
   - Click "Add"

3. Click "Save"

Replace `YOUR_VERCEL_PROJECT_NAME` with your actual Vercel project name.

### Step 5: Update Spotify Developer App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Click your app
3. Click "Edit Settings"
4. Add Redirect URI:
   ```
   https://YOUR_VERCEL_PROJECT_NAME.vercel.app/callback
   ```
5. Click "Save"

### Step 6: Redeploy on Vercel

The environment variables are now set. Trigger a redeployment:

1. On Vercel project page, click "Deployments"
2. Find the latest deployment
3. Click "..." menu → "Redeploy"

Or push a new commit to auto-trigger:

```bash
git commit --allow-empty -m "Trigger Vercel redeployment"
git push
```

### Step 7: Test Production

Open `https://YOUR_VERCEL_PROJECT_NAME.vercel.app` and test:

1. Click "Login with Spotify"
2. Authorize app
3. Select playlist and start a game
4. Verify playback works

---

## Other Hosting Options

### Netlify

1. Create account at [netlify.com](https://netlify.com)
2. Connect GitHub repository
3. Build settings:
   - Build Command: `npm run build`
   - Publish Directory: `dist`
4. Add environment variables in Netlify dashboard
5. Add redirect URI to Spotify app

### GitHub Pages

**Note**: GitHub Pages hosts static files only. This works with the built `dist/` folder.

1. Fork the repository
2. Enable GitHub Pages in repository settings
3. Select source: deploy from `gh-pages` branch
4. Add deployment script to package.json
5. Note: Must use different redirect URI (GitHub Pages URL)

### AWS Amplify, Firebase Hosting, etc.

All work similarly:
- Build: `npm run build`
- Output: `dist/` folder
- Add environment variables
- Update Spotify redirect URI

---

## Key Configuration Points

### Redirect URI Changes

**Local Development:**
```
http://localhost:3000/callback
```

**Production (Vercel):**
```
https://your-project.vercel.app/callback
```

**Production (Other hosts):**
```
https://your-custom-domain.com/callback
```

**Important**: Every redirect URI must be registered in Spotify Developer Dashboard.

### Environment Variables

Two environment variables control the app:

| Variable | Local | Production | Example |
|----------|-------|-----------|---------|
| `VITE_SPOTIFY_CLIENT_ID` | Your Client ID | Same | `abc123def456...` |
| `VITE_SPOTIFY_REDIRECT_URI` | `http://localhost:3000/callback` | `https://your-host.com/callback` | Production URL |

These must match what's registered in Spotify Developer Dashboard.

---

## Troubleshooting Deployment

### "Unauthorized" or "Invalid credentials"

**Cause**: Environment variables not set or incorrect
**Fix**: 
1. Verify env vars in host dashboard
2. Verify Client ID is correct
3. Redeploy after changing env vars

### "Redirect URI mismatch"

**Cause**: URL in code doesn't match Spotify settings
**Fix**:
1. Check host URL matches redirect URI
2. Add URL to Spotify Dashboard
3. Wait a moment for Spotify to register change
4. Try again

### "Player not ready" / "Premium required"

**Cause**: User doesn't have Spotify Premium
**Fix**:
1. Verify user has active Spotify Premium subscription
2. Try logging in with different Premium account
3. Check Spotify website to confirm subscription status

### Blank screen on load

**Cause**: JavaScript files not loading from `dist/`
**Fix**:
1. Verify build was successful: `npm run build` outputs files
2. Check host is serving `dist/index.html` as fallback
3. Check browser console (F12) for errors

### Environment variables not working

**Cause**: Variables not set in host dashboard
**Fix**:
1. Verify variable names match exactly: `VITE_SPOTIFY_CLIENT_ID`, `VITE_SPOTIFY_REDIRECT_URI`
2. Ensure variables are visible to build process
3. Rebuild after setting variables
4. Check local `.env.local` works first with `npm run dev`

---

## Performance Notes

Production build creates:
- **dist/index.html** - Main HTML file (~0.5 KB)
- **dist/assets/index-*.css** - Styling (~5 KB gzipped)
- **dist/assets/index-*.js** - React app (~58 KB gzipped)

Total: ~65 KB gzipped - very fast to load.

Vercel free tier provides:
- ✅ Unlimited bandwidth
- ✅ Automatic HTTPS
- ✅ CDN distribution
- ✅ Environment variables
- ✅ Git integration

---

## Security Notes

- ✅ Client ID safe in environment variables
- ✅ PKCE flow prevents backend secret requirement
- ✅ Access tokens stored in localStorage (browser-side)
- ✅ No sensitive data exposed in code
- ✅ No hardcoded credentials
- ✅ Follows Spotify OAuth2 best practices

**Token Lifespan**: Access tokens last ~1 hour. After that, user re-logs in.

---

## Support

For deployment issues:

1. Check Vercel/host deployment logs
2. Check browser console (F12) for JavaScript errors
3. Verify environment variables in host dashboard
4. Verify Spotify redirect URI is registered
5. Test locally first: `npm run dev`

For Spotify SDK issues:
- Check [official documentation](https://developer.spotify.com/documentation/web-playback-sdk)
- Verify Premium account
- Try different browser
- Clear localStorage and re-login

---

## Next Steps

1. Customize playlist presets in `src/pages/SettingsPage.tsx`
2. Adjust colors in `src/index.css`
3. Add custom domain (DNS CNAME to Vercel)
4. Monitor usage in Vercel dashboard
5. Consider upgrading Spotify app if needed

Good luck! 🎵
