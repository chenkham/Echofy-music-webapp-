import { useMusicStore } from '../store/useMusicStore';

interface PlaylistViewProps {
  playlistId: string;
}

export default function PlaylistView({ playlistId }: PlaylistViewProps) {
  const { playlists } = useMusicStore();
  const playlist = playlists.find((p) => p.id === playlistId);

  if (!playlist) {
    return <div className="p-8"><p>Playlist not found</p></div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">{playlist.name}</h1>
      <p className="text-text-secondary mt-2">
        {playlist.songs.length} songs • {playlist.description}
      </p>
    </div>
  );
}
