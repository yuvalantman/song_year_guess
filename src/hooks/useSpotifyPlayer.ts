import { useState, useEffect, useCallback, useRef } from 'react'
import { PlayerState } from '../types'
import {
  playTrack,
  pausePlayback,
  resumePlayback,
  getPlaybackState,
  setPlayerInstance,
  togglePlayback,
  restartTrack,
  setDeviceId,
} from '../services/spotifyPlayer'

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void
    Spotify?: {
      Player: any
    }
  }
}

export function useSpotifyPlayer(accessToken: string | null) {
  const [state, setState] = useState<PlayerState>({
    isReady: false,
    hasError: false,
    errorMessage: null,
    isPlaying: false,
    currentPosition: 0,
  })
  const playerRef = useRef<any>(null)

  // Initialize player on mount and when token changes
  useEffect(() => {
    if (!accessToken) {
      return
    }

    // Load SDK dynamically
    const script = document.createElement('script')
    script.src = 'https://sdk.scdn.co/spotify-player.js'
    script.async = true

    // Set callback BEFORE appending script
    window.onSpotifyWebPlaybackSDKReady = () => {
      console.log('✓ Spotify Web Playback SDK ready')

      if (!window.Spotify || !window.Spotify.Player) {
        const error = 'Spotify Player not available'
        console.error(error)
        setState(prev => ({
          ...prev,
          hasError: true,
          errorMessage: error,
        }))
        return
      }

      try {
        const player = new window.Spotify.Player({
          name: 'Hitster Game Player',
          getOAuthToken: (callback: (token: string) => void) => {
            callback(accessToken)
          },
          volume: 0.5,
        })

        playerRef.current = player
        setPlayerInstance(player)

        // Setup listeners
        player.addListener('ready', ({ device_id }: { device_id: string }) => {
          console.log('✓ Player ready with device ID:', device_id)
          setDeviceId(device_id)
          setState(prev => ({
            ...prev,
            isReady: true,
            hasError: false,
            errorMessage: null,
          }))
        })

        player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
          console.log('Device went offline:', device_id)
          setState(prev => ({
            ...prev,
            isReady: false,
          }))
        })

        player.addListener('player_state_changed', (state: any) => {
          if (state) {
            setState(prev => ({
              ...prev,
              isPlaying: state.paused === false,
              currentPosition: state.position_ms,
            }))
          }
        })

        player.addListener('initialization_error', ({ message }: { message: string }) => {
          console.error('Initialization Error:', message)
          setState(prev => ({
            ...prev,
            hasError: true,
            errorMessage: `Initialization Error: ${message}`,
          }))
        })

        player.addListener('authentication_error', ({ message }: { message: string }) => {
          console.error('Authentication Error:', message)
          setState(prev => ({
            ...prev,
            hasError: true,
            errorMessage: `Authentication Error: ${message}`,
          }))
        })

        player.addListener('account_error', ({ message }: { message: string }) => {
          console.error('Account Error:', message)
          setState(prev => ({
            ...prev,
            hasError: true,
            errorMessage: `Account Error: ${message}. Premium required.`,
          }))
        })

        player.addListener('playback_error', ({ message }: { message: string }) => {
          console.error('Playback Error:', message)
          setState(prev => ({
            ...prev,
            hasError: true,
            errorMessage: `Playback Error: ${message}`,
          }))
        })

        // Connect player
        player.connect().then((success: boolean) => {
          if (success) {
            console.log('✓ Connected to Spotify')
          } else {
            console.error('Failed to connect to Spotify')
            setState(prev => ({
              ...prev,
              hasError: true,
              errorMessage: 'Failed to connect to Spotify',
            }))
          }
        })
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error)
        console.error('Failed to create player:', errorMsg)
        setState(prev => ({
          ...prev,
          hasError: true,
          errorMessage: errorMsg,
        }))
      }
    }

    // Append script to load SDK
    document.body.appendChild(script)

    return () => {
      // Cleanup
      if (playerRef.current && typeof playerRef.current.disconnect === 'function') {
        playerRef.current.disconnect()
      }
    }
  }, [accessToken])

  const play = useCallback(
    async (trackUri: string, mode: 'beginning' | 'random-sample' = 'beginning') => {
      try {
        setState(prev => ({ ...prev, hasError: false, errorMessage: null }))
        await playTrack(trackUri, mode)
        setState(prev => ({ ...prev, isPlaying: true }))
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Playback failed'
        setState(prev => ({
          ...prev,
          hasError: true,
          errorMessage: errorMsg,
        }))
        throw error
      }
    },
    []
  )

  const pause = useCallback(async () => {
    try {
      await pausePlayback()
      setState(prev => ({ ...prev, isPlaying: false }))
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Pause failed'
      setState(prev => ({
        ...prev,
        hasError: true,
        errorMessage: errorMsg,
      }))
    }
  }, [])

  const resume = useCallback(async () => {
    try {
      await resumePlayback()
      setState(prev => ({ ...prev, isPlaying: true }))
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Resume failed'
      setState(prev => ({
        ...prev,
        hasError: true,
        errorMessage: errorMsg,
      }))
    }
  }, [])

  const checkState = useCallback(async () => {
    try {
      const playbackState = await getPlaybackState()
      if (playbackState) {
        setState(prev => ({
          ...prev,
          isPlaying: playbackState.is_playing,
          currentPosition: playbackState.position_ms,
        }))
      }
    } catch (error) {
      console.error('Failed to check playback state:', error)
    }
  }, [])

  const toggle = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, hasError: false, errorMessage: null }))
      await togglePlayback()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Toggle failed'
      setState(prev => ({
        ...prev,
        hasError: true,
        errorMessage: errorMsg,
      }))
    }
  }, [])

  const restart = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, hasError: false, errorMessage: null }))
      await restartTrack()
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Restart failed'
      setState(prev => ({
        ...prev,
        hasError: true,
        errorMessage: errorMsg,
      }))
    }
  }, [])

  return {
    ...state,
    play,
    pause,
    resume,
    toggle,
    restart,
    checkState,
  }
}
