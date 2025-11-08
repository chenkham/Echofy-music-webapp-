import {
  Home,
  Search,
  Heart,
  History,
  Music,
  ListMusic,
  Settings,
} from "lucide-react";
import { useMusicStore } from "../store/useMusicStore";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  onNavigate: (
    view:
      | "home"
      | "search"
      | "favorites"
      | "history"
      | "playlist"
      | "playlists",
    playlistId?: string
  ) => void;
  onSettingsClick?: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  currentView,
  onNavigate,
  onSettingsClick,
}: SidebarProps) {
  const { playlists, favorites, history } = useMusicStore();

  return (
    <aside
      className={`w-[280px] glass-dark border-r border-white/10 flex flex-col transition-all duration-300 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 fixed lg:relative h-full z-[1100] shadow-2xl`}
    >
      {/* Header with Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 flex items-center justify-center">
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
          <div>
            <span className="text-2xl font-black bg-gradient-to-r from-primary to-primary-400 bg-clip-text text-transparent">
              Echofy
            </span>
            <div className="text-xs text-text-muted">Premium</div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <nav className="p-3 flex-1 overflow-y-auto space-y-1">
        <div className="text-xs font-bold text-text-muted uppercase tracking-wider px-3 mb-3">
          Menu
        </div>
        <NavItem
          icon={<Home size={22} />}
          label="Home"
          active={currentView === "home"}
          onClick={() => {
            onNavigate("home");
            onClose(); // Close sidebar after navigation on mobile
          }}
          badge={null}
        />
        <NavItem
          icon={<Search size={22} />}
          label="Search"
          active={currentView === "search"}
          onClick={() => {
            onNavigate("search");
            onClose(); // Close sidebar after navigation on mobile
          }}
          badge={null}
        />

        <div className="my-4 border-t border-white/10"></div>

        <div className="text-xs font-bold text-text-muted uppercase tracking-wider px-3 mb-3">
          Library
        </div>
        <NavItem
          icon={<Heart size={22} />}
          label="Liked Songs"
          active={currentView === "favorites"}
          onClick={() => {
            onNavigate("favorites");
            onClose(); // Close sidebar after navigation on mobile
          }}
          badge={favorites.length > 0 ? favorites.length.toString() : null}
        />
        <NavItem
          icon={<History size={22} />}
          label="History"
          active={currentView === "history"}
          onClick={() => {
            onNavigate("history");
            onClose(); // Close sidebar after navigation on mobile
          }}
          badge={history.length > 0 ? history.length.toString() : null}
        />
        <NavItem
          icon={<ListMusic size={22} />}
          label="My Playlists"
          active={currentView === "playlists"}
          onClick={() => {
            onNavigate("playlists");
            onClose(); // Close sidebar after navigation on mobile
          }}
          badge={playlists.length > 0 ? playlists.length.toString() : null}
        />

        <div className="my-4 border-t border-white/10"></div>

        {/* Settings */}
        <NavItem
          icon={<Settings size={22} />}
          label="Settings"
          active={false}
          onClick={() => {
            if (onSettingsClick) {
              onSettingsClick();
              onClose(); // Close sidebar after clicking settings
            }
          }}
          badge={null}
        />
      </nav>
    </aside>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
  badge,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  badge?: string | null;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-3 px-3 py-3 rounded-xl cursor-pointer transition-all font-medium text-sm group ${
        active
          ? "bg-gradient-to-r from-primary to-primary-600 text-white shadow-neon"
          : "text-text-secondary hover:bg-white/5 hover:text-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <div
          className={active ? "" : "group-hover:scale-110 transition-transform"}
        >
          {icon}
        </div>
        <span>{label}</span>
      </div>
      {badge && (
        <span
          className={`px-2 py-0.5 text-xs rounded-full ${
            active
              ? "bg-white/20"
              : "bg-primary/20 text-primary group-hover:bg-primary/30"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
