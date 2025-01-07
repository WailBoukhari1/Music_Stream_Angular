import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { Track } from '../models/track.model';
import { IndexedDBService } from './indexed-db.service';

@Injectable({
  providedIn: 'root'
})
export class TrackService {
  constructor(private indexedDB: IndexedDBService) {}

  getAllTracks(): Observable<Track[]> {
    return from(this.indexedDB.getAllTracks());
  }

  getTrackById(id: string): Observable<Track> {
    return from(this.indexedDB.getTrackById(id));
  }

  addTrack(track: Track, audioFile: File, thumbnail?: File | null): Observable<void> {
    return new Observable(observer => {
      const audio = new Audio();
      const objectUrl = URL.createObjectURL(audioFile);
      
      audio.addEventListener('loadedmetadata', () => {
        const updatedTrack = {
          ...track,
          duration: Math.round(audio.duration)
        };
        
        URL.revokeObjectURL(objectUrl);
        
        this.indexedDB.addTrack(updatedTrack, audioFile, thumbnail)
          .then(() => {
            observer.next();
            observer.complete();
          })
          .catch(error => {
            observer.error(error);
          });
      });

      audio.addEventListener('error', (error) => {
        URL.revokeObjectURL(objectUrl);
        observer.error(new Error('Error loading audio file'));
      });

      audio.src = objectUrl;
    });
  }

  updateTrack(track: Track, thumbnail?: File | null): Observable<Track> {
    return from(this.indexedDB.updateTrack(track, thumbnail));
  }

  deleteTrack(id: string): Observable<void> {
    return from(this.indexedDB.deleteTrack(id));
  }
} 