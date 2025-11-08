import { useMusicStore } from "../store/useMusicStore";
import { useDownloadStore } from "../store/useDownloadStore";
import { Play, Heart, ListPlus, Download, Clock, Trash2 } from "lucide-react";

export default function History() {
  const {
    history,
    favorites,
    setCurrentSong,
    setQueue,
    setIsPlaying,
    addToFavorites,
    removeFromFavorites,
    clearHistory,
  } = useMusicStore();
  const { openDownloadModal } = useDownloadStore();

  const getImage = (imageUrl: string | { url: string }[] | undefined) => {
    if (!imageUrl) return "https://via.placeholder.com/300";
    if (typeof imageUrl === "string") return imageUrl;
    if (Array.isArray(imageUrl) && imageUrl.length > 0) {
      return (
        imageUrl[imageUrl.length - 1]?.url || "https://via.placeholder.com/300"
      );
    }
    return "https://via.placeholder.com/300";
  };

  const getArtists = (artists: any) => {
    if (!artists) return "Unknown Artist";
    if (typeof artists === "string") return artists;
    if (Array.isArray(artists)) {
      return artists.map((a) => a.name || a).join(", ");
    }
    if (artists.primary) {
      return artists.primary.map((a: any) => a.name || a).join(", ");
    }
    return "Unknown Artist";
  };

  const handleToggleFavorite = (e: React.MouseEvent, song: any) => {
    e.stopPropagation();
    const isFavorite = favorites.some((s) => s.id === song.id);
    if (isFavorite) {
      removeFromFavorites(song.id);
    } else {
      addToFavorites(song);
    }
  };

  const handlePlaySong = (song: any, index: number) => {
    setCurrentSong(song);
    setQueue(history, index);
    setIsPlaying(true);
  };

  const handleClearHistory = () => {
    if (
      window.confirm(
        "Are you sure you want to clear your listening history? This action cannot be undone."
      )
    ) {
      clearHistory();
    }
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-accent to-accent-600 flex items-center justify-center shadow-neon">
              <Clock size={24} className="md:w-8 md:h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">
                Listening History
              </h1>
              <p className="text-text-secondary mt-1">{history.length} songs</p>
            </div>
          </div>
          {history.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-2 px-4 py-2 md:px-5 md:py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 hover:text-red-300 transition-all font-semibold text-sm"
            >
              <Trash2 size={16} className="md:w-5 md:h-5" />
              <span className="hidden sm:inline">Clear History</span>
            </button>
          )}
        </div>
      </div>

      {/* Songs Grid */}
      {history.length === 0 ? (
        <div className="text-center py-20">
          <Clock
            size={64}
            className="mx-auto text-text-muted mb-4 opacity-50"
          />
          <p className="text-xl text-text-muted mb-2">
            No listening history yet
          </p>
          <p className="text-sm text-text-secondary">
            Songs you play will appear here
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {history.map((song, index) => {
            const isFavorite = favorites.some((s) => s.id === song.id);

            return (
              <div
                key={`${song.id}-${index}`}
                className="group glass-dark rounded-2xl p-4 cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-card-hover card-hover relative overflow-hidden"
                onClick={() => handlePlaySong(song, index)}
              >
                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-accent/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl"></div>

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
                        handlePlaySong(song, index);
                      }}
                      className="w-12 h-12 bg-accent rounded-full flex items-center justify-center shadow-neon hover:scale-110 transition-transform"
                    >
                      <Play size={20} fill="white" className="ml-0.5" />
                    </button>
                  </div>

                  {/* Quick Actions */}
                  <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => handleToggleFavorite(e, song)}
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
                      onClick={(e) => {
                        e.stopPropagation();
                        openDownloadModal(song);
                      }}
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
      )}
    </div>
  );
}
