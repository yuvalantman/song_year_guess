// Spotify OAuth2 with PKCE authentication
// Reference: https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || ''
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || ''
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize'
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token'
const SCOPES = [
  'streaming', // Required for Web Playback SDK
  'user-read-private', // To read user profile
  'user-read-email', // To read email
  'playlist-read-public', // To read public playlists
  'user-read-playback-state', // Optional, to check playback state
  'user-modify-playback-state', // Optional, to control playback
].join(' ')

if (!CLIENT_ID || !REDIRECT_URI) {
  console.warn('⚠️ VITE_SPOTIFY_CLIENT_ID or VITE_SPOTIFY_REDIRECT_URI not set in environment')
}

// PKCE utilities
function generateRandomString(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

async function generateCodeChallenge(codeVerifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(codeVerifier)
  const hash = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hash))
  const hashString = hashArray.map(b => String.fromCharCode(b)).join('')
  return btoa(hashString)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

export async function initiateLogin(): Promise<void> {
  if (!CLIENT_ID || !REDIRECT_URI) {
    throw new Error('Spotify credentials not configured')
  }

  const codeVerifier = generateRandomString(128)
  const codeChallenge = await generateCodeChallenge(codeVerifier)

  // Store code verifier in sessionStorage (not persisted)
  sessionStorage.setItem('spotify_code_verifier', codeVerifier)

  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    scope: SCOPES,
    show_dialog: 'true',
  })

  window.location.href = `${AUTH_ENDPOINT}?${params.toString()}`
}

export async function handleCallback(code: string): Promise<string> {
  const codeVerifier = sessionStorage.getItem('spotify_code_verifier')
  if (!codeVerifier) {
    throw new Error('Code verifier not found. Authorization may have been interrupted.')
  }

  if (!CLIENT_ID || !REDIRECT_URI) {
    throw new Error('Spotify credentials not configured')
  }

  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: 'authorization_code',
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    }).toString(),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error_description || 'Failed to exchange code for token')
  }

  const data = await response.json()
  sessionStorage.removeItem('spotify_code_verifier')
  return data.access_token
}

export function getStoredAccessToken(): string | null {
  return localStorage.getItem('spotify_access_token')
}

export function storeAccessToken(token: string): void {
  localStorage.setItem('spotify_access_token', token)
}

export function clearAccessToken(): void {
  localStorage.removeItem('spotify_access_token')
}

export function isLoggedIn(): boolean {
  return !!getStoredAccessToken()
}

