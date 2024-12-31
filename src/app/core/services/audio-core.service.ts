import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AudioCoreService {
  private audio: HTMLAudioElement;
  
  constructor() {
    this.audio = new Audio();
  }

  loadAudio(url: string): void {
    this.audio.src = url;
  }

  play(): void {
    this.audio.play();
  }

  pause(): void {
    this.audio.pause();
  }

  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
  }
}
