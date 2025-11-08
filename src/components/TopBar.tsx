import {
  Menu,
  Search,
  Bell,
  User,
  Clock,
  Heart,
  ListMusic,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useNotificationStore } from "../store/useNotificationStore";
import { useAuthStore } from "../store/useAuthStore";

interface TopBarProps {
  onMenuClick: () => void;
  onSleepTimerClick: () => void;
  onSearch?: (query: string) => void;
  onNotificationClick?: () => void;
  onProfileClick?: () => void;
}

export default function TopBar({
  onMenuClick,
  onSleepTimerClick,
  onSearch,
  onNotificationClick,
  onProfileClick,
}: TopBarProps) {
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const { notifications, getUnreadCount, markAsRead, clearAll } =
    useNotificationStore();
  const { user } = useAuthStore();
  const unreadCount = getUnreadCount();

  const handleSearch = (value: string) => {
    setQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    if (onNotificationClick) {
      onNotificationClick();
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "favorite":
        return <Heart size={14} className="md:w-[18px] md:h-[18px]" />;
      case "playlist":
        return <ListMusic size={14} className="md:w-[18px] md:h-[18px]" />;
      default:
        return <Bell size={14} className="md:w-[18px] md:h-[18px]" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "favorite":
        return "text-red-400";
      case "playlist":
        return "text-primary";
      default:
        return "text-accent";
    }
  };

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return "Just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  // Close notification dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showNotifications]);

  return (
    <div className="glass-dark backdrop-blur-xl px-2 md:px-8 py-3 md:py-4 border-b border-white/10 flex items-center gap-2 md:gap-6 sticky top-0 z-50 shadow-lg">
      {/* Hamburger Menu */}
      <button
        onClick={onMenuClick}
        className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-all active:scale-95 flex-shrink-0"
      >
        <Menu size={20} className="md:hidden" />
        <Menu size={24} className="hidden md:block" />
      </button>

      {/* Search Bar */}
      <div
        className={`flex-1 md:max-w-[600px] relative transition-all ${
          isFocused ? "scale-105" : ""
        }`}
      >
        <div
          className={`absolute left-3 md:left-4 top-1/2 -translate-y-1/2 transition-all ${
            isFocused ? "text-primary" : "text-text-muted"
          }`}
        >
          <Search size={16} className="md:hidden" />
          <Search size={20} className="hidden md:block" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search..."
          className={`w-full pl-9 md:pl-12 pr-3 md:pr-4 py-2.5 md:py-3.5 glass rounded-xl md:rounded-2xl text-xs md:text-sm font-medium focus:outline-none transition-all ${
            isFocused
              ? "bg-white/10 shadow-neon ring-2 ring-primary/50"
              : "hover:bg-white/10"
          }`}
        />
        {isFocused && query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-white text-xs"
          >
            Clear
          </button>
        )}
      </div>

      {/* Mobile Actions - Compact */}
      <div className="flex md:hidden items-center gap-1 flex-shrink-0">
        {/* Notifications - Mobile */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={handleNotificationClick}
            className="relative p-2 glass rounded-lg hover:bg-white/10 transition-all active:scale-95"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown - Mobile */}
          {showNotifications && (
            <div className="fixed inset-x-0 top-[60px] mx-2 glass-dark rounded-2xl shadow-2xl overflow-hidden z-[60] border border-white/10 max-h-[calc(100vh-80px)]">
              <div className="p-3 border-b border-white/10 flex items-center justify-between sticky top-0 glass-dark">
                <h3 className="font-bold text-base">Notifications</h3>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-xs text-red-400 hover:text-red-300 font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-[calc(100vh-160px)] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center">
                    <Bell
                      size={40}
                      className="mx-auto text-text-muted mb-2 opacity-50"
                    />
                    <p className="text-sm text-text-muted">
                      No notifications yet
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 hover:bg-white/5 transition-all border-b border-white/5 cursor-pointer ${
                        !notif.read ? "bg-primary/5" : ""
                      }`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="flex gap-2">
                        <div
                          className={`w-8 h-8 rounded-full ${
                            notif.type === "favorite"
                              ? "bg-red-500/20"
                              : "bg-primary/20"
                          } flex items-center justify-center flex-shrink-0`}
                        >
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold flex items-center gap-2">
                            {notif.title}
                            {!notif.read && (
                              <span className="w-2 h-2 bg-primary rounded-full"></span>
                            )}
                          </p>
                          <p className="text-xs text-text-muted mt-1 line-clamp-2">
                            {notif.message}
                          </p>
                          <p
                            className={`text-xs ${getNotificationColor(
                              notif.type
                            )} mt-1 font-medium`}
                          >
                            {getTimeAgo(notif.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sleep Timer - Mobile */}
        <button
          onClick={onSleepTimerClick}
          className="p-2 glass rounded-lg hover:bg-white/10 transition-all active:scale-95"
          aria-label="Sleep Timer"
        >
          <Clock size={18} />
        </button>

        {/* Profile - Mobile */}
        <button
          onClick={() => {
            if (onProfileClick) {
              onProfileClick();
            }
          }}
          className="p-1.5 glass rounded-full hover:bg-white/10 transition-all active:scale-95 relative"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center shadow-neon overflow-hidden border-2 border-white/20">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName || "User"}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={16} />
            )}
          </div>
          {user && (
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-surface-dark"></div>
          )}
        </button>
      </div>

      {/* Desktop Actions */}
      <div className="hidden md:flex items-center gap-3 flex-shrink-0">
        {/* Notifications */}
        <div className="relative" ref={notificationRef}>
          <button
            onClick={handleNotificationClick}
            className="relative p-2.5 glass rounded-xl hover:bg-white/10 transition-all active:scale-95"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute top-full right-0 mt-2 w-96 glass-dark rounded-2xl shadow-2xl overflow-hidden z-50 border border-white/10">
              <div className="p-4 border-b border-white/10 flex items-center justify-between">
                <h3 className="font-bold text-lg">Notifications</h3>
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-sm text-red-400 hover:text-red-300 font-semibold"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell
                      size={48}
                      className="mx-auto text-text-muted mb-3 opacity-50"
                    />
                    <p className="text-base text-text-muted">
                      No notifications yet
                    </p>
                    <p className="text-sm text-text-secondary mt-1">
                      You'll see updates here when you like songs or add them to
                      playlists
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-4 hover:bg-white/5 transition-all border-b border-white/5 cursor-pointer ${
                        !notif.read ? "bg-primary/5" : ""
                      }`}
                      onClick={() => markAsRead(notif.id)}
                    >
                      <div className="flex gap-3">
                        <div
                          className={`w-10 h-10 rounded-full ${
                            notif.type === "favorite"
                              ? "bg-red-500/20"
                              : "bg-primary/20"
                          } flex items-center justify-center flex-shrink-0`}
                        >
                          {getNotificationIcon(notif.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold flex items-center gap-2">
                            {notif.title}
                            {!notif.read && (
                              <span className="w-2 h-2 bg-primary rounded-full"></span>
                            )}
                          </p>
                          <p className="text-xs text-text-muted mt-1 line-clamp-2">
                            {notif.message}
                          </p>
                          <p
                            className={`text-xs ${getNotificationColor(
                              notif.type
                            )} mt-2 font-medium`}
                          >
                            {getTimeAgo(notif.timestamp)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sleep Timer */}
        <button
          onClick={onSleepTimerClick}
          className="p-2.5 glass rounded-xl hover:bg-white/10 transition-all active:scale-95"
          aria-label="Sleep Timer"
        >
          <Clock size={20} />
        </button>

        {/* Profile */}
        <button
          onClick={() => {
            if (onProfileClick) {
              onProfileClick();
            }
          }}
          className="p-1 glass rounded-full hover:bg-white/10 transition-all active:scale-95 group relative"
        >
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary-600 flex items-center justify-center shadow-neon overflow-hidden border-2 border-white/20">
            {user?.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-full h-full object-cover"
              />
            ) : (
              <User size={18} />
            )}
          </div>
          {user && (
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-surface-dark"></div>
          )}
        </button>
      </div>
    </div>
  );
}
