import { Injectable, OnDestroy } from '@angular/core';
import { Track } from '../models/track.model';
import { FileValidationService } from '../services/file-validation.service';
import { Observable, from, map, Subject } from 'rxjs';

interface StorageStats {
  totalSize: number;
  trackCount: number;
  audioSize: number;
  thumbnailSize: number;
}

interface AudioFileRecord {
  id: string;
  file: File;
  size: number;
}

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService implements OnDestroy {
  private readonly DB_CONFIG = {
    name: 'musicPlayerDB',
    version: 4,
    stores: ['tracks', 'audioFiles', 'thumbnails']
  };

  private db: Promise<IDBDatabase>;
  private destroy$ = new Subject<void>();

  constructor(private fileValidationService: FileValidationService) {
    this.db = this.initDB();
  }

  // Database Initialization
  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.DB_CONFIG.name, this.DB_CONFIG.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = () => {
        const db = request.result;
        this.DB_CONFIG.stores.forEach(storeName => {
          if (!db.objectStoreNames.contains(storeName)) {
            db.createObjectStore(storeName, { keyPath: 'id' });
          }
        });
      };
    });
  }

  // Track Management
  async addTrack(track: Track, audioFile: File, thumbnail?: File | null): Promise<void> {
    console.log('Adding track to IndexedDB:', track);
    const db = await this.db;
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(['tracks', 'audioFiles', 'thumbnails'], 'readwrite');
        
        console.log('Storing audio file:', audioFile);
        transaction.objectStore('audioFiles').put({
          id: track.id,
          file: audioFile,
          size: audioFile.size
        });

        // Store thumbnail if provided
        if (thumbnail) {
          transaction.objectStore('thumbnails').put({
            id: track.id,
            file: thumbnail,
            size: thumbnail.size
          });
        }

        // Store track metadata
        console.log('Storing track metadata');
        transaction.objectStore('tracks').put(track);

        transaction.oncomplete = () => {
          console.log('Track added successfully');
          resolve();
        };
        
        transaction.onerror = (error) => {
          console.error('Error adding track:', error);
          reject(error);
        };
      } catch (error) {
        console.error('Exception in addTrack:', error);
        reject(error);
      }
    });
  }

  async getAllTracks(): Promise<Track[]> {
    console.log('Getting all tracks from IndexedDB');
    const db = await this.db;
    
    return new Promise<Track[]>((resolve, reject) => {
      try {
        const transaction = db.transaction('tracks', 'readonly');
        const request = transaction.objectStore('tracks').getAll();
        
        request.onsuccess = () => {
          const tracks = request.result || [];
          console.log('Retrieved tracks:', tracks);
          resolve(tracks);
        };
        
        request.onerror = (error) => {
          console.error('Error getting tracks:', error);
          reject(request.error);
        };
      } catch (error) {
        console.error('Exception in getAllTracks:', error);
        reject(error);
      }
    });
  }

  async updateTrack(track: Track, thumbnail?: File | null): Promise<Track> {
    const db = await this.db;
    
    return new Promise<Track>((resolve, reject) => {
      try {
        const transaction = db.transaction(['tracks', 'thumbnails'], 'readwrite');
        
        if (thumbnail) {
          transaction.objectStore('thumbnails').put({
            id: track.id,
            file: thumbnail,
            size: thumbnail.size
          });
        }
        
        const request = transaction.objectStore('tracks').put(track);
        
        transaction.oncomplete = () => resolve(track);
        transaction.onerror = () => reject(this.handleError(transaction.error));
      } catch (error) {
        reject(this.handleError(error));
      }
    });
  }

  async deleteTrack(id: string): Promise<void> {
    await this.clearOldData(id);
  }

  async updateTrackOrders(tracks: Track[]): Promise<void> {
    const db = await this.db;
    return this.performTransaction('tracks', 'readwrite', store => {
      tracks.forEach(track => store.put(track));
    });
  }

  // File Management
  async getAudioFile(trackId: string): Promise<File> {
    const result = await this.performTransaction<AudioFileRecord>(
      'audioFiles', 
      'readonly', 
      store => store.get(trackId)
    );
    return result.file;
  }

  async getThumbnail(trackId: string): Promise<File | null> {
    const result = await this.performTransaction<{ file: File } | undefined>(
      'thumbnails',
      'readonly',
      store => store.get(trackId)
    );
    return result?.file || null;
  }

  async getTrackWithFiles(trackId: string): Promise<{ 
    track: Track, 
    audioFile: File, 
    thumbnail: File | null 
  }> {
    const db = await this.db;
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(this.DB_CONFIG.stores, 'readonly');
        const requests = {
          track: transaction.objectStore('tracks').get(trackId),
          audio: transaction.objectStore('audioFiles').get(trackId),
          thumbnail: transaction.objectStore('thumbnails').get(trackId)
        };

        transaction.oncomplete = () => {
          if (!requests.track.result || !requests.audio.result) {
            reject(new Error('Track or audio file not found'));
            return;
          }

          resolve({
            track: requests.track.result,
            audioFile: requests.audio.result.file,
            thumbnail: requests.thumbnail.result?.file || null
          });
        };
        
        transaction.onerror = () => reject(this.handleError(transaction.error));
      } catch (error) {
        reject(this.handleError(error));
      }
    });
  }

  // Validation Methods
  async checkDuplicateTrack(title: string, artist: string): Promise<boolean> {
    const tracks = await this.getAllTracks();
    return tracks.some(track => 
      track.title.toLowerCase() === title.toLowerCase() && 
      track.artist.toLowerCase() === artist.toLowerCase()
    );
  }

  private async validateFile(audioFile: File, thumbnail?: File | null): Promise<void> {
    // Validate audio file
    const audioValidation = this.fileValidationService.validateAudioFile(audioFile);
    if (!audioValidation.isValid) {
      throw new Error(audioValidation.error);
    }

    // Validate thumbnail if provided
    if (thumbnail) {
      const imageValidation = this.fileValidationService.validateImageFile(thumbnail);
      if (!imageValidation.isValid) {
        throw new Error(imageValidation.error);
      }

      const dimensionsValidation = await this.fileValidationService.validateImageDimensions(thumbnail);
      if (!dimensionsValidation.isValid) {
        throw new Error(dimensionsValidation.error);
      }
    }
  }

  // Database Management
  async getStorageStats(): Promise<StorageStats> {
    const db = await this.db;
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(this.DB_CONFIG.stores, 'readonly');
        const stats: StorageStats = {
          totalSize: 0,
          trackCount: 0,
          audioSize: 0,
          thumbnailSize: 0
        };

        const requests = {
          tracks: transaction.objectStore('tracks').getAll(),
          audio: transaction.objectStore('audioFiles').getAll(),
          thumbnails: transaction.objectStore('thumbnails').getAll()
        };

        transaction.oncomplete = () => {
          stats.trackCount = requests.tracks.result.length;
          stats.audioSize = requests.audio.result.reduce((sum, item) => sum + item.size, 0);
          stats.thumbnailSize = requests.thumbnails.result.reduce((sum, item) => sum + (item?.size || 0), 0);
          stats.totalSize = stats.audioSize + stats.thumbnailSize;
          resolve(stats);
        };
        
        transaction.onerror = () => reject(this.handleError(transaction.error));
      } catch (error) {
        reject(this.handleError(error));
      }
    });
  }

  async clearDatabase(): Promise<void> {
    const db = await this.db;
    return this.performTransaction(this.DB_CONFIG.stores, 'readwrite', store => store.clear());
  }

  private async clearOldData(trackId: string): Promise<void> {
    const db = await this.db;
    return this.performTransaction(this.DB_CONFIG.stores, 'readwrite', store => store.delete(trackId));
  }

  // Utility Methods
  private async performTransaction<T>(
    storeNames: string | string[],
    mode: IDBTransactionMode,
    operation: (store: IDBObjectStore) => IDBRequest<T> | void
  ): Promise<T> {
    const db = await this.db;
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(storeNames, mode);
        const store = Array.isArray(storeNames) 
          ? transaction.objectStore(storeNames[0])
          : transaction.objectStore(storeNames);
        
        const request = operation(store) as IDBRequest<T>;
        
        transaction.oncomplete = () => resolve(request?.result);
        transaction.onerror = () => reject(this.handleError(transaction.error));
      } catch (error) {
        reject(this.handleError(error));
      }
    });
  }

  private handleError(error: any): Error {
    console.error('IndexedDB Error:', error);
    return new Error(`IndexedDB operation failed: ${error.message || 'Unknown error'}`);
  }

  async getTrackById(id: string): Promise<Track> {
    const track = await this.performTransaction<Track>(
      'tracks',
      'readonly',
      store => store.get(id)
    );
    
    if (!track) {
      throw new Error(`Track with id ${id} not found`);
    }
    
    return track;
  }

  async getFavoriteTracks(): Promise<Track[]> {
    const db = await this.db;
    
    return new Promise<Track[]>((resolve, reject) => {
      try {
        const transaction = db.transaction('tracks', 'readonly');
        const request = transaction.objectStore('tracks').getAll();
        
        request.onsuccess = () => {
          const tracks = request.result.filter(track => track?.isFavorite);
          resolve(tracks);
        };
        request.onerror = () => reject(this.handleError(request.error));
      } catch (error) {
        reject(this.handleError(error));
      }
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    
    // Close IndexedDB connection
    this.db.then(database => {
      database.close();
    }).catch(error => {
      console.error('Error closing IndexedDB:', error);
    });
  }
} 