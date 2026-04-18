import { GameSession, GameMode } from '../types'

const SESSION_KEY = 'spotify_game_session'

export function saveSession(session: GameSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

export function loadSession(): GameSession | null {
  const stored = localStorage.getItem(SESSION_KEY)
  if (!stored) return null
  try {
    return JSON.parse(stored)
  } catch {
    return null
  }
}

export function clearSession(): void {
  localStorage.removeItem(SESSION_KEY)
}

export function createSession(
  playlistId: string,
  playlistName: string,
  mode: GameMode,
  trackIds: string[]
): GameSession {
  return {
    playlistId,
    playlistName,
    mode,
    currentTrackId: null,
    playedTrackIds: [],
    remainingTrackIds: trackIds,
    detailsRevealed: false,
    createdAt: Date.now(),
  }
}

export function updateCurrentTrack(session: GameSession, trackId: string): GameSession {
  return {
    ...session,
    currentTrackId: trackId,
    playedTrackIds: [...session.playedTrackIds, trackId],
    remainingTrackIds: session.remainingTrackIds.filter(id => id !== trackId),
    detailsRevealed: false,
  }
}

export function setDetailsRevealed(session: GameSession, revealed: boolean): GameSession {
  return {
    ...session,
    detailsRevealed: revealed,
  }
}

export function hasPlaylistTracks(session: GameSession): boolean {
  return session.remainingTrackIds.length > 0
}

export function getNextRandomTrack(session: GameSession): string | null {
  if (session.remainingTrackIds.length === 0) {
    return null
  }
  const randomIndex = Math.floor(Math.random() * session.remainingTrackIds.length)
  return session.remainingTrackIds[randomIndex]
}
