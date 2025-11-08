import { create } from "zustand";
import { AppState, Song, Playlist, HistoryItem, RepeatMode } from "../types";
import { useNotificationStore } from "./useNotificationStore";

interface MusicStore extends AppState {
  setCurrentSong: (song: Song | null) => void;
  setQueue: (queue: Song[], index?: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setVolume: (volume: number) => void;
  addToFavorites: (song: Song) => void;
  removeFromFavorites: (songId: string) => void;
  addToHistory: (song: Song) => void;
  clearHistory: () => void;
  createPlaylist: (name: string, description: string) => void;
  addToPlaylist: (playlistId: string, song: Song) => void;
  removeFromPlaylist: (playlistId: string, songId: string) => void;
  deletePlaylist: (playlistId: string) => void;
  setCurrentCategory: (category: string) => void;
  setCurrentPage: (page: number) => void;
  setIsLoading: (isLoading: boolean) => void;
  setHasMore: (hasMore: boolean) => void;
  setSleepTimer: (endTime: number | null) => void;
  setAudioOutput: (output: "phone" | "earphone" | "bluetooth") => void;
  setAudioQuality: (quality: "low" | "medium" | "high") => void;
  setAutoPlay: (autoPlay: boolean) => void;
  setTheme: (theme: "dark" | "light" | "auto") => void;
  setAccentColor: (color: string) => void;
  setAnimations: (enabled: boolean) => void;
  setCrossfade: (seconds: number) => void;
  setNormalizeAudio: (enabled: boolean) => void;
  setDownloadQuality: (quality: "low" | "medium" | "high" | "lossless") => void;
  setShowLyrics: (enabled: boolean) => void;
  nextSong: () => void;
  previousSong: () => void;
}

export const useMusicStore = create<MusicStore>((set, get) => ({
  currentSong: null,
  queue: [],
  queueIndex: 0,
  isPlaying: false,
  shuffle: false,
  repeat: "off",
  volume: parseInt(localStorage.getItem("volume") || "100"),
  favorites: JSON.parse(localStorage.getItem("favorites") || "[]"),
  history: JSON.parse(localStorage.getItem("history") || "[]"),
  playlists: JSON.parse(localStorage.getItem("playlists") || "[]"),
  currentCategory: "all",
  currentPage: 0,
  isLoading: false,
  hasMore: true,
  sleepTimerEnd: null,
  audioOutput: "phone",
  audioQuality:
    (localStorage.getItem("audioQuality") as "low" | "medium" | "high") ||
    "high",
  autoPlay: localStorage.getItem("autoPlay") === "false" ? false : true,
  theme: (localStorage.getItem("theme") as "dark" | "light" | "auto") || "dark",
  accentColor: localStorage.getItem("accentColor") || "#1DB954",
  animations: localStorage.getItem("animations") === "false" ? false : true,
  crossfade: parseInt(localStorage.getItem("crossfade") || "0"),
  normalizeAudio: localStorage.getItem("normalizeAudio") === "true",
  downloadQuality:
    (localStorage.getItem("downloadQuality") as
      | "low"
      | "medium"
      | "high"
      | "lossless") || "high",
  showLyrics: localStorage.getItem("showLyrics") === "false" ? false : true,

  setCurrentSong: (song) => set({ currentSong: song }),

  setQueue: (queue, index = 0) => set({ queue, queueIndex: index }),

  setIsPlaying: (isPlaying) => set({ isPlaying }),

  toggleShuffle: () => set((state) => ({ shuffle: !state.shuffle })),

  toggleRepeat: () =>
    set((state) => {
      const modes: RepeatMode[] = ["off", "all", "one"];
      const currentIndex = modes.indexOf(state.repeat);
      return { repeat: modes[(currentIndex + 1) % modes.length] };
    }),

  setVolume: (volume) => {
    localStorage.setItem("volume", volume.toString());
    set({ volume });
  },

  addToFavorites: (song) =>
    set((state) => {
      const favorites = [...state.favorites, song];
      localStorage.setItem("favorites", JSON.stringify(favorites));

      // Add notification
      useNotificationStore.getState().addNotification({
        type: "favorite",
        title: "Added to Liked Songs",
        message: `${song.name} has been added to your favorites`,
        songName: song.name,
      });

      return { favorites };
    }),

  removeFromFavorites: (songId) =>
    set((state) => {
      const favorites = state.favorites.filter((s) => s.id !== songId);
      const removedSong = state.favorites.find((s) => s.id === songId);
      localStorage.setItem("favorites", JSON.stringify(favorites));

      // Add notification
      if (removedSong) {
        useNotificationStore.getState().addNotification({
          type: "favorite",
          title: "Removed from Liked Songs",
          message: `${removedSong.name} has been removed from your favorites`,
          songName: removedSong.name,
        });
      }

      return { favorites };
    }),

  addToHistory: (song) =>
    set((state) => {
      const history = [
        { ...song, playedAt: Date.now() } as HistoryItem,
        ...state.history.filter((h) => h.id !== song.id),
      ].slice(0, 100);
      localStorage.setItem("history", JSON.stringify(history));
      return { history };
    }),

  clearHistory: () =>
    set(() => {
      localStorage.setItem("history", JSON.stringify([]));
      return { history: [] };
    }),

  createPlaylist: (name, description) =>
    set((state) => {
      const playlist: Playlist = {
        id: "pl_" + Date.now(),
        name,
        description,
        songs: [],
        createdAt: Date.now(),
        userId: "local", // TODO: Replace with actual user ID from useAuthStore
        isPublic: false,
      };
      const playlists = [...state.playlists, playlist];
      localStorage.setItem("playlists", JSON.stringify(playlists));

      // Add notification
      useNotificationStore.getState().addNotification({
        type: "playlist",
        title: "Playlist Created",
        message: `"${name}" playlist has been created successfully`,
        playlistName: name,
      });

      return { playlists };
    }),

  addToPlaylist: (playlistId, song) =>
    set((state) => {
      const playlist = state.playlists.find((p) => p.id === playlistId);
      const playlists = state.playlists.map((p) =>
        p.id === playlistId && !p.songs.some((s) => s.id === song.id)
          ? { ...p, songs: [...p.songs, song] }
          : p
      );
      localStorage.setItem("playlists", JSON.stringify(playlists));

      // Add notification
      if (playlist && !playlist.songs.some((s) => s.id === song.id)) {
        useNotificationStore.getState().addNotification({
          type: "playlist",
          title: "Added to Playlist",
          message: `${song.name} has been added to "${playlist.name}"`,
          songName: song.name,
          playlistName: playlist.name,
        });
      }

      return { playlists };
    }),

  removeFromPlaylist: (playlistId, songId) =>
    set((state) => {
      const playlists = state.playlists.map((p) =>
        p.id === playlistId
          ? { ...p, songs: p.songs.filter((s) => s.id !== songId) }
          : p
      );
      localStorage.setItem("playlists", JSON.stringify(playlists));
      return { playlists };
    }),

  deletePlaylist: (playlistId) =>
    set((state) => {
      const playlists = state.playlists.filter((p) => p.id !== playlistId);
      localStorage.setItem("playlists", JSON.stringify(playlists));
      return { playlists };
    }),

  setCurrentCategory: (category) => set({ currentCategory: category }),

  setCurrentPage: (page) => set({ currentPage: page }),

  setIsLoading: (isLoading) => set({ isLoading }),

  setHasMore: (hasMore) => set({ hasMore }),

  setSleepTimer: (endTime) => set({ sleepTimerEnd: endTime }),

  setAudioOutput: (output) => set({ audioOutput: output }),

  setAudioQuality: (quality) => {
    localStorage.setItem("audioQuality", quality);
    set({ audioQuality: quality });
  },

  setAutoPlay: (autoPlay) => {
    localStorage.setItem("autoPlay", String(autoPlay));
    set({ autoPlay });
  },

  setTheme: (theme) => {
    localStorage.setItem("theme", theme);
    set({ theme });
  },

  setAccentColor: (color) => {
    localStorage.setItem("accentColor", color);
    set({ accentColor: color });
    // Update CSS variable
    document.documentElement.style.setProperty("--color-primary", color);
  },

  setAnimations: (enabled) => {
    localStorage.setItem("animations", String(enabled));
    set({ animations: enabled });
  },

  setCrossfade: (seconds) => {
    localStorage.setItem("crossfade", String(seconds));
    set({ crossfade: seconds });
  },

  setNormalizeAudio: (enabled) => {
    localStorage.setItem("normalizeAudio", String(enabled));
    set({ normalizeAudio: enabled });
  },

  setDownloadQuality: (quality) => {
    localStorage.setItem("downloadQuality", quality);
    set({ downloadQuality: quality });
  },

  setShowLyrics: (enabled) => {
    localStorage.setItem("showLyrics", String(enabled));
    set({ showLyrics: enabled });
  },

  nextSong: () => {
    const state = get();
    if (!state.queue.length) return;

    if (state.repeat === "one") {
      return; // Audio element will handle repeat
    }

    let nextIndex;
    if (state.shuffle) {
      nextIndex = Math.floor(Math.random() * state.queue.length);
    } else {
      nextIndex = state.queueIndex + 1;
      if (nextIndex >= state.queue.length) {
        if (state.repeat === "all") {
          nextIndex = 0;
        } else {
          return;
        }
      }
    }

    set({ queueIndex: nextIndex, currentSong: state.queue[nextIndex] });
  },

  previousSong: () => {
    const state = get();
    const prevIndex = state.queueIndex - 1;
    if (prevIndex >= 0) {
      set({ queueIndex: prevIndex, currentSong: state.queue[prevIndex] });
    }
  },
}));
