import { useState } from "react";
import {
  X,
  Settings as SettingsIcon,
  Music,
  Palette,
  Keyboard,
  Info,
  Download,
  Volume2,
} from "lucide-react";
import { useMusicStore } from "../../store/useMusicStore";

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = "playback" | "appearance" | "shortcuts" | "about";

export default function Settings({ isOpen, onClose }: SettingsProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("playback");
  const {
    audioQuality,
    setAudioQuality,
    autoPlay,
    setAutoPlay,
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    animations,
    setAnimations,
    crossfade,
    setCrossfade,
    normalizeAudio,
    setNormalizeAudio,
    downloadQuality,
    setDownloadQuality,
    showLyrics,
    setShowLyrics,
  } = useMusicStore();

  const tabs = [
    { id: "playback" as const, label: "Playback", icon: Music },
    { id: "appearance" as const, label: "Appearance", icon: Palette },
    { id: "shortcuts" as const, label: "Shortcuts", icon: Keyboard },
    { id: "about" as const, label: "About", icon: Info },
  ];

  const shortcuts = [
    { keys: "Space", action: "Play/Pause" },
    { keys: "→", action: "Next Song" },
    { keys: "←", action: "Previous Song" },
    { keys: "↑", action: "Volume Up" },
    { keys: "↓", action: "Volume Down" },
    { keys: "M", action: "Mute/Unmute" },
    { keys: "S", action: "Toggle Shuffle" },
    { keys: "R", action: "Toggle Repeat" },
    { keys: "L", action: "Like/Unlike Song" },
    { keys: "F", action: "Toggle Fullscreen" },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[2000] flex items-center justify-center p-2 md:p-4">
      <div className="glass-dark rounded-2xl shadow-glow max-w-3xl w-full max-h-[90vh] md:max-h-[80vh] overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center">
              <SettingsIcon size={16} className="text-black md:hidden" />
              <SettingsIcon size={20} className="text-black hidden md:block" />
            </div>
            <h2 className="text-lg md:text-xl font-bold">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-all duration-300"
            aria-label="Close"
          >
            <X size={18} className="md:hidden" />
            <X size={20} className="hidden md:block" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row h-[calc(90vh-80px)] md:h-[500px]">
          {/* Sidebar Tabs */}
          <div className="w-full md:w-48 border-b md:border-b-0 md:border-r border-white/10 p-2 md:p-4">
            <div className="flex md:flex-col gap-1 md:space-y-1 overflow-x-auto md:overflow-x-visible">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-lg transition-all duration-300 whitespace-nowrap md:w-full ${
                    activeTab === tab.id
                      ? "bg-primary/20 text-primary border border-primary/30"
                      : "hover:bg-white/5 text-text-secondary"
                  }`}
                >
                  <tab.icon size={16} className="md:hidden" />
                  <tab.icon size={18} className="hidden md:block" />
                  <span className="font-medium text-sm md:text-base">
                    {tab.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto">
            {activeTab === "playback" && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
                    Playback Settings
                  </h3>

                  <div className="space-y-3 md:space-y-4">
                    {/* Audio Quality */}
                    <div className="p-3 md:p-4 glass rounded-lg">
                      <div className="flex items-center gap-2 mb-2 md:mb-3">
                        <Volume2 size={16} className="text-primary" />
                        <label className="block text-xs md:text-sm font-medium">
                          Streaming Quality
                        </label>
                      </div>
                      <select
                        value={audioQuality}
                        onChange={(e) =>
                          setAudioQuality(
                            e.target.value as "low" | "medium" | "high"
                          )
                        }
                        className="w-full px-3 md:px-4 py-2 text-sm md:text-base bg-white/5 border border-white/10 rounded-lg focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300"
                      >
                        <option value="low">Low (96 kbps) - Save data</option>
                        <option value="medium">
                          Medium (160 kbps) - Balanced
                        </option>
                        <option value="high">
                          High (320 kbps) - Best quality
                        </option>
                      </select>
                      <p className="text-xs text-text-secondary mt-2">
                        Affects streaming audio quality
                      </p>
                    </div>

                    {/* Auto Play */}
                    <div className="p-3 md:p-4 glass rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm md:text-base">
                          Auto Play
                        </div>
                        <div className="text-xs md:text-sm text-text-secondary">
                          Automatically play next song
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={autoPlay}
                          onChange={(e) => setAutoPlay(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {/* Crossfade */}
                    <div className="p-3 md:p-4 glass rounded-lg">
                      <div className="flex items-center justify-between mb-2 md:mb-3">
                        <label className="font-medium text-sm md:text-base">
                          Crossfade
                        </label>
                        <span className="text-xs md:text-sm text-text-secondary">
                          {crossfade}s
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="12"
                        value={crossfade}
                        onChange={(e) => setCrossfade(parseInt(e.target.value))}
                        className="w-full accent-primary cursor-pointer"
                      />
                    </div>

                    {/* Normalize Audio */}
                    <div className="p-3 md:p-4 glass rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm md:text-base">
                          Normalize Audio
                        </div>
                        <div className="text-xs md:text-sm text-text-secondary">
                          Maintain consistent volume across tracks
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={normalizeAudio}
                          onChange={(e) => setNormalizeAudio(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {/* Show Lyrics */}
                    <div className="p-3 md:p-4 glass rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm md:text-base">
                          Show Lyrics
                        </div>
                        <div className="text-xs md:text-sm text-text-secondary">
                          Display lyrics when available
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={showLyrics}
                          onChange={(e) => setShowLyrics(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {/* Download Quality */}
                    <div className="p-3 md:p-4 glass rounded-lg">
                      <div className="flex items-center gap-2 mb-2 md:mb-3">
                        <Download size={16} className="text-primary" />
                        <label className="block text-xs md:text-sm font-medium">
                          Download Quality
                        </label>
                      </div>
                      <select
                        value={downloadQuality}
                        onChange={(e) =>
                          setDownloadQuality(
                            e.target.value as
                              | "low"
                              | "medium"
                              | "high"
                              | "lossless"
                          )
                        }
                        className="w-full px-3 md:px-4 py-2 text-sm md:text-base bg-white/5 border border-white/10 rounded-lg focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-300"
                      >
                        <option value="low">Low (96 kbps)</option>
                        <option value="medium">Medium (160 kbps)</option>
                        <option value="high">High (320 kbps)</option>
                        <option value="lossless">Lossless (FLAC)</option>
                      </select>
                      <p className="text-xs text-text-secondary mt-2">
                        Higher quality = larger file size
                      </p>
                    </div>

                    {/* Tip Card */}
                    <div className="p-3 md:p-4 bg-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-xs md:text-sm text-text-secondary">
                        🎵{" "}
                        <span className="font-semibold text-primary">
                          Pro Tip:
                        </span>{" "}
                        Enable crossfade for seamless transitions between songs.
                        Normalize audio keeps volume consistent across different
                        tracks.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "appearance" && (
              <div className="space-y-4 md:space-y-6">
                <div>
                  <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
                    Appearance
                  </h3>

                  <div className="space-y-3 md:space-y-4">
                    {/* Theme */}
                    <div className="p-3 md:p-4 glass rounded-lg">
                      <label className="block text-xs md:text-sm font-medium mb-2 md:mb-3">
                        Theme
                      </label>
                      <div className="grid grid-cols-3 gap-2 md:gap-3">
                        <button
                          onClick={() => setTheme("dark")}
                          className={`p-2 md:p-3 bg-gradient-to-br from-gray-900 to-black rounded-lg border-2 transition-all ${
                            theme === "dark"
                              ? "border-primary shadow-neon"
                              : "border-transparent opacity-50 hover:opacity-75"
                          }`}
                        >
                          <div className="text-xs md:text-sm font-medium">
                            Dark
                          </div>
                        </button>
                        <button
                          onClick={() => setTheme("light")}
                          className={`p-2 md:p-3 bg-gradient-to-br from-gray-100 to-white rounded-lg border-2 transition-all ${
                            theme === "light"
                              ? "border-primary shadow-neon"
                              : "border-transparent opacity-50 hover:opacity-75"
                          }`}
                        >
                          <div className="text-xs md:text-sm font-medium text-black">
                            Light
                          </div>
                        </button>
                        <button
                          onClick={() => setTheme("auto")}
                          className={`p-2 md:p-3 bg-gradient-to-br from-purple-900 to-blue-900 rounded-lg border-2 transition-all ${
                            theme === "auto"
                              ? "border-primary shadow-neon"
                              : "border-transparent opacity-50 hover:opacity-75"
                          }`}
                        >
                          <div className="text-xs md:text-sm font-medium">
                            Auto
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Accent Color */}
                    <div className="p-3 md:p-4 glass rounded-lg">
                      <label className="block text-xs md:text-sm font-medium mb-2 md:mb-3">
                        Accent Color
                      </label>
                      <div className="grid grid-cols-6 gap-2">
                        {[
                          "#1DB954",
                          "#8A2BE2",
                          "#FF69B4",
                          "#00CED1",
                          "#FF6347",
                          "#FFD700",
                        ].map((color) => (
                          <button
                            key={color}
                            onClick={() => setAccentColor(color)}
                            className={`w-8 h-8 md:w-10 md:h-10 rounded-lg border-2 hover:scale-110 transition-transform ${
                              accentColor === color
                                ? "border-white ring-2 ring-white/50"
                                : "border-white/20"
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Animations */}
                    <div className="p-3 md:p-4 glass rounded-lg flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm md:text-base">
                          Animations
                        </div>
                        <div className="text-xs md:text-sm text-text-secondary">
                          Enable smooth UI transitions
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={animations}
                          onChange={(e) => setAnimations(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-white/10 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    {/* Info Card */}
                    <div className="p-3 md:p-4 bg-primary/10 border border-primary/20 rounded-lg">
                      <p className="text-xs md:text-sm text-text-secondary">
                        💡{" "}
                        <span className="font-semibold text-primary">Tip:</span>{" "}
                        Changes apply instantly. Theme and accent color
                        preferences are saved automatically.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "shortcuts" && (
              <div className="space-y-3 md:space-y-4">
                <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
                  Keyboard Shortcuts
                </h3>

                <div className="space-y-2">
                  {shortcuts.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 md:p-3 glass rounded-lg hover:bg-white/5 transition-colors"
                    >
                      <span className="text-text-secondary text-xs md:text-sm">
                        {shortcut.action}
                      </span>
                      <kbd className="px-2 md:px-3 py-1 bg-white/10 border border-white/20 rounded font-mono text-xs md:text-sm">
                        {shortcut.keys}
                      </kbd>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "about" && (
              <div className="space-y-4 md:space-y-6">
                <div className="text-center">
                  <div className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-3 md:mb-4 flex items-center justify-center">
                    <img
                      src="/logo.png"
                      alt="Echofy"
                      className="w-full h-full object-contain drop-shadow-2xl"
                      style={{
                        mixBlendMode: "screen",
                        filter: "contrast(1.2) saturate(1.3)",
                      }}
                    />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold gradient-text mb-2">
                    Echofy
                  </h3>
                  <p className="text-text-secondary mb-3 md:mb-4 text-sm md:text-base">
                    Premium Music Player
                  </p>
                </div>

                <div className="space-y-2 md:space-y-3">
                  <div className="p-3 md:p-4 glass rounded-lg">
                    <div className="text-xs md:text-sm text-text-secondary mb-1">
                      Developer
                    </div>
                    <div className="font-medium text-sm md:text-base">
                      Chenkham Chowlu
                    </div>
                    <div className="text-xs text-text-secondary mt-1">
                      Built with ❤️
                    </div>
                  </div>

                  <div className="p-3 md:p-4 glass rounded-lg">
                    <div className="text-xs md:text-sm text-text-secondary mb-1">
                      Music API
                    </div>
                    <div className="font-medium text-sm md:text-base">
                      Powered by Saavn API
                    </div>
                  </div>
                </div>

                <div className="text-center text-xs md:text-sm text-text-secondary">
                  © 2025 Echofy. Developed by Chenkham Chowlu
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
