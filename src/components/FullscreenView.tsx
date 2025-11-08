import { useMusicStore } from "../store/useMusicStore";
import { getImage } from "../services/api";
// import AudioVisualizer from "./AudioVisualizer"; // Disabled due to CORS issues

interface FullscreenViewProps {
  audioRef?: React.RefObject<HTMLAudioElement>;
}

export default function FullscreenView({ audioRef }: FullscreenViewProps) {
  const { currentSong } = useMusicStore();

  if (!currentSong || !audioRef) return null;

  return (
    <div className="hidden fixed inset-0 bg-bg-dark z-[2000] flex-col items-center justify-center p-8">
      {/* Visualizer Background - DISABLED */}
      {/* <div className="absolute inset-0 opacity-30 blur-xl">
        <AudioVisualizer audioRef={audioRef} isPlaying={isPlaying} />
      </div> */}

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        <img
          src={getImage(currentSong.image)}
          className="w-80 h-80 rounded-2xl mb-8 shadow-2xl"
          alt={currentSong.name}
        />
        <h2 className="text-3xl font-bold text-center">{currentSong.name}</h2>
        <p className="text-xl text-text-secondary text-center mt-2">
          {currentSong.artists.primary.map((a) => a.name).join(", ")}
        </p>

        {/* Mini Visualizer - DISABLED */}
        {/* <div className="mt-8 w-full max-w-2xl h-32 glass rounded-2xl overflow-hidden">
          <AudioVisualizer audioRef={audioRef} isPlaying={isPlaying} />
        </div> */}
      </div>
    </div>
  );
}
