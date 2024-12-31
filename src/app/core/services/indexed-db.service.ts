import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { Track } from '../../components/music-library/music-library.model';

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService {
  private dbName = 'musicPlayerDB';
  private dbVersion = 1;
  private tracksStoreName = 'tracks';

  private openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.tracksStoreName)) {
          db.createObjectStore(this.tracksStoreName, { keyPath: 'id' });
        }
      };
    });
  }

  addTrack(track: Track): Observable<Track> {
    return from(
      this.openDB().then(db => {
        return new Promise<Track>((resolve, reject) => {
          const transaction = db.transaction(this.tracksStoreName, 'readwrite');
          const store = transaction.objectStore(this.tracksStoreName);
          const request = store.add(track);

          request.onsuccess = () => resolve(track);
          request.onerror = () => reject(request.error);
        });
      })
    );
  }

  getAllTracks(): Observable<Track[]> {
    return from(
      this.openDB().then(db => {
        return new Promise<Track[]>((resolve, reject) => {
          const transaction = db.transaction(this.tracksStoreName, 'readonly');
          const store = transaction.objectStore(this.tracksStoreName);
          const request = store.getAll();

          request.onsuccess = () => resolve(request.result);
          request.onerror = () => reject(request.error);
        });
      })
    );
  }

  deleteTrack(id: string): Observable<void> {
    return from(
      this.openDB().then(db => {
        return new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(this.tracksStoreName, 'readwrite');
          const store = transaction.objectStore(this.tracksStoreName);
          const request = store.delete(id);

          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      })
    );
  }

  clearAllTracks(): Observable<void> {
    return from(
      this.openDB().then(db => {
        return new Promise<void>((resolve, reject) => {
          const transaction = db.transaction(this.tracksStoreName, 'readwrite');
          const store = transaction.objectStore(this.tracksStoreName);
          const request = store.clear();

          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      })
    );
  }
} 