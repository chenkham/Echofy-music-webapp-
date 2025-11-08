import { useState } from "react";
import { X, Download, Check } from "lucide-react";
import type { Song, DownloadQuality } from "../../types";

interface DownloadQualityModalProps {
  isOpen: boolean;
  onClose: () => void;
  song: Song | null;
  onDownload: (url: string, quality: string) => void;
}

export default function DownloadQualityModal({
  isOpen,
  onClose,
  song,
  onDownload,
}: DownloadQualityModalProps) {
  const [selectedQuality, setSelectedQuality] = useState<string | null>(null);

  if (!isOpen || !song) return null;

  const availableQualities = song.downloadUrl || [];

  // Sort qualities from highest to lowest
  const sortedQualities = [...availableQualities].sort((a, b) => {
    const getKbps = (quality: string) => parseInt(quality.replace(/\D/g, ""));
    return getKbps(b.quality) - getKbps(a.quality);
  });

  const getQualityLabel = (quality: DownloadQuality) => {
    const kbps = quality.quality;
    let label = kbps;
    let description = "";

    switch (kbps) {
      case "320kbps":
        label = "Very High";
        description = "320 kbps • Best quality";
        break;
      case "160kbps":
        label = "High";
        description = "160 kbps • Good quality";
        break;
      case "96kbps":
        label = "Medium";
        description = "96 kbps • Standard quality";
        break;
      case "48kbps":
        label = "Low";
        description = "48 kbps • Small size";
        break;
      case "12kbps":
        label = "Preview";
        description = "12 kbps • Lowest quality";
        break;
      default:
        label = kbps;
        description = kbps;
    }

    return { label, description };
  };

  const handleDownload = () => {
    if (selectedQuality) {
      const quality = sortedQualities.find((q) => q.quality === selectedQuality);
      if (quality) {
        onDownload(quality.url, quality.quality);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[2001] p-4">
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 rounded-2xl w-full max-w-md border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Download className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Download Quality</h2>
              <p className="text-sm text-neutral-400">Choose your preferred quality</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Song Info */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <img
              src={song.image.find((img) => img.quality === "500x500")?.url || song.image[0].url}
              alt={song.name}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{song.name}</h3>
              <p className="text-sm text-neutral-400 truncate">{song.primaryArtists}</p>
            </div>
          </div>
        </div>

        {/* Quality Options */}
        <div className="p-6 space-y-2 max-h-[400px] overflow-y-auto">
          {sortedQualities.map((quality) => {
            const { label, description } = getQualityLabel(quality);
            const isSelected = selectedQuality === quality.quality;

            return (
              <button
                key={quality.quality}
                onClick={() => setSelectedQuality(quality.quality)}
                className={`w-full p-4 rounded-xl border-2 transition-all text-left flex items-center justify-between group ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-neon"
                    : "border-white/10 hover:border-white/20 hover:bg-white/5"
                }`}
              >
                <div>
                  <div className="font-semibold text-lg">{label}</div>
                  <div className="text-sm text-neutral-400">{description}</div>
                </div>
                {isSelected && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-4 h-4 text-black" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-full border border-white/20 hover:bg-white/5 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={!selectedQuality}
            className={`flex-1 px-6 py-3 rounded-full font-medium transition-all flex items-center justify-center gap-2 ${
              selectedQuality
                ? "bg-primary text-black hover:bg-primary/90 shadow-neon"
                : "bg-neutral-800 text-neutral-500 cursor-not-allowed"
            }`}
          >
            <Download className="w-5 h-5" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
