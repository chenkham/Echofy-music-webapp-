import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { useAudioPlayer } from "./hooks/useAudioPlayer";
import { useMusicStore } from "./store/useMusicStore";
import { useDownloadStore } from "./store/useDownloadStore";
import { useAuthStore } from "./store/useAuthStore";
import { auth } from "./services/firebaseAuth";
import { onAuthStateChanged } from "firebase/auth";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar.tsx";
import PlayerBar from "./components/PlayerBar";
import Home from "./components/Home";
import Search from "./components/Search";
import Favorites from "./components/Favorites";
import History from "./components/History";
import Playlists from "./components/Playlists";
import PlaylistView from "./components/PlaylistView";
import AlbumView from "./components/AlbumView";
import ArtistView from "./components/ArtistView";
import FullscreenView from "./components/FullscreenView";
import NowPlayingView from "./components/NowPlayingView";
import LandingPage from "./components/LandingPage";
import SignUp from "./components/auth/SignUp";
import SignIn from "./components/auth/SignIn";
import UserProfile from "./components/UserProfile";
import SleepTimer from "./components/modals/SleepTimer";
import Settings from "./components/modals/Settings";
import QueueModal from "./components/modals/QueueModal";
import TimerSetter from "./components/modals/TimerSetter";
import LyricsModal from "./components/modals/LyricsModal";
import DownloadQualityModal from "./components/modals/DownloadQualityModal";
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts";
import { downloadSong } from "./services/api";
import { getUserProfile } from "./services/firebaseAuth";
import toast from "react-hot-toast";
import type { Song } from "./types";

type View =
  | "home"
  | "search"
  | "favorites"
  | "history"
  | "playlist"
  | "playlists"
  | "album"
  | "artist";

function App() {
  const [currentView, setCurrentView] = useState<View>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPlaylistId, setCurrentPlaylistId] = useState<string | null>(
    null
  );
  const [currentAlbumId, setCurrentAlbumId] = useState<string | null>(null);
  const [currentArtistId, setCurrentArtistId] = useState<string | null>(null);
  const [sleepTimerOpen, setSleepTimerOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [queueOpen, setQueueOpen] = useState(false);
  const [timerSetterOpen, setTimerSetterOpen] = useState(false);
  const [lyricsOpen, setLyricsOpen] = useState(false);
  const [nowPlayingOpen, setNowPlayingOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Auth states
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const audioRef = useAudioPlayer();
  const { currentSong } = useMusicStore();
  const { isAuthenticated, isLoading, setUser, setLoading } = useAuthStore();
  const {
    songToDownload,
    isDownloadModalOpen,
    openDownloadModal,
    closeDownloadModal,
  } = useDownloadStore();

  useEffect(() => {
    setLoading(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userProfile = await getUserProfile(firebaseUser.uid);
        if (userProfile) {
          setUser(userProfile);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [setUser, setLoading]);

  // Track audio time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, [audioRef]);

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    audio.currentTime = percent * audio.duration;
  };

  const handleSetTime = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const handleDownloadRequest = (song: Song) => {
    openDownloadModal(song);
  };

  const handleDownloadWithQuality = async (url: string, quality: string) => {
    if (!songToDownload) return;

    try {
      await downloadSong(songToDownload, url, quality);
      toast.success(`Downloading ${songToDownload.name} (${quality})`);
    } catch (error) {
      toast.error("Failed to download song");
      console.error(error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim().length >= 2) {
      setCurrentView("search");
    }
  };

  useKeyboardShortcuts(audioRef);

  const navigateTo = (view: View, id?: string) => {
    setCurrentView(view);
    if (view === "playlist" && id) {
      setCurrentPlaylistId(id);
    } else if (view === "album" && id) {
      setCurrentAlbumId(id);
    } else if (view === "artist" && id) {
      setCurrentArtistId(id);
    }
    setSidebarOpen(false);
  };

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading...</p>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!isAuthenticated) {
    return (
      <>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: "#282828",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
            },
          }}
        />
        <LandingPage
          onSignIn={() => setSignInOpen(true)}
          onSignUp={() => setSignUpOpen(true)}
        />
        {signUpOpen && (
          <SignUp
            onClose={() => setSignUpOpen(false)}
            onSwitchToSignIn={() => {
              setSignUpOpen(false);
              setSignInOpen(true);
            }}
          />
        )}
        {signInOpen && (
          <SignIn
            onClose={() => setSignInOpen(false)}
            onSwitchToSignUp={() => {
              setSignInOpen(false);
              setSignUpOpen(true);
            }}
          />
        )}

        {/* Profile Panel */}
        <UserProfile
          isOpen={profileOpen}
          onClose={() => setProfileOpen(false)}
        />
      </>
    );
  }

  return (
    <>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#282828",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.1)",
          },
        }}
      />

      <div className="flex h-screen overflow-hidden">
        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/70 z-[1050] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentView={currentView}
          onNavigate={navigateTo}
          onSettingsClick={() => setSettingsOpen(true)}
        />

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden">
          <TopBar
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            onSleepTimerClick={() => setSleepTimerOpen(true)}
            onSearch={handleSearch}
            onProfileClick={() => setProfileOpen(true)}
          />

          <div className="flex-1 overflow-y-auto pb-32">
            {currentView === "home" && <Home />}
            {currentView === "search" && (
              <Search
                searchQuery={searchQuery}
                onAlbumClick={(id) => navigateTo("album", id)}
                onArtistClick={(id) => navigateTo("artist", id)}
                onPlaylistClick={(id) => navigateTo("playlist", id)}
              />
            )}
            {currentView === "favorites" && <Favorites />}
            {currentView === "history" && <History />}
            {currentView === "playlists" && (
              <Playlists onPlaylistClick={(id) => navigateTo("playlist", id)} />
            )}
            {currentView === "playlist" && currentPlaylistId && (
              <PlaylistView playlistId={currentPlaylistId} />
            )}
            {currentView === "album" && currentAlbumId && (
              <AlbumView albumId={currentAlbumId} />
            )}
            {currentView === "artist" && currentArtistId && (
              <ArtistView
                artistId={currentArtistId}
                onAlbumClick={(id) => navigateTo("album", id)}
              />
            )}
          </div>
        </main>

        {/* Fullscreen View */}
        <FullscreenView audioRef={audioRef} />

        {/* Player Bar */}
        <PlayerBar
          audioRef={audioRef}
          onQueueClick={() => setQueueOpen(true)}
          onTimerSetterClick={() => setTimerSetterOpen(true)}
          onLyricsClick={() => setLyricsOpen(true)}
          onNowPlayingClick={() => setNowPlayingOpen(true)}
          onDownloadClick={handleDownloadRequest}
        />

        {/* Now Playing View */}
        <NowPlayingView
          isOpen={nowPlayingOpen}
          onClose={() => setNowPlayingOpen(false)}
          audioRef={audioRef}
          currentTime={currentTime}
          duration={duration}
          onSeek={handleSeek}
          onQueueClick={() => {
            setNowPlayingOpen(false);
            setQueueOpen(true);
          }}
          onLyricsClick={() => {
            setNowPlayingOpen(false);
            setLyricsOpen(true);
          }}
          onDownloadClick={handleDownloadRequest}
        />

        {/* Modals */}
        <SleepTimer
          isOpen={sleepTimerOpen}
          onClose={() => setSleepTimerOpen(false)}
        />
        <Settings
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
        />
        <QueueModal isOpen={queueOpen} onClose={() => setQueueOpen(false)} />
        <LyricsModal
          isOpen={lyricsOpen}
          onClose={() => setLyricsOpen(false)}
          song={currentSong}
        />
        <DownloadQualityModal
          isOpen={isDownloadModalOpen}
          onClose={closeDownloadModal}
          song={songToDownload}
          onDownload={handleDownloadWithQuality}
        />
        {currentSong && (
          <TimerSetter
            isOpen={timerSetterOpen}
            onClose={() => setTimerSetterOpen(false)}
            currentTime={audioRef.current?.currentTime || 0}
            duration={audioRef.current?.duration || 0}
            onSetTime={handleSetTime}
          />
        )}

        {/* Profile Panel */}
        <UserProfile
          isOpen={profileOpen}
          onClose={() => setProfileOpen(false)}
        />
      </div>
    </>
  );
}

export default App;
