import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { BehaviorSubject, fromEvent, map, Observable } from 'rxjs';
import { Track } from '../models/track.model';
import * as PlayerActions from '../store/player/player.actions';
import { IndexedDBService } from './indexed-db.service';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audio: HTMLAudioElement;
  private audioContext: AudioContext;
  private isLoadingTrack = false;
  duration$: Observable<number>;
  
  constructor(
    private store: Store,
    private indexedDBService: IndexedDBService
  ) {
    this.audio = new Audio();
    this.audioContext = new AudioContext();
    this.duration$ = fromEvent(this.audio, 'durationchange').pipe(
      map(() => this.audio.duration)
    );
    
    // Set up audio event listeners
    this.setupAudioEvents();
  }

  private setupAudioEvents() {
    // Time Update
    fromEvent(this.audio, 'timeupdate').subscribe(() => {
      this.store.dispatch(PlayerActions.setCurrentTime({ 
        time: this.audio.currentTime 
      }));
    });

    // Duration Change
    fromEvent(this.audio, 'durationchange').subscribe(() => {
      this.store.dispatch(PlayerActions.setDuration({ 
        duration: this.audio.duration 
      }));
    });

    // Track End
    fromEvent(this.audio, 'ended').subscribe(() => {
      this.store.dispatch(PlayerActions.stop());
      this.store.dispatch(PlayerActions.playNext());
    });

    // Error Handling
    fromEvent(this.audio, 'error').subscribe(() => {
      this.store.dispatch(PlayerActions.loadTrackFailure({ 
        error: 'Error loading audio file' 
      }));
    });
  }

  async loadTrack(track: Track) {
    try {
      this.isLoadingTrack = true;
      const audioFile = await this.indexedDBService.getAudioFile(track.id);
      const audioUrl = URL.createObjectURL(audioFile);
      
      // Wait for the previous audio to be properly stopped
      this.audio.pause();
      this.audio.currentTime = 0;
      
      this.audio.src = audioUrl;
      await this.audio.load();
      
      // Wait for the audio to be ready before dispatching success
      await new Promise(resolve => {
        this.audio.oncanplaythrough = resolve;
      });
      
      this.store.dispatch(PlayerActions.loadTrackSuccess({ audioUrl }));
      this.isLoadingTrack = false;
    } catch (error) {
      this.isLoadingTrack = false;
      this.store.dispatch(PlayerActions.loadTrackFailure({ 
        error: 'Failed to load audio file' 
      }));
    }
  }

  async play() {
    if (this.isLoadingTrack) {
      await new Promise(resolve => setTimeout(resolve, 100)); // Small delay
    }
    try {
      await this.audio.play();
      this.store.dispatch(PlayerActions.play());
    } catch (error) {
      console.error('Play failed:', error);
      this.store.dispatch(PlayerActions.loadTrackFailure({ 
        error: 'Failed to play track' 
      }));
    }
  }

  pause() {
    this.audio.pause();
    this.store.dispatch(PlayerActions.pause());
  }

  stop() {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.store.dispatch(PlayerActions.stop());
  }

  seek(time: number) {
    this.audio.currentTime = time;
    this.store.dispatch(PlayerActions.setCurrentTime({ time }));
  }

  setVolume(volume: number) {
    this.audio.volume = volume;
    this.store.dispatch(PlayerActions.setVolume({ volume }));
  }

  cleanup() {
    this.audio.pause();
    this.audio.src = '';
    if (this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }

  calculateDuration(file: File): Promise<number> {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration);
        URL.revokeObjectURL(audio.src);
      });
    });
  }
} 