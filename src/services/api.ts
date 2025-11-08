import { Song } from "../types";

const API_BASE = "https://saavn.sumit.co";
const LYRICS_API = "https://lyrist.vercel.app/api";
const DEEZER_API = "https://api.deezer.com";

// ==================== SEARCH APIs ====================

// Global search - returns songs, albums, artists, playlists
export const globalSearch = async (query: string): Promise<any> => {
  try {
    const response = await fetch(
      `${API_BASE}/api/search?query=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error("Global search error:", error);
    return null;
  }
};

// Search for songs
export const searchSongs = async (
  query: string,
  page = 0,
  limit = 20
): Promise<Song[]> => {
  try {
    const response = await fetch(
      `${API_BASE}/api/search/songs?query=${encodeURIComponent(
        query
      )}&page=${page}&limit=${limit}`
    );
    const data = await response.json();
    return data.data?.results || [];
  } catch (error) {
    console.error("Search songs error:", error);
    return [];
  }
};

// Search for albums
export const searchAlbums = async (
  query: string,
  page = 0,
  limit = 20
): Promise<any[]> => {
  try {
    const response = await fetch(
      `${API_BASE}/api/search/albums?query=${encodeURIComponent(
        query
      )}&page=${page}&limit=${limit}`
    );
    const data = await response.json();
    return data.data?.results || [];
  } catch (error) {
    console.error("Search albums error:", error);
    return [];
  }
};

// Search for artists
export const searchArtists = async (
  query: string,
  page = 0,
  limit = 20
): Promise<any[]> => {
  try {
    const response = await fetch(
      `${API_BASE}/api/search/artists?query=${encodeURIComponent(
        query
      )}&page=${page}&limit=${limit}`
    );
    const data = await response.json();
    return data.data?.results || [];
  } catch (error) {
    console.error("Search artists error:", error);
    return [];
  }
};

// Search for playlists
export const searchPlaylists = async (
  query: string,
  page = 0,
  limit = 20
): Promise<any[]> => {
  try {
    const response = await fetch(
      `${API_BASE}/api/search/playlists?query=${encodeURIComponent(
        query
      )}&page=${page}&limit=${limit}`
    );
    const data = await response.json();
    return data.data?.results || [];
  } catch (error) {
    console.error("Search playlists error:", error);
    return [];
  }
};

// ==================== SONGS APIs ====================

// Get song by ID
export const getSongById = async (id: string): Promise<Song | null> => {
  try {
    const response = await fetch(`${API_BASE}/api/songs/${id}`);
    const data = await response.json();
    return data.data?.[0] || null;
  } catch (error) {
    console.error("Get song error:", error);
    return null;
  }
};

// Get song suggestions/recommendations
export const getSongSuggestions = async (id: string): Promise<Song[]> => {
  try {
    const response = await fetch(`${API_BASE}/api/songs/${id}/suggestions`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Get song suggestions error:", error);
    return [];
  }
};

// ==================== ALBUMS APIs ====================

// Get album details by ID
export const getAlbumById = async (id: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/api/albums/${id}`);
    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error("Get album error:", error);
    return null;
  }
};

// ==================== ARTISTS APIs ====================

// Get artist details by ID
export const getArtistById = async (id: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/api/artists/${id}`);
    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error("Get artist error:", error);
    return null;
  }
};

// Get artist songs
export const getArtistSongs = async (
  id: string,
  page = 0,
  category = "latest"
): Promise<Song[]> => {
  try {
    const response = await fetch(
      `${API_BASE}/api/artists/${id}/songs?page=${page}&category=${category}`
    );
    const data = await response.json();
    return data.data?.songs || [];
  } catch (error) {
    console.error("Get artist songs error:", error);
    return [];
  }
};

// Get artist albums
export const getArtistAlbums = async (
  id: string,
  page = 0
): Promise<any[]> => {
  try {
    const response = await fetch(
      `${API_BASE}/api/artists/${id}/albums?page=${page}`
    );
    const data = await response.json();
    return data.data?.albums || [];
  } catch (error) {
    console.error("Get artist albums error:", error);
    return [];
  }
};

// ==================== PLAYLISTS APIs ====================

// Get playlist details by ID
export const getPlaylistById = async (id: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE}/api/playlists/${id}`);
    const data = await response.json();
    return data.data || null;
  } catch (error) {
    console.error("Get playlist error:", error);
    return null;
  }
};

export const getImage = (
  images: { quality: string; url: string }[]
): string => {
  if (!images || !Array.isArray(images))
    return "https://via.placeholder.com/300";
  const img =
    images.find((i) => i.quality === "500x500") || images[images.length - 1];
  return img?.url || "https://via.placeholder.com/300";
};

export const getArtists = (artists: Song["artists"]): string => {
  if (!artists || !artists.primary) return "Unknown Artist";
  return artists.primary.map((a) => a.name).join(", ");
};

export const formatTime = (seconds: number): string => {
  if (!seconds || isNaN(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

export const downloadSong = async (
  song: Song,
  url?: string,
  quality?: string
): Promise<void> => {
  if (!song || !song.downloadUrl || song.downloadUrl.length === 0) {
    throw new Error("No download URL found for this song!");
  }

  // Use provided URL or find best quality
  const downloadUrl =
    url ||
    song.downloadUrl.find((u) => u.quality === "320kbps")?.url ||
    song.downloadUrl[0].url;

  try {
    const fileResponse = await fetch(downloadUrl);
    const fileBlob = await fileResponse.blob();

    const qualityLabel = quality ? ` (${quality})` : "";
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(fileBlob);
    link.download = `${song.name}${qualityLabel}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("Download error:", error);
    throw error;
  }
};

export const truncateText = (text: string, maxLength = 40): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + "...";
};

// Fetch song lyrics from Lyrist API
export const getLyrics = async (
  songName: string,
  artist: string
): Promise<string | null> => {
  try {
    const response = await fetch(
      `${LYRICS_API}/${encodeURIComponent(songName)}/${encodeURIComponent(
        artist
      )}`
    );
    const data = await response.json();
    return data.lyrics || null;
  } catch (error) {
    console.error("Lyrics fetch error:", error);
    return null;
  }
};

// Get trending charts from Deezer (free, no auth needed)
export const getDeezerChart = async (limit = 20): Promise<any[]> => {
  try {
    const response = await fetch(`${DEEZER_API}/chart/0/tracks?limit=${limit}`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Deezer chart error:", error);
    return [];
  }
};

// Search Deezer for additional song info
export const searchDeezer = async (query: string): Promise<any[]> => {
  try {
    const response = await fetch(
      `${DEEZER_API}/search?q=${encodeURIComponent(query)}`
    );
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Deezer search error:", error);
    return [];
  }
};

// Get artist info from Deezer
export const getDeezerArtist = async (
  artistId: string
): Promise<any | null> => {
  try {
    const response = await fetch(`${DEEZER_API}/artist/${artistId}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Deezer artist error:", error);
    return null;
  }
};

// Get radio stream (genre-based)
export const getDeezerRadio = async (genreId: number): Promise<any[]> => {
  try {
    const response = await fetch(`${DEEZER_API}/radio/${genreId}/tracks`);
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error("Deezer radio error:", error);
    return [];
  }
};
