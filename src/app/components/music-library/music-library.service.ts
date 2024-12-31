import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Track } from './music-library.model';

@Injectable({
  providedIn: 'root'
})
export class MusicLibraryService {
  private mockTracks: Track[] = [
    {
      id: '1',
      title: 'Sample Track 1',
      artist: 'Artist 1',
      duration: 180,
      url: 'https://example.com/track1.mp3'
    },
    {
      id: '2',
      title: 'Sample Track 2',
      artist: 'Artist 2',
      duration: 240,
      url: 'https://example.com/track2.mp3'
    }
  ];

  getTracks(): Observable<Track[]> {
    return of(this.mockTracks);
  }
}
