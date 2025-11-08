import { useState } from "react";
import { X, Clock } from "lucide-react";

interface TimerSetterProps {
  isOpen: boolean;
  onClose: () => void;
  currentTime: number;
  duration: number;
  onSetTime: (time: number) => void;
}

export default function TimerSetter({
  isOpen,
  onClose,
  currentTime,
  duration,
  onSetTime,
}: TimerSetterProps) {
  const [hours, setHours] = useState(
    Math.floor(currentTime / 3600)
      .toString()
      .padStart(2, "0")
  );
  const [minutes, setMinutes] = useState(
    Math.floor((currentTime % 3600) / 60)
      .toString()
      .padStart(2, "0")
  );
  const [seconds, setSeconds] = useState(
    Math.floor(currentTime % 60)
      .toString()
      .padStart(2, "0")
  );

  const handleApply = () => {
    const totalSeconds =
      (parseInt(hours) || 0) * 3600 +
      (parseInt(minutes) || 0) * 60 +
      (parseInt(seconds) || 0);

    if (totalSeconds >= 0 && totalSeconds <= duration) {
      onSetTime(totalSeconds);
      onClose();
    }
  };

  const formatTime = (time: number) => {
    const h = Math.floor(time / 3600);
    const m = Math.floor((time % 3600) / 60);
    const s = Math.floor(time % 60);
    return h > 0
      ? `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      : `${m}:${s.toString().padStart(2, "0")}`;
  };

  const handleQuickJump = (percent: number) => {
    const time = (duration * percent) / 100;
    onSetTime(time);
    onClose();
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
            <h2 className="text-xl font-bold">Set Time Position</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-all duration-300"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Current Position */}
        <div className="mb-6 p-4 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-xl border border-primary/30">
          <div className="text-sm text-text-secondary mb-1">
            Current Position
          </div>
          <div className="text-2xl font-bold gradient-text">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        {/* Time Input */}
        <div className="mb-6">
          <div className="text-sm text-text-secondary mb-3">
            Set New Position
          </div>
          <div className="flex items-center justify-center gap-2">
            <input
              type="number"
              min="0"
              max="23"
              value={hours}
              onChange={(e) => setHours(e.target.value.padStart(2, "0"))}
              className="w-16 px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-center text-xl font-mono focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300"
              placeholder="00"
            />
            <span className="text-2xl font-bold text-text-secondary">:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value.padStart(2, "0"))}
              className="w-16 px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-center text-xl font-mono focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300"
              placeholder="00"
            />
            <span className="text-2xl font-bold text-text-secondary">:</span>
            <input
              type="number"
              min="0"
              max="59"
              value={seconds}
              onChange={(e) => setSeconds(e.target.value.padStart(2, "0"))}
              className="w-16 px-3 py-3 bg-white/5 border border-white/10 rounded-lg text-center text-xl font-mono focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300"
              placeholder="00"
            />
          </div>
          <div className="text-center text-xs text-text-secondary mt-2">
            Hours : Minutes : Seconds
          </div>
        </div>

        {/* Quick Jump Buttons */}
        <div className="mb-6">
          <div className="text-sm text-text-secondary mb-3">Quick Jump</div>
          <div className="grid grid-cols-4 gap-2">
            {[0, 25, 50, 75].map((percent) => (
              <button
                key={percent}
                onClick={() => handleQuickJump(percent)}
                className="p-3 glass rounded-lg hover:bg-primary/10 hover:border-primary/30 border border-white/10 transition-all duration-300 text-sm font-medium"
              >
                {percent}%
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 glass rounded-lg font-semibold hover:bg-white/10 transition-all duration-300"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-primary to-primary-600 text-black font-semibold rounded-lg hover:shadow-neon transition-all duration-300"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
