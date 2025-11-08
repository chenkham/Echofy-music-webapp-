interface WaveformProps {
  isPlaying: boolean;
  className?: string;
}

export default function Waveform({ isPlaying, className = "" }: WaveformProps) {
  return (
    <div className={`flex items-center gap-0.5 h-6 ${className}`}>
      {[...Array(40)].map((_, i) => (
        <div
          key={i}
          className={`w-0.5 bg-gradient-to-t from-primary via-purple-500 to-accent rounded-full transition-all duration-150 ${
            isPlaying ? "animate-wave" : "h-1"
          }`}
          style={{
            animationDelay: `${i * 0.05}s`,
            height: isPlaying ? `${20 + Math.random() * 80}%` : "4px",
          }}
        />
      ))}
    </div>
  );
}
