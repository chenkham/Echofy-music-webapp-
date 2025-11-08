import { useEffect, useRef } from "react";
import { useMusicStore } from "../store/useMusicStore";
import { getSongById } from "../services/api";
import toast from "react-hot-toast";

export const useAudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const {
    currentSong,
    isPlaying,
    volume,
    repeat,
    sleepTimerEnd,
    setIsPlaying,
    addToHistory,
    nextSong,
  } = useMusicStore();

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = "metadata";
    }

    const audio = audioRef.current;

    const handleEnded = () => {
      if (repeat === "one") {
        audio.currentTime = 0;
        audio.play();
      } else {
        nextSong();
      }
    };

    const handleError = () => {
      toast.error("Playback error. Trying next song...");
      setTimeout(() => nextSong(), 2000);
    };

    const handleTimeUpdate = () => {
      if (sleepTimerEnd && Date.now() >= sleepTimerEnd) {
        audio.pause();
        setIsPlaying(false);
        toast.success("Sleep timer ended");
        useMusicStore.getState().setSleepTimer(null);
      }
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);
    audio.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [repeat, nextSong, sleepTimerEnd, setIsPlaying]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  useEffect(() => {
    const loadAndPlay = async () => {
      if (!currentSong || !audioRef.current) return;

      const song = await getSongById(currentSong.id);
      if (!song) {
        toast.error("Failed to load song");
        return;
      }

      const downloadUrl =
        song.downloadUrl?.find((u) => u.quality === "320kbps")?.url ||
        song.downloadUrl?.[0]?.url;

      if (!downloadUrl) {
        toast.error("No playable URL available");
        return;
      }

      audioRef.current.src = downloadUrl;

      if (isPlaying) {
        try {
          const playPromise = audioRef.current.play();
          await playPromise;
          addToHistory(song);

          // Media Session API
          if ("mediaSession" in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
              title: song.name,
              artist: song.artists.primary.map((a) => a.name).join(", "),
              album: song.album?.name || "Unknown Album",
              artwork: song.image.map((img) => ({
                src: img.url,
                sizes: "512x512",
                type: "image/jpeg",
              })),
            });
          }
        } catch (error) {
          console.error("Playback error:", error);
          toast.error("Playback failed");
        }
      }
    };

    loadAndPlay();
  }, [currentSong, isPlaying, addToHistory]);

  useEffect(() => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.play().catch((err) => {
        console.error("Play error:", err);
        setIsPlaying(false);
      });
    } else {
      audioRef.current.pause();
    }
  }, [isPlaying, setIsPlaying]);

  // Media Session handlers
  useEffect(() => {
    if ("mediaSession" in navigator) {
      const { setIsPlaying, nextSong, previousSong } = useMusicStore.getState();

      navigator.mediaSession.setActionHandler("play", () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler("pause", () =>
        setIsPlaying(false)
      );
      navigator.mediaSession.setActionHandler("previoustrack", () =>
        previousSong()
      );
      navigator.mediaSession.setActionHandler("nexttrack", () => nextSong());

      navigator.mediaSession.setActionHandler("seekbackward", (details) => {
        if (audioRef.current) {
          audioRef.current.currentTime = Math.max(
            audioRef.current.currentTime - (details.seekOffset || 10),
            0
          );
        }
      });

      navigator.mediaSession.setActionHandler("seekforward", (details) => {
        if (audioRef.current) {
          audioRef.current.currentTime = Math.min(
            audioRef.current.currentTime + (details.seekOffset || 10),
            audioRef.current.duration
          );
        }
      });

      navigator.mediaSession.setActionHandler("seekto", (details) => {
        if (audioRef.current && details.seekTime) {
          audioRef.current.currentTime = details.seekTime;
        }
      });
    }
  }, []);

  return audioRef;
};
