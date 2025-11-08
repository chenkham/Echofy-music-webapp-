import { useState, useEffect, useRef } from "react";
import { Song } from "../types";
import {
  globalSearch,
  searchSongs,
  searchAlbums,
  searchArtists,
  searchPlaylists,
  getImage,
  getArtists,
} from "../services/api";
import { useMusicStore } from "../store/useMusicStore";
import { useDownloadStore } from "../store/useDownloadStore";
import {
  Play,
  Heart,
  ListPlus,
  Download,
  Search as SearchIcon,
  Music2,
  Disc3,
  User,
  ListMusic,
  Menu,
} from "lucide-react";
import toast from "react-hot-toast";

interface SearchProps {
  searchQuery?: string;
  onAlbumClick?: (albumId: string) => void;
  onArtistClick?: (artistId: string) => void;
  onPlaylistClick?: (playlistId: string) => void;
}

type SearchTab = "all" | "songs" | "albums" | "artists" | "playlists";

export default function Search({
  searchQuery = "",
  onAlbumClick,
  onArtistClick,
  onPlaylistClick,
}: SearchProps) {
  const [query, setQuery] = useState(searchQuery);
  const [activeTab, setActiveTab] = useState<SearchTab>("all");
  const [allResults, setAllResults] = useState<any>(null);
  const [songs, setSongs] = useState<Song[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [artists, setArtists] = useState<any[]>([]);
  const [playlists, setPlaylists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  // Landing (when query is empty)
  const [landingLoading, setLandingLoading] = useState(false);
  const [trendingArtists, setTrendingArtists] = useState<any[]>([]);
  const [trendingAlbums, setTrendingAlbums] = useState<any[]>([]);
  const [trendingSongs, setTrendingSongs] = useState<Song[]>([]);

  // Discover categories
  const [bollywoodHits, setBollywoodHits] = useState<Song[]>([]);
  const [englishHits, setEnglishHits] = useState<Song[]>([]);
  const [romanticSongs, setRomanticSongs] = useState<Song[]>([]);
  const [partySongs, setPartySongs] = useState<Song[]>([]);
  const [classicHits, setClassicHits] = useState<Song[]>([]);
  const [workoutSongs, setWorkoutSongs] = useState<Song[]>([]);
  const [chillVibes, setChillVibes] = useState<Song[]>([]);
  const [indieMusic, setIndieMusic] = useState<Song[]>([]);

  const artistsRef = useRef<HTMLDivElement | null>(null);
  const albumsRef = useRef<HTMLDivElement | null>(null);
  const playlistsRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const { setCurrentSong, addToFavorites, favorites, setQueue, queue } =
    useMusicStore();
  const { openDownloadModal } = useDownloadStore();

  useEffect(() => {
    if (searchQuery) {
      setQuery(searchQuery);
      handleSearch(searchQuery);
    }
  }, [searchQuery]);

  // Fetch landing/trending content when component mounts
  useEffect(() => {
    fetchLanding();
  }, []);

  const fetchLanding = async () => {
    setLandingLoading(true);
    try {
      const [
        trendingArt,
        trendingAlb,
        trendingSng,
        bollywood,
        english,
        romantic,
        party,
        classic,
        workout,
        chill,
        indie,
      ] = await Promise.all([
        searchArtists("trending", 0, 8),
        searchAlbums("latest", 0, 8),
        searchSongs("trending", 0, 10),
        searchSongs("bollywood hits", 0, 10),
        searchSongs("english hits", 0, 10),
        searchSongs("romantic songs", 0, 10),
        searchSongs("party songs", 0, 10),
        searchSongs("classic hits", 0, 10),
        searchSongs("workout songs", 0, 10),
        searchSongs("chill vibes", 0, 10),
        searchSongs("indie music", 0, 10),
      ]);

      setTrendingArtists(trendingArt || []);
      setTrendingAlbums(trendingAlb || []);
      setTrendingSongs(trendingSng || []);
      setBollywoodHits(bollywood || []);
      setEnglishHits(english || []);
      setRomanticSongs(romantic || []);
      setPartySongs(party || []);
      setClassicHits(classic || []);
      setWorkoutSongs(workout || []);
      setChillVibes(chill || []);
      setIndieMusic(indie || []);
    } catch (err) {
      console.error("Failed to fetch landing data:", err);
    } finally {
      setLandingLoading(false);
    }
  };
  const handleSearch = async (searchValue: string) => {
    if (!searchValue || searchValue.trim().length < 2) {
      setSongs([]);
      setAlbums([]);
      setArtists([]);
      setPlaylists([]);
      setAllResults(null);
      setSearched(false);
      return;
    }

    setLoading(true);
    setSearched(true);

    try {
      if (activeTab === "all") {
        const results = await globalSearch(searchValue);
        setAllResults(results);
        setSongs(results?.songs?.results || []);
        setAlbums(results?.albums?.results || []);
        setArtists(results?.artists?.results || []);
        setPlaylists(results?.playlists?.results || []);
      } else if (activeTab === "songs") {
        const results = await searchSongs(searchValue, 0, 30);
        setSongs(results || []);
      } else if (activeTab === "albums") {
        const results = await searchAlbums(searchValue, 0, 30);
        setAlbums(results || []);
      } else if (activeTab === "artists") {
        const results = await searchArtists(searchValue, 0, 30);
        setArtists(results || []);
      } else if (activeTab === "playlists") {
        const results = await searchPlaylists(searchValue, 0, 30);
        setPlaylists(results || []);
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (query && searched) {
      handleSearch(query);
    }
  }, [activeTab]);

  const handlePlay = (song: Song) => {
    setCurrentSong(song);
  };

  const handleFavorite = (song: Song) => {
    addToFavorites(song);
    toast.success(
      favorites.some((s) => s.id === song.id)
        ? "Removed from favorites"
        : "Added to favorites"
    );
  };

  const handleAddToQueue = (song: Song) => {
    setQueue([...queue, song]);
    toast.success("Added to queue");
  };

  const handleDownload = (song: Song) => {
    openDownloadModal(song);
  };

  const isFavorited = (songId: string) =>
    favorites.some((s) => s.id === songId);

  return (
    <div className="p-4 md:p-8 pb-32">
      {/* Search Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between mb-4">
          <h1 className="text-3xl md:text-4xl font-bold">Search</h1>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((s) => !s)}
              className="p-2 rounded-full hover:bg-white/5"
              aria-label="Open search menu"
            >
              <Menu size={20} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 mt-2 w-48 glass p-2 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    artistsRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full text-left px-2 py-2 rounded hover:bg-white/5"
                >
                  Top Artists
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    albumsRef.current?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full text-left px-2 py-2 rounded hover:bg-white/5"
                >
                  Top Albums
                </button>
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    playlistsRef.current?.scrollIntoView({
                      behavior: "smooth",
                    });
                  }}
                  className="w-full text-left px-2 py-2 rounded hover:bg-white/5"
                >
                  Top Playlists
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Search Input */}
        <div className="relative max-w-2xl mb-6">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
            <SearchIcon size={20} />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              handleSearch(e.target.value);
            }}
            placeholder="Search for songs, artists, albums, playlists..."
            className="w-full pl-12 pr-4 py-4 glass rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        {/* Tabs */}
        {searched && (
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { id: "all", label: "All", icon: SearchIcon },
              { id: "songs", label: "Songs", icon: Music2 },
              { id: "albums", label: "Albums", icon: Disc3 },
              { id: "artists", label: "Artists", icon: User },
              { id: "playlists", label: "Playlists", icon: ListMusic },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as SearchTab)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? "bg-primary text-black"
                      : "glass hover:bg-white/10"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Search Results */}
      {/* Landing view when there's no query */}
      {!query || query.trim().length === 0 ? (
        <div className="space-y-10">
          {/* Hero Banner */}
          <div className="glass rounded-2xl p-8 bg-gradient-to-r from-primary/20 to-purple-600/20 border border-primary/30">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              Discover Amazing Music
            </h2>
            <p className="text-text-secondary text-lg">
              Explore curated playlists, trending artists, and hit songs across
              all genres
            </p>
          </div>

          {/* Trending Now */}
          {landingLoading ? (
            <div className="text-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : (
            <>
              {/* Trending Songs */}
              {trendingSongs.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">
                      🔥 Trending Right Now
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {trendingSongs.slice(0, 6).map((song, idx) => (
                      <div
                        key={song.id}
                        onClick={() => handlePlay(song)}
                        className="flex items-center gap-4 p-4 glass rounded-xl hover:bg-white/10 cursor-pointer group transition-all"
                      >
                        <span className="text-2xl font-bold text-primary w-8">
                          {idx + 1}
                        </span>
                        <img
                          src={getImage(song.image)}
                          alt={song.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold truncate group-hover:text-primary transition-colors">
                            {song.name}
                          </h4>
                          <p className="text-sm text-text-secondary truncate">
                            {getArtists(song.artists)}
                          </p>
                        </div>
                        <Play
                          size={20}
                          className="text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bollywood Hits */}
              {bollywoodHits.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-4">🎬 Bollywood Hits</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {bollywoodHits
                      .slice(0, 5)
                      .map((song) => renderSongCard(song))}
                  </div>
                </div>
              )}

              {/* English Hits */}
              {englishHits.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-4">🌎 English Hits</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {englishHits
                      .slice(0, 5)
                      .map((song) => renderSongCard(song))}
                  </div>
                </div>
              )}

              {/* Romantic Songs */}
              {romanticSongs.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-4">💕 Romantic Songs</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {romanticSongs
                      .slice(0, 5)
                      .map((song) => renderSongCard(song))}
                  </div>
                </div>
              )}

              {/* Party Songs */}
              {partySongs.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-4">🎉 Party Songs</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {partySongs.slice(0, 5).map((song) => renderSongCard(song))}
                  </div>
                </div>
              )}

              {/* Classic Hits */}
              {classicHits.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-4">⭐ Classic Hits</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {classicHits
                      .slice(0, 5)
                      .map((song) => renderSongCard(song))}
                  </div>
                </div>
              )}

              {/* Workout Songs */}
              {workoutSongs.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-4">💪 Workout Energy</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {workoutSongs
                      .slice(0, 5)
                      .map((song) => renderSongCard(song))}
                  </div>
                </div>
              )}

              {/* Chill Vibes */}
              {chillVibes.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-4">😌 Chill Vibes</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {chillVibes.slice(0, 5).map((song) => renderSongCard(song))}
                  </div>
                </div>
              )}

              {/* Indie Music */}
              {indieMusic.length > 0 && (
                <div>
                  <h3 className="text-2xl font-bold mb-4">🎸 Indie Music</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {indieMusic.slice(0, 5).map((song) => renderSongCard(song))}
                  </div>
                </div>
              )}

              {/* Top Artists */}
              <div ref={artistsRef}>
                <h3 className="text-2xl font-bold mb-4">🎤 Top Artists</h3>
                {landingLoading ? (
                  <div className="text-text-muted">Loading...</div>
                ) : trendingArtists.length > 0 ? (
                  renderArtists(trendingArtists)
                ) : (
                  <div className="text-text-muted">No artists found</div>
                )}
              </div>

              {/* Latest Albums */}
              <div ref={albumsRef}>
                <h3 className="text-2xl font-bold mb-4">📀 Latest Albums</h3>
                {landingLoading ? (
                  <div className="text-text-muted">Loading...</div>
                ) : trendingAlbums.length > 0 ? (
                  renderAlbums(trendingAlbums)
                ) : (
                  <div className="text-text-muted">No albums found</div>
                )}
              </div>
            </>
          )}
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : searched &&
        !songs.length &&
        !albums.length &&
        !artists.length &&
        !playlists.length ? (
        <div className="text-center py-20">
          <SearchIcon
            size={64}
            className="mx-auto mb-4 text-text-muted opacity-50"
          />
          <h2 className="text-xl font-semibold mb-2">No results found</h2>
          <p className="text-text-muted">
            Try searching for different keywords
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Top Result (only in "all" tab) */}
          {activeTab === "all" && allResults?.topQuery?.results?.[0] && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Top Result</h2>
              {renderTopResult(allResults.topQuery.results[0])}
            </div>
          )}

          {/* Songs */}
          {(activeTab === "all" || activeTab === "songs") &&
            songs.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Songs</h2>
                {renderSongs(activeTab === "all" ? songs.slice(0, 5) : songs)}
                {activeTab === "all" && songs.length > 5 && (
                  <button
                    onClick={() => setActiveTab("songs")}
                    className="mt-4 text-primary hover:underline"
                  >
                    See all songs
                  </button>
                )}
              </div>
            )}

          {/* Artists */}
          {(activeTab === "all" || activeTab === "artists") &&
            artists.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Artists</h2>
                {renderArtists(
                  activeTab === "all" ? artists.slice(0, 6) : artists
                )}
                {activeTab === "all" && artists.length > 6 && (
                  <button
                    onClick={() => setActiveTab("artists")}
                    className="mt-4 text-primary hover:underline"
                  >
                    See all artists
                  </button>
                )}
              </div>
            )}

          {/* Albums */}
          {(activeTab === "all" || activeTab === "albums") &&
            albums.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Albums</h2>
                {renderAlbums(
                  activeTab === "all" ? albums.slice(0, 6) : albums
                )}
                {activeTab === "all" && albums.length > 6 && (
                  <button
                    onClick={() => setActiveTab("albums")}
                    className="mt-4 text-primary hover:underline"
                  >
                    See all albums
                  </button>
                )}
              </div>
            )}

          {/* Playlists */}
          {(activeTab === "all" || activeTab === "playlists") &&
            playlists.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold mb-4">Playlists</h2>
                {renderPlaylists(
                  activeTab === "all" ? playlists.slice(0, 6) : playlists
                )}
                {activeTab === "all" && playlists.length > 6 && (
                  <button
                    onClick={() => setActiveTab("playlists")}
                    className="mt-4 text-primary hover:underline"
                  >
                    See all playlists
                  </button>
                )}
              </div>
            )}
        </div>
      )}
    </div>
  );
  function renderTopResult(item: any) {
    return (
      <div
        onClick={() => handlePlay(item)}
        className="glass rounded-2xl p-6 flex items-center gap-6 hover:bg-white/10 cursor-pointer group transition-all"
      >
        <img
          src={getImage(item.image)}
          alt={item.name || item.title}
          className="w-32 h-32 rounded-xl object-cover shadow-lg"
        />
        <div className="flex-1">
          <h3 className="text-3xl font-bold mb-2 group-hover:text-primary transition-colors">
            {item.name || item.title}
          </h3>
          <p className="text-text-secondary mb-4">
            {item.type === "song" && getArtists(item.artists)}
            {item.type === "album" && `Album • ${item.year || ""}`}
            {item.type === "artist" && "Artist"}
          </p>
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
            <Play size={20} fill="black" className="ml-0.5" />
          </div>
        </div>
      </div>
    );
  }

  function renderSongs(songList: Song[]) {
    return (
      <div className="space-y-2">
        {songList.map((song) => (
          <div
            key={song.id}
            onClick={() => handlePlay(song)}
            className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
          >
            <img
              src={getImage(song.image)}
              alt={song.name}
              className="w-14 h-14 rounded object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                {song.name}
              </h3>
              <p className="text-sm text-text-secondary truncate">
                {getArtists(song.artists)}
              </p>
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFavorite(song);
                }}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"
              >
                <Heart
                  size={16}
                  fill={isFavorited(song.id) ? "#1DB954" : "none"}
                  className={isFavorited(song.id) ? "text-primary" : ""}
                />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToQueue(song);
                }}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"
              >
                <ListPlus size={16} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(song);
                }}
                className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"
              >
                <Download size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  }

  function renderArtists(artistList: any[]) {
    console.log("🎤 Rendering artists:", artistList);
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {artistList.map((artist) => (
          <div
            key={artist.id}
            onClick={() => {
              console.log("🖱️ Artist clicked:", artist.id, artist.name);
              onArtistClick?.(artist.id);
            }}
            className="glass rounded-xl p-4 hover:bg-white/10 cursor-pointer transition-all group text-center"
          >
            <div className="relative mb-3">
              <img
                src={getImage(artist.image)}
                alt={artist.name}
                className="w-full aspect-square object-cover rounded-full mx-auto"
              />
            </div>
            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
              {artist.name}
            </h3>
            <p className="text-sm text-text-secondary">Artist</p>
          </div>
        ))}
      </div>
    );
  }

  function renderAlbums(albumList: any[]) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {albumList.map((album) => (
          <div
            key={album.id}
            onClick={() => onAlbumClick?.(album.id)}
            className="glass rounded-xl p-4 hover:bg-white/10 cursor-pointer transition-all group"
          >
            <div className="relative mb-3">
              <img
                src={getImage(album.image)}
                alt={album.name}
                className="w-full aspect-square object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
                  <Play size={20} fill="black" className="ml-0.5" />
                </div>
              </div>
            </div>
            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
              {album.name}
            </h3>
            <p className="text-sm text-text-secondary truncate">
              {album.year} • {album.type || "Album"}
            </p>
          </div>
        ))}
      </div>
    );
  }

  function renderPlaylists(playlistList: any[]) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        {playlistList.map((playlist) => (
          <div
            key={playlist.id}
            onClick={() => onPlaylistClick?.(playlist.id)}
            className="glass rounded-xl p-4 hover:bg-white/10 cursor-pointer transition-all group"
          >
            <div className="relative mb-3">
              <img
                src={getImage(playlist.image)}
                alt={playlist.name}
                className="w-full aspect-square object-cover rounded-lg"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
                  <Play size={20} fill="black" className="ml-0.5" />
                </div>
              </div>
            </div>
            <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
              {playlist.name}
            </h3>
            <p className="text-sm text-text-secondary truncate">
              {playlist.songCount ? `${playlist.songCount} songs` : "Playlist"}
            </p>
          </div>
        ))}
      </div>
    );
  }

  function renderSongCard(song: Song) {
    return (
      <div
        key={song.id}
        onClick={() => handlePlay(song)}
        className="glass rounded-xl p-4 hover:bg-white/10 cursor-pointer transition-all group"
      >
        <div className="relative mb-3">
          <img
            src={getImage(song.image)}
            alt={song.name}
            className="w-full aspect-square object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center transform scale-90 group-hover:scale-100 transition-transform">
              <Play size={20} fill="black" className="ml-0.5" />
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleFavorite(song);
            }}
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm hover:bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
          >
            <Heart
              size={16}
              fill={isFavorited(song.id) ? "#1DB954" : "none"}
              className={isFavorited(song.id) ? "text-primary" : "text-white"}
            />
          </button>
        </div>
        <h3 className="font-semibold truncate group-hover:text-primary transition-colors mb-1">
          {song.name}
        </h3>
        <p className="text-sm text-text-secondary truncate">
          {getArtists(song.artists)}
        </p>
      </div>
    );
  }
}
