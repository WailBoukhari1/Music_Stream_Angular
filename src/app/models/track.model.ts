export interface Track {
  id: string;
  title: string;
  artist: string;
  description: string;
  addedDate: Date;
  duration: number;
  category: 'pop' | 'rock' | 'rap' | 'cha3bi' | string;
  thumbnailUrl?: string;
  audioUrl: string;
}