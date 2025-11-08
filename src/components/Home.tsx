// Home.tsx - Home component with trending songs
import { useEffect, useState, useRef } from "react";
import { Song } from "../types";
import { searchSongs, getImage, getArtists } from "../services/api";
import { useMusicStore } from "../store/useMusicStore";
import { Play, Heart, ListPlus, Download, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";

// Language categories
const LANGUAGES = [
  { id: "all", label: "All Languages" },
  { id: "hindi", label: "Hindi" },
  { id: "english", label: "English" },
  { id: "punjabi", label: "Punjabi" },
  { id: "assamese", label: "Assamese" },
  { id: "tamil", label: "Tamil" },
  { id: "telugu", label: "Telugu" },
  { id: "bengali", label: "Bengali" },
  { id: "marathi", label: "Marathi" },
];

// Era/Mood categories
const ERAS = [
  { id: "all", label: "All Eras" },
  { id: "2025", label: "2025 Hits" },
  { id: "2020s", label: "2020s" },
  { id: "2010s", label: "2010s" },
  { id: "2000s", label: "2000s" },
  { id: "90s", label: "90's Classics" },
  { id: "80s", label: "80's Retro" },
  { id: "romantic", label: "Romantic" },
  { id: "party", label: "Party" },
  { id: "sad", label: "Sad Songs" },
];

const RECOMMENDATIONS = [
  "bollywood hits",
  "romantic songs",
  "party music",
  "workout playlist",
  "chill vibes",
  "indie music",
  "classical fusion",
  "pop hits",
];

export default function Home() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedEra, setSelectedEra] = useState("all");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [showEraDropdown, setShowEraDropdown] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastSongRef = useRef<HTMLDivElement | null>(null);
  const loadedSongIds = useRef<Set<string>>(new Set());

  const {
    setCurrentSong,
    setQueue,
    setIsPlaying,
    favorites,
    addToFavorites,
    removeFromFavorites,
    history,
  } = useMusicStore();

  useEffect(() => {
    loadTrending();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite scroll observer
  useEffect(() => {
    if (loading || !hasMore) {
      return;
    }

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadMoreSongs();
        }
      },
      { threshold: 0.5 } // Trigger when 50% of element is visible
    );

    if (lastSongRef.current) {
      observerRef.current.observe(lastSongRef.current);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [songs.length, loading, hasMore]);

  const getRecommendationQuery = (): string => {
    // Get recommendation based on listening history
    if (history.length > 0) {
      const recentSongs = history.slice(0, 5);
      const artists = recentSongs
        .map((s) => s.artists.primary[0]?.name)
        .filter(Boolean);
      if (artists.length > 0) {
        return artists[Math.floor(Math.random() * artists.length)];
      }
    }
    return RECOMMENDATIONS[Math.floor(Math.random() * RECOMMENDATIONS.length)];
  };

  const loadTrending = async () => {
    setLoading(true);
    setPage(0);
    loadedSongIds.current.clear();

    // Use random offset to get different songs each time
    const randomOffset = Math.floor(Math.random() * 5); // Random offset 0-4
    const queries = [
      "trending 2025",
      "bollywood hits 2025",
      "top songs 2025",
      "latest music",
      "popular songs",
    ];
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];

    const results = await searchSongs(randomQuery, randomOffset, 30);
    const uniqueSongs = results.filter((song) => {
      if (!loadedSongIds.current.has(song.id)) {
        loadedSongIds.current.add(song.id);
        return true;
      }
      return false;
    });
    setSongs(uniqueSongs);
    setHasMore(true);
    setLoading(false);
  };

  const loadWithFilters = async (language: string, era: string) => {
    setLoading(true);
    setPage(0);
    loadedSongIds.current.clear();

    // Build combined query
    const randomOffset = Math.floor(Math.random() * 3);
    let query = "";

    // Combine language and era
    if (language !== "all" && era !== "all") {
      query = `${language} ${era} songs`;
    } else if (language !== "all") {
      const variations = [
        language,
        `${language} songs`,
        `${language} hits`,
        `best ${language} music`,
      ];
      query = variations[Math.floor(Math.random() * variations.length)];
    } else if (era !== "all") {
      const variations = [`${era} songs`, `${era} hits`, `${era} music`];
      query = variations[Math.floor(Math.random() * variations.length)];
    } else {
      const allQueries = [
        "trending 2025",
        "top hits",
        "popular music",
        "latest songs",
      ];
      query = allQueries[Math.floor(Math.random() * allQueries.length)];
    }

    console.log("Loading with filters:", { language, era, query });
    const results = await searchSongs(query, randomOffset, 30);
    const uniqueSongs = results.filter((song) => {
      if (!loadedSongIds.current.has(song.id)) {
        loadedSongIds.current.add(song.id);
        return true;
      }
      return false;
    });
    setSongs(uniqueSongs);
    setHasMore(true);
    setLoading(false);
  };

  const loadMoreSongs = async () => {
    console.log("loadMoreSongs called. Current state:", {
      loading,
      hasMore,
      page,
      songsCount: songs.length,
    });

    if (loading || !hasMore) {
      console.log("Blocked from loading more");
      return;
    }

    setLoading(true);
    const nextPage = page + 1;
    console.log("Loading page:", nextPage);

    // Alternate between category and AI recommendations
    const useRecommendation = nextPage % 3 === 0;
    let query = "";

    if (useRecommendation) {
      query = getRecommendationQuery();
    } else {
      // Build query from selected filters
      if (selectedLanguage !== "all" && selectedEra !== "all") {
        query = `${selectedLanguage} ${selectedEra} songs`;
      } else if (selectedLanguage !== "all") {
        query = `${selectedLanguage} songs`;
      } else if (selectedEra !== "all") {
        query = `${selectedEra} songs`;
      } else {
        query = "trending 2025";
      }
    }

    console.log("Query:", query, "Page:", nextPage);
    // Use current song count as offset instead of page number for better pagination
    const offset = songs.length;
    const results = await searchSongs(query, Math.floor(offset / 30), 30);
    console.log("Results received:", results.length);

    if (results.length > 0) {
      const uniqueSongs = results.filter((song) => {
        if (!loadedSongIds.current.has(song.id)) {
          loadedSongIds.current.add(song.id);
          return true;
        }
        return false;
      });

      console.log("Unique songs after filter:", uniqueSongs.length);

      // If we get less than 5 unique songs, try next page to get more variety
      if (uniqueSongs.length < 5 && results.length === 30) {
        console.log("Too many duplicates, trying next offset");
        const nextResults = await searchSongs(
          query,
          Math.floor(offset / 30) + 1,
          30
        );
        const moreUnique = nextResults.filter((song) => {
          if (!loadedSongIds.current.has(song.id)) {
            loadedSongIds.current.add(song.id);
            return true;
          }
          return false;
        });
        uniqueSongs.push(...moreUnique);
        console.log("After fetching more:", uniqueSongs.length);
      }

      if (uniqueSongs.length > 0) {
        setSongs((prev) => {
          console.log(
            "Adding songs. Before:",
            prev.length,
            "Adding:",
            uniqueSongs.length
          );
          return [...prev, ...uniqueSongs];
        });
        setPage(nextPage);
      } else {
        console.log("No unique songs found even after retry");
      }
    } else {
      console.log("No results from API");
    }

    setLoading(false);
  };

  const playSong = async (song: Song, index: number) => {
    setQueue(songs, index);
    setCurrentSong(song);
    setIsPlaying(true);
    toast.success(`🎵 Playing ${song.name}`, {
      style: {
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#fff",
      },
    });
  };

  const toggleFavorite = (e: React.MouseEvent, song: Song) => {
    e.stopPropagation();
    const isFavorite = favorites.some((s) => s.id === song.id);
    if (isFavorite) {
      removeFromFavorites(song.id);
      toast.success("Removed from favorites");
    } else {
      addToFavorites(song);
      toast.success("Added to favorites");
    }
  };

  if (loading && songs.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/30 rounded-full"></div>
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full absolute top-0 left-0 animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10">
      {/* Hero Header with Gradient */}
      <div className="relative px-8 py-12 mb-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/10 to-transparent"></div>
        <div className="relative z-10">
          <h1 className="text-5xl md:text-6xl font-black mb-4 bg-gradient-to-r from-white via-primary-200 to-primary-400 bg-clip-text text-transparent">
            Discover Music
          </h1>
          <p className="text-lg text-text-secondary">
            Trending songs and latest releases • Updated daily
          </p>

          {/* Stats */}
          <div className="flex gap-6 mt-6">
            <div className="glass px-4 py-2 rounded-2xl">
              <div className="text-2xl font-bold text-primary">
                {songs.length}
              </div>
              <div className="text-xs text-text-secondary">Songs</div>
            </div>
            <div className="glass px-4 py-2 rounded-2xl">
              <div className="text-2xl font-bold text-accent">
                {favorites.length}
              </div>
              <div className="text-xs text-text-secondary">Favorites</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Dropdowns - Horizontal Layout */}
      <div className="px-4 md:px-8 pb-6">
        <div className="flex gap-3 md:gap-4 items-center">
          {/* Language Dropdown */}
          <div className="relative flex-1 md:flex-initial">
            <button
              onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
              className="w-full glass px-4 md:px-5 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 hover:bg-white/10 transition-all md:min-w-[160px] justify-between"
            >
              <span className="truncate">
                {LANGUAGES.find((l) => l.id === selectedLanguage)?.label ||
                  "All Languages"}
              </span>
              <ChevronDown size={16} className="flex-shrink-0" />
            </button>
            {showLanguageDropdown && (
              <div className="absolute top-full mt-2 glass-dark rounded-2xl overflow-hidden shadow-2xl z-50 min-w-[200px] left-0 right-0 md:left-auto md:right-auto">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => {
                      setSelectedLanguage(lang.id);
                      setShowLanguageDropdown(false);
                      loadWithFilters(lang.id, selectedEra);
                    }}
                    className={`w-full px-5 py-3 text-left hover:bg-white/10 transition-all ${
                      selectedLanguage === lang.id
                        ? "bg-primary/20 text-primary"
                        : ""
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Era/Mood Dropdown */}
          <div className="relative flex-1 md:flex-initial">
            <button
              onClick={() => setShowEraDropdown(!showEraDropdown)}
              className="w-full glass px-4 md:px-5 py-2.5 rounded-full font-semibold text-sm flex items-center gap-2 hover:bg-white/10 transition-all md:min-w-[160px] justify-between"
            >
              <span className="truncate">
                {ERAS.find((e) => e.id === selectedEra)?.label || "All Eras"}
              </span>
              <ChevronDown size={16} className="flex-shrink-0" />
            </button>
            {showEraDropdown && (
              <div className="absolute top-full mt-2 glass-dark rounded-2xl overflow-hidden shadow-2xl z-50 min-w-[200px] left-0 right-0 md:left-auto md:right-auto">
                {ERAS.map((era) => (
                  <button
                    key={era.id}
                    onClick={() => {
                      setSelectedEra(era.id);
                      setShowEraDropdown(false);
                      loadWithFilters(selectedLanguage, era.id);
                    }}
                    className={`w-full px-5 py-3 text-left hover:bg-white/10 transition-all ${
                      selectedEra === era.id ? "bg-primary/20 text-primary" : ""
                    }`}
                  >
                    {era.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Songs Grid */}
      <div className="px-8 pb-12 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {songs.map((song, index) => {
          const isFavorite = favorites.some((s) => s.id === song.id);
          const isLast = index === songs.length - 1;

          return (
            <div
              key={`${song.id}-${index}`}
              ref={isLast ? lastSongRef : null}
              className="group glass-dark rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-card-hover card-hover relative overflow-hidden"
              onClick={() => playSong(song, index)}
            >
              {/* Hover gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>

              <div className="relative mb-4 overflow-hidden rounded-xl">
                <img
                  src={getImage(song.image)}
                  alt={song.name}
                  className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Action Buttons Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playSong(song, index);
                    }}
                    className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-neon hover:scale-110 transition-transform"
                  >
                    <Play size={20} fill="white" className="ml-0.5" />
                  </button>
                </div>

                {/* Quick Actions */}
                <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => toggleFavorite(e, song)}
                    className="w-8 h-8 glass rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <Heart
                      size={16}
                      fill={isFavorite ? "#f44336" : "none"}
                      color={isFavorite ? "#f44336" : "white"}
                    />
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="w-8 h-8 glass rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <ListPlus size={16} />
                  </button>
                  <button
                    onClick={(e) => e.stopPropagation()}
                    className="w-8 h-8 glass rounded-full flex items-center justify-center hover:bg-white/20 transition-colors"
                  >
                    <Download size={16} />
                  </button>
                </div>
              </div>

              <div className="relative">
                <h3 className="font-semibold truncate mb-1 text-sm">
                  {song.name}
                </h3>
                <p className="text-xs text-text-secondary truncate">
                  {getArtists(song.artists)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {loading && songs.length > 0 && (
        <div className="flex justify-center pb-8">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  );
}
