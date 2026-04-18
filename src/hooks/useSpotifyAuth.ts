import { useState, useEffect } from 'react'
import { SpotifyUser, AuthState } from '../types'
import {
  getStoredAccessToken,
  storeAccessToken,
  clearAccessToken,
  isLoggedIn,
} from '../services/spotifyAuth'
import { getCurrentUser } from '../services/spotifyAPI'

export function useSpotifyAuth(): AuthState & {
  logout: () => void
  setAccessToken: (token: string) => void
} {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: isLoggedIn(),
    accessToken: getStoredAccessToken(),
    user: null,
    error: null,
  })

  useEffect(() => {
    if (state.accessToken && !state.user) {
      getCurrentUser()
        .then(user => {
          setState(prev => ({
            ...prev,
            user,
            isAuthenticated: true,
            error: null,
          }))
        })
        .catch(err => {
          setState(prev => ({
            ...prev,
            error: err.message,
          }))
        })
    }
  }, [state.accessToken, state.user])

  const logout = () => {
    clearAccessToken()
    setState({
      isAuthenticated: false,
      accessToken: null,
      user: null,
      error: null,
    })
  }

  const setAccessToken = (token: string) => {
    storeAccessToken(token)
    setState(prev => ({
      ...prev,
      accessToken: token,
      isAuthenticated: true,
    }))
  }

  return {
    ...state,
    logout,
    setAccessToken,
  }
}
