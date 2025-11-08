import { useEffect } from 'react';
import { useMusicStore } from '../store/useMusicStore';

export const useKeyboardShortcuts = (audioRef: React.RefObject<HTMLAudioElement>) => {
  const { setIsPlaying, nextSong, previousSong, toggleShuffle, toggleRepeat, setVolume, volume } =
    useMusicStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const audio = audioRef.current;
      if (!audio) return;

      switch (e.key) {
        case ' ':
          e.preventDefault();
          setIsPlaying(!useMusicStore.getState().isPlaying);
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (e.shiftKey) {
            nextSong();
          } else {
            audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
          }
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (e.shiftKey) {
            previousSong();
          } else {
            audio.currentTime = Math.max(0, audio.currentTime - 5);
          }
          break;
        case 'ArrowUp':
          e.preventDefault();
          setVolume(Math.min(100, volume + 5));
          break;
        case 'ArrowDown':
          e.preventDefault();
          setVolume(Math.max(0, volume - 5));
          break;
        case 'm':
        case 'M':
          setVolume(volume === 0 ? 100 : 0);
          break;
        case 's':
        case 'S':
          toggleShuffle();
          break;
        case 'r':
        case 'R':
          toggleRepeat();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [audioRef, setIsPlaying, nextSong, previousSong, toggleShuffle, toggleRepeat, setVolume, volume]);
};
