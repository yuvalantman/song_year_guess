// Spotify Web Playback SDK Integration
// Reference: https://developer.spotify.com/documentation/web-playback-sdk
// Reference: https://developer.spotify.com/documentation/web-playback-sdk/reference#spotifyplayer
// Reference: https://github.com/spotify/spotify-web-playback-sdk-example

import { getStoredAccessToken } from './spotifyAuth'

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void
    Spotify: {
      Player: new (config: SpotifyPlayerConfig) => SpotifyPlayerInstance
    }
  }
}

// Based on official SDK reference
interface SpotifyPlayerConfig {
  name: string
  getOAuthToken: (callback: (token: string) => void) => void
  volume?: number
}

interface SpotifyPlayerInstance {
  addListener: (
    event: string,
    callback: (state: unknown) => void
  ) => void
  removeListener: (
    event: string,
    callback?: (state: unknown) => void
  ) => boolean
  connect: () => Promise<boolean>
  disconnect: () => void
  getCurrentState: () => Promise<PlaybackState | null>
  getVolume: () => Promise<number>
  pause: () => Promise<void>
  play: (options?: PlayOptions) => Promise<void>
  resume: () => Promise<void>
  seek: (position_ms: number) => Promise<void>
  setVolume: (volume: number) => Promise<void>
  togglePlay: () => Promise<void>
}

interface PlayOptions {
  context_uri?: string
  uris?: string[]
  offset?: number
  position_ms?: number
}

// Based on official SDK reference - Playback State
export interface PlaybackState {
  context: {
    type: string
    external_urls: { spotify: string }
    href: string
    uri: string
  }
  currently_playing_type: string
  device: {
    id: string
    is_active: boolean
    is_private_session: boolean
    is_restricted: boolean
    name: string
    supports_volume: boolean
    type: string
    volume_percent: number
  }
  disallows: {
    pausing: boolean
    peeking: boolean
    resuming: boolean
    seeking: boolean
    skipping_next: boolean
    skipping_prev: boolean
    toggling_repeat_context: boolean
    toggling_repeat_track: boolean
    toggling_shuffle: boolean
    transferring_playback: boolean
  }
  is_playing: boolean
  item: {
    album: {
      external_urls: { spotify: string }
      href: string
      id: string
      images: Array<{
        height: number | null
        url: string
        width: number | null
      }>
      name: string
      release_date: string
      release_date_precision: string
      total_tracks: number
      type: string
      uri: string
    }
    artists: Array<{
      external_urls: { spotify: string }
      href: string
      id: string
      name: string
      type: string
      uri: string
    }>
    disc_number: number
    duration_ms: number
    explicit: boolean
    external_ids: { isrc: string }
    external_urls: { spotify: string }
    href: string
    id: string
    is_local: boolean
    is_playable: boolean
    name: string
    preview_url: string | null
    track_number: number
    type: string
    uri: string
  }
  pause_reason: string
  position_ms: number
  repeat_state: string
  restrictions: { reason: string }
  shuffle: boolean
  timestamp: number
}

interface PlayerReadyEvent {
  device_id: string
}

// Player instance management
let playerInstance: SpotifyPlayerInstance | null = null
const playerReadyCallbacks: Array<(deviceId: string) => void> = []
const playerErrorCallbacks: Array<(error: string) => void> = []

/**
 * Initialize Spotify Web Playback SDK player
 * Must be called after SDK is loaded and user is authenticated
 */
export function initializePlayer(onReady?: (deviceId: string) => void): Promise<SpotifyPlayerInstance> {
  return new Promise((resolve, reject) => {
    // Check if SDK is loaded
    if (!window.Spotify || !window.Spotify.Player) {
      const error = 'Spotify Web Playback SDK not loaded. Make sure it\'s included in index.html'
      console.error(error)
      reject(new Error(error))
      return
    }

    if (onReady) {
      playerReadyCallbacks.push(onReady)
    }

    const token = getStoredAccessToken()
    if (!token) {
      reject(new Error('Not authenticated - no access token'))
      return
    }

    const config: SpotifyPlayerConfig = {
      name: 'Spotify Guess the Song Player',
      getOAuthToken: callback => {
        const currentToken = getStoredAccessToken()
        if (currentToken) {
          callback(currentToken)
        }
      },
      volume: 0.5,
    }

    try {
      playerInstance = new window.Spotify.Player(config)

      // Setup event listeners
      // Reference: https://developer.spotify.com/documentation/web-playback-sdk/reference#events

      playerInstance.addListener('player_state_changed', (state: unknown) => {
        const playbackState = state as PlaybackState | null
        if (playbackState) {
          console.log('Player state changed:', {
            isPlaying: playbackState.is_playing,
            currentTrack: playbackState.item?.name,
            position: playbackState.position_ms,
          })
        }
      })

      playerInstance.addListener('initialization_error', (error: unknown) => {
        const errorMsg = `Initialization Error: ${JSON.stringify(error)}`
        console.error(errorMsg)
        playerErrorCallbacks.forEach(cb => cb(errorMsg))
      })

      playerInstance.addListener('authentication_error', (error: unknown) => {
        const errorMsg = `Authentication Error: ${JSON.stringify(error)}`
        console.error(errorMsg)
        playerErrorCallbacks.forEach(cb => cb(errorMsg))
      })

      playerInstance.addListener('account_error', (error: unknown) => {
        const errorMsg = `Account Error: ${JSON.stringify(error)}. Spotify Premium required.`
        console.error(errorMsg)
        playerErrorCallbacks.forEach(cb => cb(errorMsg))
      })

      playerInstance.addListener('playback_error', (error: unknown) => {
        const errorMsg = `Playback Error: ${JSON.stringify(error)}`
        console.error(errorMsg)
        playerErrorCallbacks.forEach(cb => cb(errorMsg))
      })

      playerInstance.addListener('ready', (data: unknown) => {
        const readyData = data as PlayerReadyEvent
        console.log('✓ Web Playback SDK ready with device ID:', readyData.device_id)
        playerReadyCallbacks.forEach(cb => cb(readyData.device_id))
      })

      // Connect player to Spotify
      playerInstance.connect().then(success => {
        if (success) {
          console.log('✓ Connected to Spotify')
          resolve(playerInstance!)
        } else {
          reject(new Error('Failed to connect Web Playback SDK player'))
        }
      })
    } catch (error) {
      const errorMsg = `Failed to initialize player: ${error instanceof Error ? error.message : String(error)}`
      console.error(errorMsg)
      reject(new Error(errorMsg))
    }
  })
}

export function getPlayer(): SpotifyPlayerInstance | null {
  return playerInstance
}

/**
 * Play a track with optional playback mode
 */
export async function playTrack(
  trackUri: string,
  mode: 'beginning' | 'random-sample' = 'beginning'
): Promise<void> {
  if (!playerInstance) {
    throw new Error('Player not initialized. Call initializePlayer first.')
  }

  try {
    const playOptions: PlayOptions = {
      uris: [trackUri],
    }

    // For beginning mode, explicitly set position to 0
    if (mode === 'beginning') {
      playOptions.position_ms = 0
    }

    await playerInstance.play(playOptions)

    // For random sample mode, wait for playback to start then seek to random position
    if (mode === 'random-sample') {
      await new Promise(resolve => setTimeout(resolve, 500))

      try {
        const state = await playerInstance.getCurrentState()
        if (state && state.item) {
          const duration = state.item.duration_ms
          // Seek to random position, ensuring at least 30 seconds can play
          const maxStartTime = Math.max(0, duration - 30000)
          // Use up to 70% of track length as max start point
          const randomStart = Math.floor(Math.random() * Math.min(maxStartTime, duration * 0.7))

          if (randomStart > 0) {
            await playerInstance.seek(randomStart)
          }
        }
      } catch (err) {
        console.warn('Could not seek to random position:', err)
        // Continue anyway - playback has started
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error)
    console.error('Playback error:', errorMsg)
    throw error
  }
}

export async function pausePlayback(): Promise<void> {
  if (!playerInstance) {
    throw new Error('Player not initialized')
  }
  await playerInstance.pause()
}

export async function resumePlayback(): Promise<void> {
  if (!playerInstance) {
    throw new Error('Player not initialized')
  }
  await playerInstance.resume()
}

export async function getPlaybackState(): Promise<PlaybackState | null> {
  if (!playerInstance) {
    return null
  }
  return playerInstance.getCurrentState()
}

export function isPlayerInitialized(): boolean {
  return playerInstance !== null
}

export function onPlayerError(callback: (error: string) => void): void {
  playerErrorCallbacks.push(callback)
}

export function removePlayerErrorListener(callback: (error: string) => void): void {
  const index = playerErrorCallbacks.indexOf(callback)
  if (index > -1) {
    playerErrorCallbacks.splice(index, 1)
  }
}
