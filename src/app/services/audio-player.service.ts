import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AudioPlayerService {
  private audio = new Audio();
  private currentTrackSubject = new BehaviorSubject<string | null>(null);
  private isPlayingSubject = new BehaviorSubject<boolean>(false);
  private progressSubject = new BehaviorSubject<number>(0);

  currentTrack$ = this.currentTrackSubject.asObservable();
  isPlaying$ = this.isPlayingSubject.asObservable();
  progress$ = this.progressSubject.asObservable();

  constructor() {
    this.audio.addEventListener('timeupdate', () => {
      this.progressSubject.next((this.audio.currentTime / this.audio.duration) * 100);
    });

    this.audio.addEventListener('ended', () => {
      this.isPlayingSubject.next(false);
    });
  }

  play(audioUrl: string) {
    if (this.currentTrackSubject.value !== audioUrl) {
      this.audio.src = audioUrl;
      this.currentTrackSubject.next(audioUrl);
    }
    this.audio.play();
    this.isPlayingSubject.next(true);
  }

  pause() {
    this.audio.pause();
    this.isPlayingSubject.next(false);
  }

  setVolume(volume: number) {
    this.audio.volume = volume;
  }

  seek(time: number) {
    this.audio.currentTime = time;
  }
} 