import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { Track } from '../models/track.model';
import { IndexedDBService } from './indexed-db.service';
import * as PlayerActions from '../store/player/player.actions';
import * as PlayerSelectors from '../store/player/player.selectors';
import { combineLatest } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audio = new Audio();
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  private audioSource: MediaElementAudioSourceNode | null = null;
  
  duration$ = new BehaviorSubject<number>(0);
  currentTime$ = new BehaviorSubject<number>(0);
  private queue: Track[] = [];
  private queueSubject = new BehaviorSubject<Track[]>([]);
  queue$ = this.queueSubject.asObservable();

  get audioElement(): HTMLAudioElement {
    return this.audio;
  }

  constructor(
    private store: Store,
    private indexedDB: IndexedDBService
  ) {
    this.setupEventListeners();
    this.subscribeToStoreChanges();
    
    // Load persisted state on startup
    this.store.dispatch(PlayerActions.loadPersistedState());
  }

  private initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      this.audioSource = this.audioContext.createMediaElementSource(this.audio);
      this.gainNode = this.audioContext.createGain();
      this.audioSource.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);
    }
    return this.audioContext.state === 'suspended' ? this.audioContext.resume() : Promise.resolve();
  }

  private setupEventListeners() {
    this.audio.addEventListener('loadedmetadata', () => {
      this.duration$.next(this.audio.duration);
    });

    this.audio.addEventListener('timeupdate', () => {
      this.currentTime$.next(this.audio.currentTime);
      this.store.dispatch(PlayerActions.setCurrentTime({ time: this.audio.currentTime }));
    });

    this.audio.addEventListener('ended', () => {
      this.store.dispatch(PlayerActions.stop());
      this.playNext();
    });

    this.audio.addEventListener('play', () => {
      this.store.dispatch(PlayerActions.play());
    });

    this.audio.addEventListener('pause', () => {
      this.store.dispatch(PlayerActions.pause());
    });

    this.audio.addEventListener('error', (e) => {
      if (this.audio.src) {
        const error = e.target as HTMLAudioElement;
        this.store.dispatch(PlayerActions.setError({ 
          message: `Playback error: ${error.error?.message || 'Unknown error'}`
        }));
      }
    });
  }

  private subscribeToStoreChanges() {
    this.store.select(PlayerSelectors.selectVolume).subscribe(volume => {
      if (this.gainNode) {
        this.gainNode.gain.value = volume;
      }
    });

    // Update persistence subscription
    combineLatest([
      this.store.select(PlayerSelectors.selectCurrentTrack),
      this.store.select(PlayerSelectors.selectCurrentTime),
      this.store.select(PlayerSelectors.selectVolume),
      this.store.select(PlayerSelectors.selectIsPlaying)
    ]).subscribe(([track, currentTime, volume, isPlaying]) => {
      if (track) {
        localStorage.setItem('playerState', JSON.stringify({
          track,
          currentTime,
          volume,
          isPlaying,
          timestamp: Date.now()
        }));
      }
    });
  }

  async calculateDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(file);
      this.audio.src = url;
      this.audio.addEventListener('loadedmetadata', () => {
        const duration = this.audio.duration;
        URL.revokeObjectURL(url);
        resolve(duration);
      });
    });
  }

  async playTrack(track: Track) {
    try {
      await this.initAudioContext();
      const audioFile = await this.indexedDB.getAudioFile(track.id);
      
      if (!audioFile) {
        throw new Error('Audio file not found');
      }

      if (this.audio.src) {
        URL.revokeObjectURL(this.audio.src);
      }

      const audioUrl = URL.createObjectURL(audioFile);
      this.audio.src = audioUrl;
      
      await this.audio.play();
      this.store.dispatch(PlayerActions.play());
    } catch (error: any) {
      this.store.dispatch(PlayerActions.setError({ 
        message: `Playback error: ${error.message}` 
      }));
      this.cleanup();
    }
  }

  async play() {
    try {
      await this.initAudioContext();
      if (this.audio.src) {
        await this.audio.play();
        this.store.dispatch(PlayerActions.play());
      } else {
        const subscription = this.store.select(PlayerSelectors.selectCurrentTrack)
          .pipe(take(1))
          .subscribe(async track => {
            if (track) {
              await this.playTrack(track);
            }
            subscription.unsubscribe();
          });
      }
    } catch (error: any) {
      console.error('Play error:', error);
      this.store.dispatch(PlayerActions.setError({ 
        message: `Failed to play: ${error.message}` 
      }));
    }
  }

  pause() {
    this.audio.pause();
  }

  seek(time: number) {
    if (this.audio.readyState > 0) {
      this.audio.currentTime = time;
    }
  }

  setVolume(volume: number) {
    this.store.dispatch(PlayerActions.setVolume({ volume }));
  }

  async playNext() {
    if (this.queue.length > 0) {
      const nextTrack = this.queue.shift();
      this.queueSubject.next(this.queue);
      if (nextTrack) {
        await this.playTrack(nextTrack);
      }
    } else {
      const subscription = this.store.select(PlayerSelectors.selectCurrentTrack)
        .pipe(take(1), filter(track => track !== null))
        .subscribe(async currentTrack => {
          const tracks = await this.indexedDB.getAllTracks();
          const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
          const nextTrack = tracks[(currentIndex + 1) % tracks.length];
          if (nextTrack) {
            await this.playTrack(nextTrack);
          }
          subscription.unsubscribe();
        });
    }
  }

  async playPrevious() {
    const subscription = this.store.select(PlayerSelectors.selectCurrentTrack)
      .pipe(take(1), filter(track => track !== null))
      .subscribe(async currentTrack => {
        const tracks = await this.indexedDB.getAllTracks();
        const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : tracks.length - 1;
        const prevTrack = tracks[prevIndex];
        if (prevTrack) {
          await this.playTrack(prevTrack);
        }
        subscription.unsubscribe();
      });
  }

  cleanup() {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
      this.audio.src = '';
      this.audio.load();
    }
  }

  addToQueue(track: Track) {
    this.queue.push(track);
    this.queueSubject.next(this.queue);
  }

  removeFromQueue(index: number) {
    this.queue.splice(index, 1);
    this.queueSubject.next(this.queue);
  }

  clearQueue() {
    this.queue = [];
    this.queueSubject.next(this.queue);
  }
} 