import { SpotifyUser, SpotifyPlaylist, SpotifyTrack } from '../types'
import { getStoredAccessToken } from './spotifyAuth'

const API_BASE = 'https://api.spotify.com/v1'

async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getStoredAccessToken()
  if (!token) {
    throw new Error('Not authenticated')
  }

  console.log('API Call Debug:', {
    endpoint: `${API_BASE}${endpoint}`,
    tokenLength: token.length,
    tokenStart: token.substring(0, 20) + '...',
  })

  const headers: HeadersInit = {
    Authorization: `Bearer ${token}`,
  }

  // Only add Content-Type for requests with a body (POST, PUT, PATCH)
  if (options.body && !('Content-Type' in (options.headers || {}))) {
    Object.assign(headers, { 'Content-Type': 'application/json' })
  }

  // Merge with any existing headers from options
  if (options.headers) {
    Object.assign(headers, options.headers)
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Unauthorized - your Spotify session expired. Please log in again.')
    }
    if (response.status === 403) {
      throw new Error('Forbidden - you don\'t have access to this playlist. Make sure it\'s public.')
    }
    if (response.status === 404) {
      throw new Error('Playlist not found - the playlist doesn\'t exist or the ID is invalid.')
    }
    const error = await response.json().catch(() => ({}))
    const errorMsg = error.error?.message || response.statusText
    throw new Error(`${errorMsg} (${response.status})`)
  }


  return response.json()
}

export async function getCurrentUser(): Promise<SpotifyUser> {
  return apiCall<SpotifyUser>('/me')
}

export async function getPlaylist(playlistId: string): Promise<SpotifyPlaylist> {
  return apiCall<SpotifyPlaylist>(`/playlists/${playlistId}`)
}

export async function getAllPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
  // Get the playlist which includes items in the response
  const playlist = await apiCall<{
    items: {
      items: Array<{ track: SpotifyTrack | null }>
      total: number
    }
  }>(`/playlists/${playlistId}`)

  // Extract tracks from the playlist items
  if (!playlist.items || !playlist.items.items) {
    return []
  }

  const tracks = playlist.items.items
    .filter(item => item && item.track !== null)
    .map(item => item.track as SpotifyTrack)

  return tracks
}

export function parsePlaylistId(input: string): string | null {
  // Handle spotify:playlist:ID format
  if (input.startsWith('spotify:playlist:')) {
    return input.replace('spotify:playlist:', '')
  }

  // Handle https://open.spotify.com/playlist/ID format
  const urlMatch = input.match(/\/playlist\/([a-zA-Z0-9]+)/)
  if (urlMatch) {
    return urlMatch[1]
  }

  // Raw ID
  if (/^[a-zA-Z0-9]+$/.test(input)) {
    return input
  }

  return null
}
