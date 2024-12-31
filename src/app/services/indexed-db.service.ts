import { Injectable } from '@angular/core';
import { Track } from '../models/track.model';

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService {
  private dbName = 'musicPlayerDB';
  private dbVersion = 3;
  private db: Promise<IDBDatabase>;

  constructor() {
    this.db = this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = request.result;
        
        if (!db.objectStoreNames.contains('tracks')) {
          db.createObjectStore('tracks', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('audioFiles')) {
          db.createObjectStore('audioFiles', { keyPath: 'id' });
        }

        if (!db.objectStoreNames.contains('thumbnails')) {
          db.createObjectStore('thumbnails', { keyPath: 'id' });
        }
      };
    });
  }

  async addTrack(track: Track, audioFile: File, thumbnail?: File | null): Promise<void> {
    const db = await this.db;
    
    return new Promise((resolve, reject) => {
      try {
        const stores = ['tracks', 'audioFiles'];
        if (thumbnail) stores.push('thumbnails');

        const transaction = db.transaction(stores, 'readwrite');
        
        const tracksStore = transaction.objectStore('tracks');
        const audioStore = transaction.objectStore('audioFiles');
        
        tracksStore.add(track);
        audioStore.add({ id: track.id, file: audioFile });

        if (thumbnail) {
          const thumbnailStore = transaction.objectStore('thumbnails');
          thumbnailStore.add({ id: track.id, file: thumbnail });
        }

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getAllTracks(): Promise<Track[]> {
    const db = await this.db;
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(['tracks'], 'readonly');
        const store = transaction.objectStore('tracks');
        const request = store.getAll();

        request.onsuccess = () => {
          console.log('Tracks loaded:', request.result); // Debug log
          resolve(request.result);
        };
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  async deleteTrack(id: string): Promise<void> {
    const db = await this.db;
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(['tracks', 'audioFiles'], 'readwrite');
        
        const tracksStore = transaction.objectStore('tracks');
        const audioStore = transaction.objectStore('audioFiles');

        tracksStore.delete(id);
        audioStore.delete(id);

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  async getAudioFile(trackId: string): Promise<File> {
    const db = await this.db;
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction('audioFiles', 'readonly');
        const store = transaction.objectStore('audioFiles');
        const request = store.get(trackId);

        request.onsuccess = () => resolve(request.result.file);
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  }
} 