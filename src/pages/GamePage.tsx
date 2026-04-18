import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getAllPlaylistTracks } from '../services/spotifyAPI'
import { useGameSession } from '../hooks/useGameSession'
import { useSpotifyPlayer } from '../hooks/useSpotifyPlayer'
import { SpotifyTrack } from '../types'

interface Props {
  accessToken: string | null
}

export default function GamePage({ accessToken }: Props) {
  const navigate = useNavigate()
  const { session, selectNextTrack, revealDetails, hideDetails, endGame, hasTracksRemaining } =
    useGameSession()
  const player = useSpotifyPlayer(accessToken)
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null)
  const [isLoadingTrack, setIsLoadingTrack] = useState(false)
  const [playerError, setPlayerError] = useState('')
  const tracksCache = useRef<Map<string, SpotifyTrack>>(new Map())

  // Redirect if no session
  useEffect(() => {
    if (!session) {
      navigate('/')
    }
  }, [session, navigate])

  // Load all playlist tracks on mount
  useEffect(() => {
    if (session && tracksCache.current.size === 0) {
      loadPlaylistTracks()
    }
  }, [session])

  const loadPlaylistTracks = async () => {
    if (!session) return

    try {
      const tracks = await getAllPlaylistTracks(session.playlistId)
      tracks.forEach(track => {
        tracksCache.current.set(track.id, track)
      })
      console.log('Loaded', tracks.length, 'tracks for playlist')
    } catch (err) {
      console.error('Error loading playlist tracks:', err)
      setPlayerError('Failed to load playlist tracks')
    }
  }

  const handleNextSong = async () => {
    if (!session || !player.isReady) return

    setIsLoadingTrack(true)
    setPlayerError('')

    try {
      const nextTrackId = selectNextTrack()
      if (!nextTrackId) {
        setPlayerError('No more tracks in playlist')
        setIsLoadingTrack(false)
        return
      }

      const track = tracksCache.current.get(nextTrackId)
      if (!track) {
        setPlayerError('Track not found in cache')
        setIsLoadingTrack(false)
        return
      }

      if (!track.is_playable) {
        setPlayerError('This track is not playable in your region')
        setIsLoadingTrack(false)
        // Try next track
        await new Promise(r => setTimeout(r, 500))
        handleNextSong()
        return
      }

      setCurrentTrack(track)
      // Play using Spotify Web API (will auto-play on device)
      await player.play(track.uri, session.mode)
    } catch (err) {
      setPlayerError(err instanceof Error ? err.message : 'Playback failed')
    } finally {
      setIsLoadingTrack(false)
    }
  }

  if (!session) {
    return null
  }

  const year = currentTrack
    ? new Date(currentTrack.album.release_date).getFullYear()
    : null
  const artistNames = currentTrack
    ? currentTrack.artists.map(a => a.name).join(', ')
    : null

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Guess the Song</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Playlist: <strong>{session.playlistName}</strong>
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '0.5rem' }}>
          Songs left: {session.remainingTrackIds.length}
        </p>
      </div>

      <div className="page-content">
        {/* Player Status */}
        {!player.isReady && (
          <div className="status status-warning">
            <strong>Initializing player...</strong>
            <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
              Premium account required. This may take a moment.
            </p>
          </div>
        )}

        {player.hasError && player.errorMessage && (
          <div className="status status-error">
            <strong>Player Error:</strong> {player.errorMessage}
          </div>
        )}

        {playerError && (
          <div className="status status-error">
            <strong>Error:</strong> {playerError}
          </div>
        )}

        {/* Song Display */}
        {currentTrack ? (
          <div className="card">
            {!session.detailsRevealed ? (
              <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--text-tertiary)' }}>
                <p style={{ fontSize: '1.2rem' }}>🎵</p>
                <p>Click "Reveal Details" to show song information</p>
              </div>
            ) : (
              <div className="song-display">
                <div className="song-year">{year}</div>
                <div className="song-name">{currentTrack.name}</div>
                <div className="song-artist">{artistNames}</div>
              </div>
            )}
          </div>
        ) : (
          <div className="card">
            <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-tertiary)' }}>
              <p style={{ fontSize: '2rem', marginBottom: '1rem' }}>🎶</p>
              <p style={{ fontSize: '1.1rem' }}>Click "Next Song" to start</p>
            </div>
          </div>
        )}

        {/* Game Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button
            className="btn-primary btn-large"
            onClick={handleNextSong}
            disabled={!player.isReady || isLoadingTrack || !hasTracksRemaining}
          >
            {isLoadingTrack ? 'Loading...' : hasTracksRemaining ? 'Next Song' : 'Playlist Finished'}
          </button>

          {currentTrack && (
            <>
              <button
                className="btn-secondary btn-large"
                onClick={() => {
                  if (session.detailsRevealed) {
                    hideDetails()
                  } else {
                    revealDetails()
                  }
                }}
              >
                {session.detailsRevealed ? 'Hide Details' : 'Reveal Details'}
              </button>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  className="btn-secondary"
                  onClick={() => player.toggle()}
                  style={{ flex: 1 }}
                >
                  {player.isPlaying ? '⏸ Pause' : '▶ Play'}
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => player.restart()}
                  style={{ flex: 1 }}
                >
                  🔄 Restart
                </button>
              </div>
            </>
          )}
        </div>

        {!hasTracksRemaining && (
          <div className="card" style={{ background: 'rgba(29, 185, 84, 0.1)', borderColor: 'var(--primary)' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>Playlist Complete! 🎉</h3>
            <p style={{ marginBottom: '1rem' }}>You've gone through all tracks in this playlist.</p>
            <button
              className="btn-primary"
              onClick={() => {
                endGame()
                navigate('/')
              }}
              style={{ width: '100%' }}
            >
              Start New Game
            </button>
          </div>
        )}
      </div>

      {/* Back to Settings */}
      <div className="page-footer">
        <button
          className="btn-secondary"
          onClick={() => {
            endGame()
            navigate('/')
          }}
          style={{ width: '100%' }}
        >
          Back to Settings
        </button>
      </div>
    </div>
  )
}
