export interface Track {
  id: string;
  title: string;
  artist: string;
  description?: string;
  addedDate: Date;
  duration: number;
  category: 'pop' | 'rock' | 'rap' | 'cha3bi';
  thumbnailUrl?: string;
  order?: number;
}

export type PlayerState = 'playing' | 'paused' | 'buffering' | 'stopped';
export type LoadingState = 'loading' | 'error' | 'success';