import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SpotifyUser, GameMode } from '../types'
import { initiateLogin } from '../services/spotifyAuth'
import { getPlaylist, getAllPlaylistTracks, parsePlaylistId } from '../services/spotifyAPI'
import { useGameSession } from '../hooks/useGameSession'

// Preconfigured public playlists
const PRESET_PLAYLISTS = [
  { id: '37i9dQZF1DX2sUQwD7tbMl', name: '80s Greatest Hits' },
  { id: '37i9dQZF1DX9wC1yKioNOk', name: '90s Throwback' },
  { id: '37i9dQZF1DXcF1FeYrui8B', name: '2000s Essentials' },
  { id: '37i9dQZF1DXcBWIGoYsMP1', name: '2010s Hits' },
  { id: '37i9dQZF1DXdbXaQcel82p', name: '2020s Hits' },
  { id: '37i9dQZF1DXcY9yKTKHJCl', name: 'Indie Gems' },
  { id: '2cWeR42ZOxYxzS1WqSNrix', name: 'shlomo' },
  { id: '37i9dQZF1DX1okZ1ZeITst', name: 'Disney Hits' },
  { id: '2ycMepoGjMO3MqmPKQUcmC', name: 'Hebrew Hits' },
]

interface Props {
  isAuthenticated: boolean
  user: SpotifyUser | null
  error: string | null
  onLogout: () => void
}

export default function SettingsPage({ isAuthenticated, user, error, onLogout }: Props) {
  const navigate = useNavigate()
  const { startNewGame, canContinue } = useGameSession()
  const [selectedPlaylist, setSelectedPlaylist] = useState<string>(PRESET_PLAYLISTS[0].id)
  const [customPlaylistInput, setCustomPlaylistInput] = useState('')
  const [gameMode, setGameMode] = useState<GameMode>('beginning')
  const [isLoading, setIsLoading] = useState(false)
  const [customPlaylistError, setCustomPlaylistError] = useState('')

  const handleStartNewGame = async () => {
    setIsLoading(true)
    setCustomPlaylistError('')

    try {
      const playlistId = selectedPlaylist
      const playlist = await getPlaylist(playlistId)

      if (!playlist.public && playlist.owner.id !== user?.id) {
        throw new Error('Only public playlists are supported')
      }

      const tracks = await getAllPlaylistTracks(playlistId)

      if (tracks.length === 0) {
        throw new Error('Playlist has no tracks')
      }

      const trackIds = tracks.map(t => t.id)
      startNewGame(playlistId, playlist.name, gameMode, trackIds)
      navigate('/game')
    } catch (err) {
      setCustomPlaylistError(
        err instanceof Error ? err.message : 'Failed to load playlist'
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddCustomPlaylist = async () => {
    setCustomPlaylistError('')

    if (!customPlaylistInput.trim()) {
      setCustomPlaylistError('Please enter a playlist URL or ID')
      return
    }

    const parsedId = parsePlaylistId(customPlaylistInput.trim())
    if (!parsedId) {
      setCustomPlaylistError('Invalid playlist format. Use Spotify URL or URI.')
      return
    }

    try {
      const playlist = await getPlaylist(parsedId)

      if (!playlist.public && playlist.owner.id !== user?.id) {
        throw new Error('Only public playlists are supported')
      }

      setSelectedPlaylist(parsedId)
      setCustomPlaylistInput('')
      setCustomPlaylistError('')
    } catch (err) {
      setCustomPlaylistError(
        err instanceof Error ? err.message : 'Failed to load playlist'
      )
    }
  }

  const handleContinueGame = () => {
    navigate('/game')
  }

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Spotify Guess the Song</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Guess the song, year, artist and more</p>
      </div>

      <div className="page-content">
        {/* Auth Status */}
        <div className="auth-status">
          <div className={`auth-status-item ${isAuthenticated ? 'ready' : ''}`}>
            <div className={`status-indicator ${isAuthenticated ? 'active' : ''}`}></div>
            <div>
              <strong>Spotify Account:</strong>
              {isAuthenticated && user ? (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Logged in as <strong>{user.display_name}</strong>
                </div>
              ) : (
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Not connected
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="status status-error">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!isAuthenticated && (
            <div className="status status-warning">
              <strong>Note:</strong> Spotify Premium is required for playback
            </div>
          )}
        </div>

        {/* Login/Logout */}
        {!isAuthenticated ? (
          <button className="btn-primary btn-large" onClick={() => initiateLogin()}>
            Login with Spotify
          </button>
        ) : (
          <>
            {/* Playlist Selection */}
            <div>
              <h2>Select a Playlist</h2>
              <div className="form-group">
                <label htmlFor="preset-playlists">Preset Playlists</label>
                <select
                  id="preset-playlists"
                  value={selectedPlaylist}
                  onChange={e => setSelectedPlaylist(e.target.value)}
                >
                  {PRESET_PLAYLISTS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '1rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                <p style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>Or paste a public Spotify playlist:</p>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="spotify:playlist:ID or open.spotify.com/playlist/ID"
                    value={customPlaylistInput}
                    onChange={e => setCustomPlaylistInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddCustomPlaylist()}
                  />
                  <button
                    className="btn-secondary"
                    onClick={handleAddCustomPlaylist}
                    style={{ whiteSpace: 'nowrap', width: 'auto', minWidth: '6rem' }}
                  >
                    Add
                  </button>
                </div>
                {customPlaylistError && (
                  <div className="status status-error" style={{ marginTop: '0.75rem' }}>
                    {customPlaylistError}
                  </div>
                )}
              </div>
            </div>

            {/* Game Mode */}
            <div>
              <h2>Game Mode</h2>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="mode"
                    value="beginning"
                    checked={gameMode === 'beginning'}
                    onChange={e => setGameMode(e.target.value as GameMode)}
                    style={{ width: 'auto', cursor: 'pointer' }}
                  />
                  <span>Start from beginning</span>
                </label>
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="mode"
                    value="random-sample"
                    checked={gameMode === 'random-sample'}
                    onChange={e => setGameMode(e.target.value as GameMode)}
                    style={{ width: 'auto', cursor: 'pointer' }}
                  />
                  <span>Random 30-second sample</span>
                </label>
              </div>
            </div>

            {/* Game Actions */}
            <div className="page-footer">
              <button
                className="btn-primary btn-large"
                onClick={handleStartNewGame}
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Start New Game'}
              </button>

              {canContinue() && (
                <button
                  className="btn-secondary btn-large"
                  onClick={handleContinueGame}
                >
                  Continue Game
                </button>
              )}
            </div>
          </>
        )}

        {isAuthenticated && (
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border)' }}>
            <button
              className="btn-danger"
              onClick={onLogout}
              style={{ width: '100%' }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
