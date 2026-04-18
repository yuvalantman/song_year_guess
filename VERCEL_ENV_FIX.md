# Vercel Environment Variables - Quick Fix

## Error You Got

```
Invalid request: `env.VITE_SPOTIFY_CLIENT_ID` should be string.
```

This happens when environment variable values aren't plain strings.

## How to Fix

### In Vercel Dashboard:

1. **Go to Project Settings**
   - Click your project name
   - Click "Settings"
   - Click "Environment Variables" (left sidebar)

2. **Remove Any Existing Variables**
   - If you see `VITE_SPOTIFY_CLIENT_ID`, click the trash icon to delete it
   - If you see `VITE_SPOTIFY_REDIRECT_URI`, click the trash icon to delete it

3. **Add Variables (Correct Way)**

   **First Variable:**
   ```
   Name:  VITE_SPOTIFY_CLIENT_ID
   Value: abc123def456xyz789...
   ```
   - Copy/paste your actual Client ID (just the alphanumeric string)
   - No quotes, no brackets, no special characters
   - Select all environments (Production, Preview, Development)
   - Click "Add"

   **Second Variable:**
   ```
   Name:  VITE_SPOTIFY_REDIRECT_URI
   Value: https://my-spotify-game.vercel.app/callback
   ```
   - Replace `my-spotify-game` with your actual Vercel project name
   - Check all environments
   - Click "Add"

4. **Verify Both Are Listed**
   - You should see both variables in the "Environment Variables" list
   - Both should show as string type

5. **Redeploy**
   - Go to "Deployments"
   - Find the latest deployment
   - Click "..." menu → "Redeploy"

## Key Points

✅ **Plain strings only** - No quotes, brackets, or objects
✅ **Correct format** - `Name: VALUE` (not `Name: {description: ...}`)
✅ **All environments** - Select Production, Preview, Development
✅ **Actual values** - Use your real Client ID and project URL

## What NOT to Do

❌ Don't use quotes: `"abc123"` 
❌ Don't use objects: `{description: "..."}` 
❌ Don't use brackets: `[abc123]`
❌ Don't select only one environment
❌ Don't forget to redeploy after adding variables

## After Redeployment

Check if variables are working:
1. Open your Vercel app at `https://your-project.vercel.app`
2. Open browser DevTools (F12)
3. Check Console for errors
4. Try clicking "Login with Spotify"

## Still Getting Errors?

1. **Check Client ID**
   - Go to https://developer.spotify.com/dashboard
   - Make sure you copied the Client ID correctly
   - It should be alphanumeric, no spaces

2. **Check Project Name**
   - Vercel URL should be `https://YOUR-PROJECT-NAME.vercel.app`
   - Use that exact project name in redirect URI

3. **Check Spotify Settings**
   - Go to https://developer.spotify.com/dashboard
   - Click your app
   - Click "Edit Settings"
   - Verify `https://YOUR-PROJECT-NAME.vercel.app/callback` is listed under Redirect URIs

4. **Clear & Try Again**
   - Delete both environment variables from Vercel
   - Delete any old deployments in Vercel
   - Re-add variables with correct values
   - Trigger new deployment

## Questions?

See `DEPLOYMENT.md` for complete step-by-step instructions.
