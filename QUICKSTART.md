# Quick Start Guide

## Prerequisites

- Node.js 18+ installed
- Spotify Premium account
- Spotify Developer account

## Step 1: Create Spotify Developer App (2 minutes)

1. Go to https://developer.spotify.com/dashboard
2. Log in with Spotify (create account if needed)
3. Click **"Create an App"**
4. Accept terms and create
5. You'll see your **Client ID** - copy it

## Step 2: Configure Local Development (1 minute)

1. In the project root, copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Open `.env.local` and fill in your **Client ID**:
   ```env
   VITE_SPOTIFY_CLIENT_ID=your_client_id_here
   VITE_SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
   ```

## Step 3: Add Redirect URI to Spotify App (1 minute)

1. Go back to https://developer.spotify.com/dashboard
2. Click your app
3. Go to "Edit Settings"
4. Find "Redirect URIs"
5. Add: `http://localhost:3000/callback`
6. Click "Save"

## Step 4: Install Dependencies (2 minutes)

```bash
npm install
```

## Step 5: Run Development Server (instant)

```bash
npm run dev
```

The app opens automatically at `http://localhost:3000`

## Step 6: Test the App (5 minutes)

1. Click **"Login with Spotify"**
2. Authorize the app
3. Select a playlist
4. Choose game mode
5. Click **"Start New Game"**
6. Click **"Next Song"** to play
7. Click **"Reveal Details"** to see answer

---

## Deployment to Vercel (5 minutes)

### Prerequisites
- GitHub account
- Vercel account (free at vercel.com)

### Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   ```
   Then create a repo on github.com and push

2. **Deploy on Vercel**
   - Go to vercel.com
   - Click "New Project"
   - Select your GitHub repo
   - Vercel auto-detects Next.js? No, it's Vite
   - Configuration:
     - **Build Command**: `npm run build` (should auto-fill)
     - **Output Directory**: `dist` (should auto-fill)

3. **Add Environment Variables in Vercel Dashboard**
   
   Go to **Settings → Environment Variables** and add:
   
   **Name**: `VITE_SPOTIFY_CLIENT_ID`
   **Value**: `abc123def456...` (your actual Client ID - just the ID, no quotes)
   **Environments**: Check all (Production, Preview, Development)
   **Click**: Add
   
   **Name**: `VITE_SPOTIFY_REDIRECT_URI`
   **Value**: `https://YOUR_PROJECT_NAME.vercel.app/callback`
   **Environments**: Check all (Production, Preview, Development)
   **Click**: Add
   
   ⚠️ **Important**: Use plain string values, no quotes or special formatting

4. **Update Spotify Redirect URI**
   - Go to https://developer.spotify.com/dashboard
   - Click your app → Edit Settings
   - Add redirect URI: `https://your-project.vercel.app/callback`
   - Save

5. **Redeploy on Vercel**
   - Push a new commit or click "Redeploy" to apply env changes

Done! Your app is live at `https://your-project.vercel.app`

---

## Troubleshooting

### "Login with Spotify" button does nothing
- Check browser console for errors (F12)
- Verify `VITE_SPOTIFY_CLIENT_ID` is set
- Verify `.env.local` file exists (not `.env`)

### "Account Error" after login
- Your Spotify account needs **Premium** subscription
- Free accounts cannot use Web Playback SDK

### "Not Authenticated" error
- Refresh the page
- Try logging in again
- Clear browser localStorage

### No sound in browser
- Premium required
- Try different browser (Chrome recommended)
- Check volume isn't muted
- Verify you're not running other Spotify apps

---

## Commands

```bash
npm run dev        # Start local development server
npm run build      # Build for production
npm run preview    # Test production build locally
```

## File Structure

```
src/
├── services/      # Spotify API, Auth, Player
├── hooks/         # React state management
├── pages/         # Main app pages
├── types.ts       # TypeScript definitions
└── index.css      # Global styles
```

## Next Steps

- Customize playlist presets in `src/pages/SettingsPage.tsx`
- Adjust styling in `src/index.css`
- Deploy to Vercel for free hosting

Good luck! 🎵
