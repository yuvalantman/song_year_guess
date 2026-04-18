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

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
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
  // Add market parameter - use 'US' as default, but 'IL' works for Israeli content
  return apiCall<SpotifyPlaylist>(`/playlists/${playlistId}?market=IL`)
}

export async function getPlaylistTracks(
  playlistId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{ items: SpotifyTrack[]; total: number }> {
  const result = await apiCall<{
    items: Array<{ track: SpotifyTrack | null }>
    total: number
  }>(`/playlists/${playlistId}/tracks?market=IL&limit=${limit}&offset=${offset}`)

  if (!result || !result.items) {
    throw new Error('Invalid playlist data received from Spotify')
  }

  return {
    items: result.items
      .filter(item => item && item.track !== null)
      .map(item => item.track as SpotifyTrack),
    total: result.total || 0,
  }
}

export async function getAllPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
  const limit = 50
  let offset = 0
  let allTracks: SpotifyTrack[] = []
  let hasMore = true

  while (hasMore) {
    const { items, total } = await getPlaylistTracks(playlistId, limit, offset)
    allTracks = allTracks.concat(items)
    hasMore = allTracks.length < total
    offset += limit
  }

  return allTracks
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
