export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  url: string;
}

export interface MusicLibrary {
  tracks: Track[];
}
