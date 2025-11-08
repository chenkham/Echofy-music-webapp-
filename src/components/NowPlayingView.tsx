import { useState } from "react";
import {
  Heart,
  MoreVertical,
  Share2,
  Download,
  ListMusic,
  ChevronDown,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Music2,
  User,
  Calendar,
  Disc3,
} from "lucide-react";
import { useMusicStore } from "../store/useMusicStore";
import { getImage, getArtists, formatTime } from "../services/api";
import type { Song } from "../types";

interface NowPlayingViewProps {
  isOpen: boolean;
  onClose: () => void;
  audioRef: React.RefObject<HTMLAudioElement>;
  currentTime: number;
  duration: number;
  onSeek: (e: React.MouseEvent<HTMLDivElement>) => void;
  onQueueClick: () => void;
  onLyricsClick: () => void;
  onDownloadClick?: (song: Song) => void;
}

export default function NowPlayingView({
  isOpen,
  onClose,
  audioRef,
  currentTime,
  duration,
  onSeek,
  onQueueClick,
  onLyricsClick,
  onDownloadClick,
}: NowPlayingViewProps) {
  const {
    currentSong,
    isPlaying,
    shuffle,
    repeat,
    volume,
    favorites,
    setIsPlaying,
    toggleShuffle,
    toggleRepeat,
    setVolume,
    addToFavorites,
    removeFromFavorites,
    nextSong,
    previousSong,
  } = useMusicStore();

  const [activeTab, setActiveTab] = useState<"lyrics" | "artist" | "queue">(
    "lyrics"
  );

  if (!isOpen || !currentSong) return null;

  const isLiked = favorites.some((s) => s.id === currentSong.id);

  const togglePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 via-black to-black z-[2000] overflow-hidden animate-in slide-in-from-bottom duration-300">
      {/* Background with Album Art Blur */}
      <div
        className="absolute inset-0 opacity-20 blur-3xl"
        style={{
          backgroundImage: `url(${getImage(currentSong.image)})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 md:p-6">
        <button
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full transition-all"
        >
          <ChevronDown size={24} />
        </button>
        <div className="text-center flex-1">
          <div className="text-xs text-text-secondary uppercase tracking-wider">
            Playing from Discover
          </div>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-full transition-all">
          <MoreVertical size={24} />
        </button>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col md:flex-row gap-8 p-4 md:p-8 h-[calc(100%-200px)] overflow-y-auto">
        {/* Left: Album Art & Info */}
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto md:mx-0">
          {/* Album Art */}
          <div className="relative group w-full max-w-md aspect-square mb-8">
            <img
              src={getImage(currentSong.image)}
              alt={currentSong.name}
              className="w-full h-full object-cover rounded-2xl shadow-2xl shadow-black/50"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          {/* Song Info */}
          <div className="text-center md:text-left w-full max-w-md">
            <h1 className="text-2xl md:text-4xl font-bold mb-2 line-clamp-2">
              {currentSong.name}
            </h1>
            <p className="text-lg md:text-xl text-text-secondary mb-4">
              {getArtists(currentSong.artists)}
            </p>

            {/* Action Buttons */}
            <div className="flex items-center justify-center md:justify-start gap-4 mb-6">
              <button
                onClick={() =>
                  isLiked
                    ? removeFromFavorites(currentSong.id)
                    : addToFavorites(currentSong)
                }
                className="p-3 hover:bg-white/10 rounded-full transition-all"
              >
                <Heart
                  size={24}
                  fill={isLiked ? "#1DB954" : "none"}
                  className={isLiked ? "text-primary" : ""}
                />
              </button>
              <button className="p-3 hover:bg-white/10 rounded-full transition-all">
                <Share2 size={24} />
              </button>
              <button
                onClick={() => currentSong && onDownloadClick?.(currentSong)}
                className="p-3 hover:bg-white/10 rounded-full transition-all"
              >
                <Download size={24} />
              </button>
              <button
                onClick={onQueueClick}
                className="p-3 hover:bg-white/10 rounded-full transition-all"
              >
                <ListMusic size={24} />
              </button>
            </div>

            {/* Song Details */}
            <div className="grid grid-cols-2 gap-4 glass-dark p-4 rounded-xl">
              <div className="flex items-center gap-3">
                <Music2 size={18} className="text-primary" />
                <div>
                  <div className="text-xs text-text-secondary">Album</div>
                  <div className="text-sm font-medium">
                    {currentSong.album?.name || "Single"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User size={18} className="text-primary" />
                <div>
                  <div className="text-xs text-text-secondary">Artist</div>
                  <div className="text-sm font-medium truncate">
                    {getArtists(currentSong.artists)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-primary" />
                <div>
                  <div className="text-xs text-text-secondary">Year</div>
                  <div className="text-sm font-medium">
                    {currentSong.year || "2024"}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Disc3 size={18} className="text-primary" />
                <div>
                  <div className="text-xs text-text-secondary">Duration</div>
                  <div className="text-sm font-medium">
                    {formatTime(currentSong.duration || duration)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Tabs (Lyrics/Artist/Queue) */}
        <div className="flex-1 max-w-2xl mx-auto md:mx-0">
          {/* Tab Headers */}
          <div className="flex gap-4 border-b border-white/10 mb-6">
            <button
              onClick={() => setActiveTab("lyrics")}
              className={`pb-3 px-2 transition-all ${
                activeTab === "lyrics"
                  ? "text-primary border-b-2 border-primary font-semibold"
                  : "text-text-secondary hover:text-white"
              }`}
            >
              Lyrics
            </button>
            <button
              onClick={() => setActiveTab("artist")}
              className={`pb-3 px-2 transition-all ${
                activeTab === "artist"
                  ? "text-primary border-b-2 border-primary font-semibold"
                  : "text-text-secondary hover:text-white"
              }`}
            >
              Artist
            </button>
            <button
              onClick={() => setActiveTab("queue")}
              className={`pb-3 px-2 transition-all ${
                activeTab === "queue"
                  ? "text-primary border-b-2 border-primary font-semibold"
                  : "text-text-secondary hover:text-white"
              }`}
            >
              Queue
            </button>
          </div>

          {/* Tab Content */}
          <div className="glass-dark rounded-2xl p-6 h-[400px] overflow-y-auto">
            {activeTab === "lyrics" && (
              <div className="space-y-4">
                <div className="text-center py-12">
                  <Music2
                    size={48}
                    className="mx-auto text-text-muted mb-4 opacity-50"
                  />
                  <p className="text-text-muted mb-2">Lyrics not available</p>
                  <p className="text-sm text-text-secondary">
                    Enjoy the music while we work on getting lyrics
                  </p>
                  <button
                    onClick={onLyricsClick}
                    className="mt-4 px-4 py-2 bg-primary/20 hover:bg-primary/30 rounded-full text-primary font-semibold transition-all"
                  >
                    Try Lyrics Search
                  </button>
                </div>
              </div>
            )}

            {activeTab === "artist" && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center shadow-neon">
                    <User size={40} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">
                      {getArtists(currentSong.artists)}
                    </h3>
                    <p className="text-text-secondary">Artist</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <h4 className="font-semibold text-lg">About</h4>
                  <p className="text-text-secondary leading-relaxed">
                    Explore more music from this talented artist. Discover their
                    unique sound and musical journey.
                  </p>
                </div>
              </div>
            )}

            {activeTab === "queue" && (
              <div className="space-y-2">
                <h4 className="font-semibold mb-4">Up Next</h4>
                <div className="text-center py-8 text-text-secondary">
                  <ListMusic size={40} className="mx-auto mb-2 opacity-50" />
                  <p>Queue is empty</p>
                  <button
                    onClick={onQueueClick}
                    className="mt-3 text-primary hover:underline text-sm"
                  >
                    View Full Queue
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Player Controls - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 z-20 glass-dark border-t border-white/10 p-4 md:p-6">
        {/* Progress Bar */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-text-secondary min-w-[40px] tabular-nums">
            {formatTime(currentTime)}
          </span>
          <div
            onClick={onSeek}
            className="flex-1 h-2 bg-white/10 rounded-full cursor-pointer group relative"
          >
            <div
              className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full relative"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
          <span className="text-xs text-text-secondary min-w-[40px] tabular-nums">
            {formatTime(duration)}
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          {/* Left: Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`p-2 rounded-full transition-all ${
              shuffle ? "text-primary" : "text-text-secondary hover:text-white"
            }`}
          >
            <Shuffle size={20} />
          </button>

          {/* Center: Playback */}
          <div className="flex items-center gap-4">
            <button
              onClick={previousSong}
              className="p-2 hover:bg-white/10 rounded-full transition-all"
            >
              <SkipBack size={24} />
            </button>
            <button
              onClick={togglePlayPause}
              className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-all shadow-lg"
            >
              {isPlaying ? (
                <Pause size={24} />
              ) : (
                <Play size={24} className="ml-1" />
              )}
            </button>
            <button
              onClick={nextSong}
              className="p-2 hover:bg-white/10 rounded-full transition-all"
            >
              <SkipForward size={24} />
            </button>
          </div>

          {/* Right: Repeat & Volume */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleRepeat}
              className={`p-2 rounded-full transition-all relative ${
                repeat !== "off"
                  ? "text-primary"
                  : "text-text-secondary hover:text-white"
              }`}
            >
              <Repeat size={20} />
              {repeat === "one" && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full text-[10px] flex items-center justify-center text-black font-bold">
                  1
                </span>
              )}
            </button>
            <button
              onClick={() => setVolume(volume === 0 ? 100 : 0)}
              className="p-2 hover:bg-white/10 rounded-full transition-all hidden md:block"
            >
              {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
