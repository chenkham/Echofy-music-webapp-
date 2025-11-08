import { useState, useEffect } from "react";
import { X, Music2, Loader } from "lucide-react";
import { getLyrics } from "../../services/api";
import { Song } from "../../types";

interface LyricsModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
}

export default function LyricsModal({
  isOpen,
  onClose,
  song,
}: LyricsModalProps) {
  const [lyrics, setLyrics] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (isOpen && song) {
      loadLyrics();
    }
  }, [isOpen, song]);

  const loadLyrics = async () => {
    if (!song) return;

    setLoading(true);
    setError(false);

    try {
      const artistName = song.artists.primary[0]?.name || "Unknown";
      const lyricsText = await getLyrics(song.name, artistName);

      if (lyricsText) {
        setLyrics(lyricsText);
      } else {
        setError(true);
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !song) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <div className="glass-dark rounded-2xl shadow-glow max-w-2xl w-full max-h-[80vh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 sticky top-0 glass-dark z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center">
              <Music2 size={20} className="text-black" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Lyrics</h2>
              <p className="text-sm text-text-secondary">{song.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-all duration-300"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader className="animate-spin text-primary mb-4" size={48} />
              <p className="text-text-secondary">Loading lyrics...</p>
            </div>
          )}

          {error && !loading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Music2
                size={48}
                className="text-text-secondary mb-4 opacity-50"
              />
              <p className="text-lg font-semibold mb-2">Lyrics not found</p>
              <p className="text-sm text-text-secondary">
                We couldn't find lyrics for this song.
              </p>
            </div>
          )}

          {lyrics && !loading && !error && (
            <div className="space-y-4">
              <div className="p-4 glass rounded-xl">
                <div className="flex items-center gap-3 mb-4">
                  <img
                    src={song.image[song.image.length - 1]?.url}
                    alt={song.name}
                    className="w-16 h-16 rounded-lg"
                  />
                  <div>
                    <h3 className="font-bold">{song.name}</h3>
                    <p className="text-sm text-text-secondary">
                      {song.artists.primary.map((a) => a.name).join(", ")}
                    </p>
                  </div>
                </div>
              </div>

              <div className="glass-dark rounded-xl p-6">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {lyrics}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
