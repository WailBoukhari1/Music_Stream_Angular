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
      const error = e.target as HTMLAudioElement;
      this.store.dispatch(PlayerActions.setError({ 
        message: `Playback error: ${error.error?.message || 'Unknown error'}`
      }));
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

  async playTrack(track: Track) {
    try {
      await this.initAudioContext();
      const audioFile = await this.indexedDB.getAudioFile(track.id);
      const audioUrl = URL.createObjectURL(audioFile);

      if (this.audio.src) {
        URL.revokeObjectURL(this.audio.src);
      }

      this.audio.src = audioUrl;
      this.store.dispatch(PlayerActions.setTrack({ track }));
      await this.audio.play();
    } catch (error: any) {
      this.store.dispatch(PlayerActions.setError({ 
        message: `Failed to load track: ${error.message || 'Unknown error'}`
      }));
    }
  }

  async play() {
    try {
      await this.initAudioContext();
      await this.audio.play();
    } catch (error: any) {
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
    this.store.select(PlayerSelectors.selectCurrentTrack)
      .pipe(take(1), filter(track => track !== null))
      .subscribe(async currentTrack => {
        const tracks = await this.indexedDB.getAllTracks();
        const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
        const nextTrack = tracks[(currentIndex + 1) % tracks.length];
        if (nextTrack) {
          await this.playTrack(nextTrack);
        }
      });
  }

  async playPrevious() {
    this.store.select(PlayerSelectors.selectCurrentTrack)
      .pipe(take(1), filter(track => track !== null))
      .subscribe(async currentTrack => {
        const tracks = await this.indexedDB.getAllTracks();
        const currentIndex = tracks.findIndex(t => t.id === currentTrack?.id);
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : tracks.length - 1;
        const prevTrack = tracks[prevIndex];
        if (prevTrack) {
          await this.playTrack(prevTrack);
        }
      });
  }

  cleanup() {
    if (this.audio.src) {
      URL.revokeObjectURL(this.audio.src);
    }
    this.audio.pause();
    this.audio.src = '';
    if (this.audioContext) {
      this.audioContext.close();
    }
  }
} 