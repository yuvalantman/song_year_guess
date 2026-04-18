import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthState } from '../types'

interface Props {
  auth: AuthState & { setAccessToken: (token: string) => void }
}

export default function CallbackPage({ auth }: Props) {
  const navigate = useNavigate()

  useEffect(() => {
    if (auth.isAuthenticated && auth.accessToken) {
      const timer = setTimeout(() => {
        navigate('/')
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [auth.isAuthenticated, auth.accessToken, navigate])

  return (
    <div className="container page">
      <div className="page-header">
        <h1>Spotify Guess the Song</h1>
      </div>

      <div className="page-content">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div className="loading"></div>
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>
            Completing authentication...
          </p>
        </div>
      </div>
    </div>
  )
}
