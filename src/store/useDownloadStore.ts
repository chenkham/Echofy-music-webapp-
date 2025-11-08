import { create } from "zustand";
import type { Song } from "../types";

interface DownloadState {
  songToDownload: Song | null;
  isDownloadModalOpen: boolean;
  openDownloadModal: (song: Song) => void;
  closeDownloadModal: () => void;
}

export const useDownloadStore = create<DownloadState>((set) => ({
  songToDownload: null,
  isDownloadModalOpen: false,
  openDownloadModal: (song) =>
    set({ songToDownload: song, isDownloadModalOpen: true }),
  closeDownloadModal: () =>
    set({ songToDownload: null, isDownloadModalOpen: false }),
}));
