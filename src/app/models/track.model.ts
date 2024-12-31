export interface Track {
  id: string;
  title: string;
  artist: string;
  description?: string;
  addedDate: Date;
  duration: number;
  category: string;
  thumbnailUrl?: string;
  audioUrl: string;
}