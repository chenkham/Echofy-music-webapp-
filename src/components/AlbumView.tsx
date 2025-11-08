import { useState, useEffect } from "react";
import { Play, Heart, Download, Share2, Clock, Disc3 } from "lucide-react";
import {
  getAlbumById,
  getImage,
  getArtists,
  formatTime,
} from "../services/api";
import { useMusicStore } from "../store/useMusicStore";
import { useDownloadStore } from "../store/useDownloadStore";
import type { Album } from "../types";

interface AlbumViewProps {
  albumId: string;
}

export default function AlbumView({ albumId }: AlbumViewProps) {
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);

  const {
    setCurrentSong,
    setQueue,
    setIsPlaying,
    favorites,
    addToFavorites,
    removeFromFavorites,
  } = useMusicStore();
  const { openDownloadModal } = useDownloadStore();

  useEffect(() => {
    const fetchAlbum = async () => {
      setLoading(true);
      const data = await getAlbumById(albumId);
      setAlbum(data);
      setLoading(false);
    };

    fetchAlbum();
  }, [albumId]);

  const handlePlayAlbum = () => {
    if (album?.songs && album.songs.length > 0) {
      setQueue(album.songs);
      setCurrentSong(album.songs[0]);
      setIsPlaying(true);
    }
  };

  const handlePlaySong = (song: any) => {
    if (album?.songs) {
      setQueue(album.songs);
      setCurrentSong(song);
      setIsPlaying(true);
    }
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

  if (!album) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <Disc3 size={64} className="text-text-muted mb-4 opacity-50" />
        <p className="text-xl font-semibold mb-2">Album not found</p>
        <p className="text-text-secondary">
          The album you're looking for doesn't exist or couldn't be loaded.
        </p>
        <p className="text-sm text-text-secondary mt-2">Album ID: {albumId}</p>
      </div>
    );
  }

  const totalDuration =
    album.songs?.reduce((acc, song) => acc + (song.duration || 0), 0) || 0;

  return (
    <div className="p-4 md:p-8 pb-32">
      {/* Album Header */}
      <div className="flex flex-col md:flex-row gap-6 mb-8">
        {/* Album Art */}
        <div className="w-full md:w-64 h-64 flex-shrink-0">
          <img
            src={getImage(album.image)}
            alt={album.name}
            className="w-full h-full object-cover rounded-2xl shadow-2xl"
          />
        </div>

        {/* Album Info */}
        <div className="flex-1 flex flex-col justify-end">
          <p className="text-sm text-text-secondary mb-2 uppercase tracking-wide">
            Album
          </p>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{album.name}</h1>

          {album.description && (
            <p className="text-text-secondary mb-4 line-clamp-2">
              {album.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-sm text-text-secondary mb-6">
            {album.artists && (
              <>
                <span className="font-semibold text-white">
                  {getArtists(album.artists)}
                </span>
                <span>•</span>
              </>
            )}
            <span>{album.year}</span>
            {album.songCount && (
              <>
                <span>•</span>
                <span>{album.songCount} songs</span>
              </>
            )}
            {totalDuration > 0 && (
              <>
                <span>•</span>
                <span>{formatTime(totalDuration)}</span>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button
              onClick={handlePlayAlbum}
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
        </div>
      </div>

      {/* Songs List */}
      <div className="glass rounded-2xl overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[auto_1fr_auto_auto] md:grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-3 border-b border-white/10 text-sm text-text-secondary">
          <div className="w-8">#</div>
          <div>Title</div>
          <div className="hidden md:block">Plays</div>
          <div className="text-center">
            <Clock size={16} className="mx-auto" />
          </div>
          <div className="w-16"></div>
        </div>

        {/* Songs */}
        <div>
          {album.songs?.map((song, index) => (
            <div
              key={song.id}
              onClick={() => handlePlaySong(song)}
              className="grid grid-cols-[auto_1fr_auto_auto] md:grid-cols-[auto_1fr_auto_auto_auto] gap-4 px-4 py-3 hover:bg-white/5 cursor-pointer group transition-colors items-center"
            >
              {/* Number */}
              <div className="w-8 text-text-secondary group-hover:text-white">
                <span className="group-hover:hidden">{index + 1}</span>
                <Play
                  size={16}
                  fill="white"
                  className="hidden group-hover:block"
                />
              </div>

              {/* Title & Artist */}
              <div className="min-w-0">
                <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                  {song.name}
                </h3>
                <p className="text-sm text-text-secondary truncate">
                  {getArtists(song.artists)}
                </p>
              </div>

              {/* Play Count */}
              <div className="hidden md:block text-sm text-text-secondary">
                {song.playCount
                  ? `${(song.playCount / 1000000).toFixed(1)}M`
                  : "-"}
              </div>

              {/* Duration */}
              <div className="text-sm text-text-secondary text-center">
                {formatTime(song.duration)}
              </div>

              {/* Actions */}
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
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openDownloadModal(song);
                  }}
                  className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Album Info Footer */}
      <div className="mt-8 glass rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <Disc3 size={40} className="text-primary flex-shrink-0" />
          <div>
            <h3 className="font-semibold mb-2">About this album</h3>
            <p className="text-sm text-text-secondary">
              {album.description ||
                `${album.name} by ${
                  album.artists ? getArtists(album.artists) : "Unknown Artist"
                }`}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {album.language && (
                <span className="px-3 py-1 glass rounded-full text-xs">
                  {album.language}
                </span>
              )}
              {album.year && (
                <span className="px-3 py-1 glass rounded-full text-xs">
                  Released: {album.year}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
