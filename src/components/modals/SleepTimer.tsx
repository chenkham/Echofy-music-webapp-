import { useState, useEffect } from "react";
import { X, Clock, Power } from "lucide-react";
import { useMusicStore } from "../../store/useMusicStore";

interface SleepTimerProps {
  isOpen: boolean;
  onClose: () => void;
}

const TIMER_OPTIONS = [
  { label: "5 minutes", value: 5 },
  { label: "10 minutes", value: 10 },
  { label: "15 minutes", value: 15 },
  { label: "30 minutes", value: 30 },
  { label: "45 minutes", value: 45 },
  { label: "1 hour", value: 60 },
];

export default function SleepTimer({ isOpen, onClose }: SleepTimerProps) {
  const { sleepTimerEnd, setSleepTimer } = useMusicStore();
  const [customMinutes, setCustomMinutes] = useState("");
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  useEffect(() => {
    if (!sleepTimerEnd) {
      setTimeRemaining(null);
      return;
    }

    const interval = setInterval(() => {
      const remaining = Math.max(0, sleepTimerEnd - Date.now());
      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sleepTimerEnd]);

  const handleSetTimer = (minutes: number) => {
    const endTime = Date.now() + minutes * 60 * 1000;
    setSleepTimer(endTime);
  };

  const handleCustomTimer = () => {
    const minutes = parseInt(customMinutes);
    if (minutes > 0) {
      handleSetTimer(minutes);
      setCustomMinutes("");
    }
  };

  const handleCancel = () => {
    setSleepTimer(null);
    setTimeRemaining(null);
  };

  const formatTimeRemaining = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
      <div className="glass-dark rounded-2xl shadow-glow max-w-md w-full p-6 animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center">
              <Clock size={20} className="text-black" />
            </div>
            <h2 className="text-xl font-bold">Sleep Timer</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-all duration-300"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Active Timer Display */}
        {timeRemaining !== null && timeRemaining > 0 && (
          <div className="mb-6 p-4 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl border border-primary/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-text-secondary mb-1">
                  Music will stop in
                </div>
                <div className="text-3xl font-bold gradient-text tabular-nums">
                  {formatTimeRemaining(timeRemaining)}
                </div>
              </div>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all duration-300 flex items-center gap-2"
              >
                <Power size={16} />
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Timer Options */}
        <div className="space-y-3 mb-4">
          <div className="text-sm text-text-secondary mb-2">Quick Select</div>
          <div className="grid grid-cols-2 gap-2">
            {TIMER_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSetTimer(option.value)}
                className="p-3 glass rounded-lg hover:bg-primary/10 hover:border-primary/30 border border-white/10 transition-all duration-300 text-sm font-medium group"
              >
                <Clock
                  size={16}
                  className="inline mr-2 group-hover:text-primary transition-colors"
                />
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Timer */}
        <div className="space-y-2">
          <div className="text-sm text-text-secondary">Custom Time</div>
          <div className="flex gap-2">
            <input
              type="number"
              min="1"
              max="999"
              value={customMinutes}
              onChange={(e) => setCustomMinutes(e.target.value)}
              placeholder="Enter minutes"
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300"
            />
            <button
              onClick={handleCustomTimer}
              disabled={!customMinutes || parseInt(customMinutes) <= 0}
              className="px-6 py-3 bg-gradient-to-r from-primary to-primary-600 text-black font-semibold rounded-lg hover:shadow-neon transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              Set
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-blue-300">
            💡 The music will automatically pause when the timer ends.
          </p>
        </div>
      </div>
    </div>
  );
}
