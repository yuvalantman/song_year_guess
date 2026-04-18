# Spotify Guess the Song

A mobile-friendly web app that plays songs from Spotify playlists and lets you guess the track, year, and artist. Built with React, TypeScript, Vite, and the Spotify Web Playback SDK.

## Features

- 🎵 **Real Spotify Integration** - Uses official Spotify APIs and Web Playback SDK
- 🎮 **Two Game Modes** - Start from beginning or random 30-second sample
- 📱 **Mobile-First Design** - Fully responsive, touch-friendly interface
- 🔐 **Secure OAuth** - Authorization Code flow with PKCE (no backend required)
- 💾 **Session Persistence** - Continue games using localStorage
- 🎯 **Public Playlists** - Use preconfigured or custom public Spotify playlists
- 🌙 **Dark Mode** - Spotify-themed dark interface

## Requirements

- **Spotify Premium Account** - Required for Web Playback SDK playback
- **Modern Browser** - Chrome, Firefox, Safari, Edge (latest versions)
- **Node.js** - 18+ for local development

## Setup

### 1. Create a Spotify Developer App

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Log in with your Spotify account (create one if needed)
3. Click "Create an App"
4. Accept the terms and create the app
5. Copy your **Client ID** (you'll need this)

### 2. Configure Redirect URIs

In your Spotify app settings:

**For Local Development:**
```
http://localhost:3000/callback
```

**For Production (Vercel):**
```
https://your-app-name.vercel.app/callback
```

Replace `your-app-name` with your actual Vercel project name.

### 3. Set Up Environment Variables

Create a `.env` file in the project root:

```env
VITE_SPOTIFY_CLIENT_ID=your_client_id_here
VITE_SPOTIFY_REDIRECT_URI=http://localhost:3000/callback
```

**Important:**
- Use `.env.example` as a template
- Never commit `.env` to version control
- Use `.env.local` for sensitive local overrides

### 4. Required Spotify Scopes

The app uses these scopes:

- `streaming` - Play tracks with Web Playback SDK
- `user-read-private` - Read user profile
- `user-read-email` - Read user email
- `user-read-playback-state` - Check playback state (optional)
- `user-modify-playback-state` - Control playback (optional)

These are automatically requested during OAuth flow.

## Running Locally

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

The app opens at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

Output goes to `dist/` folder.

### Preview Production Build

```bash
npm run preview
```

## Deployment to Vercel (Free Tier)

### 1. Prepare Git Repository

```bash
git init
git add .
git commit -m "Initial commit"
```

### 2. Push to GitHub

Create a repository on [GitHub](https://github.com/new) and push your code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/spotify-guess-the-song.git
git branch -M main
git push -u origin main
```

### 3. Deploy on Vercel

1. Go to [Vercel](https://vercel.com)
2. Click "New Project"
3. Select your GitHub repository
4. Configure environment variables:
   - Set `VITE_SPOTIFY_CLIENT_ID` to your Client ID
   - Set `VITE_SPOTIFY_REDIRECT_URI` to `https://your-project-name.vercel.app/callback`
5. Click "Deploy"

### 4. Update Spotify App Settings

Add the Vercel URL as a Redirect URI in [Spotify Developer Dashboard](https://developer.spotify.com/dashboard):

```
https://your-project-name.vercel.app/callback
```

### 5. Redeploy

After updating Spotify settings, trigger a redeployment on Vercel.

## How It Works

### Authentication Flow

1. User clicks "Login with Spotify"
2. App generates a PKCE code verifier and challenge
3. User authorizes the app on Spotify
4. Spotify redirects back with authorization code
5. App exchanges code for access token (PKCE flow, no backend needed)
6. Token stored in localStorage

### Game Session

1. User selects a playlist and game mode
2. App fetches all tracks from the playlist
3. Game session saved to localStorage
4. Tracks stored in session, no track is repeated
5. Each "Next Song" pick selects a random unused track
6. Session persists across page refreshes

### Playback

- **Start from Beginning** - Plays from position 0ms
- **Random 30-second Sample** - Seeks to random position allowing ~30s playback

**Note on Mobile Autoplay:**
- iOS Safari may require user gesture to start playback
- Click the "Next Song" button to trigger playback
- Web Playback SDK requires active user interaction first
- Some browsers require a "play" user gesture before audio can start

## Playlist Support

### Preconfigured Playlists

The app includes these preset playlists:
- 80s Greatest Hits
- 90s Throwback
- 2000s Essentials
- 2010s Hits
- 2020s Hits
- Indie Gems

### Add Custom Playlists

Paste any public Spotify playlist URL or URI:
- URL: `https://open.spotify.com/playlist/[ID]`
- URI: `spotify:playlist:[ID]`
- Raw ID: `[ID]`

**Important:** Only public playlists are supported. Private playlists cannot be used.

## Spotify Limitations

### Web Playback SDK

- **Premium Required** - Playback requires active Spotify Premium subscription
- **Device-Based** - Creates a Spotify Connect device in your account
- **Web Player Limited** - May have lower quality than desktop app
- **Concurrent Streams** - Only one active stream per account (standard Spotify behavior)

### Mobile Browsers

- **Autoplay Restrictions** - Most browsers require user gesture before audio plays
- **iOS Background** - Audio stops if app goes to background
- **Android Limitations** - Some devices have codec restrictions
- **30-Second Samples** - Exact timing depends on track duration and SDK behavior

### Track Playback

If a track fails to play:
- SDK will move to next track automatically
- Check if track is available in your region
- Verify you have active Spotify Premium
- Try refreshing page and reconnecting player

## Architecture

```
src/
├── services/
│   ├── spotifyAuth.ts      # OAuth2 PKCE flow
│   ├── spotifyAPI.ts       # Spotify Web API calls
│   ├── spotifyPlayer.ts    # Web Playback SDK integration
│   └── sessionManager.ts   # localStorage management
├── hooks/
│   ├── useSpotifyAuth.ts   # Auth state management
│   ├── useSpotifyPlayer.ts # Playback state management
│   └── useGameSession.ts   # Game session management
├── pages/
│   ├── SettingsPage.tsx    # Main settings and playlist selection
│   ├── GamePage.tsx        # Game interface
│   └── CallbackPage.tsx    # OAuth callback handler
├── types.ts                # TypeScript type definitions
├── index.css               # Global styles
├── App.tsx                 # Router and auth handling
└── main.tsx                # React entry point
```

## Development Notes

### No Backend Required

This is a frontend-only application:
- OAuth handled entirely by Spotify SDK
- PKCE prevents need for backend
- All state in localStorage
- Can be deployed as static files

### TypeScript

Full type safety for Spotify API responses and game state.

### CSS

Spotify-themed dark mode with mobile-first responsive design.

## Troubleshooting

### "Unauthorized" Error

- Access token expired (lasts ~1 hour)
- Logout and log back in
- Check `localStorage` has `spotify_access_token`

### Player Not Ready

- Close other Spotify apps/devices
- Premium account required
- Try refreshing page
- Check browser console for errors

### Playlist Not Found

- Ensure playlist is public (not private)
- Valid playlist URL/ID format required
- Playlist must have tracks

### No Sound on Mobile

- iOS: Tap "Next Song" to initiate playback
- Check volume isn't muted
- Verify Spotify Premium active
- Some networks block audio (enterprise WiFi)

### Token Security

- Tokens stored in localStorage (accessible via DevTools)
- Never share `.env` file with Client ID
- For production: use Vercel's secure environment variables
- Token is valid ~1 hour, request new after logout/refresh

## Official References

- [Spotify Web Playback SDK](https://developer.spotify.com/documentation/web-playback-sdk)
- [OAuth2 with PKCE](https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- [React Router](https://reactrouter.com/)
- [Vite](https://vitejs.dev/)

## License

MIT

## Support

For issues with Spotify integration, check:
1. [Spotify Web Playback SDK Docs](https://developer.spotify.com/documentation/web-playback-sdk)
2. Browser console for error messages
3. Verify Premium account active
4. Check internet connection

For app bugs, open an issue on GitHub.
