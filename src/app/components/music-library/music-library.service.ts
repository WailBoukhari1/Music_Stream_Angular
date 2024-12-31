import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Track } from './music-library.model';
import { IndexedDBService } from '../../core/services/indexed-db.service';

@Injectable({
  providedIn: 'root'
})
export class MusicLibraryService {
  constructor(private indexedDBService: IndexedDBService) {}

  getTracks(): Observable<Track[]> {
    return this.indexedDBService.getAllTracks();
  }

  addTrack(track: Track): Observable<Track> {
    return this.indexedDBService.addTrack(track);
  }

  deleteTrack(id: string): Observable<void> {
    return this.indexedDBService.deleteTrack(id);
  }

  clearTracks(): Observable<void> {
    return this.indexedDBService.clearAllTracks();
  }
}
