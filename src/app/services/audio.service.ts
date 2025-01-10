import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { Track } from '../models/track.model';
import { IndexedDBService } from './indexed-db.service';
import { switchMap, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private audio = new Audio();
  private audioContext: AudioContext | null = null;
  private gainNode: GainNode | null = null;
  
  duration$ = new BehaviorSubject<number>(0);
  currentTime$ = new BehaviorSubject<number>(0);
  volume$ = new BehaviorSubject<number>(1);

  constructor(private indexedDB: IndexedDBService) {
    this.setupEventListeners();
    this.initAudioContext();
  }

  private setupEventListeners() {
    this.audio.addEventListener('loadedmetadata', () => {
      this.duration$.next(this.audio.duration);
    });

    this.audio.addEventListener('timeupdate', () => {
      this.currentTime$.next(this.audio.currentTime);
    });

    this.audio.addEventListener('volumechange', () => {
      this.volume$.next(this.audio.volume);
    });
  }

  private async initAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new AudioContext();
      this.gainNode = this.audioContext.createGain();
      const source = this.audioContext.createMediaElementSource(this.audio);
      source.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);
      
      if (this.gainNode) {
        this.gainNode.gain.value = 1;
      }
    }
  }

  playTrack(track: Track): Observable<void> {
    return from(this.indexedDB.getAudioFile(track.id)).pipe(
      switchMap(audioFile => {
        if (!audioFile) {
          throw new Error('Audio file not found');
        }
        if (this.audio.src) {
          URL.revokeObjectURL(this.audio.src);
        }
        this.audio.src = URL.createObjectURL(audioFile);
        return from(this.audio.play());
      })
    );
  }

  play(): Observable<void> {
    return from(this.audio.play());
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
    const normalizedVolume = Math.max(0, Math.min(1, volume));
    if (this.gainNode) {
      this.gainNode.gain.value = normalizedVolume;
      this.volume$.next(normalizedVolume);
    }
    this.audio.volume = normalizedVolume;
  }

  calculateDuration(file: File): Observable<number> {
    return new Observable(observer => {
      const url = URL.createObjectURL(file);
      const audio = new Audio(url);
      audio.addEventListener('loadedmetadata', () => {
        const duration = audio.duration;
        URL.revokeObjectURL(url);
        observer.next(duration);
        observer.complete();
      });
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

  get audioElement(): HTMLAudioElement {
    return this.audio;
  }
} 