// Spotify API Types
export interface SpotifyUser {
  id: string
  display_name: string
  external_urls: {
    spotify: string
  }
  href: string
  images: Array<{
    height: number | null
    url: string
    width: number | null
  }>
  type: string
  uri: string
}

export interface SpotifyPlaylist {
  id: string
  name: string
  description: string | null
  external_urls: {
    spotify: string
  }
  href: string
  images: Array<{
    height: number | null
    url: string
    width: number | null
  }>
  owner: {
    display_name: string
    external_urls: {
      spotify: string
    }
    href: string
    id: string
    type: string
    uri: string
  }
  public: boolean
  tracks: {
    href: string
    total: number
  }
  type: string
  uri: string
}

export interface SpotifyTrack {
  id: string
  name: string
  artists: Array<{
    external_urls: {
      spotify: string
    }
    href: string
    id: string
    name: string
    type: string
    uri: string
  }>
  album: {
    id: string
    images: Array<{
      height: number | null
      url: string
      width: number | null
    }>
    name: string
    release_date: string
    release_date_precision: string
    type: string
    uri: string
    external_urls: {
      spotify: string
    }
  }
  duration_ms: number
  explicit: boolean
  external_ids: {
    isrc: string
  }
  external_urls: {
    spotify: string
  }
  href: string
  is_playable: boolean
  preview_url: string | null
  track_number: number
  type: string
  uri: string
}

export type GameMode = 'beginning' | 'random-sample'

export interface GameSession {
  playlistId: string
  playlistName: string
  mode: GameMode
  currentTrackId: string | null
  playedTrackIds: string[]
  remainingTrackIds: string[]
  detailsRevealed: boolean
  createdAt: number
}

export interface PlayerState {
  isReady: boolean
  hasError: boolean
  errorMessage: string | null
  isPlaying: boolean
  currentPosition: number
}

export interface AuthState {
  isAuthenticated: boolean
  accessToken: string | null
  user: SpotifyUser | null
  error: string | null
}
