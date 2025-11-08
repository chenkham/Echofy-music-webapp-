import { useMusicStore } from "../store/useMusicStore";
import { ListMusic, Plus } from "lucide-react";

interface PlaylistsProps {
  onPlaylistClick: (playlistId: string) => void;
}

export default function Playlists({ onPlaylistClick }: PlaylistsProps) {
  const { playlists } = useMusicStore();

  const handleCreatePlaylist = () => {
    const name = prompt("Playlist name:");
    if (name) {
      useMusicStore.getState().createPlaylist(name, "");
    }
  };

  return (
    <div className="p-4 md:p-8 pb-32">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">My Playlists</h1>
          <p className="text-text-muted">
            {playlists.length}{" "}
            {playlists.length === 1 ? "playlist" : "playlists"}
          </p>
        </div>
        <button
          onClick={handleCreatePlaylist}
          className="flex items-center gap-2 px-4 md:px-6 py-3 bg-gradient-to-r from-primary to-primary-600 rounded-full font-semibold hover:shadow-neon transition-all active:scale-95"
        >
          <Plus size={20} />
          <span className="hidden md:inline">Create Playlist</span>
        </button>
      </div>

      {/* Playlists Grid */}
      {playlists.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-primary-600/20 flex items-center justify-center mb-6">
            <ListMusic size={48} className="text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">No playlists yet</h2>
          <p className="text-text-muted mb-6 text-center max-w-md">
            Create your first playlist and start organizing your favorite songs
          </p>
          <button
            onClick={handleCreatePlaylist}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-600 rounded-full font-semibold hover:shadow-neon transition-all active:scale-95"
          >
            <Plus size={20} />
            Create Your First Playlist
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {playlists.map((playlist) => (
            <button
              key={playlist.id}
              onClick={() => onPlaylistClick(playlist.id)}
              className="glass rounded-2xl overflow-hidden hover:shadow-neon transition-all group cursor-pointer text-left"
            >
              <div className="aspect-square bg-gradient-to-br from-secondary/40 to-accent/40 flex items-center justify-center relative">
                <ListMusic size={48} className="text-white/80" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                    <Play size={24} fill="white" className="ml-1" />
                  </div>
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
                  {playlist.name}
                </h3>
                <p className="text-xs text-text-muted mt-1">
                  {playlist.songs.length}{" "}
                  {playlist.songs.length === 1 ? "song" : "songs"}
                </p>
                {playlist.description && (
                  <p className="text-xs text-text-muted mt-1 truncate">
                    {playlist.description}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Play({
  size,
  fill,
  className,
}: {
  size: number;
  fill?: string;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill || "none"}
      className={className}
    >
      <path d="M5 3l14 9-14 9V3z" fill={fill || "currentColor"} />
    </svg>
  );
}
