import { useState, useEffect, useCallback } from 'react'
import { PlayerState } from '../types'
import {
  initializePlayer,
  playTrack,
  pausePlayback,
  resumePlayback,
  getPlaybackState,
  isPlayerInitialized,
  onPlayerError,
  removePlayerErrorListener,
} from '../services/spotifyPlayer'

export function useSpotifyPlayer(accessToken: string | null) {
  const [state, setState] = useState<PlayerState>({
    isReady: false,
    hasError: false,
    errorMessage: null,
    isPlaying: false,
    currentPosition: 0,
  })

  // Initialize player on mount and when token changes
  useEffect(() => {
    if (!accessToken || isPlayerInitialized()) {
      return
    }

    const handlePlayerError = (error: string) => {
      setState(prev => ({
        ...prev,
        hasError: true,
        errorMessage: error,
      }))
    }

    onPlayerError(handlePlayerError)

    initializePlayer(deviceId => {
      console.log('Player ready with device ID:', deviceId)
      setState(prev => ({
        ...prev,
        isReady: true,
        hasError: false,
        errorMessage: null,
      }))
    }).catch(err => {
      const errorMsg = err instanceof Error ? err.message : String(err)
      console.error('Failed to initialize player:', errorMsg)
      setState(prev => ({
        ...prev,
        hasError: true,
        errorMessage: errorMsg,
      }))
    })

    return () => {
      removePlayerErrorListener(handlePlayerError)
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

  return {
    ...state,
    play,
    pause,
    resume,
    checkState,
  }
}
