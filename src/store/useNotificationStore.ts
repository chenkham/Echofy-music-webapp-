import { create } from "zustand";

export interface Notification {
  id: string;
  type: "favorite" | "playlist" | "download" | "general";
  title: string;
  message: string;
  timestamp: number;
  read: boolean;
  songName?: string;
  playlistName?: string;
}

interface NotificationStore {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, "id" | "timestamp" | "read">
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: JSON.parse(localStorage.getItem("notifications") || "[]"),

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      read: false,
    };

    set((state) => {
      const notifications = [newNotification, ...state.notifications].slice(
        0,
        50
      ); // Keep only last 50
      localStorage.setItem("notifications", JSON.stringify(notifications));
      return { notifications };
    });
  },

  markAsRead: (id) => {
    set((state) => {
      const notifications = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      localStorage.setItem("notifications", JSON.stringify(notifications));
      return { notifications };
    });
  },

  markAllAsRead: () => {
    set((state) => {
      const notifications = state.notifications.map((n) => ({
        ...n,
        read: true,
      }));
      localStorage.setItem("notifications", JSON.stringify(notifications));
      return { notifications };
    });
  },

  clearAll: () => {
    localStorage.setItem("notifications", JSON.stringify([]));
    set({ notifications: [] });
  },

  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.read).length;
  },
}));
