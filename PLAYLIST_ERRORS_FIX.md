# Playlist Errors - Troubleshooting Guide

## Errors You're Getting

1. **"Forbidden"** (403 error)
2. **"Resource not found"** (404 error)
3. **"Cannot read properties of undefined (reading 'map')"**

## Root Causes & Solutions

### Error 1: "Forbidden" (403)

**What it means**: You don't have permission to access this playlist.

**Common causes**:
- ❌ Playlist is **private** (not public)
- ❌ You don't own the playlist and it's restricted
- ❌ The playlist has been deleted

**How to fix**:
1. Go to the playlist on Spotify
2. Click the **three dots** (•••) menu
3. Check if it says **"Private"**
4. If private, you CANNOT use it with this app
5. The app only supports **PUBLIC** playlists
6. To make it public:
   - Click **Make Public**
   - Confirm

**To verify it's public**:
- On Spotify, look for the **globe icon** 🌍 next to the playlist name
- If you see a **lock icon** 🔒, it's private

---

### Error 2: "Playlist not found" (404)

**What it means**: The playlist doesn't exist or the ID is invalid.

**Common causes**:
- ❌ Playlist ID is wrong or incomplete
- ❌ Playlist has been deleted
- ❌ URL was copied incorrectly

**How to fix**:

**If using a URL**:
```
Full URL: https://open.spotify.com/playlist/2cWeR42ZOxYxzS1WqSNrix?si=3ef895a9cddd408a
                                                   ↓
Correct to paste: https://open.spotify.com/playlist/2cWeR42ZOxYxzS1WqSNrix
                  or just: 2cWeR42ZOxYxzS1WqSNrix
```

**Remove the query parameter** (`?si=...`) - it's not needed.

**If using a URI**:
```
Correct: spotify:playlist:2cWeR42ZOxYxzS1WqSNrix
Wrong: spotify:playlist:2cWeR42ZOxYxzS1WqSNrix?si=3ef895a9cddd408a
```

**If using just an ID**:
```
Correct: 2cWeR42ZOxYxzS1WqSNrix
Wrong: 2cWeR42ZOxYxzS1WqSNrix?si=3ef895a9cddd408a
```

---

### Error 3: "Cannot read properties of undefined (reading 'map')"

**What it means**: The app tried to process playlist tracks but got empty data.

**Common causes**:
- Playlist has no tracks
- API response was invalid
- Playlist is empty

**How to fix**:
1. Check if the playlist has tracks on Spotify
2. Make sure the playlist has at least 1 song
3. Try a different public playlist
4. Try one of the preset playlists first to test

---

## Testing Steps

### Step 1: Test with a Preset Playlist

The preset playlists are all official Spotify playlists and should work:

1. Go to settings page
2. Select **"80s Greatest Hits"** from dropdown
3. Select game mode
4. Click **"Start New Game"**

If this works, the issue is with the specific playlist you're trying to add.

### Step 2: Test with a Custom Playlist

If presets work, try adding a custom one:

1. Find a PUBLIC playlist on Spotify
2. Copy the **playlist link**: `https://open.spotify.com/playlist/XXXXX`
3. In the app, paste just the link (not the full URL with `?si=...`)
4. Click **"Add"**
5. If it loads, select it and start a game

### Step 3: Verify the Playlist is Public

The MOST COMMON issue is using a PRIVATE playlist.

**To check**:
1. Go to playlist on Spotify
2. Click **three dots** (•••)
3. Look for "Private" badge
4. If it says "Private", you must make it public
5. In Spotify, click **"Make Public"**

---

## Correct Playlist Format

### What You Should Paste

| Format | Example | ✅/❌ |
|--------|---------|-------|
| Full URL | `https://open.spotify.com/playlist/2cWeR42ZOxYxzS1WqSNrix?si=3ef895a9cddd408a` | ✅ Works |
| URL without params | `https://open.spotify.com/playlist/2cWeR42ZOxYxzS1WqSNrix` | ✅ Works |
| Just ID | `2cWeR42ZOxYxzS1WqSNrix` | ✅ Works |
| Spotify URI | `spotify:playlist:2cWeR42ZOxYxzS1WqSNrix` | ✅ Works |
| ID with params | `2cWeR42ZOxYxzS1WqSNrix?si=3ef895a9cddd408a` | ❌ Wrong |

The app automatically strips everything after the ID, so including `?si=...` shouldn't matter, but it's cleaner to paste just the ID.

---

## Step-by-Step: Adding a Playlist

### From Spotify Desktop/Web:

1. Find a PUBLIC playlist
2. Right-click (or three dots menu)
3. Click **"Copy Link to Playlist"** or **"Share"** → **"Copy Playlist Link"**
4. In the app, paste into the custom playlist field
5. Click **"Add"**

### From Mobile Spotify:

1. Go to playlist
2. Click **"..."** menu
3. Click **"Share"**
4. Copy the link
5. In the app, paste the link
6. Click **"Add"**

---

## Common Mistakes

### ❌ Mistake 1: Using a Private Playlist
```
Your Created Playlist → Private by default
```
**Fix**: Make it public in Spotify settings

### ❌ Mistake 2: Copying the Wrong Thing
```
Copied: https://open.spotify.com/user/yourname
Should copy: https://open.spotify.com/playlist/ID
```
**Fix**: Make sure you're copying the playlist link, not the user profile

### ❌ Mistake 3: Playlist Has No Tracks
```
Empty playlist with 0 songs
```
**Fix**: Add songs to the playlist first

### ❌ Mistake 4: Old/Deleted Playlist
```
Playlist was deleted or archived
```
**Fix**: Use a different playlist

---

## What to Do If It Still Doesn't Work

1. **Check the browser console** (F12 → Console tab)
   - Look for the actual error message
   - Copy the error and note it

2. **Try a preset playlist first**
   - If presets work, the issue is the custom playlist
   - If presets don't work, there's a broader issue

3. **Check Spotify account**
   - Make sure you're logged into the app with the correct account
   - Make sure the playlist is accessible from that account

4. **Check internet connection**
   - Make sure you have a stable connection
   - Try refreshing the page

5. **Log out and log back in**
   - Your token might have expired
   - Click "Logout"
   - Click "Login with Spotify" again

---

## Testing Public Playlists

These are guaranteed to be public and work:

- 80s Greatest Hits
- 90s Throwback
- 2000s Essentials
- 2010s Hits
- 2020s Hits
- Indie Gems

Try these first to make sure everything is working.

---

## Summary

| Error | Cause | Fix |
|-------|-------|-----|
| Forbidden (403) | Private playlist | Make it public |
| Not Found (404) | Invalid/deleted playlist | Use correct ID |
| Map error | Empty/no tracks | Add songs to playlist |

**Most likely**: Your playlist is **PRIVATE**. Make it **PUBLIC** in Spotify settings. 🔓

---

## Still Stuck?

1. Use a preset playlist (guaranteed to work)
2. Check console for detailed error messages (F12)
3. Verify the playlist is PUBLIC on Spotify
4. Log out and log back in
5. Try a different browser
6. Check internet connection

Good luck! 🎵
