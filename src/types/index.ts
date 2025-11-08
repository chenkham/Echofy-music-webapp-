export interface Song {
  id: string;
  name: string;
  type: string;
  album: {
    id: string;
    name: string;
    url: string;
  };
  year: string;
  releaseDate: string;
  duration: number;
  label: string;
  primaryArtists: string;
  primaryArtistsId: string;
  featuredArtists: string;
  featuredArtistsId: string;
  explicitContent: boolean;
  playCount: number;
  language: string;
  hasLyrics: boolean;
  url: string;
  copyright: string;
  image: ImageQuality[];
  downloadUrl: DownloadQuality[];
  artists: {
    primary: Artist[];
    featured: Artist[];
    all: Artist[];
  };
}

export interface Artist {
  id: string;
  name: string;
  role: string;
  image: ImageQuality[];
  type: string;
  url: string;
}

export interface ArtistDetails extends Artist {
  followerCount?: number;
  fanCount?: number;
  isVerified?: boolean;
  dominantLanguage?: string;
  dominantType?: string;
  bio?: string;
  dob?: string;
  fb?: string;
  twitter?: string;
  wiki?: string;
  availableLanguages?: string[];
  isRadioPresent?: boolean;
  topSongs?: Song[];
  topAlbums?: Album[];
  singles?: Song[];
}

export interface Album {
  id: string;
  name: string;
  description?: string;
  year: string;
  type: string;
  playCount?: number;
  language: string;
  explicitContent: boolean;
  url: string;
  image: ImageQuality[];
  artists?: {
    primary: Artist[];
    featured: Artist[];
    all: Artist[];
  };
  songCount?: number;
  songs?: Song[];
}

export interface PlaylistDetails {
  id: string;
  name: string;
  description?: string;
  type: string;
  url: string;
  image: ImageQuality[];
  language?: string;
  explicitContent: boolean;
  songCount: number;
  followerCount?: number;
  lastUpdated?: string;
  username?: string;
  firstname?: string;
  songs?: Song[];
}

export interface GlobalSearchResults {
  albums?: {
    results: Album[];
    position: number;
  };
  songs?: {
    results: Song[];
    position: number;
  };
  artists?: {
    results: Artist[];
    position: number;
  };
  playlists?: {
    results: PlaylistDetails[];
    position: number;
  };
  topQuery?: {
    results: any[];
    position: number;
  };
}

export interface ImageQuality {
  quality: string;
  url: string;
}

export interface DownloadQuality {
  quality: string;
  url: string;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
  username: string;
  photoURL?: string;
  bio?: string;
  createdAt: number;
  isPublic: boolean;
  providers?: string[]; // List of linked auth providers (e.g., 'google.com', 'password', 'puter')
}

export interface Playlist {
  id: string;
  name: string;
  description: string;
  songs: Song[];
  createdAt: number;
  userId: string; // Owner of the playlist
  isPublic: boolean; // Whether others can view this playlist
  username?: string; // For display purposes
}

export interface HistoryItem extends Song {
  playedAt: number;
}

export type RepeatMode = "off" | "all" | "one";

export interface AppState {
  currentSong: Song | null;
  queue: Song[];
  queueIndex: number;
  isPlaying: boolean;
  shuffle: boolean;
  repeat: RepeatMode;
  volume: number;
  favorites: Song[];
  history: HistoryItem[];
  playlists: Playlist[];
  currentCategory: string;
  currentPage: number;
  isLoading: boolean;
  hasMore: boolean;
  sleepTimerEnd: number | null;
  audioOutput: "phone" | "earphone" | "bluetooth";
  audioQuality: "low" | "medium" | "high";
  autoPlay: boolean;
  theme: "dark" | "light" | "auto";
  accentColor: string;
  animations: boolean;
  crossfade: number;
  normalizeAudio: boolean;
  downloadQuality: "low" | "medium" | "high" | "lossless";
  showLyrics: boolean;
}
