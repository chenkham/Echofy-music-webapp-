import { useState, useEffect } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Volume2,
  VolumeX,
  Heart,
  Download,
  ListMusic,
  Radio,
  FileText,
} from "lucide-react";
import { useMusicStore } from "../store/useMusicStore";
import {
  getImage,
  getArtists,
  formatTime,
  truncateText,
} from "../services/api";
import type { Song } from "../types";

interface PlayerBarProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  onQueueClick: () => void;
  onTimerSetterClick: () => void;
  onLyricsClick: () => void;
  onNowPlayingClick: () => void;
  onDownloadClick?: (song: Song) => void;
}

export default function PlayerBar({
  audioRef,
  onQueueClick,
  onTimerSetterClick,
  onLyricsClick,
  onNowPlayingClick,
  onDownloadClick,
}: PlayerBarProps) {
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

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setCurrentTime(audio.currentTime);
    };

    const updateDuration = () => {
      if (audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };

    // Set initial values if already loaded
    if (audio.duration && !isNaN(audio.duration)) {
      setDuration(audio.duration);
    }
    if (audio.currentTime) {
      setCurrentTime(audio.currentTime);
    }

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("canplay", updateDuration);
    audio.addEventListener("loadeddata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("canplay", updateDuration);
      audio.removeEventListener("loadeddata", updateDuration);
    };
  }, [audioRef, currentSong]);

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * audio.duration;
  };

  const handleDownload = () => {
    if (!currentSong) return;
    if (onDownloadClick) {
      onDownloadClick(currentSong);
    }
  };

  const isLiked = currentSong && favorites.some((s) => s.id === currentSong.id);

  if (!currentSong) {
    return (
      <div className="fixed bottom-0 left-0 lg:left-[280px] right-0 glass-dark border-t border-white/10 p-4 z-[1000] min-h-[90px] backdrop-blur-xl">
        <div className="text-center text-text-secondary flex items-center justify-center gap-2">
          <Radio className="animate-pulse" size={20} />
          <span>Select a song to play</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 lg:left-[280px] right-0 glass-dark border-t border-white/10 px-4 lg:px-8 py-3 lg:py-4 z-[1000] backdrop-blur-xl">
      <div className="max-w-[1920px] mx-auto flex items-center gap-4 lg:gap-8">
        {/* Now Playing - Fixed Width on Desktop */}
        <div
          className="hidden lg:flex items-center gap-4 w-[300px] xl:w-[350px] cursor-pointer hover:bg-white/5 p-2 -ml-2 rounded-lg transition-all"
          onClick={onNowPlayingClick}
        >
          <div className="relative group flex-shrink-0">
            <img
              src={getImage(currentSong.image)}
              alt={currentSong.name}
              className="w-16 h-16 rounded-lg shadow-lg group-hover:shadow-primary/30 transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold truncate hover:text-primary transition-colors">
              {truncateText(currentSong.name, 35)}
            </div>
            <div className="text-sm text-text-secondary truncate">
              {truncateText(getArtists(currentSong.artists), 30)}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              isLiked
                ? removeFromFavorites(currentSong.id)
                : addToFavorites(currentSong);
            }}
            className="p-2 rounded-full hover:bg-white/10 transition-all duration-300 group flex-shrink-0"
            aria-label={isLiked ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              size={20}
              fill={isLiked ? "#1DB954" : "none"}
              className={`transition-all duration-300 ${
                isLiked
                  ? "text-primary scale-110"
                  : "text-text-secondary group-hover:text-primary group-hover:scale-110"
              }`}
            />
          </button>
        </div>

        {/* Mobile Now Playing */}
        <div
          className="lg:hidden flex items-center gap-3 flex-1 min-w-0 cursor-pointer hover:bg-white/5 p-2 -ml-2 rounded-lg transition-all"
          onClick={onNowPlayingClick}
        >
          <div className="relative group">
            <img
              src={getImage(currentSong.image)}
              alt={currentSong.name}
              className="w-12 h-12 rounded-lg shadow-lg group-hover:shadow-primary/30 transition-all duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold truncate text-sm hover:text-primary transition-colors cursor-pointer">
              {truncateText(currentSong.name, 30)}
            </div>
            <div className="text-xs text-text-secondary truncate">
              {truncateText(getArtists(currentSong.artists), 25)}
            </div>
          </div>
        </div>

        {/* Player Controls - Centered and Flex Grow */}
        <div className="flex-1 flex flex-col gap-2 max-w-[700px] mx-auto">
          <div className="flex items-center justify-center gap-2 lg:gap-4">
            <button
              onClick={toggleShuffle}
              className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                shuffle
                  ? "text-primary bg-primary/10 shadow-neon"
                  : "text-text-secondary hover:bg-white/10 hover:text-white"
              }`}
              aria-label="Toggle shuffle"
            >
              <Shuffle size={18} />
            </button>
            <button
              onClick={previousSong}
              className="p-2 rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-110 hover:text-primary"
              aria-label="Previous song"
            >
              <SkipBack size={20} />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary to-primary-600 text-black rounded-full flex items-center justify-center hover:scale-110 transition-all duration-300 shadow-glow hover:shadow-neon group"
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause
                  size={22}
                  className="group-hover:scale-110 transition-transform"
                />
              ) : (
                <Play
                  size={22}
                  fill="black"
                  className="ml-0.5 group-hover:scale-110 transition-transform"
                />
              )}
            </button>
            <button
              onClick={nextSong}
              className="p-2 rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-110 hover:text-primary"
              aria-label="Next song"
            >
              <SkipForward size={20} />
            </button>
            <button
              onClick={toggleRepeat}
              className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                repeat !== "off"
                  ? "text-primary bg-primary/10 shadow-neon"
                  : "text-text-secondary hover:bg-white/10 hover:text-white"
              }`}
              aria-label={`Repeat: ${repeat}`}
            >
              <Repeat size={18} />
              {repeat === "one" && (
                <span className="absolute -top-1 -right-1 text-[10px] font-bold bg-primary text-black rounded-full w-4 h-4 flex items-center justify-center">
                  1
                </span>
              )}
            </button>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={onTimerSetterClick}
              className="text-[10px] md:text-xs text-text-secondary min-w-[35px] md:min-w-[40px] tabular-nums hover:text-primary transition-colors cursor-pointer"
              aria-label="Set time position"
            >
              {formatTime(currentTime)}
            </button>
            <div
              onClick={seek}
              className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div
                className="h-full bg-gradient-to-r from-primary-400 via-primary to-primary-600 rounded-full relative transition-all duration-150"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 scale-0 group-hover:scale-100" />
              </div>
            </div>
            <span className="text-[10px] md:text-xs text-text-secondary min-w-[35px] md:min-w-[40px] tabular-nums">
              {formatTime(duration)}
            </span>
          </div>
        </div>

        {/* Volume & Actions - Fixed Width on Desktop */}
        <div className="hidden lg:flex items-center gap-3 justify-end w-[300px] xl:w-[350px]">
          <div
            className="relative"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <button
              onClick={() => setVolume(volume === 0 ? 100 : 0)}
              className="p-2 rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-110 hover:text-primary"
              aria-label={volume === 0 ? "Unmute" : "Mute"}
            >
              {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <div
              className={`absolute bottom-full right-0 mb-2 transition-all duration-300 ${
                showVolumeSlider
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2 pointer-events-none"
              }`}
            >
              <div className="glass-dark rounded-lg p-3 shadow-glow">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(parseInt(e.target.value))}
                  className="w-24 accent-primary cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #1DB954 0%, #1DB954 ${volume}%, rgba(255,255,255,0.1) ${volume}%, rgba(255,255,255,0.1) 100%)`,
                  }}
                />
                <div className="text-xs text-center mt-1 text-text-secondary tabular-nums">
                  {volume}%
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleDownload}
            className="p-2 rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-110 hover:text-primary group"
            aria-label="Download song"
          >
            <Download size={18} className="group-hover:animate-bounce" />
          </button>

          <button
            onClick={onQueueClick}
            className="p-2 rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-110 hover:text-primary"
            aria-label="Show queue"
          >
            <ListMusic size={18} />
          </button>

          <button
            onClick={onLyricsClick}
            className="p-2 rounded-full hover:bg-white/10 transition-all duration-300 hover:scale-110 hover:text-primary"
            aria-label="Show lyrics"
          >
            <FileText size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
