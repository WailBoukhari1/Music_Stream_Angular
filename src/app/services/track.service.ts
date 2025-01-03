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
    return from(this.indexedDB.addTrack(track, audioFile, thumbnail));
  }

  updateTrack(track: Track): Observable<Track> {
    return from(this.indexedDB.updateTrack(track));
  }

  deleteTrack(id: string): Observable<void> {
    return from(this.indexedDB.deleteTrack(id));
  }
} 