import { X, ListMusic, Play, Trash2, GripVertical } from "lucide-react";
import { useMusicStore } from "../../store/useMusicStore";
import {
  getImage,
  getArtists,
  formatTime,
  truncateText,
} from "../../services/api";

interface QueueModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QueueModal({ isOpen, onClose }: QueueModalProps) {
  const { queue, queueIndex, currentSong, setQueue, setCurrentSong } =
    useMusicStore();

  const handlePlaySong = (index: number) => {
    setCurrentSong(queue[index]);
    setQueue(queue, index);
  };

  const handleRemoveFromQueue = (index: number) => {
    const newQueue = queue.filter((_, i) => i !== index);
    const newIndex = index < queueIndex ? queueIndex - 1 : queueIndex;
    setQueue(newQueue, newIndex);
  };

  const handleClearQueue = () => {
    setQueue([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <div className="glass-dark rounded-2xl shadow-glow max-w-2xl w-full max-h-[80vh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center">
              <ListMusic size={20} className="text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Queue</h2>
              <p className="text-sm text-text-secondary">
                {queue.length} {queue.length === 1 ? "song" : "songs"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {queue.length > 0 && (
              <button
                onClick={handleClearQueue}
                className="px-4 py-2 text-sm bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300 flex items-center gap-2"
              >
                <Trash2 size={16} />
                Clear All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-all duration-300"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Queue List */}
        <div className="overflow-y-auto max-h-[calc(80vh-100px)]">
          {queue.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-text-secondary">
              <ListMusic size={48} className="mb-4 opacity-50" />
              <p className="text-lg">Queue is empty</p>
              <p className="text-sm">Add some songs to get started</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {queue.map((song, index) => {
                const isCurrentSong =
                  currentSong?.id === song.id && index === queueIndex;
                const isPlayed = index < queueIndex;

                return (
                  <div
                    key={`${song.id}-${index}`}
                    className={`group flex items-center gap-3 p-3 rounded-lg transition-all duration-300 ${
                      isCurrentSong
                        ? "bg-primary/20 border border-primary/30"
                        : isPlayed
                        ? "opacity-50 hover:opacity-100 hover:bg-white/5"
                        : "hover:bg-white/5"
                    }`}
                  >
                    {/* Drag Handle */}
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                      <GripVertical size={16} className="text-text-secondary" />
                    </button>

                    {/* Index or Playing Indicator */}
                    <div className="w-6 text-center">
                      {isCurrentSong ? (
                        <div className="flex items-center justify-center">
                          <div className="w-1 h-3 bg-primary animate-pulse mr-0.5" />
                          <div
                            className="w-1 h-4 bg-primary animate-pulse"
                            style={{ animationDelay: "0.2s" }}
                          />
                          <div
                            className="w-1 h-3 bg-primary animate-pulse ml-0.5"
                            style={{ animationDelay: "0.4s" }}
                          />
                        </div>
                      ) : (
                        <span className="text-xs text-text-secondary">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    {/* Song Image */}
                    <div className="relative group/img">
                      <img
                        src={getImage(song.image)}
                        alt={song.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <button
                        onClick={() => handlePlaySong(index)}
                        className="absolute inset-0 bg-black/60 rounded flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity"
                      >
                        <Play size={20} fill="white" className="text-white" />
                      </button>
                    </div>

                    {/* Song Info */}
                    <div className="flex-1 min-w-0">
                      <div
                        className={`font-medium truncate ${
                          isCurrentSong ? "text-primary" : ""
                        }`}
                      >
                        {truncateText(song.name, 40)}
                      </div>
                      <div className="text-sm text-text-secondary truncate">
                        {truncateText(getArtists(song.artists), 30)}
                      </div>
                    </div>

                    {/* Duration */}
                    <div className="text-xs text-text-secondary tabular-nums">
                      {formatTime(song.duration)}
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveFromQueue(index)}
                      className="opacity-0 group-hover:opacity-100 p-2 rounded-full hover:bg-red-500/20 hover:text-red-400 transition-all duration-300"
                      aria-label="Remove from queue"
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {queue.length > 0 && (
          <div className="p-4 border-t border-white/10 bg-bg-dark/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">
                Total Duration:{" "}
                {formatTime(
                  queue.reduce((acc, song) => acc + song.duration, 0)
                )}
              </span>
              <span className="text-text-secondary">
                Up Next: {queue.length - queueIndex - 1}{" "}
                {queue.length - queueIndex - 1 === 1 ? "song" : "songs"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
