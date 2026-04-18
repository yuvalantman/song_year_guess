import { useState, useCallback } from 'react'
import { GameSession, GameMode } from '../types'
import {
  saveSession,
  loadSession,
  clearSession,
  createSession,
  updateCurrentTrack,
  setDetailsRevealed,
  getNextRandomTrack,
  hasPlaylistTracks,
} from '../services/sessionManager'

export function useGameSession() {
  const [session, setSession] = useState<GameSession | null>(loadSession())

  const startNewGame = useCallback(
    (playlistId: string, playlistName: string, mode: GameMode, trackIds: string[]) => {
      const newSession = createSession(playlistId, playlistName, mode, trackIds)
      setSession(newSession)
      saveSession(newSession)
    },
    []
  )

  const selectNextTrack = useCallback(() => {
    if (!session) return null

    const nextTrackId = getNextRandomTrack(session)
    if (!nextTrackId) return null

    const updatedSession = updateCurrentTrack(session, nextTrackId)
    setSession(updatedSession)
    saveSession(updatedSession)
    return nextTrackId
  }, [session])

  const revealDetails = useCallback(() => {
    if (!session) return

    const updatedSession = setDetailsRevealed(session, true)
    setSession(updatedSession)
    saveSession(updatedSession)
  }, [session])

  const hideDetails = useCallback(() => {
    if (!session) return

    const updatedSession = setDetailsRevealed(session, false)
    setSession(updatedSession)
    saveSession(updatedSession)
  }, [session])

  const endGame = useCallback(() => {
    clearSession()
    setSession(null)
  }, [])

  const canContinue = (): boolean => {
    return session !== null && hasPlaylistTracks(session)
  }

  return {
    session,
    startNewGame,
    selectNextTrack,
    revealDetails,
    hideDetails,
    endGame,
    canContinue,
    hasTracksRemaining: session ? hasPlaylistTracks(session) : false,
  }
}
