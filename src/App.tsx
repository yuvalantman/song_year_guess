import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useSpotifyAuth } from './hooks/useSpotifyAuth'
import { handleCallback, isLoggedIn } from './services/spotifyAuth'
import SettingsPage from './pages/SettingsPage'
import GamePage from './pages/GamePage'
import CallbackPage from './pages/CallbackPage'

function App() {
  const auth = useSpotifyAuth()

  // Handle OAuth callback on mount if needed
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code && !isLoggedIn()) {
      handleCallback(code)
        .then(token => {
          auth.setAccessToken(token)
          // Redirect to home
          window.history.replaceState({}, document.title, window.location.pathname)
        })
        .catch(err => {
          console.error('Callback error:', err)
          alert('Authentication failed. Please try again.')
          window.history.replaceState({}, document.title, '/')
        })
    }
  }, [])

  return (
    <Router>
      <Routes>
        <Route path="/callback" element={<CallbackPage auth={auth} />} />
        <Route
          path="/"
          element={
            <SettingsPage
              isAuthenticated={auth.isAuthenticated}
              user={auth.user}
              error={auth.error}
              onLogout={auth.logout}
            />
          }
        />
        <Route
          path="/game"
          element={
            auth.isAuthenticated ? (
              <GamePage accessToken={auth.accessToken} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </Router>
  )
}

export default App
