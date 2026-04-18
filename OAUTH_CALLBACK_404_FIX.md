# OAuth Callback 404 Error - Complete Guide

## What Happened

After you clicked "Yes, it's me" on Spotify, you got a **404 Not Found** error.

This happened because:
1. Spotify tried to redirect to: `https://your-project.vercel.app/callback?code=...`
2. Vercel looked for a physical `/callback` file
3. It didn't find one, so it returned 404
4. Your React app never got loaded

## Why It Happened

Vercel didn't know your app is a **Single-Page App (SPA)**.

In a regular website:
- `/callback` would be a physical HTML file
- Vercel would serve it directly

In a React SPA:
- All routes go through `index.html`
- React Router handles the navigation
- You need to tell Vercel: "For all URLs, serve index.html"

## The Fix

Updated `vercel.json` with SPA routing configuration:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**What this does**:
- `"source": "/(.*)"` - Match any URL
- `"destination": "/index.html"` - Serve index.html for all URLs
- React Router then handles the actual routing in JavaScript

## How to Deploy the Fix

### Option 1: Git Push (Recommended)

```bash
cd /c/Users/yuval/notebooks/Hitster

git add vercel.json
git commit -m "Fix: Add SPA routing for OAuth callback"
git push
```

Vercel auto-redeploys when you push.

### Option 2: Manual Redeploy (if git is unavailable)

1. Go to vercel.com
2. Click your project
3. Go to "Deployments" tab
4. Find the latest deployment
5. Click "..." menu → "Redeploy"

## Testing After Fix

1. **Wait for deployment** (1-2 minutes, watch for green checkmark)

2. **Hard refresh your browser**
   - Windows/Linux: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`

3. **Test the OAuth flow**
   - Open your Vercel app URL
   - Click "Login with Spotify"
   - Click "Yes, it's me"
   - Should redirect to home page ✓

4. **If still getting 404**
   - Check browser console (F12) for errors
   - Check Vercel logs: vercel.com → Project → Deployments → Logs
   - Hard refresh again

## What Gets Fixed

With this change:

✅ `/callback` route works (OAuth redirect)
✅ `/game` route works (game page)
✅ `/` route works (home/settings)
✅ Page refreshes work without 404
✅ Direct URL access works (e.g., paste URL in address bar)
✅ All React Router navigation works

## Why This Wasn't Needed Locally

Local development (`npm run dev`):
- Vite automatically does this routing
- All unmatched routes go to index.html
- That's why it worked locally

Production on Vercel:
- Vercel is a static file host
- It needs explicit configuration to do SPA routing
- That's why we need `rewrites` in vercel.json

## Vercel's "rewrites" Feature

**How it works**:
1. User requests any URL: `/callback`, `/game`, `/foo/bar`, etc.
2. Vercel matches it against the `source` pattern: `/(.*)`
3. It rewrites to `destination`: `/index.html`
4. Browser receives index.html
5. React loads and React Router takes over
6. React Router handles the actual routing

**Important**: The browser URL stays the same (e.g., `/callback`)
Only the file served changes (index.html instead of 404)

## Common Mistakes

❌ **Mistake 1**: Only adding `/callback` rewrite
- Won't fix `/game` or other routes
- Use `/(.*)`  to match all routes

❌ **Mistake 2**: Rewriting to wrong file
- Must rewrite to `/index.html`
- Must include the leading `/`

❌ **Mistake 3**: Not redeploying after changing vercel.json
- Changes to vercel.json don't auto-apply
- Must push to GitHub or manually redeploy

❌ **Mistake 4**: Not hard-refreshing after redeploy
- Browser caches the 404 page
- Use Ctrl+Shift+R to hard refresh
- Don't just refresh with F5

## If It Still Doesn't Work

1. **Verify vercel.json is correct**
   ```bash
   cat vercel.json
   ```
   Should show the `rewrites` section

2. **Check it was deployed**
   - vercel.com → Project → Deployments
   - Look for green checkmark (successful)
   - Check the deployment time is recent

3. **Check for other errors**
   - Browser console (F12) → Console tab
   - Check for JavaScript errors
   - Check for network errors (Network tab)

4. **Check Vercel logs**
   - vercel.com → Project → Deployments
   - Click latest deployment
   - Click "View Build Logs"
   - Look for build errors

5. **Test locally first**
   ```bash
   npm run build
   npm run preview
   ```
   Should work at http://localhost:5173

## Explanation for Future Reference

SPAs (Single-Page Apps) work differently than traditional websites:

**Traditional Website**:
```
GET /callback → Server returns /callback.html file → Browser shows it
```

**React SPA**:
```
GET /callback → Server returns /index.html → React loads → 
React Router matches /callback → React renders callback page
```

Vercel needs to be told: "For all URLs, serve index.html"

That's what `rewrites` does.

## Related Documentation

- Vercel SPA Configuration: https://vercel.com/docs/frameworks/vite#spa-behavior
- React Router: https://reactrouter.com/
- SPAs vs Traditional: https://developer.mozilla.org/en-US/docs/Glossary/SPA

---

**Quick Summary**: Push the updated `vercel.json`, wait for redeploy, hard refresh, test login. ✅
