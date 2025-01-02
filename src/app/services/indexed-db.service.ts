import { Injectable } from '@angular/core';
import { Track } from '../models/track.model';

@Injectable({
  providedIn: 'root'
})
export class IndexedDBService {
  private dbName = 'musicPlayerDB';
  private dbVersion = 3;
  private db: Promise<IDBDatabase>;
  private readonly MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB in bytes
  private readonly VALID_AUDIO_TYPES = [
    'audio/mp3',
    'audio/mpeg',  // Common MIME type for MP3
    'audio/wav',
    'audio/wave',  // Alternative WAV MIME type
    'audio/x-wav',
    'audio/ogg',
    'audio/vorbis'
  ];

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
    // Validate file size and format before proceeding
    if (!await this.validateFileSize(audioFile)) {
      throw new Error('Audio file size exceeds 15MB limit');
    }
    if (!await this.validateAudioFormat(audioFile)) {
      throw new Error('Invalid audio format. Supported formats: MP3, WAV, OGG');
    }
    if (thumbnail && !await this.validateFileSize(thumbnail)) {
      throw new Error('Thumbnail file size exceeds 15MB limit');
    }

    const db = await this.db;
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(['tracks', 'audioFiles', 'thumbnails'], 'readwrite');
        
        const tracksStore = transaction.objectStore('tracks');
        const audioStore = transaction.objectStore('audioFiles');
        const thumbnailStore = transaction.objectStore('thumbnails');

        // Store the audio file with size information
        audioStore.put({
          id: track.id,
          file: audioFile,
          size: audioFile.size
        });

        // Store the thumbnail if provided
        if (thumbnail) {
          thumbnailStore.put({
            id: track.id,
            file: thumbnail,
            size: thumbnail.size
          });
        }

        // Store the track metadata with file sizes
        tracksStore.put({
          ...track,
          audioSize: audioFile.size,
          thumbnailSize: thumbnail?.size
        });

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(this.handleError(transaction.error));
      } catch (error) {
        reject(this.handleError(error));
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

  async updateTrackOrders(tracks: Track[]): Promise<void> {
    const db = await this.db;
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(['tracks'], 'readwrite');
        const store = transaction.objectStore('tracks');
        
        tracks.forEach(track => {
          store.put(track);
        });

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  async checkDuplicateTrack(title: string, artist: string): Promise<boolean> {
    const db = await this.db;
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(['tracks'], 'readonly');
        const store = transaction.objectStore('tracks');
        const request = store.getAll();

        request.onsuccess = () => {
          const tracks: Track[] = request.result;
          const isDuplicate = tracks.some(track => 
            track.title.toLowerCase() === title.toLowerCase() && 
            track.artist.toLowerCase() === artist.toLowerCase()
          );
          resolve(isDuplicate);
        };
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  }

  async updateTrack(track: Track): Promise<Track> {
    const db = await this.db;
    const tx = db.transaction(['tracks'], 'readwrite');
    const store = tx.objectStore('tracks');
    await store.put(track);
    return track;
  }

  async validateFileSize(file: File): Promise<boolean> {
    return file.size <= this.MAX_FILE_SIZE;
  }

  async validateAudioFormat(file: File): Promise<boolean> {
    // Check if the file type matches any of our valid types
    if (this.VALID_AUDIO_TYPES.includes(file.type)) {
      return true;
    }

    // Check file extension as fallback
    const fileName = file.name.toLowerCase();
    const validExtensions = ['.mp3', '.wav', '.ogg'];
    return validExtensions.some(ext => fileName.endsWith(ext));
  }

  async getThumbnail(trackId: string): Promise<File | null> {
    const db = await this.db;
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction('thumbnails', 'readonly');
        const store = transaction.objectStore('thumbnails');
        const request = store.get(trackId);

        request.onsuccess = () => resolve(request.result?.file || null);
        request.onerror = () => reject(this.handleError(request.error));
      } catch (error) {
        reject(this.handleError(error));
      }
    });
  }

  async getTrackWithFiles(trackId: string): Promise<{ 
    track: Track, 
    audioFile: File, 
    thumbnail: File | null 
  }> {
    const db = await this.db;
    
    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(['tracks', 'audioFiles', 'thumbnails'], 'readonly');
        
        const tracksStore = transaction.objectStore('tracks');
        const audioStore = transaction.objectStore('audioFiles');
        const thumbnailStore = transaction.objectStore('thumbnails');

        const trackRequest = tracksStore.get(trackId);
        const audioRequest = audioStore.get(trackId);
        const thumbnailRequest = thumbnailStore.get(trackId);

        transaction.oncomplete = () => {
          if (!trackRequest.result || !audioRequest.result) {
            reject(new Error('Track or audio file not found'));
            return;
          }

          resolve({
            track: trackRequest.result,
            audioFile: audioRequest.result.file,
            thumbnail: thumbnailRequest.result?.file || null
          });
        };
        
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
} 