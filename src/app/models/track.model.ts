export interface SyncedLyric {
  time: number;  // Time in seconds
  text: string;  // Line of lyrics
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  duration: number;
  thumbnailUrl?: string;
  category: 'pop' | 'rock' | 'rap' | 'cha3bi';
  addedDate: Date;
  order?: number;
  description?: string;
  releaseDate?: Date;
  isFavorite?: boolean;
  lyrics?: string;
  syncedLyrics?: SyncedLyric[];
}

export type PlayerState = 'playing' | 'paused' | 'buffering' | 'stopped';
export type LoadingState = 'loading' | 'error' | 'success';