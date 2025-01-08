import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';

export interface LyricsResponse {
  lyrics: string;
  fullTitle?: string;
  artistNames?: string;
  releaseDate?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LyricsService {
  constructor() {}

  getLyrics(artist: string, title: string): Observable<LyricsResponse> {
    return of({
      lyrics: 'Lyrics not available',
      fullTitle: title,
      artistNames: artist,
      releaseDate: new Date().toISOString(),
      description: `Lyrics for ${title} by ${artist}`
    });
  }
} 