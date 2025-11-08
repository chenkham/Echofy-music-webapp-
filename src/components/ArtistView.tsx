import { useState, useEffect } from "react";
import { Play, Heart, Share2, Music2 } from "lucide-react";
import {
  getArtistById,
  getArtistSongs,
  getArtistAlbums,
  getImage,
  formatTime,
} from "../services/api";
import { useMusicStore } from "../store/useMusicStore";
import type { ArtistDetails } from "../types";

interface ArtistViewProps {
  artistId: string;
  onAlbumClick?: (albumId: string) => void;
}

export default function ArtistView({
  artistId,
  onAlbumClick,
}: ArtistViewProps) {
  const [artist, setArtist] = useState<ArtistDetails | null>(null);
  const [songs, setSongs] = useState<any[]>([]);
  const [albums, setAlbums] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"songs" | "albums">("songs");
  const [loading, setLoading] = useState(true);

  const {
    setCurrentSong,
    setQueue,
    setIsPlaying,
    favorites,
    addToFavorites,
    removeFromFavorites,
  } = useMusicStore();

  useEffect(() => {
    const fetchArtist = async () => {
      setLoading(true);
      const [artistData, songsData, albumsData] = await Promise.all([
        getArtistById(artistId),
        getArtistSongs(artistId, 0, "latest"),
        getArtistAlbums(artistId, 0),
      ]);

      setArtist(artistData);
      setSongs(songsData);
      setAlbums(albumsData);
      setLoading(false);
    };

    fetchArtist();
  }, [artistId]);
  const handlePlayTopSongs = () => {
    if (songs.length > 0) {
      setQueue(songs);
      setCurrentSong(songs[0]);
      setIsPlaying(true);
    }
  };

  const handlePlaySong = (song: any) => {
    setQueue(songs);
    setCurrentSong(song);
    setIsPlaying(true);
  };

  const isFavorited = (songId: string) =>
    favorites.some((s) => s.id === songId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Music2 size={64} className="text-text-muted mb-4 opacity-50" />
        <p className="text-xl font-semibold mb-2">Artist not found</p>
        <p className="text-text-secondary">
          The artist you're looking for doesn't exist or couldn't be loaded.
        </p>
        <p className="text-sm text-text-secondary mt-2">
          Artist ID: {artistId}
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 pb-32">
      {/* Artist Header */}
      <div className="relative mb-8">
        {/* Background Image */}
        <div
          className="absolute inset-0 h-96 bg-gradient-to-b from-primary/20 to-transparent rounded-2xl overflow-hidden"
          style={{
            backgroundImage: `url(${getImage(artist.image)})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "blur(40px)",
            opacity: 0.3,
          }}
        />

        {/* Content */}
        <div className="relative flex flex-col md:flex-row gap-6 items-end pt-16">
          <div className="w-48 h-48 rounded-full overflow-hidden shadow-2xl flex-shrink-0 border-4 border-white/10">
            <img
              src={getImage(artist.image)}
              alt={artist.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex-1 pb-4">
            <p className="text-sm text-text-secondary mb-2 uppercase tracking-wide flex items-center gap-2">
              {artist.isVerified && (
                <span className="w-5 h-5 rounded-full bg-primary flex items-center justify-center text-black text-xs">
                  ✓
                </span>
              )}
              Verified Artist
            </p>
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              {artist.name}
            </h1>

            <div className="flex items-center gap-4 text-sm text-text-secondary">
              {artist.followerCount && (
                <span>
                  {(artist.followerCount / 1000000).toFixed(1)}M followers
                </span>
              )}
              {artist.dominantLanguage && (
                <>
                  <span>•</span>
                  <span>{artist.dominantLanguage}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={handlePlayTopSongs}
          className="px-8 py-3 bg-primary text-black rounded-full font-semibold hover:scale-105 transition-transform flex items-center gap-2"
        >
          <Play size={20} fill="black" />
          Play
        </button>
        <button className="w-12 h-12 rounded-full border border-white/20 hover:bg-white/10 transition-colors flex items-center justify-center">
          <Heart size={20} />
        </button>
        <button className="w-12 h-12 rounded-full border border-white/20 hover:bg-white/10 transition-colors flex items-center justify-center">
          <Share2 size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 mb-6 border-b border-white/10">
        <button
          onClick={() => setActiveTab("songs")}
          className={`pb-3 px-2 font-semibold transition-all relative ${
            activeTab === "songs"
              ? "text-white"
              : "text-text-secondary hover:text-white"
          }`}
        >
          Popular Songs
          {activeTab === "songs" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("albums")}
          className={`pb-3 px-2 font-semibold transition-all relative ${
            activeTab === "albums"
              ? "text-white"
              : "text-text-secondary hover:text-white"
          }`}
        >
          Albums
          {activeTab === "albums" && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Content */}
      {activeTab === "songs" ? (
        <div className="space-y-2">
          {songs.slice(0, 10).map((song, index) => (
            <div
              key={song.id}
              onClick={() => handlePlaySong(song)}
              className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 cursor-pointer group transition-colors"
            >
              <div className="w-10 text-center text-text-secondary group-hover:text-white">
                <span className="group-hover:hidden">{index + 1}</span>
                <Play
                  size={16}
                  fill="white"
                  className="hidden group-hover:inline-block"
                />
              </div>

              <img
                src={getImage(song.image)}
                alt={song.name}
                className="w-12 h-12 rounded object-cover"
              />

              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                  {song.name}
                </h3>
                <p className="text-sm text-text-secondary truncate">
                  {song.playCount
                    ? `${(song.playCount / 1000000).toFixed(1)}M plays`
                    : ""}
                </p>
              </div>

              <div className="text-sm text-text-secondary">
                {formatTime(song.duration)}
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    isFavorited(song.id)
                      ? removeFromFavorites(song.id)
                      : addToFavorites(song);
                  }}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"
                >
                  <Heart
                    size={16}
                    fill={isFavorited(song.id) ? "#1DB954" : "none"}
                    className={isFavorited(song.id) ? "text-primary" : ""}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {albums.map((album) => (
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

              <h3 className="font-semibold truncate mb-1">{album.name}</h3>
              <p className="text-sm text-text-secondary truncate">
                {album.year} • {album.type}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Artist Bio */}
      {artist.bio && (
        <div className="mt-8 glass rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <Music2 size={40} className="text-primary flex-shrink-0" />
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-sm text-text-secondary line-clamp-4">
                {artist.bio}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
